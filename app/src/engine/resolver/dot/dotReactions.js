// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dot/dotReactions.js
// [RESOLVER · DOT] Applies dotFormulas.js's math against a live team/rotation context.
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

import { calcResMult } from '../../../features/teams/calcEngine.js';
import {
  calcFrazzleDmg, calcErosionDmg, calcFusionBurstDmg, calcElectroFlareDmg,
} from './dotFormulas.js';
import { CHAR_BUFF_TABLE } from '../../../data/characters.js';
import { resolveElectroFlareFromBlocks, resolveFusionBurstFromBlocks, resolveErosionFromBlocks, resolveFrazzleFromBlocks } from './dotReactionsFromBlocks.js';
import { DEFAULT_STEP_SECONDS } from '../dps/rotationSimulator.js';

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
 * Composes calcEngine.js's four DOT-reaction functions around engine-derived inputs, matching
 * calcTeamStats.js's own per-reaction element routing exactly: each reaction's RES comes from the
 * enemy's RES to THAT reaction's fixed element (Frazzle=Spectro, Erosion=Havoc, Fusion Burst=Fusion,
 * Electro Flare=Electro), not the main damager's own element. Tune Break/Off-Tune (a fifth reaction
 * that used to be composed here too, using the caller's own `mainResMult` as its fallback since it
 * had no single canonical element) was removed entirely (2026-09-05, direct user instruction) — see
 * dotFormulas.js's own note for why. `mainResMult`/`energyCycleFactors` are kept as accepted-but-
 * unused params rather than reworking every call site's positional arguments for a param that may
 * be needed again by a future non-Tune-Break mechanic.
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
 * @param {number} mainResMult  Unused (see module doc above) — kept for call-site stability.
 * @param {Object|null} [energyCycleFactors]  Unused (see module doc above) — kept for call-site stability.
 * @param {Object<string, import('./triggerBlocks.schema.js').TriggerBlock[]>|null} [blocksByOwner]
 *   the engine-merge history (git log) Phase 2: each team member's own real TriggerBlocks, keyed by name — when
 *   supplied, migrated mechanics (Electro Flare so far) are resolved from real `dotApplier`-tagged
 *   blocks (`dotReactionsFromBlocks.js`) instead of `CHAR_BUFF_TABLE`'s flat fields. Omit only when
 *   blocks genuinely aren't available (falls back to the fully-legacy behavior for every mechanic).
 * @returns {{
 *   totalDmg: number,
 *   dps: number,
 *   breakdown: {frazzle: Object, erosion: Object, fusionBurst: Object, electroFlare: Object},
 * }}
 */
export function resolveDotReactionDps(members, rotTime, defMult, resShred, getEnemyRes, mainResMult, energyCycleFactors = null, blocksByOwner = null, stanceOverrides = null, rotationsByOwner = null) {
  const frazzleResMult = calcResMult(getEnemyRes('Spectro'), resShred);
  const erosionResMult = calcResMult(getEnemyRes('Havoc'), resShred);
  const fusionBurstResMult = calcResMult(getEnemyRes('Fusion'), resShred);
  const electroFlareResMult = calcResMult(getEnemyRes('Electro'), resShred);

  // Frazzle (the engine-merge history (git log) Phase 2 — Rover: Spectro migrated; Phoebe deliberately NOT migrated
  // — her own CHARACTER_ROTATIONS/block-file comments confirm her real modeled rotation stays in
  // Absolution mode, never Confession, meaning her legacy `debuffs.frazzle` value (18, explicitly
  // "in Confession mode") is inert/wrong for that same modeled scenario even on the LEGACY path today
  // — a pre-existing data bug this migration found but does NOT fix by porting it forward; her real
  // Absolution-mode Frazzle contribution — she does apply some, "1 stack" per Forte cast per her own
  // kit text — has no sourced aggregate total anywhere yet). Same mixed-migration safety check as
  // Erosion: only prefer blocks when every frazzle-flagged member present has a dotApplier block.
  const hasPhoebe = members.some(m => m.name === 'Phoebe');
  const frazzleFlaggedMembers = members.filter(m => CHAR_BUFF_TABLE[m.name]?.debuffs?.some(db => db.stat === 'frazzle'));
  const allFrazzleMembersHaveBlocks = blocksByOwner && frazzleFlaggedMembers.every(m =>
    (blocksByOwner[m.name] || []).some(b => b.dotApplier?.mechanic === 'frazzle'));
  const frazzle = allFrazzleMembersHaveBlocks
    ? resolveFrazzleFromBlocks(blocksByOwner, rotTime, defMult, frazzleResMult, hasPhoebe)
    : calcFrazzleDmg(members, rotTime, defMult, frazzleResMult);
  // Erosion (the engine-merge history (git log) Phase 2 — Ciaccona migrated; Cartethyia deliberately NOT migrated
  // yet — her legacy value (6) assumes an uncounted Rover: Aero teammate raising her effective stack
  // cap, a real conditional fact this migration won't blindly port without resolving it first). Unlike
  // Electro Flare/Fusion Burst (where every real applier in the roster is fully migrated, so the
  // blocks-only path is complete), Erosion is a MIXED migration state — switching wholesale to
  // block-only would silently make Cartethyia's real, still-legacy-only Erosion contribution
  // invisible whenever she's on a team. Only prefer blocks when every erosion-flagged member present
  // in THIS team is actually block-tagged; otherwise fall back to the full legacy path for everyone,
  // so a not-yet-migrated character is never silently dropped.
  const erosionFlaggedMembers = members.filter(m => CHAR_BUFF_TABLE[m.name]?.debuffs?.some(db => db.stat === 'erosion'));
  const allErosionMembersHaveBlocks = blocksByOwner && erosionFlaggedMembers.every(m =>
    (blocksByOwner[m.name] || []).some(b => b.dotApplier?.mechanic === 'erosion'));
  const erosion = allErosionMembersHaveBlocks
    ? resolveErosionFromBlocks(blocksByOwner, rotTime, defMult, erosionResMult)
    : calcErosionDmg(members, rotTime, defMult, erosionResMult);
  // Fusion Burst (the engine-merge history (git log) Phase 2 — Denia/Aemeath migrated): same block-preference
  // pattern as Electro Flare below, with one addition — `dotApplier.requiresStance` (Denia/Aemeath are
  // BOTH mode-conditional appliers, unlike Buling) is resolved via the SAME `winningStanceForOwner()`
  // this session already built and tested for their Tune Break exclusivity, not a second mechanism.
  // Their legacy `debuffs.fusionBurst` flags stay in place for `dotContributors` attribution, same
  // reasoning as Buling's kept `electroFlare` flag below.
  const fusionBurst = blocksByOwner
    ? resolveFusionBurstFromBlocks(blocksByOwner, rotTime, defMult, fusionBurstResMult, [], stanceOverrides, rotationsByOwner)
    : calcFusionBurstDmg(members, rotTime, defMult, fusionBurstResMult);
  // Electro Flare (the engine-merge history (git log) Phase 2, first migrated mechanic): prefer the TriggerBlock-
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
  const totalDmg = frazzle.dmg + erosion.dmg + fusionBurst.dmg + electroFlare.dmg;

  return {
    totalDmg,
    dps: rotTime > 0 ? totalDmg / rotTime : 0,
    // fusionBurstResMult exposed so calcTeamStats.js's own combinatorial mode-exclusivity resolution
    // (see its own comment) can recompute calcFusionBurstDmg for an arbitrary exclude-set without
    // re-deriving this RES lookup itself or importing calcEngine.js's calcResMult directly.
    fusionBurstResMult,
    breakdown: { frazzle, erosion, fusionBurst, electroFlare },
  };
}

/**
 * Recomputes the shared Fusion Burst reaction for a specific hypothesis (calcTeamStats.js's own
 * combinatorial mode resolver testing one combination) — a thin wrapper so that caller doesn't need to
 * import calcEngine.js's/dotReactionsFromBlocks.js's own functions directly or re-derive
 * fusionBurstResMult itself.
 * @param {Object[]} members
 * @param {number} rotTime
 * @param {number} defMult
 * @param {number} fusionBurstResMult  From resolveDotReactionDps()'s own return value.
 * @param {string[]} excludeNames  Legacy (CHAR_BUFF_TABLE-driven) candidates this hypothesis excludes.
 * @param {Object<string,import('./triggerBlocks.schema.js').TriggerBlock[]>|null} [blocksByOwner]
 *   the engine-merge history (git log) Phase 2: when supplied, prefers the block-based resolver.
 * @param {Object<string,string>|null} [stanceOverrides]  Block-based (migrated) candidates this
 *   hypothesis is testing — keyed by owner name, value is the stance being tried for THIS combination,
 *   overriding `winningStanceForOwner()`'s own single fixed answer (see `collectAppliers`'s own doc in
 *   dotReactionsFromBlocks.js for why the search needs this instead of the natural resolution).
 */
export function recomputeFusionBurstDmg(members, rotTime, defMult, fusionBurstResMult, excludeNames, blocksByOwner = null, stanceOverrides = null, rotationsByOwner = null) {
  return blocksByOwner
    ? resolveFusionBurstFromBlocks(blocksByOwner, rotTime, defMult, fusionBurstResMult, excludeNames, stanceOverrides, rotationsByOwner)
    : calcFusionBurstDmg(members, rotTime, defMult, fusionBurstResMult, excludeNames);
}
