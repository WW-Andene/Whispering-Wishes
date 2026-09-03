// the engine-architecture history (git log) item 9 — Aemeath's mode-exclusivity fix, cross-reaction case.
//
// Real bug found investigating this: her Tune Rupture Response - Starburst proc (596.43%, active
// only in Tune Rupture mode per her own kit text) and her participation in the shared
// calcFusionBurstDmg() reaction (active only in Fusion Burst mode, per her own kit text — "In
// Resonance Mode - Fusion Burst, Basic Stage 3/4/Sync Strikes/Intro skills inflict Fusion Burst on
// hit") were BOTH being counted unconditionally for any team with her in it. Unlike Lynae's fix (both
// competing values lived inside calcTuneBreakDmg itself), this one spans two separate reaction
// functions (calcTuneBreakDmg's own ruptureDmgMult vs calcFusionBurstDmg's participation gate) —
// resolved via calcFusionBurstDmg's new excludeNames param + dotReactions.js computing each
// competing candidate's real fusionBurstDeltaIfExcluded, then calcTeamStats.js picking whichever of
// Fusion/Rupture/Strain candidates yields the highest real final total.
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';
import { calcFusionBurstDmg, calcTuneBreakDmg, calcDefMult, calcResMult } from '../features/teams/calcEngine.js';

describe('Aemeath Tune Break / Fusion Burst mode-exclusivity fix', () => {
  it('calcFusionBurstDmg excludeNames lets a caller ask "without member X" without changing any existing (no-exclude) caller', () => {
    const rotTime = 12, defMult = calcDefMult(800, 0, 0), resMult = calcResMult(10, 0);
    const withAemeath = calcFusionBurstDmg([{ name: 'Aemeath' }], rotTime, defMult, resMult);
    const withoutAemeath = calcFusionBurstDmg([{ name: 'Aemeath' }], rotTime, defMult, resMult, ['Aemeath']);
    expect(withAemeath.active).toBe(true);
    expect(withoutAemeath.active).toBe(false);
    expect(withoutAemeath.dmg).toBe(0);
    // default (no excludeNames arg at all) behaves exactly like before this change
    const defaultCall = calcFusionBurstDmg([{ name: 'Aemeath' }], rotTime, defMult, resMult);
    expect(defaultCall).toEqual(withAemeath);
  });

  it('calcTuneBreakDmg flags Aemeath as an exclusive candidate (not folded into unconditional dmg)', () => {
    const result = calcTuneBreakDmg([{ name: 'Aemeath' }], 12, 1, 1, null);
    expect(result.exclusiveCandidates).toHaveLength(1);
    expect(result.exclusiveCandidates[0].name).toBe('Aemeath');
    expect(result.exclusiveCandidates[0].ruptureDmgDelta).toBeGreaterThan(0);
  });

  it('calcTeamStats resolves Aemeath to Fusion Burst mode, both solo and in a real composition — matching the real meta verdict, not a text-only guess', () => {
    const solo = calcTeamStats(['Aemeath'], 0, 'Aemeath', {}, '', 90);
    const soloStance = solo.tuneBreakResolvedStances.find(s => s.name === 'Aemeath');
    expect(soloStance).toBeDefined();
    expect(soloStance.stance).toBe('Fusion Burst mode');

    const team = calcTeamStats(['Aemeath', 'Denia', 'Lynae'], 0, 'Aemeath', {}, '', 90);
    const teamStance = team.tuneBreakResolvedStances.find(s => s.name === 'Aemeath');
    expect(teamStance).toBeDefined();
    expect(teamStance.stance).toBe('Fusion Burst mode');
    // Lynae's own resolution is independent of Aemeath's and stays Tune Rupture mode either way.
    const lynaeStance = team.tuneBreakResolvedStances.find(s => s.name === 'Lynae');
    expect(lynaeStance.stance).toBe('Tune Rupture mode');
  });
});
