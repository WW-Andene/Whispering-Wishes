import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { PHOEBE_BLOCKS } from '../engine/characterBlocks/phoebe.blocks.js';

describe('triggerEngine parity — Phoebe', () => {
  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Phoebe'];
    expect(PHOEBE_BLOCKS.find(b => b.id === 'phoebe.chain.s1').effects[0].value).toBe(rc.s1.libDmg);
    expect(PHOEBE_BLOCKS.find(b => b.id === 'phoebe.chain.s2').effects[0].value).toBe(rc.s2.deepen);
    expect(PHOEBE_BLOCKS.find(b => b.id === 'phoebe.chain.s3').effects[0].value).toBe(rc.s3.heavyDmg);
    expect(PHOEBE_BLOCKS.find(b => b.id === 'phoebe.chain.s4').effects[0].value).toBe(rc.s4.resShred);
    expect(PHOEBE_BLOCKS.find(b => b.id === 'phoebe.chain.s5').effects[0].value).toBe(rc.s5.elemDmg);
    expect(PHOEBE_BLOCKS.find(b => b.id === 'phoebe.chain.s6').effects[0].value).toBe(rc.s6.atkPct);
  });

  it('S4 is correctly a debuff on enemies (resShred), not a self buff', () => {
    const s4 = PHOEBE_BLOCKS.find(b => b.id === 'phoebe.chain.s4');
    expect(s4.kind).toBe('debuff');
    expect(s4.target.scope).toBe('all-enemies');
  });

  it('the two real +255% Absolution own-kit multipliers are modeled distinctly from the Resonance Chain', () => {
    const dawn = PHOEBE_BLOCKS.find(b => b.id === 'phoebe.kit.dawn-of-enlightenment-absolution-mult');
    const attentive = PHOEBE_BLOCKS.find(b => b.id === 'phoebe.kit.attentive-heart-absolution-mult');
    expect(dawn.effects[0].value).toBe(255);
    expect(attentive.effects[0].value).toBe(255);
  });

  it('outro debuff and buff match CHAR_BUFF_TABLE (Confession-mode only)', () => {
    const legacy = CHAR_BUFF_TABLE['Phoebe'];
    const resshred = PHOEBE_BLOCKS.find(b => b.id === 'phoebe.outro.confession-resshred');
    const frazzleAmp = PHOEBE_BLOCKS.find(b => b.id === 'phoebe.outro.confession-frazzle-amp');
    expect(resshred.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(frazzleAmp.effects[0].value).toBe(legacy.outroBuffs[1].value);
  });

  it('real CHARACTER_ROTATIONS data (Absolution mode) produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Phoebe'], PHOEBE_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(PHOEBE_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'spectro', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('phoebe.intro.golden-grace')).toBe(true);
    expect(fired.has('phoebe.liberation.dawn-of-enlightenment')).toBe(true);
    expect(fired.has('phoebe.forte.starflash')).toBe(true);
    expect(fired.has('phoebe.outro.attentive-heart')).toBe(true);
  });
});
