import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { ZANI_BLOCKS } from '../engine/characterBlocks/zani.blocks.js';

describe('triggerEngine parity — Zani', () => {
  it('S1/S3/S4/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Zani'];
    expect(ZANI_BLOCKS.find(b => b.id === 'zani.chain.s1').effects[0].value).toBe(rc.s1.elemDmg);
    expect(ZANI_BLOCKS.find(b => b.id === 'zani.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(ZANI_BLOCKS.find(b => b.id === 'zani.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(ZANI_BLOCKS.find(b => b.id === 'zani.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(ZANI_BLOCKS.find(b => b.id === 'zani.chain.s6').effects[0].value).toBe(rc.s6.heavyDmg);
  });

  it('S2 has both real effects, matching RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Zani'];
    const s2 = ZANI_BLOCKS.find(b => b.id === 'zani.chain.s2');
    expect(s2.effects.find(e => e.stat === 'critRate').value).toBe(rc.s2.critRate);
    expect(s2.effects.find(e => e.stat === 'skillDmg').value).toBe(rc.s2.skillDmg);
  });

  it('outro and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Zani'];
    const outro = ZANI_BLOCKS.find(b => b.id === 'zani.outro.beacon-buff');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const self = ZANI_BLOCKS.find(b => b.id === 'zani.selfbuff.quick-response');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
  });

  it('the 2nd Heavy Slash pass combines all three real hits', () => {
    const b = ZANI_BLOCKS.find(bl => bl.id === 'zani.forte.heavy-slash-string-2nd-pass');
    expect(b.damage.hits.length).toBe(4); // Daybreak(1) + Dawning(1) + Nightfall(2)
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Zani'], ZANI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(ZANI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'spectro', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('zani.intro.immediate-execution')).toBe(true);
    expect(fired.has('zani.liberation.rekindle')).toBe(true);
    expect(fired.has('zani.forte.heavy-slash-nightfall')).toBe(true);
    expect(fired.has('zani.liberation.the-last-stand')).toBe(true);
  });
});
