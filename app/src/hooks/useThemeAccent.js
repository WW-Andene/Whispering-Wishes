// ══════════════════════════════���════════════════════════���═══════════════════════
// useThemeAccent — Character/element theme + CSS custom property sync
// Manages: activeTheme resolution, themeAccent color, bg position helpers,
//          CSS custom property application to <html>
// ════════���══════════════��═══════════════════════════════════════════════════════

import { useMemo, useEffect } from 'react';
import { CHARACTER_THEMES } from '../data/banners.js';
import { getElementColor } from '../shared/utils/elementVisuals.js';
const ELEMENTS = ['Spectro', 'Glacio', 'Fusion', 'Electro', 'Aero', 'Havoc'];

// Guard: objectPosition must be a string (can be corrupted to {x,y,zoom} from stale data)
const _bgPos = (v) => { const p = v?.objectPosition; return typeof p === 'string' ? p : 'center center'; };

export function useThemeAccent(visualSettings) {
  const activeTheme = useMemo(() => {
    if (visualSettings.theme === 'default') return null;
    if (ELEMENTS.includes(visualSettings.theme)) return { id: visualSettings.theme, element: visualSettings.theme };
    return CHARACTER_THEMES.find(t => t.id === visualSettings.theme) || null;
  }, [visualSettings.theme]);

  const themeAccent = activeTheme ? getElementColor(activeTheme.element) : null;

  // Independent background images
  const headerBgUrl = visualSettings.headerBg?.url || null;
  const headerBgPos = _bgPos(visualSettings.headerBg);
  const headerBgType = visualSettings.headerBg?.type || null;
  const navBgUrl = visualSettings.navBg?.url || null;
  const navBgPos = _bgPos(visualSettings.navBg);
  const navBgType = visualSettings.navBg?.type || null;
  const appBgUrl = visualSettings.appBg?.url || null;
  const appBgPos = _bgPos(visualSettings.appBg);
  const appBgType = visualSettings.appBg?.type || null;

  // Apply theme accent as CSS custom properties for kuro-card system
  useEffect(() => {
    const el = document.documentElement;
    if (themeAccent) {
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
  }, [themeAccent]);

  return {
    activeTheme, themeAccent,
    headerBgUrl, headerBgPos, headerBgType,
    navBgUrl, navBgPos, navBgType,
    appBgUrl, appBgPos, appBgType,
  };
}
