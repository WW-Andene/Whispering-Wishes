import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { QINGXIAO_BLOCKS } from '../engine/characterBlocks/qingxiao.blocks.js';

describe('triggerEngine parity — Qingxiao', () => {
  // Fixed 2026-09-02: category was previously unset. WuWa's own general mechanic (Mid-air/Plunging
  // Attacks inherit Basic ATK or Heavy ATK DMG, never their own type) plus the dump's own kit structure
  // (listed under "Basic Attack — Strings to Steel") confirms basicDmg.
  it('Mid-air Attack - Stringblade is basicDmg-categorized', () => {
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.midair.stringblade-stage1-3').damage.category).toBe('basicDmg');
  });

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

  it('Mindlock debuff matches CHAR_BUFF_TABLE at the flat ceiling value (corrected 2026-09-02: the duplicate selfbuff.mindlock TriggerBlock was removed — see qingxiao.blocks.js\'s own removal note; the legacy selfBuffs[1] totalMult entry is kept only because it\'s pinned by a separate test, but was never applied to any real computed DPS number either)', () => {
    const legacy = CHAR_BUFF_TABLE['Qingxiao'];
    const deb = QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.debuff.mindlock');
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.selfbuff.mindlock')).toBeUndefined();
    expect(deb.effects[0].value).toBe(legacy.debuffs[0].value);
    expect(deb.effects[0].value).toBe(65);
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
