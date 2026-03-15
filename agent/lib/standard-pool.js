// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Standard Pool Tracker
//
// Kuro periodically adds characters and weapons to the standard 5★ pool.
// This module detects those changes and updates:
// - STANDARD_5STAR_CHARACTERS
// - STANDARD_5STAR_WEAPONS
// - CURRENT_BANNERS.standardCharacters
// - CURRENT_BANNERS.standardWeapons
// ═══════════════════════════════════════════════════════════════════════════════

import { log, addChange } from './log.js';

/**
 * Check if the standard pool has changed.
 * Compares current app data against web sources.
 */
export async function checkStandardPool(sourceContents, currentSource, askClaudeFn) {
  log.info('Checking standard pool for changes...');

  // Extract current standard pool from source
  const currentChars = extractSet(currentSource, 'STANDARD_5STAR_CHARACTERS');
  const currentWeapons = extractSet(currentSource, 'STANDARD_5STAR_WEAPONS');

  const prompt = `Check if the Wuthering Waves standard 5★ pool (Tidal Chorus / Lustrous Tide banners) has been updated.

CURRENT APP DATA:
- Standard 5★ Characters: ${currentChars.join(', ')}
- Standard 5★ Weapons: ${currentWeapons.join(', ')}

WEB SOURCES:
${sourceContents.map((s, i) => `--- SOURCE ${i + 1} (${s.url}) ---\n${s.content.slice(0, 10000)}`).join('\n\n')}

TASK: Determine if any characters or weapons have been ADDED to the standard 5★ pool that are not in the current app data. The standard pool is the permanent pool (not limited/featured banners).

Do NOT confuse featured banner characters with standard pool characters.
Standard pool characters are those available on ALL banners via the 50/50 loss.

Return JSON:
{
  "standardCharsChanged": true/false,
  "standardWeaponsChanged": true/false,
  "newStandardChars": ["Name1", "Name2"] or [],
  "newStandardWeapons": [{"name": "Weapon Name", "type": "Weapon Type"}] or [],
  "confidence": 0.0-1.0
}

If no changes detected, return with both changed=false and empty arrays.
Return ONLY the JSON.`;

  try {
    const response = await askClaudeFn(
      'You are a Wuthering Waves standard pool analyst. Distinguish between standard pool (permanent) and featured banner (temporary) items. Return valid JSON only.',
      prompt,
      { maxTokens: 1024 }
    );
    return JSON.parse(response.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
  } catch (err) {
    log.warn(`Standard pool check failed: ${err.message}`);
    return { standardCharsChanged: false, standardWeaponsChanged: false, newStandardChars: [], newStandardWeapons: [], confidence: 0 };
  }
}

/**
 * Apply standard pool updates to the write buffer.
 */
export function applyStandardPoolUpdates(analysis, getBufferFn, loadBufferFn, minConfidence = 0.85) {
  if (analysis.confidence < minConfidence) {
    if (analysis.standardCharsChanged || analysis.standardWeaponsChanged) {
      log.warn(`Standard pool change detected but confidence ${(analysis.confidence * 100).toFixed(0)}% too low`);
    }
    return false;
  }

  let changed = false;
  let buf = getBufferFn();

  // Add new standard characters
  if (analysis.newStandardChars?.length) {
    for (const name of analysis.newStandardChars) {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Add to STANDARD_5STAR_CHARACTERS Set
      if (!buf.includes(`'${name}'`) || !buf.match(new RegExp(`STANDARD_5STAR_CHARACTERS[\\s\\S]*?'${escapedName}'`))) {
        const setMatch = buf.match(/(const STANDARD_5STAR_CHARACTERS = new Set\(\[[\s\S]*?)(]\))/);
        if (setMatch && !setMatch[1].includes(`'${name}'`)) {
          buf = buf.replace(setMatch[0], `${setMatch[1]}, '${name}'${setMatch[2]}`);
          addChange('standard-pool', `Added ${name} to STANDARD_5STAR_CHARACTERS`);
          changed = true;
        }
      }

      // Add to CURRENT_BANNERS.standardCharacters
      const stdCharsMatch = buf.match(/(standardCharacters:\s*\[[\s\S]*?)(])/);
      if (stdCharsMatch && !stdCharsMatch[1].includes(`'${name}'`)) {
        buf = buf.replace(stdCharsMatch[0], `${stdCharsMatch[1]}, '${name}'${stdCharsMatch[2]}`);
        changed = true;
      }
    }
  }

  // Add new standard weapons
  if (analysis.newStandardWeapons?.length) {
    for (const weapon of analysis.newStandardWeapons) {
      // Add to STANDARD_5STAR_WEAPONS Set
      const wSetMatch = buf.match(/(const STANDARD_5STAR_WEAPONS = new Set\(\[[\s\S]*?)(]\))/);
      if (wSetMatch && !wSetMatch[1].includes(`'${weapon.name}'`)) {
        buf = buf.replace(wSetMatch[0], `${wSetMatch[1]},\n  '${weapon.name}'${wSetMatch[2]}`);
        addChange('standard-pool', `Added ${weapon.name} to STANDARD_5STAR_WEAPONS`);
        changed = true;
      }

      // Add to CURRENT_BANNERS.standardWeapons array
      const stdWeapMatch = buf.match(/(standardWeapons:\s*\[[\s\S]*?)(],)/);
      if (stdWeapMatch && !stdWeapMatch[1].includes(`'${weapon.name}'`)) {
        const entry = `\n    { name: '${weapon.name}', type: '${weapon.type}' },`;
        buf = buf.replace(stdWeapMatch[0], `${stdWeapMatch[1]}${entry}\n  ${stdWeapMatch[2]}`);
        changed = true;
      }
    }
  }

  if (changed) loadBufferFn(buf);
  return changed;
}

function extractSet(source, varName) {
  const m = source.match(new RegExp(`const ${varName}\\s*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\)`));
  if (!m) return [];
  return [...m[1].matchAll(/(?:'([^']+)'|"([^"]+)")/g)].map(x => x[1] || x[2]);
}
