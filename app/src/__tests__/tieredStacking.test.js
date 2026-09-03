// the engine-merge history (git log) Phase 0.5 gap #1 — a nonlinear/multi-tier per-stack curve. Previously every such
// mechanic (Qingxiao's Mindlock, Yangyang: Xuanling's Unbroken Vow, Sigrika's ER-scaling) was kept as a
// single flat value at the documented ceiling stack count — exactly right at that one count, wrong
// everywhere below it. `cumulativeTieredValue()` is the real fix: computes the true progressive-tier
// value at any stack count (integer or fractional), and every resolver's own `applyEffects()` now uses
// it instead of `value * count` whenever an effect carries `tiers`.
import { describe, it, expect } from 'vitest';
import { cumulativeTieredValue } from '../engine/tieredStacking.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { resolveHitComposedTeamDps } from '../engine/resolveHitComposedTeamDps.js';

const MINDLOCK_TIERS = [{ count: 7, value: 7 }, { count: 8, value: 2 }];

describe('cumulativeTieredValue (the engine-merge history (git log) Phase 0.5 gap #1)', () => {
  it('matches Qingxiao\'s own dump-confirmed value at the 15-stack cap: 7×7 + 8×2 = 65', () => {
    expect(cumulativeTieredValue(MINDLOCK_TIERS, 15)).toBe(65);
  });

  it('correctly computes a partial stack count within the first tier', () => {
    expect(cumulativeTieredValue(MINDLOCK_TIERS, 3)).toBe(21); // 3 × 7
  });

  it('correctly computes a partial stack count spanning both tiers', () => {
    expect(cumulativeTieredValue(MINDLOCK_TIERS, 10)).toBe(55); // 7×7 + 3×2 = 49+6
  });

  it('returns 0 at 0 stacks', () => {
    expect(cumulativeTieredValue(MINDLOCK_TIERS, 0)).toBe(0);
  });

  it('handles a fractional (time-averaged) stack count via linear interpolation between integer values', () => {
    // Halfway between 6 stacks (42) and 7 stacks (49) is 45.5.
    expect(cumulativeTieredValue(MINDLOCK_TIERS, 6.5)).toBeCloseTo(45.5, 5);
  });

  it('does not exceed the tiers\' own total even past the real cap (defensive, not a real usage)', () => {
    expect(cumulativeTieredValue(MINDLOCK_TIERS, 20)).toBe(65);
  });
});

describe('tiers wired into the hit-composed resolvers', () => {
  const damageBlock = {
    id: 'test.hit', source: 'Test', kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Test' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 100 }], category: 'skillDmg' },
  };
  // 3 stacking instances active at hit time, using the same tiered curve as Mindlock: value at 3
  // stacks should be 21 (3×7), not value*3 with some flat placeholder value.
  const makeStackingBuff = () => ({
    id: 'test.tiered-buff', source: 'Test', kind: 'buff',
    trigger: { type: 'cast', on: 'Buff:Stack' },
    timing: { duration: 30 },
    target: { scope: 'self' },
    effects: [{ stat: 'deepen', value: 0, tiers: MINDLOCK_TIERS, stacking: 'stacking', maxStacks: 15 }],
  });

  it('resolveHitComposedDps applies the real tiered value, not value×count', () => {
    const steps = [
      { owner: 'Test', type: 'Buff', skill: 'Stack', stepSeconds: 0.1 },
      { owner: 'Test', type: 'Buff', skill: 'Stack', stepSeconds: 0.1 },
      { owner: 'Test', type: 'Buff', skill: 'Stack', stepSeconds: 0.1 },
      { owner: 'Test', type: 'Skill', skill: 'Test', stepSeconds: 1 },
    ];
    const enemyContext = { enemyDef: 0, enemyRes: 0 };
    const without = resolveHitComposedDps([damageBlock], steps, enemyContext, { atk: 1000 });
    const withTiered = resolveHitComposedDps([damageBlock, makeStackingBuff()], steps, enemyContext, { atk: 1000 });
    // 3 stacks of Mindlock-shaped tiers -> +21% deepen -> calcDmgBonus applies (1 + deepen/100).
    expect(withTiered.totalDamage).toBeCloseTo(without.totalDamage * 1.21, 3);
  });

  it('resolveHitComposedTeamDps applies the real tiered value, not value×count', () => {
    const steps = [
      { owner: 'Test', type: 'Buff', skill: 'Stack', stepSeconds: 0.1 },
      { owner: 'Test', type: 'Buff', skill: 'Stack', stepSeconds: 0.1 },
      { owner: 'Test', type: 'Buff', skill: 'Stack', stepSeconds: 0.1 },
      { owner: 'Test', type: 'Skill', skill: 'Test', stepSeconds: 1 },
    ];
    const enemyContext = { enemyDef: 0, enemyRes: 0 };
    const without = resolveHitComposedTeamDps(steps, { Test: [damageBlock] }, 'Test', enemyContext, { atk: 1000 });
    const withTiered = resolveHitComposedTeamDps(steps, { Test: [damageBlock, makeStackingBuff()] }, 'Test', enemyContext, { atk: 1000 });
    expect(withTiered.totalDamage).toBeCloseTo(without.totalDamage * 1.21, 3);
  });
});
