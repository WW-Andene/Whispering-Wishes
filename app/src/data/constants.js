// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/constants.js
// App version, gacha rates, server data, material data, weapon arrays,
// and all game constants.
// ═══════════════════════════════════════════════════════════════════════════════

const APP_VERSION = '3.5.0';
const MAX_IMPORT_SIZE_MB = 5; // P7-FIX: Import file size limit constant (7E)

// Header icon (Radiant Tide emblem)
const HEADER_ICON = './WW_Radiant_Tide.png.png';
// Previously was base64 data URI — replaced with public asset

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
// WuWa gacha rates: 0.8% base, soft pity at 66, hard pity at 80
// Verified: community data mining (Steam analysis, pull trackers) confirms soft pity starts at pull 66
// Pulls 1-65: flat 0.8%. Pulls 66-79: linear ramp ~6.6%/pull. Pull 80: guaranteed.
const HARD_PITY = 80, SOFT_PITY_START = 66;
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
