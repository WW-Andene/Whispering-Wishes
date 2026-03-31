// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — EventsTab (extracted from App.jsx)
// Time-gated content tracking with server-adjusted countdowns
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useMemo, useRef } from 'react';
import { RefreshCcw, Calendar, CheckCircle, Clock } from 'lucide-react';
import {
  EVENTS, getServerOffset,
} from '../../appcore-data.js';
import {
  getServerAdjustedEnd, getRecurringEventEnd,
  getNextDailyReset, getNextWeeklyReset,
} from '../../appcore-engine.js';
import {
  Card, CardHeader, CardBody, EventCard, TabBackground, TabErrorBoundary,
  getActiveBanners,
} from '../../appcore-components.jsx';

export default function EventsTab({
  state,
  dispatch,
  activeBanners,
  setActiveBanners,
  visualSettings,
  toast,
}) {
  const refreshCooldownRef = useRef(0);
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
                setActiveBanners(getActiveBanners());
                toast?.addToast?.('Banner data refreshed!', 'success');
              }}
              className="text-cyan-400 text-[10px] flex items-center gap-1 hover:text-cyan-300 transition-colors p-1.5 min-h-[44px] min-w-[44px] justify-center rounded-lg hover:bg-white/5"
            >
              <RefreshCcw size={12} /> Refresh Timers
            </button>
            <span className="text-gray-400 text-[10px]">Server: {state.server}</span>
          </div>
        }>Events &amp; Resets</CardHeader>
        <CardBody>
          {(() => {
            const eventEntries = Object.entries(EVENTS);
            const totalAstrite = eventEntries.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards, 10) || 0), 0);
            const doneKeys = eventEntries.filter(([key]) => state.eventStatus[key] === 'done');
            const skippedKeys = eventEntries.filter(([key]) => state.eventStatus[key] === 'skipped');
            const earnedAstrite = doneKeys.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards, 10) || 0), 0);
            const skippedAstrite = skippedKeys.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards, 10) || 0), 0);
            const hasProgress = doneKeys.length > 0 || skippedKeys.length > 0;
            return (
              <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 text-xs font-medium">{hasProgress ? 'Astrite Progress' : 'Total Available Astrite'}</span>
                  <span className="text-yellow-400 font-bold text-sm">{hasProgress ? `${earnedAstrite.toLocaleString()} / ${totalAstrite.toLocaleString()}` : totalAstrite.toLocaleString()} Astrite</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-400 rounded-l-full transition-[width] duration-300" style={{ width: `${totalAstrite > 0 ? (earnedAstrite / totalAstrite) * 100 : 0}%` }} />
                    {skippedAstrite > 0 && (
                      <div
                        className="h-full transition-[width] duration-300"
                        style={{
                          width: `${(skippedAstrite / totalAstrite) * 100}%`,
                          background: 'repeating-linear-gradient(45deg, rgba(156,163,175,0.4), rgba(156,163,175,0.4) 2px, rgba(156,163,175,0.15) 2px, rgba(156,163,175,0.15) 4px)',
                        }}
                      />
                    )}
                  </div>
                  <span className="text-gray-400 text-[10px] flex-shrink-0">{doneKeys.length}/{eventEntries.length} done</span>
                </div>
              </div>
            );
          })()}
        </CardBody>
      </Card>
      {/* Event summary counters */}
      {(() => {
        const eventEntries = Object.entries(EVENTS);
        const doneCount = eventEntries.filter(([key]) => state.eventStatus[key] === 'done').length;
        const skippedCount = eventEntries.filter(([key]) => state.eventStatus[key] === 'skipped').length;
        const pendingCount = eventEntries.length - doneCount - skippedCount;
        return (
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex gap-2">
              <div className="flex-1 text-center py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-emerald-400 text-sm font-bold">{doneCount}</div>
                <div className="text-gray-500 text-[10px]">Completed</div>
              </div>
              <div className="flex-1 text-center py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="text-yellow-400 text-sm font-bold">{pendingCount}</div>
                <div className="text-gray-500 text-[10px]">Pending</div>
              </div>
              <div className="flex-1 text-center py-1.5 rounded-lg bg-gray-500/10 border border-gray-500/20">
                <div className="text-gray-400 text-sm font-bold">{skippedCount}</div>
                <div className="text-gray-500 text-[10px]">Skipped</div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="space-y-2 event-grid">
        {(() => {
          const eventImageMap = {
            tacticalHologram: activeBanners.tacticalHologramImage,
            whimperingWastes: activeBanners.whimperingWastesImage,
            doubledPawns: activeBanners.doubledPawnsImage,
            towerOfAdversity: activeBanners.towerOfAdversityImage,
            illusiveRealm: activeBanners.illusiveRealmImage,
            weeklyBoss: activeBanners.weeklyBossImage,
            dailyReset: activeBanners.dailyResetImage,
          };
          const entries = Object.entries(EVENTS);
          if (entries.length === 0) return (
            <div className="text-center py-8 text-gray-500 text-sm">
              <Calendar size={24} className="mx-auto mb-2 opacity-50" />
              No events currently tracked
            </div>
          );

          // Determine which events are expired (non-recurring with past end date)
          // Issue #18: Use server-adjusted time (getServerOffset) instead of raw Date.now()
          const serverOffset = getServerOffset(state.server);
          const now = Date.now() + serverOffset * 3600000;
          const isEventExpired = (ev) => {
            if (ev.dailyReset || ev.weeklyReset) return false;
            const isRecurring = ev.resetType && /^~?\d+\s*(days?|d|h|m)?$/i.test(ev.resetType.trim());
            if (isRecurring) return false;
            if (!ev.currentEnd) return false;
            const end = getServerAdjustedEnd(ev.currentEnd, state.server);
            const endMs = new Date(end).getTime() + serverOffset * 3600000;
            return !isNaN(endMs) && endMs <= now;
          };

          const active = entries.filter(([, ev]) => !isEventExpired(ev));
          const expired = entries.filter(([, ev]) => isEventExpired(ev));

          const renderCard = ([key, ev], isExpired) => (
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
          );

          return (
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
          );
        })()}
      </div>
      <p className="text-gray-500 text-[10px] text-center content-layer sticky bottom-0 py-2" style={{ background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)' }}>Reset times based on {state.server} server (UTC{getServerOffset(state.server) >= 0 ? '+' : ''}{getServerOffset(state.server)})</p>
    </div>
    </TabErrorBoundary>
    </div>
  );
}
