import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { BRANT_BLOCKS } from '../engine/characterBlocks/brant.blocks.js';

describe('triggerEngine parity — Brant', () => {
  it('S1 models the real per-stack mechanic (20 x3 stacks), not just the flat max-stacks total', () => {
    const rc = RESONANCE_CHAIN_DATA['Brant'];
    const s1 = BRANT_BLOCKS.find(b => b.id === 'brant.chain.s1');
    expect(s1.effects[0].value * s1.effects[0].maxStacks).toBe(rc.s1.allDmg); // 20 * 3 = 60
    expect(s1.effects[0].stacking).toBe('stacking');
  });

  it('S3/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Brant'];
    expect(BRANT_BLOCKS.find(b => b.id === 'brant.chain.s3').effects[0].value).toBe(rc.s3.totalMult);
    expect(BRANT_BLOCKS.find(b => b.id === 'brant.chain.s5').effects[0].value).toBe(rc.s5.basicDmg);
    expect(BRANT_BLOCKS.find(b => b.id === 'brant.chain.s6').effects[0].value).toBe(rc.s6.totalMult);
  });

  it('S4 stays correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    expect(RESONANCE_CHAIN_DATA['Brant'].s4).toEqual({});
    expect(BRANT_BLOCKS.find(b => b.id === 'brant.chain.s4')).toBeUndefined();
  });

  it('outro and self buffs match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Brant'];
    const outro = BRANT_BLOCKS.find(b => b.id === 'brant.outro.the-course-is-set');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'skillDmg').value).toBe(legacy.outroBuffs[1].value);
    const self = BRANT_BLOCKS.find(b => b.id === 'brant.selfbuff.trial-by-fire-and-tide');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Brant'], BRANT_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(BRANT_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'fusion', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('brant.intro.applaud-for-me')).toBe(true);
    expect(fired.has('brant.liberation.to-the-horizon')).toBe(true);
    expect(fired.has('brant.midair.stage-2-3-charged-flip')).toBe(true);
    expect(fired.has('brant.forte.returned-from-ashes')).toBe(true);
  });
});
