// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — AnalyticsTab (extracted from App.jsx)
// Stats, luck rating, trophies, leaderboard, pull history charts
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BarChart3, ChevronDown, ChevronLeft, ChevronRight, Clover, Star, TrendingDown, TrendingUp, Trophy, X } from 'lucide-react';
import { MEDAL_COLORS, calculateLuckRating, ALL_CHARACTERS, HARD_PITY, ASTRITE_PER_PULL, BEGINNER_ASTRITE_PER_PULL } from '../../appcore-data.js';
import { storageAvailable } from '../../appcore-engine.js';
import {
  Card, CardHeader, CardBody, TabBackground, TabErrorBoundary,
  TROPHY_ICON_MAP, hideOnError,
} from '../../appcore-components.jsx';
import { FocusTrapModal, useFocusTrap } from '../../appcore-providers.jsx';

const LEADERBOARD_DISPLAY_LIMIT = 20;

export default function AnalyticsTab({
  state,
  dispatch,
  setActiveTab,
  overallStats,
  luckRating,
  trophies,
  collectionImages,
  toast,
  getFirebaseAuth,
  firebaseUrl,
  fetchWithTimeout,
  hashUidForStorage,
  checkFirebaseRateLimit,
  FIREBASE_AVAILABLE,
}) {
  // ── Analytics-only state ──────────────────────────────────────────────────
  const [chartRange, setChartRange] = useState('monthly');
  const [chartOffset, setChartOffset] = useState(9999);
  const [chartBanner, setChartBanner] = useState('all');
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
      ...stdChar.map(p => ({...p, banner: 'Std Char'})),
      ...stdWeap.map(p => ({...p, banner: 'Std Weap'})),
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
    const histogramBuckets = {};
    fiveStars.forEach(p => {
      if (p.pity > HARD_PITY) {
        histogramBuckets[`${HARD_PITY+1}+`] = (histogramBuckets[`${HARD_PITY+1}+`] ?? 0) + 1;
      } else {
        const bucket = Math.floor((p.pity - 1) / 10) * 10 + 1;
        const label = `${bucket}-${bucket + 9}`;
        histogramBuckets[label] = (histogramBuckets[label] ?? 0) + 1;
      }
    });
    const allBucketLabels = Array.from({length: HARD_PITY / 10}, (_, i) => `${i*10+1}-${(i+1)*10}`);
    if (histogramBuckets['81+']) allBucketLabels.push('81+');
    allBucketLabels.forEach(b => { if (!histogramBuckets[b]) histogramBuckets[b] = 0; });
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
      hashUidForStorage(state.profile.uid).then(setHashedProfileUid);
    } else {
      setHashedProfileUid(null);
    }
  }, [state.profile.uid, hashUidForStorage]);

  // ── Callbacks ──────────────────────────────────────────────────────────────
  const loadLeaderboard = useCallback(async () => {
    if (leaderboardLoadingRef.current) return;
    leaderboardLoadingRef.current = true;
    setLeaderboardLoading(true);
    try {
      const authToken = await getFirebaseAuth();
      let res;
      try {
        res = await fetchWithTimeout(firebaseUrl('leaderboard', authToken));
      } catch (networkErr) {
        // Network failure — wait 2s and retry once
        await new Promise(r => setTimeout(r, 2000));
        res = await fetchWithTimeout(firebaseUrl('leaderboard', authToken));
      }
      if (!res.ok) {
        if (res.status >= 500) {
          // Server error — wait 2s and retry once
          await new Promise(r => setTimeout(r, 2000));
          res = await fetchWithTimeout(firebaseUrl('leaderboard', authToken));
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
  }, [getFirebaseAuth, firebaseUrl, fetchWithTimeout]);

  const loadCommunityPulls = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      let res;
      try {
        res = await fetchWithTimeout(firebaseUrl('community-pulls', authToken));
      } catch (networkErr) {
        // Network failure — wait 2s and retry once
        await new Promise(r => setTimeout(r, 2000));
        res = await fetchWithTimeout(firebaseUrl('community-pulls', authToken));
      }
      if (!res.ok && res.status >= 500) {
        // Server error — wait 2s and retry once
        await new Promise(r => setTimeout(r, 2000));
        res = await fetchWithTimeout(firebaseUrl('community-pulls', authToken));
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
  }, [getFirebaseAuth, firebaseUrl, fetchWithTimeout]);

  const submitToLeaderboard = useCallback(async () => {
    if (!effectiveLeaderboardId || !overallStats?.avgPity || overallStats.avgPity === '—') return;
    if (submittingRef.current) return;
    if (!checkFirebaseRateLimit('leaderboard-submit')) {
      toast?.addToast?.('Please wait a few seconds before submitting again', 'warning');
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
      const res = await fetchWithTimeout(firebaseUrl(`leaderboard/${effectiveLeaderboardId}`, authToken), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (!res.ok) throw new Error(`Firebase write failed (${res.status})`);
      const charHistory = [...state.profile.featured.history, ...(state.profile.standardChar?.history || [])];
      const weapHistory = [...state.profile.weapon.history, ...(state.profile.standardWeap?.history || [])];
      const owned5Chars = [...new Set(charHistory.filter(p => p.rarity === 5 && p.name && ALL_CHARACTERS.has(p.name)).map(p => p.name))];
      const owned5Weaps = [...new Set(weapHistory.filter(p => p.rarity === 5 && p.name && !ALL_CHARACTERS.has(p.name)).map(p => p.name))];
      if (owned5Chars.length > 0 || owned5Weaps.length > 0) {
        try {
          await fetchWithTimeout(firebaseUrl(`community-pulls/${effectiveLeaderboardId}`, authToken), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chars: owned5Chars, weaps: owned5Weaps, timestamp: Date.now() })
          });
        } catch { /* community-pulls is best-effort */ }
      }
      if (state.profile.uid && userLeaderboardId && userLeaderboardId !== effectiveLeaderboardId) {
        try {
          await fetchWithTimeout(firebaseUrl(`leaderboard/${userLeaderboardId}`, authToken), { method: 'DELETE' });
          await fetchWithTimeout(firebaseUrl(`community-pulls/${userLeaderboardId}`, authToken), { method: 'DELETE' });
        } catch { /* best-effort cleanup */ }
      }
      toast?.addToast?.('Score submitted to leaderboard!', 'success');
      loadLeaderboard();
      loadCommunityPulls();
    } catch (e) {
      console.error('Submit error:', e);
      toast?.addToast?.('Failed to submit: ' + e.message, 'error');
    } finally {
      submittingRef.current = false;
      setLeaderboardSubmitting(false);
    }
  }, [effectiveLeaderboardId, userLeaderboardId, overallStats, state.profile, toast, loadLeaderboard, loadCommunityPulls, leaderboardConsented, getFirebaseAuth, firebaseUrl, fetchWithTimeout, hashUidForStorage, checkFirebaseRateLimit]);

  // Load leaderboard data when modal opens
  useEffect(() => {
    if (showLeaderboard) {
      loadLeaderboard();
      loadCommunityPulls();
    }
  }, [showLeaderboard, loadLeaderboard, loadCommunityPulls]);
  return (
    <div role="tabpanel" id="tabpanel-analytics" aria-labelledby="tab-analytics" tabIndex="0">
    <TabErrorBoundary tabName="Stats">
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="stats" />

            {!overallStats ? (
              <Card>
                <CardBody className="text-center py-8">
                  <BarChart3 size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-300 text-sm font-medium">Awaiting signal data</p>
                  <p className="text-gray-400 text-xs mt-1 mb-3">Import your Convene history to initialize luck analysis, pity tracking, and Convene analytics.</p>
                  <button onClick={() => setActiveTab('profile')} className="kuro-btn active-cyan text-xs px-4 py-2">Open Profile to import</button>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Success Rate Card */}
                {luckRating && (
                  <Card>
                    <CardHeader action={FIREBASE_AVAILABLE ? <button onClick={() => setShowLeaderboard(true)} className="text-cyan-400 text-[10px] flex items-center gap-1 hover:text-cyan-300 transition-colors" aria-label="Open community leaderboard"><TrendingUp size={12} /> Leaderboard</button> : null}>Luck Rating</CardHeader>
                    <CardBody>
                      <div className="flex items-center gap-4">
                        <div className="luck-badge rounded-xl p-[2px] flex-shrink-0" style={{'--badge-color': luckRating.color, '--badge-speed': '12s'}}>
                          <div className="luck-badge-inner rounded-xl px-4 py-3 text-center" style={{minWidth: '90px'}}>
                            <div className="text-[16px] font-bold tracking-widest uppercase mb-1" style={{color: luckRating.color, fontFamily: 'var(--font-display)'}}>{luckRating.tier}</div>
                            <div className="text-[24px] font-extrabold kuro-number" style={{color: luckRating.color, textShadow: `0 0 20px ${luckRating.color}40`, fontFamily: 'var(--font-data)'}}>{luckRating.rating}</div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-stat)' }}>
                            <div className="h-full rounded-full transition-[width] duration-300" style={{width: `${luckRating.percentile}%`, background: `linear-gradient(90deg, ${luckRating.color}40, ${luckRating.color})`}} />
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-gray-400 text-[10px]">Avg Pity</span>
                            <span className="text-gray-200 text-xs font-medium">{overallStats?.avgPity}</span>
                          </div>
                          <p className="text-[10px] text-center" style={{color: `${luckRating.color}90`}}>
                            {luckRating.percentile >= 80 ? `Luckier than ${luckRating.percentile}% of players — incredible!`
                              : luckRating.percentile >= 60 ? `Luckier than ${luckRating.percentile}% of players — above average!`
                              : luckRating.percentile >= 40 ? `Around average luck (${luckRating.percentile}th percentile)`
                              : `Unluckier than most — keep tracking to see your trends`}
                          </p>
                          {/* AUDIT-FIX H12: gray-600→gray-500 for WCAG AA contrast */}
                          <p className="text-[10px] text-gray-500 text-center mt-1">Based on your avg pity vs. theoretical mean (53.5), adjusted for sample size</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}
                
                {/* P13-FIX: MEDIUM-4 — Accessible consent modal (replaces window.confirm) */}
                <FocusTrapModal isOpen={showConsentModal} onClose={() => { setShowConsentModal(false); consentResolveRef.current?.(false); }} className="" onClick={() => { setShowConsentModal(false); consentResolveRef.current?.(false); }} ariaLabel="Leaderboard consent" centered>
                  <div className="kuro-card w-full max-w-sm" onClick={e => e.stopPropagation()}>
                    <div className="kuro-card-inner p-5 space-y-4 rounded-2xl">
                      <h3 className="text-white font-semibold text-sm">Leaderboard - Data Sharing Notice</h3>
                      <div className="text-gray-300 text-xs space-y-2">
                        <p>By submitting your score, the following data will be sent to a shared database and displayed publicly:</p>
                        <ul className="list-disc pl-4 space-y-1 text-gray-400">
                          <li>Your player ID (<span className="text-cyan-400 font-mono">{effectiveLeaderboardId}</span>)</li>
                          <li>Average pity, total Convenes, 50/50 win/loss stats</li>
                          <li>Your owned 5★ characters and weapons</li>
                        </ul>
                        <p className="text-gray-500">This data is pseudonymous (linked to a hashed game UID or random ID, not your real identity).</p>
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button className="flex-1 px-3 py-2 rounded text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors" onClick={() => { setShowConsentModal(false); consentResolveRef.current?.(false); }}>Decline</button>
                        <button className="flex-1 px-3 py-2 rounded text-xs font-medium bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 transition-colors" onClick={() => { setShowConsentModal(false); consentResolveRef.current?.(true); }}>I Consent</button>
                      </div>
                    </div>
                  </div>
                </FocusTrapModal>

                {/* Luck Leaderboard Modal */}
                <FocusTrapModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} className="" onClick={() => setShowLeaderboard(false)} ariaLabel="Community leaderboard" centered>
                    <div className="kuro-card w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                      <div className="px-4 py-3 border-b border-[var(--border-medium)]" data-sheet-header>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold text-sm">Community</h3>
                            <p className="text-gray-400 text-[10px]">Leaderboard & stats</p>
                          </div>
                          <button onClick={() => setShowLeaderboard(false)} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close leaderboard">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex gap-1" role="tablist" aria-label="Leaderboard view">
                          <button onClick={() => setLeaderboardTab('rankings')} role="tab" aria-selected={leaderboardTab === 'rankings'} className={`flex-1 text-[10px] font-medium py-1.5 rounded-lg transition-all ${leaderboardTab === 'rankings' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                            Rankings
                          </button>
                          <button onClick={() => setLeaderboardTab('popular')} role="tab" aria-selected={leaderboardTab === 'popular'} className={`flex-1 text-[10px] font-medium py-1.5 rounded-lg transition-all ${leaderboardTab === 'popular' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                            Most Convened
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {leaderboardTab === 'rankings' ? (
                          <>
                            {leaderboardLoading ? (
                              <div className="space-y-2 py-2" aria-label="Loading leaderboard">
                                {[...Array(6)].map((_, i) => (
                                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5">
                                    <div className="kuro-skeleton kuro-skeleton-circle w-[28px] h-[28px] flex-shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                      <div className="kuro-skeleton kuro-skeleton-text" style={{ width: `${55 + i * 7}%` }} />
                                      <div className="kuro-skeleton kuro-skeleton-text" style={{ width: '35%' }} />
                                    </div>
                                    <div className="kuro-skeleton kuro-skeleton-text w-10 h-4 flex-shrink-0" />
                                  </div>
                                ))}
                              </div>
                            ) : leaderboardData.length === 0 ? (
                              <div className="text-center py-8">
                                <div className="text-gray-500 text-sm mb-2">{leaderboardError ? 'Failed to load leaderboard' : 'No signals received'}</div>
                                <div className="text-gray-500 text-[10px]">{leaderboardError ? 'Check your connection and try again' : 'Be the first to transmit'}</div>
                              </div>
                            ) : (
                              leaderboardData.map((entry, i) => {
                                const isYou = entry.id === effectiveLeaderboardId ||
                                  (entry.uid && hashedProfileUid && entry.uid === hashedProfileUid) ||
                                  (!entry.uid && overallStats?.avgPity && entry.avgPity === parseFloat(overallStats.avgPity) && entry.totalPulls === (overallStats.totalPulls ?? 0) && entry.pulls === (overallStats.fiveStars ?? 0));
                                return (
                                  <div 
                                    key={entry.id}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${isYou ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-white/5'}`}
                                  >
                                    <div 
                                      className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
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
                                        <span className={`text-xs font-medium truncate ${isYou ? 'text-cyan-400' : 'text-gray-200'}`}>
                                          {isYou ? (entry.id?.slice(0, 4) + '*** (You)') : (entry.id?.slice(0, 4) + '***')}
                                        </span>
                                        {isYou && <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">YOU</span>}
                                      </div>
                                      <div className="text-[10px] text-gray-500">{entry.pulls} five-stars</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <div className={`text-sm font-bold ${entry.avgPity <= 45 ? 'text-emerald-400' : entry.avgPity <= 55 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {entry.avgPity.toFixed(1)}
                                      </div>
                                      <div className="text-[10px] text-gray-400">avg pity</div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </>
                        ) : (
                          <>
                            {!communityPulls ? (
                              <div className="space-y-1.5 py-2" aria-label="Loading community data">
                                <div className="kuro-skeleton kuro-skeleton-text mx-auto mb-2" style={{ width: '40%' }} />
                                <div className="kuro-skeleton kuro-skeleton-text w-24 mb-1.5" style={{ height: '8px' }} />
                                {[...Array(5)].map((_, i) => (
                                  <div key={i} className="flex items-center gap-2.5 py-1.5">
                                    <div className="kuro-skeleton kuro-skeleton-text w-4 h-3 flex-shrink-0" />
                                    <div className="kuro-skeleton w-[28px] h-[28px] rounded-md flex-shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <div className="kuro-skeleton kuro-skeleton-text" style={{ width: `${50 + i * 8}%` }} />
                                      <div className="kuro-skeleton h-1 rounded-full" style={{ width: `${70 - i * 10}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                <p className="text-gray-400 text-[10px] text-center mb-1">{communityPulls.playerCount} player{communityPulls.playerCount !== 1 ? 's' : ''} reporting</p>
                                {communityPulls.chars.length > 0 && (
                                  <>
                                    <p className="text-[10px] text-yellow-400/80 font-semibold uppercase tracking-wider mb-1">★ Resonators</p>
                                    {communityPulls.chars.slice(0, 10).map(([name, count], i) => {
                                      const pct = communityPulls.playerCount > 0 ? Math.round((count / communityPulls.playerCount) * 100) : 0;
                                      const imgUrl = collectionImages[name] || '';
                                      return (
                                        <div key={name} className="flex items-center gap-2.5 py-1.5">
                                          <span className="text-[10px] font-bold w-4 text-right" style={{color: i < 3 ? MEDAL_COLORS[i] : '#6b7280'}}>{i + 1}</span>
                                          {imgUrl && <img src={imgUrl} alt={name} className="w-[28px] h-[28px] rounded-md object-cover bg-neutral-800 flex-shrink-0" loading="lazy" onError={hideOnError} />}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs text-gray-200 truncate">{name}</span>
                                              <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">{pct}%</span>
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
                                    <p className="text-[10px] text-cyan-400/80 font-semibold uppercase tracking-wider mt-3 mb-1">★ Weapons</p>
                                    {communityPulls.weaps.slice(0, 10).map(([name, count], i) => {
                                      const pct = communityPulls.playerCount > 0 ? Math.round((count / communityPulls.playerCount) * 100) : 0;
                                      const imgUrl = collectionImages[name] || '';
                                      return (
                                        <div key={name} className="flex items-center gap-2.5 py-1.5">
                                          <span className="text-[10px] font-bold w-4 text-right" style={{color: i < 3 ? MEDAL_COLORS[i] : '#6b7280'}}>{i + 1}</span>
                                          {imgUrl && <div className="w-[28px] h-[28px] rounded-md overflow-hidden bg-neutral-800 flex-shrink-0 holo-5star" style={{ position: 'relative' }}><img src={imgUrl} alt={name} className="w-full h-full object-cover" loading="lazy" onError={hideOnError} /></div>}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs text-gray-200 truncate">{name}</span>
                                              <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">{pct}%</span>
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
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                            <BarChart3 size={10} /> Community Stats
                            <span className="text-gray-500 font-normal">• {communityStats.totalPlayers} players</span>
                          </p>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-yellow-400 font-bold text-xs">{communityStats.avgPityAll}</div>
                              <div className="text-gray-400 text-[10px]">Global Avg Pity</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-emerald-400 font-bold text-xs">{communityStats.globalWinRate ?? '—'}%</div>
                              <div className="text-gray-400 text-[10px]">50/50 Win Rate</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-cyan-400 font-bold text-xs">{communityStats.totalFiveStars}</div>
                              <div className="text-gray-400 text-[10px]">Total 5★</div>
                            </div>
                          </div>
                          {communityStats.totalPullsAll > 0 && (
                            <div className="flex justify-between text-[10px]">
                              <span className="text-gray-500">{communityStats.totalPullsAll.toLocaleString()} total Convenes tracked</span>
                              <span className="text-gray-500">{communityStats.totalWon}W / {communityStats.totalLost}L</span>
                            </div>
                          )}
                          {communityStats.luckiest && communityStats.unluckiest && communityStats.totalPlayers >= 2 && (
                            <div className="flex justify-between text-[10px] gap-2">
                              <span className="text-emerald-500/70 flex items-center gap-0.5"><Clover size={10} /> Luckiest: {communityStats.luckiest.avgPity.toFixed(1)}</span>
                              <span className="text-red-500/70 flex items-center gap-0.5"><TrendingDown size={10} /> Unluckiest: {communityStats.unluckiest.avgPity.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-4 border-t border-[var(--border-medium)] space-y-2">
                        {effectiveLeaderboardId && overallStats?.avgPity && overallStats.avgPity !== '—' ? (
                          <>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-gray-400">Your ID: <span className="text-cyan-400 font-mono">{state.profile.uid ? (state.profile.uid.slice(0, 4) + '***') : effectiveLeaderboardId}</span>{state.profile.uid && <span className="text-gray-500 ml-1">(UID)</span>}</span>
                              <span className="text-gray-400">Your Avg: <span className="text-white font-bold">{overallStats.avgPity}</span></span>
                            </div>
                            <button
                              onClick={submitToLeaderboard}
                              disabled={leaderboardSubmitting || rateLimitCooldown > 0}
                              className={`w-full kuro-btn active-cyan py-2 text-xs font-medium ${leaderboardSubmitting || rateLimitCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {leaderboardSubmitting ? 'Submitting…' : rateLimitCooldown > 0 ? `Wait ${rateLimitCooldown}s…` : 'Submit My Score'}
                            </button>
                            <p className="text-gray-400 text-[10px] text-center">Pseudonymous • Your ID, avg pity & Convene stats are shared publicly on the leaderboard</p>
                          </>
                        ) : (
                          <p className="text-gray-500 text-[10px] text-center">Import convene history to participate</p>
                        )}
                      </div>
                    </div>
                </FocusTrapModal>

                {/* 5★ Pull Log — moved above Trophies for user workflow priority */}
                <Card>
                  <CardHeader>5★ Convene Log</CardHeader>
                  <CardBody>
                    {(() => {
                      const fiveStars = statsTabData.pullLogFiveStars;
                      if (fiveStars.length === 0) return <p className="kuro-empty-state text-gray-500 text-xs text-center py-4">Awaiting 5★ signal resonance</p>;
                      return (
                        <div className="space-y-1 max-h-60 overflow-y-auto kuro-scroll">
                          {fiveStars.map((p, i) => {
                            const pityColor = p.pity <= 20 ? '#22c55e' : p.pity <= 40 ? '#4ade80' : p.pity <= 50 ? '#edaf18' : p.pity <= 60 ? '#f97316' : '#ef4444';
                            const pityTextColor = p.pity <= 20 ? 'text-emerald-400' : p.pity <= 40 ? 'text-green-400' : p.pity <= 50 ? 'text-yellow-400' : p.pity <= 60 ? 'text-orange-400' : 'text-red-400';
                            return (
                              <div key={p.id || `pull-${p.name}-${p.pity}-${p.timestamp || i}`} className="pull-log-row flex items-center justify-between p-1.5 rounded text-xs" style={{'--pity-color': pityColor, background: 'rgba(255,255,255,0.03)'}}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-yellow-400 font-medium truncate">{p.name}</span>
                                  <span className="text-gray-500 flex-shrink-0">{p.banner}</span>
                                  {p.banner === 'Featured' && p.won5050 === true && <span className="text-emerald-400 text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 flex-shrink-0" aria-label="Won 50/50">✓ W</span>}
                                  {p.banner === 'Featured' && p.won5050 === false && <span className="text-red-400 text-xs font-bold px-1.5 py-0.5 rounded bg-red-500/20 flex-shrink-0" aria-label="Lost 50/50">✗ L</span>}
                                  {p.banner === 'Featured' && p.won5050 === null && <span className="text-amber-400 text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/20 flex-shrink-0" title="Guaranteed - pity carried over from a previous lost 50/50" aria-label="Guaranteed">G</span>}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`font-bold kuro-number ${pityTextColor}`}>{p.pity ?? '?'}</span>
                                  {p.timestamp && <span className="text-gray-400 text-xs">{new Date(p.timestamp).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>}
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
                      <span className="flex items-center gap-1.5"><Trophy size={14} className="text-yellow-400" /> Trophies</span>
                    </CardHeader>
                    <CardBody>
                      <p className="text-gray-500 text-xs text-center py-4">Import more history to earn trophies</p>
                    </CardBody>
                  </Card>
                )}
                {trophies && trophies.list.length > 0 && (
                  <Card>
                    <CardHeader action={<span className="text-gray-500 text-[10px]">{trophies.list.length} earned</span>}>
                      <span className="flex items-center gap-1.5"><Trophy size={14} className="text-yellow-400" /> Trophies <span className="text-gray-500 font-normal text-[10px]">({trophies.list.length})</span></span>
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
                              className="relative p-2.5 rounded-lg text-center transition-all active:scale-95 cursor-pointer"
                              role="button" tabIndex={0} aria-label={`Trophy: ${trophy.name}`}
                              onClick={(e) => { e.stopPropagation(); setSelectedTrophy(trophy.id); }}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTrophy(trophy.id); } }}
                              style={{
                                background: `linear-gradient(135deg, ${trophy.color}18, ${trophy.color}08)`,
                                border: `1px solid ${trophy.color}50`,
                                boxShadow: `0 0 20px ${trophy.color}15, inset 0 0 20px ${trophy.color}05`
                              }}
                            >
                              <div 
                                className="w-9 h-9 mx-auto mb-1.5 rounded-full flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, ${trophy.color}30, ${trophy.color}10)`,
                                  boxShadow: `0 0 15px ${trophy.color}40`
                                }}
                              >
                                <IconComponent size={18} style={{ color: trophy.color }} />
                              </div>
                              <div className="text-[10px] font-bold text-white truncate">{trophy.name}</div>
                              {trophy.desc && <div className="text-[9px] text-gray-400 truncate mt-0.5" title={trophy.desc}>{trophy.desc}</div>}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Trophy Description Modal */}
                      {(() => {
                        if (!selectedTrophy) return null;
                        const t = trophies.list.find(tr => tr.id === selectedTrophy);
                        if (!t) return null;
                        const Icon = TROPHY_ICON_MAP[t.icon] || Star;
                        return (
                          <FocusTrapModal isOpen={true} onClose={() => setSelectedTrophy(null)} className="" onClick={() => setSelectedTrophy(null)} ariaLabel={`Trophy: ${t.name}`} centered>
                            <div
                              className="relative mx-6 p-5 rounded-xl text-center max-w-xs w-full"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                background: `linear-gradient(145deg, #1a1a2e, #0d0d1a)`,
                                border: `2px solid ${t.color}60`,
                                boxShadow: `0 0 40px ${t.color}25, 0 0 80px ${t.color}10, inset 0 0 30px ${t.color}08`
                              }}
                            >
                              <button onClick={() => setSelectedTrophy(null)} className="absolute top-2 right-2 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all" aria-label="Close trophy">
                                <X size={14} />
                              </button>
                              <div 
                                className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, ${t.color}35, ${t.color}15)`,
                                  boxShadow: `0 0 25px ${t.color}50, 0 0 50px ${t.color}20`
                                }}
                              >
                                <Icon size={28} style={{ color: t.color }} />
                              </div>
                              <div className="text-sm font-bold mb-2" style={{ color: t.color }}>{t.name}</div>
                              <div className="text-xs text-gray-300 leading-relaxed italic">{t.desc}</div>
                              <div className="mt-3 text-[10px] text-gray-400">tap outside or ✕ to close</div>
                            </div>
                          </FocusTrapModal>
                        );
                      })()}
                      
                      {/* Current 50/50 Streak */}
                      {trophies.stats.currentStreak.type && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-medium)]">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-[10px]">Current 50/50 Streak</span>
                            <span className={`text-sm font-bold ${trophies.stats.currentStreak.type === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {trophies.stats.currentStreak.count}× {trophies.stats.currentStreak.type === 'win' ? '✓ Won' : '✗ Lost'}
                            </span>
                          </div>
                        </div>
                      )}
                      </>); })()}
                    </CardBody>
                  </Card>
                )}

                {/* 5★ Pity Distribution Histogram */}
                {(() => {
                  if (!statsTabData.histogramStats) return (
                    <Card>
                      <CardHeader>
                        <span className="flex items-center gap-1.5"><BarChart3 size={14} /> 5★ Pity Distribution</span>
                      </CardHeader>
                      <CardBody>
                        <p className="text-gray-500 text-xs text-center py-4">Need 2+ five-star Convenes to show distribution</p>
                      </CardBody>
                    </Card>
                  );
                  const { fiveStars, histogramBuckets: buckets, allBucketLabels: allBuckets, histogramStats } = statsTabData;
                  const { maxCount, avgPity, minPity, maxPity } = histogramStats;
                  
                  // Color coding
                  const getBarColor = (label) => {
                    const start = parseInt(label.split('-')[0], 10);
                    if (start <= 20) return '#22c55e'; // Green - very lucky
                    if (start <= 40) return '#4ade80'; // Lime - lucky
                    if (start <= 50) return '#edaf18'; // Yellow - average
                    if (start <= 60) return '#f97316'; // Orange - unlucky
                    return '#ef4444'; // Red - soft pity / hard pity
                  };
                  
                  return (
                    <Card>
                      {/* AUDIT-FIX M32: Use "Convenes" consistently */}
                      <CardHeader action={<span className="text-gray-500 text-[10px]">{fiveStars.length} Convenes</span>}>
                        <span className="flex items-center gap-1.5"><BarChart3 size={14} /> 5★ Pity Distribution</span>
                      </CardHeader>
                      <CardBody>
                        {/* Screen reader accessible summary */}
                        <div className="sr-only">
                          Pity distribution: {allBuckets.map(label => `${label} Convenes: ${buckets[label] || 0}`).join(', ')}.
                          Average pity: {avgPity}, range: {minPity} to {maxPity}.
                        </div>
                        {/* Histogram bars - neon glow style */}
                        <div className="flex items-end gap-1.5 h-24 pt-5 mb-2" aria-hidden="true">
                          {allBuckets.map(label => {
                            const count = buckets[label] || 0;
                            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                            const color = getBarColor(label);
                            return (
                              <div key={label} className="flex-1 flex flex-col items-center" title={`${label} pity: ${count} pull${count !== 1 ? 's' : ''}`}>
                                <div className="w-full relative" style={{ height: '72px' }}>
                                  {count > 0 && (
                                    <div 
                                      className="absolute left-0 right-0 text-[10px] text-center font-bold"
                                      style={{
                                        bottom: `${height}%`,
                                        marginBottom: '4px',
                                        color: color,
                                        textShadow: `0 0 8px ${color}`,
                                        fontFamily: 'var(--font-data)'
                                      }}
                                    >
                                      {count}
                                    </div>
                                  )}
                                  {/* Neon bar - semi-filled with glowing border */}
                                  <div 
                                    className="absolute bottom-0 left-1 right-1 rounded-t transition-all"
                                    style={{ 
                                      height: `${height}%`, 
                                      minHeight: count > 0 ? '8px' : '0',
                                      background: `linear-gradient(to top, ${color}40, ${color}20)`,
                                      border: count > 0 ? `1px solid ${color}90` : 'none',
                                      borderBottom: 'none',
                                      boxShadow: count > 0 ? `0 0 12px ${color}50, inset 0 0 15px ${color}30` : 'none',
                                    }} 
                                  />
                                  {/* Bottom glow line */}
                                  {count > 0 && (
                                    <div 
                                      className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full"
                                      style={{ 
                                        background: color,
                                        boxShadow: `0 0 8px ${color}, 0 0 16px ${color}80`
                                      }} 
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* X-axis labels */}
                        <div className="flex gap-1.5">
                          {allBuckets.map(label => (
                            <div key={label} className="flex-1 text-[10px] text-gray-400 text-center">
                              {label}
                            </div>
                          ))}
                        </div>
                        
                        {/* Stats summary */}
                        <div className="mt-3 pt-3 border-t border-[var(--border-medium)] grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-emerald-400 font-bold text-sm" style={{ textShadow: '0 0 10px rgba(34,197,94,0.5)', fontFamily: 'var(--font-data)' }}>{minPity}</div>
                            <div className="text-gray-400 text-[10px]">Lowest</div>
                          </div>
                          <div>
                            <div className="text-yellow-400 font-bold text-sm" style={{ textShadow: '0 0 10px rgba(237,175,24,0.5)', fontFamily: 'var(--font-data)' }}>{avgPity}</div>
                            <div className="text-gray-400 text-[10px]">Average</div>
                          </div>
                          <div>
                            <div className="text-red-400 font-bold text-sm" style={{ textShadow: '0 0 10px rgba(239,68,68,0.5)', fontFamily: 'var(--font-data)' }}>{maxPity}</div>
                            <div className="text-gray-400 text-[10px]">Highest</div>
                          </div>
                        </div>
                        
                        {/* Pity zone legend - neon dots (all 5 tiers) */}
                        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}></span> 
                            <span className="text-gray-400">1-20</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 6px #4ade80' }}></span> 
                            <span className="text-gray-400">21-40</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#edaf18', boxShadow: '0 0 6px #edaf18' }}></span> 
                            <span className="text-gray-400">41-50</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#f97316', boxShadow: '0 0 6px #f97316' }}></span> 
                            <span className="text-gray-400">51-60</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 6px #ef4444' }}></span> 
                            <span className="text-gray-400">61-80</span>
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })()}

                {/* Convenes Chart with Time Range */}
                {/* P2-FIX: Now reads from memoized statsTabData instead of recomputing allHist */}
                <Card className="stats-full-width">
                  <CardHeader>
                    <span className="flex items-center gap-1.5"><TrendingUp size={14} /> Convene History</span>
                  </CardHeader>
                  <CardBody>
                    {/* Banner + Range filter buttons — always visible so user can switch even with empty data */}
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {[['all', 'All'], ['featured', 'Featured'], ['weapon', 'Weapon'], ['stdChar', 'Std Char'], ['stdWeap', 'Std Weap']].map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => { setChartBanner(val); setChartOffset(9999); }}
                          className={`px-2 py-1 text-[10px] rounded transition-all ${chartBanner === val ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1 mb-3 flex-wrap">
                      {['daily', 'weekly', 'monthly', 'yearly'].map(r => (
                        <button
                          key={r}
                          onClick={() => { setChartRange(r); setChartOffset(9999); }}
                          className={`px-2 py-1 text-[10px] rounded transition-all ${chartRange === r ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                    {(() => {
                      const chartHist = chartBanner === 'all' ? statsTabData.allHist
                        : chartBanner === 'featured' ? statsTabData.featuredHist
                        : chartBanner === 'weapon' ? statsTabData.weaponHist
                        : chartBanner === 'stdChar' ? statsTabData.stdCharHist
                        : statsTabData.stdWeapHist;
                      if (chartHist.length < 10) return <p className="kuro-empty-state text-gray-500 text-xs text-center py-4">No data for this filter. Try a different banner type or time range.</p>;

                      const groupData = (range) => {
                        const grouped = {};
                        chartHist.forEach(p => {
                          if (p.timestamp) {
                            const date = new Date(p.timestamp);
                            let key;
                            if (range === 'daily') {
                              key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
                            } else if (range === 'weekly') {
                              // Proper ISO 8601 week number calculation
                              const target = new Date(date.valueOf());
                              target.setDate(target.getDate() - ((target.getDay() + 6) % 7) + 3); // nearest Thursday
                              const jan4 = new Date(target.getFullYear(), 0, 4);
                              const weekNum = 1 + Math.round(((target.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
                              const isoYear = target.getFullYear(); // ISO year may differ at year boundaries
                              key = `${isoYear}-W${String(Math.max(1, weekNum)).padStart(2,'0')}`;
                            } else if (range === 'monthly') {
                              key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
                            } else {
                              key = `${date.getFullYear()}`;
                            }
                            if (!grouped[key]) grouped[key] = { pulls: 0, fiveStars: 0 };
                            grouped[key].pulls++;
                            if (p.rarity === 5) grouped[key].fiveStars++;
                          }
                        });
                        return grouped;
                      };
                      
                      const formatLabel = (key, range) => {
                        if (range === 'daily') {
                          const d = new Date(key + 'T12:00:00'); // Avoid UTC midnight → local day shift
                          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } else if (range === 'weekly') {
                          return key.split('-')[1];
                        } else if (range === 'monthly') {
                          return new Date(key + '-15T12:00:00').toLocaleDateString('en-US', { month: 'short' }); // Mid-month avoids day shift
                        } else {
                          return key;
                        }
                      };
                      
                      const visibleCount = { daily: 14, weekly: 12, monthly: 6, yearly: 6 };
                      const grouped = groupData(chartRange);
                      const allData = Object.entries(grouped)
                        .sort((a,b) => a[0].localeCompare(b[0]))
                        .map(([key, data]) => ({
                          key,
                          label: formatLabel(key, chartRange),
                          pulls: data.pulls
                        }));
                      
                      if (allData.length < 2) return <p className="kuro-empty-state text-gray-500 text-xs text-center py-4">No data for this combination. Try a different filter or time range.</p>;

                      const maxVisible = visibleCount[chartRange];
                      const maxOffset = Math.max(0, allData.length - maxVisible);
                      const clampedOffset = Math.min(chartOffset, maxOffset);
                      const chartData = allData.slice(clampedOffset, clampedOffset + maxVisible);
                      const canGoLeft = clampedOffset > 0;
                      const canGoRight = clampedOffset < maxOffset;

                      return (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div />
                            {allData.length > maxVisible && (
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => setChartOffset(Math.max(0, clampedOffset - Math.floor(maxVisible / 2)))}
                                  disabled={!canGoLeft}
                                  className={`p-1 rounded transition-colors ${canGoLeft ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/5 text-gray-500'}`}
                                >
                                  <ChevronLeft size={14} />
                                </button>
                                <button 
                                  onClick={() => setChartOffset(Math.min(maxOffset, clampedOffset + Math.floor(maxVisible / 2)))}
                                  disabled={!canGoRight}
                                  className={`p-1 rounded transition-colors ${canGoRight ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/5 text-gray-500'}`}
                                >
                                  <ChevronRight size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="h-32">
                            <div className="sr-only">Convene history chart showing activity over time. Data points: {chartData?.map(d => `${d.label}: ${d.pulls} Convenes`).join(', ')}.</div>
                            {(() => {
                              if (!chartData || chartData.length === 0) return null;
                              const W = 400, H = 128, PAD = { top: 10, right: 10, bottom: 20, left: 35 };
                              const cW = W - PAD.left - PAD.right, cH = H - PAD.top - PAD.bottom;
                              const maxVal = Math.max(...chartData.map(d => d.pulls), 1);
                              const yTicks = [0, Math.round(maxVal / 2), maxVal];
                              const pts = chartData.map((d, i) => ({
                                x: PAD.left + (chartData.length > 1 ? (i / (chartData.length - 1)) * cW : cW / 2),
                                y: PAD.top + cH - (d.pulls / maxVal) * cH,
                                ...d,
                              }));
                              const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                              const area = `${line} L${pts[pts.length - 1].x},${PAD.top + cH} L${pts[0].x},${PAD.top + cH} Z`;
                              const xStep = Math.max(1, Math.ceil(chartData.length / 6));
                              return (
                                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                                  <defs>
                                    <linearGradient id="pullGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="rgba(237,175,24,0.22)" />
                                      <stop offset="100%" stopColor="rgba(237,175,24,0)" />
                                    </linearGradient>
                                  </defs>
                                  {yTicks.map(v => {
                                    const y = PAD.top + cH - (v / maxVal) * cH;
                                    return <g key={v}>
                                      <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                                      <text x={PAD.left - 4} y={y + 3} textAnchor="end" fill="#8892a4" fontSize="9" fontFamily="var(--font-data)">{v}</text>
                                    </g>;
                                  })}
                                  <path d={area} fill="url(#pullGrad)" />
                                  <path d={line} fill="none" stroke="rgba(237,175,24,0.4)" strokeWidth="1.5" />
                                  {pts.map((p, i) => i % xStep === 0 ? (
                                    <text key={i} x={p.x} y={H - 4} textAnchor="middle" fill="#8892a4" fontSize="9" fontFamily="var(--font-data)">{p.label}</text>
                                  ) : null)}
                                  {pts.map((p, i) => (
                                    <g key={i}>
                                      <circle cx={p.x} cy={p.y} r="8" fill="transparent" className="cursor-pointer">
                                        <title>{p.label}: {p.pulls} Convenes</title>
                                      </circle>
                                      <circle cx={p.x} cy={p.y} r="2" fill="rgba(237,175,24,0.6)" className="pointer-events-none" />
                                    </g>
                                  ))}
                                </svg>
                              );
                            })()}
                          </div>
                          {allData.length > maxVisible && (
                            <div className="text-center text-[10px] text-gray-400 mt-1">
                              {clampedOffset + 1}-{Math.min(clampedOffset + maxVisible, allData.length)} of {allData.length}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* Overall Stats */}
                <Card>
                  <CardHeader><BarChart3 size={14} /> Overall Statistics</CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="kuro-stat p-2 text-center"><div className="text-white font-bold kuro-number">{overallStats.totalPulls.toLocaleString()}</div><div className="text-gray-400 text-[10px]">Total Convenes</div></div>
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold kuro-number">{overallStats.totalAstrite.toLocaleString()}</div><div className="text-gray-400 text-[10px]">Astrite Spent (in-game)</div></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="kuro-stat kuro-stat-emerald p-2 text-center"><div className="text-emerald-400 font-bold text-sm kuro-number">{overallStats.won5050}</div><div className="text-gray-400 text-[10px]">Won 50/50</div></div>
                      <div className="kuro-stat kuro-stat-red p-2 text-center"><div className="text-red-400 font-bold text-sm kuro-number">{overallStats.lost5050}</div><div className="text-gray-400 text-[10px]">Lost 50/50</div></div>
                      <div className="kuro-stat p-2 text-center"><div className="text-white font-bold text-sm kuro-number">{overallStats.avgPity}</div><div className="text-gray-400 text-[10px]">Avg. Pity</div></div>
                    </div>
                    {overallStats.winRate != null && <div className="text-center text-xs text-gray-400 mt-2">50/50 Win Rate: <span className="text-emerald-400 font-bold text-sm kuro-number">{overallStats.winRate}%</span></div>}
                  </CardBody>
                </Card>

                {/* Total Obtained */}
                <Card>
                  <CardHeader>Total Obtained</CardHeader>
                  <CardBody>
                    {(() => {
                      const { totalObtained } = statsTabData;
                      return (<>
                    <p className="text-gray-400 text-[10px] mb-1.5">Resonators</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold text-sm">{totalObtained.res5}</div><div className="text-gray-400 text-[10px]">5★</div></div>
                      <div className="kuro-stat kuro-stat-purple p-2 text-center"><div className="text-purple-400 font-bold text-sm">{totalObtained.res4}</div><div className="text-gray-400 text-[10px]">4★</div></div>
                    </div>
                    
                    <p className="text-gray-400 text-[10px] mb-1.5">Weapons</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold text-sm">{totalObtained.wep5}</div><div className="text-gray-400 text-[10px]">5★</div></div>
                      <div className="kuro-stat kuro-stat-purple p-2 text-center"><div className="text-purple-400 font-bold text-sm">{totalObtained.wep4}</div><div className="text-gray-400 text-[10px]">4★</div></div>
                      <div className="kuro-stat p-2 text-center"><div className="text-blue-400 font-bold text-sm">{totalObtained.wep3}</div><div className="text-gray-400 text-[10px]">3★</div></div>
                    </div>

                    <p className="text-gray-400 text-[10px] mb-1.5 mt-3">Total</p>
                    <div className="kuro-stat p-2 text-center"><div className="text-white font-bold text-sm">{totalObtained.res5 + totalObtained.res4 + totalObtained.wep5 + totalObtained.wep4 + totalObtained.wep3}</div><div className="text-gray-400 text-[10px]">All Items</div></div>
                      </>);
                    })()}
                  </CardBody>
                </Card>

                {/* Per-Banner Stats */}
                <Card className="stats-full-width">
                  <CardHeader>Per-Banner Breakdown</CardHeader>
                  <CardBody className="space-y-2">
                    {[
                      { name: 'Featured Resonator', key: 'featured', color: 'yellow' },
                      { name: 'Featured Weapon', key: 'weapon', color: 'pink' },
                      { name: 'Standard Resonator', key: 'standardChar', color: 'cyan' },
                      { name: 'Standard Weapon', key: 'standardWeap', color: 'cyan' },
                    ].filter(b => (state.profile[b.key]?.history || []).length > 0).map(banner => {
                      const hist = state.profile[banner.key]?.history || [];
                      const pity = state.profile[banner.key]?.pity5 ?? 0;
                      const colorHex = { yellow: '#edaf18', pink: '#f472b6', cyan: '#22d3ee' }[banner.color] || '#a855f7';
                      return (
                        <div key={banner.name} className="p-2 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium" style={{color: colorHex}}>{banner.name}</span>
                            <span className="text-gray-400 text-[10px]">{hist.length} Convenes</span>
                          </div>
                          <div className="flex gap-2 text-[10px]">
                            <span className="text-yellow-400">{hist.filter(p => p.rarity === 5).length} 5★</span>
                            <span className="text-purple-400">{hist.filter(p => p.rarity === 4).length} 4★</span>
                            <span className="text-gray-400">Pity: {pity}/{HARD_PITY}</span>
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
