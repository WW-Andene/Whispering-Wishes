/**
 * Tune Rupture Response DMG now genuinely scales with Tune Break Boost (2026-09-06, user-provided
 * formula: "degat de rupture = multiplicateur du resonator (Tune AMP) x (1 + Tune Break Boost)").
 * Previously `calcTuneBreakDmg`'s own `totalBoost` accumulator (real, sourced baseTuneBreakBoost/
 * boostToTeam data) was applied to the base Tune Break DMG term and to Tune Strain's own term, but
 * NOT to Rupture's — the exact discrepancy the Mechanic doc's §2d flagged as NEEDS SOURCE, now
 * closed. `ruptureDmgMult` (e.g. Aemeath's 596.43%) is the resonator's own "Tune AMP" from the same
 * formula, already correctly sourced and unchanged by this fix.
 */
import { describe, it, expect } from 'vitest';
import { calcTuneBreakDmg, DOT_LEVEL_MULT, DOT_BASE_FACTOR } from '../engine/resolver/dot/dotFormulas.js';
import { CHAR_BUFF_TABLE } from '../data/characters.js';

describe('calcTuneBreakDmg — Rupture DMG now scales with real Tune Break Boost', () => {
  it("a solo Aemeath's own Rupture delta is boosted by her own real baseTuneBreakBoost (10), matching the sourced formula exactly", () => {
    const result = calcTuneBreakDmg([{ name: 'Aemeath' }], 12, 1, 1, null);
    const candidate = result.exclusiveCandidates.find(c => c.name === 'Aemeath');
    expect(candidate).toBeTruthy();

    const tb = CHAR_BUFF_TABLE['Aemeath'].tuneBreak;
    expect(tb.ruptureDmgMult).toBeCloseTo(596.43, 2);
    expect(tb.baseTuneBreakBoost).toBe(10);

    const breaksPerRot = 1; // matches calcTuneBreakDmg's own hasAccel=false path for a solo, no-boostToTeam-over-20 team
    const unboosted = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (tb.ruptureDmgMult / 100) * breaksPerRot * 1 * 1;
    const expectedBoosted = unboosted * (1 + tb.baseTuneBreakBoost * 0.01);
    expect(candidate.ruptureDmgDelta).toBeCloseTo(expectedBoosted, 4);
    // Sanity: the boosted value is genuinely higher than the old (pre-fix) unboosted one — proves
    // this isn't an accidental no-op.
    expect(candidate.ruptureDmgDelta).toBeGreaterThan(unboosted);
  });

  it('a real team-wide Tune Break Boost source (e.g. a teammate granting boostToTeam) raises the SAME character\'s own Rupture delta further, on top of their own base', () => {
    // Denia's Etched Colors grants +10 Tune Break Boost team-wide (real, sourced boostToTeam: 10).
    const solo = calcTuneBreakDmg([{ name: 'Aemeath' }], 12, 1, 1, null);
    const withDenia = calcTuneBreakDmg([{ name: 'Aemeath' }, { name: 'Denia' }], 12, 1, 1, null);
    const soloDelta = solo.exclusiveCandidates.find(c => c.name === 'Aemeath').ruptureDmgDelta;
    const teamDelta = withDenia.exclusiveCandidates.find(c => c.name === 'Aemeath').ruptureDmgDelta;
    expect(teamDelta).toBeGreaterThan(soloDelta);
  });
});
