// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/rotationOrder/rotationOrderSearch.js
// [RESOLVER · ROTATION-ORDER] Best on-field ordering search.
// PHASE3_PLAN.md Stage 3, item 5/5 (the final gap from Stage 0's coverage table): the engine currently
// assumes a GIVEN on-field order (buildTeamSteps() just concatenates whatever `members` array it's
// handed) — it never CHOOSES one. calcTeamStats.js does, via its own rotationTimeline IIFE
// (calcTeamStats.js:153-462): brute-force every permutation of supports (Main DPS always last — not
// up for debate, only which support leads/trails is), score each by how much cross-character buff
// value survives to the instant the Main DPS's own on-field window opens, and keep whichever ordering
// scores highest (ties keep the original heuristic order — team-wide-outro-first, strongest
// next-outro-value last).
//
// That chosen order isn't cosmetic: rotSegByName (calcTeamStats.js:475-476) — built straight from the
// SAME rotationTimeline this search produces — feeds overlapUptimeForSeg, which every cross-character
// buff-uptime calculation in the FULL tier reads (calcTeamStats.js:464-474's own comment: "a
// quantitative audit... found 43.5% [of cross-character buffs] collapse to exactly zero" once ordering
// is taken into account). So this is load-bearing for the real number, not just the Rotation Guide's
// display, and Stage 4's rewrite needs an engine-native equivalent before it can reproduce that.
//
// Reuses buildTeamSteps()/simulateTeamRotation() (already trusted, unchanged) for the actual
// simulation of each candidate order, and blockWindows.js's buildBlockWindows()/activeCountAt() (the
// same "was this buff live at this exact instant" primitive resolveHitComposedTeamDps.js already
// uses) for the scoring question — no new simulation machinery, just search + score on top of what
// Phase 2/3 already built.
// ═══════════════════════════════════════════════════════════════════════════════

import { buildTeamSteps, simulateTeamRotation, DEFAULT_STEP_SECONDS } from '../dps/rotationSimulator.js';
import { buildBlockWindows, activeCountAt } from '../gating/blockWindows.js';

/**
 * All orderings of `arr`, first-index-preserved as element 0 — same recursive shape
 * calcTeamStats.js's own `permutations()` uses (calcTeamStats.js:196-204), so index 0 is always the
 * original input order (the fallback/tie-break candidate).
 */
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) out.push([arr[i], ...p]);
  }
  return out;
}

/** Same start/end-accumulation convention every other engine file derives team segments with. */
function segmentsFromSteps(ownedSteps) {
  const segments = {};
  let t = 0;
  for (const s of ownedSteps) {
    const before = t;
    t += s.stepSeconds ?? DEFAULT_STEP_SECONDS;
    const seg = segments[s.owner] ?? (segments[s.owner] = { start: before, end: t });
    seg.start = Math.min(seg.start, before);
    seg.end = Math.max(seg.end, t);
  }
  return segments;
}

/**
 * calcTeamStats.js's own `scoreOrder()` (calcTeamStats.js:395-404), re-expressed against the engine's
 * real TriggerBlock windows instead of CHAR_BUFF_TABLE's flat buff list: sum the effect value of every
 * CROSS-CHARACTER (source !== mainDpsName), continuous (`timing.duration` set, non-passive),
 * team-reaching (`target.scope` 'whole-team' or 'next-on-field') block that's still active at the
 * instant mainDpsName's own on-field segment opens.
 */
function scoreOrder(ownedSteps, blocksByOwner, mainDpsName) {
  const segments = segmentsFromSteps(ownedSteps);
  const dpsSeg = segments[mainDpsName];
  if (!dpsSeg) return 0;
  const instant = dpsSeg.start + 0.05; // same epsilon calcTeamStats.js's scoreOrder uses

  const results = simulateTeamRotation(ownedSteps, blocksByOwner);
  const allBlocks = Object.values(blocksByOwner).flat();

  let score = 0;
  for (const block of allBlocks) {
    if (block.kind !== 'buff' && block.kind !== 'debuff') continue;
    if (block.source === mainDpsName) continue; // only cross-character handoffs count, same as legacy
    const scope = block.target?.scope;
    if (scope !== 'whole-team' && scope !== 'next-on-field') continue;
    if (block.timing?.duration == null || block.trigger.type === 'passive') continue;

    const ownResults = results.filter(r => r.owner === block.source);
    const { windows, stackingMode, maxStacks } = buildBlockWindows(block, ownResults);
    const cap = stackingMode === 'stacking' ? maxStacks : 1;
    if (activeCountAt(windows, instant, cap) > 0) {
      for (const effect of block.effects) score += Math.abs(effect.value || 0);
    }
  }
  return score;
}

/**
 * Chooses the on-field ordering that maximizes cross-character buff handoff into the Main DPS's own
 * window — the engine-native equivalent of calcTeamStats.js's rotationTimeline order-search.
 *
 * @param {Object[]} members  Same shape buildTeamSteps() takes: `{name, blocks, rotation,
 *   stepSeconds}[]`, in ANY order — this function does its own reordering, so the input order only
 *   matters as index 0's fallback/tie-break candidate (matching calcTeamStats.js's own
 *   sort-by-outro-type heuristic being index 0 of its permutations, not an arbitrary one).
 * @param {string} mainDpsName  Always placed last — Rule 1 from calcTeamStats.js's own rotationTimeline
 *   comment ("Main DPS goes LAST (receives all buffs stacked up before it)"), not up for search.
 * @returns {{
 *   order: string[],                     // chosen on-field order, by name
 *   ownedSteps: Object[],                // buildTeamSteps() output for the chosen order
 *   blocksByOwner: Object<string, Object[]>,
 *   score: number,
 * }|null}  `null` if `members` is empty or mainDpsName isn't present.
 */
export function chooseOnFieldOrder(members, mainDpsName) {
  const dpsMember = members.find(m => m.name === mainDpsName);
  if (!dpsMember) return null;
  const supports = members.filter(m => m.name !== mainDpsName);

  // Same factorial-blowup guard as calcTeamStats.js:389 (permutations only up to 3 supports — this
  // app's team size cap is 3 members, i.e. <=2 supports, so this never actually falls back in
  // practice, kept only so a future larger team size doesn't blow up silently).
  const candidateSupportOrders = supports.length <= 3 ? permutations(supports) : [supports];
  const candidateOrders = candidateSupportOrders.map(perm => [...perm, dpsMember]);

  let best = null;
  for (const order of candidateOrders) {
    const { ownedSteps, blocksByOwner } = buildTeamSteps(order);
    const score = scoreOrder(ownedSteps, blocksByOwner, mainDpsName);
    // Strictly-greater comparison: index 0 (the input/heuristic order) wins every tie, matching
    // calcTeamStats.js's own "idx 0 is always the original heuristic order... ties keep that
    // heuristic pick" comment (calcTeamStats.js:410-412).
    if (!best || score > best.score) best = { order: order.map(m => m.name), ownedSteps, blocksByOwner, score };
  }
  return best;
}
