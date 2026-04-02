// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/calcStats.js
// Gacha probability engine: DP (exact), Monte Carlo, hybrid approach + calcStats.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  HARD_PITY, SOFT_PITY_START,
  ASTRITE_PER_PULL,
  MAX_CALC_PULLS,
  HARD_PITY_4STAR, FEATURED_4STAR_RATE,
  AVG_PULLS_PER_4STAR, AVG_4STAR_PULLS_PER_FEATURED,
} from '../appcore-data.js';

// [SECTION:SIMULATION]
// === GACHA PROBABILITY ENGINE v2.0 ===
// Hybrid DP (exact) + Monte Carlo (verification/large N) approach
// Matches known WuWa rates: soft pity 65-79, hard pity 80, base 0.8%

const MAX_PITY = HARD_PITY; // P7-FIX: Use single source of truth (7E)
const GACHA_EPS = 1e-15;

// Soft pity rate function: 0.8% base, linear ramp from SOFT_PITY_START to 100% at HARD_PITY
// P15-FIX: MEDIUM-7 — pity=80 (MAX_PITY) is the absorbing state: the formula yields >1.0
// before clamping, but Math.min ensures it returns exactly 1.0. The DP table accesses
// getPullRate(80) via nextPity = Math.min(MAX_PITY, p+1), which is correct — pity 80 = guaranteed.
const BASE_5STAR_RATE = 0.008; // 0.8%
const SOFT_PITY_STEPS = MAX_PITY - SOFT_PITY_START; // 80 - 64 = 16 steps
const getPullRate = (pity) => {
  if (pity < SOFT_PITY_START) return BASE_5STAR_RATE;
  return Math.min(BASE_5STAR_RATE + ((pity - SOFT_PITY_START + 1) / SOFT_PITY_STEPS) * (1.0 - BASE_5STAR_RATE), 1.0);
};

// === DYNAMIC PROGRAMMING (EXACT) ===
// Computes exact probability distribution for getting K copies in N pulls
// isWeapon: true = weapon banner (100% featured), false = character banner (50/50)
const computeDistDP = (N, isWeapon, startPity = 0, startGuar = 0, maxCopies = 10) => {
  // Clamp startPity to valid range
  const clampedPity = Math.max(0, Math.min(MAX_PITY, startPity));

  // DP state: dp[pulls][pity][guar?][copies] = probability
  // For weapon: no guarantee dimension (every 5★ is featured)
  const dp = Array.from({length: N+1}, () =>
    Array.from({length: MAX_PITY+1}, () =>
      isWeapon ?
        Array(maxCopies+1).fill(0) :
        Array.from({length: 2}, () => Array(maxCopies+1).fill(0))
    )
  );

  // Initial state
  if (isWeapon) {
    dp[0][clampedPity][0] = 1.0;
  } else {
    dp[0][clampedPity][startGuar][0] = 1.0;
  }

  // Fill DP table
  for (let n = 0; n < N; n++) {
    for (let p = 0; p <= MAX_PITY; p++) {
      const states = isWeapon ? [null] : [0, 1];
      for (const g of states) {
        for (let k = 0; k <= maxCopies; k++) {
          const prob = isWeapon ? dp[n][p][k] : dp[n][p][g][k];
          if (prob < GACHA_EPS) continue;

          const rate = getPullRate(p);
          const nextPity = Math.min(MAX_PITY, p + 1);

          // Non-5★ outcome
          if (isWeapon) {
            dp[n+1][nextPity][k] += prob * (1 - rate);
          } else {
            dp[n+1][nextPity][g][k] += prob * (1 - rate);
          }

          // 5★ outcome
          const pFeatured = (isWeapon || g === 1) ? 1.0 : 0.5;
          const nextK = Math.min(k + 1, maxCopies); // Absorb overflow into maxCopies bucket
          if (isWeapon) {
            dp[n+1][0][nextK] += prob * rate; // Weapon always featured
          } else {
            dp[n+1][0][0][nextK] += prob * rate * pFeatured; // Win: copies++, guar=0
          }
          // Character loss (not featured): guar becomes 1, copies unchanged
          if (!isWeapon && g === 0) {
            dp[n+1][0][1][k] += prob * rate * 0.5;
          }
        }
      }
    }
  }

  // Extract final distribution
  const dist = Array(maxCopies+1).fill(0);
  for (let p = 0; p <= MAX_PITY; p++) {
    const states = isWeapon ? [null] : [0, 1];
    for (const g of states) {
      for (let k = 0; k <= maxCopies; k++) {
        dist[k] += isWeapon ? dp[N][p][k] : dp[N][p][g][k];
      }
    }
  }

  // Normalize
  const total = dist.reduce((a, b) => a + b, 0);
  return dist.map(x => total > 0 ? x / total : 0);
};

// === MONTE CARLO (FAST APPROXIMATION) ===
// For large N or when DP is too memory-intensive
const simulateOneRun = (isWeapon, N, startPity, startGuar) => {
  let pity = startPity, guar = startGuar, copies = 0;
  for (let i = 0; i < N; i++) {
    const rate = getPullRate(pity);
    if (Math.random() < rate) {
      const featured = (isWeapon || guar === 1) ? true : (Math.random() < 0.5);
      if (featured) copies++;
      guar = featured ? 0 : 1;
      pity = 0;
    } else {
      pity = Math.min(MAX_PITY, pity + 1);
    }
  }
  return copies;
};

const computeDistMC = (N, isWeapon, startPity = 0, startGuar = 0, maxCopies = 10, trials = 50000) => {
  const counts = Array(maxCopies + 1).fill(0);
  for (let t = 0; t < trials; t++) {
    const k = simulateOneRun(isWeapon, N, startPity, startGuar);
    counts[Math.min(k, maxCopies)]++;
  }
  return counts.map(c => c / trials);
};

// P11-FIX: Named constant for DP-to-MC threshold (Step 7 audit — LOW-3e)
// At N=500, DP table = (N+1) × (MAX_PITY+1) × 2 × (maxCopies+1) = 501 × 81 × 2 × 11 = ~891K Float64 entries ≈ 7.1MB
// Beyond this, memory cost grows linearly and MC becomes preferable.
const DP_MAX_PULLS = 500;

// === HYBRID: Auto-select best method ===
const computeGachaDist = (N, isWeapon, startPity = 0, startGuar = 0, maxCopies = 10) => {
  // P12-FIX: Safety cap — MC for N > 5000 with 100K trials = 500M+ iterations, would freeze browser (Step 14 — MEDIUM-10g)
  const safeN = Math.min(N, 5000);
  // Use DP for smaller N (more accurate), MC for larger N (faster, lower memory)
  if (safeN <= DP_MAX_PULLS) {
    return computeDistDP(safeN, isWeapon, startPity, startGuar, maxCopies);
  } else {
    return computeDistMC(safeN, isWeapon, startPity, startGuar, maxCopies, 100000);
  }
};

// === HELPER FUNCTIONS ===

// Get cumulative probability P(copies >= K)
const getCumulativeProb = (dist, k) => {
  return dist.slice(k).reduce((a, b) => a + b, 0);
};

// Compute expected value and standard deviation
const computeGachaStats = (dist) => {
  let e = 0, e2 = 0;
  for (let k = 0; k < dist.length; k++) {
    e += k * dist[k];
    e2 += k * k * dist[k];
  }
  // Guard: floating-point arithmetic can make e2 - e*e slightly negative
  return { expected: e, stddev: Math.sqrt(Math.max(0, e2 - e * e)) };
};

// Expected pulls to reach targetK copies (value iteration)
// Note: startGuar is only used for character banners (50/50 system).
// Weapon banners are always 100% featured — startGuar is accepted but ignored.
const expectedPullsToTarget = (isWeapon, targetK, startPity = 0, startGuar = 0) => {
  if (targetK <= 0) return 0;
  const clampedPity = Math.max(0, Math.min(MAX_PITY, startPity));

  // v[pity][guar][copies] = expected remaining pulls
  const v = Array.from({length: MAX_PITY + 1}, () =>
    isWeapon ?
      Array(targetK).fill(0) :
      Array.from({length: 2}, () => Array(targetK).fill(0))
  );

  // Solve backwards from copies = targetK-1 down to 0
  for (let c = targetK - 1; c >= 0; c--) {
    // FIX: g loop OUTSIDE p loop — v[*][1][c] must be fully computed before any v[*][0][c]
    // because v[p][0][c] depends on v[0][1][c] (the cost of losing 50/50 and restarting with guarantee)
    const gs = isWeapon ? [null] : [1, 0];
    for (const g of gs) {
      for (let p = MAX_PITY; p >= 0; p--) {
        const rate = getPullRate(p);
        const nextPity = Math.min(MAX_PITY, p + 1);
        const pFeatured = (isWeapon || g === 1) ? 1 : 0.5;

        let expected = 1; // This pull

        // Non-5★: continue at next pity
        if (isWeapon) {
          expected += (1 - rate) * v[nextPity][c];
        } else {
          expected += (1 - rate) * v[nextPity][g][c];
        }

        // 5★ featured: +1 copy
        const nextC = c + 1;
        if (nextC < targetK) {
          expected += rate * pFeatured * (isWeapon ? v[0][nextC] : v[0][0][nextC]);
        }
        // 5★ not featured (char only, g=0): same copies, guar=1
        if (!isWeapon && g === 0) {
          expected += rate * 0.5 * v[0][1][c];
        }

        if (isWeapon) {
          v[p][c] = expected;
        } else {
          v[p][g][c] = expected;
        }
      }
    }
  }

  return isWeapon ? v[clampedPity][0] : v[clampedPity][startGuar][0];
};

// Min pulls N such that P(copies >= targetK | N pulls) >= minProb%
const minPullsForProb = (isWeapon, targetK, minProb, startPity = 0, startGuar = 0) => {
  // Lower bound must be 1, not targetK*40, to handle high starting pity correctly
  let low = 1, high = Math.min(targetK * 200, 5000); // P12-FIX: Cap at 5000 to prevent extreme MC (Step 14 — MEDIUM-10e)
  let ans = high;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    // Use higher MC trials in binary search to reduce stochastic oscillation
    const dist = mid <= DP_MAX_PULLS
      ? computeDistDP(mid, isWeapon, startPity, startGuar, targetK)
      : computeDistMC(mid, isWeapon, startPity, startGuar, targetK, 200000);
    const pGeK = getCumulativeProb(dist, targetK) * 100;

    if (pGeK >= minProb) {
      ans = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  // P15-FIX: MEDIUM-8 — Widen MC verification window from ±2 to ±5 and increase trial count
  // to reduce stochastic noise in binary search convergence near exact thresholds.
  if (ans > DP_MAX_PULLS && ans > 1) {
    for (let check = ans - 5; check <= ans + 5; check++) {
      if (check < 1) continue;
      const vDist = computeDistMC(check, isWeapon, startPity, startGuar, targetK, 500000);
      if (getCumulativeProb(vDist, targetK) * 100 >= minProb) {
        ans = Math.min(ans, check);
        break;
      }
    }
  }
  return ans;
};

// [SECTION:CALCULATIONS]
const calcStats = (pulls, pity, guaranteed, isChar, copies, fourStarCopies = 0, isFeaturedBanner = true) => {
  // Defensive input validation — clamp to valid ranges
  const safePulls = Math.max(0, Math.min(MAX_CALC_PULLS, Math.floor(pulls) || 0)); // P12-FIX: Cap at MAX_CALC_PULLS (Step 14 — HIGH-10e)
  const safePity = Math.max(0, Math.min(MAX_PITY, Math.floor(pity) || 0));
  const safeCopies = Math.max(0, Math.floor(copies) || 0);
  const safe4StarCopies = Math.max(0, Math.floor(fourStarCopies) || 0);
  const isWeapon = !isChar;
  const startGuar = guaranteed ? 1 : 0;

  // Use exact DP formula for probability distribution
  const dist = computeGachaDist(safePulls, isWeapon, safePity, startGuar, Math.max(safeCopies, 7));

  // P(X >= k) cumulative probabilities
  const pGe = (k) => getCumulativeProb(dist, k) * 100;

  // Expected value and standard deviation
  const stats = computeGachaStats(dist);

  // Expected pulls to reach target copies
  const expectedToTarget = expectedPullsToTarget(isWeapon, safeCopies, safePity, startGuar);

  // Worst case: hard pity every time, always losing 50/50 (subtract current pity progress)
  // Guarantee only applies to the FIRST copy — subsequent copies can still lose 50/50
  // Weapon banners are 100% featured — no 50/50, so worst case is simply HARD_PITY * copies
  const worstCase = Math.max(0, isChar
    ? (HARD_PITY * 2 * safeCopies - (guaranteed ? HARD_PITY : 0) - safePity)
    : (HARD_PITY * safeCopies - safePity));
  const successRate = pGe(safeCopies);
  const missingPulls5Star = Math.max(0, Math.ceil(expectedToTarget) - safePulls);

  // 4-star calculations
  // WuWa 4★ mechanics: 6% base rate + hard pity at 10
  // AVG_PULLS_PER_4STAR imported from constants (7.69 — exact expected value)
  const fourStarCount = Math.round(safePulls / AVG_PULLS_PER_4STAR);
  // Featured banners: 50/50 system with guarantee (lose → next guaranteed featured)
  // Average 1.5 four-star pulls per featured 4-star copy (50% win + 50% lose then guaranteed)
  // 3 featured 4-stars per banner share the featured pool equally
  // AVG_4STAR_PULLS_PER_FEATURED imported from constants (1.5 — 50/50 + guarantee)
  const featuredFourStarCount = isFeaturedBanner ? Math.round(fourStarCount / AVG_4STAR_PULLS_PER_FEATURED) : fourStarCount;
  const pity4 = safePulls % HARD_PITY_4STAR;

  // 4-star target: calculate how many pulls are needed to reach the target
  // The user's 4-star target = total featured 4-star copies they want (any of the 3 featured)
  let missingPulls4Star = 0;
  if (safe4StarCopies > 0) {
    // Featured banners: ~7.69 pulls per 4-star × 1.5 four-star pulls per featured = ~11.5 pulls per featured 4-star
    // Standard banners: ~7.69 pulls per 4-star (all count, no featured distinction)
    const pullsPerTarget4Star = isFeaturedBanner
      ? AVG_PULLS_PER_4STAR * AVG_4STAR_PULLS_PER_FEATURED  // ~11.5 pulls per featured 4★
      : AVG_PULLS_PER_4STAR;                                  // ~7.69 pulls per 4★
    const expectedPullsFor4Star = Math.ceil(safe4StarCopies * pullsPerTarget4Star);
    missingPulls4Star = Math.max(0, expectedPullsFor4Star - safePulls);
  }

  // Overall missing pulls: the larger of 5-star and 4-star requirements
  const missingPulls = Math.max(missingPulls5Star, missingPulls4Star);

  return {
    successRate: successRate > 0 && successRate < 0.1 ? '<0.1' : successRate.toFixed(1),
    p1: pGe(1).toFixed(1),
    p2: pGe(2).toFixed(1),
    p3: pGe(3).toFixed(1),
    p4: pGe(4).toFixed(1),
    p5: pGe(5).toFixed(1),
    p6: pGe(6).toFixed(1),
    p7: pGe(7).toFixed(1),
    missingPulls,
    missingPulls5Star,
    missingPulls4Star,
    missingAstrite: missingPulls * ASTRITE_PER_PULL,
    fourStarCount,
    featuredFourStarCount,
    fourStarTarget: safe4StarCopies,
    pity4,
    // New stats from DP formula
    expectedCopies: stats.expected.toFixed(2),
    stddev: stats.stddev.toFixed(2),
    expectedPullsToTarget: Math.ceil(expectedToTarget),
    worstCase,
  };
};

export { calcStats };
