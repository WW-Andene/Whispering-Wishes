import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { YOUHU_BLOCKS } from '../engine/characterBlocks/youhu.blocks.js';

describe('triggerEngine parity — Youhu', () => {
  it('S1/S2/S4 stay correctly unmodeled (no block) per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Youhu'];
    ['s1', 's2', 's4'].forEach(s => expect(rc[s]).toEqual({}));
    ['youhu.chain.s1', 'youhu.chain.s2', 'youhu.chain.s4'].forEach(id => {
      expect(YOUHU_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S3/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Youhu'];
    expect(YOUHU_BLOCKS.find(b => b.id === 'youhu.chain.s3').effects[0].value).toBe(rc.s3.atkPct);
    expect(YOUHU_BLOCKS.find(b => b.id === 'youhu.chain.s5').effects[0].value).toBe(rc.s5.critRate);
    const s6 = YOUHU_BLOCKS.find(b => b.id === 'youhu.chain.s6');
    expect(s6.effects[0].value * s6.effects[0].maxStacks).toBe(rc.s6.critDmg);
  });

  it('outro matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Youhu'];
    const outro = YOUHU_BLOCKS.find(b => b.id === 'youhu.outro.timeless-classics');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Youhu'], YOUHU_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(YOUHU_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2000, 'glacio', 'Support');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('youhu.intro.scroll-of-wonders')).toBe(true);
    expect(fired.has("youhu.liberation.fortunes-favor")).toBe(true);
    expect(fired.has('youhu.skill.ruyi')).toBe(true);
  });
});
