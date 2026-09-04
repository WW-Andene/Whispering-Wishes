// Cross-check of Yangyang: Xuanling against a fresh the source.gg source dump (following the same
// treatment already applied to Augusta/Aemeath/Hiyuki/Luuk Herssen/Qingxiao/Sigrika). dmgFocus,
// base stats bracket, tier, statScaling, CHAR_BUFF_TABLE, and S2/S4/S6 chain nodes already matched.
// Real gaps found:
import { describe, it, expect } from 'vitest';
import { RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { YANGYANG_XUANLING_BLOCKS } from '../engine/characterBlocks/yangyangxuanling.blocks.js';

describe('Yangyang: Xuanling — audit fixes against a fresh the source dump', () => {
  it("S3's cast-scoped chain buff uses heavyDmg (matching the heavyDmg-categorized Liberation hit it scopes to), not the wrong libDmg", () => {
    expect(RESONANCE_CHAIN_DATA['Yangyang: Xuanling'].s3).toEqual({ heavyDmg: 175 });
    const s3 = YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.chain.s3');
    expect(s3.effects[0]).toEqual({ stat: 'heavyDmg', value: 175, source: 'self-kit' });
  });

  it('S5 (fatal-blow save) has no DPS component — was a fabricated totalMult:5, zeroed to {}', () => {
    expect(RESONANCE_CHAIN_DATA['Yangyang: Xuanling'].s5).toEqual({});
    const s5 = YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.chain.s5');
    expect(s5.effects).toEqual([]);
  });

  it('Mid-air Attack: Feather Fall and Basic Attack: Havoc in Bloom are now modeled with real damage (previously 0 DMG, no matching SKILL_MULTIPLIERS row)', () => {
    const featherFall = YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.midair.feather-fall');
    const havocInBloom = YANGYANG_XUANLING_BLOCKS.find(b => b.id === 'yangyangxuanling.basic.havoc-in-bloom-stage1-3');
    expect(featherFall).toBeDefined();
    expect(featherFall.damage.category).toBe('heavyDmg');
    expect(featherFall.damage.hits.length).toBeGreaterThan(0);
    expect(havocInBloom).toBeDefined();
    expect(havocInBloom.damage.category).toBe('heavyDmg');
    expect(havocInBloom.damage.hits.length).toBeGreaterThan(0);
  });
});
