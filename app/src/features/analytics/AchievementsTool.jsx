// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — AchievementsTool
// Full in-game achievement (Trophy) tracker: search, Version filter, Série filter,
// Completion filter, Hidden ("Caché") filter, per-achievement checkbox persisted
// to localStorage.
//
// Data source: wuwatracker.com's embedded RSC payload (real per-achievement version
// + hidden flags). See data/achievements.js header for full sourcing notes.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from 'react';
import { Award, Check, ChevronLeft, EyeOff, Search, X } from 'lucide-react';
import { ACHIEVEMENTS, ALL_ACHIEVEMENT_VERSIONS, getLocalizedAchievements, getLocalizedAchievementSeries } from '../../data/achievements.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { t, formatNumber, getPluralForm, getLocale } from '../../utils/i18n.js';

const STORAGE_KEY = 'ww-achievements-done';
const SET_CODEC = {
  serialize: (set) => JSON.stringify([...set]),
  deserialize: (raw) => new Set(JSON.parse(raw)),
};

// Precompute achievement id list per series once (module-level, data is static)
const ACHIEVEMENTS_BY_SERIES = (() => {
  const map = {};
  for (const [id, a] of Object.entries(ACHIEVEMENTS)) {
    (map[a.group] ||= []).push(Number(id));
  }
  return map;
})();

function AchievementsTool({ onClose }) {
  const LOCALIZED_ACHIEVEMENTS = useMemo(() => getLocalizedAchievements(getLocale()), []);
  const LOCALIZED_ACHIEVEMENT_SERIES = useMemo(() => getLocalizedAchievementSeries(getLocale()), []);
  const ALL_SERIES_LIST = useMemo(() => Object.entries(LOCALIZED_ACHIEVEMENT_SERIES)
    .map(([id, s]) => ({ id: Number(id), ...s }))
    .sort((a, b) => a.id - b.id), [LOCALIZED_ACHIEVEMENT_SERIES]);
  const ALL_ACHIEVEMENT_CATEGORIES = useMemo(() => [...new Set(Object.values(LOCALIZED_ACHIEVEMENT_SERIES).map(s => s.category))], [LOCALIZED_ACHIEVEMENT_SERIES]);
  const [done, setDone] = usePersistedState(STORAGE_KEY, new Set(), SET_CODEC);
  const [search, setSearch] = useState('');
  const [versionFilter, setVersionFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all'); // series (group) id, or 'all'
  const [completionFilter, setCompletionFilter] = useState('all'); // all | complete | incomplete
  const [hiddenFilter, setHiddenFilter] = useState('all'); // all | hidden | visible ("Caché")
  const [categoryFilter, setCategoryFilter] = useState('all');

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
  const isFiltering = searchLower.length > 0 || versionFilter !== 'all' || completionFilter !== 'all' || hiddenFilter !== 'all' || seriesFilter !== 'all';

  const matchesFilters = useCallback((id) => {
    const a = LOCALIZED_ACHIEVEMENTS[id];
    if (!a) return false;
    if (searchLower && !a.name.toLowerCase().includes(searchLower) && !a.desc.toLowerCase().includes(searchLower)) return false;
    if (versionFilter !== 'all' && a.version !== versionFilter) return false;
    if (seriesFilter !== 'all' && a.group !== seriesFilter) return false;
    if (hiddenFilter === 'hidden' && !a.hidden) return false;
    if (hiddenFilter === 'visible' && a.hidden) return false;
    const isDone = done.has(id);
    if (completionFilter === 'complete' && !isDone) return false;
    if (completionFilter === 'incomplete' && isDone) return false;
    return true;
  }, [searchLower, versionFilter, seriesFilter, completionFilter, hiddenFilter, done]);

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

  const versionOptions = [{ value: 'all', label: t('analytics.achievements.allVersions') }, ...ALL_ACHIEVEMENT_VERSIONS.map(v => ({ value: v, label: t('analytics.achievements.versionShort', { version: v }) }))];
  const categoryOptions = [{ value: 'all', label: t('analytics.achievements.allSeries') }, ...ALL_ACHIEVEMENT_CATEGORIES.map(c => ({ value: c, label: c }))];
  const completionOptions = [
    { value: 'all', label: t('analytics.achievements.all') },
    { value: 'complete', label: t('analytics.achievements.completed') },
    { value: 'incomplete', label: t('analytics.achievements.notCompleted') },
  ];
  const hiddenOptions = [
    { value: 'all', label: t('analytics.achievements.hiddenAll') },
    { value: 'hidden', label: t('analytics.achievements.hiddenOnly') },
    { value: 'visible', label: t('analytics.achievements.visibleOnly') },
  ];

  // Série filter here operates at the category level (Exploration/Journey/etc.) for the
  // dropdown; clicking an individual series card drills into that specific group id.
  const visibleSeriesList = categoryFilter === 'all' ? ALL_SERIES_LIST : ALL_SERIES_LIST.filter(s => s.category === categoryFilter);

  const selectedSeries = seriesFilter !== 'all' ? LOCALIZED_ACHIEVEMENT_SERIES[seriesFilter] : null;

  const renderAchievementRow = (id) => {
    const a = LOCALIZED_ACHIEVEMENTS[id];
    const s = LOCALIZED_ACHIEVEMENT_SERIES[a.group];
    const isDone = done.has(id);
    return (
      <div key={id} className="flex items-start gap-3 p-3 rounded-lg border transition-colors" style={{ borderColor: isDone ? 'rgba(74,222,128,0.35)' : 'var(--border-medium)', background: isDone ? 'rgba(74,222,128,0.06)' : 'rgba(15,20,28,0.25)' }}>
        <button
          onClick={() => toggleDone(id)}
          aria-label={isDone ? t('analytics.achievements.markUndone', { name: a.name }) : t('analytics.achievements.markDone', { name: a.name })}
          aria-pressed={isDone}
          className="mt-0.5 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 border transition-colors"
          style={{ borderColor: isDone ? '#4ade80' : 'var(--border-medium)', background: isDone ? '#4ade80' : 'transparent' }}
        >
          {isDone && <Check size={12} className="text-black" strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm flex items-center gap-1.5" style={{ color: isDone ? '#4ade80' : 'inherit' }}>
              {a.name}
              {a.hidden && <EyeOff size={12} className="text-gray-500 flex-shrink-0" aria-label={t('analytics.achievements.hiddenAchievement')} />}
            </span>
            <span className="text-xs text-yellow-400/80 flex-shrink-0">{t('analytics.achievements.points', { n: formatNumber(a.points) })}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
          {isFiltering && (
            <p className="text-[8px] text-gray-500 mt-1">{s?.name} · {t('analytics.achievements.versionShort', { version: a.version })}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader action={
        <button onClick={onClose} aria-label={t('analytics.achievements.closeAria')} className="text-gray-400 hover:text-gray-200 transition-colors">
          <X size={16} />
        </button>
      }>
        <Award size={14} className="text-yellow-400 inline-block mr-1.5 -mt-0.5" /> {t('analytics.achievements.title')}
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between text-sm bg-black/20 rounded-lg p-3">
          <span className="text-gray-300">{t('analytics.achievements.progress')} <strong>{formatNumber(done.size)}</strong> / {formatNumber(totalCount)}</span>
          <span className="text-gray-300">{t('analytics.achievements.rewards')} <strong className="text-yellow-400">{formatNumber(earnedPoints)}</strong> / {formatNumber(totalPoints)}</span>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('analytics.achievements.searchPlaceholder')}
            aria-label={t('analytics.achievements.searchAria')}
            className="w-full pl-8 pr-8 py-2 text-sm rounded-lg bg-black/25 border border-[var(--border-medium)] focus:outline-none focus:border-yellow-400/50 text-gray-200 placeholder-gray-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <KuroSelect ariaLabel={t('analytics.achievements.versionFilterAria')} small value={versionFilter} onChange={setVersionFilter} options={versionOptions} />
          <KuroSelect ariaLabel={t('analytics.achievements.seriesFilterAria')} small value={categoryFilter} onChange={(v) => { setCategoryFilter(v); setSeriesFilter('all'); }} options={categoryOptions} />
          <KuroSelect ariaLabel={t('analytics.achievements.completionFilterAria')} small value={completionFilter} onChange={setCompletionFilter} options={completionOptions} />
          <KuroSelect ariaLabel={t('analytics.achievements.hiddenFilterAria')} small value={hiddenFilter} onChange={setHiddenFilter} options={hiddenOptions} />
        </div>

        {/* Flat filtered results (search active, or any filter narrowed beyond "pick a series") */}
        {isFiltering ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{t(`analytics.achievements.resultCount${getPluralForm(filteredIds.length) === 'one' ? 'One' : 'Other'}`, { n: formatNumber(filteredIds.length) })}</span>
              <button onClick={() => { setSearch(''); setVersionFilter('all'); setCategoryFilter('all'); setSeriesFilter('all'); setCompletionFilter('all'); setHiddenFilter('all'); }} className="text-xs text-yellow-400/80 hover:text-yellow-400">{t('analytics.achievements.clearFilters')}</button>
            </div>
            {filteredIds.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">{t('analytics.achievements.noMatch')}</p>
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
              <ChevronLeft size={12} /> {t('analytics.achievements.backToSeries')}
            </button>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                {selectedSeries.icon && <img src={selectedSeries.icon} alt="" className="w-6 h-6" loading="lazy" />}
                {selectedSeries.name}
              </span>
              <span className="text-gray-400 text-xs">
                {formatNumber(seriesProgress(seriesFilter).doneCount)} / {formatNumber(seriesProgress(seriesFilter).total)} · {formatNumber(seriesProgress(seriesFilter).donePts)} / {formatNumber(seriesProgress(seriesFilter).pts)} pts
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
                  className="w-full text-left p-3 rounded-lg border border-[var(--border-medium)] bg-black/20 hover:bg-black/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      {s.icon && <img src={s.icon} alt="" className="w-6 h-6 flex-shrink-0" loading="lazy" />}
                      {s.name}
                    </span>
                    <span className="text-[8px] text-gray-500 flex-shrink-0">{s.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>{formatNumber(p.doneCount)} / {formatNumber(p.total)}</span>
                    <span>{formatNumber(p.donePts)} / {formatNumber(p.pts)} pts</span>
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
