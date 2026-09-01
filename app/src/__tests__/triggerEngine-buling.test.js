import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { BULING_BLOCKS } from '../engine/characterBlocks/buling.blocks.js';

describe('triggerEngine parity — Buling', () => {
  it('S2-S5 stay correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Buling'];
    ['s2', 's3', 's4', 's5'].forEach(s => expect(rc[s]).toEqual({}));
    ['buling.chain.s2', 'buling.chain.s3', 'buling.chain.s4', 'buling.chain.s5'].forEach(id => {
      expect(BULING_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S1/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Buling'];
    expect(BULING_BLOCKS.find(b => b.id === 'buling.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(BULING_BLOCKS.find(b => b.id === 'buling.chain.s6').effects[0].value).toBe(rc.s6.skillDmg);
  });

  it('outro and libBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Buling'];
    const outro = BULING_BLOCKS.find(b => b.id === 'buling.outro.exorcism-spell');
    const lib = BULING_BLOCKS.find(b => b.id === 'buling.libbuff.five-thunders-skill-ramp');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    expect(lib.effects[0].value).toBe(legacy.libBuffs[0].value);
    expect(lib.timing.duration).toBe(legacy.libBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Buling'], BULING_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(BULING_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2000, 'electro', 'Healer');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('buling.intro.summon-and-smite')).toBe(true);
    expect(fired.has('buling.liberation.flashing-thunder-spell-harmony')).toBe(true);
    expect(fired.has('buling.basic.stage1')).toBe(true);
    expect(fired.has('buling.heavy.mountain-over-thunder')).toBe(true);
  });
});
