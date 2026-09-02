import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CARLOTTA_BLOCKS } from '../engine/characterBlocks/carlotta.blocks.js';

describe('triggerEngine parity — Carlotta', () => {
  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Carlotta'];
    expect(CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.chain.s2').effects[0].value).toBe(rc.s2.totalMult);
    expect(CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.chain.s3').effects[0].value).toBe(rc.s3.totalMult);
    expect(CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.chain.s4').effects[0].value).toBe(rc.s4.skillDmg);
    expect(CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.chain.s5').effects[0].value).toBe(rc.s5.totalMult);
    expect(CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.chain.s6').effects[0].value).toBe(rc.s6.totalMult);
  });

  // Fixed 2026-09-02: S1 was `trigger:{type:'cast', on:'Liberation:Era of New Wave'}` with no
  // `timing.duration` — the same dead cast-scoped/no-duration no-op shape as S2, so it never
  // actually applied. Converted to an unconditional passive per the kit text's own Review-section
  // claim that Deconstruction "should always be active" with Ars Gratia Artis — a direct source,
  // not a guess.
  it('S1 actually fires as an unconditional passive Crit Rate buff (not a dead no-op)', () => {
    const s1 = CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.chain.s1');
    expect(s1.trigger.type).toBe('passive');
    expect(s1.effects[0].stat).toBe('critRate');

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Carlotta'], CARLOTTA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS1 = resolveHitComposedDps(CARLOTTA_BLOCKS, steps, ctx, 3500, 'glacio', 'Main DPS', null, 1);
    const withoutS1Blocks = CARLOTTA_BLOCKS.filter(b => b.id !== 'carlotta.chain.s1');
    const withoutS1 = resolveHitComposedDps(withoutS1Blocks, steps, ctx, 3500, 'glacio', 'Main DPS', null, 1);
    expect(withS1.totalDamage).toBeGreaterThan(withoutS1.totalDamage);
  });

  // Fixed 2026-09-02: S2 was `trigger:{type:'cast', on:'Liberation:Fatal Finale'}` with no
  // `timing.duration` — a kind:'buff' block in that shape is a silent no-op in
  // resolveHitComposedDps.js's statsAtInstant() (only passiveBlocks/buffWindows are read), the
  // same dead-buff bug already fixed on Lupa's S4/Verina's S6. Converted to passive +
  // scopedToBlockId so it actually fires and only boosts Fatal Finale's own hit.
  it("S2 actually boosts Fatal Finale's damage (not a dead cast-scoped no-duration no-op)", () => {
    const s2 = CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.chain.s2');
    expect(s2.trigger.type).toBe('passive');
    expect(s2.effects[0].scopedToBlockId).toBe('carlotta.liberation.fatal-finale');

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Carlotta'], CARLOTTA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS2 = resolveHitComposedDps(CARLOTTA_BLOCKS, steps, ctx, 3500, 'glacio', 'Main DPS', null, 2);
    const withoutS2Blocks = CARLOTTA_BLOCKS.filter(b => b.id !== 'carlotta.chain.s2');
    const withoutS2 = resolveHitComposedDps(withoutS2Blocks, steps, ctx, 3500, 'glacio', 'Main DPS', null, 2);
    const fatalHit = withS2.hitLog.find(h => h.blockId === 'carlotta.liberation.fatal-finale');
    const fatalHitNoS2 = withoutS2.hitLog.find(h => h.blockId === 'carlotta.liberation.fatal-finale');
    expect(fatalHit.damage).toBeGreaterThan(fatalHitNoS2.damage);
    const skillHit = withS2.hitLog.find(h => h.blockId === 'carlotta.skill.art-of-violence');
    const skillHitNoS2 = withoutS2.hitLog.find(h => h.blockId === 'carlotta.skill.art-of-violence');
    expect(skillHit.damage).toBeCloseTo(skillHitNoS2.damage, 5);
  });

  it('S4 is team-wide (not self-only), matching the audit-confirmed real target', () => {
    const s4 = CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('selfBuff and debuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Carlotta'];
    const self = CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.selfbuff.final-bow');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
    const deb = CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.debuff.deconstruction');
    expect(deb.kind).toBe('debuff');
    expect(deb.target.scope).toBe('all-enemies');
    expect(deb.effects[0].value).toBe(legacy.debuffs[0].value);
    expect(deb.timing.duration).toBe(legacy.debuffs[0].duration);
  });

  it('Death Knell x4 block repeats the real per-shot hit-set exactly 4 times', () => {
    const dk = CARLOTTA_BLOCKS.find(b => b.id === 'carlotta.liberation.death-knell-x4');
    expect(dk.damage.hits.length).toBe(20); // 5 hits/shot x 4 shots
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Carlotta'], CARLOTTA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CARLOTTA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'glacio', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('carlotta.intro.wintertime-aria')).toBe(true);
    expect(fired.has('carlotta.liberation.era-of-new-wave')).toBe(true);
    expect(fired.has('carlotta.liberation.death-knell-x4')).toBe(true);
    expect(fired.has('carlotta.liberation.fatal-finale')).toBe(true);
    expect(fired.has('carlotta.outro.closing-remark')).toBe(true);
  });
});
