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

  // Fixed 2026-09-02: 6 separate blocks (the 3 own-kit multipliers above, plus S1/S2/S3) were all
  // kind:'buff' with a non-passive trigger and no timing.duration — the item-12 dead-buff architecture
  // bug. Together they covered nearly her entire multiplier stack, so this was a massive silent
  // undercount. Each is now trigger:{type:'passive'} + scopedToBlockId (or category-gated, for S3).
  it('the 3 own-kit multipliers actually apply (were dead no-ops)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Phoebe'], PHOEBE_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withAll = resolveHitComposedDps(PHOEBE_BLOCKS, steps, ctx, 3000, 'spectro', 'Sub DPS');
    const strippedIds = new Set([
      'phoebe.kit.dawn-of-enlightenment-absolution-mult',
      'phoebe.kit.attentive-heart-absolution-mult',
      'phoebe.kit.starflash-frazzle-amp',
    ]);
    const withoutKitMults = resolveHitComposedDps(PHOEBE_BLOCKS.filter(b => !strippedIds.has(b.id)), steps, ctx, 3000, 'spectro', 'Sub DPS');
    expect(withAll.totalDamage).toBeGreaterThan(withoutKitMults.totalDamage * 2);
  });

  it('S1/S2/S3 actually apply and stay correctly scoped (were dead no-ops)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Phoebe'], PHOEBE_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };

    const withS1 = resolveHitComposedDps(PHOEBE_BLOCKS, steps, ctx, 3000, 'spectro', 'Sub DPS', null, 1);
    const withoutS1 = resolveHitComposedDps(PHOEBE_BLOCKS.filter(b => b.id !== 'phoebe.chain.s1'), steps, ctx, 3000, 'spectro', 'Sub DPS', null, 1);
    const dawnHit = withS1.hitLog.find(h => h.blockId === 'phoebe.liberation.dawn-of-enlightenment');
    const dawnHitNoS1 = withoutS1.hitLog.find(h => h.blockId === 'phoebe.liberation.dawn-of-enlightenment');
    expect(dawnHit.damage).toBeGreaterThan(dawnHitNoS1.damage);
    const introHit = withS1.hitLog.find(h => h.blockId === 'phoebe.intro.golden-grace');
    const introHitNoS1 = withoutS1.hitLog.find(h => h.blockId === 'phoebe.intro.golden-grace');
    expect(introHit.damage).toBeCloseTo(introHitNoS1.damage, 5);

    const withS2 = resolveHitComposedDps(PHOEBE_BLOCKS, steps, ctx, 3000, 'spectro', 'Sub DPS', null, 2);
    const withoutS2 = resolveHitComposedDps(PHOEBE_BLOCKS.filter(b => b.id !== 'phoebe.chain.s2'), steps, ctx, 3000, 'spectro', 'Sub DPS', null, 2);
    const outroHit = withS2.hitLog.find(h => h.blockId === 'phoebe.outro.attentive-heart');
    const outroHitNoS2 = withoutS2.hitLog.find(h => h.blockId === 'phoebe.outro.attentive-heart');
    expect(outroHit.damage).toBeGreaterThan(outroHitNoS2.damage);
    const dawnHitS2 = withS2.hitLog.find(h => h.blockId === 'phoebe.liberation.dawn-of-enlightenment');
    const dawnHitNoS2 = withoutS2.hitLog.find(h => h.blockId === 'phoebe.liberation.dawn-of-enlightenment');
    expect(dawnHitS2.damage).toBeCloseTo(dawnHitNoS2.damage, 5);

    const withS3 = resolveHitComposedDps(PHOEBE_BLOCKS, steps, ctx, 3000, 'spectro', 'Sub DPS', null, 3);
    const withoutS3 = resolveHitComposedDps(PHOEBE_BLOCKS.filter(b => b.id !== 'phoebe.chain.s3'), steps, ctx, 3000, 'spectro', 'Sub DPS', null, 3);
    const starflashHit = withS3.hitLog.find(h => h.blockId === 'phoebe.forte.starflash');
    const starflashHitNoS3 = withoutS3.hitLog.find(h => h.blockId === 'phoebe.forte.starflash');
    expect(starflashHit.damage).toBeGreaterThan(starflashHitNoS3.damage);
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
