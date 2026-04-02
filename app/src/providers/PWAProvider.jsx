// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — PWAProvider
// PWA infrastructure: install prompt, online status, meta tags, service worker.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, createContext, useContext } from 'react';
import { X } from 'lucide-react';
import { HEADER_ICON } from '../appcore-data.js';

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
          You are offline - some features may be limited
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

export { PWAProvider, usePWA };
