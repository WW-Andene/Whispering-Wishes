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
  bgStyle: 'none',
  bgResolution: null,
  bgFps: null,
  theme: 'default',
  headerBg: null,
  navBg: null,
  appBg: { type: 'version', id: 'v3.3', url: 'https://i.ibb.co/KByqz7F/Reverbs-From-The-End-of-Galaxies.jpg', objectPosition: '52% 50%' },
  animatedBgAudio: false,
  dyslexicFont: false,
  colorBlindMode: false,
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

  // Custom app icon for home screen
  useEffect(() => {
    try {
      let themeColor = document.querySelector('meta[name="theme-color"]');
      if (!themeColor) { themeColor = document.createElement('meta'); themeColor.name = 'theme-color'; document.head.appendChild(themeColor); }
      themeColor.content = '#0c0820';
    } catch (e) { console.warn('Icon setup failed:', e); }
  }, []);

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
