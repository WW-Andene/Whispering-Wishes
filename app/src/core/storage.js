// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/storage.js
// Persistent storage helpers: localStorage read/write, state sanitization.
// ═══════════════════════════════════════════════════════════════════════════════

import { APP_VERSION } from '../data/constants.js';
// One-way dep on reducer.js (for initialState) — the reverse edge was broken by
// extracting sanitizers to stateSanitizer.js (see P1-08 audit fix).
// initialState is still only referenced inside function bodies (loadFromStorage),
// never at module-eval time, so this single edge remains evaluation-safe.
import { initialState } from './reducer.js';
// Sanitizers live in their own leaf module so reducer.js can also import them
// without creating a cycle. Re-exported below for backwards compatibility.
import { sanitizeStateObj, sanitizeImportedState } from './stateSanitizer.js';

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

// sanitizeStateObj / sanitizeImportedState / ALLOWED_STATE_KEYS moved to
// ./stateSanitizer.js (P1-08 audit fix — breaks former reducer.js ↔ storage.js cycle).
// Functions are re-exported from this module below for backwards compatibility.

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
      // Schema migrations — add entries when state shape changes between versions.
      // Each key is "fromVersion" and the value mutates safeParsed in-place.
      // Migrations run in order for users who skip versions (e.g., 3.2.0 → 3.3.0 → 3.4.0).
      const migrations = {
        // Example for future use:
        // '3.2.3': (data) => { if (data.calc && !('newField' in data.calc)) data.calc.newField = ''; },
      };
      const sortedVersions = Object.keys(migrations).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      for (const ver of sortedVersions) {
        if (savedVersion.localeCompare(ver, undefined, { numeric: true }) < 0) {
          try { migrations[ver](safeParsed); console.info(`[WW] Applied migration: ${ver}`); }
          catch (e) { console.warn(`[WW] Migration ${ver} failed:`, e); }
        }
      }
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
      window.dispatchEvent(new CustomEvent('ww-storage-warning', {
        detail: { sizeMB: (data.length / 1024 / 1024).toFixed(1), message: 'Storage is nearly full. Consider exporting your data as a backup.' }
      }));
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
