// ═══════════════════════════════════════════════════════════════════════════════
// WW-B — Game Data Checks
// Fetches web sources, compares with app data, reports discrepancies.
// Never applies changes — only returns findings.
// ═══════════════════════════════════════════════════════════════════════════════

import { askJSON } from './ai.js';
import { GAME } from './config.js';
import { log } from './log.js';

const SYSTEM = `You are WW-B, a Wuthering Waves data auditor. Compare web source data against the app's current data and report differences as JSON. Be conservative — only report changes you're confident about. Return ONLY valid JSON.`;

// ─── Banners ────────────────────────────────────────────────────────────────

export async function checkBanners(sources, currentBanners) {
  log.info('Checking banners...');

  const prompt = `Compare the app's current Wuthering Waves banner data against these web sources.

CURRENT APP DATA:
- Version: ${currentBanners.version}, Phase: ${currentBanners.phase}
- End date: ${currentBanners.endDate}
- Characters: ${currentBanners.characters.map(c => c.name).join(', ')}
- Weapons: ${currentBanners.weapons.map(w => w.name).join(', ')}

WEB SOURCES:
${sources.map((s, i) => `--- SOURCE ${i + 1} (${s.url}) ---\n${s.content}`).join('\n\n')}

If banners match, return: {"changed": false}
If different, return:
{
  "changed": true,
  "confidence": 0.0-1.0,
  "banner": {
    "version": "string", "phase": 1 or 2,
    "startDate": "ISO UTC", "endDate": "ISO UTC",
    "characters": [{"name": "string", "element": "string", "isNew": true/false}],
    "weapons": [{"name": "string", "type": "string", "isNew": true/false}]
  }
}
All dates in UTC.`;

  return await askJSON(SYSTEM, prompt);
}

// ─── Events ─────────────────────────────────────────────────────────────────

export async function checkEvents(sources, currentEvents) {
  log.info('Checking events...');

  const summary = Object.entries(currentEvents)
    .map(([key, ev]) => `  ${key}: "${ev.name}" ends ${ev.currentEnd || 'N/A'} (${ev.resetType})`)
    .join('\n');

  const prompt = `Compare current Wuthering Waves events against the app's data.

CURRENT APP EVENTS:
${summary}

WEB SOURCES:
${sources.map((s, i) => `--- SOURCE ${i + 1} (${s.url}) ---\n${s.content}`).join('\n\n')}

Return JSON:
{
  "updates": [{"eventKey": "string", "oldValue": "ISO date", "newValue": "ISO UTC date", "reason": "string", "confidence": 0.0-1.0}],
  "newEvents": [{"key": "camelCase", "name": "string", "subtitle": "string", "resetType": "string", "color": "string", "rewards": "string", "confidence": 0.0-1.0}]
}
Empty arrays if no updates needed. All dates UTC.`;

  return await askJSON(SYSTEM, prompt);
}

// ─── Characters ─────────────────────────────────────────────────────────────

export async function checkCharacters(sources, existingNames) {
  log.info('Checking characters...');

  const prompt = `Find any playable Wuthering Waves Resonators currently in-game but MISSING from this list.

CURRENT APP CHARACTERS (${existingNames.length}):
${existingNames.join(', ')}

WEB SOURCES:
${sources.map((s, i) => `--- SOURCE ${i + 1} (${s.url}) ---\n${s.content}`).join('\n\n')}

Only include characters actually playable now — no leaks or upcoming.
Return JSON:
{
  "newCharacters": [{"name": "string", "rarity": 4|5, "element": "${GAME.ELEMENTS.join('|')}", "weapon": "${GAME.WEAPON_TYPES.join('|')}", "role": "${GAME.ROLES.join('|')}", "confidence": 0.0-1.0}]
}
Empty array if none missing.`;

  return await askJSON(SYSTEM, prompt);
}

// ─── Weapons ────────────────────────────────────────────────────────────────

export async function checkWeapons(sources, existingNames) {
  log.info('Checking weapons...');

  const prompt = `Find any 5-star Wuthering Waves weapons currently in-game but MISSING from this list.

CURRENT APP 5★ WEAPONS (${existingNames.length}):
${existingNames.join(', ')}

WEB SOURCES:
${sources.map((s, i) => `--- SOURCE ${i + 1} (${s.url}) ---\n${s.content}`).join('\n\n')}

Only include released weapons — no leaks.
Return JSON:
{
  "newWeapons": [{"name": "string", "rarity": 5, "type": "${GAME.WEAPON_TYPES.join('|')}", "confidence": 0.0-1.0}]
}
Empty array if none missing.`;

  return await askJSON(SYSTEM, prompt);
}
