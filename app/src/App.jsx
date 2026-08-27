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
import { Calculator, Download } from 'lucide-react';
// --- data ---
import { ALL_CHARACTERS, STANDARD_5STAR_CHARACTERS, RELEASE_ORDER } from './data/characters.js';
import { ALL_5STAR_WEAPONS, ALL_4STAR_WEAPONS, ALL_3STAR_WEAPONS, ALL_2STAR_WEAPONS, ALL_1STAR_WEAPONS } from './data/weaponLists.js';
import { getCurrentBannerAuto, preloadBannerHistoryArt } from './data/banners.js';
import { APP_VERSION, MAX_IMPORT_SIZE_MB, HEADER_ICON, HARD_PITY, ASTRITE_PER_PULL, BEGINNER_ASTRITE_PER_PULL, SERVERS } from './data/constants.js';
import { generateUniqueId } from './utils/generateId.js';
import { calculateLuckRating } from './shared/utils/luckRating.js';
import { IMPORT_NAME_ALIASES } from './utils/gachaImporter.js';
// --- extracted hooks ---
import { useVisualSettings, DEFAULT_VISUAL_SETTINGS } from './hooks/useVisualSettings.js';
import { useAmbientMusic } from './hooks/useAmbientMusic.js';
import { useBackgroundFraming } from './hooks/useBackgroundFraming.js';
import { useCollectionImages, COLLECTION_IMAGES_KEY } from './hooks/useCollectionImages.js';
import { useTabNavigation } from './hooks/useTabNavigation.js';
import { usePresenceTracking, checkFirebaseRateLimit } from './hooks/usePresenceTracking.js';
import { useThemeAccent } from './hooks/useThemeAccent.js';
// --- core ---
import { UNDOABLE_ACTIONS, createUndoReducer, initialState, reducer } from './core/reducer.js';
import { STORAGE_KEY, storageAvailable, loadFromStorage, saveToStorage, sanitizeStateObj, sanitizeImportedState } from './core/storage.js';
import { getServerAdjustedEnd } from './core/time.js';
import { computeTrophies } from './core/computeTrophies.js';
// --- providers ---
import { PWAProvider, usePWA } from './providers/PWAProvider.jsx';
import { ToastProvider, useToast } from './providers/ToastProvider.jsx';
import { ConfirmProvider, useConfirm } from './providers/ConfirmProvider.jsx';
import { useFocusTrap } from './shared/components/FocusTrapModal.jsx';
import { ServerSelectorModal } from './shared/components/ServerSelectorModal.jsx';
import { ColorblindFilterDefs } from './shared/components/ColorblindFilterDefs.jsx';
import { BackupRestoreModal } from './shared/components/BackupRestoreModal.jsx';
// KuroStyles removed — CSS now loaded via <link> in index.html (src/styles/kuro.css)
// OLED mode overrides handled by .oled-mode class on root div (no JS needed)
import { OnboardingModal } from './shared/components/OnboardingModal.jsx';
import { ImageFramingProvider, useImageFramingContext } from './providers/ImageFramingProvider.jsx';
import { CloudStorageProvider, useCloudStorage } from './providers/CloudStorageProvider.jsx';
// --- shared ---
import AdminMiniPanel from './features/profile/AdminMiniPanel.jsx';
import PaddingDebugOverlay from './shared/components/PaddingDebugOverlay.jsx';
import { DetailModalHost } from './shared/components/DetailModalHost.jsx';
import { TabButton } from './shared/components/Card.jsx';
import { ThemeColor } from './shared/components/ThemeColor.jsx';
import { AppErrorBoundary, TabErrorBoundary } from './shared/errors/ErrorBoundaries.jsx';
import { getActiveBanners } from './shared/components/bannerUtils.js';
// --- Feature tabs ---
// --- Feature tabs (lazy-loaded for code splitting) ---
import { lazy, Suspense } from 'react';
const TrackerTab = lazy(() => import('./features/tracker/TrackerTab.jsx'));
const EventsTab = lazy(() => import('./features/events/EventsTab.jsx'));
const PlannerTab = lazy(() => import('./features/planner/PlannerTab.jsx'));
const AnalyticsTab = lazy(() => import('./features/analytics/AnalyticsTab.jsx'));
const CalculatorTab = lazy(() => import('./features/calculator/CalculatorTab.jsx'));
const CollectionTab = lazy(() => import('./features/collection/CollectionTab.jsx'));
const TeamsTab = lazy(() => import('./features/teams/TeamsTab.jsx'));
const ProfileTab = lazy(() => import('./features/profile/ProfileTab.jsx'));
const MapTab = lazy(() => import('./features/map/MapTab.jsx'));
const TabLoadingFallback = () => <div className="flex items-center justify-center py-20 text-gray-500 text-sm">Loading...</div>;

import { VISUAL_SETTINGS_KEY, IMAGE_FRAMING_KEY, TROPHY_OVERRIDES_KEY } from './shared/constants/appConstants.js';
import { silentCatch } from './utils/silentCatch.js';
import { gatherAuxData, restoreAuxData, getMergedHistories } from './core/storageKeys.js';
import { hashUidForStorage } from './shared/utils/hashUidForStorage.js';
import { t, formatDate, useAppLocale } from './utils/i18n.js';
import { useIsReferenceDevice, useUiScale } from './hooks/useIsReferenceDevice.js';
import { syncHomeScreenWidget, syncBannerWidget } from './utils/widgetSync.js';
import { hasFloatingBannerPermission, startFloatingBanner, isNativePlatform as isNativePlatformForFloatingBanner } from './utils/floatingBanner.js';
import { initGlassTouch } from './utils/glassTouch.js';

// ── Module-level constants (hoisted from render body) ──────────────────────
const DEBOUNCE_MS = 300;
const CALC_DEFER_MS = 150;
const STORAGE_WARNING_THRESHOLD = 3.5 * 1024 * 1024;
// Known weapon names across all rarities, used to validate pull-history entries in collectionData
// below — mirrors the ALL_CHARACTERS.has(p.name) check already done for characters, so a name that
// matches neither known list (a stray API name quirk, an unmapped alias) is dropped from the count
// instead of silently passing the old `!ALL_CHARACTERS.has(p.name)` negative-only check.
const ALL_WEAPONS_SET = new Set([...ALL_5STAR_WEAPONS, ...ALL_4STAR_WEAPONS, ...ALL_3STAR_WEAPONS, ...ALL_2STAR_WEAPONS, ...ALL_1STAR_WEAPONS]);

// [SECTION:MAINAPP]
function WhisperingWishesInner() {
  // Several tabs are wrapped in React.memo with custom comparators that don't
  // look at locale at all (e.g. TrackerTab only re-renders on profile/server/
  // banners/visualSettings/themeAccent changes), so merely re-rendering the
  // root wouldn't actually re-render them when the language changes. appLocale
  // is folded into the <main> key below to force a clean remount of every tab
  // instead, guaranteeing the new language actually shows up everywhere.
  const appLocale = useAppLocale();

  // Multi-format UI recalculation: the reference device (Xiaomi 13T, 439px)
  // always keeps --ui-scale pinned to 1 (untouched sizing). Other widths get
  // --ui-scale = innerWidth/439 written onto <html>, which the design tokens
  // in kuro.css/index.css multiply themselves by via calc().
  const isReferenceDevice = useIsReferenceDevice();
  useUiScale();

  const toast = useToast();
  const confirm = useConfirm();
  const pwa = usePWA();
  const undoReducer = useMemo(() => createUndoReducer(reducer), []);
  const [state, rawDispatch] = useReducer(undoReducer, initialState);
  // Wrap dispatch to show undo toast on destructive actions
  const dispatch = useCallback((action) => {
    rawDispatch(action);
    if (UNDOABLE_ACTIONS.has(action.type)) {
      toast?.addToast?.(t('app.actionCompleted'), 'info', 5000, () => rawDispatch({ type: 'UNDO' }));
    }
  }, [rawDispatch, toast]);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  // Admin panel state lifted to App so mini panel survives tab switches
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminMiniMode, setAdminMiniMode] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  // Dev access to the mini panel: visit /#spine-tune or press Ctrl+Alt+P to
  // skip the 5-tap + password flow. Useful for visually tuning spine
  // positioning on any tab. Keeps mini panel hoisted (persists across tabs).
  useEffect(() => {
    const openMini = () => {
      setAdminUnlocked(true);
      setAdminMiniMode(true);
      setShowAdminPanel(true);
    };
    if (typeof window !== 'undefined' && window.location?.hash === '#spine-tune') {
      openMini();
    }
    const onKey = (e) => {
      if (e.ctrlKey && e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        openMini();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const [exportData, setExportData] = useState('');
  const [restoreText, setRestoreText] = useState('');
  // Google Auth + Cloud Storage — provided by CloudStorageProvider context
  // (googleUser, cloudBackupStatus, auth tokens managed inside provider)

  const stateRef = useRef(state);
  const dispatchRef = useRef(dispatch);
  const toastRef = useRef(toast);
  

  const [activeBanners, setActiveBanners] = useState(() => {
    try {
      const banners = getActiveBanners();
      if (!banners || !banners.endDate) {
        console.error('[WW] getActiveBanners() returned invalid data');
        return getCurrentBannerAuto();
      }
      return banners;
    } catch (err) {
      console.error('[WW] getActiveBanners() threw:', err);
      return getCurrentBannerAuto();
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
      toast?.addToast?.(t('app.unknownServer', { server: state.server }), 'warning');
      dispatch({ type: 'SET_SERVER', server: 'Europe' });
    }
  }, [state.server, toast]);
  // Keep the Android home-screen widget's "next event ending" in sync — no-op on web
  useEffect(() => {
    syncHomeScreenWidget(state.server);
  }, [state.server]);
  // Keep the Android home-screen banner widget (art, featured 4★s, convene
  // video) in sync with whichever character banner is currently featured —
  // no-op on web
  useEffect(() => {
    syncBannerWidget(activeBanners);
  }, [activeBanners]);
  // One-time global listener for the glass-touch press effect (see glassTouch.js)
  useEffect(() => {
    initGlassTouch();
  }, []);
  const [trophyOverrides, setTrophyOverrides] = useState(() => {
    try { const s = localStorage.getItem(TROPHY_OVERRIDES_KEY); return s ? JSON.parse(s) : {}; } catch (err) { silentCatch(err, 'trophy overrides init'); return {}; }
  });
  
  // ── Extracted hooks ──────────────────────────────────────────────────────
  const { visualSettings, setVisualSettings, saveVisualSettings } = useVisualSettings();
  useAmbientMusic(visualSettings);

  // "Display over other apps" has no runtime permission dialog — the user
  // grants it in a Settings screen, then returns to the app on their own,
  // with no callback telling us it happened. If the user turned the
  // floating banner on in Profile before granting it (requestPermission
  // just opens Settings, it doesn't wait), this catches that: every time
  // the app comes back to the foreground, re-check permission and start
  // the overlay if it's now granted and the setting is still on.
  useEffect(() => {
    if (!isNativePlatformForFloatingBanner() || !visualSettings.floatingBannerEnabled) return;
    let handle;
    let cancelled = false;
    import('@capacitor/app').then(({ App }) =>
      App.addListener('resume', async () => {
        if (await hasFloatingBannerPermission()) startFloatingBanner();
      })
    ).then((h) => {
      if (cancelled) h.remove();
      else handle = h;
    });
    return () => { cancelled = true; handle?.remove(); };
  }, [visualSettings.floatingBannerEnabled]);

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
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { dispatchRef.current = dispatch; }, [dispatch]);
  useEffect(() => { toastRef.current = toast; }, [toast]);
  
  // Load state from persistent storage on mount
  useEffect(() => {
    const rawSaved = storageAvailable ? localStorage.getItem(STORAGE_KEY) : null;
    const savedState = loadFromStorage();
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', state: savedState });
      if (savedState.profile.importedAt) {
        toast?.addToast?.(t('app.dataRestored'), 'success');
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
          toast?.addToast?.(t('app.storageFull'), 'error');
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

  // Listen for storage warning events (dispatched by saveToStorage at 80% capacity)
  useEffect(() => {
    const onWarning = () => toastRef.current?.addToast?.(t('app.storageNearlyFull'), 'warning');
    const onError = () => toastRef.current?.addToast?.(t('app.storageFullShort'), 'error');
    window.addEventListener('ww-storage-warning', onWarning);
    window.addEventListener('ww-storage-error', onError);
    return () => { window.removeEventListener('ww-storage-warning', onWarning); window.removeEventListener('ww-storage-error', onError); };
  }, []);

  // P12-FIX: Cross-tab synchronization - reload state when another tab writes to localStorage (Step 14 audit - MEDIUM-10b)
  // Without this, two tabs open simultaneously would silently overwrite each other's changes (last-write-wins).
  // Debounced (3.7 fix) to prevent rapid dispatches when another tab saves frequently.
  useEffect(() => {
    if (!storageAvailable) return;
    let debounceTimer = null;
    // P4-06 audit hardening: cross-tab sync already exists; previously fired
    // a toast on every incoming storage event even when our state was identical
    // (e.g., two tabs saving the same user action in quick succession). Track
    // the last-applied state signature so duplicate toasts are suppressed.
    let lastAppliedSignature = null;
    const handleStorageChange = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      if (e.newValue === lastAppliedSignature) return;
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
            teams: Array.isArray(safeParsed.teams) && safeParsed.teams.length === 5 ? safeParsed.teams : initialState.teams,
            activeTeamIndex: typeof safeParsed.activeTeamIndex === 'number' ? Math.max(0, Math.min(4, safeParsed.activeTeamIndex)) : 0,
            bookmarks: safeParsed.bookmarks || [],
            eventStatus: safeParsed.eventStatus || {},
          };
          dispatchRef.current({ type: 'LOAD_STATE', state: merged });
          // Remember what we just applied so a subsequent identical-payload
          // storage event doesn't re-toast.
          lastAppliedSignature = e.newValue;
          toastRef.current?.addToast?.(t('app.dataSyncedTab'), 'info');
        } catch (err) {
          console.warn('Cross-tab sync failed:', err);
        }
      }, DEBOUNCE_MS);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => { clearTimeout(debounceTimer); window.removeEventListener('storage', handleStorageChange); };
  }, []); // P14-FIX: LOW-3 - Removed dead eslint-disable comment (no ESLint configured)
  const { activeTab, setActiveTab, tabNavRef, navPadding } = useTabNavigation(visualSettings.swipeNavigation);
  // Header is now a floating bar (fixed, inset from the edges) like the bottom nav, instead of a
  // full-width sticky bar — so its height no longer reserves space in normal document flow and
  // <main>'s top padding has to be measured dynamically, same technique useTabNavigation already
  // uses for navPadding below. A static pt-3 would either clip content under the header or leave a
  // huge gap, since header height varies (theme banner art, safe-area-inset-top on notched phones).
  const headerRef = useRef(null);
  const [headerPadding, setHeaderPadding] = useState(64);
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    // getBoundingClientRect().bottom (not offsetHeight) so this correctly
    // accounts for the header's marginTop (the notch/cutout clearance,
    // native Android only) as well as its own rendered height — margin
    // shifts the header's position without changing its own size, so
    // offsetHeight alone would under-report the space it actually occupies.
    const update = () => setHeaderPadding(header.getBoundingClientRect().bottom + 12);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    // ResizeObserver only fires on the header's own size changing, not on a
    // margin-driven position shift — cover that (native's WindowInsets
    // bridge lands asynchronously, a frame or more after first mount) with
    // a short-lived poll, plus orientation/resize changes afterward.
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(update);
      return () => cancelAnimationFrame(raf2);
    });
    const timer = setTimeout(update, 500);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf1);
      clearTimeout(timer);
      window.removeEventListener('resize', update);
    };
  }, []);

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
      toast?.addToast?.(t('app.profilePicRemoved'), 'info');
    } else {
      dispatch({ type: 'SET_PROFILE_PIC', value: name });
      toast?.addToast?.(t('app.profilePicSet', { name }), 'success');
    }
  }, [state.profile.profilePic, toast]);

  // Pre-compute all collection data in one pass
  // File import handler
  // P4: Memoized collection data - avoids recomputing 5x per render
  const collectionData = useMemo(() => {
    const { charHistory, weapHistory } = getMergedHistories(state.profile);
    const countItems = (history, rarity, isChar) => {
      const items = history.filter(p => p.rarity === rarity && p.name && (isChar ? ALL_CHARACTERS.has(p.name) : ALL_WEAPONS_SET.has(p.name)));
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
    // Rover is a free starter character - always count as obtained (minimum 1 copy). Rover is displayed as
    // four separate roster entries (one per attunement) but is a single ownable resonator in-game (you
    // re-spec its element for free, you don't pull separate copies per attunement) — so its owned-copy count
    // is mirrored across all four keys, plus the legacy bare 'Rover' key still used by weapon bestFor tags.
    const chars5 = countItems(charHistory, 5, true);
    const ROVER_KEYS = ['Rover', 'Rover: Spectro', 'Rover: Havoc', 'Rover: Aero', 'Rover: Electro'];
    const roverOwned = Math.max(1, ...ROVER_KEYS.map(k => chars5[k] || 0));
    ROVER_KEYS.forEach(k => { chars5[k] = roverOwned; });
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
  const importInFlightRef = useRef(false);
  const processImportData = useCallback(async (jsonString) => {
    // P2-F006: Prevent duplicate concurrent imports (race condition guard)
    if (importInFlightRef.current) { toast?.addToast?.('Import already in progress', 'warning'); return false; }
    importInFlightRef.current = true;
    try {
      // P10-FIX: Check raw string size before parsing to prevent expansion attacks (Step 6 audit)
      if (jsonString.length > MAX_IMPORT_SIZE_MB * 1024 * 1024) {
        throw new Error(t('app.importTooLarge', { size: (jsonString.length / 1024 / 1024).toFixed(1), max: MAX_IMPORT_SIZE_MB }));
      }
      const data = JSON.parse(jsonString);
      if (typeof data !== 'object' || data === null) {
        throw new Error(t('app.invalidDataFormat'));
      }

      // FIX #1: Detect own backup format (has 'state' key from handleExport)
      if (data.state && typeof data.state === 'object' && data.state.profile) {
        const doRestore = await confirm?.({ title: t('app.confirmRestoreBackupTitle'), message: t('app.confirmRestoreBackupMessage'), confirmLabel: t('app.confirmRestoreBackupConfirmLabel'), destructive: true });
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
        toast?.addToast?.(t('app.backupRestoredVersion', { version: data.version || '?', date: data.timestamp ? formatDate(new Date(data.timestamp)) : t('app.backupRestoredVersionUnknown') }), 'success');
        return true;
      }

      const pulls = data.pulls || data.conveneHistory || data.history || [];
      if (!Array.isArray(pulls)) {
        throw new Error(t('app.invalidPullsFormat'));
      }
      if (pulls.length === 0) {
        throw new Error(t('app.noConveneDataFound'));
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
        const proceed = await confirm?.({ title: t('app.differentAccountTitle'), message: t('app.differentAccountMessage', { importUid: importUid.slice(0, 6), existingUid: existingUid.slice(0, 6) }), confirmLabel: t('app.differentAccountConfirmLabel'), destructive: true });
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
        throw new Error(t('app.noValidConveneEntries'));
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
      if (fc) parts.push(t('app.importedCharPart', { count: fc }));
      if (wc) parts.push(t('app.importedWeapPart', { count: wc }));
      if (sc + sw) parts.push(t('app.importedStdPart', { count: sc + sw }));
      if (bc) parts.push(t('app.importedBegPart', { count: bc }));

      const skippedNote = skippedCount > 0 ? t('app.skippedEntriesNote', { count: skippedCount }) : '';
      toast?.addToast?.(t('app.importedConvenes', { count: totalImported, parts: parts.join(', '), skippedNote }), 'success');
      
      // P12-FIX: Check storage capacity after import (Step 14 audit - LOW-10a)
      if (storageAvailable) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY) || '';
          const currentSize = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(stored).length : stored.length * 2;
          if (currentSize > STORAGE_WARNING_THRESHOLD) {
            toast?.addToast?.(t('app.storageNearCapacity', { size: (currentSize / 1024 / 1024).toFixed(1) }), 'warning');
          }
        } catch {}
      }
      
      return true;
    } catch (err) {
      // F4-01: Show user-friendly message; hide raw JS errors (TypeError, ReferenceError)
      const isUserError = err instanceof SyntaxError || err.message?.startsWith?.('Import') || err.message?.startsWith?.('Invalid') || err.message?.startsWith?.('No ');
      const msg = isUserError ? err.message : t('app.importGenericError');
      toast?.addToast?.(t('app.importFailed', { message: msg }), 'error');
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
  }, [dispatch]);

  const {
    activeTheme, themeAccent,
    headerBgUrl, headerBgPos, headerBgType, headerBgPoster,
    navBgUrl, navBgPos, navBgType, navBgPoster,
    appBgUrl, appBgPos, appBgType, appBgPoster,
  } = useThemeAccent(visualSettings);

  const headerControlBg = { backgroundColor: 'rgba(15, 20, 28, 0.9)' };

  // ── CloudStorageProvider callbacks ──────────────────────────────────────
  const getBackupPayload = useCallback(() => {
    const s = stateRef.current;
    const aux = gatherAuxData();
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
    // F-007: Sanitize cloud-restored data with deep profile merge (matches cross-tab sync and loadFromStorage)
    const raw = data.state ? sanitizeStateObj(data.state) : { ...stateRef.current, profile: sanitizeStateObj(data.profile) };
    const safeProfile = raw.profile ? sanitizeStateObj(raw.profile) : {};
    const merged = {
      ...raw,
      profile: {
        ...initialState.profile,
        ...safeProfile,
        featured: { ...initialState.profile.featured, ...(safeProfile.featured ? sanitizeStateObj(safeProfile.featured) : {}) },
        weapon: { ...initialState.profile.weapon, ...(safeProfile.weapon ? sanitizeStateObj(safeProfile.weapon) : {}) },
        standardChar: { ...initialState.profile.standardChar, ...(safeProfile.standardChar ? sanitizeStateObj(safeProfile.standardChar) : {}) },
        standardWeap: { ...initialState.profile.standardWeap, ...(safeProfile.standardWeap ? sanitizeStateObj(safeProfile.standardWeap) : {}) },
        beginner: { ...initialState.profile.beginner, ...(safeProfile.beginner ? sanitizeStateObj(safeProfile.beginner) : {}) },
      },
    };
    dispatch({ type: 'LOAD_STATE', state: merged });
    // Restore auxiliary data if present — localStorage via centralized registry
    if (data.aux && typeof data.aux === 'object') {
      restoreAuxData(data.aux, sanitizeStateObj);
      // Also sync React state for settings that have in-memory mirrors
      try {
        if (data.aux.visualSettings) setVisualSettings(prev => ({ ...prev, ...sanitizeStateObj(data.aux.visualSettings) }));
        if (data.aux.imageFraming) setImageFraming(sanitizeStateObj(data.aux.imageFraming));
        if (data.aux.collectionImages) setCustomCollectionImages(sanitizeStateObj(data.aux.collectionImages));
        if (data.aux.trophyOverrides) setTrophyOverrides(sanitizeStateObj(data.aux.trophyOverrides));
      } catch {}
    }
  }, [dispatch, setImageFraming]);

  // Warm the browser cache for every BANNER_HISTORY banner art on mount, once.
  useEffect(() => { preloadBannerHistoryArt(); }, []);

  return (
    <CloudStorageProvider getBackupPayload={getBackupPayload} onRestoreData={handleRestoreData}>
    <ThemeColor />
    <div data-reference-device={isReferenceDevice} className={`min-h-screen ${visualSettings.oledMode ? 'oled-mode' : ''} ${visualSettings.animationsEnabled === 'off' ? 'no-animations' : ''} ${visualSettings.animationsEnabled === 'full' ? 'animations-full' : ''}`}>
      {appBgUrl && (
        // Explicit top/left/right/bottom (not just the inset-0 class) so this
        // is pinned to the true viewport edges no matter what — including the
        // strip behind/above the floating header — rather than depending on
        // inset-0 resolving the way it's expected to.
        // Brute-force overpaint: extends a bit past every edge (negative
        // inset) so it physically paints over whatever is causing the
        // top-edge seam, regardless of what that turns out to be. Stays at
        // its original z-index 3 (below .kuro-card's z-index 5) so it
        // doesn't paint over UI cards — an earlier attempt bumped this to
        // z-index 6 to also sit above TabBackground's vignette, but that
        // made every card render underneath it instead, washing them out.
        <div className={`fixed ${bgFramingMode ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`} style={{ top: -20, left: -20, right: -20, bottom: -20, zIndex: 3 }} aria-hidden={!bgFramingMode} onClick={bgFramingMode ? () => setEditingBgTarget('bg') : undefined}>
          {appBgType === 'animated' ? (
            <video
              src={appBgUrl}
              poster={appBgPoster || undefined}
              preload="auto"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ opacity: bgFramingMode ? 0.6 : 0.35, objectPosition: appBgPos }}
            />
          ) : (
            <img src={appBgUrl} alt="" className="w-full h-full object-cover" style={{ opacity: bgFramingMode ? 0.6 : 0.35, objectPosition: appBgPos }} />
          )}
          {bgFramingMode && (
            <div className={`absolute inset-0 ${editingBgTarget === 'bg' ? 'ring-4 ring-inset ring-cyan-400' : ''}`}>
              <span className="absolute top-16 left-3 text-2xs bg-black/70 text-cyan-400 px-1.5 py-0.5 rounded">{editingBgTarget === 'bg' ? '● BACKGROUND' : 'Background'}</span>
            </div>
          )}
        </div>
      )}
      {/* KuroStyles removed — CSS loaded via <link> in index.html, OLED via .oled-mode class */}

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      
      <ColorblindFilterDefs />

      {/* P12-FIX: Skip to content link for keyboard users (Step 11 audit - MEDIUM-6n) */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-yellow-500 focus:text-black focus:rounded-lg focus:font-bold focus:text-md">
        {t('app.skipToContent')}
      </a>
      
      {/* Offline banner handled by PWAProvider */}

      {/* Header */}
      <header ref={headerRef} className="kuro-card fixed top-3 left-3 right-3 z-50" style={{ position: 'fixed', zIndex: 50, height: 64, borderRadius: 14, display: 'flex', alignItems: 'center', marginTop: 'var(--safe-area-top, 0px)', overflow: 'hidden', ...(activeTheme ? { borderColor: `${themeAccent}30` } : {}) }}>
        {/* Theme banner art background */}
        {headerBgUrl && (
          headerBgType === 'animated' ? (
            <video src={headerBgUrl} poster={headerBgPoster || undefined} preload="auto" autoPlay loop muted playsInline aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.75, pointerEvents: 'none', objectPosition: headerBgPos }} />
          ) : (
            <img src={headerBgUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.75, pointerEvents: 'none', objectPosition: headerBgPos }} loading="eager" />
          )
        )}
        {bgFramingMode && headerBgUrl && (
          <div className={`absolute inset-0 z-20 cursor-pointer ${editingBgTarget === 'header' ? 'ring-2 ring-inset ring-cyan-400' : ''}`} onClick={() => setEditingBgTarget('header')}>
            <span className="absolute top-1 left-1 text-2xs bg-black/70 text-cyan-400 px-1.5 py-0.5 rounded">{editingBgTarget === 'header' ? '● HEADER' : 'Header'}</span>
          </div>
        )}
        <div className="header-inner max-w-lg md:max-w-2xl lg:max-w-none mx-auto pl-1.5 pr-1.5 relative z-10" style={{ width: '100%' }}>
          <div className="header-top flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <div className="relative group cursor-pointer" onClick={async () => {
                if (pwa?.canInstall) {
                  const accepted = await pwa.promptInstall();
                  if (accepted) toast?.addToast?.(t('app.appInstalledSuccess'), 'success');
                } else if (pwa?.isInstalled) {
                  toast?.addToast?.(t('app.appAlreadyInstalled'), 'success');
                } else {
                  pwa?.showInstallGuide?.();
                }
              }} title={pwa?.canInstall ? t('app.installApp') : pwa?.isInstalled ? t('app.appInstalled') : t('app.addToHomeScreen')}>
                <div className="relative w-[48px] h-[48px] flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform" style={{ borderRadius: '12px' }}>
                  <img src={HEADER_ICON} alt={t('app.logoAlt')} style={{ width: 64, height: 64, transform: 'scale(1.0)' }} className="object-cover" />
                </div>
                {visualSettings.animationsEnabled !== 'off' && (
                  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    {[0, 1, 2, 3].map(i => (
                      <span key={i} className="header-star" style={{
                        position: 'absolute',
                        left: '50%', top: '50%',
                        width: 6, height: 6,
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
                    <Download size={8} className="text-black" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center h-[48px]" style={activeTheme ? { background: 'rgba(15,20,28,0.3)', borderRadius: 12 } : undefined}>
                <h1 className="text-white font-semibold text-md tracking-wide leading-tight">Whispering Wishes</h1>
                <p className="text-xs font-semibold tracking-wider uppercase leading-tight" style={{ color: activeTheme ? themeAccent : 'rgba(250,204,21,0.5)' }}>{t('app.appTagline')}</p>
              </div>
            </div>
            <div className="header-controls flex items-center gap-2">
              <button onClick={() => setActiveTab('profile')} aria-label={t('app.profile')} title={t('app.profile')} className="relative w-[48px] h-[48px] flex items-center justify-center overflow-hidden transition-all" style={activeTheme && activeTab === 'profile' ? { background: `${themeAccent}30`, borderRadius: '12px' } : undefined}>
                {state.profile.profilePic && collectionImages[state.profile.profilePic]
                  ? (() => {
                      const pf = getImageFraming(`collection-${state.profile.profilePic}`);
                      return (
                        <div className="absolute inset-0" style={{
                          maskImage: 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)',
                          WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)',
                        }}>
                          <img
                            src={collectionImages[state.profile.profilePic]}
                            alt={state.profile.profilePic}
                            className={`w-full h-full ${ALL_CHARACTERS.has(state.profile.profilePic) ? 'object-contain' : 'object-cover'}`}
                            style={{ transform: `scale(${pf.zoom / 100}) translate(${-pf.x}%, ${-pf.y}%)` }}
                          />
                        </div>
                      );
                    })()
                  : <img src="./navicon/Icon_Setting.png" alt="" className={`w-6 h-6 ${activeTab === 'profile' ? 'opacity-100' : 'opacity-90'}`} />
                }
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating bottom navigation bar */}
      <nav ref={tabNavRef} className="kuro-card fixed bottom-3 left-3 right-3 z-50 flex items-center justify-center overflow-x-auto scrollbar-hide" style={{ position: 'fixed', zIndex: 50, height: 64, borderRadius: 14, marginBottom: 'var(--safe-area-bottom, 0px)', overflow: 'hidden', ...(activeTheme ? { borderColor: `${themeAccent}30` } : {}) }} role="tablist" aria-label={t('app.mainNavigation')} onKeyDown={(e) => {
          const tabs = ['tracker','events','map','planner','calculator','analytics','teams','gathering'];
          const idx = tabs.indexOf(activeTab);
          let newTab;
          if (e.key === 'ArrowRight') { e.preventDefault(); newTab = tabs[(idx + 1) % tabs.length]; }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); newTab = tabs[(idx - 1 + tabs.length) % tabs.length]; }
          if (newTab) { setActiveTab(newTab); setTimeout(() => document.getElementById(`tab-${newTab}`)?.focus(), 0); }
        }}>
        {navBgUrl && (
          navBgType === 'animated' ? (
            <video src={navBgUrl} poster={navBgPoster || undefined} preload="auto" autoPlay loop muted playsInline aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.75, pointerEvents: 'none', objectPosition: navBgPos }} />
          ) : (
            <img src={navBgUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.75, pointerEvents: 'none', objectPosition: navBgPos }} />
          )
        )}
        {bgFramingMode && navBgUrl && (
          <div className={`absolute inset-0 z-20 cursor-pointer ${editingBgTarget === 'nav' ? 'ring-2 ring-inset ring-cyan-400' : ''}`} onClick={() => setEditingBgTarget('nav')}>
            <span className="absolute top-1 left-1 text-2xs bg-black/70 text-cyan-400 px-1.5 py-0.5 rounded">{editingBgTarget === 'nav' ? '● NAV' : 'Nav'}</span>
          </div>
        )}
        <div className="tab-indicator" />
        <TabButton active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')} tabRef={tabNavRef} tabId="tracker" accentColor={themeAccent}><img src="./navicon/Icon_Convene.webp" alt="" className="w-4 h-4 object-contain shrink-0" /> {t('app.navTracker')}</TabButton>
        <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} tabRef={tabNavRef} tabId="events" accentColor={themeAccent}><img src="./navicon/Icon_Event.webp" alt="" className="w-4 h-4 object-contain shrink-0" /> {t('app.navEvents')}</TabButton>
        <TabButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} tabRef={tabNavRef} tabId="map" accentColor={themeAccent}><img src="./navicon/Icon_Map.png" alt="" className="w-4 h-4 object-contain shrink-0" /> {t('app.navMap')}</TabButton>
        <TabButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} tabRef={tabNavRef} tabId="planner" accentColor={themeAccent}><img src="./navicon/Icon_Guidebook.webp" alt="" className="w-4 h-4 object-contain shrink-0" /> {t('app.navPlan')}</TabButton>
        <TabButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} tabRef={tabNavRef} tabId="calculator" accentColor={themeAccent}><img src="./navicon/Icon_Calculation.png" alt="" className="w-4 h-4 object-contain shrink-0" /> {t('app.navCalc')}</TabButton>
        <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} tabRef={tabNavRef} tabId="analytics" accentColor={themeAccent}><img src="./navicon/Icon_Bag.png" alt="" className="w-4 h-4 object-contain shrink-0" /> {t('app.navStats')}</TabButton>
        <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} tabRef={tabNavRef} tabId="teams" accentColor={themeAccent}><img src="./navicon/Icon_Team.webp" alt="" className="w-4 h-4 object-contain shrink-0" /> {t('app.navTeams')}</TabButton>
        <TabButton active={activeTab === 'gathering'} onClick={() => setActiveTab('gathering')} tabRef={tabNavRef} tabId="gathering" accentColor={themeAccent}><img src="./navicon/Icon_Databank.png" alt="" className="w-4 h-4 object-contain shrink-0" /> {t('app.navCollection')}</TabButton>
      </nav>

      <main id="main-content" key={`main-${visualSettings.colorBlindMode ? 'cb' : 'std'}-${appLocale}`} className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-3 space-y-3 w-full" style={{ paddingTop: headerPadding, paddingBottom: navPadding }} role="main">
        {/* Screen reader announcement for tab changes */}
        <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
          {t('app.tabActive', { tab: activeTab.charAt(0).toUpperCase() + activeTab.slice(1) })}
        </div>
        
        {/* [SECTION:TAB-TRACKER] */}
        {activeTab === 'tracker' && !bgFramingMode && (
          <TabErrorBoundary tabName="Tracker">
            <Suspense fallback={<TabLoadingFallback />}>
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
                setDetailModal={setDetailModal}
              />

            </Suspense>
          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-EVENTS] */}
        {activeTab === 'events' && !bgFramingMode && (
          <TabErrorBoundary tabName="Events">
            <Suspense fallback={<TabLoadingFallback />}>
              <EventsTab
                state={state}
                dispatch={dispatch}
                activeBanners={activeBanners}
                setActiveBanners={setActiveBanners}
                visualSettings={visualSettings}
                toast={toast}
              />

            </Suspense>
          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-MAP] */}
        {activeTab === 'map' && !bgFramingMode && (
          <TabErrorBoundary tabName="Map">
            <Suspense fallback={<TabLoadingFallback />}>
              <MapTab navPadding={navPadding} headerPadding={headerPadding} />
            </Suspense>
          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-CALC] */}
        {activeTab === 'calculator' && !bgFramingMode && (
          <TabErrorBoundary tabName="Calculator">
            <Suspense fallback={<TabLoadingFallback />}>
              <CalculatorTab state={state} dispatch={dispatch} />

            </Suspense>
          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-PLANNER] */}
        {activeTab === 'planner' && !bgFramingMode && (
          <TabErrorBoundary tabName="Planner">
            <Suspense fallback={<TabLoadingFallback />}>
              <PlannerTab
                state={state}
                dispatch={dispatch}
                activeBanners={activeBanners}
                bannerEndDate={bannerEndDate}
                toast={toast}
                confirm={confirm}
              />

            </Suspense>
          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-STATS] */}
        {activeTab === 'analytics' && !bgFramingMode && (
          <TabErrorBoundary tabName="Analytics">
            <Suspense fallback={<TabLoadingFallback />}>
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
                headerPadding={headerPadding}
                navPadding={navPadding}
              />

            </Suspense>
          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-COLLECT] */}
        {activeTab === 'gathering' && !bgFramingMode && (
          <TabErrorBoundary tabName="Collection">
            <Suspense fallback={<TabLoadingFallback />}>
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

            </Suspense>
          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-TEAMS] */}
        {activeTab === 'teams' && !bgFramingMode && (
          <TabErrorBoundary tabName="Teams">
            <Suspense fallback={<TabLoadingFallback />}>
              <TeamsTab
                state={state}
                dispatch={dispatch}
                collectionImages={collectionImages}
                collectionData={collectionData}
                toast={toast}
                confirm={confirm}
              />

            </Suspense>
          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-PROFILE] */}
        {(activeTab === 'profile' || bgFramingMode) && (
          <TabErrorBoundary tabName="Profile">
            <Suspense fallback={<TabLoadingFallback />}>
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
            adminUnlocked={adminUnlocked}
            setAdminUnlocked={setAdminUnlocked}
            bgFramingMode={bgFramingMode}
            setBgFramingMode={setBgFramingMode}
            editingBgTarget={editingBgTarget}
            setEditingBgTarget={setEditingBgTarget}
            updateBgPosition={updateBgPosition}
            getBgPositionLabel={getBgPositionLabel}
            exportBgPositions={exportBgPositions}
            getCustomBgPosition={getCustomBgPosition}
          />

            </Suspense>
          </TabErrorBoundary>
        )}

      </main>

      {/* Admin Mini Panel — rendered here (not inside ProfileTab) so it
          persists across tab switches. ProfileTab still renders the full
          AdminPanel modal; we only hoist the mini variant. */}
      {showAdminPanel && adminMiniMode && adminUnlocked && (
        <AdminMiniPanel
          setShowAdminPanel={setShowAdminPanel} setAdminMiniMode={setAdminMiniMode}
          visualSettings={visualSettings} saveVisualSettings={saveVisualSettings} DEFAULT_VISUAL_SETTINGS={DEFAULT_VISUAL_SETTINGS}
          bgFramingMode={bgFramingMode} setBgFramingMode={setBgFramingMode}
          editingBgTarget={editingBgTarget} setEditingBgTarget={setEditingBgTarget}
          updateBgPosition={updateBgPosition} getBgPositionLabel={getBgPositionLabel} exportBgPositions={exportBgPositions}
          detailModal={detailModal} toast={toast} confirm={confirm}
        />
      )}

      {/* Padding debug overlay — self-manages visibility via localStorage, toggled from Admin Panel > Debug tab */}
      <PaddingDebugOverlay />

      {/* Server Selector Modal */}
      <ServerSelectorModal
        isOpen={showServerDropdown}
        onClose={() => setShowServerDropdown(false)}
        servers={SERVERS}
        currentServer={state.server}
        onSelectServer={(s) => { dispatch({ type: 'SET_SERVER', server: s }); setShowServerDropdown(false); }}
      />

      {/* Export Modal */}
      <BackupRestoreModal
        isOpen={showExportModal}
        exportData={exportData}
        restoreText={restoreText}
        setRestoreText={setRestoreText}
        onClose={() => { setRestoreText(''); setShowExportModal(false); }}
        toast={toast}
        confirm={confirm}
        dispatch={dispatch}
        stateRef={stateRef}
        sanitizeStateObj={sanitizeStateObj}
        sanitizeImportedState={sanitizeImportedState}
        initialState={initialState}
        setVisualSettings={setVisualSettings}
        setImageFraming={setImageFraming}
        setCustomCollectionImages={setCustomCollectionImages}
        setTrophyOverrides={setTrophyOverrides}
      />

      {/* Character/Weapon Detail Modal */}
      <DetailModalHost
        detailModal={detailModal}
        setDetailModal={setDetailModal}
        visualSettings={visualSettings}
        setActiveTab={setActiveTab}
        collectionData={collectionData}
      />

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
