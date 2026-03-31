// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — TrackerTab (extracted from App.jsx)
// Banner tracking with pity counters, category tabs, and banner history archive
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useSessionState } from '../../utils/useSessionState.js';
import { Archive, ArrowRight, Crown, Search, Sparkles, Star, Sword, Swords, Upload, X } from 'lucide-react';
import {
  BANNER_HISTORY,
} from '../../appcore-data.js';
import {
  Card, CardHeader, CardBody, TabBackground, TabErrorBoundary,
  BannerCard, StandardBannerSection,
  hideOnError,
} from '../../appcore-components.jsx';
import {
  FocusTrapModal,
} from '../../appcore-providers.jsx';

const FOCUS_DELAY_MS = 50;
const TRACKER_CATEGORIES = Object.freeze([
  Object.freeze({ key: 'character', label: 'Resonators', color: 'yellow' }),
  Object.freeze({ key: 'weapon', label: 'Weapons', color: 'pink' }),
  Object.freeze({ key: 'standard', label: 'Standard', color: 'cyan' }),
]);

export default function TrackerTab({
  state,
  dispatch,
  activeBanners,
  visualSettings,
  themeAccent,
  collectionImages,
  bannerEndDate,
  toast,
  confirm,
}) {
  const [trackerCategory, setTrackerCategory] = useSessionState('ww-tracker-cat', 'character');
  const [showBannerHistory, setShowBannerHistory] = useState(false);
  const [bannerHistorySearch, setBannerHistorySearch] = useState('');

  return (
          <div role="tabpanel" id="tabpanel-tracker" aria-labelledby="tab-tracker" tabIndex="0">
          <TabErrorBoundary tabName="Tracker">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="tracker" glowColor="gold" />

            {/* Onboarding hint for new users with no imported data */}
            {!state.profile.importedAt && (
              <div className="flex items-center gap-2.5 rounded-lg border border-cyan-500/25 bg-cyan-500/5 px-3 py-2.5 content-layer">
                <Upload size={14} className="text-cyan-400 flex-shrink-0" />
                <span className="text-cyan-300/90 text-xs">Import your Convene history in the <strong>Profile</strong> tab to start tracking!</span>
                <ArrowRight size={12} className="text-cyan-400/60 flex-shrink-0" />
              </div>
            )}

            {/* Category Tabs */}
            <Card>
              <CardBody>
                <div className="flex gap-2" role="tablist" aria-label="Banner category" onKeyDown={(e) => {
                    const keys = TRACKER_CATEGORIES.map(c => c.key);
                    const idx = keys.indexOf(trackerCategory);
                    let next;
                    if (e.key === 'ArrowRight') { e.preventDefault(); next = keys[(idx + 1) % keys.length]; }
                    else if (e.key === 'ArrowLeft') { e.preventDefault(); next = keys[(idx - 1 + keys.length) % keys.length]; }
                    if (next) { setTrackerCategory(next); const el = e.currentTarget; setTimeout(() => el.children[keys.indexOf(next)]?.focus(), FOCUS_DELAY_MS); }
                  }}>
                  {TRACKER_CATEGORIES.map((cat) => (
                    <button key={cat.key} onClick={() => setTrackerCategory(cat.key)} role="tab" aria-selected={trackerCategory === cat.key} tabIndex={trackerCategory === cat.key ? 0 : -1} className={`kuro-btn flex-1 ${trackerCategory === cat.key ? (cat.color === 'yellow' ? 'active-gold' : cat.color === 'pink' ? 'active-pink' : 'active-cyan') : ''}`}>
                      {cat.key === 'character' ? <Crown size={12} className="inline mr-1" /> : cat.key === 'weapon' ? <Swords size={12} className="inline mr-1" /> : <Star size={12} className="inline mr-1" />}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <div className="flex items-center text-[10px] content-layer">
              <span className="text-gray-400">v{activeBanners.version} Phase {activeBanners.phase} • {state.server}</span>
            </div>

            {new Date() > new Date(bannerEndDate) && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center content-layer">
                <p className="text-yellow-400 text-xs font-medium">Banner period ended</p>
                <p className="text-gray-400 text-[10px] mt-1">New banners are now live in-game. App update coming soon!</p>
              </div>
            )}

            {trackerCategory === 'character' && (
              <div className="space-y-2 banner-grid content-layer">
                {activeBanners.characters?.length > 0 ? activeBanners.characters.map(c => (
                  <BannerCard
                    key={c.id}
                    item={c}
                    type="character"
                    bannerImage={activeBanners.characterBannerImage}
                    stats={state.profile.featured.history.length ? {
                      pity5: state.profile.featured.pity5,
                      pity4: state.profile.featured.pity4,
                      totalPulls: state.profile.featured.history.length,
                      guaranteed: state.profile.featured.guaranteed
                    } : null}
                    visualSettings={visualSettings}
                    endDate={bannerEndDate}
                    timerColor="yellow"
                  />
                )) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <Sparkles size={24} className="mx-auto mb-2 opacity-50" />
                    No active character banners
                  </div>
                )}
              </div>
            )}

            {trackerCategory === 'weapon' && (
              <div className="space-y-2 banner-grid content-layer">
                {activeBanners.weapons?.length > 0 ? activeBanners.weapons.map(w => (
                  <BannerCard
                    key={w.id}
                    item={w}
                    type="weapon"
                    bannerImage={activeBanners.weaponBannerImage}
                    stats={state.profile.weapon.history.length ? {
                      pity5: state.profile.weapon.pity5,
                      pity4: state.profile.weapon.pity4,
                      totalPulls: state.profile.weapon.history.length
                    } : null}
                    visualSettings={visualSettings}
                    endDate={bannerEndDate}
                    timerColor="pink"
                  />
                )) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <Sword size={24} className="mx-auto mb-2 opacity-50" />
                    No active weapon banners
                  </div>
                )}
              </div>
            )}

            {trackerCategory === 'standard' && (
              <div className="space-y-2 banner-grid content-layer">

                {/* Standard Resonator Banner */}
                <StandardBannerSection
                  bannerImage={activeBanners.standardCharBannerImage}
                  altText="Tidal Chorus" title="Tidal Chorus" subtitle="Standard Resonator"
                  items={activeBanners.standardCharacters} itemKey="name"
                  profileData={state.profile.standardChar} visualSettings={visualSettings}
                />

                {/* Standard Weapon Banner */}
                <StandardBannerSection
                  bannerImage={activeBanners.standardWeapBannerImage}
                  altText="Winter Brume" title="Winter Brume" subtitle="Standard Weapon"
                  items={activeBanners.standardWeapons} itemKey="name"
                  profileData={state.profile.standardWeap} visualSettings={visualSettings}
                />
              </div>
            )}

            {/* Banner History Archive */}
            <Card>
              <CardHeader><Archive size={14} className="text-purple-400" /> Banner History</CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {/* Show only the latest banner */}
                  {BANNER_HISTORY.slice(0, 1).map(b => (
                    <div key={`bh-${b.version}-${b.phase}`} className="relative overflow-hidden p-3 rounded-lg border border-[var(--border-medium)] hover:border-white/15 transition-colors" style={{ background: 'var(--bg-btn)' }}>
                      {b.bannerArt && <img src={b.bannerArt} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" style={{ maskImage: 'linear-gradient(to left, black 30%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 80%)' }} loading="lazy" onError={hideOnError} />}
                      <div className="relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm font-semibold">v{b.version} P{b.phase}</span>
                        <span className="text-gray-500 text-[10px]">{new Date(b.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{b.predicted ? ' (est.)' : ''}</span>
                      </div>
                      <div className="space-y-1.5">
                        {Array.from({ length: Math.max(b.characters.length, b.weapons.length) }).map((_, idx) => {
                          const c = b.characters[idx];
                          const w = b.weapons[idx];
                          const cImg = c ? collectionImages[c] : null;
                          const wImg = w ? collectionImages[w] : null;
                          return (
                            <div key={idx} className="flex items-center gap-4">
                              {c ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 holo-5star" style={{ position: 'relative' }}>
                                    {cImg ? (
                                      <img src={cImg} alt={c} className="w-full h-full object-cover object-top breath-zoom" loading="lazy" onError={hideOnError} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[10px] text-yellow-400">{c[0]}</div>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-yellow-400 font-medium truncate">{c}</span>
                                </div>
                              ) : <div className="flex-1" />}
                              {w ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 holo-5star" style={{ position: 'relative' }}>
                                    {wImg ? (
                                      <img src={wImg} alt={w} className="w-full h-full object-contain p-0.5" loading="lazy" onError={hideOnError} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center"><Sword size={14} className="text-pink-400" /></div>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-pink-400 font-medium truncate">{w}</span>
                                </div>
                              ) : <div className="flex-1" />}
                            </div>
                          );
                        })}
                      </div>
                      </div>
                    </div>
                  ))}
                  {/* View All button */}
                  <button
                    onClick={() => setShowBannerHistory(true)}
                    className="w-full py-2.5 rounded-lg border border-[var(--border-medium)] text-gray-400 text-xs font-medium hover:text-white hover:border-white/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                    style={{ background: 'var(--bg-btn)' }}
                  >
                    <Archive size={12} /> View All Banners ({BANNER_HISTORY.length})
                  </button>
                </div>
              </CardBody>
            </Card>

            {/* Banner History Modal */}
            <FocusTrapModal isOpen={showBannerHistory} onClose={() => { setShowBannerHistory(false); setBannerHistorySearch(''); }} className="" ariaLabel="Banner History" onClick={() => { setShowBannerHistory(false); setBannerHistorySearch(''); }} centered>
              <div className="kuro-card w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}><div className="kuro-card-inner overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)]" data-sheet-header>
                  <div className="flex items-center gap-2">
                    <Archive size={14} className="text-purple-400" />
                    <span className="text-white text-sm font-semibold">Banner History</span>
                  </div>
                  <button onClick={() => { setShowBannerHistory(false); setBannerHistorySearch(''); }} className="p-1.5 rounded-lg text-gray-400 hover:text-white active:scale-95 transition-all"><X size={16} /></button>
                </div>
                {/* Search / filter input */}
                <div className="px-4 pt-3 pb-1">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input
                      type="text"
                      value={bannerHistorySearch}
                      onChange={e => setBannerHistorySearch(e.target.value)}
                      placeholder="Search by name, version, or phase\u2026"
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-[var(--border-medium)] bg-black/30 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                      aria-label="Filter banner history"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2" data-sheet-scroll>
                  {(() => {
                    const q = bannerHistorySearch.trim().toLowerCase();
                    const filtered = q
                      ? BANNER_HISTORY.filter(b =>
                          b.characters.some(c => c.toLowerCase().includes(q)) ||
                          b.weapons.some(w => w.toLowerCase().includes(q)) ||
                          `v${b.version}`.toLowerCase().includes(q) ||
                          `p${b.phase}`.toLowerCase().includes(q) ||
                          `${b.version}`.includes(q) ||
                          `v${b.version} p${b.phase}`.toLowerCase().includes(q)
                        )
                      : BANNER_HISTORY;
                    return filtered.length === 0
                      ? <div className="text-center text-gray-500 text-xs py-6">No banners match &ldquo;{bannerHistorySearch.trim()}&rdquo;</div>
                      : filtered.map(b => (
                    <div key={`bhm-${b.version}-${b.phase}`} className="relative overflow-hidden p-3 rounded-lg border border-[var(--border-medium)] hover:border-white/15 transition-colors" style={{ background: 'var(--bg-btn)' }}>
                      {b.bannerArt && <img src={b.bannerArt} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" style={{ maskImage: 'linear-gradient(to left, black 30%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 80%)' }} loading="lazy" onError={hideOnError} />}
                      <div className="relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm font-semibold">v{b.version} P{b.phase}</span>
                        <span className="text-gray-500 text-[10px]">{new Date(b.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{b.predicted ? ' (est.)' : ''}</span>
                      </div>
                      <div className="space-y-1.5">
                        {Array.from({ length: Math.max(b.characters.length, b.weapons.length) }).map((_, idx) => {
                          const c = b.characters[idx];
                          const w = b.weapons[idx];
                          const cImg = c ? collectionImages[c] : null;
                          const wImg = w ? collectionImages[w] : null;
                          return (
                            <div key={idx} className="flex items-center gap-4">
                              {c ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 holo-5star" style={{ position: 'relative' }}>
                                    {cImg ? (
                                      <img src={cImg} alt={c} className="w-full h-full object-cover object-top breath-zoom" loading="lazy" onError={hideOnError} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[10px] text-yellow-400">{c[0]}</div>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-yellow-400 font-medium truncate">{c}</span>
                                </div>
                              ) : <div className="flex-1" />}
                              {w ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 holo-5star" style={{ position: 'relative' }}>
                                    {wImg ? (
                                      <img src={wImg} alt={w} className="w-full h-full object-contain p-0.5" loading="lazy" onError={hideOnError} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center"><Sword size={14} className="text-pink-400" /></div>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-pink-400 font-medium truncate">{w}</span>
                                </div>
                              ) : <div className="flex-1" />}
                            </div>
                          );
                        })}
                      </div>
                      </div>
                    </div>
                  ));
                  })()}
                </div>
              </div></div>
            </FocusTrapModal>
          </div>
          </TabErrorBoundary>
          </div>
  );
}
