// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/historyUtils.js
// Shared history-merging utilities. Replaces 6 duplicated blocks across 4 files.
// Single source of truth for how banner histories are combined.
// ═══════════════════════════════════════════════════════════════════════════════

import { ALL_CHARACTERS } from '../data/characters.js';

/**
 * Merge all banner histories from a profile into character and weapon histories.
 * Includes beginner history split by character/weapon.
 * @param {Object} profile - state.profile object
 * @returns {{ charHistory: Array, weapHistory: Array, allHistory: Array }}
 */
export function getMergedHistories(profile) {
  const featuredHist = profile.featured?.history || [];
  const weaponHist = profile.weapon?.history || [];
  const stdCharHist = profile.standardChar?.history || [];
  const stdWeapHist = profile.standardWeap?.history || [];
  const beginnerHist = profile.beginner?.history || [];

  const charHistory = [
    ...featuredHist,
    ...stdCharHist,
    ...beginnerHist.filter(p => p.name && ALL_CHARACTERS.has(p.name)),
  ];

  const weapHistory = [
    ...weaponHist,
    ...stdWeapHist,
    ...beginnerHist.filter(p => p.name && !ALL_CHARACTERS.has(p.name)),
  ];

  const allHistory = [...charHistory, ...weapHistory];

  return { charHistory, weapHistory, allHistory };
}
