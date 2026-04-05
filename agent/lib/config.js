// ═══════════════════════════════════════════════════════════════════════════════
// WW-B — Configuration
// Audit-only agent: checks game data, finds bugs, compiles reports.
// ═══════════════════════════════════════════════════════════════════════════════

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Paths ──────────────────────────────────────────────────────────────────
const REPO_ROOT = resolve(__dirname, '../../');
const APP_SRC = resolve(REPO_ROOT, 'app/src');

export const PATHS = {
  repoRoot: REPO_ROOT,
  appSrc: APP_SRC,
  // Data source files (barrel re-exports deleted — point to actual modules)
  dataFile: resolve(APP_SRC, 'data/characters.js'),     // was appcore-data.js (deleted)
  engineFile: resolve(APP_SRC, 'core/reducer.js'),      // was appcore-engine.js (deleted)
  providersFile: resolve(APP_SRC, 'providers/KuroStyles.jsx'), // was appcore-providers.jsx (deleted)
  // Direct data module paths
  charactersFile: resolve(APP_SRC, 'data/characters.js'),
  bannersFile: resolve(APP_SRC, 'data/banners.js'),
  constantsFile: resolve(APP_SRC, 'data/constants.js'),
  weaponsFile: resolve(APP_SRC, 'data/weapons.js'),
  echoesFile: resolve(APP_SRC, 'data/echoes.js'),
  appFile: resolve(APP_SRC, 'App.jsx'),
};

// ─── Data Sources ───────────────────────────────────────────────────────────
export const SOURCES = {
  banners: [
    'https://game8.co/games/Wuthering-Waves/archives/453303',
    'https://game8.co/games/Wuthering-Waves/archives/494979',
    'https://prydwen.gg/wuthering-waves/',
  ],
  characters: [
    'https://game8.co/games/Wuthering-Waves/archives/452883',
    'https://prydwen.gg/wuthering-waves/characters',
  ],
  weapons: [
    'https://game8.co/games/Wuthering-Waves/archives/452883',
    'https://prydwen.gg/wuthering-waves/weapons',
  ],
  events: [
    'https://game8.co/games/Wuthering-Waves/archives/453303',
    'https://game8.co/games/Wuthering-Waves/archives/582216',
  ],
};

// ─── Game Constants ─────────────────────────────────────────────────────────
export const GAME = {
  ELEMENTS: ['Fusion', 'Electro', 'Aero', 'Glacio', 'Havoc', 'Spectro'],
  WEAPON_TYPES: ['Sword', 'Broadblade', 'Pistols', 'Gauntlets', 'Rectifier'],
  ROLES: ['Main DPS', 'Sub DPS', 'Support', 'Healer'],
};

// ─── AI (Groq) ──────────────────────────────────────────────────────────────
export const AI = {
  model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  maxTokens: 8192,
  rateLimitMs: 2100,   // Groq free: 30 req/min
  maxRetries: 3,
};

// ─── Scraper ────────────────────────────────────────────────────────────────
export const SCRAPER = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  timeout: 15000,
  politenessDelay: 2000,
  maxContentLength: 40000,
};

// ─── Git ────────────────────────────────────────────────────────────────────
export const GIT = {
  authorName: process.env.GIT_AUTHOR_NAME || 'WW-B',
  authorEmail: process.env.GIT_AUTHOR_EMAIL || 'agent@whisperingwishes.app',
  branchPrefix: 'WW-B_maintenance_',
  commitPrefix: '[WW-B]',
};

// ─── Thresholds ─────────────────────────────────────────────────────────────
export const THRESHOLDS = {
  // Confidence floor for flagging a finding as actionable
  reportConfidence: 0.70,
  // Hours before banner expiry to trigger urgent check
  bannerExpiryBufferHours: 48,
};
