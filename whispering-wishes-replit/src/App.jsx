import React, { useState, useMemo, useCallback, useReducer, useEffect, useRef, createContext, useContext, memo } from 'react';
import { Sparkles, Swords, Sword, Star, Calculator, User, Calendar, TrendingUp, Upload, Download, RefreshCcw, Plus, Minus, Check, Target, BarChart3, Zap, BookmarkPlus, X, ChevronDown, LayoutGrid, Archive, Info, CheckCircle, AlertCircle, Settings, Monitor, Smartphone, Gamepad2, Crown, Trophy, Award, Flame, Diamond, Gift, Heart, Shield, TrendingDown, Fish, Clover } from 'lucide-react';
import { XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES v2.9.5 - Wuthering Waves Convene Companion
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

const APP_VERSION = '2.9.5';

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
  short_name: 'Wishes',
  description: 'Wuthering Waves Convene Companion - Track pulls, plan resources, analyze luck',
  start_url: '/',
  display: 'standalone',
  background_color: '#0a0a0a',
  theme_color: '#fbbf24',
  orientation: 'portrait-primary',
  icons: [
    { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23fbbf24" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="%23000">✨</text></svg>', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
    { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23fbbf24" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="%23000">✨</text></svg>', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
  ],
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
const APP_CACHE = 'ww-app-v295';
const IMG_CACHE = 'ww-images-v295';
const CDN_CACHE = 'ww-cdn-v295';
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
  const [swRegistration, setSwRegistration] = useState(null);
  
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
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
    
    // Inject manifest
    const manifestBlob = new Blob([JSON.stringify(PWA_MANIFEST)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = manifestUrl;
    document.head.appendChild(manifestLink);
    
    // Add meta tags for PWA
    const metaTags = [
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
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
        document.head.appendChild(meta);
      }
    });
    
    // Register service worker (blob URLs may fail in some environments)
    if ('serviceWorker' in navigator) {
      try {
        const swBlob = new Blob([SERVICE_WORKER_CODE], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(swBlob);
        
        navigator.serviceWorker.register(swUrl, { scope: '/' })
          .then((registration) => {
            setSwRegistration(registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('New version available');
                }
              });
            });
          })
          .catch(() => {
            // Blob URL service workers may not work in all environments — app still functions without SW
          });
      } catch (err) {
        // Service worker not critical — app works fine without it
      }
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      URL.revokeObjectURL(manifestUrl);
      // Clean up injected DOM elements
      if (manifestLink.parentNode) manifestLink.parentNode.removeChild(manifestLink);
      metaTags.forEach(({ name }) => {
        const el = document.querySelector(`meta[name="${name}"]`);
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
              className="p-1 text-black/50 hover:text-black transition-colors"
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
    else haptic.light();
  }, []);
  
  const contextValue = useMemo(() => ({ addToast }), [addToast]);
  
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div style={{position:'fixed', bottom:'80px', left:'16px', right:'16px', zIndex:9999, display:'flex', flexDirection:'column', gap:'8px', pointerEvents:'none'}}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '12px', fontWeight: 500, pointerEvents: 'auto', animation: 'slideUp 0.2s ease-out',
            background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.9)',
            color: 'white', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

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
    { title: "You're Ready!", icon: <CheckCircle size={32} />, desc: "Good luck on your Convenes, Rover!", gradient: 'from-neutral-900/30 via-neutral-900/20 to-emerald-900/30', border: 'border-emerald-500/30', bg: 'bg-emerald-500/20', color: '#34d399' }
  ];
  
  const s = steps[step];
  
  return (
    <div style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'16px', background:'rgba(0,0,0,0.9)'}}>
      <div className={`relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-r ${s.gradient}`} style={{ width:'100%', maxWidth:'320px', backgroundColor: 'rgba(12, 16, 24, 0.12)', backdropFilter: 'blur(6px)', zIndex: 5 }}>
        {/* Decorative gradient circles */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full ${s.bg} blur-2xl opacity-40`} />
          <div className={`absolute right-12 top-1/4 w-10 h-10 rounded-full ${s.bg} blur-xl opacity-25`} />
        </div>
        
        {/* Skip button - always white */}
        <button onClick={onComplete} className="absolute top-3 right-3 z-20 text-[9px] px-3 py-1 rounded text-gray-400 hover:text-gray-300 transition-colors" style={{background:'rgba(255,255,255,0.05)'}}>Skip</button>
        
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
              <button onClick={() => setStep(step - 1)} className="text-[9px] px-3 py-1 rounded text-gray-400 hover:text-gray-300 transition-colors" style={{background:'rgba(255,255,255,0.05)'}}>Back</button>
            )}
          </div>
          <div>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="text-[9px] px-3 py-1 rounded text-gray-400 hover:text-gray-300 transition-colors" style={{background:'rgba(255,255,255,0.05)'}}>Next</button>
            ) : (
              <button onClick={onComplete} className="text-[9px] px-3 py-1 rounded border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">Get Started</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// [SECTION:LUCK]
const calculateLuckRating = (avgPity) => {
  if (!avgPity || avgPity === '—') return null;
  const avg = parseFloat(avgPity);
  if (isNaN(avg) || avg <= 0) return null;
  
  // Calculate percentile based on normal distribution (mean=62.5, std=12)
  // Lower avg pity = better luck = higher percentile
  const zScore = (62.5 - avg) / 12;
  const percentile = Math.min(99, Math.max(1, Math.round(50 + zScore * 34)));
  
  // WuWa-themed rank names
  if (percentile >= 90) return { rating: 'Arbiter', color: '#fbbf24', tier: 'S+', percentile };
  if (percentile >= 80) return { rating: 'Sentinel', color: '#a855f7', tier: 'S', percentile };
  if (percentile >= 60) return { rating: 'Resonator', color: '#3b82f6', tier: 'A', percentile };
  if (percentile >= 40) return { rating: 'Tacet Discord', color: '#22c55e', tier: 'B', percentile };
  return { rating: 'Civilian', color: '#6b7280', tier: 'C', percentile };
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
      color: #e2e8f0;
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
    
    /* Hide scrollbar for nav */
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    
    /* ═══ TAB CONTENT TRANSITIONS ═══ */
    .tab-content {
      animation: tabFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
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
      color: #f8fafc;
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
      color: #e2e8f0;
    }
    
    /* ═══ BUTTONS - Glassy style with bright text ═══ */
    .kuro-btn {
      position: relative;
      background: var(--bg-btn);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 10px 12px;
      color: #f1f5f9;
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
      background: rgba(240, 192, 64, 0.15);
      border-color: rgba(240, 192, 64, 0.7);
      color: #fef08a;
      box-shadow: 0 0 25px rgba(240, 192, 64, 0.3), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 20px rgba(240, 192, 64, 0.08);
      text-shadow: 0 0 12px rgba(240, 192, 64, 0.6);
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
    
    .kuro-input:focus {
      outline: none;
      border-color: rgba(var(--color-gold), 0.6);
      box-shadow: 0 0 0 3px rgba(var(--color-gold), 0.1), 0 0 20px rgba(var(--color-gold), 0.08);
      background: rgba(15, 20, 28, 0.9);
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
      background: rgba(240, 192, 64, 0.15);
      border-color: rgba(240, 192, 64, 0.5);
    }
    .kuro-stat-gold::before {
      background: linear-gradient(90deg, transparent, rgba(240, 192, 64, 1), transparent);
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
        border-color: rgba(240, 192, 64, 0.7);
        box-shadow: 0 4px 20px rgba(240, 192, 64, 0.15);
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
      color: #e2e8f0;
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
      box-shadow: 0 0 12px rgba(240, 192, 64, 0.6);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    
    .kuro-slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 0 18px rgba(240, 192, 64, 0.8);
    }
    
    .kuro-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f0c040, #fbbf24);
      cursor: pointer;
      border: 2px solid rgba(0,0,0,0.4);
      box-shadow: 0 0 12px rgba(240, 192, 64, 0.6);
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
    
    /* ═══ REDUCED MOTION ═══ */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
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
  if (!serverData) return 1; // Default to Europe
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
      // Parse offset like "GMT-4" or "GMT+2"
      const match = tzPart.value.match(/GMT([+-]\d+)/);
      if (match) return parseInt(match[1]);
    }
  } catch (e) {
    // Fallback to hardcoded offset if Intl API fails
  }
  return serverData.utcOffset;
};

// [SECTION:BANNERS]
const CURRENT_BANNERS = {
  version: '3.1', phase: 1,
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
    { id: 'chisa', name: 'Chisa', title: 'Snowfield Melody', element: 'Havoc', weaponType: 'Sword', isNew: false, featured4Stars: ['Mortefi', 'Yangyang', 'Taoqi'], imageUrl: 'https://i.ibb.co/KcYh2QNC/vvcistuu87vf1.jpg' },
    { id: 'lupa', name: 'Lupa', title: 'Blazing Fang', element: 'Fusion', weaponType: 'Pistols', isNew: false, featured4Stars: ['Mortefi', 'Yangyang', 'Taoqi'], imageUrl: 'https://i.ibb.co/Y4mKyFJm/Gq-Vx28sao-AAekz-H.jpg' },
  ],
  weapons: [
    { id: 'everbright', name: 'Everbright Polestar', title: 'Absolute Pulsation', type: 'Sword', forCharacter: 'Aemeath', element: 'Fusion', isNew: true, featured4Stars: ['Discord', 'Waning Redshift', 'Celestial Spiral'], imageUrl: 'https://i.ibb.co/b5sWk8HR/featured-Image-6.jpg' },
    { id: 'kumokiri', name: 'Kumokiri', title: 'Absolute Pulsation', type: 'Sword', forCharacter: 'Chisa', element: 'Glacio', isNew: false, featured4Stars: ['Discord', 'Waning Redshift', 'Celestial Spiral'], imageUrl: 'https://i.ibb.co/7BwnqBN/images-2026-02-04-T182250-074.jpg' },
    { id: 'wildfire', name: 'Wildfire Mark', title: 'Absolute Pulsation', type: 'Pistols', forCharacter: 'Lupa', element: 'Fusion', isNew: false, featured4Stars: ['Discord', 'Waning Redshift', 'Celestial Spiral'], imageUrl: 'https://i.ibb.co/1Y5gbsfC/684baaa5266f9f96e0cfb644f-MGLAQ5m03.webp' },
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
    bestEchoes: ['Corrosaurus', 'Flamewing\u0027s Shadow 3pc + Molten Rift 2pc'], bestWeapon: 'Lux & Umbra',
    teams: ['Galbrena + Qiuyuan + Shorekeeper', 'Galbrena + Lupa + Brant'] },
  'Qiuyuan': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Former Mingting intelligence agent. Echo Skill DMG buffer with Crit DMG Amp.',
    skills: ['Frost Edge', 'Winter Slash', 'Blizzard Dance', 'Eternal Winter'],
    ascension: { boss: 'Truth in Lies', common: 'Whisperin Core', specialty: 'Wintry Bell' },
    bestEchoes: ['Impermanence Heron', 'Law of Harmony 3pc + Sierra Gale 2pc'], bestWeapon: 'Emerald Sentence',
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
    skills: ['Frost Touch', 'Cold Blessing', 'Winter Veil', 'Glacial Embrace'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Whisperin Core', specialty: "Loong's Pearl" },
    bestEchoes: ['Bell-Borne Geochelone', 'Moonlit Clouds 4pc'], bestWeapon: 'Variation',
    teams: ['Lumi + Carlotta + Shorekeeper', 'Lumi + Glacio DPS + Verina'] },
  'Buling': { rarity: 4, element: 'Electro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Spiritchaser Taoist and fortune-teller. Electro healer with DMG Amp buffs.',
    skills: ['Twin Thunders', 'Trigram Combo', 'Lightning Burst', 'Blazing Aura'],
    ascension: { boss: 'Topological Confinement', common: 'Polygon Core', specialty: 'Nova' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 4pc'], bestWeapon: 'Stellar Symphony',
    teams: ['Buling + Carlotta + Zhezhi', 'Buling + DPS + Sub DPS'] },
}

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
  'Whispers of Sirens': { rarity: 5, type: 'Pistols', stat: 'Crit DMG',
    desc: 'Cantarella signature. Havoc pistols.',
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
    passive: 'ATK +12%, Res. Liberation DMG +44%, team DMG +24%', bestFor: ['Lupa'] },
  'Lethean Elegy': { rarity: 5, type: 'Rectifier', stat: 'ATK%',
    desc: 'Phrolova signature. Havoc support.',
    passive: 'Havoc DMG +12%, Team buff +20%', bestFor: ['Phrolova'] },
  'Thunderflare Dominion': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG',
    desc: 'Augusta signature. Electro broadblade.',
    passive: 'Electro DMG +12%, Heavy ATK +24%', bestFor: ['Augusta'] },
  "Moongazer's Sigil": { rarity: 5, type: 'Gauntlets', stat: 'Energy Regen',
    desc: 'Iuno signature. Aero support gauntlets.',
    passive: 'Aero DMG +12%, Time skills +24%', bestFor: ['Iuno'] },
  'Lux & Umbra': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate',
    desc: 'Galbrena signature. Spectro broadblade.',
    passive: 'Spectro DMG +12%, Liberation +24%', bestFor: ['Galbrena'] },
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
  'Everbright Polestar': { rarity: 5, type: 'Sword', stat: 'Crit DMG',
    desc: 'Aemeath signature. Fusion sword with DEF Ignore and Melt RES Ignore.',
    passive: 'DEF Ignore +32%, Melt RES Ignore +10%, Res. Liberation DMG boost', bestFor: ['Aemeath'] },
  "Daybreaker's Spine": { rarity: 5, type: 'Gauntlets', stat: 'Crit DMG',
    desc: 'Luuk Herssen signature. Spectro gauntlets with aerial combat enhancement.',
    passive: 'Spectro DMG +12%, Aerial Basic ATK +24%', bestFor: ['Luuk Herssen'] },
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
const HARD_PITY = 80, SOFT_PITY_START = 65, AVG_PITY = 62.5;

// Subscription and top-up prices (USD) - Updated January 2026
const SUBSCRIPTIONS = {
  lunite: { name: 'Lunite Subscription', price: 4.99, astrite: 3000, daily: 90, duration: 30, desc: '300 Lunite + 90 Astrite/day for 30 days' },
  weekly: { name: 'Weekly Subscription', price: 9.99, astrite: 1600, lunite: 680, duration: 15, desc: '680 Lunite + 1600 Astrite over 15 days (Day 1 + Day 3 + Day 7)' },
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

// Events are stored with UTC times based on Europe (UTC+1)
// For server-specific events (ending at XX:59, following reset times),
// adjust by timezone difference when viewing in another server
// Reference: Europe = UTC+1
const EUROPE_OFFSET = 1;

const getServerAdjustedEnd = (currentEnd, server) => {
  if (!currentEnd) return currentEnd;
  const serverOffset = getServerOffset(server);
  // Calculate offset difference from Europe reference
  const offsetDiff = serverOffset - EUROPE_OFFSET;
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
  const cycleMs = parseInt(match[1]) * 86400000;
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

const MAX_PITY = 80;
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
    dp[0][startPity][0] = 1.0;
  } else {
    dp[0][startPity][startGuar][0] = 1.0;
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
          const pFeatured = isWeapon || g === 1 ? 1.0 : 0.5;
          if (k + 1 <= maxCopies) {
            if (isWeapon) {
              dp[n+1][0][k+1] += prob * rate; // Weapon always featured
            } else {
              dp[n+1][0][0][k+1] += prob * rate * pFeatured; // Win: copies++, guar=0
            }
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
      const featured = isWeapon || guar === 1 || Math.random() < 0.5;
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
        const pFeatured = isWeapon || g === 1 ? 1 : 0.5;
        
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
    const dist = computeGachaDist(mid, isWeapon, startPity, startGuar, targetK);
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
      astrite: Math.ceil((eChar + eWeap) * 160),
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
      astrite: (nChar + nWeap) * 160,
      charPulls: nChar,
      weapPulls: nWeap,
      confidence: `~${targetProb}% each`
    };
  }
};

// Legacy compatibility wrapper (returns percentages like old simulateGacha)
const simulateGacha = (pulls, pity, guaranteed, type, target) => {
  const isWeapon = type === 'weapon';
  const startGuar = guaranteed ? 1 : 0;
  const dist = computeGachaDist(pulls, isWeapon, pity, startGuar, target);
  return dist.map(p => p * 100);
};

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
    allocPriority: 50, // 0-100: 0=all weapon, 50=balanced, 100=all char
  },
  planner: {
    dailyAstrite: 60, luniteActive: false,
    goalType: '5star', goalBanner: 'featuredChar', goalTarget: 1, goalPulls: 80, goalModifier: 1,
    goal4StarTarget: 1, goal4StarType: 'featured',
    addedIncome: [],
  },
  bookmarks: [],
  eventStatus: {},
  settings: { showOnboarding: true, autoSyncPity: false, theme: 'default' },
};

// Load saved state from persistent storage
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
    case 'ADD_INCOME': return { ...state, planner: { ...state.planner, addedIncome: [...state.planner.addedIncome, action.income] }, calc: { ...state.calc, astrite: String((+state.calc.astrite || 0) + action.income.astrite), radiant: String((+state.calc.radiant || 0) + (action.income.radiant || 0)), lustrous: String((+state.calc.lustrous || 0) + (action.income.lustrous || 0)) } };
    case 'REMOVE_INCOME': {
      const item = state.planner.addedIncome.find(i => i.id === action.id);
      return item ? { ...state, planner: { ...state.planner, addedIncome: state.planner.addedIncome.filter(i => i.id !== action.id) }, calc: { ...state.calc, astrite: String(Math.max(0, (+state.calc.astrite || 0) - item.astrite)), radiant: String(Math.max(0, (+state.calc.radiant || 0) - (item.radiant || 0))), lustrous: String(Math.max(0, (+state.calc.lustrous || 0) - (item.lustrous || 0))) } } : state;
    }
    case 'ADD_DAILY_INCOME': {
      const dailyTotal = (state.planner.dailyAstrite || 0) + (state.planner.luniteActive ? 90 : 0);
      const totalAstrite = dailyTotal * action.days;
      return { ...state, calc: { ...state.calc, astrite: String((+state.calc.astrite || 0) + totalAstrite) } };
    }
    // SYNC_PITY removed - calculator is fully independent from history
    case 'IMPORT_HISTORY': {
      const newProfile = { ...state.profile, importedAt: new Date().toISOString(), uid: action.uid || state.profile.uid };
      if (action.bannerType === 'featured') {
        newProfile.featured = { history: action.history, pity5: action.pity5, pity4: action.pity4, guaranteed: action.guaranteed || false };
      } else if (action.bannerType === 'weapon') {
        newProfile.weapon = { history: action.history, pity5: action.pity5, pity4: action.pity4 };
      } else if (action.bannerType === 'standardChar') {
        newProfile.standardChar = { history: action.history, pity5: action.pity5, pity4: action.pity4 };
      } else if (action.bannerType === 'standardWeap') {
        newProfile.standardWeap = { history: action.history, pity5: action.pity5, pity4: action.pity4 };
      } else if (action.bannerType === 'beginner') {
        newProfile.beginner = { history: action.history, pity5: action.pity5, pity4: action.pity4 };
      }
      return { ...state, profile: newProfile };
    }
    case 'SET_UID': return { ...state, profile: { ...state.profile, uid: action.uid } };
    case 'CLEAR_PROFILE': return { ...state, profile: initialState.profile };
    case 'SAVE_BOOKMARK': return { ...state, bookmarks: [...state.bookmarks, { id: Date.now(), name: action.name, timestamp: new Date().toISOString(), ...state.calc }] };
    case 'LOAD_BOOKMARK': {
      const b = state.bookmarks.find(bm => bm.id === action.id);
      return b ? { ...state, calc: { ...state.calc, charPity: b.charPity, charGuaranteed: b.charGuaranteed, weapPity: b.weapPity, astrite: b.astrite, radiant: b.radiant, forging: b.forging, lustrous: b.lustrous, charCopies: b.charCopies, weapCopies: b.weapCopies } } : state;
    }
    case 'DELETE_BOOKMARK': return { ...state, bookmarks: state.bookmarks.filter(b => b.id !== action.id) };
    case 'LOAD_STATE': return { ...action.state };
    case 'RESET': return initialState;
    default: return state;
  }
};

// [SECTION:CALCULATIONS]
const calcStats = (pulls, pity, guaranteed, isChar, copies) => {
  const effective = pulls + pity;
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
  
  // Worst case: hard pity every time, always losing 50/50
  const worstCase = HARD_PITY * copies * (isChar && !guaranteed ? 2 : 1);
  const successRate = pGe(copies);
  const missingPulls = Math.max(0, Math.ceil(expectedToTarget) - pulls);
  
  // 4-star calculations
  const fourStarCount = Math.floor(effective / HARD_PITY_4STAR);
  const featuredFourStarCount = Math.floor(fourStarCount * FEATURED_4STAR_RATE);
  const pity4 = effective % HARD_PITY_4STAR;
  
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
    missingAstrite: missingPulls * 160,
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
  Havoc: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50' },
  Spectro: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
};

const BANNER_GRADIENT_MAP = {
  Fusion: { border: 'border-orange-500/40', bg: 'bg-orange-500/20', text: 'text-orange-400' },
  Electro: { border: 'border-purple-500/40', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  Aero: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  Glacio: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  Havoc: { border: 'border-rose-500/40', bg: 'bg-rose-500/20', text: 'text-rose-400' },
  Spectro: { border: 'border-yellow-500/40', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
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
const CardBody = memo(({ children, className = '' }) => <div className={`kuro-body ${className}`}>{children}</div>);
CardBody.displayName = 'CardBody';

// Character Detail Modal
const CharacterDetailModal = ({ name, onClose, imageUrl }) => {
  const data = CHARACTER_DATA[name];
  if (!data) return null;
  
  const colors = DETAIL_ELEMENT_COLORS[data.element] || DETAIL_ELEMENT_COLORS.Spectro;
  
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
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
          
          {/* Best Weapon & Echoes */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Best Weapon</div>
              <div className="text-yellow-400 text-xs font-medium">{data.bestWeapon}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Best Echoes</div>
              <div className="text-cyan-400 text-xs font-medium">{data.bestEchoes[0]}</div>
              <div className="text-gray-400 text-[10px]">{data.bestEchoes[1]}</div>
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
          
          {/* Team Suggestions */}
          <div>
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <User size={14} className="text-pink-400" /> Team Suggestions
            </h3>
            <div className="space-y-1">
              {data.teams.map((team, i) => (
                <div key={i} className="text-[10px] text-gray-300 p-2 rounded-lg bg-white/5 border border-white/10">{team}</div>
              ))}
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
};
const WeaponDetailModal = ({ name, onClose, imageUrl }) => {
  const data = WEAPON_DATA[name];
  if (!data) return null;
  
  const colors = WEAPON_RARITY_COLORS[data.rarity] || WEAPON_RARITY_COLORS[4];
  
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
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
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10">{data.type}</span>
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
        <div className="kuro-calc space-y-3 -mx-3 px-3 py-3 tab-content">
          <div className="kuro-card">
            <div className="kuro-card-inner">
              <div className="kuro-body text-center py-8">
                <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
                <div className="text-white font-bold text-sm mb-1">Something went wrong</div>
                <p className="text-gray-400 text-xs mb-4">The {this.props.tabName || 'tab'} tab encountered an error.</p>
                <button 
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="kuro-btn active-cyan text-xs px-4 py-2"
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

const TabButton = memo(({ active, onClick, children, tabRef }) => {
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
      aria-selected={active}
      aria-label={`${text} tab`}
      className={`relative flex flex-col items-center gap-0.5 px-2.5 py-2 text-[10px] font-medium transition-all duration-300 whitespace-nowrap group ${active ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${active ? 'bg-yellow-500/10 shadow-lg shadow-yellow-500/25' : 'group-hover:bg-white/5'}`}>
        {icon}
      </div>
      <span className="relative z-10">{text}</span>
    </button>
  );
});
TabButton.displayName = 'TabButton';

const CountdownTimer = memo(({ endDate, color = 'yellow', compact = false, alwaysShow = false, onExpire, recalcFn }) => {
  const [currentEnd, setCurrentEnd] = useState(endDate);
  const [time, setTime] = useState(() => getTimeRemaining(endDate));
  const expiredRef = useRef(false);
  const rafRef = useRef(null);
  const lastUpdateRef = useRef(0);
  
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
        
        const t = getTimeRemaining(currentEnd);
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
        const t = getTimeRemaining(currentEnd);
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
      setTime(getTimeRemaining(currentEnd));
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
  }, [currentEnd, onExpire, recalcFn]);
  
  // For daily/weekly resets, never show "ENDED" - recalculate next reset
  if (time.expired && !alwaysShow) return <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Ended</span>;
  if (time.expired && alwaysShow) {
    // If expired but alwaysShow, show "0h 0m 0s" briefly until next tick updates
    return <span className={`font-mono text-xs ${color === 'yellow' ? 'text-yellow-400' : color === 'pink' ? 'text-pink-400' : color === 'cyan' ? 'text-cyan-400' : color === 'orange' ? 'text-orange-400' : 'text-purple-400'}`}>0h 0m 0s</span>;
  }
  
  const textColor = color === 'yellow' ? 'text-yellow-400' : color === 'pink' ? 'text-pink-400' : color === 'cyan' ? 'text-cyan-400' : color === 'orange' ? 'text-orange-400' : 'text-purple-400';
  
  // Unified compact style matching Tracker tab
  if (compact) {
    return (
      <span className={`${textColor} font-mono text-xs font-medium`}>
        {time.days > 0 && `${time.days}d `}{String(time.hours).padStart(2, '0')}h {String(time.minutes).padStart(2, '0')}m {String(time.seconds).padStart(2, '0')}s
      </span>
    );
  }
  
  return (
    <div className="flex items-center gap-1">
      {time.days > 0 && <><div className="rounded-lg px-2 py-1 text-center border border-white/10" style={{backgroundColor: 'rgba(12,16,24,0.7)', backdropFilter: 'blur(8px)'}}><div className="text-white font-bold text-sm kuro-number">{time.days}</div><div className="text-gray-400 text-[7px] uppercase tracking-wider">Day</div></div><span className={`${textColor} font-bold text-xs opacity-60`}>:</span></>}
      <div className="rounded-lg px-2 py-1 text-center border border-white/10" style={{backgroundColor: 'rgba(12,16,24,0.7)', backdropFilter: 'blur(8px)'}}><div className="text-white font-bold text-sm kuro-number">{String(time.hours).padStart(2,'0')}</div><div className="text-gray-400 text-[7px] uppercase tracking-wider">Hr</div></div>
      <span className={`${textColor} font-bold text-xs opacity-60`}>:</span>
      <div className="rounded-lg px-2 py-1 text-center border border-white/10" style={{backgroundColor: 'rgba(12,16,24,0.7)', backdropFilter: 'blur(8px)'}}><div className="text-white font-bold text-sm kuro-number">{String(time.minutes).padStart(2,'0')}</div><div className="text-gray-400 text-[7px] uppercase tracking-wider">Min</div></div>
      <span className={`${textColor} font-bold text-xs opacity-60`}>:</span>
      <div className="rounded-lg px-2 py-1 text-center border border-white/10" style={{backgroundColor: 'rgba(12,16,24,0.7)', backdropFilter: 'blur(8px)'}}><div className={`font-bold text-sm kuro-number ${textColor}`}>{String(time.seconds).padStart(2,'0')}</div><div className="text-gray-400 text-[7px] uppercase tracking-wider">Sec</div></div>
    </div>
  );
});
CountdownTimer.displayName = 'CountdownTimer';

const PityRing = memo(({ value = 0, max = 80, size = 52, strokeWidth = 4, color = '#fbbf24', glowColor = 'rgba(251,191,36,0.4)', label, sublabel }) => {
  const safeValue = Number(value) || 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(safeValue / max, 1);
  const offset = circumference * (1 - pct);
  const isSoftPity = max === 80 && safeValue >= 66;
  
  // Soft pity zone: pulls 65-80 shown as a subtle background arc
  const showSoftZone = max === 80;
  const softStart = 65 / 80;
  const softLen = 15 / 80;
  const softDash = softLen * circumference;
  const softGap = circumference - softDash;
  const softOffset = -softStart * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className={isSoftPity ? 'pulse-subtle' : ''}>
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
            strokeLinecap="round"
          />
        )}
        <circle className="pity-ring-fill" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size/2} ${size/2})`} style={{'--ring-glow': glowColor}} />
        <text className="pity-ring-text" x={size/2} y={size/2} fontSize={size * 0.28} fill={color}>{safeValue}</text>
      </svg>
      {label && <div className="text-gray-300 text-[8px] mt-0.5">{label}</div>}
      {sublabel && <div className="text-gray-500 text-[7px]">{sublabel}</div>}
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
const BackgroundGlow = ({ oledMode }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
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
  }, [oledMode]);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1}} />;
};

// LAYER B: Triangle wave mask — traveling wavefront specular, z-index 2
const TriangleMirrorWave = ({ oledMode }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
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
  }, [oledMode]);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 2}} />;
};

const BannerCard = memo(({ item, type, stats, bannerImage, visualSettings }) => {
  const isChar = type === 'character';
  const style = BANNER_GRADIENT_MAP[item.element] || BANNER_GRADIENT_MAP.Fusion;
  const imgUrl = item.imageUrl || bannerImage;
  
  // Use unified mask generator
  const maskGradient = visualSettings 
    ? generateMaskGradient(visualSettings.fadePosition, visualSettings.fadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.pictureOpacity / 100 : 0.9;
  
  return (
    <div className={`relative overflow-hidden rounded-xl border ${style.border}`} style={{ height: '190px', isolation: 'isolate', zIndex: 5 }}>
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
      
      <div className="relative z-10 p-3 flex flex-col justify-between h-full" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {item.isNew && <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold" style={{textShadow: 'none'}}>NEW</span>}
            <span className={`text-[10px] px-2 py-0.5 rounded ${style.bg} ${style.text} border ${style.border}`}>{isChar ? item.element : item.type}</span>
          </div>
          <h4 className="font-bold text-base text-white leading-tight">{item.name}</h4>
          {item.title && <p className="text-gray-200 text-[10px] mt-0.5 line-clamp-1">{item.title}</p>}
        </div>
        
        <div>
          <div className="text-gray-300 text-[8px] mb-0.5 uppercase tracking-wider">Featured 4★</div>
          <div className="flex gap-1 flex-wrap">
            {item.featured4Stars.map(n => <span key={n} className="text-[9px] text-cyan-300 bg-cyan-500/30 px-1.5 py-0.5 rounded backdrop-blur-sm">{n}</span>)}
          </div>
        </div>
        
        {stats && (
          <div className="pt-2.5 mt-1 border-t border-white/15" style={{background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)', margin: '0 -12px -12px', padding: '10px 12px 12px', borderRadius: '0 0 12px 12px'}}>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3">
                <div className="text-center">
                  <div className={`font-bold text-sm ${isChar ? 'text-yellow-400' : 'text-pink-400'}`}>{stats.pity5}<span className="text-gray-500 text-[9px]">/80</span></div>
                  <div className="text-gray-400 text-[8px] mt-0.5">5★ Pity</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-sm">{stats.pity4}<span className="text-gray-500 text-[9px]">/10</span></div>
                  <div className="text-gray-400 text-[8px] mt-0.5">4★ Pity</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm">{stats.totalPulls}</div>
                  <div className="text-gray-400 text-[8px] mt-0.5">Convenes</div>
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
    </div>
  );
});
BannerCard.displayName = 'BannerCard';

const EventCard = memo(({ event, server, bannerImage, visualSettings, status, onStatusChange }) => {
  const [resetTick, setResetTick] = useState(0);
  const isDaily = event.dailyReset;
  const isWeekly = event.weeklyReset;
  const isRecurring = !isDaily && !isWeekly && event.resetType && /\d+/.test(event.resetType);
  
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
          loading="eager"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      
      {isDone && <div className="absolute inset-0 z-[2] bg-emerald-900/20" />}
      
      <div className="relative z-10 p-3 flex flex-col justify-between h-full" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' }}>
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
        
        <div className="flex justify-between items-end mt-auto">
          <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${isDone ? 'bg-emerald-500/20 text-emerald-400' : isSkipped ? 'bg-gray-500/20 text-gray-500 line-through' : `${colors.bg} ${colors.text}`} backdrop-blur-sm`}>
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
                  <button onClick={() => onStatusChange('done')} className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 backdrop-blur-sm transition-colors">
                    <Check size={10} className="inline -mt-0.5" /> Done
                  </button>
                  <button onClick={() => onStatusChange('skipped')} className="px-2 py-0.5 rounded text-[9px] bg-white/10 text-gray-400 hover:bg-white/20 backdrop-blur-sm transition-colors">
                    Skip
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

const ProbabilityBar = ({ label, value, color = 'cyan' }) => (
  <div className="flex items-center gap-2">
    <span className="text-gray-400 text-[10px] w-12">{label}</span>
    <div className="flex-1 h-5 bg-neutral-800 rounded overflow-hidden">
      <div className={`h-full ${color === 'cyan' ? 'bg-cyan-500' : color === 'pink' ? 'bg-pink-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-yellow-500'} transition-all flex items-center justify-end pr-1`} style={{ width: `${Math.max(value, 1)}%` }}>
        {value > 10 && <span className="text-[9px] text-black font-bold">{value}%</span>}
      </div>
    </div>
    {value <= 10 && <span className="text-[10px] text-gray-400 w-10">{value}%</span>}
  </div>
);

// Admin banner storage key
const ADMIN_BANNER_KEY = 'whispering-wishes-admin-banners';

// [SECTION:COLLECTION-GRID]
// Shared component for all collection grids (5★/4★/3★ chars & weapons)
const CollectionGridCard = memo(({ name, count, imgUrl, framing, isSelected, owned, collMask, collOpacity, glowClass, ownedBg, ownedBorder, countLabel, countColor, onClickCard, framingMode, setEditingImage, imageKey, isNew }) => (
  <div 
    key={name} 
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
      <div className="absolute top-1.5 left-1.5 z-20 px-1.5 py-0.5 rounded text-[7px] font-bold tracking-wider uppercase" style={{background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#000', boxShadow: '0 0 8px rgba(251,191,36,0.5)', textShadow: 'none'}}>New</div>
    )}
    {imgUrl && (
      <img 
        src={imgUrl} 
        alt={name}
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
  prev.framing?.zoom === next.framing?.zoom && prev.framing?.x === next.framing?.x && prev.framing?.y === next.framing?.y
);
CollectionGridCard.displayName = 'CollectionGridCard';

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
  'Everbright Polestar': 'https://i.ibb.co/tTDkFQ7W/Starfield-Calibrator.webp',
  "Daybreaker's Spine": 'https://i.ibb.co/tTDkFQ7W/Starfield-Calibrator.webp',
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
  'Luuk Herssen', 'Aemeath',
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
const ALL_5STAR_RESONATORS = [
  'Jiyan', 'Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina', 'Yinlin',
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

// [SECTION:MAINAPP]
function WhisperingWishesInner() {
  // Check app lockout first
  const [isLockedOut, setIsLockedOut] = useState(() => {
    try {
      const lockoutUntil = localStorage.getItem('ww-app-lockout');
      if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
        return parseInt(lockoutUntil);
      }
      // Clear expired lockout
      if (lockoutUntil) localStorage.removeItem('ww-app-lockout');
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
  const stateRef = useRef(state);
  
  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminTapCount, setAdminTapCount] = useState(0);
  const adminTapTimerRef = useRef(null);
  const [activeBanners, setActiveBanners] = useState(() => getActiveBanners());
  // Banner ends at server-specific time (e.g., 11:59 local for each server)
  const bannerEndDate = useMemo(() => getServerAdjustedEnd(activeBanners.endDate, state.server), [activeBanners.endDate, state.server]);
  const [adminTab, setAdminTab] = useState('banners'); // 'banners', 'collection', or 'visuals'
  const [adminMiniMode, setAdminMiniMode] = useState(false);
  
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
    swipeNavigation: false
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
      const size = 180;
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const ctx = c.getContext('2d');
      const cx = size/2, cy = size/2 - 2;
      
      // === Base gradient ===
      const bg = ctx.createLinearGradient(0, 0, size, size);
      bg.addColorStop(0, '#0c0820');
      bg.addColorStop(1, '#12102a');
      ctx.fillStyle = bg;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(0, 0, size, size, 26); else ctx.rect(0, 0, size, size);
      ctx.fill();
      
      // === Purple light top-left ===
      const pl = ctx.createRadialGradient(size*0.2, size*0.12, 0, size*0.2, size*0.12, size*0.7);
      pl.addColorStop(0, 'rgba(140,120,220,0.12)');
      pl.addColorStop(1, 'rgba(140,120,220,0)');
      ctx.fillStyle = pl;
      ctx.fillRect(0, 0, size, size);
      
      // === Warm light bottom-right ===
      const wl = ctx.createRadialGradient(size*0.82, size*0.85, 0, size*0.82, size*0.85, size*0.4);
      wl.addColorStop(0, 'rgba(251,150,50,0.08)');
      wl.addColorStop(1, 'rgba(251,150,50,0)');
      ctx.fillStyle = wl;
      ctx.fillRect(0, 0, size, size);
      
      // === Central golden aura ===
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
      aura.addColorStop(0, 'rgba(251,191,36,0.18)');
      aura.addColorStop(0.5, 'rgba(251,191,36,0.06)');
      aura.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI*2); ctx.fill();
      
      // === Energy rings (fading segments) ===
      [48, 40, 32].forEach((rr, ri) => {
        ctx.strokeStyle = `rgba(251,200,80,${0.15 - ri*0.04})`;
        ctx.lineWidth = 0.6;
        for (let a = 0; a < 360; a += 1) {
          const angle = a * Math.PI / 180;
          const fade = (Math.sin(angle * 3 + ri * 1.5) + 1) / 2;
          const wobble = Math.sin(angle * 5 + ri) * 1;
          ctx.globalAlpha = 0.2 + 0.6 * fade;
          ctx.beginPath();
          ctx.arc(cx + (rr + wobble) * Math.cos(angle), cy + (rr + wobble) * Math.sin(angle), 0.5, 0, Math.PI*2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      
      // === Energy rays ===
      for (let i = 0; i < 32; i++) {
        const angle = (i * 11.25 + (Math.random()-0.5)*4) * Math.PI / 180;
        const len = 25 + Math.random() * 30;
        for (let d = 16; d < 16 + len; d++) {
          const t = (d - 16) / len;
          ctx.globalAlpha = 0.08 * Math.sin(t * Math.PI) * (1 - t * 0.5);
          ctx.fillStyle = '#fbd264';
          ctx.beginPath();
          ctx.arc(cx + d * Math.cos(angle), cy + d * Math.sin(angle), 0.5, 0, Math.PI*2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      
      // === 4-pointed star ===
      const drawStar4 = (scx, scy, outer, inner, rot, fill) => {
        ctx.fillStyle = fill;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (rot + i * 45) * Math.PI / 180;
          const rr = i % 2 === 0 ? outer : inner;
          const method = i === 0 ? 'moveTo' : 'lineTo';
          ctx[method](scx + rr * Math.cos(angle), scy + rr * Math.sin(angle));
        }
        ctx.closePath(); ctx.fill();
      };
      
      // Star glow
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
      sg.addColorStop(0, 'rgba(251,191,36,0.25)');
      sg.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(cx, cy, 35, 0, Math.PI*2); ctx.fill();
      
      // Main star layers
      drawStar4(cx, cy, 28, 9.5, -45, 'rgba(220,170,40,0.9)');
      drawStar4(cx, cy-0.5, 23, 8, -45, 'rgba(251,210,90,0.75)');
      drawStar4(cx, cy-0.5, 17, 7, -45, 'rgba(255,235,150,0.55)');
      
      // Blazing core
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 9);
      core.addColorStop(0, 'rgba(255,250,220,1)');
      core.addColorStop(0.5, 'rgba(255,235,170,0.7)');
      core.addColorStop(1, 'rgba(251,200,80,0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI*2); ctx.fill();
      
      // Tip diamonds
      [-45, 45, 135, 225].forEach(deg => {
        const a = deg * Math.PI / 180;
        const tx = cx + 28 * Math.cos(a), ty = cy + 28 * Math.sin(a);
        drawStar4(tx, ty, 2.8, 1, 0, 'rgba(255,235,160,0.7)');
      });
      
      // === Particles ===
      for (let i = 0; i < 30; i++) {
        const px = 10 + Math.random() * (size - 20);
        const py = 10 + Math.random() * (size - 20);
        const pr = 0.3 + Math.random() * 1.2;
        ctx.globalAlpha = 0.15 + Math.random() * 0.4;
        ctx.fillStyle = Math.random() > 0.3 ? '#fbd878' : '#b4a0e0';
        ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      
      // === Text ===
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      
      // "WHISPERING" - spaced, ethereal
      ctx.font = '500 4.5px system-ui, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillStyle = 'rgba(180,165,200,0.55)';
      ctx.fillText('W H I S P E R I N G', cx, cy - 40);
      
      // "WISHES" - bold gold with shadow+glow
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.shadowColor = 'rgba(251,191,36,0.4)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillText('W I S H E S', cx + 0.7, cy + 40.7);
      ctx.fillStyle = '#fbd278';
      ctx.fillText('W I S H E S', cx, cy + 40);
      ctx.shadowBlur = 0;
      
      // Flanking lines
      for (let side of [-1, 1]) {
        const sx = cx + side * 38;
        for (let t = 0; t < 1; t += 0.03) {
          ctx.globalAlpha = 0.35 * (1 - t) ** 1.5;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(sx + side * t * 20, cy + 40, 0.4, 0, Math.PI*2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      
      // === Vignette corners ===
      const corners = [[0,0],[size,0],[0,size],[size,size]];
      corners.forEach(([vx, vy]) => {
        const vg = ctx.createRadialGradient(vx, vy, 0, vx, vy, size*0.5);
        vg.addColorStop(0, 'rgba(4,2,10,0.2)');
        vg.addColorStop(1, 'rgba(4,2,10,0)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, size, size);
      });
      
      // === Rim light top edge ===
      const rl = ctx.createLinearGradient(0, 0, 0, 4);
      rl.addColorStop(0, 'rgba(200,190,255,0.15)');
      rl.addColorStop(1, 'rgba(200,190,255,0)');
      ctx.fillStyle = rl;
      ctx.fillRect(26, 0, size - 52, 4);
      
      const dataUrl = c.toDataURL('image/png');
      
      // Set favicon
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) { favicon = document.createElement('link'); favicon.rel = 'icon'; document.head.appendChild(favicon); }
      favicon.href = dataUrl;
      
      // Set apple-touch-icon
      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (!appleIcon) { appleIcon = document.createElement('link'); appleIcon.rel = 'apple-touch-icon'; document.head.appendChild(appleIcon); }
      appleIcon.href = dataUrl;
      
      // Set shortcut icon
      let shortcut = document.querySelector('link[rel="shortcut icon"]');
      if (!shortcut) { shortcut = document.createElement('link'); shortcut.rel = 'shortcut icon'; document.head.appendChild(shortcut); }
      shortcut.href = dataUrl;
      
      // Set page title
      document.title = 'Whispering Wishes';
      
      // Dynamic web manifest for Android home screen
      const manifest = {
        name: 'Whispering Wishes',
        short_name: 'WW Wishes',
        icons: [{ src: dataUrl, sizes: '180x180', type: 'image/png' }],
        start_url: window.location.href,
        display: 'standalone',
        background_color: '#0a0a1a',
        theme_color: '#0c0820'
      };
      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(manifestBlob);
      let manifestLink = document.querySelector('link[rel="manifest"]');
      if (!manifestLink) { manifestLink = document.createElement('link'); manifestLink.rel = 'manifest'; document.head.appendChild(manifestLink); }
      manifestLink.href = manifestUrl;
      
      // Theme color
      let themeColor = document.querySelector('meta[name="theme-color"]');
      if (!themeColor) { themeColor = document.createElement('meta'); themeColor.name = 'theme-color'; document.head.appendChild(themeColor); }
      themeColor.content = '#0c0820';
    } catch (e) { console.warn('Icon generation failed:', e); }
  }, []);
  
  const saveVisualSettings = (newSettings) => {
    setVisualSettings(newSettings);
    if (!storageAvailable) return;
    try { localStorage.setItem(VISUAL_SETTINGS_KEY, JSON.stringify(newSettings)); } catch {}
  };
  
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
  const hasActiveFilters = collectionSearch || collectionElementFilter !== 'all' || collectionWeaponFilter !== 'all' || collectionOwnershipFilter !== 'all';
  
  // Cache-busting for images (version-based, only refreshes on manual refresh)
  const [imageCacheBuster, setImageCacheBuster] = useState('296');
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
  
  const saveCollectionImages = (newImages) => {
    setCustomCollectionImages(newImages);
    if (!storageAvailable) return;
    try { localStorage.setItem(COLLECTION_IMAGES_KEY, JSON.stringify(newImages)); } catch {}
  };
  
  // Admin password - stored in localStorage (user sets their own)
  const ADMIN_PASS_KEY = 'whispering-wishes-admin-pass';
  const [storedAdminPass, setStoredAdminPass] = useState(() => {
    if (!storageAvailable) return '';
    try { return localStorage.getItem(ADMIN_PASS_KEY) || ''; } catch { return ''; }
  });
  
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
  const TAB_ORDER = ['tracker', 'events', 'calculator', 'planner', 'analytics', 'gathering', 'profile'];
  const swipeRef = useRef({ startX: 0, startY: 0, startTime: 0 });
  
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
        const currentIndex = TAB_ORDER.indexOf(activeTab);
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
  }, [visualSettings.swipeNavigation, activeTab, setActiveTab]);
  
  const [trackerCategory, setTrackerCategory] = useState('character');
  const [importPlatform, setImportPlatform] = useState(null);
  const [importMethod, setImportMethod] = useState('file'); // 'file' or 'paste'
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
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [userLeaderboardId] = useState(() => {
    if (!storageAvailable) return null;
    try {
      let id = localStorage.getItem('ww-leaderboard-id');
      if (!id) {
        id = 'WW' + Math.random().toString(36).substring(2, 8).toUpperCase();
        localStorage.setItem('ww-leaderboard-id', id);
      }
      return id;
    } catch { return 'WW' + Math.random().toString(36).substring(2, 8).toUpperCase(); }
  });

  const setCalc = useCallback((f, v) => dispatch({ type: 'SET_CALC', field: f, value: v }), []);

  // Smart astrite allocation for "Both" mode
  const astriteAllocation = useMemo(() => {
    const totalAstrite = +state.calc.astrite || 0;
    const totalPulls = Math.floor(totalAstrite / 160);
    const radiant = +state.calc.radiant || 0;
    const forging = +state.calc.forging || 0;
    const lustrous = +state.calc.lustrous || 0;
    
    if (state.calc.selectedBanner !== 'both') {
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
    const priority = typeof state.calc.allocPriority === 'number' ? state.calc.allocPriority : 50;
    const charPercent = priority;
    const weapPercent = 100 - priority;
    
    const charAstritePulls = Math.floor(totalPulls * (charPercent / 100));
    const weapAstritePulls = totalPulls - charAstritePulls;
    
    // For standard banners, split lustrous based on priority too
    const stdCharLustrous = Math.floor(lustrous * (charPercent / 100));
    const stdWeapLustrous = lustrous - stdCharLustrous;
    
    return {
      charAstritePulls,
      weapAstritePulls,
      charTotal: charAstritePulls + radiant,
      weapTotal: weapAstritePulls + forging,
      stdCharTotal: charAstritePulls + stdCharLustrous,
      stdWeapTotal: weapAstritePulls + stdWeapLustrous,
      charPercent,
      weapPercent,
      stdCharLustrous,
      stdWeapLustrous,
    };
  }, [state.calc.astrite, state.calc.radiant, state.calc.forging, state.calc.lustrous, state.calc.selectedBanner, state.calc.allocPriority]);

  // Calculate pulls for each banner type using allocation
  const charPulls = useMemo(() => astriteAllocation.charTotal, [astriteAllocation]);
  const weapPulls = useMemo(() => astriteAllocation.weapTotal, [astriteAllocation]);
  const stdCharPulls = useMemo(() => astriteAllocation.stdCharTotal, [astriteAllocation]);
  const stdWeapPulls = useMemo(() => astriteAllocation.stdWeapTotal, [astriteAllocation]);
  
  // Calculate stats for each banner type
  const charStats = useMemo(() => calcStats(charPulls, state.calc.charPity, state.calc.charGuaranteed, true, state.calc.charCopies), [charPulls, state.calc.charPity, state.calc.charGuaranteed, state.calc.charCopies]);
  const weapStats = useMemo(() => calcStats(weapPulls, state.calc.weapPity, false, false, state.calc.weapCopies), [weapPulls, state.calc.weapPity, state.calc.weapCopies]);
  const stdCharStats = useMemo(() => calcStats(stdCharPulls, state.calc.stdCharPity, false, false, state.calc.stdCharCopies), [stdCharPulls, state.calc.stdCharPity, state.calc.stdCharCopies]);
  const stdWeapStats = useMemo(() => calcStats(stdWeapPulls, state.calc.stdWeapPity, false, false, state.calc.stdWeapCopies), [stdWeapPulls, state.calc.stdWeapPity, state.calc.stdWeapCopies]);

  // Combined stats for "Both" mode
  const combined = useMemo(() => {
    if (state.calc.selectedBanner !== 'both') return null;
    
    let charProb, weapProb;
    if (state.calc.bannerCategory === 'featured') {
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
  }, [state.calc.selectedBanner, state.calc.bannerCategory, charStats, weapStats, stdCharStats, stdWeapStats]);

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
      totalAstrite: all.length * 160, 
      fiveStars: fives.length, 
      won5050: won, 
      lost5050: lost, 
      winRate: (won + lost) > 0 ? ((won / (won + lost)) * 100).toFixed(1) : null, 
      avgPity 
    };
  }, [state.profile]);
  
  // Leaderboard functions
  const loadLeaderboard = useCallback(async () => {
    if (!window.storage) return;
    setLeaderboardLoading(true);
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
    } catch (e) { console.error('Leaderboard load error:', e); }
    setLeaderboardLoading(false);
  }, []);
  
  const submitToLeaderboard = useCallback(async () => {
    if (!window.storage || !userLeaderboardId || !overallStats?.avgPity) return;
    try {
      const entry = {
        id: userLeaderboardId,
        avgPity: parseFloat(overallStats.avgPity),
        pulls: overallStats.total5Stars || 0,
        timestamp: Date.now()
      };
      await window.storage.set(`luck:${userLeaderboardId}`, JSON.stringify(entry), true);
      toast?.addToast?.('Score submitted to leaderboard!', 'success');
      loadLeaderboard();
    } catch (e) { 
      console.error('Submit error:', e);
      toast?.addToast?.('Failed to submit score', 'error');
    }
  }, [userLeaderboardId, overallStats, toast, loadLeaderboard]);
  
  useEffect(() => {
    if (showLeaderboard) loadLeaderboard();
  }, [showLeaderboard, loadLeaderboard]);

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
    const hitHardPity = all5Stars.some(p => p.pity >= 80);
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
    charHistory.filter(p => p.rarity === 5 && p.name).forEach(p => { charCounts[p.name] = (charCounts[p.name] || 0) + 1; });
    
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
    const all5StarNames = Object.keys(s6Trophies);
    const s6Count = all5StarNames.filter(n => (charCounts[n] || 0) >= 7).length;
    if (s6Count >= all5StarNames.length) {
      list.push({ id: 's6_all', name: 'Gathering Wives: Complete', desc: 'Every 5★ at S6 — Rover\'s harem is full. seek help.', icon: 'Crown', color: '#ff0000', tier: 'legendary' });
    } else if (s6Count >= 20) {
      list.push({ id: 's6_harem20', name: 'Harem Protagonist EX', desc: `${s6Count}/${all5StarNames.length} at S6 — your wallet is in critical condition`, icon: 'Crown', color: '#ff4500', tier: 'legendary' });
    } else if (s6Count >= 10) {
      list.push({ id: 's6_harem10', name: 'Gathering Wives', desc: `${s6Count}/${all5StarNames.length} at S6 — Rover didn't stutter`, icon: 'Crown', color: '#ff6347', tier: 'legendary' });
    } else if (s6Count >= 5) {
      list.push({ id: 's6_harem5', name: 'Starting a Collection', desc: `${s6Count} at S6 — the harem arc is canon`, icon: 'Crown', color: '#ff8c00', tier: 'epic' });
    }
    
    // Weapon R5 — any 5★ weapon pulled 5+ times
    const weapCounts = {};
    weapHistory.filter(p => p.rarity === 5 && p.name).forEach(p => { weapCounts[p.name] = (weapCounts[p.name] || 0) + 1; });
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
    const stdChars = ['Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina'];
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
    return (state.planner.dailyAstrite || 0) + (state.planner.luniteActive ? 90 : 0);
  }, [state.planner.dailyAstrite, state.planner.luniteActive]);

  // Plan tab pre-computed values
  const planData = useMemo(() => {
    const currentAstrite = +state.calc.astrite || 0;
    const bannerEnd = new Date(bannerEndDate);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((bannerEnd - now) / 86400000));
    const incomeByEnd = dailyIncome * daysLeft;
    const totalAstriteByEnd = currentAstrite + incomeByEnd;
    const convenesByEnd = Math.floor(totalAstriteByEnd / 160) + (
      state.calc.bannerCategory === 'featured'
        ? (state.calc.selectedBanner === 'weap' ? (+state.calc.forging || 0) : (+state.calc.radiant || 0))
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
    const targetAstrite = targetPulls * 160;
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
      const validPulls = pulls.filter(p => {
        if (typeof p !== 'object' || p === null) return false;
        const hasType = p.bannerType || p.cardPoolType || p.gachaType;
        const hasName = p.name || p.resourceName;
        return hasType && hasName;
      });
      
      if (validPulls.length === 0) {
        throw new Error('No valid pull entries found — check data format');
      }
      
      // List of known standard 5★ characters (for 50/50 calculation)
      const standard5Stars = ['Verina', 'Jianxin', 'Lingyang', 'Calcharo', 'Encore'];
      
      const convert = (arr, type) => {
        const filtered = arr.filter(p => {
          const poolType = p.cardPoolType || p.gachaType;
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
          const rarity = p.rarity || p.qualityLevel || 4;
          const name = p.name || p.resourceName || '';
          
          let won5050 = undefined;
          let pity = pityCounter;
          
          if (rarity === 5) {
            if (type === 'featured') {
              const isStandard = standard5Stars.some(s => name.toLowerCase().includes(s.toLowerCase()));
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
            id: p.id || Date.now() + i, 
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
            if (history[i].rarity === 4) break;
            currentPity4++;
          }
          const fiveStars = history.filter(p => p.rarity === 5);
          const lastFive = fiveStars[fiveStars.length - 1];
          const guaranteed = type === 'featured' && lastFive?.won5050 === false;
          dispatch({ type: 'IMPORT_HISTORY', bannerType: type, history, pity5: currentPity5, pity4: currentPity4, guaranteed, uid: data.uid || data.playerId });
          totalImported += history.length;
        }
      });
      
      const fc = pulls.filter(p => (p.cardPoolType || p.gachaType) === 1).length;
      const wc = pulls.filter(p => (p.cardPoolType || p.gachaType) === 2).length;
      const sc = pulls.filter(p => (p.cardPoolType || p.gachaType) === 5).length;
      const sw = pulls.filter(p => (p.cardPoolType || p.gachaType) === 6).length;
      const bc = pulls.filter(p => (p.cardPoolType || p.gachaType) === 7).length;
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
  }, [toast]);

  const handleFileImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      processImportData(ev.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [processImportData]);

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
    const newCount = adminTapCount + 1;
    setAdminTapCount(newCount);
    if (newCount >= 5) {
      // Check failed attempts
      let failedAttempts = 0;
      try {
        failedAttempts = parseInt(localStorage.getItem('ww-admin-fails') || '0');
      } catch {}
      
      if (failedAttempts >= 3) {
        setAdminTapCount(0);
        return; // Already locked out
      }
      
      const password = prompt(`Enter admin password (${3 - failedAttempts} attempts remaining):`);
      if (password === null || password === '') {
        // User cancelled or empty - no penalty
        setAdminTapCount(0);
        return;
      }
      // Hashed comparison — never store plaintext passwords in source
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
      const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (hashHex === 'd0a9f110419bf9487d97f9f99822f6f15c8cd98fed3097a0a0714674aa27feda') {
        setShowAdminPanel(true);
        setAdminUnlocked(true); // Auto-unlock since password was verified
        try { localStorage.setItem('ww-admin-fails', '0'); } catch {}
      } else {
        // Wrong password - increment fails
        try {
          const newFails = failedAttempts + 1;
          localStorage.setItem('ww-admin-fails', newFails.toString());
          if (newFails >= 3) {
            // Lock out entire app for 24h
            const lockoutTime = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem('ww-app-lockout', lockoutTime.toString());
            window.location.reload();
          }
        } catch {}
      }
      setAdminTapCount(0);
    } else {
      adminTapTimerRef.current = setTimeout(() => setAdminTapCount(0), 1500);
    }
  }, [adminTapCount]);

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

  // Verify admin password
  const verifyAdminPassword = useCallback(async () => {
    if (!adminPassword || adminPassword.length < 4) {
      toast?.addToast?.('Password must be at least 4 characters', 'error');
      return;
    }
    const hashedInput = await hashPassword(adminPassword);
    if (!storedAdminPass) {
      if (storageAvailable) {
        try { localStorage.setItem(ADMIN_PASS_KEY, hashedInput); } catch {}
      }
      setStoredAdminPass(hashedInput);
      setAdminUnlocked(true);
      toast?.addToast?.('Admin password set!', 'success');
    } else if (hashedInput === storedAdminPass) {
      setAdminUnlocked(true);
    } else {
      toast?.addToast?.('Incorrect password', 'error');
    }
  }, [adminPassword, storedAdminPass, toast, hashPassword]);

  // Show lockout screen if locked out
  if (isLockedOut) {
    const remaining = Math.max(0, isLockedOut - Date.now());
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-red-400 mb-2">Access Temporarily Restricted</h1>
          <p className="text-gray-400 text-sm mb-4">Too many failed attempts.</p>
          <p className="text-gray-500 text-xs">Try again in {hours}h {minutes}m</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${visualSettings.oledMode ? 'oled-mode' : ''}`} style={{ background: visualSettings.oledMode ? '#000' : undefined }}>
      <BackgroundGlow oledMode={visualSettings.oledMode} />
      <TriangleMirrorWave oledMode={visualSettings.oledMode} />
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
                <div className="relative w-9 h-9 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Sparkles size={16} className="text-black" />
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-sm tracking-wide">Whispering Wishes</h1>
                <p className="text-gray-400 text-[9px] tracking-wider uppercase">Wuthering Waves Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <select value={state.server} onChange={e => dispatch({ type: 'SET_SERVER', server: e.target.value })} aria-label="Select server region" className="text-gray-300 text-[10px] px-2 py-2 rounded-lg border border-white/10 focus:border-yellow-500/50 focus:outline-none transition-all" style={{backgroundColor: 'rgba(15, 20, 28, 0.9)'}}>
                {Object.keys(SERVERS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleExport} aria-label="Export backup" className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-yellow-400 hover:border-yellow-500/30 hover:bg-yellow-500/10 active:scale-95 transition-all" style={{backgroundColor: 'rgba(15, 20, 28, 0.9)'}}>
                <Download size={14} />
              </button>
            </div>
          </div>
          <nav ref={tabNavRef} className="relative flex justify-between -mb-px overflow-x-auto scrollbar-hide pb-1">
            <div className="tab-indicator" />
            <TabButton active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')} tabRef={tabNavRef}><Sparkles size={16} /> Tracker</TabButton>
            <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} tabRef={tabNavRef}><Calendar size={16} /> Events</TabButton>
            <TabButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} tabRef={tabNavRef}><Calculator size={16} /> Calc</TabButton>
            <TabButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} tabRef={tabNavRef}><TrendingUp size={16} /> Plan</TabButton>
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} tabRef={tabNavRef}><BarChart3 size={16} /> Stats</TabButton>
            <TabButton active={activeTab === 'gathering'} onClick={() => setActiveTab('gathering')} tabRef={tabNavRef}><Archive size={16} /> Collection</TabButton>
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} tabRef={tabNavRef}><User size={16} /> Profile</TabButton>
          </nav>
        </div>
      </header>

      <main className="max-w-lg md:max-w-2xl mx-auto px-3 pt-3 pb-4 space-y-3 w-full">
        
        {/* [SECTION:TAB-TRACKER] */}
        {activeTab === 'tracker' && (
          <TabErrorBoundary tabName="Tracker">
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3 tab-content">
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

            <div className="flex items-center justify-between text-gray-300 text-[10px] content-layer">
              <span>v{activeBanners.version} Phase {activeBanners.phase} • {state.server}</span>
              <CountdownTimer endDate={bannerEndDate} color={trackerCategory === 'weapon' ? 'pink' : 'yellow'} />
            </div>
            
            {new Date() > new Date(bannerEndDate) && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center content-layer">
                <p className="text-yellow-400 text-xs font-medium">Banner period ended</p>
                <p className="text-gray-400 text-[10px] mt-1">New banners are now live in-game. App update coming soon!</p>
              </div>
            )}

            {trackerCategory === 'character' && (
              <div className="space-y-2 content-layer">
                {activeBanners.characters.map(c => <BannerCard key={c.id} item={c} type="character" bannerImage={activeBanners.characterBannerImage} stats={state.profile.featured.history.length ? { pity5: state.profile.featured.pity5, pity4: state.profile.featured.pity4, totalPulls: state.profile.featured.history.length, guaranteed: state.profile.featured.guaranteed } : null} visualSettings={visualSettings} />)}
              </div>
            )}

            {trackerCategory === 'weapon' && (
              <div className="space-y-2 content-layer">
                {activeBanners.weapons.map(w => <BannerCard key={w.id} item={w} type="weapon" bannerImage={activeBanners.weaponBannerImage} stats={state.profile.weapon.history.length ? { pity5: state.profile.weapon.pity5, pity4: state.profile.weapon.pity4, totalPulls: state.profile.weapon.history.length } : null} visualSettings={visualSettings} />)}
              </div>
            )}

            {trackerCategory === 'standard' && (
              <div className="space-y-3 content-layer">
                <div className="text-gray-300 text-xs uppercase tracking-wider content-layer">Permanent Banners</div>
                
                {/* Standard Resonator Banner */}
                {(() => {
                  const stdMask = generateMaskGradient(visualSettings.standardFadePosition || 50, visualSettings.standardFadeIntensity || 100);
                  const stdOpacity = (visualSettings.standardOpacity || 100) / 100;
                  return (
                    <div className="relative overflow-hidden rounded-xl border border-cyan-500/30" style={{ height: '190px', isolation: 'isolate', zIndex: 5 }}>
                      {activeBanners.standardCharBannerImage && (
                        <img 
                          src={activeBanners.standardCharBannerImage}
                          alt="Tidal Chorus"
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ 
                            zIndex: 1,
                            opacity: stdOpacity,
                            maskImage: stdMask,
                            WebkitMaskImage: stdMask
                          }}
                          loading="eager"
                
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="relative z-10 p-3 flex flex-col justify-between h-full" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' }}>
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-sm text-cyan-400">Tidal Chorus</h3>
                            <span className="text-gray-200 text-[10px]">Standard Resonator</span>
                          </div>
                          <div className="text-gray-300 text-[8px] mb-1 uppercase tracking-wider">Available 5★</div>
                          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
                            {activeBanners.standardCharacters.map(n => <span key={n} className="text-[9px] text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">{n}</span>)}
                          </div>
                        </div>
                        {state.profile.standardChar?.history?.length > 0 && (
                          <div className="pt-2.5 mt-1 border-t border-white/15" style={{background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)', margin: '0 -12px -12px', padding: '10px 12px 12px', borderRadius: '0 0 12px 12px'}}>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 flex items-center gap-3">
                                <div className="text-center">
                                  <div className="text-cyan-400 font-bold text-sm">{state.profile.standardChar.pity5}<span className="text-gray-500 text-[9px]">/80</span></div>
                                  <div className="text-gray-400 text-[8px] mt-0.5">5★ Pity</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-purple-400 font-bold text-sm">{state.profile.standardChar.pity4}<span className="text-gray-500 text-[9px]">/10</span></div>
                                  <div className="text-gray-400 text-[8px] mt-0.5">4★ Pity</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-white font-bold text-sm">{state.profile.standardChar.history.length}</div>
                                  <div className="text-gray-400 text-[8px] mt-0.5">Convenes</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Standard Weapon Banner */}
                {(() => {
                  const stdMask = generateMaskGradient(visualSettings.standardFadePosition || 50, visualSettings.standardFadeIntensity || 100);
                  const stdOpacity = (visualSettings.standardOpacity || 100) / 100;
                  return (
                    <div className="relative overflow-hidden rounded-xl border border-cyan-500/30" style={{ height: '190px', isolation: 'isolate', zIndex: 5 }}>
                      {activeBanners.standardWeapBannerImage && (
                        <img 
                          src={activeBanners.standardWeapBannerImage}
                          alt="Winter Brume"
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ 
                            zIndex: 1,
                            opacity: stdOpacity,
                            maskImage: stdMask,
                            WebkitMaskImage: stdMask
                          }}
                          loading="eager"
                
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="relative z-10 p-3 flex flex-col justify-between h-full" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' }}>
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-sm text-cyan-400">Winter Brume</h3>
                            <span className="text-gray-200 text-[10px]">Standard Weapon</span>
                          </div>
                          <div className="text-gray-300 text-[8px] mb-1 uppercase tracking-wider">Available 5★</div>
                          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
                            {activeBanners.standardWeapons.map(w => <span key={w.name} className="text-[9px] text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">{w.name}</span>)}
                          </div>
                        </div>
                        {state.profile.standardWeap?.history?.length > 0 && (
                          <div className="pt-2.5 mt-1 border-t border-white/15" style={{background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)', margin: '0 -12px -12px', padding: '10px 12px 12px', borderRadius: '0 0 12px 12px'}}>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 flex items-center gap-3">
                                <div className="text-center">
                                  <div className="text-cyan-400 font-bold text-sm">{state.profile.standardWeap.pity5}<span className="text-gray-500 text-[9px]">/80</span></div>
                                  <div className="text-gray-400 text-[8px] mt-0.5">5★ Pity</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-purple-400 font-bold text-sm">{state.profile.standardWeap.pity4}<span className="text-gray-500 text-[9px]">/10</span></div>
                                  <div className="text-gray-400 text-[8px] mt-0.5">4★ Pity</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-white font-bold text-sm">{state.profile.standardWeap.history.length}</div>
                                  <div className="text-gray-400 text-[8px] mt-0.5">Convenes</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Banner History Archive */}
            <Card>
              <CardHeader><Archive size={14} className="text-purple-400" /> Banner History</CardHeader>
              <CardBody>
                <div className="max-h-64 overflow-y-auto kuro-scroll space-y-1.5">
                  {BANNER_HISTORY.map((b, i) => (
                    <div key={i} className="p-2 bg-white/5 rounded border border-white/10 hover:border-white/20 transition-colors">
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
        )}

        {/* [SECTION:TAB-EVENTS] */}
        {activeTab === 'events' && (
          <TabErrorBoundary tabName="Events">
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3 tab-content">
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
              const totalAstrite = eventEntries.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards) || 0), 0);
              const doneKeys = eventEntries.filter(([key]) => state.eventStatus[key] === 'done');
              const skippedKeys = eventEntries.filter(([key]) => state.eventStatus[key] === 'skipped');
              const earnedAstrite = doneKeys.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards) || 0), 0);
              const remainingAstrite = totalAstrite - earnedAstrite - skippedKeys.reduce((sum, [, ev]) => sum + (parseInt(ev.rewards) || 0), 0);
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
                        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${(earnedAstrite / totalAstrite) * 100}%` }} />
                      </div>
                      <span className="text-gray-400 text-[9px] flex-shrink-0">{doneKeys.length}/{eventEntries.length} done</span>
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="space-y-2">
              {Object.entries(EVENTS).map(([key, ev]) => {
                const eventImageMap = {
                  tacticalHologram: activeBanners.tacticalHologramImage,
                  whimperingWastes: activeBanners.whimperingWastesImage,
                  doubledPawns: activeBanners.doubledPawnsImage,
                  towerOfAdversity: activeBanners.towerOfAdversityImage,
                  illusiveRealm: activeBanners.illusiveRealmImage,
                  weeklyBoss: activeBanners.weeklyBossImage,
                  dailyReset: activeBanners.dailyResetImage,
                };
                return <EventCard key={key} event={{...ev, key}} server={state.server} bannerImage={eventImageMap[key] || ev.imageUrl} visualSettings={visualSettings} status={state.eventStatus[key]} onStatusChange={(s) => dispatch({ type: 'SET_EVENT_STATUS', eventKey: key, status: s })} />;
              })}
            </div>
            <p className="text-gray-500 text-[10px] text-center content-layer">Reset times based on {state.server} server (UTC{getServerOffset(state.server) >= 0 ? '+' : ''}{getServerOffset(state.server)})</p>
          </div>
          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-CALC] */}
        {activeTab === 'calculator' && (
          <TabErrorBoundary tabName="Calculator">
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3 tab-content">
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
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <PityRing value={state.calc.charPity} max={80} size={56} strokeWidth={4} color={state.calc.charPity >= 65 ? '#fb923c' : '#fbbf24'} glowColor={state.calc.charPity >= 65 ? 'rgba(251,146,60,0.5)' : 'rgba(251,191,36,0.4)'} />
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1 text-yellow-400">Featured Resonator</div>
                          <input type="range" min="0" max="80" value={state.calc.charPity} onChange={e => { const v = +e.target.value; setCalc('charPity', v); }} className="kuro-slider" />
                          {state.calc.charPity >= 65 && <p className="text-[10px] kuro-soft-pity" style={{color: '#fb923c'}}><Sparkles size={10} className="inline mr-1" style={{filter: 'drop-shadow(0 0 4px rgba(253,224,71,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.charPity >= 65 ? '#fb923c' : '#fbbf24'}} className={`text-2xl kuro-number ${state.calc.charPity >= 65 ? 'kuro-soft-pity' : ''}`}>{state.calc.charPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400">5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.charCopies} onChange={e => { const v = parseInt(e.target.value) || 1; setCalc('charCopies', Math.max(1, Math.min(7, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-400">4★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.char4StarCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('char4StarCopies', Math.max(0, Math.min(21, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Featured Weapon Pity - Pink to match weapon banners */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <PityRing value={state.calc.weapPity} max={80} size={56} strokeWidth={4} color={state.calc.weapPity >= 65 ? '#ec4899' : '#f9a8d4'} glowColor={state.calc.weapPity >= 65 ? 'rgba(236,72,153,0.5)' : 'rgba(249,168,212,0.4)'} />
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1 text-pink-400">Featured Weapon</div>
                          <input type="range" min="0" max="80" value={state.calc.weapPity} onChange={e => setCalc('weapPity', +e.target.value)} className="kuro-slider pink" />
                          {state.calc.weapPity >= 65 && <p className="text-[10px] kuro-soft-pity-pink" style={{color: '#ec4899'}}><Swords size={10} className="inline mr-1" style={{color: '#ec4899', filter: 'drop-shadow(0 0 4px rgba(236,72,153,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.weapPity >= 65 ? '#ec4899' : '#f9a8d4'}} className={`text-2xl kuro-number ${state.calc.weapPity >= 65 ? 'kuro-soft-pity-pink' : ''}`}>{state.calc.weapPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-pink-400">5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.weapCopies} onChange={e => { const v = parseInt(e.target.value) || 1; setCalc('weapCopies', Math.max(1, Math.min(5, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-400">4★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.weap4StarCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('weap4StarCopies', Math.max(0, Math.min(15, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Standard Resonator Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <PityRing value={state.calc.stdCharPity} max={80} size={56} strokeWidth={4} color={state.calc.stdCharPity >= 65 ? '#67e8f9' : '#22d3ee'} glowColor={state.calc.stdCharPity >= 65 ? 'rgba(103,232,249,0.5)' : 'rgba(34,211,238,0.4)'} />
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1 text-cyan-400">Standard Resonator</div>
                          <input type="range" min="0" max="80" value={state.calc.stdCharPity} onChange={e => setCalc('stdCharPity', +e.target.value)} className="kuro-slider cyan" />
                          {state.calc.stdCharPity >= 65 && <p className="text-[10px] kuro-soft-pity-cyan" style={{color: '#67e8f9'}}><Star size={10} className="inline mr-1" style={{filter: 'drop-shadow(0 0 4px rgba(103,232,249,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.stdCharPity >= 65 ? '#67e8f9' : '#22d3ee'}} className={`text-2xl kuro-number ${state.calc.stdCharPity >= 65 ? 'kuro-soft-pity-cyan' : ''}`}>{state.calc.stdCharPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400">5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.stdCharCopies} onChange={e => { const v = parseInt(e.target.value) || 1; setCalc('stdCharCopies', Math.max(1, Math.min(7, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-400">4★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.stdChar4StarCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('stdChar4StarCopies', Math.max(0, Math.min(21, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Standard Weapon Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <PityRing value={state.calc.stdWeapPity} max={80} size={56} strokeWidth={4} color={state.calc.stdWeapPity >= 65 ? '#67e8f9' : '#22d3ee'} glowColor={state.calc.stdWeapPity >= 65 ? 'rgba(103,232,249,0.5)' : 'rgba(34,211,238,0.4)'} />
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1 text-cyan-400">Standard Weapon</div>
                          <input type="range" min="0" max="80" value={state.calc.stdWeapPity} onChange={e => setCalc('stdWeapPity', +e.target.value)} className="kuro-slider cyan" />
                          {state.calc.stdWeapPity >= 65 && <p className="text-[10px] kuro-soft-pity-cyan" style={{color: '#67e8f9'}}><Sword size={10} className="inline mr-1 rotate-45" style={{filter: 'drop-shadow(0 0 4px rgba(103,232,249,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.stdWeapPity >= 65 ? '#67e8f9' : '#22d3ee'}} className={`text-2xl kuro-number ${state.calc.stdWeapPity >= 65 ? 'kuro-soft-pity-cyan' : ''}`}>{state.calc.stdWeapPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400">5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.stdWeapCopies} onChange={e => { const v = parseInt(e.target.value) || 1; setCalc('stdWeapCopies', Math.max(1, Math.min(5, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-400">4★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.stdWeap4StarCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('stdWeap4StarCopies', Math.max(0, Math.min(15, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                      </div>
                    </div>
                  )}
              </CardBody>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>Resources</CardHeader>
              <CardBody className="space-y-3">
                  <div>
                    <label className="kuro-label">Astrite</label>
                    <input type="number" value={state.calc.astrite} onChange={e => setCalc('astrite', e.target.value)} className="kuro-input" placeholder="0" />
                    <p className="text-gray-400 text-[10px] mt-1.5">= {Math.floor((+state.calc.astrite || 0) / 160)} Convenes</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {[[160,'1 pull'], [800,'5 pulls'], [1600,'10 pulls'], [3200,'20 pulls']].map(([amt, tip]) => (
                        <button key={amt} onClick={() => setCalc('astrite', String((+state.calc.astrite || 0) + amt))} className="px-2 py-1 text-[9px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 transition-colors" title={tip}>+{amt}<span className="text-yellow-600 ml-0.5 text-[7px]">({tip.split(' ')[0]})</span></button>
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
                          <input type="number" value={state.calc.radiant} onChange={e => setCalc('radiant', e.target.value)} className="kuro-input" placeholder="0" />
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
                          <input type="number" value={state.calc.forging} onChange={e => setCalc('forging', e.target.value)} className="kuro-input" placeholder="0" />
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
                      <input type="number" value={state.calc.lustrous} onChange={e => setCalc('lustrous', e.target.value)} className="kuro-input" placeholder="0" />
                      <div className="flex gap-1 mt-1.5">
                        {[1, 5, 10].map(amt => (
                          <button key={amt} onClick={() => setCalc('lustrous', String((+state.calc.lustrous || 0) + amt))} className="px-2 py-1 text-[9px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 transition-colors">+{amt}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Astrite Allocation Priority - only shown in "Both" mode */}
                  {state.calc.selectedBanner === 'both' && (
                    <div>
                      <div className="kuro-label">Astrite Priority</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setCalc('allocPriority', Math.min(100, (state.calc.allocPriority ?? 50) + 10))} 
                          className={`kuro-btn text-xs py-3 ${(state.calc.allocPriority ?? 50) >= 50 ? 'active-gold' : ''}`}
                        >
                          <Crown size={14} className="mx-auto mb-1" />
                          <div className="font-medium">Resonator</div>
                          <div className="text-xl kuro-number" style={{color: (state.calc.allocPriority ?? 50) >= 50 ? '#fbbf24' : '#6b7280'}}>{state.calc.allocPriority ?? 50}%</div>
                          <div className="text-[9px] text-gray-500 mt-0.5">tap to +10%</div>
                        </button>
                        <button 
                          onClick={() => setCalc('allocPriority', Math.max(0, (state.calc.allocPriority ?? 50) - 10))} 
                          className={`kuro-btn text-xs py-3 ${(state.calc.allocPriority ?? 50) <= 50 ? 'active-pink' : ''}`}
                        >
                          <Swords size={14} className="mx-auto mb-1" />
                          <div className="font-medium">Weapon</div>
                          <div className="text-xl kuro-number" style={{color: (state.calc.allocPriority ?? 50) <= 50 ? '#f472b6' : '#6b7280'}}>{100 - (state.calc.allocPriority ?? 50)}%</div>
                          <div className="text-[9px] text-gray-500 mt-0.5">tap to +10%</div>
                        </button>
                      </div>
                      {(state.calc.allocPriority ?? 50) !== 50 && (
                        <button 
                          onClick={() => setCalc('allocPriority', 50)} 
                          className="kuro-btn w-full mt-2 text-xs"
                        >
                          <RefreshCcw size={12} className="inline mr-1.5" />Reset to 50/50
                        </button>
                      )}
                    </div>
                  )}

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
              <Card>
                <CardHeader>Featured Resonator Results</CardHeader>
                <CardBody className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-gold">
                        <div className={`text-3xl kuro-number ${parseFloat(charStats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(charStats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(charStats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{charStats.successRate}%</div>
                        <div className="text-gray-400 text-[10px] mt-1">P(≥{state.calc.charCopies} copies)</div>
                      </div>
                      <div className="kuro-stat kuro-stat-cyan">
                        <div className="text-2xl kuro-number text-cyan-400">~{charStats.expectedCopies}</div>
                        <div className="text-gray-400 text-[10px] mt-1">Expected Copies</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-xl kuro-number text-red-400">{charStats.missingPulls > 0 ? charStats.missingPulls : '✓'}</div>
                        <div className="text-gray-400 text-[10px] mt-1">{charStats.missingPulls > 0 ? 'Pulls Needed (avg)' : 'Ready!'}</div>
                      </div>
                      <div className="kuro-stat kuro-stat-gray">
                        <div className="text-xl kuro-number text-gray-400">{charStats.worstCase}</div>
                        <div className="text-gray-400 text-[10px] mt-1">Worst Case</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="kuro-stat kuro-stat-purple"><span className="text-purple-400 kuro-number">~{charStats.fourStarCount}</span><div className="text-gray-400 text-[9px] mt-0.5">4★ Expected</div></div>
                      <div className="kuro-stat kuro-stat-purple"><span className="text-purple-400 kuro-number">~{charStats.featuredFourStarCount}</span><div className="text-gray-400 text-[9px] mt-0.5">Featured 4★</div></div>
                    </div>
                </CardBody>
              </Card>
            )}

            {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
              <Card>
                <CardHeader>Featured Weapon Results</CardHeader>
                <CardBody className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-pink">
                        <div className={`text-3xl kuro-number ${parseFloat(weapStats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(weapStats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(weapStats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{weapStats.successRate}%</div>
                        <div className="text-gray-400 text-[10px] mt-1">P(≥{state.calc.weapCopies} copies)</div>
                      </div>
                      <div className="kuro-stat kuro-stat-cyan">
                        <div className="text-2xl kuro-number text-cyan-400">~{weapStats.expectedCopies}</div>
                        <div className="text-gray-400 text-[10px] mt-1">Expected Copies</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-xl kuro-number text-red-400">{weapStats.missingPulls > 0 ? weapStats.missingPulls : '✓'}</div>
                        <div className="text-gray-400 text-[10px] mt-1">{weapStats.missingPulls > 0 ? 'Pulls Needed (avg)' : 'Ready!'}</div>
                      </div>
                      <div className="kuro-stat kuro-stat-gray">
                        <div className="text-xl kuro-number text-gray-400">{weapStats.worstCase}</div>
                        <div className="text-gray-400 text-[10px] mt-1">Worst Case</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="kuro-stat kuro-stat-purple"><span className="text-purple-400 kuro-number">~{weapStats.fourStarCount}</span><div className="text-gray-400 text-[9px] mt-0.5">4★ Expected</div></div>
                      <div className="kuro-stat kuro-stat-purple"><span className="text-purple-400 kuro-number">~{weapStats.featuredFourStarCount}</span><div className="text-gray-400 text-[9px] mt-0.5">Featured 4★</div></div>
                    </div>
                </CardBody>
              </Card>
            )}

            {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
              <Card>
                <CardHeader>Standard Resonator Results</CardHeader>
                <CardBody className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-cyan">
                        <div className={`text-3xl kuro-number ${parseFloat(stdCharStats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(stdCharStats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(stdCharStats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{stdCharStats.successRate}%</div>
                        <div className="text-gray-400 text-[10px] mt-1">P(≥{state.calc.stdCharCopies} copies)</div>
                      </div>
                      <div className="kuro-stat kuro-stat-cyan">
                        <div className="text-2xl kuro-number text-cyan-400">~{stdCharStats.expectedCopies}</div>
                        <div className="text-gray-400 text-[10px] mt-1">Expected Copies</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-xl kuro-number text-red-400">{stdCharStats.missingPulls > 0 ? stdCharStats.missingPulls : '✓'}</div>
                        <div className="text-gray-400 text-[10px] mt-1">{stdCharStats.missingPulls > 0 ? 'Pulls Needed (avg)' : 'Ready!'}</div>
                      </div>
                      <div className="kuro-stat kuro-stat-gray">
                        <div className="text-xl kuro-number text-gray-400">{stdCharStats.worstCase}</div>
                        <div className="text-gray-400 text-[10px] mt-1">Worst Case</div>
                      </div>
                    </div>
                    <div className="kuro-stat kuro-stat-purple text-xs">
                      <span className="text-purple-400 kuro-number">~{stdCharStats.fourStarCount}</span>
                      <div className="text-gray-400 text-[9px] mt-0.5">4★ Expected</div>
                    </div>
                </CardBody>
              </Card>
            )}

            {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
              <Card>
                <CardHeader>Standard Weapon Results</CardHeader>
                <CardBody className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-cyan">
                        <div className={`text-3xl kuro-number ${parseFloat(stdWeapStats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(stdWeapStats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(stdWeapStats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{stdWeapStats.successRate}%</div>
                        <div className="text-gray-400 text-[10px] mt-1">P(≥{state.calc.stdWeapCopies} copies)</div>
                      </div>
                      <div className="kuro-stat kuro-stat-cyan">
                        <div className="text-2xl kuro-number text-cyan-400">~{stdWeapStats.expectedCopies}</div>
                        <div className="text-gray-400 text-[10px] mt-1">Expected Copies</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-xl kuro-number text-red-400">{stdWeapStats.missingPulls > 0 ? stdWeapStats.missingPulls : '✓'}</div>
                        <div className="text-gray-400 text-[10px] mt-1">{stdWeapStats.missingPulls > 0 ? 'Pulls Needed (avg)' : 'Ready!'}</div>
                      </div>
                      <div className="kuro-stat kuro-stat-gray">
                        <div className="text-xl kuro-number text-gray-400">{stdWeapStats.worstCase}</div>
                        <div className="text-gray-400 text-[10px] mt-1">Worst Case</div>
                      </div>
                    </div>
                    <div className="kuro-stat kuro-stat-purple text-xs">
                      <span className="text-purple-400 kuro-number">~{stdWeapStats.fourStarCount}</span>
                      <div className="text-gray-400 text-[9px] mt-0.5">4★ Expected</div>
                    </div>
                </CardBody>
              </Card>
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
        )}

        {/* [SECTION:TAB-PLANNER] */}
        {activeTab === 'planner' && (
          <TabErrorBoundary tabName="Planner">
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3 tab-content">
            <TabBackground id="planner" />

            <Card>
              <CardHeader>Daily Income</CardHeader>
              <CardBody className="space-y-3">
                <div>
                  <label className="kuro-label">Base Daily Astrite (Commissions, etc.)</label>
                  <input type="number" value={state.planner.dailyAstrite} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'dailyAstrite', value: +e.target.value || 0 })} className="kuro-input w-full" />
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
                  <div className="text-gray-400 text-[10px] mt-1">≈ {(dailyIncome / 160).toFixed(2)} Convenes/day • {Math.floor(dailyIncome * 30 / 160)} Convenes/month</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <div className="cursor-pointer" onClick={() => setShowIncomePanel(!showIncomePanel)}>
                <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform ${showIncomePanel ? 'rotate-180' : ''}`} />}>Add Purchases</CardHeader>
              </div>
              {showIncomePanel && (
                <CardBody className="space-y-1.5">
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
                  <button onClick={() => dispatch({ type: 'ADD_INCOME', income: { id: Date.now(), astrite: 1600, radiant: 0, lustrous: 0, label: 'Weekly Subscription', price: 9.99 } })} className="kuro-btn w-full text-left">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="text-gray-200 text-xs font-medium">Weekly Subscription</div>
                        <div className="text-gray-300 text-[10px]">680 Lunite + 1600 Astrite over 15 days</div>
                      </div>
                      <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">$9.99</span><Plus size={12} className="text-yellow-400" /></div>
                    </div>
                  </button>
                  {Object.entries(SUBSCRIPTIONS).filter(([k]) => k === 'bpInsider' || k === 'bpConnoisseur').map(([k, s]) => (
                    <button key={k} onClick={() => dispatch({ type: 'ADD_INCOME', income: { id: Date.now(), astrite: s.astrite, radiant: s.radiant || 0, lustrous: s.lustrous || 0, label: s.name, price: s.price } })} className="kuro-btn w-full text-left">
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
                    <button key={k} onClick={() => dispatch({ type: 'ADD_INCOME', income: { id: Date.now(), astrite: s.astrite, radiant: 0, lustrous: 0, label: s.name, price: s.price } })} className="kuro-btn w-full text-left">
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
                <CardHeader action={<button onClick={() => state.planner.addedIncome.forEach(i => dispatch({ type: 'REMOVE_INCOME', id: i.id }))} className="text-red-400 text-[10px] hover:text-red-300 transition-colors">Clear All</button>}>Added Purchases</CardHeader>
                <CardBody className="space-y-1.5">
                  {state.planner.addedIncome.map(i => (
                    <div key={i.id} className="flex items-center justify-between p-2 bg-white/5 rounded text-xs">
                      <span className="text-gray-200">{i.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">+{i.astrite}</span>
                        {i.radiant > 0 && <span className="text-yellow-400">+{i.radiant}RT</span>}
                        {i.lustrous > 0 && <span className="text-cyan-400">+{i.lustrous}LT</span>}
                        <button onClick={() => dispatch({ type: 'REMOVE_INCOME', id: i.id })} className="text-red-400"><Minus size={12} /></button>
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
                      <div className="text-white kuro-number text-xl">{Math.floor(planData.incomeByEnd / 160)}</div>
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
                      <div className="text-2xl kuro-number text-yellow-400">{Math.floor(dailyIncome * days / 160)}</div>
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
                    <select value={state.planner.goalPulls} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'goalPulls', value: +e.target.value })} className="kuro-input w-full">
                      <option value={80}>80 (Hard Pity)</option>
                      <option value={160}>160 (Guaranteed)</option>
                      <option value={240}>240 (Char + Signature)</option>
                    </select>
                  </div>
                  <div>
                    <label className="kuro-label">Multiplier</label>
                    <select value={state.planner.goalModifier} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'goalModifier', value: +e.target.value })} className="kuro-input w-full">
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
                  <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${planData.isFeatured ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`} style={{ width: `${planData.goalProgress}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] mt-1">
                    <span className="text-gray-400">{Math.floor(planData.currentAstrite / 160)} / {planData.targetPulls} Convenes</span>
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
                <CardBody className="space-y-1.5">
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
        )}

        {/* [SECTION:TAB-STATS] */}
        {activeTab === 'analytics' && (
          <TabErrorBoundary tabName="Stats">
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3 tab-content">
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
                              : `Unluckier than most — but your luck will turn around`}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}
                
                {/* Luck Leaderboard Modal */}
                {showLeaderboard && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="kuro-card w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-bold text-sm">Luck Leaderboard</h3>
                          <p className="text-gray-400 text-[10px]">Anonymous rankings by avg pity</p>
                        </div>
                        <button onClick={() => setShowLeaderboard(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close leaderboard">
                          <X size={18} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {leaderboardLoading ? (
                          <div className="text-center py-8">
                            <div className="text-gray-400 text-sm">Loading...</div>
                          </div>
                        ) : leaderboardData.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="text-gray-500 text-sm mb-2">No entries yet</div>
                            <div className="text-gray-600 text-[10px]">Be the first to submit!</div>
                          </div>
                        ) : (
                          leaderboardData.map((entry, i) => {
                            const isYou = entry.id === userLeaderboardId;
                            const medalColors = ['#fbbf24', '#c0c0c0', '#cd7f32'];
                            return (
                              <div 
                                key={entry.id}
                                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${isYou ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-white/5'}`}
                              >
                                <div 
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{
                                    background: i < 3 ? `linear-gradient(135deg, ${medalColors[i]}40, ${medalColors[i]}20)` : 'rgba(255,255,255,0.1)',
                                    color: i < 3 ? medalColors[i] : '#9ca3af',
                                    border: i < 3 ? `1px solid ${medalColors[i]}50` : '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: i < 3 ? `0 0 10px ${medalColors[i]}30` : 'none'
                                  }}
                                >
                                  {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium truncate ${isYou ? 'text-cyan-400' : 'text-gray-200'}`}>
                                      {entry.id}
                                    </span>
                                    {isYou && <span className="text-[8px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">YOU</span>}
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
                      </div>
                      <div className="p-4 border-t border-white/10 space-y-2">
                        {userLeaderboardId && overallStats?.avgPity && (
                          <>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-gray-400">Your ID: <span className="text-cyan-400 font-mono">{userLeaderboardId}</span></span>
                              <span className="text-gray-400">Your Avg: <span className="text-white font-bold">{overallStats.avgPity}</span></span>
                            </div>
                            <button
                              onClick={submitToLeaderboard}
                              className="w-full kuro-btn active-cyan py-2 text-xs font-medium"
                            >
                              Submit My Score
                            </button>
                            <p className="text-gray-500 text-[9px] text-center">Anonymous • No personal data shared</p>
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
                    <CardHeader>
                      <span className="flex items-center gap-1.5"><Trophy size={14} className="text-yellow-400" /> Trophies <span className="text-gray-500 font-normal text-[10px]">({trophies.list.length})</span></span>
                      <span className="text-gray-500 text-[10px]">{trophies.list.length} earned</span>
                    </CardHeader>
                    <CardBody>
                      <div className="grid grid-cols-3 gap-2">
                        {trophies.list.map(trophy => {
                          const IconMap = { Crown, Sparkles, Heart, Swords, Sword, Shield, Gift, Zap, Clover, Flame, Target, AlertCircle, TrendingDown, TrendingUp, Fish, Diamond, Gamepad2, Star, Trophy };
                          const IconComponent = IconMap[trophy.icon] || Star;
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
                        const IconMap = { Crown, Sparkles, Heart, Swords, Sword, Shield, Gift, Zap, Clover, Flame, Target, AlertCircle, TrendingDown, TrendingUp, Fish, Diamond, Gamepad2, Star, Trophy };
                        const t = trophies.list.find(tr => tr.id === selectedTrophy);
                        if (!t) return null;
                        const Icon = IconMap[t.icon] || Star;
                        return (
                          <div 
                            className="fixed inset-0 z-[9999] flex items-center justify-center"
                            onClick={() => setSelectedTrophy(null)}
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
                              <div className="mt-3 text-[9px] text-gray-600">tap outside to close</div>
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
                    </CardBody>
                  </Card>
                )}

                {/* 5★ Pity Distribution Histogram */}
                {(() => {
                  const allHist = [...(state.profile.featured?.history || []), ...(state.profile.weapon?.history || []), ...(state.profile.standardChar?.history || []), ...(state.profile.standardWeap?.history || [])];
                  const fiveStars = allHist.filter(p => p.rarity === 5 && p.pity > 0);
                  if (fiveStars.length < 2) return null;
                  
                  // Group pity into buckets of 10
                  const buckets = {};
                  fiveStars.forEach(p => {
                    const bucket = Math.floor((p.pity - 1) / 10) * 10 + 1;
                    const label = `${bucket}-${bucket + 9}`;
                    buckets[label] = (buckets[label] || 0) + 1;
                  });
                  
                  // Ensure all buckets from 1-10 to 71-80 exist
                  const allBuckets = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80'];
                  allBuckets.forEach(b => { if (!buckets[b]) buckets[b] = 0; });
                  
                  const maxCount = Math.max(...Object.values(buckets), 1);
                  const avgPity = (fiveStars.reduce((sum, p) => sum + p.pity, 0) / fiveStars.length).toFixed(1);
                  
                  // Color coding
                  const getBarColor = (label) => {
                    const start = parseInt(label.split('-')[0]);
                    if (start <= 20) return '#22c55e'; // Green - very lucky
                    if (start <= 40) return '#84cc16'; // Lime - lucky
                    if (start <= 50) return '#fbbf24'; // Yellow - average
                    if (start <= 60) return '#f97316'; // Orange - unlucky
                    return '#ef4444'; // Red - soft pity / hard pity
                  };
                  
                  return (
                    <Card>
                      <CardHeader>
                        <span className="flex items-center gap-1.5"><BarChart3 size={14} /> 5★ Pity Distribution</span>
                        <span className="text-gray-500 text-[10px]">{fiveStars.length} pulls</span>
                      </CardHeader>
                      <CardBody>
                        {/* Histogram bars - neon glow style */}
                        <div className="flex items-end gap-1.5 h-24 mb-2">
                          {allBuckets.map(label => {
                            const count = buckets[label] || 0;
                            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                            const color = getBarColor(label);
                            return (
                              <div key={label} className="flex-1 flex flex-col items-center">
                                <div className="w-full relative" style={{ height: '96px' }}>
                                  {count > 0 && (
                                    <div 
                                      className="absolute left-0 right-0 text-[8px] text-center font-bold"
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
                            <div key={label} className="flex-1 text-[8px] text-gray-500 text-center">
                              {label.split('-')[0]}
                            </div>
                          ))}
                        </div>
                        
                        {/* Stats summary */}
                        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-emerald-400 font-bold text-sm" style={{ textShadow: '0 0 10px rgba(34,197,94,0.5)' }}>{Math.min(...fiveStars.map(p => p.pity))}</div>
                            <div className="text-gray-500 text-[9px]">Earliest</div>
                          </div>
                          <div>
                            <div className="text-yellow-400 font-bold text-sm" style={{ textShadow: '0 0 10px rgba(251,191,36,0.5)' }}>{avgPity}</div>
                            <div className="text-gray-500 text-[9px]">Average</div>
                          </div>
                          <div>
                            <div className="text-red-400 font-bold text-sm" style={{ textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>{Math.max(...fiveStars.map(p => p.pity))}</div>
                            <div className="text-gray-500 text-[9px]">Latest</div>
                          </div>
                        </div>
                        
                        {/* Pity zone legend - neon dots */}
                        <div className="mt-2 flex items-center justify-center gap-3 text-[8px]">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}></span> 
                            <span className="text-gray-400">Lucky</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }}></span> 
                            <span className="text-gray-400">Average</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 6px #ef4444' }}></span> 
                            <span className="text-gray-400">Soft Pity</span>
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })()}

                {/* Convenes Chart with Time Range */}
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><TrendingUp size={14} /> Convene History</span>
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      const allHist = [...(state.profile.featured?.history || []), ...(state.profile.weapon?.history || []), ...(state.profile.standardChar?.history || []), ...(state.profile.standardWeap?.history || [])];
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
                              const startOfYear = new Date(date.getFullYear(), 0, 1);
                              const weekNum = Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
                              key = `${date.getFullYear()}-W${String(weekNum).padStart(2,'0')}`;
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
                          const d = new Date(key);
                          return `${d.getDate()}/${d.getMonth()+1}`;
                        } else if (range === 'weekly') {
                          return key.split('-')[1];
                        } else if (range === 'monthly') {
                          return new Date(key + '-01').toLocaleString('default', { month: 'short' });
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
                    {overallStats.winRate && <div className="text-center text-[10px] text-gray-400 mt-2">50/50 Win Rate: <span className="text-emerald-400 font-bold">{overallStats.winRate}%</span></div>}
                  </CardBody>
                </Card>

                {/* 5★ Pull Log */}
                <Card>
                  <CardHeader>5★ Pull Log</CardHeader>
                  <CardBody>
                    {(() => {
                      const allPulls = [
                        ...(state.profile.featured?.history || []).map(p => ({...p, banner: 'Featured'})),
                        ...(state.profile.weapon?.history || []).map(p => ({...p, banner: 'Weapon'})),
                        ...(state.profile.standardChar?.history || []).map(p => ({...p, banner: 'Std Char'})),
                        ...(state.profile.standardWeap?.history || []).map(p => ({...p, banner: 'Std Weap'})),
                      ];
                      const fiveStars = allPulls.filter(p => p.rarity === 5 && p.name).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
                      if (fiveStars.length === 0) return <p className="text-gray-500 text-xs text-center py-4">No 5★ pulls yet</p>;
                      return (
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {fiveStars.map((p, i) => {
                            const pityColor = p.pity <= 40 ? '#34d399' : p.pity <= 60 ? '#60a5fa' : p.pity <= 70 ? '#fbbf24' : '#f87171';
                            const pityTextColor = p.pity <= 40 ? 'text-emerald-400' : p.pity <= 60 ? 'text-blue-400' : p.pity <= 70 ? 'text-yellow-400' : 'text-red-400';
                            return (
                              <div key={i} className="pull-log-row flex items-center justify-between p-1.5 rounded text-[10px]" style={{'--pity-color': pityColor, background: 'rgba(255,255,255,0.03)'}}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-yellow-400 font-medium truncate">{p.name}</span>
                                  <span className="text-gray-500 flex-shrink-0">{p.banner}</span>
                                  {p.banner === 'Featured' && p.won5050 === true && <span className="text-emerald-400 text-[8px] font-bold flex-shrink-0">W</span>}
                                  {p.banner === 'Featured' && p.won5050 === false && <span className="text-red-400 text-[8px] font-bold flex-shrink-0">L</span>}
                                  {p.banner === 'Featured' && p.won5050 === null && <span className="text-gray-500 text-[8px] flex-shrink-0">G</span>}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`font-bold ${pityTextColor}`}>{p.pity || '?'}</span>
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
                      const resHist = [...(state.profile.featured?.history || []), ...(state.profile.standardChar?.history || []), ...(state.profile.beginner?.history || []).filter(p => p.name && ALL_CHARACTERS.has(p.name))];
                      const wepHist = [...(state.profile.weapon?.history || []), ...(state.profile.standardWeap?.history || []), ...(state.profile.beginner?.history || []).filter(p => p.name && !ALL_CHARACTERS.has(p.name))];
                      return (<>
                    <p className="text-gray-400 text-[9px] mb-1.5">Resonators</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold text-sm">{resHist.filter(p => p.rarity === 5).length}</div><div className="text-gray-400 text-[9px]">5★</div></div>
                      <div className="kuro-stat kuro-stat-purple p-2 text-center"><div className="text-purple-400 font-bold text-sm">{resHist.filter(p => p.rarity === 4).length}</div><div className="text-gray-400 text-[9px]">4★</div></div>
                    </div>
                    
                    <p className="text-gray-400 text-[9px] mb-1.5">Weapons</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="kuro-stat kuro-stat-gold p-2 text-center"><div className="text-yellow-400 font-bold text-sm">{wepHist.filter(p => p.rarity === 5).length}</div><div className="text-gray-400 text-[9px]">5★</div></div>
                      <div className="kuro-stat kuro-stat-purple p-2 text-center"><div className="text-purple-400 font-bold text-sm">{wepHist.filter(p => p.rarity === 4).length}</div><div className="text-gray-400 text-[9px]">4★</div></div>
                      <div className="kuro-stat p-2 text-center"><div className="text-blue-400 font-bold text-sm">{wepHist.filter(p => p.rarity === 3).length}</div><div className="text-gray-400 text-[9px]">3★</div></div>
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
                      const pity = state.profile[banner.key]?.pity5 || 0;
                      return (
                        <div key={banner.name} className="p-2 bg-white/5 rounded">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium" style={{color: banner.color === 'yellow' ? '#fbbf24' : banner.color === 'pink' ? '#f472b6' : banner.color === 'cyan' ? '#22d3ee' : '#a78bfa'}}>{banner.name}</span>
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
        )}

        {/* [SECTION:TAB-COLLECT] */}
        {activeTab === 'gathering' && (
          <TabErrorBoundary tabName="Collection">
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3 tab-content">
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
                      <div className="grid grid-cols-5 gap-1 text-center text-[8px]">
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
                    />
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {collectionSearch && (
                      <button onClick={() => setCollectionSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
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
                        📅
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
                    {(() => {
                      const filteredNames = filterCollectionItems(ALL_5STAR_RESONATORS, collectionData.chars5Counts, true);
                      const allChars = collectionData.sortItems(filteredNames.map(name => [name, collectionData.chars5Counts[name] || 0]), collectionSort);
                      const collMask = generateVerticalMaskGradient(visualSettings.collectionFadePosition, visualSettings.collectionFadeIntensity, visualSettings.collectionFadeDirection);
                      const collOpacity = visualSettings.collectionOpacity / 100;
                      const ownedCount = allChars.filter(([_, c]) => c > 0).length;
                      if (allChars.length === 0) return <p className="text-gray-500 text-xs text-center py-4">No items match your filters</p>;
                      return (
                        <>
                          <div className="text-[10px] text-gray-400 mb-2 text-right">{ownedCount}/{allChars.length} shown{hasActiveFilters ? ` (${ALL_5STAR_RESONATORS.length} total)` : ''}</div>
                          <div className="grid grid-cols-3 gap-2">
                            {allChars.map(([name, count]) => {
                              const imgUrl = collectionImages[name];
                              const imageKey = `collection-${name}`;
                              return (
                                <CollectionGridCard key={name} name={name} count={count} imgUrl={withCacheBuster(imgUrl)} framing={getImageFraming(imageKey)} isSelected={framingMode && editingImage === imageKey} owned={count > 0} collMask={collMask} collOpacity={collOpacity} glowClass="glow-gold" ownedBg="bg-yellow-500/10" ownedBorder="border-yellow-500/30" countLabel={`S${count - 1}`} countColor="text-yellow-400" framingMode={framingMode} setEditingImage={setEditingImage} imageKey={imageKey} onClickCard={CHARACTER_DATA[name] ? () => setDetailModal({ show: true, type: 'character', name, imageUrl: imgUrl }) : null} isNew={activeBanners.characters?.some(c => c.name === name && c.isNew)} />
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* 4★ Resonators */}
                <Card>
                  <CardHeader>
                    <span className="text-purple-400">★★★★</span> Resonators
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      const filteredNames = filterCollectionItems(ALL_4STAR_RESONATORS, collectionData.chars4Counts, true);
                      const allChars = collectionData.sortItems(filteredNames.map(name => [name, collectionData.chars4Counts[name] || 0]), collectionSort);
                      const collMask = generateVerticalMaskGradient(visualSettings.collectionFadePosition, visualSettings.collectionFadeIntensity, visualSettings.collectionFadeDirection);
                      const collOpacity = visualSettings.collectionOpacity / 100;
                      const ownedCount = allChars.filter(([_, c]) => c > 0).length;
                      if (allChars.length === 0) return <p className="text-gray-500 text-xs text-center py-4">No items match your filters</p>;
                      return (
                        <>
                          <div className="text-[10px] text-gray-400 mb-2 text-right">{ownedCount}/{allChars.length} shown{hasActiveFilters ? ` (${ALL_4STAR_RESONATORS.length} total)` : ''}</div>
                          <div className="grid grid-cols-3 gap-2">
                            {allChars.map(([name, count]) => {
                              const imgUrl = collectionImages[name];
                              const imageKey = `collection-${name}`;
                              return (
                                <CollectionGridCard key={name} name={name} count={count} imgUrl={withCacheBuster(imgUrl)} framing={getImageFraming(imageKey)} isSelected={framingMode && editingImage === imageKey} owned={count > 0} collMask={collMask} collOpacity={collOpacity} glowClass="glow-purple" ownedBg="bg-purple-500/10" ownedBorder="border-purple-500/30" countLabel={`S${count - 1}`} countColor="text-purple-400" framingMode={framingMode} setEditingImage={setEditingImage} imageKey={imageKey} onClickCard={CHARACTER_DATA[name] ? () => setDetailModal({ show: true, type: 'character', name, imageUrl: imgUrl }) : null} />
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* 5★ Weapons */}
                <Card>
                  <CardHeader>
                    <span className="text-yellow-400">★★★★★</span> Weapons
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      const filteredNames = filterCollectionItems(ALL_5STAR_WEAPONS, collectionData.weaps5Counts, false);
                      const allWeaps = collectionData.sortItems(filteredNames.map(name => [name, collectionData.weaps5Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER);
                      const collMask = generateVerticalMaskGradient(visualSettings.collectionFadePosition, visualSettings.collectionFadeIntensity, visualSettings.collectionFadeDirection);
                      const collOpacity = visualSettings.collectionOpacity / 100;
                      const ownedCount = allWeaps.filter(([_, c]) => c > 0).length;
                      if (allWeaps.length === 0) return <p className="text-gray-500 text-xs text-center py-4">No items match your filters</p>;
                      return (
                        <>
                          <div className="text-[10px] text-gray-400 mb-2 text-right">{ownedCount}/{allWeaps.length} shown{hasActiveFilters ? ` (${ALL_5STAR_WEAPONS.length} total)` : ''}</div>
                          <div className="grid grid-cols-3 gap-2">
                            {allWeaps.map(([name, count]) => {
                              const imgUrl = collectionImages[name];
                              const imageKey = `collection-${name}`;
                              return (
                                <CollectionGridCard key={name} name={name} count={count} imgUrl={withCacheBuster(imgUrl)} framing={getImageFraming(imageKey)} isSelected={framingMode && editingImage === imageKey} owned={count > 0} collMask={collMask} collOpacity={collOpacity} glowClass="glow-gold" ownedBg="bg-yellow-500/10" ownedBorder="border-yellow-500/30" countLabel={`R${count}`} countColor="text-yellow-400" framingMode={framingMode} setEditingImage={setEditingImage} imageKey={imageKey} onClickCard={WEAPON_DATA[name] ? () => setDetailModal({ show: true, type: 'weapon', name, imageUrl: imgUrl }) : null} isNew={activeBanners.weapons?.some(w => w.name === name && w.isNew)} />
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* 4★ Weapons */}
                <Card>
                  <CardHeader>
                    <span className="text-purple-400">★★★★</span> Weapons
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      const filteredNames = filterCollectionItems(ALL_4STAR_WEAPONS, collectionData.weaps4Counts, false);
                      const allWeaps = collectionData.sortItems(filteredNames.map(name => [name, collectionData.weaps4Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER);
                      const collMask = generateVerticalMaskGradient(visualSettings.collectionFadePosition, visualSettings.collectionFadeIntensity, visualSettings.collectionFadeDirection);
                      const collOpacity = visualSettings.collectionOpacity / 100;
                      const ownedCount = allWeaps.filter(([_, c]) => c > 0).length;
                      if (allWeaps.length === 0) return <p className="text-gray-500 text-xs text-center py-4">No items match your filters</p>;
                      return (
                        <>
                          <div className="text-[10px] text-gray-400 mb-2 text-right">{ownedCount}/{allWeaps.length} shown{hasActiveFilters ? ` (${ALL_4STAR_WEAPONS.length} total)` : ''}</div>
                          <div className="grid grid-cols-3 gap-2">
                            {allWeaps.map(([name, count]) => {
                              const imgUrl = collectionImages[name];
                              const imageKey = `collection-${name}`;
                              return (
                                <CollectionGridCard key={name} name={name} count={count} imgUrl={withCacheBuster(imgUrl)} framing={getImageFraming(imageKey)} isSelected={framingMode && editingImage === imageKey} owned={count > 0} collMask={collMask} collOpacity={collOpacity} glowClass="glow-purple" ownedBg="bg-purple-500/10" ownedBorder="border-purple-500/30" countLabel={`R${count}`} countColor="text-purple-400" framingMode={framingMode} setEditingImage={setEditingImage} imageKey={imageKey} onClickCard={WEAPON_DATA[name] ? () => setDetailModal({ show: true, type: 'weapon', name, imageUrl: imgUrl }) : null} />
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </CardBody>
                </Card>

                {/* 3★ Weapons */}
                <Card>
                  <CardHeader>
                    <span className="text-blue-400">★★★</span> Weapons
                  </CardHeader>
                  <CardBody>
                    {(() => {
                      const filteredNames = filterCollectionItems(ALL_3STAR_WEAPONS, collectionData.weaps3Counts, false);
                      const allWeaps = collectionData.sortItems(filteredNames.map(name => [name, collectionData.weaps3Counts[name] || 0]), collectionSort, WEAPON_RELEASE_ORDER);
                      const collMask = generateVerticalMaskGradient(visualSettings.collectionFadePosition, visualSettings.collectionFadeIntensity, visualSettings.collectionFadeDirection);
                      const collOpacity = visualSettings.collectionOpacity / 100;
                      const ownedCount = allWeaps.filter(([_, c]) => c > 0).length;
                      if (allWeaps.length === 0) return <p className="text-gray-500 text-xs text-center py-4">No items match your filters</p>;
                      return (
                        <>
                          <div className="text-[10px] text-gray-400 mb-2 text-right">{ownedCount}/{allWeaps.length} shown{hasActiveFilters ? ` (${ALL_3STAR_WEAPONS.length} total)` : ''}</div>
                          <div className="grid grid-cols-3 gap-2">
                            {allWeaps.map(([name, count]) => {
                              const imgUrl = collectionImages[name];
                              const imageKey = `collection-${name}`;
                              return (
                                <CollectionGridCard key={name} name={name} count={count} imgUrl={withCacheBuster(imgUrl)} framing={getImageFraming(imageKey)} isSelected={framingMode && editingImage === imageKey} owned={count > 0} collMask={collMask} collOpacity={collOpacity} glowClass="" ownedBg="bg-blue-500/10" ownedBorder="border-blue-500/30" countLabel={`R${count}`} countColor="text-blue-400" framingMode={framingMode} setEditingImage={setEditingImage} imageKey={imageKey} onClickCard={null} />
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </CardBody>
                </Card>
              </>
            )}
          </div>
          </TabErrorBoundary>
        )}

        {/* [SECTION:TAB-PROFILE] */}
        {activeTab === 'profile' && (
          <TabErrorBoundary tabName="Profile">
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3 tab-content">
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
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${visualSettings.swipeNavigation ? 'left-6 bg-white' : 'left-1 bg-gray-400'}`} />
                  </button>
                </div>
                {visualSettings.swipeNavigation && (
                  <p className="text-cyan-400 text-[9px] text-center">✓ Swipe left/right on content area to navigate</p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>Import Convene History</CardHeader>
              <CardBody className="space-y-3">
                <p className="text-gray-300 text-[10px]">Import from wuwatracker, wuwapal, or other trackers.</p>
                <div className="grid grid-cols-3 gap-2">
                  {[['pc', 'PC', Monitor], ['android', 'Android', Smartphone], ['ps5', 'PS5', Gamepad2]].map(([k, l, Icon]) => (
                    <button key={k} onClick={() => setImportPlatform(k)} className={`kuro-btn p-2 text-center ${importPlatform === k ? 'active-gold' : ''}`}>
                      <Icon size={16} className="mx-auto mb-0.5" /><div className="text-[10px]">{l}</div>
                    </button>
                  ))}
                </div>
                {importPlatform === 'pc' && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded text-[10px] text-gray-200 space-y-2">
                    <p className="text-gray-100 font-medium text-xs">PC</p>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">1</span>
                      <p>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">2</span>
                      <p>Run <span className="text-gray-100 font-medium">PowerShell script</span> or upload <span className="text-gray-100 font-medium">Client.log</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">3</span>
                      <p>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">4</span>
                      <p><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</p>
                    </div>
                  </div>
                )}
                {importPlatform === 'android' && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded text-[10px] text-gray-200 space-y-2">
                    <p className="text-gray-100 font-medium text-xs">Android (11+)</p>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">1</span>
                      <p>Download <span className="text-gray-100 font-medium">Ascent app</span> (v2.1.6+) to get URL</p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">2</span>
                      <p>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span> → Import URL</p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">3</span>
                      <p>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">4</span>
                      <p><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</p>
                    </div>
                  </div>
                )}
                {importPlatform === 'ps5' && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded text-[10px] text-gray-200 space-y-2">
                    <p className="text-gray-100 font-medium text-xs">PS5 (In-Game Browser)</p>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">1</span>
                      <p>Open WuWa → Convene → History → tap <span className="text-gray-100 font-medium">"View Details"</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">2</span>
                      <p>Press <span className="text-gray-100 font-medium">"Options"</span> → Select <span className="text-gray-100 font-medium">"Page Information"</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">3</span>
                      <p>Find <span className="text-gray-100 font-medium">player_id</span> and <span className="text-gray-100 font-medium">record_id</span> in the URL</p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">4</span>
                      <p>Go to <span className="text-gray-100 font-medium">wuwatracker.com</span> → Enter IDs → Import</p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">5</span>
                      <p>Go to <span className="text-gray-100 font-medium">Profile → Settings → Data</span></p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-white/10 text-gray-200 flex items-center justify-center text-[10px] font-bold">6</span>
                      <p><span className="text-gray-100 font-medium">Export Pull History</span> → Download JSON → Upload below</p>
                    </div>
                    
                    <p className="text-gray-400 text-[9px] pt-1 border-t border-white/10">⚠️ URL valid for ~24 hours only</p>
                  </div>
                )}
                
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
                    <svg className="inline w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Paste JSON
                  </button>
                </div>
                
                {/* File Upload Method */}
                {importMethod === 'file' && (
                  <label className="block">
                    <div className="p-4 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:border-yellow-500/50 transition-colors">
                      <Upload size={20} className="mx-auto mb-1 text-gray-300" />
                      <p className="text-gray-300 text-[10px]">Upload JSON file from wuwatracker</p>
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
                <CardHeader action={<button onClick={() => { dispatch({ type: 'CLEAR_PROFILE' }); toast?.addToast?.('Profile cleared!', 'info'); }} className="text-red-400 text-[10px] hover:text-red-300 transition-colors">Clear</button>}>Import Info</CardHeader>
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
                  <p>Wuthering Waves, all game content, characters, names, and related media are trademarks and copyrights of Kuro Games © 2024-2026. All rights reserved.</p>
                </div>
                
                <div className="space-y-2 text-[9px] text-gray-500">
                  <p className="font-medium text-gray-400">Data & Privacy</p>
                  <p>All data is stored locally on your device using browser storage. No personal information is collected, transmitted, or shared with any third party. Your Convene history and settings remain private and under your control.</p>
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
                    <li><a href="https://wuwatracker.com" className="text-cyan-400 hover:underline">WuWa Tracker</a> - Event timeline & pity tracking</li>
                    <li><a href="https://wuthering-countdown.gengamer.in" className="text-cyan-400 hover:underline">GenGamer Countdown</a> - Banner countdowns</li>
                  </ul>
                  <p className="mt-1">We thank these community resources for providing accurate timing data.</p>
                </div>
                
                <div className="space-y-2 text-[9px] text-gray-500">
                  <p className="font-medium text-gray-400">License</p>
                  <p>This tool is provided "as is" without warranty of any kind. Use at your own discretion. The developers are not responsible for any issues arising from the use of this application.</p>
                </div>
                
                <p className="text-center text-[8px] text-gray-500 pt-2">© 2026 Whispering Wishes by <a href="https://www.reddit.com/u/WW_Andene" className="text-gray-500 hover:text-gray-400 transition-colors">u/WW_Andene</a> • Made with ♡ for the WuWa community.</p>
              </CardBody>
            </Card>
          </div>
          </TabErrorBoundary>
        )}

      </main>

      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm">
            <CardHeader action={<button onClick={() => setShowBookmarkModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close bookmark modal"><X size={16} /></button>}>Save Current State</CardHeader>
            <CardBody className="space-y-3">
              <input type="text" value={bookmarkName} onChange={e => setBookmarkName(e.target.value)} placeholder="Enter name..." className="kuro-input w-full" />
              <div className="text-gray-300 text-[10px]">
                <p>Astrite: {state.calc.astrite || 0} • Pity: {state.calc.charPity}/{state.calc.weapPity}</p>
                <p>Radiant: {state.calc.radiant || 0} • Forging: {state.calc.forging || 0}</p>
              </div>
              <button onClick={() => { haptic.success(); dispatch({ type: 'SAVE_BOOKMARK', name: bookmarkName || 'Unnamed' }); setBookmarkName(''); setShowBookmarkModal(false); }} className="kuro-btn w-full active-purple">Save Bookmark</button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm">
            <CardHeader action={<button onClick={() => setShowExportModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close export modal"><X size={16} /></button>}>Backup</CardHeader>
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
                    const textarea = document.querySelector('textarea');
                    textarea?.select();
                    document.execCommand('copy');
                    toast?.addToast?.('Copied to clipboard!', 'success');
                  }
                }} 
                className="kuro-btn w-full"
              >
                Copy to Clipboard
              </button>
              
              <div className="kuro-divider" />
              
              <p className="text-gray-400 text-[10px]">Or paste backup data to restore:</p>
              <textarea 
                placeholder="Paste backup JSON here..."
                className="kuro-input w-full h-20 text-[9px] font-mono"
                id="import-textarea"
              />
              <button 
                onClick={() => {
                  try {
                    const textarea = document.getElementById('import-textarea');
                    const data = JSON.parse(textarea.value);
                    if (data.state) {
                      const restoredState = {
                        ...initialState,
                        ...data.state,
                        server: data.state.server || initialState.server,
                        profile: { ...initialState.profile, ...data.state.profile },
                        calc: { ...initialState.calc, ...data.state.calc },
                        planner: { ...initialState.planner, ...data.state.planner },
                        settings: { ...initialState.settings, ...data.state.settings },
                        bookmarks: data.state.bookmarks || [],
                      };
                      dispatch({ type: 'LOAD_STATE', state: restoredState });
                      toast?.addToast?.(`Backup restored! (v${data.version || 'unknown'})`, 'success');
                      setShowExportModal(false);
                    } else {
                      toast?.addToast?.('Invalid backup format', 'error');
                    }
                  } catch (e) {
                    toast?.addToast?.('Invalid JSON data', 'error');
                  }
                }} 
                className="kuro-btn w-full"
              >
                Restore Backup
              </button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && !adminMiniMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Settings size={16} /> Admin Panel</span>
              <button onClick={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close admin panel"><X size={16} /></button>
            </CardHeader>
            <CardBody className="space-y-3">
              {!adminUnlocked ? (
                <div className="space-y-3">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-center">
                    <p className="text-yellow-400 text-sm font-medium">Admin Access Required</p>
                    <p className="text-gray-400 text-[10px] mt-1">{storedAdminPass ? 'Enter your password' : 'Set a new password (first time)'}</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder={storedAdminPass ? "Enter password" : "Create new password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && verifyAdminPassword()}
                      className="kuro-input flex-1 text-sm"
                    />
                    <button onClick={verifyAdminPassword} className="kuro-btn px-4">{storedAdminPass ? 'Unlock' : 'Set'}</button>
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
                                        const newCustom = { ...customCollectionImages };
                                        if (e.target.value) {
                                          newCustom[name] = e.target.value;
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
                          onClick={() => saveCollectionImages({})}
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
                      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-3">
                        <h3 className="text-cyan-400 text-sm font-medium mb-3">Banner Card Settings</h3>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-gray-300">Fade Position</span>
                              <span className="text-cyan-400">{visualSettings.fadePosition}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={visualSettings.fadePosition}
                              onChange={(e) => saveVisualSettings({ ...visualSettings, fadePosition: parseInt(e.target.value) })}
                              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-gray-300">Fade Intensity</span>
                              <span className="text-cyan-400">{visualSettings.fadeIntensity}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={visualSettings.fadeIntensity}
                              onChange={(e) => saveVisualSettings({ ...visualSettings, fadeIntensity: parseInt(e.target.value) })}
                              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-gray-300">Picture Opacity</span>
                              <span className="text-cyan-400">{visualSettings.pictureOpacity}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={visualSettings.pictureOpacity}
                              onChange={(e) => saveVisualSettings({ ...visualSettings, pictureOpacity: parseInt(e.target.value) })}
                              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-pink-500/10 border border-pink-500/30 rounded p-3">
                        <h3 className="text-pink-400 text-sm font-medium mb-3">Event Card Settings</h3>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-gray-300">Fade Position</span>
                              <span className="text-pink-400">{visualSettings.shadowFadePosition}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={visualSettings.shadowFadePosition}
                              onChange={(e) => saveVisualSettings({ ...visualSettings, shadowFadePosition: parseInt(e.target.value) })}
                              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-gray-300">Fade Intensity</span>
                              <span className="text-pink-400">{visualSettings.shadowFadeIntensity}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={visualSettings.shadowFadeIntensity}
                              onChange={(e) => saveVisualSettings({ ...visualSettings, shadowFadeIntensity: parseInt(e.target.value) })}
                              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-gray-300">Picture Opacity</span>
                              <span className="text-pink-400">{visualSettings.shadowOpacity}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={visualSettings.shadowOpacity}
                              onChange={(e) => saveVisualSettings({ ...visualSettings, shadowOpacity: parseInt(e.target.value) })}
                              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3">
                        <h3 className="text-purple-400 text-sm font-medium mb-3">Collection Card Settings</h3>
                        <p className="text-gray-500 text-[9px] mb-3">Vertical fade (top ↔ bottom)</p>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-gray-300">Fade Direction</span>
                              <span className="text-purple-400">{visualSettings.collectionFadeDirection === 'top' ? '↑ Top' : '↓ Bottom'}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveVisualSettings({ ...visualSettings, collectionFadeDirection: 'top' })}
                                className={`flex-1 py-1.5 rounded text-[10px] transition-all ${visualSettings.collectionFadeDirection === 'top' ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50' : 'bg-neutral-700 text-gray-400'}`}
                              >
                                ↑ Fade to Top
                              </button>
                              <button
                                onClick={() => saveVisualSettings({ ...visualSettings, collectionFadeDirection: 'bottom' })}
                                className={`flex-1 py-1.5 rounded text-[10px] transition-all ${visualSettings.collectionFadeDirection === 'bottom' ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50' : 'bg-neutral-700 text-gray-400'}`}
                              >
                                ↓ Fade to Bottom
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-gray-300">Fade Position</span>
                              <span className="text-purple-400">{visualSettings.collectionFadePosition}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={visualSettings.collectionFadePosition}
                              onChange={(e) => saveVisualSettings({ ...visualSettings, collectionFadePosition: parseInt(e.target.value) })}
                              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-gray-300">Fade Intensity</span>
                              <span className="text-purple-400">{visualSettings.collectionFadeIntensity}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={visualSettings.collectionFadeIntensity}
                              onChange={(e) => saveVisualSettings({ ...visualSettings, collectionFadeIntensity: parseInt(e.target.value) })}
                              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-gray-300">Picture Opacity</span>
                              <span className="text-purple-400">{visualSettings.collectionOpacity}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={visualSettings.collectionOpacity}
                              onChange={(e) => saveVisualSettings({ ...visualSettings, collectionOpacity: parseInt(e.target.value) })}
                              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setAdminMiniMode(true)}
                          className="flex-1 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded text-xs hover:bg-emerald-500/30"
                        >
                          🗗 Mini Window
                        </button>
                        <button
                          onClick={() => saveVisualSettings(defaultVisualSettings)}
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
                        id="admin-version"
                        defaultValue={activeBanners.version}
                        className="kuro-input text-[10px] py-1"
                      />
                      <input
                        type="number"
                        placeholder="Phase"
                        id="admin-phase"
                        defaultValue={activeBanners.phase}
                        className="kuro-input text-[10px] py-1"
                      />
                      <input
                        type="datetime-local"
                        placeholder="Start Date"
                        id="admin-start"
                        defaultValue={activeBanners.startDate?.slice(0, 16)}
                        className="kuro-input text-[10px] py-1"
                      />
                      <input
                        type="datetime-local"
                        placeholder="End Date"
                        id="admin-end"
                        defaultValue={activeBanners.endDate?.slice(0, 16)}
                        className="kuro-input text-[10px] py-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Featured Resonators (JSON)</h3>
                    <textarea
                      id="admin-chars"
                      className="kuro-input w-full h-32 text-[9px] font-mono"
                      defaultValue={JSON.stringify(activeBanners.characters, null, 2)}
                      placeholder="Paste characters array JSON"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-medium">Featured Weapons (JSON)</h3>
                    <textarea
                      id="admin-weaps"
                      className="kuro-input w-full h-32 text-[9px] font-mono"
                      defaultValue={JSON.stringify(activeBanners.weapons, null, 2)}
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
                            id={`admin-char-img-${i}`}
                            defaultValue={c.imageUrl || ''}
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
                            id={`admin-weap-img-${i}`}
                            defaultValue={w.imageUrl || ''}
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
                          id="admin-standard-char-img"
                          defaultValue={activeBanners.standardCharBannerImage || ''}
                          className="kuro-input flex-1 text-[10px] py-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Winter Brume</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          id="admin-standard-weap-img"
                          defaultValue={activeBanners.standardWeapBannerImage || ''}
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
                          id="admin-event-ww-img"
                          defaultValue={activeBanners.whimperingWastesImage || ''}
                          className="kuro-input flex-1 text-[10px] py-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Doubled Pawns</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          id="admin-event-dp-img"
                          defaultValue={activeBanners.doubledPawnsImage || ''}
                          className="kuro-input flex-1 text-[10px] py-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Tower of Adversity</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          id="admin-event-toa-img"
                          defaultValue={activeBanners.towerOfAdversityImage || ''}
                          className="kuro-input flex-1 text-[10px] py-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Illusive Realm</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          id="admin-event-ir-img"
                          defaultValue={activeBanners.illusiveRealmImage || ''}
                          className="kuro-input flex-1 text-[10px] py-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] w-28">Daily Reset</span>
                        <input
                          type="text"
                          placeholder="https://i.ibb.co/..."
                          id="admin-event-dr-img"
                          defaultValue={activeBanners.dailyResetImage || ''}
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
                          const chars = JSON.parse(document.getElementById('admin-chars').value);
                          const weaps = JSON.parse(document.getElementById('admin-weaps').value);
                          if (!Array.isArray(chars) || !Array.isArray(weaps)) throw new Error('Characters and weapons must be arrays');
                          if (chars.length === 0) throw new Error('At least one character required');
                          if (weaps.length === 0) throw new Error('At least one weapon required');
                          chars.forEach((c, i) => {
                            if (!c.id || !c.name) throw new Error(`Character ${i + 1} missing id or name`);
                            const imgInput = document.getElementById(`admin-char-img-${i}`);
                            if (imgInput) c.imageUrl = imgInput.value.trim();
                          });
                          weaps.forEach((w, i) => {
                            if (!w.id || !w.name) throw new Error(`Weapon ${i + 1} missing id or name`);
                            const imgInput = document.getElementById(`admin-weap-img-${i}`);
                            if (imgInput) w.imageUrl = imgInput.value.trim();
                          });
                          const startVal = document.getElementById('admin-start').value;
                          const endVal = document.getElementById('admin-end').value;
                          const startDate = new Date(startVal);
                          const endDate = new Date(endVal);
                          if (isNaN(startDate.getTime())) throw new Error('Invalid start date');
                          if (isNaN(endDate.getTime())) throw new Error('Invalid end date');
                          if (endDate <= startDate) throw new Error('End date must be after start date');
                          const standardCharImg = document.getElementById('admin-standard-char-img').value.trim();
                          const standardWeapImg = document.getElementById('admin-standard-weap-img').value.trim();
                          const wwImg = document.getElementById('admin-event-ww-img').value.trim();
                          const dpImg = document.getElementById('admin-event-dp-img').value.trim();
                          const toaImg = document.getElementById('admin-event-toa-img').value.trim();
                          const irImg = document.getElementById('admin-event-ir-img').value.trim();
                          const drImg = document.getElementById('admin-event-dr-img').value.trim();
                          const newBanners = {
                            ...activeBanners,
                            version: document.getElementById('admin-version').value || '1.0',
                            phase: parseInt(document.getElementById('admin-phase').value) || 1,
                            startDate: startDate.toISOString(),
                            endDate: endDate.toISOString(),
                            characters: chars,
                            weapons: weaps,
                            standardCharBannerImage: standardCharImg || '',
                            standardWeapBannerImage: standardWeapImg || '',
                            whimperingWastesImage: wwImg || '',
                            doubledPawnsImage: dpImg || '',
                            towerOfAdversityImage: toaImg || '',
                            illusiveRealmImage: irImg || '',
                            dailyResetImage: drImg || '',
                          };
                          saveCustomBanners(newBanners);
                          setShowAdminPanel(false);
                          setAdminUnlocked(false);
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
            </CardBody>
          </Card>
        </div>
      )}

      {/* Admin Mini Window */}
      {showAdminPanel && adminMiniMode && adminUnlocked && (
        <div 
          className={`fixed z-[9999] w-72 max-h-[50vh] overflow-auto rounded-xl border-2 border-cyan-500/50 bg-neutral-900/98 backdrop-blur-md shadow-2xl ${getMiniPanelPositionClasses()}`}
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
                {/* Position controls */}
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div />
                  <button onClick={() => updateEditingFraming({ y: getImageFraming(editingImage).y + 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs">▲</button>
                  <div />
                  <button onClick={() => updateEditingFraming({ x: getImageFraming(editingImage).x + 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs">◀</button>
                  <button onClick={resetEditingFraming} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-[8px]">Reset</button>
                  <button onClick={() => updateEditingFraming({ x: getImageFraming(editingImage).x - 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs">▶</button>
                  <div />
                  <button onClick={() => updateEditingFraming({ y: getImageFraming(editingImage).y - 2 })} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white text-xs">▼</button>
                  <div />
                </div>
                {/* Zoom controls */}
                <div className="flex gap-1 justify-center items-center">
                  <button onClick={() => updateEditingFraming({ zoom: getImageFraming(editingImage).zoom - 10 })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs">−</button>
                  <span className="px-2 py-1 text-white text-xs min-w-[50px] text-center">{getImageFraming(editingImage).zoom}%</span>
                  <button onClick={() => updateEditingFraming({ zoom: getImageFraming(editingImage).zoom + 10 })} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs">+</button>
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
            {/* Reset Button */}
            <button 
              onClick={() => saveVisualSettings(defaultVisualSettings)}
              className="w-full py-1.5 rounded text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
            >
              ↻ Reset All to Defaults
            </button>

            {/* Banner Card Settings */}
            <div className="space-y-2">
              <h4 className="text-cyan-400 text-[9px] font-medium uppercase tracking-wider">Featured Banners</h4>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Fade Pos</span>
                    <span className="text-cyan-400">{visualSettings.fadePosition}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.fadePosition} onChange={(e) => saveVisualSettings({ ...visualSettings, fadePosition: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Intensity</span>
                    <span className="text-cyan-400">{visualSettings.fadeIntensity}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.fadeIntensity} onChange={(e) => saveVisualSettings({ ...visualSettings, fadeIntensity: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Opacity</span>
                    <span className="text-cyan-400">{visualSettings.pictureOpacity}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.pictureOpacity} onChange={(e) => saveVisualSettings({ ...visualSettings, pictureOpacity: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                </div>
              </div>
            </div>

            {/* Standard Banner Settings */}
            <div className="space-y-2 border-t border-white/10 pt-2">
              <h4 className="text-emerald-400 text-[9px] font-medium uppercase tracking-wider">Standard Banners</h4>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Fade Pos</span>
                    <span className="text-emerald-400">{visualSettings.standardFadePosition}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.standardFadePosition || 50} onChange={(e) => saveVisualSettings({ ...visualSettings, standardFadePosition: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Intensity</span>
                    <span className="text-emerald-400">{visualSettings.standardFadeIntensity}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.standardFadeIntensity || 100} onChange={(e) => saveVisualSettings({ ...visualSettings, standardFadeIntensity: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Opacity</span>
                    <span className="text-emerald-400">{visualSettings.standardOpacity}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.standardOpacity || 100} onChange={(e) => saveVisualSettings({ ...visualSettings, standardOpacity: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
              </div>
            </div>

            {/* Event Card Settings */}
            <div className="space-y-2 border-t border-white/10 pt-2">
              <h4 className="text-pink-400 text-[9px] font-medium uppercase tracking-wider">Event Cards</h4>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Fade Pos</span>
                    <span className="text-pink-400">{visualSettings.shadowFadePosition}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.shadowFadePosition} onChange={(e) => saveVisualSettings({ ...visualSettings, shadowFadePosition: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Intensity</span>
                    <span className="text-pink-400">{visualSettings.shadowFadeIntensity}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.shadowFadeIntensity} onChange={(e) => saveVisualSettings({ ...visualSettings, shadowFadeIntensity: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Opacity</span>
                    <span className="text-pink-400">{visualSettings.shadowOpacity}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.shadowOpacity} onChange={(e) => saveVisualSettings({ ...visualSettings, shadowOpacity: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
              </div>
            </div>

            {/* Collection Card Settings */}
            <div className="space-y-2 border-t border-white/10 pt-2">
              <h4 className="text-purple-400 text-[9px] font-medium uppercase tracking-wider">Collection Cards</h4>
              <div className="flex gap-1 mb-1.5">
                <button onClick={() => saveVisualSettings({ ...visualSettings, collectionFadeDirection: 'top' })} className={`flex-1 py-1 rounded text-[8px] ${visualSettings.collectionFadeDirection === 'top' ? 'bg-purple-500/30 text-purple-400' : 'bg-neutral-700 text-gray-500'}`}>↑ Top</button>
                <button onClick={() => saveVisualSettings({ ...visualSettings, collectionFadeDirection: 'bottom' })} className={`flex-1 py-1 rounded text-[8px] ${visualSettings.collectionFadeDirection === 'bottom' ? 'bg-purple-500/30 text-purple-400' : 'bg-neutral-700 text-gray-500'}`}>↓ Bottom</button>
              </div>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Fade Pos</span>
                    <span className="text-purple-400">{visualSettings.collectionFadePosition}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.collectionFadePosition} onChange={(e) => saveVisualSettings({ ...visualSettings, collectionFadePosition: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Intensity</span>
                    <span className="text-purple-400">{visualSettings.collectionFadeIntensity}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.collectionFadeIntensity} onChange={(e) => saveVisualSettings({ ...visualSettings, collectionFadeIntensity: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-gray-400">Opacity</span>
                    <span className="text-purple-400">{visualSettings.collectionOpacity}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={visualSettings.collectionOpacity} onChange={(e) => saveVisualSettings({ ...visualSettings, collectionOpacity: parseInt(e.target.value) })} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                </div>
              </div>
            </div>
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
        <p className="text-gray-500 text-[9px]">
          <span onClick={handleAdminTap} className="cursor-pointer select-none" style={adminTapCount >= 3 ? { color: 'rgba(251,191,36,0.5)', transition: 'color 0.3s' } : undefined}>{`Whispering Wishes v${APP_VERSION}`}</span> • by u/WW_Andene • Not affiliated with Kuro Games • 
          <a href="mailto:whisperingwishes.app@gmail.com" className="text-gray-500 hover:text-yellow-400 transition-colors ml-1">Contact</a>
        </p>
      </footer>
    </div>
  );
}

// [SECTION:EXPORT]
export default function WhisperingWishes() {
  return (
    <PWAProvider>
      <ToastProvider>
        <WhisperingWishesInner />
      </ToastProvider>
    </PWAProvider>
  );
}
