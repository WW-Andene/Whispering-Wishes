// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolveHitComposedTeamDps.js
// The team-level generalization of resolveHitComposedDps.js — sums ONE team member's
// (`targetName`) real per-hit damage across a full multi-character rotation, with CROSS-CHARACTER
// buffs correctly landing on specific hits mid-combo (a whole-team ATK buff opened by a support
// character now only boosts the hits that land while it's actually active, not the target's whole
// rotation averaged). This is the piece both `resolveHitComposedDps.js`'s own file header and
// PHASE2_PLAN.md named as the natural next increment once single-character hit composition was
// trusted — built the same way `resolveSimulatedTeamRotation.js` generalized
// `resolveSimulatedRotation.js`: reusing the exact same `target.scope` routing rules
// (self/whole-team/next-on-field), just sampling at a hit's own instant instead of integrating over
// a segment.
//
// Only `targetName`'s OWN damage/proc blocks deal damage here — a block from another team member
// never contributes a hit to `targetName`'s total (only ITS buffs can reach them, via the same
// self/whole-team/next-on-field rules resolveSimulatedTeamRotation.js already established). This
// matches how the real game works: Augusta's own Thunderoar combo doesn't damage anything if Yinlin
// is the one actually on field.
// ═══════════════════════════════════════════════════════════════════════════════

import { calcAvgCrit, calcDmgBonus, calcDefMult, calcResMult, applyBuff, createStats } from '../features/teams/calcEngine.js';
import { simulateTeamRotation, DEFAULT_STEP_SECONDS } from './rotationSimulator.js';
import { triggerFired, conditionHolds } from './triggerEngine.js';
import { buildBlockWindows, activeCountAt } from './blockWindows.js';
import { COORD_SNAPSHOT_DISCOUNT } from './coordinatedAtk.js';

/**
 * @param {Object[]} ownedSteps  Same shape buildTeamSteps()/simulateTeamRotation() take.
 * @param {Object<string, import('./triggerBlocks.schema.js').TriggerBlock[]>} blocksByOwner
 * @param {string} targetName  The team member whose real hit-by-hit damage to compute.
 * @param {Object} enemyContext  { enemyDef, enemyRes } — same shape resolveHitComposedDps.js takes.
 * @param {number|{atk: number, hp?: number, def?: number}} baseStats  `targetName`'s own effective
 *   base stat(s) — same shorthand/error behavior as resolveHitComposedDps.js.
 * @param {Object} [opts]
 * @param {string} [opts.targetElementLower]
 * @param {string} [opts.targetRole]
 * @param {number|null} [opts.libUptime]  PHASE3_PLAN.md Stage 3 item 3: `targetName`'s real
 *   energy-cycle-gated Liberation uptime (0-1, from calcEnergyCycles()'s own `libUptime` field) —
 *   only THIS member's own `damage.category`/`proc.category === 'libDmg'` hits are scaled by it, same
 *   semantics as resolveHitComposedDps.js's own `libUptime` param (see its jsdoc for why this is a
 *   more precise gate than calcTeamStats.js's flat libShare heuristic). Omitting this (default `null`)
 *   does NOT gate anything.
 * @param {boolean} [opts.coordSnapshotDiscount]  PHASE3_PLAN.md Stage 3 item 4: pass `true` when
 *   `targetName` is an off-field Coordinated ATK character (legacy's `isOffField`, see
 *   coordinatedAtk.js's own file header and resolveSimulatedTeamRotation.js's identical option) to
 *   discount buffs `targetName` receives via `'next-on-field'` scope (swap-order-dependent outro
 *   buffs) by `COORD_SNAPSHOT_DISCOUNT` (0.6) — `'whole-team'` (order-independent) buffs are left
 *   untouched. Omitting this (default `false`) does NOT discount anything.
 * @returns {{
 *   totalDamage: number,
 *   targetSegment: {start:number, end:number} | null,
 *   dps: number,               // totalDamage / targetSegment's own duration — THIS character's own on-field DPS window, not the whole team rotation's length (a different denominator than resolveHitComposedDps.js's single-character totalTime, deliberately: a team member's DPS is conventionally measured against their own field time)
 *   hitLog: {time: number, blockId: string, atkPct: number, damage: number, category: string}[],
 * }}
 */
export function resolveHitComposedTeamDps(ownedSteps, blocksByOwner, targetName, enemyContext, baseStats, opts = {}) {
  const { targetElementLower = null, targetRole = null, libUptime = null, coordSnapshotDiscount = false } = opts;
  const base = typeof baseStats === 'number' ? { atk: baseStats } : baseStats;
  const { enemyDef, enemyRes } = enemyContext;

  const results = simulateTeamRotation(ownedSteps, blocksByOwner);
  const order = [...new Set(ownedSteps.map(s => s.owner))];

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
  if (!targetSegment) return { totalDamage: 0, targetSegment: null, dps: 0, hitLog: [] };

  const allBlocks = Object.values(blocksByOwner).flat();

  // Every buff/debuff block that can reach targetName — same routing rules as
  // resolveSimulatedTeamRotation.js, pre-built ONCE (not per-hit).
  const relevantBuffBlocks = allBlocks.filter(b => {
    if (b.kind !== 'buff' && b.kind !== 'debuff') return false;
    const scope = b.target?.scope;
    return (scope === 'self' && b.source === targetName)
      || scope === 'whole-team'
      || (scope === 'next-on-field' && isImmediateNext(order, b.source, targetName));
  });
  const passiveRelevant = relevantBuffBlocks.filter(b => b.trigger.type === 'passive');
  const windowedRelevant = relevantBuffBlocks
    .filter(b => b.trigger.type !== 'passive' && b.timing?.duration != null)
    .map(b => ({ block: b, ...buildBlockWindows(b, results.filter(r => r.owner === b.source), targetElementLower, targetRole) }));

  function statsAtInstant(instant) {
    const stats = createStats();
    for (const pb of passiveRelevant) {
      if (!conditionHolds(pb.condition, targetElementLower, targetRole)) continue;
      applyEffects(pb, 1, stats);
    }
    for (const { block, windows, stackingMode, maxStacks } of windowedRelevant) {
      const cap = stackingMode === 'stacking' ? maxStacks : 1;
      let count = activeCountAt(windows, instant, cap);
      // Same 'next-on-field'-only snapshot discount as resolveSimulatedTeamRotation.js — see this
      // function's own opts.coordSnapshotDiscount jsdoc above.
      if (coordSnapshotDiscount && block.target?.scope === 'next-on-field') count *= COORD_SNAPSHOT_DISCOUNT;
      if (count > 0) applyEffects(block, count, stats);
    }
    return stats;
  }

  // Only targetName's OWN damage/proc blocks deal damage — see file header.
  const damageBlocks = (blocksByOwner[targetName] || [])
    .filter(b => b.kind === 'damage' && (b.damage?.hits?.length || b.proc))
    .map(b => b.damage?.hits?.length
      ? { block: b, hits: b.damage.hits, category: b.damage.category, basis: b.damage.basis || 'ATK', guaranteedCrit: !!b.damage.guaranteedCrit }
      : { block: b, hits: [{ atkPct: b.proc.atkPct }], category: b.proc.category, basis: 'ATK', guaranteedCrit: false });

  const targetResults = results.filter(r => r.owner === targetName);
  const hitLog = [];
  let totalDamage = 0;

  for (const r of targetResults) {
    for (const { block: db, hits, category, basis, guaranteedCrit } of damageBlocks) {
      if (r.ineligibleBlockIds.has(db.id)) continue;
      if (!triggerFired(db.trigger, r.firedTriggers)) continue;
      if (!conditionHolds(db.condition, targetElementLower, targetRole)) continue;

      const stats = statsAtInstant(r.time);
      const categoryStat = category ? stats[category] || 0 : 0;
      const dmgBonus = calcDmgBonus(stats.elemDmg, categoryStat, stats.amplify, stats.deepen);
      const avgCrit = guaranteedCrit ? 1 + stats.cd / 100 : calcAvgCrit(stats.cr, stats.cd);
      const defMult = calcDefMult(enemyDef, stats.defShred, stats.defIgnore);
      const resMult = calcResMult(enemyRes, stats.resShred);
      const baseStatKey = basis === 'HP' ? 'hp' : basis === 'DEF' ? 'def' : 'atk';
      if (base[baseStatKey] == null) {
        throw new Error(`resolveHitComposedTeamDps: block '${db.id}' needs baseStats.${baseStatKey} (damage.basis: '${basis}'), but it wasn't provided.`);
      }
      const effBase = basis === 'ATK' ? base[baseStatKey] * (1 + stats.atkPct / 100) : base[baseStatKey];

      const libGate = (libUptime != null && category === 'libDmg') ? libUptime : 1;

      for (const hit of hits) {
        const damage = effBase * (hit.atkPct / 100) * avgCrit * dmgBonus * defMult * resMult * libGate;
        totalDamage += damage;
        hitLog.push({ time: r.time, blockId: db.id, atkPct: hit.atkPct, damage, category });
      }
    }
  }

  const fieldDuration = targetSegment.end - targetSegment.start;
  return { totalDamage, targetSegment, dps: fieldDuration > 0 ? totalDamage / fieldDuration : 0, hitLog };
}

function isImmediateNext(order, ownerA, ownerB) {
  const i = order.indexOf(ownerA);
  return i >= 0 && order[i + 1] === ownerB;
}

function applyEffects(block, multiplier, stats) {
  for (const effect of block.effects) {
    if (effect.stat === 'totalMult') continue; // no dedicated accumulator here yet, same as resolveHitComposedDps.js
    applyBuff(stats, effect.stat, effect.value * multiplier, {});
  }
}
