// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — PWAProvider
// PWA infrastructure: install prompt, online status, meta tags, service worker.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, createContext, useContext } from 'react';
import { X } from 'lucide-react';
import { HEADER_ICON, APP_VERSION } from '../data/constants.js';
import { t } from '../utils/i18n.js';

// P14-FIX: HIGH-6 — Service worker code moved to /public/sw.js (static file).
// Removed ~130 lines of inline SERVICE_WORKER_CODE string that was registered via blob URL.

// Shared install banner component used by both native and iframe prompts
const InstallBanner = ({ title, subtitle, actionLabel, onAction, onDismiss }) => (
  <div className="fixed bottom-24 left-3 right-3 z-[9800] bg-gradient-to-r from-[rgba(237,175,24,0.9)] to-[rgba(237,175,24,0.7)] backdrop-blur-sm rounded-xl p-3 shadow-xl border border-yellow-400/30">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
        <img src={HEADER_ICON} alt="Whispering Wishes" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="text-black font-semibold text-xl">{title}</div>
        <div className="text-black/70 text-base">{subtitle}</div>
      </div>
      <button
        onClick={onAction}
        className="px-3 py-1.5 bg-black text-yellow-400 rounded-lg text-base font-medium hover:bg-black/80 transition-colors"
      >
        {actionLabel}
      </button>
      <button
        onClick={onDismiss}
        className="p-1 text-black/50 hover:text-black transition-colors" aria-label={t('pwa.dismissAria')}
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
  // Matches index.html's static tag and useVisualSettings.js's own sync effect
  // (#080c14, the app's real navy background) — previously hardcoded gold
  // (#edaf18) here independently, a color-drift bug: harmless only as long as
  // index.html's tag loads first and this injector's "skip if already present"
  // guard holds, but a real risk of the status bar going gold instead of navy
  // wherever that assumption breaks.
  { name: 'theme-color', content: '#080c14' },
  { name: 'msapplication-TileColor', content: '#080c14' },
  { name: 'msapplication-navbutton-color', content: '#080c14' }
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
  const [updateAvailable, setUpdateAvailable] = useState(false);

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
    //
    // P5-01 audit fix: track the SW registration + nested listeners so the cleanup
    // function can detach them if this effect ever re-runs (defensive —
    // PWAProvider is root-level so re-mount is rare, but unbalanced listeners
    // accumulated across hot-reloads / nested providers otherwise.)
    let swRegistration = null;
    let swUpdateHandler = null;
    let swStateChangeHandler = null;
    let swInstallingWorker = null;
    let swSyncVersionHandler = null;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then((registration) => {
          swRegistration = registration;
          // sw.js's SET_VERSION handler existed but nothing ever actually sent
          // this message — its own APP_VERSION constant (used to name the
          // precache bucket that PRECACHE files like manifest.webmanifest live
          // in) silently drifted from the app's real version indefinitely,
          // with no way to force a refresh short of hand-editing sw.js's own
          // bytes (the only thing that makes a browser re-run the SW's
          // `install` event, which is what actually refetches PRECACHE from
          // the network). Sending it on every load — to whichever worker is
          // currently controlling, not just a freshly installed one — keeps
          // the active worker's cache-name bookkeeping in sync going forward.
          swSyncVersionHandler = () => navigator.serviceWorker.controller?.postMessage({ type: 'SET_VERSION', version: APP_VERSION });
          swSyncVersionHandler();
          navigator.serviceWorker.addEventListener('controllerchange', swSyncVersionHandler);
          swUpdateHandler = () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            swInstallingWorker = newWorker;
            swStateChangeHandler = () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.info('[WW] New version available');
                setUpdateAvailable(true);
              }
            };
            newWorker.addEventListener('statechange', swStateChangeHandler);
          };
          registration.addEventListener('updatefound', swUpdateHandler);
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
      // P5-01 audit fix: detach SW registration listeners on unmount.
      if (swRegistration && swUpdateHandler) {
        try { swRegistration.removeEventListener('updatefound', swUpdateHandler); } catch {}
      }
      if (swSyncVersionHandler && 'serviceWorker' in navigator) {
        try { navigator.serviceWorker.removeEventListener('controllerchange', swSyncVersionHandler); } catch {}
      }
      if (swInstallingWorker && swStateChangeHandler) {
        try { swInstallingWorker.removeEventListener('statechange', swStateChangeHandler); } catch {}
      }
      removeMetaTags();
    };
  }, []);

  // Expose install function
  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await Promise.race([
      installPrompt.userChoice,
      new Promise(resolve => setTimeout(() => resolve({ outcome: 'dismissed' }), 10000))
    ]);
    setInstallPrompt(null);
    return outcome === 'accepted';
  }, [installPrompt]);

  const [isInIframe] = useState(() => {
    try { return window.self !== window.top; } catch { return true; }
  });
  const [iframeBannerDismissed, setIframeBannerDismissed] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const pwaValue = useMemo(() => ({
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    promptInstall,
    showInstallGuide: () => setShowInstallGuide(true),
    updateAvailable,
  }), [installPrompt, isInstalled, promptInstall, updateAvailable]);

  return (
    <PWAContext.Provider value={pwaValue}>
      {children}
      {/* Offline indicator */}
      {!isOnline && (
        <div role="alert" aria-live="assertive" className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-black text-center py-1 text-base font-medium">
          {t('pwa.offline')}
        </div>
      )}
      {/* New version available — reload to pick it up */}
      {updateAvailable && (
        <InstallBanner
          title={t('pwa.updateTitle')}
          subtitle={t('pwa.updateSubtitle')}
          actionLabel={t('pwa.updateAction')}
          onAction={() => window.location.reload()}
          onDismiss={() => setUpdateAvailable(false)}
        />
      )}
      {/* Install prompt banner — native */}
      {installPrompt && !isInstalled && !isInIframe && (
        <InstallBanner
          title={t('pwa.installTitle')}
          subtitle={t('pwa.installSubtitleNative')}
          actionLabel={t('pwa.installActionNative')}
          onAction={promptInstall}
          onDismiss={() => setInstallPrompt(null)}
        />
      )}
      {/* Install prompt banner — iframe fallback */}
      {isInIframe && !isInstalled && !iframeBannerDismissed && (
        <InstallBanner
          title={t('pwa.installTitle')}
          subtitle={t('pwa.installSubtitleIframe')}
          actionLabel={t('pwa.installActionIframe')}
          onAction={() => window.open(window.location.href, '_blank')}
          onDismiss={() => setIframeBannerDismissed(true)}
        />
      )}
      {/* Install guide modal — platform-specific instructions (opened via logo tap) */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[9900] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowInstallGuide(false)}>
          <div className="w-[256px] rounded-2xl p-4 shadow-xl border border-white/10" style={{ background: '#0f141c' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                <img src={HEADER_ICON} alt="Whispering Wishes" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-white font-semibold text-xl">{t('pwa.installTitle')}</div>
                <div className="text-gray-500 text-sm">{t('pwa.guideSubtitle')}</div>
              </div>
            </div>
            <InstallSteps />
            <button onClick={() => setShowInstallGuide(false)} className="mt-4 w-full py-2 rounded-lg text-base font-medium bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors">
              {t('pwa.gotIt')}
            </button>
          </div>
        </div>
      )}
    </PWAContext.Provider>
  );
};

/** Platform-specific install instructions */
function InstallSteps() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  const isSamsung = /SamsungBrowser/.test(ua);
  const isAndroid = /Android/.test(ua);

  let platform, steps;
  if (isIOS || isSafari) {
    platform = 'Safari / iOS';
    steps = [
      <>Tap the <b className="text-white">Share</b> button <span className="inline-block px-1 py-0.5 bg-white/10 rounded text-sm">{'\u2191'}</span> in the toolbar</>,
      <>Scroll down and tap <b className="text-white">Add to Home Screen</b></>,
      <>Tap <b className="text-white">Add</b> to confirm</>,
    ];
  } else if (isFirefox) {
    platform = 'Firefox';
    steps = [
      <>Tap the <b className="text-white">menu</b> button <span className="inline-block px-1.5 py-0.5 bg-white/10 rounded text-sm">{'\u22EE'}</span></>,
      <>Tap <b className="text-white">Install</b> or <b className="text-white">Add to Home Screen</b></>,
    ];
  } else if (isSamsung) {
    platform = 'Samsung Internet';
    steps = [
      <>Tap the <b className="text-white">menu</b> button <span className="inline-block px-1.5 py-0.5 bg-white/10 rounded text-sm">{'\u2630'}</span></>,
      <>Tap <b className="text-white">Add page to</b> {'\u2192'} <b className="text-white">Home screen</b></>,
    ];
  } else if (isAndroid) {
    platform = 'Chrome / Android';
    steps = [
      <>Tap the <b className="text-white">menu</b> button <span className="inline-block px-1.5 py-0.5 bg-white/10 rounded text-sm">{'\u22EE'}</span></>,
      <>Tap <b className="text-white">Install app</b> or <b className="text-white">Add to Home screen</b></>,
      <>Tap <b className="text-white">Install</b> to confirm</>,
    ];
  } else {
    platform = 'Desktop';
    steps = [
      <>Click the <b className="text-white">install icon</b> <span className="inline-block px-1 py-0.5 bg-white/10 rounded text-sm">{'\u2295'}</span> in the address bar</>,
      <>Or click <b className="text-white">{'\u22EE'}</b> {'\u2192'} <b className="text-white">Install Whispering Wishes</b></>,
    ];
  }

  return (
    <div className="space-y-2 text-base text-gray-300">
      <p className="text-gray-400 text-sm uppercase tracking-wider font-medium">{platform}</p>
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-yellow-400 font-bold shrink-0">{i + 1}.</span>
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
}

export { PWAProvider, usePWA };
