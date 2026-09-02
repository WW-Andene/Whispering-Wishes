// Cross-check of Denia against a fresh Prydwen.gg source dump (following the same treatment
// already applied to Augusta/Yuanwu/Aemeath/Hiyuki/Luuk Herssen/Qingxiao/Sigrika/Yangyang: Xuanling).
// SKILL_MULTIPLIERS, CHARACTER_ROTATIONS, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA, tier and the
// engine block file (denia.blocks.js) all already matched the fresh dump exactly (both had been
// re-audited 2026-09-01 against fandom/nanoka). Real gap found:
import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA } from '../data/characters.js';

describe('Denia — audit fixes against a fresh Prydwen dump', () => {
  it("teams no longer cites 'Denia + Lynae + Mornye' — Lynae never appears anywhere on Denia's " +
    'page, and the prior value contradicted the reciprocal teams entries already in this same file ' +
    "for Aemeath ('Aemeath + Denia + Chisa'), Luuk Herssen ('Luuk Herssen + Denia + Mornye') and " +
    "Qingxiao ('Qingxiao + Denia + Mornye')", () => {
    const teams = CHARACTER_DATA['Denia'].teams;
    expect(teams.some(t => t.includes('Lynae'))).toBe(false);
    expect(teams).toContain('Aemeath + Denia + Chisa');
    expect(teams).toContain('Qingxiao + Denia + Mornye');
  });
});
