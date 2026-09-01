import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { QIUYUAN_BLOCKS } from '../engine/characterBlocks/qiuyuan.blocks.js';

describe('triggerEngine parity — Qiuyuan', () => {
  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Qiuyuan'];
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s2').effects[0].value).toBe(rc.s2.echoDmg);
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s5').effects[0].value).toBe(rc.s5.defIgnore);
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s6').effects[0].value).toBe(rc.s6.critDmg);
  });

  it('outro and libBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Qiuyuan'];
    const outro = QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.outro.strike-before-ready-buff');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const lib = QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.libbuff.crit-dmg');
    expect(lib.effects[0].value).toBe(legacy.libBuffs[0].value);
    expect(lib.target.scope).toBe('whole-team');
  });

  it('the weapon-signature Echo DMG buff is NOT modeled (avoids double-counting the weapon\'s own pv)', () => {
    expect(QIUYUAN_BLOCKS.find(b => b.id.includes('weaponbuff'))).toBeUndefined();
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Qiuyuan'], QIUYUAN_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(QIUYUAN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'aero', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('qiuyuan.intro.attack-the-must-defend')).toBe(true);
    expect(fired.has('qiuyuan.liberation.sundering-strike')).toBe(true);
    expect(fired.has('qiuyuan.forte.to-teach')).toBe(true);
  });
});
