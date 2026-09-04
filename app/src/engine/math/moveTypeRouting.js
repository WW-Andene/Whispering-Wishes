// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/math/moveTypeRouting.js
// [MATH · MOVE-TYPE-ROUTING] Collapses per-move-type %DMG-bonus accumulators
// (basicDmg/heavyDmg/libDmg/echoDmg/coordDmg) into the single skillDmg bucket
// damageFormula.js's calcDmgBonus expects, gated by which move types the
// character's own rotation actually uses (dpsFocus).
//
// Layer: 2 (shared math primitives), engine rewrite. Formerly
// engine/shared/buffAccumulation.js's collapseDmgTypeBuckets.
// ═══════════════════════════════════════════════════════════════════════════════

// ── [CONST · NO-FOCUS-FALLBACK] Not a sourced game mechanic. When a character has NO declared
// dpsFocus at all (an unresolved/incomplete character record, not a real in-game state), these
// weights approximate "some but not full credit" for Basic/Heavy/Liberation DMG bonuses rather than
// discarding them outright or crediting them in full. Tagged explicitly as a heuristic fallback for
// missing data — never treat these as real WuWa formula constants the way ATTACKER_FACTOR etc. are.
export const NO_FOCUS_FALLBACK_BASIC_ATK_CREDIT = 0.5;
export const NO_FOCUS_FALLBACK_HEAVY_ATK_CREDIT = 0.5;
export const NO_FOCUS_FALLBACK_LIBERATION_CREDIT = 0.3;

/**
 * [LOGIC · COLLAPSE-DMG-TYPE-BUCKETS] Mutates `stats.skillDmg` in place, folding in whichever
 * move-type buckets the character's own `dpsFocus` says they actually use.
 * @param {{skillDmg: number, basicDmg: number, heavyDmg: number, libDmg: number, echoDmg: number, coordDmg: number}} stats
 * @param {string[]} dpsFocus  Move types this character's modeled rotation actually deals damage
 *                             through (e.g. ['Skill', 'Liberation']).
 */
export function collapseDmgTypeBuckets(stats, dpsFocus) {
  // stats.skillDmg arrives holding whatever literal "Resonance Skill DMG%" contributions were
  // accumulated before this call (weapon passive, echo set, self-buffs, resonance chain). Unlike its
  // basicDmg/heavyDmg/libDmg/echoDmg/coordDmg siblings it was never gated by dpsFocus on its own — a
  // character with no 'Skill' in their focus (e.g. a pure Heavy ATK/Liberation DPS) would otherwise
  // get full credit for a Resonance-Skill-specific bonus as if it applied to their whole rotation.
  // Zero it here first, same "declared focus or nothing" rule as every other type below.
  if (!dpsFocus.includes('Skill')) stats.skillDmg = 0;

  if (dpsFocus.includes('Basic ATK')) stats.skillDmg += stats.basicDmg;
  else if (stats.basicDmg > 0 && !dpsFocus.length) stats.skillDmg += stats.basicDmg * NO_FOCUS_FALLBACK_BASIC_ATK_CREDIT;

  if (dpsFocus.includes('Heavy ATK')) stats.skillDmg += stats.heavyDmg;
  else if (stats.heavyDmg > 0 && !dpsFocus.length) stats.skillDmg += stats.heavyDmg * NO_FOCUS_FALLBACK_HEAVY_ATK_CREDIT;

  if (dpsFocus.includes('Liberation')) stats.skillDmg += stats.libDmg;
  else if (stats.libDmg > 0 && !dpsFocus.length) stats.skillDmg += stats.libDmg * NO_FOCUS_FALLBACK_LIBERATION_CREDIT;

  if (dpsFocus.includes('Echo')) stats.skillDmg += stats.echoDmg;
  if (dpsFocus.includes('Coordinated ATK')) stats.skillDmg += stats.coordDmg;
}
