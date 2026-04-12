// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/storageKeys.js
// SINGLE SOURCE OF TRUTH for all localStorage keys used by the app.
//
// When adding a new localStorage key:
//   1. Add it here with a descriptive name
//   2. Add to the appropriate category (AUX_EXPORTABLE, AUX_INTERNAL, or ADMIN)
//   3. That's it — reset, export, backup all derive from these lists automatically
//
// This eliminates the 5-location sync problem where keys had to be manually
// added to: reset, export, backup, import, and cloud restore.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Main app state (single key, managed by reducer + storage.js) ──
export const STORAGE_KEY = 'whispering-wishes-v2.2';

// ── Versioned settings keys (imported from appConstants.js for consistency) ──
export const VISUAL_SETTINGS_KEY = 'whispering-wishes-visual-settings-v3';
export const IMAGE_FRAMING_KEY = 'whispering-wishes-image-framing-v1';
export const TROPHY_OVERRIDES_KEY = 'whispering-wishes-trophy-overrides-v1';
export const COLLECTION_IMAGES_KEY = 'whispering-wishes-collection-images';

// ── Auxiliary keys: included in export/backup/restore ──
// These contain user data that should be preserved across devices
export const AUX_EXPORTABLE_KEYS = {
  visualSettings:   VISUAL_SETTINGS_KEY,
  imageFraming:     IMAGE_FRAMING_KEY,
  collectionImages: COLLECTION_IMAGES_KEY,
  trophyOverrides:  TROPHY_OVERRIDES_KEY,
  teamEquipment:    'ww-team-equipment',
  calendarNotes:    'ww-calendar-notes',
};

// ── Auxiliary keys: NOT exported, but cleared on reset ──
// These are local preferences or state that don't transfer between devices
export const AUX_INTERNAL_KEYS = [
  'ww-equipment-presets',
  'ww-owned-chars',
  'ww-manual-counts',
  'ww-bg-positions',
  'ww-mini-panel-pos',
  'ww-tracker-cat',
  'ww-leaderboard-consent',
  'ww-leaderboard-id',
  'ww-google-user',
];

// ── Admin/security keys: cleared on reset ──
export const ADMIN_KEYS = [
  'ww-admin-lockout',
  'ww-admin-fails',
  'ww-admin-banned',
  'ww-admin-lockdowns',
  'ww-admin-reset-v350',
];

// ── Temporary/diagnostic keys: cleared on reset ──
export const TEMP_KEYS = [
  'ww-import-diagnostic',
  'whispering-wishes-pre-import-backup',
  'whispering-wishes-pre-restore-backup',
];

// ── Derived lists (used by reset, export, backup) ──

/** ALL keys to clear on full reset (everything except the main STORAGE_KEY which is reset by the reducer) */
export const ALL_CLEARABLE_KEYS = [
  ...Object.values(AUX_EXPORTABLE_KEYS),
  ...AUX_INTERNAL_KEYS,
  ...ADMIN_KEYS,
  ...TEMP_KEYS,
];

/** Keys to include in export/backup payload */
export const EXPORTABLE_KEYS = AUX_EXPORTABLE_KEYS;

/** Helper: gather all exportable aux data from localStorage */
export function gatherAuxData() {
  const aux = {};
  for (const [name, key] of Object.entries(AUX_EXPORTABLE_KEYS)) {
    try {
      const v = localStorage.getItem(key);
      if (v) aux[name] = JSON.parse(v);
    } catch {}
  }
  return aux;
}

/** Helper: restore aux data from a backup/import payload */
export function restoreAuxData(aux, sanitizeFn) {
  if (!aux || typeof aux !== 'object') return;
  for (const [name, key] of Object.entries(AUX_EXPORTABLE_KEYS)) {
    try {
      if (aux[name] && typeof aux[name] === 'object') {
        const safe = sanitizeFn ? sanitizeFn(aux[name]) : aux[name];
        localStorage.setItem(key, JSON.stringify(safe));
      }
    } catch {}
  }
}

/** Helper: clear all auxiliary localStorage keys (used by reset) */
export function clearAllAuxKeys() {
  ALL_CLEARABLE_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch {} });
}
