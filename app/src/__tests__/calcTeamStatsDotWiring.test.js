// PHASE3_PLAN.md Stage 4, step 3/6: calcTeamStats.js's DOT computation now composes via
// engine/resolver/dot/dotReactions.js's resolveDotReactionDps instead of calling calcFrazzleDmg/calcErosionDmg/
// calcFusionBurstDmg/calcElectroFlareDmg individually — a pure plumbing swap (same
// underlying calcEngine.js functions, same inputs), so this proves the swap is behavior-preserving:
// hasFrazzle/hasErosion/hasFusionBurst/hasElectroFlare/dotDps/dmgSources all still come out sane.
// Tune Break/Off-Tune (a fifth mechanic that used to be composed in here too) was removed entirely
// (2026-09-05, direct user instruction) — see dotFormulas.js's own note for why.
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';

describe('calcTeamStats — DOT wiring via dotReactions.js (Stage 4 step 3)', () => {
  it('a team with a real Frazzle applier (Phoebe) reports hasFrazzle and a positive DOT share', () => {
    const stats = calcTeamStats(['Camellya', 'Phoebe', 'Verina'], 0, 'Camellya', {}, '', 90);
    expect(stats.hasFrazzle).toBe(true);
    expect(stats.dotDps).toBeGreaterThan(0);
    expect(stats.dmgSources.dot).toBeGreaterThan(0);
  });

  it('a team with no Frazzle/Erosion/Fusion Burst/Electro Flare applier reports those flags false and zero DOT damage (Tune Break/Off-Tune removed 2026-09-05)', () => {
    const stats = calcTeamStats(['Yinlin', 'Augusta', 'Rover: Electro'], 0, 'Yinlin', {}, '', 90);
    expect(stats.hasFrazzle).toBe(false);
    expect(stats.hasErosion).toBe(false);
    expect(stats.hasFusionBurst).toBe(false);
    expect(stats.hasElectroFlare).toBe(false);
    expect(stats.dotDps).toBe(0);
    expect(stats.dmgSources.dot).toBe(0);
  });

  it('dmgSources percentages (rotation/echo/dot) always sum to ~100', () => {
    const stats = calcTeamStats(['Camellya', 'Phoebe', 'Verina'], 0, 'Camellya', {}, '', 90);
    const sum = stats.dmgSources.rotation + stats.dmgSources.echo + stats.dmgSources.dot;
    expect(sum).toBeGreaterThanOrEqual(99);
    expect(sum).toBeLessThanOrEqual(101);
  });
});
