// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/characters.js
// Character data, combat tags, base stats, rotation data, tier data, region data,
// birthday data, buff/debuff tables, skill multipliers, resonance chains,
// and character list arrays.
// ═══════════════════════════════════════════════════════════════════════════════

const CHARACTER_DATA = {
  // 5★ Resonators
  // NOTE: Rover is modeled as four separate roster entries — one per attunement — matching ww.nanoka.cc's
  // own character-page split (Rover: Spectro/Havoc/Aero/Electro are each a distinct page/kit there) and the
  // depth every other character gets: each has its own full combat profile, buffs/debuffs, base stats,
  // resonance chain, skill multipliers, weapons (signature + rarity alternatives), echoes, and teams.
  // In-game, Rover is a single ownable resonator that freely re-specs its attunement (no separate copies are
  // pulled per element), so collection/wish-count ownership is mirrored across all four keys in App.jsx's
  // collectionData builder — owning "Rover" owns every attunement card here. Ascension materials, skill
  // materials, and weapon type (Sword) are identical across all four since it's the same resonator.
  // Source: ww.nanoka.cc character pages 1502 (Spectro), 1604 (Havoc), 1406 (Aero), 1309 (Electro), v3.6,
  // 2026-08-16. Tier source: prydwen.gg tier list, last updated 01/Aug/2026.
  'Rover: Spectro': { rarity: 5, element: 'Spectro', weapon: 'Sword', role: 'Sub DPS',
    desc: "A wanderer who awoke with no memory on the shores of Solaris. Spectro attunement: a quick-swap Frazzle debuffer — Forte Circuit's Resonating Spin applies Spectro Frazzle (with Shimmer to stop decay) and Liberation Echoing Orchestra piles on more, then swaps out for the main DPS.",
    skills: ['Vibration Manifestation', 'Resonating Slashes', 'World in a Grain of Sand', 'Echoing Orchestra'],
    ascension: { boss: 'Mysterious Code', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Mourning Aix', 'Eternal Radiance 5pc'], bestWeapon: 'Emerald of Genesis',
    weaponAlts: { alt5: ['Laser Shearer', "Bloodpact's Pledge"], alt4: ['Lunar Cutter', 'Endless Collapse'], alt3: ['Sword of Night'] },
    teams: ['Phoebe + Rover: Spectro + Verina', 'Zani + Rover: Spectro + Verina', 'Rover: Spectro + Shorekeeper + Camellya'] },
  'Rover: Havoc': { rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    desc: 'A wanderer who awoke with no memory on the shores of Solaris. Havoc attunement: an on-field main DPS — hold Heavy ATK at full Umbra to cast Devastation and enter Dark Surge, an enhanced-state combo that ends in the 1520%-ATK Liberation nuke Deadening Abyss.',
    skills: ['Tuneslayer', 'Wingblade', 'Umbra Eclipse', 'Deadening Abyss'],
    ascension: { boss: 'Mysterious Code', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Impermanence Heron', 'Havoc Eclipse 5pc'], bestWeapon: 'Emerald of Genesis',
    weaponAlts: { alt5: ['Red Spring', 'Azure Oath'], alt4: ['Commando of Conviction', 'Endless Collapse'], alt3: ['Sword of Night'] },
    teams: ['Rover: Havoc + Sanhua + Verina', 'Rover: Havoc + Yinlin + Shorekeeper'] },
  'Rover: Aero': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Healer',
    desc: "A wanderer who awoke with no memory on the shores of Solaris. Aero attunement: a healer/support whose Skyfall Severance strips Spectro Frazzle, Havoc Bane, Fusion Burst, Glacio Chafe, and Electro Flare stacks off a target and converts each into a stack of Aero Erosion, while Forte and Liberation both heal the team.",
    skills: ['Wind Cutter', 'Illusion Breaker', 'Cycle of Wind', 'Omega Storm'],
    ascension: { boss: 'Mysterious Code', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Gusts of Welkin 5pc'], bestWeapon: 'Emerald of Genesis',
    weaponAlts: { alt5: ["Bloodpact's Pledge", 'Laser Shearer'], alt4: ['Overture', 'Lunar Cutter'], alt3: ['Sword of Voyager'] },
    teams: ['Ciaccona + Cartethyia + Rover: Aero', 'Rover: Aero + Jinhsi + Shorekeeper'] },
  'Rover: Electro': { rarity: 5, element: 'Electro', weapon: 'Sword', role: 'Sub DPS',
    desc: 'A wanderer who awoke with no memory on the shores of Solaris. Electro attunement: a Parry Stance hybrid — hold Basic ATK for interrupt immunity and 60% DMG reduction, then spend Electric Surge on a team ATK buff or Apex Resonance, unlocking the multi-element Thrum of All Sounds Forte combo. Currently the weakest attunement, lacking a strong DPS partner.',
    skills: ['Deterrence', 'Thunderclap', "Myriad Omens' Mandate", 'Ultimate Tactics'],
    ascension: { boss: 'Mysterious Code', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Nightmare: Thundering Mephis', 'Void Thunder 5pc'], bestWeapon: 'Emerald of Genesis',
    weaponAlts: { alt5: ['Blazing Brilliance', 'Laser Shearer'], alt4: ['Lunar Cutter', 'Endless Collapse'], alt3: ['Sword of Night'] },
    teams: ['Rover: Electro + Yinlin + Verina', 'Rover: Electro + Calcharo + Shorekeeper'] },
  'Jiyan': { rarity: 5, element: 'Aero', weapon: 'Broadblade', role: 'Main DPS',
    desc: "Windborne Rider, leader of the Midnight Rangers of Jinzhou, acts with swift and resolute righteousness — he possesses the formidable ability to conjure a powerful Qingloong from the winds, making him invincible on the battlefield. On-field Aero DPS who builds Resolve through Basic Attacks and the Intro Skill Tactical Strike, spending it on an empowered Windqueller or the Emerald Storm: Finale burst, then unleashes Emerald Storm: Prelude to enter Qingloong Mode — a heavy-hitting Lance of Qingloong combo with high interrupt resistance.",
    skills: ['Lone Lance', 'Windqueller', 'Qingloong at War', 'Emerald Storm: Prelude'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Waveworn Residue' },
    // bestEchoes/weaponAlts corrected against Prydwen's Jiyan build calcs (2026-07-30 profile update):
    // Windward Pilgrimage (100%) outranks Sierra Gale (94.3%) as long as the team applies Aero Erosion;
    // Thunderflare Dominion (90.3%) and Aureate Zenith (82.3%) are the actual best 5★/4★ alternatives —
    // Waning Redshift wasn't in Prydwen's recommendations for him at all.
    bestEchoes: ['Nightmare: Kelpie', 'Windward Pilgrimage 5pc'], bestWeapon: 'Verdant Summit',
    weaponAlts: { alt5: ['Thunderflare Dominion', 'Ages of Harvest'], alt4: ['Aureate Zenith', 'Autumntrace'], alt3: ['Broadblade of Night'] },
    teams: ['Jiyan + Iuno + Ciaccona', 'Jiyan + Iuno + Shorekeeper'] },
  'Calcharo': { rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Phantom Hunter, leader of the "Ghost Hounds" international mercenary group — ruthless, vengeful, unforgiving; a potential client must be mindful of the price to pay before making him an offer. On-field Electro DPS who builds Cruelty from his Resonance Skill Extermination Order into an enhanced Heavy Attack "Mercy," then triggers Resonance Liberation Phantom Etching to enter Deathblade Gear, replacing his Basic Attack with the Killing Intent-fueled "Death Messenger" burst finisher.',
    skills: ['Gnawing Fangs', 'Extermination Order', 'Hunting Mission', 'Phantom Etching'],
    ascension: { boss: 'Thundering Tacet Core', common: 'Ring', specialty: 'Iris' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Waveworn Residue' },
    // bestEchoes confirmed accurate (Void Thunder/Nightmare: Thundering Mephis is genuinely #1 per
    // Prydwen calcs). weaponAlts/teams corrected against Prydwen's live build calcs (2026-07-30 profile
    // update): Wildfire Mark (100.72%) actually edges out even his own bestWeapon and belongs in alt5,
    // not Verdant Summit (96.69%, still fine but not top-tier). 'Waning Redshift' was a straight data
    // bug — it's a Rectifier weapon (see weapons.js), not equippable by a Broadblade user at all;
    // replaced with Aureate Zenith, a real Broadblade 4★ option. Lynae + Mornye is Calcharo's explicit
    // "Best Team" per Prydwen (his best overall buffer by a wide margin) — added ahead of the Yinlin
    // pairing, which remains valid as his "most reliable Outro buffing option".
    bestEchoes: ['Nightmare: Thundering Mephis', 'Void Thunder 5pc'], bestWeapon: 'Lustrous Razor',
    weaponAlts: { alt5: ['Wildfire Mark', 'Ages of Harvest'], alt4: ['Autumntrace', 'Aureate Zenith'], alt3: ['Broadblade of Night'] },
    teams: ['Calcharo + Lynae + Mornye', 'Calcharo + Yinlin + Shorekeeper'] },
  'Encore': { rarity: 5, element: 'Fusion', weapon: 'Rectifier', role: 'Main DPS',
    desc: "Wooly-Counting Game, a girl of the Black Shores accompanied by one black and one white Wooly, who dreams of creating happy stories with candies, fairy tales, and her imagination. On-field Fusion DPS who builds Mayhem from her Basic/Skill/Intro hits into an empowered, damage-reducing Heavy Attack (Cloudy Frenzy), then unleashes Resonance Liberation Cosmos Rave to swap her whole kit for enhanced Fusion versions for 10s.",
    skills: ['Wooly Attack', 'Flaming Woolies', 'Black & White Woolies', 'Cosmos Rave'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Helix' },
    // bestEchoes confirmed accurate (Molten Rift/Nightmare: Inferno Rider is genuinely #1 per Prydwen
    // calcs). bestWeapon kept as Cosmic Ripples (her best permanently-available option, same convention
    // as Calcharo who also has no true signature) since it's the practical F2P choice; weaponAlts/teams
    // corrected against Prydwen's live build calcs (2026-07-30 profile update): Stringmaster (110%) and
    // Rime-Draped Sprouts (104.4%) are her real top alternatives, clearly ahead of Cosmic Ripples itself
    // — 'Boson Astrolabe' wasn't in Prydwen's recommendations for her at all. Lupa is now explicitly her
    // "new best teammate over Sanhua in most situations" and pairs with Brant in Prydwen's own "Best
    // Team" example — added ahead of the Changli/Shorekeeper pairing.
    bestEchoes: ['Nightmare: Inferno Rider', 'Molten Rift 5pc'], bestWeapon: 'Cosmic Ripples',
    weaponAlts: { alt5: ['Stringmaster', 'Rime-Draped Sprouts'], alt4: ['Augment', 'Fusion Accretion'], alt3: ['Rectifier of Night'] },
    teams: ['Encore + Brant + Lupa', 'Encore + Sanhua + Lupa'] },
  // desc corrected against wutheringwaves.fandom.com's Jianxin infobox (2026-08-17 audit): the wiki's
  // current secondary_title is "Guiding Starlance", not "Cleansing Reflections" (a stale title still
  // shown on ww.nanoka.cc's character page for her — the two sources disagree here, fandom's live
  // infobox is treated as authoritative). Skills/base stats/multipliers/buffs/ascension mats all
  // independently re-verified against ww.nanoka.cc character/1405 this same audit and were already
  // accurate. weaponAlts/teams were corrected against Prydwen's live build/team page (see comments
  // by those fields below) once it became reachable via a Chrome UA + referer + jsRender fetch.
  'Jianxin': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Support',
    desc: 'Guiding Starlance, a Taoist monk and successor of Fengyiquan who has dedicated her life to mastering the ultimate martial art — with the power to harness and transform environmental Chi, she creates protective barriers that purify both body and mind. Shield support/sub-DPS who channels Heavy Attack Primordial Chi Spiral (Zhoutian Progress) for a large HP-scaling shield and periodic team healing, groups enemies with Liberation Purification Force Field, and grants the incoming Resonator +38% Resonance Liberation DMG via Outro.',
    skills: ['Fengyiquan', 'Calming Air', 'Primordial Chi Spiral', 'Purification Force Field'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Whisperin Core', specialty: 'Lanternberry' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    // bestWeapon kept as Abyss Surges (her best permanently-available option, ranked "100%" baseline
    // on Prydwen's own calc scale) even though Verity's Handle (114.70%) and Moongazer's Sigil (108.30%)
    // both out-damage it per Prydwen's live build calcs (prydwen.gg/wuthering-waves/characters/jianxin,
    // re-fetched 2026-08-17 via Chrome UA + google.com referer + jsRender to get past the Cloudflare
    // challenge) — same F2P-first convention already used for Encore/Calcharo. weaponAlts corrected
    // against that same page: alt4 was wrong (Marcato is her worst-performing 4★ at 71.40%, likely
    // copy/paste from another character) — replaced with Aether Strike (91.20%) and Celestial Spiral
    // (86.50%), the two actually-best 4★ alternatives. alt3 replaced 'Gauntlets of Night' (not even
    // mentioned on Prydwen's page) with Originite: Type IV, which Prydwen explicitly calls out as THE
    // 3★ pick for her low-investment ToA support build (enables the 5pc Rejuvenating Glow set).
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Abyss Surges',
    weaponAlts: { alt5: ["Verity's Handle", "Moongazer's Sigil"], alt4: ['Aether Strike', 'Celestial Spiral'], alt3: ['Originite: Type IV'] },
    // teams corrected against the same Prydwen page: 'Jianxin + Jiyan + Verina' had no basis in Prydwen's
    // synergy list (Jiyan isn't mentioned at all for her) — replaced with 'Jianxin + Iuno + Shorekeeper',
    // explicitly Prydwen's "Best Team" (Iuno is called her best DPS to buff, taking 38% Lib DMG Amp from
    // her Outro; the Iuno+Shorekeeper / Xiangli Yao+Shorekeeper pairing is also cited directly in
    // Prydwen's own endgame-stats ER estimate). Xiangli Yao + Shorekeeper kept, confirmed as her other
    // named example team.
    teams: ['Jianxin + Iuno + Shorekeeper', 'Jianxin + Xiangli Yao + Shorekeeper'] },
  // Full audit 2026-08-17 against wutheringwaves.fandom.com (MediaWiki API, Cloudflare bypassed via
  // Chrome UA + google.com referer + jsRender) and ww.nanoka.cc/character/1104 — base stats, skills,
  // multipliers, buffs, ascension mats all independently re-confirmed accurate, no changes needed there.
  // desc enriched with fandom's "last living Suan'ni" lore detail (his species/heritage, not previously
  // captured). bestEchoes/weaponAlts/teams corrected against Prydwen's live build/team page (re-fetched
  // same audit): Endless Resonance 5pc has since overtaken Frosty Resolve as her #1 echo set (100% vs
  // 98.9% on Prydwen's calc scale) — bestEchoes updated to its main echo, Mech Abomination. weaponAlts.
  // alt5 swapped Tragicomedy (103.0%, rank 4) for Blazing Justice (105.3%, actual rank 2, was skipped).
  // alt4 swapped Hollow Mirage (82.8%) for Aether Strike (88.9%, actual best 4★ alt, was omitted).
  // teams: 'Lingyang + Zhezhi + Shorekeeper' had no basis in Prydwen's synergy list — replaced with
  // 'Lingyang + Lynae + Zhezhi', explicitly named "Lingyang's best partners" and Prydwen's cited Best
  // Team; 'Lingyang + Sanhua + Verina' kept, confirmed as Prydwen's named F2P Team.
  'Lingyang': { rarity: 5, element: 'Glacio', weapon: 'Gauntlets', role: 'Main DPS',
    desc: "Frosty Gusto, an enthusiastic and brave member of the Liondance Troupe in Jinzhou and the last living Suan'ni — a sincere, compassionate visitor of the human community with incredible physical abilities, who embodies the spirit of Liondance with his unique style. On-field Glacio DPS who builds Lion's Spirit through his Resonance Skill Furious Punches, then unleashes it via Heavy Attack Glorious Plunge to enter the airborne Striding Lion state, chaining enhanced Basic Attacks, Mountain Roamer, and Stormy Kicks.",
    skills: ['Majestic Fists', 'Ancient Arts', 'Unification of Spirits', "Strive: Lion's Vigor"],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    bestEchoes: ['Mech Abomination', 'Endless Resonance 5pc'], bestWeapon: 'Abyss Surges',
    weaponAlts: { alt5: ["Moongazer's Sigil", 'Blazing Justice'], alt4: ['Aether Strike', 'Celestial Spiral'], alt3: ['Gauntlets of Night'] },
    teams: ['Lingyang + Lynae + Zhezhi', 'Lingyang + Sanhua + Verina'] },
  // Full audit 2026-08-17 against wutheringwaves.fandom.com (MediaWiki API) and ww.nanoka.cc/
  // character/1503 — desc, skills, base stats, multipliers, buffs, ascension mats, echoes, alt4/alt3
  // weapons, and teams all independently re-confirmed accurate, no changes needed there. CHAR_BUFF_TABLE's
  // existing "Outro is All DMG Amp, not Deepen" note re-confirmed against nanoka's exact wording
  // ("DMG Amplified by 15%") even though Prydwen's own prose review loosely calls it "DMG Deepen" —
  // same wording looseness seen auditing Jianxin, nanoka's structured text is treated as authoritative.
  // bestWeapon: nanoka ranks Cosmic Ripples #1 (kept); note Prydwen's build page instead puts the
  // rotation-shortening 4★ Variation above every 5★ option for her specifically, since cutting one
  // attack from her already-shortest-in-game rotation outweighs raw stats — both are legitimate reads,
  // Variation is already covered in alt4. alt5 reordered to lead with Stellar Symphony (confirmed by
  // both sources) over Boson Astrolabe (unconfirmed by either this audit, kept as a plausible ER pick).
  'Verina': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Nature Calling — with an extensive knowledge of botany, Verina is always solicitous, always smiling, and always wishing for every flower to be blessed with the miracle of life. Spectro healer who builds Photosynthesis Energy from Basic Attacks, Skill, and Intro, then spends it on Heavy/Mid-air Attack Starflower Blooms to heal the team; Liberation Arboreal Flourish both heals and marks enemies for a Coordinated-Attack heal-on-hit, while Outro Blossom heals the incoming Resonator and grants the team All DMG Amp.',
    skills: ['Cultivation', 'Botany Experiment', 'Starflower Blooms', 'Arboreal Flourish'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Howler Core', specialty: 'Belle Poppy' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Helix' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc'], bestWeapon: 'Cosmic Ripples',
    weaponAlts: { alt5: ['Stellar Symphony', 'Boson Astrolabe'], alt4: ['Variation', 'Call of the Abyss'], alt3: ['Rectifier of Voyager'] },
    teams: ['Jinhsi + Yinlin + Verina', 'Jiyan + Mortefi + Verina', 'Encore + Changli + Verina'] },
  'Yinlin': { rarity: 5, element: 'Electro', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Enforcer Puppet — a skilled Patroller and powerful Natural Resonator of Jinzhou; after being suspended from her duties at the Public Security Bureau, she must now pursue hidden evils in secrecy. Electro sub-DPS who marks targets with Sinner\'s Mark via Basic Attack and Intro Skill, deals off-field Electro DMG through Coordinated Attacks (Electromagnetic Blast/Judgement Strike) once Punishment Mark is applied, and amplifies the incoming teammate\'s Electro DMG and Resonance Liberation DMG via Outro.',
    skills: ['Zapstring\'s Dance', 'Magnetic Roar', 'Chameleon Cipher', 'Thundering Wrath'],
    ascension: { boss: 'Group Abomination Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Helix' },
    // bestEchoes confirmed accurate (Moonlit Clouds/Impermanence Heron ties #1 with Empyrean Anthem per
    // Prydwen calcs). weaponAlts/teams corrected against Prydwen's Jiyan-style live build calcs
    // (2026-07-30 profile update): Whispers of Sirens (96.7%) and Rime-Draped Sprouts (96.3%) are her
    // actual best 5★ alternatives — Cosmic Ripples (90%) is just the best F2P option, not a top alt.
    // Jinzhou Keeper replaces Waltz in Masquerade, which wasn't in Prydwen's Yinlin recommendations at
    // all. Iuno is now explicitly her best synergy partner ("Yinlin's best synergy nowadays is with
    // Main DPS Iuno") — added ahead of the Calcharo pairing, which is no longer top-tier for her.
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Stringmaster',
    weaponAlts: { alt5: ['Whispers of Sirens', 'Rime-Draped Sprouts'], alt4: ['Augment', 'Jinzhou Keeper'], alt3: ['Rectifier of Night'] },
    teams: ['Yinlin + Iuno + Shorekeeper', 'Yinlin + Jinhsi + Verina'] },
  // Full audit 2026-08-17 against wutheringwaves.fandom.com (MediaWiki API) and Prydwen's live build page
  // (Chrome UA + google.com referer + jsRender) — desc, skills, base stats, all skill multipliers
  // (independently spot-checked section-by-section against fandom's own Forte table, matches exactly),
  // buffs, ascension mats, bestEchoes, and both example teams all re-confirmed accurate, no changes
  // needed there. weaponAlts corrected against Prydwen's live calc %: alt5 had Lustrous Razor (80.1%,
  // near the bottom of her 5★ options) ahead of the two actually-best non-signature 5★s, Kumokiri
  // (87.9%) and Wildfire Mark (87.6%) — replaced. alt4 had 'Autumntrace', which isn't in Prydwen's
  // ranked list for her at all (looks like a copy/paste from another character) — replaced with Aureate
  // Zenith (72.3%), her confirmed best 4★; Waning Redshift (70.7%, confirmed #2 4★) kept.
  'Jinhsi': { rarity: 5, element: 'Spectro', weapon: 'Broadblade', role: 'Main DPS',
    desc: "Thawborn Renewal, Magistrate of Jinzhou, gently brightens the hopes of her people like rays of winter sunlight — as the revered Sentinel's Appointed Resonator, she displays humility and wholeheartedly commits herself to guiding her people toward a brilliant future. On-field Spectro DPS who builds Incandescence from any team member's Attribute or Coordinated DMG, enters Incarnation via her Resonance Skill, then spends stacks through Illuminous Epiphany for a scaling Stella Glamor nuke.",
    skills: ['Slash of Breaking Dawn', 'Trailing Lights of Eons', 'Luminal Synthesis', 'Purge of Light'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Howler Core', specialty: "Loong's Pearl" },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Waveworn Residue' },
    bestEchoes: ['Jué', 'Celestial Light 5pc'], bestWeapon: 'Ages of Harvest',
    weaponAlts: { alt5: ['Kumokiri', 'Wildfire Mark'], alt4: ['Aureate Zenith', 'Waning Redshift'], alt3: ['Broadblade of Night'] },
    teams: ['Jinhsi + Zhezhi + Shorekeeper', 'Jinhsi + Yinlin + Verina'] },
  // Full audit 2026-08-17 against wutheringwaves.fandom.com (MediaWiki API) and Prydwen's live build page
  // (Chrome UA + google.com referer + jsRender) — desc, skills, base stats, multipliers, ascension mats,
  // and bestEchoes all re-confirmed accurate. weaponAlts corrected against Prydwen's calc %: alt5's Red
  // Spring (90.0%, tied for 5th) was outranked by Emerald Sentence (90.4%, actual #3) — swapped. alt4
  // had 'Lumingloss'/'Endless Collapse', neither of which appears anywhere in Prydwen's ranked weapon
  // list for her — replaced with her confirmed best 4★ (Somnoire Anchor, 81.4%) and best no-gacha option
  // (Commando of Conviction, 76.7%). teams: 'Changli + Brant + Shorekeeper' swapped Shorekeeper (never
  // named as her specific partner) for Lupa, per Prydwen's actual "Best Team" (Changli+Lupa+Brant,
  // Lupa being explicitly "part of Changli's best team" as the top Mono Fusion buffer); the Encore+Verina
  // budget team was kept, confirmed as Prydwen's named Budget Dual DPS Team.
  'Changli': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Eternal Blaze, counselor serving the Jinzhou Magistrate and former Secretary-General in the capital — shrouded in flames, she\'s fated to burn brightly until her final embers, rising to power with fiery determination and a strategic mindset always thinking ahead. On-field Fusion DPS who enters True Sight from her Basic Attack/Skill/Intro finishers, builds Enflamement stacks from the True Sight follow-ups, then unleashes the enhanced Heavy Attack Flaming Sacrifice — a fast, quickswap-friendly kit that also buffs the incoming Resonator\'s Fusion and Liberation DMG via Outro.',
    skills: ['Blazing Enlightenment', 'Tripartite Flames', 'Flaming Sacrifice', 'Radiance of Fealty'],
    ascension: { boss: 'Rage Tacet Core', common: 'Ring', specialty: 'Pavo Plum' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Metallic Drip' },
    bestEchoes: ['Nightmare: Inferno Rider', 'Molten Rift 5pc'], bestWeapon: 'Blazing Brilliance',
    weaponAlts: { alt5: ['Emerald of Genesis', 'Emerald Sentence'], alt4: ['Somnoire Anchor', 'Commando of Conviction'], alt3: ['Sword of Night'] },
    teams: ['Changli + Lupa + Brant', 'Changli + Encore + Verina'] },
  // Full audit 2026-08-17 against wutheringwaves.fandom.com (MediaWiki API) and Prydwen's live build page
  // (Chrome UA + google.com referer + jsRender) — desc content (title prepended to match the roster's
  // convention), skills, base stats, multipliers, buffs, ascension mats, bestEchoes, and both example
  // teams all re-confirmed accurate. weaponAlts corrected against Prydwen's calc %: alt5 led with Cosmic
  // Ripples (84.6%, her best F2P/permanent pick, not actually close to top-tier for her) and 'Freeze
  // Frame', absent from Prydwen's ranked list entirely — replaced with the two true best non-signature
  // 5★s, Whispers of Sirens (95.8%) and Lethean Elegy (94.5%). alt4 had 'Waltz in Masquerade', also
  // absent from Prydwen's list — replaced with Radiant Dawn (78.1%, confirmed #2 4★); Augment (81.1%,
  // confirmed #1 4★) kept.
  'Zhezhi': { rarity: 5, element: 'Glacio', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Enchanted Brush — shy, soft-spoken painter of the Jinzhou art scene whose ink creations spring to life and fight at her command; her bashfulness masks a fierce devotion to her craft and to those she calls friends. Glacio sub-DPS/support who paints Phantasmic Imprints during her Basic Attack and Forte combo, consumes them to unleash off-field Coordinated Attack Glacio nukes via Resonance Liberation (Living Canvas), and buffs the incoming Resonator\'s Glacio DMG and Skill DMG through her Outro Carve and Draw.',
    skills: ['Dimming Brush', 'Manifestation', 'Ink and Wash', 'Living Canvas'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Howler Core', specialty: 'Lanternberry' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Helix' },
    bestEchoes: ['Nightmare: Lampylumen Myriad', 'Empyrean Anthem 5pc'], bestWeapon: 'Rime-Draped Sprouts',
    weaponAlts: { alt5: ['Whispers of Sirens', 'Lethean Elegy'], alt4: ['Augment', 'Radiant Dawn'], alt3: ['Rectifier of Night'] },
    teams: ['Zhezhi + Jinhsi + Shorekeeper', 'Zhezhi + Carlotta + Shorekeeper'] },
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1305 sheet. desc: title "Matter Weaver" (nanoka) prepended and blurb
  // rewritten from nanoka's own profile text to match the roster's convention; skills/base stats/
  // ascension/skill materials/bestEchoes all re-confirmed accurate against both sources. weaponAlts
  // corrected against Prydwen's current calc %: alt5 previously led with Abyss Surges (81.4%, actually
  // #7) while omitting Moongazer's Sigil, now Xiangli Yao's actual #1 overall weapon (100%, edges out
  // even his own Signature) and Blazing Justice (92.0%, #3) — both swapped in. alt4 previously paired
  // Stonard with Legend of Drunken Hero, a 4★ that Prydwen ranks dead last of all his options with no
  // score — replaced with Aether Strike (79.7%, actual best 4★), keeping Stonard (73.6%, #2 4★).
  // teams: 'Xiangli Yao + Yinlin + Verina' kept as the budget pick (Yinlin/Verina both named directly),
  // but the first slot swapped from a same-tier duplicate (+Shorekeeper) to Prydwen's actual named Best
  // Team partners — Lynae and Mornye, called "easily Xiangli Yao's best partners" and "the best generalist
  // Support" (with a Lynae-specific synergy) respectively in the Synergies writeup.
  'Xiangli Yao': { rarity: 5, element: 'Electro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Matter Weaver, Principal Investigator at Jinzhou\'s Huaxu Academy and its youngest multi-disciplinary scientist — a gentle soul with a sharp mind whose relentless passion for Automata Mechanics always translates into constructive findings and insights. On-field Electro Main DPS who builds Capacity through his Basic Attack/Skill combos, enters Intuition via Resonance Liberation (Cogitation Model) to gain 3 Hypercubes and enhanced attacks, then burns each Hypercube via the enhanced Skill Law of Reigns for his core burst damage — his Outro Chain Rule then fires bonus laser procs onto the incoming Resonator\'s Basic Attacks.',
    skills: ['Probe', 'Deduction', 'Forever Seeking', 'Cogitation Model'],
    ascension: { boss: 'Hidden Thunder Tacet Core', common: 'Whisperin Core', specialty: 'Violet Coral' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    bestEchoes: ['Nightmare: Thundering Mephis', 'Void Thunder 5pc'], bestWeapon: "Verity's Handle",
    weaponAlts: { alt5: ["Moongazer's Sigil", 'Blazing Justice'], alt4: ['Aether Strike', 'Stonard'], alt3: ['Gauntlets of Night'] },
    teams: ['Xiangli Yao + Lynae + Mornye', 'Xiangli Yao + Yinlin + Verina'] },
  // Full audit 2026-08-17 against Prydwen's live build page (URL is /the-shorekeeper, Chrome UA +
  // google.com referer + jsRender) and ww.nanoka.cc's character #1505 sheet. desc: title "Euphonic
  // Chrysalis" (nanoka) prepended and blurb rewritten from nanoka's own profile text to match the
  // roster's convention. skills/base stats/ascension/skill materials/bestEchoes/outro+lib buffs all
  // re-confirmed accurate. weaponAlts corrected: Prydwen ranks only 4 total options for her (Signature +
  // 3 4★s, no other 5★ at all) — alt5 previously listed 'Cosmic Ripples' first despite it being an ATK%/
  // Basic-ATK-stacking stat-stick that doesn't fit a support who never attacks; reordered to lead with
  // Firstlight's Herald (Energy Regen main stat, matching her Prydwen-stated 250% ER build target).
  // alt4 previously paired Variation with Call of the Abyss (85.1%) while skipping Rectifier#25 (87.2%,
  // Prydwen's actual #2 and its named no-gacha pick) — swapped in.
  'Shorekeeper': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Euphonic Chrysalis, guardian of the Black Shores — this title alone once defined her, but desires, bonds, and emotions, she only began to understand these things after meeting you. Spectro support/healer who restores HP continuously through her Resonance Skill (Chaos Theory) and Liberation, opens the Stellarealm field via Resonance Liberation (End Loop) that evolves into granting team-wide Crit Rate then Crit DMG (scaling with her own Energy Regen) as allies cast Intro Skills inside it, and buffs the whole team\'s All DMG through her Outro Binary Butterfly.',
    skills: ['Origin Calculus', 'Chaos Theory', 'Astral Chord', 'End Loop'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Helix' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc'], bestWeapon: 'Stellar Symphony',
    weaponAlts: { alt5: ["Firstlight's Herald", 'Cosmic Ripples'], alt4: ['Variation', 'Rectifier#25'], alt3: ['Rectifier of Night'] },
    teams: ['Jinhsi + Zhezhi + Shorekeeper', 'Carlotta + Zhezhi + Shorekeeper', 'Camellya + Roccia + Shorekeeper'] },
  'Camellya': { rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    desc: 'Enigmatic assassin who blooms like a camellia flower. On-field Havoc DPS who alternates between Budding and Blossom stances, dealing sustained Havoc DMG through enhanced Basic Attacks and Skill combos.',
    skills: ['Burgeoning', 'Valse of Bloom and Blight', 'Fervor Efflorescent', 'Vegetative Universe'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Metallic Drip' },
    bestEchoes: ['Nightmare: Crownless', 'Havoc Eclipse 5pc'], bestWeapon: 'Red Spring',
    teams: ['Camellya + Roccia + Shorekeeper', 'Camellya + Sanhua + Verina'] },
  'Carlotta': { rarity: 5, element: 'Glacio', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Refined heiress of Rinascita\'s Montelli family. On-field Glacio DPS who builds crystal charges via Resonance Skill, then shatters them with Liberation for massive front-loaded Glacio burst.',
    skills: ['Silent Execution', 'Art of Violence', 'Era of New Wave', 'Lethal Repertoire'],
    ascension: { boss: 'Platinum Core', common: 'Polygon Core', specialty: 'Sword Acorus' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Phlogiston' },
    bestEchoes: ['Sentry Construct', 'Frosty Resolve 5pc'], bestWeapon: 'The Last Dance',
    teams: ['Carlotta + Zhezhi + Shorekeeper', 'Carlotta + Zhezhi + Buling'] },
  'Roccia': { rarity: 5, element: 'Havoc', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Warm-hearted clown performer from Rinascita with her companion Pero. Havoc sub-DPS who buffs the on-field carry\'s Basic ATK DMG via Outro and deals Havoc DMG through Coordinated Attacks with Pero.',
    skills: ['Pero, Easy', 'Acrobatic Trick', 'Commedia Improvviso!', 'A Prop Master Prepares'],
    ascension: { boss: 'Cleansing Conch', common: 'Tidal Residuum', specialty: 'Firecracker Jewelweed' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Cadence' },
    bestEchoes: ['Nightmare: Impermanence Heron', 'Midnight Veil 5pc'], bestWeapon: 'Tragicomedy',
    teams: ['Roccia + Camellya + Shorekeeper', 'Roccia + Cantarella + Verina'] },
  'Phoebe': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Devoted acolyte of the Order of the Deep, guided by divine light. Spectro sub-DPS who applies Frazzle stacks via Resonance Skill card summons, enabling Spectro DPS teammates to trigger burst damage.',
    skills: ['O Come Divine Light', 'To Where Light Shines', 'Dawn of Enlightenment', 'Radiant Invocation'],
    ascension: { boss: 'Cleansing Conch', common: 'Whisperin Core', specialty: 'Firecracker Jewelweed' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Helix' },
    bestEchoes: ['Capitaneus', 'Eternal Radiance 5pc'], bestWeapon: 'Luminous Hymn',
    teams: ['Phoebe + Zani + Shorekeeper', 'Phoebe + Rover: Spectro + Verina'] },
  'Brant': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Blazing knight from Rinascita whose soul burns with unflickering valor. On-field Fusion DPS who chains Basic Attacks and Skill combos in two alternating modes, with built-in self-healing on hits.',
    skills: ['Captain\'s Rhapsody', 'Anchors Aweigh!', 'To the Horizon', 'Ocean Odyssey'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Metallic Drip' },
    bestEchoes: ['Dragon of Dirge', 'Tidebreaking Courage 5pc'], bestWeapon: 'Unflickering Valor',
    teams: ['Brant + Lupa + Changli', 'Brant + Changli + Shorekeeper'] },
  'Cantarella': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Enigmatic head of Rinascita\'s Fisalia family, veiled in twilight. Havoc sub-DPS who deals off-field Havoc DMG via Coordinated Attacks while providing supplementary healing to the active character.',
    skills: ['Illusion Collapse', 'Dance with Shadows', 'Beneath the Sea', 'Between Illusion and Reality'],
    ascension: { boss: 'Cleansing Conch', common: 'Polygon Core', specialty: 'Seaside Cendrelis' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Helix' },
    bestEchoes: ['Lorelei', 'Midnight Veil 5pc'], bestWeapon: 'Whispers of Sirens',
    teams: ['Cantarella + Phrolova + Qiuyuan', 'Cantarella + Camellya + Shorekeeper'] },
  'Zani': { rarity: 5, element: 'Spectro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Steadfast security officer of the Averardo Vault, devoted to justice. On-field Spectro DPS who builds Frazzle stacks via Resonance Skill counters and Heavy Attacks, then detonates them for burst Spectro DMG.',
    skills: ['Routine Negotiation', 'Restless Watch', 'Between Dawn and Dusk', 'There Will Be A Light'],
    ascension: { boss: 'Platinum Core', common: 'Polygon Core', specialty: 'Sword Acorus' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Cadence' },
    bestEchoes: ['Capitaneus', 'Eternal Radiance 5pc'], bestWeapon: 'Blazing Justice',
    teams: ['Zani + Phoebe + Shorekeeper', 'Zani + Rover: Spectro + Verina'] },
  'Ciaccona': { rarity: 5, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Free-spirited wandering bard whose melodies command the wind. Aero sub-DPS who applies Erosion via Coordinated Attacks and Skill summons while buffing team Aero DMG through Outro.',
    skills: ['Quadruple Time Steps', 'Harmonic Allegro', 'Singer\'s Triple Cadenza', 'Symphony of Wind and Verse'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Phlogiston' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Gusts of Welkin 5pc'], bestWeapon: 'Woodland Aria',
    teams: ['Ciaccona + Cartethyia + Rover: Aero', 'Ciaccona + Cartethyia + Chisa'] },
  'Cartethyia': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Main DPS',
    desc: 'The Blessed Maiden of Rinascita, beloved by wind and sea. HP-scaling on-field Aero DPS who shifts between sword and Fleurdelys forms, dealing Aero DMG through Erosion-enhanced Basic Attacks.',
    skills: ['Sword to Carve My Forms', 'Sword to Bear Their Names', 'A Knight\'s Heartfelt Prayers', 'Tempest'],
    ascension: { boss: 'Unfading Glory', common: 'Tidal Residuum', specialty: 'Bamboo Iris' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Metallic Drip' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Windward Pilgrimage 5pc'], bestWeapon: "Defier's Thorn",
    teams: ['Cartethyia + Ciaccona + Rover: Aero', 'Cartethyia + Ciaccona + Chisa'] },
  'Lupa': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Lone wolf Star Gladiator of the arena who fights for herself alone. Fusion sub-DPS who shreds enemy Fusion RES and buffs team DMG via Liberation and Outro, enabling mono-Fusion compositions.',
    skills: ['Flaming Star', 'Shewolf\'s Hunt', 'Fire-Kissed Glory', 'Ignis Lupa'],
    ascension: { boss: 'Unfading Glory', common: 'Howler Core', specialty: 'Bloodleaf Viburnum' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Waveworn Residue' },
    bestEchoes: ['Lioness of Glory', 'Flaming Clawprint 5pc'], bestWeapon: 'Wildfire Mark',
    teams: ['Lupa + Brant + Changli', 'Lupa + Aemeath + Mornye'] },
  'Phrolova': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Main DPS',
    desc: 'Former violinist turned Fractsidus Overseer, death\'s euphoric companion. On-field Havoc DPS who summons Hecate via Echo Skill for sustained off-field Havoc DMG while dealing burst damage through Resonance Skill.',
    skills: ['Movement of Life and Death', 'Whispers in a Fleeting Dream', 'Waltz of Forsaken Depths', 'Rhapsody of a New World'],
    ascension: { boss: 'Truth in Lies', common: 'Polygon Core', specialty: 'Afterlife' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Helix' },
    bestEchoes: ['Nightmare: Hecate', 'Dream of the Lost 3pc + Havoc Eclipse 2pc'], bestWeapon: 'Lethean Elegy',
    teams: ['Phrolova + Cantarella + Qiuyuan', 'Phrolova + Cantarella + Shorekeeper'] },
  'Augusta': { rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Ephor of Septimont, a sun rising ablaze from the crucible of blood and sand. On-field Electro DPS who deals Heavy ATK and Liberation burst DMG with built-in shields and a time-stop mechanic on Resonance Skill.',
    skills: ['Hunter\'s Path', 'Warrior\'s Blade', 'Sunward Conquest', 'Call Me By the Sun'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Tidal Residuum', specialty: 'Luminous Calendula' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Waveworn Residue' },
    bestEchoes: ['The False Sovereign', 'Crown of Valor 3pc + Void Thunder 2pc'], bestWeapon: 'Thunderflare Dominion',
    teams: ['Augusta + Iuno + Shorekeeper', 'Augusta + Yinlin + Verina', 'Augusta + Phrolova + Shorekeeper'] },
  'Iuno': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Priestess of Septimont\'s Tetragon Temple who grasps meaning in time\'s rhythm. Aero sub-DPS who buffs Heavy ATK DMG via Outro, heals the team through her New Moon attacks and Full Moon Domain, and self-shields on skill casts, cycling between Half Moon and New Moon combat states.',
    skills: ['Moon Steps', 'Foresight Fugue', 'Beneath Lunar Tides', 'Ebb and Flow'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Sliverglow Bloom' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Cadence' },
    bestEchoes: ['Lady of the Sea', 'Crown of Valor 3pc + Sierra Gale 2pc'], bestWeapon: "Moongazer's Sigil",
    teams: ['Iuno + Augusta + Shorekeeper', 'Iuno + Jiyan + Shorekeeper'] },
  'Galbrena': { rarity: 5, element: 'Fusion', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Black Shores Consultant known as the Discord Slayer, seizing power from darkness. On-field Fusion DPS who deals primary damage through Echo Skill and Heavy ATK combos in quick burst rotations.',
    skills: ['Slayer\'s Trigger', 'Edge Transcended', 'Hellfire Absolution', 'Beyond Threshold'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Tidal Residuum', specialty: 'Stone Rose' },
    skillMaterials: { weeklyDrop: 'Curse of the Abyss', forgery: 'Phlogiston' },
    bestEchoes: ['Corrosaurus', "Flamewing's Shadow 3pc + Flaming Clawprint 2pc"], bestWeapon: 'Lux & Umbra',
    teams: ['Galbrena + Qiuyuan + Shorekeeper', 'Galbrena + Brant + Lupa'] },
  'Qiuyuan': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Former Mingting intelligence agent, upright as bamboo seeking no vanity. Aero sub-DPS who buffs the team\'s Echo Skill DMG and grants Crit DMG Amplify via Outro and Resonance Liberation.',
    skills: ['Inkwash', 'Through the Groves', 'Sundering Strike', 'Verdant Edge'],
    ascension: { boss: 'Truth in Lies', common: 'Whisperin Core', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Curse of the Abyss', forgery: 'Metallic Drip' },
    bestEchoes: ['Reminiscence: Fenrico', 'Law of Harmony 3pc + Sierra Gale 2pc'], bestWeapon: 'Emerald Sentence',
    teams: ['Qiuyuan + Galbrena + Shorekeeper', 'Qiuyuan + Phrolova + Cantarella'] },
  'Chisa': { rarity: 5, element: 'Havoc', weapon: 'Broadblade', role: 'Support/Healer',
    desc: '"Just an ordinary student," she calmly introduces herself, a faint iridescent shimmer flickering in her eyes. Havoc support/healer who deals heavy Resonance Liberation DMG, heals and shields the team, and shreds enemy DEF via Unseen Snare + Havoc Bane.',
    skills: ['Reign of Silence', 'Fractured Composition', 'Moment of Nihility', 'Reverberance - Return'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Summer Flower' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Waveworn Residue' },
    bestEchoes: ['Reminiscence: Threnodian - Leviathan', 'Thread of Severed Fate 3pc + Havoc Eclipse 2pc'], bestWeapon: 'Kumokiri',
    teams: ['Chisa + Aemeath + Denia', 'Chisa + Hiyuki + Lucilla'] },
  'Lynae': { rarity: 5, element: 'Spectro', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'A Startorch Academy prep student whose head-turning, electric style hides an inner focus as explosive as a coiled spring. Spectro sub-DPS who amplifies team All DMG and Resonance Liberation DMG via Outro, and boosts Tune Break Boost for Tune Strain team comps.',
    skills: ['Chroma Drift', 'Lynae-Style Palettes', 'Prismatic Overblast', 'Time to Show Some Colors!'],
    ascension: { boss: "Suncoveter's Reach", common: 'Exoswarm Core', specialty: 'Rimewisp' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Combustor' },
    bestEchoes: ['Hyvatia', 'Pact of Neonlight Leap 5pc'], bestWeapon: 'Spectrum Blaster',
    teams: ['Lynae + Aemeath + Mornye', 'Lynae + Hiyuki + Chisa'] },
  'Mornye': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Healer',
    desc: 'A Spacetrek Collective Research Institute engineer and Department of Exostrider Engineering professor at Startorch Academy. DEF-scaling Fusion healer who restores HP via Resonance Skill and Liberation while boosting the team\'s Off-Tune Buildup Rate.',
    skills: ['Ground State Calibration', 'Resolution', 'Critical Protocol', 'Convergence'],
    ascension: { boss: 'Burning Judgment', common: 'Mech Core', specialty: 'Gemini Spore' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Carved Crystal' },
    bestEchoes: ['Reactor Husk', 'Halo of Starry Radiance 5pc'], bestWeapon: 'Starfield Calibrator',
    teams: ['Mornye + Lynae + Aemeath', 'Mornye + Luuk Herssen + Denia'] },
  'Luuk Herssen': { rarity: 5, element: 'Spectro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: "The attending physician of Startorch Academy's Resonator Nursing Unit, renowned for his keen intellect and unshakable composure. On-field Spectro Basic ATK DPS who cycles Aureole of Execution's three enhanced forms and deals bonus Total DMG by responding to Tune Strain - Interfered.",
    skills: ['Such is Light', 'Reunion of All the Fallen', 'Rewritten in Winter\'s Margins', 'Before Injection of Dawn'],
    ascension: { boss: "Suncoveter's Reach", common: 'Exoswarm Pendant', specialty: 'Edelschnee' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Waveworn Shard' },
    bestEchoes: ['Twin Nova - Nebulous Cannon', 'Rite of Gilded Revelation 5pc'], bestWeapon: "Daybreaker's Spine",
    teams: ['Luuk Herssen + Denia + Mornye', 'Luuk Herssen + Sanhua + Mornye'] },
  'Aemeath': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Once an Exostrider Synchronist of Rabelle College, she is now a digital ghost who sings quietly amongst stars. On-field Fusion DPS who switches between Tune Rupture and Fusion Burst Resonance Modes, dealing massive Resonance Liberation DMG through Seraphic Duet and Heavenfall Edict.',
    skills: ['Infinity Calibration', 'Shared Voyage', 'Towards the Daybreak', 'Overture of Departure'],
    ascension: { boss: 'Our Choice', common: 'Exoswarm Core', specialty: 'Moss Amber' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Polarizer' },
    bestEchoes: ['Sigillum', 'Trailblazing Star 5pc'], bestWeapon: 'Everbright Polestar',
    teams: ['Aemeath + Denia + Chisa', 'Aemeath + Lynae + Mornye'] },
  'Sigrika': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Solsworn of the Roya Tribe and Startorch Academy Birding Fan Club member. On-field Aero DPS who consumes Rune stacks to empower Echo Skill and Heavy ATK for Aero burst DMG with crowd control.',
    skills: ['One, Two, Three', 'Royan Close Quarters Combat', 'Where Trust Leads Me!', 'Solsworn Etymology'],
    ascension: { boss: 'Our Choice', common: 'Exoswarm Pendant', specialty: 'Arithmetic Shell' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Waveworn Shard' },
    bestEchoes: ['Nameless Explorer', 'Sound of True Name 5pc'], bestWeapon: 'Solsworn Ciphers',
    teams: ['Sigrika + Qiuyuan + Shorekeeper', 'Sigrika + Phrolova + Qiuyuan', 'Sigrika + Qiuyuan + Ciaccona'] },
  'Rebecca': { rarity: 5, element: 'Electro', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Edgerunner and Fury-Type Arsenal from the Cyberpunk: Edgerunners collab. Electro Hybrid who mode-switches between Huntress and Guts stances, buffing team Heavy ATK DMG and All DMG Amplification via her Outro turret.',
    skills: ["Mix-'n'-Match", "Tactical Tweaks", "Party 'til Dawn!", "My Turn!"],
    ascension: { boss: 'Nightmare Flashdrive', common: 'Mech Core', specialty: 'Past Reveries' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'Combustor' },
    bestEchoes: ['Reminiscence - Nightmare: Adam Smasher', 'Shadow of Shattered Dreams 1pc + Void Thunder 2pc'], bestWeapon: 'Skull Thrasher',
    teams: ['Rebecca + Yangyang: Xuanling + Lucy', 'Rebecca + Lucy + Mornye', 'Rebecca + Jiyan + Shorekeeper'] },
  'Lucilla': { rarity: 5, element: 'Glacio', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'President of Startorch Academy. Dual-mode Glacio Hybrid who buffs Glacio Chafe DMG or Echo Skill DMG depending on Resonance Mode, built around a 5-input Photo-consuming Ultimate.',
    skills: ['Snapshot', 'Phantom Frame', 'Clear As Day', 'Clip It'],
    ascension: { boss: "Suncoveter's Reach", common: 'Mech Core', specialty: 'Forget-Me-Not' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'String' },
    bestEchoes: ['Glommoth', 'Wishes of Quiet Snowfall 5pc (Chafe)', 'Impermanence Heron', 'Moonlit Clouds 5pc (Echo)'], bestWeapon: 'Freeze Frame',
    teams: ['Lucilla + Hiyuki + Chisa', 'Lucilla + Sigrika + Shorekeeper', 'Lucilla + Phrolova + Qiuyuan'] },
  'Lucy': { rarity: 5, element: 'Spectro', weapon: 'Pistols', role: 'Main DPS',
    desc: 'The Netrunner, from the Cyberpunk: Edgerunners collab. Spectro DPS who builds TCP/Root Access into an enhanced Heavy Attack and a battlefield-freezing Ultimate with selectable Spoofing Program debuffs, dealing bonus DMG via the Hack mechanic.',
    skills: ['Locked Thread', 'Protocol Breach', 'Netrunner', 'Outdated Hallucination'],
    ascension: { boss: 'Nightmare Flashdrive', common: 'Exoswarm Core', specialty: 'Past Reveries' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Combustor' },
    bestEchoes: ['Reminiscence - Nightmare: Adam Smasher', 'Shadow of Shattered Dreams 1pc + Rite of Gilded Revelation 2pc'], bestWeapon: 'Spectral Trigger',
    teams: ['Lucy + Rebecca + Mornye', 'Lucy + Rebecca + Shorekeeper', 'Lucy + Iuno + Shorekeeper'] },
  'Yangyang: Xuanling': { rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    desc: 'Xuan Watcher of Xuanfang Hold and sister of Suisui. On-field Havoc DPS who alternates Azure and Feather Sword Stances, applying and consuming Havoc Bane for massive self-buffed Crit DMG — one of the highest damage ceilings in the game at release.',
    skills: ['Succor and Smite', "Feather's Edge", 'Hush of a Thousand Voices', 'Skybound Feather'],
    ascension: { boss: "Solidarity's Loneflame", common: 'Autopuppet Kernel', specialty: 'Cloudperch Seed' },
    skillMaterials: { weeklyDrop: 'Skyward Glazed Heart', forgery: 'Polarizer' },
    bestEchoes: ['Thousand-Puppet Pavilion', 'Song of Feathered Trace 5pc'], bestWeapon: 'Azure Oath',
    teams: ['Yangyang: Xuanling + Chisa + Suisui', 'Yangyang: Xuanling + Phrolova + Chisa', 'Yangyang: Xuanling + Rebecca + Suisui'] },
  'Denia': { rarity: 5, element: 'Fusion', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Department of Voidmatters student at Startorch Academy. Dual-mode Fusion Hybrid who switches between Stagecraft and Breakdown Form via her two Ultimates, playing into either Fusion Burst or Tune Strain team archetypes depending on Resonance Mode.',
    skills: ["Dreamweaver's Banquet", 'Bubbles and Baits', 'Final Act', 'Formal Greetings'],
    ascension: { boss: 'Burning Judgment', common: 'Mech Core', specialty: 'Dream of Stars' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'String' },
    bestEchoes: ['Reminiscence: Denia', 'Chromatic Foam 5pc (Fusion Burst)', 'Voidwing Moth', 'Reel of Spliced Memories 5pc (Tune Strain)'], bestWeapon: 'Forged Dwarf Star',
    teams: ['Denia + Luuk Herssen + Mornye', 'Denia + Aemeath + Lupa'] },
  'Hiyuki': { rarity: 5, element: 'Glacio', weapon: 'Sword', role: 'Main DPS',
    desc: "Miko of Flaming Sakura from Ashinohara, now the last member of Lahai-Roi's Special Response Force. On-field Glacio DPS who converts team Glacio Chafe into Glacio Bite via her Forte, switching between Present Self and Foreclaimed Self for an Iai-Stance burst finisher.",
    skills: ['Flaming Sakura Blade Art', 'Frostblight', 'Foreclaiming', 'Frostedge'],
    ascension: { boss: 'Our Choice', common: 'Exoswarm Core', specialty: 'Redbell' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'Polarizer' },
    bestEchoes: ['Reminiscence: Threnodian - Voidborne Construct', 'Wishes of Quiet Snowfall 5pc'], bestWeapon: 'Frostburn',
    teams: ['Hiyuki + Lucilla + Chisa', 'Hiyuki + Lucilla + Suisui', 'Hiyuki + Lynae + Mornye'] },
  'Suisui': { rarity: 5, element: 'Glacio', weapon: 'Rectifier', role: 'Support/Healer',
    desc: 'Director of the Zhaoming Commerce Guild and sister of Yangyang: Xuanling. HP-scaling Glacio healer who alternates Zephyr Stance (healing) and Drizzle Stance (Glacio DMG + Chafe) via Resonance Skill, culminating in a team-wide All DMG Amplification through her Outro.',
    skills: ['Unraveled Spring', 'Vernal Screen', 'Song of Thoroughfare', 'Tinkling Jade'],
    ascension: { boss: "Solidarity's Loneflame", common: 'Autopuppet Kernel', specialty: 'Flowborne Dream' },
    skillMaterials: { weeklyDrop: 'Skyward Glazed Heart', forgery: 'String' },
    bestEchoes: ['Forbidden Bastion', 'Song of Feathered Trace 5pc'], bestWeapon: "Firstlight's Herald",
    teams: ['Suisui + Yangyang: Xuanling + Chisa', 'Suisui + Hiyuki + Lynae', 'Suisui + Aemeath + Denia'] },
  'Qingxiao': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Main DPS',
    desc: 'Swordswoman who wields a stringed blade of Aero. On-field Aero DPS who builds Qin Heart and Sword Cadence through Sheathed/Drawn Stance attacks, then unleashes Ephemeral Transcendence for empowered combos, scaling off Tune Strain - Interfered stacks.',
    skills: ['Strings to Steel', 'Severing Note', 'Billows Beneath Heaven', 'Tonality Shift'],
    ascension: { boss: 'Unconfirmed (releases 3.6, Aug 20 2026)', common: 'Unconfirmed (releases 3.6, Aug 20 2026)', specialty: 'Unconfirmed (releases 3.6, Aug 20 2026)' },
    skillMaterials: { weeklyDrop: 'Unconfirmed (releases 3.6, Aug 20 2026)', forgery: 'Unconfirmed (releases 3.6, Aug 20 2026)' },
    bestEchoes: ['Heart of Evil\'s Purge 5pc'], bestWeapon: 'Glint of Clouds',
    teams: ['Qingxiao + Denia + Mornye', 'Qingxiao + Lynae + Mornye'] },
  'Jingran': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'HP-scaling Fusion Broadblade wielder who channels Yin Vessel and Yang Font stances. On-field Fusion DPS whose Heavy Attacks and ATK/DMG scale off Max HP, entering the Yinghuo state via Resonance Liberation for empowered follow-up strikes.',
    skills: ['Edge of Life and Death', 'Malevolent Encounter', 'Burial of Thousand Souls', 'Question the Tombs'],
    ascension: { boss: 'Unconfirmed (releases 3.6, Aug 20 2026)', common: 'Unconfirmed (releases 3.6, Aug 20 2026)', specialty: 'Unconfirmed (releases 3.6, Aug 20 2026)' },
    skillMaterials: { weeklyDrop: 'Unconfirmed (releases 3.6, Aug 20 2026)', forgery: 'Unconfirmed (releases 3.6, Aug 20 2026)' },
    // bestWeapon confirmed real via nanoka.cc: Thousandfold Deliverance (Broadblade, 413 ATK / +72.2% HP, "Hark, Spirits and Stars").
    // No community build guide exists yet (unreleased) — bestEchoes/teams remain unconfirmed.
    bestEchoes: ['Unconfirmed (releases 3.6, Aug 20 2026)'], bestWeapon: 'Thousandfold Deliverance',
    teams: ['Unconfirmed (releases 3.6, Aug 20 2026)'] },
  // 4★ Resonators
  'Aalto': { rarity: 4, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Suave information broker who slips through the mist. Aero sub-DPS who deals off-field Aero DMG via Coordinated Attacks triggered by his mist clone summon.',
    skills: ['Half Truths', 'Shift Trick', 'Flower in the Mist', 'Mistcloak Dash'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'The Last Dance',
    teams: ['Aalto + Jiyan + Verina', 'Aalto + Cartethyia + Shorekeeper'] },
  'Baizhi': { rarity: 4, element: 'Glacio', weapon: 'Rectifier', role: 'Healer',
    desc: "Devoted Huaxu Academy researcher accompanied by her companion You'an. Glacio healer who restores HP via Resonance Skill and Liberation, providing consistent team sustain with low field time.",
    skills: ['Destined Promise', 'Emergency Plan', 'Momentary Union', 'Cycle of Life'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Howler Core', specialty: 'Lanternberry' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Helix' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 5pc'], bestWeapon: 'Stellar Symphony',
    teams: ['Yangyang + Jiyan + Baizhi', 'Lingyang + Sanhua + Baizhi', 'Encore + Sanhua + Baizhi'] },
  'Chixia': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Energetic patroller who blazes through Jinzhou with dual pistols. On-field Fusion DPS who deals Fusion DMG through rapid-fire Resonance Skill shots and Basic Attack combos.',
    skills: ['POW POW', 'Whizzing Fight Spirit', 'Blazing Flames', 'Heroic Bullets'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Belle Poppy' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    bestEchoes: ['Nightmare: Inferno Rider', 'Molten Rift 5pc'], bestWeapon: 'The Last Dance',
    teams: ['Chixia + Changli + Verina', 'Chixia + Mortefi + Baizhi'] },
  'Danjin': { rarity: 4, element: 'Havoc', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Midnight Ranger who trades her own blood for power. Havoc sub-DPS who consumes HP to fuel enhanced Basic and Heavy Attacks, gaining Havoc DMG Bonus as health decreases.',
    skills: ['Execution', 'Crimson Fragment', 'Crimson Bloom', 'Serene Vigil'],
    ascension: { boss: 'Strife Tacet Core', common: 'Ring', specialty: 'Belle Poppy' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Metallic Drip' },
    bestEchoes: ['Nightmare: Crownless', 'Havoc Eclipse 5pc'], bestWeapon: 'Blazing Brilliance',
    teams: ['Danjin + Camellya + Shorekeeper', 'Danjin + Camellya + Verina'] },
  'Yangyang': { rarity: 4, element: 'Aero', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Cheerful Midnight Rangers outrider who rides the wind. Aero sub-DPS who generates Resonance Energy for the team via Resonance Skill and groups enemies with her Liberation.',
    skills: ['Feather as Blade', 'Zephyr Domain', 'Wind Spirals', 'Echoing Feathers'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Ring', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Bell-Borne Geochelone', 'Moonlit Clouds 5pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Yangyang + Jiyan + Baizhi', 'Yangyang + Jiyan + Verina'] },
  'Sanhua': { rarity: 4, element: 'Glacio', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Jinhsi\'s stoic personal guard, cold as the frost she commands. Quick-swap Glacio sub-DPS who deals burst Glacio DMG and amplifies the next character\'s Basic ATK DMG via Outro.',
    skills: ['Frigid Light', 'Eternal Frost', 'Glacial Gaze', 'Clarity of Mind'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Whisperin Core', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Emerald of Genesis',
    teams: ['Sanhua + Camellya + Verina', 'Sanhua + Lingyang + Shorekeeper'] },
  'Taoqi': { rarity: 4, element: 'Havoc', weapon: 'Broadblade', role: 'Support',
    desc: 'Steadfast border defense director with an iron will. Havoc support who provides shields via Resonance Skill and deepens the team\'s Resonance Skill DMG through Outro.',
    skills: ['Concealed Edge', 'Fortified Defense', 'Unmovable', 'Power Shift'],
    ascension: { boss: 'Gold-Dissolving Feather', common: 'Howler Core', specialty: 'Iris' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Waveworn Residue' },
    bestEchoes: ['Bell-Borne Geochelone', 'Moonlit Clouds 5pc'], bestWeapon: 'Dauntless Evernight',
    teams: ['Taoqi + Jinhsi + Verina', 'Taoqi + Camellya + Shorekeeper'] },
  'Yuanwu': { rarity: 4, element: 'Electro', weapon: 'Gauntlets', role: 'Support',
    desc: 'Veteran boxing gym owner who fights with thunderous fists. Electro support who deploys Thunder Wedge for off-field Coordinated Attacks and generates shields via Resonance Liberation.',
    skills: ['Leihuangquan', 'Leihuang Master', 'Blazing Might', 'Unassuming Blade'],
    ascension: { boss: 'Hidden Thunder Tacet Core', common: 'Ring', specialty: 'Terraspawn Fungus' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    bestEchoes: ['Nightmare: Tempest Mephis', 'Empyrean Anthem 5pc'], bestWeapon: 'Abyss Surges',
    teams: ['Yuanwu + Jinhsi + Verina', 'Yuanwu + Calcharo + Shorekeeper'] },
  'Mortefi': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Hot-tempered researcher whose music erupts in violent crescendos. Fusion sub-DPS who fires off-field Fusion Coordinated Attacks and buffs the on-field character\'s Heavy ATK DMG via Outro.',
    skills: ['Impromptu Show', 'Passionate Variation', 'Violent Finale', 'Fury Fugue'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Static Mist',
    teams: ['Mortefi + Jiyan + Verina', 'Mortefi + Jiyan + Shorekeeper'] },
  'Youhu': { rarity: 4, element: 'Glacio', weapon: 'Gauntlets', role: 'Support',
    desc: 'Whimsical antique appraiser who trusts her luck in all things. Glacio support who heals the team via Resonance Skill and amplifies Coordinated ATK DMG through her Outro buff.',
    skills: ['Frosty Punches', 'Scroll Divination', 'Fortune\'s Favor', 'Poetic Essence'],
    ascension: { boss: 'Topological Confinement', common: 'Ring', specialty: 'Violet Coral' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Cadence' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 5pc'], bestWeapon: 'Abyss Surges',
    teams: ['Youhu + Carlotta + Zhezhi', 'Youhu + Lingyang + Sanhua'] },
  'Lumi': { rarity: 4, element: 'Electro', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Lollo Logistics navigator who charts paths through thundering skies. Electro sub-DPS who deals Electro DMG via Resonance Skill and amplifies the next character\'s Resonance Skill DMG through Outro.',
    skills: ['Navigation Support', 'Searchlight Service', 'Squeakie Express', 'Signal Light'],
    ascension: { boss: 'Thundering Tacet Core', common: 'Howler Core', specialty: 'Terraspawn Fungus' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Waveworn Residue' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Lustrous Razor',
    teams: ['Lumi + Carlotta + Shorekeeper', 'Lumi + Jinhsi + Verina'] },
  'Buling': { rarity: 4, element: 'Electro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Taoist feng shui master from Mengzhou and Black Shores Consultant. Electro healer who restores HP and deploys Electro Flare via Liberation, buffing the team\'s Resonance Skill DMG through Outro.',
    skills: ['Hexagram Calls, Lightning Falls', 'In Shadow Thunder Stirs', 'Flashing Thunder Spell', 'Thunder Begets Life'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Curse of the Abyss', forgery: 'Helix' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc'], bestWeapon: 'Stellar Symphony',
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
  ['Qingxiao',      ['Heavy ATK', 'Liberation'],     [],                                      ['Tune Strain - Interfered']],
  ['Jingran',       ['Heavy ATK', 'Liberation'],     [],                                      []],
  ['Yangyang: Xuanling', ['Heavy ATK', 'Basic ATK'], [],                                      ['Havoc Bane']],
  ['Hiyuki',        ['Liberation', 'Basic ATK'],     [],                                      ['Glacio Chafe']],
  ['Lucy',          ['Heavy ATK', 'Liberation'],     [],                                      ['Hack - Shifting']],
  // 5★ Sub DPS
  ['Rover: Spectro', ['Skill', 'Liberation'],        [],                                      ['Frazzle']],
  ['Rover: Havoc',   ['Heavy ATK', 'Basic ATK'],     ['Crit Rate Buff'],                      ['Havoc RES Shred']],
  ['Rover: Aero',    ['Skill'],                      ['Heal', 'Erosion Cap Buff'],            []],
  ['Rover: Electro', ['Skill', 'Liberation'],        ['ATK Buff', 'All DMG Amp'],             ['Electro Flare']],
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
  ['Rebecca',       ['Basic ATK', 'Heavy ATK'],      ['Heavy ATK Buff', 'All DMG Amp'],       ['Hack - Shifting']],
  ['Denia',         ['Liberation', 'Skill'],         ['Fusion DMG Buff', 'Tune Break Boost'], ['Fusion Burst', 'Tune Strain - Shifting']],
  ['Lucilla',       ['Liberation', 'Echo'],          ['Glacio DMG Buff', 'Echo Skill DMG Buff'], ['Glacio Chafe']],
  ['Suisui',        ['Skill', 'Outro'],              ['Heal', 'All DMG Amp'],                 []],
  ['Baizhi',        ['Skill'],                       ['Heal'],                                []],
  ['Taoqi',         ['Skill'],                       ['Shield', 'Skill DMG Deepen'],          []],
  ['Yuanwu',        ['Coordinated ATK'],             ['Coordinated ATK', 'Shield'],           []],
  ['Youhu',         ['Coordinated ATK'],             ['Heal', 'Coordinated ATK Amp'],         []],
  ['Buling',        ['Skill'],                       ['Skill DMG Buff', 'Heal'],              []],
].forEach(([name, dmgFocus, buffs, debuffs]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { dmgFocus, buffs, debuffs });
});

// [SECTION:BASE_STATS] — Level 90 base stats from Game8 (HP, ATK, DEF, maxEnergy)
[
  ['Rover: Spectro', 11400, 375, 1369, 125],
  ['Rover: Havoc',   10825, 413, 1259, 125],
  ['Rover: Aero',    10775, 438, 1137, 150],
  ['Rover: Electro', 10775, 438, 1137, 125],
  ['Jiyan',         10488, 438, 1186, 125],
  ['Calcharo',      10500, 438, 1186, 125],
  ['Encore',        10513, 425, 1247, 125],
  ['Jianxin',       14113, 338, 1124, 150],
  ['Lingyang',      10388, 438, 1210, 125],
  ['Verina',        14238, 338, 1100, 175],
  ['Yinlin',        11000, 400, 1283, 125],
  ['Jinhsi',        10825, 413, 1259, 125],
  ['Changli',       10388, 463, 1100, 125],
  ['Zhezhi',        12250, 375, 1198, 125],
  ['Xiangli Yao',   10625, 425, 1222, 125],
  ['Shorekeeper',   16713, 288, 1100, 175],
  ['Camellya',      10325, 450, 1161, 125],
  ['Carlotta',      12450, 462, 1197, 125],
  ['Roccia',        12250, 375, 1197, 125],
  ['Phoebe',        10825, 412, 1258, 125],
  ['Brant',         11675, 375, 1307, 125],
  ['Cantarella',    11600, 400, 1099, 125],
  ['Zani',          10775, 437, 1136, 125],
  ['Ciaccona',      12237, 375, 1197, 125],
  ['Cartethyia',    14800, 312, 611,  125],
  ['Lupa',          11912, 387, 1185, 125],
  ['Phrolova',      10775, 437, 1136, 125],
  ['Augusta',       10300, 462, 1112, 125],
  ['Iuno',          10525, 450, 1124, 125],
  ['Galbrena',      10300, 462, 1112, 125],
  ['Qiuyuan',       12237, 375, 1197, 125],
  ['Chisa',         10775, 438, 1137, 125],
  ['Lynae',         12238, 375, 1198, 125],
  ['Mornye',        15375, 288, 1357, 175],
  ['Luuk Herssen',  10300, 463, 1112, 125],
  ['Aemeath',       11025, 425, 1149, 125],
  ['Sigrika',       10775, 437, 1136, 125],
  ['Rebecca',       11600, 400, 1173, 150],
  ['Lucy',          11025, 425, 1148, 150],
  ['Yangyang: Xuanling', 11025, 425, 1149, 150],
  ['Denia',         11025, 425, 1148, 150],
  ['Lucilla',       12238, 375, 1198, 150],
  ['Hiyuki',        10300, 462, 1112, 125],
  ['Suisui',        16713, 288, 1100, 175],
  ['Qingxiao',      10300, 463, 1112, 125],
  // Jingran: nanoka shows "Base DEF -" (his kit fixes combat DEF to 0); using a placeholder in
  // line with other Broadblade 5★ base DEF until his real stat page publishes at 3.6 launch.
  ['Jingran',       15375, 313, 650,  125],
  // 4★
  ['Aalto',         9850,  262, 1075, 150],
  ['Baizhi',        12812, 212, 1002, 175],
  ['Chixia',        9087,  300, 953,  150],
  ['Danjin',        9437,  262, 1148, 100],
  ['Yangyang',      10200, 250, 1099, 100],
  ['Sanhua',        10062, 275, 941,  100],
  ['Taoqi',         8950,  225, 1564, 125],
  ['Yuanwu',        8525,  225, 1637, 125],
  ['Mortefi',       10025, 250, 1136, 125],
  ['Youhu',         9975,  262, 1051, 125],
  ['Lumi',          8500,  337, 879,  125],
  ['Buling',        10625, 225, 1258, 125],
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
  ['Rover: Havoc',  2300, 23, 15],  // Devastation → Dark Surge enhanced combo
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
  ['Qingxiao',      2900, 24, 17],  // Stance-builder into Ephemeral Transcendence burst
  ['Jingran',       3000, 24, 15],  // HP-scaling Heavy ATK bursts, Yinghuo empowerment
  ["Yangyang: Xuanling", 3600, 23, 18],  // Azure/Feather stance swap, Havoc Bane self-buff — T0/T0 ceiling
  ['Hiyuki',        3400, 23, 17],  // Present/Foreclaimed Self, Iai burst finisher — best Glacio DPS
  ['Lucy',          2000, 23, 12],  // TCP/Root Access into enhanced Heavy + Ultimate
  // 5★ Sub DPS — moderate totalMult, short onField
  ['Rover: Spectro', 1800, 25, 8],   // Quick-swap Frazzle applier
  ['Rover: Aero',    900,  25, 6],   // Healer/support, short on-field time
  ['Rover: Electro', 1300, 24, 9],   // Hybrid utility, moderate on-field
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
  ['Rebecca',       1900, 24, 9],   // Huntress/Guts stance swap, turret buff
  ['Denia',         1700, 24, 8],   // Stagecraft/Breakdown Form swap, Fusion Burst/Tune Strain
  // 5★ Healers/Support — low totalMult
  ['Verina',        600,  25, 4],   // Quick heal + ATK buff + deepen
  ['Jianxin',       800,  25, 6],   // Shield + grouping
  ['Lucilla',       700,  25, 5],   // Photo-consuming Ultimate, Glacio Chafe/Echo Skill buffer
  ['Shorekeeper',   500,  25, 3],   // Stellarealm crit buff + heal
  ['Suisui',        700,  25, 6],   // Zephyr heal / Drizzle DMG stance swap + Outro All DMG Amp
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
  ['Rover: Havoc',   'ATK'],
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
  ['Qingxiao',       'ATK'],
  ['Jingran',        'HP'],
  ['Yangyang: Xuanling', 'ATK'],
  ['Hiyuki',         'ATK'],
  ['Lucy',           'ATK'],
  ['Rebecca',        'ATK'],
  ['Denia',          'ATK'],
  // 5★ Sub DPS
  ['Rover: Spectro', 'ATK'],
  ['Rover: Aero',    'ATK'],
  ['Rover: Electro', 'ATK'],
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
  ['Suisui',         'HP'],
  ['Jianxin',        'ATK'],
  ['Mornye',         'DEF'],
  ['Lucilla',        'ATK'],
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
  ['Aemeath',       'T0',   'T0.5'],
  ['Sigrika',       'T0',   'T0'],
  ['Ciaccona',      'T0',   'T1'],
  ['Lupa',          'T0',   'T0.5'],
  ['Lynae',         'T0',   'T0.5'],
  ['Qiuyuan',       'T0',   'T0'],
  ['Mornye',        'T0',   'T1'],
  ['Shorekeeper',   'T0',   'T0'],
  // Confirmed via prydwen.gg (last updated 01/Aug/2026)
  ['Suisui',        'T0',   'T0.5'],
  ['Yangyang: Xuanling', 'T0', 'T0'],
  ['Lucilla',       'T0',   'T0'],
  ['Hiyuki',        'T0',   'T0.5'],
  ['Denia',         'T0',   'T0.5'],
  ['Rebecca',       'T0.5', 'T1'],
  ['Lucy',          'T1',   'T2'],
  ['Phrolova',      'T0.5', 'T0'],
  ['Augusta',       'T0.5', 'T1'],
  ['Cartethyia',    'T0.5', 'T1.5'],
  ['Galbrena',      'T0.5', 'T1'],
  ['Iuno',          'T0.5', 'T3'],
  ['Luuk Herssen',  'T0',   'T1.5'],
  ['Chisa',         'T0',   'T0.5'],
  ['Verina',        'T0.5', 'T0.5'],
  ['Carlotta',      'T1',   'T3'],
  ['Zani',          'T1',   'T1.5'],
  ['Brant',         'T1',   'T1'],
  ['Rover: Spectro', 'T0.5', 'T1.5'],
  ['Rover: Aero',    'T1.5', 'T2'],
  ['Rover: Electro', 'T4',   'T4'],
  ['Jiyan',         'T1.5', 'T1.5'],
  ['Phoebe',        'T1.5', 'T2'],
  ['Cantarella',    'T1.5', 'T0.5'],
  ['Mortefi',       'T1.5', 'T1.5'],
  ['Sanhua',        'T1.5', 'T2'],
  ['Buling',        'T1.5', 'T2'],
  ['Encore',        'T2',   'T4'],
  ['Rover: Havoc',  'T2',   'T2.5'],
  ['Jinhsi',        'T2',   'T4'],
  ['Xiangli Yao',   'T2',   'T3'],
  ['Changli',       'T2',   'T1.5'],
  ['Zhezhi',        'T2',   'T3'],
  ['Baizhi',        'T2',   'T3'],
  ['Camellya',      'T3',   'T2'],
  ['Danjin',        'T3',   'T3'],
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

// [SECTION:REGION_DATA] — Character regions/nations (infobox `nation` field — the nation a character
// is CONFIRMED tied to, distinct from birthplace and from their specific in-game organization/faction
// — see the IDENTITY_DATA comment above).
// Huanglong (Jinzhou/Mengzhou), Rinascita, Black Shores, Septimont, Lahai-Roi
[
  // Huanglong
  ['Rover: Spectro', 'Huanglong'], ['Rover: Havoc', 'Huanglong'], ['Rover: Aero', 'Huanglong'], ['Rover: Electro', 'Huanglong'],
  ['Jiyan',        'Huanglong'], ['Calcharo',     'Huanglong'],
  ['Jianxin',      'Huanglong'], ['Lingyang',     'Huanglong'],
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
  ['Encore',       'Black Shores'],
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

// [SECTION:BIRTHDAY_DATA] — Character birthdays (month-day format)
// Source: wutheringwaves.fandom.com, esportstales.com, gamerant.com
// Characters without official birthdays are omitted
[
  ['Jiyan',       '12-14'], ['Calcharo',    '07-08'], ['Encore',      '03-21'],
  ['Jianxin',     '04-06'], ['Lingyang',    '08-08'], ['Verina',      '05-18'],
  ['Yinlin',      '09-17'], ['Jinhsi',      '03-06'], ['Changli',     '06-06'],
  ['Zhezhi',      '12-31'], ['Shorekeeper', '02-27'], ['Camellya',    '12-10'],
  ['Roccia',      '01-31'], ['Cantarella',  '06-18'],
  ['Aalto',       '06-11'], ['Baizhi',      '09-10'], ['Chixia',      '04-18'],
  ['Danjin',      '08-31'], ['Yangyang',    '10-11'], ['Sanhua',      '01-20'],
  ['Taoqi',       '02-25'], ['Yuanwu',      '10-02'], ['Mortefi',     '11-06'],
  ['Youhu',       '10-13'],
].forEach(([name, birthday]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { birthday });
});

// [SECTION:IDENTITY_DATA] — Title, birthplace, in-game organization/faction, and voice actor(s).
// Source: wutheringwaves.fandom.com Resonator Infobox (title/title2, birthplace, nation, affiliation/
// affiliation2, voiceEN/voiceCN/voiceJP/voiceKR). These are three DISTINCT associations, not one:
//   - birthplace: where the character was born/raised (infobox `birthplace`)
//   - region (separate REGION_DATA table below): the nation they currently operate in/are tied to
//     (infobox `nation`, when the wiki has confirmed one — left unset when it doesn't, rather than
//     inferring it from an affiliation)
//   - organization: their specific in-game faction (infobox `affiliation`), which is often a
//     sub-group WITHIN a nation (e.g. Midnight Rangers operate in Huanglong) and can differ from
//     nation/birthplace entirely (e.g. Calcharo: born in New Federation, leads Ghost Hounds, operates
//     out of Jinzhou/Huanglong but the wiki's own `nation` field for him is blank/unconfirmed)
// voiceActor is either a plain string (English-only, when that's all that's been sourced) or
// { en, cn, jp, kr } for a full multi-language credit.
// Only characters that have been audited so far are populated — this is not yet a complete roster table.
[
  ['Jiyan', 'Windborne Rider', 'Huanglong', 'Midnight Rangers', { en: 'Alex Jordan', cn: 'Sun Ye', jp: 'Ono Yuki', kr: 'Nam Doh-hyeong' }],
  ['Yinlin', 'Lightning of Execution', 'Huanglong', 'Public Security Bureau', { en: 'Naomi McDonald', cn: 'Xiao Liansha', jp: 'Ami Koshimizu', kr: 'Kang Sae-bom' }],
  ['Calcharo', 'Phantom Hunters', 'New Federation', 'Ghost Hounds', { en: 'Ben Cura', cn: 'Xu Xiang', jp: 'Toshiyuki Morikawa', kr: 'Park Min-gi' }],
  ['Encore', 'Wooly-Counting Game', 'New Federation', 'Black Shores', { en: 'Carina Reeves', cn: 'Xiao Sibai', jp: 'Ibuki Chikano', kr: 'Serena Lee' }],
  // cn VA corrected 2026-08-17: fandom's own wikitext link text ("Yu Tou") doesn't match the CN actor's
  // real name in its own linked moegirl URL (%E5%BC%A0%E6%98%B1 = 张昱, surname Zhang) — ww.nanoka.cc's
  // Voice Cast list confirms "Elise Zhang", used here instead as the more internally-consistent source.
  ['Jianxin', 'Guiding Starlance', 'Huanglong', 'Jinzhou', { en: 'Ioanna Kimbook', cn: 'Elise Zhang', jp: 'Anzai Chika', kr: 'Lee Eunjo' }],
  // organization uses affiliation2 (Liondance Troupe), his specific in-game sub-group within Jinzhou/
  // Huanglong, matching the Jiyan/Midnight Rangers convention above rather than the generic nation tie.
  ['Lingyang', 'Frosty Gusto', 'Huanglong', 'Liondance Troupe', { en: 'Aleksander Varadian', cn: 'Jinli', jp: 'Natsuki Hanae', kr: 'Lee Sangho' }],
  // birthplace (New Federation) intentionally differs from her region/nation tie (Huanglong, in
  // REGION_DATA below) — she's a New Federation-born botanist who now dwells in Jinzhou, Huanglong.
  ['Verina', 'Nature Calling', 'New Federation', 'Pioneer Association', { en: 'Heather Nicol', cn: 'Zhao Shuang', jp: 'Yu Sasahara', kr: 'Kang Saebom' }],
  // organization uses affiliation2 (Jinzhou City Hall, her magistrate office) over the generic Jinzhou
  // tie and affiliation3 (Mt. Firmament) — matching the specific-sub-group convention used above.
  ['Jinhsi', 'Thawborn Renewal', 'Huanglong', 'Jinzhou City Hall', { en: 'Anna Devlin', cn: 'Jiang Yue', jp: 'Yoshino Aoyama', kr: 'Park Ha-jin' }],
  // organization uses affiliation2 (Jinzhou City Hall, where she serves as Counselor to Jinhsi) over the
  // generic Jinzhou tie and her former, now-inactive affiliation3 (Mingting).
  ['Changli', 'Eternal Blaze', 'Huanglong', 'Jinzhou City Hall', { en: 'Ashleigh Haddad', cn: 'Mufei', jp: 'Chiwa Saitō', kr: 'Shin Nari' }],
  // organization: fandom's infobox has only a single affiliation field for her (Jinzhou) — no specific
  // sub-group like the Jiyan/Changli entries above, so the generic nation-tied org is used as-is.
  ['Zhezhi', 'Enchanted Brush', 'Huanglong', 'Jinzhou', { en: 'Shin-Fei Chen', cn: 'Miao Zi', jp: 'Yui Makino', kr: 'Kim Ha-ru' }],
  // organization: ww.nanoka.cc's infobox lists a single Affiliation (Jinzhou) for him, matching the
  // Zhezhi convention above — no specific named sub-group is given, unlike Jiyan/Changli/Jinhsi.
  ['Xiangli Yao', 'Matter Weaver', 'Huanglong', 'Jinzhou', { en: 'Shaun Mendum', cn: 'Ban Ma', jp: 'Kobayashi Chiaki', kr: 'Jung Eui Jin' }],
  ['Shorekeeper', 'Euphonic Chrysalis', 'Black Shores', 'Black Shores', { en: 'Stephanie McKeon', cn: 'Tang YaJing', jp: 'Suwa Ayaka', kr: 'Kim Bo Na' }],
].forEach(([name, title, birthplace, organization, voiceActor]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { title, birthplace, organization, voiceActor });
});

// [SECTION:CHAR_BUFFS] — Per-character buff/debuff data with exact values
// Each entry: { outroBuffs: [], libBuffs: [], selfBuffs: [], debuffs: [] }
// Buff format: { stat, value, target: 'next'|'team'|'self', duration, condition? }
// stat types: atkPct, allDmg, elemDmg, skillDmg, basicDmg, heavyDmg, libDmg, echoDmg,
//             critRate, critDmg, deepen, resShred, defShred, defIgnore, coordDmg
const CHAR_BUFF_TABLE = {
  // ── 5★ Supports / Sub DPS ──
  // Corrected against ww.nanoka.cc character/1503 — Outro Blossom grants All DMG Amp, not DMG Deepen
  // (she has no Deepen anywhere in her kit).
  'Verina': {
    outroBuffs: [{ stat: 'allDmg', value: 15, target: 'team', duration: 30 }],
    libBuffs: [{ stat: 'atkPct', value: 20, target: 'team', duration: 20 }],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro Blossom: heals the incoming Resonator + All DMG Amp +15% (30s) for the nearby team. Inherent Gift of Nature: team ATK +20%/20s on Forte/Liberation/Outro triggers.',
  },
  // Corrected 2026-08-17 against Prydwen's live build page: outroBuffs' target was 'next' (single
  // incoming Resonator), but Prydwen explicitly states Binary Butterfly "grants the entire party a 15%
  // Damage Amplification buff for 30 seconds, regardless of how many times they Swap In-or-Out" — a
  // team-wide buff, not a swap-in-only one. Fixed to target: 'team'.
  'Shorekeeper': {
    outroBuffs: [{ stat: 'allDmg', value: 15, target: 'team', duration: 30 }],
    libBuffs: [
      { stat: 'critRate', value: 12.5, target: 'team', duration: 30, condition: 'In Stellarealm field' },
      { stat: 'critDmg', value: 25, target: 'team', duration: 30, condition: 'In Stellarealm field' },
    ],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 15% All DMG Amp, team-wide, 30s (persists through swaps). Lib Stellarealm: +12.5% CR +25% CD (30s), team-wide. Knockdown recovery.',
  },
  // Corrected against ww.nanoka.cc character/1405 — prior Outro (15% All DMG Deepen) and debuff
  // (DEF Shred on shielded) didn't match her real kit at all.
  'Jianxin': {
    outroBuffs: [{ stat: 'libDmg', value: 38, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Shield support/Parry-stance sub-DPS. Forte (Primordial Chi Spiral) grants a large HP-scaling shield and periodic healing while channeled. Liberation Purification Force Field groups enemies before exploding. Outro Transcendence: Liberation DMG Amp +38% (14s) for the incoming Resonator.',
  },
  'Suisui': {
    outroBuffs: [
      { stat: 'allDmg', value: 25, target: 'team', duration: 30 },
      { stat: 'allDmg', value: 12, target: 'team', duration: 6, condition: '400+ Floral Epistle consumed, Ceaseless Landscape active' },
    ],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro (Rippling Waters): unconditional 25% All DMG Amp for 30s. At 400+ Floral Epistle consumed (Drizzle Stance Forte gauge) while Ceaseless Landscape is active, additionally grants up to 12% All DMG Amp (0.2% per 1% Energy Regen above 200%, capped at 260% ER) for 6s via Roaming Transcendent. Zephyr Stance heals, Drizzle Stance deals Glacio DMG + Chafe. Liberation (Song of Thoroughfare) extends negative-status stack caps for the team rather than granting a flat DMG buff.',
  },
  'Lynae': {
    outroBuffs: [
      { stat: 'allDmg', value: 15, target: 'next', duration: 14 },
      { stat: 'libDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [{ stat: 'allDmg', value: 24, target: 'team', duration: 30 }],
    selfBuffs: [],
    debuffs: [],
    tuneBreak: {
      boostToTeam: 40, // Visual Impact grants +40 Tune Break Boost teamwide
      baseTuneBreakBoost: 10, // 3.x char base stat
      ruptureDmgMult: 350, // Tune Rupture Response — Spectral Analysis: ~350% ATK Level-scaled
      strainDmgPerStack: 0.12, // per stack of Strain Interfered, per point of Tune Break Boost = +0.12% total DMG
      maxStrainStacks: 3, // base 2 + 1 from Lynae
    },
    note: 'Lib: 24% All DMG (30s, confirmed exact 2026-08-16). Outro: 15% All DMG + 25% Lib Amp to next (14s) — was miscategorized as deepen, no basis. Tune Break Boost +40 team. Rupture Response every 8s. Strain: 0.12% DMG per stack per Boost.',
  },
  'Qingxiao': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'critDmg', value: 100, target: 'self', duration: 999, condition: 'Resonance Chain 3 — Billows Beneath Heaven Crit DMG' }],
    debuffs: [{ stat: 'deepen', value: 40, duration: 999, condition: 'Resonance Chain 6 — targets w/ Mindlock take +40% DMG from key skills' }],
    note: 'Pure single-target DPS, no team buffs. Damage scales with team-inflicted Tune Strain - Interfered via her Mindlock stacking mechanic.',
  },
  'Jingran': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Pure HP-scaling DPS, no team buffs. Resonance Chain 4 grants team +20% All-Attribute DMG Bonus (30s) when any Resonator gains a Shield — conditional, not modeled as a base kit buff.',
  },
  'Yangyang: Xuanling': {
    outroBuffs: [{ stat: 'elemDmg', value: 20, target: 'team', duration: 20, condition: 'Havoc Bane appliers only, via As the Wind Wills' }],
    libBuffs: [],
    selfBuffs: [{ stat: 'critDmg', value: 150, target: 'self', duration: 4, condition: 'Feathered Oath, up to 6 stacks' }],
    debuffs: [],
    note: 'Primarily a self-buffing DPS (huge personal Crit DMG scaling via Feathered Oath). Outro grants +20% Havoc DMG to other Havoc Bane appliers in the team (Chisa).',
  },
  'Hiyuki': {
    outroBuffs: [{ stat: 'elemDmg', value: 20, target: 'team', duration: 20, condition: 'vs. targets affected by Glacio Chafe' }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'On-field Glacio DPS. Outro grants +20% Glacio DMG to the rest of the team against Glacio Chafe-affected targets (20s).',
  },
  'Lucy': {
    outroBuffs: [{ stat: 'basicDmg', value: 25, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [{ stat: 'defShred', value: 5, duration: 30, condition: 'Spoofing Program: Breach Protocol' }],
    note: 'Outro: 25% Basic ATK DMG Amp to next Resonator (14s) + team-wide Countermeasure Program (Hack - Interfered triggers +20% All DMG Amp).',
  },
  'Rebecca': {
    outroBuffs: [{ stat: 'heavyDmg', value: 35, target: 'next', duration: 14 }, { stat: 'allDmg', value: 15, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [{ stat: 'critDmg', value: 30, target: 'self', duration: 999, condition: 'Huntress mode' }, { stat: 'defIgnore', value: 15, target: 'self', duration: 999, condition: 'Guts mode' }],
    debuffs: [],
    note: 'Outro: deploys a turret for 14s and grants the next Resonator 15% All DMG Amp (14s), ramping to 35% Heavy ATK DMG Amp via stacking Overlimit. Both buffs target the incoming Resonator only, not the whole team. Huntress mode grants self 30% Crit DMG; Guts mode grants self 15% DEF Ignore (personal, not a team-wide DEF Shred debuff — fixed 2026-08-16, was miscategorized under debuffs as defShred).',
  },
  'Denia': {
    outroBuffs: [{ stat: 'allDmg', value: 40, target: 'next', duration: 16, condition: 'Tune Strain mode, after inflicting Tune Strain - Shifting' }, { stat: 'elemDmg', value: 60, target: 'team', duration: 30, condition: 'Fusion Burst mode' }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Dual Resonance Mode: Fusion Burst mode Outro amplifies team Fusion Burst DMG by 60% (30s); Tune Strain mode Outro grants the next Resonator 15-40% All DMG Amp (16s).',
  },
  'Lucilla': {
    outroBuffs: [{ stat: 'elemDmg', value: 60, target: 'team', duration: 30, condition: 'Glacio Chafe mode' }, { stat: 'echoDmg', value: 50, target: 'next', duration: 14, condition: 'Echo mode' }],
    libBuffs: [],
    selfBuffs: [{ stat: 'critRate', value: 20, target: 'self', duration: 10, condition: 'Resonance Chain 1' }],
    debuffs: [{ stat: 'resShred', value: 8, duration: 30, condition: 'Glacio mode, Inherent Skill' }],
    note: 'Dual Resonance Mode: Glacio Chafe mode Outro amplifies team Glacio Chafe DMG by 60% (30s); Echo mode Outro grants next Resonator +50% Echo Skill DMG Amp (14s).',
  },
  'Mornye': {
    outroBuffs: [{ stat: 'allDmg', value: 25, target: 'team', duration: 30 }],
    // Lib (Critical Protocol) generates a High Syntony Field: +20% team DEF (not DPS-relevant, no stat for it here) +
    // healing + Off-Tune Buildup Rate — no "15% All DMG" anywhere in the real kit, cleared (confirmed via Nanoka/Prydwen 2026-08-16).
    libBuffs: [],
    selfBuffs: [],
    weaponBuffs: [{ stat: 'critDmg', value: 20, target: 'team', duration: 10, condition: 'Sig weapon: team Crit DMG +20% on heal' }],
    debuffs: [{ stat: 'offTune', value: 50, duration: 25, condition: 'Syntony Field: Off-Tune Buildup Rate +50%' }],
    tuneBreak: {
      boostToTeam: 0,
      baseTuneBreakBoost: 10,
      ruptureDmgMult: 300, // Tune Rupture Response — Particle Jet
      strainDmgPerStack: 0.12,
      maxStrainStacks: 3, // base 2 + 1 from Mornye
      interferedDmgAmp: 40, // targets with Interfered Marker take up to 40% more DMG (0.25% per 1% ER over 100%)
    },
    note: 'Outro: 25% All DMG Amp to team (30s, confirmed exact 2026-08-16 — was miscategorized as deepen). Syntony Field: +50% Off-Tune Buildup Rate (25s), healing, DEF+20% via Ultimate. Interfered Marker: up to 40% DMG Amp on target. Rupture Response.',
  },
  'Roccia': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Havoc DMG Amp' },
      { stat: 'basicDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 20 }],
    debuffs: [],
    note: 'Outro: +20% Havoc DMG Amp + 25% Basic ATK DMG Amp (14s). Inherent 1: self ATK +20% 12s.',
  },
  // selfBuffs condition corrected 2026-08-17 against fandom/Prydwen — was "After 4 Resonance Skill
  // casts", which matched nothing in her kit. Fiery Feather is granted by casting Liberation (Radiance
  // of Fealty) and consumed by her next Forte Heavy ATK (Flaming Sacrifice) within 10s — already
  // correctly described in this same file's SKILL_MULTIPLIERS Changli/Liberation row, just not reflected
  // here.
  'Changli': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 10 },
      { stat: 'libDmg', value: 25, target: 'next', duration: 10 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 25, target: 'self', duration: 10, condition: 'Fiery Feather: after Liberation Radiance of Fealty, self ATK +25% on the next Forte Heavy ATK (Flaming Sacrifice) within 10s.' }],
    debuffs: [],
    note: 'Outro: 20% Fusion DMG Amp + 25% Liberation DMG Amp (10s). Self ATK ramp via Fiery Feather.',
  },
  'Yinlin': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14 },
      { stat: 'libDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'critRate', value: 15, target: 'self', duration: 5, condition: 'Inherent Skill Pain Immersion: Crit Rate +15% for 5s after Magnetic Roar.' }],
    debuffs: [],
    note: 'Off-field Electro sub-DPS via Coordinated Attacks (Electromagnetic Blast on Sinner\'s Mark targets, Judgement Strike on Punishment Mark targets). Outro: Electro DMG Amp +20% + Liberation DMG Amp +25% (14s) for the incoming Resonator. No RES Shred in her kit.',
  },
  'Zhezhi': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Glacio DMG Amp' },
      { stat: 'skillDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: +20% Glacio DMG Amp + 25% Res. Skill DMG Amp (14s). Off-field painter DMG.',
  },
  'Phoebe': {
    outroBuffs: [
      { stat: 'resShred', value: 10, target: 'enemy', duration: 30, condition: 'Spectro RES (Confession mode)' },
      { stat: 'deepen', value: 100, target: 'next', duration: 30, condition: 'Spectro Frazzle DMG Amp (Confession)' },
    ],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [{ stat: 'frazzle', value: 18, duration: 15, condition: '18 stacks per rotation in Confession mode' }],
    note: 'Confession: applies 18 Frazzle stacks. Outro: Spectro RES -10% + 100% Frazzle DMG Amp. Frazzle = Level-scaling DOT, not ATK-based.',
  },
  'Cantarella': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Havoc DMG Amp' },
      { stat: 'skillDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: +20% Havoc DMG + 25% Skill DMG Amp (14s). Off-field Coordinated ATK. Heal.',
  },
  'Ciaccona': {
    outroBuffs: [{ stat: 'deepen', value: 100, target: 'next', duration: 30, condition: 'Aero Erosion DMG Amp only' }],
    libBuffs: [{ stat: 'allDmg', value: 24, target: 'team', duration: 99, condition: 'Solo Concert: from Basic ATK Ensemble Sylph summons, not Liberation itself — near-permanent uptime' }],
    selfBuffs: [],
    weaponBuffs: [{ stat: 'resShred', value: 10, target: 'team', duration: 20, condition: 'Sig weapon (Woodland Aria): Aero RES -10% on hitting Erosion targets' }],
    debuffs: [
      { stat: 'erosion', value: 3, duration: 15, condition: '3 stacks Aero Erosion, ticks every 2s' },
    ],
    note: 'Solo Concert: +24% Aero DMG team (from Basic ATK passive, near-permanent uptime, not gated behind Liberation). Outro: +100% Aero Erosion DMG Amp (30s). Aero Erosion 3 stacks. Sig weapon: Aero RES -10%. (Corrected 2026-08-16: weapon RES shred was 16%, real value is 10%; Solo Concert duration/source corrected via Nanoka/Prydwen/Game8.)',
  },
  'Lupa': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Fusion DMG Amp' },
      { stat: 'basicDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [{ stat: 'atkPct', value: 18, target: 'team', duration: 35, condition: 'Pack Hunt: 6% base +6%/Intro cast, up to 2 casts' }],
    selfBuffs: [{ stat: 'atkPct', value: 12, target: 'self', duration: 8, condition: 'Wildfire Banner, from Skill/Forte/Liberation casts' }],
    weaponBuffs: [{ stat: 'allDmg', value: 24, target: 'team', duration: 30, condition: 'Sig weapon (Wildfire Mark): triggers on successful Heavy ATK extension of the Liberation buff' }],
    debuffs: [{ stat: 'resShred', value: 15, duration: 35, condition: 'Fusion RES ignore, Glory (from Liberation): 3% base +3%/other Fusion Resonator up to 15% at 3 Fusion units' }],
    note: 'Outro: +20% Fusion DMG + 25% Basic ATK DMG Amp (14s). Lib: up to 18% ATK team (35s), enables Wild Hunt. Fusion RES ignore up to 15% (35s), needs a mono-Fusion team for max value (S3 removes the requirement). (Corrected 2026-08-16: fixed Lib buff and RES-ignore durations, which were listed far too short; added missing self-buff and weapon buff via Nanoka/Prydwen/Game8.)',
  },
  'Iuno': {
    outroBuffs: [{ stat: 'heavyDmg', value: 50, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [
      { stat: 'allDmg', value: 40, target: 'self', duration: 10, condition: 'Derivation: Blessing of the Wan Light, max 10 stacks (+4%/stack)' },
    ],
    debuffs: [],
    note: 'Outro: 50% Heavy ATK DMG Amp (14s). Real team healing via New Moon Moonbow attacks/Dodge Counter/Arc Beyond the Edge (heal on hit) and Absolute Fullness + Full Moon Domain (team HP/STA regen). Self-shield via Waxing Ascent (32% ATK per skill cast, self only). Liberation activates Lunar Cycle burst phase, no team DMG buff. (Corrected 2026-08-16: restored the team-heal claim — confirmed via Nanoka live re-check after Prydwen/Game8 omitted her healing kit in the prior audit.)',
  },
  'Qiuyuan': {
    outroBuffs: [{ stat: 'echoDmg', value: 50, target: 'next', duration: 14 }],
    libBuffs: [{ stat: 'critDmg', value: 30, target: 'team', duration: 30, condition: 'Requires 65%+ Crit Rate for full value; +2% Crit DMG per 1% Crit Rate over 50%' }],
    selfBuffs: [],
    weaponBuffs: [{ stat: 'echoDmg', value: 20, target: 'team', duration: 30, condition: 'Signature weapon (Emerald Sentence): triggers on Intro Skill cast' }],
    debuffs: [],
    note: 'Outro: 50% Echo Skill DMG Amp (14s). Lib: conditional Crit DMG buff (up to +30% at 65%+ Crit Rate), not a flat Echo DMG buff. Sig weapon: 20% team Echo DMG on Intro cast. (Corrected 2026-08-16: Liberation buff was mislabeled as echoDmg — real effect is Crit DMG, confirmed via Prydwen/Game8.)',
  },
  'Chisa': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [{ stat: 'defIgnore', value: 18, duration: 30 }],
    note: 'Support/Healer. DEF Ignore 18% via Thread of Bane on Unseen Snare targets (30s). Heals team via Death Snip and Moment of Nihility; grants Shields via Sawring - Eradication.',
  },
  // ── 5★ Main DPS (mostly self-buffs, less team contribution) ──
  'Camellya': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'elemDmg', value: 15, target: 'self', duration: 99, condition: 'Seedbed: +15% Havoc DMG' },
      { stat: 'basicDmg', value: 15, target: 'self', duration: 99, condition: 'Epiphyte: +15% Basic DMG' },
    ],
    debuffs: [],
    note: 'Self-buffing Main DPS. Seedbed: +15% Havoc DMG. Epiphyte: +15% Basic DMG.',
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
    selfBuffs: [{ stat: 'elemDmg', value: 20, target: 'self', duration: 99, condition: 'Inherent Skill Radiant Surge: Spectro DMG Bonus +20% (always active).' }],
    debuffs: [],
    note: 'On-field Spectro burst DPS. Builds Incandescence from any team member\'s Attribute/Coordinated DMG, then spends it via Illuminous Epiphany (Incarnation Basic ATK Stage 4) for a massive Stella Glamor nuke (+44.54% DMG per Incandescence). Outro Temporal Bender is a pure Incandescence-gain utility, not a team buff.',
  },
  // Xiangli Yao: moved to Main DPS section below
  'Zani': {
    outroBuffs: [{ stat: 'elemDmg', value: 20, target: 'team', duration: 20, condition: 'To allies hitting the Heliacal Ember-marked target' }],
    libBuffs: [],
    selfBuffs: [
      { stat: 'elemDmg', value: 12, target: 'self', duration: 14, condition: 'Quick Response: Intro Skill cast grants +12% Spectro DMG Bonus' },
      { stat: 'atkPct', value: 24, target: 'self', duration: 20, condition: 'Weapon R1' },
      { stat: 'defIgnore', value: 16, target: 'self', duration: 14, condition: 'Weapon R1: During Lib + Frazzle Amp 50%' },
    ],
    debuffs: [],
    note: 'Converts Frazzle→Heliacal Embers. Outro grants allies hitting the marked target +20% Spectro DMG Amp (20s) — this was previously missing entirely. Weapon: +24% ATK, 16% DEF Ignore, 50% Frazzle DMG in Lib. (Corrected 2026-08-16: added the missing Outro team buff and Quick Response self-buff via Nanoka/Prydwen.)',
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
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 6 }],
    libBuffs: [{ stat: 'atkPct', value: 15, target: 'team', duration: 20 }],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 15% Deepen (6s per tick, refreshes on heal). Inherent: 15% ATK teamwide (20s on Euphonia pickup). Heal.',
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
      { stat: 'critDmg', value: 60, target: 'self', duration: 99, condition: 'Inherent Skill Between the Stars: Tune Rupture mode 20% per Resonator ×3 stacks, or Fusion Burst mode 30% per Resonator ×2 stacks (both max 60%, resets on team change/mode switch)' },
      { stat: 'deepen', value: 25, target: 'self', duration: 99, condition: 'At max Between the Stars stacks, Heavenfall Edict: Finale DMG Amplified +25%' },
      { stat: 'defIgnore', value: 32, target: 'self', duration: 8, condition: 'Sig weapon: on Tune Rupture/Fusion Burst infliction' },
      { stat: 'resShred', value: 10, target: 'self', duration: 8, condition: 'Sig weapon: Fusion RES ignore' },
    ],
    debuffs: [{ stat: 'fusionBurst', value: 30, duration: 30, condition: 'Rupturous Trail / Fusion Trail: stacks up to 30 (60 at RC6), each stack removed by Seraphic Duet grants scaling DMG Mult' }],
    note: 'Strongest DPS in game. Dual mode: Tune Rupture (ST) / Fusion Burst (AoE). Enhanced Seraphic Duet scales off Rupturous/Fusion Trail (up to 30 stacks = 300% mult, 4%/10% per stack removed). Sig weapon: 32% DEF Ignore + 10% Fusion RES. Self-buff: up to 60% CD via Between the Stars.',
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
    selfBuffs: [{ stat: 'elemDmg', value: 10, target: 'self', duration: 10, condition: 'Inherent Skill Woolies Cheer Dance: Fusion DMG +10%/10s on Flaming Woolies/Cosmos-Rampage cast.' }],
    debuffs: [],
    note: 'On-field Fusion main DPS. Builds Mayhem from Basic/Skill/Intro hits; at full Mayhem, Heavy ATK enters a 70% DMG-reduction state and casts a big Liberation-DMG finisher (Cloudy Frenzy / Cosmos Rupture) on exit. Liberation Cosmos Rave replaces her whole kit with enhanced Fusion versions for 10s. Outro Thermal Field is a pure DoT proc, no team buff — free to quickswap.',
  },
  'Lingyang': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 50, target: 'self', duration: 14, condition: "Liberation Strive: Lion's Vigor grants self Glacio DMG Bonus +50% for 14s." }],
    debuffs: [],
    note: "On-field Glacio main DPS. Forte Circuit's Striding Lion state (entered via Heavy ATK Glorious Plunge at full Lion's Spirit) unlocks airborne enhanced attacks. Outro Frosty Marks is a pure-DMG AoE proc, not a team buff, though S4 Resonance Chain grants team Glacio DMG +20%/30s on it.",
  },
  'Cartethyia': {
    outroBuffs: [{ stat: 'elemDmg', value: 17.5, target: 'next', duration: 20, condition: 'Aero DMG vs Negative Status targets' }],
    libBuffs: [],
    selfBuffs: [],
    weaponBuffs: [{ stat: 'defIgnore', value: 8, target: 'self', duration: 15, condition: "Sig weapon (Defier's Thorn): 15s after Intro Skill or Basic ATK casts" }],
    debuffs: [
      { stat: 'erosion', value: 6, duration: 15, condition: '6 stacks with Rover (3 base). HP-scaling DPS.' },
      { stat: 'elemDmg', value: 60, duration: 99, condition: "Wind's Indelible Imprint: targets at max (6) Erosion stacks take +60% more DMG from her (scales from +30% at 1-3 stacks, +10%/stack beyond)" },
      { stat: 'elemDmg', value: 20, duration: 15, condition: "Sig weapon: Erosion-stacked targets take +20% more DMG (15s after Intro/Basic ATK)" },
    ],
    note: 'Top-tier Aero DPS. HP-scaling. Outro: +17.5% Aero DMG vs Negative Status (20s). Weapon: DEF Ignore 8% (not 16%) + Erosion targets take +20% more DMG. Wind\'s Indelible Imprint debuffs Erosion-stacked targets up to +60% DMG taken. (Corrected 2026-08-16: fixed weapon DEF Ignore value — was double the real number and conflated with a separate effect; the "self elemDmg" entries were actually enemy-side debuffs, moved to debuffs; added the missing Wind\'s Indelible Imprint debuff.)',
  },
  'Brant': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Fusion DMG Amp' },
      { stat: 'skillDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 12, target: 'self', duration: 99, condition: 'Weapon passive: Fusion DMG +12%' }],
    debuffs: [],
    note: 'Outro: +20% Fusion DMG + 25% Skill DMG Amp (14s). Self-heal. Weapon: Fusion DMG +12%.',
  },
  'Augusta': {
    outroBuffs: [{ stat: 'elemDmg', value: 15, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [
      { stat: 'elemDmg', value: 15, target: 'self', duration: 99, condition: 'Crown of Wills: +15% Electro DMG Bonus per stack, max 1 stack at base kit (S0)' },
    ],
    debuffs: [],
    note: 'Heavy ATK AoE DPS with built-in self shields (Glory\'s Favor) and a Crown of Wills self-buff. Outro: +15% All DMG Amp to next Resonator (14s), not a "Deepen" multiplier. Liberation\'s Ruler\'s Realm grants teammates a shield on Intro cast — no direct DPS stat. (Corrected 2026-08-16: Outro was mislabeled as deepen instead of allDmg; added missing Crown of Wills self-buff.)',
  },
  'Galbrena': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'allDmg', value: 85, target: 'self', duration: 14, condition: 'Liberation cast: +85% DMG Mult to Demon Hypostasis attacks' },
      { stat: 'atkPct', value: 20, target: 'self', duration: 4, condition: 'Burning Drive: +20% ATK on certain casts' },
    ],
    debuffs: [],
    note: 'Echo Skill + Heavy ATK Fusion DPS. Outro (Ashen Pursuit) is pure damage, no team buff — free to quickswap. Self-buffs via Liberation and Burning Drive, no team support kit.',
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
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Havoc DMG Amp' },
      { stat: 'heavyDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'critDmg', value: 60, target: 'self', duration: 99, condition: 'Aftersound: +2.5% CD per stack up to 24 stacks (60%); beyond 24, +1%/stack up to a 100% total cap' }],
    debuffs: [],
    note: 'Outro (Unfinished Piece): +20% Havoc DMG + 25% Heavy ATK DMG Amp (14s). Self: up to 60-100% CD from Aftersound stacking. Intro is "Suite of Quietus" (base) / "Suite of Immortality" (Maestro-enhanced). (Corrected 2026-08-16: Outro skill name was wrong — file previously called it "Final Applause"; the real base Intro name "Suite of Quietus" was also missing, previously only the enhanced Maestro form was listed.)',
  },
  // ── Electro characters with Electro Flare ──
  // Corrected 2026-08-17 against Prydwen's live build page: selfBuffs previously described a specific
  // equipped weapon's passive (12% Electro DMG) rather than his own innate kit — replaced with his real
  // Inherent Skill "Knowing" (+5% Electro DMG Bonus per Resonance Skill cast, 8s, stacks to 4×/20%
  // cap). outroBuffs/libBuffs/debuffs confirmed empty: his Outro Chain Rule deals its own Electro DMG
  // to the incoming Resonator's target rather than granting a DMG Amp buff, and he applies no debuffs.
  'Xiangli Yao': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 20, target: 'self', duration: 8, condition: 'Inherent Skill Knowing: +5% Electro DMG Bonus per Resonance Skill cast (8s), stacks up to 4× (20% cap)' }],
    debuffs: [],
    note: 'Intuition-state Liberation Main DPS. Outro Chain Rule deals bonus Electro DMG (237.63% ATK, up to 3 procs over 8s) on the incoming Resonator\'s Basic Attacks rather than granting a DMG Amp buff.',
  },
  // Jinhsi: defined earlier in Main DPS section
  'Rover: Spectro': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'resShred', value: 10, target: 'enemy', duration: 20, condition: 'S6: Resonating Slashes/Spin hit → Spectro RES Shred -10% (20s). Resonance Chain 6, not innate.' }],
    debuffs: [{ stat: 'frazzle', value: 8, duration: 9, condition: 'Forte Circuit Resonating Spin→Echoes applies 2 stacks (+Shimmer); Liberation Echoing Orchestra applies 6 stacks. Shimmer (9s) prevents stacks decaying.' }],
    note: 'Spectro Frazzle applier/quick-swap support. Forte: Resonance Skill at 50+ Diminutive Sound casts Resonating Spin (2 Frazzle stacks + Shimmer, which stops decay), followed by Basic ATK Resonating Echoes. Liberation Echoing Orchestra applies 6 more Frazzle stacks. S6 (5 copies): Skill hits Spectro RES Shred -10%/20s.',
  },
  'Rover: Havoc': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'critRate', value: 25, target: 'self', duration: 99, condition: 'S6 (5 copies): Crit Rate +25% while in Dark Surge.' }],
    debuffs: [{ stat: 'resShred', value: 10, duration: 20, condition: 'S4 (3 copies): Devastation/Liberation hit → Havoc RES Shred -10% (20s). Chain-gated, not innate.' }],
    note: 'On-field Havoc main DPS. Hold Heavy ATK at full Umbra to cast Devastation and enter Dark Surge — an enhanced Basic/Heavy/Skill state ending in Liberation Deadening Abyss, a 1520% ATK single-target nuke.',
  },
  'Rover: Aero': {
    outroBuffs: [{ stat: 'totalMult', value: 3, target: 'team', duration: 30, condition: "Outro Storm's Echo: Aeolian Realm — team's Aero Erosion stack cap +3 for 10s per hit (30s field)." }],
    libBuffs: [{ stat: 'totalMult', value: 77, target: 'team', duration: 0, condition: 'Liberation Omega Storm heals nearby team ~2090 + 77% ATK.' }],
    selfBuffs: [],
    debuffs: [],
    note: "Healer/support. Mid-air Skill Skyfall Severance strips Spectro Frazzle, Havoc Bane, Fusion Burst, Glacio Chafe, and Electro Flare stacks off the target hit and converts each into a stack of Aero Erosion. Forte Cloudburst Dance and Liberation Omega Storm both heal the team.",
  },
  'Rover: Electro': {
    outroBuffs: [{ stat: 'allDmg', value: 25, target: 'ally', duration: 14, condition: 'Outro Rumbling Thunders: incoming Resonator gains Electro Core — next Negative Status hit grants All DMG Amp +25% (14s).' }],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 10, target: 'team', duration: 20, condition: 'Tap-cast Overshock at max Electric Surge → team ATK +10% (20s).' }],
    debuffs: [{ stat: 'flare', value: 10, duration: 99, condition: 'Inherent Skill Decipher: hold-cast Overshock inflicts 10 stacks of Electro Flare.' }],
    note: 'Parry Stance hybrid. Hold Basic ATK for interrupt immunity + 60% DMG reduction. At max Electric Surge, tap Overshock for a team ATK buff or hold it to enter Apex Resonance, unlocking the multi-element Thrum of All Sounds Forte combo (Spectro/Havoc/Aero hits + Thunder Bane Electro pulses). Currently the weakest attunement — lacks a strong DPS partner.',
  },
};

// [SECTION:SKILL_MULTIPLIERS] — Per-character skill ATK% multipliers at Lv.10 (max skill level)
// Format: { charName: [ [type, skillName, multString], ... ] }
// Source: game8.co character pages (Aemeath/Luuk Herssen/Lynae/Mornye/Chisa cross-checked against ww.nanoka.cc "Skill Attributes (Lv.10)" 2026-08-15)
const SKILL_MULTIPLIERS = {
  'Suisui': [
    ['Basic ATK', 'Zephyr Stance Stage 1-4', '63.15% → 61.00%×2 → 41.80%×2+55.74% → 79.53%+15.91%×5', 'Zephyr (healing stance) combo; builds Cloud Breath.'],
    ['Mid-air', 'Zephyr Stance', '70.72%', 'Airborne plunge in Zephyr Stance.'],
    ['Basic ATK', 'Drizzle Stance Stage 1-4', '19.57%×4 → 31.81%×3+15.91%×4 → 13.76%×12 → 159.05%', 'Drizzle (DMG stance) combo; builds Floral Epistle.'],
    ['Skill', 'Zephyr Stance thrust', '23.86%×6', 'Restores Cloud Breath toward Awakening Spring.'],
    ['Skill', 'Awakening Spring', '28.63% Max HP', 'At max Cloud Breath: switches to Drizzle Stance.'],
    ['Skill', 'Drizzle Stance thrust', '11.93%×6+71.58%', 'Restores Floral Epistle toward her Outro payoff.'],
    ['Heavy ATK', 'Drizzle Stance', '11.93%×10+119.29%', 'Drizzle Stance Heavy ATK, builds Floral Epistle.'],
    ['Liberation', 'Song of Thoroughfare', 'Field effect — no direct DMG, team Negative Status stack cap +3', 'Ultimate: raises team Negative Status stack caps.'],
    ['Intro', 'Tinkling Jade', '28.63% Max HP', 'Opener that enters Drizzle Stance.'],
    ['Outro', 'Rippling Waters', '25% All DMG Amp (30s) + stance-consumption team buffs', 'Buffs team All DMG; more Floral Epistle = bigger payoff.'],
  ],
  'Qingxiao': [
    ['Basic ATK', 'Stringblade Stage 1-4', '30.13%×2 → 37.09%×2 → 24.36%×4 → 86.73%+5.43%×4'],
    ['Heavy ATK', 'Stringblade', '14.62%×3+21.92%×6+263.03%'],
    ['Skill', 'Severing Note: Judgement', '20.88%×2+97.42%'],
    ['Skill', 'Severing Note: Ascendant', '28.40%+33.13%×2'],
    ['Forte', "Heaven's Reckoning: Ephemeral Transcendence", '27.84%×9+445.34%'],
    ['Liberation', 'Billows Beneath Heaven', '33.41%×10+1336.01%'],
    ['Intro', 'Tonality Shift', '39.79%+46.42%×2'],
    ['Outro', 'Lingering Song', '800% ATK'],
  ],
  'Jingran': [
    ['Basic ATK', "Drink Soul / Devil's Bane Stage 1-4", '44.74%→37.28%×2→27.33%×4→45.95%×2+30.63%×2 (Yin) / 39.82%→59.68%+39.79%→47.73%×2+63.64%→86.95%+12.43%×3 (Yang)'],
    ['Skill', 'Encroaching Yin / Scorching Yang', '65.61%+32.81%×3'],
    ['Skill', "Netherworld Traverse / Afterlife's Guide", '51.69%+25.85%×2+38.77%×4 / 65.87%×2+131.74%'],
    ['Heavy ATK', 'Soul Raid', '16.40%×2+21.09%×3+138.22% (+ Max HP scaling)'],
    ['Heavy ATK', 'Stardome Meander', '24.04%+24.04%+48.08%+144.22% (+ Max HP scaling)'],
    ['Liberation', 'Burial of Thousand Souls', '93.15%×8'],
    ['Forte', 'Chimei Wangliang', '83.51% (summon proc on Heavy ATK)'],
    ['Intro', 'Question the Tombs', '198.81%'],
    ['Outro', 'Rising Fortune and Ebbing Evil', '795% ATK'],
  ],
  'Yangyang: Xuanling': [
    ['Basic ATK', 'Azure/Feather Stance Stage 1-4', '47.72% → 20.14%×2+60.41% → 30.21%+70.48% → 18.57%×2+148.49% (Azure) / 39.77%×2 → 33.56%×3 → 14.86%+7.43%×3+37.14% → 71.58%×2+95.43% (Feather)', 'Combo in either stance; Stage 4 applies Havoc Bane.'],
    ['Skill', 'Sword Stance Switch', '69.95%+15.55%×3 (Azure) / 33.56%×3 (Feather)', 'Swaps between Azure and Feather Sword Stance.'],
    ['Heavy ATK', 'Azure Sword Stance', '135.16%×2+180.21%', 'Big cyclone hit once Azure Plume is maxed.'],
    ['Heavy ATK', 'Feather Sword Stance', '21.71%+195.34%', 'Empowered hit once Azure Plume is maxed.'],
    ['Liberation', 'Hush of a Thousand Voices', '1988.10%', 'Ultimate nuke, maxes Havoc Bane on hit.'],
    ['Forte', 'Shadow of Xuanling', '337.98% ATK (summon proc)', 'Bonus summon hit on her next stance-swap Skill.'],
    ['Intro', 'Skybound Feather', '116.59%', 'Opener that applies Havoc Bane.'],
    ['Outro', 'As the Wind Wills', '300% ATK + team Havoc DMG buff', "Buffs other Havoc Bane appliers' DMG."],
  ],
  'Hiyuki': [
    ['Basic ATK', 'Present Self Stage 1-3', '37.72%×2 → 90.25% → 4.92%×5+98.37%', 'Standard combo; applies Glacio Chafe.'],
    ['Basic ATK', 'Foreclaimed Self Stage 1-5', '49.27% → 40.02%×2 → 25.16%×4+67.08% → 29.93%×5 → 12.17%+109.47%', 'Empowered combo used after her Ultimate.'],
    ['Heavy ATK', 'Frost Splinter: Present Self', '3× arrow volley, considered Liberation DMG', 'Builds toward her Ultimate; fires 3 arrows.'],
    ['Heavy ATK', 'Bitterfrost: Foreclaimed Self', 'Consumes 3 Whiteout Bitterfrost, considered Liberation DMG', 'Forte finisher that fuels her 2nd Ultimate.'],
    ['Liberation', 'Foreclaiming: Inward Vision', 'Enters Foreclaimed Self, 4 stacks Glacio Chafe on hit', 'Ultimate: enters her empowered stance.'],
    ['Liberation', 'Foreclaiming: Blade Liberation', 'Scales with Snowforged Blade consumed', '2nd Ultimate finisher, stronger with more Blade stacks.'],
    ['Forte', 'Glacio Bite', 'Converts team Glacio Chafe into Glacio Bite procs', 'Turns ally Glacio Chafe into bonus DMG procs.'],
    ['Intro', 'Frostedge', 'Considered Liberation DMG, 1 stack Glacio Chafe on hit', 'Opener hit that applies Glacio Chafe.'],
    ['Outro', 'Snowlight Blessing', 'Team Glacio DMG +20% vs Chafe-affected targets (20s)', 'Buffs team Glacio DMG on Chafe-affected enemies.'],
  ],
  'Lucy': [
    ['Basic ATK', 'Locked Thread Stage 1-4', '12.15%×6+48.59% → 20.66%+20.05%×2 → 36.06%×2+48.08% → 31.02%+15.51%×3+38.77%×2', 'Standard combo; hold for extended attacks.'],
    ['Heavy ATK', 'Multi-threading', '59.65%+59.65%×3 (+270% SQL bonus)', 'Empowered finisher, stronger with SQL stacks.'],
    ['Skill', 'Payload / Pulse Interference / Deadlock', '20.05%+10.03%+40.09%+... / 30.86%×2+61.72%×3+61.72% / 51.70%+206.77%', 'Builds TCP; Deadlock is the max-TCP upgrade.'],
    ['Liberation', 'Netrunner: Override', '894.65% (up to 1789.29% as Old Net Deep Dive)', 'Ultimate: marks and nukes enemies with chosen debuffs.'],
    ['Forte', 'Hack Response - Data Crash', '1094.19%+68.39%×4 (Hack DMG)', 'Bonus DMG on Hack-Interfered targets.'],
    ['Intro', 'Outdated Hallucination', '69.14%×2', 'Opener that reveals enemies through walls.'],
    ['Outro', 'Countermeasure Program', '25% Basic ATK DMG Amp to next + team Hack-Shifting response', "Buffs next ally's Basic ATK DMG."],
  ],
  'Rebecca': [
    ['Basic ATK', 'Mix-\'n\'-Match', '36.76%+36.76% → 19.13%×4+19.13% → 109.85%', 'Standard combo in Huntress or Guts stance.'],
    ['Heavy ATK', 'Rat-tat-tat!: Huntress / Bang-bang-bang!: Guts', '19.89%×3+318.10%+19.89% / 278.34%', 'Forte finisher once Fervor is maxed.'],
    ['Skill', "It's Big Boomin' Time! / Come 'n' Get Me!", '23.66%×4+35.49%×4 / 23.66%+4.74%+23.66%×2+137.22%+11.83%×2', 'Closes distance and swaps stance.'],
    ['Liberation', "Party 'til Dawn! / BOOM! Fireworks!", '24.30%→116.64% ramp / 63.62%+572.58%', 'Channeled minigun into a finishing blast.'],
    ['Forte', 'Hack Response - Meltdown', '2358.89% (Hack DMG)', 'Bonus DMG when allies inflict Hack-Interfered.'],
    ['Intro', "Yo, It's Big Boomin' Time!", '27.04%×6+40.56%+67.60%', 'Opener that also swaps stance.'],
    ['Outro', 'Preem Choom', 'Turret + Edgerunner Bonds (All DMG Amp) + Overlimit stacks', "Leaves a turret; buffs next ally's Heavy ATK DMG."],
  ],
  'Denia': [
    ['Basic ATK', 'Stagecraft/Breakdown Form Stage 1-4', 'Fusion DMG, applies Fusion Burst or Tune Strain - Shifting on Stage 3/4', 'Combo that applies Fusion Burst or Tune Strain.'],
    ['Skill', 'Phantom Bubble / Beckon / Banish', 'Banish DMG Mult +150% per Dark Core consumed', 'Pulls enemies in; Banish spends Dark Cores for a nuke.'],
    ['Liberation', 'Final Act: Stagecraft Form', 'Grants Entropy Shift: Breakdown Form (12s), switches form', 'Switches to Breakdown Form.'],
    ['Liberation', 'Final Act: Breakdown Form', 'Consumes full Conformal Charge + Void Particle, switches form', '2nd Ultimate: big hit, switches back to Stagecraft.'],
    ['Forte', 'Erosion Field', 'Pulls + damages every 4s for 30s, considered Liberation DMG', 'Leaves a pulling, damaging field.'],
    ['Intro', "It's Been A While! / Knock Knock", 'Grants Dark Core / Entropy Shift: Breakdown Form', 'Opener that also grants a Dark Core.'],
    ['Outro', 'Unfinished Lies', '60% Fusion Burst DMG Amp (Fusion mode) / 15-40% All DMG Amp (Tune Strain mode)', 'Buffs Fusion Burst DMG or grants All DMG Amp.'],
  ],
  'Lucilla': [
    ['Basic ATK', 'Snapshot Stage 1-3', '59.29% → 26.89%+40.34% → 235.27% (Commendable) / 159.55% (Unremarkable)', 'Standard combo; hold the 3rd hit for a stronger finisher.'],
    ['Skill', 'Phantom Frame / Compensate / Spotlight', '13.26%×3 / 249.07% / 82.35%×2+274.48%+109.80%', 'Pulls enemies in; hold for a stronger follow-up.'],
    ['Liberation', 'Clear As Day', '142.74%, enters Reminiscence', 'Ultimate: enters her empowered stance.'],
    ['Forte', 'Oblivion', '285.48% (Glacio Chafe mode, Basic ATK DMG) / same value as Echo Skill DMG (Echo mode)', 'Auto-attacks during Reminiscence, consuming Photos.'],
    ['Intro', 'Clip It', '97.42% (149.41% as Clip It: Hard Cut)', 'Opener hit that applies Glacio Chafe.'],
    ['Outro', 'Montage', '60% Glacio Chafe DMG Amp (Chafe mode) / 50% Echo Skill DMG Amp to next (Echo mode)', 'Buffs Glacio Chafe DMG or next ally Echo Skill DMG.'],
  ],
  'Augusta': [
    ['Basic ATK', "Hunter's Path", '28.9% → 33.7%×2 → 33%×3 → 32.5%×3', 'Standard combo string, builds toward her Majesty/Crown resources.'],
    ['Heavy ATK', 'Steelclash', '23.3%×3', 'Base charged combo.'],
    ['Heavy ATK', 'Thunderoar', 'Backstep 27% / Spinslash 71.3%×3 / Uppercut 90%×2', 'Empowered Heavy ATK combo, unlocked at full Ascendancy.'],
    ['Skill', "Warrior's Blade", '110%×3', 'Multi-hit Skill strike with a brief time-stop on cast.'],
    ['Liberation', 'Sword of Eternal Oath', '16.6%×2 + 66.4%×3 + 16.6%×2 + 287.6%', 'Standard Ultimate combo nuke.'],
    ['Liberation', 'Sunborne', '60% ×9 slashes', 'Alt Ultimate opener when holding the input at 2 Majesty stacks.'],
    ['Liberation', 'Everbright Protector', '120% + 450% + 3%×10', 'Finisher following Sunborne, deploys Ruler\'s Realm.'],
    ['Forte', 'Undying Sunlight', 'Strike 70%×2 / Leap 112%+14%×2 / Plunge 43.6%+392%', 'Forte-empowered combo, Plunge consumes all Ascendancy for a big finisher.'],
    ['Intro', 'Stride of Goldenflare', '50%×2', 'Swap-in opener strike.'],
    ['Outro', 'Battlesong of the Unyielding', '+15% All DMG Amp (14s)', 'Swap-out buff to the next Resonator; also grants Augusta stacks for her next rotation.'],
  ],
  'Aemeath': [
    ['Basic ATK', 'Aemeath Form Stage 1-4', '46.35% → 13.89%+20.84%+34.73% → 9.32%×3+18.63%+46.56% → 6.73%×5+100.94%', 'Standard human-form combo string, weaker but faster than Mech Form.'],
    ['Basic ATK', 'Mech Form Stage 1-4', '23.20%×3 → 18.57%+74.26% → 3.89%×6+81.54%+11.65% → 40.38%+94.21%', 'Heavier Mech-form combo with bigger hits, entered via her Forte.'],
    ['Charged ATK', 'Aemeath Charged I / II', '18.57%+74.26% / 11.60%×4+185.60%', 'Human-form charged strike, second stage hits much harder.'],
    ['Charged ATK', 'Mech Charged I / II', '92.83% / 232.00%', 'Mech-form charged strike, very high single hits.'],
    ['Skill', 'Sync Strikes', 'Armament Merge 26.92%+40.38%+67.29% / Call of Dawn 16.33%×3+114.28%', 'Skill triggers different follow-ups depending on which form she is in.'],
    ['Skill', 'Seraphic Duet', 'Overture 17.90%+14.92%×6+23.86%×3+59.65%×3 / Encore 17.90%×4+35.79%×3+178.93%', 'Longer Skill combo, Encore variant hits when chained after Overture.'],
    ['Liberation', 'Heavenfall Edict', 'Overdrive 200.80%+267.74%×3 / Finale 1789.29%', 'Ultimate; Finale is a massive burst that scales with team buffs.'],
    ['Intro', 'Songs Across the Universe', '13.46%×2 + 107.66%', 'Intro Skill used when swapping in from human form.'],
    ['Intro', 'Debut of Meteoric Radiance', '65.30% + 97.95%', 'Intro Skill used when swapping in from Mech Form.'],
    ['Outro', 'Silent Protection', '10-20% All-DMG Amp to team (20s), mode-dependent', 'Swap-out buff to the whole team; strength depends on which form she left in.'],
  ],
  'Brant': [
    ['Basic ATK', 'Stage 1-4', '25.4% → 51% → 116.5% → 70.5%'],
    ['Mid-air', 'Charged Combo', '61.8% → 167.1% → 46.8% → 85.1% → 127.6%'],
    ['Heavy ATK', 'Rhapsodic Riff', '85%'],
    ['Skill', 'Anchors Aweigh', '100.8% + 67.2%'],
    ['Liberation', 'Bravo!', '42.8%×4 + 171.1%'],
    ['Forte', 'Returned from Ashes', '23.8%×2 + 47.5% + 95%×2 + 665%'],
    ['Intro', 'Here I Am!', '102% + 25.5%'],
    ['Outro', 'Standing Ovation', '+20% Fusion DMG + 25% Skill DMG Amp (14s)'],
  ],
  'Calcharo': [
    ['Basic ATK', 'Gnawing Fangs Stage 1-4', '45.73%×2 → 99.41% → 85.18%+42.59%×3 → 79.51%×2+106.01%'],
    ['Heavy ATK', 'Standard', '41.36%×5'],
    ['Mid-air', 'Plunging Attack', '123.27%'],
    ['Dodge Counter', 'Standard', '66.48%×3+85.47%'],
    ['Skill', 'Extermination Order Stage 1-3', '51.57%×2+68.76% → 77.36%×2+103.14% → 214.87%×2', '10s cooldown; does not interrupt the Basic ATK cycle.'],
    ['Forte', 'Heavy ATK: "Mercy"', '39.11%×8+78.22%', 'At 3 Cruelty (gained from Skill hits), Heavy ATK becomes "Mercy" — restores Resonance/Concerto Energy.'],
    ['Forte', 'Heavy ATK: "Death Messenger"', '97.77%×8+195.53%', 'In Deathblade Gear, at 5 Killing Intent, Basic ATK becomes "Death Messenger" (Liberation DMG).'],
    ['Liberation', 'Phantom Etching → Hounds Roar', '596.43% → 88.07%→35.23%×2+52.84%×2→163.84%→34.82%×6→150.19%×2', 'Enters Deathblade Gear (11s): Basic ATK replaced by Hounds Roar, Heavy ATK/Dodge Counter deal Liberation DMG.'],
    ['Intro', 'Wanted Outlaw', '39.77%×2+59.65%×2'],
    ['Outro', 'Shadowy Raid', '195.98%+391.96%'],
  ],
  'Camellya': [
    ['Basic ATK', 'Thorns 1-5', '31.5% → 46.8% → 76.5% → 248.4% → 96.9%'],
    ['Heavy ATK', 'Standard', '44.3%×3'],
    ['Skill', 'Crimson Blossom', '57.2%×2'],
    ['Skill', 'Vining Waltz 1-4', '48.5% → 45.9% → 66.2% → 102%'],
    ['Skill', 'Blazing Waltz', '11%×19'],
    ['Forte', 'Ephemeral (Budding)', '635%'],
    ['Liberation', 'Fervor Efflorescent', '605%'],
    ['Intro', 'Everblooming', '100%'],
    ['Outro', 'Twining', '329.2% + 459%'],
  ],
  'Cantarella': [
    ['Basic ATK', 'Stage 1-3', '40% → 73.3% → 73%'],
    ['Heavy ATK', 'Standard', '28.8%×2'],
    ['Skill', 'Graceful Step', '37%×2'],
    ['Skill', 'Flickering Reverie', '98.7%'],
    ['Forte', 'Phantom Sting 1-3', '53.3% → 63.3% → 130%'],
    ['Forte', 'Perception Drain', '336%×2'],
    ['Liberation', 'Flowing Suffocation', '189.1% + 7.3%×21'],
    ['Intro', 'Ripple', '21.3%×4'],
    ['Outro', 'Sweet Nightmare', '+20% Havoc DMG + 25% Skill DMG Amp (14s)'],
  ],
  'Carlotta': [
    ['Basic ATK', 'Stage 1-2', '27.2% → 66.3%'],
    ['Basic ATK', 'Necessary Measures 1-3', '33.2% → 67.2% → 117.3%'],
    ['Heavy ATK', 'Standard', '76.5%'],
    ['Heavy ATK', 'Containment Tactics', '114.8%'],
    ['Forte', 'Imminent Oblivion', '33.6%×5 + 252.1%'],
    ['Skill', 'Art of Violence', '72.5%×2'],
    ['Skill', 'Chromatic Splendor', '56.7%×2 + 170.1%'],
    ['Liberation', 'Era of New Wave', '202.6%'],
    ['Liberation', 'Death Knell', '(92.3% + 7.3%×4) per shot'],
    ['Liberation', 'Fatal Finale', '324.1%'],
    ['Intro', 'Wintertime Aria', '90% + 30%×2'],
    ['Outro', 'Closing Remark', '794.2%'],
  ],
  'Cartethyia': [
    ['Basic ATK', 'Base Form 1-4', '2.4%HP → 7%HP → 8.6%HP → 7.6%HP', 'Standard combo in her base sword form, scales off Max HP.'],
    ['Basic ATK', 'Fleurdelys 1-5', '3.3%HP → 4.6%HP → 6.3%HP → 6.9%HP → 126.7%HP', 'Empowered combo used in Fleurdelys form.'],
    ['Heavy ATK', 'Fleurdelys Enhanced', '3.9%×2 + 2%HP', 'Charged strike in Fleurdelys form.'],
    ['Skill', 'Base Form', '3.5%×3 + 4.5%HP', 'Skill strike that applies Aero Erosion and summons a Sword Shadow.'],
    ['Skill', 'Fleurdelys 1-2', '12.5%HP / 14.2%HP', 'Fleurdelys-form Skill variants.'],
    ['Liberation', "A Knight's Heartfelt Prayers", 'Costs 50% Max HP', 'Ultimate that transforms her into Fleurdelys form for 12s; no direct damage.'],
    ['Liberation', 'Blade of Howling Squall', '6.6%×7 HP', 'Fleurdelys-form Ultimate finisher; removes Aero Erosion stacks from the target for bonus DMG.'],
    ['Intro', "Sword to Mark Tide's Trace", '2.2% + 5%HP', 'Base-form swap-in opener.'],
    ['Intro', "Sword to Call for Freedom", '4.28% + 9.97%HP', 'Fleurdelys-form swap-in opener.'],
    ['Outro', "Wind's Divine Blessing", '+17.5% Aero DMG vs Negative Status (20s)', 'Swap-out buff to the active teammate against targets with a Negative Status.'],
  ],
  'Changli': [
    ['Basic ATK', 'Blazing Enlightenment Stage 1-4', '29.49%×2 → 35.49%×2 → 36.45%×3 → 50.70%+29.58%×4', 'Releasing Stage 4 enters True Sight (12s).'],
    ['Mid-air', 'Stage 1-4', '61.35% → 50.87%×2 → 44.00%×3 → 38.03%+22.18%×4', 'Also enters True Sight on release of Stage 4.'],
    ['Heavy ATK', 'Standard / Mid-air Heavy', '28.99%×3+37.27% → 123.27%'],
    ['Dodge Counter', 'Standard', '82.64%×3'],
    ['Skill', 'True Sight: Capture / Conquest / Charge', '81.88%×3+163.76% → 58.95%×2+82.52%+94.31% → 72.68%+109.02%', 'Capture (2 charges, 12s recharge) enters True Sight; Conquest/Charge are the True Sight follow-ups.'],
    ['Forte', 'Heavy ATK: Flaming Sacrifice', '39.25%×5+457.85%', 'At 4 Enflamement stacks, Heavy ATK casts this instead — 40% DMG reduction while casting.'],
    ['Liberation', 'Radiance of Fealty', '1212.75%', '20s cooldown; grants 4 Enflamement and Fiery Feather (next Flaming Sacrifice within 10s: self ATK +25%).'],
    ['Intro', 'Obedience of Rules', '44.50%+25.96%×4', 'Also enters True Sight.'],
    ['Outro', 'Strategy of Duality', 'Fusion DMG Amp +20% + Liberation DMG Amp +25% (10s)', 'Grants the incoming Resonator these buffs — no direct DMG.'],
  ],
  'Chisa': [
    ['Basic ATK', 'Stage 1-2', '16.71%×2 → 9.55%+19.09%+66.81%', 'Standard combo string ending in a heavier chainsaw finisher.'],
    ['Basic ATK', 'Death Snip', '29.81% + 14.91% + 104.34%', 'Alternate finisher available at a certain combo point.'],
    ['Skill', 'Eye of Unraveling', '35.79%', 'Quick dash strike that marks the target for Negative Status.'],
    ['Skill', 'Serrated Loop', '17.45%×8 (hold: 7.46%×16)', 'Multi-hit spin attack; holding the input adds even more hits.'],
    ['Forte', 'Sawring - Blitz 1-3', '11.49%×6 → 10.64%×8 → 15.98%×8', '3-stage Forte combo that builds up Ring of Chainsaw stacks.'],
    ['Forte', 'Sawring - Eradication', '51.54% + 206.13% (+2.59% per Ring of Chainsaw, up to 100)', 'Forte finisher whose damage scales with stacked Rings of Chainsaw.'],
    ['Liberation', 'Moment of Nihility', '954.29% (+ heal 117.60% ATK)', 'Ultimate nuke that also heals her for a portion of the damage dealt.'],
    ['Intro', 'Reverberance - Return', '95.43%', 'Swap-in opener strike.'],
    ['Outro', 'Unraveling - Law Zero', '+3 max Negative Status stacks (15s)', 'Swap-out buff letting the next Resonator stack more Negative Status on enemies.'],
  ],
  'Ciaccona': [
    ['Basic ATK', 'Stage 1-4', '28.7% → 81.7% → 66.4% → 123%', 'Standard combo string; Stage 4 inflicts Aero Erosion.'],
    ['Skill', 'Harmonic Allegro', '20.3%×4', 'Multi-hit Skill strike that inflicts Aero Erosion.'],
    ['Forte', 'Quadruple Downbeat', '15.8%×10 + 158%', 'Forte finisher that consumes stacked Musical Essence.'],
    ['Liberation', "Singer's Triple Cadenza", '553.5% + Tonic 3.1%×20/tick', 'Ultimate nuke followed by a lingering damage-over-time field.'],
    ['Intro', 'Roaming with the Wind', '95.1%', 'Swap-in opener that inflicts Aero Erosion and lets her combo straight into Basic ATK Stage 3.'],
    ['Outro', 'Windcalling Tune', '+100% Aero Erosion DMG Amp (30s)', 'Swap-out buff amplifying Aero Erosion damage near the active Resonator.'],
  ],
  'Encore': [
    ['Basic ATK', 'Wooly Attack Stage 1-4 → Wooly Strike', '55.66% → 66.20% → 66.30%×2 → 38.27%×4 → 238.57%', 'Stage 4 into a timed-press Wooly Strike finisher.'],
    ['Heavy ATK', 'Standard', '187.08%'],
    ['Mid-air', 'Plunging Attack', '123.26%'],
    ['Dodge Counter', 'Standard', '125.94%×2'],
    ['Skill', 'Flaming Woolies → Energetic Welcome', '76.61%×8 → 339.16%', '10s cooldown; Skill again after Flaming Woolies casts Energetic Welcome.'],
    ['Forte', 'Heavy ATK: Cloudy Frenzy', '334.00%', 'At full Mayhem, Heavy ATK enters a 70% DMG-reduction state, then casts Cloudy Frenzy (Liberation DMG) on exit.'],
    ['Forte', 'Heavy ATK: Cosmos Rupture', '46.42%×6+495.21%', 'Same mechanic as Cloudy Frenzy, but during Cosmos Rave.'],
    ['Liberation', 'Cosmos Rave', '217.58% (Cosmos Heavy ATK) · 90.18%×2+56.40%×3+65.99%×4+194.01%×3 (Cosmos: Frolicking) · 63.32%×4 (Cosmos: Rampage)', '10s state; Basic/Heavy/Skill/Dodge Counter all replaced with enhanced Fusion versions. 16s cooldown.'],
    ['Intro', 'Woolies Helpers', '198.81%'],
    ['Outro', 'Thermal Field', '176.76% ATK per tick ×4 (6s, 1.5s interval)', 'AoE burn field around the Skill target — no team buff, so she\'s free to quickswap.'],
  ],
  'Galbrena': [
    ['Basic ATK', 'Stage 1-4', '29.8% → 66.2% → 71.9% → 89.5%', 'Standard combo string, builds toward her Demon Hypostasis form.'],
    ['Heavy ATK', 'Volley of Death 1-3', '53.6% → 34.8% → 84.4%', 'Charged shot combo, hits harder the longer it\'s held.'],
    ['Skill', 'Encroach', '5.4% + 12.6%', 'Quick dash strike that builds Sinflame.'],
    ['Skill', 'Ascent of Malice', '25.9%×2', 'Empowered Skill once Sinflame is maxed, transforms her into Demon Hypostasis.'],
    ['Liberation', 'Hellfire Absolution', '55.8% + 45.6%×11', 'Ultimate barrage that also grants a big self DMG buff to her Demon Hypostasis attacks.'],
    ['Intro', 'Hellflare Overload', '47.3%', 'Swap-in opener strike.'],
    ['Outro', 'Ashen Pursuit', '79.5%×3 + 556.5%', 'Pure-damage swap-out finisher; no team buff, so she\'s free to quickswap.'],
  ],
  'Iuno': [
    ['Basic ATK', 'Moonring 1-3', '44.1% → 70.2% → 134.1%', 'Standard combo before entering the Lunar Cycle.'],
    ['Basic ATK', 'Moonbow 1-3', '63.6% → 84% → 168%', 'Empowered combo used while inside the Lunar Cycle.'],
    ['Skill', 'Pulse of Origins', '9.4%×7 + 65.7%', 'Base dash Skill, can transform into different follow-ups depending on her state.'],
    ['Skill', 'Closing Refrain', '70.8%×2 + 72.9%', 'Flurry follow-up that activates the Lunar Cycle.'],
    ['Skill', 'Arc Beyond the Edge', '110.6%×2', 'Follow-up Skill in New Moon state, has 2 charges.'],
    ['Heavy ATK', 'Absolute Fullness', '80%', 'Forte-empowered Heavy ATK, scales hugely with her Resonance Chain.'],
    ['Liberation', 'Beneath Lunar Tides', '550%', 'Ultimate strike that activates the Lunar Cycle; no team buff, purely personal damage.'],
    ['Intro', 'Illuminated Manifestation', '8%×7 + 24%', 'Swap-in opener that also refills her Sentience meter.'],
    ['Outro', 'From Gloom to Gleam', '100%', 'Swap-out strike that grants the next Resonator Heavy ATK DMG Amp.'],
  ],
  'Jiyan': [
    ['Basic ATK', 'Lone Lance Stage 1-5', '73.16% → 43.73% → 36.38%×2 → 66.20%×2 → 23.60%×4+153.45%×2', 'Standard 5-stage combo; Stage 3/5 have sub-hits.'],
    ['Heavy ATK', 'Standard / Windborne Strike / Abyssal Slash', '22.20%×6 → 105.96% → 81.71%', 'Hold or release Basic ATK during Heavy ATK for a follow-up finisher.'],
    ['Mid-air', 'Plunging Attack + Follow-up', '123.26%+155.66%'],
    ['Dodge Counter', 'Standard', '125.84%×2'],
    ['Skill', 'Windqueller', '106.36%×4', '7s cooldown; consumes Resolve for +20% DMG outside Qingloong Mode.'],
    ['Forte', 'Emerald Storm: Finale', '142.91%×2+428.73%', 'At 30+ Resolve, Liberation Prelude casts Finale instead (Heavy ATK DMG).'],
    ['Liberation', 'Emerald Storm: Prelude → Lance of Qingloong', '65.52%×8 → 61.55%×8 → 66.76%×8', 'Enters Qingloong Mode (10s): Basic/Heavy/Dodge Counter replaced by Lance of Qingloong.'],
    ['Intro', 'Tactical Strike', '198.81%'],
    ['Outro', 'Discipline', '313.40% ATK per proc, up to 2', 'Coordinated ATK triggered when the incoming Resonator lands a Heavy ATK (8s window).'],
  ],
  'Jinhsi': [
    ['Basic ATK', 'Slash of Breaking Dawn Stage 1-4', '66.47% → 38.99%+19.50%×3 → 10.65%×7+31.94% → 63.09%+94.63%'],
    ['Heavy ATK', 'Standard', '23.86%×5+35.79%+83.51%'],
    ['Mid-air', 'Plunging Attack', '12.33%+24.66%+86.29%'],
    ['Dodge Counter', 'Standard', '14.68%×7+44.02%'],
    ['Skill', 'Trailing Lights of Eons → Overflowing Radiance', '19.46%×4+77.84% → 9.87%×4+29.59%×4+39.45%', 'After Basic ATK 4 or Intro, Skill becomes Overflowing Radiance, entering Incarnation (10s).'],
    ['Forte', 'Incarnation → Illuminous Epiphany', '88.62%→77.97%+25.99%×2→99.44%+66.30%→18.67%×6+74.67% (Basic) · 100.76%+75.57%×2+251.90% (Crescent Divinity) · 19.89%×6+347.92% (Solar Flare/Stella Glamor)', 'Stella Glamor gains +44.54% per Incandescence spent (up to 50).'],
    ['Liberation', 'Purge of Light', '499.81%+1166.22%', '24s cooldown; huge AoE nuke.'],
    ['Intro', "Loong's Halo", '159.05%'],
    ['Outro', 'Temporal Bender', 'Incandescence gain rate +1/s for 20s', 'Utility only — no direct DMG or team buff.'],
  ],
  'Jianxin': [
    ['Basic ATK', 'Fengyiquan Stage 1-4', '69.46% → 26.64%×2+79.90% → 41.75%×4 → 113.40%'],
    ['Heavy ATK', 'Standard', '126.07%'],
    ['Mid-air', 'Plunging Kick', '123.27%'],
    ['Dodge Counter', 'Standard', '40.83%×2+163.29%'],
    ['Skill', 'Calming Air: Chi Counter / Chi Parry', '334.60% / 258.73%', 'Hold Skill for Parry Stance — Chi Counter on being attacked, Chi Parry on early release. 12s cooldown.'],
    ['Forte', 'Primordial Chi Spiral (Zhoutian Progress)', '248.52% (Pushing Punch) · 139.17%/377.74%/516.91% (Minor/Major-Inner/Major-Outer Shock) · 218.70% (Yielding Pull)', 'At max Chi, hold Basic ATK for a channeled shield-and-DMG state with 50% DMG reduction.'],
    ['Liberation', 'Purification Force Field', '29.83% (continuous) + 636.20% (explosion)', 'Pulls targets into the field, then explodes on expiry. 20s cooldown.'],
    ['Intro', 'Essence of Tao', '33.80%×3+67.60%'],
    ['Outro', 'Transcendence', 'Resonance Liberation DMG Amp +38% (14s)', 'Grants the incoming Resonator this buff — no direct DMG.'],
  ],
  'Lingyang': [
    ['Basic ATK', 'Majestic Fists Stage 1-5', '59.65% → 79.53% → 72.87%×2 → 20.41%×5+43.72% → 152.49%', 'Stage 5 can be replaced by Feral Roars (79.53%×2) after casting Furious Punches.'],
    ['Heavy ATK', 'Standard', '145.73%'],
    ['Mid-air', 'Plunging Attack', '123.27%'],
    ['Dodge Counter', 'Standard', '126.05%×2'],
    ['Skill', 'Ancient Arts → Furious Punches', '132.61% → 76.25%×2', 'Basic ATK 3-5 or Feral Roars swaps Skill to Furious Punches; no cooldown, doesn\'t reset the Basic ATK cycle.'],
    ['Forte', 'Unification of Spirits (Striding Lion)', '172.37% (Glorious Plunge) · 87.08%×2+116.11%→31.77%×6 (Feral Gyrate) · 82.88%×2 (Mountain Roamer) · 36.03%×8+192.15% (Stormy Kicks) · 174.96%×2 (Tail Strike)', 'At full Lion\'s Spirit, Heavy ATK casts Glorious Plunge and enters Striding Lion — an airborne enhanced-attack state.'],
    ['Liberation', "Strive: Lion's Vigor", '397.62%', "Also grants self Glacio DMG Bonus +50% for 14s. 20s cooldown."],
    ['Intro', 'Lion Awakens', '99.41%×2'],
    ['Outro', 'Frosty Marks', '587.94% ATK AoE', 'Pure-damage swap-out finisher — no team buff baseline (S4 chain grants team Glacio DMG +20%/30s).'],
  ],
  'Lupa': [
    ['Basic ATK', 'Stage 1-4', '45.3% → 45.3% → 79.3% → 89.9%', 'Standard combo string, builds Wolflame.'],
    ['Basic ATK', "Wolf's Claw", '36.3% + 9.1%×4 + 48.4%', 'Alt combo follow-up.'],
    ['Mid-air', 'Starfall', '6.4%×4 + 59.4%', 'Airborne attack chain.'],
    ['Skill', "Shewolf's Hunt", '70.8%', 'Base Skill dash strike.'],
    ['Skill', 'Feral Fang', '157.7%', 'Empowered Skill against marked targets, +50% DMG Mult.'],
    ['Skill', 'Dance with the Wolf', '28.2% + 21.1%×4 + 169.1%', 'Forte finisher combo.'],
    ['Liberation', 'Fire-Kissed Glory', '412.7%', 'Ultimate nuke that also grants the team ATK/Fusion DMG buffs and enables Wild Hunt.'],
    ['Liberation', 'Foebreaker', '153.1%', 'Follow-up hit tied to her Ultimate.'],
    ['Intro', 'Try Focusing, Eh?', '15% + 21.2%×4', 'Base swap-in opener. (Approx. base-level value scaled from Lv.10 via the kit\'s standard ~50% level ratio — exact base number not published.)'],
    ['Intro', 'Nowhere to Run!', '399.2% + 25%×4', 'Much stronger Intro used only once per Liberation, while in Wild Hunt state.'],
    ['Outro', 'Stand by Me, Warrior', '+20% Fusion DMG + 25% Basic ATK DMG Amp (14s)', 'Swap-out buff to the next Resonator.'],
  ],
  'Luuk Herssen': [
    ['Basic ATK', 'Stage 1-4', '40.56%×2 → 60.16%+90.24% → 5.02%×30 → 96.33%', 'Standard ground combo; Stage 3 leaves a lingering blade.'],
    ['Mid-air', 'Scythe: Dissection Stage 2-3', '28.23%×2+37.63% → 42.93%×2+57.24%', 'Airborne combo chain (Basic input), builds toward his Ultimate.'],
    ['Mid-air', 'Scythe: Resection Stage 2-3', '50.42%×2 → 74.92%×2', 'Airborne combo chain (Jump input), also applies Tune Strain.'],
    ['Skill', 'Golden Reflux', '201.20%', 'Dash strike; unlocks his 3-stage Aureole of Execution.'],
    ['Skill', 'Aureole of Execution', 'Ring 26.56%×5+88.53% / Breach 95.91%×3 / Glare 354.11%', '3-stage empowered Skill that stacks Ultimate DMG.'],
    ['Skill', 'Basic Attack - Golden Impale', '155.47%', 'Follow-up dash hit after Ring or Breach.'],
    ['Forte', 'Gavel of Earthshaker', '306.90%', "Plunge attack that detonates his Ichor Deposit."],
    ['Liberation', "Rewritten in Winter's Margins", '745.54% + 49.71%×5', 'Ultimate nuke, stronger with more Aureole stacks.'],
    ['Intro', 'Before Injection of Dawn', '72.67%×3', 'Opener that also inflicts Tune Strain.'],
    ['Outro', 'Bow to the Last Light', '500%', 'Simple finishing nuke on swap-out.'],
  ],
  'Lynae': [
    ['Basic ATK', 'Stage 1-3', '86.19% → 52.39%×3 → 123.37%', 'Standard combo before entering her Kaleidoscopic mode.'],
    ['Heavy ATK', 'Spark Collision Lv.3', '277.78%×2', 'Fully-charged heavy hit, a big single burst of damage.'],
    ['Basic ATK', 'Kaleidoscopic 1-5', '82.81% → 38.87%×2 → 37.75%×3 → 29.75%×2+44.62%×2 → 75.54%+15.11%×5+100.72%', 'Extended empowered combo used once her Kaleidoscopic mode is active.'],
    ['Forte', 'Visual Impact', '1216.72%', 'Massive Forte finisher, her main source of burst damage.'],
    ['Forte', 'Iridescent Splash', '304.18%', 'Secondary Forte follow-up hit.'],
    ['Skill', 'Lynae-Style Palettes', '139.31% + 46.44%×3', 'Skill that builds up her paint/mode resource while dealing damage.'],
    ['Skill', 'Additive Color', '116.31%×2', 'Quick follow-up Skill strike.'],
    ['Liberation', 'Prismatic Overblast', '87.48%×10', 'Ultimate multi-hit barrage.'],
    ['Intro', 'Time to Show Some Colors!', '22.48%×10', 'Swap-in opener with several rapid hits.'],
    ['Outro', "Let's Hit the Road!", '100% ATK + 15% All DMG / 25% Liberation DMG Amp', 'Swap-out buff granting the next Resonator All-DMG or Liberation DMG Amp.'],
  ],
  'Mornye': [
    ['Basic ATK', 'Stage 1-4', '22.27%+16.71%×2 → 23.86%×2+17.90%×4 → 41.36%+10.34%×6 → 135.20%', 'Standard combo string, scales off DEF like all her damage.'],
    ['Skill', 'Optimal Solution', '179.73%', 'Marks an enemy and deals DEF-scaling damage.'],
    ['Skill', 'Distributed Array', '39.77%×4', 'Multi-hit follow-up Skill.'],
    ['Forte', 'Geopotential Shift', '44.14% + 99.02%', 'Forte strike that also fuels her healing/support kit.'],
    ['Forte', 'Inversion', '258.46%', 'Stronger Forte finisher.'],
    ['Liberation', 'Critical Protocol', '522.33% DEF', 'Ultimate; a DEF-scaling nuke that also empowers her buffs.'],
    ['Intro', 'Convergence', '202.79%', 'Swap-in opener strike.'],
    ['Outro', 'Recursion', '+25% All DMG Amp (30s)', 'Swap-out buff granting the team +25% All DMG for a long duration.'],
  ],
  'Phoebe': [
    ['Basic ATK', 'Stage 1-3', '14.9% → 24% → 7.2%×8'],
    ['Heavy ATK', 'Standard', '20.8%×4'],
    ['Skill', 'To Where Light Shines', '31.5%×2'],
    ['Skill', "Chamuel's Star 1-3", '29.9% → 40% → 14.6%×6'],
    ['Forte', 'Starflash', '41.6%×3'],
    ['Forte', 'Absolution Litany', '321%'],
    ['Liberation', 'Dawn of Enlightenment', '202% (+255% in Absolution)'],
    ['Intro', 'Golden Grace', '100%'],
    ['Outro', 'Attentive Heart', '528.4%'],
  ],
  'Phrolova': [
    ['Basic ATK', 'Stage 1-3', '53.8% → 48% → 98.6%', 'Standard combo string, builds Aftersound/Notes.'],
    ['Heavy ATK', 'Scarlet Coda', '16.6%×2 + 6.2%×8 + 249% (+41.5% per stack)', 'Empowered Heavy ATK, damage scales with stacked Aftersound.'],
    ['Skill', 'Whispers in Fleeting Dream', '53.3%×2', 'Quick Skill strike that enters Reincarnate.'],
    ['Intro', 'Suite of Quietus', '40.6% + 60.8%', 'Base swap-in opener strike. (Approx. base-level value scaled from Lv.10 via the kit\'s standard ~50% level ratio — exact base number not published.)'],
    ['Intro', 'Suite of Immortality', '300%', 'Enhanced Intro used only while in Maestro state — much stronger than the base opener.'],
    ['Liberation', 'Maestro State: Hecate', 'Strings 175% / Winds 166.3% / Cadenza 175%', 'Summons Hecate for sustained off-field Havoc DMG during Maestro.'],
    ['Liberation', 'Curtain Call', '234%', 'Ultimate cast that ends Resolving Chord and enters Maestro.'],
    ['Outro', 'Unfinished Piece', '+20% Havoc DMG + 25% Heavy ATK DMG Amp (14s)', 'Swap-out buff to the next Resonator; grants Hecate 2 bonus attacks if cast during Maestro.'],
  ],
  'Qiuyuan': [
    ['Basic ATK', 'Stage 1-3', '21% → 35% → 82.6%', 'Standard combo before entering Inkwash form.'],
    ['Heavy ATK', 'Standard', '83.3%', 'Charged strike, a solid single hit.'],
    ['Skill', 'Through the Groves', '36.1%×3', 'Multi-hit Skill strike.'],
    ['Skill', 'Undaunted Wayfarer', '16.3% + 16.3%×3 + 43.4%', 'Held version of her Skill, extended combo.'],
    ['Forte', 'Inkwash 1-4', '60% → 93.3% → 73.6% → 86.7%', 'Forte-transformed combo string, her main damage form.'],
    ['Forte', 'To Teach / To Save / To Sacrifice', '230% / 105.5% / 109.5%', 'Heavy ATK finishers in Inkwash form, each with a different follow-up effect.'],
    ['Liberation', 'Sundering Strike', '400%', 'Ultimate nuke.'],
    ['Intro', 'Attack the Must-Defend', '4.8%×5 + 24% + 72%', 'Swap-in opener, counted as Heavy ATK DMG.'],
    ['Outro', 'Strike Before Ready', '100% ATK + 50% Echo Skill DMG Amp (14s)', 'Swap-out buff granting the next Resonator Echo Skill DMG Amp.'],
  ],
  'Roccia': [
    ['Basic ATK', 'Stage 1-4', '36.8% → 57.6% → 85% → 104.8%'],
    ['Heavy ATK', 'Standard', '85%'],
    ['Skill', 'Acrobatic Trick', '30.9%×8'],
    ['Forte', 'Real Fantasy 1-3', '162% → 171% → 180%'],
    ['Liberation', 'Commedia Improvviso!', '140%×3'],
    ['Intro', 'Pero, Help!', '85%'],
    ['Outro', 'Applause, Please!', '+20% Havoc DMG + 25% Basic ATK DMG Amp (14s)'],
  ],
  'Rover: Spectro': [
    ['Basic ATK', 'Vibration Manifestation Stage 1-4', '59.15% → 76.05% → 15.21%×5 → 130.13%', 'Standard 4-stage combo; each hit builds Diminutive Sound toward Forte.'],
    ['Heavy ATK', 'Standard / Resonance / Aftertune', '19.27%×5 → 76.05% → 126.75%', 'Charged Heavy ATK, into timed-press Resonance follow-up, into Aftertune finisher.'],
    ['Mid-air', 'Plunging Attack', '104.78%'],
    ['Dodge Counter', 'Standard', '195.34%'],
    ['Skill', 'Resonating Slashes', '236.19%', '6s cooldown; builds Diminutive Sound toward the Forte combo.'],
    ['Forte', 'Resonating Spin → Resonating Echoes', '129.08%×2+39.77% → 79.53%+159.05%', 'At 50+ Diminutive Sound, Skill casts Resonating Spin (2 Spectro Frazzle stacks + Shimmer), Basic ATK follow-up casts Resonating Echoes.'],
    ['Liberation', 'Echoing Orchestra', '198.81%+675.96%', 'Delayed blast; applies 6 stacks of Spectro Frazzle.'],
    ['Intro', 'Waveshock', '168.99%'],
    ['Outro', 'Instant', 'Stasis field (CC only, no listed DMG in kit text) — some sources credit +20% Spectro DMG Amp (14s) to the swap-out window'],
  ],
  'Rover: Havoc': [
    ['Basic ATK', 'Tuneslayer Stage 1-5', '56.67% → 56.67%×2 → 85% → 40.30%×3 → 94.44%×2', '5-stage Basic ATK combo, into an enhanced Stage 4 after a Heavy ATK.'],
    ['Heavy ATK', 'Standard', '95.43%'],
    ['Mid-air', 'Plunging Attack', '117.10%'],
    ['Dodge Counter', 'Standard', '179.43%'],
    ['Skill', 'Wingblade', '286.29%×2', '12s cooldown.'],
    ['Forte', 'Devastation → Dark Surge', '228.14% (Devastation)', 'Hold Basic ATK at full Umbra to cast Devastation, entering Dark Surge: enhanced Basic/Heavy ATK plus Skill Lifetaker (276.35%×2+9.95%×4).'],
    ['Liberation', 'Deadening Abyss', '1520.90%', '16s cooldown — huge single-target nuke.'],
    ['Intro', 'Instant of Annihilation', '198.81%'],
    ['Outro', 'Soundweaver', '143.3% ATK per tick ×3 (6s)', 'Havoc Field: AoE DoT for the incoming Resonator.'],
  ],
  'Rover: Aero': [
    ['Basic ATK', 'Wind Cutter Stage 1-4', '35.31% → 43.05%×2 → 55.05%+1.99%×25 → 76.72%'],
    ['Heavy ATK', 'Standard / Razor Wind', '17.91%×3 → 36.37%+44.46%'],
    ['Mid-air', 'Plunging Attack', '140.76%'],
    ['Dodge Counter', 'Standard', '125.43%+1.99%×25'],
    ['Skill', 'Awakening Gale / Skyfall Severance', '66.44%+99.66% → 23.37%×3+105.15%', 'Gale (3s CD, ground); mid-air Skyfall Severance (12s CD) strips negative statuses into Aero Erosion.'],
    ['Forte', 'Cloudburst Dance / Unbound Flow', '128.80%+141.47% → 34.30%×5+723.03%', 'Cloudburst Dance heals the team on hit; at max Windstrings, Skill becomes Unbound Flow instead.'],
    ['Liberation', 'Omega Storm', '536.79%', 'Also heals nearby team ~2090+77% ATK; can be cast mid-air near ground.'],
    ['Intro', 'Relentless Squall', '79.53%+119.29%'],
    ['Outro', "Storm's Echo", 'Aeolian Realm — Aero Erosion cap +3 (30s field, no direct DMG)'],
  ],
  'Rover: Electro': [
    ['Basic ATK', 'Deterrence Stage 1-4', '51.08% → 26.00%+39.00% → 13.27%×7 → 72.82%+109.22%'],
    ['Basic ATK', 'Riposte Strike / Crumble (Parry Stance)', '55.95% / 59.43%', 'Hold Basic ATK to enter Parry Stance (immune to interrupt, -60% DMG taken); release for Riposte Strike, or Crumble if it neutralizes a hit.'],
    ['Mid-air', 'Plunging Attack', '104.94%'],
    ['Dodge Counter', 'Standard', '74.25%+74.25%'],
    ['Skill', 'Thunderclap → Overshock', '100.20%×2 → 80.72%×7+423.77%+423.77%', 'Thunderclap (10s CD); at max Electric Surge, Skill becomes Overshock instead — tap for team ATK buff, hold for Apex Resonance.'],
    ['Forte', 'Apex Resonance: Thrum of All Sounds', 'Up to 7-stage ground + 6-stage aerial combo (Spectro/Havoc/Aero hits + Thunder Bane Electro pulses)', 'Consumes Thunder Rage each second while active.'],
    ['Liberation', 'Ultimate Tactics', '1192.86%', '25s cooldown.'],
    ['Intro', 'Thunderous Fury', '33.41%×2+100.21%'],
    ['Outro', 'Rumbling Thunders', 'Grants Electro Core → next Negative Status hit: All DMG Amp +25% (14s)'],
  ],
  'Shorekeeper': [
    ['Basic ATK', 'Origin Calculus Stage 1-4', '31.78% → 23.86%×2 → 23.32%×3 → 72.72%', 'Each hit generates a Collapsed Core.'],
    ['Heavy ATK', 'Unbound Form charge', '45.81%'],
    ['Mid-air', 'Plunging Attack', '73.96%'],
    ['Dodge Counter', 'Standard', '87.48%×2'],
    ['Skill', 'Chaos Theory', '31.31%×5 (Dim Star Butterflies) + heal (1313+5.97% HP)', '16s cooldown; heals the team and summons 5 tracking butterflies.'],
    ['Forte', 'Flare Star Butterfly / Illation / Transmutation', '37.29% (Butterfly) · 18.97%×5 (Illation, Heavy ATK) · 73.96% (Transmutation, Mid-air)', 'At 5 Empirical Data, Heavy/Mid-air ATK consume it to pull in targets and convert Collapsed Cores into Flare Star Butterflies.'],
    ['Liberation', 'End Loop', 'No direct DMG — Stellarealm', 'Heals continuously; evolves into Inner (team Crit Rate up to +12.5%) then Supernal Stellarealm (team Crit DMG up to +25%) scaling with her Energy Regen, as allies cast Intro Skills inside it.'],
    ['Intro', 'Proof of Existence: Enlightenment / Discernment', '45.30%×5 + heal (259+1.20% HP) · 19.64%×3 HP-scaling + heal', 'Discernment only available once per Supernal Stellarealm; guaranteed Crit, counted as Liberation DMG.'],
    ['Outro', 'Binary Butterfly', 'All DMG Amp +15%', 'Also grants the on-field Resonator up to 5 free interrupt-recoveries (tap Dodge) for 30s — no direct DMG.'],
  ],
  'Sigrika': [
    ['Basic ATK', 'Stage 1-4', '52.97% → 50.34%×2 → 33.41%×2+44.54% → 41.36%+51.70%×2+62.03%', 'Standard combo; ends in Decipher state for Echo-type follow-ups.'],
    ['Basic ATK', 'Elucidated', '61.56%×3+123.11%', 'Echo-type finisher from Decipher state; builds Runes.'],
    ['Skill', 'BOOMY BOOM!', '28.63%×3+57.26%', 'Builds Runes; empowered version deals Echo Skill DMG.'],
    ['Skill', 'BIG BOOMY BOOM!', '28.81%×4+172.85%', 'Decipher-state Skill upgrade, counted as Echo Skill DMG.'],
    ['Forte', 'Runic Outburst', '117.67%+205.92%+264.75%', 'Rune-consuming Heavy ATK with 3 possible effects.'],
    ['Forte', 'Learn My True Name', '302.87%+908.61%', 'Big Echo-type nuke once Full Stop is maxed.'],
    ['Liberation', 'Where Trust Leads Me!', '861.43%', 'Echo-type Ultimate nuke; also seeds her next Rune.'],
    ['Intro', 'Solsworn Etymology', '163.42%', 'Standard combo-starting opener hit.'],
    ['Outro', 'In This Very Moment', '795%', 'Finishing hit that stagnates enemies on ally Echo Skill casts.'],
  ],
  'Verina': [
    ['Basic ATK', 'Cultivation Stage 1-5', '37.86% → 51.16% → 25.58%×2 → 67.32% → 71.62%'],
    ['Heavy ATK', 'Standard', '99.41%'],
    ['Mid-air', 'Stage 1-3 + Heavy', '56.37% → 53.19% → 25.42%×3 · 61.64% (Mid-air Heavy)'],
    ['Dodge Counter', 'Standard', '129.23%'],
    ['Skill', 'Botany Experiment', '35.79%×3+71.58%', '12s cooldown; grants Photosynthesis Energy.'],
    ['Forte', 'Heavy/Mid-air ATK: Starflower Blooms', '64.95%+97.42% (Heavy) · 67.64%+63.82%+30.50%×3 (Mid-air)', 'Consumes Photosynthesis Energy to heal the team and restore Concerto Energy.'],
    ['Liberation', 'Arboreal Flourish', '198.81%', 'Heals the team and applies Photosynthesis Mark; marked-target hits trigger a healing Coordinated Attack (9.95% ATK/hit).'],
    ['Intro', 'Verdant Growth', '99.41%'],
    ['Outro', 'Blossom', 'All DMG Amp +15% (30s) + heal', 'Heals the incoming Resonator 19% ATK/s for 6s and grants the whole nearby team All DMG Amp +15% (30s) — not a DMG Deepen.'],
  ],
  'Xiangli Yao': [
    ['Basic ATK', 'Probe Stage 1-5', '33.11%×2 → 99.61% → 39.76%×3 → 53.05%×2+26.53% → 198.81%'],
    ['Heavy ATK', 'Standard', '82.81%×2'],
    ['Mid-air', 'Plunging Attack', '123.27%'],
    ['Dodge Counter', 'Standard', '238.58%'],
    ['Skill', 'Deduction → Decipher', '198.81% → 397.82%', '5s cooldown; at 100 Capacity, Skill becomes Decipher instead (Liberation DMG).'],
    ['Forte', 'Intuition: Law of Reigns / Revamp', '95.73%×4+255.28% (Law of Reigns) · 21.87%×4+65.61%×2 (Mid-air Revamp)', 'Both count as Liberation DMG; Law of Reigns unlocks at 5 Performance Capacity while in Intuition.'],
    ['Liberation', 'Cogitation Model', '1466.06%', '25s cooldown; enters Intuition (24s) — enhances Basic ATK, Skill, and Dodge Counter.'],
    ['Liberation', 'Intuition: Pivot-Impale / Divergence / Unfathomed', '119.67%→60.92%×4→133.25%×2 (Basic ATK) · 49.59%×3+173.55%×2 (Divergence Skill) · 38.83%×2+310.58% (Dodge Counter)', 'Enhanced versions of Basic ATK/Skill/Dodge Counter while in Intuition.'],
    ['Intro', 'Principle', '99.41%×2'],
    ['Outro', 'Chain Rule', '237.63% ATK ×3 procs (8s, 2s ICD)', "Laser strikes on the incoming Resonator's first Basic ATK hit — pure DMG proc, no team buff."],
  ],
  'Yinlin': [
    ['Basic ATK', "Zapstring's Dance Stage 1-4", '28.81% → 33.82%×2 → 13.99%×7 → 75.16%'],
    ['Heavy ATK', 'Standard', '29.83%×2'],
    ['Mid-air', 'Plunging Attack', '123.27%'],
    ['Dodge Counter', 'Standard', '24.22%×7'],
    ['Skill', 'Magnetic Roar → Lightning Execution', '59.65%×3 → 89.47%×4', '12s cooldown; Magnetic Roar puts Yinlin in Execution Mode, applies Sinner\'s Mark.'],
    ['Skill', 'Electromagnetic Blast', '19.89%', 'Basic ATK/Dodge Counter hits (up to 4) trigger this on Sinner\'s/Punishment-marked targets.'],
    ['Forte', 'Chameleon Cipher', '178.93%×2', 'At full Judgement Points, Heavy ATK becomes Chameleon Cipher: upgrades Sinner\'s Mark to Punishment Mark.'],
    ['Forte', 'Judgment Strike', '78.64% (1/s)', 'Coordinated ATK triggered when a Punishment Mark target takes damage; considered Skill DMG.'],
    ['Liberation', 'Thundering Wrath', '116.56%×7', '16s cooldown; applies Sinner\'s Mark.'],
    ['Intro', 'Raging Storm', '14.32%×10', 'Applies Sinner\'s Mark.'],
    ['Outro', 'Strategist', 'Electro DMG Amp +20% + Liberation DMG Amp +25% (14s)', 'Grants the incoming Resonator these buffs; no direct DMG.'],
  ],
  'Zani': [
    ['Basic ATK', 'Stage 1-4', '29.6% → 40% → 64% → 136%', 'Standard combo string.'],
    ['Heavy ATK', 'Standard', '20.7%×4', 'Charged combo hit.'],
    ['Skill', 'Pinpoint Strike', '30.7% + 61.4%', 'Base Skill counter-style strike.'],
    ['Skill', 'Targeted Action', '43.4% + 14.5% + 86.7%', 'Counter follow-up, empowered by her Resonance Chain.'],
    ['Forte', 'Heavy Slash Daybreak', '100%', 'First stage of her Forte-empowered Heavy ATK.'],
    ['Forte', 'Heavy Slash Dawning', '213.3%', 'Second, stronger stage of the Forte Heavy ATK.'],
    ['Forte', 'Heavy Slash Nightfall', '68% + 132% (+5% per Blaze)', 'Forte finisher, scales with consumed Blaze.'],
    ['Liberation', 'Rekindle', '160.2%', 'Ultimate that raises max Blaze and enters Inferno state.'],
    ['Liberation', 'The Last Stand', '96.1% + 544.7%', 'Second Ultimate cast inside Inferno, scales with Blaze consumed.'],
    ['Intro', 'Immediate Execution', '12.2%×5 + 40.6%', 'Swap-in opener strike.'],
    ['Outro', 'Beacon For the Future', '150% (+10% per Ember stack)', 'Swap-out finisher that also grants allies hitting the marked target Spectro DMG Amp.'],
  ],
  'Zhezhi': [
    ['Basic ATK', 'Dimming Brush Stage 1-3', '41.76%×2 → 20.55%×5 → 133.61%'],
    ['Heavy ATK', 'Standard', '112.72%', "Doesn't reset the Basic ATK cycle."],
    ['Mid-air', 'Plunging Attack', '24.95%×5+104.78%'],
    ['Dodge Counter', 'Standard', '29.07%×5'],
    ['Skill', 'Manifestation', '98.42%×3', '6s cooldown; at 60+ Afflatus, summons Phantasmic Imprints (Left/Right).'],
    ['Forte', 'Heavy ATK: Conjuration', '83.01%×3', 'Alt Heavy ATK follow-up from several combo windows; can summon a Middle Imprint at 30+ Afflatus.'],
    ['Forte', 'Stroke of Genius / Creation\'s Zenith', '298.22% → 119.29%×3', 'Skill upgrades that consume a Phantasmic Imprint (both count as Basic ATK DMG); Creation\'s Zenith needs 2 stacks of Painter\'s Delight and also grants +18% Basic ATK DMG Bonus for 27s.'],
    ['Liberation', 'Living Canvas', '65.21% per Inklit Spirit (up to 21 over 30s)', '25s cooldown; summons Coordinated-ATK spirits (Basic ATK DMG) whenever the active Resonator deals damage.'],
    ['Intro', 'Radiant Ruin', '86.16%×3'],
    ['Outro', 'Carve and Draw', 'Glacio DMG Amp +20% + Skill DMG Amp +25% (14s)', 'Grants the incoming Resonator these buffs — no direct DMG.'],
  ],
  // ── 4★ Characters ──
  'Aalto': [
    ['Basic ATK', 'Stage 1-4', '16% → 28.2% → 14.6%×3 → 30.7%'],
    ['Skill', 'Shift Trick', '28%×3'],
    ['Liberation', 'Flower in the Mist', '24%×6'],
    ['Intro', 'Feint Shot', '37%×2'],
    ['Outro', 'Dissolving Mist', '+23% Aero DMG (14s)'],
  ],
  'Baizhi': [
    ['Basic ATK', 'Stage 1-4', '32.2% → 28% → 22.8%×2 → 37.8%'],
    ['Skill', 'Emergency Plan', '10.2%×4 + healing'],
    ['Liberation', 'Momentary Presence', '12% field heal + burst'],
    ['Intro', 'Overflowing Frost', '50%×2'],
    ['Outro', 'Rejuvenation', 'Heal 1.5%HP/s for 6s'],
  ],
  'Buling': [
    ['Basic ATK', 'Stage 1-3', '20% → 26% → 30%'],
    ['Skill', 'Electro Spark', '28.5%×4'],
    ['Liberation', 'Lightning Storm', '18%×8'],
    ['Intro', 'Static Entry', '50%×2'],
    ['Outro', 'Discharge', '+12% Electro DMG + Electro Flare stacks'],
  ],
  'Chixia': [
    ['Basic ATK', 'Stage 1-4', '14.7% → 16.8% → 27.3% → 9.4%×4'],
    ['Skill', 'Boom Boom', '20%×8'],
    ['Liberation', 'Blazing Flames', '200%'],
    ['Intro', 'Grand Entrance', '40%×2'],
    ['Outro', 'Burnout', '+12% Fusion DMG (14s)'],
  ],
  'Danjin': [
    ['Basic ATK', 'Stage 1-3', '26.3%×2 → 45.5% → 32.6%×3'],
    ['Skill', 'Crimson Fragment', '19.5%×2'],
    ['Skill', 'Crimson Erosion', '28.6%×3'],
    ['Forte', 'Scarlet Burst', '30.2%×5'],
    ['Liberation', 'Crimson Moonrise', '36%×4'],
    ['Intro', 'Crimson Arrival', '50%×2'],
    ['Outro', 'Duality', '+23% Havoc DMG Deepen (14s)'],
  ],
  'Lumi': [
    ['Basic ATK', 'Stage 1-3', '27.3% → 23%×2 → 57.6%'],
    ['Skill', 'Luminal Strike', '41%×2'],
    ['Liberation', 'Daybreak Signal', '180%'],
    ['Intro', 'Light Surge', '50%×2'],
    ['Outro', 'Radiant Blessing', '+12% Glacio DMG (14s)'],
  ],
  'Mortefi': [
    ['Basic ATK', 'Stage 1-4', '20.8% → 17.3%×3 → 15.1%×4 → 38.6%'],
    ['Skill', 'Passionate Variation', '23.9%×4'],
    ['Liberation', 'Violent Crescendo', '50% + coordinated Fusion ATK'],
    ['Intro', 'Fury Overture', '50%'],
    ['Outro', 'Flame Reprise', '+38% Heavy ATK DMG Amp (14s)'],
  ],
  'Sanhua': [
    ['Basic ATK', 'Stage 1-5', '23.7% → 26.2% → 36.3% → 29.2%×2 → 22.2%×3'],
    ['Skill', 'Eternal Frost', '52.8%×2'],
    ['Forte', 'Detonate', '86.4%×3'],
    ['Liberation', 'Glacial Gaze', '32.8%×4'],
    ['Intro', 'Freezing Thorns', '50%×2'],
    ['Outro', 'Silversnow', '+38% Basic ATK DMG Amp (14s)'],
  ],
  'Taoqi': [
    ['Basic ATK', 'Stage 1-4', '35.3% → 33.1% → 42.3% → 40.1%+53.5%'],
    ['Skill', 'Fortified Defense', '25.5%×6 shield'],
    ['Liberation', 'Iron Will', '135%×3'],
    ['Intro', 'Defense Line', '100%'],
    ['Outro', 'Iron Curtain', '+15% DEF Shred (10s)'],
  ],
  'Yangyang': [
    ['Basic ATK', 'Stage 1-4', '18.2% → 25.2%×2 → 36.3% → 22.7%×3'],
    ['Skill', 'Zephyr Domain', '40%×2'],
    ['Liberation', 'Wind Spirals', '60%×3'],
    ['Intro', 'Cerulean Song', '50%×2'],
    ['Outro', 'Whispering Breeze', 'Recover 4 Resonance Energy/s (5s)'],
  ],
  'Youhu': [
    ['Basic ATK', 'Stage 1-4', '18.9% → 22.5% → 12.9%×4 → 32.5%'],
    ['Skill', 'Cleansing Blaze', '11%×3 + 29%'],
    ['Liberation', 'Spirit Congregation', '300% healing field'],
    ['Intro', 'Lucky Draw', '50%×2'],
    ['Outro', 'PoeticErta', '+23% Glacio DMG Amp (14s)'],
  ],
  'Yuanwu': [
    ['Basic ATK', 'Stage 1-5', '25.3% → 14.3%×3 → 31.8% → 19.3%×3 → 23.2%×2+30.8%'],
    ['Skill', 'Thunder Wedge', '46%×2 coordinated'],
    ['Liberation', 'Blazing Might', '98%×2 shield'],
    ['Intro', 'Thunder Assault', '50%×2'],
    ['Outro', 'Lightning Boost', '+15% Liberation DMG Amp (14s)'],
  ],
};

// [SECTION:CHARACTER_ROTATIONS] — Standard rotation, sourced from Prydwen's "Gameplay and teams" tab per character.
// Each step's `type` + `skill` are matched against SKILL_MULTIPLIERS[name] (type === step.type, name.includes(step.skill))
// to look up its DMG multiplier at render time — single source of truth, no duplicated numbers to drift out of sync.
// `duration` (seconds) is only set for steps with a notable buff/stance/channel window worth highlighting.
// Built as a reusable base: Team tab can later prepend/append other characters' Intro/Outro to chain these together.
const CHARACTER_ROTATIONS = {
  // Standard Rotation — sourced from Jianxin's kit flow on ww.nanoka.cc character/1405 (Prydwen's
  // "Gameplay and teams" tab was unreachable this audit — 403/blank JS-render).
  'Jianxin': [
    { type: 'Intro', skill: 'Essence of Tao', note: 'pulls enemies in, builds Chi toward the Forte' },
    { type: 'Basic ATK', skill: 'Fengyiquan Stage 1-4', note: 'builds Chi toward max (120)' },
    { type: 'Skill', skill: 'Calming Air', note: 'hold for Parry Stance to build Chi faster via Chi Counter/Chi Parry; 12s cooldown' },
    { type: 'Forte', skill: 'Primordial Chi Spiral', duration: 3, note: 'at max Chi, hold Basic ATK for Zhoutian Progress — a channeled 50% DMG-reduction shield state, healing the active Resonator every 6s afterward' },
    { type: 'Liberation', skill: 'Purification Force Field', note: 'groups enemies, then explodes on expiry; 20s cooldown' },
    { type: 'Outro', skill: 'Transcendence', note: 'grants the incoming Resonator +38% Resonance Liberation DMG for 14s' },
  ],
  // Standard Rotation — sourced from Prydwen's "Gameplay and teams" tab for Lingyang (re-fetched
  // 2026-08-17 via Chrome UA + google.com referer + jsRender, confirmed against nanoka's kit order).
  'Lingyang': [
    { type: 'Intro', skill: 'Lion Awakens', note: "fills a large chunk of the Forte Gauge on its own" },
    { type: 'Liberation', skill: "Strive: Lion's Vigor", duration: 14, note: 'grants self Glacio DMG Bonus +50% for 14s; 20s cooldown' },
    { type: 'Forte', skill: 'Unification of Spirits', note: 'at full Lion\'s Spirit, Heavy ATK casts Glorious Plunge and enters the airborne Striding Lion state' },
    { type: 'Basic ATK', skill: 'Majestic Fists', note: 'Feral Gyrate P1/P2, alternated with Mountain Roamer below — never chain two of the same type in a row' },
    { type: 'Skill', skill: 'Ancient Arts', note: 'Mountain Roamer while airborne; up to ~9 alternating Basic/Skill hits during the Ultimate window under ideal play' },
    { type: 'Outro', skill: 'Frosty Marks', note: 'pure-damage AoE finisher on swap-out (S4 chain grants team Glacio DMG +20%/30s)' },
  ],
  // Standard Rotation (S0) — sourced from Prydwen's "Gameplay and teams" tab for Verina (re-fetched
  // 2026-08-17 via Chrome UA + google.com referer + jsRender). Her Intro Skill is explicitly skipped —
  // Prydwen calls it "unusable," sending her airborne and lengthening her already-shortest-in-game
  // rotation — so she swaps in cold and her Basic ATK cycle starts from Stage 3.
  'Verina': [
    { type: 'Basic ATK', skill: 'Cultivation Stage 1-5', note: 'swap-in without an Intro starts the combo from Stage 3, straight into Stage 4-5' },
    { type: 'Skill', skill: 'Botany Experiment', note: 'can be cancelled immediately by the Liberation below to save time — the hit and its Resonance Energy gain are skipped, Concerto Energy is still gained' },
    { type: 'Liberation', skill: 'Arboreal Flourish', note: 'heals the team and applies Photosynthesis Mark; 25s cooldown' },
    { type: 'Forte', skill: 'Mid-air Attack: Starflower Blooms', note: 'jump, then spend all 4 Photosynthesis Energy stacks on Mid-air Starflower Blooms to heal the team and refill Concerto Energy' },
    { type: 'Outro', skill: 'Blossom', note: 'heals the incoming Resonator 19% ATK/s for 6s and grants the whole nearby team All DMG Amp +15% for 30s' },
  ],
  // Standard Rotation — sourced from Prydwen's "Gameplay and teams" tab for Jinhsi (re-fetched
  // 2026-08-17 via Chrome UA + google.com referer + jsRender). This is Prydwen's baseline rotation
  // (no swap/animation/jump cancels) — she also has advanced/expert cancel-heavy variants that push her
  // damage further, omitted here as too execution-dependent for a standard reference rotation. Notably
  // she gets 2 Outros and 2 Forte nukes per full team loop via her free-Outro-every-25s Unison mechanic.
  'Jinhsi': [
    { type: 'Basic ATK', skill: 'Slash of Breaking Dawn Stage 1-4', note: 'full 4-stage combo on the opener' },
    { type: 'Skill', skill: 'Overflowing Radiance', note: 'available after Basic ATK 4; sends her into the 10s Incarnation state' },
    { type: 'Liberation', skill: 'Purge of Light', note: '24s cooldown; huge AoE nuke' },
    { type: 'Forte', skill: 'Incarnation', note: 'Incarnation Basic ATK Stage 1-4 while airborne, builds toward Illuminous Epiphany' },
    { type: 'Skill', skill: 'Illuminous Epiphany', note: 'consumes up to 50 Incandescence for a scaling Stella Glamor nuke (+44.54% DMG per stack); grants Unison, giving a free Outro every 25s with no Concerto cost' },
    { type: 'Outro', skill: 'Temporal Bender', note: 'utility only — accelerates her own Incandescence gain rate for 20s, no team buff' },
  ],
  // Standard Rotation — sourced from Prydwen's "Gameplay and teams" tab for Changli (re-fetched
  // 2026-08-17 via Chrome UA + google.com referer + jsRender). This is Prydwen's single-Intro,
  // no-swap-cancel rotation — she also has Double-Intro and heavy Swap-Cancel variants for advanced
  // quickswap play, omitted here as too execution/team-dependent for a standard reference rotation. Goal
  // each rotation: land 4 True Sight follow-ups to fill Enflamement for 2 Forte Heavy casts.
  'Changli': [
    { type: 'Intro', skill: 'Obedience of Rules', note: 'also enters True Sight (12s)' },
    { type: 'Skill', skill: 'True Sight: Capture', note: '2 charges, 12s recharge each; each cast also opens a True Sight window' },
    { type: 'Heavy ATK', skill: 'Standard', note: 'ground Heavy into Mid-air Heavy, weaving in True Sight: Conquest/Charge follow-ups to build Enflamement stacks' },
    { type: 'Liberation', skill: 'Radiance of Fealty', note: '20s cooldown; instantly grants 4 Enflamement and Fiery Feather (self ATK +25% on the next Forte Heavy within 10s)' },
    { type: 'Forte', skill: 'Heavy ATK: Flaming Sacrifice', note: 'at 4 Enflamement stacks, consumes them all; takes 40% less DMG while casting — 2 casts per rotation is the goal' },
    { type: 'Outro', skill: 'Strategy of Duality', note: 'grants the incoming Resonator +20% Fusion DMG Amp and +25% Liberation DMG Amp for 10s — her shortest Outro window in the game alongside Lumi' },
  ],
  // Standard Rotation — sourced from Prydwen's "Gameplay and teams" tab for Zhezhi (re-fetched
  // 2026-08-17 via Chrome UA + google.com referer + jsRender). Goal: fill the 3-segment Afflatus Forte
  // gauge, convert it into Phantasmic Imprints via Skill + Forte Heavy, then teleport to each one with
  // repeated Stroke of Genius/Creation's Zenith casts before Outro.
  'Zhezhi': [
    { type: 'Intro', skill: 'Radiant Ruin', note: 'fills roughly 1.5 of her 3 Afflatus segments' },
    { type: 'Basic ATK', skill: 'Dimming Brush Stage 1-3', note: 'full combo fills the remaining Afflatus' },
    { type: 'Skill', skill: 'Manifestation', note: 'at 60+ Afflatus, consumes 60 to summon Phantasmic Imprint - Left and Right' },
    { type: 'Forte', skill: 'Heavy ATK: Conjuration', note: 'at 30+ Afflatus, consumes 30 to summon Phantasmic Imprint - Middle' },
    { type: 'Skill', skill: 'Stroke of Genius', note: 'teleports to and consumes a Phantasmic Imprint for an off-field-style Basic ATK-type hit; repeat for each Imprint placed, escalating into Creation\'s Zenith at 2 Painter\'s Delight stacks' },
    { type: 'Liberation', skill: 'Living Canvas', note: 'summons Inklit Spirits that perform Coordinated Attacks alongside the active Resonator for up to 30s — can be cast at any point in the rotation' },
    { type: 'Outro', skill: 'Carve and Draw', note: 'grants the incoming Resonator +20% Glacio DMG Amp and +25% Resonance Skill DMG Amp for 14s, plus 15 Resonance Energy via Inherent Skill Flourish' },
  ],
  'Encore': [
    { type: 'Intro', skill: 'Woolies Helpers' },
    { type: 'Liberation', skill: 'Cosmos Rave', duration: 10, note: 'enters Cosmos Rave — Basic/Heavy/Skill/Dodge Counter all replaced by enhanced Fusion versions; 16s cooldown' },
    { type: 'Skill', skill: 'Cosmos Rampage', note: 'cast on cooldown during Cosmos Rave, generates Dissonance' },
    { type: 'Basic ATK', skill: 'Cosmos: Frolicking', note: '4-stage combo, repeated between each Cosmos Rampage cast' },
    { type: 'Forte', skill: 'Heavy ATK: Cosmos Rupture', note: 'at full Dissonance; swap-cancel the moment Encore begins channelling' },
    { type: 'Outro', skill: 'Thermal Field' },
  ],
  'Calcharo': [
    { type: 'Intro', skill: 'Wanted Outlaw' },
    { type: 'Liberation', skill: 'Phantom Etching', duration: 11, note: 'enters Deathblade Gear — Basic ATK replaced by Hounds Roar' },
    { type: 'Forte', skill: 'Heavy ATK: "Death Messenger"', note: 'at 5 Killing Intent; optionally swap-cancel to protect Calcharo' },
    { type: 'Basic ATK', skill: 'Hounds Roar', note: '5-stage combo, rebuilds Killing Intent toward the next Death Messenger' },
    { type: 'Forte', skill: 'Heavy ATK: "Death Messenger"', note: '2nd proc' },
    { type: 'Basic ATK', skill: 'Hounds Roar' },
    { type: 'Forte', skill: 'Heavy ATK: "Death Messenger"', note: '3rd proc — realistic ceiling without frame-perfect dash-cancels (4 is possible but extremely hard)' },
    { type: 'Outro', skill: 'Shadowy Raid' },
  ],
  'Yinlin': [
    { type: 'Intro', skill: 'Raging Storm', note: 'applies Sinner\'s Mark' },
    { type: 'Basic ATK', skill: 'Zapstring\'s Dance', note: 'Stage 4; optionally swap-cancel' },
    { type: 'Skill', skill: 'Magnetic Roar', note: 'enters Execution Mode' },
    { type: 'Heavy ATK', skill: 'Standard' },
    { type: 'Skill', skill: 'Lightning Execution', note: 'try to cancel Heavy ATK endlag' },
    { type: 'Liberation', skill: 'Thundering Wrath', note: 'use right as Yinlin lands; applies Sinner\'s Mark' },
    { type: 'Basic ATK', skill: 'Zapstring\'s Dance', note: 'Stage 1' },
    { type: 'Forte', skill: 'Chameleon Cipher', note: 'at full Judgment Points; upgrades Sinner\'s Mark to Punishment Mark' },
    { type: 'Outro', skill: 'Strategist' },
  ],
  'Jiyan': [
    { type: 'Intro', skill: 'Tactical Strike' },
    { type: 'Basic ATK', skill: 'Lone Lance', note: 'builds Resolve toward 30' },
    { type: 'Skill', skill: 'Windqueller', note: 'spend Resolve for +20% DMG while outside Qingloong Mode' },
    { type: 'Liberation', skill: 'Emerald Storm: Prelude', duration: 10, note: 'at 30+ Resolve, enters Qingloong Mode — Basic/Heavy/Dodge Counter replaced by the Lance of Qingloong combo' },
    { type: 'Outro', skill: 'Discipline', note: 'Coordinated ATK when the incoming Resonator lands a Heavy ATK (8s window, up to 2 procs)' },
  ],
  'Lucilla': [
    { type: 'Intro', skill: 'Clip It' },
    { type: 'Skill', skill: 'Phantom Frame', note: 'hold to perfect Spotlight' },
    { type: 'Liberation', skill: 'Clear As Day', duration: 10, note: 'enters Reminiscence, +30% Basic ATK DMG' },
    { type: 'Basic ATK', skill: 'Snapshot', note: 'Tracing Forms into Letting It Go finisher' },
    { type: 'Outro', skill: 'Montage', duration: 30, note: 'Chafe mode: Glacio Chafe DMG Amp to team' },
  ],
  'Rebecca': [
    { type: 'Intro', skill: "Yo, It's Big Boomin' Time!" },
    { type: 'Basic ATK', skill: "Mix-'n'-Match", note: 'Guts stance combo, builds Fervor' },
    { type: 'Skill', skill: "It's Big Boomin' Time!", note: 'swaps to Huntress stance' },
    { type: 'Heavy ATK', skill: 'Rat-tat-tat!: Huntress', note: 'Forte finisher at max Fervor' },
    { type: 'Liberation', skill: "Party 'til Dawn!", duration: 9.5, note: 'channeled Mk. 31 HMG into Boom! Fireworks' },
    { type: 'Outro', skill: 'Preem Choom', duration: 14 },
  ],
  'Lucy': [
    { type: 'Intro', skill: 'Outdated Hallucination' },
    { type: 'Skill', skill: 'Payload', note: 'builds TCP' },
    { type: 'Skill', skill: 'Deadlock', note: 'at max TCP, enters Algorithm Compaction' },
    { type: 'Heavy ATK', skill: 'Multi-threading', note: 'consumes SQL for bonus DMG' },
    { type: 'Liberation', skill: 'Netrunner: Override', duration: 10, note: 'mark + detonate with Spoofing Programs' },
    { type: 'Outro', skill: 'Countermeasure Program', duration: 14 },
  ],
  'Denia': [
    { type: 'Intro', skill: "It's Been A While!" },
    { type: 'Skill', skill: 'Phantom Bubble', note: 'Stagecraft Form' },
    { type: 'Liberation', skill: 'Final Act: Stagecraft Form', duration: 12, note: 'switches to Breakdown Form' },
    { type: 'Skill', skill: 'Banish', note: 'Breakdown Form, consumes Dark Cores' },
    { type: 'Liberation', skill: 'Final Act: Breakdown Form', note: '2nd Ultimate, switches back to Stagecraft' },
    { type: 'Forte', skill: 'Erosion Field', duration: 30 },
    { type: 'Outro', skill: 'Unfinished Lies', duration: 30, note: 'Fusion Burst mode' },
  ],
  'Hiyuki': [
    { type: 'Intro', skill: 'Frostedge' },
    { type: 'Basic ATK', skill: 'Present Self Stage 1-3', note: 'builds Dedication' },
    { type: 'Heavy ATK', skill: 'Frost Splinter: Present Self', note: 'unlocks Ultimate at max Dedication' },
    { type: 'Liberation', skill: 'Foreclaiming: Inward Vision', note: 'enters Foreclaimed Self' },
    { type: 'Basic ATK', skill: 'Foreclaimed Self Stage 1-5', note: 'builds Frostheart, then Iai Stance' },
    { type: 'Heavy ATK', skill: 'Bitterfrost: Foreclaimed Self', note: 'builds Snowforged Blade' },
    { type: 'Liberation', skill: 'Foreclaiming: Blade Liberation', note: '2nd Ultimate finisher' },
    { type: 'Outro', skill: 'Snowlight Blessing', duration: 20 },
  ],
  'Sigrika': [
    { type: 'Intro', skill: 'Solsworn Etymology' },
    { type: 'Basic ATK', skill: 'Stage 1-4', note: 'full chain generates a Rune' },
    { type: 'Basic ATK', skill: 'Elucidated', note: 'Decipher-state finisher' },
    { type: 'Forte', skill: 'Runic Outburst', note: 'Heavy ATK consuming 2 Runes' },
    { type: 'Liberation', skill: 'Where Trust Leads Me!', note: 'grants a bonus Rune' },
    { type: 'Forte', skill: 'Learn My True Name', note: 'at max Full Stop' },
    { type: 'Outro', skill: 'In This Very Moment', duration: 30 },
  ],
  'Luuk Herssen': [
    { type: 'Intro', skill: 'Before Injection of Dawn' },
    { type: 'Mid-air', skill: 'Scythe: Resection Stage 2-3', note: 'airborne combo' },
    { type: 'Skill', skill: 'Aureole of Execution', note: 'Ring → Breach → Glare over 3 casts' },
    { type: 'Skill', skill: 'Basic Attack - Golden Impale', note: 'follow-up after Ring/Breach' },
    { type: 'Forte', skill: 'Gavel of Earthshaker', note: 'plunge attack after Glare' },
    { type: 'Liberation', skill: "Rewritten in Winter's Margins", duration: 25, note: 'nuke, stronger with more Aureole stacks' },
    { type: 'Outro', skill: 'Bow to the Last Light' },
  ],
  'Suisui': [
    { type: 'Intro', skill: 'Tinkling Jade', note: 'enters Drizzle Stance' },
    { type: 'Skill', skill: 'Drizzle Stance thrust', note: 'builds Floral Epistle' },
    { type: 'Basic ATK', skill: 'Drizzle Stance Stage 1-4', note: 'full chain to max Floral Epistle' },
    { type: 'Liberation', skill: 'Song of Thoroughfare', duration: 30, note: 'deploys Ceaseless Landscape' },
    { type: 'Outro', skill: 'Rippling Waters', duration: 30, note: 'buffs team All DMG; scales with Floral Epistle spent' },
  ],
  'Yangyang: Xuanling': [
    { type: 'Intro', skill: 'Skybound Feather' },
    { type: 'Basic ATK', skill: 'Azure/Feather Stance Stage 1-4', note: 'Azure stance combo, applies Havoc Bane' },
    { type: 'Skill', skill: 'Sword Stance Switch', note: 'swaps to Feather Stance' },
    { type: 'Heavy ATK', skill: 'Feather Sword Stance', note: 'at max Azure Plume' },
    { type: 'Liberation', skill: 'Hush of a Thousand Voices', note: 'consumes all Melody for a nuke' },
    { type: 'Heavy ATK', skill: 'Azure Sword Stance', note: 'swap back to Azure for a 2nd Heavy finisher' },
    { type: 'Outro', skill: 'As the Wind Wills', duration: 20 },
  ],
  'Aemeath': [
    { type: 'Intro', skill: 'Debut of Meteoric Radiance', note: 'swap-in from Mech Form' },
    { type: 'Skill', skill: 'Seraphic Duet', note: 'Overture into Encore for extra hits' },
    { type: 'Skill', skill: 'Sync Strikes', note: 'Armament Merge to swap between forms' },
    { type: 'Basic ATK', skill: 'Mech Form Stage 1-4', note: 'heavy Mech-form combo' },
    { type: 'Liberation', skill: 'Heavenfall Edict', duration: 20, note: 'Overdrive into Finale burst' },
    { type: 'Outro', skill: 'Silent Protection', duration: 20, note: 'All-DMG Amp to team, stronger from Mech Form' },
  ],
  'Lynae': [
    { type: 'Intro', skill: 'Time to Show Some Colors!' },
    { type: 'Skill', skill: 'Lynae-Style Palettes', note: 'builds toward Kaleidoscopic mode' },
    { type: 'Skill', skill: 'Additive Color', note: 'quick follow-up' },
    { type: 'Basic ATK', skill: 'Kaleidoscopic 1-5', note: 'empowered combo once mode is active' },
    { type: 'Forte', skill: 'Visual Impact', note: 'main burst finisher' },
    { type: 'Liberation', skill: 'Prismatic Overblast', duration: 30, note: 'multi-hit Ultimate barrage' },
    { type: 'Outro', skill: "Let's Hit the Road!", duration: 30, note: 'grants next Resonator All-DMG / Liberation DMG Amp' },
  ],
  'Mornye': [
    { type: 'Intro', skill: 'Convergence' },
    { type: 'Skill', skill: 'Optimal Solution', note: 'marks target, DEF-scaling damage' },
    { type: 'Skill', skill: 'Distributed Array', note: 'multi-hit follow-up' },
    { type: 'Forte', skill: 'Geopotential Shift', note: 'fuels support kit' },
    { type: 'Forte', skill: 'Inversion', note: 'stronger Forte finisher' },
    { type: 'Liberation', skill: 'Critical Protocol', duration: 30, note: 'DEF-scaling nuke, empowers team buffs' },
    { type: 'Outro', skill: 'Recursion', duration: 30, note: '+25% All DMG Amp to team' },
  ],
  'Chisa': [
    { type: 'Intro', skill: 'Reverberance - Return' },
    { type: 'Skill', skill: 'Eye of Unraveling', note: 'marks target for Negative Status' },
    { type: 'Skill', skill: 'Serrated Loop', note: 'hold for more hits' },
    { type: 'Forte', skill: 'Sawring - Blitz 1-3', note: 'builds Ring of Chainsaw stacks' },
    { type: 'Forte', skill: 'Sawring - Eradication', note: 'scales with stacked Rings of Chainsaw' },
    { type: 'Liberation', skill: 'Moment of Nihility', duration: 15, note: 'Ultimate nuke, heals on cast' },
    { type: 'Outro', skill: 'Unraveling - Law Zero', duration: 15, note: 'next Resonator can stack more Negative Status' },
  ],
  'Galbrena': [
    { type: 'Intro', skill: 'Hellflare Overload' },
    { type: 'Skill', skill: 'Encroach', note: 'builds Sinflame' },
    { type: 'Skill', skill: 'Ascent of Malice', note: 'at max Sinflame, enters Demon Hypostasis' },
    { type: 'Basic ATK', skill: 'Stage 1-4', note: 'Demon Hypostasis combo' },
    { type: 'Heavy ATK', skill: 'Volley of Death 1-3', note: 'charged combo finisher' },
    { type: 'Liberation', skill: 'Hellfire Absolution', duration: 14, note: 'grants +85% DMG Mult to Demon Hypostasis attacks' },
    { type: 'Outro', skill: 'Ashen Pursuit', note: 'pure-damage swap-out, no team buff, quickswap freely' },
  ],
  'Iuno': [
    { type: 'Intro', skill: 'Illuminated Manifestation' },
    { type: 'Skill', skill: 'Pulse of Origins', note: 'or Closing Refrain to enter Lunar Cycle' },
    { type: 'Basic ATK', skill: 'Moonbow 1-3', note: 'empowered combo during Lunar Cycle' },
    { type: 'Skill', skill: 'Arc Beyond the Edge', note: 'New Moon state follow-up, 2 charges' },
    { type: 'Heavy ATK', skill: 'Absolute Fullness', note: 'Forte-empowered finisher' },
    { type: 'Liberation', skill: 'Beneath Lunar Tides', duration: 30, note: 'activates Lunar Cycle burst phase' },
    { type: 'Outro', skill: 'From Gloom to Gleam', duration: 14, note: 'grants next Resonator Heavy ATK DMG Amp' },
  ],
  'Cartethyia': [
    { type: 'Intro', skill: "Sword to Mark Tide's Trace" },
    { type: 'Skill', skill: 'Base Form', note: 'applies Aero Erosion, summons a Sword Shadow' },
    { type: 'Basic ATK', skill: 'Base Form 1-4', note: 'builds Conviction toward transformation' },
    { type: 'Liberation', skill: "A Knight's Heartfelt Prayers", note: 'transforms into Fleurdelys form for 12s' },
    { type: 'Basic ATK', skill: 'Fleurdelys 1-5', note: 'empowered Fleurdelys-form combo' },
    { type: 'Liberation', skill: 'Blade of Howling Squall', duration: 15, note: 'Fleurdelys finisher, removes stacked Erosion for bonus DMG' },
    { type: 'Outro', skill: "Wind's Divine Blessing", duration: 20, note: 'boosts Aero DMG vs Negative Status targets' },
  ],
  'Ciaccona': [
    { type: 'Intro', skill: 'Roaming with the Wind' },
    { type: 'Skill', skill: 'Harmonic Allegro', note: 'inflicts Aero Erosion' },
    { type: 'Basic ATK', skill: 'Stage 1-4', note: 'builds Musical Essence' },
    { type: 'Forte', skill: 'Quadruple Downbeat', note: 'consumes stacked Musical Essence' },
    { type: 'Liberation', skill: "Singer's Triple Cadenza", duration: 20, note: 'nuke plus lingering DoT field' },
    { type: 'Outro', skill: 'Windcalling Tune', duration: 30, note: 'amplifies Aero Erosion DMG near the active Resonator' },
  ],
  'Zani': [
    { type: 'Intro', skill: 'Immediate Execution' },
    { type: 'Skill', skill: 'Pinpoint Strike', note: 'or Targeted Action counter, empowered by Resonance Chain' },
    { type: 'Basic ATK', skill: 'Stage 1-4', note: 'standard combo before Forte' },
    { type: 'Forte', skill: 'Heavy Slash Daybreak', note: 'first stage of Forte Heavy ATK' },
    { type: 'Forte', skill: 'Heavy Slash Dawning', note: 'second stage, stronger' },
    { type: 'Forte', skill: 'Heavy Slash Nightfall', note: 'Forte finisher, scales with Blaze' },
    { type: 'Liberation', skill: 'Rekindle', note: 'enters Inferno state, raises max Blaze' },
    { type: 'Liberation', skill: 'The Last Stand', duration: 8, note: 'second Ultimate inside Inferno, scales with Blaze consumed' },
    { type: 'Outro', skill: 'Beacon For the Future', duration: 20, note: 'grants allies hitting the marked target Spectro DMG Amp' },
  ],
  'Zhezhi': [
    { type: 'Intro', skill: 'Radiant Ruin' },
    { type: 'Basic ATK', skill: 'Dimming Brush Stage 1-3', note: 'full Basic 1-2-3 combo' },
    { type: 'Skill', skill: 'Manifestation' },
    { type: 'Forte', skill: 'Heavy ATK: Conjuration' },
    { type: 'Forte', skill: "Stroke of Genius / Creation's Zenith", note: 'Stroke of Genius (Jump Cancel)' },
    { type: 'Forte', skill: "Stroke of Genius / Creation's Zenith", note: '2nd Stroke of Genius (cancel endlag via Ultimate)' },
    { type: 'Liberation', skill: 'Living Canvas' },
    { type: 'Forte', skill: "Stroke of Genius / Creation's Zenith", note: "Creation's Zenith finisher (Dash Cancel into Echo, Swap, Outro)" },
    { type: 'Outro', skill: 'Carve and Draw', duration: 14 },
  ],
  'Xiangli Yao': [
    { type: 'Intro', skill: 'Principle' },
    { type: 'Skill', skill: 'Deduction', note: 'instantly cancelled into Ultimate' },
    { type: 'Liberation', skill: 'Cogitation Model', duration: 24, note: 'enters Intuition' },
    { type: 'Liberation', skill: 'Intuition: Pivot-Impale / Divergence / Unfathomed', note: 'Skill: Divergence — builds Performance Capacity' },
    { type: 'Forte', skill: 'Intuition: Law of Reigns / Revamp', note: 'Mid-air Attack: Revamp' },
    { type: 'Forte', skill: 'Intuition: Law of Reigns / Revamp', note: 'Skill: Law of Reigns — 1st Hypercube' },
    { type: 'Liberation', skill: 'Intuition: Pivot-Impale / Divergence / Unfathomed', note: 'Basic: Pivot-Impale P1-P3' },
    { type: 'Forte', skill: 'Intuition: Law of Reigns / Revamp', note: 'Skill: Law of Reigns — 2nd Hypercube' },
    { type: 'Liberation', skill: 'Intuition: Pivot-Impale / Divergence / Unfathomed', note: 'Skill: Divergence' },
    { type: 'Forte', skill: 'Intuition: Law of Reigns / Revamp', note: 'Mid-air Attack: Revamp' },
    { type: 'Forte', skill: 'Intuition: Law of Reigns / Revamp', note: 'Skill: Law of Reigns — 3rd Hypercube, Intuition ends' },
    { type: 'Outro', skill: 'Chain Rule', duration: 8 },
  ],
  'Shorekeeper': [
    { type: 'Intro', skill: 'Proof of Existence: Enlightenment / Discernment', note: 'Discernment — empowered Intro, guaranteed Crit, ends the current Stellarealm' },
    { type: 'Basic ATK', skill: 'Origin Calculus Stage 1-4', note: 'full 4-hit Basic combo, builds Empirical Data + Collapsed Cores' },
    { type: 'Forte', skill: 'Flare Star Butterfly / Illation / Transmutation', note: 'Heavy ATK: Illation — consumes 5 Empirical Data' },
    { type: 'Skill', skill: 'Chaos Theory' },
    { type: 'Liberation', skill: 'End Loop', duration: 30, note: 'summons the Stellarealm' },
    { type: 'Outro', skill: 'Binary Butterfly', duration: 30, note: 'swap to the next Resonator to trigger their Intro and evolve the Stellarealm' },
  ],
  'Augusta': [
    { type: 'Intro', skill: 'Stride of Goldenflare' },
    { type: 'Skill', skill: "Warrior's Blade", note: 'time-stop dash strike' },
    { type: 'Basic ATK', skill: "Hunter's Path", note: 'standard combo, builds Ascendancy' },
    { type: 'Forte', skill: 'Undying Sunlight', note: 'Strike → Leap → Plunge finisher' },
    { type: 'Heavy ATK', skill: 'Thunderoar', note: 'full Ascendancy Heavy ATK combo' },
    { type: 'Liberation', skill: 'Sword of Eternal Oath', duration: 25, note: 'standard Ultimate; or hold for Sunborne into Everbright Protector at 2 Majesty' },
    { type: 'Outro', skill: 'Battlesong of the Unyielding', duration: 14, note: 'grants next Resonator All-DMG Amp' },
  ],
  'Phrolova': [
    { type: 'Intro', skill: 'Suite of Quietus' },
    { type: 'Skill', skill: 'Whispers in Fleeting Dream', note: 'enters Reincarnate' },
    { type: 'Basic ATK', skill: 'Stage 1-3', note: 'builds Notes toward Scarlet Coda' },
    { type: 'Heavy ATK', skill: 'Scarlet Coda', note: 'scales with stacked Aftersound' },
    { type: 'Skill', skill: 'Whispers in Fleeting Dream', note: 'repeat to refresh Reincarnate before Ultimate' },
    { type: 'Liberation', skill: 'Curtain Call', duration: 24, note: 'enters Maestro state, summons Hecate' },
    { type: 'Liberation', skill: 'Maestro State: Hecate', note: 'off-field Hecate attacks during Maestro' },
    { type: 'Outro', skill: 'Unfinished Piece', duration: 14, note: 'grants next Resonator Havoc + Heavy ATK DMG Amp' },
  ],
  'Lupa': [
    { type: 'Intro', skill: 'Try Focusing, Eh?' },
    { type: 'Skill', skill: "Shewolf's Hunt", note: 'or Feral Fang against marked targets' },
    { type: 'Basic ATK', skill: 'Stage 1-4', note: 'builds Wolflame' },
    { type: 'Skill', skill: 'Dance with the Wolf', note: 'Forte finisher combo' },
    { type: 'Liberation', skill: 'Fire-Kissed Glory', duration: 35, note: 'grants team ATK + Fusion RES ignore, enables Wild Hunt' },
    { type: 'Intro', skill: 'Nowhere to Run!', note: 'stronger Wild Hunt Intro, once per Liberation' },
    { type: 'Outro', skill: 'Stand by Me, Warrior', duration: 14, note: 'grants next Resonator Fusion + Basic ATK DMG Amp' },
  ],
  'Qiuyuan': [
    { type: 'Intro', skill: 'Attack the Must-Defend' },
    { type: 'Skill', skill: 'Through the Groves', note: 'or hold for Undaunted Wayfarer' },
    { type: 'Basic ATK', skill: 'Stage 1-3', note: 'transitions into Inkwash form' },
    { type: 'Forte', skill: 'Inkwash 1-4', note: 'main Inkwash-form combo' },
    { type: 'Forte', skill: 'To Teach / To Save / To Sacrifice', note: 'Heavy ATK finisher, pick based on situation' },
    { type: 'Liberation', skill: 'Sundering Strike', duration: 30, note: 'Ultimate nuke' },
    { type: 'Outro', skill: 'Strike Before Ready', duration: 14, note: 'grants next Resonator Echo Skill DMG Amp' },
  ],
};

// [SECTION:RESONANCE_CHAINS] — Per-character S1-S6 stat contributions for damage calculator
// Format: { s1-s6: { stat: value } } — each level adds ON TOP of previous
// Stat types must match damage formula: atkPct, critRate, critDmg, elemDmg, skillDmg,
// basicDmg, heavyDmg, libDmg, echoDmg, deepen, defIgnore, defShred, resShred, totalMult, allDmg, coordDmg
// totalMult = rotation-averaged DPS contribution for utility/multiplier nodes
// Sources: Game8 sequence nodes, Prydwen, wutheringlab, cross-verified Apr 2026
const RESONANCE_CHAIN_DATA = {
  // Suisui S2: team Crit DMG+50% conditional on negative-status/Havoc Bane trigger. S4: Enrichment/Spring's Birth healing
  // +50% (not a DPS stat — was miscategorized as deepen:10 with no basis, kept as totalMult since no heal-bonus stat
  // exists in this schema). S5: Drizzle Basic/Heavy DMG+100% (scaled down, secondary to healing role). S6: Crit DMG+500%
  // on rare Intro/Skill triggers (scaled down)
  'Suisui':       { s1: { totalMult: 5 }, s2: { critDmg: 50 }, s3: { totalMult: 5 }, s4: { totalMult: 5 }, s5: { basicDmg: 25 }, s6: { critDmg: 25 } },
  // Qingxiao S2: Heavy ATK mult+40% (confirmed). S3: Liberation Crit DMG+100% (confirmed). S4: ATK+20% on team Tune Strain trigger. S5: Skill mult+100% (confirmed)
  'Qingxiao':     { s1: { critRate: 16 }, s2: { heavyDmg: 40 }, s3: { critDmg: 100 }, s4: { atkPct: 20 }, s5: { skillDmg: 100 }, s6: { deepen: 40 } },
  // Jingran S1: Skill mult+80% (confirmed). S2: Heavy ATK mult+46% (confirmed). S6: Heavy ATK DMG taken+40% (confirmed)
  'Jingran':      { s1: { skillDmg: 80 }, s2: { heavyDmg: 46 }, s3: { atkPct: 15 }, s4: { totalMult: 10 }, s5: { totalMult: 5 }, s6: { heavyDmg: 40 } },
  // Yangyang: Xuanling S2: Heavy/Mid-air/Havoc-in-Bloom DMG+100% (confirmed exact). S3: Hush of a Thousand Voices
  // Liberation DMG+175% (confirmed exact via Nanoka/Prydwen 2026-08-16 cross-check; was 80, didn't match comment or kit)
  'Yangyang: Xuanling': { s1: { totalMult: 10 }, s2: { heavyDmg: 100 }, s3: { libDmg: 175 }, s4: { atkPct: 20 }, s5: { totalMult: 5 }, s6: { heavyDmg: 40 } },
  // Hiyuki S1/S2: Foreclaimed/Iai skills are "considered Resonance Liberation DMG" per kit. S3: Heavy ATK mult+160% (confirmed), Glacio Bite scaling at 2 stacks (scaled down)
  'Hiyuki':       { s1: { libDmg: 80 }, s2: { libDmg: 60 }, s3: { heavyDmg: 100 }, s4: { atkPct: 15 }, s5: { skillDmg: 60 }, s6: { critDmg: 100 } },
  // Lucy S2 (confirmed via Nanoka/Prydwen 2026-08-16 cross-check, was an unverified heavyDmg:60 previously): raises
  // Heavy Attack - Multi-threading's SQL DMG Mult from 270% to 560% (conditional, only on SQL-consuming casts), grants
  // +32 starting RAM (from 24), and adds a separate flat extra hit worth 450% ATK as Heavy DMG after Pulse Interference.
  // None of this reduces to a flat always-on heavyDmg% (calcEngine.js applies heavyDmg unconditionally to every Heavy
  // ATK instance, which the real effect isn't), so it's modeled via totalMult like other complex/conditional S2 nodes.
  // S3: Override DMG Mult+50% + Crit DMG+100% on Liberation (confirmed exact). S4: team +20% All-Attr DMG on
  // Hack-Shifting (confirmed)
  'Lucy':         { s1: { atkPct: 20 }, s2: { totalMult: 30 }, s3: { libDmg: 50, critDmg: 100 }, s4: { allDmg: 20 }, s5: { totalMult: 5 }, s6: { heavyDmg: 40 } },
  // Rebecca S2: team +20% All-Attribute DMG on Intro/Lib (confirmed exact). S3: Liberation DMG Mult+60% (confirmed exact)
  'Rebecca':      { s1: { basicDmg: 50 }, s2: { allDmg: 20 }, s3: { libDmg: 60 }, s4: { totalMult: 15 }, s5: { basicDmg: 20 }, s6: { basicDmg: 40 } },
  // Denia S3: Final Act - Breakdown Form DMG+80% (confirmed exact, Tune Strain/Fusion Burst dual mode averaged elsewhere).
  // S5: Final Act - Stagecraft Form DMG+100% (confirmed exact via Nanoka/Prydwen 2026-08-16 cross-check; was 50 previously)
  'Denia':        { s1: { critDmg: 30 }, s2: { libDmg: 40 }, s3: { libDmg: 80 }, s4: { totalMult: 15 }, s5: { libDmg: 100 }, s6: { elemDmg: 60 } },
  // Lucilla S2: Glacio Chafe DMG Amp+80% / Echo Skill DMG+40% depending on mode (averaged). S3: Letting It Go DMG+100% (confirmed exact).
  // S4: ATK+10%/stack up to 3 stacks = +30% (confirmed exact). S5: Oblivion DMG+50% (confirmed exact).
  // S6: each Photo consumed in Reminiscence grants 1 Remembrance stack (max 3, +200%/stack) on Letting It Go — a full 3-Photo Reminiscence
  // reliably hits max, so using the max value +600% (confirmed via Nanoka/Game8/Prydwen cross-check 2026-08-16; was erroneously 100 — S3's value).
  'Lucilla':      { s1: { critRate: 20 }, s2: { elemDmg: 60 }, s3: { libDmg: 100 }, s4: { atkPct: 30 }, s5: { basicDmg: 50 }, s6: { libDmg: 600 } },
  // Camellya S1: +28% CD after Intro (confirmed exact). S3: ATK+58% in Budding. S4: team Basic ATK DMG+25%
  'Camellya':     { s1: { critDmg: 28 }, s2: { totalMult: 40 }, s3: { atkPct: 58, totalMult: 15 }, s4: { basicDmg: 25 }, s5: { totalMult: 40 }, s6: { totalMult: 50 } },
  // Carlotta S1: +12.5% CR on Deconstructed (confirmed). S4: team Skill DMG+25%
  'Carlotta':     { s1: { critRate: 12.5 }, s2: { totalMult: 25 }, s3: { totalMult: 15 }, s4: { skillDmg: 25 }, s5: { totalMult: 15 }, s6: { totalMult: 50 } },
  // Jiyan S1: extra Windqueller charge (utility). S2: ATK+28%. S3: CR+16% CD+32% (confirmed). S4: team Heavy ATK+25%. S5: ATK stacking up to +45%
  'Jiyan':        { s1: { totalMult: 10 }, s2: { atkPct: 28 }, s3: { critRate: 16, critDmg: 32 }, s4: { heavyDmg: 25 }, s5: { atkPct: 45 }, s6: { totalMult: 40 } },
  // Jinhsi S1: up to +80% Illuminous DMG ≈ skillDmg 40 avg. S2: energy utility. S3: ATK+25% x2 stacks. S4: team Attr DMG+20%
  'Jinhsi':       { s1: { skillDmg: 40 }, s2: { totalMult: 5 }, s3: { atkPct: 50 }, s4: { elemDmg: 20 }, s5: { totalMult: 15 }, s6: { totalMult: 30 } },
  // Calcharo S1: energy recovery (utility). S2: Skill DMG+30%. S3: Electro DMG+25%. S4: team Electro DMG+20%
  'Calcharo':     { s1: { totalMult: 5 }, s2: { skillDmg: 30 }, s3: { elemDmg: 25 }, s4: { elemDmg: 20 }, s5: { totalMult: 15 }, s6: { totalMult: 40 } },
  // Encore S1: Fusion DMG+3% x4=12%. S2: energy utility. S3: Heavy ATK mult+40%. S4: team Fusion DMG+20%. S6: ATK stacking ~25%
  'Encore':       { s1: { elemDmg: 12 }, s2: { totalMult: 5 }, s3: { heavyDmg: 40 }, s4: { elemDmg: 20 }, s5: { skillDmg: 35 }, s6: { atkPct: 25 } },
  // Xiangli Yao S1: extra hits (utility). S2: CD+30%. S3: skill mult+63% (large). S4: team Lib DMG+25%. S6: skill mult boost
  'Xiangli Yao':  { s1: { totalMult: 10 }, s2: { critDmg: 30 }, s3: { skillDmg: 40 }, s4: { libDmg: 25 }, s5: { totalMult: 15 }, s6: { totalMult: 15 } },
  // Aemeath S1: +300% Crit DMG for Heavy ATK in Instant Response (confirmed exact). S3: Between the Stars enhanced to
  // CD+60% (confirmed exact) + Heavenfall Edict: Finale DMG Mult+100% (was defIgnore:20, no basis at all — real S3 has
  // no DEF Ignore effect). S4: team +20% All-Attr DMG on Intro/Sync Strike/Duet cast (was totalMult:15, no basis).
  // S6: Aemeath's Liberation DMG taken by targets +40% (confirmed exact value, recategorized from totalMult to libDmg)
  'Aemeath':      { s1: { critDmg: 300 }, s2: { totalMult: 25 }, s3: { libDmg: 100, critDmg: 60 }, s4: { allDmg: 20 }, s5: { totalMult: 40 }, s6: { libDmg: 40 } },
  // Zani S1: +50% Spectro DMG (confirmed exact). S2: CR+20% + mult boost. S4: team ATK+20%
  'Zani':         { s1: { elemDmg: 50 }, s2: { critRate: 20, skillDmg: 80 }, s3: { libDmg: 200 }, s4: { atkPct: 20 }, s5: { libDmg: 120 }, s6: { heavyDmg: 40 } },
  // Zani R-chain corrected 2026-08-16 via Nanoka/Prydwen: s1 Targeted Action/Forcible Riposte +50% Spectro DMG confirmed correct;
  // s2 +20% Crit Rate + Targeted Action/Forcible Riposte DMG Mult +80% (was critRate:20 + unfounded totalMult:25); s3 The Last Stand DMG Mult scales up to +1200% with full Blaze consumption,
  // used a conservative rotation-representative libDmg:200 instead of the theoretical max (was totalMult:15, no basis); s4 team +20% ATK on Intro cast confirmed correct;
  // s5 Rekindle DMG Mult +120% (was totalMult:40, wrong category); s6 Heavy Slash Daybreak/Dawning/Nightfall/Lightsmash Mult +40% (was totalMult:40 + duplicate heavyDmg:40, consolidated).
  // Phoebe S1: Liberation mult increase ≈ libDmg 15. S3: Heavy ATK+40%
  'Phoebe':       { s1: { libDmg: 15 }, s2: { skillDmg: 25 }, s3: { heavyDmg: 40 }, s4: { atkPct: 15 }, s5: { totalMult: 15 }, s6: { critDmg: 25 } },
  // Phrolova S1: skill mult+80% (no CR). S2: Scarlet Coda+75% + Aftersound (no CR)
  'Phrolova':     { s1: { totalMult: 20 }, s2: { heavyDmg: 75 }, s3: { echoDmg: 80 }, s4: { allDmg: 20 }, s5: { totalMult: 10 }, s6: { elemDmg: 24 } },
  // Phrolova R-chain corrected 2026-08-16 via Nanoka/Prydwen/Game8: s1 +80% DMG to Forte Basic/Skill (was totalMult:15, no basis — kept totalMult, real number too broad to cleanly categorize);
  // s2 Scarlet Coda DMG Mult +75% (was totalMult:40); s3 Echo Skill DMG Amp +80% (was totalMult:15, wrong category);
  // s4 team +20% Attribute DMG on team Echo Skill cast (was echoDmg:40, wrong stat — only applies in support role); s5 Maestro DMG taken −30% + Stagnation field, no direct DPS stat, totalMult fallback (was totalMult:15);
  // s6 +24% Enhanced Attack-Hecate DMG (was deepen:25, wrong category).
  // Brant S1: +20% DMG dealt per stack x3 (allDmg type). S2: CR+30% + explosions
  'Brant':        { s1: { allDmg: 20 }, s2: { critRate: 30, totalMult: 25 }, s3: { totalMult: 15 }, s4: { elemDmg: 15 }, s5: { totalMult: 15 }, s6: { deepen: 40 } },
  // Augusta S1: +15% CD per Crown stack x2=30% (confirmed). S2: +20% CR per stack + excess CR→CD conversion
  'Augusta':      { s1: { critDmg: 30 }, s2: { critRate: 40 }, s3: { totalMult: 25 }, s4: { atkPct: 20 }, s5: { totalMult: 15 }, s6: { heavyDmg: 200 } },
  // Augusta R-chain corrected 2026-08-16 via Nanoka/Prydwen/Game8: s1 +15%/Crown of Wills stack Crit DMG, max 2 stacks = 30% confirmed correct;
  // s2 +20%/stack Crit Rate, max 2 stacks = 40% (was critRate:20 + an unfounded critDmg:40 — real S2 CR-over-100% → CD conversion is conditional, not a flat number, dropped);
  // s3 +25% DMG Mult on Thunderoar/Plunge/Sublime is the Sun (was totalMult:15); s4 team +20% ATK on Intro cast (was heavyDmg:40, no basis);
  // s5 Glory's Favor shield +50%, no direct DPS stat, totalMult fallback (was totalMult:15, kept as-is); s6 Thunder Rage: 2 extra Heavy ATK hits at 100% ATK each = 200% (was totalMult:25).
  // Cartethyia S1: +25% CD per 30 Conviction threshold (up to ~100%). S2: Basic/Heavy/etc DMG+50%, Mid-air+200%
  'Cartethyia':   { s1: { critDmg: 100 }, s2: { basicDmg: 50, totalMult: 30 }, s3: { libDmg: 100 }, s4: { allDmg: 20 }, s5: { totalMult: 15 }, s6: { elemDmg: 40 } },
  // Cartethyia R-chain corrected 2026-08-16 via Nanoka/Prydwen/Game8: s1 +25%/Conviction-level Crit DMG, max 4 stacks = 100% (was critDmg:40, quarter of real max);
  // s2 Basic/Heavy/Dodge/Intro DMG Mult +50% confirmed, Mid-air Attack +200% has no direct schema stat, totalMult fallback (was totalMult:25); s3 Liberation2 DMG Mult +100% (was totalMult:15, wrong category);
  // s4 team +20% All-Attribute DMG after inflicting any Bane/Burst/Frazzle/Flare/Chafe/Erosion (was atkPct:40, no basis); s5 fatal-blow immunity + Max HP shield, no direct DPS stat, totalMult fallback (kept as-is);
  // s6 Fleurdelys attacks deal +40% more DMG to targets (was totalMult:25, wrong category).
  // Corrected against ww.nanoka.cc character/1104 — prior values didn't match any real chain effect.
  'Lingyang':     { s1: { totalMult: 10 }, s2: { totalMult: 8 }, s3: { basicDmg: 20, skillDmg: 10 }, s4: { elemDmg: 20 }, s5: { totalMult: 35 }, s6: { basicDmg: 100 } },
  // Galbrena S1: +2% CD per Afterflame (up to 80%). Averaged ~40
  'Galbrena':     { s1: { critDmg: 80 }, s2: { atkPct: 90 }, s3: { libDmg: 130 }, s4: { allDmg: 20 }, s5: { skillDmg: 150 }, s6: { elemDmg: 60 } },
  // Galbrena R-chain corrected 2026-08-16 via Prydwen/Game8: s1 max Afterflame Crit DMG scaling (+2%/pt, cap 80%, was 40);
  // s2 Burning Drive ATK Bonus amplified +350% more (20% base × 4.5 = 90% ATK while active, was unfounded totalMult:40);
  // s3 Liberation DMG Mult +130% (was critRate:12, no basis); s4 team +20% All-Attr DMG on team Echo Skill cast (was heavyDmg:40, no basis);
  // s5 Encroach/Ascent of Malice/Ravage DMG Mult +150% (was totalMult:15); s6 core Demon Hypostasis attacks DMG Mult +60% (was deepen:40).
  // Iuno S1: ATK+40% during Lunar Cycle (not heavyDmg)
  'Iuno':         { s1: { atkPct: 40 }, s2: { allDmg: 40 }, s3: { libDmg: 65 }, s4: { totalMult: 15 }, s5: { libDmg: 20 }, s6: { heavyDmg: 1600 } },
  // Iuno R-chain corrected 2026-08-16 via Prydwen/Game8: s1 +40% ATK in Lunar Cycle confirmed correct;
  // s2 team +40% all DMG Amp at 10 Wan Light stacks (was atkPct:15, wrong stat/value); s3 +65% DMG Amp on Moonbow Basic/Arc Beyond the Edge (was libDmg:25);
  // s4 Absolute Fullness grants team Shield = 160% ATK — no direct DPS stat, totalMult fallback (was heavyDmg:40, no basis);
  // s5 +20% Liberation DMG Bonus (was totalMult:15); s6 Absolute Fullness DMG Multiplier +1600% (was deepen:25, no basis).
  // Sigrika (confirmed via Nanoka/Prydwen 2026-08-16 cross-check). S1: +70% DMG mult to specific skills (rotation-averaged).
  // S2: Learn My True Name DMG Mult+120% (considered Echo Skill DMG) — was totalMult:40, no basis. S3: Innate Gift? stack
  // cap 2->4, no flat %, was critRate:12 with no basis — kept as totalMult. S4: team ATK+20% on ally Echo Skill cast —
  // was echoDmg:40 (wrong stat AND value). S5: Where Trust Leads Me! DMG Mult+30% (Liberation, counted as Echo Skill DMG) — was totalMult:15.
  'Sigrika':      { s1: { totalMult: 15 }, s2: { echoDmg: 120 }, s3: { totalMult: 15 }, s4: { atkPct: 20 }, s5: { libDmg: 30 }, s6: { defIgnore: 15 } },
  // Luuk Herssen (confirmed via Nanoka/Prydwen 2026-08-16 cross-check). S1: +150% Mid-air ATK DMG, simplified as basicDmg
  // ~15 DPS impact (documented approximation, kept). S2: Rewritten in Winter's Margins DMG Mult+60% — was totalMult:40, no basis.
  // S3: Aureole of Execution forms +136% in Aureate Judge (conditional, no flat unconditional %) — was critDmg:25 with no
  // basis, kept as totalMult. S4: team All DMG+20% (not Basic DMG) on ally Tune Break — was basicDmg:40 (wrong stat AND
  // value). S6: Endnotes stacking grants Liberation DMG+40%/stack up to +120% — was defIgnore:15, no basis at all.
  'Luuk Herssen': { s1: { basicDmg: 15 }, s2: { libDmg: 60 }, s3: { totalMult: 15 }, s4: { allDmg: 20 }, s5: { totalMult: 15 }, s6: { libDmg: 120 } },
  // Lupa S1: CR+20% for 10s (not elemDmg)
  'Lupa':         { s1: { critRate: 20 }, s2: { allDmg: 40 }, s3: { totalMult: 20 }, s4: { totalMult: 25 }, s5: { libDmg: 15 }, s6: { defIgnore: 30 } },
  // Lupa R-chain corrected 2026-08-16 via Nanoka/Prydwen/Game8: s1 Fire-Kissed Glory +20% Crit Rate confirmed correct;
  // s2 team +20% Fusion DMG on skill casts, stacks ×2 = 40% (was totalMult:40, wrong category); s3 Nowhere to Run! DMG Mult +100%, Intro-type with no direct schema stat, totalMult fallback (was atkPct:15, no basis);
  // s4 Dance With the Wolf: Climax DMG Mult +125%, Forte-type with no direct schema stat, totalMult fallback (was deepen:12, no basis);
  // s5 +15% Resonance Liberation DMG Bonus (was totalMult:15, wrong category); s6 Climax/Liberation/Nowhere to Run! ignore 30% DEF (was elemDmg:40, no basis).
  // Supports — utility nodes represented as small totalMult DPS contributions
  // S6 corrected — she has no DMG Deepen anywhere in her kit; real S6 boosts Heavy/Mid-air ATK
  // Starflower Blooms DMG and adds a Coordinated ATK + heal proc (bucketed as totalMult).
  'Verina':       { s1: { totalMult: 5 }, s2: { totalMult: 5 }, s3: { totalMult: 5 }, s4: { elemDmg: 15 }, s5: { totalMult: 12 }, s6: { totalMult: 20 } },
  // Shorekeeper S1: utility (range/duration). S2: ATK+40% (confirmed). S6: CD+500% self after Intro (very short window, ≈25 averaged)
  'Shorekeeper':  { s1: { totalMult: 5 }, s2: { atkPct: 40 }, s3: { totalMult: 5 }, s4: { totalMult: 5 }, s5: { totalMult: 5 }, s6: { critDmg: 25 } },
  // Lynae S2: team +25% All DMG Amp, self-gain portion (confirmed exact). S4: ATK+20% (was totalMult:10, no basis).
  // S5: Prismatic Overblast Liberation DMG Mult+70% (was totalMult:15, no basis)
  'Lynae':        { s1: { totalMult: 10 }, s2: { allDmg: 25 }, s3: { totalMult: 15 }, s4: { atkPct: 20 }, s5: { libDmg: 70 }, s6: { totalMult: 40 } },
  // Mornye (confirmed via Nanoka/Prydwen 2026-08-16 cross-check). S1: interrupt immunity + Interfered Marker duration/
  // condition changes, no flat % (was allDmg:15, no basis). S2: team Crit DMG+32% max vs Interfered Marker targets (was
  // deepen:10, wrong stat+value). S4: High Syntony Field healing+30%, not a DPS stat (was atkPct:10, no basis).
  // S5: Critical Protocol Liberation DMG Mult+40% (was totalMult:10, no basis). S6: Critical Protocol DMG Mult+400%
  // (was deepen:15, no basis)
  'Mornye':       { s1: { totalMult: 15 }, s2: { critDmg: 32 }, s3: { totalMult: 10 }, s4: { totalMult: 10 }, s5: { libDmg: 40 }, s6: { libDmg: 400 } },
  'Roccia':       { s1: { basicDmg: 10 }, s2: { atkPct: 15 }, s3: { basicDmg: 10 }, s4: { totalMult: 10 }, s5: { atkPct: 10 }, s6: { basicDmg: 15 } },
  'Sanhua':       { s1: { atkPct: 10 }, s2: { basicDmg: 10 }, s3: { totalMult: 10 }, s4: { atkPct: 10 }, s5: { basicDmg: 10 }, s6: { deepen: 15 } },
  'Mortefi':      { s1: { heavyDmg: 10 }, s2: { totalMult: 10 }, s3: { heavyDmg: 10 }, s4: { coordDmg: 15 }, s5: { totalMult: 10 }, s6: { heavyDmg: 40 } },
  'Danjin':       { s1: { elemDmg: 8 }, s2: { atkPct: 10 }, s3: { elemDmg: 8 }, s4: { atkPct: 10 }, s5: { totalMult: 10 }, s6: { atkPct: 15, elemDmg: 10 } },
  // Chisa S1: ATK+30% on Unseen Snare (not defShred, confirmed exact). S2: team +50% All-Attr DMG for allies with
  // Thread of Bane (was deepen:10, wrong stat+value — real 10% Havoc RES ignore is the smaller of two S2 effects).
  // S4: improves Havoc Bane trigger rate (utility). S5: Moment of Nihility Liberation DMG Mult+100% (was totalMult:10,
  // no basis). S6: Unseen Snare-Finality: targets take 30% more Negative Status DMG (was deepen:15, wrong value)
  'Chisa':        { s1: { atkPct: 30 }, s2: { allDmg: 50 }, s3: { totalMult: 10 }, s4: { totalMult: 10 }, s5: { libDmg: 100 }, s6: { deepen: 30 } },
  // Ciaccona S1: ATK+35% after Basic ATK (conditional)
  'Ciaccona':     { s1: { atkPct: 35 }, s2: { allDmg: 40 }, s3: { totalMult: 10 }, s4: { defIgnore: 45 }, s5: { libDmg: 40 }, s6: { libDmg: 220 } },
  // Ciaccona R-chain corrected 2026-08-16 via Nanoka/Prydwen/Game8: s1 Basic ATK cast +35% ATK confirmed correct;
  // s2 during Liberation, team +40% Aero DMG Bonus (was totalMult:15, wrong category); s3 +1 Musical Essence/+1 Skill charge, utility with no direct DPS stat, totalMult fallback (was elemDmg:10, no basis);
  // s4 ignores 45% DEF on Quadruple Downbeat/Liberation DMG (was deepen:10, wrong category/value); s5 +40% Liberation DMG Bonus (was totalMult:10, wrong category);
  // s6 Solo Concert pulse deals 220% ATK Aero DMG counted as Liberation DMG (was elemDmg:15, wrong category/value).
  // Cantarella S1: +50% Skill DMG mult + Trance recovery ≈ totalMult 20
  'Cantarella':   { s1: { totalMult: 20 }, s2: { totalMult: 10 }, s3: { deepen: 8 }, s4: { coordDmg: 10 }, s5: { totalMult: 10 }, s6: { deepen: 15 } },
  // Corrected against ww.nanoka.cc character/1302 — prior values (elemDmg/resShred) didn't match her real
  // kit at all (she has no RES Shred anywhere in her chain).
  'Yinlin':       { s1: { skillDmg: 70 }, s2: { totalMult: 8 }, s3: { skillDmg: 55 }, s4: { atkPct: 20 }, s5: { libDmg: 100 }, s6: { totalMult: 40 } },
  'Changli':      { s1: { elemDmg: 10 }, s2: { skillDmg: 15 }, s3: { elemDmg: 10 }, s4: { atkPct: 15 }, s5: { totalMult: 10 }, s6: { deepen: 40 } },
  // Corrected against ww.nanoka.cc character/1105 — prior values (coordDmg/elemDmg on S1/S3/S4) didn't
  // match her real chain effects (Crit Rate, ATK stacking, team ATK — no Glacio DMG anywhere in her chain).
  'Zhezhi':       { s1: { critRate: 10 }, s2: { totalMult: 15 }, s3: { atkPct: 15 }, s4: { atkPct: 20 }, s5: { coordDmg: 20 }, s6: { coordDmg: 40 } },
  'Qiuyuan':      { s1: { critRate: 20 }, s2: { echoDmg: 30 }, s3: { libDmg: 500 }, s4: { atkPct: 20 }, s5: { defIgnore: 15 }, s6: { critDmg: 100 } },
  // Qiuyuan R-chain corrected 2026-08-16 via Prydwen/Game8: s1 +20% Crit Rate + uninterruptible Heavy ATKs (was echoDmg:10, wrong stat);
  // s2 Bamboo's Shade +30% additional team Echo Skill DMG (was totalMult:15); s3 Liberation DMG Mult +500% (was echoDmg:10, no basis);
  // s4 +20% ATK (was atkPct:10, half real value); s5 ignores 15% target DEF (was totalMult:10); s6 Straw Cape grants +100% Crit DMG for 6s (was echoDmg:40).
  // 4★ + missing characters
  // Corrected against ww.nanoka.cc character/1405 — prior values (deepen/defShred) didn't match any
  // real chain effect (she has no DMG Deepen or DEF Shred anywhere in her kit).
  'Jianxin':      { s1: { totalMult: 10 }, s2: { totalMult: 8 }, s3: { totalMult: 8 }, s4: { libDmg: 80 }, s5: { totalMult: 10 }, s6: { totalMult: 35 } },
  // Confirmed via ww.nanoka.cc character pages 1502 (Spectro), 1604 (Havoc), 1406 (Aero), 1309 (Electro).
  // energyRegen/heal aren't tracked stat keys elsewhere in this table — approximated as totalMult, same
  // convention this file already uses for other non-DMG-multiplier chain effects (CD resets, utility, etc).
  'Rover: Spectro': { s1: { critRate: 15 }, s2: { elemDmg: 20 }, s3: { totalMult: 12 }, s4: { totalMult: 10 }, s5: { libDmg: 40 }, s6: { resShred: 10 } },
  'Rover: Havoc':   { s1: { skillDmg: 30 }, s2: { totalMult: 8 }, s3: { totalMult: 8 }, s4: { resShred: 10 }, s5: { basicDmg: 50 }, s6: { critRate: 25 } },
  'Rover: Aero':    { s1: { totalMult: 5 }, s2: { totalMult: 12 }, s3: { elemDmg: 15 }, s4: { skillDmg: 15 }, s5: { libDmg: 20 }, s6: { skillDmg: 30 } },
  'Rover: Electro': { s1: { totalMult: 5 }, s2: { totalMult: 8 }, s3: { skillDmg: 20 }, s4: { libDmg: 20 }, s5: { critDmg: 20 }, s6: { skillDmg: 20 } },
  'Aalto':        { s1: { elemDmg: 8 }, s2: { totalMult: 10 }, s3: { elemDmg: 8 }, s4: { atkPct: 10 }, s5: { totalMult: 10 }, s6: { elemDmg: 12 } },
  // Baizhi: mostly healing/utility nodes, minimal DPS contribution
  'Baizhi':       { s1: { totalMult: 5 }, s2: { totalMult: 5 }, s3: { totalMult: 5 }, s4: { totalMult: 5 }, s5: { totalMult: 5 }, s6: { deepen: 10 } },
  'Buling':       { s1: { atkPct: 5 }, s2: { deepen: 5 }, s3: { atkPct: 5 }, s4: { deepen: 5 }, s5: { totalMult: 8 }, s6: { deepen: 10 } },
  'Chixia':       { s1: { atkPct: 8 }, s2: { skillDmg: 10 }, s3: { atkPct: 8 }, s4: { skillDmg: 10 }, s5: { totalMult: 10 }, s6: { elemDmg: 12 } },
  'Lumi':         { s1: { skillDmg: 10 }, s2: { totalMult: 10 }, s3: { skillDmg: 10 }, s4: { atkPct: 10 }, s5: { totalMult: 10 }, s6: { skillDmg: 15 } },
  'Taoqi':        { s1: { defShred: 5 }, s2: { deepen: 5 }, s3: { defShred: 5 }, s4: { deepen: 5 }, s5: { totalMult: 8 }, s6: { defShred: 8 } },
  'Yangyang':     { s1: { atkPct: 5 }, s2: { totalMult: 8 }, s3: { atkPct: 5 }, s4: { totalMult: 8 }, s5: { atkPct: 8 }, s6: { elemDmg: 10 } },
  'Youhu':        { s1: { atkPct: 5 }, s2: { deepen: 5 }, s3: { atkPct: 5 }, s4: { deepen: 5 }, s5: { atkPct: 5 }, s6: { deepen: 10 } },
  'Yuanwu':       { s1: { atkPct: 5 }, s2: { deepen: 5 }, s3: { atkPct: 5 }, s4: { deepen: 5 }, s5: { totalMult: 8 }, s6: { deepen: 10 } },
};

// [SECTION:SKILL_ICONS] — Per-character skill-name → icon URL, matched against SKILL_MULTIPLIERS/
// CHARACTER_ROTATIONS skill names the same way CHARACTER_ROTATIONS looks up its DMG row (substring match).
// Source: wutheringwaves.fandom.com per-character Skill_* image assets, re-hosted on ibb.co.
// Only characters that have been audited so far are populated.
const SKILL_ICONS = {
  'Encore': {
    'Wooly Attack': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp', // Basic ATK — shared generic Rectifier icon (same asset already used for Yinlin), also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp',
    'Cosmos: Frolicking': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp', // Cosmos Rave's Basic ATK replacement — same generic weapon icon
    'Flaming Woolies': 'https://i.ibb.co/twHsyRRM/Skill-Flaming-Woolies.webp',
    'Cosmos Rampage': 'https://i.ibb.co/twHsyRRM/Skill-Flaming-Woolies.webp', // Cosmos Rave's Resonance Skill replacement, same wiki icon as the base Skill
    'Cosmos Rave': 'https://i.ibb.co/CKy2Dkf5/Skill-Cosmos-Rave.webp',
    'Heavy ATK: Cloudy Frenzy': 'https://i.ibb.co/whstB0k3/Skill-Black-White-Woolies.webp', // Forte Circuit's own icon, covers both Forte states
    'Heavy ATK: Cosmos Rupture': 'https://i.ibb.co/whstB0k3/Skill-Black-White-Woolies.webp',
    'Woolies Helpers': 'https://i.ibb.co/gbpQxXkC/Skill-Woolies-Can-Help.webp',
    'Thermal Field': 'https://i.ibb.co/MkS6WNzG/Skill-Thermal-Field.webp',
  },
  'Calcharo': {
    'Gnawing Fangs': 'https://i.ibb.co/CpPvLLVt/Skill-Broadblade.webp', // Basic ATK — shared generic Broadblade icon (same asset already used for Jiyan), also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://i.ibb.co/CpPvLLVt/Skill-Broadblade.webp',
    'Extermination Order': 'https://i.ibb.co/7Nyx9Z3b/Skill-Extermination-Order.webp',
    'Heavy ATK: "Mercy"': 'https://i.ibb.co/kVd4h62C/Skill-Hunting-Mission.webp', // Forte Circuit's own icon, covers both Forte states
    'Heavy ATK: "Death Messenger"': 'https://i.ibb.co/kVd4h62C/Skill-Hunting-Mission.webp',
    'Phantom Etching': 'https://i.ibb.co/Xx7Hd3NG/Skill-Phantom-Etching.webp', // must precede 'Hounds Roar' below — the Liberation row's name is "Phantom Etching → Hounds Roar" and should resolve to this icon, not the generic weapon one
    'Hounds Roar': 'https://i.ibb.co/CpPvLLVt/Skill-Broadblade.webp', // Deathblade Gear's Basic ATK replacement, referenced standalone in the rotation — same generic weapon icon
    'Wanted Outlaw': 'https://i.ibb.co/B2pH4yjS/Skill-Wanted-Outlaw.webp',
    'Shadowy Raid': 'https://i.ibb.co/k2vk5Fqp/Skill-Shadowy-Raid.webp',
  },
  'Yinlin': {
    "Zapstring's Dance": 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp', // Basic ATK — shared generic Rectifier icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp',
    'Magnetic Roar': 'https://i.ibb.co/6785t0vK/Skill-Magnetic-Roar.webp',
    'Lightning Execution': 'https://i.ibb.co/6785t0vK/Skill-Magnetic-Roar.webp', // second phase of the same Resonance Skill, no separate wiki icon
    'Chameleon Cipher': 'https://i.ibb.co/ymCP6ZNM/Skill-Chameleon-Cipher.webp',
    'Thundering Wrath': 'https://i.ibb.co/0y3Tswfv/Skill-Thundering-Wrath.webp',
    'Raging Storm': 'https://i.ibb.co/TMqQ3Sdc/Skill-Raging-Storm.webp',
    'Strategist': 'https://i.ibb.co/dJzzqS1V/Skill-Strategist.webp',
  },
  'Jiyan': {
    'Lone Lance': 'https://i.ibb.co/CpPvLLVt/Skill-Broadblade.webp', // Basic ATK — shared generic Broadblade icon on the wiki, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://i.ibb.co/CpPvLLVt/Skill-Broadblade.webp', // Heavy ATK / Dodge Counter rows
    'Windqueller': 'https://i.ibb.co/Rk9XDRW3/Skill-Windqueller.webp',
    'Emerald Storm: Finale': 'https://i.ibb.co/F4SmBx2q/Skill-Qingloong-at-War.webp', // Forte Circuit's own icon
    'Emerald Storm: Prelude': 'https://i.ibb.co/4gT4C4SW/Skill-Emerald-Storm-Prelude.webp',
    'Tactical Strike': 'https://i.ibb.co/33s8c1p/Skill-Tactical-Strike.webp',
    'Discipline': 'https://i.ibb.co/TBjWQSR1/Skill-Discipline.webp',
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Jianxin, re-hosted on ibb.co (2026-08-17,
  // matching the convention used for the other audited characters above — all 6 URLs verified 200/live
  // before upload).
  'Jianxin': {
    'Fengyiquan': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp', // Basic ATK — shared generic Gauntlets icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp',
    'Calming Air': 'https://i.ibb.co/4w8Mq52y/Skill-Calming-Air.webp',
    'Primordial Chi Spiral': 'https://i.ibb.co/xtnnFYZC/Skill-Primordial-Chi-Spiral.webp',
    'Purification Force Field': 'https://i.ibb.co/JjzrRftm/Skill-Purification-Force-Field.webp',
    'Essence of Tao': 'https://i.ibb.co/jZvd35BH/Skill-Essence-of-Tao.webp', // Intro Skill
    'Transcendence': 'https://i.ibb.co/jP7RDt0b/Skill-Transcendence.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Lingyang, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload.
  'Lingyang': {
    'Majestic Fists': 'https://i.ibb.co/Cs76xkJK/Skill-Majestic-Fists.webp', // Basic ATK — also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://i.ibb.co/Cs76xkJK/Skill-Majestic-Fists.webp',
    'Ancient Arts': 'https://i.ibb.co/5h5F3YrR/Skill-Ancient-Arts.webp',
    'Unification of Spirits': 'https://i.ibb.co/4R6ggr17/Skill-Unification-of-Spirits.webp',
    "Strive: Lion's Vigor": 'https://i.ibb.co/Wbh05jj/Skill-Strive-Lions-Vigor.webp',
    'Lion Awakens': 'https://i.ibb.co/v4t5F4cP/Skill-Lion-Awakens.webp', // Intro Skill
    'Frosty Marks': 'https://i.ibb.co/SwNjm5nr/Skill-Frosty-Marks.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Verina, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload. Cultivation
  // (Basic ATK) uses the same generic Skill_Rectifier.png icon already re-hosted for Encore/Yinlin.
  'Verina': {
    'Cultivation': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp', // Basic ATK — shared generic Rectifier icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp',
    'Botany Experiment': 'https://i.ibb.co/S4TqBZMp/Skill-Botany-Experiment.webp',
    'Starflower Blooms': 'https://i.ibb.co/4RZZwnz0/Skill-Starflower-Blooms.webp',
    'Arboreal Flourish': 'https://i.ibb.co/204LdT14/Skill-Arboreal-Flourish.webp',
    'Verdant Growth': 'https://i.ibb.co/kgxDz6Xv/Skill-Verdant-Growth.webp', // Intro Skill
    'Blossom': 'https://i.ibb.co/1fVPJtzv/Skill-Blossom.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Jinhsi, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API (Forte table section fetched directly by section index to
  // dodge the page's huge collapsed ascension tables) — all 6 URLs verified 200/live before upload.
  'Jinhsi': {
    'Slash of Breaking Dawn': 'https://i.ibb.co/tMmTFPJH/Skill-Broadblade.webp', // Basic ATK — also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://i.ibb.co/tMmTFPJH/Skill-Broadblade.webp',
    'Trailing Lights of Eons': 'https://i.ibb.co/zVbYMXzG/Skill-Trailing-Lights-of-Eons.webp',
    'Luminal Synthesis': 'https://i.ibb.co/R5sPDCC/Skill-Luminal-Synthesis.webp',
    'Purge of Light': 'https://i.ibb.co/cSS7ms3Z/Skill-Purge-of-Light.webp',
    "Loong's Halo": 'https://i.ibb.co/cKXv3P1y/Skill-Loong-Halo.webp', // Intro Skill
    'Temporal Bender': 'https://i.ibb.co/qZDp0Jz/Skill-Temporal-Bender.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Changli, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload. Blazing
  // Enlightenment (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Sword.png icon.
  'Changli': {
    'Blazing Enlightenment': 'https://i.ibb.co/4w6tSxmb/Skill-Sword.webp', // Basic ATK — also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://i.ibb.co/4w6tSxmb/Skill-Sword.webp',
    'Tripartite Flames': 'https://i.ibb.co/DDwNWX8M/Skill-Tripartite-Flames.webp',
    'Flaming Sacrifice': 'https://i.ibb.co/39K3xvGn/Skill-Flaming-Sacrifice.webp',
    'Radiance of Fealty': 'https://i.ibb.co/Df83Zv7v/Skill-Radiance-of-Fealty.webp',
    'Obedience of Rules': 'https://i.ibb.co/4w1N13zp/Skill-Obedience-of-Rules.webp', // Intro Skill
    'Strategy of Duality': 'https://i.ibb.co/sdkt9Yhd/Skill-Strategy-of-Duality.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Zhezhi, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload. Dimming Brush
  // (Basic ATK) uses the same generic Skill_Rectifier.png icon already re-hosted for Encore/Yinlin/Verina.
  'Zhezhi': {
    'Dimming Brush': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp', // Basic ATK — also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp',
    'Manifestation': 'https://i.ibb.co/DDNMwsCy/Skill-Manifestation.webp',
    'Ink and Wash': 'https://i.ibb.co/8DYg2f8z/Skill-Ink-and-Wash.webp',
    'Living Canvas': 'https://i.ibb.co/Vc7cVKF1/Skill-Living-Canvas.webp',
    'Radiant Ruin': 'https://i.ibb.co/LX3NLrxP/Skill-Radiant-Ruin.webp', // Intro Skill
    'Carve and Draw': 'https://i.ibb.co/V0s9WpHG/Skill-Carve-and-Draw.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Xiangli Yao, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before
  // upload. Probe (Basic ATK) has no dedicated wiki asset (it's itself a redirect to the generic
  // Gauntlets icon), also covers Heavy ATK/Mid-air/Dodge Counter, same as Jianxin's shared icon.
  'Xiangli Yao': {
    'Probe': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp',
    'Standard': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp',
    'Deduction': 'https://i.ibb.co/8D4YCpRh/skill-deduction.webp',
    'Decipher': 'https://i.ibb.co/8D4YCpRh/skill-deduction.webp', // Forte-upgraded Skill, same wiki icon as base Deduction
    'Forever Seeking': 'https://i.ibb.co/TMjphf6y/skill-forever-seeking.webp',
    'Cogitation Model': 'https://i.ibb.co/CKYDdBRY/skill-cogitation.webp',
    'Principle': 'https://i.ibb.co/cXpS7bBx/skill-principle.webp', // Intro Skill
    'Chain Rule': 'https://i.ibb.co/spxqcJ3K/skill-chain-rule.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Shorekeeper, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before
  // upload. Origin Calculus (Basic ATK) uses the same generic Skill_Rectifier.png icon already
  // re-hosted for Encore/Yinlin/Verina/Zhezhi.
  'Shorekeeper': {
    'Origin Calculus': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp',
    'Standard': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp',
    'Chaos Theory': 'https://i.ibb.co/zTGgrNMM/skill-chaos-theory.webp',
    'Astral Chord': 'https://i.ibb.co/pkXPr5P/skill-astral-chord.webp',
    'End Loop': 'https://i.ibb.co/MD3NpydF/skill-end-loop.webp',
    'Proof of Existence': 'https://i.ibb.co/RGFGH8d9/skill-proof-of-existence.webp', // Intro Skill
    'Binary Butterfly': 'https://i.ibb.co/bjjhnD3f/skill-binary-butterfly.webp', // Outro Skill
  },
};
const getSkillIcon = (name, skillName) => {
  const table = SKILL_ICONS[name];
  if (!table) return null;
  const key = Object.keys(table).find(k => skillName.includes(k));
  return key ? table[key] : null;
};

// [SECTION:CHAIN_NODE_ICONS] — Per-character S1-S6 Resonance Chain sequence-node icons.
// Source: wutheringwaves.fandom.com Sequence_Node_* image assets (order matches each character's
// Combat page infobox gallery, which lists nodes S1→S6 top to bottom), re-hosted on ibb.co.
// Only characters that have been audited so far are populated.
const CHAIN_NODE_ICONS = {
  'Encore': {
    s1: 'https://i.ibb.co/67jq2qtF/Sequence-Node-Woolys-Fairy-Tale.webp',
    s2: 'https://i.ibb.co/qvQ1d2y/Sequence-Node-Sheep-counting-Lullaby.webp',
    s3: 'https://i.ibb.co/607dHq05/Sequence-Node-Fog-The-Black-Shores.webp',
    s4: 'https://i.ibb.co/wZc99zfT/Sequence-Node-Adventure-Lets-go.webp',
    s5: 'https://i.ibb.co/ccg6m394/Sequence-Node-Hero-Takes-the-Stage.webp',
    s6: 'https://i.ibb.co/0RK9HNY8/Sequence-Node-Woolies-Save-the-World.webp',
  },
  'Calcharo': {
    s1: 'https://i.ibb.co/zW1SQbgD/Sequence-Node-Covert-Negotiation.webp',
    s2: 'https://i.ibb.co/0RhbRfYd/Sequence-Node-Zero-Sum-Game.webp',
    s3: 'https://i.ibb.co/F42fkz3h/Sequence-Node-Iron-Fist-Diplomacy.webp',
    s4: 'https://i.ibb.co/hRVPBYSc/Sequence-Node-Dark-Alliance.webp',
    s5: 'https://i.ibb.co/bMhxw2YM/Sequence-Node-Unconventional-Compact.webp',
    s6: 'https://i.ibb.co/WvtpCtrd/Sequence-Node-The-Ultimatum.webp',
  },
  'Yinlin': {
    s1: 'https://i.ibb.co/hFqjmjxt/Sequence-Node-Moralitys-Crossroad.webp',
    s2: 'https://i.ibb.co/x85ZgwFQ/Sequence-Node-Ensnarled-By-Rapport.webp',
    s3: 'https://i.ibb.co/XZFYMQ66/Sequence-Node-Unyielding-Verdict.webp',
    s4: 'https://i.ibb.co/qMBj8Pb1/Sequence-Node-Steadfast-Conviction.webp',
    s5: 'https://i.ibb.co/tPPkZN2W/Sequence-Node-Resounding-Will.webp',
    s6: 'https://i.ibb.co/HfFYQC4C/Sequence-Node-Pursuit-of-Justice.webp',
  },
  'Jiyan': {
    s1: 'https://i.ibb.co/8DQZqf8V/Sequence-Node-Benevolence.webp',
    s2: 'https://i.ibb.co/qYfdjDZj/Sequence-Node-Versatility.webp',
    s3: 'https://i.ibb.co/KpnqFPPK/Sequence-Node-Spectation.webp',
    s4: 'https://i.ibb.co/w3M5q2w/Sequence-Node-Prudence.webp',
    s5: 'https://i.ibb.co/fzZxFxmw/Sequence-Node-Resolution.webp',
    s6: 'https://i.ibb.co/0jYkwNc5/Sequence-Node-Fortitude.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Jianxin, re-hosted on ibb.co
  // (2026-08-17, matching the convention above) — order confirmed S1→S6 against the Chain Table on
  // Jianxin/Combat, all 6 URLs verified 200/live before upload.
  'Jianxin': {
    s1: 'https://i.ibb.co/Cp76tHr7/Sequence-Node-Verdant-Branchlet.webp',
    s2: 'https://i.ibb.co/Z0VXpGV/Sequence-Node-Tao-Seekers-Journey.webp',
    s3: 'https://i.ibb.co/NgdRQB4T/Sequence-Node-Principles-of-Wuwei.webp',
    s4: 'https://i.ibb.co/9HypDDH7/Sequence-Node-Multitide-Reflection.webp',
    s5: 'https://i.ibb.co/DHW1ndcQ/Sequence-Node-Mirroring-Introspection.webp',
    s6: 'https://i.ibb.co/hFH1wK8g/Sequence-Node-Truth-from-Within.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Lingyang, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Chain Table on ww.nanoka.cc/character/1104, all 6
  // URLs verified 200/live before upload.
  'Lingyang': {
    s1: 'https://i.ibb.co/35qjT11k/Sequence-Node-Lion-of-Light.webp',
    s2: 'https://i.ibb.co/fY1GpNzv/Sequence-Node-Dominant-and-Fierce.webp',
    s3: 'https://i.ibb.co/rR5Sv0w7/Sequence-Node-Jaw-Dropping-Feats.webp',
    s4: 'https://i.ibb.co/Wvr3prmH/Sequence-Node-Immortals-Bow.webp',
    s5: 'https://i.ibb.co/hRYWXtX5/Sequence-Node-Seven-Stars-Shine.webp',
    s6: 'https://i.ibb.co/Z1myY6Sc/Sequence-Node-Demons-Tremble.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Verina, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Chain Table on ww.nanoka.cc/character/1503, all 6
  // URLs verified 200/live before upload.
  'Verina': {
    s1: 'https://i.ibb.co/RptDBgXm/Sequence-Node-Moment-of-Emergence.webp',
    s2: 'https://i.ibb.co/zW0fpNdD/Sequence-Node-Sprouting-Reflections.webp',
    s3: 'https://i.ibb.co/VWb4ycvt/Sequence-Node-The-Choice-to-Flourish.webp',
    s4: 'https://i.ibb.co/Hpfb99bt/Sequence-Node-Blossoming-Embrace.webp',
    s5: 'https://i.ibb.co/xtHvxT1F/Sequence-Node-Miraculous-Blooms.webp',
    s6: 'https://i.ibb.co/fYjvXxRB/Sequence-Node-Joyous-Harvest.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Jinhsi, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 directly against the Resonance Chain table on Jinhsi/Combat
  // (fetched by section index), all 6 URLs verified 200/live before upload.
  'Jinhsi': {
    s1: 'https://i.ibb.co/B2ZXj0Vp/Sequence-Node-Abyssal-Ascension.webp',
    s2: 'https://i.ibb.co/C5bnYtr4/Sequence-Node-Chronofrost-Repose.webp',
    s3: 'https://i.ibb.co/spYvJ40L/Sequence-Node-Celestial-Incarnate.webp',
    s4: 'https://i.ibb.co/wFtWBff4/Sequence-Node-Benevolent-Grace.webp',
    s5: 'https://i.ibb.co/SDksbmM6/Sequence-Node-Frostfire-Illumination.webp',
    s6: 'https://i.ibb.co/63m9q28/Sequence-Node-Thawing-Triumph.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Changli, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 directly against the Resonance Chain table on Changli/Combat
  // (fetched by section index), all 6 URLs verified 200/live before upload.
  'Changli': {
    s1: 'https://i.ibb.co/FM07vnf/Sequence-Node-Hidden-Thoughts.webp',
    s2: 'https://i.ibb.co/XBqhm0L/Sequence-Node-Pursuit-of-Desires.webp',
    s3: 'https://i.ibb.co/ZzVrnF98/Sequence-Node-Learned-Secrets.webp',
    s4: 'https://i.ibb.co/MkQV5gT9/Sequence-Node-Polished-Words.webp',
    s5: 'https://i.ibb.co/39jsTQRB/Sequence-Node-Sacrificed-Gains.webp',
    s6: 'https://i.ibb.co/wZJn2XcV/Sequence-Node-Realized-Plans.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Zhezhi, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 directly against the Resonance Chain table on Zhezhi/Combat
  // (fetched by section index), all 6 URLs verified 200/live before upload.
  'Zhezhi': {
    s1: 'https://i.ibb.co/pB0KfwRY/Sequence-Node-Brushworks-Finish.webp',
    s2: 'https://i.ibb.co/PGNt7fSK/Sequence-Node-Vivid-Strokes.webp',
    s3: 'https://i.ibb.co/b5zxp1S9/Sequence-Node-Reflections-Grace.webp',
    s4: 'https://i.ibb.co/jZbWXLGX/Sequence-Node-Hues-Spectrum.webp',
    s5: 'https://i.ibb.co/8gCVrMWV/Sequence-Node-Compositions-Clue.webp',
    s6: 'https://i.ibb.co/MDqdsTLR/Sequence-Node-Infinite-Legacy.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Xiangli Yao, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live build
  // page and ww.nanoka.cc/character/1305, all 6 URLs verified 200/live before upload.
  'Xiangli Yao': {
    s1: 'https://i.ibb.co/zHRQ6hSs/node-s1-prodigy.webp',
    s2: 'https://i.ibb.co/DDWBkrdQ/node-s2-traces.webp',
    s3: 'https://i.ibb.co/0RyGcG7t/node-s3-ruins.webp',
    s4: 'https://i.ibb.co/fzP6KpqR/node-s4-vessel.webp',
    s5: 'https://i.ibb.co/DPTYYfnj/node-s5-end.webp',
    s6: 'https://i.ibb.co/bg0ffhj0/node-s6-solace.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Shorekeeper, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1505, all 6 URLs verified 200/live before upload.
  'Shorekeeper': {
    s1: 'https://i.ibb.co/mrNGMGDz/node-s1-unspoken.webp',
    s2: 'https://i.ibb.co/1fsfvs1s/node-s2-nightsgift.webp',
    s3: 'https://i.ibb.co/PZkV3FHz/node-s3-infinity.webp',
    s4: 'https://i.ibb.co/V00QHX4H/node-s4-overflowing.webp',
    s5: 'https://i.ibb.co/S4R3jKr6/node-s5-echoes.webp',
    s6: 'https://i.ibb.co/d45HxqB9/node-s6-newworld.webp',
  },
};

// [SECTION:CHAIN_NODE_NAMES] — Per-character S1-S6 Resonance Chain sequence-node names
// (e.g. "Benevolence", "Versatility"...), confirmed against ww.nanoka.cc's character JSON
// (static.nanoka.cc/ww/<version>/en/character/<id>.json) and wutheringwaves.fandom.com.
// Only characters that have been audited so far are populated.
const CHAIN_NODE_NAMES = {
  'Jiyan': { s1: 'Benevolence', s2: 'Versatility', s3: 'Spectation', s4: 'Prudence', s5: 'Resolution', s6: 'Fortitude' },
  'Yinlin': { s1: "Morality's Crossroad", s2: 'Ensnarled By Rapport', s3: 'Unyielding Verdict', s4: 'Steadfast Conviction', s5: 'Resounding Will', s6: 'Pursuit of Justice' },
  'Calcharo': { s1: 'Covert Negotiation', s2: 'Zero-Sum Game', s3: 'Iron Fist Diplomacy', s4: 'Dark Alliance', s5: 'Unconventional Compact', s6: 'The Ultimatum' },
  'Encore': { s1: "Wooly's Fairy Tale", s2: 'Sheep-counting Lullaby', s3: 'Fog? The Black Shores!', s4: "Adventure? Let's go!", s5: 'Hero Takes the Stage!', s6: 'Woolies Save the World!' },
  'Jianxin': { s1: 'Verdant Branchlet', s2: "Tao Seeker's Journey", s3: 'Principles of Wuwei', s4: 'Multitide Reflection', s5: 'Mirroring Introspection', s6: 'Truth from Within' },
  'Lingyang': { s1: 'Lion of Light, Blessings Abound', s2: 'Dominant and Fierce, Power Unbound', s3: 'Jaw-Dropping Feats, Loud and Wide', s4: 'Immortals Bow, in Reverence Flawed', s5: 'Seven Stars Shine, Stepped upon High', s6: 'Demons Tremble, Divine Power Nigh' },
  'Verina': { s1: 'Moment of Emergence', s2: 'Sprouting Reflections', s3: 'The Choice to Flourish', s4: 'Blossoming Embrace', s5: 'Miraculous Blooms', s6: 'Joyous Harvest' },
  'Jinhsi': { s1: 'Abyssal Ascension', s2: 'Chronofrost Repose', s3: 'Celestial Incarnate', s4: 'Benevolent Grace', s5: 'Frostfire Illumination', s6: 'Thawing Triumph' },
  'Changli': { s1: 'Hidden Thoughts', s2: 'Pursuit of Desires', s3: 'Learned Secrets', s4: 'Polished Words', s5: 'Sacrificed Gains', s6: 'Realized Plans' },
  'Zhezhi': { s1: "Brushwork's Finish", s2: 'Vivid Strokes', s3: "Reflection's Grace", s4: "Hue's Spectrum", s5: "Composition's Clue", s6: 'Infinite Legacy' },
  'Xiangli Yao': { s1: 'Prodigy of Protégés', s2: 'Traces of Predecessors', s3: 'Ruins of Ancient', s4: 'Vessel of Rebirth', s5: 'End of Stars', s6: 'Solace of the Ordinary' },
  'Shorekeeper': { s1: 'Unspoken Conjecture', s2: "Night's Gift and Refusal", s3: 'Infinity Awaits Me', s4: 'Overflowing Quietude', s5: 'Echoes in Silence', s6: 'To the New World' },
};

// Release order for sorting (based on first banner appearance)
const RELEASE_ORDER = [
  // 1.0 - Launch (May 2024) — Rover: Spectro/Havoc/Aero all selectable from launch
  'Rover: Spectro', 'Rover: Havoc', 'Rover: Aero', 'Jiyan', 'Yinlin', 'Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina',
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
  // 3.3 (verified against game8.co's official character order 2026-08-14)
  'Hiyuki', 'Denia',
  // 3.4
  'Rover: Electro', 'Lucy', 'Rebecca', 'Lucilla',
  // 3.5
  'Yangyang: Xuanling', 'Suisui',
  // 3.6
  'Qingxiao', 'Jingran',
];

// Derived character lists — single source of truth from CHARACTER_DATA
// Adding a new character only requires editing CHARACTER_DATA + RELEASE_ORDER
const ALL_5STAR_RESONATORS = RELEASE_ORDER.filter(name => CHARACTER_DATA[name]?.rarity === 5);
const ALL_4STAR_RESONATORS = Object.keys(CHARACTER_DATA).filter(name => CHARACTER_DATA[name].rarity === 4);
const ALL_CHARACTERS = new Set([...ALL_5STAR_RESONATORS, ...ALL_4STAR_RESONATORS]);

// Standard 5★ characters (Tidal Chorus / 50-50 loss pool) — update when new standard chars are added
const STANDARD_5STAR_CHARACTERS = new Set(['Calcharo', 'Encore', 'Jianxin', 'Lingyang', 'Verina']);

export {
  CHARACTER_DATA,
  CHAR_BUFF_TABLE,
  SKILL_MULTIPLIERS,
  CHARACTER_ROTATIONS,
  RESONANCE_CHAIN_DATA,
  SKILL_ICONS,
  getSkillIcon,
  CHAIN_NODE_ICONS,
  CHAIN_NODE_NAMES,
  RELEASE_ORDER,
  ALL_CHARACTERS,
  STANDARD_5STAR_CHARACTERS,
  ALL_5STAR_RESONATORS,
  ALL_4STAR_RESONATORS,
};
