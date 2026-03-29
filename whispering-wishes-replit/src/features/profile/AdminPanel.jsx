// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — AdminPanel (extracted from ProfileTab)
// Admin panel modal + mini window for banner editing, visual settings,
// player presence, trophy editing, collection image management
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, ClipboardList, Minus, Plus, RefreshCcw, Settings, X } from 'lucide-react';
import { APP_VERSION, DEFAULT_COLLECTION_IMAGES, CURRENT_BANNERS } from '../../appcore-data.js';
import {
  Card, CardHeader, CardBody,
  KuroSelect, CollectionGridSection, VisualSliderGroup, VISUAL_SLIDER_CONFIGS,
  ADMIN_BANNER_KEY,
  hideOnError,
} from '../../appcore-components.jsx';
import { storageAvailable } from '../../appcore-engine.js';
import { FocusTrapModal } from '../../appcore-providers.jsx';
import { XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TROPHY_OVERRIDES_KEY = 'whispering-wishes-trophy-overrides-v1';
const ALLOWED_IMAGE_HOSTS = ['i.ibb.co', 'ibb.co', 'i.imgur.com', 'imgur.com', 'cdn.discordapp.com', 'media.discordapp.net', 'pbs.twimg.com', 'raw.githubusercontent.com', 'i.postimg.cc', 'wuwa.gg', 'wuwatracker.com'];

export default function AdminPanel({
  showAdminPanel, setShowAdminPanel,
  adminUnlocked, setAdminUnlocked,
  adminPassword, setAdminPassword,
  adminTab, setAdminTab,
  adminMiniMode, setAdminMiniMode,
  bannerForm, setBannerForm,
  trophyJsonInput, setTrophyJsonInput,
  activePlayersCount, activePlayersHistory,
  presenceError, adminPlayerList,
  adminLockedUntil,
  trophies,
  fetchActivePlayersCount, fetchAdminPlayerList,
  trophyOverrides, setTrophyOverrides,
  verifyAdminPassword, saveCustomBanners,
  buildBannerForm, updateBannerForm,
  visualSettings, saveVisualSettings,
  customCollectionImages, saveCollectionImages, collectionImages,
  activeBanners, setActiveBanners,
  imageFraming, framingMode, setFramingMode,
  editingImage, setEditingImage,
  getImageFraming, updateEditingFraming, resetEditingFraming,
  miniPanelPosition, saveMiniPanelPosition, getMiniPanelPositionClasses,
  state, dispatch, toast, confirm,
  adminTrapRef,
  setActiveTab,
  withCacheBuster,
  detailModal,
  saveImageFraming,
  DEFAULT_VISUAL_SETTINGS,
}) {
  if (!showAdminPanel) return null;
  return (
    <>
      {/* Admin Panel Modal */}
      <FocusTrapModal isOpen={showAdminPanel && !adminMiniMode} onClose={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} className="" onClick={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} ariaLabel="Admin panel" centered>
          <div className="kuro-card w-full max-w-2xl max-h-[90vh]" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="kuro-card-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
            <CardHeader action={<button onClick={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close admin panel"><X size={16} /></button>}>
              <span className="flex items-center gap-2"><Settings size={16} /> Admin Panel</span>
            </CardHeader>
            <div className="kuro-body space-y-3" style={{ overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
              {!adminUnlocked ? (
                <div className="space-y-3">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                    <p className="text-yellow-400 text-sm font-medium">Admin Access Required</p>
                    <p className="text-gray-400 text-[10px] mt-1">Enter admin password to continue</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && verifyAdminPassword()}
                      className="kuro-input flex-1 text-sm"
                      aria-label="Admin password"
                      aria-invalid={adminLockedUntil > Date.now() ? true : undefined}
                      aria-describedby={adminLockedUntil > Date.now() ? 'admin-lockout-msg' : undefined}
                    />
                    <button onClick={verifyAdminPassword} className="kuro-btn px-4" aria-label="Unlock admin panel">Unlock</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 text-center">
                    <p className="text-emerald-400 text-xs">Admin Panel Unlocked</p>
                  </div>

                  {/* Admin Tab Switcher */}
                  <div className="flex gap-2 border-b border-[var(--border-medium)] pb-2 flex-wrap">
                    <button
                      onClick={() => setAdminTab('banners')}
                      className={`px-3 py-1.5 rounded text-[10px] transition-all ${adminTab === 'banners' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : 'text-gray-400 hover:text-white border border-[var(--border-medium)]'}`}
                    >
                      Banners
                    </button>
                    <button
                      onClick={() => setAdminTab('collection')}
                      className={`px-3 py-1.5 rounded text-[10px] transition-all ${adminTab === 'collection' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white border border-[var(--border-medium)]'}`}
                    >
                      Collection
                    </button>
                    <button
                      onClick={() => setAdminTab('visuals')}
                      className={`px-3 py-1.5 rounded text-[10px] transition-all ${adminTab === 'visuals' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white border border-[var(--border-medium)]'}`}
                    >
                      Visual Settings
                    </button>
                    <button
                      onClick={() => setAdminTab('trophies')}
                      className={`px-3 py-1.5 rounded text-[10px] transition-all ${adminTab === 'trophies' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-gray-400 hover:text-white border border-[var(--border-medium)]'}`}
                    >
                      Trophies
                    </button>
                    <button
                      onClick={() => setAdminTab('players')}
                      className={`px-3 py-1.5 rounded text-[10px] transition-all ${adminTab === 'players' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white border border-[var(--border-medium)]'}`}
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />Players
                    </button>
                  </div>

                  {/* Collection Tab */}
                  {adminTab === 'collection' && (
                    <div className="space-y-4">
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <h3 className="text-purple-400 text-sm font-medium mb-3">Collection Images</h3>
                        <p className="text-gray-400 text-[10px] mb-3">Most resonators have built-in images. Add custom URLs to override or add missing ones.</p>
                        
                        {/* Get unique names from history */}
                        {(() => {
                          const allHistory = [
                            ...state.profile.featured.history,
                            ...state.profile.weapon.history,
                            ...(state.profile.standardChar?.history || []),
                            ...(state.profile.standardWeap?.history || [])
                          ];
                          const uniqueNames = [...new Set(allHistory.filter(p => p.rarity >= 4 && p.name).map(p => p.name))].sort();
                          
                          if (uniqueNames.length === 0) {
                            return <div className="kuro-empty-state text-center py-4"><p className="text-gray-500 text-xs">Import Convene data to populate your archive</p><button onClick={() => setActiveTab('profile')} className="kuro-btn kuro-btn-primary text-[10px] mt-2 px-3 py-1.5">Go to Import</button></div>;
                          }
                          
                          return (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                              {uniqueNames.map(name => {
                                const hasDefault = DEFAULT_COLLECTION_IMAGES[name];
                                const hasCustom = customCollectionImages[name];
                                const displayUrl = collectionImages[name];
                                return (
                                  <div key={name} className="flex items-center gap-2">
                                    <span className={`text-[10px] w-32 truncate ${hasDefault ? 'text-gray-300' : 'text-yellow-400'}`} title={hasDefault ? name : `${name} (no default)`}>
                                      {name} {!hasDefault && '⚠'}
                                    </span>
                                    <input
                                      type="text"
                                      placeholder={hasDefault ? "(using default)" : "https://i.ibb.co/..."}
                                      value={hasCustom || ''}
                                      onChange={(e) => {
                                        const val = e.target.value.trim();
                                        const newCustom = { ...customCollectionImages };
                                        if (val) {
                                          if (val.length > 5 && !/^https:\/\//i.test(val)) return; // Enforce HTTPS-only URLs
                                          // P15-FIX: MEDIUM-3 — Validate against domain allowlist
                                          if (val.length > 10) { try { const h = new URL(val).hostname; if (!ALLOWED_IMAGE_HOSTS.some(d => h === d || h.endsWith('.'+d))) return; } catch { return; } }
                                          newCustom[name] = val;
                                        } else {
                                          delete newCustom[name];
                                        }
                                        saveCollectionImages(newCustom);
                                      }}
                                      className={`kuro-input flex-1 text-[10px] py-1 ${hasCustom ? 'border-purple-500/50' : ''}`}
                                    />
                                    {displayUrl && (
                                      <img
                                        src={displayUrl}
                                        alt={name}
                                        className="w-[28px] h-[28px] object-cover rounded border border-purple-500/30"
                                        loading="lazy"
                                        onError={hideOnError}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={async () => { if (await confirm({ title: 'Clear overrides', message: 'Clear all custom image overrides?', confirmLabel: 'Clear', destructive: true })) saveCollectionImages({}); }}
                          className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/30"
                        >
                          Clear Custom Overrides
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Visual Settings Tab */}
                  {adminTab === 'visuals' && (
                    <div className="space-y-4">
                      {VISUAL_SLIDER_CONFIGS.map(cfg => (
                        <React.Fragment key={cfg.color}>
                          {cfg.subtitle && (
                            <div className={`${cfg.color === 'purple' ? 'bg-purple-500/10 border border-purple-500/30' : ''} rounded p-3`}>
                              <VisualSliderGroup
                                title={cfg.title} color={cfg.color} sliders={cfg.sliders}
                                visualSettings={visualSettings} saveVisualSettings={saveVisualSettings}
                                directionControl={cfg.directionControl}
                              />
                            </div>
                          )}
                          {!cfg.subtitle && (
                            <VisualSliderGroup
                              title={cfg.title} color={cfg.color} sliders={cfg.sliders}
                              visualSettings={visualSettings} saveVisualSettings={saveVisualSettings}
                              directionControl={cfg.directionControl}
                            />
                          )}
                        </React.Fragment>
                      ))}

                      <div className="flex gap-2">
                        <button
                          onClick={() => setAdminMiniMode(true)}
                          className="flex-1 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded text-xs hover:bg-emerald-500/30"
                        >
                          🗗 Mini Window
                        </button>
                        <button
                          onClick={async () => { if (await confirm({ title: 'Reset settings', message: 'Reset all visual settings to defaults?', confirmLabel: 'Reset', destructive: true })) saveVisualSettings(DEFAULT_VISUAL_SETTINGS); }}
                          className="flex-1 px-4 py-2 bg-neutral-700 text-gray-300 rounded text-xs hover:bg-neutral-600"
                        >
                          Reset to Defaults
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Players Tab — Anonymous real-time presence */}
                  {adminTab === 'players' && (
                    <div className="space-y-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                          <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">Live</span>
                        </div>
                        <div className="text-5xl font-bold text-emerald-400 kuro-number" style={{ textShadow: '0 0 20px rgba(52,211,153,0.4)', transition: 'opacity 0.3s ease' }}>
                          {activePlayersCount !== null ? activePlayersCount : '—'}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                          {activePlayersCount === 1 ? 'Open Session' : 'Open Sessions'}
                        </div>
                        <div className="text-gray-400 text-[10px] mt-1 leading-relaxed">
                          Anyone browsing the app — includes visitors who haven't imported data or submitted to the leaderboard
                        </div>
                        <div className="text-gray-400 text-[10px] mt-1">
                          Updates every 30s • Heartbeat: 60s • Timeout: 2min
                        </div>
                      </div>
                      
                      {/* Activity Chart */}
                      {activePlayersHistory.length > 1 && (
                        <div className="bg-white/5 border border-[var(--border-medium)] rounded-lg p-3">
                          <div className="text-gray-400 text-[10px] font-medium mb-2 uppercase tracking-wider">Session Activity</div>
                          <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={activePlayersHistory}>
                                <defs>
                                  <linearGradient id="presenceGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="time" tick={{ fill: '#8892a4', fontSize: 9, fontFamily: 'var(--font-data)' }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} interval="preserveStartEnd" />
                                <YAxis tick={{ fill: '#8892a4', fontSize: 9, fontFamily: 'var(--font-data)' }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
                                <Area type="monotone" dataKey="count" stroke="#34d399" strokeWidth={2} fill="url(#presenceGrad)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                      
                      {/* Refresh Button */}
                      <button 
                        onClick={() => { fetchActivePlayersCount(); fetchAdminPlayerList(); }}
                        className="kuro-btn w-full py-2 text-xs active-emerald"
                      >
                        <RefreshCcw size={12} className="inline mr-1.5" />Refresh Now
                      </button>
                      
                      {/* Admin Player List — full UIDs visible only here */}
                      <div className="bg-white/5 border border-[var(--border-medium)] rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">Registered Players</div>
                          <div className="text-gray-400 text-[10px]">{adminPlayerList ? adminPlayerList.length : '—'} total</div>
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
                          <p className="kuro-empty-state text-gray-500 text-xs text-center py-4">Awaiting operative registration</p>
                        ) : (
                          <div className="space-y-1 max-h-72 overflow-y-auto kuro-scroll">
                            {adminPlayerList.map((p, i) => (
                              <div key={p.firebaseKey} className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-[10px] w-4 text-right flex-shrink-0">{i + 1}</span>
                                    <span className="text-white text-xs font-mono font-medium truncate">{p.uid || p.id}</span>
                                    {p.uid && p.id !== p.uid && (
                                      <span className="text-gray-500 text-[8px] font-mono flex-shrink-0">({p.id.slice(0, 6)}…)</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 ml-6 mt-0.5">
                                    <span className="text-gray-400 text-[10px]">Avg: <span className="text-yellow-400">{typeof p.avgPity === 'number' ? p.avgPity.toFixed(1) : p.avgPity}</span></span>
                                    <span className="text-gray-400 text-[10px]">5★: <span className="text-purple-400">{p.fiveStars}</span></span>
                                    <span className="text-gray-400 text-[10px]">Convenes: <span className="text-gray-300">{p.totalPulls}</span></span>
                                    <span className="text-gray-400 text-[10px]">50/50: <span className="text-emerald-400">{p.won5050}W</span>/<span className="text-red-400">{p.lost5050}L</span></span>
                                  </div>
                                </div>
                                <div className="text-gray-500 text-[8px] text-right flex-shrink-0 ml-2">
                                  {p.timestamp ? new Date(p.timestamp).toLocaleDateString() : '—'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Privacy Notice */}
                      <div className="bg-white/5 border border-[var(--border-medium)] rounded-lg p-3 text-[10px] text-gray-400 space-y-1">
                        <div className="text-gray-400 font-medium">🔒 Privacy</div>
                        <p><span className="text-emerald-400/80">Open Sessions</span> = every open tab/browser visiting the app. Tracked via anonymous heartbeat — just a random session ID and a timestamp. No UID, no device info, no IP, no personal data stored. Sessions expire after 2 minutes of inactivity.</p>
                        <p><span className="text-gray-300">Registered Players</span> = users who submitted their score to the leaderboard. This list shows their full UID and stats — visible only in this admin panel. The public leaderboard always shows masked IDs.</p>
                      </div>
                      
                      {/* Error Display */}
                      {presenceError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-[10px] text-red-400 space-y-1.5">
                          <div className="font-medium">⚠ Presence Error</div>
                          <p>{presenceError}</p>
                          <div className="text-red-400/70 text-[10px] space-y-0.5">
                            <p className="font-medium">Fix: Add this Firebase rule:</p>
                            <pre className="bg-black/30 rounded p-2 text-[10px] overflow-x-auto font-mono whitespace-pre">
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
                  )}

                  {/* Trophies Tab */}
                  {adminTab === 'trophies' && (
                    <div className="space-y-4">
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <h3 className="text-amber-400 text-sm font-medium mb-2">Trophy Name Editor</h3>
                        <p className="text-gray-400 text-[10px] mb-3">Override trophy names and descriptions. Paste a JSON object where keys are trophy IDs and values have <code className="text-amber-400/80">name</code> and/or <code className="text-amber-400/80">desc</code> fields.</p>

                        {/* Current trophies list — read-only reference */}
                        <div className="mb-3">
                          <div className="text-gray-400 text-[10px] font-medium mb-1 uppercase tracking-wider">Current Trophies ({trophies?.list?.length || 0})</div>
                          <div className="max-h-[200px] overflow-y-auto kuro-scroll bg-black/30 rounded border border-[var(--border-medium)] p-2 space-y-0.5">
                            {(trophies?.list || []).map(t => (
                              <div key={t.id} className="flex items-center gap-2 py-0.5">
                                <span className="text-[10px] font-mono text-gray-500 w-20 flex-shrink-0 truncate" title={t.id}>{t.id}</span>
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                                <span className={`text-[10px] flex-1 truncate ${trophyOverrides[t.id] ? 'text-amber-400' : 'text-gray-300'}`} title={t.name}>{t.name}</span>
                                <span className="text-[8px] text-gray-500 flex-shrink-0">{t.name.length}ch</span>
                              </div>
                            ))}
                            {(!trophies?.list || trophies.list.length === 0) && (
                              <div className="kuro-empty-state text-center py-4"><p className="text-gray-500 text-xs">Import Convene data to unlock achievements</p><button onClick={() => setActiveTab('profile')} className="kuro-btn kuro-btn-primary text-[10px] mt-2 px-3 py-1.5">Go to Import</button></div>
                            )}
                          </div>
                        </div>

                        {/* Export current as JSON */}
                        <button
                          onClick={() => {
                            const data = {};
                            (trophies?.list || []).forEach(t => { data[t.id] = { name: t.name, desc: t.desc }; });
                            navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
                            toast?.addToast?.('Trophy data copied to clipboard', 'success');
                          }}
                          className="w-full mb-3 px-3 py-1.5 bg-white/5 border border-[var(--border-medium)] text-gray-300 rounded text-[10px] hover:bg-white/10 transition-colors"
                        >
                          Export Current Trophies as JSON
                        </button>

                        {/* JSON import textarea */}
                        <div className="text-gray-400 text-[10px] font-medium mb-1 uppercase tracking-wider">Import Overrides (JSON)</div>
                        <textarea
                          className="kuro-input w-full h-40 text-[10px] font-mono"
                          value={trophyJsonInput}
                          onChange={(e) => setTrophyJsonInput(e.target.value)}
                          placeholder={'{\n  "pity1": { "name": "New Name Here", "desc": "New description" },\n  "win7": { "name": "Another Name" }\n}'}
                          aria-label="Trophy overrides JSON input"
                        />
                        <p className="text-gray-400 text-[10px] mt-1 mb-2">Only include trophies you want to rename. Omit <code className="text-amber-400/60">desc</code> to keep the original description.</p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              try {
                                const parsed = JSON.parse(trophyJsonInput);
                                if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Must be a JSON object');
                                const cleaned = {};
                                let count = 0;
                                for (const [id, val] of Object.entries(parsed)) {
                                  if (typeof val !== 'object' || !val) continue;
                                  const entry = {};
                                  if (val.name && typeof val.name === 'string') entry.name = val.name.trim();
                                  if (val.desc && typeof val.desc === 'string') entry.desc = val.desc.trim();
                                  if (Object.keys(entry).length > 0) { cleaned[id] = entry; count++; }
                                }
                                setTrophyOverrides(cleaned);
                                try { localStorage.setItem(TROPHY_OVERRIDES_KEY, JSON.stringify(cleaned)); } catch {}
                                toast?.addToast?.(`Applied ${count} trophy override${count !== 1 ? 's' : ''}`, 'success');
                              } catch (e) {
                                toast?.addToast?.('Invalid JSON: ' + e.message, 'error');
                              }
                            }}
                            className="kuro-btn flex-1 text-xs"
                          >
                            Apply Overrides
                          </button>
                          <button
                            onClick={async () => {
                              if (!await confirm({ title: 'Clear overrides', message: 'Clear all trophy name overrides?', confirmLabel: 'Clear', destructive: true })) return;
                              setTrophyOverrides({});
                              setTrophyJsonInput('');
                              try { localStorage.removeItem(TROPHY_OVERRIDES_KEY); } catch {}
                              toast?.addToast?.('Trophy overrides cleared', 'success');
                            }}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/30"
                          >
                            Clear All
                          </button>
                        </div>

                        {/* Active overrides count */}
                        {Object.keys(trophyOverrides).length > 0 && (
                          <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded p-2 text-[10px] text-amber-400">
                            {Object.keys(trophyOverrides).length} active override{Object.keys(trophyOverrides).length !== 1 ? 's' : ''}: {Object.keys(trophyOverrides).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Banners Tab */}
                  {adminTab === 'banners' && (
                    <>
                    <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Quick Banner Update</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Version (e.g., 3.1)"
                        value={bannerForm.version}
                        onChange={(e) => updateBannerForm('version', e.target.value)}
                        className="kuro-input text-[10px] py-1"
                        aria-label="Banner version"
                      />
                      <input
                        type="number"
                        placeholder="e.g. 1"
                        value={bannerForm.phase}
                        onChange={(e) => updateBannerForm('phase', e.target.value)}
                        className="kuro-input text-[10px] py-1"
                        aria-label="Banner phase"
                      />
                      <input
                        type="datetime-local"
                        placeholder="Start Date"
                        value={bannerForm.startDate}
                        onChange={(e) => updateBannerForm('startDate', e.target.value)}
                        className="kuro-input text-[10px] py-1"
                        aria-label="Banner start date"
                      />
                      <input
                        type="datetime-local"
                        placeholder="End Date"
                        value={bannerForm.endDate}
                        onChange={(e) => updateBannerForm('endDate', e.target.value)}
                        className="kuro-input text-[10px] py-1"
                        aria-label="Banner end date"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Featured Resonators (JSON)</h3>
                    <textarea
                      className="kuro-input w-full h-32 text-[10px] font-mono"
                      value={bannerForm.charsJson}
                      onChange={(e) => updateBannerForm('charsJson', e.target.value)}
                      placeholder="Paste characters array JSON"
                      aria-label="Featured resonators JSON"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Featured Weapons (JSON)</h3>
                    <textarea
                      className="kuro-input w-full h-32 text-[10px] font-mono"
                      value={bannerForm.weapsJson}
                      onChange={(e) => updateBannerForm('weapsJson', e.target.value)}
                      placeholder="Paste weapons array JSON"
                      aria-label="Featured weapons JSON"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Resonator Images</h3>
                    <div className="space-y-1">
                      {activeBanners.characters.map((c, i) => (
                        <div key={c.id} className="flex items-center gap-2">
                          <span className="text-gray-300 text-[10px] w-20 truncate">{c.name}</span>
                          <input
                            type="text"
                            placeholder="https://i.ibb.co/..."
                            value={bannerForm.charImages[i] ?? ''}
                            onChange={(e) => setBannerForm(prev => ({ ...prev, charImages: { ...prev.charImages, [i]: e.target.value } }))}
                            className="kuro-input flex-1 text-[10px] py-1"
                            aria-label={`${c.name} image URL`}
                          />
                          <input
                            type="text"
                            placeholder="center 20%"
                            value={bannerForm.charImagePositions[i] ?? ''}
                            onChange={(e) => setBannerForm(prev => ({ ...prev, charImagePositions: { ...prev.charImagePositions, [i]: e.target.value } }))}
                            className="kuro-input w-24 text-[10px] py-1"
                            aria-label={`${c.name} image position`}
                            title="CSS object-position (e.g. center 20%)"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Weapon Images</h3>
                    <div className="space-y-1">
                      {activeBanners.weapons.map((w, i) => (
                        <div key={w.id} className="flex items-center gap-2">
                          <span className="text-gray-300 text-[10px] w-20 truncate">{w.name}</span>
                          <input
                            type="text"
                            placeholder="https://i.ibb.co/..."
                            value={bannerForm.weapImages[i] ?? ''}
                            onChange={(e) => setBannerForm(prev => ({ ...prev, weapImages: { ...prev.weapImages, [i]: e.target.value } }))}
                            className="kuro-input flex-1 text-[10px] py-1"
                            aria-label={`${w.name} image URL`}
                          />
                          <input
                            type="text"
                            placeholder="center 30%"
                            value={bannerForm.weapImagePositions[i] ?? ''}
                            onChange={(e) => setBannerForm(prev => ({ ...prev, weapImagePositions: { ...prev.weapImagePositions, [i]: e.target.value } }))}
                            className="kuro-input w-24 text-[10px] py-1"
                            aria-label={`${w.name} image position`}
                            title="CSS object-position (e.g. center 30%)"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Standard Banner Images</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Tidal Chorus</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          value={bannerForm.standardCharImg}
                          onChange={(e) => updateBannerForm('standardCharImg', e.target.value)}
                          className="kuro-input flex-1 text-[10px] py-1"
                          aria-label="Tidal Chorus banner image URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Winter Brume</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          value={bannerForm.standardWeapImg}
                          onChange={(e) => updateBannerForm('standardWeapImg', e.target.value)}
                          className="kuro-input flex-1 text-[10px] py-1"
                          aria-label="Winter Brume banner image URL"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Event Banner Images</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Whimpering Wastes</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          value={bannerForm.wwImg}
                          onChange={(e) => updateBannerForm('wwImg', e.target.value)}
                          className="kuro-input flex-1 text-[10px] py-1"
                          aria-label="Whimpering Wastes image URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Doubled Pawns</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          value={bannerForm.dpImg}
                          onChange={(e) => updateBannerForm('dpImg', e.target.value)}
                          className="kuro-input flex-1 text-[10px] py-1"
                          aria-label="Doubled Pawns image URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Tower of Adversity</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          value={bannerForm.toaImg}
                          onChange={(e) => updateBannerForm('toaImg', e.target.value)}
                          className="kuro-input flex-1 text-[10px] py-1"
                          aria-label="Tower of Adversity image URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Illusive Realm</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          value={bannerForm.irImg}
                          onChange={(e) => updateBannerForm('irImg', e.target.value)}
                          className="kuro-input flex-1 text-[10px] py-1"
                          aria-label="Illusive Realm image URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Daily Reset</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          value={bannerForm.drImg}
                          onChange={(e) => updateBannerForm('drImg', e.target.value)}
                          className="kuro-input flex-1 text-[10px] py-1"
                          aria-label="Daily Reset image URL"
                        />
                      </div>
                    </div>
                    <p className="text-gray-400 text-[10px]">Paste direct image URLs from ibb.co (use i.ibb.co links)</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        try {
                          // P6-FIX: Read from controlled bannerForm state, not DOM (HIGH-17)
                          const chars = JSON.parse(bannerForm.charsJson);
                          const weaps = JSON.parse(bannerForm.weapsJson);
                          if (!Array.isArray(chars) || !Array.isArray(weaps)) throw new Error('Characters and weapons must be arrays');
                          if (chars.length === 0) throw new Error('At least one character required');
                          if (weaps.length === 0) throw new Error('At least one weapon required');
                          // P10-FIX: Validate all image URLs are HTTPS to prevent mixed-content and tracking (Step 6 audit)
                          const validateImgUrl = (url, label) => {
                            if (!url) return;
                            try { 
                              const u = new URL(url);
                              if (u.protocol !== 'https:') throw new Error(`${label} must use HTTPS`);
                            } catch (e) {
                              if (e.message.includes('HTTPS')) throw e;
                              throw new Error(`${label} has an invalid URL`);
                            }
                          };
                          chars.forEach((c, i) => {
                            if (!c.id || !c.name) throw new Error(`Character ${i + 1} missing id or name`);
                            const img = (bannerForm.charImages[i] ?? '').trim();
                            if (img) { validateImgUrl(img, `Character ${i + 1} image`); c.imageUrl = img; }
                            const pos = (bannerForm.charImagePositions[i] ?? '').trim();
                            if (pos) c.imagePosition = pos;
                          });
                          weaps.forEach((w, i) => {
                            if (!w.id || !w.name) throw new Error(`Weapon ${i + 1} missing id or name`);
                            const img = (bannerForm.weapImages[i] ?? '').trim();
                            if (img) { validateImgUrl(img, `Weapon ${i + 1} image`); w.imageUrl = img; }
                            const pos = (bannerForm.weapImagePositions[i] ?? '').trim();
                            if (pos) w.imagePosition = pos;
                          });
                          const startDate = new Date(bannerForm.startDate);
                          const endDate = new Date(bannerForm.endDate);
                          if (isNaN(startDate.getTime())) throw new Error('Invalid start date');
                          if (isNaN(endDate.getTime())) throw new Error('Invalid end date');
                          if (endDate <= startDate) throw new Error('End date must be after start date');
                          // P10-FIX: Validate all static image URLs too (Step 6 audit)
                          [bannerForm.standardCharImg, bannerForm.standardWeapImg, bannerForm.wwImg, bannerForm.dpImg, bannerForm.toaImg, bannerForm.irImg, bannerForm.drImg].forEach((url, i) => {
                            const labels = ['Standard char banner', 'Standard weap banner', 'Whimpering Wastes', 'Doubled Pawns', 'Tower of Adversity', 'Illusive Realm', 'Daily reset'];
                            if (url?.trim()) validateImgUrl(url.trim(), labels[i] + ' image');
                          });
                          const newBanners = {
                            ...activeBanners,
                            version: bannerForm.version || '1.0',
                            phase: parseInt(bannerForm.phase, 10) || 1,
                            startDate: startDate.toISOString(),
                            endDate: endDate.toISOString(),
                            characters: chars,
                            weapons: weaps,
                            standardCharBannerImage: bannerForm.standardCharImg.trim(),
                            standardWeapBannerImage: bannerForm.standardWeapImg.trim(),
                            whimperingWastesImage: bannerForm.wwImg.trim(),
                            doubledPawnsImage: bannerForm.dpImg.trim(),
                            towerOfAdversityImage: bannerForm.toaImg.trim(),
                            illusiveRealmImage: bannerForm.irImg.trim(),
                            dailyResetImage: bannerForm.drImg.trim(),
                          };
                          saveCustomBanners(newBanners);
                          setShowAdminPanel(false);
                          setAdminUnlocked(false);
                          setAdminPassword('');
                        } catch (e) {
                          toast?.addToast?.('Invalid data: ' + e.message, 'error');
                        }
                      }}
                      className="kuro-btn flex-1"
                    >
                      Save Banner Updates
                    </button>
                    <button
                      onClick={async () => {
                        if (!await confirm({ title: 'Reset banners', message: 'Reset to default banners?\nCustom banner data will be lost.', confirmLabel: 'Reset', destructive: true })) return;
                        if (storageAvailable) {
                          try { localStorage.removeItem(ADMIN_BANNER_KEY); } catch {}
                        }
                        setActiveBanners(CURRENT_BANNERS);
                        toast?.addToast?.('Reset to default banners', 'success');
                      }}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-xs hover:bg-red-500/30"
                    >
                      Reset
                    </button>
                  </div>
                    </>
                  )}
                </>
              )}
            </div>
            </div>
          </div>
      </FocusTrapModal>

      {/* Admin Mini Window — portaled to body */}
      {showAdminPanel && adminMiniMode && adminUnlocked && createPortal(
        <div
          className={`fixed z-[9999] w-72 max-h-[50vh] overflow-auto rounded-xl border-2 border-cyan-500/50 bg-neutral-900/95 backdrop-blur-md shadow-2xl ${getMiniPanelPositionClasses()}`}
          style={{ 
            boxShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 20px rgba(34,211,238,0.3)'
          }}
        >
          <div className="sticky top-0 bg-cyan-900/40 border-b border-cyan-500/30 p-2.5 flex items-center justify-between">
            <span className="text-cyan-300 text-[10px] font-bold flex items-center gap-1.5"><Settings size={14} /> Visual Settings</span>
            <div className="flex gap-1">
              {/* Corner position buttons */}
              <div className="flex gap-0.5 mr-1">
                <button onClick={() => saveMiniPanelPosition('top-left')} aria-label="Move to top-left" className={`w-5 h-5 rounded text-[8px] ${miniPanelPosition === 'top-left' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↖</button>
                <button onClick={() => saveMiniPanelPosition('top-right')} aria-label="Move to top-right" className={`w-5 h-5 rounded text-[8px] ${miniPanelPosition === 'top-right' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↗</button>
                <button onClick={() => saveMiniPanelPosition('bottom-left')} aria-label="Move to bottom-left" className={`w-5 h-5 rounded text-[8px] ${miniPanelPosition === 'bottom-left' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↙</button>
                <button onClick={() => saveMiniPanelPosition('bottom-right')} aria-label="Move to bottom-right" className={`w-5 h-5 rounded text-[8px] ${miniPanelPosition === 'bottom-right' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>↘</button>
              </div>
              <button 
                onClick={() => setAdminMiniMode(false)} 
                className="text-cyan-400 hover:text-white p-1 rounded hover:bg-white/20 bg-white/10 transition-colors"
                title="Expand"
                aria-label="Expand to full panel"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              </button>
              <button 
                onClick={() => { setShowAdminPanel(false); setAdminMiniMode(false); setFramingMode(false); setEditingImage(null); }} 
                className="text-red-400 hover:text-white p-1 rounded hover:bg-red-500/30 bg-red-500/20 transition-colors"
                title="Close"
                aria-label="Close image framing panel"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          
          <div className="p-3 space-y-3">
            {/* Framing Mode Toggle - only for Collection tab */}
            <button 
              onClick={() => { setFramingMode(!framingMode); if (framingMode) setEditingImage(null); }}
              className={`w-full py-2 rounded text-[10px] font-medium border transition-all ${framingMode ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-gray-400 border-[var(--border-medium)] hover:bg-white/10'}`}
            >
              {framingMode ? '✓ Framing Mode ON' : '⊞ Enable Framing Mode'}
            </button>
            
            {/* Framing Controls - show when image selected */}
            {framingMode && editingImage && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="text-emerald-400 text-[10px] font-medium mb-2 truncate">
                  Editing: {editingImage.replace('collection-', '').replace('team-', 'Team: ')}
                </div>
                {/* Position controls — P6-FIX: Added aria-labels for D-pad clarity (HIGH-22) */}
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div />
                  <button onClick={() => updateEditingFraming({ y: getImageFraming(editingImage).y + 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Move image up">▲</button>
                  <div />
                  <button onClick={() => updateEditingFraming({ x: getImageFraming(editingImage).x + 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Move image left">◀</button>
                  <button onClick={resetEditingFraming} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-[8px]" aria-label="Reset framing">Reset</button>
                  <button onClick={() => updateEditingFraming({ x: getImageFraming(editingImage).x - 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Move image right">▶</button>
                  <div />
                  <button onClick={() => updateEditingFraming({ y: getImageFraming(editingImage).y - 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Move image down">▼</button>
                  <div />
                </div>
                {/* Zoom controls */}
                <div className="flex gap-1 justify-center items-center">
                  <button onClick={() => updateEditingFraming({ zoom: getImageFraming(editingImage).zoom - 10 })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Zoom out">−</button>
                  <span className="px-2 py-1 text-white text-xs min-w-[50px] text-center">{getImageFraming(editingImage).zoom}%</span>
                  <button onClick={() => updateEditingFraming({ zoom: getImageFraming(editingImage).zoom + 10 })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Zoom in">+</button>
                </div>
                <div className="text-center text-gray-500 text-[8px] mt-2">Tap another image to edit it</div>
              </div>
            )}
            
            {framingMode && !editingImage && (
              <div className="p-2 bg-white/5 border border-[var(--border-medium)] rounded-lg text-center">
                <div className="text-gray-400 text-[10px]">Tap any character image to frame it (Collection, Teams, or Detail modal)</div>
              </div>
            )}

            {/* Info Panel Framing — appears when a character detail modal is open */}
            {framingMode && detailModal.show && detailModal.type === 'character' && (() => {
              const infoKey = `info-${detailModal.name}`;
              const infoF = getImageFraming(infoKey);
              return (
                <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="text-orange-400 text-[10px] font-medium mb-2 truncate">
                    Info Panel: {detailModal.name}
                  </div>
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    <div />
                    <button onClick={() => saveImageFraming(infoKey, { ...infoF, y: Math.max(-100, Math.min(100, infoF.y + 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Move info image up">▲</button>
                    <div />
                    <button onClick={() => saveImageFraming(infoKey, { ...infoF, x: Math.max(-100, Math.min(100, infoF.x + 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Move info image left">◀</button>
                    <button onClick={() => saveImageFraming(infoKey, { x: 0, y: 0, zoom: 100 })} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-[8px]" aria-label="Reset info framing">Reset</button>
                    <button onClick={() => saveImageFraming(infoKey, { ...infoF, x: Math.max(-100, Math.min(100, infoF.x - 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Move info image right">▶</button>
                    <div />
                    <button onClick={() => saveImageFraming(infoKey, { ...infoF, y: Math.max(-100, Math.min(100, infoF.y - 2)) })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Move info image down">▼</button>
                    <div />
                  </div>
                  <div className="flex gap-1 justify-center items-center">
                    <button onClick={() => saveImageFraming(infoKey, { ...infoF, zoom: Math.max(100, infoF.zoom - 10) })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Zoom out">−</button>
                    <span className="px-2 py-1 text-white text-xs min-w-[50px] text-center">{infoF.zoom}%</span>
                    <button onClick={() => saveImageFraming(infoKey, { ...infoF, zoom: Math.min(300, infoF.zoom + 10) })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs" aria-label="Zoom in">+</button>
                  </div>
                  <div className="text-center text-gray-500 text-[8px] mt-2">Adjusts the character info panel header image</div>
                </div>
              );
            })()}
            
            {/* Export Framing Data button — visible when framing mode is active */}
            {framingMode && Object.keys(imageFraming).length > 0 && (
              <button
                onClick={() => {
                  const json = JSON.stringify(imageFraming);
                  if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(json).then(
                      () => toast?.addToast?.('Framing data copied to clipboard!', 'success'),
                      () => { window.prompt('Copy this framing data:', json); }
                    );
                  } else {
                    window.prompt('Copy this framing data:', json);
                  }
                }}
                className="w-full py-2 rounded text-[10px] font-medium border transition-all bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
              >
                <ClipboardList size={10} className="inline mr-1" />
                Export Framing Data ({Object.keys(imageFraming).length} images)
              </button>
            )}
            
            {!framingMode && (
              <>
            {/* Reset Button — P6-FIX: Added confirm dialog (MED) */}
            <button 
              onClick={async () => { if (await confirm({ title: 'Reset settings', message: 'Reset all visual settings to defaults?', confirmLabel: 'Reset', destructive: true })) saveVisualSettings(DEFAULT_VISUAL_SETTINGS); }}
              className="w-full py-1.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
            >
              ↻ Reset All to Defaults
            </button>

            {/* P4-FIX: Compact slider groups — eliminates ~120 lines of duplication */}
            {VISUAL_SLIDER_CONFIGS.map((cfg, i) => (
              <VisualSliderGroup
                key={cfg.color}
                title={cfg.compactTitle} color={cfg.color} sliders={cfg.sliders}
                visualSettings={visualSettings} saveVisualSettings={saveVisualSettings}
                compact={true} directionControl={cfg.directionControl}
              />
            ))}
              </>
            )}

            {/* App Info */}
            <Card>
              <CardBody className="text-center">
                <p className="text-gray-500 text-[10px]">
                  {`Whispering Wishes v${APP_VERSION}`} • by u/WW_Andene • Not affiliated with Kuro Games • <a href="mailto:whisperingwishes.app@gmail.com" className="text-gray-500 hover:text-yellow-400 transition-colors">Contact</a>
                </p>
              </CardBody>
            </Card>
          </div>
        </div>,
      document.body)}
    </>
  );
}
