// ═══════════════════════════════════════════════════════════════════════════════
// useVisualSettings — Visual theme, animation, and accessibility settings
// Manages: visualSettings state, localStorage persistence, OS preference sync,
//          animation class sync, dyslexic font lazy-loading
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { storageAvailable } from '../core/storage.js';
import { VISUAL_SETTINGS_KEY } from '../shared/constants/appConstants.js';
import { silentCatch } from '../utils/silentCatch.js';

const DEBOUNCE_MS = 300;
const MIN_ZOOM = 100;
const MAX_ZOOM = 300;

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
  animationsEnabled: 'on',
  theme: 'default',
  headerBg: null,
  navBg: null,
  appBg: { type: 'other', id: 'log-2-0', url: './Background/Kc8q8mYt-Log-2-0.jpg', objectPosition: '50% 50%' },
  dyslexicFont: false,
  colorBlindMode: false,
  soundEnabled: true,
  // Sound section (Profile > Display > Sound): 'off' or '1'/'2'/'3' — which
  // of the 3 Log Screen ambient tracks (public/audio/log-screen-*.m4a)
  // loops quietly in the background while the app is open.
  logScreenTrack: 'off',
  // Background music loop for the convene pull simulator modal (public/
  // audio/convene-screen.m4a) — independent of the master sound toggle's
  // videos/chime so it can be turned off on its own.
  conveneMusicEnabled: true,
});

export { DEFAULT_VISUAL_SETTINGS };

export function useVisualSettings() {
  const [visualSettings, setVisualSettings] = useState(() => ({ ...DEFAULT_VISUAL_SETTINGS }));
  const visualSettingsTimerRef = useRef(null);

  // Load from localStorage after mount (so SSR/preview gets defaults)
  useEffect(() => {
    if (!storageAvailable) return;
    try {
      const saved = localStorage.getItem(VISUAL_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setVisualSettings(prev => {
          const merged = { ...prev };
          for (const key of Object.keys(prev)) {
            if (parsed[key] !== undefined) merged[key] = parsed[key];
          }
          merged.collectionZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(merged.collectionZoom) || 120));
          for (const key of ['fadePosition', 'fadeIntensity', 'pictureOpacity',
            'standardFadePosition', 'standardFadeIntensity', 'standardOpacity',
            'shadowFadePosition', 'shadowFadeIntensity', 'shadowOpacity',
            'collectionFadePosition', 'collectionFadeIntensity', 'collectionOpacity']) {
            if (typeof merged[key] === 'number') merged[key] = Math.min(100, Math.max(0, merged[key]));
          }
          if (merged.animationsEnabled === true) merged.animationsEnabled = 'on';
          else if (merged.animationsEnabled === false) merged.animationsEnabled = 'off';
          // "Rainbow" accent theme was removed — fall back to default for
          // any save-data written while it still existed.
          if (merged.theme === 'rainbow') merged.theme = 'default';
          return merged;
        });
      }
    } catch (err) { silentCatch(err, 'visual settings load'); }
  }, []);

  // Respect prefers-reduced-motion for first-time users (mount-only check)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches && (!storageAvailable || !localStorage.getItem(VISUAL_SETTINGS_KEY))) {
      setVisualSettings(prev => ({ ...prev, animationsEnabled: 'off' }));
    }
    // Runtime changes handled by the separate listener effect below
  }, []);

  // theme-color meta tag is now owned solely by <ThemeColor /> (shared/components/
  // ThemeColor.jsx), mounted once in App.jsx — this used to duplicate that same
  // logic here with its own hardcoded value, independently of index.html's and
  // PWAProvider.jsx's, and the three drifted out of sync with each other over time.

  // Debounced persistence — live state update immediately, localStorage after 300ms idle
  const saveVisualSettings = useCallback((newSettings) => {
    setVisualSettings(newSettings);
    if (!storageAvailable) return;
    if (visualSettingsTimerRef.current) clearTimeout(visualSettingsTimerRef.current);
    visualSettingsTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(VISUAL_SETTINGS_KEY, JSON.stringify(newSettings)); } catch {}
    }, DEBOUNCE_MS);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (visualSettingsTimerRef.current) clearTimeout(visualSettingsTimerRef.current);
    };
  }, []);

  // Listen for runtime prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => { saveVisualSettings({ ...visualSettings, animationsEnabled: e.matches ? 'off' : (visualSettings.animationsEnabled === 'off' ? 'on' : visualSettings.animationsEnabled) }); };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [visualSettings, saveVisualSettings]);

  // Sync animation classes to <html> so portals inherit them
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle('animations-full', visualSettings.animationsEnabled === 'full');
    el.classList.toggle('no-animations', visualSettings.animationsEnabled === 'off');
  }, [visualSettings.animationsEnabled]);

  // Sync color-blind mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('colorblind-mode', !!visualSettings.colorBlindMode);
  }, [visualSettings.colorBlindMode]);

  // Lazy-load OpenDyslexic font for accessibility
  useEffect(() => {
    const STYLE_ID = 'ww-accessibility-font';
    const on = !!visualSettings.dyslexicFont;
    document.documentElement.classList.toggle('dyslexic-font', on);
    if (on) {
      import('../fonts/opendyslexic.js').then(({ getOpenDyslexicCSS }) => {
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

  return { visualSettings, setVisualSettings, saveVisualSettings };
}
