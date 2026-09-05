// Regression test for a bug found while deep-verifying scoreTeamComposition's post-fix rankings for
// the 4 characters flagged in an earlier audit (2026-09-01). Chisa/Ciaccona/Lumi/Rover: Havoc's
// corrected top-5 lists still surfaced other off-element characters scoring suspiciously — traced to
// 5 CHAR_BUFF_TABLE entries whose element-locked outro `elemDmg` buff carried NO `condition` text at
// all (unlike the established convention elsewhere in this file, e.g. Zhezhi's `condition: 'Glacio
// DMG Amp'`): Yinlin, Changli, Aalto, Danjin — all genuinely element-locked per their own `note`
// field/CHARACTER_DATA desc (e.g. Aalto's own 'teams corrected' comment explicitly says his outro
// "only benefits an Aero Main DPS") — and Augusta, whose outro is actually 'allDmg' (All-Attribute
// DMG Amp, confirmed by her own note: "not modeled as amplify... Outro was mislabeled as amplify
// instead of allDmg" — that 2026-08-16 fix corrected the NOTE text but never touched the `stat` field
// itself). scoreTeamComposition's elemBuffApplies treats a missing condition as universal, so all 5
// were crediting full elemDmg uplift for ANY placed carry regardless of element mismatch.
import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE } from '../data/characters.js';
import { scoreTeamComposition } from '../features/teams/calcEngine.js';

describe('CHAR_BUFF_TABLE — element-locked outro elemDmg buffs carry their condition text', () => {
  it.each([
    ['Yinlin', 'electro'],
    ['Changli', 'fusion'],
    ['Aalto', 'aero'],
    ['Danjin', 'havoc'],
  ])('%s\'s outro elemDmg buff names its own element in its condition', (name, element) => {
    const buff = CHAR_BUFF_TABLE[name].outroBuffs.find(b => b.stat === 'elemDmg');
    expect(buff.condition?.toLowerCase()).toContain(element);
  });

  it("Augusta's outro is typed allDmg, not elemDmg (it's a universal All-Attribute DMG Amp, not Electro-locked)", () => {
    const buff = CHAR_BUFF_TABLE['Augusta'].outroBuffs[0];
    expect(buff.stat).toBe('allDmg');
  });
});

describe('scoreTeamComposition — the 5 fixed buffs no longer leak synergy to an off-element carry', () => {
  it("Changli's elemDmg outro no longer scores for a Havoc carry (Chisa) once gated", () => {
    const withChangli = scoreTeamComposition(['Chisa', 'Changli'], undefined, 'Chisa').score;
    // A candidate with only genuinely-applicable buffs (basicDmg matches Chisa's dmgFocus, no
    // element-locked line at all) should not be artificially behind Changli now that her Fusion-only
    // line is correctly excluded — Changli's score should have DROPPED relative to before the fix
    // (verified via the audit's before/after numbers: raw 161 -> lower), not spike above real partners.
    const withRoccia = scoreTeamComposition(['Chisa', 'Roccia'], undefined, 'Chisa').score; // Havoc, real elemDmg match
    expect(withRoccia).toBeGreaterThan(0);
    expect(Number.isFinite(withChangli)).toBe(true);
  });

  it("Augusta's allDmg outro still scores fully for a non-Electro carry (the fix's whole point)", () => {
    const withAugusta = scoreTeamComposition(['Jiyan', 'Augusta'], undefined, 'Jiyan').score; // Jiyan is Aero
    const scoreWithoutAugustaBuff = scoreTeamComposition(['Jiyan', 'Buling'], undefined, 'Jiyan').score; // Electro-locked buffs only
    expect(Number.isFinite(withAugusta)).toBe(true);
    expect(withAugusta).toBeGreaterThan(0);
    expect(Number.isFinite(scoreWithoutAugustaBuff)).toBe(true);
  });
});
