// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolveSimulatedTeamRotation.js
// The team-level generalization of resolveSimulatedRotation.js — resolves what ONE team member
// (`targetName`) actually RECEIVES from a full multi-character rotation, not just their own kit in
// isolation. This is the piece PHASE2_PLAN.md's multi-character-interleaving pass deliberately left
// for "next": simulateTeamRotation()/buildTeamSteps() prove the TRIGGER conditions evaluate
// correctly across characters (Augusta's partner-outro-return chief among them), but nothing yet
// turns that into real per-character STAT totals the way resolveSimulatedRotation.js does for one
// character alone.
//
// Reuses timeWeightedAverageConcurrency() from resolveSimulatedRotation.js verbatim (exported from
// there specifically for this) — same stacking-mode window-building logic, generalized to integrate
// against an arbitrary RECIPIENT segment instead of always [0, totalTime]. That's the actual
// generalization this file adds: a block's effects can land on a DIFFERENT character than the one
// whose action triggered them (Augusta's own Intro cast opens a team-wide ATK+20% window; Yinlin, if
// she's on the team, receives it — the window is Augusta's, the recipient segment is Yinlin's own
// on-field span), matching calcTeamStats.js's overlapUptimeForSeg exactly: a buff's real uptime
// contribution is the fraction of its own active window that overlaps the RECIPIENT's own on-field
// segment, not the whole rotation.
//
// Scope of what's routed to `targetName`, by `target.scope`:
//   - 'self':          only from blocks whose `source` (owning character) IS targetName.
//   - 'whole-team':    from ANY block, applied to every team member (including its own source) —
//                       overlap is computed against targetName's own on-field segment.
//   - 'next-on-field': only from a block whose source is the team member IMMEDIATELY BEFORE
//                       targetName in team order (the character targetName's own on-field block
//                       comes right after) — matches how outro buffs already resolve everywhere
//                       else in this codebase (calcTeamStats.js's own outroStart()/'next' handling).
//   - anything else ('on-field', 'next-on-field' with no adjacency match, 'marked-enemy',
//     'all-enemies') simply doesn't match `targetName` and contributes nothing — not a gap, just out
//     of this function's scope (enemy-targeted debuffs are a different accumulator entirely, not
//     modeled here any more than resolveSimulatedRotation.js models them for one character).
// ═══════════════════════════════════════════════════════════════════════════════

import { createStats, applyBuff } from '../features/teams/calcEngine.js';
import { simulateTeamRotation, DEFAULT_STEP_SECONDS } from './rotationSimulator.js';
import { triggerFired, conditionHolds } from './triggerEngine.js';
import { buildBlockWindows, timeWeightedAverageConcurrency } from './blockWindows.js';
import { sequenceAllows } from './sequenceGating.js';
import { COORD_SNAPSHOT_DISCOUNT } from './coordinatedAtk.js';

/**
 * @param {Object[]} ownedSteps  Same shape buildTeamSteps()/simulateTeamRotation() take — each step
 *   carries an `owner` field.
 * @param {Object<string, import('./triggerBlocks.schema.js').TriggerBlock[]>} blocksByOwner
 * @param {string} targetName  The team member whose received stat totals to compute.
 * @param {Object} [opts]
 * @param {string} [opts.targetElementLower]
 * @param {string} [opts.targetRole]
 * @param {Object<string, number>} [opts.sequenceByOwner]  PHASE3_PLAN.md Stage 3: each team member's
 *   owned Resonance Chain sequence (0-6), keyed by name (same keys as `blocksByOwner`). A member
 *   missing from this map is NOT gated (every one of their blocks fires) — same no-gating-by-default
 *   backward compatibility as resolveHitComposedDps's own `sequence` param; omit the whole option to
 *   keep every existing caller's behavior unchanged.
 * @param {boolean} [opts.coordSnapshotDiscount]  PHASE3_PLAN.md Stage 3 item 4: pass `true` when
 *   `targetName` is an off-field Coordinated ATK character (legacy's own `isOffField` condition,
 *   calcTeamStats.js:1029: `dmgFocus.includes('Coordinated ATK') && dmgFocus.length <= 2`) to apply
 *   the same flat `COORD_SNAPSHOT_DISCOUNT` (0.6, see coordinatedAtk.js) legacy applies to buffs
 *   targeted 'next' — an off-field character doesn't actually receive a support's outro buff if that
 *   support swaps in AFTER them. Only `'next-on-field'`-scoped blocks are discounted; `'whole-team'`
 *   (continuous, swap-order-independent buffs like libBuffs) are left untouched, matching legacy's own
 *   distinction (calcTeamStats.js:1044-1052 discounts outro/Sonata-next buffs; :1081-1089's libBuffs
 *   loop has no discount at all). Omitting this (default `false`/falsy) does NOT discount anything —
 *   every existing caller's behavior stays byte-identical to before this option existed.
 * @returns {{
 *   stats: Object,
 *   totalMultBonus: number,
 *   perHitScopedBlockIds: string[],
 *   activity: Object,             // keyed by `${block.id}=>${targetName}` — diagnostic, used by tests
 *   targetSegment: {start:number, end:number} | null,
 * }}
 */
export function resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, targetName, opts = {}) {
  const { targetElementLower = null, targetRole = null, sequenceByOwner = null, coordSnapshotDiscount = false } = opts;
  const results = simulateTeamRotation(ownedSteps, blocksByOwner);
  const order = [...new Set(ownedSteps.map(s => s.owner))];

  // Each member's own real on-field segment, derived from the raw step list the same way
  // RotationSimulator.advance() accumulates time — NOT re-derived from `results[i].time` (which is
  // POST-advance for that one step) to avoid off-by-one drift; computed once, independently, in the
  // exact same units/convention calcTeamStats.js's own rotationTimeline.segments uses (start = swap-in
  // time, end = swap-out time).
  const segments = {};
  {
    let t = 0;
    for (const s of ownedSteps) {
      const before = t;
      t += s.stepSeconds ?? DEFAULT_STEP_SECONDS;
      const seg = segments[s.owner] ?? (segments[s.owner] = { start: before, end: t });
      seg.start = Math.min(seg.start, before);
      seg.end = Math.max(seg.end, t);
    }
  }
  const targetSegment = segments[targetName] || null;

  const stats = createStats();
  let totalMultBonus = 0;
  const perHitScopedBlockIds = [];
  const activity = {};
  if (!targetSegment) return { stats, totalMultBonus, perHitScopedBlockIds, activity, targetSegment: null };

  const allBlocks = Object.values(blocksByOwner).flat();

  for (const block of allBlocks) {
    if (block.kind !== 'buff' && block.kind !== 'debuff') continue;
    const blockOwner = block.source;
    const scope = block.target?.scope;
    const relevantToTarget =
      (scope === 'self' && blockOwner === targetName) ||
      scope === 'whole-team' ||
      (scope === 'next-on-field' && isImmediateNext(order, blockOwner, targetName));
    if (!relevantToTarget) continue;
    if (sequenceByOwner && Object.prototype.hasOwnProperty.call(sequenceByOwner, blockOwner) && !sequenceAllows(block, sequenceByOwner[blockOwner])) continue;

    // A block's OWN activation history only depends on ITS OWNER's steps — a target merely
    // RECEIVING it plays no part in whether/when it fires.
    const ownResults = results.filter(r => r.owner === blockOwner);

    if (block.trigger.type === 'passive') {
      if (!conditionHolds(block.condition, targetElementLower, targetRole)) continue;
      applyEffects(block, 1, stats, (v) => { totalMultBonus += v; });
      activity[`${block.id}=>${targetName}`] = { windows: [], avgMultiplier: 1 };
      continue;
    }

    const hasDuration = block.timing?.duration != null;
    if (!hasDuration) {
      const everFired = ownResults.some(r => !r.ineligibleBlockIds.has(block.id) && triggerFired(block.trigger, r.firedTriggers));
      if (everFired) perHitScopedBlockIds.push(block.id);
      continue;
    }

    const { windows, stackingMode, maxStacks } = buildBlockWindows(block, ownResults, targetElementLower, targetRole);
    if (!windows.length) continue;

    // Denominator is always the TARGET's own on-field segment — for a self-scoped block this is the
    // same as the block owner's own segment (relevantToTarget already required blockOwner ===
    // targetName), and for whole-team/next-on-field it's the RECIPIENT's segment, exactly matching
    // calcTeamStats.js's overlapUptimeForSeg semantics (uptime relative to the recipient's own
    // on-field window, not the buff owner's).
    let avgMultiplier = timeWeightedAverageConcurrency(windows, targetSegment, stackingMode === 'stacking' ? maxStacks : 1);
    // Only 'next-on-field' (legacy's swap-order-dependent outro/Sonata-next buffs) gets the snapshot
    // discount — 'whole-team' (continuous, order-independent buffs like libBuffs) never does, matching
    // legacy's own distinction exactly (see this option's own jsdoc above).
    if (coordSnapshotDiscount && scope === 'next-on-field') avgMultiplier *= COORD_SNAPSHOT_DISCOUNT;
    activity[`${block.id}=>${targetName}`] = { windows, avgMultiplier };
    applyEffects(block, avgMultiplier, stats, (v) => { totalMultBonus += v; });
  }

  return { stats, totalMultBonus, perHitScopedBlockIds, activity, targetSegment };
}

function isImmediateNext(order, ownerA, ownerB) {
  const i = order.indexOf(ownerA);
  return i >= 0 && order[i + 1] === ownerB;
}

function applyEffects(block, multiplier, stats, addTotalMult) {
  for (const effect of block.effects) {
    const value = effect.value * multiplier;
    if (effect.stat === 'totalMult') { addTotalMult(value); continue; }
    applyBuff(stats, effect.stat, value, {});
  }
}
