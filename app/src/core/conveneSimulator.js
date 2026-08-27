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
// guarantees the next 4★ hit is a rate-up one. Confirmed exact wording
// (user-supplied, from a per-banner drop-rate reference page): "There is a
// 50% chance to get one of the rate-up 4-star character or weapon for
// every 10 convenes. Losing the 50% to an off-rate character or weapon
// will guarantee the rate-up character on your next 4-star pull!"
//
// 4★ off-rate pool is CHARACTERS AND WEAPONS COMBINED, on every banner
// kind — confirmed by the same reference page: Qingxiao's Character
// Convene (a resonator banner) lists both an off-rate *character* pool
// (9 names — exactly ALL_4STAR_RESONATORS minus that banner's 3 rate-up)
// and a full 21-entry 4★ *weapon* drop list, meaning a character banner
// can drop 4★ weapons and (by symmetry) a weapon banner can drop 4★
// characters. Previously this only drew from the matching-type pool.
//
// 3★ pool — REVISED after web verification (a prior pass here restricted
// this to just Voyager/Night/Originite, based on one banner's listed
// drops; that undercounted). The Guardian series is also convene-obtainable
// (multiple independent sources confirm it drops from convenes, not just
// craftable) so it's included. Beguiling Melody stays excluded — every
// source describing it agrees it's a one-time quest reward (a side quest
// in Chapter 1 Act 7) with no source ever mentioning a convene drop.
// Still a best-effort conclusion, not a primary-source guarantee — flagged
// per the user's own caution that none of this is proven beyond doubt.
// Rate confirmed: 5★ 0.8%, 4★ 6.0% flat, 3★ takes the 93.2% remainder —
// exactly BASE_5STAR_RATE/FLAT_4STAR_RATE below.
//
// Standard Weapon Convene ("Winter Brume") has its own mechanic, distinct
// from every other banner here: the player picks a Target Weapon ahead of
// time, and the very next 5★ pulled is 100% guaranteed to be it — not a
// random pick from the pool, and not a 50/50 (source: official per-banner
// rules page). featuredNames[0] carries that pick when kind==='standardWeap'
// (see StandardBannerSection.jsx's target-weapon selector); falls back to
// a random pick from the pool if no target has been chosen. Standard
// Resonator Convene ("Tidal Chorus") has no such selection — always random.
// ═══════════════════════════════════════════════════════════════════════════════

import { ALL_4STAR_RESONATORS, STANDARD_5STAR_CHARACTERS } from '../data/characters.js';
import { WEAPON_DATA } from '../data/weapons.js';
import { CURRENT_BANNERS } from '../data/banners.js';

const BASE_5STAR_RATE = 0.008; // 0.8% — same as calcStats.js's BASE_5STAR_RATE
const SOFT_PITY_START = 66;
const HARD_PITY = 80;
const SOFT_PITY_STEPS = HARD_PITY - SOFT_PITY_START;
const HARD_PITY_4STAR = 10;
const FLAT_4STAR_RATE = 0.06; // 6.0% flat, confirmed — see file header
// 4★ rate-up "50/50" chance per hit before the guarantee kicks in — see
// file header for the confirmed exact mechanic wording.
const FOUR_STAR_RATEUP_CHANCE = 0.5;

const getPullRate5 = (pity) => {
  if (pity < SOFT_PITY_START) return BASE_5STAR_RATE;
  return Math.min(BASE_5STAR_RATE + ((pity - SOFT_PITY_START + 1) / SOFT_PITY_STEPS) * (1 - BASE_5STAR_RATE), 1);
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ALL_4STAR_WEAPONS = Object.keys(WEAPON_DATA).filter(n => WEAPON_DATA[n].rarity === 4);
// Best-effort convene-drop 3★ weapons (see file header) — only Beguiling
// Melody (quest-exclusive) is excluded; the Guardian series is included
// alongside Voyager/Night/Originite.
const CONVENE_3STAR_WEAPONS = Object.keys(WEAPON_DATA).filter(n =>
  WEAPON_DATA[n].rarity === 3 && n !== 'Beguiling Melody'
);

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
 * @returns {{ results: Array<{name: string|null, rarity: 3|4|5, type: 'character'|'weapon', isFeatured: boolean, pity?: number, won50?: boolean|null}>, video: 'common'|'4star'|'5star' }}
 */
export function simulateConvenePulls({ count, kind, featuredNames = [], featured4Stars = [], startPity5 = 0, startPity4 = 0, startGuaranteed = false, startGuaranteed4 = false }) {
  const isWeapon = kind === 'weapon' || kind === 'standardWeap';
  const isStandard = kind === 'standardChar' || kind === 'standardWeap';
  const featuredType = isWeapon ? 'weapon' : 'character';

  // 50/50-loss pool — always the fixed standard roster, never "every other
  // released 5★" (see file header). Only reachable for character banners;
  // weapon banners have no loss branch (100% featured), standard has no
  // rate-up/loss concept at all.
  const standardPool5 = isWeapon ? CURRENT_BANNERS.standardWeapons.map(w => w.name) : [...STANDARD_5STAR_CHARACTERS];
  const pool4RateUp = isStandard ? [] : featured4Stars;
  // Off-rate 4★ pool is characters AND weapons combined, on every banner
  // kind — see file header (confirmed via Qingxiao's, a character banner,
  // own 4★ weapon drop list). Tagged with type so a cross-type result
  // (e.g. a weapon on a character banner) is still labeled correctly.
  const pool4Rest = [
    ...ALL_4STAR_RESONATORS.map(name => ({ name, type: 'character' })),
    ...ALL_4STAR_WEAPONS.map(name => ({ name, type: 'weapon' })),
  ].filter(x => !featured4Stars.includes(x.name));

  let pity5 = startPity5, pity4 = startPity4;
  let guaranteed = isStandard ? false : startGuaranteed;
  let guaranteed4 = isStandard ? false : startGuaranteed4;
  const results = [];

  const rollFourStar = () => {
    if (pool4RateUp.length === 0) {
      const off = pick(pool4Rest);
      return { name: off.name, rarity: 4, type: off.type, isFeatured: false };
    }
    const rateUp = guaranteed4 || Math.random() < FOUR_STAR_RATEUP_CHANCE;
    guaranteed4 = rateUp ? false : true;
    if (rateUp) return { name: pick(pool4RateUp), rarity: 4, type: featuredType, isFeatured: true };
    const off = pool4Rest.length ? pick(pool4Rest) : { name: pick(pool4RateUp), type: featuredType };
    return { name: off.name, rarity: 4, type: off.type, isFeatured: false };
  };

  for (let i = 0; i < count; i++) {
    pity5++; pity4++;
    if (Math.random() < getPullRate5(pity5)) {
      // won50: true = won a real 50/50 roll, false = lost it (next 5★ is
      // guaranteed), null = no 50/50 concept here (weapon/standard banners,
      // or this hit itself was the guaranteed one from a prior loss).
      let name, isFeatured, won50;
      if (kind === 'standardWeap') {
        // Winter Brume's "Target Weapon" system: pick one of the 11
        // standard weapons ahead of time and the next 5★ is 100%
        // guaranteed to be it (not a random pick from the pool) — no
        // "50/50" involved at all, unlike the featured weapon banner's
        // rate-up mechanic. Falls back to a random pick only if the
        // player hasn't chosen a target yet.
        name = featuredNames[0] ?? pick(standardPool5); isFeatured = false; won50 = null;
      } else if (isStandard) {
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
      // 5★ pools never cross type (confirmed: "no 5-star weapons on
      // Qingxiao's [character] banner") — always this banner's own type.
      results.push({ name, rarity: 5, type: featuredType, isFeatured, pity: pity5, won50 });
      pity5 = 0; pity4 = 0; // a 5★ also satisfies the 4★ pity window
    } else if (pity4 >= HARD_PITY_4STAR || Math.random() < FLAT_4STAR_RATE) {
      results.push(rollFourStar());
      pity4 = 0;
    } else {
      results.push({ name: pick(CONVENE_3STAR_WEAPONS), rarity: 3, type: 'weapon', isFeatured: false });
    }
  }

  const bestRarity = results.reduce((m, r) => Math.max(m, r.rarity), 3);
  const video = bestRarity >= 5 ? '5star' : bestRarity === 4 ? '4star' : 'common';

  return { results, video };
}
