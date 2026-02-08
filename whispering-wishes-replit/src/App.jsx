import React, { useState, useMemo, useCallback, useReducer, useEffect, useRef, createContext, useContext, memo } from 'react';
import { Sparkles, Swords, Sword, Star, Calculator, User, Calendar, TrendingUp, Upload, Download, RefreshCcw, Plus, Minus, Check, Target, BarChart3, Zap, BookmarkPlus, X, ChevronDown, LayoutGrid, Archive, Info, CheckCircle, AlertCircle, Settings, Monitor, Smartphone, Gamepad2, Crown, Trophy, Award, Flame, Diamond, Gift, Heart, Shield, TrendingDown, Fish, Clover, Lock, Search, ClipboardList } from 'lucide-react';
import { XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES v3.1.0 - Wuthering Waves Convene Companion
// ═══════════════════════════════════════════════════════════════════════════════
//
// [SECTION INDEX] - Use: grep -n "SECTION:" filename.jsx
// ─────────────────────────────────────────────────────────────────────────────
// [SECTION:PWA]          - PWA manifest, service worker, install prompt
// [SECTION:TOAST]        - Toast notification system
// [SECTION:ONBOARDING]   - Onboarding modal
// [SECTION:LUCK]         - Luck rating calculation
// [SECTION:STYLES]       - KuroStyles CSS
// [SECTION:SERVERS]      - Server/region data
// [SECTION:BANNERS]      - Current banner data
// [SECTION:HISTORY]      - Banner history archive
// [SECTION:CHARACTER_DATA] - Character database
// [SECTION:WEAPON_DATA]  - Weapon database
// [SECTION:EVENTS]       - Time-gated events data
// [SECTION:CONSTANTS]    - Game constants (pity, rates)
// [SECTION:TIME]         - Time utilities
// [SECTION:SIMULATION]   - Gacha simulation
// [SECTION:STATE]        - State management & reducer
// [SECTION:CALCULATIONS] - Pull calculations
// [SECTION:COMPONENTS]   - Reusable UI components (Card, PityRing, etc.)
// [SECTION:BACKGROUND]   - BackgroundGlow & TriangleMirrorWave
// [SECTION:COLLECTION-GRID] - Collection grid card component
// [SECTION:STATIC_DATA]  - Static collection data (images, release orders)
// [SECTION:MAINAPP]      - Main app component
// [SECTION:EXPORT]       - Main export
// ─────────────────────────────────────────────────────────────────────────────

// [SECTION:PWA]
// PWA Support - Manifest, Service Worker, Install Prompt

const APP_VERSION = '3.1.1'; // P7: MEDIUM/LOW issues & final polish
const MAX_IMPORT_SIZE_MB = 5; // P7-FIX: Import file size limit constant (7E)

// Header icon (uploaded app icon)
const HEADER_ICON = 'data:image/png;base64,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';

// Haptic feedback utility — fails silently on unsupported devices
const haptic = {
  light: () => { try { navigator?.vibrate?.(10); } catch {} },
  medium: () => { try { navigator?.vibrate?.(25); } catch {} },
  heavy: () => { try { navigator?.vibrate?.(50); } catch {} },
  success: () => { try { navigator?.vibrate?.([15, 50, 15]); } catch {} },
  warning: () => { try { navigator?.vibrate?.([30, 30, 30]); } catch {} },
  error: () => { try { navigator?.vibrate?.([50, 50, 80]); } catch {} },
};

const PWA_MANIFEST = {
  name: 'Whispering Wishes',
  short_name: 'Whispering Wishes',
  description: 'Wuthering Waves Convene Companion - Track pulls, plan resources, analyze luck',
  start_url: '/',
  display: 'standalone',
  background_color: '#0a0a0a',
  theme_color: '#fbbf24',
  orientation: 'portrait-primary',
  icons: [
    { src: HEADER_ICON, sizes: '64x64', type: 'image/png', purpose: 'any' }
  ], // Also populated dynamically in setupPWA with proper sized icons
  categories: ['games', 'utilities'],
  screenshots: [],
  shortcuts: [
    { name: 'Tracker', url: '/?tab=tracker', description: 'View pity tracker' },
    { name: 'Calculator', url: '/?tab=calculator', description: 'Calculate probabilities' },
    { name: 'Collection', url: '/?tab=gathering', description: 'View your collection' }
  ]
};

// Service Worker code as string (will be registered as blob)
const SERVICE_WORKER_CODE = `
const APP_CACHE = 'ww-app-v${APP_VERSION}';
const IMG_CACHE = 'ww-images-v${APP_VERSION}';
const CDN_CACHE = 'ww-cdn-v${APP_VERSION}';
const MAX_IMG_ENTRIES = 250;

// Core app shell to precache
const PRECACHE = ['/', '/index.html'];

// CDN domains — cache-first (these rarely change)
const CDN_DOMAINS = ['cdnjs.cloudflare.com', 'unpkg.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

// Image domains — stale-while-revalidate
const IMG_DOMAINS = ['i.ibb.co', 'i.imgur.com', 'ibb.co'];

// Install — precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate — purge old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [APP_CACHE, IMG_CACHE, CDN_CACHE];
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => !currentCaches.includes(n)).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Trim image cache to MAX_IMG_ENTRIES (LRU by insertion order)
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await Promise.all(keys.slice(0, keys.length - maxEntries).map(k => cache.delete(k)));
  }
}

// Strategy: Cache-first (for CDN assets)
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

// Strategy: Stale-while-revalidate (for images)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
      trimCache(cacheName, MAX_IMG_ENTRIES);
    }
    return response;
  }).catch(() => cached || new Response('', { status: 503 }));
  
  return cached || fetchPromise;
}

// Strategy: Network-first with cache fallback (for app/API)
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    return new Response('Offline', { status: 503 });
  }
}

// Fetch router — pick strategy by domain/type
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  
  const url = new URL(event.request.url);
  
  // CDN assets → cache-first
  if (CDN_DOMAINS.some(d => url.hostname.includes(d))) {
    event.respondWith(cacheFirst(event.request, CDN_CACHE));
    return;
  }
  
  // Images → stale-while-revalidate
  if (IMG_DOMAINS.some(d => url.hostname.includes(d)) || /\\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request, IMG_CACHE));
    return;
  }
  
  // Everything else → network-first
  event.respondWith(networkFirst(event.request, APP_CACHE));
});

// Handle messages
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
  if (event.data === 'clearImageCache') {
    caches.delete(IMG_CACHE).then(() => {
      event.source?.postMessage('imageCacheCleared');
    });
  }
});
`;

// PWA Provider Component
const PWAProvider = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  useEffect(() => {
    // Check if already installed (PWA or iOS standalone)
    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true) {
      setIsInstalled(true);
    }
    
    // Listen for install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Manifest is injected by WhisperingWishesInner (with proper icon setup)
    // Only inject meta tags here
    
    // Add meta tags for PWA
    const metaTags = [
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Whispering Wishes' },
      { name: 'theme-color', content: '#fbbf24' },
      { name: 'msapplication-TileColor', content: '#fbbf24' },
      { name: 'msapplication-navbutton-color', content: '#fbbf24' }
    ];
    
    metaTags.forEach(({ name, content }) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        meta.setAttribute('data-ww', 'true');
        document.head.appendChild(meta);
      }
    });
    
    // Register service worker (blob URLs only work in Chromium browsers)
    // Firefox/Safari require a real SW file — app still functions without SW
    if ('serviceWorker' in navigator) {
      try {
        const swBlob = new Blob([SERVICE_WORKER_CODE], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(swBlob);
        
        navigator.serviceWorker.register(swUrl, { scope: '/' })
          .then((registration) => {
            URL.revokeObjectURL(swUrl); // P7-FIX: Revoke blob URL after registration (7D)
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[WW] New version available');
                }
              });
            });
          })
          .catch((err) => {
            URL.revokeObjectURL(swUrl); // P7-FIX: Revoke blob URL on failure too (7D)
            // Blob URL service workers are not supported in Firefox/Safari
            console.info('[WW] Service worker not registered (blob URL not supported in this browser). App works fine without it.', err.message);
          });
      } catch (err) {
        // Service worker not critical — app works fine without it
        console.info('[WW] Service worker setup skipped:', err.message);
      }
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      // Clean up only our injected DOM elements
      metaTags.forEach(({ name }) => {
        const el = document.querySelector(`meta[name="${name}"][data-ww="true"]`);
        if (el) el.remove();
      });
    };
  }, []);
  
  // Expose install function
  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setInstallPrompt(null);
    return outcome === 'accepted';
  }, [installPrompt]);
  
  return (
    <>
      {children}
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[10000] bg-yellow-500 text-black text-center py-1 text-xs font-medium">
          ⚡ You're offline - Some features may be limited
        </div>
      )}
      {/* Install prompt banner */}
      {installPrompt && !isInstalled && (
        <div className="fixed bottom-20 left-3 right-3 z-[9998] bg-gradient-to-r from-yellow-500/90 to-amber-500/90 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-yellow-400/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center text-xl">✨</div>
            <div className="flex-1">
              <div className="text-black font-semibold text-sm">Install Whispering Wishes</div>
              <div className="text-black/70 text-xs">Add to home screen for the best experience</div>
            </div>
            <button
              onClick={promptInstall}
              className="px-3 py-1.5 bg-black text-yellow-400 rounded-lg text-xs font-medium hover:bg-black/80 transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setInstallPrompt(null)}
              className="p-1 text-black/50 hover:text-black transition-colors" aria-label="Dismiss install prompt"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// [SECTION:TOAST]

const ToastContext = createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    // Haptic feedback per toast type
    if (type === 'success') haptic.success();
    else if (type === 'error') haptic.error();
    else if (type === 'warning') haptic.warning();
    else haptic.light();
  }, []);
  
  const contextValue = useMemo(() => ({ addToast }), [addToast]);
  
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-24 left-3 right-3 z-[9999] flex flex-col gap-2 pointer-events-none" role="status" aria-live="polite" aria-atomic="true">
        {toasts.map(toast => (
          <div key={toast.id} className="px-4 py-3 rounded-lg flex items-center gap-2 text-xs font-medium pointer-events-auto text-white border border-white/20" style={{
            animation: 'slideUp 0.2s ease-out',
            background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : toast.type === 'error' ? 'rgba(239,68,68,0.9)' : toast.type === 'warning' ? 'rgba(245,158,11,0.9)' : 'rgba(59,130,246,0.9)',
          }}>
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'warning' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

// [SECTION:A11Y_HOOKS] - Accessibility hooks for modal focus trapping & escape key
const useFocusTrap = (isOpen) => {
  const ref = useRef(null);
  const previousFocusRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement;
    const el = ref.current;
    if (!el) return;
    const focusable = () => el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const timer = setTimeout(() => { const f = focusable(); if (f.length) f[0].focus(); }, 50);
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const nodes = focusable();
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    };
    el.addEventListener('keydown', handleKeyDown);
    return () => { clearTimeout(timer); el.removeEventListener('keydown', handleKeyDown); if (previousFocusRef.current?.focus) previousFocusRef.current.focus(); };
  }, [isOpen]);
  return ref;
};
const useEscapeKey = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);
};

// [SECTION:ONBOARDING]
const OnboardingModal = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Welcome to Whispering Wishes!", icon: <Sparkles size={32} />, desc: "Your companion for Wuthering Waves Convene planning.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20', color: '#fbbf24' },
    { title: "Import Your History", icon: <Upload size={32} />, desc: "Go to the Profile tab and import data from wuwatracker.com.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30', border: 'border-cyan-500/30', bg: 'bg-cyan-500/20', color: '#22d3ee' },
    { title: "Track Your Banners", icon: <Target size={32} />, desc: "View current banners, pity progress, and time remaining.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-orange-900/30', border: 'border-orange-500/30', bg: 'bg-orange-500/20', color: '#fb923c' },
    { title: "Build Your Collection", icon: <LayoutGrid size={32} />, desc: "Track all your Resonators and weapons.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-purple-900/30', border: 'border-purple-500/30', bg: 'bg-purple-500/20', color: '#a855f7' },
    { title: "Calculate Your Odds", icon: <Calculator size={32} />, desc: "See your chances based on pity and resources.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-emerald-900/30', border: 'border-emerald-500/30', bg: 'bg-emerald-500/20', color: '#34d399' },
    { title: "View Analytics", icon: <BarChart3 size={32} />, desc: "Check your luck rating, charts, and Convene history.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30', border: 'border-pink-500/30', bg: 'bg-pink-500/20', color: '#f472b6' },
    { title: "You're Ready!", icon: <CheckCircle size={32} />, desc: "Good luck on your Convenes, Rover!", gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20', color: '#fbbf24' }
  ];
  
  const s = steps[step];
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/90" role="dialog" aria-modal="true" aria-label="Welcome to Whispering Wishes">
      <div className={`relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-r ${s.gradient} w-full max-w-xs`} style={{ backgroundColor: 'rgba(12, 16, 24, 0.12)', backdropFilter: 'blur(6px)', zIndex: 5 }}>
        {/* Decorative gradient circles */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full ${s.bg} blur-2xl opacity-40`} />
          <div className={`absolute right-12 top-1/4 w-10 h-10 rounded-full ${s.bg} blur-xl opacity-25`} />
        </div>
        
        {/* Skip button - always white */}
        <button onClick={onComplete} className="absolute top-3 right-3 z-20 text-[11px] min-h-[44px] min-w-[44px] px-3 py-2 rounded text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center" style={{background:'rgba(255,255,255,0.05)'}}>Skip</button>
        
        {/* Content */}
        <div className="relative z-10 p-5 pt-8 text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${s.bg} border ${s.border} mb-3`} style={{color: s.color}}>
            {s.icon}
          </div>
          <h4 className="font-bold text-sm text-gray-200 mb-1">{s.title}</h4>
          <p className="text-gray-500 text-[10px]">{s.desc}</p>
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 pb-3">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === step ? s.bg : 'bg-white/10'}`} style={{ width: i === step ? '14px' : '5px' }} />
          ))}
        </div>
        
        {/* Navigation */}
        <div className="p-3 flex justify-between items-center" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
          <div className="w-12">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="text-[11px] min-h-[44px] px-4 py-2 rounded text-gray-400 hover:text-gray-300 transition-colors" style={{background:'rgba(255,255,255,0.05)'}}>Back</button>
            )}
          </div>
          <div>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="text-[11px] min-h-[44px] px-4 py-2 rounded text-gray-400 hover:text-gray-300 transition-colors" style={{background:'rgba(255,255,255,0.05)'}}>Next</button>
            ) : (
              <button onClick={onComplete} className="text-[11px] min-h-[44px] px-4 py-2 rounded border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 font-medium">Get Started</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// [SECTION:LUCK]
// Luck rating: maps average pity to a percentile using a normal distribution.
// Source assumptions: community-estimated mean ~62.5 pulls per 5★, std dev ~12.
// If Kuro publishes official rates that differ, these constants should be updated.
const LUCK_MEAN_PITY = 62.5;
const LUCK_STD_DEV = 12;

const calculateLuckRating = (avgPity) => {
  if (!avgPity || avgPity === '—') return null;
  const avg = parseFloat(avgPity);
  if (isNaN(avg) || avg <= 0) return null;
  
  // Inverted: lower avg pity = luckier = higher z-score/percentile
  const zScore = (LUCK_MEAN_PITY - avg) / LUCK_STD_DEV;
  
  // Abramowitz & Stegun approximation of normal CDF (accurate to ±0.0005)
  const absZ = Math.abs(zScore);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989422804014327; // 1/√(2π)
  const p = d * Math.exp(-absZ * absZ / 2) * (t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))));
  const cdf = zScore >= 0 ? 1 - p : p;
  const percentile = Math.min(99, Math.max(1, Math.round(cdf * 100)));
  
  // WuWa-themed rank names (5 tiers for better distribution)
  if (percentile >= 90) return { rating: 'Arbiter', color: '#fbbf24', tier: 'S+', percentile };
  if (percentile >= 70) return { rating: 'Sentinel', color: '#a855f7', tier: 'S', percentile };
  if (percentile >= 40) return { rating: 'Resonator', color: '#3b82f6', tier: 'A', percentile };
  if (percentile >= 20) return { rating: 'Drifter', color: '#6b7280', tier: 'B', percentile };
  return { rating: 'Civilian', color: '#ef4444', tier: 'C', percentile };
};

// [SECTION:STYLES]
const KuroStyles = ({ oledMode }) => (
  <style>{`
    /* ══════════════════════════════════════════════════════════════════════
       LAHAI-ROI DESIGN LANGUAGE - Black, White, Gold
       ══════════════════════════════════════════════════════════════════════ */
    
    /* Global - prevent white flash, hide scrollbars on mobile */
    html, body {
      background: ${oledMode ? '#000000' : '#0a0a0a'};
      margin: 0;
      padding: 0;
      overscroll-behavior: none;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      display: none;
    }
    
    /* ═══ CSS CUSTOM PROPERTIES ═══ */
    :root {
      --color-gold: 251, 191, 36;
      --color-pink: 236, 72, 153;
      --color-cyan: 56, 189, 248;
      --color-purple: 168, 85, 247;
      --color-emerald: 34, 197, 94;
      --color-red: 248, 113, 113;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
      --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
      --shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.6);
      --transition-fast: 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      --transition-normal: 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      --transition-slow: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      /* Z-index scale: bg(1-2) → cards(5) → card-chrome(10) → modals(100) → floating-ui(9999) → system(10000) */
      --text-body: #e2e8f0;
      --text-heading: #f1f5f9;
      --bg-card: ${oledMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(12, 16, 24, 0.55)'};
      --bg-card-inner: ${oledMode ? 'rgba(5, 5, 5, 1)' : 'rgba(6, 10, 18, 1)'};
      --bg-btn: ${oledMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(15, 20, 28, 0.85)'};
      --bg-input: ${oledMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(15, 20, 28, 0.9)'};
      --bg-stat: ${oledMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(10, 14, 22, 0.8)'};
    }
    
    /* Hide scrollbar on specific horizontal scroll containers */
    .scrollbar-hide,
    nav {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .scrollbar-hide::-webkit-scrollbar,
    nav::-webkit-scrollbar {
      display: none;
    }
    
    /* Thin subtle scrollbar for vertical scroll containers */
    .overflow-y-auto {
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.15) transparent;
    }
    .overflow-y-auto::-webkit-scrollbar {
      width: 3px;
    }
    .overflow-y-auto::-webkit-scrollbar-track {
      background: transparent;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.15);
      border-radius: 3px;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.25);
    }
    
    /* ═══ IMPROVED FOCUS STATES ═══ */
    *:focus-visible {
      outline: 2px solid rgba(var(--color-gold), 0.7);
      outline-offset: 2px;
    }
    
    button:focus-visible, 
    select:focus-visible, 
    input:focus-visible, 
    textarea:focus-visible {
      outline: 2px solid rgba(var(--color-gold), 0.8);
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(var(--color-gold), 0.15);
    }
    
    /* ═══ TOUCH OPTIMIZATION ═══ */
    button, select, input, textarea, a, [role="tab"] {
      touch-action: manipulation;
    }
    
    /* Ensure minimum 44px touch targets for filter selects on touch devices */
    @media (pointer: coarse) {
      .kuro-body select {
        min-height: 44px;
      }
    }
    
    .kuro-calc {
      position: relative;
      color: var(--text-body);
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes borderGlow {
      0%, 100% { border-color: rgba(251, 191, 36, 0.3); }
      50% { border-color: rgba(251, 191, 36, 0.6); }
    }
    
    @keyframes pulseScale {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    
    /* ═══ TAB CONTENT TRANSITIONS ═══ */
    /* NOTE: Negative margins must match parent's horizontal padding (0.75rem / 12px).
       If parent padding changes, update these values together. */
    .tab-content {
      animation: tabFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      margin-left: -0.75rem;
      margin-right: -0.75rem;
      padding: 0.75rem;
    }
    
    @keyframes tabFadeIn {
      from { 
        opacity: 0; 
        transform: translateY(8px);
      }
      to { 
        opacity: 1; 
        transform: translateY(0);
      }
    }
    
    /* Stagger animation for child cards */
    .tab-content > .kuro-card,
    .tab-content > div > .kuro-card {
      animation: cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
    }
    .tab-content > .kuro-card:nth-child(1),
    .tab-content > div > .kuro-card:nth-child(1) { animation-delay: 0.05s; }
    .tab-content > .kuro-card:nth-child(2),
    .tab-content > div > .kuro-card:nth-child(2) { animation-delay: 0.1s; }
    .tab-content > .kuro-card:nth-child(3),
    .tab-content > div > .kuro-card:nth-child(3) { animation-delay: 0.15s; }
    .tab-content > .kuro-card:nth-child(4),
    .tab-content > div > .kuro-card:nth-child(4) { animation-delay: 0.2s; }
    
    @keyframes cardSlideIn {
      from { 
        opacity: 0; 
        transform: translateY(12px) scale(0.98);
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1);
      }
    }
    
    /* Glow effect for 5-star items */
    .glow-gold {
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.15), 0 4px 12px rgba(0,0,0,0.3);
    }
    
    @media (hover: hover) {
      .glow-gold:hover {
        box-shadow: 0 0 30px rgba(251, 191, 36, 0.25), 0 8px 20px rgba(0,0,0,0.4);
      }
    }
    
    .glow-purple {
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.15), 0 4px 12px rgba(0,0,0,0.3);
    }
    
    @media (hover: hover) {
      .glow-purple:hover {
        box-shadow: 0 0 30px rgba(168, 85, 247, 0.25), 0 8px 20px rgba(0,0,0,0.4);
      }
    }
    
    /* ═══ PREMIUM VISUAL EFFECTS ═══ */
    /* Pulse animation for important elements */
    .pulse-subtle {
      animation: pulseScale 2s ease-in-out infinite;
    }
    
    /* ═══ PITY RING ═══ */
    .pity-ring-track {
      fill: none;
      stroke: rgba(255,255,255,0.06);
    }
    .pity-ring-fill {
      fill: none;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      filter: drop-shadow(0 0 4px var(--ring-glow));
    }
    .pity-ring-text {
      font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
      font-weight: 700;
      fill: currentColor;
      text-anchor: middle;
      dominant-baseline: central;
    }
    
    /* ═══ LUCK BADGE ═══ */
    .luck-badge {
      position: relative;
      overflow: hidden;
      padding: 1.5px;
    }
    .luck-badge::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: conic-gradient(from 0deg, var(--badge-color), transparent 50%, var(--badge-color));
      animation: badgeRotate 8s linear infinite;
      opacity: 0.9;
      filter: blur(3px);
    }
    @keyframes badgeRotate {
      to { transform: rotate(360deg); }
    }
    .luck-badge-inner {
      position: relative;
      z-index: 1;
      background: rgba(6, 10, 18, 1);
      border-radius: inherit;
    }
    
    /* ═══ TROPHY BADGE ═══ */
    @keyframes trophyShine {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    
    .trophy-badge {
      animation: trophyShine 3s ease-in-out infinite;
    }
    
    /* ═══ PULL LOG BORDER ═══ */
    .pull-log-row {
      border-left: 3px solid var(--pity-color);
      transition: background 0.2s ease;
    }
    @media (hover: hover) {
      .pull-log-row:hover {
        background: rgba(255,255,255,0.08) !important;
      }
    }
    
    /* ═══ TAB SLIDING INDICATOR ═══ */
    .tab-indicator {
      position: absolute;
      bottom: 0;
      height: 2px;
      border-radius: 1px;
      transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    /* ═══ CARD SYSTEM - Glassy gradient with ambient glow ═══ */
    .kuro-card {
      position: relative;
      z-index: 5;
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      overflow: visible;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      box-shadow: 
        0 4px 24px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.03),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    @media (hover: hover) {
      .kuro-card:hover {
        border-color: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.6),
          0 0 0 1px rgba(255, 255, 255, 0.06),
          0 0 40px rgba(var(--color-gold), 0.03),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }
    }
    
    /* Interactive card variant */
    .kuro-card.interactive {
      cursor: pointer;
    }
    .kuro-card.interactive:active {
      transform: translateY(0) scale(0.98);
      transition: transform 0.1s ease;
    }
    
    /* Top shimmer line */
    .kuro-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.3) 20%,
        rgba(255, 255, 255, 0.5) 50%,
        rgba(255, 255, 255, 0.3) 80%,
        transparent 100%
      );
      animation: shimmer 3s ease-in-out infinite;
      z-index: 1;
    }
    
    @keyframes shimmer {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    
    .kuro-card-inner {
      position: relative;
      overflow: hidden;
      border-radius: 15px;
    }
    
    /* Corner decorations - more subtle */
    .kuro-card-inner::before {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 12px;
      height: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0 4px 0 0;
      z-index: 2;
      opacity: 0.7;
    }
    
    .kuro-card-inner::after {
      content: '';
      position: absolute;
      bottom: 8px;
      left: 8px;
      width: 12px;
      height: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0 0 0 4px;
      z-index: 2;
      opacity: 0.7;
    }
    
    .kuro-header {
      position: relative;
      padding: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.02) 100%);
    }
    
    .kuro-header-action {
      position: relative;
      z-index: 10;
    }
    
    /* Utility class for content layering above backgrounds */
    .content-layer {
      position: relative;
      z-index: 5;
    }
    
    .kuro-header h3 {
      color: var(--text-heading);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      gap: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    
    /* Header icon decoration - gradient accent */
    .kuro-header h3::before {
      content: '';
      width: 3px;
      height: 16px;
      background: linear-gradient(180deg, rgba(251, 191, 36, 0.9), rgba(251, 191, 36, 0.4));
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
    }
    
    .kuro-body {
      padding: 14px;
      color: var(--text-body);
    }
    
    /* ═══ BUTTONS - Glassy style with bright text ═══ */
    .kuro-btn {
      position: relative;
      background: var(--bg-btn);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 10px 12px;
      color: var(--text-heading);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: transform var(--transition-normal), background var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal), color var(--transition-fast);
      text-align: center;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    /* Ripple container */
    .kuro-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%);
      opacity: 0;
      transition: opacity var(--transition-normal);
      pointer-events: none;
    }
    
    @media (hover: hover) {
      .kuro-btn:hover {
        border-color: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }
      
      .kuro-btn:hover::before {
        opacity: 1;
      }
    }
    
    .kuro-btn:active {
      transform: translateY(0) scale(0.97);
      transition: transform 0.1s ease;
    }
    
    /* Active states with glassy glow */
    .kuro-btn.active-gold {
      background: rgba(251, 191, 36, 0.15);
      border-color: rgba(251, 191, 36, 0.7);
      color: #fef08a;
      box-shadow: 0 0 25px rgba(251, 191, 36, 0.3), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 20px rgba(251, 191, 36, 0.08);
      text-shadow: 0 0 12px rgba(251, 191, 36, 0.6);
      animation: borderGlow 2s ease-in-out infinite;
    }
    
    .kuro-btn.active-pink {
      background: rgba(236, 72, 153, 0.15);
      border-color: rgba(236, 72, 153, 0.7);
      color: #fbcfe8;
      box-shadow: 0 0 25px rgba(236, 72, 153, 0.3), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 20px rgba(236, 72, 153, 0.08);
      text-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
    }
    
    /* Blue for Standard banners */
    .kuro-btn.active-cyan {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.7);
      color: #bae6fd;
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.3), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 20px rgba(56, 189, 248, 0.08);
      text-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
    }
    
    .kuro-btn.active-purple {
      background: rgba(168, 85, 247, 0.15);
      border-color: rgba(168, 85, 247, 0.7);
      color: #e9d5ff;
      box-shadow: 0 0 25px rgba(168, 85, 247, 0.3), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 20px rgba(168, 85, 247, 0.08);
      text-shadow: 0 0 12px rgba(168, 85, 247, 0.6);
    }
    
    /* Muted green for Both options */
    .kuro-btn.active-emerald {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.7);
      color: #86efac;
      box-shadow: 0 0 25px rgba(34, 197, 94, 0.25), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 20px rgba(34, 197, 94, 0.08);
      text-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
    }
    
    .kuro-btn.active-orange {
      background: rgba(251, 146, 60, 0.15);
      border-color: rgba(251, 146, 60, 0.7);
      color: #fed7aa;
      box-shadow: 0 0 25px rgba(251, 146, 60, 0.3), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 20px rgba(251, 146, 60, 0.08);
      text-shadow: 0 0 12px rgba(251, 146, 60, 0.6);
    }
    
    /* Red for 50/50 */
    .kuro-btn.active-red {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.8);
      color: #fecaca;
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.35), inset 0 0 20px rgba(239, 68, 68, 0.1);
      text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
    }
    
    /* ═══ INPUTS - Glassy style ═══ */
    .kuro-input {
      background: rgba(8, 12, 18, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 10px 12px;
      color: #ffffff;
      font-size: 14px;
      width: 100%;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    @media (hover: hover) {
      .kuro-input:hover {
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(12, 16, 24, 0.85);
      }
    }
    
    .kuro-input:focus-visible {
      outline: none;
      border-color: rgba(var(--color-gold), 0.6);
      box-shadow: 0 0 0 3px rgba(var(--color-gold), 0.1), 0 0 20px rgba(var(--color-gold), 0.08);
      background: rgba(15, 20, 28, 0.9);
    }
    
    .kuro-input:focus {
      outline: none;
    }
    
    .kuro-input::placeholder {
      color: #6b7280;
      transition: color var(--transition-fast);
    }
    
    .kuro-input:focus::placeholder {
      color: #9ca3af;
    }
    
    .kuro-input-sm {
      padding: 4px 8px;
      font-size: 12px;
      width: 56px;
      text-align: center;
    }
    
    /* ═══ PITY DISPLAY ═══ */
    /* PityRing uses inline SVG styles */
    /* ═══ STAT BOXES - Glassy holographic style ═══ */
    .kuro-stat {
      position: relative;
      background: var(--bg-stat);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 14px;
      text-align: center;
      overflow: hidden;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
    }
    
    @media (hover: hover) {
      .kuro-stat:hover {
        transform: translateY(-1px);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }
    }
    
    .kuro-stat::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    }
    
    .kuro-stat-gold {
      background: rgba(251, 191, 36, 0.15);
      border-color: rgba(251, 191, 36, 0.5);
    }
    .kuro-stat-gold::before {
      background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 1), transparent);
    }
    
    .kuro-stat-cyan {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.5);
    }
    .kuro-stat-cyan::before {
      background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 1), transparent);
    }
    
    .kuro-stat-purple {
      background: rgba(168, 85, 247, 0.15);
      border-color: rgba(168, 85, 247, 0.5);
    }
    .kuro-stat-purple::before {
      background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 1), transparent);
    }
    
    .kuro-stat-emerald {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.5);
    }
    .kuro-stat-emerald::before {
      background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 1), transparent);
    }
    
    .kuro-stat-red {
      background: rgba(248, 113, 113, 0.15);
      border-color: rgba(248, 113, 113, 0.5);
    }
    .kuro-stat-red::before {
      background: linear-gradient(90deg, transparent, rgba(248, 113, 113, 1), transparent);
    }
    
    /* ═══ STAT PINK (NEW) ═══ */
    .kuro-stat-pink {
      background: rgba(236, 72, 153, 0.15);
      border-color: rgba(236, 72, 153, 0.5);
    }
    .kuro-stat-pink::before {
      background: linear-gradient(90deg, transparent, rgba(236, 72, 153, 1), transparent);
    }
    
    /* ═══ STAT GRAY ═══ */
    .kuro-stat-gray {
      background: rgba(107, 114, 128, 0.15);
      border-color: rgba(107, 114, 128, 0.5);
    }
    .kuro-stat-gray::before {
      background: linear-gradient(90deg, transparent, rgba(107, 114, 128, 1), transparent);
    }
    
    @media (hover: hover) {
      .kuro-stat-gold:hover {
        border-color: rgba(251, 191, 36, 0.7);
        box-shadow: 0 4px 20px rgba(251, 191, 36, 0.15);
      }
      .kuro-stat-cyan:hover {
        border-color: rgba(56, 189, 248, 0.7);
        box-shadow: 0 4px 20px rgba(56, 189, 248, 0.15);
      }
      .kuro-stat-purple:hover {
        border-color: rgba(168, 85, 247, 0.7);
        box-shadow: 0 4px 20px rgba(168, 85, 247, 0.15);
      }
      .kuro-stat-emerald:hover {
        border-color: rgba(34, 197, 94, 0.7);
        box-shadow: 0 4px 20px rgba(34, 197, 94, 0.15);
      }
      .kuro-stat-red:hover {
        border-color: rgba(248, 113, 113, 0.7);
        box-shadow: 0 4px 20px rgba(248, 113, 113, 0.15);
      }
      .kuro-stat-pink:hover {
        border-color: rgba(236, 72, 153, 0.7);
        box-shadow: 0 4px 20px rgba(236, 72, 153, 0.15);
      }
      .kuro-stat-gray:hover {
        border-color: rgba(107, 114, 128, 0.7);
        box-shadow: 0 4px 20px rgba(107, 114, 128, 0.15);
      }
    }
    
    /* ═══ LABELS - Bright for readability ═══ */
    .kuro-label {
      color: var(--text-body);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      margin-bottom: 6px;
      display: block;
    }
    
    /* ═══ RANGE SLIDER ═══ */
    .kuro-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.15);
      outline: none;
      margin: 8px 0;
    }
    
    .kuro-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f0c040, #fbbf24);
      cursor: pointer;
      border: 2px solid rgba(0,0,0,0.4);
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.6);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    
    .kuro-slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 0 18px rgba(251, 191, 36, 0.8);
    }
    
    .kuro-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f0c040, #fbbf24);
      cursor: pointer;
      border: 2px solid rgba(0,0,0,0.4);
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.6);
    }
    
    .kuro-slider.cyan::-webkit-slider-thumb {
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
    }
    .kuro-slider.cyan::-webkit-slider-thumb:hover {
      box-shadow: 0 0 18px rgba(56, 189, 248, 0.8);
    }
    .kuro-slider.cyan::-moz-range-thumb {
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
    }
    
    .kuro-slider.pink::-webkit-slider-thumb {
      background: linear-gradient(135deg, #db2777, #ec4899);
      box-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
    }
    .kuro-slider.pink::-webkit-slider-thumb:hover {
      box-shadow: 0 0 18px rgba(236, 72, 153, 0.8);
    }
    .kuro-slider.pink::-moz-range-thumb {
      background: linear-gradient(135deg, #db2777, #ec4899);
      box-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
    }
    
    /* ═══ PROGRESS BAR ═══ */
    /* Progress bars use inline Tailwind styles */
    
    /* ═══ SOFT PITY ANIMATION ═══ */
    .kuro-soft-pity {
      animation: kuroPulseOrange 2s ease-in-out infinite;
    }
    
    @keyframes kuroPulseOrange {
      0%, 100% { 
        text-shadow: 0 0 8px rgba(251, 146, 60, 0.7);
      }
      50% { 
        text-shadow: 0 0 15px rgba(251, 146, 60, 1), 0 0 25px rgba(251, 146, 60, 0.6);
      }
    }
    
    .kuro-soft-pity-cyan {
      animation: kuroPulseCyan 2s ease-in-out infinite;
    }
    
    @keyframes kuroPulseCyan {
      0%, 100% { 
        text-shadow: 0 0 8px rgba(103, 232, 249, 0.7);
      }
      50% { 
        text-shadow: 0 0 15px rgba(103, 232, 249, 1), 0 0 25px rgba(103, 232, 249, 0.6);
      }
    }
    
    .kuro-soft-pity-pink {
      animation: kuroPulsePink 2s ease-in-out infinite;
    }
    
    @keyframes kuroPulsePink {
      0%, 100% { 
        text-shadow: 0 0 8px rgba(236, 72, 153, 0.7);
      }
      50% { 
        text-shadow: 0 0 15px rgba(236, 72, 153, 1), 0 0 25px rgba(236, 72, 153, 0.6);
      }
    }
    
    /* ═══ NUMBER STYLING ═══ */
    .kuro-number {
      font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
      font-variant-numeric: tabular-nums;
      font-weight: 700;
    }
    
    /* ═══ DIVIDER ═══ */
    .kuro-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
      margin: 12px 0;
    }
    
    /* ═══ COLLECTION CARD HOVER ═══ */
    .collection-card {
      transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
    }
    
    /* ═══ CUSTOM SCROLLBAR ═══ */
    .kuro-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.15) transparent;
    }
    .kuro-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .kuro-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .kuro-scroll::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.15);
      border-radius: 2px;
    }
    .kuro-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.25);
    }
    @media (hover: hover) {
      .collection-card:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      }
    }
    .collection-card:active {
      transform: translateY(-2px) scale(1.01);
      transition: transform 0.1s ease;
    }
    
    /* ═══ TOOLTIP IMPROVEMENTS ═══ */
    [data-tooltip] {
      position: relative;
    }
    [data-tooltip]::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(-4px);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s, transform 0.2s;
      z-index: 100;
    }
    [data-tooltip]:hover::after {
      opacity: 1;
      transform: translateX(-50%) translateY(-8px);
    }
    
    /* ═══ LOADING SKELETON ═══ */
    .skeleton {
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.05) 0%,
        rgba(255, 255, 255, 0.1) 50%,
        rgba(255, 255, 255, 0.05) 100%
      );
      background-size: 200% 100%;
      animation: skeletonShimmer 1.5s ease-in-out infinite;
      border-radius: 6px;
    }
    @keyframes skeletonShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    /* ═══ EMPTY STATE ═══ */
    .empty-state {
      text-align: center;
      padding: 32px 16px;
      color: #6b7280;
    }
    .empty-state-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 12px;
      opacity: 0.4;
    }
    
    /* ═══ REDUCED MOTION — handled by user Animations toggle ═══ */
    
    /* ═══ USER TOGGLE: NO ANIMATIONS ═══ */
    .no-animations *, .no-animations *::before, .no-animations *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    /* Screen reader only utility */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `}</style>
);

// [SECTION:SERVERS]
// Each server has its own timezone for daily/weekly resets (04:00 local)
// Source: https://wuwatracker.com/timeline
const SERVERS = {
  'Asia': { name: 'Asia', timezone: 'Asia/Shanghai', utcOffset: 8, resetHour: 4, hasDST: false },
  'America': { name: 'America', timezone: 'America/New_York', utcOffset: -5, resetHour: 4, hasDST: true },
  'Europe': { name: 'Europe', timezone: 'Europe/Paris', utcOffset: 1, resetHour: 4, hasDST: true },
  'SEA': { name: 'SEA', timezone: 'Asia/Singapore', utcOffset: 8, resetHour: 4, hasDST: false },
  'HMT': { name: 'HMT', timezone: 'Asia/Hong_Kong', utcOffset: 8, resetHour: 4, hasDST: false },
};

// Get current UTC offset for a server (DST-aware)
const getServerOffset = (server) => {
  const serverData = SERVERS[server];
  if (!serverData) {
    console.warn(`[WW] Unknown server "${server}", defaulting to Europe (UTC+1)`);
    return 1; // Default to Europe
  }
  if (!serverData.hasDST) return serverData.utcOffset;
  
  // Use Intl API to detect current DST offset
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { 
      timeZone: serverData.timezone, 
      timeZoneName: 'shortOffset' 
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (tzPart) {
      // Parse offset like "GMT-4", "GMT+2", or "GMT+5:30" (P7-FIX: half-hour support 7F)
      const match = tzPart.value.match(/GMT([+-]\d+)(?::(\d{2}))?/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = match[2] ? parseInt(match[2], 10) / 60 : 0;
        return hours + (hours < 0 ? -minutes : minutes);
      }
    }
  } catch (e) {
    // Fallback to hardcoded offset if Intl API fails
  }
  return serverData.utcOffset;
};

// [SECTION:BANNERS]
const CURRENT_BANNERS = {
  version: '3.1', phase: 1, // Game version (not app version)
  // Times from wuwatracker.com (Europe UTC+1 converted to UTC)
  // Banner: Thu, 05 Feb 2026 03:00 - Thu, 26 Feb 2026 09:59 (Europe)
  startDate: '2026-02-05T02:00:00Z', // Feb 5, 03:00 Europe = 02:00 UTC
  endDate: '2026-02-26T08:59:00Z',   // Feb 26, 09:59 Europe = 08:59 UTC
  characterBannerImage: '',
  weaponBannerImage: '',
  eventBannerImage: '',
  whimperingWastesImage: 'https://i.ibb.co/HT4RyJBy/Whimpering-Wastes-BG.png',
  doubledPawnsImage: 'https://i.ibb.co/G4fSsp4P/Doubled-Pawns-Matrix.jpg',
  towerOfAdversityImage: 'https://i.ibb.co/QF335JVv/Tower-of-Adversity-Banner-Art.jpg',
  illusiveRealmImage: 'https://i.ibb.co/zcc2MxR/Fantasies-of-the-Thousand-Gateways.jpg',
  tacticalHologramImage: 'https://i.ibb.co/mCTQX0kB/tactical-hologram-phantom-pain.avif',
  weeklyBossImage: 'https://i.ibb.co/M5cLkMWf/file-00000000e8b071f480ded273f611ec2e.png',
  standardCharBannerImage: 'https://i.ibb.co/zVf13CMn/Tidal-Chorus.webp',
  standardWeapBannerImage: 'https://i.ibb.co/Q3TYHS0h/Winter-Brume-Pistols.webp',
  dailyResetImage: 'https://i.ibb.co/Jj6cqnsQ/image.jpg',
  characters: [
    { id: 'aemeath', name: 'Aemeath', title: 'The Star That Voyages Far', element: 'Fusion', weaponType: 'Sword', isNew: true, featured4Stars: ['Mortefi', 'Yangyang', 'Taoqi'], imageUrl: 'https://i.ibb.co/sdR97cQP/is-it-just-me-or-im-getting-big-xenoblade-vibes-from-aemeath-v0-qy9dmys1lqag1.jpg' },
    { id: 'chisa', name: 'Chisa', title: 'Snowfield Melody', element: 'Havoc', weaponType: 'Broadblade', isNew: false, featured4Stars: ['Sanhua', 'Danjin', 'Aalto'], imageUrl: 'https://i.ibb.co/KcYh2QNC/vvcistuu87vf1.jpg' },
    { id: 'lupa', name: 'Lupa', title: 'Blazing Fang', element: 'Fusion', weaponType: 'Broadblade', isNew: false, featured4Stars: ['Baizhi', 'Chixia', 'Yuanwu'], imageUrl: 'https://i.ibb.co/Y4mKyFJm/Gq-Vx28sao-AAekz-H.jpg' },
  ],
  weapons: [
    { id: 'everbright', name: 'Everbright Polestar', title: 'Absolute Pulsation', type: 'Sword', forCharacter: 'Aemeath', element: 'Fusion', isNew: true, featured4Stars: ['Discord', 'Waning Redshift', 'Celestial Spiral'], imageUrl: 'https://i.ibb.co/b5sWk8HR/featured-Image-6.jpg' },
    { id: 'kumokiri', name: 'Kumokiri', title: 'Frigid Moon', type: 'Broadblade', forCharacter: 'Chisa', element: 'Havoc', isNew: false, featured4Stars: ['Hollow Mirage', 'Jinzhou Keeper', 'Undying Flame'], imageUrl: 'https://i.ibb.co/7BwnqBN/images-2026-02-04-T182250-074.jpg' },
    { id: 'wildfire', name: 'Wildfire Mark', title: 'Scorching Trail', type: 'Broadblade', forCharacter: 'Lupa', element: 'Fusion', isNew: false, featured4Stars: ['Dauntless Evernight', 'Lunar Cutter', 'Thunderbolt'], imageUrl: 'https://i.ibb.co/1Y5gbsfC/684baaa5266f9f96e0cfb644f-MGLAQ5m03.webp' },
  ],
  // Standard Resonator Banner (Lustrous Tide)
  standardCharacters: ['Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina'],
  // Standard Weapon Banner (Lustrous Tide)
  standardWeapons: [
    { name: 'Verdant Summit', type: 'Broadblade' },
    { name: 'Emerald of Genesis', type: 'Sword' },
    { name: 'Static Mist', type: 'Pistols' },
    { name: 'Abyss Surges', type: 'Gauntlets' },
    { name: 'Cosmic Ripples', type: 'Rectifier' },
    { name: 'Radiance Cleaver', type: 'Broadblade' },
    { name: 'Laser Shearer', type: 'Sword' },
    { name: 'Phasic Homogenizer', type: 'Pistols' },
    { name: 'Pulsation Bracer', type: 'Gauntlets' },
    { name: 'Boson Astrolabe', type: 'Rectifier' },
  ],
};

// [SECTION:HISTORY]
const BANNER_HISTORY = [
  // Version 3.1
  { version: '3.1', phase: 1, characters: ['Aemeath', 'Chisa', 'Lupa'], weapons: ['Everbright Polestar', 'Kumokiri', 'Wildfire Mark'], startDate: '2026-02-05', endDate: '2026-02-26' },
  { version: '3.1', phase: 2, characters: ['Luuk Herssen', 'Galbrena'], weapons: ["Daybreaker's Spine", 'Lux & Umbra'], startDate: '2026-02-26', endDate: '2026-03-18', predicted: true },
  // Version 3.0
  { version: '3.0', phase: 2, characters: ['Mornye', 'Augusta', 'Iuno'], weapons: ['Starfield Calibrator', 'Thunderflare Dominion', "Moongazer's Sigil"], startDate: '2026-01-15', endDate: '2026-02-04' },
  { version: '3.0', phase: 1, characters: ['Lynae', 'Cartethyia', 'Ciaccona'], weapons: ['Spectrum Blaster', "Defier's Thorn", 'Woodland Aria'], startDate: '2025-12-24', endDate: '2026-01-15' },
  // Version 2.8
  { version: '2.8', phase: 2, characters: ['Phrolova', 'Cantarella'], weapons: ['Lethean Elegy', 'Whispers of Sirens'], startDate: '2025-12-11', endDate: '2025-12-24' },
  { version: '2.8', phase: 1, characters: ['Chisa', 'Phoebe'], weapons: ['Kumokiri', 'Luminous Hymn'], startDate: '2025-11-20', endDate: '2025-12-11' },
  // Version 2.7
  { version: '2.7', phase: 2, characters: ['Qiuyuan', 'Zani'], weapons: ['Emerald Sentence', 'Blazing Justice'], startDate: '2025-10-30', endDate: '2025-11-19' },
  { version: '2.7', phase: 1, characters: ['Galbrena', 'Lupa'], weapons: ['Lux & Umbra', 'Wildfire Mark'], startDate: '2025-10-09', endDate: '2025-10-30' },
  // Version 2.6
  { version: '2.6', phase: 2, characters: ['Iuno', 'Ciaccona'], weapons: ["Moongazer's Sigil", 'Woodland Aria'], startDate: '2025-09-17', endDate: '2025-10-08' },
  { version: '2.6', phase: 1, characters: ['Augusta', 'Carlotta', 'Shorekeeper'], weapons: ['Thunderflare Dominion', 'The Last Dance', 'Stellar Symphony'], startDate: '2025-08-28', endDate: '2025-09-17' },
  // Version 2.5
  { version: '2.5', phase: 2, characters: ['Cantarella', 'Brant'], weapons: ['Whispers of Sirens', 'Unflickering Valor'], startDate: '2025-08-14', endDate: '2025-08-27' },
  { version: '2.5', phase: 1, characters: ['Phrolova', 'Roccia'], weapons: ['Lethean Elegy', 'Tragicomedy'], startDate: '2025-07-24', endDate: '2025-08-14' },
  // Version 2.4
  { version: '2.4', phase: 2, characters: ['Lupa'], weapons: ['Wildfire Mark'], startDate: '2025-07-03', endDate: '2025-07-23' },
  { version: '2.4', phase: 1, characters: ['Cartethyia'], weapons: ["Defier's Thorn"], startDate: '2025-06-12', endDate: '2025-07-03' },
  // Version 2.3 (Anniversary)
  { version: '2.3', phase: 2, characters: ['Ciaccona', 'Jinhsi', 'Changli', 'Carlotta', 'Roccia', 'Brant'], weapons: ['Woodland Aria'], startDate: '2025-05-22', endDate: '2025-06-11' },
  { version: '2.3', phase: 1, characters: ['Zani', 'Jiyan', 'Yinlin', 'Zhezhi', 'Xiangli Yao', 'Phoebe'], weapons: ['Blazing Justice'], startDate: '2025-04-29', endDate: '2025-05-22' },
  // Version 2.2
  { version: '2.2', phase: 2, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2025-04-17', endDate: '2025-04-28' },
  { version: '2.2', phase: 1, characters: ['Cantarella', 'Camellya'], weapons: ['Whispers of Sirens', 'Red Spring'], startDate: '2025-03-27', endDate: '2025-04-17' },
  // Version 2.1
  { version: '2.1', phase: 2, characters: ['Brant', 'Changli'], weapons: ['Unflickering Valor', 'Blazing Brilliance'], startDate: '2025-03-06', endDate: '2025-03-26' },
  { version: '2.1', phase: 1, characters: ['Phoebe'], weapons: ['Luminous Hymn'], startDate: '2025-02-13', endDate: '2025-03-06' },
  // Version 2.0
  { version: '2.0', phase: 2, characters: ['Roccia', 'Jinhsi'], weapons: ['Tragicomedy', 'Ages of Harvest'], startDate: '2025-01-23', endDate: '2025-02-12' },
  { version: '2.0', phase: 1, characters: ['Carlotta', 'Zhezhi'], weapons: ['The Last Dance', 'Rime-Draped Sprouts'], startDate: '2025-01-02', endDate: '2025-01-23' },
  // Version 1.4.1
  { version: '1.4', phase: 2, characters: ['Yinlin', 'Xiangli Yao'], weapons: ['Stringmaster', "Verity's Handle"], startDate: '2024-12-12', endDate: '2025-01-01' },
  { version: '1.4', phase: 1, characters: ['Camellya'], weapons: ['Red Spring'], startDate: '2024-11-14', endDate: '2024-12-12' },
  // Version 1.3
  { version: '1.3', phase: 2, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-10-24', endDate: '2024-11-13' },
  { version: '1.3', phase: 1, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2024-09-29', endDate: '2024-10-24' },
  // Version 1.2
  { version: '1.2', phase: 2, characters: ['Xiangli Yao'], weapons: ["Verity's Handle"], startDate: '2024-09-07', endDate: '2024-09-28' },
  { version: '1.2', phase: 1, characters: ['Zhezhi'], weapons: ['Rime-Draped Sprouts'], startDate: '2024-08-15', endDate: '2024-09-07' },
  // Version 1.1
  { version: '1.1', phase: 2, characters: ['Changli'], weapons: ['Blazing Brilliance'], startDate: '2024-07-22', endDate: '2024-08-14' },
  { version: '1.1', phase: 1, characters: ['Jinhsi'], weapons: ['Ages of Harvest'], startDate: '2024-06-28', endDate: '2024-07-22' },
  // Version 1.0
  { version: '1.0', phase: 2, characters: ['Yinlin'], weapons: ['Stringmaster'], startDate: '2024-06-06', endDate: '2024-06-26' },
  { version: '1.0', phase: 1, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-05-23', endDate: '2024-06-13' },
];

// [SECTION:CHARACTER_DATA]
const CHARACTER_DATA = {
  // 5★ Resonators
  'Jiyan': { rarity: 5, element: 'Aero', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'General of the Midnight Rangers. Powerful burst DPS in Qingloong Mode.',
    skills: ['Lone Lance', 'Windqueller', 'Emerald Storm: Prelude', 'Qingloong Mode'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Pecok Flower' },
    bestEchoes: ['Feilian Beringal', 'Sierra Gale 4pc'], bestWeapon: 'Verdant Summit',
    teams: ['Jiyan + Iuno + Shorekeeper', 'Jiyan + Mortefi + Verina'] },
  'Calcharo': { rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Notorious mercenary "The Ghost". Combo-focused Electro DPS.',
    skills: ['Gnawing Fangs', 'Extermination Order', 'Phantom Etching', 'Death Messenger'],
    ascension: { boss: 'Thundering Tacet Core', common: 'Ring', specialty: 'Iris' },
    bestEchoes: ['Thundering Mephis', 'Void Thunder 4pc'], bestWeapon: 'Lustrous Razor',
    teams: ['Calcharo + Yinlin + Verina', 'Calcharo + Yinlin + Shorekeeper'] },
  'Encore': { rarity: 5, element: 'Fusion', weapon: 'Rectifier', role: 'Main DPS',
    desc: 'Eccentric puppeteer with Cosmos & Cloudy. Rampage mode specialist.',
    skills: ['Wooly Attack', 'Flaming Woolies', 'Cloudburst', 'Cosmos Rampage'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    bestEchoes: ['Inferno Rider', 'Molten Rift 4pc'], bestWeapon: 'Cosmic Ripples',
    teams: ['Encore + Changli + Verina', 'Encore + Sanhua + Shorekeeper'] },
  'Jianxin': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Support',
    desc: 'Martial artist seeking peace. Shields, grouping, and Aero buff.',
    skills: ['Fengyiquan', 'Calming Air', 'Purifying Waltz', 'Chi Counter'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Whisperin Core', specialty: 'Lanternberry' },
    bestEchoes: ['Bell-Borne Geochelone', 'Moonlit Clouds 4pc'], bestWeapon: 'Abyss Surges',
    teams: ['Jianxin + Jiyan + Verina', 'Jianxin + Main DPS + Healer'] },
  'Lingyang': { rarity: 5, element: 'Glacio', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Opera performer with lion spirit. Aerial combo specialist.',
    skills: ['Frost Fang', 'Ancient Arts', 'Stormbreaker', 'Lion Form'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    bestEchoes: ['Crownless', 'Freezing Frost 4pc'], bestWeapon: 'Abyss Surges',
    teams: ['Lingyang + Sanhua + Verina', 'Lingyang + Zhezhi + Shorekeeper'] },
  'Verina': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Researcher of life. Premium healer with ATK buff and DMG Deepen.',
    skills: ['Cultivation', 'Botany Experiment', 'Arboreal Flourish', 'Starflower Blooms'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Howler Core', specialty: 'Belle Poppy' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 4pc'], bestWeapon: 'Cosmic Ripples',
    teams: ['Any team - universal healer and buffer'] },
  'Yinlin': { rarity: 5, element: 'Electro', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Covert investigator with puppet Zapstring. Off-field Electro Coordinated Attacks.',
    skills: ['Zapstring Dance', 'Magnetic Roar', 'Thunder Wrath', 'Chameleon Cipher'],
    ascension: { boss: 'Group Abomination Tacet Core', common: 'Whisperin Core', specialty: 'Iris' },
    bestEchoes: ['Thundering Mephis', 'Void Thunder 4pc'], bestWeapon: 'Stringmaster',
    teams: ['Yinlin + Jinhsi + Verina', 'Yinlin + Calcharo + Shorekeeper'] },
  'Jinhsi': { rarity: 5, element: 'Spectro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Magistrate of Jinzhou. Incarnation burst with massive AoE.',
    skills: ['Trailing Slash', 'Illuminous Epiphany', 'Purge of Light', 'Incarnation'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Howler Core', specialty: "Loong's Pearl" },
    bestEchoes: ['Sentinel Jué', 'Celestial Light 4pc'], bestWeapon: 'Ages of Harvest',
    teams: ['Jinhsi + Zhezhi + Shorekeeper', 'Jinhsi + Yinlin + Verina'] },
  'Changli': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Sub DPS',
    desc: 'True Sentinel of Jinzhou. Fast Fusion combos and Fusion DMG Amp.',
    skills: ['Blazing Enlightenment', 'Tripartite Flames', 'Radiance of Fealty', 'Enflamement'],
    ascension: { boss: 'Rage Tacet Core', common: 'Ring', specialty: 'Pavo Plum' },
    bestEchoes: ['Inferno Rider', 'Molten Rift 4pc'], bestWeapon: 'Blazing Brilliance',
    teams: ['Changli + Brant + Shorekeeper', 'Changli + Encore + Verina'] },
  'Zhezhi': { rarity: 5, element: 'Glacio', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Painter who brings art to life. Off-field Glacio Coordinated Attacks.',
    skills: ['Frost Ink', 'Manifestation', 'Living Canvas', 'Creations Abound'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Howler Core', specialty: 'Lanternberry' },
    bestEchoes: ['Crownless', 'Freezing Frost 4pc'], bestWeapon: 'Rime-Draped Sprouts',
    teams: ['Zhezhi + Jinhsi + Shorekeeper', 'Zhezhi + Carlotta + Shorekeeper'] },
  'Xiangli Yao': { rarity: 5, element: 'Electro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Huaxu Academy researcher. Transforms into combat mech for burst.',
    skills: ['Probe', 'Deduction', 'Cogitation Model', 'Law of Reigns'],
    ascension: { boss: 'Hidden Thunder Tacet Core', common: 'Whisperin Core', specialty: 'Violet Coral' },
    bestEchoes: ['Thundering Mephis', 'Void Thunder 4pc'], bestWeapon: "Verity's Handle",
    teams: ['Xiangli Yao + Yinlin + Verina', 'Xiangli Yao + Yinlin + Shorekeeper'] },
  'Shorekeeper': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Guardian of the Tethys. Premium healer with Crit buffs via Stellarealm.',
    skills: ['Origin Calculus', 'Chaos Theory', 'End Loop', 'Illation'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 4pc'], bestWeapon: 'Stellar Symphony',
    teams: ['Any team - best support in game'] },
  'Camellya': { rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    desc: 'Flower-like assassin. Stance-dancer with Budding and Blossom modes.',
    skills: ['Thorn Blossom', 'Crimson Bud', 'Fervor Efflorescent', 'Ephemeral'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    bestEchoes: ['Crownless', 'Sun-Sinking Eclipse 4pc'], bestWeapon: 'Red Spring',
    teams: ['Camellya + Roccia + Shorekeeper', 'Camellya + Sanhua + Verina'] },
  'Carlotta': { rarity: 5, element: 'Glacio', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Heiress of the Montelli family. Stylish Glacio burst gunslinger.',
    skills: ['Silent Execution', 'Art of Violence', 'Era of New Wave', 'Imminent Oblivion'],
    ascension: { boss: 'Platinum Core', common: 'Polygon Core', specialty: 'Sword Acorus' },
    bestEchoes: ['Sentry Construct', 'Frosty Resolve 5pc'], bestWeapon: 'The Last Dance',
    teams: ['Carlotta + Zhezhi + Shorekeeper', 'Carlotta + Buling + Verina'] },
  'Roccia': { rarity: 5, element: 'Havoc', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Clown performer from Rinascita. Havoc buffer with Basic ATK Amp.',
    skills: ['Pero, Help', 'Acrobatic Trick', 'Commedia Improvviso!', 'Real Fantasy'],
    ascension: { boss: 'Cleansing Conch', common: 'Tidal Residuum', specialty: 'Firecracker Jewelweed' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 4pc'], bestWeapon: 'Tragicomedy',
    teams: ['Roccia + Camellya + Shorekeeper', 'Roccia + Cantarella + Verina'] },
  'Phoebe': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Acolyte of the Order of the Deep. Premier Spectro Frazzle applicator.',
    skills: ['Chamuel\'s Star', 'Seeking the Light', 'Dawn of Enlightenment', 'Starflash'],
    ascension: { boss: 'Cleansing Conch', common: 'Whisperin Core', specialty: 'Firecracker Jewelweed' },
    bestEchoes: ['Mourning Aix', 'Eternal Radiance 5pc'], bestWeapon: 'Luminous Hymn',
    teams: ['Phoebe + Zani + Shorekeeper', 'Phoebe + Spectro Rover + Verina'] },
  'Brant': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Knight from Rinascita. Dual-DPS Fusion swordsman with self-heal.',
    skills: ['Blazing Strike', 'Flame Rush', 'Inferno Judgment', 'Burning Soul'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    bestEchoes: ['Dragon of Dirge', 'Tidebreaking Courage 5pc'], bestWeapon: 'Unflickering Valor',
    teams: ['Brant + Lupa + Changli', 'Brant + Changli + Shorekeeper'] },
  'Cantarella': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Head of the Fisalia family. Havoc sub-DPS with coordinated attacks and healing.',
    skills: ['Shadow Strike', 'Venomous Dart', 'Lethal Masquerade', 'Twilight Veil'],
    ascension: { boss: 'Cleansing Conch', common: 'Polygon Core', specialty: 'Seaside Cendrelis' },
    bestEchoes: ['Hecate', 'Empyrean Anthem 5pc'], bestWeapon: 'Whispers of Sirens',
    teams: ['Cantarella + Phrolova + Roccia', 'Cantarella + Camellya + Shorekeeper'] },
  'Zani': { rarity: 5, element: 'Spectro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Averardo Vault security member. Spectro Frazzle DPS with counter-based burst.',
    skills: ['Standard Defense Protocol', 'Crisis Response Protocol', 'Rekindle', 'Heliacal Embers'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    bestEchoes: ['Capitaneus', 'Eternal Radiance 5pc'], bestWeapon: 'Blazing Justice',
    teams: ['Zani + Phoebe + Shorekeeper', 'Zani + Spectro Rover + Verina'] },
  'Ciaccona': { rarity: 5, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Wandering bard. Aero Erosion applicator and off-field Aero buffer.',
    skills: ['Solo Concert', 'Ensemble Sylph', 'Improvised Symphonic Poem', 'Recital'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Gusts of Welkin 4pc'], bestWeapon: 'Woodland Aria',
    teams: ['Ciaccona + Cartethyia + Aero Rover', 'Ciaccona + Cartethyia + Chisa'] },
  'Cartethyia': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Main DPS',
    desc: 'Blessed Maiden of Rinascita. HP-scaling Aero Erosion hypercarry with dual forms.',
    skills: ['Sword Shadow', 'Plunging Recall', 'Blade of Howling Squall', 'Fleurdelys Form'],
    ascension: { boss: 'Unfading Glory', common: 'Tidal Residuum', specialty: 'Bamboo Iris' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Windward Pilgrimage 4pc'], bestWeapon: "Defier's Thorn",
    teams: ['Cartethyia + Ciaccona + Aero Rover', 'Cartethyia + Ciaccona + Chisa'] },
  'Lupa': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Star Gladiator. Mono-Fusion enabler with Fusion RES shred and team DMG buffs.',
    skills: ['Wolflame', 'Wolfaith', 'Dance With the Wolf', 'Pack Hunt'],
    ascension: { boss: 'Unfading Glory', common: 'Howler Core', specialty: 'Bloodleaf Viburnum' },
    bestEchoes: ['Lioness of Glory', 'Flaming Clawprint 4pc'], bestWeapon: 'Wildfire Mark',
    teams: ['Lupa + Brant + Changli', 'Lupa + Galbrena + Qiuyuan'] },
  'Phrolova': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Main DPS',
    desc: 'Fractsidus Overseer and former violinist. Havoc DPS with off-field Hecate summon.',
    skills: ['Void Touch', 'Dark Blessing', 'Chaos Rift', 'Hecate'],
    ascension: { boss: 'Truth in Lies', common: 'Polygon Core', specialty: 'Afterlife' },
    bestEchoes: ['Nightmare: Hecate', 'Dream of the Lost 3pc + Havoc Eclipse 2pc'], bestWeapon: 'Lethean Elegy',
    teams: ['Phrolova + Cantarella + Qiuyuan', 'Phrolova + Cantarella + Roccia'] },
  'Augusta': { rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Ephor of Septimont. Electro DPS with time-stop and innate shielding.',
    skills: ['Thunder Cleave', 'Storm Surge', 'Divine Judgment', 'Crown of Wills'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Tidal Residuum', specialty: 'Luminous Calendula' },
    bestEchoes: ['The False Sovereign', 'Crown of Valor 3pc + Void Thunder 2pc'], bestWeapon: 'Thunderflare Dominion',
    teams: ['Augusta + Iuno + Shorekeeper', 'Augusta + Yinlin + Verina'] },
  'Iuno': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Priestess of Septimont\'s Tetragon Temple. Heavy ATK buffer with healing and shield.',
    skills: ['Temporal Fist', 'Chrono Shift', 'Time Dilation', 'Wan Light'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Sliverglow Bloom' },
    bestEchoes: ['Lady of the Sea', 'Crown of Valor 3pc + Sierra Gale 2pc'], bestWeapon: "Moongazer's Sigil",
    teams: ['Iuno + Augusta + Shorekeeper', 'Iuno + Jiyan + Shorekeeper'] },
  'Galbrena': { rarity: 5, element: 'Fusion', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Black Shores Consultant, the Discord Slayer. Fusion Echo Skill & Heavy ATK hypercarry.',
    skills: ['Light Slash', 'Radiant Barrier', 'Solar Flare', 'Divine Retribution'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Tidal Residuum', specialty: 'Stone Rose' },
    bestEchoes: ['Corrosaurus', "Flamewing's Shadow 3pc + Molten Rift 2pc"], bestWeapon: 'Lux & Umbra',
    teams: ['Galbrena + Qiuyuan + Shorekeeper', 'Galbrena + Lupa + Brant'] },
  'Qiuyuan': { rarity: 5, element: 'Glacio', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Former Mingting intelligence agent. Echo Skill DMG buffer with Crit DMG Amp.',
    skills: ['Frost Edge', 'Winter Slash', 'Blizzard Dance', 'Eternal Winter'],
    ascension: { boss: 'Truth in Lies', common: 'Whisperin Core', specialty: 'Wintry Bell' },
    bestEchoes: ['Impermanence Heron', 'Freezing Frost 3pc + Sierra Gale 2pc'], bestWeapon: 'Emerald Sentence',
    teams: ['Qiuyuan + Galbrena + Shorekeeper', 'Qiuyuan + Phrolova + Cantarella'] },
  'Chisa': { rarity: 5, element: 'Havoc', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Startorch Academy student. Havoc support with DEF shred and Negative Status stacks.',
    skills: ['Unseen Snare', 'Eye of Unraveling', 'Moment of Nihility', 'Chainsaw Mode'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Summer Flower' },
    bestEchoes: ['Threnodian: Leviathan', 'Thread of Severed Fate 3pc + Sun-Sinking Eclipse 2pc'], bestWeapon: 'Kumokiri',
    teams: ['Chisa + Cartethyia + Ciaccona', 'Chisa + Zani + Phoebe'] },
  'Lynae': { rarity: 5, element: 'Spectro', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Startorch Academy student and ex-mercenary. Tune Break DMG buffer for Off-Tune teams.',
    skills: ['Light Shot', 'Radiant Bullet', 'Stellar Barrage', 'Supernova'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Sliverglow Bloom' },
    bestEchoes: ['Hyvatia', 'Pact of Neonlight Leap 5pc'], bestWeapon: 'Spectrum Blaster',
    teams: ['Lynae + Mornye + Iuno', 'Lynae + Mornye + Shorekeeper'] },
  'Mornye': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Healer',
    desc: 'Startorch Academy professor. DEF-scaling Fusion healer with Off-Tune Buildup.',
    skills: ['Rest Mass Energy', 'Syntony Field', 'Critical Protocol', 'Tune Rupture Response'],
    ascension: { boss: 'Abyssal Husk', common: 'Tidal Residuum', specialty: 'Summer Flower' },
    bestEchoes: ['Reactor Husk', 'Halo of Starry Radiance 5pc'], bestWeapon: 'Starfield Calibrator',
    teams: ['Mornye + Lynae + Iuno', 'Mornye + Any DPS + Shorekeeper'] },
  'Luuk Herssen': { rarity: 5, element: 'Spectro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Startorch Academy doctor. Aerial Basic ATK Spectro DPS with sustained pressure.',
    skills: ['Golden Reflux', 'Aureole of Execution', 'Scalpel Judgment', 'Ichor Flow'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Lanternberry' },
    bestEchoes: ['Twin Nova: Nebulous Cannon', 'Rite of Gilded Revelation 5pc'], bestWeapon: "Daybreaker's Spine",
    teams: ['Luuk Herssen + Lynae + Mornye', 'Luuk Herssen + Sanhua + Verina'] },
  'Aemeath': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Digital ghost. Dual combat mode Fusion DPS with Tune Rupture and Fusion Burst.',
    skills: ['Mech Transform', 'Tune Rupture Mode', 'Fusion Burst Mode', 'Resonance Liberation'],
    ascension: { boss: 'Rage Tacet Core', common: 'Tidal Residuum', specialty: 'Pecok Flower' },
    bestEchoes: ['Trailblazing Star echo', 'Trailblazing Star 5pc'], bestWeapon: 'Everbright Polestar',
    teams: ['Aemeath + Changli + Shorekeeper', 'Aemeath + Lynae + Mornye'] },
  // 4★ Resonators
  'Aalto': { rarity: 4, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Suave information broker. Aero off-field applicator.',
    skills: ['Mist Bullets', 'Shift Trick', 'Flower in the Mist', 'Mist Avatar'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Wintry Bell' },
    bestEchoes: ['Cyan Feathered Heron', 'Sierra Gale 4pc'], bestWeapon: 'Static Mist',
    teams: ['Aalto + Jiyan + Verina', 'Aalto + Aero DPS + Shorekeeper'] },
  'Baizhi': { rarity: 4, element: 'Glacio', weapon: 'Rectifier', role: 'Healer',
    desc: "Huaxu Academy researcher with companion You'an. Free-to-play healer.",
    skills: ['Destined Promise', 'Emergency Plan', 'Momentary Union', 'Rejuvenation'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Howler Core', specialty: 'Belle Poppy' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 4pc'], bestWeapon: 'Variation',
    teams: ['Any team needing F2P healer'] },
  'Chixia': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Enthusiastic patroller with dual pistols. Fusion DPS.',
    skills: ['POW POW', 'Whizzing Fight Spirit', 'Blazing Flames', 'Burning Burst'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    bestEchoes: ['Inferno Rider', 'Molten Rift 4pc'], bestWeapon: 'Static Mist',
    teams: ['Chixia + Changli + Verina', 'Chixia + Mortefi + Baizhi'] },
  'Danjin': { rarity: 4, element: 'Havoc', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Midnight Ranger with HP consumption. Havoc DMG Bonus buffer.',
    skills: ['Roaming Dragon', 'Crimson Fragment', 'Crimson Erosion', 'Sanguine Pulse'],
    ascension: { boss: 'Group Abomination Tacet Core', common: 'Ring', specialty: 'Wintry Bell' },
    bestEchoes: ['Impermanence Heron', 'Sun-Sinking Eclipse 4pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Danjin + Camellya + Shorekeeper', 'Danjin + Havoc DPS + Verina'] },
  'Yangyang': { rarity: 4, element: 'Aero', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Midnight Rangers outrider. Free starter Aero Energy battery.',
    skills: ['Feather as Blade', 'Zephyr Domain', 'Wind Spirals', 'Cerulean Song'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Ring', specialty: 'Wintry Bell' },
    bestEchoes: ['Cyan Feathered Heron', 'Sierra Gale 4pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Yangyang + Jiyan + Baizhi', 'Yangyang + Jiyan + Verina'] },
  'Sanhua': { rarity: 4, element: 'Glacio', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Jinhsi\'s personal guard. Quick-swap Basic ATK Amp buffer.',
    skills: ['Frigid Light', 'Eternal Frost', 'Glacial Gaze', 'Ice Prism'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Ring', specialty: 'Coriolus' },
    bestEchoes: ['Crownless', 'Freezing Frost 4pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Sanhua + Camellya + Verina', 'Sanhua + Any Basic ATK DPS + Healer'] },
  'Taoqi': { rarity: 4, element: 'Havoc', weapon: 'Broadblade', role: 'Support',
    desc: 'Border defense director. Shielder with Resonance Skill DMG Deepen.',
    skills: ['Concealed Edge', 'Fortified Defense', 'Iron Will', 'Rocksteady Shield'],
    ascension: { boss: 'Group Abomination Tacet Core', common: 'Whisperin Core', specialty: 'Lanternberry' },
    bestEchoes: ['Bell-Borne Geochelone', 'Moonlit Clouds 4pc'], bestWeapon: 'Discord',
    teams: ['Taoqi + Jinhsi + Verina', 'Taoqi + DPS + Healer'] },
  'Yuanwu': { rarity: 4, element: 'Electro', weapon: 'Gauntlets', role: 'Support',
    desc: 'Boxing gym owner. Electro Coordinated Attacks and shields.',
    skills: ['Leihuangquan', 'Thunder Wedge', 'Blazing Might', 'Rumbling Spark'],
    ascension: { boss: 'Thundering Tacet Core', common: 'Ring', specialty: 'Iris' },
    bestEchoes: ['Thundering Mephis', 'Rejuvenating Glow 4pc'], bestWeapon: 'Marcato',
    teams: ['Yuanwu + Jinhsi + Verina', 'Yuanwu + Electro DPS + Healer'] },
  'Mortefi': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Hot-tempered researcher. Heavy ATK DMG buffer via Coordinated Attacks.',
    skills: ['Impromptu', 'Passionate Variation', 'Violent Finale', 'Fury Fugue'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Lanternberry' },
    bestEchoes: ['Inferno Rider', 'Moonlit Clouds 4pc'], bestWeapon: 'Static Mist',
    teams: ['Mortefi + Jiyan + Verina', 'Mortefi + Heavy ATK DPS + Shorekeeper'] },
  'Youhu': { rarity: 4, element: 'Glacio', weapon: 'Gauntlets', role: 'Support',
    desc: 'Whimsical antique appraiser. Glacio healer with Coordinated ATK Amp.',
    skills: ['Frosty Punch', 'Lucky Draw', 'Fortune Blast', 'Icy Gourd'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Ring', specialty: 'Coriolus' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 4pc'], bestWeapon: 'Marcato',
    teams: ['Youhu + Glacio DPS + Sub DPS'] },
  'Lumi': { rarity: 4, element: 'Electro', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Lollo Logistics navigator. Electro sub-DPS with Res. Skill DMG Amp.',
    skills: ['Electro Slash', 'Thundering Voyage', 'Storm Navigator', 'Arc Discharge'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Whisperin Core', specialty: "Loong's Pearl" },
    bestEchoes: ['Bell-Borne Geochelone', 'Moonlit Clouds 4pc'], bestWeapon: 'Discord',
    teams: ['Lumi + Carlotta + Shorekeeper', 'Lumi + Electro DPS + Verina'] },
  'Buling': { rarity: 4, element: 'Electro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Spiritchaser Taoist and fortune-teller. Electro healer with DMG Amp buffs.',
    skills: ['Twin Thunders', 'Trigram Combo', 'Lightning Burst', 'Blazing Aura'],
    ascension: { boss: 'Topological Confinement', common: 'Polygon Core', specialty: 'Nova' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 4pc'], bestWeapon: 'Stellar Symphony',
    teams: ['Buling + Carlotta + Zhezhi', 'Buling + DPS + Sub DPS'] },
};

// [SECTION:WEAPON_DATA]
const WEAPON_DATA = {
  // 5★ Weapons
  'Verdant Summit': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate',
    desc: 'Jiyan signature. Increases Resonance Skill DMG after Heavy Attack hits.',
    passive: 'Heavy Attack hits grant Resonance Skill DMG +20%', bestFor: ['Jiyan'] },
  'Lustrous Razor': { rarity: 5, type: 'Broadblade', stat: 'ATK%',
    desc: 'Standard 5★ Broadblade. Electro DMG and combo finisher boost.',
    passive: 'ATK +12%, Electro DMG +12% on combo finisher', bestFor: ['Calcharo'] },
  'Emerald of Genesis': { rarity: 5, type: 'Sword', stat: 'Crit Rate',
    desc: 'Standard 5★. Increases ATK after using Resonance Skill.',
    passive: 'Resonance Skill use grants ATK +12%', bestFor: ['Danjin', 'Yangyang'] },
  'Static Mist': { rarity: 5, type: 'Pistols', stat: 'Crit Rate',
    desc: 'Standard 5★. Energy regeneration and ATK boost.',
    passive: 'Energy Regen +12%, ATK +12% when full energy', bestFor: ['Mortefi', 'Aalto'] },
  'Abyss Surges': { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate',
    desc: 'Standard 5★. Increases ATK based on energy consumed.',
    passive: 'ATK +8% per 10 energy consumed, max 4 stacks', bestFor: ['Jianxin', 'Lingyang'] },
  'Cosmic Ripples': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate',
    desc: 'Standard 5★. Basic Attack DMG increase.',
    passive: 'Basic Attack DMG +12%, stacks on hit', bestFor: ['Encore', 'Verina'] },
  'Stringmaster': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG',
    desc: 'Yinlin signature. Increases Resonance Skill DMG.',
    passive: 'Resonance Skill DMG +24%, Crit Rate +8%', bestFor: ['Yinlin'] },
  'Ages of Harvest': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG',
    desc: 'Jinhsi signature. Spectro DMG and Liberation buff.',
    passive: 'Spectro DMG +12%, Liberation DMG +24%', bestFor: ['Jinhsi'] },
  'Blazing Brilliance': { rarity: 5, type: 'Sword', stat: 'Crit DMG',
    desc: 'Changli signature. Fusion DMG and Skill Enhancement.',
    passive: 'Fusion DMG +12%, Resonance Skill +24%', bestFor: ['Changli'] },
  'Rime-Draped Sprouts': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG',
    desc: 'Zhezhi signature. Increases off-field DMG.',
    passive: 'Off-field DMG +24%, Glacio DMG +12%', bestFor: ['Zhezhi'] },
  "Verity's Handle": { rarity: 5, type: 'Gauntlets', stat: 'Crit DMG',
    desc: 'Xiangli Yao signature. Electro and mech bonuses.',
    passive: 'Electro DMG +12%, Mech form +24%', bestFor: ['Xiangli Yao'] },
  'Stellar Symphony': { rarity: 5, type: 'Rectifier', stat: 'Energy Regen',
    desc: 'Shorekeeper signature. Ultimate support weapon.',
    passive: 'Energy Regen +20%, team ATK buff +20%', bestFor: ['Shorekeeper'] },
  'Red Spring': { rarity: 5, type: 'Sword', stat: 'Crit Rate',
    desc: 'Camellya signature. Havoc DMG amplification.',
    passive: 'Havoc DMG +12%, Skill DMG +24%', bestFor: ['Camellya'] },
  'The Last Dance': { rarity: 5, type: 'Pistols', stat: 'Crit DMG',
    desc: 'Carlotta signature. Glacio and charged attack focus.',
    passive: 'Glacio DMG +12%, Charged ATK +24%', bestFor: ['Carlotta'] },
  'Tragicomedy': { rarity: 5, type: 'Gauntlets', stat: 'ATK%',
    desc: 'Roccia signature. Support gauntlets.',
    passive: 'Team ATK +12%, Outro Skill +24%', bestFor: ['Roccia'] },
  'Luminous Hymn': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG',
    desc: 'Phoebe signature. Spectro DPS rectifier.',
    passive: 'Spectro DMG +12%, Card skills +24%', bestFor: ['Phoebe'] },
  'Unflickering Valor': { rarity: 5, type: 'Sword', stat: 'Crit Rate',
    desc: 'Brant signature. Aggressive Fusion sword.',
    passive: 'Fusion DMG +12%, ATK speed +10%', bestFor: ['Brant'] },
  'Whispers of Sirens': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG',
    desc: 'Cantarella signature. Havoc rectifier.',
    passive: 'Havoc DMG +12%, Off-field +24%', bestFor: ['Cantarella'] },
  'Blazing Justice': { rarity: 5, type: 'Gauntlets', stat: 'Crit DMG',
    desc: 'Zani signature. Spectro DPS gauntlets with DEF ignore and Frazzle Amp.',
    passive: 'ATK +24%, Spectro Frazzle DMG Amp +50%, DEF Ignore +16%', bestFor: ['Zani'] },
  'Woodland Aria': { rarity: 5, type: 'Pistols', stat: 'Crit Rate',
    desc: 'Ciaccona signature. Aero Erosion pistols with Aero RES shred.',
    passive: 'ATK +12%, Aero DMG +24% on Erosion, Aero RES -16%', bestFor: ['Ciaccona'] },
  "Defier's Thorn": { rarity: 5, type: 'Sword', stat: 'HP%',
    desc: 'Cartethyia signature. Aero sword with HP scaling and DEF ignore.',
    passive: 'HP +24%, DEF Ignore +16% on Aero Eroded targets', bestFor: ['Cartethyia'] },
  'Wildfire Mark': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG',
    desc: 'Lupa signature. Fusion broadblade with Liberation DMG boost and team buff.',
    passive: 'ATK +12%, Res. Liberation DMG +24%, team Fusion DMG +24%', bestFor: ['Lupa'] },
  'Lethean Elegy': { rarity: 5, type: 'Rectifier', stat: 'ATK%',
    desc: 'Phrolova signature. Havoc support.',
    passive: 'Havoc DMG +12%, Team buff +20%', bestFor: ['Phrolova'] },
  'Thunderflare Dominion': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG',
    desc: 'Augusta signature. Electro broadblade.',
    passive: 'Electro DMG +12%, Heavy ATK +24%', bestFor: ['Augusta'] },
  "Moongazer's Sigil": { rarity: 5, type: 'Gauntlets', stat: 'Energy Regen',
    desc: 'Iuno signature. Aero support gauntlets.',
    passive: 'Aero DMG +12%, Time skills +24%', bestFor: ['Iuno'] },
  'Lux & Umbra': { rarity: 5, type: 'Pistols', stat: 'Crit Rate',
    desc: 'Galbrena signature. Fusion pistols.',
    passive: 'Fusion DMG +12%, Liberation +24%', bestFor: ['Galbrena'] },
  'Emerald Sentence': { rarity: 5, type: 'Sword', stat: 'Crit DMG',
    desc: 'Qiuyuan signature. Glacio sword.',
    passive: 'Glacio DMG +12%, Skill +24%', bestFor: ['Qiuyuan'] },
  'Kumokiri': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate',
    desc: 'Chisa signature. Havoc broadblade with Negative Status synergy and team DMG buff.',
    passive: 'ATK +12%, Res. Liberation DMG +24%, All-Type DMG +24% at max stacks', bestFor: ['Chisa'] },
  'Spectrum Blaster': { rarity: 5, type: 'Pistols', stat: 'Crit DMG',
    desc: 'Lynae signature. Spectro pistols.',
    passive: 'Spectro DMG +12%, Charged +24%', bestFor: ['Lynae'] },
  'Starfield Calibrator': { rarity: 5, type: 'Broadblade', stat: 'Energy Regen',
    desc: 'Mornye signature. Fusion broadblade with DEF scaling and Crit DMG team buff.',
    passive: 'DEF +32%, Concerto +16, team Crit DMG +40% on heal', bestFor: ['Mornye'] },
  'Everbright Polestar': { rarity: 5, type: 'Sword', stat: 'Crit Rate',
    desc: 'Aemeath signature. Fusion sword with DEF Ignore and Fusion RES Ignore.',
    passive: 'All-Attr DMG +12%, DEF Ignore +32%, Fusion RES Ignore +10%', bestFor: ['Aemeath'] },
  "Daybreaker's Spine": { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate',
    desc: 'Luuk Herssen signature. Spectro gauntlets with aerial combat enhancement.',
    passive: 'ATK +12%, Basic ATK DMG Amp +20%, Spectro DMG +20%, DEF Ignore +10%', bestFor: ['Luuk Herssen'] },
  // Standard 5★ Weapons (Lustrous Tide pool - v3.0)
  'Radiance Cleaver': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate',
    desc: 'Standard 5★ Broadblade. Enhances Heavy Attack damage.',
    passive: 'Heavy ATK DMG +12%, ATK +12% on hit', bestFor: ['Broadblade users'] },
  'Laser Shearer': { rarity: 5, type: 'Sword', stat: 'Crit Rate',
    desc: 'Standard 5★ Sword. Energy and Skill DMG synergy.',
    passive: 'Energy Regen +12%, Res. Skill DMG +12%', bestFor: ['Sword users'] },
  'Phasic Homogenizer': { rarity: 5, type: 'Pistols', stat: 'Crit Rate',
    desc: 'Standard 5★ Pistols. Off-field and Liberation synergy.',
    passive: 'Off-field DMG +12%, Res. Liberation +12%', bestFor: ['Pistol users'] },
  'Pulsation Bracer': { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate',
    desc: 'Standard 5★ Gauntlets. Coordinated Attack enhancement.',
    passive: 'Coordinated ATK +12%, ATK +12% on swap', bestFor: ['Gauntlet users'] },
  'Boson Astrolabe': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate',
    desc: 'Standard 5★ Rectifier. Healing and team ATK boost.',
    passive: 'Healing +12%, team ATK +12% on heal', bestFor: ['Rectifier users'] },
  // 4★ Weapons (selected important ones)
  'Discord': { rarity: 4, type: 'Broadblade', stat: 'ATK%',
    desc: 'Battle Pass broadblade. Good general option.',
    passive: 'Resonance Skill +16%', bestFor: ['Taoqi', 'Any Broadblade'] },
  'Variation': { rarity: 4, type: 'Rectifier', stat: 'Energy Regen',
    desc: 'Free healing rectifier. Good for supports.',
    passive: 'Healing +15%, Energy +12%', bestFor: ['Baizhi', 'Healers'] },
  'Marcato': { rarity: 4, type: 'Gauntlets', stat: 'ATK%',
    desc: 'Battle Pass gauntlets. General DPS option.',
    passive: 'ATK +12% on skill use', bestFor: ['Yuanwu', 'Gauntlet users'] },
  'Lunar Cutter': { rarity: 4, type: 'Sword', stat: 'ATK%',
    desc: 'Free sword. Solid general choice.',
    passive: 'Basic ATK +16%', bestFor: ['Sword users'] },
  'Thunderbolt': { rarity: 4, type: 'Pistols', stat: 'ATK%',
    desc: 'Free pistols. Good starter option.',
    passive: 'Electro DMG +12%', bestFor: ['Pistol users'] },
};

// [SECTION:EVENTS]
// All times from wuwatracker.com (Europe UTC+1 reference, converted to UTC)
// Events that end at 03:59 are server-local (follow daily reset)
// Events that end at other times are global (same UTC moment)
const EVENTS = {
  dailyReset: { 
    name: 'Daily Reset', 
    subtitle: 'Daily Activities & Tacet Fields', 
    description: 'Daily activity reset', 
    resetType: 'Daily 4:00 AM', 
    color: 'yellow', 
    dailyReset: true, 
    rewards: 'Waveplates',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30',
    accentColor: 'yellow'
  },
  weeklyBoss: {
    name: 'Weekly Boss',
    subtitle: 'Echoing Remnants',
    description: 'Weekly boss rewards reset',
    resetType: 'Weekly (Monday)',
    color: 'yellow',
    weeklyReset: true,
    rewards: 'Boss Materials',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30',
    accentColor: 'yellow',
    imageUrl: 'https://i.ibb.co/M5cLkMWf/file-00000000e8b071f480ded273f611ec2e.png'
  },
  tacticalHologram: {
    name: 'Tactical Hologram',
    subtitle: 'Synchronization',
    description: 'Weekly boss challenge',
    resetType: 'Version update',
    color: 'cyan',
    // Tue, 03 Feb 2026 10:45 - Sun, 05 Apr 2026 03:59 (Europe)
    // Apr 5, 03:59 Europe = Apr 5, 02:59 UTC
    currentEnd: '2026-04-05T02:59:00Z',
    rewards: 'Weekly Rewards',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: 'https://i.ibb.co/mCTQX0kB/tactical-hologram-phantom-pain.avif'
  },
  doubledPawns: { 
    name: 'Doubled Pawns Matrix', 
    subtitle: 'Pilot', 
    description: 'High difficulty boss rush', 
    resetType: 'Version update', 
    color: 'pink', 
    // Wed, 11 Feb 2026 21:00 - Thu, 19 Mar 2026 04:00 (Europe)
    // Mar 19, 04:00 Europe = Mar 19, 03:00 UTC
    currentEnd: '2026-03-19T03:00:00Z',
    rewards: '400 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30',
    accentColor: 'pink',
    imageUrl: 'https://i.ibb.co/G4fSsp4P/Doubled-Pawns-Matrix.jpg'
  },
  whimperingWastes: { 
    name: 'Whimpering Wastes', 
    subtitle: 'Respawning Waters', 
    description: 'Combat challenge with token system', 
    resetType: '28 days', 
    color: 'cyan', 
    // Mon, 19 Jan 2026 04:00 - Mon, 16 Feb 2026 03:59 (Europe)
    // Feb 16, 03:59 Europe = Feb 16, 02:59 UTC
    currentEnd: '2026-02-16T02:59:00Z',
    rewards: '800 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: 'https://i.ibb.co/HT4RyJBy/Whimpering-Wastes-BG.png'
  },
  towerOfAdversity: { 
    name: 'Tower of Adversity', 
    subtitle: 'Hazard Zone', 
    description: 'Endgame combat challenge', 
    resetType: '28 days', 
    color: 'orange', 
    // Mon, 02 Feb 2026 04:00 - Mon, 02 Mar 2026 03:59 (Europe)
    // Mar 2, 03:59 Europe = Mar 2, 02:59 UTC
    currentEnd: '2026-03-02T02:59:00Z',
    rewards: '800 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-orange-900/30',
    accentColor: 'orange',
    imageUrl: 'https://i.ibb.co/QF335JVv/Tower-of-Adversity-Banner-Art.jpg'
  },
  illusiveRealm: { 
    name: 'Fantasies of the Thousand Gateways', 
    subtitle: 'Roguelike Mode', 
    description: 'Weekly reward reset', 
    resetType: 'Weekly (Monday)', 
    color: 'purple', 
    weeklyReset: true, 
    rewards: '300 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-purple-900/30',
    accentColor: 'purple',
    imageUrl: 'https://i.ibb.co/zcc2MxR/Fantasies-of-the-Thousand-Gateways.jpg'
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════════

const ELEMENT_COLORS = {
  Fusion: { bg: 'rgba(249,115,22,0.2)', border: 'rgb(249,115,22)', text: 'rgb(251,146,60)' },
  Electro: { bg: 'rgba(139,92,246,0.2)', border: 'rgb(139,92,246)', text: 'rgb(167,139,250)' },
  Aero: { bg: 'rgba(16,185,129,0.2)', border: 'rgb(16,185,129)', text: 'rgb(52,211,153)' },
  Glacio: { bg: 'rgba(6,182,212,0.2)', border: 'rgb(6,182,212)', text: 'rgb(34,211,238)' },
  Havoc: { bg: 'rgba(236,72,153,0.2)', border: 'rgb(236,72,153)', text: 'rgb(244,114,182)' },
  Spectro: { bg: 'rgba(234,179,8,0.2)', border: 'rgb(234,179,8)', text: 'rgb(250,204,21)' },
};

const WEAPON_COLORS = {
  Broadblade: { bg: 'rgba(239,68,68,0.2)', border: 'rgb(239,68,68)', text: 'rgb(248,113,113)' },
  Sword: { bg: 'rgba(59,130,246,0.2)', border: 'rgb(59,130,246)', text: 'rgb(96,165,250)' },
  Pistols: { bg: 'rgba(234,179,8,0.2)', border: 'rgb(234,179,8)', text: 'rgb(250,204,21)' },
  Gauntlets: { bg: 'rgba(168,85,247,0.2)', border: 'rgb(168,85,247)', text: 'rgb(192,132,252)' },
  Rectifier: { bg: 'rgba(16,185,129,0.2)', border: 'rgb(16,185,129)', text: 'rgb(52,211,153)' },
};

// [SECTION:CONSTANTS]
// WuWa gacha rates: 0.8% base, soft pity starts at 65, hard pity at 80
const HARD_PITY = 80, SOFT_PITY_START = 65; // AVG_PITY removed — P8-FIX: was unused dead code
const LUNITE_DAILY_ASTRITE = 90; // P7-FIX: Extract magic number (7E)
const ASTRITE_PER_PULL = 160;

// Subscription and top-up prices (USD) - Updated January 2026
const SUBSCRIPTIONS = {
  lunite: { name: 'Lunite Subscription', price: 4.99, astrite: 3000, daily: 90, duration: 30, desc: '300 Lunite + 90 Astrite/day for 30 days' },
  weekly: { name: 'Weekly Subscription', price: 9.99, astrite: 1600, lunite: 680, duration: 7, desc: '680 Lunite + 1600 Astrite over 7 days (Day 1 + Day 3 + Day 7)' },
  bpInsider: { name: 'Pioneer Podcast - Insider', price: 9.99, astrite: 680, radiant: 5, lustrous: 2, desc: '680 Astrite + 5 Radiant Tides + 2 Lustrous Tides' },
  bpConnoisseur: { name: 'Pioneer Podcast - Connoisseur', price: 19.99, astrite: 680, radiant: 5, lustrous: 5, desc: '680 Astrite + 5 Radiant Tides + 5 Lustrous Tides' },
  directTop60: { name: 'Direct Top-Up (60)', price: 0.99, astrite: 60, desc: '60 Astrite' },
  directTop300: { name: 'Direct Top-Up (300)', price: 4.99, astrite: 300, desc: '300 Astrite' },
  directTop980: { name: 'Direct Top-Up (980)', price: 14.99, astrite: 980, desc: '980 Astrite' },
  directTop1980: { name: 'Direct Top-Up (1980)', price: 29.99, astrite: 1980, desc: '1980 Astrite' },
  directTop3280: { name: 'Direct Top-Up (3280)', price: 49.99, astrite: 3280, desc: '3280 Astrite' },
  directTop6480: { name: 'Direct Top-Up (6480)', price: 99.99, astrite: 6480, desc: '6480 Astrite' },
};

// 4-star pity constants
const HARD_PITY_4STAR = 10; // Guaranteed 4★ every 10 pulls
const AVG_PITY_4STAR = 8.5; // Average pulls per 4★
const FEATURED_4STAR_RATE = 0.5; // 50% chance for featured 4-star

// [SECTION:TIME]
const getTimeRemaining = (endDate) => {
  const now = Date.now();
  const end = new Date(endDate).getTime();
  const total = end - now;
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return { 
    days: Math.floor(total / (1000 * 60 * 60 * 24)), 
    hours: Math.floor((total / (1000 * 60 * 60)) % 24), 
    minutes: Math.floor((total / 1000 / 60) % 60), 
    seconds: Math.floor((total / 1000) % 60), 
    expired: false 
  };
};

// Events are stored with UTC times based on Europe server timezone.
// For server-specific events (ending at XX:59, following reset times),
// adjust by timezone difference when viewing in another server.
// Reference: Europe — dynamic via getServerOffset() to handle CET/CEST (UTC+1 / UTC+2)
const getEuropeOffset = () => getServerOffset('Europe');

const getServerAdjustedEnd = (currentEnd, server) => {
  if (!currentEnd) return currentEnd;
  const serverOffset = getServerOffset(server);
  // Calculate offset difference from Europe reference (DST-aware)
  const offsetDiff = serverOffset - getEuropeOffset();
  // Adjust: if server is ahead of Europe, event ends earlier in absolute UTC
  const storedMs = new Date(currentEnd).getTime();
  const adjustedMs = storedMs - (offsetDiff * 3600000);
  return new Date(adjustedMs).toISOString();
};

// Auto-advance recurring events past their end date (28-day cycles)
const getRecurringEventEnd = (currentEnd, resetType, server) => {
  const adjusted = getServerAdjustedEnd(currentEnd, server);
  if (!adjusted) return adjusted;
  const now = Date.now();
  const end = new Date(adjusted).getTime();
  if (end > now) return adjusted;
  // Parse cycle days from resetType like "28 days" or "~28 days"
  const match = resetType && resetType.match(/(\d+)/);
  if (!match) return adjusted;
  const cycleMs = parseInt(match[1], 10) * 86400000;
  const cycles = Math.ceil((now - end) / cycleMs);
  return new Date(end + cycles * cycleMs).toISOString();
};

// Next daily reset: 04:00 in server's local timezone
const getNextDailyReset = (server) => {
  const serverOffset = getServerOffset(server);
  const now = Date.now();
  
  // Get current time in server's local timezone
  const nowInServerTz = new Date(now + serverOffset * 3600000);
  const year = nowInServerTz.getUTCFullYear();
  const month = nowInServerTz.getUTCMonth();
  const day = nowInServerTz.getUTCDate();
  const hour = nowInServerTz.getUTCHours();
  const minute = nowInServerTz.getUTCMinutes();
  
  // Today's 04:00 in server local time
  let reset = Date.UTC(year, month, day, 4, 0, 0, 0);
  
  // If already past 04:00 local, next reset is tomorrow
  const currentMinutes = hour * 60 + minute;
  if (currentMinutes >= 240) { // 4 * 60 = 240
    reset += 86400000; // Add 24 hours
  }
  
  // Convert from server local back to UTC
  const resetUtc = reset - serverOffset * 3600000;
  return new Date(resetUtc).toISOString();
};

// Next weekly reset: Monday 04:00 in server's local timezone
const getNextWeeklyReset = (server) => {
  const serverOffset = getServerOffset(server);
  const now = Date.now();
  
  // Get current time in server's local timezone
  const nowInServerTz = new Date(now + serverOffset * 3600000);
  const year = nowInServerTz.getUTCFullYear();
  const month = nowInServerTz.getUTCMonth();
  const day = nowInServerTz.getUTCDate();
  const dayOfWeek = nowInServerTz.getUTCDay(); // 0=Sun, 1=Mon
  const hour = nowInServerTz.getUTCHours();
  const minute = nowInServerTz.getUTCMinutes();
  
  const currentMinutes = hour * 60 + minute;
  const pastReset = currentMinutes >= 240; // Past 04:00
  
  // Calculate days until next Monday
  let daysToMon;
  if (dayOfWeek === 1 && !pastReset) {
    daysToMon = 0; // It's Monday before 04:00
  } else if (dayOfWeek === 1 && pastReset) {
    daysToMon = 7; // It's Monday after 04:00
  } else {
    // Days until next Monday: (8 - dayOfWeek) % 7, but if Sunday use 1
    daysToMon = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  }
  
  // Monday 04:00 in server local time
  const mondayLocal = Date.UTC(year, month, day + daysToMon, 4, 0, 0, 0);
  
  // Convert to UTC
  const mondayUtc = mondayLocal - serverOffset * 3600000;
  return new Date(mondayUtc).toISOString();
};

// [SECTION:SIMULATION]
// === GACHA PROBABILITY ENGINE v2.0 ===
// Hybrid DP (exact) + Monte Carlo (verification/large N) approach
// Matches known WuWa rates: soft pity 65-79, hard pity 80, base 0.8%

const MAX_PITY = HARD_PITY; // P7-FIX: Use single source of truth (7E)
const GACHA_EPS = 1e-15;

// Soft pity rate function: 0.8% base, linear increase from pity 65 to 100% at 80
const getPullRate = (pity) => {
  if (pity < 65) return 0.008;
  return Math.min(0.008 + ((pity - 64) / 15.0) * 0.992, 1.0);
};

// === DYNAMIC PROGRAMMING (EXACT) ===
// Computes exact probability distribution for getting K copies in N pulls
// isWeapon: true = weapon banner (100% featured), false = character banner (50/50)
const computeDistDP = (N, isWeapon, startPity = 0, startGuar = 0, maxCopies = 10) => {
  // Clamp startPity to valid range
  const clampedPity = Math.max(0, Math.min(MAX_PITY, startPity));
  
  // DP state: dp[pulls][pity][guar?][copies] = probability
  // For weapon: no guarantee dimension
  const dp = Array.from({length: N+1}, () => 
    Array.from({length: MAX_PITY+1}, () => 
      isWeapon ? 
        Array(maxCopies+1).fill(0) :
        Array.from({length: 2}, () => Array(maxCopies+1).fill(0))
    )
  );
  
  // Initial state
  if (isWeapon) {
    dp[0][clampedPity][0] = 1.0;
  } else {
    dp[0][clampedPity][startGuar][0] = 1.0;
  }
  
  // Fill DP table
  for (let n = 0; n < N; n++) {
    for (let p = 0; p <= MAX_PITY; p++) {
      const states = isWeapon ? [null] : [0, 1];
      for (const g of states) {
        for (let k = 0; k <= maxCopies; k++) {
          const prob = isWeapon ? dp[n][p][k] : dp[n][p][g][k];
          if (prob < GACHA_EPS) continue;
          
          const rate = getPullRate(p);
          const nextPity = Math.min(MAX_PITY, p + 1);
          
          // Non-5★ outcome
          if (isWeapon) {
            dp[n+1][nextPity][k] += prob * (1 - rate);
          } else {
            dp[n+1][nextPity][g][k] += prob * (1 - rate);
          }
          
          // 5★ outcome
          const pFeatured = (isWeapon || g === 1) ? 1.0 : 0.5;
          const nextK = Math.min(k + 1, maxCopies); // Absorb overflow into maxCopies bucket
          if (isWeapon) {
            dp[n+1][0][nextK] += prob * rate; // Weapon always featured
          } else {
            dp[n+1][0][0][nextK] += prob * rate * pFeatured; // Win: copies++, guar=0
          }
          // Character loss (not featured): guar becomes 1, copies unchanged
          if (!isWeapon && g === 0) {
            dp[n+1][0][1][k] += prob * rate * 0.5;
          }
        }
      }
    }
  }
  
  // Extract final distribution
  const dist = Array(maxCopies+1).fill(0);
  for (let p = 0; p <= MAX_PITY; p++) {
    const states = isWeapon ? [null] : [0, 1];
    for (const g of states) {
      for (let k = 0; k <= maxCopies; k++) {
        dist[k] += isWeapon ? dp[N][p][k] : dp[N][p][g][k];
      }
    }
  }
  
  // Normalize
  const total = dist.reduce((a, b) => a + b, 0);
  return dist.map(x => total > 0 ? x / total : 0);
};

// === MONTE CARLO (FAST APPROXIMATION) ===
// For large N or when DP is too memory-intensive
const simulateOneRun = (isWeapon, N, startPity, startGuar) => {
  let pity = startPity, guar = startGuar, copies = 0;
  for (let i = 0; i < N; i++) {
    const rate = getPullRate(pity);
    if (Math.random() < rate) {
      const featured = (isWeapon || guar === 1) ? true : (Math.random() < 0.5);
      if (featured) copies++;
      guar = featured ? 0 : 1;
      pity = 0;
    } else {
      pity = Math.min(MAX_PITY, pity + 1);
    }
  }
  return copies;
};

const computeDistMC = (N, isWeapon, startPity = 0, startGuar = 0, maxCopies = 10, trials = 50000) => {
  const counts = Array(maxCopies + 1).fill(0);
  for (let t = 0; t < trials; t++) {
    const k = simulateOneRun(isWeapon, N, startPity, startGuar);
    counts[Math.min(k, maxCopies)]++;
  }
  return counts.map(c => c / trials);
};

// P8-FIX: HIGH-4 — Web Worker for Monte Carlo to avoid blocking UI for 1-3s
const mcWorkerCode = `
  const MAX_PITY = 80;
  const getPullRate = (pity) => {
    if (pity < 65) return 0.008;
    return Math.min(0.008 + ((pity - 64) / 15.0) * 0.992, 1.0);
  };
  const simulateOneRun = (isWeapon, N, startPity, startGuar) => {
    let pity = startPity, guar = startGuar, copies = 0;
    for (let i = 0; i < N; i++) {
      const rate = getPullRate(pity);
      if (Math.random() < rate) {
        const featured = (isWeapon || guar === 1) ? true : (Math.random() < 0.5);
        if (featured) copies++;
        guar = featured ? 0 : 1;
        pity = 0;
      } else {
        pity = Math.min(MAX_PITY, pity + 1);
      }
    }
    return copies;
  };
  self.onmessage = (e) => {
    const { N, isWeapon, startPity, startGuar, maxCopies, trials, id } = e.data;
    const counts = Array(maxCopies + 1).fill(0);
    for (let t = 0; t < trials; t++) {
      const k = simulateOneRun(isWeapon, N, startPity, startGuar);
      counts[Math.min(k, maxCopies)]++;
    }
    self.postMessage({ id, dist: counts.map(c => c / trials) });
  };
`;
let mcWorkerInstance = null;
let mcWorkerPromiseId = 0;
const mcWorkerCallbacks = new Map();
const getMCWorker = () => {
  if (mcWorkerInstance) return mcWorkerInstance;
  try {
    const blob = new Blob([mcWorkerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    mcWorkerInstance = new Worker(url);
    URL.revokeObjectURL(url);
    mcWorkerInstance.onmessage = (e) => {
      const cb = mcWorkerCallbacks.get(e.data.id);
      if (cb) { mcWorkerCallbacks.delete(e.data.id); cb(e.data.dist); }
    };
    mcWorkerInstance.onerror = () => {
      mcWorkerInstance = null; // Reset on error — will fall back to main thread
    };
    return mcWorkerInstance;
  } catch { return null; }
};
const computeDistMCAsync = (N, isWeapon, startPity = 0, startGuar = 0, maxCopies = 10, trials = 100000) => {
  const worker = getMCWorker();
  if (!worker) {
    // Fallback to main thread if Worker unavailable
    return Promise.resolve(computeDistMC(N, isWeapon, startPity, startGuar, maxCopies, trials));
  }
  return new Promise((resolve) => {
    const id = ++mcWorkerPromiseId;
    // Safety timeout: if worker doesn't respond in 10s, fall back
    const timeout = setTimeout(() => {
      mcWorkerCallbacks.delete(id);
      resolve(computeDistMC(N, isWeapon, startPity, startGuar, maxCopies, trials));
    }, 10000);
    mcWorkerCallbacks.set(id, (dist) => { clearTimeout(timeout); resolve(dist); });
    worker.postMessage({ N, isWeapon, startPity, startGuar, maxCopies, trials, id });
  });
};

// === HYBRID: Auto-select best method ===
const computeGachaDist = (N, isWeapon, startPity = 0, startGuar = 0, maxCopies = 10) => {
  // Use DP for smaller N (more accurate), MC for larger N (faster)
  if (N <= 500) {
    return computeDistDP(N, isWeapon, startPity, startGuar, maxCopies);
  } else {
    return computeDistMC(N, isWeapon, startPity, startGuar, maxCopies, 100000);
  }
};

// === HELPER FUNCTIONS ===

// Get cumulative probability P(copies >= K)
const getCumulativeProb = (dist, k) => {
  return dist.slice(k).reduce((a, b) => a + b, 0);
};

// Compute expected value and standard deviation
const computeGachaStats = (dist) => {
  let e = 0, e2 = 0;
  for (let k = 0; k < dist.length; k++) {
    e += k * dist[k];
    e2 += k * k * dist[k];
  }
  return { expected: e, stddev: Math.sqrt(e2 - e * e) };
};

// Expected pulls to reach targetK copies (value iteration)
const expectedPullsToTarget = (isWeapon, targetK, startPity = 0, startGuar = 0) => {
  if (targetK <= 0) return 0;
  
  // v[pity][guar][copies] = expected remaining pulls
  const v = Array.from({length: MAX_PITY + 1}, () =>
    isWeapon ?
      Array(targetK).fill(0) :
      Array.from({length: 2}, () => Array(targetK).fill(0))
  );
  
  // Solve backwards from copies = targetK-1 down to 0
  for (let c = targetK - 1; c >= 0; c--) {
    for (let p = MAX_PITY; p >= 0; p--) {
      const gs = isWeapon ? [null] : [0, 1];
      for (const g of gs) {
        const rate = getPullRate(p);
        const nextPity = Math.min(MAX_PITY, p + 1);
        const pFeatured = (isWeapon || g === 1) ? 1 : 0.5;
        
        let expected = 1; // This pull
        
        // Non-5★: continue at next pity
        if (isWeapon) {
          expected += (1 - rate) * v[nextPity][c];
        } else {
          expected += (1 - rate) * v[nextPity][g][c];
        }
        
        // 5★ featured: +1 copy
        const nextC = c + 1;
        if (nextC < targetK) {
          expected += rate * pFeatured * (isWeapon ? v[0][nextC] : v[0][0][nextC]);
        }
        // 5★ not featured (char only, g=0): same copies, guar=1
        if (!isWeapon && g === 0) {
          expected += rate * 0.5 * v[0][1][c];
        }
        
        if (isWeapon) {
          v[p][c] = expected;
        } else {
          v[p][g][c] = expected;
        }
      }
    }
  }
  
  return isWeapon ? v[startPity][0] : v[startPity][startGuar][0];
};

// Min pulls N such that P(copies >= targetK | N pulls) >= minProb%
const minPullsForProb = (isWeapon, targetK, minProb, startPity = 0, startGuar = 0) => {
  let low = Math.max(1, targetK * 40), high = targetK * 200;
  let ans = high;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    // Use higher MC trials in binary search to reduce stochastic oscillation
    const dist = mid <= 500
      ? computeDistDP(mid, isWeapon, startPity, startGuar, targetK)
      : computeDistMC(mid, isWeapon, startPity, startGuar, targetK, 200000);
    const pGeK = getCumulativeProb(dist, targetK) * 100;
    
    if (pGeK >= minProb) {
      ans = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return ans;
};

// Combined outcomes for pulling on both banners
const computeCombinedOutcomes = (pChar, pWeap) => {
  const both = pChar * pWeap;
  const onlyChar = pChar * (1 - pWeap);
  const onlyWeap = (1 - pChar) * pWeap;
  const atLeastOne = both + onlyChar + onlyWeap;
  const neither = 1 - atLeastOne;
  return { both, onlyChar, onlyWeap, atLeastOne, neither };
};

// Recommend astrite allocation for dual goals
const recommendDualAllocation = (charTarget, weapTarget, charPity = 0, charGuar = 0, weapPity = 0, mode = 'expected') => {
  if (mode === 'expected') {
    const eChar = expectedPullsToTarget(false, charTarget, charPity, charGuar);
    const eWeap = expectedPullsToTarget(true, weapTarget, weapPity);
    return {
      totalPulls: Math.ceil(eChar + eWeap),
      astrite: Math.ceil((eChar + eWeap) * ASTRITE_PER_PULL),
      charPulls: Math.ceil(eChar),
      weapPulls: Math.ceil(eWeap),
      confidence: '~50%'
    };
  } else {
    const targetProb = mode === 'prob90' ? 90 : 50;
    const nChar = minPullsForProb(false, charTarget, targetProb, charPity, charGuar);
    const nWeap = minPullsForProb(true, weapTarget, targetProb, weapPity);
    return {
      totalPulls: nChar + nWeap,
      astrite: (nChar + nWeap) * ASTRITE_PER_PULL,
      charPulls: nChar,
      weapPulls: nWeap,
      confidence: `~${targetProb}% each`
    };
  }
};

// simulateGacha legacy wrapper removed — P8-FIX: was dead code (never called)

// [SECTION:STATE]
const initialState = {
  server: 'Asia',
  profile: {
    uid: '', importedAt: null,
    featured: { history: [], pity5: 0, pity4: 0, guaranteed: false },
    weapon: { history: [], pity5: 0, pity4: 0 },
    standardChar: { history: [], pity5: 0, pity4: 0 },
    standardWeap: { history: [], pity5: 0, pity4: 0 },
    beginner: { history: [], pity5: 0, pity4: 0 },
  },
  calc: {
    bannerCategory: 'featured',
    selectedBanner: 'char',
    charPity: 0, charGuaranteed: false, charGuaranteedManual: false, charCopies: 1,
    weapPity: 0, weapCopies: 1,
    stdCharPity: 0, stdCharCopies: 1,
    stdWeapPity: 0, stdWeapCopies: 1,
    char4StarCopies: 1, weap4StarCopies: 1, stdChar4StarCopies: 1, stdWeap4StarCopies: 1,
    astrite: '', radiant: '', forging: '', lustrous: '',
    allocPriority: 50, // 0-100: 0=all weapon, 50=balanced, 100=all char (featured banners)
    stdAllocPriority: 50, // Same for standard banners — independent control
  },
  planner: {
    dailyAstrite: 60, luniteActive: false,
    goalType: '5star', goalBanner: 'featuredChar', goalTarget: 1, goalPulls: HARD_PITY, goalModifier: 1,
    goal4StarTarget: 1, goal4StarType: 'featured',
    addedIncome: [],
  },
  bookmarks: [],
  eventStatus: {},
  settings: { showOnboarding: true },
};

// Load saved state from persistent storage
// Key kept as v2.2 for backwards compatibility — existing user data loads seamlessly.
// If schema changes require migration, add a migration function here.
const STORAGE_KEY = 'whispering-wishes-v2.2';

// Helper to check if localStorage is available (fails in some preview modes)
const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

const storageAvailable = isStorageAvailable();

const loadFromStorage = () => {
  if (!storageAvailable) return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return {
      ...initialState,
      ...parsed,
      server: parsed.server || initialState.server,
      profile: {
        ...initialState.profile,
        ...parsed.profile,
        featured: { ...initialState.profile.featured, ...(parsed.profile?.featured || {}) },
        weapon: { ...initialState.profile.weapon, ...(parsed.profile?.weapon || {}) },
        standardChar: { ...initialState.profile.standardChar, ...(parsed.profile?.standardChar || {}) },
        standardWeap: { ...initialState.profile.standardWeap, ...(parsed.profile?.standardWeap || {}) },
        beginner: { ...initialState.profile.beginner, ...(parsed.profile?.beginner || {}) },
      },
      calc: { ...initialState.calc }, // Always start calculator fresh - no sync from saved data
      planner: { ...initialState.planner, ...parsed.planner },
      settings: { ...initialState.settings, ...parsed.settings },
      bookmarks: parsed.bookmarks || [],
      eventStatus: parsed.eventStatus || {},
    };
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
};

const saveToStorage = (state) => {
  if (!storageAvailable) return;
  try {
    const data = JSON.stringify(state);
    // Warn if approaching 5MB localStorage limit (~80% = 4MB)
    if (data.length > 4 * 1024 * 1024) {
      console.warn('Storage approaching limit:', (data.length / 1024 / 1024).toFixed(1) + 'MB');
    }
    localStorage.setItem(STORAGE_KEY, data);
  } catch (e) {
    // QuotaExceededError — storage is full
    console.error('Save failed (storage full?):', e);
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_SERVER': return { ...state, server: action.server };
    case 'SET_CALC': return { ...state, calc: { ...state.calc, [action.field]: action.value } };
    case 'SET_PLANNER': return { ...state, planner: { ...state.planner, [action.field]: action.value } };
    case 'SET_SETTINGS': return { ...state, settings: { ...state.settings, [action.field]: action.value } };
    case 'SET_EVENT_STATUS': {
      const newStatus = { ...state.eventStatus };
      if (action.status === null) { delete newStatus[action.eventKey]; } 
      else { newStatus[action.eventKey] = action.status; }
      return { ...state, eventStatus: newStatus };
    }
    case 'ADD_INCOME': {
      return {
        ...state,
        planner: {
          ...state.planner,
          addedIncome: [...state.planner.addedIncome, action.income],
        },
        calc: {
          ...state.calc,
          astrite: String((+state.calc.astrite || 0) + action.income.astrite),
          radiant: String((+state.calc.radiant || 0) + (action.income.radiant || 0)),
          lustrous: String((+state.calc.lustrous || 0) + (action.income.lustrous || 0)),
        },
      };
    }
    case 'REMOVE_INCOME': {
      const item = state.planner.addedIncome.find(i => i.id === action.id);
      if (!item) return state;
      return {
        ...state,
        planner: {
          ...state.planner,
          addedIncome: state.planner.addedIncome.filter(i => i.id !== action.id),
        },
        calc: {
          ...state.calc,
          astrite: String(Math.max(0, (+state.calc.astrite || 0) - item.astrite)),
          radiant: String(Math.max(0, (+state.calc.radiant || 0) - (item.radiant || 0))),
          lustrous: String(Math.max(0, (+state.calc.lustrous || 0) - (item.lustrous || 0))),
        },
      };
    }
    case 'CLEAR_ALL_INCOME': {
      const totalAst = state.planner.addedIncome.reduce((s, i) => s + (i.astrite || 0), 0);
      const totalRad = state.planner.addedIncome.reduce((s, i) => s + (i.radiant || 0), 0);
      const totalLus = state.planner.addedIncome.reduce((s, i) => s + (i.lustrous || 0), 0);
      return {
        ...state,
        planner: { ...state.planner, addedIncome: [] },
        calc: {
          ...state.calc,
          astrite: String(Math.max(0, (+state.calc.astrite || 0) - totalAst)),
          radiant: String(Math.max(0, (+state.calc.radiant || 0) - totalRad)),
          lustrous: String(Math.max(0, (+state.calc.lustrous || 0) - totalLus)),
        },
      };
    }
    case 'ADD_DAILY_INCOME': {
      const days = Math.max(0, Math.min(365, Number(action.days) || 0));
      const dailyTotal = (state.planner.dailyAstrite || 0) + (state.planner.luniteActive ? LUNITE_DAILY_ASTRITE : 0);
      const totalAstrite = dailyTotal * days;
      return { ...state, calc: { ...state.calc, astrite: String((+state.calc.astrite || 0) + totalAstrite) } };
    }
    // SYNC_PITY removed - calculator is fully independent from history
    case 'IMPORT_HISTORY': {
      const newProfile = { ...state.profile, importedAt: new Date().toISOString(), uid: action.uid || state.profile.uid };
      
      // Deduplicate: merge new history with existing, filtering out entries that match by timestamp + name
      const deduplicateMerge = (existing, incoming) => {
        if (!existing || existing.length === 0) return incoming;
        const existingKeys = new Set(existing.map(p => `${p.timestamp || ''}|${p.name || ''}`));
        const newEntries = incoming.filter(p => !existingKeys.has(`${p.timestamp || ''}|${p.name || ''}`));
        if (newEntries.length === 0) return existing; // All duplicates
        // Re-sort merged history by timestamp
        return [...existing, ...newEntries].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      };
      
      if (action.bannerType === 'featured') {
        const merged = deduplicateMerge(state.profile.featured?.history, action.history);
        newProfile.featured = { history: merged, pity5: action.pity5, pity4: action.pity4, guaranteed: action.guaranteed || false };
      } else if (action.bannerType === 'weapon') {
        const merged = deduplicateMerge(state.profile.weapon?.history, action.history);
        newProfile.weapon = { history: merged, pity5: action.pity5, pity4: action.pity4 };
      } else if (action.bannerType === 'standardChar') {
        const merged = deduplicateMerge(state.profile.standardChar?.history, action.history);
        newProfile.standardChar = { history: merged, pity5: action.pity5, pity4: action.pity4 };
      } else if (action.bannerType === 'standardWeap') {
        const merged = deduplicateMerge(state.profile.standardWeap?.history, action.history);
        newProfile.standardWeap = { history: merged, pity5: action.pity5, pity4: action.pity4 };
      } else if (action.bannerType === 'beginner') {
        const merged = deduplicateMerge(state.profile.beginner?.history, action.history);
        newProfile.beginner = { history: merged, pity5: action.pity5, pity4: action.pity4 };
      }
      return { ...state, profile: newProfile };
    }
    case 'SET_UID': return { ...state, profile: { ...state.profile, uid: action.uid } };
    case 'CLEAR_PROFILE': return { ...state, profile: initialState.profile };
    case 'SAVE_BOOKMARK': return { ...state, bookmarks: [...state.bookmarks, { id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: action.name, timestamp: new Date().toISOString(), ...state.calc }] };
    case 'LOAD_BOOKMARK': {
      const b = state.bookmarks.find(bm => bm.id === action.id);
      if (!b) return state;
      return {
        ...state,
        calc: {
          ...state.calc,
          charPity: b.charPity,
          charGuaranteed: b.charGuaranteed,
          weapPity: b.weapPity,
          astrite: b.astrite,
          radiant: b.radiant,
          forging: b.forging,
          lustrous: b.lustrous,
          charCopies: b.charCopies,
          weapCopies: b.weapCopies,
        },
      };
    }
    case 'DELETE_BOOKMARK': return { ...state, bookmarks: state.bookmarks.filter(b => b.id !== action.id) };
    case 'LOAD_STATE': return { ...action.state };
    case 'RESET': return initialState;
    default: return state;
  }
};

// [SECTION:CALCULATIONS]
const calcStats = (pulls, pity, guaranteed, isChar, copies) => {
  const isWeapon = !isChar;
  const startGuar = guaranteed ? 1 : 0;
  
  // Use exact DP formula for probability distribution
  const dist = computeGachaDist(pulls, isWeapon, pity, startGuar, Math.max(copies, 7));
  
  // P(X >= k) cumulative probabilities
  const pGe = (k) => getCumulativeProb(dist, k) * 100;
  
  // Expected value and standard deviation
  const stats = computeGachaStats(dist);
  
  // Expected pulls to reach target copies
  const expectedToTarget = expectedPullsToTarget(isWeapon, copies, pity, startGuar);
  
  // Worst case: hard pity every time, always losing 50/50 (subtract current pity progress)
  // Guarantee only applies to the FIRST copy — subsequent copies can still lose 50/50
  const worstCase = Math.max(0, isChar
    ? (HARD_PITY * 2 * copies - (guaranteed ? HARD_PITY : 0) - pity)
    : (HARD_PITY * copies - pity));
  const successRate = pGe(copies);
  const missingPulls = Math.max(0, Math.ceil(expectedToTarget) - pulls);
  
  // 4-star calculations (estimate: assumes hard pity every 10 pulls, ignores actual 4★ pity counter)
  // This is a floor estimate — actual 4★ count is typically higher due to base rate hits
  const fourStarCount = Math.floor(pulls / HARD_PITY_4STAR);
  const featuredFourStarCount = Math.floor(fourStarCount * FEATURED_4STAR_RATE);
  const pity4 = pulls % HARD_PITY_4STAR;
  
  return {
    successRate: successRate.toFixed(1),
    p1: pGe(1).toFixed(1),
    p2: pGe(2).toFixed(1),
    p3: pGe(3).toFixed(1),
    p4: pGe(4).toFixed(1),
    p5: pGe(5).toFixed(1),
    p6: pGe(6).toFixed(1),
    p7: pGe(7).toFixed(1),
    missingPulls,
    missingAstrite: missingPulls * ASTRITE_PER_PULL,
    fourStarCount,
    featuredFourStarCount,
    pity4,
    // New stats from DP formula
    expectedCopies: stats.expected.toFixed(2),
    stddev: stats.stddev.toFixed(2),
    expectedPullsToTarget: Math.ceil(expectedToTarget),
    worstCase,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED MASK GENERATORS & SHARED COLOR MAPS (deduplicated from v2.6)
// ═══════════════════════════════════════════════════════════════════════════════

// Unified mask gradient generator (horizontal)
// Trophy icon mapping — hoisted to module scope to avoid recreation on every render
const TROPHY_ICON_MAP = { Crown, Sparkles, Heart, Swords, Sword, Shield, Gift, Zap, Clover, Flame, Target, AlertCircle, TrendingDown, TrendingUp, Fish, Diamond, Gamepad2, Star, Trophy };

const generateMaskGradient = (fadePos, fadeIntensity) => {
  if (fadePos === undefined || fadeIntensity === undefined) {
    return 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 10%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.9) 100%)';
  }
  const maxOpacity = fadeIntensity / 100;
  const endPos = fadePos;
  if (endPos <= 10) {
    return `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,${maxOpacity}) ${endPos}%, rgba(0,0,0,${maxOpacity}) 100%)`;
  }
  const steps = [`rgba(0,0,0,0) 0%`];
  const fadeStart = Math.max(0, endPos - 40);
  if (fadeStart > 0) steps.push(`rgba(0,0,0,0) ${fadeStart}%`);
  for (let i = 1; i <= 5; i++) {
    const pos = fadeStart + (endPos - fadeStart) * (i / 5);
    const opacity = maxOpacity * (i / 5);
    steps.push(`rgba(0,0,0,${opacity.toFixed(2)}) ${pos.toFixed(0)}%`);
  }
  steps.push(`rgba(0,0,0,${maxOpacity}) 100%`);
  return `linear-gradient(to right, ${steps.join(', ')})`;
};

// Unified vertical mask gradient generator (for collection)
const generateVerticalMaskGradient = (fadePos, fadeIntensity, direction = 'bottom') => {
  const maxOpacity = fadeIntensity / 100;
  const endPos = fadePos;
  const dir = direction === 'top' ? 'to top' : 'to bottom';
  if (endPos <= 10) {
    return `linear-gradient(${dir}, rgba(0,0,0,0) 0%, rgba(0,0,0,${maxOpacity}) ${endPos}%, rgba(0,0,0,${maxOpacity}) 100%)`;
  }
  const steps = [`rgba(0,0,0,0) 0%`];
  const fadeStart = Math.max(0, endPos - 40);
  if (fadeStart > 0) steps.push(`rgba(0,0,0,0) ${fadeStart}%`);
  for (let i = 1; i <= 5; i++) {
    const pos = fadeStart + (endPos - fadeStart) * (i / 5);
    const opacity = maxOpacity * (i / 5);
    steps.push(`rgba(0,0,0,${opacity.toFixed(2)}) ${pos.toFixed(0)}%`);
  }
  steps.push(`rgba(0,0,0,${maxOpacity}) 100%`);
  return `linear-gradient(${dir}, ${steps.join(', ')})`;
};

// Shared element color maps (extracted to avoid recreation per render)
const DETAIL_ELEMENT_COLORS = {
  Fusion: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  Electro: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  Aero: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  Glacio: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' },
  Havoc: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50' },
  Spectro: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
};

const BANNER_GRADIENT_MAP = {
  Fusion: { borderColor: 'rgba(249,115,22,0.4)', bgColor: 'rgba(249,115,22,0.2)', text: 'text-orange-400' },
  Electro: { borderColor: 'rgba(168,85,247,0.4)', bgColor: 'rgba(168,85,247,0.2)', text: 'text-purple-400' },
  Aero: { borderColor: 'rgba(16,185,129,0.4)', bgColor: 'rgba(16,185,129,0.2)', text: 'text-emerald-400' },
  Glacio: { borderColor: 'rgba(6,182,212,0.4)', bgColor: 'rgba(6,182,212,0.2)', text: 'text-cyan-400' },
  Havoc: { borderColor: 'rgba(236,72,153,0.55)', bgColor: 'rgba(236,72,153,0.25)', text: 'text-pink-400' },
  Spectro: { borderColor: 'rgba(234,179,8,0.4)', bgColor: 'rgba(234,179,8,0.2)', text: 'text-yellow-400' },
};

const EVENT_ACCENT_COLORS = {
  cyan: { text: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/20' },
  pink: { text: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-500/20' },
  orange: { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/20' },
  purple: { text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/20' },
  yellow: { text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20' },
};

// Tab background component - eliminates ~400 lines of duplication across 6 tabs
const TabBackground = ({ id, glowColor = 'neutral' }) => {
  return (
    <>
      {/* Dark deep blue base */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'linear-gradient(180deg, #010204 0%, #020408 30%, #030610 60%, #020408 100%)' }} />
      {/* Subtle edge vignette */}
      <div style={{ position:'fixed', inset:0, zIndex:4, pointerEvents:'none', background:'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(2,3,6,0.5) 100%)' }} />
    </>
  );
};

// [SECTION:COMPONENTS]
const Card = memo(({ children, className = '', style = {} }) => <div className={`kuro-card ${className}`} style={style}><div className="kuro-card-inner">{children}</div></div>);
Card.displayName = 'Card';
const CardHeader = memo(({ children, action }) => <div className="kuro-header"><h3>{children}</h3>{action && <div className="kuro-header-action">{action}</div>}</div>);
CardHeader.displayName = 'CardHeader';
const CardBody = memo(({ children, className = '', style }) => <div className={`kuro-body ${className}`} style={style}>{children}</div>);
CardBody.displayName = 'CardBody';

// Character Detail Modal
const CharacterDetailModal = ({ name, onClose, imageUrl }) => {
  const data = CHARACTER_DATA[name];
  if (!data) return null;
  
  const focusTrapRef = useFocusTrap(true);
  useEscapeKey(true, onClose);
  const colors = DETAIL_ELEMENT_COLORS[data.element] || DETAIL_ELEMENT_COLORS.Spectro;
  const weaponData = WEAPON_DATA[data.bestWeapon];
  const weaponImg = DEFAULT_COLLECTION_IMAGES[data.bestWeapon];
  
  // Parse team strings into character names
  const parseTeamMembers = (teamStr) => {
    return teamStr.split('+').map(s => s.trim()).filter(Boolean);
  };
  
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} character details`}
      ref={focusTrapRef}
    >
      <div 
        className={`relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border ${colors.border}`}
        style={{ background: 'rgba(12, 16, 24, 0.95)', animation: 'scaleIn 0.3s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative h-40 overflow-hidden rounded-t-2xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
          {imageUrl && (
            <img src={imageUrl} alt={name} className="absolute right-0 bottom-0 h-48 object-contain opacity-80" style={{ transform: 'translateY(10%)' }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,16,24,0.95)] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all" aria-label="Close character details">
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>{data.element}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10">{data.weapon}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10">{data.role}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{name}</h2>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[...Array(data.rarity)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Description */}
          <p className="text-gray-300 text-sm leading-relaxed">{data.desc}</p>
          
          {/* BUILD GUIDE SECTION */}
          <div className="space-y-1">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Target size={14} className={colors.text} /> Build Guide
            </h3>
          </div>

          {/* Best Weapon - with image and stats */}
          <div className={`p-3 rounded-xl border ${colors.border} bg-gradient-to-r ${colors.bg} from-transparent`}>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Recommended Weapon</div>
            <div className="flex items-center gap-3">
              {weaponImg && (
                <img src={weaponImg} alt={data.bestWeapon} className="w-14 h-14 rounded-lg object-cover bg-neutral-800 border border-white/10 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-yellow-400 text-sm font-bold">{data.bestWeapon}</div>
                {weaponData && (
                  <>
                    <div className="text-gray-400 text-[10px] mt-0.5">{weaponData.type} • {weaponData.stat}</div>
                    <div className="text-gray-500 text-[9px] mt-1 leading-relaxed">{weaponData.passive}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Best Echoes - enhanced */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Recommended Echoes</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                  <Star size={14} className="text-cyan-400 fill-cyan-400" />
                </div>
                <div>
                  <div className="text-cyan-400 text-xs font-bold">{data.bestEchoes[0]}</div>
                  <div className="text-gray-500 text-[9px]">Main Echo</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <LayoutGrid size={14} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-purple-400 text-xs font-bold">{data.bestEchoes[1]}</div>
                  <div className="text-gray-500 text-[9px]">Echo Set</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Suggestions - with avatars */}
          <div>
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <Swords size={14} className="text-pink-400" /> Team Comps
            </h3>
            <div className="space-y-2">
              {data.teams.map((team, i) => {
                const members = parseTeamMembers(team);
                const hasImages = members.some(m => DEFAULT_COLLECTION_IMAGES[m]);
                return (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    {hasImages ? (
                      <div className="flex items-center gap-2">
                        {members.map((member, j) => {
                          const memberImg = DEFAULT_COLLECTION_IMAGES[member];
                          return (
                            <div key={j} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                              {memberImg ? (
                                <img src={memberImg} alt={member} className="w-10 h-10 rounded-lg object-cover bg-neutral-800 border border-white/10" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-white/10 flex items-center justify-center">
                                  <User size={14} className="text-gray-600" />
                                </div>
                              )}
                              <span className="text-[10px] text-gray-400 text-center leading-tight truncate w-full">{member}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-300">{team}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <Zap size={14} className={colors.text} /> Skills
            </h3>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((skill, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded bg-white/5 text-gray-300 border border-white/10">{skill}</span>
              ))}
            </div>
          </div>
          
          {/* Ascension Materials */}
          <div>
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" /> Ascension Materials
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                <div className="text-[9px] text-gray-500 mb-0.5">Boss</div>
                <div className="text-[10px] text-orange-400">{data.ascension.boss}</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                <div className="text-[9px] text-gray-500 mb-0.5">Common</div>
                <div className="text-[10px] text-purple-400">{data.ascension.common}</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                <div className="text-[9px] text-gray-500 mb-0.5">Specialty</div>
                <div className="text-[10px] text-cyan-400">{data.ascension.specialty}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Weapon Detail Modal
const WEAPON_RARITY_COLORS = {
  5: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  4: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  3: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  2: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  1: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' },
};
const WeaponDetailModal = ({ name, onClose, imageUrl }) => {
  const data = WEAPON_DATA[name];
  if (!data) return null;
  
  const focusTrapRef = useFocusTrap(true);
  useEscapeKey(true, onClose);
  const colors = WEAPON_RARITY_COLORS[data.rarity] ?? WEAPON_RARITY_COLORS[4];
  
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} weapon details`}
      ref={focusTrapRef}
    >
      <div 
        className={`relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border ${colors.border}`}
        style={{ background: 'rgba(12, 16, 24, 0.95)', animation: 'scaleIn 0.3s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-40 overflow-hidden rounded-t-2xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
          {imageUrl && (
            <img src={imageUrl} alt={name} className="absolute right-2 top-1/2 -translate-y-1/2 h-36 object-contain opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,16,24,0.95)] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all" aria-label="Close weapon details">
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>{data.type}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10">{data.stat}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{name}</h2>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[...Array(data.rarity)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-gray-300 text-sm">{data.desc}</p>
          
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Passive</div>
            <div className={`text-xs ${colors.text}`}>{data.passive}</div>
          </div>
          
          {data.bestFor && data.bestFor.length > 0 && (
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Best For</div>
              <div className="flex flex-wrap gap-1">
                {data.bestFor.map((char, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">{char}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Error Boundary — catches crashes per tab so one broken tab doesn't kill the app
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error(`[${this.props.tabName || 'Tab'}] Crash:`, error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="kuro-calc space-y-3 tab-content">
          <div className="kuro-card">
            <div className="kuro-card-inner">
              <div className="kuro-body text-center py-8">
                <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
                <div className="text-white font-bold text-sm mb-1">Something went wrong</div>
                <p className="text-gray-400 text-xs mb-4">The {this.props.tabName || 'tab'} tab encountered an error.</p>
                <button 
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="kuro-btn active-cyan text-xs px-4 py-2"
                  aria-label={`Retry loading the ${this.props.tabName || 'tab'} tab`}
                >
                  Try Again
                </button>
                {this.state.error && (
                  <details className="mt-3 text-left">
                    <summary className="text-gray-500 text-[9px] cursor-pointer">Error details</summary>
                    <pre className="mt-1 p-2 bg-black/50 rounded text-red-400 text-[8px] overflow-x-auto whitespace-pre-wrap">{this.state.error.message}</pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// P6-FIX: Root-level error boundary — catches crashes outside individual tabs (MED)
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[App] Fatal crash:', error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c12', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Whispering Wishes crashed</h1>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>Something unexpected went wrong. Your data is safe in local storage.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ padding: '10px 24px', background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)', color: '#22d3ee', borderRadius: 8, cursor: 'pointer', fontSize: 14, marginRight: 8 }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#d1d5db', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
            >
              Reload Page
            </button>
            {this.state.error && (
              <details style={{ marginTop: 16, textAlign: 'left' }}>
                <summary style={{ color: '#6b7280', fontSize: 11, cursor: 'pointer' }}>Error details</summary>
                <pre style={{ marginTop: 8, padding: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 8, color: '#f87171', fontSize: 10, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{this.state.error.message}{'\n'}{this.state.error.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const TabButton = memo(({ active, onClick, children, tabRef, tabId }) => {
  const childArray = React.Children.toArray(children);
  const icon = childArray.find(child => React.isValidElement(child));
  const text = childArray.find(child => typeof child === 'string')?.trim();
  const btnRef = useRef(null);
  
  useEffect(() => {
    try {
      if (active && btnRef.current && tabRef?.current) {
        requestAnimationFrame(() => {
          const btn = btnRef.current;
          const nav = tabRef?.current;
          if (!btn || !nav) return;
          const indicator = nav.querySelector('.tab-indicator');
          if (indicator) {
            indicator.style.left = `${btn.offsetLeft + btn.offsetWidth * 0.2}px`;
            indicator.style.width = `${btn.offsetWidth * 0.6}px`;
            indicator.style.background = `linear-gradient(90deg, rgba(251,191,36,0.6), rgba(251,191,36,1), rgba(251,191,36,0.6))`;
            indicator.style.boxShadow = `0 0 12px rgba(251,191,36,0.5)`;
          }
        });
      }
    } catch (e) { /* ignore indicator errors */ }
  }, [active, tabRef]);
  
  return (
    <button 
      ref={btnRef}
      onClick={() => { haptic.light(); onClick(); }}
      role="tab"
      id={tabId ? `tab-${tabId}` : undefined}
      aria-selected={active}
      aria-controls={tabId ? `tabpanel-${tabId}` : undefined}
      tabIndex={active ? 0 : -1}
      aria-label={`${text || 'Navigation'} tab`}
      className={`relative flex flex-col items-center gap-0.5 px-2.5 py-2 text-[10px] font-medium transition-all duration-300 whitespace-nowrap group ${active ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${active ? 'bg-yellow-500/10 shadow-lg shadow-yellow-500/25' : 'group-hover:bg-white/5 group-hover:shadow-md group-hover:shadow-white/5'}`}>
        {icon}
      </div>
      <span className="relative z-10">{text}</span>
    </button>
  );
});
TabButton.displayName = 'TabButton';

const TIMER_COLOR_MAP = { yellow: 'text-yellow-400', pink: 'text-pink-400', cyan: 'text-cyan-400', orange: 'text-orange-400', purple: 'text-purple-400' };

const CountdownTimer = memo(({ endDate, color = 'yellow', compact = false, alwaysShow = false, onExpire, recalcFn }) => {
  const [currentEnd, setCurrentEnd] = useState(endDate);
  const [time, setTime] = useState(() => getTimeRemaining(endDate));
  const expiredRef = useRef(false);
  const rafRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const currentEndRef = useRef(currentEnd);
  
  // Keep ref in sync with state
  useEffect(() => { currentEndRef.current = currentEnd; }, [currentEnd]);
  
  // Update end date when prop changes
  useEffect(() => {
    setCurrentEnd(endDate);
    setTime(getTimeRemaining(endDate));
    expiredRef.current = false;
  }, [endDate]);
  
  // Main timer logic using requestAnimationFrame for accuracy
  useEffect(() => {
    let isMounted = true;
    
    const updateTimer = () => {
      if (!isMounted) return;
      
      const now = Date.now();
      // Only update state once per second to avoid excessive renders
      if (now - lastUpdateRef.current >= 1000 || lastUpdateRef.current === 0) {
        lastUpdateRef.current = now;
        
        const end = currentEndRef.current;
        const t = getTimeRemaining(end);
        if (t.expired && recalcFn) {
          // Auto-rollover for recurring timers (daily/weekly)
          const newEnd = recalcFn();
          setCurrentEnd(newEnd);
          setTime(getTimeRemaining(newEnd));
          expiredRef.current = false;
        } else {
          setTime(t);
          if (t.expired && !expiredRef.current) {
            expiredRef.current = true;
            if (onExpire) setTimeout(onExpire, 500);
          }
        }
      }
      
      rafRef.current = requestAnimationFrame(updateTimer);
    };
    
    // Start the animation frame loop
    rafRef.current = requestAnimationFrame(updateTimer);
    
    // Handle visibility change - update immediately when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        lastUpdateRef.current = 0; // Force immediate update
        const end = currentEndRef.current;
        const t = getTimeRemaining(end);
        if (t.expired && recalcFn) {
          const newEnd = recalcFn();
          setCurrentEnd(newEnd);
          setTime(getTimeRemaining(newEnd));
          expiredRef.current = false;
        } else {
          setTime(t);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle page focus (backup for visibility)
    const handleFocus = () => {
      lastUpdateRef.current = 0;
      setTime(getTimeRemaining(currentEndRef.current));
    };
    window.addEventListener('focus', handleFocus);
    
    // Cleanup
    return () => {
      isMounted = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [onExpire, recalcFn]);
  
  // For daily/weekly resets, never show "ENDED" - recalculate next reset
  if (time.expired && !alwaysShow) return <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Ended</span>;
  if (time.expired && alwaysShow) {
    // If expired but alwaysShow, show "0h 0m 0s" briefly until next tick updates
    return <span className={`font-mono text-xs ${TIMER_COLOR_MAP[color] || TIMER_COLOR_MAP.purple}`}>0h 0m 0s</span>;
  }
  
  const textColor = TIMER_COLOR_MAP[color] || TIMER_COLOR_MAP.purple;
  
  // Unified compact style matching Tracker tab
  if (compact) {
    return (
      <span className={`${textColor} font-mono text-xs font-medium`}>
        {time.days > 0 && `${time.days}d `}{String(time.hours).padStart(2, '0')}h {String(time.minutes).padStart(2, '0')}m {String(time.seconds).padStart(2, '0')}s
      </span>
    );
  }
  
  const timerBoxStyle = { backgroundColor: 'rgba(12,16,24,0.7)', backdropFilter: 'blur(8px)' };
  
  return (
    <div className="flex items-center gap-1">
      {time.days > 0 && (
        <>
          <div className="rounded-lg px-2 py-1 text-center border border-white/10" style={timerBoxStyle}>
            <div className="text-white font-bold text-sm kuro-number">{time.days}</div>
            <div className="text-gray-400 text-[9px] uppercase tracking-wider">{time.days === 1 ? 'Day' : 'Days'}</div>
          </div>
          <span className={`${textColor} font-bold text-xs opacity-60`}>:</span>
        </>
      )}
      <div className="rounded-lg px-2 py-1 text-center border border-white/10" style={timerBoxStyle}>
        <div className="text-white font-bold text-sm kuro-number">{String(time.hours).padStart(2, '0')}</div>
        <div className="text-gray-400 text-[9px] uppercase tracking-wider">Hr</div>
      </div>
      <span className={`${textColor} font-bold text-xs opacity-60`}>:</span>
      <div className="rounded-lg px-2 py-1 text-center border border-white/10" style={timerBoxStyle}>
        <div className="text-white font-bold text-sm kuro-number">{String(time.minutes).padStart(2, '0')}</div>
        <div className="text-gray-400 text-[9px] uppercase tracking-wider">Min</div>
      </div>
      <span className={`${textColor} font-bold text-xs opacity-60`}>:</span>
      <div className="rounded-lg px-2 py-1 text-center border border-white/10" style={timerBoxStyle}>
        <div className={`font-bold text-sm kuro-number ${textColor}`}>{String(time.seconds).padStart(2, '0')}</div>
        <div className="text-gray-400 text-[9px] uppercase tracking-wider">Sec</div>
      </div>
    </div>
  );
});
CountdownTimer.displayName = 'CountdownTimer';

const PityRing = memo(({ value = 0, max = 80, size = 52, strokeWidth = 4, color = '#fbbf24', glowColor = 'rgba(251,191,36,0.4)', label, sublabel, softPityStart }) => {
  const safeValue = Number(value) || 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(safeValue / max, 1);
  const offset = circumference * (1 - pct);
  
  // Soft pity zone: configurable threshold, defaults to 65 for max=80
  const softThreshold = softPityStart != null ? softPityStart : (max === HARD_PITY ? SOFT_PITY_START : null);
  const showSoftZone = softThreshold != null && softThreshold < max;
  const isSoftPity = showSoftZone && safeValue >= softThreshold;
  
  const softStart = showSoftZone ? softThreshold / max : 0;
  const softLen = showSoftZone ? (max - softThreshold) / max : 0;
  const softDash = softLen * circumference;
  const softGap = circumference - softDash;
  const softOffset = -softStart * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className={isSoftPity ? 'pulse-subtle' : ''} role="img" aria-label={`Pity: ${safeValue} out of ${max}${isSoftPity ? ', in soft pity zone' : ''}`}>
        <circle className="pity-ring-track" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} />
        {showSoftZone && (
          <circle 
            cx={size/2} cy={size/2} r={radius} 
            strokeWidth={strokeWidth} 
            stroke="rgba(251, 146, 60, 0.2)"
            fill="none"
            strokeDasharray={`${softDash} ${softGap}`} 
            strokeDashoffset={softOffset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            strokeLinecap="butt"
          />
        )}
        <circle className="pity-ring-fill" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size/2} ${size/2})`} style={{'--ring-glow': glowColor}} />
        <text className="pity-ring-text" x={size/2} y={size/2} fontSize={size * 0.28} fill={color}>{safeValue}</text>
      </svg>
      {label && <div className="text-gray-300 text-[9px] mt-0.5">{label}</div>}
      {sublabel && <div className="text-gray-500 text-[9px]">{sublabel}</div>}
    </div>
  );
});
PityRing.displayName = 'PityRing';

// [SECTION:BACKGROUND]
// Wave phase functions shared by both components
const _wf1 = (x, y, t) => x * 0.012 + Math.sin(y * 0.006) * 3.0 + Math.cos(y * 0.003 + x * 0.002) * 1.5 - t * 0.35;
const _wf2 = (x, y, t) => (x * 0.007 + y * 0.009) + Math.sin(x * 0.004 - y * 0.003) * 2.2 + Math.cos(x * 0.002) * 1.2 - t * 0.25;
const _wf3 = (x, y, t) => y * 0.011 + Math.sin(x * 0.008) * 2.5 + Math.cos(y * 0.004 + x * 0.003) * 1.3 - t * 0.2;

// LAYER A: Smooth ambient glow gradient — z-index 1
const BackgroundGlow = ({ oledMode, animationsEnabled = true }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!animationsEnabled) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const buf = document.createElement('canvas');
    const bctx = buf.getContext('2d');
    let animId;
    const SC = 0.08;
    let w, h, bw, bh;
    
    // OLED mode uses darker base color
    const bgColor = oledMode ? 'rgb(0,0,0)' : 'rgb(2,3,6)';
    
    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      bw = Math.ceil(w * SC);
      bh = Math.ceil(h * SC);
      buf.width = bw;
      buf.height = bh;
    };
    init();
    window.addEventListener('resize', init);
    
    let lastFrame = 0;
    let paused = false;
    const handleVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', handleVisibility);
    
    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (paused || t - lastFrame < 66) return;
      lastFrame = t;
      const time = t * 0.001;
      bctx.fillStyle = bgColor;
      bctx.fillRect(0, 0, bw, bh);
      
      const gs = 2;
      for (let by = 0; by < bh; by += gs) {
        for (let bx = 0; bx < bw; bx += gs) {
          const sx = bx / SC;
          const sy = by / SC;
          
          const h1 = Math.sin(_wf1(sx, sy, time));
          const h2 = Math.sin(_wf2(sx, sy, time));
          const h3 = Math.sin(_wf3(sx, sy, time));
          const totalH = h1 * 0.7 + h2 * 0.5 + h3 * 0.4;
          
          const d = 10;
          const slX = (Math.sin(_wf1(sx+d,sy,time))-h1)*0.7 + (Math.sin(_wf2(sx+d,sy,time))-h2)*0.5 + (Math.sin(_wf3(sx+d,sy,time))-h3)*0.4;
          const slY = (Math.sin(_wf1(sx,sy+d,time))-h1)*0.7 + (Math.sin(_wf2(sx,sy+d,time))-h2)*0.5 + (Math.sin(_wf3(sx,sy+d,time))-h3)*0.4;
          const tilt = Math.sqrt(slX*slX + slY*slY);
          
          const spec = Math.pow(Math.max(0, 1 - tilt * 2.0), 2);
          const peak = Math.max(0, totalH / 1.5) * 0.22;
          const gI = spec * 0.3 + peak;
          
          if (gI > 0.008) {
            const a = Math.min(gI * 0.7, 0.3);
            const blend = Math.max(0, Math.min(1, (totalH + 1.6) / 3.2));
            const rr = Math.round(6 + blend * 25);
            const gg = Math.round(12 + blend * 40);
            const bb = Math.round(45 + blend * 70);
            bctx.fillStyle = `rgba(${rr},${gg},${bb},${a})`;
            bctx.fillRect(bx, by, gs, gs);
          }
        }
      }
      
      ctx.clearRect(0, 0, w, h);
      ctx.filter = 'blur(20px)';
      ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, h);
      ctx.filter = 'none';
    };
    animId = requestAnimationFrame(draw);
    
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [oledMode, animationsEnabled]);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1}} aria-hidden="true" role="presentation" />;
};

// LAYER B: Triangle wave mask — traveling wavefront specular, z-index 2
const TriangleMirrorWave = ({ oledMode, animationsEnabled = true }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!animationsEnabled) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    
    const TW = 36;
    const TH = 31;
    const HALF = TW / 2;
    let w, h, cols, rows, seeds;
    
    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      cols = Math.ceil(w / HALF) + 4;
      rows = Math.ceil(h / TH) + 4;
      seeds = new Float32Array(cols * rows);
      for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random() * 6.28;
    };
    init();
    window.addEventListener('resize', init);
    
    let lastFrame = 0;
    let paused = false;
    const handleVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', handleVisibility);
    
    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (paused || t - lastFrame < 66) return;
      lastFrame = t;
      ctx.clearRect(0, 0, w, h);
      const time = t * 0.001;
      
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const isUp = ((c + r) % 2 + 2) % 2 === 0;
          const cx = c * HALF;
          const cy = r * TH + (isUp ? TH * 0.33 : TH * 0.66);
          
          if (cx < -HALF || cx > w + HALF || cy < -TH || cy > h + TH) continue;
          
          const seedIdx = ((r + 1) * cols + (c + 1));
          const seed = seedIdx >= 0 && seedIdx < seeds.length ? seeds[seedIdx] : 0;
          
          // Minimal seed for subtle per-triangle variation
          const so = seed * 0.05;
          
          // Wave heights at this triangle center
          const v1 = Math.sin(_wf1(cx, cy, time) + so);
          const v2 = Math.sin(_wf2(cx, cy, time) + so * 0.7);
          const v3 = Math.sin(_wf3(cx, cy, time) + so * 0.5);
          const totalH = v1 * 0.7 + v2 * 0.5 + v3 * 0.4;
          
          // Slope from finite differences (traveling wavefront detection)
          const dd = 4;
          const hR = Math.sin(_wf1(cx+dd,cy,time)+so)*0.7 + Math.sin(_wf2(cx+dd,cy,time)+so*0.7)*0.5 + Math.sin(_wf3(cx+dd,cy,time)+so*0.5)*0.4;
          const hD = Math.sin(_wf1(cx,cy+dd,time)+so)*0.7 + Math.sin(_wf2(cx,cy+dd,time)+so*0.7)*0.5 + Math.sin(_wf3(cx,cy+dd,time)+so*0.5)*0.4;
          const slopeX = hR - totalH;
          const slopeY = hD - totalH;
          const tilt = Math.sqrt(slopeX * slopeX + slopeY * slopeY);
          
          // Specular: flat faces (low tilt) catch light → traveling bright bands
          const specular = Math.pow(Math.max(0, 1 - tilt * 3.5), 5);
          // Peak height glow: wave crests glow slightly
          const peakGlow = Math.max(0, totalH / 2.0) * 0.12;
          
          const intensity = specular * 0.45 + peakGlow;
          if (intensity < 0.015) continue;
          
          const x = c * HALF;
          const y = r * TH;
          ctx.beginPath();
          if (isUp) {
            ctx.moveTo(x - HALF, y + TH);
            ctx.lineTo(x, y);
            ctx.lineTo(x + HALF, y + TH);
          } else {
            ctx.moveTo(x - HALF, y);
            ctx.lineTo(x + HALF, y);
            ctx.lineTo(x, y + TH);
          }
          ctx.closePath();
          
          const sp = Math.min(specular * 3, 1);
          const ri = Math.round(60 + sp * 120);
          const gi = Math.round(85 + sp * 100);
          const bi = Math.round(150 + sp * 80);
          const alpha = Math.min(intensity * 0.45, 0.25);
          ctx.fillStyle = `rgba(${ri},${gi},${bi},${alpha})`;
          ctx.fill();
        }
      }
    };
    animId = requestAnimationFrame(draw);
    
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [oledMode, animationsEnabled]);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 2}} aria-hidden="true" role="presentation" />;
};

const BannerCard = memo(({ item, type, stats, bannerImage, visualSettings, endDate, timerColor }) => {
  const isChar = type === 'character';
  const style = BANNER_GRADIENT_MAP[item.element] || BANNER_GRADIENT_MAP.Fusion;
  const imgUrl = item.imageUrl || bannerImage;
  
  // Use unified mask generator
  const maskGradient = visualSettings 
    ? generateMaskGradient(visualSettings.fadePosition, visualSettings.fadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.pictureOpacity / 100 : 0.9;
  
  return (
    <div className="relative overflow-hidden rounded-xl border" style={{ height: '190px', isolation: 'isolate', zIndex: 5, borderColor: style.borderColor }}>
      {imgUrl && (
        <img 
          src={imgUrl} 
          alt={item.name} 
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            zIndex: 1,
            opacity: pictureOpacity,
            maskImage: maskGradient,
            WebkitMaskImage: maskGradient
          }}
          loading="eager"

          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      
      {endDate && (
        <div className="absolute top-2 right-2 z-20">
          <CountdownTimer endDate={endDate} color={timerColor || 'yellow'} />
        </div>
      )}
      
      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {item.isNew && <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold" style={{textShadow: 'none'}}>NEW</span>}
            <span className={`text-[10px] px-2 py-0.5 rounded ${style.text} border`} style={{ borderColor: style.borderColor, backgroundColor: style.bgColor }}>{isChar ? item.element : item.type}</span>
          </div>
          <h4 className="font-bold text-base text-white leading-tight">{item.name}</h4>
          {item.title && <p className="text-gray-200 text-[10px] mt-0.5 line-clamp-1">{item.title}</p>}
        </div>
        
        <div className={stats ? 'mb-14' : ''}>
          <div className="text-gray-300 text-[9px] mb-0.5 uppercase tracking-wider">Featured 4★</div>
          <div className="flex gap-1 flex-wrap">
            {item.featured4Stars.map(n => <span key={n} className="text-[9px] text-cyan-300 bg-cyan-500/30 px-1.5 py-0.5 rounded backdrop-blur-sm">{n}</span>)}
          </div>
        </div>
      </div>
      
      {stats && (
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/15 rounded-b-xl" style={{background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)', padding: '10px 12px 12px', textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)'}}>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3">
                <div className="text-center">
                  <div className={`font-bold text-sm ${isChar ? 'text-yellow-400' : 'text-pink-400'}`}>{stats.pity5}<span className="text-gray-500 text-[9px]">/{HARD_PITY}</span></div>
                  <div className="text-gray-400 text-[9px] mt-0.5">5★ Pity</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-sm">{stats.pity4}<span className="text-gray-500 text-[9px]">/10</span></div>
                  <div className="text-gray-400 text-[9px] mt-0.5">4★ Pity</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm">{stats.totalPulls}</div>
                  <div className="text-gray-400 text-[9px] mt-0.5">Convenes</div>
                </div>
              </div>
              {isChar && (
                <div className={`text-[9px] px-2 py-1 rounded backdrop-blur-sm ${stats.guaranteed ? 'bg-emerald-500/30 text-emerald-400' : 'bg-neutral-800/50 text-gray-400'}`}>
                  {stats.guaranteed ? '✓ Guaranteed' : '50/50'}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
});
BannerCard.displayName = 'BannerCard';

const EventCard = memo(({ event, server, bannerImage, visualSettings, status, onStatusChange }) => {
  const [resetTick, setResetTick] = useState(0);
  const isDaily = event.dailyReset;
  const isWeekly = event.weeklyReset;
  const isRecurring = !isDaily && !isWeekly && event.resetType && /^~?\d+\s*(days?|d|h|m)?$/i.test(event.resetType.trim());
  
  const endDate = useMemo(() => {
    if (isDaily) return getNextDailyReset(server);
    if (isWeekly) return getNextWeeklyReset(server);
    if (isRecurring) return getRecurringEventEnd(event.currentEnd, event.resetType, server);
    return getServerAdjustedEnd(event.currentEnd, server);
  }, [event, server, isDaily, isWeekly, isRecurring, resetTick]);
  
  const handleExpire = useCallback(() => {
    if (isDaily || isWeekly || isRecurring) setResetTick(t => t + 1);
  }, [isDaily, isWeekly, isRecurring]);
  
  const recalcFn = useMemo(() => {
    if (isDaily) return () => getNextDailyReset(server);
    if (isWeekly) return () => getNextWeeklyReset(server);
    if (isRecurring) return () => getRecurringEventEnd(event.currentEnd, event.resetType, server);
    return null;
  }, [isDaily, isWeekly, isRecurring, server, event]);
  
  const colors = EVENT_ACCENT_COLORS[event.accentColor] || EVENT_ACCENT_COLORS.cyan;
  const imgUrl = bannerImage;
  
  const maskGradient = visualSettings 
    ? generateMaskGradient(visualSettings.shadowFadePosition, visualSettings.shadowFadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.shadowOpacity / 100 : 0.9;
  
  const isDone = status === 'done';
  const isSkipped = status === 'skipped';
  
  return (
    <div className={`relative overflow-hidden rounded-xl border ${isDone ? 'border-emerald-500/30' : isSkipped ? 'border-gray-600/30' : colors.border}`} style={{ height: '190px', isolation: 'isolate', zIndex: 5, opacity: isSkipped ? 0.5 : 1 }}>
      {imgUrl && (
        <img 
          src={imgUrl} 
          alt={event.name} 
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            zIndex: 1,
            opacity: pictureOpacity,
            maskImage: maskGradient,
            WebkitMaskImage: maskGradient,
            filter: isSkipped ? 'grayscale(0.8)' : isDone ? 'grayscale(0.3)' : 'none'
          }}
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      
      {isDone && <div className="absolute inset-0 z-[2] bg-emerald-900/20" />}
      
      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' }}>
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h4 className={`font-bold text-sm ${isDone ? 'text-emerald-400' : isSkipped ? 'text-gray-500' : colors.text}`}>
              {isDone && <CheckCircle size={12} className="inline mr-1 -mt-0.5" />}
              {isSkipped && <X size={12} className="inline mr-1 -mt-0.5" />}
              {event.name}
            </h4>
            <p className="text-gray-200 text-[10px]">{event.subtitle}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-gray-400 text-[9px] mb-1">{isDaily ? 'Resets in' : isWeekly ? 'Weekly reset' : 'Ends in'}</div>
            <CountdownTimer endDate={endDate} color={event.color} alwaysShow={isDaily || isWeekly || isRecurring} onExpire={handleExpire} recalcFn={recalcFn} />
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <div className={`inline-block px-2 py-0.5 rounded text-[9px] font-medium ${isDone ? 'bg-emerald-500/20 text-emerald-400' : isSkipped ? 'bg-gray-500/20 text-gray-500 line-through' : `${colors.bg} ${colors.text}`} backdrop-blur-sm`}>
            {event.rewards}
          </div>
          {onStatusChange && (
            <div className="flex gap-1">
              {status ? (
                <button onClick={() => onStatusChange(null)} className="px-2 py-0.5 rounded text-[9px] bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm transition-colors">
                  Undo
                </button>
              ) : (
                <>
                  <button onClick={() => onStatusChange('done')} className="px-2.5 py-1 rounded text-[9px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 backdrop-blur-sm transition-colors min-w-[52px] text-center">
                    <Check size={10} className="inline -mt-0.5" /> Done
                  </button>
                  <button onClick={() => onStatusChange('skipped')} className="px-2.5 py-1 rounded text-[9px] bg-white/10 text-gray-400 hover:bg-white/20 backdrop-blur-sm transition-colors min-w-[52px] text-center">
                    <X size={10} className="inline -mt-0.5" /> Skip
                  </button>
                </>
              )}
            </div>
          )}
          {!onStatusChange && (
            <div className="text-gray-400 text-[9px]">{event.resetType}</div>
          )}
        </div>
      </div>
    </div>
  );
});
EventCard.displayName = 'EventCard';

const ProbabilityBar = memo(({ label, value, color = 'cyan' }) => (
  <div className="flex items-center gap-2" role="meter" aria-label={`${label}: ${value}%`} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <span className="text-gray-400 text-[10px] w-12">{label}</span>
    <div className="flex-1 h-5 bg-neutral-800 rounded overflow-hidden">
      <div className={`h-full ${color === 'cyan' ? 'bg-cyan-500' : color === 'pink' ? 'bg-pink-500' : 'bg-yellow-500'} transition-all flex items-center justify-end pr-1`} style={{ width: `${Math.max(value, 1)}%` }}>
        {value > 10 && <span className="text-[9px] text-black font-bold">{value}%</span>}
      </div>
    </div>
    {value <= 10 && <span className="text-[10px] text-gray-400 w-10">{value}%</span>}
  </div>
));
ProbabilityBar.displayName = 'ProbabilityBar';

// Admin banner storage key
const ADMIN_BANNER_KEY = 'whispering-wishes-admin-banners';
const ADMIN_HASH = 'd0a9f110419bf9487d97f9f99822f6f15c8cd98fed3097a0a0714674aa27feda';

// [SECTION:COLLECTION-GRID]
// Shared component for all collection grids (5★/4★/3★ chars & weapons)
const CollectionGridCard = memo(({ name, count, imgUrl, framing, isSelected, owned, collMask, collOpacity, glowClass, ownedBg, ownedBorder, countLabel, countColor, onClickCard, framingMode, setEditingImage, imageKey, isNew }) => (
  <div 
    className={`relative overflow-hidden border rounded-lg text-center ${!framingMode ? 'collection-card' : ''} cursor-pointer ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/50' : owned ? `${ownedBg} ${ownedBorder} ${glowClass}` : 'bg-neutral-800/50 border-neutral-700/50'}`} 
    style={{ height: '140px' }}
    onClick={() => {
      if (framingMode) {
        setEditingImage(imageKey);
      } else if (onClickCard) {
        haptic.light();
        onClickCard();
      }
    }}
  >
    {isNew && (
      <div className="absolute top-1.5 left-1.5 z-20 px-1.5 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase bg-yellow-500 text-black" style={{boxShadow: '0 0 8px rgba(251,191,36,0.5)', textShadow: 'none'}}>New</div>
    )}
    {imgUrl && (
      <img 
        src={imgUrl} 
        alt={name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ 
          transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)`,
          opacity: owned ? collOpacity : 0.3,
          filter: owned ? 'none' : 'grayscale(100%)',
          maskImage: collMask, 
          WebkitMaskImage: collMask
        }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    )}
    {isSelected && (
      <div className="absolute top-1 right-1 z-20 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
        <span className="text-black text-[10px]">✓</span>
      </div>
    )}
    <div className="absolute bottom-0 left-0 right-0 z-10 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
      {owned ? (
        <div className={`${countColor} font-bold text-xl`}>{countLabel}</div>
      ) : (
        <div className="text-gray-500 font-bold text-xl">—</div>
      )}
      <div className={`text-[9px] truncate ${owned ? 'text-gray-200' : 'text-gray-500'}`}>{name}</div>
    </div>
  </div>
), (prev, next) => 
  prev.name === next.name && prev.count === next.count && prev.imgUrl === next.imgUrl &&
  prev.isSelected === next.isSelected && prev.owned === next.owned && prev.collMask === next.collMask &&
  prev.collOpacity === next.collOpacity && prev.framingMode === next.framingMode && prev.isNew === next.isNew &&
  prev.framing.zoom === next.framing.zoom && prev.framing.x === next.framing.x && prev.framing.y === next.framing.y
);
CollectionGridCard.displayName = 'CollectionGridCard';

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTED REUSABLE COMPONENTS (Part 4 deduplication)
// ═══════════════════════════════════════════════════════════════════════════════

// Visual slider group — eliminates ~286 lines of duplication across admin modal + mini window
const VisualSliderGroup = memo(({ title, color, sliders, visualSettings, saveVisualSettings, compact = false, directionControl = null }) => {
  const colorMap = {
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', accent: 'accent-cyan-500', activeBg: 'bg-cyan-500/30', activeBorder: 'border-cyan-500/50' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', accent: 'accent-emerald-500', activeBg: 'bg-emerald-500/30', activeBorder: 'border-emerald-500/50' },
    pink: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', accent: 'accent-pink-500', activeBg: 'bg-pink-500/30', activeBorder: 'border-pink-500/50' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', accent: 'accent-purple-500', activeBg: 'bg-purple-500/30', activeBorder: 'border-purple-500/50' },
  };
  const c = colorMap[color] || colorMap.cyan;

  const renderSlider = (slider) => (
    <div key={slider.key}>
      <div className={`flex justify-between text-[${compact ? '9px' : '10px'}] mb-${compact ? '0.5' : '1'}`}>
        <span className={compact ? 'text-gray-400' : 'text-gray-300'}>{compact ? slider.shortLabel : slider.label}</span>
        <span className={c.text}>{visualSettings[slider.key] ?? slider.fallback ?? 50}%</span>
      </div>
      <input type="range" min="0" max="100" value={visualSettings[slider.key] ?? slider.fallback ?? 50} onChange={(e) => saveVisualSettings({ ...visualSettings, [slider.key]: parseInt(e.target.value, 10) })} className={`w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer ${c.accent}`} aria-label={slider.label} />
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-2 border-t border-white/10 pt-2">
        <h4 className={`${c.text} text-[9px] font-medium uppercase tracking-wider`}>{title}</h4>
        {directionControl && (
          <div className="flex gap-1 mb-1.5">
            <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'top' })} className={`flex-1 py-1 rounded text-[8px] ${visualSettings[directionControl.key] === 'top' ? `${c.activeBg} ${c.text}` : 'bg-neutral-700 text-gray-500'}`}>↑ Top</button>
            <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'bottom' })} className={`flex-1 py-1 rounded text-[8px] ${visualSettings[directionControl.key] === 'bottom' ? `${c.activeBg} ${c.text}` : 'bg-neutral-700 text-gray-500'}`}>↓ Bottom</button>
          </div>
        )}
        <div className="space-y-1.5">{sliders.map(renderSlider)}</div>
      </div>
    );
  }

  return (
    <div className={`${c.bg} ${c.border} border rounded p-3`}>
      <h3 className={`${c.text} text-sm font-medium mb-3`}>{title}</h3>
      {directionControl && (
        <div className="space-y-3 mb-3">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-300">Fade Direction</span>
              <span className={c.text}>{visualSettings[directionControl.key] === 'top' ? '↑ Top' : '↓ Bottom'}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'top' })} className={`flex-1 py-1.5 rounded text-[10px] transition-all ${visualSettings[directionControl.key] === 'top' ? `${c.activeBg} ${c.text} border ${c.activeBorder}` : 'bg-neutral-700 text-gray-400'}`}>↑ Fade to Top</button>
              <button onClick={() => saveVisualSettings({ ...visualSettings, [directionControl.key]: 'bottom' })} className={`flex-1 py-1.5 rounded text-[10px] transition-all ${visualSettings[directionControl.key] === 'bottom' ? `${c.activeBg} ${c.text} border ${c.activeBorder}` : 'bg-neutral-700 text-gray-400'}`}>↓ Fade to Bottom</button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-3">{sliders.map(renderSlider)}</div>
    </div>
  );
});
VisualSliderGroup.displayName = 'VisualSliderGroup';

// Visual slider configuration data — shared between admin modal and mini window
const VISUAL_SLIDER_CONFIGS = [
  {
    title: 'Banner Card Settings', compactTitle: 'Featured Banners', color: 'cyan',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'fadePosition' },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'fadeIntensity' },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'pictureOpacity' },
    ],
  },
  {
    title: 'Standard Banner Settings', compactTitle: 'Standard Banners', color: 'emerald',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'standardFadePosition', fallback: 50 },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'standardFadeIntensity', fallback: 100 },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'standardOpacity', fallback: 100 },
    ],
  },
  {
    title: 'Event Card Settings', compactTitle: 'Event Cards', color: 'pink',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'shadowFadePosition' },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'shadowFadeIntensity' },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'shadowOpacity' },
    ],
  },
  {
    title: 'Collection Card Settings', compactTitle: 'Collection Cards', color: 'purple',
    directionControl: { key: 'collectionFadeDirection' },
    subtitle: 'Vertical fade (top ↔ bottom)',
    sliders: [
      { label: 'Fade Position', shortLabel: 'Fade Pos', key: 'collectionFadePosition' },
      { label: 'Fade Intensity', shortLabel: 'Intensity', key: 'collectionFadeIntensity' },
      { label: 'Picture Opacity', shortLabel: 'Opacity', key: 'collectionOpacity' },
    ],
  },
];

// Collection grid section — eliminates ~170 lines of copy-paste across 5 grids
const CollectionGridSection = memo(({ title, starColor, items, collMask, collOpacity, glowClass, ownedBg, ownedBorder, countColor, countPrefix, totalCount, hasActiveFilters, collectionImages, withCacheBuster, getImageFraming, framingMode, editingImage, setEditingImage, activeBanners, setDetailModal, dataLookup, dataType, isCharacter }) => {
  if (items.length === 0) return <p className="text-gray-500 text-xs text-center py-4">No items match your filters</p>;
  const ownedCount = items.filter(([_, c]) => c > 0).length;
  return (
    <>
      <div className="text-[10px] text-gray-400 mb-2 text-right">{ownedCount}/{items.length} shown{hasActiveFilters ? ` (${totalCount} total)` : ''}</div>
      <div className="grid grid-cols-3 gap-2">
        {items.map(([name, count]) => {
          const imgUrl = collectionImages[name];
          const imageKey = `collection-${name}`;
          const isNew = isCharacter
            ? activeBanners.characters?.some(c => c.name === name && c.isNew)
            : activeBanners.weapons?.some(w => w.name === name && w.isNew);
          return (
            <CollectionGridCard
              key={name} name={name} count={count}
              imgUrl={withCacheBuster(imgUrl)} framing={getImageFraming(imageKey)}
              isSelected={framingMode && editingImage === imageKey}
              owned={count > 0} collMask={collMask} collOpacity={collOpacity}
              glowClass={glowClass} ownedBg={ownedBg} ownedBorder={ownedBorder}
              countLabel={count > 0 ? `${countPrefix}${countPrefix === 'S' ? count - 1 : count}` : ''} countColor={countColor}
              framingMode={framingMode} setEditingImage={setEditingImage} imageKey={imageKey}
              onClickCard={dataLookup[name] ? () => setDetailModal({ show: true, type: dataType, name, imageUrl: imgUrl }) : null}
              isNew={isNew}
            />
          );
        })}
      </div>
    </>
  );
});
CollectionGridSection.displayName = 'CollectionGridSection';

// P8-FIX: HIGH-15 — Extracted pity counter input component (eliminates ~120 lines of duplication across 4 banners)
const PityCounterInput = memo(({ label, pity, onPityChange, copies, maxCopies, onCopiesChange, fourStarCopies, maxFourStar, onFourStarChange, color, softColor, softGlow, sliderClass, softPityClass, SoftPityIcon, ariaPrefix }) => (
  <div>
    <div className="flex items-center gap-4 mb-2">
      <PityRing value={pity} max={80} size={56} strokeWidth={4} color={pity >= 65 ? softColor : color} glowColor={pity >= 65 ? softGlow : `${color}66`} />
      <div className="flex-1">
        <div className="text-sm font-medium mb-1" style={{ color }}>{label}</div>
        <input type="range" min="0" max="80" value={pity} onChange={e => onPityChange(+e.target.value)} className={`kuro-slider ${sliderClass}`} aria-label={`${ariaPrefix} pity`} />
        {pity >= 65 && <p className={`text-[10px] ${softPityClass}`} style={{ color: softColor }}><SoftPityIcon size={10} className="inline mr-1" style={{ color: softColor, filter: `drop-shadow(0 0 4px ${softColor})` }} />Soft Pity Zone!</p>}
      </div>
      <div className="text-right">
        <span style={{ color: pity >= 65 ? softColor : color }} className={`text-2xl kuro-number ${pity >= 65 ? softPityClass : ''}`}>{pity}</span>
        <span className="text-gray-200 text-sm">/80</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="flex items-center justify-between">
        <span style={{ color }}>5★ Target:</span>
        <input type="text" inputMode="numeric" value={copies} onChange={e => { const v = parseInt(e.target.value, 10) || 1; onCopiesChange(Math.max(1, Math.min(maxCopies, v))); }} className="kuro-input kuro-input-sm" aria-label={`${ariaPrefix} 5-star copies`} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-purple-400">4★ Target:</span>
        <input type="text" inputMode="numeric" value={fourStarCopies} onChange={e => { const v = parseInt(e.target.value, 10) || 0; onFourStarChange(Math.max(0, Math.min(maxFourStar, v))); }} className="kuro-input kuro-input-sm" aria-label={`${ariaPrefix} 4-star copies`} />
      </div>
    </div>
  </div>
));
PityCounterInput.displayName = 'PityCounterInput';

// Results card — eliminates ~160 lines of copy-paste across 4 calculator results
const CalcResultsCard = memo(({ title, stats, accentStatClass, copiesLabel, copies, isFeatured = true }) => (
  <Card>
    <CardHeader>{title}</CardHeader>
    <CardBody className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className={`kuro-stat ${accentStatClass}`}>
          <div className={`text-3xl kuro-number ${parseFloat(stats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(stats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(stats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{stats.successRate}%</div>
          <div className="text-gray-400 text-[10px] mt-1">P(≥{copies} copies)</div>
        </div>
        <div className="kuro-stat kuro-stat-cyan">
          <div className="text-2xl kuro-number text-cyan-400">~{stats.expectedCopies}</div>
          <div className="text-gray-400 text-[10px] mt-1">Expected Copies</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="kuro-stat kuro-stat-red">
          <div className="text-xl kuro-number text-red-400">{stats.missingPulls > 0 ? stats.missingPulls : '✓'}</div>
          <div className="text-gray-400 text-[10px] mt-1">{stats.missingPulls > 0 ? 'Pulls Needed (avg)' : 'Ready!'}</div>
        </div>
        <div className="kuro-stat kuro-stat-gray">
          <div className="text-xl kuro-number text-gray-400">{stats.worstCase}</div>
          <div className="text-gray-400 text-[10px] mt-1">Worst Case</div>
        </div>
      </div>
      {isFeatured ? (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="kuro-stat kuro-stat-purple"><span className="text-purple-400 kuro-number">~{stats.fourStarCount}</span><div className="text-gray-400 text-[9px] mt-0.5">4★ Expected</div></div>
          <div className="kuro-stat kuro-stat-purple"><span className="text-purple-400 kuro-number">~{stats.featuredFourStarCount}</span><div className="text-gray-400 text-[9px] mt-0.5">Featured 4★</div></div>
        </div>
      ) : (
        <div className="kuro-stat kuro-stat-purple text-xs">
          <span className="text-purple-400 kuro-number">~{stats.fourStarCount}</span>
          <div className="text-gray-400 text-[9px] mt-0.5">4★ Expected</div>
        </div>
      )}
    </CardBody>
  </Card>
));
CalcResultsCard.displayName = 'CalcResultsCard';

// Standard banner card — eliminates ~110 lines of copy-paste between standard char/weap banners
const StandardBannerSection = memo(({ bannerImage, altText, title, subtitle, items, itemKey, profileData, visualSettings }) => {
  const stdMask = generateMaskGradient(visualSettings.standardFadePosition ?? 50, visualSettings.standardFadeIntensity ?? 100);
  const stdOpacity = (visualSettings.standardOpacity ?? 100) / 100;
  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/30" style={{ height: '190px', isolation: 'isolate', zIndex: 5 }}>
      {bannerImage && (
        <img
          src={bannerImage}
          alt={altText}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1, opacity: stdOpacity, maskImage: stdMask, WebkitMaskImage: stdMask }}
          loading="eager"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' }}>
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-sm text-cyan-400">{title}</h3>
            <span className="text-gray-200 text-[10px]">{subtitle}</span>
          </div>
          <div className="text-gray-300 text-[9px] mb-1 uppercase tracking-wider">Available 5★</div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
            {items.map(item => <span key={typeof item === 'string' ? item : item[itemKey]} className="text-[9px] text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">{typeof item === 'string' ? item : item[itemKey]}</span>)}
          </div>
        </div>
        {profileData?.history?.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/15 rounded-b-xl" style={{background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)', padding: '10px 12px 12px'}}>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3">
                <div className="text-center">
                  <div className="text-cyan-400 font-bold text-sm">{profileData.pity5}<span className="text-gray-500 text-[9px]">/{HARD_PITY}</span></div>
                  <div className="text-gray-400 text-[9px] mt-0.5">5★ Pity</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-sm">{profileData.pity4}<span className="text-gray-500 text-[9px]">/10</span></div>
                  <div className="text-gray-400 text-[9px] mt-0.5">4★ Pity</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm">{profileData.history.length}</div>
                  <div className="text-gray-400 text-[9px] mt-0.5">Convenes</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
StandardBannerSection.displayName = 'StandardBannerSection';

// Import guide data — eliminates ~90 lines of repetitive numbered-step JSX
const IMPORT_GUIDE_DATA = {
  pc: {
    title: 'PC',
    steps: [
      <>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span></>,
      <>Run <span className="text-gray-100 font-medium">PowerShell script</span> or upload <span className="text-gray-100 font-medium">Client.log</span></>,
      <>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></>,
      <><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</>,
    ],
  },
  android: {
    title: 'Android (11+)',
    steps: [
      <>Download <span className="text-gray-100 font-medium">Ascent app</span> (v2.1.6+) to get URL</>,
      <>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span> → Import URL</>,
      <>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></>,
      <><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</>,
    ],
  },
  ps5: {
    title: 'PS5 (In-Game Browser)',
    steps: [
      <>Open WuWa → Convene → History → tap <span className="text-gray-100 font-medium">"View Details"</span></>,
      <>Press <span className="text-gray-100 font-medium">"Options"</span> → Select <span className="text-gray-100 font-medium">"Page Information"</span></>,
      <>Find <span className="text-gray-100 font-medium">player_id</span> and <span className="text-gray-100 font-medium">record_id</span> in the URL</>,
      <>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span> → Enter IDs → Import</>,
      <>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></>,
      <><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</>,
    ],
    footer: '⚠️ URL valid for ~24 hours only',
  },
};

const ImportGuide = memo(({ platform }) => {
  const guide = IMPORT_GUIDE_DATA[platform];
  if (!guide) return null;
  return (
    <div className="p-3 bg-white/5 border border-white/10 rounded text-[10px] text-gray-200 space-y-2">
      <p className="text-gray-100 font-medium text-xs">{guide.title}</p>
      {guide.steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
          <p>{step}</p>
        </div>
      ))}
      {guide.footer && <p className="text-gray-400 text-[9px] pt-1 border-t border-white/10">{guide.footer}</p>}
    </div>
  );
});
ImportGuide.displayName = 'ImportGuide';

// ═══════════════════════════════════════════════════════════════════════════════
// END EXTRACTED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Load custom banners from localStorage
const loadCustomBanners = () => {
  if (!storageAvailable) return null;
  try {
    const saved = localStorage.getItem(ADMIN_BANNER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

// Get active banners (custom or default)
const getActiveBanners = () => {
  const custom = loadCustomBanners();
  return custom || CURRENT_BANNERS;
};

// [SECTION:STATIC_DATA] - Static collection data (moved outside component for perf)
const DEFAULT_COLLECTION_IMAGES = {
  // 5★ Resonators (by release order)
  'Jiyan': 'https://i.ibb.co/00C5Sqj/Jiyan-Full-Sprite.webp',
  'Calcharo': 'https://i.ibb.co/tM11rtrL/Calcharo-Full-Sprite.webp',
  'Encore': 'https://i.ibb.co/rGZBZ4HV/Encore-Full-Sprite.webp',
  'Jianxin': 'https://i.ibb.co/ZDxNGkj/Jianxin-Full-Sprite.webp',
  'Lingyang': 'https://i.ibb.co/gbjK568S/Lingyang-Full-Sprite.webp',
  'Verina': 'https://i.ibb.co/mV6qxb5h/Verina-Full-Sprite.webp',
  'Yinlin': 'https://i.ibb.co/S79CF3R3/Yinlin-Full-Sprite.webp',
  'Changli': 'https://i.ibb.co/mr6BwwP0/Changli-Full-Sprite.webp',
  'Jinhsi': 'https://i.ibb.co/fG9sf6cc/Jinhsi-Full-Sprite.webp',
  'Shorekeeper': 'https://i.ibb.co/svHmQWYB/Shorekeeper-Full-Sprite.webp',
  'Camellya': 'https://i.ibb.co/6Rg494Ld/Camellya-Full-Sprite.webp',
  'Xiangli Yao': 'https://i.ibb.co/27jds05D/Xiangli-Yao-Full-Sprite.webp',
  'Zhezhi': 'https://i.ibb.co/0VpsfXkK/Zhezhi-Full-Sprite.webp',
  'Carlotta': 'https://i.ibb.co/bRBx4Ymx/Carlotta-Full-Sprite.webp',
  'Roccia': 'https://i.ibb.co/b548Jj2Y/Roccia-Full-Sprite.webp',
  'Phoebe': 'https://i.ibb.co/6SdsQ7M/Phoebe-Full-Sprite.webp',
  'Brant': 'https://i.ibb.co/CDg2QgM/Brant-Full-Sprite.webp',
  'Cantarella': 'https://i.ibb.co/jZs3MWvV/Cantarella-Full-Sprite.webp',
  'Zani': 'https://i.ibb.co/5XLvmGfC/Zani-Full-Sprite-1.webp',
  'Ciaccona': 'https://i.ibb.co/N6dKs9zy/Ciaccona-Full-Sprite.webp',
  'Cartethyia': 'https://i.ibb.co/QFR5LVdc/Cartethyia-Full-Sprite.webp',
  'Lupa': 'https://i.ibb.co/8n4kck2M/Lupa-Full-Sprite.webp',
  'Augusta': 'https://i.ibb.co/V0TXt2Ty/Augusta-Full-Sprite.webp',
  'Galbrena': 'https://i.ibb.co/rK0yjSr6/Galbrena-Full-Sprite.webp',
  'Iuno': 'https://i.ibb.co/5WmnWgtG/Iuno-Full-Sprite.webp',
  'Luuk Herssen': 'https://i.ibb.co/23dF1tWT/Luuk-Herssen-Full-Sprite.webp',
  'Aemeath': 'https://i.ibb.co/0pBQpMwv/Aemeath-Full-Sprite.webp',
  'Mornye': 'https://i.ibb.co/QvyQ33zv/Mornye-Full-Sprite.webp',
  'Rover': 'https://i.ibb.co/V0zwhc58/Rover-1.webp',
  'Chisa': 'https://i.ibb.co/x8zB67Vh/Chisa-Full-Sprite.webp',
  'Phrolova': 'https://i.ibb.co/Nd0HbF4v/Phrolova-Full-Sprite.webp',
  'Qiuyuan': 'https://i.ibb.co/JRvP5fnx/Qiuyuan-Full-Sprite.webp',
  'Lynae': 'https://i.ibb.co/Mym9KBBM/Lynae-Full-Sprite.webp',
  // 4★ Resonators
  'Aalto': 'https://i.ibb.co/v81v3Hq/Aalto-Full-Sprite.webp',
  'Baizhi': 'https://i.ibb.co/4Ztm8DCG/Baizhi-Full-Sprite.webp',
  'Chixia': 'https://i.ibb.co/r2SVVmPv/Chixia-Full-Sprite.webp',
  'Danjin': 'https://i.ibb.co/CK3XQCpM/Danjin-Full-Sprite.webp',
  'Yangyang': 'https://i.ibb.co/kV1hBqbv/Yangyang-Full-Sprite.webp',
  'Sanhua': 'https://i.ibb.co/yc0XTQVB/Sanhua-Full-Sprite.webp',
  'Taoqi': 'https://i.ibb.co/qM2r22RR/Taoqi-Full-Sprite.webp',
  'Yuanwu': 'https://i.ibb.co/p6ZQJkcC/Yuanwu-Full-Sprite.webp',
  'Mortefi': 'https://i.ibb.co/xq8hFgpc/Mortefi-Full-Sprite.webp',
  'Youhu': 'https://i.ibb.co/Zzc0PMWX/Youhu-Full-Sprite.webp',
  'Lumi': 'https://i.ibb.co/rRy25xmt/Lumi-Full-Sprite.webp',
  'Buling': 'https://i.ibb.co/fGZBRCWp/Buling-Full-Sprite.webp',
  // 5★ Weapons
  'Verdant Summit': 'https://i.ibb.co/5gjYYrHj/Verdant-Summit.webp',
  'Emerald of Genesis': 'https://i.ibb.co/HTj8Lp7N/Weapon-Emerald-of-Genesis.webp',
  'Static Mist': 'https://i.ibb.co/cKVzgTJ4/Weapon-Static-Mist.webp',
  'Abyss Surges': 'https://i.ibb.co/FLVx6xwt/Abyss-Surges.webp',
  'Lustrous Razor': 'https://i.ibb.co/mCmkydWk/Weapon-Lustrous-Razor.webp',
  'Cosmic Ripples': 'https://i.ibb.co/XfGk2sVG/Cosmic-Ripples.webp',
  'Stringmaster': 'https://i.ibb.co/wNGPxnmH/Stringmaster.webp',
  'Ages of Harvest': 'https://i.ibb.co/5gGBmzX8/Ages-of-Harvest.webp',
  'Blazing Brilliance': 'https://i.ibb.co/gLJbgvwg/Blazing-Brilliance.webp',
  'Rime-Draped Sprouts': 'https://i.ibb.co/NgNshLYy/Rime-Draped-Sprouts.png',
  "Verity's Handle": 'https://i.ibb.co/k2hFQfx8/Veritys-Handle.webp',
  'Stellar Symphony': 'https://i.ibb.co/yBB4Kzxs/Stellar-Symphony.webp',
  'Red Spring': 'https://i.ibb.co/Cp3d2vg2/Red-Spring.webp',
  'The Last Dance': 'https://i.ibb.co/zhtJWLk0/The-Last-Dance.png',
  'Tragicomedy': 'https://i.ibb.co/4RRD3mLv/Tragicomedy.png',
  'Luminous Hymn': 'https://i.ibb.co/prdDZjKg/Luminous-Hymn.png',
  'Unflickering Valor': 'https://i.ibb.co/PGbr24Xp/Unflickering-Valor.png',
  'Whispers of Sirens': 'https://i.ibb.co/YT73fDrB/Whispers-of-Sirens.webp',
  'Blazing Justice': 'https://i.ibb.co/pjbhYHP4/Blazing-Justice.webp',
  'Woodland Aria': 'https://i.ibb.co/8nXkG8d5/Woodland-Aria.png',
  "Defier's Thorn": 'https://i.ibb.co/KpG4cbZJ/Defier-s-Thorn.webp',
  'Wildfire Mark': 'https://i.ibb.co/RGqLJKGK/Wildfire-Mark.webp',
  'Lethean Elegy': 'https://i.ibb.co/YF3fJtF7/Lethean-Elegy.webp',
  'Thunderflare Dominion': 'https://i.ibb.co/d062x9ZH/Thunderflare-Dominion.webp',
  "Moongazer's Sigil": 'https://i.ibb.co/zhF435g4/Moongazers-Sigil.webp',
  'Lux & Umbra': 'https://i.ibb.co/FqVkK4Tn/Lux-Umbra.webp',
  'Emerald Sentence': 'https://i.ibb.co/chmx3GgM/Emerald-Sentence.webp',
  'Kumokiri': 'https://i.ibb.co/VWxG9pSF/Kumokiri.webp',
  'Spectrum Blaster': 'https://i.ibb.co/qLC341Sv/Spectrum-Blaster.webp',
  'Starfield Calibrator': 'https://i.ibb.co/tTDkFQ7W/Starfield-Calibrator.webp',
  // v3.1 weapons - using placeholder until official images available
  'Everbright Polestar': 'https://i.ibb.co/4g4RbTv7/Weapon-Everbright-Polestar.webp',
  "Daybreaker's Spine": 'https://i.ibb.co/tpn30Lrm/6982b58a79a3b099e1bd0d48i-CAFZ7lo03.webp',
  // 4★ Weapons
  'Overture': 'https://i.ibb.co/nMXdhNTW/Overture.png',
  "Ocean's Gift": 'https://i.ibb.co/rfk6Fgwx/Oceans-Gift.png',
  "Bloodpact's Pledge": 'https://i.ibb.co/V0WH0NSV/Bloodpacts-Pledge-1.webp',
  'Waltz in Masquerade': 'https://i.ibb.co/5XXfstH6/Waltz-in-Masquerade.webp',
  'Legend of Drunken Hero': 'https://i.ibb.co/v65yf4Bd/Legend-of-Drunken-Hero.webp',
  'Romance in Farewell': 'https://i.ibb.co/BKc9hdKC/Romance-in-Farewell.webp',
  'Fables of Wisdom': 'https://i.ibb.co/whCyQys6/Fables-of-Wisdom.webp',
  'Meditations on Mercy': 'https://i.ibb.co/pBBrZM0b/Meditations-on-Mercy.webp',
  'Call of the Abyss': 'https://i.ibb.co/Z92nYnW/Call-of-the-Abyss.webp',
  'Somnoire Anchor': 'https://i.ibb.co/N2cJ3qc7/Somnoire-Anchor.webp',
  'Fusion Accretion': 'https://i.ibb.co/xSMHxtL0/Fusion-Accretion.webp',
  'Celestial Spiral': 'https://i.ibb.co/ZRT3sr7g/Celestial-Spiral.webp',
  'Relativistic Jet': 'https://i.ibb.co/nM5rjSNw/Relativistic-Jet.webp',
  'Endless Collapse': 'https://i.ibb.co/gZtL25jN/Endless-Collapse.webp',
  'Waning Redshift': 'https://i.ibb.co/27NQSk1n/Waning-Redshif.webp',
  'Beguiling Melody': 'https://i.ibb.co/wZXxz8MC/Beguiling-Melody.webp',
  'Boson Astrolabe': 'https://i.ibb.co/RkcX6zQK/Boson-Astrolabe-1.webp',
  'Pulsation Bracer': 'https://i.ibb.co/k2kVPjmf/Pulsation-Bracer.webp',
  'Phasic Homogenizer': 'https://i.ibb.co/RpKTNDq1/Phasic-Homogenizer.webp',
  'Laser Shearer': 'https://i.ibb.co/hFqKgw50/Laser-Shearer.webp',
  'Radiance Cleaver': 'https://i.ibb.co/WNxbm8DB/Radiance-Cleaver.webp',
  'Aureate Zenith': 'https://i.ibb.co/0j0M2Bwm/Aureate-Zenith.webp',
  'Radiant Dawn': 'https://i.ibb.co/RkGdFttY/Radiant-Dawn.webp',
  'Aether Strike': 'https://i.ibb.co/5XJNVHgT/Aether-Strike.webp',
  'Solar Flame': 'https://i.ibb.co/YMsf52M/Solar-Flame.webp',
  'Feather Edge': 'https://i.ibb.co/fzG8JpvG/Feather-Edge.webp',
  // Swords
  'Training Sword': 'https://i.ibb.co/23XjFZHD/Training-Sword.webp',
  'Tyro Sword': 'https://i.ibb.co/Qv4nYxF1/Tyro-Sword.webp',
  'Guardian Sword': 'https://i.ibb.co/8LSknxRS/Guardian-Sword.webp',
  'Sword of Voyager': 'https://i.ibb.co/TBCX9fFQ/Sword-of-Voyager.webp',
  'Originite: Type II': 'https://i.ibb.co/j9M4LLSf/Originite-Type-II.webp',
  'Sword of Night': 'https://i.ibb.co/csfb39w/Sword-of-Night.webp',
  'Commando of Conviction': 'https://i.ibb.co/RkTdFgNG/Commando-of-Conviction.webp',
  'Scale Slasher': 'https://i.ibb.co/Ng7QmthQ/Scale-Slasher.webp',
  'Sword#18': 'https://i.ibb.co/wrWDmBcp/Sword18.webp',
  'Lunar Cutter': 'https://i.ibb.co/tpSR66cR/Lunar-Cutter.webp',
  'Lumingloss': 'https://i.ibb.co/dsJQhndm/Lumingloss.webp',
  // Rectifiers
  'Rectifier of Voyager': 'https://i.ibb.co/KjNy5C91/Rectifier-of-Voyager.webp',
  'Rectifier of Night': 'https://i.ibb.co/ksQ3Zswf/Rectifier-of-Night.webp',
  'Variation': 'https://i.ibb.co/5WZP5mKD/Variation.webp',
  'Tyro Rectifier': 'https://i.ibb.co/Df8dXQRf/Tyro-Rectifier.webp',
  'Training Rectifier': 'https://i.ibb.co/Y7rT1gJw/Training-Rectifier.webp',
  'Originite: Type V': 'https://i.ibb.co/9H5GNPVw/Originite-Type-V.webp',
  'Rectifier#25': 'https://i.ibb.co/B9T1f3f/Rectifier25.webp',
  'Jinzhou Keeper': 'https://i.ibb.co/WvvYvwx0/Jinzhou-Keeper.webp',
  'Comet Flare': 'https://i.ibb.co/xKTWZWzs/Comet-Flare.webp',
  'Guardian Rectifier': 'https://i.ibb.co/Wp618BH3/Guardian-Rectifier.webp',
  'Augment': 'https://i.ibb.co/Mk44Y5W4/Augment.webp',
  // Broadblades
  'Broadblade of Night': 'https://i.ibb.co/m5kvbBJH/Broadblade-of-Night.webp',
  'Discord': 'https://i.ibb.co/p6L36v9V/Discord.webp',
  // Gauntlets
  'Tyro Gauntlets': 'https://i.ibb.co/NgZL4WFR/Tyro-Gauntlets.webp',
  'Training Gauntlets': 'https://i.ibb.co/b50Nnc2w/Training-Gauntlets.webp',
  'Hollow Mirage': 'https://i.ibb.co/JjP9sjJm/Hollow-Mirage.webp',
  'Stonard': 'https://i.ibb.co/yn59hz0y/Stonard.webp',
  'Gauntlets#21': 'https://i.ibb.co/XxFKztMj/Gauntlets21-D.webp',
  'Amity Accord': 'https://i.ibb.co/tpxP1SM8/Amity-Accord.webp',
  'Marcato': 'https://i.ibb.co/hFX9MK4t/Marcato.webp',
  'Gauntlets of Night': 'https://i.ibb.co/dFF1GyP/Gauntlets-of-Night.webp',
  'Guardian Gauntlets': 'https://i.ibb.co/k2vd2xW0/Guardian-Gauntlets.webp',
  'Originite: Type III': 'https://i.ibb.co/bg4GXQbS/Originite-Type-III.webp',
  'Gauntlets of Voyager': 'https://i.ibb.co/tVq4bTZ/Gauntlets-of-Voyager.webp',
  // Pistols
  'Pistols#26': 'https://i.ibb.co/FLJ14pcp/Pistols26.webp',
  'Originite: Type IV': 'https://i.ibb.co/wZ2tjtwj/Originite-Type-IV.webp',
  'Pistols of Voyager': 'https://i.ibb.co/pjWf99Qb/Pistols-of-Voyager.webp',
  'Novaburst': 'https://i.ibb.co/NdnmMWcp/Novaburst.webp',
  'Thunderbolt': 'https://i.ibb.co/99rqCmM0/Thunderbolt.webp',
  'Undying Flame': 'https://i.ibb.co/XfM9BJVX/Undying-Flame.webp',
  'Guardian Pistols': 'https://i.ibb.co/m59fPcVF/Guardian-Pistols.webp',
  'Tyro Pistols': 'https://i.ibb.co/Ldtk0QGN/Tyro-Pistols.webp',
  'Training Pistols': 'https://i.ibb.co/PsZhn5d0/Training-Pistols.webp',
  'Pistols of Night': 'https://i.ibb.co/zhf1hxsG/Pistols-of-Night.webp',
  'Cadenza': 'https://i.ibb.co/bRHfTQh1/Cadenza.webp',
  // Missing weapons
  'Originite: Type I': 'https://i.ibb.co/398KxX0f/Weapon-Originite-Type-I.webp',
  'Broadblade of Voyager': 'https://i.ibb.co/bMYZxLtK/Weapon-Broadblade-of-Voyager.webp',
  'Helios Cleaver': 'https://i.ibb.co/Kj719h8m/Weapon-Helios-Cleaver.webp',
  'Dauntless Evernight': 'https://i.ibb.co/PvhJ1Cw2/Dauntless-Evernight.webp',
  // TODO: Missing images - these weapons exist in collection lists but have no image yet
  'Autumntrace': '',
  'Tyro Gauntlets': '',
};

// Release order for sorting (based on first banner appearance)
const RELEASE_ORDER = [
  // 1.0 - Launch (May 2024)
  'Rover', 'Jiyan', 'Yinlin', 'Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina',
  'Aalto', 'Baizhi', 'Chixia', 'Danjin', 'Yangyang', 'Sanhua', 'Taoqi', 'Yuanwu', 'Mortefi',
  // 1.1
  'Jinhsi', 'Changli', 'Youhu',
  // 1.2
  'Zhezhi', 'Xiangli Yao',
  // 1.3
  'Shorekeeper', 'Lumi',
  // 1.4
  'Camellya',
  // 2.0
  'Carlotta', 'Roccia',
  // 2.1
  'Phoebe', 'Brant',
  // 2.2
  'Cantarella', 'Buling',
  // 2.3
  'Zani', 'Ciaccona',
  // 2.4
  'Cartethyia', 'Lupa',
  // 2.5
  'Phrolova',
  // 2.6
  'Augusta', 'Iuno',
  // 2.7
  'Galbrena', 'Qiuyuan',
  // 2.8
  'Chisa',
  // 3.0
  'Lynae', 'Mornye',
  // 3.1 (unreleased)
  'Aemeath', 'Luuk Herssen',
];

// All known character names (for filtering weapons vs characters)
const ALL_CHARACTERS = new Set([
  // 5★
  'Rover', 'Jiyan', 'Yinlin', 'Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina',
  'Jinhsi', 'Changli', 'Zhezhi', 'Xiangli Yao', 'Shorekeeper', 'Camellya',
  'Carlotta', 'Roccia', 'Phoebe', 'Brant', 'Cantarella', 'Zani', 'Ciaccona',
  'Cartethyia', 'Lupa', 'Phrolova', 'Augusta', 'Iuno', 'Galbrena', 'Qiuyuan',
  'Chisa', 'Lynae', 'Mornye', 'Luuk Herssen', 'Aemeath',
  // 4★
  'Aalto', 'Baizhi', 'Chixia', 'Danjin', 'Yangyang', 'Sanhua', 'Taoqi', 'Yuanwu', 
  'Mortefi', 'Youhu', 'Lumi', 'Buling',
]);

// Complete lists for Collection display (show all, grey out unpossessed)
// Standard 5★ characters (Tidal Chorus / 50-50 loss pool) — update when new standard chars are added
const STANDARD_5STAR_CHARACTERS = new Set(['Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina']);
const STANDARD_5STAR_WEAPONS = new Set(['Lustrous Razor', 'Emerald of Genesis', 'Static Mist', 'Abyss Surges', 'Cosmic Ripples']);

const ALL_5STAR_RESONATORS = [
  'Rover', 'Jiyan', 'Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina', 'Yinlin',
  'Jinhsi', 'Changli', 'Zhezhi', 'Xiangli Yao', 'Shorekeeper', 'Camellya',
  'Carlotta', 'Roccia', 'Phoebe', 'Brant', 'Cantarella', 'Zani', 'Ciaccona',
  'Cartethyia', 'Lupa', 'Phrolova', 'Augusta', 'Iuno', 'Galbrena', 'Qiuyuan',
  'Chisa', 'Lynae', 'Mornye', 'Luuk Herssen', 'Aemeath',
];

const ALL_4STAR_RESONATORS = [
  'Aalto', 'Baizhi', 'Chixia', 'Danjin', 'Yangyang', 'Sanhua', 'Taoqi', 'Yuanwu', 
  'Mortefi', 'Youhu', 'Lumi', 'Buling',
];

const ALL_5STAR_WEAPONS = [
  'Verdant Summit', 'Lustrous Razor', 'Emerald of Genesis', 'Static Mist', 'Abyss Surges', 'Cosmic Ripples',
  'Stringmaster', 'Ages of Harvest', 'Blazing Brilliance', 'Rime-Draped Sprouts', "Verity's Handle",
  'Stellar Symphony', 'Red Spring', 'The Last Dance', 'Tragicomedy', 'Luminous Hymn', 
  'Unflickering Valor', 'Whispers of Sirens', 'Blazing Justice', 'Woodland Aria',
  "Defier's Thorn", 'Wildfire Mark', 'Lethean Elegy', 'Thunderflare Dominion', "Moongazer's Sigil",
  'Lux & Umbra', 'Emerald Sentence', 'Kumokiri', 'Spectrum Blaster', 'Starfield Calibrator',
  'Everbright Polestar', "Daybreaker's Spine",
  'Radiance Cleaver', 'Laser Shearer', 'Phasic Homogenizer', 'Pulsation Bracer', 'Boson Astrolabe',
];

const ALL_4STAR_WEAPONS = [
  'Overture', "Ocean's Gift", "Bloodpact's Pledge", 'Waltz in Masquerade', 'Legend of Drunken Hero',
  'Romance in Farewell', 'Fables of Wisdom', 'Meditations on Mercy', 'Call of the Abyss',
  'Somnoire Anchor', 'Fusion Accretion', 'Celestial Spiral', 'Relativistic Jet', 'Endless Collapse',
  'Waning Redshift', 'Beguiling Melody', 'Lumingloss', 'Lunar Cutter', 'Commando of Conviction',
  'Scale Slasher', 'Jinzhou Keeper', 'Comet Flare', 'Augment', 'Variation', 'Hollow Mirage',
  'Stonard', 'Amity Accord', 'Marcato', 'Novaburst', 'Thunderbolt', 'Undying Flame', 'Cadenza',
  'Discord', 'Helios Cleaver', 'Dauntless Evernight',
  'Autumntrace', 'Solar Flame', 'Feather Edge',
];

const ALL_3STAR_WEAPONS = [
  'Training Sword', 'Tyro Sword', 'Guardian Sword', 'Sword of Voyager', 'Originite: Type II',
  'Sword of Night', 'Sword#18', 'Training Rectifier', 'Tyro Rectifier', 'Guardian Rectifier',
  'Rectifier of Voyager', 'Rectifier of Night', 'Originite: Type V', 'Rectifier#25',
  'Training Gauntlets', 'Tyro Gauntlets', 'Guardian Gauntlets', 'Gauntlets of Voyager',
  'Gauntlets of Night', 'Originite: Type III', 'Gauntlets#21', 'Training Pistols', 'Tyro Pistols',
  'Guardian Pistols', 'Pistols of Voyager', 'Pistols of Night', 'Originite: Type IV', 'Pistols#26',
  'Broadblade of Night', 'Broadblade of Voyager', 'Originite: Type I',
  'Aureate Zenith', 'Radiant Dawn', 'Aether Strike',
];

// Weapon release order for sorting (based on first banner appearance)
const WEAPON_RELEASE_ORDER = [
  // 1.0 - Standard 5★ + Launch
  'Verdant Summit', 'Lustrous Razor', 'Emerald of Genesis', 'Static Mist', 'Abyss Surges', 'Cosmic Ripples',
  'Stringmaster',
  // 1.1
  'Ages of Harvest', 'Blazing Brilliance',
  // 1.2
  'Rime-Draped Sprouts', "Verity's Handle",
  // 1.3
  'Stellar Symphony',
  // 1.4
  'Red Spring',
  // 2.0
  'The Last Dance', 'Tragicomedy',
  // 2.1
  'Luminous Hymn', 'Unflickering Valor',
  // 2.2
  'Whispers of Sirens',
  // 2.3
  'Blazing Justice', 'Woodland Aria',
  // 2.4
  "Defier's Thorn", 'Wildfire Mark',
  // 2.5
  'Lethean Elegy',
  // 2.6
  'Thunderflare Dominion', "Moongazer's Sigil",
  // 2.7
  'Lux & Umbra', 'Emerald Sentence',
  // 2.8
  'Kumokiri',
  // 3.0
  'Spectrum Blaster', 'Starfield Calibrator',
  // 3.1
  'Everbright Polestar', "Daybreaker's Spine",
];

// Tab navigation order for swipe gestures
const TAB_ORDER = ['tracker', 'events', 'calculator', 'planner', 'analytics', 'gathering', 'profile'];

// Podium medal colors (gold, silver, bronze) for leaderboard/ranking displays
const MEDAL_COLORS = ['#fbbf24', '#c0c0c0', '#cd7f32'];

// [SECTION:MAINAPP]
function WhisperingWishesInner() {
  // Check admin-only lockout (5-min cooldown after 5 failed attempts — does NOT lock the app)
  const [adminLockedUntil, setAdminLockedUntil] = useState(() => {
    try {
      // Clean up legacy keys from older versions
      localStorage.removeItem('whispering-wishes-admin-pass'); // removed: no user-set passwords
      localStorage.removeItem('ww-app-lockout'); // removed: old 24h full-app lockout (CRIT-2)
      const lockoutUntil = localStorage.getItem('ww-admin-lockout');
      if (lockoutUntil && Date.now() < parseInt(lockoutUntil, 10)) {
        return parseInt(lockoutUntil, 10);
      }
      // Clear expired lockout
      if (lockoutUntil) localStorage.removeItem('ww-admin-lockout');
      localStorage.removeItem('ww-admin-fails');
    } catch {}
    return false;
  });
  
  const toast = useToast();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
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
  const [activeBanners, setActiveBanners] = useState(() => getActiveBanners());
  // Banner ends at server-specific time (e.g., 11:59 local for each server)
  const bannerEndDate = useMemo(() => getServerAdjustedEnd(activeBanners.endDate, state.server), [activeBanners.endDate, state.server]);
  const [adminTab, setAdminTab] = useState('banners'); // 'banners', 'collection', or 'visuals'
  const [adminMiniMode, setAdminMiniMode] = useState(false);
  
  // P6-FIX: Controlled admin banner form state — replaces all document.getElementById calls (HIGH-17/18)
  const buildBannerForm = useCallback((banners) => ({
    version: banners.version || '1.0',
    phase: String(banners.phase ?? 1),
    startDate: banners.startDate?.slice(0, 16) || '',
    endDate: banners.endDate?.slice(0, 16) || '',
    charsJson: JSON.stringify(banners.characters, null, 2),
    weapsJson: JSON.stringify(banners.weapons, null, 2),
    charImages: Object.fromEntries((banners.characters || []).map((c, i) => [i, c.imageUrl || ''])),
    weapImages: Object.fromEntries((banners.weapons || []).map((w, i) => [i, w.imageUrl || ''])),
    standardCharImg: banners.standardCharBannerImage || '',
    standardWeapImg: banners.standardWeapBannerImage || '',
    wwImg: banners.whimperingWastesImage || '',
    dpImg: banners.doubledPawnsImage || '',
    toaImg: banners.towerOfAdversityImage || '',
    irImg: banners.illusiveRealmImage || '',
    drImg: banners.dailyResetImage || '',
  }), []);
  const [bannerForm, setBannerForm] = useState(() => buildBannerForm(activeBanners));
  const updateBannerForm = useCallback((field, value) => setBannerForm(prev => ({ ...prev, [field]: value })), []);
  
  // Banner visual settings - v3 forces fresh defaults
  const VISUAL_SETTINGS_KEY = 'whispering-wishes-visual-settings-v3';
  const defaultVisualSettings = {
    // Featured Banner Cards
    fadePosition: 50,
    fadeIntensity: 100,
    pictureOpacity: 100,
    // Standard Banner Cards
    standardFadePosition: 50,
    standardFadeIntensity: 100,
    standardOpacity: 100,
    // Event Cards
    shadowFadePosition: 50,
    shadowFadeIntensity: 100,
    shadowOpacity: 100,
    // Collection Cards (vertical fade)
    collectionFadePosition: 50,
    collectionFadeIntensity: 100,
    collectionOpacity: 100,
    collectionFadeDirection: 'top',
    collectionZoom: 120,
    // Display Settings
    oledMode: false,
    swipeNavigation: false,
    animationsEnabled: typeof window !== 'undefined' && window.matchMedia ? !window.matchMedia('(prefers-reduced-motion: reduce)').matches : true
  };
  // Always start with defaults - localStorage can override but we validate each property
  const [visualSettings, setVisualSettings] = useState(() => {
    // Return defaults - don't load from localStorage on initial load
    // This ensures fresh users always get correct defaults
    return { ...defaultVisualSettings };
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
          return merged;
        });
      }
    } catch {}
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
      const manifest = {
        name: 'Whispering Wishes',
        short_name: 'Whispering Wishes',
        icons: [{ src: darkBgIcon, sizes: '180x180', type: 'image/png' }],
        start_url: window.location.href,
        display: 'standalone',
        background_color: '#0a0a1a',
        theme_color: '#0c0820'
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
    }, 300);
  }, [storageAvailable]);
  
  // Image framing state - stores position/zoom for each image by key
  const IMAGE_FRAMING_KEY = 'whispering-wishes-image-framing-v1';
  const [imageFraming, setImageFraming] = useState({});
  const [editingImage, setEditingImage] = useState(null); // currently selected image key
  const [framingMode, setFramingMode] = useState(false);
  const [miniPanelPosition, setMiniPanelPosition] = useState('bottom-right'); // top-left, top-right, bottom-left, bottom-right
  
  // Load image framing from localStorage
  useEffect(() => {
    if (!storageAvailable) return;
    try {
      const saved = localStorage.getItem(IMAGE_FRAMING_KEY);
      if (saved) setImageFraming(JSON.parse(saved));
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
  
  // Get framing for an image (returns defaults if not set)
  const defaultFraming = useMemo(() => ({ x: 0, y: 0, zoom: 100 }), []);
  const getImageFraming = useCallback((key) => {
    return imageFraming[key] || defaultFraming;
  }, [imageFraming, defaultFraming]);
  
  // Update framing for currently editing image
  const updateEditingFraming = (changes) => {
    if (!editingImage) return;
    const current = getImageFraming(editingImage);
    const newFraming = { ...current, ...changes };
    // Clamp values - larger range for better control
    newFraming.x = Math.max(-100, Math.min(100, newFraming.x));
    newFraming.y = Math.max(-100, Math.min(100, newFraming.y));
    newFraming.zoom = Math.max(100, Math.min(300, newFraming.zoom));
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
  const [collectionElementFilter, setCollectionElementFilter] = useState('all'); // 'all', 'Aero', 'Glacio', etc.
  const [collectionWeaponFilter, setCollectionWeaponFilter] = useState('all'); // 'all', 'Broadblade', 'Sword', etc.
  const [collectionOwnershipFilter, setCollectionOwnershipFilter] = useState('all'); // 'all', 'owned', 'missing'
  
  // Filter function for collection items
  const filterCollectionItems = useCallback((items, countsObj, isCharacter = true) => {
    return items.filter(name => {
      // Search filter
      if (collectionSearch && !name.toLowerCase().includes(collectionSearch.toLowerCase())) {
        return false;
      }
      
      // Ownership filter
      const count = countsObj[name] || 0;
      if (collectionOwnershipFilter === 'owned' && count === 0) return false;
      if (collectionOwnershipFilter === 'missing' && count > 0) return false;
      
      // Element/Weapon type filter (only for characters with data)
      if (isCharacter) {
        const data = CHARACTER_DATA[name];
        if (data) {
          if (collectionElementFilter !== 'all' && data.element !== collectionElementFilter) return false;
          if (collectionWeaponFilter !== 'all' && data.weapon !== collectionWeaponFilter) return false;
        }
      } else {
        const data = WEAPON_DATA[name];
        if (data && collectionWeaponFilter !== 'all' && data.type !== collectionWeaponFilter) return false;
      }
      
      return true;
    });
  }, [collectionSearch, collectionElementFilter, collectionWeaponFilter, collectionOwnershipFilter]);
  
  // Clear all filters
  const clearCollectionFilters = useCallback(() => {
    setCollectionSearch('');
    setCollectionElementFilter('all');
    setCollectionWeaponFilter('all');
    setCollectionOwnershipFilter('all');
  }, []);
  
  // Check if any filter is active
  const hasActiveFilters = useMemo(() => 
    !!(collectionSearch || collectionElementFilter !== 'all' || collectionWeaponFilter !== 'all' || collectionOwnershipFilter !== 'all'),
    [collectionSearch, collectionElementFilter, collectionWeaponFilter, collectionOwnershipFilter]
  );
  
  // Cache-busting for images (version-based, only refreshes on manual refresh)
  // Initial value is an arbitrary version token; replaced with Date.now() on manual refresh
  const [imageCacheBuster, setImageCacheBuster] = useState('v3.1.0');
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
      return saved ? JSON.parse(saved) : {};
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
    }, 300)
  };
  
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
      } catch (e) {}
      // Only show onboarding if the original saved data had it explicitly true
      // If settings.showOnboarding is missing/undefined, user is existing - don't show
      const shouldShow = originalSettings.showOnboarding === true;
      setShowOnboarding(shouldShow);
    } else {
      // First time user only - show onboarding
      setShowOnboarding(true);
    }
    setStorageLoaded(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — mount-only, toast ref is stable at first render
  
  // Save state to storage whenever it changes
  useEffect(() => {
    if (!storageLoaded) return;
    saveToStorage(state);
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
  const [activeTab, setActiveTabRaw] = useState('tracker');
  const tabNavRef = useRef(null);
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
      swipeRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startTime: Date.now()
      };
    };
    
    const handleTouchEnd = (e) => {
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
  const [pasteJsonText, setPasteJsonText] = useState('');
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkName, setBookmarkName] = useState('');
  const [showIncomePanel, setShowIncomePanel] = useState(false);
  const [chartRange, setChartRange] = useState('monthly');
  const [chartOffset, setChartOffset] = useState(9999);
  const [detailModal, setDetailModal] = useState({ show: false, type: null, name: null, imageUrl: null });
  
  // Anonymous Luck Leaderboard
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedTrophy, setSelectedTrophy] = useState(null);
  const [leaderboardConsented, setLeaderboardConsented] = useState(() => {
    try { return localStorage.getItem('ww-leaderboard-consent') === 'true'; } catch { return false; }
  });

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState('rankings'); // 'rankings' or 'popular'
  const [communityPulls, setCommunityPulls] = useState(null);
  const [userLeaderboardId] = useState(() => {
    if (!storageAvailable) return null;
    try {
      let id = localStorage.getItem('ww-leaderboard-id');
      if (!id) {
        id = 'WW' + Math.random().toString(36).substring(2, 8).toUpperCase();
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
  const effectiveLeaderboardId = state.profile.uid || userLeaderboardId;

  const setCalc = useCallback((f, v) => dispatch({ type: 'SET_CALC', field: f, value: v }), []);

  // P2-FIX: Deferred calc state — sliders update UI instantly (state.calc),
  // A11y: Focus trap for inline modals — auto-focus first focusable element on open
  const anyModalOpen = showBookmarkModal || showExportModal || showAdminPanel || showLeaderboard || selectedTrophy;
  useEffect(() => {
    if (!anyModalOpen) return;
    const timer = setTimeout(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [anyModalOpen]);

  // but heavy DP computation only fires 150ms after the last slider tick.
  // Prevents ~7MB array allocation × 60Hz during slider drag.
  const [deferredCalc, setDeferredCalc] = useState(state.calc);
  const calcDeferTimerRef = useRef(null);
  useEffect(() => {
    if (calcDeferTimerRef.current) clearTimeout(calcDeferTimerRef.current);
    calcDeferTimerRef.current = setTimeout(() => setDeferredCalc(state.calc), 150);
    return () => { if (calcDeferTimerRef.current) clearTimeout(calcDeferTimerRef.current); };
  }, [state.calc]);

  // Smart astrite allocation for "Both" mode
  // P2-FIX: Uses deferredCalc so heavy DP isn't triggered on every slider tick
  const astriteAllocation = useMemo(() => {
    const totalAstrite = +deferredCalc.astrite || 0;
    const totalPulls = Math.floor(totalAstrite / ASTRITE_PER_PULL);
    const radiant = +deferredCalc.radiant || 0;
    const forging = +deferredCalc.forging || 0;
    const lustrous = +deferredCalc.lustrous || 0;
    
    if (deferredCalc.selectedBanner !== 'both') {
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
    const featPriority = typeof deferredCalc.allocPriority === 'number' ? deferredCalc.allocPriority : 50;
    const stdPriority = typeof deferredCalc.stdAllocPriority === 'number' ? deferredCalc.stdAllocPriority : 50;
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
  }, [deferredCalc.astrite, deferredCalc.radiant, deferredCalc.forging, deferredCalc.lustrous, deferredCalc.selectedBanner, deferredCalc.allocPriority, deferredCalc.stdAllocPriority]);

  // Calculate pulls for each banner type using allocation
  const { charTotal: charPulls, weapTotal: weapPulls, stdCharTotal: stdCharPulls, stdWeapTotal: stdWeapPulls } = astriteAllocation;
  
  // Calculate stats for each banner type
  // P2-FIX: Uses deferredCalc so DP arrays aren't allocated 60×/sec during slider drag
  const charStats = useMemo(() => calcStats(charPulls, deferredCalc.charPity, deferredCalc.charGuaranteed, true, deferredCalc.charCopies), [charPulls, deferredCalc.charPity, deferredCalc.charGuaranteed, deferredCalc.charCopies]);
  const weapStats = useMemo(() => calcStats(weapPulls, deferredCalc.weapPity, false, false, deferredCalc.weapCopies), [weapPulls, deferredCalc.weapPity, deferredCalc.weapCopies]);
  const stdCharStats = useMemo(() => calcStats(stdCharPulls, deferredCalc.stdCharPity, false, false, deferredCalc.stdCharCopies), [stdCharPulls, deferredCalc.stdCharPity, deferredCalc.stdCharCopies]);
  const stdWeapStats = useMemo(() => calcStats(stdWeapPulls, deferredCalc.stdWeapPity, false, false, deferredCalc.stdWeapCopies), [stdWeapPulls, deferredCalc.stdWeapPity, deferredCalc.stdWeapCopies]);

  // Combined stats for "Both" mode
  const combined = useMemo(() => {
    if (deferredCalc.selectedBanner !== 'both') return null;
    
    let charProb, weapProb;
    if (deferredCalc.bannerCategory === 'featured') {
      charProb = parseFloat(charStats.successRate) / 100;
      weapProb = parseFloat(weapStats.successRate) / 100;
    } else {
      charProb = parseFloat(stdCharStats.successRate) / 100;
      weapProb = parseFloat(stdWeapStats.successRate) / 100;
    }
    
    return {
      both: (charProb * weapProb * 100).toFixed(1),
      atLeastOne: ((charProb + weapProb - charProb * weapProb) * 100).toFixed(1),
      charOnly: (charProb * (1 - weapProb) * 100).toFixed(1),
      weapOnly: (weapProb * (1 - charProb) * 100).toFixed(1),
      neither: ((1 - charProb) * (1 - weapProb) * 100).toFixed(1),
    };
  }, [deferredCalc.selectedBanner, deferredCalc.bannerCategory, charStats, weapStats, stdCharStats, stdWeapStats]);

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
      // Beginner banner costs 128 Astrite/pull (80% of standard 160)
      totalAstrite: (all.length - beginnerHist.length) * ASTRITE_PER_PULL + beginnerHist.length * 128, 
      fiveStars: fives.length, 
      won5050: won, 
      lost5050: lost, 
      winRate: (won + lost) > 0 ? ((won / (won + lost)) * 100).toFixed(1) : null, 
      avgPity 
    };
  }, [state.profile]);
  
  // Leaderboard functions — Firebase Realtime Database
  const FIREBASE_DB = 'https://whispering-wishes-default-rtdb.firebaseio.com';
  const FIREBASE_API_KEY = 'AIzaSyWhisperingWishes'; // P8-FIX: CRIT-4 — Firebase project API key for anonymous auth
  const hasClaudeStorage = typeof window !== 'undefined' && !!window.storage;
  
  // P8-FIX: CRIT-4 — Firebase Anonymous Auth token management
  const firebaseAuthRef = useRef({ idToken: null, expiresAt: 0 });
  const getFirebaseAuth = useCallback(async () => {
    const now = Date.now();
    if (firebaseAuthRef.current.idToken && firebaseAuthRef.current.expiresAt > now + 60000) {
      return firebaseAuthRef.current.idToken;
    }
    try {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
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
      console.warn('Firebase anonymous auth failed, falling back to unauthenticated:', e);
      return null; // Graceful degradation — still works if Firebase rules allow public reads
    }
  }, []);
  
  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      // P8-FIX: CRIT-4 — Authenticate before reading
      const authToken = await getFirebaseAuth();
      const authParam = authToken ? `?auth=${authToken}` : '';
      const res = await fetch(`${FIREBASE_DB}/leaderboard.json${authParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const rawEntries = Object.values(data).filter(e => e && e.avgPity && e.id);
          // P8-FIX: Deduplicate by uid, then by stats fingerprint — same player on multiple devices = one entry
          const deduped = new Map();
          rawEntries.forEach(e => {
            // Primary key: game UID if available
            // Secondary key: stats fingerprint (avgPity + totalPulls + pulls) to catch old entries without uid
            const uidKey = e.uid || null;
            const statsKey = `${e.avgPity}|${e.totalPulls ?? ''}|${e.pulls ?? ''}|${e.won5050 ?? ''}|${e.lost5050 ?? ''}`;
            const key = uidKey || statsKey; // Group by UID first; if no UID, group by identical stats
            const existing = deduped.get(key);
            if (!existing || 
                (e.uid && !existing.uid) || // prefer entry with uid
                ((e.timestamp ?? 0) > (existing.timestamp ?? 0))) { // then prefer most recent
              deduped.set(key, e);
            }
          });
          const entries = [...deduped.values()];
          entries.sort((a, b) => a.avgPity - b.avgPity);
          setLeaderboardData(entries.slice(0, 20));
        } else {
          setLeaderboardData([]);
        }
      } else {
        throw new Error('Firebase fetch failed');
      }
    } catch (e) {
      console.error('Leaderboard load error:', e);
      // Fallback to Claude storage if available
      if (hasClaudeStorage) {
        try {
          const result = await window.storage.list('luck:', true);
          if (result?.keys) {
            const entries = await Promise.all(
              result.keys.slice(0, 50).map(async (key) => {
                try {
                  const data = await window.storage.get(key, true);
                  return data?.value ? JSON.parse(data.value) : null;
                } catch { return null; }
              })
            );
            const valid = entries.filter(e => e && e.avgPity && e.id);
            valid.sort((a, b) => a.avgPity - b.avgPity);
            setLeaderboardData(valid.slice(0, 20));
          }
        } catch { setLeaderboardData([]); }
      }
    }
    setLeaderboardLoading(false);
  }, [hasClaudeStorage, getFirebaseAuth]);
  
  const submitToLeaderboard = useCallback(async () => {
    if (!effectiveLeaderboardId || !overallStats?.avgPity || overallStats.avgPity === '—') return;
    
    // Require explicit consent before first submission
    if (!leaderboardConsented) {
      const consent = window.confirm(
        'Leaderboard Submission — Data Sharing Notice\n\n' +
        'By submitting your score, the following data will be sent to a shared database and displayed publicly:\n\n' +
        '• Your player ID (' + effectiveLeaderboardId + ')\n' +
        '• Average pity, total pulls, 50/50 win/loss stats\n' +
        '• Your owned 5★ characters and weapons\n\n' +
        'This data is pseudonymous (linked to your game UID or a random ID, not your real identity).\n\n' +
        'Do you consent to sharing this data?'
      );
      if (!consent) return;
      setLeaderboardConsented(true);
      try { localStorage.setItem('ww-leaderboard-consent', 'true'); } catch {}
    }
    
    try {
      const entry = {
        id: effectiveLeaderboardId,
        uid: state.profile.uid || null, // P8-FIX: Store game UID for cross-device dedup
        avgPity: parseFloat(overallStats.avgPity),
        pulls: overallStats.fiveStars ?? 0,
        totalPulls: overallStats.totalPulls ?? 0,
        won5050: overallStats.won5050 ?? 0,
        lost5050: overallStats.lost5050 ?? 0,
        timestamp: Date.now()
      };
      // P8-FIX: CRIT-4 — Authenticate before writing
      const authToken = await getFirebaseAuth();
      const authParam = authToken ? `?auth=${authToken}` : '';
      // P8-FIX: Use effectiveLeaderboardId as Firebase key — same UID across devices overwrites instead of duplicating
      const res = await fetch(`${FIREBASE_DB}/leaderboard/${effectiveLeaderboardId}.json${authParam}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (!res.ok) throw new Error('Firebase submit failed');
      
      // Submit owned 5★ for community "Most Pulled" ranking
      const charHistory = [...state.profile.featured.history, ...(state.profile.standardChar?.history || [])];
      const weapHistory = [...state.profile.weapon.history, ...(state.profile.standardWeap?.history || [])];
      const owned5Chars = [...new Set(charHistory.filter(p => p.rarity === 5 && p.name && ALL_CHARACTERS.has(p.name)).map(p => p.name))];
      const owned5Weaps = [...new Set(weapHistory.filter(p => p.rarity === 5 && p.name && !ALL_CHARACTERS.has(p.name)).map(p => p.name))];
      if (owned5Chars.length > 0 || owned5Weaps.length > 0) {
        await fetch(`${FIREBASE_DB}/community-pulls/${effectiveLeaderboardId}.json${authParam}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chars: owned5Chars, weaps: owned5Weaps, timestamp: Date.now() })
        });
      }
      
      toast?.addToast?.('Score submitted to leaderboard!', 'success');
      
      // P8-FIX: Clean up stale duplicate entries from before UID-based keying
      // Step 1: Delete this device's old random-ID entry if we switched to UID
      if (state.profile.uid && userLeaderboardId && userLeaderboardId !== effectiveLeaderboardId) {
        try {
          await fetch(`${FIREBASE_DB}/leaderboard/${userLeaderboardId}.json${authParam}`, { method: 'DELETE' });
          await fetch(`${FIREBASE_DB}/community-pulls/${userLeaderboardId}.json${authParam}`, { method: 'DELETE' });
        } catch { /* best-effort cleanup */ }
      }
      // Step 2: Fetch raw leaderboard and find other stale entries with matching stats from other devices' old random IDs
      if (state.profile.uid) {
        try {
          const rawRes = await fetch(`${FIREBASE_DB}/leaderboard.json${authParam}`);
          if (rawRes.ok) {
            const rawData = await rawRes.json();
            if (rawData) {
              const myAvg = parseFloat(overallStats.avgPity);
              const myPulls = overallStats.totalPulls ?? 0;
              const myFives = overallStats.fiveStars ?? 0;
              const myWon = overallStats.won5050 ?? 0;
              const myLost = overallStats.lost5050 ?? 0;
              const staleKeys = Object.entries(rawData)
                .filter(([key, e]) => 
                  key !== effectiveLeaderboardId && // not the new UID entry
                  key !== userLeaderboardId && // already handled above
                  (!e.uid || e.uid === state.profile.uid) && // no uid OR same uid (old duplicate)
                  e.avgPity === myAvg && 
                  e.totalPulls === myPulls && 
                  e.pulls === myFives &&
                  (e.won5050 ?? 0) === myWon &&
                  (e.lost5050 ?? 0) === myLost
                )
                .map(([key]) => key);
              for (const key of staleKeys) {
                try {
                  await fetch(`${FIREBASE_DB}/leaderboard/${key}.json${authParam}`, { method: 'DELETE' });
                  await fetch(`${FIREBASE_DB}/community-pulls/${key}.json${authParam}`, { method: 'DELETE' });
                } catch { /* best-effort */ }
              }
              if (staleKeys.length > 0) {
                console.log(`Cleaned up ${staleKeys.length} stale leaderboard entries for UID ${state.profile.uid}`);
              }
            }
          }
        } catch { /* cleanup is best-effort */ }
      }
      
      loadLeaderboard();
    } catch (e) { 
      console.error('Submit error:', e);
      toast?.addToast?.('Failed to submit score', 'error');
    }
  }, [effectiveLeaderboardId, userLeaderboardId, overallStats, state.profile, toast, loadLeaderboard, leaderboardConsented, getFirebaseAuth]);
  
  const loadCommunityPulls = useCallback(async () => {
    try {
      const authToken = await getFirebaseAuth(); // P8-FIX: CRIT-4
      const authParam = authToken ? `?auth=${authToken}` : '';
      const res = await fetch(`${FIREBASE_DB}/community-pulls.json${authParam}`);
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
  }, [getFirebaseAuth]);

  useEffect(() => {
    if (showLeaderboard) {
      loadLeaderboard();
      loadCommunityPulls();
    }
  }, [showLeaderboard, loadLeaderboard, loadCommunityPulls]);

  // Community stats aggregated from leaderboard entries
  // Note: leaderboardData is limited to top-20 by avgPity (luckiest players),
  // so these stats skew favorable and don't represent the full player base
  const communityStats = useMemo(() => {
    if (!leaderboardData.length) return null;
    const entries = leaderboardData;
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
  }, [leaderboardData]);

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
    const charHistory = [...featuredHist, ...stdCharHist];
    const weapHistory = [...weaponHist, ...stdWeapHist];
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
    if (allCollected) list.push({ id: 'all', name: 'No Life Achievement', desc: 'Every Resonator and Weapon collected. go outside.', icon: 'Crown', color: '#fbbf24', tier: 'legendary' });
    if (all5ResOwned) list.push({ id: '5res', name: 'Gotta Whale \'Em All', desc: 'All 5★ Resonators unlocked', icon: 'Sparkles', color: '#fbbf24', tier: 'gold' });
    if (all4ResOwned) list.push({ id: '4res', name: 'Sonata Effect', desc: 'All 4★ Resonators in your roster', icon: 'Heart', color: '#a855f7', tier: 'purple' });
    if (all5WeapOwned) list.push({ id: '5weap', name: 'Forgemaster', desc: 'All 5★ Weapons acquired', icon: 'Swords', color: '#ec4899', tier: 'gold' });
    if (all4WeapOwned) list.push({ id: '4weap', name: 'Armory of Jinzhou', desc: 'All 4★ Weapons in your arsenal', icon: 'Sword', color: '#a855f7', tier: 'purple' });
    if (all3WeapOwned) list.push({ id: '3weap', name: 'Data Bank: Full', desc: 'Every 3★ Weapon catalogued', icon: 'Shield', color: '#3b82f6', tier: 'blue' });
    
    // ═══ LUCK TROPHIES ═══
    if (earliest5Star === 1) list.push({ id: 'pity1', name: 'Pity 1. Screenshot or Fake.', desc: '5★ on the first pull. nobody believes you', icon: 'Crown', color: '#fbbf24', tier: 'legendary' });
    else if (earliest5Star && earliest5Star <= 10) list.push({ id: 'early10', name: 'Dev Account?', desc: `5★ at pity ${earliest5Star} — go buy a lottery ticket`, icon: 'Gift', color: '#fbbf24', tier: 'legendary' });
    else if (earliest5Star && earliest5Star <= 20) list.push({ id: 'early20', name: 'Disgusting Luck', desc: `5★ at pity ${earliest5Star}`, icon: 'Zap', color: '#fbbf24', tier: 'gold' });
    else if (earliest5Star && earliest5Star <= 40) list.push({ id: 'early40', name: 'Echo of Fortune', desc: `5★ at pity ${earliest5Star}`, icon: 'Clover', color: '#22c55e', tier: 'green' });
    
    // Hard pity — the unluckiest possible outcome
    const hitHardPity = all5Stars.some(p => p.pity >= HARD_PITY);
    if (hitHardPity) list.push({ id: 'hard80', name: 'Pity 80 Club', desc: 'Went the full distance. pain.', icon: 'Shield', color: '#6b7280', tier: 'gray' });
    
    // Soft pity zone specialist — majority of 5★ came from 65-79
    const softPityPulls = all5Stars.filter(p => p.pity >= 65 && p.pity < 80);
    if (softPityPulls.length >= 5) list.push({ id: 'softpro', name: 'Soft Pity Merchant', desc: `${softPityPulls.length} five-stars from soft zone — never early, never late`, icon: 'TrendingUp', color: '#f97316', tier: 'orange' });
    
    // Back-to-back — two 5★ within 20 pulls across any banner
    const hasBackToBack = all5Stars.some(p => p.pity > 0 && p.pity <= 15);
    const backToBackCount = all5Stars.filter(p => p.pity > 0 && p.pity <= 15).length;
    if (backToBackCount >= 3) list.push({ id: 'b2b3', name: 'Actual Hack', desc: `${backToBackCount} five-stars within 15 pulls — how`, icon: 'Zap', color: '#a855f7', tier: 'purple' });
    else if (hasBackToBack) list.push({ id: 'b2b', name: 'Back to Back', desc: '5★ within 15 pulls of the last — flexing is permitted', icon: 'Zap', color: '#22c55e', tier: 'green' });
    
    // ═══ 50/50 STREAK TROPHIES ═══
    if (bestWinStreak >= 7) list.push({ id: 'win7', name: 'Rigged (Positive)', desc: `${bestWinStreak}× 50/50 wins — actual witchcraft`, icon: 'Flame', color: '#fbbf24', tier: 'legendary' });
    else if (bestWinStreak >= 5) list.push({ id: 'win5', name: 'Main Character Energy', desc: `${bestWinStreak}× 50/50 wins in a row`, icon: 'Flame', color: '#f97316', tier: 'orange' });
    else if (bestWinStreak >= 3) list.push({ id: 'win3', name: 'Casually Winning', desc: `${bestWinStreak}× 50/50 wins in a row`, icon: 'Target', color: '#22c55e', tier: 'green' });
    
    if (worstLossStreak >= 7) list.push({ id: 'loss7', name: 'Clinically Cursed', desc: `${worstLossStreak}× 50/50 losses — uninstall tbh`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
    else if (worstLossStreak >= 5) list.push({ id: 'loss5', name: 'Kuro Hates You', desc: `${worstLossStreak}× 50/50 losses in a row`, icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
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
    else if (isWhale) list.push({ id: 'whale', name: 'Kuro Employee of the Month', desc: '1000+ Convenes — they know you by name', icon: 'Fish', color: '#06b6d4', tier: 'cyan' });
    else if (totalPulls >= 500) list.push({ id: '500', name: 'Down the Rabbit Hole', desc: '500+ Convenes — no turning back', icon: 'Diamond', color: '#8b5cf6', tier: 'purple' });
    else if (totalPulls >= 100) list.push({ id: '100', name: 'First Steps', desc: '100+ Convenes', icon: 'Gamepad2', color: '#3b82f6', tier: 'blue' });
    
    // 5★ count milestones
    const total5Stars = all5Stars.length;
    if (total5Stars >= 50) list.push({ id: '50stars', name: 'Addicted', desc: `${total5Stars} five-stars obtained — this is a problem`, icon: 'Star', color: '#fbbf24', tier: 'gold' });
    else if (total5Stars >= 25) list.push({ id: '25stars', name: 'Stargazer', desc: `${total5Stars} five-stars obtained`, icon: 'Star', color: '#a855f7', tier: 'purple' });
    else if (total5Stars >= 10) list.push({ id: '10stars', name: 'Rising Star', desc: `${total5Stars} five-stars obtained`, icon: 'Star', color: '#3b82f6', tier: 'blue' });
    
    // First 5★
    if (total5Stars > 0 && total5Stars < 10) list.push({ id: 'first5', name: 'Awakening', desc: 'Obtained your first 5★', icon: 'Star', color: '#fbbf24', tier: 'gold' });
    
    // Banner diversity — pulled on multiple banner types
    const bannerTypesUsed = [featuredHist, weaponHist, stdCharHist, stdWeapHist].filter(h => h.length > 0).length;
    if (bannerTypesUsed >= 4) list.push({ id: 'diverse', name: 'Pioneer Podcast', desc: 'Convened on all banner types', icon: 'Trophy', color: '#06b6d4', tier: 'cyan' });
    
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
      'Verina': { name: 'Lost 50/50 Seven Times', desc: 'S6 Verina — and every single one was a W', color: '#fbbf24' },
      'Yinlin': { name: 'Down Catastrophic', desc: 'S6 Yinlin — she pulled your strings and your wallet', color: '#a855f7' },
      'Jinhsi': { name: 'Simp Magistrate', desc: 'S6 Jinhsi — sold Jinzhou to fund this', color: '#fbbf24' },
      'Changli': { name: 'Touch Grass? Touch Fire.', desc: 'S6 Changli — your savings went up in flames', color: '#f97316' },
      'Zhezhi': { name: 'Drawing Bankruptcy', desc: 'S6 Zhezhi — her art costs more than actual art', color: '#38bdf8' },
      'Xiangli Yao': { name: 'He Did The Math (x7)', desc: 'S6 Xiangli Yao — calculated your savings into Hypercubes', color: '#a855f7' },
      'Shorekeeper': { name: 'She Protecc (x7)', desc: 'S6 Shorekeeper — your team cannot die. ever.', color: '#fbbf24' },
      'Camellya': { name: 'Dislocated But Worth It', desc: 'S6 Camellya — thumbs broken, damage beautiful', color: '#ec4899' },
      'Carlotta': { name: 'Wallet? Frozen.', desc: 'S6 Carlotta — bank account colder than her kit', color: '#38bdf8' },
      'Roccia': { name: 'Hard Carried (Literally)', desc: 'S6 Roccia — she\'s a rock. you\'re the clown who S6\'d her', color: '#ec4899' },
      'Phoebe': { name: 'Feebi Chupi Supremacy', desc: 'S6 Phoebe — max power cheek pinch unlocked', color: '#fbbf24' },
      'Brant': { name: 'Burned Through Savings', desc: 'S6 Brant — fire DPS, fire wallet', color: '#f97316' },
      'Cantarella': { name: 'Toxic Relationship', desc: 'S6 Cantarella — she\'s poison and you keep coming back', color: '#ec4899' },
      'Zani': { name: 'Frazzle Addict', desc: 'S6 Zani — 19 stacks of Frazzle, zero stacks of savings', color: '#fbbf24' },
      'Ciaccona': { name: 'Wind Main in 2026', desc: 'S6 Ciaccona — bold, delusional, committed', color: '#22c55e' },
      'Cartethyia': { name: 'Blessed Wallet Drain', desc: 'S6 Cartethyia — the Maiden blessed your poverty', color: '#22c55e' },
      'Lupa': { name: 'Awoo\'d Too Hard', desc: 'S6 Lupa — the wolf pack ate your bank account', color: '#f97316' },
      'Phrolova': { name: 'Puppet? You\'re the Puppet.', desc: 'S6 Phrolova — she played you like her dolls', color: '#ec4899' },
      'Augusta': { name: 'Shocking Bill', desc: 'S6 Augusta — electrifying damage, electrifying debt', color: '#a855f7' },
      'Iuno': { name: 'Tone Deaf Spending', desc: 'S6 Iuno — the melody was "swipe swipe swipe"', color: '#22c55e' },
      'Galbrena': { name: 'Bayonetta at Home (S6)', desc: 'S6 Galbrena — Mom said we have Bayonetta at home', color: '#f97316' },
      'Qiuyuan': { name: 'Echo Chamber', desc: 'S6 Qiuyuan — he echoed "one more pull" seven times', color: '#22c55e' },
      'Chisa': { name: 'Cut Your Losses (Didn\'t)', desc: 'S6 Chisa — the blade cuts everything except your spending', color: '#ec4899' },
      'Lynae': { name: 'Lynae Impact', desc: 'S6 Lynae — just rename the game already', color: '#fbbf24' },
      'Mornye': { name: 'Rhythm of Regret', desc: 'S6 Mornye — the beat dropped and so did your balance', color: '#f97316' },
      'Luuk Herssen': { name: 'Fist Full of Debt', desc: 'S6 Luuk Herssen — punched his way through your wallet', color: '#fbbf24' },
      'Aemeath': { name: 'Rode Into Bankruptcy', desc: 'S6 Aemeath — the Exostrider ran over your finances', color: '#f97316' },
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
      list.push({ id: 's6_all', name: 'Gathering Wives: Complete', desc: 'Every 5★ at S6 — Rover\'s harem is full. seek help.', icon: 'Crown', color: '#ff0000', tier: 'legendary' });
    } else if (s6Count >= 20) {
      list.push({ id: 's6_harem20', name: 'Harem Protagonist EX', desc: `${s6Count}/${total5StarCount} at S6 — your wallet is in critical condition`, icon: 'Crown', color: '#ff4500', tier: 'legendary' });
    } else if (s6Count >= 10) {
      list.push({ id: 's6_harem10', name: 'Gathering Wives', desc: `${s6Count}/${total5StarCount} at S6 — Rover didn't stutter`, icon: 'Crown', color: '#ff6347', tier: 'legendary' });
    } else if (s6Count >= 5) {
      list.push({ id: 's6_harem5', name: 'Starting a Collection', desc: `${s6Count} at S6 — the harem arc is canon`, icon: 'Crown', color: '#ff8c00', tier: 'epic' });
    }
    
    // Weapon R5 — any 5★ weapon pulled 5+ times
    const weapCounts = {};
    weapHistory.filter(p => p.rarity === 5 && p.name).forEach(p => { weapCounts[p.name] = (weapCounts[p.name] ?? 0) + 1; });
    const maxedWeap = Object.entries(weapCounts).find(([, c]) => c >= 5);
    if (maxedWeap) list.push({ id: 'r5', name: 'Weapon Banner Victim', desc: `R5 ${maxedWeap[0]} — financially irresponsible`, icon: 'Swords', color: '#ec4899', tier: 'legendary' });
    
    // Average pity under 50 with 10+ 5★ (consistently lucky)
    if (total5Stars >= 10 && overallStats?.avgPity) {
      const avg = parseFloat(overallStats.avgPity);
      if (!isNaN(avg) && avg <= 45) list.push({ id: 'luckyavg', name: 'Illegal Luck', desc: `Avg pity ${overallStats.avgPity} across ${total5Stars} five-stars — report this account`, icon: 'Clover', color: '#fbbf24', tier: 'gold' });
      else if (!isNaN(avg) && avg >= 70) list.push({ id: 'unluckyavg', name: 'Certified Unlucky', desc: `Avg pity ${overallStats.avgPity} — genuinely painful to look at`, icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
    }
    
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
      if (winRate >= 80) list.push({ id: 'highwr', name: 'Account For Sale?', desc: `${winRate}% win rate across ${total5050s} flips — this isn't normal`, icon: 'Crown', color: '#fbbf24', tier: 'legendary' });
      else if (winRate <= 20) list.push({ id: 'lowwr', name: 'Statistically Bullied', desc: `${winRate}% win rate across ${total5050s} flips — file a complaint`, icon: 'AlertCircle', color: '#ef4444', tier: 'red' });
    }
    
    // ═══ META TEAM TROPHIES ═══
    // Check if player owns all members of a meta team (using their 5★ collection)
    const owns = (name) => owned5StarChars.has(name);
    const ownsAll = (...names) => names.every(owns);
    
    // T0 Meta Teams
    if (ownsAll('Phrolova', 'Cantarella')) list.push({ id: 'phrol', name: 'Codependency', desc: 'Phrolova + Cantarella — useless without each other, broken together', icon: 'Heart', color: '#a855f7', tier: 'purple' });
    if (ownsAll('Phoebe', 'Zani')) list.push({ id: 'zaphi', name: 'Wheelchair Meta', desc: 'Phoebe + Zani — 19 Frazzle stacks, zero skill required', icon: 'Heart', color: '#fbbf24', tier: 'gold' });
    if (ownsAll('Lynae', 'Mornye')) list.push({ id: 'lynmor', name: 'Pay2Win Unlocked', desc: 'Lynae + Mornye — the game plays itself now', icon: 'Sparkles', color: '#fbbf24', tier: 'gold' });
    if (ownsAll('Changli') && ownsAll('Brant') && ownsAll('Lupa')) list.push({ id: 'monofusion', name: 'Arsonist Squad', desc: 'Changli + Brant + Lupa — everything burns, including your primos', icon: 'Flame', color: '#f97316', tier: 'orange' });
    if (ownsAll('Galbrena', 'Qiuyuan', 'Shorekeeper')) list.push({ id: 'fusion', name: 'Bayonetta at Home', desc: 'Galbrena + Qiuyuan + SK — Mom said we have Bayonetta at home', icon: 'Flame', color: '#f97316', tier: 'orange' });
    if (ownsAll('Jiyan') && owned4StarChars.has('Mortefi')) list.push({ id: 'jiyan', name: 'Boomer Comp', desc: 'Jiyan + Mortefi — 1.0 copium that refuses to retire', icon: 'Shield', color: '#22c55e', tier: 'green' });
    
    // Own both Shorekeeper and Verina (the two universal supports)
    if (ownsAll('Shorekeeper', 'Verina')) list.push({ id: 'heals', name: 'Skill Issue Insurance', desc: 'SK + Verina — can\'t die even if you tried', icon: 'Heart', color: '#22c55e', tier: 'green' });
    
    // Own 3+ T0 DPS
    const t0Dps = ['Cartethyia', 'Camellya', 'Carlotta', 'Xiangli Yao', 'Phrolova', 'Iuno', 'Augusta', 'Aemeath'];
    const ownedT0 = t0Dps.filter(n => owns(n));
    if (ownedT0.length >= 6) list.push({ id: 't0six', name: 'Tower? Cleared.', desc: `${ownedT0.length} T0 DPS — ToA is your personal playground`, icon: 'Crown', color: '#fbbf24', tier: 'legendary' });
    else if (ownedT0.length >= 3) list.push({ id: 't0three', name: 'Meta Slave', desc: `${ownedT0.length} T0 DPS — tier list told you to pull`, icon: 'Trophy', color: '#a855f7', tier: 'purple' });
    
    // ═══ QUIRKY / COMMUNITY TROPHIES ═══
    // Never lost a 50/50 (with at least 3 wins)
    if (totalWins >= 3 && totalLosses === 0) list.push({ id: 'noloss', name: 'Literally Never Lost', desc: `${totalWins} 50/50 wins, zero losses — touch grass`, icon: 'Crown', color: '#fbbf24', tier: 'legendary' });
    
    // Lost first 50/50 (very first was a loss)
    if (first5050 && first5050.won5050 === false) list.push({ id: 'firstloss', name: 'First Time?', desc: 'First 50/50 was a loss — it only gets worse', icon: 'AlertCircle', color: '#6b7280', tier: 'gray' });
    
    // 4★ only — lots of pulls but very few 5★ (bad luck overall)
    if (totalPulls >= 200 && total5Stars <= 2) list.push({ id: 'dry', name: 'Down Horrendous', desc: `${totalPulls} pulls, ${total5Stars} five-stars — delete the app`, icon: 'TrendingDown', color: '#6b7280', tier: 'gray' });
    
    // Duplicate magnet — same standard char lost to 3+ times
    const dupMagnet = stdChars.find(name => lostCount(name) >= 3);
    if (dupMagnet && dupMagnet !== 'Lingyang') list.push({ id: 'dup', name: 'Hostage Situation', desc: `${dupMagnet} S${lostCount(dupMagnet) - 1} from 50/50 losses alone — didn't even want them`, icon: 'Diamond', color: '#6b7280', tier: 'gray' });
    
    return {
      list,
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
  }, [state.profile, overallStats]);

  // Luck rating
  const luckRating = useMemo(() => calculateLuckRating(overallStats?.avgPity), [overallStats]);

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
    const goalDaysNeeded = dailyIncome > 0 ? Math.ceil(goalNeeded / dailyIncome) : Infinity;
    const goalProgress = targetAstrite > 0 ? Math.min(100, (currentAstrite / targetAstrite) * 100) : 0;
    return { currentAstrite, daysLeft, incomeByEnd, totalAstriteByEnd, convenesByEnd, isFeatured, goalCopies, goalBannerLabel, targetPulls, targetAstrite, goalNeeded, goalDaysNeeded, goalProgress };
  }, [state.calc, state.planner.goalPulls, state.planner.goalModifier, bannerEndDate, dailyIncome]);

  // Pre-compute all collection data in one pass
  // File import handler
  // P4: Memoized collection data - avoids recomputing 5x per render
  const collectionData = useMemo(() => {
    const charHistory = [...state.profile.featured.history, ...(state.profile.standardChar?.history || [])];
    const weapHistory = [...state.profile.weapon.history, ...(state.profile.standardWeap?.history || [])];
    const countItems = (history, rarity, isChar) => {
      const items = history.filter(p => p.rarity === rarity && p.name && (isChar ? ALL_CHARACTERS.has(p.name) : !ALL_CHARACTERS.has(p.name)));
      return items.reduce((acc, p) => { acc[p.name] = (acc[p.name] || 0) + 1; return acc; }, {});
    };
    const sortItems = (items, sort, releaseOrder = RELEASE_ORDER) => {
      const arr = [...items];
      if (sort === 'copies') { arr.sort((a, b) => b[1] - a[1]); }
      else { arr.sort((a, b) => { const aIdx = releaseOrder.indexOf(a[0]); const bIdx = releaseOrder.indexOf(b[0]); return (bIdx === -1 ? -1 : bIdx) - (aIdx === -1 ? -1 : aIdx); }); }
      return arr;
    };
    return {
      chars5Counts: countItems(charHistory, 5, true), chars4Counts: countItems(charHistory, 4, true),
      weaps5Counts: countItems(weapHistory, 5, false), weaps4Counts: countItems(weapHistory, 4, false),
      weaps3Counts: countItems(weapHistory, 3, false), sortItems
    };
  }, [state.profile.featured.history, state.profile.standardChar?.history, state.profile.weapon.history, state.profile.standardWeap?.history]);

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
  }, [state.profile]);

  // Shared import processor for both file and paste methods
  const processImportData = useCallback((jsonString) => {
    try {
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
      
      const convert = (arr, type) => {
        const filtered = arr.filter(p => {
          const poolType = p.cardPoolType ?? p.gachaType;
          if (type === 'featured') return p.bannerType === 'featured' || p.bannerType === 'character' || poolType === 1;
          if (type === 'weapon') return p.bannerType === 'weapon' || poolType === 2;
          if (type === 'standardChar') return p.bannerType === 'standard-char' || poolType === 5;
          if (type === 'standardWeap') return p.bannerType === 'standard-weapon' || poolType === 6;
          if (type === 'beginner') return p.bannerType === 'beginner' || poolType === 7;
          return false;
        });
        
        filtered.sort((a, b) => new Date(a.time || a.timestamp) - new Date(b.time || b.timestamp));
        
        let pityCounter = 0;
        let lastWasLost = false;
        
        return filtered.map((p, i) => {
          pityCounter++;
          const rarity = p.rarity ?? p.qualityLevel ?? 4;
          const name = (p.name || p.resourceName || '').trim();
          
          let won5050 = undefined;
          let pity = pityCounter;
          
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
              const isStandard = STANDARD_5STAR_WEAPONS.has(name);
              if (lastWasLost) {
                won5050 = null;
                lastWasLost = false;
              } else {
                won5050 = !isStandard;
                lastWasLost = isStandard;
              }
            }
            pityCounter = 0;
          }
          
          return { 
            id: p.id || `imp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}_${i}`, 
            name, 
            rarity, 
            pity: rarity === 5 ? pity : 0, 
            won5050, 
            timestamp: p.timestamp || p.time,
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
          const guaranteed = (type === 'featured' || type === 'weapon') && lastFive?.won5050 === false;
          dispatch({ type: 'IMPORT_HISTORY', bannerType: type, history, pity5: currentPity5, pity4: currentPity4, guaranteed, uid: data.uid || data.playerId });
          totalImported += history.length;
        }
      });
      
      const fc = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === 1).length;
      const wc = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === 2).length;
      const sc = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === 5).length;
      const sw = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === 6).length;
      const bc = pulls.filter(p => (p.cardPoolType ?? p.gachaType) === 7).length;
      const parts = [];
      if (fc) parts.push(`${fc} char`);
      if (wc) parts.push(`${wc} weap`);
      if (sc + sw) parts.push(`${sc + sw} std`);
      if (bc) parts.push(`${bc} beg`);
      
      toast?.addToast?.(`Imported ${totalImported} pulls! (${parts.join(', ')})`, 'success');
      return true;
    } catch (err) { 
      toast?.addToast?.('Import failed: ' + err.message, 'error'); 
      return false;
    }
  }, [toast, dispatch]);

  const handleFileImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_IMPORT_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_IMPORT_SIZE) {
      toast?.addToast?.(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_IMPORT_SIZE_MB}MB.`, 'error');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      processImportData(ev.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [processImportData]);

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
    const MAX_IMPORT_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_IMPORT_SIZE) {
      toast?.addToast?.(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_IMPORT_SIZE_MB}MB.`, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => { processImportData(ev.target.result); };
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

  // Export data
  const handleExport = useCallback(() => {
    const data = { timestamp: new Date().toISOString(), version: APP_VERSION, state };
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
      }, 1500);
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

  // Hash a password using SHA-256
  const hashPassword = useCallback(async (password) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  // Verify admin password (with failed attempt tracking → 5-min admin-only cooldown)
  const verifyAdminPassword = useCallback(async () => {
    if (!adminPassword || adminPassword.length < 4) {
      toast?.addToast?.('Password must be at least 4 characters', 'error');
      return;
    }
    
    // Check if admin is currently locked out
    try {
      const lockoutUntil = localStorage.getItem('ww-admin-lockout');
      if (lockoutUntil && Date.now() < parseInt(lockoutUntil, 10)) {
        const remaining = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 60000);
        toast?.addToast?.(`Too many failed attempts. Try again in ${remaining}m.`, 'error');
        return;
      }
    } catch {}
    
    const hashedInput = await hashPassword(adminPassword);
    if (hashedInput === ADMIN_HASH) {
      setAdminUnlocked(true);
      setBannerForm(buildBannerForm(activeBanners));
      try { localStorage.setItem('ww-admin-fails', '0'); } catch {}
    } else {
      // Wrong password — increment fails, lock admin after 5 attempts for 5 minutes
      try {
        const fails = parseInt(localStorage.getItem('ww-admin-fails', 10) || '0') + 1;
        localStorage.setItem('ww-admin-fails', fails.toString());
        if (fails >= 5) {
          const lockoutTime = Date.now() + (5 * 60 * 1000); // 5 minutes
          localStorage.setItem('ww-admin-lockout', lockoutTime.toString());
          setAdminLockedUntil(lockoutTime);
          setShowAdminPanel(false);
          setAdminPassword('');
          toast?.addToast?.('Too many failed attempts. Admin locked for 5 minutes.', 'error');
        } else {
          toast?.addToast?.(`Incorrect password (${5 - fails} attempts remaining)`, 'error');
        }
      } catch {
        toast?.addToast?.('Incorrect password', 'error');
      }
    }
  }, [adminPassword, toast, hashPassword]);

  const headerControlBg = { backgroundColor: 'rgba(15, 20, 28, 0.9)' };

  return (
    <div className={`${visualSettings.oledMode ? 'oled-mode' : ''} ${!visualSettings.animationsEnabled ? 'no-animations' : ''}`}>
      <BackgroundGlow oledMode={visualSettings.oledMode} animationsEnabled={visualSettings.animationsEnabled} />
      <TriangleMirrorWave oledMode={visualSettings.oledMode} animationsEnabled={visualSettings.animationsEnabled} />
      <KuroStyles oledMode={visualSettings.oledMode} />
      
      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10" style={{backgroundColor: visualSettings.oledMode ? 'rgba(0, 0, 0, 0.98)' : 'rgba(8, 12, 18, 0.92)', backdropFilter: 'blur(20px)'}}>
        <div className="max-w-lg md:max-w-2xl mx-auto px-3">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                  <img src={HEADER_ICON} alt="WW" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-sm tracking-wide">Whispering Wishes</h1>
                <p className="text-gray-400 text-[10px] tracking-wider uppercase">Wuthering Waves Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <select value={state.server} onChange={e => dispatch({ type: 'SET_SERVER', server: e.target.value })} aria-label="Select server region" className="text-gray-300 text-[10px] px-2 py-2 rounded-lg border border-white/10 focus:border-yellow-500/50 focus:outline-none transition-all" style={headerControlBg}>
                {Object.keys(SERVERS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleExport} aria-label="Export backup" className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-yellow-400 hover:border-yellow-500/30 hover:bg-yellow-500/10 active:scale-95 transition-all" style={headerControlBg}>
                <Download size={14} />
              </button>
            </div>
          </div>
          <nav ref={tabNavRef} className="relative flex justify-between -mb-px overflow-x-auto scrollbar-hide pb-1" role="tablist" aria-label="Main navigation" onKeyDown={(e) => {
              const tabs = ['tracker','events','calculator','planner','analytics','gathering','profile'];
              const idx = tabs.indexOf(activeTab);
              if (e.key === 'ArrowRight') { e.preventDefault(); setActiveTab(tabs[(idx + 1) % tabs.length]); }
              else if (e.key === 'ArrowLeft') { e.preventDefault(); setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length]); }
            }}>
            <div className="tab-indicator" />
            <TabButton active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')} tabRef={tabNavRef} tabId="tracker"><Sparkles size={16} /> Tracker</TabButton>
            <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} tabRef={tabNavRef} tabId="events"><Calendar size={16} /> Events</TabButton>
            <TabButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} tabRef={tabNavRef} tabId="calculator"><Calculator size={16} /> Calc</TabButton>
            <TabButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} tabRef={tabNavRef} tabId="planner"><TrendingUp size={16} /> Plan</TabButton>
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} tabRef={tabNavRef} tabId="analytics"><BarChart3 size={16} /> Stats</TabButton>
            <TabButton active={activeTab === 'gathering'} onClick={() => setActiveTab('gathering')} tabRef={tabNavRef} tabId="gathering"><Archive size={16} /> Collection</TabButton>
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} tabRef={tabNavRef} tabId="profile"><User size={16} /> Profile</TabButton>
          </nav>
        </div>
      </header>

      <main className="max-w-lg md:max-w-2xl mx-auto px-3 pt-3 pb-4 space-y-3 w-full">
        
        {/* [SECTION:TAB-TRACKER] */}
        {activeTab === 'tracker' && (
          <div role="tabpanel" id="tabpanel-tracker" aria-labelledby="tab-tracker" tabIndex="0">
          <TabErrorBoundary tabName="Tracker">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="tracker" glowColor="gold" />

            {/* Category Tabs */}
            <Card>
              <CardBody>
                <div className="flex gap-2">
                  {[['character', 'Resonators', 'yellow'], ['weapon', 'Weapons', 'pink'], ['standard', 'Standard', 'cyan']].map(([key, label, color]) => (
                    <button key={key} onClick={() => setTrackerCategory(key)} className={`kuro-btn flex-1 ${trackerCategory === key ? (color === 'yellow' ? 'active-gold' : color === 'pink' ? 'active-pink' : 'active-cyan') : ''}`}>
                      {key === 'character' ? <Crown size={12} className="inline mr-1" /> : key === 'weapon' ? <Swords size={12} className="inline mr-1" /> : <Star size={12} className="inline mr-1" />}
                      {label}
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
              <div className="space-y-2 content-layer">
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
              <div className="space-y-2 content-layer">
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
              <div className="space-y-3 content-layer">
                <div className="text-gray-300 text-xs uppercase tracking-wider content-layer">Permanent Banners</div>
                
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
                <div className="max-h-64 overflow-y-auto kuro-scroll space-y-1.5">
                  {BANNER_HISTORY.map((b, i) => (
                    <div key={`bh-${b.version}-${b.phase}`} className="p-2 bg-white/5 rounded border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white text-xs font-medium">v{b.version} P{b.phase}</span>
                        <span className="text-gray-500 text-[9px]">{b.startDate}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {b.characters.map(c => (
                          <span key={c} className="text-[9px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">{c}</span>
                        ))}
                        {b.weapons.map(w => (
                          <span key={w} className="text-[9px] px-1.5 py-0.5 bg-pink-500/20 text-pink-400 rounded">{w}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
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

            <div className="flex items-center justify-between content-layer">
              <h2 className="text-white font-bold text-sm">Time-Gated Content</h2>
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
            </div>
            {(() => {
              const eventEntries = Object.entries(EVENTS);
              const totalAstrite = eventEntries.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards, 10) || 0), 0);
              const doneKeys = eventEntries.filter(([key]) => state.eventStatus[key] === 'done');
              const skippedKeys = eventEntries.filter(([key]) => state.eventStatus[key] === 'skipped');
              const earnedAstrite = doneKeys.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards, 10) || 0), 0);
              const hasProgress = doneKeys.length > 0 || skippedKeys.length > 0;
              return (
                <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg content-layer">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 text-xs font-medium">{hasProgress ? 'Astrite Progress' : 'Total Available Astrite'}</span>
                    <span className="text-yellow-400 font-bold text-sm">{hasProgress ? `${earnedAstrite.toLocaleString()} / ${totalAstrite.toLocaleString()}` : totalAstrite.toLocaleString()} Astrite</span>
                  </div>
                  {hasProgress && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${totalAstrite > 0 ? (earnedAstrite / totalAstrite) * 100 : 0}%` }} />
                      </div>
                      <span className="text-gray-400 text-[9px] flex-shrink-0">{doneKeys.length}/{eventEntries.length} done</span>
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="space-y-2">
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
            <p className="text-gray-500 text-[10px] text-center content-layer">Reset times based on {state.server} server (UTC{getServerOffset(state.server) >= 0 ? '+' : ''}{getServerOffset(state.server)})</p>
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
              <CardHeader action={<button onClick={() => setShowBookmarkModal(true)} className="text-purple-400 text-[10px] flex items-center gap-1 hover:text-purple-300 transition-colors"><BookmarkPlus size={12} />Save</button>}>Banner Selection</CardHeader>
              <CardBody className="space-y-3">
                  {/* Featured Banners */}
                  <div className="space-y-2">
                    <div className="kuro-label">Featured Convene</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'char'); }} className={`kuro-btn ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'char' ? 'active-gold' : ''}`}>
                        <Crown size={16} className="mx-auto mb-1.5" />Resonator
                      </button>
                      <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'weap'); }} className={`kuro-btn ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'weap' ? 'active-pink' : ''}`}>
                        <Swords size={16} className="mx-auto mb-1.5" />Weapon
                      </button>
                    </div>
                    <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'both'); }} className={`kuro-btn w-full ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'both' ? 'active-emerald' : ''}`}>
                      <RefreshCcw size={14} className="inline mr-1.5" />Both Featured
                    </button>
                  </div>

                  {/* Standard Banners */}
                  <div className="space-y-2">
                    <div className="kuro-label">Standard Convene</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'char'); }} className={`kuro-btn ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'char' ? 'active-cyan' : ''}`}>
                        <Star size={16} className="mx-auto mb-1.5" />Resonator
                      </button>
                      <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'weap'); }} className={`kuro-btn ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'weap' ? 'active-cyan' : ''}`}>
                        <Sword size={16} className="mx-auto mb-1.5 rotate-45" />Weapon
                      </button>
                    </div>
                    <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'both'); }} className={`kuro-btn w-full ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'both' ? 'active-emerald' : ''}`}>
                      <RefreshCcw size={14} className="inline mr-1.5" />Both Standard
                    </button>
                  </div>

                  {/* 50/50 Toggle */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <button onClick={() => { const newVal = !state.calc.charGuaranteed; setCalc('charGuaranteed', newVal); setCalc('charGuaranteedManual', newVal); }} className={`kuro-btn w-full ${state.calc.charGuaranteed ? 'active-emerald' : 'active-gold'}`}>
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
                      color="#fbbf24" softColor="#fb923c" softGlow="rgba(251,146,60,0.5)" sliderClass="" softPityClass="kuro-soft-pity" SoftPityIcon={Sparkles} ariaPrefix="Featured Resonator"
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
                    <input type="number" min="0" value={state.calc.astrite} onChange={e => setCalc('astrite', Math.max(0, +e.target.value || 0))} className="kuro-input" placeholder="0" aria-label="Astrite amount" />
                    <p className="text-gray-400 text-[10px] mt-1.5">= {Math.floor((+state.calc.astrite || 0) / ASTRITE_PER_PULL)} Convenes</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {[[ASTRITE_PER_PULL,'1 pull'], [ASTRITE_PER_PULL*5,'5 pulls'], [ASTRITE_PER_PULL*10,'10 pulls'], [ASTRITE_PER_PULL*20,'20 pulls']].map(([amt, tip]) => (
                        <button key={amt} onClick={() => setCalc('astrite', String((+state.calc.astrite || 0) + amt))} className="px-2 py-1 text-[9px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 transition-colors" title={tip}>+{amt}<span className="text-yellow-600 ml-0.5 text-[9px]">({tip.split(' ')[0]})</span></button>
                      ))}
                      <button onClick={() => setCalc('astrite', '')} className="px-2 py-1 text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 transition-colors">Clear</button>
                    </div>
                  </div>

                  {/* Featured banner resources */}
                  {state.calc.bannerCategory === 'featured' && (
                    <div className="grid grid-cols-2 gap-2">
                      {(state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div>
                          <label className="text-xs mb-1.5 block font-medium text-yellow-400">Radiant Tides</label>
                          <input type="number" min="0" value={state.calc.radiant} onChange={e => setCalc('radiant', Math.max(0, +e.target.value || 0))} className="kuro-input" placeholder="0" aria-label="Radiant Tides" />
                          <div className="flex gap-1 mt-1.5">
                            {[1, 5, 10].map(amt => (
                              <button key={amt} onClick={() => setCalc('radiant', String((+state.calc.radiant || 0) + amt))} className="px-2 py-1 text-[9px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 transition-colors">+{amt}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {(state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div>
                          <label className="text-xs mb-1.5 block font-medium text-pink-400">Forging Tides</label>
                          <input type="number" min="0" value={state.calc.forging} onChange={e => setCalc('forging', Math.max(0, +e.target.value || 0))} className="kuro-input" placeholder="0" aria-label="Forging Tides" />
                          <div className="flex gap-1 mt-1.5">
                            {[1, 5, 10].map(amt => (
                              <button key={amt} onClick={() => setCalc('forging', String((+state.calc.forging || 0) + amt))} className="px-2 py-1 text-[9px] bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded border border-pink-500/30 transition-colors">+{amt}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard banner resources */}
                  {state.calc.bannerCategory === 'standard' && (
                    <div>
                      <label className="text-xs mb-1.5 block font-medium text-cyan-400">Lustrous Tides</label>
                      <input type="number" min="0" value={state.calc.lustrous} onChange={e => setCalc('lustrous', Math.max(0, +e.target.value || 0))} className="kuro-input" placeholder="0" aria-label="Lustrous Tides" />
                      <div className="flex gap-1 mt-1.5">
                        {[1, 5, 10].map(amt => (
                          <button key={amt} onClick={() => setCalc('lustrous', String((+state.calc.lustrous || 0) + amt))} className="px-2 py-1 text-[9px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 transition-colors">+{amt}</button>
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
                          <Swords size={12} style={{ color: currentPriority <= 50 ? '#f472b6' : '#6b7280' }} />
                          <span className="text-xs font-medium" style={{ color: currentPriority <= 50 ? '#f472b6' : '#6b7280' }}>Weapon {100 - currentPriority}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium" style={{ color: currentPriority >= 50 ? '#fbbf24' : '#6b7280' }}>Resonator {currentPriority}%</span>
                          <Crown size={12} style={{ color: currentPriority >= 50 ? '#fbbf24' : '#6b7280' }} />
                        </div>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="10" value={currentPriority} 
                        onChange={e => setCalc(priorityKey, +e.target.value)} 
                        className="kuro-slider w-full" 
                        aria-label={`Astrite allocation: ${currentPriority}% Resonator, ${100 - currentPriority}% Weapon`}
                        style={{ background: `linear-gradient(to right, #f472b6 0%, #f472b6 ${100 - currentPriority}%, #444 ${100 - currentPriority}%, #444 ${currentPriority}%, #fbbf24 ${currentPriority}%, #fbbf24 100%)` }}
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
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-500 text-[9px]">({astriteAllocation.charAstritePulls} + {+state.calc.radiant || 0} tides)</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-pink-400 kuro-number text-xl">{weapPulls}</div>
                          <div className="text-gray-400 text-[10px]">Weapon Convenes</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-500 text-[9px]">({astriteAllocation.weapAstritePulls} + {+state.calc.forging || 0} tides)</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-cyan-400 kuro-number text-xl">{stdCharPulls}</div>
                          <div className="text-gray-400 text-[10px]">Resonator Convenes</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-500 text-[9px]">({astriteAllocation.charAstritePulls} + {astriteAllocation.stdCharLustrous} tides)</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-cyan-400 kuro-number text-xl">{stdWeapPulls}</div>
                          <div className="text-gray-400 text-[10px]">Weapon Convenes</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-500 text-[9px]">({astriteAllocation.weapAstritePulls} + {astriteAllocation.stdWeapLustrous} tides)</div>}
                        </div>
                      )}
                    </div>
                  </div>
              </CardBody>
            </Card>

            {/* Results Cards */}
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

            {/* Combined Analysis */}
            {state.calc.selectedBanner === 'both' && combined && (
              <Card>
                <CardHeader>Combined Analysis</CardHeader>
                <CardBody>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="kuro-stat kuro-stat-emerald">
                        <div className="text-2xl kuro-number text-emerald-400">{combined.both}%</div>
                        <div className="text-gray-400 text-[10px] mt-1">Get Both</div>
                      </div>
                      <div className="kuro-stat kuro-stat-gold">
                        <div className="text-yellow-400 text-2xl kuro-number">{combined.atLeastOne}%</div>
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
                    <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-center">
                      <p className="text-emerald-400/80 text-[9px]">✓ Astrite split: {astriteAllocation.charPercent}% Resonator / {astriteAllocation.weapPercent}% Weapon</p>
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
                  <label className="kuro-label">Base Daily Astrite (Commissions, etc.)</label>
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
                    <span className="text-yellow-400 font-bold">{dailyIncome} Astrite</span>
                  </div>
                  <div className="text-gray-400 text-[10px] mt-1">≈ {(dailyIncome / ASTRITE_PER_PULL).toFixed(2)} Convenes/day • {Math.floor(dailyIncome * 30 / ASTRITE_PER_PULL)} Convenes/month</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <div className="cursor-pointer" onClick={() => setShowIncomePanel(!showIncomePanel)}>
                <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform ${showIncomePanel ? 'rotate-180' : ''}`} />}>Add Purchases</CardHeader>
              </div>
              {showIncomePanel && (
                <CardBody className="space-y-2">
                  <div className="kuro-label">Subscriptions</div>
                  <button onClick={() => dispatch({ type: 'SET_PLANNER', field: 'luniteActive', value: !state.planner.luniteActive })} className={`kuro-btn w-full text-left ${state.planner.luniteActive ? 'active-emerald' : ''}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded flex items-center justify-center ${state.planner.luniteActive ? 'bg-emerald-500 text-black' : 'bg-neutral-700'}`}>
                          {state.planner.luniteActive && <Check size={10} />}
                        </span>
                        <div>
                          <div className={`text-xs font-medium ${state.planner.luniteActive ? 'text-emerald-400' : 'text-gray-200'}`}>Lunite Subscription</div>
                          <div className="text-gray-300 text-[10px]">300 Lunite + 90 Ast/day × 30d</div>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-xs">$4.99/mo</span>
                    </div>
                  </button>
                  {/* Weekly sub: Lunite is a separate in-game currency (not tracked here), only Astrite counts toward pulls */}
                  <button onClick={() => dispatch({ type: 'ADD_INCOME', income: { id: `inc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, astrite: 1600, radiant: 0, lustrous: 0, label: 'Weekly Subscription', price: 9.99 } })} className="kuro-btn w-full text-left">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="text-gray-200 text-xs font-medium">Weekly Subscription</div>
                        <div className="text-gray-300 text-[10px]">680 Lunite + 1600 Astrite over 7 days</div>
                      </div>
                      <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">$9.99</span><Plus size={12} className="text-yellow-400" /></div>
                    </div>
                  </button>
                  {Object.entries(SUBSCRIPTIONS).filter(([k]) => k === 'bpInsider' || k === 'bpConnoisseur').map(([k, s]) => (
                    <button key={k} onClick={() => dispatch({ type: 'ADD_INCOME', income: { id: `inc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, astrite: s.astrite, radiant: s.radiant || 0, lustrous: s.lustrous || 0, label: s.name, price: s.price } })} className="kuro-btn w-full text-left">
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
                    <button key={k} onClick={() => dispatch({ type: 'ADD_INCOME', income: { id: `inc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, astrite: s.astrite, radiant: 0, lustrous: 0, label: s.name, price: s.price } })} className="kuro-btn w-full text-left">
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
                <CardHeader action={<button onClick={() => dispatch({ type: 'CLEAR_ALL_INCOME' })} className="text-red-400 text-[10px] hover:text-red-300 transition-colors">Clear All</button>}>Added Purchases</CardHeader>
                <CardBody className="space-y-2">
                  {state.planner.addedIncome.map(i => (
                    <div key={i.id} className="flex items-center justify-between p-2 bg-white/5 rounded text-xs">
                      <span className="text-gray-200">{i.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">+{i.astrite}</span>
                        {i.radiant > 0 && <span className="text-yellow-400">+{i.radiant}RT</span>}
                        {i.lustrous > 0 && <span className="text-cyan-400">+{i.lustrous}LT</span>}
                        <button onClick={() => dispatch({ type: 'REMOVE_INCOME', id: i.id })} className="text-red-400" aria-label="Remove purchase"><Minus size={12} /></button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/10 flex justify-between text-xs">
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
                      <div className="text-gray-400 text-[9px]">Total Convenes</div>
                    </div>
                    <div className="kuro-stat p-2 text-center">
                      <div className="text-white kuro-number text-xl">{Math.floor(planData.incomeByEnd / ASTRITE_PER_PULL)}</div>
                      <div className="text-gray-400 text-[9px]">Earned Convenes</div>
                    </div>
                    <div className="kuro-stat p-2 text-center">
                      <div className="text-white kuro-number text-xl">{planData.totalAstriteByEnd.toLocaleString()}</div>
                      <div className="text-gray-400 text-[9px]">Total Astrite</div>
                    </div>
                  </div>
                  <div className="text-gray-500 text-[9px] text-center">Current {planData.currentAstrite.toLocaleString()} + {planData.incomeByEnd.toLocaleString()} earned ({dailyIncome}/day × {planData.daysLeft}d)</div>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardHeader>Income Projections</CardHeader>
              <CardBody>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 30, 90].map(days => (
                    <div key={days} className="kuro-stat p-3 text-center">
                      <div className="text-gray-400 text-[10px] mb-1">{days} Days</div>
                      <div className="text-2xl kuro-number text-yellow-400">{Math.floor(dailyIncome * days / ASTRITE_PER_PULL)}</div>
                      <div className="text-gray-400 text-[9px]">Convenes</div>
                      <div className="text-gray-500 text-[9px]">{(dailyIncome * days).toLocaleString()} Ast</div>
                    </div>
                  ))}
                </div>
                {state.planner.luniteActive && (
                  <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-center">
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
                    <select value={state.planner.goalPulls} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'goalPulls', value: +e.target.value })} className="kuro-input w-full" aria-label="Base Convenes per copy">
                      <option value={HARD_PITY}>{HARD_PITY} (Hard Pity)</option>
                      <option value={HARD_PITY * 2}>{HARD_PITY * 2} (Guaranteed)</option>
                      <option value={240}>240 (Char + Signature)</option>
                    </select>
                  </div>
                  <div>
                    <label className="kuro-label">Multiplier</label>
                    <select value={state.planner.goalModifier} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'goalModifier', value: +e.target.value })} className="kuro-input w-full" aria-label="Copies multiplier">
                      <option value={1}>×1</option>
                      <option value={2}>×2</option>
                      <option value={3}>×3</option>
                    </select>
                  </div>
                </div>
                <div className="p-2 bg-white/5 rounded text-[10px] text-gray-400 text-center">
                  Using Calculator: <span className={planData.isFeatured ? 'text-yellow-400' : 'text-cyan-400'}>{planData.goalBannerLabel}</span> × <span className="text-gray-100">{planData.goalCopies}</span> copies
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Target</span>
                    <span className="text-gray-100 font-bold">{planData.targetPulls} Convenes ({planData.targetAstrite.toLocaleString()} Ast)</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${planData.isFeatured ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`} style={{ width: `${planData.goalProgress}%` }} />
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
                  <div className="p-2 bg-white/5 rounded text-center">
                    <span className="text-gray-400 text-[10px]">Estimated: </span>
                    <span className="text-yellow-400 text-xs font-medium">{new Date(Date.now() + planData.goalDaysNeeded * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
              </CardBody>
            </Card>

            {state.bookmarks.length > 0 && (
              <Card>
                <CardHeader>Saved States</CardHeader>
                <CardBody className="space-y-2">
                  {state.bookmarks.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div>
                        <div className="text-gray-200 text-xs font-medium">{b.name}</div>
                        <div className="text-gray-400 text-[10px]">{b.astrite} Ast • P{b.charPity}/{b.weapPity}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => dispatch({ type: 'LOAD_BOOKMARK', id: b.id })} className="px-2 py-1 text-[9px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 transition-colors">Load</button>
                        <button onClick={() => dispatch({ type: 'DELETE_BOOKMARK', id: b.id })} className="px-2 py-1 text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 transition-colors">×</button>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}
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
                  <BarChart3 size={32} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-400 text-sm">No data to analyze</p>
                  <p className="text-gray-500 text-xs mt-1">Import your Convene history in Profile tab</p>
                </CardBody>
              </Card>
            ) : (
              <>
                {/* Success Rate Card */}
                {luckRating && (
                  <Card>
                    <CardHeader action={<button onClick={() => setShowLeaderboard(true)} className="text-cyan-400 text-[10px] flex items-center gap-1 hover:text-cyan-300 transition-colors"><TrendingUp size={12} /> Leaderboard</button>}>Luck Rating</CardHeader>
                    <CardBody>
                      <div className="flex items-center gap-4">
                        <div className="luck-badge rounded-xl p-[2px] flex-shrink-0" style={{'--badge-color': luckRating.color}}>
                          <div className="luck-badge-inner rounded-xl px-4 py-3 text-center" style={{minWidth: '90px'}}>
                            <div className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{color: luckRating.color}}>{luckRating.tier}</div>
                            <div className="text-xl font-bold" style={{color: luckRating.color, textShadow: `0 0 20px ${luckRating.color}40`}}>{luckRating.rating}</div>
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-gray-400 text-[10px]">Percentile</span>
                            <span className="text-white font-bold text-sm">Top {Math.max(1, 100 - luckRating.percentile)}%</span>
                          </div>
                          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{width: `${luckRating.percentile}%`, background: `linear-gradient(90deg, ${luckRating.color}40, ${luckRating.color})`}} />
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-gray-400 text-[10px]">Avg Pity</span>
                            <span className="text-gray-200 text-xs font-medium">{overallStats.avgPity}</span>
                          </div>
                          <p className="text-[9px] text-center" style={{color: `${luckRating.color}90`}}>
                            {luckRating.percentile >= 80 ? `Luckier than ${luckRating.percentile}% of players — incredible!`
                              : luckRating.percentile >= 60 ? `Luckier than ${luckRating.percentile}% of players — above average!`
                              : luckRating.percentile >= 40 ? `Around average luck (${luckRating.percentile}th percentile)`
                              : `Unluckier than most — keep tracking to see your trends`}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}
                
                {/* Luck Leaderboard Modal */}
                {showLeaderboard && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Community leaderboard" onKeyDown={(e) => { if (e.key === 'Escape') setShowLeaderboard(false); }}>
                    <div className="kuro-card w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
                      <div className="p-4 pb-2 border-b border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-white font-bold text-sm">Community</h3>
                            <p className="text-gray-400 text-[10px]">Leaderboard & stats</p>
                          </div>
                          <button onClick={() => setShowLeaderboard(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close leaderboard">
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setLeaderboardTab('rankings')} className={`flex-1 text-[10px] font-medium py-1.5 rounded-lg transition-all ${leaderboardTab === 'rankings' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                            Rankings
                          </button>
                          <button onClick={() => setLeaderboardTab('popular')} className={`flex-1 text-[10px] font-medium py-1.5 rounded-lg transition-all ${leaderboardTab === 'popular' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                            Most Pulled
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {leaderboardTab === 'rankings' ? (
                          <>
                            {leaderboardLoading ? (
                              <div className="text-center py-8">
                                <div className="text-gray-400 text-sm">Loading...</div>
                              </div>
                            ) : leaderboardData.length === 0 ? (
                              <div className="text-center py-8">
                                <div className="text-gray-500 text-sm mb-2">No entries yet</div>
                                <div className="text-gray-500 text-[10px]">Be the first to submit!</div>
                              </div>
                            ) : (
                              leaderboardData.map((entry, i) => {
                                const isYou = entry.id === effectiveLeaderboardId || 
                                  (entry.uid && entry.uid === state.profile.uid) ||
                                  (!entry.uid && overallStats?.avgPity && entry.avgPity === parseFloat(overallStats.avgPity) && entry.totalPulls === (overallStats.totalPulls ?? 0) && entry.pulls === (overallStats.fiveStars ?? 0));
                                return (
                                  <div 
                                    key={entry.id}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${isYou ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-white/5'}`}
                                  >
                                    <div 
                                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
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
                                        {isYou && <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">YOU</span>}
                                      </div>
                                      <div className="text-[10px] text-gray-500">{entry.pulls} five-stars</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <div className={`text-sm font-bold ${entry.avgPity <= 45 ? 'text-emerald-400' : entry.avgPity <= 55 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {entry.avgPity.toFixed(1)}
                                      </div>
                                      <div className="text-[9px] text-gray-500">avg pity</div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </>
                        ) : (
                          <>
                            {!communityPulls ? (
                              <div className="text-center py-8">
                                <div className="text-gray-500 text-sm mb-2">No data yet</div>
                                <div className="text-gray-500 text-[10px]">Submit your score to contribute!</div>
                              </div>
                            ) : (
                              <>
                                <p className="text-gray-500 text-[9px] text-center mb-1">{communityPulls.playerCount} player{communityPulls.playerCount !== 1 ? 's' : ''} reporting</p>
                                {communityPulls.chars.length > 0 && (
                                  <>
                                    <p className="text-[10px] text-yellow-400/80 font-semibold uppercase tracking-wider mb-1">★ Resonators</p>
                                    {communityPulls.chars.slice(0, 10).map(([name, count], i) => {
                                      const pct = communityPulls.playerCount > 0 ? Math.round((count / communityPulls.playerCount) * 100) : 0;
                                      const imgUrl = collectionImages[name] || '';
                                      return (
                                        <div key={name} className="flex items-center gap-2.5 py-1.5">
                                          <span className="text-[10px] font-bold w-4 text-right" style={{color: i < 3 ? MEDAL_COLORS[i] : '#6b7280'}}>{i + 1}</span>
                                          {imgUrl && <img src={imgUrl} alt="" className="w-7 h-7 rounded-md object-cover bg-neutral-800 flex-shrink-0" />}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs text-gray-200 truncate">{name}</span>
                                              <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">{pct}%</span>
                                            </div>
                                            <div className="h-1 bg-neutral-800 rounded-full mt-0.5 overflow-hidden">
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
                                          {imgUrl && <img src={imgUrl} alt="" className="w-7 h-7 rounded-md object-cover bg-neutral-800 flex-shrink-0" />}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs text-gray-200 truncate">{name}</span>
                                              <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">{pct}%</span>
                                            </div>
                                            <div className="h-1 bg-neutral-800 rounded-full mt-0.5 overflow-hidden">
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
                        <div className="px-4 py-3 border-t border-white/10 space-y-2">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                            <BarChart3 size={10} /> Community Stats
                            <span className="text-gray-600 font-normal">• {communityStats.totalPlayers} players</span>
                          </p>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-yellow-400 font-bold text-xs">{communityStats.avgPityAll}</div>
                              <div className="text-gray-500 text-[9px]">Global Avg Pity</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-emerald-400 font-bold text-xs">{communityStats.globalWinRate ?? '—'}%</div>
                              <div className="text-gray-500 text-[9px]">50/50 Win Rate</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-cyan-400 font-bold text-xs">{communityStats.totalFiveStars}</div>
                              <div className="text-gray-500 text-[9px]">Total 5★</div>
                            </div>
                          </div>
                          {communityStats.totalPullsAll > 0 && (
                            <div className="flex justify-between text-[9px]">
                              <span className="text-gray-500">{communityStats.totalPullsAll.toLocaleString()} total pulls tracked</span>
                              <span className="text-gray-500">{communityStats.totalWon}W / {communityStats.totalLost}L</span>
                            </div>
                          )}
                          {communityStats.luckiest && communityStats.unluckiest && communityStats.totalPlayers >= 2 && (
                            <div className="flex justify-between text-[9px] gap-2">
                              <span className="text-emerald-500/70 flex items-center gap-0.5"><Clover size={10} /> Luckiest: {communityStats.luckiest.avgPity.toFixed(1)}</span>
                              <span className="text-red-500/70 flex items-center gap-0.5"><TrendingDown size={10} /> Unluckiest: {communityStats.unluckiest.avgPity.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-4 border-t border-white/10 space-y-2">
                        {effectiveLeaderboardId && overallStats?.avgPity && (
                          <>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-gray-400">Your ID: <span className="text-cyan-400 font-mono">{state.profile.uid ? (state.profile.uid.slice(0, 4) + '***') : effectiveLeaderboardId}</span>{state.profile.uid && <span className="text-gray-600 ml-1">(UID)</span>}</span>
                              <span className="text-gray-400">Your Avg: <span className="text-white font-bold">{overallStats.avgPity}</span></span>
                            </div>
                            <button
                              onClick={submitToLeaderboard}
                              className="w-full kuro-btn active-cyan py-2 text-xs font-medium"
                            >
                              Submit My Score
                            </button>
                            <p className="text-gray-500 text-[9px] text-center">Pseudonymous • Your ID, avg pity & pull stats are shared publicly on the leaderboard</p>
                          </>
                        )}
                        {!overallStats?.avgPity && (
                          <p className="text-gray-500 text-[10px] text-center">Import convene history to participate</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
                              onClick={(e) => { e.stopPropagation(); setSelectedTrophy(trophy.id); }}
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
                              <div className="text-[9px] font-bold text-white truncate">{trophy.name}</div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Trophy Description Modal */}
                      {selectedTrophy && (() => {
                        const t = trophies.list.find(tr => tr.id === selectedTrophy);
                        if (!t) return null;
                        const Icon = TROPHY_ICON_MAP[t.icon] || Star;
                        return (
                          <div 
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                            onClick={() => setSelectedTrophy(null)}
                            onKeyDown={(e) => { if (e.key === 'Escape') setSelectedTrophy(null); }}
                            role="dialog"
                            aria-modal="true"
                            aria-label={`Trophy: ${t.name}`}
                            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                          >
                            <div 
                              className="relative mx-6 p-5 rounded-xl text-center max-w-xs w-full"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                background: `linear-gradient(145deg, #1a1a2e, #0d0d1a)`,
                                border: `1.5px solid ${t.color}60`,
                                boxShadow: `0 0 40px ${t.color}25, 0 0 80px ${t.color}10, inset 0 0 30px ${t.color}08`
                              }}
                            >
                              <button onClick={() => setSelectedTrophy(null)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all" aria-label="Close trophy">
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
                              <div className="mt-3 text-[9px] text-gray-500">tap outside or ✕ to close</div>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Current 50/50 Streak */}
                      {trophies.stats.currentStreak.type && (
                        <div className="mt-3 pt-3 border-t border-white/10">
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
                    const start = parseInt(label.split('-', 10)[0]);
                    if (start <= 20) return '#22c55e'; // Green - very lucky
                    if (start <= 40) return '#84cc16'; // Lime - lucky
                    if (start <= 50) return '#fbbf24'; // Yellow - average
                    if (start <= 60) return '#f97316'; // Orange - unlucky
                    return '#ef4444'; // Red - soft pity / hard pity
                  };
                  
                  return (
                    <Card>
                      <CardHeader action={<span className="text-gray-500 text-[10px]">{fiveStars.length} pulls</span>}>
                        <span className="flex items-center gap-1.5"><BarChart3 size={14} /> 5★ Pity Distribution</span>
                      </CardHeader>
                      <CardBody>
                        {/* Screen reader accessible summary */}
                        <div className="sr-only">
                          Pity distribution: {allBuckets.map(label => `${label} pulls: ${buckets[label] || 0}`).join(', ')}. 
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
                                      className="absolute left-0 right-0 text-[9px] text-center font-bold"
                                      style={{ 
                                        bottom: `${height}%`, 
                                        marginBottom: '4px',
                                        color: color,
                                        textShadow: `0 0 8px ${color}`
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
                            <div key={label} className="flex-1 text-[9px] text-gray-500 text-center">
                              {label.split('-')[0]}
                            </div>
                          ))}
                        </div>
                        
                        {/* Stats summary */}
                        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-emerald-400 font-bold text-sm" style={{ textShadow: '0 0 10px rgba(34,197,94,0.5)' }}>{minPity}</div>
                            <div className="text-gray-500 text-[9px]">Lowest</div>
                          </div>
                          <div>
                            <div className="text-yellow-400 font-bold text-sm" style={{ textShadow: '0 0 10px rgba(251,191,36,0.5)' }}>{avgPity}</div>
                            <div className="text-gray-500 text-[9px]">Average</div>
                          </div>
                          <div>
                            <div className="text-red-400 font-bold text-sm" style={{ textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>{maxPity}</div>
                            <div className="text-gray-500 text-[9px]">Highest</div>
                          </div>
                        </div>
                        
                        {/* Pity zone legend - neon dots (all 5 tiers) */}
                        <div className="mt-2 flex items-center justify-center gap-2 text-[9px] flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}></span> 
                            <span className="text-gray-400">1-20</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#84cc16', boxShadow: '0 0 6px #84cc16' }}></span> 
                            <span className="text-gray-400">21-40</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }}></span> 
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
                <Card>
                  <CardHeader>
                    <span className="flex items-center gap-1.5"><TrendingUp size={14} /> Convene History</span>
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      const allHist = statsTabData.allHist;
                      if (allHist.length < 10) return <p className="text-gray-500 text-xs text-center py-4">Need more Convene data for trends</p>;
                      
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
                          return `${d.getDate()}/${d.getMonth()+1}`;
                        } else if (range === 'weekly') {
                          return key.split('-')[1];
                        } else if (range === 'monthly') {
                          return new Date(key + '-15T12:00:00').toLocaleString('default', { month: 'short' }); // Mid-month avoids day shift
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
                      
                      if (allData.length < 2) return <p className="text-gray-500 text-xs text-center py-4">Need more data</p>;
                      
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
                            <div className="sr-only">Pull history chart showing convene activity over time. Data points: {chartData?.map(d => `${d.label}: ${d.pulls} pulls`).join(', ')}.</div>
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="pullGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(251,191,36,0.22)" />
                                    <stop offset="100%" stopColor="rgba(251,191,36,0)" />
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                  contentStyle={{ background: 'rgba(15,20,28,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px' }} 
                                  labelStyle={{ color: '#e5e7eb' }}
                                />
                                <Area type="natural" dataKey="pulls" stroke="rgba(251,191,36,0.4)" fill="url(#pullGradient)" strokeWidth={1} name="Convenes" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          {allData.length > maxVisible && (
                            <div className="text-center text-[9px] text-gray-500 mt-1">
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
                      <div className="kuro-stat p-2 text-center"><div className="text-white font-bold">{overallStats.totalPulls}</div><div className="text-gray-400 text-[9px]">Total Pulls</div></div>
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold">{overallStats.totalAstrite.toLocaleString()}</div><div className="text-gray-400 text-[9px]">Astrite Spent</div></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="kuro-stat kuro-stat-emerald p-2 text-center"><div className="text-emerald-400 font-bold text-sm">{overallStats.won5050}</div><div className="text-gray-400 text-[9px]">Won 50/50</div></div>
                      <div className="kuro-stat kuro-stat-red p-2 text-center"><div className="text-red-400 font-bold text-sm">{overallStats.lost5050}</div><div className="text-gray-400 text-[9px]">Lost 50/50</div></div>
                      <div className="kuro-stat p-2 text-center"><div className="text-white font-bold text-sm">{overallStats.avgPity}</div><div className="text-gray-400 text-[9px]">Avg. Pity</div></div>
                    </div>
                    {overallStats.winRate != null && <div className="text-center text-[10px] text-gray-400 mt-2">50/50 Win Rate: <span className="text-emerald-400 font-bold">{overallStats.winRate}%</span></div>}
                  </CardBody>
                </Card>

                {/* 5★ Pull Log */}
                <Card>
                  <CardHeader>5★ Pull Log</CardHeader>
                  <CardBody>
                    {(() => {
                      const fiveStars = statsTabData.pullLogFiveStars;
                      if (fiveStars.length === 0) return <p className="text-gray-500 text-xs text-center py-4">No 5★ pulls yet</p>;
                      return (
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {fiveStars.map((p, i) => {
                            // P2-FIX: Unified pity color thresholds — matches histogram
                            const pityColor = p.pity <= 20 ? '#22c55e' : p.pity <= 40 ? '#84cc16' : p.pity <= 50 ? '#fbbf24' : p.pity <= 60 ? '#f97316' : '#ef4444';
                            const pityTextColor = p.pity <= 20 ? 'text-emerald-400' : p.pity <= 40 ? 'text-lime-400' : p.pity <= 50 ? 'text-yellow-400' : p.pity <= 60 ? 'text-orange-400' : 'text-red-400';
                            return (
                              <div key={p.id || `pull-${p.name}-${p.pity}-${i}`} className="pull-log-row flex items-center justify-between p-1.5 rounded text-[10px]" style={{'--pity-color': pityColor, background: 'rgba(255,255,255,0.03)'}}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-yellow-400 font-medium truncate">{p.name}</span>
                                  <span className="text-gray-500 flex-shrink-0">{p.banner}</span>
                                  {p.banner === 'Featured' && p.won5050 === true && <span className="text-emerald-400 text-[9px] font-bold flex-shrink-0" aria-label="Won 50/50">W<span className="sr-only"> (Won 50/50)</span></span>}
                                  {p.banner === 'Featured' && p.won5050 === false && <span className="text-red-400 text-[9px] font-bold flex-shrink-0" aria-label="Lost 50/50">L<span className="sr-only"> (Lost 50/50)</span></span>}
                                  {p.banner === 'Featured' && p.won5050 === null && <span className="text-gray-500 text-[9px] flex-shrink-0" aria-label="Guaranteed">G<span className="sr-only"> (Guaranteed)</span></span>}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`font-bold ${pityTextColor}`}>{p.pity ?? '?'}</span>
                                  {p.timestamp && <span className="text-gray-500 text-[9px]">{new Date(p.timestamp).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>}
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
                    <p className="text-gray-400 text-[9px] mb-1.5">Resonators</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold text-sm">{totalObtained.res5}</div><div className="text-gray-400 text-[9px]">5★</div></div>
                      <div className="kuro-stat kuro-stat-purple p-2 text-center"><div className="text-purple-400 font-bold text-sm">{totalObtained.res4}</div><div className="text-gray-400 text-[9px]">4★</div></div>
                    </div>
                    
                    <p className="text-gray-400 text-[9px] mb-1.5">Weapons</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold text-sm">{totalObtained.wep5}</div><div className="text-gray-400 text-[9px]">5★</div></div>
                      <div className="kuro-stat kuro-stat-purple p-2 text-center"><div className="text-purple-400 font-bold text-sm">{totalObtained.wep4}</div><div className="text-gray-400 text-[9px]">4★</div></div>
                      <div className="kuro-stat p-2 text-center"><div className="text-blue-400 font-bold text-sm">{totalObtained.wep3}</div><div className="text-gray-400 text-[9px]">3★</div></div>
                    </div>
                      </>);
                    })()}
                  </CardBody>
                </Card>

                {/* Per-Banner Stats */}
                <Card>
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
                      const colorHex = { yellow: '#fbbf24', pink: '#f472b6', cyan: '#22d3ee' }[banner.color] || '#a78bfa';
                      return (
                        <div key={banner.name} className="p-2 bg-white/5 rounded">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium" style={{color: colorHex}}>{banner.name}</span>
                            <span className="text-gray-400 text-[10px]">{hist.length} Convenes</span>
                          </div>
                          <div className="flex gap-2 text-[9px]">
                            <span className="text-yellow-400">{hist.filter(p => p.rarity === 5).length} 5★</span>
                            <span className="text-purple-400">{hist.filter(p => p.rarity === 4).length} 4★</span>
                            <span className="text-gray-400">Pity: {pity}/80</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardBody>
                </Card>
              </>
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
                  <p className="text-gray-400 text-sm">No Convene data imported</p>
                  <p className="text-gray-500 text-xs mt-1">Go to Profile tab to import your data</p>
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
                  const totalOwned = ownedChars5 + ownedChars4 + ownedWeaps5 + ownedWeaps4 + ownedWeaps3;
                  const totalItems = ALL_5STAR_RESONATORS.length + ALL_4STAR_RESONATORS.length + ALL_5STAR_WEAPONS.length + ALL_4STAR_WEAPONS.length + ALL_3STAR_WEAPONS.length;
                  const pct = totalItems > 0 ? Math.round((totalOwned / totalItems) * 100) : 0;
                  return (
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5 content-layer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-xs font-medium">Collection Progress</span>
                        <span className="text-yellow-400 text-sm font-bold">{pct}%</span>
                      </div>
                      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all" style={{width: `${pct}%`}} />
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-center text-[9px]">
                        <div><div className="text-yellow-400 font-bold">{ownedChars5}<span className="text-gray-500 font-normal">/{ALL_5STAR_RESONATORS.length}</span></div><div className="text-gray-500 mt-1">5★ Res</div></div>
                        <div><div className="text-purple-400 font-bold">{ownedChars4}<span className="text-gray-500 font-normal">/{ALL_4STAR_RESONATORS.length}</span></div><div className="text-gray-500 mt-1">4★ Res</div></div>
                        <div><div className="text-yellow-400 font-bold">{ownedWeaps5}<span className="text-gray-500 font-normal">/{ALL_5STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">5★ Wep</div></div>
                        <div><div className="text-purple-400 font-bold">{ownedWeaps4}<span className="text-gray-500 font-normal">/{ALL_4STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">4★ Wep</div></div>
                        <div><div className="text-blue-400 font-bold">{ownedWeaps3}<span className="text-gray-500 font-normal">/{ALL_3STAR_WEAPONS.length}</span></div><div className="text-gray-500 mt-1">3★ Wep</div></div>
                      </div>
                    </div>
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
                      placeholder="Search by name..."
                      className="w-full px-3 py-2 pl-8 rounded-lg text-xs bg-neutral-800/80 border border-white/10 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition-all"
                      aria-label="Search collection by name"
                    />
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    {collectionSearch && (
                      <button onClick={() => setCollectionSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors" aria-label="Clear search">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  {/* Filter Row */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {/* Element Filter */}
                      <select
                        value={collectionElementFilter}
                        onChange={(e) => setCollectionElementFilter(e.target.value)}
                        className="px-2 py-1 rounded text-[9px] bg-neutral-800 text-gray-300 border border-white/10 focus:border-yellow-500/50 focus:outline-none"
                        aria-label="Filter by element"
                      >
                        <option value="all">All Elements</option>
                        <option value="Aero">Aero</option>
                        <option value="Glacio">Glacio</option>
                        <option value="Electro">Electro</option>
                        <option value="Fusion">Fusion</option>
                        <option value="Spectro">Spectro</option>
                        <option value="Havoc">Havoc</option>
                      </select>
                      
                      {/* Weapon Filter */}
                      <select
                        value={collectionWeaponFilter}
                        onChange={(e) => setCollectionWeaponFilter(e.target.value)}
                        className="px-2 py-1 rounded text-[9px] bg-neutral-800 text-gray-300 border border-white/10 focus:border-yellow-500/50 focus:outline-none"
                        aria-label="Filter by weapon type"
                      >
                        <option value="all">All Weapons</option>
                        <option value="Broadblade">Broadblade</option>
                        <option value="Sword">Sword</option>
                        <option value="Pistols">Pistols</option>
                        <option value="Gauntlets">Gauntlets</option>
                        <option value="Rectifier">Rectifier</option>
                      </select>
                      
                      {/* Ownership Filter */}
                      <select
                        value={collectionOwnershipFilter}
                        onChange={(e) => setCollectionOwnershipFilter(e.target.value)}
                        className="px-2 py-1 rounded text-[9px] bg-neutral-800 text-gray-300 border border-white/10 focus:border-yellow-500/50 focus:outline-none"
                        aria-label="Filter by ownership"
                      >
                        <option value="all">All Items</option>
                        <option value="owned">Owned</option>
                        <option value="missing">Missing</option>
                      </select>
                      
                      {/* Clear Filters */}
                      {hasActiveFilters && (
                        <button
                          onClick={clearCollectionFilters}
                          className="px-2 py-1 rounded text-[9px] bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    
                    {/* Sort Controls */}
                    <div className="flex gap-1.5 items-center justify-end">
                      <button
                        onClick={refreshImages}
                        className="px-2 py-1 rounded text-[10px] bg-neutral-800 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 transition-all"
                        title="Refresh images if they don't load"
                      >
                        <RefreshCcw size={10} />
                      </button>
                      <button
                        onClick={() => setCollectionSort('copies')}
                        className={`px-2 py-1 rounded text-[10px] transition-all ${collectionSort === 'copies' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : 'bg-neutral-800 text-gray-400 border border-white/10'}`}
                        title="Sort by copies"
                      >
                        #
                      </button>
                      <button
                        onClick={() => setCollectionSort('release')}
                        className={`px-2 py-1 rounded text-[10px] transition-all ${collectionSort === 'release' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-neutral-800 text-gray-400 border border-white/10'}`}
                        title="Sort by release date"
                      >
                        <Calendar size={10} />
                      </button>
                    </div>
                  </div>
                </div>

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
                    />
                  </CardBody>
                </Card>

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
                      dataLookup={{}} dataType="weapon" isCharacter={false}
                    />
                  </CardBody>
                </Card>
              </>
            )}
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

            <Card>
              <CardHeader>Server Region</CardHeader>
              <CardBody>
                <div className="grid grid-cols-5 gap-1">
                  {Object.keys(SERVERS).map(s => (
                    <button key={s} onClick={() => dispatch({ type: 'SET_SERVER', server: s })} className={`kuro-btn py-2 text-[10px] font-medium ${state.server === s ? 'active-gold' : ''}`}>{s}</button>
                  ))}
                </div>
                <p className="text-gray-400 text-[10px] mt-2 text-center">Reset: 4:00 AM (UTC{getServerOffset(state.server) >= 0 ? '+' : ''}{getServerOffset(state.server)})</p>
              </CardBody>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader><Settings size={14} className="text-gray-400" /> Display Settings</CardHeader>
              <CardBody className="space-y-3">
                {/* OLED Mode Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${visualSettings.oledMode ? 'bg-white text-black' : 'bg-neutral-800 text-gray-400'}`}>
                      <Monitor size={16} />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">OLED Mode</div>
                      <div className="text-gray-400 text-[9px]">True black (#000) for OLED screens</div>
                    </div>
                  </div>
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, oledMode: !visualSettings.oledMode })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${visualSettings.oledMode ? 'bg-white' : 'bg-neutral-700'}`}
                    aria-label="Toggle OLED mode"
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${visualSettings.oledMode ? 'left-6 bg-black' : 'left-1 bg-gray-400'}`} />
                  </button>
                </div>
                {visualSettings.oledMode && (
                  <p className="text-emerald-400 text-[9px] text-center">✓ OLED mode active - saves battery on OLED displays</p>
                )}
                
                {/* Swipe Navigation Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${visualSettings.swipeNavigation ? 'bg-cyan-500 text-white' : 'bg-neutral-800 text-gray-400'}`}>
                      <ChevronDown size={16} className="-rotate-90" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">Swipe Navigation</div>
                      <div className="text-gray-400 text-[9px]">Swipe left/right to switch tabs</div>
                    </div>
                  </div>
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, swipeNavigation: !visualSettings.swipeNavigation })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${visualSettings.swipeNavigation ? 'bg-cyan-500' : 'bg-neutral-700'}`}
                    aria-label="Toggle swipe navigation"
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${visualSettings.swipeNavigation ? 'left-6 bg-white' : 'left-1 bg-gray-400'}`} />
                  </button>
                </div>
                {visualSettings.swipeNavigation && (
                  <p className="text-cyan-400 text-[9px] text-center">✓ Swipe left/right on content area to navigate</p>
                )}
                
                {/* Animations Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${visualSettings.animationsEnabled ? 'bg-purple-500 text-white' : 'bg-neutral-800 text-gray-400'}`}>
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">Animations</div>
                      <div className="text-gray-400 text-[9px]">Background effects, transitions & glow</div>
                    </div>
                  </div>
                  <button
                    onClick={() => saveVisualSettings({ ...visualSettings, animationsEnabled: !visualSettings.animationsEnabled })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${visualSettings.animationsEnabled ? 'bg-purple-500' : 'bg-neutral-700'}`}
                    aria-label="Toggle animations"
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${visualSettings.animationsEnabled ? 'left-6 bg-white' : 'left-1 bg-gray-400'}`} />
                  </button>
                </div>
                {!visualSettings.animationsEnabled && (
                  <p className="text-gray-500 text-[9px] text-center">✗ All animations disabled — saves battery & reduces motion</p>
                )}
                {visualSettings.animationsEnabled && (
                  <p className="text-purple-400 text-[9px] text-center">✓ Animations enabled — background effects, transitions & glow</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>Import Convene History</CardHeader>
              <CardBody className="space-y-3">
                <p className="text-gray-300 text-[10px]">Import your Convene history from wuwatracker or compatible trackers.</p>
                <div className="grid grid-cols-3 gap-2">
                  {[['pc', 'PC', Monitor], ['android', 'Android', Smartphone], ['ps5', 'PS5', Gamepad2]].map(([k, l, Icon]) => (
                    <button key={k} onClick={() => setImportPlatform(k)} className={`kuro-btn p-2 text-center ${importPlatform === k ? 'active-gold' : ''}`}>
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
                    <div className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragOver ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/20 hover:border-yellow-500/50'}`}>
                      <Upload size={20} className={`mx-auto mb-1 ${isDragOver ? 'text-yellow-400' : 'text-gray-300'}`} />
                      <p className={`text-[10px] ${isDragOver ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>
                        {isDragOver ? 'Drop JSON file here' : 'Upload or drag & drop JSON file from wuwatracker'}
                      </p>
                    </div>
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
                    <p className="text-gray-500 text-[9px]">
                      💡 In wuwatracker: Profile → Settings → Data → Export Pull History → Copy the JSON content
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {state.profile.importedAt && (
              <Card>
                <CardHeader action={<button onClick={() => { if (window.confirm('Clear all imported Convene history? This cannot be undone.')) { dispatch({ type: 'CLEAR_PROFILE' }); toast?.addToast?.('Profile cleared!', 'info'); } }} className="text-red-400 text-[10px] hover:text-red-300 transition-colors">Clear</button>}>Import Info</CardHeader>
                <CardBody>
                  {state.profile.uid && <div className="flex justify-between text-xs mb-2"><span className="text-gray-400">UID</span><span className="text-gray-100 font-mono">{state.profile.uid}</span></div>}
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Imported</span><span className="text-gray-300">{new Date(state.profile.importedAt).toLocaleDateString('en-US')}</span></div>
                  <p className="text-gray-500 text-[9px] mt-2">View detailed stats in the Stats tab</p>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardBody className="space-y-2">
                <button onClick={handleExport} className="kuro-btn w-full py-2 flex items-center justify-center gap-1">
                  <Download size={14} /> Export Backup
                </button>
                <button onClick={() => { if (window.confirm('Are you sure you want to reset ALL data? This cannot be undone.')) { haptic.warning(); dispatch({ type: 'RESET' }); toast?.addToast?.('All data reset!', 'info'); } }} className="kuro-btn w-full py-2 active-red">
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
                
                <div className="space-y-2 text-[9px] text-gray-500">
                  <p className="font-medium text-gray-400">Disclaimer</p>
                  <p>Whispering Wishes is an unofficial fan-made tool and is not affiliated with, endorsed by, or associated with Kuro Games, Kuro Technology (HK) Co., Limited, or any of their subsidiaries.</p>
                  <p>Wuthering Waves, all game content, characters, names, and related media are trademarks and copyrights of Kuro Games © 2024-{new Date().getFullYear()}. All rights reserved.</p>
                </div>
                
                <div className="space-y-2 text-[9px] text-gray-500">
                  <p className="font-medium text-gray-400">Data & Privacy</p>
                  <p>Most data is stored locally on your device using browser storage. Your Convene history, calculator settings, and app preferences remain private and under your control.</p>
                  <p><strong className="text-gray-400">Leaderboard:</strong> If you choose to submit your score, your generated user ID, average pity, pull count, 50/50 win/loss stats, and owned 5★ items are sent to a shared database and displayed publicly in the leaderboard rankings. This data is pseudonymous (linked to a randomly generated ID). You can opt out by simply not submitting your score.</p>
                  <p>This app does not require any special device permissions. Data import relies on files you manually provide from third-party tools like wuwatracker.com.</p>
                </div>
                
                <div className="space-y-2 text-[9px] text-gray-500">
                  <p className="font-medium text-gray-400">Third-Party Services</p>
                  <p>This app recommends wuwatracker.com for data export. We are not affiliated with wuwatracker.com and are not responsible for their services, data handling, or availability.</p>
                </div>
                
                <div className="space-y-2 text-[9px] text-gray-500">
                  <p className="font-medium text-gray-400">Data Sources & Attribution</p>
                  <p>Banner schedules, event timings, and countdown data are sourced from:</p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li><a href="https://wuwatracker.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">WuWa Tracker</a> - Event timeline & pity tracking</li>
                    <li><a href="https://wuthering-countdown.gengamer.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">GenGamer Countdown</a> - Banner countdowns</li>
                  </ul>
                  <p className="mt-1">We thank these community resources for providing accurate timing data.</p>
                </div>
                
                <div className="space-y-2 text-[9px] text-gray-500">
                  <p className="font-medium text-gray-400">License</p>
                  <p>This tool is provided "as is" without warranty of any kind. Use at your own discretion. The developers are not responsible for any issues arising from the use of this application.</p>
                </div>
                
                <p className="text-center text-[8px] text-gray-500 pt-2">© {new Date().getFullYear()} Whispering Wishes by <a href="https://www.reddit.com/u/WW_Andene" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 transition-colors">u/WW_Andene</a> • Made with ♡ for the WuWa community.</p>
              </CardBody>
            </Card>
          </div>
          </TabErrorBoundary>
          </div>
        )}

      </main>

      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowBookmarkModal(false); }} role="dialog" aria-modal="true" aria-label="Save bookmark" onKeyDown={(e) => { if (e.key === 'Escape') setShowBookmarkModal(false); }}>
          <Card className="w-full max-w-sm">
            <CardHeader action={<button onClick={() => setShowBookmarkModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close bookmark modal"><X size={16} /></button>}>Save Current State</CardHeader>
            <CardBody className="space-y-3">
              <input type="text" value={bookmarkName} onChange={e => setBookmarkName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { haptic.success(); dispatch({ type: 'SAVE_BOOKMARK', name: bookmarkName || 'Unnamed' }); setBookmarkName(''); setShowBookmarkModal(false); } }} placeholder="Enter name..." maxLength={30} className="kuro-input w-full" aria-label="Bookmark name" />
              <div className="text-gray-300 text-[10px]">
                <p>Astrite: {state.calc.astrite || 0} • Char Pity: {state.calc.charPity} • Weap Pity: {state.calc.weapPity}</p>
                <p>Radiant: {state.calc.radiant || 0} • Forging: {state.calc.forging || 0}</p>
              </div>
              <button onClick={() => { haptic.success(); dispatch({ type: 'SAVE_BOOKMARK', name: bookmarkName || 'Unnamed' }); setBookmarkName(''); setShowBookmarkModal(false); }} className="kuro-btn w-full active-purple">Save Bookmark</button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) { setRestoreText(''); setShowExportModal(false); } }} role="dialog" aria-modal="true" aria-label="Backup and restore" onKeyDown={(e) => { if (e.key === 'Escape') { setRestoreText(''); setShowExportModal(false); } }}>
          <Card className="w-full max-w-sm">
            <CardHeader action={<button onClick={() => { setRestoreText(''); setShowExportModal(false); }} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close export modal"><X size={16} /></button>}>Backup</CardHeader>
            <CardBody className="space-y-3">
              <p className="text-gray-400 text-[10px]">Copy this data and save it as a .json file:</p>
              <textarea 
                value={exportData} 
                readOnly 
                className="kuro-input w-full h-24 text-[9px] font-mono"
                onClick={e => e.target.select()}
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
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 px-2 text-[9px] text-gray-500 uppercase tracking-wider">Restore</span>
              </div>
              
              <p className="text-gray-400 text-[10px]">Paste backup data to restore:</p>
              <textarea 
                value={restoreText}
                onChange={(e) => setRestoreText(e.target.value)}
                placeholder="Paste backup JSON here..."
                className="kuro-input w-full h-20 text-[9px] font-mono"
              />
              <button 
                onClick={() => {
                  if (!restoreText.trim()) {
                    toast?.addToast?.('Please paste backup data first', 'error');
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
                      toast?.addToast?.('Invalid backup — pull history must be an array', 'error');
                      return;
                    }
                    
                    // Version check warning
                    const backupVersion = data.version || 'unknown';
                    const pullCount = (s.profile?.featured?.history?.length || 0) + (s.profile?.weapon?.history?.length || 0) + (s.profile?.standardChar?.history?.length || 0) + (s.profile?.standardWeap?.history?.length || 0);
                    
                    // Confirmation dialog
                    const confirmed = window.confirm(
                      `Restore backup from v${backupVersion}?\n\n` +
                      `This will REPLACE all current data:\n` +
                      `• ${pullCount} total pulls\n` +
                      `• ${s.bookmarks?.length || 0} bookmarks\n` +
                      `• All calculator & planner settings\n\n` +
                      `This action cannot be undone. Continue?`
                    );
                    if (!confirmed) return;
                    
                    const restoredState = {
                      ...initialState,
                      ...s,
                      server: s.server || initialState.server,
                      profile: { ...initialState.profile, ...s.profile },
                      calc: { ...initialState.calc, ...s.calc },
                      planner: { ...initialState.planner, ...s.planner },
                      settings: { ...initialState.settings, ...s.settings },
                      bookmarks: Array.isArray(s.bookmarks) ? s.bookmarks : [],
                    };
                    dispatch({ type: 'LOAD_STATE', state: restoredState });
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
            </CardBody>
          </Card>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && !adminMiniMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); } }} role="dialog" aria-modal="true" aria-label="Admin panel" onKeyDown={(e) => { if (e.key === 'Escape') { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); } }}>
          <div className="kuro-card w-full max-w-2xl" style={{ maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="kuro-card-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
            <CardHeader action={<button onClick={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close admin panel"><X size={16} /></button>}>
              <span className="flex items-center gap-2"><Settings size={16} /> Admin Panel</span>
            </CardHeader>
            <div className="kuro-body space-y-3" style={{ overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
              {!adminUnlocked ? (
                <div className="space-y-3">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-center">
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
                    />
                    <button onClick={verifyAdminPassword} className="kuro-btn px-4">Unlock</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2 text-center">
                    <p className="text-emerald-400 text-xs">Admin Panel Unlocked</p>
                  </div>

                  {/* Admin Tab Switcher */}
                  <div className="flex gap-2 border-b border-white/10 pb-2 flex-wrap">
                    <button
                      onClick={() => setAdminTab('banners')}
                      className={`px-3 py-1.5 rounded text-[9px] transition-all ${adminTab === 'banners' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : 'text-gray-400 hover:text-white border border-white/10'}`}
                    >
                      Banners
                    </button>
                    <button
                      onClick={() => setAdminTab('collection')}
                      className={`px-3 py-1.5 rounded text-[9px] transition-all ${adminTab === 'collection' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white border border-white/10'}`}
                    >
                      Collection
                    </button>
                    <button
                      onClick={() => setAdminTab('visuals')}
                      className={`px-3 py-1.5 rounded text-[9px] transition-all ${adminTab === 'visuals' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white border border-white/10'}`}
                    >
                      Visual Settings
                    </button>
                  </div>

                  {/* Collection Tab */}
                  {adminTab === 'collection' && (
                    <div className="space-y-4">
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
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
                            return <p className="text-gray-500 text-xs text-center py-4">Import Convene data first to see your collection items</p>;
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
                                          if (val.length > 5 && !/^https?:\/\//i.test(val)) return; // P7-FIX: URL validation (7B) — only enforce once user types a real URL
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
                                        className="w-8 h-8 object-cover rounded border border-purple-500/30"
                                        onError={(e) => e.target.style.display = 'none'}
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
                          onClick={() => { if (window.confirm('Clear all custom image overrides?')) saveCollectionImages({}); }}
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
                          onClick={() => { if (window.confirm('Reset all visual settings to defaults?')) saveVisualSettings(defaultVisualSettings); }}
                          className="flex-1 px-4 py-2 bg-neutral-700 text-gray-300 rounded text-xs hover:bg-neutral-600"
                        >
                          Reset to Defaults
                        </button>
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
                        placeholder="Phase"
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
                      className="kuro-input w-full h-32 text-[9px] font-mono"
                      value={bannerForm.charsJson}
                      onChange={(e) => updateBannerForm('charsJson', e.target.value)}
                      placeholder="Paste characters array JSON"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Featured Weapons (JSON)</h3>
                    <textarea
                      className="kuro-input w-full h-32 text-[9px] font-mono"
                      value={bannerForm.weapsJson}
                      onChange={(e) => updateBannerForm('weapsJson', e.target.value)}
                      placeholder="Paste weapons array JSON"
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
                        />
                      </div>
                    </div>
                    <p className="text-gray-500 text-[9px]">Paste direct image URLs from ibb.co (use i.ibb.co links)</p>
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
                          chars.forEach((c, i) => {
                            if (!c.id || !c.name) throw new Error(`Character ${i + 1} missing id or name`);
                            const img = (bannerForm.charImages[i] ?? '').trim();
                            if (img) c.imageUrl = img;
                          });
                          weaps.forEach((w, i) => {
                            if (!w.id || !w.name) throw new Error(`Weapon ${i + 1} missing id or name`);
                            const img = (bannerForm.weapImages[i] ?? '').trim();
                            if (img) w.imageUrl = img;
                          });
                          const startDate = new Date(bannerForm.startDate);
                          const endDate = new Date(bannerForm.endDate);
                          if (isNaN(startDate.getTime())) throw new Error('Invalid start date');
                          if (isNaN(endDate.getTime())) throw new Error('Invalid end date');
                          if (endDate <= startDate) throw new Error('End date must be after start date');
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
                      onClick={() => {
                        if (!window.confirm('Reset to default banners? Custom banner data will be lost.')) return;
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
        </div>
      )}

      {/* Admin Mini Window */}
      {showAdminPanel && adminMiniMode && adminUnlocked && (
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
              className={`w-full py-2 rounded text-[10px] font-medium border transition-all ${framingMode ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
            >
              {framingMode ? '✓ Framing Mode ON (Collection only)' : '⊞ Enable Framing Mode (Collection)'}
            </button>
            
            {/* Framing Controls - show when image selected */}
            {framingMode && editingImage && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="text-emerald-400 text-[9px] font-medium mb-2 truncate">
                  Editing: {editingImage.replace('collection-', '')}
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
              <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-center">
                <div className="text-gray-400 text-[10px]">Go to Collection tab and tap an image to frame it</div>
              </div>
            )}
            
            {!framingMode && (
              <>
            {/* Reset Button — P6-FIX: Added confirm dialog (MED) */}
            <button 
              onClick={() => { if (window.confirm('Reset all visual settings to defaults?')) saveVisualSettings(defaultVisualSettings); }}
              className="w-full py-1.5 rounded text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
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
          </div>
        </div>
      )}

      {/* Character/Weapon Detail Modal */}
      {detailModal.show && detailModal.type === 'character' && (
        <CharacterDetailModal 
          name={detailModal.name} 
          imageUrl={detailModal.imageUrl}
          onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null })} 
        />
      )}
      {detailModal.show && detailModal.type === 'weapon' && (
        <WeaponDetailModal 
          name={detailModal.name} 
          imageUrl={detailModal.imageUrl}
          onClose={() => setDetailModal({ show: false, type: null, name: null, imageUrl: null })} 
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4 text-center border-t border-white/10" style={{background: 'rgba(8,12,18,0.9)'}}>
        <p className="text-gray-500 text-[10px]">
          <span onClick={handleAdminTap} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAdminTap(); } }} tabIndex={0} role="button" className="cursor-pointer select-none" style={adminTapCount >= 3 ? { color: 'rgba(251,191,36,0.5)', transition: 'color 0.3s' } : undefined}>{`Whispering Wishes v${APP_VERSION}`}</span> • by u/WW_Andene • Not affiliated with Kuro Games • <a href="mailto:whisperingwishes.app@gmail.com" className="text-gray-500 hover:text-yellow-400 transition-colors">Contact</a>
        </p>
      </footer>
    </div>
  );
}

// [SECTION:EXPORT]
export default function WhisperingWishes() {
  return (
    <AppErrorBoundary>
      <PWAProvider>
        <ToastProvider>
          <WhisperingWishesInner />
        </ToastProvider>
      </PWAProvider>
    </AppErrorBoundary>
  );
}
