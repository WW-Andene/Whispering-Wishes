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
import { CURRENT_BANNERS, DEFAULT_COLLECTION_IMAGES, CHARACTER_THEMES } from './data/banners.js';
import { APP_VERSION, MAX_IMPORT_SIZE_MB, HEADER_ICON, HARD_PITY, ASTRITE_PER_PULL, BEGINNER_ASTRITE_PER_PULL, SERVERS, TAB_ORDER, getServerOffset } from './data/constants.js';
import { haptic, generateUniqueId, calculateLuckRating, getElementColor } from './utils/helpers.js';
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
import { KuroStyles } from './providers/KuroStyles.jsx';
import { OnboardingModal } from './providers/OnboardingModal.jsx';
// --- shared ---
import { CharacterDetailModal } from './shared/modals/CharacterDetailModal.jsx';
import { WeaponDetailModal } from './shared/modals/WeaponDetailModal.jsx';
import { EchoDetailModal } from './shared/modals/EchoDetailModal.jsx';
import { TabButton } from './shared/components/Card.jsx';
import { AppErrorBoundary, TabErrorBoundary } from './shared/errors/ErrorBoundaries.jsx';
import { BackgroundGlow, TriangleMirrorWave, ResonanceField, Honour } from './shared/backgrounds/Backgrounds.jsx';
import { getActiveBanners } from './shared/components/BannerCard.jsx';
// --- Feature tabs ---
// D2-01: Eager-load default/lightweight tabs, lazy-load heavy tabs for code splitting
import EventsTab from './features/events/EventsTab.jsx';
import TrackerTab from './features/tracker/TrackerTab.jsx';
import PlannerTab from './features/planner/PlannerTab.jsx';
import AnalyticsTab from './features/analytics/AnalyticsTab.jsx';
import CalculatorTab from './features/calculator/CalculatorTab.jsx';
import CollectionTab from './features/collection/CollectionTab.jsx';
import TeamsTab from './features/teams/TeamsTab.jsx';
import ProfileTab from './features/profile/ProfileTab.jsx';

// ── Module-level constants (hoisted from render body) ──────────────────────
// 8.1 fix: Fetch wrapper with AbortController timeout - fails fast on network loss
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
const CALC_DEFER_MS = 150;
const STORAGE_WARNING_THRESHOLD = 3.5 * 1024 * 1024;
import { constantTimeCompare } from './utils/constantTimeCompare.js'; // I4-01: deduplicated
import {
  VISUAL_SETTINGS_KEY, IMAGE_FRAMING_KEY, TROPHY_OVERRIDES_KEY,
  ADMIN_SALT, ADMIN_TAP_TIMEOUT_MS, MAX_USERNAME_LENGTH, MAX_BOOKMARK_NAME_LENGTH,
  ALLOWED_IMAGE_HOSTS, isAllowedImageUrl, sanitizeImageUrl,
} from './shared/constants/appConstants.js';
const currentYear = new Date().getFullYear();
const MIN_ZOOM = 100;
const MAX_ZOOM = 300;
// P13-FIX: CRITICAL-1 - Read Firebase config from env vars (set in .env or Vercel dashboard).
// No hardcoded fallbacks - Firebase features are disabled when env vars are missing.
const FIREBASE_DB = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_DB) || null;
const FIREBASE_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || null;
const FIREBASE_AVAILABLE = !!(FIREBASE_DB && FIREBASE_API_KEY);
// localStorage keys, admin salt, and image allowlist imported from shared/constants/appConstants.js
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
  animationsEnabled: 'on', // 'off' | 'on' | 'full' (full = 2x intensity); overridden at mount via matchMedia listener
  bgStyle: 'none', // 'none' | 'reflect' | 'resonance' | 'honour' - background animation style
  bgResolution: null, // null = auto (50% on, 100% full) | 25 | 50 | 100 | 200
  bgFps: null, // null = auto (15 on, 30 full) | 15 | 30 | 45 | 60
  theme: 'default', // 'default' | CHARACTER_THEMES[].id - character theme changes header art & accent colors
  dyslexicFont: false // OpenDyslexic font for dyslexia accessibility
});
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

// P13-FIX: HIGH-2 - Client-side rate limiter for Firebase writes.
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
  // Google Auth state for cloud backup
  const [googleUser, setGoogleUser] = useState(() => {
    try { const v = localStorage.getItem('ww-google-user'); return v ? JSON.parse(v) : null; } catch { return null; }
  });
  const [cloudBackupStatus, setCloudBackupStatus] = useState('idle'); // idle|saving|loading|done|error
  const googleAuthRef = useRef({ idToken: null, refreshToken: null, expiresAt: 0 });
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
  
  // Anonymous presence tracking - no personal data, just a timestamp per ephemeral session
  const presenceSessionId = useRef('s_' + generateUniqueId().replace(/-/g, '').slice(0, 12));
  

  
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
            if (parsed[key] !== undefined) merged[key] = parsed[key];
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

  // Respect prefers-reduced-motion - only for first-time users (no saved setting)
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
      // Icons: icon-192x192.png, icon-512x512.png, icon-maskable-512x512.png in /public
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
  
  // Debounced visual settings persistence - live state update on every tick,
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

  // Sync animation classes to <html> so portals (rendered outside root div) inherit them
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle('animations-full', visualSettings.animationsEnabled === 'full');
    el.classList.toggle('no-animations', visualSettings.animationsEnabled === 'off');
  }, [visualSettings.animationsEnabled]);

  // Sync accessibility font - lazy-load base64-embedded OpenDyslexic
  useEffect(() => {
    const STYLE_ID = 'ww-accessibility-font';
    const on = !!visualSettings.dyslexicFont;
    document.documentElement.classList.toggle('dyslexic-font', on);
    if (on) {
      import('./fonts/opendyslexic.js').then(({ getOpenDyslexicCSS }) => {
        let tag = document.getElementById(STYLE_ID);
        if (!tag) {
          tag = document.createElement('style');
          tag.id = STYLE_ID;
          document.head.appendChild(tag);
        }
        tag.textContent = getOpenDyslexicCSS();
      });
    } else {
      const tag = document.getElementById(STYLE_ID);
      if (tag) tag.remove();
    }
  }, [visualSettings.dyslexicFont]);

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
  
  // Collection images storage (merges with defaults)
  const COLLECTION_IMAGES_KEY = 'whispering-wishes-collection-images';
  const [customCollectionImages, setCustomCollectionImages] = useState(() => {
    if (!storageAvailable) return {};
    try {
      const saved = localStorage.getItem(COLLECTION_IMAGES_KEY);
      if (!saved) return {};
      const raw = JSON.parse(saved);
      // P15-FIX: MEDIUM-3 - Validate URLs: HTTPS-only + domain allowlist to prevent tracking/SSRF
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
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current));
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
  const [activeTab, setActiveTabRaw] = useState('tracker');
  const tabNavRef = useRef(null);
  const setActiveTab = useCallback((tab) => {
    setActiveTabRaw(tab);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);

  // Swipe navigation between tabs
  const swipeRef = useRef({ startX: 0, startY: 0, startTime: 0 });
  const lastSwipeRef = useRef(0);
  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  
  useEffect(() => {
    if (!visualSettings.swipeNavigation) return;

    const EDGE_EXCLUSION = 20;   // pixels from screen edge to ignore
    const MIN_DISTANCE = 50;     // minimum swipe distance in px
    const MAX_TIME = 300;        // maximum swipe duration in ms
    const MIN_RATIO = 1.5;       // horizontal/vertical ratio threshold
    const SWIPE_COOLDOWN = 400;  // ms between accepted swipes
    const MIN_VELOCITY = 0.5;    // px/ms for velocity-based acceptance
    const MIN_VELOCITY_DIST = 30; // minimum distance for velocity-based swipes

    const handleTouchStart = (e) => {
      // P10-FIX: Don't capture swipes starting inside horizontally scrollable containers (Step 10 audit - MEDIUM-5j)
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
      if (touchX < EDGE_EXCLUSION || touchX > window.innerWidth - EDGE_EXCLUSION) {
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
      // Cooldown: prevent double-swipes
      if (Date.now() - lastSwipeRef.current < SWIPE_COOLDOWN) return;

      const { startX, startY, startTime } = swipeRef.current;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;

      // Must be horizontal swipe (more X than Y movement)
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * MIN_RATIO;
      // Primary check: fast enough and long enough
      const isFastEnough = deltaTime < MAX_TIME;
      const isLongEnough = Math.abs(deltaX) > MIN_DISTANCE;
      // Alternative: velocity-based acceptance for quick flicks
      const velocity = deltaTime > 0 ? Math.abs(deltaX) / deltaTime : 0;
      const isHighVelocity = velocity > MIN_VELOCITY && Math.abs(deltaX) > MIN_VELOCITY_DIST;

      if (isHorizontalSwipe && ((isFastEnough && isLongEnough) || isHighVelocity)) {
        const currentIndex = TAB_ORDER.indexOf(activeTabRef.current);
        if (deltaX < 0 && currentIndex < TAB_ORDER.length - 1) {
          // Swipe left → next tab
          lastSwipeRef.current = Date.now();
          haptic.medium();
          setActiveTab(TAB_ORDER[currentIndex + 1]);
        } else if (deltaX > 0 && currentIndex > 0) {
          // Swipe right → previous tab
          lastSwipeRef.current = Date.now();
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
  

  const [detailModal, setDetailModal] = useState({ show: false, type: null, name: null, imageUrl: null, framing: null });
  
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

  // Firebase Anonymous Auth - tries to get a token, returns '' if auth unavailable.
  // All Firebase requests work with or without auth (unauthenticated if token is empty).
  const firebaseAuthRef = useRef({ idToken: null, expiresAt: 0 });
  const getFirebaseAuth = useCallback(async () => {
    if (!FIREBASE_AVAILABLE) {
      console.warn('[WW] Firebase config missing - online features disabled.');
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

  // Helper: build Firebase URL (F-017: auth moved to Authorization header — no longer in URL)
  const firebaseUrl = useCallback((path) => `${FIREBASE_DB}/${path}.json`, []);

  // Helper: Firebase fetch with auth in Authorization header instead of URL query param
  // This prevents token leakage in browser history, referrer headers, and server logs.
  const firebaseFetch = useCallback((path, authToken, options = {}) => {
    const url = `${FIREBASE_DB}/${path}.json`;
    const headers = { ...(options.headers || {}) };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    return fetchWithTimeout(url, { ...options, headers });
  }, []);
  
  // ══════════════════════════════════════════════════════════════════════════
  // Google Sign-In for Cloud Backup (Firebase Auth REST API — no SDK)
  // ══════════════════════════════════════════════════════════════════════════

  // Refresh Google auth token using stored refresh token
  const refreshGoogleToken = useCallback(async () => {
    const rt = googleAuthRef.current.refreshToken;
    if (!rt || !FIREBASE_API_KEY) return null;
    try {
      const res = await fetchWithTimeout('https://securetoken.googleapis.com/v1/token?key=' + FIREBASE_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(rt)}`,
      });
      if (!res.ok) throw new Error('Token refresh failed');
      const data = await res.json();
      googleAuthRef.current = {
        idToken: data.id_token,
        refreshToken: data.refresh_token || rt,
        expiresAt: Date.now() + (parseInt(data.expires_in, 10) || 3600) * 1000,
      };
      return data.id_token;
    } catch { return null; }
  }, []);

  // Get a valid Google auth token (refresh if needed)
  const getGoogleAuth = useCallback(async () => {
    if (!googleUser) return null;
    const now = Date.now();
    if (googleAuthRef.current.idToken && googleAuthRef.current.expiresAt > now + 60000) {
      return googleAuthRef.current.idToken;
    }
    return refreshGoogleToken();
  }, [googleUser, refreshGoogleToken]);

  // Google Sign-In using Google Identity Services + Firebase REST API
  const handleGoogleSignIn = useCallback(async () => {
    if (!FIREBASE_API_KEY) { toast?.addToast?.('Firebase not configured', 'error'); return; }
    try {
      // Load GIS script if needed
      if (!window.google?.accounts?.oauth2) {
        await new Promise((resolve, reject) => {
          if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
            const check = setInterval(() => { if (window.google?.accounts?.oauth2) { clearInterval(check); resolve(); } }, 100);
            setTimeout(() => { clearInterval(check); reject(new Error('GIS load timeout')); }, 10000);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
          document.head.appendChild(script);
        });
      }

      // Single flow: get access token via popup
      const accessToken = await new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env?.VITE_GOOGLE_CLIENT_ID || '',
          scope: 'email profile',
          callback: (response) => {
            if (response.error) reject(new Error(response.error));
            else resolve(response.access_token);
          },
        });
        client.requestAccessToken();
      });

      toast?.addToast?.('Signing in...', 'info');

      // Exchange Google access token for Firebase ID token
      const fbRes = await fetchWithTimeout(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postBody: `access_token=${accessToken}&providerId=google.com`,
            requestUri: window.location.origin,
            returnIdToken: true,
            returnSecureToken: true,
          }),
        }
      );
      if (!fbRes.ok) {
        const errData = await fbRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || 'Firebase sign-in failed');
      }
      const fbData = await fbRes.json();

      // F-009: Minimize PII stored in localStorage — exclude email (only store what's needed for display)
      const user = {
        uid: fbData.localId,
        displayName: fbData.displayName || fbData.email?.split('@')[0] || 'User',
        photoUrl: fbData.photoUrl || null,
      };

      googleAuthRef.current = {
        idToken: fbData.idToken,
        refreshToken: fbData.refreshToken,
        expiresAt: Date.now() + (parseInt(fbData.expiresIn, 10) || 3600) * 1000,
      };

      setGoogleUser(user);
      try { localStorage.setItem('ww-google-user', JSON.stringify(user)); } catch {}
      toast?.addToast?.(`Signed in as ${user.displayName}`, 'success');
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast?.addToast?.('Sign-in failed: ' + (err.message || 'Unknown error'), 'error');
    }
  }, [toast]);

  const handleGoogleSignOut = useCallback(() => {
    setGoogleUser(null);
    googleAuthRef.current = { idToken: null, refreshToken: null, expiresAt: 0 };
    try { localStorage.removeItem('ww-google-user'); } catch {}
    toast?.addToast?.('Signed out', 'info');
  }, [toast]);

  // Cloud Backup: save full convene history to Firebase RTDB
  const handleCloudBackup = useCallback(async () => {
    const token = await getGoogleAuth();
    if (!token || !googleUser) {
      toast?.addToast?.('Session expired — please sign in again', 'error');
      handleGoogleSignOut();
      return;
    }
    setCloudBackupStatus('saving');
    try {
      // P4-F002: Include full state + auxiliary data in cloud backup (matches file export)
      const aux = {};
      try { const v = localStorage.getItem(VISUAL_SETTINGS_KEY); if (v) aux.visualSettings = JSON.parse(v); } catch {}
      try { const v = localStorage.getItem(IMAGE_FRAMING_KEY); if (v) aux.imageFraming = JSON.parse(v); } catch {}
      try { const v = localStorage.getItem(COLLECTION_IMAGES_KEY); if (v) aux.collectionImages = JSON.parse(v); } catch {}
      try { const v = localStorage.getItem(TROPHY_OVERRIDES_KEY); if (v) aux.trophyOverrides = JSON.parse(v); } catch {}
      try { const v = localStorage.getItem('ww-team-equipment'); if (v) aux.teamEquipment = JSON.parse(v); } catch {}
      try { const v = localStorage.getItem('ww-calendar-notes'); if (v) aux.calendarNotes = JSON.parse(v); } catch {}
      const backupData = {
        state: stateRef.current,
        profile: stateRef.current.profile, // keep for backward compat with older restores
        ...(Object.keys(aux).length > 0 ? { aux } : {}),
        timestamp: Date.now(),
        version: APP_VERSION,
        pullCount: (stateRef.current.profile.featured?.history?.length || 0)
          + (stateRef.current.profile.weapon?.history?.length || 0)
          + (stateRef.current.profile.standardChar?.history?.length || 0)
          + (stateRef.current.profile.standardWeap?.history?.length || 0)
          + (stateRef.current.profile.beginner?.history?.length || 0),
      };
      const res = await firebaseFetch(`user-history/${googleUser.uid}`, token, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData),
      });
      if (res.status === 401) {
        toast?.addToast?.('Session expired — please sign in again', 'error');
        handleGoogleSignOut();
        setCloudBackupStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCloudBackupStatus('done');
      toast?.addToast?.(`Backed up ${backupData.pullCount} pulls to cloud`, 'success');
      setTimeout(() => setCloudBackupStatus('idle'), 3000);
    } catch (err) {
      setCloudBackupStatus('error');
      toast?.addToast?.('Backup failed: ' + (err.message || 'Unknown error'), 'error');
      setTimeout(() => setCloudBackupStatus('idle'), 3000);
    }
  }, [getGoogleAuth, googleUser, firebaseFetch, toast, handleGoogleSignOut]);

  // Cloud Restore: load convene history from Firebase RTDB
  const handleCloudRestore = useCallback(async () => {
    let token = await getGoogleAuth();
    if (!token || !googleUser) {
      // Session expired (tokens lost after reload) — prompt re-sign-in
      toast?.addToast?.('Session expired — please sign in again', 'error');
      handleGoogleSignOut();
      return;
    }
    setCloudBackupStatus('loading');
    try {
      const res = await firebaseFetch(`user-history/${googleUser.uid}`, token);
      if (res.status === 401) {
        // Token invalid — clear stale session and prompt re-sign-in
        toast?.addToast?.('Session expired — please sign in again', 'error');
        handleGoogleSignOut();
        setCloudBackupStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || !data.profile) {
        toast?.addToast?.('No cloud backup found', 'error');
        setCloudBackupStatus('idle');
        return;
      }
      const doRestore = await confirm?.({
        title: 'Restore from cloud',
        message: `Restore backup from ${new Date(data.timestamp).toLocaleString()}?\n${data.pullCount || 0} pulls (v${data.version || '?'}).\nThis will REPLACE your current data.`,
        confirmLabel: 'Restore',
        destructive: true,
      });
      if (!doRestore) { setCloudBackupStatus('idle'); return; }
      // F-007: Sanitize cloud-restored data to prevent state injection from compromised Firebase
      // P4-F002: Support full state + aux restore (backward compat: old backups have profile only)
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
      setCloudBackupStatus('done');
      toast?.addToast?.(`Restored ${data.pullCount || 0} pulls from cloud`, 'success');
      setTimeout(() => setCloudBackupStatus('idle'), 3000);
    } catch (err) {
      setCloudBackupStatus('error');
      toast?.addToast?.('Restore failed: ' + (err.message || 'Unknown error'), 'error');
      setTimeout(() => setCloudBackupStatus('idle'), 3000);
    }
  }, [getGoogleAuth, googleUser, firebaseFetch, toast, confirm, dispatch, handleGoogleSignOut]);

  // Cloud Delete: remove user's cloud backup from Firebase RTDB
  const handleCloudDelete = useCallback(async () => {
    const token = await getGoogleAuth();
    if (!token || !googleUser) return; // silently skip if not signed in
    try {
      await firebaseFetch(`user-history/${googleUser.uid}`, token, { method: 'DELETE' });
    } catch { /* best-effort — local reset already happened */ }
  }, [getGoogleAuth, googleUser, firebaseFetch]);

  // Anonymous presence system - writes only a timestamp (no personal data) to track active users
  const PRESENCE_INTERVAL_MS = 60000; // heartbeat every 60s
  const PRESENCE_TTL_MS = 120000; // consider offline after 2 minutes of no heartbeat
  
  const sendPresenceHeartbeat = useCallback(async () => {
    // P13-FIX: HIGH-2 - Rate limit presence writes (guard against runaway intervals)
    if (!checkFirebaseRateLimit('presence-heartbeat')) return;
    try {
      const authToken = await getFirebaseAuth();
      const res = await firebaseFetch(`presence/${presenceSessionId.current}`, authToken, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: Date.now() }) // only a timestamp - zero personal data
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[WW] Heartbeat write failed (${res.status})${errText ? ' -' + errText.slice(0, 80) : ''}`);
      }
    } catch (e) { /* heartbeat errors are non-critical - admin panel shows presence errors separately */ }
  }, [getFirebaseAuth, firebaseFetch]);

  const removePresence = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth();
      await firebaseFetch(`presence/${presenceSessionId.current}`, authToken, { method: 'DELETE' });
    } catch { /* best-effort */ }
  }, [getFirebaseAuth, firebaseFetch]);

  // Start heartbeat  // Start heartbeat on mount, clean up on unmount
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
        const doRestore = await confirm?.('Restore full backup?', 'This will replace ALL current data (Convenes, teams, settings) with the backup. Continue?', { confirmText: 'Restore', dangerous: true });
        if (!doRestore) return;
        dispatch({ type: 'LOAD_STATE', state: data.state });
        // Restore auxiliary data (visual settings, team equipment, etc.)
        // B4-01: Use correct constant keys (was writing to wrong hardcoded keys)
        // B4-02: Sanitize aux data to match restore flow (App.jsx:1826-1842)
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
            // U6-01: Restore calendar notes from backup (import path)
            if (data.aux.calendarNotes && typeof data.aux.calendarNotes === 'object') {
              localStorage.setItem('ww-calendar-notes', JSON.stringify(sanitizeStateObj(data.aux.calendarNotes)));
            }
          } catch {}
        }
        toast?.addToast?.(`Backup restored! (v${data.version || '?'}, ${data.timestamp ? new Date(data.timestamp).toLocaleDateString() : 'unknown date'})`, 'success');
        return;
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
        const proceed = await confirm?.('Different account detected', `This data is from UID ${importUid.slice(0, 6)}... but your current account is ${existingUid.slice(0, 6)}... Import will merge both accounts\' history. Continue?`, { confirmText: 'Merge', dangerous: true });
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
  }, [toast, dispatch, IMPORT_NAME_ALIASES]);

  // Export data - includes main state + auxiliary localStorage settings for full round-trip
  const handleExport = useCallback(() => {
    const aux = {};
    try { const v = localStorage.getItem(VISUAL_SETTINGS_KEY); if (v) aux.visualSettings = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem(IMAGE_FRAMING_KEY); if (v) aux.imageFraming = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem(COLLECTION_IMAGES_KEY); if (v) aux.collectionImages = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem(TROPHY_OVERRIDES_KEY); if (v) aux.trophyOverrides = JSON.parse(v); } catch {}
    try { const v = localStorage.getItem('ww-team-equipment'); if (v) aux.teamEquipment = JSON.parse(v); } catch {}
    // U6-01: Include calendar notes in backup
    try { const v = localStorage.getItem('ww-calendar-notes'); if (v) aux.calendarNotes = JSON.parse(v); } catch {}
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

  const activeTheme = useMemo(() => {
    if (visualSettings.theme === 'default') return null;
    return CHARACTER_THEMES.find(t => t.id === visualSettings.theme) || null;
  }, [visualSettings.theme]);
  const themeAccent = activeTheme ? getElementColor(activeTheme.element) : null;

  // Apply theme accent as CSS custom properties for kuro-card system
  useEffect(() => {
    const el = document.documentElement;
    if (themeAccent) {
      el.style.setProperty('--theme-accent', themeAccent);
      el.style.setProperty('--border-default', `${themeAccent}20`);
      el.style.setProperty('--border-hover', `${themeAccent}40`);
      el.style.setProperty('--border-bright', `${themeAccent}50`);
      el.style.setProperty('--shimmer-color', `${themeAccent}66`);
      el.style.setProperty('--shimmer-color-bright', `${themeAccent}bb`);
      el.style.setProperty('--card-outline', `${themeAccent}10`);
      el.style.setProperty('--card-outline-hover', `${themeAccent}20`);
      el.style.setProperty('--card-glow', `${themeAccent}50`);
      el.style.setProperty('--card-inset', `${themeAccent}15`);
      el.style.setProperty('--card-inset-hover', `${themeAccent}25`);
    } else {
      el.style.removeProperty('--theme-accent');
      el.style.setProperty('--border-default', 'rgba(255,255,255,0.08)');
      el.style.setProperty('--border-hover', 'rgba(255,255,255,0.15)');
      el.style.setProperty('--border-bright', 'rgba(255,255,255,0.2)');
      ['--shimmer-color','--shimmer-color-bright','--card-outline','--card-outline-hover','--card-glow','--card-inset','--card-inset-hover'].forEach(v => el.style.removeProperty(v));
    }
  }, [themeAccent]);

  const headerControlBg = { backgroundColor: 'rgba(15, 20, 28, 0.9)' };

  return (
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
      <KuroStyles oledMode={visualSettings.oledMode} />

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      
      {/* P12-FIX: Skip to content link for keyboard users (Step 11 audit - MEDIUM-6n) */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-yellow-500 focus:text-black focus:rounded-lg focus:font-bold focus:text-sm">
        Skip to content
      </a>
      
      {/* Offline banner handled by PWAProvider */}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{borderColor: activeTheme ? `${themeAccent}30` : 'var(--border-medium)', backgroundColor: visualSettings.oledMode ? 'rgba(0, 0, 0, 0.98)' : 'rgba(8, 12, 18, 0.92)', backdropFilter: 'blur(20px)', paddingTop: 'env(safe-area-inset-top, 0px)', position: 'sticky', overflow: 'hidden'}}>
        {/* Theme banner art background */}
        {activeTheme && (
          <>
            <img src={activeTheme.bannerArt} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.8, pointerEvents: 'none' }} loading="eager" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${themeAccent}15 0%, rgba(8,12,20,0.6) 60%, rgba(8,12,20,0.9) 100%)`, pointerEvents: 'none' }} aria-hidden="true" />
          </>
        )}
        <div className="header-inner max-w-lg md:max-w-2xl lg:max-w-none mx-auto px-3 relative z-10">
          <div className="header-top flex items-center justify-between py-1.5">
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
                <div className="absolute inset-0 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" style={{ background: activeTheme ? `linear-gradient(135deg, ${themeAccent}, ${themeAccent}80)` : 'linear-gradient(135deg, #facc15, #f97316)' }} aria-hidden="true" />
                <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg group-hover:scale-[1.02] transition-transform">
                  <img src={HEADER_ICON} alt="Whispering Wishes logo" className="w-full h-full object-cover" />
                </div>
                {pwa?.canInstall && (
                  <div className="absolute - bottom-0.5 - right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-md" style={{ background: themeAccent || '#eab308' }} aria-hidden="true">
                    <Download size={9} className="text-black" />
                  </div>
                )}
              </div>
              <div style={activeTheme ? { background: 'rgba(15,20,28,0.3)', borderRadius: '12px', padding: '6px 12px' } : undefined}>
                <h1 className="text-white font-semibold text-sm tracking-wide">Whispering Wishes</h1>
                <p className="text-[10px] tracking-wider uppercase" style={{ color: activeTheme ? themeAccent : 'rgba(250,204,21,0.5)' }}>Wuthering Waves - Companion</p>
              </div>
            </div>
            <div className="header-controls flex items-center gap-1.5">
              <button onClick={() => setShowServerDropdown(true)} aria-label="Select server region" className="text-gray-300 text-[10px] px-2.5 py-1.5 rounded-lg focus:outline-none transition-all min-h-[44px] flex items-center gap-1.5" style={activeTheme ? { background: 'rgba(15,20,28,0.3)', borderRadius: '12px' } : { ...headerControlBg, border: `1px solid var(--border-medium)`, borderRadius: '8px' }}>
                {state.server} <ChevronDown size={10} />
              </button>
              <button onClick={handleExport} aria-label="Export backup" title="Export backup" className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-400 active:scale-95 transition-all" style={activeTheme ? { background: 'rgba(15,20,28,0.3)', borderRadius: '12px' } : { ...headerControlBg, border: `1px solid var(--border-medium)`, borderRadius: '8px' }}>
                <Download size={14} />
              </button>
            </div>
          </div>
          <nav ref={tabNavRef} className="relative flex justify-between - mb-px overflow-x-auto scrollbar-hide pb-1" style={{ maskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent)', WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent)' }} role="tablist" aria-label="Main navigation" onKeyDown={(e) => {
              const tabs = ['tracker','events','planner','calculator','analytics','teams','gathering','profile'];
              const idx = tabs.indexOf(activeTab);
              let newTab;
              if (e.key === 'ArrowRight') { e.preventDefault(); newTab = tabs[(idx + 1) % tabs.length]; }
              else if (e.key === 'ArrowLeft') { e.preventDefault(); newTab = tabs[(idx - 1 + tabs.length) % tabs.length]; }
              if (newTab) { setActiveTab(newTab); setTimeout(() => document.getElementById(`tab-${newTab}`)?.focus(), 0); }
            }}>
            <div className="tab-indicator" />
            <TabButton active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')} tabRef={tabNavRef} tabId="tracker" accentColor={themeAccent}><Sparkles size={16} /> Tracker</TabButton>
            <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} tabRef={tabNavRef} tabId="events" accentColor={themeAccent}><Calendar size={16} /> Events</TabButton>
            <TabButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} tabRef={tabNavRef} tabId="planner" accentColor={themeAccent}><TrendingUp size={16} /> Plan</TabButton>
            <TabButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} tabRef={tabNavRef} tabId="calculator" accentColor={themeAccent}><Calculator size={16} /> Calc</TabButton>
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} tabRef={tabNavRef} tabId="analytics" accentColor={themeAccent}><BarChart3 size={16} /> Stats</TabButton>
            <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} tabRef={tabNavRef} tabId="teams" accentColor={themeAccent}><Users size={16} /> Teams</TabButton>
            <TabButton active={activeTab === 'gathering'} onClick={() => setActiveTab('gathering')} tabRef={tabNavRef} tabId="gathering" accentColor={themeAccent}><Archive size={16} /> Collection</TabButton>
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} tabRef={tabNavRef} tabId="profile" accentColor={themeAccent}><User size={16} /> Profile</TabButton>
          </nav>
          {/* P15-FIX: LOW-9 - Visual swipe indicator when swipe navigation is enabled */}
          {visualSettings.swipeNavigation && <div className="swipe-hint text-center text-[10px] text-gray-500 py-0.5" aria-hidden="true">← swipe to navigate →</div>}
        </div>
      </header>

      <main id="main-content" className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-3 py-3 space-y-3 w-full" role="main">
        {/* Screen reader announcement for tab changes */}
        <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab active
        </div>
        
        {/* [SECTION:TAB-TRACKER] */}
        {activeTab === 'tracker' && (
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
        {activeTab === 'events' && (
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
        {activeTab === 'calculator' && (
          <TabErrorBoundary tabName="Calculator">
              <CalculatorTab state={state} dispatch={dispatch} />

          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-PLANNER] */}
        {activeTab === 'planner' && (
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
        {activeTab === 'analytics' && (
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
                getFirebaseAuth={getFirebaseAuth}
                firebaseUrl={firebaseUrl}
                firebaseFetch={firebaseFetch}
                fetchWithTimeout={fetchWithTimeout}
                hashUidForStorage={hashUidForStorage}
                checkFirebaseRateLimit={checkFirebaseRateLimit}
                FIREBASE_AVAILABLE={FIREBASE_AVAILABLE}
              />

          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-COLLECT] */}
        {activeTab === 'gathering' && (
          <TabErrorBoundary tabName="Collection">
              <CollectionTab
                state={state}
                collectionData={collectionData}
                collectionImages={collectionImages}
                visualSettings={visualSettings}
                setActiveTab={setActiveTab}
                setDetailModal={setDetailModal}
                framingMode={framingMode}
                editingImage={editingImage}
                setEditingImage={setEditingImage}
                activeBanners={activeBanners}
                withCacheBuster={withCacheBuster}
                getImageFraming={getImageFraming}
                refreshImages={refreshImages}
                handleSetProfilePic={handleSetProfilePic}
              />

          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-TEAMS] */}
        {activeTab === 'teams' && (
          <TabErrorBoundary tabName="Teams">
              <TeamsTab
                state={state}
                dispatch={dispatch}
                collectionImages={collectionImages}
                collectionData={collectionData}
                getImageFraming={getImageFraming}
                framingMode={framingMode}
                editingImage={editingImage}
                setEditingImage={setEditingImage}
                toast={toast}
                confirm={confirm}
              />

          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-PROFILE] */}
        {activeTab === 'profile' && (
          <TabErrorBoundary tabName="Profile">
              <ProfileTab
            state={state}
            dispatch={dispatch}
            visualSettings={visualSettings}
            saveVisualSettings={saveVisualSettings}
            toast={toast}
            confirm={confirm}
            pwa={pwa}
            imageFraming={imageFraming}
            getImageFraming={getImageFraming}
            saveImageFraming={saveImageFraming}
            editingImage={editingImage}
            setEditingImage={setEditingImage}
            framingMode={framingMode}
            setFramingMode={setFramingMode}
            miniPanelPosition={miniPanelPosition}
            saveMiniPanelPosition={saveMiniPanelPosition}
            getMiniPanelPositionClasses={getMiniPanelPositionClasses}
            updateEditingFraming={updateEditingFraming}
            resetEditingFraming={resetEditingFraming}
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
            getFirebaseAuth={getFirebaseAuth}
            firebaseUrl={firebaseUrl}
            firebaseFetch={firebaseFetch}
            setActiveTab={setActiveTab}
            withCacheBuster={withCacheBuster}
            showAdminPanel={showAdminPanel}
            setShowAdminPanel={setShowAdminPanel}
            adminMiniMode={adminMiniMode}
            setAdminMiniMode={setAdminMiniMode}
            googleUser={googleUser}
            handleGoogleSignIn={handleGoogleSignIn}
            handleGoogleSignOut={handleGoogleSignOut}
            handleCloudBackup={handleCloudBackup}
            handleCloudRestore={handleCloudRestore}
            handleCloudDelete={handleCloudDelete}
            cloudBackupStatus={cloudBackupStatus}
          />

          </TabErrorBoundary>
        )}

      </main>

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
              <button onClick={() => { setRestoreText(''); setShowExportModal(false); }} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all" aria-label="Close export modal"><X size={16} /></button>
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
                <span className="absolute left-1/2 - translate-x-1/2 - translate-y-1/2 bg-neutral-900 px-2 text-[10px] text-gray-400 uppercase tracking-wider">Restore</span>
              </div>
              
              <p className="text-gray-400 text-[10px]">Paste backup data to restore:</p>
              <textarea
                value={restoreText}
                onChange={(e) => setRestoreText(e.target.value)}
                placeholder="Paste backup JSON here…"
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
                  className="kuro-btn w-full text-[10px] mt-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
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
          getImageFraming={getImageFraming}
          framingMode={framingMode}
          editingImage={editingImage}
          setEditingImage={setEditingImage}
          onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null, framing: null })}
          onViewInTeams={() => { setDetailModal({ show: false, type: null, name: null, imageUrl: null, framing: null }); setActiveTab('teams'); }}
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
