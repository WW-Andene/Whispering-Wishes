// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/gating/blockWindows.js
// [RESOLVER · GATING] Block activation-window builder.
// The shared "build one block's activation-window history from a set of simulateRotation()/
// simulateTeamRotation() results" logic — extracted 2026-09-01 (previously duplicated near-verbatim
// inside resolveSimulatedRotation.js and resolveSimulatedTeamRotation.js) so there's exactly ONE
// place that knows how 'unique'/'refresh'/'stacking' turn a sequence of trigger firings into a
// window list, not two copies that could silently drift apart.
//
// A block's window HISTORY is reusable across different consumers that each ask a different
// question about it: `timeWeightedAverageConcurrency()` (resolveSimulatedRotation.js) integrates it
// over a whole segment to get a time-weighted average uptime — the right question for a continuous
// buff's contribution to an averaged stat total. `activeCountAt()` (added alongside this file, for
// the hit-composed DPS prototype — see PHASE2_PLAN.md's "totalMult -> hit-composed DPS" design doc)
// instead samples a single instant — the right question for "was this buff live for THIS specific
// hit," which a time-averaged fraction cannot answer on its own.
// ═══════════════════════════════════════════════════════════════════════════════

import { triggerFired, conditionHolds } from './triggerEngine.js';

/**
 * @param {import('./triggerBlocks.schema.js').TriggerBlock} block  Must have a real `timing.duration`
 *   — this function is only meaningful for continuous-uptime buff/debuff blocks, not passive
 *   (always-on, no window needed) or duration-less per-hit-scoped ones (see resolveSimulatedRotation.js's
 *   own file header for why those two cases are handled separately by callers, not here).
 * @param {{firedTriggers: Set<string>, ineligibleBlockIds: Set<string>, actionTags: Set<string>, time: number}[]} ownResults
 *   The subset of simulateRotation()/simulateTeamRotation() results relevant to this block — for a
 *   single-character driver, every result; for a team driver, only the results belonging to this
 *   block's own owner (a block's activation history only depends on its OWNER's steps) — EXCEPT for
 *   a `trigger.type: 'ally-action'` block (the engine-architecture history (git log) item 9), which is the one case that
 *   deliberately breaks this rule: pass the FULL, all-owners results list for those, since the
 *   trigger can fire off ANY team member's step, not just this block's own owner's.
 * @param {string} [targetElementLower]
 * @param {string} [targetRole]
 * @param {number|null} [recipientSwapOutAt]  REMAINING_WORK.md 1a — early-forfeit-on-swap: when
 *   `block.timing.forfeitOnRecipientSwapOut` is true and this is a real number (the RECIPIENT's own
 *   on-field segment end, i.e. their swap-out time), every window this function builds is clamped to
 *   end no later than this instant, even if `duration` would otherwise carry it further. Ignored for
 *   any block without the flag, and ignored when null (every existing caller's behavior is unchanged
 *   by adding this param — it defaults to not clamping anything).
 * @returns {{windows: {start:number, end:number}[], stackingMode: string, maxStacks: number}}
 */
export function buildBlockWindows(block, ownResults, targetElementLower = null, targetRole = null, recipientSwapOutAt = null) {
  const stackingMode = block.effects[0]?.stacking || 'unique';
  const maxStacks = block.effects[0]?.maxStacks ?? Infinity;
  const windows = [];
  let lastWindow = null;

  for (const r of ownResults) {
    if (r.ineligibleBlockIds.has(block.id)) continue; // cooldown-gated this step
    // 'ally-action' blocks are keyed by a cross-character status tag (r.actionTags), not the normal
    // owner-scoped firedTriggers Set every other trigger type uses — see this function's own
    // ownResults doc above for why callers must pass the full results list for these.
    if (block.trigger.type === 'ally-action') {
      if (!r.actionTags?.has(block.trigger.action)) continue;
    } else if (!triggerFired(block.trigger, r.firedTriggers)) continue;
    if (!conditionHolds(block.condition, targetElementLower, targetRole)) continue;

    const now = r.time;
    const duration = block.timing.duration;
    if (stackingMode === 'stacking') {
      const w = { start: now, end: now + duration };
      windows.push(w);
      lastWindow = w;
    } else if (stackingMode === 'refresh') {
      if (lastWindow && now < lastWindow.end) {
        lastWindow.end = now + duration; // extend in place, don't open a second window
      } else {
        const w = { start: now, end: now + duration };
        windows.push(w);
        lastWindow = w;
      }
    } else {
      // 'unique' (default): a re-trigger while still active is a genuine no-op.
      if (!lastWindow || now >= lastWindow.end) {
        const w = { start: now, end: now + duration };
        windows.push(w);
        lastWindow = w;
      }
    }
  }

  // Early-forfeit-on-swap (REMAINING_WORK.md 1a): clamp every window's end to the recipient's own
  // swap-out instant, when this block declares it and a real clamp instant was supplied — see this
  // function's own recipientSwapOutAt doc above for the full rationale/simplifying-assumption note.
  // Math.max(w.start, ...) guards against a degenerate negative-length window (shouldn't happen in
  // practice — these buffs always open at/after the recipient's own swap-in — but stays safe either
  // way); zero-length windows are filtered out entirely rather than passed through as a no-op entry.
  if (block.timing?.forfeitOnRecipientSwapOut && recipientSwapOutAt != null) {
    return {
      windows: windows
        .map(w => ({ start: w.start, end: Math.max(w.start, Math.min(w.end, recipientSwapOutAt)) }))
        .filter(w => w.end > w.start),
      stackingMode,
      maxStacks,
    };
  }

  return { windows, stackingMode, maxStacks };
}

/**
 * Generalizes calcTeamStats.js's overlapUptimeForSeg — see resolveSimulatedRotation.js's own doc for
 * the full reasoning. Exported from here (rather than resolveSimulatedRotation.js) now that the
 * window-building it operates on lives here too.
 */
export function timeWeightedAverageConcurrency(windows, seg, cap) {
  if (!seg || !(seg.end > seg.start)) return 0;
  const segLen = seg.end - seg.start;
  const clamped = windows.map(w => ({ start: Math.max(seg.start, w.start), end: Math.min(seg.end, w.end) })).filter(w => w.end > w.start);
  if (!clamped.length) return 0;
  const boundaries = [...new Set([seg.start, seg.end, ...clamped.flatMap(w => [w.start, w.end])])].sort((a, b) => a - b);
  let area = 0;
  for (let i = 0; i < boundaries.length - 1; i++) {
    const t0 = boundaries[i], t1 = boundaries[i + 1];
    if (t1 <= t0) continue;
    const mid = (t0 + t1) / 2;
    const count = clamped.filter(w => w.start <= mid && mid < w.end).length;
    area += Math.min(count, cap) * (t1 - t0);
  }
  return area / segLen;
}

/**
 * The NEW query the hit-composed DPS prototype needs: how many of this block's windows are active
 * at one specific instant (not integrated over a span) — capped at `cap` (a 'stacking' block's real
 * max concurrent count; pass Infinity, the default, for 'unique'/'refresh' where the caller should
 * clamp to 1 itself if needed, matching timeWeightedAverageConcurrency's own calling convention).
 */
export function activeCountAt(windows, instant, cap = Infinity) {
  const count = windows.filter(w => w.start <= instant && instant < w.end).length;
  return Math.min(count, cap);
}
