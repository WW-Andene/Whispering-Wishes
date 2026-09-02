import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { PHROLOVA_BLOCKS } from '../engine/characterBlocks/phrolova.blocks.js';

describe('triggerEngine parity — Phrolova', () => {
  it('S5 stays correctly unmodeled (no block) — purely defensive per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Phrolova'];
    expect(rc.s5).toEqual({});
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s5')).toBeUndefined();
  });

  it('S1-S4/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Phrolova'];
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s1').effects[0].value).toBe(rc.s1.totalMult);
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s2').effects[0].value).toBe(rc.s2.skillDmg);
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s3').effects[0].value).toBe(rc.s3.echoDmg);
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s4').effects[0].value).toBe(rc.s4.allDmg);
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s6').effects[0].value).toBe(rc.s6.elemDmg);
  });

  it('S2 is correctly skillDmg (not heavyDmg despite replacing Heavy Attack)', () => {
    const s2 = PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s2');
    expect(s2.effects[0].stat).toBe('skillDmg');
  });

  it('S4 is team-wide with a real 30s window', () => {
    const s4 = PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('outro and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Phrolova'];
    const outro = PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.outro.unfinished-piece');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'heavyDmg').value).toBe(legacy.outroBuffs[1].value);
    const self = PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.selfbuff.aftersound');
    expect(self.effects[0].value * self.effects[0].maxStacks).toBe(legacy.selfBuffs[0].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Phrolova'], PHROLOVA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(PHROLOVA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'havoc', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('phrolova.intro.suite-of-immortality')).toBe(true);
    expect(fired.has('phrolova.heavy.scarlet-coda')).toBe(true);
    expect(fired.has('phrolova.liberation.waltz-of-forsaken-depths')).toBe(true);
  });

  // Fixed 2026-09-02 (Phase 0.5 follow-up, fresh Prydwen dump): the 3 real Forte rotation steps
  // ("Movement of Fate and Finality / Murmurs in a Haunting Dream") previously matched NO block at
  // all, leaving S1's own totalMult bonus permanently inert.
  it('the Forte follow-up damage block fires for all 3 real rotation occurrences', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Phrolova'], PHROLOVA_BLOCKS);
    const { hitLog } = resolveHitComposedDps(PHROLOVA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'havoc', 'Main DPS');
    const forteHits = hitLog.filter(h => h.blockId === 'phrolova.forte.movement-of-fate-and-finality');
    // 7 hits/cast (4×37.88% + 3×117.83%) × 3 real rotation occurrences of this Forte step.
    expect(forteHits.length).toBe(21);
  });

  it('S1 totalMult is no longer inert — raises the Forte follow-up damage', () => {
    const withoutS1 = PHROLOVA_BLOCKS.filter(b => b.id !== 'phrolova.chain.s1');
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Phrolova'], PHROLOVA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS1 = resolveHitComposedDps(PHROLOVA_BLOCKS, steps, ctx, 3000, 'havoc', 'Main DPS', null, 6);
    const without = resolveHitComposedDps(withoutS1, steps, ctx, 3000, 'havoc', 'Main DPS', null, 6);
    expect(withS1.totalDamage).toBeGreaterThan(without.totalDamage);
  });

  it('S6 Apparition of Beyond-Hecate is real, gated to sequence 6, and echoDmg-categorized', () => {
    const s6 = PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s6-apparition');
    expect(s6.damage.category).toBe('echoDmg');
    expect(s6.damage.hits.reduce((sum, h) => sum + h.atkPct, 0)).toBeCloseTo(216.42, 1);
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Phrolova'], PHROLOVA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const atS6 = resolveHitComposedDps(PHROLOVA_BLOCKS, steps, ctx, 3000, 'havoc', 'Main DPS', null, 6);
    const atS0 = resolveHitComposedDps(PHROLOVA_BLOCKS, steps, ctx, 3000, 'havoc', 'Main DPS', null, 0);
    const s6Fired = atS6.hitLog.some(h => h.blockId === 'phrolova.chain.s6-apparition');
    const s0Fired = atS0.hitLog.some(h => h.blockId === 'phrolova.chain.s6-apparition');
    expect(s6Fired).toBe(true);
    expect(s0Fired).toBe(false);
  });

  // Fixed 2026-09-02: Hecate's own attacks during Maestro were the largest previously-zero gap in her
  // kit (Echo = 43.9% of her total damage per the source dump) — SKILL_MULTIPLIERS already had the
  // 'Liberation, Maestro State: Hecate' row, it had just never been converted into a firing block.
  it('Hecate\'s attack block fires off the Liberation cast and is echoDmg-categorized', () => {
    const block = PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.liberation.hecate-attack');
    expect(block.damage.category).toBe('echoDmg');
    expect(block.trigger).toEqual({ type: 'cast', on: 'Liberation:Waltz of Forsaken Depths' });
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Phrolova'], PHROLOVA_BLOCKS);
    const { hitLog } = resolveHitComposedDps(PHROLOVA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'havoc', 'Main DPS');
    expect(hitLog.some(h => h.blockId === 'phrolova.liberation.hecate-attack')).toBe(true);
  });

  it('S6\'s +24% Enhanced Attack-Hecate multiplier is scoped only to Hecate\'s attack block', () => {
    const s6 = PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s6');
    const hecateBonus = s6.effects.find(e => e.stat === 'echoDmg');
    expect(hecateBonus.value).toBe(24);
    expect(hecateBonus.scopedToBlockId).toBe('phrolova.liberation.hecate-attack');
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Phrolova'], PHROLOVA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const atS6 = resolveHitComposedDps(PHROLOVA_BLOCKS, steps, ctx, 3000, 'havoc', 'Main DPS', null, 6);
    const atS5 = resolveHitComposedDps(PHROLOVA_BLOCKS, steps, ctx, 3000, 'havoc', 'Main DPS', null, 5);
    const hecateHitS6 = atS6.hitLog.find(h => h.blockId === 'phrolova.liberation.hecate-attack');
    const hecateHitS5 = atS5.hitLog.find(h => h.blockId === 'phrolova.liberation.hecate-attack');
    expect(hecateHitS6.damage).toBeGreaterThan(hecateHitS5.damage);
  });
});
