// PHASE3_PLAN.md Stage 3, item 4/5 (final Stage 3 item): Coordinated ATK off-field snapshot
// semantics. engine/coordinatedAtk.js factors out calcTeamStats.js's coord/field-time mult blend
// (coordinatedMultShare), and an opt-in `coordSnapshotDiscount` option threaded through
// resolveSimulatedTeamRotation.js and resolveHitComposedTeamDps.js replicates legacy's flat 0.6
// snapshot discount on 'next-on-field'-scoped buffs only — 'whole-team' buffs stay undiscounted,
// matching legacy's own outroBuffs-vs-libBuffs distinction exactly.
import { describe, it, expect } from 'vitest';
import { coordinatedMultShare, COORD_SNAPSHOT_DISCOUNT } from '../engine/coordinatedAtk.js';
import { resolveSimulatedTeamRotation } from '../engine/resolveSimulatedTeamRotation.js';
import { resolveHitComposedTeamDps } from '../engine/resolveHitComposedTeamDps.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';

const NEUTRAL_ENEMY = { enemyDef: 0, enemyRes: 0 };
const BLOCKS_BY_NAME = { Augusta: AUGUSTA_BLOCKS, Yinlin: YINLIN_BLOCKS };

describe('coordinatedMultShare', () => {
  it('matches calcTeamStats.js exactly for a pure Coordinated ATK kit (coordShare 0.8)', () => {
    // calcTeamStats.js:989-993: mult * (coordShare * coordUptime + onFieldShare * fieldRatio)
    const coordShare = 0.8, coordUptime = 0.75, fieldRatio = 0.4;
    const expected = coordShare * coordUptime + (1 - coordShare) * fieldRatio;
    expect(coordinatedMultShare({ coordShare, coordUptime, fieldRatio })).toBeCloseTo(expected, 10);
  });

  it('matches for a hybrid kit (coordShare 0.5)', () => {
    expect(coordinatedMultShare({ coordShare: 0.5, coordUptime: 1, fieldRatio: 0 })).toBeCloseTo(0.5, 10);
    expect(coordinatedMultShare({ coordShare: 0.5, coordUptime: 0, fieldRatio: 1 })).toBeCloseTo(0.5, 10);
  });

  it('coordUptime=1 and fieldRatio=1 (always active either way) always yields 1', () => {
    expect(coordinatedMultShare({ coordShare: 0.8, coordUptime: 1, fieldRatio: 1 })).toBeCloseTo(1, 10);
    expect(coordinatedMultShare({ coordShare: 0.5, coordUptime: 1, fieldRatio: 1 })).toBeCloseTo(1, 10);
  });
});

describe('resolveSimulatedTeamRotation — coordSnapshotDiscount', () => {
  const ownedSteps = [
    { owner: 'Augusta', type: 'Outro', skill: 'Battlesong of the Unyielding', isOutroCast: true, stepSeconds: 1 },
    { owner: 'Yinlin', type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", isSwapIn: true, stepSeconds: 2 },
  ];

  it('omitting coordSnapshotDiscount (default false) leaves next-on-field buffs at full value', () => {
    const { stats } = resolveSimulatedTeamRotation(ownedSteps, BLOCKS_BY_NAME, 'Yinlin');
    expect(stats.elemDmg).toBeCloseTo(15, 6); // augusta.outro.battlesong's full elemDmg+15
  });

  it('coordSnapshotDiscount: true discounts the next-on-field buff by exactly COORD_SNAPSHOT_DISCOUNT', () => {
    const { stats } = resolveSimulatedTeamRotation(ownedSteps, BLOCKS_BY_NAME, 'Yinlin', { coordSnapshotDiscount: true });
    expect(stats.elemDmg).toBeCloseTo(15 * COORD_SNAPSHOT_DISCOUNT, 6);
  });
});

describe('resolveHitComposedTeamDps — opts.coordSnapshotDiscount', () => {
  const ownedSteps = [
    { owner: 'Augusta', type: 'Outro', skill: 'Battlesong of the Unyielding', isOutroCast: true, stepSeconds: 1 },
    { owner: 'Yinlin', type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", isSwapIn: true, stepSeconds: 2 },
  ];

  it('discounts only the next-on-field-derived portion of Yinlin\'s hit damage, not the whole total', () => {
    const full = resolveHitComposedTeamDps(ownedSteps, BLOCKS_BY_NAME, 'Yinlin', NEUTRAL_ENEMY, 1000, {
      targetElementLower: 'electro', targetRole: 'Sub DPS',
    });
    const discounted = resolveHitComposedTeamDps(ownedSteps, BLOCKS_BY_NAME, 'Yinlin', NEUTRAL_ENEMY, 1000, {
      targetElementLower: 'electro', targetRole: 'Sub DPS', coordSnapshotDiscount: true,
    });
    // elemDmg+15 (undiscounted) vs elemDmg+15*0.6=9 (discounted) both fold into calcDmgBonus's
    // (1+elemDmg/100) factor — discounted total must be strictly less, but not zero (base damage,
    // independent of the buff, still lands).
    expect(discounted.totalDamage).toBeLessThan(full.totalDamage);
    expect(discounted.totalDamage).toBeGreaterThan(0);
    const undiscountedBonus = 1 + 15 / 100;
    const discountedBonus = 1 + (15 * COORD_SNAPSHOT_DISCOUNT) / 100;
    expect(discounted.totalDamage / full.totalDamage).toBeCloseTo(discountedBonus / undiscountedBonus, 6);
  });
});
