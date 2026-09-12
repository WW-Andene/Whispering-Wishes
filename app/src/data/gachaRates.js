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
// Average total income (Astrite-equivalent) a "usual" game update grants an F2P/light-spender
// player, for the Income Projections tab's 2nd-row/"By Banner End" average-update-income
// addition. Direct user-directed research (2026-09-13): sampled 6 recent patches (2.8, 3.1, 3.2,
// 3.4, 3.5, 3.6) from consistent-methodology community trackers (lootbar.com, topuplive.com,
// gamemarket.gg), converting Radiant Tide/Forging Tide to Astrite-equivalent at this file's own
// ASTRITE_PER_PULL rate (1 tide = 1 pull = 160 Astrite) and averaging across F2P/subscription
// tiers where a source reported more than one. Raw per-patch totals ranged 11,845-18,390 (avg
// ~15,050); 12,800 was chosen as the standard figure per direct user instruction, to account for
// the not-full-completion vs. full-completion variance across sources (a conservative middle
// figure rather than the raw sampled average). AVG_UPDATE_DAYS is the same 6-patch sample's
// average real-world patch duration (35/42/42/32/42/41 days).
const AVG_UPDATE_ASTRITE = 12800;
const AVG_UPDATE_DAYS = 39;
// Phase-specific daily rates for "By Banner End"/Goal Progress's average-update-income addition
// (direct user follow-up, 2026-09-13: the flat AVG_UPDATE_ASTRITE/AVG_UPDATE_DAYS rate above
// overstates remaining income when only Phase 2 of a patch is left — real WuWa patches are
// front-loaded, with Phase 1 carrying new-area exploration/story rewards Phase 2 doesn't have).
// Sourced from 4 patches (2.5, 2.6, 3.1, 3.2) where a real Phase 1/Phase 2 Astrite split was
// found, using each phase's REAL day count from this file's own BANNER_HISTORY (banners.js) —
// not an assumed 50/50 split:
//   2.5: P1 6,500/21d=309.5/day, P2 2,280/13d=175.4/day
//   2.6: P1 9,950/20d=497.5/day, P2 4,180/21d=199.0/day
//   3.1: P1 14,560/21d=693.3/day, P2 4,960/20d=248.0/day
//   3.2: P1 7,040/21d=335.2/day, P2 5,440/20d=272.0/day
// Raw averages: P1 458.9/day, P2 223.6/day (P2 is consistently ~half of P1, not just shorter).
// Both scaled down by the same ~0.945 factor used to land AVG_UPDATE_ASTRITE/AVG_UPDATE_DAYS at
// the conservative 328.2/day baseline instead of that baseline's own raw sampled average, so the
// phase-specific rates stay consistent with the already-agreed conservative calibration.
const AVG_UPDATE_P1_DAILY_ASTRITE = 434;
const AVG_UPDATE_P2_DAILY_ASTRITE = 211;
// Fixes a real double-counting bug (direct user catch, 2026-09-13): every AVG_UPDATE_* figure
// above is a GROSS whole-patch F2P total that already includes daily commissions/dailies as one
// of its own line items — the 3.6 sourcing breakdown (gamemarket.gg) explicitly lists "Daily
// Activity Quests: 2,400" (over that patch's ~41 days ≈ 58.5/day) as part of the total this file's
// AVG_UPDATE_ASTRITE was calibrated from. PlannerTab.jsx's "including average update income"
// projections add these rates ON TOP of the player's own tracked `dailyAstrite` (which itself
// represents "commissions + dailies", per its own UI label) — stacking both double-counts the
// commissions portion twice. The fix is to subtract this commission-only rate from each AVG_UPDATE
// rate before adding it to the player's own tracked income, not to remove the player's own income
// (that portion is real and not part of the sourced totals) or to drop the whole AVG_UPDATE figure
// (the non-commission portion — events/exploration/tower/etc. — is genuinely additional). Only one
// patch (3.6) had an explicit "Daily Activity Quests" line item to source this from; applied
// uniformly across the flat/P1/P2 rates for lack of a larger sample.
const AVG_UPDATE_DAILY_COMMISSION_ASTRITE = 58.5;
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
  AVG_UPDATE_ASTRITE,
  AVG_UPDATE_DAYS,
  AVG_UPDATE_P1_DAILY_ASTRITE,
  AVG_UPDATE_P2_DAILY_ASTRITE,
  AVG_UPDATE_DAILY_COMMISSION_ASTRITE,
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
