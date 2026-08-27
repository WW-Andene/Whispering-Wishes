// ═══════════════════════════════════════════════════════════════════════════════
// useConveneSimStats — Aggregated stats for the convene pull simulator
// (ConvenePullSimModal), persisted per banner kind in localStorage. Purely
// a simulator-side tally — never touches state.profile's real pity/history.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react';
import { storageAvailable } from '../core/storage.js';
import { CONVENE_SIM_STATS_KEY } from '../shared/constants/appConstants.js';

const emptyStats = () => ({
  totalPulls: 0,
  x1Pulls: 0,
  x10Pulls: 0,
  weaponsByRarity: { 3: 0, 4: 0, 5: 0 },
  charactersByRarity: { 4: 0, 5: 0 },
  won50: 0,
  lost50: 0,
  fiveStarCount: 0,
  fiveStarPitySum: 0,
});

function loadAll() {
  if (!storageAvailable) return {};
  try {
    const raw = localStorage.getItem(CONVENE_SIM_STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveAll(all) {
  if (!storageAvailable) return;
  try { localStorage.setItem(CONVENE_SIM_STATS_KEY, JSON.stringify(all)); } catch {}
}

export function useConveneSimStats(kind) {
  const [stats, setStats] = useState(() => loadAll()[kind] || emptyStats());

  // Re-read when the banner kind changes (each of the 4 kinds — character,
  // weapon, standardChar, standardWeap — tracks its own independent stats).
  useEffect(() => {
    setStats(loadAll()[kind] || emptyStats());
  }, [kind]);

  // Tallies one completed simulateConvenePulls() result (sim.results, plus
  // the pull count that produced it) into this banner's running stats.
  const record = useCallback((sim, count) => {
    setStats(prev => {
      const next = {
        ...prev,
        weaponsByRarity: { ...prev.weaponsByRarity },
        charactersByRarity: { ...prev.charactersByRarity },
      };
      next.totalPulls += count;
      if (count === 1) next.x1Pulls += 1; else next.x10Pulls += 1;
      for (const r of sim.results) {
        // Each result carries its own type now — a 4★ can be a weapon on a
        // character banner or vice versa (see conveneSimulator.js), so this
        // can no longer be inferred from the banner kind alone.
        if (r.type === 'weapon') {
          next.weaponsByRarity[r.rarity] = (next.weaponsByRarity[r.rarity] || 0) + 1;
        } else {
          next.charactersByRarity[r.rarity] = (next.charactersByRarity[r.rarity] || 0) + 1;
        }
        if (r.rarity === 5) {
          next.fiveStarCount += 1;
          next.fiveStarPitySum += r.pity || 0;
          if (r.won50 === true) next.won50 += 1;
          else if (r.won50 === false) next.lost50 += 1;
        }
      }
      const all = loadAll();
      all[kind] = next;
      saveAll(all);
      return next;
    });
  }, [kind]);

  const reset = useCallback(() => {
    const fresh = emptyStats();
    setStats(fresh);
    const all = loadAll();
    all[kind] = fresh;
    saveAll(all);
  }, [kind]);

  return { stats, record, reset };
}
