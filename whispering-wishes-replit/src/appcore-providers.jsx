// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES v3.2.2 — appcore-providers.jsx
// PWA infrastructure, toast system, a11y hooks, onboarding, KuroStyles.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect, useRef, createContext, useContext, memo } from 'react';
import { Sparkles, Calculator, Upload, Target, BarChart3, X, LayoutGrid, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { APP_VERSION, haptic, generateUniqueId } from './appcore-data.js';

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
    const id = generateUniqueId();
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

// P12-FIX: Reusable modal wrapper with focus trapping + escape handling for inline modals (Step 11 audit — MEDIUM-6d)
const FocusTrapModal = ({ isOpen, onClose, ariaLabel, children, className = '', onClick }) => {
  const focusTrapRef = useFocusTrap(isOpen);
  useEscapeKey(isOpen, onClose);
  if (!isOpen) return null;
  return (
    <div 
      ref={focusTrapRef}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// [SECTION:ONBOARDING]
const OnboardingModal = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  // P12-FIX: Add focus trapping and escape key support to onboarding modal (Step 11 audit — MEDIUM-6a)
  const focusTrapRef = useFocusTrap(true);
  useEscapeKey(true, onComplete);
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
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/90" role="dialog" aria-modal="true" aria-label="Welcome to Whispering Wishes" ref={focusTrapRef}>
      <div className={`relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-r ${s.gradient} w-full max-w-xs`} style={{ backgroundColor: 'rgba(12, 16, 24, 0.12)', backdropFilter: 'blur(6px)', zIndex: 5 }}>
        {/* Decorative gradient circles */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none" aria-hidden="true">
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full ${s.bg} blur-2xl opacity-40`} />
          <div className={`absolute right-12 top-1/4 w-10 h-10 rounded-full ${s.bg} blur-xl opacity-25`} />
        </div>
        
        {/* Skip button - always white */}
        <button onClick={onComplete} className="absolute top-3 right-3 z-20 text-[11px] min-h-[44px] min-w-[44px] px-3 py-2 rounded text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center" style={{background:'rgba(255,255,255,0.05)'}}>Skip</button>
        
        {/* Content */}
        <div className="relative z-10 p-5 pt-8 text-center" aria-live="polite" aria-atomic="true">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${s.bg} border ${s.border} mb-3`} style={{color: s.color}}>
            {s.icon}
          </div>
          <h4 className="font-bold text-sm text-gray-200 mb-1">{s.title}</h4>
          <p className="text-gray-400 text-[10px]">{s.desc}</p>
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 pb-3" role="group" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === step ? s.bg : 'bg-white/10'}`} style={{ width: i === step ? '14px' : '5px' }} aria-hidden="true" />
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

// [SECTION:STYLES]
// P11-FIX: Wrapped in memo — this component injects ~960 lines of CSS; re-rendering it on every
// parent render is wasteful. Only needs to re-render when oledMode changes. (Step 7 audit — MEDIUM-3a)
const KuroStyles = memo(({ oledMode }) => (
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
    /* P12-FIX: Safe area insets for notched/dynamic-island devices — viewport-fit=cover
       is set in the meta tag but no padding was applied (Step 12 audit — MEDIUM-12j) */
    @supports (padding-top: env(safe-area-inset-top)) {
      body {
        /* Top/bottom safe areas handled by sticky header and main content respectively */
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
      }
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
      /* P10-FIX: Ensure all standalone buttons meet minimum 36px touch target on touch devices (Step 10 audit — MEDIUM-5b) */
      .kuro-body button:not(.kuro-btn):not([role="tab"]) {
        min-height: 36px;
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
      background: var(--bg-card-inner);
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
      background: var(--bg-input);
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
      }
    }
    
    .kuro-input:focus-visible {
      outline: none;
      border-color: rgba(var(--color-gold), 0.6);
      box-shadow: 0 0 0 3px rgba(var(--color-gold), 0.1), 0 0 20px rgba(var(--color-gold), 0.08);
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
    /* P12-FIX: Firefox slider hover states + range-track (Step 12 audit — MEDIUM-12k) */
    .kuro-slider::-moz-range-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 0 18px rgba(251, 191, 36, 0.8);
    }
    .kuro-slider::-moz-range-track {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 3px;
      height: 6px;
      border: none;
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
      -webkit-mask-image: -webkit-radial-gradient(white, black);
      /* P12-FIX: Standard mask-image for Firefox support (Step 12 audit — LOW-12l) */
      mask-image: radial-gradient(white, black);
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
    
    /* ═══ REDUCED MOTION — handled by user Animations toggle ═══ */
    
    /* ═══ USER TOGGLE: NO ANIMATIONS ═══ */
    .no-animations *, .no-animations *::before, .no-animations *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    /* P11-FIX: Respect OS-level reduced motion preference immediately (before JS hydrates).
       The JS check (animationsEnabled) handles canvas; this handles CSS animations. (Step 7 audit — MEDIUM-3g) */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
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
));
KuroStyles.displayName = 'KuroStyles';

export {
  PWAProvider, ToastContext, ToastProvider, useToast,
  useFocusTrap, useEscapeKey, FocusTrapModal,
  OnboardingModal, KuroStyles,
};
