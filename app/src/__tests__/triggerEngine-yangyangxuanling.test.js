import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { YANGYANG_XUANLING_BLOCKS } from '../engine/characterBlocks/yangyangxuanling.blocks.js';

describe('triggerEngine parity — Yangyang: Xuanling', () => {
  it('S1 is correctly {} in RESONANCE_CHAIN_DATA (a discrete proc, not a %-stat modifier) and modeled as a real damage block', () => {
    const rc = RESONANCE_CHAIN_DATA['Yangyang: Xuanling'];
    expect(rc.s1).toEqual({});
    const s1 = YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.chain.s1');
    expect(s1.kind).toBe('damage');
    expect(s1.damage.hits[0].atkPct).toBe(337.98);
    expect(s1.damage.category).toBe('heavyDmg');
  });

  it('S2,S3,S5,S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Yangyang: Xuanling'];
    expect(YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.chain.s2').effects[0].value).toBe(rc.s2.heavyDmg);
    expect(YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.chain.s3').effects[0].value).toBe(rc.s3.heavyDmg);
    expect(YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.chain.s5').effects).toEqual([]);
    expect(YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.chain.s6').effects[0].value).toBe(rc.s6.heavyDmg);
  });

  it('S4 is a whole-team, cast-triggered buff (fixed 2026-09-02) — not a self-only passive', () => {
    const rc = RESONANCE_CHAIN_DATA['Yangyang: Xuanling'];
    const intro = YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.chain.s4-intro');
    const switchBlock = YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.chain.s4-switch');
    expect(YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.chain.s4')).toBeUndefined();
    for (const b of [intro, switchBlock]) {
      expect(b.target.scope).toBe('whole-team');
      expect(b.trigger.type).toBe('cast');
      expect(b.timing.duration).toBe(20);
      expect(b.effects[0].value).toBe(rc.s4.atkPct);
      expect(b.effects[0].stacking).toBe('refresh');
    }
  });

  it('Hush of a Thousand Voices is correctly heavyDmg (counted as Heavy ATK DMG)', () => {
    const b = YANGYANG_XUANLING_BLOCKS.find(bl => bl.id === 'yangyangxuanling.liberation.hush-of-a-thousand-voices');
    expect(b.damage.category).toBe('heavyDmg');
  });

  it('selfBuffs match CHAR_BUFF_TABLE (feathered oath at the real per-stack cap)', () => {
    const legacy = CHAR_BUFF_TABLE['Yangyang: Xuanling'];
    const feathered = YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.selfbuff.feathered-oath');
    const bated = YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.selfbuff.bated-breath');
    const unbroken = YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.selfbuff.unbroken-vow');
    expect(feathered.effects[0].value * feathered.effects[0].maxStacks).toBe(legacy.selfBuffs[0].value);
    expect(bated.effects[0].value).toBe(legacy.selfBuffs[1].value);
    expect(unbroken.effects[0].value).toBe(legacy.selfBuffs[2].value);
  });

  it('outro matches CHAR_BUFF_TABLE, team-wide', () => {
    const legacy = CHAR_BUFF_TABLE['Yangyang: Xuanling'];
    const outro = YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.outro.as-the-wind-wills-buff');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.target.scope).toBe('whole-team');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yangyang: Xuanling'], YANGYANG_XUANLING_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(YANGYANG_XUANLING_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'havoc', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('yangyangxuanling.intro.skybound-feather')).toBe(true);
    expect(fired.has('yangyangxuanling.liberation.hush-of-a-thousand-voices')).toBe(true);
    expect(fired.has('yangyangxuanling.heavy.azure-sword-stance')).toBe(true);
  });
});
