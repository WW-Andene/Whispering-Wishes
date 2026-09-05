// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/math/damageFormula.js
// [MATH · DAMAGE-FORMULA] Pure, character-agnostic damage-formula math: the four
// multiplier terms every hit-composed damage calculation combines (defense,
// resistance, average-crit, and the 3-layer %DMG-bonus stack). No character data,
// no trigger logic — just the WuWa combat formula itself, sourced from the game's
// own documented mechanics.
//
// Layer: 2 (shared math primitives), engine rewrite. Formerly engine/shared/combatMath.js.
// ═══════════════════════════════════════════════════════════════════════════════

// ── [CONST · ATTACKER] Attacker-side constants the defense formula is derived from ──
export const ATTACKER_LEVEL = 90;
export const ATTACKER_FACTOR = 800 + 8 * ATTACKER_LEVEL; // 1520
export const BASE_CRIT_RATE = 5;
export const BASE_CRIT_DMG = 150;

/**
 * [FORMULA · DEFENSE] Target's effective defense multiplier, after Def Shred and Def Ignore.
 * @param {number} enemyDef    Target's raw DEF stat.
 * @param {number} defShred    % reduction to the target's DEF itself (stacks additively).
 * @param {number} defIgnore   % of the (already-shredded) DEF this hit ignores outright.
 * @returns {number} Multiplier in (0, 2], applied directly to outgoing damage.
 */
export function calcDefMult(enemyDef, defShred, defIgnore) {
  const reducedDef = enemyDef * Math.max(0, 1 - defShred / 100);
  const effectiveDef = reducedDef * Math.max(0, 1 - defIgnore / 100);
  return Math.min(2, ATTACKER_FACTOR / (ATTACKER_FACTOR + effectiveDef));
}

/**
 * [FORMULA · RESISTANCE] Target's elemental-resistance multiplier, after Res Shred.
 * Piecewise: negative effective RES amplifies damage, 0–80% follows a linear falloff,
 * and beyond 80% the WuWa formula switches to a diminishing-returns curve.
 * @param {number} baseRes  Target's base RES% for the attacking element.
 * @param {number} shred    RES Shred% applied to that element.
 * @returns {number} Multiplier applied directly to outgoing damage.
 */
export function calcResMult(baseRes, shred) {
  const totalRes = (baseRes - shred) / 100;
  if (totalRes < 0) return 1 - totalRes / 2;
  if (totalRes < 0.8) return 1 - totalRes;
  return 1 / (1 + 5 * totalRes);
}

/**
 * [FORMULA · CRIT] Expected-value crit multiplier — the average outcome across many hits,
 * not a single guaranteed-crit or guaranteed-non-crit instance (see block.schema.js's
 * DamageHits.guaranteedCrit for that case, resolved separately by the caller).
 * @param {number} cr  Crit Rate %, clamped to 100 (can't exceed a guaranteed crit).
 * @param {number} cd  Crit DMG %.
 */
export function calcAvgCrit(cr, cd) {
  return 1 + (Math.min(cr, 100) / 100) * (cd / 100 - 1);
}

/**
 * [FORMULA · DMG-BONUS] WuWa's 2-layer %DMG bonus stack: (elemental + move-type bonuses) add
 * together in layer 1, then Amplify multiplies as its own separate layer. "Deepen" was the same
 * real buff as Amplify under an older/alternate term, not a distinct third layer — merged into one
 * `amplify` accumulator (2026-09-05, direct user correction) rather than double-counting the same
 * buff as two independent multiplicative layers whenever a kit used one label and another buff on
 * the same hit used the other.
 * @param {number} elemDmg   Elemental DMG Bonus % (e.g. Aero DMG Bonus).
 * @param {number} skillDmg  Move-type DMG Bonus %, already collapsed onto one bucket
 *                           (see moveTypeRouting.js's collapseDmgTypeBuckets).
 * @param {number} amplify   Amplify DMG % (layer 2 — reaction amplification; includes what used
 *                           to be tracked separately as "Deepen").
 */
export function calcDmgBonus(elemDmg, skillDmg, amplify) {
  return (1 + (elemDmg + skillDmg) / 100) * (1 + amplify / 100);
}
