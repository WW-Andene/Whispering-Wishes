import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { LUPA_BLOCKS } from '../engine/characterBlocks/lupa.blocks.js';

describe('triggerEngine parity — Lupa', () => {
  it('S1/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lupa'];
    expect(LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s6').effects[0].value).toBe(rc.s6.defIgnore);
  });

  it('S2/S3/S4 model the real per-stack/scoped mechanics, matching the max/scoped RESONANCE_CHAIN_DATA values', () => {
    const rc = RESONANCE_CHAIN_DATA['Lupa'];
    const s2 = LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s2');
    expect(s2.effects[0].value * s2.effects[0].maxStacks).toBe(rc.s2.elemDmg);
    expect(LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s4').effects[0].value).toBe(rc.s4.libDmg);
  });

  it('S3/S4 are correctly libDmg, not the old wrong totalMult category, and the stale S4 magnitude bug is fixed', () => {
    const s3 = LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s3');
    const s4 = LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s4');
    expect(s3.effects[0].stat).toBe('libDmg');
    expect(s4.effects[0].stat).toBe('libDmg');
    expect(s4.effects[0].value).toBe(125);
  });

  it('outro, libBuff, selfBuff, and debuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Lupa'];
    const outro = LUPA_BLOCKS.find(b => b.id === 'lupa.outro.stand-by-me-warrior');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'basicDmg').value).toBe(legacy.outroBuffs[1].value);
    const lib = LUPA_BLOCKS.find(b => b.id === 'lupa.libbuff.pack-hunt');
    expect(lib.effects[0].value * lib.effects[0].maxStacks).toBe(legacy.libBuffs[0].value);
    const self = LUPA_BLOCKS.find(b => b.id === 'lupa.selfbuff.wildfire-banner');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
    const deb = LUPA_BLOCKS.find(b => b.id === 'lupa.debuff.glory');
    expect(deb.effects[0].value * deb.effects[0].maxStacks).toBe(legacy.debuffs[0].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lupa'], LUPA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LUPA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'fusion', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lupa.intro.try-focusing-eh')).toBe(true);
    expect(fired.has('lupa.liberation.fire-kissed-glory')).toBe(true);
    expect(fired.has('lupa.liberation.dance-with-the-wolf')).toBe(true);
    expect(fired.has('lupa.heavy.wolfs-claw')).toBe(true);
  });
});
