// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES v3.2.3 — appcore-providers.jsx
// PWA infrastructure, toast system, a11y hooks, onboarding, KuroStyles.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, useRef, createContext, useContext, memo } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Calculator, Upload, Target, BarChart3, X, LayoutGrid, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { haptic, generateUniqueId, HEADER_ICON } from './appcore-data.js';

// P14-FIX: HIGH-6 — Service worker code moved to /public/sw.js (static file).
// Removed ~130 lines of inline SERVICE_WORKER_CODE string that was registered via blob URL.

// Shared install banner component used by both native and iframe prompts
const InstallBanner = ({ subtitle, actionLabel, onAction, onDismiss }) => (
  <div className="fixed bottom-20 left-3 right-3 z-[9800] bg-gradient-to-r from-[rgba(237,175,24,0.9)] to-[rgba(237,175,24,0.7)] backdrop-blur-sm rounded-xl p-3 shadow-xl border border-yellow-400/30">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
        <img src={HEADER_ICON} alt="Whispering Wishes" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="text-black font-semibold text-sm">Install Whispering Wishes</div>
        <div className="text-black/70 text-xs">{subtitle}</div>
      </div>
      <button
        onClick={onAction}
        className="px-3 py-1.5 bg-black text-yellow-400 rounded-lg text-xs font-medium hover:bg-black/80 transition-colors"
      >
        {actionLabel}
      </button>
      <button
        onClick={onDismiss}
        className="p-1 text-black/50 hover:text-black transition-colors" aria-label="Dismiss install prompt"
      >
        <X size={16} />
      </button>
    </div>
  </div>
);

// PWA Context — exposes install prompt to settings UI
const PWAContext = createContext(null);
const usePWA = () => useContext(PWAContext);

// Meta tag definitions for PWA support
const PWA_META_TAGS = [
  { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
  { name: 'mobile-web-app-capable', content: 'yes' },
  { name: 'apple-mobile-web-app-capable', content: 'yes' },
  { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
  { name: 'apple-mobile-web-app-title', content: 'Whispering Wishes' },
  { name: 'theme-color', content: '#edaf18' },
  { name: 'msapplication-TileColor', content: '#edaf18' },
  { name: 'msapplication-navbutton-color', content: '#edaf18' }
];

/** Inject PWA meta tags into document head (skips if already present) */
function injectMetaTags() {
  PWA_META_TAGS.forEach(({ name, content }) => {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      meta.setAttribute('data-ww', 'true');
      document.head.appendChild(meta);
    }
  });
}

/** Remove injected PWA meta tags from document head (preserves viewport) */
function removeMetaTags() {
  PWA_META_TAGS.forEach(({ name }) => {
    if (name === 'viewport') return; // Never remove viewport meta
    const el = document.querySelector(`meta[name="${name}"][data-ww="true"]`);
    if (el) el.remove();
  });
}

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
    injectMetaTags();

    // P14-FIX: HIGH-6 — Register service worker from a proper static file instead of blob URL.
    // Blob URLs bypass CSP, are invisible to security scanners, and prevent proper SW update lifecycle.
    // The static /sw.js file works in all browsers (Firefox, Safari, Chrome).
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
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
          console.info('[WW] Service worker not registered:', err.message);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      removeMetaTags();
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
  
  const [isInIframe] = useState(() => {
    try { return window.self !== window.top; } catch { return true; }
  });
  const [iframeBannerDismissed, setIframeBannerDismissed] = useState(false);

  const pwaValue = useMemo(() => ({
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    promptInstall,
  }), [installPrompt, isInstalled, promptInstall]);

  return (
    <PWAContext.Provider value={pwaValue}>
      {children}
      {/* Offline indicator */}
      {!isOnline && (
        <div role="alert" aria-live="assertive" className="fixed top-0 left-0 right-0 z-[10000] bg-yellow-500 text-black text-center py-1 text-xs font-medium">
          ⚡ You're offline - Some features may be limited
        </div>
      )}
      {/* Install prompt banner — native */}
      {installPrompt && !isInstalled && !isInIframe && (
        <InstallBanner
          subtitle="Add to home screen for the best experience"
          actionLabel="Install"
          onAction={promptInstall}
          onDismiss={() => setInstallPrompt(null)}
        />
      )}
      {/* Install prompt banner — iframe fallback */}
      {isInIframe && !isInstalled && !iframeBannerDismissed && (
        <InstallBanner
          subtitle="Open in a new tab to install as an app"
          actionLabel="Open"
          onAction={() => window.open(window.location.href, '_blank')}
          onDismiss={() => setIframeBannerDismissed(true)}
        />
      )}
    </PWAContext.Provider>
  );
};

// [SECTION:TOAST]

const ToastContext = createContext(null);


const MAX_TOASTS = 5;

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timerRefs = useRef(new Map());
  useEffect(() => {
    return () => {
      timerRefs.current.forEach(timer => clearTimeout(timer));
      timerRefs.current.clear();
    };
  }, []);

  const addToast = useCallback((message, type = 'info', duration, onUndo = null) => {
    if (duration === undefined) duration = type === 'error' ? 4500 : 3000;
    const id = generateUniqueId();
    setToasts(prev => {
      const next = [...prev, { id, message, type, onUndo }];
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
    });
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timerRefs.current.delete(id);
    }, duration);
    timerRefs.current.set(id, timer);
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
      {/* MED-4: Toast z-index separated from install prompt */}
      <div className="fixed bottom-28 left-3 right-3 z-[9500] flex flex-col gap-2 pointer-events-none" role="status" aria-live="polite" aria-atomic="true" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-lg flex items-center gap-2 text-xs font-medium pointer-events-auto border ${toast.type === 'warning' ? 'text-amber-900 border-amber-300/40' : 'text-white border-white/20'}`} style={{
            animation: 'slideUp 0.2s ease-out',
            background: toast.type === 'success' ? 'rgba(34,197,94,0.9)' : toast.type === 'error' ? 'rgba(248,113,113,0.9)' : toast.type === 'warning' ? 'rgba(252,211,77,0.95)' : 'rgba(56,189,248,0.9)',
          }}>
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {/* AUDIT-FIX N7: Use AlertTriangle for warnings to distinguish from errors */}
            {toast.type === 'warning' && <AlertTriangle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            <span className="flex-1">{toast.message}</span>
            {toast.onUndo && (
              <button onClick={() => {
                toast.onUndo();
                setToasts(prev => prev.filter(t => t.id !== toast.id));
                const timer = timerRefs.current.get(toast.id);
                if (timer) { clearTimeout(timer); timerRefs.current.delete(toast.id); }
              }} className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex-shrink-0 ${toast.type === 'warning' ? 'bg-amber-900/15 hover:bg-amber-900/25 text-amber-900' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                Undo
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

// [SECTION:A11Y_HOOKS] - Accessibility hooks for modal focus trapping & escape key
// P14-FIX: MEDIUM-22 — Re-query focusable elements on each Tab keypress instead of caching.
// Dynamic modals may render content after the trap is set up, so the focusable list can become stale.
const useFocusTrap = (isOpen) => {
  const ref = useRef(null);
  const previousFocusRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement;
    const el = ref.current;
    if (!el) return;
    const getFocusable = () => el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const raf = requestAnimationFrame(() => { const f = getFocusable(); if (f.length) f[0].focus(); });
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      // Re-query on each Tab press to catch dynamically rendered elements
      const nodes = getFocusable();
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    };
    el.addEventListener('keydown', handleKeyDown);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('keydown', handleKeyDown); if (previousFocusRef.current?.focus) previousFocusRef.current.focus(); };
  }, [isOpen]);
  return ref;
};
// Modal stack prevents multiple modals from all closing on a single Escape press.
// Only the most recently opened (topmost) modal responds to Escape.
const _modalStack = [];
const useEscapeKey = (isOpen, onClose) => {
  const idRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const id = Symbol('modal');
    idRef.current = id;
    _modalStack.push({ id, onClose });
    const handler = (e) => {
      if (e.key === 'Escape' && _modalStack.length > 0 && _modalStack[_modalStack.length - 1].id === id) {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      const idx = _modalStack.findIndex(m => m.id === id);
      if (idx !== -1) _modalStack.splice(idx, 1);
    };
  }, [isOpen, onClose]);
};

// P12-FIX: Reusable modal wrapper with focus trapping + escape handling for inline modals (Step 11 audit — MEDIUM-6d)
const FocusTrapModal = ({ isOpen, onClose, ariaLabel, children, className = '', onClick, centered = false }) => {
  const focusTrapRef = useFocusTrap(isOpen);
  useEscapeKey(isOpen, onClose);
  const dragRef = useRef({ startY: 0, currentY: 0, dragging: false });
  const sheetRef = useRef(null);
  // Prevent background scroll when modal is open (fixes iOS Safari scroll bleed)
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      // Restore scroll position instantly to avoid visual jump on iOS
      window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
    };
  }, [isOpen]);

  // Drag-to-dismiss handlers (mobile bottom sheet) — only from header zone
  const onTouchStart = useCallback((e) => {
    // Only allow drag from the header area (handle bar + header row)
    const target = e.target;
    const header = target.closest('[data-sheet-header]');
    if (!header) return;
    dragRef.current = { startY: e.touches[0].clientY, currentY: 0, dragging: true };
  }, []);
  const onTouchMove = useCallback((e) => {
    if (!dragRef.current.dragging) return;
    const dy = e.touches[0].clientY - dragRef.current.startY;
    if (dy < 0) return; // only drag down
    dragRef.current.currentY = dy;
    const sheet = sheetRef.current;
    if (sheet) sheet.style.transform = `translateY(${dy}px)`;
  }, []);
  const onTouchEnd = useCallback(() => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const sheet = sheetRef.current;
    if (dragRef.current.currentY > 100) {
      // Dismiss
      if (sheet) sheet.style.transform = 'translateY(100%)';
      setTimeout(onClose, 150);
    } else {
      // Snap back
      if (sheet) sheet.style.transform = '';
    }
    dragRef.current.currentY = 0;
  }, [onClose]);

  if (!isOpen) return null;
  return createPortal(
    <div
      ref={focusTrapRef}
      className={`fixed inset-0 z-[100] flex sm:items-center sm:justify-center sm:p-4 ${centered ? 'items-center justify-center p-4' : 'items-end'} ${className}`}
      style={{ backdropFilter: 'blur(2px) brightness(0.4)', WebkitBackdropFilter: 'blur(2px) brightness(0.4)' }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <div
        ref={sheetRef}
        className={`w-full sm:contents ${centered ? 'flex items-center justify-center' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transition: 'transform 0.2s ease-out', animation: centered ? 'scaleIn 0.3s ease-out' : 'sheetSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

// [SECTION:ONBOARDING]
const OnboardingModal = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  // P12-FIX: Add focus trapping and escape key support to onboarding modal (Step 11 audit — MEDIUM-6a)
  // Refactored to use FocusTrapModal wrapper (handles focus trap, escape key, and scroll lock)
  const steps = [
    { title: "Welcome to Whispering Wishes!", icon: <Sparkles size={32} />, desc: "Your companion for Wuthering Waves Convene planning.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20', color: '#edaf18' },
    { title: "Import Your History", icon: <Upload size={32} />, desc: "Go to the Profile tab and import data from wuwatracker.com.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30', border: 'border-cyan-500/30', bg: 'bg-cyan-500/20', color: '#22d3ee' },
    { title: "Track Your Banners", icon: <Target size={32} />, desc: "View current banners, pity progress, and time remaining.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-orange-900/30', border: 'border-orange-500/30', bg: 'bg-orange-500/20', color: '#fb923c' },
    { title: "Build Your Collection", icon: <LayoutGrid size={32} />, desc: "Track all your Resonators and weapons.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-purple-900/30', border: 'border-purple-500/30', bg: 'bg-purple-500/20', color: '#a855f7' },
    { title: "Calculate Your Odds", icon: <Calculator size={32} />, desc: "See your chances based on pity and resources.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-emerald-900/30', border: 'border-emerald-500/30', bg: 'bg-emerald-500/20', color: '#34d399' },
    { title: "View Analytics", icon: <BarChart3 size={32} />, desc: "Check your luck rating, charts, and Convene history.", gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30', border: 'border-pink-500/30', bg: 'bg-pink-500/20', color: '#f472b6' },
    { title: "You're Ready!", icon: <CheckCircle size={32} />, desc: "Good luck on your Convenes, Rover!", gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30', border: 'border-yellow-500/30', bg: 'bg-yellow-500/20', color: '#edaf18' }
  ];
  
  const s = steps[step];
  
  return (
    <FocusTrapModal isOpen={true} onClose={onComplete} ariaLabel="Welcome to Whispering Wishes" className="bg-black/90" centered>
      <div className={`relative overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-r ${s.gradient} w-full max-w-xs`} style={{ backgroundColor: 'rgba(12, 16, 24, 0.12)', backdropFilter: 'blur(6px)', zIndex: 5 }}>
        {/* §E9-MC-F3: Angular decorative patterns matching HUD aesthetic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none" aria-hidden="true">
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rotate-45 ${s.bg} blur-2xl opacity-40`} />
          <div className={`absolute right-12 top-1/4 w-10 h-10 rotate-45 ${s.bg} blur-xl opacity-25`} />
        </div>
        
        {/* Skip button - always white */}
        <button onClick={onComplete} className="absolute top-3 right-3 z-20 text-xs min-h-[44px] min-w-[44px] px-3 py-2 rounded text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center" style={{background:'rgba(255,255,255,0.05)'}}>Skip</button>
        
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
              <button onClick={() => setStep(step - 1)} className="text-xs min-h-[44px] px-4 py-2 rounded text-gray-400 hover:text-gray-300 transition-colors" style={{background:'rgba(255,255,255,0.05)'}}>Back</button>
            )}
          </div>
          <div>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="text-xs min-h-[44px] px-4 py-2 rounded text-gray-400 hover:text-gray-300 transition-colors" style={{background:'rgba(255,255,255,0.05)'}}>Next</button>
            ) : (
              <button onClick={onComplete} className="text-xs min-h-[44px] px-4 py-2 rounded border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 font-medium">Get Started</button>
            )}
          </div>
        </div>
      </div>
    </FocusTrapModal>
  );
};

// [SECTION:STYLES]
// P11-FIX: Wrapped in memo — this component injects ~960 lines of CSS; re-rendering it on every
// parent render is wasteful. Only needs to re-render when oledMode changes. (Step 7 audit — MEDIUM-3a)
const KuroStyles = memo(({ oledMode }) => (
  <style>{`
    /* ══════════════════════════════════════════════════════════════════════
       LAHAI-ROI DESIGN LANGUAGE - Black, White, Gold
       ══════════════════════════════════════════════════════════════════════
       BI-F1: BRAND GUIDELINES
       Protected elements: Gold #edaf18, Navy void #080c14, Rajdhani display font
       Emotional target: Tactical precision meets gacha anticipation
       Visual signatures: Corner bracket frames, glassmorphic cards, gold glow accents
       Archetype: Magician (transformation) + Sage (data mastery)
       Voice: Game-lore tone ("Awaiting signal resonance" not "No data found")
       ══════════════════════════════════════════════════════════════════════ */
    
    /* Global - prevent white flash, hide scrollbars on mobile */
    html, body {
      background: ${oledMode ? '#000000' : '#080c14'};
      margin: 0;
      padding: 0;
      overscroll-behavior: none;
      min-height: 100%;
      height: 100%;
      scrollbar-width: none;
      -ms-overflow-style: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
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
    /* E1-SP1: Spacing base: 2px grid (2/4/6/8/10/12/14/16) */
    /* E2-VR1: Dual-rhythm system — KuroStyles uses 14px base padding (dense tactical);
       Tailwind utilities use standard 4px grid. Both are intentional and coexist.
       E7-AD7: Unit conventions — px for spacing/radius/font-size in CSS-in-JS;
       Tailwind scale (p-2, gap-3) for layout padding/margin in JSX.
       §E9-VS-F3: LAHAI-ROI palette rationale — Gold-on-void:
       Primary gold #edaf18 (OKLCH 78% 0.17 85°) — warmth, aspiration, gacha reward
       Navy void #080c14 (OKLCH 8% 0.02 260°) — depth, cosmic emptiness, high contrast
       Cyan accent #38bdf8 — cool complement for standard/info states
       Purple accent #a855f7 — 4-star rarity + Electro element (dual semantic, see §E9-AC-F1)
       MED-37: Numeric precision convention —
       Pity counts: integers (.toFixed(0)), Probabilities: 1 decimal (.toFixed(1)),
       Percentages: 1 decimal (.toFixed(1)), Currency: integers + locale separators.
       §E10-CB-F3: Element icon/shape backup for colorblind accessibility:
       Fusion=Flame, Electro=Bolt, Aero=Wind, Glacio=Snowflake, Havoc=Spiral, Spectro=Star */
    :root {
      --color-gold: 237, 175, 24;   /* oklch(78% 0.17 85°) */
      --color-pink: 236, 72, 153;   /* oklch(62% 0.22 350°) — §E9-CM-F1: Weapon banner domain color */
      --color-cyan: 56, 189, 248;   /* oklch(76% 0.14 230°) — MED-10: Restrict to: info state, Glacio element, Standard banner */
      --color-purple: 168, 85, 247; /* oklch(56% 0.24 295°) */
      --color-emerald: 34, 197, 94; /* oklch(72% 0.19 155°) — BN-F5: Aero element green, game-domain override */
      --color-red: 248, 113, 113;   /* oklch(68% 0.18 25°) */
      /* DC3-SH1 + DP-F1: Ambient light model (0-offset blur-only) with subtle gold glow */
      --shadow-sm: 0 0 4px rgba(6, 10, 24, 0.5), 0 0 4px rgba(var(--color-gold), 0.03);
      --shadow-md: 0 0 12px rgba(6, 10, 24, 0.6), 0 0 8px rgba(var(--color-gold), 0.04);
      --shadow-lg: 0 0 24px rgba(6, 10, 24, 0.7), 0 0 12px rgba(var(--color-gold), 0.05);
      --shadow-xl: 0 0 40px rgba(6, 10, 24, 0.8), 0 0 16px rgba(var(--color-gold), 0.06);
      /* MED-26: Branded easing token — used across all interactive transitions */
      --ease-branded: cubic-bezier(0.16, 1, 0.3, 1);
      --transition-fast: 0.1s var(--ease-branded);   /* TR-F1: Tightened from 0.15s */
      --transition-normal: 0.18s var(--ease-branded); /* TR-F1: Tightened from 0.25s */
      --transition-slow: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      /* HIGH-3 + MED-4: Complete z-index token scale */
      --z-base: 0;
      --z-elevated: 10;
      --z-sticky: 100;
      --z-overlay: 1000;
      --z-modal: 9000;
      --z-toast: 9500;
      --z-install: 9800;
      --z-max: 9999;
      /* Radius: --radius-full for badges/avatars */
      --radius-full: 100px;
      --text-body: #dfe5ef;
      --text-heading: #edf1f8;
      --font-display: 'Rajdhani', ui-sans-serif, system-ui, sans-serif;
      --font-data: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      /* DC3-OLED1: OLED mode uses minimal lightness steps instead of collapsing all to 0% */
      /* MED-8: Widened surface elevation spread (+2% lightness per step) */
      --bg-card: ${oledMode ? 'rgba(8, 8, 8, 0.95)' : 'rgba(14, 19, 30, 0.55)'};
      --bg-card-inner: ${oledMode ? 'rgba(10, 10, 10, 1)' : 'rgba(6, 10, 18, 1)'};
      --bg-elevated: ${oledMode ? 'rgba(16, 16, 16, 0.95)' : 'rgba(20, 26, 38, 0.7)'};
      --bg-btn: ${oledMode ? 'rgba(12, 12, 12, 0.95)' : 'rgba(15, 20, 28, 0.85)'};
      --bg-input: ${oledMode ? 'rgba(14, 14, 14, 0.95)' : 'rgba(15, 20, 28, 0.9)'};
      --bg-stat: ${oledMode ? 'rgba(6, 6, 6, 0.9)' : 'rgba(10, 14, 22, 0.8)'};
      /* D-TOKEN-1: Border opacity tokens — replaces 30+ raw rgba(255,255,255,0.xx) border values */
      --border-subtle: rgba(255,255,255,0.06);
      --border-default: rgba(255,255,255,0.08);
      --border-medium: rgba(255,255,255,0.1);
      --border-hover: rgba(255,255,255,0.15);
      --border-bright: rgba(255,255,255,0.2);
      /* DC2-AC1: Accent hover token for hover state variations */
      --accent-hover: rgba(var(--color-gold), 0.8);
      /* DC2-BD1: Border focus token for focus ring definition */
      --border-focus: rgba(var(--color-gold), 0.5);
      /* DC3-BL1: Standardized backdrop-blur tokens */
      --blur-sm: 4px;
      --blur-md: 8px;
      --blur-lg: 16px;
      /* DC5-ST3: Trophy tier color tokens */
      --trophy-bronze: #cd7f32;
      --trophy-silver: #c0c0c0;
      --trophy-gold: #edaf18;
      --trophy-diamond: #b9f2ff;
      /* E7-CC2: Spacing tokens for remaining inline elements */
      /* BR-F2: Distinctive 6px base for prominent component spacing */
      --space-base: 6px;
      --space-xs: 4px;
      --space-sm: 8px;
      --space-md: 12px;
      --space-lg: 16px;
      --space-xl: 24px;
      --space-2xl: 32px;
      /* MED-3 + TK-F2: Radius token scale + component-level abstraction */
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --radius-xl: 16px;
      --card-radius: var(--radius-xl);
      --card-padding: 14px;
      --btn-radius: var(--radius-md);
      --stat-radius: var(--radius-lg);
      /* HIGH-2: Domain-semantic color tokens — consolidated from 66 unique hex values */
      /* Element colors */
      --element-fusion: #ef4444;
      --element-electro: #a855f7;
      --element-aero: #10b981;
      --element-glacio: #38bdf8;
      --element-havoc: #ec4899;
      --element-spectro: #edaf18;
      /* Rarity colors */
      --rarity-5star: rgba(var(--color-gold), 1);
      --rarity-4star: rgba(var(--color-purple), 1);
      /* State colors — CL-F2 + MED-11 */
      --state-error: #f87171;   /* oklch(68% 0.18 15°) */
      --state-success: #2dd4bf; /* oklch(72% 0.16 170°) */
      --state-info: #38bdf8;    /* oklch(76% 0.14 230°) */
      --color-warning: #f59e0b; /* oklch(75% 0.16 80°) — amber, distinct from brand gold */
      /* E3-CT2 + MED-7: Lightened cool accents for AAA contrast on dark bg */
      --accent-cyan: #67e8f9;   /* cyan-300, ~8:1 contrast */
      --accent-purple: #c084fc; /* purple-300, ~8:1 contrast (was #d8b4fe, adjusted for AAA) */
      /* HIGH-1: Chromatic text tokens — blue-hinted grays (hue ≈250°) */
      --text-secondary: #c5ccda; /* oklch(82% 0.010 250) — replaces text-gray-300 */
      --text-muted: #8f99ab;     /* oklch(65% 0.012 250) — replaces text-gray-400 */
      --text-disabled: #8b95a5;  /* oklch(65% 0.010 250) — replaces text-gray-500 */
      /* DBI3-S01: Calibrated 3-star rarity blue token */
      --rarity-3star: #60a5fa;
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
      scrollbar-color: rgba(140,160,200,0.18) transparent;
    }
    .overflow-y-auto::-webkit-scrollbar {
      width: 3px;
    }
    .overflow-y-auto::-webkit-scrollbar-track {
      background: transparent;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: rgba(140,160,200,0.18);
      border-radius: 3px;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: rgba(140,160,200,0.28);
    }
    
    /* ═══ IMPROVED FOCUS STATES ═══ */
    *:focus-visible {
      outline: 2px solid var(--border-focus);
      outline-offset: 2px;
    }

    button:focus-visible,
    select:focus-visible,
    input:focus-visible,
    textarea:focus-visible {
      outline: 2px solid var(--accent-hover);
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(var(--color-gold), 0.15);
    }
    
    /* ═══ TOUCH OPTIMIZATION ═══ */
    /* Native-app feel: prevent text selection and context menu on UI chrome */
    *, *::before, *::after {
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
    /* Allow text selection only on actual content and inputs */
    input, textarea, [contenteditable="true"], pre, code, .selectable {
      -webkit-user-select: text;
      user-select: text;
      -webkit-touch-callout: default;
    }
    button, select, input, textarea, a, [role="tab"], [role="button"] {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    
    /* E6-ER4: Inline field validation error state */
    .kuro-input-error {
      border-color: rgba(239, 68, 68, 0.6) !important;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    .kuro-field-error {
      color: #fca5a5;
      font-size: 10px;
      margin-top: 4px;
      display: block;
    }

    /* E5-IN5: Search input wrapper for consistent icon placement */
    .kuro-search-wrap {
      position: relative;
    }
    .kuro-search-wrap .kuro-input {
      padding-left: 32px;
    }
    .kuro-search-wrap svg:first-child {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7389;
      pointer-events: none;
    }

    /* E5-IN4 + MED-21: Custom select styling — replaces native chrome with HUD aesthetic */
    .kuro-select,
    .kuro-calc select {
      background: var(--bg-input);
      border: 1px solid var(--border-bright);
      border-radius: 8px;
      padding: 10px 12px;
      color: var(--text-heading);
      font-size: 14px;
      width: 100%;
      transition: border-color var(--transition-fast);
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 32px;
    }

    .kuro-select:focus-visible,
    .kuro-calc select:focus-visible {
      border-color: rgba(var(--color-gold), 0.5);
      outline: none;
    }

    /* Ensure minimum 44px touch targets for filter selects on touch devices */
    @media (pointer: coarse) {
      .kuro-body select {
        min-height: 44px;
      }
      /* P10-FIX: Ensure all standalone buttons meet minimum 36px touch target on touch devices (Step 10 audit — MEDIUM-5b) */
      .kuro-body button:not(.kuro-btn):not([role="tab"]):not([role="switch"]):not(.profile-pic-btn):not(.btn-icon-square) {
        min-height: 44px; /* MED-15: iOS HIG 44px minimum */
      }
    }
    
    .kuro-calc {
      position: relative;
      color: var(--text-body);
      /* AUDIT-FIX M23: Explicit body font-family fallback */
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    /* DBI3-S06: Refined Lucide icon stroke-width (1.5px default → 1.25px) for lighter feel */
    .kuro-calc svg {
      stroke-width: 1.25px;
    }

    /* E4-LH2: Relaxed line-height for multi-line small text (8-9px) */
    .kuro-calc p, .kuro-calc .text-\\[8px\\], .kuro-calc .text-\\[9px\\] {
      line-height: 1.625;
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Bottom sheet slide-up for mobile modals */
    @keyframes sheetSlideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @media (min-width: 640px) {
      @keyframes sheetSlideUp {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes borderGlow {
      0%, 100% { border-color: rgba(237, 175, 24, 0.3); }
      50% { border-color: rgba(237, 175, 24, 0.6); }
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
    
    /* D-HIERARCHY-2: Enhanced glow for 5★ — radial bg + stronger box-shadow for visual hierarchy */
    .glow-gold {
      box-shadow: 0 0 24px rgba(237, 175, 24, 0.20), inset 0 0 20px rgba(237, 175, 24, 0.06), 0 4px 12px rgba(0,0,0,0.3);
      background-image: radial-gradient(ellipse at 50% 80%, rgba(237, 175, 24, 0.08) 0%, transparent 60%);
    }

    @media (hover: hover) {
      .glow-gold:hover {
        box-shadow: 0 0 36px rgba(237, 175, 24, 0.30), inset 0 0 24px rgba(237, 175, 24, 0.08), 0 8px 20px rgba(0,0,0,0.4);
      }
    }

    /* 4★ glow — intentionally subtler than 5★ for visual hierarchy */
    .glow-purple {
      box-shadow: 0 0 16px rgba(168, 85, 247, 0.12), 0 4px 12px rgba(0,0,0,0.3);
    }

    @media (hover: hover) {
      .glow-purple:hover {
        box-shadow: 0 0 24px rgba(168, 85, 247, 0.20), 0 8px 20px rgba(0,0,0,0.4);
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
      stroke: var(--border-subtle);
    }
    .pity-ring-fill {
      fill: none;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      filter: drop-shadow(0 0 4px var(--ring-glow));
    }
    .pity-ring-text {
      font-family: var(--font-data);
      font-weight: 700;
      fill: currentColor;
      text-anchor: middle;
      dominant-baseline: central;
      letter-spacing: -0.02em;
    }
    
    /* ═══ LUCK BADGE ═══ */
    .luck-badge {
      position: relative;
      overflow: hidden;
      padding: 2px;
    }
    .luck-badge::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: conic-gradient(from 0deg, var(--badge-color), transparent 30%, transparent 70%, var(--badge-color));
      animation: badgeRotate 12s linear infinite !important;
      opacity: 0.7;
      filter: blur(4px);
    }
    @keyframes badgeRotate {
      to { transform: rotate(360deg); }
    }
    /* §BANNER_ANIM: outer glow wrapper (not clipped by overflow:hidden) + inner border line */
    .banner-card-glow {
      animation: bannerGlow 7s ease-in-out infinite !important;
    }
    .banner-card-glow > div {
      border-color: rgba(var(--glow-color), 0.3) !important;
      animation: bannerBorderGlow 7s ease-in-out infinite !important;
    }
    @keyframes bannerGlow {
      0%, 100% {
        box-shadow:
          0 0 40px rgba(237,175,24,0.06),
          0 4px 16px rgba(0,0,0,0.3),
          0 0 10px 2px rgba(var(--glow-color), 0.18);
      }
      50% {
        box-shadow:
          0 0 40px rgba(237,175,24,0.06),
          0 4px 16px rgba(0,0,0,0.3),
          0 0 18px 4px rgba(var(--glow-color), 0.35),
          0 0 3px 1px rgba(var(--glow-color), 0.5);
      }
    }
    @keyframes bannerBorderGlow {
      0%, 100% { border-color: rgba(var(--glow-color), 0.3); }
      50% { border-color: rgba(var(--glow-color), 0.85); }
    }
    .moon-glow-pulse {
      border-radius: 50%;
      background: radial-gradient(circle, rgba(240,245,255,1) 0%, rgba(225,235,255,0.7) 20%, rgba(200,220,250,0.3) 38%, rgba(180,210,240,0.1) 50%, transparent 60%);
      animation: moonGlowPulse 8s ease-in-out infinite !important;
    }
    @keyframes moonGlowPulse {
      0%, 100% {
        opacity: 0.3;
        transform: translate(-50%, -50%) scale(0.9);
      }
      50% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.15);
      }
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
      transition: background var(--transition-fast);
    }
    @media (hover: hover) {
      .pull-log-row:hover {
        background: rgba(255,255,255,0.08) !important;
      }
    }
    
    /* ═══ TAB SLIDING INDICATOR ═══ */
    /* SH-F1: Asymmetric radius on tab indicator for non-rectangular visual interest */
    .tab-indicator {
      position: absolute;
      bottom: 0;
      height: 2px;
      border-radius: 4px 4px 0 0;
      transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    /* ═══ CARD SYSTEM - Glassy gradient with ambient glow ═══ */
    .kuro-card {
      position: relative;
      z-index: 5;
      background: var(--bg-card);
      border: 1px solid var(--border-default);
      border-radius: 16px;
      overflow: visible;
      backdrop-filter: blur(var(--blur-sm));
      -webkit-backdrop-filter: blur(var(--blur-sm));
      /* E1-SHD1: Use shadow token + hairline accents */
      box-shadow:
        var(--shadow-lg),
        0 0 0 1px var(--card-outline, rgba(255, 255, 255, 0.03)),
        inset 0 0 0 1px rgba(255, 255, 255, 0.05);
      transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
    }

    @media (hover: hover) {
      /* E7-AD6: Use shadow token instead of raw values */
      .kuro-card:hover {
        border-color: var(--border-hover);
        transform: translateY(-2px);
        box-shadow:
          var(--shadow-xl),
          0 0 0 1px var(--card-outline-hover, rgba(255, 255, 255, 0.06)),
          0 0 40px var(--card-glow, rgba(100, 140, 200, 0.03)),
          inset 0 0 0 1px rgba(255, 255, 255, 0.08);
      }
    }
    
    /* Interactive card variant */
    .kuro-card.interactive {
      cursor: pointer;
    }
    .kuro-card.interactive:active {
      transform: translateY(0) scale(0.98);
      transition: transform var(--transition-fast);
    }
    
    /* Top shimmer line — exactly on the card border */
    .kuro-card::after {
      content: '';
      position: absolute;
      top: -0.75px;
      left: 0;
      right: 0;
      height: 0.75px;
      background: linear-gradient(90deg,
        transparent 0%,
        var(--shimmer-color, rgba(255, 255, 255, 0.45)) 20%,
        var(--shimmer-color-bright, rgba(255, 255, 255, 0.7)) 50%,
        var(--shimmer-color, rgba(255, 255, 255, 0.45)) 80%,
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
      overflow: visible;
      border-radius: 15px;
    }
    
    /* Corner decorations */
    .kuro-card-inner::before {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 12px;
      height: 12px;
      border-top: 1px solid var(--border-bright);
      border-right: 1px solid var(--border-bright);
      border-radius: 0 4px 0 0;
      z-index: 2;
      opacity: 0.85;
    }

    .kuro-card-inner::after {
      content: '';
      position: absolute;
      bottom: 8px;
      left: 8px;
      width: 12px;
      height: 12px;
      border-bottom: 1px solid var(--border-bright);
      border-left: 1px solid var(--border-bright);
      border-radius: 0 0 0 4px;
      z-index: 2;
      opacity: 0.85;
    }
    
    .kuro-header {
      position: relative;
      padding: 14px;
      border-bottom: 1px solid var(--border-subtle);
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
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      line-height: 1.25;
      letter-spacing: 0.03em; /* E4-LS1: Intentional terminal-style positive tracking at 14px */
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
      background: linear-gradient(180deg, rgba(237, 175, 24, 0.9), rgba(237, 175, 24, 0.4));
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(237, 175, 24, 0.3);
    }
    
    .kuro-body {
      padding: 14px;
      color: var(--text-body);
    }

    /* HIGH-1: Override achromatic Tailwind grays with chromatic blue-hinted tokens */
    .text-gray-300 {
      color: var(--text-secondary) !important;
    }
    .text-gray-400 {
      color: var(--text-muted) !important;
    }
    .text-gray-500 {
      color: var(--text-disabled) !important;
    }

    /* §E9-AG-F3: Override Tailwind transition-colors timing with branded curve */
    .transition-colors {
      transition-duration: 0.1s !important;
      transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    /* DBI3-S01: Calibrated 3-star rarity color utility */
    .text-rarity-3star {
      color: var(--rarity-3star);
    }
    
    /* ═══ BUTTONS - Glassy style with bright text ═══ */
    .kuro-btn {
      position: relative;
      background: var(--bg-btn);
      border: 1px solid var(--border-medium);
      border-radius: 12px;
      padding: 10px 12px;
      color: var(--text-heading);
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.02em;
      cursor: pointer;
      transition: transform var(--transition-normal), background var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal), color var(--transition-fast);
      text-align: center;
      box-shadow: var(--shadow-md);
      backdrop-filter: blur(var(--blur-md));
      -webkit-backdrop-filter: blur(var(--blur-md));
    }

    /* Ripple container */
    .kuro-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%);
      opacity: 0;
      transition: opacity var(--transition-normal);
      pointer-events: none;
    }
    
    @media (hover: hover) {
      .kuro-btn:hover {
        border-color: var(--border-bright);
        color: var(--text-heading);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }
      
      .kuro-btn:hover::before {
        opacity: 1;
      }
    }
    
    .kuro-btn:active {
      transform: translateY(0) scale(0.97);
      transition: transform var(--transition-fast);
    }

    /* AUDIT-FIX M30: Disabled button state — §DP3: cool-shifted opacity */
    .kuro-btn:disabled, .kuro-btn[disabled] {
      opacity: 0.4;
      filter: saturate(0.7) brightness(0.8);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* §DI3: Global icon hover color transitions
       Ensures every Lucide SVG inside an interactive element
       transitions color smoothly + gains a subtle atmospheric glow */
    button svg, a svg, [role="button"] svg {
      transition: color var(--transition-fast), filter var(--transition-fast);
    }
    @media (hover: hover) {
      button:hover > svg,
      a:hover > svg,
      [role="button"]:hover > svg,
      button:hover svg,
      a:hover svg,
      [role="button"]:hover svg {
        filter: drop-shadow(0 0 3px currentColor);
      }
      button:disabled:hover svg,
      button[disabled]:hover svg {
        filter: none;
      }
    }

    /* DBI1-ARC3: Hero CTA variant — elevated gold gradient for primary actions */
    .kuro-btn-hero {
      background: linear-gradient(135deg, rgba(237, 175, 24, 0.2), rgba(237, 175, 24, 0.1));
      border-color: rgba(237, 175, 24, 0.7);
      color: #fef08a;
      box-shadow: 0 0 20px rgba(237, 175, 24, 0.2), 0 4px 16px rgba(0,0,0,0.3);
      text-shadow: 0 0 12px rgba(237, 175, 24, 0.5);
      padding: 12px 20px;
      font-weight: 600;
    }
    @media (hover: hover) {
      .kuro-btn-hero:hover {
        box-shadow: 0 0 30px rgba(237, 175, 24, 0.35), 0 6px 20px rgba(0,0,0,0.4);
        border-color: rgba(237, 175, 24, 0.9);
      }
    }

    /* MED-6: Compact button variants for inline actions */
    .kuro-btn-sm {
      font-size: 12px;
      padding: 4px 10px;
      min-height: 28px;
    }
    .kuro-btn-icon {
      padding: 6px;
      aspect-ratio: 1;
      min-height: 28px;
    }

    /* E5-BT6: Button loading state — spinner + preserved width */
    .kuro-btn-loading {
      position: relative;
      color: transparent !important;
      pointer-events: none;
    }
    .kuro-btn-loading::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 14px;
      height: 14px;
      margin: -7px 0 0 -7px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: rgba(237, 175, 24, 0.9);
      border-radius: 50%;
      animation: kuroSpin 0.6s linear infinite;
    }
    @keyframes kuroSpin {
      to { transform: rotate(360deg); }
    }

    /* E5-BT2: Button hierarchy — primary (gold bg), ghost (transparent), danger (red) */
    .kuro-btn-primary {
      background: rgba(237, 175, 24, 0.15) !important;
      border-color: rgba(237, 175, 24, 0.4) !important;
      color: #edaf18 !important;
      font-weight: 600;
    }
    .kuro-btn-primary:hover {
      background: rgba(237, 175, 24, 0.25) !important;
    }
    .kuro-btn-ghost {
      background: transparent;
      border-color: transparent;
      color: var(--text-body);
    }
    @media (hover: hover) {
      .kuro-btn-ghost:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--border-medium);
      }
    }
    .kuro-btn-danger {
      background: rgba(239, 68, 68, 0.1) !important;
      border-color: rgba(239, 68, 68, 0.3) !important;
      color: #f87171 !important;
    }
    .kuro-btn-danger:hover {
      background: rgba(239, 68, 68, 0.2) !important;
    }

    /* Active states with glassy glow */
    .kuro-btn.active-gold {
      background: linear-gradient(180deg, rgba(237, 175, 24, 0.18) 0%, rgba(237, 175, 24, 0.10) 100%);
      border-color: rgba(237, 175, 24, 0.7);
      color: #fef08a;
      box-shadow: 0 0 20px rgba(237, 175, 24, 0.25), 0 4px 12px rgba(0,0,0,0.3);
      text-shadow: 0 0 12px rgba(237, 175, 24, 0.6);
      animation: borderGlow 2s ease-in-out infinite;
    }

    .kuro-btn.active-pink {
      background: linear-gradient(180deg, rgba(236, 72, 153, 0.18) 0%, rgba(236, 72, 153, 0.10) 100%);
      border-color: rgba(236, 72, 153, 0.7);
      color: #fbcfe8;
      box-shadow: 0 0 20px rgba(236, 72, 153, 0.25), 0 4px 12px rgba(0,0,0,0.3);
      text-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
    }

    /* Blue for Standard banners */
    .kuro-btn.active-cyan {
      background: linear-gradient(180deg, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0.10) 100%);
      border-color: rgba(56, 189, 248, 0.7);
      color: #bae6fd;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.25), 0 4px 12px rgba(0,0,0,0.3);
      text-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
    }

    .kuro-btn.active-purple {
      background: linear-gradient(180deg, rgba(168, 85, 247, 0.18) 0%, rgba(168, 85, 247, 0.10) 100%);
      border-color: rgba(168, 85, 247, 0.7);
      color: #e9d5ff;
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.25), 0 4px 12px rgba(0,0,0,0.3);
      text-shadow: 0 0 12px rgba(168, 85, 247, 0.6);
    }

    /* Muted green for Both options */
    .kuro-btn.active-emerald {
      background: linear-gradient(180deg, rgba(34, 197, 94, 0.18) 0%, rgba(34, 197, 94, 0.10) 100%);
      border-color: rgba(34, 197, 94, 0.7);
      color: #86efac;
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.20), 0 4px 12px rgba(0,0,0,0.3);
      text-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
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
      border: 1px solid var(--border-bright);
      border-radius: 8px;
      padding: 10px 12px;
      color: var(--text-heading);
      font-size: 14px;
      width: 100%;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
      backdrop-filter: blur(var(--blur-md));
      -webkit-backdrop-filter: blur(var(--blur-md));
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
      color: #6b7389;
      transition: color var(--transition-fast);
    }

    .kuro-input:focus::placeholder {
      color: #8f99ab;
    }
    
    /* E2-MO2: Compact inputs on mobile for above-fold density */
    @media (max-width: 640px) {
      .kuro-calc .kuro-input {
        padding: 8px 10px;
        font-size: 13px;
      }
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
      border: 1px solid var(--border-hover);
      border-radius: 12px; /* E7-AD1: Standardized to 12px (8/12/16 scale) */
      padding: 14px;
      text-align: center;
      overflow: hidden;
      font-family: var(--font-data);
      line-height: 1.3;
      backdrop-filter: blur(var(--blur-sm));
      -webkit-backdrop-filter: blur(var(--blur-sm));
      font-variant-numeric: tabular-nums;
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    /* E2-DC1: Calculator stat boxes get extra padding to match density baseline */
    .kuro-calc .kuro-stat {
      padding: 16px;
    }

    /* E3-SC3: Neutral hover for default stat boxes; gold reserved for .kuro-stat-gold */
    @media (hover: hover) {
      .kuro-stat:hover {
        transform: translateY(-1px);
        border-color: var(--border-bright);
        box-shadow: 0 4px 16px rgba(100, 140, 200, 0.08);
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
      background: rgba(237, 175, 24, 0.15);
      border-color: rgba(237, 175, 24, 0.5);
    }
    .kuro-stat-gold::before {
      background: linear-gradient(90deg, transparent, rgba(237, 175, 24, 1), transparent);
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
        border-color: rgba(237, 175, 24, 0.7);
        box-shadow: 0 4px 20px rgba(237, 175, 24, 0.15);
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
    /* TY-F2: Type scale — Primary: 14px base × 1.125 Major Second (14→16→18→20→24→30).
       Micro "instrument display" range (8–12px) is linear by design for data-dense UIs.
       PS-F1: 10px is the floor for functional text; 9px reserved for decorative labels only.
       E4-HH2: Font micro-scale (8–12px) is intentional "instrument display" density.
       8px: badge counters, star indicators   9px: metadata, timestamps
       10px: labels, categories, button text  11px: secondary info (snapped to 12px)
       12px: compact body text                14px: primary values, card content */
    /* E2-PR1: Label at 10px vs value at 14px = 1.4:1 ratio (was 12px = 1.17:1) */
    .kuro-label {
      color: var(--text-body);
      font-family: var(--font-display);
      font-size: 10px;
      line-height: 1.3;
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
      background: linear-gradient(135deg, #e6b030, #edaf18);
      cursor: pointer;
      border: 2px solid rgba(0,0,0,0.4);
      box-shadow: 0 0 12px rgba(237, 175, 24, 0.6);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    
    .kuro-slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 0 18px rgba(237, 175, 24, 0.8);
    }
    
    .kuro-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e6b030, #edaf18);
      cursor: pointer;
      border: 2px solid rgba(0,0,0,0.4);
      box-shadow: 0 0 12px rgba(237, 175, 24, 0.6);
    }
    /* P12-FIX: Firefox slider hover states + range-track (Step 12 audit — MEDIUM-12k) */
    .kuro-slider::-moz-range-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 0 18px rgba(237, 175, 24, 0.8);
    }
    .kuro-slider::-moz-range-track {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 3px;
      height: 6px;
      border: none;
    }
    
    /* ═══ PRIORITY SLIDER THUMB (neutral so it stands out against both gold & pink track) ═══ */
    .priority-slider::-webkit-slider-thumb {
      background: linear-gradient(135deg, #ffffff, #e5e7eb);
      box-shadow: 0 0 8px rgba(255,255,255,0.5), 0 1px 4px rgba(0,0,0,0.3);
    }
    .priority-slider::-webkit-slider-thumb:hover {
      box-shadow: 0 0 14px rgba(255,255,255,0.7), 0 1px 6px rgba(0,0,0,0.3);
    }
    .priority-slider::-moz-range-thumb {
      background: linear-gradient(135deg, #ffffff, #e5e7eb);
      box-shadow: 0 0 8px rgba(255,255,255,0.5), 0 1px 4px rgba(0,0,0,0.3);
    }
    .priority-slider::-moz-range-thumb:hover {
      box-shadow: 0 0 14px rgba(255,255,255,0.7), 0 1px 6px rgba(0,0,0,0.3);
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
        text-shadow: 0 0 15px rgba(251, 146, 60, 0.9); /* E7-VN2: Single shadow for clarity */
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
        text-shadow: 0 0 15px rgba(103, 232, 249, 0.9);
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
        text-shadow: 0 0 15px rgba(236, 72, 153, 0.9);
      }
    }
    
    /* ═══ NUMBER STYLING ═══ */
    .kuro-number {
      font-family: var(--font-data);
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      line-height: 1.2;
    }

    /* E7-PD2: Card-like utility for inline containers that should match Card styling */
    .kuro-card-inline {
      background: var(--bg-card);
      border: 1px solid var(--border-default);
      border-radius: 12px;
      padding: 12px;
      backdrop-filter: blur(var(--blur-sm));
      -webkit-backdrop-filter: blur(var(--blur-sm));
    }

    /* MED-33: Persistent admin lockout inline banner */
    .kuro-lockout-banner {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: var(--radius-lg);
      padding: 12px;
      text-align: center;
      color: var(--color-warning);
      font-size: 13px;
    }

    /* MED-36: Chart container with responsive aspect ratio */
    .kuro-chart-container {
      aspect-ratio: 16 / 9;
      max-height: 300px;
      min-height: 150px;
    }

    /* MED-22: Pity danger zone — progressive visual urgency */
    .pity-danger {
      box-shadow: 0 0 8px rgba(237,175,24,0.4);
      animation: pityPulse 0.5s ease-in-out infinite alternate;
    }
    .pity-critical {
      box-shadow: 0 0 12px rgba(237,175,24,0.6);
      animation: pityPulse 0.3s ease-in-out infinite alternate;
    }
    @keyframes pityPulse {
      to { box-shadow: 0 0 16px rgba(237,175,24,0.8); }
    }

    /* MED-23: Collection milestone celebration */
    @keyframes milestoneShimmer {
      0% { box-shadow: 0 0 0 rgba(237,175,24,0); }
      50% { box-shadow: 0 0 32px rgba(237,175,24,0.15), inset 0 0 16px rgba(237,175,24,0.05); }
      100% { box-shadow: 0 0 0 rgba(237,175,24,0); }
    }
    .kuro-milestone {
      animation: milestoneShimmer 1s ease-out;
    }

    /* MED-14: Sticky result summary bar for above-fold results */
    .kuro-sticky-result {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--bg-card);
      backdrop-filter: blur(var(--blur-lg));
      -webkit-backdrop-filter: blur(var(--blur-lg));
      border-bottom: 1px solid var(--border-default);
      padding: 8px 12px;
    }

    /* E7-SQ2: Gold-accented result hero for Calculator probability display */
    .kuro-stat-hero {
      padding: 20px;
      border-color: rgba(237, 175, 24, 0.4);
      box-shadow: var(--shadow-md), 0 0 20px rgba(237, 175, 24, 0.08);
    }

    /* E5-IF4: Custom tooltip style — glassmorphic with gold accent */
    .kuro-tooltip {
      position: absolute;
      z-index: 9999;
      padding: 6px 10px;
      font-size: 11px;
      color: var(--text-heading);
      background: rgba(12, 16, 24, 0.92);
      border: 1px solid rgba(237, 175, 24, 0.3);
      border-radius: 6px;
      backdrop-filter: blur(var(--blur-md));
      -webkit-backdrop-filter: blur(var(--blur-md));
      box-shadow: var(--shadow-md);
      pointer-events: none;
      white-space: nowrap;
    }

    /* E4-TC4: Ensure column-aligned numbers in grids use tabular figures */
    .kuro-calc .grid .font-bold,
    .kuro-calc .grid .font-extrabold {
      font-variant-numeric: tabular-nums;
    }

    /* D-TYPE-4: Scoreboard numeral treatment for countdown timers */
    .kuro-scoreboard {
      font-family: var(--font-data);
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: -0.02em;
      line-height: 1;
    }

    /* ═══ SKELETON LOADING — D-MOTION-1 ═══ */
    @keyframes kuroShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .kuro-skeleton {
      background: rgba(12, 16, 24, 0.55);
      background-image: linear-gradient(90deg, transparent 0%, rgba(237, 175, 24, 0.06) 40%, rgba(237, 175, 24, 0.10) 50%, rgba(237, 175, 24, 0.06) 60%, transparent 100%);
      background-size: 200% 100%;
      animation: kuroShimmer 1.8s ease-in-out infinite;
      border-radius: 6px;
    }
    .kuro-skeleton-row {
      height: 36px;
      margin-bottom: 6px;
      border-radius: 8px;
    }
    .kuro-skeleton-stat {
      height: 72px;
      border-radius: 10px;
    }
    .kuro-skeleton-text {
      height: 10px;
      border-radius: 4px;
    }
    .kuro-skeleton-circle {
      border-radius: 50%;
    }
    /* E5-CD6: Image skeleton placeholder for collection/character detail modals */
    .kuro-skeleton-image {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 10px;
    }

    /* ═══ EMPTY STATE — D-STATE-1 atmospheric upgrade ═══ */
    @keyframes emptyFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .kuro-empty-state {
      position: relative;
      background: radial-gradient(ellipse at center, rgba(237, 175, 24, 0.04) 0%, transparent 70%);
      border-radius: 8px;
      animation: emptyFadeIn var(--transition-slow) ease-out both;
      border: 1px dashed rgba(237, 175, 24, 0.10);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.01em;
    }
    .kuro-empty-state::before {
      content: '';
      position: absolute;
      top: 0; left: 50%; transform: translateX(-50%);
      width: 40px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(237, 175, 24, 0.3), transparent);
    }

    /* §E10-RD-F2: Stack planner projection grids vertically on narrow viewports */
    @media (max-width: 400px) {
      .kuro-calc .grid.grid-cols-3 {
        grid-template-columns: 1fr;
      }
    }

    /* E6-AP4: Active press feedback for non-kuro buttons */
    .kuro-calc button:not(.kuro-btn):active {
      transform: scale(0.97);
      transition: transform 0.1s ease;
    }

    /* HIGH-6: 5-star celebration animation — gold screen-edge glow */
    @keyframes celebrateGold {
      0%   { box-shadow: 0 0 0 0 rgba(237,175,24,0.6); }
      50%  { box-shadow: 0 0 40px 20px rgba(237,175,24,0.2); }
      100% { box-shadow: 0 0 0 0 rgba(237,175,24,0); }
    }
    .celebrate-5star {
      animation: celebrateGold 1.5s var(--ease-branded);
    }
    /* Lucky pull — subtle gold border pulse on early-pity entries */
    .celebrate-lucky {
      animation: celebrateGold 0.8s var(--ease-branded);
    }

    /* §E10-EP-F2: Entrance celebration — staggered gold pulse for first data population */
    @keyframes kuroEntrance {
      0% { opacity: 0; transform: translateY(12px) scale(0.97); }
      60% { opacity: 1; transform: translateY(-2px) scale(1.01); box-shadow: 0 0 16px rgba(237,175,24,0.12); }
      100% { opacity: 1; transform: translateY(0) scale(1); box-shadow: none; }
    }
    .kuro-entrance > * {
      animation: kuroEntrance 0.4s ease-out both;
    }
    .kuro-entrance > *:nth-child(2) { animation-delay: 0.08s; }
    .kuro-entrance > *:nth-child(3) { animation-delay: 0.16s; }
    .kuro-entrance > *:nth-child(4) { animation-delay: 0.24s; }
    .kuro-entrance > *:nth-child(5) { animation-delay: 0.32s; }

    /* E8-CO1: Gold shimmer on import success card */
    @keyframes importCelebrate {
      0% { box-shadow: 0 0 0 rgba(237, 175, 24, 0); }
      50% { box-shadow: 0 0 24px rgba(237, 175, 24, 0.2), inset 0 0 16px rgba(237, 175, 24, 0.05); }
      100% { box-shadow: 0 0 0 rgba(237, 175, 24, 0); }
    }
    .kuro-import-success {
      animation: importCelebrate 0.8s ease-out;
    }

    /* E7-PL1: Success toast checkmark scale-in animation */
    @keyframes checkPop {
      0% { transform: scale(0); opacity: 0; }
      60% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }
    [role="status"] svg.text-emerald-400,
    [role="status"] svg.text-green-400 {
      animation: checkPop 0.3s ease-out both;
    }

    /* E6-AN2: Exit animation utility for removed elements */
    @keyframes kuroExit {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-8px); }
    }
    .kuro-exit {
      animation: kuroExit 0.2s ease-out forwards;
    }

    /* E6-HV9: Suppress hover effects on touch-only devices to prevent sticky states */
    @media (hover: none) {
      .kuro-calc button:hover,
      .kuro-calc a:hover,
      .kuro-calc [role="button"]:hover {
        transform: none !important;
        filter: none !important;
      }
    }

    /* CP-F2: Golden-ratio layout split for desktop Stats/Planner overview */
    @media (min-width: 1024px) {
      .desktop-grid-golden {
        display: grid;
        grid-template-columns: 1fr 0.618fr;
        gap: 12px;
      }
    }

    /* TY-F3: Balanced text wrapping on headings */
    h1, h2, h3, .text-2xl, .text-xl {
      text-wrap: balance;
    }

    /* TY-F4: Max width for prose readability */
    .kuro-body p, .kuro-tooltip, [role="dialog"] p {
      max-width: 65ch;
    }

    /* TB-F2: Number alignment in stat columns */
    .kuro-calc td, .kuro-calc .kuro-stat-value {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    /* HV-F2: Asymmetric hover timing (fast enter, slow exit) */
    .kuro-btn, .kuro-card, .collection-card {
      transition-duration: 0.2s; /* slow exit */
    }
    @media (hover: hover) {
      .kuro-btn:hover, .kuro-card:hover, .collection-card:hover {
        transition-duration: 0.12s; /* fast enter */
      }
    }

    /* ST-F1: Cap card stagger animation delay at 150ms */
    .tab-content > * {
      animation-delay: min(calc(var(--card-index, 0) * 40ms), 150ms);
    }

    /* WB-F2: OKLCH fallback pattern — for new colors, use:
       .el { background: #hex; background: oklch(...); }
       This ensures graceful degradation in browsers without OKLCH support. */

    /* §E10-DT-F3: Semantic table styling */
    [role="table"] {
      width: 100%;
    }
    [role="columnheader"] {
      font-weight: 600;
      text-align: left;
      font-size: 10px;
      color: var(--text-body);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* CP-F1: Increase between-section spacing ratio (3-5× component gap) */
    .kuro-calc > .space-y-3 > * + * {
      margin-top: 12px;
    }

    /* DV-F1 + SR-F1: Angular corner brackets on featured cards (WuWa-inspired) */
    .card-featured {
      position: relative;
      border-left: 2px solid rgba(237, 175, 24, 0.5);
    }
    .card-featured::before,
    .card-featured::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      border-color: rgba(237, 175, 24, 0.4);
      border-style: solid;
    }
    .card-featured::before {
      top: -1px;
      left: -1px;
      border-width: 2px 0 0 2px;
    }
    .card-featured::after {
      bottom: -1px;
      right: -1px;
      border-width: 0 2px 2px 0;
    }

    /* SR-F1: Wave-pattern section divider */
    .kuro-wave-divider {
      height: 4px;
      background: repeating-linear-gradient(
        90deg,
        transparent 0px,
        rgba(237, 175, 24, 0.15) 4px,
        transparent 8px,
        rgba(140, 160, 200, 0.08) 12px,
        transparent 16px
      );
      border-radius: 2px;
      margin: 16px 0;
    }

    /* CD-F1: Purpose-based card variants */
    .card-data {
      padding: 10px;
    }
    .card-action {
      background: rgba(255, 255, 255, 0.03);
    }

    /* §E9-MO-F4: Branded transition timing for range sliders */
    input[type="range"] {
      transition: var(--transition-fast);
    }

    /* IN-F1: Filled-state visual distinction for inputs */
    .kuro-input:not(:placeholder-shown) {
      border-color: var(--border-hover);
      background: rgba(15, 20, 28, 0.95);
    }

    /* TB-F1: Table row hover feedback */
    @media (hover: hover) {
      .pull-log-row:hover,
      .kuro-calc tr:hover {
        background: rgba(237, 175, 24, 0.04) !important;
      }
    }

    /* FB-F1: Delete/removal slide-out animation */
    @keyframes kuroSlideOut {
      from { opacity: 1; transform: translateX(0); max-height: 100px; }
      to { opacity: 0; transform: translateX(-20px); max-height: 0; overflow: hidden; }
    }
    .kuro-slide-out {
      animation: kuroSlideOut 0.2s ease-out forwards;
    }

    /* RS-F1: Responsive typography compression for narrow viewports */
    @media (max-width: 768px) {
      .text-5xl { font-size: 36px !important; }
      .text-4xl { font-size: 30px !important; }
      .text-2xl { font-size: 20px !important; }
    }

    /* §DST1: Ghost-grid placeholder cells for collection empty state */
    @keyframes ghostPulse {
      0%, 100% { opacity: 0.04; }
      50% { opacity: 0.08; }
    }
    .ghost-grid-cell {
      background: linear-gradient(
        135deg,
        rgba(140, 160, 200, 0.06) 0%,
        rgba(140, 160, 200, 0.02) 50%,
        rgba(140, 160, 200, 0.05) 100%
      );
      animation: ghostPulse 2.5s ease-in-out infinite;
    }

    /* ═══ DIVIDER ═══ */
    .kuro-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border-hover), transparent);
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
      scrollbar-color: rgba(140,160,200,0.18) transparent;
    }
    .kuro-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .kuro-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .kuro-scroll::-webkit-scrollbar-thumb {
      background: rgba(140,160,200,0.18);
      border-radius: 2px;
    }
    .kuro-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(140,160,200,0.28);
    }
    @media (hover: hover) {
      /* E7-VN3: Reduced glow opacity (-30%) to avoid competing with card system */
      .collection-card:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      }
    }
    .collection-card:active {
      transform: translateY(-2px) scale(1.01);
      transition: transform var(--transition-fast);
    }
    
    /* ═══ FULL ANIMATIONS — 2× intensity mode ═══ */

    /* Glow effects: stronger box-shadows & drop-shadows */
    .animations-full .glow-gold {
      box-shadow: 0 0 36px rgba(237, 175, 24, 0.35), inset 0 0 28px rgba(237, 175, 24, 0.10), 0 4px 12px rgba(0,0,0,0.3);
    }
    .animations-full .glow-purple {
      box-shadow: 0 0 24px rgba(168, 85, 247, 0.22), 0 4px 12px rgba(0,0,0,0.3);
    }
    @media (hover: hover) {
      .animations-full .glow-gold:hover {
        box-shadow: 0 0 48px rgba(237, 175, 24, 0.45), inset 0 0 32px rgba(237, 175, 24, 0.12), 0 8px 20px rgba(0,0,0,0.4);
      }
      .animations-full .glow-purple:hover {
        box-shadow: 0 0 36px rgba(168, 85, 247, 0.30), 0 8px 20px rgba(0,0,0,0.4);
      }
    }

    /* Soft pity pulses: stronger glow range */
    .animations-full .kuro-soft-pity {
      animation: kuroPulseOrangeFull 1.5s ease-in-out infinite;
    }
    .animations-full .kuro-soft-pity-cyan {
      animation: kuroPulseCyanFull 1.5s ease-in-out infinite;
    }
    .animations-full .kuro-soft-pity-pink {
      animation: kuroPulsePinkFull 1.5s ease-in-out infinite;
    }
    @keyframes kuroPulseOrangeFull {
      0%, 100% { text-shadow: 0 0 12px rgba(251, 146, 60, 0.8); }
      50% { text-shadow: 0 0 24px rgba(251, 146, 60, 1); }
    }
    @keyframes kuroPulseCyanFull {
      0%, 100% { text-shadow: 0 0 12px rgba(103, 232, 249, 0.8); }
      50% { text-shadow: 0 0 24px rgba(103, 232, 249, 1); }
    }
    @keyframes kuroPulsePinkFull {
      0%, 100% { text-shadow: 0 0 12px rgba(236, 72, 153, 0.8); }
      50% { text-shadow: 0 0 24px rgba(236, 72, 153, 1); }
    }

    /* Pity danger/critical: stronger pulsing box-shadow */
    .animations-full .pity-danger {
      box-shadow: 0 0 12px rgba(237,175,24,0.6);
      animation: pityPulseFull 0.4s ease-in-out infinite alternate;
    }
    .animations-full .pity-critical {
      box-shadow: 0 0 16px rgba(237,175,24,0.8);
      animation: pityPulseFull 0.25s ease-in-out infinite alternate;
    }
    @keyframes pityPulseFull {
      to { box-shadow: 0 0 24px rgba(237,175,24,1); }
    }

    /* Card shimmer: brighter shimmer line */
    .animations-full .kuro-card::after {
      animation: shimmer 2s ease-in-out infinite;
      background: linear-gradient(90deg,
        transparent 0%,
        var(--shimmer-color, rgba(255, 255, 255, 0.4)) 20%,
        var(--shimmer-color-bright, rgba(255, 255, 255, 0.7)) 50%,
        var(--shimmer-color, rgba(255, 255, 255, 0.4)) 80%,
        transparent 100%
      );
    }

    /* Card hover: more dramatic lift */
    @media (hover: hover) {
      .animations-full .kuro-card:hover {
        transform: translateY(-4px);
        box-shadow:
          var(--shadow-xl),
          0 0 0 1px var(--card-outline-hover, rgba(255, 255, 255, 0.08)),
          0 0 50px var(--card-glow, rgba(100, 140, 200, 0.06)),
          inset 0 0 0 1px rgba(255, 255, 255, 0.10);
      }
      .animations-full .collection-card:hover {
        transform: translateY(-6px) scale(1.03);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
      }
    }

    /* Celebrations: bigger gold glow expansion */
    .animations-full .celebrate-5star {
      animation: celebrateGoldFull 1.5s var(--ease-branded);
    }
    .animations-full .celebrate-lucky {
      animation: celebrateGoldFull 0.8s var(--ease-branded);
    }
    @keyframes celebrateGoldFull {
      0%   { box-shadow: 0 0 0 0 rgba(237,175,24,0.8); }
      50%  { box-shadow: 0 0 60px 30px rgba(237,175,24,0.3); }
      100% { box-shadow: 0 0 0 0 rgba(237,175,24,0); }
    }

    /* Import success: stronger gold shimmer */
    .animations-full .kuro-import-success {
      animation: importCelebrateFull 0.8s ease-out;
    }
    @keyframes importCelebrateFull {
      0% { box-shadow: 0 0 0 rgba(237, 175, 24, 0); }
      50% { box-shadow: 0 0 36px rgba(237, 175, 24, 0.3), inset 0 0 24px rgba(237, 175, 24, 0.08); }
      100% { box-shadow: 0 0 0 rgba(237, 175, 24, 0); }
    }

    /* Milestone celebration: stronger shimmer */
    .animations-full .kuro-milestone {
      animation: milestoneShimmerFull 1s ease-out;
    }
    @keyframes milestoneShimmerFull {
      0% { box-shadow: 0 0 0 rgba(237,175,24,0); }
      50% { box-shadow: 0 0 48px rgba(237,175,24,0.25), inset 0 0 24px rgba(237,175,24,0.08); }
      100% { box-shadow: 0 0 0 rgba(237,175,24,0); }
    }

    /* Entrance animation: more dramatic bounce */
    .animations-full .kuro-entrance > * {
      animation: kuroEntranceFull 0.5s ease-out both;
    }
    .animations-full .kuro-entrance > *:nth-child(2) { animation-delay: 0.1s; }
    .animations-full .kuro-entrance > *:nth-child(3) { animation-delay: 0.2s; }
    .animations-full .kuro-entrance > *:nth-child(4) { animation-delay: 0.3s; }
    .animations-full .kuro-entrance > *:nth-child(5) { animation-delay: 0.4s; }
    @keyframes kuroEntranceFull {
      0% { opacity: 0; transform: translateY(16px) scale(0.95); }
      55% { opacity: 1; transform: translateY(-3px) scale(1.02); box-shadow: 0 0 24px rgba(237,175,24,0.18); }
      100% { opacity: 1; transform: translateY(0) scale(1); box-shadow: none; }
    }

    /* Success checkmark: bigger pop */
    .animations-full [role="status"] svg.text-emerald-400,
    .animations-full [role="status"] svg.text-green-400 {
      animation: checkPopFull 0.35s ease-out both;
    }
    @keyframes checkPopFull {
      0% { transform: scale(0); opacity: 0; }
      55% { transform: scale(1.4); }
      100% { transform: scale(1); opacity: 1; }
    }

    /* Stat reveal: stronger gold glow on reveal */
    .animations-full .kuro-stat {
      animation: statRevealFull 0.4s ease-out both;
    }
    @keyframes statRevealFull {
      0% { opacity: 0; box-shadow: 0 0 0 rgba(var(--color-gold), 0); }
      40% { opacity: 1; box-shadow: 0 0 24px rgba(var(--color-gold), 0.25); }
      100% { opacity: 1; box-shadow: var(--shadow-sm); }
    }


    /* ═══ FULL MODE ENHANCEMENTS ═══ */

    /* ── Pity Ring: rotating gradient stroke ── */
    .animations-full .pity-ring-fill {
      filter: drop-shadow(0 0 8px var(--ring-glow));
      animation: pityRingRotateGlow 4s linear infinite !important;
    }
    @keyframes pityRingRotateGlow {
      0% { filter: drop-shadow(0 0 6px var(--ring-glow)) drop-shadow(2px 0 3px var(--ring-glow)); }
      25% { filter: drop-shadow(0 0 10px var(--ring-glow)) drop-shadow(0 2px 3px var(--ring-glow)); }
      50% { filter: drop-shadow(0 0 6px var(--ring-glow)) drop-shadow(-2px 0 3px var(--ring-glow)); }
      75% { filter: drop-shadow(0 0 10px var(--ring-glow)) drop-shadow(0 -2px 3px var(--ring-glow)); }
      100% { filter: drop-shadow(0 0 6px var(--ring-glow)) drop-shadow(2px 0 3px var(--ring-glow)); }
    }

    /* ── Pity Ring: glow pulse intensifying near soft pity (65+) ── */
    .animations-full .pity-soft .pity-ring-fill {
      animation: pitySoftGlow 1.8s ease-in-out infinite !important;
    }
    @keyframes pitySoftGlow {
      0%, 100% { filter: drop-shadow(0 0 8px var(--ring-glow)); }
      50% { filter: drop-shadow(0 0 16px var(--ring-glow)) drop-shadow(0 0 24px var(--ring-glow)); }
    }

    /* ── Pity Ring: color shift / flame effect near hard pity (75+) ── */
    .animations-full .pity-danger .pity-ring-fill {
      animation: pityFlame 1.2s ease-in-out infinite !important;
    }
    @keyframes pityFlame {
      0%, 100% { filter: drop-shadow(0 0 10px rgba(255,100,30,0.7)) drop-shadow(0 -3px 8px rgba(255,60,20,0.5)); }
      33% { filter: drop-shadow(0 0 18px rgba(255,140,40,0.9)) drop-shadow(0 -5px 12px rgba(255,80,20,0.7)); }
      66% { filter: drop-shadow(0 0 12px rgba(255,60,20,0.8)) drop-shadow(0 -4px 10px rgba(255,40,10,0.6)); }
    }
    .animations-full .pity-danger .pity-ring-text {
      animation: pityTextFlame 1.2s ease-in-out infinite !important;
    }
    @keyframes pityTextFlame {
      0%, 100% { fill: #edaf18; }
      50% { fill: #ff6b2b; }
    }

    /* ── Pulse subtle: more pronounced ── */
    .animations-full .pulse-subtle {
      animation: pulseScaleFull 1.5s ease-in-out infinite;
    }
    @keyframes pulseScaleFull {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.04); }
    }

    /* Luck badge: stronger glow */
    .animations-full .luck-badge::before {
      opacity: 0.9;
      filter: blur(3px);
    }

    /* ── Holographic shimmer sweep on 5★ owned ── */
    .animations-full .collection-card.glow-gold::after,
    .animations-full .holo-5star::after {
      content: '' !important;
      position: absolute;
      top: 0; left: -100%;
      width: 80%;
      height: 100%;
      background: linear-gradient(105deg, transparent 25%, rgba(255,220,100,0.18) 40%, rgba(255,255,255,0.3) 50%, rgba(255,220,100,0.18) 60%, transparent 75%);
      animation: holoSweep 6s ease-in-out infinite !important;
      pointer-events: none;
      z-index: 15;
    }
    @keyframes holoSweep {
      0% { left: -100%; }
      100% { left: 150%; }
    }

    /* ── Tab transitions: enhanced slide + fade ── */
    .animations-full .tab-content {
      animation: tabFadeInFull 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes tabFadeInFull {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animations-full .tab-content > .kuro-card,
    .animations-full .tab-content > div > .kuro-card {
      animation: cardSlideInFull 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
    }
    @keyframes cardSlideInFull {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Breathing zoom on character images ── */
    @keyframes breathZoom {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03); }
    }
    .breath-zoom {
      animation: breathZoom 5s ease-in-out infinite !important;
    }
    .collection-card .collection-img-wrap {
      animation: breathZoom 6s ease-in-out infinite !important;
    }

    /* ═══ REDUCED MOTION — handled by user Animations toggle ═══ */

    /* ═══ USER TOGGLE: NO ANIMATIONS ═══ */
    .no-animations *, .no-animations *::before, .no-animations *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    /* OS reduced-motion is handled by the JS toggle (animationsEnabled defaults to false
       when prefers-reduced-motion: reduce) which adds .no-animations class above.
       CSS-level fallback for cases where JS hasn't loaded yet. */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
    /* E2-EE3: Shrink tab bar padding by 25% in landscape to reclaim vertical space */
    @media (orientation: landscape) {
      [role="tablist"] [role="tab"] {
        padding-top: 6px;
        padding-bottom: 6px;
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

    /* DC5-ST7: Anticipation shimmer before pull results reveal */
    @keyframes anticipationShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .pull-anticipation {
      background: linear-gradient(90deg, transparent 0%, rgba(var(--color-gold), 0.08) 25%, rgba(var(--color-gold), 0.15) 50%, rgba(var(--color-gold), 0.08) 75%, transparent 100%);
      background-size: 200% 100%;
      animation: anticipationShimmer 0.5s ease-out;
    }

    /* DBI1-ARC2: Stat reveal animation — gold glow pulse on first render */
    @keyframes statReveal {
      0% { opacity: 0; box-shadow: 0 0 0 rgba(var(--color-gold), 0); }
      40% { opacity: 1; box-shadow: 0 0 16px rgba(var(--color-gold), 0.15); }
      100% { opacity: 1; box-shadow: var(--shadow-sm); }
    }
    .kuro-stat {
      animation: statReveal 0.3s ease-out both;
    }

    /* DC3-OLED2: OLED-aware toast backgrounds — darker base with higher contrast */
    .oled-mode [role="status"] > div {
      background-color: rgba(12, 12, 12, 0.95) !important;
      backdrop-filter: blur(var(--blur-md));
      -webkit-backdrop-filter: blur(var(--blur-md));
    }

    /* DESKTOP LAYOUT */
    @media (min-width: 1024px) {
      /* Root */
      .desktop-layout {
        display: block !important;
        min-height: 100vh;
      }
      .desktop-layout > footer {
        margin-top: auto;
      }

      /* LEFT SIDEBAR — narrow icon bar */
      .desktop-layout > header {
        position: fixed !important; top: 0 !important; left: 0 !important; bottom: 0 !important;
        width: 72px !important; min-width: 72px !important;
        border-bottom: none !important; border-right: 1px solid rgba(255,255,255,0.08) !important;
        z-index: 50; overflow-y: auto; scrollbar-width: none;
        background: rgba(8, 12, 18, 0.95) !important; backdrop-filter: blur(20px) !important;
      }
      .desktop-layout > header::-webkit-scrollbar { display: none; }
      .desktop-layout > header > .header-inner {
        max-width: none !important; padding: 0.375rem !important; margin: 0 !important;
        height: 100%; display: flex !important; flex-direction: column !important; align-items: center !important;
      }

      /* Logo — small, centered, no text */
      .desktop-layout > header .header-top {
        flex-direction: column !important; align-items: center !important;
        padding: 0.5rem 0 !important; border-bottom: 1px solid rgba(255,255,255,0.06);
        margin-bottom: 0.5rem; gap: 0.5rem;
      }
      .desktop-layout > header .header-top > .flex.items-center.gap-2\\.5 {
        flex-direction: column !important; align-items: center !important; gap: 0 !important;
      }
      .desktop-layout > header .header-top > .flex.items-center.gap-2\\.5 > div:last-child { display: none !important; }

      /* Server + export — stacked tiny */
      .desktop-layout > header .header-controls {
        flex-direction: column !important; gap: 3px !important; margin-bottom: 0; width: 100%;
      }
      .desktop-layout > header .header-controls select {
        width: 100% !important; min-height: 24px !important; max-height: 24px !important;
        font-size: 8px !important; padding: 0.125rem 0.25rem !important; text-align: center;
      }
      .desktop-layout > header .header-controls button {
        width: 100% !important; min-width: unset !important;
        min-height: 24px !important; max-height: 24px !important;
        padding: 0.125rem !important;
      }
      .desktop-layout > header .header-controls button svg {
        width: 12px !important; height: 12px !important;
      }

      /* Nav — vertical icon buttons as cards */
      .desktop-layout > header nav {
        flex-direction: column !important; gap: 3px !important; overflow-x: visible !important;
        padding-bottom: 0 !important; flex: 0 !important; width: 100%;
      }
      .desktop-layout > header nav .kuro-tab {
        width: 100% !important; flex-direction: column !important; align-items: center !important;
        justify-content: center !important; padding: 0.25rem 0.125rem !important;
        border-radius: 0.375rem !important; font-size: 0.5rem !important; gap: 1px !important;
        border-bottom: none !important; border: 1px solid transparent !important;
        background: rgba(255,255,255,0.02) !important;
        transition: background-color 0.15s, border-color 0.15s, color 0.15s; /* BN-F2 */
        min-height: 36px !important;
      }
      .desktop-layout > header nav .kuro-tab:hover {
        background: rgba(255,255,255,0.06) !important;
        border-color: rgba(255,255,255,0.08) !important;
      }
      .desktop-layout > header nav .kuro-tab[aria-selected="true"] {
        background: rgba(237, 175, 24, 0.1) !important;
        border-color: rgba(237, 175, 24, 0.3) !important;
        border-left: 2px solid #edaf18 !important;
        color: #edaf18 !important;
      }
      .desktop-layout > header nav .kuro-tab svg { width: 16px !important; height: 16px !important; }
      .desktop-layout > header nav .tab-indicator { display: none !important; }
      .desktop-layout > header .swipe-hint { display: none !important; }

      /* Logo — scale down in narrow sidebar */
      .desktop-layout > header .header-top .group {
        transform: scale(0.7);
        margin: -4px 0;
      }
      .desktop-layout > header .header-top .group .blur-md {
        opacity: 0.3 !important;
      }

      /* MAIN CONTENT */
      .desktop-layout > main {
        margin-left: 72px !important; max-width: none !important;
        width: calc(100% - 72px) !important;
        min-height: 100vh !important;
        padding: 1rem !important; padding-right: calc(160px + 1rem) !important;
        box-sizing: border-box !important;
        scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
      }
      .desktop-layout > main::-webkit-scrollbar { width: 6px; }
      .desktop-layout > main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      .desktop-layout > main::-webkit-scrollbar-track { background: transparent; }
      .desktop-layout > main > [role="tabpanel"] { max-width: none; width: 100%; }
      .desktop-layout > main .tab-content { max-width: none !important; }

      /* GRIDS — align-items: start prevents vertical stretching */
      .desktop-layout .desktop-grid-2 {
        display: grid !important; grid-template-columns: repeat(2, 1fr) !important;
        gap: 0.75rem !important; align-items: start !important;
      }
      .desktop-layout .desktop-grid-2 > * { margin-top: 0 !important; }
      .desktop-layout .banner-grid {
        display: grid !important; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr) /* MED-18: Reduced from 420px for smoother 2-col transition */) !important;
        gap: 0.75rem !important; align-items: start !important;
      }
      .desktop-layout .banner-grid > * { margin-top: 0 !important; }
      .desktop-layout .event-grid {
        display: grid !important; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)) !important;
        gap: 0.75rem !important; align-items: start !important;
      }
      .desktop-layout .event-grid > * { margin-top: 0 !important; margin-bottom: 0 !important; }
      .desktop-layout .stats-grid {
        display: grid !important; grid-template-columns: repeat(2, 1fr) !important;
        gap: 0.75rem !important; align-items: start !important;
      }
      .desktop-layout .stats-grid > * { margin-top: 0 !important; }
      .desktop-layout .stats-grid > .stats-full-width { grid-column: 1 / -1; }
      .desktop-layout .desktop-grid-2.space-y-3 > * + *,
      .desktop-layout .banner-grid.space-y-3 > * + *,
      .desktop-layout .banner-grid.space-y-2 > * + *,
      .desktop-layout .event-grid.space-y-2 > * + * { margin-top: 0 !important; }
      .desktop-layout .team-suggestions-grid {
        display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important;
      }
      .desktop-layout .team-suggestions-grid > * { margin-top: 0 !important; }
      .desktop-layout [class*="fixed inset-0"] > div { max-width: 640px; }

      /* RIGHT AD MARGIN — absolute positioned in the right padding */
      .desktop-layout > main { position: relative !important; }
      .desktop-ad-margin {
        position: fixed; top: 0; right: 0; bottom: 0; width: 160px;
        display: flex !important; flex-direction: column; align-items: center;
        padding-top: 1rem; gap: 1rem; z-index: 30;
        border-left: 1px solid rgba(255,255,255,0.06);
        background: rgba(8, 12, 18, 0.6);
      }
      .desktop-ad-margin .ad-slot {
        width: 160px; height: 600px;
        border: 1px dashed rgba(255,255,255,0.08);
        display: flex; align-items: center; justify-content: center;
        color: rgba(255,255,255,0.08); font-size: 8px;
        text-transform: uppercase; letter-spacing: 0.1em;
        border-radius: 0.25rem; flex-shrink: 0;
      }
      .desktop-ad-margin .ad-margin-footer {
        margin-top: auto; text-align: center; padding: 0.75rem 0.5rem;
        width: 100%;
      }

      /* Footer removed — now lives inside Profile tab as a kuro-card */
      .desktop-layout > footer, .desktop-layout footer {
        margin-bottom: 0 !important; padding-bottom: 0 !important;
        background: transparent !important;
        border-top-color: rgba(255,255,255,0.04) !important;
      }

      /* ── DESKTOP POLISH ──────────────────────────────────────────── */

      /* Smooth tab transitions on sidebar */
      .desktop-layout > header nav .kuro-tab {
        transition: background-color 0.2s, border-color 0.2s, color 0.2s, transform 0.2s !important; /* BN-F2 */
      }
      .desktop-layout > header nav .kuro-tab[aria-selected="true"] svg {
        filter: drop-shadow(0 0 4px rgba(237, 175, 24, 0.4));
      }

      /* Cards — subtle hover lift on desktop */
      .desktop-layout .kuro-card {
        transition: transform var(--transition-fast), box-shadow var(--transition-fast) !important;
      }
      .desktop-layout .kuro-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      }

      /* Faster card entrance on desktop (no stagger needed) */
      .desktop-layout .tab-content > .kuro-card,
      .desktop-layout .tab-content > div > .kuro-card {
        animation-delay: 0s !important;
        animation-duration: 0.2s !important;
      }

      /* Inputs — wider on desktop */
      .desktop-layout .kuro-input {
        min-height: 38px !important;
      }

      /* Buttons — proper hover cursor */
      .desktop-layout .kuro-btn {
        cursor: pointer;
      }

      /* Ad column — subtle separator line */
      .desktop-ad-margin::before {
        content: '';
        position: absolute;
        top: 1rem;
        left: 0;
        bottom: 1rem;
        width: 1px;
        background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent);
      }

      /* Collection grid items — hover effect on desktop */
      .desktop-layout .grid > div {
        transition: transform var(--transition-fast) !important;
      }
      .desktop-layout .grid > div:hover {
        transform: scale(1.02);
      }

      /* Wider modals on desktop — more breathing room */
      .desktop-layout [class*="fixed inset-0"] [class*="max-w-lg"] {
        max-width: 560px !important;
      }

      /* Version text in sidebar — subtle at bottom */
      .desktop-layout > header::after {
        content: 'WW';
        display: block;
        text-align: center;
        font-size: 8px;
        color: rgba(255,255,255,0.08);
        padding: 0.5rem 0;
        letter-spacing: 0.2em;
        font-weight: 600;
      }

    }

    @media (min-width: 1440px) {
      .desktop-layout > main { padding-right: calc(160px + 1rem) !important; }
      .desktop-ad-margin { width: 180px; }
      .desktop-ad-margin .ad-slot { width: 160px; }
      .desktop-layout .event-grid { grid-template-columns: repeat(3, 1fr) !important; }
    }



    /* Mobile: hide desktop-only elements */
    @media (max-width: 1023px) {
      .desktop-ad-margin { display: none !important; }
    }
    `}</style>
));
KuroStyles.displayName = 'KuroStyles';

// [SECTION:CONFIRM-DIALOG] — Native-style confirmation modal (replaces window.confirm)
const ConfirmContext = createContext(null);
const useConfirm = () => useContext(ConfirmContext);

const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback(({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false }) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ title, message, confirmLabel, cancelLabel, destructive });
    });
  }, []);

  const handleClose = useCallback((result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <FocusTrapModal isOpen={!!state} onClose={() => handleClose(false)} className="bg-black/80" onClick={() => handleClose(false)} ariaLabel={state?.title || 'Confirm'}>
        {state && (
          <div className="w-full sm:max-w-xs rounded-t-2xl sm:rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card, #101218)' }} onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2 mb-1 sm:hidden" data-sheet-header />
            <div className="p-5 text-center">
              <h3 className="text-white font-semibold text-sm mb-2">{state.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line">{state.message}</p>
            </div>
            <div className="border-t border-[var(--border-medium)] flex">
              <button onClick={() => handleClose(false)} className="flex-1 py-3.5 text-sm text-gray-300 font-medium border-r border-[var(--border-medium)] active:bg-white/5 transition-colors">{state.cancelLabel}</button>
              <button onClick={() => handleClose(true)} className={`flex-1 py-3.5 text-sm font-semibold active:bg-white/5 transition-colors ${state.destructive ? 'text-red-400' : 'text-cyan-400'}`}>{state.confirmLabel}</button>
            </div>
          </div>
        )}
      </FocusTrapModal>
    </ConfirmContext.Provider>
  );
};

export {
  PWAProvider, usePWA, ToastContext, ToastProvider, useToast,
  useFocusTrap, useEscapeKey, FocusTrapModal,
  OnboardingModal, KuroStyles,
  ConfirmProvider, useConfirm,
};
