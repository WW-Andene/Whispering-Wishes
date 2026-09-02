// Cross-check of Sigrika against a fresh Prydwen.gg source dump (following the same treatment
// already applied to Augusta/Yuanwu/Aemeath/Hiyuki/Luuk Herssen/Qingxiao). Rotation, SKILL_MULTIPLIERS,
// tier, statScaling, and the CHAR_BUFF_TABLE self/team buffs already matched the fresh dump exactly.
// Real gaps found:
import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { SIGRIKA_BLOCKS } from '../engine/characterBlocks/sigrika.blocks.js';

describe('Sigrika — audit fixes against a fresh Prydwen dump', () => {
  it('has the correct Lv.90 base ATK/DEF (was 437/1136, should be 438/1137)', () => {
    expect(CHARACTER_DATA['Sigrika'].baseAtk).toBe(438);
    expect(CHARACTER_DATA['Sigrika'].baseDef).toBe(1137);
  });

  it("dmgFocus drops 'Heavy ATK' — her real damage-output simulation shows a genuine 0% Heavy share (Schemata of Runes explicitly deals Echo Skill DMG per kit text)", () => {
    expect(CHARACTER_DATA['Sigrika'].dmgFocus).toEqual(['Echo']);
  });

  it("Runic Chain Whip / Runic Outburst damage blocks are categorized echoDmg, not heavyDmg", () => {
    const chainWhip = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.forte.schemata-chain-whip');
    const outburst = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.forte.schemata-runic-outburst');
    expect(chainWhip.damage.category).toBe('echoDmg');
    expect(outburst.damage.category).toBe('echoDmg');
  });

  it("S5's cast-scoped chain buff uses echoDmg (matching the echoDmg-categorized Liberation hit it scopes to), not the wrong libDmg", () => {
    expect(RESONANCE_CHAIN_DATA['Sigrika'].s5).toEqual({ echoDmg: 30 });
    const s5 = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s5');
    expect(s5.effects[0].stat).toBe('echoDmg');
  });

  it("S6 uses deepen:30 (targets take +30% more DMG from Sigrika), not the unsourced defIgnore:15", () => {
    expect(RESONANCE_CHAIN_DATA['Sigrika'].s6).toEqual({ deepen: 30 });
    const s6 = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s6');
    expect(s6.effects[0]).toEqual({ stat: 'deepen', value: 30 });
  });
});
