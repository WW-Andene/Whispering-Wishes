// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/tieredStacking.js
// the engine-merge history (git log) Phase 0.5 gap #1: a nonlinear/multi-tier per-stack curve (e.g. Qingxiao's
// Mindlock — first 7 stacks worth 7% each, remaining stacks worth 2% each) that `effects[].value ×
// count` (a single flat value per stack) can't represent losslessly — every such mechanic in the
// roster was previously kept as one flat number at the DOCUMENTED CEILING stack count, an
// approximation that's exactly right at that one stack count and wrong everywhere below it.
//
// `effects[].tiers` (added 2026-09-02) is the real fix: an ordered list of {count, value} tiers, each
// naming how many stacks at that tier and what each is worth. `cumulativeTieredValue()` below is the
// ONE shared function every resolver's own `applyEffects()` calls in place of `effect.value *
// multiplier` when `effect.tiers` is present — used identically for a discrete integer stack COUNT
// (resolveHitComposedDps.js/resolveHitComposedTeamDps.js's `activeCountAt()`) and a continuous
// fractional time-averaged concurrency (resolveSimulatedRotation.js/resolveSimulatedTeamRotation.js's
// `timeWeightedAverageConcurrency()`) — the same progressive-tier arithmetic is exactly piecewise-linear
// in its own `count` argument, so a fractional count (e.g. 2.35 average stacks) correctly interpolates
// between the exact integer-stack values on either side, rather than needing separate floor/frac logic.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @param {{count: number, value: number}[]} tiers  Ordered tiers, e.g. Qingxiao's Mindlock:
 *   `[{count: 7, value: 7}, {count: 8, value: 2}]` (first 7 stacks worth 7% each, next 8 worth 2%
 *   each — cap 15 total). Tiers are consumed in array order, each capped at its own `count`.
 * @param {number} stackCount  How many stacks are active — an integer for a real discrete count, or a
 *   real (fractional) number for a time-averaged concurrency.
 * @returns {number}  The real cumulative value at that many stacks (e.g. `cumulativeTieredValue(
 *   [{count:7,value:7},{count:8,value:2}], 15)` === 65 — matches Qingxiao's own dump-confirmed
 *   "7×7 + 8×2 = 65" at her 15-stack base-kit cap).
 */
export function cumulativeTieredValue(tiers, stackCount) {
  let remaining = stackCount;
  let total = 0;
  for (const tier of tiers) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, tier.count);
    total += take * tier.value;
    remaining -= take;
  }
  return total;
}
