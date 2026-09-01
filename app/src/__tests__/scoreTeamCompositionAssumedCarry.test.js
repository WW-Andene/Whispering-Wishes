// Regression test for a bug found during a full per-character/all-pairs recommendation audit
// (2026-09-01, following up on the Rebecca/Augusta report). TeamsTab.jsx's teammate recommender
// scores every candidate by forming a hypothetical team [...placedNow, candidate] and calling
// scoreTeamComposition(hypotheticalTeam, ownedWeaps, dpsOverride). Without an explicit crown AND with
// no role:'Main DPS' member already placed (the common case — a player who just placed a single Sub
// DPS/support, e.g. Yinlin, hasn't crowned anyone), scoreTeamComposition's own internal fallback
// (`roleMainDps = members.find(role === 'Main DPS')`) let ANY candidate who happens to be role:'Main
// DPS' silently become the presumed carry for scoring — evaluating "how good would this candidate be
// AS THE STAR, with the placed member as their support" instead of "how good is this candidate as a
// TEAMMATE for the character being built around". Every top-tier, off-element Main DPS in the roster
// (Hiyuki, Aemeath, Sigrika, ...) won this way for nearly any placed Sub DPS/support, regardless of
// real synergy — e.g. Hiyuki (Glacio) topped Yinlin's (Electro) recommendations with zero applicable
// buff, purely by getting scored as if SHE were the team's DPS.
//
// Fixed at the call site (TeamsTab.jsx) by anchoring an explicit `assumedMainDps`: the crown if set,
// else an already-placed role:'Main DPS' member if one exists, else the first placed character —
// never the yet-untested candidate itself. This test exercises the same fix at the calcEngine.js
// level: passing dpsOverride explicitly must anchor mainDps to that member even when a candidate in
// the team is role:'Main DPS', instead of the default falling through to them.
import { describe, it, expect } from 'vitest';
import { scoreTeamComposition } from '../features/teams/calcEngine.js';

describe('scoreTeamComposition — explicit dpsOverride anchors the assumed carry (character-selector fix)', () => {
  it('an off-element Main DPS candidate scores dramatically lower once dpsOverride correctly anchors the placed Sub DPS as the real carry', () => {
    // Without anchoring: Hiyuki (role:'Main DPS', Glacio) becomes the presumed carry by default,
    // scoring herself as a strong DPS regardless of Yinlin (Electro, Sub DPS).
    const unanchored = scoreTeamComposition(['Yinlin', 'Hiyuki']).score;
    // With anchoring: Yinlin (the actually-placed, actually-being-built-around character) stays the
    // assumed carry — Hiyuki is now scored as a teammate FOR Yinlin, not as the star herself. Her
    // outro (Glacio-Chafe-conditioned elemDmg) doesn't apply to an Electro carry, so this should be
    // substantially lower.
    const anchored = scoreTeamComposition(['Yinlin', 'Hiyuki'], undefined, 'Yinlin').score;
    expect(anchored).toBeLessThan(unanchored - 20);
  });

  it('a real, complete 3-member team scores identically regardless of this fix (no regression for a finished team)', () => {
    // Augusta is already role:'Main DPS' and present, so roleMainDps === 'Augusta' either way —
    // explicit dpsOverride here is a no-op, matching TeamsTab.jsx's own real-team scoring path.
    const withoutOverride = scoreTeamComposition(['Augusta', 'Mortefi', 'Shorekeeper']);
    const withOverride = scoreTeamComposition(['Augusta', 'Mortefi', 'Shorekeeper'], undefined, 'Augusta');
    expect(withOverride.score).toBeCloseTo(withoutOverride.score, 6);
  });
});
