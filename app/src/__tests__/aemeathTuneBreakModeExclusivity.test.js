// the engine-architecture history (git log) item 9 — Aemeath's Fusion Burst exclusivity.
//
// Real bug found investigating this: her participation in the shared calcFusionBurstDmg() reaction
// (active only in Fusion Burst mode, per her own kit text — "In Resonance Mode - Fusion Burst,
// Basic Stage 3/4/Sync Strikes/Intro skills inflict Fusion Burst on hit") was being counted
// unconditionally for any team with her in it — resolved via calcFusionBurstDmg's excludeNames
// param. Her OTHER competing value at the time, Tune Rupture Response - Starburst (596.43%, active
// only in Tune Rupture mode), lived inside calcTuneBreakDmg's own mode-exclusivity resolution,
// which was removed entirely along with the rest of Tune Break/Off-Tune (2026-09-05, direct user
// instruction) — see dotFormulas.js's own note for why.
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';
import { calcFusionBurstDmg, calcDefMult, calcResMult } from '../features/teams/calcEngine.js';

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

  it('calcTeamStats reports Fusion Burst active for Aemeath when the build explicitly sets Fusion Burst mode, both solo and in a real composition', () => {
    const aemeathFusion = { '0:Aemeath': { resonanceMode: 'Fusion Burst mode' } };
    const solo = calcTeamStats(['Aemeath'], 0, 'Aemeath', aemeathFusion, '', 90);
    expect(solo.hasFusionBurst).toBe(true);

    const teamEquipment = { ...aemeathFusion, '0:Lynae': { resonanceMode: 'Tune Rupture mode' } };
    const team = calcTeamStats(['Aemeath', 'Denia', 'Lynae'], 0, 'Aemeath', teamEquipment, '', 90);
    expect(team.hasFusionBurst).toBe(true);
  });
});
