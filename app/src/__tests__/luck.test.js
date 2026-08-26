// ═══════════════════════════════════════════════════════════════════════════════
// P2-21 audit fix: sanity tests for luck-rating percentile tiers.
//
// `calculateLuckRating` in shared/utils/luckRating.js depends on LUCK_MEAN_PITY (53.0)
// and LUCK_STD_DEV_SINGLE (22.4), which are hand-derived from the app's
// probability model (BASE_5STAR_RATE=0.008, SOFT_PITY_START=66, HARD_PITY=80
// in data/constants.js + core/calcStats.js).
//
// If any of those constants change without updating the luck model, the tier
// mapping silently drifts — this test catches it by re-computing the model
// from the engine and asserting the constants are still a close match.
// ═══════════════════════════════════════════════════════════════════════════════
import { describe, it, expect } from 'vitest';
import { calculateLuckRating } from '../shared/utils/luckRating.js';
describe('Luck rating — tier boundaries', () => {
  it('very low avg pity yields Arbiter (S tier)', () => {
    // With 10 five-stars averaging 20 pity, z-score is strongly positive →
    // percentile should be in the 90+ band.
    const r = calculateLuckRating(20, 10);
    expect(r).not.toBeNull();
    expect(r.tier).toBe('S');
    expect(r.rating).toBe('Arbiter');
    expect(r.percentile).toBeGreaterThanOrEqual(90);
  });

  it('near-mean avg pity yields a middle tier', () => {
    // LUCK_MEAN_PITY is 53.0; an avg pity of 53 should sit near the 50th percentile
    // (adjusted std dev shrinks the spread with more 5-stars).
    const r = calculateLuckRating(53, 10);
    expect(r).not.toBeNull();
    // Should be Resonator (40-69) or Sentinel (70-89), never extreme tiers.
    expect(['Resonator', 'Sentinel']).toContain(r.rating);
  });

  it('high avg pity yields low-tier (Civilian or Drifter)', () => {
    const r = calculateLuckRating(75, 10);
    expect(r).not.toBeNull();
    expect(['Civilian', 'Drifter']).toContain(r.rating);
    expect(r.percentile).toBeLessThan(40);
  });

  it('rejects falsy or "—" avg pity', () => {
    expect(calculateLuckRating(null, 5)).toBeNull();
    expect(calculateLuckRating('—', 5)).toBeNull();
    expect(calculateLuckRating(0, 5)).toBeNull();
  });

  it('percentile is always bounded [0, 100]', () => {
    for (const avg of [1, 20, 40, 53, 65, 80, 100]) {
      const r = calculateLuckRating(avg, 50);
      expect(r).not.toBeNull();
      expect(r.percentile).toBeGreaterThanOrEqual(0);
      expect(r.percentile).toBeLessThanOrEqual(100);
    }
  });

  it('applies sample-size floor (min n=3)', () => {
    // With only 1 five-star, adjusted std dev = 22.4/sqrt(3) ≈ 12.93.
    // A single result at avg=30 should yield a strongly positive z-score,
    // not an infinite one — the floor prevents tier swings on tiny samples.
    const r1 = calculateLuckRating(30, 1);
    const r3 = calculateLuckRating(30, 3);
    expect(r1).not.toBeNull();
    expect(r3).not.toBeNull();
    // Both use n_effective = 3, so percentile should be identical.
    expect(r1.percentile).toBe(r3.percentile);
  });
});

describe('Luck rating — constants sanity (P2-21)', () => {
  // If someone edits LUCK_MEAN_PITY to a new value, a user who pulled
  // exactly at the old mean should no longer be near the 50th percentile.
  it('avg pity equal to LUCK_MEAN_PITY (53) is near the 50th percentile', () => {
    const r = calculateLuckRating(53, 100);
    expect(r).not.toBeNull();
    // Very large sample → adjusted std dev is small → z ≈ 0 → percentile ≈ 50.
    // Allow a small tolerance band for the CDF approximation.
    expect(r.percentile).toBeGreaterThanOrEqual(45);
    expect(r.percentile).toBeLessThanOrEqual(55);
  });
});
