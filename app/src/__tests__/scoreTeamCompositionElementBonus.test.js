// Regression test for a bug found during a character-recommendation audit (2026-09-01, prompted by
// a user report: "Rebecca en #1 pour Augusta ne me paraît pas correct"). TeamsTab.jsx's teammate
// recommender scores every eligible candidate by forming a HYPOTHETICAL team (already-placed members
// + candidate) and running it through scoreTeamComposition — with only one member placed (the common
// "who should I add next" flow), that hypothetical team has exactly 2 members.
//
// scoreTeamComposition's old Element section fired Resonance (+12) and Mono (+8) TOGETHER whenever
// every member present shared an element (`elSet.size === 1`), stacking to +20 — correct for a real,
// COMPLETE 3-member mono team, but that same condition is trivially true for ANY 2-member pair that
// happens to share an element, since a still-unpicked 3rd slot can't yet contradict it. A same-
// element Sub DPS with no real kit synergy (Rebecca, Electro) was getting the full committed-mono
// payoff a full turn before the team was actually mono, letting it outrank Augusta's real curated
// partners (Mortefi/Iuno/Shorekeeper/Verina — all different elements) whose value comes from a
// genuine kit buff, not incidental element overlap: before this fix, Rebecca's raw score (246) beat
// even Mortefi's score PLUS his curated-vote bonus (221 + 20 = 241).
//
// Fixed by requiring an ACTUALLY COMPLETE 3-member team for the full +20; an incomplete hypothetical
// now only gets the smaller +12 partial-resonance credit instead.
import { describe, it, expect } from 'vitest';
import { scoreTeamComposition } from '../features/teams/calcEngine.js';

describe('scoreTeamComposition — element Mono bonus requires a complete team (Element bug fix)', () => {
  it('a 2-member same-element pair gets partial Resonance, not the full committed-mono bonus', () => {
    const { tags } = scoreTeamComposition(['Augusta', 'Rebecca']); // both Electro
    expect(tags).toContain('Resonance');
    expect(tags).not.toContain('Mono');
  });

  it("Augusta's real curated partner Mortefi outranks the same-element-only Rebecca once TeamsTab.jsx's curated-teams vote bonus is folded in (the actual recommendation pipeline)", () => {
    // Mirrors TeamsTab.jsx's own candidateScores formula: score + (curatedVotes.get(name) || 0) * 20.
    // Mortefi is named in Augusta's own CHARACTER_DATA.teams entry (a real, community-tested pairing);
    // Rebecca isn't. Before this fix, Rebecca's premature full-mono bonus (+20, both Electro) alone
    // was enough to beat Mortefi even WITH his +20 curated-vote bonus.
    const CURATED_VOTE_BONUS = 20;
    const rebecca = scoreTeamComposition(['Augusta', 'Rebecca']).score;
    const mortefi = scoreTeamComposition(['Augusta', 'Mortefi']).score + CURATED_VOTE_BONUS;
    expect(mortefi).toBeGreaterThan(rebecca);
  });
});
