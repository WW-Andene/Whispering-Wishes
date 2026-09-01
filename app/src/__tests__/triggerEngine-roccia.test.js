import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { ROCCIA_BLOCKS } from '../engine/characterBlocks/roccia.blocks.js';

describe('triggerEngine parity — Roccia', () => {
  it('S1 stays correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Roccia'];
    expect(rc.s1).toEqual({ totalMult: 0 });
    expect(ROCCIA_BLOCKS.find(b => b.id === 'roccia.chain.s1')).toBeUndefined();
  });

  it('S3/S4/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Roccia'];
    const s3 = ROCCIA_BLOCKS.find(b => b.id === 'roccia.chain.s3');
    expect(s3.effects.find(e => e.stat === 'critRate').value).toBe(rc.s3.critRate);
    expect(s3.effects.find(e => e.stat === 'critDmg').value).toBe(rc.s3.critDmg);
    expect(ROCCIA_BLOCKS.find(b => b.id === 'roccia.chain.s4').effects[0].value).toBe(rc.s4.totalMult);
    expect(ROCCIA_BLOCKS.find(b => b.id === 'roccia.chain.s6').effects[0].value).toBe(rc.s6.defIgnore);
  });

  it('S2 models the real stacking mechanic (10 x4 stacks = 40 max)', () => {
    const rc = RESONANCE_CHAIN_DATA['Roccia'];
    const s2 = ROCCIA_BLOCKS.find(b => b.id === 'roccia.chain.s2');
    expect(s2.effects[0].value * s2.effects[0].maxStacks).toBe(rc.s2.elemDmg);
    expect(s2.target.scope).toBe('whole-team');
  });

  it('S5 carries both real effects, matching RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Roccia'];
    const s5 = ROCCIA_BLOCKS.find(b => b.id === 'roccia.chain.s5');
    expect(s5.effects.find(e => e.stat === 'libDmg').value).toBe(rc.s5.libDmg);
    expect(s5.effects.find(e => e.stat === 'heavyDmg').value).toBe(rc.s5.heavyDmg);
  });

  it('Real Fantasy and Commedia Improvviso! are both correctly heavyDmg', () => {
    const rf = ROCCIA_BLOCKS.find(b => b.id === 'roccia.forte.real-fantasy');
    const ci = ROCCIA_BLOCKS.find(b => b.id === 'roccia.liberation.commedia-improvviso');
    expect(rf.damage.category).toBe('heavyDmg');
    expect(ci.damage.category).toBe('heavyDmg');
  });

  it('outro and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Roccia'];
    const outro = ROCCIA_BLOCKS.find(b => b.id === 'roccia.outro.applause-please');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'basicDmg').value).toBe(legacy.outroBuffs[1].value);
    const self = ROCCIA_BLOCKS.find(b => b.id === 'roccia.selfbuff.immersive-performance');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Roccia'], ROCCIA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(ROCCIA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'havoc', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('roccia.intro.pero-help')).toBe(true);
    expect(fired.has('roccia.forte.real-fantasy')).toBe(true);
    expect(fired.has('roccia.liberation.commedia-improvviso')).toBe(true);
  });
});
