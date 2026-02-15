// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES v3.2.2 — appcore-data.js
// Pure data, constants, game databases. No React. Leaf module (no imports).
// ═══════════════════════════════════════════════════════════════════════════════

const APP_VERSION = '3.2.2';
const MAX_IMPORT_SIZE_MB = 5; // P7-FIX: Import file size limit constant (7E)

// Header icon (uploaded app icon)
const HEADER_ICON = 'data:image/png;base64,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';

// Haptic feedback utility — fails silently on unsupported devices
const haptic = {
  light: () => { try { navigator?.vibrate?.(10); } catch {} },
  medium: () => { try { navigator?.vibrate?.(25); } catch {} },
  heavy: () => { try { navigator?.vibrate?.(50); } catch {} },
  success: () => { try { navigator?.vibrate?.([15, 50, 15]); } catch {} },
  warning: () => { try { navigator?.vibrate?.([30, 30, 30]); } catch {} },
  error: () => { try { navigator?.vibrate?.([50, 50, 80]); } catch {} },
};


// Unique ID generator (used by toast & reducer)
// P12-FIX: Monotonic counter prevents ID collisions in the crypto.randomUUID fallback path
// (same-millisecond calls to Date.now() would otherwise produce identical IDs) (Step 12 audit — LOW-12n)
let __uniqueIdCounter = 0;
const generateUniqueId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return crypto.randomUUID(); } catch {}
  }
  return `${Date.now()}-${++__uniqueIdCounter}-${Math.random().toString(36).slice(2)}`;
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
  if (percentile >= 90) return { rating: 'Arbiter', color: '#fbbf24', tier: 'S+', percentile };
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
    const formatter = new Intl.DateTimeFormat('en-US', { 
      timeZone: serverData.timezone, 
      timeZoneName: 'shortOffset' 
    });
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
  version: '3.1', phase: 1, // Game version (not app version)
  // Times from wuwatracker.com (Europe CET/CEST reference, converted to UTC)
  // P9-FIX: Feb is CET (UTC+1) — these conversions are correct for winter
  // Banner: Thu, 05 Feb 2026 03:00 - Thu, 26 Feb 2026 09:59 (Europe CET)
  startDate: '2026-02-05T02:00:00Z', // Feb 5, 03:00 Europe = 02:00 UTC
  endDate: '2026-02-26T08:59:00Z',   // Feb 26, 09:59 Europe = 08:59 UTC
  characterBannerImage: '',
  weaponBannerImage: '',
  eventBannerImage: '',
  whimperingWastesImage: 'https://i.ibb.co/HT4RyJBy/Whimpering-Wastes-BG.png',
  doubledPawnsImage: 'https://i.ibb.co/G4fSsp4P/Doubled-Pawns-Matrix.jpg',
  towerOfAdversityImage: 'https://i.ibb.co/QF335JVv/Tower-of-Adversity-Banner-Art.jpg',
  illusiveRealmImage: 'https://i.ibb.co/zcc2MxR/Fantasies-of-the-Thousand-Gateways.jpg',
  tacticalHologramImage: 'https://i.ibb.co/mCTQX0kB/tactical-hologram-phantom-pain.avif',
  weeklyBossImage: 'https://i.ibb.co/M5cLkMWf/file-00000000e8b071f480ded273f611ec2e.png',
  standardCharBannerImage: 'https://i.ibb.co/zVf13CMn/Tidal-Chorus.webp',
  standardWeapBannerImage: 'https://i.ibb.co/Q3TYHS0h/Winter-Brume-Pistols.webp',
  dailyResetImage: 'https://i.ibb.co/Jj6cqnsQ/image.jpg',
  characters: [
    { id: 'aemeath', name: 'Aemeath', title: 'The Star That Voyages Far', element: 'Fusion', weaponType: 'Sword', isNew: true, featured4Stars: ['Mortefi', 'Taoqi', 'Aalto'], imageUrl: 'https://i.ibb.co/sdR97cQP/is-it-just-me-or-im-getting-big-xenoblade-vibes-from-aemeath-v0-qy9dmys1lqag1.jpg' },
    { id: 'chisa', name: 'Chisa', title: 'Snowfield Melody', element: 'Havoc', weaponType: 'Broadblade', isNew: false, featured4Stars: ['Mortefi', 'Taoqi', 'Aalto'], imageUrl: 'https://i.ibb.co/KcYh2QNC/vvcistuu87vf1.jpg' },
    { id: 'lupa', name: 'Lupa', title: 'Blazing Fang', element: 'Fusion', weaponType: 'Broadblade', isNew: false, featured4Stars: ['Mortefi', 'Taoqi', 'Aalto'], imageUrl: 'https://i.ibb.co/Y4mKyFJm/Gq-Vx28sao-AAekz-H.jpg' },
  ],
  weapons: [
    { id: 'everbright', name: 'Everbright Polestar', title: 'Absolute Pulsation', type: 'Sword', forCharacter: 'Aemeath', element: 'Fusion', isNew: true, featured4Stars: ['Celestial Spiral', 'Waning Redshift', 'Discord'], imageUrl: 'https://i.ibb.co/b5sWk8HR/featured-Image-6.jpg' },
    { id: 'kumokiri', name: 'Kumokiri', title: 'Frigid Moon', type: 'Broadblade', forCharacter: 'Chisa', element: 'Havoc', isNew: false, featured4Stars: ['Celestial Spiral', 'Waning Redshift', 'Discord'], imageUrl: 'https://i.ibb.co/7BwnqBN/images-2026-02-04-T182250-074.jpg' },
    { id: 'wildfire', name: 'Wildfire Mark', title: 'Scorching Trail', type: 'Broadblade', forCharacter: 'Lupa', element: 'Fusion', isNew: false, featured4Stars: ['Celestial Spiral', 'Waning Redshift', 'Discord'], imageUrl: 'https://i.ibb.co/1Y5gbsfC/684baaa5266f9f96e0cfb644f-MGLAQ5m03.webp' },
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
  // Version 3.1
  { version: '3.1', phase: 2, characters: ['Luuk Herssen', 'Galbrena'], weapons: ["Daybreaker's Spine", 'Lux & Umbra'], startDate: '2026-02-26', endDate: '2026-03-18', predicted: true },
  { version: '3.1', phase: 1, characters: ['Aemeath', 'Chisa', 'Lupa'], weapons: ['Everbright Polestar', 'Kumokiri', 'Wildfire Mark'], startDate: '2026-02-05', endDate: '2026-02-26' },
  // Version 3.0
  { version: '3.0', phase: 2, characters: ['Mornye', 'Augusta', 'Iuno'], weapons: ['Starfield Calibrator', 'Thunderflare Dominion', "Moongazer's Sigil"], startDate: '2026-01-15', endDate: '2026-02-04' },
  { version: '3.0', phase: 1, characters: ['Lynae', 'Cartethyia', 'Ciaccona'], weapons: ['Spectrum Blaster', "Defier's Thorn", 'Woodland Aria'], startDate: '2025-12-24', endDate: '2026-01-15' },
  // Version 2.8
  { version: '2.8', phase: 2, characters: ['Phrolova', 'Cantarella'], weapons: ['Lethean Elegy', 'Whispers of Sirens'], startDate: '2025-12-11', endDate: '2025-12-24' },
  { version: '2.8', phase: 1, characters: ['Chisa', 'Phoebe'], weapons: ['Kumokiri', 'Luminous Hymn'], startDate: '2025-11-20', endDate: '2025-12-11' },
  // Version 2.7
  { version: '2.7', phase: 2, characters: ['Qiuyuan', 'Zani'], weapons: ['Emerald Sentence', 'Blazing Justice'], startDate: '2025-10-30', endDate: '2025-11-19' },
  { version: '2.7', phase: 1, characters: ['Galbrena', 'Lupa'], weapons: ['Lux & Umbra', 'Wildfire Mark'], startDate: '2025-10-09', endDate: '2025-10-30' },
  // Version 2.6
  { version: '2.6', phase: 2, characters: ['Iuno', 'Ciaccona'], weapons: ["Moongazer's Sigil", 'Woodland Aria'], startDate: '2025-09-17', endDate: '2025-10-08' },
  { version: '2.6', phase: 1, characters: ['Augusta', 'Carlotta', 'Shorekeeper'], weapons: ['Thunderflare Dominion', 'The Last Dance', 'Stellar Symphony'], startDate: '2025-08-28', endDate: '2025-09-17' },
  // Version 2.5
  { version: '2.5', phase: 2, characters: ['Cantarella', 'Brant'], weapons: ['Whispers of Sirens', 'Unflickering Valor'], startDate: '2025-08-14', endDate: '2025-08-27' },
  { version: '2.5', phase: 1, characters: ['Phrolova', 'Roccia'], weapons: ['Lethean Elegy', 'Tragicomedy'], startDate: '2025-07-24', endDate: '2025-08-14' },
  // Version 2.4
  { version: '2.4', phase: 2, characters: ['Lupa'], weapons: ['Wildfire Mark'], startDate: '2025-07-03', endDate: '2025-07-23' },
  { version: '2.4', phase: 1, characters: ['Cartethyia'], weapons: ["Defier's Thorn"], startDate: '2025-06-12', endDate: '2025-07-03' },
  // Version 2.3 (Anniversary)
  { version: '2.3', phase: 2, characters: ['Ciaccona', 'Jinhsi', 'Changli', 'Carlotta', 'Roccia', 'Brant'], weapons: ['Woodland Aria'], startDate: '2025-05-22', endDate: '2025-06-11' },
  { version: '2.3', phase: 1, characters: ['Zani', 'Jiyan', 'Yinlin', 'Zhezhi', 'Xiangli Yao', 'Phoebe'], weapons: ['Blazing Justice'], startDate: '2025-04-29', endDate: '2025-05-22' },
  // Version 2.2
  { version: '2.2', phase: 2, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2025-04-17', endDate: '2025-04-28' },
  { version: '2.2', phase: 1, characters: ['Cantarella', 'Camellya'], weapons: ['Whispers of Sirens', 'Red Spring'], startDate: '2025-03-27', endDate: '2025-04-17' },
  // Version 2.1
  { version: '2.1', phase: 2, characters: ['Brant', 'Changli'], weapons: ['Unflickering Valor', 'Blazing Brilliance'], startDate: '2025-03-06', endDate: '2025-03-26' },
  { version: '2.1', phase: 1, characters: ['Phoebe'], weapons: ['Luminous Hymn'], startDate: '2025-02-13', endDate: '2025-03-06' },
  // Version 2.0
  { version: '2.0', phase: 2, characters: ['Roccia', 'Jinhsi'], weapons: ['Tragicomedy', 'Ages of Harvest'], startDate: '2025-01-23', endDate: '2025-02-12' },
  { version: '2.0', phase: 1, characters: ['Carlotta', 'Zhezhi'], weapons: ['The Last Dance', 'Rime-Draped Sprouts'], startDate: '2025-01-02', endDate: '2025-01-23' },
  // Version 1.4.1
  { version: '1.4', phase: 2, characters: ['Yinlin', 'Xiangli Yao'], weapons: ['Stringmaster', "Verity's Handle"], startDate: '2024-12-12', endDate: '2025-01-01' },
  { version: '1.4', phase: 1, characters: ['Camellya'], weapons: ['Red Spring'], startDate: '2024-11-14', endDate: '2024-12-12' },
  // Version 1.3
  { version: '1.3', phase: 2, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-10-24', endDate: '2024-11-13' },
  { version: '1.3', phase: 1, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2024-09-29', endDate: '2024-10-24' },
  // Version 1.2
  { version: '1.2', phase: 2, characters: ['Xiangli Yao'], weapons: ["Verity's Handle"], startDate: '2024-09-07', endDate: '2024-09-28' },
  { version: '1.2', phase: 1, characters: ['Zhezhi'], weapons: ['Rime-Draped Sprouts'], startDate: '2024-08-15', endDate: '2024-09-07' },
  // Version 1.1
  { version: '1.1', phase: 2, characters: ['Changli'], weapons: ['Blazing Brilliance'], startDate: '2024-07-22', endDate: '2024-08-14' },
  { version: '1.1', phase: 1, characters: ['Jinhsi'], weapons: ['Ages of Harvest'], startDate: '2024-06-28', endDate: '2024-07-22' },
  // Version 1.0 — NOTE: p1 and p2 intentionally overlap (both ran concurrently at launch)
  { version: '1.0', phase: 2, characters: ['Yinlin'], weapons: ['Stringmaster'], startDate: '2024-06-06', endDate: '2024-06-26' },
  { version: '1.0', phase: 1, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-05-23', endDate: '2024-06-13' },
];

// [SECTION:CHARACTER_DATA]
const CHARACTER_DATA = {
  // 5★ Resonators
  'Jiyan': { rarity: 5, element: 'Aero', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'General of the Midnight Rangers. Powerful burst DPS in Qingloong Mode.',
    skills: ['Lone Lance', 'Windqueller', 'Emerald Storm: Prelude', 'Qingloong Mode'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Pecok Flower' },
    bestEchoes: ['Feilian Beringal', 'Sierra Gale 4pc'], bestWeapon: 'Verdant Summit',
    teams: ['Jiyan + Iuno + Shorekeeper', 'Jiyan + Mortefi + Verina'] },
  'Calcharo': { rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Notorious mercenary "The Ghost". Combo-focused Electro DPS.',
    skills: ['Gnawing Fangs', 'Extermination Order', 'Phantom Etching', 'Death Messenger'],
    ascension: { boss: 'Thundering Tacet Core', common: 'Ring', specialty: 'Iris' },
    bestEchoes: ['Thundering Mephis', 'Void Thunder 4pc'], bestWeapon: 'Lustrous Razor',
    teams: ['Calcharo + Yinlin + Verina', 'Calcharo + Yinlin + Shorekeeper'] },
  'Encore': { rarity: 5, element: 'Fusion', weapon: 'Rectifier', role: 'Main DPS',
    desc: 'Eccentric puppeteer with Cosmos & Cloudy. Rampage mode specialist.',
    skills: ['Wooly Attack', 'Flaming Woolies', 'Cloudburst', 'Cosmos Rampage'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    bestEchoes: ['Inferno Rider', 'Molten Rift 4pc'], bestWeapon: 'Cosmic Ripples',
    teams: ['Encore + Changli + Verina', 'Encore + Sanhua + Shorekeeper'] },
  'Jianxin': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Support',
    desc: 'Martial artist seeking peace. Shields, grouping, and Aero buff.',
    skills: ['Fengyiquan', 'Calming Air', 'Purifying Waltz', 'Chi Counter'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Whisperin Core', specialty: 'Lanternberry' },
    bestEchoes: ['Bell-Borne Geochelone', 'Moonlit Clouds 4pc'], bestWeapon: 'Abyss Surges',
    teams: ['Jianxin + Jiyan + Verina', 'Jianxin + Main DPS + Healer'] },
  'Lingyang': { rarity: 5, element: 'Glacio', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Opera performer with lion spirit. Aerial combo specialist.',
    skills: ['Frost Fang', 'Ancient Arts', 'Stormbreaker', 'Lion Form'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    bestEchoes: ['Crownless', 'Freezing Frost 4pc'], bestWeapon: 'Abyss Surges',
    teams: ['Lingyang + Sanhua + Verina', 'Lingyang + Zhezhi + Shorekeeper'] },
  'Verina': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Researcher of life. Premium healer with ATK buff and DMG Deepen.',
    skills: ['Cultivation', 'Botany Experiment', 'Arboreal Flourish', 'Starflower Blooms'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Howler Core', specialty: 'Belle Poppy' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 4pc'], bestWeapon: 'Cosmic Ripples',
    teams: ['Any team - universal healer and buffer'] },
  'Yinlin': { rarity: 5, element: 'Electro', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Covert investigator with puppet Zapstring. Off-field Electro Coordinated Attacks.',
    skills: ['Zapstring Dance', 'Magnetic Roar', 'Thunder Wrath', 'Chameleon Cipher'],
    ascension: { boss: 'Group Abomination Tacet Core', common: 'Whisperin Core', specialty: 'Iris' },
    bestEchoes: ['Thundering Mephis', 'Void Thunder 4pc'], bestWeapon: 'Stringmaster',
    teams: ['Yinlin + Jinhsi + Verina', 'Yinlin + Calcharo + Shorekeeper'] },
  'Jinhsi': { rarity: 5, element: 'Spectro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Magistrate of Jinzhou. Incarnation burst with massive AoE.',
    skills: ['Trailing Slash', 'Illuminous Epiphany', 'Purge of Light', 'Incarnation'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Howler Core', specialty: "Loong's Pearl" },
    bestEchoes: ['Sentinel Jué', 'Celestial Light 4pc'], bestWeapon: 'Ages of Harvest',
    teams: ['Jinhsi + Zhezhi + Shorekeeper', 'Jinhsi + Yinlin + Verina'] },
  'Changli': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Sub DPS',
    desc: 'True Sentinel of Jinzhou. Fast Fusion combos and Fusion DMG Amp.',
    skills: ['Blazing Enlightenment', 'Tripartite Flames', 'Radiance of Fealty', 'Enflamement'],
    ascension: { boss: 'Rage Tacet Core', common: 'Ring', specialty: 'Pavo Plum' },
    bestEchoes: ['Inferno Rider', 'Molten Rift 4pc'], bestWeapon: 'Blazing Brilliance',
    teams: ['Changli + Brant + Shorekeeper', 'Changli + Encore + Verina'] },
  'Zhezhi': { rarity: 5, element: 'Glacio', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Painter who brings art to life. Off-field Glacio Coordinated Attacks.',
    skills: ['Frost Ink', 'Manifestation', 'Living Canvas', 'Creations Abound'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Howler Core', specialty: 'Lanternberry' },
    bestEchoes: ['Crownless', 'Freezing Frost 4pc'], bestWeapon: 'Rime-Draped Sprouts',
    teams: ['Zhezhi + Jinhsi + Shorekeeper', 'Zhezhi + Carlotta + Shorekeeper'] },
  'Xiangli Yao': { rarity: 5, element: 'Electro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Huaxu Academy researcher. Transforms into combat mech for burst.',
    skills: ['Probe', 'Deduction', 'Cogitation Model', 'Law of Reigns'],
    ascension: { boss: 'Hidden Thunder Tacet Core', common: 'Whisperin Core', specialty: 'Violet Coral' },
    bestEchoes: ['Thundering Mephis', 'Void Thunder 4pc'], bestWeapon: "Verity's Handle",
    teams: ['Xiangli Yao + Yinlin + Verina', 'Xiangli Yao + Yinlin + Shorekeeper'] },
  'Shorekeeper': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Guardian of the Tethys. Premium healer with Crit buffs via Stellarealm.',
    skills: ['Origin Calculus', 'Chaos Theory', 'End Loop', 'Illation'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 4pc'], bestWeapon: 'Stellar Symphony',
    teams: ['Any team - best support in game'] },
  'Camellya': { rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    desc: 'Flower-like assassin. Stance-dancer with Budding and Blossom modes.',
    skills: ['Thorn Blossom', 'Crimson Blossom', 'Fervor Efflorescent', 'Ephemeral'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    bestEchoes: ['Crownless', 'Sun-Sinking Eclipse 4pc'], bestWeapon: 'Red Spring',
    teams: ['Camellya + Roccia + Shorekeeper', 'Camellya + Sanhua + Verina'] },
  'Carlotta': { rarity: 5, element: 'Glacio', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Heiress of the Montelli family. Stylish Glacio burst gunslinger.',
    skills: ['Silent Execution', 'Art of Violence', 'Era of New Wave', 'Imminent Oblivion'],
    ascension: { boss: 'Platinum Core', common: 'Polygon Core', specialty: 'Sword Acorus' },
    bestEchoes: ['Sentry Construct', 'Frosty Resolve 5pc'], bestWeapon: 'The Last Dance',
    teams: ['Carlotta + Zhezhi + Shorekeeper', 'Carlotta + Buling + Verina'] },
  'Roccia': { rarity: 5, element: 'Havoc', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Clown performer from Rinascita. Havoc buffer with Basic ATK Amp.',
    skills: ['Pero, Help', 'Acrobatic Trick', 'Commedia Improvviso!', 'Real Fantasy'],
    ascension: { boss: 'Cleansing Conch', common: 'Tidal Residuum', specialty: 'Firecracker Jewelweed' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 4pc'], bestWeapon: 'Tragicomedy',
    teams: ['Roccia + Camellya + Shorekeeper', 'Roccia + Cantarella + Verina'] },
  'Phoebe': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Acolyte of the Order of the Deep. Premier Spectro Frazzle applicator.',
    skills: ['Chamuel\'s Star', 'Seeking the Light', 'Dawn of Enlightenment', 'Starflash'],
    ascension: { boss: 'Cleansing Conch', common: 'Whisperin Core', specialty: 'Firecracker Jewelweed' },
    bestEchoes: ['Mourning Aix', 'Eternal Radiance 5pc'], bestWeapon: 'Luminous Hymn',
    teams: ['Phoebe + Zani + Shorekeeper', 'Phoebe + Spectro Rover + Verina'] },
  'Brant': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Knight from Rinascita. Dual-DPS Fusion swordsman with self-heal.',
    skills: ['Blazing Strike', 'Flame Rush', 'Inferno Judgment', 'Burning Soul'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    bestEchoes: ['Dragon of Dirge', 'Tidebreaking Courage 5pc'], bestWeapon: 'Unflickering Valor',
    teams: ['Brant + Lupa + Changli', 'Brant + Changli + Shorekeeper'] },
  'Cantarella': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Head of the Fisalia family. Havoc sub-DPS with coordinated attacks and healing.',
    skills: ['Shadow Strike', 'Venomous Dart', 'Lethal Masquerade', 'Twilight Veil'],
    ascension: { boss: 'Cleansing Conch', common: 'Polygon Core', specialty: 'Seaside Cendrelis' },
    bestEchoes: ['Hecate', 'Empyrean Anthem 5pc'], bestWeapon: 'Whispers of Sirens',
    teams: ['Cantarella + Phrolova + Roccia', 'Cantarella + Camellya + Shorekeeper'] },
  'Zani': { rarity: 5, element: 'Spectro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Averardo Vault security member. Spectro Frazzle DPS with counter-based burst.',
    skills: ['Standard Defense Protocol', 'Crisis Response Protocol', 'Rekindle', 'Heliacal Embers'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    bestEchoes: ['Capitaneus', 'Eternal Radiance 5pc'], bestWeapon: 'Blazing Justice',
    teams: ['Zani + Phoebe + Shorekeeper', 'Zani + Spectro Rover + Verina'] },
  'Ciaccona': { rarity: 5, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Wandering bard. Aero Erosion applicator and off-field Aero buffer.',
    skills: ['Solo Concert', 'Ensemble Sylph', 'Improvised Symphonic Poem', 'Recital'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Gusts of Welkin 4pc'], bestWeapon: 'Woodland Aria',
    teams: ['Ciaccona + Cartethyia + Aero Rover', 'Ciaccona + Cartethyia + Chisa'] },
  'Cartethyia': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Main DPS',
    desc: 'Blessed Maiden of Rinascita. HP-scaling Aero Erosion hypercarry with dual forms.',
    skills: ['Sword Shadow', 'Plunging Recall', 'Blade of Howling Squall', 'Fleurdelys Form'],
    ascension: { boss: 'Unfading Glory', common: 'Tidal Residuum', specialty: 'Bamboo Iris' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Windward Pilgrimage 4pc'], bestWeapon: "Defier's Thorn",
    teams: ['Cartethyia + Ciaccona + Aero Rover', 'Cartethyia + Ciaccona + Chisa'] },
  'Lupa': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Star Gladiator. Mono-Fusion enabler with Fusion RES shred and team DMG buffs.',
    skills: ['Wolflame', 'Wolfaith', 'Dance With the Wolf', 'Pack Hunt'],
    ascension: { boss: 'Unfading Glory', common: 'Howler Core', specialty: 'Bloodleaf Viburnum' },
    bestEchoes: ['Lioness of Glory', 'Flaming Clawprint 4pc'], bestWeapon: 'Wildfire Mark',
    teams: ['Lupa + Brant + Changli', 'Lupa + Aemeath + Mornye'] },
  'Phrolova': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Main DPS',
    desc: 'Fractsidus Overseer and former violinist. Havoc DPS with off-field Hecate summon.',
    skills: ['Void Touch', 'Dark Blessing', 'Chaos Rift', 'Hecate'],
    ascension: { boss: 'Truth in Lies', common: 'Polygon Core', specialty: 'Afterlife' },
    bestEchoes: ['Nightmare: Hecate', 'Dream of the Lost 3pc + Havoc Eclipse 2pc'], bestWeapon: 'Lethean Elegy',
    teams: ['Phrolova + Cantarella + Qiuyuan', 'Phrolova + Cantarella + Shorekeeper'] },
  'Augusta': { rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Ephor of Septimont. Electro DPS with time-stop and innate shielding.',
    skills: ['Thunder Cleave', 'Storm Surge', 'Divine Judgment', 'Crown of Wills'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Tidal Residuum', specialty: 'Luminous Calendula' },
    bestEchoes: ['The False Sovereign', 'Crown of Valor 3pc + Void Thunder 2pc'], bestWeapon: 'Thunderflare Dominion',
    teams: ['Augusta + Iuno + Shorekeeper', 'Augusta + Yinlin + Verina'] },
  'Iuno': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Priestess of Septimont\'s Tetragon Temple. Heavy ATK buffer with healing and shield.',
    skills: ['Temporal Fist', 'Chrono Shift', 'Time Dilation', 'Wan Light'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Sliverglow Bloom' },
    bestEchoes: ['Lady of the Sea', 'Crown of Valor 3pc + Sierra Gale 2pc'], bestWeapon: "Moongazer's Sigil",
    teams: ['Iuno + Augusta + Shorekeeper', 'Iuno + Jiyan + Shorekeeper'] },
  'Galbrena': { rarity: 5, element: 'Fusion', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Black Shores Consultant, the Discord Slayer. Fusion Echo Skill & Heavy ATK hypercarry.',
    skills: ['Light Slash', 'Radiant Barrier', 'Solar Flare', 'Divine Retribution'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Tidal Residuum', specialty: 'Stone Rose' },
    bestEchoes: ['Corrosaurus', "Flamewing's Shadow 3pc + Molten Rift 2pc"], bestWeapon: 'Lux & Umbra',
    teams: ['Galbrena + Qiuyuan + Shorekeeper', 'Galbrena + Lupa + Mornye'] },
  'Qiuyuan': { rarity: 5, element: 'Glacio', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Former Mingting intelligence agent. Echo Skill DMG buffer with Crit DMG Amp.',
    skills: ['Frost Edge', 'Winter Slash', 'Blizzard Dance', 'Eternal Winter'],
    ascension: { boss: 'Truth in Lies', common: 'Whisperin Core', specialty: 'Wintry Bell' },
    bestEchoes: ['Impermanence Heron', 'Freezing Frost 3pc + Sierra Gale 2pc'], bestWeapon: 'Emerald Sentence',
    teams: ['Qiuyuan + Galbrena + Shorekeeper', 'Qiuyuan + Phrolova + Cantarella'] },
  'Chisa': { rarity: 5, element: 'Havoc', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Startorch Academy student. Havoc support with DEF shred and Negative Status stacks.',
    skills: ['Unseen Snare', 'Eye of Unraveling', 'Moment of Nihility', 'Chainsaw Mode'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Summer Flower' },
    bestEchoes: ['Threnodian: Leviathan', 'Thread of Severed Fate 3pc + Sun-Sinking Eclipse 2pc'], bestWeapon: 'Kumokiri',
    teams: ['Chisa + Cartethyia + Ciaccona', 'Chisa + Aemeath + Lynae'] },
  'Lynae': { rarity: 5, element: 'Spectro', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Startorch Academy student and ex-mercenary. Tune Break DMG buffer for Off-Tune teams.',
    skills: ['Light Shot', 'Radiant Bullet', 'Stellar Barrage', 'Supernova'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Sliverglow Bloom' },
    bestEchoes: ['Hyvatia', 'Pact of Neonlight Leap 5pc'], bestWeapon: 'Spectrum Blaster',
    teams: ['Lynae + Mornye + Iuno', 'Lynae + Mornye + Shorekeeper'] },
  'Mornye': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Healer',
    desc: 'Startorch Academy professor. DEF-scaling Fusion healer with Off-Tune Buildup.',
    skills: ['Rest Mass Energy', 'Syntony Field', 'Critical Protocol', 'Tune Rupture Response'],
    ascension: { boss: 'Abyssal Husk', common: 'Tidal Residuum', specialty: 'Summer Flower' },
    bestEchoes: ['Reactor Husk', 'Halo of Starry Radiance 5pc'], bestWeapon: 'Starfield Calibrator',
    teams: ['Mornye + Lynae + Iuno', 'Mornye + Any DPS + Shorekeeper'] },
  'Luuk Herssen': { rarity: 5, element: 'Spectro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Startorch Academy doctor. Aerial Basic ATK Spectro DPS with sustained pressure.',
    skills: ['Golden Reflux', 'Aureole of Execution', 'Scalpel Judgment', 'Ichor Flow'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Lanternberry' },
    bestEchoes: ['Twin Nova: Nebulous Cannon', 'Rite of Gilded Revelation 5pc'], bestWeapon: "Daybreaker's Spine",
    teams: ['Luuk Herssen + Lynae + Mornye', 'Luuk Herssen + Sanhua + Verina'] },
  'Aemeath': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Digital ghost from Startorch Academy. Dual-system Fusion DPS with Tune Rupture and Fusion Burst modes.',
    skills: ['Mech Transform', 'Seraphic Duet', 'Heavenfall Edict', 'Heavenfall Edict: Finale'],
    ascension: { boss: 'Rage Tacet Core', common: 'Tidal Residuum', specialty: 'Pecok Flower' },
    bestEchoes: ['Sigillum', 'Trailblazing Star 5pc'], bestWeapon: 'Everbright Polestar',
    teams: ['Aemeath + Lynae + Mornye', 'Aemeath + Lupa + Mornye'] },
  // 4★ Resonators
  'Aalto': { rarity: 4, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Suave information broker. Aero off-field applicator.',
    skills: ['Mist Bullets', 'Shift Trick', 'Flower in the Mist', 'Mist Avatar'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Wintry Bell' },
    bestEchoes: ['Cyan Feathered Heron', 'Sierra Gale 4pc'], bestWeapon: 'Static Mist',
    teams: ['Aalto + Jiyan + Verina', 'Aalto + Aero DPS + Shorekeeper'] },
  'Baizhi': { rarity: 4, element: 'Glacio', weapon: 'Rectifier', role: 'Healer',
    desc: "Huaxu Academy researcher with companion You'an. Free-to-play healer.",
    skills: ['Destined Promise', 'Emergency Plan', 'Momentary Union', 'Rejuvenation'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Howler Core', specialty: 'Belle Poppy' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 4pc'], bestWeapon: 'Variation',
    teams: ['Any team needing F2P healer'] },
  'Chixia': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Enthusiastic patroller with dual pistols. Fusion DPS.',
    skills: ['POW POW', 'Whizzing Fight Spirit', 'Blazing Flames', 'Burning Burst'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    bestEchoes: ['Inferno Rider', 'Molten Rift 4pc'], bestWeapon: 'Static Mist',
    teams: ['Chixia + Changli + Verina', 'Chixia + Mortefi + Baizhi'] },
  'Danjin': { rarity: 4, element: 'Havoc', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Midnight Ranger with HP consumption. Havoc DMG Bonus buffer.',
    skills: ['Roaming Dragon', 'Crimson Fragment', 'Crimson Erosion', 'Sanguine Pulse'],
    ascension: { boss: 'Group Abomination Tacet Core', common: 'Ring', specialty: 'Wintry Bell' },
    bestEchoes: ['Impermanence Heron', 'Sun-Sinking Eclipse 4pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Danjin + Camellya + Shorekeeper', 'Danjin + Havoc DPS + Verina'] },
  'Yangyang': { rarity: 4, element: 'Aero', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Midnight Rangers outrider. Free starter Aero Energy battery.',
    skills: ['Feather as Blade', 'Zephyr Domain', 'Wind Spirals', 'Cerulean Song'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Ring', specialty: 'Wintry Bell' },
    bestEchoes: ['Cyan Feathered Heron', 'Sierra Gale 4pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Yangyang + Jiyan + Baizhi', 'Yangyang + Jiyan + Verina'] },
  'Sanhua': { rarity: 4, element: 'Glacio', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Jinhsi\'s personal guard. Quick-swap Basic ATK Amp buffer.',
    skills: ['Frigid Light', 'Eternal Frost', 'Glacial Gaze', 'Ice Prism'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Ring', specialty: 'Coriolus' },
    bestEchoes: ['Crownless', 'Freezing Frost 4pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Sanhua + Camellya + Verina', 'Sanhua + Any Basic ATK DPS + Healer'] },
  'Taoqi': { rarity: 4, element: 'Havoc', weapon: 'Broadblade', role: 'Support',
    desc: 'Border defense director. Shielder with Resonance Skill DMG Deepen.',
    skills: ['Concealed Edge', 'Fortified Defense', 'Iron Will', 'Rocksteady Shield'],
    ascension: { boss: 'Group Abomination Tacet Core', common: 'Whisperin Core', specialty: 'Lanternberry' },
    bestEchoes: ['Bell-Borne Geochelone', 'Moonlit Clouds 4pc'], bestWeapon: 'Discord',
    teams: ['Taoqi + Jinhsi + Verina', 'Taoqi + DPS + Healer'] },
  'Yuanwu': { rarity: 4, element: 'Electro', weapon: 'Gauntlets', role: 'Support',
    desc: 'Boxing gym owner. Electro Coordinated Attacks and shields.',
    skills: ['Leihuangquan', 'Thunder Wedge', 'Blazing Might', 'Rumbling Spark'],
    ascension: { boss: 'Thundering Tacet Core', common: 'Ring', specialty: 'Iris' },
    bestEchoes: ['Thundering Mephis', 'Rejuvenating Glow 4pc'], bestWeapon: 'Marcato',
    teams: ['Yuanwu + Jinhsi + Verina', 'Yuanwu + Electro DPS + Healer'] },
  'Mortefi': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Hot-tempered researcher. Heavy ATK DMG buffer via Coordinated Attacks.',
    skills: ['Impromptu', 'Passionate Variation', 'Violent Finale', 'Fury Fugue'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Lanternberry' },
    bestEchoes: ['Inferno Rider', 'Moonlit Clouds 4pc'], bestWeapon: 'Static Mist',
    teams: ['Mortefi + Jiyan + Verina', 'Mortefi + Heavy ATK DPS + Shorekeeper'] },
  'Youhu': { rarity: 4, element: 'Glacio', weapon: 'Gauntlets', role: 'Support',
    desc: 'Whimsical antique appraiser. Glacio healer with Coordinated ATK Amp.',
    skills: ['Frosty Punch', 'Lucky Draw', 'Fortune Blast', 'Icy Gourd'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Ring', specialty: 'Coriolus' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 4pc'], bestWeapon: 'Marcato',
    teams: ['Youhu + Glacio DPS + Sub DPS'] },
  'Lumi': { rarity: 4, element: 'Electro', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Lollo Logistics navigator. Electro sub-DPS with Res. Skill DMG Amp via Outro.',
    skills: ['Electro Slash', 'Thundering Voyage', 'Storm Navigator', 'Arc Discharge'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Whisperin Core', specialty: "Loong's Pearl" },
    bestEchoes: ['Bell-Borne Geochelone', 'Moonlit Clouds 4pc'], bestWeapon: 'Discord',
    teams: ['Lumi + Carlotta + Shorekeeper', 'Lumi + Any Res. Skill DPS + Healer'] },
  'Buling': { rarity: 4, element: 'Electro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Taoist of Mengzhou. Black Shores Consultant, feng shui master. Universal support with Electro Flare and Res. Skill DMG buff.',
    skills: ['Trigram Attacks', 'Thundershock Wave', 'Flashing Thunder Seal', 'Yin-Yang Balance'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc'], bestWeapon: 'Variation',
    teams: ['Buling + Carlotta + Zhezhi', 'Buling + Any DPS + Sub DPS'] },
};

// [SECTION:WEAPON_DATA]
const WEAPON_DATA = {
  // 5★ Weapons
  'Verdant Summit': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate',
    desc: 'Jiyan signature. Increases Resonance Skill DMG after Heavy Attack hits.',
    passive: 'Heavy Attack hits grant Resonance Skill DMG +20%', bestFor: ['Jiyan'] },
  'Lustrous Razor': { rarity: 5, type: 'Broadblade', stat: 'ATK%',
    desc: 'Standard 5★ Broadblade. Electro DMG and combo finisher boost.',
    passive: 'ATK +12%, Electro DMG +12% on combo finisher', bestFor: ['Calcharo'] },
  'Emerald of Genesis': { rarity: 5, type: 'Sword', stat: 'Crit Rate',
    desc: 'Standard 5★. Increases ATK after using Resonance Skill.',
    passive: 'Resonance Skill use grants ATK +12%', bestFor: ['Danjin', 'Yangyang'] },
  'Static Mist': { rarity: 5, type: 'Pistols', stat: 'Crit Rate',
    desc: 'Standard 5★. Energy regeneration and ATK boost.',
    passive: 'Energy Regen +12%, ATK +12% when full energy', bestFor: ['Mortefi', 'Aalto'] },
  'Abyss Surges': { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate',
    desc: 'Standard 5★. Increases ATK based on energy consumed.',
    passive: 'ATK +8% per 10 energy consumed, max 4 stacks', bestFor: ['Jianxin', 'Lingyang'] },
  'Cosmic Ripples': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate',
    desc: 'Standard 5★. Basic Attack DMG increase.',
    passive: 'Basic Attack DMG +12%, stacks on hit', bestFor: ['Encore', 'Verina'] },
  'Stringmaster': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG',
    desc: 'Yinlin signature. Increases Resonance Skill DMG.',
    passive: 'Resonance Skill DMG +24%, Crit Rate +8%', bestFor: ['Yinlin'] },
  'Ages of Harvest': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG',
    desc: 'Jinhsi signature. Spectro DMG and Liberation buff.',
    passive: 'Spectro DMG +12%, Liberation DMG +24%', bestFor: ['Jinhsi'] },
  'Blazing Brilliance': { rarity: 5, type: 'Sword', stat: 'Crit DMG',
    desc: 'Changli signature. Fusion DMG and Skill Enhancement.',
    passive: 'Fusion DMG +12%, Resonance Skill +24%', bestFor: ['Changli'] },
  'Rime-Draped Sprouts': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG',
    desc: 'Zhezhi signature. Increases off-field DMG.',
    passive: 'Off-field DMG +24%, Glacio DMG +12%', bestFor: ['Zhezhi'] },
  "Verity's Handle": { rarity: 5, type: 'Gauntlets', stat: 'Crit DMG',
    desc: 'Xiangli Yao signature. Electro and mech bonuses.',
    passive: 'Electro DMG +12%, Mech form +24%', bestFor: ['Xiangli Yao'] },
  'Stellar Symphony': { rarity: 5, type: 'Rectifier', stat: 'Energy Regen',
    desc: 'Shorekeeper signature. Ultimate support weapon.',
    passive: 'Energy Regen +20%, team ATK buff +20%', bestFor: ['Shorekeeper'] },
  'Red Spring': { rarity: 5, type: 'Sword', stat: 'Crit Rate',
    desc: 'Camellya signature. Havoc DMG amplification.',
    passive: 'Havoc DMG +12%, Skill DMG +24%', bestFor: ['Camellya'] },
  'The Last Dance': { rarity: 5, type: 'Pistols', stat: 'Crit DMG',
    desc: 'Carlotta signature. Glacio and charged attack focus.',
    passive: 'Glacio DMG +12%, Charged ATK +24%', bestFor: ['Carlotta'] },
  'Tragicomedy': { rarity: 5, type: 'Gauntlets', stat: 'ATK%',
    desc: 'Roccia signature. Support gauntlets.',
    passive: 'Team ATK +12%, Outro Skill +24%', bestFor: ['Roccia'] },
  'Luminous Hymn': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG',
    desc: 'Phoebe signature. Spectro DPS rectifier.',
    passive: 'Spectro DMG +12%, Card skills +24%', bestFor: ['Phoebe'] },
  'Unflickering Valor': { rarity: 5, type: 'Sword', stat: 'Crit Rate',
    desc: 'Brant signature. Aggressive Fusion sword.',
    passive: 'Fusion DMG +12%, ATK speed +10%', bestFor: ['Brant'] },
  'Whispers of Sirens': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG',
    desc: 'Cantarella signature. Havoc rectifier.',
    passive: 'Havoc DMG +12%, Off-field +24%', bestFor: ['Cantarella'] },
  'Blazing Justice': { rarity: 5, type: 'Gauntlets', stat: 'Crit DMG',
    desc: 'Zani signature. Spectro DPS gauntlets with DEF ignore and Frazzle Amp.',
    passive: 'ATK +24%, Spectro Frazzle DMG Amp +50%, DEF Ignore +16%', bestFor: ['Zani'] },
  'Woodland Aria': { rarity: 5, type: 'Pistols', stat: 'Crit Rate',
    desc: 'Ciaccona signature. Aero Erosion pistols with Aero RES shred.',
    passive: 'ATK +12%, Aero DMG +24% on Erosion, Aero RES -16%', bestFor: ['Ciaccona'] },
  "Defier's Thorn": { rarity: 5, type: 'Sword', stat: 'HP%',
    desc: 'Cartethyia signature. Aero sword with HP scaling and DEF ignore.',
    passive: 'HP +24%, DEF Ignore +16% on Aero Eroded targets', bestFor: ['Cartethyia'] },
  'Wildfire Mark': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG',
    desc: 'Lupa signature. Fusion broadblade with Liberation DMG boost and team buff.',
    passive: 'ATK +12%, Res. Liberation DMG +24%, team Fusion DMG +24%', bestFor: ['Lupa'] },
  'Lethean Elegy': { rarity: 5, type: 'Rectifier', stat: 'ATK%',
    desc: 'Phrolova signature. Havoc support.',
    passive: 'Havoc DMG +12%, Team buff +20%', bestFor: ['Phrolova'] },
  'Thunderflare Dominion': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG',
    desc: 'Augusta signature. Electro broadblade.',
    passive: 'Electro DMG +12%, Heavy ATK +24%', bestFor: ['Augusta'] },
  "Moongazer's Sigil": { rarity: 5, type: 'Gauntlets', stat: 'Energy Regen',
    desc: 'Iuno signature. Aero support gauntlets.',
    passive: 'Aero DMG +12%, Time skills +24%', bestFor: ['Iuno'] },
  'Lux & Umbra': { rarity: 5, type: 'Pistols', stat: 'Crit Rate',
    desc: 'Galbrena signature. Fusion pistols.',
    passive: 'Fusion DMG +12%, Liberation +24%', bestFor: ['Galbrena'] },
  'Emerald Sentence': { rarity: 5, type: 'Sword', stat: 'Crit DMG',
    desc: 'Qiuyuan signature. Glacio sword.',
    passive: 'Glacio DMG +12%, Skill +24%', bestFor: ['Qiuyuan'] },
  'Kumokiri': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate',
    desc: 'Chisa signature. Havoc broadblade with Negative Status synergy and team DMG buff.',
    passive: 'ATK +12%, Res. Liberation DMG +24%, All-Type DMG +24% at max stacks', bestFor: ['Chisa'] },
  'Spectrum Blaster': { rarity: 5, type: 'Pistols', stat: 'Crit DMG',
    desc: 'Lynae signature. Spectro pistols.',
    passive: 'Spectro DMG +12%, Charged +24%', bestFor: ['Lynae'] },
  'Starfield Calibrator': { rarity: 5, type: 'Broadblade', stat: 'Energy Regen',
    desc: 'Mornye signature. Fusion broadblade with DEF scaling and Crit DMG team buff.',
    passive: 'DEF +32%, Concerto +16, team Crit DMG +40% on heal', bestFor: ['Mornye'] },
  'Everbright Polestar': { rarity: 5, type: 'Sword', stat: 'Crit Rate',
    desc: 'Aemeath signature. Fusion sword with DEF Ignore and Fusion RES Ignore.',
    passive: 'All-Attr DMG +12%, DEF Ignore +32%, Fusion RES Ignore +10%', bestFor: ['Aemeath'] },
  "Daybreaker's Spine": { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate',
    desc: 'Luuk Herssen signature. Spectro gauntlets with aerial combat enhancement.',
    passive: 'ATK +12%, Basic ATK DMG Amp +20%, Spectro DMG +20%, DEF Ignore +10%', bestFor: ['Luuk Herssen'] },
  // Standard 5★ Weapons (Lustrous Tide pool - v3.0)
  'Radiance Cleaver': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate',
    desc: 'Standard 5★ Broadblade. Enhances Heavy Attack damage.',
    passive: 'Heavy ATK DMG +12%, ATK +12% on hit', bestFor: ['Broadblade users'] },
  'Laser Shearer': { rarity: 5, type: 'Sword', stat: 'Crit Rate',
    desc: 'Standard 5★ Sword. Energy and Skill DMG synergy.',
    passive: 'Energy Regen +12%, Res. Skill DMG +12%', bestFor: ['Sword users'] },
  'Phasic Homogenizer': { rarity: 5, type: 'Pistols', stat: 'Crit Rate',
    desc: 'Standard 5★ Pistols. Off-field and Liberation synergy.',
    passive: 'Off-field DMG +12%, Res. Liberation +12%', bestFor: ['Pistol users'] },
  'Pulsation Bracer': { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate',
    desc: 'Standard 5★ Gauntlets. Coordinated Attack enhancement.',
    passive: 'Coordinated ATK +12%, ATK +12% on swap', bestFor: ['Gauntlet users'] },
  'Boson Astrolabe': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate',
    desc: 'Standard 5★ Rectifier. Healing and team ATK boost.',
    passive: 'Healing +12%, team ATK +12% on heal', bestFor: ['Rectifier users'] },
  // 4★ Weapons (selected important ones)
  'Discord': { rarity: 4, type: 'Broadblade', stat: 'ATK%',
    desc: 'Battle Pass broadblade. Good general option.',
    passive: 'Resonance Skill +16%', bestFor: ['Taoqi', 'Any Broadblade'] },
  'Variation': { rarity: 4, type: 'Rectifier', stat: 'Energy Regen',
    desc: 'Free healing rectifier. Good for supports.',
    passive: 'Healing +15%, Energy +12%', bestFor: ['Baizhi', 'Healers'] },
  'Marcato': { rarity: 4, type: 'Gauntlets', stat: 'ATK%',
    desc: 'Battle Pass gauntlets. General DPS option.',
    passive: 'ATK +12% on skill use', bestFor: ['Yuanwu', 'Gauntlet users'] },
  'Lunar Cutter': { rarity: 4, type: 'Sword', stat: 'ATK%',
    desc: 'Free sword. Solid general choice.',
    passive: 'Basic ATK +16%', bestFor: ['Sword users'] },
  'Thunderbolt': { rarity: 4, type: 'Pistols', stat: 'ATK%',
    desc: 'Free pistols. Good starter option.',
    passive: 'Electro DMG +12%', bestFor: ['Pistol users'] },
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
    // Mon, 19 Jan 2026 04:00 - Mon, 16 Feb 2026 03:59 (Europe)
    // Feb 16, 03:59 Europe = Feb 16, 02:59 UTC
    currentEnd: '2026-02-16T02:59:00Z',
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
    rewards: '300 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-purple-900/30',
    accentColor: 'purple',
    imageUrl: 'https://i.ibb.co/zcc2MxR/Fantasies-of-the-Thousand-Gateways.jpg'
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════════

const ELEMENT_COLORS = {
  Fusion: { bg: 'rgba(249,115,22,0.2)', border: 'rgb(249,115,22)', text: 'rgb(251,146,60)' },
  Electro: { bg: 'rgba(139,92,246,0.2)', border: 'rgb(139,92,246)', text: 'rgb(167,139,250)' },
  Aero: { bg: 'rgba(16,185,129,0.2)', border: 'rgb(16,185,129)', text: 'rgb(52,211,153)' },
  Glacio: { bg: 'rgba(6,182,212,0.2)', border: 'rgb(6,182,212)', text: 'rgb(34,211,238)' },
  Havoc: { bg: 'rgba(236,72,153,0.2)', border: 'rgb(236,72,153)', text: 'rgb(244,114,182)' },
  Spectro: { bg: 'rgba(234,179,8,0.2)', border: 'rgb(234,179,8)', text: 'rgb(250,204,21)' },
};

// [SECTION:CONSTANTS]
// WuWa gacha rates: 0.8% base, soft pity starts at 65, hard pity at 80
const HARD_PITY = 80, SOFT_PITY_START = 65; // AVG_PITY removed — P8-FIX: was unused dead code
const LUNITE_DAILY_ASTRITE = 90; // P7-FIX: Extract magic number (7E)
const ASTRITE_PER_PULL = 160;

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
const AVG_PITY_4STAR = 8.5; // Average pulls per 4★
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
  'Emerald Sentence': 'https://i.ibb.co/chmx3GgM/Emerald-Sentence.webp',
  'Kumokiri': 'https://i.ibb.co/VWxG9pSF/Kumokiri.webp',
  'Spectrum Blaster': 'https://i.ibb.co/qLC341Sv/Spectrum-Blaster.webp',
  'Starfield Calibrator': 'https://i.ibb.co/tTDkFQ7W/Starfield-Calibrator.webp',
  // v3.1 weapons - using placeholder until official images available
  'Everbright Polestar': 'https://i.ibb.co/4g4RbTv7/Weapon-Everbright-Polestar.webp',
  "Daybreaker's Spine": 'https://i.ibb.co/tpn30Lrm/6982b58a79a3b099e1bd0d48i-CAFZ7lo03.webp',
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
  'Scale Slasher': 'https://i.ibb.co/Ng7QmthQ/Scale-Slasher.webp',
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
  'Broadblade of Night': 'https://i.ibb.co/m5kvbBJH/Broadblade-of-Night.webp',
  'Discord': 'https://i.ibb.co/p6L36v9V/Discord.webp',
  // Gauntlets
  'Tyro Gauntlets': 'https://i.ibb.co/NgZL4WFR/Tyro-Gauntlets.webp',
  'Training Gauntlets': 'https://i.ibb.co/b50Nnc2w/Training-Gauntlets.webp',
  'Hollow Mirage': 'https://i.ibb.co/JjP9sjJm/Hollow-Mirage.webp',
  'Stonard': 'https://i.ibb.co/yn59hz0y/Stonard.webp',
  'Gauntlets#21': 'https://i.ibb.co/XxFKztMj/Gauntlets21-D.webp',
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
  // 3.1 (unreleased)
  'Aemeath', 'Luuk Herssen',
];

// All known character names (for filtering weapons vs characters)
const ALL_CHARACTERS = new Set([
  // 5★
  'Rover', 'Jiyan', 'Yinlin', 'Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina',
  'Jinhsi', 'Changli', 'Zhezhi', 'Xiangli Yao', 'Shorekeeper', 'Camellya',
  'Carlotta', 'Roccia', 'Phoebe', 'Brant', 'Cantarella', 'Zani', 'Ciaccona',
  'Cartethyia', 'Lupa', 'Phrolova', 'Augusta', 'Iuno', 'Galbrena', 'Qiuyuan',
  'Chisa', 'Lynae', 'Mornye', 'Luuk Herssen', 'Aemeath',
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
  'Chisa', 'Lynae', 'Mornye', 'Luuk Herssen', 'Aemeath',
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
  "Defier's Thorn", 'Wildfire Mark', 'Lethean Elegy', 'Thunderflare Dominion', "Moongazer's Sigil",
  'Lux & Umbra', 'Emerald Sentence', 'Kumokiri', 'Spectrum Blaster', 'Starfield Calibrator',
  'Everbright Polestar', "Daybreaker's Spine",
  'Radiance Cleaver', 'Laser Shearer', 'Phasic Homogenizer', 'Pulsation Bracer', 'Boson Astrolabe',
];

const ALL_4STAR_WEAPONS = [
  'Overture', "Ocean's Gift", "Bloodpact's Pledge", 'Waltz in Masquerade', 'Legend of Drunken Hero',
  'Romance in Farewell', 'Fables of Wisdom', 'Meditations on Mercy', 'Call of the Abyss',
  'Somnoire Anchor', 'Fusion Accretion', 'Celestial Spiral', 'Relativistic Jet', 'Endless Collapse',
  'Waning Redshift', 'Beguiling Melody', 'Lumingloss', 'Lunar Cutter', 'Commando of Conviction',
  'Scale Slasher', 'Jinzhou Keeper', 'Comet Flare', 'Augment', 'Variation', 'Hollow Mirage',
  'Stonard', 'Amity Accord', 'Marcato', 'Novaburst', 'Thunderbolt', 'Undying Flame', 'Cadenza',
  'Discord', 'Helios Cleaver', 'Dauntless Evernight',
  'Autumntrace', 'Solar Flame', 'Feather Edge',
];

const ALL_3STAR_WEAPONS = [
  'Training Sword', 'Tyro Sword', 'Guardian Sword', 'Sword of Voyager', 'Originite: Type II',
  'Sword of Night', 'Sword#18', 'Training Rectifier', 'Tyro Rectifier', 'Guardian Rectifier',
  'Rectifier of Voyager', 'Rectifier of Night', 'Originite: Type V', 'Rectifier#25',
  'Training Gauntlets', 'Tyro Gauntlets', 'Guardian Gauntlets', 'Gauntlets of Voyager',
  'Gauntlets of Night', 'Originite: Type III', 'Gauntlets#21', 'Training Pistols', 'Tyro Pistols',
  'Guardian Pistols', 'Pistols of Voyager', 'Pistols of Night', 'Originite: Type IV', 'Pistols#26',
  'Broadblade of Night', 'Broadblade of Voyager', 'Originite: Type I',
  'Aureate Zenith', 'Radiant Dawn', 'Aether Strike',
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
  'Lethean Elegy',
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
];

// Tab navigation order for swipe gestures
const TAB_ORDER = ['tracker', 'events', 'calculator', 'planner', 'analytics', 'gathering', 'profile'];

// Podium medal colors (gold, silver, bronze) for leaderboard/ranking displays
const MEDAL_COLORS = ['#fbbf24', '#c0c0c0', '#cd7f32'];

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS - Used by App.jsx (WhisperingWishesInner)
// ═══════════════════════════════════════════════════════════════════════════════

export {
  APP_VERSION, MAX_IMPORT_SIZE_MB, HEADER_ICON, haptic, generateUniqueId,
  LUCK_MEAN_PITY, LUCK_STD_DEV_SINGLE, calculateLuckRating,
  SERVERS, getServerOffset,
  CURRENT_BANNERS, BANNER_HISTORY, CHARACTER_DATA, WEAPON_DATA,
  EVENTS, ELEMENT_COLORS,
  HARD_PITY, SOFT_PITY_START, LUNITE_DAILY_ASTRITE, ASTRITE_PER_PULL,
  SUBSCRIPTIONS, MAX_ASTRITE, MAX_CALC_PULLS,
  HARD_PITY_4STAR, AVG_PITY_4STAR, FEATURED_4STAR_RATE,
  DEFAULT_COLLECTION_IMAGES, RELEASE_ORDER, WEAPON_RELEASE_ORDER,
  ALL_5STAR_RESONATORS, ALL_5STAR_WEAPONS,
  ALL_4STAR_RESONATORS, ALL_4STAR_WEAPONS, ALL_3STAR_WEAPONS,
  ALL_CHARACTERS, STANDARD_5STAR_CHARACTERS, STANDARD_5STAR_WEAPONS,
  TAB_ORDER, MEDAL_COLORS,
};
