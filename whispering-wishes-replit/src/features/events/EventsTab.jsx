// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — EventsTab (extracted from App.jsx)
// Time-gated content tracking with server-adjusted countdowns
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { RefreshCcw } from 'lucide-react';
import {
  EVENTS, getServerOffset,
} from '../../appcore-data.js';
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
                setActiveBanners(getActiveBanners());
                toast?.addToast?.('Banner data refreshed!', 'success');
              }}
              className="text-cyan-400 text-[10px] flex items-center gap-1 hover:text-cyan-300 transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <RefreshCcw size={12} /> Refresh
            </button>
            <span className="text-gray-400 text-[10px]">Server: {state.server}</span>
          </div>
        }>Time-Gated Content</CardHeader>
        <CardBody>
          {(() => {
            const eventEntries = Object.entries(EVENTS);
            const totalAstrite = eventEntries.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards, 10) || 0), 0);
            const doneKeys = eventEntries.filter(([key]) => state.eventStatus[key] === 'done');
            const skippedKeys = eventEntries.filter(([key]) => state.eventStatus[key] === 'skipped');
            const earnedAstrite = doneKeys.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards, 10) || 0), 0);
            const hasProgress = doneKeys.length > 0 || skippedKeys.length > 0;
            return (
              <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 text-xs font-medium">{hasProgress ? 'Astrite Progress' : 'Total Available Astrite'}</span>
                  <span className="text-yellow-400 font-bold text-sm">{hasProgress ? `${earnedAstrite.toLocaleString()} / ${totalAstrite.toLocaleString()}` : totalAstrite.toLocaleString()} Astrite</span>
                </div>
                {hasProgress && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full transition-[width] duration-300" style={{ width: `${totalAstrite > 0 ? (earnedAstrite / totalAstrite) * 100 : 0}%` }} />
                    </div>
                    <span className="text-gray-400 text-[10px] flex-shrink-0">{doneKeys.length}/{eventEntries.length} done</span>
                  </div>
                )}
              </div>
            );
          })()}
        </CardBody>
      </Card>
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
          return Object.entries(EVENTS).map(([key, ev]) => (
            <EventCard
              key={key}
              event={{...ev, key}}
              server={state.server}
              bannerImage={eventImageMap[key] || ev.imageUrl}
              visualSettings={visualSettings}
              status={state.eventStatus[key]}
              onStatusChange={(s) => dispatch({ type: 'SET_EVENT_STATUS', eventKey: key, status: s })}
            />
          ));
        })()}
      </div>
      <p className="text-gray-500 text-[10px] text-center content-layer sticky bottom-0 py-2" style={{ background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)' }}>Reset times based on {state.server} server (UTC{getServerOffset(state.server) >= 0 ? '+' : ''}{getServerOffset(state.server)})</p>
    </div>
    </TabErrorBoundary>
    </div>
  );
}
