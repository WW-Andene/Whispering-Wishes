// Cross-check of Lucilla against a fresh Prydwen.gg source dump (following the same treatment
// already applied to Augusta/Yuanwu/Aemeath/Hiyuki/Luuk Herssen/Qingxiao/Sigrika/Yangyang: Xuanling/
// Denia). SKILL_MULTIPLIERS, CHARACTER_ROTATIONS, base stats, tier, and RESONANCE_CHAIN_DATA's S1/S2/
// S4 nodes already matched the fresh dump exactly (S3/S5/S6 had already been recategorized off libDmg
// to {basicDmg, echoDmg} in an earlier pass). Real gaps found:
import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA } from '../data/characters.js';
import { LUCILLA_BLOCKS } from '../engine/characterBlocks/lucilla.blocks.js';

describe('Lucilla — audit fixes against a fresh Prydwen dump', () => {
  it("dmgFocus drops 'Liberation' (Clear As Day's DMG is never actually Liberation-type — always " +
    "reclassified to Basic Attack or Echo Skill DMG per her own kit text, confirmed by a genuine 0% " +
    "real Liberation share in both modes) and gains 'Basic ATK' (28% share in Glacio Chafe mode, " +
    '16.7% in Echo mode — not a trivial slice)', () => {
    expect(CHARACTER_DATA['Lucilla'].dmgFocus).toEqual(['Basic ATK', 'Echo']);
  });

  it("Clear As Day's damage block is categorized basicDmg (the modeled Glacio Chafe mode default), " +
    'not the stale libDmg that would silently skip real Basic ATK DMG buffs from teammates', () => {
    const clearAsDay = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.liberation.clear-as-day');
    expect(clearAsDay.damage.category).toBe('basicDmg');
  });
});
