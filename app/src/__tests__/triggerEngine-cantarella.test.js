import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CANTARELLA_BLOCKS } from '../engine/characterBlocks/cantarella.blocks.js';

describe('triggerEngine parity — Cantarella', () => {
  it('S4/S5 stay correctly unmodeled (no block) — heal-only / hit-count-cap-only per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Cantarella'];
    expect(rc.s4).toEqual({});
    expect(rc.s5).toEqual({});
    expect(CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s4')).toBeUndefined();
    expect(CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s5')).toBeUndefined();
  });

  it('S1/S2/S3 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Cantarella'];
    expect(CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s1').effects[0].value).toBe(rc.s1.totalMult);
    expect(CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s2').effects[0].value).toBe(rc.s2.totalMult);
    expect(CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
  });

  it('S6 is split into its two real, differently-timed effects, both matching RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Cantarella'];
    const basicMult = CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s6-basic-mult');
    const defIgnore = CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s6-defignore');
    expect(basicMult.effects[0].value).toBe(rc.s6.basicDmg);
    expect(defIgnore.effects[0].value).toBe(rc.s6.defIgnore);
    expect(defIgnore.timing.duration).toBe(10);
    expect(CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.chain.s6')).toBeUndefined();
  });

  it('outro and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Cantarella'];
    const outro = CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.outro.gentle-tentacles');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'skillDmg').value).toBe(legacy.outroBuffs[1].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const self = CANTARELLA_BLOCKS.find(b => b.id === 'cantarella.selfbuff.inherent-skill-poison');
    expect(self.effects[0].value * self.effects[0].maxStacks).toBe(legacy.selfBuffs[0].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Cantarella'], CANTARELLA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CANTARELLA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'havoc', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('cantarella.intro.ripple')).toBe(true);
    expect(fired.has('cantarella.liberation.flowing-suffocation')).toBe(true);
    expect(fired.has('cantarella.forte.phantom-sting')).toBe(true);
    expect(fired.has('cantarella.forte.perception-drain')).toBe(true);
  });
});
