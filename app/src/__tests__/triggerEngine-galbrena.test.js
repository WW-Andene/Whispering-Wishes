import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { GALBRENA_BLOCKS } from '../engine/characterBlocks/galbrena.blocks.js';

describe('triggerEngine parity — Galbrena', () => {
  it('S1 models the real per-stack mechanic (2 x40 stacks = 80 max)', () => {
    const rc = RESONANCE_CHAIN_DATA['Galbrena'];
    const s1 = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s1');
    expect(s1.effects[0].value * s1.effects[0].maxStacks).toBe(rc.s1.critDmg);
  });

  it('S2-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Galbrena'];
    expect(GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s2').effects[0].value).toBe(rc.s2.atkPct);
    expect(GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s4').effects[0].value).toBe(rc.s4.allDmg);
    expect(GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s5').effects[0].value).toBe(rc.s5.heavyDmg);
    expect(GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s6').effects[0].value).toBe(rc.s6.heavyDmg);
  });

  it('S5/S6 are correctly heavyDmg, not the wrong skillDmg/elemDmg categories an earlier version had', () => {
    const s5 = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s5');
    const s6 = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s6');
    expect(s5.effects[0].stat).toBe('heavyDmg');
    expect(s6.effects[0].stat).toBe('heavyDmg');
  });

  it('Afterflame debuff matches CHAR_BUFF_TABLE with the real per-stack mechanic (1.5 x40 = 60 max)', () => {
    const legacy = CHAR_BUFF_TABLE['Galbrena'];
    const af = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.debuff.afterflame');
    expect(af.effects[0].value * af.effects[0].maxStacks).toBe(legacy.debuffs[0].value);
    expect(af.kind).toBe('debuff');
  });

  it('selfBuffs match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Galbrena'];
    const dh = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.selfbuff.demon-hypostasis-amp');
    const bd = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.selfbuff.burning-drive');
    expect(dh.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(dh.timing.duration).toBe(legacy.selfBuffs[0].duration);
    expect(bd.effects[0].value).toBe(legacy.selfBuffs[1].value);
    expect(bd.timing.duration).toBe(legacy.selfBuffs[1].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Galbrena'], GALBRENA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(GALBRENA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'fusion', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('galbrena.intro.hellflare-overload')).toBe(true);
    expect(fired.has('galbrena.echo.hellfire-absolution')).toBe(true);
    expect(fired.has('galbrena.heavy.ascent-of-malice')).toBe(true);
    expect(fired.has('galbrena.echo.seraphic-execution-stage5')).toBe(true);
  });
});
