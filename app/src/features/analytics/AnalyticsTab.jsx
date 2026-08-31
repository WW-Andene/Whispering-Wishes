// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — AnalyticsTab (extracted from App.jsx)
// Stats, luck rating, trophies, leaderboard, pull history charts
// ═══════════════════════════════════════════════════════════════════════════════
//
// [SECTION INDEX] - Use: grep -n "SECTION:" AnalyticsTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// [SECTION:STATS]       Community stats & histogram computation
// [SECTION:FIREBASE]    Leaderboard & community data (Firebase)
// [SECTION:RENDER]      JSX output
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Award, BarChart3, Clover, Star, TrendingDown, TrendingUp, Trophy, X } from 'lucide-react';
import PityHistogram from './PityHistogram.jsx';
import ConveneHistoryChart from './ConveneHistoryChart.jsx';
import AchievementsTool from './AchievementsTool.jsx';
import { ALL_CHARACTERS } from '../../data/characters.js';
import { ALL_5STAR_WEAPONS } from '../../data/weaponLists.js';
import { getMergedHistories } from '../../core/storageKeys.js';
import { MEDAL_COLORS, HARD_PITY, LEADERBOARD_DISPLAY_LIMIT } from '../../data/constants.js';

import { t, formatNumber, formatDate, getPluralForm } from '../../utils/i18n.js';
import { storageAvailable } from '../../core/storage.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { TROPHY_ICON_MAP } from '../../shared/utils/trophyIcons.js';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { FocusTrapModal, useFocusTrap } from '../../shared/components/FocusTrapModal.jsx';
import { buildPityHistogram } from '../../shared/utils/pityHistogram.js';
import { useCloudStorage } from '../../providers/CloudStorageProvider.jsx';

// Pull-log banner tag → translation key. The underlying `p.banner` values are
// English data-comparison strings (set in statsTabData below) — only the
// on-screen label is translated.
// Known 5★ weapon names, used to validate community-pulls submissions below — mirrors the
// ALL_CHARACTERS.has(p.name) check already done for characters, so a name that doesn't match
// either known list (e.g. a stray API name quirk) is dropped instead of silently pushed through
// with no matching collectionImages entry (which used to render as a blank, icon-less row).
const ALL_5STAR_WEAPONS_SET = new Set(ALL_5STAR_WEAPONS);

const PULL_BANNER_LABEL_KEYS = {
  Featured: 'analytics.perBanner.bannerNames.featuredResonator',
  Weapon: 'analytics.perBanner.bannerNames.featuredWeapon',
  'Standard Resonator': 'analytics.perBanner.bannerNames.standardResonator',
  'Standard Weapon': 'analytics.perBanner.bannerNames.standardWeapon',
  Beginner: 'analytics.pullLog.beginnerBanner',
};

function AnalyticsTab({
  state,
  dispatch,
  setActiveTab,
  overallStats,
  luckRating,
  trophies,
  collectionImages,
  toast,
  hashUidForStorage,
  checkFirebaseRateLimit,
  headerPadding,
  navPadding,
}) {
  const { getFirebaseAuth, firebaseUrl, firebaseFetch, FIREBASE_AVAILABLE } = useCloudStorage();
  // ── Analytics-only state ──────────────────────────────────────────────────
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedTrophy, setSelectedTrophy] = useState(null);
  const [leaderboardConsented, setLeaderboardConsented] = useState(() => {
    try { return localStorage.getItem('ww-leaderboard-consent') === 'true'; } catch { return false; }
  });
  const [showConsentModal, setShowConsentModal] = useState(false);
  const consentResolveRef = useRef(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [leaderboardSubmitting, setLeaderboardSubmitting] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  const rateLimitTimerRef = useRef(null);
  const [leaderboardTab, setLeaderboardTab] = useState('rankings');
  const [showAchievements, setShowAchievements] = useState(false);
  const [communityPulls, setCommunityPulls] = useState(null);
  const [allLeaderboardEntries, setAllLeaderboardEntries] = useState([]);
  const [hashedProfileUid, setHashedProfileUid] = useState(null);
  const [userLeaderboardId] = useState(() => {
    if (!storageAvailable) return null;
    try {
      let id = localStorage.getItem('ww-leaderboard-id');
      if (!id) {
        try {
          const arr = new Uint8Array(4);
          crypto.getRandomValues(arr);
          id = 'WW' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        } catch {
          id = 'WW' + Math.random().toString(36).substring(2, 8).toUpperCase();
        }
        localStorage.setItem('ww-leaderboard-id', id);
      }
      return id;
    } catch {
      return null;
    }
  });

  // ── Refs ───────────────────────────────────────────────────────────────────
  const leaderboardLoadingRef = useRef(false);
  const submittingRef = useRef(false);
  const leaderboardTrapRef = useFocusTrap(showLeaderboard);
  const trophyTrapRef = useFocusTrap(!!selectedTrophy);

  // Clean up cooldown timer on unmount
  useEffect(() => {
    return () => { if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current); };
  }, []);

  // ── Computed values ────────────────────────────────────────────────────────
  const sanitizeFirebaseKey = (key) => key ? key.replace(/[^a-zA-Z0-9_-]/g, '_') : key;
  const effectiveLeaderboardId = sanitizeFirebaseKey(state.profile.uid) || userLeaderboardId;

  // [SECTION:STATS] ── Community stats & histogram computation ────────────────
  const communityStats = useMemo(() => {
    if (!allLeaderboardEntries.length) return null;
    const entries = allLeaderboardEntries;
    const totalPlayers = entries.length;
    const avgPityAll = (entries.reduce((s, e) => s + (e.avgPity || 0), 0) / (totalPlayers || 1)).toFixed(1);
    const totalFiveStars = entries.reduce((s, e) => s + (e.pulls ?? 0), 0);
    const totalPullsAll = entries.reduce((s, e) => s + (e.totalPulls ?? 0), 0);
    const totalWon = entries.reduce((s, e) => s + (e.won5050 ?? 0), 0);
    const totalLost = entries.reduce((s, e) => s + (e.lost5050 ?? 0), 0);
    const globalWinRate = (totalWon + totalLost) > 0 ? ((totalWon / (totalWon + totalLost)) * 100).toFixed(1) : null;
    const luckiest = entries.length > 0 ? entries.reduce((min, e) => e.avgPity < min.avgPity ? e : min) : null;
    const unluckiest = entries.length > 0 ? entries.reduce((max, e) => e.avgPity > max.avgPity ? e : max) : null;
    return { totalPlayers, avgPityAll, totalFiveStars, totalPullsAll, totalWon, totalLost, globalWinRate, luckiest, unluckiest };
  }, [allLeaderboardEntries]);

  const statsTabData = useMemo(() => {
    const featured = state.profile.featured?.history || [];
    const weapon = state.profile.weapon?.history || [];
    const stdChar = state.profile.standardChar?.history || [];
    const stdWeap = state.profile.standardWeap?.history || [];
    const beginner = state.profile.beginner?.history || [];
    const allHist = [...featured, ...weapon, ...stdChar, ...stdWeap];
    const fiveStars = allHist.filter(p => p.rarity === 5 && p.pity > 0);
    const pullLogFiveStars = [
      ...featured.map(p => ({...p, banner: 'Featured'})),
      ...weapon.map(p => ({...p, banner: 'Weapon'})),
      ...stdChar.map(p => ({...p, banner: 'Standard Resonator'})),
      ...stdWeap.map(p => ({...p, banner: 'Standard Weapon'})),
      ...beginner.map(p => ({...p, banner: 'Beginner'})),
    ].filter(p => p.rarity === 5 && p.name).sort((a, b) => new Date(b.timestamp ?? 0) - new Date(a.timestamp ?? 0));
    const resHist = [...featured, ...stdChar, ...beginner.filter(p => p.name && ALL_CHARACTERS.has(p.name))];
    const wepHist = [...weapon, ...stdWeap, ...beginner.filter(p => p.name && !ALL_CHARACTERS.has(p.name))];
    const totalObtained = {
      res5: resHist.filter(p => p.rarity === 5).length,
      res4: resHist.filter(p => p.rarity === 4).length,
      wep5: wepHist.filter(p => p.rarity === 5).length,
      wep4: wepHist.filter(p => p.rarity === 4).length,
      wep3: wepHist.filter(p => p.rarity === 3).length,
    };
    const { buckets: histogramBuckets, labels: allBucketLabels } = buildPityHistogram(fiveStars, HARD_PITY);
    const histogramStats = fiveStars.length >= 2 ? {
      maxCount: Math.max(...Object.values(histogramBuckets), 1),
      avgPity: fiveStars.length > 0 ? (fiveStars.reduce((sum, p) => sum + p.pity, 0) / fiveStars.length).toFixed(1) : '0',
      minPity: fiveStars.length ? Math.min(...fiveStars.map(p => p.pity)) : 0,
      maxPity: fiveStars.length ? Math.max(...fiveStars.map(p => p.pity)) : 0,
    } : null;
    const featuredHist = featured;
    const weaponHist = weapon;
    const stdCharHist = stdChar;
    const stdWeapHist = stdWeap;
    return { allHist, featuredHist, weaponHist, stdCharHist, stdWeapHist, fiveStars, pullLogFiveStars, totalObtained, histogramBuckets, allBucketLabels, histogramStats };
  }, [state.profile.featured?.history, state.profile.weapon?.history, state.profile.standardChar?.history, state.profile.standardWeap?.history, state.profile.beginner?.history]);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.profile.uid) {
      hashUidForStorage(state.profile.uid).then(setHashedProfileUid).catch(() => setHashedProfileUid(null));
    } else {
      setHashedProfileUid(null);
    }
  }, [state.profile.uid, hashUidForStorage]);

  // [SECTION:FIREBASE] ── Leaderboard & community data (Firebase) ────────────
  const loadLeaderboard = useCallback(async () => {
    if (leaderboardLoadingRef.current) return;
    leaderboardLoadingRef.current = true;
    setLeaderboardLoading(true);
    try {
      const authToken = await getFirebaseAuth();
      let res;
      try {
        res = await firebaseFetch('leaderboard', authToken);
      } catch (networkErr) {
        // Network failure — wait 2s and retry once
        await new Promise(r => setTimeout(r, 2000));
        res = await firebaseFetch('leaderboard', authToken);
      }
      if (!res.ok) {
        if (res.status >= 500) {
          // Server error — wait 2s and retry once
          await new Promise(r => setTimeout(r, 2000));
          res = await firebaseFetch('leaderboard', authToken);
        }
        if (!res.ok) throw new Error(`Firebase read failed (${res.status})`);
      }
      const data = await res.json();
      if (data) {
        const rawEntries = Object.values(data).filter(e => e && e.avgPity && e.id);
        const deduped = new Map();
        rawEntries.forEach(e => {
          const uidKey = e.uid || null;
          const statsKey = `${e.avgPity}|${e.totalPulls ?? ''}|${e.pulls ?? ''}|${e.won5050 ?? ''}|${e.lost5050 ?? ''}|${e.id ?? ''}`;
          const key = uidKey || statsKey;
          const existing = deduped.get(key);
          if (!existing ||
              (e.uid && !existing.uid) ||
              ((e.timestamp ?? 0) > (existing.timestamp ?? 0))) {
            deduped.set(key, e);
          }
        });
        const entries = [...deduped.values()];
        entries.sort((a, b) => a.avgPity - b.avgPity);
        setAllLeaderboardEntries(entries);
        setLeaderboardData(entries.slice(0, LEADERBOARD_DISPLAY_LIMIT));
        setLeaderboardError(false);
      } else {
        setAllLeaderboardEntries([]);
        setLeaderboardData([]);
        setLeaderboardError(false);
      }
    } catch (e) {
      console.error('Leaderboard load error:', e);
      setAllLeaderboardEntries([]);
      setLeaderboardData([]);
      setLeaderboardError(true);
    }
    setLeaderboardLoading(false);
    leaderboardLoadingRef.current = false;
  }, [getFirebaseAuth, firebaseFetch]);

  const loadCommunityPulls = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      let res;
      try {
        res = await firebaseFetch('community-pulls', authToken);
      } catch (networkErr) {
        // Network failure — wait 2s and retry once
        await new Promise(r => setTimeout(r, 2000));
        res = await firebaseFetch('community-pulls', authToken);
      }
      if (!res.ok && res.status >= 500) {
        // Server error — wait 2s and retry once
        await new Promise(r => setTimeout(r, 2000));
        res = await firebaseFetch('community-pulls', authToken);
      }
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const charCounts = {};
          const weapCounts = {};
          const playerCount = Object.keys(data).length;
          Object.values(data).forEach(entry => {
            (entry.chars || []).forEach(name => { charCounts[name] = (charCounts[name] || 0) + 1; });
            (entry.weaps || []).forEach(name => { weapCounts[name] = (weapCounts[name] || 0) + 1; });
          });
          const sortedChars = Object.entries(charCounts).sort((a, b) => b[1] - a[1]);
          const sortedWeaps = Object.entries(weapCounts).sort((a, b) => b[1] - a[1]);
          setCommunityPulls({ chars: sortedChars, weaps: sortedWeaps, playerCount });
        }
      }
    } catch (e) { console.error('Community pulls load error:', e); }
  }, [getFirebaseAuth, firebaseFetch]);

  const submitToLeaderboard = useCallback(async () => {
    if (!effectiveLeaderboardId || !overallStats?.avgPity || overallStats.avgPity === '—') return;
    if (submittingRef.current) return;
    if (!checkFirebaseRateLimit('leaderboard-submit')) {
      toast?.addToast?.(t('analytics.toast.pleaseWait'), 'warning');
      // Start visual cooldown countdown (5 seconds to match FIREBASE_WRITE_COOLDOWN_MS)
      if (!rateLimitTimerRef.current) {
        setRateLimitCooldown(5);
        rateLimitTimerRef.current = setInterval(() => {
          setRateLimitCooldown(prev => {
            if (prev <= 1) {
              clearInterval(rateLimitTimerRef.current);
              rateLimitTimerRef.current = null;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return;
    }
    if (!leaderboardConsented) {
      const consent = await new Promise(resolve => {
        consentResolveRef.current = resolve;
        setShowConsentModal(true);
      });
      if (!consent) return;
      setLeaderboardConsented(true);
      try { localStorage.setItem('ww-leaderboard-consent', 'true'); } catch {}
    }
    submittingRef.current = true;
    setLeaderboardSubmitting(true);
    try {
      const avgPity = parseFloat(overallStats.avgPity);
      const pulls = overallStats.fiveStars ?? 0;
      const totalPulls = overallStats.totalPulls ?? 0;
      const won5050 = overallStats.won5050 ?? 0;
      const lost5050 = overallStats.lost5050 ?? 0;
      if (isNaN(avgPity) || avgPity < 1 || avgPity > 80) throw new Error('Invalid average pity value');
      if (pulls < 0 || pulls > 9999) throw new Error('Invalid 5★ pull count');
      if (totalPulls < 0 || totalPulls > 999999) throw new Error('Invalid total pull count');
      if (won5050 < 0 || won5050 > pulls) throw new Error('Invalid 50/50 win count');
      if (lost5050 < 0 || lost5050 > pulls) throw new Error('Invalid 50/50 loss count');
      if (effectiveLeaderboardId.length > 64) throw new Error('Leaderboard ID too long');
      const hashedUid = await hashUidForStorage(state.profile.uid);
      const entry = {
        id: effectiveLeaderboardId,
        uid: hashedUid,
        avgPity,
        pulls,
        totalPulls,
        won5050,
        lost5050,
        timestamp: Date.now()
      };
      const authToken = await getFirebaseAuth();
      const res = await firebaseFetch(`leaderboard/${effectiveLeaderboardId}`, authToken, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (!res.ok) throw new Error(`Firebase write failed (${res.status})`);
      const { charHistory, weapHistory } = getMergedHistories(state.profile);
      const owned5Chars = [...new Set(charHistory.filter(p => p.rarity === 5 && p.name && ALL_CHARACTERS.has(p.name)).map(p => p.name))];
      const owned5Weaps = [...new Set(weapHistory.filter(p => p.rarity === 5 && p.name && ALL_5STAR_WEAPONS_SET.has(p.name)).map(p => p.name))];
      if (owned5Chars.length > 0 || owned5Weaps.length > 0) {
        try {
          await firebaseFetch(`community-pulls/${effectiveLeaderboardId}`, authToken, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chars: owned5Chars, weaps: owned5Weaps, timestamp: Date.now() })
          });
        } catch { /* community-pulls is best-effort */ }
      }
      if (state.profile.uid && userLeaderboardId && userLeaderboardId !== effectiveLeaderboardId) {
        try {
          await firebaseFetch(`leaderboard/${userLeaderboardId}`, authToken, { method: 'DELETE' });
          await firebaseFetch(`community-pulls/${userLeaderboardId}`, authToken, { method: 'DELETE' });
        } catch { /* best-effort cleanup */ }
      }
      toast?.addToast?.(t('analytics.toast.submitted'), 'success');
      loadLeaderboard();
      loadCommunityPulls();
    } catch (e) {
      console.error('Submit error:', e);
      toast?.addToast?.(t('analytics.toast.failedSubmit', { error: e.message }), 'error');
    } finally {
      submittingRef.current = false;
      setLeaderboardSubmitting(false);
    }
  }, [effectiveLeaderboardId, userLeaderboardId, overallStats, state.profile, toast, loadLeaderboard, loadCommunityPulls, leaderboardConsented, getFirebaseAuth, firebaseFetch, hashUidForStorage, checkFirebaseRateLimit]);

  // Load leaderboard data when modal opens
  useEffect(() => {
    if (showLeaderboard) {
      loadLeaderboard();
      loadCommunityPulls();
    }
  }, [showLeaderboard, loadLeaderboard, loadCommunityPulls]);
  // [SECTION:RENDER] ── JSX output ───────────────────────────────────────────
  return (
    <div role="tabpanel" id="tabpanel-analytics" aria-labelledby="tab-analytics" tabIndex="0">
    <TabErrorBoundary tabName={t('tabs.stats')}>
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="stats" />

            {state.profile.importedAt && (
              showAchievements ? (
                <AchievementsTool onClose={() => setShowAchievements(false)} />
              ) : (
                <Card>
                  <CardHeader action={<button onClick={() => setShowAchievements(true)} className="text-yellow-400 text-sm flex items-center gap-1 hover:text-yellow-300 transition-colors" aria-label={t('analytics.achievements.openAria')}><Award size={12} /> {t('analytics.achievements.open')}</button>}>
                    <Award size={14} className="text-yellow-400 inline-block mr-1.5 -mt-0.5" /> {t('analytics.achievements.title')}
                  </CardHeader>
                  <CardBody>
                    <p className="text-gray-400 text-sm">{t('analytics.achievements.description')}</p>
                  </CardBody>
                </Card>
              )
            )}

            {!overallStats ? (
              // Centered on the actual visible viewport (between the floating header and
              // bottom nav), not just within an arbitrary fixed-height box — a static
              // min-h-[384px] only centers the card relative to itself, which reads as
              // "stuck near the top" on any screen taller than ~384px + header/nav once
              // the Achievements card above it (when present) is accounted for.
              <div
                className="flex items-center justify-center"
                style={{ minHeight: `calc(100dvh - ${(headerPadding ?? 64) + (navPadding ?? 64)}px)` }}
              >
                <Card className="w-full">
                  <CardBody className="kuro-empty-state text-center py-8">
                    <BarChart3 size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-300 text-md font-medium">{t('analytics.empty.awaitingSignal')}</p>
                    <p className="text-gray-400 text-base mt-1 mb-3">{t('analytics.empty.importPrompt')}</p>
                    <button onClick={() => setActiveTab('profile')} className="kuro-btn active-cyan text-base px-4 py-2">{t('analytics.empty.openProfile')}</button>
                  </CardBody>
                </Card>
              </div>
            ) : !overallStats?.totalPulls ? (
              <div className="space-y-2">
                <div className="kuro-skeleton kuro-skeleton-stat rounded-lg" />
                <div className="kuro-skeleton kuro-skeleton-stat rounded-lg" />
                <div className="kuro-skeleton kuro-skeleton-row rounded-lg" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Success Rate Card */}
                {luckRating && (
                  <Card>
                    <CardHeader action={FIREBASE_AVAILABLE ? <button onClick={() => setShowLeaderboard(true)} className="text-cyan-400 text-sm flex items-center gap-1 hover:text-cyan-300 transition-colors" aria-label={t('analytics.luck.leaderboardAria')}><TrendingUp size={12} /> {t('analytics.luck.leaderboardLink')}</button> : null}>{t('analytics.luck.title')}</CardHeader>
                    <CardBody>
                      <div className="flex items-center gap-4">
                        <div className="luck-badge rounded-xl p-[2px] flex-shrink-0" style={{'--badge-color': luckRating.color, '--badge-speed': '12s'}}>
                          <div className="luck-badge-inner rounded-xl px-4 py-3 text-center" style={{minWidth: '90px'}}>
                            <div className="text-[16px] font-bold tracking-widest uppercase mb-1" style={{color: luckRating.color, fontFamily: 'var(--font-accent)'}}>{luckRating.tier}</div>
                            <div className="text-[24px] font-extrabold kuro-number" style={{color: luckRating.color, textShadow: `0 0 20px ${luckRating.color}40`, fontFamily: 'var(--font-accent)', letterSpacing: '0.05em'}}>{luckRating.rating}</div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-stat)' }}>
                            <div className="h-full rounded-full transition-[width] duration-300 progress-fill" style={{width: `${luckRating.percentile}%`, background: `linear-gradient(90deg, ${luckRating.color}40, ${luckRating.color})`}} />
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-gray-400 text-sm">{t('analytics.luck.avgPity')}</span>
                            <span className="text-gray-200 text-base font-medium">{overallStats?.avgPity}</span>
                          </div>
                          <p className="text-sm text-center" style={{color: `${luckRating.color}90`}}>
                            {luckRating.percentile >= 80 ? t('analytics.luck.percentileHigh', { percentile: luckRating.percentile })
                              : luckRating.percentile >= 60 ? t('analytics.luck.percentileGood', { percentile: luckRating.percentile })
                              : luckRating.percentile >= 40 ? t('analytics.luck.percentileAverage', { percentile: luckRating.percentile })
                              : t('analytics.luck.percentileLow')}
                          </p>
                          {/* AUDIT-FIX H12: gray-600→gray-500 for WCAG AA contrast */}
                          <p className="text-sm text-gray-500 text-center mt-1">{t('analytics.luck.basedOn')}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}
                
                {/* P13-FIX: MEDIUM-4 — Accessible consent modal (replaces window.confirm) */}
                <FocusTrapModal isOpen={showConsentModal} onClose={() => { setShowConsentModal(false); consentResolveRef.current?.(false); }} className="" onClick={() => { setShowConsentModal(false); consentResolveRef.current?.(false); }} ariaLabel={t('analytics.consent.ariaLabel')} centered padding="p-3">
                  <div className="kuro-card w-full max-w-sm" onClick={e => e.stopPropagation()}>
                    <div className="kuro-card-inner p-6 space-y-4 rounded-2xl">
                      <h3 className="text-white font-semibold text-xl">{t('analytics.consent.title')}</h3>
                      <div className="text-gray-300 text-base space-y-2">
                        <p>{t('analytics.consent.intro')}</p>
                        <ul className="list-disc pl-4 space-y-1 text-gray-400">
                          <li>{t('analytics.consent.playerIdPrefix')} (<span className="text-cyan-400 font-mono">{effectiveLeaderboardId}</span>)</li>
                          <li>{t('analytics.consent.stats')}</li>
                          <li>{t('analytics.consent.owned')}</li>
                        </ul>
                        <p className="text-gray-500">{t('analytics.consent.pseudonymous')}</p>
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button className="kuro-btn flex-1" onClick={() => { setShowConsentModal(false); consentResolveRef.current?.(false); }}>{t('analytics.consent.decline')}</button>
                        <button className="kuro-btn flex-1 active-gold" onClick={() => { setShowConsentModal(false); consentResolveRef.current?.(true); }}>{t('analytics.consent.accept')}</button>
                      </div>
                    </div>
                  </div>
                </FocusTrapModal>

                {/* Luck Leaderboard Modal */}
                <FocusTrapModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} className="" onClick={() => setShowLeaderboard(false)} ariaLabel={t('analytics.leaderboard.ariaLabel')} centered padding="p-3">
                    <div className="kuro-card w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                      <div className="px-4 py-3 border-b border-[var(--border-medium)]" data-sheet-header>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold text-xl">{t('analytics.leaderboard.title')}</h3>
                            <p className="text-gray-400 text-sm">{t('analytics.leaderboard.subtitle')}</p>
                          </div>
                          <button onClick={() => setShowLeaderboard(false)} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label={t('analytics.leaderboard.closeAria')}>
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex gap-1" role="tablist" aria-label={t('analytics.leaderboard.tablistAria')}>
                          <button onClick={() => setLeaderboardTab('rankings')} role="tab" aria-selected={leaderboardTab === 'rankings'} className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-all ${leaderboardTab === 'rankings' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                            {t('analytics.leaderboard.rankings')}
                          </button>
                          <button onClick={() => setLeaderboardTab('popular')} role="tab" aria-selected={leaderboardTab === 'popular'} className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-all ${leaderboardTab === 'popular' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                            {t('analytics.leaderboard.mostConvened')}
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {leaderboardTab === 'rankings' ? (
                          <>
                            {leaderboardLoading ? (
                              <div className="space-y-2 py-2" aria-label={t('analytics.leaderboard.loadingAria')}>
                                {[...Array(6)].map((_, i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                    <div className="kuro-skeleton kuro-skeleton-circle w-[30px] h-[30px] flex-shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                      <div className="kuro-skeleton kuro-skeleton-text" style={{ width: `${55 + i * 7}%` }} />
                                      <div className="kuro-skeleton kuro-skeleton-text" style={{ width: '35%' }} />
                                    </div>
                                    <div className="kuro-skeleton kuro-skeleton-text w-12 h-4 flex-shrink-0" />
                                  </div>
                                ))}
                              </div>
                            ) : leaderboardData.length === 0 ? (
                              <div className="kuro-empty-state text-center py-8">
                                <div className="text-gray-400 text-md mb-2">{leaderboardError ? t('analytics.leaderboard.loadFailed') : t('analytics.leaderboard.noSignals')}</div>
                                <div className="text-gray-500 text-sm">{leaderboardError ? t('analytics.leaderboard.checkConnection') : t('analytics.leaderboard.beFirst')}</div>
                              </div>
                            ) : (
                              leaderboardData.map((entry, i) => {
                                const isYou = entry.id === effectiveLeaderboardId ||
                                  (entry.uid && hashedProfileUid && entry.uid === hashedProfileUid) ||
                                  (!entry.uid && overallStats?.avgPity && entry.avgPity === parseFloat(overallStats.avgPity) && entry.totalPulls === (overallStats.totalPulls ?? 0) && entry.pulls === (overallStats.fiveStars ?? 0));
                                return (
                                  <div 
                                    key={entry.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isYou ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-white/5'}`}
                                  >
                                    <div 
                                      className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                                      style={{
                                        background: i < 3 ? `linear-gradient(135deg, ${(MEDAL_COLORS[i] ?? '#9ca3af')}40, ${(MEDAL_COLORS[i] ?? '#9ca3af')}20)` : 'rgba(255,255,255,0.1)',
                                        color: i < 3 ? MEDAL_COLORS[i] : '#9ca3af',
                                        border: i < 3 ? `1px solid ${(MEDAL_COLORS[i] ?? '#9ca3af')}50` : '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: i < 3 ? `0 0 10px ${(MEDAL_COLORS[i] ?? '#9ca3af')}30` : 'none'
                                      }}
                                    >
                                      {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-base font-medium truncate ${isYou ? 'text-cyan-400' : 'text-gray-200'}`}>
                                          {isYou ? (entry.id?.slice(0, 4) + t('analytics.leaderboard.youSuffix')) : (entry.id?.slice(0, 4) + '***')}
                                        </span>
                                        {isYou && <span className="kuro-badge kuro-badge-cyan">{t('analytics.leaderboard.you')}</span>}
                                      </div>
                                      <div className="text-sm text-gray-500">{t('analytics.leaderboard.fiveStars', { n: formatNumber(entry.pulls) })}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <div className={`text-xl font-bold ${entry.avgPity <= 45 ? 'text-emerald-400' : entry.avgPity <= 55 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {entry.avgPity.toFixed(1)}
                                      </div>
                                      <div className="text-sm text-gray-400">{t('analytics.leaderboard.avgPityLabel')}</div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </>
                        ) : (
                          <>
                            {!communityPulls ? (
                              <div className="space-y-1.5 py-2" aria-label={t('analytics.leaderboard.loadingCommunityAria')}>
                                <div className="kuro-skeleton kuro-skeleton-text mx-auto mb-2" style={{ width: '40%' }} />
                                <div className="kuro-skeleton kuro-skeleton-text w-24 mb-1.5" style={{ height: '8px' }} />
                                {[...Array(5)].map((_, i) => (
                                  <div key={i} className="flex items-center gap-3 py-1.5">
                                    <div className="kuro-skeleton kuro-skeleton-text w-4 h-3 flex-shrink-0" />
                                    <div className="kuro-skeleton w-[30px] h-[30px] rounded-md flex-shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <div className="kuro-skeleton kuro-skeleton-text" style={{ width: `${50 + i * 8}%` }} />
                                      <div className="kuro-skeleton h-1 rounded-full" style={{ width: `${70 - i * 10}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                <p className="text-gray-400 text-sm text-center mb-1">{t(`analytics.leaderboard.playersReporting${getPluralForm(communityPulls.playerCount) === 'one' ? 'One' : 'Other'}`, { n: formatNumber(communityPulls.playerCount) })}</p>
                                {communityPulls.chars.length > 0 && (
                                  <>
                                    <p className="text-sm text-yellow-400/80 font-semibold uppercase tracking-wider mb-1">{t('analytics.leaderboard.resonators')}</p>
                                    {communityPulls.chars.slice(0, 10).map(([name, count], i) => {
                                      const pct = communityPulls.playerCount > 0 ? Math.round((count / communityPulls.playerCount) * 100) : 0;
                                      const imgUrl = collectionImages[name] || '';
                                      return (
                                        <div key={name} className="flex items-center gap-3 py-1.5">
                                          <span className="text-sm font-bold w-4 text-right" style={{color: i < 3 ? MEDAL_COLORS[i] : '#6b7280'}}>{i + 1}</span>
                                          {imgUrl && <img src={imgUrl} alt={name} className="w-[30px] h-[30px] rounded-md object-cover bg-neutral-800 flex-shrink-0" loading="lazy" onError={hideOnError} />}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                              <span className="text-base text-gray-200 truncate">{name}</span>
                                              <span className="text-sm text-gray-500 flex-shrink-0 ml-2">{pct}%</span>
                                            </div>
                                            <div className="h-1 rounded-full mt-0.5 overflow-hidden" style={{ background: 'var(--bg-stat)' }}>
                                              <div className="h-full rounded-full" style={{width: `${pct}%`, background: i < 3 ? MEDAL_COLORS[i] : '#4b5563'}} />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </>
                                )}
                                {communityPulls.weaps.length > 0 && (
                                  <>
                                    <p className="text-sm text-cyan-400/80 font-semibold uppercase tracking-wider mt-3 mb-1">{t('analytics.leaderboard.weapons')}</p>
                                    {communityPulls.weaps.slice(0, 10).map(([name, count], i) => {
                                      const pct = communityPulls.playerCount > 0 ? Math.round((count / communityPulls.playerCount) * 100) : 0;
                                      const imgUrl = collectionImages[name] || '';
                                      return (
                                        <div key={name} className="flex items-center gap-3 py-1.5">
                                          <span className="text-sm font-bold w-4 text-right" style={{color: i < 3 ? MEDAL_COLORS[i] : '#6b7280'}}>{i + 1}</span>
                                          {imgUrl && <div className="w-[30px] h-[30px] rounded-md overflow-hidden bg-neutral-800 flex-shrink-0 holo-5star" style={{ position: 'relative' }}><img src={imgUrl} alt={name} className="w-full h-full object-cover" loading="lazy" onError={hideOnError} /></div>}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                              <span className="text-base text-gray-200 truncate">{name}</span>
                                              <span className="text-sm text-gray-500 flex-shrink-0 ml-2">{pct}%</span>
                                            </div>
                                            <div className="h-1 rounded-full mt-0.5 overflow-hidden" style={{ background: 'var(--bg-stat)' }}>
                                              <div className="h-full rounded-full" style={{width: `${pct}%`, background: i < 3 ? MEDAL_COLORS[i] : '#4b5563'}} />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                      {/* Community Stats */}
                      {communityStats && leaderboardTab === 'rankings' && (
                        <div className="px-4 py-3 border-t border-[var(--border-medium)] space-y-2">
                          <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                            <BarChart3 size={12} /> {t('analytics.leaderboard.communityStats')}
                            <span className="text-gray-500 font-normal">{t('analytics.leaderboard.playersCount', { n: formatNumber(communityStats.totalPlayers) })}</span>
                          </p>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-yellow-400 font-bold text-base">{communityStats.avgPityAll}</div>
                              <div className="text-gray-400 text-sm">{t('analytics.leaderboard.globalAvgPity')}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-emerald-400 font-bold text-base">{communityStats.globalWinRate != null ? `${communityStats.globalWinRate}%` : '—'}</div>
                              <div className="text-gray-400 text-sm">{t('analytics.leaderboard.winRate5050')}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-cyan-400 font-bold text-base">{communityStats.totalFiveStars}</div>
                              <div className="text-gray-400 text-sm">{t('analytics.leaderboard.total5Star')}</div>
                            </div>
                          </div>
                          {communityStats.totalPullsAll > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{t('analytics.leaderboard.totalConvenesTracked', { n: formatNumber(communityStats.totalPullsAll) })}</span>
                              <span className="text-gray-500">{t('analytics.leaderboard.winLoss', { won: formatNumber(communityStats.totalWon), lost: formatNumber(communityStats.totalLost) })}</span>
                            </div>
                          )}
                          {communityStats.luckiest && communityStats.unluckiest && communityStats.totalPlayers >= 2 && (
                            <div className="flex justify-between text-sm gap-2">
                              <span className="text-emerald-500/70 flex items-center gap-0.5"><Clover size={12} /> {t('analytics.leaderboard.luckiest', { pity: communityStats.luckiest.avgPity.toFixed(1) })}</span>
                              <span className="text-red-500/70 flex items-center gap-0.5"><TrendingDown size={12} /> {t('analytics.leaderboard.unluckiest', { pity: communityStats.unluckiest.avgPity.toFixed(1) })}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-4 border-t border-[var(--border-medium)] space-y-2">
                        {effectiveLeaderboardId && overallStats?.avgPity && overallStats.avgPity !== '—' ? (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">{t('analytics.leaderboard.yourId')} <span className="text-cyan-400 font-mono">{state.profile.uid ? (state.profile.uid.slice(0, 4) + '***') : effectiveLeaderboardId}</span>{state.profile.uid && <span className="text-gray-500 ml-1">{t('analytics.leaderboard.uidTag')}</span>}</span>
                              <span className="text-gray-400">{t('analytics.leaderboard.yourAvg')} <span className="text-white font-bold">{overallStats.avgPity}</span></span>
                            </div>
                            <button
                              onClick={submitToLeaderboard}
                              disabled={leaderboardSubmitting || rateLimitCooldown > 0}
                              className={`w-full kuro-btn active-cyan py-2 text-base font-medium ${leaderboardSubmitting || rateLimitCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {leaderboardSubmitting ? t('analytics.leaderboard.submitting') : rateLimitCooldown > 0 ? t('analytics.leaderboard.waitSeconds', { seconds: rateLimitCooldown }) : t('analytics.leaderboard.submitScore')}
                            </button>
                            <p className="text-gray-400 text-sm text-center">{t('analytics.leaderboard.shareNotice')}</p>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm text-center">{t('analytics.leaderboard.importToParticipate')}</p>
                        )}
                      </div>
                    </div>
                </FocusTrapModal>

                {/* 5★ Pull Log — moved above Trophies for user workflow priority */}
                <Card>
                  <CardHeader>{t('analytics.pullLog.title')}</CardHeader>
                  <CardBody>
                    {(() => {
                      const fiveStars = statsTabData.pullLogFiveStars;
                      if (fiveStars.length === 0) return <div className="kuro-empty-state text-center py-4"><p className="text-gray-400 text-base">{t('analytics.pullLog.awaitingSignal')}</p><p className="text-gray-500 text-sm mt-1">{t('analytics.pullLog.importPrompt')}</p></div>;
                      return (
                        <div className="space-y-1 max-h-60 overflow-y-auto kuro-scroll">
                          {fiveStars.map((p, i) => {
                            const pityColor = p.pity <= 20 ? '#22c55e' : p.pity <= 40 ? '#4ade80' : p.pity <= 50 ? '#edaf18' : p.pity <= 60 ? '#f97316' : '#ef4444';
                            const pityTextColor = p.pity <= 20 ? 'text-emerald-400' : p.pity <= 40 ? 'text-green-400' : p.pity <= 50 ? 'text-yellow-400' : p.pity <= 60 ? 'text-orange-400' : 'text-red-400';
                            const imgUrl = collectionImages[p.name] || '';
                            return (
                              <div key={p.id || `pull-${p.name}-${p.pity}-${p.timestamp || i}`} className="pull-log-row flex items-center justify-between p-1.5 rounded text-base" style={{'--pity-color': pityColor, background: 'rgba(255,255,255,0.03)'}}>
                                <div className="flex items-center gap-2 min-w-0">
                                  {imgUrl && <img src={imgUrl} alt={p.name} className="w-[24px] h-[24px] rounded object-cover bg-neutral-800 flex-shrink-0" loading="lazy" onError={hideOnError} />}
                                  <span className="text-yellow-400 font-medium truncate">{p.name}</span>
                                  <span className="text-gray-500 flex-shrink-0">{PULL_BANNER_LABEL_KEYS[p.banner] ? t(PULL_BANNER_LABEL_KEYS[p.banner]) : p.banner}</span>
                                  {p.banner === 'Featured' && p.won5050 === true && <span className="text-emerald-400 text-base font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 flex-shrink-0" aria-label={t('analytics.pullLog.wonAria')}>✓ W</span>}
                                  {p.banner === 'Featured' && p.won5050 === false && <span className="text-red-400 text-base font-bold px-1.5 py-0.5 rounded bg-red-500/20 flex-shrink-0" aria-label={t('analytics.pullLog.lostAria')}>✗ L</span>}
                                  {p.banner === 'Featured' && p.won5050 === null && <span className="text-amber-400 text-base font-bold px-1.5 py-0.5 rounded bg-amber-500/20 flex-shrink-0" title={t('analytics.pullLog.guaranteedTitle')} aria-label={t('analytics.pullLog.guaranteedAria')}>G</span>}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`font-bold kuro-number ${pityTextColor}`}>{p.pity ?? '?'}</span>
                                  {p.timestamp && <span className="text-gray-400 text-base">{formatDate(new Date(p.timestamp), {month:'short', day:'numeric'})}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* Trophies & Achievements */}
                {trophies && trophies.list.length === 0 && (
                  <Card>
                    <CardHeader>
                      <span className="flex items-center gap-1.5"><Trophy size={14} className="text-yellow-400" /> {t('analytics.trophies.title')}</span>
                    </CardHeader>
                    <CardBody>
                      <p className="kuro-empty-state text-gray-400 text-base text-center py-4">{t('analytics.trophies.emptyImportPrompt')}</p>
                    </CardBody>
                  </Card>
                )}
                {trophies && trophies.list.length > 0 && (
                  <Card>
                    <CardHeader action={<span className="text-gray-500 text-sm">{t('analytics.trophies.earned', { n: formatNumber(trophies.list.length) })}</span>}>
                      <span className="flex items-center gap-1.5"><Trophy size={14} className="text-yellow-400" /> {t('analytics.trophies.title')} <span className="text-gray-500 font-normal text-sm">({formatNumber(trophies.list.length)})</span></span>
                    </CardHeader>
                    <CardBody>
                      {(() => {
                      
                      return (<>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {trophies.list.map(trophy => {
                          const IconComponent = TROPHY_ICON_MAP[trophy.icon] || Star;
                          return (
                            <div
                              key={trophy.id}
                              className="relative p-3 rounded-lg text-center transition-all active:scale-95 cursor-pointer"
                              role="button" tabIndex={0} aria-label={t('analytics.trophies.trophyAria', { name: trophy.name })}
                              onClick={(e) => { e.stopPropagation(); setSelectedTrophy(trophy.id); }}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTrophy(trophy.id); } }}
                              style={{
                                background: `linear-gradient(135deg, ${trophy.color}18, ${trophy.color}08)`,
                                border: `1px solid ${trophy.color}50`,
                                boxShadow: `0 0 20px ${trophy.color}15, inset 0 0 20px ${trophy.color}05`
                              }}
                            >
                              <div 
                                className="w-8 h-8 mx-auto mb-1.5 rounded-full flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, ${trophy.color}30, ${trophy.color}10)`,
                                  boxShadow: `0 0 15px ${trophy.color}40`
                                }}
                              >
                                <IconComponent size={16} style={{ color: trophy.color }} />
                              </div>
                              <div className="text-sm font-bold text-white truncate">{trophy.name}</div>
                              {trophy.desc && <div className="text-sm text-gray-400 truncate mt-0.5" title={trophy.desc}>{trophy.desc}</div>}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Trophy Description Modal */}
                      {(() => {
                        if (!selectedTrophy) return null;
                        const trophyObj = trophies.list.find(tr => tr.id === selectedTrophy);
                        if (!trophyObj) return null;
                        const Icon = TROPHY_ICON_MAP[trophyObj.icon] || Star;
                        return (
                          <FocusTrapModal isOpen={true} onClose={() => setSelectedTrophy(null)} className="" onClick={() => setSelectedTrophy(null)} ariaLabel={t('analytics.trophies.trophyAria', { name: trophyObj.name })} centered padding="p-3">
                            <div
                              className="relative mx-6 p-6 rounded-xl text-center max-w-xs w-full"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                background: `linear-gradient(145deg, #1a1a2e, #0d0d1a)`,
                                border: `2px solid ${trophyObj.color}60`,
                                boxShadow: `0 0 40px ${trophyObj.color}25, 0 0 80px ${trophyObj.color}10, inset 0 0 30px ${trophyObj.color}08`
                              }}
                            >
                              <button onClick={() => setSelectedTrophy(null)} className="absolute top-2 right-2 p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all" aria-label={t('analytics.trophies.closeAria')}>
                                <X size={14} />
                              </button>
                              <div
                                className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, ${trophyObj.color}35, ${trophyObj.color}15)`,
                                  boxShadow: `0 0 25px ${trophyObj.color}50, 0 0 50px ${trophyObj.color}20`
                                }}
                              >
                                <Icon size={28} style={{ color: trophyObj.color }} />
                              </div>
                              <div className="text-xl font-bold mb-2" style={{ color: trophyObj.color }}>{trophyObj.name}</div>
                              <div className="text-base text-gray-300 leading-relaxed italic">{trophyObj.desc}</div>
                              <div className="mt-3 text-sm text-gray-400">{t('analytics.trophies.closeHint')}</div>
                            </div>
                          </FocusTrapModal>
                        );
                      })()}
                      
                      {/* Current 50/50 Streak */}
                      {trophies.stats.currentStreak.type && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-medium)]">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">{t('analytics.trophies.currentStreak')}</span>
                            <span className={`text-xl font-bold ${trophies.stats.currentStreak.type === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {trophies.stats.currentStreak.count}× {trophies.stats.currentStreak.type === 'win' ? t('analytics.trophies.won') : t('analytics.trophies.lost')}
                            </span>
                          </div>
                        </div>
                      )}
                      </>); })()}
                    </CardBody>
                  </Card>
                )}

                <PityHistogram statsTabData={statsTabData} />

                <ConveneHistoryChart statsTabData={statsTabData} />
                {/* Overall Stats */}
                <Card>
                  <CardHeader><BarChart3 size={14} /> {t('analytics.overall.title')}</CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="kuro-stat p-2 text-center"><div className="text-white font-bold kuro-number">{formatNumber(overallStats.totalPulls)}</div><div className="text-gray-400 text-sm">{t('analytics.overall.totalConvenes')}</div></div>
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold kuro-number">{formatNumber(overallStats.totalAstrite)}</div><div className="text-gray-400 text-sm">{t('analytics.overall.astriteSpent')}</div></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="kuro-stat kuro-stat-emerald p-2 text-center"><div className="text-emerald-400 font-bold text-xl kuro-number">{formatNumber(overallStats.won5050)}</div><div className="text-gray-400 text-sm">{t('analytics.overall.won5050')}</div></div>
                      <div className="kuro-stat kuro-stat-red p-2 text-center"><div className="text-red-400 font-bold text-xl kuro-number">{formatNumber(overallStats.lost5050)}</div><div className="text-gray-400 text-sm">{t('analytics.overall.lost5050')}</div></div>
                      <div className="kuro-stat p-2 text-center"><div className="text-white font-bold text-xl kuro-number">{overallStats.avgPity}</div><div className="text-gray-400 text-sm">{t('analytics.overall.avgPity')}</div></div>
                    </div>
                    {overallStats.winRate != null && <div className="text-center text-base text-gray-400 mt-2">{t('analytics.overall.winRatePrefix')} <span className="text-emerald-400 font-bold text-xl kuro-number">{overallStats.winRate}%</span></div>}
                  </CardBody>
                </Card>

                {/* Total Obtained */}
                <Card>
                  <CardHeader>{t('analytics.totalObtained.title')}</CardHeader>
                  <CardBody>
                    {(() => {
                      const { totalObtained } = statsTabData;
                      return (<>
                    <p className="text-gray-400 text-sm mb-1.5">{t('analytics.totalObtained.resonators')}</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold text-xl kuro-number">{formatNumber(totalObtained.res5)}</div><div className="text-gray-400 text-sm">5★</div></div>
                      <div className="kuro-stat kuro-stat-purple p-2 text-center"><div className="text-purple-400 font-bold text-xl kuro-number">{formatNumber(totalObtained.res4)}</div><div className="text-gray-400 text-sm">4★</div></div>
                    </div>

                    <p className="text-gray-400 text-sm mb-1.5">{t('analytics.totalObtained.weapons')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold text-xl kuro-number">{formatNumber(totalObtained.wep5)}</div><div className="text-gray-400 text-sm">5★</div></div>
                      <div className="kuro-stat kuro-stat-purple p-2 text-center"><div className="text-purple-400 font-bold text-xl kuro-number">{formatNumber(totalObtained.wep4)}</div><div className="text-gray-400 text-sm">4★</div></div>
                      <div className="kuro-stat p-2 text-center"><div className="text-blue-400 font-bold text-xl kuro-number">{formatNumber(totalObtained.wep3)}</div><div className="text-gray-400 text-sm">3★</div></div>
                    </div>

                    <p className="text-gray-400 text-sm mb-1.5 mt-3">{t('analytics.totalObtained.total')}</p>
                    <div className="kuro-stat p-2 text-center"><div className="text-white font-bold text-xl kuro-number">{formatNumber(totalObtained.res5 + totalObtained.res4 + totalObtained.wep5 + totalObtained.wep4 + totalObtained.wep3)}</div><div className="text-gray-400 text-sm">{t('analytics.totalObtained.allItems')}</div></div>
                      </>);
                    })()}
                  </CardBody>
                </Card>

                {/* Per-Banner Stats */}
                <Card className="stats-full-width">
                  <CardHeader>{t('analytics.perBanner.title')}</CardHeader>
                  <CardBody className="space-y-2">
                    {[
                      { name: t('analytics.perBanner.bannerNames.featuredResonator'), key: 'featured', color: 'yellow' },
                      { name: t('analytics.perBanner.bannerNames.featuredWeapon'), key: 'weapon', color: 'pink' },
                      { name: t('analytics.perBanner.bannerNames.standardResonator'), key: 'standardChar', color: 'cyan' },
                      { name: t('analytics.perBanner.bannerNames.standardWeapon'), key: 'standardWeap', color: 'cyan' },
                    ].filter(b => (state.profile[b.key]?.history || []).length > 0).map(banner => {
                      const hist = state.profile[banner.key]?.history || [];
                      const pity = state.profile[banner.key]?.pity5 ?? 0;
                      const colorHex = { yellow: '#edaf18', pink: '#f472b6', cyan: '#22d3ee' }[banner.color] || '#a855f7';
                      return (
                        <div key={banner.name} className="p-2 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-base font-medium" style={{color: colorHex}}>{banner.name}</span>
                            <span className="text-gray-400 text-sm">{t('analytics.perBanner.convenes', { n: formatNumber(hist.length) })}</span>
                          </div>
                          <div className="flex gap-2 text-sm">
                            <span className="text-yellow-400">{formatNumber(hist.filter(p => p.rarity === 5).length)} 5★</span>
                            <span className="text-purple-400">{formatNumber(hist.filter(p => p.rarity === 4).length)} 4★</span>
                            <span className="text-gray-400">{t('analytics.perBanner.pity', { pity: formatNumber(pity), hardPity: formatNumber(HARD_PITY) })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardBody>
                </Card>
              </div>
            )}
    </div>
    </TabErrorBoundary>
    </div>
  );
}

export default React.memo(AnalyticsTab, (prev, next) =>
  prev.state.profile === next.state.profile && prev.overallStats === next.overallStats &&
  prev.luckRating === next.luckRating && prev.trophies === next.trophies &&
  prev.collectionImages === next.collectionImages
);
