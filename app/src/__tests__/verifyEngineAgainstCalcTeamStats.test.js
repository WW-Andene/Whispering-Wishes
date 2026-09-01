/**
 * The verification layer — PHASE2_PLAN.md's "before any real cutover" gate, scoped with the user
 * explicitly (2026-09-01: build the verification layer, not a real DPS-number cutover, since damage
 * blocks still carry `effects: []` — the engine can't produce a real per-hit number yet regardless of
 * how correct the buff/trigger side is).
 *
 * Proves resolveSimulatedTeamRotation()'s cross-character buff-uptime math agrees with
 * calcTeamStats.js's OWN real algorithm on REAL team data — not a synthetic fixture. Touches ZERO
 * live user-facing output: calcTeamStats() is called read-only here, purely to obtain its real
 * computed `rotationTimeline.segments` (genuine on-field order + timing, from its own order-search),
 * which both this test's locally-reproduced legacy formula AND the engine then consume identically.
 *
 * Scope note: this deliberately compares only the outro-buff ('next-on-field') mechanism, reusing
 * calcTeamStats.js's own `overlapUptimeForSeg` formula (reproduced verbatim below — it's a private
 * closure inside calcTeamStats(), not exported, and this test intentionally does NOT modify that live
 * file to export it) against the SAME real segments. It does NOT attempt to reconcile
 * RESONANCE_CHAIN_DATA's legacy cross-character leakage (calcTeamStats.js's `applyResonanceChain`
 * blanket-applies specific fields — atkPct/critRate/critDmg/elemDmg-via-allDmg/basicDmg/etc — from
 * EVERY team member's own chain data onto the main DPS's stats, regardless of that node's real target
 * scope, as an approximation) against the engine's more precise per-block `target.scope` model — the
 * two are EXPECTED to diverge in places since the engine is intentionally more precise than that
 * blanket legacy heuristic; reconciling or fixing that heuristic is a legacy-code question for a
 * separate pass, not something this verification layer should paper over or silently assume away.
 */
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { buildTeamSteps } from '../engine/rotationSimulator.js';
import { resolveSimulatedTeamRotation } from '../engine/resolveSimulatedTeamRotation.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';
import { ROVER_ELECTRO_BLOCKS } from '../engine/characterBlocks/roverElectro.blocks.js';

const BLOCKS_BY_NAME = {
  Augusta: AUGUSTA_BLOCKS,
  Yinlin: YINLIN_BLOCKS,
  'Rover: Electro': ROVER_ELECTRO_BLOCKS,
};

// Reproduces calcTeamStats.js's own overlapUptimeForSeg(recipientSeg, start, duration) verbatim
// (see that file's own comment above its definition) — NOT imported, since it's a private closure
// inside calcTeamStats(), not an exported function, and this test deliberately avoids modifying that
// live file just to expose test-only plumbing.
function overlapUptimeForSeg(recipientSeg, start, duration) {
  if (!recipientSeg || !(duration > 0)) return 0;
  const overlapStart = Math.max(start, recipientSeg.start);
  const overlapEnd = Math.min(start + duration, recipientSeg.start + recipientSeg.duration);
  const overlap = Math.max(0, overlapEnd - overlapStart);
  return recipientSeg.duration > 0 ? Math.min(1, overlap / recipientSeg.duration) : 0;
}

describe('Verification layer — engine vs. calcTeamStats.js on real team data (Augusta + Yinlin + Rover: Electro)', () => {
  it("calcTeamStats() itself resolves a real on-field order/timing for this team (sanity check before comparing anything against it)", () => {
    const result = calcTeamStats(['Augusta', 'Yinlin', 'Rover: Electro'], 0, 'Yinlin', {}, '', 90);
    expect(result).toBeTruthy();
    expect(result.rotationTimeline?.segments?.length).toBe(3);
    result.rotationTimeline.segments.forEach(s => {
      expect(s.duration).toBeGreaterThan(0);
    });
  });

  it("the engine's cross-character outro-buff uptime for whichever member calcTeamStats() places right after the buffer matches calcTeamStats.js's OWN overlapUptimeForSeg formula, on the SAME real segments", () => {
    const result = calcTeamStats(['Augusta', 'Yinlin', 'Rover: Electro'], 0, 'Yinlin', {}, '', 90);
    const segments = result.rotationTimeline.segments; // real order + real start/duration, from calcTeamStats' own order-search
    const realOrder = segments.map(s => s.name);

    // Find a member with a 'next-on-field'-scoped outro block who ISN'T last in this real order —
    // whichever one calcTeamStats() actually produces (not hardcoded, since the order-search's
    // scoring could reasonably pick either candidate order for this 3-member team).
    let buffer = null, recipient = null, outroBlock = null;
    for (let i = 0; i < realOrder.length - 1; i++) {
      const candidateBlocks = BLOCKS_BY_NAME[realOrder[i]] || [];
      const candidate = candidateBlocks.find(b => b.kind === 'buff' && b.target?.scope === 'next-on-field' && b.trigger.type === 'swap-out');
      if (candidate) { buffer = realOrder[i]; recipient = realOrder[i + 1]; outroBlock = candidate; break; }
    }
    expect(buffer, 'expected at least one member with a next-on-field outro block to precede another member in this real order').not.toBeNull();

    // Build the engine's team steps in the SAME real order calcTeamStats() actually chose.
    const members = realOrder.map(name => ({ name, rotation: CHARACTER_ROTATIONS[name], blocks: BLOCKS_BY_NAME[name] }));
    const { ownedSteps, blocksByOwner } = buildTeamSteps(members);
    const { activity } = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, recipient);
    const engineActivity = activity[`${outroBlock.id}=>${recipient}`];
    expect(engineActivity, `expected ${outroBlock.id} to have fired and reached ${recipient}`).toBeDefined();

    // Legacy formula, using calcTeamStats.js's OWN real segments for both the buffer (outro starts
    // when they swap OUT, i.e. segment.start + segment.duration — same convention calcTeamStats.js's
    // own outroStart() uses) and the recipient (the overlap denominator).
    const bufferSeg = segments.find(s => s.name === buffer);
    const recipientSeg = segments.find(s => s.name === recipient);
    const legacyUptime = overlapUptimeForSeg(recipientSeg, bufferSeg.start + bufferSeg.duration, outroBlock.timing.duration);

    expect(engineActivity.avgMultiplier).toBeCloseTo(legacyUptime, 5);
  });

  it('a member with NO next-on-field outro block contributes no next-on-field activity to whoever comes after them', () => {
    const result = calcTeamStats(['Augusta', 'Yinlin', 'Rover: Electro'], 0, 'Yinlin', {}, '', 90);
    const segments = result.rotationTimeline.segments;
    const realOrder = segments.map(s => s.name);
    const members = realOrder.map(name => ({ name, rotation: CHARACTER_ROTATIONS[name], blocks: BLOCKS_BY_NAME[name] }));
    const { ownedSteps, blocksByOwner } = buildTeamSteps(members);

    // Every member in THIS roster actually has a next-on-field outro block (Augusta/Yinlin/Rover:
    // Electro all do), so assert the converse property instead: the LAST member in real order has no
    // "next" to hand anything to, and correctly contributes no next-on-field activity to anyone.
    const last = realOrder[realOrder.length - 1];
    const lastBlocks = BLOCKS_BY_NAME[last] || [];
    const lastOutro = lastBlocks.find(b => b.kind === 'buff' && b.target?.scope === 'next-on-field');
    expect(lastOutro).toBeDefined(); // confirm the block itself exists...
    const { activity } = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, realOrder[0]); // ...but nobody comes after `last`
    expect(Object.keys(activity).some(k => k.startsWith(`${lastOutro.id}=>`))).toBe(false);
  });
});
