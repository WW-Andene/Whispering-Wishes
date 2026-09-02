// Cross-check of Qingxiao against a fresh Prydwen.gg source dump (following the same treatment
// already applied to Augusta/Yuanwu/Aemeath/Hiyuki/Luuk Herssen). Her SKILL_MULTIPLIERS,
// RESONANCE_CHAIN_DATA, statScaling, rotation and CHAR_BUFF_TABLE's other entries were already
// audited and matched the fresh dump exactly. Three real gaps found:
import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE } from '../data/characters.js';
import { QINGXIAO_BLOCKS } from '../engine/characterBlocks/qingxiao.blocks.js';

describe('Qingxiao — audit fixes against a fresh Prydwen dump', () => {
  it("dmgFocus gains 'Basic ATK' — her real damage-output simulation shows a genuine 22.8% Basic share, not a trivial slice", () => {
    expect(CHARACTER_DATA['Qingxiao'].dmgFocus).toEqual(expect.arrayContaining(['Heavy ATK', 'Liberation', 'Basic ATK']));
    expect(CHARACTER_DATA['Qingxiao'].dmgFocus).toHaveLength(3);
  });

  it('was entirely missing from the tier table — now carries her real T0/T1 standard-list tier', () => {
    expect(CHARACTER_DATA['Qingxiao'].tier).toEqual({ toa: 'T0', ww: 'T1' });
  });

  it("Inherent Skill To Know, To Banish's self-buff uses totalMult, not the wrong skillDmg category (its real move list has no Skill-button cast in it)", () => {
    const buff = CHAR_BUFF_TABLE['Qingxiao'].selfBuffs.find(b => b.condition.includes('To Know, To Banish'));
    expect(buff.stat).toBe('totalMult');

    const block = QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.selfbuff.mindlock');
    expect(block.effects[0].stat).toBe('totalMult');
  });
});
