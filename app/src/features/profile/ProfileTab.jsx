// ═══════════════════════════════════════════════════════════════════════════════
// ProfileTab — Extracted from App.jsx [SECTION:TAB-PROFILE]
// Includes: Profile settings, Display settings, Import, ID Card modal,
//           Admin panel modal, Admin mini window
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Award, Check, ChevronDown, Crown, Download, Eye, Globe, Monitor, Settings, Sparkles, Type, User, Volume2, VolumeX } from 'lucide-react';
import ImportFlow from './ImportFlow.jsx';
import { HEADER_ICON, SERVERS, getServerOffset } from '../../data/constants.js';
import { CHARACTER_DATA } from '../../data/characters.js';
import { CHARACTER_THEMES, VERSION_SPLASH_SCREENS, OTHER_BACKGROUNDS, ANIMATED_BACKGROUNDS } from '../../data/banners.js';
import { haptic } from '../../utils/haptics.js';
import { getElementColor, getElementBg } from '../../shared/utils/elementVisuals.js';
import { storageAvailable } from '../../core/storage.js';
import { clearAllAuxKeys } from '../../core/storageKeys.js';
import { renderIdCard } from './idCardRenderer.js';
import { useFocusTrap, FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';

import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { ADMIN_BANNER_KEY, ADMIN_HASH } from '../../shared/components/bannerUtils.js';

import { hideOnError } from '../../shared/utils/imageHelpers.js';

import IdCardModal from './IdCardModal.jsx';
import AdminPanel from './AdminPanel.jsx';
import AboutSection from './AboutSection.jsx';
import OfflineAssetsCard from './OfflineAssetsCard.jsx';
import AppUpdateCard from './AppUpdateCard.jsx';
import PullBubbleCard from './PullBubbleCard.jsx';
import PushNotificationsCard from './PushNotificationsCard.jsx';
import { openSoundSettings, isNativePlatform as isNativePlatformForSettings } from '../../utils/systemSettings.js';
import { setWallpaper, setAnimatedWallpaper } from '../../utils/wallpaper.js';
import { useImageFramingContext } from '../../providers/ImageFramingProvider.jsx';
import { useCloudStorage } from '../../providers/CloudStorageProvider.jsx';
import { t, useAppLocale, setAppLocale, formatDate } from '../../utils/i18n.js';

import { ADMIN_SALT, ADMIN_TAP_TIMEOUT_MS, MAX_USERNAME_LENGTH, isAllowedImageUrl } from '../../shared/constants/appConstants.js';
const MAX_ADMIN_ATTEMPTS = 3;
// Escalating lockout: 24h → 1 week → 1 month → permanent ban (after 3 lockouts)
const LOCKOUT_ESCALATION = [
  24 * 60 * 60 * 1000,      // 1st lockout: 24 hours
  7 * 24 * 60 * 60 * 1000,  // 2nd lockout: 1 week
  30 * 24 * 60 * 60 * 1000, // 3rd lockout: 1 month
];
const MAX_LOCKOUTS_BEFORE_BAN = 3;
const formatLockoutRemaining = (ms) => {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.ceil((ms % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
const currentYear = new Date().getFullYear();
import { silentCatch } from '../../utils/silentCatch.js';
import { constantTimeCompare } from '../../utils/constantTimeCompare.js'; // I4-01: deduplicated
// DEFAULT_VISUAL_SETTINGS received as prop from App.jsx (canonical source)

const TROPHY_TIER_ORDER = { legendary: 0, epic: 1, gold: 2, purple: 3, orange: 4, pink: 5, cyan: 6, red: 7, green: 8, blue: 9, gray: 10 };

function ProfileTab({
  // Core state
  state,
  dispatch,
  // Visual settings
  visualSettings,
  saveVisualSettings,
  // Toast & confirm
  toast,
  confirm,
  // PWA
  pwa,
  // Collection images
  collectionImages,
  customCollectionImages,
  saveCollectionImages,
  // Detail modal (for admin mini window framing)
  detailModal,
  // Export
  handleExport,
  // Import processing
  processImportData,
  // Banners
  activeBanners,
  setActiveBanners,
  // Stats for ID card
  overallStats,
  luckRating,
  ownedCharNames,
  trophies,
  trophyOverrides, setTrophyOverrides,
  DEFAULT_VISUAL_SETTINGS,
  // Tab navigation (for admin collection/trophy "Go to Import" buttons)
  setActiveTab,
  // Cache busting (for admin collection images)
  withCacheBuster,
  // Admin panel state (lifted to App.jsx so mini panel survives tab switches)
  showAdminPanel, setShowAdminPanel,
  adminMiniMode, setAdminMiniMode,
  adminUnlocked, setAdminUnlocked,
  bgFramingMode, setBgFramingMode, editingBgTarget, setEditingBgTarget,
  updateBgPosition, getBgPositionLabel, exportBgPositions, getCustomBgPosition,
}) {
  // Image framing from context (was 11 props)
  const {
    imageFraming, getImageFraming, saveImageFraming, editingImage, setEditingImage,
    framingMode, setFramingMode, miniPanelPosition, saveMiniPanelPosition,
    getMiniPanelPositionClasses, updateEditingFraming, resetEditingFraming,
  } = useImageFramingContext();

  // Cloud storage from context (was 10 props)
  const {
    googleUser, handleGoogleSignIn, handleGoogleSignOut,
    handleCloudBackup, handleCloudRestore, handleCloudDelete, cloudBackupStatus,
    getFirebaseAuth, firebaseUrl, firebaseFetch,
  } = useCloudStorage();

  // ── Tab-local state ──────────────────────────────────────────────────────
  const appLocale = useAppLocale();
  const [showIdCard, setShowIdCard] = useState(false);
  const [idCardFormat, setIdCardFormat] = useState('landscape');

  // ── Admin state (showAdminPanel + adminMiniMode + adminUnlocked from props — survive tab switches) ──
  const [adminPassword, setAdminPassword] = useState('');
  const [adminTapCount, setAdminTapCount] = useState(0);
  const adminTapTimerRef = useRef(null);
  const adminTapCountRef = useRef(0);
  const [adminTab, setAdminTab] = useState('banners');
  const [adminLockedUntil, setAdminLockedUntil] = useState(() => {
    try {
      // One-time ban reset (v3.5.0 fix for React.memo bug that caused false bans)
      if (!localStorage.getItem('ww-admin-reset-v350')) {
        localStorage.removeItem('ww-admin-banned');
        localStorage.removeItem('ww-admin-lockout');
        localStorage.removeItem('ww-admin-fails');
        localStorage.removeItem('ww-admin-lockdowns');
        localStorage.setItem('ww-admin-reset-v350', '1');
      }
      // Check permanent ban
      if (localStorage.getItem('ww-admin-banned') === 'true') return Infinity;
      const lockoutUntil = localStorage.getItem('ww-admin-lockout');
      if (lockoutUntil && Date.now() < parseInt(lockoutUntil, 10)) {
        return parseInt(lockoutUntil, 10);
      }
      // Lockout expired — clear fail counter (but keep lockdownCount for escalation)
      if (lockoutUntil) {
        localStorage.removeItem('ww-admin-lockout');
        localStorage.removeItem('ww-admin-fails');
      }
    } catch (err) { silentCatch(err, 'admin lockout init'); }
    return false;
  });
  const [trophyJsonInput, setTrophyJsonInput] = useState('');
  // ── Background picker state ─────────────────────────────────────────────
  const [bgTarget, setBgTarget] = useState('header');
  const [bgCategory, setBgCategory] = useState('resonators');
  // Closed by default — the full category grid is a lot to show before the
  // user's even asked to browse it. The 3-target preview row (header/
  // navigation/background) stays visible even while collapsed, below, since
  // it's the "what's currently set" summary this section is for.
  const [bgSectionCollapsed, setBgSectionCollapsed] = useState(true);
  // Target-picker modal (Home/Lock/Both) shown before crowning a static wallpaper image.
  const [wallpaperTargetPrompt, setWallpaperTargetPrompt] = useState(null); // { url } | null
  const [activePlayersCount, setActivePlayersCount] = useState(null);
  const [activePlayersHistory, setActivePlayersHistory] = useState([]);
  const [presenceError, setPresenceError] = useState(null);
  const [adminPlayerList, setAdminPlayerList] = useState(null);

  // Banner form state
  const buildBannerForm = useCallback((banners) => {
    const b = banners || {};
    const chars = b.characters || [];
    const weaps = b.weapons || [];
    return {
      version: b.version || '1.0',
      phase: String(b.phase ?? 1),
      startDate: b.startDate?.slice(0, 16) || '',
      endDate: b.endDate?.slice(0, 16) || '',
      charsJson: JSON.stringify(chars, null, 2),
      weapsJson: JSON.stringify(weaps, null, 2),
      charImages: Object.fromEntries(chars.map((c, i) => [i, c.imageUrl || ''])),
      charImagePositions: Object.fromEntries(chars.map((c, i) => [i, c.imagePosition || ''])),
      weapImages: Object.fromEntries(weaps.map((w, i) => [i, w.imageUrl || ''])),
      weapImagePositions: Object.fromEntries(weaps.map((w, i) => [i, w.imagePosition || ''])),
      standardCharImg: b.standardCharBannerImage || '',
      standardWeapImg: b.standardWeapBannerImage || '',
      wwImg: b.whimperingWastesImage || '',
      emImg: b.endstateMatrixImage || '',
      ppImg: b.pioneerPodcastImage || '',
      toaImg: b.towerOfAdversityImage || '',
      irImg: b.illusiveRealmImage || '',
      drImg: b.dailyResetImage || '',
      thImg: b.tacticalHologramImage || '',
      wbImg: b.weeklyBossImage || '',
    };
  }, []);
  const [bannerForm, setBannerForm] = useState(() => buildBannerForm(activeBanners));
  const updateBannerForm = useCallback((field, value) => {
    const imageFields = ['standardCharImg', 'standardWeapImg', 'wwImg', 'emImg', 'ppImg', 'toaImg', 'irImg', 'drImg', 'thImg', 'wbImg'];
    if (imageFields.includes(field) || field.startsWith('charImages.') || field.startsWith('weapImages.')) {
      if (value && !isAllowedImageUrl(value)) return;
    }
    setBannerForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Focus trap refs
  const idCardTrapRef = useFocusTrap(showIdCard);
  const adminTrapRef = useFocusTrap(showAdminPanel && !adminMiniMode);

  // ── Admin fetch functions ─────────────────────────────────────────────
  const FETCH_TIMEOUT_MS = 10000;
  const PRESENCE_TTL_MS = 120000;
  const fetchWithTimeout = useCallback((url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    return fetch(url, { ...options, signal: controller.signal })
      .catch((err) => {
        if (err.name === 'AbortError') throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS}ms`);
        throw err;
      })
      .finally(() => clearTimeout(timeoutId));
  }, []);

  const fetchActivePlayersCount = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      const res = await firebaseFetch('presence', authToken);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const now = Date.now();
          const activeSessions = Object.entries(data).filter(([, v]) => v?.t && (now - v.t) < PRESENCE_TTL_MS);
          const staleSessions = Object.entries(data).filter(([, v]) => !v?.t || (now - v.t) >= PRESENCE_TTL_MS);
          for (const [key] of staleSessions.slice(0, 50)) {
            try { await firebaseFetch(`presence/${key}`, authToken, { method: 'DELETE' }); } catch {}
          }
          const count = activeSessions.length;
          setActivePlayersCount(count);
          setPresenceError(null);
          setActivePlayersHistory(prev => {
            const next = [...prev, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), count }];
            return next.slice(-30);
          });
        } else {
          setActivePlayersCount(0);
          setPresenceError(t('admin.players.noPresenceData'));
        }
      } else {
        const errText = await res.text().catch(() => '');
        setPresenceError(t('admin.players.readFailed', { status: res.status, detail: errText ? ' — ' + errText.slice(0, 80) : '' }));
      }
    } catch (e) { setPresenceError(t('admin.players.fetchError', { message: e.message })); }
  }, [getFirebaseAuth, firebaseFetch]);

  const fetchAdminPlayerList = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      const res = await firebaseFetch('leaderboard', authToken);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const players = Object.entries(data).map(([key, e]) => ({
            firebaseKey: key,
            id: e.id || key,
            uid: e.uid || null,
            avgPity: e.avgPity,
            totalPulls: e.totalPulls ?? 0,
            fiveStars: e.pulls ?? 0,
            won5050: e.won5050 ?? 0,
            lost5050: e.lost5050 ?? 0,
            timestamp: e.timestamp || 0,
          }));
          players.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setAdminPlayerList(players);
        } else {
          setAdminPlayerList([]);
        }
      } else {
        setAdminPlayerList([]);
      }
    } catch (e) {
      console.error('Admin player list fetch error:', e);
      setAdminPlayerList([]);
    }
  }, [getFirebaseAuth, firebaseFetch]);

  // ── Admin handlers ─────────────────────────────────────────────────────
  const handleAdminTap = useCallback(async () => {
    if (adminTapTimerRef.current) clearTimeout(adminTapTimerRef.current);
    haptic.light();
    adminTapCountRef.current += 1;
    const newCount = adminTapCountRef.current;
    setAdminTapCount(newCount);
    if (newCount >= 5) {
      try {
        if (localStorage.getItem('ww-admin-banned') === 'true') {
          toast?.addToast?.('Admin permanently locked.', 'error');
          adminTapCountRef.current = 0; setAdminTapCount(0); return;
        }
        const lockoutUntil = localStorage.getItem('ww-admin-lockout');
        if (lockoutUntil && Date.now() < parseInt(lockoutUntil, 10)) {
          toast?.addToast?.(`Admin locked for ${formatLockoutRemaining(parseInt(lockoutUntil, 10) - Date.now())}. Try again later.`, 'error');
          adminTapCountRef.current = 0;
          setAdminTapCount(0);
          return;
        }
        if (lockoutUntil) {
          localStorage.removeItem('ww-admin-lockout');
          localStorage.removeItem('ww-admin-fails');
        }
      } catch {}
      setShowAdminPanel(true);
      adminTapCountRef.current = 0;
      setAdminTapCount(0);
    } else {
      adminTapTimerRef.current = setTimeout(() => {
        adminTapCountRef.current = 0;
        setAdminTapCount(0);
      }, ADMIN_TAP_TIMEOUT_MS);
    }
  }, [toast]);

  const saveCustomBanners = useCallback((banners) => {
    if (!storageAvailable) {
      setActiveBanners(banners);
      toast?.addToast?.('Banner data updated (preview mode - not saved)', 'info');
      return;
    }
    try {
      localStorage.setItem(ADMIN_BANNER_KEY, JSON.stringify(banners));
      setActiveBanners(banners);
      toast?.addToast?.('Banner data updated!', 'success');
    } catch (e) {
      toast?.addToast?.('Failed to save banner data', 'error');
    }
  }, [toast, setActiveBanners]);

  const hashPasswordPBKDF2 = useCallback(async (password, salt) => {
    try {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
      const derivedBits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
        keyMaterial, 256
      );
      return Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error('crypto.subtle PBKDF2 unavailable:', e);
      return null;
    }
  }, []);

  const hashPasswordSHA256 = useCallback(async (password, salt = '') => {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + password));
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error('crypto.subtle unavailable (requires HTTPS):', e);
      return null;
    }
  }, []);

  const adminSessionFailsRef = useRef(0);
  const adminSessionLockUntilRef = useRef(0);

  const verifyAdminPassword = useCallback(async () => {
    if (!adminPassword || adminPassword.length < 4) {
      toast?.addToast?.('Password must be at least 4 characters', 'error');
      return;
    }
    const now = Date.now();
    // Check permanent ban
    try { if (localStorage.getItem('ww-admin-banned') === 'true') { toast?.addToast?.('Admin permanently locked.', 'error'); return; } } catch {}
    if (adminSessionLockUntilRef.current === Infinity) { toast?.addToast?.('Admin permanently locked.', 'error'); return; }
    if (adminSessionLockUntilRef.current > now) {
      toast?.addToast?.(`Too many failed attempts. Try again in ${formatLockoutRemaining(adminSessionLockUntilRef.current - now)}.`, 'error');
      return;
    }
    try {
      const lockoutUntil = localStorage.getItem('ww-admin-lockout');
      if (lockoutUntil && now < parseInt(lockoutUntil, 10)) {
        toast?.addToast?.(`Too many failed attempts. Try again in ${formatLockoutRemaining(parseInt(lockoutUntil, 10) - now)}.`, 'error');
        return;
      }
    } catch {}
    // F-003: Only use PBKDF2 — removed weaker SHA-256 fallback paths that are trivially brute-forceable
    const pbkdf2Hash = await hashPasswordPBKDF2(adminPassword, ADMIN_SALT);
    if (!pbkdf2Hash) {
      toast?.addToast?.('Hashing unavailable. HTTPS required', 'error');
      return;
    }
    if (constantTimeCompare(pbkdf2Hash, ADMIN_HASH)) {
      setAdminUnlocked(true);
      setAdminPassword('');
      adminSessionFailsRef.current = 0;
      setBannerForm(buildBannerForm(activeBanners));
      try { localStorage.setItem('ww-admin-fails', '0'); } catch {}
    } else {
      adminSessionFailsRef.current += 1;
      const sessionFails = adminSessionFailsRef.current;
      try {
        const storageFails = parseInt(localStorage.getItem('ww-admin-fails') || '0', 10) + 1;
        localStorage.setItem('ww-admin-fails', storageFails.toString());
        const totalFails = Math.max(sessionFails, storageFails);
        if (totalFails >= MAX_ADMIN_ATTEMPTS) {
          // Escalate lockout: count how many times we've been locked out before
          const lockdownCount = parseInt(localStorage.getItem('ww-admin-lockdowns') || '0', 10);
          if (lockdownCount >= MAX_LOCKOUTS_BEFORE_BAN) {
            // Permanent ban after 3+ lockouts
            localStorage.setItem('ww-admin-banned', 'true');
            adminSessionLockUntilRef.current = Infinity;
            setAdminLockedUntil(Infinity);
            setShowAdminPanel(false);
            setAdminPassword('');
            toast?.addToast?.('Admin permanently locked.', 'error');
          } else {
            const lockoutDuration = LOCKOUT_ESCALATION[Math.min(lockdownCount, LOCKOUT_ESCALATION.length - 1)];
            const lockoutTime = now + lockoutDuration;
            adminSessionLockUntilRef.current = lockoutTime;
            localStorage.setItem('ww-admin-lockout', lockoutTime.toString());
            localStorage.setItem('ww-admin-lockdowns', (lockdownCount + 1).toString());
            localStorage.setItem('ww-admin-fails', '0');
            setAdminLockedUntil(lockoutTime);
            setShowAdminPanel(false);
            setAdminPassword('');
            toast?.addToast?.(`Too many failed attempts. Locked for ${formatLockoutRemaining(lockoutDuration)}.`, 'error');
          }
        } else {
          toast?.addToast?.(`Incorrect password (${MAX_ADMIN_ATTEMPTS - totalFails} attempts remaining)`, 'error');
        }
      } catch {
        if (sessionFails >= MAX_ADMIN_ATTEMPTS) {
          adminSessionLockUntilRef.current = now + LOCKOUT_ESCALATION[0];
          setShowAdminPanel(false);
          setAdminPassword('');
          toast?.addToast?.(`Too many failed attempts. Locked for ${formatLockoutRemaining(LOCKOUT_ESCALATION[0])}.`, 'error');
        } else {
          toast?.addToast?.(`Incorrect password (${MAX_ADMIN_ATTEMPTS - sessionFails} attempts remaining)`, 'error');
        }
      }
    }
  }, [adminPassword, toast, hashPasswordPBKDF2, activeBanners, buildBannerForm]);

  // Fetch admin data when Players tab is open
  useEffect(() => {
    if (adminTab === 'players' && adminUnlocked && showAdminPanel) {
      fetchActivePlayersCount();
      fetchAdminPlayerList();
      const interval = setInterval(() => {
        fetchActivePlayersCount();
        fetchAdminPlayerList();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [adminTab, adminUnlocked, showAdminPanel, fetchActivePlayersCount, fetchAdminPlayerList]);

  // ID Card canvas download — rendering logic extracted to idCardRenderer.js
  const downloadIdCard = useCallback(async (format) => {
    try {
      await renderIdCard({
        format: format || idCardFormat,
        profile: state.profile,
        server: state.server,
        overallStats,
        luckRating,
        ownedCharNames,
        collectionImages,
        trophies,
        getImageFraming,
      });
    } catch {
      toast?.addToast?.('Failed to save ID card. Try a different profile image', 'error');
    }
  }, [state.profile, state.server, overallStats, luckRating, ownedCharNames, collectionImages, toast, idCardFormat, trophies, getImageFraming]);

  return (
    <>
          <div role="tabpanel" id="tabpanel-profile" aria-labelledby="tab-profile" tabIndex="0">
          <TabErrorBoundary tabName="Profile">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="profile" />

            {/* E2-FP3: Resonator Profile moved above Server Region (identity first) */}
            <Card>
              <CardHeader><User size={14} className="text-cyan-400" /> {t('profile.resonator.title')}</CardHeader>
              <CardBody className="space-y-3">
                {/* Username */}
                <div>
                  <label htmlFor="profile-display-name" className="text-gray-400 text-sm block mb-2">{t('profile.resonator.displayName')}</label>
                  <input
                    id="profile-display-name"
                    type="text"
                    value={state.profile.username}
                    onChange={e => dispatch({ type: 'SET_USERNAME', value: e.target.value.slice(0, MAX_USERNAME_LENGTH) })}
                    placeholder={t('profile.resonator.displayNamePlaceholder')}
                    maxLength={MAX_USERNAME_LENGTH}
                    className="kuro-input w-full"
                  />
                  {/* AUDIT-FIX H12: gray-600→gray-500 for WCAG AA contrast */}
                  <p className="text-gray-400 text-sm mt-0.5 text-right">{state.profile.username.length}/{MAX_USERNAME_LENGTH}</p>
                </div>

                {/* Profile Picture — current selection */}
                <div>
                  <label className="text-gray-400 text-sm block mb-2">{t('profile.resonator.profilePicture')}</label>
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-lg flex-shrink-0 kuro-avatar-frame kuro-shadow-card-deep${CHARACTER_DATA[state.profile.profilePic]?.rarity === 5 ? ' holo-5star' : ''}`}>
                      {state.profile.profilePic && collectionImages[state.profile.profilePic] ? (() => {
                        const f = getImageFraming(`collection-${state.profile.profilePic}`);
                        return <div className="w-full h-full breath-zoom"><img src={collectionImages[state.profile.profilePic]} alt={state.profile.profilePic} className="w-full h-full object-contain" style={{ transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)` }} loading="lazy" onError={hideOnError} /></div>;
                      })() : (
                        <img src={HEADER_ICON} alt="Default" className="w-full h-full object-contain bg-neutral-800 p-1" loading="lazy" onError={hideOnError} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-base truncate">{state.profile.profilePic || t('profile.resonator.defaultIcon')}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{t('profile.resonator.profilePicHint')} <Crown size={12} className="inline text-yellow-400" /></p>
                      {state.profile.profilePic && (
                        <button
                          onClick={() => dispatch({ type: 'SET_PROFILE_PIC', value: '' })}
                          className="text-red-400/70 text-sm hover:text-red-400 mt-0.5"
                        >{t('profile.resonator.resetToDefault')}</button>
                      )}
                    </div>
                  </div>
                </div>

                {/* View ID Card Button */}
                <button
                  onClick={() => setShowIdCard(true)}
                  className="kuro-btn kuro-btn-hero w-full text-base flex items-center justify-center gap-2"
                >
                  <Award size={14} /> {t('profile.resonator.viewIdCard')}
                </button>
              </CardBody>
            </Card>

            {/* Server Region */}
            <Card>
              <CardHeader>{t('profile.server.title')}</CardHeader>
              <CardBody>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                  {Object.keys(SERVERS).map(s => (
                    <button key={s} onClick={() => dispatch({ type: 'SET_SERVER', server: s })} aria-pressed={state.server === s} className={`kuro-btn min-h-[48px] py-2 text-sm font-medium ${state.server === s ? 'active-gold' : ''}`}>{s}</button>
                  ))}
                </div>
                <p className="text-gray-400 text-sm mt-2 text-center mx-auto" style={{maxWidth: 'none'}}>{t('profile.server.reset', { time: '4:00 AM', offset: `${getServerOffset(state.server) >= 0 ? '+' : ''}${getServerOffset(state.server)}` })}</p>
              </CardBody>
            </Card>

            {/* Language */}
            <Card>
              <CardHeader><Globe size={14} className="text-gray-400" /> {t('app.language')}</CardHeader>
              <CardBody className="space-y-3">
                <div className="p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-gray-400" style={{ background: 'var(--bg-btn)' }}>
                      <Globe size={16} />
                    </div>
                    <div>
                      <div className="text-white text-base font-medium">{t('app.language')}</div>
                      <div className="text-gray-400 text-sm">{t('app.languageDesc')}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5" role="radiogroup" aria-label={t('app.language')}>
                    <button
                      type="button"
                      onClick={() => { haptic.light(); setAppLocale('en'); }}
                      role="radio"
                      aria-checked={appLocale === 'en'}
                      className={`kuro-btn w-full text-sm ${appLocale === 'en' ? 'active-gold' : ''}`}
                    >
                      {t('app.languageEnglish')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { haptic.light(); setAppLocale('fr'); }}
                      role="radio"
                      aria-checked={appLocale === 'fr'}
                      className={`kuro-btn w-full text-sm ${appLocale === 'fr' ? 'active-gold' : ''}`}
                    >
                      {t('app.languageFrench')}
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Settings + Import — side by side on desktop */}
            <div className="desktop-grid-2 space-y-3 lg:space-y-0">
            {/* Display Settings */}
            <Card>
              <CardHeader><Settings size={14} className="text-gray-400" /> {t('profile.display.title')}</CardHeader>
              <CardBody className="space-y-3">
                {/* OLED Mode Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${visualSettings.oledMode ? 'bg-white text-black' : 'text-gray-400'}`} style={!visualSettings.oledMode ? { background: 'var(--bg-btn)' } : undefined}>
                      <Monitor size={16} />
                    </div>
                    <div>
                      <div className="text-white text-base font-medium">{t('profile.display.oledMode')}</div>
                      <div className="text-gray-400 text-sm">{t('profile.display.oledModeDesc')}</div>
                    </div>
                  </div>
                  {/* AUDIT-FIX M22: OLED-aware toggle track */}
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, oledMode: !visualSettings.oledMode })}
                    className="relative w-[48px] h-[24px] rounded-full transition-colors"
                    style={{ background: visualSettings.oledMode ? '#fff' : 'var(--bg-btn)' }}
                    role="switch"
                    aria-checked={visualSettings.oledMode}
                    aria-label={t('profile.display.toggleOled')}
                  >
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all ${visualSettings.oledMode ? 'left-[32px] bg-black' : 'left-[4px] bg-gray-400'}`} />
                  </button>
                </div>
                {visualSettings.oledMode && (
                  <p className="text-emerald-400 text-sm text-center">{t('profile.display.oledActive')}</p>
                )}

                {/* Dyslexic Font Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${visualSettings.dyslexicFont ? 'bg-amber-500 text-white' : 'text-gray-400'}`} style={!visualSettings.dyslexicFont ? { background: 'var(--bg-btn)' } : undefined}>
                      <Type size={16} />
                    </div>
                    <div>
                      <div className="text-white text-base font-medium">{t('profile.display.accessibilityFont')}</div>
                      <div className="text-gray-400 text-sm">{t('profile.display.accessibilityFontDesc')}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, dyslexicFont: !visualSettings.dyslexicFont })}
                    className="relative w-[48px] h-[24px] rounded-full transition-colors"
                    style={{ background: visualSettings.dyslexicFont ? '#f59e0b' : 'var(--bg-btn)' }}
                    role="switch"
                    aria-checked={visualSettings.dyslexicFont}
                    aria-label={t('profile.display.toggleDyslexic')}
                  >
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all ${visualSettings.dyslexicFont ? 'left-[32px] bg-white' : 'left-[4px] bg-gray-400'}`} />
                  </button>
                </div>

                {/* Color-Blind Mode Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${visualSettings.colorBlindMode ? 'bg-teal-500 text-white' : 'text-gray-400'}`} style={!visualSettings.colorBlindMode ? { background: 'var(--bg-btn)' } : undefined}>
                      <Eye size={16} />
                    </div>
                    <div>
                      <div className="text-white text-base font-medium">{t('profile.display.colorBlindMode')}</div>
                      <div className="text-gray-400 text-sm">{t('profile.display.colorBlindModeDesc')}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, colorBlindMode: !visualSettings.colorBlindMode })}
                    className="relative w-[48px] h-[24px] rounded-full transition-colors"
                    style={{ background: visualSettings.colorBlindMode ? '#14b8a6' : 'var(--bg-btn)' }}
                    role="switch"
                    aria-checked={visualSettings.colorBlindMode}
                    aria-label={t('profile.display.toggleColorBlind')}
                  >
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all ${visualSettings.colorBlindMode ? 'left-[32px] bg-white' : 'left-[4px] bg-gray-400'}`} />
                  </button>
                </div>

                {/* Swipe Navigation Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${visualSettings.swipeNavigation ? 'bg-cyan-500 text-white' : 'text-gray-400'}`} style={!visualSettings.swipeNavigation ? { background: 'var(--bg-btn)' } : undefined}>
                      <ChevronDown size={16} className="-rotate-90" />
                    </div>
                    <div>
                      <div className="text-white text-base font-medium">{t('profile.display.swipeNavigation')}</div>
                      <div className="text-gray-400 text-sm">{t('profile.display.swipeNavigationDesc')}</div>
                    </div>
                  </div>
                  {/* AUDIT-FIX M22: OLED-aware toggle track */}
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, swipeNavigation: !visualSettings.swipeNavigation })}
                    className={`relative w-[48px] h-[24px] rounded-full transition-colors ${visualSettings.swipeNavigation ? 'bg-cyan-500' : ''}`}
                    style={!visualSettings.swipeNavigation ? { background: 'var(--bg-btn)' } : undefined}
                    role="switch"
                    aria-checked={visualSettings.swipeNavigation}
                    aria-label={t('profile.display.toggleSwipe')}
                  >
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all ${visualSettings.swipeNavigation ? 'left-[32px] bg-white' : 'left-[4px] bg-gray-400'}`} />
                  </button>
                </div>
                {visualSettings.swipeNavigation && (
                  <p className="text-cyan-300 text-base text-center">{t('profile.display.swipeActive')}</p>
                )}

                {/* Animations Toggle — 3-state: off < on < full */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${visualSettings.animationsEnabled !== 'off' ? (visualSettings.animationsEnabled === 'full' ? 'bg-fuchsia-500 text-white' : 'bg-purple-500 text-white') : 'text-gray-400'}`} style={visualSettings.animationsEnabled === 'off' ? { background: 'var(--bg-btn)' } : undefined}>
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="text-white text-base font-medium">{t('profile.display.animations')}</div>
                      <div className="text-gray-400 text-sm">{t('profile.display.animationsDesc')}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = visualSettings.animationsEnabled === 'off' ? 'on' : visualSettings.animationsEnabled === 'on' ? 'full' : 'off';
                      saveVisualSettings({ ...visualSettings, animationsEnabled: next });
                    }}
                    className="relative w-[64px] h-[24px] rounded-full transition-colors flex-shrink-0"
                    style={{ background: visualSettings.animationsEnabled === 'off' ? 'var(--bg-btn)' : visualSettings.animationsEnabled === 'on' ? '#a855f7' : '#d946ef' }}
                    role="switch"
                    aria-checked={visualSettings.animationsEnabled !== 'off'}
                    aria-label={t('profile.display.animationsAriaLabel', { current: visualSettings.animationsEnabled.toUpperCase(), next: visualSettings.animationsEnabled === 'off' ? 'ON' : visualSettings.animationsEnabled === 'on' ? 'FULL' : 'OFF' })}
                    title={t('profile.display.animationsTitle', { current: visualSettings.animationsEnabled.toUpperCase() })}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tracking-wide text-white/80 pointer-events-none select-none">
                      {visualSettings.animationsEnabled === 'off' ? 'OFF' : visualSettings.animationsEnabled === 'on' ? 'ON' : 'FULL'}
                    </span>
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all bg-white ${visualSettings.animationsEnabled === 'off' ? 'left-[4px] !bg-gray-400' : visualSettings.animationsEnabled === 'on' ? 'left-[30px]' : 'left-[48px]'}`} />
                  </button>
                </div>
                {visualSettings.animationsEnabled === 'off' && (
                  <p className="text-gray-400 text-base font-medium text-center mx-auto" style={{maxWidth: 'none'}}>{t('profile.display.animationsOff')}</p>
                )}
                {visualSettings.animationsEnabled === 'on' && (
                  <p className="text-purple-400 text-base font-medium text-center mx-auto" style={{maxWidth: 'none'}}>{t('profile.display.animationsOn')}</p>
                )}
                {visualSettings.animationsEnabled === 'full' && (
                  <p className="text-fuchsia-400 text-base font-medium text-center mx-auto" style={{maxWidth: 'none'}}>{t('profile.display.animationsFull')}</p>
                )}
                {isNativePlatformForSettings() && visualSettings.animationsEnabled !== 'off' && (
                  <div className="rounded-lg border border-[var(--border-medium)] bg-white/5 p-3 space-y-2">
                    <p className="text-gray-400 text-sm">{t('profile.display.vibrationHint')}</p>
                    <button onClick={() => { haptic.light(); openSoundSettings(); }} className="kuro-btn kuro-btn-sm w-full">
                      {t('profile.display.openSoundSettings')}
                    </button>
                  </div>
                )}

                {/* Background Picker */}
                {(() => {
                  const targetKey = bgTarget === 'header' ? 'headerBg' : bgTarget === 'navigation' ? 'navBg' : 'appBg';
                  const currentBg = visualSettings[targetKey];

                  const selectImage = (type, id, url, pos, poster) => {
                    if (currentBg?.id === id && currentBg?.type === type) {
                      saveVisualSettings({ ...visualSettings, [targetKey]: null });
                    } else {
                      const posKey = bgTarget === 'header' ? 'header' : bgTarget === 'navigation' ? 'nav' : 'bg';
                      // Use custom position if user adjusted it before, otherwise fall back to hardcoded default
                      const customPos = getCustomBgPosition(posKey, id);
                      const rawPos = customPos || pos?.[posKey] || 'center center';
                      const objectPosition = typeof rawPos === 'string' ? rawPos : 'center center';
                      // poster (animated backgrounds only) is stored alongside the video URL so
                      // App.jsx's <video poster> can show the extracted first frame immediately
                      // instead of the browser's generic media-player glyph while the video
                      // itself is still buffering — see ANIMATED_BACKGROUNDS in banners.js.
                      saveVisualSettings({ ...visualSettings, [targetKey]: { type, id, url, objectPosition, poster: poster || null } });
                    }
                  };

                  const isSelected = (type, id) => currentBg?.type === type && currentBg?.id === id;

                  // Crown button on each theme thumbnail (Collection's own profile-pic crown is
                  // the visual model) — sets that image directly as the phone's wallpaper via
                  // WallpaperPlugin.java, independent of picking it as an in-app background
                  // above. Native-only; a video's poster frame is used since an actual wallpaper
                  // can't be a video.
                  const doSetWallpaper = async (url, target) => {
                    haptic.light();
                    const res = await setWallpaper(url, target);
                    if (res.ok) {
                      toast?.addToast?.(t('profile.display.wallpaperApplied'), 'success');
                      haptic.success();
                    } else {
                      toast?.addToast?.(t('profile.display.wallpaperError', { error: res.error }), 'error');
                    }
                  };
                  // Opens the Home/Lock/Both target picker instead of applying straight to
                  // 'both' — the user asked to choose a target before a static wallpaper crown
                  // takes effect.
                  const applyWallpaper = (e, url) => {
                    e.stopPropagation();
                    setWallpaperTargetPrompt({ url });
                  };
                  const applyAnimatedWallpaper = async (e, bg) => {
                    e.stopPropagation();
                    haptic.light();
                    const res = await setAnimatedWallpaper(bg.art);
                    if (res.ok) {
                      haptic.success();
                    } else if (res.error !== 'cancelled') {
                      toast?.addToast?.(t('profile.display.wallpaperError', { error: res.error }), 'error');
                    }
                  };
                  // Same size/position treatment as Collection's profile-pic crown
                  // (CollectionGrid.jsx) — top-right corner, shared --size-icon-btn/--radius-sm
                  // tokens, instead of a mismatched ad-hoc Tailwind w-5/h-5 top-left box.
                  const wallpaperCrownStyle = { top: '4px', right: '4px', width: 'var(--size-icon-btn)', height: 'var(--size-icon-btn)', minHeight: 'var(--size-icon-btn)', borderRadius: 'var(--radius-sm)', padding: 0 };
                  const WallpaperCrown = ({ url }) => !isNativePlatformForSettings() ? null : (
                    <button
                      onClick={(e) => applyWallpaper(e, url)}
                      className="absolute z-10 flex items-center justify-center bg-black/70 text-gray-300 hover:bg-yellow-500/30 hover:text-yellow-300"
                      style={wallpaperCrownStyle}
                      title={t('profile.display.setWallpaper')}
                      aria-label={t('profile.display.setWallpaperAria')}
                    >
                      <Crown size={14} />
                    </button>
                  );

                  return (
                  <>
                  <div className="p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                    <button
                      type="button"
                      onClick={() => setBgSectionCollapsed(prev => !prev)}
                      className={`flex items-center gap-3 w-full text-left ${bgSectionCollapsed ? '' : 'mb-3'}`}
                      aria-expanded={!bgSectionCollapsed}
                    >
                      <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-btn)', color: '#9ca3af' }}>
                        <Sparkles size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-base font-medium">{t('profile.display.backgrounds')}</div>
                        <div className="text-gray-400 text-sm">{t('profile.display.backgroundsDesc')}</div>
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${bgSectionCollapsed ? '-rotate-90' : ''}`} />
                    </button>

                    {/* Target buttons with previews — visible even while
                        collapsed: the "what's currently set" summary this
                        section is for, not just an entry into the picker. */}
                    <div className={`flex gap-1.5 ${bgSectionCollapsed ? 'mt-3' : 'mb-3'}`}>
                      {[
                        { key: 'header', label: t('profile.display.targetHeader'), settingKey: 'headerBg' },
                        { key: 'navigation', label: t('profile.display.targetNavigation'), settingKey: 'navBg' },
                        { key: 'background', label: t('profile.display.targetBackground'), settingKey: 'appBg' },
                      ].map(t => {
                        const bg = visualSettings[t.settingKey];
                        return (
                          <button key={t.key} onClick={() => { setBgSectionCollapsed(false); setBgTarget(t.key); setEditingBgTarget(t.key === 'header' ? 'header' : t.key === 'navigation' ? 'nav' : 'bg'); }} className={`kuro-btn flex-1 text-sm relative overflow-hidden ${bgTarget === t.key && !bgSectionCollapsed ? 'active-gold' : ''}`} style={{ minHeight: bg?.url ? '48px' : undefined }}>
                            {bg?.url && bg?.type !== 'animated' && <img src={bg.url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
                            {bg?.type === 'animated' && <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 to-purple-900/40 opacity-50" />}
                            <span className="relative z-10">{t.label}</span>
                            {bg && <span className="relative z-10 ml-1 w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />}
                          </button>
                        );
                      })}
                    </div>

                    {!bgSectionCollapsed && (
                      <div className="flex gap-1.5 mb-3">
                        {['resonators', 'version', 'others', 'animated'].map(c => (
                          <button key={c} onClick={() => setBgCategory(c)} className={`kuro-btn flex-1 text-sm ${bgCategory === c ? 'active-cyan' : ''}`}>
                            {c === 'resonators' ? t('profile.display.categoryResonators') : c === 'version' ? t('profile.display.categoryVersion') : c === 'others' ? t('profile.display.categoryOthers') : c === 'animated' ? t('profile.display.categoryAnimated') : t('profile.display.categoryCustom')}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Clear current target — hidden while collapsed, same as the category tabs */}
                    {!bgSectionCollapsed && currentBg && (
                      <button onClick={() => saveVisualSettings({ ...visualSettings, [targetKey]: null })} className="kuro-btn w-full text-sm mb-2 text-red-400 border-red-500/20 hover:bg-red-500/10">
                        {t('profile.display.clearImage', { target: bgTarget })}
                      </button>
                    )}

                    {/* Image grid — stays visible (capped to a few rows) even while the section
                        header above is collapsed, rather than disappearing entirely: this IS
                        the picker, not just an expanded-only extra, and the wallpaper crown on
                        each thumbnail should stay reachable without expanding first. */}
                    {(() => {
                      const allItems = bgCategory === 'resonators' ? CHARACTER_THEMES
                        : bgCategory === 'version' ? VERSION_SPLASH_SCREENS
                        : bgCategory === 'others' ? OTHER_BACKGROUNDS
                        : ANIMATED_BACKGROUNDS;
                      // 12 = a full 3-row grid at the widest column count (4 cols × 3 rows) —
                      // still comfortably 3+ rows at 3 cols too. Only applied while collapsed.
                      const items = bgSectionCollapsed ? allItems.slice(0, 12) : allItems;
                      return (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                          {bgCategory === 'resonators' && items.map(th => (
                            <button
                              key={th.id}
                              onClick={() => selectImage('resonator', th.id, th.bannerArt, th.pos)}
                              className={`relative rounded-lg overflow-hidden border transition-all ${isSelected('resonator', th.id) ? 'ring-1' : 'border-[var(--border-medium)] hover:border-gray-500'}`}
                              style={{ aspectRatio: '16/9', borderColor: isSelected('resonator', th.id) ? getElementColor(th.element) : undefined, boxShadow: isSelected('resonator', th.id) ? `0 0 8px ${getElementColor(th.element)}40` : undefined }}
                            >
                              <img src={th.bannerArt} alt={th.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={hideOnError} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <span className="absolute bottom-0.5 left-1 text-white text-sm font-medium drop-shadow-lg">{th.name}</span>
                              <WallpaperCrown url={th.bannerArt} />
                              {isSelected('resonator', th.id) && <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: getElementColor(th.element) }}><Check size={12} className="text-black" /></div>}
                            </button>
                          ))}
                          {bgCategory === 'version' && items.map(v => (
                            <button
                              key={v.id}
                              onClick={() => selectImage('version', v.id, v.art, v.pos)}
                              className={`relative rounded-lg overflow-hidden border transition-all ${isSelected('version', v.id) ? 'ring-1 border-yellow-500 kuro-shadow-selected-gold' : 'border-[var(--border-medium)] hover:border-gray-500'}`}
                              style={{ aspectRatio: '16/9' }}
                            >
                              <img src={v.art} alt={v.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={hideOnError} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <span className="absolute bottom-0.5 left-1 text-white text-sm font-medium drop-shadow-lg">v{v.version}{v.id.includes('-cyberpunk') ? ' (Cyberpunk)' : ''}</span>
                              <WallpaperCrown url={v.art} />
                              {isSelected('version', v.id) && <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center"><Check size={12} className="text-black" /></div>}
                            </button>
                          ))}
                          {bgCategory === 'others' && items.map(o => (
                            <button
                              key={o.id}
                              onClick={() => selectImage('other', o.id, o.art, o.pos)}
                              className={`relative rounded-lg overflow-hidden border transition-all ${isSelected('other', o.id) ? 'ring-1 border-yellow-500 kuro-shadow-selected-gold' : 'border-[var(--border-medium)] hover:border-gray-500'}`}
                              style={{ aspectRatio: '16/9' }}
                            >
                              <img src={o.art} alt={o.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={hideOnError} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <span className="absolute bottom-0.5 left-1 text-white text-sm font-medium drop-shadow-lg">{o.name}</span>
                              <WallpaperCrown url={o.art} />
                              {isSelected('other', o.id) && <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center"><Check size={12} className="text-black" /></div>}
                            </button>
                          ))}
                          {bgCategory === 'animated' && items.map(a => (
                            <button
                              key={a.id}
                              onClick={() => selectImage('animated', a.id, a.art, a.pos, a.poster)}
                              className={`relative rounded-lg overflow-hidden border transition-all ${isSelected('animated', a.id) ? 'ring-1 border-yellow-500 kuro-shadow-selected-gold' : 'border-[var(--border-medium)] hover:border-gray-500'}`}
                              style={{ aspectRatio: '16/9' }}
                            >
                              <img src={a.poster} alt={a.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={hideOnError} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <span className="absolute bottom-0.5 left-1 text-white text-sm font-medium drop-shadow-lg">{a.name}</span>
                              <div className="absolute top-0.5 left-0.5 text-2xs bg-black/70 text-cyan-300 px-1 py-0.5 rounded">VIDEO</div>
                              {/* Wallpaper crown moved to the right (top-0.5 left-0.5 would collide
                                  with the VIDEO badge above) — the still poster frame is what
                                  actually gets applied, same as everywhere else. */}
                              {!isNativePlatformForSettings() ? null : (
                                <button
                                  onClick={(e) => applyAnimatedWallpaper(e, a)}
                                  className="absolute top-0.5 z-10 flex items-center justify-center bg-black/70 text-gray-300 hover:bg-yellow-500/30 hover:text-yellow-300"
                                  style={{ right: 'calc(var(--size-icon-btn) + 4px)', width: 'var(--size-icon-btn)', height: 'var(--size-icon-btn)', minHeight: 'var(--size-icon-btn)', borderRadius: 'var(--radius-sm)', padding: 0 }}
                                  title={t('profile.display.setWallpaper')}
                                  aria-label={t('profile.display.setWallpaperAria')}
                                >
                                  <Crown size={14} />
                                </button>
                              )}
                              {isSelected('animated', a.id) && <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center"><Check size={12} className="text-black" /></div>}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  {/* Home/Lock/Both target picker — shown before a static wallpaper crown
                      click actually applies, instead of always forcing 'both'. */}
                  <FocusTrapModal
                    isOpen={!!wallpaperTargetPrompt}
                    onClose={() => setWallpaperTargetPrompt(null)}
                    ariaLabel={t('profile.display.setWallpaper')}
                    centered
                    onClick={(e) => { if (e.target === e.currentTarget) setWallpaperTargetPrompt(null); }}
                  >
                    <div className="kuro-card p-4 rounded-lg w-full max-w-xs mx-auto" style={{ background: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
                      <div className="text-white text-base font-medium mb-3">{t('profile.display.setWallpaper')}</div>
                      <div className="flex flex-col gap-1.5">
                        {[
                          { target: 'home', label: t('profile.display.wallpaperTargetHome') },
                          { target: 'lock', label: t('profile.display.wallpaperTargetLock') },
                          { target: 'both', label: t('profile.display.wallpaperTargetBoth') },
                        ].map(({ target, label }) => (
                          <button
                            key={target}
                            className="kuro-btn w-full text-sm"
                            onClick={() => { const url = wallpaperTargetPrompt?.url; setWallpaperTargetPrompt(null); if (url) doSetWallpaper(url, target); }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </FocusTrapModal>
                  </>
                  );
                })()}

                {/* Accent Theme — element-based */}
                <div className="p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-[30px] h-[30px] rounded-lg flex items-center justify-center"
                      style={{ background: visualSettings.theme !== 'default' ? getElementBg(visualSettings.theme) : 'var(--bg-btn)', color: visualSettings.theme !== 'default' ? getElementColor(visualSettings.theme) : '#9ca3af' }}
                    >
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="text-white text-base font-medium">{t('profile.display.accentTheme')}</div>
                      <div className="text-gray-400 text-sm">{t('profile.display.accentThemeDesc')}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => saveVisualSettings({ ...visualSettings, theme: 'default' })} className={`kuro-btn text-sm ${visualSettings.theme === 'default' ? 'active-gold' : ''}`}>{t('profile.display.default')}</button>
                    {['Spectro', 'Glacio', 'Fusion', 'Electro', 'Aero', 'Havoc'].map(el => (
                      <button key={el} onClick={() => saveVisualSettings({ ...visualSettings, theme: el })} className={`kuro-btn text-sm`} style={visualSettings.theme === el ? { borderColor: getElementColor(el), background: getElementBg(el), color: getElementColor(el), boxShadow: `0 0 8px ${getElementColor(el)}40` } : undefined}>
                        {el}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound — subsection within Display Settings: master toggle
                    + ambient/convene music tracks. No separate divider/label
                    above it — matches every other subsection in this same
                    card (Animations, Backgrounds, Accent Theme): each one is
                    just another row, self-labeled by its own bold title,
                    with no section header of its own. */}

                {/* Master Sound Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${visualSettings.soundEnabled ? 'bg-cyan-500 text-white' : 'text-gray-400'}`} style={!visualSettings.soundEnabled ? { background: 'var(--bg-btn)' } : undefined}>
                      {visualSettings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </div>
                    <div>
                      <div className="text-white text-base font-medium">{t('profile.sound.master')}</div>
                      <div className="text-gray-400 text-sm">{t('profile.sound.masterDesc')}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, soundEnabled: !visualSettings.soundEnabled })}
                    className={`relative w-[48px] h-[24px] rounded-full transition-colors flex-shrink-0 ${visualSettings.soundEnabled ? 'bg-cyan-500' : ''}`}
                    style={!visualSettings.soundEnabled ? { background: 'var(--bg-btn)' } : undefined}
                    role="switch"
                    aria-checked={visualSettings.soundEnabled}
                    aria-label={t('profile.sound.toggleMaster')}
                  >
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all ${visualSettings.soundEnabled ? 'left-[32px] bg-white' : 'left-[4px] bg-gray-400'}`} />
                  </button>
                </div>

                {/* Ambient Music track picker — Off / 1.0 / 2.0 / 3.0 Login
                    Screen / Convene (the pull-simulator's own loop, folded
                    in here as just another track choice rather than a
                    separate always-on toggle scoped to that one modal). */}
                <div className="p-3 rounded-lg border border-[var(--border-medium)] bg-white/5 space-y-2">
                  <div>
                    <div className="text-white text-base font-medium">{t('profile.sound.ambient')}</div>
                    <div className="text-gray-400 text-sm">{t('profile.sound.ambientDesc')}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['off', '1', '2', '3', 'convene'].map((track) => (
                      <button
                        key={track}
                        type="button"
                        onClick={() => saveVisualSettings({ ...visualSettings, logScreenTrack: track })}
                        className={`kuro-btn kuro-btn-sm ${visualSettings.logScreenTrack === track ? 'active-gold' : ''}`}
                      >
                        {track === 'off' ? t('profile.sound.trackOff') : track === 'convene' ? t('profile.sound.trackConvene') : t(`profile.sound.track${track}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Install App on Device */}
                {pwa?.canInstall && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center bg-[rgba(237,175,24,0.2)] text-yellow-400">
                        <Download size={16} />
                      </div>
                      <div>
                        <div className="text-white text-base font-medium">{t('profile.display.installApp')}</div>
                        <div className="text-gray-400 text-sm">{t('profile.display.installAppDesc')}</div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        const accepted = await pwa.promptInstall();
                        if (accepted) toast?.addToast?.(t('profile.display.installSuccess'), 'success');
                      }}
                      className="px-3 py-1.5 bg-[rgba(237,175,24,0.9)] text-black rounded-lg text-base font-medium hover:bg-[rgba(237,175,24,1)] transition-colors"
                    >
                      {t('profile.display.install')}
                    </button>
                  </div>
                )}
                {pwa?.isInstalled && (
                  <p className="text-emerald-400 text-sm text-center">✓ {t('profile.display.installed')}</p>
                )}
              </CardBody>
            </Card>

            <ImportFlow
              processImportData={processImportData}
              toast={toast}
            />
            </div>{/* end desktop-grid-2 */}

            {state.profile.importedAt && (
              <Card>
                <CardHeader action={<button onClick={async () => { if (await confirm({ title: t('profile.importInfo.clearTitle'), message: t('profile.importInfo.clearMessage'), confirmLabel: t('profile.importInfo.clearConfirm'), destructive: true })) { dispatch({ type: 'CLEAR_PROFILE' }); try { localStorage.removeItem('ww-owned-chars'); localStorage.removeItem('ww-manual-counts'); } catch {} toast?.addToast?.(t('profile.importInfo.clearedToast'), 'info'); } }} className="text-red-400 text-sm hover:text-red-300 transition-colors" aria-label={t('profile.importInfo.clearAria')}>{t('profile.importInfo.clear')}</button>}>{t('profile.importInfo.title')}</CardHeader>
                <CardBody>
                  {state.profile.uid && <div className="flex justify-between text-base mb-2"><span className="text-gray-400">{t('profile.importInfo.uid')}</span><span className="text-gray-100 font-mono">{state.profile.uid}</span></div>}
                  <div className="flex justify-between text-base"><span className="text-gray-400">{t('profile.importInfo.imported')}</span><span className="text-gray-300">{formatDate(new Date(state.profile.importedAt))}</span></div>
                  <p className="text-gray-400 text-sm mt-2">{t('profile.importInfo.viewStatsHint')}</p>
                </CardBody>
              </Card>
            )}

            {/* ── App maintenance: updates + offline asset downloads ────────── */}
            <AppUpdateCard toast={toast} />
            <PullBubbleCard toast={toast} />
            <PushNotificationsCard toast={toast} />
            {isNativePlatformForSettings() && <OfflineAssetsCard toast={toast} />}

            {/* ── Cloud Backup ──────────────────────────────────── */}
            <Card>
              <CardHeader>{t('profile.backup.title')}</CardHeader>
              <CardBody className="space-y-3">
                {googleUser ? (
                  <>
                    <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-stat)' }}>
                      {googleUser.photoUrl ? <img src={googleUser.photoUrl} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" onError={e => { e.target.style.display = 'none'; }} /> : <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-base font-bold">{(googleUser.displayName || 'U')[0]}</div>}
                      <div className="flex-1 min-w-0">
                        <div style={{ color: 'var(--text-heading)', fontSize: 'var(--font-base)', fontWeight: 600 }} className="truncate">{googleUser.displayName}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }} className="truncate">{googleUser.email || t('profile.backup.cloudBackupLinked')}</div>
                      </div>
                      <button onClick={handleGoogleSignOut} className="kuro-btn active-red text-sm px-2 py-1 flex-shrink-0">{t('profile.backup.signOut')}</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleCloudBackup}
                        disabled={cloudBackupStatus === 'saving'}
                        className="kuro-btn py-2 text-base flex items-center justify-center gap-1 active-emerald"
                      >
                        {cloudBackupStatus === 'saving' ? t('profile.backup.saving') : `↑ ${t('profile.backup.backup')}`}
                      </button>
                      <button
                        onClick={handleCloudRestore}
                        disabled={cloudBackupStatus === 'loading'}
                        className="kuro-btn py-2 text-base flex items-center justify-center gap-1 active-gold"
                      >
                        {cloudBackupStatus === 'loading' ? t('profile.backup.loading') : `↓ ${t('profile.backup.restore')}`}
                      </button>
                    </div>
                    {cloudBackupStatus === 'done' && <div className="text-center" style={{ color: 'var(--accent-green)', fontSize: 'var(--font-sm)' }}>{t('profile.backup.done')}</div>}
                  </>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    className="kuro-btn w-full py-3 flex items-center justify-center gap-2 text-base"
                  >
                    <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                    {t('profile.backup.signInGoogle')}
                  </button>
                )}
                <p style={{ color: 'var(--text-disabled)', fontSize: 'var(--font-sm)', textAlign: 'center' }}>{t('profile.backup.syncHint')}</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-2">
                <button onClick={handleExport} className="kuro-btn w-full py-2 flex items-center justify-center gap-1">
                  <Download size={14} /> {t('profile.export.exportBackup')}
                </button>
                <div className="border-t border-red-900/30 mt-4 pt-3">
                  <button onClick={async () => { if (await confirm({ title: t('profile.export.resetTitle'), message: t('profile.export.resetMessage', { cloudNote: googleUser ? t('profile.export.resetCloudNote') : '' }), confirmLabel: t('profile.export.resetConfirm'), destructive: true })) {
                    haptic.warning();
                    dispatch({ type: 'RESET' });
                    clearAllAuxKeys();
                    // Immediately persist reset to localStorage (don't wait for 300ms debounce)
                    try { localStorage.removeItem('whispering-wishes-v2.2'); } catch {}
                    // Delete cloud backup if signed in (await before sign-out to preserve auth token)
                    if (handleCloudDelete) await handleCloudDelete();
                    if (handleGoogleSignOut) handleGoogleSignOut();
                    toast?.addToast?.(t('profile.export.resetDone'), 'info');
                  } }} className="kuro-btn w-full py-2 active-red">
                    {t('profile.export.resetAllData')}
                  </button>
                </div>
              </CardBody>
            </Card>

            <AboutSection handleAdminTap={handleAdminTap} adminTapCount={adminTapCount} dispatch={dispatch} toast={toast} />
          </div>
          </TabErrorBoundary>
          </div>

      {/* Resonator ID Card Modal */}
      <IdCardModal
        showIdCard={showIdCard}
        setShowIdCard={setShowIdCard}
        idCardFormat={idCardFormat}
        setIdCardFormat={setIdCardFormat}
        downloadIdCard={downloadIdCard}
        state={state}
        luckRating={luckRating}
        overallStats={overallStats}
        collectionImages={collectionImages}
        ownedCharNames={ownedCharNames}
        idCardTrapRef={idCardTrapRef}
        trophies={trophies}
      />

      {/* Admin Panel Modal + Mini Window */}
      <AdminPanel
        showAdminPanel={showAdminPanel} setShowAdminPanel={setShowAdminPanel}
        adminUnlocked={adminUnlocked} setAdminUnlocked={setAdminUnlocked}
        adminPassword={adminPassword} setAdminPassword={setAdminPassword}
        adminTab={adminTab} setAdminTab={setAdminTab}
        adminMiniMode={adminMiniMode} setAdminMiniMode={setAdminMiniMode}
        bannerForm={bannerForm} setBannerForm={setBannerForm}
        trophyJsonInput={trophyJsonInput} setTrophyJsonInput={setTrophyJsonInput}
        activePlayersCount={activePlayersCount} activePlayersHistory={activePlayersHistory}
        presenceError={presenceError} adminPlayerList={adminPlayerList}
        adminLockedUntil={adminLockedUntil}
        trophies={trophies}
        fetchActivePlayersCount={fetchActivePlayersCount} fetchAdminPlayerList={fetchAdminPlayerList}
        trophyOverrides={trophyOverrides} setTrophyOverrides={setTrophyOverrides}
        verifyAdminPassword={verifyAdminPassword} saveCustomBanners={saveCustomBanners}
        buildBannerForm={buildBannerForm} updateBannerForm={updateBannerForm}
        visualSettings={visualSettings} saveVisualSettings={saveVisualSettings}
        customCollectionImages={customCollectionImages} saveCollectionImages={saveCollectionImages}
        collectionImages={collectionImages}
        activeBanners={activeBanners} setActiveBanners={setActiveBanners}
        state={state} dispatch={dispatch} toast={toast} confirm={confirm}
        adminTrapRef={adminTrapRef}
        setActiveTab={setActiveTab}
        withCacheBuster={withCacheBuster}
        detailModal={detailModal}
        DEFAULT_VISUAL_SETTINGS={DEFAULT_VISUAL_SETTINGS}
        bgFramingMode={bgFramingMode} setBgFramingMode={setBgFramingMode}
        editingBgTarget={editingBgTarget} setEditingBgTarget={setEditingBgTarget}
        updateBgPosition={updateBgPosition} getBgPositionLabel={getBgPositionLabel}
        exportBgPositions={exportBgPositions}
      />

    </>
  );
}

export default React.memo(ProfileTab, (prev, next) =>
  prev.state.profile === next.state.profile && prev.state.server === next.state.server &&
  prev.state.settings === next.state.settings && prev.visualSettings === next.visualSettings &&
  prev.overallStats === next.overallStats && prev.trophies === next.trophies &&
  prev.collectionImages === next.collectionImages && prev.activeBanners === next.activeBanners &&
  prev.showAdminPanel === next.showAdminPanel && prev.adminMiniMode === next.adminMiniMode &&
  prev.adminUnlocked === next.adminUnlocked &&
  prev.bgFramingMode === next.bgFramingMode && prev.editingBgTarget === next.editingBgTarget &&
  prev.detailModal === next.detailModal &&
  prev.luckRating === next.luckRating && prev.ownedCharNames === next.ownedCharNames &&
  prev.trophyOverrides === next.trophyOverrides && prev.pwa === next.pwa &&
  prev.customCollectionImages === next.customCollectionImages &&
  prev.processImportData === next.processImportData
);
