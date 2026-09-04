// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/schema/buffSource.js
// The `source` field on a stat buff: WHERE it comes from, distinct from `target`
// (WHO receives it). Neither field alone answers "does swapping this echo remove
// the buff" or "does this stack with an echo giving the same stat" — you need both.
//
// A buff object should carry both going forward:
//   { statId: 'aeroDmg', value: 30, target: 'team', source: 'echo' }
//
// Closed enum, not a pattern-plus-registry like knownCategories.js — the set of
// places a buff can originate from is small, game-mechanic-defined, and not
// something new content adds to casually the way move-type categories are.
// ═══════════════════════════════════════════════════════════════════════════════

export const BUFF_SOURCES = {
  'self-kit': 'The buffed character\'s own kit — Inherent Skill, self-buff, Forte passive, etc.',
  'teammate-ally-action': 'Granted by a teammate\'s action (Intro/Outro cast, ally-action trigger, chain node targeting the team).',
  'echo': 'From an equipped Echo (main stat, set bonus, or Echo skill effect).',
  'weapon': 'From an equipped weapon\'s passive.',
};

/**
 * @param {string} source
 * @returns {{ valid: boolean, reason?: string }}
 */
export function checkBuffSource(source) {
  if (!(source in BUFF_SOURCES)) {
    return { valid: false, reason: `"${source}" is not a recognized buff source — must be one of: ${Object.keys(BUFF_SOURCES).join(', ')}` };
  }
  return { valid: true };
}
