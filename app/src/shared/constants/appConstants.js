// ════════════════════════════════════��══════════════════════════════════════════
// WHISPERING WISHES — shared/constants/appConstants.js
// Shared constants used across multiple modules (single source of truth)
// ════════════════════════��══════════════════════════════════════════════════════

// ── localStorage keys ─────────────────────────────────────────────────────────
// Bump the suffix when the schema changes
export const VISUAL_SETTINGS_KEY = 'whispering-wishes-visual-settings-v3';
export const IMAGE_FRAMING_KEY = 'whispering-wishes-image-framing-v1';
export const TROPHY_OVERRIDES_KEY = 'whispering-wishes-trophy-overrides-v1';
export const CONVENE_SIM_STATS_KEY = 'whispering-wishes-convene-sim-stats-v1';

// ── Admin ────��──────────────────────���─────────────────────────────────────────
export const ADMIN_SALT = 'whispering-wishes-v3-admin';
export const ADMIN_TAP_TIMEOUT_MS = 1500;

// ── Validation limits ────��───────────────────────────��────────────────────────
export const MAX_USERNAME_LENGTH = 24;
export const MAX_BOOKMARK_NAME_LENGTH = 30;

// ── Image host allowlist ──────────────────────────────────────────────────────
// P15-FIX: MEDIUM-3 - Domain allowlist for custom image URLs (single source of truth)
export const ALLOWED_IMAGE_HOSTS = Object.freeze([
  'i.ibb.co', 'ibb.co', 'i.imgur.com', 'imgur.com',
  'cdn.discordapp.com', 'media.discordapp.net',
  'pbs.twimg.com', 'raw.githubusercontent.com',
  'i.postimg.cc', 'wuwa.gg', 'wuwatracker.com',
]);

export const isAllowedImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    if (parsed.username || parsed.password) return false; // Block userinfo bypass (https://evil@trusted.com)
    return ALLOWED_IMAGE_HOSTS.some(host =>
      parsed.hostname === host || parsed.hostname.endsWith('.' + host)
    );
  } catch { return false; }
};

export const sanitizeImageUrl = (url, fallback = '') => isAllowedImageUrl(url) ? url : fallback;
