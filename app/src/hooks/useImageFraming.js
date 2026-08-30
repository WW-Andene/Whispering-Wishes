// ═══════════════════════════════════════════════════════════════════════════════
// useImageFraming - Custom hook for image framing/cropping state management
// ═══════════════════════════════════════════════════════════════════════════════
//
// Extracted from App.jsx - manages position/zoom for character images in
// collection, team cards, and info panels. Persists to localStorage.

import { useState, useEffect, useCallback } from 'react';
import { sanitizeStateObj } from '../core/storage.js';
import { IMAGE_FRAMING_KEY } from '../shared/constants/appConstants.js';

const MIN_ZOOM = 100;
const MAX_ZOOM = 300;

// Default framing values per character per context (collection-, team-, info-)
// Exported so widgetSync.js can bake a character's own 'collection-<name>' crop into the
// pull bubble's native banner-picker icons (PullBubbleService.java) — those need a
// face-centered crop the same way the in-app Collection grid does, but native code has no
// access to this file's own state/context, only whatever gets synced into SharedPreferences.
export const DEFAULT_IMAGE_FRAMING = Object.freeze({
  // Collection framing
  'collection-Jiyan': { x: 8, y: -26, zoom: 260 },
  'collection-Calcharo': { x: -2, y: -28, zoom: 230 },
  'collection-Encore': { x: -2, y: -20, zoom: 160 },
  'collection-Jianxin': { x: 2, y: -24, zoom: 210 },
  'collection-Lingyang': { x: -2, y: -18, zoom: 160 },
  'collection-Verina': { x: 0, y: -14, zoom: 250 },
  'collection-Yinlin': { x: 2, y: -26, zoom: 210 },
  'collection-Changli': { x: 6, y: -26, zoom: 210 },
  'collection-Jinhsi': { x: 0, y: -28, zoom: 200 },
  'collection-Shorekeeper': { x: 12, y: -22, zoom: 220 },
  'collection-Camellya': { x: 0, y: -28, zoom: 200 },
  'collection-Xiangli Yao': { x: -4, y: -16, zoom: 300 },
  'collection-Zhezhi': { x: -2, y: -14, zoom: 230 },
  'collection-Carlotta': { x: 2, y: -28, zoom: 210 },
  'collection-Roccia': { x: 8, y: -4, zoom: 210 },
  'collection-Phoebe': { x: 10, y: -26, zoom: 190 },
  'collection-Brant': { x: -2, y: -26, zoom: 250 },
  'collection-Cantarella': { x: -2, y: -20, zoom: 240 },
  'collection-Zani': { x: 6, y: -26, zoom: 220 },
  'collection-Ciaccona': { x: 10, y: -24, zoom: 240 },
  'collection-Cartethyia': { x: -4, y: -26, zoom: 210 },
  'collection-Lupa': { x: 0, y: -12, zoom: 220 },
  'collection-Augusta': { x: 4, y: -30, zoom: 250 },
  'collection-Galbrena': { x: 14, y: -24, zoom: 240 },
  'collection-Iuno': { x: -2, y: -24, zoom: 200 },
  'collection-Luuk Herssen': { x: 2, y: 0, zoom: 130 },
  'collection-Aemeath': { x: -14, y: -22, zoom: 190 },
  'collection-Mornye': { x: 4, y: -20, zoom: 170 },
  'collection-Rover': { x: 24, y: -24, zoom: 230 },
  'collection-Chisa': { x: -6, y: -26, zoom: 220 },
  'collection-Phrolova': { x: 0, y: -30, zoom: 220 },
  'collection-Qiuyuan': { x: -8, y: -28, zoom: 230 },
  'collection-Lynae': { x: -12, y: -28, zoom: 190 },
  'collection-Sigrika': { x: 2, y: -23, zoom: 190 },
  'collection-Rover: Electro': { x: 24, y: -26, zoom: 260 },
  'collection-Rover: Aero': { x: 26, y: -22, zoom: 220 },
  'collection-Rover: Havoc': { x: 24, y: -22, zoom: 230 },
  'collection-Rover: Spectro': { x: 24, y: -22, zoom: 230 },
  // New sprites without individual tuning yet — averaged from every other
  // collection- entry above (avg x/y/zoom across all 46 tuned characters).
  'collection-Lucy': { x: 1, y: -22, zoom: 217 },
  'collection-Rebecca': { x: -1, y: -24, zoom: 202 },
  'collection-Lucilla': { x: -1, y: -29, zoom: 227 },
  'collection-Denia': { x: -2, y: -27, zoom: 212 },
  'collection-Hiyuki': { x: 3, y: -28, zoom: 237 },
  'collection-Suisui': { x: 14, y: -29, zoom: 212 },
  'collection-Yangyang: Xuanling': { x: 4, y: -24, zoom: 217 },
  'collection-Qingxiao': { x: 8, y: -22, zoom: 227 },
  // Tuned individually 2026-08-18 (was the generic averaged fallback, still looked de-zoomed): his
  // sprite's content already fills the canvas edge-to-edge (unlike flowing-hair characters, most of
  // that bleed is his weapon/energy wisp, not his body), so the average zoom left him looking smaller
  // than everyone else — bumped zoom and shifted the crop up toward his torso/face.
  'collection-Jingran': { x: -2, y: -22, zoom: 250 },
  'collection-Solsworn Ciphers': { x: 2, y: -2, zoom: 100 },
  'collection-Blazing Justice': { x: 0, y: 0, zoom: 100 },
  // 4-star Resonators
  'collection-Aalto': { x: 4, y: -24, zoom: 210 },
  'collection-Baizhi': { x: -2, y: -14, zoom: 300 },
  'collection-Chixia': { x: -4, y: -26, zoom: 190 },
  'collection-Danjin': { x: -4, y: -26, zoom: 220 },
  'collection-Yangyang': { x: -4, y: -24, zoom: 300 },
  'collection-Sanhua': { x: 12, y: -30, zoom: 230 },
  'collection-Taoqi': { x: 4, y: -28, zoom: 200 },
  'collection-Yuanwu': { x: 2, y: -26, zoom: 230 },
  'collection-Mortefi': { x: 0, y: -30, zoom: 230 },
  'collection-Youhu': { x: 0, y: -26, zoom: 170 },
  'collection-Lumi': { x: 0, y: -24, zoom: 180 },
  'collection-Buling': { x: 0, y: -22, zoom: 170 },
  // Team card framing
  'team-Jiyan': { x: 6, y: -18, zoom: 260 },
  'team-Calcharo': { x: 0, y: -20, zoom: 230 },
  'team-Rover': { x: 24, y: -16, zoom: 240 },
  'team-Rover: Spectro': { x: 22, y: -16, zoom: 240 },
  'team-Rover: Aero': { x: 22, y: -16, zoom: 230 },
  'team-Rover: Havoc': { x: 24, y: -16, zoom: 230 },
  'team-Rover: Electro': { x: 24, y: -16, zoom: 260 },
  'team-Encore': { x: 0, y: -14, zoom: 150 },
  'team-Jianxin': { x: 2, y: -18, zoom: 180 },
  'team-Lingyang': { x: -4, y: -12, zoom: 160 },
  'team-Sanhua': { x: 12, y: -22, zoom: 170 },
  'team-Verina': { x: 0, y: -8, zoom: 250 },
  'team-Jinhsi': { x: 0, y: -22, zoom: 160 },
  'team-Yinlin': { x: 2, y: -22, zoom: 170 },
  'team-Changli': { x: 8, y: -20, zoom: 160 },
  'team-Mortefi': { x: -2, y: -24, zoom: 180 },
  'team-Shorekeeper': { x: 12, y: -18, zoom: 180 },
  'team-Zhezhi': { x: -2, y: -10, zoom: 200 },
  'team-Xiangli Yao': { x: -4, y: -10, zoom: 300 },
  'team-Camellya': { x: 0, y: -22, zoom: 170 },
  'team-Carlotta': { x: 0, y: -20, zoom: 170 },
  'team-Roccia': { x: 8, y: 0, zoom: 180 },
  'team-Phoebe': { x: 12, y: -20, zoom: 170 },
  'team-Brant': { x: -2, y: -18, zoom: 190 },
  'team-Cantarella': { x: 0, y: -16, zoom: 220 },
  'team-Zani': { x: 6, y: -26, zoom: 200 },
  'team-Ciaccona': { x: 10, y: -20, zoom: 190 },
  'team-Cartethyia': { x: 0, y: -22, zoom: 170 },
  'team-Lupa': { x: 4, y: -8, zoom: 210 },
  'team-Phrolova': { x: 2, y: -24, zoom: 170 },
  'team-Augusta': { x: 4, y: -22, zoom: 180 },
  'team-Iuno': { x: 0, y: -16, zoom: 200 },
  'team-Galbrena': { x: 16, y: -20, zoom: 200 },
  'team-Qiuyuan': { x: -8, y: -26, zoom: 200 },
  'team-Chisa': { x: -4, y: -20, zoom: 230 },
  'team-Lynae': { x: -10, y: -22, zoom: 160 },
  'team-Luuk Herssen': { x: 2, y: 4, zoom: 130 },
  'team-Aemeath': { x: -12, y: -16, zoom: 170 },
  'team-Sigrika': { x: 4, y: -20, zoom: 160 },
  'team-Aalto': { x: 6, y: -20, zoom: 190 },
  'team-Baizhi': { x: -2, y: -6, zoom: 220 },
  'team-Chixia': { x: -6, y: -24, zoom: 180 },
  'team-Danjin': { x: 0, y: -22, zoom: 180 },
  'team-Yangyang': { x: -4, y: -12, zoom: 270 },
  'team-Taoqi': { x: 6, y: -20, zoom: 180 },
  'team-Yuanwu': { x: 2, y: -22, zoom: 190 },
  'team-Youhu': { x: 2, y: -14, zoom: 130 },
  'team-Lumi': { x: 0, y: -22, zoom: 170 },
  'team-Buling': { x: 0, y: -18, zoom: 150 },
  'team-Mornye': { x: 4, y: -20, zoom: 170 },
  'team-Solsworn Ciphers': { x: 2, y: -2, zoom: 100 },
  'team-Blazing Justice': { x: 0, y: 0, zoom: 100 },
  // Averaged from every other team- entry above (avg x/y/zoom across all 48 tuned characters) — same
  // "no individual tuning yet" convention as the collection-/info- averaged entries below.
  'team-Lucy': { x: 2, y: -17, zoom: 185 },
  'team-Rebecca': { x: 2, y: -17, zoom: 185 },
  'team-Lucilla': { x: 2, y: -17, zoom: 185 },
  'team-Denia': { x: 2, y: -17, zoom: 185 },
  'team-Hiyuki': { x: 2, y: -23, zoom: 185 },
  'team-Suisui': { x: 16, y: -25, zoom: 185 },
  'team-Yangyang: Xuanling': { x: 4, y: -17, zoom: 185 },
  'team-Qingxiao': { x: 8, y: -17, zoom: 215 },
  'team-Jingran': { x: -2, y: -19, zoom: 220 },
  // Info panel framing
  'info-Encore': { x: -10, y: -48, zoom: 190 },
  'info-Lingyang': { x: -10, y: -46, zoom: 190 },
  'info-Calcharo': { x: -28, y: -62, zoom: 260 },
  'info-Aemeath': { x: -28, y: -54, zoom: 240 },
  'info-Lynae': { x: -22, y: -58, zoom: 230 },
  'info-Sigrika': { x: -4, y: -56, zoom: 230 },
  'info-Rover: Electro': { x: -4, y: -62, zoom: 260 },
  'info-Rover: Aero': { x: -4, y: -62, zoom: 250 },
  'info-Rover: Havoc': { x: -4, y: -62, zoom: 250 },
  'info-Rover: Spectro': { x: -6, y: -64, zoom: 270 },
  'info-Chisa': { x: -28, y: -60, zoom: 240 },
  'info-Iuno': { x: -24, y: -58, zoom: 240 },
  'info-Augusta': { x: -14, y: -66, zoom: 300 },
  'info-Ciaccona': { x: -2, y: -60, zoom: 300 },
  'info-Zani': { x: -12, y: -64, zoom: 290 },
  'info-Cantarella': { x: -20, y: -56, zoom: 300 },
  'info-Phoebe': { x: 8, y: -56, zoom: 240 },
  'info-Verina': { x: -24, y: -48, zoom: 260 },
  'info-Xiangli Yao': { x: -34, y: -54, zoom: 300 },
  'info-Jiyan': { x: -20, y: -64, zoom: 270 },
  'info-Yinlin': { x: -2, y: -58, zoom: 240 },
  'info-Jinhsi': { x: -8, y: -58, zoom: 220 },
  'info-Shorekeeper': { x: 4, y: -56, zoom: 260 },
  'info-Camellya': { x: -8, y: -62, zoom: 260 },
  'info-Changli': { x: -6, y: -58, zoom: 240 },
  'info-Zhezhi': { x: -22, y: -48, zoom: 270 },
  'info-Carlotta': { x: -14, y: -60, zoom: 250 },
  'info-Roccia': { x: -4, y: -38, zoom: 260 },
  'info-Brant': { x: -20, y: -58, zoom: 290 },
  'info-Cartethyia': { x: -14, y: -62, zoom: 270 },
  'info-Lupa': { x: -20, y: -50, zoom: 290 },
  'info-Phrolova': { x: -12, y: -62, zoom: 260 },
  'info-Galbrena': { x: 0, y: -60, zoom: 300 },
  'info-Qiuyuan': { x: -20, y: -62, zoom: 260 },
  'info-Mornye': { x: -6, y: -48, zoom: 210 },
  'info-Luuk Herssen': { x: 0, y: -24, zoom: 140 },
  'info-Jianxin': { x: -4, y: -54, zoom: 240 },
  'info-Taoqi': { x: -10, y: -58, zoom: 230 },
  'info-Baizhi': { x: -10, y: -48, zoom: 270 },
  'info-Aalto': { x: 2, y: -62, zoom: 250 },
  'info-Lumi': { x: 6, y: -58, zoom: 240 },
  'info-Mortefi': { x: -18, y: -66, zoom: 290 },
  'info-Yangyang': { x: -30, y: -52, zoom: 270 },
  'info-Chixia': { x: -8, y: -64, zoom: 230 },
  'info-Youhu': { x: 2, y: -54, zoom: 220 },
  'info-Yuanwu': { x: -8, y: -58, zoom: 260 },
  'info-Danjin': { x: -14, y: -58, zoom: 250 },
  'info-Sanhua': { x: 10, y: -60, zoom: 250 },
  'info-Buling': { x: -4, y: -58, zoom: 240 },
  // New sprites without individual tuning yet — averaged from every other
  // info- entry above (avg x/y/zoom across all 45 tuned characters).
  'info-Lucy': { x: -14, y: -57, zoom: 273 },
  'info-Rebecca': { x: -6, y: -55, zoom: 243 },
  'info-Lucilla': { x: -10, y: -63, zoom: 283 },
  'info-Denia': { x: -8, y: -59, zoom: 243 },
  'info-Hiyuki': { x: -14, y: -63, zoom: 283 },
  'info-Suisui': { x: 6, y: -62, zoom: 260 },
  'info-Yangyang: Xuanling': { x: -12, y: -59, zoom: 283 },
  'info-Qingxiao': { x: -10, y: -57, zoom: 283 },
  'info-Jingran': { x: -16, y: -56, zoom: 300 },
  // Weapon info-panel framing (WeaponDetailModal header image)
  "info-Firstlight's Herald": { x: 10, y: 0, zoom: 140 },
  'info-Azure Oath': { x: 6, y: 0, zoom: 130 },
  'info-Freeze Frame': { x: 8, y: 6, zoom: 140 },
  'info-Skull Thrasher': { x: 12, y: 4, zoom: 140 },
  'info-Spectral Trigger': { x: 10, y: 0, zoom: 140 },
  'info-Forged Dwarf Star': { x: 10, y: 0, zoom: 140 },
  'info-Frostburn': { x: 6, y: 0, zoom: 130 },
  'info-Solsworn Ciphers': { x: 10, y: 0, zoom: 140 },
  "info-Daybreaker's Spine": { x: 10, y: 0, zoom: 140 },
  'info-Everbright Polestar': { x: 6, y: 0, zoom: 140 },
  'info-Boson Astrolabe': { x: 10, y: 0, zoom: 140 },
  'info-Pulsation Bracer': { x: 8, y: 0, zoom: 140 },
  'info-Phasic Homogenizer': { x: 4, y: 0, zoom: 140 },
  'info-Laser Shearer': { x: 10, y: 0, zoom: 140 },
  'info-Radiance Cleaver': { x: 4, y: 2, zoom: 140 },
  'info-Starfield Calibrator': { x: 10, y: 0, zoom: 140 },
  'info-Spectrum Blaster': { x: 10, y: 0, zoom: 140 },
  'info-Kumokiri': { x: 2, y: 0, zoom: 140 },
  'info-Emerald Sentence': { x: 0, y: 0, zoom: 140 },
  'info-Lux & Umbra': { x: 18, y: 0, zoom: 140 },
  "info-Moongazer's Sigil": { x: 16, y: 0, zoom: 140 },
  'info-Thunderflare Dominion': { x: 12, y: 0, zoom: 140 },
  "info-Bloodpact's Pledge": { x: 8, y: 4, zoom: 130 },
  'info-Lethean Elegy': { x: 14, y: 0, zoom: 160 },
  'info-Wildfire Mark': { x: 8, y: 6, zoom: 130 },
  "info-Defier's Thorn": { x: 12, y: 0, zoom: 140 },
  'info-Woodland Aria': { x: 10, y: 0, zoom: 140 },
  'info-Blazing Justice': { x: 18, y: 0, zoom: 160 },
  'info-Whispers of Sirens': { x: 16, y: 0, zoom: 140 },
  'info-Unflickering Valor': { x: 14, y: 0, zoom: 140 },
  'info-Luminous Hymn': { x: 16, y: 0, zoom: 140 },
  'info-Tragicomedy': { x: 14, y: 4, zoom: 150 },
  'info-The Last Dance': { x: 12, y: 0, zoom: 140 },
  'info-Red Spring': { x: 10, y: 0, zoom: 150 },
  'info-Stellar Symphony': { x: 24, y: 0, zoom: 140 },
  "info-Verity's Handle": { x: 14, y: 0, zoom: 140 },
  'info-Rime-Draped Sprouts': { x: 14, y: 0, zoom: 140 },
  'info-Blazing Brilliance': { x: 2, y: 4, zoom: 160 },
  'info-Ages of Harvest': { x: 8, y: 8, zoom: 130 },
  'info-Stringmaster': { x: 26, y: -2, zoom: 150 },
  'info-Cosmic Ripples': { x: 18, y: -2, zoom: 160 },
  'info-Abyss Surges': { x: 16, y: 2, zoom: 160 },
  'info-Static Mist': { x: 10, y: 0, zoom: 160 },
  'info-Emerald of Genesis': { x: 6, y: 0, zoom: 150 },
  'info-Lustrous Razor': { x: 8, y: 8, zoom: 140 },
  'info-Verdant Summit': { x: 12, y: 10, zoom: 130 },
  'info-Overture': { x: 6, y: 0, zoom: 140 },
  "info-Ocean's Gift": { x: 26, y: 0, zoom: 150 },
  'info-Waltz in Masquerade': { x: 22, y: 0, zoom: 140 },
  'info-Legend of Drunken Hero': { x: 18, y: -2, zoom: 150 },
  'info-Romance in Farewell': { x: 10, y: 0, zoom: 150 },
  'info-Fables of Wisdom': { x: 10, y: 0, zoom: 140 },
  'info-Meditations on Mercy': { x: 20, y: 0, zoom: 140 },
  'info-Call of the Abyss': { x: 30, y: -2, zoom: 140 },
  'info-Somnoire Anchor': { x: 12, y: 0, zoom: 130 },
  'info-Fusion Accretion': { x: 20, y: 0, zoom: 130 },
  'info-Celestial Spiral': { x: 16, y: 0, zoom: 140 },
  'info-Relativistic Jet': { x: 18, y: 0, zoom: 140 },
  'info-Endless Collapse': { x: 10, y: 0, zoom: 140 },
  'info-Waning Redshift': { x: 24, y: 2, zoom: 120 },
  'info-Lumingloss': { x: 10, y: 0, zoom: 140 },
  'info-Lunar Cutter': { x: 14, y: 4, zoom: 140 },
  'info-Commando of Conviction': { x: 0, y: 2, zoom: 130 },
  'info-Jinzhou Keeper': { x: 18, y: 0, zoom: 140 },
  'info-Comet Flare': { x: 24, y: 0, zoom: 140 },
  'info-Augment': { x: 32, y: -2, zoom: 140 },
  'info-Variation': { x: 24, y: 0, zoom: 140 },
  'info-Hollow Mirage': { x: 14, y: 0, zoom: 140 },
  'info-Stonard': { x: 24, y: -2, zoom: 140 },
  'info-Amity Accord': { x: 20, y: -4, zoom: 150 },
  'info-Marcato': { x: 20, y: -2, zoom: 140 },
  'info-Novaburst': { x: 16, y: 2, zoom: 140 },
  'info-Thunderbolt': { x: 16, y: 2, zoom: 150 },
  'info-Undying Flame': { x: 12, y: 4, zoom: 140 },
  'info-Cadenza': { x: 8, y: 2, zoom: 140 },
  'info-Discord': { x: 14, y: 8, zoom: 140 },
  'info-Helios Cleaver': { x: 18, y: 0, zoom: 140 },
  'info-Dauntless Evernight': { x: 6, y: 6, zoom: 140 },
  'info-Solar Flame': { x: 10, y: 2, zoom: 150 },
  'info-Feather Edge': { x: 2, y: 0, zoom: 140 },
  'info-Sword#18': { x: 0, y: 0, zoom: 140 },
  'info-Rectifier#25': { x: 14, y: -2, zoom: 140 },
  'info-Gauntlets#21D': { x: 16, y: 0, zoom: 140 },
  'info-Pistols#26': { x: 10, y: 2, zoom: 140 },
  'info-Aureate Zenith': { x: 6, y: 2, zoom: 140 },
  'info-Radiant Dawn': { x: 20, y: 0, zoom: 140 },
  'info-Aether Strike': { x: 4, y: 0, zoom: 150 },
  'info-Guardian Sword': { x: 0, y: 0, zoom: 140 },
  'info-Sword of Voyager': { x: 0, y: 0, zoom: 150 },
  'info-Originite: Type II': { x: 0, y: 0, zoom: 150 },
  'info-Sword of Night': { x: 0, y: 0, zoom: 140 },
  'info-Guardian Rectifier': { x: 8, y: 0, zoom: 150 },
  'info-Rectifier of Voyager': { x: 10, y: 0, zoom: 130 },
  'info-Rectifier of Night': { x: 12, y: 0, zoom: 140 },
  'info-Originite: Type V': { x: 12, y: 0, zoom: 150 },
  'info-Guardian Gauntlets': { x: 4, y: 0, zoom: 140 },
  'info-Gauntlets of Voyager': { x: 10, y: 0, zoom: 140 },
  'info-Gauntlets of Night': { x: 4, y: 0, zoom: 150 },
  'info-Originite: Type III': { x: 6, y: 0, zoom: 140 },
  'info-Guardian Pistols': { x: 12, y: 0, zoom: 140 },
  'info-Pistols of Voyager': { x: 6, y: 0, zoom: 150 },
  'info-Pistols of Night': { x: 6, y: 0, zoom: 140 },
  'info-Originite: Type IV': { x: 6, y: 0, zoom: 140 },
  'info-Guardian Broadblade': { x: 8, y: 0, zoom: 140 },
  'info-Broadblade of Night': { x: 6, y: 4, zoom: 140 },
  'info-Broadblade of Voyager': { x: 8, y: 4, zoom: 140 },
  'info-Originite: Type I': { x: 8, y: 4, zoom: 140 },
  'info-Beguiling Melody': { x: 8, y: 4, zoom: 140 },
  'info-Tyro Sword': { x: 8, y: 4, zoom: 140 },
  'info-Tyro Rectifier': { x: 10, y: 0, zoom: 140 },
  'info-Tyro Gauntlets': { x: 8, y: 0, zoom: 140 },
  'info-Tyro Pistols': { x: 10, y: 0, zoom: 140 },
  'info-Tyro Broadblade': { x: 12, y: 0, zoom: 140 },
  'info-Training Sword': { x: 8, y: 0, zoom: 140 },
  'info-Training Rectifier': { x: 10, y: 0, zoom: 140 },
  'info-Training Gauntlets': { x: 10, y: 0, zoom: 140 },
  'info-Training Pistols': { x: 10, y: -2, zoom: 140 },
  'info-Training Broadblade': { x: 8, y: 2, zoom: 140 },
});

const defaultFramingBase = Object.freeze({ x: 0, y: 0, zoom: 100 });

/**
 * Custom hook for managing image framing state (position/zoom per image key).
 * Handles persistence to localStorage.
 *
 * @param {boolean} storageAvailable - Whether localStorage is available
 * @returns {object} Framing state and handlers
 */
export function useImageFraming(storageAvailable) {
  const [imageFraming, setImageFraming] = useState({});
  const [editingImage, setEditingImage] = useState(null);
  const [framingMode, setFramingMode] = useState(false);
  const [miniPanelPosition, setMiniPanelPosition] = useState('bottom-right');

  // Load from localStorage on mount
  useEffect(() => {
    if (!storageAvailable) return;
    try {
      const saved = localStorage.getItem(IMAGE_FRAMING_KEY);
      if (saved) setImageFraming(sanitizeStateObj(JSON.parse(saved)));
      const pos = localStorage.getItem('ww-mini-panel-pos');
      if (pos) setMiniPanelPosition(pos);
    } catch {}
  }, []);

  // Save framing for a specific image key
  const saveImageFraming = useCallback((key, settings) => {
    setImageFraming(prev => {
      const newFraming = { ...prev, [key]: settings };
      if (storageAvailable) {
        try { localStorage.setItem(IMAGE_FRAMING_KEY, JSON.stringify(newFraming)); } catch {}
      }
      return newFraming;
    });
  }, [storageAvailable]);

  // Get framing for an image (user override -> hardcoded default -> base default)
  const getImageFraming = useCallback((key) => {
    return imageFraming[key] || DEFAULT_IMAGE_FRAMING[key] || defaultFramingBase;
  }, [imageFraming]);

  // Update framing for currently editing image
  const updateEditingFraming = useCallback((changes) => {
    if (!editingImage) return;
    const current = imageFraming[editingImage] || DEFAULT_IMAGE_FRAMING[editingImage] || defaultFramingBase;
    const newFraming = { ...current, ...changes };
    newFraming.x = Math.max(-100, Math.min(100, newFraming.x));
    newFraming.y = Math.max(-100, Math.min(100, newFraming.y));
    newFraming.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newFraming.zoom));
    saveImageFraming(editingImage, newFraming);
  }, [editingImage, imageFraming, saveImageFraming]);

  const resetEditingFraming = useCallback(() => {
    if (!editingImage) return;
    saveImageFraming(editingImage, { x: 0, y: 0, zoom: 100 });
  }, [editingImage, saveImageFraming]);

  const saveMiniPanelPosition = useCallback((pos) => {
    setMiniPanelPosition(pos);
    if (storageAvailable) {
      try { localStorage.setItem('ww-mini-panel-pos', pos); } catch {}
    }
  }, [storageAvailable]);

  const getMiniPanelPositionClasses = useCallback(() => {
    switch (miniPanelPosition) {
      case 'top-left': return 'top-16 left-2';
      case 'top-right': return 'top-16 right-2';
      case 'bottom-left': return 'bottom-24 left-2';
      default: return 'bottom-24 right-2';
    }
  }, [miniPanelPosition]);

  return {
    imageFraming,
    setImageFraming,
    editingImage,
    setEditingImage,
    framingMode,
    setFramingMode,
    miniPanelPosition,
    saveMiniPanelPosition,
    getMiniPanelPositionClasses,
    saveImageFraming,
    getImageFraming,
    updateEditingFraming,
    resetEditingFraming,
  };
}
