// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolveHitComposedDps.js
// Stage 1 prototype for the "totalMult → hit-composed DPS" design doc (PHASE2_PLAN.md). Proves the
// architecture end-to-end for ONE character's own rotation, standalone — NOT wired into
// calcTeamStats.js, NOT yet extended to team-level cross-character buffs landing on the target
// mid-combo (that's the natural next increment, reusing resolveSimulatedTeamRotation.js's routing,
// once this single-character slice is trusted).
//
// Proc composition (Yinlin S6 Furious Thunder-style discrete extra hits, declared via a block's
// `proc` field instead of `damage.hits`) is handled too, added same day: a 'windowed-proc' block
// already resolves through the exact same triggerFired()/triggerKey() machinery every other trigger
// type uses (its key only lands in a step's firedTriggers on the specific step where
// RotationSimulator.tryProc() actually succeeded), so no new firing logic was needed — this file just
// needed to stop skipping blocks whose real number lives in `proc` instead of `damage`.
//
// Sums REAL per-hit damage (block.damage.hits, populated so far only for Yinlin — see her block
// file) across a full simulated rotation, instead of calcTeamStats.js's single flat
// `totalMult × avgCrit × dmgBonus × ...` multiplication. For each hit landing at a real simulated
// time T:
//   1. Query which buff/debuff blocks are ACTIVE at exactly T (not time-averaged — see
//      blockWindows.js's `activeCountAt`, the point-in-time counterpart to
//      `timeWeightedAverageConcurrency`) and fold their effects into a stat snapshot for that instant.
//   2. Apply the SAME formula shape calcTeamStats.js's own FULL tier already uses per character —
//      calcAvgCrit/calcDmgBonus/calcDefMult/calcResMult, calcEngine.js's existing, already-tested
//      primitives, reused verbatim — but evaluated per HIT instead of per CHARACTER.
//   3. Sum every hit's damage, divide by the rotation's total simulated time.
//
// This is intentionally MORE PRECISE than totalMult, not merely a different way to reach the same
// number — a buff active for only half a combo now actually only buffs half the combo's hits,
// instead of getting uptime-averaged across a single flat multiplier. See the design doc for why
// exact equality with the legacy number is explicitly the WRONG verification bar.
// ═══════════════════════════════════════════════════════════════════════════════

import { calcAvgCrit, calcDmgBonus, calcDefMult, calcResMult, applyBuff, createStats } from '../features/teams/calcEngine.js';
import { simulateRotation } from './rotationSimulator.js';
import { triggerFired, conditionHolds } from './triggerEngine.js';
import { buildBlockWindows, activeCountAt } from './blockWindows.js';

/**
 * @param {import('./triggerBlocks.schema.js').TriggerBlock[]} blocks  One character's own block set.
 * @param {Object[]} steps  Real (or hand-built) rotation steps — same shape simulateRotation() takes.
 * @param {Object} enemyContext
 * @param {number} enemyContext.enemyDef  Enemy DEF at the relevant level.
 * @param {number} enemyContext.enemyRes  Enemy RES (%) to this character's element.
 * @param {number} baseAtk  The character's own effective base ATK (before any atkPct buffs — those
 *   are applied per-hit from the point-in-time stat snapshot, same as calcTeamStats.js's own
 *   `mBase * (1 + atkPct/100)` pattern).
 * @param {string} [targetElementLower]
 * @param {string} [targetRole]
 * @returns {{
 *   totalDamage: number,
 *   totalTime: number,
 *   dps: number,
 *   hitLog: {time: number, blockId: string, atkPct: number, damage: number, category: string}[],
 * }}
 */
export function resolveHitComposedDps(blocks, steps, enemyContext, baseAtk, targetElementLower = null, targetRole = null) {
  const results = simulateRotation(blocks, steps);
  const totalTime = results.length ? results[results.length - 1].time : 0;
  const { enemyDef, enemyRes } = enemyContext;

  // Pre-build every continuous-uptime buff/debuff block's window history ONCE (not per-hit) — the
  // same shared logic resolveSimulatedRotation.js uses, just queried per-instant instead of
  // integrated over the whole span.
  const buffBlocks = blocks.filter(b => (b.kind === 'buff' || b.kind === 'debuff') && b.timing?.duration != null && b.trigger.type !== 'passive');
  const buffWindows = buffBlocks.map(b => ({ block: b, ...buildBlockWindows(b, results, targetElementLower, targetRole) }));
  const passiveBlocks = blocks.filter(b => (b.kind === 'buff' || b.kind === 'debuff') && b.trigger.type === 'passive');

  function statsAtInstant(instant) {
    const stats = createStats();
    for (const pb of passiveBlocks) {
      if (!conditionHolds(pb.condition, targetElementLower, targetRole)) continue;
      applyEffects(pb, 1, stats);
    }
    for (const { block, windows, stackingMode, maxStacks } of buffWindows) {
      const cap = stackingMode === 'stacking' ? maxStacks : 1;
      const count = activeCountAt(windows, instant, cap);
      if (count > 0) applyEffects(block, count, stats);
    }
    return stats;
  }

  // A block contributes real hits either via `damage.hits` (a normal cast's per-hit %ATK) or via
  // `proc` (a discrete extra-hit like Yinlin's S6 Furious Thunder — see triggerBlocks.schema.js's
  // Proc typedef). Both resolve through the exact SAME triggerFired()/triggerKey() machinery
  // already used for every other trigger type in this engine — a 'windowed-proc' block's trigger
  // key only appears in a step's `firedTriggers` on the specific step where
  // RotationSimulator.tryProc() actually succeeded, so no new firing logic is needed here at all;
  // this just needed to stop skipping blocks whose real number lives in `proc` instead of `damage`.
  const damageBlocks = blocks
    .filter(b => b.kind === 'damage' && (b.damage?.hits?.length || b.proc))
    .map(b => b.damage?.hits?.length
      ? { block: b, hits: b.damage.hits, category: b.damage.category }
      : { block: b, hits: [{ atkPct: b.proc.atkPct }], category: b.proc.category });

  const hitLog = [];
  let totalDamage = 0;

  for (const r of results) {
    for (const { block: db, hits, category } of damageBlocks) {
      if (r.ineligibleBlockIds.has(db.id)) continue; // this specific cast is on cooldown
      if (!triggerFired(db.trigger, r.firedTriggers)) continue;
      if (!conditionHolds(db.condition, targetElementLower, targetRole)) continue;

      const stats = statsAtInstant(r.time);
      const categoryStat = category ? stats[category] || 0 : 0; // which stat pool this cast's DMG Bonus draws from
      const dmgBonus = calcDmgBonus(stats.elemDmg, categoryStat, stats.amplify, stats.deepen);
      const avgCrit = calcAvgCrit(stats.cr, stats.cd);
      const defMult = calcDefMult(enemyDef, stats.defShred, stats.defIgnore);
      const resMult = calcResMult(enemyRes, stats.resShred);
      const effAtk = baseAtk * (1 + stats.atkPct / 100);

      for (const hit of hits) {
        const damage = effAtk * (hit.atkPct / 100) * avgCrit * dmgBonus * defMult * resMult;
        totalDamage += damage;
        hitLog.push({ time: r.time, blockId: db.id, atkPct: hit.atkPct, damage, category });
      }
    }
  }

  return { totalDamage, totalTime, dps: totalTime > 0 ? totalDamage / totalTime : 0, hitLog };
}

function applyEffects(block, multiplier, stats) {
  for (const effect of block.effects) {
    if (effect.stat === 'totalMult') continue; // no dedicated accumulator here yet — not needed for Stage 1's proof
    applyBuff(stats, effect.stat, effect.value * multiplier, {});
  }
}
