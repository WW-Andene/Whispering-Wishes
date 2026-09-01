// PHASE3_PLAN.md Stage 4, step 2/6: calcTeamStats.js's FULL tier (teamDps/memberDps) now composes
// real cross-character team damage via chooseOnFieldOrder + resolveHitComposedTeamDps for any team
// where EVERY member has a converted TriggerBlocks file + CHARACTER_ROTATIONS entry, instead of the
// flat totalMult%-plus-hand-written-buff-routing formula. A mixed team (containing a not-yet-
// converted member) keeps the unchanged legacy computation.
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';

describe('calcTeamStats — FULL tier engine composition (Stage 4 step 2)', () => {
  it('a fully-converted 3-member team produces a positive, finite teamDps, greater than soloDps (team buffs help)', () => {
    const stats = calcTeamStats(['Yinlin', 'Augusta', 'Rover: Electro'], 0, 'Yinlin', {}, '', 90);
    expect(stats).toBeTruthy();
    expect(Number.isFinite(stats.teamDps)).toBe(true);
    expect(stats.teamDps).toBeGreaterThan(0);
    expect(stats.teamDps).toBeGreaterThan(stats.soloDps);
  });

  it('memberDps entries are all finite, non-negative, and their pct roughly sums to 100', () => {
    const stats = calcTeamStats(['Camellya', 'Danjin', 'Verina'], 0, 'Camellya', {}, '', 90);
    expect(stats.memberDps).toHaveLength(3);
    for (const m of stats.memberDps) {
      expect(Number.isFinite(m.dmg)).toBe(true);
      expect(m.dmg).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(m.pct)).toBe(true);
    }
    const totalPct = stats.memberDps.reduce((s, m) => s + m.pct, 0);
    expect(totalPct).toBeGreaterThan(90);
    expect(totalPct).toBeLessThan(110); // rounding slack
  });

  it('a mixed team (Jingran, not yet converted) still computes cleanly via the legacy fallback', () => {
    const stats = calcTeamStats(['Jingran', 'Verina', null], 0, 'Jingran', {}, '', 90);
    expect(stats).toBeTruthy();
    expect(Number.isFinite(stats.teamDps)).toBe(true);
    expect(stats.teamDps).toBeGreaterThan(0);
  });

  it('a solo (1-member) fully-converted team still computes teamDps (order search degenerates cleanly)', () => {
    const stats = calcTeamStats(['Yinlin', null, null], 0, 'Yinlin', {}, '', 90);
    expect(stats).toBeTruthy();
    expect(Number.isFinite(stats.teamDps)).toBe(true);
    expect(stats.teamDps).toBeGreaterThan(0);
  });
});
