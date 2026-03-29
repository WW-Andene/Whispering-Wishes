// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — appcore-data.js
// Pure data, constants, game databases. No React. Leaf module (no imports).
// ═══════════════════════════════════════════════════════════════════════════════

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
  doubledPawnsImage: 'https://i.ibb.co/G4fSsp4P/Doubled-Pawns-Matrix.jpg',
  towerOfAdversityImage: 'https://i.ibb.co/QF335JVv/Tower-of-Adversity-Banner-Art.jpg',
  illusiveRealmImage: 'https://i.ibb.co/zcc2MxR/Fantasies-of-the-Thousand-Gateways.jpg',
  tacticalHologramImage: 'https://i.ibb.co/mCTQX0kB/tactical-hologram-phantom-pain.avif',
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

// [SECTION:CHAR_BUFFS] — Per-character buff/debuff data with exact values
// Each entry: { outroBuffs: [], libBuffs: [], selfBuffs: [], debuffs: [] }
// Buff format: { stat, value, target: 'next'|'team'|'self', duration, condition? }
// stat types: atkPct, allDmg, elemDmg, skillDmg, basicDmg, heavyDmg, libDmg, echoDmg,
//             critRate, critDmg, deepen, resShred, defShred, defIgnore, coordDmg
const CHAR_BUFF_TABLE = {
  // ── 5★ Supports / Sub DPS ──
  'Verina': {
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 40 }],
    libBuffs: [{ stat: 'atkPct', value: 20, target: 'team', duration: 40 }],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 15% All DMG Deepen 30s. Lib: 20% ATK teamwide. Fatal blow protection.',
  },
  'Shorekeeper': {
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 24 }],
    libBuffs: [
      { stat: 'critRate', value: 12.8, target: 'team', duration: 25, condition: 'In Stellarealm field' },
      { stat: 'critDmg', value: 25, target: 'team', duration: 25, condition: 'In Stellarealm field' },
    ],
    selfBuffs: [],
    debuffs: [],
    note: 'Lib field: +12.8% CR +25% CD while inside. Outro: 15% Deepen. Knockdown recovery.',
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
    outroBuffs: [{ stat: 'deepen', value: 25, target: 'next', duration: 14 }],
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
      { stat: 'basicDmg', value: 25, target: 'next', duration: 14 },
      { stat: 'atkPct', value: 12, target: 'team', duration: 20, condition: 'Weapon passive' },
    ],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 25% Basic ATK DMG Amp. Weapon passive: 12% team ATK.',
  },
  'Changli': {
    outroBuffs: [{ stat: 'elemDmg', value: 20, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 25, target: 'self', duration: 10, condition: 'After 4 Resonance Skill casts' }],
    debuffs: [],
    note: 'Outro: 20% Fusion DMG Amp to next. Self ATK ramp.',
  },
  'Yinlin': {
    outroBuffs: [{ stat: 'elemDmg', value: 20, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [{ stat: 'resShred', value: 10, duration: 10, condition: 'Electro RES' }],
    note: 'Outro: 20% Electro DMG Amp. Off-field Coordinated ATK. Electro RES Shred.',
  },
  'Zhezhi': {
    outroBuffs: [{ stat: 'skillDmg', value: 25, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: +25% Res. Skill DMG to next (14s). Off-field painter DMG.',
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
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Off-field Coordinated ATK. Outro: 15% Deepen. Heal.',
  },
  'Ciaccona': {
    outroBuffs: [{ stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Aero DMG Bonus' }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [
      { stat: 'erosion', value: 3, duration: 15, condition: '3 stacks Aero Erosion, ticks every 2s' },
      { stat: 'resShred', value: 16, duration: 20, condition: 'Weapon: Aero RES -16%' },
    ],
    note: 'Aero Erosion applier (3 stacks DOT). Outro: 20% Aero DMG. Weapon: Aero RES -16%.',
  },
  'Lupa': {
    outroBuffs: [{ stat: 'deepen', value: 18, target: 'next', duration: 14 }],
    libBuffs: [{ stat: 'atkPct', value: 15, target: 'team', duration: 40 }],
    selfBuffs: [],
    debuffs: [{ stat: 'resShred', value: 15, duration: 10, condition: 'Fusion RES' }],
    note: 'Outro: 18% Deepen. Lib: 15% ATK team. Fusion RES Shred 15%.',
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
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 12, target: 'self', duration: 99, condition: 'Weapon passive: Fusion DMG +12%' }],
    debuffs: [],
    note: 'Fusion Basic ATK DPS. Self-heal. ATK speed +10% from weapon.',
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
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Echo Skill focused AoE DPS. One of strongest AoE in game.',
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

// [SECTION:ECHO_SETS] — Sonata Effect set bonuses
const ECHO_SETS = {
  'Freezing Frost':       { element: 'Glacio',  p2: '+10% Glacio DMG',  p2val: { glacioDmg: 10 },  p5: 'Basic/Heavy Attack → +10% Glacio DMG (max x3)', p5val: { glacioDmg: 40 } },
  'Molten Rift':          { element: 'Fusion',  p2: '+10% Fusion DMG',  p2val: { fusionDmg: 10 },  p5: 'Res. Skill → +30% Fusion DMG', p5val: { fusionDmg: 40 } },
  'Void Thunder':         { element: 'Electro', p2: '+10% Electro DMG', p2val: { electroDmg: 10 }, p5: 'Heavy/Skill → +15% Electro DMG (max x2)', p5val: { electroDmg: 40 } },
  'Sierra Gale':          { element: 'Aero',    p2: '+10% Aero DMG',    p2val: { aeroDmg: 10 },    p5: 'Intro Skill → +30% Aero DMG', p5val: { aeroDmg: 40 } },
  'Celestial Light':      { element: 'Spectro', p2: '+10% Spectro DMG', p2val: { spectroDmg: 10 }, p5: 'Intro Skill → +30% Spectro DMG', p5val: { spectroDmg: 40 } },
  'Havoc Eclipse':        { element: 'Havoc',   p2: '+10% Havoc DMG',   p2val: { havocDmg: 10 },   p5: 'Basic/Heavy → +7.5% Havoc DMG (max x4)', p5val: { havocDmg: 40 } },
  'Sun-Sinking Eclipse':  { element: 'Havoc',   p2: '+10% Havoc DMG',   p2val: { havocDmg: 10 },   p5: 'Basic/Heavy → +7.5% Havoc DMG (max x4)', p5val: { havocDmg: 40 } },
  'Rejuvenating Glow':    { element: 'Heal',    p2: '+10% Healing',     p2val: { healBonus: 10 },   p5: 'Heal ally → +15% ATK for team', p5val: { teamAtk: 15 } },
  'Moonlit Clouds':       { element: 'Support', p2: '+10% Energy Regen',p2val: { energyRegen: 10 }, p5: 'Outro → +22.5% ATK for next', p5val: { nextAtk: 22.5 } },
  'Lingering Tunes':      { element: 'ATK',     p2: '+10% ATK',         p2val: { atkPct: 10 },      p5: 'ATK +5%/1.5s (max x4), Outro +60%', p5val: { atkPct: 20, outroDmg: 60 } },
  'Frosty Resolve':       { element: 'Glacio',  p2: '+12% Res. Skill DMG', p2val: { skillDmg: 12 }, p5: 'Skill → +22.5% Glacio; Lib → +18% Skill (x2)', p5val: { glacioDmg: 22.5, skillDmg: 36 } },
  'Eternal Radiance':     { element: 'Spectro', p2: '+10% Spectro DMG', p2val: { spectroDmg: 10 }, p5: 'Frazzle → +20% Crit Rate; 10 stacks → +15% Spectro', p5val: { critRate: 20, spectroDmg: 15 } },
  'Midnight Veil':        { element: 'Havoc',   p2: '+10% Havoc DMG',   p2val: { havocDmg: 10 },   p5: 'Outro → 480% Havoc + 15% Havoc for next', p5val: { havocDmg: 15, outroDmg: 480 } },
  'Empyrean Anthem':      { element: 'Support', p2: '+10% Energy Regen',p2val: { energyRegen: 10 }, p5: 'Coord ATK +80%; on crit → +20% ATK', p5val: { coordDmg: 80, atkPct: 40 } },
  'Tidebreaking Courage': { element: 'Support', p2: '+10% Energy Regen',p2val: { energyRegen: 10 }, p5: '+15% ATK; ≥250% ER → +30% all DMG', p5val: { atkPct: 15, allDmg: 40 } },
  'Gusts of Welkin':      { element: 'Aero',    p2: '+10% Aero DMG',    p2val: { aeroDmg: 10 },    p5: 'Erosion → +15% Aero team + extra 15%', p5val: { aeroDmg: 40 } },
  'Windward Pilgrimage':  { element: 'Aero',    p2: '+10% Aero DMG',    p2val: { aeroDmg: 10 },    p5: 'Aero Erosion → +15% Aero team', p5val: { aeroDmg: 15 } },
  // v2.5–2.6 — Sanguis Plateaus sets
  'Flaming Clawprint':    { element: 'Fusion',  p2: '+10% Fusion DMG',  p2val: { fusionDmg: 10 },  p5: 'Liberation → +15% Fusion team, +20% Lib DMG for 35s', p5val: { fusionDmg: 15, libDmg: 40 } },
  'Crown of Valor':       { element: 'Shield',  p3: 'Shield → ATK +6%, Crit DMG +4% for 4s (0.5s CD, max x5)', p3val: { atkPct: 30, critDmg: 40 } },
  'Law of Harmony':       { element: 'Support', p3: 'Echo Skill → +30% Heavy ATK DMG 4s; team Echo Skill DMG +4% 30s (max x4)', p3val: { heavyDmg: 30, echoDmg: 16 } },
  // v2.7–2.8 — Chronorift sets
  "Flamewing's Shadow":   { element: 'Fusion',  p3: 'Echo Skill → +20% Heavy Crit Rate; Heavy ATK → +20% Echo Crit Rate; both → +16% Fusion DMG', p3val: { critRate: 20, fusionDmg: 16 } },
  'Thread of Severed Fate': { element: 'Havoc', p3: 'Havoc Bane → +20% ATK, +30% Liberation DMG for 5s', p3val: { atkPct: 20, libDmg: 40 } },
  'Dream of the Lost':    { element: 'Havoc',   p3: '0 Resonance Energy → +20% Crit Rate, +35% Echo Skill DMG', p3val: { critRate: 20, echoDmg: 35 } },
  // v3.0 — Lahai-Roi sets
  'Pact of Neonlight Leap': { element: 'Spectro', p2: '+10% Spectro DMG', p2val: { spectroDmg: 10 }, p5: 'Outro → next +15% ATK; per Tune Break Boost +0.3% ATK (max +15%)', p5val: { atkPct: 40 } },
  'Rite of Gilded Revelation': { element: 'Spectro', p2: '+10% Spectro DMG', p2val: { spectroDmg: 10 }, p5: 'Basic ATK → +10% Spectro DMG (max x3); 3 stacks + Lib → +40% Basic ATK DMG', p5val: { spectroDmg: 30, basicDmg: 40 } },
  'Halo of Starry Radiance': { element: 'Heal', p2: '+10% Healing',      p2val: { healBonus: 10 },   p5: 'Heal → per 1% Off-Tune Rate +0.2% ATK team (max +25%)', p5val: { teamAtk: 25 } },
  // v3.1 — Frostlands sets
  'Trailblazing Star':    { element: 'Fusion',  p2: '+10% Fusion DMG',  p2val: { fusionDmg: 10 },  p5: 'Fusion Burst/Tune Rupture → +20% Crit Rate, +20% Fusion DMG for 8s', p5val: { critRate: 20, fusionDmg: 40 } },
  'Chromatic Foam':        { element: 'Fusion',  p2: '+10% Fusion DMG',  p2val: { fusionDmg: 10 },  p5: 'Fusion Burst → +10% Fusion DMG 15s; Outro → +25% Fusion DMG for next 15s', p5val: { fusionDmg: 35 } },
  'Sound of True Name':    { element: 'Aero',    p2: '+10% Aero DMG',    p2val: { aeroDmg: 10 },    p5: 'Echo Skill DMG → +20% Echo Crit Rate, +15% Aero DMG for 5s', p5val: { critRate: 20, aeroDmg: 15 } },
};

// [SECTION:ECHO_LISTS] — All echoes grouped by cost tier (newest first)
const ALL_4COST_ECHOES = [
  // v3.0+ — Lahai-Roi
  'Sigillum', 'Hyvatia', 'Reactor Husk', 'Nameless Explorer',
  // v2.8 — Chronorift
  'Reminiscence: Threnodian - Leviathan',
  // v2.6 — Sanguis Plateaus
  'Lady of the Sea', 'The False Sovereign', 'Lioness of Glory',
  'Nightmare: Kelpie', 'Lorelei', 'Reminiscence: Fenrico',
  // v2.1–2.5 — Rinascita expansion
  'Reminiscence: Fleurdelys', 'Dragon of Dirge', 'Nightmare: Hecate', 'Hecate',
  'Nightmare: Thundering Mephis', 'Nightmare: Tempest Mephis',
  'Nightmare: Inferno Rider', 'Nightmare: Feilian Beringal',
  'Nightmare: Mourning Aix', 'Nightmare: Crownless',
  // v2.0 — Rinascita
  'Dreamless', 'Nightmare: Lampylumen Myriad', 'Nightmare: Impermanence Heron', 'Sentry Construct',
  // v1.2–1.3
  'Fallacy of No Return', 'Jué',
  // v1.0 — Launch
  'Crownless', 'Mech Abomination', 'Lampylumen Myriad', 'Impermanence Heron',
  'Bell-Borne Geochelone', 'Inferno Rider', 'Thundering Mephis', 'Tempest Mephis',
  'Feilian Beringal', 'Mourning Aix',
];

const ALL_3COST_ECHOES = [
  // v3.0+ — Lahai-Roi
  'Twin Nova - Nebulous Cannon', 'Twin Nova - Collapsar Blade',
  'Sabercat Prowler', 'Sabercat Reaver', 'Spacetrek Explorer',
  'Flora Reindeer', 'Windlash Coleoid', 'Frostbite Coleoid', 'Glommoth',
  'Ironhoof', 'Mining Reindeer',
  'Reminiscence - Kronaclaw', 'Kronablight',
  // v2.6 — Sanguis Plateaus
  'Corrosaurus', 'Pilgrim\'s Shell', 'Kerasaur', 'Hurriclaw',
  'Nightmare: Viridblaze Saurian', 'Nightmare: Violet-Feathered Heron',
  'Nightmare: Cyan-Feathered Heron', 'Nightmare: Roseshroom', 'Nightmare: Tambourinist',
  // v2.1–2.5 — Rinascita expansion
  'Capitaneus', 'Diurnus Knight', 'Nocturnus Knight', 'Questless Knight',
  'Abyssal Gladius', 'Abyssal Patricius',
  'Rage Against the Statue', 'Vitreum Dancer', 'Cuddle Wuddle',
  'Chop Chop', 'Lightcrusher', 'Rocksteady Guardian',
  // v2.0 — Rinascita
  'Abyssal Mercator', 'Chasm Guardian',
  // v1.1–1.3
  'Glacio Dreadmane',
  // v1.0 — Launch
  'Viridblaze Saurian', 'Autopuppet Scout',
  'Stonewall Bracer', 'Hoochief', 'Flautist',
  'Cyan-Feathered Heron', 'Violet-Feathered Heron',
  'Roseshroom', 'Carapace', 'Spearback',
  'Tambourinist', 'Lumiscale Construct', 'Havoc Dreadmane',
];

const ALL_1COST_ECHOES = [
  // v3.0+ — Lahai-Roi
  'Geospider S4', 'Flora Drone', 'Mining Drone', 'Zip Zap',
  'Iceglint Dancer', 'Shadow Stepper', 'Tremor Warrior',
  // v2.6 — Sanguis Plateaus
  'Aero Drake', 'Electro Drake', 'Fusion Drake', 'Glacio Drake',
  'Havoc Drake', 'Spectro Drake',
  'Devotee\'s Flesh', 'Sacerdos', 'Sagittario',
  'La Guardia', 'Calcified Junrock', 'Fission Junrock', 'Golden Junrock', 'Vanguard Junrock',
  'Nightmare: Aero Predator', 'Nightmare: Electro Predator', 'Nightmare: Glacio Predator',
  'Nightmare: Baby Roseshroom', 'Nightmare: Baby Viridblaze Saurian',
  'Nightmare: Chirpuff', 'Nightmare: Dwarf Cassowary',
  'Nightmare: Gulpuff', 'Nightmare: Havoc Warrior', 'Nightmare: Tick Tack',
  // v2.1–2.5 — Rinascita expansion
  'Chop Chop: Headless', 'Chop Chop: Leftless', 'Chop Chop: Rightless',
  'Diggy Duggy', 'Diamondclaw', 'Fae Ignis',
  'Frostscourge Stalker', 'Voltscourge Stalker', 'Galescourge Stalker',
  'Hocus Pocus', 'Nimbus Wraith', 'Hoartoise',
  'Sabyr Boar', 'Traffic Illuminator', 'Tick Tack',
  // v2.0+ — Newer 1-cost echoes
  'Lottie Lost', 'Chest Mimic', 'Aero Prism',
  'Aero Predator', 'Glacio Predator', 'Gulpuff',
  // v1.1 — Mt. Firmament
  'Electro Predator', 'Fusion Dreadmane', 'Lava Larva',
  'Clang Bang', 'Dwarf Cassowary', 'Excarat',
  'Baby Viridblaze Saurian', 'Young Roseshroom',
  // v1.0 — Launch
  'Fusion Prism', 'Glacio Prism', 'Havoc Prism', 'Spectro Prism',
  'Snip Snap', 'Zig Zag', 'Hooscamp',
  'Fusion Warrior', 'Havoc Warrior',
  'Whiff Whaff', 'Cruisewing', 'Chirpuff',
];

// [SECTION:ECHO_DATA] — Per-echo sonata set & buff type data
const ECHO_DATA = {
  // ── 4-Cost Echoes ──
  'Mourning Aix':                    { sets: ['Celestial Light'], buff: 'Spectro DMG', desc: 'A spectral avian Overlord. Skill transforms into Mourning Aix for 2 claw attacks dealing 157%/236% Spectro DMG, then grants +12% Spectro DMG and +12% Resonance Liberation DMG for 15s.' },
  'Feilian Beringal':                { sets: ['Sierra Gale'], buff: 'Aero DMG', desc: 'A towering ape-like Overlord wreathed in wind. Skill transforms into Feilian Beringal for a powerful kick (231% Aero DMG) and follow-up strike (283% Aero DMG), then grants +12% Aero DMG and +12% Heavy ATK DMG for 15s.' },
  'Tempest Mephis':                  { sets: ['Void Thunder'], buff: 'Electro DMG', desc: 'A lightning-wreathed lupine Overlord. Skill transforms into Tempest Mephis for tail swing attacks (102% Electro DMG each) and a claw strike (175% Electro DMG), then grants +12% Electro DMG and +12% Heavy ATK DMG for 15s.' },
  'Thundering Mephis':               { sets: ['Void Thunder'], buff: 'Electro DMG', desc: 'A massive wolf-like Overlord crackling with thunder. Skill transforms into Thundering Mephis for up to 6 strikes (132% Electro DMG each, final hit 189%), then grants +12% Electro DMG and +12% Resonance Liberation DMG for 15s.' },
  'Inferno Rider':                   { sets: ['Molten Rift'], buff: 'Fusion DMG', desc: 'A blazing mounted knight Overlord. Skill transforms into Inferno Rider for 3 slashes dealing 242%/282%/282% Fusion DMG, then grants +12% Fusion DMG and +12% Basic ATK DMG for 15s. Hold to enter Riding Mode.' },
  'Bell-Borne Geochelone':           { sets: ['Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Shield', desc: 'A giant bell-carrying tortoise. Skill deals 145% DEF-scaled Glacio DMG and grants a Bell-Borne Shield (50% DMG Reduction, +10% DMG Boost for team) lasting 15s or 3 hits.' },
  'Impermanence Heron':              { sets: ['Moonlit Clouds'], buff: 'Havoc DMG', desc: 'A spectral crane-like Overlord. Skill transforms into Impermanence Heron dealing 310% Havoc DMG on dive; hold to spit flames (55% Havoc DMG each). Restores 10 Resonance Energy on hit and boosts next character\'s DMG by 12% for 15s after Outro.' },
  'Lampylumen Myriad':               { sets: ['Freezing Frost'], buff: 'Glacio DMG', desc: 'A luminous deep-sea jellyfish Overlord. Skill transforms into Lampylumen Myriad for 3 freezing strikes dealing 220%/200%/266% Glacio DMG. Each hit grants +4% Glacio DMG and +4% Resonance Skill DMG for 15s, stacking 3 times.' },
  'Mech Abomination':                { sets: ['Lingering Tunes'], buff: 'Electro DMG', desc: 'A grotesque mechanical construct Overlord. Skill strikes for 48% Electro DMG and summons Mech Waste dealing 320% Electro DMG on hit (explodes for 160% more). Grants +12% ATK for 15s. Mech Waste DMG counts as Outro Skill DMG.' },
  'Crownless':                       { sets: ['Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A faceless humanoid Overlord of pure Havoc energy. Skill transforms into Crownless for 4 attacks: two hits of 134% Havoc DMG, a double-hit of 100%, and a triple-hit of 67%. Grants +12% Havoc DMG and +12% Resonance Skill DMG for 15s.' },
  'Jué':                    { sets: ['Celestial Light'], buff: 'Spectro DMG', desc: 'The ancient dragon guardian of Jinzhou. Skill summons Jué to soar and strike (48% Spectro DMG), call 5 thunderbolts (19% each), and spiral down twice (48% each). Grants Blessing of Time: +16% Resonance Skill DMG Bonus and Spectro DoT for 15s.' },
  'Fallacy of No Return':            { sets: ['Rejuvenating Glow'], buff: 'Spectro DMG', desc: 'An otherworldly Overlord that bends reality. Skill blasts surrounding area for 15.86% Max HP Spectro DMG; hold to flurry at 1.58% Max HP per hit, ending with 19.82% Max HP. Grants +10% Energy Regen and +10% ATK to all team members for 20s.' },
  'Sentry Construct':                { sets: ['Frosty Resolve'], buff: 'Glacio DMG', desc: 'A massive armored guardian construct. Skill transforms into Sentry Construct dealing 405% Glacio DMG. After enough Resonance Liberations charge the Strike Capacitor to max, resets Echo cooldown and dives for 405% Glacio DMG with freeze. Grants +12% Glacio DMG and +12% Resonance Skill DMG.' },
  'Nightmare: Impermanence Heron':   { sets: ['Midnight Veil'], buff: 'Havoc DMG', desc: 'A nightmare variant of the spectral crane wreathed in prismatic energy. Skill transforms and delivers up to 10 strikes of 40% Havoc DMG each. Main slot grants +12% Havoc DMG and +12% Heavy ATK DMG passively.' },
  'Nightmare: Lampylumen Myriad':    { sets: ['Empyrean Anthem', 'Frosty Resolve'], buff: 'Glacio DMG', desc: 'A nightmare variant of the luminous jellyfish. Skill transforms and attacks surrounding enemies for 273% Glacio DMG. Main slot passively grants +12% Glacio DMG and +30% Coordinated ATK DMG.' },
  'Dragon of Dirge':                 { sets: ['Tidebreaking Courage'], buff: 'Fusion DMG', desc: 'A grieving dragon from the depths of Rinascita. Skill transforms and summons a Grief Rift lasting 5s, periodically dealing 36% Fusion DMG to enemies in the area. Main slot grants +12% Fusion DMG and +12% Basic ATK DMG.' },
  'Nightmare: Hecate':               { sets: ['Dream of the Lost'], buff: 'Havoc DMG', desc: 'A nightmare variant of the three-headed witch of the deep. Skill transforms into Nightmare Hecate, leaping up and smashing down for 3 stages of Havoc DMG (152% each). Main slot passively grants +12% Havoc DMG and +20% Echo Skill DMG.' },
  'Nightmare: Crownless':            { sets: ['Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A nightmare variant of the faceless Havoc Overlord. Skill transforms and attacks enemies in front for 405% Havoc DMG. 3 charges (1 per 12s). On hit, +20% DMG for 2s. Main slot grants +12% Havoc DMG and +12% Basic ATK DMG.' },
  'Nightmare: Mourning Aix':         { sets: ['Eternal Radiance'], buff: 'Spectro DMG', desc: 'A nightmare variant of the spectral avian. Skill summons Nightmare: Mourning Aix dealing 273% Spectro DMG. DMG to enemies with Spectro Frazzle is increased by 100%. Main slot grants +12% Spectro DMG.' },
  'Nightmare: Feilian Beringal':     { sets: ['Sierra Gale'], buff: 'Aero DMG', desc: 'A nightmare variant of the wind ape. Skill summons Nightmare: Feilian Beringal dealing 164% Aero DMG, leaving a Whirlwind Beam that attacks 5 more times for 21% Aero DMG each. Main slot grants +12% Aero DMG and +12% Heavy ATK DMG.' },
  'Nightmare: Inferno Rider':        { sets: ['Molten Rift'], buff: 'Fusion DMG', desc: 'A nightmare variant of the blazing knight. Skill transforms and jumps to attack for 405% Fusion DMG. Hold to enter Riding Mode (exit deals 283% Fusion DMG). Main slot grants +12% Fusion DMG and +12% Resonance Skill DMG.' },
  'Nightmare: Tempest Mephis':       { sets: ['Void Thunder', 'Empyrean Anthem'], buff: 'Electro DMG', desc: 'A nightmare variant of the lightning wolf. Skill transforms and attacks surrounding enemies for 405% Electro DMG. Main slot grants +12% Electro DMG and +12% Resonance Skill DMG.' },
  'Nightmare: Thundering Mephis':    { sets: ['Void Thunder'], buff: 'Electro DMG', desc: 'A nightmare variant of the thunder wolf. Skill transforms and attacks enemies in front for 405% Electro DMG. Main slot grants +12% Electro DMG and +12% Resonance Liberation DMG.' },
  'Dreamless':                       { sets: ['Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A humanoid Calamity of pure Havoc tied to Rover\'s past. Skill transforms for 6 strikes: first 5 deal 54% Havoc DMG each, final hit deals 270% Havoc DMG. DMG increased by 50% within 5s of Rover: Havoc\'s Resonance Liberation.' },
  'Reminiscence: Fleurdelys':        { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Aero DMG', desc: 'An echo of the ancient flower-dragon guardian. Skill summons the Windcleaver for 8 hits of 27% Aero DMG plus one hit of 136% Aero DMG. Main slot grants +10% Aero DMG (+20% if Rover: Aero or Cartethyia).' },
  'Lioness of Glory':                { sets: ['Flaming Clawprint'], buff: 'Fusion DMG', desc: 'A proud leonine Overlord wielding the Halberd of Glory. Skill summons the Halberd to crush an area for 82% Fusion DMG, then blasts off for 191% Fusion DMG. Main slot grants +12% Fusion DMG and +12% Resonance Liberation DMG.' },
  'The False Sovereign':             { sets: ['Crown of Valor'], buff: 'Electro DMG', desc: 'A puppet-king Overlord infused with Electro. Skill transforms and dashes forward in a spinning strike dealing 55% Electro DMG x4. Upon casting Intro Skill, also summons the False Sovereign for 405% Electro DMG. Main slot grants +12% Electro DMG and +12% Heavy ATK DMG. 2 charges, 1 per 8s.' },
  'Lady of the Sea':                 { sets: ['Crown of Valor'], buff: 'Aero DMG', desc: 'A majestic maritime Overlord commanding the tides. Skill summons a Tidestorm dealing 13% Aero DMG x10 and 164% Aero DMG x1. Main slot grants +12% Aero DMG and +12% Resonance Liberation DMG.' },
  'Corrosaurus':                     { sets: ['Flaming Clawprint', "Flamewing's Shadow"], buff: 'Fusion DMG', desc: 'A rare armored saurian of the Sanguis Plateaus that spews molten rock. Skill summons Corrosaurus to attack for 273% Fusion DMG. Main slot grants +12% Fusion DMG and +20% Echo Skill DMG.' },
  'Reminiscence: Threnodian - Leviathan': { sets: ["Flamewing's Shadow", 'Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A colossal sea-beast Calamity wreathed in Havoc. Skill summons a Collapsing Horizon for 2 hits of 131% Havoc DMG and creates Core of Collapse for 15s (24% Havoc DMG per hit, up to 8 times). Main slot grants +12% Havoc DMG and +12% Resonance Liberation DMG.' },
  'Hyvatia':                         { sets: ['Pact of Neonlight Leap', 'Rite of Gilded Revelation'], buff: 'Spectro DMG', desc: 'An ancient construct boss from Lahai-Roi that fires converging lasers. Skill summons Hyvatia mid-air to fire lasers dealing 27% Spectro DMG x10. Outro within 15s grants the incoming Resonator +10% All-Attribute DMG Bonus for 15s.' },
  'Twin Nova - Nebulous Cannon':      { sets: ['Rite of Gilded Revelation', 'Chromatic Foam'], buff: 'Spectro DMG', desc: 'The ranged model of a Spacetrek Collective combat mech pair. Skill transforms to slash enemies twice for 80% Spectro DMG each. Main slot grants +12% Spectro DMG and +12% Basic ATK DMG. Pairing with Collapsar Blade enables combo attacks and Dyad Origins stacks (+10% Echo Skill DMG each, up to 6).' },
  'Sigillum':                        { sets: ['Trailblazing Star'], buff: 'Fusion DMG', desc: 'A Calamity-class star guardian sealed beyond the Gate of the Lost Star. Skill summons Sigillum for two attacks dealing 68%/205% Fusion DMG. When equipped by Aemeath, grants +25% Resonance Liberation DMG.' },
  'Reactor Husk':                    { sets: ['Halo of Starry Radiance', 'Chromatic Foam'], buff: 'Fusion DMG', desc: 'A massive reactor construct from Lahai-Roi. Skill transforms into Reactor Husk and overloads its core, detonating for 273% Fusion DMG in a wide area. Hold to charge the Meltdown Beam for up to 280% Fusion DMG. Grants +12% Fusion DMG and +12% Resonance Skill DMG.' },
  'Nameless Explorer':               { sets: ['Sound of True Name'], buff: 'Aero DMG', desc: 'A mysterious explorer Overlord who wanders between forgotten ruins. Skill transforms into Nameless Explorer and unleashes a 3-hit wind combo dealing 135%/135%/183% Aero DMG. Final hit creates a Gale Vortex pulling enemies in for 2s. Grants +12% Aero DMG and +12% Heavy ATK DMG.' },
  'Lorelei':                         { sets: ['Midnight Veil'], buff: 'Havoc DMG', desc: 'A siren-like Overlord that lures with haunting melodies. Skill transforms into Lorelei and sings a Dirge of Ruin, dealing 68% Havoc DMG x6 to enemies in a cone. Enemies hit by all 6 notes are Silenced for 2s. Grants +12% Havoc DMG and +12% Resonance Liberation DMG.' },
  'Nightmare: Kelpie':               { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Glacio DMG', desc: 'A nightmare variant of a water-horse Overlord wreathed in frozen mist. Skill transforms into Nightmare: Kelpie and charges forward for 205% Glacio DMG, then rears up and stomps for 248% Glacio DMG with a chance to freeze. Grants +12% Glacio DMG and +12% Basic ATK DMG.' },
  'Hecate':                          { sets: ['Empyrean Anthem'], buff: 'Havoc DMG', desc: 'The three-headed witch Calamity of the deep. Skill transforms into Hecate and channels a tri-beam convergence dealing 135% Havoc DMG x3, then detonates the focal point for 148% Havoc DMG. Grants +12% Havoc DMG and +12% Resonance Skill DMG.' },
  'Reminiscence: Fenrico':           { sets: ['Dream of the Lost', 'Law of Harmony'], buff: 'Aero DMG', desc: 'A reminiscence of the wolf guardian Fenrico, howling with primordial wind. Skill transforms into Fenrico and lunges with 3 slashes dealing 91%/91%/182% Aero DMG, then howls to create a Wind Domain for 5s dealing 19% Aero DMG x5 to enemies inside. Grants +12% Aero DMG and +12% Resonance Liberation DMG.' },
  // ── 3-Cost Echoes ──
  'Capitaneus':                      { sets: ['Eternal Radiance', 'Gusts of Welkin'], buff: ['Spectro DMG', 'Aero DMG'], desc: 'The supreme commander of the Order, carrying out judgment on transgressors. Skill summons Capitaneus to jump and smash for 118% Spectro DMG, generating 4 Merciless Judgements at 59% Spectro DMG each. Main slot grants +12% Spectro DMG and +12% Heavy ATK DMG.' },
  'Havoc Dreadmane':                 { sets: ['Molten Rift', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A dark-maned lion-like beast radiating Havoc energy. Skill transforms into Havoc Dreadmane for 2 tail strikes, each dealing 116% Havoc DMG plus 77% bonus Havoc DMG on hit.' },
  'Lumiscale Construct':             { sets: ['Freezing Frost', 'Void Thunder'], buff: 'Glacio DMG', desc: 'An armored construct with luminous scales. Skill transforms into a Parry Stance; slash deals 553% Glacio DMG, or counterattack on hit deals 553% + 276% Glacio DMG.' },
  'Tambourinist':                    { sets: ['Freezing Frost', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A rhythmic humanoid Tacet Discord that weaponizes sound. Skill summons Tambourinist playing Melodies of Annihilation; when a Resonator hits a target, deals 14% Havoc DMG up to 10 times over 10s.' },
  'Spearback':                       { sets: ['Moonlit Clouds', 'Lingering Tunes'], buff: 'Physical DMG', desc: 'A ferocious bear-like beast covered in arrow-shaped Tacetite spines. Skill summons Spearback for 5 attacks: first 4 deal 29% Physical DMG each, final hit deals 51% Physical DMG.' },
  'Carapace':                        { sets: ['Sierra Gale', 'Moonlit Clouds'], buff: 'Aero DMG', desc: 'An elite construct that camouflages among city ruins. Skill transforms into Carapace for a spinning attack (112% Aero DMG) followed by a slash (168% Aero DMG).' },
  'Roseshroom':                      { sets: ['Freezing Frost', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A mature fungal Tacet Discord that channels dark energy through its cap. Skill summons Roseshroom to fire a laser dealing 57% Havoc DMG up to 3 times.' },
  'Violet-Feathered Heron':          { sets: ['Molten Rift', 'Void Thunder'], buff: 'Electro DMG', desc: 'A purple-winged heron that only spreads its wings in thunderstorms. Skill transforms into a Parry Stance; counterattack deals 288% Electro DMG. If attacked during parry, counters early and recovers 5 Concerto Energy.' },
  'Cyan-Feathered Heron':            { sets: ['Sierra Gale', 'Celestial Light'], buff: 'Aero DMG', desc: 'A cyan-winged heron found in forests and shores. Skill transforms and charges at enemies dealing 236% Aero DMG, interrupting enemy Special Skills on hit.' },
  'Flautist':                        { sets: ['Void Thunder', 'Lingering Tunes'], buff: 'Electro DMG', desc: 'A humanoid Tacet Discord that wields sound as a weapon. Skill transforms and continuously emits Electro lasers dealing 53% Electro DMG x10. Gains 1 Concerto Energy per hit.' },
  'Hoochief':                        { sets: ['Sierra Gale', 'Rejuvenating Glow'], buff: 'Aero DMG', desc: 'A large primate Tacet Discord commanding wind. Skill transforms into Hoochief Cyclone and smacks enemies for 268% Aero DMG.' },
  'Stonewall Bracer':                { sets: ['Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Shield', desc: 'A hulking stone-armored construct. Skill transforms and charges forward for 112% Physical DMG, then smashes for 168% Physical DMG and gains a shield equal to 10% Max HP for 7s.' },
  'Autopuppet Scout':                { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'A derelict combat puppet hiding in city ruins. Skill transforms dealing 272% Glacio DMG to surroundings and generating up to 3 Ice Walls that block enemies.' },
  'Viridblaze Saurian':              { sets: ['Molten Rift', 'Moonlit Clouds'], buff: 'Fusion DMG', desc: 'A large amphibian-like beast found in forests that spits fire. Skill summons Viridblaze Saurian to continuously breathe fire, dealing 17% Fusion DMG x10.' },
  'Glacio Dreadmane':                { sets: ['Freezing Frost', 'Moonlit Clouds'], buff: 'Physical DMG', desc: 'An icy lion-like beast from Mt. Firmament. Skill lacerates enemies for 214% Glacio DMG with 2 charges. Deals +20% DMG mid-air and generates 6 Icicles on landing (32% Glacio DMG each).' },
  'Chasm Guardian':                  { sets: ['Rejuvenating Glow', 'Lingering Tunes'], buff: 'Havoc DMG', desc: 'A boulder-like construct from the abyss, built to crush rather than protect. Skill transforms for a Leap Strike dealing 273% Havoc DMG at cost of 10% HP, then restores up to 10% Max HP over 5s.' },
  'Abyssal Mercator':                { sets: ['Frosty Resolve', 'Eternal Radiance'], buff: 'Glacio DMG', desc: 'A battle-hardened combatant from the depths. Skill summons Abyssal Mercator to slash twice for 84% Glacio DMG each, then thrust forward for 120% Glacio DMG. Enemies hit by all 3 strikes are afflicted with Frostbite for 5s.' },
  'Twin Nova - Collapsar Blade':      { sets: ['Rite of Gilded Revelation', 'Trailblazing Star', 'Sound of True Name'], buff: 'Electro DMG', desc: 'The melee model of a Spacetrek Collective combat mech pair. Skill transforms to deliver 2 electrified slashes dealing 96% Electro DMG each, then a finishing thrust for 144% Electro DMG. Pairing with Nebulous Cannon enables combo attacks and Dyad Origins stacks (+10% Echo Skill DMG each, up to 6).' },
  'Sabercat Prowler':                { sets: ['Pact of Neonlight Leap', 'Rite of Gilded Revelation', 'Sound of True Name'], buff: 'Fusion DMG', desc: 'A stealthy feline predator from Lahai-Roi. Skill summons Sabercat Prowler to pounce from stealth dealing 168% Fusion DMG, then rake with both claws for 55% Fusion DMG x2. Pounce hit from behind deals +50% bonus DMG.' },
  'Sabercat Reaver':                 { sets: ['Pact of Neonlight Leap', 'Rite of Gilded Revelation', 'Sound of True Name'], buff: 'Fusion DMG', desc: 'A fierce feline combatant from Lahai-Roi. Skill summons Sabercat Reaver to perform a spinning claw assault dealing 48% Fusion DMG x4, finishing with a fiery bite for 96% Fusion DMG. On hit, reduces target Fusion RES by 10% for 8s.' },
  'Spacetrek Explorer':              { sets: ['Halo of Starry Radiance', 'Chromatic Foam', 'Sound of True Name'], buff: 'Healing', desc: 'A spacefaring support unit from the Spacetrek Collective. Skill summons Spacetrek Explorer to deploy a Repair Field lasting 6s, healing all team members for 2.0% Max HP + 120 per second. On deployment, grants +15% ATK to nearby allies for 10s.' },
  'Flora Reindeer':                  { sets: ['Rite of Gilded Revelation'], buff: 'Aero DMG', desc: 'A gentle reindeer-like creature from Lahai-Roi. Skill summons Flora Reindeer to charge forward scattering pollen for 145% Aero DMG, then kick up a Bloom Gust dealing 123% Aero DMG to enemies behind.' },
  'Windlash Coleoid':                { sets: ['Rite of Gilded Revelation'], buff: 'Aero DMG', desc: 'A wind-infused cephalopod creature. Skill summons Windlash Coleoid to lash out with 4 tentacle strikes dealing 36% Aero DMG each, then release a pressurized gust for 144% Aero DMG that knocks enemies back.' },
  'Frostbite Coleoid':               { sets: ['Halo of Starry Radiance'], buff: 'Glacio DMG', desc: 'A frost-infused cephalopod creature. Skill summons Frostbite Coleoid to spray a freezing ink cloud dealing 57% Glacio DMG x3, then constrict a target for 117% Glacio DMG. Ink cloud lingers for 3s, slowing enemies by 30%.' },
  'Glommoth':                        { sets: ['Trailblazing Star'], buff: 'Glacio DMG', desc: 'A glowing moth-like creature from Lahai-Roi. Skill summons Glommoth to scatter luminous frost scales dealing 28% Glacio DMG x8. Scales linger on the ground for 4s, detonating when enemies step on them for 35% Glacio DMG each.' },
  'Ironhoof':                        { sets: ['Pact of Neonlight Leap'], buff: 'Fusion DMG', desc: 'A heavy hoofed beast from Lahai-Roi. Skill summons Ironhoof to stampede forward dealing 168% Fusion DMG, then rear up and slam down with molten hooves for 120% Fusion DMG. Slam creates a lava pool lasting 3s dealing 17% Fusion DMG per tick.' },
  'Mining Reindeer':                 { sets: ['Pact of Neonlight Leap'], buff: 'Electro DMG', desc: 'A reindeer-like creature used in mining operations. Skill summons Mining Reindeer to charge forward with electrified antlers dealing 145% Electro DMG, then discharge a static pulse for 72% Electro DMG x2. Struck enemies are Shocked for 4s.' },
  'Reminiscence - Kronaclaw':         { sets: ['Trailblazing Star', 'Chromatic Foam'], buff: 'Aero DMG', desc: 'A reminiscence of the fearsome Kronaclaw. Skill summons Reminiscence: Kronaclaw to perform a diving slash for 168% Aero DMG, then follow up with 3 wind-claw swipes dealing 40% Aero DMG each. Final swipe launches enemies airborne.' },
  'Kronablight':                     { sets: ['Trailblazing Star', 'Chromatic Foam'], buff: 'Electro DMG', desc: 'A blighted variant of the Kronaclaw. Skill summons Kronablight to slam the ground with electrified claws dealing 192% Electro DMG, releasing 3 lightning bolts that chain between enemies for 36% Electro DMG each.' },
  'Pilgrim\'s Shell':                { sets: ['Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Aero DMG', desc: 'A shell-bearing pilgrim creature. Skill summons Pilgrim\'s Shell to retract into its shell and spin forward dealing 48% Aero DMG x4, then pop out with a shockwave for 96% Aero DMG. Spinning hits pull nearby enemies inward.' },
  'Kerasaur':                        { sets: ['Windward Pilgrimage', 'Flaming Clawprint', "Flamewing's Shadow"], buff: 'Aero DMG', desc: 'A horned saurian from the Sanguis Plateaus. Skill summons Kerasaur to gore enemies with a charging headbutt for 192% Aero DMG, then sweep its tail for 96% Aero DMG in a wide arc behind it.' },
  'Hurriclaw':                       { sets: ['Tidebreaking Courage', 'Gusts of Welkin', 'Crown of Valor'], buff: 'Aero DMG', desc: 'A wind-wielding claw beast. Skill summons Hurriclaw to unleash a 5-hit claw flurry dealing 34% Aero DMG each, finishing with a tornado uppercut for 118% Aero DMG that launches enemies.' },
  'Nightmare: Viridblaze Saurian':   { sets: ["Flamewing's Shadow"], buff: 'Fusion DMG', desc: 'A nightmare variant of the fire-breathing saurian. Skill summons Nightmare: Viridblaze Saurian to unleash an enhanced flame breath dealing 24% Fusion DMG x8, then spit a magma glob for 96% Fusion DMG that leaves a burning zone for 4s.' },
  'Nightmare: Violet-Feathered Heron': { sets: ['Crown of Valor'], buff: 'Electro DMG', desc: 'A nightmare variant of the purple-winged heron. Skill transforms into a Parry Stance; counterattack deals 288% Electro DMG. If attacked during parry, counters early with a thunderbolt wing slash and recovers 5 Concerto Energy.' },
  'Nightmare: Cyan-Feathered Heron': { sets: ['Law of Harmony'], buff: 'Aero DMG', desc: 'A nightmare variant of the cyan-winged heron. Skill transforms into a Parry Stance; counterattack deals 272% Aero DMG. If attacked during parry, counters early with a gale-force wing slash and recovers 5 Concerto Energy.' },
  'Nightmare: Roseshroom':           { sets: ['Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A nightmare variant of the dark fungal creature. Skill summons Nightmare: Roseshroom to fire an enhanced spore beam dealing 48% Havoc DMG x5, then detonate spore clouds on hit targets for 68% Havoc DMG.' },
  'Nightmare: Tambourinist':         { sets: ['Dream of the Lost'], buff: 'Havoc DMG', desc: 'A nightmare variant of the rhythmic sound-weaponizer. Skill summons Nightmare: Tambourinist to beat a havoc-infused rhythm dealing 72% Havoc DMG x3. Each beat applies a Dissonance stack; at 3 stacks enemies take 96% bonus Havoc DMG.' },
  'Diurnus Knight':                  { sets: ['Eternal Radiance', 'Tidebreaking Courage'], buff: 'Spectro DMG', desc: 'A daytime knight of the Order. Skill summons Diurnus Knight to deliver a radiant sword combo: 2 slashes at 84% Spectro DMG each, followed by a piercing thrust for 120% Spectro DMG. Hits on shielded enemies deal +30% bonus DMG.' },
  'Nocturnus Knight':                { sets: ['Midnight Veil', 'Empyrean Anthem'], buff: 'Havoc DMG', desc: 'A nighttime knight of the Order. Skill summons Nocturnus Knight to perform a shadow-step slash for 168% Havoc DMG, then plant a Dark Sigil on hit enemies that detonates after 2s for 120% Havoc DMG.' },
  'Questless Knight':                { sets: ['Frosty Resolve', 'Midnight Veil'], buff: 'Electro DMG', desc: 'A wandering knight without a quest. Skill summons Questless Knight to hurl an electrified lance dealing 144% Electro DMG, which chains lightning to up to 3 nearby enemies for 48% Electro DMG each.' },
  'Abyssal Gladius':                 { sets: ['Midnight Veil', 'Tidebreaking Courage', 'Thread of Severed Fate'], buff: 'Glacio DMG', desc: 'A blade-wielding warrior from the abyss. Skill summons Abyssal Gladius to execute a 3-hit frost blade combo dealing 72%/72%/144% Glacio DMG. The final strike creates an ice fissure that persists for 3s dealing 24% Glacio DMG per tick.' },
  'Abyssal Patricius':               { sets: ['Frosty Resolve', 'Empyrean Anthem'], buff: 'Glacio DMG', desc: 'A noble warrior from the abyss. Skill summons Abyssal Patricius to conjure a frost barrier that blocks projectiles for 3s, then shatter it outward dealing 240% Glacio DMG to all enemies in range. Blocked attacks increase shatter DMG by 15% each.' },
  'Rage Against the Statue':         { sets: ['Eternal Radiance', 'Gusts of Welkin', 'Law of Harmony'], buff: 'Spectro DMG', desc: 'An animated statue filled with rage. Skill summons Rage Against the Statue to slam both fists downward dealing 192% Spectro DMG, sending shockwaves outward dealing 48% Spectro DMG x2. Enemies hit are staggered for 1.5s.' },
  'Vitreum Dancer':                  { sets: ['Eternal Radiance', 'Empyrean Anthem'], buff: 'Electro DMG', desc: 'A glass-like dancer that channels electricity. Skill summons Vitreum Dancer to perform a pirouette releasing 6 crystal shards dealing 32% Electro DMG each. Shards converge after 1.5s dealing 96% Electro DMG at the focal point.' },
  'Cuddle Wuddle':                   { sets: ['Frosty Resolve', 'Midnight Veil'], buff: 'Physical DMG', desc: 'A deceptively cuddly creature. Skill summons Cuddle Wuddle to lunge and bear-hug the target dealing 144% Physical DMG with a 2s bind, then body-slam for 144% Physical DMG. Bound enemies cannot dodge.' },
  'Chop Chop':                       { sets: ['Empyrean Anthem', 'Tidebreaking Courage', 'Dream of the Lost'], buff: 'Fusion DMG', desc: 'A multi-armed chopping construct. Skill summons Chop Chop to rapidly chop with all arms dealing 36% Fusion DMG x6, then combine arms for an overhead cleave dealing 144% Fusion DMG. If all 6 chops connect, cleave DMG is doubled.' },
  'Lightcrusher':                    { sets: ['Celestial Light'], buff: 'Spectro DMG', desc: 'A light-infused crushing construct. Skill summons Lightcrusher to charge up and slam a radiant hammer down for 216% Spectro DMG. Hold to extend charge for up to +50% bonus DMG. Fully charged slam creates a light pillar dealing 72% Spectro DMG to nearby enemies.' },
  'Rocksteady Guardian':             { sets: ['Celestial Light', 'Rejuvenating Glow'], buff: 'Spectro DMG', desc: 'A steadfast rock guardian. Skill summons Rocksteady Guardian to plant a Luminous Ward lasting 8s that grants nearby allies a shield absorbing DMG equal to 15% of caster Max HP. Ward pulses every 2s dealing 36% Spectro DMG to nearby enemies.' },
  // ── 1-Cost Echoes ──
  'Electro Predator':                { sets: ['Molten Rift', 'Void Thunder'], buff: 'Electro DMG', desc: 'A nimble humanoid Tacet Discord with electrical projectiles. Skill summons Electro Predator to shoot 5 times: first 4 deal 17% Electro DMG, last deals 46% Electro DMG.' },
  'Fusion Dreadmane':                { sets: ['Molten Rift', 'Rejuvenating Glow'], buff: 'Fusion DMG', desc: 'A fiery lion-like Howler Tacet Discord. Skill summons Fusion Dreadmane to fiercely strike the enemy dealing 32% + 64 Fusion DMG.' },
  'Lava Larva':                      { sets: ['Molten Rift', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'A small molten creature that persistently burns. Skill summons Lava Larva to continuously attack enemies dealing 38% Fusion DMG per hit. Disappears when summoner switches out or moves too far.' },
  'Whiff Whaff':                     { sets: ['Sierra Gale', 'Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Aero DMG', desc: 'A hovering humanoid TD that manipulates wind. Skill summons Whiff Whaff for an air explosion (51% Aero DMG) creating a Low-pressure Zone that pulls enemies in for 2s, dealing 19% Aero DMG up to 6 times.' },
  'Cruisewing':                      { sets: ['Celestial Light', 'Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Healing', desc: 'A gentle avian Tacet Discord. Skill summons Cruisewing to heal all team members for 1.8% Max HP + 80 HP, up to 4 times.' },
  'Chirpuff':                        { sets: ['Sierra Gale', 'Havoc Eclipse'], buff: 'Aero DMG', desc: 'A small puffball creature that inflates with air. Skill summons Chirpuff to blast a powerful gust forward 3 times, each dealing 38% Aero DMG and pushing enemies back.' },
  'Fusion Warrior':                  { sets: ['Molten Rift', 'Void Thunder', 'Sierra Gale'], buff: 'Fusion DMG', desc: 'A humanoid Tacet Discord wreathed in flames. Skill transforms into Fusion Warrior to perform a Counterattack. Successful counter reduces cooldown by 70% and deals 288% Fusion DMG.' },
  'Havoc Warrior':                   { sets: ['Celestial Light', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A humanoid Tacet Discord wreathed in Havoc energy. Skill transforms into Havoc Warrior to perform a Counterattack. Successful counter reduces cooldown by 70% and deals 288% Havoc DMG.' },

  'Snip Snap':                       { sets: ['Molten Rift', 'Rejuvenating Glow', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'An immature humanoid TD that exudes small amounts of magma. Skill summons Snip Snap to throw fireballs dealing 32% + 64 Fusion DMG on hit.' },
  'Zig Zag':                         { sets: ['Celestial Light', 'Moonlit Clouds', 'Lingering Tunes'], buff: 'Spectro DMG', desc: 'An immature humanoid TD that emits focused light rays with a "zig zag" sound. Skill summons Zig Zag to detonate Spectro energy dealing 48% + 96 Spectro DMG, creating a Stagnation Zone for 1.8s.' },
  'Hooscamp':                        { sets: ['Sierra Gale', 'Lingering Tunes'], buff: 'Aero DMG', desc: 'A small primate-like Tacet Discord. Skill transforms into Hooscamp Flinger and pounces at enemies dealing 48% + 96 Aero DMG.' },
  'Fusion Prism':                    { sets: ['Freezing Frost', 'Molten Rift', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'A mineral TD filled with thermal energy. Skill summons Fusion Prism to fire a crystal shard dealing 32% + 64 Fusion DMG.' },
  'Glacio Prism':                    { sets: ['Freezing Frost', 'Havoc Eclipse', 'Moonlit Clouds'], buff: 'Glacio DMG', desc: 'A mineral TD filled with freezing energy. Skill summons Glacio Prism to fire 3 crystal shards, each dealing 38% Glacio DMG.' },
  'Aero Prism':                      { sets: ['Tidebreaking Courage', 'Eternal Radiance'], buff: 'Aero DMG', desc: 'A mineral TD filled with powerful air currents. Skill summons Aero Prism to attack enemies dealing 19% Aero DMG.' },
  'Havoc Prism':                     { sets: ['Void Thunder', 'Celestial Light', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A mineral TD filled with Havoc energy. Skill summons Havoc Prism to fire 5 crystal shards, each dealing 23% Havoc DMG.' },
  'Spectro Prism':                   { sets: ['Molten Rift', 'Void Thunder', 'Celestial Light'], buff: 'Spectro DMG', desc: 'A mineral TD that emits Spectro light to buff nearby allies. Skill summons Spectro Prism to emit a laser hitting up to 8 times for 14% Spectro DMG each.' },
  'Baby Viridblaze Saurian':         { sets: ['Molten Rift', 'Void Thunder', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'A small amphibian-like creature found in forests. Skill transforms into Baby Viridblaze Saurian to rest in place and slowly restore HP.' },
  'Young Roseshroom':                { sets: ['Sierra Gale', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A young fungal Tacet Discord. Skill summons Baby Roseshroom to fire a laser dealing 32% + 64 Havoc DMG.' },
  'Clang Bang':                      { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'An immature humanoid TD with ice crystals that make a "clang bang" sound. Skill summons Clang Bang that follows the enemy and self-combusts, dealing 32% + 64 Glacio DMG.' },
  'Dwarf Cassowary':                 { sets: ['Sierra Gale', 'Rejuvenating Glow'], buff: 'Physical DMG', desc: 'A small flightless bird-like Tacet Discord. Skill summons Dwarf Cassowary to track and attack the enemy dealing 38% Physical DMG x3.' },
  'Excarat':                         { sets: ['Freezing Frost', 'Havoc Eclipse'], buff: 'Physical DMG', desc: 'A burrowing rodent-like Tacet Discord. Skill transforms into Excarat and tunnels underground to advance, immune to damage while burrowed. Can change direction freely.' },
  'Lottie Lost':                     { sets: ['Tidebreaking Courage', 'Frosty Resolve'], buff: 'Spectro DMG', desc: 'A small whimsical Tacet Discord that wanders aimlessly. Skill summons Lottie Lost to attack enemies dealing 129% Spectro DMG.' },
  'Chest Mimic':                     { sets: ['Empyrean Anthem', 'Frosty Resolve', 'Midnight Veil'], buff: 'Spectro DMG', desc: 'A deceptive Tacet Discord disguised as a treasure chest. Skill summons Chest Mimic to attack with 3 consecutive strikes, each dealing 64% Spectro DMG.' },
  'Aero Predator':                   { sets: ['Void Thunder', 'Sierra Gale'], buff: 'Aero DMG', desc: 'A nimble humanoid Tacet Discord that fires air projectiles. Skill summons Aero Predator to shoot 5 times: first 4 deal 17% Aero DMG, last deals 46% Aero DMG.' },
  'Glacio Predator':                 { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'A nimble humanoid Tacet Discord that fires ice projectiles. Skill summons Glacio Predator to shoot 5 times: first 4 deal 17% Glacio DMG, last deals 46% Glacio DMG.' },
  'Gulpuff':                         { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'A bubble-blowing Tacet Discord. Skill summons Gulpuff to blow 3 frost bubbles that float toward enemies, each dealing 38% Glacio DMG on contact and slowing targets by 15% for 2s.' },
  'Aero Drake':                      { sets: ['Tidebreaking Courage', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Aero DMG', desc: 'A wind-elemental drake. Skill summons Aero Drake to swoop forward dealing 48% Aero DMG, then flap its wings to release a gust dealing 48% Aero DMG and knocking enemies back.' },
  'Electro Drake':                   { sets: ['Midnight Veil', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Electro DMG', desc: 'A lightning-elemental drake. Skill summons Electro Drake to swoop forward dealing 48% Electro DMG, then discharge a bolt from its jaws dealing 48% Electro DMG that chains to 1 nearby enemy.' },
  'Fusion Drake':                    { sets: ['Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Fusion DMG', desc: 'A fire-elemental drake. Skill summons Fusion Drake to swoop forward dealing 48% Fusion DMG, then breathe a flame jet dealing 24% Fusion DMG x3.' },
  'Glacio Drake':                    { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Glacio DMG', desc: 'An ice-elemental drake. Skill summons Glacio Drake to swoop forward dealing 48% Glacio DMG, then exhale a frost blast dealing 48% Glacio DMG with a 20% chance to freeze for 1.5s.' },
  'Havoc Drake':                     { sets: ['Windward Pilgrimage', 'Flaming Clawprint', 'Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A havoc-elemental drake. Skill summons Havoc Drake to swoop forward dealing 48% Havoc DMG, then release a corrosive orb dealing 48% Havoc DMG that reduces enemy Havoc RES by 5% for 6s.' },
  'Spectro Drake':                   { sets: ['Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Spectro DMG', desc: 'A spectro-elemental drake. Skill summons Spectro Drake to swoop forward dealing 48% Spectro DMG, then fire a light beam dealing 48% Spectro DMG in a line.' },
  'Devotee\'s Flesh':                { sets: ['Gusts of Welkin', 'Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Aero DMG', desc: 'A devout creature born of fanatical devotion. Skill summons Devotee\'s Flesh to lunge forward with a wind-infused strike dealing 64% Aero DMG, then self-detonate for 32% Aero DMG in an area.' },
  'Sacerdos':                        { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Aero DMG', desc: 'A priestly creature that chants wind hymns. Skill summons Sacerdos to release a spiraling wind prayer dealing 32% Aero DMG x3, healing the active Resonator for 0.5% Max HP per hit.' },
  'Sagittario':                      { sets: ['Eternal Radiance', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Spectro DMG', desc: 'An archer-like creature that fires arrows of light. Skill summons Sagittario to fire 3 spectral arrows dealing 28% Spectro DMG each, with the last arrow piercing through enemies.' },
  'La Guardia':                      { sets: ['Midnight Veil', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Physical DMG', desc: 'A vigilant guard creature wielding a stone shield. Skill summons La Guardia to bash forward with its shield dealing 64% Physical DMG, then thrust its spear for 32% Physical DMG.' },
  'Calcified Junrock':               { sets: ['Empyrean Anthem', 'Tidebreaking Courage', 'Crown of Valor'], buff: 'Healing', desc: 'A calcified junrock variant hardened by mineral deposits. Skill summons Calcified Junrock to release a restorative pulse, healing the active Resonator for 2.0% Max HP + 80.' },
  'Fission Junrock':                 { sets: ['Void Thunder', 'Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Healing', desc: 'A fission-powered junrock that radiates warm energy. Skill summons Fission Junrock to split into 2 fragments, each healing a nearby ally for 1.5% Max HP + 60 on contact.' },
  'Golden Junrock':                  { sets: ['Frosty Resolve', 'Eternal Radiance', 'Law of Harmony'], buff: 'Spectro DMG', desc: 'A golden junrock variant gleaming with spectral light. Skill summons Golden Junrock to roll into enemies dealing 48% Spectro DMG, then burst in a flash dealing 48% Spectro DMG in an area.' },
  'Vanguard Junrock':                { sets: ['Void Thunder', 'Rejuvenating Glow', 'Lingering Tunes'], buff: 'Physical DMG', desc: 'A vanguard junrock variant armored with rocky plates. Skill summons Vanguard Junrock to charge headfirst into enemies dealing 64% Physical DMG, then spin and scatter debris for 32% Physical DMG.' },
  'Diamondclaw':                     { sets: ['Moonlit Clouds', 'Lingering Tunes'], buff: 'Physical DMG', desc: 'A diamond-clawed creature with razor-sharp crystalline talons. Skill summons Diamondclaw to slash twice dealing 38% Physical DMG each, with a 30% chance to inflict Bleed for 24% Physical DMG over 4s.' },
  'Diggy Duggy':                     { sets: ['Eternal Radiance', 'Tidebreaking Courage'], buff: 'Physical DMG', desc: 'A burrowing creature that attacks from underground. Skill summons Diggy Duggy to tunnel beneath the target and erupt upward dealing 96% Physical DMG, launching hit enemies airborne.' },
  'Fae Ignis':                       { sets: ['Eternal Radiance', 'Midnight Veil', 'Dream of the Lost'], buff: 'Havoc DMG', desc: 'A fairy flame creature flickering with dark fire. Skill summons Fae Ignis to orbit the Resonator for 5s, shooting will-o-wisps at nearby enemies dealing 19% Havoc DMG per hit, up to 5 hits.' },
  'Frostscourge Stalker':            { sets: ['Eternal Radiance', 'Midnight Veil'], buff: 'Glacio DMG', desc: 'A frost-infused stalker that hunts in frozen terrain. Skill summons Frostscourge Stalker to pounce and bite dealing 64% Glacio DMG, then claw twice for 19% Glacio DMG each.' },
  'Voltscourge Stalker':             { sets: ['Midnight Veil', 'Empyrean Anthem'], buff: 'Electro DMG', desc: 'A voltage-infused stalker crackling with static. Skill summons Voltscourge Stalker to pounce and bite dealing 64% Electro DMG, then discharge a shock pulse for 32% Electro DMG in an area.' },
  'Galescourge Stalker':             { sets: ['Frosty Resolve', 'Empyrean Anthem'], buff: 'Aero DMG', desc: 'A gale-infused stalker that moves with the wind. Skill summons Galescourge Stalker to dash through enemies dealing 48% Aero DMG, then circle back for a second pass dealing 48% Aero DMG.' },
  'Hocus Pocus':                     { sets: ['Frosty Resolve', 'Empyrean Anthem'], buff: 'Havoc DMG', desc: 'A magical trickster creature wreathed in dark illusions. Skill summons Hocus Pocus to conjure 3 havoc orbs that home in on enemies, each dealing 32% Havoc DMG on impact.' },
  'Nimbus Wraith':                   { sets: ['Midnight Veil', 'Empyrean Anthem', "Flamewing's Shadow"], buff: 'Healing', desc: 'A cloud-like wraith that drifts through mist. Skill summons Nimbus Wraith to envelope the active Resonator in healing fog for 4s, restoring 1.0% Max HP + 50 per second.' },
  'Hoartoise':                       { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Healing', desc: 'A hoary tortoise creature with a frost-covered shell. Skill summons Hoartoise to retract into its shell and emit a restorative aura, healing the active Resonator for 2.0% Max HP + 80.' },
  'Sabyr Boar':                      { sets: ['Freezing Frost', 'Sierra Gale', 'Moonlit Clouds'], buff: 'Physical DMG', desc: 'A tusked boar creature that charges with reckless force. Skill summons Sabyr Boar to gore enemies with a charging headbutt dealing 96% Physical DMG. Hits from behind deal +25% bonus DMG.' },
  'Traffic Illuminator':             { sets: ['Molten Rift', 'Void Thunder', 'Sierra Gale'], buff: 'Electro DMG', desc: 'A traffic-light-like construct that flashes warning signals. Skill summons Traffic Illuminator to fire 3 colored beams in sequence: red (32% Electro DMG), yellow (32% Electro DMG), green (32% Electro DMG). Red beam staggers enemies.' },
  'Tick Tack':                       { sets: ['Havoc Eclipse', 'Rejuvenating Glow', 'Lingering Tunes'], buff: 'Havoc DMG', desc: 'A clock-like creature whose hands spin erratically. Skill summons Tick Tack to wind up and strike with its clock hands dealing 48% Havoc DMG x2. On the 2nd hit, briefly slows enemy action speed by 10% for 3s.' },
  'Chop Chop: Headless':             { sets: ['Eternal Radiance', 'Tidebreaking Courage'], buff: 'Fusion DMG', desc: 'The headless body of Chop Chop, swinging blindly. Skill summons Chop Chop: Headless to flail its arms wildly dealing 24% Fusion DMG x4 in a wide arc around it.' },
  'Chop Chop: Leftless':             { sets: ['Frosty Resolve', 'Tidebreaking Courage'], buff: 'Spectro DMG', desc: 'Chop Chop missing its left arm, compensating with spectral energy. Skill summons Chop Chop: Leftless to deliver a right-arm overhead chop for 64% Spectro DMG, then fire a spectral bolt from its stump for 32% Spectro DMG.' },
  'Chop Chop: Rightless':            { sets: ['Frosty Resolve', 'Tidebreaking Courage'], buff: 'Havoc DMG', desc: 'Chop Chop missing its right arm, leaking havoc energy. Skill summons Chop Chop: Rightless to deliver a left-arm sweeping slash for 64% Havoc DMG, then release a havoc burst from its stump for 32% Havoc DMG.' },
  'Geospider S4':                    { sets: ['Pact of Neonlight Leap', 'Halo of Starry Radiance', 'Trailblazing Star'], buff: 'Spectro DMG', desc: 'A mechanical spider from Lahai-Roi. Skill summons Geospider S4 to fire a web mine that latches onto enemies dealing 32% Spectro DMG, detonating after 2s for 64% Spectro DMG.' },
  'Flora Drone':                     { sets: ['Pact of Neonlight Leap', 'Rite of Gilded Revelation', 'Sound of True Name'], buff: 'Aero DMG', desc: 'A botanical drone from Lahai-Roi. Skill summons Flora Drone to release pollen that heals the active Resonator for 1.5% Max HP + 60 and grants +10% ATK for 6s.' },
  'Mining Drone':                    { sets: ['Halo of Starry Radiance', 'Rite of Gilded Revelation', 'Sound of True Name'], buff: 'Havoc DMG', desc: 'A mining drone from Lahai-Roi. Skill summons Mining Drone to fire a focused drill beam dealing 19% Havoc DMG x5 to a single target.' },
  'Zip Zap':                         { sets: ['Pact of Neonlight Leap', 'Rite of Gilded Revelation', 'Chromatic Foam'], buff: 'Electro DMG', desc: 'An electrical creature from Lahai-Roi that zips between targets. Skill summons Zip Zap to dash between up to 3 enemies dealing 32% Electro DMG to each, leaving a static trail that shocks followers for 17% Electro DMG.' },
  'Iceglint Dancer':                 { sets: ['Trailblazing Star'], buff: 'Glacio DMG', desc: 'A crystalline dancer that spins on blades of ice. Skill summons Iceglint Dancer to perform a spinning ice kick dealing 48% Glacio DMG, then scatter frost shards dealing 24% Glacio DMG x2.' },
  'Shadow Stepper':                  { sets: ['Trailblazing Star', 'Chromatic Foam'], buff: 'Havoc DMG', desc: 'A shadow-walking creature that phases through darkness. Skill summons Shadow Stepper to teleport behind the target and backstab for 96% Havoc DMG. If the target is facing away, deals +30% bonus DMG.' },
  'Tremor Warrior':                  { sets: ['Halo of Starry Radiance', 'Chromatic Foam', 'Sound of True Name'], buff: 'Electro DMG', desc: 'A tremor-inducing warrior that channels seismic electricity. Skill summons Tremor Warrior to slam the ground dealing 48% Electro DMG x2, sending shockwaves outward for 38% Electro DMG.' },
  'Nightmare: Aero Predator':        { sets: ['Crown of Valor'], buff: 'Aero DMG', desc: 'A nightmare variant of the Aero Predator with enhanced wind projectiles. Skill summons Nightmare: Aero Predator to shoot 5 times: first 4 deal 23% Aero DMG, last deals 57% Aero DMG.' },
  'Nightmare: Electro Predator':     { sets: ['Crown of Valor'], buff: 'Electro DMG', desc: 'A nightmare variant of the Electro Predator with overcharged bolts. Skill summons Nightmare: Electro Predator to shoot 5 times: first 4 deal 23% Electro DMG, last deals 57% Electro DMG.' },
  'Nightmare: Glacio Predator':      { sets: ['Dream of the Lost'], buff: 'Glacio DMG', desc: 'A nightmare variant of the Glacio Predator with piercing ice shards. Skill summons Nightmare: Glacio Predator to shoot 5 times: first 4 deal 23% Glacio DMG, last deals 57% Glacio DMG.' },
  'Nightmare: Baby Roseshroom':      { sets: ["Flamewing's Shadow"], buff: 'Havoc DMG', desc: 'A nightmare variant of the Baby Roseshroom with amplified spores. Skill summons Nightmare: Baby Roseshroom to fire an enhanced laser dealing 48% + 96 Havoc DMG, then release toxic mist for 19% Havoc DMG x2.' },
  'Nightmare: Baby Viridblaze Saurian': { sets: ["Flamewing's Shadow"], buff: 'Fusion DMG', desc: 'A nightmare variant of the Baby Viridblaze Saurian wreathed in dark flame. Skill transforms into the saurian to spit an enhanced fireball dealing 48% + 96 Fusion DMG, leaving a burn patch for 19% Fusion DMG x2.' },
  'Nightmare: Chirpuff':             { sets: ['Law of Harmony'], buff: 'Aero DMG', desc: 'A nightmare variant of Chirpuff overinflated with nightmare wind. Skill summons Nightmare: Chirpuff to blast an enhanced gust 3 times, each dealing 48% Aero DMG and pulling enemies inward.' },
  'Nightmare: Dwarf Cassowary':      { sets: ['Thread of Severed Fate'], buff: 'Physical DMG', desc: 'A nightmare variant of the Dwarf Cassowary with razor-edged feathers. Skill summons Nightmare: Dwarf Cassowary to track and kick the enemy dealing 48% Physical DMG x3.' },
  'Nightmare: Gulpuff':              { sets: ['Law of Harmony'], buff: 'Glacio DMG', desc: 'A nightmare variant of Gulpuff exhaling freezing mist. Skill summons Nightmare: Gulpuff to launch 3 frost bubbles dealing 48% Glacio DMG each. Bubbles explode on contact, freezing enemies for 1s.' },
  'Nightmare: Havoc Warrior':        { sets: ['Dream of the Lost'], buff: 'Havoc DMG', desc: 'A nightmare variant of the Havoc Warrior radiating dark energy. Skill transforms into Nightmare: Havoc Warrior to perform a Counter. Successful counter deals 336% Havoc DMG and reduces enemy Havoc RES by 10% for 5s.' },
  'Nightmare: Tick Tack':            { sets: ['Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A nightmare variant of Tick Tack whose ticking distorts time. Skill summons Nightmare: Tick Tack to swing its pendulum dealing 64% Havoc DMG x2, then chime to slow all nearby enemies by 35% for 3s.' },
};
// [SECTION:ECHO_DMG_DATA] — Per-echo active skill damage multipliers & enemy resistance
// dmg: total ATK% damage multiplier of echo active skill (sum of all hits)
// element: damage element of the echo skill
// enemyRes: elemental resistances when this echo is fought as an enemy boss (4-cost only)
[
  // ── 4-Cost Echoes (Bosses) ──
  ['Mourning Aix', 394, 'Spectro', { spectro: 40 }],
  ['Feilian Beringal', 515, 'Aero', { aero: 40 }],
  ['Tempest Mephis', 0, 'Electro', { electro: 40 }],
  ['Thundering Mephis', 884, 'Electro', { electro: 40 }],
  ['Inferno Rider', 808, 'Fusion', { fusion: 40 }],
  ['Bell-Borne Geochelone', 0, 'Glacio', { glacio: 40 }],
  ['Impermanence Heron', 0, 'Havoc', { havoc: 40 }],
  ['Lampylumen Myriad', 687, 'Glacio', { glacio: 40 }],
  ['Mech Abomination', 529, 'Electro', { electro: 40 }],
  ['Crownless', 670, 'Havoc', { havoc: 40 }],
  ['Jué', 243, 'Spectro', { spectro: 40 }],
  ['Fallacy of No Return', 0, 'Spectro', { spectro: 40 }],
  ['Sentry Construct', 405, 'Glacio', { glacio: 40 }],
  ['Dreamless', 541, 'Havoc', { havoc: 40 }],
  ['Nightmare: Impermanence Heron', 405, 'Havoc', { havoc: 40 }],
  ['Nightmare: Lampylumen Myriad', 274, 'Glacio', { glacio: 40 }],
  ['Dragon of Dirge', 0, 'Fusion', { fusion: 40 }],
  ['Nightmare: Hecate', 457, 'Havoc', { havoc: 40 }],
  ['Hecate', 0, 'Havoc', { havoc: 40 }],
  ['Nightmare: Crownless', 405, 'Havoc', { havoc: 40 }],
  ['Nightmare: Mourning Aix', 274, 'Spectro', { spectro: 40 }],
  ['Nightmare: Feilian Beringal', 274, 'Aero', { aero: 40 }],
  ['Nightmare: Inferno Rider', 405, 'Fusion', { fusion: 40 }],
  ['Nightmare: Tempest Mephis', 265, 'Electro', { electro: 40 }],
  ['Nightmare: Thundering Mephis', 405, 'Electro', { electro: 40 }],
  ['Reminiscence: Fleurdelys', 356, 'Aero', { aero: 40 }],
  ['Lioness of Glory', 274, 'Fusion', { fusion: 40 }],
  ['The False Sovereign', 221, 'Electro', { electro: 40 }],
  ['Lady of the Sea', 301, 'Aero', { aero: 40 }],
  ['Corrosaurus', 274, 'Fusion', { fusion: 40 }],
  ['Reminiscence: Threnodian - Leviathan', 264, 'Havoc', { havoc: 40 }],
  ['Hyvatia', 274, 'Spectro', { spectro: 40 }],
  ['Twin Nova - Nebulous Cannon', 161, 'Spectro', { spectro: 40 }],
  ['Sigillum', 274, 'Fusion', { fusion: 40 }],
  ['Reactor Husk', 351, 'Fusion', { fusion: 40 }],
  ['Nameless Explorer', 274, 'Aero', { aero: 40 }],
  ['Lorelei', 405, 'Havoc', { havoc: 40 }],
  ['Nightmare: Kelpie', 405, 'Glacio', { glacio: 40 }],
  ['Reminiscence: Fenrico', 274, 'Aero', { aero: 40 }],
  ['Capitaneus', 357, 'Spectro', null],
  // ── 3-Cost Echoes (Elites) ──
  ['Havoc Dreadmane', 311, 'Havoc', null],
  ['Lumiscale Construct', 0, 'Glacio', null],
  ['Tambourinist', 0, 'Havoc', null],
  ['Spearback', 171, 'Physical', null],
  ['Carapace', 280, 'Aero', null],
  ['Roseshroom', 171, 'Havoc', null],
  ['Violet-Feathered Heron', 288, 'Electro', null],
  ['Cyan-Feathered Heron', 237, 'Aero', null],
  ['Flautist', 533, 'Electro', null],
  ['Hoochief', 268, 'Aero', null],
  ['Stonewall Bracer', 282, 'Physical', null],
  ['Autopuppet Scout', 272, 'Glacio', null],
  ['Viridblaze Saurian', 171, 'Fusion', null],
  ['Glacio Dreadmane', 0, 'Glacio', null],
  ['Chasm Guardian', 274, 'Havoc', null],
  ['Abyssal Mercator', 268, 'Glacio', null],
  ['Twin Nova - Collapsar Blade', 0, 'Electro', null],
  ['Sabercat Prowler', 193, 'Fusion', null],
  ['Sabercat Reaver', 193, 'Fusion', null],
  ['Spacetrek Explorer', 0, 'Healing', null],
  ['Flora Reindeer', 193, 'Aero', null],
  ['Windlash Coleoid', 268, 'Aero', null],
  ['Frostbite Coleoid', 193, 'Glacio', null],
  ['Glommoth', 274, 'Glacio', null],
  ['Ironhoof', 268, 'Fusion', null],
  ['Mining Reindeer', 238, 'Electro', null],
  ['Reminiscence - Kronaclaw', 268, 'Aero', null],
  ['Kronablight', 268, 'Electro', null],
  ["Pilgrim's Shell", 268, 'Aero', null],
  ['Kerasaur', 536, 'Aero', null],
  ['Hurriclaw', 313, 'Aero', null],
  ['Nightmare: Viridblaze Saurian', 171, 'Fusion', null],
  ['Nightmare: Violet-Feathered Heron', 288, 'Electro', null],
  ['Nightmare: Cyan-Feathered Heron', 237, 'Aero', null],
  ['Nightmare: Roseshroom', 171, 'Havoc', null],
  ['Nightmare: Tambourinist', 0, 'Havoc', null],
  ['Diurnus Knight', 268, 'Spectro', null],
  ['Nocturnus Knight', 268, 'Havoc', null],
  ['Questless Knight', 313, 'Electro', null],
  ['Abyssal Gladius', 268, 'Glacio', null],
  ['Abyssal Patricius', 268, 'Glacio', null],
  ['Rage Against the Statue', 313, 'Spectro', null],
  ['Vitreum Dancer', 313, 'Electro', null],
  ['Cuddle Wuddle', 313, 'Physical', null],
  ['Chop Chop', 193, 'Fusion', null],
  ['Lightcrusher', 226, 'Spectro', null],
  ['Rocksteady Guardian', 0, 'Spectro', null],
  // ── 1-Cost Echoes ──
  ['Electro Predator', 115, 'Electro', null],
  ['Fusion Dreadmane', 0, 'Fusion', null],
  ['Lava Larva', 0, 'Fusion', null],
  ['Whiff Whaff', 171, 'Aero', null],
  ['Cruisewing', 0, 'Healing', null],
  ['Chirpuff', 115, 'Aero', null],
  ['Fusion Warrior', 0, 'Fusion', null],
  ['Havoc Warrior', 515, 'Havoc', null],
  ['Snip Snap', 0, 'Fusion', null],
  ['Zig Zag', 0, 'Spectro', null],
  ['Hooscamp', 0, 'Aero', null],
  ['Fusion Prism', 0, 'Fusion', null],
  ['Glacio Prism', 115, 'Glacio', null],
  ['Aero Prism', 19, 'Aero', null],
  ['Havoc Prism', 115, 'Havoc', null],
  ['Spectro Prism', 115, 'Spectro', null],
  ['Baby Viridblaze Saurian', 0, 'Healing', null],
  ['Young Roseshroom', 0, 'Havoc', null],
  ['Clang Bang', 0, 'Glacio', null],
  ['Dwarf Cassowary', 115, 'Physical', null],
  ['Excarat', 0, 'Physical', null],
  ['Lottie Lost', 130, 'Spectro', null],
  ['Chest Mimic', 193, 'Spectro', null],
  ['Aero Predator', 86, 'Aero', null],
  ['Glacio Predator', 115, 'Glacio', null],
  ['Gulpuff', 115, 'Glacio', null],
  ['Aero Drake', 130, 'Aero', null],
  ['Electro Drake', 130, 'Electro', null],
  ['Fusion Drake', 78, 'Fusion', null],
  ['Glacio Drake', 130, 'Glacio', null],
  ['Havoc Drake', 389, 'Havoc', null],
  ['Spectro Drake', 130, 'Spectro', null],
  ["Devotee's Flesh", 130, 'Aero', null],
  ['Sacerdos', 130, 'Aero', null],
  ['Sagittario', 268, 'Spectro', null],
  ['La Guardia', 804, 'Physical', null],
  ['Calcified Junrock', 0, 'Healing', null],
  ['Fission Junrock', 0, 'Healing', null],
  ['Golden Junrock', 130, 'Spectro', null],
  ['Vanguard Junrock', 0, 'Physical', null],
  ['Diamondclaw', 0, 'Physical', null],
  ['Diggy Duggy', 268, 'Physical', null],
  ['Fae Ignis', 130, 'Havoc', null],
  ['Frostscourge Stalker', 130, 'Glacio', null],
  ['Voltscourge Stalker', 130, 'Electro', null],
  ['Galescourge Stalker', 0, 'Aero', null],
  ['Hocus Pocus', 130, 'Havoc', null],
  ['Nimbus Wraith', 0, 'Healing', null],
  ['Hoartoise', 0, 'Healing', null],
  ['Sabyr Boar', 0, 'Physical', null],
  ['Traffic Illuminator', 0, 'Electro', null],
  ['Tick Tack', 171, 'Havoc', null],
  ['Chop Chop: Headless', 130, 'Fusion', null],
  ['Chop Chop: Leftless', 130, 'Spectro', null],
  ['Chop Chop: Rightless', 130, 'Havoc', null],
  ['Geospider S4', 130, 'Spectro', null],
  ['Flora Drone', 65, 'Healing', null],
  ['Mining Drone', 205, 'Havoc', null],
  ['Zip Zap', 130, 'Electro', null],
  ['Iceglint Dancer', 205, 'Glacio', null],
  ['Shadow Stepper', 130, 'Havoc', null],
  ['Tremor Warrior', 205, 'Electro', null],
  ['Nightmare: Aero Predator', 86, 'Aero', null],
  ['Nightmare: Electro Predator', 115, 'Electro', null],
  ['Nightmare: Glacio Predator', 115, 'Glacio', null],
  ['Nightmare: Baby Roseshroom', 0, 'Havoc', null],
  ['Nightmare: Baby Viridblaze Saurian', 0, 'Fusion', null],
  ['Nightmare: Chirpuff', 115, 'Aero', null],
  ['Nightmare: Dwarf Cassowary', 115, 'Physical', null],
  ['Nightmare: Gulpuff', 115, 'Glacio', null],
  ['Nightmare: Havoc Warrior', 515, 'Havoc', null],
  ['Nightmare: Tick Tack', 171, 'Havoc', null],
].forEach(([name, dmg, element, enemyRes]) => {
  if (ECHO_DATA[name]) Object.assign(ECHO_DATA[name], { dmg, element, ...(enemyRes && { enemyRes }) });
});

// All unique echo sonata sets (for filter dropdown, includes sets beyond ECHO_SETS)
const ALL_ECHO_SONATA_SETS = [...new Set(Object.values(ECHO_DATA).flatMap(e => e.sets))].sort();
const ALL_ECHO_BUFF_TYPES = [...new Set(Object.values(ECHO_DATA).flatMap(e => Array.isArray(e.buff) ? e.buff : [e.buff]))].sort();

// [SECTION:WEAPON_DATA]
const WEAPON_DATA = {
  // 5★ Weapons
  'Verdant Summit': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Jiyan signature. Verdant blade that commands the wind. Heavy ATK hits boost Resonance Skill DMG.',
    passive: 'Heavy Attack hits grant Resonance Skill DMG +20%', pv: { heavyDmg: 20 }, bestFor: ['Jiyan'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Lustrous Razor': { rarity: 5, type: 'Broadblade', stat: 'ATK%', baseAtk: 587, subStatValue: '+36.4%',
    desc: 'Standard 5★. Razor honed to a lustrous edge. ATK buff with Electro DMG on combo finisher.',
    passive: 'ATK +12%, Electro DMG +12% on combo finisher', pv: { atkPct: 12, elemDmg: 12 }, bestFor: ['Calcharo'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Emerald of Genesis': { rarity: 5, type: 'Sword', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Standard 5★. Jade-forged sword of ancient origin. Stacking ATK buff on Resonance Skill use.',
    passive: 'Resonance Skill use grants ATK +12%', pv: { atkPct: 12 }, bestFor: ['Danjin', 'Yangyang'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Static Mist': { rarity: 5, type: 'Pistols', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Standard 5★. Pistols wreathed in lingering mist. Energy Regen with ATK boost at full energy.',
    passive: 'Energy Regen +12%, ATK +12% when full energy', pv: { atkPct: 12 }, bestFor: ['Mortefi', 'Aalto'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Abyss Surges': { rarity: 5, type: 'Gauntlets', stat: 'ATK%', baseAtk: 587, subStatValue: '+36.4%',
    desc: 'Standard 5★. Gauntlets surging with abyssal power. Stacking ATK buff based on energy consumed.',
    passive: 'ATK +8% per 10 energy consumed, max 4 stacks', pv: { atkPct: 32 }, bestFor: ['Jianxin', 'Lingyang'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Cosmic Ripples': { rarity: 5, type: 'Rectifier', stat: 'ATK%', baseAtk: 500, subStatValue: '+53.9%',
    desc: 'Standard 5★. Rectifier resonating with cosmic ripples. Stacking Basic ATK DMG buff on hit.',
    passive: 'Basic Attack DMG +12%, stacks on hit', pv: { basicDmg: 12 }, bestFor: ['Encore', 'Verina'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Stringmaster': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+35.9%',
    desc: 'Yinlin signature. Strings that orchestrate fate itself. Boosts Resonance Skill DMG and Crit Rate.',
    passive: 'Resonance Skill DMG +24%, Crit Rate +8%', pv: { skillDmg: 24, critRate: 8 }, bestFor: ['Yinlin'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Ages of Harvest': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Jinhsi signature. Blade forged from ages of harvest and resolve. Boosts Spectro and Liberation DMG.',
    passive: 'Spectro DMG +12%, Liberation DMG +24%', pv: { elemDmg: 12, libDmg: 24 }, bestFor: ['Jinhsi'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Blazing Brilliance': { rarity: 5, type: 'Sword', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Changli signature. Sword ablaze with undying brilliance. Boosts Fusion and Resonance Skill DMG.',
    passive: 'Fusion DMG +12%, Resonance Skill +24%', pv: { elemDmg: 12, skillDmg: 24 }, bestFor: ['Changli'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Rime-Draped Sprouts': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG', baseAtk: 500, subStatValue: '+72.0%',
    desc: 'Zhezhi signature. Frost-kissed sprouts that bloom in stillness. Boosts off-field and Glacio DMG.',
    passive: 'Off-field DMG +24%, Glacio DMG +12%', pv: { elemDmg: 12, skillDmg: 24 }, bestFor: ['Zhezhi'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  "Verity's Handle": { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Xiangli Yao signature. Handle that unlocks the truth of verity. Boosts Electro and Mech form DMG.',
    passive: 'Electro DMG +12%, Mech form +24%', pv: { elemDmg: 12, skillDmg: 24 }, bestFor: ['Xiangli Yao'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Stellar Symphony': { rarity: 5, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 412, subStatValue: '+77.0%',
    desc: 'Shorekeeper signature. Symphony echoing across the stellar sea. Massive Energy Regen with team ATK buff.',
    passive: 'Energy Regen +20%, team ATK buff +20%', pv: {}, tv: { atkPct: 20, duration: 99 }, bestFor: ['Shorekeeper'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Red Spring': { rarity: 5, type: 'Sword', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Camellya signature. Crimson blade blooming like a red spring flower. Boosts Havoc and Skill DMG.',
    passive: 'Havoc DMG +12%, Skill DMG +24%', pv: { elemDmg: 12, skillDmg: 24 }, bestFor: ['Camellya'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'The Last Dance': { rarity: 5, type: 'Pistols', stat: 'Crit DMG', baseAtk: 500, subStatValue: '+72.0%',
    desc: 'Carlotta signature. Elegant pistols for one final, perfect dance. Boosts Glacio and Charged ATK DMG.',
    passive: 'Glacio DMG +12%, Charged ATK +24%', pv: { elemDmg: 12, heavyDmg: 24 }, bestFor: ['Carlotta'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Tragicomedy': { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Roccia signature. Gauntlets born of comedy and tragedy entwined. Boosts team ATK and Outro Skill DMG.',
    passive: 'Team ATK +12%, Outro Skill +24%', pv: {}, tv: { atkPct: 12, duration: 99 }, bestFor: ['Roccia'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Luminous Hymn': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+36.0%',
    desc: 'Phoebe signature. Rectifier crowned in holy light. Boosts Spectro and Card skill DMG.',
    passive: 'Spectro DMG +12%, Card skills +24%', pv: { elemDmg: 12, skillDmg: 24 }, bestFor: ['Phoebe'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Unflickering Valor': { rarity: 5, type: 'Sword', stat: 'Energy Regen', baseAtk: 415, subStatValue: '+77.0%',
    desc: 'Brant signature. Sword of unflickering valor and burning resolve. Boosts Fusion DMG and ATK speed.',
    passive: 'Fusion DMG +12%, ATK speed +10%', pv: { elemDmg: 12 }, bestFor: ['Brant'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Whispers of Sirens': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG', baseAtk: 500, subStatValue: '+72.0%',
    desc: 'Cantarella signature. Rectifier whispering siren songs of ruin. Boosts Havoc and off-field DMG.',
    passive: 'Havoc DMG +12%, Off-field +24%', pv: { elemDmg: 12, skillDmg: 24 }, bestFor: ['Cantarella'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Blazing Justice': { rarity: 5, type: 'Gauntlets', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Zani signature. Gauntlets blazing with righteous justice. Boosts ATK with DEF Ignore and Frazzle Amp.',
    passive: 'ATK +24%, Spectro Frazzle DMG Amp +50%, DEF Ignore +16%', pv: { atkPct: 24, defIgnore: 16 }, bestFor: ['Zani'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Woodland Aria': { rarity: 5, type: 'Pistols', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+36.0%',
    desc: 'Ciaccona signature. Pistols singing a woodland aria of wind and leaves. Boosts Aero DMG with RES shred.',
    passive: 'ATK +12%, Aero DMG +24% on Erosion, Aero RES -16%', pv: { atkPct: 12, elemDmg: 24, resShred: 16 }, bestFor: ['Ciaccona'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  "Defier's Thorn": { rarity: 5, type: 'Sword', stat: 'HP%', baseAtk: 412, subStatValue: '+72.2%',
    desc: 'Cartethyia signature. Thorned sword of a defiant heart. HP scaling with DEF Ignore on Eroded targets.',
    passive: 'HP +24%, DEF Ignore +16% on Aero Eroded targets', pv: { hpPct: 24, defIgnore: 16 }, bestFor: ['Cartethyia'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Wildfire Mark': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Lupa signature. Broadblade marked by wildfire and fury. Boosts Liberation DMG with team Fusion buff.',
    passive: 'ATK +12%, Res. Liberation DMG +24%, team Fusion DMG +24%', pv: { atkPct: 12, libDmg: 24 }, tv: { elemDmg: 24, duration: 99 }, bestFor: ['Lupa'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Lethean Elegy': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Phrolova signature. Rectifier weaving an elegy of forgotten sorrows. Boosts Havoc DMG with team buff.',
    passive: 'Havoc DMG +12%, Team buff +20%', pv: { elemDmg: 12 }, tv: { atkPct: 20, duration: 99 }, bestFor: ['Phrolova'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Thunderflare Dominion': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate', baseAtk: 675, subStatValue: '+12.1%',
    desc: 'Augusta signature. Broadblade crackling with thunderflare dominion. Boosts Electro and Heavy ATK DMG.',
    passive: 'Electro DMG +12%, Heavy ATK +24%', pv: { elemDmg: 12, heavyDmg: 24 }, bestFor: ['Augusta'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  "Moongazer's Sigil": { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+36.0%',
    desc: 'Iuno signature. Gauntlets bearing the sigil of moonlit prophecy. Boosts Aero and Time skill DMG.',
    passive: 'Aero DMG +12%, Time skills +24%', pv: { elemDmg: 12, skillDmg: 24 }, bestFor: ['Iuno'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Lux & Umbra': { rarity: 5, type: 'Pistols', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Galbrena signature. Twin pistols of light and shadow entwined. Boosts Fusion and Liberation DMG.',
    passive: 'Fusion DMG +12%, Liberation +24%', pv: { elemDmg: 12, libDmg: 24 }, bestFor: ['Galbrena'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Emerald Sentence': { rarity: 5, type: 'Sword', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Qiuyuan signature. Jade sword passing an emerald sentence on the unjust. Boosts Glacio and Skill DMG.',
    passive: 'Glacio DMG +12%, Skill +24%', pv: { elemDmg: 12, skillDmg: 24 }, bestFor: ['Qiuyuan'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Kumokiri': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+36.0%',
    desc: 'Chisa signature. Mist-veiled blade that severs fog and fate alike. Boosts Liberation and All-Type DMG.',
    passive: 'ATK +12%, Res. Liberation DMG +24%, All-Type DMG +24% at max stacks', pv: { atkPct: 12, libDmg: 24, elemDmg: 24 }, bestFor: ['Chisa'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Spectrum Blaster': { rarity: 5, type: 'Pistols', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Lynae signature. Pistols that blast prismatic light across the spectrum. Boosts Spectro and Charged DMG.',
    passive: 'Spectro DMG +12%, Charged +24%', pv: { elemDmg: 12, heavyDmg: 24 }, bestFor: ['Lynae'],
    ascensionMaterials: { forgery: 'Combustor', common: 'Exoswarm Pendant' } },
  'Starfield Calibrator': { rarity: 5, type: 'Broadblade', stat: 'Energy Regen', baseAtk: 412, subStatValue: '+77.0%',
    desc: 'Mornye signature. Broadblade calibrated to the starfield\'s rhythm. DEF scaling with team Crit DMG buff.',
    passive: 'DEF +32%, Concerto +16, team Crit DMG +40% on heal', pv: { defPct: 32 }, tv: { critDmg: 40, duration: 15 }, bestFor: ['Mornye'],
    ascensionMaterials: { forgery: 'Carved Crystal', common: 'Mech Core' } },
  'Everbright Polestar': { rarity: 5, type: 'Sword', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Aemeath signature. Sword radiating everbright polestar light. DEF Ignore with Fusion RES Ignore.',
    passive: 'All-Attr DMG +12%, DEF Ignore +32%, Fusion RES Ignore +10%', pv: { elemDmg: 12, defIgnore: 32, resShred: 10 }, bestFor: ['Aemeath'],
    ascensionMaterials: { forgery: 'Polarizer', common: 'Exoswarm Pendant' } },
  "Daybreaker's Spine": { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Luuk Herssen signature. Gauntlets forged from a daybreaker\'s spine. Boosts Basic ATK and Spectro DMG.',
    passive: 'ATK +12%, Basic ATK DMG Amp +20%, Spectro DMG +20%, DEF Ignore +10%', pv: { atkPct: 12, elemDmg: 20, basicDmg: 20, defIgnore: 10 }, bestFor: ['Luuk Herssen'],
    ascensionMaterials: { forgery: 'Waveworn Shard', common: 'Mech Core' } },
  // Standard 5★ Weapons (Lustrous Tide pool - v3.0)
  'Radiance Cleaver': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Standard 5★. Synth broadblade of concentrated force. Heavy ATK DMG with stacking ATK buff on hit.',
    passive: 'Heavy ATK DMG +12%, ATK +12% on hit', pv: { heavyDmg: 12, atkPct: 12 }, bestFor: ['Broadblade users'],
    ascensionMaterials: { forgery: 'Carved Crystal', common: 'Mech Core' } },
  'Laser Shearer': { rarity: 5, type: 'Sword', stat: 'Energy Regen', baseAtk: 587, subStatValue: '+38.8%',
    desc: 'Standard 5★. Synth sword that shears away uncertainty. Energy Regen with Skill DMG boost.',
    passive: 'Energy Regen +12%, Res. Skill DMG +12%', pv: { skillDmg: 12 }, bestFor: ['Sword users'],
    ascensionMaterials: { forgery: 'Polarizer', common: 'Exoswarm Pendant' } },
  'Phasic Homogenizer': { rarity: 5, type: 'Pistols', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Standard 5★. Synth pistols of piercing focus. Boosts off-field and Liberation DMG.',
    passive: 'Off-field DMG +12%, Res. Liberation +12%', pv: { skillDmg: 12, libDmg: 12 }, bestFor: ['Pistol users'],
    ascensionMaterials: { forgery: 'Combustor', common: 'Exoswarm Pendant' } },
  'Pulsation Bracer': { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Standard 5★. Synth gauntlets pulsing with decisive surge. Boosts Coordinated ATK with swap-in ATK buff.',
    passive: 'Coordinated ATK +12%, ATK +12% on swap', pv: { atkPct: 12 }, bestFor: ['Gauntlet users'],
    ascensionMaterials: { forgery: 'Waveworn Shard', common: 'Mech Core' } },
  'Boson Astrolabe': { rarity: 5, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 525, subStatValue: '+38.8%',
    desc: 'Standard 5★. Synth rectifier mapping stellar possibilities. Healing bonus with team ATK buff on heal.',
    passive: 'Healing +12%, team ATK +12% on heal', pv: {}, tv: { atkPct: 12, duration: 15 }, bestFor: ['Rectifier users'],
    ascensionMaterials: { forgery: 'String', common: 'Mech Core' } },
  "Bloodpact's Pledge": { rarity: 5, type: 'Sword', stat: 'Energy Regen', baseAtk: 587, subStatValue: '+38.8%',
    desc: 'Standard 5★. Sword sealed with an unbreakable blood oath. Healing boosts Resonance Skill DMG.',
    passive: 'Healing → Res. Skill DMG +10% for 6s. Aero DMG +10% for 30s', pv: { skillDmg: 10, elemDmg: 10 }, bestFor: ['Sword healers'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Solsworn Ciphers': { rarity: 5, type: 'Gauntlets', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Standard 5★. Gauntlets inscribed with solar ciphers. Echo Skill DMG Amp on Intro/Echo Skill.',
    passive: 'ATK +12%. Intro/Echo Skill → Echo Skill DMG Amp +32% for 15s', pv: { atkPct: 12, echoDmg: 32 }, bestFor: ['Gauntlet DPS'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  // 4★ Weapons
  'Discord': { rarity: 4, type: 'Broadblade', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Descending adagio, the curtain never falls. Restores Concerto Energy on Skill use.',
    passive: 'Resonance Skill → restore 8 Concerto Energy (20s CD)', bestFor: ['Taoqi', 'Any Broadblade'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Ring' } },
  'Variation': { rarity: 4, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Descending adagio, changing the battle\'s tune. Restores Concerto Energy on Skill use.',
    passive: 'Resonance Skill → restore 8 Concerto Energy (20s CD)', bestFor: ['Baizhi', 'Healers'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Marcato': { rarity: 4, type: 'Gauntlets', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Surging waves shattering all like a deadly hymn. Restores Concerto Energy on Skill use.',
    passive: 'Resonance Skill → restore 8 Concerto Energy (20s CD)', bestFor: ['Yuanwu', 'Gauntlet users'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Lunar Cutter': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Sword born from an alien star\'s light. Gains ATK stacks on swap-in.',
    passive: 'Swap-in → 6 Oath stacks, each +2% ATK (max +12%, 12s CD)', pv: { atkPct: 12 }, bestFor: ['Sword users'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Thunderbolt': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 387, subStatValue: '+36.4%',
    desc: 'Huanglong ceremonial pistols, resilient and enduring. Stacking Skill DMG on Basic/Heavy hits.',
    passive: 'Basic/Heavy ATK hit → Res. Skill DMG +7% (max x3, 7s)', pv: { skillDmg: 21 }, bestFor: ['Chixia', 'Pistol users'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },

  'Overture': { rarity: 4, type: 'Sword', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Ascending crescendo, a glorious cutting prelude. Restores Concerto Energy on Skill use.',
    passive: 'Resonance Skill → restore 8 Concerto Energy (20s CD)', bestFor: ['Sword supports'] },
  'Cadenza': { rarity: 4, type: 'Pistols', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Ascending crescendo, thunderous symphony of destruction. Restores Concerto Energy on Skill use.',
    passive: 'Resonance Skill → restore 8 Concerto Energy (20s CD)', bestFor: ['Pistol supports'] },
  "Ocean's Gift": { rarity: 4, type: 'Rectifier', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Rectifier blessed by the sea, a fisher\'s hope. Stacking Spectro DMG against Frazzled enemies.',
    passive: 'DMG to Spectro Frazzle enemies → +6% Spectro DMG per 1s (max x4, 6s)', bestFor: ['Spectro DPS'] },
  'Waltz in Masquerade': { rarity: 4, type: 'Rectifier', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Swirling dances concealing whispered secrets. Stacking ATK on Negative Status hits.',
    passive: 'DMG to Negative Status enemies → ATK +4% (max x4, 10s)', pv: { atkPct: 16 }, bestFor: ['Rectifier DPS'] },
  'Legend of Drunken Hero': { rarity: 4, type: 'Gauntlets', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Wine grants courage but dulls the senses. Stacking ATK on Negative Status hits.',
    passive: 'DMG to Negative Status enemies → ATK +4% (max x4, 10s)', pv: { atkPct: 16 }, bestFor: ['Gauntlet DPS'] },
  'Romance in Farewell': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Pistols etched with a parting promise of lingering sorrow. Stacking ATK on Negative Status hits.',
    passive: 'DMG to Negative Status enemies → ATK +4% (max x4, 10s)', pv: { atkPct: 16 }, bestFor: ['Pistol DPS'] },
  'Fables of Wisdom': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Sword etched with witty fables hiding truth. Stacking ATK on Negative Status hits.',
    passive: 'DMG to Negative Status enemies → ATK +4% (max x4, 10s)', pv: { atkPct: 16 }, bestFor: ['Sword DPS'] },
  'Meditations on Mercy': { rarity: 4, type: 'Broadblade', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Broadblade of a warrior torn between punishment and mercy. Stacking ATK on Negative Status hits.',
    passive: 'DMG to Negative Status enemies → ATK +4% (max x4, 10s)', pv: { atkPct: 16 }, bestFor: ['Broadblade DPS'] },
  'Call of the Abyss': { rarity: 4, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Scepter of lost dominion and faded grandeur. Healing Bonus boost after Liberation.',
    passive: 'Liberation → Healing Bonus +16% for 15s', bestFor: ['Rectifier healers'] },
  'Somnoire Anchor': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Dreamkeeper\'s anchor from twilight shores. Stacking ATK buff on dealing damage.',
    passive: 'Dealing DMG → +2% ATK per 1s (max x10, 3s per stack)', pv: { atkPct: 20 }, bestFor: ['Sword DPS'] },
  'Fusion Accretion': { rarity: 4, type: 'Rectifier', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Black Shores prototype channeling a blazar\'s radiance. Skill grants Resonance Energy and ATK buff.',
    passive: 'Resonance Skill → +6 Resonance Energy, ATK +10% for 16s', pv: { atkPct: 10 }, bestFor: ['Rectifier DPS'] },
  'Celestial Spiral': { rarity: 4, type: 'Gauntlets', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Galactic radiance spiraling toward tragic demise. Skill grants Resonance Energy and ATK buff.',
    passive: 'Resonance Skill → +6 Resonance Energy, ATK +10% for 16s', pv: { atkPct: 10 }, bestFor: ['Gauntlet DPS'] },
  'Relativistic Jet': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'A blazar\'s incessant course of cosmic destruction. Skill grants Resonance Energy and ATK buff.',
    passive: 'Resonance Skill → +6 Resonance Energy, ATK +10% for 16s', pv: { atkPct: 10 }, bestFor: ['Pistol DPS'] },
  'Endless Collapse': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'The collapsing heart of a dying blazar. Skill grants Resonance Energy and ATK buff.',
    passive: 'Resonance Skill → +6 Resonance Energy, ATK +10% for 16s', pv: { atkPct: 10 }, bestFor: ['Sword DPS'] },
  'Waning Redshift': { rarity: 4, type: 'Broadblade', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'A blazar\'s fading radiance across billions of light-years. Skill grants Resonance Energy and ATK buff.',
    passive: 'Resonance Skill → +6 Resonance Energy, ATK +10% for 16s', pv: { atkPct: 10 }, bestFor: ['Broadblade DPS'] },
  'Lumingloss': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 387, subStatValue: '+36.4%',
    desc: 'Luminous sword with a glossy ceremonial edge. Basic and Heavy ATK DMG boost after Skill.',
    passive: 'Resonance Skill → Basic & Heavy ATK DMG +20% for 10s', pv: { basicDmg: 20, heavyDmg: 20 }, bestFor: ['Sword DPS'] },
  'Commando of Conviction': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Spirits unite in resounding gorges of valor. ATK boost on Intro Skill.',
    passive: 'Intro Skill → ATK +15% for 15s', pv: { atkPct: 15 }, bestFor: ['Sword users'] },
  'Jinzhou Keeper': { rarity: 4, type: 'Rectifier', stat: 'ATK%', baseAtk: 387, subStatValue: '+36.4%',
    desc: 'Vigilant gaze northward where rain veils the city. ATK and HP boost on Intro Skill.',
    passive: 'Intro Skill → ATK +8%, HP +10% for 15s', pv: { atkPct: 8 }, bestFor: ['Rectifier supports'] },
  'Comet Flare': { rarity: 4, type: 'Rectifier', stat: 'HP%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Alien starlight forged delicate and responsive. Stacking Healing Bonus on Basic/Heavy ATK hits.',
    passive: 'Basic/Heavy ATK hit → Healing Bonus +3% (max x3, 8s)', bestFor: ['Rectifier healers'] },
  'Augment': { rarity: 4, type: 'Rectifier', stat: 'Crit Rate', baseAtk: 412, subStatValue: '+20.3%',
    desc: 'Golden ginkgo of Huanglong\'s resilience. ATK boost after using Liberation.',
    passive: 'Liberation → ATK +15% for 15s', pv: { atkPct: 15 }, bestFor: ['Rectifier DPS'] },
  'Hollow Mirage': { rarity: 4, type: 'Gauntlets', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Strange star\'s hollow light concealing tremendous force. Iron Armor stacks on Liberation.',
    passive: 'Liberation → 3 Iron Armor stacks, each +3% ATK and +3% DEF', pv: { atkPct: 9, defPct: 9 }, bestFor: ['Gauntlet users'] },
  'Stonard': { rarity: 4, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 412, subStatValue: '+20.3%',
    desc: 'Ceremonial gauntlets of Huanglong\'s magistrate. Liberation DMG boost after Skill.',
    passive: 'Resonance Skill → Liberation DMG +18% for 15s', pv: { libDmg: 18 }, bestFor: ['Gauntlet DPS'] },
  'Amity Accord': { rarity: 4, type: 'Gauntlets', stat: 'DEF%', baseAtk: 337, subStatValue: '+61.6%',
    desc: 'Rangers\' comradeship, armor against the chill of stars. Liberation DMG boost on Intro Skill.',
    passive: 'Intro Skill → Liberation DMG +20% for 15s', pv: { libDmg: 20 }, bestFor: ['Gauntlet supports'] },
  'Novaburst': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Pistols erupting with nova-like force. Stacking ATK boost on dash/dodge.',
    passive: 'Dash/dodge → ATK +4% (max x3, 8s)', pv: { atkPct: 12 }, bestFor: ['Pistol DPS'] },
  'Undying Flame': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Pistols burning with an undying flame. Skill DMG boost on Intro Skill.',
    passive: 'Intro Skill → Res. Skill DMG +20% for 15s', pv: { skillDmg: 20 }, bestFor: ['Pistol DPS'] },
  'Helios Cleaver': { rarity: 4, type: 'Broadblade', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Broadblade forged in sunfire. Gradual stacking ATK buff after Skill use.',
    passive: 'After Res. Skill → ATK +3% every 2s (max x4, 12s)', pv: { atkPct: 12 }, bestFor: ['Broadblade DPS'] },
  'Dauntless Evernight': { rarity: 4, type: 'Broadblade', stat: 'DEF%', baseAtk: 337, subStatValue: '+61.6%',
    desc: 'Broadblade that cuts through the longest night. ATK and DEF boost on Intro Skill.',
    passive: 'Intro Skill → ATK +8%, DEF +15% for 15s', pv: { atkPct: 8, defPct: 15 }, bestFor: ['Broadblade supports'] },
  'Autumntrace': { rarity: 4, type: 'Broadblade', stat: 'Crit Rate', baseAtk: 412, subStatValue: '+20.3%',
    desc: 'Huanglong\'s golden ginkgo, prosperous and long-lasting. Stacking ATK on Basic/Heavy hits.',
    passive: 'Basic/Heavy ATK DMG → ATK +4% (max x5, 7s)', pv: { atkPct: 20 }, bestFor: ['Broadblade DPS'] },
  'Solar Flame': { rarity: 4, type: 'Pistols', stat: 'Crit Rate', baseAtk: 412, subStatValue: '+20.2%',
    desc: 'Pistols burning with solar fire. Stacking ATK and Heavy ATK DMG on hits.',
    passive: 'Basic/Heavy ATK → ATK +2.2%, Heavy ATK DMG +2.2% (max x4, 7s)', pv: { atkPct: 8.8, heavyDmg: 8.8 }, bestFor: ['Pistol DPS'] },
  'Feather Edge': { rarity: 4, type: 'Sword', stat: 'Crit Rate', baseAtk: 412, subStatValue: '+20.2%',
    desc: 'Sword light as a feather but sharp as a blade. ATK and Liberation DMG boost after Liberation.',
    passive: 'Liberation → ATK +7.2%, Liberation DMG +10.8% for 15s', pv: { atkPct: 7.2, libDmg: 10.8 }, bestFor: ['Sword DPS'] },
  // ── 4★ Craftable ──
  'Broadblade#41': { rarity: 4, type: 'Broadblade', stat: 'Energy Regen', baseAtk: 412, subStatValue: '+32.3%',
    desc: 'Craftable broadblade. ATK and healing boost when HP is high or low.',
    passive: 'HP >80% → ATK +12%. HP <40% → heal 5% on ATK', pv: { atkPct: 12 }, bestFor: ['Broadblade users'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Ring' } },
  'Sword#18': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 387, subStatValue: '+36.4%',
    desc: 'Improved mass-produced sword from Huanglong. Crafted for seasoned warriors.',
    passive: 'Daybreak: HP <40% → Heavy ATK DMG +18%, heal 5% HP on Heavy ATK hit (8s CD)', bestFor: ['Danjin'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Gauntlets#21D': { rarity: 4, type: 'Gauntlets', stat: 'Energy Regen', baseAtk: 387, subStatValue: '+38.9%',
    desc: 'Craftable gauntlets. Counter-focused design with adaptive sustain.',
    passive: 'Mastermind: Dash/dodge → ATK +8%, Dodge Counter DMG +50% for 8s, heal 5% HP on Counter (6s CD)', bestFor: ['Jianxin'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Rectifier#25': { rarity: 4, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Craftable rectifier. Adaptive support with conditional heal or ATK buff.',
    passive: 'Dawnbringer: Skill → HP <60%: heal 5% HP (8s CD); HP ≥60%: ATK +12% for 10s', bestFor: ['Rectifier supports'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Pistols#26': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 387, subStatValue: '+36.4%',
    desc: 'Craftable pistols. Stacking ATK buff while avoiding damage.',
    passive: 'Omniscient: No DMG taken → ATK +6% every 5s (max 2 stacks, 8s). Taking DMG: lose 1 stack, heal 5% HP', bestFor: ['Pistol users'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },

  // ── 4★ Battle Pass (Hunter's Growl series) ──
  'Aureate Zenith': { rarity: 4, type: 'Broadblade', stat: 'Crit DMG', baseAtk: 412, subStatValue: '+40.5%',
    desc: 'Battle Pass broadblade with Griffrex-inspired engravings. ATK and Heavy ATK DMG after Liberation.',
    passive: 'Oath of Tide Hunters: After Liberation → ATK +7.2%, Heavy ATK DMG +10.8% for 15s', pv: { atkPct: 7.2, heavyDmg: 10.8 }, bestFor: ['Augusta', 'Broadblade DPS'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Howler Core' } },
  'Aether Strike': { rarity: 4, type: 'Gauntlets', stat: 'Crit DMG', baseAtk: 412, subStatValue: '+40.5%',
    desc: 'Battle Pass gauntlets with Griffrex-inspired engravings. ATK and Liberation DMG after Liberation.',
    passive: 'Oath of Tide Hunters: After Liberation → ATK +7.2%, Liberation DMG +10.8% for 15s', pv: { atkPct: 7.2, libDmg: 10.8 }, bestFor: ['Iuno', 'Gauntlet DPS'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Radiant Dawn': { rarity: 4, type: 'Rectifier', stat: 'Crit DMG', baseAtk: 412, subStatValue: '+40.5%',
    desc: 'Battle Pass rectifier with Griffrex-inspired engravings. ATK and Basic ATK DMG after Skill.',
    passive: 'Oath of Tide Hunters: After Skill → ATK +9%, Basic ATK DMG +9% for 10s', pv: { atkPct: 9, basicDmg: 9 }, bestFor: ['Rectifier DPS'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },

  // ── 3★ Guardian Series (Craftable in Jinzhou) ──
  // Source: game8.co — all stats, passives, materials, bestFor verified per weapon page
  'Guardian Sword': { rarity: 3, type: 'Sword', stat: 'HP%', baseAtk: 300, subStatValue: '+30.4%',
    desc: 'Craftable sword forged in Jinzhou. Enhances Resonance Skill effectiveness.',
    passive: 'Unified: Resonance Skill DMG +12%', pv: { skillDmg: 12 }, bestFor: ['Cartethyia', 'Changli', 'Yangyang'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Guardian Pistols': { rarity: 3, type: 'Pistols', stat: 'ATK%', baseAtk: 300, subStatValue: '+30.4%',
    desc: 'Craftable pistols forged in Jinzhou. Enhances Resonance Skill effectiveness.',
    passive: 'Unity: Resonance Skill DMG +12%', pv: { skillDmg: 12 }, bestFor: ['Carlotta', 'Chixia'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Guardian Gauntlets': { rarity: 3, type: 'Gauntlets', stat: 'DEF%', baseAtk: 300, subStatValue: '+38.5%',
    desc: 'Craftable gauntlets forged in Jinzhou. Enhances Liberation effectiveness.',
    passive: 'Collective Strength: Resonance Liberation DMG +12%', pv: { libDmg: 12 }, bestFor: ['Jianxin', 'Yuanwu'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Guardian Rectifier': { rarity: 3, type: 'Rectifier', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Craftable rectifier forged in Jinzhou. Enhances Basic ATK and Heavy ATK.',
    passive: 'Companionship: Basic ATK and Heavy ATK DMG +12%', pv: { basicDmg: 12, heavyDmg: 12 }, bestFor: ['Encore', 'Zhezhi'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Guardian Broadblade': { rarity: 3, type: 'Broadblade', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Craftable broadblade forged in Jinzhou. Enhances Basic ATK and Heavy ATK effectiveness.',
    passive: 'Consensus: Basic ATK and Heavy ATK DMG +12%', pv: { basicDmg: 12, heavyDmg: 12 }, bestFor: ['Augusta', 'Calcharo', 'Jinhsi', 'Jiyan'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },

  // ── 3★ Voyager Series ──
  'Sword of Voyager': { rarity: 3, type: 'Sword', stat: 'Energy Regen', baseAtk: 300, subStatValue: '+32.3%',
    desc: 'Travel sword built for sustained adventuring. Restores energy on Skill use.',
    passive: 'Crusade: Resonance Skill → restore 8 Resonance Energy (20s CD)', bestFor: [],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Pistols of Voyager': { rarity: 3, type: 'Pistols', stat: 'ATK%', baseAtk: 300, subStatValue: '+30.4%',
    desc: 'Travel pistols built for sustained adventuring. Restores energy on Skill use.',
    passive: 'Long Journey: Resonance Skill → restore 8 Resonance Energy (20s CD)', bestFor: ['Carlotta'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Gauntlets of Voyager': { rarity: 3, type: 'Gauntlets', stat: 'DEF%', baseAtk: 325, subStatValue: '+30.8%',
    desc: 'Travel gauntlets built for sustained adventuring. Restores energy on Skill use.',
    passive: 'Crusade: Resonance Skill → restore 8 Resonance Energy (20s CD)', bestFor: ['Yuanwu'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Rectifier of Voyager': { rarity: 3, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 300, subStatValue: '+32.3%',
    desc: 'Travel rectifier built for sustained adventuring. Restores energy on Skill use.',
    passive: 'Crusade: Resonance Skill → restore 8 Resonance Energy (20s CD)', bestFor: ['Baizhi', 'Shorekeeper', 'Verina', 'Yinlin', 'Zhezhi'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Broadblade of Voyager': { rarity: 3, type: 'Broadblade', stat: 'Energy Regen', baseAtk: 300, subStatValue: '+32.3%',
    desc: 'Travel broadblade built for sustained adventuring. Restores energy on Skill use.',
    passive: 'Long Journey: Resonance Skill → restore 8 Resonance Energy (20s CD)', bestFor: ['Lumi'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },

  // ── 3★ Night Series ──
  'Sword of Night': { rarity: 3, type: 'Sword', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Midnight-forged sword. Empowers the wielder on swap-in.',
    passive: 'Tenacity: Intro Skill → ATK +8% for 10s', bestFor: ['Rover', 'Sanhua', 'Yangyang'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Pistols of Night': { rarity: 3, type: 'Pistols', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Midnight-forged pistols. Empowers the wielder on swap-in.',
    passive: 'Chivalry: Intro Skill → ATK +8% for 10s', bestFor: ['Aalto', 'Mortefi'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Gauntlets of Night': { rarity: 3, type: 'Gauntlets', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Midnight-forged gauntlets. Empowers the wielder on swap-in.',
    passive: 'Assemble: Intro Skill → ATK +8% for 10s', bestFor: ['Jianxin', 'Lingyang', 'Roccia', 'Xiangli Yao', 'Youhu'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Rectifier of Night': { rarity: 3, type: 'Rectifier', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Midnight-forged rectifier. Empowers the wielder on swap-in.',
    passive: 'Valiance: Intro Skill → ATK +8% for 10s', bestFor: ['Encore', 'Phrolova', 'Yinlin'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Broadblade of Night': { rarity: 3, type: 'Broadblade', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Midnight-forged broadblade. Empowers the wielder on swap-in.',
    passive: 'Arrival: Intro Skill → ATK +8% for 10s', bestFor: ['Calcharo', 'Jinhsi', 'Jiyan'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },

  // ── 3★ Originite Series (Huaxu Academy) ──
  'Originite: Type I': { rarity: 3, type: 'Broadblade', stat: 'DEF%', baseAtk: 300, subStatValue: '+38.5%',
    desc: 'Huaxu Academy broadblade for technical verification. Heals on Skill use.',
    passive: 'Temperance: Resonance Skill → heal 3% Max HP (12s CD)', bestFor: [],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Originite: Type II': { rarity: 3, type: 'Sword', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Huaxu Academy sword for technical verification. Heals on Liberation use.',
    passive: 'Vanquish: Resonance Liberation → heal 5% Max HP (20s CD)', bestFor: ['Danjin'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Originite: Type III': { rarity: 3, type: 'Pistols', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Huaxu Academy pistols for technical verification. Heals on Dodge Counter.',
    passive: 'Alacrity: Dodge Counter → heal 1.6% Max HP (6s CD)', bestFor: [],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Originite: Type IV': { rarity: 3, type: 'Gauntlets', stat: 'Crit DMG', baseAtk: 300, subStatValue: '+40.4%',
    desc: 'Huaxu Academy gauntlets for technical verification. Heals on Basic ATK hit.',
    passive: 'Rejuvenate: Basic ATK DMG → heal 0.5% Max HP (3s CD)', bestFor: ['Lingyang'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Originite: Type V': { rarity: 3, type: 'Rectifier', stat: 'HP%', baseAtk: 300, subStatValue: '+30.4%',
    desc: 'Huaxu Academy rectifier for technical verification. Heals on Intro Skill.',
    passive: 'Augment: Intro Skill → heal 5% Max HP (20s CD)', bestFor: [],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },

  // ── 3★ Beguiling Melody (Quest Reward — v1.1) ──
  'Beguiling Melody': { rarity: 3, type: 'Broadblade', stat: 'ATK%', baseAtk: 300, subStatValue: '+30.4%',
    desc: 'Forged from the scale of Jué. Resembles a musical instrument more than a weapon.',
    passive: 'Graceful Touch: Intro Skill → restore 4 Concerto Energy; Outro Skill → restore 4 Resonance Energy', bestFor: [],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },

  // ── 2★ Tyro Series ──
  'Tyro Sword': { rarity: 2, type: 'Sword', stat: 'ATK%', baseAtk: 200, subStatValue: '+18.2%',
    desc: 'Sword for novice Resonators. Contains a power not to be underestimated.',
    passive: 'Prologue: ATK +5%', bestFor: [] },
  'Tyro Rectifier': { rarity: 2, type: 'Rectifier', stat: 'ATK%', baseAtk: 200, subStatValue: '+18.2%',
    desc: 'Rectifier for novice Resonators. Contains a power not to be underestimated.',
    passive: 'Prologue: ATK +5%', bestFor: [] },
  'Tyro Gauntlets': { rarity: 2, type: 'Gauntlets', stat: 'ATK%', baseAtk: 200, subStatValue: '+18.2%',
    desc: 'Gauntlets for novice Resonators. Contains a power not to be underestimated.',
    passive: 'Prologue: ATK +5%', bestFor: [] },
  'Tyro Pistols': { rarity: 2, type: 'Pistols', stat: 'ATK%', baseAtk: 200, subStatValue: '+18.2%',
    desc: 'Pistols for novice Resonators. Contains a power not to be underestimated.',
    passive: 'Prologue: ATK +5%', bestFor: [] },
  'Tyro Broadblade': { rarity: 2, type: 'Broadblade', stat: 'ATK%', baseAtk: 200, subStatValue: '+18.2%',
    desc: 'Broadblade for novice Resonators. Contains a power not to be underestimated.',
    passive: 'Prologue: ATK +5%', bestFor: [] },

  // ── 1★ Training Series ──
  'Training Sword': { rarity: 1, type: 'Sword', stat: 'ATK%', baseAtk: 100, subStatValue: '+12.1%',
    desc: 'Starter sword issued to new Resonators. Found in Supply Chests.',
    passive: 'Persevere: ATK +4%', bestFor: [] },
  'Training Rectifier': { rarity: 1, type: 'Rectifier', stat: 'ATK%', baseAtk: 100, subStatValue: '+12.1%',
    desc: 'Starter rectifier issued to new Resonators. Found in Supply Chests.',
    passive: 'Persevere: ATK +4%', bestFor: [] },
  'Training Gauntlets': { rarity: 1, type: 'Gauntlets', stat: 'ATK%', baseAtk: 100, subStatValue: '+12.1%',
    desc: 'Starter gauntlets issued to new Resonators. Found in Supply Chests.',
    passive: 'Persevere: ATK +4%', bestFor: [] },
  'Training Pistols': { rarity: 1, type: 'Pistols', stat: 'ATK%', baseAtk: 100, subStatValue: '+12.1%',
    desc: 'Starter pistols issued to new Resonators. Found in Supply Chests.',
    passive: 'Persevere: ATK +4%', bestFor: [] },
  'Training Broadblade': { rarity: 1, type: 'Broadblade', stat: 'ATK%', baseAtk: 100, subStatValue: '+12.1%',
    desc: 'Starter broadblade issued to new Resonators. Found in Supply Chests.',
    passive: 'Persevere: ATK +4%', bestFor: [] },
};

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
  tacticalHologram: {
    name: 'Tactical Hologram',
    subtitle: 'Synchronization',
    description: 'Weekly boss challenge',
    resetType: 'Version update',
    color: 'cyan',
    // Tue, 03 Feb 2026 10:45 - Sun, 05 Apr 2026 03:59 (Europe)
    // P9-FIX: Apr 5 is after DST spring-forward (Mar 29) — Europe is CEST (UTC+2)
    // Apr 5, 03:59 CEST = Apr 5, 01:59 UTC (was incorrectly 02:59 UTC assuming CET)
    currentEnd: '2026-04-05T01:59:00Z',
    rewards: 'Weekly Rewards',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: 'https://i.ibb.co/mCTQX0kB/tactical-hologram-phantom-pain.avif'
  },
  doubledPawns: { 
    name: 'Doubled Pawns Matrix', 
    subtitle: 'Pilot', 
    description: 'High difficulty boss rush', 
    resetType: 'Version update', 
    color: 'pink', 
    // Wed, 11 Feb 2026 21:00 - Thu, 19 Mar 2026 04:00 (Europe)
    // Mar 19, 04:00 Europe = Mar 19, 03:00 UTC
    currentEnd: '2026-03-19T03:00:00Z',
    rewards: '400 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30',
    accentColor: 'pink',
    imageUrl: 'https://i.ibb.co/G4fSsp4P/Doubled-Pawns-Matrix.jpg'
  },
  whimperingWastes: { 
    name: 'Whimpering Wastes', 
    subtitle: 'Respawning Waters', 
    description: 'Combat challenge with token system', 
    resetType: '28 days', 
    color: 'cyan', 
    // Mon, 16 Feb 2026 04:00 - Mon, 16 Mar 2026 03:59 (Europe)
    // Mar 16, 03:59 Europe = Mar 16, 02:59 UTC
    currentEnd: '2026-03-16T02:59:00Z',
    rewards: '800 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: 'https://i.ibb.co/HT4RyJBy/Whimpering-Wastes-BG.png'
  },
  towerOfAdversity: { 
    name: 'Tower of Adversity', 
    subtitle: 'Hazard Zone', 
    description: 'Endgame combat challenge', 
    resetType: '28 days', 
    color: 'orange', 
    // Mon, 02 Feb 2026 04:00 - Mon, 02 Mar 2026 03:59 (Europe)
    // Mar 2, 03:59 Europe = Mar 2, 02:59 UTC
    currentEnd: '2026-03-02T02:59:00Z',
    rewards: '800 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-orange-900/30',
    accentColor: 'orange',
    imageUrl: 'https://i.ibb.co/QF335JVv/Tower-of-Adversity-Banner-Art.jpg'
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
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════════

// [SECTION:CONSTANTS]
// WuWa gacha rates: 0.8% base, soft pity starts at 65, hard pity at 80
const HARD_PITY = 80, SOFT_PITY_START = 65; // AVG_PITY (5-star) removed — P8-FIX: was unused dead code
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
  'Guardian Broadblade': '', // TODO: upload image to imgbb
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
const TAB_ORDER = ['tracker', 'events', 'calculator', 'planner', 'analytics', 'gathering', 'teams', 'profile'];

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
  CURRENT_BANNERS, BANNER_HISTORY, CHARACTER_DATA, WEAPON_DATA, ECHO_SETS, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA,
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
