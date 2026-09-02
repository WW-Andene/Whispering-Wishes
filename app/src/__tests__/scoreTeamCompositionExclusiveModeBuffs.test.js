// Regression test found via a precise audit of one real base team (Encore + Shorekeeper)'s 3rd-slot
// recommendations. Denia topped the list at 393.8, ahead of Encore's own curated real partners Lupa
// (373.0) and Brant (326.1) — suspicious since Denia isn't in Encore's CHARACTER_DATA.teams at all.
//
// Root cause: Denia is a dual-mode Hybrid (her own `desc`: "switches between Stagecraft and Breakdown
// Form via her two Ultimates, playing into either Fusion Burst or Tune Strain team archetypes
// depending on Resonance Mode" — mutually exclusive, a player picks one). Her CHAR_BUFF_TABLE outro
// has two entries for the two modes (allDmg 15% 'Tune Strain mode', elemDmg 60% 'Fusion Burst mode'),
// but scoreTeamComposition summed both unconditionally — crediting a team state (both modes' buffs at
// once) that can't actually happen in one rotation. Isolating each buff confirmed the inflation: both
// credited = 393.8; Fusion Burst mode alone (the real single-mode ceiling for a Fusion-carry build) =
// 367.1, correctly below Lupa. Lucilla has the identical dual-mode pattern (Glacio Chafe vs Echo mode,
// per her own `desc`) and was affected the same way.
//
// Fixed by grouping outroBuffs entries whose condition names a Resonance Mode (contains "mode",
// matching this table's own existing convention for every dual-mode character) and scoring only the
// single best-applying one per group, while every other outroBuffs entry (no "mode" in its condition
// — the common case, e.g. Yinlin's elemDmg + libDmg, which really do fire together off one real outro
// cast) keeps summing exactly as before.
import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE } from '../data/characters.js';
import { scoreTeamComposition } from '../features/teams/calcEngine.js';

describe('scoreTeamComposition — mutually-exclusive Resonance-Mode outro buffs are not double-credited', () => {
  it("Denia's two mode-locked outro buffs both carry 'mode' in their condition (the grouping marker)", () => {
    const buffs = CHAR_BUFF_TABLE['Denia'].outroBuffs;
    expect(buffs.length).toBe(2);
    buffs.forEach(b => expect(b.condition.toLowerCase()).toContain('mode'));
  });

  it("Denia no longer outranks Encore's own curated real partners (Lupa/Brant) for an Encore-anchored team", () => {
    const denia = scoreTeamComposition(['Encore', 'Shorekeeper', 'Denia'], undefined, 'Encore').score;
    const lupa = scoreTeamComposition(['Encore', 'Shorekeeper', 'Lupa'], undefined, 'Encore').score;
    expect(denia).toBeLessThan(lupa);
  });

  it("Denia's score matches crediting exactly ONE mode (her elemDmg Fusion Burst buff alone), not both", () => {
    const saved = CHAR_BUFF_TABLE['Denia'].outroBuffs;
    const fusionBurstOnly = saved.filter(b => b.stat === 'elemDmg');
    CHAR_BUFF_TABLE['Denia'].outroBuffs = fusionBurstOnly;
    const isolatedScore = scoreTeamComposition(['Encore', 'Shorekeeper', 'Denia'], undefined, 'Encore').score;
    CHAR_BUFF_TABLE['Denia'].outroBuffs = saved;

    const groupedScore = scoreTeamComposition(['Encore', 'Shorekeeper', 'Denia'], undefined, 'Encore').score;
    expect(groupedScore).toBeCloseTo(isolatedScore, 6);
  });

  it('a normal simultaneous-effect outro (no "mode" text) still sums both entries, unchanged', () => {
    // Yinlin's outro grants Electro DMG Amp AND Liberation DMG Amp together off the same real cast —
    // neither entry names a Resonance Mode, so both should still stack, same as before this fix.
    const buffs = CHAR_BUFF_TABLE['Yinlin'].outroBuffs;
    expect(buffs.length).toBe(2);
    buffs.forEach(b => expect((b.condition || '').toLowerCase()).not.toContain('mode'));
  });
});
