import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CHISA_BLOCKS } from '../engine/characterBlocks/chisa.blocks.js';

describe('triggerEngine parity — Chisa', () => {
  it('S1/S3/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Chisa'];
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s1').effects[0].value).toBe(rc.s1.atkPct);
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s3').effects[0].value).toBe(rc.s3.totalMult);
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s6').effects[0].value).toBe(rc.s6.deepen);
  });

  it('S2 is split into its two real effects — allDmg matches RESONANCE_CHAIN_DATA, resShred is sourced beyond it', () => {
    const rc = RESONANCE_CHAIN_DATA['Chisa'];
    const alldmg = CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s2-alldmg');
    const resshred = CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s2-resshred');
    expect(alldmg.effects[0].value).toBe(rc.s2.allDmg);
    expect(resshred.effects[0].value).toBe(10);
    expect(resshred.kind).toBe('debuff');
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s2')).toBeUndefined();
  });

  it('S4 stays correctly unmodeled (no block) — Havoc Bane trigger-rate utility per its own audit comment', () => {
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s4')).toBeUndefined();
  });

  it('S1 is not defShred (a prior-version miscategorization) — it is atkPct', () => {
    const s1 = CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s1');
    expect(s1.effects[0].stat).toBe('atkPct');
  });

  it('Havoc Bane debuff models the real per-stack stacking mechanic (2 x6 = 12% cap)', () => {
    const hb = CHISA_BLOCKS.find(b => b.id === 'chisa.debuff.havoc-bane');
    expect(hb.effects[0].value * hb.effects[0].maxStacks).toBe(12);
    expect(hb.kind).toBe('debuff');
  });

  it('the Intro self-buff (+20% Havoc DMG, 12s) is sourced from CHARACTER_ROTATIONS despite CHAR_BUFF_TABLE.selfBuffs being empty', () => {
    const legacy = CHAR_BUFF_TABLE['Chisa'];
    expect(legacy.selfBuffs).toEqual([]);
    const self = CHISA_BLOCKS.find(b => b.id === 'chisa.selfbuff.reverberance-return');
    expect(self.effects[0].value).toBe(20);
    expect(self.timing.duration).toBe(12);
  });

  it('Thread of Bane debuff (defIgnore 18/30s) matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Chisa'];
    const tob = CHISA_BLOCKS.find(b => b.id === 'chisa.debuff.thread-of-bane');
    expect(tob.effects[0].value).toBe(legacy.debuffs[0].value);
    expect(tob.timing.duration).toBe(legacy.debuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Chisa'], CHISA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CHISA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'havoc', 'Healer');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('chisa.intro.reverberance-return')).toBe(true);
    expect(fired.has('chisa.liberation.moment-of-nihility')).toBe(true);
    expect(fired.has('chisa.forte.sawring-eradication')).toBe(true);
  });
});
