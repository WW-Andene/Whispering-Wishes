import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { TAOQI_BLOCKS } from '../engine/characterBlocks/taoqi.blocks.js';

describe('triggerEngine parity — Taoqi', () => {
  it('S1/S3/S4 stay correctly unmodeled (no block) per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Taoqi'];
    expect(rc.s1).toEqual({});
    expect(rc.s3).toEqual({});
    expect(rc.s4).toEqual({});
    ['taoqi.chain.s1', 'taoqi.chain.s3', 'taoqi.chain.s4'].forEach(id => {
      expect(TAOQI_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S2 has both real effects, matching RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Taoqi'];
    const s2 = TAOQI_BLOCKS.find(b => b.id === 'taoqi.chain.s2');
    expect(s2.effects.find(e => e.stat === 'critRate').value).toBe(rc.s2.critRate);
    expect(s2.effects.find(e => e.stat === 'critDmg').value).toBe(rc.s2.critDmg);
  });

  it('S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Taoqi'];
    expect(TAOQI_BLOCKS.find(b => b.id === 'taoqi.chain.s5').effects[0].value).toBe(rc.s5.basicDmg);
    const s6 = TAOQI_BLOCKS.find(b => b.id === 'taoqi.chain.s6');
    expect(s6.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s6.basicDmg);
    expect(s6.effects.find(e => e.stat === 'heavyDmg').value).toBe(rc.s6.heavyDmg);
  });

  it('Liberation Unmovable uses DEF basis, not ATK', () => {
    const lib = TAOQI_BLOCKS.find(b => b.id === 'taoqi.liberation.unmovable');
    expect(lib.damage.basis).toBe('DEF');
  });

  it('outro matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Taoqi'];
    const outro = TAOQI_BLOCKS.find(b => b.id === 'taoqi.outro.iron-will');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total using DEF', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Taoqi'], TAOQI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(TAOQI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { atk: 1500, def: 2000 }, 'havoc', 'Support');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('taoqi.intro.defense-formation')).toBe(true);
    expect(fired.has('taoqi.liberation.unmovable')).toBe(true);
    expect(fired.has('taoqi.forte.power-shift-timed-counters')).toBe(true);
  });
});
