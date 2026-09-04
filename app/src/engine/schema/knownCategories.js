// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/schema/knownCategories.js
// The append-only registry of every `damage.category` value in real use, per
// ENGINE_ARCHITECTURE_PROPOSAL.md v2 §3.2. `category` is a namespaced string matching
// `^[a-z][a-zA-Z]*Dmg$` (not a closed enum) so a new move type the game adds costs one
// line here, not a schema-file edit / validator-logic edit / every categorized switch
// statement touched. validateBlock.js checks BOTH that a category matches the pattern
// (catches typos like `skilDmg`/`Skilldmg`) AND that it exists in this registry
// (catches a genuinely new, undocumented category being introduced silently).
//
// Counts below are the real-usage snapshot from the proposal's §0.4 grep of every
// .blocks.js file (2026-09-04) — kept here as provenance, not re-verified live by this
// module (a live count would need re-grepping characterBlocks/ on every change, which
// is exactly the recurring-tax problem this registry design avoids).
// ═══════════════════════════════════════════════════════════════════════════════

export const KNOWN_CATEGORIES = {
  skillDmg: 'Resonance Skill DMG — the character\'s own Skill-type hits (120 blocks as of 2026-09-04).',
  basicDmg: 'Basic ATK DMG (111 blocks as of 2026-09-04).',
  libDmg: 'Resonance Liberation DMG (75 blocks as of 2026-09-04).',
  heavyDmg: 'Heavy ATK DMG (63 blocks as of 2026-09-04).',
  echoDmg: 'Echo Skill DMG (21 blocks as of 2026-09-04).',
  coordDmg: 'Coordinated ATK DMG (6 blocks as of 2026-09-04).',
  introDmg: 'Intro Skill DMG (2 blocks as of 2026-09-04) — under-represented relative to how many ' +
    'characters plainly have a real Intro damage share; per the proposal §0.4, most of the ' +
    '~15-16 not-yet-audited characters are expected to add entries here during their Phase A audit.',
  outroDmg: 'Outro Skill DMG (2 blocks as of 2026-09-04, same under-representation note as introDmg).',
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
    return { valid: false, reason: `"${category}" is not registered in knownCategories.js — add a one-line entry if this is a real new category, or fix the typo` };
  }
  return { valid: true };
}
