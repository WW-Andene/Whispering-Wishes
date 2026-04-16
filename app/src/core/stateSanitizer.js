// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/stateSanitizer.js
// Prototype-pollution-safe sanitizers for imported/loaded state objects.
// Leaf module (zero internal deps) — breaks the former reducer.js ↔ storage.js cycle.
// Re-exported by storage.js for backwards compatibility with existing consumers.
// ═══════════════════════════════════════════════════════════════════════════════

// Allowlist of top-level keys accepted from an external state blob
// (import payload, tampered localStorage, Firebase backup restore, etc.)
const ALLOWED_STATE_KEYS = new Set([
  'server', 'profile', 'calc', 'planner', 'settings',
  'bookmarks', 'eventStatus', 'teams', 'activeTeamIndex',
]);

// Deep-sanitize an arbitrary value, stripping prototype-pollution keys.
// Recurses into arrays (P14-FIX: MEDIUM-2) so objects nested inside arrays are
// also cleaned — a payload like [{__proto__: {isAdmin: true}}] is neutralized.
const sanitizeStateObj = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
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

// Top-level import gate: drops any key not in ALLOWED_STATE_KEYS,
// then deep-sanitizes the kept values.
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

export { ALLOWED_STATE_KEYS, sanitizeStateObj, sanitizeImportedState };
