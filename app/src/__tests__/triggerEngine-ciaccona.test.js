import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CIACCONA_BLOCKS } from '../engine/characterBlocks/ciaccona.blocks.js';

describe('triggerEngine parity — Ciaccona', () => {
  it('S3 stays correctly unmodeled (no block) — pure resource-grant per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Ciaccona'];
    expect(rc.s3).toEqual({});
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s3')).toBeUndefined();
  });

  // Fixed 2026-09-02 (fresh Prydwen dump): S6 is correctly zeroed to {} in RESONANCE_CHAIN_DATA (its
  // real shape, a flat 220% ATK proc, doesn't fit that flat {stat:value} table) but that had left it
  // entirely unbuilt — added as its own gated `kind:'damage'` block instead.
  it('S6 is a real, sequence-6-gated damage block (not a RESONANCE_CHAIN_DATA stat)', () => {
    const rc = RESONANCE_CHAIN_DATA['Ciaccona'];
    expect(rc.s6).toEqual({});
    const s6 = CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s6');
    expect(s6.kind).toBe('damage');
    expect(s6.damage.category).toBe('libDmg');
    expect(s6.damage.hits.reduce((sum, h) => sum + h.atkPct, 0)).toBeCloseTo(220, 1);
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Ciaccona'], CIACCONA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const atS6 = resolveHitComposedDps(CIACCONA_BLOCKS, steps, ctx, 3500, 'aero', 'Sub DPS', null, 6);
    const atS5 = resolveHitComposedDps(CIACCONA_BLOCKS, steps, ctx, 3500, 'aero', 'Sub DPS', null, 5);
    expect(atS6.hitLog.some(h => h.blockId === 'ciaccona.chain.s6')).toBe(true);
    expect(atS5.hitLog.some(h => h.blockId === 'ciaccona.chain.s6')).toBe(false);
  });

  it('S1/S2/S4/S5 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Ciaccona'];
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s1').effects[0].value).toBe(rc.s1.atkPct);
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s2').effects[0].value).toBe(rc.s2.elemDmg);
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s4').effects[0].value).toBe(rc.s4.defIgnore);
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
  });

  it('outro and libBuff match CHAR_BUFF_TABLE, with the outro correctly scoped to Aero only', () => {
    const legacy = CHAR_BUFF_TABLE['Ciaccona'];
    const outro = CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.outro.windcalling-tune');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    expect(outro.condition.element).toBe('aero');
    const lib = CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.libbuff.solo-concert');
    expect(lib.effects[0].value).toBe(legacy.libBuffs[0].value);
    expect(lib.effects[0].stat).toBe('elemDmg');
    expect(lib.target.scope).toBe('whole-team');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Ciaccona'], CIACCONA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CIACCONA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'aero', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('ciaccona.intro.roaming-with-the-wind')).toBe(true);
    expect(fired.has('ciaccona.forte.quadruple-downbeat')).toBe(true);
    expect(fired.has("ciaccona.liberation.singers-triple-cadenza")).toBe(true);
  });
});
