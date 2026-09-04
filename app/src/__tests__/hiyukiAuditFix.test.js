// Cross-check of Hiyuki against a fresh the source.gg source dump (following the same treatment
// already applied to Augusta/Yuanwu/Aemeath). Her kit data (SKILL_MULTIPLIERS, RESONANCE_CHAIN_DATA,
// dmgFocus, statScaling, tier, blocks) was already fully audited against the source in an earlier
// pass (see the "Full audit 2026-09-01" comment above CHAR_BUFF_TABLE['Hiyuki'] in characters.js) and
// matched the fresh dump exactly. Only her base ATK was still off.
import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA } from '../data/characters.js';

describe('Hiyuki — base ATK matches source (was 462, should be 463)', () => {
  it('has the correct Lv.90 base ATK', () => {
    expect(CHARACTER_DATA['Hiyuki'].baseAtk).toBe(463);
  });
});
