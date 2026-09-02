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
 * @returns {{
 *   totalDmg: number,
 *   dps: number,
 *   tuneBreakDeepenMult: number,
 *   tuneBreakExclusiveCandidates: Object[],
 *   breakdown: {frazzle: Object, erosion: Object, fusionBurst: Object, electroFlare: Object, tuneBreak: Object},
 * }}
 */
export function resolveDotReactionDps(members, rotTime, defMult, resShred, getEnemyRes, mainResMult, energyCycleFactors = null) {
  const frazzleResMult = calcResMult(getEnemyRes('Spectro'), resShred);
  const erosionResMult = calcResMult(getEnemyRes('Havoc'), resShred);
  const fusionBurstResMult = calcResMult(getEnemyRes('Fusion'), resShred);
  const electroFlareResMult = calcResMult(getEnemyRes('Electro'), resShred);

  const frazzle = calcFrazzleDmg(members, rotTime, defMult, frazzleResMult);
  const erosion = calcErosionDmg(members, rotTime, defMult, erosionResMult);
  const fusionBurst = calcFusionBurstDmg(members, rotTime, defMult, fusionBurstResMult);
  const electroFlare = calcElectroFlareDmg(members, rotTime, defMult, electroFlareResMult);
  const tuneBreak = calcTuneBreakDmg(members, rotTime, defMult, mainResMult, energyCycleFactors);

  // Engine development.md item 9 (Aemeath's mode-exclusivity fix): a tuneBreak exclusive candidate
  // flagged competesWithFusionBurstReaction (Aemeath: her Rupture-mode Starburst proc vs her own
  // Fusion-Burst-mode status application, which is what actually feeds the shared fusionBurst reaction
  // above) needs to know what that reaction's total would be WITHOUT this member's own participation,
  // so calcTeamStats.js can compare real "keep the Fusion contribution" vs "swap it for Starburst"
  // totals — same real-total-comparison principle as the Rupture-vs-Strain resolution already does.
  const tuneBreakExclusiveCandidates = (tuneBreak.exclusiveCandidates || []).map(candidate => {
    const competesWithFusion = CHAR_BUFF_TABLE[candidate.name]?.tuneBreak?.competesWithFusionBurstReaction;
    if (!competesWithFusion) return candidate;
    const fusionWithoutMember = calcFusionBurstDmg(members, rotTime, defMult, fusionBurstResMult, [candidate.name]);
    return { ...candidate, fusionBurstDeltaIfExcluded: fusionBurst.dmg - fusionWithoutMember.dmg };
  });

  const totalDmg = frazzle.dmg + erosion.dmg + fusionBurst.dmg + electroFlare.dmg + tuneBreak.dmg;

  return {
    totalDmg,
    dps: rotTime > 0 ? totalDmg / rotTime : 0,
    tuneBreakDeepenMult: tuneBreak.deepenMult,
    tuneBreakExclusiveCandidates,
    breakdown: { frazzle, erosion, fusionBurst, electroFlare, tuneBreak },
  };
}
