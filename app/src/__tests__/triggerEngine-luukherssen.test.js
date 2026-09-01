import { describe, it, expect } from 'vitest';
import { CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { LUUK_HERSSEN_BLOCKS } from '../engine/characterBlocks/luukherssen.blocks.js';

describe('triggerEngine parity — Luuk Herssen', () => {
  it('S1-S5 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Luuk Herssen'];
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s1').effects[0].value).toBe(rc.s1.basicDmg);
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s2').effects[0].value).toBe(rc.s2.libDmg);
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s3').effects[0].value).toBe(rc.s3.totalMult);
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s4').effects[0].value).toBe(rc.s4.allDmg);
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s5').effects[0].value).toBe(rc.s5.totalMult);
  });

  it('S6 models the real per-stack Endnotes mechanic (40 x3 stacks = 120 max)', () => {
    const rc = RESONANCE_CHAIN_DATA['Luuk Herssen'];
    const s6 = LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s6');
    expect(s6.effects[0].value * s6.effects[0].maxStacks).toBe(rc.s6.libDmg);
  });

  it('S4 is team-wide, matching RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Luuk Herssen'];
    const s4 = LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s4');
    expect(s4.effects[0].value).toBe(rc.s4.allDmg);
    expect(s4.target.scope).toBe('whole-team');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Luuk Herssen'], LUUK_HERSSEN_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LUUK_HERSSEN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'spectro', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('luukherssen.intro.before-injection-of-dawn')).toBe(true);
    expect(fired.has("luukherssen.liberation.rewritten-in-winters-margins")).toBe(true);
    expect(fired.has('luukherssen.forte.gavel-of-earthshaker')).toBe(true);
    expect(fired.has('luukherssen.skill.aureole-glare')).toBe(true);
  });
});
