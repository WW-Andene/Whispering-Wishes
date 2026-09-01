import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { VERINA_BLOCKS } from '../engine/characterBlocks/verina.blocks.js';

describe('triggerEngine parity — Verina', () => {
  it('S1/S2/S3/S5 stay correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Verina'];
    ['s1', 's2', 's3', 's5'].forEach(s => expect(rc[s]).toEqual({}));
    ['verina.chain.s1', 'verina.chain.s2', 'verina.chain.s3', 'verina.chain.s5'].forEach(id => {
      expect(VERINA_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S4/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Verina'];
    const s4 = VERINA_BLOCKS.find(b => b.id === 'verina.chain.s4');
    expect(s4.effects[0].value).toBe(rc.s4.elemDmg);
    expect(s4.target.scope).toBe('whole-team');
    expect(VERINA_BLOCKS.find(b => b.id === 'verina.chain.s6').effects[0].value).toBe(rc.s6.totalMult);
  });

  it('outro and libBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Verina'];
    const outro = VERINA_BLOCKS.find(b => b.id === 'verina.outro.blossom');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const lib = VERINA_BLOCKS.find(b => b.id === 'verina.libbuff.gift-of-nature');
    expect(lib.effects[0].value).toBe(legacy.libBuffs[0].value);
    expect(lib.target.scope).toBe('whole-team');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Verina'], VERINA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(VERINA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2000, 'spectro', 'Healer');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('verina.basic.cultivation-stage3-5')).toBe(true);
    expect(fired.has('verina.liberation.arboreal-flourish')).toBe(true);
    expect(fired.has('verina.forte.starflower-blooms-midair')).toBe(true);
  });
});
