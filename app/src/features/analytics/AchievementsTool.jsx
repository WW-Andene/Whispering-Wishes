// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — AchievementsTool
// Full in-game achievement (Trophy) tracker: search, Version filter, Série filter,
// Completion filter, per-achievement checkbox persisted to localStorage.
//
// Data source: nanoka.cc's static achievement.json (see data/achievements.js header
// for full sourcing notes and the Version-approximation caveat).
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Award, Check, ChevronLeft, Search, X } from 'lucide-react';
import { ACHIEVEMENT_SERIES, ACHIEVEMENTS, ALL_ACHIEVEMENT_CATEGORIES, ALL_ACHIEVEMENT_VERSIONS } from '../../data/achievements.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';

const STORAGE_KEY = 'ww-achievements-done';

function loadDone() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}
function saveDone(set) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])); } catch {}
}

// Precompute achievement id list per series once (module-level, data is static)
const ACHIEVEMENTS_BY_SERIES = (() => {
  const map = {};
  for (const [id, a] of Object.entries(ACHIEVEMENTS)) {
    (map[a.group] ||= []).push(Number(id));
  }
  return map;
})();

const ALL_SERIES_LIST = Object.entries(ACHIEVEMENT_SERIES)
  .map(([id, s]) => ({ id: Number(id), ...s }))
  .sort((a, b) => a.id - b.id);

function AchievementsTool({ onClose }) {
  const [done, setDone] = useState(loadDone);
  const [search, setSearch] = useState('');
  const [versionFilter, setVersionFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all'); // series (group) id, or 'all'
  const [completionFilter, setCompletionFilter] = useState('all'); // all | complete | incomplete

  useEffect(() => { saveDone(done); }, [done]);

  const toggleDone = useCallback((id) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const totalPoints = useMemo(() => Object.values(ACHIEVEMENTS).reduce((s, a) => s + a.points, 0), []);
  const earnedPoints = useMemo(() => {
    let sum = 0;
    for (const id of done) { const a = ACHIEVEMENTS[id]; if (a) sum += a.points; }
    return sum;
  }, [done]);
  const totalCount = Object.keys(ACHIEVEMENTS).length;

  const searchLower = search.trim().toLowerCase();
  const isFiltering = searchLower.length > 0 || versionFilter !== 'all' || completionFilter !== 'all' || seriesFilter !== 'all';

  const matchesFilters = useCallback((id) => {
    const a = ACHIEVEMENTS[id];
    if (!a) return false;
    if (searchLower && !a.name.toLowerCase().includes(searchLower) && !a.desc.toLowerCase().includes(searchLower)) return false;
    if (versionFilter !== 'all' && ACHIEVEMENT_SERIES[a.group]?.version !== versionFilter) return false;
    if (seriesFilter !== 'all' && a.group !== seriesFilter) return false;
    const isDone = done.has(id);
    if (completionFilter === 'complete' && !isDone) return false;
    if (completionFilter === 'incomplete' && isDone) return false;
    return true;
  }, [searchLower, versionFilter, seriesFilter, completionFilter, done]);

  const filteredIds = useMemo(() => {
    if (!isFiltering) return [];
    return Object.keys(ACHIEVEMENTS).map(Number).filter(matchesFilters).sort((a, b) => a - b);
  }, [isFiltering, matchesFilters]);

  const seriesProgress = useCallback((seriesId) => {
    const ids = ACHIEVEMENTS_BY_SERIES[seriesId] || [];
    const doneCount = ids.filter(id => done.has(id)).length;
    const pts = ids.reduce((s, id) => s + ACHIEVEMENTS[id].points, 0);
    const donePts = ids.reduce((s, id) => s + (done.has(id) ? ACHIEVEMENTS[id].points : 0), 0);
    return { doneCount, total: ids.length, donePts, pts };
  }, [done]);

  const versionOptions = [{ value: 'all', label: 'All Versions' }, ...ALL_ACHIEVEMENT_VERSIONS.map(v => ({ value: v, label: `v${v}` }))];
  const categoryOptions = [{ value: 'all', label: 'All Series' }, ...ALL_ACHIEVEMENT_CATEGORIES.map(c => ({ value: c, label: c }))];
  const completionOptions = [
    { value: 'all', label: 'All' },
    { value: 'complete', label: 'Completed' },
    { value: 'incomplete', label: 'Not Completed' },
  ];

  // Série filter here operates at the category level (Exploration/Journey/etc.) for the
  // dropdown; clicking an individual series card drills into that specific group id.
  const [categoryFilter, setCategoryFilter] = useState('all');
  const visibleSeriesList = categoryFilter === 'all' ? ALL_SERIES_LIST : ALL_SERIES_LIST.filter(s => s.category === categoryFilter);

  const selectedSeries = seriesFilter !== 'all' ? ACHIEVEMENT_SERIES[seriesFilter] : null;

  const renderAchievementRow = (id) => {
    const a = ACHIEVEMENTS[id];
    const s = ACHIEVEMENT_SERIES[a.group];
    const isDone = done.has(id);
    return (
      <div key={id} className="flex items-start gap-3 p-2.5 rounded-lg border transition-colors" style={{ borderColor: isDone ? 'rgba(74,222,128,0.35)' : 'var(--border-medium)', background: isDone ? 'rgba(74,222,128,0.06)' : 'rgba(15,20,28,0.25)' }}>
        <button
          onClick={() => toggleDone(id)}
          aria-label={isDone ? `Mark "${a.name}" as not completed` : `Mark "${a.name}" as completed`}
          aria-pressed={isDone}
          className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors"
          style={{ borderColor: isDone ? '#4ade80' : 'var(--border-medium)', background: isDone ? '#4ade80' : 'transparent' }}
        >
          {isDone && <Check size={13} className="text-black" strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm" style={{ color: isDone ? '#4ade80' : 'inherit' }}>{a.name}</span>
            <span className="text-xs text-yellow-400/80 flex-shrink-0">{a.points} pts</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
          {isFiltering && (
            <p className="text-[10px] text-gray-500 mt-1">{s?.name} · v{s?.version}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader action={
        <button onClick={onClose} aria-label="Close Achievements" className="text-gray-400 hover:text-gray-200 transition-colors">
          <X size={16} />
        </button>
      }>
        <Award size={14} className="text-yellow-400 inline-block mr-1.5 -mt-0.5" /> Achievements
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between text-sm bg-black/20 rounded-lg p-2.5">
          <span className="text-gray-300">Progress <strong>{done.size}</strong> / {totalCount}</span>
          <span className="text-gray-300">Rewards <strong className="text-yellow-400">{earnedPoints}</strong> / {totalPoints}</span>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search achievements..."
            aria-label="Search achievements"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-black/25 border border-[var(--border-medium)] focus:outline-none focus:border-yellow-400/50 text-gray-200 placeholder-gray-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <KuroSelect ariaLabel="Version filter" small value={versionFilter} onChange={setVersionFilter} options={versionOptions} />
          <KuroSelect ariaLabel="Série filter" small value={categoryFilter} onChange={(v) => { setCategoryFilter(v); setSeriesFilter('all'); }} options={categoryOptions} />
          <KuroSelect ariaLabel="Completion filter" small value={completionFilter} onChange={setCompletionFilter} options={completionOptions} />
        </div>

        {/* Flat filtered results (search active, or any filter narrowed beyond "pick a series") */}
        {isFiltering ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{filteredIds.length} result{filteredIds.length === 1 ? '' : 's'}</span>
              <button onClick={() => { setSearch(''); setVersionFilter('all'); setCategoryFilter('all'); setSeriesFilter('all'); setCompletionFilter('all'); }} className="text-xs text-yellow-400/80 hover:text-yellow-400">Clear filters</button>
            </div>
            {filteredIds.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No achievements match.</p>
            ) : (
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                {filteredIds.map(renderAchievementRow)}
              </div>
            )}
          </div>
        ) : selectedSeries ? (
          // Drilled into one series via a card click
          <div className="space-y-1.5">
            <button onClick={() => setSeriesFilter('all')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 mb-1">
              <ChevronLeft size={13} /> Back to Séries
            </button>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{selectedSeries.name}</span>
              <span className="text-gray-400 text-xs">
                {seriesProgress(seriesFilter).doneCount} / {seriesProgress(seriesFilter).total} · {seriesProgress(seriesFilter).donePts} / {seriesProgress(seriesFilter).pts} pts
              </span>
            </div>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
              {(ACHIEVEMENTS_BY_SERIES[seriesFilter] || []).slice().sort((a, b) => a - b).map(renderAchievementRow)}
            </div>
          </div>
        ) : (
          // Overview: series cards grouped, click to drill in
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {visibleSeriesList.map(s => {
              const p = seriesProgress(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setSeriesFilter(s.id)}
                  className="w-full text-left p-2.5 rounded-lg border border-[var(--border-medium)] bg-black/20 hover:bg-black/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-[10px] text-gray-500">v{s.version}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>{p.doneCount} / {p.total}</span>
                    <span>{p.donePts} / {p.pts} pts</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default AchievementsTool;
