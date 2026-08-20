// ═══════════════════════════════════════════════════════════════════════════════
// AdminPlayersTab — Real-time presence chart, registered player list, privacy
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { t } from '../../utils/i18n.js';

export default function AdminPlayersTab({
  activePlayersCount, activePlayersHistory,
  presenceError, adminPlayerList,
  fetchActivePlayersCount, fetchAdminPlayerList,
}) {
  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
          <span className="text-emerald-400 text-base font-medium uppercase tracking-wider">Live</span>
        </div>
        <div className="text-6xl font-bold text-emerald-400 kuro-number kuro-tshadow-glow-gold-lg" style={{ transition: 'opacity 0.3s ease' }}>
          {activePlayersCount !== null ? activePlayersCount : '—'}
        </div>
        <div className="text-gray-400 text-base mt-1">
          {activePlayersCount === 1 ? 'Open Session' : 'Open Sessions'}
        </div>
        <div className="text-gray-400 text-sm mt-1 leading-relaxed">
          Anyone browsing the app — includes visitors who haven't imported data or submitted to the leaderboard
        </div>
        <div className="text-gray-400 text-sm mt-1">
          Updates every 30s • Heartbeat: 60s • Timeout: 2min
        </div>
      </div>

      {/* Activity Chart */}
      {activePlayersHistory.length > 1 && (
        <div className="bg-white/5 border border-[var(--border-medium)] rounded-lg p-3">
          <div className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">Session Activity</div>
          <div className="h-24">
            {(() => {
              const data = activePlayersHistory;
              const W = 300, H = 96, PAD = { top: 5, right: 5, bottom: 16, left: 25 };
              const cW = W - PAD.left - PAD.right, cH = H - PAD.top - PAD.bottom;
              const maxVal = Math.max(...data.map(d => d.count), 1);
              const pts = data.map((d, i) => ({
                x: PAD.left + (data.length > 1 ? (i / (data.length - 1)) * cW : cW / 2),
                y: PAD.top + cH - (d.count / maxVal) * cH,
                ...d,
              }));
              const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
              const area = `${line} L${pts[pts.length - 1].x},${PAD.top + cH} L${pts[0].x},${PAD.top + cH} Z`;
              return (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="presenceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <path d={area} fill="url(#presenceGrad)" />
                  <path d={line} fill="none" stroke="#34d399" strokeWidth="2" />
                  {pts.filter((_, i) => i === 0 || i === pts.length - 1).map((p, i) => (
                    <text key={i} x={p.x} y={H - 2} textAnchor={i === 0 ? 'start' : 'end'} fill="#8892a4" fontSize="9" fontFamily="var(--font-data)">{p.time}</text>
                  ))}
                  {[0, maxVal].map(v => (
                    <text key={v} x={PAD.left - 4} y={PAD.top + cH - (v / maxVal) * cH + 3} textAnchor="end" fill="#8892a4" fontSize="9" fontFamily="var(--font-data)">{v}</text>
                  ))}
                </svg>
              );
            })()}
          </div>
        </div>
      )}

      <button
        onClick={() => { fetchActivePlayersCount(); fetchAdminPlayerList(); }}
        className="kuro-btn w-full py-2 text-base active-emerald"
      >
        <RefreshCcw size={12} className="inline mr-1.5" />Refresh Now
      </button>

      {/* Registered Player List */}
      <div className="bg-white/5 border border-[var(--border-medium)] rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">Registered Players</div>
          <div className="text-gray-400 text-sm">{adminPlayerList ? adminPlayerList.length : '—'} total</div>
        </div>
        {!adminPlayerList ? (
          <div className="space-y-1.5 py-2" aria-label="Loading player list">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                <div className="kuro-skeleton kuro-skeleton-text w-4 h-3 flex-shrink-0" />
                <div className="kuro-skeleton kuro-skeleton-text flex-1" style={{ width: `${60 + i * 5}%` }} />
                <div className="kuro-skeleton kuro-skeleton-text w-12 h-3 flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : adminPlayerList.length === 0 ? (
          <p className="kuro-empty-state text-gray-400 text-base text-center py-4">Awaiting operative registration</p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto kuro-scroll">
            {adminPlayerList.map((p, i) => (
              <div key={p.firebaseKey} className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm w-4 text-right flex-shrink-0">{i + 1}</span>
                    <span className="text-white text-base font-mono font-medium truncate">{p.uid || p.id}</span>
                    {p.uid && p.id !== p.uid && (
                      <span className="text-gray-500 text-2xs font-mono flex-shrink-0">({p.id.slice(0, 6)}…)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-6 mt-0.5">
                    <span className="text-gray-400 text-sm">Avg: <span className="text-yellow-400">{typeof p.avgPity === 'number' ? p.avgPity.toFixed(1) : p.avgPity}</span></span>
                    <span className="text-gray-400 text-sm">5★: <span className="text-purple-400">{p.fiveStars}</span></span>
                    <span className="text-gray-400 text-sm">Convenes: <span className="text-gray-300">{p.totalPulls}</span></span>
                    <span className="text-gray-400 text-sm">50/50: <span className="text-emerald-400">{p.won5050}W</span>/<span className="text-red-400">{p.lost5050}L</span></span>
                  </div>
                </div>
                <div className="text-gray-500 text-2xs text-right flex-shrink-0 ml-2">
                  {p.timestamp ? new Date(p.timestamp).toLocaleDateString() : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-white/5 border border-[var(--border-medium)] rounded-lg p-3 text-sm text-gray-400 space-y-1">
        <div className="text-gray-400 font-medium">Privacy</div>
        <p><span className="text-emerald-400/80">Open Sessions</span> = every open tab/browser visiting the app. Tracked via anonymous heartbeat. Just a random session ID and a timestamp. No UID, no device info, no IP, no personal data stored. Sessions expire after 2 minutes of inactivity.</p>
        <p><span className="text-gray-300">Registered Players</span> = users who submitted their score to the leaderboard. This list shows their full UID and stats, visible only in this admin panel. The public leaderboard always shows masked IDs.</p>
      </div>

      {/* Error Display */}
      {presenceError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 space-y-1.5">
          <div className="font-medium">⚠ Presence Error</div>
          <p>{presenceError}</p>
          <div className="text-red-400/70 text-sm space-y-0.5">
            <p className="font-medium">Fix: Add this Firebase rule:</p>
            <pre className="bg-black/30 rounded p-2 text-sm overflow-x-auto font-mono whitespace-pre">
{`"presence": {
  ".read": true,
  ".write": true
}`}
            </pre>
            <p>Firebase Console → Realtime Database → Rules</p>
          </div>
        </div>
      )}
    </div>
  );
}
