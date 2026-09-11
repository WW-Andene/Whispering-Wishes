// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/weaponLists.js (split from constants.js)
// Standard-pool + full weapon rarity lists, and release order for sorting.
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_5STAR_WEAPONS = [
  'Verdant Summit', 'Lustrous Razor', 'Emerald of Genesis', 'Static Mist', 'Abyss Surges', 'Cosmic Ripples',
  'Stringmaster', 'Ages of Harvest', 'Blazing Brilliance', 'Rime-Draped Sprouts', "Verity's Handle",
  'Stellar Symphony', 'Red Spring', 'The Last Dance', 'Tragicomedy', 'Luminous Hymn',
  'Unflickering Valor', 'Whispers of Sirens', 'Blazing Justice', 'Woodland Aria',
  "Bloodpact's Pledge", "Defier's Thorn", 'Wildfire Mark', 'Lethean Elegy',
  'Thunderflare Dominion', "Moongazer's Sigil", 'Solsworn Ciphers',
  'Lux & Umbra', 'Emerald Sentence', 'Kumokiri', 'Spectrum Blaster', 'Starfield Calibrator',
  'Everbright Polestar', "Daybreaker's Spine", "Firstlight's Herald",
  'Radiance Cleaver', 'Laser Shearer', 'Phasic Homogenizer', 'Pulsation Bracer', 'Boson Astrolabe',
  'Skull Thrasher', 'Freeze Frame', 'Spectral Trigger', 'Azure Oath', 'Frostburn', 'Forged Dwarf Star',
  'Thousandfold Deliverance', 'Glint of Clouds',
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
  // 3.3 (Hiyuki/Denia signatures — verified against the source character order 2026-08-14)
  'Frostburn', 'Forged Dwarf Star',
  // 3.4
  'Spectral Trigger', 'Skull Thrasher', 'Freeze Frame',
  // 3.5
  'Azure Oath', "Firstlight's Herald",
  // 3.6
  'Glint of Clouds', 'Thousandfold Deliverance',
];

export {
  ALL_5STAR_WEAPONS,
  ALL_4STAR_WEAPONS,
  ALL_3STAR_WEAPONS,
  ALL_2STAR_WEAPONS,
  ALL_1STAR_WEAPONS,
  WEAPON_RELEASE_ORDER,
};
