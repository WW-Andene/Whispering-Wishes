// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Validator v2
//
// Post-update integrity checks. Catches errors before they reach users.
//
// Two layers:
//   STRUCTURAL (checks 1-11) — syntax, counts, cross-references, duplicates
//     Original checks. If ANY fails, the agent aborts.
//
//   SEMANTIC (checks 12-22) — plausibility, ranges, completeness, sanity
//     Catches data that is syntactically valid but nonsensical:
//     a banner dated in 2019, a weapon with 0 base ATK, a character with
//     no skills, an event that expired 6 months ago.
//     Semantic failures are WARNINGS by default (don't block the update)
//     but can be promoted to errors via strictSemantic option.
//
// Usage:
//   const result = validate(source);                            // standard
//   const result = validate(source, { strictSemantic: true });  // strict
// ═══════════════════════════════════════════════════════════════════════════════

import { GAME } from './config.js';
import { log } from './log.js';
import {
  extractCurrentBanners, extractCharacterNames, extractWeaponNames,
  extractLists, extractAllCharacters, extractBannerHistory, extractEvents,
} from './reader.js';

// ─── Semantic Constants ──────────────────────────────────────────────────────

// Wuthering Waves launched May 22, 2024. No date should predate this.
const GAME_LAUNCH_DATE = new Date('2024-05-22T00:00:00Z');

// Reasonable future bound: 2 years from now.
const MAX_FUTURE_YEARS = 2;

// Banner phases typically last 14-21 days.
const MIN_BANNER_DURATION_DAYS = 7;
const MAX_BANNER_DURATION_DAYS = 45;

// Required fields for a CHARACTER_DATA entry to be considered complete.
const REQUIRED_CHARACTER_FIELDS = ['rarity', 'element', 'weapon', 'role', 'desc', 'skills'];

// Weapon base ATK plausible range (from actual game data).
const MIN_WEAPON_BASE_ATK = 20;
const MAX_WEAPON_BASE_ATK = 800;

// Minimum description length — catches stubs.
const MIN_DESCRIPTION_LENGTH = 15;

// Max days an event can be past-due before we flag it.
const MAX_EVENT_STALENESS_DAYS = 60;

// Valid sets (strict checking)
const VALID_ELEMENTS = new Set(GAME.ELEMENTS);
const VALID_WEAPONS = new Set(GAME.WEAPON_TYPES);
const VALID_ROLES = new Set(GAME.ROLES);
const VALID_RARITIES = new Set(GAME.RARITIES);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run all validation checks on the updated source.
 *
 * @param {string} updatedSource — Full content of appcore-data.js
 * @param {Object} [options]
 * @param {boolean} [options.strictSemantic=false] — Promote semantic warnings to errors
 * @returns {{ passed: boolean, errors: string[], warnings: string[], semantic: string[] }}
 */
export function validate(updatedSource, { strictSemantic = false } = {}) {
  log.info('Running validation checks...');
  const errors = [];
  const warnings = [];
  const semantic = [];

  // ─── STRUCTURAL CHECKS (1-11) ─────────────────────────────────────────

  // 1. Syntax
  checkSyntax(updatedSource, errors);

  // 2. Extract data
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

  // 4. Every 5-star in ALL_5STAR_RESONATORS exists in CHARACTER_DATA
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

  // 7. Banner dates valid
  if (banners) {
    const start = new Date(banners.startDate);
    const end = new Date(banners.endDate);
    if (isNaN(start.getTime())) errors.push(`CURRENT_BANNERS startDate is invalid: ${banners.startDate}`);
    if (isNaN(end.getTime())) errors.push(`CURRENT_BANNERS endDate is invalid: ${banners.endDate}`);
    if (start >= end) errors.push(`CURRENT_BANNERS startDate >= endDate`);
  }

  // 8. Release order count
  if (lists.releaseOrder.length !== charDataCount) {
    warnings.push(`RELEASE_ORDER(${lists.releaseOrder.length}) ≠ CHARACTER_DATA(${charDataCount})`);
  }

  // 9. Element validation
  const elementRegex = /element:\s*'([^']+)'/g;
  let m;
  while ((m = elementRegex.exec(updatedSource)) !== null) {
    if (!VALID_ELEMENTS.has(m[1]) && m[1] !== '') {
      warnings.push(`Unusual element value found: "${m[1]}"`);
    }
  }

  // 10. No duplicates
  const checkDuplicates = (listName, items) => {
    const seen = new Set();
    for (const item of items) {
      if (seen.has(item)) errors.push(`Duplicate entry in ${listName}: "${item}"`);
      seen.add(item);
    }
  };
  checkDuplicates('ALL_5STAR_RESONATORS', lists.all5StarResonators);
  checkDuplicates('ALL_4STAR_RESONATORS', lists.all4StarResonators);
  checkDuplicates('ALL_5STAR_WEAPONS', lists.all5StarWeapons);
  checkDuplicates('RELEASE_ORDER', lists.releaseOrder);

  // 11. Banner history order
  if (history.entries.length > 1) {
    const first = history.entries[0];
    const last = history.entries[history.entries.length - 1];
    if (parseFloat(first.version) < parseFloat(last.version)) {
      warnings.push(`BANNER_HISTORY may be in wrong order: first v${first.version} < last v${last.version}`);
    }
  }

  // ─── SEMANTIC CHECKS (12-22) ──────────────────────────────────────────

  const events = extractEvents(updatedSource);

  if (banners) {
    checkBannerDateRange(banners, semantic);    // 12
    checkBannerDuration(banners, semantic);     // 13
  }
  checkBannerHistoryProgression(history, semantic);                    // 14
  checkCharacterCompleteness(updatedSource, chars, semantic);         // 15
  checkCharacterFieldValues(updatedSource, chars, semantic);          // 16
  checkDescriptionQuality(updatedSource, chars, 'CHARACTER_DATA', semantic);  // 17
  checkWeaponStats(updatedSource, weapons, semantic);                 // 18
  checkDescriptionQuality(updatedSource, weapons, 'WEAPON_DATA', semantic);   // 19
  checkEventFreshness(events, semantic);                              // 20
  checkRarityCrossContamination(lists, semantic);                     // 21
  checkBannerRarityConsistency(updatedSource, banners, semantic);     // 22

  // ─── Promote semantic issues if strict ─────────────────────────────────

  if (strictSemantic) {
    for (const s of semantic) errors.push(`[SEMANTIC] ${s}`);
  } else {
    for (const s of semantic) warnings.push(`[SEMANTIC] ${s}`);
  }

  // ─── Summary ───────────────────────────────────────────────────────────

  const passed = errors.length === 0;

  if (passed) {
    log.ok(`Validation PASSED (${11 + semantic.length} checks, ${warnings.length} warning(s))`);
  } else {
    log.error(`Validation FAILED: ${errors.length} error(s), ${warnings.length} warning(s)`);
  }

  for (const e of errors) log.error(`  ✗ ${e}`);
  for (const w of warnings) log.warn(`  ⚠ ${w}`);

  return { passed, errors, warnings, semantic };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRUCTURAL: Syntax (check 1 — original, unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

function checkSyntax(source, errors) {
  let braces = 0, brackets = 0, parens = 0;
  let inString = false, stringChar = '';

  for (let i = 0; i < source.length; i++) {
    const c = source[i];

    if (inString) {
      let backslashes = 0;
      for (let j = i - 1; j >= 0 && source[j] === '\\'; j--) {
        backslashes++;
      }
      const isEscaped = backslashes % 2 === 1;
      if (c === stringChar && !isEscaped) {
        inString = false;
      }
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
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC CHECKS (12-22)
// ═══════════════════════════════════════════════════════════════════════════════

// 12. Banner dates within plausible range
function checkBannerDateRange(banners, issues) {
  const maxFuture = new Date();
  maxFuture.setFullYear(maxFuture.getFullYear() + MAX_FUTURE_YEARS);

  for (const [label, dateStr] of [['startDate', banners.startDate], ['endDate', banners.endDate]]) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) continue; // Already caught by structural check 7

    if (d < GAME_LAUNCH_DATE) {
      issues.push(`Banner ${label} ${dateStr} predates game launch (2024-05-22)`);
    }
    if (d > maxFuture) {
      issues.push(`Banner ${label} ${dateStr} is unreasonably far in the future`);
    }
  }
}

// 13. Banner duration is reasonable
function checkBannerDuration(banners, issues) {
  const start = new Date(banners.startDate);
  const end = new Date(banners.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

  const days = (end - start) / (24 * 3600000);

  if (days < MIN_BANNER_DURATION_DAYS) {
    issues.push(`Banner duration ${days.toFixed(1)}d is unusually short (min ${MIN_BANNER_DURATION_DAYS}d)`);
  }
  if (days > MAX_BANNER_DURATION_DAYS) {
    issues.push(`Banner duration ${days.toFixed(1)}d is unusually long (max ${MAX_BANNER_DURATION_DAYS}d)`);
  }
}

// 14. Banner history versions progress monotonically (newest first)
function checkBannerHistoryProgression(history, issues) {
  if (history.entries.length < 2) return;

  for (let i = 1; i < history.entries.length; i++) {
    const curr = history.entries[i];
    const prev = history.entries[i - 1];
    const currV = parseFloat(curr.version);
    const prevV = parseFloat(prev.version);

    // Same version OK (phase progression). Older version OK (descending).
    // NEWER version below an older one = wrong order.
    if (currV > prevV) {
      issues.push(
        `BANNER_HISTORY not monotonic at index ${i}: ` +
        `v${curr.version}p${curr.phase} appears after v${prev.version}p${prev.phase}`
      );
      break;
    }
  }
}

// 15. Character data completeness
function checkCharacterCompleteness(source, charNames, issues) {
  const charBlock = source.match(/const CHARACTER_DATA\s*=\s*\{([\s\S]*?)\n\};\s*\n/);
  if (!charBlock) return;

  for (const name of charNames) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Find this character's block (up to 2000 chars after the key)
    const nameIdx = charBlock[1].indexOf(`'${name}'`);
    if (nameIdx === -1) continue;

    const slice = charBlock[1].slice(nameIdx, nameIdx + 2000);

    for (const field of REQUIRED_CHARACTER_FIELDS) {
      const fieldRegex = new RegExp(`${field}:\\s*(?:'([^']*)'|"([^"]*)"|\\[([^\\]]*)\\]|(\\d+))`);
      const fieldMatch = slice.match(fieldRegex);

      if (!fieldMatch) {
        issues.push(`${name}: missing required field "${field}"`);
      } else {
        const value = (fieldMatch[1] || fieldMatch[2] || fieldMatch[3] || fieldMatch[4] || '').trim();
        if (value === '' || value === 'TBD' || value === 'N/A') {
          issues.push(`${name}: field "${field}" is empty/placeholder`);
        }
      }
    }
  }
}

// 16. Character field values from valid sets
function checkCharacterFieldValues(source, charNames, issues) {
  const charBlock = source.match(/const CHARACTER_DATA\s*=\s*\{([\s\S]*?)\n\};\s*\n/);
  if (!charBlock) return;

  for (const name of charNames) {
    const nameIdx = charBlock[1].indexOf(`'${name}'`);
    if (nameIdx === -1) continue;
    const slice = charBlock[1].slice(nameIdx, nameIdx + 1500);

    const element = slice.match(/element:\s*'([^']+)'/)?.[1];
    const weapon = slice.match(/weapon:\s*'([^']+)'/)?.[1];
    const role = slice.match(/role:\s*'([^']+)'/)?.[1];
    const rarity = slice.match(/rarity:\s*(\d+)/)?.[1];

    if (element && !VALID_ELEMENTS.has(element)) {
      issues.push(`${name}: invalid element "${element}"`);
    }
    if (weapon && !VALID_WEAPONS.has(weapon)) {
      issues.push(`${name}: invalid weapon type "${weapon}"`);
    }
    if (role && !VALID_ROLES.has(role)) {
      issues.push(`${name}: invalid role "${role}"`);
    }
    if (rarity && !VALID_RARITIES.has(parseInt(rarity))) {
      issues.push(`${name}: invalid rarity ${rarity}`);
    }
  }
}

// 17 & 19. Description quality (characters and weapons)
function checkDescriptionQuality(source, names, dataObjectName, issues) {
  const blockRegex = new RegExp(`const ${dataObjectName}\\s*=\\s*\\{([\\s\\S]*?)\\n\\};\\s*\\n`);
  const block = source.match(blockRegex);
  if (!block) return;

  for (const name of names) {
    const nameIdx = block[1].indexOf(`'${name}'`);
    const altIdx = block[1].indexOf(`"${name}"`);
    const idx = nameIdx !== -1 ? nameIdx : altIdx;
    if (idx === -1) continue;

    const slice = block[1].slice(idx, idx + 2000);
    const descMatch = slice.match(/desc:\s*['"]([^'"]*)['"]/);
    if (!descMatch) continue;

    if (descMatch[1].length < MIN_DESCRIPTION_LENGTH && descMatch[1] !== '') {
      issues.push(`${name} (${dataObjectName}): description only ${descMatch[1].length} chars`);
    }
  }
}

// 18. Weapon base ATK plausibility
function checkWeaponStats(source, weaponNames, issues) {
  const block = source.match(/const WEAPON_DATA\s*=\s*\{([\s\S]*?)\n\};\s*\n/);
  if (!block) return;

  for (const name of weaponNames) {
    const nameIdx = block[1].indexOf(`'${name}'`);
    const altIdx = block[1].indexOf(`"${name}"`);
    const idx = nameIdx !== -1 ? nameIdx : altIdx;
    if (idx === -1) continue;

    const slice = block[1].slice(idx, idx + 1500);

    const atkMatch = slice.match(/baseAtk:\s*(\d+)/);
    if (atkMatch) {
      const atk = parseInt(atkMatch[1]);
      if (atk < MIN_WEAPON_BASE_ATK || atk > MAX_WEAPON_BASE_ATK) {
        issues.push(`${name}: baseAtk ${atk} outside range ${MIN_WEAPON_BASE_ATK}-${MAX_WEAPON_BASE_ATK}`);
      }
    }

    const rarityMatch = slice.match(/rarity:\s*(\d+)/);
    if (rarityMatch && !VALID_RARITIES.has(parseInt(rarityMatch[1]))) {
      issues.push(`${name}: invalid rarity ${rarityMatch[1]}`);
    }
  }
}

// 20. Event date freshness
function checkEventFreshness(events, issues) {
  const now = new Date();

  for (const [key, event] of Object.entries(events)) {
    if (!event.currentEnd) continue;

    const endDate = new Date(event.currentEnd);
    if (isNaN(endDate.getTime())) {
      issues.push(`Event "${event.name || key}": currentEnd "${event.currentEnd}" is not a valid date`);
      continue;
    }

    const daysSinceEnd = (now - endDate) / (24 * 3600000);
    if (daysSinceEnd > MAX_EVENT_STALENESS_DAYS) {
      issues.push(`Event "${event.name || key}": ended ${daysSinceEnd.toFixed(0)}d ago — may need updating`);
    }
    if (endDate < GAME_LAUNCH_DATE) {
      issues.push(`Event "${event.name || key}": date ${event.currentEnd} predates game launch`);
    }
  }
}

// 21. No character in both rarity lists
function checkRarityCrossContamination(lists, issues) {
  const fiveStarSet = new Set(lists.all5StarResonators);
  for (const name of lists.all4StarResonators) {
    if (fiveStarSet.has(name)) {
      issues.push(`"${name}" appears in BOTH ALL_5STAR_RESONATORS and ALL_4STAR_RESONATORS`);
    }
  }
}

// 22. Banner characters should be 4★ or 5★
function checkBannerRarityConsistency(source, banners, issues) {
  if (!banners) return;

  const charBlock = source.match(/const CHARACTER_DATA\s*=\s*\{([\s\S]*?)\n\};\s*\n/);
  if (!charBlock) return;

  for (const c of banners.characters) {
    const nameIdx = charBlock[1].indexOf(`'${c.name}'`);
    if (nameIdx === -1) continue;

    const slice = charBlock[1].slice(nameIdx, nameIdx + 500);
    const rarityMatch = slice.match(/rarity:\s*(\d+)/);

    if (rarityMatch && parseInt(rarityMatch[1]) < 4) {
      issues.push(`Banner character "${c.name}" has rarity ${rarityMatch[1]} — expected 4★ or 5★`);
    }
  }
}
