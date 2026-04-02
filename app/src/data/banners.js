// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/banners.js
// Current banners, banner history, events, default collection images,
// and character themes.
// ═══════════════════════════════════════════════════════════════════════════════


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
    // Mon, 16 Feb 2026 04:00 - Mon, 16 Mar 2026 03:59 (Europe)
    currentEnd: '2026-03-16T02:59:00Z',
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
  'Whiff Whaff': 'https://i.ibb.co/pvPDj2t6/Whiff-Whaff.png',
  'Snip Snap': 'https://i.ibb.co/b5w0y6Fm/Snip-Snap.png',
  'Zig Zag': 'https://i.ibb.co/NgB1CXPx/Zig-Zag.png',
  'Tick Tack': 'https://i.ibb.co/5xv8bZQw/Tick-Tack.png',
  'Clang Bang': 'https://i.ibb.co/sp8bnWqS/Clang-Bang.png',
  'Gulpuff': 'https://i.ibb.co/bj9N6GyJ/Gulpuff.png',
  'Chirpuff': 'https://i.ibb.co/LXW0sxPK/Chirpuff.png',
  'Excarat': 'https://i.ibb.co/fYHBj9f0/Excarat.png',
  'Baby Viridblaze Saurian': 'https://i.ibb.co/mrn1KCwW/Baby-Viridblaze-Saurian.png',
  'Sabyr Boar': 'https://i.ibb.co/Tx5sZfc7/Sabyr-Boar.png',
  'Fusion Dreadmane': 'https://i.ibb.co/QjMNrcNz/Fusion-Dreadmane.png',
  'Diamondclaw': 'https://i.ibb.co/HLXTGZwZ/Diamondclaw.png',
  'Cruisewing': 'https://i.ibb.co/gMqJ3BgQ/Cruisewing.png',
  'Hoartoise': 'https://i.ibb.co/rfKhG5D9/Hoartoise.png',
  'Hooscamp': 'https://i.ibb.co/rGXJB3ZF/Hooscamp.png',
  'Lava Larva': 'https://i.ibb.co/cKW5xrys/Lava-Larva.png',
  'Dwarf Cassowary': 'https://i.ibb.co/N64L3hhD/Dwarf-Cassowary.png',
  'Galescourge Stalker': 'https://i.ibb.co/dw4DtP2J/Galescourge-Stalker.png',
  'Voltscourge Stalker': 'https://i.ibb.co/MDNfkd8C/Voltscourge-Stalker.png',
  'Frostscourge Stalker': 'https://i.ibb.co/672Pj7yR/Frostscourge-Stalker.png',
  'Aero Drake': 'https://i.ibb.co/V0vHP6mR/Aero-Drake.png',
  'Electro Drake': 'https://i.ibb.co/SDH285Pc/Electro-Drake.png',
  'Glacio Drake': 'https://i.ibb.co/gbw1jyD1/Glacio-Drake.png',
  'Fusion Drake': 'https://i.ibb.co/4gZtg5nn/Fusion-Drake.png',
  'Spectro Drake': 'https://i.ibb.co/tTWghQ5k/Spectro-Drake.png',
  'Havoc Drake': 'https://i.ibb.co/nsNDkVLc/Havoc-Drake.png',
  'Glacio Prism': 'https://i.ibb.co/DPxd7hnh/Glacio-Prism.png',
  'Fusion Prism': 'https://i.ibb.co/F4m58zj0/Fusion-Prism.png',
  'Havoc Prism': 'https://i.ibb.co/FbrRCM3j/Havoc-Prism.png',
  'Spectro Prism': 'https://i.ibb.co/zH8vmSfM/Spectro-Prism.png',
  'Aero Prism': 'https://i.ibb.co/tpFvDp6x/Aero-Prism.png',
  'Chop Chop: Headless': 'https://i.ibb.co/QSVwGFv/Chop-Chop-Headless.png',
  'Chop Chop: Leftless': 'https://i.ibb.co/DfzWYrQx/Chop-Chop-Leftless.png',
  'Chop Chop: Rightless': 'https://i.ibb.co/5h2mJXR5/Chop-Chop-Rightless.png',
  'Fae Ignis': 'https://i.ibb.co/TDNHnbP5/Fae-Ignis.png',
  'Nimbus Wraith': 'https://i.ibb.co/VpwHYqLj/Nimbus-Wraith.png',
  'Hocus Pocus': 'https://i.ibb.co/V0K3W3c3/Hocus-Pocus.png',
  'Lottie Lost': 'https://i.ibb.co/934LYmQz/Lottie-Lost.png',
  'Diggy Duggy': 'https://i.ibb.co/xKzKn59P/Diggy-Duggy.png',
  'Chest Mimic': 'https://i.ibb.co/x8fy6r6N/Chest-Mimic.png',
  'Flora Drone': 'https://i.ibb.co/YCxCSv5/Flora-Drone.png',
  'Mining Drone': 'https://i.ibb.co/93Y2P7v9/Mining-Drone.png',
  'Geospider S4': 'https://i.ibb.co/NdMp0LFy/Geospider-S4.png',
  'Young Roseshroom': 'https://i.ibb.co/VpcMk58f/Young-Roseshroom.png',
  'Vanguard Junrock': 'https://i.ibb.co/gMFSqGZt/Vanguard-Junrock.png',
  'Fission Junrock': 'https://i.ibb.co/8gzmzV1g/Fission-Junrock.png',
  'Golden Junrock': 'https://i.ibb.co/B5vmCfcH/Golden-Junrock.png',
  'Calcified Junrock': 'https://i.ibb.co/WNDSq6JG/Calcified-Junrock.png',
  'Electro Predator': 'https://i.ibb.co/jkjdT6qT/Electro-Predator.png',
  'Glacio Predator': 'https://i.ibb.co/TDFLmb4R/Glacio-Predator.png',
  'Aero Predator': 'https://i.ibb.co/Xx3y7Qdn/Aero-Predator.png',
  'Fusion Warrior': 'https://i.ibb.co/x83Jc7KK/Fusion-Warrior.png',
  'Havoc Warrior': 'https://i.ibb.co/kgB2Zc3g/Havoc-Warrior.png',
  'La Guardia': 'https://i.ibb.co/C3Dv1xF7/La-Guardia.png',
  'Sagittario': 'https://i.ibb.co/pj7ZdDDx/Sagittario.png',
  'Sacerdos': 'https://i.ibb.co/xpqtmS6/Sacerdos.png',
  'Devotee\'s Flesh': 'https://i.ibb.co/xtvhpyqw/Devotee-039-s-Flesh.png',
  'Tremor Warrior': 'https://i.ibb.co/LddgyQDf/Tremor-Warrior.png',
  'Zip Zap': 'https://i.ibb.co/60M6Y63d/Zip-Zap.png',
  'Iceglint Dancer': 'https://i.ibb.co/rfF0WbMB/Iceglint-Dancer.png',
  'Shadow Stepper': 'https://i.ibb.co/KzQQgJv9/Shadow-Stepper.png',
  'Nightmare: Aero Predator': 'https://i.ibb.co/4ZC70TkJ/Nightmare-Aero-Predator.png',
  'Nightmare: Baby Roseshroom': 'https://i.ibb.co/vpHJJmp/Nightmare-Baby-Roseshroom.png',
  'Nightmare: Baby Viridblaze Saurian': 'https://i.ibb.co/4nvDs4BM/Nightmare-Baby-Viridblaze-Saurian.png',
  'Nightmare: Chirpuff': 'https://i.ibb.co/NdvTSMqn/Nightmare-Chirpuff.png',
  'Nightmare: Dwarf Cassowary': 'https://i.ibb.co/Q72cVTkv/Nightmare-Dwarf-Cassowary.png',
  'Nightmare: Electro Predator': 'https://i.ibb.co/PGXJrqTV/Nightmare-Electro-Predator.png',
  'Nightmare: Glacio Predator': 'https://i.ibb.co/fd7LMp6b/Nightmare-Glacio-Predator.png',
  'Nightmare: Gulpuff': 'https://i.ibb.co/XxFttBYH/Nightmare-Gulpuff.png',
  'Nightmare: Havoc Warrior': 'https://i.ibb.co/XZsKpLsF/Nightmare-Havoc-Warrior.png',
  'Nightmare: Tick Tack': 'https://i.ibb.co/GvfLmp2P/Nightmare-Tick-Tack.png',
  'Traffic Illuminator': 'https://i.ibb.co/5WJs28pZ/Traffic-Illuminator.png',
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


export {
  CURRENT_BANNERS,
  BANNER_HISTORY,
  EVENTS,
  DEFAULT_COLLECTION_IMAGES,
  CHARACTER_THEMES,
};
