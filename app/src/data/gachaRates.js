// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/gachaRates.js (split from constants.js)
// WuWa gacha rates/pity, subscription+top-up prices, and calculator input caps.
// ═══════════════════════════════════════════════════════════════════════════════

// WuWa gacha rates: 0.8% base, soft pity at 66, hard pity at 80
// Verified: community data mining (Steam analysis, pull trackers) confirms soft pity starts at pull 66
// Pulls 1-65: flat 0.8%. Pulls 66-79: linear ramp ~6.6%/pull. Pull 80: guaranteed.
const HARD_PITY = 80, SOFT_PITY_START = 66;
const LUNITE_DAILY_ASTRITE = 90; // P7-FIX: Extract magic number (7E)
const ASTRITE_PER_PULL = 160;
const BEGINNER_ASTRITE_PER_PULL = 128; // P14-FIX: NIT-2 — Extract magic number (beginner banner = 80% of standard cost)

// Subscription and top-up prices (USD) - Updated January 2026
const SUBSCRIPTIONS = {
  lunite: { name: 'Lunite Subscription', price: 4.99, astrite: 2700, lunite: 300, daily: 90, duration: 30, desc: '90 Astrite/day × 30 days + 300 Lunite' },
  weekly: { name: 'Weekly Subscription', price: 9.99, astrite: 1600, lunite: 680, duration: 7, desc: '1600 Astrite + 680 Lunite over 7 days' },
  bpInsider: { name: 'Pioneer Podcast - Insider', price: 9.99, astrite: 680, radiant: 5, lustrous: 2, desc: '680 Astrite + 5 Radiant Tides + 2 Lustrous Tides' },
  bpConnoisseur: { name: 'Pioneer Podcast - Connoisseur', price: 19.99, astrite: 680, radiant: 5, lustrous: 5, desc: '680 Astrite + 5 Radiant Tides + 5 Lustrous Tides' },
  directTop60: { name: 'Direct Top-Up (60)', price: 0.99, lunite: 60, desc: '60 Lunite' },
  directTop300: { name: 'Direct Top-Up (300)', price: 4.99, lunite: 300, desc: '300 Lunite' },
  directTop980: { name: 'Direct Top-Up (980)', price: 14.99, lunite: 980, desc: '980 Lunite' },
  directTop1980: { name: 'Direct Top-Up (1980)', price: 29.99, lunite: 1980, desc: '1980 Lunite' },
  directTop3280: { name: 'Direct Top-Up (3280)', price: 49.99, lunite: 3280, desc: '3280 Lunite' },
  directTop6480: { name: 'Direct Top-Up (6480)', price: 99.99, lunite: 6480, desc: '6480 Lunite' },
};

// P12-FIX: Input safety caps to prevent browser freeze from extreme values (Step 14 audit — HIGH-10e)
// 9,999,999 Astrite ≈ 62,499 pulls — well beyond any realistic scenario
const MAX_ASTRITE = 9999999;
// P2-09 audit fix: per-resource defensive ceilings. WuWa has no published
// cap on Radiant/Lustrous Tides, but the calculator/planner cannot handle
// arbitrary integer inputs. These ceilings are input-validation guards, not
// game-mechanic limits. Aliased to MAX_ASTRITE until a per-resource semantic
// distinction matters; kept as separate constants so future tuning is easy.
const MAX_LUNITE = MAX_ASTRITE;
const MAX_RADIANT = MAX_ASTRITE;
const MAX_LUSTROUS = MAX_ASTRITE;
// 2,000 pulls is the max the calculator will compute — prevents MC from iterating billions of times
// (2000 pulls ≈ 320,000 Astrite, enough for ~25 guaranteed 5★ — absurdly generous ceiling)
const MAX_CALC_PULLS = 2000;

// 4-star pity constants
const HARD_PITY_4STAR = 10; // Guaranteed 4★ every 10 pulls
const FEATURED_4STAR_RATE = 0.5; // 50% chance for featured 4-star
// Exact expected value: Σ(k=1..9) k×0.06×0.94^(k-1) + 10×0.94^9 ≈ 7.69 pulls per 4-star
const AVG_PULLS_PER_4STAR = 7.69;
// 50/50 + guarantee system: average 1.5 four-star pulls per featured copy
const AVG_4STAR_PULLS_PER_FEATURED = 1.5;
const LEADERBOARD_DISPLAY_LIMIT = 20;

export {
  HARD_PITY,
  SOFT_PITY_START,
  LUNITE_DAILY_ASTRITE,
  ASTRITE_PER_PULL,
  BEGINNER_ASTRITE_PER_PULL,
  SUBSCRIPTIONS,
  MAX_ASTRITE,
  MAX_LUNITE,
  MAX_RADIANT,
  MAX_LUSTROUS,
  MAX_CALC_PULLS,
  HARD_PITY_4STAR,
  FEATURED_4STAR_RATE,
  AVG_PULLS_PER_4STAR,
  AVG_4STAR_PULLS_PER_FEATURED,
  LEADERBOARD_DISPLAY_LIMIT,
};
