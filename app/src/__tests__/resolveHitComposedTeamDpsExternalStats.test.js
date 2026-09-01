// PHASE3_PLAN.md Stage 4 step 2: resolveHitComposedTeamDps gained an opt-in `opts.externalStats`
// param, mirroring resolveHitComposedDps.js's own — without it, the team-level engine composition
// had no way to receive gear-side stats (weapon passives, echo sets) at all, same gap Stage 1 found
// and fixed for the solo version. This proves it's opt-in, additive, and folds in every instant.
import { describe, it, expect } from 'vitest';
import { resolveHitComposedTeamDps } from '../engine/resolveHitComposedTeamDps.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';

const NEUTRAL_ENEMY = { enemyDef: 0, enemyRes: 0 };

describe('resolveHitComposedTeamDps — opts.externalStats', () => {
  const ownedSteps = [{ owner: 'Yinlin', type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", isSwapIn: true, stepSeconds: 2 }];
  const blocksByOwner = { Yinlin: YINLIN_BLOCKS };
  const baseAtk = 1000;

  it('omitting externalStats (default null) leaves damage unchanged — backward compatible', () => {
    const withDefault = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk);
    const withExplicitNull = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk, { externalStats: null });
    expect(withDefault.totalDamage).toBeCloseTo(withExplicitNull.totalDamage, 10);
    expect(withDefault.totalDamage).toBeGreaterThan(0);
  });

  it('a real externalStats atkPct delta raises damage proportionally', () => {
    const full = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk);
    const geared = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk, {
      externalStats: { atkPct: 50 },
    });
    expect(geared.totalDamage).toBeCloseTo(full.totalDamage * 1.5, 6);
  });

  it('externalStats elemDmg raises damage via the dmgBonus multiplier', () => {
    const full = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk);
    const geared = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk, {
      externalStats: { elemDmg: 20 },
    });
    expect(geared.totalDamage).toBeCloseTo(full.totalDamage * 1.2, 6);
  });
});
