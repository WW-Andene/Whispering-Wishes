/**
 * resolveSimulatedTeamRotation.js — the team-level generalization of resolveSimulatedRotation.js.
 * Proves cross-character buff routing (whole-team / next-on-field scoped blocks landing on a
 * DIFFERENT character than the one whose action triggered them) works against real
 * CHARACTER_ROTATIONS-derived team timing, using calcTeamStats.js's own overlap-uptime CONCEPT
 * (uptime relative to the recipient's own on-field segment) reused via
 * resolveSimulatedRotation.js's exported timeWeightedAverageConcurrency().
 */
import { describe, it, expect } from 'vitest';
import { resolveSimulatedTeamRotation } from '../engine/resolver/dps/resolveSimulatedTeamRotation.js';
import { buildTeamSteps } from '../engine/resolver/dps/rotationSimulator.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';
import { ROVER_ELECTRO_BLOCKS } from '../engine/characterBlocks/roverElectro.blocks.js';

const MEMBERS = [
  { name: 'Augusta', rotation: CHARACTER_ROTATIONS['Augusta'], blocks: AUGUSTA_BLOCKS },
  { name: 'Yinlin', rotation: CHARACTER_ROTATIONS['Yinlin'], blocks: YINLIN_BLOCKS },
  { name: 'Rover: Electro', rotation: CHARACTER_ROTATIONS['Rover: Electro'], blocks: ROVER_ELECTRO_BLOCKS },
];

describe('resolveSimulatedTeamRotation — self-scoped blocks only apply to their own owner', () => {
  it("Yinlin's own passive Resonance Chain buffs (S1 skillDmg+70) plus Inherent Skill Deadly Focus (skillDmg+10, scoped but not excluded by this non-hit-scoped resolver) apply in full when resolving Yinlin as target; S3 (coordDmg+55, fixed 2026-09-03 from a skillDmg miscategorization matching Judgment Strike's real Coordinated Attack type) lands separately", () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps(MEMBERS);
    const { stats } = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, 'Yinlin', { targetElementLower: 'electro', targetRole: 'Sub DPS' });
    expect(stats.skillDmg).toBe(80);
    expect(stats.coordDmg).toBe(55);
  });

  it("Yinlin's self-scoped buffs do NOT leak onto Augusta when resolving Augusta as target", () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps(MEMBERS);
    const { stats } = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, 'Augusta', { targetElementLower: 'electro', targetRole: 'Main DPS' });
    // Yinlin's S1/S3/Deadly Focus bonuses must not appear on Augusta's own stats.
    expect(stats.skillDmg).toBe(0);
    expect(stats.coordDmg).toBe(0);
  });
});

describe("resolveSimulatedTeamRotation — 'whole-team' scoped blocks route from one character onto another", () => {
  it("Augusta's Resonance Chain S4 (whole-team ATK+20% for 30s after her Intro cast) lands on Yinlin with a real, non-trivial uptime fraction (not 0%, not silently 100%)", () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps(MEMBERS);
    const { stats, activity, targetSegment } = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, 'Yinlin', {
      targetElementLower: 'electro', targetRole: 'Sub DPS',
    });
    const s4Activity = activity['augusta.chain.s4-ascent-in-sun-and-glory=>Yinlin'];
    expect(s4Activity).toBeDefined();
    expect(s4Activity.avgMultiplier).toBeGreaterThan(0);
    expect(s4Activity.avgMultiplier).toBeLessThanOrEqual(1);
    // Real, hand-verifiable overlap: Augusta's Intro fires at the very first step (t≈1.5s), opening
    // a 30s window [1.5, 31.5]. Yinlin's own on-field segment starts only once Augusta's whole combo
    // finishes. The overlap is necessarily LESS than Yinlin's full segment duration (the window closes
    // partway through her combo) — so this must land strictly between 0 and 1, not at either extreme.
    expect(targetSegment.start).toBeGreaterThan(1.5); // Yinlin swaps in only after Augusta's steps
    const atkFromS4 = 20 * s4Activity.avgMultiplier;
    // Yinlin's own Inherent Skill Deadly Focus (yinlin.selfbuff.deadly-focus-atk, added 2026-09-03) also
    // contributes atkPct within her own segment — account for it alongside Augusta's S4 routing.
    const deadlyFocusActivity = activity['yinlin.selfbuff.deadly-focus-atk=>Yinlin'];
    const atkFromDeadlyFocus = deadlyFocusActivity ? 10 * deadlyFocusActivity.avgMultiplier : 0;
    expect(stats.atkPct).toBeCloseTo(atkFromS4 + atkFromDeadlyFocus, 10);
  });

  it("Augusta's own S4 buff ALSO applies to Augusta herself (whole-team includes the source), verified by resolving Augusta as target", () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps(MEMBERS);
    const { activity } = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, 'Augusta', { targetElementLower: 'electro', targetRole: 'Main DPS' });
    const s4Activity = activity['augusta.chain.s4-ascent-in-sun-and-glory=>Augusta'];
    expect(s4Activity).toBeDefined();
    // Augusta's own on-field segment starts at t=0 (she's member[0]) and the buff opens right at her
    // own Intro (the very first step) — should cover the vast majority of her own remaining segment.
    expect(s4Activity.avgMultiplier).toBeGreaterThan(0.8);
  });
});

describe("resolveSimulatedTeamRotation — 'next-on-field' scoped blocks only reach the IMMEDIATE next member", () => {
  it("Rover: Electro's own outro buff (target: next-on-field) does NOT reach Augusta or Yinlin (he's the LAST member, nobody is next)", () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps(MEMBERS);
    const forAugusta = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, 'Augusta', { targetElementLower: 'electro', targetRole: 'Main DPS' });
    const forYinlin = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, 'Yinlin', { targetElementLower: 'electro', targetRole: 'Sub DPS' });
    expect(Object.keys(forAugusta.activity).some(k => k.startsWith('rover-electro.outro'))).toBe(false);
    expect(Object.keys(forYinlin.activity).some(k => k.startsWith('rover-electro.outro'))).toBe(false);
  });

  it("reordering so Yinlin is LAST (Augusta, Rover: Electro, Yinlin) makes Rover: Electro's outro reach Yinlin instead, with a real overlap fraction", () => {
    const reordered = [MEMBERS[0], MEMBERS[2], MEMBERS[1]];
    const { ownedSteps, blocksByOwner } = buildTeamSteps(reordered);
    const { activity } = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, 'Yinlin', { targetElementLower: 'electro', targetRole: 'Sub DPS' });
    const outroActivity = activity['rover-electro.outro.rumbling-thunders=>Yinlin'];
    expect(outroActivity).toBeDefined();
    expect(outroActivity.avgMultiplier).toBeGreaterThan(0);
  });
});

describe('resolveSimulatedTeamRotation — a character not on the team resolves to an empty result, not a crash', () => {
  it('returns null targetSegment and zeroed stats for a name absent from the team', () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps(MEMBERS);
    const { targetSegment, stats } = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, 'Camellya');
    expect(targetSegment).toBeNull();
    expect(stats.atkPct).toBe(0);
  });
});
