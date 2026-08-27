// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/conveneSimulator.js
// Display-only convene pull simulator (ConvenePullPills/ConvenePullSimModal).
// Rolls 1 or 10 pulls against a best-effort approximation of the real gacha
// curve and returns the items that "dropped" — it never reads or writes
// state.profile (no persisted pity/history mutation), so it's purely a
// preview of "what would happen if I pulled right now."
//
// Reuses the same base/soft/hard-pity constants as the calculator's exact
// engine (core/calcStats.js) for the 5★ curve — HARD_PITY/SOFT_PITY_START
// are shared across character/weapon/standard everywhere else in this app
// (StandardBannerSection.jsx, CalculatorTab.jsx's sliders), so this follows
// that same existing assumption rather than inventing a per-banner split.
//
// 50/50-loss pool (character banners only): routes to STANDARD_5STAR_
// CHARACTERS / CURRENT_BANNERS.standardWeapons — the fixed evergreen
// roster — NOT "any other released 5★". A past limited 5★ is only ever
// obtainable from its own specific rerun banner, never as a 50/50-loss
// result on a different character's banner (standard genshin-like
// convention, matches this app's own standardCharacters/standardWeapons
// data existing specifically for this).
//
// 4★ rate-up also carries a guarantee, mirroring the 5★ system — losing
// the 4★ "50/50" (i.e. the 4★ wasn't one of the banner's rate-up trio)
// guarantees the next 4★ hit is a rate-up one. This matches gachaRates.js's
// own AVG_4STAR_PULLS_PER_FEATURED=1.5 constant, which only makes sense
// under a 50%-with-guarantee system (a flat, memoryless 50% chance would
// average 2 hits per rate-up copy, not 1.5).
//
// 3★ resolution is the least-verified part of this simulator: WEAPON_DATA's
// rarity-3 entries are all documented as craft-only (Guardian/Voyager/
// Night/Originite series) or quest rewards (Beguiling Melody) — none are
// annotated anywhere in this codebase as actual convene drops. Picking a
// name from that pool for a 3★ pull could show an item that was never a
// real gacha result. Flagged in the audit that introduced this comment;
// pending a confirmed real drop list, 3★ results have no specific name.
// ═══════════════════════════════════════════════════════════════════════════════

import { ALL_4STAR_RESONATORS, STANDARD_5STAR_CHARACTERS } from '../data/characters.js';
import { WEAPON_DATA } from '../data/weapons.js';
import { CURRENT_BANNERS } from '../data/banners.js';

const BASE_5STAR_RATE = 0.008; // 0.8% — same as calcStats.js's BASE_5STAR_RATE
const SOFT_PITY_START = 66;
const HARD_PITY = 80;
const SOFT_PITY_STEPS = HARD_PITY - SOFT_PITY_START;
const HARD_PITY_4STAR = 10;
// Below its own pity, 4★ has no official flat rate published — 6% is the
// commonly cited community estimate (consistent with AVG_PULLS_PER_4STAR
// ≈ 7.69 in gachaRates.js). Best-effort, see file header.
const FLAT_4STAR_RATE = 0.06;
// 4★ rate-up "50/50" chance per hit before the guarantee kicks in — see
// file header (AVG_4STAR_PULLS_PER_FEATURED=1.5 implies exactly this).
const FOUR_STAR_RATEUP_CHANCE = 0.5;

const getPullRate5 = (pity) => {
  if (pity < SOFT_PITY_START) return BASE_5STAR_RATE;
  return Math.min(BASE_5STAR_RATE + ((pity - SOFT_PITY_START + 1) / SOFT_PITY_STEPS) * (1 - BASE_5STAR_RATE), 1);
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ALL_4STAR_WEAPONS = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 4);

/**
 * @param {object} opts
 * @param {number} opts.count - 1 or 10
 * @param {'character'|'weapon'|'standardChar'|'standardWeap'} opts.kind
 * @param {string[]} [opts.featuredNames] - the banner's featured 5★ name(s)
 * @param {string[]} [opts.featured4Stars] - the banner's rate-up 4★ trio
 * @param {number} [opts.startPity5] - player's live pity5 for this banner, as a starting point
 * @param {number} [opts.startPity4]
 * @param {boolean} [opts.startGuaranteed] - live 50/50-loss guarantee flag (character banner only)
 * @param {boolean} [opts.startGuaranteed4] - live 4★-rate-up-loss guarantee flag (character/weapon only)
 * @returns {{ results: Array<{name: string|null, rarity: 3|4|5, isFeatured: boolean, pity?: number, won50?: boolean|null}>, video: 'common'|'4star'|'5star' }}
 */
export function simulateConvenePulls({ count, kind, featuredNames = [], featured4Stars = [], startPity5 = 0, startPity4 = 0, startGuaranteed = false, startGuaranteed4 = false }) {
  const isWeapon = kind === 'weapon' || kind === 'standardWeap';
  const isStandard = kind === 'standardChar' || kind === 'standardWeap';

  // 50/50-loss pool — always the fixed standard roster, never "every other
  // released 5★" (see file header). Only reachable for character banners;
  // weapon banners have no loss branch (100% featured), standard has no
  // rate-up/loss concept at all.
  const standardPool5 = isWeapon ? CURRENT_BANNERS.standardWeapons.map(w => w.name) : [...STANDARD_5STAR_CHARACTERS];
  const pool4RateUp = isStandard ? [] : featured4Stars;
  const pool4Rest = (isWeapon ? ALL_4STAR_WEAPONS : ALL_4STAR_RESONATORS).filter(n => !featured4Stars.includes(n));

  let pity5 = startPity5, pity4 = startPity4;
  let guaranteed = isStandard ? false : startGuaranteed;
  let guaranteed4 = isStandard ? false : startGuaranteed4;
  const results = [];

  const rollFourStar = () => {
    if (pool4RateUp.length === 0) return { name: pick(pool4Rest), rarity: 4, isFeatured: false };
    const rateUp = guaranteed4 || Math.random() < FOUR_STAR_RATEUP_CHANCE;
    guaranteed4 = rateUp ? false : true;
    const name = rateUp ? pick(pool4RateUp) : pick(pool4Rest.length ? pool4Rest : pool4RateUp);
    return { name, rarity: 4, isFeatured: rateUp };
  };

  for (let i = 0; i < count; i++) {
    pity5++; pity4++;
    if (Math.random() < getPullRate5(pity5)) {
      // won50: true = won a real 50/50 roll, false = lost it (next 5★ is
      // guaranteed), null = no 50/50 concept here (weapon/standard banners,
      // or this hit itself was the guaranteed one from a prior loss).
      let name, isFeatured, won50;
      if (isStandard) {
        name = pick(standardPool5); isFeatured = false; won50 = null;
      } else if (isWeapon) {
        // Weapon banners have no 50/50 — every 5★ is the featured weapon.
        name = featuredNames[0] ?? pick(standardPool5); isFeatured = true; won50 = null;
      } else if (guaranteed) {
        name = featuredNames[0] ?? pick(standardPool5); isFeatured = true; won50 = null; guaranteed = false;
      } else if (Math.random() < 0.5) {
        name = featuredNames[0] ?? pick(standardPool5); isFeatured = true; won50 = true;
      } else {
        name = pick(standardPool5); isFeatured = false; won50 = false; guaranteed = true;
      }
      results.push({ name, rarity: 5, isFeatured, pity: pity5, won50 });
      pity5 = 0; pity4 = 0; // a 5★ also satisfies the 4★ pity window
    } else if (pity4 >= HARD_PITY_4STAR || Math.random() < FLAT_4STAR_RATE) {
      results.push(rollFourStar());
      pity4 = 0;
    } else {
      // See file header — no confirmed real convene drop list for 3★s yet.
      results.push({ name: null, rarity: 3, isFeatured: false });
    }
  }

  const bestRarity = results.reduce((m, r) => Math.max(m, r.rarity), 3);
  const video = bestRarity >= 5 ? '5star' : bestRarity === 4 ? '4star' : 'common';

  return { results, video };
}
