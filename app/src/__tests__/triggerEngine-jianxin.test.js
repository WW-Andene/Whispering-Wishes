import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { JIANXIN_BLOCKS } from '../engine/characterBlocks/jianxin.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Jianxin', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(JIANXIN_BLOCKS, 'Jianxin');
  });

  it('S1/S2/S3/S5 stay correctly unmodeled (no block) — pure utility/AoE-range per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Jianxin'];
    ['s1', 's2', 's3', 's5'].forEach(s => expect(rc[s]).toEqual({}));
    ['jianxin.chain.s1', 'jianxin.chain.s2', 'jianxin.chain.s3', 'jianxin.chain.s5'].forEach(id => {
      expect(JIANXIN_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S4 matches RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Jianxin'];
    expect(JIANXIN_BLOCKS.find(b => b.id === 'jianxin.chain.s4').effects[0].value).toBe(rc.s4.libDmg);
  });

  it('S6 is modeled as a real proc-damage block using the sourced 556.67% ATK figure, not the zeroed flat approximation', () => {
    const rc = RESONANCE_CHAIN_DATA['Jianxin'];
    expect(rc.s6).toEqual({});
    expect(JIANXIN_BLOCKS.find(b => b.id === 'jianxin.chain.s6')).toBeUndefined();
    const s6 = JIANXIN_BLOCKS.find(b => b.id === 'jianxin.chain.s6-chi-counter');
    expect(s6.kind).toBe('damage');
    expect(s6.damage.hits[0].atkPct).toBeCloseTo(556.67);
    expect(s6.damage.category).toBe('heavyDmg');
  });

  it('outro matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Jianxin'];
    const outro = JIANXIN_BLOCKS.find(b => b.id === 'jianxin.outro.transcendence');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jianxin'], JIANXIN_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(JIANXIN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'aero', 'Support');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('jianxin.intro.essence-of-tao')).toBe(true);
    expect(fired.has('jianxin.liberation.purification-force-field')).toBe(true);
    expect(fired.has('jianxin.forte.primordial-chi-spiral')).toBe(true);
    expect(fired.has('jianxin.chain.s6-chi-counter')).toBe(true);
  });

  it("Intro (Essence of Tao) is skillDmg-categorized (was uncategorized) — dump's own multiplier row is labeled generically \"Skill Damage\"", () => {
    const intro = JIANXIN_BLOCKS.find(b => b.id === 'jianxin.intro.essence-of-tao');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("Forte (Primordial Chi Spiral / Pushing Punch) is heavyDmg-categorized (was uncategorized) — entered by holding Heavy Attack per the dump's kit text, not Basic ATK as the row/rotation notes previously mistranscribed", () => {
    const forte = JIANXIN_BLOCKS.find(b => b.id === 'jianxin.forte.primordial-chi-spiral');
    expect(forte.damage.category).toBe('heavyDmg');
  });

  it("dmgFocus gains 'Liberation'/'Basic ATK'/'Heavy ATK' (her real 36.1%/30.9%/12.1% shares, now correctly categorized) — Echo (7.9%, generic equipped-Echo damage) and Intro (~5%) both stay excluded per this project's own precedent", () => {
    expect(CHARACTER_DATA['Jianxin'].dmgFocus).toEqual(['Skill', 'Liberation', 'Basic ATK', 'Heavy ATK']);
  });
});
