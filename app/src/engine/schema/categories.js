// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/schema/categories.js
// The append-only registry of every `damage.category` / `Proc.category` value in
// real use. `category` matches `^[a-z][a-zA-Z]*Dmg$` (not a closed enum) so a new
// move type the game adds costs one line here, not a schema-file edit. validate.js
// checks BOTH that a category matches the pattern (catches typos like `skilDmg`)
// AND that it exists in this registry (catches an undocumented category appearing
// silently).
// ═══════════════════════════════════════════════════════════════════════════════

export const KNOWN_CATEGORIES = {
  skillDmg: "Resonance Skill DMG — the character's own Skill-type hits.",
  basicDmg: 'Basic ATK DMG.',
  libDmg: 'Resonance Liberation DMG.',
  heavyDmg: 'Heavy ATK DMG.',
  echoDmg: 'Echo Skill DMG.',
  coordDmg: 'Coordinated ATK DMG.',
  introDmg: 'Intro Skill DMG.',
  outroDmg: 'Outro Skill DMG.',
};

const CATEGORY_PATTERN = /^[a-z][a-zA-Z]*Dmg$/;

/**
 * @param {string} category
 * @returns {{ valid: boolean, reason?: string }}
 */
export function checkCategory(category) {
  if (typeof category !== 'string' || !CATEGORY_PATTERN.test(category)) {
    return { valid: false, reason: `"${category}" does not match the required pattern ${CATEGORY_PATTERN} (e.g. "skillDmg")` };
  }
  if (!(category in KNOWN_CATEGORIES)) {
    return { valid: false, reason: `"${category}" is not registered in categories.js — add a one-line entry if this is a real new category, or fix the typo` };
  }
  return { valid: true };
}
