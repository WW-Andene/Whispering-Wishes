// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — appcore-data.js
// Pure data, constants, game databases. No React.
// Weapon & Echo data extracted to src/data/ for maintainability.
// ═══════════════════════════════════════════════════════════════════════════════

import { ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ECHO_DATA, ALL_ECHO_SONATA_SETS, ALL_ECHO_BUFF_TYPES } from './data/echoes.js';
import { WEAPON_DATA } from './data/weapons.js';

const APP_VERSION = '3.2.3';
const MAX_IMPORT_SIZE_MB = 5; // P7-FIX: Import file size limit constant (7E)

// Header icon (uploaded app icon)
const HEADER_ICON = 'data:image/png;base64,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';

// Haptic feedback utility — fails silently on unsupported devices
const haptic = {
  light: () => { navigator?.vibrate?.(10); },
  medium: () => { navigator?.vibrate?.(25); },
  heavy: () => { navigator?.vibrate?.(50); },
  success: () => { navigator?.vibrate?.([15, 50, 15]); },
  warning: () => { navigator?.vibrate?.([30, 30, 30]); },
  error: () => { navigator?.vibrate?.([50, 50, 80]); },
};


// Unique ID generator (used by toast & reducer)
// P12-FIX: Monotonic counter prevents ID collisions in the crypto.randomUUID fallback path
// (same-millisecond calls to Date.now() would otherwise produce identical IDs) (Step 12 audit — LOW-12n)
let __uniqueIdCounter = 0;
const generateUniqueId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return crypto.randomUUID(); } catch {}
  }
  // 5.3 fix: CSPRNG fallback (crypto.getRandomValues is older/wider than randomUUID)
  try {
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    return `${Date.now()}-${++__uniqueIdCounter}-${Array.from(arr, b => b.toString(36)).join('')}`;
  } catch {
    return `${Date.now()}-${++__uniqueIdCounter}-${Math.random().toString(36).slice(2)}`;
  }
};

// [SECTION:LUCK]
// Luck rating: maps average pity to a percentile using a normal distribution.
// Theoretical parameters derived from WuWa's rate function (0.8% base, soft pity 65–79, hard pity 80):
//   Mean pity at 5★ = 53.5 pulls, Std dev = 22.7 pulls (single draw).
// For N 5★ pulls, the sample mean has std dev = 22.7/√N (central limit theorem).
// We use max(N, 3) to avoid extreme percentiles from tiny samples.
const LUCK_MEAN_PITY = 53.5;
const LUCK_STD_DEV_SINGLE = 22.7;

const calculateLuckRating = (avgPity, numFiveStars) => {
  if (!avgPity || avgPity === '—') return null;
  const avg = parseFloat(avgPity);
  if (isNaN(avg) || avg <= 0) return null;
  
  // Sample-size adjusted std dev: shrinks with more data points
  const n = Math.max(numFiveStars || 1, 3); // floor of 3 to prevent extreme swings
  const adjustedStd = LUCK_STD_DEV_SINGLE / Math.sqrt(n);
  
  // Inverted: lower avg pity = luckier = higher z-score/percentile
  const zScore = (LUCK_MEAN_PITY - avg) / adjustedStd;
  
  // Abramowitz & Stegun approximation of normal CDF (accurate to ±0.0005)
  const absZ = Math.abs(zScore);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989422804014327; // 1/√(2π)
  const p = d * Math.exp(-absZ * absZ / 2) * (t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))));
  const cdf = zScore >= 0 ? 1 - p : p;
  const percentile = Math.min(99, Math.max(1, Math.round(cdf * 100)));
  
  // WuWa-themed rank names (5 tiers for better distribution)
  if (percentile >= 90) return { rating: 'Arbiter', color: '#edaf18', tier: 'S+', percentile };
  if (percentile >= 70) return { rating: 'Sentinel', color: '#a855f7', tier: 'S', percentile };
  if (percentile >= 40) return { rating: 'Resonator', color: '#3b82f6', tier: 'A', percentile };
  if (percentile >= 20) return { rating: 'Drifter', color: '#6b7280', tier: 'B', percentile };
  return { rating: 'Civilian', color: '#ef4444', tier: 'C', percentile };
};

// [SECTION:SERVERS]
// Each server has its own timezone for daily/weekly resets (04:00 local)
// Source: https://wuwatracker.com/timeline
const SERVERS = {
  'Asia': { name: 'Asia', timezone: 'Asia/Shanghai', utcOffset: 8, resetHour: 4, hasDST: false },
  'America': { name: 'America', timezone: 'America/New_York', utcOffset: -5, resetHour: 4, hasDST: true },
  'Europe': { name: 'Europe', timezone: 'Europe/Paris', utcOffset: 1, resetHour: 4, hasDST: true },
  'SEA': { name: 'SEA', timezone: 'Asia/Singapore', utcOffset: 8, resetHour: 4, hasDST: false },
  'HMT': { name: 'HMT', timezone: 'Asia/Hong_Kong', utcOffset: 8, resetHour: 4, hasDST: false },
};

// Intl.DateTimeFormat cache — avoids re-creating formatters on every getServerOffset call
const _dtfCache = new Map();
const getCachedFormatter = (tz) => {
  if (_dtfCache.has(tz)) return _dtfCache.get(tz);
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
  _dtfCache.set(tz, f);
  return f;
};

// Get UTC offset for a server at a specific date (DST-aware)
// P9-FIX: Accept optional date parameter for future-date DST correctness (MEDIUM-5a)
const getServerOffset = (server, atDate) => {
  const serverData = SERVERS[server];
  if (!serverData) {
    console.warn(`[WW] Unknown server "${server}", defaulting to Europe (UTC+1)`);
    return 1; // Default to Europe
  }
  if (!serverData.hasDST) return serverData.utcOffset;
  
  // Use Intl API to detect DST offset at the specified date (or now)
  try {
    const date = atDate ? new Date(atDate) : new Date();
    if (isNaN(date.getTime())) return serverData.utcOffset; // P9-FIX: guard NaN dates (LOW-5a)
    const formatter = getCachedFormatter(serverData.timezone);
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (tzPart) {
      // Parse offset like "GMT-4", "GMT+2", or "GMT+5:30" (P7-FIX: half-hour support 7F)
      const match = tzPart.value.match(/GMT([+-]\d+)(?::(\d{2}))?/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = match[2] ? parseInt(match[2], 10) / 60 : 0;
        return hours + (hours < 0 ? -minutes : minutes);
      }
    }
  } catch (e) {
    // Fallback to hardcoded offset if Intl API fails
  }
  return serverData.utcOffset;
};

// [SECTION:BANNERS]
const CURRENT_BANNERS = {
  version: '3.2', phase: 1, // Game version (not app version)
  // Times from wuwatracker.com (Europe CET/CEST reference, converted to UTC)
  // Mar is CET (UTC+1) — these conversions are correct for winter
  // Banner: Wed, 19 Mar 2026 10:00 - Thu, 09 Apr 2026 11:59 (Europe CEST)
  startDate: '2026-03-19T08:00:00Z', // Mar 19, 10:00 Europe CEST = 08:00 UTC
  endDate: '2026-04-09T09:59:00Z',   // Apr 09, 11:59 Europe CEST = 09:59 UTC
  characterBannerImage: 'https://i.ibb.co/s9ws1Zf1/Sigrika-Banner-Art.jpg',
  weaponBannerImage: 'https://i.ibb.co/s9ws1Zf1/Sigrika-Banner-Art.jpg',
  eventBannerImage: 'https://i.ibb.co/s9ws1Zf1/Sigrika-Banner-Art.jpg',
  whimperingWastesImage: 'https://i.ibb.co/HT4RyJBy/Whimpering-Wastes-BG.png',
  endstateMatrixImage: 'https://i.ibb.co/Jjn2Ncvp/images-2026-04-01-T034054-984.jpg',
  pioneerPodcastImage: 'https://i.ibb.co/zHsVrt8z/Sans-titre-115-20260401035034.png',
  towerOfAdversityImage: 'https://i.ibb.co/QF335JVv/Tower-of-Adversity-Banner-Art.jpg',
  illusiveRealmImage: 'https://i.ibb.co/zcc2MxR/Fantasies-of-the-Thousand-Gateways.jpg',
  tacticalHologramImage: 'https://i.ibb.co/CpjDZj8V/652896591-1275960654470518-5091818010205633369-n.jpg',
  weeklyBossImage: 'https://i.ibb.co/M5cLkMWf/file-00000000e8b071f480ded273f611ec2e.png',
  standardCharBannerImage: 'https://i.ibb.co/pjXgHN70/Tidal-Chorus-Banner-Art.webp',
  standardWeapBannerImage: 'https://i.ibb.co/Q3TYHS0h/Winter-Brume-Pistols.webp',
  dailyResetImage: 'https://i.ibb.co/Jj6cqnsQ/image.jpg',
  characters: [
    { id: 'sigrika', name: 'Sigrika', title: 'When the Runes Glitter', element: 'Aero', weaponType: 'Gauntlets', isNew: true, featured4Stars: ['Sanhua', 'Buling', 'Yangyang'], imageUrl: 'https://i.ibb.co/KxqVsJPs/HA8o-Hi-Ybs-AMv-Uf-J.jpg', imagePosition: 'center 15%' },
    { id: 'qiuyuan', name: 'Qiuyuan', title: 'When the Runes Glitter', element: 'Aero', weaponType: 'Sword', isNew: false, featured4Stars: ['Sanhua', 'Buling', 'Yangyang'], imageUrl: 'https://i.ibb.co/27WC0nVY/G0-Ec-Fat-W4-AAubh-M.jpg', imagePosition: 'center 15%' },
  ],
  weapons: [
    { id: 'solsworn-ciphers', name: 'Solsworn Ciphers', title: 'Absolute Pulsation', type: 'Gauntlets', forCharacter: 'Sigrika', element: 'Aero', isNew: true, featured4Stars: ['Endless Collapse', 'Celestial Spiral', 'Lunar Cutter'], imageUrl: 'https://i.ibb.co/8LYrgYdN/e7a3b-17738194413502-1920.jpg' },
    { id: 'emerald-sentence', name: 'Emerald Sentence', title: 'Absolute Pulsation', type: 'Sword', forCharacter: 'Qiuyuan', element: 'Aero', isNew: false, featured4Stars: ['Endless Collapse', 'Celestial Spiral', 'Lunar Cutter'], imageUrl: 'https://i.ibb.co/9HyYC5vt/Absolute-Pulsation-Emerald-Sentence-2026-03-19.webp' },
  ],
  // Standard Resonator Banner (Lustrous Tide)
  standardCharacters: ['Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina'],
  // Standard Weapon Banner (Utterance of Marvels)
  standardWeapons: [
    { name: 'Verdant Summit', type: 'Broadblade' },
    { name: 'Lustrous Razor', type: 'Broadblade' }, // P9-FIX: Standard 5★ per WEAPON_DATA — was missing from banner list
    { name: 'Emerald of Genesis', type: 'Sword' },
    { name: 'Static Mist', type: 'Pistols' },
    { name: 'Abyss Surges', type: 'Gauntlets' },
    { name: 'Cosmic Ripples', type: 'Rectifier' },
    { name: 'Radiance Cleaver', type: 'Broadblade' },
    { name: 'Laser Shearer', type: 'Sword' },
    { name: 'Phasic Homogenizer', type: 'Pistols' },
    { name: 'Pulsation Bracer', type: 'Gauntlets' },
    { name: 'Boson Astrolabe', type: 'Rectifier' },
  ],
};

// [SECTION:HISTORY]
const BANNER_HISTORY = [
  // Version 3.2
  { id: 'v3.2-p1', version: '3.2', phase: 1, characters: ['Sigrika', 'Qiuyuan'], weapons: ['Solsworn Ciphers', 'Emerald Sentence'], startDate: '2026-03-19', endDate: '2026-04-09', bannerArt: 'https://i.ibb.co/s9ws1Zf1/Sigrika-Banner-Art.jpg' },
  // Version 3.1
  { id: 'v3.1-p2', version: '3.1', phase: 2, characters: ['Luuk Herssen', 'Galbrena'], weapons: ["Daybreaker's Spine", 'Lux & Umbra'], startDate: '2026-02-26', endDate: '2026-03-18', bannerArt: 'https://i.ibb.co/DPcdf0RY/Luuk-Hersen-Banner-Art.jpg' },
  { id: 'v3.1-p1', version: '3.1', phase: 1, characters: ['Aemeath', 'Chisa', 'Lupa'], weapons: ['Everbright Polestar', 'Kumokiri', 'Wildfire Mark'], startDate: '2026-02-05', endDate: '2026-02-26', bannerArt: 'https://i.ibb.co/YFQBgJ8W/Aemaeth-Banner-Art.jpg' },
  // Version 3.0
  { id: 'v3.0-p2', version: '3.0', phase: 2, characters: ['Mornye', 'Augusta', 'Iuno'], weapons: ['Starfield Calibrator', 'Thunderflare Dominion', "Moongazer's Sigil"], startDate: '2026-01-15', endDate: '2026-02-04', bannerArt: 'https://i.ibb.co/cKY4dY6W/Mornye-Banner-Art.png' },
  { id: 'v3.0-p1', version: '3.0', phase: 1, characters: ['Lynae', 'Cartethyia', 'Ciaccona'], weapons: ['Spectrum Blaster', "Defier's Thorn", 'Woodland Aria'], startDate: '2025-12-24', endDate: '2026-01-15' },
  // Version 2.8
  { id: 'v2.8-p2', version: '2.8', phase: 2, characters: ['Phrolova', 'Cantarella'], weapons: ['Lethean Elegy', 'Whispers of Sirens'], startDate: '2025-12-11', endDate: '2025-12-24' },
  { id: 'v2.8-p1', version: '2.8', phase: 1, characters: ['Chisa', 'Phoebe'], weapons: ['Kumokiri', 'Luminous Hymn'], startDate: '2025-11-20', endDate: '2025-12-11', bannerArt: 'https://i.ibb.co/p6gwfsWC/Chisa-Banner-Art.jpg' },
  // Version 2.7
  { id: 'v2.7-p2', version: '2.7', phase: 2, characters: ['Qiuyuan', 'Zani'], weapons: ['Emerald Sentence', 'Blazing Justice'], startDate: '2025-10-30', endDate: '2025-11-19', bannerArt: 'https://i.ibb.co/yndZmfvB/Qiuyuan-Banner-Art.jpg' },
  { id: 'v2.7-p1', version: '2.7', phase: 1, characters: ['Galbrena', 'Lupa'], weapons: ['Lux & Umbra', 'Wildfire Mark'], startDate: '2025-10-09', endDate: '2025-10-30', bannerArt: 'https://i.ibb.co/0jJLjwws/Galbrena-Banner-Art.jpg' },
  // Version 2.6
  { id: 'v2.6-p2', version: '2.6', phase: 2, characters: ['Iuno', 'Ciaccona'], weapons: ["Moongazer's Sigil", 'Woodland Aria'], startDate: '2025-09-17', endDate: '2025-10-08', bannerArt: 'https://i.ibb.co/xtdnyxRH/Iuno-Banner-Art.png' },
  { id: 'v2.6-p1', version: '2.6', phase: 1, characters: ['Augusta', 'Carlotta', 'Shorekeeper'], weapons: ['Thunderflare Dominion', 'The Last Dance', 'Stellar Symphony'], startDate: '2025-08-28', endDate: '2025-09-17', bannerArt: 'https://i.ibb.co/Hfx3kqG0/Augusta-Banner-Art.jpg' },
  // Version 2.5
  { id: 'v2.5-p2', version: '2.5', phase: 2, characters: ['Cantarella', 'Brant'], weapons: ['Whispers of Sirens', 'Unflickering Valor'], startDate: '2025-08-14', endDate: '2025-08-27' },
  { id: 'v2.5-p1', version: '2.5', phase: 1, characters: ['Phrolova', 'Roccia'], weapons: ['Lethean Elegy', 'Tragicomedy'], startDate: '2025-07-24', endDate: '2025-08-14' },
  // Version 2.4
  { id: 'v2.4-p2', version: '2.4', phase: 2, characters: ['Lupa'], weapons: ['Wildfire Mark'], startDate: '2025-07-03', endDate: '2025-07-23', bannerArt: 'https://i.ibb.co/bjTy2MYT/Lupa-Banner-Art.jpg' },
  { id: 'v2.4-p1', version: '2.4', phase: 1, characters: ['Cartethyia'], weapons: ["Defier's Thorn"], startDate: '2025-06-12', endDate: '2025-07-03' },
  // Version 2.3 (Anniversary)
  { id: 'v2.3-p2', version: '2.3', phase: 2, characters: ['Ciaccona', 'Jinhsi', 'Changli', 'Carlotta', 'Roccia', 'Brant'], weapons: ['Woodland Aria', 'Ages of Harvest', 'Blazing Brilliance', 'The Last Dance', 'Tragicomedy', 'Unflickering Valor'], startDate: '2025-05-22', endDate: '2025-06-11' },
  { id: 'v2.3-p1', version: '2.3', phase: 1, characters: ['Zani', 'Jiyan', 'Yinlin', 'Zhezhi', 'Xiangli Yao', 'Phoebe'], weapons: ['Blazing Justice', 'Verdant Summit', 'Stringmaster', 'Rime-Draped Sprouts', "Verity's Handle", 'Luminous Hymn'], startDate: '2025-04-29', endDate: '2025-05-22' },
  // Version 2.2
  { id: 'v2.2-p2', version: '2.2', phase: 2, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2025-04-17', endDate: '2025-04-28' },
  { id: 'v2.2-p1', version: '2.2', phase: 1, characters: ['Cantarella', 'Camellya'], weapons: ['Whispers of Sirens', 'Red Spring'], startDate: '2025-03-27', endDate: '2025-04-17' },
  // Version 2.1
  { id: 'v2.1-p2', version: '2.1', phase: 2, characters: ['Brant', 'Changli'], weapons: ['Unflickering Valor', 'Blazing Brilliance'], startDate: '2025-03-06', endDate: '2025-03-26' },
  { id: 'v2.1-p1', version: '2.1', phase: 1, characters: ['Phoebe'], weapons: ['Luminous Hymn'], startDate: '2025-02-13', endDate: '2025-03-06' },
  // Version 2.0
  { id: 'v2.0-p2', version: '2.0', phase: 2, characters: ['Roccia', 'Jinhsi'], weapons: ['Tragicomedy', 'Ages of Harvest'], startDate: '2025-01-23', endDate: '2025-02-12' },
  { id: 'v2.0-p1', version: '2.0', phase: 1, characters: ['Carlotta', 'Zhezhi'], weapons: ['The Last Dance', 'Rime-Draped Sprouts'], startDate: '2025-01-02', endDate: '2025-01-23' },
  // Version 1.4
  { id: 'v1.4-p2', version: '1.4', phase: 2, characters: ['Yinlin', 'Xiangli Yao'], weapons: ['Stringmaster', "Verity's Handle"], startDate: '2024-12-12', endDate: '2025-01-01' },
  { id: 'v1.4-p1', version: '1.4', phase: 1, characters: ['Camellya'], weapons: ['Red Spring'], startDate: '2024-11-14', endDate: '2024-12-12' },
  // Version 1.3
  { id: 'v1.3-p2', version: '1.3', phase: 2, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-10-24', endDate: '2024-11-13' },
  { id: 'v1.3-p1', version: '1.3', phase: 1, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2024-09-29', endDate: '2024-10-24' },
  // Version 1.2
  { id: 'v1.2-p2', version: '1.2', phase: 2, characters: ['Xiangli Yao'], weapons: ["Verity's Handle"], startDate: '2024-09-07', endDate: '2024-09-28' },
  { id: 'v1.2-p1', version: '1.2', phase: 1, characters: ['Zhezhi'], weapons: ['Rime-Draped Sprouts'], startDate: '2024-08-15', endDate: '2024-09-07' },
  // Version 1.1
  { id: 'v1.1-p2', version: '1.1', phase: 2, characters: ['Changli'], weapons: ['Blazing Brilliance'], startDate: '2024-07-22', endDate: '2024-08-14' },
  { id: 'v1.1-p1', version: '1.1', phase: 1, characters: ['Jinhsi'], weapons: ['Ages of Harvest'], startDate: '2024-06-28', endDate: '2024-07-22' },
  // Version 1.0 — NOTE: p1 and p2 intentionally overlap (both ran concurrently at launch)
  { id: 'v1.0-p2', version: '1.0', phase: 2, characters: ['Yinlin'], weapons: ['Stringmaster'], startDate: '2024-06-06', endDate: '2024-06-26' },
  { id: 'v1.0-p1', version: '1.0', phase: 1, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-05-23', endDate: '2024-06-13' },
];

// [SECTION:CHARACTER_DATA]
const CHARACTER_DATA = {
  // 5★ Resonators
  'Rover': { rarity: 5, element: 'Spectro', elements: ['Spectro', 'Havoc', 'Aero'], weapon: 'Sword', role: 'Sub DPS',
    desc: 'A wanderer who awoke with no memory on the shores of Solaris. Flexible sub-DPS who switches between Spectro, Havoc, and Aero attunements, each with distinct Resonance Skills and Liberations.',
    skills: ['Vibration Manifestation', 'Resonating Spin', 'Echoing Orchestration', 'Solaris Caelum'],
    ascension: { boss: 'Mysterious Code', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Mourning Aix', 'Eternal Radiance 5pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Phoebe + Spectro Rover + Verina', 'Ciaccona + Cartethyia + Aero Rover'] },
  'Jiyan': { rarity: 5, element: 'Aero', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'General of the Midnight Rangers who commands the azure dragon. On-field Aero DPS who enters Qingloong Mode via Resonance Liberation, dealing heavy aerial Aero DMG through enhanced Basic Attacks.',
    skills: ['Lone Lance', 'Windqueller', 'Emerald Storm: Prelude', 'Qingloong Mode'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Waveworn Residue' },
    bestEchoes: ['Feilian Beringal', 'Sierra Gale 4pc'], bestWeapon: 'Verdant Summit',
    teams: ['Jiyan + Iuno + Shorekeeper', 'Jiyan + Mortefi + Verina'] },
  'Calcharo': { rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Notorious mercenary known as "The Ghost". On-field Electro DPS who chains Resonance Skill combos and enters Death Messenger mode via Liberation for burst finishers.',
    skills: ['Gnawing Fangs', 'Extermination Order', 'Phantom Etching', 'Death Messenger'],
    ascension: { boss: 'Thundering Tacet Core', common: 'Ring', specialty: 'Iris' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Waveworn Residue' },
    bestEchoes: ['Tempest Mephis', 'Void Thunder 4pc'], bestWeapon: 'Lustrous Razor',
    teams: ['Calcharo + Yinlin + Verina', 'Calcharo + Yinlin + Shorekeeper'] },
  'Encore': { rarity: 5, element: 'Fusion', weapon: 'Rectifier', role: 'Main DPS',
    desc: 'Eccentric puppeteer who performs alongside Cosmos and Cloudy. On-field Fusion DPS who enters Cosmos Rampage mode via Resonance Liberation, dealing Fusion DMG with enhanced Basic Attacks.',
    skills: ['Wooly Attack', 'Flaming Woolies', 'Cloudburst', 'Cosmos Rampage'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Helix' },
    bestEchoes: ['Inferno Rider', 'Molten Rift 4pc'], bestWeapon: 'Stringmaster',
    teams: ['Encore + Changli + Verina', 'Encore + Sanhua + Shorekeeper'] },
  'Jianxin': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Support',
    desc: 'Martial artist who seeks inner peace through combat. Aero support who generates shields, groups enemies with her Resonance Skill, and buffs team Aero DMG via Outro.',
    skills: ['Fengyiquan', 'Calming Air', 'Purifying Waltz', 'Chi Counter'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Whisperin Core', specialty: 'Lanternberry' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Abyss Surges',
    teams: ['Jianxin + Jiyan + Verina', 'Jianxin + Xiangli Yao + Shorekeeper'] },
  'Lingyang': { rarity: 5, element: 'Glacio', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Opera performer possessed by the spirit of a lion. On-field Glacio DPS who transforms into Lion Form via Liberation, dealing sustained Glacio DMG through aerial Basic Attack combos.',
    skills: ['Frost Fang', 'Ancient Arts', 'Stormbreaker', 'Lion Form'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    bestEchoes: ['Lampylumen Myriad', 'Freezing Frost 5pc'], bestWeapon: 'Abyss Surges',
    teams: ['Lingyang + Sanhua + Verina', 'Lingyang + Zhezhi + Shorekeeper'] },
  'Verina': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Gentle botanist devoted to the study of life. Spectro healer who restores HP with Resonance Skill and Liberation, while granting ATK buffs and DMG Deepen to the team via Outro.',
    skills: ['Cultivation', 'Botany Experiment', 'Arboreal Flourish', 'Starflower Blooms'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Howler Core', specialty: 'Belle Poppy' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Helix' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 5pc'], bestWeapon: 'Stellar Symphony',
    teams: ['Jinhsi + Yinlin + Verina', 'Jiyan + Mortefi + Verina', 'Encore + Changli + Verina'] },
  'Yinlin': { rarity: 5, element: 'Electro', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Covert government investigator who manipulates puppet Zapstring from the shadows. Electro sub-DPS who deals off-field Electro DMG via Coordinated Attacks and amplifies teammates\' Resonance Liberation DMG.',
    skills: ['Zapstring Dance', 'Magnetic Roar', 'Thunder Wrath', 'Chameleon Cipher'],
    ascension: { boss: 'Group Abomination Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Helix' },
    bestEchoes: ['Thundering Mephis', 'Void Thunder 4pc'], bestWeapon: 'Stringmaster',
    teams: ['Yinlin + Jinhsi + Verina', 'Yinlin + Calcharo + Shorekeeper'] },
  'Jinhsi': { rarity: 5, element: 'Spectro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Magistrate of Jinzhou who bears a connection to the Sentinel Jué. On-field Spectro DPS who builds Incarnation stacks via Coordinated Attacks, then unleashes massive Spectro AoE burst through enhanced Basic Attacks.',
    skills: ['Trailing Slash', 'Illuminous Epiphany', 'Purge of Light', 'Incarnation'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Howler Core', specialty: "Loong's Pearl" },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Waveworn Residue' },
    bestEchoes: ['Jué', 'Celestial Light 5pc'], bestWeapon: 'Ages of Harvest',
    teams: ['Jinhsi + Zhezhi + Shorekeeper', 'Jinhsi + Yinlin + Verina'] },
  'Changli': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Sub DPS',
    desc: 'The True Sentinel who guards Jinzhou from the shadows. Fusion sub-DPS who deals rapid Fusion DMG via Resonance Skill combos and buffs the team\'s Fusion DMG through Outro.',
    skills: ['Blazing Enlightenment', 'Tripartite Flames', 'Radiance of Fealty', 'Enflamement'],
    ascension: { boss: 'Rage Tacet Core', common: 'Ring', specialty: 'Pavo Plum' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Metallic Drip' },
    bestEchoes: ['Inferno Rider', 'Molten Rift 4pc'], bestWeapon: 'Blazing Brilliance',
    teams: ['Changli + Brant + Shorekeeper', 'Changli + Encore + Verina'] },
  'Zhezhi': { rarity: 5, element: 'Glacio', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Shy painter whose ink creations spring to life. Glacio sub-DPS who deploys ink summons that deal off-field Glacio DMG via Coordinated Attacks and buffs Resonance Skill DMG for the team.',
    skills: ['Frost Ink', 'Manifestation', 'Living Canvas', 'Creations Abound'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Howler Core', specialty: 'Lanternberry' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Helix' },
    bestEchoes: ['Nightmare: Lampylumen Myriad', 'Empyrean Anthem 5pc'], bestWeapon: 'Rime-Draped Sprouts',
    teams: ['Zhezhi + Jinhsi + Shorekeeper', 'Zhezhi + Carlotta + Shorekeeper'] },
  'Xiangli Yao': { rarity: 5, element: 'Electro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Brilliant Huaxu Academy researcher who built his own combat mech. On-field Electro DPS who enters Law of Reigns mode via Resonance Liberation, dealing burst Electro DMG through enhanced Skill combos.',
    skills: ['Probe', 'Deduction', 'Cogitation Model', 'Law of Reigns'],
    ascension: { boss: 'Hidden Thunder Tacet Core', common: 'Whisperin Core', specialty: 'Violet Coral' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    bestEchoes: ['Thundering Mephis', 'Void Thunder 4pc'], bestWeapon: "Verity's Handle",
    teams: ['Xiangli Yao + Yinlin + Verina', 'Xiangli Yao + Yinlin + Shorekeeper'] },
  'Shorekeeper': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Eternal guardian of the Tethys, keeper of the Black Shores. Spectro healer who restores HP via Resonance Skill and Liberation, and opens Stellarealm to grant team-wide Crit Rate and Crit DMG buffs.',
    skills: ['Origin Calculus', 'Chaos Theory', 'End Loop', 'Illation'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Helix' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc'], bestWeapon: 'Stellar Symphony',
    teams: ['Jinhsi + Zhezhi + Shorekeeper', 'Carlotta + Zhezhi + Shorekeeper', 'Camellya + Roccia + Shorekeeper'] },
  'Camellya': { rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    desc: 'Enigmatic assassin who blooms like a camellia flower. On-field Havoc DPS who alternates between Budding and Blossom stances, dealing sustained Havoc DMG through enhanced Basic Attacks and Skill combos.',
    skills: ['Thorn Blossom', 'Crimson Blossom', 'Fervor Efflorescent', 'Ephemeral'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Metallic Drip' },
    bestEchoes: ['Crownless', 'Sun-Sinking Eclipse 4pc'], bestWeapon: 'Red Spring',
    teams: ['Camellya + Roccia + Shorekeeper', 'Camellya + Sanhua + Verina'] },
  'Carlotta': { rarity: 5, element: 'Glacio', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Refined heiress of Rinascita\'s Montelli family. On-field Glacio DPS who builds crystal charges via Resonance Skill, then shatters them with Liberation for massive front-loaded Glacio burst.',
    skills: ['Silent Execution', 'Art of Violence', 'Era of New Wave', 'Imminent Oblivion'],
    ascension: { boss: 'Platinum Core', common: 'Polygon Core', specialty: 'Sword Acorus' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Phlogiston' },
    bestEchoes: ['Sentry Construct', 'Frosty Resolve 5pc'], bestWeapon: 'The Last Dance',
    teams: ['Carlotta + Zhezhi + Shorekeeper', 'Carlotta + Buling + Verina'] },
  'Roccia': { rarity: 5, element: 'Havoc', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Warm-hearted clown performer from Rinascita with her companion Pero. Havoc sub-DPS who buffs the on-field carry\'s Basic ATK DMG via Outro and deals Havoc DMG through Coordinated Attacks with Pero.',
    skills: ['Pero, Help', 'Acrobatic Trick', 'Commedia Improvviso!', 'Real Fantasy'],
    ascension: { boss: 'Cleansing Conch', common: 'Tidal Residuum', specialty: 'Firecracker Jewelweed' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Cadence' },
    bestEchoes: ['Nightmare: Impermanence Heron', 'Midnight Veil 5pc'], bestWeapon: 'Tragicomedy',
    teams: ['Roccia + Camellya + Shorekeeper', 'Roccia + Cantarella + Verina'] },
  'Phoebe': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Devoted acolyte of the Order of the Deep, guided by divine light. Spectro sub-DPS who applies Frazzle stacks via Resonance Skill card summons, enabling Spectro DPS teammates to trigger burst damage.',
    skills: ['Chamuel\'s Star', 'Seeking the Light', 'Dawn of Enlightenment', 'Starflash'],
    ascension: { boss: 'Cleansing Conch', common: 'Whisperin Core', specialty: 'Firecracker Jewelweed' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Helix' },
    bestEchoes: ['Mourning Aix', 'Eternal Radiance 5pc'], bestWeapon: 'Luminous Hymn',
    teams: ['Phoebe + Zani + Shorekeeper', 'Phoebe + Spectro Rover + Verina'] },
  'Brant': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Blazing knight from Rinascita whose soul burns with unflickering valor. On-field Fusion DPS who chains Basic Attacks and Skill combos in two alternating modes, with built-in self-healing on hits.',
    skills: ['Blazing Strike', 'Flame Rush', 'Inferno Judgment', 'Burning Soul'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Metallic Drip' },
    bestEchoes: ['Dragon of Dirge', 'Tidebreaking Courage 5pc'], bestWeapon: 'Unflickering Valor',
    teams: ['Brant + Lupa + Changli', 'Brant + Changli + Shorekeeper'] },
  'Cantarella': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Enigmatic head of Rinascita\'s Fisalia family, veiled in twilight. Havoc sub-DPS who deals off-field Havoc DMG via Coordinated Attacks while providing supplementary healing to the active character.',
    skills: ['Shadow Strike', 'Venomous Dart', 'Lethal Masquerade', 'Twilight Veil'],
    ascension: { boss: 'Cleansing Conch', common: 'Polygon Core', specialty: 'Seaside Cendrelis' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Helix' },
    bestEchoes: ['Nightmare: Hecate', 'Empyrean Anthem 5pc'], bestWeapon: 'Whispers of Sirens',
    teams: ['Cantarella + Phrolova + Roccia', 'Cantarella + Camellya + Shorekeeper'] },
  'Zani': { rarity: 5, element: 'Spectro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Steadfast security officer of the Averardo Vault, devoted to justice. On-field Spectro DPS who builds Frazzle stacks via Resonance Skill counters and Heavy Attacks, then detonates them for burst Spectro DMG.',
    skills: ['Standard Defense Protocol', 'Crisis Response Protocol', 'Rekindle', 'Heliacal Embers'],
    ascension: { boss: 'Platinum Core', common: 'Polygon Core', specialty: 'Sword Acorus' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Cadence' },
    bestEchoes: ['Capitaneus', 'Eternal Radiance 5pc'], bestWeapon: 'Blazing Justice',
    teams: ['Zani + Phoebe + Shorekeeper', 'Zani + Spectro Rover + Verina'] },
  'Ciaccona': { rarity: 5, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Free-spirited wandering bard whose melodies command the wind. Aero sub-DPS who applies Erosion via Coordinated Attacks and Skill summons while buffing team Aero DMG through Outro.',
    skills: ['Solo Concert', 'Ensemble Sylph', 'Improvised Symphonic Poem', 'Recital'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Phlogiston' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Gusts of Welkin 5pc'], bestWeapon: 'Woodland Aria',
    teams: ['Ciaccona + Cartethyia + Aero Rover', 'Ciaccona + Cartethyia + Chisa'] },
  'Cartethyia': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Main DPS',
    desc: 'The Blessed Maiden of Rinascita, beloved by wind and sea. HP-scaling on-field Aero DPS who shifts between sword and Fleurdelys forms, dealing Aero DMG through Erosion-enhanced Basic Attacks.',
    skills: ['Sword Shadow', 'Plunging Recall', 'Blade of Howling Squall', 'Fleurdelys Form'],
    ascension: { boss: 'Unfading Glory', common: 'Tidal Residuum', specialty: 'Bamboo Iris' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Metallic Drip' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Windward Pilgrimage 5pc'], bestWeapon: "Defier's Thorn",
    teams: ['Cartethyia + Ciaccona + Aero Rover', 'Cartethyia + Ciaccona + Chisa'] },
  'Lupa': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Lone wolf Star Gladiator of the arena who fights for herself alone. Fusion sub-DPS who shreds enemy Fusion RES and buffs team DMG via Liberation and Outro, enabling mono-Fusion compositions.',
    skills: ['Wolflame', 'Wolfaith', 'Dance With the Wolf', 'Pack Hunt'],
    ascension: { boss: 'Unfading Glory', common: 'Howler Core', specialty: 'Bloodleaf Viburnum' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Waveworn Residue' },
    bestEchoes: ['Lioness of Glory', 'Flaming Clawprint 4pc'], bestWeapon: 'Wildfire Mark',
    teams: ['Lupa + Brant + Changli', 'Lupa + Aemeath + Mornye'] },
  'Phrolova': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Main DPS',
    desc: 'Former violinist turned Fractsidus Overseer, death\'s euphoric companion. On-field Havoc DPS who summons Hecate via Echo Skill for sustained off-field Havoc DMG while dealing burst damage through Resonance Skill.',
    skills: ['Void Touch', 'Dark Blessing', 'Chaos Rift', 'Hecate'],
    ascension: { boss: 'Truth in Lies', common: 'Polygon Core', specialty: 'Afterlife' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Helix' },
    bestEchoes: ['Nightmare: Hecate', 'Dream of the Lost 3pc + Havoc Eclipse 2pc'], bestWeapon: 'Lethean Elegy',
    teams: ['Phrolova + Cantarella + Qiuyuan', 'Phrolova + Cantarella + Shorekeeper'] },
  'Augusta': { rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Ephor of Septimont, a sun rising ablaze from the crucible of blood and sand. On-field Electro DPS who deals Heavy ATK and Liberation burst DMG with built-in shields and a time-stop mechanic on Resonance Skill.',
    skills: ['Thunder Cleave', 'Storm Surge', 'Divine Judgment', 'Crown of Wills'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Tidal Residuum', specialty: 'Luminous Calendula' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Waveworn Residue' },
    bestEchoes: ['The False Sovereign', 'Crown of Valor 3pc + Void Thunder 2pc'], bestWeapon: 'Thunderflare Dominion',
    teams: ['Augusta + Iuno + Shorekeeper', 'Augusta + Yinlin + Verina'] },
  'Iuno': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Priestess of Septimont\'s Tetragon Temple who grasps meaning in time\'s rhythm. Aero sub-DPS who buffs Heavy ATK DMG via Outro while providing healing and shielding through Resonance Skill and Liberation.',
    skills: ['Temporal Fist', 'Chrono Shift', 'Time Dilation', 'Wan Light'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Sliverglow Bloom' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Cadence' },
    bestEchoes: ['Lady of the Sea', 'Crown of Valor 3pc + Sierra Gale 2pc'], bestWeapon: "Moongazer's Sigil",
    teams: ['Iuno + Augusta + Shorekeeper', 'Iuno + Jiyan + Shorekeeper'] },
  'Galbrena': { rarity: 5, element: 'Fusion', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Black Shores Consultant known as the Discord Slayer, seizing power from darkness. On-field Fusion DPS who deals primary damage through Echo Skill and Heavy ATK combos in quick burst rotations.',
    skills: ['Light Slash', 'Radiant Barrier', 'Solar Flare', 'Divine Retribution'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Tidal Residuum', specialty: 'Stone Rose' },
    skillMaterials: { weeklyDrop: 'Curse of the Abyss', forgery: 'Phlogiston' },
    bestEchoes: ['Corrosaurus', "Flamewing's Shadow 3pc + Molten Rift 2pc"], bestWeapon: 'Lux & Umbra',
    teams: ['Galbrena + Qiuyuan + Shorekeeper', 'Galbrena + Lupa + Mornye'] },
  'Qiuyuan': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Former Mingting intelligence agent, upright as bamboo seeking no vanity. Aero sub-DPS who buffs the team\'s Echo Skill DMG and grants Crit DMG Amplify via Outro and Resonance Liberation.',
    skills: ['Frost Edge', 'Winter Slash', 'Blizzard Dance', 'Eternal Winter'],
    ascension: { boss: 'Truth in Lies', common: 'Whisperin Core', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Curse of the Abyss', forgery: 'Metallic Drip' },
    bestEchoes: ['Impermanence Heron', 'Law of Harmony 3pc + Sierra Gale 2pc'], bestWeapon: 'Emerald Sentence',
    teams: ['Qiuyuan + Galbrena + Shorekeeper', 'Qiuyuan + Phrolova + Cantarella'] },
  'Chisa': { rarity: 5, element: 'Havoc', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Startorch Academy student who binds fate upon a crimson thread. Havoc sub-DPS who shreds enemy DEF via Resonance Skill and stacks Negative Status effects to amplify team damage.',
    skills: ['Unseen Snare', 'Eye of Unraveling', 'Moment of Nihility', 'Chainsaw Mode'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Summer Flower' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Waveworn Residue' },
    bestEchoes: ['Threnodian: Leviathan', 'Thread of Severed Fate 3pc + Sun-Sinking Eclipse 2pc'], bestWeapon: 'Kumokiri',
    teams: ['Chisa + Cartethyia + Ciaccona', 'Chisa + Aemeath + Lynae'] },
  'Lynae': { rarity: 5, element: 'Spectro', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Startorch Academy student and ex-mercenary with prismatic light at her fingertips. Spectro sub-DPS who buffs Tune Break DMG via Liberation and Outro, enabling Off-Tune team compositions.',
    skills: ['Light Shot', 'Radiant Bullet', 'Stellar Barrage', 'Supernova'],
    ascension: { boss: "Suncoveter's Reach", common: 'Exoswarm Core', specialty: 'Rimewisp' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Combustor' },
    bestEchoes: ['Hyvatia', 'Pact of Neonlight Leap 5pc'], bestWeapon: 'Spectrum Blaster',
    teams: ['Lynae + Mornye + Iuno', 'Lynae + Mornye + Shorekeeper'] },
  'Mornye': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Healer',
    desc: 'Startorch Academy professor who understands every phenomenon. DEF-scaling Fusion healer who restores HP via Resonance Skill and Liberation while accelerating Off-Tune Buildup for the team.',
    skills: ['Rest Mass Energy', 'Syntony Field', 'Critical Protocol', 'Tune Rupture Response'],
    ascension: { boss: 'Burning Judgment', common: 'Mech Core', specialty: 'Gemini Spore' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Carved Crystal' },
    bestEchoes: ['Fallacy of No Return', 'Halo of Starry Radiance 5pc'], bestWeapon: 'Starfield Calibrator',
    teams: ['Mornye + Lynae + Iuno', 'Mornye + Aemeath + Lupa'] },
  'Luuk Herssen': { rarity: 5, element: 'Spectro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Startorch Academy doctor who sees the mountains as the spine of the earth. On-field Spectro DPS who deals sustained Spectro DMG through aerial Basic Attack chains and Resonance Skill follow-ups.',
    skills: ['Golden Reflux', 'Aureole of Execution', 'Scalpel Judgment', 'Ichor Flow'],
    ascension: { boss: "Suncoveter's Reach", common: 'Exoswarm Pendant', specialty: 'Edelschnee' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Waveworn Shard' },
    bestEchoes: ['Twin Nova - Nebulous Cannon', 'Rite of Gilded Revelation 5pc'], bestWeapon: "Daybreaker's Spine",
    teams: ['Luuk Herssen + Lynae + Mornye', 'Luuk Herssen + Sanhua + Verina'] },
  'Aemeath': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Digital ghost of Startorch Academy, stardust and loneliness remade into wings. On-field Fusion DPS who switches between Tune Rupture and Fusion Burst modes via Liberation, dealing massive Fusion DMG through enhanced combos.',
    skills: ['Mech Transform', 'Seraphic Duet', 'Heavenfall Edict', 'Heavenfall Edict: Finale'],
    ascension: { boss: 'Our Choice', common: 'Exoswarm Core', specialty: 'Moss Amber' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Polarizer' },
    bestEchoes: ['Sigillum', 'Trailblazing Star 5pc'], bestWeapon: 'Everbright Polestar',
    teams: ['Aemeath + Lynae + Mornye', 'Aemeath + Lupa + Mornye'] },
  'Sigrika': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Solsworn of the Roya Tribe and Startorch Academy Birding Fan Club member. On-field Aero DPS who consumes Rune stacks to empower Echo Skill and Heavy ATK for Aero burst DMG with crowd control.',
    skills: ['One, Two, Three', 'BOOMY BOOM!', 'Where Trust Leads Me!', 'Learn My True Name'],
    ascension: { boss: 'Our Choice', common: 'Exoswarm Pendant', specialty: 'Arithmetic Shell' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Waveworn Shard' },
    bestEchoes: ['Nameless Explorer', 'Sound of True Name 5pc'], bestWeapon: 'Solsworn Ciphers',
    teams: ['Sigrika + Qiuyuan + Shorekeeper', 'Sigrika + Ciaccona + Shorekeeper'] },
  // 4★ Resonators
  'Aalto': { rarity: 4, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Suave information broker who slips through the mist. Aero sub-DPS who deals off-field Aero DMG via Coordinated Attacks triggered by his mist clone summon.',
    skills: ['Mist Bullets', 'Shift Trick', 'Flower in the Mist', 'Mist Avatar'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Static Mist',
    teams: ['Aalto + Jiyan + Verina', 'Aalto + Cartethyia + Shorekeeper'] },
  'Baizhi': { rarity: 4, element: 'Glacio', weapon: 'Rectifier', role: 'Healer',
    desc: "Devoted Huaxu Academy researcher accompanied by her companion You'an. Glacio healer who restores HP via Resonance Skill and Liberation, providing consistent team sustain with low field time.",
    skills: ['Destined Promise', 'Emergency Plan', 'Momentary Union', 'Rejuvenation'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Howler Core', specialty: 'Lanternberry' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Helix' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 5pc'], bestWeapon: 'Variation',
    teams: ['Yangyang + Jiyan + Baizhi', 'Lingyang + Sanhua + Baizhi', 'Encore + Sanhua + Baizhi'] },
  'Chixia': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Energetic patroller who blazes through Jinzhou with dual pistols. On-field Fusion DPS who deals Fusion DMG through rapid-fire Resonance Skill shots and Basic Attack combos.',
    skills: ['POW POW', 'Whizzing Fight Spirit', 'Blazing Flames', 'Burning Burst'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Belle Poppy' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    bestEchoes: ['Inferno Rider', 'Molten Rift 4pc'], bestWeapon: 'Static Mist',
    teams: ['Chixia + Changli + Verina', 'Chixia + Mortefi + Baizhi'] },
  'Danjin': { rarity: 4, element: 'Havoc', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Midnight Ranger who trades her own blood for power. Havoc sub-DPS who consumes HP to fuel enhanced Basic and Heavy Attacks, gaining Havoc DMG Bonus as health decreases.',
    skills: ['Roaming Dragon', 'Crimson Fragment', 'Crimson Erosion', 'Sanguine Pulse'],
    ascension: { boss: 'Strife Tacet Core', common: 'Ring', specialty: 'Belle Poppy' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Metallic Drip' },
    bestEchoes: ['Crownless', 'Sun-Sinking Eclipse 5pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Danjin + Camellya + Shorekeeper', 'Danjin + Camellya + Verina'] },
  'Yangyang': { rarity: 4, element: 'Aero', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Cheerful Midnight Rangers outrider who rides the wind. Aero sub-DPS who generates Resonance Energy for the team via Resonance Skill and groups enemies with her Liberation.',
    skills: ['Feather as Blade', 'Zephyr Domain', 'Wind Spirals', 'Cerulean Song'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Ring', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Yangyang + Jiyan + Baizhi', 'Yangyang + Jiyan + Verina'] },
  'Sanhua': { rarity: 4, element: 'Glacio', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Jinhsi\'s stoic personal guard, cold as the frost she commands. Quick-swap Glacio sub-DPS who deals burst Glacio DMG and amplifies the next character\'s Basic ATK DMG via Outro.',
    skills: ['Frigid Light', 'Eternal Frost', 'Glacial Gaze', 'Ice Prism'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Whisperin Core', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Sanhua + Camellya + Verina', 'Sanhua + Lingyang + Shorekeeper'] },
  'Taoqi': { rarity: 4, element: 'Havoc', weapon: 'Broadblade', role: 'Support',
    desc: 'Steadfast border defense director with an iron will. Havoc support who provides shields via Resonance Skill and deepens the team\'s Resonance Skill DMG through Outro.',
    skills: ['Concealed Edge', 'Fortified Defense', 'Iron Will', 'Rocksteady Shield'],
    ascension: { boss: 'Gold-Dissolving Feather', common: 'Howler Core', specialty: 'Iris' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Waveworn Residue' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Discord',
    teams: ['Taoqi + Jinhsi + Verina', 'Taoqi + Camellya + Shorekeeper'] },
  'Yuanwu': { rarity: 4, element: 'Electro', weapon: 'Gauntlets', role: 'Support',
    desc: 'Veteran boxing gym owner who fights with thunderous fists. Electro support who deploys Thunder Wedge for off-field Coordinated Attacks and generates shields via Resonance Liberation.',
    skills: ['Leihuangquan', 'Thunder Wedge', 'Blazing Might', 'Rumbling Spark'],
    ascension: { boss: 'Hidden Thunder Tacet Core', common: 'Ring', specialty: 'Terraspawn Fungus' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 5pc'], bestWeapon: 'Amity Accord',
    teams: ['Yuanwu + Jinhsi + Verina', 'Yuanwu + Calcharo + Shorekeeper'] },
  'Mortefi': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Hot-tempered researcher whose music erupts in violent crescendos. Fusion sub-DPS who fires off-field Fusion Coordinated Attacks and buffs the on-field character\'s Heavy ATK DMG via Outro.',
    skills: ['Impromptu', 'Passionate Variation', 'Violent Finale', 'Fury Fugue'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Static Mist',
    teams: ['Mortefi + Jiyan + Verina', 'Mortefi + Jiyan + Shorekeeper'] },
  'Youhu': { rarity: 4, element: 'Glacio', weapon: 'Gauntlets', role: 'Support',
    desc: 'Whimsical antique appraiser who trusts her luck in all things. Glacio support who heals the team via Resonance Skill and amplifies Coordinated ATK DMG through her Outro buff.',
    skills: ['Frosty Punch', 'Lucky Draw', 'Fortune Blast', 'Icy Gourd'],
    ascension: { boss: 'Topological Confinement', common: 'Ring', specialty: 'Violet Coral' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Cadence' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 5pc'], bestWeapon: 'Marcato',
    teams: ['Youhu + Carlotta + Zhezhi', 'Youhu + Lingyang + Sanhua'] },
  'Lumi': { rarity: 4, element: 'Electro', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Lollo Logistics navigator who charts paths through thundering skies. Electro sub-DPS who deals Electro DMG via Resonance Skill and amplifies the next character\'s Resonance Skill DMG through Outro.',
    skills: ['Electro Slash', 'Thundering Voyage', 'Storm Navigator', 'Arc Discharge'],
    ascension: { boss: 'Thundering Tacet Core', common: 'Howler Core', specialty: 'Terraspawn Fungus' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Waveworn Residue' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Discord',
    teams: ['Lumi + Carlotta + Shorekeeper', 'Lumi + Jinhsi + Verina'] },
  'Buling': { rarity: 4, element: 'Electro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Taoist feng shui master from Mengzhou and Black Shores Consultant. Electro healer who restores HP and deploys Electro Flare via Liberation, buffing the team\'s Resonance Skill DMG through Outro.',
    skills: ['Trigram Attacks', 'Thundershock Wave', 'Flashing Thunder Seal', 'Yin-Yang Balance'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Curse of the Abyss', forgery: 'Helix' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc'], bestWeapon: 'Variation',
    teams: ['Buling + Carlotta + Zhezhi', 'Buling + Carlotta + Shorekeeper'] },
};

// Structured combat data — derived from desc fields. Merged into CHARACTER_DATA.
// Format: [name, dmgFocus[], buffs[], debuffs[]]
// dmgFocus terms: Basic ATK, Heavy ATK, Skill, Liberation, Echo, Coordinated ATK
// Every character must have complete dmgFocus
[
  // 5★ Main DPS
  ['Jiyan',         ['Heavy ATK', 'Liberation'],     [],                                      []],
  ['Calcharo',      ['Liberation', 'Basic ATK'],     [],                                      []],
  ['Encore',        ['Basic ATK', 'Skill'],          [],                                      []],
  ['Lingyang',      ['Basic ATK'],                   [],                                      []],
  ['Jinhsi',        ['Skill', 'Liberation'],         [],                                      []],
  ['Xiangli Yao',   ['Skill', 'Liberation'],         [],                                      []],
  ['Camellya',      ['Basic ATK', 'Skill'],          [],                                      []],
  ['Carlotta',      ['Skill', 'Liberation'],         [],                                      []],
  ['Brant',         ['Basic ATK', 'Skill'],          ['Self-heal'],                           []],
  ['Zani',          ['Skill', 'Heavy ATK'],          [],                                      ['Frazzle']],
  ['Cartethyia',    ['Basic ATK'],                   [],                                      ['Erosion']],
  ['Phrolova',      ['Echo', 'Skill'],               [],                                      []],
  ['Augusta',       ['Heavy ATK', 'Liberation'],     ['Shield'],                              []],
  ['Galbrena',      ['Echo', 'Heavy ATK'],           [],                                      []],
  ['Luuk Herssen',  ['Basic ATK'],                   [],                                      []],
  ['Aemeath',       ['Liberation', 'Skill'],         [],                                      ['Fusion Burst']],
  ['Sigrika',       ['Echo', 'Heavy ATK'],           [],                                      []],
  ['Chixia',        ['Skill', 'Basic ATK'],          [],                                      []],
  // 5★ Sub DPS
  ['Rover',         ['Skill', 'Liberation'],         [],                                      []],
  ['Yinlin',        ['Coordinated ATK', 'Skill'],    ['Coordinated ATK'],                     []],
  ['Changli',       ['Skill'],                       ['Fusion DMG Amp'],                      []],
  ['Zhezhi',        ['Coordinated ATK', 'Skill'],    ['Coordinated ATK'],                     []],
  ['Roccia',        ['Basic ATK'],                   ['Basic ATK Amp'],                       []],
  ['Phoebe',        ['Skill'],                       [],                                      ['Frazzle']],
  ['Cantarella',    ['Coordinated ATK'],             ['Coordinated ATK', 'Heal'],             []],
  ['Ciaccona',      ['Coordinated ATK', 'Skill'],    ['Aero Buff'],                           ['Erosion']],
  ['Lupa',          ['Liberation', 'Skill'],         ['DMG Buff'],                            ['Fusion RES Shred']],
  ['Iuno',          ['Heavy ATK'],                   ['Heavy ATK Buff', 'Heal', 'Shield'],    []],
  ['Qiuyuan',       ['Echo'],                        ['Echo DMG Buff', 'Crit DMG Amp'],       []],
  ['Chisa',         ['Skill'],                       [],                                      ['DEF Shred']],
  ['Lynae',         ['Liberation', 'Skill'],         ['Tune Break DMG Buff'],                 ['Off-Tune']],
  ['Danjin',        ['Basic ATK', 'Heavy ATK'],      ['Havoc DMG Bonus'],                     []],
  ['Mortefi',       ['Heavy ATK', 'Coordinated ATK'], ['Heavy ATK DMG Buff', 'Coordinated ATK'], []],
  ['Sanhua',        ['Basic ATK'],                   ['Basic ATK Amp'],                       []],
  ['Aalto',         ['Coordinated ATK'],             [],                                      []],
  ['Lumi',          ['Skill'],                       ['Skill DMG Amp'],                       []],
  ['Yangyang',      ['Skill'],                       ['Energy Regen'],                        []],
  // 5★ Support / Healer
  ['Verina',        ['Liberation'],                  ['ATK Buff', 'DMG Deepen', 'Heal'],      []],
  ['Shorekeeper',   ['Liberation'],                  ['Crit Buff', 'Heal'],                   []],
  ['Jianxin',       ['Skill'],                       ['Shield', 'Grouping', 'Aero Buff'],     []],
  ['Mornye',        ['Liberation'],                  ['Heal'],                                ['Off-Tune']],
  ['Baizhi',        ['Skill'],                       ['Heal'],                                []],
  ['Taoqi',         ['Skill'],                       ['Shield', 'Skill DMG Deepen'],          []],
  ['Yuanwu',        ['Coordinated ATK'],             ['Coordinated ATK', 'Shield'],           []],
  ['Youhu',         ['Coordinated ATK'],             ['Heal', 'Coordinated ATK Amp'],         []],
  ['Buling',        ['Skill'],                       ['Skill DMG Buff', 'Heal'],              []],
].forEach(([name, dmgFocus, buffs, debuffs]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { dmgFocus, buffs, debuffs });
});

// [SECTION:BASE_STATS] — Level 90 base stats from Prydwen.gg (HP, ATK, DEF, maxEnergy)
[
  ['Rover',         11400, 375, 1369, 125],
  ['Jiyan',         10488, 438, 1185, 125],
  ['Calcharo',      10500, 438, 1185, 125],
  ['Encore',        10513, 425, 1246, 125],
  ['Jianxin',       14113, 338, 1124, 150],
  ['Lingyang',      10388, 438, 1210, 125],
  ['Verina',        14238, 338, 1100, 175],
  ['Yinlin',        11000, 400, 1283, 125],
  ['Jinhsi',        10825, 413, 1259, 125],
  ['Changli',       10388, 463, 1100, 125],
  ['Zhezhi',        12250, 375, 1198, 125],
  ['Xiangli Yao',   10625, 425, 1222, 125],
  ['Shorekeeper',   16713, 288, 1100, 125],
  ['Camellya',      10325, 450, 1161, 125],
  ['Carlotta',      12450, 463, 1198, 125],
  ['Roccia',        12250, 375, 1198, 125],
  ['Phoebe',        10825, 413, 1259, 125],
  ['Brant',         11675, 375, 1308, 125],
  ['Cantarella',    11600, 400, 1100, 125],
  ['Zani',          10775, 438, 1136, 125],
  ['Ciaccona',      12238, 375, 1198, 125],
  ['Cartethyia',    14800, 313, 611,  125],
  ['Lupa',          11913, 388, 1185, 125],
  ['Phrolova',      10775, 438, 1136, 125],
  ['Augusta',       10300, 463, 1112, 125],
  ['Iuno',          10525, 450, 1124, 125],
  ['Galbrena',      10300, 463, 1112, 125],
  ['Qiuyuan',       12238, 375, 1198, 125],
  ['Chisa',         10775, 438, 1136, 125],
  ['Lynae',         12238, 375, 1198, 125],
  ['Mornye',        15375, 288, 1356, 125],
  ['Luuk Herssen',  10300, 463, 1112, 125],
  ['Aemeath',       11025, 425, 1149, 125],
  ['Sigrika',       10500, 438, 1185, 125],
  // 4★
  ['Aalto',         9850,  263, 1075, 150],
  ['Baizhi',        12813, 213, 1002, 175],
  ['Chixia',        9088,  300, 953,  150],
  ['Danjin',        9438,  263, 1149, 100],
  ['Yangyang',      10200, 250, 1100, 100],
  ['Sanhua',        10063, 275, 941,  100],
  ['Taoqi',         8950,  225, 1564, 125],
  ['Yuanwu',        8525,  225, 1637, 125],
  ['Mortefi',       10025, 250, 1136, 125],
  ['Youhu',         9975,  263, 1051, 125],
  ['Lumi',          8500,  338, 880,  125],
  ['Buling',        10625, 225, 1259, 125],
].forEach(([name, hp, atk, def, maxEnergy]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { baseHp: hp, baseAtk: atk, baseDef: def, maxEnergy });
});

// [SECTION:ROTATION_DATA] — Skill multipliers & rotation timing per character
// totalMult: sum of ATK% multipliers in one full rotation (all skills used)
// rotTime: full team rotation duration in seconds
// onField: character's on-field time in seconds
// Sources: Prydwen, WutheringLab, community rotation testing
[
  // 5★ Main DPS — high totalMult, long onField
  ['Jiyan',         2850, 22, 16],  // Heavy ATK burst in Qingloong
  ['Calcharo',      2600, 24, 17],  // Liberation → Death Messenger combo
  ['Encore',        2400, 22, 15],  // Cosmos Rampage mode
  ['Lingyang',      2200, 24, 16],  // Lion Form aerials
  ['Jinhsi',        3200, 25, 12],  // Incarnation nuke (front-loaded burst)
  ['Xiangli Yao',   2900, 25, 17],  // Mech form Liberation
  ['Camellya',      3100, 26, 19],  // Budding + Blossom full rotation
  ['Carlotta',      3400, 23, 14],  // Burst gunslinger, fast rotation
  ['Brant',         2700, 24, 17],  // Basic ATK chains + self-heal
  ['Cartethyia',    2500, 25, 16],  // HP scaling + Erosion
  ['Augusta',       2800, 23, 15],  // Heavy ATK + Shield
  ['Galbrena',      2600, 24, 16],  // Echo Skill + Heavy ATK
  ['Luuk Herssen',  2400, 23, 16],  // Basic ATK chains
  ['Aemeath',       3800, 24, 15],  // Strongest DPS: Res. Liberation + Fusion Burst/Tune Rupture extra multipliers
  ['Sigrika',       2800, 24, 16],  // Echo Skill + Heavy ATK Aero DPS, Rune consumption
  // 5★ Sub DPS — moderate totalMult, short onField
  ['Rover',         1800, 25, 8],   // Spectro Rover quick swap
  ['Yinlin',        1600, 25, 6],   // Off-field Coordinated
  ['Changli',       2000, 22, 8],   // Fast Fusion combos
  ['Zhezhi',        1400, 25, 5],   // Off-field painter
  ['Roccia',        1200, 25, 7],   // Support sub DPS
  ['Phoebe',        2200, 24, 10],  // Card skills burst
  ['Cantarella',    1300, 25, 5],   // Off-field Coordinated
  ['Zani',          2600, 24, 14],  // Res. Skill + Heavy ATK
  ['Ciaccona',      1100, 25, 6],   // Aero support
  ['Lupa',          2000, 24, 10],  // Liberation burst + team buff
  ['Phrolova',      1800, 24, 8],   // Echo Skill focused
  ['Iuno',          1500, 25, 8],   // Heavy ATK buff + heal
  ['Qiuyuan',       1200, 25, 6],   // Echo Skill DMG buff
  ['Chisa',         1100, 25, 6],   // DEF Shred support
  ['Lynae',         1300, 25, 6],   // Tune Break support
  ['Mornye',        800,  25, 5],   // Healer + Off-Tune
  // 5★ Healers/Support — low totalMult
  ['Verina',        600,  25, 4],   // Quick heal + ATK buff + deepen
  ['Jianxin',       800,  25, 6],   // Shield + grouping
  ['Shorekeeper',   500,  25, 3],   // Stellarealm crit buff + heal
  // 4★
  ['Aalto',         900,  25, 7],
  ['Baizhi',        400,  25, 3],
  ['Chixia',        1600, 24, 12],
  ['Danjin',        1400, 24, 8],
  ['Yangyang',      800,  25, 5],
  ['Sanhua',        1000, 25, 5],   // Quick swap Basic ATK Amp
  ['Taoqi',         600,  25, 5],
  ['Yuanwu',        700,  25, 5],   // Coordinated ATK
  ['Mortefi',       900,  25, 5],   // Heavy ATK buff + Coordinated
  ['Youhu',         700,  25, 5],
  ['Lumi',          1100, 25, 7],
  ['Buling',        600,  25, 4],
].forEach(([name, totalMult, rotTime, onField]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { totalMult, rotTime, onField });
});

// [SECTION:CHAR_TAGS] — Per-character stat scaling for filtering
// statScaling: which stat the character primarily scales from (ATK default, HP, DEF)
// dmgFocus is set in CHAR_TAGS above — this section only adds statScaling
[
  // 5★ Main DPS
  ['Jiyan',          'ATK'],
  ['Calcharo',       'ATK'],
  ['Encore',         'ATK'],
  ['Lingyang',       'ATK'],
  ['Jinhsi',         'ATK'],
  ['Xiangli Yao',    'ATK'],
  ['Camellya',       'ATK'],
  ['Carlotta',       'ATK'],
  ['Brant',          'ATK'],
  ['Zani',           'ATK'],
  ['Cartethyia',     'HP'],
  ['Phrolova',       'ATK'],
  ['Augusta',        'ATK'],
  ['Galbrena',       'ATK'],
  ['Luuk Herssen',   'ATK'],
  ['Aemeath',        'ATK'],
  ['Sigrika',        'ATK'],
  ['Chixia',         'ATK'],
  // 5★ Sub DPS
  ['Rover',          'ATK'],
  ['Yinlin',         'ATK'],
  ['Changli',        'ATK'],
  ['Zhezhi',         'ATK'],
  ['Roccia',         'ATK'],
  ['Phoebe',         'ATK'],
  ['Cantarella',     'ATK'],
  ['Ciaccona',       'ATK'],
  ['Lupa',           'ATK'],
  ['Iuno',           'ATK'],
  ['Qiuyuan',        'ATK'],
  ['Chisa',          'ATK'],
  ['Lynae',          'ATK'],
  ['Danjin',         'ATK'],
  ['Mortefi',        'ATK'],
  ['Sanhua',         'ATK'],
  ['Aalto',          'ATK'],
  ['Lumi',           'ATK'],
  ['Yangyang',       'ATK'],
  // 5★ Support / Healer
  ['Verina',         'ATK'],
  ['Shorekeeper',    'HP'],
  ['Jianxin',        'ATK'],
  ['Mornye',         'DEF'],
  ['Baizhi',         'HP'],
  ['Taoqi',          'DEF'],
  ['Yuanwu',         'ATK'],
  ['Youhu',          'HP'],
  ['Buling',         'ATK'],
].forEach(([name, statScaling]) => {
  if (CHARACTER_DATA[name]) {
    Object.assign(CHARACTER_DATA[name], { statScaling });
  }
});

// [SECTION:TIER_DATA] — Tier rankings from Prydwen.gg (ToA = Tower of Adversity, WW = Whimpering Waste)
// Best placement across DPS/Hybrid/Support roles. T0 = best, T4 = worst.
[
  ['Aemeath',       'T0',   'T1.5'],
  ['Sigrika',       'T0',   'T0.5'],
  ['Ciaccona',      'T0',   'T1'],
  ['Lupa',          'T0',   'T0.5'],
  ['Lynae',         'T0',   'T0.5'],
  ['Qiuyuan',       'T0',   'T0'],
  ['Mornye',        'T0',   'T0.5'],
  ['Shorekeeper',   'T0',   'T0'],
  ['Phrolova',      'T0.5', 'T0'],
  ['Augusta',       'T0.5', 'T1'],
  ['Cartethyia',    'T0.5', 'T1.5'],
  ['Galbrena',      'T0.5', 'T1'],
  ['Iuno',          'T0.5', 'T1'],
  ['Luuk Herssen',  'T0.5', 'T3'],
  ['Chisa',         'T0.5', 'T2'],
  ['Verina',        'T0.5', 'T0.5'],
  ['Carlotta',      'T1',   'T3'],
  ['Zani',          'T1',   'T1.5'],
  ['Brant',         'T1',   'T1'],
  ['Rover',         'T0.5', 'T1.5'],
  ['Jiyan',         'T1.5', 'T1'],
  ['Phoebe',        'T1.5', 'T1.5'],
  ['Cantarella',    'T1.5', 'T0.5'],
  ['Mortefi',       'T1.5', 'T1.5'],
  ['Sanhua',        'T1.5', 'T1.5'],
  ['Buling',        'T1.5', 'T3'],
  ['Encore',        'T2',   'T4'],
  ['Jinhsi',        'T2',   'T4'],
  ['Xiangli Yao',   'T2',   'T2'],
  ['Changli',       'T2',   'T1.5'],
  ['Zhezhi',        'T2',   'T3'],
  ['Baizhi',        'T2',   'T3'],
  ['Camellya',      'T3',   'T2'],
  ['Danjin',        'T3',   'T2'],
  ['Roccia',        'T3',   'T2'],
  ['Yinlin',        'T3',   'T4'],
  ['Calcharo',      'T4',   'T4'],
  ['Chixia',        'T4',   'T4'],
  ['Lingyang',      'T4',   'T3'],
  ['Aalto',         'T4',   'T4'],
  ['Jianxin',       'T4',   'T4'],
  ['Lumi',          'T4',   'T4'],
  ['Taoqi',         'T4',   'T4'],
  ['Yangyang',      'T4',   'T4'],
  ['Youhu',         'T4',   'T4'],
  ['Yuanwu',        'T4',   'T4'],
].forEach(([name, toa, ww]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { tier: { toa, ww } });
});

// [SECTION:REGION_DATA] — Character regions/nations
// Huanglong (Jinzhou/Mengzhou), Rinascita, Black Shores, Septimont, Lahai-Roi
[
  // Huanglong
  ['Rover',        'Huanglong'], ['Jiyan',        'Huanglong'], ['Calcharo',     'Huanglong'],
  ['Encore',       'Huanglong'], ['Jianxin',      'Huanglong'], ['Lingyang',     'Huanglong'],
  ['Verina',       'Huanglong'], ['Yinlin',       'Huanglong'], ['Jinhsi',       'Huanglong'],
  ['Changli',      'Huanglong'], ['Zhezhi',       'Huanglong'], ['Xiangli Yao',  'Huanglong'],
  ['Qiuyuan',      'Huanglong'],
  // Huanglong 4★
  ['Aalto',        'Huanglong'], ['Baizhi',       'Huanglong'], ['Chixia',       'Huanglong'],
  ['Danjin',       'Huanglong'], ['Yangyang',     'Huanglong'], ['Sanhua',       'Huanglong'],
  ['Taoqi',        'Huanglong'], ['Yuanwu',       'Huanglong'], ['Mortefi',      'Huanglong'],
  ['Youhu',        'Huanglong'], ['Lumi',         'Huanglong'], ['Buling',       'Huanglong'],
  // Black Shores
  ['Shorekeeper',  'Black Shores'], ['Camellya',   'Black Shores'], ['Galbrena',   'Black Shores'],
  // Rinascita
  ['Carlotta',     'Rinascita'], ['Roccia',       'Rinascita'], ['Phoebe',       'Rinascita'],
  ['Brant',        'Rinascita'], ['Cantarella',   'Rinascita'], ['Zani',         'Rinascita'],
  ['Ciaccona',     'Rinascita'], ['Cartethyia',   'Rinascita'], ['Lupa',         'Rinascita'],
  ['Phrolova',     'Rinascita'],
  // Septimont
  ['Augusta',      'Septimont'], ['Iuno',         'Septimont'],
  // Lahai-Roi (Startorch Academy)
  ['Chisa',        'Lahai-Roi'], ['Lynae',        'Lahai-Roi'], ['Mornye',       'Lahai-Roi'],
  ['Luuk Herssen', 'Lahai-Roi'], ['Aemeath',      'Lahai-Roi'], ['Sigrika',      'Lahai-Roi'],
].forEach(([name, region]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { region });
});

// [SECTION:BIRTHDAY_DATA] — Character birthdays (month-day format)
// Source: wutheringwaves.fandom.com, esportstales.com, gamerant.com
// Characters without official birthdays are omitted
[
  ['Jiyan',       '12-14'], ['Calcharo',    '07-08'], ['Encore',      '03-21'],
  ['Jianxin',     '04-06'], ['Lingyang',    '08-08'], ['Verina',      '05-18'],
  ['Yinlin',      '09-17'], ['Jinhsi',      '03-06'], ['Changli',     '06-06'],
  ['Zhezhi',      '12-31'], ['Shorekeeper', '02-27'], ['Camellya',    '12-10'],
  ['Roccia',      '01-31'], ['Cantarella',  '06-18'],
  ['Aalto',       '06-11'], ['Baizhi',      '09-10'], ['Chixia',      '04-18'],
  ['Danjin',      '08-31'], ['Yangyang',    '10-11'], ['Sanhua',      '01-20'],
  ['Taoqi',       '02-25'], ['Yuanwu',      '10-02'], ['Mortefi',     '11-06'],
  ['Youhu',       '10-13'],
].forEach(([name, birthday]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { birthday });
});

// [SECTION:CHAR_BUFFS] — Per-character buff/debuff data with exact values
// Each entry: { outroBuffs: [], libBuffs: [], selfBuffs: [], debuffs: [] }
// Buff format: { stat, value, target: 'next'|'team'|'self', duration, condition? }
// stat types: atkPct, allDmg, elemDmg, skillDmg, basicDmg, heavyDmg, libDmg, echoDmg,
//             critRate, critDmg, deepen, resShred, defShred, defIgnore, coordDmg
const CHAR_BUFF_TABLE = {
  // ── 5★ Supports / Sub DPS ──
  'Verina': {
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 30 }],
    libBuffs: [{ stat: 'atkPct', value: 20, target: 'team', duration: 20 }],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 15% All DMG Deepen 30s. Inherent 1: 20% ATK teamwide 20s (on Forte/Lib/Outro).',
  },
  'Shorekeeper': {
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 30 }],
    libBuffs: [
      { stat: 'critRate', value: 12.5, target: 'team', duration: 30, condition: 'In Stellarealm field' },
      { stat: 'critDmg', value: 25, target: 'team', duration: 30, condition: 'In Stellarealm field' },
    ],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 15% All DMG Amp 30s. Lib Stellarealm: +12.5% CR +25% CD (30s). Knockdown recovery.',
  },
  'Jianxin': {
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [{ stat: 'defShred', value: 15, duration: 10, condition: 'Shield active' }],
    note: 'Outro: 15% All DMG Deepen. Shield + grouping. DEF Shred on shielded.',
  },
  'Lynae': {
    outroBuffs: [
      { stat: 'deepen', value: 15, target: 'next', duration: 14 },
      { stat: 'libDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [{ stat: 'allDmg', value: 24, target: 'team', duration: 40 }],
    selfBuffs: [],
    debuffs: [],
    tuneBreak: {
      boostToTeam: 40, // Visual Impact grants +40 Tune Break Boost teamwide
      baseTuneBreakBoost: 10, // 3.x char base stat
      ruptureDmgMult: 350, // Tune Rupture Response — Spectral Analysis: ~350% ATK Level-scaled
      strainDmgPerStack: 0.12, // per stack of Strain Interfered, per point of Tune Break Boost = +0.12% total DMG
      maxStrainStacks: 3, // base 2 + 1 from Lynae
    },
    note: 'Lib: 24% All DMG (30s). Outro: 15% Deepen + 25% Lib Amp (14s). Tune Break Boost +40 team. Rupture Response every 8s. Strain: 0.12% DMG per stack per Boost.',
  },
  'Mornye': {
    outroBuffs: [{ stat: 'deepen', value: 25, target: 'next', duration: 30 }],
    libBuffs: [{ stat: 'allDmg', value: 15, target: 'team', duration: 40 }],
    selfBuffs: [],
    weaponBuffs: [{ stat: 'critDmg', value: 40, target: 'team', duration: 10, condition: 'Sig weapon: team Crit DMG +40% on heal' }],
    debuffs: [{ stat: 'offTune', value: 15, duration: 20, condition: 'Off-Tune buildup' }],
    tuneBreak: {
      boostToTeam: 0,
      baseTuneBreakBoost: 10,
      ruptureDmgMult: 300, // Tune Rupture Response — Particle Jet
      strainDmgPerStack: 0.12,
      maxStrainStacks: 3, // base 2 + 1 from Mornye
      interferedDmgAmp: 40, // targets with Interfered Marker take up to 40% more DMG (0.25% per 1% ER over 100%)
    },
    note: 'Outro: 25% Deepen. Lib: 15% All DMG. Interfered Marker: up to 40% DMG Amp on target. Rupture Response. Off-Tune buildup amplifier.',
  },
  'Roccia': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Havoc DMG Amp' },
      { stat: 'basicDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 20 }],
    debuffs: [],
    note: 'Outro: +20% Havoc DMG Amp + 25% Basic ATK DMG Amp (14s). Inherent 1: self ATK +20% 12s.',
  },
  'Changli': {
    outroBuffs: [{ stat: 'elemDmg', value: 20, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 25, target: 'self', duration: 10, condition: 'After 4 Resonance Skill casts' }],
    debuffs: [],
    note: 'Outro: 20% Fusion DMG Amp to next. Self ATK ramp.',
  },
  'Yinlin': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14 },
      { stat: 'libDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [{ stat: 'resShred', value: 10, duration: 10, condition: 'Electro RES' }],
    note: 'Outro: +20% Electro DMG Amp + 25% Liberation DMG Amp (14s). Off-field Coordinated ATK. Electro RES Shred.',
  },
  'Zhezhi': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Glacio DMG Amp' },
      { stat: 'skillDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: +20% Glacio DMG Amp + 25% Res. Skill DMG Amp (14s). Off-field painter DMG.',
  },
  'Phoebe': {
    outroBuffs: [
      { stat: 'resShred', value: 10, target: 'enemy', duration: 14, condition: 'Spectro RES (Confession mode)' },
      { stat: 'deepen', value: 100, target: 'next', duration: 14, condition: 'Spectro Frazzle DMG Amp (Confession)' },
    ],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [{ stat: 'frazzle', value: 18, duration: 15, condition: '18 stacks per rotation in Confession mode' }],
    note: 'Confession: applies 18 Frazzle stacks. Outro: Spectro RES -10% + 100% Frazzle DMG Amp. Frazzle = Level-scaling DOT, not ATK-based.',
  },
  'Cantarella': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Havoc DMG Amp' },
      { stat: 'skillDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: +20% Havoc DMG + 25% Skill DMG Amp (14s). Off-field Coordinated ATK. Heal.',
  },
  'Ciaccona': {
    outroBuffs: [{ stat: 'deepen', value: 100, target: 'next', duration: 30, condition: 'Aero Erosion DMG Amp only' }],
    libBuffs: [{ stat: 'allDmg', value: 24, target: 'team', duration: 30, condition: 'Solo Concert: Aero DMG +24%' }],
    selfBuffs: [],
    debuffs: [
      { stat: 'erosion', value: 3, duration: 15, condition: '3 stacks Aero Erosion, ticks every 2s' },
      { stat: 'resShred', value: 16, duration: 20, condition: 'Weapon: Aero RES -16%' },
    ],
    note: 'Solo Concert: +24% Aero DMG team. Outro: +100% Aero Erosion DMG Amp (30s). Aero Erosion 3 stacks. Weapon: Aero RES -16%.',
  },
  'Lupa': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Fusion DMG Amp' },
      { stat: 'basicDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [{ stat: 'atkPct', value: 18, target: 'team', duration: 40 }],
    selfBuffs: [],
    debuffs: [{ stat: 'resShred', value: 15, duration: 10, condition: 'Fusion RES' }],
    note: 'Outro: +20% Fusion DMG + 25% Basic ATK DMG Amp (14s). Lib: 18% ATK team. Fusion RES Shred.',
  },
  'Iuno': {
    outroBuffs: [{ stat: 'heavyDmg', value: 50, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 50% Heavy ATK DMG Amp. Heal + Shield. Liberation DPS capable.',
  },
  'Qiuyuan': {
    outroBuffs: [{ stat: 'echoDmg', value: 50, target: 'next', duration: 14 }],
    libBuffs: [{ stat: 'echoDmg', value: 30, target: 'team', duration: 40 }],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 50% Echo Skill DMG Amp. Lib: 30% Echo DMG. Sig weapon: 20% Echo DMG.',
  },
  'Chisa': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [{ stat: 'defShred', value: 18, duration: 12 }],
    note: 'DEF Shred 18% on skill. Quick swap support.',
  },
  // ── 5★ Main DPS (mostly self-buffs, less team contribution) ──
  'Camellya': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'elemDmg', value: 30, target: 'self', duration: 99, condition: 'Inherent: 2×15% Havoc DMG' },
      { stat: 'critDmg', value: 28, target: 'self', duration: 18, condition: 'S1: After Intro' },
    ],
    debuffs: [],
    note: 'Self-buffing Main DPS. Inherent: +30% Havoc DMG. S1: +28% CD after Intro.',
  },
  'Carlotta': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 12, target: 'self', duration: 99, condition: 'Weapon passive' }],
    debuffs: [],
    note: 'Burst Glacio DPS. Weapon passive: 12% Glacio + 24% Charged ATK.',
  },
  'Jinhsi': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Incarnation nuke DPS. Weapon: 12% Spectro + 24% Lib DMG.',
  },
  'Xiangli Yao': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Mech form Liberation DPS. Weapon: 12% Electro + 24% Mech DMG.',
  },
  'Zani': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'atkPct', value: 24, target: 'self', duration: 20, condition: 'Weapon R1' },
      { stat: 'defIgnore', value: 16, target: 'self', duration: 14, condition: 'Weapon R1: During Lib + Frazzle Amp 50%' },
    ],
    debuffs: [],
    note: 'Converts Frazzle→Heliacal Embers. Weapon: +24% ATK, 16% DEF Ignore, 50% Frazzle DMG in Lib.',
  },
  // ── 4★ ──
  'Sanhua': {
    outroBuffs: [{ stat: 'basicDmg', value: 38, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 38% Basic ATK DMG Amp (14s). Quick swap.',
  },
  'Mortefi': {
    outroBuffs: [{ stat: 'heavyDmg', value: 38, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 38% Heavy ATK DMG Amp. Off-field Coordinated ATK on Heavy ATK.',
  },
  'Danjin': {
    outroBuffs: [{ stat: 'elemDmg', value: 23, target: 'next', duration: 14, condition: 'Havoc DMG Bonus' }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 23% Havoc DMG Bonus to next.',
  },
  'Baizhi': {
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 24 }],
    libBuffs: [{ stat: 'atkPct', value: 15, target: 'team', duration: 40 }],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 15% Deepen. Lib: 15% ATK teamwide. Heal.',
  },
  'Taoqi': {
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [{ stat: 'defShred', value: 12, duration: 8, condition: 'Shield active' }],
    note: 'Outro: 15% Deepen. Shield. DEF Shred 12% while shielded.',
  },
  'Yuanwu': {
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 15% Deepen. Coordinated ATK. Shield.',
  },
  'Yangyang': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Energy Regen support. Minimal direct DMG contribution.',
  },
  'Buling': {
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    electroFlare: true,
    note: 'Outro: 15% Deepen. Heal. Electro Flare via Liberation.',
  },
  'Aalto': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 12, target: 'self', duration: 99, condition: 'Weapon passive: Aero DMG +12%' }],
    debuffs: [],
    note: 'Off-field Aero applicator. Mist clone Coordinated ATK.',
  },
  'Chixia': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 15, target: 'self', duration: 10, condition: 'Inherent: ATK buff after Resonance Skill' }],
    debuffs: [],
    note: 'Fusion DPS. Resonance Skill burst. Whizzing Fight Spirit sustained fire.',
  },
  'Lumi': {
    outroBuffs: [{ stat: 'skillDmg', value: 38, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 38% Resonance Skill DMG Amp to next. Electro sub-DPS.',
  },
  'Youhu': {
    outroBuffs: [],
    libBuffs: [{ stat: 'atkPct', value: 12, target: 'team', duration: 15 }],
    selfBuffs: [],
    debuffs: [],
    note: 'Glacio healer. Coordinated ATK Amp. Lib: 12% ATK teamwide.',
  },
  // ── 5★ Main DPS missing from initial table ──
  'Aemeath': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'critDmg', value: 60, target: 'self', duration: 30, condition: 'Tune Rupture/Fusion Burst mode: 30% per teammate (max 60%)' },
      { stat: 'deepen', value: 25, target: 'self', duration: 20, condition: 'RL Finisher deepen amplification' },
      { stat: 'defIgnore', value: 32, target: 'self', duration: 8, condition: 'Sig weapon: on Tune Rupture/Fusion Burst infliction' },
      { stat: 'resShred', value: 10, target: 'self', duration: 8, condition: 'Sig weapon: Fusion RES ignore' },
    ],
    debuffs: [{ stat: 'fusionBurst', value: 10, duration: 30, condition: 'Fusion Burst mode: 10 stacks, enhanced skills use max stacks without consuming' }],
    note: 'Strongest DPS in game. Dual mode: Tune Rupture (ST) / Fusion Burst (AoE). Enhanced skills scale off Fusion Trail (30 stacks = 300% mult). Sig weapon: 32% DEF Ignore + 10% Fusion RES. Self-buff: 60% CD + 25% Deepen.',
  },
  'Jiyan': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 12, target: 'self', duration: 99, condition: 'Weapon passive: Aero DMG +12%' }],
    debuffs: [],
    note: 'Heavy ATK DPS in Qingloong form. Weapon: Heavy ATK +20%.',
  },
  'Calcharo': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 12, target: 'self', duration: 10, condition: 'Weapon passive' }],
    debuffs: [],
    note: 'Liberation → Death Messenger combo. Electro DMG +12% from weapon.',
  },
  'Encore': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Cosmos Rampage mode Basic ATK DPS.',
  },
  'Lingyang': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Lion Form aerial Basic ATK DPS.',
  },
  'Cartethyia': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'elemDmg', value: 20, target: 'self', duration: 20, condition: 'Erosion stacks on target: Aero DMG amp' },
      { stat: 'defIgnore', value: 16, target: 'self', duration: 8, condition: 'Weapon: DEF Ignore +16% on Aero Eroded targets' },
    ],
    debuffs: [{ stat: 'erosion', value: 6, duration: 15, condition: '6 stacks with Rover (3 base). HP-scaling DPS.' }],
    note: 'Top-tier Aero DPS. HP-scaling. Self-sufficient Erosion duo with Ciaccona. Weapon: DEF Ignore +16%.',
  },
  'Brant': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Fusion DMG Amp' },
      { stat: 'skillDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 12, target: 'self', duration: 99, condition: 'Weapon passive: Fusion DMG +12%' }],
    debuffs: [],
    note: 'Outro: +20% Fusion DMG + 25% Skill DMG Amp (14s). Self-heal. Weapon: Fusion DMG +12%.',
  },
  'Augusta': {
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Heavy ATK AoE DPS. Shield. Outro: 15% All DMG Deepen.',
  },
  'Galbrena': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Echo Skill + Heavy ATK Fusion DPS.',
  },
  'Luuk Herssen': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'basicDmg', value: 20, target: 'self', duration: 99, condition: 'Weapon: Basic ATK DMG Amp +20%' },
      { stat: 'elemDmg', value: 20, target: 'self', duration: 99, condition: 'Weapon: Spectro DMG +20%' },
      { stat: 'defIgnore', value: 10, target: 'self', duration: 99, condition: 'Weapon: DEF Ignore +10%' },
    ],
    debuffs: [],
    note: 'Spectro Gauntlets DPS. Tune Strain focused. Weapon: Basic ATK +20%, Spectro +20%, DEF Ignore +10%.',
  },
  'Sigrika': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'echoDmg', value: 50, target: 'self', duration: 15, condition: 'Inherent: +2% Echo Skill DMG per 1% ER above 125% (up to 50%)' },
      { stat: 'defIgnore', value: 10, target: 'self', duration: 6, condition: 'Sig weapon: Aero DMG ignores 10% DEF on Echo Skill hit' },
    ],
    debuffs: [],
    note: 'Rune-consuming Echo Skill hypercarry. Inherent: up to 50% Echo DMG from ER. Sig weapon: 32% Echo Skill Amp + 10% DEF Ignore. Crowd control via Runic modes.',
  },
  'Phrolova': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Havoc DMG Amp' },
      { stat: 'heavyDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'critDmg', value: 60, target: 'self', duration: 99, condition: 'Aftersound: +2.5% CD per stack, 24 stacks max' }],
    debuffs: [],
    note: 'Outro: +20% Havoc DMG + 25% Heavy ATK DMG Amp (14s). Self: up to 60% CD from Aftersound.',
  },
  // ── Electro characters with Electro Flare ──
  'Xiangli Yao': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 12, target: 'self', duration: 99, condition: 'Weapon passive: Electro DMG +12%' }],
    debuffs: [],
    note: 'Mech form Liberation DPS. Weapon: 12% Electro + 24% Mech DMG.',
  },
  'Jinhsi': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Incarnation nuke DPS. Weapon: 12% Spectro + 24% Lib DMG.',
  },
  'Rover': {
    outroBuffs: [{ stat: 'resShred', value: 10, target: 'enemy', duration: 20, condition: 'S6: Spectro RES Shred' }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [{ stat: 'frazzle', value: 10, duration: 15, condition: '10 stacks via Skill + Liberation. Shimmer prevents decay.' }],
    note: 'Spectro Frazzle applier. Outro: Spectro RES -10% (S6). Shimmer prevents stack decay.',
  },
};

// [SECTION:SKILL_MULTIPLIERS] — Per-character skill ATK% multipliers at Lv.1 (Lv.10 ≈ 2×)
// Format: { charName: [ [type, skillName, multString], ... ] }
// Source: game8.co character pages
const SKILL_MULTIPLIERS = {
  'Augusta': [
    ['Basic ATK', "Hunter's Path", '28.9% → 33.7%×2 → 33%×3 → 32.5%×3'],
    ['Heavy ATK', 'Steelclash', '23.3%×3'],
    ['Heavy ATK', 'Thunderoar', 'Backstep 27% / Spinslash 71.3%×3 / Uppercut 90%×2'],
    ['Skill', "Warrior's Blade", '110%×3'],
    ['Liberation', 'Sword of Eternal Oath', '16.6%×2 + 66.4%×3 + 16.6%×2 + 287.6%'],
    ['Liberation', 'Sunborne', '60% ×9 slashes'],
    ['Liberation', 'Everbright Protector', '120% + 450% + 3%×10'],
    ['Forte', 'Undying Sunlight', 'Strike 70%×2 / Leap 112%+14%×2 / Plunge 43.6%+392%'],
    ['Intro', 'Stride of Goldenflare', '50%×2'],
    ['Outro', 'Oath of Radiance', '+15% All DMG Amp (14s)'],
  ],
  'Aemeath': [
    ['Basic ATK', 'Aemeath Form', '23.3% → 35% → 42.1% → 67.7%'],
    ['Basic ATK', 'Mech Form', '35% → 46.7% → 52.8% → 67.7%'],
    ['Charged ATK', 'Aemeath Charged II', '5.8%×4 + 93.4%'],
    ['Charged ATK', 'Mech Charged II', '116.7%'],
    ['Skill', 'Sync Strikes', 'Merge 67.7% / Call of Dawn 82.1%'],
    ['Skill', 'Seraphic Duet', 'Overture 171% / Encore 180%'],
    ['Liberation', 'Heavenfall Edict', 'Overdrive 101%+134.7%×3 / Finale 900%'],
    ['Intro', 'Songs Across the Universe', '6.8%×2 + 54.2%'],
    ['Intro', 'Debut of Meteoric Radiance', '32.9% + 49.3%'],
    ['Outro', 'Grand Finale', 'Spectro ATK coordinated DMG'],
  ],
  'Brant': [
    ['Basic ATK', 'Stage 1-4', '25.4% → 51% → 116.5% → 70.5%'],
    ['Mid-air', 'Charged Combo', '61.8% → 167.1% → 46.8% → 85.1% → 127.6%'],
    ['Heavy ATK', 'Rhapsodic Riff', '85%'],
    ['Skill', 'Anchors Aweigh', '100.8% + 67.2%'],
    ['Liberation', 'Bravo!', '42.8%×4 + 171.1%'],
    ['Forte', 'Returned from Ashes', '23.8%×2 + 47.5% + 95%×2 + 665%'],
    ['Intro', 'Here I Am!', '102% + 25.5%'],
    ['Outro', 'Standing Ovation', '+20% Fusion DMG + 25% Skill DMG Amp (14s)'],
  ],
  'Calcharo': [
    ['Basic ATK', 'Gnawing Fangs', '23%×2 → 50% → 107.1% → 133.3%'],
    ['Heavy ATK', 'Standard', '20.8%×5'],
    ['Skill', 'Extermination Order', '86.5% → 129.7% → 216.2%'],
    ['Forte', 'Mercy', '19.7%×8 + 39.3%'],
    ['Forte', 'Death Messenger', '49.2%×8 + 98.4%'],
    ['Liberation', 'Phantom Etching', '300% initial + combo chain'],
    ['Liberation', 'Hounds Roar', '44.3% → 50.2% → 56.2% → 68.1% → 75.5%'],
    ['Intro', 'Wanted Outlaw', '20%×2 + 30%×2'],
    ['Outro', 'Shadowy Raid', '196% + 392%'],
  ],
  'Camellya': [
    ['Basic ATK', 'Thorns 1-5', '31.5% → 46.8% → 76.5% → 248.4% → 96.9%'],
    ['Heavy ATK', 'Standard', '44.3%×3'],
    ['Skill', 'Crimson Blossom', '57.2%×2'],
    ['Skill', 'Vining Waltz 1-4', '48.5% → 45.9% → 66.2% → 102%'],
    ['Skill', 'Blazing Waltz', '11%×19'],
    ['Forte', 'Ephemeral (Budding)', '635%'],
    ['Liberation', 'Fervor Efflorescent', '605%'],
    ['Intro', 'Everblooming', '100%'],
    ['Outro', 'Twining', '329.2% + 459%'],
  ],
  'Cantarella': [
    ['Basic ATK', 'Stage 1-3', '40% → 73.3% → 73%'],
    ['Heavy ATK', 'Standard', '28.8%×2'],
    ['Skill', 'Graceful Step', '37%×2'],
    ['Skill', 'Flickering Reverie', '98.7%'],
    ['Forte', 'Phantom Sting 1-3', '53.3% → 63.3% → 130%'],
    ['Forte', 'Perception Drain', '336%×2'],
    ['Liberation', 'Flowing Suffocation', '189.1% + 7.3%×21'],
    ['Intro', 'Ripple', '21.3%×4'],
    ['Outro', 'Sweet Nightmare', '+20% Havoc DMG + 25% Skill DMG Amp (14s)'],
  ],
  'Carlotta': [
    ['Basic ATK', 'Stage 1-2', '27.2% → 66.3%'],
    ['Basic ATK', 'Necessary Measures 1-3', '33.2% → 67.2% → 117.3%'],
    ['Heavy ATK', 'Standard', '76.5%'],
    ['Heavy ATK', 'Containment Tactics', '114.8%'],
    ['Forte', 'Imminent Oblivion', '33.6%×5 + 252.1%'],
    ['Skill', 'Art of Violence', '72.5%×2'],
    ['Skill', 'Chromatic Splendor', '56.7%×2 + 170.1%'],
    ['Liberation', 'Era of New Wave', '202.6%'],
    ['Liberation', 'Death Knell', '(92.3% + 7.3%×4) per shot'],
    ['Liberation', 'Fatal Finale', '324.1%'],
    ['Intro', 'Wintertime Aria', '90% + 30%×2'],
    ['Outro', 'Closing Remark', '794.2%'],
  ],
  'Cartethyia': [
    ['Basic ATK', 'Base Form 1-4', '2.4%HP → 7%HP → 8.6%HP → 7.6%HP'],
    ['Basic ATK', 'Fleurdelys 1-5', '3.3%HP → 4.6%HP → 6.3%HP → 6.9%HP → 126.7%HP'],
    ['Heavy ATK', 'Fleurdelys Enhanced', '3.9%×2 + 2%HP'],
    ['Skill', 'Base Form', '3.5%×3 + 4.5%HP'],
    ['Skill', 'Fleurdelys 1-2', '12.5%HP / 14.2%HP'],
    ['Liberation', 'Blade of Howling Squall', '6.6%×7 HP'],
    ['Intro', 'Fleurdelys Intro', '2.2% + 5%HP'],
    ['Outro', 'Gale\'s Verdict', '+17.5% Aero DMG vs Negative Status (20s)'],
  ],
  'Changli': [
    ['Basic ATK', 'Stage 1-4', '29.7% → 35.7% → 55% → 85%'],
    ['Mid-air', 'Stage 1-4', '30.9% → 51.2% → 66.4% → 63.8%'],
    ['Skill', 'True Sight Capture', '41.2%×3 + 82.4%'],
    ['Skill', 'True Sight Conquest', '29.7%×2 + 41.5% + 47.4%'],
    ['Skill', 'True Sight Charge', '36.6% + 54.8%'],
    ['Forte', 'Flaming Sacrifice', '19.7%×5 + 230.3%'],
    ['Liberation', 'Radiance of Fealty', '610%'],
    ['Intro', 'Blazing Entry', '22.4% + 13.1%×4'],
    ['Outro', 'Pyrospell', '+20% Fusion DMG Amp (14s)'],
  ],
  'Chisa': [
    ['Basic ATK', 'Stage 1-2', '16.8% → 48%'],
    ['Basic ATK', 'Death Snip', '15% + 7.5% + 52.5%'],
    ['Skill', 'Eye of Unraveling', '18%'],
    ['Skill', 'Serrated Loop', '8.8%×8'],
    ['Forte', 'Blitz 1-3', '34.7% → 42.8% → 64.3%'],
    ['Forte', 'Sawring Eradication', '25.9% + 103.7%'],
    ['Liberation', 'Moment of Nihility', '480%'],
    ['Intro', 'Reverberance Return', '48%'],
    ['Outro', 'Thread\'s End', '+3 max Negative Status stacks (15s)'],
  ],
  'Ciaccona': [
    ['Basic ATK', 'Stage 1-4', '28.7% → 81.7% → 66.4% → 123%'],
    ['Skill', 'Harmonic Allegro', '20.3%×4'],
    ['Forte', 'Quadruple Downbeat', '15.8%×10 + 158%'],
    ['Liberation', "Singer's Triple Cadenza", '553.5% + Tonic 3.1%×20/tick'],
    ['Intro', 'Roaming with the Wind', '95.1%'],
    ['Outro', 'Windcalling Tune', '+100% Aero Erosion DMG Amp (30s)'],
  ],
  'Encore': [
    ['Basic ATK', 'Wooly Attack 1-4', '28% → 33.3% → 33.4%×2 → 19.3%×4'],
    ['Basic ATK', 'Wooly Strike', '120%'],
    ['Heavy ATK', 'Standard', '94.1%'],
    ['Skill', 'Flaming Woolies', '38.5%×8'],
    ['Skill', 'Energetic Welcome', '170.6%'],
    ['Liberation', 'Cosmos Frolicking 1-4', '45.4%×2 → 28.4%×3 → 33.2%×4 → 97.6%×3'],
    ['Liberation', 'Cosmos Heavy ATK', '109.4%'],
    ['Liberation', 'Cosmos Rampage', '31.9%×4'],
    ['Forte', 'Cloudy Frenzy', '168%'],
    ['Forte', 'Cosmos Rupture', '23.4%×6 + 249.1%'],
    ['Intro', 'Woolies Can Help!', '100%'],
    ['Outro', 'Thermal Field', '176.8% ×4 ticks'],
  ],
  'Galbrena': [
    ['Basic ATK', 'Stage 1-4', '29.8% → 66.2% → 71.9% → 89.5%'],
    ['Heavy ATK', 'Volley of Death 1-3', '53.6% → 34.8% → 84.4%'],
    ['Skill', 'Encroach', '5.4% + 12.6%'],
    ['Skill', 'Ascent of Malice', '25.9%×2'],
    ['Liberation', 'Hellfire Absolution', '55.8% + 45.6%×11'],
    ['Intro', 'Hellflare Overload', '47.3%'],
    ['Outro', 'Ashen Pursuit', '79.5%×3 + 556.5%'],
  ],
  'Iuno': [
    ['Basic ATK', 'Moonring 1-3', '44.1% → 70.2% → 134.1%'],
    ['Basic ATK', 'Moonbow 1-3', '63.6% → 84% → 168%'],
    ['Skill', 'Pulse of Origins', '9.4%×7 + 65.7%'],
    ['Skill', 'Closing Refrain', '70.8%×2 + 72.9%'],
    ['Skill', 'Arc Beyond the Edge', '110.6%×2'],
    ['Heavy ATK', 'Absolute Fullness', '80%'],
    ['Liberation', 'Beneath Lunar Tides', '550%'],
    ['Intro', 'Illuminated Manifestation', '8%×7 + 24%'],
    ['Outro', 'From Gloom to Gleam', '100%'],
  ],
  'Jiyan': [
    ['Basic ATK', 'Lone Lance 1-5', '36.8% → 22% → 91.5% → 66.6% → 237.5%'],
    ['Heavy ATK', 'Standard', '11.2%×6'],
    ['Skill', 'Windqueller', '53.5%×4'],
    ['Liberation', 'Lance of Qingloong 1-3', '33%×8 → 31%×8 → 33.6%×8'],
    ['Forte', 'Emerald Storm Finale', '71.9%×2 + 215.7%'],
    ['Intro', 'Tactical Strike', '100%'],
    ['Outro', 'Discipline', '313.4% coordinated ATK'],
  ],
  'Jinhsi': [
    ['Basic ATK', 'Stage 1-4', '33.4% → 49% → 53.6% → 79.3%'],
    ['Heavy ATK', 'Standard', '12%×5 + 18% + 42%'],
    ['Skill', 'Standard', '9.8%×4 + 39.2%'],
    ['Skill', 'Overflowing Radiance', '5%×4 + 14.9%×4 + 19.8%'],
    ['Basic ATK', 'Incarnation 1-4', '44.6% → 65.4% → 83.4% → 93.9%'],
    ['Forte', 'Stella Glamor', '175% + 22.4% per Incandescence'],
    ['Liberation', 'Unbound Enlightenment', '251.4% + 586.6%'],
    ['Intro', 'Luminal Descent', '80%'],
    ['Outro', 'Guiding Light', 'Spectro coordinated ATK'],
  ],
  'Jianxin': [
    ['Basic ATK', 'Stage 1-4', '37.6% → 35.3% → 45.3% → 46.4%+30.9%'],
    ['Heavy ATK', 'Standard', '40%'],
    ['Skill', 'Chi Counter', '28.8%×2'],
    ['Skill', 'Chi Parry', '72.8%'],
    ['Forte', 'Primordial Chi Spiral', '42.2%×2 + 84.4%'],
    ['Liberation', 'Purification Force Field', '69.6% + 92.8%'],
    ['Intro', 'Essence of Tao', '50%×2'],
    ['Outro', 'Transcendence', '+15% All DMG Deepen (14s)'],
  ],
  'Lingyang': [
    ['Basic ATK', 'Stage 1-4', '20.3% → 26.5%×2 → 22.8%×3 → 39%'],
    ['Heavy ATK', 'Standard', '11.3%×5'],
    ['Skill', 'Ancient Arts', '100%'],
    ['Liberation', 'Cloudsplitter', '51%×4'],
    ['Liberation', 'Striding Lion 1-4', '40%×2 → 43.5% → 51%×2 → 55%'],
    ['Forte', 'Mountain Roar', '30%×4'],
    ['Intro', 'Lion Awakens', '100%'],
    ['Outro', 'Feline Farewell', '+20% Glacio DMG + 25% Basic ATK DMG Amp (14s)'],
  ],
  'Lupa': [
    ['Basic ATK', 'Stage 1-4', '45.3% → 45.3% → 79.3% → 89.9%'],
    ['Basic ATK', "Wolf's Claw", '36.3% + 9.1%×4 + 48.4%'],
    ['Mid-air', 'Starfall', '6.4%×4 + 59.4%'],
    ['Skill', "Shewolf's Hunt", '70.8%'],
    ['Skill', 'Feral Fang', '157.7%'],
    ['Skill', 'Dance with the Wolf', '28.2% + 21.1%×4 + 169.1%'],
    ['Liberation', 'Fire-Kissed Glory', '412.7%'],
    ['Liberation', 'Foebreaker', '153.1%'],
    ['Intro', 'Nowhere to Run!', '399.2% + 25%×4'],
    ['Outro', 'Blazing Pack', '+20% Fusion DMG + 25% Basic ATK DMG Amp (14s)'],
  ],
  'Luuk Herssen': [
    ['Basic ATK', 'Stage 1-4', '40.8% → 75.7% → 75.9% → 48.5%'],
    ['Mid-air', 'Dissection/Resection', '47.3% → 71.9% → 75.4%'],
    ['Skill', 'Golden Reflux', '101.2%'],
    ['Skill', 'Aureole of Execution', 'Ring 111.3% / Breach 144.7% / Glare 178.1%'],
    ['Forte', 'Gavel of Earthshaker', '154.4%'],
    ['Liberation', "Rewritten in Winter's Margins", '375% + 25%×5'],
    ['Intro', 'Before Injection of Dawn', '36.6%×3'],
    ['Outro', 'Bow to the Last Light', '500%'],
  ],
  'Lynae': [
    ['Basic ATK', 'Stage 1-3', '43.4% → 79.1% → 62.1%'],
    ['Heavy ATK', 'Spark Collision Lv.3', '139.7%×2'],
    ['Basic ATK', 'Kaleidoscopic 1-5', '41.7% → 39.1% → 57% → 75.4% → 126.7%'],
    ['Forte', 'Visual Impact', '612%'],
    ['Forte', 'Iridescent Splash', '153%'],
    ['Skill', 'Palettes', '70.1% + 23.4%×3'],
    ['Skill', 'Additive Color', '58.5%×2'],
    ['Liberation', 'Prismatic Overblast', '44%×10'],
    ['Intro', 'Time to Show Some Colors!', '11.3%×10'],
    ['Outro', 'Artistic Finale', '+15% All DMG + 25% Liberation DMG Amp'],
  ],
  'Mornye': [
    ['Basic ATK', 'Stage 1-4', '28% → 60% → 52% → 68%'],
    ['Skill', 'Optimal Solution', '90.4%'],
    ['Skill', 'Distributed Array', '20%×4'],
    ['Forte', 'Geopotential Shift', '22.2% + 49.8%'],
    ['Forte', 'Inversion', '130%'],
    ['Liberation', 'Critical Protocol', '262.8% DEF'],
    ['Intro', 'Convergence', '102%'],
    ['Outro', 'Data Resonance', '+25% All DMG Amp (30s)'],
  ],
  'Phoebe': [
    ['Basic ATK', 'Stage 1-3', '14.9% → 24% → 7.2%×8'],
    ['Heavy ATK', 'Standard', '20.8%×4'],
    ['Skill', 'To Where Light Shines', '31.5%×2'],
    ['Skill', "Chamuel's Star 1-3", '29.9% → 40% → 14.6%×6'],
    ['Forte', 'Starflash', '41.6%×3'],
    ['Forte', 'Absolution Litany', '321%'],
    ['Liberation', 'Dawn of Enlightenment', '202% (+255% in Absolution)'],
    ['Intro', 'Golden Grace', '100%'],
    ['Outro', 'Attentive Heart', '528.4%'],
  ],
  'Phrolova': [
    ['Basic ATK', 'Stage 1-3', '53.8% → 48% → 98.6%'],
    ['Heavy ATK', 'Scarlet Coda', '16.6%×2 + 6.2%×8 + 249% (+41.5% per stack)'],
    ['Skill', 'Whispers in Fleeting Dream', '53.3%×2'],
    ['Liberation', 'Maestro State: Hecate', 'Strings 175% / Winds 166.3% / Cadenza 175%'],
    ['Liberation', 'Curtain Call', '234%'],
    ['Intro', 'Suite of Immortality', '300%'],
    ['Outro', 'Final Applause', '+20% Havoc DMG + 25% Heavy ATK DMG Amp (14s)'],
  ],
  'Qiuyuan': [
    ['Basic ATK', 'Stage 1-3', '21% → 35% → 82.6%'],
    ['Heavy ATK', 'Standard', '83.3%'],
    ['Skill', 'Through the Groves', '36.1%×3'],
    ['Skill', 'Undaunted Wayfarer', '16.3% + 16.3%×3 + 43.4%'],
    ['Forte', 'Inkwash 1-4', '60% → 93.3% → 73.6% → 86.7%'],
    ['Forte', 'To Teach / To Save / To Sacrifice', '230% / 105.5% / 109.5%'],
    ['Liberation', 'Sundering Strike', '400%'],
    ['Intro', 'Attack the Must-Defend', '4.8%×5 + 24% + 72%'],
    ['Outro', 'Ink Blessing', '+50% Echo Skill DMG Amp (14s)'],
  ],
  'Roccia': [
    ['Basic ATK', 'Stage 1-4', '36.8% → 57.6% → 85% → 104.8%'],
    ['Heavy ATK', 'Standard', '85%'],
    ['Skill', 'Acrobatic Trick', '30.9%×8'],
    ['Forte', 'Real Fantasy 1-3', '162% → 171% → 180%'],
    ['Liberation', 'Commedia Improvviso!', '140%×3'],
    ['Intro', 'Pero, Help!', '85%'],
    ['Outro', 'Applause, Please!', '+20% Havoc DMG + 25% Basic ATK DMG Amp (14s)'],
  ],
  'Rover': [
    ['Basic ATK', 'Stage 1-4', '19.7% → 25.1% → 30% → 43.2%'],
    ['Heavy ATK', 'Standard', '44.8%'],
    ['Skill', 'Resonating Spin', '43.6%×2'],
    ['Liberation', 'Echoing Orchestration', '146.1%'],
    ['Intro', 'Wavesplitter', '50%×2'],
    ['Outro', 'Continuum', '+20% Spectro DMG Amp (14s)'],
  ],
  'Shorekeeper': [
    ['Basic ATK', 'Stage 1-4', '16% → 24% → 35.2% → 36.6%'],
    ['Skill', 'Chaos Theory', '15.8% + healing'],
    ['Forte', 'Illation', '9.5%×5'],
    ['Forte', 'Flare Star Butterfly', '18.8%'],
    ['Liberation', 'End Loop', 'Stellarealm: +12.5% CR, +25% CD'],
    ['Intro', 'Proof of Existence', '22.8%×5'],
    ['Outro', 'Binary Butterfly', '+15% All DMG Amp (30s)'],
  ],
  'Sigrika': [
    ['Basic ATK', 'Stage 1-4', '26.6% → 50.6% → 56% → 104%'],
    ['Basic ATK', 'Elucidated', '30.9%×3 + 61.9%'],
    ['Skill', 'BOOMY BOOM!', '14.4%×3 + 28.8%'],
    ['Skill', 'BIG BOOMY BOOM!', '14.5%×4 + 86.9%'],
    ['Forte', 'Runic Outburst', '59.2% + 103.6% + 133.2%'],
    ['Forte', 'Learn My True Name', '152.4% + 457%'],
    ['Liberation', 'Where Trust Leads Me!', '433.3%'],
    ['Intro', 'Solsworn Etymology', '82.2%'],
    ['Outro', 'In This Very Moment', '795%'],
  ],
  'Verina': [
    ['Basic ATK', 'Stage 1-5', '19% → 25.7% → 25.7% → 33.9% → 36%'],
    ['Heavy ATK', 'Standard', '50%'],
    ['Skill', 'Botany Experiment', '18%×3 + 36%'],
    ['Forte', 'Starflower Blooms', '32.7% + 49%'],
    ['Liberation', 'Arboreal Flourish', '100% + Coordinated 5%/hit'],
    ['Intro', 'Spread', '50%'],
    ['Outro', 'Blossom', '+15% All DMG Deepen (30s) + heal'],
  ],
  'Xiangli Yao': [
    ['Basic ATK', 'Stage 1-4', '17.2% → 21.8% → 25.1% → 35.8%'],
    ['Heavy ATK', 'Standard', '14.6%×4'],
    ['Skill', 'Deduction', '42%×2'],
    ['Skill', 'Pivot Impale', '93.6%'],
    ['Liberation', 'Cogitation Model', '50% + Enhanced BA chain'],
    ['Liberation', 'Enhanced BA 1-4', '24%×3 → 16%×6 → 21.4%×6 → 37.4%+25%×6+93.6%'],
    ['Intro', 'Probing Strike', '50%×2'],
    ['Outro', 'Chain of Insights', 'Electro coordinated ATK'],
  ],
  'Yinlin': [
    ['Basic ATK', "Zapstring's Dance 1-4", '14.5% → 34% → 49.3% → 37.8%'],
    ['Skill', 'Magnetic Roar', '30%×3'],
    ['Skill', 'Lightning Execution', '45%×4'],
    ['Forte', 'Chameleon Cipher', '90%×2'],
    ['Forte', 'Judgement Strike', '39.6% per hit (1/s)'],
    ['Liberation', 'Thundering Wrath', '58.6%×7'],
    ['Intro', 'Raging Storm', '7.2%×10'],
    ['Outro', 'Strategist', '+20% Electro DMG + 25% Liberation DMG Amp (14s)'],
  ],
  'Zani': [
    ['Basic ATK', 'Stage 1-4', '29.6% → 40% → 64% → 136%'],
    ['Heavy ATK', 'Standard', '20.7%×4'],
    ['Skill', 'Pinpoint Strike', '30.7% + 61.4%'],
    ['Skill', 'Targeted Action', '43.4% + 14.5% + 86.7%'],
    ['Forte', 'Heavy Slash Daybreak', '100%'],
    ['Forte', 'Heavy Slash Dawning', '213.3%'],
    ['Forte', 'Heavy Slash Nightfall', '68% + 132% (+5% per Blaze)'],
    ['Liberation', 'Rekindle', '160.2%'],
    ['Liberation', 'The Last Stand', '96.1% + 544.7%'],
    ['Intro', 'Immediate Execution', '12.2%×5 + 40.6%'],
    ['Outro', 'Beacon For the Future', '150% (+10% per Ember stack)'],
  ],
  'Zhezhi': [
    ['Basic ATK', 'Dimming Brush 1-3', '42% → 51.7% → 67.2%'],
    ['Heavy ATK', 'Standard', '56.7%'],
    ['Skill', 'Manifestation', '49.5%×3'],
    ['Forte', 'Conjuration', '41.8%×3'],
    ['Forte', 'Stroke of Genius', '150%'],
    ['Forte', "Creation's Zenith", '60%×3'],
    ['Liberation', 'Living Canvas', '32.8% coordinated (21 hits, 30s)'],
    ['Intro', 'Radiant Ruin', '43.3%×3'],
    ['Outro', 'Carve and Draw', '+20% Glacio DMG + 25% Skill DMG Amp (14s)'],
  ],
  // ── 4★ Characters ──
  'Aalto': [
    ['Basic ATK', 'Stage 1-4', '16% → 28.2% → 14.6%×3 → 30.7%'],
    ['Skill', 'Shift Trick', '28%×3'],
    ['Liberation', 'Flower in the Mist', '24%×6'],
    ['Intro', 'Feint Shot', '37%×2'],
    ['Outro', 'Dissolving Mist', '+23% Aero DMG (14s)'],
  ],
  'Baizhi': [
    ['Basic ATK', 'Stage 1-4', '32.2% → 28% → 22.8%×2 → 37.8%'],
    ['Skill', 'Emergency Plan', '10.2%×4 + healing'],
    ['Liberation', 'Momentary Presence', '12% field heal + burst'],
    ['Intro', 'Overflowing Frost', '50%×2'],
    ['Outro', 'Rejuvenation', 'Heal 1.5%HP/s for 6s'],
  ],
  'Buling': [
    ['Basic ATK', 'Stage 1-3', '20% → 26% → 30%'],
    ['Skill', 'Electro Spark', '28.5%×4'],
    ['Liberation', 'Lightning Storm', '18%×8'],
    ['Intro', 'Static Entry', '50%×2'],
    ['Outro', 'Discharge', '+12% Electro DMG + Electro Flare stacks'],
  ],
  'Chixia': [
    ['Basic ATK', 'Stage 1-4', '14.7% → 16.8% → 27.3% → 9.4%×4'],
    ['Skill', 'Boom Boom', '20%×8'],
    ['Liberation', 'Blazing Flames', '200%'],
    ['Intro', 'Grand Entrance', '40%×2'],
    ['Outro', 'Burnout', '+12% Fusion DMG (14s)'],
  ],
  'Danjin': [
    ['Basic ATK', 'Stage 1-3', '26.3%×2 → 45.5% → 32.6%×3'],
    ['Skill', 'Crimson Fragment', '19.5%×2'],
    ['Skill', 'Crimson Erosion', '28.6%×3'],
    ['Forte', 'Scarlet Burst', '30.2%×5'],
    ['Liberation', 'Crimson Moonrise', '36%×4'],
    ['Intro', 'Crimson Arrival', '50%×2'],
    ['Outro', 'Duality', '+23% Havoc DMG Deepen (14s)'],
  ],
  'Lumi': [
    ['Basic ATK', 'Stage 1-3', '27.3% → 23%×2 → 57.6%'],
    ['Skill', 'Luminal Strike', '41%×2'],
    ['Liberation', 'Daybreak Signal', '180%'],
    ['Intro', 'Light Surge', '50%×2'],
    ['Outro', 'Radiant Blessing', '+12% Glacio DMG (14s)'],
  ],
  'Mortefi': [
    ['Basic ATK', 'Stage 1-4', '20.8% → 17.3%×3 → 15.1%×4 → 38.6%'],
    ['Skill', 'Passionate Variation', '23.9%×4'],
    ['Liberation', 'Violent Crescendo', '50% + coordinated Fusion ATK'],
    ['Intro', 'Fury Overture', '50%'],
    ['Outro', 'Flame Reprise', '+38% Heavy ATK DMG Amp (14s)'],
  ],
  'Sanhua': [
    ['Basic ATK', 'Stage 1-5', '23.7% → 26.2% → 36.3% → 29.2%×2 → 22.2%×3'],
    ['Skill', 'Eternal Frost', '52.8%×2'],
    ['Forte', 'Detonate', '86.4%×3'],
    ['Liberation', 'Glacial Gaze', '32.8%×4'],
    ['Intro', 'Freezing Thorns', '50%×2'],
    ['Outro', 'Silversnow', '+38% Basic ATK DMG Amp (14s)'],
  ],
  'Taoqi': [
    ['Basic ATK', 'Stage 1-4', '35.3% → 33.1% → 42.3% → 40.1%+53.5%'],
    ['Skill', 'Fortified Defense', '25.5%×6 shield'],
    ['Liberation', 'Iron Will', '135%×3'],
    ['Intro', 'Defense Line', '100%'],
    ['Outro', 'Iron Curtain', '+15% DEF Shred (10s)'],
  ],
  'Yangyang': [
    ['Basic ATK', 'Stage 1-4', '18.2% → 25.2%×2 → 36.3% → 22.7%×3'],
    ['Skill', 'Zephyr Domain', '40%×2'],
    ['Liberation', 'Wind Spirals', '60%×3'],
    ['Intro', 'Cerulean Song', '50%×2'],
    ['Outro', 'Whispering Breeze', 'Recover 4 Resonance Energy/s (5s)'],
  ],
  'Youhu': [
    ['Basic ATK', 'Stage 1-4', '18.9% → 22.5% → 12.9%×4 → 32.5%'],
    ['Skill', 'Cleansing Blaze', '11%×3 + 29%'],
    ['Liberation', 'Spirit Congregation', '300% healing field'],
    ['Intro', 'Lucky Draw', '50%×2'],
    ['Outro', 'PoeticErta', '+23% Glacio DMG Amp (14s)'],
  ],
  'Yuanwu': [
    ['Basic ATK', 'Stage 1-5', '25.3% → 14.3%×3 → 31.8% → 19.3%×3 → 23.2%×2+30.8%'],
    ['Skill', 'Thunder Wedge', '46%×2 coordinated'],
    ['Liberation', 'Blazing Might', '98%×2 shield'],
    ['Intro', 'Thunder Assault', '50%×2'],
    ['Outro', 'Lightning Boost', '+15% Liberation DMG Amp (14s)'],
  ],
};

// [SECTION:RESONANCE_CHAINS] — Per-character S1-S6 buffs (cumulative % damage increase)
// Format: { s1-s6: { stat: value } } — each level adds ON TOP of previous
// Values from Prydwen, WutheringLab, community testing
const RESONANCE_CHAIN_DATA = {
  // Camellya S1: +28% CD after Intro (confirmed). S6: Sweet Dream +150% mult + Perennial mechanic ≈ totalMult 50
  'Camellya':     { s1: { critDmg: 28 }, s2: { skillDmg: 40 }, s3: { atkPct: 58, libDmg: 15 }, s4: { basicDmg: 25 }, s5: { totalMult: 40 }, s6: { totalMult: 50 } },
  // Carlotta S1: +12.5% CR on Deconstructed targets. S6: Death Knell mult +186.6% ≈ totalMult +50 (front-loaded burst)
  'Carlotta':     { s1: { critRate: 12.5 }, s2: { skillDmg: 25 }, s3: { elemDmg: 15 }, s4: { deepen: 12 }, s5: { totalMult: 15 }, s6: { totalMult: 50 } },
  'Jiyan':        { s1: { atkPct: 10 }, s2: { heavyDmg: 40 }, s3: { critRate: 15, critDmg: 40 }, s4: { heavyDmg: 15 }, s5: { atkPct: 25 }, s6: { libDmg: 40 } },
  // Jinhsi S1: Herald of Revival stacks → up to +80% Illuminous Epiphany DMG ≈ skillDmg 40 avg. S6: +45% Illuminous mult ≈ totalMult 30
  'Jinhsi':       { s1: { skillDmg: 40 }, s2: { skillDmg: 40 }, s3: { critDmg: 25 }, s4: { elemDmg: 15 }, s5: { totalMult: 15 }, s6: { totalMult: 30 } },
  'Calcharo':     { s1: { elemDmg: 12 }, s2: { libDmg: 40 }, s3: { critDmg: 40 }, s4: { atkPct: 15 }, s5: { totalMult: 15 }, s6: { libDmg: 40 } },
  'Encore':       { s1: { basicDmg: 15 }, s2: { atkPct: 40 }, s3: { elemDmg: 15 }, s4: { basicDmg: 15 }, s5: { totalMult: 10 }, s6: { elemDmg: 25 } },
  'Xiangli Yao':  { s1: { elemDmg: 12 }, s2: { skillDmg: 40 }, s3: { critRate: 12 }, s4: { atkPct: 15 }, s5: { totalMult: 15 }, s6: { defIgnore: 15 } },
  'Aemeath':      { s1: { critDmg: 30, heavyDmg: 300 }, s2: { totalMult: 25 }, s3: { defIgnore: 20, critDmg: 60 }, s4: { totalMult: 15 }, s5: { totalMult: 40 }, s6: { totalMult: 40 } },
  // Zani S1: +50% Spectro DMG for 14s. S6: +40% Heavy Slash mult + Blaze scaling
  'Zani':         { s1: { elemDmg: 50 }, s2: { critDmg: 30, heavyDmg: 25 }, s3: { totalMult: 15 }, s4: { deepen: 15 }, s5: { totalMult: 40 }, s6: { totalMult: 40, heavyDmg: 40 } },
  'Phoebe':       { s1: { elemDmg: 15 }, s2: { skillDmg: 25 }, s3: { heavyDmg: 40 }, s4: { atkPct: 15 }, s5: { totalMult: 15 }, s6: { critDmg: 25 } },
  'Phrolova':     { s1: { critRate: 15 }, s2: { critRate: 30, totalMult: 40 }, s3: { totalMult: 15 }, s4: { echoDmg: 40 }, s5: { totalMult: 15 }, s6: { deepen: 25 } },
  'Brant':        { s1: { atkPct: 15, elemDmg: 12 }, s2: { critRate: 30, totalMult: 25 }, s3: { totalMult: 15 }, s4: { elemDmg: 15 }, s5: { totalMult: 15 }, s6: { deepen: 40 } },
  // Augusta S1: +15% CD per Crown stack (max 2) ≈ critDmg 30. S6: Triumphant Slash mult boost ≈ totalMult 25
  'Augusta':      { s1: { critDmg: 30 }, s2: { critRate: 20, critDmg: 40 }, s3: { totalMult: 15 }, s4: { heavyDmg: 40 }, s5: { totalMult: 15 }, s6: { totalMult: 25 } },
  'Cartethyia':   { s1: { defIgnore: 8, deepen: 40 }, s2: { basicDmg: 50, totalMult: 25 }, s3: { totalMult: 15 }, s4: { atkPct: 40 }, s5: { totalMult: 15 }, s6: { totalMult: 25 } },
  'Lingyang':     { s1: { atkPct: 12 }, s2: { basicDmg: 40 }, s3: { critDmg: 40 }, s4: { atkPct: 15 }, s5: { totalMult: 15 }, s6: { elemDmg: 25 } },
  'Galbrena':     { s1: { echoDmg: 15 }, s2: { totalMult: 40 }, s3: { critRate: 12 }, s4: { heavyDmg: 40 }, s5: { totalMult: 15 }, s6: { deepen: 40 } },
  'Iuno':         { s1: { heavyDmg: 40 }, s2: { atkPct: 15 }, s3: { libDmg: 25 }, s4: { heavyDmg: 40 }, s5: { totalMult: 15 }, s6: { deepen: 25 } },
  'Sigrika':      { s1: { echoDmg: 15 }, s2: { totalMult: 40 }, s3: { critRate: 12 }, s4: { echoDmg: 40 }, s5: { totalMult: 15 }, s6: { defIgnore: 15 } },
  'Luuk Herssen': { s1: { atkPct: 15 }, s2: { totalMult: 40 }, s3: { critDmg: 25 }, s4: { basicDmg: 40 }, s5: { totalMult: 15 }, s6: { defIgnore: 15 } },
  'Lupa':         { s1: { elemDmg: 12 }, s2: { totalMult: 40 }, s3: { atkPct: 15 }, s4: { deepen: 12 }, s5: { totalMult: 15 }, s6: { elemDmg: 40 } },
  // Supports — less personal DMG but team contribution changes
  'Verina':       { s1: { atkPct: 5 }, s2: { deepen: 5 }, s3: { atkPct: 5 }, s4: { deepen: 5 }, s5: { atkPct: 5 }, s6: { deepen: 10 } },
  'Shorekeeper':  { s1: { critRate: 5 }, s2: { critDmg: 10 }, s3: { atkPct: 5 }, s4: { critRate: 5 }, s5: { deepen: 5 }, s6: { critDmg: 15 } },
  'Lynae':        { s1: { totalMult: 10 }, s2: { allDmg: 25 }, s3: { totalMult: 15 }, s4: { totalMult: 10 }, s5: { totalMult: 15 }, s6: { totalMult: 40 } },
  'Mornye':       { s1: { allDmg: 15 }, s2: { deepen: 10 }, s3: { totalMult: 10 }, s4: { atkPct: 10 }, s5: { totalMult: 10 }, s6: { deepen: 15 } },
  'Roccia':       { s1: { basicDmg: 10 }, s2: { atkPct: 15 }, s3: { basicDmg: 10 }, s4: { totalMult: 10 }, s5: { atkPct: 10 }, s6: { basicDmg: 15 } },
  'Sanhua':       { s1: { atkPct: 10 }, s2: { basicDmg: 10 }, s3: { totalMult: 10 }, s4: { atkPct: 10 }, s5: { basicDmg: 10 }, s6: { deepen: 15 } },
  'Mortefi':      { s1: { heavyDmg: 10 }, s2: { totalMult: 10 }, s3: { heavyDmg: 10 }, s4: { coordDmg: 15 }, s5: { totalMult: 10 }, s6: { heavyDmg: 40 } },
  'Danjin':       { s1: { elemDmg: 8 }, s2: { atkPct: 10 }, s3: { elemDmg: 8 }, s4: { atkPct: 10 }, s5: { totalMult: 10 }, s6: { atkPct: 15, elemDmg: 10 } },
  'Chisa':        { s1: { defShred: 6 }, s2: { deepen: 10 }, s3: { totalMult: 10 }, s4: { defShred: 6 }, s5: { totalMult: 10 }, s6: { deepen: 15 } },
  'Ciaccona':     { s1: { elemDmg: 10 }, s2: { totalMult: 15 }, s3: { elemDmg: 10 }, s4: { deepen: 10 }, s5: { totalMult: 10 }, s6: { elemDmg: 15 } },
  'Cantarella':   { s1: { deepen: 8 }, s2: { totalMult: 10 }, s3: { deepen: 8 }, s4: { coordDmg: 10 }, s5: { totalMult: 10 }, s6: { deepen: 15 } },
  'Yinlin':       { s1: { elemDmg: 10 }, s2: { resShred: 10 }, s3: { totalMult: 10 }, s4: { elemDmg: 10 }, s5: { totalMult: 10 }, s6: { resShred: 15 } },
  'Changli':      { s1: { elemDmg: 10 }, s2: { skillDmg: 15 }, s3: { elemDmg: 10 }, s4: { atkPct: 15 }, s5: { totalMult: 10 }, s6: { deepen: 40 } },
  'Zhezhi':       { s1: { coordDmg: 10 }, s2: { totalMult: 15 }, s3: { coordDmg: 10 }, s4: { elemDmg: 10 }, s5: { totalMult: 10 }, s6: { coordDmg: 40 } },
  'Qiuyuan':      { s1: { echoDmg: 10 }, s2: { totalMult: 15 }, s3: { echoDmg: 10 }, s4: { atkPct: 10 }, s5: { totalMult: 10 }, s6: { echoDmg: 40 } },
  // 4★ + missing characters
  'Jianxin':      { s1: { atkPct: 8 }, s2: { deepen: 8 }, s3: { defShred: 5 }, s4: { atkPct: 8 }, s5: { totalMult: 10 }, s6: { deepen: 12 } },
  'Rover':        { s1: { elemDmg: 8 }, s2: { skillDmg: 12 }, s3: { critRate: 8 }, s4: { elemDmg: 10 }, s5: { totalMult: 10 }, s6: { resShred: 10, deepen: 15 } },
  'Aalto':        { s1: { elemDmg: 8 }, s2: { totalMult: 10 }, s3: { elemDmg: 8 }, s4: { atkPct: 10 }, s5: { totalMult: 10 }, s6: { elemDmg: 12 } },
  'Baizhi':       { s1: { atkPct: 5 }, s2: { deepen: 5 }, s3: { atkPct: 5 }, s4: { deepen: 5 }, s5: { atkPct: 5 }, s6: { deepen: 10 } },
  'Buling':       { s1: { atkPct: 5 }, s2: { deepen: 5 }, s3: { atkPct: 5 }, s4: { deepen: 5 }, s5: { totalMult: 8 }, s6: { deepen: 10 } },
  'Chixia':       { s1: { atkPct: 8 }, s2: { skillDmg: 10 }, s3: { atkPct: 8 }, s4: { skillDmg: 10 }, s5: { totalMult: 10 }, s6: { elemDmg: 12 } },
  'Lumi':         { s1: { skillDmg: 10 }, s2: { totalMult: 10 }, s3: { skillDmg: 10 }, s4: { atkPct: 10 }, s5: { totalMult: 10 }, s6: { skillDmg: 15 } },
  'Taoqi':        { s1: { defShred: 5 }, s2: { deepen: 5 }, s3: { defShred: 5 }, s4: { deepen: 5 }, s5: { totalMult: 8 }, s6: { defShred: 8 } },
  'Yangyang':     { s1: { atkPct: 5 }, s2: { totalMult: 8 }, s3: { atkPct: 5 }, s4: { totalMult: 8 }, s5: { atkPct: 8 }, s6: { elemDmg: 10 } },
  'Youhu':        { s1: { atkPct: 5 }, s2: { deepen: 5 }, s3: { atkPct: 5 }, s4: { deepen: 5 }, s5: { atkPct: 5 }, s6: { deepen: 10 } },
  'Yuanwu':       { s1: { atkPct: 5 }, s2: { deepen: 5 }, s3: { atkPct: 5 }, s4: { deepen: 5 }, s5: { totalMult: 8 }, s6: { deepen: 10 } },
};


// [SECTION:ECHO_DATA] — See src/data/echoes.js
// [SECTION:WEAPON_DATA] — See src/data/weapons.js

// [SECTION:EVENTS]
// All times from wuwatracker.com (Europe reference — CET UTC+1 or CEST UTC+2, converted to UTC)
// P9-FIX: UTC conversions must use the correct DST offset at the EVENT date, not a fixed UTC+1
// Events that end at 03:59 are server-local (follow daily reset)
// Events that end at other times are global (same UTC moment)
const EVENTS = {
  dailyReset: {
    name: 'Daily Reset',
    subtitle: 'Daily Activities & Tacet Fields',
    description: 'Daily activity reset',
    resetType: 'Daily 4:00 AM',
    color: 'yellow',
    dailyReset: true,
    rewards: 'Waveplates',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30',
    accentColor: 'yellow'
  },
  weeklyBoss: {
    name: 'Weekly Boss',
    subtitle: 'Echoing Remnants',
    description: 'Weekly boss rewards reset',
    resetType: 'Weekly (Monday)',
    color: 'yellow',
    weeklyReset: true,
    rewards: 'Boss Materials',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30',
    accentColor: 'yellow',
    imageUrl: 'https://i.ibb.co/M5cLkMWf/file-00000000e8b071f480ded273f611ec2e.png'
  },
  illusiveRealm: {
    name: 'Fantasies of the Thousand Gateways',
    subtitle: 'Roguelike Mode',
    description: 'Weekly reward reset',
    resetType: 'Weekly (Monday)',
    color: 'purple',
    weeklyReset: true,
    rewards: '160 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-purple-900/30',
    accentColor: 'purple',
    imageUrl: 'https://i.ibb.co/zcc2MxR/Fantasies-of-the-Thousand-Gateways.jpg'
  },
  pioneerPodcast: {
    name: 'Pioneer Podcast',
    subtitle: 'Event',
    description: 'Limited-time event',
    resetType: 'Version update',
    color: 'yellow',
    // Ends: Wed, 29 Apr 2026 — Europe 04:59 (UTC+1) | America 22:59 (UTC-5) | Asia 11:59 (UTC+8)
    currentEnd: '2026-04-29T03:59:00Z',
    rewards: '400 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30',
    accentColor: 'yellow',
    imageUrl: 'https://i.ibb.co/zHsVrt8z/Sans-titre-115-20260401035034.png'
  },
  tacticalHologram: {
    name: 'Tactical Hologram: Synchronization',
    subtitle: 'Combat Challenge',
    description: 'Weekly boss challenge',
    resetType: 'Version update',
    color: 'cyan',
    // Ends: Wed, 29 Apr 2026 — Europe 04:59 (UTC+1) | America 22:59 (UTC-5) | Asia 11:59 (UTC+8)
    currentEnd: '2026-04-29T03:59:00Z',
    rewards: 'Weekly Rewards',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: 'https://i.ibb.co/CpjDZj8V/652896591-1275960654470518-5091818010205633369-n.jpg'
  },
  endstateMatrix: {
    name: 'Endstate Matrix',
    subtitle: 'Boss Rush',
    description: 'High difficulty boss rush',
    resetType: 'Version update',
    color: 'pink',
    // Ends: Thu, 30 Apr 2026 — Europe 04:59 (UTC+1) | America 22:59 (UTC-5) | Asia 11:59 (UTC+8)
    currentEnd: '2026-04-30T03:59:00Z',
    rewards: '400 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30',
    accentColor: 'pink',
    imageUrl: 'https://i.ibb.co/Jjn2Ncvp/images-2026-04-01-T034054-984.jpg'
  },
  towerOfAdversity: {
    name: 'Tower of Adversity: Hazard Zone',
    subtitle: 'Endgame Challenge',
    description: 'Endgame combat challenge',
    resetType: '28 days',
    color: 'orange',
    // Mon, 02 Feb 2026 04:00 - Mon, 02 Mar 2026 03:59 (Europe)
    currentEnd: '2026-03-02T02:59:00Z',
    rewards: '800 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-orange-900/30',
    accentColor: 'orange',
    imageUrl: 'https://i.ibb.co/QF335JVv/Tower-of-Adversity-Banner-Art.jpg'
  },
  whimperingWastes: {
    name: 'Whimpering Wastes',
    subtitle: 'Respawning Waters',
    description: 'Combat challenge with token system',
    resetType: '28 days',
    color: 'cyan',
    // Mon, 16 Feb 2026 04:00 - Mon, 16 Mar 2026 03:59 (Europe)
    currentEnd: '2026-03-16T02:59:00Z',
    rewards: '800 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: 'https://i.ibb.co/HT4RyJBy/Whimpering-Wastes-BG.png'
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════════

// [SECTION:CONSTANTS]
// WuWa gacha rates: 0.8% base, soft pity starts at 64, hard pity at 80
const HARD_PITY = 80, SOFT_PITY_START = 64; // AVG_PITY (5-star) removed — P8-FIX: was unused dead code
const LUNITE_DAILY_ASTRITE = 90; // P7-FIX: Extract magic number (7E)
const ASTRITE_PER_PULL = 160;
const BEGINNER_ASTRITE_PER_PULL = 128; // P14-FIX: NIT-2 — Extract magic number (beginner banner = 80% of standard cost)

// Subscription and top-up prices (USD) - Updated January 2026
const SUBSCRIPTIONS = {
  lunite: { name: 'Lunite Subscription', price: 4.99, astrite: 2700, daily: 90, duration: 30, desc: '300 Lunite + 90 Astrite/day for 30 days (2700 total Astrite)' },
  weekly: { name: 'Weekly Subscription', price: 9.99, astrite: 1600, lunite: 680, duration: 7, desc: '680 Lunite + 1600 Astrite over 7 days (Day 1 + Day 3 + Day 7)' },
  bpInsider: { name: 'Pioneer Podcast - Insider', price: 9.99, astrite: 680, radiant: 5, lustrous: 2, desc: '680 Astrite + 5 Radiant Tides + 2 Lustrous Tides' },
  bpConnoisseur: { name: 'Pioneer Podcast - Connoisseur', price: 19.99, astrite: 680, radiant: 5, lustrous: 5, desc: '680 Astrite + 5 Radiant Tides + 5 Lustrous Tides' },
  directTop60: { name: 'Direct Top-Up (60)', price: 0.99, astrite: 60, desc: '60 Astrite' },
  directTop300: { name: 'Direct Top-Up (300)', price: 4.99, astrite: 300, desc: '300 Astrite' },
  directTop980: { name: 'Direct Top-Up (980)', price: 14.99, astrite: 980, desc: '980 Astrite' },
  directTop1980: { name: 'Direct Top-Up (1980)', price: 29.99, astrite: 1980, desc: '1980 Astrite' },
  directTop3280: { name: 'Direct Top-Up (3280)', price: 49.99, astrite: 3280, desc: '3280 Astrite' },
  directTop6480: { name: 'Direct Top-Up (6480)', price: 99.99, astrite: 6480, desc: '6480 Astrite' },
};

// P12-FIX: Input safety caps to prevent browser freeze from extreme values (Step 14 audit — HIGH-10e)
// 9,999,999 Astrite ≈ 62,499 pulls — well beyond any realistic scenario
const MAX_ASTRITE = 9999999;
// 2,000 pulls is the max the calculator will compute — prevents MC from iterating billions of times
// (2000 pulls ≈ 320,000 Astrite, enough for ~25 guaranteed 5★ — absurdly generous ceiling)
const MAX_CALC_PULLS = 2000;

// 4-star pity constants
const HARD_PITY_4STAR = 10; // Guaranteed 4★ every 10 pulls
const FEATURED_4STAR_RATE = 0.5; // 50% chance for featured 4-star

// [SECTION:STATIC_DATA] - Static collection data (moved outside component for perf)
const DEFAULT_COLLECTION_IMAGES = {
  // 5★ Resonators (by release order)
  'Jiyan': 'https://i.ibb.co/00C5Sqj/Jiyan-Full-Sprite.webp',
  'Calcharo': 'https://i.ibb.co/tM11rtrL/Calcharo-Full-Sprite.webp',
  'Encore': 'https://i.ibb.co/rGZBZ4HV/Encore-Full-Sprite.webp',
  'Jianxin': 'https://i.ibb.co/ZDxNGkj/Jianxin-Full-Sprite.webp',
  'Lingyang': 'https://i.ibb.co/gbjK568S/Lingyang-Full-Sprite.webp',
  'Verina': 'https://i.ibb.co/mV6qxb5h/Verina-Full-Sprite.webp',
  'Yinlin': 'https://i.ibb.co/S79CF3R3/Yinlin-Full-Sprite.webp',
  'Changli': 'https://i.ibb.co/mr6BwwP0/Changli-Full-Sprite.webp',
  'Jinhsi': 'https://i.ibb.co/fG9sf6cc/Jinhsi-Full-Sprite.webp',
  'Shorekeeper': 'https://i.ibb.co/svHmQWYB/Shorekeeper-Full-Sprite.webp',
  'Camellya': 'https://i.ibb.co/6Rg494Ld/Camellya-Full-Sprite.webp',
  'Xiangli Yao': 'https://i.ibb.co/27jds05D/Xiangli-Yao-Full-Sprite.webp',
  'Zhezhi': 'https://i.ibb.co/0VpsfXkK/Zhezhi-Full-Sprite.webp',
  'Carlotta': 'https://i.ibb.co/bRBx4Ymx/Carlotta-Full-Sprite.webp',
  'Roccia': 'https://i.ibb.co/b548Jj2Y/Roccia-Full-Sprite.webp',
  'Phoebe': 'https://i.ibb.co/6SdsQ7M/Phoebe-Full-Sprite.webp',
  'Brant': 'https://i.ibb.co/CDg2QgM/Brant-Full-Sprite.webp',
  'Cantarella': 'https://i.ibb.co/jZs3MWvV/Cantarella-Full-Sprite.webp',
  'Zani': 'https://i.ibb.co/5XLvmGfC/Zani-Full-Sprite-1.webp',
  'Ciaccona': 'https://i.ibb.co/N6dKs9zy/Ciaccona-Full-Sprite.webp',
  'Cartethyia': 'https://i.ibb.co/QFR5LVdc/Cartethyia-Full-Sprite.webp',
  'Lupa': 'https://i.ibb.co/8n4kck2M/Lupa-Full-Sprite.webp',
  'Augusta': 'https://i.ibb.co/V0TXt2Ty/Augusta-Full-Sprite.webp',
  'Galbrena': 'https://i.ibb.co/rK0yjSr6/Galbrena-Full-Sprite.webp',
  'Iuno': 'https://i.ibb.co/5WmnWgtG/Iuno-Full-Sprite.webp',
  'Luuk Herssen': 'https://i.ibb.co/23dF1tWT/Luuk-Herssen-Full-Sprite.webp',
  'Aemeath': 'https://i.ibb.co/0pBQpMwv/Aemeath-Full-Sprite.webp',
  'Mornye': 'https://i.ibb.co/QvyQ33zv/Mornye-Full-Sprite.webp',
  'Rover': 'https://i.ibb.co/V0zwhc58/Rover-1.webp',
  'Chisa': 'https://i.ibb.co/x8zB67Vh/Chisa-Full-Sprite.webp',
  'Phrolova': 'https://i.ibb.co/Nd0HbF4v/Phrolova-Full-Sprite.webp',
  'Qiuyuan': 'https://i.ibb.co/JRvP5fnx/Qiuyuan-Full-Sprite.webp',
  'Lynae': 'https://i.ibb.co/Mym9KBBM/Lynae-Full-Sprite.webp',
  'Sigrika': 'https://i.ibb.co/TBhhKSk6/Sigrika-Full-Sprite.webp',
  // 4★ Resonators
  'Aalto': 'https://i.ibb.co/v81v3Hq/Aalto-Full-Sprite.webp',
  'Baizhi': 'https://i.ibb.co/4Ztm8DCG/Baizhi-Full-Sprite.webp',
  'Chixia': 'https://i.ibb.co/r2SVVmPv/Chixia-Full-Sprite.webp',
  'Danjin': 'https://i.ibb.co/CK3XQCpM/Danjin-Full-Sprite.webp',
  'Yangyang': 'https://i.ibb.co/kV1hBqbv/Yangyang-Full-Sprite.webp',
  'Sanhua': 'https://i.ibb.co/yc0XTQVB/Sanhua-Full-Sprite.webp',
  'Taoqi': 'https://i.ibb.co/qM2r22RR/Taoqi-Full-Sprite.webp',
  'Yuanwu': 'https://i.ibb.co/p6ZQJkcC/Yuanwu-Full-Sprite.webp',
  'Mortefi': 'https://i.ibb.co/xq8hFgpc/Mortefi-Full-Sprite.webp',
  'Youhu': 'https://i.ibb.co/Zzc0PMWX/Youhu-Full-Sprite.webp',
  'Lumi': 'https://i.ibb.co/rRy25xmt/Lumi-Full-Sprite.webp',
  'Buling': 'https://i.ibb.co/fGZBRCWp/Buling-Full-Sprite.webp',
  // 5★ Weapons
  'Verdant Summit': 'https://i.ibb.co/5gjYYrHj/Verdant-Summit.webp',
  'Emerald of Genesis': 'https://i.ibb.co/HTj8Lp7N/Weapon-Emerald-of-Genesis.webp',
  'Static Mist': 'https://i.ibb.co/cKVzgTJ4/Weapon-Static-Mist.webp',
  'Abyss Surges': 'https://i.ibb.co/FLVx6xwt/Abyss-Surges.webp',
  'Lustrous Razor': 'https://i.ibb.co/mCmkydWk/Weapon-Lustrous-Razor.webp',
  'Cosmic Ripples': 'https://i.ibb.co/XfGk2sVG/Cosmic-Ripples.webp',
  'Stringmaster': 'https://i.ibb.co/wNGPxnmH/Stringmaster.webp',
  'Ages of Harvest': 'https://i.ibb.co/5gGBmzX8/Ages-of-Harvest.webp',
  'Blazing Brilliance': 'https://i.ibb.co/gLJbgvwg/Blazing-Brilliance.webp',
  'Rime-Draped Sprouts': 'https://i.ibb.co/NgNshLYy/Rime-Draped-Sprouts.png',
  "Verity's Handle": 'https://i.ibb.co/k2hFQfx8/Veritys-Handle.webp',
  'Stellar Symphony': 'https://i.ibb.co/yBB4Kzxs/Stellar-Symphony.webp',
  'Red Spring': 'https://i.ibb.co/Cp3d2vg2/Red-Spring.webp',
  'The Last Dance': 'https://i.ibb.co/zhtJWLk0/The-Last-Dance.png',
  'Tragicomedy': 'https://i.ibb.co/4RRD3mLv/Tragicomedy.png',
  'Luminous Hymn': 'https://i.ibb.co/prdDZjKg/Luminous-Hymn.png',
  'Unflickering Valor': 'https://i.ibb.co/PGbr24Xp/Unflickering-Valor.png',
  'Whispers of Sirens': 'https://i.ibb.co/YT73fDrB/Whispers-of-Sirens.webp',
  'Blazing Justice': 'https://i.ibb.co/pjbhYHP4/Blazing-Justice.webp',
  'Woodland Aria': 'https://i.ibb.co/8nXkG8d5/Woodland-Aria.png',
  "Defier's Thorn": 'https://i.ibb.co/KpG4cbZJ/Defier-s-Thorn.webp',
  'Wildfire Mark': 'https://i.ibb.co/RGqLJKGK/Wildfire-Mark.webp',
  'Lethean Elegy': 'https://i.ibb.co/YF3fJtF7/Lethean-Elegy.webp',
  'Thunderflare Dominion': 'https://i.ibb.co/d062x9ZH/Thunderflare-Dominion.webp',
  "Moongazer's Sigil": 'https://i.ibb.co/zhF435g4/Moongazers-Sigil.webp',
  'Lux & Umbra': 'https://i.ibb.co/FqVkK4Tn/Lux-Umbra.webp',
  'Emerald Sentence': 'https://i.ibb.co/rKmyDNs5/Emerald-Sentence.webp',
  'Kumokiri': 'https://i.ibb.co/VWxG9pSF/Kumokiri.webp',
  'Spectrum Blaster': 'https://i.ibb.co/qLC341Sv/Spectrum-Blaster.webp',
  'Starfield Calibrator': 'https://i.ibb.co/tTDkFQ7W/Starfield-Calibrator.webp',
  // v3.1+ weapons
  'Everbright Polestar': 'https://i.ibb.co/4g4RbTv7/Weapon-Everbright-Polestar.webp',
  "Daybreaker's Spine": 'https://i.ibb.co/tpn30Lrm/6982b58a79a3b099e1bd0d48i-CAFZ7lo03.webp',
  'Solsworn Ciphers': 'https://i.ibb.co/8n2cT6yR/Solsworn-Ciphers.webp',
  // 4★ Weapons
  'Overture': 'https://i.ibb.co/nMXdhNTW/Overture.png',
  "Ocean's Gift": 'https://i.ibb.co/rfk6Fgwx/Oceans-Gift.png',
  "Bloodpact's Pledge": 'https://i.ibb.co/V0WH0NSV/Bloodpacts-Pledge-1.webp',
  'Waltz in Masquerade': 'https://i.ibb.co/5XXfstH6/Waltz-in-Masquerade.webp',
  'Legend of Drunken Hero': 'https://i.ibb.co/v65yf4Bd/Legend-of-Drunken-Hero.webp',
  'Romance in Farewell': 'https://i.ibb.co/BKc9hdKC/Romance-in-Farewell.webp',
  'Fables of Wisdom': 'https://i.ibb.co/whCyQys6/Fables-of-Wisdom.webp',
  'Meditations on Mercy': 'https://i.ibb.co/pBBrZM0b/Meditations-on-Mercy.webp',
  'Call of the Abyss': 'https://i.ibb.co/Z92nYnW/Call-of-the-Abyss.webp',
  'Somnoire Anchor': 'https://i.ibb.co/N2cJ3qc7/Somnoire-Anchor.webp',
  'Fusion Accretion': 'https://i.ibb.co/xSMHxtL0/Fusion-Accretion.webp',
  'Celestial Spiral': 'https://i.ibb.co/ZRT3sr7g/Celestial-Spiral.webp',
  'Relativistic Jet': 'https://i.ibb.co/nM5rjSNw/Relativistic-Jet.webp',
  'Endless Collapse': 'https://i.ibb.co/gZtL25jN/Endless-Collapse.webp',
  'Waning Redshift': 'https://i.ibb.co/27NQSk1n/Waning-Redshif.webp',
  'Beguiling Melody': 'https://i.ibb.co/wZXxz8MC/Beguiling-Melody.webp',
  'Boson Astrolabe': 'https://i.ibb.co/RkcX6zQK/Boson-Astrolabe-1.webp',
  'Pulsation Bracer': 'https://i.ibb.co/k2kVPjmf/Pulsation-Bracer.webp',
  'Phasic Homogenizer': 'https://i.ibb.co/RpKTNDq1/Phasic-Homogenizer.webp',
  'Laser Shearer': 'https://i.ibb.co/hFqKgw50/Laser-Shearer.webp',
  'Radiance Cleaver': 'https://i.ibb.co/WNxbm8DB/Radiance-Cleaver.webp',
  'Aureate Zenith': 'https://i.ibb.co/0j0M2Bwm/Aureate-Zenith.webp',
  'Radiant Dawn': 'https://i.ibb.co/RkGdFttY/Radiant-Dawn.webp',
  'Aether Strike': 'https://i.ibb.co/5XJNVHgT/Aether-Strike.webp',
  'Solar Flame': 'https://i.ibb.co/YMsf52M/Solar-Flame.webp',
  'Feather Edge': 'https://i.ibb.co/fzG8JpvG/Feather-Edge.webp',
  // Swords
  'Training Sword': 'https://i.ibb.co/23XjFZHD/Training-Sword.webp',
  'Tyro Sword': 'https://i.ibb.co/Qv4nYxF1/Tyro-Sword.webp',
  'Guardian Sword': 'https://i.ibb.co/8LSknxRS/Guardian-Sword.webp',
  'Sword of Voyager': 'https://i.ibb.co/TBCX9fFQ/Sword-of-Voyager.webp',
  'Originite: Type II': 'https://i.ibb.co/j9M4LLSf/Originite-Type-II.webp',
  'Sword of Night': 'https://i.ibb.co/csfb39w/Sword-of-Night.webp',
  'Commando of Conviction': 'https://i.ibb.co/RkTdFgNG/Commando-of-Conviction.webp',

  'Sword#18': 'https://i.ibb.co/wrWDmBcp/Sword18.webp',
  'Lunar Cutter': 'https://i.ibb.co/tpSR66cR/Lunar-Cutter.webp',
  'Lumingloss': 'https://i.ibb.co/dsJQhndm/Lumingloss.webp',
  // Rectifiers
  'Rectifier of Voyager': 'https://i.ibb.co/KjNy5C91/Rectifier-of-Voyager.webp',
  'Rectifier of Night': 'https://i.ibb.co/ksQ3Zswf/Rectifier-of-Night.webp',
  'Variation': 'https://i.ibb.co/5WZP5mKD/Variation.webp',
  'Tyro Rectifier': 'https://i.ibb.co/Df8dXQRf/Tyro-Rectifier.webp',
  'Training Rectifier': 'https://i.ibb.co/Y7rT1gJw/Training-Rectifier.webp',
  'Originite: Type V': 'https://i.ibb.co/9H5GNPVw/Originite-Type-V.webp',
  'Rectifier#25': 'https://i.ibb.co/B9T1f3f/Rectifier25.webp',
  'Jinzhou Keeper': 'https://i.ibb.co/WvvYvwx0/Jinzhou-Keeper.webp',
  'Comet Flare': 'https://i.ibb.co/xKTWZWzs/Comet-Flare.webp',
  'Guardian Rectifier': 'https://i.ibb.co/Wp618BH3/Guardian-Rectifier.webp',
  'Augment': 'https://i.ibb.co/Mk44Y5W4/Augment.webp',
  // Broadblades
  'Guardian Broadblade': 'https://static.wikia.nocookie.net/wutheringwaves/images/8/85/Weapon_Guardian_Broadblade.png',
  'Broadblade of Night': 'https://i.ibb.co/m5kvbBJH/Broadblade-of-Night.webp',
  'Discord': 'https://i.ibb.co/p6L36v9V/Discord.webp',
  // Gauntlets
  'Tyro Gauntlets': 'https://i.ibb.co/NgZL4WFR/Tyro-Gauntlets.webp',
  'Training Gauntlets': 'https://i.ibb.co/b50Nnc2w/Training-Gauntlets.webp',
  'Hollow Mirage': 'https://i.ibb.co/JjP9sjJm/Hollow-Mirage.webp',
  'Stonard': 'https://i.ibb.co/yn59hz0y/Stonard.webp',
  'Gauntlets#21D': 'https://i.ibb.co/XxFKztMj/Gauntlets21-D.webp',
  'Amity Accord': 'https://i.ibb.co/tpxP1SM8/Amity-Accord.webp',
  'Marcato': 'https://i.ibb.co/hFX9MK4t/Marcato.webp',
  'Gauntlets of Night': 'https://i.ibb.co/dFF1GyP/Gauntlets-of-Night.webp',
  'Guardian Gauntlets': 'https://i.ibb.co/k2vd2xW0/Guardian-Gauntlets.webp',
  'Originite: Type III': 'https://i.ibb.co/bg4GXQbS/Originite-Type-III.webp',
  'Gauntlets of Voyager': 'https://i.ibb.co/tVq4bTZ/Gauntlets-of-Voyager.webp',
  // Pistols
  'Pistols#26': 'https://i.ibb.co/FLJ14pcp/Pistols26.webp',
  'Originite: Type IV': 'https://i.ibb.co/wZ2tjtwj/Originite-Type-IV.webp',
  'Pistols of Voyager': 'https://i.ibb.co/pjWf99Qb/Pistols-of-Voyager.webp',
  'Novaburst': 'https://i.ibb.co/NdnmMWcp/Novaburst.webp',
  'Thunderbolt': 'https://i.ibb.co/99rqCmM0/Thunderbolt.webp',
  'Undying Flame': 'https://i.ibb.co/XfM9BJVX/Undying-Flame.webp',
  'Guardian Pistols': 'https://i.ibb.co/m59fPcVF/Guardian-Pistols.webp',
  'Tyro Pistols': 'https://i.ibb.co/Ldtk0QGN/Tyro-Pistols.webp',
  'Training Pistols': 'https://i.ibb.co/PsZhn5d0/Training-Pistols.webp',
  'Pistols of Night': 'https://i.ibb.co/zhf1hxsG/Pistols-of-Night.webp',
  'Cadenza': 'https://i.ibb.co/bRHfTQh1/Cadenza.webp',
  // Missing weapons
  'Originite: Type I': 'https://i.ibb.co/398KxX0f/Weapon-Originite-Type-I.webp',
  'Broadblade of Voyager': 'https://i.ibb.co/bMYZxLtK/Weapon-Broadblade-of-Voyager.webp',
  'Helios Cleaver': 'https://i.ibb.co/Kj719h8m/Weapon-Helios-Cleaver.webp',
  'Dauntless Evernight': 'https://i.ibb.co/PvhJ1Cw2/Dauntless-Evernight.webp',
  'Autumntrace': 'https://wuwa.gg/images/Items/T_IconWeapon21010074_UI.png', // 4.1 fix: temp source — migrate to ibb.co when available
};

// [SECTION:MATERIAL_IMAGES] — Material icon URLs for collection detail modals
const MATERIAL_IMAGES = {
  // === Resonator EXP Materials ===
  'Premium Resonance Potion': 'https://i.ibb.co/SDQV30L4/Item-Premium-Resonance-Potion.webp',
  'Advanced Resonance Potion': 'https://i.ibb.co/wF8LHQJf/Item-Advanced-Resonance-Potion.webp',
  'Medium Resonance Potion': 'https://i.ibb.co/PGyHmDwL/Item-Medium-Resonance-Potion.webp',
  'Basic Resonance Potion': 'https://i.ibb.co/fzp86xSn/Item-Basic-Resonance-Potion.webp',
  // === Weapon EXP Materials ===
  'Premium Energy Core': 'https://i.ibb.co/Q78ZjCnM/Item-Premium-Energy-Core.webp',
  'Advanced Energy Core': 'https://i.ibb.co/kszzpmL6/Item-Advanced-Energy-Core.webp',
  'Medium Energy Core': 'https://i.ibb.co/SCnNSyP/Item-Medium-Energy-Core.webp',
  'Basic Energy Core': 'https://i.ibb.co/997Z6yzN/Item-Basic-Energy-Core.webp',
  // === Ascension Specialty Materials ===
  'Bloodleaf Viburnum': 'https://i.ibb.co/LDbtRXx6/Item-Bloodleaf-Viburnum.webp',
  'Belle Poppy': 'https://i.ibb.co/NgHsDS5m/Item-Belle-Poppy.webp',
  'Coriolus': 'https://i.ibb.co/CpcGDyf1/Item-Coriolus.webp',
  'Firecracker Jewelweed': 'https://i.ibb.co/Xf1KJhB4/Item-Firecracker-Jewelweed.webp',
  'Golden Fleece': 'https://i.ibb.co/9HLsgFqC/Item-Golden-Fleece.webp',
  'Gemini Spore': 'https://i.ibb.co/s9xFvSf5/Item-Gemini-Spore.webp',
  'Iris': 'https://i.ibb.co/W4kqf8qT/Item-Iris.webp',
  "Loong's Pearl": 'https://i.ibb.co/rGdWf2nQ/Item-Loong-s-Pearl.webp',
  'Lanternberry': 'https://i.ibb.co/GQggKLyn/Item-Lanternberry.webp',
  'Luminous Calendula': 'https://i.ibb.co/JFjCvHGt/Item-Luminous-Calendula.webp',
  'Pavo Plum': 'https://i.ibb.co/XQM1xvb/Item-Pavo-Plum.webp',
  'Nova': 'https://i.ibb.co/JW1wBHkc/Item-Nova.webp',
  'Pecok Flower': 'https://i.ibb.co/NgPxmXd7/Item-Pecok-Flower.webp',
  'Seaside Cendrelis': 'https://i.ibb.co/xSvNnzLR/Item-Seaside-Cendrelis.webp',
  'Rimewisp': 'https://i.ibb.co/zHhDjLrv/Item-Rimewisp.webp',
  'Sliverglow Bloom': 'https://i.ibb.co/3YTkb3Wz/Item-Sliverglow-Bloom.webp',
  'Stone Rose': 'https://i.ibb.co/Qv7NBDpC/Item-Stone-Rose.webp',
  'Summer Flower': 'https://i.ibb.co/JRBk9Bpx/Item-Summer-Flower.webp',
  'Sword Acorus': 'https://i.ibb.co/kTjDBX0/Item-Sword-Acorus.webp',
  'Violet Coral': 'https://i.ibb.co/XZJrgXPg/Item-Violet-Coral.webp',
  'Terraspawn Fungus': 'https://i.ibb.co/qLpxtGkG/Item-Terraspawn-Fungus.webp',
  'Bamboo Iris': 'https://i.ibb.co/Y4bDQWMX/Item-Bamboo-Iris.webp',
  'Wintry Bell': 'https://i.ibb.co/FpDwxqW/Item-Wintry-Bell.webp',
  'Arithmetic Shell': 'https://i.ibb.co/7x2b0KH1/Item-Arithmetic-Shell.webp',
  'Afterlife': 'https://i.ibb.co/Kp3YWmGF/Afterlife.webp',
  'Moss Amber': 'https://i.ibb.co/7tNWkRfj/1771262854560.png',
  'Edelschnee': 'https://wuwatracker.com/api/item-icons/file/edelschnee.png',
  // === Skill Upgrade — Weekly Boss Drops ===
  'Monument Bell': 'https://i.ibb.co/S4194zWY/Item-Monument-Bell.webp',
  'Unending Destruction': 'https://i.ibb.co/gFghm5L6/Item-Unending-Destruction.webp',
  'Dreamless Feather': 'https://i.ibb.co/PGrzxBN5/Item-Dreamless-Feather.webp',
  "Sentinel's Dagger": 'https://i.ibb.co/6c0RFrwJ/Item-Sentinel-s-Dagger.webp',
  "The Netherworld's Stare": 'https://i.ibb.co/rRhTq6Cz/Item-The-Netherworld-s-Stare.webp',
  'When Irises Bloom': 'https://i.ibb.co/Kx4BQHTM/Item-When-Irises-Bloom.webp',
  'Curse of the Abyss': 'https://i.ibb.co/hFJXnrfW/Item-Curse-of-the-Abyss.webp',
  'Gold in Memory': 'https://i.ibb.co/Nd4ZcnLg/Item-Gold-in-Memory.webp',
  // === Resonator Ascension — Boss Drops ===
  'Mysterious Code': 'https://i.ibb.co/Fj3xgMk/Item-Mysterious-Code.webp',
  'Blazing Bone': 'https://i.ibb.co/BVtC1vQH/Item-Blazing-Bone.webp',
  'Abyssal Husk': 'https://i.ibb.co/gMN2M1bB/Item-Abyssal-Husk.webp',
  'Burning Judgment': 'https://i.ibb.co/WvfTNf8p/Item-Burning-Judgment.webp',
  'Blighted Crown of Puppet King': 'https://i.ibb.co/Mk2gByGM/Item-Blighted-Crown-of-Puppet-King.webp',
  'Cleansing Conch': 'https://i.ibb.co/pvnfc6NX/Item-Cleansing-Conch.webp',
  'Gold-Dissolving Feather': 'https://i.ibb.co/gZvq6RHR/Item-Gold-Dissolving-Feather.webp',
  'Elegy Tacet Core': 'https://i.ibb.co/CRC5JMb/Item-Elegy-Tacet-Core.webp',
  'Group Abomination Tacet Core': 'https://i.ibb.co/JjMq0vLM/Item-Group-Abomination-Tacet-Core.webp',
  'Our Choice': 'https://i.ibb.co/9mNkyQkg/Item-Our-Choice.webp',
  'Hidden Thunder Tacet Core': 'https://i.ibb.co/mC3ZDJxd/Item-Hidden-Thunder-Tacet-Core.webp',
  'Platinum Core': 'https://i.ibb.co/Ng5kzZ26/Item-Platinum-Core.webp',
  'Roaring Rock Fist': 'https://i.ibb.co/DPR6qBV8/Item-Roaring-Rock-Fist.webp',
  'Rage Tacet Core': 'https://i.ibb.co/gb03xrp2/Item-Rage-Tacet-Core.webp',
  "Suncoveter's Reach": 'https://i.ibb.co/TBsX7XRX/Item-Suncoveter-s-Reach.webp',
  'Strife Tacet Core': 'https://i.ibb.co/ynnMKtQz/Item-Strife-Tacet-Core.webp',
  'Sound-Keeping Tacet Core': 'https://i.ibb.co/KcQwmx2C/Item-Sound-Keeping-Tacet-Core.webp',
  'Thundering Tacet Core': 'https://i.ibb.co/VcwxDM37/Item-Thundering-Tacet-Core.webp',
  'Topological Confinement': 'https://i.ibb.co/zD50HfX/Item-Topological-Confinement.webp',
  'Unfading Glory': 'https://i.ibb.co/ZzS375yW/Item-Unfading-Glory.webp',
  'Truth in Lies': 'https://i.ibb.co/H93NgjR/Item-Truth-in-Lies.webp',
  // === Common Enemy Drops (HF = tier 3, FF = tier 4) ===
  // Whisperin Core family
  'HF-Whisperin Core': 'https://i.ibb.co/5XdgF3vt/Item-HF-Whisperin-Core.webp',
  'FF-Whisperin Core': 'https://i.ibb.co/qL2Mqr1B/Item-FF-Whisperin-Core.webp',
  // Ring family
  'Improved Ring': 'https://i.ibb.co/Txdrg5sZ/Item-Improved-Ring.webp',
  'Tailored Ring': 'https://i.ibb.co/d0S363jr/Item-Tailored-Ring.webp',
  // Howler Core family
  'HF-Howler Core': 'https://i.ibb.co/99xC7ZSb/Item-HF-Howler-Core.webp',
  'FF-Howler Core': 'https://i.ibb.co/GrrFvb5/Item-FF-Howler-Core.webp',
  // Tidal Residuum family
  'HF-Tidal Residuum': 'https://i.ibb.co/xqCsrnT1/Item-HF-Tidal-Residuum.webp',
  'FF-Tidal Residuum': 'https://i.ibb.co/Y7MHV4rp/Item-FF-Tidal-Residuum.webp',
  // Polygon Core family
  'HF-Polygon Core': 'https://i.ibb.co/5xBVprhn/Item-HF-Polygon-Core.webp',
  'FF-Polygon Core': 'https://i.ibb.co/VWBm757q/Item-FF-Polygon-Core.webp',
  // Mech Core family
  'HF-Mech Core': 'https://i.ibb.co/SDmhhqSY/Item-HF-Mech-Core.webp',
  'FF-Mech Core': 'https://i.ibb.co/Ld5RwwQN/Item-FF-Mech-Core.webp',
  // Carved Crystal family
  'HF-Carved Crystal': 'https://i.ibb.co/FqLcmHhR/Item-HF-Carved-Crystal.webp',
  'FF-Carved Crystal': 'https://i.ibb.co/cST0C2KY/Item-FF-Carved-Crystal.webp',
  // Exoswarm Core family
  'HF-Exoswarm Core': 'https://i.ibb.co/gbM0KFHq/Item-HF-Exoswarm-Core.webp',
  'FF-Exoswarm Core': 'https://i.ibb.co/ZyjbXDK/Item-FF-Exoswarm-Core.webp',
  // Exoswarm Pendant (separate drop family)
  'Chipped Exoswarm Pendant': 'https://i.ibb.co/F4sHk3f9/Item-Chipped-Exoswarm-Pendant.webp',
  'Intact Exoswarm Pendant': 'https://i.ibb.co/Gy3PM1Q/Item-Intact-Exoswarm-Pendant.webp',
  // === Forgery Materials (skill/weapon upgrade) ===
  'Waveworn Residue 235': 'https://i.ibb.co/N6b1m8VT/Item-Waveworn-Residue-235.webp',
  'Waveworn Residue 239': 'https://i.ibb.co/Xfwt09MV/Item-Waveworn-Residue-239.webp',
  'Remnant Combustor': 'https://i.ibb.co/prsfDV7Y/Item-Remnant-Combustor.webp',
  'Reverb Combustor': 'https://i.ibb.co/jkt3qd95/Item-Reverb-Combustor.webp',
  'Polarized Metallic Drip': 'https://i.ibb.co/xSVsWyKd/Item-Polarized-Metallic-Drip.webp',
  'Heterized Metallic Drip': 'https://i.ibb.co/WRXhhfR/Item-Heterized-Metallic-Drip.webp',
  'Refined Phlogiston': 'https://i.ibb.co/HTJ13kQy/Item-Refined-Phlogiston.webp',
  'Flawless Phlogiston': 'https://i.ibb.co/gZmPFYzP/Item-Flawless-Phlogiston.webp',
  'Mask of Distortion': 'https://i.ibb.co/QjX7YFy2/Item-Mask-of-Distortion.webp',
  'Mask of Insanity': 'https://i.ibb.co/spmvhjxs/Item-Mask-of-Insanity.webp',
  'Andante Helix': 'https://i.ibb.co/676tpkpg/Item-Andante-Helix.webp',
  'Presto Helix': 'https://i.ibb.co/pgMdH2f/Item-Presto-Helix.webp',
  'Cadence Leaf': 'https://i.ibb.co/35qhTRg8/Item-Cadence-Leaf.webp',
  'Cadence Blossom': 'https://i.ibb.co/MxztnSJ9/Item-Cadence-Blossom.webp',
  // Polarizer family
  'Polywing Polarizer': 'https://wuwatracker.com/api/item-icons/file/polywing-polarizer.webp',
  'Layered Wing Polarizer': 'https://wuwatracker.com/api/item-icons/file/layered-wing-polarizer.webp',
};

// [SECTION:COMMON_MAT_TIERS] — Maps common material family name → [tier3, tier4] display names
const COMMON_MAT_TIERS = {
  'Whisperin Core': ['HF-Whisperin Core', 'FF-Whisperin Core'],
  'Ring': ['Improved Ring', 'Tailored Ring'],
  'Howler Core': ['HF-Howler Core', 'FF-Howler Core'],
  'Tidal Residuum': ['HF-Tidal Residuum', 'FF-Tidal Residuum'],
  'Polygon Core': ['HF-Polygon Core', 'FF-Polygon Core'],
  'Mech Core': ['HF-Mech Core', 'FF-Mech Core'],
  'Carved Crystal': ['HF-Carved Crystal', 'FF-Carved Crystal'],
  'Exoswarm Core': ['HF-Exoswarm Core', 'FF-Exoswarm Core'],
  'Exoswarm Pendant': ['Chipped Exoswarm Pendant', 'Intact Exoswarm Pendant'],
};

// [SECTION:FORGERY_MAT_TIERS] — Maps forgery family name → [tier3, tier4] display names
const FORGERY_MAT_TIERS = {
  'Helix': ['Andante Helix', 'Presto Helix'],
  'Cadence': ['Cadence Leaf', 'Cadence Blossom'],
  'Metallic Drip': ['Polarized Metallic Drip', 'Heterized Metallic Drip'],
  'Phlogiston': ['Refined Phlogiston', 'Flawless Phlogiston'],
  'Combustor': ['Remnant Combustor', 'Reverb Combustor'],
  'Mask': ['Mask of Distortion', 'Mask of Insanity'],
  'Waveworn Residue': ['Waveworn Residue 235', 'Waveworn Residue 239'],
  'Polarizer': ['Polywing Polarizer', 'Layered Wing Polarizer'],
  'Carved Crystal': ['HF-Carved Crystal', 'FF-Carved Crystal'],
  'Waveworn Shard': ['HF-Waveworn Shard', 'FF-Waveworn Shard'],
  'String': ['HF-String', 'FF-String'],
};

// [SECTION:MATERIAL_COSTS] — Total materials to max level
// Resonator Lv 1→90 ascension costs (all 6 phases)
const RESONATOR_ASCENSION_COSTS = {
  boss: 46,
  commonT3: 12, commonT4: 4,
  specialty: 60,
  shell: 170000,
};

// Resonator EXP to Lv 90 — total 2,438,000 EXP
const RESONATOR_EXP_COSTS = {
  'Basic Resonance Potion': 0,
  'Medium Resonance Potion': 0,
  'Advanced Resonance Potion': 0,
  'Premium Resonance Potion': 122,
};

// All Forte nodes maxed (5 skills + inherent skills + stat bonuses)
const SKILL_UPGRADE_COSTS = {
  forgeryT3: 55, forgeryT4: 67,
  commonT3: 40, commonT4: 57,
  weeklyDrop: 26,
  shell: 2030000,
};

// Weapon refinement scaling — R1 = base (pv values), R2-R5 multiply pv values by these factors
// Standard WuWa scaling: each refinement adds 25% of base passive bonus
const WEAPON_REFINE_SCALE = [1, 1.25, 1.5, 1.75, 2];

// 5★ Weapon Lv 1→90 ascension costs (all 6 phases)
const WEAPON_ASCENSION_COSTS_5 = {
  forgeryT3: 6, forgeryT4: 20,
  commonT3: 10, commonT4: 12,
  shell: 330000,
};

// 4★ Weapon Lv 1→90 ascension costs
const WEAPON_ASCENSION_COSTS_4 = {
  forgeryT3: 5, forgeryT4: 17,
  commonT3: 9, commonT4: 11,
  shell: 264000,
};

// Weapon EXP to Lv 90 5★ — total 2,692,400 EXP
const WEAPON_EXP_COSTS_5 = {
  'Basic Energy Core': 0,
  'Medium Energy Core': 0,
  'Advanced Energy Core': 0,
  'Premium Energy Core': 135,
};

// Weapon EXP to Lv 90 4★ — total 2,289,200 EXP
const WEAPON_EXP_COSTS_4 = {
  'Basic Energy Core': 0,
  'Medium Energy Core': 0,
  'Advanced Energy Core': 0,
  'Premium Energy Core': 115,
};

// Release order for sorting (based on first banner appearance)
const RELEASE_ORDER = [
  // 1.0 - Launch (May 2024)
  'Rover', 'Jiyan', 'Yinlin', 'Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina',
  'Aalto', 'Baizhi', 'Chixia', 'Danjin', 'Yangyang', 'Sanhua', 'Taoqi', 'Yuanwu', 'Mortefi',
  // 1.1
  'Jinhsi', 'Changli', 'Youhu',
  // 1.2
  'Zhezhi', 'Xiangli Yao',
  // 1.3
  'Shorekeeper', 'Lumi',
  // 1.4
  'Camellya',
  // 2.0
  'Carlotta', 'Roccia',
  // 2.1
  'Phoebe', 'Brant',
  // 2.2
  'Cantarella',
  // 2.3
  'Zani', 'Ciaccona',
  // 2.4
  'Cartethyia', 'Lupa',
  // 2.5
  'Phrolova',
  // 2.6
  'Augusta', 'Iuno',
  // 2.7
  'Galbrena', 'Qiuyuan',
  // 2.8
  'Chisa', 'Buling',
  // 3.0
  'Lynae', 'Mornye',
  // 3.1
  'Aemeath', 'Luuk Herssen',
  // 3.2
  'Sigrika',
];

// All known character names (for filtering weapons vs characters)
const ALL_CHARACTERS = new Set([
  // 5★
  'Rover', 'Jiyan', 'Yinlin', 'Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina',
  'Jinhsi', 'Changli', 'Zhezhi', 'Xiangli Yao', 'Shorekeeper', 'Camellya',
  'Carlotta', 'Roccia', 'Phoebe', 'Brant', 'Cantarella', 'Zani', 'Ciaccona',
  'Cartethyia', 'Lupa', 'Phrolova', 'Augusta', 'Iuno', 'Galbrena', 'Qiuyuan',
  'Chisa', 'Lynae', 'Mornye', 'Luuk Herssen', 'Aemeath', 'Sigrika',
  // 4★
  'Aalto', 'Baizhi', 'Chixia', 'Danjin', 'Yangyang', 'Sanhua', 'Taoqi', 'Yuanwu', 
  'Mortefi', 'Youhu', 'Lumi', 'Buling',
]);

// Complete lists for Collection display (show all, grey out unpossessed)
// Standard 5★ characters (Tidal Chorus / 50-50 loss pool) — update when new standard chars are added
const STANDARD_5STAR_CHARACTERS = new Set(['Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina']);
// P9-FIX: Include ALL standard pool weapons — original 5 + Lustrous Razor + v3.0 Synth Armament series
// Must match CURRENT_BANNERS.standardWeapons for correct import history 50/50 tracking
const STANDARD_5STAR_WEAPONS = new Set([
  'Verdant Summit', 'Lustrous Razor', 'Emerald of Genesis', 'Static Mist', 'Abyss Surges', 'Cosmic Ripples',
  'Radiance Cleaver', 'Laser Shearer', 'Phasic Homogenizer', 'Pulsation Bracer', 'Boson Astrolabe',
]);

const ALL_5STAR_RESONATORS = [
  'Rover', 'Jiyan', 'Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina', 'Yinlin',
  'Jinhsi', 'Changli', 'Zhezhi', 'Xiangli Yao', 'Shorekeeper', 'Camellya',
  'Carlotta', 'Roccia', 'Phoebe', 'Brant', 'Cantarella', 'Zani', 'Ciaccona',
  'Cartethyia', 'Lupa', 'Phrolova', 'Augusta', 'Iuno', 'Galbrena', 'Qiuyuan',
  'Chisa', 'Lynae', 'Mornye', 'Luuk Herssen', 'Aemeath', 'Sigrika',
];

const ALL_4STAR_RESONATORS = [
  'Aalto', 'Baizhi', 'Chixia', 'Danjin', 'Yangyang', 'Sanhua', 'Taoqi', 'Yuanwu', 
  'Mortefi', 'Youhu', 'Lumi', 'Buling',
];

const ALL_5STAR_WEAPONS = [
  'Verdant Summit', 'Lustrous Razor', 'Emerald of Genesis', 'Static Mist', 'Abyss Surges', 'Cosmic Ripples',
  'Stringmaster', 'Ages of Harvest', 'Blazing Brilliance', 'Rime-Draped Sprouts', "Verity's Handle",
  'Stellar Symphony', 'Red Spring', 'The Last Dance', 'Tragicomedy', 'Luminous Hymn',
  'Unflickering Valor', 'Whispers of Sirens', 'Blazing Justice', 'Woodland Aria',
  "Bloodpact's Pledge", "Defier's Thorn", 'Wildfire Mark', 'Lethean Elegy',
  'Thunderflare Dominion', "Moongazer's Sigil", 'Solsworn Ciphers',
  'Lux & Umbra', 'Emerald Sentence', 'Kumokiri', 'Spectrum Blaster', 'Starfield Calibrator',
  'Everbright Polestar', "Daybreaker's Spine",
  'Radiance Cleaver', 'Laser Shearer', 'Phasic Homogenizer', 'Pulsation Bracer', 'Boson Astrolabe',
];

const ALL_4STAR_WEAPONS = [
  'Overture', "Ocean's Gift", 'Waltz in Masquerade', 'Legend of Drunken Hero',
  'Romance in Farewell', 'Fables of Wisdom', 'Meditations on Mercy', 'Call of the Abyss',
  'Somnoire Anchor', 'Fusion Accretion', 'Celestial Spiral', 'Relativistic Jet', 'Endless Collapse',
  'Waning Redshift', 'Lumingloss', 'Lunar Cutter', 'Commando of Conviction',
  'Jinzhou Keeper', 'Comet Flare', 'Augment', 'Variation', 'Hollow Mirage',
  'Stonard', 'Amity Accord', 'Marcato', 'Novaburst', 'Thunderbolt', 'Undying Flame', 'Cadenza',
  'Discord', 'Helios Cleaver', 'Dauntless Evernight',
  'Autumntrace', 'Solar Flame', 'Feather Edge',
  // Craftable 4★
  'Sword#18', 'Rectifier#25', 'Gauntlets#21D', 'Pistols#26', 'Broadblade#41',
  // Battle Pass 4★
  'Aureate Zenith', 'Radiant Dawn', 'Aether Strike',
];

const ALL_3STAR_WEAPONS = [
  'Guardian Sword', 'Sword of Voyager', 'Originite: Type II', 'Sword of Night',
  'Guardian Rectifier', 'Rectifier of Voyager', 'Rectifier of Night', 'Originite: Type V',
  'Guardian Gauntlets', 'Gauntlets of Voyager', 'Gauntlets of Night', 'Originite: Type III',
  'Guardian Pistols', 'Pistols of Voyager', 'Pistols of Night', 'Originite: Type IV',
  'Guardian Broadblade', 'Broadblade of Night', 'Broadblade of Voyager', 'Originite: Type I',
  'Beguiling Melody',
];

const ALL_2STAR_WEAPONS = [
  'Tyro Sword', 'Tyro Rectifier', 'Tyro Gauntlets', 'Tyro Pistols', 'Tyro Broadblade',
];

const ALL_1STAR_WEAPONS = [
  'Training Sword', 'Training Rectifier', 'Training Gauntlets', 'Training Pistols', 'Training Broadblade',
];

// Weapon release order for sorting (based on first banner appearance)
const WEAPON_RELEASE_ORDER = [
  // 1.0 - Standard 5★ + Launch
  'Verdant Summit', 'Lustrous Razor', 'Emerald of Genesis', 'Static Mist', 'Abyss Surges', 'Cosmic Ripples',
  'Stringmaster',
  // 1.1
  'Ages of Harvest', 'Blazing Brilliance',
  // 1.2
  'Rime-Draped Sprouts', "Verity's Handle",
  // 1.3
  'Stellar Symphony',
  // 1.4
  'Red Spring',
  // 2.0
  'The Last Dance', 'Tragicomedy',
  // 2.1
  'Luminous Hymn', 'Unflickering Valor',
  // 2.2
  'Whispers of Sirens',
  // 2.3
  'Blazing Justice', 'Woodland Aria',
  // 2.4
  "Defier's Thorn", 'Wildfire Mark',
  // 2.5
  'Lethean Elegy', "Bloodpact's Pledge",
  // 2.6
  'Thunderflare Dominion', "Moongazer's Sigil",
  // 2.7
  'Lux & Umbra', 'Emerald Sentence',
  // 2.8
  'Kumokiri',
  // 3.0
  'Spectrum Blaster', 'Starfield Calibrator',
  // 3.0 Standard (Synth Armament series)
  'Radiance Cleaver', 'Laser Shearer', 'Phasic Homogenizer', 'Pulsation Bracer', 'Boson Astrolabe',
  // 3.1
  'Everbright Polestar', "Daybreaker's Spine",
  // 3.2
  'Solsworn Ciphers',
];

// Tab navigation order for swipe gestures
const TAB_ORDER = ['tracker', 'events', 'planner', 'calculator', 'analytics', 'teams', 'gathering', 'profile'];

// Podium medal colors (gold, silver, bronze) for leaderboard/ranking displays
const MEDAL_COLORS = ['#edaf18', '#c0c0c0', '#cd7f32'];

// ═══════════════════════════════════════════════════════════════════════════════
// ELEMENT COLOR UTILITIES — Single source of truth for element→color mappings
// P6-FIX: Consolidates 3 duplicate inline copies (F-P6-046)
// ═══════════════════════════════════════════════════════════════════════════════
const ELEMENT_COLORS = {
  Fusion:  { hex: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)' },
  Electro: { hex: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)' },
  Aero:    { hex: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)' },
  Glacio:  { hex: '#06b6d4', bg: 'rgba(6,182,212,0.15)',  border: 'rgba(6,182,212,0.4)' },
  Havoc:   { hex: '#ec4899', bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)' },
  Spectro: { hex: '#edaf18', bg: 'rgba(237,175,24,0.15)',  border: 'rgba(237,175,24,0.4)' }, /* MED-1: brand gold */
  Heal:    { hex: '#22c55e', bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)' },
  Support: { hex: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.4)' },
  ATK:     { hex: '#ef4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)' },
  Shield:  { hex: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)' },
  Physical:{ hex: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)' },
};
const getElementColor = (el) => ELEMENT_COLORS[el]?.hex || '#6b7280';
const getElementBg = (el) => ELEMENT_COLORS[el]?.bg || 'rgba(107,114,128,0.15)';
const getElementBorder = (el) => ELEMENT_COLORS[el]?.border || 'rgba(107,114,128,0.4)';
// Get element color for a sonata set name
const getSetElementColor = (setName) => {
  const setData = ECHO_SETS[setName];
  return setData ? getElementColor(setData.element) : '#6b7280';
};
// Get unique element colors for an echo's sets (for multi-color gradients)
const getEchoSetColors = (echoName) => {
  const data = ECHO_DATA[echoName];
  if (!data) return [];
  const seen = new Set();
  return data.sets.map(s => {
    const el = ECHO_SETS[s]?.element;
    const hex = getElementColor(el);
    if (seen.has(hex)) return null;
    seen.add(hex);
    return hex;
  }).filter(Boolean);
};
// Get buff element color (maps 'Glacio DMG' → Glacio, etc.)
const getBuffElementColor = (buff) => {
  const el = typeof buff === 'string' ? buff.replace(' DMG', '') : '';
  return ELEMENT_COLORS[el]?.hex || ELEMENT_COLORS[buff]?.hex || '#6b7280';
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTER THEMES — Curated theme presets based on character banner art & element
// ═══════════════════════════════════════════════════════════════════════════════
const CHARACTER_THEMES = [
  { id: 'sigrika',       name: 'Sigrika',       element: 'Aero',    bannerArt: 'https://i.ibb.co/s9ws1Zf1/Sigrika-Banner-Art.jpg' },
  { id: 'qiuyuan',       name: 'Qiuyuan',       element: 'Aero',    bannerArt: 'https://i.ibb.co/yndZmfvB/Qiuyuan-Banner-Art.jpg' },
  { id: 'luuk-herssen',  name: 'Luuk Herssen',  element: 'Spectro', bannerArt: 'https://i.ibb.co/DPcdf0RY/Luuk-Hersen-Banner-Art.jpg' },
  { id: 'aemeath',       name: 'Aemeath',       element: 'Fusion',  bannerArt: 'https://i.ibb.co/YFQBgJ8W/Aemaeth-Banner-Art.jpg' },
  { id: 'mornye',        name: 'Mornye',        element: 'Fusion',  bannerArt: 'https://i.ibb.co/cKY4dY6W/Mornye-Banner-Art.png' },
  { id: 'chisa',         name: 'Chisa',         element: 'Havoc',   bannerArt: 'https://i.ibb.co/p6gwfsWC/Chisa-Banner-Art.jpg' },
  { id: 'galbrena',      name: 'Galbrena',      element: 'Fusion',  bannerArt: 'https://i.ibb.co/0jJLjwws/Galbrena-Banner-Art.jpg' },
  { id: 'iuno',          name: 'Iuno',          element: 'Aero',    bannerArt: 'https://i.ibb.co/xtdnyxRH/Iuno-Banner-Art.png' },
  { id: 'augusta',       name: 'Augusta',       element: 'Electro', bannerArt: 'https://i.ibb.co/Hfx3kqG0/Augusta-Banner-Art.jpg' },
  { id: 'lupa',          name: 'Lupa',          element: 'Fusion',  bannerArt: 'https://i.ibb.co/bjTy2MYT/Lupa-Banner-Art.jpg' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS - Used by App.jsx (WhisperingWishesInner)
// ═══════════════════════════════════════════════════════════════════════════════

export {
  APP_VERSION, MAX_IMPORT_SIZE_MB, HEADER_ICON, haptic, generateUniqueId,
  calculateLuckRating,
  SERVERS, getServerOffset,
  CURRENT_BANNERS, BANNER_HISTORY, CHARACTER_DATA, WEAPON_DATA, ECHO_SETS, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA, SKILL_MULTIPLIERS,
  EVENTS,
  HARD_PITY, SOFT_PITY_START, LUNITE_DAILY_ASTRITE, ASTRITE_PER_PULL, BEGINNER_ASTRITE_PER_PULL,
  SUBSCRIPTIONS, MAX_ASTRITE, MAX_CALC_PULLS,
  HARD_PITY_4STAR, FEATURED_4STAR_RATE,
  DEFAULT_COLLECTION_IMAGES, RELEASE_ORDER, WEAPON_RELEASE_ORDER,
  ALL_5STAR_RESONATORS, ALL_5STAR_WEAPONS,
  ALL_4STAR_RESONATORS, ALL_4STAR_WEAPONS, ALL_3STAR_WEAPONS, ALL_2STAR_WEAPONS, ALL_1STAR_WEAPONS,
  ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ECHO_DATA, ALL_ECHO_SONATA_SETS, ALL_ECHO_BUFF_TYPES,
  ALL_CHARACTERS, STANDARD_5STAR_CHARACTERS, STANDARD_5STAR_WEAPONS,
  MATERIAL_IMAGES, COMMON_MAT_TIERS, FORGERY_MAT_TIERS,
  RESONATOR_ASCENSION_COSTS, RESONATOR_EXP_COSTS, SKILL_UPGRADE_COSTS,
  WEAPON_ASCENSION_COSTS_5, WEAPON_ASCENSION_COSTS_4, WEAPON_EXP_COSTS_5, WEAPON_EXP_COSTS_4, WEAPON_REFINE_SCALE,
  TAB_ORDER, MEDAL_COLORS,
  ELEMENT_COLORS, getElementColor, getElementBg, getElementBorder, getSetElementColor, getEchoSetColors, getBuffElementColor,
  CHARACTER_THEMES,
};
