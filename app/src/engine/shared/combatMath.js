// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/shared/combatMath.js
// Pure, character-agnostic damage-formula math (defense/resistance/crit/dmg-bonus
// multipliers and the attacker-level constants they're derived from).
//
// Relocated from app/src/features/teams/calcEngine.js as part of the Phase 0
// structural cleanup (ENGINE_ARCHITECTURE_PROPOSAL.md v2 §2.1, "shared/combatMath.js").
// Byte-identical logic — a pure move, not a rewrite. calcEngine.js re-exports these
// names so every existing importer of calcDefMult/calcResMult/calcAvgCrit/calcDmgBonus/
// ATTACKER_FACTOR/etc. from calcEngine.js keeps working unchanged; new code should
// import directly from here.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Constants (named, not magic) ──
export const ATTACKER_LEVEL = 90;
export const ATTACKER_FACTOR = 800 + 8 * ATTACKER_LEVEL; // 1520
export const BASE_CRIT_RATE = 5;
export const BASE_CRIT_DMG = 150;

// ── Defense multiplier calculation ──
export function calcDefMult(enemyDef, defShred, defIgnore) {
  const reducedDef = enemyDef * Math.max(0, 1 - defShred / 100);
  const effectiveDef = reducedDef * Math.max(0, 1 - defIgnore / 100);
  return Math.min(2, ATTACKER_FACTOR / (ATTACKER_FACTOR + effectiveDef));
}

// ── Resistance multiplier calculation ──
export function calcResMult(baseRes, shred) {
  const totalRes = (baseRes - shred) / 100;
  if (totalRes < 0) return 1 - totalRes / 2;
  if (totalRes < 0.8) return 1 - totalRes;
  return 1 / (1 + 5 * totalRes);
}

// ── Average crit multiplier ──
export function calcAvgCrit(cr, cd) {
  return 1 + (Math.min(cr, 100) / 100) * (cd / 100 - 1);
}

// ── WuWa 3-layer DMG bonus formula ──
export function calcDmgBonus(elemDmg, skillDmg, amplify, deepen) {
  return (1 + (elemDmg + skillDmg) / 100) * (1 + amplify / 100) * (1 + deepen / 100);
}
