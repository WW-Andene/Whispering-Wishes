import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { LINGYANG_BLOCKS } from '../engine/characterBlocks/lingyang.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Lingyang', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(LINGYANG_BLOCKS, 'Lingyang');
  });

  it('S1/S2 stay correctly unmodeled (no block) — pure poise/resource-gain utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Lingyang'];
    expect(rc.s1).toEqual({ totalMult: 0 });
    expect(rc.s2).toEqual({ totalMult: 0 });
    expect(LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s1')).toBeUndefined();
    expect(LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s2')).toBeUndefined();
  });

  it('S3/S4/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lingyang'];
    const s3 = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s3');
    expect(s3.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s3.basicDmg);
    expect(s3.effects.find(e => e.stat === 'skillDmg').value).toBe(rc.s3.skillDmg);
    expect(LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s4').effects[0].value).toBe(rc.s4.elemDmg);
    expect(LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s6').effects[0].value).toBe(rc.s6.basicDmg);
  });

  it('S5 is modeled as a real 200%-ATK proc-damage block, not the flat totalMult approximation', () => {
    const rc = RESONANCE_CHAIN_DATA['Lingyang'];
    expect(rc.s5).toEqual({ totalMult: 200 });
    expect(LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s5')).toBeUndefined();
    const s5 = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s5-bonus-hit');
    expect(s5.kind).toBe('damage');
    expect(s5.damage.hits[0].atkPct).toBe(200);
  });

  it('S4 is team-wide with a real 30s window', () => {
    const s4 = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('selfBuff matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Lingyang'];
    const self = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.selfbuff.strive');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(self.timing.duration).toBe(legacy.selfBuffs[0].duration);
  });

  // Split 2026-09-09 (full-kit audit) into 2 blocks (P1/P2) since Feral Gyrate's own Part 1/Part 2
  // are now modeled as distinct alternating casts (see lingyang.blocks.js's own header comment) —
  // "each Basic Attack" applies to both.
  it('Diligent Practice matches CHAR_BUFF_TABLE and is scoped to Mountain Roamer only (no over-crediting), for both Feral Gyrate parts', () => {
    const legacy = CHAR_BUFF_TABLE['Lingyang'];
    const p1 = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.selfbuff.diligent-practice-p1');
    const p2 = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.selfbuff.diligent-practice-p2');
    for (const diligent of [p1, p2]) {
      expect(diligent.effects[0].value).toBe(legacy.selfBuffs[1].value);
      expect(diligent.timing.duration).toBe(legacy.selfBuffs[1].duration);
      expect(diligent.effects[0].scopedToBlockId).toBe('lingyang.skill.ancient-arts');
    }
    expect(p1.trigger.on).toBe('Basic ATK:Majestic Fists P1');
    expect(p2.trigger.on).toBe('Basic ATK:Majestic Fists P2');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lingyang'], LINGYANG_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LINGYANG_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'glacio', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lingyang.intro.lion-awakens')).toBe(true);
    expect(fired.has("lingyang.liberation.strive-lions-vigor")).toBe(true);
    expect(fired.has('lingyang.forte.glorious-plunge')).toBe(true);
    expect(fired.has('lingyang.chain.s5-bonus-hit')).toBe(true);
  });

  it("Inherent Skill Lion's Pride was entirely missing — now modeled as a self-buff scoped only to the Intro hit", () => {
    const pride = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.selfbuff.lions-pride');
    expect(pride).toBeDefined();
    expect(pride.effects[0]).toEqual({ stat: 'totalMult', value: 50, scopedToBlockId: 'lingyang.intro.lion-awakens', source: 'self-kit' });
    expect(pride.trigger.on).toBe('Intro:Lion Awakens');
  });

  it("Intro (Lion Awakens) is skillDmg-categorized (was uncategorized)", () => {
    const intro = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.intro.lion-awakens');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("Forte (Glorious Plunge) is heavyDmg-categorized (was uncategorized) — entered by holding Heavy Attack per the dump's kit text", () => {
    const forte = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.forte.glorious-plunge');
    expect(forte.damage.category).toBe('heavyDmg');
  });

  it("Outro (Frosty Marks) is outroDmg-categorized (was uncategorized) — pure damage, no baseline team buff", () => {
    const outro = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.outro.frosty-marks');
    expect(outro.damage.category).toBe('outroDmg');
  });

  it("dmgFocus gains 'Skill'/'Outro'/'Liberation' (real 31.7%/13.9%/7.3% shares, now correctly categorized) — Heavy ATK (5.8%), Echo (5.77%, generic equipped-Echo damage), and Intro (~4.25%) all stay excluded per this project's own precedent", () => {
    expect(CHARACTER_DATA['Lingyang'].dmgFocus).toEqual(['Basic ATK', 'Skill', 'Outro', 'Liberation']);
  });

  it("Stormy Kicks and Tail Strike were entirely missing damage blocks — now modeled and present in CHARACTER_ROTATIONS per the source's own sample rotation", () => {
    const stormyKicks = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.basic.stormy-kicks');
    expect(stormyKicks).toBeDefined();
    expect(stormyKicks.damage.category).toBe('basicDmg');
    expect(stormyKicks.trigger.on).toBe('Basic ATK:Stormy Kicks');

    const tailStrike = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.midair.tail-strike');
    expect(tailStrike).toBeDefined();
    expect(tailStrike.damage.category).toBe('basicDmg');
    expect(tailStrike.trigger.on).toBe('Mid-air:Tail Strike');

    const rotation = CHARACTER_ROTATIONS['Lingyang'];
    expect(rotation.some(s => s.type === 'Basic ATK' && s.skill === 'Stormy Kicks')).toBe(true);
    expect(rotation.some(s => s.type === 'Mid-air' && s.skill === 'Tail Strike')).toBe(true);
  });

  it('Stormy Kicks and Tail Strike both actually fire in the real simulated rotation', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lingyang'], LINGYANG_BLOCKS);
    const { hitLog } = resolveHitComposedDps(LINGYANG_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'glacio', 'Main DPS');
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lingyang.basic.stormy-kicks')).toBe(true);
    expect(fired.has('lingyang.midair.tail-strike')).toBe(true);
  });

  // Found 2026-09-09 (full-kit audit): CHARACTER_ROTATIONS['Lingyang'] previously had only 1 Basic ATK
  // + 1 Skill step total, silently dropping 80% of the real rotation — the dump's own Sample Rotation
  // text explicitly lists 5 Basic Attack casts (Feral Gyrate, alternating Part 1/Part 2) and 4 Skill
  // casts (Mountain Roamer), matching its own separately-stated "9 independent attacks fit within the
  // Ultimate's duration." Also, Feral Gyrate's own Part 1 (87.08%×2+116.11%) and Part 2 (31.77%×6)
  // are genuinely different values — Part 2 had no block at all before this pass.
  it('CHARACTER_ROTATIONS now has the real 9-cast alternating sequence (5 Basic Feral Gyrate P1/P2 + 4 Skill Mountain Roamer), not the old 1+1', () => {
    const rotation = CHARACTER_ROTATIONS['Lingyang'];
    const basicSteps = rotation.filter(s => s.type === 'Basic ATK' && s.skill.startsWith('Majestic Fists'));
    const skillSteps = rotation.filter(s => s.type === 'Skill' && s.skill === 'Ancient Arts');
    expect(basicSteps).toHaveLength(5);
    expect(skillSteps).toHaveLength(4);
    // Real alternation: P1, P2, P1, P2, P1.
    expect(basicSteps.map(s => s.skill)).toEqual([
      'Majestic Fists P1', 'Majestic Fists P2', 'Majestic Fists P1', 'Majestic Fists P2', 'Majestic Fists P1',
    ]);
  });

  it('Feral Gyrate Part 1 and Part 2 are modeled as 2 separate blocks with genuinely different %ATK values, both firing in the real rotation', () => {
    const p1 = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.basic.feral-gyrate-p1');
    const p2 = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.basic.feral-gyrate-p2');
    expect(p1.damage.hits).toEqual([{ atkPct: 87.08 }, { atkPct: 87.08 }, { atkPct: 116.11 }]);
    expect(p2.damage.hits).toEqual([{ atkPct: 31.77 }, { atkPct: 31.77 }, { atkPct: 31.77 }, { atkPct: 31.77 }, { atkPct: 31.77 }, { atkPct: 31.77 }]);

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lingyang'], LINGYANG_BLOCKS);
    const { hitLog } = resolveHitComposedDps(LINGYANG_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'glacio', 'Main DPS');
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lingyang.basic.feral-gyrate-p1')).toBe(true);
    expect(fired.has('lingyang.basic.feral-gyrate-p2')).toBe(true);
    // 3 real P1 casts x 3 sub-hits + 2 real P2 casts x 6 sub-hits.
    const p1Hits = hitLog.filter(h => h.blockId === 'lingyang.basic.feral-gyrate-p1');
    const p2Hits = hitLog.filter(h => h.blockId === 'lingyang.basic.feral-gyrate-p2');
    expect(p1Hits).toHaveLength(9);
    expect(p2Hits).toHaveLength(12);
  });

  it('Mountain Roamer (Skill:Ancient Arts) fires all 4 real times, not just once', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lingyang'], LINGYANG_BLOCKS);
    const { hitLog } = resolveHitComposedDps(LINGYANG_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'glacio', 'Main DPS');
    const mountainRoamerHits = hitLog.filter(h => h.blockId === 'lingyang.skill.ancient-arts');
    // Each cast is 2 sub-hits (82.88%×2) — 4 real casts x 2 sub-hits = 8 logged hits.
    expect(mountainRoamerHits).toHaveLength(8);
  });

  it('Minor Fortes (Glacio DMG+12%/ATK%+12%) is now present', () => {
    const mf = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.buff.minor-fortes');
    expect(mf.effects).toEqual([
      { stat: 'elemDmg', value: 12, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ]);
  });
});
