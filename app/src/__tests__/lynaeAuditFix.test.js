// Cross-check of Lynae against a fresh the source.gg source dump (following the same treatment already
// applied to Augusta/Yuanwu/Aemeath/Hiyuki/Luuk Herssen/Qingxiao/Sigrika/Yangyang: Xuanling/Denia/
// Lucilla). Base stats, teams, CHAR_BUFF_TABLE's outroBuffs/libBuffs/tuneBreak (except ruptureDmgMult),
// and RESONANCE_CHAIN_DATA's S4/S5 nodes already matched the fresh dump exactly. Real gaps found:
import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA, SKILL_MULTIPLIERS } from '../data/characters.js';
import { LYNAE_BLOCKS } from '../engine/characterBlocks/lynae.blocks.js';

describe('Lynae — audit fixes against a fresh the source dump', () => {
  it("dmgFocus gains 'Basic ATK' (dominant real 38.1% share, mostly from Visual Impact/Iridescent " +
    "Splash — literally named 'Basic Attack -' in their own move text) and drops the now-trivial " +
    "'Skill' (4.4% share)", () => {
    expect(CHARACTER_DATA['Lynae'].dmgFocus).toEqual(['Basic ATK', 'Liberation']);
  });

  it('Whimpering Wastes tier is T1, not the stale T0.5', () => {
    expect(CHARACTER_DATA['Lynae'].tier).toEqual({ toa: 'T0', ww: 'T1' });
  });

  it('ruptureDmgMult is the real sourced Lv.10 value 1880.75, not the unsourced ~350 estimate', () => {
    expect(CHAR_BUFF_TABLE['Lynae'].tuneBreak.ruptureDmgMult).toBe(1880.75);
  });

  it("Basic ATK:Polychrome Leap ×3 (one of only 7 real rotation steps) now has a real SKILL_MULTIPLIERS " +
    'row and a real damage block — previously 0 DMG, no matching row at all', () => {
    const row = SKILL_MULTIPLIERS['Lynae'].find(r => r[0] === 'Basic ATK' && r[1] === 'Polychrome Leap ×3');
    expect(row).toBeDefined();
    const block = LYNAE_BLOCKS.find(b => b.id === 'lynae.basic.polychrome-leap');
    expect(block).toBeDefined();
    expect(block.damage.category).toBe('basicDmg');
    expect(block.damage.hits.length).toBeGreaterThan(0);
  });

  it('Visual Impact is categorized basicDmg (literally "Basic Attack - Visual Impact" in its own move ' +
    'text), not left uncategorized', () => {
    const block = LYNAE_BLOCKS.find(b => b.id === 'lynae.forte.visual-impact');
    expect(block.damage.category).toBe('basicDmg');
  });

  it('S1/S3 use their real sourced values (Polychrome Leap +120% / Visual Impact +90%), not the stale ' +
    'unsourced totalMult:10 / totalMult:15 placeholders', () => {
    const rc = RESONANCE_CHAIN_DATA['Lynae'];
    expect(rc.s1).toEqual({ basicDmg: 120 });
    expect(rc.s3).toEqual({ basicDmg: 90 });
    const s1 = LYNAE_BLOCKS.find(b => b.id === 'lynae.chain.s1');
    const s3 = LYNAE_BLOCKS.find(b => b.id === 'lynae.chain.s3');
    expect(s1.effects[0]).toEqual({ stat: 'basicDmg', value: 120, source: 'self-kit' });
    expect(s3.effects[0]).toEqual({ stat: 'basicDmg', value: 90, source: 'self-kit' });
  });

  it('S2 also grants a separate Outro-scoped +25% All DMG Amp to the incoming Resonator, on top of ' +
    'its unconditional self +25% All DMG Amp', () => {
    const s2outro = LYNAE_BLOCKS.find(b => b.id === 'lynae.chain.s2-outro-bonus');
    expect(s2outro).toBeDefined();
    expect(s2outro.effects[0]).toEqual({ stat: 'allDmg', value: 25, stacking: 'refresh', source: 'teammate-ally-action' });
    expect(s2outro.target.scope).toBe('next-on-field');
  });

  it('S6 has no reachable DPS component in the modeled standard rotation (its Color of Soul stacks ' +
    'only build via Graffiti Blast/Mid-air Heavy Attack, both exclusive to the unmodeled S6-only ' +
    'alternate rotation) — zeroed from the fabricated totalMult:40', () => {
    expect(RESONANCE_CHAIN_DATA['Lynae'].s6).toEqual({});
    const s6 = LYNAE_BLOCKS.find(b => b.id === 'lynae.chain.s6');
    expect(s6.effects).toEqual([]);
  });
});
