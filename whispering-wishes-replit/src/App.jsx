// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES v3.2.3 - App (Main Application Component)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Main app module — WhisperingWishesInner + default export with providers.
// Imports all data, utilities, and components from AppCore.jsx.
//
// [SECTION INDEX] - Use: grep -n "SECTION:\|TAB-" App.jsx
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
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, Archive, Award, BarChart3, BookmarkPlus, Calculator, Calendar, Check, ChevronDown, ClipboardList, Clover, Crown, Diamond, Download, Fish, Flame, Gamepad2, Gift, Heart, Info, Minus, Monitor, Plus, RefreshCcw, Search, Settings, Shield, Smartphone, Sparkles, Star, Sword, Swords, Target, TrendingDown, TrendingUp, Trophy, Upload, User, Users, X, Zap } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import {
  APP_VERSION,
  MAX_IMPORT_SIZE_MB,
  HEADER_ICON,
  haptic,
  PWAProvider,
  usePWA,
  ToastProvider,
  useToast,
  useFocusTrap,
  useEscapeKey,
  FocusTrapModal,
  OnboardingModal,
  ConfirmProvider,
  useConfirm,
  calculateLuckRating,
  KuroStyles,
  SERVERS,
  getServerOffset,
  getServerAdjustedEnd,
  CURRENT_BANNERS,
  getActiveBanners,
  BANNER_HISTORY,
  CHARACTER_DATA,
  WEAPON_DATA,
  ECHO_SETS,
  CHAR_BUFF_TABLE,
  RESONANCE_CHAIN_DATA,
  EVENTS,
  SUBSCRIPTIONS,
  HARD_PITY,
  ASTRITE_PER_PULL,
  BEGINNER_ASTRITE_PER_PULL,
  LUNITE_DAILY_ASTRITE,
  MAX_ASTRITE,
  MAX_CALC_PULLS,
  initialState,
  STORAGE_KEY,
  storageAvailable,
  sanitizeStateObj,
  sanitizeImportedState,
  loadFromStorage,
  saveToStorage,
  reducer,
  calcStats,
  Card,
  CardHeader,
  CardBody,
  BannerCard,
  StandardBannerSection,
  CountdownTimer,
  PityCounterInput,
  CalcResultsCard,
  EventCard,
  ImportGuide,
  TabButton,
  TabBackground,
  BackgroundGlow,
  TriangleMirrorWave,
  KuroSelect,
  CollectionGridSection,
  CharacterDetailModal,
  WeaponDetailModal,
  EchoDetailModal,
  VISUAL_SLIDER_CONFIGS,
  VisualSliderGroup,
  generateVerticalMaskGradient,
  TROPHY_ICON_MAP,
  DEFAULT_COLLECTION_IMAGES,
  RELEASE_ORDER,
  WEAPON_RELEASE_ORDER,
  ALL_5STAR_RESONATORS,
  ALL_5STAR_WEAPONS,
  ALL_4STAR_RESONATORS,
  ALL_4STAR_WEAPONS,
  ALL_3STAR_WEAPONS,
  ALL_2STAR_WEAPONS,
  ALL_1STAR_WEAPONS,
  ALL_4COST_ECHOES,
  ALL_3COST_ECHOES,
  ALL_1COST_ECHOES,
  ECHO_DATA,
  ALL_ECHO_SONATA_SETS,
  ALL_ECHO_BUFF_TYPES,
  ALL_CHARACTERS,
  STANDARD_5STAR_CHARACTERS,
  STANDARD_5STAR_WEAPONS,
  generateUniqueId,
  ADMIN_HASH,
  ADMIN_BANNER_KEY,
  AppErrorBoundary,
  TabErrorBoundary,
  TAB_ORDER,
  MEDAL_COLORS,
  getElementColor, getElementBg, getElementBorder,
  hideOnError,
} from './AppCore';

// ── Module-level constants (hoisted from render body) ──────────────────────
// 8.1 fix: Fetch wrapper with AbortController timeout — fails fast on network loss
const FETCH_TIMEOUT_MS = 10000;
const fetchWithTimeout = (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal })
    .catch((err) => {
      if (err.name === 'AbortError') {
        throw new Error(`[WW] Request to ${new URL(url).hostname} timed out after ${FETCH_TIMEOUT_MS}ms`);
      }
      throw err;
    })
    .finally(() => clearTimeout(timeoutId));
};
const DEBOUNCE_MS = 300;
const FOCUS_DELAY_MS = 50;
const CALC_DEFER_MS = 150;
const MAX_ADMIN_ATTEMPTS = 5;
const ADMIN_LOCKOUT_MS = 5 * 60 * 1000;
const ADMIN_TAP_TIMEOUT_MS = 1500;
const STORAGE_WARNING_THRESHOLD = 3.5 * 1024 * 1024;
const MAX_USERNAME_LENGTH = 24;
const MAX_BOOKMARK_NAME_LENGTH = 30;
const LEADERBOARD_DISPLAY_LIMIT = 20;
const ADMIN_SALT = 'whispering-wishes-v3-admin';
const constantTimeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};
const currentYear = new Date().getFullYear();
const MIN_ZOOM = 100;
const MAX_ZOOM = 300;
// P13-FIX: CRITICAL-1 — Read Firebase config from env vars (set in .env or Vercel dashboard).
// No hardcoded fallbacks — Firebase features are disabled when env vars are missing.
const FIREBASE_DB = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_DB) || null;
const FIREBASE_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || null;
const FIREBASE_AVAILABLE = !!(FIREBASE_DB && FIREBASE_API_KEY);
// localStorage keys — bump the suffix when the schema changes
// v3 = visual settings were restructured in app v3.0; others haven't changed since v1
const VISUAL_SETTINGS_KEY = 'whispering-wishes-visual-settings-v3';
const IMAGE_FRAMING_KEY = 'whispering-wishes-image-framing-v1';
const TROPHY_OVERRIDES_KEY = 'whispering-wishes-trophy-overrides-v1';
const DEFAULT_VISUAL_SETTINGS = Object.freeze({
  fadePosition: 50,
  fadeIntensity: 100,
  pictureOpacity: 100,
  standardFadePosition: 50,
  standardFadeIntensity: 100,
  standardOpacity: 100,
  shadowFadePosition: 50,
  shadowFadeIntensity: 100,
  shadowOpacity: 100,
  collectionFadePosition: 50,
  collectionFadeIntensity: 100,
  collectionOpacity: 100,
  collectionFadeDirection: 'top',
  collectionZoom: 120,
  oledMode: false,
  swipeNavigation: false,
  animationsEnabled: 'on' // 'off' | 'on' | 'full' (full = 2x intensity); overridden at mount via matchMedia listener
});
const TRACKER_CATEGORIES = Object.freeze([
  Object.freeze({ key: 'character', label: 'Resonators', color: 'yellow' }),
  Object.freeze({ key: 'weapon', label: 'Weapons', color: 'pink' }),
  Object.freeze({ key: 'standard', label: 'Standard', color: 'cyan' }),
]);
// P15-FIX: MEDIUM-3 — Domain allowlist for custom image URLs (single source of truth)
const ALLOWED_IMAGE_HOSTS = ['i.ibb.co', 'ibb.co', 'i.imgur.com', 'imgur.com', 'cdn.discordapp.com', 'media.discordapp.net', 'pbs.twimg.com', 'raw.githubusercontent.com', 'i.postimg.cc', 'wuwa.gg', 'wuwatracker.com'];
const isAllowedImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_IMAGE_HOSTS.some(host =>
      parsed.hostname === host || parsed.hostname.endsWith('.' + host)
    );
  } catch {
    return false;
  }
};
const sanitizeImageUrl = (url, fallback = '') => isAllowedImageUrl(url) ? url : fallback;

// Utility for silent-in-prod, logged-in-dev error handling
const silentCatch = (err, context = '') => {
  if (import.meta.env?.DEV) {
    console.warn(`[WW] Silent catch${context ? ` in ${context}` : ''}:`, err);
  }
};

// P13-FIX: HIGH-5 — Hash UIDs before writing to Firebase to protect player privacy.
// Game UIDs can potentially be correlated to real identities; hashing makes stored data pseudonymous.
const hashUidForStorage = async (uid) => {
  if (!uid) return null;

  // Try Web Crypto first (HTTPS only)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ww-uid-' + uid));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
    } catch {
      // Sync fallback — don't expose raw UID
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

// P13-FIX: HIGH-2 — Client-side rate limiter for Firebase writes.
// Prevents runaway writes from bugs or abuse. Firebase Security Rules handle server-side enforcement.
const firebaseWriteTimestamps = new Map(); // key → last write timestamp
const FIREBASE_WRITE_COOLDOWN_MS = 5000; // 5 seconds between writes to the same path
const FIREBASE_RATE_LIMIT_MAX_ENTRIES = 100;
const checkFirebaseRateLimit = (pathKey) => {
  const now = Date.now();
  const lastWrite = firebaseWriteTimestamps.get(pathKey) || 0;
  if (now - lastWrite < FIREBASE_WRITE_COOLDOWN_MS) return false; // rate-limited
  firebaseWriteTimestamps.set(pathKey, now);
  // Prune old entries if map grows too large
  if (firebaseWriteTimestamps.size > FIREBASE_RATE_LIMIT_MAX_ENTRIES) {
    const staleThreshold = now - FIREBASE_WRITE_COOLDOWN_MS * 10;
    for (const [key, ts] of firebaseWriteTimestamps) {
      if (ts < staleThreshold) firebaseWriteTimestamps.delete(key);
    }
  }
  return true; // allowed
};

// [SECTION:MAINAPP]
function WhisperingWishesInner() {
  // Check admin-only lockout (5-min cooldown after 5 failed attempts — does NOT lock the app)
  const [adminLockedUntil, setAdminLockedUntil] = useState(() => {
    try {
      const lockoutUntil = localStorage.getItem('ww-admin-lockout');
      const failCount = parseInt(localStorage.getItem('ww-admin-fails') || '0', 10);
      if (lockoutUntil && Date.now() < parseInt(lockoutUntil, 10)) {
        return parseInt(lockoutUntil, 10);
      }
      if (lockoutUntil) {
        localStorage.removeItem('ww-admin-lockout');
        localStorage.removeItem('ww-admin-fails');
      }
      // Progressive lockout: extended lockout after repeated failure sets
      if (failCount >= MAX_ADMIN_ATTEMPTS * 3) {
        const extendedLockout = Date.now() + ADMIN_LOCKOUT_MS * 4;
        localStorage.setItem('ww-admin-lockout', String(extendedLockout));
        return extendedLockout;
      }
    } catch (err) { silentCatch(err, 'admin lockout init'); }
    return false;
  });
  
  const toast = useToast();
  const confirm = useConfirm();
  const pwa = usePWA();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [showBannerHistory, setShowBannerHistory] = useState(false);
  const [exportData, setExportData] = useState('');
  const [restoreText, setRestoreText] = useState('');
  const stateRef = useRef(state);
  
  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminTapCount, setAdminTapCount] = useState(0);
  const adminTapTimerRef = useRef(null);
  const adminTapCountRef = useRef(0);
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
  // Validate server name — surface warning if corrupted
  useEffect(() => {
    if (state.server && !SERVERS[state.server]) {
      toast?.addToast?.(`Unknown server "${state.server}" — defaulting to Europe. Please update in Settings.`, 'warning');
      dispatch({ type: 'SET_SERVER', server: 'Europe' });
    }
  }, [state.server, toast]);
  const [adminTab, setAdminTab] = useState('banners'); // 'banners', 'collection', 'visuals', 'trophies', or 'players'
  const [adminMiniMode, setAdminMiniMode] = useState(false);
  const [trophyOverrides, setTrophyOverrides] = useState(() => {
    try { const s = localStorage.getItem(TROPHY_OVERRIDES_KEY); return s ? JSON.parse(s) : {}; } catch (err) { silentCatch(err, 'trophy overrides init'); return {}; }
  });
  const [trophyJsonInput, setTrophyJsonInput] = useState('');
  
  // Anonymous presence tracking — no personal data, just a timestamp per ephemeral session
  const [activePlayersCount, setActivePlayersCount] = useState(null);
  const [activePlayersHistory, setActivePlayersHistory] = useState([]); // last ~30 data points
  const [presenceError, setPresenceError] = useState(null);
  const [adminPlayerList, setAdminPlayerList] = useState(null); // full player data for admin only
  const presenceSessionId = useRef('s_' + generateUniqueId().replace(/-/g, '').slice(0, 12));
  
  // P6-FIX: Controlled admin banner form state — replaces all document.getElementById calls (HIGH-17/18)
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
      dpImg: b.doubledPawnsImage || '',
      toaImg: b.towerOfAdversityImage || '',
      irImg: b.illusiveRealmImage || '',
      drImg: b.dailyResetImage || '',
      thImg: b.tacticalHologramImage || '',
      wbImg: b.weeklyBossImage || '',
    };
  }, []);
  const [bannerForm, setBannerForm] = useState(() => buildBannerForm(activeBanners));
  const updateBannerForm = useCallback((field, value) => {
    // Validate image URL fields against allowlist
    const imageFields = ['standardCharImg', 'standardWeapImg', 'wwImg', 'dpImg', 'toaImg', 'irImg', 'drImg', 'thImg', 'wbImg'];
    if (imageFields.includes(field) || field.startsWith('charImages.') || field.startsWith('weapImages.')) {
      if (value && !isAllowedImageUrl(value)) {
        // Allow empty values (clearing), reject invalid URLs silently during typing
        return;
      }
    }
    setBannerForm(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Banner visual settings - v3 forces fresh defaults
  // Always start with defaults - localStorage can override but we validate each property
  const [visualSettings, setVisualSettings] = useState(() => {
    // Return defaults - don't load from localStorage on initial load
    // This ensures fresh users always get correct defaults
    return { ...DEFAULT_VISUAL_SETTINGS };
  });
  
  // Load from localStorage after mount (so SSR/preview gets defaults)
  useEffect(() => {
    if (!storageAvailable) return;
    try {
      const saved = localStorage.getItem(VISUAL_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge saved values over defaults - only known keys
        setVisualSettings(prev => {
          const merged = { ...prev };
          for (const key of Object.keys(prev)) {
            if (parsed[key] !== undefined && parsed[key] !== null) merged[key] = parsed[key];
          }
          // Clamp numeric values to valid ranges
          merged.collectionZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, merged.collectionZoom || 120));
          for (const key of ['fadePosition', 'fadeIntensity', 'pictureOpacity',
            'standardFadePosition', 'standardFadeIntensity', 'standardOpacity',
            'shadowFadePosition', 'shadowFadeIntensity', 'shadowOpacity',
            'collectionFadePosition', 'collectionFadeIntensity', 'collectionOpacity']) {
            if (typeof merged[key] === 'number') merged[key] = Math.min(100, Math.max(0, merged[key]));
          }
          // Backward compat: boolean → 3-state string
          if (merged.animationsEnabled === true) merged.animationsEnabled = 'on';
          else if (merged.animationsEnabled === false) merged.animationsEnabled = 'off';
          return merged;
        });
      }
    } catch (err) { silentCatch(err, 'visual settings load'); }
  }, []);

  // Respect prefers-reduced-motion — only for first-time users (no saved setting)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Only apply OS preference if user has no saved setting
    if (mql.matches && (!storageAvailable || !localStorage.getItem(VISUAL_SETTINGS_KEY))) {
      setVisualSettings(prev => ({ ...prev, animationsEnabled: 'off' }));
    }
    // Listen for runtime changes (user toggles OS setting while app is open)
    const handler = (e) => {
      setVisualSettings(prev => ({ ...prev, animationsEnabled: e.matches ? 'off' : (prev.animationsEnabled === 'off' ? 'on' : prev.animationsEnabled) }));
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  
  // Custom app icon for home screen
  useEffect(() => {
    try {
      const transparentIcon = 'data:image/png;base64,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';
      const darkBgIcon = 'data:image/png;base64,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';
      
      // Favicon (browser tab) - transparent, looks good on dark UI
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) { favicon = document.createElement('link'); favicon.rel = 'icon'; document.head.appendChild(favicon); }
      favicon.href = transparentIcon;
      
      // Shortcut icon - also transparent for browser
      let shortcut = document.querySelector('link[rel="shortcut icon"]');
      if (!shortcut) { shortcut = document.createElement('link'); shortcut.rel = 'shortcut icon'; document.head.appendChild(shortcut); }
      shortcut.href = transparentIcon;
      
      // Apple-touch-icon (home screen) - dark background, no white border
      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (!appleIcon) { appleIcon = document.createElement('link'); appleIcon.rel = 'apple-touch-icon'; document.head.appendChild(appleIcon); }
      appleIcon.href = darkBgIcon;
      
      document.title = 'Whispering Wishes';
      
      // Web manifest (Android home screen) - dark background icon
      // HIGH-4: TODO — Generate icon-192x192.png, icon-512x512.png, and icon-maskable-512x512.png
      // from favicon.svg (gold "W" on #080c14). Currently using dynamic canvas-generated PNG.
      const manifest = {
        name: 'Whispering Wishes',
        short_name: 'Whispering Wishes',
        icons: [
          { src: darkBgIcon, sizes: '180x180', type: 'image/png' },
          { src: darkBgIcon, sizes: '192x192', type: 'image/png' },
          { src: darkBgIcon, sizes: '512x512', type: 'image/png' }
        ],
        start_url: '/',
        display: 'standalone',
        background_color: '#080c14', /* §E9-IC-F5: Match app navy void */
        theme_color: '#080c14'
      };
      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      let manifestLink = document.querySelector('link[rel="manifest"]');
      if (!manifestLink) { manifestLink = document.createElement('link'); manifestLink.rel = 'manifest'; document.head.appendChild(manifestLink); }
      const oldManifestHref = manifestLink.href;
      manifestLink.href = URL.createObjectURL(manifestBlob);
      if (oldManifestHref.startsWith('blob:')) URL.revokeObjectURL(oldManifestHref); // P7-FIX: Revoke old manifest blob (7D)
      
      let themeColor = document.querySelector('meta[name="theme-color"]');
      if (!themeColor) { themeColor = document.createElement('meta'); themeColor.name = 'theme-color'; document.head.appendChild(themeColor); }
      themeColor.content = '#0c0820';
    } catch (e) { console.warn('Icon setup failed:', e); }
  }, []);
  
  // Debounced visual settings persistence — live state update on every tick,
  // but localStorage write only after 300ms of inactivity (prevents ~60 writes/sec during slider drag)
  const visualSettingsTimerRef = useRef(null);
  const saveVisualSettings = useCallback((newSettings) => {
    setVisualSettings(newSettings);
    if (!storageAvailable) return;
    if (visualSettingsTimerRef.current) clearTimeout(visualSettingsTimerRef.current);
    visualSettingsTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(VISUAL_SETTINGS_KEY, JSON.stringify(newSettings)); } catch {}
    }, DEBOUNCE_MS);
  }, [storageAvailable]);

  // Cleanup debounce timers and admin tap timer on unmount
  useEffect(() => {
    return () => {
      if (visualSettingsTimerRef.current) clearTimeout(visualSettingsTimerRef.current);
      if (adminTapTimerRef.current) clearTimeout(adminTapTimerRef.current);
    };
  }, []);

  // AUDIT-FIX L10: Listen for runtime prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => { saveVisualSettings({ ...visualSettings, animationsEnabled: e.matches ? 'off' : (visualSettings.animationsEnabled === 'off' ? 'on' : visualSettings.animationsEnabled) }); };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [visualSettings, saveVisualSettings]);

  // Image framing state - stores position/zoom for each image by key
  const [imageFraming, setImageFraming] = useState({});
  const [editingImage, setEditingImage] = useState(null); // currently selected image key
  const [framingMode, setFramingMode] = useState(false);
  const [miniPanelPosition, setMiniPanelPosition] = useState('bottom-right'); // top-left, top-right, bottom-left, bottom-right
  
  // Load image framing from localStorage
  useEffect(() => {
    if (!storageAvailable) return;
    try {
      const saved = localStorage.getItem(IMAGE_FRAMING_KEY);
      if (saved) setImageFraming(sanitizeStateObj(JSON.parse(saved)));
      const pos = localStorage.getItem('ww-mini-panel-pos');
      if (pos) setMiniPanelPosition(pos);
    } catch {}
  }, []);
  
  // Save image framing
  const saveImageFraming = (key, settings) => {
    const newFraming = { ...imageFraming, [key]: settings };
    setImageFraming(newFraming);
    if (storageAvailable) {
      try { localStorage.setItem(IMAGE_FRAMING_KEY, JSON.stringify(newFraming)); } catch {}
    }
  };
  
  // Get framing for an image (returns user override → hardcoded default → base default)
  const defaultFraming = useMemo(() => ({ x: 0, y: 0, zoom: 100 }), []);
  const DEFAULT_IMAGE_FRAMING = useMemo(() => ({
    // Collection framing
    'collection-Jiyan': { x: 8, y: -24, zoom: 250 },
    'collection-Calcharo': { x: -2, y: -26, zoom: 220 },
    'collection-Encore': { x: -2, y: -20, zoom: 150 },
    'collection-Jianxin': { x: 2, y: -24, zoom: 210 },
    'collection-Lingyang': { x: -2, y: -18, zoom: 150 },
    'collection-Verina': { x: 0, y: -14, zoom: 250 },
    'collection-Yinlin': { x: 2, y: -26, zoom: 210 },
    'collection-Changli': { x: 6, y: -26, zoom: 210 },
    'collection-Jinhsi': { x: 2, y: -28, zoom: 190 },
    'collection-Shorekeeper': { x: 12, y: -22, zoom: 210 },
    'collection-Camellya': { x: 0, y: -28, zoom: 190 },
    'collection-Xiangli Yao': { x: -4, y: -16, zoom: 300 },
    'collection-Zhezhi': { x: -2, y: -14, zoom: 230 },
    'collection-Carlotta': { x: 2, y: -28, zoom: 210 },
    'collection-Roccia': { x: 8, y: -4, zoom: 210 },
    'collection-Phoebe': { x: 10, y: -26, zoom: 190 },
    'collection-Brant': { x: -2, y: -26, zoom: 250 },
    'collection-Cantarella': { x: -2, y: -20, zoom: 230 },
    'collection-Zani': { x: 4, y: -26, zoom: 210 },
    'collection-Ciaccona': { x: 10, y: -24, zoom: 230 },
    'collection-Cartethyia': { x: -4, y: -26, zoom: 210 },
    'collection-Lupa': { x: 0, y: -12, zoom: 210 },
    'collection-Augusta': { x: 4, y: -30, zoom: 240 },
    'collection-Galbrena': { x: 14, y: -24, zoom: 230 },
    'collection-Iuno': { x: -2, y: -24, zoom: 190 },
    'collection-Luuk Herssen': { x: 2, y: 0, zoom: 120 },
    'collection-Aemeath': { x: -14, y: -20, zoom: 190 },
    'collection-Mornye': { x: 4, y: -20, zoom: 170 },
    'collection-Rover': { x: 24, y: -24, zoom: 230 },
    'collection-Chisa': { x: -6, y: -20, zoom: 230 },
    'collection-Phrolova': { x: 0, y: -28, zoom: 210 },
    'collection-Qiuyuan': { x: -8, y: -26, zoom: 220 },
    'collection-Lynae': { x: -12, y: -28, zoom: 190 },
    'collection-Sigrika': { x: 2, y: -26, zoom: 180 },
    'collection-Solsworn Ciphers': { x: 2, y: -2, zoom: 100 },
    'collection-Blazing Justice': { x: 0, y: 0, zoom: 100 },
    // 4★ Resonators
    'collection-Aalto': { x: 4, y: -24, zoom: 210 },
    'collection-Baizhi': { x: -2, y: -12, zoom: 250 },
    'collection-Chixia': { x: -4, y: -26, zoom: 190 },
    'collection-Danjin': { x: -4, y: -24, zoom: 190 },
    'collection-Yangyang': { x: -4, y: -16, zoom: 250 },
    'collection-Sanhua': { x: 12, y: -26, zoom: 190 },
    'collection-Taoqi': { x: 4, y: -26, zoom: 190 },
    'collection-Yuanwu': { x: 2, y: -24, zoom: 210 },
    'collection-Mortefi': { x: -2, y: -28, zoom: 210 },
    'collection-Youhu': { x: 0, y: -24, zoom: 160 },
    'collection-Lumi': { x: 0, y: -24, zoom: 170 },
    'collection-Buling': { x: 0, y: -22, zoom: 170 },
    // Team card framing
    'team-Jiyan': { x: 6, y: -18, zoom: 260 },
    'team-Calcharo': { x: 0, y: -20, zoom: 230 },
    'team-Rover': { x: 24, y: -16, zoom: 240 },
    'team-Encore': { x: 0, y: -14, zoom: 150 },
    'team-Jianxin': { x: 2, y: -18, zoom: 180 },
    'team-Lingyang': { x: -4, y: -12, zoom: 160 },
    'team-Sanhua': { x: 12, y: -22, zoom: 170 },
    'team-Verina': { x: 0, y: -8, zoom: 250 },
    'team-Jinhsi': { x: 0, y: -22, zoom: 160 },
    'team-Yinlin': { x: 2, y: -22, zoom: 170 },
    'team-Changli': { x: 8, y: -20, zoom: 160 },
    'team-Mortefi': { x: -2, y: -24, zoom: 180 },
    'team-Shorekeeper': { x: 12, y: -18, zoom: 180 },
    'team-Zhezhi': { x: -2, y: -10, zoom: 200 },
    'team-Xiangli Yao': { x: -4, y: -10, zoom: 300 },
    'team-Camellya': { x: 0, y: -22, zoom: 170 },
    'team-Carlotta': { x: 0, y: -20, zoom: 170 },
    'team-Roccia': { x: 8, y: 0, zoom: 180 },
    'team-Phoebe': { x: 12, y: -20, zoom: 170 },
    'team-Brant': { x: -2, y: -18, zoom: 190 },
    'team-Cantarella': { x: 0, y: -16, zoom: 220 },
    'team-Zani': { x: 6, y: -26, zoom: 200 },
    'team-Ciaccona': { x: 10, y: -20, zoom: 190 },
    'team-Cartethyia': { x: 0, y: -22, zoom: 170 },
    'team-Lupa': { x: 4, y: -8, zoom: 210 },
    'team-Phrolova': { x: 2, y: -24, zoom: 170 },
    'team-Augusta': { x: 4, y: -22, zoom: 180 },
    'team-Iuno': { x: 0, y: -16, zoom: 200 },
    'team-Galbrena': { x: 16, y: -20, zoom: 200 },
    'team-Qiuyuan': { x: -8, y: -26, zoom: 200 },
    'team-Chisa': { x: -4, y: -20, zoom: 230 },
    'team-Lynae': { x: -10, y: -22, zoom: 160 },
    'team-Luuk Herssen': { x: 2, y: 4, zoom: 130 },
    'team-Aemeath': { x: -12, y: -16, zoom: 170 },
    'team-Sigrika': { x: 4, y: -20, zoom: 160 },
    'team-Aalto': { x: 6, y: -20, zoom: 190 },
    'team-Baizhi': { x: -2, y: -6, zoom: 220 },
    'team-Chixia': { x: -6, y: -24, zoom: 180 },
    'team-Danjin': { x: 0, y: -22, zoom: 180 },
    'team-Yangyang': { x: -4, y: -12, zoom: 270 },
    'team-Taoqi': { x: 6, y: -20, zoom: 180 },
    'team-Yuanwu': { x: 2, y: -22, zoom: 190 },
    'team-Youhu': { x: 2, y: -14, zoom: 130 },
    'team-Lumi': { x: 0, y: -22, zoom: 170 },
    'team-Buling': { x: 0, y: -18, zoom: 150 },
    'team-Mornye': { x: 4, y: -20, zoom: 170 },
    'team-Solsworn Ciphers': { x: 2, y: -2, zoom: 100 },
    'team-Blazing Justice': { x: 0, y: 0, zoom: 100 },
    // Info panel framing
    'info-Encore': { x: -8, y: -50, zoom: 170 },
    'info-Lingyang': { x: -14, y: -50, zoom: 170 },
    'info-Calcharo': { x: -24, y: -68, zoom: 250 },
    'info-Aemeath': { x: -26, y: -60, zoom: 230 },
    'info-Lynae': { x: -14, y: -62, zoom: 210 },
    'info-Sigrika': { x: -8, y: -60, zoom: 210 },
    'info-Chisa': { x: -30, y: -66, zoom: 230 },
    'info-Iuno': { x: -18, y: -56, zoom: 190 },
    'info-Augusta': { x: -12, y: -64, zoom: 250 },
    'info-Ciaccona': { x: 0, y: -60, zoom: 250 },
    'info-Zani': { x: -8, y: -64, zoom: 250 },
    'info-Cantarella': { x: -22, y: -58, zoom: 270 },
    'info-Phoebe': { x: 8, y: -56, zoom: 210 },
    'info-Verina': { x: -24, y: -50, zoom: 230 },
    'info-Xiangli Yao': { x: -36, y: -58, zoom: 300 },
    'info-Jiyan': { x: -18, y: -68, zoom: 270 },
    'info-Yinlin': { x: 0, y: -60, zoom: 230 },
    'info-Jinhsi': { x: -6, y: -62, zoom: 210 },
    'info-Shorekeeper': { x: 8, y: -58, zoom: 250 },
    'info-Camellya': { x: -4, y: -64, zoom: 230 },
    'info-Changli': { x: -4, y: -62, zoom: 230 },
    'info-Zhezhi': { x: -22, y: -52, zoom: 270 },
    'info-Carlotta': { x: -10, y: -60, zoom: 210 },
    'info-Roccia': { x: -4, y: -42, zoom: 250 },
    'info-Brant': { x: -20, y: -64, zoom: 290 },
    'info-Cartethyia': { x: -10, y: -64, zoom: 230 },
    'info-Lupa': { x: -20, y: -52, zoom: 250 },
    'info-Phrolova': { x: -8, y: -66, zoom: 230 },
    'info-Galbrena': { x: 4, y: -62, zoom: 270 },
    'info-Qiuyuan': { x: -20, y: -64, zoom: 250 },
    'info-Mornye': { x: 0, y: -52, zoom: 190 },
    'info-Luuk Herssen': { x: 0, y: -24, zoom: 120 },
    'info-Jianxin': { x: -2, y: -58, zoom: 230 },
    'info-Taoqi': { x: -8, y: -60, zoom: 210 },
    'info-Baizhi': { x: -20, y: -48, zoom: 270 },
    'info-Aalto': { x: 2, y: -62, zoom: 250 },
    'info-Lumi': { x: 8, y: -60, zoom: 200 },
    'info-Mortefi': { x: -16, y: -66, zoom: 250 },
    'info-Yangyang': { x: -32, y: -56, zoom: 250 },
    'info-Chixia': { x: -8, y: -64, zoom: 230 },
    'info-Youhu': { x: 2, y: -58, zoom: 190 },
    'info-Yuanwu': { x: -12, y: -66, zoom: 270 },
    'info-Danjin': { x: -14, y: -64, zoom: 250 },
    'info-Sanhua': { x: 6, y: -68, zoom: 250 },
    'info-Buling': { x: 0, y: -64, zoom: 230 },
  }), []);
  const getImageFraming = useCallback((key) => {
    return imageFraming[key] || DEFAULT_IMAGE_FRAMING[key] || defaultFraming;
  }, [imageFraming, DEFAULT_IMAGE_FRAMING, defaultFraming]);
  
  // Update framing for currently editing image
  const updateEditingFraming = (changes) => {
    if (!editingImage) return;
    const current = getImageFraming(editingImage);
    const newFraming = { ...current, ...changes };
    // Clamp values - larger range for better control
    newFraming.x = Math.max(-100, Math.min(100, newFraming.x));
    newFraming.y = Math.max(-100, Math.min(100, newFraming.y));
    newFraming.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newFraming.zoom));
    saveImageFraming(editingImage, newFraming);
  };
  
  const resetEditingFraming = () => {
    if (!editingImage) return;
    saveImageFraming(editingImage, { x: 0, y: 0, zoom: 100 });
  };
  
  const saveMiniPanelPosition = (pos) => {
    setMiniPanelPosition(pos);
    if (storageAvailable) {
      try { localStorage.setItem('ww-mini-panel-pos', pos); } catch {}
    }
  };
  
  // Get position classes for mini panel
  const getMiniPanelPositionClasses = () => {
    switch (miniPanelPosition) {
      case 'top-left': return 'top-16 left-2';
      case 'top-right': return 'top-16 right-2';
      case 'bottom-left': return 'bottom-20 left-2';
      default: return 'bottom-20 right-2';
    }
  };
  
  // Default character/weapon images (built-in)
  
  // Collection sort state
  const [collectionSort, setCollectionSort] = useState('copies'); // 'copies' or 'release'
  
  // Collection filter states
  const [collectionSearch, setCollectionSearch] = useState('');
  const [collectionCategoryFilter, setCollectionCategoryFilter] = useState('all'); // 'all', 'character', 'weapon'
  const [collectionWeaponFilter, setCollectionWeaponFilter] = useState('all'); // 'all', 'Broadblade', 'Sword', etc.
  const [collectionElementFilter, setCollectionElementFilter] = useState('all'); // 'all', 'Aero', 'Glacio', etc.
  const [collectionStatFilter, setCollectionStatFilter] = useState('all'); // 'all', 'ATK', 'HP', 'DEF', 'Crit Rate', 'Crit DMG', 'Energy Regen'
  const [collectionDamageFilter, setCollectionDamageFilter] = useState('all'); // 'all', 'Basic ATK', 'Heavy ATK', 'Skill', 'Liberation', 'Echo', 'Coordinated'
  const [collectionRoleFilter, setCollectionRoleFilter] = useState('all'); // 'all', 'Main DPS', 'Sub DPS', 'Support', 'Healer'
  const [collectionEchoSetFilter, setCollectionEchoSetFilter] = useState('all'); // 'all' or sonata set name
  const [collectionEchoBuffFilter, setCollectionEchoBuffFilter] = useState('all'); // 'all' or buff type
  const [collectionView, setCollectionView] = useState('items'); // 'items' (characters), 'weapons', 'echoes'
  
  // Keyword tags for search matching (maps keywords to character/weapon properties)
  const getSearchTags = useCallback((name, isCharacter) => {
    const tags = [name.toLowerCase()];
    if (isCharacter) {
      const data = CHARACTER_DATA[name];
      if (data) {
        tags.push(data.element?.toLowerCase());
        if (data.elements) data.elements.forEach(e => tags.push(e.toLowerCase()));
        tags.push(data.weapon?.toLowerCase());
        tags.push(data.role?.toLowerCase());
        // Role aliases
        if (data.role === 'Main DPS' || data.role === 'Sub DPS') tags.push('dps');
        if (data.role === 'Healer') tags.push('heal', 'healing');
        if (data.role === 'Support') tags.push('buff', 'buffer', 'utility');
        if (data.role === 'Sub DPS') tags.push('sub', 'off-field', 'coordinated');
        // Desc keywords
        if (data.desc) tags.push(data.desc.toLowerCase());
        // Damage focus tags
        if (data.damageFocus) data.damageFocus.forEach(d => tags.push(d.toLowerCase()));
        // Stat scaling
        if (data.statScaling) tags.push(data.statScaling.toLowerCase(), data.statScaling.toLowerCase() + ' scaling');
        // Buff-related tags from CHAR_BUFF_TABLE
        const buffs = CHAR_BUFF_TABLE[name];
        if (buffs) {
          const allBuffs = [...(buffs.outroBuffs || []), ...(buffs.libBuffs || []), ...(buffs.selfBuffs || [])];
          allBuffs.forEach(b => {
            if (b.stat) tags.push(b.stat.toLowerCase());
            if (b.stat === 'basicDmg') tags.push('basic atk', 'basic attack');
            if (b.stat === 'heavyDmg') tags.push('heavy atk', 'heavy attack', 'charged');
            if (b.stat === 'libDmg') tags.push('liberation');
            if (b.stat === 'echoDmg') tags.push('echo');
            if (b.stat === 'skillDmg') tags.push('skill');
            if (b.stat === 'coordDmg') tags.push('coordinated');
            if (b.stat === 'deepen') tags.push('deepen', 'buff');
            if (b.stat === 'atkPct') tags.push('atk', 'buff');
            if (b.stat === 'critRate' || b.stat === 'critDmg') tags.push('crit', 'buff');
            if (b.stat === 'resShred' || b.stat === 'defShred') tags.push('shred', 'debuff');
          });
          if (buffs.debuffs?.length) tags.push('debuff', 'shred');
        }
      }
    } else {
      const data = WEAPON_DATA[name];
      if (data) {
        tags.push(data.type?.toLowerCase());
        tags.push(data.stat?.toLowerCase());
        if (data.desc) tags.push(data.desc.toLowerCase());
        if (data.stat === 'Crit Rate') tags.push('crit');
        if (data.stat === 'Crit DMG') tags.push('crit');
        if (data.stat === 'ATK%') tags.push('atk', 'attack');
        if (data.stat === 'HP%') tags.push('hp', 'health');
        if (data.stat === 'DEF%') tags.push('def', 'defense');
        if (data.stat === 'Energy Regen') tags.push('energy', 'er');
        if (data.bestFor) data.bestFor.forEach(c => tags.push(c.toLowerCase()));
      }
    }
    return tags.join(' ');
  }, []);

  // Damage type matching for characters using damageFocus field
  const charMatchesDamage = useCallback((name, damageType) => {
    const data = CHARACTER_DATA[name];
    const focus = data?.dmgFocus;
    if (!focus) return false;
    const mapping = {
      'Basic ATK': 'Basic ATK',
      'Heavy ATK': 'Heavy ATK',
      'Skill': 'Skill',
      'Liberation': 'Liberation',
      'Echo': 'Echo',
      'Coordinated': 'Coordinated ATK',
    };
    return focus.includes(mapping[damageType] || damageType);
  }, []);

  // Stat matching for characters using statScaling field, and weapons using sub stat
  const charMatchesStat = useCallback((name, statType) => {
    const data = CHARACTER_DATA[name];
    if (!data || !data.statScaling) return false;
    return data.statScaling === statType;
  }, []);

  // Filter function for collection items
  const filterCollectionItems = useCallback((items, countsObj, isCharacter = true) => {
    return items.filter(name => {
      // Category filter
      if (collectionCategoryFilter === 'character' && !isCharacter) return false;
      if (collectionCategoryFilter === 'weapon' && isCharacter) return false;

      // Search filter (keyword-based)
      if (collectionSearch) {
        const searchLower = collectionSearch.toLowerCase();
        const searchTags = getSearchTags(name, isCharacter);
        if (!searchTags.includes(searchLower)) return false;
      }

      // Element filter (characters only)
      if (isCharacter) {
        const data = CHARACTER_DATA[name];
        if (data) {
          if (collectionElementFilter !== 'all' && data.element !== collectionElementFilter) return false;
          if (collectionWeaponFilter !== 'all' && data.weapon !== collectionWeaponFilter) return false;
          if (collectionRoleFilter !== 'all' && data.role !== collectionRoleFilter) return false;
          if (collectionStatFilter !== 'all' && !charMatchesStat(name, collectionStatFilter)) return false;
          if (collectionDamageFilter !== 'all' && !charMatchesDamage(name, collectionDamageFilter)) return false;
        }
      } else {
        const data = WEAPON_DATA[name];
        if (data) {
          if (collectionWeaponFilter !== 'all' && data.type !== collectionWeaponFilter) return false;
          if (collectionStatFilter !== 'all' && data.stat !== collectionStatFilter) return false;
        }
      }

      return true;
    });
  }, [collectionSearch, collectionCategoryFilter, collectionElementFilter, collectionWeaponFilter, collectionStatFilter, collectionDamageFilter, collectionRoleFilter, getSearchTags, charMatchesStat, charMatchesDamage]);
  
  // Clear all filters
  const clearCollectionFilters = useCallback(() => {
    setCollectionSearch('');
    setCollectionCategoryFilter('all');
    setCollectionWeaponFilter('all');
    setCollectionElementFilter('all');
    setCollectionStatFilter('all');
    setCollectionDamageFilter('all');
    setCollectionRoleFilter('all');
    setCollectionEchoSetFilter('all');
    setCollectionEchoBuffFilter('all');
  }, []);

  // Filter echoes by set and buff
  const filterEchoes = useCallback((echoNames) => {
    return echoNames.filter(name => {
      if (collectionSearch && !name.toLowerCase().includes(collectionSearch.toLowerCase())) return false;
      const data = ECHO_DATA[name];
      if (!data) return true; // no data → show it
      if (collectionEchoSetFilter !== 'all' && !data.sets.includes(collectionEchoSetFilter)) return false;
      if (collectionEchoBuffFilter !== 'all' && !(Array.isArray(data.buff) ? data.buff.includes(collectionEchoBuffFilter) : data.buff === collectionEchoBuffFilter)) return false;
      return true;
    });
  }, [collectionSearch, collectionEchoSetFilter, collectionEchoBuffFilter]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() =>
    !!(collectionSearch || collectionCategoryFilter !== 'all' || collectionElementFilter !== 'all' || collectionWeaponFilter !== 'all' || collectionStatFilter !== 'all' || collectionDamageFilter !== 'all' || collectionRoleFilter !== 'all' || collectionEchoSetFilter !== 'all' || collectionEchoBuffFilter !== 'all'),
    [collectionSearch, collectionCategoryFilter, collectionElementFilter, collectionWeaponFilter, collectionStatFilter, collectionDamageFilter, collectionRoleFilter, collectionEchoSetFilter, collectionEchoBuffFilter]
  );
  
  // Cache-busting for images (version-based, only refreshes on manual refresh)
  // Initial value is an arbitrary version token; replaced with Date.now() on manual refresh
  const [imageCacheBuster, setImageCacheBuster] = useState('v3.2.2');
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
  
  // Collection images storage (merges with defaults)
  const COLLECTION_IMAGES_KEY = 'whispering-wishes-collection-images';
  const [customCollectionImages, setCustomCollectionImages] = useState(() => {
    if (!storageAvailable) return {};
    try {
      const saved = localStorage.getItem(COLLECTION_IMAGES_KEY);
      if (!saved) return {};
      const raw = JSON.parse(saved);
      // P15-FIX: MEDIUM-3 — Validate URLs: HTTPS-only + domain allowlist to prevent tracking/SSRF
      const safe = {};
      for (const [k, v] of Object.entries(raw)) {
        if (typeof v === 'string' && /^https:\/\//i.test(v)) {
          try {
            const host = new URL(v).hostname;
            if (ALLOWED_IMAGE_HOSTS.some(d => host === d || host.endsWith('.' + d))) safe[k] = v;
          } catch { /* invalid URL, skip */ }
        }
      }
      return safe;
    } catch { return {}; }
  });
  
  // Merged collection images (custom overrides defaults)
  const collectionImages = useMemo(() => ({ ...DEFAULT_COLLECTION_IMAGES, ...customCollectionImages }), [customCollectionImages]);
  
  const saveCollectionImagesDebounced = useRef(null);
  const saveCollectionImages = (newImages) => {
    setCustomCollectionImages(newImages);
    if (!storageAvailable) return;
    clearTimeout(saveCollectionImagesDebounced.current);
    saveCollectionImagesDebounced.current = setTimeout(() => { // P7-FIX: Debounce localStorage writes (7B)
      try { localStorage.setItem(COLLECTION_IMAGES_KEY, JSON.stringify(newImages)); } catch {}
    }, DEBOUNCE_MS)
  };
  useEffect(() => {
    return () => { if (saveCollectionImagesDebounced.current) clearTimeout(saveCollectionImagesDebounced.current); };
  }, []);

  // Admin password — only the app owner can access admin (hash defined at module level)
  
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
  }, []); // P14-FIX: LOW-3 — Removed dead eslint-disable comment (no ESLint configured)

  // Save state to storage whenever it changes (debounced to avoid jank from rapid state changes)
  // P9-FIX: Debounce saveToStorage to prevent synchronous JSON.stringify jank (Step 4 audit)
  const saveTimerRef = useRef(null);
  const saveFailCountRef = useRef(0); // P12-FIX: Track consecutive save failures to avoid toast spam (Step 14 — MEDIUM-10a)
  useEffect(() => {
    if (!storageLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const success = saveToStorage(state);
      if (!success) {
        saveFailCountRef.current++;
        // Only show toast on first failure (avoid spamming on every state change)
        if (saveFailCountRef.current === 1) {
          toast?.addToast?.('Storage full — data may not be saved. Try clearing old Convene history.', 'error');
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
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current));
        } catch {}
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);
  
  // P12-FIX: Cross-tab synchronization — reload state when another tab writes to localStorage (Step 14 audit — MEDIUM-10b)
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
  }, []); // P14-FIX: LOW-3 — Removed dead eslint-disable comment (no ESLint configured)
  const [activeTab, setActiveTabRaw] = useState('tracker');
  const tabNavRef = useRef(null);
  // Team builder state (hoisted to satisfy Rules of Hooks)
  const [teamSelectorOpen, setTeamSelectorOpen] = useState(false);
  const [teamSelectorSlot, setTeamSelectorSlot] = useState(0);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamElementFilter, setTeamElementFilter] = useState('all');
  const [teamRarityFilter, setTeamRarityFilter] = useState('all');
  const [teamBuffFilter, setTeamBuffFilter] = useState('all');
  const [teamDebuffFilter, setTeamDebuffFilter] = useState('all');
  const [teamDmgFilter, setTeamDmgFilter] = useState('all');
  const [teamCompareEntries, setTeamCompareEntries] = useState([]); // [{slots: [name,name,name], damageScore, members, mainDpsName}]
  const [teamEquipment, setTeamEquipment] = useState(() => {
    try { const s = localStorage.getItem('ww-team-equipment'); return s ? JSON.parse(s) : {}; } catch { return {}; }
  }); // { "teamIdx:charName": { weapon: "name"|null, echoes: [null,null,null,null,null] } }
  const [weaponSelectorOpen, setWeaponSelectorOpen] = useState(false);
  const [weaponSelectorTarget, setWeaponSelectorTarget] = useState({ teamIdx: 0, charName: '' });
  const [weaponSearch, setWeaponSearch] = useState('');
  const setActiveTab = useCallback((tab) => {
    setActiveTabRaw(tab);
    window.scrollTo({ top: 0 });
  }, []);
  
  // Swipe navigation between tabs
  const swipeRef = useRef({ startX: 0, startY: 0, startTime: 0 });
  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  
  useEffect(() => {
    if (!visualSettings.swipeNavigation) return;
    
    const handleTouchStart = (e) => {
      // P10-FIX: Don't capture swipes starting inside horizontally scrollable containers (Step 10 audit — MEDIUM-5j)
      let el = e.target;
      while (el && el !== document.body) {
        if (el.scrollWidth > el.clientWidth && (getComputedStyle(el).overflowX === 'auto' || getComputedStyle(el).overflowX === 'scroll')) {
          swipeRef.current = { startX: 0, startY: 0, startTime: 0, ignore: true };
          return;
        }
        el = el.parentElement;
      }
      // Exclude swipes starting near screen edges to avoid conflicting with OS back/forward gestures
      const touchX = e.touches[0].clientX;
      if (touchX < 20 || touchX > window.innerWidth - 20) {
        swipeRef.current = { startX: 0, startY: 0, startTime: 0, ignore: true };
        return;
      }
      swipeRef.current = {
        startX: touchX,
        startY: e.touches[0].clientY,
        startTime: Date.now(),
        ignore: false
      };
    };
    
    const handleTouchEnd = (e) => {
      if (swipeRef.current.ignore) return;
      const { startX, startY, startTime } = swipeRef.current;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;
      
      // Must be horizontal swipe (more X than Y movement)
      // Must be fast enough (under 300ms) and long enough (over 50px)
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 1.5;
      const isFastEnough = deltaTime < 300;
      const isLongEnough = Math.abs(deltaX) > 50;
      
      if (isHorizontalSwipe && isFastEnough && isLongEnough) {
        const currentIndex = TAB_ORDER.indexOf(activeTabRef.current);
        if (deltaX < 0 && currentIndex < TAB_ORDER.length - 1) {
          // Swipe left → next tab
          haptic.medium();
          setActiveTab(TAB_ORDER[currentIndex + 1]);
        } else if (deltaX > 0 && currentIndex > 0) {
          // Swipe right → previous tab
          haptic.medium();
          setActiveTab(TAB_ORDER[currentIndex - 1]);
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [visualSettings.swipeNavigation, setActiveTab]);
  
  const [trackerCategory, setTrackerCategory] = useState('character');
  const [importPlatform, setImportPlatform] = useState(null);
  const [importMethod, setImportMethod] = useState('file'); // 'file' or 'paste'
  const [isDragOver, setIsDragOver] = useState(false); // P8-FIX: MED — drag-and-drop state
  const [importStatus, setImportStatus] = useState(null); // D-STATE-2: { fileName, fileSize } during import
  const [pasteJsonText, setPasteJsonText] = useState('');
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [idCardFormat, setIdCardFormat] = useState('landscape'); // 'landscape' (16:9) or 'portrait' (9:16)
  const [bookmarkName, setBookmarkName] = useState('');
  const [showIncomePanel, setShowIncomePanel] = useState(false);
  const [chartRange, setChartRange] = useState('monthly');
  const [chartOffset, setChartOffset] = useState(9999);
  const [detailModal, setDetailModal] = useState({ show: false, type: null, name: null, imageUrl: null, framing: null });
  
  // Anonymous Luck Leaderboard
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedTrophy, setSelectedTrophy] = useState(null);
  const [leaderboardConsented, setLeaderboardConsented] = useState(() => {
    try { return localStorage.getItem('ww-leaderboard-consent') === 'true'; } catch { return false; }
  });
  // P13-FIX: MEDIUM-4 — Custom consent modal instead of window.confirm (accessible, stylable, screen-reader friendly)
  const [showConsentModal, setShowConsentModal] = useState(false);
  const consentResolveRef = useRef(null);

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardSubmitting, setLeaderboardSubmitting] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState('rankings'); // 'rankings' or 'popular'
  const [communityPulls, setCommunityPulls] = useState(null);
  const [userLeaderboardId] = useState(() => {
    if (!storageAvailable) return null;
    try {
      let id = localStorage.getItem('ww-leaderboard-id');
      if (!id) {
        // 5.2 fix: CSPRNG for leaderboard ID (Math.random is predictable)
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
      // Storage failed — generate session-stable ID (won't persist across refreshes)
      return null;
    }
  });

  // P8-FIX: Use in-game UID as primary leaderboard key so same player on web + Android = one entry
  // Falls back to random ID only if no import has been done yet
  // Sanitize UIDs for Firebase path safety — only allow alphanumeric, hyphens, underscores
  const sanitizeFirebaseKey = (key) => key ? key.replace(/[^a-zA-Z0-9_-]/g, '_') : key;
  const effectiveLeaderboardId = sanitizeFirebaseKey(state.profile.uid) || userLeaderboardId;

  // Pre-compute hashed UID for leaderboard "You" comparison (entry.uid is hashed, state.profile.uid is raw)
  const [hashedProfileUid, setHashedProfileUid] = useState(null);
  useEffect(() => {
    if (state.profile.uid) {
      hashUidForStorage(state.profile.uid).then(setHashedProfileUid);
    } else {
      setHashedProfileUid(null);
    }
  }, [state.profile.uid]);

  const setCalc = useCallback((f, v) => dispatch({ type: 'SET_CALC', field: f, value: v }), []);

  // 6.1 fix: Focus trapping for inline modals — Tab wraps within modal, auto-focus first element, restore on close
  const leaderboardTrapRef = useFocusTrap(showLeaderboard);
  const bookmarkTrapRef = useFocusTrap(showBookmarkModal);
  const exportTrapRef = useFocusTrap(showExportModal);
  const idCardTrapRef = useFocusTrap(showIdCard);
  const adminTrapRef = useFocusTrap(showAdminPanel && !adminMiniMode);
  const trophyTrapRef = useFocusTrap(!!selectedTrophy);

  // but heavy DP computation only fires 150ms after the last slider tick.
  // Prevents ~7MB array allocation × 60Hz during slider drag.
  // P15-FIX: MEDIUM-16 — Initial deferredCalc is null to defer first DP computation
  // until after first paint, preventing jank on calculator tab open.
  const [deferredCalc, setDeferredCalc] = useState(null);
  const calcDeferTimerRef = useRef(null);
  useEffect(() => {
    if (calcDeferTimerRef.current) clearTimeout(calcDeferTimerRef.current);
    calcDeferTimerRef.current = setTimeout(() => setDeferredCalc(state.calc), CALC_DEFER_MS);
    return () => { if (calcDeferTimerRef.current) clearTimeout(calcDeferTimerRef.current); };
  }, [state.calc]);

  // Use state.calc as fallback when deferredCalc is null (initial render before deferred computation fires)
  const effectiveCalc = deferredCalc || state.calc;

  // Smart astrite allocation for "Both" mode
  // P2-FIX: Uses deferredCalc so heavy DP isn't triggered on every slider tick
  const astriteAllocation = useMemo(() => {
    const totalAstrite = +effectiveCalc.astrite || 0;
    const totalPulls = Math.floor(totalAstrite / ASTRITE_PER_PULL);
    const radiant = +effectiveCalc.radiant || 0;
    const forging = +effectiveCalc.forging || 0;
    const lustrous = +effectiveCalc.lustrous || 0;

    if (effectiveCalc.selectedBanner !== 'both') {
      // Single banner mode - all resources go to that banner
      return {
        charAstritePulls: totalPulls,
        weapAstritePulls: totalPulls,
        charTotal: totalPulls + radiant,
        weapTotal: totalPulls + forging,
        stdCharTotal: totalPulls + lustrous,
        stdWeapTotal: totalPulls + lustrous,
        charPercent: 100,
        weapPercent: 100,
        stdCharLustrous: lustrous,
        stdWeapLustrous: lustrous,
      };
    }
    
    // "Both" mode - split resources based on priority (0-100)
    // 0 = all weapon, 50 = balanced, 100 = all char
    const featPriority = typeof effectiveCalc.allocPriority === 'number' ? effectiveCalc.allocPriority : 50;
    const stdPriority = typeof effectiveCalc.stdAllocPriority === 'number' ? effectiveCalc.stdAllocPriority : 50;
    const charPercent = featPriority;
    const weapPercent = 100 - featPriority;
    
    const charAstritePulls = Math.floor(totalPulls * (charPercent / 100));
    const weapAstritePulls = totalPulls - charAstritePulls;
    
    // Standard banners use their own independent priority
    const stdCharPercent = stdPriority;
    const stdCharLustrous = Math.floor(lustrous * (stdCharPercent / 100));
    const stdWeapLustrous = lustrous - stdCharLustrous;
    
    // Standard Astrite split uses standard priority
    const stdCharAstrite = Math.floor(totalPulls * (stdCharPercent / 100));
    const stdWeapAstrite = totalPulls - stdCharAstrite;
    
    return {
      charAstritePulls,
      weapAstritePulls,
      charTotal: charAstritePulls + radiant,
      weapTotal: weapAstritePulls + forging,
      stdCharTotal: stdCharAstrite + stdCharLustrous,
      stdWeapTotal: stdWeapAstrite + stdWeapLustrous,
      charPercent,
      weapPercent,
      stdCharLustrous,
      stdWeapLustrous,
    };
  }, [effectiveCalc.astrite, effectiveCalc.radiant, effectiveCalc.forging, effectiveCalc.lustrous, effectiveCalc.selectedBanner, effectiveCalc.allocPriority, effectiveCalc.stdAllocPriority]);

  // Calculate pulls for each banner type using allocation
  const { charTotal: charPulls, weapTotal: weapPulls, stdCharTotal: stdCharPulls, stdWeapTotal: stdWeapPulls } = astriteAllocation;
  
  // Calculate stats for each banner type
  // P2-FIX: Uses deferredCalc so DP arrays aren't allocated 60×/sec during slider drag
  const charStats = useMemo(() => deferredCalc ? calcStats(charPulls, effectiveCalc.charPity, effectiveCalc.charGuaranteed, true, effectiveCalc.charCopies) : null, [deferredCalc, charPulls, effectiveCalc.charPity, effectiveCalc.charGuaranteed, effectiveCalc.charCopies]);
  const weapStats = useMemo(() => deferredCalc ? calcStats(weapPulls, effectiveCalc.weapPity, false, false, effectiveCalc.weapCopies) : null, [deferredCalc, weapPulls, effectiveCalc.weapPity, effectiveCalc.weapCopies]);
  const stdCharStats = useMemo(() => deferredCalc ? calcStats(stdCharPulls, effectiveCalc.stdCharPity, false, false, effectiveCalc.stdCharCopies) : null, [deferredCalc, stdCharPulls, effectiveCalc.stdCharPity, effectiveCalc.stdCharCopies]);
  const stdWeapStats = useMemo(() => deferredCalc ? calcStats(stdWeapPulls, effectiveCalc.stdWeapPity, false, false, effectiveCalc.stdWeapCopies) : null, [deferredCalc, stdWeapPulls, effectiveCalc.stdWeapPity, effectiveCalc.stdWeapCopies]);

  // Combined stats for "Both" mode
  const combined = useMemo(() => {
    if (effectiveCalc.selectedBanner !== 'both') return null;
    if (!charStats || !weapStats || !stdCharStats || !stdWeapStats) return null;

    let charProb, weapProb;
    if (effectiveCalc.bannerCategory === 'featured') {
      charProb = (parseFloat(charStats.successRate) || 0) / 100;
      weapProb = (parseFloat(weapStats.successRate) || 0) / 100;
    } else {
      charProb = (parseFloat(stdCharStats.successRate) || 0) / 100;
      weapProb = (parseFloat(stdWeapStats.successRate) || 0) / 100;
    }

    return {
      both: (charProb * weapProb * 100).toFixed(1),
      atLeastOne: ((charProb + weapProb - charProb * weapProb) * 100).toFixed(1),
      charOnly: (charProb * (1 - weapProb) * 100).toFixed(1),
      weapOnly: (weapProb * (1 - charProb) * 100).toFixed(1),
      neither: ((1 - charProb) * (1 - weapProb) * 100).toFixed(1),
    };
  }, [effectiveCalc.selectedBanner, effectiveCalc.bannerCategory, charStats, weapStats, stdCharStats, stdWeapStats]);

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
      // P14-FIX: NIT-2 — Use named constant for beginner banner pull cost
      totalAstrite: (all.length - beginnerHist.length) * ASTRITE_PER_PULL + beginnerHist.length * BEGINNER_ASTRITE_PER_PULL,
      fiveStars: fives.length, 
      won5050: won, 
      lost5050: lost, 
      winRate: (won + lost) > 0 ? ((won / (won + lost)) * 100).toFixed(1) : null, 
      avgPity
    };
  }, [state.profile.featured?.history, state.profile.weapon?.history, state.profile.standardChar?.history, state.profile.standardWeap?.history, state.profile.beginner?.history]);
  
  // Leaderboard functions — Firebase Realtime Database (constants at module level)

  // Firebase Anonymous Auth — tries to get a token, returns '' if auth unavailable.
  // All Firebase requests work with or without auth (unauthenticated if token is empty).
  const firebaseAuthRef = useRef({ idToken: null, expiresAt: 0 });
  const getFirebaseAuth = useCallback(async () => {
    if (!FIREBASE_AVAILABLE) {
      console.warn('[WW] Firebase config missing — online features disabled.');
      return null;
    }
    const now = Date.now();
    if (firebaseAuthRef.current.idToken && firebaseAuthRef.current.expiresAt > now + 60000) {
      return firebaseAuthRef.current.idToken;
    }
    try {
      const res = await fetchWithTimeout(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: true })
      });
      if (!res.ok) throw new Error('Firebase auth failed');
      const data = await res.json();
      firebaseAuthRef.current = {
        idToken: data.idToken,
        expiresAt: now + (parseInt(data.expiresIn, 10) || 3600) * 1000
      };
      return data.idToken;
    } catch (e) {
      console.warn('Firebase anonymous auth failed:', e);
      return null;
    }
  }, []);

  // Helper: build Firebase URL with optional auth param
  const firebaseUrl = useCallback((path, authToken) => {
    const base = `${FIREBASE_DB}/${path}.json`;
    return authToken ? `${base}?auth=${authToken}` : base;
  }, []);
  
  const leaderboardLoadingRef = useRef(false);
  const loadLeaderboard = useCallback(async () => {
    if (leaderboardLoadingRef.current) return;
    leaderboardLoadingRef.current = true;
    setLeaderboardLoading(true);
    try {
      const authToken = await getFirebaseAuth();
      const res = await fetchWithTimeout(firebaseUrl('leaderboard', authToken));
      if (!res.ok) throw new Error(`Firebase read failed (${res.status})`);
      const data = await res.json();
      if (data) {
        const rawEntries = Object.values(data).filter(e => e && e.avgPity && e.id);
        // Deduplicate by uid, then by stats fingerprint
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
      } else {
        setAllLeaderboardEntries([]);
        setLeaderboardData([]);
      }
    } catch (e) {
      console.error('Leaderboard load error:', e);
      setAllLeaderboardEntries([]);
      setLeaderboardData([]);
    }
    setLeaderboardLoading(false);
    leaderboardLoadingRef.current = false;
  }, [getFirebaseAuth, firebaseUrl]);
  
  const loadCommunityPulls = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      const res = await fetchWithTimeout(firebaseUrl('community-pulls', authToken));
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
  }, [getFirebaseAuth, firebaseUrl]);

  const submittingRef = useRef(false);
  const submitToLeaderboard = useCallback(async () => {
    if (!effectiveLeaderboardId || !overallStats?.avgPity || overallStats.avgPity === '—') return;
    if (submittingRef.current) return; // prevent double-submit
    // P13-FIX: HIGH-2 — Rate limit leaderboard writes
    if (!checkFirebaseRateLimit('leaderboard-submit')) {
      toast?.addToast?.('Please wait a few seconds before submitting again', 'warning'); /* §E10-ER-F2 */
      return;
    }

    // P13-FIX: MEDIUM-4 — Require explicit consent via accessible custom modal before first submission
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
      // P13-FIX: HIGH-3 — Validate entry bounds before submission
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

      // Submit owned 5★ for community "Most Pulled" ranking
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
      // Clean up stale duplicate entries
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
  }, [effectiveLeaderboardId, userLeaderboardId, overallStats, state.profile, toast, loadLeaderboard, loadCommunityPulls, leaderboardConsented, getFirebaseAuth, firebaseUrl]);

  useEffect(() => {
    if (showLeaderboard) {
      loadLeaderboard();
      loadCommunityPulls();
    }
    // Note: AbortController not added here because loadLeaderboard/loadCommunityPulls
    // set state only on success paths and are guarded by showLeaderboard gate
  }, [showLeaderboard, loadLeaderboard, loadCommunityPulls]);

  // Anonymous presence system — writes only a timestamp (no personal data) to track active users
  const PRESENCE_INTERVAL_MS = 60000; // heartbeat every 60s
  const PRESENCE_TTL_MS = 120000; // consider offline after 2 minutes of no heartbeat
  
  const sendPresenceHeartbeat = useCallback(async () => {
    // P13-FIX: HIGH-2 — Rate limit presence writes (guard against runaway intervals)
    if (!checkFirebaseRateLimit('presence-heartbeat')) return;
    try {
      const authToken = await getFirebaseAuth();
      const res = await fetchWithTimeout(firebaseUrl(`presence/${presenceSessionId.current}`, authToken), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: Date.now() }) // only a timestamp — zero personal data
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        setPresenceError(`Heartbeat write failed (${res.status}). Add "presence" read/write rule in Firebase.${errText ? ' — ' + errText.slice(0, 80) : ''}`);
      } else {
        setPresenceError(null);
      }
    } catch (e) { setPresenceError(`Heartbeat error: ${e.message}`); }
  }, [getFirebaseAuth, firebaseUrl]);

  const removePresence = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      await fetchWithTimeout(firebaseUrl(`presence/${presenceSessionId.current}`, authToken), { method: 'DELETE' });
    } catch { /* best-effort */ }
  }, [getFirebaseAuth, firebaseUrl]);

  const fetchActivePlayersCount = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      const res = await fetchWithTimeout(firebaseUrl('presence', authToken));
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const now = Date.now();
          const activeSessions = Object.entries(data).filter(([, v]) => v?.t && (now - v.t) < PRESENCE_TTL_MS);
          // Clean up stale sessions from Firebase (older than TTL) — batch limit 50 (3.15 fix)
          const staleSessions = Object.entries(data).filter(([, v]) => !v?.t || (now - v.t) >= PRESENCE_TTL_MS);
          for (const [key] of staleSessions.slice(0, 50)) {
            try { await fetchWithTimeout(firebaseUrl(`presence/${key}`, authToken), { method: 'DELETE' }); } catch {}
          }
          const count = activeSessions.length;
          setActivePlayersCount(count);
          setPresenceError(null);
          setActivePlayersHistory(prev => {
            const next = [...prev, { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), count }];
            return next.slice(-30); // keep last 30 data points
          });
        } else {
          // No presence data exists yet — node may not have been created
          setActivePlayersCount(0);
          setPresenceError('No presence data in Firebase. Check that heartbeat writes are succeeding.');
        }
      } else {
        const errText = await res.text().catch(() => '');
        setPresenceError(`Read failed (${res.status}). Add "presence" read/write rule in Firebase.${errText ? ' — ' + errText.slice(0, 80) : ''}`);
      }
    } catch (e) { setPresenceError(`Fetch error: ${e.message}`); }
  }, [getFirebaseAuth, firebaseUrl]);

  // Admin-only: fetch full player list with unmasked UIDs from leaderboard
  const fetchAdminPlayerList = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      const res = await fetchWithTimeout(firebaseUrl('leaderboard', authToken));
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
          players.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // most recent first
          setAdminPlayerList(players);
        } else {
          setAdminPlayerList([]);
        }
      } else {
        setAdminPlayerList([]);
      }
    } catch (e) {
      console.error('Admin player list fetch error:', e);
      setAdminPlayerList([]); // Show empty state instead of perpetual loading skeleton
    }
  }, [getFirebaseAuth, firebaseUrl]);

  // Start heartbeat on mount, clean up on unmount
  useEffect(() => {
    sendPresenceHeartbeat(); // immediate first ping
    const interval = setInterval(sendPresenceHeartbeat, PRESENCE_INTERVAL_MS);
    // Note: on page close, the 2-min TTL handles cleanup naturally
    // (sendBeacon can't do DELETE, and beforeunload handlers are unreliable)
    return () => {
      clearInterval(interval);
      removePresence(); // works for SPA unmount / hot reload
    };
  }, [sendPresenceHeartbeat, removePresence]);

  // Fetch active count + player list when admin Players tab is open, refresh every 30s
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

  // Community stats aggregated from leaderboard entries
  // Community stats from ALL leaderboard entries (not just displayed top-20)
  const [allLeaderboardEntries, setAllLeaderboardEntries] = useState([]);
  const communityStats = useMemo(() => {
    if (!allLeaderboardEntries.length) return null;
    const entries = allLeaderboardEntries;
    const totalPlayers = entries.length;
    const avgPityAll = (entries.reduce((s, e) => s + e.avgPity, 0) / totalPlayers).toFixed(1);
    const totalFiveStars = entries.reduce((s, e) => s + (e.pulls ?? 0), 0);
    const totalPullsAll = entries.reduce((s, e) => s + (e.totalPulls ?? 0), 0);
    const totalWon = entries.reduce((s, e) => s + (e.won5050 ?? 0), 0);
    const totalLost = entries.reduce((s, e) => s + (e.lost5050 ?? 0), 0);
    const globalWinRate = (totalWon + totalLost) > 0 ? ((totalWon / (totalWon + totalLost)) * 100).toFixed(1) : null;
    const luckiest = entries.length > 0 ? entries.reduce((min, e) => e.avgPity < min.avgPity ? e : min) : null;
    const unluckiest = entries.length > 0 ? entries.reduce((max, e) => e.avgPity > max.avgPity ? e : max) : null;
    return { totalPlayers, avgPityAll, totalFiveStars, totalPullsAll, totalWon, totalLost, globalWinRate, luckiest, unluckiest };
  }, [allLeaderboardEntries]);

  // Trophies/Badges computation
  const trophies = useMemo(() => {
    if (!state.profile.importedAt) return null;
    
    const featuredHist = state.profile.featured?.history || [];
    const weaponHist = state.profile.weapon?.history || [];
    const stdCharHist = state.profile.standardChar?.history || [];
    const stdWeapHist = state.profile.standardWeap?.history || [];
    const allHistory = [...featuredHist, ...weaponHist, ...stdCharHist, ...stdWeapHist];
    
    // All 5★ pulls with pity
    const all5Stars = allHistory.filter(p => p.rarity === 5 && p.pity > 0);
    const featured5Stars = featuredHist.filter(p => p.rarity === 5);
    
    // Early 5★ (under 40 pity)
    const early5Star = all5Stars.some(p => p.pity <= 40);
    const earliest5Star = all5Stars.length > 0 ? Math.min(...all5Stars.map(p => p.pity)) : null;
    
    // 50/50 streaks
    let currentWinStreak = 0, currentLossStreak = 0, bestWinStreak = 0, worstLossStreak = 0;
    featured5Stars.forEach(p => {
      if (p.won5050 === true) {
        currentWinStreak++;
        currentLossStreak = 0;
        bestWinStreak = Math.max(bestWinStreak, currentWinStreak);
      } else if (p.won5050 === false) {
        currentLossStreak++;
        currentWinStreak = 0;
        worstLossStreak = Math.max(worstLossStreak, currentLossStreak);
      }
      // Guaranteed pulls (won5050 === null) don't affect streaks
    });
    
    // Current streak (most recent)
    let recentStreak = { type: null, count: 0 };
    for (let i = featured5Stars.length - 1; i >= 0; i--) {
      const p = featured5Stars[i];
      if (p.won5050 === null) continue; // Skip guaranteed
      if (recentStreak.type === null) {
        recentStreak.type = p.won5050 ? 'win' : 'loss';
        recentStreak.count = 1;
      } else if ((recentStreak.type === 'win' && p.won5050 === true) || (recentStreak.type === 'loss' && p.won5050 === false)) {
        recentStreak.count++;
      } else {
        break;
      }
    }
    
    // Collection counts
    const beginnerHistTr = state.profile.beginner?.history || [];
    const charHistory = [...featuredHist, ...stdCharHist, ...beginnerHistTr.filter(p => p.name && ALL_CHARACTERS.has(p.name))];
    const weapHistory = [...weaponHist, ...stdWeapHist, ...beginnerHistTr.filter(p => p.name && !ALL_CHARACTERS.has(p.name))];
    const owned5StarChars = new Set(charHistory.filter(p => p.rarity === 5 && p.name).map(p => p.name));
    const owned4StarChars = new Set(charHistory.filter(p => p.rarity === 4 && p.name).map(p => p.name));
    const owned5StarWeaps = new Set(weapHistory.filter(p => p.rarity === 5 && p.name).map(p => p.name));
    const owned4StarWeaps = new Set(weapHistory.filter(p => p.rarity === 4 && p.name).map(p => p.name));
    const owned3StarWeaps = new Set(weapHistory.filter(p => p.rarity === 3 && p.name).map(p => p.name));
    
    const all5ResOwned = ALL_5STAR_RESONATORS.every(name => owned5StarChars.has(name));
    const all4ResOwned = ALL_4STAR_RESONATORS.every(name => owned4StarChars.has(name));
    const all5WeapOwned = ALL_5STAR_WEAPONS.every(name => owned5StarWeaps.has(name));
    const all4WeapOwned = ALL_4STAR_WEAPONS.every(name => owned4StarWeaps.has(name));
    const all3WeapOwned = ALL_3STAR_WEAPONS.every(name => owned3StarWeaps.has(name));
    const allCollected = all5ResOwned && all4ResOwned && all5WeapOwned && all4WeapOwned && all3WeapOwned;
    
    // Total pulls
    const totalPulls = allHistory.length;
    const isWhale = totalPulls >= 1000;
    const isMegaWhale = totalPulls >= 2000;
    
    // Build trophy list — WuWa lore-themed names
    const list = [];
    
    // ═══ COLLECTION TROPHIES ═══
    if (allCollected) list.push({ id: 'all', name: 'No Life Achievement', desc: 'Every Resonator and Weapon collected. go outside.', icon: 'Crown', color: '#edaf18', tier: 'legendary' });
    if (all5ResOwned) list.push({ id: '5res', name: 'Gotta Whale \'Em All', desc: 'All 5★ Resonators unlocked', icon: 'Sparkles', color: '#edaf18', tier: 'gold' });
    if (all4ResOwned) list.push({ id: '4res', name: 'Sonata Effect', desc: 'All 4★ Resonators in your roster', icon: 'Heart', color: '#a855f7', tier: 'purple' });
    if (all5WeapOwned) list.push({ id: '5weap', name: 'Forgemaster', desc: 'All 5★ Weapons acquired', icon: 'Swords', color: '#ec4899', tier: 'gold' });
    if (all4WeapOwned) list.push({ id: '4weap', name: 'Armory of Jinzhou', desc: 'All 4★ Weapons in your arsenal', icon: 'Sword', color: '#a855f7', tier: 'purple' });
    if (all3WeapOwned) list.push({ id: '3weap', name: 'Data Bank: Full', desc: 'Every 3★ Weapon catalogued', icon: 'Shield', color: '#3b82f6', tier: 'blue' });
    
    // ═══ LUCK TROPHIES ═══
    if (earliest5Star === 1) list.push({ id: 'pity1', name: 'Pity 1. Screenshot or Fake.', desc: '5★ on the first Convene. nobody believes you', icon: 'Crown', color: '#edaf18', tier: 'legendary' });
    else if (earliest5Star && earliest5Star <= 10) list.push({ id: 'early10', name: 'Dev Account?', desc: `5★ at pity ${earliest5Star} — go buy a lottery ticket`, icon: 'Gift', color: '#edaf18', tier: 'legendary' });
    else if (earliest5Star && earliest5Star <= 20) list.push({ id: 'early20', name: 'Disgusting Luck', desc: `5★ at pity ${earliest5Star}`, icon: 'Zap', color: '#edaf18', tier: 'gold' });
    else if (earliest5Star && earliest5Star <= 40) list.push({ id: 'early40', name: 'Echo of Fortune', desc: `5★ at pity ${earliest5Star}`, icon: 'Clover', color: '#22c55e', tier: 'green' });
    
    // Hard pity — the unluckiest possible outcome
    const hitHardPity = all5Stars.some(p => p.pity >= HARD_PITY);
    if (hitHardPity) list.push({ id: 'hard80', name: 'Pity 80 Club', desc: 'Went the full distance. pain.', icon: 'Shield', color: '#6b7280', tier: 'gray' });
    
    // Soft pity zone specialist — majority of 5★ came from 65-79
    const softPityPulls = all5Stars.filter(p => p.pity >= 65 && p.pity < 80);
    if (softPityPulls.length >= 10) list.push({ id: 'softpro2', name: 'Soft Pity Landlord', desc: `${softPityPulls.length} five-stars from soft zone — you own property here`, icon: 'TrendingUp', color: '#ec4899', tier: 'pink' });
    else if (softPityPulls.length >= 5) list.push({ id: 'softpro', name: 'Soft Pity Merchant', desc: `${softPityPulls.length} five-stars from soft zone — never early, never late`, icon: 'TrendingUp', color: '#f97316', tier: 'orange' });
    
    // Back-to-back — two 5★ within 20 pulls across any banner
    const hasBackToBack = all5Stars.some(p => p.pity > 0 && p.pity <= 15);
    const backToBackCount = all5Stars.filter(p => p.pity > 0 && p.pity <= 15).length;
    if (backToBackCount >= 3) list.push({ id: 'b2b3', name: 'Actual Hack', desc: `${backToBackCount} five-stars within 15 Convenes — how`, icon: 'Zap', color: '#a855f7', tier: 'purple' });
    else if (hasBackToBack) list.push({ id: 'b2b', name: 'Back to Back', desc: '5★ within 15 Convenes of the last — flexing is permitted', icon: 'Zap', color: '#22c55e', tier: 'green' });
    
    // ═══ 50/50 STREAK TROPHIES ═══
    if (bestWinStreak >= 10) list.push({ id: 'win10', name: 'Rover\'s Blessing', desc: `${bestWinStreak}× 50/50 wins — the Sentinel chose you`, icon: 'Crown', color: '#ef4444', tier: 'legendary' });
    else if (bestWinStreak >= 7) list.push({ id: 'win7', name: 'Rigged (Positive)', desc: `${bestWinStreak}× 50/50 wins — actual witchcraft`, icon: 'Flame', color: '#edaf18', tier: 'legendary' });
    else if (bestWinStreak >= 5) list.push({ id: 'win5', name: 'Main Character Energy', desc: `${bestWinStreak}× 50/50 wins in a row`, icon: 'Flame', color: '#f97316', tier: 'orange' });
    else if (bestWinStreak >= 4) list.push({ id: 'win4', name: 'Resonance Chain', desc: `${bestWinStreak}× 50/50 wins in a row — keep the chain going`, icon: 'Flame', color: '#22c55e', tier: 'green' });
    else if (bestWinStreak >= 3) list.push({ id: 'win3', name: 'Casually Winning', desc: `${bestWinStreak}× 50/50 wins in a row`, icon: 'Target', color: '#22c55e', tier: 'green' });

    if (worstLossStreak >= 10) list.push({ id: 'loss10s', name: 'Lament Never Ended', desc: `${worstLossStreak}× 50/50 losses — the catastrophe hit your account`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
    else if (worstLossStreak >= 7) list.push({ id: 'loss7', name: 'Clinically Cursed', desc: `${worstLossStreak}× 50/50 losses — uninstall tbh`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
    else if (worstLossStreak >= 5) list.push({ id: 'loss5', name: 'Kuro Hates You', desc: `${worstLossStreak}× 50/50 losses in a row`, icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
    else if (worstLossStreak >= 4) list.push({ id: 'loss4', name: 'Waveworn', desc: `${worstLossStreak}× 50/50 losses in a row — eroded by RNG`, icon: 'TrendingDown', color: '#6b7280', tier: 'gray' });
    else if (worstLossStreak >= 3) list.push({ id: 'loss3', name: 'Skill Issue (Gacha)', desc: `${worstLossStreak}× 50/50 losses in a row`, icon: 'TrendingDown', color: '#6b7280', tier: 'gray' });
    
    // Won first ever 50/50
    const first5050 = featured5Stars.find(p => p.won5050 === true || p.won5050 === false);
    if (first5050 && first5050.won5050 === true) list.push({ id: 'first5050', name: 'Beginner\'s Luck', desc: 'Won your very first 50/50', icon: 'Clover', color: '#22c55e', tier: 'green' });
    
    // Redemption arc — lost 50/50 then won next one (look for loss→win pattern)
    let hasRedemption = false;
    for (let i = 0; i < featured5Stars.length - 1; i++) {
      if (featured5Stars[i].won5050 === false) {
        // Next non-guaranteed pull
        for (let j = i + 1; j < featured5Stars.length; j++) {
          if (featured5Stars[j].won5050 === null) continue;
          if (featured5Stars[j].won5050 === true) { hasRedemption = true; }
          break;
        }
      }
      if (hasRedemption) break;
    }
    if (hasRedemption) list.push({ id: 'redeem', name: 'Copium Rewarded', desc: 'Lost 50/50, then won the next — anime protagonist arc', icon: 'Heart', color: '#06b6d4', tier: 'cyan' });
    
    // ═══ MILESTONE TROPHIES ═══
    if (isMegaWhale) list.push({ id: 'mega', name: 'Mortgage Status', desc: '2000+ Convenes — seek financial advice', icon: 'Fish', color: '#06b6d4', tier: 'cyan' });
    else if (totalPulls >= 1500) list.push({ id: '1500', name: 'Astrite Overdose', desc: '1500+ Convenes — Kuro sends you a Christmas card', icon: 'Fish', color: '#06b6d4', tier: 'cyan' });
    else if (isWhale) list.push({ id: 'whale', name: 'Kuro Employee of the Month', desc: '1000+ Convenes — they know you by name', icon: 'Fish', color: '#06b6d4', tier: 'cyan' });
    else if (totalPulls >= 750) list.push({ id: '750', name: 'Terminal Stage', desc: '750+ Convenes — the Lament hit your wallet', icon: 'Fish', color: '#a855f7', tier: 'purple' });
    else if (totalPulls >= 500) list.push({ id: '500', name: 'Down the Rabbit Hole', desc: '500+ Convenes — no turning back', icon: 'Diamond', color: '#a855f7', tier: 'purple' });
    else if (totalPulls >= 300) list.push({ id: '300', name: 'Sunk Cost Fallacy', desc: '300+ Convenes — too deep to quit, too broke to continue', icon: 'Diamond', color: '#3b82f6', tier: 'blue' });
    else if (totalPulls >= 200) list.push({ id: '200', name: 'Rover\'s Allowance: Gone', desc: '200+ Convenes — emotionally and financially invested', icon: 'Gamepad2', color: '#3b82f6', tier: 'blue' });
    else if (totalPulls >= 100) list.push({ id: '100', name: 'First Steps', desc: '100+ Convenes', icon: 'Gamepad2', color: '#3b82f6', tier: 'blue' });
    
    // 5★ count milestones
    const total5Stars = all5Stars.length;
    if (total5Stars >= 100) list.push({ id: '100stars', name: 'Convene Printer Goes Brr', desc: `${total5Stars} five-stars obtained — you ARE the banner`, icon: 'Star', color: '#ef4444', tier: 'legendary' });
    else if (total5Stars >= 75) list.push({ id: '75stars', name: 'Resonance Overload', desc: `${total5Stars} five-stars obtained — Sonata Effect: maxed`, icon: 'Star', color: '#edaf18', tier: 'gold' });
    else if (total5Stars >= 50) list.push({ id: '50stars', name: 'Addicted', desc: `${total5Stars} five-stars obtained — this is a problem`, icon: 'Star', color: '#edaf18', tier: 'gold' });
    else if (total5Stars >= 35) list.push({ id: '35stars', name: 'Tacet Discord Hoarder', desc: `${total5Stars} five-stars obtained — your roster IS the Tacet Discord`, icon: 'Star', color: '#a855f7', tier: 'purple' });
    else if (total5Stars >= 25) list.push({ id: '25stars', name: 'Stargazer', desc: `${total5Stars} five-stars obtained`, icon: 'Star', color: '#a855f7', tier: 'purple' });
    else if (total5Stars >= 15) list.push({ id: '15stars', name: 'Sequence Node: Farming', desc: `${total5Stars} five-stars obtained — the grind is real`, icon: 'Star', color: '#3b82f6', tier: 'blue' });
    else if (total5Stars >= 10) list.push({ id: '10stars', name: 'Rising Star', desc: `${total5Stars} five-stars obtained`, icon: 'Star', color: '#3b82f6', tier: 'blue' });
    else if (total5Stars >= 5) list.push({ id: '5stars', name: 'First Expedition', desc: `${total5Stars} five-stars obtained — your team is forming`, icon: 'Star', color: '#22c55e', tier: 'green' });

    // First 5★
    if (total5Stars > 0 && total5Stars < 5) list.push({ id: 'first5', name: 'Awakening', desc: 'Obtained your first 5★', icon: 'Star', color: '#edaf18', tier: 'gold' });
    
    // Banner diversity — pulled on multiple banner types
    const bannerTypesUsed = [featuredHist, weaponHist, stdCharHist, stdWeapHist].filter(h => h.length > 0).length;
    if (bannerTypesUsed >= 4) list.push({ id: 'diverse', name: 'Pioneer Podcast', desc: 'Convened on all banner types', icon: 'Trophy', color: '#06b6d4', tier: 'cyan' });
    else if (bannerTypesUsed === 3) list.push({ id: 'diverse3', name: 'Pioneer Intern', desc: 'Pulled on 3 different banner types — almost a real Pioneer', icon: 'Trophy', color: '#3b82f6', tier: 'blue' });

    // ═══ CHARACTER OWNERSHIP PROGRESSION ═══
    const owned5Count = owned5StarChars.size;
    if (owned5Count >= 30) list.push({ id: 'own30', name: 'Huanglong\'s Census', desc: `${owned5Count} unique 5★ Resonators — Rover collected them all`, icon: 'Crown', color: '#edaf18', tier: 'legendary' });
    else if (owned5Count >= 25) list.push({ id: 'own25', name: 'Sonata Library: Full', desc: `${owned5Count} unique 5★ Resonators — you ARE the tier list`, icon: 'Crown', color: '#edaf18', tier: 'gold' });
    else if (owned5Count >= 20) list.push({ id: 'own20', name: 'Jinzhou Housing Crisis', desc: `${owned5Count} unique 5★ Resonators — where do they all sleep`, icon: 'Sparkles', color: '#a855f7', tier: 'purple' });
    else if (owned5Count >= 15) list.push({ id: 'own15', name: 'Forte Circuit Overload', desc: `${owned5Count} unique 5★ Resonators — too many builds to farm`, icon: 'Sparkles', color: '#a855f7', tier: 'purple' });
    else if (owned5Count >= 10) list.push({ id: 'own10', name: 'Union Level: Whale', desc: `${owned5Count} unique 5★ Resonators — the roster is stacked`, icon: 'Sparkles', color: '#3b82f6', tier: 'blue' });
    else if (owned5Count >= 5) list.push({ id: 'own5', name: 'First Expedition Team', desc: `${owned5Count} unique 5★ Resonators — your party is forming`, icon: 'Sparkles', color: '#22c55e', tier: 'green' });

    // ═══ WEAPON OWNERSHIP PROGRESSION ═══
    const owned5WeapCount = owned5StarWeaps.size;
    if (owned5WeapCount >= 20) list.push({ id: 'weap20', name: 'Forgery Domain Resident', desc: `${owned5WeapCount} unique 5★ Weapons — open a museum in Jinzhou`, icon: 'Swords', color: '#edaf18', tier: 'gold' });
    else if (owned5WeapCount >= 15) list.push({ id: 'weap15', name: 'Sonance Casket: Stuffed', desc: `${owned5WeapCount} unique 5★ Weapons — inventory management simulator`, icon: 'Swords', color: '#a855f7', tier: 'purple' });
    else if (owned5WeapCount >= 10) list.push({ id: 'weap10', name: 'Pioneer\'s Arsenal', desc: `${owned5WeapCount} unique 5★ Weapons — a blade for every occasion`, icon: 'Swords', color: '#3b82f6', tier: 'blue' });
    else if (owned5WeapCount >= 5) list.push({ id: 'weap5', name: 'Tacet Field Sweep', desc: `${owned5WeapCount} unique 5★ Weapons — the field has been cleared`, icon: 'Sword', color: '#22c55e', tier: 'green' });
    else if (owned5WeapCount >= 3) list.push({ id: 'weap3', name: 'First Forgery Run', desc: `${owned5WeapCount} unique 5★ Weapons — your collection begins`, icon: 'Sword', color: '#22c55e', tier: 'green' });

    // Max sequences — any character pulled 7+ times (S6)
    const charCounts = {};
    charHistory.filter(p => p.rarity === 5 && p.name).forEach(p => { charCounts[p.name] = (charCounts[p.name] ?? 0) + 1; });
    
    // Per-character S6 trophies — lore-themed names
    const s6Trophies = {
      'Jiyan': { name: 'Dragon Deez Nuts', desc: 'S6 Jiyan — 1.0 loyalty that costs more than rent', color: '#22c55e' },
      'Calcharo': { name: 'Sentence: S6', desc: 'S6 Calcharo — guilty of whaling in the first degree', color: '#a855f7' },
      'Encore': { name: 'Woolies World Domination', desc: 'S6 Encore — Cosmos and Cloudy run this account now', color: '#f97316' },
      'Jianxin': { name: 'Down Bad for Parry', desc: 'S6 Jianxin — "I\'ll take all the 50/50 losses" energy', color: '#22c55e' },
      'Lingyang': { name: 'You Actually S6\'d HIM?!', desc: 'S6 Lingyang — built different or brain different', color: '#38bdf8' },
      'Verina': { name: 'Lost 50/50 Seven Times', desc: 'S6 Verina — and every single one was a W', color: '#edaf18' },
      'Yinlin': { name: 'Down Catastrophic', desc: 'S6 Yinlin — she pulled your strings and your wallet', color: '#a855f7' },
      'Jinhsi': { name: 'Simp Magistrate', desc: 'S6 Jinhsi — sold Jinzhou to fund this', color: '#edaf18' },
      'Changli': { name: 'Touch Grass? Touch Fire.', desc: 'S6 Changli — your savings went up in flames', color: '#f97316' },
      'Zhezhi': { name: 'Drawing Bankruptcy', desc: 'S6 Zhezhi — her art costs more than actual art', color: '#38bdf8' },
      'Xiangli Yao': { name: 'He Did The Math (x7)', desc: 'S6 Xiangli Yao — calculated your savings into Hypercubes', color: '#a855f7' },
      'Shorekeeper': { name: 'She Protecc (x7)', desc: 'S6 Shorekeeper — your team cannot die. ever.', color: '#edaf18' },
      'Camellya': { name: 'Dislocated But Worth It', desc: 'S6 Camellya — thumbs broken, damage beautiful', color: '#ec4899' },
      'Carlotta': { name: 'Wallet? Frozen.', desc: 'S6 Carlotta — bank account colder than her kit', color: '#38bdf8' },
      'Roccia': { name: 'Hard Carried (Literally)', desc: 'S6 Roccia — Mamma mia...who\'s the clown now?', color: '#ec4899' },
      'Phoebe': { name: 'Feebi Chupi Supremacy', desc: 'S6 Phoebe — max power cheek pinch unlocked', color: '#edaf18' },
      'Brant': { name: 'Burned Through Savings', desc: 'S6 Brant — fire DPS, fire wallet', color: '#f97316' },
      'Cantarella': { name: 'Toxic Relationship', desc: 'S6 Cantarella — she\'s poison and you keep coming back', color: '#ec4899' },
      'Zani': { name: 'Frazzle Addict', desc: 'S6 Zani — 19 stacks of Frazzle, zero stacks of savings', color: '#edaf18' },
      'Ciaccona': { name: 'Wind Main in 2026', desc: 'S6 Ciaccona — bold, delusional, committed', color: '#22c55e' },
      'Cartethyia': { name: 'Blessed Wallet Drain', desc: 'S6 Cartethyia — the Maiden blessed your poverty', color: '#22c55e' },
      'Lupa': { name: 'Awoo\'d Too Hard', desc: 'S6 Lupa — the wolf pack ate your bank account', color: '#f97316' },
      'Phrolova': { name: 'Puppet? You\'re the Puppet.', desc: 'S6 Phrolova — she played you like her dolls', color: '#ec4899' },
      'Augusta': { name: 'Shocking Bill', desc: 'S6 Augusta — electrifying damage, electrifying debt', color: '#a855f7' },
      'Iuno': { name: 'Tone Deaf Spending', desc: 'S6 Iuno — the melody was "swipe swipe swipe"', color: '#22c55e' },
      'Galbrena': { name: 'Witch Time: Maxed', desc: 'S6 Galbrena — she IS Bayonetta now', color: '#f97316' },
      'Qiuyuan': { name: 'Echo Chamber', desc: 'S6 Qiuyuan — he echoed "one more Convene" seven times', color: '#22c55e' },
      'Chisa': { name: 'Cut Your Losses (Didn\'t)', desc: 'S6 Chisa — the blade cuts everything except your spending', color: '#ec4899' },
      'Lynae': { name: 'Lynae Impact', desc: 'S6 Lynae — just rename the game already', color: '#edaf18' },
      'Mornye': { name: 'Rhythm of Regret', desc: 'S6 Mornye — the beat dropped and so did your balance', color: '#f97316' },
      'Luuk Herssen': { name: 'Fist Full of Debt', desc: 'S6 Luuk Herssen — punched his way through your wallet', color: '#edaf18' },
      'Aemeath': { name: 'Rode Into Bankruptcy', desc: 'S6 Aemeath — the Exostrider ran over your finances', color: '#f97316' },
      'Sigrika': { name: 'Rune Bankruptcy', desc: 'S6 Sigrika — deciphered every rune except your bank statement', color: '#22c55e' },
    };
    
    // Check each character for S6
    Object.entries(charCounts).forEach(([name, count]) => {
      if (count >= 7 && s6Trophies[name]) {
        const t = s6Trophies[name];
        list.push({ id: `s6_${name.replace(/\s/g, '')}`, name: t.name, desc: t.desc, icon: 'Crown', color: t.color, tier: 'legendary' });
      }
    });
    
    // Fallback for any future character not in the map
    const anyS6 = Object.entries(charCounts).find(([name, c]) => c >= 7 && !s6Trophies[name]);
    if (anyS6) list.push({ id: 's6_other', name: 'The Shaper', desc: `S6 ${anyS6[0]} — fully Sequenced`, icon: 'Crown', color: '#ec4899', tier: 'legendary' });
    
    // "Gathering Wives" mega trophy — ALL 5-star characters at S6
    // Use ALL_5STAR_RESONATORS as source of truth (s6Trophies may lag behind new characters)
    const s6Count = ALL_5STAR_RESONATORS.filter(n => (charCounts[n] || 0) >= 7).length;
    const total5StarCount = ALL_5STAR_RESONATORS.length;
    if (s6Count >= total5StarCount) {
      list.push({ id: 's6_all', name: 'Gathering Wives: Complete', desc: 'Every 5★ at S6 — Rover\'s harem is full. seek help.', icon: 'Crown', color: '#ef4444', tier: 'legendary' });
    } else if (s6Count >= 20) {
      list.push({ id: 's6_harem20', name: 'Harem Protagonist EX', desc: `${s6Count}/${total5StarCount} at S6 — your wallet is in critical condition`, icon: 'Crown', color: '#ff4500', tier: 'legendary' });
    } else if (s6Count >= 10) {
      list.push({ id: 's6_harem10', name: 'Gathering Wives', desc: `${s6Count}/${total5StarCount} at S6 — Rover didn't stutter`, icon: 'Crown', color: '#ff6347', tier: 'legendary' });
    } else if (s6Count >= 5) {
      list.push({ id: 's6_harem5', name: 'Starting a Collection', desc: `${s6Count} at S6 — the harem arc is canon`, icon: 'Crown', color: '#ff8c00', tier: 'epic' });
    }
    
    // ═══ WEAPON REFINEMENT TROPHIES ═══
    const weapCounts = {};
    weapHistory.filter(p => p.rarity === 5 && p.name).forEach(p => { weapCounts[p.name] = (weapCounts[p.name] ?? 0) + 1; });
    const r5Weapons = Object.entries(weapCounts).filter(([, c]) => c >= 5);
    const r3Weapons = Object.entries(weapCounts).filter(([, c]) => c >= 3);
    const maxedWeap = r5Weapons[0];
    if (r5Weapons.length >= 3) list.push({ id: 'r5three', name: 'Forge of Impermanence', desc: `${r5Weapons.length} R5 weapons — your armory costs more than a car`, icon: 'Swords', color: '#ef4444', tier: 'legendary' });
    else if (r5Weapons.length >= 2) list.push({ id: 'r5two', name: 'Tuner Diff', desc: `${r5Weapons.length} R5 weapons — one wasn't enough apparently`, icon: 'Swords', color: '#ec4899', tier: 'legendary' });
    else if (maxedWeap) list.push({ id: 'r5', name: 'Weapon Banner Victim', desc: `R5 ${maxedWeap[0]} — financially irresponsible`, icon: 'Swords', color: '#ec4899', tier: 'legendary' });
    else if (r3Weapons.length >= 1) list.push({ id: 'r3', name: 'Halfway to Copium', desc: `R3+ ${r3Weapons[0][0]} — too invested to stop, too broke to finish`, icon: 'Sword', color: '#a855f7', tier: 'purple' });

    // Weapon banner pull volume
    const weapBannerPulls = weaponHist.length;
    if (weapBannerPulls >= 500) list.push({ id: 'weapvol5', name: 'Weapon Banner Prisoner', desc: `${weapBannerPulls} weapon banner Convenes — this is a lifestyle choice`, icon: 'Swords', color: '#edaf18', tier: 'gold' });
    else if (weapBannerPulls >= 200) list.push({ id: 'weapvol2', name: 'Signature Cope', desc: `${weapBannerPulls} weapon banner Convenes — "it's a DPS increase bro"`, icon: 'Sword', color: '#3b82f6', tier: 'blue' });

    // More weapon Convenes than character Convenes
    if (weapBannerPulls > 0 && featuredHist.length > 0 && weapBannerPulls > featuredHist.length) {
      list.push({ id: 'weapsimp', name: 'BiS or Bust', desc: 'More weapon Convenes than character Convenes — priorities moment', icon: 'Sword', color: '#f97316', tier: 'orange' });
    }

    // Never Convened on weapon banner
    if (weapBannerPulls === 0 && totalPulls >= 100) list.push({ id: 'noweap', name: 'Fists Only Challenge', desc: 'Zero weapon banner Convenes — who needs signatures anyway', icon: 'Shield', color: '#22c55e', tier: 'green' });
    
    // Average pity under 50 with 10+ 5★ (consistently lucky)
    if (total5Stars >= 10 && overallStats?.avgPity) {
      const avg = parseFloat(overallStats.avgPity);
      if (!isNaN(avg) && avg <= 35) list.push({ id: 'luckyavg2', name: 'Edited Convene Log', desc: `Avg pity ${overallStats.avgPity} across ${total5Stars} five-stars — has to be fake right??`, icon: 'Clover', color: '#ef4444', tier: 'legendary' });
      else if (!isNaN(avg) && avg <= 45) list.push({ id: 'luckyavg', name: 'Illegal Luck', desc: `Avg pity ${overallStats.avgPity} across ${total5Stars} five-stars — report this account`, icon: 'Clover', color: '#edaf18', tier: 'gold' });
      else if (!isNaN(avg) && avg >= 70) list.push({ id: 'unluckyavg', name: 'Certified Unlucky', desc: `Avg pity ${overallStats.avgPity} — genuinely painful to look at`, icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
      else if (!isNaN(avg) && avg >= 65) list.push({ id: 'unluckyavg2', name: 'Soft Pity Squatter', desc: `Avg pity ${overallStats.avgPity} — you live in the soft zone rent-free`, icon: 'AlertCircle', color: '#f97316', tier: 'orange' });
    }

    // Never got early pity — all 5★ at pity 50+ (with 5+ pulls)
    const allLatePity = total5Stars >= 5 && all5Stars.every(p => p.pity >= 65);
    if (allLatePity) list.push({ id: 'neverearly', name: 'Waveplate Syndrome', desc: 'Never once got a 5★ before soft pity — always waiting, never winning', icon: 'Shield', color: '#6b7280', tier: 'gray' });

    // Multiple hard pity hits
    const hardPityCount = all5Stars.filter(p => p.pity >= HARD_PITY).length;
    if (hardPityCount >= 5) list.push({ id: 'hard5', name: 'Tacet Mark: Permanent', desc: `Hit hard pity ${hardPityCount}× — the Lament scarred your account`, icon: 'Shield', color: '#ef4444', tier: 'red' });
    else if (hardPityCount >= 3) list.push({ id: 'hard3', name: 'Frequent Flyer: Pity 80', desc: `Hit hard pity ${hardPityCount}× — you know the road to 80 by heart`, icon: 'Shield', color: '#6b7280', tier: 'gray' });

    // Got a 5★ at very low pity multiple times
    const veryEarlyCount = all5Stars.filter(p => p.pity > 0 && p.pity <= 10).length;
    if (veryEarlyCount >= 5) list.push({ id: 'early5x', name: 'Rover\'s Plot Armor', desc: `${veryEarlyCount} five-stars within first 10 pity — protagonist luck is real`, icon: 'Clover', color: '#edaf18', tier: 'legendary' });
    else if (veryEarlyCount >= 3) list.push({ id: 'early3x', name: 'Resonance Beacon', desc: `${veryEarlyCount} five-stars within first 10 pity — they come to you`, icon: 'Clover', color: '#22c55e', tier: 'green' });
    
    // ═══ 50/50 LOSS CHARACTER TROPHIES ═══
    // Standard banner chars you can lose 50/50 to: Calcharo, Encore, Jianxin, Lingyang, Verina
    const lostTo = featured5Stars.filter(p => p.won5050 === false && p.name);
    const lostToNames = lostTo.map(p => p.name);
    const lostCount = (name) => lostToNames.filter(n => n === name).length;
    
    // Lingyang — the community's most memed 50/50 loss
    const lingyangLosses = lostCount('Lingyang');
    if (lingyangLosses >= 3) list.push({ id: 'tiger3', name: 'Lingyang Main (Involuntary)', desc: `Lost 50/50 to Lingyang ${lingyangLosses}× — he chose you`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
    else if (lingyangLosses >= 1) list.push({ id: 'tiger1', name: 'Lingyang\'d', desc: 'Lost 50/50 to Lingyang — welcome to the club', icon: 'AlertCircle', color: '#f97316', tier: 'orange' });
    
    // Calcharo — memetic loser of the community
    const calcharoLosses = lostCount('Calcharo');
    if (calcharoLosses >= 3) list.push({ id: 'calch3', name: 'Calcharo Stalker Victim', desc: `Lost 50/50 to Calcharo ${calcharoLosses}× — restraining order when`, icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
    else if (calcharoLosses >= 1) list.push({ id: 'calch1', name: 'Sentenced', desc: 'Lost 50/50 to Calcharo — guilty as charged', icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
    
    // Jianxin
    if (lostCount('Jianxin') >= 1) list.push({ id: 'jianxin', name: 'Parry This Casual', desc: `Lost 50/50 to Jianxin ${lostCount('Jianxin')}×`, icon: 'Shield', color: '#22c55e', tier: 'green' });
    
    // Encore
    if (lostCount('Encore') >= 1) list.push({ id: 'encore', name: 'Woolie\'d', desc: `Lost 50/50 to Encore ${lostCount('Encore')}× — Cosmos sends his regards`, icon: 'Flame', color: '#ec4899', tier: 'pink' });
    
    // Verina — the only "good" 50/50 loss
    if (lostCount('Verina') >= 1) list.push({ id: 'verina', name: 'W in Disguise', desc: `Lost 50/50 to Verina ${lostCount('Verina')}× — best L you ever took`, icon: 'Heart', color: '#22c55e', tier: 'green' });
    
    // Lost to all 5 standard characters across all 50/50 losses
    const stdChars = [...STANDARD_5STAR_CHARACTERS];
    const lostToAllStd = stdChars.every(name => lostToNames.includes(name));
    if (lostToAllStd) list.push({ id: 'allstd', name: 'Gotta Lose \'Em All', desc: 'Lost 50/50 to every standard character — completionist arc', icon: 'Trophy', color: '#a855f7', tier: 'purple' });
    
    // Total 50/50 losses
    const totalLosses = lostTo.length;
    const totalWins = featured5Stars.filter(p => p.won5050 === true).length;
    if (totalLosses >= 10) list.push({ id: 'loss10', name: 'Down Bad (Financially)', desc: `${totalLosses} 50/50 losses — at what point do you stop`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
    
    // Win rate trophy
    const total5050s = totalWins + totalLosses;
    if (total5050s >= 5) {
      const winRate = Math.round((totalWins / total5050s) * 100);
      if (winRate >= 80) list.push({ id: 'highwr', name: 'Account For Sale?', desc: `${winRate}% win rate across ${total5050s} flips — this isn't normal`, icon: 'Crown', color: '#edaf18', tier: 'legendary' });
      else if (winRate >= 65) list.push({ id: 'goodwr', name: 'Jinzhou\'s Luckiest', desc: `${winRate}% win rate across ${total5050s} flips — the Magistrate blesses you`, icon: 'Clover', color: '#22c55e', tier: 'green' });
      else if (winRate <= 20) list.push({ id: 'lowwr', name: 'Statistically Bullied', desc: `${winRate}% win rate across ${total5050s} flips — file a complaint`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
      else if (winRate <= 35) list.push({ id: 'badwr', name: 'Tacet Field: Account', desc: `${winRate}% win rate across ${total5050s} flips — corrupted beyond repair`, icon: 'AlertCircle', color: '#f97316', tier: 'orange' });
      // Perfectly balanced — exactly 50% ±2%
      if (total5050s >= 10 && winRate >= 48 && winRate <= 52) list.push({ id: 'balanced', name: '50/50 at 50/50', desc: `${winRate}% win rate across ${total5050s} flips — mathematically perfect copium`, icon: 'Target', color: '#06b6d4', tier: 'cyan' });
    }

    // 50/50 win total milestones
    if (totalWins >= 20) list.push({ id: 'wins20', name: 'Shorekeeper\'s Chosen', desc: `${totalWins} 50/50 wins — she protects your account too`, icon: 'Crown', color: '#edaf18', tier: 'gold' });
    else if (totalWins >= 10) list.push({ id: 'wins10', name: 'Sonance Cascade', desc: `${totalWins} 50/50 wins total — the echoes answer`, icon: 'Target', color: '#22c55e', tier: 'green' });

    // Against All Odds — won 50/50 immediately after 3+ consecutive losses
    let hasAgainstOdds = false;
    let lossRunCount = 0;
    for (const p of featured5Stars) {
      if (p.won5050 === null) continue;
      if (p.won5050 === false) lossRunCount++;
      else { if (lossRunCount >= 3) { hasAgainstOdds = true; break; } lossRunCount = 0; }
    }
    if (hasAgainstOdds) list.push({ id: 'odds', name: 'Plot Armor Activated', desc: 'Won 50/50 after 3+ consecutive losses — anime comeback arc', icon: 'Flame', color: '#f97316', tier: 'orange' });
    
    // ═══ META TEAM TROPHIES ═══
    // Check if player owns all members of a meta team (using their 5★ collection)
    const owns = (name) => owned5StarChars.has(name);
    const ownsAll = (...names) => names.every(owns);
    
    // T0 Meta Teams
    if (ownsAll('Phrolova', 'Cantarella')) list.push({ id: 'phrol', name: 'Codependency', desc: 'Phrolova + Cantarella — useless without each other, broken together', icon: 'Heart', color: '#a855f7', tier: 'purple' });
    if (ownsAll('Phoebe', 'Zani')) list.push({ id: 'zaphi', name: 'Wheelchair', desc: 'Phoebe + Zani — 19 Frazzle stacks, zero skill required', icon: 'Heart', color: '#edaf18', tier: 'gold' });
    if (ownsAll('Lynae', 'Mornye')) list.push({ id: 'lynmor', name: 'Pay2Win Unlocked', desc: 'Lynae + Mornye — the game plays itself now', icon: 'Sparkles', color: '#edaf18', tier: 'gold' });
    if (ownsAll('Changli') && ownsAll('Brant') && ownsAll('Lupa')) list.push({ id: 'monofusion', name: 'Arsonist Squad', desc: 'Changli + Brant + Lupa — everything burns, including your primos', icon: 'Flame', color: '#f97316', tier: 'orange' });
    if (ownsAll('Galbrena', 'Qiuyuan', 'Shorekeeper')) list.push({ id: 'fusion', name: 'Bayonetta at Home', desc: 'Galbrena + Qiuyuan + SK — Mom said we have Bayonetta at home', icon: 'Flame', color: '#f97316', tier: 'orange' });
    if (ownsAll('Jiyan') && owned4StarChars.has('Mortefi')) list.push({ id: 'jiyan', name: 'Boomer Comp', desc: 'Jiyan + Mortefi — 1.0 copium that refuses to retire', icon: 'Shield', color: '#22c55e', tier: 'green' });
    
    // Own both Shorekeeper and Verina (the two universal supports)
    if (ownsAll('Shorekeeper', 'Verina')) list.push({ id: 'heals', name: 'Skill Issue Insurance', desc: 'SK + Verina — can\'t die even if you tried', icon: 'Heart', color: '#22c55e', tier: 'green' });

    // Jinhsi + Changli (Jinzhou power couple)
    if (ownsAll('Jinhsi', 'Changli')) list.push({ id: 'jinzhou', name: 'Magistrate\'s Flame', desc: 'Jinhsi + Changli — Jinzhou\'s power duo', icon: 'Flame', color: '#f97316', tier: 'orange' });
    // Carlotta + Roccia (Rinascita duo)
    if (ownsAll('Carlotta', 'Roccia')) list.push({ id: 'rinascita', name: 'Rinascita Familia', desc: 'Carlotta + Roccia — the ice queen and her ride', icon: 'Diamond', color: '#38bdf8', tier: 'blue' });
    // Own all standard 5★ characters
    if (stdChars.length > 0 && [...stdChars].every(n => owns(n))) list.push({ id: 'stdall', name: 'Losers Club', desc: 'All standard 5★ Resonators — the "thanks for the 50/50 loss" squad', icon: 'Trophy', color: '#a855f7', tier: 'purple' });
    
    // Own 3+ T0 DPS
    const t0Dps = ['Cartethyia', 'Camellya', 'Carlotta', 'Xiangli Yao', 'Phrolova', 'Iuno', 'Augusta', 'Aemeath'];
    const ownedT0 = t0Dps.filter(n => owns(n));
    if (ownedT0.length >= 6) list.push({ id: 't0six', name: 'Tower? Cleared.', desc: `${ownedT0.length} T0 DPS — ToA is your personal playground`, icon: 'Crown', color: '#edaf18', tier: 'legendary' });
    else if (ownedT0.length >= 3) list.push({ id: 't0three', name: 'Meta Slave', desc: `${ownedT0.length} T0 DPS — tier list told you to Convene`, icon: 'Trophy', color: '#a855f7', tier: 'purple' });
    
    // ═══ QUIRKY / COMMUNITY TROPHIES ═══
    // Never lost a 50/50 (with at least 3 wins)
    if (totalWins >= 3 && totalLosses === 0) list.push({ id: 'noloss', name: 'Literally Never Lost', desc: `${totalWins} 50/50 wins, zero losses — touch grass`, icon: 'Crown', color: '#edaf18', tier: 'legendary' });
    
    // Lost first 50/50 (very first was a loss)
    if (first5050 && first5050.won5050 === false) list.push({ id: 'firstloss', name: 'First Time?', desc: 'First 50/50 was a loss — it only gets worse', icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
    
    // 4★ only — lots of pulls but very few 5★ (bad luck overall)
    if (totalPulls >= 200 && total5Stars <= 2) list.push({ id: 'dry', name: 'Down Horrendous', desc: `${totalPulls} Convenes, ${total5Stars} five-stars — delete the app`, icon: 'TrendingDown', color: '#6b7280', tier: 'gray' });
    
    // Duplicate magnet — same standard char lost to 3+ times
    const dupMagnet = stdChars.find(name => lostCount(name) >= 3);
    if (dupMagnet && dupMagnet !== 'Lingyang') list.push({ id: 'dup', name: 'Hostage Situation', desc: `${dupMagnet} S${lostCount(dupMagnet) - 1} from 50/50 losses alone — didn't even want them`, icon: 'Diamond', color: '#6b7280', tier: 'gray' });

    // ═══ MORE QUIRKY / SITUATIONAL TROPHIES ═══
    // Only own 1 unique 5★ character
    if (owned5StarChars.size === 1 && totalPulls >= 50) list.push({ id: 'onetrick', name: 'Solo Resonator', desc: `Only ${[...owned5StarChars][0]} — loyalty or poverty?`, icon: 'Target', color: '#f97316', tier: 'orange' });

    // Pulled 5★ character and their signature weapon
    const sigPairs = [
      ['Jiyan', 'Verdant Summit'], ['Yinlin', 'Stringmaster'], ['Jinhsi', 'Ages of Harvest'],
      ['Changli', 'Blazing Brilliance'], ['Zhezhi', 'Rime-Draped Sprouts'], ['Xiangli Yao', "Verity's Handle"],
      ['Shorekeeper', 'Stellar Symphony'], ['Camellya', 'Red Spring'], ['Carlotta', 'The Last Dance'],
      ['Roccia', 'Tragicomedy'], ['Phoebe', 'Luminous Hymn'], ['Brant', 'Unflickering Valor'],
      ['Cantarella', 'Whispers of Sirens'], ['Zani', 'Blazing Justice'], ['Ciaccona', 'Woodland Aria'],
      ['Cartethyia', "Defier's Thorn"], ['Lupa', 'Wildfire Mark'], ['Phrolova', 'Lethean Elegy'],
      ['Augusta', 'Thunderflare Dominion'], ['Iuno', "Moongazer's Sigil"], ['Galbrena', 'Lux & Umbra'],
      ['Qiuyuan', 'Emerald Sentence'], ['Chisa', 'Kumokiri'], ['Lynae', 'Spectrum Blaster'],
      ['Mornye', 'Starfield Calibrator'], ['Luuk Herssen', 'Everbright Polestar'], ['Aemeath', "Daybreaker's Spine"],
      ['Sigrika', 'Solsworn Ciphers'],
    ];
    const sigCount = sigPairs.filter(([char, weap]) => owned5StarChars.has(char) && owned5StarWeaps.has(weap)).length;
    if (sigCount >= 10) list.push({ id: 'sig10', name: 'Tuning Complete', desc: `${sigCount} characters with their signature — peak Forte optimization`, icon: 'Swords', color: '#edaf18', tier: 'gold' });
    else if (sigCount >= 5) list.push({ id: 'sig5', name: 'Forte Synergy', desc: `${sigCount} characters with their signature weapon — built different`, icon: 'Sword', color: '#a855f7', tier: 'purple' });
    else if (sigCount >= 3) list.push({ id: 'sig3', name: 'Echo Equipped', desc: `${sigCount} characters with their signature weapon`, icon: 'Sword', color: '#3b82f6', tier: 'blue' });
    else if (sigCount >= 1) list.push({ id: 'sig1', name: 'Signature Acquired', desc: 'Pulled a character and their signature weapon — BiS secured', icon: 'Sword', color: '#22c55e', tier: 'green' });

    // Speedrun — won 50/50 at low pity (<25)
    const speedrun5050 = featured5Stars.find(p => p.won5050 === true && p.pity > 0 && p.pity <= 20);
    if (speedrun5050) list.push({ id: 'speed', name: 'Early Pity Any%', desc: `Won 50/50 at pity ${speedrun5050.pity} — frame-perfect gacha luck`, icon: 'Zap', color: '#22c55e', tier: 'green' });

    // Max Sequence on a standard character from 50/50 losses alone
    const stdS6FromLosses = [...stdChars].find(name => lostCount(name) >= 7);
    if (stdS6FromLosses) list.push({ id: 'stdS6', name: 'Accidental S6: Coping', desc: `S6 ${stdS6FromLosses} entirely from 50/50 losses — didn't even Convene for them`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });

    // Guaranteed streak — multiple 5★ in a row that were all guaranteed (lost 50/50 every time)
    let guaranteedStreak = 0, maxGuaranteedStreak = 0;
    for (const p of featured5Stars) {
      if (p.won5050 === null) { guaranteedStreak++; } // null = guaranteed
      else { maxGuaranteedStreak = Math.max(maxGuaranteedStreak, guaranteedStreak); guaranteedStreak = 0; }
    }
    maxGuaranteedStreak = Math.max(maxGuaranteedStreak, guaranteedStreak);
    if (maxGuaranteedStreak >= 3) list.push({ id: 'guar3', name: 'Guarantee Gang', desc: `${maxGuaranteedStreak} guaranteed 5★ in a row — never won a 50/50 between them`, icon: 'Shield', color: '#f97316', tier: 'orange' });

    // F2P indicator — less than 200 pulls total but has 5+ five-stars (efficient)
    if (totalPulls > 0 && totalPulls <= 200 && total5Stars >= 5) list.push({ id: 'efficient', name: 'F2P BTW', desc: `${total5Stars} five-stars in only ${totalPulls} Convenes — maximum Astrite efficiency`, icon: 'Clover', color: '#22c55e', tier: 'green' });

    // Biggest gap — over 150 pulls between 5★ at any point
    let maxDryStreak = 0;
    let currentDry = 0;
    for (const p of allHistory) {
      currentDry++;
      if (p.rarity === 5) { maxDryStreak = Math.max(maxDryStreak, currentDry); currentDry = 0; }
    }
    if (maxDryStreak >= 160) list.push({ id: 'dry150', name: 'Huanglong\'s Desert', desc: `${maxDryStreak} Convenes between 5★ — the wasteland arc`, icon: 'TrendingDown', color: '#ef4444', tier: 'red' });
    else if (maxDryStreak >= 145) list.push({ id: 'dry130', name: 'Tacet Drought', desc: `${maxDryStreak} Convenes between 5★ — silence from the banner`, icon: 'TrendingDown', color: '#f97316', tier: 'orange' });

    // Apply admin trophy name/desc overrides
    const finalList = list.map(t => {
      const ov = trophyOverrides[t.id];
      if (!ov) return t;
      return { ...t, ...(ov.name && { name: ov.name }), ...(ov.desc && { desc: ov.desc }) };
    });

    return {
      list: finalList,
      stats: {
        earliest5Star,
        bestWinStreak,
        worstLossStreak,
        currentStreak: recentStreak,
        totalPulls,
        owned5StarChars: owned5StarChars.size,
        owned4StarChars: owned4StarChars.size,
        owned5StarWeaps: owned5StarWeaps.size,
        owned4StarWeaps: owned4StarWeaps.size,
        owned3StarWeaps: owned3StarWeaps.size,
      }
    };
  }, [state.profile, overallStats, trophyOverrides]);

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

  const TROPHY_TIER_ORDER = { legendary: 0, epic: 1, gold: 2, purple: 3, orange: 4, pink: 5, cyan: 6, red: 7, green: 8, blue: 9, gray: 10 };

  // ID Card canvas download — supports landscape (16:9) and portrait (9:16)
  const downloadIdCard = useCallback(async (format) => {
    const isPortrait = (format || idCardFormat) === 'portrait';
    const canvas = document.createElement('canvas');
    const W = isPortrait ? 1080 : 1920;
    const H = isPortrait ? 1920 : 1080;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const rr = (x,y,w,h,r) => { ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); };

    // Data
    const picName = state.profile.profilePic;
    const picUrl = picName ? (collectionImages[picName] || '') : '';
    let pImg = null;
    // AUDIT-FIX H1: Clear timeouts to prevent leaks on image preload
    if (picUrl) { try { pImg = new Image(); pImg.crossOrigin = 'anonymous'; await new Promise((r,j)=>{const t=setTimeout(j,3000);pImg.onload=()=>{clearTimeout(t);r();};pImg.onerror=()=>{clearTimeout(t);j();};pImg.src=picUrl;}); } catch { pImg = null; } }
    let appIco = null;
    try { appIco = new Image(); await new Promise((r,j)=>{const t=setTimeout(j,2000);appIco.onload=()=>{clearTimeout(t);r();};appIco.onerror=()=>{clearTimeout(t);j();};appIco.src=HEADER_ICON;}); } catch { appIco = null; }

    // Preload resonator portrait images
    const resImgs = {};
    const charHist0 = [...(state.profile.featured?.history||[]),...(state.profile.standardChar?.history||[]),...(state.profile.beginner?.history||[]).filter(p=>p.name&&ALL_CHARACTERS.has(p.name))];
    const preloadNames = [...new Set(charHist0.filter(p=>(p.rarity===5||p.rarity===4)&&p.name&&ALL_CHARACTERS.has(p.name)).map(p=>p.name))].reverse().slice(0, 24);
    await Promise.all(preloadNames.map(name => {
      const url = collectionImages[name];
      if (!url) return Promise.resolve();
      return new Promise(resolve => {
        const img = new Image(); img.crossOrigin = 'anonymous';
        // AUDIT-FIX H1: Clear timeout on load/error to prevent leaks
        const t = setTimeout(resolve, 3000);
        img.onload = () => { clearTimeout(t); resImgs[name] = img; resolve(); };
        img.onerror = () => { clearTimeout(t); resolve(); }; img.src = url;
      });
    }));

    const uname = state.profile.username || 'Resonator';
    const uid = state.profile.uid || '--';
    const svr = state.server;
    const lr = luckRating;
    const tList = [...(trophies?.list || [])].sort((a,b) => (TROPHY_TIER_ORDER[a.tier]??99) - (TROPHY_TIER_ORDER[b.tier]??99)).slice(0, 5);
    const impDate = state.profile.importedAt ? new Date(state.profile.importedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
    const beginnerHist = state.profile.beginner?.history||[];
    const charHist = [...(state.profile.featured?.history||[]),...(state.profile.standardChar?.history||[]),...beginnerHist.filter(p=>p.name&&ALL_CHARACTERS.has(p.name))];
    const weapHist = [...(state.profile.weapon?.history||[]),...(state.profile.standardWeap?.history||[]),...beginnerHist.filter(p=>p.name&&!ALL_CHARACTERS.has(p.name))];
    const countUniqueOwned = (h,r,isChar) => new Set(h.filter(p=>p.rarity===r&&p.name&&(isChar?ALL_CHARACTERS.has(p.name):!ALL_CHARACTERS.has(p.name))).map(p=>p.name)).size;
    const c5=countUniqueOwned(charHist,5,true), c4=countUniqueOwned(charHist,4,true), w5=countUniqueOwned(weapHist,5,false), w4=countUniqueOwned(weapHist,4,false), w3=countUniqueOwned(weapHist,3,false), w2=countUniqueOwned(weapHist,2,false), w1=countUniqueOwned(weapHist,1,false);
    const newestRes = [...new Set(charHist.filter(p=>(p.rarity===5||p.rarity===4)&&p.name&&ALL_CHARACTERS.has(p.name)).map(p=>p.name))].reverse();
    const fiveStarPulls = [...charHist,...weapHist].filter(p=>p.rarity===5&&p.pity>0);
    const histBuckets = {}; fiveStarPulls.forEach(p=>{if(p.pity>80){histBuckets['81+']=(histBuckets['81+']??0)+1;}else{const b=Math.floor((p.pity-1)/10)*10+1;histBuckets[`${b}-${b+9}`]=(histBuckets[`${b}-${b+9}`]??0)+1;}});
    const histLabels = Array.from({length:8},(_,i)=>`${i*10+1}-${(i+1)*10}`); if(histBuckets['81+'])histLabels.push('81+'); histLabels.forEach(b=>{if(!histBuckets[b])histBuckets[b]=0;});
    const histSummary = fiveStarPulls.length>=2?{max:Math.max(...Object.values(histBuckets),1),avg:(fiveStarPulls.reduce((s,p)=>s+p.pity,0)/fiveStarPulls.length).toFixed(1),lo:Math.min(...fiveStarPulls.map(p=>p.pity)),hi:Math.max(...fiveStarPulls.map(p=>p.pity))}:null;
    const sts = [
      {l:'Avg Pity',v:overallStats?.avgPity??'--',c:'#edaf18'},
      {l:'Total Convenes',v:overallStats?.totalPulls?.toLocaleString()??'--',c:'#e2e8f0'},
      {l:'5-Star',v:String(overallStats?.fiveStars??'--'),c:'#c084fc'},
      {l:'50/50 Win',v:overallStats?.winRate?overallStats.winRate+'%':'--',c:'#4ade80'},
      {l:'Won',v:String(overallStats?.won5050??'--'),c:'#4ade80'},
      {l:'Lost',v:String(overallStats?.lost5050??'--'),c:'#f87171'},
    ];

    // Per-banner breakdown data
    const featHist = state.profile.featured?.history||[];
    const weapBannerHist = state.profile.weapon?.history||[];
    const stdCHist = state.profile.standardChar?.history||[];
    const stdWHist = state.profile.standardWeap?.history||[];
    const bgnHist = state.profile.beginner?.history||[];
    const bannerStats = [
      {l:'Featured',v:String(featHist.length),c:'#edaf18',s:featHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Weapon',v:String(weapBannerHist.length),c:'#c084fc',s:weapBannerHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Std. Char',v:String(stdCHist.length),c:'#60a5fa',s:stdCHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Std. Weap',v:String(stdWHist.length),c:'#60a5fa',s:stdWHist.filter(p=>p.rarity===5).length+' ★5'},
      {l:'Beginner',v:String(bgnHist.length),c:'#34d399',s:bgnHist.filter(p=>p.rarity===5).length+' ★5'},
    ];

    // ═══ DRAWING PRIMITIVES ═══
    // Outer card — .kuro-card
    const drawShell = (x,y,w,h) => {
      ctx.fillStyle='rgba(12,16,24,0.8)';rr(x,y,w,h,24);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=1.5;rr(x,y,w,h,24);ctx.stroke();
      const il=ctx.createLinearGradient(x,y,x,y+3);il.addColorStop(0,'rgba(255,255,255,0.07)');il.addColorStop(1,'transparent');
      ctx.fillStyle=il;ctx.fillRect(x+24,y+1,w-48,2);
      const sh=ctx.createLinearGradient(x,0,x+w,0);
      sh.addColorStop(0,'transparent');sh.addColorStop(0.2,'rgba(255,255,255,0.35)');sh.addColorStop(0.5,'rgba(255,255,255,0.55)');sh.addColorStop(0.8,'rgba(255,255,255,0.35)');sh.addColorStop(1,'transparent');
      ctx.fillStyle=sh;ctx.fillRect(x+24,y,w-48,1.5);
      ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(x+w-12-18,y+12);ctx.lineTo(x+w-12,y+12);ctx.lineTo(x+w-12,y+12+18);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,0.14)';
      ctx.beginPath();ctx.moveTo(x+12+18,y+h-12);ctx.lineTo(x+12,y+h-12);ctx.lineTo(x+12,y+h-12-18);ctx.stroke();
    };

    // Header
    const drawHeader = (x,y,w) => {
      const hH=54;
      const hg=ctx.createLinearGradient(x,y,x+w,y);
      hg.addColorStop(0,'rgba(255,255,255,0.02)');hg.addColorStop(0.4,'transparent');hg.addColorStop(0.6,'transparent');hg.addColorStop(1,'rgba(255,255,255,0.02)');
      ctx.fillStyle=hg;ctx.fillRect(x,y,w,hH);
      ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y+hH);ctx.lineTo(x+w,y+hH);ctx.stroke();
      const gb=ctx.createLinearGradient(0,y+15,0,y+15+26);gb.addColorStop(0,'rgba(237,175,24,0.9)');gb.addColorStop(1,'rgba(237,175,24,0.4)');
      ctx.fillStyle=gb;rr(x+18,y+15,4,26,2);ctx.fill();
      ctx.shadowColor='rgba(237,175,24,0.3)';ctx.shadowBlur=12;rr(x+18,y+15,4,26,2);ctx.fill();ctx.shadowColor='transparent';ctx.shadowBlur=0;
      ctx.fillStyle='#f1f5f9';ctx.font='600 18px sans-serif';ctx.fillText('RESONATOR ID',x+32,y+34);
      ctx.fillStyle='#4b5563';ctx.font='14px sans-serif';ctx.textAlign='right';ctx.fillText('whisperingwishes.app',x+w-18,y+34);ctx.textAlign='left';
      return hH;
    };

    // Section panel with gold bar label
    const drawPanel = (x,y,w,h,label) => {
      ctx.fillStyle='rgba(10,14,22,0.55)';rr(x,y,w,h,15);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=1.5;rr(x,y,w,h,15);ctx.stroke();
      const ps=ctx.createLinearGradient(x,0,x+w,0);ps.addColorStop(0,'transparent');ps.addColorStop(0.3,'rgba(255,255,255,0.18)');ps.addColorStop(0.5,'rgba(255,255,255,0.3)');ps.addColorStop(0.7,'rgba(255,255,255,0.18)');ps.addColorStop(1,'transparent');
      ctx.fillStyle=ps;ctx.fillRect(x+12,y,w-24,1.5);
      ctx.strokeStyle='rgba(255,255,255,0.14)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x+w-9-12,y+6);ctx.lineTo(x+w-9,y+6);ctx.lineTo(x+w-9,y+6+12);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x+9+12,y+h-6);ctx.lineTo(x+9,y+h-6);ctx.lineTo(x+9,y+h-6-12);ctx.stroke();
      if(label){
        const gb2=ctx.createLinearGradient(0,y+12,0,y+12+20);gb2.addColorStop(0,'rgba(237,175,24,0.8)');gb2.addColorStop(1,'rgba(237,175,24,0.3)');
        ctx.fillStyle=gb2;rr(x+15,y+12,3.5,20,1.5);ctx.fill();
        ctx.fillStyle='#e2e8f0';ctx.font='600 17px sans-serif';ctx.fillText(label,x+26,y+28);
        return 39;
      }
      return 9;
    };

    // .kuro-stat cell
    const drawStat = (x,y,w,h,val,lab,col,fs) => {
      ctx.fillStyle='rgba(10,14,22,0.8)';rr(x,y,w,h,12);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.20)';ctx.lineWidth=1;rr(x,y,w,h,12);ctx.stroke();
      const ss=ctx.createLinearGradient(x,0,x+w,0);ss.addColorStop(0,'transparent');ss.addColorStop(0.5,'rgba(255,255,255,0.40)');ss.addColorStop(1,'transparent');
      ctx.fillStyle=ss;ctx.fillRect(x+6,y,w-12,1.5);
      const f=Math.round((fs||24)*1.1);
      ctx.fillStyle=col;ctx.font=`bold ${f}px monospace`;ctx.textAlign='center';ctx.fillText(val,x+w/2,y+h*0.48);
      ctx.fillStyle='#9ca3af';ctx.font=`${Math.max(11,Math.round(f*0.5))}px sans-serif`;ctx.fillText(lab,x+w/2,y+h*0.78);ctx.textAlign='left';
    };

    // Resonator portrait — collection-panel style: tall card with image + gradient name overlay
    const drawResPortrait = (x,y,cellW,cellH,name,img) => {
      ctx.fillStyle='rgba(10,14,22,0.9)';rr(x,y,cellW,cellH,9);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;rr(x,y,cellW,cellH,9);ctx.stroke();
      if(img){
        ctx.save();rr(x+1,y+1,cellW-2,cellH-2,8);ctx.clip();
        const f=getImageFraming('collection-'+name);
        const sc=f.zoom/100;
        // Preserve aspect ratio (object-contain): fit image inside cell
        const imgAR=img.naturalWidth/img.naturalHeight;
        const cellAR=cellW/cellH;
        let bw2,bh2;
        if(imgAR>cellAR){bw2=cellW;bh2=cellW/imgAR;}else{bh2=cellH;bw2=cellH*imgAR;}
        const dw=bw2*sc,dh=bh2*sc;
        const dx=x+(cellW-dw)/2-(f.x/100)*bw2*sc;
        const dy=y+(cellH-dh)/2-(f.y/100)*bh2*sc;
        ctx.drawImage(img,dx,dy,dw,dh);
        ctx.restore();
        const fade=ctx.createLinearGradient(0,y+cellH-33,0,y+cellH);
        fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,0.85)');
        ctx.save();rr(x+1,y+1,cellW-2,cellH-2,8);ctx.clip();
        ctx.fillStyle=fade;ctx.fillRect(x+1,y+cellH-33,cellW-2,32);
        ctx.restore();
      } else {
        ctx.fillStyle='#4b5563';ctx.font=Math.max(14,Math.round(cellW*0.3))+'px sans-serif';
        ctx.textAlign='center';ctx.fillText(name[0],x+cellW/2,y+cellH/2+6);ctx.textAlign='left';
      }
      ctx.fillStyle='#e5e7eb';ctx.font='11px sans-serif';ctx.textAlign='center';
      const ml=Math.floor(cellW/5.5);
      ctx.fillText(name.length>ml?name.slice(0,ml-1)+'..':name,x+cellW/2,y+cellH-5);ctx.textAlign='left';
    };

    // Draw icon using canvas path primitives — guaranteed to render (no font/Unicode dependency)
    const drawIconPath = (icx,icy,r,iconName,color) => {
      ctx.save();ctx.fillStyle=color;ctx.strokeStyle=color;
      ctx.lineWidth=Math.max(1.5,r*0.15);ctx.lineCap='round';ctx.lineJoin='round';
      const s=r*0.65;
      switch(iconName){
        case 'Crown':{ctx.beginPath();ctx.moveTo(icx-s,icy+s*0.5);ctx.lineTo(icx-s*0.9,icy-s*0.3);ctx.lineTo(icx-s*0.4,icy+s*0.05);ctx.lineTo(icx,icy-s*0.6);ctx.lineTo(icx+s*0.4,icy+s*0.05);ctx.lineTo(icx+s*0.9,icy-s*0.3);ctx.lineTo(icx+s,icy+s*0.5);ctx.closePath();ctx.fill();break;}
        case 'Sparkles':{ctx.beginPath();for(let i=0;i<8;i++){const a=(i*Math.PI/4)-Math.PI/2,rd=i%2===0?s:s*0.3;const px=icx+Math.cos(a)*rd,py=icy+Math.sin(a)*rd;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();ctx.fill();break;}
        case 'Heart':{const ht=s*0.9;ctx.beginPath();ctx.moveTo(icx,icy+ht*0.55);ctx.bezierCurveTo(icx-ht*1.1,icy-ht*0.2,icx-ht*0.5,icy-ht*0.9,icx,icy-ht*0.3);ctx.bezierCurveTo(icx+ht*0.5,icy-ht*0.9,icx+ht*1.1,icy-ht*0.2,icx,icy+ht*0.55);ctx.fill();break;}
        case 'Swords':{ctx.lineWidth=r*0.18;ctx.beginPath();ctx.moveTo(icx-s*0.7,icy-s*0.7);ctx.lineTo(icx+s*0.7,icy+s*0.7);ctx.moveTo(icx+s*0.7,icy-s*0.7);ctx.lineTo(icx-s*0.7,icy+s*0.7);ctx.stroke();break;}
        case 'Sword':{ctx.lineWidth=r*0.15;ctx.beginPath();ctx.moveTo(icx,icy-s*0.8);ctx.lineTo(icx,icy+s*0.6);ctx.moveTo(icx-s*0.35,icy-s*0.1);ctx.lineTo(icx+s*0.35,icy-s*0.1);ctx.stroke();ctx.beginPath();ctx.arc(icx,icy+s*0.7,s*0.12,0,Math.PI*2);ctx.fill();break;}
        case 'Shield':{ctx.beginPath();ctx.moveTo(icx,icy-s*0.75);ctx.lineTo(icx+s*0.7,icy-s*0.35);ctx.lineTo(icx+s*0.55,icy+s*0.25);ctx.quadraticCurveTo(icx,icy+s*0.85,icx,icy+s*0.85);ctx.quadraticCurveTo(icx,icy+s*0.85,icx-s*0.55,icy+s*0.25);ctx.lineTo(icx-s*0.7,icy-s*0.35);ctx.closePath();ctx.fill();break;}
        case 'Gift':{ctx.fillStyle=color;rr(icx-s*0.55,icy-s*0.15,s*1.1,s*0.8,2);ctx.fill();rr(icx-s*0.65,icy-s*0.45,s*1.3,s*0.35,2);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fillRect(icx-s*0.06,icy-s*0.45,s*0.12,s*1.25);ctx.fillRect(icx-s*0.65,icy-s*0.35,s*1.3,s*0.1);break;}
        case 'Zap':{ctx.beginPath();ctx.moveTo(icx+s*0.15,icy-s*0.8);ctx.lineTo(icx-s*0.3,icy+s*0.05);ctx.lineTo(icx+s*0.05,icy+s*0.05);ctx.lineTo(icx-s*0.15,icy+s*0.8);ctx.lineTo(icx+s*0.3,icy-s*0.05);ctx.lineTo(icx-s*0.05,icy-s*0.05);ctx.closePath();ctx.fill();break;}
        case 'Clover':{const cr=s*0.28;ctx.beginPath();ctx.arc(icx,icy-cr,cr,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(icx-cr*0.87,icy+cr*0.5,cr,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(icx+cr*0.87,icy+cr*0.5,cr,0,Math.PI*2);ctx.fill();ctx.lineWidth=r*0.1;ctx.beginPath();ctx.moveTo(icx,icy+cr*0.4);ctx.lineTo(icx,icy+s*0.8);ctx.stroke();break;}
        case 'Flame':{ctx.beginPath();ctx.moveTo(icx,icy-s*0.8);ctx.bezierCurveTo(icx+s*0.6,icy-s*0.3,icx+s*0.5,icy+s*0.4,icx,icy+s*0.7);ctx.bezierCurveTo(icx-s*0.5,icy+s*0.4,icx-s*0.6,icy-s*0.3,icx,icy-s*0.8);ctx.fill();break;}
        case 'Target':{ctx.lineWidth=r*0.12;ctx.beginPath();ctx.arc(icx,icy,s*0.7,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(icx,icy,s*0.4,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(icx,icy,s*0.12,0,Math.PI*2);ctx.fill();break;}
        case 'AlertCircle':{ctx.lineWidth=r*0.12;ctx.beginPath();ctx.arc(icx,icy,s*0.7,0,Math.PI*2);ctx.stroke();ctx.fillRect(icx-s*0.07,icy-s*0.35,s*0.14,s*0.4);ctx.beginPath();ctx.arc(icx,icy+s*0.32,s*0.08,0,Math.PI*2);ctx.fill();break;}
        case 'TrendingUp':{ctx.lineWidth=r*0.15;ctx.beginPath();ctx.moveTo(icx-s*0.7,icy+s*0.35);ctx.lineTo(icx-s*0.1,icy-s*0.15);ctx.lineTo(icx+s*0.2,icy+s*0.1);ctx.lineTo(icx+s*0.7,icy-s*0.4);ctx.stroke();ctx.beginPath();ctx.moveTo(icx+s*0.3,icy-s*0.4);ctx.lineTo(icx+s*0.7,icy-s*0.4);ctx.lineTo(icx+s*0.7,icy);ctx.stroke();break;}
        case 'TrendingDown':{ctx.lineWidth=r*0.15;ctx.beginPath();ctx.moveTo(icx-s*0.7,icy-s*0.35);ctx.lineTo(icx-s*0.1,icy+s*0.15);ctx.lineTo(icx+s*0.2,icy-s*0.1);ctx.lineTo(icx+s*0.7,icy+s*0.4);ctx.stroke();ctx.beginPath();ctx.moveTo(icx+s*0.3,icy+s*0.4);ctx.lineTo(icx+s*0.7,icy+s*0.4);ctx.lineTo(icx+s*0.7,icy);ctx.stroke();break;}
        case 'Fish':{ctx.beginPath();ctx.moveTo(icx+s*0.6,icy);ctx.quadraticCurveTo(icx,icy-s*0.5,icx-s*0.45,icy);ctx.quadraticCurveTo(icx,icy+s*0.5,icx+s*0.6,icy);ctx.fill();ctx.beginPath();ctx.moveTo(icx-s*0.45,icy);ctx.lineTo(icx-s*0.75,icy-s*0.3);ctx.lineTo(icx-s*0.75,icy+s*0.3);ctx.closePath();ctx.fill();break;}
        case 'Diamond':{ctx.beginPath();ctx.moveTo(icx,icy-s*0.7);ctx.lineTo(icx+s*0.5,icy);ctx.lineTo(icx,icy+s*0.7);ctx.lineTo(icx-s*0.5,icy);ctx.closePath();ctx.fill();break;}
        case 'Gamepad2':{rr(icx-s*0.6,icy-s*0.25,s*1.2,s*0.5,s*0.15);ctx.fill();ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.arc(icx-s*0.28,icy,s*0.12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(icx+s*0.28,icy,s*0.12,0,Math.PI*2);ctx.fill();break;}
        case 'Star':{ctx.beginPath();for(let i=0;i<10;i++){const a=(i*Math.PI/5)-Math.PI/2,rd=i%2===0?s*0.75:s*0.3;const px=icx+Math.cos(a)*rd,py=icy+Math.sin(a)*rd;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();ctx.fill();break;}
        case 'Trophy':{ctx.beginPath();ctx.moveTo(icx-s*0.45,icy-s*0.5);ctx.lineTo(icx+s*0.45,icy-s*0.5);ctx.lineTo(icx+s*0.3,icy+s*0.1);ctx.quadraticCurveTo(icx,icy+s*0.35,icx-s*0.3,icy+s*0.1);ctx.closePath();ctx.fill();ctx.fillRect(icx-s*0.07,icy+s*0.1,s*0.14,s*0.25);rr(icx-s*0.25,icy+s*0.35,s*0.5,s*0.12,2);ctx.fill();break;}
        default:{ctx.beginPath();for(let i=0;i<10;i++){const a=(i*Math.PI/5)-Math.PI/2,rd=i%2===0?s*0.75:s*0.3;const px=icx+Math.cos(a)*rd,py=icy+Math.sin(a)*rd;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();ctx.fill();break;}
      }
      ctx.restore();
    };

    // Trophy card — flat dark cell style with trophy color accents
    const drawTrophy = (x,y,size,t) => {
      const tc=t.color||'#9ca3af';
      // Dark fill base
      ctx.fillStyle='rgba(10,14,22,0.8)';rr(x,y,size,size,12);ctx.fill();
      // Colored gradient overlay (stronger tint so color is clearly visible)
      const bg2=ctx.createLinearGradient(x,y,x+size,y+size);
      bg2.addColorStop(0,tc+'30');bg2.addColorStop(1,tc+'12');
      ctx.fillStyle=bg2;rr(x,y,size,size,12);ctx.fill();
      // Colored border
      ctx.strokeStyle=tc+'50';ctx.lineWidth=1;rr(x,y,size,size,12);ctx.stroke();
      // Colored shimmer top line
      const ss=ctx.createLinearGradient(x,0,x+size,0);
      ss.addColorStop(0,'transparent');ss.addColorStop(0.5,tc+'60');ss.addColorStop(1,'transparent');
      ctx.fillStyle=ss;ctx.fillRect(x+6,y,size-12,1.5);
      // Icon — centered, with colored glow for premium look
      const iconR=size*0.28;
      ctx.save();
      ctx.shadowColor=tc;ctx.shadowBlur=Math.max(12,size*0.1);
      drawIconPath(x+size/2,y+size*0.38,iconR,t.icon,tc);
      ctx.restore();
      // Name — white bold, centered
      const nameFontSize=Math.max(10,Math.floor(size*0.12));
      ctx.fillStyle='#ffffff';ctx.font=`bold ${nameFontSize}px sans-serif`;
      const maxW=size-14;
      let nameText=t.name;
      if(ctx.measureText(nameText).width>maxW){
        while(nameText.length>1&&ctx.measureText(nameText+'..').width>maxW)nameText=nameText.slice(0,-1);
        nameText=nameText+'..';
      }
      ctx.textAlign='center';ctx.fillText(nameText,x+size/2,y+size*0.78);
      ctx.textAlign='left';
    };

    // Hero profile image — large, with collection-style framing and gradient fade
    const drawHero = (x,y,w,h) => {
      ctx.fillStyle='rgba(8,12,18,0.95)';rr(x,y,w,h,15);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=1.5;rr(x,y,w,h,15);ctx.stroke();
      if(pImg){
        ctx.save();rr(x+2,y+2,w-4,h-4,14);ctx.clip();
        const f=picName?getImageFraming('collection-'+picName):{zoom:100,x:0,y:0};
        const sc=f.zoom/100;
        // Preserve aspect ratio (object-contain)
        const imgAR=pImg.naturalWidth/pImg.naturalHeight;
        const cellAR=w/h;
        let bw2,bh2;
        if(imgAR>cellAR){bw2=w;bh2=w/imgAR;}else{bh2=h;bw2=h*imgAR;}
        const dw=bw2*sc,dh=bh2*sc;
        const dx=x+(w-dw)/2-(f.x/100)*bw2*sc;
        const dy=y+(h-dh)/2-(f.y/100)*bh2*sc;
        ctx.drawImage(pImg,dx,dy,dw,dh);
        ctx.restore();
        const fade=ctx.createLinearGradient(0,y+h-90,0,y+h);
        fade.addColorStop(0,'rgba(8,12,18,0)');fade.addColorStop(1,'rgba(8,12,18,0.9)');
        ctx.fillStyle=fade;ctx.fillRect(x+2,y+h-90,w-4,88);
      } else if(appIco){
        const sz=Math.min(w,h)*0.3;ctx.globalAlpha=0.08;ctx.drawImage(appIco,x+(w-sz)/2,y+(h-sz)/2,sz,sz);ctx.globalAlpha=1;
      }
      if(picName){ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText(picName,x+w/2,y+h-9);ctx.textAlign='left';}
    };

    // Luck bar
    const drawLuck = (x,y,w) => {
      if(!lr)return 0;
      rr(x,y,w,12,6);ctx.fillStyle='rgba(10,14,22,0.8)';ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;rr(x,y,w,12,6);ctx.stroke();
      const fw=Math.max(6,Math.min(lr.percentile||50,100)/100*w);
      ctx.save();rr(x,y,w,12,6);ctx.clip();
      const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#f87171');g.addColorStop(0.5,'#edaf18');g.addColorStop(1,'#34d399');
      ctx.fillStyle=g;rr(x,y,fw,12,6);ctx.fill();ctx.restore();
      ctx.fillStyle='rgba(10,14,22,0.85)';rr(x+w+9,y-5,105,21,6);ctx.fill();
      ctx.strokeStyle=(lr.color||'#edaf18')+'60';ctx.lineWidth=1;rr(x+w+9,y-5,105,21,6);ctx.stroke();
      ctx.fillStyle=lr.color||'#edaf18';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText(lr.tier+' '+lr.rating,x+w+61,y+10);ctx.textAlign='left';
      return 27;
    };

    // Stats grid 3x2
    const drawStats = (sx,sy,gw,ch2,fs) => {
      const g2=8,cols=3,cw2=(gw-(cols-1)*g2)/cols;
      sts.forEach((s,i)=>{const col=i%cols,row=Math.floor(i/cols);drawStat(sx+col*(cw2+g2),sy+row*(ch2+g2),cw2,ch2,s.v,s.l,s.c,fs);});
      return (ch2+g2)*2-g2;
    };

    // Resonator portraits grid — collection-panel style (tall cards, fills width)
    const drawResTags = (rx,ry,mw,cols,max) => {
      const ch2=newestRes.slice(0,max);if(!ch2.length)return 0;
      const g2=6,cellW=(mw-(cols-1)*g2)/cols,cellH=Math.round(cellW*1.6);
      ch2.forEach((n,i)=>{drawResPortrait(rx+(i%cols)*(cellW+g2),ry+Math.floor(i/cols)*(cellH+g2),cellW,cellH,n,resImgs[n]);});
      const rows=Math.ceil(ch2.length/cols);let h2=rows*(cellH+g2)-g2;
      if(newestRes.length>max){ctx.fillStyle='#4b5563';ctx.font='14px sans-serif';ctx.fillText('+'+String(newestRes.length-max)+' more',rx,ry+h2+18);h2+=21;}
      return h2;
    };

    // Collection row
    const drawColl = (cx2,cy2,cw2) => {
      const items=[{l:'5* Res',o:c5,t:ALL_5STAR_RESONATORS.length,c:'#edaf18'},{l:'4* Res',o:c4,t:ALL_4STAR_RESONATORS.length,c:'#c084fc'},{l:'5* Wep',o:w5,t:ALL_5STAR_WEAPONS.length,c:'#edaf18'},{l:'4* Wep',o:w4,t:ALL_4STAR_WEAPONS.length,c:'#c084fc'},{l:'3* Wep',o:w3,t:ALL_3STAR_WEAPONS.length,c:'#60a5fa'},{l:'2* Wep',o:w2,t:ALL_2STAR_WEAPONS.length,c:'#4ade80'},{l:'1* Wep',o:w1,t:ALL_1STAR_WEAPONS.length,c:'#9ca3af'}];
      const g2=6,iw=(cw2-(items.length-1)*g2)/items.length;
      items.forEach((it,i)=>{drawStat(cx2+i*(iw+g2),cy2,iw,48,it.o+'/'+it.t,it.l,it.c,16);});
      return 48;
    };

    // Mini histogram — neon glow style matching Stats tab
    // Helper: draw bar path with only top corners rounded (flat bottom, like CSS rounded-t)
    const barPath = (bx,by,bw,bh2,r) => {
      ctx.beginPath();
      ctx.moveTo(bx+r,by);ctx.lineTo(bx+bw-r,by);
      ctx.quadraticCurveTo(bx+bw,by,bx+bw,by+r);
      ctx.lineTo(bx+bw,by+bh2);ctx.lineTo(bx,by+bh2);
      ctx.lineTo(bx,by+r);
      ctx.quadraticCurveTo(bx,by,bx+r,by);
      ctx.closePath();
    };
    const drawHisto = (hx,hy,hw,hh) => {
      if(!histSummary||!histLabels.length)return;
      const bg2=3,bw2=(hw-(histLabels.length-1)*bg2)/histLabels.length,area=hh-24;
      histLabels.forEach((lab,i)=>{
        const cnt=histBuckets[lab]||0,bh=histSummary.max>0?Math.max(5,(cnt/histSummary.max)*area):5;
        const bx2=hx+i*(bw2+bg2),by2=hy+area-bh;
        const bucket=parseInt(lab)||0;
        const bc=bucket<=20?'#22c55e':bucket<=40?'#4ade80':bucket<=50?'#edaf18':bucket<=60?'#f97316':'#ef4444';
        // Semi-transparent gradient fill with outer glow (single fill, no stacking)
        ctx.save();ctx.shadowColor=bc+'50';ctx.shadowBlur=12;
        const barGrad=ctx.createLinearGradient(0,by2+bh,0,by2);
        barGrad.addColorStop(0,bc+'40');barGrad.addColorStop(1,bc+'20');
        ctx.fillStyle=barGrad;barPath(bx2,by2,bw2,bh,3);ctx.fill();
        ctx.restore();
        // Border — top and sides only, no bottom (matches borderBottom: 'none')
        ctx.strokeStyle=bc+'90';ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(bx2,by2+bh);ctx.lineTo(bx2,by2+3);
        ctx.quadraticCurveTo(bx2,by2,bx2+3,by2);
        ctx.lineTo(bx2+bw2-3,by2);
        ctx.quadraticCurveTo(bx2+bw2,by2,bx2+bw2,by2+3);
        ctx.lineTo(bx2+bw2,by2+bh);
        ctx.stroke();
        // Bottom glow line — full bar width (matches Stats tab bottom glow)
        if(cnt>0){ctx.save();ctx.shadowColor=bc;ctx.shadowBlur=8;ctx.fillStyle=bc;
        ctx.fillRect(bx2,by2+bh-2,bw2,2);ctx.restore();}
        // Count label with glow (matches textShadow: 0 0 8px ${color})
        if(cnt>0){ctx.save();ctx.shadowColor=bc;ctx.shadowBlur=8;ctx.fillStyle=bc;ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(cnt,bx2+bw2/2,by2-5);ctx.textAlign='left';ctx.restore();}
        // Bottom label
        ctx.fillStyle='#6b7280';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(lab.split('-')[0],bx2+bw2/2,hy+area+15);ctx.textAlign='left';
      });
    };

    // Banner Breakdown — per-banner pull count + 5★ count row
    const drawBannerRow = (bx2,by2,bw2,bh2) => {
      const g2=6,iw=(bw2-4*g2)/5;
      bannerStats.forEach((bs,i)=>{
        const sx=bx2+i*(iw+g2);
        // stat cell background
        ctx.fillStyle='rgba(10,14,22,0.8)';rr(sx,by2,iw,bh2,12);ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,0.20)';ctx.lineWidth=1;rr(sx,by2,iw,bh2,12);ctx.stroke();
        const ss=ctx.createLinearGradient(sx,0,sx+iw,0);ss.addColorStop(0,'transparent');ss.addColorStop(0.5,'rgba(255,255,255,0.40)');ss.addColorStop(1,'transparent');
        ctx.fillStyle=ss;ctx.fillRect(sx+6,by2,iw-12,1.5);
        // Pull count (main value)
        ctx.fillStyle=bs.c;ctx.font='bold 22px monospace';ctx.textAlign='center';
        ctx.fillText(bs.v,sx+iw/2,by2+bh2*0.35);
        // 5★ sub-value
        ctx.fillStyle='#9ca3af';ctx.font='12px sans-serif';
        ctx.fillText(bs.s,sx+iw/2,by2+bh2*0.58);
        // Label
        ctx.fillStyle='#6b7280';ctx.font='11px sans-serif';
        ctx.fillText(bs.l,sx+iw/2,by2+bh2*0.8);
        ctx.textAlign='left';
      });
      return bh2;
    };

    // Footer
    const drawFooter = (x,y,w) => {
      ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();
      ctx.fillStyle='#4b5563';ctx.font='14px monospace';ctx.fillText('Generated '+new Date().toLocaleDateString(),x,y+18);
      ctx.textAlign='right';ctx.fillText('whisperingwishes.app',x+w,y+18);ctx.textAlign='left';
    };

    // ═══ RENDER ═══
    ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);
    const bgG=ctx.createRadialGradient(W*0.5,H*0.4,0,W*0.5,H*0.4,W*0.5);
    bgG.addColorStop(0,'rgba(237,175,24,0.008)');bgG.addColorStop(1,'transparent');
    ctx.fillStyle=bgG;ctx.fillRect(0,0,W,H);

    const M=18,ox=M,oy=M,ow=W-M*2,oh=H-M*2;
    drawShell(ox,oy,ow,oh);
    const hH=drawHeader(ox+1,oy+1,ow-2);
    const P=15,bx=ox+P,bw=ow-P*2;
    const footH=30;
    let Y=oy+1+hH+P;
    const bottomY=oy+oh-footH-P;

    if(!isPortrait){
      // ═══ LANDSCAPE 1920x1080 — content-adaptive ═══
      const gap=9;
      const leftW=Math.floor(bw*0.35);
      const rightX=bx+leftW+gap;
      const rightW=bw-leftW-gap;
      const contentH=bottomY-Y;

      // Hero image takes top of left column
      const heroH=Math.floor(contentH*0.32);
      drawHero(bx,Y,leftW,heroH);

      // Profile + Stats + Pity Distribution below hero — fills rest of left
      const idY=Y+heroH+gap;
      const idH=contentH-heroH-gap;
      const idOff=drawPanel(bx,idY,leftW,idH,'Profile');
      ctx.fillStyle='#f1f5f9';ctx.font='bold 30px sans-serif';ctx.fillText(uname,bx+15,idY+idOff+21);
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('UID',bx+15,idY+idOff+45);
      ctx.fillStyle='#e2e8f0';ctx.font='18px monospace';ctx.fillText(uid,bx+48,idY+idOff+45);
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('Server',bx+15,idY+idOff+66);
      ctx.fillStyle='#edaf18';ctx.font='18px monospace';ctx.fillText(svr,bx+72,idY+idOff+66);
      if(lr)drawLuck(bx+15,idY+idOff+87,leftW-135);
      const metaY=idY+idOff+(lr?117:90);
      ctx.fillStyle='#6b7280';ctx.font='12px sans-serif';
      let metaLine1='';
      if(tList.length>0)metaLine1+=tList.length+' Trophies';
      if(impDate)metaLine1+=(metaLine1?' · ':'')+impDate;
      if(metaLine1)ctx.fillText(metaLine1,bx+15,metaY);
      if(overallStats?.totalAstrite)ctx.fillText(overallStats.totalAstrite.toLocaleString()+' Astrite',bx+15,metaY+16);
      // Convene Stats inside profile panel
      const statCellH=36,statStartY=metaY+(overallStats?.totalAstrite?36:21);
      drawStats(bx+9,statStartY,leftW-18,statCellH,16);
      // Pity Distribution below stats inside profile panel
      const histoY=statStartY+(statCellH+8)*2-8+15;
      const histoH=idY+idH-histoY-9;
      if(histSummary&&histoH>40){
        ctx.strokeStyle='rgba(255,255,255,0.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx+15,histoY-6);ctx.lineTo(bx+leftW-15,histoY-6);ctx.stroke();
        ctx.fillStyle='#e2e8f0';ctx.font='600 13px sans-serif';ctx.fillText('Pity Distribution',bx+15,histoY+6);
        drawHisto(bx+9,histoY+15,leftW-18,histoH-15);
        ctx.fillStyle='#4b5563';ctx.font='11px sans-serif';ctx.textAlign='right';ctx.fillText('Lo '+histSummary.lo+' | Avg '+histSummary.avg+' | Hi '+histSummary.hi,bx+leftW-12,idY+idH-6);ctx.textAlign='left';
      }

      // ── Right column: Collection → Resonators → Trophies → Banner Breakdown ──
      const panelPad=39;
      const collH=panelPad+48+6;
      const trophyCols=Math.max(tList.length,1),trophyGap=8;
      const trophyCellSize=Math.min(160,Math.floor((rightW-18-(trophyCols-1)*trophyGap)/trophyCols));
      const trophyPanelH=panelPad+trophyCellSize+6;
      const bannerH=panelPad+72+6; // banner breakdown panel height

      const resCols=10,resGap2=6;
      const resMax=Math.min(newestRes.length,20);
      const resCellW=(rightW-18-(resCols-1)*resGap2)/resCols,resCellH=Math.round(resCellW*1.6);
      const resRows=Math.ceil(Math.max(resMax,1)/resCols);
      const resContentH=panelPad+resRows*(resCellH+resGap2)-resGap2+6+(newestRes.length>resMax?21:0);

      // Draw Row 1: Collection (full width)
      const cp1o=drawPanel(rightX,Y,rightW,collH,'Collection');
      drawColl(rightX+9,Y+cp1o,rightW-18);

      // Draw Row 2: Resonators — sized to content, fills width
      const r2Y=Y+collH+gap;
      const rp1o=drawPanel(rightX,r2Y,rightW,resContentH,'Resonators ('+newestRes.length+')');
      drawResTags(rightX+9,r2Y+rp1o,rightW-18,10,resMax);

      // Draw Row 3: Trophies — fixed height, centered
      const r3Y=r2Y+resContentH+gap;
      if(tList.length>0){
        const tp1o=drawPanel(rightX,r3Y,rightW,trophyPanelH,'Trophies ('+tList.length+')');
        tList.forEach((t,i)=>{drawTrophy(rightX+9+i*(trophyCellSize+trophyGap),r3Y+tp1o,trophyCellSize,t);});
      }

      // Draw Row 4: Banner Breakdown — fills remaining
      const r4Y=r3Y+(tList.length>0?trophyPanelH:0)+gap;
      const r4H=bottomY-r4Y;
      if(r4H>60){
        const bp1o=drawPanel(rightX,r4Y,rightW,r4H,'Convene Breakdown');
        drawBannerRow(rightX+9,r4Y+bp1o,rightW-18,r4H-bp1o-6);
      }

      drawFooter(bx,bottomY,bw);

    } else {
      // ═══ PORTRAIT 1080x1920 — content-adaptive ═══
      const gap=9;
      const contentH=bottomY-Y;

      // ── Top: Hero + Profile (with stats inside) side by side ──
      const heroW=Math.floor(bw*0.38);
      // Profile needs: panelPad(39) + name(30) + UID(24) + Server(24) + luck(27+18) + meta(18) + stats(2 rows * (51+8) - 8) = ~280
      const pStatCellH=51,pPad=39;
      const profileMinH=pPad+30+24+24+(lr?45:0)+18+(pStatCellH+8)*2-8+15;
      const heroH=Math.max(Math.floor(contentH*0.22),profileMinH);
      drawHero(bx,Y,heroW,heroH);

      const ix=bx+heroW+gap,iw=bw-heroW-gap;
      const idOff=drawPanel(ix,Y,iw,heroH,'Profile');
      ctx.fillStyle='#f1f5f9';ctx.font='bold 33px sans-serif';ctx.fillText(uname,ix+15,Y+idOff+21);
      const uidLY=Y+idOff+48;
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('UID',ix+15,uidLY);
      ctx.fillStyle='#e2e8f0';ctx.font='18px monospace';ctx.fillText(uid,ix+48,uidLY);
      ctx.fillStyle='#9ca3af';ctx.font='14px sans-serif';ctx.fillText('Server',ix+15,uidLY+24);
      ctx.fillStyle='#edaf18';ctx.font='18px monospace';ctx.fillText(svr,ix+72,uidLY+24);
      if(lr)drawLuck(ix+15,uidLY+51,iw-135);
      const metaY2=uidLY+(lr?84:57);
      ctx.fillStyle='#6b7280';ctx.font='12px sans-serif';
      let metaLine='';
      if(tList.length>0)metaLine+=tList.length+' Trophies';
      if(impDate)metaLine+=(metaLine?' · ':'')+impDate;
      if(overallStats?.totalAstrite)metaLine+=(metaLine?' · ':'')+overallStats.totalAstrite.toLocaleString()+' Astrite';
      if(metaLine)ctx.fillText(metaLine,ix+15,metaY2);
      // Convene Stats inside profile panel
      const pStatY=metaY2+30;
      drawStats(ix+9,pStatY,iw-18,pStatCellH,22);

      Y+=heroH+gap;

      // Pre-calculate content heights for adaptive layout
      const pCollH=pPad+48+6;
      const pHistoH=144;
      const pResCols=8,pResGap2=6;
      const pResMax=Math.min(newestRes.length,24);
      const pResCellW=(bw-18-(pResCols-1)*pResGap2)/pResCols,pResCellH=Math.round(pResCellW*1.6);
      const pResRows=Math.ceil(Math.max(pResMax,1)/pResCols);
      const pResContentH=pPad+pResRows*(pResCellH+pResGap2)-pResGap2+6+(newestRes.length>pResMax?21:0);
      const pTrophyCols=Math.max(tList.length,1),pTrophyGap=8;
      const pTrophySize=Math.min(200,Math.floor((bw-18-(pTrophyCols-1)*pTrophyGap)/pTrophyCols));
      const pTrophyPanelH=pPad+pTrophySize+6;
      const pBannerH=pPad+80+6; // banner breakdown

      // ── Pity Distribution ──
      const hp2o=drawPanel(bx,Y,bw,pHistoH,'Pity Distribution');
      if(histSummary){drawHisto(bx+9,Y+hp2o,bw-18,pHistoH-hp2o-12);
        ctx.fillStyle='#4b5563';ctx.font='11px sans-serif';ctx.textAlign='right';ctx.fillText('Low '+histSummary.lo+' | Avg '+histSummary.avg+' | High '+histSummary.hi,bx+bw-12,Y+pHistoH-5);ctx.textAlign='left';}
      Y+=pHistoH+gap;

      // ── Collection ──
      const cp2o=drawPanel(bx,Y,bw,pCollH,'Collection');
      drawColl(bx+9,Y+cp2o,bw-18);
      Y+=pCollH+gap;

      // ── Resonators — fills width ──
      const rp2o=drawPanel(bx,Y,bw,pResContentH,'Resonators ('+newestRes.length+')');
      drawResTags(bx+9,Y+rp2o,bw-18,8,pResMax);
      Y+=pResContentH+gap;

      // ── Trophies — fixed height, centered ──
      if(tList.length>0){
        const tp2o=drawPanel(bx,Y,bw,pTrophyPanelH,'Trophies ('+tList.length+')');
        tList.forEach((t,i)=>{drawTrophy(bx+9+i*(pTrophySize+pTrophyGap),Y+tp2o,pTrophySize,t);});
        Y+=pTrophyPanelH+gap;
      }

      // ── Banner Breakdown — fills remaining ──
      const pRemaining=bottomY-Y;
      if(pRemaining>60){
        const bp2o=drawPanel(bx,Y,bw,pRemaining,'Convene Breakdown');
        drawBannerRow(bx+9,Y+bp2o,bw-18,pRemaining-bp2o-6);
      }

      drawFooter(bx,bottomY,bw);
    }

    try {
      canvas.toBlob(blob=>{
        if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement('a');
        a.href=url;a.download='resonator-id-'+(state.profile.username||state.profile.uid||'card')+(isPortrait?'-portrait':'')+'.png';
        a.click();URL.revokeObjectURL(url);toast?.addToast?.('ID Card saved!','success');
      },'image/png');
    } catch (e) {
      console.error('ID card export failed (possible CORS tainted canvas):', e);
      toast?.addToast?.('Failed to save ID card — try a different profile image', 'error');
    }
  }, [state.profile, state.server, overallStats, luckRating, ownedCharNames, collectionImages, toast, idCardFormat, trophies]);

  // Daily income calculation
  const dailyIncome = useMemo(() => {
    return (state.planner.dailyAstrite || 0) + (state.planner.luniteActive ? LUNITE_DAILY_ASTRITE : 0);
  }, [state.planner.dailyAstrite, state.planner.luniteActive]);

  // Plan tab pre-computed values
  const planData = useMemo(() => {
    const currentAstrite = +state.calc.astrite || 0;
    const bannerEnd = new Date(bannerEndDate);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((bannerEnd - now) / 86400000));
    const incomeByEnd = dailyIncome * daysLeft;
    const totalAstriteByEnd = currentAstrite + incomeByEnd;
    const convenesByEnd = Math.floor(totalAstriteByEnd / ASTRITE_PER_PULL) + (
      state.calc.bannerCategory === 'featured'
        ? (state.calc.selectedBanner === 'both' 
            ? (+state.calc.radiant || 0) + (+state.calc.forging || 0)
            : state.calc.selectedBanner === 'weap' ? (+state.calc.forging || 0) : (+state.calc.radiant || 0))
        : (+state.calc.lustrous || 0)
    );
    const isFeatured = state.calc.bannerCategory === 'featured';
    const isChar = state.calc.selectedBanner === 'char';
    const isWeap = state.calc.selectedBanner === 'weap';
    let goalCopies = 1;
    let goalBannerLabel = '';
    if (isFeatured) {
      if (isChar) { goalCopies = Math.max(1, state.calc.charCopies || 1); goalBannerLabel = 'Featured Resonator'; }
      else if (isWeap) { goalCopies = Math.max(1, state.calc.weapCopies || 1); goalBannerLabel = 'Featured Weapon'; }
      else { goalCopies = Math.max(1, state.calc.charCopies || 1, state.calc.weapCopies || 1); goalBannerLabel = 'Featured Both'; }
    } else {
      if (isChar) { goalCopies = Math.max(1, state.calc.stdCharCopies || 1); goalBannerLabel = 'Standard Resonator'; }
      else if (isWeap) { goalCopies = Math.max(1, state.calc.stdWeapCopies || 1); goalBannerLabel = 'Standard Weapon'; }
      else { goalCopies = Math.max(1, state.calc.stdCharCopies || 1, state.calc.stdWeapCopies || 1); goalBannerLabel = 'Standard Both'; }
    }
    const targetPulls = Math.max(1, state.planner.goalPulls * goalCopies * state.planner.goalModifier);
    const targetAstrite = targetPulls * ASTRITE_PER_PULL;
    const goalNeeded = Math.max(0, targetAstrite - currentAstrite);
    const goalDaysNeeded = goalNeeded <= 0 ? 0 : (dailyIncome > 0 ? Math.ceil(goalNeeded / dailyIncome) : Infinity);
    const goalProgress = targetAstrite > 0 ? Math.min(100, (currentAstrite / targetAstrite) * 100) : 0;
    return { currentAstrite, daysLeft, incomeByEnd, totalAstriteByEnd, convenesByEnd, isFeatured, goalCopies, goalBannerLabel, targetPulls, targetAstrite, goalNeeded, goalDaysNeeded, goalProgress };
  }, [state.calc, state.planner.goalPulls, state.planner.goalModifier, bannerEndDate, dailyIncome]);

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
    // Rover is a free starter character — always count as obtained (minimum 1 copy)
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

  // P4-FIX: Hoisted collection mask gradient — eliminates 5 identical recomputations in collection grids
  const collectionMaskData = useMemo(() => ({
    collMask: generateVerticalMaskGradient(visualSettings.collectionFadePosition, visualSettings.collectionFadeIntensity, visualSettings.collectionFadeDirection),
    collOpacity: visualSettings.collectionOpacity / 100,
  }), [visualSettings.collectionFadePosition, visualSettings.collectionFadeIntensity, visualSettings.collectionFadeDirection, visualSettings.collectionOpacity]);

  // P2-FIX: Memoized stats tab data — eliminates 5+ independent allHist concatenations per render
  // All Stats tab IIFEs now read from this single precomputed dataset
  const statsTabData = useMemo(() => {
    const featured = state.profile.featured?.history || [];
    const weapon = state.profile.weapon?.history || [];
    const stdChar = state.profile.standardChar?.history || [];
    const stdWeap = state.profile.standardWeap?.history || [];
    const beginner = state.profile.beginner?.history || [];
    
    // Single concatenation — used by histogram, chart, and total obtained
    const allHist = [...featured, ...weapon, ...stdChar, ...stdWeap];
    
    // 5★ with pity > 0 — used by histogram
    const fiveStars = allHist.filter(p => p.rarity === 5 && p.pity > 0);
    
    // Pull log — all pulls with banner labels, 5★ only, sorted newest first
    // Includes beginner banner for complete 5★ visibility
    const pullLogFiveStars = [
      ...featured.map(p => ({...p, banner: 'Featured'})),
      ...weapon.map(p => ({...p, banner: 'Weapon'})),
      ...stdChar.map(p => ({...p, banner: 'Std Char'})),
      ...stdWeap.map(p => ({...p, banner: 'Std Weap'})),
      ...beginner.map(p => ({...p, banner: 'Beginner'})),
    ].filter(p => p.rarity === 5 && p.name).sort((a, b) => new Date(b.timestamp ?? 0) - new Date(a.timestamp ?? 0));
    
    // Total obtained — resonator and weapon histories including beginner banner
    const resHist = [...featured, ...stdChar, ...beginner.filter(p => p.name && ALL_CHARACTERS.has(p.name))];
    const wepHist = [...weapon, ...stdWeap, ...beginner.filter(p => p.name && !ALL_CHARACTERS.has(p.name))];
    const totalObtained = {
      res5: resHist.filter(p => p.rarity === 5).length,
      res4: resHist.filter(p => p.rarity === 4).length,
      wep5: wepHist.filter(p => p.rarity === 5).length,
      wep4: wepHist.filter(p => p.rarity === 4).length,
      wep3: wepHist.filter(p => p.rarity === 3).length,
    };
    
    // Histogram buckets
    const histogramBuckets = {};
    fiveStars.forEach(p => {
      // Clamp pity >80 into an overflow bucket
      if (p.pity > HARD_PITY) { // P7-FIX: Overflow bucket for out-of-range pity (7A)
        histogramBuckets[`${HARD_PITY+1}+`] = (histogramBuckets[`${HARD_PITY+1}+`] ?? 0) + 1;
      } else {
        const bucket = Math.floor((p.pity - 1) / 10) * 10 + 1;
        const label = `${bucket}-${bucket + 9}`;
        histogramBuckets[label] = (histogramBuckets[label] ?? 0) + 1;
      }
    });
    const allBucketLabels = Array.from({length: HARD_PITY / 10}, (_, i) => `${i*10+1}-${(i+1)*10}`); // P7-FIX: Data-driven bucket labels (7E)
    // Only add 81+ bucket if there are pulls in it
    if (histogramBuckets['81+']) allBucketLabels.push('81+');
    allBucketLabels.forEach(b => { if (!histogramBuckets[b]) histogramBuckets[b] = 0; });
    
    const histogramStats = fiveStars.length >= 2 ? {
      maxCount: Math.max(...Object.values(histogramBuckets), 1),
      avgPity: fiveStars.length > 0 ? (fiveStars.reduce((sum, p) => sum + p.pity, 0) / fiveStars.length).toFixed(1) : '0', // P7-FIX: Guard division by zero (7A)
      minPity: fiveStars.length ? Math.min(...fiveStars.map(p => p.pity)) : 0,
      maxPity: fiveStars.length ? Math.max(...fiveStars.map(p => p.pity)) : 0,
    } : null;
    
    return { allHist, fiveStars, pullLogFiveStars, totalObtained, histogramBuckets, allBucketLabels, histogramStats };
  }, [state.profile.featured?.history, state.profile.weapon?.history, state.profile.standardChar?.history, state.profile.standardWeap?.history, state.profile.beginner?.history]);

  // Shared import processor for both file and paste methods
  // Name normalization: maps game API / tracker names to internal names used in this app
  const IMPORT_NAME_ALIASES = useMemo(() => ({
    'The Shorekeeper': 'Shorekeeper',
    'Rover (Spectro)': 'Rover', 'Rover (Havoc)': 'Rover', 'Rover (Aero)': 'Rover',
    'Rover-Spectro': 'Rover', 'Rover-Havoc': 'Rover', 'Rover-Aero': 'Rover',
  }), []);

  const processImportData = useCallback((jsonString) => {
    try {
      // P10-FIX: Check raw string size before parsing to prevent expansion attacks (Step 6 audit)
      if (jsonString.length > MAX_IMPORT_SIZE_MB * 1024 * 1024) {
        throw new Error(`Import data too large (${(jsonString.length / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_IMPORT_SIZE_MB}MB.`);
      }
      const data = JSON.parse(jsonString);
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid data format — expected a JSON object');
      }
      const pulls = data.pulls || data.conveneHistory || data.history || [];
      if (!Array.isArray(pulls)) {
        throw new Error('Invalid data — "pulls" must be an array');
      }
      if (pulls.length === 0) {
        throw new Error('No pull data found in import');
      }
      
      // Validate pull entries have minimum required fields
      const MIN_VALID_DATE = new Date('2024-05-01T00:00:00').getTime(); // P7-FIX: Explicit time avoids UTC midnight shift (7F) // WuWa launch window
      const MAX_VALID_DATE = Date.now() + 86400000; // tomorrow (allow slight clock drift)
      const validPulls = pulls.filter(p => {
        if (typeof p !== 'object' || p === null) return false;
        const hasType = p.bannerType ?? p.cardPoolType ?? p.gachaType;
        const hasName = p.name || p.resourceName;
        // Validate timestamp if present
        const ts = p.timestamp || p.time;
        if (ts) {
          const d = new Date(ts).getTime();
          if (isNaN(d) || d < MIN_VALID_DATE || d > MAX_VALID_DATE) return false;
        }
        return hasType && hasName;
      });
      
      if (validPulls.length === 0) {
        throw new Error('No valid pull entries found — check data format');
      }
      
      // Auto-save pre-import backup (mirrors restore flow) so users can recover if import corrupts data
      try {
        const preImportBackup = JSON.stringify({ timestamp: new Date().toISOString(), version: APP_VERSION, state: stateRef.current, _preImport: true });
        localStorage.setItem('whispering-wishes-pre-import-backup', preImportBackup);
      } catch {} // best-effort — don't block import if backup fails

      const convert = (arr, type) => {
        const filtered = arr.filter(p => {
          const poolType = p.cardPoolType ?? p.gachaType;
          if (type === 'featured') return p.bannerType === 'featured' || p.bannerType === 'character' || poolType === 1;
          if (type === 'weapon') return p.bannerType === 'weapon' || poolType === 2;
          if (type === 'standardChar') return p.bannerType === 'standard-char' || poolType === 3;
          if (type === 'standardWeap') return p.bannerType === 'standard-weapon' || poolType === 4;
          if (type === 'beginner') return p.bannerType === 'beginner' || poolType === 5 || poolType === 6 || poolType === 7;
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
              // Weapon Event Convene has NO 50/50 — every 5★ is always the featured weapon.
              // won5050 is always null (not applicable) for weapon event banners.
              won5050 = null;
            }
            pityCounter = 0;
          }
          
          // Ensure timestamp is always a valid ISO string
          const rawTs = p.timestamp || p.time;
          const tsMs = rawTs ? new Date(rawTs).getTime() : NaN;
          const safeTimestamp = isNaN(tsMs) ? new Date().toISOString() : new Date(tsMs).toISOString();

          return {
            id: p.id || `imp_${generateUniqueId()}_${i}`,
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
          // Weapon Event Convene has no 50/50 — guaranteed is only relevant for character banners
          const guaranteed = type === 'featured' && lastFive?.won5050 === false;
          dispatch({ type: 'IMPORT_HISTORY', bannerType: type, history, pity5: currentPity5, pity4: currentPity4, guaranteed, uid: data.uid || data.playerId });
          totalImported += history.length;
        }
      });
      
      const fc = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === 1).length;
      const wc = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === 2).length;
      const sc = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === 3).length;
      const sw = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === 4).length;
      const bc = pulls.filter(p => [5, 6, 7].includes(p.cardPoolType ?? p.gachaType)).length;
      const parts = [];
      if (fc) parts.push(`${fc} char`);
      if (wc) parts.push(`${wc} weap`);
      if (sc + sw) parts.push(`${sc + sw} std`);
      if (bc) parts.push(`${bc} beg`);
      
      toast?.addToast?.(`Imported ${totalImported} Convenes! (${parts.join(', ')})`, 'success');
      
      // P12-FIX: Check storage capacity after import (Step 14 audit — LOW-10a)
      if (storageAvailable) {
        try {
          const currentSize = (localStorage.getItem(STORAGE_KEY) || '').length;
          if (currentSize > STORAGE_WARNING_THRESHOLD) {
            toast?.addToast?.(`Storage at ${(currentSize / 1024 / 1024).toFixed(1)}MB of ~5MB. Consider exporting a backup.`, 'warning');
          }
        } catch {}
      }
      
      return true;
    } catch (err) { 
      toast?.addToast?.('Import failed: ' + err.message, 'error'); 
      return false;
    }
  }, [toast, dispatch, IMPORT_NAME_ALIASES]);

  const handleFileImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_IMPORT_SIZE = MAX_IMPORT_SIZE_MB * 1024 * 1024; // P9-FIX: Use module constant (Step 4 audit)
    if (file.size > MAX_IMPORT_SIZE) {
      toast?.addToast?.(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_IMPORT_SIZE_MB}MB.`, 'error');
      e.target.value = '';
      return;
    }
    setImportStatus({ fileName: file.name, fileSize: (file.size / 1024).toFixed(1) });
    const reader = new FileReader();
    reader.onload = (ev) => {
      processImportData(ev.target.result);
      setImportStatus(null);
    };
    reader.onerror = () => {
      toast?.addToast?.('Failed to read file', 'error');
      setImportStatus(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [processImportData, toast]);

  // P8-FIX: MED — Drag-and-drop handler for file upload area
  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      toast?.addToast?.('Please drop a .json file', 'error');
      return;
    }
    const MAX_IMPORT_SIZE = MAX_IMPORT_SIZE_MB * 1024 * 1024; // P9-FIX: Use module constant (Step 4 audit)
    if (file.size > MAX_IMPORT_SIZE) {
      toast?.addToast?.(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_IMPORT_SIZE_MB}MB.`, 'error');
      return;
    }
    setImportStatus({ fileName: file.name, fileSize: (file.size / 1024).toFixed(1) });
    const reader = new FileReader();
    reader.onload = (ev) => { processImportData(ev.target.result); setImportStatus(null); };
    reader.onerror = () => { setImportStatus(null); };
    reader.readAsText(file);
  }, [processImportData, toast]);

  const handlePasteImport = useCallback(() => {
    if (!pasteJsonText.trim()) {
      toast?.addToast?.('Please paste your JSON data first', 'error');
      return;
    }
    const success = processImportData(pasteJsonText);
    if (success) {
      setPasteJsonText('');
    }
  }, [pasteJsonText, processImportData, toast]);

  // Export data — includes main state + auxiliary localStorage settings for full round-trip
  const handleExport = useCallback(() => {
    const aux = {};
    try { const v = localStorage.getItem(VISUAL_SETTINGS_KEY); if (v) aux.visualSettings = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem(IMAGE_FRAMING_KEY); if (v) aux.imageFraming = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem(COLLECTION_IMAGES_KEY); if (v) aux.collectionImages = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem(TROPHY_OVERRIDES_KEY); if (v) aux.trophyOverrides = JSON.parse(v); } catch {}
    const data = { timestamp: new Date().toISOString(), version: APP_VERSION, state, ...(Object.keys(aux).length > 0 ? { aux } : {}) };
    const jsonStr = JSON.stringify(data, null, 2);
    setExportData(jsonStr);
    setShowExportModal(true);
  }, [state]);

  // Handle onboarding complete
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    dispatch({ type: 'SET_SETTINGS', field: 'showOnboarding', value: false });
  }, []);

  // Secret admin access - tap version 5 times quickly
  const handleAdminTap = useCallback(async () => {
    if (adminTapTimerRef.current) clearTimeout(adminTapTimerRef.current);
    haptic.light();
    adminTapCountRef.current += 1;
    const newCount = adminTapCountRef.current;
    setAdminTapCount(newCount);
    if (newCount >= 5) {
      // Check if admin is currently locked out (5-min cooldown)
      try {
        const lockoutUntil = localStorage.getItem('ww-admin-lockout');
        if (lockoutUntil && Date.now() < parseInt(lockoutUntil, 10)) {
          const remaining = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 60000);
          toast?.addToast?.(`Admin locked for ${remaining}m. Try again later.`, 'error');
          adminTapCountRef.current = 0;
          setAdminTapCount(0);
          return;
        }
        // Clear expired lockout
        if (lockoutUntil) {
          localStorage.removeItem('ww-admin-lockout');
          localStorage.removeItem('ww-admin-fails');
        }
      } catch {}
      
      // Open admin panel — authentication happens inside via user-set password
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

  // Save custom banners
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
  }, [toast]);

  // P13-FIX: CRITICAL-2 — Upgraded from plain SHA-256 to PBKDF2 with 100k iterations.
  // SHA-256 is ~10B hashes/sec on GPU; PBKDF2-100k reduces throughput to ~100k/sec, making
  // brute-force of passwords < 12 chars significantly harder (minutes → months).
  // For true security, admin auth should move to a backend service with Argon2.
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
  // Legacy SHA-256 hasher — kept for backward compatibility with existing ADMIN_HASH
  const hashPasswordSHA256 = useCallback(async (password, salt = '') => {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + password));
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error('crypto.subtle unavailable (requires HTTPS):', e);
      return null;
    }
  }, []);

  // P13-FIX: HIGH-4 — Session-based lockout tracking (survives localStorage clearing / incognito)
  const adminSessionFailsRef = useRef(0);
  const adminSessionLockUntilRef = useRef(0);

  // Verify admin password (with failed attempt tracking → 5-min admin-only cooldown)
  const verifyAdminPassword = useCallback(async () => {
    if (!adminPassword || adminPassword.length < 4) {
      toast?.addToast?.('Password must be at least 4 characters', 'error');
      return;
    }

    // P13-FIX: HIGH-4 — Check BOTH session-based and localStorage lockout (cannot bypass either)
    const now = Date.now();
    if (adminSessionLockUntilRef.current > now) {
      const remaining = Math.ceil((adminSessionLockUntilRef.current - now) / 60000);
      toast?.addToast?.(`Too many failed attempts. Try again in ${remaining}m.`, 'error');
      return;
    }
    try {
      const lockoutUntil = localStorage.getItem('ww-admin-lockout');
      if (lockoutUntil && now < parseInt(lockoutUntil, 10)) {
        const remaining = Math.ceil((parseInt(lockoutUntil, 10) - now) / 60000);
        toast?.addToast?.(`Too many failed attempts. Try again in ${remaining}m.`, 'error');
        return;
      }
    } catch {}

    // P13-FIX: CRITICAL-2 — Try PBKDF2 first, fall back to legacy SHA-256 for existing hash
    const pbkdf2Hash = await hashPasswordPBKDF2(adminPassword, ADMIN_SALT);
    const saltedHash = await hashPasswordSHA256(adminPassword, ADMIN_SALT);
    const legacyHash = await hashPasswordSHA256(adminPassword);
    if (!saltedHash && !legacyHash && !pbkdf2Hash) {
      toast?.addToast?.('Hashing unavailable — HTTPS required', 'error');
      return;
    }
    // Constant-time comparison to prevent timing attacks on admin hash
    if (constantTimeCompare(pbkdf2Hash, ADMIN_HASH) || constantTimeCompare(saltedHash, ADMIN_HASH) || constantTimeCompare(legacyHash, ADMIN_HASH)) {
      setAdminUnlocked(true);
      setAdminPassword(''); // Clear plaintext password from React state after successful auth
      adminSessionFailsRef.current = 0;
      setBannerForm(buildBannerForm(activeBanners));
      try { localStorage.setItem('ww-admin-fails', '0'); } catch {}
    } else {
      // Wrong password — increment fails in BOTH session ref and localStorage
      adminSessionFailsRef.current += 1;
      const sessionFails = adminSessionFailsRef.current;
      try {
        const storageFails = parseInt(localStorage.getItem('ww-admin-fails') || '0', 10) + 1;
        localStorage.setItem('ww-admin-fails', storageFails.toString());
        // Lock if EITHER tracker exceeds limit
        const totalFails = Math.max(sessionFails, storageFails);
        if (totalFails >= MAX_ADMIN_ATTEMPTS) {
          const lockoutTime = now + ADMIN_LOCKOUT_MS;
          adminSessionLockUntilRef.current = lockoutTime;
          localStorage.setItem('ww-admin-lockout', lockoutTime.toString());
          setAdminLockedUntil(lockoutTime);
          setShowAdminPanel(false);
          setAdminPassword('');
          toast?.addToast?.('Too many failed attempts. Admin locked for 5 minutes.', 'error');
        } else {
          toast?.addToast?.(`Incorrect password (${MAX_ADMIN_ATTEMPTS - totalFails} attempts remaining)`, 'error');
        }
      } catch {
        // localStorage unavailable — use session tracking only
        if (sessionFails >= MAX_ADMIN_ATTEMPTS) {
          adminSessionLockUntilRef.current = now + ADMIN_LOCKOUT_MS;
          setShowAdminPanel(false);
          setAdminPassword('');
          toast?.addToast?.('Too many failed attempts. Admin locked for 5 minutes.', 'error');
        } else {
          toast?.addToast?.(`Incorrect password (${MAX_ADMIN_ATTEMPTS - sessionFails} attempts remaining)`, 'error');
        }
      }
    }
  }, [adminPassword, toast, hashPasswordPBKDF2, hashPasswordSHA256]);

  const headerControlBg = { backgroundColor: 'rgba(15, 20, 28, 0.9)' };

  return (
    <div className={`desktop-layout min-h-screen ${visualSettings.oledMode ? 'oled-mode' : ''} ${visualSettings.animationsEnabled === 'off' ? 'no-animations' : ''} ${visualSettings.animationsEnabled === 'full' ? 'animations-full' : ''}`}>
      <BackgroundGlow oledMode={visualSettings.oledMode} animationsEnabled={visualSettings.animationsEnabled} />
      <TriangleMirrorWave oledMode={visualSettings.oledMode} animationsEnabled={visualSettings.animationsEnabled} />
      <KuroStyles oledMode={visualSettings.oledMode} />

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      
      {/* P12-FIX: Skip to content link for keyboard users (Step 11 audit — MEDIUM-6n) */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-yellow-500 focus:text-black focus:rounded-lg focus:font-bold focus:text-sm">
        Skip to content
      </a>
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-medium)]" style={{backgroundColor: visualSettings.oledMode ? 'rgba(0, 0, 0, 0.98)' : 'rgba(8, 12, 18, 0.92)', backdropFilter: 'blur(20px)', paddingTop: 'env(safe-area-inset-top, 0px)'}}>
        <div className="header-inner max-w-lg md:max-w-2xl lg:max-w-none mx-auto px-3">
          <div className="header-top flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative group cursor-pointer" onClick={async () => {
                if (pwa?.canInstall) {
                  const accepted = await pwa.promptInstall();
                  if (accepted) toast?.addToast?.('App installed successfully!', 'success');
                } else if (pwa?.isInstalled) {
                  toast?.addToast?.('App is already installed', 'success');
                } else {
                  toast?.addToast?.('Use your browser menu to add to home screen', 'info');
                }
              }} title={pwa?.canInstall ? 'Install App' : pwa?.isInstalled ? 'App installed' : 'Add to home screen'}>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" aria-hidden="true" />
                <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg group-hover:scale-[1.02] transition-transform">
                  <img src={HEADER_ICON} alt="Whispering Wishes logo" className="w-full h-full object-cover" />
                </div>
                {pwa?.canInstall && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center shadow-md" aria-hidden="true">
                    <Download size={9} className="text-black" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm tracking-wide">Whispering Wishes</h1>
                <p className="text-yellow-400/50 text-[10px] tracking-wider uppercase">Wuthering Waves - Companion</p>
              </div>
            </div>
            <div className="header-controls flex items-center gap-1.5">
              <button onClick={() => setShowServerDropdown(true)} aria-label="Select server region" className="text-gray-300 text-[10px] px-2.5 py-1.5 rounded-lg border border-[var(--border-medium)] focus:border-yellow-500/50 focus:outline-none transition-all min-h-[44px] flex items-center gap-1.5" style={headerControlBg}>
                {state.server} <ChevronDown size={10} />
              </button>
              <button onClick={handleExport} aria-label="Export backup" className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-[var(--border-medium)] text-gray-400 hover:text-yellow-400 hover:border-yellow-500/30 hover:bg-yellow-500/10 active:scale-95 transition-all" style={headerControlBg}>
                <Download size={14} />
              </button>
            </div>
          </div>
          <nav ref={tabNavRef} className="relative flex justify-between -mb-px overflow-x-auto scrollbar-hide pb-1" role="tablist" aria-label="Main navigation" onKeyDown={(e) => {
              const tabs = ['tracker','events','calculator','planner','analytics','gathering','teams','profile'];
              const idx = tabs.indexOf(activeTab);
              let newTab;
              if (e.key === 'ArrowRight') { e.preventDefault(); newTab = tabs[(idx + 1) % tabs.length]; }
              else if (e.key === 'ArrowLeft') { e.preventDefault(); newTab = tabs[(idx - 1 + tabs.length) % tabs.length]; }
              if (newTab) { setActiveTab(newTab); setTimeout(() => document.getElementById(`tab-${newTab}`)?.focus(), FOCUS_DELAY_MS); }
            }}>
            <div className="tab-indicator" />
            <TabButton active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')} tabRef={tabNavRef} tabId="tracker"><Sparkles size={18} /> Tracker</TabButton>
            <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} tabRef={tabNavRef} tabId="events"><Calendar size={18} /> Events</TabButton>
            <TabButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} tabRef={tabNavRef} tabId="calculator"><Calculator size={18} /> Calc</TabButton>
            <TabButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} tabRef={tabNavRef} tabId="planner"><TrendingUp size={18} /> Plan</TabButton>
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} tabRef={tabNavRef} tabId="analytics"><BarChart3 size={18} /> Stats</TabButton>
            <TabButton active={activeTab === 'gathering'} onClick={() => setActiveTab('gathering')} tabRef={tabNavRef} tabId="gathering"><Archive size={18} /> Collection</TabButton>
            <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} tabRef={tabNavRef} tabId="teams"><Users size={18} /> Teams</TabButton>
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} tabRef={tabNavRef} tabId="profile"><User size={18} /> Profile</TabButton>
          </nav>
          {/* P15-FIX: LOW-9 — Visual swipe indicator when swipe navigation is enabled */}
          {visualSettings.swipeNavigation && <div className="swipe-hint text-center text-[10px] text-gray-500 py-0.5" aria-hidden="true">← swipe to navigate →</div>}
        </div>
      </header>

      <main id="main-content" className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-3 py-3 space-y-3 w-full">
        
        {/* [SECTION:TAB-TRACKER] */}
        {activeTab === 'tracker' && (
          <div role="tabpanel" id="tabpanel-tracker" aria-labelledby="tab-tracker" tabIndex="0">
          <TabErrorBoundary tabName="Tracker">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="tracker" glowColor="gold" />

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
                {activeBanners.characters.map(c => (
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
                ))}
              </div>
            )}

            {trackerCategory === 'weapon' && (
              <div className="space-y-2 banner-grid content-layer">
                {activeBanners.weapons.map(w => (
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
                ))}
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
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 breath-zoom holo-5star" style={{ position: 'relative' }}>
                                    {cImg ? (
                                      <img src={cImg} alt={c} className="w-full h-full object-cover object-top" loading="lazy" onError={hideOnError} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[10px] text-yellow-400">{c[0]}</div>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-yellow-400 font-medium truncate">{c}</span>
                                </div>
                              ) : <div className="flex-1" />}
                              {w ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15">
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
            <FocusTrapModal isOpen={showBannerHistory} onClose={() => setShowBannerHistory(false)} className="" ariaLabel="Banner History" onClick={() => setShowBannerHistory(false)} centered>
              <div className="kuro-card w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}><div className="kuro-card-inner overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)]" data-sheet-header>
                  <div className="flex items-center gap-2">
                    <Archive size={14} className="text-purple-400" />
                    <span className="text-white text-sm font-semibold">Banner History</span>
                  </div>
                  <button onClick={() => setShowBannerHistory(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white active:scale-95 transition-all"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2" data-sheet-scroll>
                  {BANNER_HISTORY.map(b => (
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
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15 breath-zoom holo-5star" style={{ position: 'relative' }}>
                                    {cImg ? (
                                      <img src={cImg} alt={c} className="w-full h-full object-cover object-top" loading="lazy" onError={hideOnError} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[10px] text-yellow-400">{c[0]}</div>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-yellow-400 font-medium truncate">{c}</span>
                                </div>
                              ) : <div className="flex-1" />}
                              {w ? (
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 bg-black/30 border-white/15">
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
                </div>
              </div></div>
            </FocusTrapModal>
          </div>
          </TabErrorBoundary>
          </div>
        )}

        {/* [SECTION:TAB-EVENTS] */}
        {activeTab === 'events' && (
          <div role="tabpanel" id="tabpanel-events" aria-labelledby="tab-events" tabIndex="0">
          <TabErrorBoundary tabName="Events">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="events" />

            <Card>
              <CardHeader action={
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveBanners(getActiveBanners());
                      toast?.addToast?.('Banner data refreshed!', 'success');
                    }}
                    className="text-cyan-400 text-[10px] flex items-center gap-1 hover:text-cyan-300 transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <RefreshCcw size={12} /> Refresh
                  </button>
                  <span className="text-gray-400 text-[10px]">Server: {state.server}</span>
                </div>
              }>Time-Gated Content</CardHeader>
              <CardBody>
                {(() => {
                  const eventEntries = Object.entries(EVENTS);
                  const totalAstrite = eventEntries.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards, 10) || 0), 0);
                  const doneKeys = eventEntries.filter(([key]) => state.eventStatus[key] === 'done');
                  const skippedKeys = eventEntries.filter(([key]) => state.eventStatus[key] === 'skipped');
                  const earnedAstrite = doneKeys.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards, 10) || 0), 0);
                  const hasProgress = doneKeys.length > 0 || skippedKeys.length > 0;
                  return (
                    <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 text-xs font-medium">{hasProgress ? 'Astrite Progress' : 'Total Available Astrite'}</span>
                        <span className="text-yellow-400 font-bold text-sm">{hasProgress ? `${earnedAstrite.toLocaleString()} / ${totalAstrite.toLocaleString()}` : totalAstrite.toLocaleString()} Astrite</span>
                      </div>
                      {hasProgress && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full transition-[width] duration-300" style={{ width: `${totalAstrite > 0 ? (earnedAstrite / totalAstrite) * 100 : 0}%` }} />
                          </div>
                          <span className="text-gray-400 text-[10px] flex-shrink-0">{doneKeys.length}/{eventEntries.length} done</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardBody>
            </Card>
            <div className="space-y-2 event-grid">
              {(() => {
                const eventImageMap = {
                  tacticalHologram: activeBanners.tacticalHologramImage,
                  whimperingWastes: activeBanners.whimperingWastesImage,
                  doubledPawns: activeBanners.doubledPawnsImage,
                  towerOfAdversity: activeBanners.towerOfAdversityImage,
                  illusiveRealm: activeBanners.illusiveRealmImage,
                  weeklyBoss: activeBanners.weeklyBossImage,
                  dailyReset: activeBanners.dailyResetImage,
                };
                return Object.entries(EVENTS).map(([key, ev]) => (
                  <EventCard
                    key={key}
                    event={{...ev, key}}
                    server={state.server}
                    bannerImage={eventImageMap[key] || ev.imageUrl}
                    visualSettings={visualSettings}
                    status={state.eventStatus[key]}
                    onStatusChange={(s) => dispatch({ type: 'SET_EVENT_STATUS', eventKey: key, status: s })}
                  />
                ));
              })()}
            </div>
            <p className="text-gray-500 text-[10px] text-center content-layer sticky bottom-0 py-2" style={{ background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)' }}>Reset times based on {state.server} server (UTC{getServerOffset(state.server) >= 0 ? '+' : ''}{getServerOffset(state.server)})</p>
          </div>
          </TabErrorBoundary>
          </div>
        )}

        {/* [SECTION:TAB-CALC] */}
        {activeTab === 'calculator' && (
          <div role="tabpanel" id="tabpanel-calculator" aria-labelledby="tab-calculator" tabIndex="0">
          <TabErrorBoundary tabName="Calculator">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="calc" />
            
            {/* Banner Selection */}
            <Card>
              <CardHeader action={<button onClick={() => setShowBookmarkModal(true)} className="text-purple-400 text-[10px] flex items-center gap-1 hover:text-purple-300 transition-colors" aria-label="Save current state as bookmark"><BookmarkPlus size={12} />Save</button>}>Banner Selection</CardHeader>
              <CardBody className="space-y-3">
                  {/* Featured Banners */}
                  <div className="space-y-2">
                    <div className="kuro-label" id="featured-convene-label">Featured Convene</div>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="featured-convene-label">
                      <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'char'); }} aria-pressed={state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'char'} className={`kuro-btn ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'char' ? 'active-gold' : ''}`}>
                        <Crown size={16} className="mx-auto mb-1.5" />Resonator
                      </button>
                      <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'weap'); }} aria-pressed={state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'weap'} className={`kuro-btn ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'weap' ? 'active-pink' : ''}`}>
                        <Swords size={16} className="mx-auto mb-1.5" />Weapon
                      </button>
                    </div>
                    <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'both'); }} aria-pressed={state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'both'} className={`kuro-btn w-full ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'both' ? 'active-emerald' : ''}`}>
                      <RefreshCcw size={14} className="inline mr-1.5" />Both Featured
                    </button>
                  </div>

                  {/* Standard Banners */}
                  <div className="space-y-2">
                    <div className="kuro-label" id="standard-convene-label">Standard Convene</div>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="standard-convene-label">
                      <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'char'); }} aria-pressed={state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'char'} className={`kuro-btn ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'char' ? 'active-cyan' : ''}`}>
                        <Star size={16} className="mx-auto mb-1.5" />Resonator
                      </button>
                      <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'weap'); }} aria-pressed={state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'weap'} className={`kuro-btn ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'weap' ? 'active-cyan' : ''}`}>
                        <Sword size={16} className="mx-auto mb-1.5 rotate-45" />Weapon
                      </button>
                    </div>
                    <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'both'); }} aria-pressed={state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'both'} className={`kuro-btn w-full ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'both' ? 'active-emerald' : ''}`}>
                      <RefreshCcw size={14} className="inline mr-1.5" />Both Standard
                    </button>
                  </div>

                  {/* 50/50 Toggle */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <button onClick={() => { const newVal = !state.calc.charGuaranteed; setCalc('charGuaranteed', newVal); setCalc('charGuaranteedManual', newVal); }} aria-pressed={state.calc.charGuaranteed} aria-label={state.calc.charGuaranteed ? 'Guaranteed next 5-star: on' : '50/50 active: off'} className={`kuro-btn w-full ${state.calc.charGuaranteed ? 'active-emerald' : 'active-gold'}`}>
                      {state.calc.charGuaranteed ? '✓ Guaranteed (100%)' : '⚠ 50/50 Active'}
                    </button>
                  )}
              </CardBody>
            </Card>

            {/* Pity Counter */}
            <Card>
              <CardHeader>Pity Counter</CardHeader>
              <CardBody className="space-y-3">
                  {/* Featured Character Pity */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label="Featured Resonator" pity={state.calc.charPity} onPityChange={v => setCalc('charPity', v)}
                      copies={state.calc.charCopies} maxCopies={7} onCopiesChange={v => setCalc('charCopies', v)}
                      fourStarCopies={state.calc.char4StarCopies} maxFourStar={21} onFourStarChange={v => setCalc('char4StarCopies', v)}
                      color="#edaf18" softColor="#fb923c" softGlow="rgba(251,146,60,0.5)" sliderClass="" softPityClass="kuro-soft-pity" SoftPityIcon={Sparkles} ariaPrefix="Featured Resonator"
                    />
                  )}

                  {/* Featured Weapon Pity - Pink to match weapon banners */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label="Featured Weapon" pity={state.calc.weapPity} onPityChange={v => setCalc('weapPity', v)}
                      copies={state.calc.weapCopies} maxCopies={5} onCopiesChange={v => setCalc('weapCopies', v)}
                      fourStarCopies={state.calc.weap4StarCopies} maxFourStar={15} onFourStarChange={v => setCalc('weap4StarCopies', v)}
                      color="#f9a8d4" softColor="#ec4899" softGlow="rgba(236,72,153,0.5)" sliderClass="pink" softPityClass="kuro-soft-pity-pink" SoftPityIcon={Swords} ariaPrefix="Weapon"
                    />
                  )}

                  {/* Standard Resonator Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label="Standard Resonator" pity={state.calc.stdCharPity} onPityChange={v => setCalc('stdCharPity', v)}
                      copies={state.calc.stdCharCopies} maxCopies={7} onCopiesChange={v => setCalc('stdCharCopies', v)}
                      fourStarCopies={state.calc.stdChar4StarCopies} maxFourStar={21} onFourStarChange={v => setCalc('stdChar4StarCopies', v)}
                      color="#22d3ee" softColor="#67e8f9" softGlow="rgba(103,232,249,0.5)" sliderClass="cyan" softPityClass="kuro-soft-pity-cyan" SoftPityIcon={Star} ariaPrefix="Standard Resonator"
                    />
                  )}

                  {/* Standard Weapon Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label="Standard Weapon" pity={state.calc.stdWeapPity} onPityChange={v => setCalc('stdWeapPity', v)}
                      copies={state.calc.stdWeapCopies} maxCopies={5} onCopiesChange={v => setCalc('stdWeapCopies', v)}
                      fourStarCopies={state.calc.stdWeap4StarCopies} maxFourStar={15} onFourStarChange={v => setCalc('stdWeap4StarCopies', v)}
                      color="#22d3ee" softColor="#67e8f9" softGlow="rgba(103,232,249,0.5)" sliderClass="cyan" softPityClass="kuro-soft-pity-cyan" SoftPityIcon={Sword} ariaPrefix="Standard Weapon"
                    />
                  )}
              </CardBody>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>Resources</CardHeader>
              <CardBody className="space-y-3">
                  <div>
                    <label className="kuro-label">Astrite</label>
                    <input type="number" min="0" max={MAX_ASTRITE} value={state.calc.astrite} onChange={e => setCalc('astrite', Math.max(0, Math.min(MAX_ASTRITE, +e.target.value || 0)))} className="kuro-input" placeholder="e.g. 1600" aria-label="Astrite amount" />
                    <p className="text-gray-400 text-[10px] mt-1.5">= {Math.floor((+state.calc.astrite || 0) / ASTRITE_PER_PULL)} Convenes{Math.floor((+state.calc.astrite || 0) / ASTRITE_PER_PULL) > MAX_CALC_PULLS ? <span className="text-yellow-500"> (calc capped at {MAX_CALC_PULLS})</span> : ''}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {/* AUDIT-FIX M32+L20: Use "Convene(s)" consistently, capitalize Astrite */}
                      {[[ASTRITE_PER_PULL,'1 Convene'], [ASTRITE_PER_PULL*5,'5 Convenes'], [ASTRITE_PER_PULL*10,'10 Convenes'], [ASTRITE_PER_PULL*20,'20 Convenes']].map(([amt, tip]) => (
                        <button key={amt} onClick={() => setCalc('astrite', String(Math.min(MAX_ASTRITE, (+state.calc.astrite || 0) + amt)))} className="px-2 py-1 text-[10px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 transition-colors" title={tip} aria-label={`Add ${amt} Astrite (${tip})`}>+{amt}<span className="text-yellow-600 ml-0.5 text-[10px]">({tip.split(' ')[0]})</span></button>
                      ))}
                      <button onClick={() => setCalc('astrite', '')} className="px-2 py-1 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 transition-colors" aria-label="Clear Astrite">Clear</button>
                    </div>
                  </div>

                  {/* Featured banner resources */}
                  {state.calc.bannerCategory === 'featured' && (
                    <div className="grid grid-cols-2 gap-2">
                      {(state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div>
                          <label className="text-xs mb-2 block font-medium text-yellow-400">Radiant Tides</label>
                          <input type="number" min="0" max={MAX_CALC_PULLS} value={state.calc.radiant} onChange={e => setCalc('radiant', Math.max(0, Math.min(MAX_CALC_PULLS, +e.target.value || 0)))} className="kuro-input" placeholder="0" aria-label="Radiant Tides" />
                          <div className="flex gap-1 mt-1.5">
                            {[1, 5, 10].map(amt => (
                              <button key={amt} onClick={() => setCalc('radiant', String(Math.min(MAX_CALC_PULLS, (+state.calc.radiant || 0) + amt)))} aria-label={`Add ${amt} Radiant Tide${amt > 1 ? 's' : ''}`} className="px-2 py-1 text-[10px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 transition-colors">+{amt}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {(state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div>
                          <label className="text-xs mb-2 block font-medium text-pink-400">Forging Tides</label>
                          <input type="number" min="0" max={MAX_CALC_PULLS} value={state.calc.forging} onChange={e => setCalc('forging', Math.max(0, Math.min(MAX_CALC_PULLS, +e.target.value || 0)))} className="kuro-input" placeholder="0" aria-label="Forging Tides" />
                          <div className="flex gap-1 mt-1.5">
                            {[1, 5, 10].map(amt => (
                              <button key={amt} onClick={() => setCalc('forging', String(Math.min(MAX_CALC_PULLS, (+state.calc.forging || 0) + amt)))} aria-label={`Add ${amt} Forging Tide${amt > 1 ? 's' : ''}`} className="px-2 py-1 text-[10px] bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded border border-pink-500/30 transition-colors">+{amt}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard banner resources */}
                  {state.calc.bannerCategory === 'standard' && (
                    <div>
                      <label className="text-xs mb-2 block font-medium text-cyan-400">Lustrous Tides</label>
                      <input type="number" min="0" max={MAX_CALC_PULLS} value={state.calc.lustrous} onChange={e => setCalc('lustrous', Math.max(0, Math.min(MAX_CALC_PULLS, +e.target.value || 0)))} className="kuro-input" placeholder="0" aria-label="Lustrous Tides" />
                      <div className="flex gap-1 mt-1.5">
                        {[1, 5, 10].map(amt => (
                          <button key={amt} onClick={() => setCalc('lustrous', String(Math.min(MAX_CALC_PULLS, (+state.calc.lustrous || 0) + amt)))} aria-label={`Add ${amt} Lustrous Tide${amt > 1 ? 's' : ''}`} className="px-2 py-1 text-[10px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 transition-colors">+{amt}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* P8-FIX: HIGH-20 — Astrite Allocation Priority slider (replaces confusing dual +10% buttons) */}
                  {state.calc.selectedBanner === 'both' && (() => {
                    const priorityKey = state.calc.bannerCategory === 'standard' ? 'stdAllocPriority' : 'allocPriority';
                    const currentPriority = state.calc[priorityKey] ?? 50;
                    return (
                    <div>
                      <div className="kuro-label">Astrite Priority{state.calc.bannerCategory === 'standard' ? ' (Standard)' : ''}</div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Crown size={12} style={{ color: currentPriority >= 50 ? '#edaf18' : '#6b7280' }} />
                          <span className="text-xs font-medium" style={{ color: currentPriority >= 50 ? '#edaf18' : '#6b7280' }}>Resonator {currentPriority}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium" style={{ color: currentPriority <= 50 ? '#ec4899' : '#6b7280' }}>Weapon {100 - currentPriority}%</span>
                          <Swords size={12} style={{ color: currentPriority <= 50 ? '#ec4899' : '#6b7280' }} />
                        </div>
                      </div>
                      <input
                        type="range" min="0" max="100" step="10" value={currentPriority}
                        onChange={e => setCalc(priorityKey, +e.target.value)}
                        className="kuro-slider priority-slider w-full"
                        aria-label={`Astrite allocation: ${currentPriority}% Resonator, ${100 - currentPriority}% Weapon`}
                        style={{ background: `linear-gradient(to right, #edaf18 0%, #edaf18 ${currentPriority}%, #ec4899 ${currentPriority}%, #ec4899 100%)` }}
                      />
                      {currentPriority !== 50 && (
                        <button 
                          onClick={() => setCalc(priorityKey, 50)} 
                          className="kuro-btn w-full mt-2 text-xs"
                        >
                          <RefreshCcw size={12} className="inline mr-1.5" />Reset to 50/50
                        </button>
                      )}
                    </div>
                  );
                  })()}

                  {/* Total Convenes Display */}
                  <div className="kuro-stat">
                    <div className="flex justify-around items-center">
                      {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-yellow-400 kuro-number text-xl">{charPulls}</div>
                          <div className="text-gray-400 text-[10px]">Resonator Convenes</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-[10px]">({astriteAllocation.charAstritePulls} + {+state.calc.radiant || 0} tides)</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-pink-400 kuro-number text-xl">{weapPulls}</div>
                          <div className="text-gray-400 text-[10px]">Weapon Convenes</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-[10px]">({astriteAllocation.weapAstritePulls} + {+state.calc.forging || 0} tides)</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-cyan-400 kuro-number text-xl">{stdCharPulls}</div>
                          <div className="text-gray-400 text-[10px]">Resonator Convenes</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-[10px]">({astriteAllocation.charAstritePulls} + {astriteAllocation.stdCharLustrous} tides)</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-cyan-400 kuro-number text-xl">{stdWeapPulls}</div>
                          <div className="text-gray-400 text-[10px]">Weapon Convenes</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-[10px]">({astriteAllocation.weapAstritePulls} + {astriteAllocation.stdWeapLustrous} tides)</div>}
                        </div>
                      )}
                    </div>
                  </div>
              </CardBody>
            </Card>

            {/* Results Cards — aria-live for screen reader announcements (Finding 13.5) */}
            <div aria-live="polite" aria-atomic="false" className="banner-grid space-y-3 lg:space-y-0">
            {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
              <CalcResultsCard title="Featured Resonator Results" stats={charStats} accentStatClass="kuro-stat-gold" copies={state.calc.charCopies} isFeatured={true} />
            )}

            {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
              <CalcResultsCard title="Featured Weapon Results" stats={weapStats} accentStatClass="kuro-stat-pink" copies={state.calc.weapCopies} isFeatured={true} />
            )}

            {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
              <CalcResultsCard title="Standard Resonator Results" stats={stdCharStats} accentStatClass="kuro-stat-cyan" copies={state.calc.stdCharCopies} isFeatured={false} />
            )}

            {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
              <CalcResultsCard title="Standard Weapon Results" stats={stdWeapStats} accentStatClass="kuro-stat-cyan" copies={state.calc.stdWeapCopies} isFeatured={false} />
            )}
            </div>

            {/* Combined Analysis */}
            {state.calc.selectedBanner === 'both' && combined && (
              <Card>
                <CardHeader>Combined Analysis</CardHeader>
                <CardBody>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="kuro-stat kuro-stat-emerald">
                        <div className="text-2xl kuro-number text-emerald-400 font-extrabold">{combined.both}%</div>
                        <div className="text-gray-400 text-[10px] mt-1">Get Both</div>
                      </div>
                      <div className="kuro-stat kuro-stat-gold kuro-stat-hero">
                        <div className="text-yellow-400 text-2xl kuro-number font-extrabold">{combined.atLeastOne}%</div>
                        <div className="text-gray-400 text-[10px] mt-1">At Least One</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className={`kuro-stat ${state.calc.bannerCategory === 'featured' ? 'kuro-stat-gold' : 'kuro-stat-cyan'}`}>
                        <span className={`kuro-number ${state.calc.bannerCategory === 'featured' ? 'text-yellow-400' : 'text-cyan-400'}`}>{combined.charOnly}%</span>
                        <div className="text-gray-400 mt-0.5">Char Only</div>
                      </div>
                      <div className={`kuro-stat ${state.calc.bannerCategory === 'featured' ? 'kuro-stat-pink' : 'kuro-stat-cyan'}`}>
                        <span className={`kuro-number ${state.calc.bannerCategory === 'featured' ? 'text-pink-400' : 'text-cyan-400'}`}>{combined.weapOnly}%</span>
                        <div className="text-gray-400 mt-0.5">Weap Only</div>
                      </div>
                      <div className="kuro-stat kuro-stat-red">
                        <span className="text-red-400 kuro-number">{combined.neither}%</span>
                        <div className="text-gray-400 mt-0.5">Neither</div>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                      <p className="text-emerald-400/80 text-[10px]">✓ Astrite split: {astriteAllocation.charPercent}% Resonator / {astriteAllocation.weapPercent}% Weapon</p>
                    </div>
                </CardBody>
              </Card>
            )}
          </div>
          </TabErrorBoundary>
          </div>
        )}

        {/* [SECTION:TAB-PLANNER] */}
        {activeTab === 'planner' && (
          <div role="tabpanel" id="tabpanel-planner" aria-labelledby="tab-planner" tabIndex="0">
          <TabErrorBoundary tabName="Planner">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="planner" />

            <Card>
              <CardHeader>Daily Income</CardHeader>
              <CardBody className="space-y-3">
                <div>
                  <label className="kuro-label" title="Includes Commissions, Dailies, etc.">Daily Astrite</label>
                  <input type="number" value={state.planner.dailyAstrite} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'dailyAstrite', value: Math.max(0, +e.target.value || 0) })} className="kuro-input w-full" aria-label="Daily Astrite income" />
                </div>
                {state.planner.luniteActive && (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400 text-xs">Lunite Subscription</span>
                    </div>
                    <span className="text-emerald-400 text-xs">+90/day</span>
                  </div>
                )}
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400 text-sm font-medium"><Calendar size={14} className="inline mr-1.5 -mt-0.5" />Daily Income</span>
                    <span className="text-yellow-400 font-bold kuro-number text-base">{dailyIncome} Astrite</span>
                  </div>
                  <div className="text-gray-400 text-[10px] mt-1">≈ <span className="kuro-number">{(dailyIncome / ASTRITE_PER_PULL).toFixed(2)}</span> Convenes/day • <span className="kuro-number">{Math.floor(dailyIncome * 30 / ASTRITE_PER_PULL)}</span> Convenes/month</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setShowIncomePanel(!showIncomePanel)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowIncomePanel(!showIncomePanel); } }} aria-expanded={showIncomePanel}>
                <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showIncomePanel ? 'rotate-180' : ''}`} />}>Add Purchases</CardHeader>
              </div>
              {showIncomePanel && (
                <CardBody className="space-y-2">
                  <div className="kuro-label">Subscriptions</div>
                  <button onClick={() => dispatch({ type: 'SET_PLANNER', field: 'luniteActive', value: !state.planner.luniteActive })} aria-pressed={state.planner.luniteActive} aria-label={`Lunite Subscription: ${state.planner.luniteActive ? 'active' : 'inactive'}`} className={`kuro-btn w-full text-left ${state.planner.luniteActive ? 'active-emerald' : ''}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded flex items-center justify-center ${state.planner.luniteActive ? 'bg-emerald-500 text-black' : ''}`} style={!state.planner.luniteActive ? { background: 'var(--bg-btn)' } : undefined}>
                          {state.planner.luniteActive && <Check size={10} />}
                        </span>
                        <div>
                          <div className={`text-xs font-medium ${state.planner.luniteActive ? 'text-emerald-400' : 'text-gray-200'}`}>Lunite Subscription</div>
                          <div className="text-gray-300 text-[10px]">300 Lunite + {SUBSCRIPTIONS.lunite.daily} Astrite/day × {SUBSCRIPTIONS.lunite.duration}d</div>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-xs">${SUBSCRIPTIONS.lunite.price}/mo</span>
                    </div>
                  </button>
                  {/* Weekly sub: Lunite is a separate in-game currency (not tracked here), only Astrite counts toward pulls */}
                  {/* AUDIT-FIX L22: Toast feedback for purchases */}
                  <button onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: SUBSCRIPTIONS.weekly.astrite, radiant: 0, lustrous: 0, label: SUBSCRIPTIONS.weekly.name, price: SUBSCRIPTIONS.weekly.price } }); toast?.addToast?.(`Added ${SUBSCRIPTIONS.weekly.name}`, 'success'); }} className="kuro-btn w-full text-left">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="text-gray-200 text-xs font-medium">{SUBSCRIPTIONS.weekly.name}</div>
                        <div className="text-gray-300 text-[10px]">{SUBSCRIPTIONS.weekly.desc}</div>
                      </div>
                      <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">${SUBSCRIPTIONS.weekly.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                    </div>
                  </button>
                  {Object.entries(SUBSCRIPTIONS).filter(([k]) => k === 'bpInsider' || k === 'bpConnoisseur').map(([k, s]) => (
                    <button key={k} onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: s.astrite, radiant: s.radiant || 0, lustrous: s.lustrous || 0, label: s.name, price: s.price } }); toast?.addToast?.(`Added ${s.name}`, 'success'); }} className="kuro-btn w-full text-left">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="text-gray-200 text-xs font-medium">{s.name}</div>
                          <div className="text-gray-300 text-[10px]">{s.desc}</div>
                        </div>
                        <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                      </div>
                    </button>
                  ))}
                  <div className="kuro-label mt-3">Direct Top-Ups</div>
                  {Object.entries(SUBSCRIPTIONS).filter(([k]) => k.startsWith('directTop')).map(([k, s]) => (
                    <button key={k} onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: s.astrite, radiant: 0, lustrous: 0, label: s.name, price: s.price } }); toast?.addToast?.(`Added ${s.name}`, 'success'); }} className="kuro-btn w-full text-left">
                      <div className="flex items-center justify-between w-full">
                        <div><div className="text-gray-200 text-xs font-medium">{s.name}</div><div className="text-gray-300 text-[10px]">{s.desc}</div></div>
                        <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                      </div>
                    </button>
                  ))}
                </CardBody>
              )}
            </Card>

            {state.planner.addedIncome.length > 0 && (
              <Card>
                {/* AUDIT-FIX H6: Confirm before clearing all purchases */}
                <CardHeader action={<button onClick={async () => { if (await confirm({ title: 'Clear purchases', message: 'Remove all added purchases?', confirmLabel: 'Remove All', destructive: true })) dispatch({ type: 'CLEAR_ALL_INCOME' }); }} className="text-red-400 text-[10px] hover:text-red-300 transition-colors" aria-label="Clear all added purchases">Clear All</button>}>Added Purchases</CardHeader>
                <CardBody className="space-y-2">
                  {state.planner.addedIncome.map(i => (
                    <div key={i.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-xs">
                      <span className="text-gray-200">{i.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">+{i.astrite}</span>
                        {i.radiant > 0 && <span className="text-yellow-400">+{i.radiant}RT</span>}
                        {i.lustrous > 0 && <span className="text-cyan-400">+{i.lustrous}LT</span>}
                        {/* AUDIT-FIX H6: Confirm before removing individual purchase */}
                        <button onClick={async () => { if (await confirm({ title: 'Remove purchase', message: `Remove "${i.label}"?`, confirmLabel: 'Remove', destructive: true })) dispatch({ type: 'REMOVE_INCOME', id: i.id }); }} className="text-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center -my-2" aria-label={`Remove purchase: ${i.label}`}><Minus size={12} /></button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-[var(--border-medium)] flex justify-between text-xs">
                    <span className="text-gray-400">Total Spent</span>
                    <span className="text-emerald-400 font-bold">${state.planner.addedIncome.reduce((s, i) => s + i.price, 0).toFixed(2)}</span>
                  </div>
                </CardBody>
              </Card>
            )}

            {planData.daysLeft > 0 && (
              <Card>
                <CardHeader>By Banner End</CardHeader>
                <CardBody className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-[10px]">v{activeBanners.version} P{activeBanners.phase} ends in {planData.daysLeft} day{planData.daysLeft !== 1 ? 's' : ''}</span>
                    <CountdownTimer endDate={bannerEndDate} compact />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="kuro-stat p-2 text-center">
                      <div className="text-yellow-400 kuro-number text-xl">{planData.convenesByEnd}</div>
                      <div className="text-gray-400 text-[10px]">Total Convenes</div>
                    </div>
                    <div className="kuro-stat p-2 text-center">
                      <div className="text-yellow-400 kuro-number text-xl">{Math.floor(planData.incomeByEnd / ASTRITE_PER_PULL)}</div>
                      <div className="text-gray-400 text-[10px]">Earned Convenes</div>
                    </div>
                    <div className="kuro-stat p-2 text-center">
                      <div className="text-yellow-400 kuro-number text-xl">{planData.totalAstriteByEnd.toLocaleString()}</div>
                      <div className="text-gray-400 text-[10px]">Total Astrite</div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-[10px] text-center">Current {planData.currentAstrite.toLocaleString()} + {planData.incomeByEnd.toLocaleString()} earned ({dailyIncome}/day × {planData.daysLeft}d)</div>
                </CardBody>
              </Card>
            )}

            {/* Income Projections */}
            <Card>
              <CardHeader>Income Projections</CardHeader>
              <CardBody>
                {/* MED-29: 30-day emphasized as primary planning horizon */}
                <div className="grid grid-cols-3 gap-2">
                  {[7, 30, 90].map(days => (
                    <div key={days} className={`kuro-stat p-3 text-center ${days === 30 ? 'border-yellow-500/30 kuro-stat-gold' : ''}`}>
                      <div className="text-gray-400 text-[10px] mb-1">{days === 30 ? 'Monthly' : `${days} Days`}</div>
                      <div className={`kuro-number text-yellow-400 font-extrabold ${days === 30 ? 'text-3xl' : 'text-xl'}`}>{Math.floor(dailyIncome * days / ASTRITE_PER_PULL)}</div>
                      <div className="text-gray-400 text-[10px]">Convenes</div>
                      <div className="text-gray-400 text-[10px]">{(dailyIncome * days).toLocaleString()} Astrite</div>
                    </div>
                  ))}
                </div>
                {state.planner.luniteActive && (
                  <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                    <span className="text-emerald-400 text-xs">Monthly Subscription Cost: </span>
                    <span className="text-emerald-400 font-bold text-xs">${SUBSCRIPTIONS.lunite.price}/month</span>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>Goal Progress</CardHeader>
              <CardBody className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="kuro-label">Base Convenes (per copy)</label>
                    <KuroSelect
                      value={state.planner.goalPulls}
                      onChange={v => dispatch({ type: 'SET_PLANNER', field: 'goalPulls', value: +v })}
                      options={[
                        { value: HARD_PITY, label: `${HARD_PITY} (Hard Pity)` },
                        { value: HARD_PITY * 2, label: `${HARD_PITY * 2} (Guaranteed)` },
                        { value: 240, label: '240 (Char + Signature)' },
                      ]}
                      className="w-full"
                      ariaLabel="Base Convenes per copy"
                      small
                    />
                  </div>
                  <div>
                    <label className="kuro-label">Multiplier</label>
                    <KuroSelect
                      value={state.planner.goalModifier}
                      onChange={v => dispatch({ type: 'SET_PLANNER', field: 'goalModifier', value: +v })}
                      options={[
                        { value: 1, label: '×1' },
                        { value: 2, label: '×2' },
                        { value: 3, label: '×3' },
                      ]}
                      className="w-full"
                      ariaLabel="Copies multiplier"
                      small
                    />
                  </div>
                </div>
                <div className="p-2 bg-white/5 rounded-lg text-[10px] text-gray-400 text-center">
                  Using Calculator: <span className={planData.isFeatured ? 'text-yellow-400' : 'text-cyan-400'}>{planData.goalBannerLabel}</span> × <span className="text-gray-100">{planData.goalCopies}</span> copies
                </div>
                <div className="p-3 bg-white/5 rounded-lg" aria-live="polite" aria-atomic="false">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Target</span>
                    <span className="text-gray-100 font-bold">{planData.targetPulls} Convenes ({planData.targetAstrite.toLocaleString()} Astrite)</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-stat)' }} role="progressbar" aria-valuenow={planData.goalProgress} aria-valuemin={0} aria-valuemax={100} aria-label={`Goal progress: ${planData.goalProgress.toFixed(1)}%`}>
                    <div className={`h-full transition-[width] duration-300 ${planData.isFeatured ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`} style={{ width: `${planData.goalProgress}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] mt-1">
                    <span className="text-gray-400">{Math.floor(planData.currentAstrite / ASTRITE_PER_PULL)} / {planData.targetPulls} Convenes</span>
                    <span className="text-gray-100">{planData.goalProgress.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="kuro-stat p-3 text-center">
                    <div className="text-yellow-400 kuro-number text-xl">{planData.goalNeeded.toLocaleString()}</div>
                    <div className="text-gray-400 text-[10px]">Astrite Needed</div>
                  </div>
                  <div className="kuro-stat p-3 text-center">
                    <div className="text-yellow-400 kuro-number text-xl">{planData.goalDaysNeeded === Infinity ? '∞' : planData.goalDaysNeeded}</div>
                    <div className="text-gray-400 text-[10px]">Days to Goal</div>
                  </div>
                </div>
                {planData.goalDaysNeeded !== Infinity && planData.goalDaysNeeded > 0 && (
                  <div className="p-2 bg-white/5 rounded-lg text-center">
                    <span className="text-gray-400 text-[10px]">Estimated: </span>
                    <span className="text-yellow-400 text-xs font-medium">{new Date(Date.now() + planData.goalDaysNeeded * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* AUDIT-FIX M21: Always show Saved States card with empty state message */}
            <Card>
              <CardHeader>Saved States</CardHeader>
              <CardBody className="space-y-2">
                {state.bookmarks.length === 0 ? (
                  <p className="kuro-empty-state text-gray-500 text-xs text-center py-3">Awaiting archived states. Save a configuration in the Calculator to create a bookmark.</p>
                ) : state.bookmarks.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-gray-200 text-xs font-medium">{b.name}</div>
                      <div className="text-gray-400 text-[10px]">{b.astrite} Astrite • P{b.charPity}/{b.weapPity}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => dispatch({ type: 'LOAD_BOOKMARK', id: b.id })} aria-label={`Load bookmark: ${b.name}`} className="px-3 py-1.5 text-[10px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 transition-colors min-h-[44px]">Load</button>
                      {/* AUDIT-FIX H6: Confirm before deleting bookmark */}
                      <button onClick={async () => { if (await confirm({ title: 'Delete bookmark', message: `Delete bookmark "${b.name}"?`, confirmLabel: 'Delete', destructive: true })) dispatch({ type: 'DELETE_BOOKMARK', id: b.id }); }} aria-label={`Delete bookmark: ${b.name}`} className="px-2.5 py-1.5 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 transition-colors min-h-[44px]">×</button>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
          </TabErrorBoundary>
          </div>
        )}

        {/* [SECTION:TAB-STATS] */}
        {activeTab === 'analytics' && (
          <div role="tabpanel" id="tabpanel-analytics" aria-labelledby="tab-analytics" tabIndex="0">
          <TabErrorBoundary tabName="Stats">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="stats" />

            {!overallStats ? (
              <Card>
                <CardBody className="text-center py-8">
                  <BarChart3 size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-300 text-sm font-medium">Awaiting signal data</p>
                  <p className="text-gray-400 text-xs mt-1 mb-3">Import your Convene history to initialize luck analysis, pity tracking, and pull analytics.</p>
                  <button onClick={() => setActiveTab('profile')} className="kuro-btn active-cyan text-xs px-4 py-2">Open Profile to import</button>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Success Rate Card */}
                {luckRating && (
                  <Card>
                    <CardHeader action={<button onClick={() => setShowLeaderboard(true)} className="text-cyan-400 text-[10px] flex items-center gap-1 hover:text-cyan-300 transition-colors" aria-label="Open community leaderboard"><TrendingUp size={12} /> Leaderboard</button>}>Luck Rating</CardHeader>
                    <CardBody>
                      <div className="flex items-center gap-4">
                        <div className="luck-badge rounded-xl p-[2px] flex-shrink-0" style={{'--badge-color': luckRating.color, '--badge-speed': '12s'}}>
                          <div className="luck-badge-inner rounded-xl px-4 py-3 text-center" style={{minWidth: '90px'}}>
                            <div className="text-[16px] font-bold tracking-widest uppercase mb-1" style={{color: luckRating.color, fontFamily: 'var(--font-display)'}}>{luckRating.tier}</div>
                            <div className="text-[24px] font-extrabold kuro-number" style={{color: luckRating.color, textShadow: `0 0 20px ${luckRating.color}40`, fontFamily: 'var(--font-data)'}}>{luckRating.rating}</div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-gray-400 text-[10px]">Percentile</span>
                            <span className="text-white font-bold text-sm">Top {Math.max(1, 100 - luckRating.percentile)}%</span>
                          </div>
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
                {showConsentModal && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Leaderboard consent">
                    <div className="kuro-card w-full max-w-sm p-5 space-y-4">
                      <h3 className="text-white font-semibold text-sm">Leaderboard — Data Sharing Notice</h3>
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
                )}

                {/* Luck Leaderboard Modal */}
                <FocusTrapModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} className="" onClick={() => setShowLeaderboard(false)} ariaLabel="Community leaderboard" centered>
                    <div className="kuro-card w-full max-w-sm max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                      <div className="p-4 pb-2 border-b border-[var(--border-medium)]" data-sheet-header>
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
                                <div className="text-gray-500 text-sm mb-2">No signals received</div>
                                <div className="text-gray-500 text-[10px]">Be the first to transmit</div>
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
                              disabled={leaderboardSubmitting}
                              className={`w-full kuro-btn active-cyan py-2 text-xs font-medium ${leaderboardSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {leaderboardSubmitting ? 'Submitting…' : 'Submit My Score'}
                            </button>
                            <p className="text-gray-400 text-[10px] text-center">Pseudonymous • Your ID, avg pity & Convene stats are shared publicly on the leaderboard</p>
                          </>
                        ) : (
                          <p className="text-gray-500 text-[10px] text-center">Import convene history to participate</p>
                        )}
                      </div>
                    </div>
                </FocusTrapModal>

                {/* Trophies & Achievements */}
                {trophies && trophies.list.length > 0 && (
                  <Card>
                    <CardHeader action={<span className="text-gray-500 text-[10px]">{trophies.list.length} earned</span>}>
                      <span className="flex items-center gap-1.5"><Trophy size={14} className="text-yellow-400" /> Trophies <span className="text-gray-500 font-normal text-[10px]">({trophies.list.length})</span></span>
                    </CardHeader>
                    <CardBody>
                      {(() => {
                      
                      return (<>
                      <div className="grid grid-cols-3 gap-2">
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
                  if (!statsTabData.histogramStats) return null;
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
                        <div className="flex items-end gap-1.5 h-24 mb-2" aria-hidden="true">
                          {allBuckets.map(label => {
                            const count = buckets[label] || 0;
                            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                            const color = getBarColor(label);
                            return (
                              <div key={label} className="flex-1 flex flex-col items-center">
                                <div className="w-full relative" style={{ height: '96px' }}>
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
                              {label.split('-')[0]}
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
                    {(() => {
                      const allHist = statsTabData.allHist;
                      if (allHist.length < 10) return <p className="kuro-empty-state text-gray-500 text-xs text-center py-4">Awaiting sufficient signal data for trend analysis</p>;
                      
                      const groupData = (range) => {
                        const grouped = {};
                        allHist.forEach(p => {
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
                      
                      if (allData.length < 2) return <p className="kuro-empty-state text-gray-500 text-xs text-center py-4">Awaiting more Convene signals</p>;
                      
                      const maxVisible = visibleCount[chartRange];
                      const maxOffset = Math.max(0, allData.length - maxVisible);
                      const clampedOffset = Math.min(chartOffset, maxOffset);
                      const chartData = allData.slice(clampedOffset, clampedOffset + maxVisible);
                      const canGoLeft = clampedOffset > 0;
                      const canGoRight = clampedOffset < maxOffset;
                      
                      return (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex gap-1">
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
                            {allData.length > maxVisible && (
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => setChartOffset(Math.max(0, clampedOffset - Math.floor(maxVisible / 2)))}
                                  disabled={!canGoLeft}
                                  className={`p-1 rounded transition-colors ${canGoLeft ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/5 text-gray-500'}`}
                                >
                                  <ChevronDown size={14} className="rotate-90" />
                                </button>
                                <button 
                                  onClick={() => setChartOffset(Math.min(maxOffset, clampedOffset + Math.floor(maxVisible / 2)))}
                                  disabled={!canGoRight}
                                  className={`p-1 rounded transition-colors ${canGoRight ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/5 text-gray-500'}`}
                                >
                                  <ChevronDown size={14} className="-rotate-90" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="h-32">
                            <div className="sr-only">Convene history chart showing activity over time. Data points: {chartData?.map(d => `${d.label}: ${d.pulls} Convenes`).join(', ')}.</div>
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="pullGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(237,175,24,0.22)" />
                                    <stop offset="100%" stopColor="rgba(237,175,24,0)" />
                                  </linearGradient>
                                </defs>
                                {/* MED-30: Subtle gridlines for value estimation */}
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="label" tick={{ fill: '#8892a4', fontSize: 10, fontFamily: 'var(--font-data)' }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                                <YAxis tick={{ fill: '#8892a4', fontSize: 9, fontFamily: 'var(--font-data)' }} axisLine={false} tickLine={false} />
                                <RechartsTooltip
                                  contentStyle={{ background: 'rgba(12,16,24,0.95)', border: '1px solid rgba(237,175,24,0.3)', borderRadius: '8px', fontSize: '11px', fontFamily: 'var(--font-data)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                                  labelStyle={{ color: '#dfe5ef', fontFamily: 'var(--font-display)', fontWeight: 600 }}
                                  itemStyle={{ color: '#bcc3d1' }}
                                  cursor={{ stroke: 'rgba(237,175,24,0.2)' }}
                                />
                                <Area type="natural" dataKey="pulls" stroke="rgba(237,175,24,0.4)" fill="url(#pullGradient)" strokeWidth={1} name="Convenes" />
                              </AreaChart>
                            </ResponsiveContainer>
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
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold kuro-number">{overallStats.totalAstrite.toLocaleString()}</div><div className="text-gray-400 text-[10px]">Astrite Spent</div></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="kuro-stat kuro-stat-emerald p-2 text-center"><div className="text-emerald-400 font-bold text-sm kuro-number">{overallStats.won5050}</div><div className="text-gray-400 text-[10px]">Won 50/50</div></div>
                      <div className="kuro-stat kuro-stat-red p-2 text-center"><div className="text-red-400 font-bold text-sm kuro-number">{overallStats.lost5050}</div><div className="text-gray-400 text-[10px]">Lost 50/50</div></div>
                      <div className="kuro-stat p-2 text-center"><div className="text-white font-bold text-sm kuro-number">{overallStats.avgPity}</div><div className="text-gray-400 text-[10px]">Avg. Pity</div></div>
                    </div>
                    {overallStats.winRate != null && <div className="text-center text-xs text-gray-400 mt-2">50/50 Win Rate: <span className="text-emerald-400 font-bold text-sm kuro-number">{overallStats.winRate}%</span></div>}
                  </CardBody>
                </Card>

                {/* 5★ Pull Log */}
                <Card>
                  <CardHeader>5★ Convene Log</CardHeader>
                  <CardBody>
                    {(() => {
                      const fiveStars = statsTabData.pullLogFiveStars;
                      if (fiveStars.length === 0) return <p className="kuro-empty-state text-gray-500 text-xs text-center py-4">Awaiting 5★ signal resonance</p>;
                      return (
                        <div className="space-y-1 max-h-60 overflow-y-auto kuro-scroll">
                          {fiveStars.map((p, i) => {
                            // P2-FIX: Unified pity color thresholds — matches histogram
                            const pityColor = p.pity <= 20 ? '#22c55e' : p.pity <= 40 ? '#4ade80' : p.pity <= 50 ? '#edaf18' : p.pity <= 60 ? '#f97316' : '#ef4444';
                            const pityTextColor = p.pity <= 20 ? 'text-emerald-400' : p.pity <= 40 ? 'text-green-400' : p.pity <= 50 ? 'text-yellow-400' : p.pity <= 60 ? 'text-orange-400' : 'text-red-400';
                            return (
                              <div key={p.id || `pull-${p.name}-${p.pity}-${p.timestamp || i}`} className="pull-log-row flex items-center justify-between p-1.5 rounded text-[10px]" style={{'--pity-color': pityColor, background: 'rgba(255,255,255,0.03)'}}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-yellow-400 font-medium truncate">{p.name}</span>
                                  <span className="text-gray-500 flex-shrink-0">{p.banner}</span>
                                  {/* MED-34: Enlarged W/L badges with icon backup for colorblind accessibility */}
                                  {p.banner === 'Featured' && p.won5050 === true && <span className="text-emerald-400 text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 flex-shrink-0" aria-label="Won 50/50">✓ W</span>}
                                  {p.banner === 'Featured' && p.won5050 === false && <span className="text-red-400 text-xs font-bold px-1.5 py-0.5 rounded bg-red-500/20 flex-shrink-0" aria-label="Lost 50/50">✗ L</span>}
                                  {p.banner === 'Featured' && p.won5050 === null && <span className="text-gray-400 text-[10px] flex-shrink-0" aria-label="Guaranteed">G<span className="sr-only"> (Guaranteed)</span></span>}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`font-bold kuro-number ${pityTextColor}`}>{p.pity ?? '?'}</span>
                                  {p.timestamp && <span className="text-gray-400 text-[10px]">{new Date(p.timestamp).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
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
                            <span className="text-gray-400">Pity: {pity}/80</span>
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
        )}

        {/* [SECTION:TAB-COLLECT] */}
        {activeTab === 'gathering' && (
          <div role="tabpanel" id="tabpanel-gathering" aria-labelledby="tab-gathering" tabIndex="0">
          <TabErrorBoundary tabName="Collection">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="gathering" />

            {!state.profile.importedAt ? (
              <Card>
                <CardBody className="text-center py-8">
                  <Archive size={32} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-400 text-sm">Awaiting Convene data transmission</p>
                  <p className="text-gray-500 text-xs mt-1 mb-3">Import via Profile to initialize your archive</p>
                  <button onClick={() => setActiveTab('profile')} className="kuro-btn active-cyan text-xs px-4 py-2">Open Profile to import</button>
                </CardBody>
              </Card>
            ) : (
              <>
                {/* Overall Collection Summary */}
                {(() => {
                  try {
                  const ownedChars5 = Object.keys(collectionData.chars5Counts).length;
                  const ownedChars4 = Object.keys(collectionData.chars4Counts).length;
                  const ownedWeaps5 = Object.keys(collectionData.weaps5Counts).length;
                  const ownedWeaps4 = Object.keys(collectionData.weaps4Counts).length;
                  const ownedWeaps3 = Object.keys(collectionData.weaps3Counts).length;
                  const ownedWeaps2 = Object.keys(collectionData.weaps2Counts).length;
                  const ownedWeaps1 = Object.keys(collectionData.weaps1Counts).length;
                  const totalOwned = ownedChars5 + ownedChars4 + ownedWeaps5 + ownedWeaps4 + ownedWeaps3 + ownedWeaps2 + ownedWeaps1;
                  const totalItems = ALL_5STAR_RESONATORS.length + ALL_4STAR_RESONATORS.length + ALL_5STAR_WEAPONS.length + ALL_4STAR_WEAPONS.length + ALL_3STAR_WEAPONS.length + ALL_2STAR_WEAPONS.length + ALL_1STAR_WEAPONS.length;
                  const pct = totalItems > 0 ? Math.round((totalOwned / totalItems) * 100) : 0;
                  return (
                    <Card><CardBody>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-xs font-medium">Collection Progress</span>
                        <span className="text-yellow-400 text-sm font-bold">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--bg-stat)' }}>
                        <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-[width] duration-300" style={{width: `${pct}%`}} />
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-center text-[10px]">
                        <div><div className="text-yellow-400 font-bold">{ownedChars5}<span className="text-gray-500 font-normal">/{ALL_5STAR_RESONATORS.length}</span></div><div className="text-gray-500 mt-1">5★ Res</div></div>
                        <div><div className="text-purple-400 font-bold">{ownedChars4}<span className="text-gray-500 font-normal">/{ALL_4STAR_RESONATORS.length}</span></div><div className="text-gray-500 mt-1">4★ Res</div></div>
                        <div><div className="text-yellow-400 font-bold">{ownedWeaps5}<span className="text-gray-500 font-normal">/{ALL_5STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">5★ Wep</div></div>
                        <div><div className="text-purple-400 font-bold">{ownedWeaps4}<span className="text-gray-500 font-normal">/{ALL_4STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">4★ Wep</div></div>
                        <div><div className="text-blue-400 font-bold">{ownedWeaps3}<span className="text-gray-500 font-normal">/{ALL_3STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">3★ Wep</div></div>
                        <div><div className="text-green-400 font-bold">{ownedWeaps2}<span className="text-gray-500 font-normal">/{ALL_2STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">2★ Wep</div></div>
                        <div><div className="text-gray-400 font-bold">{ownedWeaps1}<span className="text-gray-500 font-normal">/{ALL_1STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">1★ Wep</div></div>
                      </div>
                    </CardBody></Card>
                  );
                  } catch (e) { return null; }
                })()}

                {/* Search & Filters */}
                <div className="space-y-2" style={{position: 'relative', zIndex: 10}}>
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={collectionSearch}
                      onChange={(e) => setCollectionSearch(e.target.value)}
                      placeholder="Search by name, DPS, Electro, Broadblade..."
                      className="w-full px-3 py-2 pl-8 rounded-lg text-xs border border-[var(--border-medium)] text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition-all"
                      style={{ background: 'var(--bg-btn)' }}
                      aria-label="Search collection by keyword"
                    />
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    {collectionSearch && (
                      <button onClick={() => setCollectionSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors" aria-label="Clear search">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  {/* Filter & Sort Controls */}
                  <div className="space-y-1.5">
                    {/* View Toggle */}
                    <Card>
                      <CardBody>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setCollectionView('items'); setCollectionEchoSetFilter('all'); setCollectionEchoBuffFilter('all'); }}
                            className={`kuro-btn flex-1 ${collectionView === 'items' ? 'active-gold' : ''}`}
                            title="Characters"
                            aria-label="View characters"
                            aria-pressed={collectionView === 'items'}
                          >
                            <Crown size={12} className="inline mr-1" />Characters
                          </button>
                          <button
                            onClick={() => { setCollectionView('weapons'); setCollectionElementFilter('all'); setCollectionDamageFilter('all'); setCollectionRoleFilter('all'); setCollectionEchoSetFilter('all'); setCollectionEchoBuffFilter('all'); }}
                            className={`kuro-btn flex-1 ${collectionView === 'weapons' ? 'active-pink' : ''}`}
                            title="Weapons"
                            aria-label="View weapons"
                            aria-pressed={collectionView === 'weapons'}
                          >
                            <Sword size={12} className="inline mr-1" />Weapons
                          </button>
                          <button
                            onClick={() => { setCollectionView('echoes'); setCollectionCategoryFilter('all'); setCollectionWeaponFilter('all'); setCollectionElementFilter('all'); setCollectionStatFilter('all'); setCollectionDamageFilter('all'); setCollectionRoleFilter('all'); }}
                            className={`kuro-btn flex-1 ${collectionView === 'echoes' ? 'active-cyan' : ''}`}
                            title="Echoes"
                            aria-label="View echoes"
                            aria-pressed={collectionView === 'echoes'}
                          >
                            <Sparkles size={12} className="inline mr-1" />Echoes
                          </button>
                        </div>
                      </CardBody>
                    </Card>
                    {/* Filter Dropdowns — context-sensitive per view */}
                    <Card>
                      <CardBody>
                    <div className="grid grid-cols-3 gap-1.5">

                      {/* ── Characters view: Type, Elements, Stat Scaling, Damage, Rôle ── */}
                      {collectionView === 'items' && (<>
                        <KuroSelect
                          value={collectionWeaponFilter}
                          onChange={setCollectionWeaponFilter}
                          options={[
                            { value: 'all', label: 'All Types' },
                            { value: 'Broadblade', label: 'Broadblade' },
                            { value: 'Sword', label: 'Sword' },
                            { value: 'Pistols', label: 'Pistols' },
                            { value: 'Gauntlets', label: 'Gauntlets' },
                            { value: 'Rectifier', label: 'Rectifier' },
                          ]}
                          ariaLabel="Filter by weapon type"
                        />
                        <KuroSelect
                          value={collectionElementFilter}
                          onChange={setCollectionElementFilter}
                          options={[
                            { value: 'all', label: 'All Elements' },
                            { value: 'Aero', label: 'Aero' },
                            { value: 'Glacio', label: 'Glacio' },
                            { value: 'Electro', label: 'Electro' },
                            { value: 'Fusion', label: 'Fusion' },
                            { value: 'Spectro', label: 'Spectro' },
                            { value: 'Havoc', label: 'Havoc' },
                          ]}
                          ariaLabel="Filter by element"
                        />
                        <KuroSelect
                          value={collectionStatFilter}
                          onChange={setCollectionStatFilter}
                          options={[
                            { value: 'all', label: 'Stat Scaling' },
                            { value: 'ATK', label: 'ATK' },
                            { value: 'HP', label: 'HP' },
                            { value: 'DEF', label: 'DEF' },
                            { value: 'Crit Rate', label: 'Crit Rate' },
                            { value: 'Crit DMG', label: 'Crit DMG' },
                            { value: 'Energy Regen', label: 'Energy Regen' },
                          ]}
                          ariaLabel="Filter by stat scaling"
                        />
                        <KuroSelect
                          value={collectionDamageFilter}
                          onChange={setCollectionDamageFilter}
                          options={[
                            { value: 'all', label: 'All Damage' },
                            { value: 'Basic ATK', label: 'Basic ATK' },
                            { value: 'Heavy ATK', label: 'Heavy ATK' },
                            { value: 'Skill', label: 'Skill' },
                            { value: 'Liberation', label: 'Liberation' },
                            { value: 'Echo', label: 'Echo' },
                            { value: 'Coordinated', label: 'Coordinated' },
                          ]}
                          ariaLabel="Filter by damage type"
                        />
                        <KuroSelect
                          value={collectionRoleFilter}
                          onChange={setCollectionRoleFilter}
                          options={[
                            { value: 'all', label: 'All Rôles' },
                            { value: 'Main DPS', label: 'Main DPS' },
                            { value: 'Sub DPS', label: 'Sub DPS' },
                            { value: 'Support', label: 'Support' },
                            { value: 'Healer', label: 'Healer' },
                          ]}
                          ariaLabel="Filter by role"
                        />
                      </>)}

                      {/* ── Weapons view: Type, Sub-stat ── */}
                      {collectionView === 'weapons' && (<>
                        <KuroSelect
                          value={collectionWeaponFilter}
                          onChange={setCollectionWeaponFilter}
                          options={[
                            { value: 'all', label: 'All Types' },
                            { value: 'Broadblade', label: 'Broadblade' },
                            { value: 'Sword', label: 'Sword' },
                            { value: 'Pistols', label: 'Pistols' },
                            { value: 'Gauntlets', label: 'Gauntlets' },
                            { value: 'Rectifier', label: 'Rectifier' },
                          ]}
                          ariaLabel="Filter by weapon type"
                        />
                        <KuroSelect
                          value={collectionStatFilter}
                          onChange={setCollectionStatFilter}
                          options={[
                            { value: 'all', label: 'All Sub-stats' },
                            { value: 'ATK%', label: 'ATK%' },
                            { value: 'HP%', label: 'HP%' },
                            { value: 'DEF%', label: 'DEF%' },
                            { value: 'Crit Rate', label: 'Crit Rate' },
                            { value: 'Crit DMG', label: 'Crit DMG' },
                            { value: 'Energy Regen', label: 'Energy Regen' },
                          ]}
                          ariaLabel="Filter by sub-stat"
                        />
                      </>)}

                      {/* ── Echoes view: Set, Buff ── */}
                      {collectionView === 'echoes' && (<>
                        <KuroSelect
                          value={collectionEchoSetFilter}
                          onChange={setCollectionEchoSetFilter}
                          options={[
                            { value: 'all', label: 'All Sets' },
                            ...ALL_ECHO_SONATA_SETS.map(s => ({ value: s, label: s })),
                          ]}
                          ariaLabel="Filter by sonata set"
                        />
                        <KuroSelect
                          value={collectionEchoBuffFilter}
                          onChange={setCollectionEchoBuffFilter}
                          options={[
                            { value: 'all', label: 'All Buffs' },
                            ...ALL_ECHO_BUFF_TYPES.map(b => ({ value: b, label: b })),
                          ]}
                          ariaLabel="Filter by buff type"
                        />
                      </>)}

                      {/* Clear Filters */}
                      {hasActiveFilters && (
                        <button
                          onClick={clearCollectionFilters}
                          className="px-2 py-1 rounded-lg text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all flex items-center justify-center"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                      </CardBody>
                    </Card>
                    {/* Sort Controls */}
                    <div className="flex gap-1.5 items-center justify-end">
                      <button
                        onClick={refreshImages}
                        className="kuro-btn flex items-center justify-center w-[28px] h-[28px] !p-0 !rounded-lg text-gray-400 hover:text-emerald-400 transition-all"
                        title="Refresh images if they don't load"
                        aria-label="Refresh images"
                      >
                        <RefreshCcw size={12} />
                      </button>
                      <button
                        onClick={() => setCollectionSort('copies')}
                        className={`kuro-btn flex items-center justify-center w-[28px] h-[28px] !p-0 !rounded-lg text-[11px] font-bold transition-all ${collectionSort === 'copies' ? 'active-gold' : 'text-gray-400'}`}
                        title="Sort by copies"
                        aria-label="Sort by copies"
                        aria-pressed={collectionSort === 'copies'}
                      >
                        #
                      </button>
                      <button
                        onClick={() => setCollectionSort('release')}
                        className={`kuro-btn flex items-center justify-center w-[28px] h-[28px] !p-0 !rounded-lg transition-all ${collectionSort === 'release' ? 'active-gold' : 'text-gray-400'}`}
                        title="Sort by release date"
                        aria-label="Sort by release date"
                        aria-pressed={collectionSort === 'release'}
                      >
                        <Calendar size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {collectionView === 'echoes' && (<>
                {/* 4-Cost Echoes */}
                <Card>
                  <CardHeader>
                    <span className="text-yellow-400">4</span> Cost Echoes
                  </CardHeader>
                  <CardBody>
                    <CollectionGridSection
                      items={filterEchoes(ALL_4COST_ECHOES).map(name => [name, 0])}
                      collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                      glowClass="glow-gold" ownedBg="bg-yellow-500/10" ownedBorder="border-yellow-500/30"
                      countColor="text-yellow-400" countPrefix="" totalCount={ALL_4COST_ECHOES.length}
                      hasActiveFilters={hasActiveFilters} collectionImages={collectionImages}
                      withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                      framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                      activeBanners={activeBanners} setDetailModal={(m) => setDetailModal({ ...m, cost: 4 })}
                      dataLookup={ECHO_DATA} dataType="echo" isCharacter={false}
                      profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                      collapsible
                    />
                  </CardBody>
                </Card>

                {/* 3-Cost Echoes */}
                <Card>
                  <CardHeader>
                    <span className="text-purple-400">3</span> Cost Echoes
                  </CardHeader>
                  <CardBody>
                    <CollectionGridSection
                      items={filterEchoes(ALL_3COST_ECHOES).map(name => [name, 0])}
                      collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                      glowClass="glow-purple" ownedBg="bg-purple-500/10" ownedBorder="border-purple-500/30"
                      countColor="text-purple-400" countPrefix="" totalCount={ALL_3COST_ECHOES.length}
                      hasActiveFilters={hasActiveFilters} collectionImages={collectionImages}
                      withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                      framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                      activeBanners={activeBanners} setDetailModal={(m) => setDetailModal({ ...m, cost: 3 })}
                      dataLookup={ECHO_DATA} dataType="echo" isCharacter={false}
                      profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                      collapsible
                    />
                  </CardBody>
                </Card>

                {/* 1-Cost Echoes */}
                <Card>
                  <CardHeader>
                    <span className="text-cyan-400">1</span> Cost Echoes
                  </CardHeader>
                  <CardBody>
                    <CollectionGridSection
                      items={filterEchoes(ALL_1COST_ECHOES).map(name => [name, 0])}
                      collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                      glowClass="" ownedBg="bg-cyan-500/10" ownedBorder="border-cyan-500/30"
                      countColor="text-cyan-400" countPrefix="" totalCount={ALL_1COST_ECHOES.length}
                      hasActiveFilters={hasActiveFilters} collectionImages={collectionImages}
                      withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                      framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                      activeBanners={activeBanners} setDetailModal={(m) => setDetailModal({ ...m, cost: 1 })}
                      dataLookup={ECHO_DATA} dataType="echo" isCharacter={false}
                      profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                      collapsible
                    />
                  </CardBody>
                </Card>
                </>)}

                {collectionView === 'items' && (<>
                {/* 5★ Resonators */}
                <Card>
                  <CardHeader>
                    <span className="text-yellow-400">★★★★★</span> Resonators
                  </CardHeader>
                  <CardBody>
                    <CollectionGridSection
                      items={collectionData.sortItems(filterCollectionItems(ALL_5STAR_RESONATORS, collectionData.chars5Counts, true).map(name => [name, collectionData.chars5Counts[name] || 0]), collectionSort)}
                      collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                      glowClass="glow-gold" ownedBg="bg-yellow-500/10" ownedBorder="border-yellow-500/30"
                      countColor="text-yellow-400" countPrefix="S" totalCount={ALL_5STAR_RESONATORS.length}
                      hasActiveFilters={hasActiveFilters} collectionImages={collectionImages}
                      withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                      framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                      activeBanners={activeBanners} setDetailModal={setDetailModal}
                      dataLookup={CHARACTER_DATA} dataType="character" isCharacter={true}
                      profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                      collapsible
                    />
                  </CardBody>
                </Card>

                {/* 4★ Resonators */}
                <Card>
                  <CardHeader>
                    <span className="text-purple-400">★★★★</span> Resonators
                  </CardHeader>
                  <CardBody>
                    <CollectionGridSection
                      items={collectionData.sortItems(filterCollectionItems(ALL_4STAR_RESONATORS, collectionData.chars4Counts, true).map(name => [name, collectionData.chars4Counts[name] || 0]), collectionSort)}
                      collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                      glowClass="glow-purple" ownedBg="bg-purple-500/10" ownedBorder="border-purple-500/30"
                      countColor="text-purple-400" countPrefix="S" totalCount={ALL_4STAR_RESONATORS.length}
                      hasActiveFilters={hasActiveFilters} collectionImages={collectionImages}
                      withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                      framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                      activeBanners={activeBanners} setDetailModal={setDetailModal}
                      dataLookup={CHARACTER_DATA} dataType="character" isCharacter={true}
                      profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                      collapsible
                    />
                  </CardBody>
                </Card>
                </>)}

                {collectionView === 'weapons' && (<>
                {/* 5★ Weapons */}
                <Card>
                  <CardHeader>
                    <span className="text-yellow-400">★★★★★</span> Weapons
                  </CardHeader>
                  <CardBody>
                    <CollectionGridSection
                      items={collectionData.sortItems(filterCollectionItems(ALL_5STAR_WEAPONS, collectionData.weaps5Counts, false).map(name => [name, collectionData.weaps5Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER)}
                      collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                      glowClass="glow-gold" ownedBg="bg-yellow-500/10" ownedBorder="border-yellow-500/30"
                      countColor="text-yellow-400" countPrefix="R" totalCount={ALL_5STAR_WEAPONS.length}
                      hasActiveFilters={hasActiveFilters} collectionImages={collectionImages}
                      withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                      framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                      activeBanners={activeBanners} setDetailModal={setDetailModal}
                      dataLookup={WEAPON_DATA} dataType="weapon" isCharacter={false}
                      profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                      collapsible
                    />
                  </CardBody>
                </Card>

                {/* 4★ Weapons */}
                <Card>
                  <CardHeader>
                    <span className="text-purple-400">★★★★</span> Weapons
                  </CardHeader>
                  <CardBody>
                    <CollectionGridSection
                      items={collectionData.sortItems(filterCollectionItems(ALL_4STAR_WEAPONS, collectionData.weaps4Counts, false).map(name => [name, collectionData.weaps4Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER)}
                      collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                      glowClass="glow-purple" ownedBg="bg-purple-500/10" ownedBorder="border-purple-500/30"
                      countColor="text-purple-400" countPrefix="R" totalCount={ALL_4STAR_WEAPONS.length}
                      hasActiveFilters={hasActiveFilters} collectionImages={collectionImages}
                      withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                      framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                      activeBanners={activeBanners} setDetailModal={setDetailModal}
                      dataLookup={WEAPON_DATA} dataType="weapon" isCharacter={false}
                      profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                      collapsible
                    />
                  </CardBody>
                </Card>

                {/* 3★ Weapons */}
                <Card>
                  <CardHeader>
                    <span className="text-blue-400">★★★</span> Weapons
                  </CardHeader>
                  <CardBody>
                    <CollectionGridSection
                      items={collectionData.sortItems(filterCollectionItems(ALL_3STAR_WEAPONS, collectionData.weaps3Counts, false).map(name => [name, collectionData.weaps3Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER)}
                      collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                      glowClass="" ownedBg="bg-blue-500/10" ownedBorder="border-blue-500/30"
                      countColor="text-blue-400" countPrefix="R" totalCount={ALL_3STAR_WEAPONS.length}
                      hasActiveFilters={hasActiveFilters} collectionImages={collectionImages}
                      withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                      framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                      activeBanners={activeBanners} setDetailModal={setDetailModal}
                      dataLookup={WEAPON_DATA} dataType="weapon" isCharacter={false}
                      profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                      collapsible
                    />
                  </CardBody>
                </Card>

                {/* 2★ Weapons */}
                <Card>
                  <CardHeader>
                    <span className="text-green-400">★★</span> Weapons
                  </CardHeader>
                  <CardBody>
                    <CollectionGridSection
                      items={collectionData.sortItems(filterCollectionItems(ALL_2STAR_WEAPONS, collectionData.weaps2Counts, false).map(name => [name, collectionData.weaps2Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER)}
                      collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                      glowClass="" ownedBg="bg-green-500/10" ownedBorder="border-green-500/30"
                      countColor="text-green-400" countPrefix="R" totalCount={ALL_2STAR_WEAPONS.length}
                      hasActiveFilters={hasActiveFilters} collectionImages={collectionImages}
                      withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                      framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                      activeBanners={activeBanners} setDetailModal={setDetailModal}
                      dataLookup={WEAPON_DATA} dataType="weapon" isCharacter={false}
                      profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                      collapsible
                    />
                  </CardBody>
                </Card>

                {/* 1★ Weapons */}
                <Card>
                  <CardHeader>
                    <span className="text-gray-400">★</span> Weapons
                  </CardHeader>
                  <CardBody>
                    <CollectionGridSection
                      items={collectionData.sortItems(filterCollectionItems(ALL_1STAR_WEAPONS, collectionData.weaps1Counts, false).map(name => [name, collectionData.weaps1Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER)}
                      collMask={collectionMaskData.collMask} collOpacity={collectionMaskData.collOpacity}
                      glowClass="" ownedBg="bg-gray-500/10" ownedBorder="border-gray-500/30"
                      countColor="text-gray-400" countPrefix="R" totalCount={ALL_1STAR_WEAPONS.length}
                      hasActiveFilters={hasActiveFilters} collectionImages={collectionImages}
                      withCacheBuster={withCacheBuster} getImageFraming={getImageFraming}
                      framingMode={framingMode} editingImage={editingImage} setEditingImage={setEditingImage}
                      activeBanners={activeBanners} setDetailModal={setDetailModal}
                      dataLookup={WEAPON_DATA} dataType="weapon" isCharacter={false}
                      profilePic={state.profile.profilePic} onSetProfilePic={handleSetProfilePic}
                      collapsible
                    />
                  </CardBody>
                </Card>
                </>)}
              </>
            )}
          </div>
          </TabErrorBoundary>
          </div>
        )}

        {/* [SECTION:TAB-TEAMS] */}
        {activeTab === 'teams' && (
          <div role="tabpanel" id="tabpanel-teams" aria-labelledby="tab-teams" tabIndex="0">
          <TabErrorBoundary tabName="Teams">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="teams" />

            {(() => {
              const activeTeam = state.teams[state.activeTeamIndex] || state.teams[0];
              const teamSlots = activeTeam.slots;
              const openSelector = (slotIdx) => {
                setTeamSelectorSlot(slotIdx);
                setTeamSearch('');
                setTeamElementFilter('all');
                setTeamRarityFilter('all');
                setTeamBuffFilter('all');
                setTeamDebuffFilter('all');
                setTeamDmgFilter('all');
                setTeamSelectorOpen(true);
                haptic.light();
              };

              const selectCharacter = (name) => {
                dispatch({ type: 'SET_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: teamSelectorSlot, character: name });
                setTeamSelectorOpen(false);
                haptic.success();
              };

              const removeFromSlot = (slotIdx) => {
                dispatch({ type: 'CLEAR_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: slotIdx });
                haptic.light();
              };

              // All available characters for selection
              const allCharNames = [...ALL_5STAR_RESONATORS, ...ALL_4STAR_RESONATORS];

              // Characters already in this team (excluding current slot)
              const usedInTeam = new Set(teamSlots.filter((s, i) => s && i !== teamSelectorSlot));

              // Compute recommended teammates from current team members' team suggestions
              const recommendedNames = new Set();
              teamSlots.filter(s => s).forEach(charInSlot => {
                const d = CHARACTER_DATA[charInSlot];
                if (!d?.teams) return;
                d.teams.forEach(teamStr => {
                  teamStr.split('+').map(m => m.trim()).forEach(m => {
                    if (m !== charInSlot && !usedInTeam.has(m)) recommendedNames.add(m);
                  });
                });
              });

              // Filter characters for selector
              const filteredChars = allCharNames.filter(name => {
                if (usedInTeam.has(name)) return false;
                if (teamSearch && !name.toLowerCase().includes(teamSearch.toLowerCase())) return false;
                const data = CHARACTER_DATA[name];
                if (!data) return false;
                if (teamElementFilter !== 'all' && data.element !== teamElementFilter) return false;
                if (teamRarityFilter !== 'all' && data.rarity !== Number(teamRarityFilter)) return false;
                if (teamBuffFilter !== 'all' && !(data.buffs || []).some(b => b.includes(teamBuffFilter))) return false;
                if (teamDebuffFilter !== 'all' && !(data.debuffs || []).some(b => b.includes(teamDebuffFilter))) return false;
                if (teamDmgFilter !== 'all' && !(data.dmgFocus || []).includes(teamDmgFilter)) return false;
                return true;
              }).sort((a, b) => {
                const aRec = recommendedNames.has(a) ? 0 : 1;
                const bRec = recommendedNames.has(b) ? 0 : 1;
                return aRec - bRec;
              });

              // P6-FIX: Element color utilities now imported from appcore-data.js (F-P6-046)

              return (
                <div className="space-y-3">
                  {/* Team Card — selector row + grid + stats all inside one Card */}
                  <Card>
                    <CardHeader action={
                      <div className="flex gap-1.5">
                        {/* P6-FIX: Use .kuro-btn for consistency (F-P6-047) */}
                        <button
                          onClick={() => {
                            const slots = (state.teams[state.activeTeamIndex] || state.teams[0]).slots;
                            if (!slots.some(s => s)) return;
                            if (teamCompareEntries.length >= 5) return;
                            setTeamCompareEntries(prev => [...prev, { id: Date.now(), slots: slots.slice(), teamIdx: state.activeTeamIndex }]);
                            haptic.success();
                          }}
                          disabled={teamCompareEntries.length >= 5 || !(state.teams[state.activeTeamIndex] || state.teams[0]).slots.some(s => s)}
                          className="kuro-btn active-gold text-[10px]"
                          aria-label="Add current team to comparison"
                        >
                          + Compare
                        </button>
                        <button
                          onClick={() => { dispatch({ type: 'CLEAR_TEAM', teamIndex: state.activeTeamIndex }); haptic.medium(); }}
                          className="kuro-btn text-[10px]"
                          aria-label="Clear all slots in current team"
                        >
                          Clear
                        </button>
                      </div>
                    }>
                      <Users size={14} className="text-yellow-400" /> Team Builder
                    </CardHeader>
                    <CardBody>
                      {/* Team Selector Tabs — P6-FIX: ARIA tab pattern (F-P6-059) */}
                      <div className="flex gap-1 mb-3" role="tablist" aria-label="Team selector" onKeyDown={(e) => {
                        const idx = state.activeTeamIndex;
                        let next;
                        if (e.key === 'ArrowRight') { e.preventDefault(); next = (idx + 1) % state.teams.length; }
                        else if (e.key === 'ArrowLeft') { e.preventDefault(); next = (idx - 1 + state.teams.length) % state.teams.length; }
                        if (next !== undefined) { dispatch({ type: 'SET_ACTIVE_TEAM', index: next }); setTimeout(() => e.currentTarget.children[next]?.focus(), 50); }
                      }}>
                        {state.teams.map((team, idx) => {
                          const hasChars = team.slots.some(s => s);
                          const isActive = state.activeTeamIndex === idx;
                          return (
                            <button
                              key={idx}
                              role="tab"
                              aria-selected={isActive}
                              tabIndex={isActive ? 0 : -1}
                              onClick={() => { dispatch({ type: 'SET_ACTIVE_TEAM', index: idx }); haptic.light(); }}
                              className={`kuro-btn flex-1 min-w-0 flex items-center justify-center gap-1 ${
                                isActive ? 'active-gold' : ''
                              }`}
                            >
                              <span className="truncate">{team.name}</span>
                              {hasChars && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 flex-shrink-0" aria-hidden="true" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Character Cards Grid — E2-FP2: hero treatment for active team */}
                      <div className="grid grid-cols-3 gap-2 p-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5" style={{ boxShadow: '0 0 16px rgba(237,175,24,0.08)' }}>
                        {teamSlots.map((charName, slotIdx) => {
                          const charData = charName ? CHARACTER_DATA[charName] : null;
                          const imgUrl = charName ? (collectionImages[charName] || '') : '';
                          const teamKey = `team-${charName}`;
                          const framing = charName ? getImageFraming(teamKey) : null;

                          if (!charName) {
                            return (
                              <button
                                key={slotIdx}
                                onClick={() => openSelector(slotIdx)}
                                className="relative overflow-hidden border-2 border-dashed rounded-lg border-white/15 hover:border-yellow-500/40 transition-all flex flex-col items-center justify-center gap-2 group"
                                style={{ height: '160px', contain: 'paint' }}
                                aria-label={`Add resonator to slot ${slotIdx + 1}`}
                              >
                                <Plus size={18} className="text-gray-500 group-hover:text-yellow-400 transition-colors" />
                                <span className="text-[10px] text-gray-400 group-hover:text-gray-300 transition-colors">Slot {slotIdx + 1}</span>
                              </button>
                            );
                          }

                          const rarity5 = charData?.rarity === 5;
                          return (
                            <div
                              key={slotIdx}
                              className={`relative overflow-hidden border rounded-lg text-center ${!framingMode ? 'collection-card' : ''} cursor-pointer group ${framingMode && editingImage === teamKey ? 'border-emerald-500 ring-2 ring-emerald-500/50' : rarity5 ? 'bg-yellow-500/10 border-yellow-500/30 holo-5star' : 'bg-purple-500/10 border-purple-500/30'}`}
                              style={{ height: '160px', contain: 'paint' }}
                              onClick={() => {
                                if (framingMode) {
                                  setEditingImage(teamKey);
                                } else {
                                  openSelector(slotIdx);
                                }
                              }}
                            >
                              {framingMode && editingImage === teamKey && (
                                <div className="absolute top-1 left-1 z-20 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <span className="text-black text-[10px]">✓</span>
                                </div>
                              )}
                              {imgUrl && (
                                <img
                                  src={imgUrl}
                                  alt={charName}
                                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                  style={{
                                    transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)`,
                                  }}
                                  loading="lazy"
                                  onError={hideOnError}
                                />
                              )}
                              {/* P6-FIX: Increased from w-5 h-5 to w-[28px] h-[28px] for touch targets (F-P6-050) */}
                              {!framingMode && <button
                                onClick={(e) => { e.stopPropagation(); removeFromSlot(slotIdx); }}
                                className="absolute top-1 right-1 z-20 w-[28px] h-[28px] rounded-full bg-red-500/80 text-white flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                aria-label={`Remove ${charName} from slot ${slotIdx + 1}`}
                              >
                                <X size={12} />
                              </button>}
                              <div className="absolute bottom-0 left-0 right-0 z-10 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                                <div className={`${rarity5 ? 'text-yellow-400' : 'text-purple-400'} text-[8px]`}>{rarity5 ? '★★★★★' : '★★★★'}</div>
                                <div className="text-[10px] truncate text-gray-200">{charName}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Team Elements Summary */}
                      {teamSlots.some(s => s) && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {teamSlots.filter(s => s).map((name, i) => {
                            const d = CHARACTER_DATA[name];
                            return d ? (
                              <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                                style={{ color: getElementColor(d.element), background: getElementBg(d.element), border: `1px solid ${getElementBorder(d.element)}` }}>
                                {d.element}
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </CardBody>
                  </Card>

                  {/* Team Overview + Damage Analysis (merged) */}
                  {(() => {
                    // ── Reusable calculator with proper WuWa damage formula ──
                    const calcTeamStats = (slots, teamIdx) => {
                      const mems = slots.filter(s => s).map(name => {
                        const d = CHARACTER_DATA[name];
                        if (!d) return null;
                        // Use equipped weapon if set, otherwise fall back to bestWeapon
                        const eqKey = teamIdx + ':' + name;
                        const eq = teamEquipment[eqKey];
                        const weapName = (eq?.weapon) || d.bestWeapon;
                        const weapon = WEAPON_DATA[weapName] || null;
                        const charAtk = d.baseAtk || 0;
                        const weapAtk = weapon ? weapon.baseAtk : 0;
                        const seqLevel = eq?.sequence || 0;
                        let echoSetName = eq?.echoSet || '';
                        if (!echoSetName && d.bestEchoes) { for (const e of d.bestEchoes) { const k = Object.keys(ECHO_SETS).find(k => e.includes(k)); if (k) { echoSetName = k; break; } } }
                        return { name, d, weapon, weapName, charAtk, weapAtk, totalBaseAtk: charAtk + weapAtk, echoSetName, echoSet: echoSetName ? ECHO_SETS[echoSetName] : null, weapSubstat: weapon?.stat || '', weapSubVal: weapon?.subStatValue || '', seqLevel };
                      }).filter(Boolean);
                      if (!mems.length) return null;
                      const allBuffs = [], allDebuffs = [];
                      mems.forEach(m => { (m.d.buffs || []).forEach(b => allBuffs.push({ source: m.name, buff: b })); (m.d.debuffs || []).forEach(b => allDebuffs.push({ source: m.name, debuff: b })); });
                      const mainDps = mems.find(m => m.d.role === 'Main DPS') || mems[0];

                      // ── Parse weapon passive for real values ──
                      const parsePassive = (passive, element) => {
                        const r = { atkPct: 0, elemDmg: 0, skillDmg: 0, critRate: 0, critDmg: 0, defIgnore: 0, resShred: 0 };
                        if (!passive) return r;
                        const p = passive.toLowerCase();
                        // ATK% from passive
                        const atkMatch = p.match(/atk\s*\+(\d+)%/);
                        if (atkMatch) r.atkPct += parseInt(atkMatch[1]);
                        // Element DMG
                        if (element) {
                          const elLow = element.toLowerCase();
                          const elMatch = p.match(new RegExp(elLow + '\\s*dmg\\s*\\+?(\\d+)%'));
                          if (elMatch) r.elemDmg += parseInt(elMatch[1]);
                          // Also "attribute dmg"
                          const attrMatch = p.match(/attribute\s*dmg\s*(?:bonus\s*)?\+?(\d+)%/);
                          if (attrMatch) r.elemDmg += parseInt(attrMatch[1]);
                        }
                        // Skill DMG variants
                        const skillMatch = p.match(/(?:resonance\s*)?skill\s*dmg\s*\+?(\d+)%/);
                        if (skillMatch) r.skillDmg += parseInt(skillMatch[1]);
                        const libMatch = p.match(/liberation\s*dmg\s*\+?(\d+)%/);
                        if (libMatch) r.skillDmg += parseInt(libMatch[1]);
                        // Crit from passive
                        const crMatch = p.match(/crit\s*rate\s*\+?(\d+)%/);
                        if (crMatch) r.critRate += parseInt(crMatch[1]);
                        // DEF Ignore
                        const defMatch = p.match(/def\s*ignore\s*\+?(\d+)%/);
                        if (defMatch) r.defIgnore += parseInt(defMatch[1]);
                        // RES Shred
                        const resMatch = p.match(/res\s*-(\d+)%/);
                        if (resMatch) r.resShred += parseInt(resMatch[1]);
                        return r;
                      };

                      // ── Base stats ──
                      let atkPct = 0, cr = 5, cd = 150, elemDmg = 0, skillDmg = 0, deepen = 0, defShred = 0, resShred = 0, defIgnore = 0;

                      // Weapon substat
                      if (mainDps.weapSubstat === 'Crit Rate') cr += parseFloat(mainDps.weapSubVal) || 0;
                      if (mainDps.weapSubstat === 'Crit DMG') cd += parseFloat(mainDps.weapSubVal) || 0;
                      if (mainDps.weapSubstat === 'ATK%') atkPct += parseFloat(mainDps.weapSubVal) || 0;
                      if (mainDps.weapSubstat === 'Energy Regen') atkPct += 5; // indirect contribution
                      if (mainDps.weapSubstat === 'HP%') {} // HP scaling chars — simplified

                      // Weapon passive (real parsed values)
                      if (mainDps.weapon?.passive) {
                        const wp = parsePassive(mainDps.weapon.passive, mainDps.d.element);
                        atkPct += wp.atkPct; elemDmg += wp.elemDmg; skillDmg += wp.skillDmg;
                        cr += wp.critRate; cd += wp.critDmg; defIgnore += wp.defIgnore; resShred += wp.resShred;
                      }

                      // Echo set bonuses (2pc + 5pc)
                      if (mainDps.echoSet) {
                        const p2 = mainDps.echoSet.p2val || {}, p5 = mainDps.echoSet.p5val || {};
                        if (p2.atkPct) atkPct += p2.atkPct; if (p5.atkPct) atkPct += p5.atkPct;
                        if (p2.critRate) cr += p2.critRate; if (p5.critRate) cr += p5.critRate;
                        if (p2.skillDmg) skillDmg += p2.skillDmg; if (p5.skillDmg) skillDmg += p5.skillDmg;
                        const ek = (mainDps.d.element || '').toLowerCase() + 'Dmg';
                        if (p2[ek]) elemDmg += p2[ek]; if (p5[ek]) elemDmg += p5[ek];
                      }

                      // ── Team buff contributions from CHAR_BUFF_TABLE (exact per-character values) ──
                      let basicDmg = 0, heavyDmg = 0, libDmg = 0, echoDmg = 0;
                      mems.forEach(m => {
                        const bt = CHAR_BUFF_TABLE[m.name];
                        if (!bt) return;
                        const isMain = m.name === mainDps.name;

                        // Outro buffs — applied to main DPS (target: 'next')
                        // Scale by uptime: buff.duration / rotTime of team
                        if (!isMain) {
                          const teamRotTime = mainDps.d.rotTime || 25;
                          (bt.outroBuffs || []).forEach(b => {
                            if (b.target === 'next' || b.target === 'enemy') {
                              const uptime = Math.min(1, (b.duration || 14) / teamRotTime);
                              const val = b.value * uptime;
                              if (b.stat === 'atkPct') atkPct += val;
                              else if (b.stat === 'allDmg') elemDmg += val;
                              else if (b.stat === 'elemDmg') {
                                const buffEl = (b.condition || '').toLowerCase();
                                const dpsEl = (mainDps.d.element || '').toLowerCase();
                                if (!buffEl || buffEl.includes(dpsEl) || buffEl.includes('all')) elemDmg += val;
                              }
                              else if (b.stat === 'deepen') deepen += val;
                              else if (b.stat === 'basicDmg') basicDmg += val;
                              else if (b.stat === 'heavyDmg') heavyDmg += val;
                              else if (b.stat === 'libDmg') libDmg += val;
                              else if (b.stat === 'echoDmg') echoDmg += val;
                              else if (b.stat === 'critRate') cr += val;
                              else if (b.stat === 'critDmg') cd += val;
                              else if (b.stat === 'resShred') resShred += val;
                              else if (b.stat === 'defShred') defShred += val;
                              else if (b.stat === 'skillDmg') skillDmg += val;
                            }
                          });
                        }

                        // Liberation buffs — teamwide, apply to main DPS (scaled by uptime)
                        (bt.libBuffs || []).forEach(b => {
                          if (b.target === 'team' || (!isMain && b.target === 'next')) {
                            const teamRotTime = mainDps.d.rotTime || 25;
                            const uptime = Math.min(1, (b.duration || 25) / teamRotTime);
                            const val = b.value * uptime;
                            if (b.stat === 'atkPct') atkPct += val;
                            else if (b.stat === 'allDmg') elemDmg += val;
                            else if (b.stat === 'critRate') cr += val;
                            else if (b.stat === 'critDmg') cd += val;
                            else if (b.stat === 'echoDmg') echoDmg += val;
                          }
                        });

                        // Self buffs — only for main DPS
                        if (isMain) {
                          (bt.selfBuffs || []).forEach(b => {
                            if (b.stat === 'atkPct') atkPct += b.value;
                            else if (b.stat === 'elemDmg') elemDmg += b.value;
                            else if (b.stat === 'critRate') cr += b.value;
                            else if (b.stat === 'critDmg') cd += b.value;
                            else if (b.stat === 'defIgnore') defIgnore += b.value;
                          });
                        }

                        // Debuffs — enemy-side, from any team member
                        (bt.debuffs || []).forEach(db => {
                          if (db.stat === 'defShred') defShred += db.value;
                          else if (db.stat === 'resShred') resShred += db.value;
                          else if (db.stat === 'frazzle') {} // DOT computed separately below
                          else if (db.stat === 'erosion') {} // DOT computed separately below
                          else if (db.stat === 'offTune') deepen += db.value;
                          else if (db.stat === 'havocBane') defShred += db.value * 2; // 2% DEF reduction per stack
                        });
                      });

                      // Map DPS's dmgFocus to the right skill DMG bonus
                      const focus = mainDps.d.dmgFocus || [];
                      if (focus.includes('Basic ATK')) skillDmg += basicDmg;
                      else if (basicDmg > 0 && !focus.length) skillDmg += basicDmg * 0.5; // partial benefit
                      if (focus.includes('Heavy ATK')) skillDmg += heavyDmg;
                      else if (heavyDmg > 0 && !focus.length) skillDmg += heavyDmg * 0.5;
                      if (focus.includes('Liberation')) skillDmg += libDmg;
                      else if (libDmg > 0) skillDmg += libDmg * 0.3; // partial — some rotation damage is Lib
                      if (focus.includes('Echo')) skillDmg += echoDmg;

                      // Support echo set contributions
                      mems.forEach(m => {
                        if (m.name === mainDps.name) return;
                        if (m.echoSetName === 'Rejuvenating Glow') atkPct += 15;
                        if (m.echoSetName === 'Moonlit Clouds') atkPct += 22.5;
                        if (m.echoSetName === 'Empyrean Anthem') { atkPct += 20; skillDmg += 10; }
                        if (m.echoSetName === 'Tidebreaking Courage') { atkPct += 15; elemDmg += 15; } // assumes ≥250% ER
                      });

                      // ── Resonance Chain (S1-S6) buffs ──
                      let seqTotalMultBonus = 0; // bonus % to totalMult rotation data
                      mems.forEach(m => {
                        const rc = RESONANCE_CHAIN_DATA[m.name];
                        if (!rc || m.seqLevel <= 0) return;
                        const isMain = m.name === mainDps.name;
                        for (let s = 1; s <= Math.min(m.seqLevel, 6); s++) {
                          const lvl = rc['s' + s];
                          if (!lvl) continue;
                          // For main DPS: apply all personal stat buffs
                          if (isMain) {
                            if (lvl.atkPct) atkPct += lvl.atkPct;
                            if (lvl.critRate) cr += lvl.critRate;
                            if (lvl.critDmg) cd += lvl.critDmg;
                            if (lvl.elemDmg) elemDmg += lvl.elemDmg;
                            if (lvl.skillDmg) skillDmg += lvl.skillDmg;
                            if (lvl.basicDmg) basicDmg += lvl.basicDmg;
                            if (lvl.heavyDmg) heavyDmg += lvl.heavyDmg;
                            if (lvl.libDmg) libDmg += lvl.libDmg;
                            if (lvl.echoDmg) echoDmg += lvl.echoDmg;
                            if (lvl.deepen) deepen += lvl.deepen;
                            if (lvl.defIgnore) defIgnore += lvl.defIgnore;
                            if (lvl.defShred) defShred += lvl.defShred;
                            if (lvl.resShred) resShred += lvl.resShred;
                            if (lvl.totalMult) seqTotalMultBonus += lvl.totalMult;
                          } else {
                            // For supports: improved team buffs (allDmg, deepen, defShred, resShred affect team)
                            if (lvl.allDmg) elemDmg += lvl.allDmg;
                            if (lvl.deepen) deepen += lvl.deepen;
                            if (lvl.defShred) defShred += lvl.defShred;
                            if (lvl.resShred) resShred += lvl.resShred;
                            if (lvl.atkPct) atkPct += lvl.atkPct; // team ATK buffs
                            if (lvl.critRate) cr += lvl.critRate;
                            if (lvl.critDmg) cd += lvl.critDmg;
                            if (lvl.basicDmg) basicDmg += lvl.basicDmg; // e.g. Camellya S4 team Basic DMG
                            if (lvl.heavyDmg) heavyDmg += lvl.heavyDmg;
                          }
                        }
                      });

                      // Re-map DPS dmgFocus with any new basicDmg/heavyDmg/libDmg from sequences
                      // (Only add the NEW sequence contributions, the base was already mapped above)
                      // Note: we skip re-mapping here to avoid double-counting since the initial mapping already ran
                      // Total ATK = (charBaseATK + weapBaseATK) × (1 + ATK%)
                      const effAtk = Math.round(mainDps.totalBaseAtk * (1 + atkPct / 100));
                      // Avg Crit Multiplier
                      const avgCrit = 1 + (Math.min(cr, 100) / 100) * (cd / 100 - 1);
                      // Damage Bonus = (1 + elemDMG%) × (1 + skillDMG%) × (1 + deepen%)
                      const dmgBonus = (1 + elemDmg / 100) * (1 + skillDmg / 100) * (1 + deepen / 100);
                      // DEF multiplier: enemy DEF reduced by shred/ignore. Lv90 enemy base.
                      // DEF reduction = 1 - (defShred + defIgnore)/100, capped
                      const enemyDef = 792; // Lv90 standard enemy
                      const effectiveDef = enemyDef * Math.max(0, 1 - (defShred + defIgnore) / 100);
                      const defMult = 800 / (800 + effectiveDef); // WuWa DEF formula: charLevel constant ~800
                      // RES multiplier: 10% base resistance, reduced by shred
                      const baseRes = 10;
                      const effectiveRes = Math.max(baseRes - resShred, -30); // can go negative
                      const resMult = 1 - effectiveRes / 100;
                      // Final score
                      const score = Math.round(effAtk * avgCrit * dmgBonus * defMult * resMult);

                      // ── DOT Damage: Frazzle & Erosion (Level-based, NOT ATK-based) ──
                      // Formula: BaseDMG = LevelMult × 1.25078 × StackMult
                      // Lv90 LevelMult = 3674. Ticks consume 1 stack.
                      // Only affected by DEF, RES, and specific Amplify effects.
                      const rotTime = mainDps.d.rotTime || 25;
                      const DOT_LEVEL_MULT = 3674; // Lv90
                      const DOT_BASE_FACTOR = 1.25078;
                      let dotDmgPerRotation = 0;

                      // Check if team has Frazzle appliers
                      const hasFrazzle = mems.some(m => {
                        const bt = CHAR_BUFF_TABLE[m.name];
                        return bt?.debuffs?.some(db => db.stat === 'frazzle');
                      });
                      if (hasFrazzle) {
                        // Phoebe applies ~18 stacks in Confession, Rover ~10
                        const frazzleStacks = mems.some(m => m.name === 'Phoebe') ? 18 : 10;
                        // Ticks every 3s, each tick at current stack count then -1
                        const numTicks = Math.min(Math.floor(rotTime / 3), frazzleStacks);
                        let frazzleTotal = 0;
                        for (let s = frazzleStacks; s > frazzleStacks - numTicks; s--) {
                          frazzleTotal += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (s * 0.15); // stack multiplier ~0.15 per stack at high stacks
                        }
                        // Phoebe Outro: 100% Frazzle DMG Amp (Confession mode) + Spectro RES -10% already in resShred
                        const hasPhoebeAmp = mems.some(m => m.name === 'Phoebe');
                        const frazzleAmpMult = hasPhoebeAmp ? 2.0 : 1.0; // 100% amp = 2x
                        dotDmgPerRotation += frazzleTotal * frazzleAmpMult * defMult * resMult;
                      }

                      // Check if team has Erosion appliers
                      const hasErosion = mems.some(m => {
                        const bt = CHAR_BUFF_TABLE[m.name];
                        return bt?.debuffs?.some(db => db.stat === 'erosion');
                      });
                      if (hasErosion) {
                        const erosionStacks = mems.some(m => m.name === 'Rover') ? 6 : 3;
                        const erosionTicks = Math.max(1, Math.floor(rotTime / 15));
                        let erosionTotal = 0;
                        for (let t = 0; t < erosionTicks; t++) {
                          erosionTotal += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (erosionStacks * 0.8);
                        }
                        dotDmgPerRotation += erosionTotal * defMult * resMult;
                      }

                      // Check if team has Fusion Burst appliers (Aemeath)
                      const hasFusionBurst = mems.some(m => {
                        const bt = CHAR_BUFF_TABLE[m.name];
                        return bt?.debuffs?.some(db => db.stat === 'fusionBurst');
                      });
                      if (hasFusionBurst) {
                        // Fusion Burst: stacks to 10 (Aemeath changes to 6 trigger), explodes for Fusion AoE
                        // In Aemeath's case: enhanced skills use max stacks WITHOUT consuming + Fusion Trail (30 stacks = 300% mult)
                        // ~2 explosions per rotation, each scaling off Level + stacks
                        const burstExplosions = 2;
                        const burstStacks = 10; // max stack damage even at 6 trigger
                        const fusionTrailMult = 3.0; // 30 Fusion Trail stacks = 300% extra mult
                        const burstDmg = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (burstStacks * 0.5) * fusionTrailMult;
                        dotDmgPerRotation += burstDmg * burstExplosions * defMult * resMult;
                      }

                      // Check if team has Electro Flare appliers
                      const hasElectroFlare = mems.some(m => {
                        return m.d.element === 'Electro' && (m.d.dmgFocus || []).length > 0;
                      });
                      if (hasElectroFlare) {
                        // Electro Flare: periodic Electro DOT, loses half stacks per tick
                        // Max 10 stacks → 5 → 2 → 1, each tick deals increasing DMG
                        // Also generates Electro Rage at max for amplified next Flare
                        const flareTicks = Math.min(4, Math.floor(rotTime / 4));
                        let flareTotal = 0;
                        let stacks = 10;
                        for (let t = 0; t < flareTicks; t++) {
                          flareTotal += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (stacks * 0.12);
                          stacks = Math.ceil(stacks / 2);
                        }
                        dotDmgPerRotation += flareTotal * defMult * resMult;
                      }

                      // ── Tune Break damage layer (v3.0+) ──
                      let tuneBreakDmg = 0;
                      let tuneBreakAmp = 0;
                      let tuneBreakDeepenMult = 1;
                      const tuneBreakMembers = mems.filter(m => CHAR_BUFF_TABLE[m.name]?.tuneBreak);
                      if (tuneBreakMembers.length > 0) {
                        // Sum Tune Break Boost from all members
                        let totalTuneBreakBoost = 0;
                        tuneBreakMembers.forEach(m => {
                          const tb = CHAR_BUFF_TABLE[m.name].tuneBreak;
                          totalTuneBreakBoost += (tb.baseTuneBreakBoost || 0) + (tb.boostToTeam || 0);
                        });

                        // ~1 Tune Break per rotation on endgame bosses
                        const tuneBreaksPerRotation = 1;

                        // Base Tune Break DMG: scales off Tune Break Boost (Physical, flat)
                        const baseTuneBreakDmg = 5000 * (1 + totalTuneBreakBoost * 0.02);
                        tuneBreakDmg += baseTuneBreakDmg * tuneBreaksPerRotation * defMult;

                        // Tune Rupture Response: extra DMG instance from each responder per Break
                        tuneBreakMembers.forEach(m => {
                          const tb = CHAR_BUFF_TABLE[m.name].tuneBreak;
                          if (tb.ruptureDmgMult) {
                            const responseDmg = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (tb.ruptureDmgMult / 100);
                            tuneBreakDmg += responseDmg * tuneBreaksPerRotation * defMult * resMult;
                          }
                        });

                        // Mornye Interfered Marker: up to 40% more DMG on target
                        const mornyeMem = tuneBreakMembers.find(m => CHAR_BUFF_TABLE[m.name].tuneBreak.interferedDmgAmp);
                        if (mornyeMem) {
                          tuneBreakAmp = CHAR_BUFF_TABLE[mornyeMem.name].tuneBreak.interferedDmgAmp;
                          const interferedUptime = Math.min(1, (8 * tuneBreaksPerRotation) / rotTime);
                          tuneBreakDeepenMult *= 1 + (tuneBreakAmp / 100) * interferedUptime;
                        }

                        // Tune Strain: per stack × Boost × 0.12% total DMG increase
                        const maxStrain = Math.max(...tuneBreakMembers.map(m => CHAR_BUFF_TABLE[m.name].tuneBreak.maxStrainStacks || 0));
                        if (maxStrain > 0 && totalTuneBreakBoost > 0) {
                          const strainDmgPct = maxStrain * totalTuneBreakBoost * 0.12;
                          const strainUptime = Math.min(1, (8 * tuneBreaksPerRotation) / rotTime);
                          tuneBreakDeepenMult *= 1 + (strainDmgPct / 100) * strainUptime;
                        }
                      }
                      dotDmgPerRotation += tuneBreakDmg;

                      // ── Real DPS: skill multipliers × rotation timing + DOT ──
                      // Sum total rotation damage from all team members
                      let totalRotDmg = 0;
                      mems.forEach(m => {
                        let mult = m.d.totalMult || 0;
                        if (mult === 0) return;
                        const mAtk = m.totalBaseAtk;
                        const isMain = m.name === mainDps.name;
                        // Main DPS: apply resonance chain totalMult bonus
                        if (isMain && seqTotalMultBonus > 0) mult = mult * (1 + seqTotalMultBonus / 100);
                        if (isMain) {
                          totalRotDmg += mAtk * (1 + atkPct / 100) * (mult / 100) * avgCrit * dmgBonus * defMult * resMult;
                        } else {
                          // Support/sub DPS: own weapon substat + basic element bonus, reduced crit
                          let sElem = 10; // 2pc echo bonus
                          if (m.echoSet) {
                            const ek2 = (m.d.element || '').toLowerCase() + 'Dmg';
                            sElem += (m.echoSet.p2val?.[ek2] || 0) + (m.echoSet.p5val?.[ek2] || 0);
                          }
                          const sAtk = mAtk * 1.15; // ~15% ATK from substats
                          const sCrit = 1 + (0.05) * (0.5); // minimal crit contribution
                          totalRotDmg += sAtk * (mult / 100) * sCrit * (1 + sElem / 100) * defMult * resMult;
                        }
                      });
                      const realDps = Math.round((totalRotDmg + dotDmgPerRotation) * tuneBreakDeepenMult / rotTime);

                      // Synergy
                      let syn = 0;
                      if (mems.some(m => m.d.role === 'Healer')) syn += 25;
                      if (mems.some(m => m.d.role === 'Support' || m.d.role === 'Sub DPS')) syn += 25;
                      if (allBuffs.length >= 2) syn += 15;
                      if (allDebuffs.length >= 1) syn += 10;
                      if (allBuffs.some(b => b.buff.includes(mainDps.d.element))) syn += 15;
                      if (mainDps.d.dmgFocus?.length > 0 && allBuffs.some(b => mainDps.d.dmgFocus.some(df => b.buff.includes(df)))) syn += 10;
                      syn = Math.min(syn, 100);
                      const warnings = [];
                      if (!mems.some(m => m.d.role === 'Healer')) warnings.push('No healer in team');
                      if (mems.length < 3) warnings.push('Incomplete team');
                      const els = new Set(mems.map(m => m.d.element));
                      if (els.size === mems.length && mems.length >= 3) warnings.push('No element resonance');
                      const dotDps = Math.round(dotDmgPerRotation / rotTime);
                      return { members: mems, mainDps, allBuffs, allDebuffs, effAtk, critRate: cr, critDmg: cd, elemDmg, skillDmg, deepen, atkPct, defShred, resShred, defIgnore, avgCrit, defMult, resMult, score, realDps, dotDps, hasFrazzle, hasErosion, hasFusionBurst, hasElectroFlare, synergy: syn, warnings };
                    };

                    const stats = calcTeamStats(teamSlots, state.activeTeamIndex);
                    if (!stats) return null;
                    const { members, mainDps, allBuffs, allDebuffs, effAtk, critRate: cr, critDmg: cd, elemDmg, skillDmg, deepen, atkPct, defShred, resShred, defIgnore, avgCrit, score, realDps, synergy, warnings } = stats;
                    const roleColors = { 'Main DPS': { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }, 'Sub DPS': { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' }, Support: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' }, Healer: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' } };

                    return (
                      <>
                      <Card>
                        <CardHeader><Zap size={14} className="text-yellow-400" /> Team Overview</CardHeader>
                        <CardBody>
                          <div className="space-y-3">
                            {/* Per-member: overview + damage breakdown */}
                            {members.map((m) => {
                              const rarity5 = m.d.rarity === 5;
                              const rc = roleColors[m.d.role] || roleColors.Support;
                              const isMain = m.name === mainDps.name;
                              return (
                                <div key={m.name} className="p-2.5 rounded-lg border hover:border-white/15 transition-colors"
                                  style={{ background: 'var(--bg-stat)', borderColor: `${getElementColor(m.d.element)}25`, boxShadow: `0 0 12px ${getElementColor(m.d.element)}10` }}>
                                  {/* 2-col: Left=header+desc+focus+buffs, Right=stats+equipment */}
                                  <div className="flex flex-row gap-3">
                                    {/* LEFT: header + description + damage focus + buffs */}
                                    <div className="flex-1 min-w-0">
                                  {/* Character header */}
                                  <div className="mb-2">
                                    <div className="flex items-start gap-2 mb-1.5">
                                      <div className={`w-9 h-10 rounded-lg overflow-hidden border border-white/15 flex-shrink-0 breath-zoom${rarity5 ? ' holo-5star' : ''}`}
                                        style={{ background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                                        {collectionImages[m.name] ? (
                                          <img src={collectionImages[m.name]} alt={m.name} className="w-full h-full object-cover object-top" onError={hideOnError} />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">{m.name[0]}</div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-white text-xs font-semibold">{m.name}</span>
                                          <span className={`text-[8px] ${rarity5 ? 'text-yellow-400' : 'text-purple-400'}`}>{rarity5 ? '★★★★★' : '★★★★'}</span>
                                        </div>
                                        <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
                                          <span className={`text-[10px] px-2 py-0.5 rounded ${rc.bg} ${rc.border} ${rc.text} border font-medium`}>{m.d.role}</span>
                                          <span className="text-[10px] px-2 py-0.5 rounded font-medium"
                                            style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                                            {m.d.element}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400">{m.d.weapon}</span>
                                  </div>
                                  {/* Description */}
                                  {m.d.desc && (() => {
                                    const dot = m.d.desc.indexOf('. ');
                                    const lore = dot > 0 ? m.d.desc.slice(0, dot + 1) : null;
                                    const gameplay = dot > 0 ? m.d.desc.slice(dot + 2) : m.d.desc;
                                    return (
                                      <div className="text-[10px] leading-relaxed mb-1.5">
                                        {lore && <span className="text-gray-500 italic">{lore} </span>}
                                        <span className="text-gray-400">{gameplay}</span>
                                      </div>
                                    );
                                  })()}
                                  {/* Damage Focus */}
                                  <div className="mb-1.5">
                                    <div className="kuro-label">Damage Focus</div>
                                    <div className="flex flex-wrap gap-1">
                                      <span className="text-[10px] px-2 py-0.5 rounded font-medium"
                                        style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                                        {m.d.element} DMG
                                      </span>
                                      {(m.d.dmgFocus || []).map((df, di) => (
                                        <span key={di} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400" style={{ boxShadow: "0 0 6px rgba(245,158,11,0.12)" }}>{df}</span>
                                      ))}
                                      {m.d.statScaling && (
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/25 text-violet-400" style={{ boxShadow: "0 0 6px rgba(139,92,246,0.12)" }}>{m.d.statScaling} Scaling</span>
                                      )}
                                    </div>
                                  </div>
                                  {/* Buffs */}
                                  {m.d.buffs?.length > 0 && (
                                    <div className="mb-1.5">
                                      <div className="kuro-label">Buffs</div>
                                      <div className="flex flex-wrap gap-1">
                                        {m.d.buffs.map((b, bi) => (
                                          <span key={bi} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400" style={{ boxShadow: "0 0 6px rgba(34,197,94,0.12)" }}>{b}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {/* Debuffs */}
                                  {m.d.debuffs?.length > 0 && (
                                    <div className="mb-1.5">
                                      <div className="kuro-label">Debuffs</div>
                                      <div className="flex flex-wrap gap-1">
                                        {m.d.debuffs.map((db, di) => (
                                          <span key={di} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400" style={{ boxShadow: "0 0 6px rgba(239,68,68,0.12)" }}>{db}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {/* Main DPS: expanded damage stats */}
                                  {isMain && (
                                    <div className="mb-1.5">
                                      <div className="kuro-label" title="Includes active team buff modifiers">Damage Stats</div>
                                      <div className="flex flex-wrap gap-1">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/25 text-yellow-400" style={{ boxShadow: "0 0 8px rgba(234,179,8,0.15)" }}>Eff.ATK {effAtk.toLocaleString()}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400" style={{ boxShadow: "0 0 8px rgba(6,182,212,0.15)" }}>CR {cr.toFixed(1)}%</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400" style={{ boxShadow: "0 0 8px rgba(6,182,212,0.15)" }}>CD {cd.toFixed(1)}%</span>
                                        <span className="text-[8px] px-2 py-0.5 rounded font-medium"
                                          style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                                          {m.d.element} +{elemDmg.toFixed(0)}%
                                        </span>
                                        {skillDmg > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400" style={{ boxShadow: "0 0 8px rgba(245,158,11,0.15)" }}>Skill +{skillDmg.toFixed(0)}%</span>}
                                        {atkPct > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400" style={{ boxShadow: "0 0 8px rgba(34,197,94,0.15)" }}>ATK% +{atkPct.toFixed(0)}%</span>}
                                        {deepen > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/25 text-purple-400" style={{ boxShadow: "0 0 8px rgba(168,85,247,0.15)" }}>Deepen +{deepen.toFixed(0)}%</span>}
                                        {defShred > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400" style={{ boxShadow: "0 0 8px rgba(239,68,68,0.15)" }}>DEF Shred {defShred}%</span>}
                                        {resShred > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400" style={{ boxShadow: "0 0 8px rgba(239,68,68,0.15)" }}>RES Shred {resShred}%</span>}
                                        {defIgnore > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400" style={{ boxShadow: "0 0 8px rgba(239,68,68,0.15)" }}>DEF Ignore {defIgnore}%</span>}
                                      </div>
                                    </div>
                                  )}
                                    </div>{/* end LEFT */}
                                    {/* RIGHT: base stats + equipment grid */}
                                    <div className="flex-shrink-0">
                                  {/* Base Stats */}
                                  <div className="mb-1.5">
                                    <div className="kuro-label">Base Stats (Lv.90)</div>
                                    <div className="flex flex-wrap gap-1">
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-[var(--border-medium)] text-gray-300" style={{ boxShadow: "0 0 6px rgba(255,255,255,0.05)" }}>HP {(m.d.baseHp || 0).toLocaleString()}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-[var(--border-medium)] text-gray-300" style={{ boxShadow: "0 0 6px rgba(255,255,255,0.05)" }}>ATK {m.charAtk}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-[var(--border-medium)] text-gray-300" style={{ boxShadow: "0 0 6px rgba(255,255,255,0.05)" }}>DEF {(m.d.baseDef || 0).toLocaleString()}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400" style={{ boxShadow: "0 0 6px rgba(245,158,11,0.15)" }}>+Weapon {m.weapAtk}</span>
                                    </div>
                                  </div>
                                  {/* Equipment slots: 1 weapon + 5 echoes */}
                                  {(() => {
                                    const eqKey = state.activeTeamIndex + ':' + m.name;
                                    const eq = teamEquipment[eqKey] || { weapon: null, echoes: [null, null, null, null, null] };
                                    const equippedWeap = eq.weapon ? WEAPON_DATA[eq.weapon] : null;
                                    const slotStyle = 'w-10 h-10 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all text-center';
                                    return (
                                      <div className="space-y-1.5">
                                        {/* 3x2 equipment grid */}
                                        <div className="grid grid-cols-3 gap-1">
                                          {/* Weapon slot */}
                                          <div
                                            className={`${slotStyle} ${equippedWeap ? (equippedWeap.rarity === 5 ? 'border-yellow-500/40 bg-yellow-500/8' : 'border-purple-500/40 bg-purple-500/8') : 'border-dashed border-white/15 hover:border-yellow-500/40'}`}
                                            onClick={() => {
                                              setWeaponSelectorTarget({ teamIdx: state.activeTeamIndex, charName: m.name });
                                              setWeaponSearch('');
                                              setWeaponSelectorOpen(true);
                                              haptic.light();
                                            }}
                                            title={eq.weapon || 'Select weapon'}
                                          >
                                            {equippedWeap && collectionImages[eq.weapon] ? (
                                              <img src={collectionImages[eq.weapon]} alt={eq.weapon} className="w-full h-full object-contain rounded-lg" onError={hideOnError} />
                                            ) : equippedWeap ? (
                                              <>
                                                <Sword size={14} className={equippedWeap.rarity === 5 ? 'text-yellow-400' : 'text-purple-400'} />
                                                <span className="text-[10px] text-gray-300 truncate w-full px-0.5 leading-tight mt-0.5">{eq.weapon.split(' ').slice(0, 2).join(' ')}</span>
                                              </>
                                            ) : (
                                              <>
                                                <Sword size={14} className="text-gray-500" />
                                                <span className="text-[10px] text-gray-500">Weapon</span>
                                              </>
                                            )}
                                          </div>
                                          {/* 5 Echo slots (placeholder) */}
                                          {[0, 1, 2, 3, 4].map(ei => (
                                            <div key={ei}
                                              className={`${slotStyle} border-dashed border-[var(--border-medium)] opacity-60 cursor-default`}
                                              title={'Echo slot ' + (ei + 1) + ' — coming soon'}
                                            >
                                              <Diamond size={12} className="text-gray-600" />
                                              <span className="text-[10px] text-gray-600">{ei === 0 ? '4-cost' : ei < 3 ? '3-cost' : '1-cost'}</span>
                                            </div>
                                          ))}
                                        </div>
                                        {/* S0-S6 toggle */}
                                        {/* P6-FIX: Increased sequence button size for touch targets (F-P6-055) */}
                                        <div>
                                          <div className="text-[10px] text-gray-400 mb-0.5">Sequence</div>
                                          <div className="flex gap-0.5" role="radiogroup" aria-label={`${m.name} resonance sequence level`}>
                                            {[0,1,2,3,4,5,6].map(s => {
                                              const isActive = (eq.sequence || 0) === s;
                                              return (
                                                <button key={s}
                                                  role="radio"
                                                  aria-checked={isActive}
                                                  className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${isActive ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 border' : 'border border-[var(--border-medium)] text-gray-500 hover:text-gray-300 hover:border-white/15'}`}
                                                  onClick={() => {
                                                    setTeamEquipment(prev => {
                                                      const n = { ...prev };
                                                      n[eqKey] = { ...(n[eqKey] || { weapon: null, echoes: [null,null,null,null,null] }), sequence: s };
                                                      try { localStorage.setItem('ww-team-equipment', JSON.stringify(n)); } catch {}
                                                      return n;
                                                    });
                                                    haptic.light();
                                                  }}
                                                >S{s}</button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                        {/* Sonata Set selector */}
                                        <div>
                                          <div className="text-[10px] text-gray-400 mb-0.5">Sonata Set</div>
                                          <KuroSelect
                                            value={eq.echoSet || ''}
                                            onChange={v => {
                                              setTeamEquipment(prev => {
                                                const n = { ...prev };
                                                n[eqKey] = { ...(n[eqKey] || { weapon: null, echoes: [null,null,null,null,null] }), echoSet: v || '' };
                                                try { localStorage.setItem('ww-team-equipment', JSON.stringify(n)); } catch {}
                                                return n;
                                              });
                                              haptic.light();
                                            }}
                                            options={[
                                              { value: '', label: 'Auto (from recommended)' },
                                              ...Object.keys(ECHO_SETS).map(setName => ({ value: setName, label: setName })),
                                            ]}
                                            className="w-full"
                                            ariaLabel={`${m.name} sonata echo set`}
                                            small
                                          />
                                        </div>
                                        {/* Weapon info */}
                                        {equippedWeap && (
                                          <div className="text-[10px]">
                                            <span className="text-gray-500">Weapon: </span>
                                            <span className="text-yellow-400/80">{eq.weapon}</span>
                                            <span className="text-gray-500"> ({equippedWeap.stat} {equippedWeap.subStatValue})</span>
                                          </div>
                                        )}
                                        {!equippedWeap && m.d.bestWeapon && (
                                          <div className="text-[10px]">
                                            <span className="text-gray-500">Rec: </span>
                                            <span className="text-yellow-400/50">{m.d.bestWeapon}</span>
                                            {m.d.bestEchoes && (
                                              <span className="text-gray-500"> · </span>
                                            )}
                                            {m.d.bestEchoes && (
                                              <span className="text-cyan-400/50">{m.d.bestEchoes.join(' + ')}</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                    </div>{/* end RIGHT */}
                                  </div>{/* end flex row */}
                                </div>
                              );
                            })}

                            {/* Aggregated buffs/debuffs */}
                            {allBuffs.length > 0 && (
                              <div>
                                <div className="kuro-label">Team Buffs</div>
                                <div className="flex flex-wrap gap-1">
                                  {allBuffs.map((b, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                                      {b.buff} <span className="text-gray-500">({b.source})</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {allDebuffs.length > 0 && (
                              <div>
                                <div className="kuro-label">Enemy Debuffs</div>
                                <div className="flex flex-wrap gap-1">
                                  {allDebuffs.map((b, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400">
                                      {b.debuff} <span className="text-gray-500">({b.source})</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Damage Score: Raw + Full DPS — single row */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="kuro-stat kuro-stat-gold p-2 text-center">
                                <div className="text-gray-400 text-[10px]">Raw Power</div>
                                <div className="text-lg font-bold text-yellow-400 kuro-number" style={{ textShadow: '0 0 10px rgba(234,179,8,0.5)' }}>{score.toLocaleString()}</div>
                                <div className="text-gray-500 text-[8px]">stat multipliers</div>
                              </div>
                              <div className="kuro-stat kuro-stat-cyan p-2 text-center">
                                <div className="text-gray-400 text-[10px]">Full DPS</div>
                                <div className="text-lg font-bold text-cyan-400 kuro-number" style={{ textShadow: '0 0 10px rgba(6,182,212,0.5)' }}>{realDps.toLocaleString()}</div>
                                <div className="text-gray-500 text-[8px]">dmg/sec</div>
                              </div>
                              <div className={`kuro-stat ${synergy >= 75 ? 'kuro-stat-emerald' : synergy >= 50 ? 'kuro-stat-gold' : 'kuro-stat-red'} p-2 text-center`}>
                                <div className="text-gray-400 text-[10px]">Synergy</div>
                                <div className={`text-lg font-bold kuro-number ${synergy >= 75 ? 'text-emerald-400' : synergy >= 50 ? 'text-amber-400' : 'text-red-400'}`} style={{ textShadow: `0 0 10px ${synergy >= 75 ? 'rgba(34,197,94,0.5)' : synergy >= 50 ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)'}` }}>{synergy}</div>
                              </div>
                            </div>

                            {/* Warnings */}
                            {warnings.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {warnings.map((w, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center gap-1">
                                    <AlertTriangle size={12} /> {w}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* Accuracy note */}
                            <p className="text-[10px] text-gray-500 text-center mt-1">Includes: buff uptimes, DOT, Fusion Burst, Tune Break + Rupture/Strain, DEF/RES shred. Excludes: echo substats.</p>
                          </div>
                        </CardBody>
                      </Card>

                      {/* DPS Comparison — computed from stored slots */}
                      {teamCompareEntries.length > 0 && (() => {
                        const computed = teamCompareEntries.map(entry => ({
                          ...entry,
                          stats: calcTeamStats(entry.slots, entry.teamIdx ?? 0),
                        })).filter(e => e.stats);
                        if (!computed.length) return null;
                        const maxS = Math.max(...computed.map(e => e.stats.score), 1);
                        const maxDps = Math.max(...computed.map(e => e.stats.realDps), 1);
                        return (
                        <Card>
                          <CardHeader action={
                            <button onClick={() => { setTeamCompareEntries([]); haptic.light(); }}
                              className="kuro-btn text-[10px]"
                              aria-label="Clear all team comparisons">
                              Clear All
                            </button>
                          }><BarChart3 size={14} className="text-purple-400" /> DPS Comparison</CardHeader>
                          <CardBody>
                            <div className="space-y-3">
                              {computed.map((entry) => {
                                const s = entry.stats;
                                const rawPct = maxS > 0 ? (s.score / maxS) * 100 : 0;
                                const fullPct = maxDps > 0 ? (s.realDps / maxDps) * 100 : 0;
                                return (
                                  <div key={entry.id} className="p-2.5 rounded-lg border border-[var(--border-medium)] relative" style={{ background: 'var(--bg-stat)' }}>
                                    <button onClick={() => { setTeamCompareEntries(prev => prev.filter(e => e.id !== entry.id)); haptic.light(); }}
                                      className="absolute top-1.5 right-1.5 z-20 w-[28px] h-[28px] rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                                      aria-label="Remove this team from comparison">
                                      <X size={12} />
                                    </button>

                                    {/* Character cards */}
                                    <div className="flex gap-1.5 mb-2">
                                      {s.members.map((m, mi) => {
                                        const rarity5 = m.d.rarity === 5;
                                        const rc2 = roleColors[m.d.role] || roleColors.Support;
                                        return (
                                          <div key={mi} className={`flex-1 min-w-0 p-1.5 rounded-lg border text-center ${rarity5 ? 'border-yellow-500/50' : 'border-purple-500/50'}`}
                                            style={{
                                              background: rarity5 ? 'linear-gradient(to top, rgba(237,175,24,0.15), rgba(237,175,24,0.05))' : 'linear-gradient(to top, rgba(168,85,247,0.15), rgba(168,85,247,0.05))',
                                              boxShadow: rarity5 ? '0 0 12px rgba(237,175,24,0.15), inset 0 0 10px rgba(237,175,24,0.05)' : '0 0 12px rgba(168,85,247,0.15), inset 0 0 10px rgba(168,85,247,0.05)'
                                            }}>
                                            <div className="text-[10px] font-semibold truncate" style={{ color: getElementColor(m.d.element), textShadow: `0 0 8px ${getElementColor(m.d.element)}60` }}>{m.name}</div>
                                            <div className={`text-[8px] ${rarity5 ? 'text-yellow-400' : 'text-purple-400'}`}>{rarity5 ? '★★★★★' : '★★★★'}</div>
                                            <span className={`text-[8px] px-1 py-0.5 rounded ${rc2.bg} ${rc2.text} inline-block mt-0.5`}>{m.d.role}</span>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Raw score — neon glow style matching histogram */}
                                    <div className="mb-2">
                                      <div className="flex items-baseline justify-between mb-1">
                                        <span className="text-gray-400 text-[10px]">Raw Score</span>
                                        <span className="text-emerald-400 font-bold text-sm kuro-number" style={{ textShadow: '0 0 8px rgba(34,197,94,0.6)' }}>{s.score.toLocaleString()}</span>
                                      </div>
                                      <div className="relative h-6 rounded" style={{ background: 'transparent' }}>
                                        <div className="absolute top-0 left-0 bottom-0 rounded transition-all duration-700"
                                          style={{
                                            width: Math.max(rawPct * 0.85, 6) + '%',
                                            background: 'linear-gradient(90deg, #22c55e40, #22c55e20)',
                                            border: '1px solid #22c55e90',
                                            borderLeft: 'none',
                                            boxShadow: '0 0 12px #22c55e50, inset 0 0 15px #22c55e30'
                                          }} />
                                        <div className="absolute top-0 bottom-0 w-[2px] rounded-full"
                                          style={{
                                            left: 0,
                                            background: '#22c55e',
                                            boxShadow: '0 0 8px #22c55e, 0 0 16px #22c55e80'
                                          }} />
                                      </div>
                                    </div>

                                    {/* Full DPS — neon glow style matching histogram */}
                                    <div className="mb-1.5">
                                      <div className="flex items-baseline justify-between mb-1">
                                        <span className="text-gray-400 text-[10px]">Full DPS</span>
                                        <span className="text-cyan-400 font-bold text-sm kuro-number" style={{ textShadow: '0 0 8px rgba(6,182,212,0.6)' }}>{s.realDps.toLocaleString()} /s</span>
                                      </div>
                                      <div className="relative h-6 rounded" style={{ background: 'transparent' }}>
                                        <div className="absolute top-0 left-0 bottom-0 rounded transition-all duration-700"
                                          style={{
                                            width: Math.max(fullPct * 0.85, 6) + '%',
                                            background: 'linear-gradient(90deg, #06b6d440, #06b6d420)',
                                            border: '1px solid #06b6d490',
                                            borderLeft: 'none',
                                            boxShadow: '0 0 12px #06b6d450, inset 0 0 15px #06b6d430'
                                          }} />
                                        <div className="absolute top-0 bottom-0 w-[2px] rounded-full"
                                          style={{
                                            left: 0,
                                            background: '#06b6d4',
                                            boxShadow: '0 0 8px #06b6d4, 0 0 16px #06b6d480'
                                          }} />
                                      </div>
                                    </div>

                                    {/* Quick stats */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-[var(--border-medium)]">
                                      <div className="text-[10px]"><span className="text-gray-500">DPS: </span><span className="text-white font-medium">{s.mainDps.name}</span></div>
                                      <div className="text-[10px]"><span className="text-gray-500">ATK: </span><span className="text-yellow-400 kuro-number">{s.effAtk}</span></div>
                                      <div className="text-[10px]"><span className="text-gray-500">CR: </span><span className="text-cyan-400 kuro-number">{s.critRate.toFixed(0)}%</span></div>
                                      <div className="text-[10px]"><span className="text-gray-500">CD: </span><span className="text-cyan-400 kuro-number">{s.critDmg.toFixed(0)}%</span></div>
                                      <div className="text-[10px]"><span className="text-gray-500">Rot: </span><span className="text-gray-300 kuro-number">{s.mainDps.d.rotTime || 25}s</span></div>
                                      {s.defShred > 0 && <div className="text-[10px]"><span className="text-gray-500">DEF↓ </span><span className="text-red-400 kuro-number">{s.defShred}%</span></div>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {teamCompareEntries.length < 5 && (
                              <p className="text-gray-500 text-[10px] text-center mt-2">Tap <span className="text-yellow-400">+ Compare</span> to add more ({5 - teamCompareEntries.length} left)</p>
                            )}
                          </CardBody>
                        </Card>
                        );
                      })()}
                      </>
                    );
                  })()}

                  {/* Suggested Teams from Character Data */}
                  <Card>
                    <CardHeader><Target size={14} className="text-cyan-400" /> Team Suggestions</CardHeader>
                    <CardBody>
                      <div className="space-y-2 team-suggestions-grid">
                        {(() => {
                          const ownedNames = new Set([
                            ...Object.keys(collectionData.chars5Counts),
                            ...Object.keys(collectionData.chars4Counts),
                          ]);
                          const suggestions = [];
                          const seen = new Set();
                          const orderedChars = [...RELEASE_ORDER].reverse();
                          for (const name of orderedChars) {
                            const d = CHARACTER_DATA[name];
                            if (!d?.teams) continue;
                            for (const t of d.teams) {
                              if (seen.has(t)) continue;
                              seen.add(t);
                              const members = t.split('+').map(m => m.trim());
                              if (members.length < 2) continue;
                              const ownedCount = members.filter(m => ownedNames.has(m)).length;
                              suggestions.push({ text: t, members, ownedCount, allOwned: ownedCount === members.length });
                            }
                          }
                          suggestions.sort((a, b) => {
                            if (a.allOwned !== b.allOwned) return b.allOwned ? 1 : -1;
                            return b.ownedCount - a.ownedCount;
                          });
                          if (suggestions.length === 0) {
                            return <p className="text-gray-500 text-[10px] text-center py-2">No team suggestions available</p>;
                          }
                          return suggestions.slice(0, 10).map((s, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                s.members.slice(0, 3).forEach((m, idx) => {
                                  dispatch({ type: 'SET_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: idx, character: m });
                                });
                                haptic.success();
                              }}
                              className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-[var(--border-medium)] hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all text-left"
                              style={{ background: 'var(--bg-stat)' }}
                            >
                              <div className="flex gap-1 flex-shrink-0">
                                {s.members.slice(0, 3).map((m, j) => {
                                  const cd = CHARACTER_DATA[m];
                                  const sf = getImageFraming(`collection-${m}`);
                                  return (
                                    <div key={j} className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative breath-zoom${cd?.rarity === 5 ? ' holo-5star' : ''}`}
                                      style={{ background: cd ? getElementBg(cd.element) : 'rgba(255,255,255,0.1)', contain: 'paint', border: cd ? `1px solid ${getElementColor(cd.element)}50` : '1px solid rgba(255,255,255,0.15)', boxShadow: cd ? `0 0 8px ${getElementColor(cd.element)}30` : 'none' }}>
                                      {collectionImages[m] ? (
                                        <img src={collectionImages[m]} alt={m} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ transform: `scale(${sf.zoom / 100}) translate(${-sf.x}%, ${-sf.y}%)` }} onError={hideOnError} />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-medium">{m[0]}</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <span className="text-[10px] text-gray-300 truncate flex-1">{s.text}</span>
                              {s.allOwned ? (
                                <span className="text-[8px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1 py-0.5 rounded flex-shrink-0">All owned</span>
                              ) : (
                                <span className="text-[8px] text-gray-500 flex-shrink-0">{s.ownedCount}/{s.members.length}</span>
                              )}
                            </button>
                          ));
                        })()}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Character Selector Modal — FIX: pass isOpen prop */}
                  <FocusTrapModal isOpen={teamSelectorOpen} onClose={() => setTeamSelectorOpen(false)} className="" onClick={() => setTeamSelectorOpen(false)} centered>
                      <div
                        className="kuro-card w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-3 border-b border-[var(--border-medium)]" data-sheet-header>
                          <div>
                            <h3 className="text-white text-sm font-semibold">Select Resonator</h3>
                            <p className="text-gray-500 text-[10px]">Slot {teamSelectorSlot + 1} • {activeTeam.name}</p>
                          </div>
                          <button onClick={() => setTeamSelectorOpen(false)} className="min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Close resonator selector">
                            <X size={18} />
                          </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="p-3 space-y-2 border-b border-[var(--border-subtle)]">
                          <div className="relative">
                            {/* P6-FIX: Use .kuro-input for consistency (F-P6-051) */}
                            <input
                              type="text"
                              value={teamSearch}
                              onChange={(e) => setTeamSearch(e.target.value)}
                              placeholder="Search resonators..."
                              className="kuro-input w-full pl-8 text-xs"
                              aria-label="Search resonators"
                              autoFocus
                            />
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <KuroSelect
                              value={teamElementFilter}
                              onChange={setTeamElementFilter}
                              options={[
                                { value: 'all', label: 'All Elements' },
                                { value: 'Aero', label: 'Aero' },
                                { value: 'Glacio', label: 'Glacio' },
                                { value: 'Electro', label: 'Electro' },
                                { value: 'Fusion', label: 'Fusion' },
                                { value: 'Spectro', label: 'Spectro' },
                                { value: 'Havoc', label: 'Havoc' },
                              ]}
                              ariaLabel="Filter by element"
                              small
                            />
                            <KuroSelect
                              value={teamRarityFilter}
                              onChange={setTeamRarityFilter}
                              options={[
                                { value: 'all', label: 'All Rarity' },
                                { value: '5', label: '5★' },
                                { value: '4', label: '4★' },
                              ]}
                              ariaLabel="Filter by rarity"
                              small
                            />
                            <KuroSelect
                              value={teamDmgFilter}
                              onChange={setTeamDmgFilter}
                              options={[
                                { value: 'all', label: 'Dmg Focus' },
                                { value: 'Basic ATK', label: 'Basic ATK' },
                                { value: 'Heavy ATK', label: 'Heavy ATK' },
                                { value: 'Skill', label: 'Skill' },
                                { value: 'Liberation', label: 'Liberation' },
                                { value: 'Echo', label: 'Echo' },
                                { value: 'Coordinated ATK', label: 'Coordinated ATK' },
                              ]}
                              ariaLabel="Filter by damage focus"
                              small
                            />
                            <KuroSelect
                              value={teamBuffFilter}
                              onChange={setTeamBuffFilter}
                              options={[
                                { value: 'all', label: 'All Buffs' },
                                { value: 'Heal', label: 'Heal' },
                                { value: 'Shield', label: 'Shield' },
                                { value: 'Coordinated ATK', label: 'Coordinated ATK' },
                                { value: 'ATK Buff', label: 'ATK Buff' },
                                { value: 'Crit', label: 'Crit' },
                                { value: 'DMG', label: 'DMG Buff' },
                                { value: 'Energy Regen', label: 'Energy Regen' },
                                { value: 'Grouping', label: 'Grouping' },
                              ]}
                              ariaLabel="Filter by buff type"
                              small
                            />
                            <KuroSelect
                              value={teamDebuffFilter}
                              onChange={setTeamDebuffFilter}
                              options={[
                                { value: 'all', label: 'All Debuffs' },
                                { value: 'Frazzle', label: 'Frazzle' },
                                { value: 'Erosion', label: 'Erosion' },
                                { value: 'Off-Tune', label: 'Off-Tune' },
                                { value: 'DEF Shred', label: 'DEF Shred' },
                                { value: 'RES Shred', label: 'RES Shred' },
                              ]}
                              ariaLabel="Filter by debuff type"
                              small
                            />
                          </div>
                          {/* Recommended teammates indicator */}
                          {recommendedNames.size > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] text-orange-400">
                              <Star size={10} className="text-orange-400" fill="currentColor" />
                              <span>Orange glow = recommended teammate</span>
                            </div>
                          )}
                        </div>

                        {/* Character Grid */}
                        <div className="flex-1 overflow-y-auto p-4">
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {filteredChars.map(name => {
                              const cd = CHARACTER_DATA[name];
                              const img = collectionImages[name] || '';
                              const el = cd?.element;
                              const owned = collectionData.chars5Counts[name] || collectionData.chars4Counts[name];
                              const isInAnotherTeam = state.teams.some((t, ti) =>
                                ti !== state.activeTeamIndex && t.slots.includes(name)
                              );
                              const isRecommended = recommendedNames.has(name);
                              return (
                                <button
                                  key={name}
                                  onClick={() => selectCharacter(name)}
                                  className={`relative rounded-lg overflow-hidden transition-all hover:scale-[1.03] active:scale-95 group collection-card ${isRecommended ? 'border-2 border-orange-400' : owned ? (cd?.rarity === 5 ? 'border bg-yellow-500/10 border-yellow-500/30 glow-gold' : 'border bg-purple-500/10 border-purple-500/30 glow-purple') : 'border bg-neutral-800/50 border-neutral-700/50'}`}
                                  style={{
                                    height: '90px',
                                    contain: 'paint',
                                    opacity: owned ? 1 : 0.5,
                                    ...(isRecommended ? { boxShadow: '0 0 28px rgba(251,146,60,0.65), 0 0 56px rgba(251,146,60,0.3), inset 0 0 20px rgba(251,146,60,0.2)', background: 'rgba(251,146,60,0.15)' } : {}),
                                  }}
                                >
                                  {img && (() => {
                                    const f = getImageFraming(`collection-${name}`);
                                    return (
                                    <div className="absolute inset-0 collection-img-wrap">
                                    <img
                                      src={img}
                                      alt={name}
                                      className="w-full h-full object-contain pointer-events-none"
                                      style={{
                                        transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)`,
                                        filter: owned ? 'none' : 'grayscale(100%)',
                                      }}
                                      loading="lazy"
                                      onError={hideOnError}
                                    />
                                    </div>
                                    );
                                  })()}
                                  <div className="absolute inset-x-0 bottom-0 h-1/2" style={{
                                    background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)',
                                  }} />
                                  {/* Element dot */}
                                  <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white flex items-center justify-center"
                                    style={{ background: getElementColor(el) }}>
                                    {el?.[0]}
                                  </div>
                                  {/* Rarity */}
                                  <div className="absolute top-1 right-1">
                                    <Star size={8} className={cd?.rarity === 5 ? 'text-yellow-400' : 'text-purple-400'} fill="currentColor" />
                                  </div>
                                  {/* In another team */}
                                  {isInAnotherTeam && (
                                    <div className="absolute top-1 left-1 mt-4">
                                      <Users size={7} className="text-cyan-400" />
                                    </div>
                                  )}
                                  {/* Recommended badge */}
                                  {isRecommended && (
                                    <div className="absolute top-0.5 right-0.5 z-10">
                                      <span className="text-[8px] px-1 py-0.5 rounded font-bold bg-orange-500 text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>★ REC</span>
                                    </div>
                                  )}
                                  {/* Role tag */}
                                  {cd?.role && (
                                    <div className="absolute bottom-4 inset-x-0 flex justify-center">
                                      <span className="text-[8px] px-1 py-0.5 rounded bg-black/60 text-gray-300 border border-[var(--border-medium)]">{cd.role}</span>
                                    </div>
                                  )}
                                  {/* Name */}
                                  <div className="absolute bottom-0 inset-x-0 p-1 z-10">
                                    <div className="text-white text-[8px] font-medium truncate text-center leading-tight">{name}</div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {filteredChars.length === 0 && (
                            <div className="text-center py-8">
                              <Search size={24} className="mx-auto mb-2 text-gray-600" />
                              <p className="text-gray-500 text-xs">No resonators match</p>
                            </div>
                          )}
                        </div>
                      </div>
                  </FocusTrapModal>

                  {/* Weapon Selector Modal */}
                  <FocusTrapModal isOpen={weaponSelectorOpen} onClose={() => setWeaponSelectorOpen(false)} className="" onClick={() => setWeaponSelectorOpen(false)} centered>
                      <div className="kuro-card w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 border-b border-[var(--border-medium)] flex items-center justify-between flex-shrink-0" data-sheet-header>
                          <div>
                            <h3 className="text-white font-semibold text-sm">Select Weapon</h3>
                            <p className="text-gray-400 text-[10px]">{weaponSelectorTarget.charName} — {CHARACTER_DATA[weaponSelectorTarget.charName]?.weapon || 'Any'}</p>
                          </div>
                          <button onClick={() => setWeaponSelectorOpen(false)} className="min-w-[36px] min-h-[36px] rounded-full bg-white/10 flex items-center justify-center" aria-label="Close weapon selector"><X size={16} className="text-gray-400" /></button>
                        </div>
                        <div className="p-2 border-b border-[var(--border-subtle)] flex-shrink-0">
                          <input
                            value={weaponSearch}
                            onChange={e => setWeaponSearch(e.target.value)}
                            placeholder="Search weapons..."
                            className="kuro-input w-full text-xs"
                          />
                        </div>
                        <div className="overflow-y-auto flex-1 p-2">
                          <div className="space-y-1">
                            {/* Unequip option */}
                            <button
                              onClick={() => {
                                const eqKey = weaponSelectorTarget.teamIdx + ':' + weaponSelectorTarget.charName;
                                setTeamEquipment(prev => {
                                  const n = { ...prev };
                                  if (n[eqKey]) n[eqKey] = { ...n[eqKey], weapon: null };
                                  else n[eqKey] = { weapon: null, echoes: [null, null, null, null, null] };
                                  try { localStorage.setItem('ww-team-equipment', JSON.stringify(n)); } catch {}
                                  return n;
                                });
                                setWeaponSelectorOpen(false);
                                haptic.light();
                              }}
                              className="w-full p-2 rounded-lg border border-dashed border-white/15 text-[10px] text-gray-400 hover:border-red-500/30 hover:text-red-400 transition-all text-left"
                              style={{ background: 'var(--bg-btn)' }}
                            >
                              ✕ Unequip weapon
                            </button>
                            {/* Filtered weapons */}
                            {(() => {
                              const charWeapType = CHARACTER_DATA[weaponSelectorTarget.charName]?.weapon;
                              return Object.entries(WEAPON_DATA)
                                .filter(([name, w]) => {
                                  if (charWeapType && w.type !== charWeapType) return false;
                                  if (weaponSearch && !name.toLowerCase().includes(weaponSearch.toLowerCase())) return false;
                                  return true;
                                })
                                .sort((a, b) => b[1].rarity - a[1].rarity || b[1].baseAtk - a[1].baseAtk)
                                .map(([name, w]) => {
                                  const rarity5 = w.rarity === 5;
                                  const isBest = name === CHARACTER_DATA[weaponSelectorTarget.charName]?.bestWeapon;
                                  return (
                                    <button
                                      key={name}
                                      onClick={() => {
                                        const eqKey = weaponSelectorTarget.teamIdx + ':' + weaponSelectorTarget.charName;
                                        setTeamEquipment(prev => {
                                          const n = { ...prev };
                                          if (n[eqKey]) n[eqKey] = { ...n[eqKey], weapon: name };
                                          else n[eqKey] = { weapon: name, echoes: [null, null, null, null, null] };
                                          try { localStorage.setItem('ww-team-equipment', JSON.stringify(n)); } catch {}
                                          return n;
                                        });
                                        setWeaponSelectorOpen(false);
                                        haptic.success();
                                      }}
                                      className={`w-full p-2 rounded-lg border text-left transition-all hover:scale-[1.01] ${rarity5 ? 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10' : 'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10'}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {collectionImages[name] ? (
                                          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border" style={{ borderColor: rarity5 ? 'rgba(234,179,8,0.3)' : 'rgba(168,85,247,0.3)', background: rarity5 ? 'rgba(234,179,8,0.08)' : 'rgba(168,85,247,0.08)' }}>
                                            <img src={collectionImages[name]} alt={name} className="w-full h-full object-contain" onError={hideOnError} />
                                          </div>
                                        ) : (
                                          <Sword size={14} className={rarity5 ? 'text-yellow-400' : 'text-purple-400'} />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-white text-xs font-semibold truncate">{name}</span>
                                            <span className={`text-[8px] ${rarity5 ? 'text-yellow-400' : 'text-purple-400'}`}>{rarity5 ? '★★★★★' : '★★★★'}</span>
                                            {isBest && <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">BiS</span>}
                                          </div>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-gray-400">ATK {w.baseAtk}</span>
                                            <span className="text-[10px] text-cyan-400/80">{w.stat} {w.subStatValue}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                });
                            })()}
                          </div>
                        </div>
                      </div>
                  </FocusTrapModal>
                </div>
              );
            })()}
          </div>
          </TabErrorBoundary>
          </div>
        )}

        {/* [SECTION:TAB-PROFILE] */}
        {activeTab === 'profile' && (
          <div role="tabpanel" id="tabpanel-profile" aria-labelledby="tab-profile" tabIndex="0">
          <TabErrorBoundary tabName="Profile">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="profile" />

            {/* E2-FP3: Resonator Profile moved above Server Region (identity first) */}
            <Card>
              <CardHeader><User size={14} className="text-cyan-400" /> Resonator Profile</CardHeader>
              <CardBody className="space-y-3">
                {/* Username */}
                <div>
                  <label htmlFor="profile-display-name" className="text-gray-400 text-[10px] block mb-2">Display Name</label>
                  <input
                    id="profile-display-name"
                    type="text"
                    value={state.profile.username}
                    onChange={e => dispatch({ type: 'SET_USERNAME', value: e.target.value.slice(0, MAX_USERNAME_LENGTH) })}
                    placeholder="Enter your name..."
                    maxLength={MAX_USERNAME_LENGTH}
                    className="kuro-input w-full"
                  />
                  {/* AUDIT-FIX H12: gray-600→gray-500 for WCAG AA contrast */}
                  <p className="text-gray-400 text-[10px] mt-0.5 text-right">{state.profile.username.length}/{MAX_USERNAME_LENGTH}</p>
                </div>

                {/* Profile Picture — current selection */}
                <div>
                  <label className="text-gray-400 text-[10px] block mb-2">Profile Picture</label>
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-lg flex-shrink-0 breath-zoom${CHARACTER_DATA[state.profile.profilePic]?.rarity === 5 ? ' holo-5star' : ''}`} style={{ background: 'var(--bg-stat)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)', contain: 'paint', position: 'relative' }}>
                      {state.profile.profilePic && collectionImages[state.profile.profilePic] ? (() => {
                        const f = getImageFraming(`collection-${state.profile.profilePic}`);
                        return <img src={collectionImages[state.profile.profilePic]} alt={state.profile.profilePic} className="w-full h-full object-contain" style={{ transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)` }} loading="lazy" onError={hideOnError} />;
                      })() : (
                        <img src={HEADER_ICON} alt="Default" className="w-full h-full object-contain bg-neutral-800 p-1" loading="lazy" onError={hideOnError} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-xs truncate">{state.profile.profilePic || 'Default icon'}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">Tap the <Crown size={12} className="inline text-yellow-400" /> icon on any owned card in the Collection tab</p>
                      {state.profile.profilePic && (
                        <button
                          onClick={() => dispatch({ type: 'SET_PROFILE_PIC', value: '' })}
                          className="text-red-400/70 text-[10px] hover:text-red-400 mt-0.5"
                        >Reset to default</button>
                      )}
                    </div>
                  </div>
                </div>

                {/* View ID Card Button */}
                <button
                  onClick={() => setShowIdCard(true)}
                  className="kuro-btn kuro-btn-hero w-full text-xs flex items-center justify-center gap-2"
                >
                  <Award size={14} /> View Resonator ID Card
                </button>
              </CardBody>
            </Card>

            {/* Server Region */}
            <Card>
              <CardHeader>Server Region</CardHeader>
              <CardBody>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                  {Object.keys(SERVERS).map(s => (
                    <button key={s} onClick={() => dispatch({ type: 'SET_SERVER', server: s })} aria-pressed={state.server === s} className={`kuro-btn py-2 text-[10px] font-medium ${state.server === s ? 'active-gold' : ''}`}>{s}</button>
                  ))}
                </div>
                <p className="text-gray-400 text-[10px] mt-2 text-center mx-auto" style={{maxWidth: 'none'}}>Reset: 4:00 AM (UTC{getServerOffset(state.server) >= 0 ? '+' : ''}{getServerOffset(state.server)})</p>
              </CardBody>
            </Card>

            {/* Settings + Import — side by side on desktop */}
            <div className="desktop-grid-2 space-y-3 lg:space-y-0">
            {/* Display Settings */}
            <Card>
              <CardHeader><Settings size={14} className="text-gray-400" /> Display Settings</CardHeader>
              <CardBody className="space-y-3">
                {/* OLED Mode Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center ${visualSettings.oledMode ? 'bg-white text-black' : 'text-gray-400'}`} style={!visualSettings.oledMode ? { background: 'var(--bg-btn)' } : undefined}>
                      <Monitor size={16} />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">OLED Mode</div>
                      <div className="text-gray-400 text-[10px]">True black (#000) for OLED screens</div>
                    </div>
                  </div>
                  {/* AUDIT-FIX M22: OLED-aware toggle track */}
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, oledMode: !visualSettings.oledMode })}
                    className="relative w-[52px] h-[24px] rounded-full transition-colors"
                    style={{ background: visualSettings.oledMode ? '#fff' : 'var(--bg-btn)' }}
                    role="switch"
                    aria-checked={visualSettings.oledMode}
                    aria-label="Toggle OLED mode"
                  >
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all ${visualSettings.oledMode ? 'left-[32px] bg-black' : 'left-[4px] bg-gray-400'}`} />
                  </button>
                </div>
                {visualSettings.oledMode && (
                  <p className="text-emerald-400 text-[10px] text-center">✓ OLED mode active - saves battery on OLED displays</p>
                )}
                
                {/* Swipe Navigation Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center ${visualSettings.swipeNavigation ? 'bg-cyan-500 text-white' : 'text-gray-400'}`} style={!visualSettings.swipeNavigation ? { background: 'var(--bg-btn)' } : undefined}>
                      <ChevronDown size={16} className="-rotate-90" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">Swipe Navigation</div>
                      <div className="text-gray-400 text-[10px]">Swipe left/right to switch tabs</div>
                    </div>
                  </div>
                  {/* AUDIT-FIX M22: OLED-aware toggle track */}
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, swipeNavigation: !visualSettings.swipeNavigation })}
                    className={`relative w-[52px] h-[24px] rounded-full transition-colors ${visualSettings.swipeNavigation ? 'bg-cyan-500' : ''}`}
                    style={!visualSettings.swipeNavigation ? { background: 'var(--bg-btn)' } : undefined}
                    role="switch"
                    aria-checked={visualSettings.swipeNavigation}
                    aria-label="Toggle swipe navigation"
                  >
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all ${visualSettings.swipeNavigation ? 'left-[32px] bg-white' : 'left-[4px] bg-gray-400'}`} />
                  </button>
                </div>
                {visualSettings.swipeNavigation && (
                  <p className="text-cyan-400 text-[10px] text-center">✓ Swipe left/right on content area to navigate</p>
                )}

                {/* Animations Toggle — 3-state: off < on < full */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center ${visualSettings.animationsEnabled !== 'off' ? (visualSettings.animationsEnabled === 'full' ? 'bg-fuchsia-500 text-white' : 'bg-purple-500 text-white') : 'text-gray-400'}`} style={visualSettings.animationsEnabled === 'off' ? { background: 'var(--bg-btn)' } : undefined}>
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">Animations</div>
                      <div className="text-gray-400 text-[10px]">Background effects, transitions & glow</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = visualSettings.animationsEnabled === 'off' ? 'on' : visualSettings.animationsEnabled === 'on' ? 'full' : 'off';
                      saveVisualSettings({ ...visualSettings, animationsEnabled: next });
                    }}
                    className="relative w-[52px] h-[24px] rounded-full transition-colors flex-shrink-0"
                    style={{ background: visualSettings.animationsEnabled === 'off' ? 'var(--bg-btn)' : visualSettings.animationsEnabled === 'on' ? '#a855f7' : '#d946ef' }}
                    role="switch"
                    aria-checked={visualSettings.animationsEnabled !== 'off'}
                    aria-label="Toggle animations: off, on, full"
                  >
                    <div className={`absolute top-[4px] w-[16px] h-[16px] rounded-full transition-all bg-white ${visualSettings.animationsEnabled === 'off' ? 'left-[4px] !bg-gray-400' : visualSettings.animationsEnabled === 'on' ? 'left-[18px]' : 'left-[32px]'}`} />
                  </button>
                </div>
                {visualSettings.animationsEnabled === 'off' && (
                  <p className="text-gray-400 text-[10px] text-center mx-auto" style={{maxWidth: 'none'}}>OFF — All animations disabled, saves battery</p>
                )}
                {visualSettings.animationsEnabled === 'on' && (
                  <p className="text-purple-400 text-[10px] text-center mx-auto" style={{maxWidth: 'none'}}>ON — Background effects, transitions & glow</p>
                )}
                {visualSettings.animationsEnabled === 'full' && (
                  <p className="text-fuchsia-400 text-[10px] text-center mx-auto" style={{maxWidth: 'none'}}>FULL — 2× animation intensity, breathing on all characters</p>
                )}

                {/* Install App on Device */}
                {pwa?.canInstall && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-medium)] bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-[28px] h-[28px] rounded-lg flex items-center justify-center bg-[rgba(237,175,24,0.2)] text-yellow-400">
                        <Download size={16} />
                      </div>
                      <div>
                        <div className="text-white text-xs font-medium">Install App</div>
                        <div className="text-gray-400 text-[10px]">Add to home screen for offline use</div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        const accepted = await pwa.promptInstall();
                        if (accepted) toast?.addToast?.('App installed successfully!', 'success');
                      }}
                      className="px-3 py-1.5 bg-[rgba(237,175,24,0.9)] text-black rounded-lg text-xs font-medium hover:bg-[rgba(237,175,24,1)] transition-colors"
                    >
                      Install
                    </button>
                  </div>
                )}
                {pwa?.isInstalled && (
                  <p className="text-emerald-400 text-[10px] text-center">✓ App is installed on your device</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>Import Convene History</CardHeader>
              <CardBody className="space-y-3">
                <p className="text-gray-300 text-[10px]">Import your Convene history from wuwatracker or compatible trackers.</p>
                <div className="grid grid-cols-3 gap-2">
                  {[['pc', 'PC', Monitor], ['android', 'Android', Smartphone], ['ps5', 'PS5', Gamepad2]].map(([k, l, Icon]) => (
                    <button key={k} onClick={() => setImportPlatform(k)} aria-pressed={importPlatform === k} className={`kuro-btn p-2 text-center ${importPlatform === k ? 'active-gold' : ''}`}>
                      <Icon size={16} className="mx-auto mb-0.5" /><div className="text-[10px]">{l}</div>
                    </button>
                  ))}
                </div>
                {/* P4-FIX: Data-driven import guides — eliminates ~90 lines of copy-paste */}
                {importPlatform && <ImportGuide platform={importPlatform} />}
                
                {/* Import Method Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setImportMethod('file')} 
                    className={`kuro-btn py-2 text-xs ${importMethod === 'file' ? 'active-gold' : ''}`}
                  >
                    <Upload size={14} className="inline mr-1.5" />Upload File
                  </button>
                  <button 
                    onClick={() => setImportMethod('paste')} 
                    className={`kuro-btn py-2 text-xs ${importMethod === 'paste' ? 'active-gold' : ''}`}
                  >
                    <ClipboardList size={14} className="inline mr-1.5" />
                    Paste JSON
                  </button>
                </div>
                
                {/* File Upload Method — P8-FIX: Now supports drag-and-drop */}
                {importMethod === 'file' && (
                  <label
                    className="block"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                    onDrop={handleFileDrop}
                  >
                    {importStatus ? (
                      <div className="p-4 border-2 border-dashed border-yellow-500/40 rounded-lg text-center bg-yellow-500/5" aria-label="Importing file">
                        <div className="kuro-skeleton kuro-skeleton-text mx-auto mb-2" style={{ width: '60%', height: '12px' }} />
                        <p className="text-yellow-400 text-[10px] font-medium kuro-number">{importStatus.fileName}</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">{importStatus.fileSize} KB — parsing...</p>
                      </div>
                    ) : (
                    <div className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragOver ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/20 hover:border-yellow-500/50'}`}>
                      <Upload size={20} className={`mx-auto mb-1 ${isDragOver ? 'text-yellow-400' : 'text-gray-300'}`} />
                      <p className={`text-[10px] ${isDragOver ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>
                        {isDragOver ? 'Drop JSON file here' : 'Upload or drag & drop JSON file from wuwatracker'}
                      </p>
                    </div>
                    )}
                    <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                  </label>
                )}
                
                {/* Paste JSON Method */}
                {importMethod === 'paste' && (
                  <div className="space-y-2">
                    <textarea
                      value={pasteJsonText}
                      onChange={(e) => setPasteJsonText(e.target.value)}
                      placeholder='Paste your wuwatracker JSON here...

Example: {"pulls":[...]}'
                      className="kuro-input w-full h-32 text-[10px] font-mono resize-none"
                      spellCheck={false}
                      aria-label="Paste import JSON data"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handlePasteImport}
                        disabled={!pasteJsonText.trim()}
                        className={`kuro-btn flex-1 py-2 text-xs ${pasteJsonText.trim() ? 'active-emerald' : 'opacity-50'}`}
                      >
                        <Check size={14} className="inline mr-1.5" />Import Data
                      </button>
                      {pasteJsonText && (
                        <button 
                          onClick={() => setPasteJsonText('')}
                          className="kuro-btn px-3 py-2 text-xs"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-400 text-[10px]">
                      💡 In wuwatracker: Profile → Settings → Data → Export Pull History → Copy the JSON content
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
            </div>{/* end desktop-grid-2 */}

            {state.profile.importedAt && (
              <Card>
                <CardHeader action={<button onClick={async () => { if (await confirm({ title: 'Clear history', message: 'Clear all imported Convene history?\nThis cannot be undone.', confirmLabel: 'Clear', destructive: true })) { dispatch({ type: 'CLEAR_PROFILE' }); toast?.addToast?.('Profile cleared!', 'info'); } }} className="text-red-400 text-[10px] hover:text-red-300 transition-colors" aria-label="Clear all imported Convene history">Clear</button>}>Import Info</CardHeader>
                <CardBody>
                  {state.profile.uid && <div className="flex justify-between text-xs mb-2"><span className="text-gray-400">UID</span><span className="text-gray-100 font-mono">{state.profile.uid}</span></div>}
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Imported</span><span className="text-gray-300">{new Date(state.profile.importedAt).toLocaleDateString('en-US')}</span></div>
                  <p className="text-gray-400 text-[10px] mt-2">View detailed stats in the Stats tab</p>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardBody className="space-y-2">
                <button onClick={handleExport} className="kuro-btn w-full py-2 flex items-center justify-center gap-1">
                  <Download size={14} /> Export Backup
                </button>
                <button onClick={async () => { if (await confirm({ title: 'Reset all data', message: 'Are you sure you want to reset ALL data?\nThis cannot be undone.', confirmLabel: 'Reset', destructive: true })) { haptic.warning(); dispatch({ type: 'RESET' }); toast?.addToast?.('All data reset!', 'info'); } }} className="kuro-btn w-full py-2 active-red">
                  Reset All Data
                </button>
              </CardBody>
            </Card>

            {/* About & Legal */}
            <Card>
              <CardHeader>About</CardHeader>
              <CardBody className="space-y-3">
                <div className="text-center">
                  <h4 className="text-gray-100 font-bold text-sm">Whispering Wishes</h4>
                  <p className="text-gray-500 text-[10px]">Version {APP_VERSION}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-[10px] mb-1">Questions, issues, or feedback?</p>
                  <a 
                    href="mailto:whisperingwishes.app@gmail.com" 
                    className="text-yellow-400 text-xs hover:text-yellow-300 transition-colors underline"
                  >
                    whisperingwishes.app@gmail.com
                  </a>
                </div>
                
                <div className="kuro-divider" />
                
                <div className="space-y-2 text-[10px] text-gray-400">
                  <p className="font-medium text-gray-400">Disclaimer</p>
                  <p>Whispering Wishes is an unofficial fan-made tool and is not affiliated with, endorsed by, or associated with Kuro Games, Kuro Technology (HK) Co., Limited, or any of their subsidiaries.</p>
                  <p>Wuthering Waves, all game content, characters, names, and related media are trademarks and copyrights of Kuro Games © 2024-{currentYear}. All rights reserved.</p>
                </div>
                
                <div className="space-y-2 text-[10px] text-gray-400">
                  <p className="font-medium text-gray-400">Data & Privacy</p>
                  <p>Most data is stored locally on your device using browser storage. Your Convene history, calculator settings, and app preferences remain private and under your control.</p>
                  <p><strong className="text-gray-400">Leaderboard:</strong> If you choose to submit your score, your generated user ID, average pity, Convene count, 50/50 win/loss stats, and owned 5★ items are sent to a shared database and displayed publicly in the leaderboard rankings. This data is pseudonymous (linked to a randomly generated ID). You can opt out by simply not submitting your score.</p>
                  <p>This app does not require any special device permissions. Data import relies on files you manually provide from third-party tools like wuwatracker.com.</p>
                </div>
                
                <div className="space-y-2 text-[10px] text-gray-400">
                  <p className="font-medium text-gray-400">Third-Party Services</p>
                  <p>This app recommends wuwatracker.com for data export. We are not affiliated with wuwatracker.com and are not responsible for their services, data handling, or availability.</p>
                </div>
                
                <div className="space-y-2 text-[10px] text-gray-400">
                  <p className="font-medium text-gray-400">Data Sources & Attribution</p>
                  <p>Banner schedules, event timings, and countdown data are sourced from:</p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li><a href="https://wuwatracker.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">WuWa Tracker</a> - Event timeline & pity tracking</li>
                    <li><a href="https://wuthering-countdown.gengamer.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">GenGamer Countdown</a> - Banner countdowns</li>
                  </ul>
                  <p className="mt-1">We thank these community resources for providing accurate timing data.</p>
                </div>
                
                <div className="space-y-2 text-[10px] text-gray-400">
                  <p className="font-medium text-gray-400">License</p>
                  <p>This tool is provided "as is" without warranty of any kind. Use at your own discretion. The developers are not responsible for any issues arising from the use of this application.</p>
                </div>
                
                <p className="text-center text-[10px] text-gray-500 pt-2">© {currentYear} <span onClick={handleAdminTap} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAdminTap(); } }} tabIndex={0} role="button" className="cursor-pointer select-none" style={adminTapCount >= 3 ? { color: 'rgba(237,175,24,0.5)', transition: 'color 0.3s' } : undefined}>{`Whispering Wishes Ver.${APP_VERSION}`}</span> by <a href="https://www.reddit.com/u/WW_Andene" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 transition-colors">u/WW_Andene</a> • Made with ♡ for the WuWa community.</p>
              </CardBody>
            </Card>
          </div>
          </TabErrorBoundary>
          </div>
        )}

      </main>

      {/* Bookmark Modal */}
      <FocusTrapModal isOpen={showBookmarkModal} onClose={() => setShowBookmarkModal(false)} className="" onClick={() => setShowBookmarkModal(false)} ariaLabel="Save bookmark" centered>
          <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <CardHeader action={<button onClick={() => setShowBookmarkModal(false)} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close bookmark modal"><X size={16} /></button>}>Save Current State</CardHeader>
            <CardBody className="space-y-3">
              <input type="text" value={bookmarkName} onChange={e => setBookmarkName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { haptic.success(); dispatch({ type: 'SAVE_BOOKMARK', name: bookmarkName || 'Unnamed' }); setBookmarkName(''); setShowBookmarkModal(false); } }} placeholder="Enter name..." maxLength={MAX_BOOKMARK_NAME_LENGTH} className="kuro-input w-full" aria-label="Bookmark name" />
              <div className="text-gray-300 text-[10px]">
                <p>Astrite: {state.calc.astrite || 0} • Char Pity: {state.calc.charPity} • Weap Pity: {state.calc.weapPity}</p>
                <p>Radiant: {state.calc.radiant || 0} • Forging: {state.calc.forging || 0}</p>
              </div>
              <button onClick={() => { haptic.success(); dispatch({ type: 'SAVE_BOOKMARK', name: bookmarkName || 'Unnamed' }); setBookmarkName(''); setShowBookmarkModal(false); }} className="kuro-btn w-full active-purple">Save Bookmark</button>
            </CardBody>
          </Card>
      </FocusTrapModal>

      {/* Server Selector Modal */}
      <FocusTrapModal isOpen={showServerDropdown} onClose={() => setShowServerDropdown(false)} className="" onClick={() => setShowServerDropdown(false)} ariaLabel="Select server region" centered>
          <div className="kuro-card w-full max-w-[200px] rounded-2xl py-2" style={{ overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-xs px-4 py-2 border-b border-[var(--border-medium)]">Server Region</h3>
            {Object.keys(SERVERS).map(s => (
              <button key={s} onClick={() => { dispatch({ type: 'SET_SERVER', server: s }); setShowServerDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${s === state.server ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
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
                <span className="text-white text-sm font-semibold">Backup</span>
              </div>
              <button onClick={() => { setRestoreText(''); setShowExportModal(false); }} className="p-1.5 rounded-lg text-gray-400 hover:text-white active:scale-95 transition-all" aria-label="Close export modal"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              <p className="text-gray-400 text-[10px]">Copy this data and save it as a .json file:</p>
              <textarea
                value={exportData}
                readOnly
                className="kuro-input w-full h-24 text-[10px] font-mono"
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
                      toast?.addToast?.('Copy failed — please select and copy manually', 'error');
                    }
                  }
                }} 
                className="kuro-btn w-full"
              >
                Copy to Clipboard
              </button>
              
              <div className="relative my-1">
                <div className="kuro-divider" />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 px-2 text-[10px] text-gray-400 uppercase tracking-wider">Restore</span>
              </div>
              
              <p className="text-gray-400 text-[10px]">Paste backup data to restore:</p>
              <textarea
                value={restoreText}
                onChange={(e) => setRestoreText(e.target.value)}
                placeholder="Paste backup JSON here..."
                className="kuro-input w-full h-20 text-[10px] font-mono"
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
                      toast?.addToast?.('Invalid backup format — missing required "state" object', 'error');
                      return;
                    }
                    
                    // Schema validation: check critical fields exist and have correct types
                    const s = data.state;
                    if (s.profile && typeof s.profile !== 'object') {
                      toast?.addToast?.('Invalid backup — "profile" must be an object', 'error');
                      return;
                    }
                    if (s.calc && typeof s.calc !== 'object') {
                      toast?.addToast?.('Invalid backup — "calc" must be an object', 'error');
                      return;
                    }
                    if (s.bookmarks && !Array.isArray(s.bookmarks)) {
                      toast?.addToast?.('Invalid backup — "bookmarks" must be an array', 'error');
                      return;
                    }
                    if (s.profile?.featured?.history && !Array.isArray(s.profile.featured.history)) {
                      toast?.addToast?.('Invalid backup — Convene history must be an array', 'error');
                      return;
                    }
                    
                    // Version check warning
                    const backupVersion = data.version || 'unknown';
                    const pullCount = (s.profile?.featured?.history?.length || 0) + (s.profile?.weapon?.history?.length || 0) + (s.profile?.standardChar?.history?.length || 0) + (s.profile?.standardWeap?.history?.length || 0);
                    
                    // Auto-save pre-restore backup to localStorage for recovery
                    try {
                      const preRestoreBackup = JSON.stringify({ timestamp: new Date().toISOString(), version: APP_VERSION, state: stateRef.current, _preRestore: true });
                      localStorage.setItem('whispering-wishes-pre-restore-backup', preRestoreBackup);
                    } catch {} // best-effort — don't block restore if backup fails

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
              {/* P15-FIX: LOW-11 — UI to restore pre-import backup from localStorage */}
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
                      if (!await confirm({ title: 'Restore pre-import backup', message: `Restore backup from ${data.timestamp ? new Date(data.timestamp).toLocaleString() : 'unknown date'}?\nThis will revert to the state before your last import.`, confirmLabel: 'Restore', destructive: true })) return;
                      dispatch({ type: 'LOAD_STATE', state: data.state });
                      toast?.addToast?.('Pre-import backup restored!', 'success');
                      setShowExportModal(false);
                    } catch (e) { toast?.addToast?.('Failed to restore: ' + e.message, 'error'); }
                  }}
                  className="kuro-btn w-full text-[10px] mt-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  Restore Pre-Import Backup
                </button>
              )}
            </div>
          </div>
      </FocusTrapModal>

      {/* Resonator ID Card Modal */}
      <FocusTrapModal isOpen={showIdCard} onClose={() => setShowIdCard(false)} className="" onClick={() => setShowIdCard(false)} ariaLabel="Resonator ID Card" centered>
          <div className="w-full overflow-y-auto rounded-2xl" style={{ maxWidth: '420px', maxHeight: '90vh', aspectRatio: '9/16' }} onClick={(e) => e.stopPropagation()}>
            {/* The Card */}
            <div className="kuro-card" style={{ overflow: 'hidden' }}>
              <div className="kuro-card-inner">
                {/* Header */}
                <div className="kuro-header">
                  <span className="text-gray-100 font-bold text-xs flex items-center gap-2"><Crown size={14} className="text-yellow-400" /> RESONATOR ID</span>
                  <span className="text-gray-500 text-[10px]">Whispering Wishes</span>
                </div>

                {/* Main content */}
                <div className="kuro-body" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                  {/* ═══ PROFILE PANEL ═══ */}
                  <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))', border: '1px solid rgba(255,255,255,0.08)', padding: '12px' }}>
                    <div className="absolute top-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
                    <div className="absolute" style={{ top: 6, right: 6, width: 10, height: 10, borderTop: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 3px 0 0' }} />
                    <div className="absolute" style={{ bottom: 6, left: 6, width: 10, height: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 0 3px' }} />
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)', fontFamily: 'var(--font-display)' }}>{state.profile.username || 'Resonator'}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-[10px] uppercase tracking-wider" style={{ width: '32px', flexShrink: 0 }}>UID</span>
                            <span className="text-gray-200 text-xs font-mono">{state.profile.uid || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-[10px] uppercase tracking-wider" style={{ width: '32px', flexShrink: 0 }}>SVR</span>
                            <span className="text-xs font-mono" style={{ color: '#edaf18', textShadow: '0 0 8px rgba(237,175,24,0.3)' }}>{state.server}</span>
                          </div>
                        </div>
                        {luckRating && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-stat)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="h-full rounded-full" style={{ width: `${Math.min(luckRating.percentile || 50, 100)}%`, background: 'linear-gradient(90deg, #f87171, #edaf18, #34d399)', boxShadow: '0 0 6px rgba(237,175,24,0.4)' }} />
                            </div>
                            <span className="text-[10px] font-bold flex-shrink-0 px-2 py-0.5 rounded" style={{ color: luckRating.color || '#edaf18', background: `${luckRating.color || '#edaf18'}15`, border: `1px solid ${luckRating.color || '#edaf18'}30`, textShadow: `0 0 8px ${luckRating.color || '#edaf18'}60`, fontFamily: 'var(--font-display)' }}>{luckRating.tier} {luckRating.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className={`relative rounded-xl overflow-hidden breath-zoom${CHARACTER_DATA[state.profile.profilePic]?.rarity === 5 ? ' holo-5star' : ''}`} style={{ width: '110px', height: '110px', background: 'var(--bg-stat)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 0 15px rgba(237,175,24,0.04), inset 0 1px 0 rgba(255,255,255,0.08)', contain: 'paint' }}>
                          <div className="absolute top-0 left-0 right-0 h-px z-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
                          {state.profile.profilePic && collectionImages[state.profile.profilePic] ? (() => {
                            const f = getImageFraming(`collection-${state.profile.profilePic}`);
                            {/* AUDIT-FIX L21: onError fallback for profile pic in ID card */}
                            return <img src={collectionImages[state.profile.profilePic]} alt={state.profile.profilePic} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)` }} onError={hideOnError} />;
                          })() : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-stat)' }}>
                              <img src={HEADER_ICON} alt="Default" className="w-12 h-12 object-contain opacity-60" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }} />
                        </div>
                        {state.profile.profilePic && (
                          <p className="text-gray-500 text-center mt-1 truncate" style={{ fontSize: '7px', width: '110px' }}>{state.profile.profilePic}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ═══ CONVENE STATS PANEL ═══ */}
                  <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))', border: '1px solid rgba(255,255,255,0.08)', padding: '10px' }}>
                    <div className="absolute top-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(237,175,24,0.4), transparent)' }} />
                    <div className="absolute" style={{ top: 6, right: 6, width: 10, height: 10, borderTop: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 3px 0 0' }} />
                    <div className="absolute" style={{ bottom: 6, left: 6, width: 10, height: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 0 3px' }} />
                    <div className="flex items-center gap-2 mb-2">
                      <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg, rgba(237,175,24,0.9), rgba(237,175,24,0.3))', boxShadow: '0 0 6px rgba(237,175,24,0.3)' }} />
                      <span className="text-[10px] font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em', fontFamily: 'var(--font-display)' }}>Convene Stats</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Avg Pity', value: overallStats?.avgPity ?? '—', color: '#edaf18', bg: 'rgba(237,175,24,0.1)', bc: 'rgba(237,175,24,0.3)' },
                      { label: 'Total Convenes', value: overallStats?.totalPulls?.toLocaleString() ?? '—', color: '#e5e7eb', bg: 'var(--bg-stat)', bc: 'rgba(255,255,255,0.12)' },
                      { label: '5★ Obtained', value: overallStats?.fiveStars ?? '—', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', bc: 'rgba(168,85,247,0.3)' },
                      { label: '50/50 Win', value: overallStats?.winRate ? overallStats.winRate + '%' : '—', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', bc: 'rgba(34,197,94,0.3)' },
                      { label: 'Won', value: overallStats?.won5050 ?? '—', color: '#4ade80', bg: 'rgba(34,197,94,0.06)', bc: 'rgba(34,197,94,0.2)' },
                      { label: 'Lost', value: overallStats?.lost5050 ?? '—', color: '#f87171', bg: 'rgba(248,113,113,0.1)', bc: 'rgba(248,113,113,0.3)' },
                    ].map((s, i) => (
                      <div key={i} className="relative rounded-lg px-2 py-1.5 text-center overflow-hidden" style={{ background: s.bg, border: `1px solid ${s.bc}` }}>
                        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
                        <div className="font-bold text-sm" style={{ color: s.color, textShadow: `0 0 8px ${s.color}30`, fontFamily: 'var(--font-data)' }}>{s.value}</div>
                        <div className="text-gray-500 mt-0.5" style={{ fontSize: '7px', letterSpacing: '0.04em' }}>{s.label}</div>
                      </div>
                    ))}
                    </div>
                  </div>

                  {/* ═══ PITY DISTRIBUTION PANEL ═══ */}
                  {(() => {
                    const bgnHist = state.profile.beginner?.history||[];
                    const charHist = [...(state.profile.featured?.history||[]),...(state.profile.standardChar?.history||[]),...bgnHist.filter(p=>p.name&&ALL_CHARACTERS.has(p.name))];
                    const weapHist = [...(state.profile.weapon?.history||[]),...(state.profile.standardWeap?.history||[]),...bgnHist.filter(p=>p.name&&!ALL_CHARACTERS.has(p.name))];
                    const fsp = [...charHist,...weapHist].filter(p=>p.rarity===5&&p.pity>0);
                    if(fsp.length < 2) return null;
                    const bk = {};
                    fsp.forEach(p => { if(p.pity>80){bk['81+']=(bk['81+']||0)+1;} else {const b=Math.floor((p.pity-1)/10)*10+1;bk[`${b}-${b+9}`]=(bk[`${b}-${b+9}`]||0)+1;} });
                    const labs = Array.from({length:8},(_,i)=>`${i*10+1}-${(i+1)*10}`);
                    if(bk['81+'])labs.push('81+');
                    labs.forEach(b=>{if(!bk[b])bk[b]=0;});
                    const mx = Math.max(...Object.values(bk),1);
                    const avg = (fsp.reduce((s,p)=>s+p.pity,0)/fsp.length).toFixed(1);
                    const lo = Math.min(...fsp.map(p=>p.pity));
                    const hi = Math.max(...fsp.map(p=>p.pity));
                    return (
                      <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))', border: '1px solid rgba(255,255,255,0.08)', padding: '10px' }}>
                        <div className="absolute top-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.35), transparent)' }} />
                        <div className="absolute" style={{ top: 6, right: 6, width: 10, height: 10, borderTop: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 3px 0 0' }} />
                        <div className="absolute" style={{ bottom: 6, left: 6, width: 10, height: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 0 3px' }} />
                        <div className="flex items-center gap-2 mb-2">
                          <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg, rgba(237,175,24,0.9), rgba(237,175,24,0.3))', boxShadow: '0 0 6px rgba(237,175,24,0.3)' }} />
                          <span className="text-[10px] font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em', fontFamily: 'var(--font-display)' }}>Pity Distribution</span>
                        </div>
                        {/* §E10-CH-F2: Summary moved above histogram, escalated to text-xs */}
                        <div className="text-right mb-1.5">
                          <span className="text-xs text-gray-400 kuro-number" style={{ fontFamily: 'var(--font-data)' }}>Lo {lo} · Avg {avg} · Hi {hi}</span>
                        </div>
                        <div className="flex items-end gap-1.5" style={{ marginBottom: '2px' }}>
                          {labs.map((lab, i) => {
                            const cnt = bk[lab]||0;
                            const height = mx > 0 ? (cnt / mx) * 100 : 0;
                            const bucket = parseInt(lab)||81;
                            const color = bucket<=20?'#22c55e':bucket<=40?'#4ade80':bucket<=50?'#edaf18':bucket<=60?'#f97316':'#ef4444';
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div className="w-full relative" style={{ height: '96px' }}>
                                  {cnt > 0 && (
                                    <div className="absolute left-0 right-0 text-center font-bold"
                                      style={{ fontSize: '8px', bottom: `${height}%`, marginBottom: '4px', color, textShadow: `0 0 8px ${color}`, fontFamily: 'var(--font-data)' }}>
                                      {cnt}
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 left-1 right-1 rounded-t"
                                    style={{ height: `${height}%`, minHeight: cnt > 0 ? '8px' : '0',
                                      background: `linear-gradient(to top, ${color}40, ${color}20)`,
                                      border: cnt > 0 ? `1px solid ${color}90` : 'none', borderBottom: 'none',
                                      boxShadow: cnt > 0 ? `0 0 12px ${color}50, inset 0 0 15px ${color}30` : 'none' }} />
                                  {cnt > 0 && (
                                    <div className="absolute bottom-0 left-1 right-1 rounded-full"
                                      style={{ height: '2px', background: color, boxShadow: `0 0 8px ${color}, 0 0 16px ${color}80` }} />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-1.5">
                          {labs.map((lab, i) => (
                            <div key={i} className="flex-1 text-center" style={{ fontSize: '7px', color: '#6b7280' }}>{lab.split('-')[0]}</div>
                          ))}
                        </div>
                        {/* Summary moved above histogram per §E10-CH-F2 */}
                      </div>
                    );
                  })()}

                  {/* ═══ RESONATORS PANEL ═══ */}
                  {ownedCharNames.length > 0 && (
                    <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))', border: '1px solid rgba(255,255,255,0.08)', padding: '10px' }}>
                      <div className="absolute top-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.35), transparent)' }} />
                      <div className="absolute" style={{ top: 6, right: 6, width: 10, height: 10, borderTop: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 3px 0 0' }} />
                      <div className="absolute" style={{ bottom: 6, left: 6, width: 10, height: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 0 3px' }} />
                      <div className="flex items-center gap-2 mb-2">
                        <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg, rgba(237,175,24,0.9), rgba(237,175,24,0.3))', boxShadow: '0 0 6px rgba(237,175,24,0.3)' }} />
                        <span className="text-[10px] font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em' }}>Resonators ({ownedCharNames.length})</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {ownedCharNames.slice(0, 16).map(name => {
                          const imgUrl = collectionImages[name];
                          const f = getImageFraming(`collection-${name}`);
                          const is5Star = CHARACTER_DATA[name]?.rarity === 5;
                          return (
                            <div key={name}>
                              <div className={`relative rounded-lg overflow-hidden w-full breath-zoom${is5Star ? ' holo-5star' : ''}`} style={{ aspectRatio: '9/14', background: 'var(--bg-stat)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', contain: 'paint' }}>
                                <div className="absolute top-0 left-0 right-0 h-px z-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
                                {imgUrl ? (
                                  <img src={imgUrl} alt={name} loading="lazy" className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ transform: `scale(${f.zoom / 100}) translate(${-f.x}%, ${-f.y}%)` }} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-gray-500" style={{ fontSize: '14px' }}>{name[0]}</span>
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-1 pointer-events-none" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
                                  <span className="text-gray-200 text-center truncate block" style={{ fontSize: '6px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{name}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {ownedCharNames.length > 16 && (
                          <div className="flex items-center justify-center rounded-lg w-full" style={{ aspectRatio: '9/14', background: 'var(--bg-stat)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span className="text-gray-500 font-mono" style={{ fontSize: '9px' }}>+{ownedCharNames.length - 16}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ═══ TROPHIES PANEL ═══ */}
                  {(() => {
                    const sorted = [...(trophies?.list || [])].sort((a,b) => (TROPHY_TIER_ORDER[a.tier]??99) - (TROPHY_TIER_ORDER[b.tier]??99)).slice(0, 5);
                    if (!sorted.length) return null;
                    return (
                      <div className="relative rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))', border: '1px solid rgba(255,255,255,0.08)', padding: '10px' }}>
                        <div className="absolute top-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(237,175,24,0.3), transparent)' }} />
                        <div className="absolute" style={{ top: 6, right: 6, width: 10, height: 10, borderTop: '1px solid rgba(255,255,255,0.12)', borderRight: '1px solid rgba(255,255,255,0.12)', borderRadius: '0 3px 0 0' }} />
                        <div className="absolute" style={{ bottom: 6, left: 6, width: 10, height: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 0 3px' }} />
                        <div className="flex items-center gap-2 mb-2">
                          <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg, rgba(237,175,24,0.9), rgba(237,175,24,0.3))', boxShadow: '0 0 6px rgba(237,175,24,0.3)' }} />
                          <span className="text-[10px] font-semibold" style={{ color: '#f1f5f9', letterSpacing: '0.03em' }}>Trophies ({sorted.length})</span>
                        </div>
                        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${sorted.length}, 1fr)` }}>
                          {sorted.map(trophy => {
                            const IconComponent = TROPHY_ICON_MAP[trophy.icon] || Star;
                            return (
                              <div key={trophy.id} className="relative p-2 rounded-lg text-center overflow-hidden" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${trophy.color}18, ${trophy.color}08)`, border: `1px solid ${trophy.color}50`, boxShadow: `0 0 20px ${trophy.color}15, inset 0 0 20px ${trophy.color}05` }}>
                                <div className="rounded-full flex items-center justify-center mb-1" style={{ width: '28px', height: '28px', background: `linear-gradient(135deg, ${trophy.color}30, ${trophy.color}10)`, boxShadow: `0 0 15px ${trophy.color}40` }}>
                                  <IconComponent size={14} style={{ color: trophy.color }} />
                                </div>
                                <div className="font-bold text-white w-full px-0.5 leading-tight" style={{ fontSize: '7px', wordBreak: 'break-word' }}>{trophy.name}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ═══ FOOTER ═══ */}
                  <div className="relative flex items-center justify-between pt-1.5">
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />
                    <span className="text-gray-500 font-mono" style={{ fontSize: '8px' }}>Generated {new Date().toLocaleDateString()}</span>
                    <span className="text-gray-500" style={{ fontSize: '8px' }}>whisperingwishes.app</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Format toggle + action buttons */}
            <div className="flex gap-2 mt-3">
              {/* Format toggle */}
              <div className="flex rounded-xl overflow-hidden" style={{ background: 'var(--bg-btn)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setIdCardFormat('landscape')}
                  className="px-3 py-2.5 text-[10px] font-medium flex items-center gap-1.5 transition-all"
                  style={idCardFormat === 'landscape' ? { background: 'rgba(237,175,24,0.15)', color: '#edaf18', borderRight: '1px solid rgba(255,255,255,0.1)' } : { color: '#6b7280', borderRight: '1px solid rgba(255,255,255,0.1)' }}
                  title="Landscape 16:9"
                >
                  <Monitor size={12} /> 16:9
                </button>
                <button
                  onClick={() => setIdCardFormat('portrait')}
                  className="px-3 py-2.5 text-[10px] font-medium flex items-center gap-1.5 transition-all"
                  style={idCardFormat === 'portrait' ? { background: 'rgba(237,175,24,0.15)', color: '#edaf18' } : { color: '#6b7280' }}
                  title="Portrait 9:16"
                >
                  <Smartphone size={12} /> 9:16
                </button>
              </div>
              {/* Download */}
              <button
                onClick={() => downloadIdCard(idCardFormat)}
                className="kuro-btn flex-1 py-2.5 text-xs active-gold flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download {idCardFormat === 'portrait' ? '9:16' : '16:9'}
              </button>
              {/* Close */}
              <button
                onClick={() => setShowIdCard(false)}
                className="kuro-btn px-4 py-2.5 text-xs"
              >
                <X size={14} />
              </button>
            </div>
          </div>
      </FocusTrapModal>

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

      {/* Admin Mini Window — portaled to body so it's never overlapped by detail modals */}
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

      {/* Character/Weapon Detail Modal */}
      {detailModal.show && detailModal.type === 'character' && (
        <CharacterDetailModal
          name={detailModal.name}
          imageUrl={detailModal.imageUrl}
          framing={detailModal.framing}
          infoFraming={getImageFraming(`info-${detailModal.name}`)}
          getImageFraming={getImageFraming}
          framingMode={framingMode}
          editingImage={editingImage}
          setEditingImage={setEditingImage}
          onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null, framing: null })}
        />
      )}
      {detailModal.show && detailModal.type === 'weapon' && (
        <WeaponDetailModal
          name={detailModal.name}
          imageUrl={detailModal.imageUrl}
          onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null })}
        />
      )}
      {detailModal.show && detailModal.type === 'echo' && (
        <EchoDetailModal
          name={detailModal.name}
          imageUrl={detailModal.imageUrl}
          cost={detailModal.cost}
          onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null })}
        />
      )}


      {/* Desktop right margin — ad slot + footer text at bottom (hidden on mobile) */}
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
  );
}

// [SECTION:EXPORT]
export default function WhisperingWishes() {
  return (
    <AppErrorBoundary>
      <PWAProvider>
        <ToastProvider>
          <ConfirmProvider>
            <WhisperingWishesInner />
          </ConfirmProvider>
        </ToastProvider>
      </PWAProvider>
    </AppErrorBoundary>
  );
}
