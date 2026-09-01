/**
 * resolveSimulatedRotation.js — the time-integration driver that finally gives 'unique'/'refresh'/
 * 'stacking' (declared in triggerBlocks.schema.js since Rover: Electro's very first conversion, but
 * never enforced by anything) a real consumer. See that file's own header for the full design
 * reasoning: this generalizes calcTeamStats.js's single-instance overlap-uptime arithmetic to N
 * possibly-overlapping activation windows of the SAME block, summed and capped per stacking mode,
 * integrated against the whole simulated timeline.
 *
 * Uses small synthetic blocks with exact, hand-computable timings for the three stacking-mode cases
 * (so the expected numbers are independently verifiable, not just "whatever the code produces"), then
 * real character block sets for the passive/per-hit-scoped/real-rotation end-to-end cases.
 */
import { describe, it, expect } from 'vitest';
import { resolveSimulatedRotation } from '../engine/resolveSimulatedRotation.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { ROVER_ELECTRO_BLOCKS } from '../engine/characterBlocks/roverElectro.blocks.js';
import { SHOREKEEPER_BLOCKS } from '../engine/characterBlocks/shorekeeper.blocks.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';

// Shared synthetic steps for the three stacking-mode cases below: a 'Skill:Zap' cast at t=1, again
// at t=3 (2s later, well within a 10s duration), then again at t=23 (20s later, well past it).
// totalTime = 1 + 2 + 20 = 23.
const ZAP_STEPS = [
  { type: 'Skill', skill: 'Zap', stepSeconds: 1 },
  { type: 'Skill', skill: 'Zap', stepSeconds: 2 },
  { type: 'Skill', skill: 'Zap', stepSeconds: 20 },
];

function zapBlock(stacking, extra = {}) {
  return {
    id: 'test.zap',
    source: 'Test',
    kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Zap' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: stacking === 'stacking' ? 5 : 20, stacking, ...extra }],
  };
}

describe('resolveSimulatedRotation — stacking-mode time integration', () => {
  it("'unique': a re-trigger while still active is a no-op — only ONE window counts", () => {
    // Hand-computed: window opens [1,11] at the 1st cast; the 2nd cast (t=3) is still inside it, so
    // it's ignored (no 2nd window, no extension). The 3rd cast (t=23) opens a NEW window [23,33],
    // but that's entirely past totalTime=23 so it clamps away to nothing. Surviving window: [1,11].
    // avgMultiplier = 10/23.
    const { stats, activity, totalTime } = resolveSimulatedRotation([zapBlock('unique')], ZAP_STEPS);
    expect(totalTime).toBe(23);
    // 2 raw windows recorded (the 2nd cast's no-op leaves no window; the 3rd cast at t=23 opens its
    // own [23,33]) — but that 3rd window clamps entirely away against totalTime=23 during
    // integration, so only [1,11] actually contributes. Assert the RAW history here, and the
    // resulting avgMultiplier (post-clamping) below.
    expect(activity['test.zap'].windows).toEqual([{ start: 1, end: 11 }, { start: 23, end: 33 }]);
    expect(activity['test.zap'].avgMultiplier).toBeCloseTo(10 / 23, 10);
    expect(stats.atkPct).toBeCloseTo(20 * (10 / 23), 10);
  });

  it("'refresh': a re-trigger while still active EXTENDS the window instead of opening a 2nd one", () => {
    // 1st cast (t=1) opens [1,11]. 2nd cast (t=3) is inside it, so it extends the SAME window's end
    // to 3+10=13 -> window becomes [1,13]. 3rd cast (t=23) is past it, opens [23,33] (clamped away).
    // Surviving window: [1,13]. avgMultiplier = 12/23.
    const { stats, activity } = resolveSimulatedRotation([zapBlock('refresh')], ZAP_STEPS);
    // Same raw-vs-clamped distinction as the 'unique' case above: the extended [1,13] window plus a
    // 2nd raw window from the 3rd cast (t=23), which clamps away entirely.
    expect(activity['test.zap'].windows).toEqual([{ start: 1, end: 13 }, { start: 23, end: 33 }]);
    expect(activity['test.zap'].avgMultiplier).toBeCloseTo(12 / 23, 10);
    expect(stats.atkPct).toBeCloseTo(20 * (12 / 23), 10);
  });

  it("'stacking': concurrent windows genuinely sum (capped at maxStacks), non-overlapping regions count only their own concurrency", () => {
    // 1st cast (t=1) opens [1,11]. 2nd cast (t=3) opens a SEPARATE window [3,13] (stacking never
    // merges). Both are concurrent during [3,11) — 2 stacks, at the maxStacks:2 cap. [1,3) has only
    // window 1 (1 stack); [11,13) has only window 2 (1 stack). 3rd cast (t=23) opens [23,33],
    // clamped away. Hand-integrated area = 1*2 + 2*8 + 1*2 = 20 -> avgMultiplier = 20/23.
    const { stats, activity } = resolveSimulatedRotation([zapBlock('stacking', { maxStacks: 2 })], ZAP_STEPS);
    // 3 raw windows this time ('stacking' always opens a new one, never merges) — the 3rd (from
    // t=23) again clamps away entirely, leaving the hand-integrated [1,11]+[3,13] pair above.
    expect(activity['test.zap'].windows).toEqual([{ start: 1, end: 11 }, { start: 3, end: 13 }, { start: 23, end: 33 }]);
    expect(activity['test.zap'].avgMultiplier).toBeCloseTo(20 / 23, 10);
    expect(stats.atkPct).toBeCloseTo(5 * (20 / 23), 10);
  });

  it("'stacking' with NO maxStacks specified is uncapped — same scenario, cap raised to Infinity changes nothing here since only 2 windows ever overlap", () => {
    const { activity } = resolveSimulatedRotation([zapBlock('stacking')], ZAP_STEPS);
    expect(activity['test.zap'].avgMultiplier).toBeCloseTo(20 / 23, 10); // identical to the capped case — 2 concurrent never exceeds an unset cap anyway
  });

  it("a block that never triggers this rotation contributes nothing and isn't in `activity`", () => {
    const { stats, activity } = resolveSimulatedRotation([zapBlock('unique')], [
      { type: 'Skill', skill: 'SomethingElse', stepSeconds: 5 },
    ]);
    expect(activity['test.zap']).toBeUndefined();
    expect(stats.atkPct).toBe(0);
  });
});

describe('resolveSimulatedRotation — passive blocks stay full-value (no time integration needed)', () => {
  it("Rover: Electro's passive Resonance Chain buffs (S3 skillDmg+20, S4 libDmg+20) apply at full value regardless of the step sequence", () => {
    const { stats } = resolveSimulatedRotation(ROVER_ELECTRO_BLOCKS, [
      { type: 'Basic ATK', skill: 'Repel', stepSeconds: 1 },
    ]);
    // S3 (skillDmg 20) + S6 (skillDmg 20) both passive -> full 40 regardless of the 1-step timeline.
    expect(stats.skillDmg).toBe(40);
    expect(stats.libDmg).toBe(20);
  });
});

describe('resolveSimulatedRotation — per-hit-scoped blocks are honestly excluded, not misapplied', () => {
  it("Shorekeeper's S6 (cast-scoped, no timing.duration) is reported in perHitScopedBlockIds and NOT folded into stats", () => {
    const steps = [{ type: 'Intro', skill: 'Discernment', stepSeconds: 1 }];
    const { stats, perHitScopedBlockIds } = resolveSimulatedRotation(SHOREKEEPER_BLOCKS, steps);
    const s6 = SHOREKEEPER_BLOCKS.find(b => b.id === 'shorekeeper.chain.s6-to-the-new-world');
    expect(s6.timing.duration).toBeUndefined();
    expect(perHitScopedBlockIds).toContain(s6.id);
    // Time-averaging (or worse, always-applying) a per-hit-scoped +500% Crit DMG bonus across the
    // whole rotation would be a real correctness bug in either direction — confirm it's genuinely
    // absent from stats, not just diluted to some small value.
    expect(stats.cd).toBe(150); // BASE_CRIT_DMG only, S6's +500% never touched this accumulator
  });

  it("a block that never fires at all is NOT flagged as per-hit-scoped (distinguishes 'never happened' from 'happened but excluded')", () => {
    const steps = [{ type: 'Basic ATK', skill: 'Something Else', stepSeconds: 1 }];
    const { perHitScopedBlockIds } = resolveSimulatedRotation(SHOREKEEPER_BLOCKS, steps);
    expect(perHitScopedBlockIds).toEqual([]);
  });
});

describe('resolveSimulatedRotation — end-to-end against REAL CHARACTER_ROTATIONS data (Yinlin)', () => {
  it("derives steps from Yinlin's real rotation and produces a real time-weighted stat total", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yinlin'], YINLIN_BLOCKS);
    const { stats, totalTime, perHitScopedBlockIds } = resolveSimulatedRotation(YINLIN_BLOCKS, steps, {
      targetElementLower: 'electro', targetRole: 'Sub DPS',
    });
    expect(totalTime).toBeGreaterThan(0);
    // S1 (skillDmg 70, passive) + S3 (skillDmg 55, passive) always apply in full regardless of timing.
    expect(stats.skillDmg).toBe(125);
    // Yinlin's own kit has no duration-less 'cast'-triggered damage-modifier block (S6 Furious
    // Thunder is a 'windowed-proc', not a plain 'cast' block, so it isn't scanned for per-hit-scoped
    // exclusion here — confirms this driver doesn't spuriously flag trigger types it doesn't model).
    expect(perHitScopedBlockIds).toEqual([]);
  });

  it("her outro Strategist buff (refresh) opens its window exactly when she swaps out — since that's the LAST step, none of it overlaps HER OWN remaining timeline, so it correctly contributes ~0% to her own kit here (this is a cross-character handoff, out of scope for a single-character driver — see item 4/6 in PHASE2_PLAN.md)", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yinlin'], YINLIN_BLOCKS);
    const { activity } = resolveSimulatedRotation(YINLIN_BLOCKS, steps, { targetElementLower: 'electro', targetRole: 'Sub DPS' });
    const outroActivity = activity['yinlin.outro.strategist'];
    expect(outroActivity).toBeDefined(); // it DID fire...
    expect(outroActivity.avgMultiplier).toBe(0); // ...but contributes nothing to Yinlin's OWN stats, correctly
  });
});
