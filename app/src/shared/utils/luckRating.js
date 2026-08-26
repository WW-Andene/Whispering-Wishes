// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/luckRating.js
// Extracted from the former utils/helpers.js grab-bag (2026-08-26 restructuring).
// [SECTION:LUCK]
// Luck rating: maps average pity to a percentile using a normal distribution.
// Theoretical parameters derived from WuWa's rate function (0.8% base, soft pity 65–79, hard pity 80):
//   Mean pity at 5★ = 53.5 pulls, Std dev = 22.7 pulls (single draw).
// For N 5★ pulls, the sample mean has std dev = 22.7/√N (central limit theorem).
// We use max(N, 3) to avoid extreme percentiles from tiny samples.
// Computed from app's soft pity model: SOFT_PITY_START=66, HARD_PITY=80
// (P2-20 audit fix: comment previously said SOFT_PITY_START=64 — drift from constants.js:73), BASE_RATE=0.8%
// ═══════════════════════════════════════════════════════════════════════════════

const LUCK_MEAN_PITY = 53.0;
const LUCK_STD_DEV_SINGLE = 22.4;

const calculateLuckRating = (avgPity, numFiveStars) => {
  if (!avgPity || avgPity === '—') return null;
  const avg = parseFloat(avgPity);
  if (isNaN(avg) || avg <= 0) return null;

  // Sample-size adjusted std dev: shrinks with more data points
  const n = Math.max(numFiveStars || 1, 3); // floor of 3 to prevent extreme swings
  const adjustedStd = LUCK_STD_DEV_SINGLE / Math.sqrt(n);

  // Inverted: lower avg pity = luckier = higher z-score/percentile
  const zScore = (LUCK_MEAN_PITY - avg) / adjustedStd;

  // Abramowitz & Stegun approximation of normal CDF (accurate to ±0.0005)
  const absZ = Math.abs(zScore);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989422804014327; // 1/√(2π)
  const p = d * Math.exp(-absZ * absZ / 2) * (t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))));
  const cdf = zScore >= 0 ? 1 - p : p;
  const percentile = Math.max(0, Math.min(100, Math.round(cdf * 100)));

  // WuWa lore hierarchy: Civilian < Drifter < Resonator < Sentinel < Arbiter
  // Color scale: white < green < blue < purple < gold
  if (percentile >= 90) return { rating: 'Arbiter', color: '#edaf18', tier: 'S', percentile };
  if (percentile >= 70) return { rating: 'Sentinel', color: '#a855f7', tier: 'A', percentile };
  if (percentile >= 40) return { rating: 'Resonator', color: '#60a5fa', tier: 'B', percentile };
  if (percentile >= 20) return { rating: 'Drifter', color: '#22c55e', tier: 'C', percentile };
  return { rating: 'Civilian', color: '#e8ecf2', tier: 'D', percentile };
};

export { calculateLuckRating };
