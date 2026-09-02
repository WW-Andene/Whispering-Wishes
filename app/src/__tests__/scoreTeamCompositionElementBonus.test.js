// This file previously tested a flat "same-element team" bonus (Resonance +12 / Mono +20) in
// scoreTeamComposition. That bonus was REMOVED entirely on 2026-09-02, following a user's real-game-
// knowledge correction during a recommendation audit: Wuthering Waves has no mono-element/elemental-
// reaction team mechanic (unlike games that do) — sharing an element between teammates does nothing on
// its own, and real teams routinely mix elements freely (e.g. Qingxiao + Denia + Mornye, cited as
// counter-evidence). The only real elemental synergy is a SPECIFIC character's elemDmg buff actually
// naming the recipient's element, already scored correctly and separately elsewhere in this function
// via elemBuffApplies. The flat bonus awarded synergy that doesn't mechanically exist, on top of
// whatever real elemDmg-buff credit already applied — confirmed as the exact mechanism that let
// Rebecca (Electro, same as Augusta, but no element-locked buff) outrank Iuno, Augusta's own curated
// real partner (Aero, off-element, but with a real, genuine heavyDmg buff): Rebecca's only edge was
// this ungrounded bonus.
//
// The original bug this file documented (a still-INCOMPLETE 2-member hypothetical team getting the
// full committed-mono bonus a full pick before the team was actually mono) is now moot — there's no
// Mono/Resonance bonus left to prematurely credit. Kept as a regression test that the tags are gone
// and that Mortefi (Augusta's real curated partner) still correctly outranks Rebecca (not curated) now
// that same-element overlap alone confers nothing.
import { describe, it, expect } from 'vitest';
import { scoreTeamComposition } from '../features/teams/calcEngine.js';

describe('scoreTeamComposition — no element-overlap bonus exists (removed 2026-09-02)', () => {
  it('a same-element pair gets no Mono/Resonance tag at all — element overlap alone confers nothing', () => {
    const { tags } = scoreTeamComposition(['Augusta', 'Rebecca']); // both Electro
    expect(tags).not.toContain('Resonance');
    expect(tags).not.toContain('Mono');
  });

  it("a genuine complete 3-member mono team also gets no Mono/Resonance tag — only each member's own real buffs count", () => {
    const { tags } = scoreTeamComposition(['Augusta', 'Rebecca', 'Yinlin']); // all Electro
    expect(tags).not.toContain('Resonance');
    expect(tags).not.toContain('Mono');
  });

  it("Augusta's real curated partner Mortefi outranks the same-element-only Rebecca once TeamsTab.jsx's curated-teams vote bonus is folded in (the actual recommendation pipeline)", () => {
    // Mirrors TeamsTab.jsx's own candidateScores formula: score + (curatedVotes.get(name) || 0) * 20.
    // Mortefi is named in Augusta's own CHARACTER_DATA.teams entry (a real, community-tested pairing);
    // Rebecca isn't, and no longer gets any element-overlap credit to compensate.
    const CURATED_VOTE_BONUS = 20;
    const rebecca = scoreTeamComposition(['Augusta', 'Rebecca']).score;
    const mortefi = scoreTeamComposition(['Augusta', 'Mortefi']).score + CURATED_VOTE_BONUS;
    expect(mortefi).toBeGreaterThan(rebecca);
  });
});
