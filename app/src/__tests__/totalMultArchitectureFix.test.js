// the engine-merge history (git log) totalMult architecture-bug fix (2026-09-02). Investigated while designing a
// tiered-stacking curve for Qingxiao's Mindlock (Phase 0.5 gap #1) and found `stat: 'totalMult'` — used
// as a fallback effect stat across 38 TriggerBlocks in 24 character files — contributed EXACTLY ZERO to
// any actually-computed DPS number in the app, in all three real production paths:
//   - resolveHitComposedDps.js / resolveHitComposedTeamDps.js explicitly skipped it entirely
//     ("no dedicated accumulator here yet").
//   - resolveSimulatedTeamRotation.js DID accumulate it (its own totalMultBonus return field), but
//     calcTeamStats.js's only caller for a fully-converted team destructured just `{ stats: mainReceived }`,
//     silently discarding totalMultBonus.
// This tests the fix directly: createStats()/applyBuff() now have a real totalMult accumulator, both
// hit-composed resolvers multiply it into the final per-hit damage, and calcTeamStats.js's
// allMembersConverted branch now reads and applies totalMultBonus into its score.
import { describe, it, expect } from 'vitest';
import { createStats, applyBuff } from '../features/teams/calcEngine.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { resolveHitComposedTeamDps } from '../engine/resolver/dps/resolveHitComposedTeamDps.js';

describe('totalMult architecture-bug fix (the engine-merge history (git log))', () => {
  it('createStats() initializes totalMult to 0 and applyBuff() routes it correctly', () => {
    const stats = createStats();
    expect(stats.totalMult).toBe(0);
    applyBuff(stats, 'totalMult', 65);
    expect(stats.totalMult).toBe(65);
  });

  it('resolveHitComposedDps applies a passive totalMult buff as a real multiplicative factor', () => {
    const withoutBuff = {
      id: 'test.hit', source: 'Test', kind: 'damage',
      trigger: { type: 'cast', on: 'Skill:Test' },
      timing: {}, target: { scope: 'self' }, effects: [],
      damage: { hits: [{ atkPct: 100 }], category: 'skillDmg' },
    };
    const totalMultBuff = {
      id: 'test.buff', source: 'Test', kind: 'buff',
      trigger: { type: 'passive' },
      timing: {}, target: { scope: 'self' },
      effects: [{ stat: 'totalMult', value: 65 }],
    };
    const steps = [{ owner: 'Test', type: 'Skill', skill: 'Test', stepSeconds: 1 }];
    const enemyContext = { enemyDef: 0, enemyRes: 0 };
    const without = resolveHitComposedDps([withoutBuff], steps, enemyContext, { atk: 1000 });
    const withBuff = resolveHitComposedDps([withoutBuff, totalMultBuff], steps, enemyContext, { atk: 1000 });
    // A +65% totalMult buff should scale total damage by exactly 1.65x.
    expect(withBuff.totalDamage).toBeCloseTo(without.totalDamage * 1.65, 5);
  });

  it('resolveHitComposedTeamDps applies a self totalMult buff to its own owner as a real multiplicative factor', () => {
    const damageBlock = {
      id: 'test.hit', source: 'Test', kind: 'damage',
      trigger: { type: 'cast', on: 'Skill:Test' },
      timing: {}, target: { scope: 'self' }, effects: [],
      damage: { hits: [{ atkPct: 100 }], category: 'skillDmg' },
    };
    const totalMultBuff = {
      id: 'test.buff', source: 'Test', kind: 'buff',
      trigger: { type: 'passive' },
      timing: {}, target: { scope: 'self' },
      effects: [{ stat: 'totalMult', value: 65 }],
    };
    const steps = [{ owner: 'Test', type: 'Skill', skill: 'Test', stepSeconds: 1 }];
    const enemyContext = { enemyDef: 0, enemyRes: 0 };
    const without = resolveHitComposedTeamDps(steps, { Test: [damageBlock] }, 'Test', enemyContext, { atk: 1000 });
    const withBuff = resolveHitComposedTeamDps(steps, { Test: [damageBlock, totalMultBuff] }, 'Test', enemyContext, { atk: 1000 });
    expect(withBuff.totalDamage).toBeCloseTo(without.totalDamage * 1.65, 5);
  });
});
