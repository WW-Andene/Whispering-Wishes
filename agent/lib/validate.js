// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Validator
// Post-update integrity checks. Catches errors before they reach users.
// ═══════════════════════════════════════════════════════════════════════════════

import { GAME } from './config.js';
import { log } from './log.js';
import {
  extractCurrentBanners, extractCharacterNames, extractWeaponNames,
  extractLists, extractAllCharacters, extractBannerHistory,
} from './reader.js';

/**
 * Run all validation checks on the updated source.
 * Returns { passed: boolean, errors: string[], warnings: string[] }
 */
export function validate(updatedSource) {
  log.info('Running validation checks...');
  const errors = [];
  const warnings = [];

  // 1. Syntax check — no obvious JS errors
  checkSyntax(updatedSource, errors);

  // 2. Data integrity
  const chars = extractCharacterNames(updatedSource);
  const weapons = extractWeaponNames(updatedSource);
  const lists = extractLists(updatedSource);
  const allChars = extractAllCharacters(updatedSource);
  const banners = extractCurrentBanners(updatedSource);
  const history = extractBannerHistory(updatedSource);

  // 3. Character count consistency
  const total5 = lists.all5StarResonators.length;
  const total4 = lists.all4StarResonators.length;
  const charDataCount = chars.length;

  if (total5 + total4 !== charDataCount) {
    errors.push(`CHARACTER_DATA has ${charDataCount} entries but ALL_5STAR(${total5}) + ALL_4STAR(${total4}) = ${total5 + total4}`);
  }

  if (allChars.length !== charDataCount) {
    warnings.push(`ALL_CHARACTERS(${allChars.length}) ≠ CHARACTER_DATA(${charDataCount})`);
  }

  // 4. Every 5-star resonator in ALL_5STAR_RESONATORS exists in CHARACTER_DATA
  for (const name of lists.all5StarResonators) {
    if (!chars.includes(name)) {
      errors.push(`ALL_5STAR_RESONATORS contains "${name}" but it's not in CHARACTER_DATA`);
    }
  }

  // 5. Every character in ALL_CHARACTERS exists in CHARACTER_DATA
  for (const name of allChars) {
    if (!chars.includes(name)) {
      errors.push(`ALL_CHARACTERS contains "${name}" but it's not in CHARACTER_DATA`);
    }
  }

  // 6. Banner characters exist in CHARACTER_DATA
  if (banners) {
    for (const c of banners.characters) {
      if (!chars.includes(c.name)) {
        errors.push(`CURRENT_BANNERS features "${c.name}" but it's not in CHARACTER_DATA`);
      }
    }
  }

  // 7. Banner dates are valid
  if (banners) {
    const start = new Date(banners.startDate);
    const end = new Date(banners.endDate);
    if (isNaN(start.getTime())) errors.push(`CURRENT_BANNERS startDate is invalid: ${banners.startDate}`);
    if (isNaN(end.getTime())) errors.push(`CURRENT_BANNERS endDate is invalid: ${banners.endDate}`);
    if (start >= end) errors.push(`CURRENT_BANNERS startDate >= endDate`);
  }

  // 8. Release order contains all characters
  if (lists.releaseOrder.length !== charDataCount) {
    warnings.push(`RELEASE_ORDER(${lists.releaseOrder.length}) ≠ CHARACTER_DATA(${charDataCount})`);
  }

  // 9. Element and weapon type validation
  const validElements = new Set(GAME.ELEMENTS);
  const validWeapons = new Set(GAME.WEAPON_TYPES);

  // Check elements in CHARACTER_DATA entries
  const elementRegex = /element:\s*'([^']+)'/g;
  let m;
  while ((m = elementRegex.exec(updatedSource)) !== null) {
    if (!validElements.has(m[1]) && m[1] !== '') {
      // Only warn for non-empty elements outside CHARACTER_DATA patterns
      // (could match other objects, so just warn)
      warnings.push(`Unusual element value found: "${m[1]}"`);
    }
  }

  // 10. No duplicate entries in lists
  const checkDuplicates = (listName, items) => {
    const seen = new Set();
    for (const item of items) {
      if (seen.has(item)) {
        errors.push(`Duplicate entry in ${listName}: "${item}"`);
      }
      seen.add(item);
    }
  };

  checkDuplicates('ALL_5STAR_RESONATORS', lists.all5StarResonators);
  checkDuplicates('ALL_4STAR_RESONATORS', lists.all4StarResonators);
  checkDuplicates('ALL_5STAR_WEAPONS', lists.all5StarWeapons);
  checkDuplicates('RELEASE_ORDER', lists.releaseOrder);

  // 11. BANNER_HISTORY entries are in chronological order (newest first)
  if (history.entries.length > 1) {
    // version comparison: newer versions should come first
    const first = history.entries[0];
    const last = history.entries[history.entries.length - 1];
    if (parseFloat(first.version) < parseFloat(last.version)) {
      warnings.push(`BANNER_HISTORY may be in wrong order: first entry v${first.version} < last entry v${last.version}`);
    }
  }

  // Summary
  const passed = errors.length === 0;
  if (passed) {
    log.ok(`Validation PASSED${warnings.length ? ` (${warnings.length} warnings)` : ''}`);
  } else {
    log.error(`Validation FAILED: ${errors.length} error(s), ${warnings.length} warning(s)`);
  }

  for (const e of errors) log.error(`  ✗ ${e}`);
  for (const w of warnings) log.warn(`  ⚠ ${w}`);

  return { passed, errors, warnings };
}

/**
 * Basic syntax checks — look for common JS problems.
 */
function checkSyntax(source, errors) {
  // Check balanced braces/brackets
  let braces = 0, brackets = 0, parens = 0;
  let inString = false, stringChar = '';

  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    const prev = i > 0 ? source[i - 1] : '';

    if (inString) {
      if (c === stringChar && prev !== '\\') inString = false;
      continue;
    }

    if (c === "'" || c === '"' || c === '`') {
      inString = true;
      stringChar = c;
    } else if (c === '{') braces++;
    else if (c === '}') braces--;
    else if (c === '[') brackets++;
    else if (c === ']') brackets--;
    else if (c === '(') parens++;
    else if (c === ')') parens--;
  }

  if (braces !== 0) errors.push(`Unbalanced braces: ${braces > 0 ? braces + ' unclosed' : Math.abs(braces) + ' extra closing'}`);
  if (brackets !== 0) errors.push(`Unbalanced brackets: ${brackets > 0 ? brackets + ' unclosed' : Math.abs(brackets) + ' extra closing'}`);
  if (parens !== 0) errors.push(`Unbalanced parentheses: ${parens > 0 ? parens + ' unclosed' : Math.abs(parens) + ' extra closing'}`);

  // Check for obvious broken strings
  if (source.includes("''s")) {
    // This is fine — possessive in key names like "Daybreaker's Spine"
  }
}
