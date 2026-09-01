import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { DANJIN_BLOCKS } from '../engine/characterBlocks/danjin.blocks.js';

describe('triggerEngine parity — Danjin', () => {
  it('S1 models the real per-stack mechanic (5 x6 stacks = 30 max), not just the flat max-stacks total', () => {
    const rc = RESONANCE_CHAIN_DATA['Danjin'];
    const s1 = DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s1');
    expect(s1.effects[0].value * s1.effects[0].maxStacks).toBe(rc.s1.atkPct);
    expect(s1.effects[0].stacking).toBe('stacking');
  });

  it('S2/S3/S4/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Danjin'];
    expect(DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s2').effects[0].value).toBe(rc.s2.totalMult);
    expect(DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s4').effects[0].value).toBe(rc.s4.critRate);
    expect(DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s5').effects[0].value).toBe(rc.s5.elemDmg);
    expect(DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s6').effects[0].value).toBe(rc.s6.atkPct);
  });

  it('S6 is team-wide with a real 20s window (not a flat passive)', () => {
    const s6 = DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s6');
    expect(s6.target.scope).toBe('whole-team');
    expect(s6.timing.duration).toBe(20);
  });

  it('outro matches CHAR_BUFF_TABLE — correctly elemDmg, not deepen', () => {
    const legacy = CHAR_BUFF_TABLE['Danjin'];
    const outro = DANJIN_BLOCKS.find(b => b.id === 'danjin.outro.duality');
    expect(outro.effects[0].stat).toBe('elemDmg');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Danjin'], DANJIN_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(DANJIN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'havoc', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('danjin.intro.vindication')).toBe(true);
    expect(fired.has('danjin.liberation.crimson-bloom')).toBe(true);
    expect(fired.has('danjin.forte.chaoscleave')).toBe(true);
  });
});
