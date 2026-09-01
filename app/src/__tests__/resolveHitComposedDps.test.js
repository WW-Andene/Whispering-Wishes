/**
 * resolveHitComposedDps.js — Stage 1 prototype of the "totalMult → hit-composed DPS" design doc
 * (PHASE2_PLAN.md). Standalone, NOT wired into calcTeamStats.js. Proves the architecture end-to-end
 * for Yinlin (the only character with real `damage.hits` data so far), with hand-computed reference
 * numbers so the formula itself is independently verifiable, not just "whatever the code produces."
 */
import { describe, it, expect } from 'vitest';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';
import { parseSkillMultiplierHits, sumHitsAtkPct } from '../engine/skillMultiplierParser.js';

// Zero DEF/RES so defMult/resMult both come out to exactly 1 — isolates the test to just the
// ATK%/crit/dmgBonus portion of the formula, matching a hand-computable reference number.
const NEUTRAL_ENEMY = { enemyDef: 0, enemyRes: 0 };

describe('resolveHitComposedDps — hand-computed baseline (no buffs, neutral enemy)', () => {
  it("Yinlin's 4-stage Basic ATK combo sums to a hand-verifiable total with only base Crit Rate/DMG applied", () => {
    const basicBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.basic.zapstrings-dance');
    const steps = [{ type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1 }];
    const baseAtk = 1000;

    const { totalDamage, hitLog } = resolveHitComposedDps([basicBlock], steps, NEUTRAL_ENEMY, baseAtk);

    expect(hitLog).toHaveLength(11); // 1 + 2 + 7 + 1 hits, per the row's own stage breakdown
    const hits = parseSkillMultiplierHits("28.81% → 33.82%×2 → 13.99%×7 → 75.16%");
    const avgCrit = 1 + (5 / 100) * (150 / 100 - 1); // BASE_CRIT_RATE=5, BASE_CRIT_DMG=150, no buffs
    const expectedTotal = hits.reduce((sum, h) => sum + baseAtk * (h.atkPct / 100) * avgCrit, 0);

    expect(totalDamage).toBeCloseTo(expectedTotal, 6);
    expect(totalDamage).toBeCloseTo(1000 * avgCrit * (sumHitsAtkPct(hits) / 100), 6);
  });

  it('a hit with no matching trigger this rotation contributes nothing', () => {
    const basicBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.basic.zapstrings-dance');
    const steps = [{ type: 'Skill', skill: 'Magnetic Roar', stepSeconds: 1 }]; // Basic ATK never cast
    const { totalDamage, hitLog } = resolveHitComposedDps([basicBlock], steps, NEUTRAL_ENEMY, 1000);
    expect(hitLog).toHaveLength(0);
    expect(totalDamage).toBe(0);
  });
});

describe('resolveHitComposedDps — a passive buff correctly boosts only its own damage category', () => {
  it("S1 (skillDmg +70, passive) raises Magnetic Roar's damage (category: 'skillDmg') but NOT Basic ATK's (category: 'basicDmg')", () => {
    const basicBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.basic.zapstrings-dance');
    const magneticRoarBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.skill.magnetic-roar');
    const s1 = YINLIN_BLOCKS.find(b => b.id === 'yinlin.chain.s1-moralitys-crossroad');
    expect(s1.effects[0]).toEqual({ stat: 'skillDmg', value: 70 });

    const relevantBlocks = [basicBlock, magneticRoarBlock, s1];
    const baseAtk = 1000;

    const withoutS1 = resolveHitComposedDps([basicBlock, magneticRoarBlock], [
      { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1 },
      { type: 'Skill', skill: 'Magnetic Roar', stepSeconds: 1 },
    ], NEUTRAL_ENEMY, baseAtk);

    const withS1 = resolveHitComposedDps(relevantBlocks, [
      { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1 },
      { type: 'Skill', skill: 'Magnetic Roar', stepSeconds: 1 },
    ], NEUTRAL_ENEMY, baseAtk);

    const basicDamageWithout = withoutS1.hitLog.filter(h => h.blockId === 'yinlin.basic.zapstrings-dance').reduce((s, h) => s + h.damage, 0);
    const basicDamageWith = withS1.hitLog.filter(h => h.blockId === 'yinlin.basic.zapstrings-dance').reduce((s, h) => s + h.damage, 0);
    const skillDamageWithout = withoutS1.hitLog.filter(h => h.blockId === 'yinlin.skill.magnetic-roar').reduce((s, h) => s + h.damage, 0);
    const skillDamageWith = withS1.hitLog.filter(h => h.blockId === 'yinlin.skill.magnetic-roar').reduce((s, h) => s + h.damage, 0);

    expect(basicDamageWith).toBeCloseTo(basicDamageWithout, 6); // untouched — S1 only affects skillDmg
    expect(skillDamageWith).toBeGreaterThan(skillDamageWithout); // Magnetic Roar (skillDmg category) DOES get boosted
    expect(skillDamageWith / skillDamageWithout).toBeCloseTo(1.7, 5); // exactly +70%
  });
});

describe('resolveHitComposedDps — proc composition (S6 Furious Thunder)', () => {
  it('a hand-built rotation that actually LANDS a qualifying Basic ATK inside the post-Liberation proc window adds a real extra hit at 419.59% ATK', () => {
    const s6 = YINLIN_BLOCKS.find(b => b.id === 'yinlin.chain.s6-pursuit-of-justice');
    const steps = [
      { type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 1 }, // opens the 30s window
      { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 3, triesProc: s6.id }, // well within it
    ];
    const { hitLog } = resolveHitComposedDps(YINLIN_BLOCKS, steps, { enemyDef: 0, enemyRes: 0 }, 1000, 'electro', 'Sub DPS');
    const procHits = hitLog.filter(h => h.blockId === s6.id);
    expect(procHits).toHaveLength(1);
    expect(procHits[0].atkPct).toBe(419.59);
    expect(procHits[0].category).toBe('skillDmg');
  });

  it('the SAME rotation but with the qualifying Basic ATK landing AFTER the 30s window closes adds no extra hit', () => {
    const s6 = YINLIN_BLOCKS.find(b => b.id === 'yinlin.chain.s6-pursuit-of-justice');
    const steps = [
      { type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 1 },
      { type: 'Echo', skill: 'Use Echo', stepSeconds: 31 }, // stalls past the 30s window
      { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 0.5, triesProc: s6.id },
    ];
    const { hitLog } = resolveHitComposedDps(YINLIN_BLOCKS, steps, { enemyDef: 0, enemyRes: 0 }, 1000, 'electro', 'Sub DPS');
    expect(hitLog.filter(h => h.blockId === s6.id)).toHaveLength(0);
  });

  it('4 qualifying Basic ATKs within one window produce exactly 4 proc hits — the 5th does not (maxProcs cap)', () => {
    const s6 = YINLIN_BLOCKS.find(b => b.id === 'yinlin.chain.s6-pursuit-of-justice');
    const basicStep = { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1, triesProc: s6.id };
    const steps = [
      { type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 1 },
      basicStep, basicStep, basicStep, basicStep, basicStep, // 5 attempts, cap is 4
    ];
    const { hitLog } = resolveHitComposedDps(YINLIN_BLOCKS, steps, { enemyDef: 0, enemyRes: 0 }, 1000, 'electro', 'Sub DPS');
    expect(hitLog.filter(h => h.blockId === s6.id)).toHaveLength(4);
  });
});

describe('resolveHitComposedDps — end-to-end against REAL CHARACTER_ROTATIONS data (Yinlin)', () => {
  it("computes a real total across her whole rotation; the S6 Furious Thunder proc correctly contributes ZERO here — a genuine finding about THIS canonical rotation (established earlier in rotationSimulator.test.js), not an engine limitation: her real post-Liberation Basic ATK step is a single tap (\"Stage 1\"), a different skill label than the proc's `on` (\"Stage 1-4\"), so nothing in this specific sequence attempts a qualifying hit inside the open window", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yinlin'], YINLIN_BLOCKS);
    const { totalDamage, dps, hitLog } = resolveHitComposedDps(YINLIN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'electro', 'Sub DPS');

    expect(totalDamage).toBeGreaterThan(0);
    expect(dps).toBeGreaterThan(0);
    expect(hitLog.some(h => h.blockId === 'yinlin.chain.s6-pursuit-of-justice')).toBe(false);

    // Every 'cast'-triggered damage block DOES fire at least once in her real rotation (Basic ATK,
    // Magnetic Roar, Lightning Execution, Thundering Wrath).
    const firedBlockIds = new Set(hitLog.map(h => h.blockId));
    expect(firedBlockIds.has('yinlin.basic.zapstrings-dance')).toBe(true);
    expect(firedBlockIds.has('yinlin.skill.magnetic-roar')).toBe(true);
    expect(firedBlockIds.has('yinlin.skill.lightning-execution')).toBe(true);
    expect(firedBlockIds.has('yinlin.liberation.thundering-wrath')).toBe(true);
    // Chameleon Cipher does NOT fire here — a real, SEPARATE gap found while writing this test, not
    // introduced by this file: its trigger.type is 'resource-threshold' (Judgment Points reaching
    // 100), but simulateRotation() never simulates resource-gauge accumulation at all — there's no
    // numeric Judgment Points state anywhere in the engine, and CHARACTER_ROTATIONS' own step data
    // has no structured gauge values to derive it from (only prose notes like "Once Judgment Points
    // hit 100/100"). Fixing that properly needs real resource-state simulation, a genuinely separate
    // and larger piece of work than this hit-composition prototype — documented here rather than
    // silently asserted as working. Judgement Strike (on-hit-triggered, off-field) correctly doesn't
    // fire from a plain step walkthrough either, for an unrelated, expected reason (nothing in a
    // simple rotation walkthrough represents "the target took damage").
    expect(firedBlockIds.has('yinlin.forte.chameleon-cipher')).toBe(false);
    expect(firedBlockIds.has('yinlin.coordatk.judgement-strike')).toBe(false);
  });
});
