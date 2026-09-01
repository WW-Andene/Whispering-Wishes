import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { QINGXIAO_BLOCKS } from '../engine/characterBlocks/qingxiao.blocks.js';

describe('triggerEngine parity — Qingxiao', () => {
  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Qingxiao'];
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s2').effects[0].value).toBe(rc.s2.heavyDmg);
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s3').effects[0].value).toBe(rc.s3.critDmg);
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s5').effects[0].value).toBe(rc.s5.skillDmg);
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s6').effects[0].value).toBe(rc.s6.deepen);
  });

  it('S6 is correctly a debuff on enemies, matching the narrow-scope note', () => {
    const s6 = QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s6');
    expect(s6.kind).toBe('debuff');
    expect(s6.target.scope).toBe('all-enemies');
  });

  it('Mindlock selfBuff and debuff match CHAR_BUFF_TABLE at the flat ceiling values', () => {
    const legacy = CHAR_BUFF_TABLE['Qingxiao'];
    const self = QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.selfbuff.mindlock');
    const deb = QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.debuff.mindlock');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[1].value);
    expect(deb.effects[0].value).toBe(legacy.debuffs[0].value);
    expect(deb.kind).toBe('debuff');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Qingxiao'], QINGXIAO_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(QINGXIAO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'aero', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('qingxiao.intro.tonality-shift')).toBe(true);
    expect(fired.has('qingxiao.liberation.billows-beneath-heaven')).toBe(true);
    expect(fired.has('qingxiao.forte.heavens-reckoning')).toBe(true);
    expect(fired.has('qingxiao.outro.lingering-song')).toBe(true);
  });
});
