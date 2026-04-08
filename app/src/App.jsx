// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES v3.2.3 - App (Main Application Component)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Main app module - WhisperingWishesInner + default export with providers.
// Imports all data, utilities, and components from AppCore.jsx.
//
// [SECTION INDEX] - Use: grep - n "SECTION:\|TAB-" App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// [SECTION:MAINAPP]          Main app component (WhisperingWishesInner)
//   ├─ [TAB-TRACKER]         Banner tracker tab
//   ├─ [TAB-EVENTS]          Events tab
//   ├─ [TAB-CALC]            Calculator tab
//   ├─ [TAB-PLANNER]         Planner tab
//   ├─ [TAB-STATS]           Stats tab
//   ├─ [TAB-COLLECT]         Collection tab
//   └─ [TAB-PROFILE]         Profile tab
// [SECTION:EXPORT]           Main export with providers
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo, useCallback, useReducer, useEffect, useRef } from 'react';
import { Archive, BarChart3, Calculator, Calendar, Check, ChevronDown, Crown, Diamond, Download, Heart, Info, Menu, Settings, Sparkles, Star, Sword, TrendingUp, Trophy, User, Users, X, Zap } from 'lucide-react';
// --- data ---
import { ALL_CHARACTERS, STANDARD_5STAR_CHARACTERS, RELEASE_ORDER } from './data/characters.js';
import { CURRENT_BANNERS } from './data/banners.js';
import { APP_VERSION, MAX_IMPORT_SIZE_MB, HEADER_ICON, HARD_PITY, ASTRITE_PER_PULL, BEGINNER_ASTRITE_PER_PULL, SERVERS, getServerOffset } from './data/constants.js';
import { generateUniqueId, calculateLuckRating } from './utils/helpers.js';
// --- extracted hooks ---
import { useVisualSettings, DEFAULT_VISUAL_SETTINGS } from './hooks/useVisualSettings.js';
import { useBackgroundFraming } from './hooks/useBackgroundFraming.js';
import { useCollectionImages, COLLECTION_IMAGES_KEY } from './hooks/useCollectionImages.js';
import { useTabNavigation } from './hooks/useTabNavigation.js';
import { usePresenceTracking, checkFirebaseRateLimit } from './hooks/usePresenceTracking.js';
import { useThemeAccent } from './hooks/useThemeAccent.js';
// --- core ---
import { ACTION, UNDOABLE_ACTIONS, createUndoReducer, initialState, reducer } from './core/reducer.js';
import { STORAGE_KEY, storageAvailable, loadFromStorage, saveToStorage, sanitizeStateObj, sanitizeImportedState } from './core/storage.js';
import { getServerAdjustedEnd } from './core/time.js';
import { computeTrophies } from './core/computeTrophies.js';
// --- providers ---
import { PWAProvider, usePWA } from './providers/PWAProvider.jsx';
import { ToastProvider, useToast } from './providers/ToastProvider.jsx';
import { ConfirmProvider, useConfirm } from './providers/ConfirmProvider.jsx';
import { FocusTrapModal, useFocusTrap } from './providers/FocusTrapModal.jsx';
// KuroStyles removed — CSS now loaded via <link> in index.html (src/styles/kuro.css)
// OLED mode overrides handled by .oled-mode class on root div (no JS needed)
import { OnboardingModal } from './providers/OnboardingModal.jsx';
import { ImageFramingProvider, useImageFramingContext } from './providers/ImageFramingProvider.jsx';
import { CloudStorageProvider, useCloudStorage } from './providers/CloudStorageProvider.jsx';
// --- shared ---
import { CharacterDetailModal } from './shared/modals/CharacterDetailModal.jsx';
import { WeaponDetailModal } from './shared/modals/WeaponDetailModal.jsx';
import { EchoDetailModal } from './shared/modals/EchoDetailModal.jsx';
import { TabButton } from './shared/components/Card.jsx';
import { AppErrorBoundary, TabErrorBoundary } from './shared/errors/ErrorBoundaries.jsx';
import { BackgroundGlow } from './shared/backgrounds/BackgroundGlow.jsx';
import { TriangleMirrorWave } from './shared/backgrounds/TriangleMirrorWave.jsx';
import { ResonanceField } from './shared/backgrounds/ResonanceField.jsx';
import { Honour } from './shared/backgrounds/Honour.jsx';
import { getActiveBanners } from './shared/components/bannerUtils.js';
// --- Feature tabs ---
// --- Feature tabs (eager-loaded — code splitting reverted due to shared module race conditions) ---
import TrackerTab from './features/tracker/TrackerTab.jsx';
import EventsTab from './features/events/EventsTab.jsx';
import PlannerTab from './features/planner/PlannerTab.jsx';
import AnalyticsTab from './features/analytics/AnalyticsTab.jsx';
import CalculatorTab from './features/calculator/CalculatorTab.jsx';
import CollectionTab from './features/collection/CollectionTab.jsx';
import TeamsTab from './features/teams/TeamsTab.jsx';
import ProfileTab from './features/profile/ProfileTab.jsx';

// ── Module-level constants (hoisted from render body) ──────────────────────
const DEBOUNCE_MS = 300;
const CALC_DEFER_MS = 150;
const STORAGE_WARNING_THRESHOLD = 3.5 * 1024 * 1024;
import { constantTimeCompare } from './utils/constantTimeCompare.js'; // I4-01: deduplicated
import {
  VISUAL_SETTINGS_KEY, IMAGE_FRAMING_KEY, TROPHY_OVERRIDES_KEY,
  ADMIN_SALT, ADMIN_TAP_TIMEOUT_MS, MAX_USERNAME_LENGTH, MAX_BOOKMARK_NAME_LENGTH,
} from './shared/constants/appConstants.js';
const currentYear = new Date().getFullYear();
const TRACKER_CATEGORIES = Object.freeze([
  Object.freeze({ key: 'character', label: 'Resonators', color: 'yellow' }),
  Object.freeze({ key: 'weapon', label: 'Weapons', color: 'pink' }),
  Object.freeze({ key: 'standard', label: 'Standard', color: 'cyan' }),
]);

import { silentCatch } from './utils/silentCatch.js';

// P13-FIX: HIGH-5 - Hash UIDs before writing to Firebase to protect player privacy.
// Game UIDs can potentially be correlated to real identities; hashing makes stored data pseudonymous.
const hashUidForStorage = async (uid) => {
  if (!uid) return null;

  // Try Web Crypto first (HTTPS only)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ww-uid-' + uid));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
    } catch {
      // Sync fallback - don't expose raw UID
      const str = 'ww-uid-' + uid;
      let hash = 5381;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
      }
      return hash.toString(16).padStart(8, '0') + str.length.toString(16).padStart(4, '0');
    }
  }

  // Fallback: FNV-1a hash (not cryptographic, but better than raw UID)
  let hash = 0x811c9dc5;
  const str = 'ww-uid-' + uid;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const h1 = (hash >>> 0).toString(16).padStart(8, '0');
  let hash2 = 0x1a2b3c4d;
  for (let i = 0; i < str.length; i++) {
    hash2 ^= str.charCodeAt(i);
    hash2 = Math.imul(hash2, 0x01000193);
  }
  const h2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return (h1 + h2 + h1.split('').reverse().join('') + h2.split('').reverse().join('')).slice(0, 32);
};

// [SECTION:MAINAPP]
function WhisperingWishesInner() {
  
  const toast = useToast();
  const confirm = useConfirm();
  const pwa = usePWA();
  const undoReducer = useMemo(() => createUndoReducer(reducer), []);
  const [state, rawDispatch] = useReducer(undoReducer, initialState);
  // Wrap dispatch to show undo toast on destructive actions
  const dispatch = useCallback((action) => {
    rawDispatch(action);
    if (UNDOABLE_ACTIONS.has(action.type)) {
      toast?.addToast?.('Action completed', 'info', 5000, () => rawDispatch({ type: 'UNDO' }));
    }
  }, [rawDispatch, toast]);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  // Admin panel state lifted to App so mini panel survives tab switches
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminMiniMode, setAdminMiniMode] = useState(false);

  const [exportData, setExportData] = useState('');
  const [restoreText, setRestoreText] = useState('');
  // Google Auth + Cloud Storage — provided by CloudStorageProvider context
  // (googleUser, cloudBackupStatus, auth tokens managed inside provider)

  const stateRef = useRef(state);
  

  const [activeBanners, setActiveBanners] = useState(() => {
    try {
      const banners = getActiveBanners();
      if (!banners || !banners.endDate) {
        console.error('[WW] getActiveBanners() returned invalid data');
        return CURRENT_BANNERS;
      }
      return banners;
    } catch (err) {
      console.error('[WW] getActiveBanners() threw:', err);
      return CURRENT_BANNERS;
    }
  });
  // Banner ends at server-specific time (e.g., 11:59 local for each server)
  const bannerEndDate = useMemo(() => {
    if (!activeBanners?.endDate) return null;
    return getServerAdjustedEnd(activeBanners.endDate, state.server);
  }, [activeBanners?.endDate, state.server]);
  // Validate server name - surface warning if corrupted
  useEffect(() => {
    if (state.server && !SERVERS[state.server]) {
      toast?.addToast?.(`Unknown server "${state.server}". Defaulting to Europe. Please update in Settings.`, 'warning');
      dispatch({ type: 'SET_SERVER', server: 'Europe' });
    }
  }, [state.server, toast]);
  const [trophyOverrides, setTrophyOverrides] = useState(() => {
    try { const s = localStorage.getItem(TROPHY_OVERRIDES_KEY); return s ? JSON.parse(s) : {}; } catch (err) { silentCatch(err, 'trophy overrides init'); return {}; }
  });
  
  // ── Extracted hooks ──────────────────────────────────────────────────────
  const { visualSettings, setVisualSettings, saveVisualSettings } = useVisualSettings();
  
  

  // Image framing — provided by ImageFramingProvider context
  const {
    imageFraming, setImageFraming, editingImage, setEditingImage,
    framingMode, setFramingMode, miniPanelPosition, saveMiniPanelPosition,
    getMiniPanelPositionClasses, saveImageFraming, getImageFraming,
    updateEditingFraming, resetEditingFraming,
  } = useImageFramingContext();

  const {
    bgFramingMode, setBgFramingMode, editingBgTarget, setEditingBgTarget,
    customBgPositions, saveBgPosition, getCustomBgPosition, updateBgPosition,
    getBgPositionLabel, exportBgPositions,
  } = useBackgroundFraming(visualSettings, saveVisualSettings);

  
  // Default character/weapon images (built-in)
  
  // Collection filter/sort/view state moved to CollectionTab component
  
  // Collection search/filter/sort logic moved to CollectionTab component

  // Cache-busting for images (version-based, only refreshes on manual refresh)
  // Initial value is an arbitrary version token; replaced with Date.now() on manual refresh
  const [imageCacheBuster, setImageCacheBuster] = useState(APP_VERSION);
  const refreshImages = useCallback(() => {
    setImageCacheBuster(String(Date.now()));
    // Also clear SW image cache
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage('clearImageCache');
    }
  }, []);
  
  // Helper to add cache-busting to image URL
  const withCacheBuster = useCallback((url) => {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${imageCacheBuster}`;
  }, [imageCacheBuster]);
  
  const { customCollectionImages, setCustomCollectionImages, collectionImages, saveCollectionImages } = useCollectionImages();

  // Admin password - only the app owner can access admin (hash defined at module level)
  
  // Keep ref updated
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Load state from persistent storage on mount
  useEffect(() => {
    const rawSaved = storageAvailable ? localStorage.getItem(STORAGE_KEY) : null;
    const savedState = loadFromStorage();
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', state: savedState });
      if (savedState.profile.importedAt) {
        toast?.addToast?.('Data restored', 'success');
      }
      // For existing users: check if they've explicitly dismissed onboarding
      // Parse raw data to check original settings, not merged with initialState
      let originalSettings = {};
      try {
        const parsed = rawSaved ? JSON.parse(rawSaved) : null;
        originalSettings = parsed?.settings || {};
      } catch (e) { console.warn('Failed to parse saved settings:', e); }
      // Only show onboarding if the original saved data had it explicitly true
      // If settings.showOnboarding is missing/undefined, user is existing - don't show
      const shouldShow = originalSettings.showOnboarding === true;
      setShowOnboarding(shouldShow);
    } else {
      // First time user only - show onboarding
      setShowOnboarding(true);
    }
    setStorageLoaded(true);
  }, []); // P14-FIX: LOW-3 - Removed dead eslint-disable comment (no ESLint configured)

  // Save state to storage whenever it changes (debounced to avoid jank from rapid state changes)
  // P9-FIX: Debounce saveToStorage to prevent synchronous JSON.stringify jank (Step 4 audit)
  const saveTimerRef = useRef(null);
  const saveFailCountRef = useRef(0); // P12-FIX: Track consecutive save failures to avoid toast spam (Step 14 - MEDIUM-10a)
  useEffect(() => {
    if (!storageLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const success = saveToStorage(state);
      if (!success) {
        saveFailCountRef.current++;
        // Only show toast on first failure (avoid spamming on every state change)
        if (saveFailCountRef.current === 1) {
          toast?.addToast?.('Storage full. Data may not be saved. Try clearing old Convene history.', 'error');
        }
      } else {
        saveFailCountRef.current = 0;
      }
    }, 300);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [state, storageLoaded]);
  
  // Save on page unload
  useEffect(() => {
    if (!storageAvailable) return;
    const handleUnload = () => {
      if (stateRef.current) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stateRef.current, version: APP_VERSION }));
        } catch {}
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);
  
  // P12-FIX: Cross-tab synchronization - reload state when another tab writes to localStorage (Step 14 audit - MEDIUM-10b)
  // Without this, two tabs open simultaneously would silently overwrite each other's changes (last-write-wins).
  // Debounced (3.7 fix) to prevent rapid dispatches when another tab saves frequently.
  useEffect(() => {
    if (!storageAvailable) return;
    let debounceTimer = null;
    const handleStorageChange = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          const externalState = JSON.parse(e.newValue);
          const safeParsed = sanitizeStateObj(externalState);
          const merged = {
            ...initialState,
            ...sanitizeImportedState(safeParsed),
            server: safeParsed.server || initialState.server,
            profile: {
              ...initialState.profile,
              ...(safeParsed.profile ? sanitizeStateObj(safeParsed.profile) : {}),
              featured: { ...initialState.profile.featured, ...(safeParsed.profile?.featured ? sanitizeStateObj(safeParsed.profile.featured) : {}) },
              weapon: { ...initialState.profile.weapon, ...(safeParsed.profile?.weapon ? sanitizeStateObj(safeParsed.profile.weapon) : {}) },
              standardChar: { ...initialState.profile.standardChar, ...(safeParsed.profile?.standardChar ? sanitizeStateObj(safeParsed.profile.standardChar) : {}) },
              standardWeap: { ...initialState.profile.standardWeap, ...(safeParsed.profile?.standardWeap ? sanitizeStateObj(safeParsed.profile.standardWeap) : {}) },
              beginner: { ...initialState.profile.beginner, ...(safeParsed.profile?.beginner ? sanitizeStateObj(safeParsed.profile.beginner) : {}) },
            },
            calc: { ...initialState.calc }, // Always start calculator fresh
            planner: { ...initialState.planner, ...safeParsed.planner },
            settings: { ...initialState.settings, ...safeParsed.settings },
            bookmarks: safeParsed.bookmarks || [],
            eventStatus: safeParsed.eventStatus || {},
          };
          dispatch({ type: 'LOAD_STATE', state: merged });
          toast?.addToast?.('Data synced from another tab', 'info');
        } catch (err) {
          console.warn('Cross-tab sync failed:', err);
        }
      }, DEBOUNCE_MS);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => { clearTimeout(debounceTimer); window.removeEventListener('storage', handleStorageChange); };
  }, []); // P14-FIX: LOW-3 - Removed dead eslint-disable comment (no ESLint configured)
  const { activeTab, setActiveTab, tabNavRef, navPadding } = useTabNavigation(visualSettings.swipeNavigation);
  

  const [detailModal, setDetailModal] = useState({ show: false, type: null, name: null, imageUrl: null, framing: null });
  // Close detail modal on tab switch to prevent it blocking the new tab
  useEffect(() => {
    if (detailModal.show) setDetailModal(prev => ({ ...prev, show: false }));
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // 6.1 fix: Focus trapping for inline modals - Tab wraps within modal, auto-focus first element, restore on close
  const exportTrapRef = useFocusTrap(showExportModal);

  // Overall stats from imported history
  const overallStats = useMemo(() => {
    const stdCharHist = state.profile.standardChar?.history || [];
    const stdWeapHist = state.profile.standardWeap?.history || [];
    const featuredHist = state.profile.featured.history || [];
    const weaponHist = state.profile.weapon.history || [];
    const beginnerHist = state.profile.beginner?.history || [];
    const all = [...featuredHist, ...weaponHist, ...stdCharHist, ...stdWeapHist, ...beginnerHist];
    if (!all.length) return null;
    
    // All 5★ pulls
    const fives = all.filter(p => p.rarity === 5);
    
    // 50/50 stats from featured character banner
    const featured5Stars = featuredHist.filter(p => p.rarity === 5);
    const won = featured5Stars.filter(p => p.won5050 === true).length;
    const lost = featured5Stars.filter(p => p.won5050 === false).length;
    
    // Average pity - only count 5★ with pity > 0
    const fivesWithPity = fives.filter(p => p.pity && p.pity > 0);
    const avgPity = fivesWithPity.length > 0 
      ? (fivesWithPity.reduce((s, p) => s + p.pity, 0) / fivesWithPity.length).toFixed(1) 
      : '—';
    
    return { 
      totalPulls: all.length, 
      // P14-FIX: NIT-2 - Use named constant for beginner banner pull cost
      totalAstrite: (all.length - beginnerHist.length) * ASTRITE_PER_PULL + beginnerHist.length * BEGINNER_ASTRITE_PER_PULL,
      fiveStars: fives.length, 
      won5050: won, 
      lost5050: lost, 
      winRate: (won + lost) > 0 ? ((won / (won + lost)) * 100).toFixed(1) : null, 
      avgPity
    };
  }, [state.profile.featured?.history, state.profile.weapon?.history, state.profile.standardChar?.history, state.profile.standardWeap?.history, state.profile.beginner?.history]);
  
  // Leaderboard functions - Firebase Realtime Database (constants at module level)

  // Firebase anonymous auth + helpers — now in CloudStorageProvider
  // Presence system consumes them via useCloudStorage() below.

  
  // Presence tracking (extracted hook — heartbeat runs internally)
  usePresenceTracking();

  // F-015/F-016: Clean up stale localStorage backups and diagnostics on mount (24h TTL)
  useEffect(() => {
    const BACKUP_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();
    try {
      const preImport = localStorage.getItem('whispering-wishes-pre-import-backup');
      if (preImport) {
        const parsed = JSON.parse(preImport);
        if (parsed.timestamp && (now - new Date(parsed.timestamp).getTime()) > BACKUP_TTL_MS) {
          localStorage.removeItem('whispering-wishes-pre-import-backup');
        }
      }
    } catch { localStorage.removeItem('whispering-wishes-pre-import-backup'); }
    try {
      const preRestore = localStorage.getItem('whispering-wishes-pre-restore-backup');
      if (preRestore) {
        const parsed = JSON.parse(preRestore);
        if (parsed.timestamp && (now - new Date(parsed.timestamp).getTime()) > BACKUP_TTL_MS) {
          localStorage.removeItem('whispering-wishes-pre-restore-backup');
        }
      }
    } catch { localStorage.removeItem('whispering-wishes-pre-restore-backup'); }
    try {
      const diag = localStorage.getItem('ww-import-diagnostic');
      if (diag) {
        const parsed = JSON.parse(diag);
        if (parsed.timestamp && (now - new Date(parsed.timestamp).getTime()) > BACKUP_TTL_MS) {
          localStorage.removeItem('ww-import-diagnostic');
        }
      }
    } catch { localStorage.removeItem('ww-import-diagnostic'); }
  }, []);

  // Trophies/Badges computation (logic in core/computeTrophies.js)
  // P5-F001: Depend on actual history arrays, not state.profile (which is a new object on every dispatch)
  const trophies = useMemo(() => computeTrophies(state.profile, overallStats, trophyOverrides), [state.profile.featured?.history, state.profile.weapon?.history, state.profile.standardChar?.history, state.profile.standardWeap?.history, state.profile.beginner?.history, state.profile.profilePic, overallStats, trophyOverrides]);

  // P7-F005: Detect newly unlocked trophies and celebrate
  const prevTrophyIdsRef = useRef(null);
  useEffect(() => {
    if (!trophies?.list) { prevTrophyIdsRef.current = null; return; }
    const currentIds = new Set(trophies.list.map(t => t.id));
    if (prevTrophyIdsRef.current !== null) {
      const newTrophies = trophies.list.filter(t => !prevTrophyIdsRef.current.has(t.id));
      if (newTrophies.length > 0) {
        const names = newTrophies.map(t => t.name).join(', ');
        toast?.addToast?.(`🏆 Trophy unlocked: ${names}`, 'success');
      }
    }
    prevTrophyIdsRef.current = currentIds;
  }, [trophies, toast]);

  // Luck rating
  const luckRating = useMemo(() => calculateLuckRating(overallStats?.avgPity, overallStats?.fiveStars), [overallStats]);

  // Owned 5★ character names for profile pic picker
  const ownedCharNames = useMemo(() => {
    const charHistory = [...(state.profile.featured?.history || []), ...(state.profile.standardChar?.history || []), ...(state.profile.beginner?.history || []).filter(p => p.name && ALL_CHARACTERS.has(p.name))];
    return [...new Set(charHistory.filter(p => (p.rarity === 5 || p.rarity === 4) && p.name && ALL_CHARACTERS.has(p.name)).map(p => p.name))];
  }, [state.profile.featured?.history, state.profile.standardChar?.history, state.profile.beginner?.history]);

  const handleSetProfilePic = useCallback((name) => {
    if (state.profile.profilePic === name) {
      dispatch({ type: 'SET_PROFILE_PIC', value: '' });
      toast?.addToast?.('Profile picture removed', 'info');
    } else {
      dispatch({ type: 'SET_PROFILE_PIC', value: name });
      toast?.addToast?.(`Profile picture set to ${name}`, 'success');
    }
  }, [state.profile.profilePic, toast]);

  // Pre-compute all collection data in one pass
  // File import handler
  // P4: Memoized collection data - avoids recomputing 5x per render
  const collectionData = useMemo(() => {
    const beginnerHist = state.profile.beginner?.history || [];
    const charHistory = [...state.profile.featured.history, ...(state.profile.standardChar?.history || []), ...beginnerHist.filter(p => p.name && ALL_CHARACTERS.has(p.name))];
    const weapHistory = [...state.profile.weapon.history, ...(state.profile.standardWeap?.history || []), ...beginnerHist.filter(p => p.name && !ALL_CHARACTERS.has(p.name))];
    const countItems = (history, rarity, isChar) => {
      const items = history.filter(p => p.rarity === rarity && p.name && (isChar ? ALL_CHARACTERS.has(p.name) : !ALL_CHARACTERS.has(p.name)));
      return items.reduce((acc, p) => { acc[p.name] = (acc[p.name] || 0) + 1; return acc; }, {});
    };
    const sortItems = (items, sort, releaseOrder = RELEASE_ORDER) => {
      const arr = [...items];
      if (sort === 'copies') {
        arr.sort((a, b) => {
          if (b[1] !== a[1]) return b[1] - a[1]; // owned count descending
          // Tiebreaker: release order newest→oldest
          const aIdx = releaseOrder.indexOf(a[0]);
          const bIdx = releaseOrder.indexOf(b[0]);
          return (bIdx === -1 ? -1 : bIdx) - (aIdx === -1 ? -1 : aIdx);
        });
      } else {
        arr.sort((a, b) => { const aIdx = releaseOrder.indexOf(a[0]); const bIdx = releaseOrder.indexOf(b[0]); return (bIdx === -1 ? -1 : bIdx) - (aIdx === -1 ? -1 : aIdx); });
      }
      return arr;
    };
    // Rover is a free starter character - always count as obtained (minimum 1 copy)
    const chars5 = countItems(charHistory, 5, true);
    if (!chars5['Rover']) chars5['Rover'] = 1;
    return {
      chars5Counts: chars5, chars4Counts: countItems(charHistory, 4, true),
      weaps5Counts: countItems(weapHistory, 5, false), weaps4Counts: countItems(weapHistory, 4, false),
      weaps3Counts: countItems(weapHistory, 3, false),
      weaps2Counts: countItems(weapHistory, 2, false),
      weaps1Counts: countItems(weapHistory, 1, false), sortItems
    };
  }, [state.profile.featured.history, state.profile.standardChar?.history, state.profile.weapon.history, state.profile.standardWeap?.history, state.profile.beginner?.history]);

  // collectionMaskData moved to CollectionTab component

  // Shared import processor for both file and paste methods
  // Name normalization: maps game API / tracker names to internal names used in this app
  const IMPORT_NAME_ALIASES = useMemo(() => ({
    'The Shorekeeper': 'Shorekeeper',
    'Rover (Spectro)': 'Rover', 'Rover (Havoc)': 'Rover', 'Rover (Aero)': 'Rover',
    'Rover-Spectro': 'Rover', 'Rover-Havoc': 'Rover', 'Rover-Aero': 'Rover',
  }), []);

  const importInFlightRef = useRef(false);
  const processImportData = useCallback(async (jsonString) => {
    // P2-F006: Prevent duplicate concurrent imports (race condition guard)
    if (importInFlightRef.current) { toast?.addToast?.('Import already in progress', 'warning'); return false; }
    importInFlightRef.current = true;
    try {
      // P10-FIX: Check raw string size before parsing to prevent expansion attacks (Step 6 audit)
      if (jsonString.length > MAX_IMPORT_SIZE_MB * 1024 * 1024) {
        throw new Error(`Import data too large (${(jsonString.length / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_IMPORT_SIZE_MB}MB.`);
      }
      const data = JSON.parse(jsonString);
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid data format - expected a JSON object');
      }

      // FIX #1: Detect own backup format (has 'state' key from handleExport)
      if (data.state && typeof data.state === 'object' && data.state.profile) {
        const doRestore = await confirm?.({ title: 'Restore full backup?', message: 'This will replace ALL current data (Convenes, teams, settings) with the backup. Continue?', confirmLabel: 'Restore', destructive: true });
        if (!doRestore) return;
        dispatch({ type: 'LOAD_STATE', state: data.state });
        // Restore auxiliary data (visual settings, team equipment, etc.)
        // B4-01: Use correct constant keys (was writing to wrong hardcoded keys)
        // B4-02: Sanitize aux data to match restore flow (App.jsx:1826-1842)
        if (data.aux && typeof data.aux === 'object') {
          try {
            if (data.aux.visualSettings && typeof data.aux.visualSettings === 'object') {
              localStorage.setItem(VISUAL_SETTINGS_KEY, JSON.stringify(sanitizeStateObj(data.aux.visualSettings)));
              setVisualSettings(prev => {
                const merged = { ...prev, ...sanitizeStateObj(data.aux.visualSettings) };
                if (typeof merged.collectionZoom === 'number') merged.collectionZoom = Math.min(300, Math.max(100, merged.collectionZoom));
                return merged;
              });
            }
            if (data.aux.imageFraming && typeof data.aux.imageFraming === 'object') {
              localStorage.setItem(IMAGE_FRAMING_KEY, JSON.stringify(sanitizeStateObj(data.aux.imageFraming)));
              setImageFraming(sanitizeStateObj(data.aux.imageFraming));
            }
            if (data.aux.collectionImages && typeof data.aux.collectionImages === 'object') {
              localStorage.setItem(COLLECTION_IMAGES_KEY, JSON.stringify(sanitizeStateObj(data.aux.collectionImages)));
              setCustomCollectionImages(sanitizeStateObj(data.aux.collectionImages));
            }
            if (data.aux.trophyOverrides && typeof data.aux.trophyOverrides === 'object') {
              localStorage.setItem(TROPHY_OVERRIDES_KEY, JSON.stringify(sanitizeStateObj(data.aux.trophyOverrides)));
              setTrophyOverrides(sanitizeStateObj(data.aux.trophyOverrides));
            }
            if (data.aux.teamEquipment && typeof data.aux.teamEquipment === 'object') {
              localStorage.setItem('ww-team-equipment', JSON.stringify(sanitizeStateObj(data.aux.teamEquipment)));
            }
            // U6-01: Restore calendar notes from backup (import path)
            if (data.aux.calendarNotes && typeof data.aux.calendarNotes === 'object') {
              localStorage.setItem('ww-calendar-notes', JSON.stringify(sanitizeStateObj(data.aux.calendarNotes)));
            }
          } catch {}
        }
        toast?.addToast?.(`Backup restored! (v${data.version || '?'}, ${data.timestamp ? new Date(data.timestamp).toLocaleDateString() : 'unknown date'})`, 'success');
        return true;
      }

      const pulls = data.pulls || data.conveneHistory || data.history || [];
      if (!Array.isArray(pulls)) {
        throw new Error('Invalid data -"pulls" must be an array');
      }
      if (pulls.length === 0) {
        throw new Error('No Convene data found in import. If this is a backup file, it should contain a "state" key.');
      }

      // Store diagnostic log if available (from direct API fetch) for admin panel
      if (data._diagnostic) {
        try { localStorage.setItem('ww-import-diagnostic', JSON.stringify({ timestamp: new Date().toISOString(), log: data._diagnostic, pullCount: pulls.length })); } catch {}
      }

      // Detect import source — API direct fetch vs WuWaTracker/file import
      const isApiSource = data._source === 'api';

      // FIX #2: Warn if importing from a different account
      const importUid = data.uid || data.playerId || '';
      const existingUid = stateRef.current.profile.uid || '';
      if (importUid && existingUid && importUid !== existingUid) {
        const proceed = await confirm?.({ title: 'Different account detected', message: `This data is from UID ${importUid.slice(0, 6)}... but your current account is ${existingUid.slice(0, 6)}... Import will merge both accounts' history. Continue?`, confirmLabel: 'Merge', destructive: true });
        if (!proceed) return;
      }
      
      // Validate pull entries have minimum required fields
      const MIN_VALID_DATE = new Date('2024-05-01T00:00:00').getTime(); // P7-FIX: Explicit time avoids UTC midnight shift (7F) // WuWa launch window
      const MAX_VALID_DATE = Date.now() + 365 * 86400000; // FIX #3: 1 year ahead (handles wrong device clocks)
      const validPulls = pulls.filter(p => {
        if (typeof p !== 'object' || p === null) return false;
        const hasType = p.bannerType ?? p.cardPoolType ?? p.gachaType;
        const hasName = p.name || p.resourceName;
        // Validate name is a non-empty string
        const nameVal = (p.name || p.resourceName || '');
        if (typeof nameVal !== 'string' || !nameVal.trim()) return false;
        // Validate rarity is a number between 1-5 (if present)
        const rawRarity = p.rarity ?? p.qualityLevel;
        if (rawRarity !== undefined && rawRarity !== null) {
          const r = parseInt(rawRarity, 10);
          if (isNaN(r) || r < 1 || r > 5) return false;
        }
        // Validate timestamp if present
        const ts = p.timestamp || p.time;
        if (ts) {
          const d = new Date(ts).getTime();
          if (isNaN(d) || d < MIN_VALID_DATE || d > MAX_VALID_DATE) return false;
        }
        return hasType && hasName;
      });

      const skippedCount = pulls.length - validPulls.length;

      if (validPulls.length === 0) {
        throw new Error('No valid Convene entries found. Check data format.');
      }
      
      // Auto-save pre-import backup (mirrors restore flow) so users can recover if import corrupts data
      try {
        const preImportBackup = JSON.stringify({ timestamp: new Date().toISOString(), version: APP_VERSION, state: stateRef.current, _preImport: true });
        localStorage.setItem('whispering-wishes-pre-import-backup', preImportBackup);
      } catch {} // best-effort - don't block import if backup fails

      // Detect numbering: Kuro API (from our direct fetch) swaps 1↔3 and 2↔4 vs WuWaTracker export
      // API:         1=FeatRes, 2=FeatWeap, 3=PermRes,  4=PermWeap,  5/6/7=Beginner
      // WuWaTracker: 1=PermRes, 2=PermWeap, 3=FeatRes,  4=FeatWeap,  5/6/7=Beginner
      const isApiNumbering = isApiSource;
      const FEAT_RES  = isApiNumbering ? 1 : 3;
      const FEAT_WEAP = isApiNumbering ? 2 : 4;
      const PERM_RES  = isApiNumbering ? 3 : 1;
      const PERM_WEAP = isApiNumbering ? 4 : 2;

      const convert = (arr, type) => {
        const filtered = arr.filter(p => {
          if (p.bannerType) {
            if (type === 'featured') return p.bannerType === 'featured' || p.bannerType === 'character';
            if (type === 'weapon') return p.bannerType === 'weapon';
            if (type === 'standardChar') return p.bannerType === 'standard-char';
            if (type === 'standardWeap') return p.bannerType === 'standard-weapon';
            if (type === 'beginner') return p.bannerType === 'beginner';
            return false;
          }
          const pt = p.cardPoolType ?? p.gachaType;
          if (type === 'featured') return pt === FEAT_RES;
          if (type === 'weapon') return pt === FEAT_WEAP;
          if (type === 'standardChar') return pt === PERM_RES;
          if (type === 'standardWeap') return pt === PERM_WEAP;
          if (type === 'beginner') return pt === 5 || pt === 6 || pt === 7 || pt === 8;
          return false;
        });
        
        filtered.sort((a, b) => new Date(a.time || a.timestamp) - new Date(b.time || b.timestamp));
        
        let pityCounter = 0;
        let lastWasLost = false;
        
        return filtered.map((p, i) => {
          pityCounter++;
          const rawRarity = parseInt(p.rarity ?? p.qualityLevel, 10);
          const rarity = (rawRarity >= 1 && rawRarity <= 5) ? rawRarity : 4; // validate range (1-5★)
          const rawName = (p.name || p.resourceName || '').trim();
          const name = IMPORT_NAME_ALIASES[rawName] || rawName;

          let won5050 = undefined;
          let pity = Math.min(pityCounter, HARD_PITY); // clamp to valid range
          
          if (rarity === 5) {
            if (type === 'featured') {
              const isStandard = STANDARD_5STAR_CHARACTERS.has(name);
              if (lastWasLost) {
                won5050 = null;
                lastWasLost = false;
              } else {
                won5050 = !isStandard;
                lastWasLost = isStandard;
              }
            } else if (type === 'weapon') {
              // Weapon Event Convene has NO 50/50 - every 5★ is always the featured weapon.
              // won5050 is always null (not applicable) for weapon event banners.
              won5050 = null;
            }
            pityCounter = 0;
          }
          
          // Ensure timestamp is always a valid ISO string in UTC
          // API returns "2026-02-07 04:40:02" (no timezone) — treat as UTC
          // WuWaTracker returns "2026-02-07T03:40:02+00:00" (explicit UTC)
          let rawTs = p.timestamp || p.time || '';
          // Normalize API format: "YYYY-MM-DD HH:mm:ss" → append Z for UTC
          if (rawTs && !rawTs.includes('T') && !rawTs.includes('+') && !rawTs.includes('Z')) {
            rawTs = rawTs.replace(' ', 'T') + 'Z';
          }
          const tsMs = rawTs ? new Date(rawTs).getTime() : NaN;
          const safeTimestamp = isNaN(tsMs) ? new Date().toISOString() : new Date(tsMs).toISOString();

          return {
            id: p.id || (p.resourceId && p.time ? `${p.resourceId}_${new Date(p.time).getTime()}` : `imp_${generateUniqueId()}_${i}`),
            name,
            rarity,
            pity: rarity === 5 ? pity : 0,
            won5050,
            timestamp: safeTimestamp,
            resourceType: p.resourceType || p.type || null
          };
        });
      };
      
      let totalImported = 0;
      ['featured', 'weapon', 'standardChar', 'standardWeap', 'beginner'].forEach(type => {
        const history = convert(pulls, type);
        if (history.length) {
          let currentPity5 = 0;
          for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].rarity === 5) break;
            currentPity5++;
          }
          let currentPity4 = 0;
          for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].rarity >= 4) break;
            currentPity4++;
          }
          const fiveStars = history.filter(p => p.rarity === 5);
          const lastFive = fiveStars[fiveStars.length - 1];
          // Weapon Event Convene has no 50/50 - guaranteed is only relevant for character banners
          const guaranteed = type === 'featured' && lastFive?.won5050 === false;
          // 4-star guarantee: check if last 4-star from the CURRENT banner phase was off-banner
          // Only look at pulls after the current banner's start date to avoid false positives
          // from previous phases that had different featured 4-stars
          let guaranteed4Star = false;
          if (type === 'featured' || type === 'weapon') {
            const bannerStart = activeBanners.startDate ? new Date(activeBanners.startDate).getTime() : 0;
            const currentPhaseFourStars = history.filter(p => p.rarity === 4 && new Date(p.timestamp).getTime() >= bannerStart);
            const lastFour = currentPhaseFourStars[currentPhaseFourStars.length - 1];
            if (lastFour) {
              const featured4Names = type === 'featured'
                ? (activeBanners.characters || []).flatMap(c => c.featured4Stars || [])
                : (activeBanners.weapons || []).flatMap(w => w.featured4Stars || []);
              if (featured4Names.length > 0) {
                guaranteed4Star = !featured4Names.includes(lastFour.name);
              }
            }
          }
          dispatch({ type: 'IMPORT_HISTORY', bannerType: type, history, pity5: currentPity5, pity4: currentPity4, guaranteed, guaranteed4Star, uid: data.uid || data.playerId });
          totalImported += history.length;
        }
      });
      
      const fc = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === FEAT_RES).length;
      const wc = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === FEAT_WEAP).length;
      const sc = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === PERM_RES).length;
      const sw = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === PERM_WEAP).length;
      const bc = pulls.filter(p => [5, 6, 7, 8].includes(p.cardPoolType ?? p.gachaType)).length;
      const parts = [];
      if (fc) parts.push(`${fc} char`);
      if (wc) parts.push(`${wc} weap`);
      if (sc + sw) parts.push(`${sc + sw} std`);
      if (bc) parts.push(`${bc} beg`);
      
      const skippedNote = skippedCount > 0 ? ` (${skippedCount} invalid entries skipped)` : '';
      toast?.addToast?.(`Imported ${totalImported} Convenes! (${parts.join(', ')})${skippedNote}`, 'success');
      
      // P12-FIX: Check storage capacity after import (Step 14 audit - LOW-10a)
      if (storageAvailable) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY) || '';
          const currentSize = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(stored).length : stored.length * 2;
          if (currentSize > STORAGE_WARNING_THRESHOLD) {
            toast?.addToast?.(`Storage at ${(currentSize / 1024 / 1024).toFixed(1)}MB of ~5MB. Consider exporting a backup.`, 'warning');
          }
        } catch {}
      }
      
      return true;
    } catch (err) {
      // F4-01: Show user-friendly message; hide raw JS errors (TypeError, ReferenceError)
      const isUserError = err instanceof SyntaxError || err.message?.startsWith?.('Import') || err.message?.startsWith?.('Invalid') || err.message?.startsWith?.('No ');
      const msg = isUserError ? err.message : 'Could not process this file. Please check the format and try again.';
      toast?.addToast?.('Import failed: ' + msg, 'error');
      return false;
    } finally {
      importInFlightRef.current = false;
    }
  }, [toast, dispatch, IMPORT_NAME_ALIASES, activeBanners, confirm]);

  // Export data - includes main state + auxiliary localStorage settings for full round-trip
  const handleExport = useCallback(() => {
    const aux = {};
    // Use live state for visualSettings (avoids 300ms debounce stale read from localStorage)
    if (visualSettings) aux.visualSettings = visualSettings;
    try { const v = localStorage.getItem(IMAGE_FRAMING_KEY); if (v) aux.imageFraming = JSON.parse(v); } catch {}
    if (Object.keys(customCollectionImages).length > 0) aux.collectionImages = customCollectionImages;
    if (Object.keys(trophyOverrides).length > 0) aux.trophyOverrides = trophyOverrides;
    try { const v = localStorage.getItem('ww-team-equipment'); if (v) aux.teamEquipment = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem('ww-calendar-notes'); if (v) aux.calendarNotes = JSON.parse(v); } catch {}
    const data = { timestamp: new Date().toISOString(), version: APP_VERSION, state, ...(Object.keys(aux).length > 0 ? { aux } : {}) };
    const jsonStr = JSON.stringify(data, null, 2);
    setExportData(jsonStr);
    setShowExportModal(true);
  }, [state, visualSettings, customCollectionImages, trophyOverrides]);

  // Handle onboarding complete
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    dispatch({ type: 'SET_SETTINGS', field: 'showOnboarding', value: false });
  }, []);

  const {
    activeTheme, themeAccent,
    headerBgUrl, headerBgPos, navBgUrl, navBgPos, appBgUrl, appBgPos,
  } = useThemeAccent(visualSettings);

  const headerControlBg = { backgroundColor: 'rgba(15, 20, 28, 0.9)' };

  // ── CloudStorageProvider callbacks ──────────────────────────────────────
  const getBackupPayload = useCallback(() => {
    const s = stateRef.current;
    const aux = {};
    try { const v = localStorage.getItem(VISUAL_SETTINGS_KEY); if (v) aux.visualSettings = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem(IMAGE_FRAMING_KEY); if (v) aux.imageFraming = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem(COLLECTION_IMAGES_KEY); if (v) aux.collectionImages = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem(TROPHY_OVERRIDES_KEY); if (v) aux.trophyOverrides = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem('ww-team-equipment'); if (v) aux.teamEquipment = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem('ww-calendar-notes'); if (v) aux.calendarNotes = JSON.parse(v); } catch {}
    return {
      state: s,
      profile: s.profile,
      ...(Object.keys(aux).length > 0 ? { aux } : {}),
      timestamp: Date.now(),
      version: APP_VERSION,
      pullCount: (s.profile.featured?.history?.length || 0)
        + (s.profile.weapon?.history?.length || 0)
        + (s.profile.standardChar?.history?.length || 0)
        + (s.profile.standardWeap?.history?.length || 0)
        + (s.profile.beginner?.history?.length || 0),
    };
  }, []);

  const handleRestoreData = useCallback((data) => {
    // F-007: Sanitize cloud-restored data to prevent state injection
    if (data.state && typeof data.state === 'object') {
      dispatch({ type: 'LOAD_STATE', state: sanitizeStateObj(data.state) });
    } else {
      dispatch({ type: 'LOAD_STATE', state: { ...stateRef.current, profile: sanitizeStateObj(data.profile) } });
    }
    // Restore auxiliary data if present
    if (data.aux && typeof data.aux === 'object') {
      try {
        if (data.aux.visualSettings && typeof data.aux.visualSettings === 'object') {
          localStorage.setItem(VISUAL_SETTINGS_KEY, JSON.stringify(sanitizeStateObj(data.aux.visualSettings)));
          setVisualSettings(prev => ({ ...prev, ...sanitizeStateObj(data.aux.visualSettings) }));
        }
        if (data.aux.imageFraming && typeof data.aux.imageFraming === 'object') {
          localStorage.setItem(IMAGE_FRAMING_KEY, JSON.stringify(sanitizeStateObj(data.aux.imageFraming)));
          setImageFraming(sanitizeStateObj(data.aux.imageFraming));
        }
        if (data.aux.collectionImages && typeof data.aux.collectionImages === 'object') {
          localStorage.setItem(COLLECTION_IMAGES_KEY, JSON.stringify(sanitizeStateObj(data.aux.collectionImages)));
          setCustomCollectionImages(sanitizeStateObj(data.aux.collectionImages));
        }
        if (data.aux.trophyOverrides && typeof data.aux.trophyOverrides === 'object') {
          localStorage.setItem(TROPHY_OVERRIDES_KEY, JSON.stringify(sanitizeStateObj(data.aux.trophyOverrides)));
          setTrophyOverrides(sanitizeStateObj(data.aux.trophyOverrides));
        }
        if (data.aux.teamEquipment && typeof data.aux.teamEquipment === 'object') {
          localStorage.setItem('ww-team-equipment', JSON.stringify(sanitizeStateObj(data.aux.teamEquipment)));
        }
        if (data.aux.calendarNotes && typeof data.aux.calendarNotes === 'object') {
          localStorage.setItem('ww-calendar-notes', JSON.stringify(sanitizeStateObj(data.aux.calendarNotes)));
        }
      } catch {}
    }
  }, [dispatch, setImageFraming]);

  return (
    <CloudStorageProvider getBackupPayload={getBackupPayload} onRestoreData={handleRestoreData}>
    <div className={`desktop-layout min-h-screen ${visualSettings.oledMode ? 'oled-mode' : ''} ${visualSettings.animationsEnabled === 'off' ? 'no-animations' : ''} ${visualSettings.animationsEnabled === 'full' ? 'animations-full' : ''}`}>
      {visualSettings.bgStyle === 'resonance' ? (
        <ResonanceField oledMode={visualSettings.oledMode} animationsEnabled={visualSettings.animationsEnabled} bgResolution={visualSettings.bgResolution} bgFps={visualSettings.bgFps} />
      ) : visualSettings.bgStyle === 'honour' ? (
        <Honour oledMode={visualSettings.oledMode} animationsEnabled={visualSettings.animationsEnabled} bgResolution={visualSettings.bgResolution} bgFps={visualSettings.bgFps} />
      ) : visualSettings.bgStyle === 'reflect' ? (
        <>
          <BackgroundGlow oledMode={visualSettings.oledMode} animationsEnabled={visualSettings.animationsEnabled} bgResolution={visualSettings.bgResolution} bgFps={visualSettings.bgFps} />
          <TriangleMirrorWave oledMode={visualSettings.oledMode} animationsEnabled={visualSettings.animationsEnabled} bgResolution={visualSettings.bgResolution} bgFps={visualSettings.bgFps} />
        </>
      ) : null}
      {appBgUrl && (
        <div className={`fixed inset-0 ${bgFramingMode ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`} style={{ zIndex: 3 }} aria-hidden={!bgFramingMode} onClick={bgFramingMode ? () => setEditingBgTarget('bg') : undefined}>
          <img src={appBgUrl} alt="" className="w-full h-full object-cover" style={{ opacity: bgFramingMode ? 0.6 : 0.35, objectPosition: appBgPos }} />
          {bgFramingMode && (
            <div className={`absolute inset-0 ${editingBgTarget === 'bg' ? 'ring-4 ring-inset ring-cyan-400' : ''}`}>
              <span className="absolute top-16 left-3 text-xs bg-black/70 text-cyan-400 px-1.5 py-0.5 rounded">{editingBgTarget === 'bg' ? '● BACKGROUND' : 'Background'}</span>
            </div>
          )}
        </div>
      )}
      {/* KuroStyles removed — CSS loaded via <link> in index.html, OLED via .oled-mode class */}

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      
      {/* P12-FIX: Skip to content link for keyboard users (Step 11 audit - MEDIUM-6n) */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-yellow-500 focus:text-black focus:rounded-lg focus:font-bold focus:text-md">
        Skip to content
      </a>
      
      {/* Offline banner handled by PWAProvider */}

      {/* Header */}
      <header className="kuro-card sticky top-0 z-50" style={{borderRadius: 0, paddingTop: 'env(safe-area-inset-top, 0px)', overflow: 'hidden', ...(activeTheme ? { borderColor: `${themeAccent}30` } : {})}}>
        {/* Theme banner art background */}
        {headerBgUrl && (
          <>
            <img src={headerBgUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.8, pointerEvents: 'none', objectPosition: headerBgPos }} loading="eager" />
            {!bgFramingMode && <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${themeAccent || 'rgba(237,175,24,0.08)'}${themeAccent ? '15' : ''} 0%, rgba(8,12,20,0.6) 60%, rgba(8,12,20,0.9) 100%)`, pointerEvents: 'none' }} aria-hidden="true" />}
          </>
        )}
        {bgFramingMode && headerBgUrl && (
          <div className={`absolute inset-0 z-20 cursor-pointer ${editingBgTarget === 'header' ? 'ring-2 ring-inset ring-cyan-400' : ''}`} onClick={() => setEditingBgTarget('header')}>
            <span className="absolute top-1 left-1 text-xs bg-black/70 text-cyan-400 px-1.5 py-0.5 rounded">{editingBgTarget === 'header' ? '● HEADER' : 'Header'}</span>
          </div>
        )}
        <div className="header-inner max-w-lg md:max-w-2xl lg:max-w-none mx-auto px-3 relative z-10">
          <div className="header-top flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <div className="relative group cursor-pointer" onClick={async () => {
                if (pwa?.canInstall) {
                  const accepted = await pwa.promptInstall();
                  if (accepted) toast?.addToast?.('App installed successfully!', 'success');
                } else if (pwa?.isInstalled) {
                  toast?.addToast?.('App is already installed', 'success');
                } else {
                  pwa?.showInstallGuide?.();
                }
              }} title={pwa?.canInstall ? 'Install App' : pwa?.isInstalled ? 'App installed' : 'Add to home screen'}>
                <div className="relative w-[44px] h-[44px] flex items-center justify-center rounded-lg overflow-hidden group-hover:scale-[1.02] transition-transform" style={activeTheme ? { background: 'rgba(15,20,28,0.3)', borderRadius: 'var(--radius-lg)' } : { ...headerControlBg, border: `1px solid var(--border-medium)`, borderRadius: 'var(--radius-md)' }}>
                  <img src={HEADER_ICON} alt="Whispering Wishes logo" style={{ width: 80, height: 80, transform: 'scale(1.0)' }} className="object-cover" />
                </div>
                {visualSettings.animationsEnabled !== 'off' && (
                  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    {[0, 1, 2, 3].map(i => (
                      <span key={i} className="header-star" style={{
                        position: 'absolute',
                        left: '50%', top: '50%',
                        width: 4, height: 4,
                        background: activeTheme ? themeAccent : '#facc15',
                        clipPath: 'polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)',
                        animation: `header-star-emanate 2.5s ease-out ${i * 0.6}s infinite`,
                        opacity: 0,
                      }} />
                    ))}
                  </div>
                )}
                {pwa?.canInstall && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-md" style={{ background: themeAccent || '#eab308' }} aria-hidden="true">
                    <Download size={9} className="text-black" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center min-h-[44px]" style={activeTheme ? { background: 'rgba(15,20,28,0.3)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-base) var(--space-md)' } : undefined}>
                <h1 className="text-white font-semibold text-md tracking-wide leading-tight">Whispering Wishes</h1>
                <p className="text-sm tracking-wider uppercase leading-tight" style={{ color: activeTheme ? themeAccent : 'rgba(250,204,21,0.5)' }}>Wuthering Waves - Companion</p>
              </div>
            </div>
            <div className="header-controls flex items-center gap-2">
              <button onClick={() => setShowServerDropdown(true)} aria-label="Select server region" className="text-gray-300 text-sm px-2 py-1.5 rounded-lg focus:outline-none transition-all min-h-[44px] flex items-center gap-1.5" style={activeTheme ? { background: 'rgba(15,20,28,0.3)', borderRadius: 'var(--radius-lg)' } : { ...headerControlBg, border: `1px solid var(--border-medium)`, borderRadius: 'var(--radius-md)' }}>
                {state.server} <ChevronDown size={10} />
              </button>
              <button onClick={handleExport} aria-label="Export backup" title="Export backup" className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-400 active:scale-95 transition-all" style={activeTheme ? { background: 'rgba(15,20,28,0.3)', borderRadius: 'var(--radius-lg)' } : { ...headerControlBg, border: `1px solid var(--border-medium)`, borderRadius: 'var(--radius-md)' }}>
                <Download size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating bottom navigation bar */}
      <nav ref={tabNavRef} className="kuro-card fixed bottom-3 left-3 right-3 z-50 flex items-center justify-evenly overflow-x-auto scrollbar-hide" style={{ position: 'fixed', zIndex: 50, marginBottom: 'env(safe-area-inset-bottom, 0px)', overflow: 'hidden', ...(activeTheme ? { borderColor: `${themeAccent}30` } : {}) }} role="tablist" aria-label="Main navigation" onKeyDown={(e) => {
          const tabs = ['tracker','events','planner','calculator','analytics','teams','gathering','profile'];
          const idx = tabs.indexOf(activeTab);
          let newTab;
          if (e.key === 'ArrowRight') { e.preventDefault(); newTab = tabs[(idx + 1) % tabs.length]; }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); newTab = tabs[(idx - 1 + tabs.length) % tabs.length]; }
          if (newTab) { setActiveTab(newTab); setTimeout(() => document.getElementById(`tab-${newTab}`)?.focus(), 0); }
        }}>
        {navBgUrl && (
          <>
            <img src={navBgUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.5, pointerEvents: 'none', objectPosition: navBgPos }} />
            {!bgFramingMode && <div className="absolute inset-0" style={{ background: `linear-gradient(to right, rgba(8,12,20,0.85), ${themeAccent || 'rgba(237,175,24,0.08)'}${themeAccent ? '15' : ''}, rgba(8,12,20,0.85))`, pointerEvents: 'none' }} aria-hidden="true" />}
          </>
        )}
        {bgFramingMode && navBgUrl && (
          <div className={`absolute inset-0 z-20 cursor-pointer ${editingBgTarget === 'nav' ? 'ring-2 ring-inset ring-cyan-400' : ''}`} onClick={() => setEditingBgTarget('nav')}>
            <span className="absolute top-1 left-1 text-xs bg-black/70 text-cyan-400 px-1.5 py-0.5 rounded">{editingBgTarget === 'nav' ? '● NAV' : 'Nav'}</span>
          </div>
        )}
        <div className="tab-indicator" />
        <TabButton active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')} tabRef={tabNavRef} tabId="tracker" accentColor={themeAccent}><Sparkles size={18} /> Tracker</TabButton>
        <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} tabRef={tabNavRef} tabId="events" accentColor={themeAccent}><Calendar size={18} /> Events</TabButton>
        <TabButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} tabRef={tabNavRef} tabId="planner" accentColor={themeAccent}><TrendingUp size={18} /> Plan</TabButton>
        <TabButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} tabRef={tabNavRef} tabId="calculator" accentColor={themeAccent}><Calculator size={18} /> Calc</TabButton>
        <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} tabRef={tabNavRef} tabId="analytics" accentColor={themeAccent}><BarChart3 size={18} /> Stats</TabButton>
        <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} tabRef={tabNavRef} tabId="teams" accentColor={themeAccent}><Users size={18} /> Teams</TabButton>
        <TabButton active={activeTab === 'gathering'} onClick={() => setActiveTab('gathering')} tabRef={tabNavRef} tabId="gathering" accentColor={themeAccent}><Archive size={18} /> Collection</TabButton>
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} tabRef={tabNavRef} tabId="profile" accentColor={themeAccent}><User size={18} /> Profile</TabButton>
      </nav>

      <main id="main-content" className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-3 pt-3 space-y-3 w-full" style={{ paddingBottom: navPadding }} role="main">
        {/* Screen reader announcement for tab changes */}
        <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab active
        </div>
        
        {/* [SECTION:TAB-TRACKER] */}
        {activeTab === 'tracker' && !bgFramingMode && (
          <TabErrorBoundary tabName="Tracker">
              <TrackerTab
                state={state}
                dispatch={dispatch}
                activeBanners={activeBanners}
                visualSettings={visualSettings}
                themeAccent={themeAccent}
                collectionImages={collectionImages}
                bannerEndDate={bannerEndDate}
                toast={toast}
                confirm={confirm}
                setActiveTab={setActiveTab}
              />

          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-EVENTS] */}
        {activeTab === 'events' && !bgFramingMode && (
          <TabErrorBoundary tabName="Events">
              <EventsTab
                state={state}
                dispatch={dispatch}
                activeBanners={activeBanners}
                setActiveBanners={setActiveBanners}
                visualSettings={visualSettings}
                toast={toast}
              />

          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-CALC] */}
        {activeTab === 'calculator' && !bgFramingMode && (
          <TabErrorBoundary tabName="Calculator">
              <CalculatorTab state={state} dispatch={dispatch} />

          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-PLANNER] */}
        {activeTab === 'planner' && !bgFramingMode && (
          <TabErrorBoundary tabName="Planner">
              <PlannerTab
                state={state}
                dispatch={dispatch}
                activeBanners={activeBanners}
                bannerEndDate={bannerEndDate}
                toast={toast}
                confirm={confirm}
              />

          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-STATS] */}
        {activeTab === 'analytics' && !bgFramingMode && (
          <TabErrorBoundary tabName="Analytics">
              <AnalyticsTab
                state={state}
                dispatch={dispatch}
                setActiveTab={setActiveTab}
                overallStats={overallStats}
                luckRating={luckRating}
                trophies={trophies}
                collectionImages={collectionImages}
                toast={toast}
                hashUidForStorage={hashUidForStorage}
                checkFirebaseRateLimit={checkFirebaseRateLimit}
              />

          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-COLLECT] */}
        {activeTab === 'gathering' && !bgFramingMode && (
          <TabErrorBoundary tabName="Collection">
              <CollectionTab
                state={state}
                collectionData={collectionData}
                collectionImages={collectionImages}
                visualSettings={visualSettings}
                setActiveTab={setActiveTab}
                setDetailModal={setDetailModal}
                activeBanners={activeBanners}
                withCacheBuster={withCacheBuster}
                refreshImages={refreshImages}
                handleSetProfilePic={handleSetProfilePic}
              />

          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-TEAMS] */}
        {activeTab === 'teams' && !bgFramingMode && (
          <TabErrorBoundary tabName="Teams">
              <TeamsTab
                state={state}
                dispatch={dispatch}
                collectionImages={collectionImages}
                collectionData={collectionData}
                toast={toast}
                confirm={confirm}
              />

          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-PROFILE] */}
        {(activeTab === 'profile' || bgFramingMode) && (
          <TabErrorBoundary tabName="Profile">
              <ProfileTab
            state={state}
            dispatch={dispatch}
            visualSettings={visualSettings}
            saveVisualSettings={saveVisualSettings}
            toast={toast}
            confirm={confirm}
            pwa={pwa}
            collectionImages={collectionImages}
            customCollectionImages={customCollectionImages}
            saveCollectionImages={saveCollectionImages}
            detailModal={detailModal}
            handleExport={handleExport}
            processImportData={processImportData}
            activeBanners={activeBanners}
            setActiveBanners={setActiveBanners}
            overallStats={overallStats}
            luckRating={luckRating}
            ownedCharNames={ownedCharNames}
            trophies={trophies}
            trophyOverrides={trophyOverrides}
            setTrophyOverrides={setTrophyOverrides}
            DEFAULT_VISUAL_SETTINGS={DEFAULT_VISUAL_SETTINGS}
            setActiveTab={setActiveTab}
            withCacheBuster={withCacheBuster}
            showAdminPanel={showAdminPanel}
            setShowAdminPanel={setShowAdminPanel}
            adminMiniMode={adminMiniMode}
            setAdminMiniMode={setAdminMiniMode}
            bgFramingMode={bgFramingMode}
            setBgFramingMode={setBgFramingMode}
            editingBgTarget={editingBgTarget}
            setEditingBgTarget={setEditingBgTarget}
            updateBgPosition={updateBgPosition}
            getBgPositionLabel={getBgPositionLabel}
            exportBgPositions={exportBgPositions}
            getCustomBgPosition={getCustomBgPosition}
          />

          </TabErrorBoundary>
        )}

      </main>

      {/* Server Selector Modal */}
      <FocusTrapModal isOpen={showServerDropdown} onClose={() => setShowServerDropdown(false)} className="" onClick={() => setShowServerDropdown(false)} ariaLabel="Select server region" centered>
          <div className="kuro-card w-full max-w-[200px] rounded-2xl py-2" style={{ overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-base px-4 py-2.5 border-b border-[var(--border-medium)]">Server Region</h3>
            {Object.keys(SERVERS).map(s => (
              <button key={s} onClick={() => { dispatch({ type: 'SET_SERVER', server: s }); setShowServerDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-base transition-colors ${s === state.server ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
      </FocusTrapModal>

      {/* Export Modal */}
      <FocusTrapModal isOpen={showExportModal} onClose={() => { setRestoreText(''); setShowExportModal(false); }} className="" onClick={() => { setRestoreText(''); setShowExportModal(false); }} ariaLabel="Backup and restore" centered>
          <div className="kuro-card w-full sm:max-w-sm rounded-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col" style={{ overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)] flex-shrink-0" data-sheet-header>
              <div className="flex items-center gap-2">
                <Download size={14} className="text-yellow-400" />
                <span className="text-white text-md font-semibold">Backup</span>
              </div>
              <button onClick={() => { setRestoreText(''); setShowExportModal(false); }} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all" aria-label="Close export modal"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              <p className="text-gray-400 text-sm">Copy this data and save it as a .json file:</p>
              <textarea
                value={exportData}
                readOnly
                className="kuro-input w-full h-24 text-sm font-mono"
                onClick={e => e.target.select()}
                aria-label="Export backup data"
              />
              <button 
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(exportData);
                    toast?.addToast?.('Copied to clipboard!', 'success');
                  } catch {
                    // P6-FIX: Fallback uses Blob + clipboard API instead of deprecated execCommand (HIGH-17)
                    try {
                      const blob = new Blob([exportData], { type: 'text/plain' });
                      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
                      toast?.addToast?.('Copied to clipboard!', 'success');
                    } catch {
                      toast?.addToast?.('Copy failed - please select and copy manually', 'error');
                    }
                  }
                }} 
                className="kuro-btn w-full"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => {
                  try {
                    const blob = new Blob([exportData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `whispering-wishes-backup-${new Date().toISOString().slice(0,10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                    toast?.addToast?.('Backup downloaded!', 'success');
                  } catch {
                    toast?.addToast?.('Download failed', 'error');
                  }
                }}
                className="kuro-btn w-full flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download .json
              </button>

              <div className="relative my-1">
                <div className="kuro-divider" />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 px-2 text-sm text-gray-400 uppercase tracking-wider">Restore</span>
              </div>
              
              <p className="text-gray-400 text-sm">Paste backup data to restore:</p>
              <textarea
                value={restoreText}
                onChange={(e) => setRestoreText(e.target.value)}
                placeholder="Paste backup JSON here…"
                className="kuro-input w-full h-20 text-sm font-mono"
                aria-label="Paste backup data to restore"
              />
              <button
                onClick={async () => {
                  if (!restoreText.trim()) {
                    toast?.addToast?.('Please paste backup data first', 'error');
                    return;
                  }
                  // P9-FIX: Size limit check for pasted backup data (Step 4 audit)
                  if (restoreText.length > MAX_IMPORT_SIZE_MB * 1024 * 1024) {
                    toast?.addToast?.(`Backup data too large (${(restoreText.length / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_IMPORT_SIZE_MB}MB.`, 'error');
                    return;
                  }
                  try {
                    const data = JSON.parse(restoreText);
                    if (!data || typeof data !== 'object' || !data.state || typeof data.state !== 'object') {
                      toast?.addToast?.('Invalid backup format - missing required "state" object', 'error');
                      return;
                    }
                    
                    // Schema validation: check critical fields exist and have correct types
                    const s = data.state;
                    if (s.profile && typeof s.profile !== 'object') {
                      toast?.addToast?.('Invalid backup -"profile" must be an object', 'error');
                      return;
                    }
                    if (s.calc && typeof s.calc !== 'object') {
                      toast?.addToast?.('Invalid backup -"calc" must be an object', 'error');
                      return;
                    }
                    if (s.bookmarks && !Array.isArray(s.bookmarks)) {
                      toast?.addToast?.('Invalid backup -"bookmarks" must be an array', 'error');
                      return;
                    }
                    if (s.profile?.featured?.history && !Array.isArray(s.profile.featured.history)) {
                      toast?.addToast?.('Invalid backup - Convene history must be an array', 'error');
                      return;
                    }
                    
                    // Version check warning
                    const backupVersion = data.version || 'unknown';
                    const pullCount = (s.profile?.featured?.history?.length || 0) + (s.profile?.weapon?.history?.length || 0) + (s.profile?.standardChar?.history?.length || 0) + (s.profile?.standardWeap?.history?.length || 0);
                    
                    // Auto-save pre-restore backup to localStorage for recovery
                    try {
                      const preRestoreBackup = JSON.stringify({ timestamp: new Date().toISOString(), version: APP_VERSION, state: stateRef.current, _preRestore: true });
                      localStorage.setItem('whispering-wishes-pre-restore-backup', preRestoreBackup);
                    } catch {} // best-effort - don't block restore if backup fails

                    // Confirmation dialog
                    const confirmed = await confirm({
                      title: `Restore backup (v${backupVersion})`,
                      message: `This will REPLACE all current data:\n• ${pullCount} total Convenes\n• ${s.bookmarks?.length || 0} bookmarks\n• All calculator & planner settings`,
                      confirmLabel: 'Restore',
                      destructive: true,
                    });
                    if (!confirmed) return;
                    
                    // P10-FIX: Sanitize all nested objects to prevent prototype pollution (matches loadFromStorage pattern)
                    const safeParsed = sanitizeStateObj(s);
                    const restoredState = {
                      ...initialState,
                      ...sanitizeImportedState(safeParsed),
                      server: safeParsed.server || initialState.server,
                      profile: {
                        ...initialState.profile,
                        ...(safeParsed.profile ? sanitizeStateObj(safeParsed.profile) : {}),
                        featured: { ...initialState.profile.featured, ...(safeParsed.profile?.featured ? sanitizeStateObj(safeParsed.profile.featured) : {}) },
                        weapon: { ...initialState.profile.weapon, ...(safeParsed.profile?.weapon ? sanitizeStateObj(safeParsed.profile.weapon) : {}) },
                        standardChar: { ...initialState.profile.standardChar, ...(safeParsed.profile?.standardChar ? sanitizeStateObj(safeParsed.profile.standardChar) : {}) },
                        standardWeap: { ...initialState.profile.standardWeap, ...(safeParsed.profile?.standardWeap ? sanitizeStateObj(safeParsed.profile.standardWeap) : {}) },
                        beginner: { ...initialState.profile.beginner, ...(safeParsed.profile?.beginner ? sanitizeStateObj(safeParsed.profile.beginner) : {}) },
                      },
                      calc: { ...initialState.calc, ...safeParsed.calc },
                      planner: { ...initialState.planner, ...safeParsed.planner },
                      settings: { ...initialState.settings, ...safeParsed.settings },
                      bookmarks: Array.isArray(safeParsed.bookmarks) ? safeParsed.bookmarks : [],
                    };
                    dispatch({ type: 'LOAD_STATE', state: restoredState });
                    // Restore auxiliary localStorage data if present in backup
                    if (data.aux && typeof data.aux === 'object') {
                      try {
                        if (data.aux.visualSettings && typeof data.aux.visualSettings === 'object') {
                          localStorage.setItem(VISUAL_SETTINGS_KEY, JSON.stringify(sanitizeStateObj(data.aux.visualSettings)));
                          setVisualSettings(prev => {
                const merged = { ...prev, ...sanitizeStateObj(data.aux.visualSettings) };
                if (typeof merged.collectionZoom === 'number') merged.collectionZoom = Math.min(300, Math.max(100, merged.collectionZoom));
                return merged;
              });
                        }
                        if (data.aux.imageFraming && typeof data.aux.imageFraming === 'object') {
                          localStorage.setItem(IMAGE_FRAMING_KEY, JSON.stringify(sanitizeStateObj(data.aux.imageFraming)));
                          setImageFraming(sanitizeStateObj(data.aux.imageFraming));
                        }
                        if (data.aux.collectionImages && typeof data.aux.collectionImages === 'object') {
                          localStorage.setItem(COLLECTION_IMAGES_KEY, JSON.stringify(sanitizeStateObj(data.aux.collectionImages)));
                          setCustomCollectionImages(sanitizeStateObj(data.aux.collectionImages));
                        }
                        if (data.aux.trophyOverrides && typeof data.aux.trophyOverrides === 'object') {
                          localStorage.setItem(TROPHY_OVERRIDES_KEY, JSON.stringify(sanitizeStateObj(data.aux.trophyOverrides)));
                          setTrophyOverrides(sanitizeStateObj(data.aux.trophyOverrides));
                        }
                        if (data.aux.teamEquipment && typeof data.aux.teamEquipment === 'object') {
                          localStorage.setItem('ww-team-equipment', JSON.stringify(sanitizeStateObj(data.aux.teamEquipment)));
                        }
                        // U6-01: Restore calendar notes from backup
                        if (data.aux.calendarNotes && typeof data.aux.calendarNotes === 'object') {
                          localStorage.setItem('ww-calendar-notes', JSON.stringify(sanitizeStateObj(data.aux.calendarNotes)));
                        }
                      } catch {}
                    }
                    toast?.addToast?.(`Backup restored! (v${backupVersion})`, 'success');
                    setRestoreText('');
                    setShowExportModal(false);
                  } catch (e) {
                    toast?.addToast?.('Invalid JSON data: ' + e.message, 'error');
                  }
                }} 
                disabled={!restoreText.trim()}
                className={`kuro-btn w-full ${restoreText.trim() ? '' : 'opacity-50'}`}
              >
                Restore Backup
              </button>
              {/* P15-FIX: LOW-11 - UI to restore pre-import backup from localStorage */}
              {(() => {
                try { return !!localStorage.getItem('whispering-wishes-pre-import-backup'); } catch { return false; }
              })() && (
                <button
                  onClick={async () => {
                    try {
                      const raw = localStorage.getItem('whispering-wishes-pre-import-backup');
                      if (!raw) { toast?.addToast?.('No pre-import backup found', 'error'); return; }
                      const data = JSON.parse(raw);
                      if (!data?.state || typeof data.state !== 'object') { toast?.addToast?.('Invalid pre-import backup', 'error'); return; }
                      if (!await confirm({ title: 'Restore pre-import backup', message: `Restore backup from ${data.timestamp ? new Date(data.timestamp).toLocaleString('en-US') : 'unknown date'}?\nThis will revert to the state before your last import.`, confirmLabel: 'Restore', destructive: true })) return;
                      dispatch({ type: 'LOAD_STATE', state: data.state });
                      toast?.addToast?.('Pre-import backup restored!', 'success');
                      setShowExportModal(false);
                    } catch (e) { toast?.addToast?.('Failed to restore: ' + e.message, 'error'); }
                  }}
                  className="kuro-btn w-full text-sm mt-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  Restore Pre-Import Backup
                </button>
              )}
            </div>
          </div>
      </FocusTrapModal>



      {/* Character/Weapon Detail Modal */}
      {detailModal.show && detailModal.type === 'character' && (
        <CharacterDetailModal
          name={detailModal.name}
          imageUrl={detailModal.imageUrl}
          framing={detailModal.framing}
          infoFraming={getImageFraming(`info-${detailModal.name}`)}
          onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null, framing: null })}
          onViewInTeams={() => {
            const name = detailModal.name;
            const team = state.teams?.[state.activeTeamIndex] || { slots: [null, null, null] };
            const emptySlot = team.slots.findIndex(s => s == null);
            if (emptySlot !== -1 && !team.slots.includes(name)) {
              dispatch({ type: 'SET_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: emptySlot, character: name });
            }
            setDetailModal({ show: false, type: null, name: null, imageUrl: null, framing: null });
            setActiveTab('teams');
          }}
          collectionData={collectionData}
        />
      )}
      {detailModal.show && detailModal.type === 'weapon' && (
        <WeaponDetailModal
          name={detailModal.name}
          imageUrl={detailModal.imageUrl}
          onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null })}
          collectionData={collectionData}
        />
      )}
      {detailModal.show && detailModal.type === 'echo' && (
        <EchoDetailModal
          name={detailModal.name}
          imageUrl={detailModal.imageUrl}
          cost={detailModal.cost}
          onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null })}
          collectionData={collectionData}
        />
      )}


      {/* Desktop right margin - ad slot + footer text at bottom (hidden on mobile) */}
      <div className="desktop-ad-margin">
        <div className="ad-slot">160×600</div>
        <div className="ad-margin-footer">
          <p className="text-gray-600 text-[8px] leading-relaxed">
            {`v${APP_VERSION}`} • u/WW_Andene<br/>Not affiliated with Kuro Games<br/>
            <a href="mailto:whisperingwishes.app@gmail.com" className="text-gray-600 hover:text-yellow-400 transition-colors">Contact</a>
          </p>
        </div>
      </div>

    </div>
    </CloudStorageProvider>
  );
}

// [SECTION:EXPORT]
export default function WhisperingWishes() {
  return (
    <AppErrorBoundary>
      <PWAProvider>
        <ToastProvider>
          <ConfirmProvider>
            <ImageFramingProvider>
              <WhisperingWishesInner />
            </ImageFramingProvider>
          </ConfirmProvider>
        </ToastProvider>
      </PWAProvider>
    </AppErrorBoundary>
  );
}
