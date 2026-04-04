// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/utils/pityHistogram.js
// Shared pity histogram bucketing logic (used by Analytics, Profile, IdCard)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Bucket 5★ pulls into 10-pull ranges for histogram display.
 * @param {Array<{pity: number}>} fiveStars - Array of 5★ pull objects with pity values
 * @param {number} [hardPity=80] - Hard pity threshold
 * @returns {{ buckets: Record<string, number>, labels: string[] }}
 */
export const buildPityHistogram = (fiveStars, hardPity = 80) => {
  const buckets = {};
  const overflowLabel = `${hardPity + 1}+`;

  fiveStars.forEach(p => {
    if (p.pity > hardPity) {
      buckets[overflowLabel] = (buckets[overflowLabel] ?? 0) + 1;
    } else {
      const b = Math.floor((p.pity - 1) / 10) * 10 + 1;
      const label = `${b}-${b + 9}`;
      buckets[label] = (buckets[label] ?? 0) + 1;
    }
  });

  const labels = Array.from({ length: hardPity / 10 }, (_, i) => `${i * 10 + 1}-${(i + 1) * 10}`);
  if (buckets[overflowLabel]) labels.push(overflowLabel);
  labels.forEach(b => { if (!buckets[b]) buckets[b] = 0; });

  return { buckets, labels };
};
