// ══════════════════════════════���════════════════════════���═══════════════════════
// useThemeAccent — Character/element theme + CSS custom property sync
// Manages: activeTheme resolution, themeAccent color, bg position helpers,
//          CSS custom property application to <html>
// ════════���══════════════��═══════════════════════════════════════════════════════

import { useMemo, useEffect } from 'react';
import { CHARACTER_THEMES } from '../data/banners.js';
import { getElementColor } from '../utils/helpers.js';

const ELEMENTS = ['Spectro', 'Glacio', 'Fusion', 'Electro', 'Aero', 'Havoc'];

// "Rainbow" accent — a white-ish, shimmering RGB theme. Its glow/border/shimmer
// colors are driven entirely by CSS (see .theme-rainbow in kuro.css) so the hue
// can animate via a CSS keyframe without triggering React re-renders. The JS-side
// themeAccent stays a fixed pale "starlight" hex for consumers that need a plain
// color (tab text, header icon) rather than an animated one.
const RAINBOW_ACCENT_HEX = '#f5f0ff';

// Guard: objectPosition must be a string (can be corrupted to {x,y,zoom} from stale data)
const _bgPos = (v) => { const p = v?.objectPosition; return typeof p === 'string' ? p : 'center center'; };

export function useThemeAccent(visualSettings) {
  const activeTheme = useMemo(() => {
    if (visualSettings.theme === 'default') return null;
    if (visualSettings.theme === 'rainbow') return { id: 'rainbow', element: 'rainbow' };
    if (ELEMENTS.includes(visualSettings.theme)) return { id: visualSettings.theme, element: visualSettings.theme };
    return CHARACTER_THEMES.find(t => t.id === visualSettings.theme) || null;
  }, [visualSettings.theme]);

  const themeAccent = activeTheme ? (activeTheme.id === 'rainbow' ? RAINBOW_ACCENT_HEX : getElementColor(activeTheme.element)) : null;

  // Independent background images
  const headerBgUrl = visualSettings.headerBg?.url || null;
  const headerBgPos = _bgPos(visualSettings.headerBg);
  const navBgUrl = visualSettings.navBg?.url || null;
  const navBgPos = _bgPos(visualSettings.navBg);
  const appBgUrl = visualSettings.appBg?.url || null;
  const appBgPos = _bgPos(visualSettings.appBg);
  const appBgType = visualSettings.appBg?.type || null;

  const isRainbow = activeTheme?.id === 'rainbow';
  // .no-animations lives on a div further down the tree (App.jsx's desktop-layout
  // wrapper), not on <html> — so a CSS `:not(.no-animations)` combinator on
  // .theme-rainbow can't see it. Decide the animated state here in JS instead
  // and toggle a second class that only ever means "rainbow hue is animating".
  const isRainbowAnimated = isRainbow && visualSettings.animationsEnabled !== 'off';

  // Apply theme accent as CSS custom properties for kuro-card system
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle('theme-rainbow', isRainbow);
    el.classList.toggle('theme-rainbow-animated', isRainbowAnimated);
    if (isRainbow) {
      // Static accent color for consumers that need a plain color (tab text,
      // header icon). The actual RGB effect is a hue-rotating gradient ring
      // drawn per-card in CSS (.theme-rainbow .kuro-card::before) — see
      // kuro.css — so --border-*/shimmer/card-* are left at their CSS
      // defaults here instead of being pinned to a static hex.
      el.style.setProperty('--theme-accent', themeAccent);
      ['--border-default','--border-hover','--border-bright','--shimmer-color','--shimmer-color-bright','--card-outline','--card-outline-hover','--card-glow','--card-inset','--card-inset-hover'].forEach(v => el.style.removeProperty(v));
    } else if (themeAccent) {
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
  }, [themeAccent, isRainbow, isRainbowAnimated]);

  return {
    activeTheme, themeAccent,
    headerBgUrl, headerBgPos,
    navBgUrl, navBgPos,
    appBgUrl, appBgPos, appBgType,
  };
}
