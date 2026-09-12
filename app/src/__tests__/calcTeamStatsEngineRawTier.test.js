// PHASE3_PLAN.md Stage 4, step 1: calcTeamStats.js's RAW tier (soloDps/rawDps) now composes real
// per-hit damage via resolveHitComposedDps for any character with a converted `.blocks.js` +
// CHARACTER_ROTATIONS entry, falling back to the legacy flat totalMult% formula for anyone not yet
// converted. Updated 2026-09-12: Jingran (the last remaining not-yet-converted character) was
// converted once his real CHARACTER_ROTATIONS entry was sourced — every CHARACTER_DATA character
// is now fully converted, so the legacy-fallback tests below that used him as the "not yet
// converted" example were rewritten to reflect that (the fallback code path itself is untouched
// and still exists for any future not-yet-converted release). This proves the wiring itself — the
// actual per-character numbers are already covered by phase3-parityHarness.test.js.
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

  it('Jingran (converted 2026-09-12) now resolves via the real engine path, not the legacy fallback', () => {
    expect(BLOCKS_BY_CHARACTER['Jingran']).toBeTruthy(); // was the last not-yet-converted character; now converted
    expect(CHARACTER_DATA['Jingran']?.totalMult).toBeGreaterThan(0);
    const stats = calcTeamStats(['Jingran', null, null], 0, 'Jingran', {}, '', 90);
    expect(stats).toBeTruthy();
    expect(Number.isFinite(stats.soloDps)).toBe(true);
    expect(stats.soloDps).toBeGreaterThan(0);
  });

  it('a team of two fully-converted characters computes cleanly, both contributing', () => {
    // Was a "converted + not-yet-converted" mixed-team check using Jingran as the not-yet-converted
    // member — every CHARACTER_DATA character is now converted (Jingran included, see above), so
    // there is currently no real not-yet-converted character to exercise that fallback path with;
    // kept as a plain two-converted-member sanity check instead of fabricating a fake gap.
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
