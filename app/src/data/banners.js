// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/banners.js
// Current banners, banner history, events, default collection images,
// and character themes.
// ═══════════════════════════════════════════════════════════════════════════════

import { RELEASE_ORDER, CHARACTER_DATA } from './characters.js';

// Shared fallback art for any character/weapon that hasn't had a real portrait/icon
// sourced yet (post-v3.3 additions). Swap out per-entry as real art becomes available.
const PLACEHOLDER_IMAGE = 'https://i.ibb.co/cK3h3qFh/Abby-Card2.webp';

// [SECTION:BANNERS]
// v3.6 Phase 1 — Qingxiao debut + Denia rerun, August 20 - September 10, 2026. CONFIRMED LIVE
// 2026-08-20 (today) — nanoka.cc shows "Version 3.6 (365) (latest) (live) (current)" and
// wutheringwaves.fandom.com's own Qingxiao infobox lists "Release Date: August 20, 2026" plus the
// exact convene: "Wind of Transcendence" (2026-08-20 – 2026-09-10, 3.6), featured resonators
// Qingxiao + Baizhi/Yangyang/Sanhua as 4★s — used to fix featured4Stars below (previously an
// unconfirmed carry-over guess of Baizhi/Mortefi/Lumi). title/element/weaponType pulled from
// CHARACTER_DATA (audited IDENTITY_DATA).
const CURRENT_BANNERS = {
  version: '3.6', phase: 1, // Game version (not app version)
  // Aug 20, 10:00 CEST (UTC+2) = 08:00 UTC -> Sep 10, 10:00 CEST (UTC+2) = 08:00 UTC
  startDate: '2026-08-20T08:00:00Z',
  endDate: '2026-09-10T08:00:00Z',
  characterBannerImage: 'https://i.ibb.co/8nvgqZKC/e7478-17840855867105-1920.jpg',
  weaponBannerImage: 'https://i.ibb.co/C3Gz8y18/Glint-Of-Cloud-Banner.jpg',
  eventBannerImage: PLACEHOLDER_IMAGE,
  whimperingWastesImage: 'https://i.ibb.co/HT4RyJBy/Whimpering-Wastes-BG.png',
  endstateMatrixImage: 'https://i.ibb.co/Jjn2Ncvp/images-2026-04-01-T034054-984.jpg',
  pioneerPodcastImage: 'https://i.ibb.co/zHsVrt8z/Sans-titre-115-20260401035034.png',
  towerOfAdversityImage: 'https://i.ibb.co/QF335JVv/Tower-of-Adversity-Banner-Art.jpg',
  illusiveRealmImage: 'https://i.ibb.co/zcc2MxR/Fantasies-of-the-Thousand-Gateways.jpg',
  tacticalHologramImage: 'https://i.ibb.co/CpjDZj8V/652896591-1275960654470518-5091818010205633369-n.jpg',
  weeklyBossImage: 'https://i.ibb.co/M5cLkMWf/file-00000000e8b071f480ded273f611ec2e.png',
  standardCharBannerImage: 'https://i.ibb.co/pjXgHN70/Tidal-Chorus-Banner-Art.webp',
  standardWeapBannerImage: 'https://i.ibb.co/21kQ66xr/Drawn-Edges.webp',
  dailyResetImage: 'https://i.ibb.co/Jj6cqnsQ/image.jpg',
  characters: [
    { id: 'qingxiao', name: 'Qingxiao', title: 'Heart Sword', element: 'Aero', weaponType: 'Sword', isNew: true, featured4Stars: ['Baizhi', 'Yangyang', 'Sanhua'], imageUrl: 'https://i.ibb.co/8nvgqZKC/e7478-17840855867105-1920.jpg' }, // no individual splash art yet — new debut, using the combined convene banner
    { id: 'denia', name: 'Denia', title: 'Bubbles of Nihility', element: 'Fusion', weaponType: 'Rectifier', isNew: false, featured4Stars: ['Baizhi', 'Yangyang', 'Sanhua'], imageUrl: 'https://i.ibb.co/DPnPVGVF/denia-banner.jpg', imagePosition: '50% 31%' }, // real splash art (same asset as BANNER_HISTORY v3.3-p2 / CHARACTER_THEMES.denia)
  ],
  weapons: [
    { id: 'glint-of-clouds', name: 'Glint of Clouds', type: 'Sword', forCharacter: 'Qingxiao', element: 'Aero', isNew: true, featured4Stars: ['Variation', 'Endless Collapse', 'Relativistic Jet'], imageUrl: 'https://i.ibb.co/C3Gz8y18/Glint-Of-Cloud-Banner.jpg' },
    { id: 'forged-dwarf-star', name: 'Forged Dwarf Star', type: 'Rectifier', forCharacter: 'Denia', element: 'Fusion', isNew: false, featured4Stars: ['Variation', 'Endless Collapse', 'Relativistic Jet'], imageUrl: 'https://i.ibb.co/Gv3c41jD/Forged-Dwarf-Star-Banner.webp' }, // real art, same asset as WEAPON_THEMES.forged-dwarf-star
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
  // Version 3.6 (upcoming — dates are Game8's own estimate: "based on the Version Update's confirmed
  // release date, and the usual 21-day cycle for Version halves." Characters/weapons confirmed via
  // game8.co archive 453303 (Aug 10 2026 update), kit data not final until release.)
  // bannerArt updated 2026-08-18: replaced the self-cropped Card.jpg placeholder with the real
  // official "Where Santu Beckons" Featured Resonator Convene banner (user-supplied).
  // weaponBannerArt added 2026-08-18: real official Featured Weapon Convene banner for Thousandfold
  // Deliverance (Jingran's signature Broadblade), user-supplied.
  { id: 'v3.6-p2', version: '3.6', phase: 2, characters: ['Jingran', 'Hiyuki', 'Mornye'], weapons: ['Thousandfold Deliverance', 'Frostburn', 'Starfield Calibrator'], startDate: '2026-09-10', endDate: '2026-09-30', bannerArt: 'https://i.ibb.co/mCc8yv6J/show-76.png', weaponBannerArt: 'https://i.ibb.co/S7m6cfPC/Thousandfold-Delivrance.jpg', predicted: true },
  // bannerArt fixed 2026-08-18: was reusing Denia's own v3.3-p2 banner art (wrong — Denia is the
  // rerun here, Qingxiao is this banner's new headliner). 2nd attempt used fandom's
  // File:Qingxiao_Splash_Art.png (transparent cutout, not a banner image); 3rd attempt was a
  // self-cropped band of File:Qingxiao_Card.jpg (a tall portrait, imprecisely centered). Replaced with
  // the real official wide banner art (user-supplied, already hosted on ibb.co).
  // weaponBannerArt added 2026-08-18: real official Featured Weapon Convene banner for Glint of Clouds
  // (Qingxiao's signature Sword), user-supplied.
  // predicted flag removed 2026-08-20: confirmed live via fandom's own infobox ("Wind of
  // Transcendence" convene, 2026-08-20 – 2026-09-10, 3.6) — no longer a Game8 estimate.
  { id: 'v3.6-p1', version: '3.6', phase: 1, characters: ['Qingxiao', 'Denia'], weapons: ['Glint of Clouds', 'Forged Dwarf Star'], startDate: '2026-08-20', endDate: '2026-09-10', bannerArt: 'https://i.ibb.co/8nvgqZKC/e7478-17840855867105-1920.jpg', weaponBannerArt: 'https://i.ibb.co/C3Gz8y18/Glint-Of-Cloud-Banner.jpg' },
  // Version 3.5 — confirmed live via wuwatracker.com/fr/timeline (user-clarified 2026-08-14). p2 is
  // the current banner (Suisui + Aemeath rerun). p1 was Yangyang: Xuanling + Luuk Herssen + Lynae
  // (rerun). A separate "Starpath/Tideforge Reverbs" special selector Convene also runs continuously
  // across both p1 and p2, on top of the phase-bound character banners — not itemized as its own
  // history entry since it isn't a standard per-phase character/weapon banner.
  { id: 'v3.5-p2', version: '3.5', phase: 2, characters: ['Suisui', 'Aemeath'], weapons: ["Firstlight's Herald", 'Everbright Polestar'], startDate: '2026-07-30', endDate: '2026-08-19', bannerArt: 'https://i.ibb.co/wFwmhvLP/Suisui-banner.jpg' },
  { id: 'v3.5-p1', version: '3.5', phase: 1, characters: ['Yangyang: Xuanling', 'Luuk Herssen', 'Lynae'], weapons: ['Azure Oath', "Daybreaker's Spine", 'Spectrum Blaster'], startDate: '2026-07-10', endDate: '2026-07-30', bannerArt: 'https://i.ibb.co/QFHC5Y4h/Yangyang-Xuanling-banner.jpg' },
  // Version 3.4 (Somnoire: Night City region) — corrected via game8.co archive 494979 (official Banner
  // History, fetched 2026-08-16): Phase 1 was "Dreaming Upon the Moon"/"Rekindled Embers of Rage"
  // (Lucy + Rebecca dual-debut, Jun 8 - Jul 9). Phase 2 ran two concurrent character banners: "Tomorrow
  // in the Frame" (Lucilla debut, Jun 13 - Jul 9) and "Dance in The Storm's Wake" (Cartethyia rerun,
  // Jun 18 - Jul 9) — merged into one entry below since both share the v3.4/phase-2 slot.
  { id: 'v3.4-p2', version: '3.4', phase: 2, characters: ['Lucilla', 'Cartethyia'], weapons: ['Freeze Frame', "Defier's Thorn"], startDate: '2026-06-13', endDate: '2026-07-09', bannerArt: 'https://i.ibb.co/zT91s0wt/Lucilla-banner.jpg' },
  { id: 'v3.4-p1', version: '3.4', phase: 1, characters: ['Lucy', 'Rebecca'], weapons: ['Spectral Trigger', 'Skull Thrasher'], startDate: '2026-06-08', endDate: '2026-07-09', bannerArt: 'https://i.ibb.co/mC4xmBYY/Lucy-Banner.jpg' },
  // Version 3.3 — corrected via game8.co archive 494979 (official Banner History, fetched 2026-08-16):
  // Phase 1 debuted Hiyuki alongside Mornye + Iuno reruns; Phase 2 debuted Denia alongside Chisa +
  // Phrolova reruns. Previously modeled as solo-character phases with no weapons, which was inaccurate.
  { id: 'v3.3-p2', version: '3.3', phase: 2, characters: ['Denia', 'Chisa', 'Phrolova'], weapons: ['Forged Dwarf Star', 'Kumokiri', 'Lethean Elegy'], startDate: '2026-05-21', endDate: '2026-06-07', bannerArt: 'https://i.ibb.co/DPnPVGVF/denia-banner.jpg' },
  { id: 'v3.3-p1', version: '3.3', phase: 1, characters: ['Hiyuki', 'Mornye', 'Iuno'], weapons: ['Frostburn', 'Starfield Calibrator', "Moongazer's Sigil"], startDate: '2026-04-30', endDate: '2026-05-21', bannerArt: 'https://i.ibb.co/Gf7F9h12/hiyuki-banner.jpg' },
  // Version 3.2
  { id: 'v3.2-p2', version: '3.2', phase: 2, characters: ['Lynae', 'Zani', 'Phoebe'], weapons: ['Spectrum Blaster', 'Blazing Justice', 'Luminous Hymn'], startDate: '2026-04-09', endDate: '2026-04-29', bannerArt: 'https://i.ibb.co/h1Kwq7Vj/lynae-banner.jpg' },
  { id: 'v3.2-p1', version: '3.2', phase: 1, characters: ['Sigrika', 'Qiuyuan'], weapons: ['Solsworn Ciphers', 'Emerald Sentence'], startDate: '2026-03-19', endDate: '2026-04-09', bannerArt: 'https://i.ibb.co/DHJ2YMTM/sigrika-banner.jpg' },
  // Version 3.1
  { id: 'v3.1-p2', version: '3.1', phase: 2, characters: ['Luuk Herssen', 'Galbrena'], weapons: ["Daybreaker's Spine", 'Lux & Umbra'], startDate: '2026-02-26', endDate: '2026-03-18', bannerArt: 'https://i.ibb.co/ZzqY6F9R/luuk-banner.jpg' },
  { id: 'v3.1-p1', version: '3.1', phase: 1, characters: ['Aemeath', 'Chisa', 'Lupa'], weapons: ['Everbright Polestar', 'Kumokiri', 'Wildfire Mark'], startDate: '2026-02-05', endDate: '2026-02-26', bannerArt: 'https://i.ibb.co/Y4SzJSxL/Aemeath-banner.jpg' },
  // Version 3.0
  { id: 'v3.0-p2', version: '3.0', phase: 2, characters: ['Mornye', 'Augusta', 'Iuno'], weapons: ['Starfield Calibrator', 'Thunderflare Dominion', "Moongazer's Sigil"], startDate: '2026-01-15', endDate: '2026-02-04', bannerArt: 'https://i.ibb.co/9mGJpYvb/morny-banner.jpg' },
  { id: 'v3.0-p1', version: '3.0', phase: 1, characters: ['Lynae', 'Cartethyia', 'Ciaccona'], weapons: ['Spectrum Blaster', "Defier's Thorn", 'Woodland Aria'], startDate: '2025-12-25', endDate: '2026-01-15', bannerArt: 'https://i.ibb.co/h1Kwq7Vj/lynae-banner.jpg' },
  // Version 2.8
  { id: 'v2.8-p2', version: '2.8', phase: 2, characters: ['Phrolova', 'Cantarella'], weapons: ['Lethean Elegy', 'Whispers of Sirens'], startDate: '2025-12-11', endDate: '2025-12-24', bannerArt: 'https://i.ibb.co/QvHKLCgt/phrolova-banner.jpg' },
  { id: 'v2.8-p1', version: '2.8', phase: 1, characters: ['Chisa', 'Phoebe'], weapons: ['Kumokiri', 'Luminous Hymn'], startDate: '2025-11-20', endDate: '2025-12-11', bannerArt: 'https://i.ibb.co/RTZ06knw/chisa-banner.jpg' },
  // Version 2.7
  { id: 'v2.7-p2', version: '2.7', phase: 2, characters: ['Qiuyuan', 'Zani'], weapons: ['Emerald Sentence', 'Blazing Justice'], startDate: '2025-10-30', endDate: '2025-11-19', bannerArt: 'https://i.ibb.co/fd3D6QRx/qiuyuan-banner.jpg' },
  { id: 'v2.7-p1', version: '2.7', phase: 1, characters: ['Galbrena', 'Lupa'], weapons: ['Lux & Umbra', 'Wildfire Mark'], startDate: '2025-10-09', endDate: '2025-10-30', bannerArt: 'https://i.ibb.co/MxSTSBX7/galbrena-banner.jpg' },
  // Version 2.6
  { id: 'v2.6-p2', version: '2.6', phase: 2, characters: ['Iuno', 'Ciaccona'], weapons: ["Moongazer's Sigil", 'Woodland Aria'], startDate: '2025-09-17', endDate: '2025-10-08', bannerArt: 'https://i.ibb.co/DPd6HgjH/iuno-banner.jpg' },
  { id: 'v2.6-p1', version: '2.6', phase: 1, characters: ['Augusta', 'Carlotta', 'Shorekeeper'], weapons: ['Thunderflare Dominion', 'The Last Dance', 'Stellar Symphony'], startDate: '2025-08-28', endDate: '2025-09-17', bannerArt: 'https://i.ibb.co/4wbJgQGj/augusta-banner.jpg' },
  // Version 2.5
  { id: 'v2.5-p2', version: '2.5', phase: 2, characters: ['Cantarella', 'Brant'], weapons: ['Whispers of Sirens', 'Unflickering Valor'], startDate: '2025-08-14', endDate: '2025-08-27', bannerArt: 'https://i.ibb.co/wZ85YQzF/cantarella-banner.jpg' },
  { id: 'v2.5-p1', version: '2.5', phase: 1, characters: ['Phrolova', 'Roccia'], weapons: ['Lethean Elegy', 'Tragicomedy'], startDate: '2025-07-24', endDate: '2025-08-14', bannerArt: 'https://i.ibb.co/QvHKLCgt/phrolova-banner.jpg' },
  // Version 2.4
  { id: 'v2.4-p2', version: '2.4', phase: 2, characters: ['Lupa'], weapons: ['Wildfire Mark'], startDate: '2025-07-03', endDate: '2025-07-23', bannerArt: 'https://i.ibb.co/9HBRhrjq/lupa-banner.jpg' },
  { id: 'v2.4-p1', version: '2.4', phase: 1, characters: ['Cartethyia'], weapons: ["Defier's Thorn"], startDate: '2025-06-12', endDate: '2025-07-03', bannerArt: 'https://i.ibb.co/Ppt1BXc/carthetya-banner.jpg' },
  // Version 2.3 (Anniversary)
  { id: 'v2.3-p2', version: '2.3', phase: 2, characters: ['Ciaccona', 'Jinhsi', 'Changli', 'Carlotta', 'Roccia', 'Brant'], weapons: ['Woodland Aria', 'Ages of Harvest', 'Blazing Brilliance', 'The Last Dance', 'Tragicomedy', 'Unflickering Valor'], startDate: '2025-05-22', endDate: '2025-06-11', bannerArt: 'https://i.ibb.co/prXLxMyw/ciaconna-banner.jpg' },
  { id: 'v2.3-p1', version: '2.3', phase: 1, characters: ['Zani', 'Jiyan', 'Yinlin', 'Zhezhi', 'Xiangli Yao', 'Phoebe'], weapons: ['Blazing Justice', 'Verdant Summit', 'Stringmaster', 'Rime-Draped Sprouts', "Verity's Handle", 'Luminous Hymn'], startDate: '2025-04-29', endDate: '2025-05-22', bannerArt: 'https://i.ibb.co/tMVkd4dg/zani-banner.jpg' },
  // Version 2.2
  { id: 'v2.2-p2', version: '2.2', phase: 2, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2025-04-17', endDate: '2025-04-28', bannerArt: 'https://i.ibb.co/cKTnnDWB/shore-keeper-banner.jpg' },
  { id: 'v2.2-p1', version: '2.2', phase: 1, characters: ['Cantarella', 'Camellya'], weapons: ['Whispers of Sirens', 'Red Spring'], startDate: '2025-03-27', endDate: '2025-04-17', bannerArt: 'https://i.ibb.co/wZ85YQzF/cantarella-banner.jpg' },
  // Version 2.1
  { id: 'v2.1-p2', version: '2.1', phase: 2, characters: ['Brant', 'Changli'], weapons: ['Unflickering Valor', 'Blazing Brilliance'], startDate: '2025-03-06', endDate: '2025-03-26', bannerArt: 'https://i.ibb.co/vx8KGHcj/brant-banner.jpg' },
  { id: 'v2.1-p1', version: '2.1', phase: 1, characters: ['Phoebe'], weapons: ['Luminous Hymn'], startDate: '2025-02-13', endDate: '2025-03-06', bannerArt: 'https://i.ibb.co/Tq7pFMgp/phoebe-banner.jpg' },
  // Version 2.0
  { id: 'v2.0-p2', version: '2.0', phase: 2, characters: ['Roccia', 'Jinhsi'], weapons: ['Tragicomedy', 'Ages of Harvest'], startDate: '2025-01-23', endDate: '2025-02-12', bannerArt: 'https://i.ibb.co/YYWVfxt/roccia-banner.jpg' },
  { id: 'v2.0-p1', version: '2.0', phase: 1, characters: ['Carlotta', 'Zhezhi'], weapons: ['The Last Dance', 'Rime-Draped Sprouts'], startDate: '2025-01-02', endDate: '2025-01-23', bannerArt: 'https://i.ibb.co/67r6NbMf/carlotta-banner.png' },
  // Version 1.4
  { id: 'v1.4-p2', version: '1.4', phase: 2, characters: ['Yinlin', 'Xiangli Yao'], weapons: ['Stringmaster', "Verity's Handle"], startDate: '2024-12-12', endDate: '2025-01-01', bannerArt: 'https://i.ibb.co/Y4SDqwg2/yinlin-banner.jpg' },
  { id: 'v1.4-p1', version: '1.4', phase: 1, characters: ['Camellya'], weapons: ['Red Spring'], startDate: '2024-11-14', endDate: '2024-12-12', bannerArt: 'https://i.ibb.co/20xFP1B1/camellya-banner.png' },
  // Version 1.3
  { id: 'v1.3-p2', version: '1.3', phase: 2, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-10-24', endDate: '2024-11-13', bannerArt: 'https://i.ibb.co/hFM8STLQ/jiyan-banner.jpg' },
  { id: 'v1.3-p1', version: '1.3', phase: 1, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2024-09-29', endDate: '2024-10-24', bannerArt: 'https://i.ibb.co/cKTnnDWB/shore-keeper-banner.jpg' },
  // Version 1.2
  { id: 'v1.2-p2', version: '1.2', phase: 2, characters: ['Xiangli Yao'], weapons: ["Verity's Handle"], startDate: '2024-09-07', endDate: '2024-09-28', bannerArt: 'https://i.ibb.co/CphXJs9L/xiangli-yao-banner.jpg' },
  { id: 'v1.2-p1', version: '1.2', phase: 1, characters: ['Zhezhi'], weapons: ['Rime-Draped Sprouts'], startDate: '2024-08-15', endDate: '2024-09-07', bannerArt: 'https://i.ibb.co/XfkKS4dS/zhezhi-banner.jpg' },
  // Version 1.1
  { id: 'v1.1-p2', version: '1.1', phase: 2, characters: ['Changli'], weapons: ['Blazing Brilliance'], startDate: '2024-07-22', endDate: '2024-08-14', bannerArt: 'https://i.ibb.co/HDZ1LG4R/changli-banner.jpg' },
  { id: 'v1.1-p1', version: '1.1', phase: 1, characters: ['Jinhsi'], weapons: ['Ages of Harvest'], startDate: '2024-06-28', endDate: '2024-07-22', bannerArt: 'https://i.ibb.co/7xBSVRbQ/jinhsi-banner.jpg' },
  // Version 1.0 — NOTE: p1 and p2 intentionally overlap (both ran concurrently at launch)
  { id: 'v1.0-p2', version: '1.0', phase: 2, characters: ['Yinlin'], weapons: ['Stringmaster'], startDate: '2024-06-14', endDate: '2024-06-26', bannerArt: 'https://i.ibb.co/Y4SDqwg2/yinlin-banner.jpg' },
  { id: 'v1.0-p1', version: '1.0', phase: 1, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-05-23', endDate: '2024-06-13', bannerArt: 'https://i.ibb.co/hFM8STLQ/jiyan-banner.jpg' },
];


// [SECTION:EVENTS]
// All times from wuwatracker.com (Europe reference — CET UTC+1 or CEST UTC+2, converted to UTC)
// P9-FIX: UTC conversions must use the correct DST offset at the EVENT date, not a fixed UTC+1
// Events that end at 03:59 are server-local (follow daily reset)
// Events that end at other times are global (same UTC moment)
// v3.5-cycle dates below (pioneerPodcast through chordCleansing) were pulled directly from
// wuwatracker.com's embedded event JSON (fetched 2026-08-14) rather than the rendered page text,
// which doesn't expose exact timestamps — all local times there are CEST (UTC+2), converted to UTC.
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
    // v3.6 cycle: Aug 20 (BANNER_HISTORY-confirmed live start) -> Sep 30 (PIONEER_PODCAST_HISTORY
    // 3.6 row's own end estimate, same "Game8-pattern" estimate basis as VERSION_DATES 3.6).
    currentEnd: '2026-09-29T01:59:59Z',
    rewards: '400 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30',
    accentColor: 'yellow',
    imageUrl: 'https://i.ibb.co/zHsVrt8z/Sans-titre-115-20260401035034.png'
  },
  // Renamed 2026-08-20 (v3.6 launch): wuwatracker.com/fr/timeline's live v3.6 event bar shows
  // "Tactical Hologram: Simulation" replacing v3.5's "Sparring" arena — same permanent-challenge
  // slot, new arena tied to the v3.6 Land of Xuanfang story beat. Boss roster for the new arena not
  // independently confirmed this pass (wuwatracker's rendered bar doesn't expose it via text scrape);
  // kept the v3.5 boss note removed rather than guess new bosses.
  tacticalHologram: {
    name: 'Tactical Hologram: Simulation',
    subtitle: 'Combat Challenge',
    description: 'Permanent combat challenge — Simulation arena, added in v3.6',
    resetType: 'Permanent',
    color: 'cyan',
    // Permanent content, current active arena introduced in v3.6 — not a time-limited event
    // Showing with currentEnd for current version cycle display only. End date estimated from the
    // v3.6 version cycle end (VERSION_DATES) minus 1 day, matching the v3.5 entry's own established
    // pattern (ends the day before Pioneer Podcast's version-end date).
    currentEnd: '2026-09-29T01:59:59Z',
    permanent: true,
    rewards: 'Weekly Rewards',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: 'https://i.ibb.co/CpjDZj8V/652896591-1275960654470518-5091818010205633369-n.jpg'
  },
  endstateMatrix: {
    name: 'Endstate Matrix (Phase 1)',
    subtitle: 'Boss Rush',
    description: 'High difficulty boss rush — new in v3.2',
    resetType: 'Multi-version',
    color: 'pink',
    // v3.6 cycle estimate: confirmed live on wuwatracker.com/fr/timeline's v3.6 event bar as
    // still active ("Endstate Matrix (Phase 1)"), anchored to the v3.6-p1 banner window
    // (BANNER_HISTORY) since exact reset time wasn't recoverable from the rendered bar via text scrape.
    currentStart: '2026-08-20T02:00:00Z',
    currentEnd: '2026-09-10T01:59:59Z',
    introducedVersion: '3.2',
    rewards: '400 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30',
    accentColor: 'pink',
    imageUrl: 'https://i.ibb.co/Jjn2Ncvp/images-2026-04-01-T034054-984.jpg'
  },
  towerOfAdversity: {
    name: 'Tower of Adversity: Hazard Revisited',
    subtitle: 'Endgame Challenge',
    description: 'Endgame combat challenge',
    resetType: '28 days',
    color: 'orange',
    // 28-day cycle, independent of version boundaries — confirmed still active on
    // wuwatracker.com/fr/timeline's v3.6 event bar 2026-08-20. Next cycle = prior cycle
    // (Jul 20 -> Aug 17) + 28 days.
    currentStart: '2026-08-17T02:00:00Z',
    currentEnd: '2026-09-14T01:59:00Z',
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
    // 28-day cycle — confirmed still active (unchanged) on wuwatracker.com/fr/timeline's v3.6
    // event bar 2026-08-20; today falls inside the existing Aug 3 -> Aug 31 window, so it is
    // NOT re-anchored to the version boundary like the other version-tied entries above.
    currentStart: '2026-08-03T02:00:00Z',
    currentEnd: '2026-08-31T01:59:59Z',
    introducedVersion: '2.1', // Added in v2.1 (Feb 13, 2025)
    rewards: '800 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: 'https://i.ibb.co/HT4RyJBy/Whimpering-Wastes-BG.png'
  },
  // v3.6 refresh (2026-08-20): re-pulled wuwatracker.com/fr/timeline's rendered v3.6 event bar
  // (JS-rendered browser fetch — the site exposes no readable embedded JSON for this page unlike
  // the achievements dataset, so exact per-event start/end timestamps could not be recovered from
  // the rendered bar via text scrape — only names + relative duration labels). Every v3.5-only
  // one-off below (versionSpecialCampaign, giftsOfAftertune, lamentReconTacetCrisis,
  // virtualCrisisQuadrantTrials, lolloCampaignNewJourney) has ended and does NOT appear on the live
  // v3.6 bar — replaced with the actual v3.6 event names confirmed present on that bar. Dates are
  // anchored to the confirmed-live v3.6-p1 window (BANNER_HISTORY: 2026-08-20 -> 2026-09-10) since
  // exact per-event timestamps aren't recoverable this way — same "estimate anchored to a confirmed
  // boundary" approach already used elsewhere in this file (see VERSION_DATES/BANNER_HISTORY 3.6
  // comments). `rewards` left unset where no official figure is published, matching this file's
  // existing convention (EventCard.jsx hides the badge cleanly when absent).
  versionSpecialCampaign: {
    name: 'Version Special Campaign',
    subtitle: 'Login Rewards',
    description: 'In Version 3.6, a special event will be available: your first 10x Convenes in Reverb Resonator Convene are free.',
    resetType: 'Version update',
    color: 'yellow',
    currentStart: '2026-08-20T08:00:00Z',
    currentEnd: '2026-09-10T09:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30',
    accentColor: 'yellow',
    imageUrl: PLACEHOLDER_IMAGE,
  },
  giftsOfDriftingMist: {
    name: 'Gifts of Drifting Mist',
    subtitle: '7 Day Login Event',
    description: "During the event, log in to claim the day's login rewards from the event page.",
    resetType: 'Version update',
    color: 'yellow',
    currentStart: '2026-08-20T08:00:00Z',
    currentEnd: '2026-09-10T01:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30',
    accentColor: 'yellow',
    imageUrl: PLACEHOLDER_IMAGE,
  },
  bountifulCrescendo: {
    name: 'Bountiful Crescendo',
    subtitle: 'Limited-Time Material Double Drop Event',
    description: 'Spend Waveplates to claim double rewards after completing eligible material-farming challenges.',
    resetType: 'Limited-time',
    color: 'lime',
    currentStart: '2026-08-20T02:00:00Z',
    currentEnd: '2026-09-10T01:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-lime-900/30',
    accentColor: 'lime',
    imageUrl: '/icons/bountiful-crescendo.webp', // real event art, sourced 2026-08-20 from fandom's File:Bountiful_Crescendo.jpg (recurring material double-drop event, generic art reused across versions)
  },
  resonanceSimRealm: {
    name: 'Resonance Sim Realm',
    subtitle: 'Combat Event',
    description: 'New v3.6 limited-time combat event.',
    resetType: 'Limited-time',
    color: 'red',
    currentStart: '2026-08-20T08:00:00Z',
    currentEnd: '2026-09-10T01:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-red-900/30',
    accentColor: 'red',
    imageUrl: PLACEHOLDER_IMAGE,
  },
  secondComingOfSolaris: {
    name: 'Second Coming of Solaris: Coded Deception',
    subtitle: 'Leisure Event',
    description: 'New v3.6 limited-time leisure event.',
    resetType: 'Limited-time',
    color: 'cyan',
    currentStart: '2026-08-20T08:00:00Z',
    currentEnd: '2026-09-10T01:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    // real art, sourced 2026-08-20 from fandom's File:Second_Coming_of_Solaris_(Ultra).jpg — the
    // wiki page is for an earlier "Second Coming of Solaris" iteration, not the confirmed
    // "Coded Deception" v3.6 sub-title art; kept as the best real-asset match found, not a
    // guaranteed exact match for this specific event run.
    imageUrl: '/icons/second-coming-of-solaris.webp',
  },
  theStringsRemember: {
    name: 'The Strings Remember',
    subtitle: 'Leisure Event',
    description: 'New v3.6 limited-time leisure event.',
    resetType: 'Limited-time',
    color: 'purple',
    currentStart: '2026-08-20T08:00:00Z',
    currentEnd: '2026-09-10T01:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-purple-900/30',
    accentColor: 'purple',
    imageUrl: PLACEHOLDER_IMAGE,
  },
  ifDreamsStillReverberate: {
    name: 'If Dreams Still Reverberate',
    subtitle: 'Featured Co-op Combat Event',
    description: 'New v3.6 limited-time co-op combat event.',
    resetType: 'Limited-time',
    color: 'orange',
    currentStart: '2026-08-20T08:00:00Z',
    currentEnd: '2026-09-10T01:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-orange-900/30',
    accentColor: 'orange',
    imageUrl: PLACEHOLDER_IMAGE,
  },
  fogveilPagoda: {
    name: 'Featured Exploration Event: Fogveil Pagoda',
    subtitle: 'Exploration Event',
    description: 'New v3.6 limited-time exploration event.',
    resetType: 'Limited-time',
    color: 'lime',
    currentStart: '2026-08-20T08:00:00Z',
    currentEnd: '2026-09-10T01:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-lime-900/30',
    accentColor: 'lime',
    imageUrl: '/icons/fogveil-pagoda.webp', // real event art, sourced 2026-08-20 from fandom's File:Fogveil_Pagoda.png
  },
  chordCleansing: {
    name: 'Chord Cleansing',
    subtitle: 'Limited-Time Echo Double Drop Event',
    description: 'Spend Waveplates to claim double rewards after completing a Tacet Suppression challenge.',
    resetType: 'Limited-time',
    color: 'pink',
    currentStart: '2026-08-20T02:00:00Z',
    currentEnd: '2026-09-10T01:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30',
    accentColor: 'pink',
    imageUrl: '/icons/chord-cleansing.webp', // real event art, sourced 2026-08-20 from fandom's File:Chord_Cleansing.jpg (recurring echo double-drop event, generic art reused across versions)
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
  'Rover: Spectro': 'https://i.ibb.co/V0zwhc58/Rover-1.webp',
  'Rover: Havoc': 'https://i.ibb.co/V0zwhc58/Rover-1.webp',
  'Rover: Aero': 'https://i.ibb.co/V0zwhc58/Rover-1.webp',
  'Rover: Electro': 'https://i.ibb.co/V0zwhc58/Rover-1.webp',
  'Chisa': 'https://i.ibb.co/x8zB67Vh/Chisa-Full-Sprite.webp',
  'Phrolova': 'https://i.ibb.co/Nd0HbF4v/Phrolova-Full-Sprite.webp',
  'Qiuyuan': 'https://i.ibb.co/JRvP5fnx/Qiuyuan-Full-Sprite.webp',
  'Lynae': 'https://i.ibb.co/Mym9KBBM/Lynae-Full-Sprite.webp',
  'Sigrika': 'https://i.ibb.co/TBhhKSk6/Sigrika-Full-Sprite.webp',
  'Rebecca': 'https://i.ibb.co/j9sMxT3Q/Rebecca-Full-Sprite.webp',
  'Lucilla': 'https://i.ibb.co/FkFvMP3J/Lucilla-Full-Sprite.webp',
  'Lucy': 'https://i.ibb.co/CKsNSBwg/Lucy-Full-Sprite.webp',
  'Yangyang: Xuanling': 'https://i.ibb.co/tTrNVcJ2/Yangyang-Xuanling-Full-Sprite.webp',
  'Denia': 'https://i.ibb.co/B59KDGHZ/Denia-Full-Sprite.webp',
  'Hiyuki': 'https://i.ibb.co/Q5s9CMF/Hiyuki-Full-Sprite.webp',
  'Suisui': 'https://i.ibb.co/Q7z2ZLGV/Suisui-Full-Sprite.webp',
  // Qingxiao sourced 2026-08-18 from fandom's own File:Qingxiao_Full_Sprite.png (uploaded 2026-08-17,
  // ahead of her 2026-08-20 release, via the MediaWiki API — bypasses the site's Cloudflare challenge).
  'Qingxiao': 'https://i.ibb.co/27tS4Zw1/qingxiao-sprite.webp',
  // v3.6 — no real art asset sourced yet, using shared placeholder until real portraits are available
  // Jingran sourced 2026-08-18 from fandom's own File:Jingran_Full_Sprite.png (uploaded 2026-08-17,
  // ahead of his 3.6-p2 release, via the MediaWiki API — bypasses the site's Cloudflare challenge).
  'Jingran': 'https://i.ibb.co/yB024Z5G/jingran-sprite.webp',
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
  'Skull Thrasher': 'https://i.ibb.co/Zpyp8nP4/Skull-Trasher-sprite.webp',
  'Freeze Frame': 'https://i.ibb.co/0VKCVGXD/Freeze-Frame-spritz.webp',
  'Spectral Trigger': 'https://i.ibb.co/WW6vN5b7/Spectral-Trigger-sprite.webp',
  'Azure Oath': 'https://i.ibb.co/chFNhPBH/Azure-Oath-Sprite.webp',
  'Frostburn': 'https://i.ibb.co/29mMcRy/Frostburn-sprite.webp',
  'Forged Dwarf Star': 'https://i.ibb.co/FLf2rmCB/Forged-Dwarf-Start.webp',
  "Firstlight's Herald": 'https://i.ibb.co/PvkzS83F/First-s-Light-Herald-sprite.webp',
  // v3.6 weapons — real icons sourced 2026-08-20 from fandom's own File:Weapon_Glint_of_Clouds.png
  // / File:Weapon_Thousandfold_Deliverance.png via the MediaWiki API (bypasses Cloudflare). No
  // imgbb API key is available in this environment (IMGBB_API_KEY unset, no anonymous-upload path
  // that's reliably scriptable), so these are hosted locally under app/public/icons/ instead —
  // same-origin, already covered by the CSP's default 'self' img-src, no external re-host needed.
  'Glint of Clouds': '/icons/glint-of-clouds.webp',
  'Thousandfold Deliverance': '/icons/thousandfold-deliverance.webp',
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
  'Training Broadblade': 'https://i.ibb.co/sdfM24cr/Weapon-Training-Broadblade.webp',
  'Tyro Broadblade': 'https://i.ibb.co/ds5DBHgM/Weapon-Tyro-Broadblade.webp',
  'Guardian Broadblade': 'https://i.ibb.co/gLqjnhM1/Weapon-Guardian-Broadblade.webp',
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
  'Whiff Whaff': 'https://i.ibb.co/DDyTMyQR/Whiff-Whaff-Icon.webp',
  'Snip Snap': 'https://i.ibb.co/LDv0brpC/Snip-Snap-Icon.webp',
  'Zig Zag': 'https://i.ibb.co/7J9hK2LX/Zig-Zag-Icon.webp',
  'Tick Tack': 'https://i.ibb.co/jKXRM4g/Tick-Tack-Icon.webp',
  'Clang Bang': 'https://i.ibb.co/cc3hxYDw/Clang-Bang-Icon.webp',
  'Gulpuff': 'https://i.ibb.co/zhxwmLGT/Gulpuff-Icon.webp',
  'Chirpuff': 'https://i.ibb.co/wZ0sXmbd/Chirpuff-Icon.webp',
  'Excarat': 'https://i.ibb.co/7JCWR4LZ/Excarat-Icon.webp',
  'Baby Viridblaze Saurian': 'https://i.ibb.co/DHhNddtp/Baby-Viridblaze-Saurian-Icon.webp',
  'Sabyr Boar': 'https://i.ibb.co/DHG4d72n/Sabyr-Boar-Icon.webp',
  'Fusion Dreadmane': 'https://i.ibb.co/pjzkqWTf/Fusion-Dreadmane-Icon.webp',
  'Diamondclaw': 'https://i.ibb.co/FbjnCjz4/Diamondclaw-Icon.webp',
  'Cruisewing': 'https://i.ibb.co/ZpcpkBmb/Cruisewing-Icon.webp',
  'Hoartoise': 'https://i.ibb.co/N29nQrMF/Hoartoise-Icon.webp',
  'Hooscamp': 'https://i.ibb.co/twFD9Dn1/Hooscamp-Icon.webp',
  'Lava Larva': 'https://i.ibb.co/svpSKC3g/Lava-Larva-Icon.webp',
  'Dwarf Cassowary': 'https://i.ibb.co/nqkB7N5H/Dwarf-Cassowary-Icon.webp',
  'Galescourge Stalker': 'https://i.ibb.co/DP2Y15R7/Galescourge-Stalker-Icon.webp',
  'Voltscourge Stalker': 'https://i.ibb.co/V0XSnvpX/Voltscourge-Stalker-Icon.webp',
  'Frostscourge Stalker': 'https://i.ibb.co/KcsfTX4n/Frostscourge-Stalker-Icon.webp',
  'Aero Drake': 'https://i.ibb.co/4RFLGcTZ/Aero-Drake-Icon.webp',
  'Electro Drake': 'https://i.ibb.co/Xx06HgcD/Electro-Drake-Icon.webp',
  'Glacio Drake': 'https://i.ibb.co/jvDRpdWG/Glacio-Drake-Icon.webp',
  'Fusion Drake': 'https://i.ibb.co/jP5ctBKj/Fusion-Drake-Icon.webp',
  'Spectro Drake': 'https://i.ibb.co/sr68RKk/Spectro-Drake-Icon.webp',
  'Havoc Drake': 'https://i.ibb.co/PGM9yxdS/Havoc-Drake-Icon.webp',
  'Glacio Prism': 'https://i.ibb.co/9998gFfw/Glacio-Prism-Icon.webp',
  'Fusion Prism': 'https://i.ibb.co/pjzkqWTf/Fusion-Prism-Icon.webp',
  'Havoc Prism': 'https://i.ibb.co/dwq9gCwp/Havoc-Prism-Icon.webp',
  'Spectro Prism': 'https://i.ibb.co/DfBFLQ5q/Spectro-Prism-Icon.webp',
  'Aero Prism': 'https://i.ibb.co/hRRfbzjd/Aero-Prism-Icon.webp',
  'Chop Chop: Headless': 'https://i.ibb.co/RpGDpLHH/Chop-Chop-Headless-Icon.webp',
  'Chop Chop: Leftless': 'https://i.ibb.co/spG4w7rH/Chop-Chop-Leftless-Icon.webp',
  'Chop Chop: Rightless': 'https://i.ibb.co/VYQ3QPP2/Chop-Chop-Rightless-Icon.webp',
  'Fae Ignis': 'https://i.ibb.co/ZzcvGGGx/Fae-Ignis-Icon.webp',
  'Nimbus Wraith': 'https://i.ibb.co/DHGcPZhB/Nimbus-Wraith-Icon.webp',
  'Hocus Pocus': 'https://i.ibb.co/6cN2yBFt/Hocus-Pocus-Icon.webp',
  'Lottie Lost': 'https://i.ibb.co/C3SrXNVJ/Lottie-Lost-Icon.webp',
  'Diggy Duggy': 'https://i.ibb.co/DPQc8hqb/Diggy-Duggy-Icon.webp',
  'Chest Mimic': 'https://i.ibb.co/8DgC4tmx/Chest-Mimic-Icon.webp',
  'Flora Drone': 'https://i.ibb.co/yccgwMG1/Flora-Drone-Icon.webp',
  'Mining Drone': 'https://i.ibb.co/q3m55xgj/Mining-Drone-Icon.webp',
  'Geospider S4': 'https://i.ibb.co/P7x6wBm/Geospider-S4-Icon.webp',
  'Baby Roseshroom': 'https://i.ibb.co/gMCfrP73/Baby-Roseshroom-Icon.webp',
  'Vanguard Junrock': 'https://i.ibb.co/zVGNLzdt/Vanguard-Junrock-Icon.webp',
  'Fission Junrock': 'https://i.ibb.co/yBhnf1nj/Fission-Junrock-Icon.webp',
  'Golden Junrock': 'https://i.ibb.co/R4Mtj1t6/Golden-Junrock-Icon.webp',
  'Calcified Junrock': 'https://i.ibb.co/HkprCbb/Calcified-Junrock-Icon.webp',
  'Electro Predator': 'https://i.ibb.co/LDX6kPxT/Electro-Predator-Icon.webp',
  'Glacio Predator': 'https://i.ibb.co/nqxnCjR3/Glacio-Predator-Icon.webp',
  'Aero Predator': 'https://i.ibb.co/7tyC2t4T/Aero-Predator-Icon.webp',
  'Fusion Warrior': 'https://i.ibb.co/tPpgKfdZ/Fusion-Warrior-Icon.webp',
  'Havoc Warrior': 'https://i.ibb.co/Pzj1bKqw/Havoc-Warrior-Icon.webp',
  'La Guardia': 'https://i.ibb.co/j9wYBLjD/La-Guardia-Icon.webp',
  'Sagittario': 'https://i.ibb.co/mrzscNny/Sagittario-Icon.webp',
  'Sacerdos': 'https://i.ibb.co/DfyWdfrm/Sacerdos-Icon.webp',
  'Devotee\'s Flesh': 'https://i.ibb.co/xtnFQwD2/Devotee-s-Flesh.png',
  'Tremor Warrior': 'https://i.ibb.co/Xfx21DrZ/Tremor-Warrior-Icon.webp',
  'Zip Zap': 'https://i.ibb.co/CK2xw8bY/Zip-Zap-Icon.webp',
  'Iceglint Dancer': 'https://i.ibb.co/ycSKpxh4/Iceglint-Dancer-Icon.webp',
  'Shadow Stepper': 'https://i.ibb.co/w96PCdB/Shadow-Stepper-Icon.webp',
  'Nightmare: Aero Predator': 'https://i.ibb.co/0p2B1nyW/Nightmare-Aero-Predator-Icon.webp',
  'Nightmare: Baby Roseshroom': 'https://i.ibb.co/23k9BbyC/Nightmare-Baby-Roseshroom-Icon.webp',
  'Nightmare: Baby Viridblaze Saurian': 'https://i.ibb.co/dwcMGxzb/Nightmare-Baby-Viridblaze-Saurian-Icon.webp',
  'Nightmare: Chirpuff': 'https://i.ibb.co/ZzyktnkP/Nightmare-Chirpuff-Icon.webp',
  'Nightmare: Dwarf Cassowary': 'https://i.ibb.co/n85hWpT6/Nightmare-Dwarf-Cassowary-Icon.webp',
  'Nightmare: Electro Predator': 'https://i.ibb.co/LDX6kPxT/Nightmare-Electro-Predator-Icon.webp',
  'Nightmare: Glacio Predator': 'https://i.ibb.co/nqxnCjR3/Nightmare-Glacio-Predator-Icon.webp',
  'Nightmare: Gulpuff': 'https://i.ibb.co/2H3QWGB/Nightmare-Gulpuff-Icon.webp',
  'Nightmare: Havoc Warrior': 'https://i.ibb.co/WvdsKkCT/Nightmare-Havoc-Warrior-Icon.webp',
  'Nightmare: Tick Tack': 'https://i.ibb.co/Y4FwmGSW/Nightmare-Tick-Tack-Icon.webp',
  'Traffic Illuminator': 'https://i.ibb.co/RpPVKgcJ/Traffic-Illuminator-Icon.webp',
  // 4-Cost Echo icons
  'Mourning Aix': 'https://i.ibb.co/XZ09Kvky/Mourning-Aix-Icon.webp',
  'Feilian Beringal': 'https://i.ibb.co/RppHgV69/Feilian-Beringal-Icon.webp',
  'Tempest Mephis': 'https://i.ibb.co/m5KgKh6R/Tempest-Mephis-Icon.webp',
  'Thundering Mephis': 'https://i.ibb.co/Mbg8kP3/Thundering-Mephis-Icon.webp',
  'Inferno Rider': 'https://i.ibb.co/Mkw9SPM7/Inferno-Rider-Icon.webp',
  'Bell-Borne Geochelone': 'https://i.ibb.co/zVZHP0hw/Bell-Borne-Geochelone-Icon.webp',
  'Impermanence Heron': 'https://i.ibb.co/k6QDV6H1/Impermanence-Heron-Icon.webp',
  'Lampylumen Myriad': 'https://i.ibb.co/q3yyBwB8/Lampylumen-Myriad-Icon.webp',
  'Mech Abomination': 'https://i.ibb.co/GqBBWHL/Mech-Abomination-Icon.webp',
  'Crownless': 'https://i.ibb.co/NkpNYzb/Crownless-Icon.webp',
  'Jué': 'https://i.ibb.co/hxsP3fFC/Ju-Icon.webp',
  'Fallacy of No Return': 'https://i.ibb.co/tPw0LG3T/Fallacy-of-No-Return-Icon.webp',
  'Sentry Construct': 'https://i.ibb.co/BVJsMKzd/Sentry-Construct-Icon.webp',
  'Nightmare: Impermanence Heron': 'https://i.ibb.co/5gct6D18/Nightmare-Impermanence-Heron-Icon.webp',
  'Nightmare: Lampylumen Myriad': 'https://i.ibb.co/rWn3RrM/Nightmare-Lampylumen-Myriad-Icon.webp',
  'Dragon of Dirge': 'https://i.ibb.co/hFQ1ZCmT/Dragon-of-Dirge-Icon.webp',
  'Nightmare: Hecate': 'https://i.ibb.co/zhskZ8jn/Nightmare-Hecate-Icon.webp',
  'Nightmare: Crownless': 'https://i.ibb.co/x8JsLzb0/Nightmare-Crownless-Icon.webp',
  'Nightmare: Mourning Aix': 'https://i.ibb.co/ccWwhHhX/Nightmare-Mourning-Aix-Icon.webp',
  'Nightmare: Feilian Beringal': 'https://i.ibb.co/fdBQFmtL/Nightmare-Feilian-Beringal-Icon.webp',
  'Nightmare: Inferno Rider': 'https://i.ibb.co/Z6Hsjwr4/Nightmare-Inferno-Rider-Icon.webp',
  'Nightmare: Tempest Mephis': 'https://i.ibb.co/Qv6VB480/Nightmare-Tempest-Mephis-Icon.webp',
  'Nightmare: Thundering Mephis': 'https://i.ibb.co/TMjCxQX9/Nightmare-Thundering-Mephis-Icon.webp',
  'Dreamless': 'https://i.ibb.co/JjT68rdx/Dreamless-Icon.webp',
  'Reminiscence: Fleurdelys': 'https://i.ibb.co/N6r9JSwb/Reminiscence-Fleurdelys-Icon.webp',
  'Lioness of Glory': 'https://i.ibb.co/TMFh75cg/Lioness-of-Glory-Icon.webp',
  'The False Sovereign': 'https://i.ibb.co/NHH8K01/The-False-Sovereign-Icon.webp',
  'Lady of the Sea': 'https://i.ibb.co/C5kVbQcS/Lady-of-the-Sea-Icon.webp',
  'Reminiscence: Threnodian - Leviathan': 'https://i.ibb.co/Z12RVspK/Reminiscence-Threnodian-Leviathan-Icon.webp',
  'Hyvatia': 'https://i.ibb.co/PGtdhhRd/Hyvatia-Icon.webp',
  'Sigillum': 'https://i.ibb.co/JR620JdC/Sigillum-Icon.webp',
  'Reactor Husk': 'https://i.ibb.co/4nRHm50w/Reactor-Husk-Icon.webp',
  'Nameless Explorer': 'https://i.ibb.co/sdWR4SgF/Nameless-Explorer-Icon.webp',
  'Lorelei': 'https://i.ibb.co/9kynG0DJ/Lorelei-Icon.webp',
  'Nightmare: Kelpie': 'https://i.ibb.co/bjtwr7yr/Nightmare-Kelpie-Icon.webp',
  'Hecate': 'https://i.ibb.co/DH0bCdYK/Hecate-Icon.webp',
  'Reminiscence: Fenrico': 'https://i.ibb.co/wZK2x483/Reminiscence-Fenrico-Icon.webp',
  // 3-Cost Echo icons
  'Capitaneus': 'https://i.ibb.co/VYbs2G44/Capitaneus-Icon.webp',
  'Havoc Dreadmane': 'https://i.ibb.co/3y35jG2X/Havoc-Dreadmane-Icon.webp',
  'Lumiscale Construct': 'https://i.ibb.co/YBYGBw70/Lumiscale-Construct-Icon.webp',
  'Tambourinist': 'https://i.ibb.co/Jw8j0SxC/Tambourinist-Icon.webp',
  'Spearback': 'https://i.ibb.co/7JSVwMyC/Spearback-Icon.webp',
  'Carapace': 'https://i.ibb.co/PGkFcS50/Carapace-Icon.webp',
  'Roseshroom': 'https://i.ibb.co/kgz25mLM/Roseshroom-Icon.webp',
  'Violet-Feathered Heron': 'https://i.ibb.co/ns6dcr6t/Violet-Feathered-Heron-Icon.webp',
  'Cyan-Feathered Heron': 'https://i.ibb.co/DfK0CRyM/Cyan-Feathered-Heron-Icon.webp',
  'Flautist': 'https://i.ibb.co/RphMfMzT/Flautist-Icon.webp',
  'Hoochief': 'https://i.ibb.co/tTL9qbhD/Hoochief-Icon.webp',
  'Stonewall Bracer': 'https://i.ibb.co/dw7V5L6T/Stonewall-Bracer-Icon.webp',
  'Autopuppet Scout': 'https://i.ibb.co/5WJVT0ns/Autopuppet-Scout-Icon.webp',
  'Viridblaze Saurian': 'https://i.ibb.co/k2LsdFCf/Viridblaze-Saurian-Icon.webp',
  'Glacio Dreadmane': 'https://i.ibb.co/LXG92c1v/Glacio-Dreadmane-Icon.webp',
  'Chasm Guardian': 'https://i.ibb.co/1J8M9qx0/Chasm-Guardian-Icon.webp',
  'Abyssal Mercator': 'https://i.ibb.co/chV4vWNJ/Abyssal-Mercator-Icon.webp',
  'Twin Nova - Nebulous Cannon': 'https://i.ibb.co/s9rrBgL8/Twin-Nova-Nebulous-Cannon-Icon.webp',
  'Twin Nova - Collapsar Blade': 'https://i.ibb.co/rK7B4PM5/Twin-Nova-Collapsar-Blade-Icon.webp',
  'Sabercat Prowler': 'https://i.ibb.co/JWchKx7x/Sabercat-Prowler-Icon.webp',
  'Sabercat Reaver': 'https://i.ibb.co/JWMcgRY4/Sabercat-Reaver-Icon.webp',
  'Spacetrek Explorer': 'https://i.ibb.co/4nh1N91b/Spacetrek-Explorer-Icon.webp',
  'Flora Reindeer': 'https://i.ibb.co/LDv0brpC/Flora-Reindeer-Icon.webp',
  'Windlash Coleoid': 'https://i.ibb.co/1yKLmnC/Windlash-Coleoid-Icon.webp',
  'Frostbite Coleoid': 'https://i.ibb.co/5gdNHqbG/Frostbite-Coleoid-Icon.webp',
  'Glommoth': 'https://i.ibb.co/yBX17MGF/Glommoth-Icon.webp',
  'Ironhoof': 'https://i.ibb.co/bRNS0DKF/Ironhoof-Icon.webp',
  'Mining Reindeer': 'https://i.ibb.co/8gc61bfT/Mining-Reindeer-Icon.webp',
  'Reminiscence - Kronaclaw': 'https://i.ibb.co/KxrLYyzN/T-Icon-Monster-Head-32060-UI.webp',
  'Kronablight': 'https://i.ibb.co/4ZJ1Kzwb/Kronablight-Icon.webp',
  'Pilgrim\'s Shell': 'https://i.ibb.co/rGSxX774/Pilgrim-s-Shell-Icon.webp',
  'Kerasaur': 'https://i.ibb.co/tP81d0f5/Kerasaur-Icon.webp',
  'Hurriclaw': 'https://i.ibb.co/RG3XwmV5/Hurriclaw-Icon.webp',
  'Nightmare: Viridblaze Saurian': 'https://i.ibb.co/C5Q01c2x/Nightmare-Viridblaze-Saurian-Icon.webp',
  'Nightmare: Violet-Feathered Heron': 'https://i.ibb.co/rKDvkS2Q/Nightmare-Violet-Feathered-Heron-Icon.webp',
  'Nightmare: Cyan-Feathered Heron': 'https://i.ibb.co/v6WJ0dJd/Nightmare-Cyan-Feathered-Heron-Icon.webp',
  'Nightmare: Roseshroom': 'https://i.ibb.co/yn41d4Vx/Nightmare-Roseshroom-Icon.webp',
  'Nightmare: Tambourinist': 'https://i.ibb.co/rfw6xZrR/Nightmare-Tambourinist-Icon.webp',
  'Corrosaurus': 'https://i.ibb.co/1G54DG6K/Corrosaurus-Icon.webp',
  'Diurnus Knight': 'https://i.ibb.co/CpyL99C5/Diurnus-Knight-Icon.webp',
  'Nocturnus Knight': 'https://i.ibb.co/M5V9hjW5/Nocturnus-Knight-Icon.webp',
  'Questless Knight': 'https://i.ibb.co/vC2Mqzqc/Questless-Knight-Icon.webp',
  'Abyssal Gladius': 'https://i.ibb.co/PZ4WLJ1g/Abyssal-Gladius-Icon.webp',
  'Abyssal Patricius': 'https://i.ibb.co/nqM5wjZc/Abyssal-Patricius-Icon.webp',
  'Rage Against the Statue': 'https://i.ibb.co/JWzHhr1H/Rage-Against-the-Statue-Icon.webp',
  'Vitreum Dancer': 'https://i.ibb.co/HpXcqH2X/Vitreum-Dancer-Icon.webp',
  'Cuddle Wuddle': 'https://i.ibb.co/C4kjd33/Cuddle-Wuddle-Icon.webp',
  'Chop Chop': 'https://i.ibb.co/8LRFvBW4/Chop-Chop-Icon.webp',
  'Lightcrusher': 'https://i.ibb.co/RpYdQddL/Lightcrusher-Icon.webp',
  'Rocksteady Guardian': 'https://i.ibb.co/8LG9k4bn/Rocksteady-Guardian-Icon.webp',
  // Land of Xuanfang echoes (v3.5) — icons sourced from wutheringwaves.fandom.com, matching echoes.js's iconUrl
  'Thousand-Puppet Pavilion': 'https://i.ibb.co/23cVrFbk/Thousand-Puppet-Pavilion.webp',
  'Myriad Snare: Rustfire Chassis': 'https://i.ibb.co/KzxLH0wS/Myriad-Snare-Rustfire-Chassis.webp',
  'Reminiscence: Denia': 'https://i.ibb.co/qYy1Y7Ck/Reminiscence-Denia.webp',
  'Reminiscence: Threnodian - Voidborne Construct': 'https://i.ibb.co/gZdFc1CG/Reminiscence-Threnodian-Voidborne-Construct.webp',
  'Reminiscence - Nightmare: Adam Smasher': 'https://i.ibb.co/twCtsS1D/Reminiscence-Nightmare-Adam-Smasher.webp',
  'Forbidden Bastion': 'https://i.ibb.co/Ps1zmbnM/Forbidden-Bastion.webp',
  'Fog Lionarch': 'https://i.ibb.co/TB6d8kTy/Fog-Lionarch.webp',
  'Voidwing Moth': 'https://i.ibb.co/mCw6NvMt/Voidwing-Moth.webp',
  "Pilgrim's Shell": 'https://i.ibb.co/4ZHwcHT6/Pilgrims-Shell.webp',
  "Devotee's Flesh": 'https://i.ibb.co/DHRkbQg2/Devotees-Flesh.webp',
  // v3.5 — added 2026-08-18 (echo audit): 13 echoes missing from the roster entirely, icons re-hosted
  // from wutheringwaves.fandom.com, matching echoes.js's iconUrl for each.
  'Smiter': 'https://i.ibb.co/JWvmx2xC/Smiter.webp',
  'Porcelain Picket': 'https://i.ibb.co/jP0xbjv8/Porcelain-Picket.webp',
  'Stone Picket': 'https://i.ibb.co/WvnyB258/Stone-Picket.webp',
  'Aureate Picket': 'https://i.ibb.co/zTK3cyrf/Aureate-Picket.webp',
  'Kernel Puppet: Joy': 'https://i.ibb.co/nNh2QrRp/Kernel-Puppet-Joy.webp',
  'Kernel Puppet: Anger': 'https://i.ibb.co/TxczQftT/Kernel-Puppet-Anger.webp',
  'Kernel Puppet: Worry': 'https://i.ibb.co/XrGXPtfJ/Kernel-Puppet-Worry.webp',
  'Kernel Puppet: Reflection': 'https://i.ibb.co/5xYH8fVC/Kernel-Puppet-Reflection.webp',
  'Kernel Puppet: Grief': 'https://i.ibb.co/RkwnCxWx/Kernel-Puppet-Grief.webp',
  'Kernel Puppet: Fright': 'https://i.ibb.co/BHK35m0C/Kernel-Puppet-Fright.webp',
  'Fog Lionarch: Body': 'https://i.ibb.co/F4bswKCP/Fog-Lionarch-Body.webp',
  'Fog Lionarch: Head': 'https://i.ibb.co/YJfBqQX/Fog-Lionarch-Head.webp',
  'Smolder': 'https://i.ibb.co/QFv1pCd2/Smolder.webp',
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTER THEMES — Curated theme presets based on character banner art & element
// ═══════════════════════════════════════════════════════════════════════════════
const CHARACTER_THEMES = [
  // v3.3 (upcoming — element unconfirmed; falls back to neutral accent)
  { id: 'denia',         name: 'Denia',         element: 'Fusion',  bannerArt: 'https://i.ibb.co/DPnPVGVF/denia-banner.jpg',        pos: { header: '50% 31%', nav: '50% 31%', bg: '61% 50%' } },
  { id: 'hiyuki',        name: 'Hiyuki',        element: 'Glacio',  bannerArt: 'https://i.ibb.co/Gf7F9h12/hiyuki-banner.jpg',       pos: { header: '50% 57%', nav: '50% 55%', bg: '61% 52%' } },
  // v3.2
  { id: 'lynae',         name: 'Lynae',         element: 'Spectro', bannerArt: 'https://i.ibb.co/h1Kwq7Vj/lynae-banner.jpg',        pos: { header: '50% 25%', nav: '50% 25%', bg: '61% 50%' } },
  { id: 'zani',          name: 'Zani',          element: 'Spectro', bannerArt: 'https://i.ibb.co/tMVkd4dg/zani-banner.jpg',         pos: { header: '50% 43%', nav: '50% 41%', bg: '51% 50%' } },
  { id: 'phoebe',        name: 'Phoebe',        element: 'Spectro', bannerArt: 'https://i.ibb.co/Tq7pFMgp/phoebe-banner.jpg',       pos: { header: '50% 47%', nav: '50% 45%', bg: '59% 50%' } },
  { id: 'sigrika',       name: 'Sigrika',       element: 'Aero',    bannerArt: 'https://i.ibb.co/DHJ2YMTM/sigrika-banner.jpg',      pos: { header: '50% 25%', nav: '50% 27%', bg: '64% 50%' } },
  { id: 'qiuyuan',       name: 'Qiuyuan',       element: 'Aero',    bannerArt: 'https://i.ibb.co/fd3D6QRx/qiuyuan-banner.jpg',      pos: { header: '50% 19%', nav: '50% 21%', bg: '55% 50%' } },
  // v3.1
  { id: 'luuk-herssen',  name: 'Luuk Herssen',  element: 'Spectro', bannerArt: 'https://i.ibb.co/ZzqY6F9R/luuk-banner.jpg',         pos: { header: '50% 52%', nav: '50% 52%', bg: '64% 50%' } },
  { id: 'galbrena',      name: 'Galbrena',      element: 'Fusion',  bannerArt: 'https://i.ibb.co/MxSTSBX7/galbrena-banner.jpg',     pos: { header: '50% 31%', nav: '50% 35%', bg: '60% 50%' } },
  { id: 'aemeath',       name: 'Aemeath',       element: 'Fusion',  bannerArt: 'https://i.ibb.co/Y4SzJSxL/Aemeath-banner.jpg',      pos: { header: '50% 47%', nav: '50% 46%', bg: '73% 50%' } },
  { id: 'chisa',         name: 'Chisa',         element: 'Havoc',   bannerArt: 'https://i.ibb.co/RTZ06knw/chisa-banner.jpg',        pos: { header: '50% 22%', nav: '50% 24%', bg: '68% 50%' } },
  { id: 'lupa',          name: 'Lupa',          element: 'Fusion',  bannerArt: 'https://i.ibb.co/9HBRhrjq/lupa-banner.jpg',         pos: { header: '52% 56%', nav: '50% 56%', bg: '62% 50%' } },
  // v3.0
  { id: 'mornye',        name: 'Mornye',        element: 'Fusion',  bannerArt: 'https://i.ibb.co/9mGJpYvb/morny-banner.jpg',        pos: { header: '50% 27%', nav: '50% 27%', bg: '72% 50%' } },
  { id: 'augusta',       name: 'Augusta',       element: 'Electro', bannerArt: 'https://i.ibb.co/4wbJgQGj/augusta-banner.jpg',      pos: { header: '50% 36%', nav: '50% 35%', bg: '62% 50%' } },
  { id: 'iuno',          name: 'Iuno',          element: 'Aero',    bannerArt: 'https://i.ibb.co/DPd6HgjH/iuno-banner.jpg',         pos: { header: '50% 27%', nav: '50% 29%', bg: '66% 50%' } },
  { id: 'cartethyia',    name: 'Cartethyia',    element: 'Aero',    bannerArt: 'https://i.ibb.co/Ppt1BXc/carthetya-banner.jpg',     pos: { header: '50% 35%', nav: '50% 37%', bg: '65% 50%' } },
  { id: 'ciaccona',      name: 'Ciaccona',      element: 'Aero',    bannerArt: 'https://i.ibb.co/prXLxMyw/ciaconna-banner.jpg',     pos: { header: '50% 39%', nav: '50% 39%', bg: '61% 50%' } },
  // v2.8 / v2.5
  { id: 'phrolova',      name: 'Phrolova',      element: 'Havoc',   bannerArt: 'https://i.ibb.co/QvHKLCgt/phrolova-banner.jpg',     pos: { header: '50% 35%', nav: '50% 39%', bg: '53% 50%' } },
  { id: 'cantarella',    name: 'Cantarella',    element: 'Havoc',   bannerArt: 'https://i.ibb.co/wZ85YQzF/cantarella-banner.jpg',   pos: { header: '50% 33%', nav: '50% 33%', bg: '63% 50%' } },
  // v2.6
  { id: 'carlotta',      name: 'Carlotta',      element: 'Glacio',  bannerArt: 'https://i.ibb.co/67r6NbMf/carlotta-banner.png',     pos: { header: '50% 39%', nav: '50% 41%', bg: '63% 50%' } },
  { id: 'shorekeeper',   name: 'Shorekeeper',   element: 'Spectro', bannerArt: 'https://i.ibb.co/cKTnnDWB/shore-keeper-banner.jpg', pos: { header: '50% 23%', nav: '50% 23%', bg: '45% 50%' } },
  // v2.5 / v2.1
  { id: 'brant',         name: 'Brant',         element: 'Fusion',  bannerArt: 'https://i.ibb.co/vx8KGHcj/brant-banner.jpg',        pos: { header: '50% 25%', nav: '50% 25%', bg: '65% 50%' } },
  { id: 'roccia',        name: 'Roccia',        element: 'Havoc',   bannerArt: 'https://i.ibb.co/YYWVfxt/roccia-banner.jpg',        pos: { header: '50% 39%', nav: '50% 41%', bg: '63% 50%' } },
  // v2.3 anniversary rerun lineup + v1.1/v1.3
  { id: 'jinhsi',        name: 'Jinhsi',        element: 'Spectro', bannerArt: 'https://i.ibb.co/7xBSVRbQ/jinhsi-banner.jpg',       pos: { header: '50% 43%', nav: '50% 45%', bg: '49% 50%' } },
  { id: 'changli',       name: 'Changli',       element: 'Fusion',  bannerArt: 'https://i.ibb.co/HDZ1LG4R/changli-banner.jpg',      pos: { header: '50% 23%', nav: '50% 21%', bg: '43% 50%' } },
  { id: 'jiyan',         name: 'Jiyan',         element: 'Aero',    bannerArt: 'https://i.ibb.co/hFM8STLQ/jiyan-banner.jpg',        pos: { header: '50% 33%', nav: '50% 31%', bg: '65% 50%' } },
  { id: 'yinlin',        name: 'Yinlin',        element: 'Electro', bannerArt: 'https://i.ibb.co/Y4SDqwg2/yinlin-banner.jpg',       pos: { header: '50% 39%', nav: '50% 39%', bg: '47% 50%' } },
  { id: 'zhezhi',        name: 'Zhezhi',        element: 'Glacio',  bannerArt: 'https://i.ibb.co/XfkKS4dS/zhezhi-banner.jpg',       pos: { header: '50% 31%', nav: '50% 33%', bg: '63% 50%' } },
  { id: 'xiangli-yao',   name: 'Xiangli Yao',   element: 'Electro', bannerArt: 'https://i.ibb.co/CphXJs9L/xiangli-yao-banner.jpg',  pos: { header: '50% 19%', nav: '50% 19%', bg: '59% 50%' } },
  // v2.2 / v1.4
  { id: 'camellya',      name: 'Camellya',      element: 'Havoc',   bannerArt: 'https://i.ibb.co/20xFP1B1/camellya-banner.png',     pos: { header: '50% 71%', nav: '50% 73%', bg: '49% 50%' } },
  // Standard Resonator pool (Tidal Chorus)
  { id: 'jianxin',       name: 'Jianxin',       element: 'Aero',    bannerArt: 'https://i.ibb.co/tPD8Pj0p/jianxin-banner.jpg' },
  { id: 'calcharo',      name: 'Calcharo',      element: 'Electro', bannerArt: 'https://i.ibb.co/sd5QMF3v/calcharo-banner.jpg' },
  { id: 'encore',        name: 'Encore',        element: 'Fusion',  bannerArt: 'https://i.ibb.co/HTF05mrX/encore-banner.jpg' },
  { id: 'lingyang',      name: 'Lingyang',      element: 'Glacio',  bannerArt: 'https://i.ibb.co/KzKHgTLN/lingyang-banner.jpg' },
  { id: 'verina',        name: 'Verina',        element: 'Spectro', bannerArt: 'https://i.ibb.co/C3Wd3F32/verina-banner.jpg' },
  { id: 'buling',        name: 'Buling',        element: 'Havoc',   bannerArt: 'https://i.ibb.co/XkYLV2gC/buling-banner.jpg' },
  // v3.4-3.5 — no individual header/nav/bg crop tuning yet; using the average pos across every
  // other tuned entry above (avg of 30: header 50%/36%, nav 50%/36%, bg 60%/50%)
  { id: 'lucy',          name: 'Lucy',          element: 'Spectro', bannerArt: 'https://i.ibb.co/mC4xmBYY/Lucy-Banner.jpg',        pos: { header: '50% 36%', nav: '50% 36%', bg: '60% 50%' } },
  { id: 'rebecca',       name: 'Rebecca',       element: 'Electro', bannerArt: 'https://i.ibb.co/Ps7MZMhB/Rebecca-banner.jpg',      pos: { bg: '60% 50%' } },
  { id: 'lucilla',       name: 'Lucilla',       element: 'Glacio',  bannerArt: 'https://i.ibb.co/zT91s0wt/Lucilla-banner.jpg',      pos: { header: '50% 36%', nav: '50% 36%', bg: '60% 50%' } },
  { id: 'suisui',        name: 'Suisui',        element: 'Glacio',  bannerArt: 'https://i.ibb.co/wFwmhvLP/Suisui-banner.jpg',       pos: { header: '50% 36%', nav: '50% 36%', bg: '60% 50%' } },
  { id: 'yangyang-xuanling', name: 'Yangyang: Xuanling', element: 'Havoc', bannerArt: 'https://i.ibb.co/QFHC5Y4h/Yangyang-Xuanling-banner.jpg', pos: { header: '50% 36%', nav: '50% 36%', bg: '60% 50%' } },
];
// Sorted most-recently-released first, reusing the single source of truth for release order
// (RELEASE_ORDER, characters.js) instead of relying on manual placement above.
CHARACTER_THEMES.sort((a, b) => RELEASE_ORDER.indexOf(b.name) - RELEASE_ORDER.indexOf(a.name));

// ═══════════════════════════════════════════════════════════════════════════════
// WEAPON THEMES — Real "Featured Weapon Convene" splash art per 5★ weapon
// (mirrors CHARACTER_THEMES; no per-asset crop `pos` supplied yet — add if a
// consumer needs one, following the same header/nav/bg pattern as CHARACTER_THEMES)
// ═══════════════════════════════════════════════════════════════════════════════
const WEAPON_THEMES = [
  { id: 'everbright-polestar',   name: 'Everbright Polestar',   bannerArt: 'https://i.ibb.co/cSVxJrz8/everbright-polestar-banner.jpg' },
  { id: 'ages-of-harvest',       name: 'Ages of Harvest',       bannerArt: 'https://i.ibb.co/DD24rw6P/ages-of-harvest-banner.jpg' },
  { id: 'azure-oath',            name: 'Azure Oath',            bannerArt: 'https://i.ibb.co/WWFdfpd2/Azure-Oath-Banner.webp' }, // Xuanling
  { id: 'blazing-brilliance',    name: 'Blazing Brilliance',    bannerArt: 'https://i.ibb.co/fby4FQc/blazing-brilliance-banner.jpg' },
  { id: 'blazing-justice',       name: 'Blazing Justice',       bannerArt: 'https://i.ibb.co/rRqtbgtz/blazing-justice-banner.jpg' },
  { id: 'daybreakers-spine',     name: "Daybreaker's Spine",    bannerArt: 'https://i.ibb.co/8gzzFgGx/daybreaker-s-spine-banner.jpg' },
  { id: 'defiers-thorn',         name: "Defier's Thorn",        bannerArt: 'https://i.ibb.co/LzNywkKX/defier-s-thorn-banner.jpg' },
  { id: 'emerald-sentence',      name: 'Emerald Sentence',      bannerArt: 'https://i.ibb.co/k2dDWSg3/emerald-sentence-banner.jpg' },
  { id: 'firstlights-herald',    name: "Firstlight's Herald",   bannerArt: 'https://i.ibb.co/G3kfLMk7/First-s-Light-herald-Banner.jpg' }, // Suisui
  { id: 'forged-dwarf-star',     name: 'Forged Dwarf Star',     bannerArt: 'https://i.ibb.co/Gv3c41jD/Forged-Dwarf-Star-Banner.webp' }, // Denia
  { id: 'freeze-frame',          name: 'Freeze Frame',          bannerArt: 'https://i.ibb.co/5hWpCRrv/Freeze-Frame-Banner.jpg' }, // Lucilla
  { id: 'frostburn',             name: 'Frostburn',             bannerArt: 'https://i.ibb.co/rRh3h5zR/Frostburn-Banner.webp' }, // Hiyuki
  { id: 'kumokiri',              name: 'Kumokiri',              bannerArt: 'https://i.ibb.co/Dgs0qXnV/kumokiri-banner.jpg' },
  { id: 'lethean-elegy',         name: 'Lethean Elegy',         bannerArt: 'https://i.ibb.co/MyPXz6m4/lethean-elegy-banner.jpg' },
  { id: 'luminous-hymn',         name: 'Luminous Hymn',         bannerArt: 'https://i.ibb.co/qL32WZqz/luminous-hymn-banner.jpg' },
  { id: 'lux-umbra',             name: 'Lux & Umbra',           bannerArt: 'https://i.ibb.co/cSH6dB9R/lux-umbra-banner.jpg' },
  { id: 'moongazers-sigil',      name: "Moongazer's Sigil",     bannerArt: 'https://i.ibb.co/5Xf3j5w5/moongazer-s-sigil-banner.jpg' },
  { id: 'red-spring',            name: 'Red Spring',            bannerArt: 'https://i.ibb.co/VYykPdpg/red-spring-banner.jpg' },
  { id: 'rime-draped-sprouts',   name: 'Rime-Draped Sprouts',   bannerArt: 'https://i.ibb.co/xqtPLNJF/rime-draped-sprouts-banner.jpg' },
  { id: 'skull-thrasher',        name: 'Skull Thrasher',        bannerArt: 'https://i.ibb.co/9m8z7x9R/Skull-Thrasher-Banner.webp' }, // Rebecca
  { id: 'solsworn-ciphers',      name: 'Solsworn Ciphers',      bannerArt: 'https://i.ibb.co/N2ZLZ07W/solsworn-ciphers-banner.jpg' },
  { id: 'spectral-trigger',      name: 'Spectral Trigger',      bannerArt: 'https://i.ibb.co/yF2D9tKS/Spectral-trigger-Banner.png' }, // Lucy
  { id: 'spectrum-blaster',      name: 'Spectrum Blaster',      bannerArt: 'https://i.ibb.co/tMyRpwW9/spectrum-blaster-banner.jpg' },
  { id: 'starfield-calibrator',  name: 'Starfield Calibrator',  bannerArt: 'https://i.ibb.co/N6qwBGnv/starfield-calibrator-banner.jpg' },
  { id: 'stellar-symphony',      name: 'Stellar Symphony',      bannerArt: 'https://i.ibb.co/DPBF1H0Q/stellar-symphony-banner.jpg' },
  { id: 'stringmaster',          name: 'Stringmaster',          bannerArt: 'https://i.ibb.co/zhnR2MRT/stringmaster-banner.jpg' },
  { id: 'the-last-dance',        name: 'The Last Dance',        bannerArt: 'https://i.ibb.co/k20XT27x/the-last-dance-banner.jpg' },
  { id: 'thunderflare-dominion', name: 'Thunderflare Dominion', bannerArt: 'https://i.ibb.co/8QxTXtL/thunderflare-dominion-banner.jpg' },
  { id: 'tragicomedy',           name: 'Tragicomedy',           bannerArt: 'https://i.ibb.co/xKwWBBBZ/tragicomedy-banner.jpg' },
  { id: 'unflickering-valor',    name: 'Unflickering Valor',    bannerArt: 'https://i.ibb.co/5XP6J2XM/unflickering-valor-banner.jpg' },
  { id: 'verdant-summit',        name: 'Verdant Summit',        bannerArt: 'https://i.ibb.co/Ngt5641y/verdant-summit-banner.jpg' },
  { id: 'veritys-handle',        name: "Verity's Handle",       bannerArt: 'https://i.ibb.co/S4cvnxkq/verity-s-handle-banner.jpg' },
  { id: 'whispers-of-sirens',    name: 'Whispers of Sirens',    bannerArt: 'https://i.ibb.co/23XqBXny/whispers-of-sirens-banner.jpg' },
  { id: 'wildfire-mark',         name: 'Wildfire Mark',         bannerArt: 'https://i.ibb.co/yBgZw4jZ/wildfire-mark-banner.jpg' },
  { id: 'woodland-aria',         name: 'Woodland Aria',         bannerArt: 'https://i.ibb.co/JWCTQ0CW/woodland-aria-banner.jpg' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// VERSION SPLASH SCREENS — Official game version key art
// ═══════════════════════════════════════════════════════════════════════════════
const VERSION_SPLASH_SCREENS = [
  { id: 'v3.3', version: '3.3', name: 'Reverbs From The End of Galaxies',  art: 'https://i.ibb.co/KByqz7F/Reverbs-From-The-End-of-Galaxies.jpg',                                 pos: { header: '50% 32%', nav: '50% 32%', bg: '52% 50%' } },
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
  { id: 'here-come-the-woolies', name: 'Here Come the Woolies', art: 'https://i.ibb.co/8DMSZm1S/here-come-the-woolies.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
];

// Animated (video) backgrounds — self-hosted under /animated-bg/. `art` is
// the mp4, `poster` is an extracted first-frame JPG used as picker thumbnail
// and <video poster>.
const ANIMATED_BACKGROUNDS = [
  {
    id: 'v2-0',
    version: 2.0,
    name: 'v2.0 All Silent Souls Can Sing',
    art: './animated-bg/2.0-All-Silent-Souls-Can-Sing-Animated.mp4',
    poster: './animated-bg/2.0-All-Silent-Souls-Can-Sing-Animated.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' },
  },
  {
    id: 'v2-2',
    version: 2.2,
    name: 'v2.2 Tangled Truth in Inverted Tower',
    art: './animated-bg/2.2-Tangled-Truth-In-Inverted-Tower-Animated.mp4',
    poster: './animated-bg/2.2-Tangled-Truth-In-Inverted-Tower-Animated.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' },
  },
  {
    id: 'v2-5',
    version: 2.5,
    name: 'v2.5 Unfading Melody of Life',
    art: './animated-bg/2.5-Unfadind-Melody-Of-Life-Animated.mp4',
    poster: './animated-bg/2.5-Unfadind-Melody-Of-Life-Animated.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' },
  },
  {
    id: 'v2-6',
    version: 2.6,
    name: "v2.6 By Sun's Scourge, By Moon's Revelation",
    art: "./animated-bg/2.6-By-Sun's-Scourge,ByMoon's-Revelation-Animated.mp4",
    poster: "./animated-bg/2.6-By-Sun's-Scourge,ByMoon's-Revelation-Animated.jpg",
    pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' },
  },
  {
    id: 'v2-7',
    version: 2.7,
    name: 'v2.7 Dawn Breaks on Dark Tides',
    art: './animated-bg/2.7-Dawn-Breaks-On-Dark-Tides-Animated.mp4',
    poster: './animated-bg/2.7-Dawn-Breaks-On-Dark-Tides-Animated.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' },
  },
  {
    id: 'v2-8',
    version: 2.8,
    name: 'v2.8 To the City Set in Amber',
    art: './animated-bg/2.8-To-The-City-Set-In-Amber-Animated.mp4',
    poster: './animated-bg/2.8-To-The-City-Set-In-Amber-Animated.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' },
  },
  {
    id: 'v3-0',
    version: 3.0,
    name: 'v3.0 We Who See the Stars',
    art: './animated-bg/3.0-We-Who-See-The-Stars-Animated.mp4',
    poster: './animated-bg/3.0-We-Who-See-The-Stars-Animated.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' },
  },
  {
    id: 'v3-1',
    version: 3.1,
    name: 'v3.1 For You Who Walk in the Snow',
    art: './animated-bg/3.1-For-You-Who-Walk-In-The-Snow-Animated.mp4',
    poster: './animated-bg/3.1-For-You-Who-Walk-In-The-Snow-Animated.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' },
  },
  {
    id: 'v3-2',
    version: 3.2,
    name: 'v3.2',
    art: './animated-bg/3.2-animated.mp4',
    poster: './animated-bg/3.2-animated.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '56% 50%' },
  },
  {
    id: 'v3-3',
    version: 3.3,
    name: 'v3.3',
    art: './animated-bg/3.3-animated.mp4',
    poster: './animated-bg/3.3-animated.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '54% 50%' },
  },
  {
    id: '2nd-anniversary',
    version: 3.2, // estimated: 1-year anniversary was the v2.3 anniversary rerun (~Apr 2025), so 2nd falls ~Apr 2026 = v3.2 window
    name: '2nd Anniversary',
    art: './animated-bg/2nd-anniversary-animated.mp4',
    poster: './animated-bg/2nd-anniversary-animated.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '60% 50%' },
  },
  {
    id: 'startorch-academy',
    version: 3.1, // estimated: Aemeath's introduction/Startorch Academy tie-in, released v3.1
    name: 'Startorch Academy',
    art: './animated-bg/startorch-academy-animated.mp4',
    poster: './animated-bg/startorch-academy-animated.jpg',
    pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' },
  },
];
// Sorted most-recently-released first
ANIMATED_BACKGROUNDS.sort((a, b) => b.version - a.version);


// ══════════════════════════════════════════════════════════════════════════════
// EVENT HISTORY — Recurring event periods with verified dates
// Sources: Fandom wiki (Pioneer Podcast/YYYY-MM-DD pages), game8.co, web research
// Dates derived from BANNER_HISTORY version boundaries + web cross-check
// ══════════════════════════════════════════════════════════════════════════════

// Pioneer Podcast runs every version. Dates = version P1 start → last phase end (from BANNER_HISTORY)
// Cross-checked against Fandom wiki page URLs: Pioneer_Podcast/2024-05-23, /2024-06-28, etc.
const PIONEER_PODCAST_HISTORY = [
  { version: '3.6', startDate: '2026-08-20', endDate: '2026-09-30', rewards: 400 },
  { version: '3.5', startDate: '2026-07-10', endDate: '2026-08-19', rewards: 400 },
  { version: '3.4', startDate: '2026-06-10', endDate: '2026-07-10', rewards: 400 },
  { version: '3.3', startDate: '2026-04-29', endDate: '2026-06-10', rewards: 400 },
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
// Source: Fandom wiki (Change History per page: Calamity=1.0, Phantom Pain=2.0, Synchronization=3.0, Sparring=3.5)
// One entry per version where a new Tactical Hologram arena was introduced
const TACTICAL_HOLOGRAM_HISTORY = [
  // Confirmed via wutheringwaves.fandom.com/wiki/Tactical_Hologram:_Sparring — "Released in Version 3.5",
  // bosses Denia and Myriad Snare: Rustfire Chassis (both Land of Xuanfang additions).
  { version: '3.5', name: 'Sparring — Denia / Myriad Snare: Rustfire Chassis', startDate: '2026-07-10', endDate: '2026-08-19' },
  { version: '3.2', name: 'Synchronization — Hyvatia',   startDate: '2026-03-19', endDate: '2026-04-29' },
  { version: '3.0', name: 'Synchronization (Lahai-Roi)',  startDate: '2025-12-25', endDate: '2026-02-04' },
  { version: '2.0', name: 'Phantom Pain (Rinascita)',     startDate: '2025-01-02', endDate: '2025-02-12' },
  { version: '1.3', name: 'Calamity — Inferno Rider',     startDate: '2024-09-29', endDate: '2024-11-13' },
  { version: '1.0', name: 'Calamity (Huanglong)',         startDate: '2024-05-23', endDate: '2024-06-27' },
];

// Version start dates (P1 start from BANNER_HISTORY) — used to derive event boundaries
const VERSION_DATES = [
  // 3.6 end date is Game8's own estimate (21-day-cycle-per-phase pattern); confirm once 3.7's start date is announced.
  { version: '3.6', start: '2026-08-20', end: '2026-09-30' },
  // Confirmed via game8.co WuWa hub: "Version 3.5 Schedule | July 10, 2026 - August 19, 2026"
  { version: '3.5', start: '2026-07-10', end: '2026-08-19' },
  // Estimated — see BANNER_HISTORY v3.4 comment for reasoning (3.3 end -> 3.5 start boundary)
  { version: '3.4', start: '2026-06-10', end: '2026-07-10' },
  // 3.3 was never added when it was the "upcoming" version — now backfilled since the game has moved past it.
  { version: '3.3', start: '2026-04-29', end: '2026-06-10' },
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

// Preload every BANNER_HISTORY.bannerArt URL once on app boot. Holds a module-
// level reference to each HTMLImageElement so the GC can't drop the decoded
// bitmap mid-session, and idempotent so repeat calls are free.
const _preloadedBannerArt = new Map();
let _bannerArtPreloaded = false;
function preloadBannerHistoryArt() {
  if (_bannerArtPreloaded || typeof Image === 'undefined') return;
  _bannerArtPreloaded = true;
  for (const b of BANNER_HISTORY) {
    const url = b && b.bannerArt;
    if (!url || _preloadedBannerArt.has(url)) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    _preloadedBannerArt.set(url, img);
  }
}

// Auto-detect which BANNER_HISTORY entry is actually live right now, and fall
// back to a best-effort reconstruction from it if CURRENT_BANNERS (the hand-
// curated snapshot above) wasn't updated in time for a new patch. Without
// this, a missed manual edit means the app keeps silently showing an expired
// banner forever — CURRENT_BANNERS has no mechanism of its own to notice its
// own endDate has passed.
//
// CURRENT_BANNERS is preferred whenever it already matches (or is ahead of)
// history, since it carries richer per-entry data (art crops, isNew flags,
// featured 4-stars) that BANNER_HISTORY doesn't store. The reconstruction
// below is a best-effort fallback, not a full replacement: weapon "title"
// epithets aren't derivable from any data source we have, so they're simply
// omitted (BannerCard already renders titles as optional).
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function getCurrentBannerAuto(now = Date.now()) {
  const active = BANNER_HISTORY.find(h => {
    const start = new Date(h.startDate).getTime();
    const end = new Date(h.endDate).getTime();
    return now >= start && now < end;
  });
  if (!active) return CURRENT_BANNERS;
  if (CURRENT_BANNERS.version === active.version && CURRENT_BANNERS.phase === active.phase) {
    return CURRENT_BANNERS;
  }

  // History has moved on to a phase CURRENT_BANNERS doesn't reflect yet —
  // reconstruct a best-effort banner object instead of serving stale data.
  const isFirstAppearance = (name) => {
    for (let i = BANNER_HISTORY.length - 1; i >= 0; i--) {
      if (BANNER_HISTORY[i].characters.includes(name)) return BANNER_HISTORY[i].id === active.id;
    }
    return false;
  };
  const characters = active.characters.map(name => {
    const cd = CHARACTER_DATA[name] || {};
    const theme = CHARACTER_THEMES.find(t => t.name === name);
    return {
      id: slugify(name),
      name,
      title: cd.title || '',
      element: cd.element || '',
      weaponType: cd.weapon || '',
      isNew: isFirstAppearance(name),
      featured4Stars: CURRENT_BANNERS.characters[0]?.featured4Stars || [],
      imageUrl: theme?.bannerArt || active.bannerArt || PLACEHOLDER_IMAGE,
      ...(theme?.pos?.header ? { imagePosition: theme.pos.header } : {}),
    };
  });
  const weapons = active.weapons.map((name, i) => {
    const forCharacter = active.characters[i] || active.characters[0];
    const cd = CHARACTER_DATA[forCharacter] || {};
    const theme = WEAPON_THEMES.find(t => t.name === name);
    return {
      id: slugify(name),
      name,
      type: cd.weapon || '',
      forCharacter,
      element: cd.element || '',
      isNew: isFirstAppearance(forCharacter),
      featured4Stars: CURRENT_BANNERS.weapons[0]?.featured4Stars || [],
      imageUrl: theme?.bannerArt || active.weaponBannerArt || PLACEHOLDER_IMAGE,
    };
  });

  return {
    ...CURRENT_BANNERS,
    version: active.version,
    phase: active.phase,
    startDate: active.startDate,
    endDate: active.endDate,
    characterBannerImage: active.bannerArt || CURRENT_BANNERS.characterBannerImage,
    weaponBannerImage: active.weaponBannerArt || CURRENT_BANNERS.weaponBannerImage,
    characters,
    weapons,
    _autoDerived: true,
    _predicted: !!active.predicted,
  };
}

import { CURRENT_BANNER_TITLES_FR, EVENTS_FR } from './banners.fr.js';

// Locale-aware CURRENT_BANNERS: only the display-only `title` fields on
// characters/weapons are swapped; every other field (names, dates, art URLs,
// standard banner arrays) is shared and returned as-is.
export function getLocalizedCurrentBanners(locale) {
  const base = getCurrentBannerAuto();
  if (locale !== 'fr') return base;
  const translateTitle = (entry) => ({
    ...entry,
    ...(CURRENT_BANNER_TITLES_FR[entry.title] ? { title: CURRENT_BANNER_TITLES_FR[entry.title] } : {}),
  });
  return {
    ...base,
    characters: base.characters.map(translateTitle),
    weapons: base.weapons.map(translateTitle),
  };
}

// Locale-aware EVENTS: only name/subtitle/description are swapped.
// resetType/rewards/color/gradient/accentColor are intentionally left as-is
// (see banners.fr.js header for why).
export function getLocalizedEvents(locale) {
  if (locale !== 'fr') return EVENTS;
  const out = {};
  for (const [key, base] of Object.entries(EVENTS)) {
    const fr = EVENTS_FR[key];
    out[key] = { ...base, ...(fr ? { name: fr.name, subtitle: fr.subtitle, description: fr.description } : {}) };
  }
  return out;
}

export {
  PLACEHOLDER_IMAGE,
  CURRENT_BANNERS,
  BANNER_HISTORY,
  EVENTS,
  PIONEER_PODCAST_HISTORY,
  DOUBLED_PAWNS_MATRIX_HISTORY,
  TACTICAL_HOLOGRAM_HISTORY,
  VERSION_DATES,
  DEFAULT_COLLECTION_IMAGES,
  CHARACTER_THEMES,
  WEAPON_THEMES,
  VERSION_SPLASH_SCREENS,
  OTHER_BACKGROUNDS,
  ANIMATED_BACKGROUNDS,
  preloadBannerHistoryArt,
};
