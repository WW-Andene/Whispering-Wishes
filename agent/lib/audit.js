// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Self-Audit & Improvement Engine
//
// Uses Claude to analyze the app's codebase and propose/apply improvements:
// - Code quality fixes (bugs, dead code, performance)
// - UI/UX improvements (polish, consistency, responsiveness)
// - Feature additions (new tools, better flows)
// - Data enrichment (descriptions, team builds, echo recommendations)
// - Image management (missing images, broken URLs, format upgrades)
//
// The agent reads the actual source files, sends them to Claude with context
// about the app's design language and conventions, and receives precise
// string-replacement patches to apply.
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync } from 'fs';
import { PATHS } from './config.js';
import { log, addChange } from './log.js';
import { buildSkillsContext } from './skills.js';
import { getRecentActivitySummary } from './memory.js';
import { PROTECTION_RULES } from './protected.js';

/**
 * Run a self-audit cycle. Claude reads the source code, identifies
 * improvements, and returns precise patches.
 *
 * @param {Function} askClaudeFn - The AI query function
 * @param {string} mode - 'full' (deep audit) or 'micro' (quick fixes)
 * @param {Object} currentState - Current app state from reader.js
 * @returns {Object[]} Array of patch objects to apply
 */
export async function runSelfAudit(askClaudeFn, mode, currentState, memory = null) {
  log.info(`Running self-audit (${mode} mode)...`);

  // Load skills context for the audit
  const skillsContext = buildSkillsContext(mode);
  const recentActivity = memory ? getRecentActivitySummary(memory) : 'No memory available.';

  // Read the relevant source files
  const sources = {};
  try {
    sources.data = readFileSync(PATHS.dataFile, 'utf-8');
    sources.engine = readFileSync(PATHS.engineFile, 'utf-8');
    sources.components = readFileSync(PATHS.componentsFile, 'utf-8');
    sources.providers = readFileSync(PATHS.providersFile, 'utf-8');

    // For full audits, also read App.jsx (large file — send summary)
    if (mode === 'full') {
      const appFull = readFileSync(PATHS.appFile, 'utf-8');
      // Send first 8K + last 4K + key sections
      sources.appSummary = appFull.slice(0, 8000) + '\n\n[...MIDDLE TRUNCATED...]\n\n' + appFull.slice(-4000);
    }
  } catch (err) {
    log.error(`Could not read source files: ${err.message}`);
    return [];
  }

  const systemPrompt = buildAuditSystemPrompt(mode, skillsContext);
  const userPrompt = buildAuditUserPrompt(mode, sources, currentState, recentActivity);

  try {
    const response = await askClaudeFn(systemPrompt, userPrompt, { maxTokens: 8192 });
    const patches = parseAuditResponse(response);

    log.info(`Self-audit found ${patches.length} improvement(s)`);
    for (const p of patches) {
      log.dim(`  [${p.category}] ${p.description} (confidence: ${(p.confidence * 100).toFixed(0)}%)`);
    }

    return patches;
  } catch (err) {
    log.error(`Self-audit failed: ${err.message}`);
    return [];
  }
}

/**
 * Apply a set of patches from the self-audit.
 * Each patch specifies: file, oldStr, newStr, description, confidence.
 */
export function applyPatches(patches, minConfidence = 0.85) {
  const applied = [];
  const skipped = [];

  for (const patch of patches) {
    if (patch.confidence < minConfidence) {
      log.warn(`Skipping low-confidence patch: ${patch.description} (${(patch.confidence * 100).toFixed(0)}%)`);
      skipped.push(patch);
      continue;
    }

    const filePath = resolveFilePath(patch.file);
    if (!filePath) {
      log.warn(`Unknown file target: ${patch.file}`);
      skipped.push(patch);
      continue;
    }

    try {
      let content = readFileSync(filePath, 'utf-8');

      if (!content.includes(patch.oldStr)) {
        log.warn(`Patch target not found in ${patch.file}: ${patch.description}`);
        skipped.push(patch);
        continue;
      }

      // Verify uniqueness
      const count = content.split(patch.oldStr).length - 1;
      if (count > 1) {
        log.warn(`Patch target appears ${count} times in ${patch.file} — skipping: ${patch.description}`);
        skipped.push(patch);
        continue;
      }

      content = content.replace(patch.oldStr, patch.newStr);
      writeFileSync(filePath, content);

      log.ok(`Applied patch: [${patch.category}] ${patch.description}`);
      addChange(patch.category, patch.description, patch.confidence >= 0.95 ? 'HIGH' : 'MEDIUM');
      applied.push(patch);
    } catch (err) {
      log.error(`Failed to apply patch "${patch.description}": ${err.message}`);
      skipped.push(patch);
    }
  }

  log.info(`Patches: ${applied.length} applied, ${skipped.length} skipped`);
  return { applied, skipped };
}

/**
 * Run data enrichment — improve descriptions, team builds, echo recommendations.
 */
export async function enrichData(askClaudeFn, currentState, buildSources) {
  log.info('Running data enrichment audit...');

  // Find characters with placeholder or thin data
  const thinEntries = [];
  for (const name of currentState.characterNames) {
    // Check for 'TBD' placeholders in the source
    const pattern = new RegExp(`'${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}':\\s*\\{([^}]+)\\}`, 's');
    const match = currentState.source.match(pattern);
    if (match && (match[1].includes("'TBD'") || match[1].includes('TBD'))) {
      thinEntries.push(name);
    }
  }

  if (thinEntries.length === 0) {
    log.ok('No placeholder data found — all entries look complete');
    return [];
  }

  log.info(`Found ${thinEntries.length} entries with TBD/placeholder data: ${thinEntries.join(', ')}`);

  const prompt = `The following Wuthering Waves characters have incomplete data (TBD placeholders) in the app.
Using the web sources below, fill in the missing data for each character.

CHARACTERS WITH INCOMPLETE DATA: ${thinEntries.join(', ')}

WEB SOURCES:
${buildSources.map((s, i) => `--- SOURCE ${i + 1} (${s.url}) ---\n${s.content.slice(0, 15000)}`).join('\n\n')}

For each character, return the fields that need updating. Return JSON:
{
  "updates": [
    {
      "name": "Character Name",
      "field": "bestWeapon" | "bestEchoes" | "teams" | "desc" | "skills" | "ascension" | "skillMaterials",
      "oldValue": "TBD",
      "newValue": "the correct value",
      "confidence": 0.0-1.0
    }
  ]
}

Return ONLY the JSON object.`;

  try {
    const response = await askClaudeFn(
      'You are a Wuthering Waves game data specialist. Fill in missing character data from web sources. Return only valid JSON.',
      prompt,
      { maxTokens: 4096 }
    );
    const parsed = JSON.parse(response.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    return parsed.updates || [];
  } catch (err) {
    log.warn(`Data enrichment failed: ${err.message}`);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT BUILDERS
// ═══════════════════════════════════════════════════════════════════════════════

function buildAuditSystemPrompt(mode, skillsContext = '') {
  return `You are the Whispering Wishes autonomous maintenance agent. Your job is to analyze the app's source code and generate precise, safe improvements.

THE APP: Whispering Wishes — a Wuthering Waves gacha companion (React SPA, Tailwind CSS, single-file architecture).

${skillsContext ? `═══ LOADED SKILL FRAMEWORKS ═══\n${skillsContext}\n\n` : ''}DESIGN LANGUAGE (non-negotiable — PROTECT these):
- Gold (#edaf18) accent as primary identity color
- Element-color mapping: Fusion=orange, Electro=purple, Aero=emerald, Glacio=cyan, Havoc=pink, Spectro=yellow
- Deep blue-black base (#080c14)
- Canvas wave/glow background animations
- Corner-decoration motif on cards (top-right + bottom-left L-shapes)
- Shimmer line on card top edges
- cubic-bezier(0.16, 1, 0.3, 1) signature easing
- Font: Rajdhani (display) + JetBrains Mono (data numerals)
- Semi-transparent borders: rgba(255,255,255,0.08-0.15)
- CSS custom properties: --color-gold, --bg-card, --border-default, etc.

GAME TERMINOLOGY (non-negotiable):
- "Resonators" not "characters"
- "Convene" not "pulls"
- "Astrite" not "currency"
- Elements: Fusion, Electro, Aero, Glacio, Havoc, Spectro

RULES:
1. NEVER remove or modify existing features — only add or improve
2. NEVER change gacha rate calculations or game constants
3. NEVER break the existing data format or storage keys
4. Every change must be a precise string replacement (oldStr → newStr)
5. Each patch must be independently safe to apply or skip
6. Confidence below 0.85 = the change will be skipped
7. Prefer small, targeted improvements over large refactors
8. ${mode === 'micro' ? 'MICRO MODE: Only quick fixes — typos, broken URLs, stale dates, minor CSS polish. NO feature additions.' : 'FULL MODE: Can include feature improvements, UI polish, code quality, and data enrichment.'}

${PROTECTION_RULES}

RESPONSE FORMAT: Return a JSON array of patch objects:
[
  {
    "file": "appcore-data.js" | "appcore-engine.js" | "appcore-components.jsx" | "appcore-providers.jsx" | "App.jsx",
    "category": "bugfix" | "ui-polish" | "data-enrichment" | "code-quality" | "feature" | "a11y",
    "description": "What this change does (1 line)",
    "oldStr": "EXACT string to find in the file (must be unique, include enough context)",
    "newStr": "Replacement string",
    "confidence": 0.0-1.0
  }
]

Return ONLY the JSON array. No commentary, no markdown fences.
If there are no improvements to make, return an empty array: []`;
}

function buildAuditUserPrompt(mode, sources, currentState, recentActivity = '') {
  const fileSnippets = mode === 'micro'
    ? `
--- appcore-data.js (first 3000 chars) ---
${sources.data.slice(0, 3000)}

--- appcore-data.js (EVENTS section) ---
${extractSection(sources.data, 'SECTION:EVENTS', 2000)}

--- appcore-data.js (CURRENT_BANNERS) ---
${extractSection(sources.data, 'SECTION:BANNERS', 3000)}
`
    : `
--- appcore-data.js (first 5000 chars) ---
${sources.data.slice(0, 5000)}

--- appcore-data.js (EVENTS section ~2000 chars) ---
${extractSection(sources.data, 'SECTION:EVENTS', 2000)}

--- appcore-engine.js (first 3000 chars) ---
${sources.engine.slice(0, 3000)}

--- appcore-components.jsx (first 4000 chars) ---
${sources.components.slice(0, 4000)}

--- appcore-providers.jsx (CSS section ~3000 chars) ---
${extractSection(sources.providers, 'LAHAI-ROI DESIGN LANGUAGE', 3000)}

${sources.appSummary ? `--- App.jsx (summary) ---\n${sources.appSummary.slice(0, 6000)}` : ''}
`;

  return `Analyze this Wuthering Waves companion app and suggest improvements.

CURRENT STATE:
- App version: ${currentState.appVersion}
- Characters: ${currentState.characterNames.length} (${currentState.lists.all5StarResonators.length} 5★, ${currentState.lists.all4StarResonators.length} 4★)
- Weapons: ${currentState.weaponNames.length}
- Banner: v${currentState.banners?.version} Phase ${currentState.banners?.phase}
- Banner ends: ${currentState.banners?.endDate}
- Today's date: ${new Date().toISOString().split('T')[0]}

SOURCE CODE:
${fileSnippets}

${mode === 'micro' 
  ? 'MICRO MODE: Only suggest quick fixes — stale dates, typos, minor CSS issues, broken/empty values. MAX 5 patches.'
  : 'FULL MODE: Suggest up to 10 improvements. Prioritize: data accuracy > UI polish > code quality > new features.'
}

${recentActivity ? `═══ RECENT AGENT ACTIVITY (avoid re-doing these) ═══\n${recentActivity}` : ''}

Return the JSON array of patches.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function extractSection(source, sectionMarker, maxChars) {
  const idx = source.indexOf(sectionMarker);
  if (idx === -1) return '(section not found)';
  // Go back to find the start of the line/comment
  let start = Math.max(0, source.lastIndexOf('\n', idx) - 50);
  return source.slice(start, start + maxChars);
}

function parseAuditResponse(text) {
  try {
    // Strip markdown fences if present
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];

    // Validate each patch
    return parsed.filter(p => {
      if (!p.file || !p.oldStr || !p.newStr || !p.description) {
        log.warn(`Invalid patch (missing fields): ${p.description || 'unknown'}`);
        return false;
      }
      if (typeof p.confidence !== 'number' || p.confidence < 0 || p.confidence > 1) {
        p.confidence = 0.5; // Default to medium confidence
      }
      return true;
    });
  } catch (err) {
    log.error(`Failed to parse audit response: ${err.message}`);
    return [];
  }
}

function resolveFilePath(fileRef) {
  const map = {
    'appcore-data.js': PATHS.dataFile,
    'appcore-engine.js': PATHS.engineFile,
    'appcore-components.jsx': PATHS.componentsFile,
    'appcore-providers.jsx': PATHS.providersFile,
    'App.jsx': PATHS.appFile,
  };
  return map[fileRef] || null;
}
