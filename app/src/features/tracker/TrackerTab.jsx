// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — TrackerTab (extracted from App.jsx)
// Banner tracking with pity counters, category tabs, and banner history archive
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Archive, ArrowRight, Clock, Crown, Search, Sparkles, Star, Sword, Swords, Upload, X } from 'lucide-react';
import { BANNER_HISTORY, PLACEHOLDER_IMAGE, CHARACTER_THEMES, MOST_PULLED_STATS } from '../../data/banners.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { BannerCard, GachaInfoButton, PityTrackerCompact } from '../../shared/components/BannerCard.jsx';
import { StandardBannerSection } from './StandardBannerSection.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import { t, formatDate, getLocale } from '../../utils/i18n.js';
import { getLocalizedWeaponData } from '../../data/weapons.js';

const FOCUS_DELAY_MS = 0;
const TRACKER_CATEGORIES = Object.freeze([
  Object.freeze({ key: 'character', color: 'yellow' }),
  Object.freeze({ key: 'weapon', color: 'pink' }),
  Object.freeze({ key: 'standard', color: 'cyan' }),
]);

function TrackerTab({
  state,
  dispatch,
  activeBanners,
  visualSettings,
  themeAccent,
  collectionImages,
  bannerEndDate,
  toast,
  confirm,
  setActiveTab,
  setDetailModal,
}) {
  const [trackerCategory, setTrackerCategoryRaw] = useState(() => {
    try {
      const v = localStorage.getItem('ww-tracker-cat');
      return ['character', 'weapon', 'standard'].includes(v) ? v : 'character';
    } catch { return 'character'; }
  });
  const setTrackerCategory = useCallback((v) => {
    setTrackerCategoryRaw(v);
    try { localStorage.setItem('ww-tracker-cat', v); } catch {}
  }, []);
  const [showBannerHistory, setShowBannerHistory] = useState(false);
  const [bannerHistorySearch, setBannerHistorySearch] = useState('');
  const [bannerHistorySort, setBannerHistorySort] = useState('newest');
  const [showPullHistory, setShowPullHistory] = useState(false);
  const [pullHistorySearch, setPullHistorySearch] = useState('');
  // P5-F003: Debounce search to avoid filtering 2000+ pulls per keystroke
  const [deferredSearch, setDeferredSearch] = useState('');
  const searchTimerRef = useRef(null);
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDeferredSearch(pullHistorySearch), 200);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [pullHistorySearch]);
  const [pullHistoryBannerFilter, setPullHistoryBannerFilter] = useState('all');
  const [pullHistoryRarityFilter, setPullHistoryRarityFilter] = useState('all');
  const [dismissedImport, setDismissedImport] = useState(false);
  // Localized weapon names for the Pull History list — pull.name is always the internal English
  // key (character or weapon), but weapon names should display translated in French.
  const localizedWeaponData = getLocalizedWeaponData(getLocale());

  // Merge all pull histories from all banners
  const allPulls = useMemo(() => {
    const featured = (state.profile.featured?.history || []).map(p => ({ ...p, banner: 'Featured' }));
    const weapon = (state.profile.weapon?.history || []).map(p => ({ ...p, banner: 'Weapon' }));
    const stdChar = (state.profile.standardChar?.history || []).map(p => ({ ...p, banner: 'Standard Resonator' }));
    const stdWeap = (state.profile.standardWeap?.history || []).map(p => ({ ...p, banner: 'Standard Weapon' }));
    const beginner = (state.profile.beginner?.history || []).map(p => ({ ...p, banner: 'Beginner' }));
    return [...featured, ...weapon, ...stdChar, ...stdWeap, ...beginner]
      .sort((a, b) => new Date(b.timestamp ?? 0) - new Date(a.timestamp ?? 0));
  }, [state.profile.featured?.history, state.profile.weapon?.history, state.profile.standardChar?.history, state.profile.standardWeap?.history, state.profile.beginner?.history]);

  const filteredPulls = useMemo(() => {
    let pulls = allPulls;
    if (pullHistoryBannerFilter !== 'all') pulls = pulls.filter(p => p.banner === pullHistoryBannerFilter);
    if (pullHistoryRarityFilter !== 'all') pulls = pulls.filter(p => p.rarity === Number(pullHistoryRarityFilter));
    if (deferredSearch.trim()) {
      const q = deferredSearch.trim().toLowerCase();
      pulls = pulls.filter(p => p.name?.toLowerCase().includes(q));
    }
    return pulls;
  }, [allPulls, pullHistoryBannerFilter, pullHistoryRarityFilter, deferredSearch]);

  return (
          <div role="tabpanel" id="tabpanel-tracker" aria-labelledby="tab-tracker" tabIndex="0">
          <TabErrorBoundary tabName="Tracker">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="tracker" glowColor="gold" />

            {/* Onboarding hint for new users with no imported data */}
            {!state.profile.importedAt && !dismissedImport && setActiveTab && (
              <div className="flex items-center gap-3 rounded-lg border border-cyan-500/25 bg-cyan-500/5 px-3 py-3 content-layer">
                <button onClick={() => setActiveTab('profile')} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                  <Upload size={16} className="text-cyan-400 flex-shrink-0" />
                  <span className="text-cyan-300/90 text-base">{t('tracker.importHintPre')} <strong>{t('tabs.profile')}</strong> {t('tracker.importHintPost')}</span>
                  <ArrowRight size={12} className="text-cyan-400/60 flex-shrink-0" />
                </button>
                <button onClick={() => setDismissedImport(true)} className="kuro-btn kuro-btn-sm flex-shrink-0 p-2" aria-label={t('tracker.dismiss')}><X size={16} /></button>
              </div>
            )}
            {/* Category Tabs */}
            <Card>
              <CardBody>
                <div className="flex gap-2" role="tablist" aria-label={t('tracker.ariaCategory')} onKeyDown={(e) => {
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
                      {t(`tracker.category.${cat.key}`)}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <div className="flex items-center justify-between text-sm content-layer">
              <span className="text-gray-400">{t('tracker.versionPhaseServer', { version: activeBanners.version, phase: activeBanners.phase, server: state.server })}</span>
              <div className="flex items-center gap-2">
                {trackerCategory === 'character' && (
                  <PityTrackerCompact
                    isChar
                    stats={state.profile.featured?.history?.length ? {
                      pity5: state.profile.featured.pity5,
                      pity4: state.profile.featured.pity4,
                      guaranteed: state.profile.featured.guaranteed,
                    } : null}
                  />
                )}
                {trackerCategory === 'weapon' && (
                  <PityTrackerCompact
                    isChar={false}
                    stats={state.profile.weapon?.history?.length ? {
                      pity5: state.profile.weapon.pity5,
                      pity4: state.profile.weapon.pity4,
                      guaranteed: state.profile.weapon.guaranteed,
                    } : null}
                  />
                )}
                {trackerCategory === 'standard' && (
                  // Two independent pity counters (Standard Resonator + Standard Weapon each
                  // have their own history) sit here above the banners, same as the character/
                  // weapon categories' single tracker — not overlaid on the banner art itself,
                  // which is where these used to live before StandardBannerSection's own
                  // in-image stat bar was retired in favor of this shared header spot.
                  <div className="flex flex-col items-end gap-0.5">
                    {state.profile.standardChar?.history?.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 text-2xs uppercase tracking-wider">{t('tracker.standardResonatorLabel')}</span>
                        <PityTrackerCompact isChar showGuaranteed={false} stats={{ pity5: state.profile.standardChar.pity5, pity4: state.profile.standardChar.pity4 }} />
                      </div>
                    )}
                    {state.profile.standardWeap?.history?.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 text-2xs uppercase tracking-wider">{t('tracker.standardWeaponLabel')}</span>
                        <PityTrackerCompact isChar={false} showGuaranteed={false} stats={{ pity5: state.profile.standardWeap.pity5, pity4: state.profile.standardWeap.pity4 }} />
                      </div>
                    )}
                  </div>
                )}
                <GachaInfoButton isChar={trackerCategory !== 'weapon'} />
              </div>
            </div>


            {trackerCategory === 'character' && (
              <div className="space-y-2 banner-grid content-layer">
                {activeBanners.characters?.length > 0 ? activeBanners.characters.map(c => (
                  <BannerCard
                    key={c.id}
                    item={c}
                    type="character"
                    bannerImage={activeBanners.characterBannerImage}
                    visualSettings={visualSettings}
                    endDate={bannerEndDate}
                    timerColor="yellow"
                    collectionImages={collectionImages}
                    setDetailModal={setDetailModal}
                    pity={state.profile.featured}
                    calc={state.calc}
                  />
                )) : (
                  <div className="kuro-empty-state text-center py-8">
                    <Sparkles size={32} className="mx-auto mb-2 text-yellow-500/40" />
                    <p className="text-gray-300 text-md font-medium">{t('tracker.emptyResonator')}</p>
                    <p className="text-gray-500 text-sm mt-1">{t('tracker.emptyResonatorHint')}</p>
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
                    visualSettings={visualSettings}
                    endDate={bannerEndDate}
                    timerColor="pink"
                    collectionImages={collectionImages}
                    setDetailModal={setDetailModal}
                    pity={state.profile.weapon}
                    calc={state.calc}
                  />
                )) : (
                  <div className="kuro-empty-state text-center py-8">
                    <Sword size={32} className="mx-auto mb-2 text-pink-500/40" />
                    <p className="text-gray-300 text-md font-medium">{t('tracker.emptyWeapon')}</p>
                    <p className="text-gray-500 text-sm mt-1">{t('tracker.emptyWeaponHint')}</p>
                  </div>
                )}
              </div>
            )}

            {trackerCategory === 'standard' && (
              <div className="space-y-2 banner-grid content-layer">

                {/* Standard Resonator Banner */}
                <StandardBannerSection
                  bannerImage={activeBanners.standardCharBannerImage}
                  altText="Tidal Chorus" title="Tidal Chorus" subtitle={t('tracker.standardResonatorLabel')}
                  items={activeBanners.standardCharacters} itemKey="name"
                  profileData={state.profile.standardChar} visualSettings={visualSettings}
                  kind="standardChar"
                  calc={state.calc}
                  setDetailModal={setDetailModal}
                />

                {/* Standard Weapon Banner */}
                <StandardBannerSection
                  bannerImage={activeBanners.standardWeapBannerImage}
                  altText="Winter Brume" title="Winter Brume" subtitle={t('tracker.standardWeaponLabel')}
                  items={activeBanners.standardWeapons} itemKey="name"
                  profileData={state.profile.standardWeap} visualSettings={visualSettings}
                  imagePosition="65% top"
                  kind="standardWeap"
                  calc={state.calc}
                  setDetailModal={setDetailModal}
                />
              </div>
            )}

            {/* Pull History Button */}
            {allPulls.length > 0 && (
              <Card>
                <CardBody>
                  <button
                    onClick={() => setShowPullHistory(true)}
                    className="w-full py-3 rounded-lg border border-cyan-500/30 text-cyan-300 text-base font-semibold hover:text-white hover:border-cyan-400/50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                    style={{ background: 'var(--bg-btn)' }}
                  >
                    <Clock size={12} /> {t('tracker.viewConveneHistory', { count: allPulls.length })}
                  </button>
                </CardBody>
              </Card>
            )}

            {/* Banner History Archive */}
            <Card>
              <CardHeader><Archive size={16} className="text-purple-400" /> {t('tracker.bannerHistory')}</CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {/* Show only the latest banner */}
                  {BANNER_HISTORY.slice(0, 1).map(b => (
                    <div key={`bh-${b.version}-${b.phase}`} className="relative overflow-hidden p-3 rounded-lg border border-[var(--border-medium)] hover:border-white/15 transition-colors" style={{ background: 'var(--bg-btn)' }}>
                      {b.bannerArt && <img src={b.bannerArt} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" style={{ objectPosition: b.bannerArt === PLACEHOLDER_IMAGE ? 'center 15%' : undefined, maskImage: 'linear-gradient(to left, black 30%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 80%)' }} loading="lazy" onError={hideOnError} />}
                      <div className="relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-xl font-semibold">v{b.version} P{b.phase}</span>
                        <span className="text-gray-500 text-sm">{formatDate(new Date(b.startDate + 'T12:00:00'), { month: 'short', day: 'numeric', year: 'numeric' })}{b.predicted ? ` ${t('tracker.estimated')}` : ''}</span>
                      </div>
                      <div className="space-y-1.5">
                        {Array.from({ length: Math.max(b.characters.length, b.weapons.length) }).map((_, idx) => {
                          const c = b.characters[idx];
                          const w = b.weapons[idx];
                          const cImg = c ? collectionImages[c] : null;
                          const wImg = w ? collectionImages[w] : null;
                          const wLabel = w ? (localizedWeaponData[w]?.displayName || w) : null;
                          return (
                            <div key={idx} className="flex items-center gap-4">
                              {c ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 holo-5star" style={{ position: 'relative' }}>
                                    {cImg ? (
                                      <img src={cImg} alt={c} className={cImg === PLACEHOLDER_IMAGE ? 'w-full h-full object-contain p-0.5' : 'w-full h-full object-cover breath-zoom'} style={cImg === PLACEHOLDER_IMAGE ? undefined : { objectPosition: 'center top' }} loading="lazy" onError={hideOnError} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-sm text-yellow-400">{c[0]}</div>
                                    )}
                                  </div>
                                  <span className="text-sm text-yellow-400 font-medium truncate">{c}</span>
                                </div>
                              ) : <div className="flex-1" />}
                              {w ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 holo-5star" style={{ position: 'relative' }}>
                                    {wImg ? (
                                      <img src={wImg} alt={wLabel} className="w-full h-full object-contain p-0.5" loading="lazy" onError={hideOnError} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center"><Sword size={16} className="text-pink-400" /></div>
                                    )}
                                  </div>
                                  <span className="text-sm text-pink-400 font-medium truncate">{wLabel}</span>
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
                    className="w-full py-3 rounded-lg border border-white/20 text-gray-200 text-base font-semibold hover:text-white hover:border-white/30 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                    style={{ background: 'var(--bg-btn)' }}
                  >
                    <Archive size={12} /> {t('tracker.viewAllBanners', { count: BANNER_HISTORY.length })}
                  </button>
                </div>
              </CardBody>
            </Card>

            {/* Banner History Modal */}
            <FocusTrapModal isOpen={showBannerHistory} onClose={() => { setShowBannerHistory(false); setBannerHistorySearch(''); }} className="" ariaLabel={t('tracker.bannerHistory')} onClick={() => { setShowBannerHistory(false); setBannerHistorySearch(''); }} centered padding="p-3">
              <div className="kuro-card w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}><div className="kuro-card-inner overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)]" data-sheet-header>
                  <div className="flex items-center gap-2">
                    <Archive size={16} className="text-purple-400" />
                    <span className="text-white text-xl font-semibold">{t('tracker.bannerHistory')}</span>
                  </div>
                  <button onClick={() => { setShowBannerHistory(false); setBannerHistorySearch(''); }} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2" data-sheet-scroll>
                  {/* Search / filter input — sticky, floats over the scrolling history below (like the app header) */}
                  <div className="sticky top-0 z-20 px-4 py-3 space-y-2" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(var(--blur-sm))', WebkitBackdropFilter: 'blur(var(--blur-sm))' }}>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      <input
                        type="text"
                        value={bannerHistorySearch}
                        onChange={e => setBannerHistorySearch(e.target.value)}
                        placeholder={t('tracker.searchBannerPlaceholder')}
                        className="kuro-input w-full pl-8 text-base"
                        aria-label={t('tracker.filterBannerHistory')}
                      />
                    </div>
                    <KuroSelect
                      value={bannerHistorySort}
                      onChange={setBannerHistorySort}
                      options={[
                        { value: 'newest', label: t('tracker.sortNewestFirst') },
                        { value: 'release', label: t('tracker.sortReleaseOrder') },
                        { value: 'lastRerun', label: t('tracker.sortLastRerun') },
                        { value: 'mostPulled', label: t('tracker.sortMostPulled') },
                      ]}
                      className="w-full"
                      ariaLabel={t('tracker.sortBannerHistory')}
                      small
                    />
                    {bannerHistorySort === 'mostPulled' && (
                      <p className="text-xs text-gray-500 px-0.5">{t('tracker.mostPulledSourceNote')}</p>
                    )}
                  </div>
                  <div className="px-4 pb-4 space-y-2">
                  {(() => {
                    const q = bannerHistorySearch.trim().toLowerCase();
                    const matchesQuery = b =>
                      b.characters.some(c => c.toLowerCase().includes(q)) ||
                      b.weapons.some(w => w.toLowerCase().includes(q)) ||
                      `v${b.version}`.toLowerCase().includes(q) ||
                      `p${b.phase}`.toLowerCase().includes(q) ||
                      `${b.version}`.includes(q) ||
                      `v${b.version} p${b.phase}`.toLowerCase().includes(q);

                    // Shared by "Last Rerun" and "Most Pulled": each character's most recent
                    // (latest-dated) banner appearance, used to pair a co-featured weapon and pick
                    // a sensible date/version to display alongside the per-character row.
                    const latestByCharacter = new Map();
                    for (const b of BANNER_HISTORY) {
                      for (const c of b.characters) {
                        const prev = latestByCharacter.get(c);
                        if (!prev || new Date(b.startDate) > new Date(prev.startDate)) latestByCharacter.set(c, b);
                      }
                    }
                    const renderCharacterRow = (character, banner, trailing) => {
                      const cImg = collectionImages[character];
                      // Pair the character with its co-featured weapon from that same banner
                      // phase — characters[idx] lines up with weapons[idx], same convention
                      // the phase-block view below uses.
                      const cIdx = banner.characters.indexOf(character);
                      const w = banner.weapons[cIdx];
                      const wImg = w ? collectionImages[w] : null;
                      const wLabel = w ? (localizedWeaponData[w]?.displayName || w) : null;
                      // Use this character's own splash art, not the phase's shared bannerArt
                      // (which is only the first-listed character's art — showing it for every
                      // co-featured character in the phase is wrong).
                      const rowArt = CHARACTER_THEMES.find(th => th.name === character)?.bannerArt || banner.bannerArt;
                      return (
                        <div key={`row-${character}`} className="relative overflow-hidden p-3 rounded-lg border border-[var(--border-medium)] hover:border-white/15 transition-colors" style={{ background: 'var(--bg-btn)' }}>
                          {rowArt && <img src={rowArt} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" style={{ objectPosition: rowArt === PLACEHOLDER_IMAGE ? 'center 15%' : undefined, maskImage: 'linear-gradient(to left, black 30%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 80%)' }} loading="lazy" onError={hideOnError} />}
                          <div className="relative z-10">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white text-xl font-semibold">{trailing || t('tracker.lastAppearance', { version: banner.version, phase: banner.phase })}</span>
                              <span className="text-gray-500 text-sm">{formatDate(new Date(banner.startDate + 'T12:00:00'), { month: 'short', day: 'numeric', year: 'numeric' })}{banner.predicted ? ` ${t('tracker.estimated')}` : ''}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 holo-5star" style={{ position: 'relative' }}>
                                  {cImg ? (
                                    <img src={cImg} alt={character} className={cImg === PLACEHOLDER_IMAGE ? 'w-full h-full object-contain p-0.5' : 'w-full h-full object-cover breath-zoom'} style={cImg === PLACEHOLDER_IMAGE ? undefined : { objectPosition: 'center top' }} loading="lazy" onError={hideOnError} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm text-yellow-400">{character[0]}</div>
                                  )}
                                </div>
                                <span className="text-sm text-yellow-400 font-medium truncate">{character}</span>
                              </div>
                              {w ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 holo-5star" style={{ position: 'relative' }}>
                                    {wImg ? (
                                      <img src={wImg} alt={wLabel} className="w-full h-full object-contain p-0.5" loading="lazy" onError={hideOnError} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center"><Sword size={16} className="text-pink-400" /></div>
                                    )}
                                  </div>
                                  <span className="text-sm text-pink-400 font-medium truncate">{wLabel}</span>
                                </div>
                              ) : <div className="flex-1" />}
                            </div>
                          </div>
                        </div>
                      );
                    };

                    // "Last Rerun" view: one row per character, showing only their most recent
                    // (latest-dated) banner appearance — lets players see at a glance who is
                    // overdue for a rerun, instead of scrolling every past phase.
                    if (bannerHistorySort === 'lastRerun') {
                      const rows = Array.from(latestByCharacter.entries())
                        .map(([character, banner]) => ({ character, banner }))
                        .filter(({ character, banner }) => !q || character.toLowerCase().includes(q) || matchesQuery(banner))
                        .sort((a, b) => new Date(b.banner.startDate) - new Date(a.banner.startDate));
                      return rows.length === 0
                        ? <div className="text-center text-gray-400 text-base py-6">{t('tracker.noBannersMatch', { query: bannerHistorySearch.trim() })}</div>
                        : rows.map(({ character, banner }) => renderCharacterRow(character, banner));
                    }

                    // "Most Pulled" view: one row per character with tracked pull data, sorted by
                    // lifetime tracked pull count (see MOST_PULLED_STATS sourcing comment in
                    // banners.js — a wuwatracker.com community sample, not the full playerbase).
                    if (bannerHistorySort === 'mostPulled') {
                      const rows = Object.entries(MOST_PULLED_STATS)
                        .filter(([character]) => latestByCharacter.has(character))
                        .map(([character, stats]) => ({ character, stats, banner: latestByCharacter.get(character) }))
                        .filter(({ character, banner }) => !q || character.toLowerCase().includes(q) || matchesQuery(banner))
                        .sort((a, b) => b.stats.totalPulls - a.stats.totalPulls);
                      return rows.length === 0
                        ? <div className="text-center text-gray-400 text-base py-6">{t('tracker.noBannersMatch', { query: bannerHistorySearch.trim() })}</div>
                        : rows.map(({ character, stats, banner }) => renderCharacterRow(character, banner, t('tracker.pullsCount', { count: stats.totalPulls })));
                    }

                    const ordered = bannerHistorySort === 'release' ? [...BANNER_HISTORY].reverse() : BANNER_HISTORY;
                    const filtered = q ? ordered.filter(matchesQuery) : ordered;
                    return filtered.length === 0
                      ? <div className="text-center text-gray-400 text-base py-6">{t('tracker.noBannersMatch', { query: bannerHistorySearch.trim() })}</div>
                      : filtered.map(b => (
                    <div key={`bhm-${b.version}-${b.phase}`} className="relative overflow-hidden p-3 rounded-lg border border-[var(--border-medium)] hover:border-white/15 transition-colors" style={{ background: 'var(--bg-btn)' }}>
                      {b.bannerArt && <img src={b.bannerArt} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" style={{ objectPosition: b.bannerArt === PLACEHOLDER_IMAGE ? 'center 15%' : undefined, maskImage: 'linear-gradient(to left, black 30%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 80%)' }} loading="lazy" onError={hideOnError} />}
                      <div className="relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-xl font-semibold">v{b.version} P{b.phase}</span>
                        <span className="text-gray-500 text-sm">{formatDate(new Date(b.startDate + 'T12:00:00'), { month: 'short', day: 'numeric', year: 'numeric' })}{b.predicted ? ` ${t('tracker.estimated')}` : ''}</span>
                      </div>
                      <div className="space-y-1.5">
                        {Array.from({ length: Math.max(b.characters.length, b.weapons.length) }).map((_, idx) => {
                          const c = b.characters[idx];
                          const w = b.weapons[idx];
                          const cImg = c ? collectionImages[c] : null;
                          const wImg = w ? collectionImages[w] : null;
                          const wLabel = w ? (localizedWeaponData[w]?.displayName || w) : null;
                          return (
                            <div key={idx} className="flex items-center gap-4">
                              {c ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 holo-5star" style={{ position: 'relative' }}>
                                    {cImg ? (
                                      <img src={cImg} alt={c} className={cImg === PLACEHOLDER_IMAGE ? 'w-full h-full object-contain p-0.5' : 'w-full h-full object-cover breath-zoom'} style={cImg === PLACEHOLDER_IMAGE ? undefined : { objectPosition: 'center top' }} loading="lazy" onError={hideOnError} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-sm text-yellow-400">{c[0]}</div>
                                    )}
                                  </div>
                                  <span className="text-sm text-yellow-400 font-medium truncate">{c}</span>
                                </div>
                              ) : <div className="flex-1" />}
                              {w ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 holo-5star" style={{ position: 'relative' }}>
                                    {wImg ? (
                                      <img src={wImg} alt={wLabel} className="w-full h-full object-contain p-0.5" loading="lazy" onError={hideOnError} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center"><Sword size={16} className="text-pink-400" /></div>
                                    )}
                                  </div>
                                  <span className="text-sm text-pink-400 font-medium truncate">{wLabel}</span>
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
                </div>
              </div></div>
            </FocusTrapModal>

            {/* Pull History Modal */}
            <FocusTrapModal isOpen={showPullHistory} onClose={() => { setShowPullHistory(false); setPullHistorySearch(''); setPullHistoryBannerFilter('all'); setPullHistoryRarityFilter('all'); }} className="" ariaLabel={t('tracker.conveneHistory')} onClick={() => { setShowPullHistory(false); setPullHistorySearch(''); setPullHistoryBannerFilter('all'); setPullHistoryRarityFilter('all'); }} centered padding="p-3">
              <div className="kuro-card w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}><div className="kuro-card-inner overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)]" data-sheet-header>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-cyan-400" />
                    <span className="text-white text-xl font-semibold">{t('tracker.conveneHistory')}</span>
                    <span className="text-gray-500 text-sm">({filteredPulls.length}{filteredPulls.length !== allPulls.length ? ` / ${allPulls.length}` : ''})</span>
                  </div>
                  <button onClick={() => { setShowPullHistory(false); setPullHistorySearch(''); setPullHistoryBannerFilter('all'); setPullHistoryRarityFilter('all'); }} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1" data-sheet-scroll>
                  {/* Search & filters — sticky, floats over the scrolling history below (like the app header) */}
                  <div className="sticky top-0 z-20 px-4 py-3 space-y-2" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(var(--blur-sm))', WebkitBackdropFilter: 'blur(var(--blur-sm))' }}>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      <input
                        type="text"
                        value={pullHistorySearch}
                        onChange={e => setPullHistorySearch(e.target.value)}
                        placeholder={t('tracker.searchNamePlaceholder')}
                        className="kuro-input w-full pl-8 text-base"
                        aria-label={t('tracker.filterConveneByName')}
                      />
                    </div>
                    <div className="flex gap-2">
                      <KuroSelect
                        value={pullHistoryBannerFilter}
                        onChange={setPullHistoryBannerFilter}
                        options={[
                          { value: 'all', label: t('tracker.allBanners') },
                          { value: 'Featured', label: t('tracker.featured') },
                          { value: 'Weapon', label: t('tracker.weapon') },
                          { value: 'Standard Resonator', label: t('tracker.standardResonatorLabel') },
                          { value: 'Standard Weapon', label: t('tracker.standardWeaponLabel') },
                          { value: 'Beginner', label: t('tracker.beginner') },
                        ]}
                        className="flex-1"
                        ariaLabel={t('tracker.filterByBannerType')}
                        small
                      />
                      <KuroSelect
                        value={pullHistoryRarityFilter}
                        onChange={setPullHistoryRarityFilter}
                        options={[
                          { value: 'all', label: t('tracker.allRarities') },
                          { value: '5', label: '5★' },
                          { value: '4', label: '4★' },
                          { value: '3', label: '3★' },
                        ]}
                        className="flex-1"
                        ariaLabel={t('tracker.filterByRarity')}
                        small
                      />
                    </div>
                  </div>
                  <div className="px-4 pb-4 space-y-1">
                  {filteredPulls.length === 0 ? (
                    <div className="text-center text-gray-400 text-base py-6">
                      {allPulls.length === 0 ? t('tracker.noHistory') : t('tracker.noFiltered')}
                    </div>
                  ) : (
                    filteredPulls.map((pull, idx) => {
                      const rarityColor = pull.rarity === 5 ? 'text-yellow-400' : pull.rarity === 4 ? 'text-purple-400' : 'text-blue-400';
                      const rarityBg = pull.rarity === 5 ? 'border-yellow-500/20 bg-yellow-500/5' : pull.rarity === 4 ? 'border-purple-500/20 bg-purple-500/5' : 'border-[var(--border-medium)]';
                      const stars = '★'.repeat(pull.rarity || 0);
                      const imgUrl = pull.name ? collectionImages[pull.name] : null;
                      return (
                        <div key={`pull-${idx}`} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${rarityBg} transition-colors`}>
                          {imgUrl && <img src={imgUrl} alt="" className="w-8 h-8 rounded-md object-cover bg-black/25 flex-shrink-0" loading="lazy" onError={hideOnError} />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-base font-semibold truncate ${rarityColor}`}>{localizedWeaponData[pull.name]?.displayName || pull.name || t('tracker.unknown')}</span>
                              <span className={`text-sm ${rarityColor} opacity-70`}>{stars}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm text-gray-500">{pull.banner}</span>
                              {pull.pity > 0 && <span className="text-sm text-gray-400">{t('tracker.pityLabel')} <span className={pull.rarity === 5 && pull.pity >= 70 ? 'text-red-400' : ''}>{pull.pity}</span></span>}
                              {pull.rarity === 5 && pull.won5050 === true && <span className="text-sm text-emerald-400 font-medium">{t('tracker.won5050')}</span>}
                              {pull.rarity === 5 && pull.won5050 === false && <span className="text-sm text-red-400 font-medium">{t('tracker.lost5050')}</span>}
                            </div>
                          </div>
                          {pull.timestamp && (
                            <div className="text-sm text-gray-500 text-right flex-shrink-0 whitespace-nowrap">
                              {formatDate(pull.timestamp, { month: 'short', day: 'numeric' })}
                              <div className="text-sm text-gray-600">{formatDate(pull.timestamp, { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  </div>
                </div>
              </div></div>
            </FocusTrapModal>
          </div>
          </TabErrorBoundary>
          </div>
  );
}

export default React.memo(TrackerTab, (prev, next) =>
  prev.state.profile === next.state.profile && prev.state.server === next.state.server &&
  prev.activeBanners === next.activeBanners && prev.collectionImages === next.collectionImages &&
  prev.visualSettings === next.visualSettings && prev.themeAccent === next.themeAccent
);
