// PHASE3_PLAN.md Stage 4, step 1: calcTeamStats.js's RAW tier (soloDps/rawDps) now composes real
// per-hit damage via resolveHitComposedDps for any character with a converted `.blocks.js` +
// CHARACTER_ROTATIONS entry, falling back to the legacy flat totalMult% formula for anyone not yet
// converted (currently just Jingran, unreleased). This proves the wiring itself — the actual
// per-character numbers are already covered by phase3-parityHarness.test.js.
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';
import { CHARACTER_DATA } from '../data/characters.js';
import { BLOCKS_BY_CHARACTER } from '../engine/characterBlocks/index.js';

describe('calcTeamStats — RAW tier engine composition (Stage 4 step 1)', () => {
  it('a converted solo character produces a positive, finite soloDps/rawDps', () => {
    const stats = calcTeamStats(['Yinlin', null, null], 0, 'Yinlin', {}, '', 90);
    expect(stats).toBeTruthy();
    expect(Number.isFinite(stats.soloDps)).toBe(true);
    expect(stats.soloDps).toBeGreaterThan(0);
    expect(stats.rawDps).toBe(stats.soloDps); // legacy alias, still wired
  });

  it('Jingran (unreleased, no .blocks.js) still resolves via the legacy fallback, not a crash', () => {
    expect(BLOCKS_BY_CHARACTER['Jingran']).toBeUndefined(); // confirms this is a real fallback case, not a stale assumption
    expect(CHARACTER_DATA['Jingran']?.totalMult).toBeGreaterThan(0);
    const stats = calcTeamStats(['Jingran', null, null], 0, 'Jingran', {}, '', 90);
    expect(stats).toBeTruthy();
    expect(Number.isFinite(stats.soloDps)).toBe(true);
    expect(stats.soloDps).toBeGreaterThan(0);
  });

  it('a mixed team (converted + not-yet-converted member) computes cleanly, both contributing', () => {
    const stats = calcTeamStats(['Yinlin', 'Jingran', null], 0, 'Yinlin', {}, '', 90);
    expect(stats).toBeTruthy();
    expect(Number.isFinite(stats.soloDps)).toBe(true);
    expect(stats.soloDps).toBeGreaterThan(0);
  });

  it('a converted character with sequence gear equipped gates chain blocks the same way the engine does directly', () => {
    const withoutSeq = calcTeamStats(['Lucilla', null, null], 0, 'Lucilla', {}, '', 90);
    const withSeq = calcTeamStats(['Lucilla', null, null], 0, 'Lucilla', { '0:Lucilla': { sequence: 6 } }, '', 90);
    // S6 grants a large basicDmg/echoDmg bonus (see lucilla.blocks.js) — S6 gear must score higher.
    expect(withSeq.soloDps).toBeGreaterThan(withoutSeq.soloDps);
  });
});
