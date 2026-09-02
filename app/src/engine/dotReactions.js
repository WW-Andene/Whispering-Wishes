// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/dotReactions.js
// PHASE3_PLAN.md Stage 3, item 2/5: closes the "DOT reactions have no engine model at all" gap from
// Stage 0's coverage table. Frazzle/Erosion/Fusion Burst/Electro Flare/Tune Break are ICD-aware,
// hand-verified-against-the-wiki mechanics that already live correctly in calcEngine.js
// (calcFrazzleDmg etc.) — porting their stack/tick math into TriggerBlocks would mean re-deriving
// already-correct formulas from scratch for no benefit. Per Stage 0's own conclusion for gear
// ("stays composed around the engine, not ported into TriggerBlocks"), this file applies the same
// treatment: it composes the existing calcEngine.js DOT functions using engine-derived inputs
// (rotation time from a real simulated team rotation, defMult/resMult from the engine's own
// calcDefMult/calcResMult), so Stage 4's rewrite can call one function instead of hand-wiring five,
// exactly mirroring calcTeamStats.js's own usage (calcTeamStats.js:941-953) rather than diverging
// from it.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  calcFrazzleDmg, calcErosionDmg, calcFusionBurstDmg, calcElectroFlareDmg, calcTuneBreakDmg,
  calcResMult,
} from '../features/teams/calcEngine.js';
import { CHAR_BUFF_TABLE } from '../data/characters.js';
import { resolveElectroFlareFromBlocks } from './dotReactionsFromBlocks.js';
import { DEFAULT_STEP_SECONDS } from './rotationSimulator.js';

/**
 * Derives the whole rotation's total simulated time from a team step list — the same
 * start/end-accumulation convention resolveSimulatedTeamRotation.js and
 * resolveHitComposedTeamDps.js already use per-member, generalized here to the full team span
 * (max end across every member's own segment).
 * @param {Object[]} ownedSteps  Same shape buildTeamSteps()/simulateTeamRotation() take.
 * @returns {number}
 */
export function rotTimeFromSteps(ownedSteps) {
  let t = 0;
  for (const s of ownedSteps) t += s.stepSeconds ?? DEFAULT_STEP_SECONDS;
  return t;
}

/**
 * Composes calcEngine.js's five DOT-reaction functions around engine-derived inputs, matching
 * calcTeamStats.js's own per-reaction element routing exactly: each reaction's RES comes from the
 * enemy's RES to THAT reaction's fixed element (Frazzle=Spectro, Erosion=Havoc, Fusion Burst=Fusion,
 * Electro Flare=Electro), not the main damager's own element — Tune Break has no single canonical
 * element (bespoke per-character mechanic) and keeps using the caller's own `mainResMult`, same as
 * calcTeamStats.js's `resMult` param to calcTuneBreakDmg.
 *
 * @param {Object[]} members  Same `mems` shape calcTeamStats.js passes to calcFrazzleDmg etc.
 * @param {number} rotTime  Rotation time to average against — pass rotTimeFromSteps(ownedSteps) for
 *   an engine-derived value, or reuse calcTeamStats.js's own rotTime for parity comparisons.
 * @param {number} defMult  From calcDefMult(enemyDef, defShred, defIgnore) — same defMult used for
 *   the team's own per-hit damage, reused here unchanged (DOT reactions aren't def-ignore-gated
 *   differently than normal hits).
 * @param {number} resShred
 * @param {(element: string) => number} getEnemyRes  Same enemy-RES lookup calcTeamStats.js uses
 *   (keyed by element name, e.g. 'Spectro'/'Havoc'/'Fusion'/'Electro').
 * @param {number} mainResMult  The main damager's own resMult — Tune Break's fallback per Stage 0.
 * @param {Object|null} [energyCycleFactors]  calcEnergyCycles() output, keyed by character name —
 *   only Tune Break's Mornye-specific ER-scaled amp reads this (see calcTuneBreakDmg's own comment).
 * @param {Object<string, import('./triggerBlocks.schema.js').TriggerBlock[]>|null} [blocksByOwner]
 *   ENGINE_MERGE_PLAN.md Phase 2: each team member's own real TriggerBlocks, keyed by name — when
 *   supplied, migrated mechanics (Electro Flare so far) are resolved from real `dotApplier`-tagged
 *   blocks (`dotReactionsFromBlocks.js`) instead of `CHAR_BUFF_TABLE`'s flat fields. Omit only when
 *   blocks genuinely aren't available (falls back to the fully-legacy behavior for every mechanic).
 * @returns {{
 *   totalDmg: number,
 *   dps: number,
 *   tuneBreakDeepenMult: number,
 *   tuneBreakExclusiveCandidates: Object[],
 *   breakdown: {frazzle: Object, erosion: Object, fusionBurst: Object, electroFlare: Object, tuneBreak: Object},
 * }}
 */
export function resolveDotReactionDps(members, rotTime, defMult, resShred, getEnemyRes, mainResMult, energyCycleFactors = null, blocksByOwner = null) {
  const frazzleResMult = calcResMult(getEnemyRes('Spectro'), resShred);
  const erosionResMult = calcResMult(getEnemyRes('Havoc'), resShred);
  const fusionBurstResMult = calcResMult(getEnemyRes('Fusion'), resShred);
  const electroFlareResMult = calcResMult(getEnemyRes('Electro'), resShred);

  const frazzle = calcFrazzleDmg(members, rotTime, defMult, frazzleResMult);
  const erosion = calcErosionDmg(members, rotTime, defMult, erosionResMult);
  const fusionBurst = calcFusionBurstDmg(members, rotTime, defMult, fusionBurstResMult);
  // Electro Flare (ENGINE_MERGE_PLAN.md Phase 2, first migrated mechanic): prefer the TriggerBlock-
  // native resolver when blocksByOwner is available (real production callers always have it by the
  // time DOT reactions are resolved) — parity with the legacy formula proven in
  // dotReactionsFromBlocks.test.js. Buling's CHAR_BUFF_TABLE.electroFlare flag is DELIBERATELY still
  // kept (not retired) — calcTeamStats.js's own `dotContributors` filter still reads it to decide who
  // gets a share of the DOT total in the per-member damage BREAKDOWN display, a separate concern from
  // which formula computes the total itself; removing it would silently drop her from that attribution
  // even though her real damage is still correctly counted in the total. Legacy calcElectroFlareDmg()
  // stays only as the fallback for a caller that genuinely can't supply blocksByOwner (this file's own
  // dotReactions.test.js, proving the OLD behavior still works standalone).
  const electroFlare = blocksByOwner
    ? resolveElectroFlareFromBlocks(blocksByOwner, rotTime, defMult, electroFlareResMult)
    : calcElectroFlareDmg(members, rotTime, defMult, electroFlareResMult);
  const tuneBreak = calcTuneBreakDmg(members, rotTime, defMult, mainResMult, energyCycleFactors);

  // Engine development.md item 9 (Aemeath's mode-exclusivity fix): flag which exclusive candidates
  // compete with the shared fusionBurst reaction above — calcTeamStats.js needs this to run its own
  // proper combinatorial resolution (see its own comment for why a single marginal "delta if excluded"
  // number, tried first, was NOT sound once a SECOND competing member — Denia — existed: excluding one
  // of two co-appliers from a reaction that only needs ONE of them to stay active reads as zero
  // marginal cost, which is a real artifact of the boolean gate, not a meaningful signal on its own).
  const tuneBreakExclusiveCandidates = (tuneBreak.exclusiveCandidates || []).map(candidate => ({
    ...candidate,
    competesWithFusionBurstReaction: !!CHAR_BUFF_TABLE[candidate.name]?.tuneBreak?.competesWithFusionBurstReaction,
  }));

  const totalDmg = frazzle.dmg + erosion.dmg + fusionBurst.dmg + electroFlare.dmg + tuneBreak.dmg;

  return {
    totalDmg,
    dps: rotTime > 0 ? totalDmg / rotTime : 0,
    tuneBreakDeepenMult: tuneBreak.deepenMult,
    tuneBreakExclusiveCandidates,
    // fusionBurstResMult exposed so calcTeamStats.js's own combinatorial mode-exclusivity resolution
    // (see its own comment) can recompute calcFusionBurstDmg for an arbitrary exclude-set without
    // re-deriving this RES lookup itself or importing calcEngine.js's calcResMult directly.
    fusionBurstResMult,
    breakdown: { frazzle, erosion, fusionBurst, electroFlare, tuneBreak },
  };
}

/**
 * Recomputes the shared Fusion Burst reaction for a specific exclude-set — a thin wrapper so callers
 * outside this file (calcTeamStats.js's combinatorial mode-exclusivity resolution) don't need to
 * import calcEngine.js's calcFusionBurstDmg directly or re-derive fusionBurstResMult themselves.
 * @param {Object[]} members
 * @param {number} rotTime
 * @param {number} defMult
 * @param {number} fusionBurstResMult  From resolveDotReactionDps()'s own return value.
 * @param {string[]} excludeNames
 */
export function recomputeFusionBurstDmg(members, rotTime, defMult, fusionBurstResMult, excludeNames) {
  return calcFusionBurstDmg(members, rotTime, defMult, fusionBurstResMult, excludeNames);
}
