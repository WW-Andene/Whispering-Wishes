// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/triggers/energyCycleGating.js
// PHASE3_PLAN.md Stage 3, item 3: closes the "energy-cycle-gated Liberation uptime" gap from Stage 0's
// coverage table. calcEnergyCycles() (calcEngine.js:583-619) is already correct — it derives each
// character's real total ER from weapon/echo substats/set bonuses and compares it against a
// role-specific threshold to produce `libUptime` (1.0 once cleared, floored at 0.6 otherwise). The gap
// was never that formula; it's that resolveHitComposedDps/resolveHitComposedTeamDps had no concept of
// "this hit came from Liberation" to gate at all, so every Liberation-derived hit fired at full
// uptime regardless of the character's real ER investment.
//
// `libUptime` is now threaded straight through as an opt-in param (see resolveHitComposedDps.js's own
// jsdoc for why the resulting gate is MORE PRECISE than calcTeamStats.js's flat libShare heuristic,
// same "documented improvement" treatment Stage 3 item 1 established for Resonance Chain scope
// precision) — this file just adds the one small lookup helper both call sites need, mirroring
// sequenceGating.js's own no-gating-by-default convention (missing/absent factor => don't gate).
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @param {Object<string, {totalER: number, libUptime: number, energyCost: number}>|null} energyCycleFactors
 *   calcEnergyCycles() output, keyed by character name.
 * @param {string} name
 * @returns {number|null}  The character's real libUptime (0-1), or `null` if there's no factor for
 *   them (missing energyCycleFactors, or a name calcEnergyCycles() was never run against) — `null`
 *   means "don't gate", matching every other opt-in gating param in this engine.
 */
export function libUptimeOf(energyCycleFactors, name) {
  const factor = energyCycleFactors?.[name];
  return factor ? factor.libUptime : null;
}
