/**
 * Real Tune Break trigger timing (2026-09-06, direct user instruction): "when it's automatic,
 * trigger when gauge is full, when it's not automatic trigger on the rotation optimal
 * window/character... in the end it's a DPS question as always." Since this calculator already
 * assumes optimal play everywhere (perfect timing, perfect uptime), the automatic-mob-vs-manual-
 * F-press distinction converges to the SAME math: an optimal player presses F the instant the
 * gauge is full. Previously `breaksPerRot` was a flat, ungrounded guess ("assume ~1 per rotation,
 * or up to 2 with an acceleration buff") — now it's the real team Off-Tune generation rate divided
 * by the enemy's real gauge total (ENEMY_OFF_TUNE_GAUGE.boss — every selectable enemyEcho is
 * boss/Overlord-tier, since echoes only drop from that tier).
 */
import { describe, it, expect } from 'vitest';
import { calcTuneBreakDmg } from '../engine/resolver/dot/dotFormulas.js';
import { BLOCKS_BY_CHARACTER } from '../engine/characterBlocks/index.js';
import { resolveOffTuneGenerated } from '../engine/resolver/dps/resolveOffTune.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { ENEMY_OFF_TUNE_GAUGE } from '../engine/math/offTuneFormula.js';

describe('calcTuneBreakDmg — real Off-Tune-gauge-crossing breaksPerRot', () => {
  it('a solo Aemeath with real blocksByOwner uses a real gauge-crossing rate, genuinely different from the old flat heuristic', () => {
    const blocksByOwner = { Aemeath: BLOCKS_BY_CHARACTER['Aemeath'] };
    const withReal = calcTuneBreakDmg([{ name: 'Aemeath' }], 12, 1, 1, null, blocksByOwner);
    const withHeuristic = calcTuneBreakDmg([{ name: 'Aemeath' }], 12, 1, 1, null); // no blocksByOwner — old flat fallback

    // Independently recompute the expected real breaksPerRot and verify calcTuneBreakDmg matches it
    // exactly, not just "is different."
    const realOffTune = resolveOffTuneGenerated(BLOCKS_BY_CHARACTER['Aemeath'], CHARACTER_ROTATIONS['Aemeath']).total;
    const expectedBreaksPerRot = realOffTune / ENEMY_OFF_TUNE_GAUGE.boss.max;
    const expectedRuptureDelta = withReal.exclusiveCandidates.find(c => c.name === 'Aemeath').ruptureDmgDelta;
    // Reconstruct from the same formula this file's own dotFormulas.js uses, to prove the real rate
    // is genuinely wired through end to end.
    const tb = { ruptureDmgMult: 596.43, baseTuneBreakBoost: 10 }; // Aemeath's real sourced tuneBreak fields
    const DOT_LEVEL_MULT = 3674, DOT_BASE_FACTOR = 1.25078;
    const manualExpected = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (tb.ruptureDmgMult / 100) * (1 + tb.baseTuneBreakBoost * 0.01) * expectedBreaksPerRot * 1 * 1;
    expect(expectedRuptureDelta).toBeCloseTo(manualExpected, 4);

    expect(withReal.dmg).not.toBe(withHeuristic.dmg);
  });

  it('falls back to the old flat heuristic when no blocksByOwner is supplied — every existing caller unchanged', () => {
    const result = calcTuneBreakDmg([{ name: 'Aemeath' }], 12, 1, 1, null);
    // breaksPerRot=1 (no acceleration buff) -> dmg = TUNE_BREAK_BASE_DMG * (1 + totalBoost*0.01) * 1 * defMult
    // totalBoost = baseTuneBreakBoost(10) = 10 -> 5000 * 1.10 = 5500
    expect(result.dmg).toBe(5500);
  });

  it('a team generating more real Off-Tune (e.g. a second contributor) yields a higher real breaksPerRot and thus higher Rupture damage than solo', () => {
    // Aalto has no tuneBreak field, so he doesn't add a second exclusiveCandidate, but his own real
    // Off-Tune generation DOES feed the shared team total any tbMember's breaksPerRot is computed
    // from (see calcTuneBreakDmg's own reduce over tbMembers only — this test instead proves the
    // simpler, always-true case: Aemeath's own real generation alone already produces a non-zero,
    // real, reproducible rate, covered by the first test above). This test instead verifies the
    // total scales with a real second Rupture-capable contributor (Lynae).
    const blocksByOwner = { Aemeath: BLOCKS_BY_CHARACTER['Aemeath'], Lynae: BLOCKS_BY_CHARACTER['Lynae'] };
    const solo = calcTuneBreakDmg([{ name: 'Aemeath' }], 12, 1, 1, null, { Aemeath: BLOCKS_BY_CHARACTER['Aemeath'] });
    const withLynae = calcTuneBreakDmg([{ name: 'Aemeath' }, { name: 'Lynae' }], 12, 1, 1, null, blocksByOwner);
    expect(withLynae.dmg).toBeGreaterThan(solo.dmg);
  });
});
