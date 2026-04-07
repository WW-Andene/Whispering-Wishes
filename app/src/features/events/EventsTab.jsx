// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — EventsTab (extracted from App.jsx)
// Time-gated content tracking with server-adjusted countdowns
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshCcw, Calendar } from 'lucide-react';
import { EVENTS } from '../../data/banners.js';
import { getServerOffset } from '../../data/constants.js';
import { getServerAdjustedEnd, getRecurringEventEnd, getNextDailyReset, getNextWeeklyReset } from '../../core/time.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { EventCard } from '../../shared/components/EventCard.jsx';
import { getActiveBanners } from '../../shared/components/bannerUtils.js';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';

const EVENT_ENTRIES = Object.entries(EVENTS);

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

  // L1-FIX: Memoize event progress stats (was 60+ array iterations per render)
  const progressStats = useMemo(() => {
    // Weekly rewards: daily recurring (×7) + weekly recurring sources
    const totalAstrite = EVENT_ENTRIES.reduce((sum, [, ev]) => {
      const val = parseInt(ev.rewards, 10) || 0;
      if (!val) return sum;
      if (ev.dailyReset) return sum + val * 7;
      if (ev.weeklyReset) return sum + val;
      return sum;
    }, 0);
    const doneKeys = EVENT_ENTRIES.filter(([key]) => state.eventStatus[key] === 'done');
    const skippedKeys = EVENT_ENTRIES.filter(([key]) => state.eventStatus[key] === 'skipped');
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
    const pendingCount = EVENT_ENTRIES.length - doneKeys.length - skippedKeys.length;
    return { totalAstrite, earnedAstrite, skippedAstrite, hasProgress, doneCount: doneKeys.length, skippedCount: skippedKeys.length, pendingCount, totalCount: EVENT_ENTRIES.length };
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
      active: EVENT_ENTRIES.filter(([, ev]) => !isEventExpired(ev)),
      expired: EVENT_ENTRIES.filter(([, ev]) => isEventExpired(ev)),
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
    <TabErrorBoundary tabName="Events">
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
                toast?.addToast?.('Banner data refreshed!', 'success');
              }}
              disabled={refreshCooling}
              className={`text-[10px] flex items-center gap-1 transition-colors p-1.5 min-h-[44px] min-w-[44px] justify-center rounded-lg ${refreshCooling ? 'text-gray-600 cursor-not-allowed' : 'text-cyan-400 hover:text-cyan-300 hover:bg-white/5'}`}
            >
              <RefreshCcw size={12} className={refreshCooling ? 'animate-spin' : ''} /> Refresh Timers
            </button>
            <span className="text-gray-400 text-[10px]">Server: {state.server}</span>
          </div>
        }>Events &amp; Resets</CardHeader>
        <CardBody className="space-y-2">
              <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 text-xs font-medium">{progressStats.hasProgress ? 'Weekly Progress' : 'Weekly Rewards'}</span>
                  <span className="text-yellow-400 font-bold text-sm kuro-number">{progressStats.hasProgress ? `${progressStats.earnedAstrite.toLocaleString('en-US')} / ${progressStats.totalAstrite.toLocaleString('en-US')}` : progressStats.totalAstrite.toLocaleString('en-US')} Astrite</span>
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
                  <span className="text-gray-400 text-[10px] flex-shrink-0">{progressStats.doneCount}/{progressStats.totalCount} done</span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 text-center py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-emerald-400 text-sm font-bold">{progressStats.doneCount}</div>
                  <div className="text-gray-500 text-[10px]">Completed</div>
                </div>
                <div className="flex-1 text-center py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-yellow-400 text-sm font-bold">{progressStats.pendingCount}</div>
                  <div className="text-gray-500 text-[10px]">Pending</div>
                </div>
                <div className="flex-1 text-center py-1.5 rounded-lg bg-gray-500/10 border border-gray-500/20">
                  <div className="text-gray-400 text-sm font-bold">{progressStats.skippedCount}</div>
                  <div className="text-gray-500 text-[10px]">Skipped</div>
                </div>
              </div>
        </CardBody>
      </Card>

      <div className="space-y-3 event-grid">
        {EVENT_ENTRIES.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <Calendar size={24} className="mx-auto mb-2 opacity-50" />
            No events currently tracked
          </div>
        ) : (
          <>
            {active.map((entry) => renderCard(entry, false))}
            {expired.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-2 pb-1">
                  <div className="flex-1 h-px bg-gray-700/50" />
                  <span className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Expired</span>
                  <div className="flex-1 h-px bg-gray-700/50" />
                </div>
                {expired.map((entry) => renderCard(entry, true))}
              </>
            )}
          </>
        )}
      </div>
      <p className="text-gray-500 text-[10px] text-center content-layer sticky bottom-0 py-2 kuro-gradient-fade-up">Reset times based on {state.server} server (UTC{getServerOffset(state.server) >= 0 ? '+' : ''}{getServerOffset(state.server)})</p>
    </div>
    </TabErrorBoundary>
    </div>
  );
}

export default React.memo(EventsTab, (prev, next) =>
  prev.state.eventStatus === next.state.eventStatus && prev.state.server === next.state.server &&
  prev.activeBanners === next.activeBanners && prev.visualSettings === next.visualSettings
);
