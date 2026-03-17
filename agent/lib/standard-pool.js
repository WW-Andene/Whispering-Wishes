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
// Find a balanced bracket/paren section after a marker in source
function findBalancedBracket(source, marker, open = '[', close = ']') {
  const start = source.indexOf(marker);
  if (start === -1) return null;
  const openIdx = source.indexOf(open, start + marker.length);
  if (openIdx === -1) return null;

  let depth = 1;
  let inStr = false, strCh = '';
  for (let i = openIdx + 1; i < source.length; i++) {
    const c = source[i];
    if (inStr) {
      let bs = 0;
      for (let j = i - 1; j >= 0 && source[j] === '\\'; j--) bs++;
      if (c === strCh && bs % 2 === 0) inStr = false;
      continue;
    }
    if (c === "'" || c === '"') { inStr = true; strCh = c; continue; }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) {
        return {
          full: source.slice(start, i + 1),
          inner: source.slice(openIdx + 1, i),
          innerStart: openIdx + 1,
          innerEnd: i,
        };
      }
    }
  }
  return null;
}

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
      // Add to STANDARD_5STAR_CHARACTERS Set
      const section = findBalancedBracket(buf, 'const STANDARD_5STAR_CHARACTERS = new Set(', '[', ']');
      if (section && !section.inner.includes(`'${name}'`)) {
        const trimmed = section.inner.trimEnd();
        const sep = trimmed.endsWith(',') || trimmed.endsWith('[') ? ' ' : ', ';
        buf = buf.replace(section.full, section.full.replace(section.inner, section.inner.replace(/(\s*$)/, `${sep}'${name}'$1`)));
        addChange('standard-pool', `Added ${name} to STANDARD_5STAR_CHARACTERS`);
        changed = true;
      }

      // Add to CURRENT_BANNERS.standardCharacters
      const scSection = findBalancedBracket(buf, 'standardCharacters:');
      if (scSection && !scSection.inner.includes(`'${name}'`)) {
        const trimmed = scSection.inner.trimEnd();
        const sep = trimmed.endsWith(',') || trimmed.endsWith('[') ? ' ' : ', ';
        buf = buf.replace(scSection.full, scSection.full.replace(scSection.inner, scSection.inner.replace(/(\s*$)/, `${sep}'${name}'$1`)));
        changed = true;
      }
    }
  }

  // Add new standard weapons
  if (analysis.newStandardWeapons?.length) {
    for (const weapon of analysis.newStandardWeapons) {
      const wSection = findBalancedBracket(buf, 'const STANDARD_5STAR_WEAPONS = new Set(', '[', ']');
      if (wSection && !wSection.inner.includes(`'${weapon.name}'`)) {
        const trimmed = wSection.inner.trimEnd();
        const sep = trimmed.endsWith(',') || trimmed.endsWith('[') ? '\n  ' : ',\n  ';
        buf = buf.replace(wSection.full, wSection.full.replace(wSection.inner, wSection.inner.replace(/(\s*$)/, `${sep}'${weapon.name}'$1`)));
        addChange('standard-pool', `Added ${weapon.name} to STANDARD_5STAR_WEAPONS`);
        changed = true;
      }

      // Add to CURRENT_BANNERS.standardWeapons array
      const swSection = findBalancedBracket(buf, 'standardWeapons:');
      if (swSection && !swSection.inner.includes(`'${weapon.name}'`)) {
        const entry = `\n    { name: '${weapon.name}', type: '${weapon.type}' },`;
        buf = buf.replace(swSection.full, swSection.full.replace(swSection.inner, swSection.inner.replace(/(\s*$)/, `${entry}$1`)));
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
  const items = [];
  const pattern = /(?:'((?:[^'\\]|\\.)+)'|"((?:[^"\\]|\\.)+)")/g;
  for (const match of m[1].matchAll(pattern)) {
    const raw = match[1] || match[2];
    items.push(raw.replace(/\\'/g, "'").replace(/\\"/g, '"'));
  }
  return items;
}
