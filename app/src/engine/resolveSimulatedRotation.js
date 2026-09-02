// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolveSimulatedRotation.js
// The time-integration driver PHASE2_PLAN.md's stacking-mode gap actually needed.
//
// Every prior consumer of the engine (resolveTriggerBlocks(), called directly from a test) only
// ever answered "given ONE snapshot of firedTriggers, what stats result" — a single instant, not a
// timeline. That was enough to prove each trigger TYPE resolves correctly in isolation, but it has
// no way to answer "this buff re-triggered three times over a 40s simulated rotation — does it
// stack, refresh, or ignore the repeats?", because stacking-mode is fundamentally a question about
// behavior INTEGRATED OVER TIME, not about one instant. `STACKING_MODES` has been declared in
// triggerBlocks.schema.js and populated on real blocks (Rover: Electro's outro/selfbuff blocks
// specify `stacking: 'refresh'`; his Electro Flare debuff specifies `stacking: 'stacking'`) since
// the very first character conversion, without ever having a consumer that could enforce it.
//
// This module is that consumer. Given one character's block set and a REAL (or hand-built) step
// sequence, it:
//   1. Runs simulateRotation() to get the real per-step firedTriggers/ineligibleBlockIds/time.
//   2. For every 'buff'/'debuff' block with a real `timing.duration` (an actual continuous-uptime
//      effect, not a per-hit-scoped one — see the PER_HIT_SCOPED handling below), tracks every
//      activation window it opens across the WHOLE simulated timeline, honoring each effect's own
//      `stacking` mode: 'unique' ignores a re-trigger while a window is still open, 'refresh'
//      extends the open window's end instead of opening a second one, 'stacking' opens genuinely
//      concurrent windows (capped at `maxStacks` when the block's data specifies one).
//   3. Integrates each block's own window history against the full [0, totalTime] simulated span
//      using the SAME overlap-fraction arithmetic calcTeamStats.js's `overlapUptimeForSeg` already
//      uses for its own (single-instance) cross-character buff uptime — generalized here to sum
//      concurrent windows (for 'stacking') instead of a single 0/1 overlap fraction, since this
//      driver has to handle N possibly-overlapping instances of the same block where calcTeamStats
//      only ever had one. Same conceptual primitive, reused rather than reinvented; genuinely new
//      bookkeeping on top because nothing in either system previously had multiple instances of the
//      same buff to reconcile.
//   4. Produces one time-weighted average stat contribution per block/effect, applied through the
//      SAME applyBuff() switch every other part of this engine uses.
//
// Explicitly NOT handled here (see PER_HIT_SCOPED below): a 'cast'-triggered block with NO
// `timing.duration` (e.g. Shorekeeper's S6 — active for exactly the one Discernment hit, not a
// continuous window) represents a per-hit-scoped damage modifier, not a time-integrable uptime buff.
// Time-averaging a zero-duration event across a whole rotation would silently produce ~0% of its
// real value; treating it as always-on would silently produce 100% uptime it never has. Both are
// wrong in a different direction, so this driver deliberately does neither: it reports such blocks
// separately (`perHitScopedBlockIds`) instead of folding them into `stats`, honestly leaving "apply
// this to the one specific hit's damage" to the not-yet-built per-hit damage-application path (the
// same SKILL_MULTIPLIERS-per-hit migration PHASE2_PLAN.md already tracks as separate, larger work).
// ═══════════════════════════════════════════════════════════════════════════════

import { createStats, applyBuff } from '../features/teams/calcEngine.js';
import { simulateRotation } from './rotationSimulator.js';
import { triggerFired, conditionHolds } from './triggerEngine.js';
// buildBlockWindows is used for every continuous-uptime buff/debuff below (shared with
// resolveSimulatedTeamRotation.js, extracted 2026-09-01 so the two drivers can't silently drift
// apart on how 'unique'/'refresh'/'stacking' turn trigger firings into windows) — conditionHolds is
// still imported directly here too, for the passive-block branch's own single check.
import { buildBlockWindows, timeWeightedAverageConcurrency } from './blockWindows.js';
import { cumulativeTieredValue } from './tieredStacking.js';

/**
 * @param {import('./triggerBlocks.schema.js').TriggerBlock[]} blocks
 * @param {Object[]} steps  Same shape simulateRotation() takes (hand-built or from
 *   deriveStepsFromRotation()).
 * @param {Object} [opts]
 * @param {string} [opts.targetElementLower]  For condition.element gating — defaults to no
 *   element restriction if omitted (only matters for blocks with an explicit condition.element).
 * @param {string} [opts.targetRole]  For condition.requiresRole gating.
 * @returns {{
 *   stats: Object,               // createStats()-shaped accumulator with time-weighted contributions applied
 *   totalMultBonus: number,      // same totalMult accumulation resolveTriggerBlocks() returns
 *   totalTime: number,           // the simulated timeline's span, in seconds
 *   perHitScopedBlockIds: string[], // duration-less 'cast' blocks this driver deliberately did NOT apply — see file header
 *   activity: Object,            // { [blockId]: { windows: {start,end}[], avgMultiplier: number } } — diagnostic, used by tests
 * }}
 */
export function resolveSimulatedRotation(blocks, steps, opts = {}) {
  const { targetElementLower = null, targetRole = null } = opts;
  const results = simulateRotation(blocks, steps);
  const totalTime = results.length ? results[results.length - 1].time : 0;

  const stats = createStats();
  let totalMultBonus = 0;
  const perHitScopedBlockIds = [];
  const activity = {};

  for (const block of blocks) {
    if (block.kind !== 'buff' && block.kind !== 'debuff') continue;

    if (block.trigger.type === 'passive') {
      // Always-on once its condition holds — no window/time-integration needed, same single-shot
      // application resolveTriggerBlocks() already does correctly for these.
      if (!conditionHolds(block.condition, targetElementLower, targetRole)) continue;
      applyEffects(block, 1, stats, (v) => { totalMultBonus += v; });
      activity[block.id] = { windows: [], avgMultiplier: 1 };
      continue;
    }

    const hasDuration = block.timing?.duration != null;
    if (!hasDuration) {
      // A duration-less 'cast'-type (or similar) block is per-hit-scoped, not a continuous-uptime
      // buff — see file header for why this driver deliberately excludes it rather than guessing.
      // Only flag it if it could ever actually have fired in this run (matches something in
      // firedTriggers at least once) — a block that never triggers at all isn't a per-hit-scoped
      // gap, it's simply inactive this rotation, same as any other non-firing block.
      const everFired = results.some(r => !r.ineligibleBlockIds.has(block.id) && triggerFired(block.trigger, r.firedTriggers));
      if (everFired) perHitScopedBlockIds.push(block.id);
      continue;
    }

    // Real continuous-uptime buff/debuff — build its window history via the shared helper (also used
    // by resolveSimulatedTeamRotation.js, so the two drivers can't drift on this logic).
    const { windows, stackingMode, maxStacks } = buildBlockWindows(block, results, targetElementLower, targetRole);
    if (!windows.length) continue; // never triggered this rotation

    const avgMultiplier = timeWeightedAverageConcurrency(windows, { start: 0, end: totalTime }, stackingMode === 'stacking' ? maxStacks : 1);
    activity[block.id] = { windows, avgMultiplier };
    applyEffects(block, avgMultiplier, stats, (v) => { totalMultBonus += v; });
  }

  return { stats, totalMultBonus, totalTime, perHitScopedBlockIds, activity };
}

function applyEffects(block, multiplier, stats, addTotalMult) {
  for (const effect of block.effects) {
    const value = effect.tiers ? cumulativeTieredValue(effect.tiers, multiplier) : effect.value * multiplier;
    if (effect.stat === 'totalMult') { addTotalMult(value); continue; }
    applyBuff(stats, effect.stat, value, {});
  }
}

// Re-exported for backward compatibility — this function's real definition now lives in
// blockWindows.js (extracted 2026-09-01 alongside buildBlockWindows(), which this file's own
// window-building now delegates to). Existing importers of `timeWeightedAverageConcurrency` from
// THIS file (resolveSimulatedTeamRotation.js, this file's own test suite) keep working unchanged.
export { timeWeightedAverageConcurrency };
