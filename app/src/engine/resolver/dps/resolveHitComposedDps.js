// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dps/resolveHitComposedDps.js
// [RESOLVER · DPS] Per-hit, single-character damage resolver.
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

import { calcAvgCrit, calcDmgBonus, calcDefMult, calcResMult, applyBuff, createStats } from '../../../features/teams/calcEngine.js';
import { simulateRotation } from './rotationSimulator.js';
import { triggerFired, conditionHolds } from '../gating/triggerEngine.js';
import { buildBlockWindows, activeCountAt } from '../gating/blockWindows.js';
import { cumulativeTieredValue } from '../gating/tieredStacking.js';
import { gateBlocksBySequence, filterExclusiveModeBlocks } from '../gating/sequenceGating.js';

/**
 * @param {import('./triggerBlocks.schema.js').TriggerBlock[]} blocks  One character's own block set.
 * @param {Object[]} steps  Real (or hand-built) rotation steps — same shape simulateRotation() takes.
 * @param {Object} enemyContext
 * @param {number} enemyContext.enemyDef  Enemy DEF at the relevant level.
 * @param {number} enemyContext.enemyRes  Enemy RES (%) to this character's element.
 * @param {number|{atk: number, hp?: number, def?: number}} baseStats  The character's own effective
 *   base stat(s) (before any %-buffs — those are applied per-hit from the point-in-time stat
 *   snapshot, same as calcTeamStats.js's own `mBase * (1 + atkPct/100)` pattern). A bare number is
 *   shorthand for `{atk: number}` — every hit is ATK-scaling unless its own block says otherwise via
 *   `damage.basis`/`proc.basis` (see triggerBlocks.schema.js's DamageHits doc — added for
 *   Shorekeeper's HP-scaling Discernment). Omitting `hp`/`def` when a block actually needs one
 *   throws rather than silently computing a wrong number off `undefined`.
 * @param {string} [targetElementLower]
 * @param {string} [targetRole]
 * @param {Object} [externalStats]  Gear-side stats (weapon pv, echo set bonuses) computed OUTSIDE
 *   this character's own TriggerBlocks — calcEngine.js's applyWeaponPv/applyFullEchoSet/applyEchoStats
 *   output, same shape as calcEngine.js's createStats(). Added into the flat baseline every instant
 *   starts from, alongside the character's own passive/buff blocks — this is how PHASE3_PLAN.md's
 *   Stage 0 finding ("gear stays composed around the engine, not ported into TriggerBlocks") is
 *   actually wired: without this, resolveHitComposedDps had no way to receive gear stats at all,
 *   silently computing kit-only numbers that could never match calcTeamStats.js's real, gear-inclusive
 *   ones. Omitting this param keeps every existing caller's behavior byte-identical (an empty/absent
 *   externalStats contributes exactly 0, same as before this param existed).
 * @param {number|null} [sequence]  PHASE3_PLAN.md Stage 3: the character's actually-owned Resonance
 *   Chain sequence level (0-6). Every `chain.sN` block requires its own numbered sequence to fire
 *   (derived from the id convention — see sequenceGating.js); everything else requires 0 (always
 *   available). Omitting this (default `null`) does NOT gate anything — every existing caller's
 *   behavior stays byte-identical to before this param existed (Stage 2 found this gap: chain blocks
 *   were firing unconditionally as if every character were fully R6-awakened). Pass an explicit 0-6
 *   to actually gate, matching calcTeamStats.js's own applyResonanceChain() semantics.
 * @param {number|null} [libUptime]  PHASE3_PLAN.md Stage 3 item 3: the character's real
 *   energy-cycle-gated Liberation uptime (0-1, from calcEnergyCycles()'s own `libUptime` field —
 *   1.0 once real ER investment clears the role's threshold, discounted down to a 0.6 floor
 *   otherwise). Only hits whose `damage.category`/`proc.category` is `'libDmg'` (i.e. actually
 *   Liberation-sourced, per each block's own category tag) get scaled by this — everything else is
 *   untouched. This is a MORE PRECISE gate than calcTeamStats.js's own `mult * (1 -
 *   libShare*(1-libUptime))` (calcTeamStats.js:973-978): legacy has no per-source damage split, so it
 *   approximates "the Liberation portion" as a flat 20%/35% share of the character's WHOLE totalMult;
 *   the engine already tracks each hit's real category, so it can discount exactly the
 *   Liberation-sourced hits instead of guessing a share of everything — same documented-improvement
 *   treatment Stage 3 item 1 already established for Resonance Chain's `target.scope` precision.
 *   Omitting this (default `null`) does NOT gate anything — every existing caller's behavior stays
 *   byte-identical to before this param existed.
 * @param {boolean} [cooldownSteadyState]  Root-caused during Stage 4 planning as the dominant
 *   still-unexplained factor behind the Stage 1 harness's roster-wide ~2x median ratio (see
 *   PHASE3_PLAN.md's Stage 4 kickoff section for the full investigation): `deriveStepsFromRotation`
 *   builds ONE non-repeating pass through a character's `CHARACTER_ROTATIONS`, and this function's
 *   `totalDamage / totalTime` implicitly assumes every hit in that pass repeats every `totalTime`
 *   seconds forever — true only for a hit whose own `timing.cooldown` is <= `totalTime`. A long-CD hit
 *   (Liberation nukes are typically 20-25s CD, routinely longer than a short combo's own ~9-20s pass
 *   length) gets counted at the pass's own cadence instead of its own real cooldown, over-crediting it
 *   by up to `cooldown/totalTime`. When `true`, every damage block with a `timing.cooldown` set has
 *   its damage scaled by `min(1, totalTime / cooldown)` — the steady-state fraction of "once per
 *   cooldown" actually sustainable within this pass's own length, not the pass's own (shorter,
 *   artificially inflating) firing cadence. Omitting this (default `false`) does NOT scale anything —
 *   every existing caller's behavior stays byte-identical to before this param existed.
 * @returns {{
 *   totalDamage: number,
 *   totalTime: number,
 *   dps: number,
 *   hitLog: {time: number, blockId: string, atkPct: number, damage: number, category: string}[],
 * }}
 */
export function resolveHitComposedDps(blocks, steps, enemyContext, baseStats, targetElementLower = null, targetRole = null, externalStats = null, sequence = null, libUptime = null, cooldownSteadyState = false, forcedStance = null) {
  const base = typeof baseStats === 'number' ? { atk: baseStats } : baseStats;
  blocks = filterExclusiveModeBlocks(gateBlocksBySequence(blocks, sequence), forcedStance);
  const results = simulateRotation(blocks, steps, forcedStance);
  const totalTime = results.length ? results[results.length - 1].time : 0;
  const { enemyDef, enemyRes } = enemyContext;

  // Pre-build every continuous-uptime buff/debuff block's window history ONCE (not per-hit) — the
  // same shared logic resolveSimulatedRotation.js uses, just queried per-instant instead of
  // integrated over the whole span.
  const buffBlocks = blocks.filter(b => (b.kind === 'buff' || b.kind === 'debuff') && b.timing?.duration != null && b.trigger.type !== 'passive');
  const buffWindows = buffBlocks.map(b => ({ block: b, ...buildBlockWindows(b, results, targetElementLower, targetRole) }));
  const passiveBlocks = blocks.filter(b => (b.kind === 'buff' || b.kind === 'debuff') && b.trigger.type === 'passive');
  // Fixed 2026-09-04: a `cast`-triggered buff/debuff with NO `timing.duration` (an instant, one-shot
  // "this cast's own DMG is boosted by X%" node — the most common shape for a flat Resonance Chain
  // stat bonus, e.g. Changli's S3 "Radiance of Fealty DMG +80%") fell into neither bucket above
  // (buffBlocks requires a real duration; passiveBlocks requires trigger.type 'passive') and was
  // silently never applied at all — found auditing Changli's S3, confirmed by removing the block
  // from her set and getting byte-identical damage. Scope check found 52 blocks across ~30 characters
  // sharing this exact shape (REMAINING_WORK.md has the full list). Each step's own `firedTriggers`
  // set is built fresh per step (not cumulative — see rotationSimulator.js's `simulateRotation`), so
  // "did THIS instant's own cast trigger this buff" is answered correctly by the same
  // triggerFired()/triggerKey() machinery every other trigger type already uses.
  const instantCastBuffBlocks = blocks.filter(b => (b.kind === 'buff' || b.kind === 'debuff') && b.trigger.type === 'cast' && b.timing?.duration == null);

  // externalStats is a pure DELTA (gear's own contribution only, cr/cd NOT pre-seeded with
  // BASE_CRIT_RATE/BASE_CRIT_DMG — createStats() below already supplies that baseline once per
  // instant) — see this function's own jsdoc above for why this exists and what shape it expects.
  const EXTERNAL_STAT_KEYS = ['atkPct', 'cr', 'cd', 'elemDmg', 'skillDmg', 'basicDmg', 'heavyDmg', 'libDmg', 'echoDmg', 'coordDmg', 'outroDmg', 'deepen', 'amplify', 'defShred', 'resShred', 'defIgnore'];
  // `hitBlockId` (Phase 0.5 gap #3, added 2026-09-02): the SPECIFIC damage block this stats snapshot is
  // being built for, so an effect carrying `scopedToBlockId` (e.g. Aemeath's "+300% Crit DMG for Heavy
  // ATK specifically") only contributes when it's actually THIS hit's own block, not every hit sharing
  // the same broader category. Omit (undefined) for a non-per-hit caller (none currently) — a scoped
  // effect simply never fires without a real hitBlockId to compare against.
  function statsAtInstant(instant, hitBlockId, firedTriggers) {
    const stats = createStats();
    if (externalStats) {
      for (const k of EXTERNAL_STAT_KEYS) { if (externalStats[k]) stats[k] += externalStats[k]; }
      // scopedEffects (added 2026-09-05, Aemeath's Between the Stars fix): a real, TEAM-composition-
      // dependent value (computed by the caller — e.g. calcTeamStats.js, which has blocksByOwner and
      // every teammate's resolved mode — neither of which a static per-character TriggerBlock file
      // can see) that still needs the SAME `scopedToBlockId` narrowing a block-native effect gets
      // (e.g. "+25% Finale-only DMG Amplified at max Between the Stars stacks" must NOT apply to her
      // other damage). Same {stat, value, scopedToBlockId} shape as a block's own Effect entries;
      // applied through the exact same applyBuff() call, just sourced externally instead of from
      // `block.effects`. Omit (undefined) for every existing caller — behavior unchanged for them.
      for (const se of externalStats.scopedEffects || []) {
        if (se.scopedToBlockId && se.scopedToBlockId !== hitBlockId) continue;
        applyBuff(stats, se.stat, se.value, { isAmplify: !!se.isAmplify });
      }
    }
    for (const pb of passiveBlocks) {
      if (!conditionHolds(pb.condition, targetElementLower, targetRole)) continue;
      applyEffects(pb, 1, stats, hitBlockId);
    }
    for (const { block, windows, stackingMode, maxStacks } of buffWindows) {
      const cap = stackingMode === 'stacking' ? maxStacks : 1;
      const count = activeCountAt(windows, instant, cap);
      if (count > 0) applyEffects(block, count, stats, hitBlockId);
    }
    if (firedTriggers) {
      for (const icb of instantCastBuffBlocks) {
        if (!triggerFired(icb.trigger, firedTriggers)) continue;
        if (!conditionHolds(icb.condition, targetElementLower, targetRole)) continue;
        applyEffects(icb, 1, stats, hitBlockId);
      }
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
      ? { block: b, hits: b.damage.hits, category: b.damage.category, basis: b.damage.basis || 'ATK', guaranteedCrit: !!b.damage.guaranteedCrit }
      : { block: b, hits: [{ atkPct: b.proc.atkPct }], category: b.proc.category, basis: 'ATK', guaranteedCrit: false });

  const hitLog = [];
  let totalDamage = 0;

  for (const r of results) {
    for (const { block: db, hits, category, basis, guaranteedCrit } of damageBlocks) {
      if (r.ineligibleBlockIds.has(db.id)) continue; // this specific cast is on cooldown
      if (!triggerFired(db.trigger, r.firedTriggers)) continue;
      if (!conditionHolds(db.condition, targetElementLower, targetRole)) continue;

      const stats = statsAtInstant(r.time, db.id, r.firedTriggers);
      const categoryStat = category ? stats[category] || 0 : 0; // which stat pool this cast's DMG Bonus draws from
      const dmgBonus = calcDmgBonus(stats.elemDmg, categoryStat, stats.amplify, stats.deepen);
      // A guaranteed-Crit hit (Shorekeeper's Discernment, per its own kit text) always lands at full
      // Crit — calcAvgCrit's expected-value blend would silently undercount it, same category of bug
      // as time-averaging a per-hit-scoped buff instead of applying it fully (see the file header).
      const avgCrit = guaranteedCrit ? 1 + stats.cd / 100 : calcAvgCrit(stats.cr, stats.cd);
      const defMult = calcDefMult(enemyDef, stats.defShred, stats.defIgnore);
      const resMult = calcResMult(enemyRes, stats.resShred);
      const baseStatKey = basis === 'HP' ? 'hp' : basis === 'DEF' ? 'def' : 'atk';
      if (base[baseStatKey] == null) {
        throw new Error(`resolveHitComposedDps: block '${db.id}' needs baseStats.${baseStatKey} (damage.basis: '${basis}'), but it wasn't provided.`);
      }
      // `atkPct` only scales ATK-basis hits — matches calcTeamStats.js's own convention (an HP/DEF
      // scaler only gets partial/no credit from an ATK% buff, since it's not their scaling stat; this
      // prototype doesn't track a separate hpPct/defPct accumulator at all yet, so an HP/DEF-basis
      // hit correctly gets none of `atkPct`'s contribution rather than the wrong full credit).
      // hpPct/defPct wired in 2026-09-05 (engine-readiness pass) — previously an HP/DEF-basis move
      // (Cartethyia/Shorekeeper/Suisui) got NO credit from any HP%/DEF% buff at all, since neither
      // stat existed on the accumulator; see calcEngine.js's createStats() for the same fix's other
      // half.
      const scalingPct = basis === 'ATK' ? stats.atkPct : basis === 'HP' ? stats.hpPct : basis === 'DEF' ? stats.defPct : 0;
      const effBase = base[baseStatKey] * (1 + scalingPct / 100);

      // Only Liberation-sourced hits (category === 'libDmg') are subject to the energy-cycle gate —
      // everything else ignores libUptime entirely, whether it's null or a real 0-1 value.
      const libGate = (libUptime != null && category === 'libDmg') ? libUptime : 1;
      // Steady-state cooldown gate — see this function's own jsdoc for cooldownSteadyState. Only
      // engages when the pass's own totalTime is SHORTER than the block's real cooldown (a block
      // whose cooldown already fits inside one pass is unaffected — cooldownGate stays 1).
      const cooldownGate = (cooldownSteadyState && db.timing?.cooldown && totalTime > 0)
        ? Math.min(1, totalTime / db.timing.cooldown) : 1;

      for (const hit of hits) {
        // `hit.flat` (Phase 0.5 gap #8, added 2026-09-02): a non-%ATK additive damage component some
        // real kit text carries alongside the %ATK term (e.g. Buling's "169 flat + 18.30% ATK") — WuWa's
        // own damage formula treats it as part of the base-damage term, subject to the same
        // crit/dmgBonus/defMult/resMult chain as the %ATK portion, not a separate standalone hit.
        // `stats.totalMult` (fixed 2026-09-02 — was previously silently skipped/dead in this resolver
        // entirely, see the engine-merge history (git log)'s totalMult architecture-bug writeup): a flat fallback
        // multiplier for real kit bonuses that don't map to a dedicated category stat (e.g. Qingxiao's
        // Mindlock deepen, kept on the ENEMY side as `deepen` — see her own block file for the
        // self-buff duplicate this also fixed) — applied as its own multiplicative factor on top of
        // the crit/dmgBonus/defMult/resMult chain, matching legacy calcTeamStats.js's own
        // `mult * (1 + seqTotalMultBonus/100)` pattern (the flat-tier totalMult% is itself always a
        // separate multiplicative factor from dmgBonus, never summed into it).
        const damage = (effBase * (hit.atkPct / 100) + (hit.flat || 0)) * avgCrit * dmgBonus * defMult * resMult * libGate * cooldownGate * (1 + stats.totalMult / 100);
        totalDamage += damage;
        hitLog.push({ time: r.time, blockId: db.id, atkPct: hit.atkPct, damage, category });
      }
    }
  }

  return { totalDamage, totalTime, dps: totalTime > 0 ? totalDamage / totalTime : 0, hitLog };
}

function applyEffects(block, multiplier, stats, hitBlockId) {
  // isAmplify (fixed 2026-09-05): WuWa's own Outro buffs are always "DMG Amplification" — a
  // separate multiplicative layer from self DMG Bonus — REGARDLESS of stat name or recipient,
  // exactly as legacyMainDpsStats.js's own pre-existing comment already documents and correctly
  // implements for the legacy path. The new engine never replicated this (every applyBuff() call
  // site here passed empty options), silently misrouting every one of the 53 characters' own
  // Outro-buff blocks into the wrong additive layer. `trigger.type === 'swap-out'` is exactly how
  // every character's own Outro buff is declared — see block.schema.js's Trigger doc.
  const isAmplify = block.trigger.type === 'swap-out';
  for (const effect of block.effects) {
    // `scopedToBlockId` (Phase 0.5 gap #3, added 2026-09-02): a buff narrower than a whole damage
    // category — e.g. Aemeath's "+300% Crit DMG for Heavy ATK specifically" — only contributes to the
    // ONE named block's own hits, not every hit sharing that block's broader damage category.
    if (effect.scopedToBlockId && effect.scopedToBlockId !== hitBlockId) continue;
    const value = effect.tiers ? cumulativeTieredValue(effect.tiers, multiplier) : effect.value * multiplier;
    applyBuff(stats, effect.stat, value, { isAmplify });
  }
}
