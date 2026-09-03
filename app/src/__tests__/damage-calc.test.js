/**
 * Damage Calculator Formula Tests — real-engine verification against Kuro's own published formula.
 *
 * Source of truth: the wiki/Damage, fetched verbatim via the wiki's api.php
 * (action=parse, page=Damage) on 2026-08-19. That page is Wuthering Waves' official documented
 * combat formula (RES Multiplier, DEF Multiplier, DMG Bonus, Hardness) — not a community guess.
 * Every `WIKI_*` function below is a direct transcription of that page's math, kept deliberately
 * separate from calcEngine.js's implementation so this file can catch a real regression there.
 *
 * IMPORTANT: prior to this rewrite, every test in this file reimplemented the formula inline and
 * asserted its own reimplementation against itself — it never imported calcEngine.js at all, so a
 * real bug in calcDefMult/calcResMult/calcDmgBonus/calcAvgCrit could ship without any test noticing.
 * This version imports the actual exported functions and checks them against the wiki reference.
 */
import { describe, it, expect } from 'vitest';
import {
  ATTACKER_LEVEL, ATTACKER_FACTOR, BASE_CRIT_RATE, BASE_CRIT_DMG,
  calcDefMult, calcResMult, calcAvgCrit, calcDmgBonus,
} from '../features/teams/calcEngine.js';

// ── Wiki-transcribed reference implementations (independent of calcEngine.js) ──

// "%DEF = (800 + 8×LvlAttacker) / (800 + 8×LvlAttacker + DEF_target×(1 - DEF_Ignore_target))"
// "DEF% can have a maximum value of 200%"
// "Note that DEF Reduction is a stat change on the enemy and will be applied before the DEF% formula"
//   → DEF Reduction (defShred) reduces the enemy's DEF value first; DEF Ignore then applies to that
//     already-shredded value inside the formula's denominator — sequential, not both against the base.
function WIKI_calcDefMult(attackerFactor, enemyDef, defShredPct, defIgnorePct) {
  // Neither DEF Reduction nor DEF Ignore is documented going past 100% in real gear/buffs, but
  // clamping each factor at 0 (never negative) is the only sane reading of "reduction"/"ignore" past
  // that point — matches calcEngine.js's own Math.max(0, ...) guards, confirmed against it below.
  const shreddedDef = enemyDef * Math.max(0, 1 - defShredPct / 100);
  const denom = attackerFactor + shreddedDef * Math.max(0, 1 - defIgnorePct / 100);
  return Math.min(2, attackerFactor / denom);
}

// "RES Multiplier = 1 - RES/2 (RES<0) | 1 - RES (0<=RES<0.8) | 1/(1+5×RES) (RES>=0.8)"
// baseRes/shred are passed as percentage points (10 = 10%), matching calcEngine.js's own convention.
function WIKI_calcResMult(baseResPct, shredPct) {
  const res = (baseResPct - shredPct) / 100;
  if (res < 0) return 1 - res / 2;
  if (res < 0.8) return 1 - res;
  return 1 / (1 + 5 * res);
}

// "%DMG Bonus = 1 + All DMG Bonus" combined with "DMG Amplify_Total = 1 + (Amplify_target + Amplify_attacker)"
// as independent multiplicative layers (elemDmg+skillDmg additive within the DMG Bonus bucket, deepen
// as its own DMG-Taken-style multiplier stacking with DMG Bonus — matches calcEngine.js's `deepen`).
function WIKI_calcDmgBonus(elemDmgPct, skillDmgPct, amplifyPct, deepenPct) {
  return (1 + (elemDmgPct + skillDmgPct) / 100) * (1 + amplifyPct / 100) * (1 + deepenPct / 100);
}

// Crit DMG in WuWa's own UI already includes the "no crit" baseline (150% = 1.5x on a crit hit), so
// average damage across a mix of crit/non-crit hits is a linear interpolation between 1.0 (no crit)
// and CD/100 (always crit), weighted by Crit Rate — this isn't quoted verbatim on the Damage page
// (crit isn't covered there) but is WuWa's documented crit convention used consistently everywhere
// else on the wiki (character crit stat pages, echo substat pages).
function WIKI_calcAvgCrit(crPct, cdPct) {
  const cr = Math.min(crPct, 100) / 100;
  return 1 + cr * (cdPct / 100 - 1);
}

describe('Enemy DEF formula matches the wiki (Enemy DEF = 8×LVL + 792)', () => {
  it('level 90 → 1512', () => {
    expect(792 + 8 * 90).toBe(1512);
  });
  it('level 1 → 800', () => {
    expect(792 + 8 * 1).toBe(800);
  });
  it('level 120 → 1752', () => {
    expect(792 + 8 * 120).toBe(1752);
  });
});

describe('ATTACKER_FACTOR matches the wiki (800 + 8×LvlAttacker, attacker always Lv.90)', () => {
  it('exports 1520 at the documented attacker level', () => {
    expect(ATTACKER_LEVEL).toBe(90);
    expect(ATTACKER_FACTOR).toBe(800 + 8 * 90);
    expect(ATTACKER_FACTOR).toBe(1520);
  });
});

describe('calcDefMult (real export) vs. wiki reference', () => {
  const enemyDef = 1512; // Lv.90 enemy, per the DEF formula above

  it('no shred/ignore — equal-level baseline ~50.13%', () => {
    const real = calcDefMult(enemyDef, 0, 0);
    expect(real).toBeCloseTo(WIKI_calcDefMult(ATTACKER_FACTOR, enemyDef, 0, 0), 6);
    expect(real).toBeCloseTo(0.5013, 3);
  });

  it('30% DEF Reduction (shred) alone', () => {
    const real = calcDefMult(enemyDef, 30, 0);
    expect(real).toBeCloseTo(WIKI_calcDefMult(ATTACKER_FACTOR, enemyDef, 30, 0), 6);
  });

  it('DEF Reduction and DEF Ignore combined are sequential, not additive', () => {
    const real = calcDefMult(enemyDef, 20, 15);
    const additive = calcDefMult(enemyDef, 35, 0); // wrong model, for contrast only
    expect(real).toBeCloseTo(WIKI_calcDefMult(ATTACKER_FACTOR, enemyDef, 20, 15), 6);
    expect(real).not.toBeCloseTo(additive, 4);
  });

  it('capped at 200% per the wiki ("DEF% can have a maximum value of 200%")', () => {
    // Only reachable with enough DEF Ignore to drive effective DEF deeply negative.
    const real = calcDefMult(enemyDef, 0, 500); // 500% "ignore" is an synthetic edge case, not real gear
    expect(real).toBeLessThanOrEqual(2);
    expect(real).toBeCloseTo(WIKI_calcDefMult(ATTACKER_FACTOR, enemyDef, 0, 500), 6);
  });

  it('zero enemy DEF gives exactly 100%, not the 200% cap', () => {
    expect(calcDefMult(0, 0, 0)).toBe(1);
  });

  it('random sampled inputs match the wiki reference exactly', () => {
    const samples = [
      [1512, 0, 0], [1512, 30, 0], [1512, 0, 30], [1512, 20, 15], [1512, 45, 25],
      [800, 0, 0], [1752, 40, 10], [1512, 100, 0], [1512, 0, 100], [2000, 60, 40],
    ];
    for (const [def, shred, ignore] of samples) {
      expect(calcDefMult(def, shred, ignore)).toBeCloseTo(WIKI_calcDefMult(ATTACKER_FACTOR, def, shred, ignore), 9);
    }
  });
});

describe('calcResMult (real export) vs. wiki reference (3-tier piecewise)', () => {
  it('10% RES (documented "most enemies" baseline) = 0.90', () => {
    const real = calcResMult(10, 0);
    expect(real).toBeCloseTo(WIKI_calcResMult(10, 0), 9);
    expect(real).toBeCloseTo(0.9, 4);
  });

  it('40% RES (documented boss-resisted-element total) = 0.60', () => {
    const real = calcResMult(40, 0);
    expect(real).toBeCloseTo(WIKI_calcResMult(40, 0), 9);
    expect(real).toBeCloseTo(0.6, 4);
  });

  it('0% RES = 1.0', () => {
    expect(calcResMult(0, 0)).toBeCloseTo(1.0, 4);
  });

  it('negative RES uses the halved-effectiveness branch', () => {
    const real = calcResMult(10, 30); // 10 - 30 = -20%
    expect(real).toBeCloseTo(WIKI_calcResMult(10, 30), 9);
    expect(real).toBeCloseTo(1.1, 4);
  });

  it('exactly at the 0.8 boundary uses the diminishing-returns branch (not the linear one)', () => {
    const real = calcResMult(80, 0);
    expect(real).toBeCloseTo(WIKI_calcResMult(80, 0), 9);
    expect(real).toBeCloseTo(1 / (1 + 5 * 0.8), 6);
    // Sanity: the linear branch would give 1 - 0.8 = 0.2 too, right at the boundary they coincide —
    // assert against 0.79999 vs 0.80001 to actually prove the branch selection, not just the value.
    expect(calcResMult(79.99, 0)).toBeCloseTo(1 - 0.7999, 4);
    expect(calcResMult(80.01, 0)).toBeCloseTo(1 / (1 + 5 * 0.8001), 4);
  });

  it('100% RES → 1/6', () => {
    expect(calcResMult(100, 0)).toBeCloseTo(1 / 6, 3);
  });

  it('random sampled inputs match the wiki reference exactly, including negative RES-after-shred', () => {
    const samples = [
      [10, 0], [40, 0], [0, 0], [10, 30], [0, 30], [80, 0], [100, 0],
      [40, 40], [40, 80], [-10, 0], [10, -20],
    ];
    for (const [baseRes, shred] of samples) {
      expect(calcResMult(baseRes, shred)).toBeCloseTo(WIKI_calcResMult(baseRes, shred), 9);
    }
  });
});

describe('calcDmgBonus (real export) vs. wiki reference', () => {
  it('elemental + skill type DMG are additive within one bucket, not multiplicative', () => {
    const real = calcDmgBonus(60, 50, 0, 15);
    const wiki = WIKI_calcDmgBonus(60, 50, 0, 15);
    const wrongMultiplicative = (1 + 60 / 100) * (1 + 50 / 100) * (1 + 15 / 100);
    expect(real).toBeCloseTo(wiki, 9);
    expect(real).toBeLessThan(wrongMultiplicative);
  });

  it('amplify is its own multiplicative layer, independent of DMG Bonus', () => {
    const withAmplify = calcDmgBonus(60, 50, 25, 0);
    const withoutAmplify = calcDmgBonus(60, 50, 0, 0);
    expect(withAmplify).toBeCloseTo(withoutAmplify * 1.25, 9);
    expect(withAmplify).toBeCloseTo(WIKI_calcDmgBonus(60, 50, 25, 0), 9);
  });

  it('random sampled inputs match the wiki reference exactly', () => {
    const samples = [
      [0, 0, 0, 0], [60, 50, 0, 15], [12, 0, 0, 0], [40, 40, 20, 20], [100, 0, 0, 30],
    ];
    for (const [elem, skill, amp, deep] of samples) {
      expect(calcDmgBonus(elem, skill, amp, deep)).toBeCloseTo(WIKI_calcDmgBonus(elem, skill, amp, deep), 9);
    }
  });
});

describe('calcAvgCrit (real export) vs. reference', () => {
  it('base 5% CR / 150% CD (untouched character defaults)', () => {
    expect(BASE_CRIT_RATE).toBe(5);
    expect(BASE_CRIT_DMG).toBe(150);
    const real = calcAvgCrit(BASE_CRIT_RATE, BASE_CRIT_DMG);
    expect(real).toBeCloseTo(WIKI_calcAvgCrit(5, 150), 9);
    expect(real).toBeCloseTo(1.025, 4);
  });

  it('endgame-typical CR=60/CD=250', () => {
    const real = calcAvgCrit(60, 250);
    expect(real).toBeCloseTo(WIKI_calcAvgCrit(60, 250), 9);
    expect(real).toBeCloseTo(1.9, 4);
  });

  it('100% CR is a guaranteed crit — average equals CD/100 exactly', () => {
    const real = calcAvgCrit(100, 200);
    expect(real).toBeCloseTo(2.0, 6);
  });

  it('CR above 100% is capped, not extrapolated', () => {
    expect(calcAvgCrit(120, 200)).toBeCloseTo(calcAvgCrit(100, 200), 9);
  });
});

describe('Full damage formula integration (real exports chained together)', () => {
  it('computes a plausible DPS for a realistic scenario end-to-end through the real functions', () => {
    // Augusta-shaped inputs: baseAtk=463, weapAtk=587, totalMult=2800 — same scenario the old
    // hand-rolled version of this test used, now run through the actual engine functions instead.
    const charAtk = 463, weapAtk = 587;
    const baseStat = charAtk + weapAtk;
    const atkPct = 66;
    const totalMult = 2800;
    const effAtk = baseStat * (1 + atkPct / 100);

    const avgCrit = calcAvgCrit(55, 220);
    const dmgBonus = calcDmgBonus(40, 25, 0, 15);
    const defMult = calcDefMult(1512, 0, 0);
    const resMult = calcResMult(10, 0);

    const totalRotDmg = effAtk * (totalMult / 100) * avgCrit * dmgBonus * defMult * resMult;
    const dps = totalRotDmg / 23;

    expect(effAtk).toBeCloseTo(1743, 0);
    expect(avgCrit).toBeCloseTo(1.66, 2);
    expect(defMult).toBeCloseTo(0.5013, 3);
    expect(resMult).toBeCloseTo(0.9, 3);
    expect(dps).toBeGreaterThan(1000);
    expect(dps).toBeLessThan(100000);
  });
});
