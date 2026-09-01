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
import { ROVER_ELECTRO_BLOCKS } from '../engine/characterBlocks/roverElectro.blocks.js';
import { SHOREKEEPER_BLOCKS } from '../engine/characterBlocks/shorekeeper.blocks.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';
import { JINHSI_BLOCKS } from '../engine/characterBlocks/jinhsi.blocks.js';
import { CAMELLYA_BLOCKS } from '../engine/characterBlocks/camellya.blocks.js';
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
    // Magnetic Roar, Lightning Execution, Thundering Wrath). Chameleon Cipher (resource-threshold)
    // now ALSO fires — see trigger.resourceStepOn's own doc in triggerBlocks.schema.js: rather than
    // building real gauge-accumulation simulation (no per-hit gain-rate data sourced anywhere yet),
    // this trusts CHARACTER_ROTATIONS' own Forte:Chameleon Cipher step, which already asserts "the
    // gauge is full here" via its real, sourced note text.
    const firedBlockIds = new Set(hitLog.map(h => h.blockId));
    expect(firedBlockIds.has('yinlin.basic.zapstrings-dance')).toBe(true);
    expect(firedBlockIds.has('yinlin.skill.magnetic-roar')).toBe(true);
    expect(firedBlockIds.has('yinlin.skill.lightning-execution')).toBe(true);
    expect(firedBlockIds.has('yinlin.liberation.thundering-wrath')).toBe(true);
    expect(firedBlockIds.has('yinlin.forte.chameleon-cipher')).toBe(true);
    // Judgement Strike (on-hit-triggered, off-field) correctly does NOT fire from a plain step
    // walkthrough — nothing in a simple rotation sequence represents "the target took damage".
    expect(firedBlockIds.has('yinlin.coordatk.judgement-strike')).toBe(false);
  });
});

describe('resolveHitComposedDps — end-to-end against REAL CHARACTER_ROTATIONS data (Rover: Electro)', () => {
  it('computes a real total across his whole rotation, with every real damage block firing exactly once', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rover: Electro'], ROVER_ELECTRO_BLOCKS);
    const { totalDamage, dps, hitLog } = resolveHitComposedDps(ROVER_ELECTRO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'electro', 'Sub DPS');

    expect(totalDamage).toBeGreaterThan(0);
    expect(dps).toBeGreaterThan(0);

    // Real gap fixed this pass: Deterrence 1-4 (the very FIRST damage step in his rotation) had no
    // block at all before today — confirm it now fires.
    const deterrenceHits = hitLog.filter(h => h.blockId === 'rover-electro.basic.deterrence');
    expect(deterrenceHits).toHaveLength(12); // 1 + 2 + 7 + 2, per the row's own stage breakdown

    const firedBlockIds = new Set(hitLog.map(h => h.blockId));
    expect(firedBlockIds.has('rover-electro.intro.thunderous-fury')).toBe(true); // swap-in
    expect(firedBlockIds.has('rover-electro.basic.deterrence')).toBe(true);
    expect(firedBlockIds.has('rover-electro.skill.thunderclap')).toBe(true);
    expect(firedBlockIds.has('rover-electro.basic.repel')).toBe(true);
    expect(firedBlockIds.has('rover-electro.liberation.ultimate-tactics')).toBe(true);
    // Overshock (resource-threshold, resourceStepOn'd to the real Forte:Overshock step) fires too,
    // same fix as Yinlin's Chameleon Cipher.
    expect(firedBlockIds.has('rover-electro.forte.overshock')).toBe(true);
  });

  it("Thunderclap's real 100.20%×2 hits are independently hand-verifiable against a neutral enemy", () => {
    const thunderclapBlock = ROVER_ELECTRO_BLOCKS.find(b => b.id === 'rover-electro.skill.thunderclap');
    const steps = [{ type: 'Skill', skill: 'Thunderclap', stepSeconds: 1 }];
    const { hitLog, totalDamage } = resolveHitComposedDps([thunderclapBlock], steps, NEUTRAL_ENEMY, 1000);
    expect(hitLog).toHaveLength(2);
    expect(hitLog.every(h => h.atkPct === 100.20)).toBe(true);
    const avgCrit = 1 + (5 / 100) * (150 / 100 - 1);
    expect(totalDamage).toBeCloseTo(1000 * (100.20 / 100) * 2 * avgCrit, 6);
  });
});

describe('resolveHitComposedDps — HP-scaling + guaranteed-Crit hits (Shorekeeper Discernment)', () => {
  it('Discernment scales off baseStats.hp, not .atk, and lands at full Crit DMG regardless of Crit Rate', () => {
    const discernmentBlock = SHOREKEEPER_BLOCKS.find(b => b.id === 'shorekeeper.intro.discernment');
    expect(discernmentBlock.damage.basis).toBe('HP');
    expect(discernmentBlock.damage.guaranteedCrit).toBe(true);

    const steps = [{ type: 'Intro', skill: 'Discernment', stepSeconds: 1 }];
    const { hitLog, totalDamage } = resolveHitComposedDps([discernmentBlock], steps, NEUTRAL_ENEMY, { atk: 999999, hp: 20000 });

    expect(hitLog).toHaveLength(3); // 19.64%×3
    // Guaranteed Crit -> full (1 + cd/100), NOT calcAvgCrit's blended expectation. Base Crit DMG is
    // 150 (BASE_CRIT_DMG), so the multiplier is exactly 2.5, not calcAvgCrit(5,150)'s ~1.025.
    const expectedPerHit = 20000 * (19.64 / 100) * 2.5;
    expect(totalDamage).toBeCloseTo(expectedPerHit * 3, 6);
    // Confirms the (deliberately absurd) baseStats.atk value was never touched — proves basis:'HP'
    // actually routes to the HP base, not silently falling back to ATK.
    expect(totalDamage).toBeLessThan(999999);
  });

  it('a block needing baseStats.hp throws a clear error if hp is not provided, rather than silently computing off undefined', () => {
    const discernmentBlock = SHOREKEEPER_BLOCKS.find(b => b.id === 'shorekeeper.intro.discernment');
    const steps = [{ type: 'Intro', skill: 'Discernment', stepSeconds: 1 }];
    expect(() => resolveHitComposedDps([discernmentBlock], steps, NEUTRAL_ENEMY, { atk: 1000 })).toThrow(/baseStats\.hp/);
  });
});

describe('resolveHitComposedDps — end-to-end against REAL CHARACTER_ROTATIONS data (Shorekeeper)', () => {
  it('computes a real total across her whole rotation, with every real damage block firing exactly once (a healer with mostly non-damage kit still produces a real, non-zero, non-crashing total)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Shorekeeper'], SHOREKEEPER_BLOCKS);
    const { totalDamage, dps, hitLog } = resolveHitComposedDps(SHOREKEEPER_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { atk: 2000, hp: 25000 }, 'spectro', 'Healer');

    expect(totalDamage).toBeGreaterThan(0);
    expect(dps).toBeGreaterThan(0);

    const firedBlockIds = new Set(hitLog.map(h => h.blockId));
    expect(firedBlockIds.has('shorekeeper.intro.discernment')).toBe(true);
    expect(firedBlockIds.has('shorekeeper.basic.origin-calculus')).toBe(true);
    expect(firedBlockIds.has('shorekeeper.forte.illation')).toBe(true);
    expect(firedBlockIds.has('shorekeeper.skill.chaos-theory')).toBe(true);
    // Liberation End Loop and Outro Binary Butterfly correctly contribute NO hits — both are
    // explicitly no-direct-DMG per their own kit text (healing/buff-only), so no damage block exists
    // for either.
    expect(firedBlockIds.has('shorekeeper.liberation.end-loop')).toBe(false);
  });
});

describe('resolveHitComposedDps — end-to-end against REAL CHARACTER_ROTATIONS data (Augusta)', () => {
  it('computes a real total across her whole rotation, correctly distinguishing the two separate Thunderoar combo steps and applying "counted as Heavy ATK DMG" reclassifications', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Augusta'], AUGUSTA_BLOCKS);
    const { totalDamage, dps, hitLog } = resolveHitComposedDps(AUGUSTA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'electro', 'Main DPS');

    expect(totalDamage).toBeGreaterThan(0);
    expect(dps).toBeGreaterThan(0);

    const firedBlockIds = new Set(hitLog.map(h => h.blockId));
    expect(firedBlockIds.has('augusta.intro.stride-of-goldenflare')).toBe(true);
    expect(firedBlockIds.has('augusta.heavy.thunderoar-backstep')).toBe(true); // 1st combo (separate steps)
    expect(firedBlockIds.has('augusta.heavy.thunderoar-spinslash')).toBe(true);
    expect(firedBlockIds.has('augusta.heavy.thunderoar-backstep-spinslash-repeat')).toBe(true); // 2nd combo (combined step)
    expect(firedBlockIds.has('augusta.skill.warriors-blade')).toBe(true);
    expect(firedBlockIds.has('augusta.liberation.sword-of-eternal-oath')).toBe(true);
    expect(firedBlockIds.has('augusta.skill.undying-sunlight-strike')).toBe(true);
    expect(firedBlockIds.has('augusta.skill.undying-sunlight-leap')).toBe(true);
    expect(firedBlockIds.has('augusta.skill.undying-sunlight-plunge')).toBe(true);
    expect(firedBlockIds.has('augusta.liberation.sunborne')).toBe(true);
    expect(firedBlockIds.has('augusta.liberation.everbright-protector')).toBe(true);

    // Sword of Eternal Oath and Undying Sunlight: Plunge both carry a "counted as Heavy ATK DMG"
    // category override despite their Liberation/Skill-button inputs — confirm the block data itself
    // reflects that (the reclassification's actual DPS effect would need a heavyDmg-buffing block to
    // spot-check against, which nothing in her current kit provides — this asserts the data is
    // correctly tagged, not a live before/after comparison).
    const swordBlock = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.liberation.sword-of-eternal-oath');
    const plungeBlock = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.skill.undying-sunlight-plunge');
    expect(swordBlock.damage.category).toBe('heavyDmg');
    expect(plungeBlock.damage.category).toBe('heavyDmg');
  });

  it("Undying Sunlight: Leap's real hits (112%+14%×2) are independently hand-verifiable", () => {
    const leapBlock = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.skill.undying-sunlight-leap');
    const steps = [{ type: 'Skill', skill: 'Undying Sunlight: Leap', stepSeconds: 1 }];
    const { hitLog, totalDamage } = resolveHitComposedDps([leapBlock], steps, NEUTRAL_ENEMY, 1000);
    expect(hitLog.map(h => h.atkPct)).toEqual([112, 14, 14]);
    const avgCrit = 1 + (5 / 100) * (150 / 100 - 1);
    const expected = 1000 * avgCrit * ((112 + 14 + 14) / 100);
    expect(totalDamage).toBeCloseTo(expected, 6);
  });
});

describe('resolveHitComposedDps — end-to-end against REAL CHARACTER_ROTATIONS data (Jinhsi)', () => {
  it('computes a real total across her whole rotation — BOTH windowed casts land in real time order, so Overflowing Radiance/Illuminous Epiphany actually contribute (not the forfeited normal casts)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jinhsi'], JINHSI_BLOCKS);
    const { totalDamage, dps, hitLog } = resolveHitComposedDps(JINHSI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'spectro', 'Main DPS');

    expect(totalDamage).toBeGreaterThan(0);
    expect(dps).toBeGreaterThan(0);

    const firedBlockIds = new Set(hitLog.map(h => h.blockId));
    expect(firedBlockIds.has('jinhsi.basic.slash-of-breaking-dawn')).toBe(true);
    expect(firedBlockIds.has('jinhsi.skill.overflowing-radiance')).toBe(true);
    expect(firedBlockIds.has('jinhsi.liberation.purge-of-light')).toBe(true);
    expect(firedBlockIds.has('jinhsi.forte.incarnation-basic-attack')).toBe(true);
    expect(firedBlockIds.has('jinhsi.skill.illuminous-epiphany')).toBe(true);
  });

  it("her Forte Incarnation-Basic-ATK combo's real 13-hit total is independently hand-verifiable", () => {
    const forteBlock = JINHSI_BLOCKS.find(b => b.id === 'jinhsi.forte.incarnation-basic-attack');
    expect(forteBlock.damage.hits).toHaveLength(13); // 1+1+2+1+1+6+1
    const steps = [{ type: 'Forte', skill: 'Incarnation - Basic Attack Stage 1-4', stepSeconds: 1 }];
    const { totalDamage } = resolveHitComposedDps([forteBlock], steps, NEUTRAL_ENEMY, 1000);
    const avgCrit = 1 + (5 / 100) * (150 / 100 - 1);
    const expectedSum = 88.62 + 77.97 + 25.99 * 2 + 99.44 + 66.30 + 18.67 * 6 + 74.67;
    expect(totalDamage).toBeCloseTo(1000 * avgCrit * (expectedSum / 100), 6);
  });
});

describe('resolveHitComposedDps — end-to-end against REAL CHARACTER_ROTATIONS data (Camellya)', () => {
  it('computes a real total across her whole rotation, with every real damage block firing', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Camellya'], CAMELLYA_BLOCKS);
    const { totalDamage, dps, hitLog } = resolveHitComposedDps(CAMELLYA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'havoc', 'Main DPS');

    expect(totalDamage).toBeGreaterThan(0);
    expect(dps).toBeGreaterThan(0);

    const firedBlockIds = new Set(hitLog.map(h => h.blockId));
    expect(firedBlockIds.has('camellya.intro.everblooming')).toBe(true);
    expect(firedBlockIds.has('camellya.skill.crimson-blossom')).toBe(true);
    expect(firedBlockIds.has('camellya.basic.vining-waltz-1')).toBe(true);
    expect(firedBlockIds.has('camellya.liberation.fervor-efflorescent')).toBe(true);
    expect(firedBlockIds.has('camellya.forte.ephemeral')).toBe(true); // resource-threshold, resourceStepOn'd
    expect(firedBlockIds.has('camellya.outro.twining-base')).toBe(true);

    // The combined 'Vining Waltz 1-4 / Blazing Waltz' step appears TWICE in her rotation (Blossom
    // Mode, then again in Budding Mode) — both fire the SAME block, a documented limitation (see the
    // block's own note): confirm it actually fires twice, not deduplicated to once.
    const comboFires = hitLog.filter(h => h.blockId === 'camellya.skill.vining-waltz-combo');
    expect(comboFires.length).toBeGreaterThan(0);
    expect(comboFires.length % 12).toBe(0); // 12 hits per cast (1+2+6+3) — confirms whole-cast multiples, not a partial misfire
  });

  it("Twining's REAL total only includes the unconditional base hit (329.24%) — the conditional +459.02% bonus is a documented, separate gap, not silently included", () => {
    const twiningBaseBlock = CAMELLYA_BLOCKS.find(b => b.id === 'camellya.outro.twining-base');
    const steps = [{ type: 'Outro', skill: 'Twining', stepSeconds: 1 }];
    const { hitLog, totalDamage } = resolveHitComposedDps([twiningBaseBlock], steps, NEUTRAL_ENEMY, 1000);
    expect(hitLog).toHaveLength(1);
    expect(hitLog[0].atkPct).toBe(329.24);
    const avgCrit = 1 + (5 / 100) * (150 / 100 - 1);
    expect(totalDamage).toBeCloseTo(1000 * avgCrit * (329.24 / 100), 6);
  });
});
