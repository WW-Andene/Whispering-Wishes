// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — AI Intelligence Layer
// Uses Groq API (OpenAI-compatible) to analyze web content, extract game data,
// and generate precise code updates for appcore-data.js
// ═══════════════════════════════════════════════════════════════════════════════

import Groq from 'groq-sdk';
import { AI, GAME, SCHEMAS } from './config.js';
import { log } from './log.js';

let client = null;
let lastCallTime = 0;

function getClient() {
  if (!client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Call Groq with rate limiting and retries.
 * Returns the text response.
 */
async function askClaude(systemPrompt, userPrompt, { maxTokens = AI.maxTokens, retries = AI.maxRetries } = {}) {
  const api = getClient();

  // Rate limiting (Groq free tier: 30 req/min)
  const elapsed = Date.now() - lastCallTime;
  if (elapsed < AI.rateLimitMs) {
    await sleep(AI.rateLimitMs - elapsed);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      lastCallTime = Date.now();
      const response = await api.chat.completions.create({
        model: AI.model,
        max_tokens: maxTokens,
        temperature: 0.1, // Low temperature for consistent structured output
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const text = response.choices?.[0]?.message?.content || '';

      if (!text || !text.trim()) {
        throw new Error('Groq returned empty text response');
      }

      return text;

    } catch (err) {
      if (attempt === retries) {
        const safeMessage = (err.message || 'Unknown error').slice(0, 200);
        log.error(`Groq API failed after ${retries + 1} attempts: ${safeMessage}`);
        const sanitized = new Error(`Groq API failed after ${retries + 1} attempts: ${safeMessage}`);
        sanitized.code = err.code || 'API_FAILURE';
        sanitized.status = err.status;
        throw sanitized;
      }
      log.warn(`Groq API attempt ${attempt + 1} failed: ${err.message}`);
      // Longer backoff for rate limit errors
      const backoff = err.status === 429 ? 10000 * (attempt + 1) : 3000 * (attempt + 1);
      await sleep(backoff);
    }
  }

  throw new Error('Groq API: exhausted all retries without response');
}

/**
 * Ask for JSON specifically — retries on parse failure with a reminder prompt.
 * More reliable than single-shot for Llama models.
 */
async function askForJSON(systemPrompt, userPrompt, { maxTokens = AI.maxTokens, jsonRetries = 2 } = {}) {
  for (let attempt = 0; attempt <= jsonRetries; attempt++) {
    const prompt = attempt === 0
      ? userPrompt
      : `${userPrompt}\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY a valid JSON object/array. No text before or after. No markdown. Just JSON.`;

    const response = await askClaude(systemPrompt, prompt, { maxTokens });
    try {
      return extractJSON(response);
    } catch (err) {
      if (attempt === jsonRetries) throw err;
      log.warn(`JSON parse failed (attempt ${attempt + 1}), retrying...`);
    }
  }
}

/**
 * Extract JSON from AI response (handles markdown code fences)
 */
function extractJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('extractJSON: input must be a non-empty string');
  }
  if (text.length > 512 * 1024) {
    throw new Error('extractJSON: input exceeds 512 KB size limit');
  }

  const trimmed = text.trim();

  // Try direct parse first (only when it looks like raw JSON)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try { return JSON.parse(trimmed); } catch {}
  }

  // Try extracting from code fence
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch {}
  }

  // Try finding first { or [ and match to correct closing delimiter
  const jsonStart = text.search(/[\[{]/);
  if (jsonStart >= 0) {
    const opener = text[jsonStart];
    const closer = opener === '{' ? '}' : ']';
    const jsonEnd = text.lastIndexOf(closer);
    if (jsonEnd > jsonStart) {
      try { return JSON.parse(text.slice(jsonStart, jsonEnd + 1)); } catch {}
    }
  }

  throw new Error('Could not extract valid JSON from AI response');
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASK-SPECIFIC AI FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const SYSTEM_BASE = `You are WW-B, a Wuthering Waves game data extraction agent. You read web content and return ONLY valid JSON. Never include explanation or markdown — just the JSON object.

RULES:
1. Output ONLY valid JSON. No text before or after.
2. Use exact terminology: "Resonators", "Convene", "Astrite"
3. Elements: Fusion, Electro, Aero, Glacio, Havoc, Spectro
4. Weapons: Sword, Broadblade, Pistols, Gauntlets, Rectifier
5. Roles: Main DPS, Sub DPS, Support, Healer
6. Dates: ISO 8601 UTC format
7. Set "confidence": 0.0-1.0 when uncertain
8. Use null for unknown data — never guess
9. Be conservative: only report changes you are highly confident about`;

/**
 * Analyze current banner status from multiple web sources.
 * Returns structured banner data or null if no update needed.
 */
export async function analyzeBanners(sourceContents, currentBannerData) {
  log.info('Analyzing banner data with Groq...');

  const prompt = `I need you to extract the CURRENT active Wuthering Waves banner information from these web sources.

CURRENT APP DATA (for comparison — detect what changed):
- Version: ${currentBannerData.version}, Phase: ${currentBannerData.phase}
- Current banner end date: ${currentBannerData.endDate}
- Featured characters: ${currentBannerData.characters.map(c => c.name).join(', ')}
- Featured weapons: ${currentBannerData.weapons.map(w => w.name).join(', ')}

WEB SOURCE CONTENT:
${sourceContents.map((s, i) => `\n--- SOURCE ${i + 1} (${s.url}) ---\n${s.content}`).join('\n')}

TASK: Extract the current active banner data. If the banner has NOT changed from the current app data, return:
{"changed": false}

If the banner HAS changed (new phase, new characters, new dates), return:
{
  "changed": true,
  "confidence": 0.0-1.0,
  "banner": {
    "version": "string (e.g. 3.2)",
    "phase": 1 or 2,
    "startDate": "ISO UTC string",
    "endDate": "ISO UTC string",
    "characters": [
      {
        "id": "kebab-case-id",
        "name": "Exact Name",
        "title": "Banner subtitle / epithet",
        "element": "one of: Fusion, Electro, Aero, Glacio, Havoc, Spectro",
        "weaponType": "one of: Sword, Broadblade, Pistols, Gauntlets, Rectifier",
        "isNew": true/false (true if this is the character's FIRST banner ever),
        "featured4Stars": ["Name1", "Name2", "Name3"]
      }
    ],
    "weapons": [
      {
        "id": "kebab-case-id",
        "name": "Exact Weapon Name",
        "title": "Banner subtitle",
        "type": "weapon type",
        "forCharacter": "signature character name",
        "element": "character's element",
        "isNew": true/false,
        "featured4Stars": ["Weapon1", "Weapon2", "Weapon3"]
      }
    ]
  }
}

Convert all dates to UTC. European CET = UTC+1 (winter), CEST = UTC+2 (summer, after last Sunday of March).
Return ONLY the JSON object.`;

  return await askForJSON(SYSTEM_BASE, prompt);
}

/**
 * Analyze event timers and detect which events need date updates.
 */
export async function analyzeEvents(sourceContents, currentEvents) {
  log.info('Analyzing event data with Groq...');

  const eventSummary = Object.entries(currentEvents).map(([key, ev]) =>
    `  ${key}: "${ev.name}" — ends ${ev.currentEnd || 'N/A'} — reset: ${ev.resetType}`
  ).join('\n');

  const prompt = `Extract current Wuthering Waves event information and compare with the app's current data.

CURRENT APP EVENTS:
${eventSummary}

WEB SOURCE CONTENT:
${sourceContents.map((s, i) => `\n--- SOURCE ${i + 1} (${s.url}) ---\n${s.content}`).join('\n')}

TASK: For each event, determine if the end date needs updating. Return JSON:
{
  "updates": [
    {
      "eventKey": "key from current events (e.g. tacticalHologram, doubledPawns, whimperingWastes, towerOfAdversity)",
      "field": "currentEnd",
      "oldValue": "current ISO date",
      "newValue": "new ISO date in UTC",
      "reason": "brief explanation",
      "confidence": 0.0-1.0
    }
  ],
  "newEvents": [
    {
      "key": "camelCase event key",
      "name": "Event Name",
      "subtitle": "Sub text",
      "description": "Brief description",
      "resetType": "e.g. Version update, 28 days, Weekly (Monday)",
      "color": "cyan/pink/orange/purple/yellow",
      "currentEnd": "ISO UTC date or null",
      "rewards": "e.g. 800 Astrite",
      "confidence": 0.0-1.0
    }
  ]
}

If no updates are needed, return {"updates": [], "newEvents": []}
Convert all dates to UTC. Return ONLY the JSON object.`;

  return await askForJSON(SYSTEM_BASE, prompt);
}

/**
 * Analyze if new characters have been released that aren't in the app.
 */
export async function analyzeNewCharacters(sourceContents, existingCharNames) {
  log.info('Analyzing character data with Groq...');

  const prompt = `Check if there are any NEW Wuthering Waves Resonators (characters) that are NOT in the app's current list.

CURRENT APP CHARACTERS (${existingCharNames.length} total):
${existingCharNames.join(', ')}

WEB SOURCE CONTENT:
${sourceContents.map((s, i) => `\n--- SOURCE ${i + 1} (${s.url}) ---\n${s.content}`).join('\n')}

TASK: Identify any playable Resonators that are currently available in-game but MISSING from the app's list.
Do NOT include upcoming/leaked/unreleased characters — only those that are actually playable right now.

Return JSON:
{
  "newCharacters": [
    {
      "name": "Exact Name",
      "rarity": 4 or 5,
      "element": "one of: ${GAME.ELEMENTS.join(', ')}",
      "weapon": "one of: ${GAME.WEAPON_TYPES.join(', ')}",
      "role": "one of: ${GAME.ROLES.join(', ')}",
      "desc": "1-2 sentence description of the character",
      "skills": ["Skill1", "Skill2", "Skill3", "Skill4"],
      "ascension": {"boss": "Boss Drop Name", "common": "Common Material Family", "specialty": "Overworld Specialty"},
      "skillMaterials": {"weeklyDrop": "Weekly Boss Material", "forgery": "Forgery Material Family"},
      "bestEchoes": ["Main Echo Name", "Echo Set Name"],
      "bestWeapon": "Best Weapon Name",
      "teams": ["Member1 + Member2 + Member3", "Alt Team"],
      "signatureWeapon": "Signature Weapon Name (if 5-star)",
      "confidence": 0.0-1.0
    }
  ]
}

If no new characters are found, return {"newCharacters": []}
Return ONLY the JSON object.`;

  return await askForJSON(SYSTEM_BASE, prompt);
}

/**
 * Analyze if new weapons have been released.
 */
export async function analyzeNewWeapons(sourceContents, existingWeaponNames) {
  log.info('Analyzing weapon data with Groq...');

  const prompt = `Check if there are any NEW Wuthering Waves 5-star weapons that are NOT in the app's current list.

CURRENT APP 5★ WEAPONS (${existingWeaponNames.length} total):
${existingWeaponNames.join(', ')}

WEB SOURCE CONTENT:
${sourceContents.map((s, i) => `\n--- SOURCE ${i + 1} (${s.url}) ---\n${s.content}`).join('\n')}

TASK: Identify any 5-star weapons currently in the game that are MISSING from the app's list.
Only include weapons that have already been released on at least one banner.

Return JSON:
{
  "newWeapons": [
    {
      "name": "Exact Weapon Name",
      "rarity": 5,
      "type": "one of: ${GAME.WEAPON_TYPES.join(', ')}",
      "stat": "Main stat (e.g. Crit Rate, Crit DMG, ATK%, HP%, Energy Regen)",
      "baseAtk": number,
      "subStatValue": "+XX.X%",
      "desc": "1-2 sentence description",
      "passive": "Passive effect description",
      "bestFor": ["Character Name"],
      "ascensionMaterials": {"forgery": "Forgery Family", "common": "Common Family"},
      "isSignature": true/false,
      "signatureFor": "Character name or null",
      "confidence": 0.0-1.0
    }
  ]
}

If no new weapons found, return {"newWeapons": []}
Return ONLY the JSON object.`;

  return await askForJSON(SYSTEM_BASE, prompt);
}

/**
 * Generate a complete BANNER_HISTORY entry for a new banner.
 */
export async function generateBannerHistoryEntry(bannerData) {
  log.info('Generating banner history entry...');

  const prompt = `Generate a JavaScript object literal for a BANNER_HISTORY array entry.

BANNER DATA:
${JSON.stringify(bannerData, null, 2)}

FORMAT (match exactly):
{ version: 'X.Y', phase: N, characters: ['Name1', 'Name2'], weapons: ['Weapon1', 'Weapon2'], startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }

Use date-only strings (no time component) for startDate and endDate.
Return ONLY the JavaScript object literal as a string. No variable assignment, no semicolon.`;

  return await askClaude(SYSTEM_BASE, prompt, { maxTokens: 512 });
}

/**
 * Generate updated combat data array entries for new characters.
 */
export async function generateCombatData(characters, sourceContents) {
  log.info('Generating combat data for new characters...');

  const prompt = `Generate combat data array entries for these new Wuthering Waves characters.

CHARACTERS TO ADD:
${JSON.stringify(characters, null, 2)}

WEB SOURCES FOR BUILD REFERENCE:
${sourceContents.map((s, i) => `\n--- SOURCE ${i + 1} (${s.url}) ---\n${s.content.slice(0, 15000)}`).join('\n')}

FORMAT — each entry is: ['Name', ['dmgFocus1', ...], ['buff1', ...], ['debuff1', ...]]

dmgFocus values: Normal ATK, Heavy ATK, Res. Skill, Liberation, Echo Skill, Coordinated ATK
buff values: ATK Buff, DMG Buff, DMG Deepen, Heal, Shield, Crit Buff, Crit DMG Amp, Basic ATK Amp, Fusion DMG Amp, etc.
debuff values: DEF Shred, Frazzle, Erosion, Off-Tune, Fusion RES Shred, etc.

Return a JSON array of arrays:
[
  ["CharName", ["dmg focus types"], ["buff types"], ["debuff types"]]
]

Return ONLY the JSON array.`;

  return await askForJSON(SYSTEM_BASE, prompt, { maxTokens: 2048 });
}

export { askClaude, askForJSON, extractJSON };
