// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Configuration
// All source URLs, file paths, game constants, data schemas
// ═══════════════════════════════════════════════════════════════════════════════

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Paths ───────────────────────────────────────────────────────────────────
const REPO_ROOT = resolve(__dirname, '../../');
const APP_SRC = resolve(REPO_ROOT, 'whispering-wishes-replit/src');

export const PATHS = {
  repoRoot: REPO_ROOT,
  appSrc: APP_SRC,
  dataFile: resolve(APP_SRC, 'appcore-data.js'),
  engineFile: resolve(APP_SRC, 'appcore-engine.js'),
  componentsFile: resolve(APP_SRC, 'appcore-components.jsx'),
  providersFile: resolve(APP_SRC, 'appcore-providers.jsx'),
  appFile: resolve(APP_SRC, 'App.jsx'),
  packageJson: resolve(REPO_ROOT, 'whispering-wishes-replit/package.json'),
  swFile: resolve(REPO_ROOT, 'whispering-wishes-replit/public/sw.js'),
};

// ─── Data Sources ────────────────────────────────────────────────────────────
// Multiple sources per category for cross-referencing and fallback
export const SOURCES = {
  banners: [
    'https://game8.co/games/Wuthering-Waves/archives/453303',         // Game8 current banners
    'https://game8.co/games/Wuthering-Waves/archives/494979',         // Game8 banner history
    'https://prydwen.gg/wuthering-waves/',                             // Prydwen home (has banner info)
  ],
  characters: [
    'https://game8.co/games/Wuthering-Waves/archives/452883',         // Game8 character list
    'https://prydwen.gg/wuthering-waves/characters',                   // Prydwen character tier list
  ],
  weapons: [
    'https://game8.co/games/Wuthering-Waves/archives/452883',         // Game8 (includes weapons)
    'https://prydwen.gg/wuthering-waves/weapons',                      // Prydwen weapons
  ],
  events: [
    'https://game8.co/games/Wuthering-Waves/archives/453303',         // Game8 banners page (includes event info)
    'https://game8.co/games/Wuthering-Waves/archives/582216',         // Game8 v3.2 page (latest events)
  ],
  builds: [
    'https://prydwen.gg/wuthering-waves/characters',                   // Prydwen builds
    'https://game8.co/games/Wuthering-Waves/archives/452883',         // Game8 builds
  ],
  images: [
    'https://wutheringwaves.fandom.com/wiki/',                         // Base wiki URL + character name
  ],
};

// ─── Game Constants (never change — sourced from appcore-data.js) ────────────
export const GAME = {
  HARD_PITY: 80,
  SOFT_PITY_START: 65,
  BASE_5STAR_RATE: 0.008,
  ASTRITE_PER_PULL: 160,
  ELEMENTS: ['Fusion', 'Electro', 'Aero', 'Glacio', 'Havoc', 'Spectro'],
  WEAPON_TYPES: ['Sword', 'Broadblade', 'Pistols', 'Gauntlets', 'Rectifier'],
  ROLES: ['Main DPS', 'Sub DPS', 'Support', 'Healer'],
  RARITIES: [3, 4, 5],
  SERVERS: ['Asia', 'America', 'Europe', 'SEA', 'HMT'],
};

// ─── AI Configuration ────────────────────────────────────────────────────────
export const AI = {
  model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
  maxTokens: 8192,
  // Rate limiting: minimum ms between API calls
  rateLimitMs: 1500,
  // Maximum retries for failed API calls
  maxRetries: 3,
};

// ─── Scraper Configuration ───────────────────────────────────────────────────
export const SCRAPER = {
  // User agent — use a real browser UA to avoid 403 blocks from wikis
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  // Timeout per request (ms)
  timeout: 15000,
  // Delay between requests to the same domain (ms)
  politenessDelay: 2000,
  // Maximum content length to send to Claude (chars) — trim beyond this
  maxContentLength: 60000,
};

// ─── Git Configuration ───────────────────────────────────────────────────────
export const GIT = {
  authorName: process.env.GIT_AUTHOR_NAME || 'WW Update Agent',
  authorEmail: process.env.GIT_AUTHOR_EMAIL || 'agent@whisperingwishes.app',
  branchPrefix: 'auto-update/',
  commitPrefix: '[auto-update]',
};

// ─── Update Thresholds ───────────────────────────────────────────────────────
export const THRESHOLDS = {
  // Minimum confidence (0-1) to apply an update without manual review
  autoApplyConfidence: 0.85,
  // Banner end date: how many hours before expiry to trigger update check
  bannerExpiryBufferHours: 48,
  // Event end date: how many hours before expiry to trigger recurring advance
  eventExpiryBufferHours: 24,
};

// ─── Schema templates for Claude API prompts ─────────────────────────────────
export const SCHEMAS = {
  bannerUpdate: {
    version: 'string (e.g. "3.2")',
    phase: 'number (1 or 2)',
    startDate: 'ISO date string UTC',
    endDate: 'ISO date string UTC',
    characters: [{ id: 'kebab-case', name: 'string', title: 'string', element: 'GAME.ELEMENTS', weaponType: 'GAME.WEAPON_TYPES', isNew: 'boolean', featured4Stars: ['string'] }],
    weapons: [{ id: 'kebab-case', name: 'string', title: 'string', type: 'GAME.WEAPON_TYPES', forCharacter: 'string', element: 'GAME.ELEMENTS', isNew: 'boolean', featured4Stars: ['string'] }],
  },
  characterEntry: {
    rarity: 'number (4 or 5)',
    element: 'GAME.ELEMENTS',
    weapon: 'GAME.WEAPON_TYPES',
    role: 'GAME.ROLES',
    desc: 'string (1-2 sentences)',
    skills: ['string (4 skill names)'],
    ascension: { boss: 'string', common: 'string', specialty: 'string' },
    skillMaterials: { weeklyDrop: 'string', forgery: 'string' },
    bestEchoes: ['main echo string', 'echo set string'],
    bestWeapon: 'string',
    teams: ['Team member1 + member2 + member3'],
  },
  weaponEntry: {
    rarity: 'number (4 or 5)',
    type: 'GAME.WEAPON_TYPES',
    stat: 'string (Crit Rate, Crit DMG, ATK%, HP%, Energy Regen)',
    baseAtk: 'number',
    subStatValue: 'string (e.g. +24.3%)',
    desc: 'string (1-2 sentences)',
    passive: 'string',
    bestFor: ['character names'],
    ascensionMaterials: { forgery: 'string', common: 'string' },
  },
};
