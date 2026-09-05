/**
 * Tune Break's universal gate fix (2026-09-06, direct user correction): "tune break is universal
 * (when off tune gauge is full and you break it). what is not universal is Tune Rupture and Tune
 * Strain." Previously `calcTuneBreakDmg` returned `{dmg: 0}` outright whenever no team member had
 * a `CHAR_BUFF_TABLE[name].tuneBreak` flag (the ~9 Rupture/Strain specialists) — a real, roster-
 * wide gap affecting most team compositions. The base burst (TUNE_BREAK_BASE_DMG) now derives from
 * ANY team's real summed Off-Tune generation crossing the real enemy gauge, same as
 * Frazzle/Erosion's own real-applier-gated (not character-gated) behavior. Only the Rupture/Strain
 * BONUS layer (ruptureDmgMult/strainDmgPerStack) stays gated on a real specialist.
 */
import { describe, it, expect } from 'vitest';
import { calcTuneBreakDmg } from '../engine/resolver/dot/dotFormulas.js';
import { BLOCKS_BY_CHARACTER } from '../engine/characterBlocks/index.js';

describe('calcTuneBreakDmg — universal base burst, specialist-gated bonus', () => {
  it('a team with ZERO Rupture/Strain specialists still gets a real, nonzero base burst when real blocks are supplied', () => {
    const blocksByOwner = { Yinlin: BLOCKS_BY_CHARACTER['Yinlin'] };
    const result = calcTuneBreakDmg([{ name: 'Yinlin' }], 12, 1, 1, null, blocksByOwner);
    expect(result.dmg).toBeGreaterThan(0);
    expect(result.exclusiveCandidates).toEqual([]); // no specialist -> no Rupture/Strain candidates
  });

  it('a specialist (Aemeath) still gets the SAME universal base burst PLUS her own Rupture bonus on top — strictly more than a non-specialist with equivalent Off-Tune generation would', () => {
    const nonSpecialist = calcTuneBreakDmg([{ name: 'Yinlin' }], 12, 1, 1, null, { Yinlin: BLOCKS_BY_CHARACTER['Yinlin'] });
    const specialist = calcTuneBreakDmg([{ name: 'Aemeath' }], 12, 1, 1, null, { Aemeath: BLOCKS_BY_CHARACTER['Aemeath'] });
    expect(specialist.dmg).toBeGreaterThan(nonSpecialist.dmg);
    expect(specialist.exclusiveCandidates.length).toBeGreaterThan(0);
  });

  it('without any real blocksByOwner AND without a specialist, still returns zero — no data means no guess, not a fabricated universal rate', () => {
    const result = calcTuneBreakDmg([{ name: 'Yinlin' }], 12, 1, 1, null);
    expect(result).toEqual({ dmg: 0, deepenMult: 1, exclusiveCandidates: [] });
  });

  it("without real blocksByOwner but WITH a specialist, falls back to the old flat heuristic unchanged (backward compatibility for a caller that can't supply real blocks)", () => {
    const result = calcTuneBreakDmg([{ name: 'Aemeath' }], 12, 1, 1, null);
    expect(result.dmg).toBe(5500); // TUNE_BREAK_BASE_DMG(5000) * (1 + 10*0.01) * 1 breaksPerRot * defMult(1)
  });
});
