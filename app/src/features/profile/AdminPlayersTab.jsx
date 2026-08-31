// ═══════════════════════════════════════════════════════════════════════════════
// AdminPlayersTab — Real-time presence chart, registered player list, privacy
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { RefreshCcw, Trash2 } from 'lucide-react';
import { t } from '../../utils/i18n.js';

export default function AdminPlayersTab({
  activePlayersCount, activePlayersHistory,
  presenceError, adminPlayerList,
  fetchActivePlayersCount, fetchAdminPlayerList, deleteLeaderboardEntry,
}) {
  const [deletingKey, setDeletingKey] = useState(null);
  const [confirmingKey, setConfirmingKey] = useState(null);

  const handleDeleteClick = async (firebaseKey) => {
    if (confirmingKey !== firebaseKey) {
      setConfirmingKey(firebaseKey);
      return;
    }
    setConfirmingKey(null);
    setDeletingKey(firebaseKey);
    try {
      await deleteLeaderboardEntry?.(firebaseKey);
    } finally {
      setDeletingKey(null);
    }
  };
  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
          <span className="text-emerald-400 text-base font-medium uppercase tracking-wider">{t('admin.players.live')}</span>
        </div>
        <div className="text-6xl font-bold text-emerald-400 kuro-number kuro-tshadow-glow-gold-lg" style={{ transition: 'opacity 0.3s ease' }}>
          {activePlayersCount !== null ? activePlayersCount : '—'}
        </div>
        <div className="text-gray-400 text-base mt-1">
          {activePlayersCount === 1 ? t('admin.players.openSession') : t('admin.players.openSessions')}
        </div>
        <div className="text-gray-400 text-sm mt-1 leading-relaxed">
          {t('admin.players.anyoneBrowsing')}
        </div>
        <div className="text-gray-400 text-sm mt-1">
          {t('admin.players.updateInterval')}
        </div>
      </div>

      {/* Activity Chart */}
      {activePlayersHistory.length > 1 && (
        <div className="bg-white/5 border border-[var(--border-medium)] rounded-lg p-3">
          <div className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">{t('admin.players.sessionActivity')}</div>
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
        <RefreshCcw size={12} className="inline mr-1.5" />{t('admin.players.refreshNow')}
      </button>

      {/* Registered Player List */}
      <div className="bg-white/5 border border-[var(--border-medium)] rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">{t('admin.players.registeredPlayers')}</div>
          <div className="text-gray-400 text-sm">{adminPlayerList ? adminPlayerList.length : '—'} {t('admin.players.total')}</div>
        </div>
        {!adminPlayerList ? (
          <div className="space-y-1.5 py-2" aria-label={t('admin.players.loadingList')}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                <div className="kuro-skeleton kuro-skeleton-text w-4 h-3 flex-shrink-0" />
                <div className="kuro-skeleton kuro-skeleton-text flex-1" style={{ width: `${60 + i * 5}%` }} />
                <div className="kuro-skeleton kuro-skeleton-text w-12 h-3 flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : adminPlayerList.length === 0 ? (
          <p className="kuro-empty-state text-gray-400 text-base text-center py-4">{t('admin.players.awaitingRegistration')}</p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto kuro-scroll">
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
                    <span className="text-gray-400 text-sm">{t('admin.players.avg')} <span className="text-yellow-400">{typeof p.avgPity === 'number' ? p.avgPity.toFixed(1) : p.avgPity}</span></span>
                    <span className="text-gray-400 text-sm">{t('admin.players.fiveStar')} <span className="text-purple-400">{p.fiveStars}</span></span>
                    <span className="text-gray-400 text-sm">{t('admin.players.convenes')} <span className="text-gray-300">{p.totalPulls}</span></span>
                    <span className="text-gray-400 text-sm">{t('admin.players.winLoss')} <span className="text-emerald-400">{p.won5050}W</span>/<span className="text-red-400">{p.lost5050}L</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <div className="text-gray-500 text-2xs text-right">
                    {p.timestamp ? new Date(p.timestamp).toLocaleDateString() : '—'}
                  </div>
                  {deleteLeaderboardEntry && (
                    <button
                      onClick={() => handleDeleteClick(p.firebaseKey)}
                      onBlur={() => setConfirmingKey(prev => prev === p.firebaseKey ? null : prev)}
                      disabled={deletingKey === p.firebaseKey}
                      className={`p-2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg transition-colors ${confirmingKey === p.firebaseKey ? 'bg-red-500/30 text-red-300' : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'}`}
                      aria-label={confirmingKey === p.firebaseKey ? t('admin.players.deleteConfirmAria') : t('admin.players.deleteAria')}
                      title={confirmingKey === p.firebaseKey ? t('admin.players.deleteConfirmTitle') : t('admin.players.deleteTitle')}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-white/5 border border-[var(--border-medium)] rounded-lg p-3 text-sm text-gray-400 space-y-1">
        <div className="text-gray-400 font-medium">{t('admin.players.privacyTitle')}</div>
        <p>{t('admin.players.privacyOpenSessions')}</p>
        <p>{t('admin.players.privacyRegistered')}</p>
      </div>

      {/* Error Display */}
      {presenceError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 space-y-1.5">
          <div className="font-medium">⚠ {t('admin.players.presenceErrorTitle')}</div>
          <p>{presenceError}</p>
          <div className="text-red-400/70 text-sm space-y-0.5">
            <p className="font-medium">{t('admin.players.presenceErrorFix')}</p>
            <pre className="bg-black/30 rounded p-2 text-sm overflow-x-auto font-mono whitespace-pre">
{`"presence": {
  ".read": true,
  ".write": true
}`}
            </pre>
            <p>{t('admin.players.presenceErrorConsole')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
