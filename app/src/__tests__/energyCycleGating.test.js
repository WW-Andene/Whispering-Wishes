// PHASE3_PLAN.md Stage 3, item 3/5: energy-cycle-gated Liberation uptime. resolveHitComposedDps and
// resolveHitComposedTeamDps gained an opt-in `libUptime` param that discounts only Liberation-sourced
// hits (damage.category === 'libDmg'), sourced from calcEnergyCycles()'s own real ER-based factor via
// energyCycleGating.js's libUptimeOf(). These tests prove: the gate is opt-in/backward-compatible
// (omitting it changes nothing), it only touches libDmg-category hits (a non-Liberation hit at the
// same instant is untouched), and libUptimeOf()'s own lookup/no-gating-by-default behavior.
import { describe, it, expect } from 'vitest';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { resolveHitComposedTeamDps } from '../engine/resolver/dps/resolveHitComposedTeamDps.js';
import { libUptimeOf } from '../engine/resolver/gating/energyCycleGating.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';

const NEUTRAL_ENEMY = { enemyDef: 0, enemyRes: 0 };

describe('libUptimeOf', () => {
  it('returns the real libUptime for a character present in energyCycleFactors', () => {
    expect(libUptimeOf({ Yinlin: { totalER: 130, libUptime: 0.8, energyCost: 125 } }, 'Yinlin')).toBe(0.8);
  });

  it('returns null (no gating) for a missing character or a null/absent factors map', () => {
    expect(libUptimeOf({ Yinlin: { libUptime: 0.8 } }, 'Verina')).toBeNull();
    expect(libUptimeOf(null, 'Yinlin')).toBeNull();
    expect(libUptimeOf(undefined, 'Yinlin')).toBeNull();
  });
});

describe('resolveHitComposedDps — libUptime gate', () => {
  const libBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.liberation.thundering-wrath');
  const basicBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.basic.zapstrings-dance');
  const steps = [
    { type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 1 },
    { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1 },
  ];
  const baseAtk = 1000;

  it('omitting libUptime (default null) leaves Liberation damage untouched — backward compatible', () => {
    const withDefault = resolveHitComposedDps([libBlock], steps, NEUTRAL_ENEMY, baseAtk);
    const withExplicitNull = resolveHitComposedDps([libBlock], steps, NEUTRAL_ENEMY, baseAtk, null, null, null, null, null);
    expect(withDefault.totalDamage).toBeCloseTo(withExplicitNull.totalDamage, 10);
    expect(withDefault.totalDamage).toBeGreaterThan(0);
  });

  it('a real libUptime scales ONLY the libDmg-category block, proportionally', () => {
    const full = resolveHitComposedDps([libBlock], steps, NEUTRAL_ENEMY, baseAtk);
    const halved = resolveHitComposedDps([libBlock], steps, NEUTRAL_ENEMY, baseAtk, null, null, null, null, 0.5);
    expect(halved.totalDamage).toBeCloseTo(full.totalDamage * 0.5, 6);
  });

  it('a non-Liberation hit (basicDmg category) is NOT scaled by libUptime, even at the same instant', () => {
    const fullBoth = resolveHitComposedDps([libBlock, basicBlock], steps, NEUTRAL_ENEMY, baseAtk);
    const gatedBoth = resolveHitComposedDps([libBlock, basicBlock], steps, NEUTRAL_ENEMY, baseAtk, null, null, null, null, 0.5);

    const libOnlyFull = resolveHitComposedDps([libBlock], steps, NEUTRAL_ENEMY, baseAtk).totalDamage;
    const basicOnlyFull = resolveHitComposedDps([basicBlock], steps, NEUTRAL_ENEMY, baseAtk).totalDamage;

    expect(fullBoth.totalDamage).toBeCloseTo(libOnlyFull + basicOnlyFull, 6);
    expect(gatedBoth.totalDamage).toBeCloseTo(libOnlyFull * 0.5 + basicOnlyFull, 6);
  });

  it('libUptime 0 zeroes out Liberation damage entirely', () => {
    const gated = resolveHitComposedDps([libBlock], steps, NEUTRAL_ENEMY, baseAtk, null, null, null, null, 0);
    expect(gated.totalDamage).toBe(0);
  });
});

describe('resolveHitComposedTeamDps — opts.libUptime gate', () => {
  const libBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.liberation.thundering-wrath');
  const ownedSteps = [{ owner: 'Yinlin', type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 1 }];
  const blocksByOwner = { Yinlin: [libBlock] };
  const baseAtk = 1000;

  it('omitting opts.libUptime leaves Liberation damage untouched', () => {
    const result = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it('a real opts.libUptime scales the libDmg-category block proportionally', () => {
    const full = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk);
    const gated = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', NEUTRAL_ENEMY, baseAtk, { libUptime: 0.6 });
    expect(gated.totalDamage).toBeCloseTo(full.totalDamage * 0.6, 6);
  });
});
