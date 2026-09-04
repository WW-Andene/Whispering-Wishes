// Cross-check of Qingxiao against a fresh the source.gg source dump (following the same treatment
// already applied to Augusta/Yuanwu/Aemeath/Hiyuki/Luuk Herssen). Her SKILL_MULTIPLIERS,
// RESONANCE_CHAIN_DATA, statScaling, rotation and CHAR_BUFF_TABLE's other entries were already
// audited and matched the fresh dump exactly. Three real gaps found:
import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE } from '../data/characters.js';
import { QINGXIAO_BLOCKS } from '../engine/characterBlocks/qingxiao.blocks.js';

describe('Qingxiao — audit fixes against a fresh the source dump', () => {
  it("dmgFocus gains 'Basic ATK' — her real damage-output simulation shows a genuine 22.8% Basic share, not a trivial slice", () => {
    expect(CHARACTER_DATA['Qingxiao'].dmgFocus).toEqual(expect.arrayContaining(['Heavy ATK', 'Liberation', 'Basic ATK']));
  });

  // Added 2026-09-04 (full 9-dimension re-audit, fresh dump): Outro (Lingering Song) is a real 10.8%
  // damage share per the dump's own Damage Profile — above this project's own established dmgFocus
  // include threshold (6.8%+) and her 4th-largest bucket. See characters.js's own dmgFocus comment.
  it("dmgFocus gains 'Outro' — Lingering Song is a genuine 10.8% damage share, above the include threshold", () => {
    expect(CHARACTER_DATA['Qingxiao'].dmgFocus).toEqual(expect.arrayContaining(['Heavy ATK', 'Liberation', 'Basic ATK', 'Outro']));
    expect(CHARACTER_DATA['Qingxiao'].dmgFocus).toHaveLength(4);
  });

  it('was entirely missing from the tier table — now carries her real T0/T1 standard-list tier', () => {
    expect(CHARACTER_DATA['Qingxiao'].tier).toEqual({ toa: 'T0', ww: 'T1' });
  });

  it("Inherent Skill To Know, To Banish's real move list has no Skill-button cast in it, so the legacy selfBuffs entry uses totalMult, not the wrong skillDmg category (the TriggerBlock side later removed the duplicate self-buff entirely — see qingxiao.blocks.js's own removal note — since it modeled the SAME mechanic as qingxiao.debuff.mindlock, an enemy-side debuff, not a real second self-buff)", () => {
    const buff = CHAR_BUFF_TABLE['Qingxiao'].selfBuffs.find(b => b.condition.includes('To Know, To Banish'));
    expect(buff.stat).toBe('totalMult');
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.selfbuff.mindlock')).toBeUndefined();
  });
});
