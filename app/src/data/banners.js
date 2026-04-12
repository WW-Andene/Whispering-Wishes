// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/banners.js
// Current banners, banner history, events, default collection images,
// and character themes.
// ═══════════════════════════════════════════════════════════════════════════════


// [SECTION:BANNERS]
const CURRENT_BANNERS = {
  version: '3.2', phase: 2, // Game version (not app version)
  // Times from Fandom wiki (Server Time reference, converted to UTC)
  // Apr 9 is CEST (UTC+2). Banner: Thu, 09 Apr 2026 10:00 CEST - Wed, 29 Apr 2026 11:59 CEST
  startDate: '2026-04-09T08:00:00Z', // Apr 09, 10:00 CEST (UTC+2) = 08:00 UTC
  endDate: '2026-04-29T09:59:00Z',   // Apr 29, 11:59 CEST (UTC+2) = 09:59 UTC
  characterBannerImage: 'https://i.ibb.co/q3HW3sGP/Lynae.jpg',
  weaponBannerImage: 'https://i.ibb.co/Q3Yht20g/Spectrum-Blaster.jpg',
  eventBannerImage: 'https://i.ibb.co/q3HW3sGP/Lynae.jpg',
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
    { id: 'lynae', name: 'Lynae', title: 'Undefined Spectrum', element: 'Spectro', weaponType: 'Pistols', isNew: false, featured4Stars: ['Taoqi', 'Youhu', 'Danjin'], imageUrl: 'https://i.ibb.co/q3HW3sGP/Lynae.jpg', imagePosition: 'center 15%' },
    { id: 'zani', name: 'Zani', title: 'Between Light and Shadow', element: 'Spectro', weaponType: 'Gauntlets', isNew: false, featured4Stars: ['Taoqi', 'Youhu', 'Danjin'], imageUrl: 'https://i.ibb.co/V08JgCGf/Zani.jpg', imagePosition: 'center 15%' },
    { id: 'phoebe', name: 'Phoebe', title: 'With Hushed Whispers', element: 'Spectro', weaponType: 'Rectifier', isNew: false, featured4Stars: ['Taoqi', 'Youhu', 'Danjin'], imageUrl: 'https://i.ibb.co/tPxL5gmR/Phoebe.jpg', imagePosition: 'center 15%' },
  ],
  weapons: [
    { id: 'spectrum-blaster', name: 'Spectrum Blaster', title: 'Absolute Pulsation', type: 'Pistols', forCharacter: 'Lynae', element: 'Spectro', isNew: false, featured4Stars: ['Endless Collapse', 'Celestial Spiral', 'Lunar Cutter'], imageUrl: 'https://i.ibb.co/Q3Yht20g/Spectrum-Blaster.jpg' },
    { id: 'blazing-justice', name: 'Blazing Justice', title: 'Absolute Pulsation', type: 'Gauntlets', forCharacter: 'Zani', element: 'Spectro', isNew: false, featured4Stars: ['Endless Collapse', 'Celestial Spiral', 'Lunar Cutter'], imageUrl: 'https://i.ibb.co/N6D53FRt/Blazing-Justice.jpg' },
    { id: 'luminous-hymn', name: 'Luminous Hymn', title: 'Absolute Pulsation', type: 'Rectifier', forCharacter: 'Phoebe', element: 'Spectro', isNew: false, featured4Stars: ['Endless Collapse', 'Celestial Spiral', 'Lunar Cutter'], imageUrl: 'https://i.ibb.co/8Q0MCnz/Luminous-Hymn.jpg' },
  ],
  // Standard Resonator Banner (Lustrous Tide)
  standardCharacters: ['Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina'],
  // Standard Weapon Banner (Utterance of Marvels)
  standardWeapons: [
    { name: 'Verdant Summit', type: 'Broadblade' },
    { name: 'Lustrous Razor', type: 'Broadblade' },
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
  { id: 'v3.2-p2', version: '3.2', phase: 2, characters: ['Lynae', 'Zani', 'Phoebe'], weapons: ['Spectrum Blaster', 'Blazing Justice', 'Luminous Hymn'], startDate: '2026-04-09', endDate: '2026-04-29', bannerArt: 'https://i.ibb.co/q3HW3sGP/Lynae.jpg' },
  { id: 'v3.2-p1', version: '3.2', phase: 1, characters: ['Sigrika', 'Qiuyuan'], weapons: ['Solsworn Ciphers', 'Emerald Sentence'], startDate: '2026-03-19', endDate: '2026-04-09', bannerArt: 'https://i.ibb.co/s9ws1Zf1/Sigrika-Banner-Art.jpg' },
  // Version 3.1
  { id: 'v3.1-p2', version: '3.1', phase: 2, characters: ['Luuk Herssen', 'Galbrena'], weapons: ["Daybreaker's Spine", 'Lux & Umbra'], startDate: '2026-02-26', endDate: '2026-03-18', bannerArt: 'https://i.ibb.co/DPcdf0RY/Luuk-Hersen-Banner-Art.jpg' },
  { id: 'v3.1-p1', version: '3.1', phase: 1, characters: ['Aemeath', 'Chisa', 'Lupa'], weapons: ['Everbright Polestar', 'Kumokiri', 'Wildfire Mark'], startDate: '2026-02-05', endDate: '2026-02-26', bannerArt: 'https://i.ibb.co/YFQBgJ8W/Aemaeth-Banner-Art.jpg' },
  // Version 3.0
  { id: 'v3.0-p2', version: '3.0', phase: 2, characters: ['Mornye', 'Augusta', 'Iuno'], weapons: ['Starfield Calibrator', 'Thunderflare Dominion', "Moongazer's Sigil"], startDate: '2026-01-15', endDate: '2026-02-04', bannerArt: 'https://i.ibb.co/cKY4dY6W/Mornye-Banner-Art.png' },
  { id: 'v3.0-p1', version: '3.0', phase: 1, characters: ['Lynae', 'Cartethyia', 'Ciaccona'], weapons: ['Spectrum Blaster', "Defier's Thorn", 'Woodland Aria'], startDate: '2025-12-25', endDate: '2026-01-15', bannerArt: 'https://i.ibb.co/q3HW3sGP/Lynae.jpg' },
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
  { id: 'v2.1-p1', version: '2.1', phase: 1, characters: ['Phoebe'], weapons: ['Luminous Hymn'], startDate: '2025-02-13', endDate: '2025-03-06', bannerArt: 'https://i.ibb.co/tPxL5gmR/Phoebe.jpg' },
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
    rewards: '60 Astrite',
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
    introducedVersion: '1.0', // Originally "Depths of Illusive Realm" (v1.0–v2.0), renamed to current in v2.1
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
    description: 'Permanent combat challenge (Lahai-Roi)',
    resetType: 'Permanent',
    color: 'cyan',
    // Permanent content introduced in v3.0 — not a time-limited event
    // Showing with currentEnd for current version cycle display only
    currentEnd: '2026-04-29T03:59:00Z',
    permanent: true,
    rewards: 'Weekly Rewards',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: 'https://i.ibb.co/CpjDZj8V/652896591-1275960654470518-5091818010205633369-n.jpg'
  },
  endstateMatrix: {
    name: 'Endstate Matrix',
    subtitle: 'Boss Rush',
    description: 'High difficulty boss rush — new in v3.2',
    resetType: 'Multi-version',
    color: 'pink',
    // New in v3.2: First cycle (Doomsday) runs Mar 26 → Apr 30, spans v3.2–v3.4
    currentStart: '2026-03-26T03:00:00Z', // Mar 26, 04:00 CET (UTC+1, pre-DST)
    currentEnd: '2026-04-30T01:59:00Z',   // Apr 30, 03:59 CEST (UTC+2, post-DST)
    introducedVersion: '3.2',
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
    // Mon, 30 Mar 2026 04:00 CEST - Mon, 27 Apr 2026 03:59 CEST (post-DST, UTC+2)
    currentStart: '2026-03-30T02:00:00Z',
    currentEnd: '2026-04-27T01:59:00Z',
    introducedVersion: '1.0', // Since launch
    rewards: '700 Astrite',
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
    // Mon, 16 Mar 2026 04:00 CET - Mon, 13 Apr 2026 03:59 CEST (post-DST, UTC+2)
    currentStart: '2026-03-16T03:00:00Z',
    currentEnd: '2026-04-13T01:59:00Z',
    introducedVersion: '2.1', // Added in v2.1 (Feb 13, 2025)
    rewards: '800 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: 'https://i.ibb.co/HT4RyJBy/Whimpering-Wastes-BG.png'
  },
};

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
  // 1-Cost Echo images
  'Whiff Whaff': 'https://i.ibb.co/TMv3DykJ/Whiff-Whaff.png',
  'Snip Snap': 'https://i.ibb.co/M5CzNd2Z/Snip-Snap.png',
  'Zig Zag': 'https://i.ibb.co/twXBRbPQ/Zigzag.png',
  'Tick Tack': 'https://i.ibb.co/zTw28r3t/Tick-Tack.png',
  'Clang Bang': 'https://i.ibb.co/nqNfQkTY/Clang-Bang.png',
  'Gulpuff': 'https://i.ibb.co/TDX9tTPt/Gulpuff.png',
  'Chirpuff': 'https://i.ibb.co/Q3hR5DgR/Chirpuff.png',
  'Excarat': 'https://i.ibb.co/GQmwQXBz/Excarat.png',
  'Baby Viridblaze Saurian': 'https://i.ibb.co/bgYKXrZY/Baby-Viridblaze-Saurian.png',
  'Sabyr Boar': 'https://i.ibb.co/SDmW9Jwy/Sabyr-Boar.png',
  'Fusion Dreadmane': 'https://i.ibb.co/bjZS0vwn/Fusion-Dreadmane.png',
  'Diamondclaw': 'https://i.ibb.co/tTRpPm5m/Diamondclaw.png',
  'Cruisewing': 'https://i.ibb.co/8DJ1zJ6Q/Cruisewing.png',
  'Hoartoise': 'https://i.ibb.co/B5j9Znwc/Hoartoise.png',
  'Hooscamp': 'https://i.ibb.co/hR9SJCV9/Hooscamp.png',
  'Lava Larva': 'https://i.ibb.co/LzsHbZg3/Lava-Larva.png',
  'Dwarf Cassowary': 'https://i.ibb.co/zWw2yrNK/Dwarf-Cassowary.png',
  'Galescourge Stalker': 'https://i.ibb.co/8LYKBmgY/Galescourge-Stalker.png',
  'Voltscourge Stalker': 'https://i.ibb.co/pBFBn0fC/Voltscourge-Stalker.png',
  'Frostscourge Stalker': 'https://i.ibb.co/fdqK7Myt/Frostscourge-Stalker.png',
  'Aero Drake': 'https://i.ibb.co/1YfjCKtz/Aero-Drake.png',
  'Electro Drake': 'https://i.ibb.co/tfKbcQW/Electro-Drake.png',
  'Glacio Drake': 'https://i.ibb.co/DH0Xc9ds/Glacio-Drake.png',
  'Fusion Drake': 'https://i.ibb.co/WvbT01pq/Fusion-Drake.png',
  'Spectro Drake': 'https://i.ibb.co/Cp8qVJBw/Spectro-Drake.png',
  'Havoc Drake': 'https://i.ibb.co/cS7gy29z/Havoc-Drake.png',
  'Glacio Prism': 'https://i.ibb.co/7dbkDjsZ/Glacio-Prism.png',
  'Fusion Prism': 'https://i.ibb.co/5xYDP9KV/Fusion-Prism.png',
  'Havoc Prism': 'https://i.ibb.co/GvXxrfB8/Havoc-Prism.png',
  'Spectro Prism': 'https://i.ibb.co/mFgskgrq/Spectro-Prism.png',
  'Aero Prism': 'https://i.ibb.co/M5DHh169/Aero-Prism.png',
  'Chop Chop: Headless': 'https://i.ibb.co/KC74nDj/Chop-Chop-Headless.png',
  'Chop Chop: Leftless': 'https://i.ibb.co/7JDFGhXw/Chop-Chop-Leftless.png',
  'Chop Chop: Rightless': 'https://i.ibb.co/Q7kSy8xG/Chop-Chop-Rightless.png',
  'Fae Ignis': 'https://i.ibb.co/zWRyGSZm/Fae-ignis.png',
  'Nimbus Wraith': 'https://i.ibb.co/xStdtLv1/Nimbus-Wraith.png',
  'Hocus Pocus': 'https://i.ibb.co/v4SQcJGL/Hocus-Pocus.png',
  'Lottie Lost': 'https://i.ibb.co/cSTS6Mqq/Lottie-Lost.png',
  'Diggy Duggy': 'https://i.ibb.co/9HRrnmvf/Diggy-Duggy.png',
  'Chest Mimic': 'https://i.ibb.co/6RnrK82j/Chest-Mimic.png',
  'Flora Drone': 'https://i.ibb.co/jYgz8DL/Flora-Drone.png',
  'Mining Drone': 'https://i.ibb.co/4gTgCXhF/Mining-Drone.png',
  'Geospider S4': 'https://i.ibb.co/fYySnfX0/Geospider-S4.png',
  'Young Roseshroom': 'https://i.ibb.co/wrZwHGPY/Young-Roseshroom.png',
  'Vanguard Junrock': 'https://i.ibb.co/2J94GwJ/Vanguard-Junrock.png',
  'Fission Junrock': 'https://i.ibb.co/QjD2Dcgs/Fission-Junrock.png',
  'Golden Junrock': 'https://i.ibb.co/N6mw8bb1/Golden-Junrock.png',
  'Calcified Junrock': 'https://i.ibb.co/jk4DB35N/Calcified-Junrock.png',
  'Electro Predator': 'https://i.ibb.co/M57X0Nsc/Electro-Predator.png',
  'Glacio Predator': 'https://i.ibb.co/jZ5pXHvK/Glacio-Predator.png',
  'Aero Predator': 'https://i.ibb.co/k2qMgVKq/Aero-Predator.png',
  'Fusion Warrior': 'https://i.ibb.co/2JmY21m/Fusion-Warrior.png',
  'Havoc Warrior': 'https://i.ibb.co/zTVJwGWM/Havoc-Warrior.png',
  'La Guardia': 'https://i.ibb.co/S4RZBG3x/La-Guardia.png',
  'Sagittario': 'https://i.ibb.co/k6394kjK/Sagittario.png',
  'Sacerdos': 'https://i.ibb.co/xKZsHqWy/Sacerdos.png',
  'Devotee\'s Flesh': 'https://i.ibb.co/xtnFQwD2/Devotee-s-Flesh.png',
  'Tremor Warrior': 'https://i.ibb.co/fGnyrJ7Z/Tremor-Warrior.png',
  'Zip Zap': 'https://i.ibb.co/B7kNdn3/Zip-Zap.png',
  'Iceglint Dancer': 'https://i.ibb.co/hFzTdNWs/Iceglint-Dancer.png',
  'Shadow Stepper': 'https://i.ibb.co/Pvxw2HHY/Shadow-Stepper.png',
  'Nightmare: Aero Predator': 'https://i.ibb.co/DHJH53q6/Nightmare-Aero-Predator.png',
  'Nightmare: Baby Roseshroom': 'https://i.ibb.co/svLQG3mb/Nightmare-Baby-Roseshroom.png',
  'Nightmare: Baby Viridblaze Saurian': 'https://i.ibb.co/JwzmkJJs/Nightmare-Baby-Viridblaze-Saurian.png',
  'Nightmare: Chirpuff': 'https://i.ibb.co/bgjSz4hN/Nightmare-Chirpuff.png',
  'Nightmare: Dwarf Cassowary': 'https://i.ibb.co/VWhV8chg/Nightmare-Dwarf-Cassowary.png',
  'Nightmare: Electro Predator': 'https://i.ibb.co/6R6r0GDQ/Nightmare-Electro-Predator.png',
  'Nightmare: Glacio Predator': 'https://i.ibb.co/8ngqSSxL/Nightmare-Glacio-Predator.png',
  'Nightmare: Gulpuff': 'https://i.ibb.co/ksZkkZHf/Nightmare-Gulpuff.png',
  'Nightmare: Havoc Warrior': 'https://i.ibb.co/pBBX7ZXS/Nightmare-Havoc-Warrior.png',
  'Nightmare: Tick Tack': 'https://i.ibb.co/yc0hSd53/Nightmare-Tick-Tack.png',
  'Traffic Illuminator': 'https://i.ibb.co/Z60JGz9q/Traffic-Illuminator.png',
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTER THEMES — Curated theme presets based on character banner art & element
// ═══════════════════════════════════════════════════════════════════════════════
const CHARACTER_THEMES = [
  { id: 'sigrika',       name: 'Sigrika',       element: 'Aero',    bannerArt: 'https://i.ibb.co/s9ws1Zf1/Sigrika-Banner-Art.jpg',       pos: { header: '50% 25%', nav: '50% 27%', bg: '64% 50%' } },
  { id: 'qiuyuan',       name: 'Qiuyuan',       element: 'Aero',    bannerArt: 'https://i.ibb.co/yndZmfvB/Qiuyuan-Banner-Art.jpg',       pos: { header: '50% 19%', nav: '50% 21%', bg: '55% 50%' } },
  { id: 'luuk-herssen',  name: 'Luuk Herssen',  element: 'Spectro', bannerArt: 'https://i.ibb.co/DPcdf0RY/Luuk-Hersen-Banner-Art.jpg',   pos: { header: '50% 52%', nav: '50% 52%', bg: '64% 50%' } },
  { id: 'aemeath',       name: 'Aemeath',       element: 'Fusion',  bannerArt: 'https://i.ibb.co/YFQBgJ8W/Aemaeth-Banner-Art.jpg',       pos: { header: '50% 47%', nav: '50% 46%', bg: '73% 50%' } },
  { id: 'mornye',        name: 'Mornye',        element: 'Fusion',  bannerArt: 'https://i.ibb.co/cKY4dY6W/Mornye-Banner-Art.png',        pos: { header: '50% 27%', nav: '50% 27%', bg: '72% 50%' } },
  { id: 'chisa',         name: 'Chisa',         element: 'Havoc',   bannerArt: 'https://i.ibb.co/p6gwfsWC/Chisa-Banner-Art.jpg',         pos: { header: '50% 22%', nav: '50% 24%', bg: '68% 50%' } },
  { id: 'galbrena',      name: 'Galbrena',      element: 'Fusion',  bannerArt: 'https://i.ibb.co/0jJLjwws/Galbrena-Banner-Art.jpg',      pos: { header: '50% 31%', nav: '50% 35%', bg: '60% 50%' } },
  { id: 'iuno',          name: 'Iuno',          element: 'Aero',    bannerArt: 'https://i.ibb.co/xtdnyxRH/Iuno-Banner-Art.png',          pos: { header: '50% 27%', nav: '50% 29%', bg: '66% 50%' } },
  { id: 'augusta',       name: 'Augusta',       element: 'Electro', bannerArt: 'https://i.ibb.co/Hfx3kqG0/Augusta-Banner-Art.jpg',       pos: { header: '50% 36%', nav: '50% 35%', bg: '62% 50%' } },
  { id: 'lupa',          name: 'Lupa',          element: 'Fusion',  bannerArt: 'https://i.ibb.co/bjTy2MYT/Lupa-Banner-Art.jpg',          pos: { header: '52% 56%', nav: '50% 56%', bg: '62% 50%' } },
];

// ═══════════════════════════════════════════════════════════════════════════════
// VERSION SPLASH SCREENS — Official game version key art
// ═══════════════════════════════════════════════════════════════════════════════
const VERSION_SPLASH_SCREENS = [
  { id: 'v3.2', version: '3.2', name: 'Resolution to Illuminate the Shadows', art: 'https://i.ibb.co/7J4nf7jT/3-2-Resolution-to-Illuminate-the-Shadows.webp',                        pos: { header: '50% 26%', nav: '50% 22%', bg: '52% 50%' } },
  { id: 'v3.1', version: '3.1', name: 'For You Who Walk in Snow',              art: 'https://i.ibb.co/QvxjFT7f/3-1-For-You-Who-Walk-in-Snow.webp',                                     pos: { header: '50% 22%', nav: '50% 23%', bg: '50% 50%' } },
  { id: 'v3.0', version: '3.0', name: 'We Who See The Stars',                  art: 'https://i.ibb.co/wZ1YLZL3/3-0-We-Who-See-The-Stars.webp',                                         pos: { header: '50% 25%', nav: '50% 21%', bg: '24% 50%' } },
  { id: 'v2.8', version: '2.8', name: 'To the City Set in Amber',              art: 'https://i.ibb.co/vtrgdN5/2-8-To-the-City-Set-in-Amber.webp',                                      pos: { header: '50% 20%', nav: '50% 22%', bg: '52% 50%' } },
  { id: 'v2.7', version: '2.7', name: 'Dawn Breaks on Dark Tides',             art: 'https://i.ibb.co/ccSMLBWQ/2-7-Dawn-Breaks-on-Dark-Tides.webp',                                    pos: { header: '50% 35%', nav: '50% 33%', bg: '50% 50%' } },
  { id: 'v2.6', version: '2.6', name: "By Sun's Scourge, By Moon's Revelation", art: 'https://i.ibb.co/tPmjm4Gj/2-6-By-Sun-039-s-Scourge-By-Moon-039-s-Revelation.webp',              pos: { header: '50% 18%', nav: '50% 18%', bg: '50% 50%' } },
  { id: 'v2.5', version: '2.5', name: 'Unfading Melody of Life',               art: 'https://i.ibb.co/9mPqRNB5/2-5-Unfading-Melody-of-Life.webp',                                      pos: { header: '50% 30%', nav: '50% 32%', bg: '38% 50%' } },
  { id: 'v2.4', version: '2.4', name: 'Lightly We Toss the Crown',             art: 'https://i.ibb.co/1Y9nQ0fh/2-4-Lightly-We-Toss-the-Crown.webp',                                    pos: { header: '50% 26%', nav: '50% 25%', bg: '52% 50%' } },
  { id: 'v2.3', version: '2.3', name: 'Fiery Arpeggio of Summer Reunion',      art: 'https://i.ibb.co/xqGcwWtp/2-3-Fiery-Arpeggio-of-Summer-Reunion.webp',                             pos: { header: '50% 34%', nav: '50% 32%', bg: '26% 50%' } },
  { id: 'v2.2', version: '2.2', name: 'Tangled Truths in the Inverted Tower',  art: 'https://i.ibb.co/CsJzN541/2-2-Tangled-Truths-in-the-Inverted-Tower.webp',                         pos: { header: '50% 28%', nav: '50% 26%', bg: '62% 50%' } },
  { id: 'v2.1', version: '2.1', name: 'Waves Sing and the Cerulean Bird Calls', art: 'https://i.ibb.co/NR8Y3hX/2-1-Waves-Sing-and-the-Cerulean-Bird-Calls.webp',                       pos: { header: '50% 10%', nav: '50% 12%', bg: '78% 50%' } },
  { id: 'v2.0', version: '2.0', name: 'All Silent Souls Can Sing',             art: 'https://i.ibb.co/ymyhCL34/2-0-All-Silent-Souls-Can-Sing.webp',                                    pos: { header: '50% 52%', nav: '50% 49%', bg: '36% 50%' } },
  { id: 'v1.4', version: '1.4', name: 'When the Night Knocks',                 art: 'https://i.ibb.co/gs28SY3/1-4-When-the-Night-Knocks.webp',                                         pos: { header: '50% 66%', nav: '50% 70%', bg: '46% 50%' } },
  { id: 'v1.3', version: '1.3', name: "To the Shore's End",                    art: 'https://i.ibb.co/Pv1CG7BX/1-3-To-the-Shore-039-s-End.webp',                                       pos: { header: '50% 16%', nav: '50% 16%', bg: '16% 50%' } },
  { id: 'v1.2', version: '1.2', name: 'In the Turquoise Moonglow',             art: 'https://i.ibb.co/mV6XsJzv/1-2-In-the-Turquoise-Moonglow.webp',                                    pos: { header: '50% 47%', nav: '50% 51%', bg: '44% 50%' } },
  { id: 'v1.1', version: '1.1', name: 'Thaw of Eons',                          art: 'https://i.ibb.co/LXNDc40c/1-1-Thaw-of-Eons.webp',                                                 pos: { header: '50% 26%', nav: '50% 29%', bg: '50% 50%' } },
  { id: 'v1.0', version: '1.0', name: 'Waking of a World',                     art: 'https://i.ibb.co/XkXrD9NF/1-0-Waking-of-a-World.webp',                                            pos: { header: '50% 32%', nav: '50% 34%', bg: '50% 50%' } },
];

// ═══════════════════════════════════════════════════════════════════════════════
// OTHER BACKGROUNDS — Miscellaneous promotional art
// ═══════════════════════════════════════════════════════════════════════════════
const OTHER_BACKGROUNDS = [
  { id: 'dream-team', name: 'The Dream Team', art: 'https://i.ibb.co/Gfkn50Fk/The-dream-team.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '40% 50%' } },
  { id: 'utterance-of-marvels', name: 'Utterance of Marvels', art: 'https://i.ibb.co/KjjRTp27/1-2-2.jpg', pos: { header: '50% 28%', nav: '50% 26%', bg: '58% 50%' } },
  { id: 'reverberation', name: 'Reverberation', art: 'https://i.ibb.co/pBV5hJ3L/Reverberation.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'solaris-3', name: 'Solaris 3', art: 'https://i.ibb.co/jvY1KmRq/Solaris-3.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'tacet-discord', name: 'Tacet Discord', art: 'https://i.ibb.co/KxDbBcD1/Tacet-discord.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'tacet-field', name: 'Tacet Field', art: 'https://i.ibb.co/zgQbgTp/Tacet-field.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'three-two-one-cheese', name: 'Three Two One Cheese', art: 'https://i.ibb.co/dJ2xPnNf/Three-two-one-cheese.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
];

// Animated (video) backgrounds — hosted on Cloudinary. `art` is the video URL,
// `poster` is a JPG first-frame used as picker thumbnail and <video poster>.
const ANIMATED_BACKGROUNDS = [
  {
    id: 'bg-video-1',
    name: 'v3.2',
    art: 'https://res.cloudinary.com/dyzz8edpf/video/upload/bg-video_nvf8y9.mp4',
    poster: 'https://res.cloudinary.com/dyzz8edpf/video/upload/so_0/bg-video_nvf8y9.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' },
  },
  {
    id: 'startorch-academy',
    name: 'Startorch Academy',
    art: 'https://res.cloudinary.com/dyzz8edpf/video/upload/wm2id79usopllntxt7-1766736146258_g8ss4o.mp4',
    poster: 'https://res.cloudinary.com/dyzz8edpf/video/upload/so_0/wm2id79usopllntxt7-1766736146258_g8ss4o.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' },
  },
];


// ══════════════════════════════════════════════════════════════════════════════
// EVENT HISTORY — Recurring event periods with verified dates
// Sources: Fandom wiki (Pioneer Podcast/YYYY-MM-DD pages), game8.co, web research
// Dates derived from BANNER_HISTORY version boundaries + web cross-check
// ══════════════════════════════════════════════════════════════════════════════

// Pioneer Podcast runs every version. Dates = version P1 start → last phase end (from BANNER_HISTORY)
// Cross-checked against Fandom wiki page URLs: Pioneer_Podcast/2024-05-23, /2024-06-28, etc.
const PIONEER_PODCAST_HISTORY = [
  { version: '3.2', startDate: '2026-03-19', endDate: '2026-04-29', rewards: 400 },
  { version: '3.1', startDate: '2026-02-05', endDate: '2026-03-18', rewards: 400 },
  { version: '3.0', startDate: '2025-12-25', endDate: '2026-02-04', rewards: 400 },
  { version: '2.8', startDate: '2025-11-20', endDate: '2025-12-24', rewards: 400 },
  { version: '2.7', startDate: '2025-10-09', endDate: '2025-11-19', rewards: 400 },
  { version: '2.6', startDate: '2025-08-28', endDate: '2025-10-08', rewards: 400 },
  { version: '2.5', startDate: '2025-07-24', endDate: '2025-08-27', rewards: 400 },
  { version: '2.4', startDate: '2025-06-12', endDate: '2025-07-23', rewards: 400 },
  { version: '2.3', startDate: '2025-04-29', endDate: '2025-06-11', rewards: 400 },
  { version: '2.2', startDate: '2025-03-27', endDate: '2025-04-28', rewards: 400 },
  { version: '2.1', startDate: '2025-02-13', endDate: '2025-03-26', rewards: 400 },
  { version: '2.0', startDate: '2025-01-02', endDate: '2025-02-12', rewards: 400 },
  { version: '1.4', startDate: '2024-11-14', endDate: '2025-01-01', rewards: 400 },
  { version: '1.3', startDate: '2024-09-29', endDate: '2024-11-13', rewards: 400 },
  { version: '1.2', startDate: '2024-08-15', endDate: '2024-09-28', rewards: 400 },
  { version: '1.1', startDate: '2024-06-28', endDate: '2024-08-14', rewards: 400 },
  { version: '1.0', startDate: '2024-05-23', endDate: '2024-06-27', rewards: 400 },
];

// Doubled Pawns Matrix: Pilot — recurring boss rush introduced in v3.0, replaced by Endstate Matrix in v3.2
// Source: Fandom wiki (Doubled_Pawns_Matrix:_Pilot), rewards reset each version
const DOUBLED_PAWNS_MATRIX_HISTORY = [
  { version: '3.1', startDate: '2026-02-05', endDate: '2026-03-18', rewards: 400 },
  { version: '3.0', startDate: '2025-12-25', endDate: '2026-02-04', rewards: 400 },
];

// Tactical Hologram — permanent combat challenges, new arenas added with new regions
// Source: Fandom wiki (Change History per page: Calamity=1.0, Phantom Pain=2.0, Synchronization=3.0)
// One entry per version where a new Tactical Hologram arena was introduced
const TACTICAL_HOLOGRAM_HISTORY = [
  { version: '3.2', name: 'Synchronization — Hyvatia',   startDate: '2026-03-19', endDate: '2026-04-29' },
  { version: '3.0', name: 'Synchronization (Lahai-Roi)',  startDate: '2025-12-25', endDate: '2026-02-04' },
  { version: '2.0', name: 'Phantom Pain (Rinascita)',     startDate: '2025-01-02', endDate: '2025-02-12' },
  { version: '1.3', name: 'Calamity — Inferno Rider',     startDate: '2024-09-29', endDate: '2024-11-13' },
  { version: '1.0', name: 'Calamity (Huanglong)',         startDate: '2024-05-23', endDate: '2024-06-27' },
];

// Version start dates (P1 start from BANNER_HISTORY) — used to derive event boundaries
const VERSION_DATES = [
  { version: '3.2', start: '2026-03-19', end: '2026-04-29' },
  { version: '3.1', start: '2026-02-05', end: '2026-03-18' },
  { version: '3.0', start: '2025-12-25', end: '2026-02-04' },
  { version: '2.8', start: '2025-11-20', end: '2025-12-24' },
  { version: '2.7', start: '2025-10-09', end: '2025-11-19' },
  { version: '2.6', start: '2025-08-28', end: '2025-10-08' },
  { version: '2.5', start: '2025-07-24', end: '2025-08-27' },
  { version: '2.4', start: '2025-06-12', end: '2025-07-23' },
  { version: '2.3', start: '2025-04-29', end: '2025-06-11' },
  { version: '2.2', start: '2025-03-27', end: '2025-04-28' },
  { version: '2.1', start: '2025-02-13', end: '2025-03-26' },
  { version: '2.0', start: '2025-01-02', end: '2025-02-12' },
  { version: '1.4', start: '2024-11-14', end: '2025-01-01' },
  { version: '1.3', start: '2024-09-29', end: '2024-11-13' },
  { version: '1.2', start: '2024-08-15', end: '2024-09-28' },
  { version: '1.1', start: '2024-06-28', end: '2024-08-14' },
  { version: '1.0', start: '2024-05-23', end: '2024-06-27' },
];

export {
  CURRENT_BANNERS,
  BANNER_HISTORY,
  EVENTS,
  PIONEER_PODCAST_HISTORY,
  DOUBLED_PAWNS_MATRIX_HISTORY,
  TACTICAL_HOLOGRAM_HISTORY,
  VERSION_DATES,
  DEFAULT_COLLECTION_IMAGES,
  CHARACTER_THEMES,
  VERSION_SPLASH_SCREENS,
  OTHER_BACKGROUNDS,
  ANIMATED_BACKGROUNDS,
};
