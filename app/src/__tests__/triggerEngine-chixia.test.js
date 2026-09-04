import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { CHIXIA_BLOCKS } from '../engine/characterBlocks/chixia.blocks.js';

describe('triggerEngine parity — Chixia', () => {
  it('S1/S2/S4 stay correctly unmodeled (no block) — pure resource/utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Chixia'];
    ['s1', 's2', 's4'].forEach(s => expect(rc[s]).toEqual({}));
    ['chixia.chain.s1', 'chixia.chain.s2', 'chixia.chain.s4'].forEach(id => {
      expect(CHIXIA_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S3/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Chixia'];
    expect(CHIXIA_BLOCKS.find(b => b.id === 'chixia.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(CHIXIA_BLOCKS.find(b => b.id === 'chixia.chain.s5').effects[0].value).toBe(rc.s5.atkPct);
    expect(CHIXIA_BLOCKS.find(b => b.id === 'chixia.chain.s6').effects[0].value).toBe(rc.s6.basicDmg);
  });

  it('selfBuff matches CHAR_BUFF_TABLE with the real per-stack stacking mechanic (1 x30 = 30% cap)', () => {
    const legacy = CHAR_BUFF_TABLE['Chixia'];
    const self = CHIXIA_BLOCKS.find(b => b.id === 'chixia.selfbuff.numbingly-spicy');
    expect(self.effects[0].value * self.effects[0].maxStacks).toBe(legacy.selfBuffs[0].value);
    expect(self.timing.duration).toBe(legacy.selfBuffs[0].duration);
  });

  it('DAKA DAKA! block fires all 30 Thermobaric Bullet hits (full-consumption convention)', () => {
    const dk = CHIXIA_BLOCKS.find(b => b.id === 'chixia.forte.daka-daka');
    expect(dk.damage.hits.length).toBe(30);
    expect(dk.damage.hits.every(h => h.atkPct === 19.89)).toBe(true);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Chixia'], CHIXIA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CHIXIA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'fusion', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('chixia.intro.grand-entrance')).toBe(true);
    expect(fired.has('chixia.forte.daka-daka')).toBe(true);
    expect(fired.has('chixia.forte.boom-boom')).toBe(true);
    expect(fired.has('chixia.liberation.blazing-flames')).toBe(true);
  });

  it("Intro/DAKA DAKA!/Boom Boom are all skillDmg-categorized (were uncategorized) — the kit text explicitly labels DAKA DAKA! and Boom Boom \"(Resonance Skill DMG)\", not Basic Attack DMG despite Boom Boom being triggered via the Basic Attack button", () => {
    expect(CHIXIA_BLOCKS.find(b => b.id === 'chixia.intro.grand-entrance').damage.category).toBe('skillDmg');
    expect(CHIXIA_BLOCKS.find(b => b.id === 'chixia.forte.daka-daka').damage.category).toBe('skillDmg');
    expect(CHIXIA_BLOCKS.find(b => b.id === 'chixia.forte.boom-boom').damage.category).toBe('skillDmg');
  });

  it("Outro (Leaping Flames) is outroDmg-categorized (was uncategorized) — pure damage, no team buff", () => {
    const outro = CHIXIA_BLOCKS.find(b => b.id === 'chixia.outro.leaping-flames');
    expect(outro.damage.category).toBe('outroDmg');
  });

  it("dmgFocus is ['Skill', 'Liberation', 'Outro'] — 'Basic ATK' was wrong (she deals a genuine 0% Basic ATK share per her dump's Damage Profile, no basicDmg block exists at all), Liberation (32.5%) and Outro (9.6%) were both missing", () => {
    expect(CHARACTER_DATA['Chixia'].dmgFocus).toEqual(['Skill', 'Liberation', 'Outro']);
  });
});
