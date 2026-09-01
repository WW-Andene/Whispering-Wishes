// Stage 4 kickoff finding (see PHASE3_PLAN.md): the Stage 1 harness's roster-wide ~2x median ratio
// (engine dps / calcTeamStats rawDps) wasn't fully explained by anything Stage 2/3 closed. Root-caused
// by comparing calcTeamStats.js's rotTime against the engine's own totalTime for several characters:
// deriveStepsFromRotation builds ONE non-repeating pass through CHARACTER_ROTATIONS, and
// resolveHitComposedDps's totalDamage/totalTime implicitly assumes every hit repeats every totalTime
// seconds forever — over-crediting a long-CD hit (Liberation nukes, typically 20-25s CD) that only
// appears once in a much shorter pass (routinely 9-20s). cooldownSteadyState scales such a block's
// damage down to the sustainable min(1, totalTime/cooldown) fraction.
import { describe, it, expect } from 'vitest';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { resolveHitComposedTeamDps } from '../engine/resolveHitComposedTeamDps.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';

const NEUTRAL_ENEMY = { enemyDef: 0, enemyRes: 0 };

describe('resolveHitComposedDps — cooldownSteadyState', () => {
  // yinlin.liberation.thundering-wrath carries timing.cooldown: 16.
  const libBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.liberation.thundering-wrath');
  const baseAtk = 1000;

  it('omitting cooldownSteadyState (default false) leaves damage untouched even when the pass is much shorter than the cooldown', () => {
    const shortSteps = [{ type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 4 }]; // totalTime=4, cooldown=16
    const withDefault = resolveHitComposedDps([libBlock], shortSteps, NEUTRAL_ENEMY, baseAtk);
    const withExplicitFalse = resolveHitComposedDps([libBlock], shortSteps, NEUTRAL_ENEMY, baseAtk, null, null, null, null, null, false);
    expect(withDefault.totalDamage).toBeCloseTo(withExplicitFalse.totalDamage, 10);
    expect(withDefault.totalDamage).toBeGreaterThan(0);
  });

  it('scales a block down to totalTime/cooldown when the pass is shorter than the cooldown', () => {
    const shortSteps = [{ type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 4 }]; // totalTime=4, cooldown=16 -> gate=0.25
    const full = resolveHitComposedDps([libBlock], shortSteps, NEUTRAL_ENEMY, baseAtk);
    const gated = resolveHitComposedDps([libBlock], shortSteps, NEUTRAL_ENEMY, baseAtk, null, null, null, null, null, true);
    expect(gated.totalDamage).toBeCloseTo(full.totalDamage * (4 / 16), 6);
  });

  it('does NOT scale a block whose cooldown already fits inside the pass (gate stays 1)', () => {
    const longSteps = [{ type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 20 }]; // totalTime=20 > cooldown=16
    const full = resolveHitComposedDps([libBlock], longSteps, NEUTRAL_ENEMY, baseAtk);
    const gated = resolveHitComposedDps([libBlock], longSteps, NEUTRAL_ENEMY, baseAtk, null, null, null, null, null, true);
    expect(gated.totalDamage).toBeCloseTo(full.totalDamage, 6);
  });

  it('does not affect a block with no timing.cooldown at all', () => {
    const basicBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.basic.zapstrings-dance');
    const steps = [{ type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 3 }];
    const full = resolveHitComposedDps([basicBlock], steps, NEUTRAL_ENEMY, baseAtk);
    const gated = resolveHitComposedDps([basicBlock], steps, NEUTRAL_ENEMY, baseAtk, null, null, null, null, null, true);
    expect(gated.totalDamage).toBeCloseTo(full.totalDamage, 6);
  });
});

describe('resolveHitComposedTeamDps — opts.cooldownSteadyState', () => {
  const libBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.liberation.thundering-wrath');
  const baseAtk = 1000;

  it('scales down when the target field duration is shorter than the block cooldown', () => {
    const ownedSteps = [{ owner: 'Yinlin', type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 4 }];
    const blocksByOwner = { Yinlin: [libBlock] };
    const full = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk);
    const gated = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk, { cooldownSteadyState: true });
    expect(gated.totalDamage).toBeCloseTo(full.totalDamage * (4 / 16), 6);
  });

  it('omitting opts.cooldownSteadyState leaves damage untouched', () => {
    const ownedSteps = [{ owner: 'Yinlin', type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 4 }];
    const blocksByOwner = { Yinlin: [libBlock] };
    const result = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk);
    expect(result.totalDamage).toBeGreaterThan(0);
  });
});
