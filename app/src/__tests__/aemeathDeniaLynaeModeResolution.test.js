// the engine-architecture history (git log) item 9 — the real 3-member interaction that exposed why a marginal
// "delta if this one member is excluded" resolution isn't sound once TWO members (Aemeath, Denia)
// compete for the SAME shared boolean-gated Fusion Burst reaction: excluding just one of two
// co-appliers reads as zero marginal cost (the other alone keeps the reaction active), which made
// Aemeath's own mode choice look artificially free and flipped her resolved stance to Tune Rupture —
// wrong, and inconsistent with her own solo resolution. Replaced with a full combinatorial search
// over every exclusive candidate's own valid options (calcTeamStats.js's own resolution block).
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';

describe('Aemeath + Denia + Lynae — joint mode resolution (the engine-architecture history (git log) item 9)', () => {
  it('resolves Aemeath to Fusion Burst (matching her own solo resolution), Denia to Tune Strain (not redundantly covering Fusion Burst once Aemeath already does), Lynae to Tune Rupture', () => {
    const stats = calcTeamStats(['Aemeath', 'Denia', 'Lynae'], 0, 'Aemeath', {}, '', 90);
    const byName = Object.fromEntries(stats.tuneBreakResolvedStances.map(s => [s.name, s.stance]));
    expect(byName['Aemeath']).toBe('Fusion Burst mode');
    expect(byName['Denia']).toBe('Tune Strain mode');
    expect(byName['Lynae']).toBe('Tune Rupture mode');
  });

  it("Aemeath's resolved stance is consistent whether she's solo or with Denia also fusion-competing — the joint resolution must not make her own choice look artificially free", () => {
    const solo = calcTeamStats(['Aemeath'], 0, 'Aemeath', {}, '', 90);
    const withDenia = calcTeamStats(['Aemeath', 'Denia', 'Lynae'], 0, 'Aemeath', {}, '', 90);
    const soloStance = solo.tuneBreakResolvedStances.find(s => s.name === 'Aemeath').stance;
    const teamStance = withDenia.tuneBreakResolvedStances.find(s => s.name === 'Aemeath').stance;
    expect(soloStance).toBe(teamStance);
  });
});
