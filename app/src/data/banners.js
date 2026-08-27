// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/banners.js
// Current banners, banner history, events, default collection images,
// and character themes.
// ═══════════════════════════════════════════════════════════════════════════════

import { RELEASE_ORDER, CHARACTER_DATA } from './characters.js';

// Shared fallback art for any character/weapon that hasn't had a real portrait/icon
// sourced yet (post-v3.3 additions). Swap out per-entry as real art becomes available.
const PLACEHOLDER_IMAGE = './banners/_shared/cK3h3qFh-Abby-Card2.webp';

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
  characterBannerImage: './banners/_shared/8nvgqZKC-e7478-17840855867105-1920.jpg',
  weaponBannerImage: './banners/_shared/C3Gz8y18-Glint-Of-Cloud-Banner.jpg',
  eventBannerImage: PLACEHOLDER_IMAGE,
  whimperingWastesImage: './banners/_shared/HT4RyJBy-Whimpering-Wastes-BG.png',
  endstateMatrixImage: './banners/_shared/Jjn2Ncvp-images-2026-04-01-T034054-984.jpg',
  pioneerPodcastImage: './banners/_shared/zHsVrt8z-Sans-titre-115-20260401035034.png',
  towerOfAdversityImage: './banners/_shared/QF335JVv-Tower-of-Adversity-Banner-Art.jpg',
  illusiveRealmImage: './banners/_shared/zcc2MxR-Fantasies-of-the-Thousand-Gateways.jpg',
  tacticalHologramImage: './banners/_shared/CpjDZj8V-652896591-1275960654470518-5091818010205633369-n.jpg',
  weeklyBossImage: './banners/_shared/M5cLkMWf-file-00000000e8b071f480ded273f611ec2e.png',
  standardCharBannerImage: './banners/current/pjXgHN70-Tidal-Chorus-Banner-Art.webp',
  standardWeapBannerImage: './banners/current/21kQ66xr-Drawn-Edges.webp',
  dailyResetImage: './banners/current/Jj6cqnsQ-image.jpg',
  characters: [
    { id: 'qingxiao', name: 'Qingxiao', title: 'Heart Sword', element: 'Aero', weaponType: 'Sword', isNew: true, featured4Stars: ['Baizhi', 'Yangyang', 'Sanhua'], imageUrl: './banners/_shared/8nvgqZKC-e7478-17840855867105-1920.jpg' }, // no individual splash art yet — new debut, using the combined convene banner
    { id: 'denia', name: 'Denia', title: 'Bubbles of Nihility', element: 'Fusion', weaponType: 'Rectifier', isNew: false, featured4Stars: ['Baizhi', 'Yangyang', 'Sanhua'], imageUrl: './banners/_shared/DPnPVGVF-denia-banner.jpg', imagePosition: '50% 31%' }, // real splash art (same asset as BANNER_HISTORY v3.3-p2 / CHARACTER_THEMES.denia)
  ],
  weapons: [
    { id: 'glint-of-clouds', name: 'Glint of Clouds', type: 'Sword', forCharacter: 'Qingxiao', element: 'Aero', isNew: true, featured4Stars: ['Variation', 'Endless Collapse', 'Relativistic Jet'], imageUrl: './banners/_shared/C3Gz8y18-Glint-Of-Cloud-Banner.jpg' },
    { id: 'forged-dwarf-star', name: 'Forged Dwarf Star', type: 'Rectifier', forCharacter: 'Denia', element: 'Fusion', isNew: false, featured4Stars: ['Variation', 'Endless Collapse', 'Relativistic Jet'], imageUrl: './banners/_shared/Gv3c41jD-Forged-Dwarf-Star-Banner.webp' }, // real art, same asset as WEAPON_THEMES.forged-dwarf-star
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

// Real gacha-banner splash art for a character, for display purposes (the
// "Assets" section in CharacterDetailModal.jsx) — checks the currently live
// banner first (CURRENT_BANNERS.characters), then CHARACTER_THEMES (past
// banners' art, reused there for the theme picker). Returns null rather
// than a placeholder when neither has one — the caller decides how to
// handle "no banner art yet" (e.g. a brand-new debut sharing a banner with
// someone else, like Qingxiao/Denia both using the same v3.6-p1 image).
const getCharacterBannerArt = (name) => {
  const live = CURRENT_BANNERS.characters.find(c => c.name === name);
  if (live?.imageUrl) return live.imageUrl;
  const theme = CHARACTER_THEMES.find(t => t.name === name);
  return theme?.bannerArt || null;
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
  { id: 'v3.6-p2', version: '3.6', phase: 2, characters: ['Jingran', 'Hiyuki', 'Mornye'], weapons: ['Thousandfold Deliverance', 'Frostburn', 'Starfield Calibrator'], startDate: '2026-09-10', endDate: '2026-09-30', bannerArt: './banners/history/v3-6-p2/mCc8yv6J-show-76.png', weaponBannerArt: './banners/history/v3-6-p2/S7m6cfPC-Thousandfold-Delivrance.jpg', predicted: true },
  // bannerArt fixed 2026-08-18: was reusing Denia's own v3.3-p2 banner art (wrong — Denia is the
  // rerun here, Qingxiao is this banner's new headliner). 2nd attempt used fandom's
  // File:Qingxiao_Splash_Art.png (transparent cutout, not a banner image); 3rd attempt was a
  // self-cropped band of File:Qingxiao_Card.jpg (a tall portrait, imprecisely centered). Replaced with
  // the real official wide banner art (user-supplied, already hosted on ibb.co).
  // weaponBannerArt added 2026-08-18: real official Featured Weapon Convene banner for Glint of Clouds
  // (Qingxiao's signature Sword), user-supplied.
  // predicted flag removed 2026-08-20: confirmed live via fandom's own infobox ("Wind of
  // Transcendence" convene, 2026-08-20 – 2026-09-10, 3.6) — no longer a Game8 estimate.
  { id: 'v3.6-p1', version: '3.6', phase: 1, characters: ['Qingxiao', 'Denia'], weapons: ['Glint of Clouds', 'Forged Dwarf Star'], startDate: '2026-08-20', endDate: '2026-09-10', bannerArt: './banners/_shared/8nvgqZKC-e7478-17840855867105-1920.jpg', weaponBannerArt: './banners/_shared/C3Gz8y18-Glint-Of-Cloud-Banner.jpg' },
  // Version 3.5 — confirmed live via wuwatracker.com/fr/timeline (user-clarified 2026-08-14). p2 is
  // the current banner (Suisui + Aemeath rerun). p1 was Yangyang: Xuanling + Luuk Herssen + Lynae
  // (rerun). A separate "Starpath/Tideforge Reverbs" special selector Convene also runs continuously
  // across both p1 and p2, on top of the phase-bound character banners — not itemized as its own
  // history entry since it isn't a standard per-phase character/weapon banner.
  { id: 'v3.5-p2', version: '3.5', phase: 2, characters: ['Suisui', 'Aemeath'], weapons: ["Firstlight's Herald", 'Everbright Polestar'], startDate: '2026-07-30', endDate: '2026-08-19', bannerArt: './banners/_shared/wFwmhvLP-Suisui-banner.jpg' },
  { id: 'v3.5-p1', version: '3.5', phase: 1, characters: ['Yangyang: Xuanling', 'Luuk Herssen', 'Lynae'], weapons: ['Azure Oath', "Daybreaker's Spine", 'Spectrum Blaster'], startDate: '2026-07-10', endDate: '2026-07-30', bannerArt: './banners/_shared/QFHC5Y4h-Yangyang-Xuanling-banner.jpg' },
  // Version 3.4 (Somnoire: Night City region) — corrected via game8.co archive 494979 (official Banner
  // History, fetched 2026-08-16): Phase 1 was "Dreaming Upon the Moon"/"Rekindled Embers of Rage"
  // (Lucy + Rebecca dual-debut, Jun 8 - Jul 9). Phase 2 ran two concurrent character banners: "Tomorrow
  // in the Frame" (Lucilla debut, Jun 13 - Jul 9) and "Dance in The Storm's Wake" (Cartethyia rerun,
  // Jun 18 - Jul 9) — merged into one entry below since both share the v3.4/phase-2 slot.
  { id: 'v3.4-p2', version: '3.4', phase: 2, characters: ['Lucilla', 'Cartethyia'], weapons: ['Freeze Frame', "Defier's Thorn"], startDate: '2026-06-13', endDate: '2026-07-09', bannerArt: './banners/_shared/zT91s0wt-Lucilla-banner.jpg' },
  { id: 'v3.4-p1', version: '3.4', phase: 1, characters: ['Lucy', 'Rebecca'], weapons: ['Spectral Trigger', 'Skull Thrasher'], startDate: '2026-06-08', endDate: '2026-07-09', bannerArt: './banners/_shared/mC4xmBYY-Lucy-Banner.jpg' },
  // Version 3.3 — corrected via game8.co archive 494979 (official Banner History, fetched 2026-08-16):
  // Phase 1 debuted Hiyuki alongside Mornye + Iuno reruns; Phase 2 debuted Denia alongside Chisa +
  // Phrolova reruns. Previously modeled as solo-character phases with no weapons, which was inaccurate.
  { id: 'v3.3-p2', version: '3.3', phase: 2, characters: ['Denia', 'Chisa', 'Phrolova'], weapons: ['Forged Dwarf Star', 'Kumokiri', 'Lethean Elegy'], startDate: '2026-05-21', endDate: '2026-06-07', bannerArt: './banners/_shared/DPnPVGVF-denia-banner.jpg' },
  { id: 'v3.3-p1', version: '3.3', phase: 1, characters: ['Hiyuki', 'Mornye', 'Iuno'], weapons: ['Frostburn', 'Starfield Calibrator', "Moongazer's Sigil"], startDate: '2026-04-30', endDate: '2026-05-21', bannerArt: './banners/_shared/Gf7F9h12-hiyuki-banner.jpg' },
  // Version 3.2
  { id: 'v3.2-p2', version: '3.2', phase: 2, characters: ['Lynae', 'Zani', 'Phoebe'], weapons: ['Spectrum Blaster', 'Blazing Justice', 'Luminous Hymn'], startDate: '2026-04-09', endDate: '2026-04-29', bannerArt: './banners/_shared/h1Kwq7Vj-lynae-banner.jpg' },
  { id: 'v3.2-p1', version: '3.2', phase: 1, characters: ['Sigrika', 'Qiuyuan'], weapons: ['Solsworn Ciphers', 'Emerald Sentence'], startDate: '2026-03-19', endDate: '2026-04-09', bannerArt: './banners/_shared/DHJ2YMTM-sigrika-banner.jpg' },
  // Version 3.1
  { id: 'v3.1-p2', version: '3.1', phase: 2, characters: ['Luuk Herssen', 'Galbrena'], weapons: ["Daybreaker's Spine", 'Lux & Umbra'], startDate: '2026-02-26', endDate: '2026-03-18', bannerArt: './banners/_shared/ZzqY6F9R-luuk-banner.jpg' },
  { id: 'v3.1-p1', version: '3.1', phase: 1, characters: ['Aemeath', 'Chisa', 'Lupa'], weapons: ['Everbright Polestar', 'Kumokiri', 'Wildfire Mark'], startDate: '2026-02-05', endDate: '2026-02-26', bannerArt: './banners/_shared/Y4SzJSxL-Aemeath-banner.jpg' },
  // Version 3.0
  { id: 'v3.0-p2', version: '3.0', phase: 2, characters: ['Mornye', 'Augusta', 'Iuno'], weapons: ['Starfield Calibrator', 'Thunderflare Dominion', "Moongazer's Sigil"], startDate: '2026-01-15', endDate: '2026-02-04', bannerArt: './banners/_shared/9mGJpYvb-morny-banner.jpg' },
  { id: 'v3.0-p1', version: '3.0', phase: 1, characters: ['Lynae', 'Cartethyia', 'Ciaccona'], weapons: ['Spectrum Blaster', "Defier's Thorn", 'Woodland Aria'], startDate: '2025-12-25', endDate: '2026-01-15', bannerArt: './banners/_shared/h1Kwq7Vj-lynae-banner.jpg' },
  // Version 2.8
  { id: 'v2.8-p2', version: '2.8', phase: 2, characters: ['Phrolova', 'Cantarella'], weapons: ['Lethean Elegy', 'Whispers of Sirens'], startDate: '2025-12-11', endDate: '2025-12-24', bannerArt: './banners/_shared/QvHKLCgt-phrolova-banner.jpg' },
  { id: 'v2.8-p1', version: '2.8', phase: 1, characters: ['Chisa', 'Phoebe'], weapons: ['Kumokiri', 'Luminous Hymn'], startDate: '2025-11-20', endDate: '2025-12-11', bannerArt: './banners/_shared/RTZ06knw-chisa-banner.jpg' },
  // Version 2.7
  { id: 'v2.7-p2', version: '2.7', phase: 2, characters: ['Qiuyuan', 'Zani'], weapons: ['Emerald Sentence', 'Blazing Justice'], startDate: '2025-10-30', endDate: '2025-11-19', bannerArt: './banners/_shared/fd3D6QRx-qiuyuan-banner.jpg' },
  { id: 'v2.7-p1', version: '2.7', phase: 1, characters: ['Galbrena', 'Lupa'], weapons: ['Lux & Umbra', 'Wildfire Mark'], startDate: '2025-10-09', endDate: '2025-10-30', bannerArt: './banners/_shared/MxSTSBX7-galbrena-banner.jpg' },
  // Version 2.6
  { id: 'v2.6-p2', version: '2.6', phase: 2, characters: ['Iuno', 'Ciaccona'], weapons: ["Moongazer's Sigil", 'Woodland Aria'], startDate: '2025-09-17', endDate: '2025-10-08', bannerArt: './banners/_shared/DPd6HgjH-iuno-banner.jpg' },
  { id: 'v2.6-p1', version: '2.6', phase: 1, characters: ['Augusta', 'Carlotta', 'Shorekeeper'], weapons: ['Thunderflare Dominion', 'The Last Dance', 'Stellar Symphony'], startDate: '2025-08-28', endDate: '2025-09-17', bannerArt: './banners/_shared/4wbJgQGj-augusta-banner.jpg' },
  // Version 2.5
  { id: 'v2.5-p2', version: '2.5', phase: 2, characters: ['Cantarella', 'Brant'], weapons: ['Whispers of Sirens', 'Unflickering Valor'], startDate: '2025-08-14', endDate: '2025-08-27', bannerArt: './banners/_shared/wZ85YQzF-cantarella-banner.jpg' },
  { id: 'v2.5-p1', version: '2.5', phase: 1, characters: ['Phrolova', 'Roccia'], weapons: ['Lethean Elegy', 'Tragicomedy'], startDate: '2025-07-24', endDate: '2025-08-14', bannerArt: './banners/_shared/QvHKLCgt-phrolova-banner.jpg' },
  // Version 2.4
  { id: 'v2.4-p2', version: '2.4', phase: 2, characters: ['Lupa'], weapons: ['Wildfire Mark'], startDate: '2025-07-03', endDate: '2025-07-23', bannerArt: './banners/_shared/9HBRhrjq-lupa-banner.jpg' },
  { id: 'v2.4-p1', version: '2.4', phase: 1, characters: ['Cartethyia'], weapons: ["Defier's Thorn"], startDate: '2025-06-12', endDate: '2025-07-03', bannerArt: './banners/_shared/Ppt1BXc-carthetya-banner.jpg' },
  // Version 2.3 (Anniversary)
  { id: 'v2.3-p2', version: '2.3', phase: 2, characters: ['Ciaccona', 'Jinhsi', 'Changli', 'Carlotta', 'Roccia', 'Brant'], weapons: ['Woodland Aria', 'Ages of Harvest', 'Blazing Brilliance', 'The Last Dance', 'Tragicomedy', 'Unflickering Valor'], startDate: '2025-05-22', endDate: '2025-06-11', bannerArt: './banners/_shared/prXLxMyw-ciaconna-banner.jpg' },
  { id: 'v2.3-p1', version: '2.3', phase: 1, characters: ['Zani', 'Jiyan', 'Yinlin', 'Zhezhi', 'Xiangli Yao', 'Phoebe'], weapons: ['Blazing Justice', 'Verdant Summit', 'Stringmaster', 'Rime-Draped Sprouts', "Verity's Handle", 'Luminous Hymn'], startDate: '2025-04-29', endDate: '2025-05-22', bannerArt: './banners/_shared/tMVkd4dg-zani-banner.jpg' },
  // Version 2.2
  { id: 'v2.2-p2', version: '2.2', phase: 2, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2025-04-17', endDate: '2025-04-28', bannerArt: './banners/_shared/cKTnnDWB-shore-keeper-banner.jpg' },
  { id: 'v2.2-p1', version: '2.2', phase: 1, characters: ['Cantarella', 'Camellya'], weapons: ['Whispers of Sirens', 'Red Spring'], startDate: '2025-03-27', endDate: '2025-04-17', bannerArt: './banners/_shared/wZ85YQzF-cantarella-banner.jpg' },
  // Version 2.1
  { id: 'v2.1-p2', version: '2.1', phase: 2, characters: ['Brant', 'Changli'], weapons: ['Unflickering Valor', 'Blazing Brilliance'], startDate: '2025-03-06', endDate: '2025-03-26', bannerArt: './banners/_shared/vx8KGHcj-brant-banner.jpg' },
  { id: 'v2.1-p1', version: '2.1', phase: 1, characters: ['Phoebe'], weapons: ['Luminous Hymn'], startDate: '2025-02-13', endDate: '2025-03-06', bannerArt: './banners/_shared/Tq7pFMgp-phoebe-banner.jpg' },
  // Version 2.0
  { id: 'v2.0-p2', version: '2.0', phase: 2, characters: ['Roccia', 'Jinhsi'], weapons: ['Tragicomedy', 'Ages of Harvest'], startDate: '2025-01-23', endDate: '2025-02-12', bannerArt: './banners/_shared/YYWVfxt-roccia-banner.jpg' },
  { id: 'v2.0-p1', version: '2.0', phase: 1, characters: ['Carlotta', 'Zhezhi'], weapons: ['The Last Dance', 'Rime-Draped Sprouts'], startDate: '2025-01-02', endDate: '2025-01-23', bannerArt: './banners/_shared/67r6NbMf-carlotta-banner.png' },
  // Version 1.4
  { id: 'v1.4-p2', version: '1.4', phase: 2, characters: ['Yinlin', 'Xiangli Yao'], weapons: ['Stringmaster', "Verity's Handle"], startDate: '2024-12-12', endDate: '2025-01-01', bannerArt: './banners/_shared/Y4SDqwg2-yinlin-banner.jpg' },
  { id: 'v1.4-p1', version: '1.4', phase: 1, characters: ['Camellya'], weapons: ['Red Spring'], startDate: '2024-11-14', endDate: '2024-12-12', bannerArt: './banners/_shared/20xFP1B1-camellya-banner.png' },
  // Version 1.3
  { id: 'v1.3-p2', version: '1.3', phase: 2, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-10-24', endDate: '2024-11-13', bannerArt: './banners/_shared/hFM8STLQ-jiyan-banner.jpg' },
  { id: 'v1.3-p1', version: '1.3', phase: 1, characters: ['Shorekeeper'], weapons: ['Stellar Symphony'], startDate: '2024-09-29', endDate: '2024-10-24', bannerArt: './banners/_shared/cKTnnDWB-shore-keeper-banner.jpg' },
  // Version 1.2
  { id: 'v1.2-p2', version: '1.2', phase: 2, characters: ['Xiangli Yao'], weapons: ["Verity's Handle"], startDate: '2024-09-07', endDate: '2024-09-28', bannerArt: './banners/_shared/CphXJs9L-xiangli-yao-banner.jpg' },
  { id: 'v1.2-p1', version: '1.2', phase: 1, characters: ['Zhezhi'], weapons: ['Rime-Draped Sprouts'], startDate: '2024-08-15', endDate: '2024-09-07', bannerArt: './banners/_shared/XfkKS4dS-zhezhi-banner.jpg' },
  // Version 1.1
  { id: 'v1.1-p2', version: '1.1', phase: 2, characters: ['Changli'], weapons: ['Blazing Brilliance'], startDate: '2024-07-22', endDate: '2024-08-14', bannerArt: './banners/_shared/HDZ1LG4R-changli-banner.jpg' },
  { id: 'v1.1-p1', version: '1.1', phase: 1, characters: ['Jinhsi'], weapons: ['Ages of Harvest'], startDate: '2024-06-28', endDate: '2024-07-22', bannerArt: './banners/_shared/7xBSVRbQ-jinhsi-banner.jpg' },
  // Version 1.0 — NOTE: p1 and p2 intentionally overlap (both ran concurrently at launch)
  { id: 'v1.0-p2', version: '1.0', phase: 2, characters: ['Yinlin'], weapons: ['Stringmaster'], startDate: '2024-06-14', endDate: '2024-06-26', bannerArt: './banners/_shared/Y4SDqwg2-yinlin-banner.jpg' },
  { id: 'v1.0-p1', version: '1.0', phase: 1, characters: ['Jiyan'], weapons: ['Verdant Summit'], startDate: '2024-05-23', endDate: '2024-06-13', bannerArt: './banners/_shared/hFM8STLQ-jiyan-banner.jpg' },
];

// [SECTION:MOST_PULLED]
// Lifetime "total tracked pulls while featured" per character, sourced 2026-08-21 from
// wuwatracker.com/fr/tracker/stats/<id> — one real-text (non-canvas) stats page per historical
// banner phase, with sequential chronological IDs 100001 (Jiyan, v1.0-p1 launch banner) through
// 100041 (Qingxiao & Denia, the live v3.6-p1 banner). Each page's "Invocations 5✦" list gives every
// 5★ character's tracked pull count for that specific banner run; only the count(s) clearly above
// that banner's standard-pool 50/50-loss baseline were credited as "featured" and summed here across
// every rerun (the small always-present counts for off-banner 5★s are the standard-pool pity/50-50
// losses, not that character's own featured run, and are excluded to avoid double counting). This is
// a self-reported sample (~20k-250k tracked users per banner depending on age), not the full
// playerbase, and 4★ resonators (Sanhua/Baizhi/Yangyang/Danjin/Mortefi/Chixia/Aalto/Taoqi/Yuanwu/
// Youhu/Buling) are excluded entirely — they're always in the standard 4★ pool, never "featured".
// `appearances` = number of distinct banner runs (original release + reruns) counted.
const MOST_PULLED_STATS = {
  'Aemeath':            { totalPulls: 416154, appearances: 2 },
  'Cartethyia':         { totalPulls: 393288, appearances: 3 },
  'Hiyuki':             { totalPulls: 307460, appearances: 1 },
  'Shorekeeper':        { totalPulls: 264747, appearances: 3 },
  'Chisa':              { totalPulls: 263447, appearances: 2 },
  'Lynae':              { totalPulls: 253122, appearances: 3 },
  'Phrolova':           { totalPulls: 228148, appearances: 3 },
  'Zani':               { totalPulls: 224306, appearances: 3 },
  'Carlotta':           { totalPulls: 222258, appearances: 2 },
  'Iuno':               { totalPulls: 200703, appearances: 2 },
  'Camellya':           { totalPulls: 200253, appearances: 2 },
  'Augusta':            { totalPulls: 188955, appearances: 2 },
  'Ciaccona':           { totalPulls: 170421, appearances: 3 },
  'Cantarella':         { totalPulls: 166956, appearances: 3 },
  'Phoebe':             { totalPulls: 165601, appearances: 3 },
  'Galbrena':           { totalPulls: 138874, appearances: 2 },
  'Jinhsi':             { totalPulls: 127246, appearances: 2 },
  'Changli':            { totalPulls: 127203, appearances: 2 },
  'Denia':              { totalPulls: 123508, appearances: 1 },
  'Lupa':               { totalPulls: 116982, appearances: 2 },
  'Qiuyuan':            { totalPulls: 107510, appearances: 2 },
  'Lucilla':            { totalPulls: 95411,  appearances: 1 },
  'Zhezhi':             { totalPulls: 83976,  appearances: 2 },
  'Yangyang: Xuanling': { totalPulls: 78320,  appearances: 1 },
  'Brant':              { totalPulls: 78077,  appearances: 2 },
  'Yinlin':             { totalPulls: 76094,  appearances: 3 },
  'Luuk Herssen':       { totalPulls: 58217,  appearances: 1 },
  'Roccia':             { totalPulls: 57533,  appearances: 2 },
  'Suisui':             { totalPulls: 52804,  appearances: 1 },
  'Jiyan':              { totalPulls: 47330,  appearances: 2 },
  'Sigrika':            { totalPulls: 43788,  appearances: 1 },
  'Qingxiao':           { totalPulls: 17725,  appearances: 1 },
  'Xiangli Yao':        { totalPulls: 11893,  appearances: 2 },
};

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
    imageUrl: './banners/_shared/M5cLkMWf-file-00000000e8b071f480ded273f611ec2e.png'
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
    imageUrl: './banners/_shared/zcc2MxR-Fantasies-of-the-Thousand-Gateways.jpg'
  },
  pioneerPodcast: {
    name: 'Pioneer Podcast',
    subtitle: 'Event',
    description: 'Limited-time event',
    resetType: 'Version update',
    color: 'yellow',
    // Corrected 2026-08-25: hour aligned to the confirmed 08:00 UTC version-boundary convention
    // (was already the right day via wuwatracker.com/fr/timeline's pixel-geometry read, just the
    // wrong hour — see the giftsOfDriftingMist block above for the technique).
    currentEnd: '2026-09-29T07:59:59Z',
    rewards: '400 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30',
    accentColor: 'yellow',
    imageUrl: './banners/_shared/zHsVrt8z-Sans-titre-115-20260401035034.png'
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
    // Showing with currentEnd for current version cycle display only. Corrected 2026-08-25:
    // wuwatracker.com/fr/timeline's pixel geometry (bar-div left/width vs. the day-marker grid)
    // shows this arena's bar actually ends Sep 28, one day before Pioneer Podcast/most other
    // v3.6 events — not the same date as previously guessed.
    currentEnd: '2026-09-28T07:59:59Z',
    permanent: true,
    rewards: 'Weekly Rewards',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    imageUrl: './banners/_shared/CpjDZj8V-652896591-1275960654470518-5091818010205633369-n.jpg'
  },
  endstateMatrix: {
    name: 'Endstate Matrix (Phase 1)',
    subtitle: 'Boss Rush',
    description: 'High difficulty boss rush — new in v3.2',
    resetType: 'Multi-version',
    color: 'pink',
    // Corrected 2026-08-25: previous end (Sep 10, matching only the v3.6-p1 banner window) was
    // wrong — the timeline's own bar-div pixel geometry (left/width px vs. the day-marker grid,
    // 32px = 1 day) shows this actually spans the FULL v3.6 version, both phases, ending Sep 29.
    currentStart: '2026-08-20T08:00:00Z',
    currentEnd: '2026-09-29T07:59:59Z',
    introducedVersion: '3.2',
    rewards: '400 Astrite',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30',
    accentColor: 'pink',
    imageUrl: './banners/_shared/Jjn2Ncvp-images-2026-04-01-T034054-984.jpg'
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
    imageUrl: './banners/_shared/QF335JVv-Tower-of-Adversity-Banner-Art.jpg'
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
    imageUrl: './banners/_shared/HT4RyJBy-Whimpering-Wastes-BG.png'
  },
  // Corrected 2026-08-25: every one-off v3.6 event below was previously anchored as a guess to the
  // v3.6-p1 banner window (2026-08-20 -> 2026-09-10) because the site's rendered bar text only
  // exposed names + relative duration labels ("15d", "1mo", etc), not per-event start/end. This
  // pass instead pulled the raw HTML of wuwatracker.com/fr/timeline (DV web_fetch, getRawHtml,
  // Chrome/Windows UA + google.com referer + 8s load wait to clear the JS challenge — same
  // anti-bot technique as the character icon sourcing) and read each event bar's own
  // `left`/`width` inline-style pixel values against the day-marker grid (verified 32px = 1 day,
  // calendar starts Monday 2026-05-25). That gives exact day-level start/end per event, and several
  // turned out to be wrong — often badly (e.g. bountifulCrescendo and chordCleansing were modeled
  // as spanning the whole Aug20-Sep10 phase-1 window; the real timeline bar shows both as one-week
  // windows near the END of the version, not tied to the phase-1 start at all). Times use the
  // confirmed 08:00 UTC version-boundary convention (CURRENT_BANNERS.startDate/BANNER_HISTORY),
  // with `currentEnd` set one minute before the following day's 08:00 boundary — the same
  // "boundary hour minus one minute" convention already used for the 02:00/01:59:59 daily-reset
  // pairs below (towerOfAdversity, whimperingWastes), which the pixel geometry confirmed as already
  // accurate and left unchanged. `versionSpecialCampaign` stays removed (never confirmed on any
  // source). `rewards` left unset where no official figure is published, matching this file's
  // existing convention (EventCard.jsx hides the badge cleanly when absent).
  giftsOfDriftingMist: {
    name: 'Gifts of Drifting Mist',
    subtitle: '7 Day Login Event',
    description: "During the event, log in to claim the day's login rewards from the event page.",
    resetType: 'Version update',
    color: 'yellow',
    currentStart: '2026-08-20T08:00:00Z',
    // pixel geometry: bar spans the full v3.6 version (both phases), not just phase 1 — ends Sep 29.
    currentEnd: '2026-09-29T07:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-yellow-900/30',
    accentColor: 'yellow',
    imageUrl: './banners/_shared/HTN1ZNWj-wuwa-gifts-of-drifting-mist.png', // real event cover art, sourced 2026-08-21 from wuwatracker.com/timeline's event-cover-images API (fandom has no article for this event yet), uploaded to imgbb 2026-08-21
  },
  bountifulCrescendo: {
    name: 'Bountiful Crescendo',
    subtitle: 'Limited-Time Material Double Drop Event',
    description: 'Spend Waveplates to claim double rewards after completing eligible material-farming challenges.',
    resetType: 'Limited-time',
    color: 'lime',
    // pixel geometry: this does NOT start with the version — it's a 7-day window right before the
    // version ends (Sep 3 -> Sep 10), not Aug 20 -> Sep 10 as previously modeled.
    currentStart: '2026-09-03T08:00:00Z',
    currentEnd: '2026-09-10T07:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-lime-900/30',
    accentColor: 'lime',
    imageUrl: './banners/_shared/TqLqWVsv-bountiful-crescendo.webp', // real event art, sourced 2026-08-20 from fandom's File:Bountiful_Crescendo.jpg (recurring material double-drop event, generic art reused across versions), uploaded to imgbb 2026-08-20
  },
  resonanceSimRealm: {
    name: 'Resonance Sim Realm',
    subtitle: 'Combat Event',
    description: 'New v3.6 limited-time combat event.',
    resetType: 'Limited-time',
    color: 'red',
    currentStart: '2026-08-22T08:00:00Z',
    // pixel geometry: runs almost the entire v3.6 version (through Sep 29), not just 5 days as the
    // previous text-scrape pass estimated.
    currentEnd: '2026-09-29T07:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-red-900/30',
    accentColor: 'red',
    imageUrl: './banners/_shared/zHQTnWXp-wuwa-resonance-sim-realm.png', // real event cover art, sourced 2026-08-21 from wuwatracker.com/timeline's event-cover-images API (fandom has no article for this event yet), uploaded to imgbb 2026-08-21
  },
  secondComingOfSolaris: {
    name: 'Second Coming of Solaris: Coded Deception',
    subtitle: 'Leisure Event',
    description: 'New v3.6 limited-time leisure event.',
    resetType: 'Limited-time',
    color: 'cyan',
    // pixel geometry: starts a week into the version (Aug 27), not at the Aug 20 launch.
    currentStart: '2026-08-27T08:00:00Z',
    currentEnd: '2026-09-14T07:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-cyan-900/30',
    accentColor: 'cyan',
    // real art, sourced 2026-08-20 from fandom's File:Second_Coming_of_Solaris_(Ultra).jpg — the
    // wiki page is for an earlier "Second Coming of Solaris" iteration, not the confirmed
    // "Coded Deception" v3.6 sub-title art; kept as the best real-asset match found, not a
    // guaranteed exact match for this specific event run.
    imageUrl: './banners/_shared/7tVkVbdx-second-coming-of-solaris.webp',
  },
  theStringsRemember: {
    name: 'The Strings Remember',
    subtitle: 'Leisure Event',
    description: 'New v3.6 limited-time leisure event.',
    resetType: 'Limited-time',
    color: 'purple',
    // pixel geometry: starts Sep 3 (two weeks into the version), not at the Aug 20 launch.
    currentStart: '2026-09-03T08:00:00Z',
    currentEnd: '2026-09-21T07:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-purple-900/30',
    accentColor: 'purple',
    imageUrl: './banners/_shared/XxJtGLpQ-wuwa-the-strings-remember.png', // real event cover art, sourced 2026-08-21 from wuwatracker.com/timeline's event-cover-images API (fandom has no article for this event yet), uploaded to imgbb 2026-08-21
  },
  ifDreamsStillReverberate: {
    name: 'If Dreams Still Reverberate',
    subtitle: 'Featured Co-op Combat Event',
    description: 'New v3.6 limited-time co-op combat event.',
    resetType: 'Limited-time',
    color: 'orange',
    // pixel geometry: starts at the phase-1/phase-2 boundary (Sep 10), not the Aug 20 launch —
    // this is a phase-2-only event, the opposite of what the earlier text-scrape guess assumed.
    currentStart: '2026-09-10T08:00:00Z',
    currentEnd: '2026-09-29T07:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-orange-900/30',
    accentColor: 'orange',
    imageUrl: './banners/_shared/WpcMcR5t-wuwa-if-dreams-still-reverberate.png', // real event cover art, sourced 2026-08-21 from wuwatracker.com/timeline's event-cover-images API (fandom has no article for this event yet), uploaded to imgbb 2026-08-21
  },
  fogveilPagoda: {
    name: 'Featured Exploration Event: Fogveil Pagoda',
    subtitle: 'Exploration Event',
    description: 'New v3.6 limited-time exploration event.',
    resetType: 'Limited-time',
    color: 'lime',
    // pixel geometry: starts Sep 17 (a week into phase 2), not at the Aug 20 launch.
    currentStart: '2026-09-17T08:00:00Z',
    currentEnd: '2026-09-29T07:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-lime-900/30',
    accentColor: 'lime',
    imageUrl: './banners/_shared/WNv772NQ-fogveil-pagoda.webp', // real event art, sourced 2026-08-20 from fandom's File:Fogveil_Pagoda.png, uploaded to imgbb 2026-08-20
  },
  chordCleansing: {
    name: 'Chord Cleansing',
    subtitle: 'Limited-Time Echo Double Drop Event',
    description: 'Spend Waveplates to claim double rewards after completing a Tacet Suppression challenge.',
    resetType: 'Limited-time',
    color: 'pink',
    // pixel geometry: this does NOT start with the version either — a 7-day window right before
    // the version ends (Sep 22 -> Sep 29), not Aug 20 -> Sep 10 as previously modeled.
    currentStart: '2026-09-22T08:00:00Z',
    currentEnd: '2026-09-29T07:59:59Z',
    gradient: 'from-neutral-900/30 via-neutral-900/20 to-pink-900/30',
    accentColor: 'pink',
    imageUrl: './banners/_shared/99Pk72ZX-chord-cleansing.webp', // real event art, sourced 2026-08-20 from fandom's File:Chord_Cleansing.jpg (recurring echo double-drop event, generic art reused across versions), uploaded to imgbb 2026-08-20
  },
};

// [SECTION:STATIC_DATA] - Static collection data (moved outside component for perf)
const DEFAULT_COLLECTION_IMAGES = {
  // 5★ Resonators (by release order)
  'Jiyan': './banners/characters/jiyan/00C5Sqj-Jiyan-Full-Sprite.webp',
  'Calcharo': './banners/characters/calcharo/tM11rtrL-Calcharo-Full-Sprite.webp',
  'Encore': './banners/characters/encore/rGZBZ4HV-Encore-Full-Sprite.webp',
  'Jianxin': './banners/characters/jianxin/ZDxNGkj-Jianxin-Full-Sprite.webp',
  'Lingyang': './banners/characters/lingyang/gbjK568S-Lingyang-Full-Sprite.webp',
  'Verina': './banners/characters/verina/mV6qxb5h-Verina-Full-Sprite.webp',
  'Yinlin': './banners/characters/yinlin/S79CF3R3-Yinlin-Full-Sprite.webp',
  'Changli': './banners/characters/changli/mr6BwwP0-Changli-Full-Sprite.webp',
  'Jinhsi': './banners/characters/jinhsi/fG9sf6cc-Jinhsi-Full-Sprite.webp',
  'Shorekeeper': './banners/characters/shorekeeper/svHmQWYB-Shorekeeper-Full-Sprite.webp',
  'Camellya': './banners/characters/camellya/6Rg494Ld-Camellya-Full-Sprite.webp',
  'Xiangli Yao': './banners/characters/xiangli-yao/27jds05D-Xiangli-Yao-Full-Sprite.webp',
  'Zhezhi': './banners/characters/zhezhi/0VpsfXkK-Zhezhi-Full-Sprite.webp',
  'Carlotta': './banners/characters/carlotta/bRBx4Ymx-Carlotta-Full-Sprite.webp',
  'Roccia': './banners/characters/roccia/b548Jj2Y-Roccia-Full-Sprite.webp',
  'Phoebe': './banners/characters/phoebe/6SdsQ7M-Phoebe-Full-Sprite.webp',
  'Brant': './banners/characters/brant/CDg2QgM-Brant-Full-Sprite.webp',
  'Cantarella': './banners/characters/cantarella/jZs3MWvV-Cantarella-Full-Sprite.webp',
  'Zani': './banners/characters/zani/5XLvmGfC-Zani-Full-Sprite-1.webp',
  'Ciaccona': './banners/characters/ciaccona/N6dKs9zy-Ciaccona-Full-Sprite.webp',
  'Cartethyia': './banners/characters/cartethyia/QFR5LVdc-Cartethyia-Full-Sprite.webp',
  'Lupa': './banners/characters/lupa/8n4kck2M-Lupa-Full-Sprite.webp',
  'Augusta': './banners/characters/augusta/V0TXt2Ty-Augusta-Full-Sprite.webp',
  'Galbrena': './banners/characters/galbrena/rK0yjSr6-Galbrena-Full-Sprite.webp',
  'Iuno': './banners/characters/iuno/5WmnWgtG-Iuno-Full-Sprite.webp',
  'Luuk Herssen': './banners/characters/luuk-herssen/23dF1tWT-Luuk-Herssen-Full-Sprite.webp',
  'Aemeath': './banners/characters/aemeath/0pBQpMwv-Aemeath-Full-Sprite.webp',
  'Mornye': './banners/characters/mornye/QvyQ33zv-Mornye-Full-Sprite.webp',
  'Rover': './banners/_shared/V0zwhc58-Rover-1.webp',
  'Rover: Spectro': './banners/_shared/V0zwhc58-Rover-1.webp',
  'Rover: Havoc': './banners/_shared/V0zwhc58-Rover-1.webp',
  'Rover: Aero': './banners/_shared/V0zwhc58-Rover-1.webp',
  'Rover: Electro': './banners/_shared/V0zwhc58-Rover-1.webp',
  'Chisa': './banners/characters/chisa/x8zB67Vh-Chisa-Full-Sprite.webp',
  'Phrolova': './banners/characters/phrolova/Nd0HbF4v-Phrolova-Full-Sprite.webp',
  'Qiuyuan': './banners/characters/qiuyuan/JRvP5fnx-Qiuyuan-Full-Sprite.webp',
  'Lynae': './banners/characters/lynae/Mym9KBBM-Lynae-Full-Sprite.webp',
  'Sigrika': './banners/characters/sigrika/TBhhKSk6-Sigrika-Full-Sprite.webp',
  'Rebecca': './banners/characters/rebecca/j9sMxT3Q-Rebecca-Full-Sprite.webp',
  'Lucilla': './banners/characters/lucilla/FkFvMP3J-Lucilla-Full-Sprite.webp',
  'Lucy': './banners/characters/lucy/CKsNSBwg-Lucy-Full-Sprite.webp',
  'Yangyang: Xuanling': './banners/characters/yangyang-xuanling/tTrNVcJ2-Yangyang-Xuanling-Full-Sprite.webp',
  'Denia': './banners/characters/denia/B59KDGHZ-Denia-Full-Sprite.webp',
  'Hiyuki': './banners/characters/hiyuki/Q5s9CMF-Hiyuki-Full-Sprite.webp',
  'Suisui': './banners/characters/suisui/Q7z2ZLGV-Suisui-Full-Sprite.webp',
  // Qingxiao sourced 2026-08-18 from fandom's own File:Qingxiao_Full_Sprite.png (uploaded 2026-08-17,
  // ahead of her 2026-08-20 release, via the MediaWiki API — bypasses the site's Cloudflare challenge).
  'Qingxiao': './banners/characters/qingxiao/27tS4Zw1-qingxiao-sprite.webp',
  // v3.6 — no real art asset sourced yet, using shared placeholder until real portraits are available
  // Jingran sourced 2026-08-18 from fandom's own File:Jingran_Full_Sprite.png (uploaded 2026-08-17,
  // ahead of his 3.6-p2 release, via the MediaWiki API — bypasses the site's Cloudflare challenge).
  'Jingran': './banners/characters/jingran/yB024Z5G-jingran-sprite.webp',
  // 4★ Resonators
  'Aalto': './banners/characters/aalto/v81v3Hq-Aalto-Full-Sprite.webp',
  'Baizhi': './banners/characters/baizhi/4Ztm8DCG-Baizhi-Full-Sprite.webp',
  'Chixia': './banners/characters/chixia/r2SVVmPv-Chixia-Full-Sprite.webp',
  'Danjin': './banners/characters/danjin/CK3XQCpM-Danjin-Full-Sprite.webp',
  'Yangyang': './banners/characters/yangyang/kV1hBqbv-Yangyang-Full-Sprite.webp',
  'Sanhua': './banners/characters/sanhua/yc0XTQVB-Sanhua-Full-Sprite.webp',
  'Taoqi': './banners/characters/taoqi/qM2r22RR-Taoqi-Full-Sprite.webp',
  'Yuanwu': './banners/characters/yuanwu/p6ZQJkcC-Yuanwu-Full-Sprite.webp',
  'Mortefi': './banners/characters/mortefi/xq8hFgpc-Mortefi-Full-Sprite.webp',
  'Youhu': './banners/characters/youhu/Zzc0PMWX-Youhu-Full-Sprite.webp',
  'Lumi': './banners/characters/lumi/rRy25xmt-Lumi-Full-Sprite.webp',
  'Buling': './banners/characters/buling/fGZBRCWp-Buling-Full-Sprite.webp',
  // 5★ Weapons
  'Verdant Summit': './banners/characters/verdant-summit/5gjYYrHj-Verdant-Summit.webp',
  'Emerald of Genesis': './banners/characters/emerald-of-genesis/HTj8Lp7N-Weapon-Emerald-of-Genesis.webp',
  'Static Mist': './banners/characters/static-mist/cKVzgTJ4-Weapon-Static-Mist.webp',
  'Abyss Surges': './banners/characters/abyss-surges/FLVx6xwt-Abyss-Surges.webp',
  'Lustrous Razor': './banners/characters/lustrous-razor/mCmkydWk-Weapon-Lustrous-Razor.webp',
  'Cosmic Ripples': './banners/characters/cosmic-ripples/XfGk2sVG-Cosmic-Ripples.webp',
  'Stringmaster': './banners/characters/stringmaster/wNGPxnmH-Stringmaster.webp',
  'Ages of Harvest': './banners/characters/ages-of-harvest/5gGBmzX8-Ages-of-Harvest.webp',
  'Blazing Brilliance': './banners/characters/blazing-brilliance/gLJbgvwg-Blazing-Brilliance.webp',
  'Rime-Draped Sprouts': './banners/characters/rime-draped-sprouts/NgNshLYy-Rime-Draped-Sprouts.png',
  "Verity's Handle": './banners/_shared/k2hFQfx8-Veritys-Handle.webp',
  'Stellar Symphony': './banners/characters/stellar-symphony/yBB4Kzxs-Stellar-Symphony.webp',
  'Red Spring': './banners/characters/red-spring/Cp3d2vg2-Red-Spring.webp',
  'The Last Dance': './banners/characters/the-last-dance/zhtJWLk0-The-Last-Dance.png',
  'Tragicomedy': './banners/characters/tragicomedy/4RRD3mLv-Tragicomedy.png',
  'Luminous Hymn': './banners/characters/luminous-hymn/prdDZjKg-Luminous-Hymn.png',
  'Unflickering Valor': './banners/characters/unflickering-valor/PGbr24Xp-Unflickering-Valor.png',
  'Whispers of Sirens': './banners/characters/whispers-of-sirens/YT73fDrB-Whispers-of-Sirens.webp',
  'Blazing Justice': './banners/characters/blazing-justice/pjbhYHP4-Blazing-Justice.webp',
  'Woodland Aria': './banners/characters/woodland-aria/8nXkG8d5-Woodland-Aria.png',
  "Defier's Thorn": './banners/_shared/KpG4cbZJ-Defier-s-Thorn.webp',
  'Wildfire Mark': './banners/characters/wildfire-mark/RGqLJKGK-Wildfire-Mark.webp',
  'Lethean Elegy': './banners/characters/lethean-elegy/YF3fJtF7-Lethean-Elegy.webp',
  'Thunderflare Dominion': './banners/characters/thunderflare-dominion/d062x9ZH-Thunderflare-Dominion.webp',
  "Moongazer's Sigil": './banners/_shared/zhF435g4-Moongazers-Sigil.webp',
  'Lux & Umbra': './banners/characters/lux-umbra/FqVkK4Tn-Lux-Umbra.webp',
  'Emerald Sentence': './banners/characters/emerald-sentence/rKmyDNs5-Emerald-Sentence.webp',
  'Kumokiri': './banners/characters/kumokiri/VWxG9pSF-Kumokiri.webp',
  'Spectrum Blaster': './banners/characters/spectrum-blaster/qLC341Sv-Spectrum-Blaster.webp',
  'Starfield Calibrator': './banners/characters/starfield-calibrator/tTDkFQ7W-Starfield-Calibrator.webp',
  // v3.1+ weapons
  'Everbright Polestar': './banners/characters/everbright-polestar/4g4RbTv7-Weapon-Everbright-Polestar.webp',
  "Daybreaker's Spine": './banners/_shared/tpn30Lrm-6982b58a79a3b099e1bd0d48i-CAFZ7lo03.webp',
  'Solsworn Ciphers': './banners/characters/solsworn-ciphers/8n2cT6yR-Solsworn-Ciphers.webp',
  'Skull Thrasher': './banners/characters/skull-thrasher/Zpyp8nP4-Skull-Trasher-sprite.webp',
  'Freeze Frame': './banners/characters/freeze-frame/0VKCVGXD-Freeze-Frame-spritz.webp',
  'Spectral Trigger': './banners/characters/spectral-trigger/WW6vN5b7-Spectral-Trigger-sprite.webp',
  'Azure Oath': './banners/characters/azure-oath/chFNhPBH-Azure-Oath-Sprite.webp',
  'Frostburn': './banners/characters/frostburn/29mMcRy-Frostburn-sprite.webp',
  'Forged Dwarf Star': './banners/characters/forged-dwarf-star/FLf2rmCB-Forged-Dwarf-Start.webp',
  "Firstlight's Herald": './banners/_shared/PvkzS83F-First-s-Light-Herald-sprite.webp',
  // v3.6 weapons — real icons sourced 2026-08-20 from fandom's own File:Weapon_Glint_of_Clouds.png
  // / File:Weapon_Thousandfold_Deliverance.png via the MediaWiki API (bypasses Cloudflare),
  // uploaded to imgbb 2026-08-20.
  'Glint of Clouds': './banners/characters/glint-of-clouds/Q3CfgYv8-glint-of-clouds.webp',
  'Thousandfold Deliverance': './banners/characters/thousandfold-deliverance/ccHCPYHF-thousandfold-deliverance.webp',
  // 4★ Weapons
  'Overture': './banners/characters/overture/nMXdhNTW-Overture.png',
  "Ocean's Gift": './banners/_shared/rfk6Fgwx-Oceans-Gift.png',
  "Bloodpact's Pledge": './banners/_shared/V0WH0NSV-Bloodpacts-Pledge-1.webp',
  'Waltz in Masquerade': './banners/characters/waltz-in-masquerade/5XXfstH6-Waltz-in-Masquerade.webp',
  'Legend of Drunken Hero': './banners/characters/legend-of-drunken-hero/v65yf4Bd-Legend-of-Drunken-Hero.webp',
  'Romance in Farewell': './banners/characters/romance-in-farewell/BKc9hdKC-Romance-in-Farewell.webp',
  'Fables of Wisdom': './banners/characters/fables-of-wisdom/whCyQys6-Fables-of-Wisdom.webp',
  'Meditations on Mercy': './banners/characters/meditations-on-mercy/pBBrZM0b-Meditations-on-Mercy.webp',
  'Call of the Abyss': './banners/characters/call-of-the-abyss/Z92nYnW-Call-of-the-Abyss.webp',
  'Somnoire Anchor': './banners/characters/somnoire-anchor/N2cJ3qc7-Somnoire-Anchor.webp',
  'Fusion Accretion': './banners/characters/fusion-accretion/xSMHxtL0-Fusion-Accretion.webp',
  'Celestial Spiral': './banners/characters/celestial-spiral/ZRT3sr7g-Celestial-Spiral.webp',
  'Relativistic Jet': './banners/characters/relativistic-jet/nM5rjSNw-Relativistic-Jet.webp',
  'Endless Collapse': './banners/characters/endless-collapse/gZtL25jN-Endless-Collapse.webp',
  'Waning Redshift': './banners/characters/waning-redshift/27NQSk1n-Waning-Redshif.webp',
  'Beguiling Melody': './banners/characters/beguiling-melody/wZXxz8MC-Beguiling-Melody.webp',
  'Boson Astrolabe': './banners/characters/boson-astrolabe/RkcX6zQK-Boson-Astrolabe-1.webp',
  'Pulsation Bracer': './banners/characters/pulsation-bracer/k2kVPjmf-Pulsation-Bracer.webp',
  'Phasic Homogenizer': './banners/characters/phasic-homogenizer/RpKTNDq1-Phasic-Homogenizer.webp',
  'Laser Shearer': './banners/characters/laser-shearer/hFqKgw50-Laser-Shearer.webp',
  'Radiance Cleaver': './banners/characters/radiance-cleaver/WNxbm8DB-Radiance-Cleaver.webp',
  'Aureate Zenith': './banners/characters/aureate-zenith/0j0M2Bwm-Aureate-Zenith.webp',
  'Radiant Dawn': './banners/characters/radiant-dawn/RkGdFttY-Radiant-Dawn.webp',
  'Aether Strike': './banners/characters/aether-strike/5XJNVHgT-Aether-Strike.webp',
  'Solar Flame': './banners/characters/solar-flame/YMsf52M-Solar-Flame.webp',
  'Feather Edge': './banners/characters/feather-edge/fzG8JpvG-Feather-Edge.webp',
  // Swords
  'Training Sword': './banners/characters/training-sword/23XjFZHD-Training-Sword.webp',
  'Tyro Sword': './banners/characters/tyro-sword/Qv4nYxF1-Tyro-Sword.webp',
  'Guardian Sword': './banners/characters/guardian-sword/8LSknxRS-Guardian-Sword.webp',
  'Sword of Voyager': './banners/characters/sword-of-voyager/TBCX9fFQ-Sword-of-Voyager.webp',
  'Originite: Type II': './banners/characters/originite-type-ii/j9M4LLSf-Originite-Type-II.webp',
  'Sword of Night': './banners/characters/sword-of-night/csfb39w-Sword-of-Night.webp',
  'Commando of Conviction': './banners/characters/commando-of-conviction/RkTdFgNG-Commando-of-Conviction.webp',

  'Sword#18': './banners/characters/sword-18/wrWDmBcp-Sword18.webp',
  'Lunar Cutter': './banners/characters/lunar-cutter/tpSR66cR-Lunar-Cutter.webp',
  'Lumingloss': './banners/characters/lumingloss/dsJQhndm-Lumingloss.webp',
  // Rectifiers
  'Rectifier of Voyager': './banners/characters/rectifier-of-voyager/KjNy5C91-Rectifier-of-Voyager.webp',
  'Rectifier of Night': './banners/characters/rectifier-of-night/ksQ3Zswf-Rectifier-of-Night.webp',
  'Variation': './banners/characters/variation/5WZP5mKD-Variation.webp',
  'Tyro Rectifier': './banners/characters/tyro-rectifier/Df8dXQRf-Tyro-Rectifier.webp',
  'Training Rectifier': './banners/characters/training-rectifier/Y7rT1gJw-Training-Rectifier.webp',
  'Originite: Type V': './banners/characters/originite-type-v/9H5GNPVw-Originite-Type-V.webp',
  'Rectifier#25': './banners/characters/rectifier-25/B9T1f3f-Rectifier25.webp',
  'Jinzhou Keeper': './banners/characters/jinzhou-keeper/WvvYvwx0-Jinzhou-Keeper.webp',
  'Comet Flare': './banners/characters/comet-flare/xKTWZWzs-Comet-Flare.webp',
  'Guardian Rectifier': './banners/characters/guardian-rectifier/Wp618BH3-Guardian-Rectifier.webp',
  'Augment': './banners/characters/augment/Mk44Y5W4-Augment.webp',
  // Broadblades
  'Training Broadblade': './banners/characters/training-broadblade/sdfM24cr-Weapon-Training-Broadblade.webp',
  'Tyro Broadblade': './banners/characters/tyro-broadblade/ds5DBHgM-Weapon-Tyro-Broadblade.webp',
  'Guardian Broadblade': './banners/characters/guardian-broadblade/gLqjnhM1-Weapon-Guardian-Broadblade.webp',
  'Broadblade of Night': './banners/characters/broadblade-of-night/m5kvbBJH-Broadblade-of-Night.webp',
  'Discord': './banners/characters/discord/p6L36v9V-Discord.webp',
  // Gauntlets
  'Tyro Gauntlets': './banners/characters/tyro-gauntlets/NgZL4WFR-Tyro-Gauntlets.webp',
  'Training Gauntlets': './banners/characters/training-gauntlets/b50Nnc2w-Training-Gauntlets.webp',
  'Hollow Mirage': './banners/characters/hollow-mirage/JjP9sjJm-Hollow-Mirage.webp',
  'Stonard': './banners/characters/stonard/yn59hz0y-Stonard.webp',
  'Gauntlets#21D': './banners/characters/gauntlets-21d/XxFKztMj-Gauntlets21-D.webp',
  'Amity Accord': './banners/characters/amity-accord/tpxP1SM8-Amity-Accord.webp',
  'Marcato': './banners/characters/marcato/hFX9MK4t-Marcato.webp',
  'Gauntlets of Night': './banners/characters/gauntlets-of-night/dFF1GyP-Gauntlets-of-Night.webp',
  'Guardian Gauntlets': './banners/characters/guardian-gauntlets/k2vd2xW0-Guardian-Gauntlets.webp',
  'Originite: Type III': './banners/characters/originite-type-iii/bg4GXQbS-Originite-Type-III.webp',
  'Gauntlets of Voyager': './banners/characters/gauntlets-of-voyager/tVq4bTZ-Gauntlets-of-Voyager.webp',
  // Pistols
  'Pistols#26': './banners/characters/pistols-26/FLJ14pcp-Pistols26.webp',
  'Originite: Type IV': './banners/characters/originite-type-iv/wZ2tjtwj-Originite-Type-IV.webp',
  'Pistols of Voyager': './banners/characters/pistols-of-voyager/pjWf99Qb-Pistols-of-Voyager.webp',
  'Novaburst': './banners/characters/novaburst/NdnmMWcp-Novaburst.webp',
  'Thunderbolt': './banners/characters/thunderbolt/99rqCmM0-Thunderbolt.webp',
  'Undying Flame': './banners/characters/undying-flame/XfM9BJVX-Undying-Flame.webp',
  'Guardian Pistols': './banners/characters/guardian-pistols/m59fPcVF-Guardian-Pistols.webp',
  'Tyro Pistols': './banners/characters/tyro-pistols/Ldtk0QGN-Tyro-Pistols.webp',
  'Training Pistols': './banners/characters/training-pistols/PsZhn5d0-Training-Pistols.webp',
  'Pistols of Night': './banners/characters/pistols-of-night/zhf1hxsG-Pistols-of-Night.webp',
  'Cadenza': './banners/characters/cadenza/bRHfTQh1-Cadenza.webp',
  // Missing weapons
  'Originite: Type I': './banners/characters/originite-type-i/398KxX0f-Weapon-Originite-Type-I.webp',
  'Broadblade of Voyager': './banners/characters/broadblade-of-voyager/bMYZxLtK-Weapon-Broadblade-of-Voyager.webp',
  'Helios Cleaver': './banners/characters/helios-cleaver/Kj719h8m-Weapon-Helios-Cleaver.webp',
  'Dauntless Evernight': './banners/characters/dauntless-evernight/PvhJ1Cw2-Dauntless-Evernight.webp',
  'Autumntrace': './banners/characters/autumntrace/static.nanoka.cc-T_IconWeapon21010074_UI.webp',
  // 1-Cost Echo images
  'Whiff Whaff': './banners/characters/whiff-whaff/DDyTMyQR-Whiff-Whaff-Icon.webp',
  'Snip Snap': './banners/characters/snip-snap/LDv0brpC-Snip-Snap-Icon.webp',
  'Zig Zag': './banners/characters/zig-zag/7J9hK2LX-Zig-Zag-Icon.webp',
  'Tick Tack': './banners/characters/tick-tack/jKXRM4g-Tick-Tack-Icon.webp',
  'Clang Bang': './banners/characters/clang-bang/cc3hxYDw-Clang-Bang-Icon.webp',
  'Gulpuff': './banners/characters/gulpuff/zhxwmLGT-Gulpuff-Icon.webp',
  'Chirpuff': './banners/characters/chirpuff/wZ0sXmbd-Chirpuff-Icon.webp',
  'Excarat': './banners/characters/excarat/7JCWR4LZ-Excarat-Icon.webp',
  'Baby Viridblaze Saurian': './banners/characters/baby-viridblaze-saurian/DHhNddtp-Baby-Viridblaze-Saurian-Icon.webp',
  'Sabyr Boar': './banners/characters/sabyr-boar/DHG4d72n-Sabyr-Boar-Icon.webp',
  'Fusion Dreadmane': './banners/characters/fusion-dreadmane/pjzkqWTf-Fusion-Dreadmane-Icon.webp',
  'Diamondclaw': './banners/characters/diamondclaw/FbjnCjz4-Diamondclaw-Icon.webp',
  'Cruisewing': './banners/characters/cruisewing/ZpcpkBmb-Cruisewing-Icon.webp',
  'Hoartoise': './banners/characters/hoartoise/N29nQrMF-Hoartoise-Icon.webp',
  'Hooscamp': './banners/characters/hooscamp/twFD9Dn1-Hooscamp-Icon.webp',
  'Lava Larva': './banners/characters/lava-larva/svpSKC3g-Lava-Larva-Icon.webp',
  'Dwarf Cassowary': './banners/characters/dwarf-cassowary/nqkB7N5H-Dwarf-Cassowary-Icon.webp',
  'Galescourge Stalker': './banners/characters/galescourge-stalker/DP2Y15R7-Galescourge-Stalker-Icon.webp',
  'Voltscourge Stalker': './banners/characters/voltscourge-stalker/V0XSnvpX-Voltscourge-Stalker-Icon.webp',
  'Frostscourge Stalker': './banners/characters/frostscourge-stalker/KcsfTX4n-Frostscourge-Stalker-Icon.webp',
  'Aero Drake': './banners/characters/aero-drake/4RFLGcTZ-Aero-Drake-Icon.webp',
  'Electro Drake': './banners/characters/electro-drake/Xx06HgcD-Electro-Drake-Icon.webp',
  'Glacio Drake': './banners/characters/glacio-drake/jvDRpdWG-Glacio-Drake-Icon.webp',
  'Fusion Drake': './banners/characters/fusion-drake/jP5ctBKj-Fusion-Drake-Icon.webp',
  'Spectro Drake': './banners/characters/spectro-drake/sr68RKk-Spectro-Drake-Icon.webp',
  'Havoc Drake': './banners/characters/havoc-drake/PGM9yxdS-Havoc-Drake-Icon.webp',
  'Glacio Prism': './banners/characters/glacio-prism/9998gFfw-Glacio-Prism-Icon.webp',
  'Fusion Prism': './banners/characters/fusion-prism/pjzkqWTf-Fusion-Prism-Icon.webp',
  'Havoc Prism': './banners/characters/havoc-prism/dwq9gCwp-Havoc-Prism-Icon.webp',
  'Spectro Prism': './banners/characters/spectro-prism/DfBFLQ5q-Spectro-Prism-Icon.webp',
  'Aero Prism': './banners/characters/aero-prism/hRRfbzjd-Aero-Prism-Icon.webp',
  'Chop Chop: Headless': './banners/characters/chop-chop-headless/RpGDpLHH-Chop-Chop-Headless-Icon.webp',
  'Chop Chop: Leftless': './banners/characters/chop-chop-leftless/spG4w7rH-Chop-Chop-Leftless-Icon.webp',
  'Chop Chop: Rightless': './banners/characters/chop-chop-rightless/VYQ3QPP2-Chop-Chop-Rightless-Icon.webp',
  'Fae Ignis': './banners/characters/fae-ignis/ZzcvGGGx-Fae-Ignis-Icon.webp',
  'Nimbus Wraith': './banners/characters/nimbus-wraith/DHGcPZhB-Nimbus-Wraith-Icon.webp',
  'Hocus Pocus': './banners/characters/hocus-pocus/6cN2yBFt-Hocus-Pocus-Icon.webp',
  'Lottie Lost': './banners/characters/lottie-lost/C3SrXNVJ-Lottie-Lost-Icon.webp',
  'Diggy Duggy': './banners/characters/diggy-duggy/DPQc8hqb-Diggy-Duggy-Icon.webp',
  'Chest Mimic': './banners/characters/chest-mimic/8DgC4tmx-Chest-Mimic-Icon.webp',
  'Flora Drone': './banners/characters/flora-drone/yccgwMG1-Flora-Drone-Icon.webp',
  'Mining Drone': './banners/characters/mining-drone/q3m55xgj-Mining-Drone-Icon.webp',
  'Geospider S4': './banners/characters/geospider-s4/P7x6wBm-Geospider-S4-Icon.webp',
  'Baby Roseshroom': './banners/characters/baby-roseshroom/gMCfrP73-Baby-Roseshroom-Icon.webp',
  'Vanguard Junrock': './banners/characters/vanguard-junrock/zVGNLzdt-Vanguard-Junrock-Icon.webp',
  'Fission Junrock': './banners/characters/fission-junrock/yBhnf1nj-Fission-Junrock-Icon.webp',
  'Golden Junrock': './banners/characters/golden-junrock/R4Mtj1t6-Golden-Junrock-Icon.webp',
  'Calcified Junrock': './banners/characters/calcified-junrock/HkprCbb-Calcified-Junrock-Icon.webp',
  'Electro Predator': './banners/characters/electro-predator/LDX6kPxT-Electro-Predator-Icon.webp',
  'Glacio Predator': './banners/characters/glacio-predator/nqxnCjR3-Glacio-Predator-Icon.webp',
  'Aero Predator': './banners/characters/aero-predator/7tyC2t4T-Aero-Predator-Icon.webp',
  'Fusion Warrior': './banners/characters/fusion-warrior/tPpgKfdZ-Fusion-Warrior-Icon.webp',
  'Havoc Warrior': './banners/characters/havoc-warrior/Pzj1bKqw-Havoc-Warrior-Icon.webp',
  'La Guardia': './banners/characters/la-guardia/j9wYBLjD-La-Guardia-Icon.webp',
  'Sagittario': './banners/characters/sagittario/mrzscNny-Sagittario-Icon.webp',
  'Sacerdos': './banners/characters/sacerdos/DfyWdfrm-Sacerdos-Icon.webp',
  'Devotee\'s Flesh': './banners/_shared/xtnFQwD2-Devotee-s-Flesh.png',
  'Tremor Warrior': './banners/characters/tremor-warrior/Xfx21DrZ-Tremor-Warrior-Icon.webp',
  'Zip Zap': './banners/characters/zip-zap/CK2xw8bY-Zip-Zap-Icon.webp',
  'Iceglint Dancer': './banners/characters/iceglint-dancer/ycSKpxh4-Iceglint-Dancer-Icon.webp',
  'Shadow Stepper': './banners/characters/shadow-stepper/w96PCdB-Shadow-Stepper-Icon.webp',
  'Nightmare: Aero Predator': './banners/characters/nightmare-aero-predator/0p2B1nyW-Nightmare-Aero-Predator-Icon.webp',
  'Nightmare: Baby Roseshroom': './banners/characters/nightmare-baby-roseshroom/23k9BbyC-Nightmare-Baby-Roseshroom-Icon.webp',
  'Nightmare: Baby Viridblaze Saurian': './banners/characters/nightmare-baby-viridblaze-saurian/dwcMGxzb-Nightmare-Baby-Viridblaze-Saurian-Icon.webp',
  'Nightmare: Chirpuff': './banners/characters/nightmare-chirpuff/ZzyktnkP-Nightmare-Chirpuff-Icon.webp',
  'Nightmare: Dwarf Cassowary': './banners/characters/nightmare-dwarf-cassowary/n85hWpT6-Nightmare-Dwarf-Cassowary-Icon.webp',
  'Nightmare: Electro Predator': './banners/characters/nightmare-electro-predator/LDX6kPxT-Nightmare-Electro-Predator-Icon.webp',
  'Nightmare: Glacio Predator': './banners/characters/nightmare-glacio-predator/nqxnCjR3-Nightmare-Glacio-Predator-Icon.webp',
  'Nightmare: Gulpuff': './banners/characters/nightmare-gulpuff/2H3QWGB-Nightmare-Gulpuff-Icon.webp',
  'Nightmare: Havoc Warrior': './banners/characters/nightmare-havoc-warrior/WvdsKkCT-Nightmare-Havoc-Warrior-Icon.webp',
  'Nightmare: Tick Tack': './banners/characters/nightmare-tick-tack/Y4FwmGSW-Nightmare-Tick-Tack-Icon.webp',
  'Traffic Illuminator': './banners/characters/traffic-illuminator/RpPVKgcJ-Traffic-Illuminator-Icon.webp',
  // 4-Cost Echo icons
  'Mourning Aix': './banners/characters/mourning-aix/XZ09Kvky-Mourning-Aix-Icon.webp',
  'Feilian Beringal': './banners/characters/feilian-beringal/RppHgV69-Feilian-Beringal-Icon.webp',
  'Tempest Mephis': './banners/characters/tempest-mephis/m5KgKh6R-Tempest-Mephis-Icon.webp',
  'Thundering Mephis': './banners/characters/thundering-mephis/Mbg8kP3-Thundering-Mephis-Icon.webp',
  'Inferno Rider': './banners/characters/inferno-rider/Mkw9SPM7-Inferno-Rider-Icon.webp',
  'Bell-Borne Geochelone': './banners/characters/bell-borne-geochelone/zVZHP0hw-Bell-Borne-Geochelone-Icon.webp',
  'Impermanence Heron': './banners/characters/impermanence-heron/k6QDV6H1-Impermanence-Heron-Icon.webp',
  'Lampylumen Myriad': './banners/characters/lampylumen-myriad/q3yyBwB8-Lampylumen-Myriad-Icon.webp',
  'Mech Abomination': './banners/characters/mech-abomination/GqBBWHL-Mech-Abomination-Icon.webp',
  'Crownless': './banners/characters/crownless/NkpNYzb-Crownless-Icon.webp',
  'Jué': './banners/characters/ju/hxsP3fFC-Ju-Icon.webp',
  'Fallacy of No Return': './banners/characters/fallacy-of-no-return/tPw0LG3T-Fallacy-of-No-Return-Icon.webp',
  'Sentry Construct': './banners/characters/sentry-construct/BVJsMKzd-Sentry-Construct-Icon.webp',
  'Nightmare: Impermanence Heron': './banners/characters/nightmare-impermanence-heron/5gct6D18-Nightmare-Impermanence-Heron-Icon.webp',
  'Nightmare: Lampylumen Myriad': './banners/characters/nightmare-lampylumen-myriad/rWn3RrM-Nightmare-Lampylumen-Myriad-Icon.webp',
  'Dragon of Dirge': './banners/characters/dragon-of-dirge/hFQ1ZCmT-Dragon-of-Dirge-Icon.webp',
  'Nightmare: Hecate': './banners/characters/nightmare-hecate/zhskZ8jn-Nightmare-Hecate-Icon.webp',
  'Nightmare: Crownless': './banners/characters/nightmare-crownless/x8JsLzb0-Nightmare-Crownless-Icon.webp',
  'Nightmare: Mourning Aix': './banners/characters/nightmare-mourning-aix/ccWwhHhX-Nightmare-Mourning-Aix-Icon.webp',
  'Nightmare: Feilian Beringal': './banners/characters/nightmare-feilian-beringal/fdBQFmtL-Nightmare-Feilian-Beringal-Icon.webp',
  'Nightmare: Inferno Rider': './banners/characters/nightmare-inferno-rider/Z6Hsjwr4-Nightmare-Inferno-Rider-Icon.webp',
  'Nightmare: Tempest Mephis': './banners/characters/nightmare-tempest-mephis/Qv6VB480-Nightmare-Tempest-Mephis-Icon.webp',
  'Nightmare: Thundering Mephis': './banners/characters/nightmare-thundering-mephis/TMjCxQX9-Nightmare-Thundering-Mephis-Icon.webp',
  'Dreamless': './banners/characters/dreamless/JjT68rdx-Dreamless-Icon.webp',
  'Reminiscence: Fleurdelys': './banners/characters/reminiscence-fleurdelys/N6r9JSwb-Reminiscence-Fleurdelys-Icon.webp',
  'Lioness of Glory': './banners/characters/lioness-of-glory/TMFh75cg-Lioness-of-Glory-Icon.webp',
  'The False Sovereign': './banners/characters/the-false-sovereign/NHH8K01-The-False-Sovereign-Icon.webp',
  'Lady of the Sea': './banners/characters/lady-of-the-sea/C5kVbQcS-Lady-of-the-Sea-Icon.webp',
  'Reminiscence: Threnodian - Leviathan': './banners/characters/reminiscence-threnodian-leviathan/Z12RVspK-Reminiscence-Threnodian-Leviathan-Icon.webp',
  'Hyvatia': './banners/characters/hyvatia/PGtdhhRd-Hyvatia-Icon.webp',
  'Sigillum': './banners/characters/sigillum/JR620JdC-Sigillum-Icon.webp',
  'Reactor Husk': './banners/characters/reactor-husk/4nRHm50w-Reactor-Husk-Icon.webp',
  'Nameless Explorer': './banners/characters/nameless-explorer/sdWR4SgF-Nameless-Explorer-Icon.webp',
  'Lorelei': './banners/characters/lorelei/9kynG0DJ-Lorelei-Icon.webp',
  'Nightmare: Kelpie': './banners/characters/nightmare-kelpie/bjtwr7yr-Nightmare-Kelpie-Icon.webp',
  'Hecate': './banners/characters/hecate/DH0bCdYK-Hecate-Icon.webp',
  'Reminiscence: Fenrico': './banners/characters/reminiscence-fenrico/wZK2x483-Reminiscence-Fenrico-Icon.webp',
  // 3-Cost Echo icons
  'Capitaneus': './banners/characters/capitaneus/VYbs2G44-Capitaneus-Icon.webp',
  'Havoc Dreadmane': './banners/characters/havoc-dreadmane/3y35jG2X-Havoc-Dreadmane-Icon.webp',
  'Lumiscale Construct': './banners/characters/lumiscale-construct/YBYGBw70-Lumiscale-Construct-Icon.webp',
  'Tambourinist': './banners/characters/tambourinist/Jw8j0SxC-Tambourinist-Icon.webp',
  'Spearback': './banners/characters/spearback/7JSVwMyC-Spearback-Icon.webp',
  'Carapace': './banners/characters/carapace/PGkFcS50-Carapace-Icon.webp',
  'Roseshroom': './banners/characters/roseshroom/kgz25mLM-Roseshroom-Icon.webp',
  'Violet-Feathered Heron': './banners/characters/violet-feathered-heron/ns6dcr6t-Violet-Feathered-Heron-Icon.webp',
  'Cyan-Feathered Heron': './banners/characters/cyan-feathered-heron/DfK0CRyM-Cyan-Feathered-Heron-Icon.webp',
  'Flautist': './banners/characters/flautist/RphMfMzT-Flautist-Icon.webp',
  'Hoochief': './banners/characters/hoochief/tTL9qbhD-Hoochief-Icon.webp',
  'Stonewall Bracer': './banners/characters/stonewall-bracer/dw7V5L6T-Stonewall-Bracer-Icon.webp',
  'Autopuppet Scout': './banners/characters/autopuppet-scout/5WJVT0ns-Autopuppet-Scout-Icon.webp',
  'Viridblaze Saurian': './banners/characters/viridblaze-saurian/k2LsdFCf-Viridblaze-Saurian-Icon.webp',
  'Glacio Dreadmane': './banners/characters/glacio-dreadmane/LXG92c1v-Glacio-Dreadmane-Icon.webp',
  'Chasm Guardian': './banners/characters/chasm-guardian/1J8M9qx0-Chasm-Guardian-Icon.webp',
  'Abyssal Mercator': './banners/characters/abyssal-mercator/chV4vWNJ-Abyssal-Mercator-Icon.webp',
  'Twin Nova - Nebulous Cannon': './banners/characters/twin-nova-nebulous-cannon/s9rrBgL8-Twin-Nova-Nebulous-Cannon-Icon.webp',
  'Twin Nova - Collapsar Blade': './banners/characters/twin-nova-collapsar-blade/rK7B4PM5-Twin-Nova-Collapsar-Blade-Icon.webp',
  'Sabercat Prowler': './banners/characters/sabercat-prowler/JWchKx7x-Sabercat-Prowler-Icon.webp',
  'Sabercat Reaver': './banners/characters/sabercat-reaver/JWMcgRY4-Sabercat-Reaver-Icon.webp',
  'Spacetrek Explorer': './banners/characters/spacetrek-explorer/4nh1N91b-Spacetrek-Explorer-Icon.webp',
  'Flora Reindeer': './banners/characters/flora-reindeer/LDv0brpC-Flora-Reindeer-Icon.webp',
  'Windlash Coleoid': './banners/characters/windlash-coleoid/1yKLmnC-Windlash-Coleoid-Icon.webp',
  'Frostbite Coleoid': './banners/characters/frostbite-coleoid/5gdNHqbG-Frostbite-Coleoid-Icon.webp',
  'Glommoth': './banners/characters/glommoth/yBX17MGF-Glommoth-Icon.webp',
  'Ironhoof': './banners/characters/ironhoof/bRNS0DKF-Ironhoof-Icon.webp',
  'Mining Reindeer': './banners/characters/mining-reindeer/8gc61bfT-Mining-Reindeer-Icon.webp',
  'Reminiscence - Kronaclaw': './banners/characters/reminiscence-kronaclaw/KxrLYyzN-T-Icon-Monster-Head-32060-UI.webp',
  'Kronablight': './banners/characters/kronablight/4ZJ1Kzwb-Kronablight-Icon.webp',
  'Pilgrim\'s Shell': './banners/_shared/rGSxX774-Pilgrim-s-Shell-Icon.webp',
  'Kerasaur': './banners/characters/kerasaur/tP81d0f5-Kerasaur-Icon.webp',
  'Hurriclaw': './banners/characters/hurriclaw/RG3XwmV5-Hurriclaw-Icon.webp',
  'Nightmare: Viridblaze Saurian': './banners/characters/nightmare-viridblaze-saurian/C5Q01c2x-Nightmare-Viridblaze-Saurian-Icon.webp',
  'Nightmare: Violet-Feathered Heron': './banners/characters/nightmare-violet-feathered-heron/rKDvkS2Q-Nightmare-Violet-Feathered-Heron-Icon.webp',
  'Nightmare: Cyan-Feathered Heron': './banners/characters/nightmare-cyan-feathered-heron/v6WJ0dJd-Nightmare-Cyan-Feathered-Heron-Icon.webp',
  'Nightmare: Roseshroom': './banners/characters/nightmare-roseshroom/yn41d4Vx-Nightmare-Roseshroom-Icon.webp',
  'Nightmare: Tambourinist': './banners/characters/nightmare-tambourinist/rfw6xZrR-Nightmare-Tambourinist-Icon.webp',
  'Corrosaurus': './banners/characters/corrosaurus/1G54DG6K-Corrosaurus-Icon.webp',
  'Diurnus Knight': './banners/characters/diurnus-knight/CpyL99C5-Diurnus-Knight-Icon.webp',
  'Nocturnus Knight': './banners/characters/nocturnus-knight/M5V9hjW5-Nocturnus-Knight-Icon.webp',
  'Questless Knight': './banners/characters/questless-knight/vC2Mqzqc-Questless-Knight-Icon.webp',
  'Abyssal Gladius': './banners/characters/abyssal-gladius/PZ4WLJ1g-Abyssal-Gladius-Icon.webp',
  'Abyssal Patricius': './banners/characters/abyssal-patricius/nqM5wjZc-Abyssal-Patricius-Icon.webp',
  'Rage Against the Statue': './banners/characters/rage-against-the-statue/JWzHhr1H-Rage-Against-the-Statue-Icon.webp',
  'Vitreum Dancer': './banners/characters/vitreum-dancer/HpXcqH2X-Vitreum-Dancer-Icon.webp',
  'Cuddle Wuddle': './banners/characters/cuddle-wuddle/C4kjd33-Cuddle-Wuddle-Icon.webp',
  'Chop Chop': './banners/characters/chop-chop/8LRFvBW4-Chop-Chop-Icon.webp',
  'Lightcrusher': './banners/characters/lightcrusher/RpYdQddL-Lightcrusher-Icon.webp',
  'Rocksteady Guardian': './banners/characters/rocksteady-guardian/8LG9k4bn-Rocksteady-Guardian-Icon.webp',
  // Land of Xuanfang echoes (v3.5) — icons sourced from wutheringwaves.fandom.com, matching echoes.js's iconUrl
  'Thousand-Puppet Pavilion': './banners/characters/thousand-puppet-pavilion/23cVrFbk-Thousand-Puppet-Pavilion.webp',
  'Myriad Snare: Rustfire Chassis': './banners/characters/myriad-snare-rustfire-chassis/KzxLH0wS-Myriad-Snare-Rustfire-Chassis.webp',
  'Reminiscence: Denia': './banners/characters/reminiscence-denia/qYy1Y7Ck-Reminiscence-Denia.webp',
  'Reminiscence: Threnodian - Voidborne Construct': './banners/characters/reminiscence-threnodian-voidborne-construct/gZdFc1CG-Reminiscence-Threnodian-Voidborne-Construct.webp',
  'Reminiscence - Nightmare: Adam Smasher': './banners/characters/reminiscence-nightmare-adam-smasher/twCtsS1D-Reminiscence-Nightmare-Adam-Smasher.webp',
  'Forbidden Bastion': './banners/characters/forbidden-bastion/Ps1zmbnM-Forbidden-Bastion.webp',
  'Fog Lionarch': './banners/characters/fog-lionarch/TB6d8kTy-Fog-Lionarch.webp',
  'Voidwing Moth': './banners/characters/voidwing-moth/mCw6NvMt-Voidwing-Moth.webp',
  "Pilgrim's Shell": './banners/_shared/4ZHwcHT6-Pilgrims-Shell.webp',
  "Devotee's Flesh": './banners/_shared/DHRkbQg2-Devotees-Flesh.webp',
  // v3.5 — added 2026-08-18 (echo audit): 13 echoes missing from the roster entirely, icons re-hosted
  // from wutheringwaves.fandom.com, matching echoes.js's iconUrl for each.
  'Smiter': './banners/characters/smiter/JWvmx2xC-Smiter.webp',
  'Porcelain Picket': './banners/characters/porcelain-picket/jP0xbjv8-Porcelain-Picket.webp',
  'Stone Picket': './banners/characters/stone-picket/WvnyB258-Stone-Picket.webp',
  'Aureate Picket': './banners/characters/aureate-picket/zTK3cyrf-Aureate-Picket.webp',
  'Kernel Puppet: Joy': './banners/characters/kernel-puppet-joy/nNh2QrRp-Kernel-Puppet-Joy.webp',
  'Kernel Puppet: Anger': './banners/characters/kernel-puppet-anger/TxczQftT-Kernel-Puppet-Anger.webp',
  'Kernel Puppet: Worry': './banners/characters/kernel-puppet-worry/XrGXPtfJ-Kernel-Puppet-Worry.webp',
  'Kernel Puppet: Reflection': './banners/characters/kernel-puppet-reflection/5xYH8fVC-Kernel-Puppet-Reflection.webp',
  'Kernel Puppet: Grief': './banners/characters/kernel-puppet-grief/RkwnCxWx-Kernel-Puppet-Grief.webp',
  'Kernel Puppet: Fright': './banners/characters/kernel-puppet-fright/BHK35m0C-Kernel-Puppet-Fright.webp',
  'Fog Lionarch: Body': './banners/characters/fog-lionarch-body/F4bswKCP-Fog-Lionarch-Body.webp',
  'Fog Lionarch: Head': './banners/characters/fog-lionarch-head/YJfBqQX-Fog-Lionarch-Head.webp',
  'Smolder': './banners/characters/smolder/QFv1pCd2-Smolder.webp',
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTER THEMES — Curated theme presets based on character banner art & element
// ═══════════════════════════════════════════════════════════════════════════════
const CHARACTER_THEMES = [
  // v3.3 (upcoming — element unconfirmed; falls back to neutral accent)
  { id: 'denia',         name: 'Denia',         element: 'Fusion',  bannerArt: './banners/_shared/DPnPVGVF-denia-banner.jpg',        pos: { header: '50% 31%', nav: '50% 31%', bg: '61% 50%' } },
  { id: 'hiyuki',        name: 'Hiyuki',        element: 'Glacio',  bannerArt: './banners/_shared/Gf7F9h12-hiyuki-banner.jpg',       pos: { header: '50% 57%', nav: '50% 55%', bg: '61% 52%' } },
  // v3.2
  { id: 'lynae',         name: 'Lynae',         element: 'Spectro', bannerArt: './banners/_shared/h1Kwq7Vj-lynae-banner.jpg',        pos: { header: '50% 25%', nav: '50% 25%', bg: '61% 50%' } },
  { id: 'zani',          name: 'Zani',          element: 'Spectro', bannerArt: './banners/_shared/tMVkd4dg-zani-banner.jpg',         pos: { header: '50% 43%', nav: '50% 41%', bg: '51% 50%' } },
  { id: 'phoebe',        name: 'Phoebe',        element: 'Spectro', bannerArt: './banners/_shared/Tq7pFMgp-phoebe-banner.jpg',       pos: { header: '50% 47%', nav: '50% 45%', bg: '59% 50%' } },
  { id: 'sigrika',       name: 'Sigrika',       element: 'Aero',    bannerArt: './banners/_shared/DHJ2YMTM-sigrika-banner.jpg',      pos: { header: '50% 25%', nav: '50% 27%', bg: '64% 50%' } },
  { id: 'qiuyuan',       name: 'Qiuyuan',       element: 'Aero',    bannerArt: './banners/_shared/fd3D6QRx-qiuyuan-banner.jpg',      pos: { header: '50% 19%', nav: '50% 21%', bg: '55% 50%' } },
  // v3.1
  { id: 'luuk-herssen',  name: 'Luuk Herssen',  element: 'Spectro', bannerArt: './banners/_shared/ZzqY6F9R-luuk-banner.jpg',         pos: { header: '50% 52%', nav: '50% 52%', bg: '64% 50%' } },
  { id: 'galbrena',      name: 'Galbrena',      element: 'Fusion',  bannerArt: './banners/_shared/MxSTSBX7-galbrena-banner.jpg',     pos: { header: '50% 31%', nav: '50% 35%', bg: '60% 50%' } },
  { id: 'aemeath',       name: 'Aemeath',       element: 'Fusion',  bannerArt: './banners/_shared/Y4SzJSxL-Aemeath-banner.jpg',      pos: { header: '50% 47%', nav: '50% 46%', bg: '73% 50%' } },
  { id: 'chisa',         name: 'Chisa',         element: 'Havoc',   bannerArt: './banners/_shared/RTZ06knw-chisa-banner.jpg',        pos: { header: '50% 22%', nav: '50% 24%', bg: '68% 50%' } },
  { id: 'lupa',          name: 'Lupa',          element: 'Fusion',  bannerArt: './banners/_shared/9HBRhrjq-lupa-banner.jpg',         pos: { header: '52% 56%', nav: '50% 56%', bg: '62% 50%' } },
  // v3.0
  { id: 'mornye',        name: 'Mornye',        element: 'Fusion',  bannerArt: './banners/_shared/9mGJpYvb-morny-banner.jpg',        pos: { header: '50% 27%', nav: '50% 27%', bg: '72% 50%' } },
  { id: 'augusta',       name: 'Augusta',       element: 'Electro', bannerArt: './banners/_shared/4wbJgQGj-augusta-banner.jpg',      pos: { header: '50% 36%', nav: '50% 35%', bg: '62% 50%' } },
  { id: 'iuno',          name: 'Iuno',          element: 'Aero',    bannerArt: './banners/_shared/DPd6HgjH-iuno-banner.jpg',         pos: { header: '50% 27%', nav: '50% 29%', bg: '66% 50%' } },
  { id: 'cartethyia',    name: 'Cartethyia',    element: 'Aero',    bannerArt: './banners/_shared/Ppt1BXc-carthetya-banner.jpg',     pos: { header: '50% 35%', nav: '50% 37%', bg: '65% 50%' } },
  { id: 'ciaccona',      name: 'Ciaccona',      element: 'Aero',    bannerArt: './banners/_shared/prXLxMyw-ciaconna-banner.jpg',     pos: { header: '50% 39%', nav: '50% 39%', bg: '61% 50%' } },
  // v2.8 / v2.5
  { id: 'phrolova',      name: 'Phrolova',      element: 'Havoc',   bannerArt: './banners/_shared/QvHKLCgt-phrolova-banner.jpg',     pos: { header: '50% 35%', nav: '50% 39%', bg: '53% 50%' } },
  { id: 'cantarella',    name: 'Cantarella',    element: 'Havoc',   bannerArt: './banners/_shared/wZ85YQzF-cantarella-banner.jpg',   pos: { header: '50% 33%', nav: '50% 33%', bg: '63% 50%' } },
  // v2.6
  { id: 'carlotta',      name: 'Carlotta',      element: 'Glacio',  bannerArt: './banners/_shared/67r6NbMf-carlotta-banner.png',     pos: { header: '50% 39%', nav: '50% 41%', bg: '63% 50%' } },
  { id: 'shorekeeper',   name: 'Shorekeeper',   element: 'Spectro', bannerArt: './banners/_shared/cKTnnDWB-shore-keeper-banner.jpg', pos: { header: '50% 23%', nav: '50% 23%', bg: '45% 50%' } },
  // v2.5 / v2.1
  { id: 'brant',         name: 'Brant',         element: 'Fusion',  bannerArt: './banners/_shared/vx8KGHcj-brant-banner.jpg',        pos: { header: '50% 25%', nav: '50% 25%', bg: '65% 50%' } },
  { id: 'roccia',        name: 'Roccia',        element: 'Havoc',   bannerArt: './banners/_shared/YYWVfxt-roccia-banner.jpg',        pos: { header: '50% 39%', nav: '50% 41%', bg: '63% 50%' } },
  // v2.3 anniversary rerun lineup + v1.1/v1.3
  { id: 'jinhsi',        name: 'Jinhsi',        element: 'Spectro', bannerArt: './banners/_shared/7xBSVRbQ-jinhsi-banner.jpg',       pos: { header: '50% 43%', nav: '50% 45%', bg: '49% 50%' } },
  { id: 'changli',       name: 'Changli',       element: 'Fusion',  bannerArt: './banners/_shared/HDZ1LG4R-changli-banner.jpg',      pos: { header: '50% 23%', nav: '50% 21%', bg: '43% 50%' } },
  { id: 'jiyan',         name: 'Jiyan',         element: 'Aero',    bannerArt: './banners/_shared/hFM8STLQ-jiyan-banner.jpg',        pos: { header: '50% 33%', nav: '50% 31%', bg: '65% 50%' } },
  { id: 'yinlin',        name: 'Yinlin',        element: 'Electro', bannerArt: './banners/_shared/Y4SDqwg2-yinlin-banner.jpg',       pos: { header: '50% 39%', nav: '50% 39%', bg: '47% 50%' } },
  { id: 'zhezhi',        name: 'Zhezhi',        element: 'Glacio',  bannerArt: './banners/_shared/XfkKS4dS-zhezhi-banner.jpg',       pos: { header: '50% 31%', nav: '50% 33%', bg: '63% 50%' } },
  { id: 'xiangli-yao',   name: 'Xiangli Yao',   element: 'Electro', bannerArt: './banners/_shared/CphXJs9L-xiangli-yao-banner.jpg',  pos: { header: '50% 19%', nav: '50% 19%', bg: '59% 50%' } },
  // v2.2 / v1.4
  { id: 'camellya',      name: 'Camellya',      element: 'Havoc',   bannerArt: './banners/_shared/20xFP1B1-camellya-banner.png',     pos: { header: '50% 71%', nav: '50% 73%', bg: '49% 50%' } },
  // Standard Resonator pool (Tidal Chorus)
  { id: 'jianxin',       name: 'Jianxin',       element: 'Aero',    bannerArt: './banners/_shared/tPD8Pj0p-jianxin-banner.jpg',      pos: { header: '50% 26%', nav: '50% 26%' } },
  { id: 'calcharo',      name: 'Calcharo',      element: 'Electro', bannerArt: './banners/_shared/sd5QMF3v-calcharo-banner.jpg',     pos: { header: '50% 38%', nav: '50% 38%' } },
  { id: 'encore',        name: 'Encore',        element: 'Fusion',  bannerArt: './banners/_shared/HTF05mrX-encore-banner.jpg' },
  { id: 'lingyang',      name: 'Lingyang',      element: 'Glacio',  bannerArt: './banners/_shared/KzKHgTLN-lingyang-banner.jpg',     pos: { header: '50% 38%', nav: '50% 40%' } },
  { id: 'verina',        name: 'Verina',        element: 'Spectro', bannerArt: './banners/_shared/C3Wd3F32-verina-banner.jpg' },
  { id: 'buling',        name: 'Buling',        element: 'Havoc',   bannerArt: './banners/_shared/XkYLV2gC-buling-banner.jpg',       pos: { header: '50% 8%', nav: '50% 8%' } },
  { id: 'aalto',         name: 'Aalto',         element: 'Aero',    bannerArt: './banners/_shared/Banner_Aalto.jpg',                 pos: { header: '50% 14%', nav: '50% 14%' } },
  { id: 'baizhi',        name: 'Baizhi',        element: 'Glacio',  bannerArt: './banners/_shared/Banner_Baizhi.jpg',                pos: { header: '50% 18%', nav: '50% 20%' } },
  { id: 'chixia',        name: 'Chixia',        element: 'Fusion',  bannerArt: './banners/_shared/Banner_Chixia.jpg',                pos: { header: '50% 20%', nav: '50% 20%' } },
  { id: 'danjin',        name: 'Danjin',        element: 'Havoc',   bannerArt: './banners/_shared/Banner_Danjin.jpg',                pos: { header: '50% 14%', nav: '50% 14%' } },
  { id: 'lumi',          name: 'Lumi',          element: 'Electro', bannerArt: './banners/_shared/Banner_Lumi.jpeg',                 pos: { header: '50% 20%', nav: '50% 20%' } },
  { id: 'mortefi',       name: 'Mortefi',       element: 'Fusion',  bannerArt: './banners/_shared/Banner_Mortefi.jpg',               pos: { header: '50% 14%', nav: '50% 14%' } },
  { id: 'sanhua-std',    name: 'Sanhua',        element: 'Glacio',  bannerArt: './banners/_shared/Banner_Sanhua.jpg',                pos: { header: '50% 14%', nav: '50% 14%' } },
  { id: 'taoqi',         name: 'Taoqi',         element: 'Havoc',   bannerArt: './banners/_shared/Banner_Taoqi.webp',                pos: { header: '50% 14%', nav: '50% 14%' } },
  { id: 'yangyang-std',  name: 'Yangyang',      element: 'Aero',    bannerArt: './banners/_shared/Banner_Yangyang.jpg',              pos: { header: '50% 20%', nav: '50% 20%' } },
  { id: 'youhu',         name: 'Youhu',         element: 'Glacio',  bannerArt: './banners/_shared/Banner_Youhu.jpeg',                pos: { header: '50% 20%', nav: '50% 20%' } },
  { id: 'yuanwu',        name: 'Yuanwu',        element: 'Electro', bannerArt: './banners/_shared/Banner_Yuanwu.webp',               pos: { header: '50% 14%', nav: '50% 14%' } },
  // v3.4-3.5 — no individual header/nav/bg crop tuning yet; using the average pos across every
  // other tuned entry above (avg of 30: header 50%/36%, nav 50%/36%, bg 60%/50%)
  { id: 'lucy',          name: 'Lucy',          element: 'Spectro', bannerArt: './banners/_shared/mC4xmBYY-Lucy-Banner.jpg',        pos: { header: '50% 36%', nav: '50% 36%', bg: '60% 50%' } },
  { id: 'rebecca',       name: 'Rebecca',       element: 'Electro', bannerArt: './banners/_shared/Ps7MZMhB-Rebecca-banner.jpg',      pos: { bg: '60% 50%' } },
  { id: 'lucilla',       name: 'Lucilla',       element: 'Glacio',  bannerArt: './banners/_shared/zT91s0wt-Lucilla-banner.jpg',      pos: { header: '50% 36%', nav: '50% 36%', bg: '60% 50%' } },
  { id: 'suisui',        name: 'Suisui',        element: 'Glacio',  bannerArt: './banners/_shared/wFwmhvLP-Suisui-banner.jpg',       pos: { header: '50% 36%', nav: '50% 36%', bg: '60% 50%' } },
  { id: 'yangyang-xuanling', name: 'Yangyang: Xuanling', element: 'Havoc', bannerArt: './banners/_shared/QFHC5Y4h-Yangyang-Xuanling-banner.jpg', pos: { header: '50% 36%', nav: '50% 36%', bg: '60% 50%' } },
];
// Sorted 5★ before 4★, most-recently-released first within each rarity tier — reusing
// CHARACTER_DATA for rarity and RELEASE_ORDER (characters.js) for release order, instead
// of relying on manual placement above.
CHARACTER_THEMES.sort((a, b) => {
  const rarityDiff = (CHARACTER_DATA[b.name]?.rarity || 0) - (CHARACTER_DATA[a.name]?.rarity || 0);
  if (rarityDiff !== 0) return rarityDiff;
  return RELEASE_ORDER.indexOf(b.name) - RELEASE_ORDER.indexOf(a.name);
});
// Qingxiao IS released and has real CHARACTER_DATA/RELEASE_ORDER, but no
// individual splash art yet (see BANNER_HISTORY v3.6-p1's own comment) —
// just the shared convene banner she debuted on alongside Denia — so she's
// pinned here too rather than joining the sorted list above with a banner
// that isn't really hers alone.
CHARACTER_THEMES.unshift({ id: 'qingxiao', name: 'Qingxiao', element: 'Aero', bannerArt: './banners/_shared/8nvgqZKC-e7478-17840855867105-1920.jpg', pos: { header: '50% 31%', nav: '50% 31%', bg: '60% 50%' } });
// Hsin isn't released yet — no CHARACTER_DATA/RELEASE_ORDER entry to sort her
// by rarity/release order like every other theme above (and she doesn't get
// a fabricated one here just to satisfy that sort — CHARACTER_DATA feeds
// real gameplay calculators elsewhere in the app). Unshifted after Qingxiao
// so she lands in front of her, per explicit request.
CHARACTER_THEMES.unshift({ id: 'hsin', name: 'Hsin', bannerArt: './characters/hsin/Hsin_Banner.jpg', pos: { header: '50% 29%', nav: '50% 29%', bg: '66% 50%' } });
// Suoming — also unreleased, same no-CHARACTER_DATA situation as Hsin.
// Unshifted last so she lands in front of Hsin, per explicit request.
CHARACTER_THEMES.unshift({ id: 'suoming', name: 'Suoming', bannerArt: './characters/suoming/Suoming_Banner.webp', pos: { header: '50% 29%', nav: '50% 31%', bg: '50% 50%' } });

// ═══════════════════════════════════════════════════════════════════════════════
// WEAPON THEMES — Real "Featured Weapon Convene" splash art per 5★ weapon
// (mirrors CHARACTER_THEMES; no per-asset crop `pos` supplied yet — add if a
// consumer needs one, following the same header/nav/bg pattern as CHARACTER_THEMES)
// ═══════════════════════════════════════════════════════════════════════════════
const WEAPON_THEMES = [
  { id: 'everbright-polestar',   name: 'Everbright Polestar',   bannerArt: './banners/_shared/cSVxJrz8-everbright-polestar-banner.jpg' },
  { id: 'ages-of-harvest',       name: 'Ages of Harvest',       bannerArt: './banners/_shared/DD24rw6P-ages-of-harvest-banner.jpg' },
  { id: 'azure-oath',            name: 'Azure Oath',            bannerArt: './banners/_shared/WWFdfpd2-Azure-Oath-Banner.webp' }, // Xuanling
  { id: 'blazing-brilliance',    name: 'Blazing Brilliance',    bannerArt: './banners/_shared/fby4FQc-blazing-brilliance-banner.jpg' },
  { id: 'blazing-justice',       name: 'Blazing Justice',       bannerArt: './banners/_shared/rRqtbgtz-blazing-justice-banner.jpg' },
  { id: 'daybreakers-spine',     name: "Daybreaker's Spine",    bannerArt: './banners/_shared/8gzzFgGx-daybreaker-s-spine-banner.jpg' },
  { id: 'defiers-thorn',         name: "Defier's Thorn",        bannerArt: './banners/_shared/LzNywkKX-defier-s-thorn-banner.jpg' },
  { id: 'emerald-sentence',      name: 'Emerald Sentence',      bannerArt: './banners/_shared/k2dDWSg3-emerald-sentence-banner.jpg' },
  { id: 'firstlights-herald',    name: "Firstlight's Herald",   bannerArt: './banners/_shared/G3kfLMk7-First-s-Light-herald-Banner.jpg' }, // Suisui
  { id: 'forged-dwarf-star',     name: 'Forged Dwarf Star',     bannerArt: './banners/_shared/Gv3c41jD-Forged-Dwarf-Star-Banner.webp' }, // Denia
  { id: 'freeze-frame',          name: 'Freeze Frame',          bannerArt: './banners/_shared/5hWpCRrv-Freeze-Frame-Banner.jpg' }, // Lucilla
  { id: 'frostburn',             name: 'Frostburn',             bannerArt: './banners/_shared/rRh3h5zR-Frostburn-Banner.webp' }, // Hiyuki
  { id: 'kumokiri',              name: 'Kumokiri',              bannerArt: './banners/_shared/Dgs0qXnV-kumokiri-banner.jpg' },
  { id: 'lethean-elegy',         name: 'Lethean Elegy',         bannerArt: './banners/_shared/MyPXz6m4-lethean-elegy-banner.jpg' },
  { id: 'luminous-hymn',         name: 'Luminous Hymn',         bannerArt: './banners/_shared/qL32WZqz-luminous-hymn-banner.jpg' },
  { id: 'lux-umbra',             name: 'Lux & Umbra',           bannerArt: './banners/_shared/cSH6dB9R-lux-umbra-banner.jpg' },
  { id: 'moongazers-sigil',      name: "Moongazer's Sigil",     bannerArt: './banners/_shared/5Xf3j5w5-moongazer-s-sigil-banner.jpg' },
  { id: 'red-spring',            name: 'Red Spring',            bannerArt: './banners/_shared/VYykPdpg-red-spring-banner.jpg' },
  { id: 'rime-draped-sprouts',   name: 'Rime-Draped Sprouts',   bannerArt: './banners/_shared/xqtPLNJF-rime-draped-sprouts-banner.jpg' },
  { id: 'skull-thrasher',        name: 'Skull Thrasher',        bannerArt: './banners/_shared/9m8z7x9R-Skull-Thrasher-Banner.webp' }, // Rebecca
  { id: 'solsworn-ciphers',      name: 'Solsworn Ciphers',      bannerArt: './banners/_shared/N2ZLZ07W-solsworn-ciphers-banner.jpg' },
  { id: 'spectral-trigger',      name: 'Spectral Trigger',      bannerArt: './banners/_shared/yF2D9tKS-Spectral-trigger-Banner.png' }, // Lucy
  { id: 'spectrum-blaster',      name: 'Spectrum Blaster',      bannerArt: './banners/_shared/tMyRpwW9-spectrum-blaster-banner.jpg' },
  { id: 'starfield-calibrator',  name: 'Starfield Calibrator',  bannerArt: './banners/_shared/N6qwBGnv-starfield-calibrator-banner.jpg' },
  { id: 'stellar-symphony',      name: 'Stellar Symphony',      bannerArt: './banners/_shared/DPBF1H0Q-stellar-symphony-banner.jpg' },
  { id: 'stringmaster',          name: 'Stringmaster',          bannerArt: './banners/_shared/zhnR2MRT-stringmaster-banner.jpg' },
  { id: 'the-last-dance',        name: 'The Last Dance',        bannerArt: './banners/_shared/k20XT27x-the-last-dance-banner.jpg' },
  { id: 'thunderflare-dominion', name: 'Thunderflare Dominion', bannerArt: './banners/_shared/8QxTXtL-thunderflare-dominion-banner.jpg' },
  { id: 'tragicomedy',           name: 'Tragicomedy',           bannerArt: './banners/_shared/xKwWBBBZ-tragicomedy-banner.jpg' },
  { id: 'unflickering-valor',    name: 'Unflickering Valor',    bannerArt: './banners/_shared/5XP6J2XM-unflickering-valor-banner.jpg' },
  { id: 'verdant-summit',        name: 'Verdant Summit',        bannerArt: './banners/_shared/Ngt5641y-verdant-summit-banner.jpg' },
  { id: 'veritys-handle',        name: "Verity's Handle",       bannerArt: './banners/_shared/S4cvnxkq-verity-s-handle-banner.jpg' },
  { id: 'whispers-of-sirens',    name: 'Whispers of Sirens',    bannerArt: './banners/_shared/23XqBXny-whispers-of-sirens-banner.jpg' },
  { id: 'wildfire-mark',         name: 'Wildfire Mark',         bannerArt: './banners/_shared/yBgZw4jZ-wildfire-mark-banner.jpg' },
  { id: 'woodland-aria',         name: 'Woodland Aria',         bannerArt: './banners/_shared/JWCTQ0CW-woodland-aria-banner.jpg' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// VERSION SPLASH SCREENS — Official game version key art
// ═══════════════════════════════════════════════════════════════════════════════
const VERSION_SPLASH_SCREENS = [
  // All 6 Live2D-source links (v3.4, v3.4 Cyberpunk, v3.6 via Google Drive; v3.5, v2.4, v2.1 via
  // X/Twitter) turned out to be video content, not stills — the Drive ones were outright .mp4
  // files, and the X ones only *looked* like images because X's bot-facing og:image/twitter:card
  // meta serves a static video-thumbnail frame even for video posts (twitter:card stayed
  // "summary_large_image" instead of "player", which was the false signal). None of the Live2D
  // links yielded real official splash art — only the Classic-style links below did.
  { id: 'v3.6', version: '3.6', name: 'Version 3.6 (Classic)', art: './banner-history/v3.6.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '46% 50%' } },
  { id: 'v3.5', version: '3.5', name: 'Version 3.5 (Classic)', art: './banner-history/v3.5.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '46% 50%' } },
  { id: 'v3.4-cyberpunk', version: '3.4', name: 'Version 3.4 Cyberpunk (Classic)', art: './banner-history/v3.4-cyberpunk.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '46% 50%' } },
  { id: 'v3.4', version: '3.4', name: 'Version 3.4 (Classic)', art: './banner-history/v3.4.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '46% 50%' } },
  { id: 'v3.3', version: '3.3', name: 'Reverbs From The End of Galaxies',  art: './banner-history/v3.3.jpg',                                 pos: { header: '50% 32%', nav: '50% 32%', bg: '52% 50%' } },
  { id: 'v3.2', version: '3.2', name: 'Resolution to Illuminate the Shadows', art: './banner-history/v3.2.jpg',                        pos: { header: '50% 26%', nav: '50% 22%', bg: '52% 50%' } },
  { id: 'v3.1', version: '3.1', name: 'For You Who Walk in Snow',              art: './banner-history/v3.1.jpg',                                     pos: { header: '50% 22%', nav: '50% 23%', bg: '50% 50%' } },
  { id: 'v3.0', version: '3.0', name: 'We Who See The Stars',                  art: './banner-history/v3.0.jpg',                                         pos: { header: '50% 25%', nav: '50% 21%', bg: '24% 50%' } },
  { id: 'v2.8', version: '2.8', name: 'To the City Set in Amber',              art: './banner-history/v2.8.jpg',                                      pos: { header: '50% 20%', nav: '50% 22%', bg: '52% 50%' } },
  { id: 'v2.7', version: '2.7', name: 'Dawn Breaks on Dark Tides',             art: './banner-history/v2.7.jpg',                                    pos: { header: '50% 35%', nav: '50% 33%', bg: '50% 50%' } },
  { id: 'v2.6', version: '2.6', name: "By Sun's Scourge, By Moon's Revelation", art: './banner-history/v2.6.jpg',              pos: { header: '50% 18%', nav: '50% 18%', bg: '50% 50%' } },
  { id: 'v2.5', version: '2.5', name: 'Unfading Melody of Life',               art: './banner-history/v2.5.jpg',                                      pos: { header: '50% 30%', nav: '50% 32%', bg: '38% 50%' } },
  { id: 'v2.4', version: '2.4', name: 'Lightly We Toss the Crown',             art: './banner-history/v2.4.jpg',                                    pos: { header: '50% 26%', nav: '50% 25%', bg: '52% 50%' } },
  { id: 'v2.3', version: '2.3', name: 'Fiery Arpeggio of Summer Reunion',      art: './banner-history/v2.3.jpg',                             pos: { header: '50% 34%', nav: '50% 32%', bg: '26% 50%' } },
  { id: 'v2.2', version: '2.2', name: 'Tangled Truths in the Inverted Tower',  art: './banner-history/v2.2.jpg',                         pos: { header: '50% 28%', nav: '50% 26%', bg: '62% 50%' } },
  { id: 'v2.1', version: '2.1', name: 'Waves Sing and the Cerulean Bird Calls', art: './banner-history/v2.1.jpg',                       pos: { header: '50% 10%', nav: '50% 12%', bg: '78% 50%' } },
  { id: 'v2.0', version: '2.0', name: 'All Silent Souls Can Sing',             art: './banner-history/v2.0.jpg',                                    pos: { header: '50% 52%', nav: '50% 49%', bg: '36% 50%' } },
  { id: 'v1.4', version: '1.4', name: 'When the Night Knocks',                 art: './banner-history/v1.4.jpg',                                         pos: { header: '50% 66%', nav: '50% 70%', bg: '46% 50%' } },
  { id: 'v1.3', version: '1.3', name: "To the Shore's End",                    art: './banner-history/v1.3.jpg',                                       pos: { header: '50% 16%', nav: '50% 16%', bg: '16% 50%' } },
  { id: 'v1.2', version: '1.2', name: 'In the Turquoise Moonglow',             art: './banner-history/v1.2.jpg',                                    pos: { header: '50% 47%', nav: '50% 51%', bg: '44% 50%' } },
  { id: 'v1.1', version: '1.1', name: 'Thaw of Eons',                          art: './banner-history/v1.1.jpg',                                                 pos: { header: '50% 26%', nav: '50% 29%', bg: '50% 50%' } },
  { id: 'v1.0', version: '1.0', name: 'Waking of a World',                     art: './banner-history/v1.0.jpg',                                            pos: { header: '50% 32%', nav: '50% 34%', bg: '50% 50%' } },
];

// ═══════════════════════════════════════════════════════════════════════════════
// OTHER BACKGROUNDS — Miscellaneous promotional art
// ═══════════════════════════════════════════════════════════════════════════════
const OTHER_BACKGROUNDS = [
  { id: 'dream-team', name: 'The Dream Team', art: './banner-history/dream-team.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '40% 50%' } },
  { id: 'utterance-of-marvels', name: 'Utterance of Marvels', art: './banner-history/utterance-of-marvels.jpg', pos: { header: '50% 28%', nav: '50% 26%', bg: '58% 50%' } },
  { id: 'reverberation', name: 'Reverberation', art: './banner-history/reverberation.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'solaris-3', name: 'Solaris 3', art: './banner-history/solaris-3.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'tacet-discord', name: 'Tacet Discord', art: './banner-history/tacet-discord.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'tacet-field', name: 'Tacet Field', art: './banner-history/tacet-field.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'three-two-one-cheese', name: 'Three Two One Cheese', art: './banner-history/three-two-one-cheese.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'here-come-the-woolies', name: 'Here Come the Woolies', art: './banner-history/here-come-the-woolies.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'when-the-night-knocks', name: 'When the Night Knocks', art: './Background/When-the-Night-Knocks-Background.jpeg', pos: { header: '50% 55%', nav: '50% 57%', bg: '40% 50%' } },
  { id: '1-2-moon-chasing-festival', name: '1.2 Moon Chasing Festival @mafuin_da', art: './banner-history/1-2-moon-chasing-festival.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: '1st-anniv-festival-akihabara', name: '1st Anniv Festival Akihabara', art: './banner-history/1st-anniv-festival-akihabara.jpg', pos: { header: '50% 10%', nav: '50% 12%', bg: '50% 50%' } },
  { id: '2nd-anniv', name: '2nd Anniv', art: './banner-history/2nd-anniv.jpg', pos: { header: '50% 44%', nav: '50% 40%', bg: '50% 50%' } },
  { id: '3-3-star-bouncing-event', name: '3.3 Star Bouncing Event', art: './banner-history/3-3-star-bouncing-event.jpg', pos: { header: '50% 34%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'augusta-iuno-mooncake-collab', name: 'Augusta Iuno Mooncake Collab', art: './banner-history/augusta-iuno-mooncake-collab.jpg', pos: { header: '50% 16%', nav: '50% 16%', bg: '50% 50%' } },
  { id: 'augusta-iuno', name: 'Augusta Iuno', art: './banner-history/augusta-iuno.jpg', pos: { header: '50% 30%', nav: '50% 74%', bg: '50% 50%' } },
  { id: 'brant-phoebe-rover', name: 'Brant Phoebe Rover', art: './banner-history/brant-phoebe-rover.jpg', pos: { header: '50% 50%', nav: '50% 50%', bg: '50% 50%' } },
  { id: 'brant-roccia-liyuliyuzhou', name: 'Brant Roccia @liyuliyuzhou', art: './banner-history/brant-roccia-liyuliyuzhou.jpg', pos: { header: '50% 20%', nav: '50% 26%', bg: '50% 50%' } },
  { id: 'brant-roccia-chibi', name: 'Brant Roccia Chibi', art: './banner-history/brant-roccia-chibi.jpg', pos: { header: '50% 52%', nav: '50% 46%', bg: '50% 50%' } },
  { id: 'brant-roccia-sweets-paradise', name: 'Brant Roccia Sweets Paradise', art: './banner-history/brant-roccia-sweets-paradise.jpg', pos: { header: '50% 20%', nav: '50% 20%', bg: '50% 50%' } },
  { id: 'camellya-shorekeeper-christmas', name: 'Camellya Shorekeeper Christmas', art: './banner-history/camellya-shorekeeper-christmas.jpg', pos: { header: '50% 44%', nav: '50% 48%', bg: '50% 50%' } },
  { id: 'cantarella-shorekeeper-korean-collab', name: 'Cantarella Shorekeeper Korean Collab', art: './banner-history/cantarella-shorekeeper-korean-collab.jpg', pos: { header: '50% 20%', nav: '50% 34%', bg: '50% 50%' } },
  { id: 'carlotta-changli-chisa-lynae-beach', name: 'Carlotta Changli Chisa Lynae Beach', art: './banner-history/carlotta-changli-chisa-lynae-beach.jpg', pos: { header: '50% 28%', nav: '50% 28%', bg: '50% 50%' } },
  { id: 'carlotta-roccia-brant-phoebe-zani-mafuinda', name: 'Carlotta Roccia Brant Phoebe Zani @mafuin_da', art: './banner-history/carlotta-roccia-brant-phoebe-zani-mafuinda.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'carlotta-zani-montelli-family', name: 'Carlotta Zani Montelli Family', art: './banner-history/carlotta-zani-montelli-family.jpg', pos: { header: '50% 8%', nav: '50% 6%', bg: '50% 50%' } },
  { id: 'chisa-galbrena-coco-collab', name: 'Chisa Galbrena Coco Collab', art: './banner-history/chisa-galbrena-coco-collab.jpg', pos: { header: '50% 20%', nav: '50% 22%', bg: '50% 50%' } },
  { id: 'denia-hiyuki-mrover-fireworks', name: 'Denia Hiyuki MRover Fireworks', art: './banner-history/denia-hiyuki-mrover-fireworks.jpg', pos: { header: '50% 22%', nav: '50% 24%', bg: '50% 50%' } },
  { id: 'echoes-of-reciprocal-tides-secretfj520', name: 'Echoes of Reciprocal Tides @SecretFj520', art: './banner-history/echoes-of-reciprocal-tides-secretfj520.jpg', pos: { header: '50% 8%', nav: '50% 16%', bg: '50% 50%' } },
  { id: 'echoes-of-the-stars-daymera0', name: 'Echoes of the Stars @daymera_0', art: './banner-history/echoes-of-the-stars-daymera0.jpg', pos: { header: '50% 20%', nav: '50% 22%', bg: '50% 50%' } },
  { id: 'encore-aalto-evolution', name: 'Encore Aalto @E_Volution_', art: './banner-history/encore-aalto-evolution.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'jinhsi-changli-sanhua-summer', name: 'Jinhsi Changli Sanhua Summer', art: './banner-history/jinhsi-changli-sanhua-summer.jpg', pos: { header: '50% 48%', nav: '50% 48%', bg: '50% 50%' } },
  { id: 'jinhsi-sanhua-changli', name: 'Jinhsi Sanhua Changli', art: './banner-history/jinhsi-sanhua-changli.jpg', pos: { header: '50% 16%', nav: '50% 14%', bg: '50% 50%' } },
  { id: 'jiyan-yinlin-encore-yangyang-summer-tunmengtun', name: 'Jiyan Yinlin Encore Yangyang Summer @Tunmengtun', art: './banner-history/jiyan-yinlin-encore-yangyang-summer-tunmengtun.jpg', pos: { header: '50% 26%', nav: '50% 26%', bg: '50% 50%' } },
  { id: 'kirabase-collab', name: 'Kirabase Collab', art: './banner-history/kirabase-collab.jpg', pos: { header: '50% 30%', nav: '50% 30%', bg: '50% 50%' } },
  { id: 'kurofest-concert-tunmengtun', name: 'Kurofest Concert @Tunmengtun', art: './banner-history/kurofest-concert-tunmengtun.jpg', pos: { header: '50% 32%', nav: '50% 34%', bg: '50% 50%' } },
  { id: 'log-3-0', name: 'Log 3.0', art: './banner-history/log-3-0.jpg', pos: { header: '50% 54%', nav: '50% 48%', bg: '50% 50%' } },
  { id: 'log-2-0', name: 'Log 2.0', art: './banner-history/log-2-0.jpg', pos: { header: '50% 36%', nav: '50% 30%', bg: '50% 50%' } },
];

// Animated (video) backgrounds — self-hosted under /animated-bg/. `art` is
// the mp4, `poster` is an extracted first-frame JPG used as picker thumbnail
// and <video poster>.
const ANIMATED_BACKGROUNDS = [
  {
    // Same version tier as 'v2-0' below (user-supplied, 2026-08-27) — placed
    // first since it's the earlier teaser-style "Log" screen, not the story
    // splash. pos is this array's own average across its other 18 entries
    // (header ~29%, nav ~31%) — a neutral starting framing, not hand-tuned
    // against this clip's real crop yet.
    id: 'v2-0-log',
    version: 2.0,
    name: 'v2.0 Log',
    art: './animated-bg/2.0-Log-Animated.mp4',
    poster: './Background/2.0-Log-Background.jpg',
    pos: { header: '50% 29%', nav: '50% 31%', bg: '50% 50%' },
  },
  {
    id: 'v2-0',
    version: 2.0,
    name: 'v2.0 All Silent Souls Can Sing',
    art: './animated-bg/2.0-All-Silent-Souls-Can-Sing-Animated.mp4',
    poster: './Background/2.0-All-Silent-Souls-Can-Sing-Background.jpg',
    pos: { header: '50% 50%', nav: '50% 54%', bg: '50% 50%' },
  },
  {
    id: 'v2-2',
    version: 2.2,
    name: 'v2.2 Tangled Truth in Inverted Tower',
    art: './animated-bg/2.2-Tangled-Truth-In-Inverted-Tower-Animated.mp4',
    poster: './Background/2.2-Tangled-Truths-in-the-Inverted-Tower-Background.jpg',
    pos: { header: '50% 26%', nav: '50% 26%', bg: '50% 50%' },
  },
  {
    id: 'v2-5',
    version: 2.5,
    name: 'v2.5 Unfading Melody of Life',
    art: './animated-bg/2.5-Unfadind-Melody-Of-Life-Animated.mp4',
    poster: './Background/2.5-Unfading-Melody-of-Life-Background.jpg',
    pos: { header: '50% 32%', nav: '50% 34%', bg: '50% 50%' },
  },
  {
    id: 'v2-6',
    version: 2.6,
    name: "v2.6 By Sun's Scourge, By Moon's Revelation",
    art: "./animated-bg/2.6-By-Sun's-Scourge,ByMoon's-Revelation-Animated.mp4",
    poster: './Background/2.6-By-Suns-Scourge-By-Moons-Revelation-Background.jpg',
    pos: { header: '50% 22%', nav: '50% 26%', bg: '50% 50%' },
  },
  {
    id: 'v2-7',
    version: 2.7,
    name: 'v2.7 Dawn Breaks on Dark Tides',
    art: './animated-bg/2.7-Dawn-Breaks-On-Dark-Tides-Animated.mp4',
    poster: './Background/2.7-Dawn-Breaks-on-Dark-Tides-Background.jpg',
    pos: { header: '50% 34%', nav: '50% 34%', bg: '50% 50%' },
  },
  {
    id: 'v2-8',
    version: 2.8,
    name: 'v2.8 To the City Set in Amber',
    art: './animated-bg/2.8-To-The-City-Set-In-Amber-Animated.mp4',
    poster: './Background/2.8-To-the-City-Set-in-Amber-Background.jpg',
    pos: { header: '50% 20%', nav: '50% 22%', bg: '50% 50%' },
  },
  {
    id: 'v3-0',
    version: 3.0,
    name: 'v3.0 We Who See the Stars',
    art: './animated-bg/3.0-We-Who-See-The-Stars-Animated.mp4',
    poster: './Background/3.0-We-Who-See-The-Stars-Background.jpg',
    pos: { header: '50% 20%', nav: '50% 20%', bg: '50% 50%' },
  },
  {
    id: 'v3-1',
    version: 3.1,
    name: 'v3.1 For You Who Walk in the Snow',
    art: './animated-bg/3.1-For-You-Who-Walk-In-The-Snow-Animated.mp4',
    poster: './Background/3.1-For-You-Who-Walk-in-Snow-Background.jpg',
    pos: { header: '50% 22%', nav: '50% 28%', bg: '50% 50%' },
  },
  {
    id: 'v3-2',
    version: 3.2,
    name: 'v3.2',
    art: './animated-bg/3.2-animated.mp4',
    poster: './Background/3.2-Resolution-to-Illuminate-the-Shadows-Background.jpg',
    pos: { header: '50% 18%', nav: '50% 24%', bg: '56% 50%' },
  },
  {
    id: 'v3-3',
    version: 3.3,
    name: 'v3.3',
    art: './animated-bg/3.3-animated.mp4',
    poster: './Background/3.3-Reverbs-From-The-End-of-Galaxies-Background.jpg',
    pos: { header: '50% 24%', nav: '50% 26%', bg: '54% 50%' },
  },
  {
    id: '2nd-anniversary',
    version: 3.2, // estimated: 1-year anniversary was the v2.3 anniversary rerun (~Apr 2025), so 2nd falls ~Apr 2026 = v3.2 window
    name: '2nd Anniversary',
    art: './animated-bg/2nd-anniversary-animated.mp4',
    poster: './Background/2nd-Anniversary-Background.jpg',
    pos: { header: '50% 44%', nav: '50% 44%', bg: '60% 50%' },
  },
  {
    id: 'startorch-academy',
    version: 3.1, // estimated: Aemeath's introduction/Startorch Academy tie-in, released v3.1
    name: 'Startorch Academy',
    art: './animated-bg/startorch-academy-animated.mp4',
    poster: './Background/Startorch-Academy-Background.jpg',
    pos: { header: '50% 56%', nav: '50% 50%', bg: '50% 50%' },
  },
  // Live2D-style version-update wallpapers (fan-cleaned 4K renders — Gdrive/@KiriyumeBun on X).
  // These are the actual animated MP4s the earlier "Live2D" splash-art request turned out to be;
  // wired here as animated backgrounds instead of static VERSION_SPLASH_SCREENS entries.
  {
    id: 'v3-6-live2d',
    version: 3.6,
    name: 'v3.6 Live2D',
    art: './animated-bg/3.6-Lamplight-in-Mirage-Swords-Resolve-in-Heart-Live2D.mp4',
    poster: './Background/3.6-Lamplight-in-Mirage-Swords-Resolve-in-Heart-Background.jpg',
    pos: { header: '50% 30%', nav: '50% 32%', bg: '52% 50%' },
  },
  {
    id: 'v3-5-live2d',
    version: 3.5,
    name: 'v3.5 Live2D',
    art: './animated-bg/3.5-Blade-of-Past-Resounds-Lingering-Dream-Hymns-Live2D.mp4',
    poster: './Background/3.5-Blade-of-Past-Resounds-Lingering-Dream-Hymns-Background.jpg',
    pos: { header: '50% 22%', nav: '50% 24%', bg: '52% 50%' },
  },
  {
    id: 'v3-4-live2d',
    version: 3.4,
    name: 'v3.4 Live2D',
    art: './animated-bg/3.4-The-Dream-Not-Dreamed-Live2D.mp4',
    poster: './Background/3.4-The-Dream-Not-Dreamed-Background.jpg',
    pos: { header: '50% 46%', nav: '50% 50%', bg: '52% 50%' },
  },
  {
    id: 'v3-4-cyberpunk-live2d',
    version: 3.4,
    name: 'v3.4 Cyberpunk Live2D',
    art: './animated-bg/3.4-The-Dream-Not-Dreamed-Cyberpunk-Live2D.mp4',
    poster: './Background/3.4-The-Dream-Not-Dreamed-Cyberpunk-Background.jpg',
    pos: { header: '50% 24%', nav: '50% 24%', bg: '52% 50%' },
  },
  {
    id: 'v2-4-live2d',
    version: 2.4,
    name: 'v2.4 Live2D',
    art: './animated-bg/2.4-Lightly-We-Toss-the-Crown-Live2D.mp4',
    poster: './Background/2.4-Lightly-We-Toss-the-Crown-Background.jpg',
    pos: { header: '50% 24%', nav: '50% 26%', bg: '52% 50%' },
  },
  {
    id: 'v2-1-live2d',
    version: 2.1,
    name: 'v2.1 Live2D',
    art: './animated-bg/2.1-Waves-Sing-and-the-Cerulean-Bird-Calls-Live2D.mp4',
    poster: './Background/2.1-Waves-Sing-and-the-Cerulean-Bird-Calls-Background.jpg',
    pos: { header: '50% 8%', nav: '50% 12%', bg: '52% 50%' },
  },
];
// Sorted most-recently-released first
ANIMATED_BACKGROUNDS.sort((a, b) => b.version - a.version);

// ══════════════════════════════════════════════════════════════════════════════
// CONVENE ANIMATIONS — per-character "featured convene" showcase video,
// keyed by character name. 2026-08-27: the ▶ button on a character's own
// gacha banner card (BannerCard.jsx, previously always opening the generic
// full-body Spine viewer via FullSpineViewerButton) now plays this video
// instead, directly in place within the banner card itself (not a separate
// modal), when one exists for that character. Falls back to the Spine
// viewer for every character not listed here yet — this starts with just
// Qingxiao (user-supplied clip) and is meant to be filled in per-character
// over time, not a full replacement on day one.
// ══════════════════════════════════════════════════════════════════════════════
const CONVENE_ANIMATIONS = {
  Qingxiao: './convene-animations/qingxiao-convene.mp4',
  Denia: './convene-animations/denia-convene.mp4',
  Aalto: './convene-animations/aalto-convene.mp4',
  Aemeath: './convene-animations/aemeath-convene.mp4',
  Augusta: './convene-animations/augusta-convene.mp4',
  Baizhi: './convene-animations/baizhi-convene.mp4',
  Buling: './convene-animations/buling-convene.mp4',
  Calcharo: './convene-animations/calcharo-convene.mp4',
  Camellya: './convene-animations/camellya-convene.mp4',
  Cantarella: './convene-animations/cantarella-convene.mp4',
  Carlotta: './convene-animations/carlotta-convene.mp4',
  Cartethyia: './convene-animations/cartethyia-convene.mp4',
  Changli: './convene-animations/changli-convene.mp4',
  Chisa: './convene-animations/chisa-convene.mp4',
  Chixia: './convene-animations/chixia-convene.mp4',
  Ciaccona: './convene-animations/ciaccona-convene.mp4',
  Danjin: './convene-animations/danjin-convene.mp4',
  Encore: './convene-animations/encore-convene.mp4',
  Galbrena: './convene-animations/galbrena-convene.mp4',
  Hiyuki: './convene-animations/hiyuki-convene.mp4',
  Iuno: './convene-animations/iuno-convene.mp4',
  Jianxin: './convene-animations/jianxin-convene.mp4',
  Jingran: './convene-animations/jingran-convene.mp4',
  Jinhsi: './convene-animations/jinhsi-convene.mp4',
  Jiyan: './convene-animations/jiyan-convene.mp4',
  Lingyang: './convene-animations/lingyang-convene.mp4',
  Lucilla: './convene-animations/lucilla-convene.mp4',
  Lupa: './convene-animations/lupa-convene.mp4',
  'Luuk Herssen': './convene-animations/luuk-herssen-convene.mp4',
  Lynae: './convene-animations/lynae-convene.mp4',
  Mornye: './convene-animations/mornye-convene.mp4',
  Mortefi: './convene-animations/mortefi-convene.mp4',
  Phoebe: './convene-animations/phoebe-convene.mp4',
  Phrolova: './convene-animations/phrolova-convene.mp4',
  Qiuyuan: './convene-animations/qiuyuan-convene.mp4',
  Rebecca: './convene-animations/rebecca-convene.mp4',
  Roccia: './convene-animations/roccia-convene.mp4',
  Shorekeeper: './convene-animations/shorekeeper-convene.mp4',
  Sigrika: './convene-animations/sigrika-convene.mp4',
  Suisui: './convene-animations/suisui-convene.mp4',
  Taoqi: './convene-animations/taoqi-convene.mp4',
  Verina: './convene-animations/verina-convene.mp4',
  Lucy: './convene-animations/lucy-convene.mp4',
  'Xiangli Yao': './convene-animations/xiangli-yao-convene.mp4',
  Yangyang: './convene-animations/yangyang-convene.mp4',
  'Yangyang: Xuanling': './convene-animations/yangyang-xuanling-convene.mp4',
  Yinlin: './convene-animations/yinlin-convene.mp4',
  Youhu: './convene-animations/youhu-convene.mp4',
  Yuanwu: './convene-animations/yuanwu-convene.mp4',
  Zani: './convene-animations/zani-convene.mp4',
  Zhezhi: './convene-animations/zhezhi-convene.mp4',
  // One generic Rover clip (not element-specific) shared across all four
  // playable elements — CHARACTER_DATA has no plain "Rover" key, only the
  // four "Rover: X" element variants.
  'Rover: Spectro': './convene-animations/rover-convene.mp4',
  'Rover: Havoc': './convene-animations/rover-convene.mp4',
  'Rover: Aero': './convene-animations/rover-convene.mp4',
  'Rover: Electro': './convene-animations/rover-convene.mp4',
};
const getConveneAnimation = (name) => CONVENE_ANIMATIONS[name] || null;

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
  MOST_PULLED_STATS,
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
  CONVENE_ANIMATIONS,
  getConveneAnimation,
  getCharacterBannerArt,
  preloadBannerHistoryArt,
};
