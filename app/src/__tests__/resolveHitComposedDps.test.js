/**
 * resolveHitComposedDps.js — Stage 1 prototype of the "totalMult → hit-composed DPS" design doc
 * (PHASE2_PLAN.md). Standalone, NOT wired into calcTeamStats.js. Proves the architecture end-to-end
 * for Yinlin (the only character with real `damage.hits` data so far), with hand-computed reference
 * numbers so the formula itself is independently verifiable, not just "whatever the code produces."
 */
import { describe, it, expect } from 'vitest';
import { resolveHitComposedDps } from '../engine/composition/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/composition/rotationSimulator.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';
import { ROVER_ELECTRO_BLOCKS } from '../engine/characterBlocks/roverElectro.blocks.js';
import { SHOREKEEPER_BLOCKS } from '../engine/characterBlocks/shorekeeper.blocks.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';
import { JINHSI_BLOCKS } from '../engine/characterBlocks/jinhsi.blocks.js';
import { CAMELLYA_BLOCKS } from '../engine/characterBlocks/camellya.blocks.js';
import { parseSkillMultiplierHits, sumHitsAtkPct } from '../engine/shared/skillMultiplierParser.js';

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

  it("Undying Sunlight: Leap's real hits (222.67%+27.84%×2) are independently hand-verifiable", () => {
    // Values corrected 2026-09-02: this row (and Augusta's entire kit) was previously off by a
    // consistent ~1.988x — roughly HALF its real value — found re-auditing against a fresh the source
    // source dump; see SKILL_MULTIPLIERS['Augusta']'s own audit comment in characters.js.
    const leapBlock = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.skill.undying-sunlight-leap');
    const steps = [{ type: 'Skill', skill: 'Undying Sunlight: Leap', stepSeconds: 1 }];
    const { hitLog, totalDamage } = resolveHitComposedDps([leapBlock], steps, NEUTRAL_ENEMY, 1000);
    expect(hitLog.map(h => h.atkPct)).toEqual([222.67, 27.84, 27.84]);
    const avgCrit = 1 + (5 / 100) * (150 / 100 - 1);
    const expected = 1000 * avgCrit * ((222.67 + 27.84 + 27.84) / 100);
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
    // Her real rotation casts Forte Ephemeral (step 5) BEFORE Outro Twining (the last step), so the
    // conditional +459.02% bonus should actually compose now — was a documented gap, closed same day
    // once resolveHitComposedDps.js/TeamDps existed to give it somewhere real to land.
    expect(firedBlockIds.has('camellya.outro.twining-ephemeral-bonus')).toBe(true);

    // The combined 'Vining Waltz 1-4 / Blazing Waltz' step appears TWICE in her rotation (Blossom
    // Mode, then again in Budding Mode) — both fire the SAME block, a documented limitation (see the
    // block's own note): confirm it actually fires twice, not deduplicated to once.
    const comboFires = hitLog.filter(h => h.blockId === 'camellya.skill.vining-waltz-combo');
    expect(comboFires.length).toBeGreaterThan(0);
    expect(comboFires.length % 12).toBe(0); // 12 hits per cast (1+2+6+3) — confirms whole-cast multiples, not a partial misfire
  });

  it("Twining's total includes BOTH the base hit (329.24%) and the conditional bonus (459.02%) when Ephemeral was cast earlier this segment — and ONLY the base hit when it wasn't", () => {
    const twiningBaseBlock = CAMELLYA_BLOCKS.find(b => b.id === 'camellya.outro.twining-base');
    const bonusBlock = CAMELLYA_BLOCKS.find(b => b.id === 'camellya.outro.twining-ephemeral-bonus');
    const blocks = [twiningBaseBlock, bonusBlock];

    // Success case: Ephemeral cast earlier this segment.
    const successSteps = [
      { isSwapIn: true, stepSeconds: 0 },
      { type: 'Forte', skill: 'Ephemeral', stepSeconds: 5 },
      { type: 'Outro', skill: 'Twining', checksPriorCast: bonusBlock.id, stepSeconds: 3 },
    ];
    const { hitLog: successLog, totalDamage: successTotal } = resolveHitComposedDps(blocks, successSteps, NEUTRAL_ENEMY, 1000);
    expect(successLog.map(h => h.atkPct).sort((a, b) => a - b)).toEqual([329.24, 459.02]);
    const avgCrit = 1 + (5 / 100) * (150 / 100 - 1);
    expect(successTotal).toBeCloseTo(1000 * avgCrit * ((329.24 + 459.02) / 100), 6);

    // Forfeit case: Ephemeral never cast this segment.
    const forfeitSteps = [
      { isSwapIn: true, stepSeconds: 0 },
      { type: 'Outro', skill: 'Twining', checksPriorCast: bonusBlock.id, stepSeconds: 3 },
    ];
    const { hitLog: forfeitLog } = resolveHitComposedDps(blocks, forfeitSteps, NEUTRAL_ENEMY, 1000);
    expect(forfeitLog.map(h => h.atkPct)).toEqual([329.24]);
  });
});

describe('resolveHitComposedDps — externalStats param (PHASE3_PLAN.md Stage 1: gear composed in from outside)', () => {
  it('omitting externalStats is byte-identical to the pre-existing behavior (backward compatible)', () => {
    const basicBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.basic.zapstrings-dance');
    const steps = [{ type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1 }];
    const withoutParam = resolveHitComposedDps([basicBlock], steps, NEUTRAL_ENEMY, 1000);
    const withNull = resolveHitComposedDps([basicBlock], steps, NEUTRAL_ENEMY, 1000, null, null, null);
    expect(withNull.totalDamage).toBeCloseTo(withoutParam.totalDamage, 10);
  });

  it('externalStats atkPct/cr/cd are pure deltas added on top of the base 5%/150% crit baseline, not a replacement of it', () => {
    const basicBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.basic.zapstrings-dance');
    const steps = [{ type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1 }];
    const baseAtk = 1000;
    const gear = { atkPct: 30, cr: 20, elemDmg: 10 };
    const { totalDamage, hitLog } = resolveHitComposedDps([basicBlock], steps, NEUTRAL_ENEMY, baseAtk, null, null, gear);

    const hits = parseSkillMultiplierHits("28.81% → 33.82%×2 → 13.99%×7 → 75.16%");
    const avgCrit = 1 + (Math.min(5 + 20, 100) / 100) * (150 / 100 - 1); // gear cr added to BASE_CRIT_RATE
    const dmgBonus = 1 + 10 / 100; // gear elemDmg, no category match
    const effAtk = baseAtk * (1 + 30 / 100); // gear atkPct added to base
    const expectedTotal = hits.reduce((sum, h) => sum + effAtk * (h.atkPct / 100) * avgCrit * dmgBonus, 0);

    expect(totalDamage).toBeCloseTo(expectedTotal, 6);
    expect(hitLog).toHaveLength(11);
  });
});

describe('resolveHitComposedDps — instant cast-triggered buff with no duration (fixed 2026-09-04)', () => {
  it('a buff block with trigger.type "cast" and no timing.duration actually applies to the hit landing in that same step, instead of being silently dropped', () => {
    // Minimal hand-built reproduction of the bug found auditing Changli's S3 (Radiance of Fealty
    // DMG +80%, an instant cast-scoped Resonance Chain node with no duration field): before this fix,
    // such a block fell into neither of statsAtInstant's two buckets (buffWindows needs a real
    // timing.duration, passiveBlocks needs trigger.type 'passive'), so it silently never fired at all.
    const damageBlock = {
      id: 'test.damage', kind: 'damage',
      trigger: { type: 'cast', on: 'Skill:Test Move' },
      timing: {}, target: { scope: 'self' }, effects: [],
      damage: { hits: [{ atkPct: 100 }], category: 'skillDmg' },
    };
    const instantBuff = {
      id: 'test.instant-buff', kind: 'buff',
      trigger: { type: 'cast', on: 'Skill:Test Move' },
      timing: {}, // no duration — this is the exact shape that was being dropped
      target: { scope: 'self' },
      effects: [{ stat: 'skillDmg', value: 80 }],
    };
    const steps = [{ type: 'Skill', skill: 'Test Move', stepSeconds: 1 }];
    const baseAtk = 1000;

    const withBuff = resolveHitComposedDps([damageBlock, instantBuff], steps, NEUTRAL_ENEMY, baseAtk);
    const withoutBuff = resolveHitComposedDps([damageBlock], steps, NEUTRAL_ENEMY, baseAtk);

    expect(withBuff.totalDamage).toBeCloseTo(withoutBuff.totalDamage * 1.8, 6); // +80% skillDmg on a skillDmg hit
    expect(withBuff.totalDamage).toBeGreaterThan(withoutBuff.totalDamage);
  });

  it('an instant cast-buff scoped to a DIFFERENT trigger does not leak into an unrelated hit landing at another step', () => {
    const moveA = {
      id: 'test.move-a', kind: 'damage',
      trigger: { type: 'cast', on: 'Skill:Move A' },
      timing: {}, target: { scope: 'self' }, effects: [],
      damage: { hits: [{ atkPct: 100 }], category: 'skillDmg' },
    };
    const moveB = {
      id: 'test.move-b', kind: 'damage',
      trigger: { type: 'cast', on: 'Skill:Move B' },
      timing: {}, target: { scope: 'self' }, effects: [],
      damage: { hits: [{ atkPct: 100 }], category: 'skillDmg' },
    };
    const buffOnA = {
      id: 'test.buff-on-a', kind: 'buff',
      trigger: { type: 'cast', on: 'Skill:Move A' },
      timing: {}, target: { scope: 'self' },
      effects: [{ stat: 'skillDmg', value: 80 }],
    };
    const steps = [{ type: 'Skill', skill: 'Move A', stepSeconds: 1 }, { type: 'Skill', skill: 'Move B', stepSeconds: 1 }];
    const { hitLog } = resolveHitComposedDps([moveA, moveB, buffOnA], steps, NEUTRAL_ENEMY, 1000);
    const hitA = hitLog.find(h => h.blockId === 'test.move-a');
    const hitB = hitLog.find(h => h.blockId === 'test.move-b');
    expect(hitA.damage).toBeGreaterThan(hitB.damage); // only A's own step should carry the +80% bonus
  });
});
