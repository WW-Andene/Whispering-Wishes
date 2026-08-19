// ═══════════════════════════════════════════════════════════════════════════════
// EnemyEchoSelectorModal — Echo picker modal for enemy target selection
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useCallback } from 'react';
import { X } from 'lucide-react';
import { ECHO_DATA, ALL_1COST_ECHOES, ALL_3COST_ECHOES, ALL_4COST_ECHOES, ALL_ECHO_SONATA_SETS, ALL_ECHO_BUFF_TYPES } from '../../data/echoes.js';
import { haptic, getSetIcon, getElementIcon } from '../../utils/helpers.js';
import { FocusTrapModal } from '../../providers/FocusTrapModal.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import MonsterCard from '../../shared/components/MonsterCard.jsx';

// Every echo-dropping enemy the app tracks (1-cost commons through 4-cost bosses) is a legitimate
// fight target — HP/ATK/DEF/RES/stagger data covers all 181 of them (see echoes.js), not just the
// Overlord-class ones. rank (Common/Elite/Overlord/Calamity, from ECHO_DATA[name].rank) is what the
// Rank filter below groups/filters by; sort order puts the rarer, more "boss-like" fights first.
const ALL_TARGETABLE_ECHOES = [...new Set([...ALL_1COST_ECHOES, ...ALL_3COST_ECHOES, ...ALL_4COST_ECHOES])];
const RANK_ORDER = { Calamity: 0, Overlord: 1, Elite: 2, Common: 3 };
const RANKS = ['Calamity', 'Overlord', 'Elite', 'Common'];
// Each ALL_XCOST_ECHOES array is already grouped and commented by game version (newest patch first —
// see the "v3.6 —"/"v1.0 — Launch" section comments in echoes.js) — real curated release data, just
// never used for sort order before. Reversed per-tier so the index runs oldest-to-newest, matching
// this app's existing release-order convention elsewhere (e.g. RELEASE_ORDER for characters lists
// launch resonators first). Sorting by this instead of alphabetically is what actually reads as
// "in release order" rather than the arbitrary-looking A-Z ordering within each rank tier.
const RELEASE_ORDER_INDEX = new Map();
[ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES].forEach(tierList => {
  [...tierList].reverse().forEach((name, i) => { if (!RELEASE_ORDER_INDEX.has(name)) RELEASE_ORDER_INDEX.set(name, i); });
});

export default function EnemyEchoSelectorModal({
  isOpen, onClose,
  enemyEcho, setEnemyEcho,
  enemyLevel, setEnemyLevel,
  collectionImages,
  search, setSearch,
  rankFilter, setRankFilter,
  setFilter, setSetFilter,
  buffFilter, setBuffFilter,
}) {

  const filtered = ALL_TARGETABLE_ECHOES.filter(n => {
    if (search && !n.toLowerCase().includes(search.toLowerCase())) return false;
    const ed = ECHO_DATA[n];
    if (!ed) return false;
    if (rankFilter && rankFilter !== 'all' && ed.rank !== rankFilter) return false;
    if (setFilter !== 'all' && !ed.sets?.includes(setFilter)) return false;
    if (buffFilter !== 'all' && !(Array.isArray(ed.buff) ? ed.buff.includes(buffFilter) : ed.buff === buffFilter)) return false;
    return true;
  }).sort((a, b) => {
    const ra = RANK_ORDER[ECHO_DATA[a]?.rank] ?? 9;
    const rb = RANK_ORDER[ECHO_DATA[b]?.rank] ?? 9;
    const oa = RELEASE_ORDER_INDEX.get(a) ?? 999;
    const ob = RELEASE_ORDER_INDEX.get(b) ?? 999;
    return ra - rb || oa - ob || a.localeCompare(b);
  });

  // Stable across renders (unlike an inline `() => { setEnemyEcho(name); ... }` per card), so
  // MonsterCard's memo() can actually skip re-rendering the ~181 cards whose other props didn't
  // change — e.g. typing in the search box only re-renders cards, not their internals, until the
  // filtered set itself changes.
  const handleSelect = useCallback((name) => {
    setEnemyEcho(name); onClose(); haptic.success();
  }, [setEnemyEcho, onClose]);

  return (
    <FocusTrapModal isOpen={isOpen} onClose={onClose} className="" onClick={onClose} centered>
      <div className="kuro-card w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-[var(--border-medium)] flex items-center justify-between flex-shrink-0" data-sheet-header>
          <div>
            <h3 className="text-white font-semibold text-xl">Select Target Enemy</h3>
            <p className="text-gray-400 text-sm">All {ALL_TARGETABLE_ECHOES.length} tracked enemies — filter by Rank, Set, or Type</p>
          </div>
          <button onClick={onClose} className="modal-close-btn p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Close"><X size={16} /></button>
        </div>

        {/* Search + Filters */}
        <div className="p-2 border-b border-[var(--border-subtle)] flex-shrink-0 space-y-1.5">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search enemies…" className="kuro-input w-full text-base" />
          <div className="flex items-center gap-2 px-0.5">
            <span className="text-gray-400 text-sm shrink-0">Enemy Lv.</span>
            <input
              type="range" min={1} max={120} value={enemyLevel ?? 90}
              onChange={e => setEnemyLevel?.(Number(e.target.value))}
              className="flex-1 accent-red-500"
            />
            <input
              type="number" min={1} max={120} value={enemyLevel ?? 90}
              onFocus={e => e.target.select()}
              onChange={e => { const n = parseInt(e.target.value, 10); if (!Number.isNaN(n)) setEnemyLevel?.(Math.max(1, Math.min(120, n))); }}
              onBlur={e => { if (e.target.value === '' || Number.isNaN(parseInt(e.target.value, 10))) setEnemyLevel?.(90); }}
              className="kuro-input w-14 text-sm px-1 py-0.5 text-center shrink-0"
            />
          </div>
          <div className="flex gap-1.5">
            <KuroSelect value={rankFilter ?? 'all'} onChange={v => setRankFilter?.(v)} small
              options={[
                { value: 'all', label: 'All Ranks' },
                ...RANKS.map(r => ({ value: r, label: r })),
              ]}
              className="flex-1 text-sm" />
          </div>
          <div className="flex gap-1.5">
            <KuroSelect value={setFilter} onChange={v => setSetFilter(v)} small
              options={[
                { value: 'all', label: 'All Sets' },
                ...ALL_ECHO_SONATA_SETS.map(s => ({
                  value: s,
                  label: <span className="inline-flex items-center gap-1.5"><img src={getSetIcon(s)} alt="" width={14} height={14} className="shrink-0" /> {s}</span>,
                })),
              ]}
              className="flex-1 text-sm" />
            <KuroSelect value={buffFilter} onChange={v => setBuffFilter(v)} small
              options={[
                { value: 'all', label: 'All Types' },
                ...ALL_ECHO_BUFF_TYPES.map(b => {
                  const icon = getElementIcon(b.replace(/ DMG$/, ''));
                  return {
                    value: b,
                    label: icon
                      ? <span className="inline-flex items-center gap-1.5"><img src={icon} alt="" width={14} height={14} className="shrink-0" /> {b}</span>
                      : b,
                  };
                }),
              ]}
              className="flex-1 text-sm" />
          </div>
        </div>

        {enemyEcho && (
          <div className="px-2 pt-2">
            <button onClick={() => { setEnemyEcho(''); onClose(); haptic.light(); }}
              className="kuro-btn text-sm w-full text-center text-gray-400">
              Clear target (use default level-only scaling)
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map(name => {
              const ed = ECHO_DATA[name];
              return (
                <MonsterCard
                  key={name}
                  name={name}
                  rank={ed?.rank}
                  // monsterIconUrl (the boss's own portrait) must win over collectionImages here —
                  // DEFAULT_COLLECTION_IMAGES duplicates each echo's iconUrl (its equippable-item
                  // icon, e.g. Crownless-Icon.webp) under the same name key for the Collection tab's
                  // echo grid, so checking collectionImages first showed the wrong picture (the item
                  // drop, not the enemy) for every boss that has a default collection image.
                  iconUrl={ed?.monsterIconUrl || collectionImages[name] || ed?.iconUrl}
                  enemyStats={ed?.enemyStats}
                  level={enemyLevel ?? 90}
                  selected={enemyEcho === name}
                  onSelect={handleSelect}
                />
              );
            })}
          </div>
        </div>
      </div>
    </FocusTrapModal>
  );
}
