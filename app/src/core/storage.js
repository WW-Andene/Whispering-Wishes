// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/storage.js
// Persistent storage helpers: localStorage read/write, state sanitization.
// ═══════════════════════════════════════════════════════════════════════════════

import { APP_VERSION } from '../appcore-data.js';
// NOTE: circular import with reducer.js — safe because initialState is only
// referenced inside function bodies (loadFromStorage), never at module-eval time.
import { initialState } from './reducer.js';

// Load saved state from persistent storage
// Key kept as v2.2 for backwards compatibility — existing user data loads seamlessly.
// If schema changes require migration, add a migration function here.
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

// P10-FIX: Sanitize imported state to prevent prototype pollution and reject unknown keys (Step 6 audit)
const ALLOWED_STATE_KEYS = new Set(['server', 'profile', 'calc', 'planner', 'settings', 'bookmarks', 'eventStatus', 'teams', 'activeTeamIndex']);
const sanitizeStateObj = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  // P14-FIX: MEDIUM-2 — Also recurse into array elements to sanitize objects inside arrays
  // (e.g., [{__proto__: {isAdmin: true}}] would have passed through unsanitized)
  if (Array.isArray(obj)) {
    return obj.map(item => (typeof item === 'object' && item !== null) ? sanitizeStateObj(item) : item);
  }
  const clean = {};
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    const val = obj[key];
    clean[key] = (typeof val === 'object' && val !== null) ? sanitizeStateObj(val) : val;
  }
  return clean;
};
const sanitizeImportedState = (s) => {
  if (typeof s !== 'object' || s === null) return {};
  const clean = {};
  for (const key of Object.keys(s)) {
    if (ALLOWED_STATE_KEYS.has(key)) {
      clean[key] = sanitizeStateObj(s[key]);
    }
  }
  return clean;
};

const loadFromStorage = () => {
  if (!storageAvailable) return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // P10-FIX: Sanitize loaded state to prevent prototype pollution from tampered localStorage (Step 6 audit)
    const safeParsed = sanitizeStateObj(parsed);
    // Version tracking: detect pre-migration data (no version field = v1)
    const savedVersion = safeParsed.version || '1.0.0';
    if (savedVersion !== APP_VERSION) {
      console.info(`[WW] Data migration: loaded v${savedVersion}, app is v${APP_VERSION}`);
      // Future migrations go here based on savedVersion
    }
    return {
      ...initialState,
      ...sanitizeImportedState(safeParsed),
      server: safeParsed.server || initialState.server,
      profile: {
        ...initialState.profile,
        ...(safeParsed.profile ? sanitizeStateObj(safeParsed.profile) : {}),
        featured: { ...initialState.profile.featured, ...(safeParsed.profile?.featured ? sanitizeStateObj(safeParsed.profile.featured) : {}) },
        weapon: { ...initialState.profile.weapon, ...(safeParsed.profile?.weapon ? sanitizeStateObj(safeParsed.profile.weapon) : {}) },
        standardChar: { ...initialState.profile.standardChar, ...(safeParsed.profile?.standardChar ? sanitizeStateObj(safeParsed.profile.standardChar) : {}) },
        standardWeap: { ...initialState.profile.standardWeap, ...(safeParsed.profile?.standardWeap ? sanitizeStateObj(safeParsed.profile.standardWeap) : {}) },
        beginner: { ...initialState.profile.beginner, ...(safeParsed.profile?.beginner ? sanitizeStateObj(safeParsed.profile.beginner) : {}) },
      },
      calc: { ...initialState.calc }, // Always start calculator fresh - no sync from saved data
      planner: { ...initialState.planner, ...safeParsed.planner },
      settings: { ...initialState.settings, ...safeParsed.settings },
      bookmarks: safeParsed.bookmarks || [],
      eventStatus: safeParsed.eventStatus || {},
      teams: Array.isArray(safeParsed.teams) && safeParsed.teams.length === 5
        ? safeParsed.teams.map((t, i) => ({
            name: (t && typeof t.name === 'string') ? t.name : initialState.teams[i].name,
            slots: (t && Array.isArray(t.slots) && t.slots.length === 3) ? t.slots : [null, null, null],
          }))
        : initialState.teams,
      activeTeamIndex: typeof safeParsed.activeTeamIndex === 'number' ? Math.max(0, Math.min(4, safeParsed.activeTeamIndex)) : 0,
    };
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
};

const saveToStorage = (state) => {
  if (!storageAvailable) return false; // Storage unavailable — save did not happen
  try {
    const data = JSON.stringify({ ...state, version: APP_VERSION });
    // Warn if approaching 5MB localStorage limit (~80% = 4MB)
    if (data.length > 4 * 1024 * 1024) {
      console.warn('Storage approaching limit:', (data.length / 1024 / 1024).toFixed(1) + 'MB');
    }
    localStorage.setItem(STORAGE_KEY, data);
    return true;
  } catch (e) {
    // QuotaExceededError — storage is full
    console.error('Save failed (storage full?):', e);
    window.dispatchEvent(new CustomEvent('ww-storage-error', {
      detail: { type: e.name, message: 'Your data could not be saved. Storage may be full.' }
    }));
    return false; // P12-FIX: Return false on failure so UI can notify user (Step 14 — MEDIUM-10a)
  }
};

export {
  STORAGE_KEY, storageAvailable,
  sanitizeStateObj, sanitizeImportedState,
  loadFromStorage, saveToStorage,
};
