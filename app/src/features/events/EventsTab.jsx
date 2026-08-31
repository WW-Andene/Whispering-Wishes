// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — EventsTab (extracted from App.jsx)
// Time-gated content tracking with server-adjusted countdowns
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCcw, Calendar } from 'lucide-react';
import { getLocalizedEvents } from '../../data/banners.js';
import { getServerOffset } from '../../data/constants.js';
import { getServerAdjustedEnd } from '../../core/time.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { EventCard } from './EventCard.jsx';
import { getActiveBanners } from '../../shared/components/bannerUtils.js';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { t, formatNumber, getLocale } from '../../utils/i18n.js';

const LOCALIZED_EVENT_ENTRIES = Object.entries(getLocalizedEvents(getLocale()));

function EventsTab({
  state,
  dispatch,
  activeBanners,
  setActiveBanners,
  visualSettings,
  toast,
}) {
  const refreshCooldownRef = useRef(0);
  const [refreshCooling, setRefreshCooling] = useState(false);

  // P4-10 audit fix: prune stale eventStatus keys on mount.
  // Banner rotations remove events from EVENTS but their 'done'/'skipped' status
  // entries would otherwise accumulate in localStorage forever. Runs once per
  // mount to clear any keys no longer in the current EVENTS map.
  useEffect(() => {
    const validKeys = new Set(LOCALIZED_EVENT_ENTRIES.map(([key]) => key));
    const staleKeys = Object.keys(state.eventStatus || {}).filter(k => !validKeys.has(k));
    staleKeys.forEach(key => dispatch({ type: 'SET_EVENT_STATUS', eventKey: key, status: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // L1-FIX: Memoize event progress stats (was 60+ array iterations per render)
  const progressStats = useMemo(() => {
    // Weekly rewards: daily recurring (×7) + weekly recurring sources
    const totalAstrite = LOCALIZED_EVENT_ENTRIES.reduce((sum, [, ev]) => {
      const val = parseInt(ev.rewards, 10) || 0;
      if (!val) return sum;
      if (ev.dailyReset) return sum + val * 7;
      if (ev.weeklyReset) return sum + val;
      return sum;
    }, 0);
    const doneKeys = LOCALIZED_EVENT_ENTRIES.filter(([key]) => state.eventStatus[key] === 'done');
    const skippedKeys = LOCALIZED_EVENT_ENTRIES.filter(([key]) => state.eventStatus[key] === 'skipped');
    const earnedAstrite = doneKeys.reduce((sum, [, ev]) => {
      const val = parseInt(ev.rewards, 10) || 0;
      if (!val) return sum;
      if (ev.dailyReset) return sum + val * 7;
      if (ev.weeklyReset) return sum + val;
      return sum;
    }, 0);
    const skippedAstrite = skippedKeys.reduce((sum, [, ev]) => {
      const val = parseInt(ev.rewards, 10) || 0;
      if (!val) return sum;
      if (ev.dailyReset) return sum + val * 7;
      if (ev.weeklyReset) return sum + val;
      return sum;
    }, 0);
    const hasProgress = doneKeys.length > 0 || skippedKeys.length > 0;
    const pendingCount = LOCALIZED_EVENT_ENTRIES.length - doneKeys.length - skippedKeys.length;
    return { totalAstrite, earnedAstrite, skippedAstrite, hasProgress, doneCount: doneKeys.length, skippedCount: skippedKeys.length, pendingCount, totalCount: LOCALIZED_EVENT_ENTRIES.length };
  }, [state.eventStatus]);

  // L1-FIX: Memoize active/expired event split
  const { active, expired, eventImageMap } = useMemo(() => {
    const imgMap = {
      tacticalHologram: activeBanners.tacticalHologramImage,
      whimperingWastes: activeBanners.whimperingWastesImage,
      endstateMatrix: activeBanners.endstateMatrixImage,
      pioneerPodcast: activeBanners.pioneerPodcastImage,
      towerOfAdversity: activeBanners.towerOfAdversityImage,
      illusiveRealm: activeBanners.illusiveRealmImage,
      weeklyBoss: activeBanners.weeklyBossImage,
      dailyReset: activeBanners.dailyResetImage,
    };
    const serverOffset = getServerOffset(state.server);
    const now = Date.now() + serverOffset * 3600000;
    const isEventExpired = (ev) => {
      if (ev.dailyReset || ev.weeklyReset) return false;
      const isRecurring = ev.resetType && /^~?\d+\s*(days?|d|h|m)?$/i.test(ev.resetType.trim());
      if (isRecurring) return false;
      if (!ev.currentEnd) return false;
      const end = getServerAdjustedEnd(ev.currentEnd, state.server);
      const endMs = new Date(end).getTime();
      return !isNaN(endMs) && endMs <= Date.now();
    };
    return {
      active: LOCALIZED_EVENT_ENTRIES.filter(([, ev]) => !isEventExpired(ev)),
      expired: LOCALIZED_EVENT_ENTRIES.filter(([, ev]) => isEventExpired(ev)),
      eventImageMap: imgMap,
    };
  }, [activeBanners, state.server]);

  // L1-FIX: Stable renderCard callback (was recreated every render)
  const renderCard = useCallback(([key, ev], isExpired) => (
    <EventCard
      key={key}
      event={{...ev, key}}
      server={state.server}
      bannerImage={eventImageMap[key] || ev.imageUrl}
      visualSettings={visualSettings}
      status={state.eventStatus[key]}
      isExpired={isExpired}
      onStatusChange={(s) => dispatch({ type: 'SET_EVENT_STATUS', eventKey: key, status: s })}
    />
  ), [state.server, state.eventStatus, eventImageMap, visualSettings, dispatch]);

  return (
    <div role="tabpanel" id="tabpanel-events" aria-labelledby="tab-events" tabIndex="0">
    <TabErrorBoundary tabName={t('tabs.events')}>
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="events" />

      <Card>
        <CardHeader action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (Date.now() - refreshCooldownRef.current < 3000) return;
                refreshCooldownRef.current = Date.now();
                setRefreshCooling(true);
                setTimeout(() => setRefreshCooling(false), 3000);
                setActiveBanners(getActiveBanners());
                toast?.addToast?.(t('events.bannerRefreshed'), 'success');
              }}
              disabled={refreshCooling}
              className={`text-sm flex items-center gap-1 transition-colors p-1.5 min-h-[48px] min-w-[48px] justify-center rounded-lg ${refreshCooling ? 'text-gray-600 cursor-not-allowed' : 'text-cyan-400 hover:text-cyan-300 hover:bg-white/5'}`}
            >
              <RefreshCcw size={12} className={refreshCooling ? 'animate-spin' : ''} /> {t('events.refreshTimers')}
            </button>
            <span className="text-gray-400 text-sm">{t('events.server', { server: state.server })}</span>
          </div>
        }>{t('events.title')}</CardHeader>
        <CardBody className="space-y-2">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 text-base font-medium">{progressStats.hasProgress ? t('events.weeklyProgress') : t('events.weeklyRewards')}</span>
                  <span className="text-yellow-400 font-bold text-xl kuro-number">{progressStats.hasProgress ? `${formatNumber(progressStats.earnedAstrite)} / ${formatNumber(progressStats.totalAstrite)}` : formatNumber(progressStats.totalAstrite)} {t('events.astrite')}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-400 rounded-l-full transition-[width] duration-300" style={{ width: `${progressStats.totalAstrite > 0 ? (progressStats.earnedAstrite / progressStats.totalAstrite) * 100 : 0}%` }} />
                    {progressStats.skippedAstrite > 0 && (
                      <div
                        className="h-full transition-[width] duration-300"
                        style={{
                          width: `${progressStats.totalAstrite > 0 ? (progressStats.skippedAstrite / progressStats.totalAstrite) * 100 : 0}%`,
                          background: 'repeating-linear-gradient(45deg, rgba(156,163,175,0.4), rgba(156,163,175,0.4) 2px, rgba(156,163,175,0.15) 2px, rgba(156,163,175,0.15) 4px)',
                        }}
                      />
                    )}
                  </div>
                  <span className="text-gray-400 text-sm flex-shrink-0">{progressStats.doneCount}/{progressStats.totalCount} {t('events.done')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="kuro-stat kuro-stat-emerald flex-1 p-2">
                  <div className="text-emerald-400 text-xl font-bold kuro-number">{progressStats.doneCount}</div>
                  <div className="text-gray-500 kuro-micro-label">{t('events.completed')}</div>
                </div>
                <div className="kuro-stat kuro-stat-gold flex-1 p-2">
                  <div className="text-yellow-400 text-xl font-bold kuro-number">{progressStats.pendingCount}</div>
                  <div className="text-gray-500 kuro-micro-label">{t('events.pending')}</div>
                </div>
                <div className="kuro-stat kuro-stat-gray flex-1 p-2">
                  <div className="text-gray-400 text-xl font-bold kuro-number">{progressStats.skippedCount}</div>
                  <div className="text-gray-500 kuro-micro-label">{t('events.skipped')}</div>
                </div>
              </div>
        </CardBody>
      </Card>

      <div className="space-y-3 event-grid">
        {LOCALIZED_EVENT_ENTRIES.length === 0 ? (
          <div className="kuro-empty-state text-center py-8">
            <Calendar size={24} className="mx-auto mb-2 opacity-50" />
            {t('events.noEvents')}
            <p className="text-gray-600 text-sm mt-1">{t('events.noEventsHint')}</p>
          </div>
        ) : (
          <>
            {active.map((entry) => renderCard(entry, false))}
            {expired.map((entry) => renderCard(entry, true))}
          </>
        )}
      </div>
      <p className="text-gray-500 text-sm text-center content-layer sticky bottom-0 py-2 kuro-gradient-fade-up">{t('events.resetTimesFooter', { server: state.server, offset: `${getServerOffset(state.server) >= 0 ? '+' : ''}${getServerOffset(state.server)}` })}</p>
    </div>
    </TabErrorBoundary>
    </div>
  );
}

export default React.memo(EventsTab, (prev, next) =>
  prev.state.eventStatus === next.state.eventStatus && prev.state.server === next.state.server &&
  prev.activeBanners === next.activeBanners && prev.visualSettings === next.visualSettings
);
