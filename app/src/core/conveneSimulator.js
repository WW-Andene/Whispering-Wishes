// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/conveneSimulator.js
// Display-only convene pull simulator (ConvenePullPills/ConvenePullSimModal).
// Rolls 1 or 10 pulls against a best-effort approximation of the real gacha
// curve and returns the items that "dropped" — it never reads or writes
// state.profile (no persisted pity/history mutation), so it's purely a
// preview of "what would happen if I pulled right now."
//
// Reuses the same base/soft/hard-pity constants as the calculator's exact
// engine (core/calcStats.js) for the 5★ curve. 4★ resolution (which pool,
// how the 3 rate-up 4★s are weighted vs the rest) is intentionally
// simplified — flagged per-function below — pending real refinement once
// the simulator is live and player feedback comes in (see conversation
// that introduced this file).
// ═══════════════════════════════════════════════════════════════════════════════

import { ALL_5STAR_RESONATORS, ALL_4STAR_RESONATORS, STANDARD_5STAR_CHARACTERS } from '../data/characters.js';
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

const getPullRate5 = (pity) => {
  if (pity < SOFT_PITY_START) return BASE_5STAR_RATE;
  return Math.min(BASE_5STAR_RATE + ((pity - SOFT_PITY_START + 1) / SOFT_PITY_STEPS) * (1 - BASE_5STAR_RATE), 1);
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ALL_5STAR_WEAPONS = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 5);
const ALL_4STAR_WEAPONS = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 4);
// 3★ pulls are always weapons in WuWa (no 3★ resonators exist), regardless
// of whether the banner itself is a character or weapon convene.
const ALL_3STAR_WEAPONS = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 3);

/**
 * @param {object} opts
 * @param {number} opts.count - 1 or 10
 * @param {'character'|'weapon'|'standardChar'|'standardWeap'} opts.kind
 * @param {string[]} [opts.featuredNames] - the banner's featured 5★ name(s)
 * @param {string[]} [opts.featured4Stars] - the banner's rate-up 4★ trio
 * @param {number} [opts.startPity5] - player's live pity5 for this banner, as a starting point
 * @param {number} [opts.startPity4]
 * @param {boolean} [opts.startGuaranteed] - live 50/50-loss guarantee flag (character banner only)
 * @returns {{ results: Array<{name: string|null, rarity: 3|4|5, isFeatured: boolean, pity: number, won50: boolean|null}>, video: 'common'|'4star'|'5star' }}
 */
export function simulateConvenePulls({ count, kind, featuredNames = [], featured4Stars = [], startPity5 = 0, startPity4 = 0, startGuaranteed = false }) {
  const isWeapon = kind === 'weapon' || kind === 'standardWeap';
  const isStandard = kind === 'standardChar' || kind === 'standardWeap';

  const pool5 = isWeapon
    ? (isStandard ? CURRENT_BANNERS.standardWeapons.map(w => w.name) : ALL_5STAR_WEAPONS.filter(n => !featuredNames.includes(n)))
    : (isStandard ? [...STANDARD_5STAR_CHARACTERS] : ALL_5STAR_RESONATORS.filter(n => !featuredNames.includes(n)));
  const pool4RateUp = isStandard ? [] : featured4Stars;
  const pool4Rest = (isWeapon ? ALL_4STAR_WEAPONS : ALL_4STAR_RESONATORS).filter(n => !featured4Stars.includes(n));

  const rollFourStar = () => {
    const rateUp = pool4RateUp.length > 0 && Math.random() < 0.5;
    const name = rateUp ? pick(pool4RateUp) : pick(pool4Rest.length ? pool4Rest : pool4RateUp);
    return { name, rarity: 4, isFeatured: rateUp };
  };

  let pity5 = startPity5, pity4 = startPity4, guaranteed = isStandard ? false : startGuaranteed;
  const results = [];

  for (let i = 0; i < count; i++) {
    pity5++; pity4++;
    if (Math.random() < getPullRate5(pity5)) {
      // won50: true = won a real 50/50 roll, false = lost it (next 5★ is
      // guaranteed), null = no 50/50 concept here (weapon/standard banners,
      // or this hit itself was the guaranteed one from a prior loss).
      let name, isFeatured, won50;
      if (isStandard) {
        name = pick(pool5); isFeatured = false; won50 = null;
      } else if (isWeapon) {
        // Weapon banners have no 50/50 — every 5★ is the featured weapon.
        name = featuredNames[0] ?? pick(pool5); isFeatured = true; won50 = null;
      } else if (guaranteed) {
        name = featuredNames[0] ?? pick(pool5); isFeatured = true; won50 = null; guaranteed = false;
      } else if (Math.random() < 0.5) {
        name = featuredNames[0] ?? pick(pool5); isFeatured = true; won50 = true;
      } else {
        name = pick(pool5); isFeatured = false; won50 = false; guaranteed = true;
      }
      results.push({ name, rarity: 5, isFeatured, pity: pity5, won50 });
      pity5 = 0; pity4 = 0; // a 5★ also satisfies the 4★ pity window
    } else if (pity4 >= HARD_PITY_4STAR || Math.random() < FLAT_4STAR_RATE) {
      results.push(rollFourStar());
      pity4 = 0;
    } else {
      results.push({ name: pick(ALL_3STAR_WEAPONS), rarity: 3, isFeatured: false });
    }
  }

  const bestRarity = results.reduce((m, r) => Math.max(m, r.rarity), 3);
  const video = bestRarity >= 5 ? '5star' : bestRarity === 4 ? '4star' : 'common';

  return { results, video };
}
