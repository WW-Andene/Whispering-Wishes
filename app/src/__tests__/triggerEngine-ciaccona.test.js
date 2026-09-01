import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CIACCONA_BLOCKS } from '../engine/characterBlocks/ciaccona.blocks.js';

describe('triggerEngine parity — Ciaccona', () => {
  it('S3/S6 stay correctly unmodeled (no block) — resource-grant / flat-%ATK-proc per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Ciaccona'];
    expect(rc.s3).toEqual({});
    expect(rc.s6).toEqual({});
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s3')).toBeUndefined();
    expect(CIACCONA_BLOCKS.find(b => b.id === 'ciaccona.chain.s6')).toBeUndefined();
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
