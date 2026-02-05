import React, { useState, useMemo, useCallback, useReducer, useEffect, useRef, createContext, useContext, memo } from 'react';
import { Sparkles, Swords, Sword, Star, Calculator, User, Calendar, TrendingUp, Upload, Download, RefreshCcw, Plus, Minus, Check, Target, BarChart3, Zap, BookmarkPlus, X, ChevronDown, LayoutGrid, Archive, Info, CheckCircle, AlertCircle, Settings, Monitor, Smartphone, Gamepad2 } from 'lucide-react';
import { XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES v2.9.28 - Wuthering Waves Convene Companion
// ═══════════════════════════════════════════════════════════════════════════════
//
// [SECTION INDEX] - Use: grep -n "SECTION:" filename.jsx
// ─────────────────────────────────────────────────────────────────────────────
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
// [SECTION:STATIC_DATA]  - Static collection data (images, release orders)
// [SECTION:MAINAPP]      - Main app component
// [SECTION:EXPORT]       - Main export
// ─────────────────────────────────────────────────────────────────────────────

// [SECTION:PWA]
// PWA Support - Manifest, Service Worker, Install Prompt

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
const CACHE_NAME = 'whispering-wishes-v2921';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
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
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      const swBlob = new Blob([SERVICE_WORKER_CODE], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(swBlob);
      
      navigator.serviceWorker.register(swUrl, { scope: '/' })
        .then((registration) => {
          setSwRegistration(registration);
          console.log('SW registered:', registration.scope);
          
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
        .catch((err) => console.log('SW registration failed:', err));
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      URL.revokeObjectURL(manifestUrl);
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
              className="p-1 text-black/50 hover:text-black"
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
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  
  return (
    <ToastContext.Provider value={{ addToast }}>
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
      <div className={`relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-r ${s.gradient}`} style={{ width:'100%', maxWidth:'320px', backgroundColor: 'rgba(12, 16, 24, 0.12)', backdropFilter: 'blur(6px)', position: 'relative', zIndex: 5 }}>
        {/* Decorative gradient circles */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full ${s.bg} blur-2xl opacity-40`} />
          <div className={`absolute right-12 top-1/4 w-10 h-10 rounded-full ${s.bg} blur-xl opacity-25`} />
        </div>
        
        {/* Skip button - always white */}
        <button onClick={onComplete} className="absolute top-3 right-3 z-20 text-[9px] px-3 py-1 rounded text-gray-400 hover:text-gray-300" style={{background:'rgba(255,255,255,0.05)'}}>Skip</button>
        
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
              <button onClick={() => setStep(step - 1)} className="text-[9px] px-3 py-1 rounded text-gray-400" style={{background:'rgba(255,255,255,0.05)'}}>Back</button>
            )}
          </div>
          <div>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="text-[9px] px-3 py-1 rounded text-gray-400" style={{background:'rgba(255,255,255,0.05)'}}>Next</button>
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
const KuroStyles = () => (
  <style>{`
    /* ══════════════════════════════════════════════════════════════════════
       LAHAI-ROI DESIGN LANGUAGE - Black, White, Gold
       ══════════════════════════════════════════════════════════════════════ */
    
    /* Global - prevent white flash, hide scrollbars on mobile */
    html, body {
      background: #0a0a0a;
      margin: 0;
      padding: 0;
      overscroll-behavior: none;
    }
    
    /* ═══ CSS CUSTOM PROPERTIES ═══ */
    :root {
      --color-gold: 251, 191, 36;
      --color-pink: 236, 72, 153;
      --color-cyan: 34, 211, 238;
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
    }
    
    /* Hide scrollbar globally on mobile */
    * {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    *::-webkit-scrollbar {
      display: none;
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
    }
    
    /* Collection card hover lift */
    .collection-card {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .collection-card:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 12px 24px rgba(0,0,0,0.4);
    }
    
    .collection-card:active {
      transform: translateY(-2px) scale(1.01);
    }
    
    /* Glow effect for 5-star items */
    .glow-gold {
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.15), 0 4px 12px rgba(0,0,0,0.3);
    }
    
    .glow-gold:hover {
      box-shadow: 0 0 30px rgba(251, 191, 36, 0.25), 0 8px 20px rgba(0,0,0,0.4);
    }
    
    .glow-purple {
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.15), 0 4px 12px rgba(0,0,0,0.3);
    }
    
    .glow-purple:hover {
      box-shadow: 0 0 30px rgba(168, 85, 247, 0.25), 0 8px 20px rgba(0,0,0,0.4);
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
      font-family: 'Geist Mono', monospace;
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
    
    /* ═══ PULL LOG BORDER ═══ */
    .pull-log-row {
      border-left: 3px solid var(--pity-color);
      transition: background 0.2s ease;
    }
    .pull-log-row:hover {
      background: rgba(255,255,255,0.08) !important;
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
      background: rgba(12, 16, 24, 0.55);
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
    
    .kuro-card:hover {
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.06),
        0 0 40px rgba(var(--color-gold), 0.03),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
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
      top: 10px;
      right: 10px;
      width: 16px;
      height: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0 6px 0 0;
      z-index: 2;
      opacity: 0.8;
    }
    
    .kuro-card-inner::after {
      content: '';
      position: absolute;
      bottom: 10px;
      left: 10px;
      width: 16px;
      height: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0 0 0 6px;
      z-index: 2;
      opacity: 0.8;
    }
    
    .kuro-header {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.02) 100%);
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
      padding: 18px;
      color: #e2e8f0;
    }
    
    /* ═══ BUTTONS - Glassy style with bright text ═══ */
    .kuro-btn {
      position: relative;
      background: rgba(15, 20, 28, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px;
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
    
    .kuro-btn:hover {
      border-color: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .kuro-btn:hover::before {
      opacity: 1;
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
    
    .kuro-input:hover {
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(12, 16, 24, 0.85);
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
      background: rgba(12, 16, 22, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 14px;
      text-align: center;
      overflow: hidden;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
    }
    
    .kuro-stat:hover {
      transform: translateY(-1px);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
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
    .kuro-stat-gold:hover {
      border-color: rgba(240, 192, 64, 0.7);
      box-shadow: 0 4px 20px rgba(240, 192, 64, 0.15);
    }
    .kuro-stat-gold::before {
      background: linear-gradient(90deg, transparent, rgba(240, 192, 64, 1), transparent);
    }
    
    .kuro-stat-cyan {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.5);
    }
    .kuro-stat-cyan:hover {
      border-color: rgba(56, 189, 248, 0.7);
      box-shadow: 0 4px 20px rgba(56, 189, 248, 0.15);
    }
    .kuro-stat-cyan::before {
      background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 1), transparent);
    }
    
    .kuro-stat-purple {
      background: rgba(168, 85, 247, 0.15);
      border-color: rgba(168, 85, 247, 0.5);
    }
    .kuro-stat-purple:hover {
      border-color: rgba(168, 85, 247, 0.7);
      box-shadow: 0 4px 20px rgba(168, 85, 247, 0.15);
    }
    .kuro-stat-purple::before {
      background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 1), transparent);
    }
    
    .kuro-stat-emerald {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.5);
    }
    .kuro-stat-emerald:hover {
      border-color: rgba(34, 197, 94, 0.7);
      box-shadow: 0 4px 20px rgba(34, 197, 94, 0.15);
    }
    .kuro-stat-emerald::before {
      background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 1), transparent);
    }
    
    .kuro-stat-red {
      background: rgba(248, 113, 113, 0.15);
      border-color: rgba(248, 113, 113, 0.5);
    }
    .kuro-stat-red:hover {
      border-color: rgba(248, 113, 113, 0.7);
      box-shadow: 0 4px 20px rgba(248, 113, 113, 0.15);
    }
    .kuro-stat-red::before {
      background: linear-gradient(90deg, transparent, rgba(248, 113, 113, 1), transparent);
    }
    
    /* ═══ STAT PINK (NEW) ═══ */
    .kuro-stat-pink {
      background: rgba(236, 72, 153, 0.15);
      border-color: rgba(236, 72, 153, 0.5);
    }
    .kuro-stat-pink:hover {
      border-color: rgba(236, 72, 153, 0.7);
      box-shadow: 0 4px 20px rgba(236, 72, 153, 0.15);
    }
    .kuro-stat-pink::before {
      background: linear-gradient(90deg, transparent, rgba(236, 72, 153, 1), transparent);
    }
    
    /* ═══ LABELS - Bright for readability ═══ */
    .kuro-label {
      color: #e2e8f0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
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
    .collection-card:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
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
// [SECTION:SERVERS]
// Each server has its own timezone for daily/weekly resets (04:00 local)
// Source: https://wuwatracker.com/timeline
const SERVERS = {
  'Asia': { name: 'Asia', timezone: 'Asia/Shanghai', utcOffset: 8, resetHour: 4 },
  'America': { name: 'America', timezone: 'America/New_York', utcOffset: -5, resetHour: 4 },
  'Europe': { name: 'Europe', timezone: 'Europe/Paris', utcOffset: 1, resetHour: 4 },
  'SEA': { name: 'SEA', timezone: 'Asia/Singapore', utcOffset: 8, resetHour: 4 },
  'HMT': { name: 'HMT', timezone: 'Asia/Hong_Kong', utcOffset: 8, resetHour: 4 },
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
    { id: 'chisa', name: 'Chisa', title: 'Snowfield Melody', element: 'Glacio', weaponType: 'Sword', isNew: false, featured4Stars: ['Mortefi', 'Yangyang', 'Taoqi'], imageUrl: 'https://i.ibb.co/KcYh2QNC/vvcistuu87vf1.jpg' },
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
  'Aemeath': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'New 5★ Fusion Sword DPS from Roya Frostlands. High damage aerial combos.',
    skills: ['Blazing Strike', 'Ember Dance', 'Infernal Bloom', 'Starfire Mode'],
    ascension: { boss: 'Rage Tacet Core', common: 'Ring', specialty: 'Lanternberry' },
    bestEchoes: ['Inferno Rider', 'Molten Rift 4pc'], bestWeapon: 'Everbright Polestar',
    teams: ['Aemeath + Changli + Shorekeeper', 'Aemeath + Mortefi + Verina'] },
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
const HARD_PITY = 80, SOFT_PITY_START = 66, AVG_PITY = 62.5;

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
  const serverOffset = SERVERS[server]?.utcOffset ?? EUROPE_OFFSET;
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
  const serverOffset = SERVERS[server]?.utcOffset ?? 1; // Default to Europe
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
  const serverOffset = SERVERS[server]?.utcOffset ?? 1; // Default to Europe
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
const simulateGacha = (pulls, pity, guaranteed, type, target) => {
  const results = Array(target + 1).fill(0);
  const runs = 10000;
  for (let s = 0; s < runs; s++) {
    let p = pity, g = guaranteed, r = pulls, c = 0;
    while (r > 0 && c < target) {
      p++; r--;
      let rate = 0.008;
      if (p >= SOFT_PITY_START) rate = Math.min(0.008 + (p - SOFT_PITY_START + 1) * 0.055, 1.0);
      if (p >= HARD_PITY) rate = 1.0;
      if (Math.random() < rate) {
        if (type === 'char') {
          // Character banner: 50/50 system
          if (g || Math.random() < 0.5) { c++; g = false; } else g = true;
        } else {
          // Weapon banner: 100% featured when you get 5★
          c++;
        }
        p = 0;
      }
    }
    results[Math.min(c, target)]++;
  }
  return results.map(n => (n / runs) * 100);
};

const factorial = (n) => {
  if (n <= 1) return 1;
  if (n <= 20) {
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }
  // Stirling's approximation for n > 20 (avoids overflow)
  return Math.sqrt(2 * Math.PI * n) * Math.pow(n / Math.E, n);
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
  },
  planner: {
    dailyAstrite: 60, luniteActive: false,
    goalType: '5star', goalBanner: 'featuredChar', goalTarget: 1, goalPulls: 80, goalModifier: 1,
    goal4StarTarget: 1, goal4StarType: 'featured',
    addedIncome: [],
  },
  bookmarks: [],
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

const loadFromStorage = async () => {
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
    };
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
};

const saveToStorage = async (state) => {
  if (!storageAvailable) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Save failed:', e);
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_SERVER': return { ...state, server: action.server };
    case 'SET_CALC': return { ...state, calc: { ...state.calc, [action.field]: action.value } };
    case 'SET_PLANNER': return { ...state, planner: { ...state.planner, [action.field]: action.value } };
    case 'SET_SETTINGS': return { ...state, settings: { ...state.settings, [action.field]: action.value } };
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
  // Character: 50/50 means avg ~93.75 pulls per featured (1.5x), guaranteed means avg ~62.5
  // Weapon: 100% featured rate, avg ~62.5 pulls per 5★
  const avgForFeatured = isChar ? (guaranteed ? AVG_PITY : AVG_PITY * 1.5) : AVG_PITY;
  const lambda = effective / avgForFeatured;
  
  const poisson = (n) => {
    if (lambda <= 0) return 0;
    // CDF complement: P(X >= n) using Poisson
    let prob = 0;
    for (let k = n; k <= Math.max(n + 20, Math.ceil(lambda * 3)); k++) {
      prob += (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
    }
    return Math.min(100, Math.max(0, prob * 100));
  };
  
  // Worst case: hard pity every time, always losing 50/50
  const worstCase = HARD_PITY * copies * (isChar && !guaranteed ? 2 : 1);
  const successRate = effective >= worstCase ? 100 : poisson(copies);
  const missingPulls = Math.max(0, worstCase - effective);
  
  // 4-star calculations
  const fourStarCount = Math.floor(effective / HARD_PITY_4STAR);
  const featuredFourStarCount = Math.floor(fourStarCount * FEATURED_4STAR_RATE);
  const pity4 = effective % HARD_PITY_4STAR;
  
  return {
    successRate: successRate.toFixed(1),
    p1: poisson(1).toFixed(1),
    p2: poisson(2).toFixed(1),
    p3: poisson(3).toFixed(1),
    p4: poisson(4).toFixed(1),
    p5: poisson(5).toFixed(1),
    p6: poisson(6).toFixed(1),
    missingPulls,
    missingAstrite: missingPulls * 160,
    fourStarCount,
    featuredFourStarCount,
    pity4,
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
  Havoc: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50' },
  Spectro: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
};

const BANNER_GRADIENT_MAP = {
  Fusion: { border: 'border-orange-500/40', bg: 'bg-orange-500/20', text: 'text-orange-400' },
  Electro: { border: 'border-purple-500/40', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  Aero: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  Glacio: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  Havoc: { border: 'border-pink-500/40', bg: 'bg-pink-500/20', text: 'text-pink-400' },
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
const CardHeader = memo(({ children, action }) => <div className="kuro-header" style={{position:'relative'}}><h3>{children}</h3>{action && <div style={{position:'relative', zIndex:10}}>{action}</div>}</div>);
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
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
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all">
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
          <div className="grid grid-cols-2 gap-3">
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
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
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all">
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
      onClick={onClick} 
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
  if (time.expired && !alwaysShow) return <span className="text-red-400 text-xs font-bold">ENDED</span>;
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
      <div className="rounded-lg px-2 py-1 text-center border border-white/10" style={{backgroundColor: 'rgba(12,16,24,0.7)', backdropFilter: 'blur(8px)', borderColor: `${color === 'yellow' ? 'rgba(251,191,36,0.2)' : color === 'pink' ? 'rgba(244,114,182,0.2)' : 'rgba(34,211,238,0.2)'}`}}><div className={`font-bold text-sm kuro-number ${textColor}`}>{String(time.seconds).padStart(2,'0')}</div><div className="text-gray-400 text-[7px] uppercase tracking-wider">Sec</div></div>
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
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className={isSoftPity ? 'pulse-subtle' : ''}>
        <circle className="pity-ring-track" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} />
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
const BackgroundGlow = () => {
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
    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < 66) return;
      lastFrame = t;
      const time = t * 0.001;
      bctx.fillStyle = 'rgb(2,3,6)';
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
    };
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{zIndex: 1}} />;
};

// LAYER B: Triangle wave mask — traveling wavefront specular, z-index 2
const TriangleMirrorWave = () => {
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
    const draw = (t) => {
      animId = requestAnimationFrame(draw);
      if (t - lastFrame < 66) return;
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
    };
  }, []);
  
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
    <div className={`relative overflow-hidden rounded-xl border ${style.border}`} style={{ height: '190px', isolation: 'isolate', position: 'relative', zIndex: 5 }}>
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
          crossOrigin="anonymous"
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
                  <div className="text-gray-300 text-[8px] mt-0.5">5★ Pity</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-sm">{stats.pity4}<span className="text-gray-500 text-[9px]">/10</span></div>
                  <div className="text-gray-300 text-[8px] mt-0.5">4★ Pity</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm">{stats.totalPulls}</div>
                  <div className="text-gray-300 text-[8px] mt-0.5">Convenes</div>
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

const EventCard = memo(({ event, server, bannerImage, visualSettings }) => {
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
    // Auto-refresh on expiry for daily, weekly, and recurring events
    if (isDaily || isWeekly || isRecurring) setResetTick(t => t + 1);
  }, [isDaily, isWeekly, isRecurring]);
  
  // Instant rollover function for CountdownTimer — avoids "ENDED" flash
  const recalcFn = useMemo(() => {
    if (isDaily) return () => getNextDailyReset(server);
    if (isWeekly) return () => getNextWeeklyReset(server);
    if (isRecurring) return () => getRecurringEventEnd(event.currentEnd, event.resetType, server);
    return null;
  }, [isDaily, isWeekly, isRecurring, server, event]);
  
  const colors = EVENT_ACCENT_COLORS[event.accentColor] || EVENT_ACCENT_COLORS.cyan;
  const imgUrl = bannerImage;
  
  // Use unified mask generator with shadow (event) settings
  const maskGradient = visualSettings 
    ? generateMaskGradient(visualSettings.shadowFadePosition, visualSettings.shadowFadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.shadowOpacity / 100 : 0.9;
  
  return (
    <div className={`relative overflow-hidden rounded-xl border ${colors.border}`} style={{ height: '190px', isolation: 'isolate', position: 'relative', zIndex: 5 }}>
      {imgUrl && (
        <img 
          src={imgUrl} 
          alt={event.name} 
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            zIndex: 1,
            opacity: pictureOpacity,
            maskImage: maskGradient,
            WebkitMaskImage: maskGradient
          }}
          loading="eager"
          crossOrigin="anonymous"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      
      <div className="relative z-10 p-3 flex flex-col justify-between h-full" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' }}>
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h4 className={`font-bold text-sm ${colors.text}`}>{event.name}</h4>
            <p className="text-gray-200 text-[10px]">{event.subtitle}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-gray-200 text-[9px] mb-1">{isDaily ? 'Resets in' : isWeekly ? 'Weekly reset' : 'Ends in'}</div>
            <CountdownTimer endDate={endDate} color={event.color} alwaysShow={isDaily || isWeekly || isRecurring} onExpire={handleExpire} recalcFn={recalcFn} />
          </div>
        </div>
        
        <div className="flex justify-between items-end mt-auto">
          <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text} backdrop-blur-sm`}>
            {event.rewards}
          </div>
          <div className="text-gray-200 text-[9px]">
            {event.resetType}
          </div>
        </div>
      </div>
    </div>
  );
});
EventCard.displayName = 'EventCard';

const ProbabilityBar = ({ label, value, color = 'cyan' }) => (
  <div className="flex items-center gap-2">
    <span className="text-gray-300 text-[10px] w-12">{label}</span>
    <div className="flex-1 h-5 bg-neutral-800 rounded overflow-hidden">
      <div className={`h-full ${color === 'cyan' ? 'bg-cyan-500' : color === 'pink' ? 'bg-pink-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-yellow-500'} transition-all flex items-center justify-end pr-1`} style={{ width: `${Math.max(value, 1)}%` }}>
        {value > 10 && <span className="text-[9px] text-black font-bold">{value}%</span>}
      </div>
    </div>
    {value <= 10 && <span className="text-[10px] text-gray-300 w-10">{value}%</span>}
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
  'Everbright Polestar': 'https://i.ibb.co/tTDkFQ7W/Starfield-Calibrator.webp', // TODO: replace with real Everbright Polestar image
  "Daybreaker's Spine": 'https://i.ibb.co/tTDkFQ7W/Starfield-Calibrator.webp', // TODO: replace with real Daybreaker's Spine image
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
    collectionZoom: 120
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
  const refreshImages = useCallback(() => setImageCacheBuster(String(Date.now())), []);
  
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
    loadFromStorage().then(savedState => {
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
    });
  }, []);
  
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
  const [trackerCategory, setTrackerCategory] = useState('character');
  const [importPlatform, setImportPlatform] = useState(null);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkName, setBookmarkName] = useState('');
  const [showIncomePanel, setShowIncomePanel] = useState(false);
  const [chartRange, setChartRange] = useState('monthly');
  const [chartOffset, setChartOffset] = useState(9999);
  const [detailModal, setDetailModal] = useState({ show: false, type: null, name: null, imageUrl: null });

  const setCalc = useCallback((f, v) => dispatch({ type: 'SET_CALC', field: f, value: v }), []);

  // Calculate pulls for each banner type - Note: Featured does NOT include Lustrous
  const charPulls = useMemo(() => Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.radiant || 0), [state.calc.astrite, state.calc.radiant]);
  const weapPulls = useMemo(() => Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.forging || 0), [state.calc.astrite, state.calc.forging]);
  const stdCharPulls = useMemo(() => Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.lustrous || 0), [state.calc.astrite, state.calc.lustrous]);
  const stdWeapPulls = useMemo(() => Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.lustrous || 0), [state.calc.astrite, state.calc.lustrous]);
  
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

  const handleFileImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const pulls = data.pulls || data.conveneHistory || data.history || [];
        
        // List of known standard 5★ characters (for 50/50 calculation)
        // These are the characters you can lose 50/50 to on featured banner
        const standard5Stars = ['Verina', 'Jianxin', 'Lingyang', 'Calcharo', 'Encore'];
        
        const convert = (arr, type) => {
          const filtered = arr.filter(p => {
            const poolType = p.cardPoolType || p.gachaType;
            if (type === 'featured') return p.bannerType === 'featured' || p.bannerType === 'character' || poolType === 1;
            if (type === 'weapon') return p.bannerType === 'weapon' || poolType === 2;
            if (type === 'standardChar') return p.bannerType === 'standard-char' || poolType === 3;
            if (type === 'standardWeap') return p.bannerType === 'standard-weapon' || poolType === 4;
            if (type === 'beginner') return p.bannerType === 'beginner' || poolType === 5 || poolType === 6;
            return false;
          });
          
          // Sort by timestamp (oldest first) to calculate pity correctly
          filtered.sort((a, b) => new Date(a.time || a.timestamp) - new Date(b.time || b.timestamp));
          
          let pityCounter = 0;
          let lastWasLost = false; // Track if last 5★ was a loss (for guarantee)
          
          return filtered.map((p, i) => {
            pityCounter++;
            const rarity = p.rarity || p.qualityLevel || 4;
            const name = p.name || p.resourceName || '';
            
            let won5050 = undefined;
            let pity = pityCounter;
            
            if (rarity === 5) {
              // For featured banner, check if won or lost 50/50
              if (type === 'featured') {
                const isStandard = standard5Stars.some(s => name.toLowerCase().includes(s.toLowerCase()));
                if (lastWasLost) {
                  // This was a guaranteed pull
                  won5050 = null; // Guaranteed, not a 50/50
                  lastWasLost = false;
                } else {
                  // This was a 50/50
                  won5050 = !isStandard;
                  lastWasLost = isStandard;
                }
              }
              pityCounter = 0; // Reset pity after 5★
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
            let currentPity4 = 0;
            for (let i = history.length - 1; i >= 0; i--) {
              if (history[i].rarity === 5) break;
              currentPity5++;
            }
            for (let i = history.length - 1; i >= 0; i--) {
              if (history[i].rarity >= 4) break;
              currentPity4++;
            }
            const fiveStars = history.filter(p => p.rarity === 5);
            const lastFive = fiveStars[fiveStars.length - 1];
            const guaranteed = type === 'featured' && lastFive?.won5050 === false;
            dispatch({ type: 'IMPORT_HISTORY', bannerType: type, history, pity5: currentPity5, pity4: currentPity4, guaranteed, uid: data.uid || data.playerId });
            totalImported += history.length;
          }
        });
        toast?.addToast?.(`Imported ${totalImported} Convenes!`, 'success');
      } catch (err) { toast?.addToast?.('Import failed: ' + err.message, 'error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [toast]);

  // Export data
  const handleExport = useCallback(() => {
    const data = { timestamp: new Date().toISOString(), version: '2.9.6', state };
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
  const handleAdminTap = useCallback(() => {
    if (adminTapTimerRef.current) clearTimeout(adminTapTimerRef.current);
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
      if (password === 'ADN3699@WW_ANDENE') {
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


  // Verify admin password
  const verifyAdminPassword = useCallback(() => {
    if (!adminPassword || adminPassword.length < 4) {
      toast?.addToast?.('Password must be at least 4 characters', 'error');
      return;
    }
    if (!storedAdminPass) {
      if (storageAvailable) {
        try { localStorage.setItem(ADMIN_PASS_KEY, adminPassword); } catch {}
      }
      setStoredAdminPass(adminPassword);
      setAdminUnlocked(true);
      toast?.addToast?.('Admin password set!', 'success');
    } else if (adminPassword === storedAdminPass) {
      setAdminUnlocked(true);
    } else {
      toast?.addToast?.('Incorrect password', 'error');
    }
  }, [adminPassword, storedAdminPass, toast]);

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
    <div className="bg-neutral-950">
      <BackgroundGlow />
      <TriangleMirrorWave />
      <KuroStyles />
      
      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10" style={{backgroundColor: 'rgba(8, 12, 18, 0.92)', backdropFilter: 'blur(20px)'}}>
        <div className="max-w-lg mx-auto px-3">
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
              <select value={state.server} onChange={e => dispatch({ type: 'SET_SERVER', server: e.target.value })} aria-label="Select server region" className="text-gray-300 text-[10px] px-2 py-1.5 rounded-lg border border-white/10 focus:border-yellow-500/50 focus:outline-none transition-all" style={{backgroundColor: 'rgba(15, 20, 28, 0.9)'}}>
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

      <main className="max-w-lg mx-auto px-3 pt-3 pb-4 space-y-3 w-full">
        
        {/* [SECTION:TAB-TRACKER] */}
        {activeTab === 'tracker' && (
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3 tab-content">
            <TabBackground id="tracker" glowColor="gold" />

            {/* Category Tabs */}
            <Card>
              <CardBody>
                <div className="flex gap-2">
                  {[['character', 'Resonators', 'yellow'], ['weapon', 'Weapons', 'pink'], ['standard', 'Standard', 'cyan']].map(([key, label, color]) => (
                    <button key={key} onClick={() => setTrackerCategory(key)} className={`kuro-btn flex-1 ${trackerCategory === key ? (color === 'yellow' ? 'active-gold' : color === 'pink' ? 'active-pink' : 'active-cyan') : ''}`}>
                      {key === 'character' ? <Sparkles size={12} className="inline mr-1" /> : key === 'weapon' ? <Swords size={12} className="inline mr-1" /> : <Star size={12} className="inline mr-1" />}
                      {label}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <div className="flex items-center justify-between text-gray-300 text-[10px]" style={{position: 'relative', zIndex: 5}}>
              <span>v{activeBanners.version} Phase {activeBanners.phase} • {state.server}</span>
              <CountdownTimer endDate={bannerEndDate} color={trackerCategory === 'weapon' ? 'pink' : 'yellow'} />
            </div>
            
            {new Date() > new Date(bannerEndDate) && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center" style={{position: 'relative', zIndex: 5}}>
                <p className="text-yellow-400 text-xs font-medium">Banner period ended</p>
                <p className="text-gray-400 text-[10px] mt-1">New banners are now live in-game. App update coming soon!</p>
              </div>
            )}

            {trackerCategory === 'character' && (
              <div className="space-y-2" style={{position: 'relative', zIndex: 5}}>
                {activeBanners.characters.map(c => <BannerCard key={c.id} item={c} type="character" bannerImage={activeBanners.characterBannerImage} stats={state.profile.featured.history.length ? { pity5: state.profile.featured.pity5, pity4: state.profile.featured.pity4, totalPulls: state.profile.featured.history.length, guaranteed: state.profile.featured.guaranteed } : null} visualSettings={visualSettings} />)}
              </div>
            )}

            {trackerCategory === 'weapon' && (
              <div className="space-y-2" style={{position: 'relative', zIndex: 5}}>
                {activeBanners.weapons.map(w => <BannerCard key={w.id} item={w} type="weapon" bannerImage={activeBanners.weaponBannerImage} stats={state.profile.weapon.history.length ? { pity5: state.profile.weapon.pity5, pity4: state.profile.weapon.pity4, totalPulls: state.profile.weapon.history.length } : null} visualSettings={visualSettings} />)}
              </div>
            )}

            {trackerCategory === 'standard' && (
              <div className="space-y-3" style={{position: 'relative', zIndex: 5}}>
                <div className="text-gray-300 text-xs uppercase tracking-wider" style={{position: 'relative', zIndex: 5}}>Permanent Banners</div>
                
                {/* Standard Resonator Banner */}
                {(() => {
                  const stdMask = generateMaskGradient(visualSettings.standardFadePosition || 50, visualSettings.standardFadeIntensity || 100);
                  const stdOpacity = (visualSettings.standardOpacity || 100) / 100;
                  return (
                    <div className="relative overflow-hidden rounded-xl border border-cyan-500/30" style={{ height: '190px', isolation: 'isolate', position: 'relative', zIndex: 5 }}>
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
                          crossOrigin="anonymous"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="relative z-10 p-3 flex flex-col justify-between h-full" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' }}>
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-sm text-cyan-400">Tidal Chorus</h3>
                            <span className="text-gray-200 text-[10px]">Standard Resonator</span>
                          </div>
                          <div className="text-gray-200 text-[9px] mb-1">Available 5★</div>
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
                                  <div className="text-gray-300 text-[8px] mt-0.5">5★ Pity</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-purple-400 font-bold text-sm">{state.profile.standardChar.pity4}<span className="text-gray-500 text-[9px]">/10</span></div>
                                  <div className="text-gray-300 text-[8px] mt-0.5">4★ Pity</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-white font-bold text-sm">{state.profile.standardChar.history.length}</div>
                                  <div className="text-gray-300 text-[8px] mt-0.5">Convenes</div>
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
                    <div className="relative overflow-hidden rounded-xl border border-purple-500/30" style={{ height: '190px', isolation: 'isolate', position: 'relative', zIndex: 5 }}>
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
                          crossOrigin="anonymous"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="relative z-10 p-3 flex flex-col justify-between h-full" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)' }}>
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-sm text-purple-400">Winter Brume</h3>
                            <span className="text-gray-200 text-[10px]">Standard Weapon</span>
                          </div>
                          <div className="text-gray-200 text-[9px] mb-1">Available 5★</div>
                          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
                            {activeBanners.standardWeapons.map(w => <span key={w.name} className="text-[9px] text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">{w.name}</span>)}
                          </div>
                        </div>
                        {state.profile.standardWeap?.history?.length > 0 && (
                          <div className="pt-2.5 mt-1 border-t border-white/15" style={{background: 'linear-gradient(to top, rgba(8,12,20,0.85) 60%, transparent)', margin: '0 -12px -12px', padding: '10px 12px 12px', borderRadius: '0 0 12px 12px'}}>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 flex items-center gap-3">
                                <div className="text-center">
                                  <div className="text-purple-400 font-bold text-sm">{state.profile.standardWeap.pity5}<span className="text-gray-500 text-[9px]">/80</span></div>
                                  <div className="text-gray-300 text-[8px] mt-0.5">5★ Pity</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-purple-400 font-bold text-sm">{state.profile.standardWeap.pity4}<span className="text-gray-500 text-[9px]">/10</span></div>
                                  <div className="text-gray-300 text-[8px] mt-0.5">4★ Pity</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-white font-bold text-sm">{state.profile.standardWeap.history.length}</div>
                                  <div className="text-gray-300 text-[8px] mt-0.5">Convenes</div>
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
        )}

        {/* [SECTION:TAB-EVENTS] */}
        {activeTab === 'events' && (
          <div className="kuro-calc space-y-3 -mx-3 px-3 py-3 tab-content">
            <TabBackground id="events" />

            <div className="flex items-center justify-between" style={{position: 'relative', zIndex: 5}}>
              <h2 className="text-white font-bold text-sm">Time-Gated Content</h2>
              <span className="text-gray-300 text-[10px]">Server: {state.server}</span>
            </div>
            <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center justify-between" style={{position: 'relative', zIndex: 5}}>
              <span className="text-yellow-400 text-xs font-medium">Total Available Astrite</span>
              <span className="text-yellow-400 font-bold text-sm">{Object.values(EVENTS).reduce((sum, ev) => sum + (parseInt(ev.rewards) || 0), 0).toLocaleString()} Astrite</span>
            </div>
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
                return <EventCard key={key} event={{...ev, key}} server={state.server} bannerImage={eventImageMap[key] || ev.imageUrl} visualSettings={visualSettings} />;
              })}
            </div>
            <p className="text-neutral-500 text-[10px] text-center" style={{position: 'relative', zIndex: 5}}>Reset times based on {state.server} server (UTC{SERVERS[state.server]?.utcOffset >= 0 ? '+' : ''}{SERVERS[state.server]?.utcOffset})</p>
          </div>
        )}

        {/* [SECTION:TAB-CALC] */}
        {activeTab === 'calculator' && (
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
                        <Sparkles size={16} className="mx-auto mb-1.5" />Resonator
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
                    <button onClick={() => { const newVal = !state.calc.charGuaranteed; setCalc('charGuaranteed', newVal); setCalc('charGuaranteedManual', newVal); }} className={`kuro-btn w-full ${state.calc.charGuaranteed ? 'active-emerald' : ''}`}>
                      {state.calc.charGuaranteed ? '✓ Guaranteed' : '50/50 Active'}
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
                        <PityRing value={state.calc.charPity} max={80} size={56} strokeWidth={4} color="#fbbf24" glowColor="rgba(251,191,36,0.4)" />
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1 text-yellow-300">Featured Resonator</div>
                          <input type="range" min="0" max="80" value={state.calc.charPity} onChange={e => { const v = +e.target.value; setCalc('charPity', v); }} className="kuro-slider" />
                          {state.calc.charPity >= 66 && <p className="text-[10px] kuro-soft-pity" style={{color: '#fb923c'}}><Sparkles size={10} className="inline mr-1" style={{filter: 'drop-shadow(0 0 4px rgba(253,224,71,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.charPity >= 66 ? '#fb923c' : '#fde047'}} className={`text-2xl kuro-number ${state.calc.charPity >= 66 ? 'kuro-soft-pity' : ''}`}>{state.calc.charPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-300">5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.charCopies} onChange={e => { const v = parseInt(e.target.value) || 1; setCalc('charCopies', Math.max(1, Math.min(7, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-violet-300">4★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.char4StarCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('char4StarCopies', Math.max(0, Math.min(21, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Featured Weapon Pity - Pink to match weapon banners */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <PityRing value={state.calc.weapPity} max={80} size={56} strokeWidth={4} color="#f472b6" glowColor="rgba(244,114,182,0.4)" />
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1 text-pink-400">Featured Weapon</div>
                          <input type="range" min="0" max="80" value={state.calc.weapPity} onChange={e => setCalc('weapPity', +e.target.value)} className="kuro-slider pink" />
                          {state.calc.weapPity >= 66 && <p className="text-[10px] kuro-soft-pity-pink" style={{color: '#f9a8d4'}}><Swords size={10} className="inline mr-1" style={{color: '#f9a8d4', filter: 'drop-shadow(0 0 4px rgba(244,114,182,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.weapPity >= 66 ? '#f9a8d4' : '#f472b6'}} className={`text-2xl kuro-number ${state.calc.weapPity >= 66 ? 'kuro-soft-pity-pink' : ''}`}>{state.calc.weapPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-pink-400">5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.weapCopies} onChange={e => { const v = parseInt(e.target.value) || 1; setCalc('weapCopies', Math.max(1, Math.min(5, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-violet-300">4★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.weap4StarCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('weap4StarCopies', Math.max(0, Math.min(15, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Standard Resonator Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <PityRing value={state.calc.stdCharPity} max={80} size={56} strokeWidth={4} color="#22d3ee" glowColor="rgba(34,211,238,0.4)" />
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1 text-sky-300">Standard Resonator</div>
                          <input type="range" min="0" max="80" value={state.calc.stdCharPity} onChange={e => setCalc('stdCharPity', +e.target.value)} className="kuro-slider cyan" />
                          {state.calc.stdCharPity >= 66 && <p className="text-[10px] kuro-soft-pity-cyan" style={{color: '#67e8f9'}}><Star size={10} className="inline mr-1" style={{filter: 'drop-shadow(0 0 4px rgba(103,232,249,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.stdCharPity >= 66 ? '#67e8f9' : '#7dd3fc'}} className={`text-2xl kuro-number ${state.calc.stdCharPity >= 66 ? 'kuro-soft-pity-cyan' : ''}`}>{state.calc.stdCharPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-sky-300">5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.stdCharCopies} onChange={e => { const v = parseInt(e.target.value) || 1; setCalc('stdCharCopies', Math.max(1, Math.min(7, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-violet-300">4★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.stdChar4StarCopies} onChange={e => { const v = parseInt(e.target.value) || 0; setCalc('stdChar4StarCopies', Math.max(0, Math.min(21, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Standard Weapon Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <PityRing value={state.calc.stdWeapPity} max={80} size={56} strokeWidth={4} color="#22d3ee" glowColor="rgba(34,211,238,0.4)" />
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1 text-sky-300">Standard Weapon</div>
                          <input type="range" min="0" max="80" value={state.calc.stdWeapPity} onChange={e => setCalc('stdWeapPity', +e.target.value)} className="kuro-slider cyan" />
                          {state.calc.stdWeapPity >= 66 && <p className="text-[10px] kuro-soft-pity-cyan" style={{color: '#67e8f9'}}><Sword size={10} className="inline mr-1 rotate-45" style={{filter: 'drop-shadow(0 0 4px rgba(103,232,249,0.9))'}} />Soft Pity Zone!</p>}
                        </div>
                        <div className="text-right">
                          <span style={{color: state.calc.stdWeapPity >= 66 ? '#67e8f9' : '#7dd3fc'}} className={`text-2xl kuro-number ${state.calc.stdWeapPity >= 66 ? 'kuro-soft-pity-cyan' : ''}`}>{state.calc.stdWeapPity}</span>
                          <span className="text-gray-200 text-sm">/80</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-sky-300">5★ Target:</span>
                          <input type="text" inputMode="numeric" value={state.calc.stdWeapCopies} onChange={e => { const v = parseInt(e.target.value) || 1; setCalc('stdWeapCopies', Math.max(1, Math.min(5, v))); }} className="kuro-input kuro-input-sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-violet-300">4★ Target:</span>
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
                    <label className="kuro-label mb-1.5 block">Astrite</label>
                    <input type="number" value={state.calc.astrite} onChange={e => setCalc('astrite', e.target.value)} className="kuro-input" placeholder="0" />
                    <p className="text-gray-200 text-[10px] mt-1.5">= {Math.floor((+state.calc.astrite || 0) / 160)} Convenes</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {[160, 800, 1600, 3200].map(amt => (
                        <button key={amt} onClick={() => setCalc('astrite', String((+state.calc.astrite || 0) + amt))} className="px-2 py-1 text-[9px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 transition-colors">+{amt}</button>
                      ))}
                      <button onClick={() => setCalc('astrite', '')} className="px-2 py-1 text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 transition-colors">Clear</button>
                    </div>
                  </div>

                  {/* Featured banner resources */}
                  {state.calc.bannerCategory === 'featured' && (
                    <div className="grid grid-cols-2 gap-3">
                      {(state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div>
                          <label className="text-xs mb-1.5 block font-medium text-yellow-300">Radiant Tides</label>
                          <input type="number" value={state.calc.radiant} onChange={e => setCalc('radiant', e.target.value)} className="kuro-input" placeholder="0" />
                          <div className="flex gap-1 mt-1.5">
                            {[1, 5, 10].map(amt => (
                              <button key={amt} onClick={() => setCalc('radiant', String((+state.calc.radiant || 0) + amt))} className="px-2 py-1 text-[9px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">+{amt}</button>
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
                              <button key={amt} onClick={() => setCalc('forging', String((+state.calc.forging || 0) + amt))} className="px-2 py-1 text-[9px] bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded border border-pink-500/30">+{amt}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard banner resources */}
                  {state.calc.bannerCategory === 'standard' && (
                    <div>
                      <label className="text-xs mb-1.5 block font-medium text-sky-300">Lustrous Tides</label>
                      <input type="number" value={state.calc.lustrous} onChange={e => setCalc('lustrous', e.target.value)} className="kuro-input" placeholder="0" />
                      <div className="flex gap-1 mt-1.5">
                        {[1, 5, 10].map(amt => (
                          <button key={amt} onClick={() => setCalc('lustrous', String((+state.calc.lustrous || 0) + amt))} className="px-2 py-1 text-[9px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30">+{amt}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total Convenes Display */}
                  <div className="kuro-stat">
                    <div className="flex justify-around items-center">
                      {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-yellow-300 kuro-number text-xl">{Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.radiant || 0)}</div>
                          <div className="text-gray-200 text-[10px]">Resonator Convenes</div>
                        </div>
                      )}
                      {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-yellow-300 kuro-number text-xl">{Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.forging || 0)}</div>
                          <div className="text-gray-200 text-[10px]">Weapon Convenes</div>
                        </div>
                      )}
                      {state.calc.bannerCategory === 'standard' && (
                        <div className="text-center">
                          <div className="text-sky-300 kuro-number text-xl">{Math.floor((+state.calc.astrite || 0) / 160) + (+state.calc.lustrous || 0)}</div>
                          <div className="text-gray-200 text-[10px]">Standard Convenes</div>
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
                        <div className="text-gray-200 text-[10px] mt-1">Success Rate</div>
                      </div>
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-2xl kuro-number text-red-400">{charStats.missingPulls}</div>
                        <div className="text-gray-200 text-[10px] mt-1">Worst Case Deficit</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="kuro-stat kuro-stat-purple"><span className="text-violet-300 kuro-number">~{charStats.fourStarCount}</span><div className="text-gray-200 text-[9px] mt-0.5">4★ Expected</div></div>
                      <div className="kuro-stat kuro-stat-purple"><span className="text-violet-300 kuro-number">~{charStats.featuredFourStarCount}</span><div className="text-gray-200 text-[9px] mt-0.5">Featured 4★</div></div>
                    </div>
                </CardBody>
              </Card>
            )}

            {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
              <Card>
                <CardHeader>Featured Weapon Results</CardHeader>
                <CardBody className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="kuro-stat kuro-stat-gold">
                        <div className={`text-3xl kuro-number ${parseFloat(weapStats.successRate) >= 75 ? 'text-emerald-400' : parseFloat(weapStats.successRate) >= 50 ? 'text-yellow-300' : parseFloat(weapStats.successRate) >= 25 ? 'text-orange-400' : 'text-red-400'}`}>{weapStats.successRate}%</div>
                        <div className="text-gray-200 text-[10px] mt-1">Success Rate</div>
                      </div>
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-2xl kuro-number text-red-400">{weapStats.missingPulls}</div>
                        <div className="text-gray-200 text-[10px] mt-1">Worst Case Deficit</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="kuro-stat kuro-stat-purple"><span className="text-violet-300 kuro-number">~{weapStats.fourStarCount}</span><div className="text-gray-200 text-[9px] mt-0.5">4★ Expected</div></div>
                      <div className="kuro-stat kuro-stat-purple"><span className="text-violet-300 kuro-number">~{weapStats.featuredFourStarCount}</span><div className="text-gray-200 text-[9px] mt-0.5">Featured 4★</div></div>
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
                        <div className="text-gray-200 text-[10px] mt-1">Success Rate</div>
                      </div>
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-2xl kuro-number text-red-400">{stdCharStats.missingPulls}</div>
                        <div className="text-gray-200 text-[10px] mt-1">Worst Case Deficit</div>
                      </div>
                    </div>
                    <div className="kuro-stat kuro-stat-purple text-xs"><span className="text-violet-300 kuro-number">~{stdCharStats.fourStarCount}</span> <span className="text-gray-200">4★ Expected</span></div>
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
                        <div className="text-gray-200 text-[10px] mt-1">Success Rate</div>
                      </div>
                      <div className="kuro-stat kuro-stat-red">
                        <div className="text-2xl kuro-number text-red-400">{stdWeapStats.missingPulls}</div>
                        <div className="text-gray-200 text-[10px] mt-1">Worst Case Deficit</div>
                      </div>
                    </div>
                    <div className="kuro-stat kuro-stat-purple text-xs"><span className="text-violet-300 kuro-number">~{stdWeapStats.fourStarCount}</span> <span className="text-gray-200">4★ Expected</span></div>
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
                        <div className="text-gray-200 text-[10px] mt-1">Get Both</div>
                      </div>
                      <div className="kuro-stat kuro-stat-gold">
                        <div className="text-yellow-300 text-2xl kuro-number">{combined.atLeastOne}%</div>
                        <div className="text-gray-200 text-[10px] mt-1">At Least One</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="kuro-stat"><span style={{color: state.calc.bannerCategory === 'featured' ? '#fde047' : '#7dd3fc'}} className="kuro-number">{combined.charOnly}%</span><div className="text-gray-200 mt-0.5">Char Only</div></div>
                      <div className="kuro-stat"><span style={{color: state.calc.bannerCategory === 'featured' ? '#fde047' : '#7dd3fc'}} className="kuro-number">{combined.weapOnly}%</span><div className="text-gray-200 mt-0.5">Weap Only</div></div>
                      <div className="kuro-stat"><span className="text-red-400 kuro-number">{combined.neither}%</span><div className="text-gray-200 mt-0.5">Neither</div></div>
                    </div>
                    <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-center">
                      <p className="text-yellow-400/80 text-[9px]">⚠ Astrite is shared — probabilities assume separate resources for each banner. Actual odds may be lower if splitting Astrite between both.</p>
                    </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* [SECTION:TAB-PLANNER] */}
        {activeTab === 'planner' && (
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
                  <div className="text-gray-200 text-[10px] mt-1">≈ {(dailyIncome / 160).toFixed(2)} Convenes/day • {Math.floor(dailyIncome * 30 / 160)} Convenes/month</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <div className="cursor-pointer" onClick={() => setShowIncomePanel(!showIncomePanel)}>
                <CardHeader action={<ChevronDown size={14} className={`text-gray-200 transition-transform ${showIncomePanel ? 'rotate-180' : ''}`} />}>Add Purchases</CardHeader>
              </div>
              {showIncomePanel && (
                <CardBody className="space-y-1.5">
                  <div className="kuro-label mb-1">Subscriptions</div>
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
                  <div className="kuro-label mt-3 mb-1">Direct Top-Ups</div>
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
                <CardHeader action={<button onClick={() => state.planner.addedIncome.forEach(i => dispatch({ type: 'REMOVE_INCOME', id: i.id }))} className="text-red-400 text-[9px] hover:text-red-300">Clear All</button>}>Added Purchases</CardHeader>
                <CardBody className="space-y-1">
                  {state.planner.addedIncome.map(i => (
                    <div key={i.id} className="flex items-center justify-between p-1.5 bg-white/5 rounded text-xs">
                      <span className="text-gray-200">{i.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">+{i.astrite}</span>
                        {i.radiant > 0 && <span className="text-cyan-400">+{i.radiant}RT</span>}
                        {i.lustrous > 0 && <span className="text-purple-400">+{i.lustrous}LT</span>}
                        <button onClick={() => dispatch({ type: 'REMOVE_INCOME', id: i.id })} className="text-red-400"><Minus size={12} /></button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/10 flex justify-between text-xs">
                    <span className="text-gray-300">Total Spent</span>
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
                    <span className="text-gray-300 text-[10px]">v{activeBanners.version} P{activeBanners.phase} ends in {planData.daysLeft} day{planData.daysLeft !== 1 ? 's' : ''}</span>
                    <CountdownTimer endDate={bannerEndDate} compact />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="kuro-stat p-2.5 text-center">
                      <div className="text-yellow-400 kuro-number text-xl">{planData.convenesByEnd}</div>
                      <div className="text-gray-300 text-[9px]">Total Convenes</div>
                    </div>
                    <div className="kuro-stat p-2.5 text-center">
                      <div className="text-white kuro-number text-xl">{Math.floor(planData.incomeByEnd / 160)}</div>
                      <div className="text-gray-300 text-[9px]">Earned Convenes</div>
                    </div>
                    <div className="kuro-stat p-2.5 text-center">
                      <div className="text-white kuro-number text-xl">{planData.totalAstriteByEnd.toLocaleString()}</div>
                      <div className="text-gray-300 text-[9px]">Total Astrite</div>
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
                      <div className="text-gray-200 text-[10px] mb-1">{days} Days</div>
                      <div className="text-2xl kuro-number text-yellow-400">{Math.floor(dailyIncome * days / 160)}</div>
                      <div className="text-gray-300 text-[9px]">Convenes</div>
                      <div className="text-gray-400 text-[9px]">{(dailyIncome * days).toLocaleString()} Ast</div>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="kuro-label">Base Convenes (per copy)</label>
                    <select value={state.planner.goalPulls} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'goalPulls', value: +e.target.value })} className="kuro-input w-full">
                      <option value={80}>80 (Soft Pity)</option>
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
                <div className="p-2 bg-white/5 rounded text-[10px] text-gray-200 text-center">
                  Using Calculator: <span className={planData.isFeatured ? 'text-yellow-400' : 'text-cyan-400'}>{planData.goalBannerLabel}</span> × <span className="text-gray-100">{planData.goalCopies}</span> copies
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-200">Target</span>
                    <span className="text-gray-100 font-bold">{planData.targetPulls} Convenes ({planData.targetAstrite.toLocaleString()} Ast)</span>
                  </div>
                  <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${planData.isFeatured ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`} style={{ width: `${planData.goalProgress}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] mt-1">
                    <span className="text-gray-300">{Math.floor(planData.currentAstrite / 160)} / {planData.targetPulls} Convenes</span>
                    <span className="text-gray-100">{planData.goalProgress.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="kuro-stat p-3 text-center">
                    <div className="text-yellow-400 kuro-number text-xl">{planData.goalNeeded.toLocaleString()}</div>
                    <div className="text-gray-200 text-[10px]">Astrite Needed</div>
                  </div>
                  <div className="kuro-stat p-3 text-center">
                    <div className="text-yellow-400 kuro-number text-xl">{planData.goalDaysNeeded === Infinity ? '∞' : planData.goalDaysNeeded}</div>
                    <div className="text-gray-200 text-[10px]">Days to Goal</div>
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
                        <div className="text-gray-300 text-[10px]">{b.astrite} Ast • P{b.charPity}/{b.weapPity}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => dispatch({ type: 'LOAD_BOOKMARK', id: b.id })} className="px-2 py-1 text-[9px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30">Load</button>
                        <button onClick={() => dispatch({ type: 'DELETE_BOOKMARK', id: b.id })} className="px-2 py-1 text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30">×</button>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* [SECTION:TAB-STATS] */}
        {activeTab === 'analytics' && (
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
                    <CardHeader>Luck Rating</CardHeader>
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
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

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
                                  className={`p-1 rounded ${canGoLeft ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/5 text-gray-500'}`}
                                >
                                  <ChevronDown size={14} className="rotate-90" />
                                </button>
                                <button 
                                  onClick={() => setChartOffset(Math.min(maxOffset, clampedOffset + Math.floor(maxVisible / 2)))}
                                  disabled={!canGoRight}
                                  className={`p-1 rounded ${canGoRight ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-white/5 text-gray-500'}`}
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
                      <div className="p-2 bg-white/5 rounded text-center"><div className="text-white font-bold">{overallStats.totalPulls}</div><div className="text-gray-400 text-[9px]">Total Pulls</div></div>
                      <div className="p-2 bg-white/5 rounded text-center"><div className="text-yellow-400 font-bold">{overallStats.totalAstrite.toLocaleString()}</div><div className="text-gray-400 text-[9px]">Astrite Spent</div></div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="p-2 bg-white/5 rounded text-center"><div className="text-emerald-400 font-bold text-sm">{overallStats.won5050}</div><div className="text-gray-400 text-[9px]">Won 50/50</div></div>
                      <div className="p-2 bg-white/5 rounded text-center"><div className="text-red-400 font-bold text-sm">{overallStats.lost5050}</div><div className="text-gray-400 text-[9px]">Lost 50/50</div></div>
                      <div className="p-2 bg-white/5 rounded text-center"><div className="text-white font-bold text-sm">{overallStats.avgPity}</div><div className="text-gray-400 text-[9px]">Avg. Pity</div></div>
                    </div>
                    {overallStats.winRate && <div className="text-center text-[10px] text-gray-400 mt-2">50/50 Win Rate: <span className="text-emerald-400 font-bold">{overallStats.winRate}%</span></div>}
                  </CardBody>
                </Card>

                {/* Pity Distribution */}
                <Card>
                  <CardHeader>Pity Distribution</CardHeader>
                  <CardBody>
                    {(() => {
                      const allPulls = [...(state.profile.featured?.history || []), ...(state.profile.weapon?.history || []), ...(state.profile.standardChar?.history || []), ...(state.profile.standardWeap?.history || [])];
                      const fiveStars = allPulls.filter(p => p.rarity === 5 && p.pity > 0);
                      if (fiveStars.length < 2) return <p className="text-gray-500 text-xs text-center py-4">Need more 5★ data</p>;
                      
                      const ranges = [
                        { range: '1-40', label: 'Early', min: 1, max: 40, color: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
                        { range: '41-60', label: 'Normal', min: 41, max: 60, color: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
                        { range: '61-70', label: 'Soft Pity', min: 61, max: 70, color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
                        { range: '71-80', label: 'Hard Pity', min: 71, max: 80, color: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
                      ];
                      
                      const maxCount = Math.max(...ranges.map(r => fiveStars.filter(p => p.pity >= r.min && p.pity <= r.max).length));
                      
                      return (
                        <div className="space-y-3">
                          {ranges.map(({range, label, min, max, color, glow}) => {
                            const count = fiveStars.filter(p => p.pity >= min && p.pity <= max).length;
                            const pct = fiveStars.length > 0 ? Math.round((count / fiveStars.length) * 100) : 0;
                            const barWidth = maxCount > 0 ? (count / maxCount) * 50 : 0;
                            return (
                              <div key={range}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: color, boxShadow: `0 0 6px ${glow}`}} />
                                    <span className="text-gray-200 text-[10px] font-medium">{label}</span>
                                    <span className="text-gray-500 text-[9px]">{range}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold" style={{color}}>{count}</span>
                                    <span className="text-gray-500 text-[9px]">{pct}%</span>
                                  </div>
                                </div>
                                <div className="h-4 rounded overflow-hidden" style={{background: 'rgba(255,255,255,0.03)'}}>
                                  <div className="h-full rounded transition-all duration-500" style={{
                                    width: `${Math.max(barWidth, count > 0 ? 4 : 0)}%`,
                                    background: `linear-gradient(90deg, ${color}50, ${color}90)`,
                                    boxShadow: count > 0 ? `inset 0 1px 0 rgba(255,255,255,0.15), 0 0 8px ${glow}` : 'none'
                                  }} />
                                </div>
                              </div>
                            );
                          })}
                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <span className="text-gray-400 text-[9px]">Total 5★ Pulls</span>
                            <span className="text-white text-[10px] font-bold">{fiveStars.length}</span>
                          </div>
                        </div>
                      );
                    })()}
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
                        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
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
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      <div className="p-2 bg-yellow-500/10 rounded text-center"><div className="text-yellow-400 font-bold text-sm">{resHist.filter(p => p.rarity === 5).length}</div><div className="text-gray-400 text-[9px]">5★</div></div>
                      <div className="p-2 bg-purple-500/10 rounded text-center"><div className="text-purple-400 font-bold text-sm">{resHist.filter(p => p.rarity === 4).length}</div><div className="text-gray-400 text-[9px]">4★</div></div>
                    </div>
                    
                    <p className="text-gray-400 text-[9px] mb-1.5">Weapons</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="p-2 bg-yellow-500/10 rounded text-center"><div className="text-yellow-400 font-bold text-sm">{wepHist.filter(p => p.rarity === 5).length}</div><div className="text-gray-400 text-[9px]">5★</div></div>
                      <div className="p-2 bg-purple-500/10 rounded text-center"><div className="text-purple-400 font-bold text-sm">{wepHist.filter(p => p.rarity === 4).length}</div><div className="text-gray-400 text-[9px]">4★</div></div>
                      <div className="p-1.5 bg-blue-500/10 rounded text-center"><div className="text-blue-400 font-bold text-sm">{wepHist.filter(p => p.rarity === 3).length}</div><div className="text-gray-400 text-[8px]">3★</div></div>
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
                      { name: 'Standard Weapon', key: 'standardWeap', color: 'purple' },
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
        )}

        {/* [SECTION:TAB-COLLECT] */}
        {activeTab === 'gathering' && (
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
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5" style={{position: 'relative', zIndex: 5}}>
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
                      <button onClick={() => setCollectionSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  {/* Filter Row */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {/* Element Filter */}
                    <select
                      value={collectionElementFilter}
                      onChange={(e) => setCollectionElementFilter(e.target.value)}
                      className="px-2 py-1 rounded text-[9px] bg-neutral-800 text-gray-300 border border-white/10 focus:border-yellow-500/50 focus:outline-none"
                    >
                      <option value="all">All Elements</option>
                      <option value="Aero">🌀 Aero</option>
                      <option value="Glacio">❄️ Glacio</option>
                      <option value="Electro">⚡ Electro</option>
                      <option value="Fusion">🔥 Fusion</option>
                      <option value="Spectro">✨ Spectro</option>
                      <option value="Havoc">💜 Havoc</option>
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
                      <option value="owned">✓ Owned</option>
                      <option value="missing">✗ Missing</option>
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
                    
                    <div className="flex-1" />
                    
                    {/* Refresh & Sort */}
                    <button
                      onClick={refreshImages}
                      className="px-2 py-1 rounded text-[9px] bg-neutral-800 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 transition-all"
                      title="Refresh images if they don't load"
                    >
                      <RefreshCcw size={10} />
                    </button>
                    <button
                      onClick={() => setCollectionSort('copies')}
                      className={`px-2 py-1 rounded text-[9px] transition-all ${collectionSort === 'copies' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : 'bg-neutral-800 text-gray-400 border border-white/10'}`}
                      title="Sort by copies"
                    >
                      #
                    </button>
                    <button
                      onClick={() => setCollectionSort('release')}
                      className={`px-2 py-1 rounded text-[9px] transition-all ${collectionSort === 'release' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-neutral-800 text-gray-400 border border-white/10'}`}
                      title="Sort by release date"
                    >
                      📅
                    </button>
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
        )}

        {/* [SECTION:TAB-PROFILE] */}
        {activeTab === 'profile' && (
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
                <p className="text-gray-300 text-[10px] mt-2 text-center">Reset: 4:00 AM (UTC{SERVERS[state.server]?.utcOffset >= 0 ? '+' : ''}{SERVERS[state.server]?.utcOffset})</p>
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
                <label className="block">
                  <div className="p-4 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:border-yellow-500/50">
                    <Upload size={20} className="mx-auto mb-1 text-gray-300" />
                    <p className="text-gray-300 text-[10px]">Upload JSON file</p>
                  </div>
                  <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                </label>
              </CardBody>
            </Card>

            {state.profile.importedAt && (
              <Card>
                <CardHeader action={<button onClick={() => { dispatch({ type: 'CLEAR_PROFILE' }); toast?.addToast?.('Profile cleared!', 'info'); }} className="text-red-400 text-[9px] hover:text-red-300">Clear</button>}>Import Info</CardHeader>
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
                <button onClick={() => { if (window.confirm('Are you sure you want to reset ALL data? This cannot be undone.')) { dispatch({ type: 'RESET' }); toast?.addToast?.('All data reset!', 'info'); } }} className="kuro-btn w-full py-2 active-red">
                  Reset All Data
                </button>
              </CardBody>
            </Card>

            {/* About & Legal */}
            <Card>
              <CardHeader>About</CardHeader>
              <CardBody className="space-y-3">
                <div className="text-center">
                  <h4 className="text-gray-100 font-medium">Whispering Wishes</h4>
                  <p className="text-gray-500 text-[10px]">Version 2.9.28</p>
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
                
                <p className="text-center text-[8px] text-gray-500 pt-2">© 2026 Whispering Wishes by <a href="https://www.reddit.com/u/WW_Andene" className="text-gray-500 hover:text-gray-400">u/WW_Andene</a> • Made with ♡ for the WuWa community.</p>
              </CardBody>
            </Card>
          </div>
        )}

      </main>

      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-sm">
            <CardHeader action={<button onClick={() => setShowBookmarkModal(false)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-all"><X size={16} /></button>}>Save Current State</CardHeader>
            <CardBody className="space-y-3">
              <input type="text" value={bookmarkName} onChange={e => setBookmarkName(e.target.value)} placeholder="Enter name..." className="kuro-input w-full" />
              <div className="text-gray-300 text-[10px]">
                <p>Astrite: {state.calc.astrite || 0} • Pity: {state.calc.charPity}/{state.calc.weapPity}</p>
                <p>Radiant: {state.calc.radiant || 0} • Forging: {state.calc.forging || 0}</p>
              </div>
              <button onClick={() => { dispatch({ type: 'SAVE_BOOKMARK', name: bookmarkName || 'Unnamed' }); setBookmarkName(''); setShowBookmarkModal(false); }} className="kuro-btn w-full active-purple">Save Bookmark</button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-sm">
            <CardHeader action={<button onClick={() => setShowExportModal(false)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-all"><X size={16} /></button>}>Backup</CardHeader>
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 overflow-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Settings size={16} /> Admin Panel</span>
              <button onClick={() => { setShowAdminPanel(false); setAdminUnlocked(false); setAdminPassword(''); }} className="text-gray-400 hover:text-white"><X size={16} /></button>
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
                className="text-cyan-400 hover:text-white p-1 rounded hover:bg-white/20 bg-white/10"
                title="Expand"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              </button>
              <button 
                onClick={() => { setShowAdminPanel(false); setAdminMiniMode(false); setFramingMode(false); setEditingImage(null); }} 
                className="text-red-400 hover:text-white p-1 rounded hover:bg-red-500/30 bg-red-500/20"
                title="Close"
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
          <span onClick={handleAdminTap} className="cursor-pointer select-none">Whispering Wishes v2.9.28</span> • by u/WW_Andene • Not affiliated with Kuro Games • 
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
