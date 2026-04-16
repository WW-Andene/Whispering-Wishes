// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/featureFlags.js
// Lightweight feature-flag helper (P12-09 audit fix).
//
// Three sources, checked in order:
//   1. Runtime override via `window.__wwFlags` (browser devtools / localStorage
//      kill switch for the user testing a build).
//   2. Vite env: `import.meta.env.VITE_FLAG_<KEY>` = 'true'.
//   3. Default value passed to the hook/fn.
//
// Usage:
//   import { isFlagOn } from '@/core/featureFlags.js';
//   if (isFlagOn('CLOUD_BACKUP', true)) { ... }
//
//   // React hook (re-renders on runtime toggle):
//   import { useFlag } from '@/core/featureFlags.js';
//   const enabled = useFlag('CLOUD_BACKUP', true);
//
// Local override from browser console (for debugging a disabled feature):
//   window.__wwFlags = { CLOUD_BACKUP: false };
//   localStorage.setItem('ww-flags', JSON.stringify({ CLOUD_BACKUP: false }));
//
// Env var convention:  .env.local → VITE_FLAG_CLOUD_BACKUP=true
// ═══════════════════════════════════════════════════════════════════════════════

import { useSyncExternalStore } from 'react';

const FLAGS_STORAGE_KEY = 'ww-flags';

// Load any persisted overrides once on module eval.
let _runtimeOverrides = {};
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(FLAGS_STORAGE_KEY);
    if (saved) _runtimeOverrides = JSON.parse(saved) || {};
  } catch { /* no-op: localStorage denied or malformed */ }
  window.__wwFlags = window.__wwFlags || _runtimeOverrides;
  _runtimeOverrides = window.__wwFlags;
}

// Subscribers for useSyncExternalStore — notified when overrides change.
const _listeners = new Set();

/**
 * Check if a feature flag is currently enabled.
 * @param {string} key - Flag name (bare, no VITE_FLAG_ prefix)
 * @param {boolean} [defaultValue=false] - Fallback when no override is set
 * @returns {boolean}
 */
export function isFlagOn(key, defaultValue = false) {
  // Runtime override beats everything else.
  if (typeof window !== 'undefined' && window.__wwFlags && key in window.__wwFlags) {
    return window.__wwFlags[key] === true;
  }
  // Env var next.
  const envKey = `VITE_FLAG_${key}`;
  try {
    const envVal = import.meta.env?.[envKey];
    if (envVal !== undefined) return envVal === 'true' || envVal === true;
  } catch { /* SSR contexts may not have import.meta */ }
  return defaultValue === true;
}

/**
 * Set a flag at runtime (in-memory + persists to localStorage).
 * @param {string} key
 * @param {boolean | null} value - null to clear
 */
export function setFlag(key, value) {
  if (typeof window === 'undefined') return;
  window.__wwFlags = window.__wwFlags || {};
  if (value === null || value === undefined) {
    delete window.__wwFlags[key];
  } else {
    window.__wwFlags[key] = value === true;
  }
  try {
    localStorage.setItem(FLAGS_STORAGE_KEY, JSON.stringify(window.__wwFlags));
  } catch { /* quota exceeded or denied — non-fatal */ }
  _listeners.forEach(fn => { try { fn(); } catch { /* isolate listener errors */ } });
}

/**
 * Read all current override values (for debugging / admin panel).
 * @returns {Record<string, boolean>}
 */
export function getAllFlags() {
  return typeof window !== 'undefined' ? { ...(window.__wwFlags || {}) } : {};
}

/**
 * React hook wrapping isFlagOn with re-render on runtime toggle.
 * @param {string} key
 * @param {boolean} [defaultValue=false]
 * @returns {boolean}
 */
export function useFlag(key, defaultValue = false) {
  return useSyncExternalStore(
    (callback) => {
      _listeners.add(callback);
      return () => _listeners.delete(callback);
    },
    () => isFlagOn(key, defaultValue),
    () => defaultValue === true, // SSR snapshot
  );
}
