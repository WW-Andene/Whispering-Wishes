// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dps/resolveHitComposedTeamDps.js
// [RESOLVER · DPS] Per-hit, whole-team damage resolver.
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

import { calcAvgCrit, calcDmgBonus, calcDefMult, calcResMult, applyBuff, createStats } from '../../../features/teams/calcEngine.js';
import { simulateTeamRotation, DEFAULT_STEP_SECONDS } from './rotationSimulator.js';
import { triggerFired, conditionHolds } from '../gating/triggerEngine.js';
import { buildBlockWindows, activeCountAt } from '../gating/blockWindows.js';
import { cumulativeTieredValue } from '../gating/tieredStacking.js';
import { COORD_SNAPSHOT_DISCOUNT } from '../gating/coordinatedAtk.js';

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
 * @param {boolean} [opts.cooldownSteadyState]  Same steady-state cooldown gate as
 *   resolveHitComposedDps.js's own `cooldownSteadyState` param (see its jsdoc for the full Stage 4
 *   root-cause writeup) — scales a damage block whose `timing.cooldown` exceeds `targetName`'s own
 *   on-field field duration by `min(1, fieldDuration / cooldown)`, so a long-CD nuke firing once in a
 *   short on-field window isn't credited as if it recurs every window. Omitting this (default `false`)
 *   does NOT scale anything.
 * @param {Object} [opts.externalStats]  PHASE3_PLAN.md Stage 4 step 2: `targetName`'s own gear-side
 *   stats (weapon pv, echo set bonuses, echo substat rolls) computed OUTSIDE their TriggerBlocks —
 *   same pure-DELTA shape and purpose as resolveHitComposedDps.js's own `externalStats` param (its
 *   own jsdoc has the full rationale: without this, gear can never reach the engine's team-level
 *   composition either, silently computing kit-only numbers). Folded into `targetName`'s own stat
 *   snapshot every instant, alongside their own blocks and whatever teammates' buffs route to them.
 *   Omitting this (default `null`) contributes nothing — every existing caller's behavior stays
 *   byte-identical to before this param existed.
 * @returns {{
 *   totalDamage: number,
 *   targetSegment: {start:number, end:number} | null,
 *   dps: number,               // totalDamage / targetSegment's own duration — THIS character's own on-field DPS window, not the whole team rotation's length (a different denominator than resolveHitComposedDps.js's single-character totalTime, deliberately: a team member's DPS is conventionally measured against their own field time)
 *   hitLog: {time: number, blockId: string, atkPct: number, damage: number, category: string}[],
 * }}
 */
export function resolveHitComposedTeamDps(ownedSteps, blocksByOwner, targetName, enemyContext, baseStats, opts = {}) {
  const { targetElementLower = null, targetRole = null, libUptime = null, coordSnapshotDiscount = false, cooldownSteadyState = false, externalStats = null } = opts;
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
  // resolveSimulatedTeamRotation.js, pre-built ONCE (not per-hit). `trigger-actor` (Engine
  // development.md item 9) is included here too: unlike every other scope, whether it actually
  // reaches targetName can't be pre-decided from the block alone — it depends on whether
  // targetName's OWN steps ever fire the block's named action, checked below when building windows.
  const relevantBuffBlocks = allBlocks.filter(b => {
    if (b.kind !== 'buff' && b.kind !== 'debuff') return false;
    const scope = b.target?.scope;
    return (scope === 'self' && b.source === targetName)
      || scope === 'whole-team'
      || scope === 'trigger-actor'
      || (scope === 'next-on-field' && isImmediateNext(order, b.source, targetName));
  });
  const passiveRelevant = relevantBuffBlocks.filter(b => b.trigger.type === 'passive');
  // recipientSwapOutAt (REMAINING_WORK.md 1a): targetSegment is targetName's OWN on-field segment
  // (already computed above) — for the one real shape this applies to ('next-on-field' blocks, whose
  // relevantToTarget check above already required blockOwner !== targetName), its `end` IS the
  // recipient's own swap-out instant. Passed unconditionally; buildBlockWindows() no-ops for any block
  // that doesn't declare timing.forfeitOnRecipientSwapOut.
  const windowedRelevant = relevantBuffBlocks
    .filter(b => b.trigger.type !== 'passive' && b.timing?.duration != null)
    .map(b => ({ block: b, ...buildBlockWindows(b, resultsForBlock(b, targetName, results), targetElementLower, targetRole, targetSegment.end) }));

  const EXTERNAL_STAT_KEYS = ['atkPct', 'cr', 'cd', 'elemDmg', 'skillDmg', 'basicDmg', 'heavyDmg', 'libDmg', 'echoDmg', 'coordDmg', 'outroDmg', 'deepen', 'amplify', 'defShred', 'resShred', 'defIgnore'];
  // `hitBlockId` (Phase 0.5 gap #3, added 2026-09-02) — see resolveHitComposedDps.js's own identical
  // comment for the full rationale: lets an effect's `scopedToBlockId` restrict its contribution to one
  // specific damage block instead of a whole category.
  function statsAtInstant(instant, hitBlockId) {
    const stats = createStats();
    if (externalStats) {
      for (const k of EXTERNAL_STAT_KEYS) { if (externalStats[k]) stats[k] += externalStats[k]; }
    }
    for (const pb of passiveRelevant) {
      if (!conditionHolds(pb.condition, targetElementLower, targetRole)) continue;
      applyEffects(pb, 1, stats, hitBlockId);
    }
    for (const { block, windows, stackingMode, maxStacks } of windowedRelevant) {
      const cap = stackingMode === 'stacking' ? maxStacks : 1;
      let count = activeCountAt(windows, instant, cap);
      // Same 'next-on-field'-only snapshot discount as resolveSimulatedTeamRotation.js — see this
      // function's own opts.coordSnapshotDiscount jsdoc above.
      if (coordSnapshotDiscount && block.target?.scope === 'next-on-field') count *= COORD_SNAPSHOT_DISCOUNT;
      if (count > 0) applyEffects(block, count, stats, hitBlockId);
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

  function pushHit(r, db, hits, category, basis, guaranteedCrit) {
    const stats = statsAtInstant(r.time, db.id);
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
    const fieldDuration = targetSegment.end - targetSegment.start;
    const cooldownGate = (cooldownSteadyState && db.timing?.cooldown && fieldDuration > 0)
      ? Math.min(1, fieldDuration / db.timing.cooldown) : 1;

    for (const hit of hits) {
      // `hit.flat` (Phase 0.5 gap #8, added 2026-09-02): a non-%ATK additive damage component some
      // real kit text carries alongside the %ATK term (e.g. Buling's "169 flat + 18.30% ATK") — WuWa's
      // own damage formula treats it as part of the base-damage term, subject to the same
      // crit/dmgBonus/defMult/resMult chain as the %ATK portion, not a separate standalone hit.
      // `stats.totalMult` (fixed 2026-09-02, same architecture-bug fix as resolveHitComposedDps.js —
      // see its own comment on this exact line for the full writeup): applied as its own
      // multiplicative factor, matching legacy calcTeamStats.js's `mult * (1 + seqTotalMultBonus/100)`
      // pattern.
      const damage = (effBase * (hit.atkPct / 100) + (hit.flat || 0)) * avgCrit * dmgBonus * defMult * resMult * libGate * cooldownGate * (1 + stats.totalMult / 100);
      totalDamage += damage;
      hitLog.push({ time: r.time, blockId: db.id, atkPct: hit.atkPct, damage, category });
    }
  }

  // Cantarella's Diffusion (REMAINING_WORK.md 1a): a `crossCharacterHit` windowed-proc damage block
  // still deals ITS OWN damage (credited to targetName, same as every other damage block — the file
  // header's "only targetName's own blocks deal damage" rule is unchanged), but the successful proc
  // that fires it can land on a STEP BELONGING TO A DIFFERENT TEAM MEMBER (rotationSimulator.js's own
  // cross-character advancement pass writes the fired key onto whichever step actually triggered it).
  // So this one damage-block shape needs to scan ALL team results for its fired key, not just
  // targetResults — every other damage block keeps the original owner-only scan below.
  for (const { block: db, hits, category, basis, guaranteedCrit } of damageBlocks) {
    if (db.trigger.type !== 'windowed-proc' || !db.trigger.crossCharacterHit) continue;
    for (const r of results) {
      if (r.ineligibleBlockIds.has(db.id)) continue;
      if (!triggerFired(db.trigger, r.firedTriggers)) continue;
      if (!conditionHolds(db.condition, targetElementLower, targetRole)) continue;
      pushHit(r, db, hits, category, basis, guaranteedCrit);
    }
  }

  for (const r of targetResults) {
    for (const { block: db, hits, category, basis, guaranteedCrit } of damageBlocks) {
      if (db.trigger.type === 'windowed-proc' && db.trigger.crossCharacterHit) continue; // handled above
      if (r.ineligibleBlockIds.has(db.id)) continue;
      if (!triggerFired(db.trigger, r.firedTriggers)) continue;
      if (!conditionHolds(db.condition, targetElementLower, targetRole)) continue;
      pushHit(r, db, hits, category, basis, guaranteedCrit);
    }
  }

  const fieldDuration = targetSegment.end - targetSegment.start;
  return { totalDamage, targetSegment, dps: fieldDuration > 0 ? totalDamage / fieldDuration : 0, hitLog };
}

function isImmediateNext(order, ownerA, ownerB) {
  const i = order.indexOf(ownerA);
  return i >= 0 && order[i + 1] === ownerB;
}

// the engine-architecture history (git log) item 9: which subset of `allResults` buildBlockWindows() should scan for
// a given buff block, from the perspective of computing targetName's own stats. Every existing
// scope keeps the pre-item-9 behavior (only the block's own owner's steps matter). The two new
// cases: an 'ally-action'-triggered block (whole-team/self/all-enemies target) can fire off ANY
// team member's step, so it needs the full cross-owner results list, not just its owner's; a
// 'trigger-actor'-targeted block reaches targetName specifically when TARGETNAME's own steps are
// the ones firing the action — so it's evaluated against targetName's own results, regardless of
// which character's kit the block itself belongs to.
function resultsForBlock(block, targetName, allResults) {
  if (block.target?.scope === 'trigger-actor') return allResults.filter(r => r.owner === targetName);
  if (block.trigger.type === 'ally-action') return allResults;
  return allResults.filter(r => r.owner === block.source);
}

function applyEffects(block, multiplier, stats, hitBlockId) {
  for (const effect of block.effects) {
    // `scopedToBlockId` (Phase 0.5 gap #3) — see resolveHitComposedDps.js's identical comment.
    if (effect.scopedToBlockId && effect.scopedToBlockId !== hitBlockId) continue;
    const value = effect.tiers ? cumulativeTieredValue(effect.tiers, multiplier) : effect.value * multiplier;
    applyBuff(stats, effect.stat, value, {});
  }
}
