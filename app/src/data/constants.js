// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/constants.js
// App version, gacha rates, server data, material data, weapon arrays,
// and all game constants.
// ═══════════════════════════════════════════════════════════════════════════════

const APP_VERSION = '3.2.3';
const MAX_IMPORT_SIZE_MB = 5; // P7-FIX: Import file size limit constant (7E)

// Header icon (uploaded app icon)
const HEADER_ICON = 'data:image/png;base64,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';

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
  lunite: { name: 'Lunite Subscription', price: 4.99, astrite: 2700, lunite: 300, daily: 90, duration: 30, desc: '90 Astrite/day × 30 days + 300 Lunite' },
  weekly: { name: 'Weekly Subscription', price: 9.99, astrite: 1600, lunite: 680, duration: 7, desc: '1600 Astrite + 680 Lunite over 7 days' },
  bpInsider: { name: 'Pioneer Podcast - Insider', price: 9.99, astrite: 680, radiant: 5, lustrous: 2, desc: '680 Astrite + 5 Radiant Tides + 2 Lustrous Tides' },
  bpConnoisseur: { name: 'Pioneer Podcast - Connoisseur', price: 19.99, astrite: 680, radiant: 5, lustrous: 5, desc: '680 Astrite + 5 Radiant Tides + 5 Lustrous Tides' },
  directTop60: { name: 'Direct Top-Up (60)', price: 0.99, lunite: 60, desc: '60 Lunite' },
  directTop300: { name: 'Direct Top-Up (300)', price: 4.99, lunite: 300, desc: '300 Lunite' },
  directTop980: { name: 'Direct Top-Up (980)', price: 14.99, lunite: 980, desc: '980 Lunite' },
  directTop1980: { name: 'Direct Top-Up (1980)', price: 29.99, lunite: 1980, desc: '1980 Lunite' },
  directTop3280: { name: 'Direct Top-Up (3280)', price: 49.99, lunite: 3280, desc: '3280 Lunite' },
  directTop6480: { name: 'Direct Top-Up (6480)', price: 99.99, lunite: 6480, desc: '6480 Lunite' },
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
// Exact expected value: Σ(k=1..9) k×0.06×0.94^(k-1) + 10×0.94^9 ≈ 7.69 pulls per 4-star
const AVG_PULLS_PER_4STAR = 7.69;
// 50/50 + guarantee system: average 1.5 four-star pulls per featured copy
const AVG_4STAR_PULLS_PER_FEATURED = 1.5;
const LEADERBOARD_DISPLAY_LIMIT = 20;

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

// P9-FIX: Include ALL standard pool weapons — original 5 + Lustrous Razor + v3.0 Synth Armament series
// Must match CURRENT_BANNERS.standardWeapons for correct import history 50/50 tracking
const STANDARD_5STAR_WEAPONS = new Set([
  'Verdant Summit', 'Lustrous Razor', 'Emerald of Genesis', 'Static Mist', 'Abyss Surges', 'Cosmic Ripples',
  'Radiance Cleaver', 'Laser Shearer', 'Phasic Homogenizer', 'Pulsation Bracer', 'Boson Astrolabe',
]);

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

export {
  APP_VERSION,
  MAX_IMPORT_SIZE_MB,
  HEADER_ICON,
  SERVERS,
  getServerOffset,
  HARD_PITY,
  SOFT_PITY_START,
  LUNITE_DAILY_ASTRITE,
  ASTRITE_PER_PULL,
  BEGINNER_ASTRITE_PER_PULL,
  SUBSCRIPTIONS,
  MAX_ASTRITE,
  MAX_CALC_PULLS,
  HARD_PITY_4STAR,
  FEATURED_4STAR_RATE,
  AVG_PULLS_PER_4STAR,
  AVG_4STAR_PULLS_PER_FEATURED,
  LEADERBOARD_DISPLAY_LIMIT,
  MATERIAL_IMAGES,
  COMMON_MAT_TIERS,
  FORGERY_MAT_TIERS,
  RESONATOR_ASCENSION_COSTS,
  RESONATOR_EXP_COSTS,
  SKILL_UPGRADE_COSTS,
  WEAPON_REFINE_SCALE,
  WEAPON_ASCENSION_COSTS_5,
  WEAPON_ASCENSION_COSTS_4,
  WEAPON_EXP_COSTS_5,
  WEAPON_EXP_COSTS_4,
  STANDARD_5STAR_WEAPONS,
  ALL_5STAR_WEAPONS,
  ALL_4STAR_WEAPONS,
  ALL_3STAR_WEAPONS,
  ALL_2STAR_WEAPONS,
  ALL_1STAR_WEAPONS,
  WEAPON_RELEASE_ORDER,
  TAB_ORDER,
  MEDAL_COLORS,
};
