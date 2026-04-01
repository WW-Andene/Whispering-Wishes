/**
 * Damage Calculator Formula Tests
 * Verifies all damage formulas match the WuWa wiki specifications.
 * Source: wutheringwaves.fandom.com/wiki/Damage
 */
import { describe, it, expect } from 'vitest';

// We test the formulas directly rather than importing the full component
describe('DEF Multiplier formula', () => {
  const attackerFactor = 800 + 8 * 90; // 1520

  it('attacker factor at level 90 is 1520', () => {
    expect(attackerFactor).toBe(1520);
  });

  it('enemy DEF at level 90 is 1512 (8*90 + 792)', () => {
    const enemyDef = 792 + 8 * 90;
    expect(enemyDef).toBe(1512);
  });

  it('DEF multiplier at equal level is ~50.13%', () => {
    const enemyDef = 1512;
    const defMult = attackerFactor / (attackerFactor + enemyDef);
    expect(defMult).toBeCloseTo(0.5013, 3);
  });

  it('DEF multiplier with 30% DEF Reduction', () => {
    const enemyDef = 1512;
    const reducedDef = enemyDef * (1 - 30 / 100); // 1058.4
    const defMult = attackerFactor / (attackerFactor + reducedDef);
    expect(defMult).toBeCloseTo(0.5896, 3);
  });

  it('DEF multiplier with separate DEF Reduction and DEF Ignore', () => {
    const enemyDef = 1512;
    const defReduction = 20; // %
    const defIgnore = 15; // %
    const reducedDef = enemyDef * (1 - defReduction / 100);
    const effectiveDef = reducedDef * (1 - defIgnore / 100);
    const defMult = attackerFactor / (attackerFactor + effectiveDef);
    // Should NOT be same as additive (35% combined)
    const additiveDef = enemyDef * (1 - (defReduction + defIgnore) / 100);
    const additiveDefMult = attackerFactor / (attackerFactor + additiveDef);
    expect(defMult).not.toBeCloseTo(additiveDefMult, 4);
    // Multiplicative should give slightly less reduction
    expect(defMult).toBeLessThan(additiveDefMult);
  });

  it('DEF multiplier is capped at 200%', () => {
    const defMult = Math.min(2, attackerFactor / (attackerFactor + 0));
    expect(defMult).toBe(1); // 0 DEF = 100% mult, not 200%
    // With negative effective DEF
    const negativeDef = -500;
    const uncapped = attackerFactor / (attackerFactor + negativeDef);
    const capped = Math.min(2, uncapped);
    expect(capped).toBeLessThanOrEqual(2);
  });
});

describe('RES Multiplier formula (3-tier piecewise)', () => {
  const calcResMult = (baseRes, shred) => {
    const totalRes = (baseRes - shred) / 100;
    if (totalRes < 0) return 1 - totalRes / 2;
    if (totalRes < 0.8) return 1 - totalRes;
    return 1 / (1 + 5 * totalRes);
  };

  it('10% RES (standard enemy) = 0.90 multiplier', () => {
    expect(calcResMult(10, 0)).toBeCloseTo(0.9, 4);
  });

  it('40% RES (boss resisted element) = 0.60', () => {
    expect(calcResMult(40, 0)).toBeCloseTo(0.6, 4);
  });

  it('0% RES = 1.0', () => {
    expect(calcResMult(0, 0)).toBeCloseTo(1.0, 4);
  });

  it('negative RES: -20% → 1.10 (halved effectiveness)', () => {
    expect(calcResMult(10, 30)).toBeCloseTo(1.1, 4); // 10-30 = -20%
  });

  it('negative RES: -30% → 1.15', () => {
    expect(calcResMult(0, 30)).toBeCloseTo(1.15, 4);
  });

  it('high RES: 80% → diminishing returns formula', () => {
    expect(calcResMult(80, 0)).toBeCloseTo(1 / (1 + 5 * 0.8), 4); // = 0.2
  });

  it('high RES: 100% → 0.1667', () => {
    expect(calcResMult(100, 0)).toBeCloseTo(1 / 6, 3);
  });

  it('RES shred from 10% to -20% uses half formula', () => {
    const mult = calcResMult(10, 30); // 10-30 = -20%
    // Should use: 1 - (-0.2)/2 = 1 + 0.1 = 1.1
    expect(mult).toBeCloseTo(1.1, 4);
  });
});

describe('DMG Bonus formula (additive)', () => {
  it('elemental + skill type are additive, not multiplicative', () => {
    const elemDmg = 60;
    const skillDmg = 50;
    const deepen = 15;

    // Correct (wiki): all additive in one bucket, deepen separate
    const correct = (1 + (elemDmg + skillDmg) / 100) * (1 + deepen / 100);

    // Wrong (old): multiplicative between elem and skill
    const wrong = (1 + elemDmg / 100) * (1 + skillDmg / 100) * (1 + deepen / 100);

    expect(correct).toBeCloseTo(2.1 * 1.15, 4); // (1 + 1.1) * 1.15 = 2.415
    expect(wrong).toBeCloseTo(1.6 * 1.5 * 1.15, 4); // 2.76
    expect(correct).toBeLessThan(wrong); // Additive gives lower value
  });
});

describe('Crit formula', () => {
  it('base crit: CR=5%, CD=150% → avg crit = 1.025', () => {
    // WuWa convention: CD includes base, so 150% = 1.5x multiplier
    // Average = 1 + CR × (CD/100 - 1)
    const cr = 5, cd = 150;
    const avgCrit = 1 + (cr / 100) * (cd / 100 - 1);
    expect(avgCrit).toBeCloseTo(1.025, 4);
  });

  it('endgame crit: CR=60%, CD=250% → avg crit = 1.9', () => {
    const cr = 60, cd = 250;
    const avgCrit = 1 + (cr / 100) * (cd / 100 - 1);
    expect(avgCrit).toBeCloseTo(1.9, 4);
  });

  it('100% CR = guaranteed crit, avg = CD/100', () => {
    const cr = 100, cd = 200;
    const avgCrit = 1 + (Math.min(cr, 100) / 100) * (cd / 100 - 1);
    expect(avgCrit).toBeCloseTo(2.0, 4); // Always crits at 2x
  });

  it('CR > 100% is capped', () => {
    const cr = 120, cd = 200;
    const avgCrit = 1 + (Math.min(cr, 100) / 100) * (cd / 100 - 1);
    expect(avgCrit).toBeCloseTo(2.0, 4); // Same as 100% CR
  });
});

describe('Sub-DPS field time scaling', () => {
  it('sub-DPS mult scales by field time ratio', () => {
    const mainOnField = 15;
    const rotTime = 22;
    const offFieldTime = rotTime - mainOnField; // 7s
    const numSubDps = 2;
    const subFieldEach = offFieldTime / numSubDps; // 3.5s

    const subOnField = 15; // sub-DPS needs 15s
    const fieldRatio = Math.min(1, subFieldEach / subOnField); // 3.5/15 = 0.233
    expect(fieldRatio).toBeCloseTo(0.233, 2);

    // Sub-DPS totalMult is scaled down
    const subTotalMult = 2400;
    const scaledMult = subTotalMult * fieldRatio;
    expect(scaledMult).toBeCloseTo(560, -1); // ~560 instead of 2400
  });

  it('field ratio is capped at 1.0', () => {
    const subFieldEach = 20;
    const subOnField = 5;
    const fieldRatio = Math.min(1, subFieldEach / subOnField);
    expect(fieldRatio).toBe(1);
  });
});

describe('Full damage formula integration', () => {
  it('computes damage for a simple scenario', () => {
    // Augusta: baseAtk=463, weapAtk=587, totalMult=2800
    const charAtk = 463, weapAtk = 587;
    const baseStat = charAtk + weapAtk; // 1050
    const atkPct = 66; // echo ATK% + weapon passive
    const totalMult = 2800;
    const elemDmg = 40; // echo set + weapon
    const skillDmg = 25; // weapon passive
    const deepen = 15; // Verina outro
    const cr = 55, cd = 220;

    const effAtk = baseStat * (1 + atkPct / 100);
    const avgCrit = 1 + (cr / 100) * (cd / 100 - 1);
    const dmgBonus = (1 + (elemDmg + skillDmg) / 100) * (1 + deepen / 100);
    const defMult = 1520 / (1520 + 1512);
    const resMult = 0.9; // 10% standard enemy

    const totalRotDmg = effAtk * (totalMult / 100) * avgCrit * dmgBonus * defMult * resMult;
    const dps = totalRotDmg / 23; // 23s rotation

    expect(effAtk).toBeCloseTo(1743, 0);
    expect(avgCrit).toBeCloseTo(1.66, 2);
    expect(dmgBonus).toBeCloseTo(1.65 * 1.15, 2);
    // DPS at Lv.1 scale totalMult (~2800) is modest; Lv.10 would be ~2x
    expect(dps).toBeGreaterThan(1000);
    expect(dps).toBeLessThan(100000);
  });
});
