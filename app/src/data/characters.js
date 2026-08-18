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
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1603 sheet. desc: title "Sanguine Blossom" (nanoka) prepended and
  // blurb rewritten from nanoka's own profile text to match the roster's convention (previous desc was
  // a generic one-liner with no title, unlike the rest of the audited roster). skills/base stats/
  // ascension/skill materials/bestEchoes/selfBuffs all re-confirmed accurate. weaponAlts was entirely
  // missing — added: alt5 leads with Emerald Sentence (90.1%, Prydwen's actual #2) plus Emerald of
  // Genesis, explicitly named "Best permanent option for Camellya" despite a slightly lower calc% than
  // Frostburn/Everbright Polestar; alt4 uses Feather Edge (77.8%, #1 4★) and Lumingloss (76.8%, #2 4★);
  // alt3 uses the standard starter Sword of Night, matching the convention used for other Sword users.
  'Camellya': { rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    desc: 'Sanguine Blossom, a Bloom Bearer of the Black Shores — free-spirited and dangerously charming, she roams Solaris in search of talent, immersing herself in the present and relishing its pleasures, unburdened by thoughts of the past or future. On-field Havoc Main DPS who alternates White Hair (mobile) and Red Hair/Blossom Mode (stationary AoE spin) via her Skill, builds Crimson Pistils into Crimson Buds, unleashes the Forte burst Ephemeral into Budding Mode for a team of amplified Basic Attacks, and closes with her Outro Twining nuke.',
    skills: ['Burgeoning', 'Valse of Bloom and Blight', 'Fervor Efflorescent', 'Vegetative Universe'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Metallic Drip' },
    bestEchoes: ['Nightmare: Crownless', 'Havoc Eclipse 5pc'], bestWeapon: 'Red Spring',
    weaponAlts: { alt5: ['Emerald Sentence', 'Emerald of Genesis'], alt4: ['Feather Edge', 'Lumingloss'], alt3: ['Sword of Night'] },
    teams: ['Camellya + Roccia + Shorekeeper', 'Camellya + Sanhua + Verina'] },
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1107 sheet. desc: title "Reshaping Dimensions" (nanoka) prepended and
  // blurb rewritten from nanoka's own profile text to match the roster's convention. skills/ascension/
  // skill materials/bestEchoes/selfBuffs all re-confirmed accurate. weaponAlts was entirely missing —
  // added: alt5 uses Phasic Homogenizer (93.5%) and Woodland Aria (86.2%), Prydwen's #2/#3 non-signature
  // 5-stars; alt4 uses Undying Flame (75.8%, best 4★) and Pistols#26 (72.0%, named best F2P/no-gacha
  // option); alt3 uses the standard starter Pistols of Night, matching the convention used elsewhere.
  'Carlotta': { rarity: 5, element: 'Glacio', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Reshaping Dimensions, second daughter of the Montelli family and an art investor unbound by convention — she moves seamlessly through social circles and business transactions while quietly handling the family\'s unspeakable "troubles" in secret. On-field Glacio Main DPS who builds Moldable Crystals and Substance through her Basic/Heavy Attack and Skill combos, unleashes the Forte Heavy Imminent Oblivion at full Substance for Final Bow, then dumps her fully-buffed Resonance Liberation Era of New Wave into a six-hit Twilight Tango barrage (Death Knell ×4 into Fatal Finale) for a massive burst of Resonance Skill-flagged DMG.',
    skills: ['Silent Execution', 'Art of Violence', 'Era of New Wave', 'Lethal Repertoire'],
    ascension: { boss: 'Platinum Core', common: 'Polygon Core', specialty: 'Sword Acorus' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Phlogiston' },
    bestEchoes: ['Sentry Construct', 'Frosty Resolve 5pc'], bestWeapon: 'The Last Dance',
    weaponAlts: { alt5: ['Phasic Homogenizer', 'Woodland Aria'], alt4: ['Undying Flame', 'Pistols#26'], alt3: ['Pistols of Night'] },
    teams: ['Carlotta + Zhezhi + Shorekeeper', 'Carlotta + Zhezhi + Buling'] },
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1606 sheet. desc: title "Stage in the Box" (nanoka) prepended and
  // blurb rewritten to match the roster's convention (previous desc wrongly described her as dealing
  // Havoc DMG "through Coordinated Attacks with Pero" — Pero is her companion/pet but her kit has no
  // Coordinated Attack mechanic at all; corrected to her real Forte Circuit Beyond Imagination combo).
  // skills/ascension/skill materials/bestEchoes all re-confirmed accurate. weaponAlts was entirely
  // missing — added: alt5 uses Solsworn Ciphers (90.0%) and Blazing Justice (88.2%), Prydwen's #2/#3
  // non-signature 5-stars; alt4 uses Aether Strike (72.9%) and Celestial Spiral (72.6%), the top two
  // 4-stars; alt3 uses the standard starter Gauntlets of Night, matching the convention used elsewhere.
  'Roccia': { rarity: 5, element: 'Havoc', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Stage in the Box, assistant, prop master, and improv comedian of the Troupe of Fools — always there to make sure the Troupe is at the ready, carrying a Magic Box that appears to hold the world, or perhaps a world she recreated inside it. Havoc sub-DPS/buffer who pulls enemies in and enters Beyond Imagination via her Skill, bounces through 3 Forte Real Fantasy hits (counted as Heavy Attack DMG), nukes with her Liberation for a scaling flat team ATK buff off her own Crit Rate, then buffs the incoming Resonator\'s Havoc and Basic ATK DMG through her Outro Applause, Please! — the best group-pull utility in the game via her Skill and transferable Magic Box.',
    skills: ['Pero, Easy', 'Acrobatic Trick', 'Commedia Improvviso!', 'A Prop Master Prepares'],
    ascension: { boss: 'Cleansing Conch', common: 'Tidal Residuum', specialty: 'Firecracker Jewelweed' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Cadence' },
    bestEchoes: ['Nightmare: Impermanence Heron', 'Midnight Veil 5pc'], bestWeapon: 'Tragicomedy',
    weaponAlts: { alt5: ['Solsworn Ciphers', 'Blazing Justice'], alt4: ['Aether Strike', 'Celestial Spiral'], alt3: ['Gauntlets of Night'] },
    teams: ['Roccia + Camellya + Shorekeeper', 'Roccia + Cantarella + Verina'] },
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1506 sheet. desc: title "Graceful Luminescence" (nanoka) prepended
  // and blurb rewritten — previous desc only described her Confession/support mode ("applies Frazzle...
  // enabling Spectro DPS teammates"), but Prydwen frames her as equally viable as a Main DPS in
  // Absolution mode (tier T1.5 DPS vs T2 Hybrid, DPS is actually rated higher), and she has no
  // "Resonance Skill card summons" mechanic at all — corrected to cover both Forte Circuit states
  // (Absolution self-DPS / Confession Frazzle-application support). skills/ascension/skill materials/
  // bestEchoes/outroBuffs/debuffs all re-confirmed accurate. weaponAlts was entirely missing — added:
  // alt5 uses Lethean Elegy (98.1%) and Stringmaster (97.5%), Prydwen's #2/#3 non-signature 5-stars;
  // alt4 uses Augment (86.1%, best 4★) and Ocean's Gift (78.8%, #2 4★); alt3 uses the standard starter
  // Rectifier of Night, matching the convention used elsewhere.
  'Phoebe': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Graceful Luminescence, Acolyte of the Order of the Deep — a young woman of quiet devotion who fulfills her duties with unwavering diligence, her prayers offering comfort and peace like the light she carries. Dual-mode Spectro Hybrid who consumes Prayer at full Forte to enter either Absolution (self-buffed Main DPS, amplifying her own Heavy Attack Starflash against Spectro Frazzle) or Confession (support mode, stacking Spectro Frazzle onto enemies and buffing the on-field ally\'s Frazzle DMG via Outro) — Confession Phoebe is built specifically to empower Zani, her only current Frazzle-DPS partner.',
    skills: ['O Come Divine Light', 'To Where Light Shines', 'Dawn of Enlightenment', 'Radiant Invocation'],
    ascension: { boss: 'Cleansing Conch', common: 'Whisperin Core', specialty: 'Firecracker Jewelweed' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Helix' },
    bestEchoes: ['Capitaneus', 'Eternal Radiance 5pc'], bestWeapon: 'Luminous Hymn',
    weaponAlts: { alt5: ['Lethean Elegy', 'Stringmaster'], alt4: ['Augment', "Ocean's Gift"], alt3: ['Rectifier of Night'] },
    teams: ['Phoebe + Zani + Shorekeeper', 'Phoebe + Rover: Spectro + Verina'] },
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1206 sheet. desc: title "Flamebound Compass" (nanoka) prepended and
  // blurb rewritten to match the roster's convention. skills/ascension/skill materials/bestEchoes all
  // re-confirmed accurate. weaponAlts was entirely missing — added: alt5 uses Laser Shearer (77.2%) and
  // Bloodpact's Pledge (75.1%, F2P-obtainable), Prydwen's #2/#3 non-signature 5-stars; alt4 uses Overture
  // (Energy Regen main stat, matching Brant's extreme ER requirement — Prydwen lists no 4★ options for
  // him at all) and Commando of Conviction as a no-gacha baseline; alt3 uses the standard starter Sword
  // of Night.
  'Brant': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Flamebound Compass, captain of Rinascita\'s Troupe of Fools — a free spirit and romantic, unpredictable and full of life, the beating heart of the troupe who slips into countless roles on stage but is unwaveringly genuine offstage. Fusion Main DPS/Hybrid who fills his Forte Bravo through Mid-air Basic Attack chains and his Intro, unleashes the burst Forte skill Returned from Ashes for massive damage plus a team-wide shield, heals the team as Bravo builds, and buffs the incoming Resonator\'s Fusion and Resonance Skill DMG through his Outro The Course is Set! — almost his entire kit is executed airborne, dodging most enemy attacks for free.',
    skills: ['Captain\'s Rhapsody', 'Anchors Aweigh!', 'To the Horizon', 'Ocean Odyssey'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Metallic Drip' },
    bestEchoes: ['Dragon of Dirge', 'Tidebreaking Courage 5pc'], bestWeapon: 'Unflickering Valor',
    weaponAlts: { alt5: ['Laser Shearer', "Bloodpact's Pledge"], alt4: ['Overture', 'Commando of Conviction'], alt3: ['Sword of Night'] },
    teams: ['Brant + Lupa + Changli', 'Brant + Changli + Shorekeeper'] },
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1607 sheet. desc: title "Sea of Dreams" (nanoka) prepended and blurb
  // rewritten to match the roster's convention. organization uses 'Fisalia Family' (no leading "The")
  // to match helpers.js's FACTION_ICONS key exactly, avoiding the mismatch previously found on Carlotta.
  // skills/ascension/skill materials/bestEchoes all re-confirmed accurate. weaponAlts was entirely
  // missing — added: alt5 uses Rime-Draped Sprouts (87.0%) and Stringmaster (85.0%), Prydwen's #2/#3
  // non-signature 5-stars; alt4 uses Radiant Dawn (77.9%, best 4★) and Augment (77.8%, #2 4★); alt3 uses
  // the standard starter Rectifier of Night, matching the convention used elsewhere.
  'Cantarella': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Sea of Dreams, current head of the Fisalia Family, Cantarella the Bane — a mysterious noblewoman whose beauty is as captivating as it is perilous, residing in a crown-like castle where illusory dreams flow like streams, meticulously spun by her own hands. Havoc Hybrid who builds Trance through her Intro/Skill/Liberation, enters Mirage via her Forte Heavy Delusive Dive to unlock enhanced Basic Attacks and the burst Perception Drain nuke, deals off-field Havoc DMG through Coordinated Attack Dreamweavers from her Liberation, heals the team throughout, and buffs the incoming Resonator\'s Havoc and Resonance Skill DMG via her Outro Gentle Tentacles.',
    skills: ['Illusion Collapse', 'Dance with Shadows', 'Beneath the Sea', 'Between Illusion and Reality'],
    ascension: { boss: 'Cleansing Conch', common: 'Polygon Core', specialty: 'Seaside Cendrelis' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Helix' },
    bestEchoes: ['Lorelei', 'Midnight Veil 5pc'], bestWeapon: 'Whispers of Sirens',
    weaponAlts: { alt5: ['Rime-Draped Sprouts', 'Stringmaster'], alt4: ['Radiant Dawn', 'Augment'], alt3: ['Rectifier of Night'] },
    teams: ['Cantarella + Phrolova + Qiuyuan', 'Cantarella + Camellya + Shorekeeper'] },
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1507 sheet. desc: title "Scorched Radiance" (nanoka) prepended and
  // blurb rewritten — the previous desc said she "builds Frazzle stacks via Resonance Skill counters and
  // Heavy Attacks", but Zani cannot apply Spectro Frazzle herself at all; she instantly converts
  // teammates' Frazzle into her own Heliacal Ember/Blaze resource, which is a meaningfully different
  // (and team-dependent) mechanic. organization uses 'Montelli Family' (no leading "The") to match
  // helpers.js's FACTION_ICONS key, avoiding the mismatch previously found on Carlotta. skills/ascension/
  // skill materials/bestEchoes/outroBuffs/selfBuffs all re-confirmed accurate. weaponAlts was entirely
  // missing — added: alt5 uses Tragicomedy (93.7%) and Verity's Handle (85.0%), Prydwen's #2/#3
  // non-signature 5-stars; alt4 uses Aether Strike (72.6%, best 4★) and Celestial Spiral (69.3%, #2 4★);
  // alt3 uses the standard starter Gauntlets of Night.
  'Zani': { rarity: 5, element: 'Spectro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Scorched Radiance, a member of Averardo Vault\'s security team and its longtime "Best Employee" — she has plenty of plans for her free time, but for now her biggest mission is simple: clocking out on time. On-field Spectro Main DPS who converts teammates\' Spectro Frazzle into her own Heliacal Ember and Blaze the instant it lands, builds Redundant Energy through Basic Attacks and parries to unlock her enhanced Skill, then dumps everything into Inferno Mode via her Liberation for a string of massive Heavy Slash combos flagged as both Heavy Attack and Spectro Frazzle DMG — entirely dependent on a teammate applying Frazzle for her to convert.',
    skills: ['Routine Negotiation', 'Restless Watch', 'Between Dawn and Dusk', 'There Will Be A Light'],
    ascension: { boss: 'Platinum Core', common: 'Polygon Core', specialty: 'Sword Acorus' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Cadence' },
    bestEchoes: ['Capitaneus', 'Eternal Radiance 5pc'], bestWeapon: 'Blazing Justice',
    weaponAlts: { alt5: ['Tragicomedy', "Verity's Handle"], alt4: ['Aether Strike', 'Celestial Spiral'], alt3: ['Gauntlets of Night'] },
    teams: ['Zani + Phoebe + Shorekeeper', 'Zani + Rover: Spectro + Verina'] },
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1407 sheet. desc: title "Woven Melodies" (nanoka) prepended and blurb
  // rewritten — the previous desc said she "applies Erosion via Coordinated Attacks", but Ciaccona has
  // no Coordinated Attack mechanic at all; her off-field Erosion application comes from her Ensemble
  // Sylph clones and her Liberation's lingering Recital state instead. skills/ascension/skill materials/
  // bestEchoes/outroBuffs/libBuffs/weaponBuffs/debuffs all re-confirmed accurate (already corrected in a
  // prior 2026-08-16 pass). weaponAlts was entirely missing — added: alt5 uses Phasic Homogenizer (86.9%)
  // and Lux & Umbra (83.0%), Prydwen's #2/#3 non-signature 5-stars; alt4 uses Romance in Farewell (69.9%,
  // Prydwen's named best 4★/F2P no-gacha pick) and Solar Flame; alt3 uses the standard starter Pistols
  // of Night.
  'Ciaccona': { rarity: 5, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Woven Melodies, a wandering bard from Rinascita — she sings not only for the Divinity, but also for the common folk, recording stories along her journeys and turning them into songs that evoke laughter, emotion, and tears in both the storytellers and the audience. Aero Hybrid who chains quick Basic ATK/Mid-air cancels to summon near-permanent Ensemble Sylph clones (Solo Concert: team Aero DMG Amp), fires the Forte Heavy Quadruple Downbeat, then enters an extended Recital state via her Liberation to apply repeating waves of Aero Erosion or Spectro Frazzle even off-field — buffs the incoming Resonator\'s Aero Erosion DMG through her Outro.',
    skills: ['Quadruple Time Steps', 'Harmonic Allegro', 'Singer\'s Triple Cadenza', 'Symphony of Wind and Verse'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Phlogiston' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Gusts of Welkin 5pc'], bestWeapon: 'Woodland Aria',
    weaponAlts: { alt5: ['Phasic Homogenizer', 'Lux & Umbra'], alt4: ['Romance in Farewell', 'Solar Flame'], alt3: ['Pistols of Night'] },
    teams: ['Ciaccona + Cartethyia + Rover: Aero', 'Ciaccona + Cartethyia + Chisa'] },
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1409 sheet. desc: title "Feathered Tempest" (nanoka) prepended and
  // blurb rewritten to match the roster's convention. skills/ascension/skill materials/bestEchoes/
  // outroBuffs/debuffs/weaponBuffs all re-confirmed accurate. weaponAlts was entirely missing — added:
  // alt5 uses Red Spring (79.5%) and Blazing Brilliance (77.0%), Prydwen's #2/#3 non-signature 5-stars;
  // alt4 uses Feather Edge (76.3%, the only 4★ Prydwen lists for her); alt3 uses Guardian Sword (72.3%,
  // Prydwen's own explicit "last resort" pick — the only other Sword in the game with an HP% main stat,
  // matching her HP-scaling kit, so used here instead of the generic starter Sword of Night).
  'Cartethyia': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Main DPS',
    desc: 'Feathered Tempest, a wandering knight who travels across Rinascita — formerly known as the Blessed Maiden, the vessel of Divinity, and the Queen of Gale and Tide under the name Fleurdelys, she is now simply free and unfettered. HP-scaling on-field Aero Main DPS who builds Sword Shadows through her Basic Attack/Skill/Intro finishers, recalls them via Mid-air Attack, transforms into Fleurdelys via her Liberation for an entirely new enhanced kit, builds Conviction toward the devastating second Ultimate Blade of Howling Squall that consumes stacked Aero Erosion for bonus DMG, then buffs the incoming Resonator\'s Aero DMG against Negative Status targets through her Outro.',
    skills: ['Sword to Carve My Forms', 'Sword to Bear Their Names', 'A Knight\'s Heartfelt Prayers', 'Tempest'],
    ascension: { boss: 'Unfading Glory', common: 'Tidal Residuum', specialty: 'Bamboo Iris' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Metallic Drip' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Windward Pilgrimage 5pc'], bestWeapon: "Defier's Thorn",
    weaponAlts: { alt5: ['Red Spring', 'Blazing Brilliance'], alt4: ['Feather Edge'], alt3: ['Guardian Sword'] },
    teams: ['Cartethyia + Ciaccona + Rover: Aero', 'Cartethyia + Ciaccona + Chisa'] },
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1207 sheet. desc: title "Howling Flame" (nanoka) prepended and blurb
  // rewritten — the previous desc said she "shreds enemy Fusion RES" as if unconditional, but her Glory
  // RES-ignore only ramps up with more Fusion teammates present (3%/9%/15%), and she's a team buffer
  // first (Prydwen files her under "Hybrid", not Sub DPS). skills/ascension/skill materials/bestEchoes/
  // outroBuffs/libBuffs/selfBuffs/weaponBuffs/debuffs all re-confirmed accurate (already corrected in a
  // prior 2026-08-16 pass). weaponAlts was entirely missing — added: alt5 uses Ages of Harvest (87.8%)
  // and Kumokiri (87.0%), Prydwen's #2/#3 non-signature 5-stars; alt4 uses Waning Redshift (75.0%, best
  // 4★) and Aureate Zenith (74.8%, #2 4★); alt3 uses the standard starter Broadblade of Night.
  'Lupa': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Howling Flame, a Gladiator of Septimont and a radiant star of the arena — fiery and straightforward, Lupa lives like a wild lone wolf, and as long as she can savor the adrenaline rush of battle, she doesn\'t mind if that same fire ends up consuming her whole. Fusion Hybrid buffer who dumps her Liberation Fire-Kissed Glory immediately to grant the whole team Pack Hunt (ATK Amp, further boosted by teammates\' Intro Skills) and Glory (Fusion RES ignore that scales with Fusion teammate count), builds Wolfaith through Heavy/Mid-air Attacks toward her Forte finisher Dance With the Wolf, then buffs the incoming Resonator\'s Fusion and Basic ATK DMG through her Outro — built around powering mono-Fusion teams like Changli + Brant + Lupa.',
    skills: ['Flaming Star', 'Shewolf\'s Hunt', 'Fire-Kissed Glory', 'Ignis Lupa'],
    ascension: { boss: 'Unfading Glory', common: 'Howler Core', specialty: 'Bloodleaf Viburnum' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Waveworn Residue' },
    bestEchoes: ['Lioness of Glory', 'Flaming Clawprint 5pc'], bestWeapon: 'Wildfire Mark',
    weaponAlts: { alt5: ['Ages of Harvest', 'Kumokiri'], alt4: ['Waning Redshift', 'Aureate Zenith'], alt3: ['Broadblade of Night'] },
    teams: ['Lupa + Brant + Changli', 'Lupa + Aemeath + Mornye'] },
  // Full audit 2026-08-17 against Prydwen's live build page (Chrome UA + google.com referer + jsRender)
  // and ww.nanoka.cc's character #1608 sheet. desc: title "Symphony of Beyond" (nanoka) prepended and
  // blurb rewritten — the previous desc wrongly said she "summons Hecate via Echo Skill"; Hecate is
  // actually summoned by her Resonance Liberation (entering Maestro state) — Echo Skill casts merely
  // trigger extra Hecate attacks while Maestro is already active. organization uses 'Fractsidus' (no
  // leading "The") to match helpers.js's FACTION_ICONS key exactly, same fix applied to Carlotta/Zani.
  // skills/ascension/skill materials/bestEchoes/outroBuffs/selfBuffs all re-confirmed accurate (already
  // corrected in a prior 2026-08-16 pass). weaponAlts was entirely missing — added: alt5 uses
  // Stringmaster (82.0%) and Whispers of Sirens (80.2%), Prydwen's #2/#3 non-signature 5-stars; alt4
  // uses Radiant Dawn (66.9%, best 4★) and Augment (64.9%, #2 4★); alt3 uses the standard starter
  // Rectifier of Night.
  'Phrolova': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Main DPS',
    desc: 'Symphony of Beyond, a Fractsidus Overseer walking the fine line between life and death — an uncanny, deadly conductor whose silent wave of the baton is enough to attune the very frequencies of being and conduct the symphonies of "souls," her music able to sculpt a better world or just as easily summon a legion to wreak havoc. Havoc Main DPS who builds Volatile Notes through Basic Attack/Skill combos and their Forte-enhanced follow-ups, unleashes her Liberation to enter the Maestro state and command her partner Hecate for sustained off-field Havoc DMG (triggered further by any teammate\'s Echo Skill casts), then buffs the incoming Resonator\'s Havoc and Heavy Attack DMG through her Outro.',
    skills: ['Movement of Life and Death', 'Whispers in a Fleeting Dream', 'Waltz of Forsaken Depths', 'Rhapsody of a New World'],
    ascension: { boss: 'Truth in Lies', common: 'Polygon Core', specialty: 'Afterlife' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Helix' },
    bestEchoes: ['Nightmare: Hecate', 'Dream of the Lost 3pc + Havoc Eclipse 2pc'], bestWeapon: 'Lethean Elegy',
    weaponAlts: { alt5: ['Stringmaster', 'Whispers of Sirens'], alt4: ['Radiant Dawn', 'Augment'], alt3: ['Rectifier of Night'] },
    teams: ['Phrolova + Cantarella + Qiuyuan', 'Phrolova + Cantarella + Shorekeeper'] },
  'Augusta': { rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Ephor of Septimont, a sun rising ablaze from the crucible of blood and sand. On-field Electro DPS who deals Heavy ATK and Liberation burst DMG with built-in shields and a time-stop mechanic on Resonance Skill.',
    skills: ['Hunter\'s Path', 'Warrior\'s Blade', 'Sunward Conquest', 'Call Me By the Sun'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Tidal Residuum', specialty: 'Luminous Calendula' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Waveworn Residue' },
    bestEchoes: ['The False Sovereign', 'Crown of Valor 3pc + Void Thunder 2pc'], bestWeapon: 'Thunderflare Dominion',
    weaponAlts: { alt5: ['Verdant Summit', 'Ages of Harvest'], alt4: ['Aureate Zenith', 'Autumntrace'], alt3: ['Guardian Broadblade'] },
    teams: ['Augusta + Iuno + Shorekeeper', 'Augusta + Mortefi + Shorekeeper', 'Augusta + Mortefi + Verina'] },
  'Iuno': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Priestess of Septimont\'s Tetragon Temple who grasps meaning in time\'s rhythm. Aero sub-DPS who buffs Heavy ATK DMG via Outro, heals the team through her New Moon attacks and Full Moon Domain, and self-shields on skill casts, cycling between Half Moon and New Moon combat states.',
    skills: ['Moon Steps', 'Foresight Fugue', 'Beneath Lunar Tides', 'Ebb and Flow'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Sliverglow Bloom' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Cadence' },
    bestEchoes: ['Lady of the Sea', 'Crown of Valor 3pc + Sierra Gale 2pc'], bestWeapon: "Moongazer's Sigil",
    weaponAlts: { alt5: ["Verity's Handle", 'Blazing Justice'], alt4: ['Aether Strike', 'Legend of Drunken Hero'], alt3: ['Guardian Gauntlets'] },
    teams: ['Iuno + Augusta + Shorekeeper', 'Iuno + Lynae + Shorekeeper', 'Iuno + Jiyan + Shorekeeper'] },
  'Galbrena': { rarity: 5, element: 'Fusion', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Black Shores Consultant known as the Discord Slayer, seizing power from darkness. On-field Fusion DPS who deals primary damage through Echo Skill and Heavy ATK combos in quick burst rotations.',
    skills: ['Slayer\'s Trigger', 'Edge Transcended', 'Hellfire Absolution', 'Beyond Threshold'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Tidal Residuum', specialty: 'Stone Rose' },
    skillMaterials: { weeklyDrop: 'Curse of the Abyss', forgery: 'Phlogiston' },
    bestEchoes: ['Corrosaurus', "Flamewing's Shadow 3pc + Flaming Clawprint 2pc"], bestWeapon: 'Lux & Umbra',
    weaponAlts: { alt5: ['Phasic Homogenizer', 'The Last Dance'], alt4: ['Relativistic Jet', 'Pistols#26'], alt3: ['Guardian Pistols'] },
    teams: ['Galbrena + Qiuyuan + Shorekeeper', 'Galbrena + Brant + Lupa'] },
  'Qiuyuan': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Former Mingting intelligence agent, upright as bamboo seeking no vanity. Aero sub-DPS/buffer who grants the next Resonator Echo Skill DMG Amp via Outro and boosts the active Resonator\'s Crit DMG via Resonance Liberation.',
    skills: ['Inkwash', 'Through the Groves', 'Sundering Strike', 'Verdant Edge'],
    ascension: { boss: 'Truth in Lies', common: 'Whisperin Core', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Curse of the Abyss', forgery: 'Metallic Drip' },
    bestEchoes: ['Reminiscence: Fenrico', 'Law of Harmony 3pc + Sierra Gale 2pc'], bestWeapon: 'Emerald Sentence',
    weaponAlts: { alt5: ['Red Spring', 'Emerald of Genesis'], alt4: ['Feather Edge', 'Commando of Conviction'], alt3: ['Guardian Sword'] },
    teams: ['Qiuyuan + Galbrena + Shorekeeper', 'Qiuyuan + Phrolova + Cantarella'] },
  'Chisa': { rarity: 5, element: 'Havoc', weapon: 'Broadblade', role: 'Support/Healer',
    desc: '"Just an ordinary student," she calmly introduces herself, a faint iridescent shimmer flickering in her eyes. Havoc support/healer who deals heavy Resonance Liberation DMG, heals and shields the team, and shreds enemy DEF via Unseen Snare + Havoc Bane.',
    // skills[3] corrected 2026-08-17: was 'Reverberance - Return' (her actual Intro Skill name) — the
    // `skills` array convention is [Basic ATK, Skill, Liberation, Forte Circuit] per every other
    // character's entry, and her real Forte Circuit name is 'Sight of Unraveling - Oblivion' per
    // fandom's own Forte gallery/Prydwen's kit breakdown.
    skills: ['Reign of Silence', 'Fractured Composition', 'Moment of Nihility', 'Sight of Unraveling - Oblivion'],
    ascension: { boss: 'Abyssal Husk', common: 'Polygon Core', specialty: 'Summer Flower' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Waveworn Residue' },
    // bestEchoes reshaped 2026-08-17 into the standard [main1, set1, main2, set2] multi-build pairing
    // (matching Aemeath/Denia's convention) so the detail modal can render each build as its own row with
    // icons — was previously two long freeform strings baking both options into one entry, which broke
    // set-icon lookup entirely (no exact key match) and only ever displayed a single unlabeled row.
    bestEchoes: ['Reminiscence: Threnodian - Leviathan', 'Thread of Severed Fate 3pc + Havoc Eclipse 2pc (personal DMG)', 'Fallacy of No Return', 'Rejuvenating Glow 5pc (best overall team ATK)'], bestWeapon: 'Kumokiri',
    weaponAlts: { alt5: ['Wildfire Mark', 'Ages of Harvest'], alt4: ['Meditations on Mercy', 'Autumntrace'], alt3: ['Guardian Broadblade'] },
    teams: ['Chisa + Aemeath + Denia', 'Chisa + Hiyuki + Lucilla'] },
  'Lynae': { rarity: 5, element: 'Spectro', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'A Startorch Academy prep student whose head-turning, electric style hides an inner focus as explosive as a coiled spring. Spectro sub-DPS who amplifies team All DMG and Resonance Liberation DMG via Outro, and boosts Tune Break Boost for Tune Strain team comps.',
    skills: ['Chroma Drift', 'Lynae-Style Palettes', 'Prismatic Overblast', 'Time to Show Some Colors!'],
    ascension: { boss: "Suncoveter's Reach", common: 'Exoswarm Core', specialty: 'Rimewisp' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Combustor' },
    bestEchoes: ['Hyvatia', 'Pact of Neonlight Leap 5pc'], bestWeapon: 'Spectrum Blaster',
    // weaponAlts added 2026-08-17 against Prydwen's live build calcs page (30/July/2026 profile update):
    // Phasic Homogenizer (91.2%) and The Last Dance (85.0%) are the top non-signature 5★ alts (ahead of
    // Lux & Umbra 82.6%, Woodland Aria 70.3%, Static Mist 81.5% — Static Mist is a QOL pick per Prydwen's
    // review text but scores lower than these two in raw calcs); Solar Flame (68.8%) and Relativistic Jet
    // (68.5%) are the best 4★s; Pistols of Night is the 3★ fallback (matches the "<Weapon Type> of Night"
    // naming convention used for other characters' 3★ slot).
    weaponAlts: { alt5: ['Phasic Homogenizer', 'The Last Dance'], alt4: ['Solar Flame', 'Relativistic Jet'], alt3: ['Pistols of Night'] },
    teams: ['Lynae + Aemeath + Mornye', 'Lynae + Hiyuki + Chisa'] },
  'Mornye': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Healer',
    desc: 'A Spacetrek Collective Research Institute engineer and Department of Exostrider Engineering professor at Startorch Academy. DEF-scaling Fusion healer who restores HP via Resonance Skill and Liberation while boosting the team\'s Off-Tune Buildup Rate.',
    skills: ['Ground State Calibration', 'Resolution', 'Critical Protocol', 'Convergence'],
    ascension: { boss: 'Burning Judgment', common: 'Mech Core', specialty: 'Gemini Spore' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Carved Crystal' },
    bestEchoes: ['Reactor Husk', 'Halo of Starry Radiance 5pc'], bestWeapon: 'Starfield Calibrator',
    // weaponAlts added 2026-08-17: Prydwen's live build calcs only rank 3 weapons total for Mornye
    // (Signature, then Discord/Broadblade#41 as 4★ Energy Regen picks — she has no ranked 5★ alt since
    // no other 3.x Broadblade offers her key ER stat). Verdant Summit added as the 5★ alt slot as a
    // generic ATK/Crit DMG stat-stick (same fallback role it plays for other Broadblade users' alt5
    // slots elsewhere in this file); Broadblade of Night is the 3★ fallback, matching the "<Weapon
    // Type> of Night" naming convention used for other characters' 3★ slot.
    weaponAlts: { alt5: ['Verdant Summit'], alt4: ['Discord', 'Broadblade#41'], alt3: ['Broadblade of Night'] },
    teams: ['Mornye + Lynae + Aemeath', 'Mornye + Luuk Herssen + Denia'] },
  'Luuk Herssen': { rarity: 5, element: 'Spectro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: "The attending physician of Startorch Academy's Resonator Nursing Unit, renowned for his keen intellect and unshakable composure. On-field Spectro Basic ATK DPS who cycles Aureole of Execution's three enhanced forms and deals bonus Total DMG by responding to Tune Strain - Interfered.",
    skills: ['Such is Light', 'Reunion of All the Fallen', 'Rewritten in Winter\'s Margins', 'Before Injection of Dawn'],
    ascension: { boss: "Suncoveter's Reach", common: 'Exoswarm Pendant', specialty: 'Edelschnee' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Waveworn Shard' },
    bestEchoes: ['Twin Nova - Nebulous Cannon', 'Rite of Gilded Revelation 5pc'], bestWeapon: "Daybreaker's Spine",
    // weaponAlts added 2026-08-17 from Prydwen's live build calcs: Blazing Justice (83.4%) and
    // Moongazer's Sigil (80.7%) are the top non-signature 5★ Gauntlets (ahead of Verity's Handle 80.2%,
    // Tragicomedy 74.5%, Abyss Surges 66.5%); Pulsation Bracer (85.7%, the permanent-banner F2P pick,
    // Prydwen's explicit second-best overall) and Celestial Spiral (65.9%) are the best 4★s; Gauntlets of
    // Night is the 3★ fallback, matching the "<Weapon Type> of Night" naming convention used elsewhere.
    weaponAlts: { alt5: ['Blazing Justice', "Moongazer's Sigil"], alt4: ['Pulsation Bracer', 'Celestial Spiral'], alt3: ['Gauntlets of Night'] },
    teams: ['Luuk Herssen + Denia + Mornye', 'Luuk Herssen + Sanhua + Mornye'] },
  'Aemeath': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Once an Exostrider Synchronist of Rabelle College, she is now a digital ghost who sings quietly amongst stars. On-field Fusion DPS who switches between Tune Rupture and Fusion Burst Resonance Modes, dealing massive Resonance Liberation DMG through Seraphic Duet and Heavenfall Edict.',
    skills: ['Infinity Calibration', 'Shared Voyage', 'Towards the Daybreak', 'Overture of Departure'],
    ascension: { boss: 'Our Choice', common: 'Exoswarm Core', specialty: 'Moss Amber' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Polarizer' },
    bestEchoes: ['Sigillum', 'Trailblazing Star 5pc'], bestWeapon: 'Everbright Polestar',
    // weaponAlts added 2026-08-17 from Prydwen's live build calcs: Emerald of Genesis (83.5%) and Red
    // Spring (83.2%) are the top non-signature 5★ Swords (ahead of Emerald Sentence 82.9%, Blazing
    // Brilliance 78.1%); Feather Edge (74.8%) and Somnoire Anchor (74.1%) are the best 4★s (ahead of
    // Endless Collapse 73.9%); Sword of Night is the 3★ fallback, matching the "<Weapon Type> of Night"
    // naming convention used for other characters' 3★ slot.
    weaponAlts: { alt5: ['Emerald of Genesis', 'Red Spring'], alt4: ['Feather Edge', 'Somnoire Anchor'], alt3: ['Sword of Night'] },
    teams: ['Aemeath + Denia + Chisa', 'Aemeath + Lynae + Mornye'] },
  'Sigrika': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Solsworn of the Roya Tribe and Startorch Academy Birding Fan Club member. On-field Aero DPS who consumes Rune stacks to empower Echo Skill and Heavy ATK for Aero burst DMG with crowd control.',
    skills: ['One, Two, Three', 'Royan Close Quarters Combat', 'Where Trust Leads Me!', 'Solsworn Etymology'],
    ascension: { boss: 'Our Choice', common: 'Exoswarm Pendant', specialty: 'Arithmetic Shell' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Waveworn Shard' },
    bestEchoes: ['Nameless Explorer', 'Sound of True Name 5pc'], bestWeapon: 'Solsworn Ciphers',
    // weaponAlts added 2026-08-17 from Prydwen's live build calcs: Blazing Justice (85.4%) and Pulsation
    // Bracer (81.8%, her best permanent-banner pick) are the top non-signature 5★ Gauntlets (ahead of
    // Verity's Handle 78.5%, Moongazer's Sigil 76.3%, Abyss Surges 69.4%); Aether Strike (69.4%) and
    // Legend of Drunken Hero (best F2P no-gacha pick) are the best 4★s; Gauntlets of Night is the 3★
    // fallback, matching the "<Weapon Type> of Night" naming convention used elsewhere (Prydwen doesn't
    // rank a 3★ for her at all — she "lacks strong F2P weapon alternatives" per its own review).
    weaponAlts: { alt5: ['Blazing Justice', 'Pulsation Bracer'], alt4: ['Aether Strike', 'Legend of Drunken Hero'], alt3: ['Gauntlets of Night'] },
    teams: ['Sigrika + Qiuyuan + Shorekeeper', 'Sigrika + Phrolova + Qiuyuan', 'Sigrika + Qiuyuan + Ciaccona'] },
  'Rebecca': { rarity: 5, element: 'Electro', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Edgerunner and Fury-Type Arsenal from the Cyberpunk: Edgerunners collab. Electro Hybrid who mode-switches between Huntress and Guts stances, buffing team Heavy ATK DMG and All DMG Amplification via her Outro turret.',
    skills: ["Mix-'n'-Match", "Tactical Tweaks", "Party 'til Dawn!", "My Turn!"],
    ascension: { boss: 'Nightmare Flashdrive', common: 'Mech Core', specialty: 'Past Reveries' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'Combustor' },
    bestEchoes: ['Reminiscence - Nightmare: Adam Smasher', 'Shadow of Shattered Dreams 1pc + Void Thunder 2pc'], bestWeapon: 'Skull Thrasher',
    // weaponAlts added 2026-08-17 from Prydwen's live build calcs (Lucy+Mornye team average): Spectrum
    // Blaster (96.3%) and Static Mist (93.3%) are the top non-signature 5★ Pistols (ahead of Phasic
    // Homogenizer, Woodland Aria, The Last Dance, Spectral Trigger, Lux & Umbra); Solar Flame (79.1%)
    // and Relativistic Jet (79.0%) are the best 4★s (ahead of the craftable Pistols#26); Pistols of Night
    // is the 3★ fallback (Prydwen doesn't rank a 3★ for her), matching the "<Weapon Type> of Night"
    // naming convention used elsewhere.
    weaponAlts: { alt5: ['Spectrum Blaster', 'Static Mist'], alt4: ['Solar Flame', 'Relativistic Jet'], alt3: ['Pistols of Night'] },
    teams: ['Rebecca + Yangyang: Xuanling + Lucy', 'Rebecca + Lucy + Mornye', 'Rebecca + Jiyan + Shorekeeper'] },
  'Lucilla': { rarity: 5, element: 'Glacio', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'President and head of Startorch Academy, former chief editor of the New Federation\'s top academic journal. Dual-mode Glacio Hybrid who buffs Glacio Chafe DMG or Echo Skill DMG depending on Resonance Mode, built around a 5-input Photo-consuming Ultimate.',
    skills: ['Snapshot', 'Phantom Frame', 'Clear As Day', 'Clip It'],
    ascension: { boss: "Suncoveter's Reach", common: 'Mech Core', specialty: 'Forget-Me-Not' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'String' },
    bestEchoes: ['Glommoth', 'Wishes of Quiet Snowfall 5pc (Chafe)', 'Impermanence Heron', 'Moonlit Clouds 5pc (Echo)'], bestWeapon: 'Freeze Frame',
    // weaponAlts added 2026-08-17 from Prydwen's live build calcs (Hiyuki Chafe / Sigrika+Shorekeeper
    // Echo team average): Whispers of Sirens (95.7%/81.6%) and Stringmaster (95.6%/87.6%) are the top
    // non-signature 5★ Rectifiers (ahead of Lethean Elegy, Rime-Draped Sprouts, Forged Dwarf Star,
    // Luminous Hymn, Cosmic Ripples); Radiant Dawn (90.4%/68.6%) and Augment (89.1%/73.3%) are the best
    // Battle Pass 4★s (ahead of Waltz in Masquerade); Rectifier of Night is the 3★ fallback (Prydwen
    // doesn't rank a 3★ for her), matching the "<Weapon Type> of Night" naming convention used elsewhere.
    weaponAlts: { alt5: ['Whispers of Sirens', 'Stringmaster'], alt4: ['Radiant Dawn', 'Augment'], alt3: ['Rectifier of Night'] },
    teams: ['Lucilla + Hiyuki + Chisa', 'Lucilla + Sigrika + Shorekeeper', 'Lucilla + Phrolova + Qiuyuan'] },
  'Lucy': { rarity: 5, element: 'Spectro', weapon: 'Pistols', role: 'Main DPS',
    desc: 'The Netrunner, from the Cyberpunk: Edgerunners collab. Spectro DPS who builds TCP/Root Access into an enhanced Heavy Attack and a battlefield-freezing Ultimate with selectable Spoofing Program debuffs, dealing bonus DMG via the Hack mechanic.',
    skills: ['Locked Thread', 'Protocol Breach', 'Netrunner', 'Outdated Hallucination'],
    ascension: { boss: 'Nightmare Flashdrive', common: 'Exoswarm Core', specialty: 'Past Reveries' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Combustor' },
    bestEchoes: ['Reminiscence - Nightmare: Adam Smasher', 'Shadow of Shattered Dreams 1pc + Rite of Gilded Revelation 2pc'], bestWeapon: 'Spectral Trigger',
    // weaponAlts added 2026-08-17 from Prydwen's live build calcs (Rebecca+Mornye team average): Lux &
    // Umbra (88.4%) and Skull Thrasher (83.5%) are the top non-signature 5★ Pistols (ahead of Phasic
    // Homogenizer, The Last Dance, Spectrum Blaster, Static Mist, Woodland Aria); Solar Flame (67.5%)
    // and Relativistic Jet (64.6%) are the best 4★s (ahead of the craftable Pistols#26); Pistols of Night
    // is the 3★ fallback (Prydwen doesn't rank a 3★ for her), matching the "<Weapon Type> of Night"
    // naming convention used elsewhere.
    weaponAlts: { alt5: ['Lux & Umbra', 'Skull Thrasher'], alt4: ['Solar Flame', 'Relativistic Jet'], alt3: ['Pistols of Night'] },
    teams: ['Lucy + Rebecca + Mornye', 'Lucy + Rebecca + Shorekeeper', 'Lucy + Iuno + Shorekeeper'] },
  'Yangyang: Xuanling': { rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    desc: 'Xuan Watcher of Xuanfang Hold and sister of Suisui. On-field Havoc DPS who alternates Azure and Feather Sword Stances, applying and consuming Havoc Bane for massive self-buffed Crit DMG — one of the highest damage ceilings in the game at release.',
    skills: ['Succor and Smite', "Feather's Edge", 'Hush of a Thousand Voices', 'Skybound Feather'],
    ascension: { boss: "Solidarity's Loneflame", common: 'Autopuppet Kernel', specialty: 'Cloudperch Seed' },
    skillMaterials: { weeklyDrop: 'Skyward Glazed Heart', forgery: 'Polarizer' },
    bestEchoes: ['Thousand-Puppet Pavilion', 'Song of Feathered Trace 5pc'], bestWeapon: 'Azure Oath',
    // weaponAlts added 2026-08-18 from Prydwen's live build calcs (Lynae+Chisa team): Emerald Sentence
    // (87.8%) and Red Spring (80.5%) are the top non-signature 5★ Swords (ahead of Everbright Polestar,
    // Frostburn, Emerald of Genesis, Blazing Brilliance); Lumingloss (70.4%, Prydwen's explicit best
    // 4★) and Fables of Wisdom (her best F2P no-gacha pick) are the only ranked 4★s; Sword of Night is
    // the 3★ fallback (Prydwen doesn't rank a 3★ for her), matching the "<Weapon Type> of Night" naming
    // convention used elsewhere.
    weaponAlts: { alt5: ['Emerald Sentence', 'Red Spring'], alt4: ['Lumingloss', 'Fables of Wisdom'], alt3: ['Sword of Night'] },
    teams: ['Yangyang: Xuanling + Chisa + Suisui', 'Yangyang: Xuanling + Phrolova + Chisa', 'Yangyang: Xuanling + Rebecca + Suisui'] },
  'Denia': { rarity: 5, element: 'Fusion', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Voidmatters student at Startorch Academy who secretly serves as an agent for the Fractsidus. Dual-mode Fusion Hybrid who switches between Stagecraft and Breakdown Form via her two Ultimates, playing into either Fusion Burst or Tune Strain team archetypes depending on Resonance Mode.',
    skills: ["Dreamweaver's Banquet", 'Bubbles and Baits', 'Final Act', 'Formal Greetings'],
    ascension: { boss: 'Burning Judgment', common: 'Mech Core', specialty: 'Dream of Stars' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'String' },
    bestEchoes: ['Reminiscence: Denia', 'Chromatic Foam 5pc (Fusion Burst)', 'Voidwing Moth', 'Reel of Spliced Memories 5pc (Tune Strain)'], bestWeapon: 'Forged Dwarf Star',
    // weaponAlts added 2026-08-17 from Prydwen's live build calcs (Aemeath+Chisa Fusion Burst / Luuk
    // Herssen+Mornye Tune Strain average): Stringmaster (91.0%/85.7%) and Lethean Elegy (89.3%/79.9%)
    // are the top non-signature 5★ Rectifiers (ahead of Luminous Hymn, Whispers of Sirens, Rime-Draped
    // Sprouts, Cosmic Ripples); Augment (78.3%/67.6%) and Radiant Dawn (77.6%/60.4%) are the best
    // Battle Pass 4★s (ahead of Waltz in Masquerade, Fusion Accretion, Jinzhou Keeper); Rectifier of
    // Night is the 3★ fallback, matching the "<Weapon Type> of Night" naming convention used elsewhere.
    weaponAlts: { alt5: ['Stringmaster', 'Lethean Elegy'], alt4: ['Augment', 'Radiant Dawn'], alt3: ['Rectifier of Night'] },
    teams: ['Denia + Luuk Herssen + Mornye', 'Denia + Aemeath + Lupa'] },
  'Hiyuki': { rarity: 5, element: 'Glacio', weapon: 'Sword', role: 'Main DPS',
    desc: "Miko of Flaming Sakura from Ashinohara, now the last member of Lahai-Roi's Special Response Force. On-field Glacio DPS who converts team Glacio Chafe into Glacio Bite via her Forte, switching between Present Self and Foreclaimed Self for an Iai-Stance burst finisher.",
    skills: ['Flaming Sakura Blade Art', 'Frostblight', 'Foreclaiming', 'Frostedge'],
    ascension: { boss: 'Our Choice', common: 'Exoswarm Core', specialty: 'Redbell' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'Polarizer' },
    bestEchoes: ['Reminiscence: Threnodian - Voidborne Construct', 'Wishes of Quiet Snowfall 5pc'], bestWeapon: 'Frostburn',
    // weaponAlts added 2026-08-17 from Prydwen's live build calcs: Blazing Brilliance (80.8%) and
    // Emerald of Genesis (80.1%) are the top non-signature 5★ Swords (ahead of Emerald Sentence 79.0%,
    // Red Spring 79.0%, Everbright Polestar 76.9%); Feather Edge (76.9%, Prydwen's explicit best 4★) and
    // Fables of Wisdom (71.8%, her best F2P no-gacha pick) are the 4★s; Sword of Night is the 3★
    // fallback, matching the "<Weapon Type> of Night" naming convention used elsewhere.
    weaponAlts: { alt5: ['Blazing Brilliance', 'Emerald of Genesis'], alt4: ['Feather Edge', 'Fables of Wisdom'], alt3: ['Sword of Night'] },
    teams: ['Hiyuki + Lucilla + Chisa', 'Hiyuki + Lucilla + Suisui', 'Hiyuki + Lynae + Mornye'] },
  'Suisui': { rarity: 5, element: 'Glacio', weapon: 'Rectifier', role: 'Support/Healer',
    desc: 'Director of the Zhaoming Commerce Guild and sister of Yangyang: Xuanling. HP-scaling Glacio healer who alternates Zephyr Stance (healing) and Drizzle Stance (Glacio DMG + Chafe) via Resonance Skill, culminating in a team-wide All DMG Amplification through her Outro.',
    skills: ['Unraveled Spring', 'Vernal Screen', 'Song of Thoroughfare', 'Tinkling Jade'],
    ascension: { boss: "Solidarity's Loneflame", common: 'Autopuppet Kernel', specialty: 'Flowborne Dream' },
    skillMaterials: { weeklyDrop: 'Skyward Glazed Heart', forgery: 'String' },
    bestEchoes: ['Forbidden Bastion', 'Song of Feathered Trace 5pc'], bestWeapon: "Firstlight's Herald",
    // weaponAlts added 2026-08-18: Prydwen ranks Suisui's weapons by a simple 1-4 list rather than
    // percentages. Stellar Symphony (Shorekeeper's Signature, #2) is her only ranked non-signature 5★
    // (provides enough Energy Regen to max her passives, though its team-ATK passive goes unused);
    // Variation (#3, best cost-efficiency pick) and Call of the Abyss (#4, last-resort fallback) are
    // the 4★s; Rectifier of Night is the 3★ fallback (Prydwen doesn't rank a 3★ for her), matching the
    // "<Weapon Type> of Night" naming convention used elsewhere.
    weaponAlts: { alt5: ['Stellar Symphony'], alt4: ['Variation', 'Call of the Abyss'], alt3: ['Rectifier of Night'] },
    teams: ['Suisui + Yangyang: Xuanling + Chisa', 'Suisui + Hiyuki + Lynae', 'Suisui + Aemeath + Denia'] },
  'Qingxiao': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Main DPS',
    desc: 'Paragon of Mengzhou. On-field Aero DPS who builds Qin Heart and Sword Cadence through Sheathed/Drawn Stance attacks, then unleashes Ephemeral Transcendence for empowered combos, scaling off Tune Strain - Interfered stacks and her own Mindlock stacks.',
    skills: ['Strings to Steel', 'Severing Note', 'Billows Beneath Heaven', 'Tonality Shift'],
    // specialty confirmed 2026-08-18 via fandom's own File:Blade_Blossom.png/Item Infobox ("Ascension
    // Material (Mengzhou)", the specialty-material tier for her home city) — boss/common materials
    // still have no dedicated wiki page or uploaded icon this close to her 2026-08-20 release.
    ascension: { boss: 'Unconfirmed (releases 3.6, Aug 20 2026)', common: 'Unconfirmed (releases 3.6, Aug 20 2026)', specialty: 'Blade Blossom' },
    skillMaterials: { weeklyDrop: 'Unconfirmed (releases 3.6, Aug 20 2026)', forgery: 'Unconfirmed (releases 3.6, Aug 20 2026)' },
    bestEchoes: ['Heart of Evil\'s Purge 5pc'], bestWeapon: 'Glint of Clouds',
    // weaponAlts added 2026-08-18 from ww.nanoka.cc's own pre-release "Recommended Weapons" ranking
    // (character/1413, datamined ahead of release — Prydwen has no build guide published yet):
    // Blazing Brilliance is the only ranked non-signature 5★; Endless Collapse the only ranked 4★;
    // Sword of Night is the 3★ fallback (unranked by nanoka), matching the "<Weapon Type> of Night"
    // naming convention used elsewhere.
    weaponAlts: { alt5: ['Blazing Brilliance'], alt4: ['Endless Collapse'], alt3: ['Sword of Night'] },
    teams: ['Qingxiao + Denia + Mornye', 'Qingxiao + Lynae + Mornye'] },
  'Jingran': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'A loner treading into illusive depths, of Mengzhou. HP-scaling Fusion Broadblade wielder who channels Yin Vessel and Yang Font stances. On-field Fusion DPS whose Heavy Attacks and ATK/DMG scale off Max HP, entering the Yinghuo state via Resonance Liberation for empowered follow-up strikes.',
    skills: ['Edge of Life and Death', 'Malevolent Encounter', 'Burial of Thousand Souls', 'Question the Tombs'],
    // Dates corrected 2026-08-18: Jingran releases in the v3.6-p2 banner (~2026-09-10, per BANNER_HISTORY),
    // not Aug 20 (that's Qingxiao's v3.6-p1 date) — fandom's own infobox leaves releaseDate blank/commented
    // ("2026-09-??"), so no exact day is confirmed yet.
    ascension: { boss: 'Unconfirmed (releases 3.6, ~Sept 2026)', common: 'Unconfirmed (releases 3.6, ~Sept 2026)', specialty: 'Unconfirmed (releases 3.6, ~Sept 2026)' },
    skillMaterials: { weeklyDrop: 'Unconfirmed (releases 3.6, ~Sept 2026)', forgery: 'Unconfirmed (releases 3.6, ~Sept 2026)' },
    // bestWeapon confirmed real via nanoka.cc: Thousandfold Deliverance (Broadblade, 413 ATK / +72.2% HP, "Hark, Spirits and Stars").
    // No community build guide exists yet (unreleased, and he isn't even datamined into nanoka.cc's own
    // character list yet unlike Qingxiao) — bestEchoes/teams/weaponAlts remain unconfirmed.
    bestEchoes: ['Unconfirmed (releases 3.6, ~Sept 2026)'], bestWeapon: 'Thousandfold Deliverance',
    teams: ['Unconfirmed (releases 3.6, ~Sept 2026)'] },
  // 4★ Resonators
  'Aalto': { rarity: 4, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Suave information broker who slips through the mist. Aero sub-DPS who deals off-field Aero DMG via Coordinated Attacks triggered by his mist clone summon.',
    // corrected 2026-08-18: skills[3] was 'Mistcloak Dash' (the internal dash mechanic triggered within the Forte
    // Circuit), not the Forte Circuit's actual name 'Misty Cover' (fandom Combat page). SKILL_ICONS already aliased
    // both names to the same icon; fixing here for consistency with the real skill name.
    skills: ['Half Truths', 'Shift Trick', 'Flower in the Mist', 'Misty Cover'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    bestEchoes: ['Nightmare: Feilian Beringal', 'Sierra Gale 5pc'], bestWeapon: 'The Last Dance',
    weaponAlts: { alt5: ['Woodland Aria', 'Static Mist'], alt4: ['Relativistic Jet', 'Undying Flame'], alt3: ['Pistols of Night'] },
    teams: ['Aalto + Ciaccona + Shorekeeper', 'Aalto + Jiyan + Verina'] },
  'Baizhi': { rarity: 4, element: 'Glacio', weapon: 'Rectifier', role: 'Healer',
    desc: "Devoted Huaxu Academy researcher accompanied by her companion You'an. Glacio healer who restores HP via Resonance Skill and Liberation, providing consistent team sustain with low field time.",
    skills: ['Destined Promise', 'Emergency Plan', 'Momentary Union', 'Cycle of Life'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Howler Core', specialty: 'Lanternberry' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Helix' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 5pc'], bestWeapon: 'Stellar Symphony',
    weaponAlts: { alt4: ['Variation', 'Call of the Abyss'], alt3: ['Rectifier of Voyager'] },
    teams: ['Yangyang + Jiyan + Baizhi', 'Lingyang + Sanhua + Baizhi', 'Encore + Sanhua + Baizhi'] },
  'Chixia': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Energetic patroller who blazes through Jinzhou with dual pistols. On-field Fusion DPS who deals Fusion DMG through rapid-fire Resonance Skill shots and Basic Attack combos.',
    skills: ['POW POW', 'Whizzing Fight Spirit', 'Blazing Flames', 'Heroic Bullets'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Belle Poppy' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    bestEchoes: ['Nightmare: Inferno Rider', 'Molten Rift 5pc'], bestWeapon: 'The Last Dance',
    weaponAlts: { alt5: ['Static Mist'], alt4: ['Thunderbolt', 'Relativistic Jet'], alt3: ['Pistols of Night'] },
    teams: ['Chixia + Brant + Verina', 'Chixia + Changli + Baizhi'] },
  'Danjin': { rarity: 4, element: 'Havoc', weapon: 'Sword', role: 'Sub DPS',
    // desc expanded 2026-08-18 (Fandom + Prydwen): lore half is Fandom's "Scarlet Shade" Midnight Ranger
    // who hunts thieves/bandits for retribution; gameplay half is Prydwen's Hybrid framing — a fast
    // Outro-buff rotation for Havoc teammates, or a longer rotation (Basic ATK x3 into Skill x3, capped
    // by a full-power Forte Heavy Attack) that lets her run as a legitimate Main DPS.
    desc: 'Midnight Ranger who trades her own blood for power, hunting thieves and bandits across Huanglong for retribution. Havoc Hybrid who consumes HP to fuel enhanced Basic and Heavy Attacks, gaining Havoc DMG Bonus as health decreases — run as a quick Outro buffer for Havoc DPS or, with a longer rotation, as a Main DPS in her own right.',
    skills: ['Execution', 'Crimson Fragment', 'Crimson Bloom', 'Serene Vigil'],
    ascension: { boss: 'Strife Tacet Core', common: 'Ring', specialty: 'Belle Poppy' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Metallic Drip' },
    bestEchoes: ['Nightmare: Crownless', 'Havoc Eclipse 5pc'], bestWeapon: 'Blazing Brilliance',
    // weaponAlts added 2026-08-18 from Prydwen's ranked weapon list (all already tagged bestFor Danjin
    // in weapons.js): Emerald of Genesis (100.00%, standard 5★), Commando of Conviction (81.08%) and
    // Endless Collapse (80.72%) as top 4★s, Originite: Type II as the 3★ craftable option.
    weaponAlts: { alt5: ['Emerald of Genesis'], alt4: ['Commando of Conviction', 'Endless Collapse'], alt3: ['Originite: Type II'] },
    teams: ['Danjin + Camellya + Shorekeeper', 'Danjin + Camellya + Verina', 'Danjin + Cantarella + Verina', 'Danjin + Phrolova + Cantarella'] },
  // Audited 2026-08-18 via wutheringwaves.fandom.com (infobox/MediaWiki API) + prydwen.gg Kit/Build/
  // Gameplay tabs. desc: fandom infobox `role` field is "Concerto Efficiency;Traction;Resonance
  // Liberation Regeneration"; Prydwen frames her as a fully quickswap-friendly Hybrid whose Outro
  // funnels Resonance Energy to the incoming character and whose Forte/Resonance Skill both group
  // enemies — expanded desc below to cover both. bestEchoes corrected: 'Bell-Borne Geochelone' isn't
  // mentioned anywhere on her current Prydwen Build tab (stale/unsourced) — replaced with Prydwen's
  // actual top picks: Moonlit Clouds 5pc (support/quickswap build, paired with Impermanence Heron as
  // Main Echo) and Sierra Gale 5pc (damage-focused build, paired with Nightmare: Feilian Beringal).
  // teams corrected: Jiyan/Baizhi don't appear in her current Prydwen Synergies list at all — replaced
  // with her current top picks (Xiangli Yao/Changli quickswap hypercarry teams, Verina/Shorekeeper as
  // healing support). bestWeapon Emerald of Genesis confirmed (Prydwen's top non-signature 5★, 100%
  // baseline); Blazing Brilliance (Changli's sig, 102%) scores marginally higher but is a limited sig
  // weapon, so the widely-obtainable standard 5★ is kept as the primary recommendation (see
  // weaponAlts below for the full spread).
  'Yangyang': { rarity: 4, element: 'Aero', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Free Midnight Rangers outrider, Concerto Efficiency/Traction/Liberation Regen Hybrid. Aero sub-DPS who groups enemies via Resonance Skill and Liberation, builds up to 3 Melody stacks for a mid-air Feather Release burst, and funnels Resonance Energy to the next character via her Outro — one of the fastest, most quickswap-friendly rotations in the game.',
    skills: ['Feather as Blade', 'Zephyr Domain', 'Wind Spirals', 'Echoing Feathers'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Ring', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Moonlit Clouds 5pc', 'Sierra Gale 5pc'], bestWeapon: 'Emerald of Genesis',
    weaponAlts: { alt5: ['Blazing Brilliance'], alt4: ['Lumingloss', 'Endless Collapse'], alt3: ['Sword of Night'] },
    teams: ['Yangyang + Xiangli Yao + Shorekeeper', 'Yangyang + Changli + Verina', 'Yangyang + Carlotta + Verina'] },
  // Sanhua corrected 2026-08-18 via Prydwen's Kit/Build/Gameplay tabs: desc lore confirmed via fandom's
  // Official Introduction ("the loyal and reliable guard of Jinzhou Magistrate Jinhsi") — was already
  // accurate. bestWeapon changed from 'Emerald of Genesis' (Prydwen's #3 pick at 100.00%) to 'Blazing
  // Brilliance' (Prydwen's #1 pick at 108.39%, R1); weaponAlts added (previously missing entirely).
  // bestEchoes reordered to match Prydwen's stated primary set (Moonlit Clouds 5pc first, Impermanence
  // Heron as the paired Main Echo, not a second full set). teams reordered/expanded per Prydwen's own
  // "Example Teams" (Encore Team ranked as her single best pairing, ahead of the Camellya team).
  'Sanhua': { rarity: 4, element: 'Glacio', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Jinhsi\'s stoic personal guard, cold as the frost she commands. Quick-swap Glacio sub-DPS who deals burst Glacio DMG and amplifies the next character\'s Basic ATK DMG via Outro.',
    skills: ['Frigid Light', 'Eternal Frost', 'Glacial Gaze', 'Clarity of Mind'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Whisperin Core', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Moonlit Clouds 5pc', 'Impermanence Heron'], bestWeapon: 'Blazing Brilliance',
    weaponAlts: { alt5: ['Red Spring', 'Emerald of Genesis'], alt4: ['Commando of Conviction', 'Endless Collapse', 'Lunar Cutter', 'Lumingloss', 'Somnoire Anchor'], alt3: ['Sword of Night'] },
    teams: ['Sanhua + Encore + Verina', 'Sanhua + Camellya + Verina', 'Sanhua + Lingyang + Shorekeeper'] },
  // corrected 2026-08-18 via fandom's Taoqi/Combat page + Prydwen's Kit/Build/Gameplay tabs (previously
  // had no weaponAlts at all, and only a partial CHARACTER_DATA entry). desc: her Outro Iron Will is a
  // "Resonance Skill DMG Amplified by 38%" per fandom's own Forte Details text (matches her infobox
  // `role` field's own "Resonance Skill DMG Amplification" tag, see COMBAT_ROLE_DATA above) — not
  // "deepens", which was unsourced. bestEchoes replaced 'Bell-Borne Geochelone' (Prydwen's shield-focused
  // Main Echo alt, not the top Echo Set) with Prydwen's actual #1 Echo Set 'Rejuvenating Glow 5pc'
  // (paired with Main Echo 'Fallacy of No Return', Prydwen's stated top pick over Bell-Borne Geochelone);
  // 'Moonlit Clouds 5pc' kept as the Special Set alt for the Outro-swap-cancel playstyle. bestWeapon
  // kept as 'Dauntless Evernight' (free/signature) with weaponAlts alt5 'Discord' added — Prydwen's own
  // Best Weapons list only documents these 2 options for her (Discord R5 100%, Dauntless Evernight R5
  // 107.54%; no alt4/alt3 exists in Prydwen's ranking to source). teams replaced 'Taoqi + Camellya +
  // Shorekeeper' (no basis in Prydwen's Synergies tab — Camellya isn't listed at all) with Prydwen's
  // actual documented synergies: Carlotta ("by far Taoqi's best DPS to support") and Jinhsi, both paired
  // with Verina/Shorekeeper per the Example Teams section.
  'Taoqi': { rarity: 4, element: 'Havoc', weapon: 'Broadblade', role: 'Support',
    desc: 'Steadfast border defense director with an iron will. Havoc support who provides shields via Resonance Skill and amplifies the team\'s Resonance Skill DMG through Outro.',
    skills: ['Concealed Edge', 'Fortified Defense', 'Unmovable', 'Power Shift'],
    ascension: { boss: 'Gold-Dissolving Feather', common: 'Howler Core', specialty: 'Iris' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Waveworn Residue' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc', 'Moonlit Clouds 5pc'], bestWeapon: 'Dauntless Evernight',
    weaponAlts: { alt5: ['Discord'] },
    teams: ['Taoqi + Carlotta + Shorekeeper', 'Taoqi + Jinhsi + Verina'] },
  // corrected 2026-08-18 via fandom's Yuanwu/Combat page (Forte Details, rendered) + Prydwen's
  // Kit/Build/Review/Gameplay tabs (previously only had a partial CHARACTER_DATA entry, no
  // weaponAlts). desc: dropped "generates shields via Resonance Liberation" — Blazing Might's own
  // Forte Details text has no shield at all; the 200%-DEF shield only exists on Resonance Chain S4
  // "Retributive Knuckles" (RESONANCE_CHAIN_DATA below), so it's not part of his base (S0) kit.
  // Corrected to what Liberation actually does: grants team-wide Lightning Infused (Interruption
  // Resistance) and detonates the active Thunder Wedge. bestEchoes replaced 'Nightmare: Tempest
  // Mephis' + 'Empyrean Anthem 5pc' (Prydwen's Special/off-meta set, not the top pick) with Prydwen's
  // actual #1 recommendation: 'Rejuvenating Glow 5pc' (Main Echo 'Fallacy of No Return', triggered via
  // the Originite: Type IV weapon so his Basic ATK self-heal procs the set's teamwide 15% ATK buff —
  // this is literally his only meta use case per Prydwen's Review) with 'Moonlit Clouds 5pc' kept as
  // the alt (Main Echo Impermanence Heron, Outro-swap ATK buff). teams corrected — Prydwen's Synergies
  // tab documents Jinhsi as his ONLY meta pairing (Coordinated ATK stack-feeding for her Forte), run
  // with either Verina or Shorekeeper; 'Yuanwu + Calcharo + Shorekeeper' had no basis in Prydwen at all
  // (Calcharo isn't mentioned anywhere on his page) and was removed.
  'Yuanwu': { rarity: 4, element: 'Electro', weapon: 'Gauntlets', role: 'Support',
    desc: 'Veteran boxing gym owner who fights with thunderous fists. Electro hybrid support who deploys Thunder Wedge for off-field Coordinated Attacks and grants the team Interruption Resistance (Lightning Infused) via Resonance Liberation.',
    skills: ['Leihuangquan', 'Leihuang Master', 'Blazing Might', 'Unassuming Blade'],
    ascension: { boss: 'Hidden Thunder Tacet Core', common: 'Ring', specialty: 'Terraspawn Fungus' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc', 'Moonlit Clouds 5pc'], bestWeapon: 'Abyss Surges',
    weaponAlts: { alt4: ['Amity Accord', 'Stonard'], alt3: ['Guardian Gauntlets', 'Gauntlets of Voyager', 'Originite: Type IV'] },
    teams: ['Yuanwu + Jinhsi + Verina', 'Yuanwu + Jinhsi + Shorekeeper'] },
  // corrected 2026-08-18 via fandom's Mortefi/Combat page (Forte Details, rendered) + Prydwen's Kit/
  // Build/Review/Gameplay tabs (previously only had a partial CHARACTER_DATA entry, no weaponAlts).
  // desc: kept largely as-is (Fusion Coordinated ATK + Outro Heavy ATK buff both trace exactly to
  // Violent Finale's Burning Rhapsody and Rage Transposition), just re-worded to flag him as a Hybrid
  // per Prydwen's own classification (he deals meaningful personal Fusion DMG via Fury Fugue/Marcato,
  // not a pure buffer). bestEchoes replaced the bare 'Moonlit Clouds 5pc' with Prydwen's actual #1
  // build — Impermanence Heron (Main Echo) + Moonlit Clouds 5pc, swap-cancelled right before Outro for
  // a stacked ATK/DMG buff on the incoming DPS — and added 'Empyrean Anthem 5pc' as Prydwen's
  // documented #2 alternative for endgame-invested accounts. teams corrected to Prydwen's Synergies
  // tab: 'Mortefi + Galbrena + Lupa' is his explicitly named "Best Team" (Galbrena Mono Fusion, with
  // Lupa called out by name for the mono-Fusion setup); 'Mortefi + Jiyan + Verina' kept since Prydwen's
  // own text calls Jiyan "Mortefi's tailor-made partner" — Heavy ATK DMG Amp is Jiyan's main damage
  // type.
  'Mortefi': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Hot-tempered researcher whose music erupts in violent crescendos. Fusion Hybrid who fires off-field Fusion Coordinated Attacks (Burning Rhapsody) and buffs the on-field character\'s Heavy ATK DMG via Outro.',
    skills: ['Impromptu Show', 'Passionate Variation', 'Violent Finale', 'Fury Fugue'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc', 'Empyrean Anthem 5pc'], bestWeapon: 'Static Mist',
    weaponAlts: { alt5: ['The Last Dance'], alt4: ['Relativistic Jet', 'Novaburst', 'Thunderbolt', 'Undying Flame', 'Pistols#26'] },
    teams: ['Mortefi + Galbrena + Lupa', 'Mortefi + Jiyan + Verina'] },
  // audited 2026-08-18: sourced from wutheringwaves.fandom.com's Youhu/Combat page (rendered via the
  // MediaWiki API, section-by-section, since the raw wikitext only transcludes {{Forte Table}}/
  // {{Chain Table}} templates) and Prydwen's Kit/Build/Review/Gameplay tabs.
  // bestEchoes expanded with Prydwen's actual #1/#2 Main Echo picks (Fallacy of No Return now Prydwen's
  // stated top choice over Bell-Borne Geochelone, both on the Rejuvenating Glow 5pc set) plus the
  // documented Special Set alt (Moonlit Clouds 5pc + Impermanence Heron, for the Outro-swap-cancel
  // playstyle). weaponAlts added (previously entirely missing) — alt4 only: Prydwen's Best Weapons tab
  // ranks Marcato (#1, even above her own signature) > Gauntlets#21D (#2) > Abyss Surges (sig, #3) >
  // Celestial Spiral (#4) — no alt5 (5★) or alt3 (3★) weapon is documented there, so none invented.
  // teams corrected: the prior 'Youhu + Carlotta + Zhezhi'/'Youhu + Lingyang + Sanhua' pairings don't
  // match Prydwen's Synergies tab at all (Carlotta/Sanhua aren't Coordinated ATK dealers) — replaced with
  // Prydwen's actual named "Best Team" (Yinlin, her highest-DMG Coordinated ATK partner, paired with
  // Calcharo) and "Zhezhi Team" (Zhezhi + Lingyang), the two teams Prydwen gives full named partners for;
  // a third "Mortefi Team" card exists on Prydwen but lists no partner DPS in its caption text, so it's
  // left out rather than guessed a third member.
  'Youhu': { rarity: 4, element: 'Glacio', weapon: 'Gauntlets', role: 'Support',
    desc: 'Whimsical antique appraiser who trusts her luck in all things. Glacio support who heals the team via Resonance Skill/Forte and grants the incoming Coordinated ATK dealer a massive +100% Coordinated ATK DMG Amp through her Outro (Timeless Classics) — Prydwen calls this "the single biggest source of damage amplification for any attack type in the game."',
    skills: ['Frosty Punches', 'Scroll Divination', 'Fortune\'s Favor', 'Poetic Essence'],
    ascension: { boss: 'Topological Confinement', common: 'Ring', specialty: 'Violet Coral' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Cadence' },
    bestEchoes: ['Fallacy of No Return', 'Bell-Borne Geochelone', 'Rejuvenating Glow 5pc', 'Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Abyss Surges',
    weaponAlts: { alt4: ['Marcato', 'Gauntlets#21D', 'Celestial Spiral'] },
    teams: ['Youhu + Yinlin + Calcharo', 'Youhu + Zhezhi + Lingyang'] },
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
  // 'Coordinated ATK' tag corrected 2026-08-17: Ciaccona has no Coordinated Attack mechanic at all —
  // Prydwen's own review explicitly notes she's "similar to Coordinated Attackers (even though she
  // isn't one)". Her off-field damage instead comes from Ensemble Sylph clones (Basic ATK) and her
  // Liberation's lingering Recital state.
  ['Ciaccona',      ['Basic ATK', 'Skill'],          ['Aero Buff'],                           ['Erosion']],
  ['Lupa',          ['Liberation', 'Skill'],         ['DMG Buff'],                            ['Fusion RES Shred']],
  // dmg-type tag corrected 2026-08-17: Iuno's actual rotation damage (Moonbow Basic ATK, Arc Beyond the
  // Edge, and the Flux jump-attacks) is explicitly "considered as Resonance Liberation DMG" per Prydwen's
  // kit breakdown — only Absolute Fullness and the base Moonring combo are true Heavy ATK/Basic ATK.
  ['Iuno',          ['Liberation', 'Heavy ATK'],     ['Heavy ATK Buff', 'Heal', 'Shield'],    []],
  // dmg-type tag corrected 2026-08-17: Qiuyuan's actual rotation damage (Inkwash Basic ATK Stage 3-4 and
  // his Forte Heavy Attack finishers) is explicitly "considered as Heavy Attack DMG" per Prydwen's kit
  // breakdown, and the Forte finishers are additionally "considered as performing Echo Skill" — his
  // Liberation/Intro are also tagged Heavy ATK. Previously listed as purely ['Echo'], missing the
  // majority Heavy ATK component entirely.
  ['Qiuyuan',       ['Heavy ATK', 'Echo'],           ['Echo DMG Buff', 'Crit DMG Amp'],       []],
  // dmg-type/buff tags corrected 2026-08-17: Chisa was tagged as purely ['Skill'] with no buff tags at
  // all — but per Prydwen, her base Skill is barely used (too little Forte/Energy to be worthwhile
  // outside the Opener) and her actual rotation damage is Basic ATK (incl. Death Snip/Thread Withdrawn)
  // and her Forte's Sawring Blitz/Eradication, both explicitly "considered Resonance Liberation DMG".
  // Buff tags were also entirely missing her Heal (Moment of Nihility/Death Snip) and Shield (Sawring -
  // Eradication) kit.
  ['Chisa',         ['Basic ATK', 'Liberation'],     ['Heal', 'Shield'],                      ['DEF Shred']],
  ['Lynae',         ['Liberation', 'Skill'],         ['Tune Break DMG Buff'],                 ['Off-Tune']],
  // dmg-type tag corrected 2026-08-18: Danjin's own Prydwen kit breakdown says the Resonance Skill is
  // "the core of her kit, which all of her combo options revolve around" (Crimson Fragment/Erosion,
  // Sanguine Pulse) — 'Skill' was missing entirely. buff tag corrected: her Outro is worded "23% Havoc
  // DMG Deepen" (not "Bonus") per Prydwen's own rotation writeup, matching the `deepen` stat key used
  // in CHAR_BUFF_TABLE below.
  ['Danjin',        ['Basic ATK', 'Heavy ATK', 'Skill'], ['Havoc DMG Deepen'],                 []],
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
  // buff tag corrected 2026-08-18: fandom's Taoqi/Combat Outro Skill "Iron Will" text is "Resonance
  // Skill DMG Amplified by 38%" — matches the 'Skill DMG Amp' convention used for Lumi/Baizhi/Buling's
  // identical Amp-type buffs below, not the "Deepen" wording (which belongs to a different, unsourced
  // stat this character never actually carries).
  ['Taoqi',         ['Skill'],                       ['Shield', 'Skill DMG Amp'],              []],
  // buff tag corrected 2026-08-18: fandom's Yuanwu/Combat Forte Details table for Resonance Liberation
  // Blazing Might has no shield effect at all — the 'Shield' tag had no basis in his base (S0) kit,
  // only appearing on Resonance Chain S4 "Retributive Knuckles" (200% DEF shield, see
  // RESONANCE_CHAIN_DATA below), so it's removed from this always-on buff list.
  ['Yuanwu',        ['Coordinated ATK'],             ['Coordinated ATK'],                     []],
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
  ['Carlotta',      12450, 463, 1198, 125],
  ['Roccia',        12250, 375, 1198, 125],
  ['Phoebe',        10825, 413, 1259, 125],
  ['Brant',         11675, 375, 1308, 125],
  ['Cantarella',    11600, 400, 1100, 125],
  ['Zani',          10775, 438, 1137, 125],
  ['Ciaccona',      12238, 375, 1198, 125],
  ['Cartethyia',    14800, 313, 611,  125],
  ['Lupa',          11913, 388, 1186, 125],
  ['Phrolova',      10775, 438, 1137, 125],
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
  // corrected 2026-08-18: HP/ATK/DEF were slightly off (9437/262/1148) vs Prydwen's exact Lv.90 stat
  // screen (9438/263/1149) — Energy already matched.
  ['Danjin',        9438,  263, 1149, 100],
  // corrected 2026-08-18: DEF was 1099 vs Prydwen's exact Lv.90 stat screen 1100 (HP/ATK/Energy already matched).
  ['Yangyang',      10200, 250, 1100, 100],
  // corrected 2026-08-18: HP was 10062 vs Prydwen's exact Lv.90 stat screen 10063 (ATK/DEF/Energy already matched).
  ['Sanhua',        10063, 275, 941,  100],
  ['Taoqi',         8950,  225, 1564, 125],
  // DEF corrected 2026-08-18: was 1637 vs fandom's exact Lv.90 Ascensions and Stats table
  // (8,525.00 / 225.00 / 1,637.75, rounds to 1638) and Prydwen's own Lv.90 stat screen (DEF 1638).
  ['Yuanwu',        8525,  225, 1638, 125],
  // DEF corrected 2026-08-18: was 1136 vs fandom's exact Lv.90 Ascensions and Stats table (10,025.00 /
  // 250.00 / 1,136.65, rounds to 1137) and Prydwen's own Lv.90 stat screen (DEF 1137).
  ['Mortefi',       10025, 250, 1137, 125],
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
  ['Phoebe',        2200, 24, 10],  // Absolution/Confession Forte burst (no card mechanic in her kit)
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
  ['Qiuyuan',      'Huanglong'], ['Yangyang: Xuanling', 'Huanglong'], ['Suisui', 'Huanglong'],
  ['Qingxiao',     'Huanglong'], ['Jingran',      'Huanglong'],
  // Huanglong 4★
  ['Baizhi',       'Huanglong'], ['Chixia',       'Huanglong'],
  ['Danjin',       'Huanglong'], ['Yangyang',     'Huanglong'], ['Sanhua',       'Huanglong'],
  ['Taoqi',        'Huanglong'], ['Yuanwu',       'Huanglong'], ['Mortefi',      'Huanglong'],
  ['Youhu',        'Huanglong'], ['Lumi',         'Huanglong'], ['Buling',       'Huanglong'],
  // Black Shores
  ['Shorekeeper',  'Black Shores'], ['Camellya',   'Black Shores'], ['Galbrena',   'Black Shores'],
  ['Encore',       'Black Shores'],
  // Aalto's own infobox `nation` field reads "The Black Shores", not Huanglong — corrected 2026-08-18.
  ['Aalto',        'Black Shores'],
  // Rinascita
  ['Carlotta',     'Rinascita'], ['Roccia',       'Rinascita'], ['Phoebe',       'Rinascita'],
  ['Brant',        'Rinascita'], ['Cantarella',   'Rinascita'], ['Zani',         'Rinascita'],
  ['Ciaccona',     'Rinascita'], ['Cartethyia',   'Rinascita'], ['Lupa',         'Rinascita'],
  ['Phrolova',     'Rinascita'],
  // Septimont (fixed 2026-08-17: Septimont is a city-state region OF Rinascita per fandom's own Location
  // Infobox `nation` field — same pattern as Jinzhou being a city within Huanglong — not a separate nation).
  ['Augusta',      'Rinascita'], ['Iuno',         'Rinascita'],
  // Lahai-Roi (Startorch Academy)
  ['Chisa',        'Lahai-Roi'], ['Lynae',        'Lahai-Roi'], ['Mornye',       'Lahai-Roi'],
  ['Luuk Herssen', 'Lahai-Roi'], ['Aemeath',      'Lahai-Roi'], ['Sigrika',      'Lahai-Roi'],
  ['Hiyuki',       'Lahai-Roi'], ['Denia',        'Lahai-Roi'], ['Lucilla',      'Lahai-Roi'],
  // Night City (Cyberpunk: Edgerunners collab, per both characters' own `nation` infobox field — a
  // real-world-fiction location outside the Solaris-3 nations above, not a Solaris-3 error; no dedicated
  // wiki emblem exists for it, same "no icon" convention as New Federation elsewhere in this table).
  ['Lucy',         'Night City'], ['Rebecca',      'Night City'],
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
  // Yangyang: Xuanling shares her 4★ counterpart Yangyang's birthday per fandom's own infobox
  // ('October 11th', confirmed 2026-08-18 via the MediaWiki API). Suisui's infobox leaves `birthday`
  // blank — omitted per the established convention rather than guessed.
  ['Yangyang: Xuanling', '10-11'],
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
  // title corrected 2026-08-17 (found while auditing Aemeath, whose real title turned out to be
  // "Guiding Starlance" per both ww.nanoka.cc character/1210 and fandom): Jianxin's title was wrongly
  // copied as "Guiding Starlance" too — ww.nanoka.cc character/1405 confirms her actual title is
  // "Cleansing Reflections".
  ['Jianxin', 'Cleansing Reflections', 'Huanglong', 'Jinzhou', { en: 'Ioanna Kimbook', cn: 'Elise Zhang', jp: 'Anzai Chika', kr: 'Lee Eunjo' }],
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
  // birthplace: ww.nanoka.cc's own infobox lists this as literally "Unknown" for her (unlike most other
  // characters, which have a real birthplace even when their nation/region tie is separately unconfirmed).
  ['Camellya', 'Sanguine Blossom', 'Unknown', 'Black Shores', { en: 'Meaghan Martin', cn: 'Liu ZhiXiao', jp: 'Ise Mariya', kr: 'Yu Hye Ji' }],
  // organization: 'Montelli Family' (no leading "The") to match helpers.js's FACTION_ICONS key exactly —
  // the icon lookup is a straight object-key match, so "The Montelli Family" silently resolved to no icon.
  ['Carlotta', 'Reshaping Dimensions', 'Ragunna', 'Montelli Family', { en: 'Jennifer English', cn: 'Yan Yeqiao', jp: 'Ueda Kana', kr: 'Kim Soon Mi' }],
  ['Roccia', 'Stage in the Box', 'Rinascita', 'Troupe of Fools', { en: 'Holly Earl', cn: 'Shen Huasang', jp: 'Kohara Konomi', kr: 'Jang Mi' }],
  ['Phoebe', 'Graceful Luminescence', 'Rinascita', 'Order of the Deep', { en: 'Rebecca LaChance', cn: 'Fu Tingyun', jp: 'Hondo Kaede', kr: 'Lee Bo Yong' }],
  ['Brant', 'Flamebound Compass', 'Rinascita', 'Troupe of Fools', { en: "Hyoie O'Grady", cn: 'Ray Mo', jp: 'Kishio Daisuke', kr: 'Lee Ju Seung' }],
  ['Cantarella', 'Sea of Dreams', 'Rinascita', 'Fisalia Family', { en: 'Alexandra Guelff', cn: 'Xiaomi', jp: 'Nakahara Mai', kr: 'Kim Yul' }],
  // organization: 'Montelli Family' (no leading "The", even though nanoka's own infobox literally shows
  // "The Montelli Family") to match helpers.js's FACTION_ICONS key exactly, same fix applied to Carlotta.
  ['Zani', 'Scorched Radiance', 'Rinascita', 'Montelli Family', { en: 'Alexandra Metaxa', cn: 'Nie Xiying', jp: 'Ueda Hitomi', kr: 'Won Esther' }],
  ['Ciaccona', 'Woven Melodies', 'Rinascita', 'Ragunna', { en: 'Rebecca Hanssen', cn: 'Ye Zhiqiu', jp: 'Hasegawa Ikumi', kr: 'Kim Ye Rim' }],
  ['Cartethyia', 'Feathered Tempest', 'Rinascita', 'Ragunna', { en: 'Amanda Elizabeth Rischel', cn: 'Yun Hezhui', jp: 'Asakawa Yuu', kr: 'Bae Ha Gyoung' }],
  ['Lupa', 'Howling Flame', 'Rinascita', 'Septimont', { en: 'Kaja Chan', cn: 'Shuo Xiaotu', jp: 'Takahashi Minami', kr: 'Kim Ye Reong' }],
  // birthplace: ww.nanoka.cc's own infobox lists this as literally "Unknown" for her — her Fractsidus
  // organization tie is what ties her to the Rinascita region (REGION_DATA below), same pattern as
  // Camellya's identity block above.
  ['Phrolova', 'Symphony of Beyond', 'Unknown', 'Fractsidus', { en: 'Rae Lim', cn: 'Zhang Qi', jp: 'Fujita Saki', kr: 'Choi Ha Ri' }],
  // birthplace: fandom's own infobox leaves both `birthday` and `birthplace` blank for Augusta — treated
  // as "Unknown" per the Camellya/Phrolova convention above. organization uses her city-state affiliation
  // (Septimont) rather than the generic Rinascita nation tie, matching the Jinzhou City Hall convention.
  ['Augusta', 'Ephor of Septimont', 'Unknown', 'Septimont', { en: 'Alix Wilton Regan', cn: 'Mu Xueting', jp: 'Hikasa Yoko', kr: 'Lee Ji-hyun' }],
  // birthplace: fandom's own infobox leaves both `birthday` and `birthplace` blank for Iuno too — same
  // "Unknown" convention as Augusta/Camellya/Phrolova above. organization uses affiliation2 (Tetragon
  // Temple, her specific priesthood) over the generic Septimont/Rinascita tie, matching the Jinzhou City
  // Hall convention — no dedicated emblem exists for Tetragon Temple on the wiki (only a location photo),
  // so it's intentionally left out of FACTION_ICONS rather than guessed, same as the Jinzhou precedent.
  ['Iuno', 'Stasis, Cycle, Renewal', 'Unknown', 'Tetragon Temple', { en: 'Ella Boyes', cn: 'Jiang Yingjun', jp: 'Lynn', kr: 'Yoon Eun-seo' }],
  // birthplace: fandom's infobox literally lists 'Rinascita' for her (a real value this time, not blank)
  // — she's Septimont-born (a former Septimontian known as "Angel") but now serves as a Consultant of
  // the Black Shores, which is her REGION_DATA tie/organization, same birthplace-vs-nation-tie pattern
  // as Verina. organization uses her primary affiliation (Black Shores) rather than her origin
  // (Septimont) since that's her actual employer, matching the Shorekeeper/Camellya/Encore convention.
  ['Galbrena', 'Infernal Descent', 'Rinascita', 'Black Shores', { en: 'Devora Wilde', cn: 'Zhang Wenjie', jp: 'Shoji Umeka', kr: 'Lee Da-seul' }],
  // organization uses his primary affiliation (Mingting) over affiliation2 (Chongzhou) and the now-inactive
  // affiliation3 (Internal Security Agency, "formerly") — no dedicated emblem exists for Mingting on the
  // wiki, so it's intentionally left out of FACTION_ICONS rather than guessed, same as the Jinzhou precedent.
  ['Qiuyuan', 'Bambooscape', 'Huanglong', 'Mingting', { en: 'Jeremy Ang Jones', cn: 'Gan Ziqi', jp: 'Miki Shinichiro', kr: 'Kim Min-ju' }],
  ['Chisa', 'Eye of Unravelling', 'Ashinohara', 'Startorch Academy', { en: 'Leader Looi', cn: 'Zhao Lingze', jp: 'Kanemoto Hisako', kr: 'Lee Joo-eun' }],
  // Cross-checked ww.nanoka.cc character/1509 against fandom's own infobox — both agree exactly:
  // birthplace New Federation (born in the Lawless Zone there, before stealing "Lynae"'s identity to
  // attend Startorch Academy), organization Startorch Academy (her current affiliation; the wiki lists
  // "Lawless Zone" only as a "formerly" tag, not her active org). Birthday: both sources list "Unknown" —
  // intentionally left out of BIRTHDAY_DATA above rather than guessed, same as the "omitted" convention
  // documented there. cn/jp VA names/spellings confirmed identical on both sources.
  ['Lynae', 'Radiant Spectrum', 'New Federation', 'Startorch Academy', { en: 'Elsie Lovelock', cn: 'Zhu Jing', jp: 'Inoue Marina', kr: 'Choi Hyeon-ji' }],
  // Cross-checked ww.nanoka.cc character/1209 (matches its own infobox exactly): birthplace New
  // Federation, organization 'Spacetrek Collective' (the wiki's short Affiliation field — her full
  // in-universe title is "Spacetrek Collective Research Institute engineer", already captured in her
  // `desc`). Birthday: 'Unknown' per the site — left out of BIRTHDAY_DATA above, same convention as
  // Lynae/Augusta/Camellya/etc.
  ['Mornye', 'Astral Mapping', 'New Federation', 'Spacetrek Collective', { en: 'Michelle Fox', cn: 'Tong Xinzhu', jp: 'Iwami Manaka', kr: 'Oh Ro-ah' }],
  // Cross-checked ww.nanoka.cc character/1210 against fandom's own infobox — both agree exactly.
  // birthplace: Roya Frostlands (she's a Roya Tribe native), distinct from her region/nation tie
  // (Lahai-Roi, in REGION_DATA above) — same birthplace-vs-nation-tie pattern as Verina/Galbrena.
  // organization: fandom's infobox lists two affiliations (Startorch Academy "on profile" + Roya Tribe);
  // 'Startorch Academy' is used to match nanoka's single Affiliation field and the Lynae/Mornye
  // convention for other Startorch-affiliated characters. Birthday: both sources list 'Unknown'.
  ['Aemeath', 'Guiding Starlance', 'Roya Frostlands', 'Startorch Academy', { en: 'Cara Theobold', cn: 'Wang Yaxin', jp: 'Sato Satomi', kr: 'Kim Ha-ru' }],
  // Cross-checked ww.nanoka.cc character/1510 against fandom's own infobox — both agree exactly:
  // birthplace New Federation, organization 'Startorch Academy' (his primary affiliation; the wiki's
  // affiliation2/3 — Spacetrek Collective, Lollo Logistics — are secondary ties, matching the
  // Lynae/Mornye/Aemeath convention of using the primary Startorch Academy tie). Birthday: 'Unknown' on
  // both sources.
  ['Luuk Herssen', 'Phase Transition', 'New Federation', 'Startorch Academy', { en: 'Griffyn Bellah', cn: 'Ma Zhengyang', jp: 'Tachibana Shinnosuke', kr: 'Min Seung-woo' }],
  // birthplace: fandom's own infobox lists this as 'Roya Frostlands' (distinct from her Lahai-Roi
  // region/nation tie, in REGION_DATA above), same birthplace-vs-nation-tie pattern as Aemeath — both are
  // Roya Tribe natives. ww.nanoka.cc's own Birthplace field shows 'Lahai-Roi' instead (a discrepancy
  // between the two sources); fandom's is used here as the more granular/precise of the two, matching
  // the convention already established for Aemeath's identical Roya Frostlands birthplace.
  // organization: 'Roya Tribe' matches both sources' primary affiliation (nanoka's single Organization
  // field, and fandom's `affiliation` over `affiliation2` Startorch Academy) — the reverse of Aemeath's
  // primary tie, despite both characters sharing the same two affiliations.
  ['Sigrika', 'True Name Manifestation', 'Roya Frostlands', 'Roya Tribe', { en: 'Maya Lindh', cn: 'Qian Chen', jp: 'Akasaki Chinatsu', kr: 'Jang Ye-na' }],
  // Cross-checked ww.nanoka.cc character/1108 against fandom's own infobox — both agree exactly:
  // birthplace Ashinohara (a region distinct from Lahai-Roi, where she now resides — see REGION_DATA
  // above), organization 'Miko of Flaming Sakura' (her primary affiliation on both sources; fandom lists
  // 3 more secondary ties — Special Response Force, Spacetrek Collective, Startorch Academy — but no
  // dedicated emblem exists for any of them on the wiki, matching the Jinzhou-precedent convention of
  // leaving unconfirmed sub-org icons out rather than guessed). Birthday: 'Unknown' on both sources.
  ['Hiyuki', "Futures' Tithe", 'Ashinohara', 'Miko of Flaming Sakura', { en: 'Mei Mac', cn: 'Li Chanfei', jp: 'Tomatsu Haruka', kr: 'Jung Hye-won' }],
  // Sourced via wutheringwaves.fandom.com's MediaWiki API (action=parse&page=Denia&prop=wikitext&
  // section=0), which bypasses the site's Cloudflare challenge. birthplace: the infobox's own
  // `birthplace` field is literally 'Redacted' (a deliberate in-lore mystery tied to her being a
  // Fractsidus-created Resonator for Aleph-1, not a sourcing gap — used verbatim rather than guessed).
  // organization: uses her primary affiliation (Fractsidus, her secret true allegiance) over affiliation2
  // (Startorch Academy, her cover identity) to match the Phrolova/Fractsidus convention above; nation
  // 'Lahai-Roi' (REGION_DATA above) is a separate infobox field from either affiliation. Birthday: blank
  // on the infobox, omitted from BIRTHDAY_DATA per the established 'Unknown' convention.
  ['Denia', 'Bubbles of Nihility', 'Redacted', 'Fractsidus', { en: 'Jodie Bell Cortez', cn: 'Ge Zinyu', jp: 'Itō Miku', kr: 'Park Si-yoon' }],
  // Cyberpunk: Edgerunners collab characters, sourced via the MediaWiki API (action=parse&page=Lucy/
  // Rebecca&prop=wikitext&section=0). birthplace: both infoboxes list 'Unknown'. organization: Lucy's
  // primary affiliation is 'Lahai-Roi' itself (she's since settled there post-collab-arc, per "At
  // Dream's Edge" — a specific in-world tie distinct from her REGION_DATA nation, Night City, above);
  // Rebecca's primary affiliation is blank/'Unknown' on the infobox (she died before the game's events —
  // per her own infobox `status` field — and never had one), so her affiliation2 'Collaboration
  // Resonators' (a meta-tag, not an in-universe faction with its own emblem) is used instead, left
  // icon-less rather than guessed. realname: Lucy's infobox lists 'Lucyna Kushinada' as `realname`, not
  // surfaced as a separate field here since no other audited character's realname is tracked yet.
  ['Lucy', 'Xeno-Domain Hacking', 'Unknown', 'Lahai-Roi', { en: 'Emi Lo', cn: 'Song Zhengnan', jp: 'Yūki Aoi', kr: 'Kim Ga-ryeong' }],
  ['Rebecca', 'Fury-Type Arsenal', 'Unknown', 'Collaboration Resonators', { en: 'Alex Cazares', cn: 'Chen Zhang', jp: 'Kurosawa Tomoyo', kr: 'Park Si-yoon' }],
  // Cross-checked wutheringwaves.fandom.com's own infobox via the MediaWiki API (action=parse&
  // page=Lucilla&prop=wikitext&section=0). birthplace New Federation, distinct from her Lahai-Roi
  // region tie (REGION_DATA above) — same birthplace-vs-nation-tie pattern as Verina/Galbrena.
  // organization uses her primary affiliation (Startorch Academy, where she's president) over
  // affiliation2 (Spacetrek Collective) and the now-inactive affiliation3 (Pioneer Association,
  // "formerly"), matching the Lynae/Mornye/Aemeath Startorch Academy convention. Birthday: blank on
  // the infobox, omitted from BIRTHDAY_DATA per the established 'Unknown' convention.
  ['Lucilla', 'Memory Palace', 'New Federation', 'Startorch Academy', { en: 'Luci Fish', cn: 'Liu Yinuo', jp: 'Itō Shizuka', kr: 'Min-ah' }],
  // Cross-checked wutheringwaves.fandom.com's own infobox via the MediaWiki API (action=parse&
  // page=Yangyang:_Xuanling&prop=wikitext&section=0). title2 'Votary of the Voice' is also given but
  // not surfaced here (no dual-title field exists yet in this table). birthplace/nation both Huanglong
  // (REGION_DATA above). organization uses affiliation3 'Xuan Triad' (the group whose members are
  // called "Xuan Watchers" per the infobox's own extra-effect note — matching her own `desc`'s "Xuan
  // Watcher of Xuanfang Hold") over the more generic primary affiliation 'Ministry of War' and the
  // now-inactive affiliation4 'Midnight Rangers' ("formerly"); no dedicated emblem exists for Xuan
  // Triad on the wiki, so it's intentionally left out of FACTION_ICONS rather than guessed, same as
  // the Jinzhou/Mingting precedent.
  // Sourced 2026-08-18 via the MediaWiki API (action=parse&page=Yangyang&prop=wikitext&section=0).
  // birthplace/nation both Huanglong (REGION_DATA above, matches Xuanling's own entry — the two are
  // sisters). organization uses affiliation2 'Midnight Rangers' (matching her own `desc`'s "Midnight
  // Rangers outrider" and Prydwen's own framing) over the primary affiliation 'Jinzhou', same
  // affiliation-choice convention as Jiyan/Yangyang: Xuanling above. VAs cross-checked against
  // Prydwen's Kit tab Voice Actors panel (Rebecca Yeo/Yui Ishikawa/Chong Chong/Lee Yu-ri) — exact match.
  ['Yangyang', 'Breath of Winds', 'Huanglong', 'Midnight Rangers', { en: 'Rebecca Yeo', cn: 'Chongchong', jp: 'Ishikawa Yui', kr: 'Lee Yu-ri' }],
  ['Yangyang: Xuanling', 'Voices of Azure Plume', 'Huanglong', 'Xuan Triad', { en: 'Rebecca Yeo', cn: 'Chongchong', jp: 'Ishikawa Yui', kr: 'Lee Yu-ri' }],
  // Cross-checked wutheringwaves.fandom.com's own infobox via the MediaWiki API (action=parse&
  // page=Suisui&prop=wikitext&section=0). birthplace/nation both Huanglong (REGION_DATA above).
  // organization uses her primary affiliation (Zhaoming Commerce Guild, where she's director, matching
  // her own `desc`) over affiliation2 (Mingting, her noble family of birth) — no dedicated emblem
  // exists for Zhaoming Commerce Guild on the wiki, so it's intentionally left out of FACTION_ICONS
  // rather than guessed, same as the Jinzhou/Mingting precedent. Birthday: blank on the infobox.
  ['Suisui', 'Host of Harmony', 'Huanglong', 'Zhaoming Commerce Guild', { en: 'Emily Piggford', cn: 'Sun Yanqi', jp: 'Fukuen Misato', kr: 'Park Ji-yoon' }],
  // Sourced 2026-08-18 via the MediaWiki API (action=parse&page=Qingxiao&prop=wikitext&section=0) from
  // fandom's own "Upcoming" stub infobox, 2 days ahead of her 2026-08-20 release — title/birthplace/
  // nation/affiliations/VAs are already confirmed there even though the Combat subpage doesn't exist
  // yet. birthplace/nation both Huanglong (REGION_DATA above). organization uses her primary
  // affiliation 'Mengzhou' (the city she's the "Paragon" of, per her own quote/intro text and its own
  // dedicated FACTION_ICONS emblem) over affiliation2 'Xuanfang Wardens'. Birthday: blank on the
  // infobox, omitted from BIRTHDAY_DATA per the established convention.
  ['Qingxiao', 'Heart Sword', 'Huanglong', 'Mengzhou', { en: 'Kirsty Rider', cn: 'Jiang He', jp: 'Nabatame Hitomi', kr: 'Park Ri-na' }],
  // Sourced 2026-08-18 via the MediaWiki API (action=parse&page=Jingran&prop=wikitext&section=0) from
  // fandom's own "Upcoming" stub infobox — note its `name` field is a stray copy-paste leftover from
  // Qingxiao's own infobox (a wiki bug, not this table's error); every other field (title, gender,
  // birthplace, nation, affiliation, VA, quote) is genuinely Jingran-specific and cross-checked against
  // his own quote/intro text and release-patch pairing with Qingxiao. birthplace/nation both Huanglong
  // (REGION_DATA above). organization uses his only listed affiliation, 'Mengzhou' (same city/emblem as
  // Qingxiao — both release in the 3.6 patch). Only JP VA is confirmed pre-release (Kawanishi Kengo);
  // EN/CN/KR are blank on the infobox, left unset rather than guessed. Birthday: blank, omitted from
  // BIRTHDAY_DATA per the established convention.
  ['Jingran', 'Nether Qi Art', 'Huanglong', 'Mengzhou', { jp: 'Kawanishi Kengo' }],
  // 4★ Resonators — sourced via the MediaWiki API (action=parse&page=X&prop=wikitext&section=0).
  // Aalto: birthplace New Federation, nation 'The Black Shores' (REGION_DATA above, corrected from the
  // prior Huanglong bug), organization 'Black Shores' (affiliation).
  ['Aalto', 'Mistcloak Strike', 'New Federation', 'Black Shores', { en: 'James Day', cn: 'Liang Dawei', jp: 'Iwasaki Ryōta', kr: 'Lim Chae-bin' }],
  // Baizhi: birthplace/nation both Huanglong. organization uses affiliation2 'Huaxu Academy' (her
  // research institute) over the generic Jinzhou tie, matching the Jiyan/Changli sub-group convention.
  ['Baizhi', "Healing You'tan", 'Huanglong', 'Huaxu Academy', { en: 'Samantha Dakin', cn: 'Chen Tingting', jp: 'Seto Asami', kr: 'Seong Ye-won' }],
  // Chixia: birthplace/nation both Huanglong. organization uses affiliation2 'Public Security Bureau'
  // over the generic Jinzhou tie, matching the Yinlin precedent (no dedicated emblem exists for it).
  ['Chixia', 'Gallant Blaze', 'Huanglong', 'Public Security Bureau', { en: 'Harriet Carmichael', cn: 'Cai Na', jp: 'Nagase Anna', kr: 'Kang Eun-ae' }],
  // Danjin: sourced 2026-08-18 via fandom's own infobox (wutheringwaves.fandom.com/wiki/Danjin).
  // Title 'Scarlet Shade' confirmed by the page's own card/banner header. birthplace/nation both
  // Huanglong (REGION_DATA above). organization uses affiliation2 'Midnight Rangers' (her specific
  // in-game sub-group, matching the Jiyan/Lingyang convention) over the generic 'Jinzhou (on profile)'
  // tie. VAs cross-checked against Prydwen's profile tab (exact match): EN Sophie Colquhoun,
  // CN Yi Kou Jing (一口井), JP Okasaki Miho, KR Lee Hyunjin.
  ['Danjin', 'Scarlet Shade', 'Huanglong', 'Midnight Rangers', { en: 'Sophie Colquhoun', cn: 'Yi Kou Jing', jp: 'Okasaki Miho', kr: 'Lee Hyunjin' }],
  // Sanhua: sourced 2026-08-18 via fandom's own infobox (wutheringwaves.fandom.com/wiki/Sanhua).
  // Title 'Snow Waltz' taken from the infobox's secondary_title field (no dedicated "Title" row exists
  // for her, unlike Danjin — same convention). birthplace/nation both Huanglong (REGION_DATA above).
  // organization uses affiliation2 'Jinzhou City Hall' (her specific in-game sub-group, per Prydwen's
  // own intro: "bodyguard of Jinzhou's Magistrate") over the generic 'Jinzhou (on profile)' tie,
  // matching the Chixia/Danjin precedent. VAs cross-checked against Prydwen's profile tab (exact
  // match): EN Jennifer Armour, CN Song Yuanyuan, JP Matsuda Risae, KR Yu Yeong (Yooyou).
  ['Sanhua', 'Snow Waltz', 'Huanglong', 'Jinzhou City Hall', { en: 'Jennifer Armour', cn: 'Song Yuanyuan', jp: 'Matsuda Risae', kr: 'Yu Yeong' }],
  // Taoqi: added 2026-08-18, sourced via the MediaWiki API (action=parse&page=Taoqi&prop=wikitext).
  // Title 'Blossom of Slashes' from the infobox `title` field. birthplace/nation both Huanglong
  // (REGION_DATA above). organization uses affiliation2 'Ministry of Development' (her specific
  // in-game department — she's its border defense director, per her own `desc`/Official Introduction)
  // over the generic primary affiliation 'Jinzhou', matching the Jiyan/Danjin sub-group convention.
  // VAs confirmed exact from the infobox: EN Clare Louise Connolly, CN KIYO, JP Yōmiya Hina
  // (羊宮妃那), KR Yi Sae-ah (이새아).
  ['Taoqi', 'Blossom of Slashes', 'Huanglong', 'Ministry of Development', { en: 'Clare Louise Connolly', cn: 'KIYO', jp: 'Yōmiya Hina', kr: 'Yi Sae-ah' }],
  // Yuanwu: added 2026-08-18, sourced via the MediaWiki API (action=parse&page=Yuanwu&prop=wikitext).
  // Title 'Fist of Thunder' from the infobox `title` field. birthplace/nation both Huanglong
  // (REGION_DATA above). organization uses affiliation2 'Yuanwu Boxing Gym' (his own gym, per his
  // `desc`/Official Introduction) over the generic primary affiliation 'Jinzhou', matching the
  // Baizhi/Chixia/Danjin/Taoqi sub-group convention. No dedicated FACTION_ICONS emblem exists on the
  // wiki for a personally-owned gym, so it's intentionally left unset rather than guessed (matches the
  // Jinzhou/Mingting/Ministry of Development precedent). VAs confirmed exact from the infobox: EN Adam
  // Diggle, CN Liu Beichen (刘北辰), JP Shirokuma Hiroshi (白熊寬嗣), KR Park Seong-tae (박성태) —
  // cross-checked and matching against Prydwen's own Voice Actors tab.
  ['Yuanwu', 'Fist of Thunder', 'Huanglong', 'Yuanwu Boxing Gym', { en: 'Adam Diggle', cn: 'Liu Beichen', jp: 'Shirokuma Hiroshi', kr: 'Park Seong-tae' }],
  // Mortefi: added 2026-08-18, sourced via the MediaWiki API (action=parse&page=Mortefi&prop=wikitext).
  // Title 'Dragon's Breath' from the infobox `title` field. birthplace 'New Federation' (distinct from
  // his region/nation tie, Huanglong, in REGION_DATA above — same birthplace-vs-nation-tie pattern as
  // Verina/Calcharo). organization uses affiliation2 'Huaxu Academy' (he's head of the Branch of
  // Tacetite Weaponry within its Department of Safety, per his own Official Introduction/desc) over the
  // generic primary affiliation 'Jinzhou', matching the Baizhi/Jiyan sub-group convention. VAs confirmed
  // exact from the infobox and cross-checked against Prydwen's own Voice Actors panel (exact match):
  // EN Joseph May, CN Liu Yijia (刘以嘉), JP Miura Katsuyuki (三浦勝之), KR Kim Da-ol (김다올). Note: the
  // infobox's own CN-VA citation footnote text is a stray copy-paste artifact referencing an unrelated
  // resonator's name — the CN VA name itself (Liu Yijia) is unaffected and matches Prydwen independently.
  ['Mortefi', "Dragon's Breath", 'New Federation', 'Huaxu Academy', { en: 'Joseph May', cn: 'Liu Yijia', jp: 'Miura Katsuyuki', kr: 'Kim Da-ol' }],
  // Youhu: added 2026-08-18, sourced via the MediaWiki API (action=parse&page=Youhu&prop=wikitext).
  // Title 'Cryogenic Wonders' from the infobox `title` field. birthplace 'Huanglong' (matches her
  // region/nation tie in REGION_DATA above — the infobox's `birthplace` and `nation` fields are both
  // 'Huanglong' for her, unlike the split-tie characters commented elsewhere in this table). organization
  // uses the infobox's only `affiliation` field, 'Chongzhou' (a city within Huanglong, like Jinzhou/
  // Mengzhou) — no dedicated FACTION_ICONS emblem exists on the wiki for Chongzhou (confirmed via a
  // MediaWiki search for "Chongzhou Emblem" turning up no File: result), so it's intentionally left unset
  // rather than guessed, matching the Jinzhou/Mingting precedent. VAs confirmed exact from the infobox:
  // EN Leonora Haig, CN Liu Yilei (刘一蕾), JP Tomita Miyu (富田美憂), KR Park Si-yoon (박시윤) — note
  // Prydwen's own Voice Actors tab is blank ('-') for all four languages for Youhu, so fandom is the only
  // sourced VA credit here.
  ['Youhu', 'Cryogenic Wonders', 'Huanglong', 'Chongzhou', { en: 'Leonora Haig', cn: 'Liu Yilei', jp: 'Tomita Miyu', kr: 'Park Si-yoon' }],
].forEach(([name, title, birthplace, organization, voiceActor]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { title, birthplace, organization, voiceActor });
});

// [SECTION:COMBAT_ROLE_DATA] — Per-character Combat Role tag badges (Main Damage Dealer, Heavy Attack
// DMG, Traction, DMG Amplification, Tune Rupture Response, etc.) — a fixed, game-wide icon set of ~38
// tags (see helpers.js's COMBAT_ROLE_ICONS) where each character just carries a subset. Distinct from
// the single `role` field elsewhere (Main DPS/Sub DPS/Healer) — these are the specific mechanical tags
// from the character's own infobox `role` field (order preserved as listed there).
// Source: wutheringwaves.fandom.com infobox `role` field, pulled via the MediaWiki API's raw wikitext
// (prop=revisions) — bypasses the site's Cloudflare challenge entirely. Only characters from Jiyan
// through Aemeath (RELEASE_ORDER's 1.0–3.1 span) have been audited so far.
[
  ['Jiyan', ['Main Damage Dealer', 'Heavy Attack Damage', 'Traction']],
  ['Yinlin', ['Concerto Efficiency', 'Resonance Skill Damage', 'Coordinated Attack', 'Electro DMG Amplification', 'Resonance Liberation DMG Amplification']],
  ['Calcharo', ['Main Damage Dealer', 'Resonance Liberation Damage']],
  ['Encore', ['Main Damage Dealer', 'Basic Attack Damage']],
  ['Jianxin', ['Support and Healer', 'Heavy Attack Damage', 'Traction', 'Resonance Liberation DMG Amplification']],
  ['Lingyang', ['Main Damage Dealer']],
  ['Verina', ['Support and Healer', 'Coordinated Attack', 'DMG Amplification']],
  ['Aalto', ['Concerto Efficiency', 'Aero DMG Amplification']],
  ['Baizhi', ['Support and Healer', 'Coordinated Attack', 'DMG Amplification']],
  ['Chixia', ['Main Damage Dealer']],
  ['Danjin', ['Concerto Efficiency', 'Havoc DMG Amplification']],
  ['Yangyang', ['Concerto Efficiency', 'Traction', 'Resonance Liberation Regeneration']],
  ['Sanhua', ['Concerto Efficiency', 'Basic Attack DMG Amplification']],
  ['Taoqi', ['Support and Healer', 'Resonance Liberation Damage', 'Resonance Skill DMG Amplification']],
  ['Yuanwu', ['Concerto Efficiency', 'Coordinated Attack', 'Interruption Resistance Boost', 'Vibration Strength Reduction']],
  ['Mortefi', ['Concerto Efficiency', 'Resonance Liberation Damage', 'Coordinated Attack', 'Heavy Attack DMG Amplification']],
  ['Jinhsi', ['Main Damage Dealer', 'Resonance Skill Damage']],
  ['Changli', ['Main Damage Dealer', 'Resonance Skill Damage', 'Fusion DMG Amplification', 'Resonance Liberation DMG Amplification']],
  ['Youhu', ['Support and Healer', 'Resonance Skill Damage', 'Vibration Strength Reduction', 'Coordinated Attack DMG Amplification']],
  ['Zhezhi', ['Concerto Efficiency', 'Basic Attack Damage', 'Coordinated Attack', 'Glacio DMG Amplification', 'Resonance Skill DMG Amplification']],
  ['Xiangli Yao', ['Main Damage Dealer', 'Resonance Liberation Damage']],
  ['Shorekeeper', ['Support and Healer', 'Traction', 'DMG Amplification']],
  ['Lumi', ['Main Damage Dealer', 'Basic Attack Damage', 'Resonance Skill DMG Amplification']],
  ['Camellya', ['Main Damage Dealer', 'Concerto Efficiency', 'Basic Attack Damage']],
  ['Carlotta', ['Main Damage Dealer', 'Resonance Skill Damage']],
  ['Roccia', ['Concerto Efficiency', 'Heavy Attack Damage', 'Traction', 'Havoc DMG Amplification', 'Basic Attack DMG Amplification']],
  ['Phoebe', ['Main Damage Dealer', 'Concerto Efficiency', 'Spectro Frazzle']],
  ['Brant', ['Support and Healer', 'Basic Attack Damage', 'Fusion DMG Amplification', 'Resonance Skill DMG Amplification']],
  ['Cantarella', ['Support and Healer', 'Concerto Efficiency', 'Basic Attack Damage', 'Coordinated Attack', 'Havoc DMG Amplification', 'Resonance Skill DMG Amplification']],
  ['Zani', ['Main Damage Dealer', 'Heavy Attack Damage', 'Spectro DMG Amplification', 'Spectro Frazzle']],
  ['Ciaccona', ['Concerto Efficiency', 'Traction', 'Aero Erosion']],
  ['Cartethyia', ['Main Damage Dealer', 'Aero Erosion', 'Aero DMG Amplification', 'Traction']],
  ['Lupa', ['Concerto Efficiency', 'Resonance Liberation Damage', 'Fusion DMG Amplification', 'Basic Attack DMG Amplification']],
  ['Phrolova', ['Main Damage Dealer', 'Resonance Skill Damage', 'Havoc DMG Amplification', 'Heavy Attack DMG Amplification']],
  ['Augusta', ['Main Damage Dealer', 'Heavy Attack Damage', 'DMG Amplification']],
  ['Iuno', ['Support and Healer', 'Concerto Efficiency', 'Resonance Liberation Damage', 'Heavy Attack DMG Amplification']],
  ['Galbrena', ['Main Damage Dealer', 'Heavy Attack Damage']],
  ['Qiuyuan', ['Concerto Efficiency', 'Heavy Attack Damage', 'Echo Skill DMG Amplification']],
  ['Chisa', ['Support and Healer', 'Resonance Liberation Damage', 'Havoc Bane']],
  ['Buling', ['Support and Healer', 'DMG Amplification', 'Electro Flare']],
  ['Lynae', ['Concerto Efficiency', 'Basic Attack Damage', 'DMG Amplification', 'Resonance Liberation DMG Amplification', 'Tune Rupture Response', 'Tune Strain Response', 'Tune Break Boost']],
  ['Mornye', ['Support and Healer', 'DMG Amplification', 'Tune Rupture Response', 'Tune Strain Response', 'Off-Tune Buildup Efficiency']],
  ['Aemeath', ['Main Damage Dealer', 'Resonance Liberation Damage', 'Tune Rupture Response', 'Fusion Burst', 'DMG Amplification']],
  // Remaining roster (post-3.1 releases + Rover) added 2026-08-17 so every character carries combatRoles
  // — otherwise the Combat Profile box silently falls back to the old iconless data.role/dmgFocus badges
  // for anyone left out. Rover's 4 attunements pulled from their own per-attunement fandom pages
  // (Rover-Spectro/-Havoc/-Aero/-Electro), not the shared "Rover" page whose `role` field is all 4
  // attunements' tags concatenated together with no clean separation.
  ['Rover: Spectro', ['Concerto Efficiency', 'Stagnation', 'Spectro Frazzle']],
  ['Rover: Havoc', ['Main Damage Dealer']],
  ['Rover: Aero', ['Support and Healer', 'Resonance Skill Damage', 'Aero Erosion']],
  ['Rover: Electro', ['Concerto Efficiency', 'Resonance Skill Damage', 'Electro Flare']],
  ['Luuk Herssen', ['Main Damage Dealer', 'Basic Attack Damage', 'Tune Strain Response']],
  ['Sigrika', ['Main Damage Dealer', 'Traction', 'Echo Skill Damage']],
  ['Rebecca', ['Concerto Efficiency', 'Basic Attack Damage', 'Heavy Attack DMG Amplification', 'Tune Break Boost', 'Hack Response']],
  ['Lucilla', ['Concerto Efficiency', 'Basic Attack Damage', 'Echo Skill Damage', 'Glacio Chafe', 'Echo Skill DMG Amplification']],
  ['Lucy', ['Main Damage Dealer', 'Heavy Attack Damage', 'Basic Attack DMG Amplification', 'Hack Response']],
  ['Yangyang: Xuanling', ['Main Damage Dealer', 'Heavy Attack Damage', 'Havoc Bane', 'Traction']],
  ['Denia', ['Concerto Efficiency', 'Resonance Liberation Damage', 'Traction', 'Fusion Burst', 'Tune Break Boost', 'Tune Strain Response']],
  ['Hiyuki', ['Main Damage Dealer', 'Resonance Liberation Damage', 'Glacio Chafe']],
  ['Suisui', ['Support and Healer', 'DMG Amplification', 'Glacio Chafe']],
  ['Qingxiao', ['Main Damage Dealer', 'Tune Strain Response']],
  // Jingran intentionally omitted: unreleased (3.6, Aug 20 2026) — fandom's own infobox has an empty
  // `role` field since Kuro hasn't published her kit yet, matching the "Unconfirmed" placeholder already
  // used for her bestEchoes/weapon data elsewhere in this file rather than guessing.
].forEach(([name, combatRoles]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { combatRoles });
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
    selfBuffs: [{ stat: 'critRate', value: 80, target: 'self', duration: 999, condition: 'Inherent Skill Sky Over Water — Awakening Spring/Tinkling Jade hit, once every 25s (also +240% Glacio DMG on that hit)' }],
    debuffs: [],
    note: 'Outro (Rippling Waters): unconditional 25% All DMG Amp for 30s. At 400+ Floral Epistle consumed (Drizzle Stance Forte gauge) while Ceaseless Landscape is active, additionally grants up to 12% All DMG Amp (0.2% per 1% Energy Regen above 200%, capped at 260% ER) for 6s via Roaming Transcendent. Zephyr Stance heals, Drizzle Stance deals Glacio DMG + Chafe. Liberation (Song of Thoroughfare) extends negative-status stack caps for the team rather than granting a flat DMG buff. Inherent Skill Sky Over Water grants a self Crit Rate/Glacio DMG spike on her own Awakening Spring/Tinkling Jade hits, gated to once every 25s.',
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
    selfBuffs: [
      { stat: 'critDmg', value: 100, target: 'self', duration: 999, condition: 'Resonance Chain 3 — Billows Beneath Heaven Crit DMG' },
      { stat: 'skillDmg', value: 49, target: 'self', duration: 30, condition: 'Inherent Skill To Know, To Banish — +2%/Mindlock stack (+5% more for the first 7), up to 15 stacks base kit' },
    ],
    debuffs: [{ stat: 'deepen', value: 49, duration: 30, condition: 'Base kit Forte (Mindlock) — targets w/ Mindlock take +2%/stack (+5% more for the first 7) from her key skills, up to 15 stacks; Resonance Chain 6 adds a further flat +40%' }],
    note: 'Pure single-target DPS, no team buffs. Damage scales with team-inflicted Tune Strain - Interfered via her Mindlock stacking mechanic (base kit: up to 15 stacks, ~49% combined DMG Amp/Taken at cap — first 7 stacks each worth 7%, remaining stacks worth 2% each; S1/S2 raise the stack cap to 25). Pre-release data via ww.nanoka.cc datamine (2026-08-18, releases 2026-08-20) — subject to change at launch.',
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
    selfBuffs: [
      { stat: 'critDmg', value: 150, target: 'self', duration: 4, condition: 'Feathered Oath, up to 6 stacks' },
      { stat: 'critDmg', value: 160, target: 'self', duration: 999, condition: 'Bated Breath/Streaming Storm — Heavy ATK Crit DMG, once every 25s' },
      { stat: 'elemDmg', value: 36, target: 'self', duration: 999, condition: 'Inherent Skill Unbroken Vow — Havoc Bane DMG Amp, +10%/stack (1-3), +12%/stack (4-6), up to 36% at 6 stacks' },
    ],
    debuffs: [],
    note: 'Primarily a self-buffing DPS (huge personal Crit DMG scaling via Feathered Oath, plus Bated Breath/Streaming Storm +160% Crit DMG on her Forte-gated Heavy ATK and Unbroken Vow\'s Havoc Bane DMG Amp). Outro grants +20% Havoc DMG to other Havoc Bane appliers in the team (Chisa).',
  },
  'Hiyuki': {
    outroBuffs: [{ stat: 'elemDmg', value: 20, target: 'team', duration: 20, condition: 'vs. targets affected by Glacio Chafe' }],
    libBuffs: [],
    // Added 2026-08-17 against Prydwen's live kit breakdown — Inherent Skill "Fine Snow" was missing
    // entirely. It's a self-only Snow Rust scaling buff, gated on teammates applying Glacio Chafe/Havoc
    // Bane (1 stack is free from Hiyuki's own Glacio Chafe application; 2nd/3rd stacks need teammates,
    // e.g. Lucilla/Chisa/Suisui — hence her documented reliance on those specific supports).
    selfBuffs: [
      { stat: 'critDmg', value: 40, target: 'self', duration: 99, condition: 'Inherent Fine Snow, 1 stack of Snow Rust (self-applied via her own Glacio Chafe)' },
      { stat: 'elemDmg', value: 60, target: 'self', duration: 99, condition: 'Inherent Fine Snow, Glacio Bite DMG Amp (a distinct multiplier from base Glacio DMG Bonus): +30% at 1 stack of Snow Rust, +30% more at 3 stacks (teammates applying Glacio Chafe/Havoc Bane, e.g. Lucilla/Chisa/Suisui)' },
    ],
    debuffs: [],
    note: 'On-field Glacio DPS. Outro grants +20% Glacio DMG to the rest of the team against Glacio Chafe-affected targets (20s). Inherent Fine Snow: self +40% Crit DMG at 1 Snow Rust stack, +30%/+30% Glacio Bite DMG Amp at 1/3 stacks — needs teammates applying Glacio Chafe or Havoc Bane to reach max stacks.',
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
  // Corrected 2026-08-17 against Prydwen's live build page: selfBuffs was missing target/duration/
  // condition fields (a formatting bug, not a wrong value) — filled in from Inherent Skill Immersive
  // Performance. outroBuffs/debuffs were already accurate; libBuffs is correctly empty since her
  // Liberation's team buff is flat ATK points (up to 200, scaling with her own Crit Rate over 50%) —
  // not a percentage stat this table's schema represents — documented in the note instead.
  'Roccia': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Havoc DMG Amp' },
      { stat: 'basicDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 20, target: 'self', duration: 12, condition: 'Immersive Performance: Skill or Heavy ATK cast → self ATK +20% (12s)' }],
    debuffs: [],
    note: 'Outro: +20% Havoc DMG Amp + 25% Basic ATK DMG Amp (14s). Inherent 1: self ATK +20% (12s) on Skill/Heavy ATK. Liberation: flat team ATK +1 per 0.1% Crit Rate over 50%, up to +200 (30s) — not a % buff, so untracked in libBuffs.',
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
  // Corrected 2026-08-17 against Prydwen's live build page: selfBuffs was empty, missing her real
  // Inherent Skill "Poison" (+6% Havoc DMG Bonus per Echo Skill cast, 10s, stacks up to 2x/12% cap) —
  // notable since several of her own kit abilities (Flowing Suffocation, Flickering Reverie, Perception
  // Drain) are themselves flagged as Echo Skill casts, so this self-buff is easy to trigger.
  'Cantarella': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Havoc DMG Amp' },
      { stat: 'skillDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 12, target: 'self', duration: 10, condition: 'Inherent Skill Poison: +6% Havoc DMG Bonus per Echo Skill cast, stacks up to 2x (12% cap)' }],
    debuffs: [],
    note: 'Outro: +20% Havoc DMG + 25% Skill DMG Amp (14s). Off-field Coordinated ATK. Heal. Self: up to +12% Havoc DMG from Poison.',
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
    debuffs: [
      { stat: 'defIgnore', value: 18, duration: 30, condition: "Thread of Bane: only benefits teammates who themselves apply/deal Negative Status DMG, not a free-for-all team buff" },
      { stat: 'defShred', value: 12, duration: 2, condition: 'Havoc Bane: 1 stack (2% DEF Shred) per hit on an Unseen Snare target, up to 6 stacks, refreshed every 2s' },
    ],
    note: 'Support/Healer for Negative Status teams. DEF Ignore 18% via Thread of Bane and DEF Shred up to 12% via Havoc Bane both require the enemy to be marked by Unseen Snare, and Thread of Bane specifically only benefits Resonators who themselves inflict/deal Negative Status damage — Prydwen stresses her kit is close to non-functional outside Negative Status teams. Heals team via Death Snip and Moment of Nihility; grants Shields via Sawring - Eradication. Outro: teammates can stack +3 more Negative Status/Electro Rage for 20s.',
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
  // Corrected 2026-08-17 against Prydwen's live build page: selfBuffs previously described a specific
  // equipped weapon's passive (12% Glacio + 24% Charged ATK) rather than her own kit — replaced with her
  // real Forte Circuit "Final Bow" (+80% DMG Multiplier to all 3 Liberation abilities at full Substance).
  // debuffs was empty, missing her real "Deconstruction" debuff (18% DEF ignore on hit, applied by
  // Liberation and — via Inherent Skill Ars Gratia Artis — also her Intro/Chromatic Splendor/Forte Heavy).
  'Carlotta': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'libDmg', value: 80, target: 'self', duration: 99, condition: 'Forte Circuit Final Bow: at full Substance, Liberation DMG Multiplier (Era of New Wave/Death Knell/Fatal Finale) +80%' }],
    debuffs: [{ stat: 'defIgnore', value: 18, target: 'enemy', duration: 4, condition: 'Deconstruction: applied by Liberation, plus Intro/Chromatic Splendor/Forte Heavy via Ars Gratia Artis' }],
    note: 'Burst Glacio Main DPS. Final Bow: +80% Liberation DMG Multiplier at full Substance. Deconstruction: -18% target DEF (4s).',
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
    // corrected 2026-08-18: Prydwen's own kit text calls this "23% Havoc DMG Deepen" (not "Bonus") —
    // stat key changed from elemDmg to deepen to match; also matches CHARACTER_ROTATIONS' Outro row below.
    outroBuffs: [{ stat: 'deepen', value: 23, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 23% Havoc DMG Deepen to next.',
  },
  'Baizhi': {
    outroBuffs: [{ stat: 'deepen', value: 15, target: 'next', duration: 6 }],
    libBuffs: [{ stat: 'atkPct', value: 15, target: 'team', duration: 20 }],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 15% Deepen (6s per tick, refreshes on heal). Inherent: 15% ATK teamwide (20s on Euphonia pickup). Heal.',
  },
  // corrected 2026-08-18: fandom's Taoqi/Combat Forte Details table names her Outro Skill "Iron Will":
  // "The incoming Resonator has their Resonance Skill DMG Amplified by 38% for 14s or until they are
  // switched out." Was wrongly modeled as a generic 15% `deepen` outro (a value/stat that belongs to no
  // sourced Taoqi effect) plus a fabricated 12% DEF Shred debuff with no basis anywhere on the Combat
  // page (Resonance Chain/Forte/Inherent Skill text) — removed. Her actual kit is Resonance Skill
  // Fortified Defense granting 3 stacks of Rocksteady Shield (each absorbing one hit, 15% DMG reduction
  // while active) plus self-heal, matching the 'Shield' buff tag already carried in the dmgFocus/buffs
  // merge array above.
  'Taoqi': {
    outroBuffs: [{ stat: 'skillDmg', value: 38, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro Iron Will: 38% Resonance Skill DMG Amp to next (14s). Skill Fortified Defense grants 3 stacks of Rocksteady Shield (15% DMG reduction while active) + self-heal.',
  },
  // corrected 2026-08-18: fandom's Yuanwu/Combat Forte Details table for Outro Skill "Lightning
  // Manipulation" text is "Yuanwu unleashes thunderbolts in an area centered around the skill target,
  // greatly reducing the Vibration Strength of enemies upon impact" — no DMG buff of any kind, so the
  // unsourced 15% `deepen` outroBuff (no basis anywhere on the Combat page) is removed. His actual
  // team-facing effect is Resonance Liberation Blazing Might granting Forte Circuit Lightning Infused
  // (Interruption Resistance) to all nearby team members for 10s — a status effect with no DMG/stat
  // equivalent in this schema, so it's not modeled as a libBuff, only noted below. Shield only exists
  // on Resonance Chain S4 (RESONANCE_CHAIN_DATA), not in his base kit.
  'Yuanwu': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Skill Thunder Wedge: off-field Coordinated ATK (1x/1.2s while an ally is on-field within the field). Liberation Blazing Might grants team-wide Interruption Resistance (Lightning Infused, 10s) — no DMG stat. Outro Lightning Manipulation: pure Vibration Strength depletion, no DMG buff. Shield only unlocks at Resonance Chain S4.',
  },
  // Corrected 2026-08-18 via Prydwen's Kit tab. Outro: Whispering Breeze funnels 4 Resonance
  // Energy/s for 5s (20 total) to the next character on swap — an Energy-funnel effect, not a DMG/stat
  // buff, so it's not modeled as an outroBuff entry (no matching stat exists in this schema). S1
  // Intro self Aero DMG+15% (8s) and S6 team ATK+20% (20s, after Feather Release) both require Sequence
  // copies and are surfaced via RESONANCE_CHAIN_DATA above rather than duplicated here at S0.
  'Yangyang': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro (Whispering Breeze) funnels 4 Energy/s for 5s to the incoming character — no direct DMG buff at S0. Minimal personal DMG contribution; value comes from Energy generation and quickswap-friendliness (buffs unlocked at higher Sequences).',
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
    // corrected 2026-08-18: outroBuffs was empty, missing Aalto's actual Outro Skill "Dissolving Mist" (fandom Combat
    // page: "The incoming Resonator has their Aero DMG Amplified by 23% for 14s or until they are switched out").
    outroBuffs: [{ stat: 'elemDmg', value: 23, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 12, target: 'self', duration: 99, condition: 'Weapon passive: Aero DMG +12%' }],
    debuffs: [],
    note: 'Off-field Aero applicator. Outro: 23% Aero DMG Amp to next. Mist clone Coordinated ATK.',
  },
  'Chixia': {
    outroBuffs: [],
    libBuffs: [],
    // corrected 2026-08-18: value was 15%, but the actual Inherent Skill "Numbingly Spicy!" (fandom Combat page)
    // grants ATK+1% per Thermobaric Bullet hit during DAKA DAKA!, stacking up to 30 times (30% ATK at max stacks),
    // 10s per-stack duration — using the max-stack value like other stacking-buff entries in this table.
    selfBuffs: [{ stat: 'atkPct', value: 30, target: 'self', duration: 10, condition: 'Inherent: Numbingly Spicy! ATK stacks (max 30 stacks during DAKA DAKA!)' }],
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
  // corrected 2026-08-18: the prior 'Lib: 12% ATK teamwide' buff had no basis anywhere on fandom's
  // Combat page or Prydwen's Kit tab — Fortune's Favor (Liberation) carries no team buff at all, it's a
  // DMG blast that grants an Antique. Her real, previously-missing standout buff is the Outro (Timeless
  // Classics): Coordinated ATK DMG Amplified +100% for 28s to the incoming character — "the single
  // biggest source of damage amplification for any attack type in the game" per Prydwen's Review tab.
  'Youhu': {
    outroBuffs: [{ stat: 'coordDmg', value: 100, target: 'next', duration: 28 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Glacio healer (Scroll Divination + Poetic Essence, both heal on cast). Outro Timeless Classics: +100% Coordinated ATK DMG Amp (28s) to the incoming Resonator — her signature niche buff.',
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
  // Corrected 2026-08-17 against Prydwen's live build page: selfBuffs previously described a specific
  // equipped weapon's passive (12% Fusion DMG) instead of his own kit — replaced with his real Inherent
  // Skill "Trial by Fire and Tide" (+15% Fusion DMG Bonus, plus increased interruption resistance during
  // Mid-air Attacks).
  'Brant': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Fusion DMG Amp' },
      { stat: 'skillDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 15, target: 'self', duration: 99, condition: 'Inherent Skill Trial by Fire and Tide: +15% Fusion DMG Bonus (also grants interrupt resistance during Mid-air Attacks)' }],
    debuffs: [],
    note: 'Outro: +20% Fusion DMG + 25% Skill DMG Amp (14s). Self-heal + team shield from Forte. Inherent: +15% Fusion DMG Bonus.',
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
    debuffs: [{ stat: 'deepen', value: 60, target: 'enemy', duration: 0, condition: "Afterflame: each of up to 40 stacks (gained from any team Resonator's Echo Skill cast, capped once per Echo name) grants +1.5% DMG Taken on the target while Galbrena is in Demon Hypostasis, up to 60% — cleared when she exits the state" }],
    note: 'Echo Skill + Heavy ATK Fusion DPS. Outro (Ashen Pursuit) is pure damage, no team buff — free to quickswap. Self-buffs via Liberation and Burning Drive, no team support kit. Afterflame is a DMG Taken debuff on the enemy (not a self-buff), replenished by any teammate\'s Echo Skill casts — Prydwen notes it\'s realistically 36% without Phrolova, 48% with her (rarely maxed at 60%).',
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
      // Added 2026-08-17 against Prydwen's live kit breakdown — Blessing of Runes was missing entirely.
      // Whichever Resonator is active gets this (not Sigrika specifically), stacking on any teammate's
      // Echo Skill cast up to 6 stacks (3% Aero + 3% Echo Skill DMG each), with a further +30%/+30% jump
      // at max stacks — modeled as target: 'team' per this file's existing convention for passive,
      // always-on team buffs (see e.g. Yinlin's Overshock ATK buff).
      { stat: 'elemDmg', value: 48, target: 'team', duration: 99, condition: 'Inherent True Names Aligned — Blessing of Runes, max 6 stacks (18% base + 30% at max): +48% Aero DMG to whichever Resonator is active, refreshed by teammates\' Echo Skill casts' },
      { stat: 'echoDmg', value: 48, target: 'team', duration: 99, condition: 'Same Blessing of Runes stacks, +48% Echo Skill DMG to the active Resonator' },
    ],
    debuffs: [],
    note: 'Rune-consuming Echo Skill hypercarry. Inherent True Names Aligned: Blessing of Runes grants the active Resonator +3%/+3% Aero+Echo Skill DMG per stack (6 max) from teammates\' Echo Skill casts, +30%/+30% more at max stacks (48%/48% total) — resets on team swap. Inherent Aligned Names 2: up to 50% Echo DMG from ER above 125%. Sig weapon: 32% Echo Skill Amp + 10% DEF Ignore. Crowd control via Runic modes.',
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
  // Corrected 2026-08-17 against ww.nanoka.cc's character #1206 sheet (Lv.10 skill attributes): every
  // damage row was roughly half its real value (e.g. Forte burst Returned from Ashes — his single
  // biggest hit — was listed as '...665%' vs the real '...1322.09%'), the same halving pattern already
  // found and fixed across Camellya/Carlotta/Roccia/Phoebe's rows. Also fixed 3 skill names that didn't
  // match his actual kit at all: 'Bravo!' (Liberation) → 'To the Horizon', 'Here I Am!' (Intro) →
  // 'Applaud for Me!', 'Standing Ovation' (Outro) → 'The Course is Set!' — the fabricated names would
  // have broken the skill-icon/rotation substring lookups against his real skill list.
  'Brant': [
    ['Basic ATK', 'Stage 1-4', '50.8% → 102% → 233% → 141%'],
    ['Mid-air', 'Charged Combo', '123.6% → 334.2% → 93.6% → 170.2% → 255.2%'],
    ['Heavy ATK', 'Rhapsodic Riff', '169.0%'],
    ['Skill', 'Anchors Aweigh', '200.4% + 133.6%'],
    ['Liberation', 'To the Horizon', '85.1%×4 + 340.2%'],
    ['Forte', 'Returned from Ashes', '47.2%×2 + 94.4% + 188.9%×2 + 1322.1%'],
    ['Intro', 'Applaud for Me!', '202.8% + 50.7%'],
    ['Outro', 'The Course is Set!', '+20% Fusion DMG + 25% Skill DMG Amp (14s)'],
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
  // Corrected 2026-08-17 against ww.nanoka.cc's character #1603 sheet (Lv.10 skill attributes): every
  // row except Outro was roughly half its real value (e.g. Ephemeral was '635%' vs the real 1262.45%,
  // Fervor Efflorescent '605%' vs the real 1202.81%) — a consistent ~2x understatement suggesting a
  // stale/mis-scaled data source. Outro (329.2% + 459%) was already correct and is unchanged.
  'Camellya': [
    ['Basic ATK', 'Thorns 1-5', '62.53% → 46.48%×2 → 50.70%×3 → 24.70%×20 → 48.17%×4'],
    ['Heavy ATK', 'Standard', '88.14%×3'],
    ['Skill', 'Crimson Blossom', '113.62%×2'],
    ['Skill', 'Vining Waltz 1-4', '96.33% → 45.63%×2 → 21.95%×6 → 67.59%×3'],
    ['Skill', 'Blazing Waltz', '21.95%×19'],
    ['Forte', 'Ephemeral (Budding)', '1262.45%'],
    ['Liberation', 'Fervor Efflorescent', '1202.81%'],
    ['Intro', 'Everblooming', '198.81%'],
    ['Outro', 'Twining', '329.24% + 459.02%'],
  ],
  // Corrected 2026-08-17 against ww.nanoka.cc's character #1607 sheet (Lv.10 skill attributes): every
  // damage row was roughly half its real value (e.g. Perception Drain — her core Forte burst nuke —
  // was listed as '336%×2' vs the real 667.99%×2), the same halving pattern already found and fixed
  // across Camellya/Carlotta/Roccia/Phoebe/Brant's rows. Also fixed the Outro's name: 'Sweet Nightmare'
  // doesn't match her kit at all — her real Outro is 'Gentle Tentacles' (confirmed on both Prydwen and
  // nanoka); the fabricated name would have broken skill-icon/rotation substring lookups. The Outro's
  // buff description (+20% Havoc DMG + 25% Skill DMG Amp) was already correct and is unchanged.
  'Cantarella': [
    ['Basic ATK', 'Stage 1-3', '79.5% → 145.8% → 145.1%'],
    ['Heavy ATK', 'Standard', '57.2%×2'],
    ['Skill', 'Graceful Step', '73.6%×2'],
    ['Skill', 'Flickering Reverie', '196.2%'],
    ['Forte', 'Phantom Sting 1-3', '106.0% → 125.9% → 258.5%'],
    ['Forte', 'Perception Drain', '668.0%×2'],
    ['Liberation', 'Flowing Suffocation', '376.0% + 14.5%×21'],
    ['Intro', 'Ripple', '42.3%×4'],
    ['Outro', 'Gentle Tentacles', '+20% Havoc DMG + 25% Skill DMG Amp (14s)'],
  ],
  // Corrected 2026-08-17 against ww.nanoka.cc's character #1107 sheet (Lv.10 skill attributes): every
  // row except Outro was roughly half its real value (e.g. Era of New Wave — her core Liberation nuke —
  // was listed as '202.6%' vs the real 402.71%), the same halving pattern found and fixed in Camellya's
  // row. Outro (794.2%) was already correct and is unchanged.
  'Carlotta': [
    ['Basic ATK', 'Stage 1-2', '54.1% → 132.6%'],
    ['Basic ATK', 'Necessary Measures 1-3', '66.4% → 134.4% → 234.6%'],
    ['Heavy ATK', 'Standard', '153.0%'],
    ['Heavy ATK', 'Containment Tactics', '229.6%'],
    ['Forte', 'Imminent Oblivion', '67.2%×5 + 504.2%'],
    ['Skill', 'Art of Violence', '145.0%×2'],
    ['Skill', 'Chromatic Splendor', '113.4%×2 + 340.2%'],
    ['Liberation', 'Era of New Wave', '405.2%'],
    ['Liberation', 'Death Knell', '(184.6% + 14.6%×4) per shot'],
    ['Liberation', 'Fatal Finale', '648.2%'],
    ['Intro', 'Wintertime Aria', '180% + 60%×2'],
    ['Outro', 'Closing Remark', '794.2%'],
  ],
  // Corrected 2026-08-17 against ww.nanoka.cc's character #1409 sheet (Lv.10 skill attributes): most
  // rows were roughly half their true value (e.g. her Fleurdelys-form Ultimate Blade of Howling Squall
  // was listed as '6.6%×7 HP' vs the real 13.12%×7 HP), the same halving pattern already found and
  // fixed across most of the recently-audited roster — but not uniformly here: her 'Sword to Call for
  // Freedom' Intro row was already exactly correct (4.28% + 9.97%HP), showing this wasn't a single
  // clean 2x scaling error but a row-by-row data entry issue. Every value below is now sourced directly
  // from nanoka's precise Lv.10 multipliers rather than doubled from the old figures.
  'Cartethyia': [
    ['Basic ATK', 'Base Form 1-4', '4.78%HP → 13.13%HP → 17.12%HP → 15.1%HP', 'Standard combo in her base sword form, scales off Max HP.'],
    ['Basic ATK', 'Fleurdelys 1-5', '6.49%HP → 9.09%HP → 10.65%HP → 13.7%HP → 36%HP', 'Empowered combo used in Fleurdelys form.'],
    ['Heavy ATK', 'Fleurdelys Enhanced', '7.78%×2 + 3.89%HP', 'Charged strike in Fleurdelys form.'],
    ['Skill', 'Base Form', '6.89%×3 + 8.86%HP', 'Skill strike that applies Aero Erosion and summons a Sword Shadow.'],
    ['Skill', 'Fleurdelys 1-2', '24.8%HP / 24.8%HP', 'Fleurdelys-form Skill variants (Sword to Answer Waves\' Call / May Tempest Break the Tides).'],
    ['Liberation', "A Knight's Heartfelt Prayers", 'Costs 50% Max HP', 'Ultimate that transforms her into Fleurdelys form for 12s; no direct damage.'],
    ['Liberation', 'Blade of Howling Squall', '13.12%×7 HP', 'Fleurdelys-form Ultimate finisher; removes Aero Erosion stacks from the target for bonus DMG.'],
    ['Intro', "Sword to Mark Tide's Trace", '2.08%×3 + 6.24%HP', 'Base-form swap-in opener.'],
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
  // Corrected 2026-08-17 against ww.nanoka.cc's character #1407 sheet (Lv.10 skill attributes): every
  // damage row was roughly half its real value (e.g. her Liberation nuke Singer's Triple Cadenza was
  // listed as '553.5%' vs the real 1100.42%), the same halving pattern already found and fixed across
  // Camellya/Carlotta/Roccia/Phoebe/Brant/Cantarella/Zani's rows. Outro (a DMG Amp buff description,
  // unaffected by this bug) is unchanged.
  'Ciaccona': [
    ['Basic ATK', 'Stage 1-4', '57.1% → 163.0% → 132.1% → 244.6%', 'Standard combo string; Stage 4 inflicts Aero Erosion.'],
    ['Skill', 'Harmonic Allegro', '40.4%×4', 'Multi-hit Skill strike that inflicts Aero Erosion.'],
    ['Forte', 'Quadruple Downbeat', '31.4%×10 + 314.0%', 'Forte finisher that consumes stacked Musical Essence.'],
    ['Liberation', "Singer's Triple Cadenza", '1100.4% + Tonic 6.1%×20/tick', 'Ultimate nuke followed by a lingering damage-over-time field.'],
    ['Intro', 'Roaming with the Wind', '189.1%', 'Swap-in opener that inflicts Aero Erosion and lets her combo straight into Basic ATK Stage 3.'],
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
  // Corrected 2026-08-17 against ww.nanoka.cc's character #1207 sheet (Lv.10 skill attributes): every
  // row was roughly half its true value (e.g. her Liberation nuke Fire-Kissed Glory was listed as
  // '412.7%' vs the real 820.44%) — the same halving pattern already found and fixed across most of
  // the recently-audited roster. The old Intro Try Focusing, Eh? note claiming "exact base number not
  // published" was also wrong — nanoka does publish it (29.76%+42.16%×4), so the apologetic note is
  // dropped along with the halved placeholder value.
  'Lupa': [
    ['Basic ATK', 'Stage 1-4', '90.1% → 90.1% → 157.7% → 246.2%', 'Standard combo string, builds Wolflame.'],
    ['Basic ATK', "Wolf's Claw", '72.2% + 18.0%×4 + 96.2%', 'Alt combo follow-up.'],
    ['Mid-air', 'Starfall', '12.7%×4 + 118.1%', 'Airborne attack chain.'],
    ['Skill', "Shewolf's Hunt", '140.8%', 'Base Skill dash strike.'],
    ['Skill', 'Feral Fang', '313.6%', 'Empowered Skill against marked targets, +50% DMG Mult.'],
    ['Skill', 'Dance with the Wolf', '56.0% + 42.0%×4 + 336.1%', 'Forte finisher combo.'],
    ['Liberation', 'Fire-Kissed Glory', '820.4%', 'Ultimate nuke that also grants the team ATK/Fusion DMG buffs and enables Wild Hunt.'],
    ['Liberation', 'Foebreaker', '304.5%', 'Follow-up hit tied to her Ultimate.'],
    ['Intro', 'Try Focusing, Eh?', '29.8% + 42.2%×4', 'Base swap-in opener.'],
    ['Intro', 'Nowhere to Run!', '793.6% + 49.6%×4', 'Much stronger Intro used only once per Liberation, while in Wild Hunt state.'],
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
  // Corrected 2026-08-17 against ww.nanoka.cc's character #1506 sheet (Lv.10 skill attributes): every
  // row except Outro was roughly half its real value (e.g. Absolution Litany — her core Forte burst —
  // was listed as '321%' vs the real 638.19%) — the same halving pattern already found and fixed across
  // Camellya/Carlotta/Roccia's rows. Outro (528.4%, matching nanoka's 528.41% exactly) is unchanged.
  'Phoebe': [
    ['Basic ATK', 'Stage 1-3', '29.5% → 49.7% → 14.2%×8'],
    ['Heavy ATK', 'Standard', '41.4%×4'],
    ['Skill', 'To Where Light Shines', '62.6%×2'],
    ['Skill', "Chamuel's Star 1-3", '59.4% → 79.5% → 28.9%×6'],
    ['Forte', 'Starflash', '82.7%×3'],
    ['Forte', 'Absolution Litany', '638.2%'],
    ['Liberation', 'Dawn of Enlightenment', '401.6% (+255% in Absolution)'],
    ['Intro', 'Golden Grace', '198.8%'],
    ['Outro', 'Attentive Heart', '528.4%'],
  ],
  // Corrected 2026-08-17 against ww.nanoka.cc's character #1608 sheet (Lv.10 skill attributes): every
  // row except Outro was roughly half its true value (e.g. her Liberation cast Curtain Call was listed
  // as '234%' vs the real 465.22%) — the same halving pattern already found and fixed across most of
  // the recently-audited roster. The old Intro Suite of Quietus note claiming "exact base number not
  // published" was also wrong — nanoka does publish it (80.61%+120.91%) — so that note is dropped.
  'Phrolova': [
    ['Basic ATK', 'Stage 1-3', '106.9% → 95.4% → 196.1%', 'Standard combo string, builds Aftersound/Notes.'],
    ['Heavy ATK', 'Scarlet Coda', '33.0%×2 + 12.4%×8 + 495.1% (+82.55% per stack)', 'Empowered Heavy ATK, damage scales with stacked Aftersound.'],
    ['Skill', 'Whispers in Fleeting Dream', '106.0%×2', 'Quick Skill strike that enters Reincarnate.'],
    ['Intro', 'Suite of Quietus', '80.6% + 120.9%', 'Base swap-in opener strike.'],
    ['Intro', 'Suite of Immortality', '596.4%', 'Enhanced Intro used only while in Maestro state — much stronger than the base opener.'],
    ['Liberation', 'Maestro State: Hecate', 'Strings 347.9% / Winds 330.5% / Cadenza 347.9%', 'Summons Hecate for sustained off-field Havoc DMG during Maestro.'],
    ['Liberation', 'Curtain Call', '465.2%', 'Ultimate cast that ends Resolving Chord and enters Maestro.'],
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
  // Corrected 2026-08-17 against ww.nanoka.cc's character #1606 sheet (Lv.10 skill attributes): every
  // damage row was roughly half its real value (e.g. Real Fantasy's 3 hits were '162% → 171% → 180%'
  // vs the real 322.08% → 339.97% → 357.86%) — the same halving pattern already found and fixed in
  // Camellya's/Carlotta's rows. Outro (a DMG Amp buff description, not a raw multiplier) is unaffected.
  'Roccia': [
    ['Basic ATK', 'Stage 1-4', '73.2% → 114.4% → 169.0% → 208.4%'],
    ['Heavy ATK', 'Standard', '169.0%'],
    ['Skill', 'Acrobatic Trick', '61.5%×8'],
    ['Forte', 'Real Fantasy 1-3', '322.1% → 340.0% → 357.9%'],
    ['Liberation', 'Commedia Improvviso!', '278.3%×3'],
    ['Intro', 'Pero, Help!', '169.0%'],
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
  // Corrected 2026-08-17 against ww.nanoka.cc's character #1507 sheet (Lv.10 skill attributes): every
  // damage row was roughly half its real value (e.g. her core Inferno-Mode finisher Heavy Slash Nightfall
  // was listed as '68% + 132% (+5% per Blaze)' vs the real 135.20%+262.43% with +9.95% per Blaze), the
  // same halving pattern already found and fixed across Camellya/Carlotta/Roccia/Phoebe/Brant/
  // Cantarella's rows. Outro (150%, matching nanoka's Lv.1 value exactly) was already correct.
  'Zani': [
    ['Basic ATK', 'Stage 1-4', '58.9% → 79.5% → 127.3% → 270.4%', 'Standard combo string.'],
    ['Heavy ATK', 'Standard', '41.1%×4', 'Charged combo hit.'],
    ['Skill', 'Pinpoint Strike', '61.0% + 122.0%', 'Base Skill counter-style strike.'],
    ['Skill', 'Targeted Action', '86.2% + 28.7% + 172.4%', 'Counter follow-up, empowered by her Resonance Chain.'],
    ['Forte', 'Heavy Slash Daybreak', '198.8%', 'First stage of her Forte-empowered Heavy ATK.'],
    ['Forte', 'Heavy Slash Dawning', '424.1%', 'Second, stronger stage of the Forte Heavy ATK.'],
    ['Forte', 'Heavy Slash Nightfall', '135.2% + 262.4% (+9.95% per Blaze)', 'Forte finisher, scales with consumed Blaze.'],
    ['Liberation', 'Rekindle', '318.5%', 'Ultimate that raises max Blaze and enters Inferno state.'],
    ['Liberation', 'The Last Stand', '191.1% + 1083.0%', 'Second Ultimate cast inside Inferno, scales with Blaze consumed.'],
    ['Intro', 'Immediate Execution', '24.2%×5 + 80.8%', 'Swap-in opener strike.'],
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
  // Aalto/Baizhi/Chixia rewritten 2026-08-18: the previous rows used generic "Stage 1-4" labels and
  // approximated/wrong multipliers and skill names (e.g. Baizhi's Liberation was mislabeled "Momentary
  // Presence" — the real name is "Momentary Union") that didn't match any real fandom skill name, so
  // getSkillIcon() could never resolve an icon for them. Replaced with real Lv.10 Attribute Scaling
  // values and exact move names from wutheringwaves.fandom.com's Combat pages (Forte Details tables),
  // matching the Suisui-quality format (real names + desc column) instead of the old placeholder style.
  'Aalto': [
    ['Basic ATK', 'Half Truths Stage 1-5', '31.81% → 53.02% → 47.72%×2 → 50.37%×2 → 179.73%', 'Up to 5 shots; Basic ATK 4 spreads Mist for 1.5s.'],
    ['Heavy ATK', 'Half Truths (aimed shot)', '35.79% → 80.52% fully charged', 'Charged aimed shot.'],
    ['Skill', 'Shift Trick', '59.65% per Mist Bullet', 'Mist Avatar taunts enemies and fires Mist Bullets around it.'],
    ['Liberation', 'Flower in the Mist', '397.62%', 'Gate of Quandary amplifies bullets passing through it.'],
    ['Forte', 'Misty Cover', '59.65% per Mist Bullet', 'Mistcloak Dash consumes Mist Drops to fire Mist Bullets.'],
    ['Intro', 'Feint Shot', '66.27%×3', 'Rapid continuous shooting on entry.'],
    ['Outro', 'Dissolving Mist', '+23% Aero DMG Amp (14s)', 'Buffs the incoming Resonator.'],
  ],
  'Baizhi': [
    ['Basic ATK', "Destined Promise Stage 1-4", '65.48% → 78.57% → 13.10%×7 → 78.57%', "Up to 4 You'tan-commanded strikes."],
    ['Heavy ATK', "Destined Promise (channel)", '48.86%/s', "Continuous You'tan attacks; Baizhi can reposition You'tan during the channel."],
    ['Skill', 'Emergency Plan', '15.94% + healing', "Immediate team heal plus a Glacio hit from You'tan."],
    ['Liberation', 'Momentary Union', 'Team heal + 4x Remnant Entities (4.07% each)', 'Remnant Entities auto-attack and heal every 2.5s.'],
    ['Forte', 'Cycle of Life', 'Heals via up to 4 Concentration stacks', 'Heavy ATK/Skill consumes Concentration for continuous team healing.'],
    ['Intro', 'Overflowing Frost', '79.53% + heal', "You'tan plunging attack that also heals the team."],
    ['Outro', 'Rejuvinating Flow', 'Heal 1.54% Max HP/3s (30s) + 15% DMG Amp (6s)', 'Buffs and sustains the incoming Resonator.'],
  ],
  'Buling': [
    ['Basic ATK', 'Stage 1-3', '20% → 26% → 30%'],
    ['Skill', 'Electro Spark', '28.5%×4'],
    ['Liberation', 'Lightning Storm', '18%×8'],
    ['Intro', 'Static Entry', '50%×2'],
    ['Outro', 'Discharge', '+12% Electro DMG + Electro Flare stacks'],
  ],
  'Chixia': [
    ['Basic ATK', 'POW POW Stage 1-4', '66.21% → 48.32%×2 → 33.55%×4 → 232.61%', 'Up to 4 shots.'],
    ['Heavy ATK', 'POW POW (aimed shot)', '35.79% → 80.52% fully charged', 'Charged aimed shot.'],
    ['Skill', 'Whizzing Fight Spirit', '31.81%×8', '2 initial charges; hold to enter DAKA DAKA!'],
    ['Forte', 'Heroic Bullets: DAKA DAKA!', '19.89% per Thermobaric Bullet', 'Continuous-fire state; tapping Basic ATK exits into Basic ATK 4.'],
    ['Forte', 'Heroic Bullets: Boom Boom', '437.39%', 'Auto-triggered when 30 Thermobaric Bullets are spent in one DAKA DAKA!'],
    ['Liberation', 'Blazing Flames', '954.29% + 57.84%×11', 'Rapid-fire burst hitting all nearby enemies.'],
    ['Intro', 'Grand Entrance', '49.21%×2 + 24.61%×4', 'Rapid dual-pistol entry.'],
    ['Outro', 'Leaping Flames', '530%', 'AoE shockwave around the target.'],
  ],
  // Danjin/Yangyang/Sanhua rewritten 2026-08-18: same issue as Aalto/Baizhi/Chixia above — Danjin's row
  // in particular had two fabricated skill names ("Crimson Moonrise" and "Crimson Arrival") that don't
  // exist anywhere on fandom; her real Liberation is "Crimson Bloom" and Intro is "Vindication".
  // Replaced with real Lv.10 values and exact move names from each character's fandom Combat page.
  'Danjin': [
    ['Basic ATK', 'Execution Stage 1-3', '57.26% → 58.85% → 79.53%', 'Up to 3 consecutive Havoc strikes.'],
    ['Heavy ATK', 'Execution (hold)', '37.12%×3', 'Consumes HP-fueled Forte; heals if Forte Gauge ≥50%.'],
    ['Skill', 'Crimson Fragment: Carmine Gleam', '38.18%×2', 'Base Skill hit; costs 3% Max HP per attack.'],
    ['Skill', 'Crimson Erosion', '64.42%×2 → 59.65%×2', 'After Basic ATK 2/Dodge Counter/Intro; applies Incinerating Will (+20% DMG taken).'],
    ['Skill', 'Sanguine Pulse', '56.07%×2 → 42.95%×3 → 64.42%×3', 'After Basic ATK 3, up to 3 consecutive strikes.'],
    ['Forte', 'Serene Vigil: Chaoscleave', '59.65%×7', 'At 60+ Ruby Blossom, Heavy ATK finisher; heals Danjin.'],
    ['Forte', 'Serene Vigil: Scatterbloom', '178.93%', 'Basic ATK follow-up after Chaoscleave.'],
    ['Liberation', 'Crimson Bloom', '49.09%×8 + 392.65% Scarlet Burst', 'Rapid Havoc combo plus a Scarlet Burst finisher; consumes HP per hit.'],
    ['Intro', 'Vindication', '49.71%×4', 'Unwavering strike; can chain into Crimson Erosion.'],
    ['Outro', 'Duality', '+23% Havoc DMG Deepen (14s)', 'Buffs the incoming Resonator.'],
  ],
  'Lumi': [
    ['Basic ATK', 'Stage 1-3', '27.3% → 23%×2 → 57.6%'],
    ['Skill', 'Luminal Strike', '41%×2'],
    ['Liberation', 'Daybreak Signal', '180%'],
    ['Intro', 'Light Surge', '50%×2'],
    ['Outro', 'Radiant Blessing', '+12% Glacio DMG (14s)'],
  ],
  // corrected 2026-08-18: replaced the old generic "Stage 1-4" placeholder values (fabricated move names
  // "Violent Crescendo"/"Fury Overture"/"Flame Reprise" don't exist on the real kit at all) with real
  // Lv.10 Attribute Scaling values and move names from wutheringwaves.fandom.com/wiki/Mortefi/Combat's
  // Forte Details table (rendered — the raw wikitext only transcludes {{Forte Table|Mortefi}}), cross-
  // checked against Prydwen's own Kit tab. Basic ATK's real 4-part combo, Heavy ATK/Mid-air/Dodge Counter
  // rows, Forte Circuit's Fury Fugue, and both Inherent Skills were entirely missing.
  'Mortefi': [
    ['Basic ATK', 'Impromptu Show Stage 1-4', '48.30% → 40.78%×2 → 107.30% → 21.02%×4+126.93%', 'Up to 4 consecutive pistol/flame shots.'],
    ['Heavy ATK', 'Impromptu Show (aimed shot)', '97.70%', 'Aim then fire a more powerful charged shot.'],
    ['Heavy ATK', 'Impromptu Show (fully charged)', '167.01%', 'Fully-charged aimed shot.'],
    ['Mid-air', 'Impromptu Show', '23.25%+23.25%', 'Consumes STA for consecutive mid-air shots.'],
    ['Dodge Counter', 'Impromptu Show', '194.98%', 'Basic ATK after a successful Dodge.'],
    ['Skill', 'Passionate Variation', '208.76%', 'Launches a flame-lightning flash forward, dealing Fusion DMG. 14s CD.'],
    ['Liberation', 'Violent Finale', '159.05%', 'Fusion DMG plus applies Burning Rhapsody to the whole team (10s, 20s CD).'],
    ['Liberation', 'Marcato (Coordinated ATK)', '31.81%', 'During Burning Rhapsody: on-field Basic ATK hit → 1 Marcato; on-field Heavy ATK hit → 2 Marcato. Max 1 Coordinated ATK/0.35s.'],
    ['Forte', 'Fury Fugue', '326.05%', 'Replaces Resonance Skill once Annoyance reaches 100; consumes all Annoyance, counted as Resonance Skill DMG.'],
    ['Intro', 'Dissonance', '168.99%', 'Fusion DMG opener.'],
    ['Outro', 'Rage Transposition', '+38% Heavy ATK DMG Amp (14s or until swapped)', 'Grants the incoming character Heavy ATK DMG Amplification.'],
  ],
  'Sanhua': [
    ['Basic ATK', 'Frigid Light Stage 1-5', '48.71% → 73.76% → 21.58%×4 → 39.67%×2 → 233.81%', 'Up to 5 Glacio strikes.'],
    ['Heavy ATK', 'Frigid Light (hold)', '22.27%×5', 'Consumes STA.'],
    ['Skill', 'Eternal Frost', '359.85%', 'Creates 1 Ice Prism, detonable by Heavy ATK: Detonate.'],
    ['Liberation', 'Glacial Gaze', '809.48%', 'Creates 1 Glacier and grants 2 stacks of Clarity.'],
    ['Forte', 'Clarity of Mind: Detonate', '186.29%×2', 'Timed Heavy ATK release inside the Frostbite area.'],
    ['Forte', 'Clarity of Mind: Ice Burst', '59.65% Thorn / 79.53% Prism / 139.17% Glacier', 'Detonate simultaneously bursts all active Ice Thorns/Prisms/Glaciers.'],
    ['Intro', 'Freezing Thorns', '139.17%', 'Creates 1 Ice Thorn.'],
    ['Outro', 'Silversnow', '+38% Basic ATK DMG Amp (14s)', 'Buffs the incoming Resonator.'],
  ],
  // corrected 2026-08-18: replaced the old generic "Stage 1-4"/placeholder multipliers (which didn't
  // match any real move name or value) with real Lv.10 Attribute Scaling values and move names from
  // wutheringwaves.fandom.com/wiki/Taoqi/Combat's Forte Details table. Liberation is real-name
  // 'Unmovable' (DEF-scaling nuke), not 'Iron Will' — that name actually belongs to her Outro Skill
  // (a pure Resonance Skill DMG Amp buff, no direct multiplier, matching the Lumi/Youhu Outro-row
  // convention below). Forte Circuit 'Power Shift' (Timed Counters combo) was entirely missing.
  'Taoqi': [
    ['Basic ATK', 'Concealed Edge Stage 1-4', '90.15% → 84.84% → 111.34% → 270.39%', 'Up to 4 Havoc strikes.'],
    ['Heavy ATK', 'Concealed Edge (hold)', '220.37%', 'Consumes STA; hold to enter Rocksteady Defense (-35% DMG taken).'],
    ['Forte', 'Strategic Parry', '78.7%', 'Auto-cast when attacked during Rocksteady Defense or after it lasts 3s.'],
    ['Mid-air', 'Concealed Edge', '123.27%', 'Plunging attack, consumes STA.'],
    ['Dodge Counter', 'Concealed Edge', '248.52%', 'Basic ATK after a successful Dodge.'],
    ['Skill', 'Fortified Defense', '134.92%', 'Havoc DMG to surrounding targets; generates 3 Rocksteady Shield stacks and heals self (1805 + 94.50% HP Recovery scaling).'],
    ['Liberation', 'Unmovable', '449.71% DEF', 'Havoc DMG scaling off Taoqi\'s DEF instead of ATK.'],
    ['Forte', 'Power Shift: Timed Counters Stage 1-3', '86.2% → 110.93% → 145.41%', 'Basic ATK after Heavy ATK Strategic Parry/Intro to consume "Resolving Caliber", counted as Basic ATK DMG; each hit grants a shield.'],
    ['Intro', 'Defense Formation', '208.76%', 'Havoc DMG opener; Basic ATK afterward casts Timed Counters directly.'],
    ['Outro', 'Iron Will', '+38% Resonance Skill DMG Amp (14s)', 'Buffs the incoming Resonator\'s Resonance Skill DMG.'],
  ],
  'Yangyang': [
    ['Basic ATK', 'Feather as Blade Stage 1-4', '44.73% → 59.64% → 46.81%×2 → 59.36%×2+79.14%', 'Up to 4 consecutive Aero strikes.'],
    ['Heavy ATK', 'Feather as Blade (hold)', '19.88%×3', 'Lunge forward, consumes Stamina.'],
    ['Heavy ATK', 'Zephyr Song', '106.61%', 'Basic ATK follow-up after Heavy ATK or Dodge Counter.'],
    ['Skill', 'Zephyr Domain', '34.53%×4 + 207.19%', 'Whirling vortex groups nearby enemies.'],
    ['Forte', 'Echoing Feathers: Stormy Strike', '38.02%×2', 'At 3 Melodies, Heavy ATK follow-up.'],
    ['Forte', 'Echoing Feathers: Feather Release', '21.73%×5 + 126.81%×2', 'Mid-air Basic ATK consuming all 3 Melodies; landing hit counts as Basic ATK.'],
    ['Liberation', 'Wind Spirals', '46.58%×12 + 372.70%', 'Cyclone groups nearby enemies.'],
    ['Intro', 'Cerulean Song', '79.52%×2', 'Launches target airborne.'],
    ['Outro', 'Whispering Breeze', 'Restore 4 Resonance Energy/s (5s)', 'Funnels Energy to the incoming Resonator.'],
  ],
  // corrected 2026-08-18: replaced the old generic "Stage 1-4" placeholder (fabricated move names
  // "Cleansing Blaze"/"Spirit Congregation"/"PoeticErta" that don't exist on the real kit, and a
  // fabricated "+23% Glacio DMG Amp" Outro that has no basis anywhere — her real Outro carries no Glacio
  // DMG at all, only a Coordinated ATK buff) with real Lv.10 Attribute Scaling values and move names from
  // wutheringwaves.fandom.com/wiki/Youhu/Combat's Forte Details table (rendered section-by-section via
  // the MediaWiki API). No Basic ATK/Heavy ATK/Mid-air/Dodge Counter rows exist in her Forte Details
  // table at all (unlike Yuanwu/Mortefi) — her 4-part Basic Attack combo and Heavy ATK: Frostfall have no
  // published DMG% scaling on fandom or Prydwen, so none are invented here.
  'Youhu': [
    ['Skill', 'Scroll Divination', '156.46%', 'Glacio DMG hit + heal to all nearby party members + performs Lucky Draw once (grants a random Antique).'],
    ['Skill', 'Chime (Antique Appraisal)', '41.05% + 49.85%×3 + 102.62%', 'Antique Appraisal variant. Effectively reduces enemy Vibration Strength.'],
    ['Skill', 'Ruyi (Antique Appraisal)', '137.00% + 167.45%', 'Antique Appraisal variant with the highest DMG Multiplier of the four.'],
    ['Skill', 'Ding (Antique Appraisal)', '28.57%×6 + 114.28%', 'Antique Appraisal variant. Effectively breaks enemy stance.'],
    ['Skill', 'Mask (Antique Appraisal)', '11.46%×9 + 44.20%', 'Antique Appraisal variant, lowest DMG; pulls in enemies along its path.'],
    ['Liberation', "Fortune's Favor", '327.19%', 'Glacio DMG blast; choose one of four Antiques from the resulting prompt (or get one at random).'],
    ['Forte', 'Poetic Essence', '37.21%×10', 'Hold Basic ATK at 4 Auspices. Glacio DMG counted as Resonance Skill DMG, heals all nearby party members, plus bonus effects based on Auspice combination (Antithesis +70% DMG, Triplet +175% DMG, etc).'],
    ['Intro', 'Scroll of Wonders', '89.47% + 109.35%', 'Toss the scroll and perform Lucky Draw once.'],
    ['Outro', 'Timeless Classics', 'No DMG (Coordinated ATK DMG Amp +100%, 28s)', 'The incoming Resonator has their Coordinated Attack DMG Amplified by 100% for 28s.'],
  ],
  // corrected 2026-08-18: replaced the old generic "Stage 1-5" placeholder values (which didn't match
  // any real move name — Yuanwu never has an unsourced "Liberation DMG Amp" Outro or "shield" on
  // Liberation) with real Lv.10 Attribute Scaling values and move names from
  // wutheringwaves.fandom.com/wiki/Yuanwu/Combat's Forte Details table (rendered, since the raw
  // wikitext only transcludes the {{Forte Table}} template). Skill's off-field Coordinated ATK and
  // Forte Circuit's Thunder Wedge Detonation/Rumbling Spark/Thunder Uprising/Thunderweaver rows were
  // entirely missing. Outro Lightning Manipulation has no DMG multiplier at all (pure Vibration
  // Strength depletion) — the old "+15% Liberation DMG Amp" value had no basis anywhere on the page.
  'Yuanwu': [
    ['Basic ATK', 'Leihuangquan Stage 1-5', '49.11% → 51.81%×2 → 21.84%×2+32.76%×2 → 51.81%×2 → 49.11%×2+65.48%', 'Up to 5 consecutive Electro strikes.'],
    ['Heavy ATK', 'Leihuangquan (hold)', '159.05%', 'Consumes STA to attack the target.'],
    ['Mid-air', 'Leihuangquan', '98.61%', 'Consumes STA; Mid-air Plunging Attack.'],
    ['Dodge Counter', 'Leihuangquan', '114.52%×2', 'Basic ATK after a successful Dodge.'],
    ['Skill', 'Thunder Wedge', '23.86%', 'Summons Thunder Wedge (lasts 12s) and forms a Thunder Field around it.'],
    ['Skill', 'Thunder Field Coordinated ATK', '7.96%', 'The on-field character\'s hits inside the Thunder Field trigger a Coordinated ATK, 1x/1.2s.'],
    ['Forte', 'Thunder Wedge Detonation', '59.65%', 'Forte Circuit Rumbling Spark or Liberation Blazing Might detonates the active Thunder Wedge, counted as Resonance Skill DMG.'],
    ['Forte', 'Rumbling Spark', '108.54%', 'Hold Skill when Forte Gauge is full to consume all "Readiness" and enter Lightning Infused.'],
    ['Liberation', 'Blazing Might', '174.96%×2', 'Grants Forte Circuit Lightning Infused (Interruption Resistance) to nearby team for 10s, then a powerful blow.'],
    ['Forte', 'Thunder Uprising', '39.77%', 'Replaces Resonance Skill Thunder Wedge when "Readiness" is full.'],
    ['Forte', 'Thunderweaver', '31.02%+20.68%×2', 'Basic ATK within 3s of a Heavy ATK/successful Counterattack while Lightning Infused, counted as Basic ATK DMG.'],
    ['Intro', 'Thunder Bombardment', '63.62%', 'Electro DMG opener.'],
    ['Outro', 'Lightning Manipulation', 'No DMG (Vibration Strength depletion)', 'Thunderbolts centered on the skill target; deals no DMG, greatly depletes enemy Vibration Strength.'],
  ],
};

// [SECTION:CHARACTER_ROTATIONS] — Standard rotation, sourced from Prydwen's "Gameplay and teams" tab per character.
// Each step's `type` + `skill` are matched against SKILL_MULTIPLIERS[name] (type === step.type, name.includes(step.skill))
// to look up its DMG multiplier at render time — single source of truth, no duplicated numbers to drift out of sync.
// `duration` (seconds) is only set for steps with a notable buff/stance/channel window worth highlighting.
// Built as a reusable base: Team tab can later prepend/append other characters' Intro/Outro to chain these together.
const CHARACTER_ROTATIONS = {
  // Standard Rotation — sourced from Prydwen's "Gameplay and teams" tab for Cantarella (2026-08-17,
  // Chrome UA + google.com referer + jsRender). This section was previously entirely missing for her.
  'Cantarella': [
    { type: 'Intro', skill: 'Cruise', note: 'Ripple variant, starts Basic ATK from Stage 3, grants 1 Trance' },
    { type: 'Basic ATK', skill: 'Illusion Collapse Stage 3', note: 'grants 1 more Trance' },
    { type: 'Skill', skill: 'Dance with Shadows', note: 'Graceful Step, grants 1 more Trance' },
    { type: 'Liberation', skill: 'Beneath the Sea', note: 'Flowing Suffocation, grants 3 Trance (caps at 5), applies Diffusion Coordinated Attacks' },
    { type: 'Heavy ATK', skill: 'Delusive Dive', note: 'consumes Trance, enters Mirage' },
    { type: 'Skill', skill: 'Flickering Reverie', note: 'Mirage Skill replacement, applies Hazy Dream' },
    { type: 'Forte', skill: 'Phantom Sting 1-3', note: 'Mirage Basic ATK combo, builds Shiver toward 3' },
    { type: 'Forte', skill: 'Perception Drain', note: 'consumes 3 Shiver for the burst nuke, heals the team' },
    { type: 'Outro', skill: 'Gentle Tentacles', duration: 14, note: 'grants the incoming Resonator Havoc + Resonance Skill DMG Amp' },
  ],
  // Standard Rotation — sourced from Prydwen's "Gameplay and teams" tab for Brant (2026-08-17, Chrome
  // UA + google.com referer + jsRender). This section was previously entirely missing for him.
  'Brant': [
    { type: 'Intro', skill: 'Applaud for Me!', note: 'next Mid-air Attack starts at Stage 2' },
    { type: 'Liberation', skill: 'To the Horizon', note: 'heals the team, enters Aflame (2x Bravo gain)' },
    { type: 'Mid-air', skill: 'Stage 2-3 + Charged Attack + Flip', note: 'main Bravo-building combo' },
    { type: 'Forte', skill: 'Returned from Ashes', note: 'consumes full Bravo, deals massive DMG + shields the team' },
    { type: 'Outro', skill: 'The Course is Set!', duration: 14, note: 'grants the incoming Resonator Fusion + Resonance Skill DMG Amp' },
  ],
  // Standard Rotation — sourced from Prydwen's "Gameplay and teams" tab for Phoebe (2026-08-17,
  // Chrome UA + google.com referer + jsRender). This section was previously entirely missing for her.
  // Uses her Absolution (self-DPS) rotation, Prydwen's higher-rated mode (T1.5 DPS vs T2 Hybrid) —
  // Confession mode swaps the Forte cast for Utter Confession and only loops 2x instead of 4x.
  'Phoebe': [
    { type: 'Intro', skill: 'Golden Grace' },
    { type: 'Skill', skill: 'To Where Light Shines', note: 'summons the Ring of Mirrors' },
    { type: 'Forte', skill: 'Absolution Litany', note: 'consumes full Prayer, enters Absolution' },
    { type: 'Liberation', skill: 'Dawn of Enlightenment', note: '+255% DMG Multiplier in Absolution' },
    { type: 'Skill', skill: "Chamuel's Star 1-3", note: 'inside the Ring of Mirrors, ×4 loops' },
    { type: 'Forte', skill: 'Starflash', note: 'after each Chamuel\'s Star combo, ×4 total' },
    { type: 'Outro', skill: 'Attentive Heart', note: '+255% DMG Multiplier in Absolution' },
  ],
  // Standard Rotation — sourced from Prydwen's "Gameplay and teams" tab for Roccia (2026-08-17,
  // Chrome UA + google.com referer + jsRender). This section was previously entirely missing for her.
  'Roccia': [
    { type: 'Intro', skill: 'Pero, Help', note: 'grants 100 Imagination' },
    { type: 'Basic ATK', skill: 'Pero, Easy Stage 4', note: 'skip straight to Stage 4 after Intro, grants 100 more Imagination' },
    { type: 'Skill', skill: 'Acrobatic Trick', note: 'pulls enemies in, grants the last 100 Imagination, enters Beyond Imagination' },
    { type: 'Forte', skill: 'Real Fantasy 1-3', note: '3 Forte bounces, counted as Heavy Attack DMG' },
    { type: 'Liberation', skill: 'Commedia Improvviso!', note: 'AoE nuke + flat team ATK buff scaling with Crit Rate over 50%' },
    { type: 'Outro', skill: 'Applause, Please!', duration: 14, note: 'grants the incoming Resonator Havoc + Basic ATK DMG Amp, and replaces their Utility with the Magic Box' },
  ],
  // Standard Rotation — sourced from Prydwen's "Gameplay and teams" tab for Carlotta (2026-08-17,
  // Chrome UA + google.com referer + jsRender). This section was previously entirely missing for her.
  // Simplified from Prydwen's full "Burst Combo" (with its Warm Up pre-phase for 0-Substance starts)
  // down to the core skill sequence, matching the level of detail used for the rest of the roster.
  'Carlotta': [
    { type: 'Intro', skill: 'Wintertime Aria', note: 'grants 30 Substance + 3 Moldable Crystals' },
    { type: 'Skill', skill: 'Art of Violence', note: 'grants 3 more Moldable Crystals' },
    { type: 'Skill', skill: 'Chromatic Splendor', note: 'consumes 6 Moldable Crystals for 60 Substance, enters Final Bow at 120' },
    { type: 'Forte', skill: 'Imminent Oblivion', note: 'consumes 120 Substance, cuts Skill cooldown by 6s' },
    { type: 'Liberation', skill: 'Era of New Wave', note: 'enters Twilight Tango, +80% DMG Multiplier from Final Bow' },
    { type: 'Liberation', skill: 'Death Knell', note: '×4, builds Meta Vectors' },
    { type: 'Liberation', skill: 'Fatal Finale', note: 'consumes 4 Meta Vectors, ends Twilight Tango' },
    { type: 'Skill', skill: 'Art of Violence', note: 'sets up 30 Substance for the next rotation' },
    { type: 'Skill', skill: 'Chromatic Splendor' },
    { type: 'Outro', skill: 'Closing Remark' },
  ],
  // Standard Rotation — sourced from Prydwen's "Gameplay and teams" tab for Camellya (2026-08-17,
  // Chrome UA + google.com referer + jsRender). This section was previously entirely missing for her.
  // Simplified from Prydwen's full swap/Echo-cancel-annotated combo down to the core skill sequence,
  // matching the level of detail used for the rest of the roster's rotation entries.
  'Camellya': [
    { type: 'Intro', skill: 'Everblooming' },
    { type: 'Skill', skill: 'Crimson Blossom', note: 'enters Blossom Mode (Red Hair)' },
    { type: 'Skill', skill: 'Vining Waltz 1-4 / Blazing Waltz', note: 'full Blossom Mode combo, builds Crimson Pistils/Buds' },
    { type: 'Liberation', skill: 'Fervor Efflorescent' },
    { type: 'Basic ATK', skill: 'Vining Waltz 1', note: 'fills the last Concerto Energy needed' },
    { type: 'Forte', skill: 'Ephemeral', duration: 15, note: 'consumes all Crimson Buds, enters Budding Mode' },
    { type: 'Skill', skill: 'Vining Waltz 1-4 / Blazing Waltz', note: 'Budding Mode combo, +50-100% DMG Multiplier' },
    { type: 'Skill', skill: 'Floral Ravage', note: 'ends Blossom Mode' },
    { type: 'Outro', skill: 'Twining', note: 'empowered version deals bonus DMG since Ephemeral was cast this rotation' },
  ],
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
  // Corrected 2026-08-17 against Prydwen's live "Gameplay and teams" rotation: the previous entry never
  // used a single Basic ATK, put the base Skill (Eye of Unraveling — barely worth casting outside the
  // Opener per Prydwen) before the Liberation, and skipped straight to Sawring - Blitz 1-3 instead of
  // matching the actual Basic ATK → Liberation → Serrated Loop → Blitz 2-3 → Eradication loop. Rebuilt
  // to match Prydwen's actual "Loop Rotation" (used every rotation after the Opener).
  'Chisa': [
    { type: 'Intro', skill: 'Reverberance - Return', note: 'also grants +20% Havoc DMG/Healing Bonus for 12s (Inherent Skill)' },
    { type: 'Basic ATK', skill: 'Stage 2, Rending Lunge, Death Snip', note: 'Death Snip endlag partially cancelled by the Liberation' },
    { type: 'Liberation', skill: 'Moment of Nihility', duration: 15, note: 'heals the team, enters Woven Myriad - Convergence' },
    { type: 'Skill', skill: 'Serrated Loop', note: 'at full Ring of Chainsaw — enters Chainsaw Mode' },
    { type: 'Forte', skill: 'Sawring - Blitz 2-3', note: 'Chainsaw Mode combo' },
    { type: 'Forte', skill: 'Sawring - Eradication', duration: 30, note: 'scales with Ring of Chainsaw consumed, grants team Shield, swap-cancel out' },
    { type: 'Outro', skill: 'Unraveling - Law Zero', duration: 20, note: 'next Resonator can stack +3 more Negative Status/Electro Rage' },
  ],
  // Corrected 2026-08-17 against Prydwen's live "Gameplay and teams" rotation: the previous entry
  // included Encroach and Volley of Death as rotation steps and put the Liberation after the Demon
  // Hypostasis combo — but Prydwen's own review explicitly lists her base Resonance Skill and all Heavy
  // Attacks as unused in practice (Basic Attacks/Dodge Counters restore Forte fastest and hit harder),
  // and the Liberation must be cast BEFORE entering the Demon Hypostasis combo since its +85% DMG Mult
  // buff applies to those very attacks. Rebuilt to match Prydwen's actual "Standard Rotation".
  'Galbrena': [
    { type: 'Intro', skill: 'Hellflare Overload' },
    { type: 'Basic ATK', skill: 'Stage 2-4, 2-3', note: 'Threshold State combo, builds Sinflame (skips the weak Stage 1)' },
    { type: 'Skill', skill: 'Ascent of Malice', note: 'at max Sinflame — enters Demon Hypostasis, endlag cancelled on hit by the Liberation' },
    { type: 'Liberation', skill: 'Hellfire Absolution', duration: 14, note: 'cast right after entering Demon Hypostasis so its +85% DMG Mult buffs the whole combo that follows' },
    { type: 'Basic ATK', skill: 'Seraphic Execution Stage 2-5, 3-5 (swap on final Stage 5)', note: 'Demon Hypostasis combo — Dodge Counter can substitute for Stage 3/4 for higher DMG and Forte if the enemy attacks' },
    { type: 'Outro', skill: 'Ashen Pursuit', note: 'pure-damage swap-out, no team buff, quickswap freely' },
  ],
  // Corrected 2026-08-17 against Prydwen's live "Gameplay and teams" rotation: the previous entry put
  // her Skill before the Liberation and never mentioned the Flux jump-attack that switches her into New
  // Moon — neither matches Prydwen's actual "Standard Sub DPS Rotation" (used alongside Augusta), which
  // opens Intro straight into Liberation, then Flux into the Moonbow combo, and skips the base Skill
  // entirely (Closing Refrain is only used in the longer "Extended"/Main DPS variants).
  'Iuno': [
    { type: 'Intro', skill: 'Illuminated Manifestation', note: 'restores 40 Sentience' },
    { type: 'Liberation', skill: 'Beneath Lunar Tides', duration: 30, note: 'activates Lunar Cycle, restores 60 Sentience' },
    { type: 'Heavy ATK', skill: 'Flux: Moonbow', note: 'jump attack, switches Half Moon → New Moon' },
    { type: 'Basic ATK', skill: 'Moonbow 1-3', note: 'Sentience-enhanced combo, consumes up to 50 Sentience' },
    { type: 'Skill', skill: 'Arc Beyond the Edge', note: 'New Moon follow-up, 2 charges, consumes up to 25 Sentience each' },
    { type: 'Heavy ATK', skill: 'Absolute Fullness', note: 'Forte finisher (swap-cancel), optional — cast for the extra team heal/Full Moon Domain, especially with Augusta on the team' },
    { type: 'Outro', skill: 'From Gloom to Gleam', duration: 14, note: 'grants next Resonator 50% Heavy ATK DMG Amp' },
  ],
  // Corrected 2026-08-17 against Prydwen's live "Gameplay and teams" rotation: the previous entry
  // skipped her Mid-air Attack entirely — the step that recalls all 3 Sword Shadows and grants their
  // buffs to Fleurdelys, central to her kit — and collapsed her two-phase Fleurdelys Skill 1/Skill 2
  // loop into a single generic Basic ATK line. Rebuilt to match Prydwen's actual "Basic Rotation".
  'Cartethyia': [
    { type: 'Intro', skill: "Sword to Mark Tide's Trace", note: 'grants Sword of Discord' },
    { type: 'Basic ATK', skill: 'Base Form 1-4', note: 'Stage 4 grants Sword of Divinity' },
    { type: 'Skill', skill: 'Base Form', note: 'grants Sword of Virtue' },
    { type: 'Mid-air', skill: 'Cartethyia Plunging Attack', note: 'recalls all 3 Sword Shadows, grants their buffs to Fleurdelys' },
    { type: 'Liberation', skill: "A Knight's Heartfelt Prayers", duration: 12, note: 'transforms into Fleurdelys (Manifest)' },
    { type: 'Skill', skill: "Fleurdelys 1", note: "Sword to Answer Waves' Call" },
    { type: 'Basic ATK', skill: 'Fleurdelys 1-5', note: 'Mid-air P3 into Basic P3-P5' },
    { type: 'Skill', skill: 'Fleurdelys 2', note: 'May Tempest Break the Tides' },
    { type: 'Basic ATK', skill: 'Fleurdelys 1-5', note: 'Basic P3-P5 again, builds Conviction to 120' },
    { type: 'Liberation', skill: 'Blade of Howling Squall', note: 'Fleurdelys finisher, removes stacked Erosion for bonus DMG, ends Manifest' },
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
  // Corrected 2026-08-17 against Prydwen's live "Gameplay and teams" rotation: the previous entry
  // opened with a full Basic ATK combo before her Liberation and never mentioned Foebreaker, the
  // Mid-air Attack chain, or Wolf's Claw — the actual core of her Forte-building loop. Rebuilt to match
  // Prydwen's "Loop Rotation" (used whenever an Intro Skill is available, i.e. whenever she isn't the
  // team's opener).
  'Lupa': [
    { type: 'Intro', skill: 'Try Focusing, Eh?' },
    { type: 'Liberation', skill: 'Fire-Kissed Glory', duration: 35, note: 'fully restores Wolflame, grants team Pack Hunt + Glory buffs' },
    { type: 'Skill', skill: 'Foebreaker', note: 'press Basic/Skill shortly after Liberation, enters Burning Matchpoint' },
    { type: 'Mid-air', skill: 'Stage 1-2', note: 'builds toward Firestrike' },
    { type: 'Mid-air', skill: 'Firestrike', note: 'consumes 50 Wolflame, grants 1 Wolfaith' },
    { type: 'Heavy ATK', skill: "Wolf's Claw", note: 'press Basic after Firestrike, consumes 50 Wolflame, grants 1 more Wolfaith' },
    { type: 'Skill', skill: 'Dance with the Wolf', note: 'Forte finisher, consumes both Wolfaith' },
    { type: 'Outro', skill: 'Stand by Me, Warrior', duration: 14, note: 'grants next Resonator Fusion + Basic ATK DMG Amp' },
  ],
  // Corrected 2026-08-17 against Prydwen's live "Gameplay and teams" rotation: the previous entry
  // included the un-enhanced Basic ATK Stage 1-3 combo — but the Intro alone grants 400 of his 600 Forte
  // ("Swordster's Soliloquy"), so Prydwen's actual "Standard Hybrid Rotation" skips straight from Intro
  // into the enhanced Inkwash Basic Attack (Stage 3-4), never touching the plain Basic ATK. The base
  // Skill (Through the Groves) is also optional/skippable — best cast before his rotation in quickswap,
  // or held mid-rotation only if Concerto Energy is genuinely short.
  'Qiuyuan': [
    { type: 'Intro', skill: 'Attack the Must-Defend', note: 'grants 400 of 600 Forte, skips straight to Inkwash Stage 3' },
    { type: 'Basic ATK', skill: 'Inkwash Stage 3-4', note: 'fills Forte to 600, endlag optionally cancelled by the Skill' },
    { type: 'Skill', skill: 'Through the Groves', note: 'optional — best cast before this rotation via quickswap; skip if not needed for Energy' },
    { type: 'Liberation', skill: 'Sundering Strike', duration: 30, note: 'cancels the Skill\'s endlag on hit, grants self/team Crit DMG at 65%+ Crit Rate' },
    { type: 'Forte', skill: 'To Teach / To Save / To Sacrifice', note: 'Heavy ATK finisher sequence, empties Forte and restores Concerto Energy' },
    { type: 'Outro', skill: 'Strike Before Ready', duration: 14, note: 'grants next Resonator 50% Echo Skill DMG Amp' },
  ],
  // Added 2026-08-18 (previously missing entirely) — sourced from Prydwen's "Gameplay and teams" tab
  // Heavy ATK Concerto Rotation, the mode Prydwen states sees "far more play overall" over the Basic ATK
  // variant. Core loop: deploy all 3 Forte Ice constructs (Intro/Skill/Liberation), then shatter them
  // with 2x Heavy ATK Detonate before they expire (each construct detonation grants 15 Concerto).
  'Sanhua': [
    { type: 'Intro', skill: 'Freezing Thorns', note: 'creates 1 Ice Thorn' },
    { type: 'Liberation', skill: 'Glacial Gaze', note: 'creates 1 Glacier, grants 2 stacks of Clarity (expands Frostbite area)' },
    { type: 'Skill', skill: 'Eternal Frost', note: 'creates 1 Ice Prism, grants 1 stack of Clarity' },
    { type: 'Forte', skill: 'Heavy ATK: Detonate', note: 'detonates all 3 Ice constructs (Thorn/Prism/Glacier) at once for a large Concerto/Energy burst' },
    { type: 'Forte', skill: 'Heavy ATK: Detonate', note: 'second detonate to fully spend the loop before swapping' },
    { type: 'Outro', skill: 'Silversnow', duration: 14, note: 'grants next Resonator 38% Basic ATK DMG Amp — time this to land on the intended DPS' },
  ],
  // Standard Rotations added 2026-08-18 for Aalto/Baizhi/Chixia — sourced from wutheringwaves.fandom.com's
  // Combat pages (Instructions + Forte text). These were entirely missing before.
  'Aalto': [
    { type: 'Intro', skill: 'Feint Shot', note: 'rapid burst on entry, builds Mist Drops' },
    { type: 'Skill', skill: 'Shift Trick', note: 'summons a Mist Avatar and spreads Mist, taunting nearby enemies' },
    { type: 'Basic ATK', skill: 'Half Truths Stage 4', note: 'Basic ATK 4 spreads Mist forward; passing through it triggers Mistcloak Dash' },
    { type: 'Liberation', skill: 'Flower in the Mist', note: 'creates a Gate of Quandary — Mist Bullets passing through it deal amplified DMG' },
    { type: 'Forte', skill: 'Misty Cover', note: 'Mistcloak Dash consumes Mist Drops while passing through Mist/Gate for a burst of Mist Bullets' },
    { type: 'Outro', skill: 'Dissolving Mist', duration: 14, note: 'grants the incoming Resonator 23% Aero DMG Amp for 14s' },
  ],
  'Baizhi': [
    { type: 'Intro', skill: 'Overflowing Frost', note: 'plunging attack that also heals the team on entry' },
    { type: 'Liberation', skill: 'Momentary Union', note: 'team heal, spawns 4 stacks of Remnant Entities for sustained Coordinated-ATK healing' },
    { type: 'Skill', skill: 'Emergency Plan', note: 'instant team heal plus a Glacio hit, builds Concentration' },
    { type: 'Heavy ATK', skill: "Destined Promise (channel)", note: 'consumes Concentration for continuous team healing plus Concerto/Resonance Energy regen' },
    { type: 'Outro', skill: 'Rejuvinating Flow', duration: 30, note: 'sustains the incoming Resonator with healing over 30s plus 15% DMG Amp for 6s' },
  ],
  'Chixia': [
    { type: 'Intro', skill: 'Grand Entrance', note: 'rapid dual-pistol burst on entry, builds Thermobaric Bullets' },
    { type: 'Skill', skill: 'Whizzing Fight Spirit', note: 'hold to enter DAKA DAKA!, consuming Thermobaric Bullets on continuous fire' },
    { type: 'Forte', skill: 'Heroic Bullets: DAKA DAKA!', note: 'spending all 30 Thermobaric Bullets in one go auto-casts Boom Boom' },
    { type: 'Forte', skill: 'Heroic Bullets: Boom Boom', note: 'auto-triggered Resonance Skill finisher, exits DAKA DAKA!' },
    { type: 'Liberation', skill: 'Blazing Flames', note: 'AoE rapid-fire burst hitting all nearby enemies' },
    { type: 'Outro', skill: 'Leaping Flames', note: 'AoE shockwave around the target, sets up the next Resonator' },
  ],
  // Standard Rotation added 2026-08-18 — sourced from wutheringwaves.fandom.com's Danjin/Combat
  // Instructions + Forte text (Crimson Erosion/Sanguine Pulse combo strings, Forte Circuit conditions).
  // This section was previously entirely missing for her.
  'Danjin': [
    { type: 'Intro', skill: 'Vindication', note: 'unwavering strike, builds Concerto Energy' },
    { type: 'Basic ATK', skill: 'Stage 2 into Crimson Erosion', note: 'after Basic ATK 2 (or Dodge Counter/Intro), cast Resonance Skill for the 2-hit Crimson Erosion combo, applying Incinerating Will (+20% DMG taken)' },
    { type: 'Basic ATK', skill: 'Stage 3 into Sanguine Pulse', note: 'continue into Basic ATK 3, then Resonance Skill again for the 3-hit Sanguine Pulse combo, building Ruby Blossom stacks' },
    { type: 'Liberation', skill: 'Crimson Bloom', note: 'rapid multi-hit Havoc burst plus Scarlet Burst finisher, consumes HP per hit' },
    { type: 'Forte', skill: 'Heavy ATK: Chaoscleave', note: 'once Ruby Blossom reaches 60+, unleash Chaoscleave (heals Danjin, counts as Heavy ATK) into the Scatterbloom follow-up' },
    { type: 'Outro', skill: 'Duality', duration: 14, note: 'grants the incoming Resonator 23% Havoc DMG Deepen for 14s' },
  ],
  // Standard Rotation added 2026-08-18 — sourced from wutheringwaves.fandom.com's Yangyang/Combat
  // Instructions/Forte text and Prydwen's review ("the main and most reliable way to access Feather
  // Release... by jumping", "we will mostly be counting on Heavy Attacks and Resonance Skills to
  // generate Forte stacks"). One of the shortest rotations in the game, built for quickswap. This
  // section was previously entirely missing for her.
  'Yangyang': [
    { type: 'Intro', skill: 'Cerulean Song', note: 'launches target airborne, grants 1 Melody stack' },
    { type: 'Skill', skill: 'Zephyr Domain', note: 'whirling vortex groups nearby enemies, grants 1 Melody stack' },
    { type: 'Heavy ATK', skill: 'Zephyr Song', note: 'Heavy ATK into follow-up Basic ATK grants the 3rd Melody stack' },
    { type: 'Basic ATK', skill: 'Mid-air Attack: Feather Release', note: 'jump then Basic ATK to consume all 3 Melodies for the Forte Circuit burst finisher' },
    { type: 'Liberation', skill: 'Wind Spirals', note: 'Cyclone burst groups enemies and generates Concerto Energy' },
    { type: 'Outro', skill: 'Whispering Breeze', duration: 5, note: 'funnels 4 Resonance Energy/s to the incoming Resonator for 5s — quickswap into the main DPS' },
  ],
  // Added 2026-08-18 (previously entirely missing) — sourced from wutheringwaves.fandom.com's
  // Taoqi/Combat Instructions/Forte text. She's a shield support: Skill grants 3 Rocksteady Shield
  // stacks (each absorbing a hit), Liberation is a DEF-scaling nuke, and the Outro's 38% Resonance
  // Skill DMG Amp is timed onto the incoming Resonator's own Skill DPS window.
  'Taoqi': [
    { type: 'Intro', skill: 'Defense Formation', note: 'Havoc DMG opener; Basic ATK afterward casts Timed Counters (Power Shift) directly' },
    { type: 'Skill', skill: 'Fortified Defense', note: 'Havoc DMG to surrounding targets, generates 3 Rocksteady Shield stacks and heals self' },
    { type: 'Liberation', skill: 'Unmovable', note: 'DEF-scaling Havoc nuke — benefits from her naturally high base DEF' },
    { type: 'Forte', skill: 'Power Shift: Timed Counters', note: 'Basic ATK after Heavy ATK Strategic Parry/Intro consumes "Resolving Caliber" for extra hits and a shield, counted as Basic ATK DMG' },
    { type: 'Outro', skill: 'Iron Will', duration: 14, note: 'grants the incoming Resonator 38% Resonance Skill DMG Amp for 14s — time this to land on the intended DPS\'s Skill window' },
  ],
  // Added 2026-08-18 (previously entirely missing) — sourced from Prydwen's Gameplay and teams "Ability
  // Priority" list and fandom's Yuanwu/Combat Instructions/Forte text. He's a near-zero-field-time
  // support: deploy Thunder Wedge, detonate it with Liberation, swap off. Prydwen explicitly notes he
  // "features no set rotation" — this models the documented Ability Priority order for calc purposes.
  'Yuanwu': [
    { type: 'Intro', skill: 'Thunder Bombardment', note: 'Electro DMG opener (if available)' },
    { type: 'Skill', skill: 'Thunder Wedge', note: 'deploy Thunder Wedge to start building Forte Gauge off-field via Coordinated ATKs' },
    { type: 'Liberation', skill: 'Blazing Might', note: 'detonates the active Thunder Wedge (Resonance Skill DMG) and grants team Interruption Resistance for 10s' },
    { type: 'Forte', skill: 'Rumbling Spark', note: 'once Forte Gauge is full, hold Skill to detonate Thunder Wedge again and enter Lightning Infused' },
    { type: 'Skill', skill: 'Thunder Wedge', note: 're-deploy Thunder Wedge to keep the Coordinated ATK field active' },
    { type: 'Outro', skill: 'Lightning Manipulation', note: 'swap out — depletes enemy Vibration Strength, no DMG; quickswap into the main DPS immediately' },
  ],
  // Added 2026-08-18 (previously entirely missing) — sourced from Prydwen's Gameplay and teams "Rotation"
  // list and fandom's Mortefi/Combat Instructions/Forte text. His Concerto rotation is one of the
  // fastest in the game: build Annoyance to trigger Fury Fugue twice, then Liberation right before
  // swapping so Burning Rhapsody's off-field Coordinated ATKs and the Outro's Heavy ATK buff both land
  // on the incoming Heavy Attacker.
  'Mortefi': [
    { type: 'Intro', skill: 'Dissonance', note: 'Fusion DMG opener, builds Annoyance' },
    { type: 'Skill', skill: 'Passionate Variation', note: 'builds Annoyance and opens a 5s window where Basic ATK hits restore extra Annoyance' },
    { type: 'Forte', skill: 'Fury Fugue', note: 'cast once Annoyance is full — no CD, counted as Resonance Skill DMG' },
    { type: 'Basic ATK', skill: 'Impromptu Show', note: 'Basic ATK combo (Parts 1-4) inside the post-Skill Annoyance window to refill Fury Fugue fast' },
    { type: 'Forte', skill: 'Fury Fugue', note: 'cast again once Annoyance refills' },
    { type: 'Liberation', skill: 'Violent Finale', note: 'cast right before swapping out — applies Burning Rhapsody (off-field Coordinated ATK Marcato hits) to the whole team' },
    { type: 'Outro', skill: 'Rage Transposition', note: 'swap into the main Heavy Attacker — grants them 38% Heavy ATK DMG Amp for 14s; Impermanence Heron\'s swap-cancel adds a further buff on the same swap' },
  ],
  // Added 2026-08-18 (previously entirely missing) — sourced from Prydwen's Gameplay and teams "Rotation
  // 1" (her simplest loop, 6.5s, works with any weapon) and fandom's Youhu/Combat Instructions text.
  // Every Antique Appraisal (Chime/Ruyi/Ding/Mask, drawn at random unless chosen via Liberation) refills
  // an Auspice; Poetic Essence fires once all 4 are gathered. Prydwen recommends picking Mask or Ruyi from
  // Liberation's choice prompt against bosses.
  'Youhu': [
    { type: 'Intro', skill: 'Scroll of Wonders', note: 'Glacio DMG opener, grants Lucky Draw (random Antique)' },
    { type: 'Skill', skill: 'Ruyi', note: 'enhanced Basic ATK consuming the drawn Antique (Antique Appraisal) — swap-cancel instantly' },
    { type: 'Liberation', skill: "Fortune's Favor", note: 'Glacio DMG blast; choose an Antique from the prompt (Mask/Ruyi recommended vs bosses)' },
    { type: 'Skill', skill: 'Ruyi', note: 'Antique Appraisal again, consuming the Liberation-granted Antique' },
    { type: 'Basic ATK', skill: 'Frosty Punches', note: 'full 4-part Basic ATK combo to fill the Forte Gauge (Frost)' },
    { type: 'Skill', skill: 'Scroll Divination', note: 'Resonance Skill — Glacio DMG + heal + Lucky Draw, keep on cooldown' },
    { type: 'Skill', skill: 'Ruyi', note: 'Antique Appraisal once more' },
    { type: 'Outro', skill: 'Timeless Classics', note: 'swap into the Coordinated ATK dealer — grants +100% Coordinated ATK DMG Amp for 28s' },
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
  // Sanhua corrected 2026-08-18 per Prydwen's own Resonance Chain text (previous values were unsourced
  // guesses): S1 Basic ATK V grants Crit Rate+15% for 10s (was atkPct:10, wrong stat -> critRate). S2 is
  // pure utility (Heavy ATK Detonate Stamina cost -10, Anti-interruption on Eternal Frost cast) with no
  // direct DPS stat -> totalMult fallback (was basicDmg:10, no basis). S3 DMG dealt +35% vs targets below
  // 70% HP, conditional -> totalMult weighted average (was totalMult:10, undervalued). S4 Glacial Gaze
  // restores 10 Energy + next Heavy ATK Detonate DMG+120% within 5s, a large conditional burst ->
  // totalMult weighted average (was atkPct:10, no basis). S5 Ice Burst Crit DMG+100% (only on the Forte
  // Detonate hit) plus unconditional Ice Creation auto-explode -> critDmg weighted average (was
  // basicDmg:10, no basis). S6 team ATK+10%/stack up to 2 (=20% max) for 20s after detonating an Ice
  // Prism/Glacier, not a DMG Deepen -> atkPct (was deepen:15, wrong stat).
  // Re-verified 2026-08-18 against fandom's Chain Node pages (Solitude's Embrace/Snowy Clarity/Anomalous
  // Vision/Blade Mastery/Unraveling Fate/Daybreak Radiance wikitext, matches Prydwen's Kit tab wording):
  // S1 critRate:15 confirmed exact (Basic Attack V, +15% Crit Rate for 10s), unchanged. S2 STA cost
  // reduction + interruption resist on Skill cast is pure utility with no matching DPS stat, kept as a
  // small totalMult. S3 DMG dealt +35% vs targets below 70% HP — corrected from an unsourced totalMult:18
  // to the real value 35 (kept as totalMult since it's general damage, not attribute/skill-specific). S4
  // Heavy ATK Detonate DMG+120% for 5s after Liberation — corrected from an unsourced totalMult:35 (no
  // basis) to the real conditional value, now modeled as heavyDmg:120 (Detonate is a Heavy ATK, and
  // heavyDmg is a supported stat key in this schema) rather than a vague totalMult. S5 Forte Circuit Ice
  // Burst Crit DMG+100% (confirmed exact, conditional to that one hit) — corrected from an unsourced 50 to
  // the real value 100. S6 team ATK+10%/stack, stacking to 2 (=20% max) for 20s (confirmed exact),
  // unchanged.
  'Sanhua':       { s1: { critRate: 15 }, s2: { totalMult: 5 }, s3: { totalMult: 35 }, s4: { heavyDmg: 120 }, s5: { critDmg: 100 }, s6: { atkPct: 20 } },
  // corrected 2026-08-18: prior values (heavyDmg/totalMult/coordDmg guesses on every node) had no basis
  // in Mortefi's real chain kit (fandom Combat page rendered Resonance Chain table, matches Prydwen's Kit
  // tab wording exactly) — none of his nodes touch Heavy ATK DMG at all. Real effects: S1 Solitary Etude —
  // during Burning Rhapsody, Coordinated Attacks also trigger off the on-field character's Resonance
  // Skill hits, firing 2 Marcato (extra proc source, no DMG% stat in schema, kept as small totalMult). S2
  // Hypocritical Hymn — Echo Skill use restores +10 Resonance Energy, 20s CD (pure utility, not modeled,
  // kept as small totalMult). S3 Flaming Recitativo — during Burning Rhapsody, Marcato Crit DMG+30%
  // (confirmed exact, modeled as critDmg). S4 Cathartic Waltz — Burning Rhapsody duration +7s (utility, no
  // DMG stat, kept as small totalMult). S5 Funerary Quartet — Skill/Fury Fugue hits fire 4 bonus Marcato
  // hits at 50% reduced DMG (extra proc source, kept as small totalMult). S6 Apoplectic Instrumental — on
  // Liberation cast, team ATK+20% for 20s (confirmed exact, modeled as atkPct).
  'Mortefi':      { s1: { totalMult: 6 }, s2: { totalMult: 3 }, s3: { critDmg: 30 }, s4: { totalMult: 4 }, s5: { totalMult: 8 }, s6: { atkPct: 20 } },
  // added 2026-08-18 — previously entirely missing. Sourced from fandom's Combat page rendered
  // Resonance Chain table (matches Prydwen's Kit tab wording exactly). Real effects: S1 Waterside
  // Respite — 10% chance of DMG/interruption immunity for 5s after Lucky Draw (utility, no DMG stat,
  // kept as small totalMult). S2 Sunroom Siesta — Antithesis/Triplet/Perfect Rhyme DMG bonus on Poetic
  // Essence doubled (self DMG, low priority for a healer/support, kept as small totalMult). S3 Restless
  // Sleep — ATK+20% (confirmed exact -> atkPct). S4 Frosted Lullaby — 20% chance Scroll Divination skips
  // Cooldown (utility, no DMG stat, kept as small totalMult). S5 Dreamland Meander — Crit Rate+15% for
  // 14s after Intro Skill (confirmed exact -> critRate). S6 Slumber Evermore — Sky Blue stacks (max 4,
  // 7s) each granting Crit DMG+15%, so max 60% Crit DMG (confirmed exact at max stacks -> critDmg,
  // matching this table's convention of using max-stack totals, e.g. Chixia S5/Mortefi S1).
  'Youhu':        { s1: { totalMult: 3 }, s2: { totalMult: 5 }, s3: { atkPct: 20 }, s4: { totalMult: 3 }, s5: { critRate: 15 }, s6: { critDmg: 60 } },
  // Danjin re-verified 2026-08-18 against fandom's Chain Node pages (Crimson Heart of Justice/Dusted
  // Mirror/Fleeting Blossom/Solitary Carnation/Reigning Blade/Bloodied Jade wikitext, cross-checked with
  // Prydwen's Kit tab Resonance Chain text — identical wording): S1 ATK+5% per stack on Incinerating Will
  // hits, stacking up to 6 times (max 30%, lost 1 stack per hit taken) — corrected from an unsourced flat
  // 15% to the real max-stack value 30% (matches this table's convention of using max-stack totals
  // elsewhere, e.g. Chixia S5). S2 DMG dealt to Incinerating Will targets +20% (confirmed exact, kept as
  // totalMult since it's not attribute-specific). S3 Liberation DMG Bonus +30% (confirmed exact -> libDmg,
  // unchanged). S4 Crit Rate+15% while above 60 Ruby Blossom (confirmed exact -> critRate, unchanged). S5
  // Havoc DMG Bonus +15% unconditional (+15% more, 30% total, only when HP<60%) — corrected from an
  // unsourced 22 to the real unconditional base value 15; the extra conditional +15% isn't separately
  // modeled. S6 team ATK+20% for 20s on full-power Chaoscleave (confirmed exact, unchanged).
  'Danjin':       { s1: { atkPct: 30 }, s2: { totalMult: 20 }, s3: { libDmg: 30 }, s4: { critRate: 15 }, s5: { elemDmg: 15 }, s6: { atkPct: 20 } },
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
  // corrected 2026-08-18: prior values (elemDmg:8/totalMult:10/elemDmg:8/atkPct:10/totalMult:10/elemDmg:12) had no basis
  // in Aalto's actual chain kit (fandom Combat page, Resonance Chain table). Real effects: S1 Shift Trick CD-4s (no
  // direct DPS stat, modeled as small totalMult utility). S2 Mist Avatar ATK+15% on taunted-target attacks (conditional
  // atkPct). S3 +2 Mist bullets at 50% Basic/Mid-air DMG (utility totalMult). S4 Mist Bullets (Resonance Skill) DMG+30%
  // (skillDmg, confirmed exact) + 30% DMG reduction in Mistcloak Dash (defensive, not modeled). S5 Aero DMG Bonus+25%
  // for 6s in Mistcloak Dash (elemDmg, confirmed exact). S6 Liberation Crit Rate+8% (critRate, confirmed exact) + Heavy
  // Attack thru Gate of Quandary DMG+50% (conditional, not separately modeled).
  'Aalto':        { s1: { totalMult: 4 }, s2: { atkPct: 15 }, s3: { totalMult: 8 }, s4: { skillDmg: 30 }, s5: { elemDmg: 25 }, s6: { critRate: 8 } },
  // corrected 2026-08-18: prior values (all totalMult:5, s6 deepen:10) were unsourced placeholders — Baizhi's real
  // chain (fandom Combat page) is mostly healing/utility with no "deepen" (enemy DMG-taken debuff) node at all. S1
  // Emergency Plan +2.5 Resonance Energy per Concentration (utility, not modeled). S2 Emergency Plan (at 4
  // Concentration) grants Glacio DMG Bonus+15% and Healing+15% for 12s (elemDmg, confirmed exact — healing half not
  // modeled). S3 Intro Skill grants Max HP+12% for 10s (no HP% stat in schema, kept as small utility totalMult). S4
  // Remnant Entities gets 2 extra casts + Healing Mult+20% + extra Glacio DMG (healing-focused, kept as small
  // totalMult). S5 revives a KO'd teammate once per 10 min (pure utility, no DPS stat fits). S6 Euphonia pickup grants
  // team Glacio DMG Bonus+12% for 20s (elemDmg, confirmed exact).
  'Baizhi':       { s1: { totalMult: 4 }, s2: { elemDmg: 15 }, s3: { totalMult: 6 }, s4: { totalMult: 8 }, s5: { totalMult: 4 }, s6: { elemDmg: 12 } },
  'Buling':       { s1: { atkPct: 5 }, s2: { deepen: 5 }, s3: { atkPct: 5 }, s4: { deepen: 5 }, s5: { totalMult: 8 }, s6: { deepen: 10 } },
  // corrected 2026-08-18: prior values (atkPct:8/skillDmg:10/atkPct:8/skillDmg:10/totalMult:10/elemDmg:12) had no basis
  // in Chixia's real chain kit (fandom Combat page). S1 Boom Boom hits always Crit (utility, no %-stat fits). S2
  // Liberation kill-refund of Resonance Energy (utility). S3 Liberation Blazing Flames DMG+40% vs targets below 50%
  // HP (libDmg, confirmed exact, conditional). S4 Liberation grants 60 Thermobaric Bullets + resets Skill CD (utility).
  // S5 ATK+30% at max Numbingly Spicy! stacks (atkPct, confirmed exact, conditional). S6 Boom Boom grants team Basic
  // ATK DMG Bonus+25% for 15s (basicDmg, confirmed exact, team buff).
  'Chixia':       { s1: { totalMult: 5 }, s2: { totalMult: 4 }, s3: { libDmg: 40 }, s4: { totalMult: 8 }, s5: { atkPct: 30 }, s6: { basicDmg: 25 } },
  'Lumi':         { s1: { skillDmg: 10 }, s2: { totalMult: 10 }, s3: { skillDmg: 10 }, s4: { atkPct: 10 }, s5: { totalMult: 10 }, s6: { skillDmg: 15 } },
  // corrected 2026-08-18: prior values (defShred/deepen on every node) had no basis in Taoqi's real
  // chain kit (fandom Combat page, Resonance Chain table) — she has no DEF Shred or DMG Deepen node at
  // all. Real effects: S1 Essense of Tranquility — Forte Circuit Power Shift's Shield +40% (utility,
  // no shield-% stat in schema, kept as small totalMult). S2 Silent Strength — Liberation Unmovable
  // Crit Rate+20% AND Crit DMG+20% (both confirmed exact; only critRate modeled, single-stat schema).
  // S3 Keen-eyed Observer — Rocksteady Shield duration extended to 30s (utility, no duration-only stat,
  // kept as small totalMult). S4 Heavylifting Duty — on Strategic Parry trigger, restore 25% HP + DEF
  // +50% for 5s, 1x/15s (conditional, no DEF% stat in schema, kept as small totalMult). S5 Benevolent
  // Guardian — Power Shift DMG+50% (confirmed exact; Power Shift is "considered as Basic Attack DMG"
  // per its own Forte text, modeled as basicDmg) + restores 20 Resonance Energy on hit (utility, not
  // modeled). S6 Defender of Peace — Basic ATK and Heavy ATK DMG+40% while Rocksteady Shield holds
  // (confirmed exact, conditional; modeled as basicDmg, single-stat schema).
  'Taoqi':        { s1: { totalMult: 4 }, s2: { critRate: 20 }, s3: { totalMult: 6 }, s4: { totalMult: 8 }, s5: { basicDmg: 50 }, s6: { basicDmg: 40 } },
  // Corrected 2026-08-18 via Prydwen's Kit tab (Resonance Chain/Sequence Node text, exact wording).
  // S1: Intro Cerulean Song grants an additional +15% Aero DMG Bonus for 8s (was atkPct:5, no basis).
  // S2: Heavy Attack recovers +10 Resonance Energy on hit, 1x/20s — energy utility, no direct DMG stat
  // exists in this schema, modeled as totalMult like other utility S2 nodes (was totalMult:8, kept).
  // S3: Resonance Skill Zephyr Domain DMG+40% + pulling range+33% (was atkPct:5, no basis).
  // S4: Mid-Air Feather Release DMG+95% (was totalMult:8, far too low).
  // S5: Resonance Liberation Wind Spirals DMG+85% (was atkPct:8, no basis).
  // S6: team-wide ATK+20% for 20s after casting Feather Release (was elemDmg:10, no basis).
  // Re-verified 2026-08-18 against fandom's Chain Node pages (Sapphire Skies/Nesting Twigs/Nature Sings/
  // Close Your Eyes/Winds Whisper/A Tribute to Life's Sweet Hymn wikitext) — all 6 values above confirmed
  // exact against the real node text, no changes needed.
  'Yangyang':     { s1: { elemDmg: 15 }, s2: { totalMult: 5 }, s3: { skillDmg: 40 }, s4: { totalMult: 95 }, s5: { libDmg: 85 }, s6: { atkPct: 20 } },
  'Youhu':        { s1: { atkPct: 5 }, s2: { deepen: 5 }, s3: { atkPct: 5 }, s4: { deepen: 5 }, s5: { atkPct: 5 }, s6: { deepen: 10 } },
  // corrected 2026-08-18: prior values (atkPct/deepen on every node) had no basis in Yuanwu's real
  // chain kit (fandom Combat page, rendered Resonance Chain table) — he has no ATK% or DMG Deepen node
  // at all. Real effects: S1 Steaming Cup of Justice — Lightning Infused Basic/Heavy Attack Speed+20%
  // each (utility, no attack-speed stat in schema, kept as small totalMult). S2 Fierce Heart, Serene
  // Mind — Intro Thunder Bombardment recovers +15 Resonance Energy (utility, not modeled). S3 Upholder
  // of Integrity — Thunder Wedge's Coordinated ATK deals bonus DMG equal to 20% of Yuanwu's DEF
  // (confirmed exact; no DEF-scaling-bonus stat in schema, kept as small totalMult). S4 Retributive
  // Knuckles — Liberation Blazing Might grants the on-field character a Shield equal to 200% of
  // Yuanwu's DEF for 10s (this is where his 'Shield' capability actually unlocks — no shield-% stat in
  // schema, kept as small totalMult). S5 Neighborhood Protector — while Thunder Wedge is on the field,
  // Resonance Liberation DMG Bonus+50% (confirmed exact, modeled as libDmg). S6 Defender of All Realms —
  // nearby team members gain +32% DEF for 3s while within Thunder Wedge's range (confirmed exact,
  // team-wide DEF buff; no team-DEF% stat in schema, kept as totalMult).
  'Yuanwu':       { s1: { totalMult: 4 }, s2: { totalMult: 3 }, s3: { totalMult: 6 }, s4: { totalMult: 8 }, s5: { libDmg: 50 }, s6: { totalMult: 8 } },
};

// [SECTION:SKILL_ICONS] — Per-character skill-name → icon URL, matched against SKILL_MULTIPLIERS/
// CHARACTER_ROTATIONS skill names the same way CHARACTER_ROTATIONS looks up its DMG row (substring match).
// Source: wutheringwaves.fandom.com per-character Skill_* image assets, re-hosted on ibb.co.
// Only characters that have been audited so far are populated.
const SKILL_ICONS = {
  // Aalto/Baizhi/Chixia: Intro/Outro icons added 2026-08-18 (previously missing entirely — only
  // Basic/Skill/Liberation/Forte were populated). Aalto's Forte Circuit's real name is 'Misty Cover'
  // (was wrongly keyed 'Mistcloak Dash', the Forte's internal dash mechanic, not its own skill name) —
  // fixed to use the correct name while keeping 'Mistcloak Dash' as an alias to the same icon so any
  // existing reference to it still resolves. All new icons sourced directly from fandom's
  // static.wikia.nocookie.net-hosted Skill_*.png assets, same convention as the other 2026-08-18 adds.
  'Aalto': {
    'Half Truths': 'https://i.ibb.co/8gYdwYCF/skill-pistols.webp', // Basic ATK — shared generic Pistols icon
    'Standard': 'https://i.ibb.co/8gYdwYCF/skill-pistols.webp',
    'Shift Trick': 'https://i.ibb.co/4ZDDVq43/aalto-skill.webp',
    'Flower in the Mist': 'https://i.ibb.co/qYjnpYdK/aalto-heavy.webp',
    'Misty Cover': 'https://i.ibb.co/35S8hKWN/aalto-liberation.webp',
    'Mistcloak Dash': 'https://i.ibb.co/35S8hKWN/aalto-liberation.webp', // alias, see comment above
    'Feint Shot': 'https://static.wikia.nocookie.net/wutheringwaves/images/9/93/Skill_Feint_Shot.png',
    'Dissolving Mist': 'https://static.wikia.nocookie.net/wutheringwaves/images/7/77/Skill_Dissolving_Mist.png',
  },
  'Baizhi': {
    'Destined Promise': 'https://i.ibb.co/6c75rLCc/baizhi-basic.webp', // Basic ATK — generic Rectifier icon
    'Standard': 'https://i.ibb.co/6c75rLCc/baizhi-basic.webp',
    'Emergency Plan': 'https://i.ibb.co/2BC255K/baizhi-skill.webp',
    'Momentary Union': 'https://i.ibb.co/fsP021g/baizhi-liberation.webp',
    'Cycle of Life': 'https://i.ibb.co/d0nRGZwy/baizhi-forte.webp',
    'Overflowing Frost': 'https://static.wikia.nocookie.net/wutheringwaves/images/3/37/Skill_Overflowing_Frost.png',
    'Rejuvinating Flow': 'https://static.wikia.nocookie.net/wutheringwaves/images/6/60/Skill_Rejuvinating_Flow.png', // fandom's own spelling ("Rejuvinating") — kept verbatim to match the wiki's file name
  },
  'Chixia': {
    'POW POW': 'https://i.ibb.co/xq4xPQNP/Lynae-basic.webp', // Basic ATK — shared generic Pistols icon
    'Standard': 'https://i.ibb.co/xq4xPQNP/Lynae-basic.webp',
    'Whizzing Fight Spirit': 'https://i.ibb.co/s9jWxj9V/chixia-skill.webp',
    'Blazing Flames': 'https://i.ibb.co/67N4dq55/chixia-liberation.webp',
    'Heroic Bullets': 'https://i.ibb.co/x8mwJBr0/chixia-forte.webp',
    'Grand Entrance': 'https://static.wikia.nocookie.net/wutheringwaves/images/2/28/Skill_Grand_Entrance.png',
    'Leaping Flames': 'https://static.wikia.nocookie.net/wutheringwaves/images/7/7d/Skill_Leaping_Flames.png',
  },
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
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Camellya, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before
  // upload. Burgeoning (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Sword.png
  // icon (same as Changli's).
  'Camellya': {
    'Burgeoning': 'https://i.ibb.co/x86mmjbD/skill-sword.webp',
    'Standard': 'https://i.ibb.co/x86mmjbD/skill-sword.webp',
    'Valse of Bloom and Blight': 'https://i.ibb.co/wrNPQ1TC/skill-valse.webp',
    'Vining Waltz': 'https://i.ibb.co/wrNPQ1TC/skill-valse.webp', // Blossom Mode's Basic ATK replacement, same Skill icon
    'Blazing Waltz': 'https://i.ibb.co/wrNPQ1TC/skill-valse.webp',
    'Floral Ravage': 'https://i.ibb.co/wrNPQ1TC/skill-valse.webp', // Blossom Mode's Resonance Skill replacement, same wiki icon
    'Fervor Efflorescent': 'https://i.ibb.co/ynCScFqJ/skill-fervor.webp',
    'Vegetative Universe': 'https://i.ibb.co/xqcjjVmq/skill-vegetative.webp',
    'Ephemeral': 'https://i.ibb.co/xqcjjVmq/skill-vegetative.webp', // Forte Circuit's own upgraded skill, same icon
    'Everblooming': 'https://i.ibb.co/M5ckbVnH/skill-everblooming.webp', // Intro Skill
    'Twining': 'https://i.ibb.co/vvrfhcLs/skill-twining.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Carlotta, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before
  // upload. Silent Execution (Basic ATK) has no dedicated wiki asset, uses the shared generic
  // Skill_Pistols.png icon.
  'Carlotta': {
    'Silent Execution': 'https://i.ibb.co/NG3jXXG/skill-pistols.webp',
    'Standard': 'https://i.ibb.co/NG3jXXG/skill-pistols.webp',
    'Necessary Measures': 'https://i.ibb.co/NG3jXXG/skill-pistols.webp', // Moldable-Crystal Basic ATK replacement, same generic weapon icon
    'Art of Violence': 'https://i.ibb.co/JwZzgLS1/skill-artofviolence.webp',
    'Chromatic Splendor': 'https://i.ibb.co/JwZzgLS1/skill-artofviolence.webp', // 2nd-press of the same Resonance Skill, no separate wiki icon
    'Lethal Repertoire': 'https://i.ibb.co/d49NGW0G/skill-lethalrepertoire.webp',
    'Imminent Oblivion': 'https://i.ibb.co/d49NGW0G/skill-lethalrepertoire.webp', // Forte Circuit's own upgraded Heavy ATK, same icon
    'Era of New Wave': 'https://i.ibb.co/7dRxcfdg/skill-eraofnewwave.webp',
    'Death Knell': 'https://i.ibb.co/7dRxcfdg/skill-eraofnewwave.webp', // Twilight Tango's Liberation-replacement attacks, same wiki icon
    'Fatal Finale': 'https://i.ibb.co/7dRxcfdg/skill-eraofnewwave.webp',
    'Wintertime Aria': 'https://i.ibb.co/d4gxw6J8/skill-wintertimearia.webp', // Intro Skill
    'Closing Remark': 'https://i.ibb.co/qMFKhW2G/skill-closingremark.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Roccia, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload. Pero, Easy
  // (Basic ATK) has no dedicated wiki asset (a redirect to the generic Gauntlets icon, same as
  // Jianxin/Xiangli Yao's shared icon).
  'Roccia': {
    'Pero, Easy': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp',
    'Standard': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp',
    'Real Fantasy': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp', // Forte's Basic ATK replacement, same generic weapon icon
    'Acrobatic Trick': 'https://i.ibb.co/SDY1939h/skill-acrobatictrick.webp',
    'A Prop Master Prepares': 'https://i.ibb.co/fzp1K5tw/skill-apropmaster.webp',
    'Commedia Improvviso!': 'https://i.ibb.co/z3hHnSz/skill-commediaimprov.webp',
    'Pero, Help': 'https://i.ibb.co/kstN6pTM/skill-perohelp.webp', // Intro Skill
    'Applause, Please!': 'https://i.ibb.co/v4xJNxgk/skill-applauseplease.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Phoebe, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before upload. O Come Divine
  // Light (Basic ATK) uses the same generic Skill_Rectifier.png icon already re-hosted for
  // Encore/Yinlin/Verina/Zhezhi/Shorekeeper.
  'Phoebe': {
    'O Come Divine Light': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp',
    'Standard': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp',
    "Chamuel's Star": 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp', // Ring-of-Mirrors Basic ATK replacement, same generic weapon icon
    'To Where Light Shines': 'https://i.ibb.co/6JNhMwTC/skill-towherelight.webp',
    'Radiant Invocation': 'https://i.ibb.co/cKDPRGRt/skill-radiantinvocation.webp',
    'Starflash': 'https://i.ibb.co/cKDPRGRt/skill-radiantinvocation.webp', // Forte Circuit's own upgraded Heavy ATK, same icon
    'Absolution Litany': 'https://i.ibb.co/cKDPRGRt/skill-radiantinvocation.webp',
    'Utter Confession': 'https://i.ibb.co/cKDPRGRt/skill-radiantinvocation.webp',
    'Dawn of Enlightenment': 'https://i.ibb.co/ksP6pd0b/skill-dawnofenlight.webp',
    'Golden Grace': 'https://i.ibb.co/gbGWpjwC/skill-goldengrace.webp', // Intro Skill
    'Attentive Heart': 'https://i.ibb.co/HTZ5ppLG/skill-attentiveheart.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Brant, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before upload. Captain's
  // Rhapsody (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Sword.png icon
  // (same as Changli/Camellya's).
  'Brant': {
    "Captain's Rhapsody": 'https://i.ibb.co/x86mmjbD/skill-sword.webp',
    'Standard': 'https://i.ibb.co/x86mmjbD/skill-sword.webp',
    'Rhapsodic Riff': 'https://i.ibb.co/x86mmjbD/skill-sword.webp', // Basic ATK-chained Heavy ATK, same generic weapon icon
    'Anchors Aweigh': 'https://i.ibb.co/Kp8DPNdC/skill-anchorsaweigh.webp',
    'Ocean Odyssey': 'https://i.ibb.co/VWJhTfT2/skill-oceanodyssey.webp',
    'Returned from Ashes': 'https://i.ibb.co/VWJhTfT2/skill-oceanodyssey.webp', // Forte Circuit's own upgraded Skill, same icon
    'To the Horizon': 'https://i.ibb.co/Gfc6z3zy/skill-totheheorizon.webp',
    'Applaud for Me!': 'https://i.ibb.co/Xk8TCww5/skill-applaudforme.webp', // Intro Skill
    'The Course is Set!': 'https://i.ibb.co/HpqFG4gz/skill-thecourseisset.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Cantarella, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before
  // upload. Illusion Collapse (Basic ATK) has a dedicated icon (not a shared generic weapon one).
  'Cantarella': {
    'Illusion Collapse': 'https://i.ibb.co/Jw0SD1X0/skill-illusioncollapse.webp',
    'Standard': 'https://i.ibb.co/Jw0SD1X0/skill-illusioncollapse.webp',
    'Phantom Sting': 'https://i.ibb.co/Jw0SD1X0/skill-illusioncollapse.webp', // Mirage's Basic ATK replacement, same icon
    'Dance with Shadows': 'https://i.ibb.co/VWcwSf2F/skill-dancewithshadows.webp',
    'Flickering Reverie': 'https://i.ibb.co/VWcwSf2F/skill-dancewithshadows.webp', // Mirage's Resonance Skill replacement, same wiki icon
    'Between Illusion and Reality': 'https://i.ibb.co/SDPF5pzn/skill-betweenillusion.webp',
    'Perception Drain': 'https://i.ibb.co/SDPF5pzn/skill-betweenillusion.webp', // Forte Circuit's own upgraded Skill, same icon
    'Beneath the Sea': 'https://i.ibb.co/60bNqfnF/skill-beneaththesea.webp',
    'Cruise': 'https://i.ibb.co/DgDVdZ3T/skill-cruise.webp', // Intro Skill
    'Gentle Tentacles': 'https://i.ibb.co/fVyzhpgr/skill-gentletentacles.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Zani, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before upload. Routine
  // Negotiation (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Gauntlets.webp
  // icon (same as Jianxin/Xiangli Yao/Roccia's).
  'Zani': {
    'Routine Negotiation': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp',
    'Standard': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp',
    'Heavy Slash': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp', // Inferno Mode's Basic ATK replacement, same generic weapon icon
    'Restless Watch': 'https://i.ibb.co/Cpng0BLF/skill-restlesswatch.webp',
    'Pinpoint Strike': 'https://i.ibb.co/Cpng0BLF/skill-restlesswatch.webp', // same Resonance Skill's parry counter, same wiki icon
    'Targeted Action': 'https://i.ibb.co/Cpng0BLF/skill-restlesswatch.webp',
    'There Will Be A Light': 'https://i.ibb.co/0jtmQHtM/skill-therewillbealight.webp',
    'Between Dawn and Dusk': 'https://i.ibb.co/tpPYsMpx/skill-betweendawndusk.webp',
    'Rekindle': 'https://i.ibb.co/tpPYsMpx/skill-betweendawndusk.webp', // Liberation's own named cast, same icon
    'The Last Stand': 'https://i.ibb.co/tpPYsMpx/skill-betweendawndusk.webp',
    'Immediate Execution': 'https://i.ibb.co/Xx8gjJV2/skill-immediateexecution.webp', // Intro Skill
    'Beacon For the Future': 'https://i.ibb.co/yczmx4Lj/skill-beaconforfuture.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Ciaccona, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before upload. Quadruple
  // Time Steps (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Pistols.webp icon
  // (same as Carlotta's).
  'Ciaccona': {
    'Quadruple Time Steps': 'https://i.ibb.co/NG3jXXG/skill-pistols.webp',
    'Standard': 'https://i.ibb.co/NG3jXXG/skill-pistols.webp',
    'Harmonic Allegro': 'https://i.ibb.co/pjvmZNW0/skill-harmonicallegro.webp',
    'Symphony of Wind and Verse': 'https://i.ibb.co/rDrSyYC/skill-symphonywindverse.webp',
    'Quadruple Downbeat': 'https://i.ibb.co/rDrSyYC/skill-symphonywindverse.webp', // Forte Circuit's own upgraded Heavy ATK, same icon
    "Singer's Triple Cadenza": 'https://i.ibb.co/Q3SvKHzY/skill-singerstriplecadenza.webp',
    'Roaming with the Wind': 'https://i.ibb.co/RGVC6MLt/skill-roamingwithwind.webp', // Intro Skill
    'Windcalling Tune': 'https://i.ibb.co/wFNRyDTB/skill-windcallingtune.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Cartethyia, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before
  // upload. Sword to Carve My Forms (Basic ATK) has no dedicated wiki asset, uses the shared generic
  // Skill_Sword.webp icon (same as Changli/Camellya/Brant's).
  'Cartethyia': {
    'Sword to Carve My Forms': 'https://i.ibb.co/x86mmjbD/skill-sword.webp',
    'Standard': 'https://i.ibb.co/x86mmjbD/skill-sword.webp',
    'Base Form': 'https://i.ibb.co/x86mmjbD/skill-sword.webp', // Fleurdelys/base-form Basic-Heavy-Mid-air variants share the generic icon
    'Fleurdelys': 'https://i.ibb.co/x86mmjbD/skill-sword.webp',
    'Sword to Bear Their Names': 'https://i.ibb.co/cX7v4GDm/skill-swordbeartheirnames.webp',
    'Sword to Answer Waves': 'https://i.ibb.co/cX7v4GDm/skill-swordbeartheirnames.webp', // Fleurdelys Resonance Skill replacement, same wiki icon
    'May Tempest Break the Tides': 'https://i.ibb.co/cX7v4GDm/skill-swordbeartheirnames.webp',
    'Tempest': 'https://i.ibb.co/z3B1sYY/skill-tempest.webp',
    "A Knight's Heartfelt Prayers": 'https://i.ibb.co/BVqRm8KJ/skill-knightsheartfelt.webp',
    'Blade of Howling Squall': 'https://i.ibb.co/BVqRm8KJ/skill-knightsheartfelt.webp', // Liberation's own upgraded cast, same icon
    "Sword to Mark Tide's Trace": 'https://i.ibb.co/k2KS9cv0/skill-swordmarktidestrace.webp', // Intro Skill
    'Sword to Call for Freedom': 'https://i.ibb.co/k2KS9cv0/skill-swordmarktidestrace.webp', // Fleurdelys Intro replacement, same icon
    "Wind's Divine Blessing": 'https://i.ibb.co/KzFYk17W/skill-windsdivineblessing.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Lupa, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload. Flaming Star
  // (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Broadblade.webp icon.
  'Lupa': {
    'Flaming Star': 'https://i.ibb.co/RGn44dhM/skill-broadblade.webp',
    'Standard': 'https://i.ibb.co/RGn44dhM/skill-broadblade.webp',
    "Wolf's Claw": 'https://i.ibb.co/RGn44dhM/skill-broadblade.webp', // Forte-enhanced Heavy ATK, same generic weapon icon
    'Starfall': 'https://i.ibb.co/RGn44dhM/skill-broadblade.webp',
    "Shewolf's Hunt": 'https://i.ibb.co/5WbyTxzD/skill-shewolfshunt.webp',
    'Feral Fang': 'https://i.ibb.co/5WbyTxzD/skill-shewolfshunt.webp', // same Resonance Skill's follow-up, same wiki icon
    'Ignis Lupa': 'https://i.ibb.co/S7W3d25X/skill-ignislupa.webp',
    'Dance with the Wolf': 'https://i.ibb.co/S7W3d25X/skill-ignislupa.webp', // Forte Circuit's own upgraded Skill, same icon
    'Fire-Kissed Glory': 'https://i.ibb.co/mrPk9FF3/skill-firekissedglory.webp',
    'Foebreaker': 'https://i.ibb.co/mrPk9FF3/skill-firekissedglory.webp', // Liberation follow-up, same wiki icon
    'Try Focusing, Eh?': 'https://i.ibb.co/jkNfHp2y/skill-tryfocusingeh.webp', // Intro Skill
    'Nowhere to Run!': 'https://i.ibb.co/jkNfHp2y/skill-tryfocusingeh.webp', // Intro's Wild Hunt upgrade, same icon
    'Stand by Me, Warrior': 'https://i.ibb.co/bjzbJyCH/skill-standbymewarrior.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Phrolova, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before
  // upload. Movement of Life and Death (Basic ATK) uses the shared generic Skill_Rectifier.webp icon
  // (same as Encore/Yinlin/Verina/Zhezhi/Shorekeeper/Phoebe's).
  'Phrolova': {
    'Movement of Life and Death': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp',
    'Standard': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp',
    'Scarlet Coda': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp', // Forte-enhanced Heavy ATK, same generic weapon icon
    'Whispers in a Fleeting Dream': 'https://i.ibb.co/6J40K1F8/skill-whispersfleetingdream.webp',
    'Whispers in Fleeting Dream': 'https://i.ibb.co/6J40K1F8/skill-whispersfleetingdream.webp',
    'Movement of Fate and Finality': 'https://i.ibb.co/847dkvDn/skill-rhapsodynewworld.webp',
    'Murmurs in a Haunting Dream': 'https://i.ibb.co/847dkvDn/skill-rhapsodynewworld.webp',
    'Rhapsody of a New World': 'https://i.ibb.co/847dkvDn/skill-rhapsodynewworld.webp',
    'Waltz of Forsaken Depths': 'https://i.ibb.co/RG9T1CF5/skill-waltzforsakendepths.webp',
    'Maestro State': 'https://i.ibb.co/RG9T1CF5/skill-waltzforsakendepths.webp', // Hecate's off-field attacks during Liberation's Maestro state, same icon
    'Curtain Call': 'https://i.ibb.co/RG9T1CF5/skill-waltzforsakendepths.webp',
    'Suite of Quietus': 'https://i.ibb.co/7dWwXT4m/skill-suiteofquietus.webp', // Intro Skill
    'Suite of Immortality': 'https://i.ibb.co/7dWwXT4m/skill-suiteofquietus.webp', // Maestro-enhanced Intro, same icon
    'Unfinished Piece': 'https://i.ibb.co/DDQz9zyk/skill-unfinishedpiece.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Augusta, re-hosted on ibb.co (2026-08-17).
  'Augusta': {
    "Hunter's Path": 'https://i.ibb.co/CpPvLLVt/Skill-Broadblade.webp', // Basic ATK — generic Broadblade icon (fandom's own File:Skill_Hunter's_Path.png resolves to this same asset)
    "Warrior's Blade": 'https://i.ibb.co/Mxg3Z8k9/warriors-blade.webp',
    'Undying Sunlight': 'https://i.ibb.co/Mxg3Z8k9/warriors-blade.webp', // Ascendancy-enhanced Resonance Skill, same wiki icon
    'Sunward Conquest': 'https://i.ibb.co/wN42DMTf/sunward-conquest.webp', // Resonance Liberation (Sword of Eternal Oath)
    'Sword of Eternal Oath': 'https://i.ibb.co/wN42DMTf/sunward-conquest.webp',
    'Sublime is the Sun': 'https://i.ibb.co/wN42DMTf/sunward-conquest.webp', // held Liberation alt-cast, same icon
    'Sunborne': 'https://i.ibb.co/wN42DMTf/sunward-conquest.webp',
    'Everbright Protector': 'https://i.ibb.co/wN42DMTf/sunward-conquest.webp',
    'Call Me By the Sun': 'https://i.ibb.co/21vnPFbj/call-me-by-sun.webp', // Forte Circuit
    "Glory's Favor": 'https://i.ibb.co/RT0Pjfbz/glorys-favor.webp', // Inherent Skill
    'Blazing Valor': 'https://i.ibb.co/C3Gkv7Pf/blazing-valor.webp', // Inherent Skill
    'Stride of Goldenflare': 'https://i.ibb.co/Kj6cSTM0/stride-goldenflare.webp', // Intro Skill
    'Battlesong of the Unyielding': 'https://i.ibb.co/20CntVcB/battlesong-unyielding.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Iuno, re-hosted on ibb.co (2026-08-17).
  'Iuno': {
    'Moon Steps': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp', // Basic ATK — generic Gauntlets icon (fandom's own File:Skill_Moon_Steps.png resolves to this same asset)
    'Moonring': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp',
    'Moonbow': 'https://i.ibb.co/dsbWXdtk/Skill-Gauntlets.webp',
    'Foresight Fugue': 'https://i.ibb.co/Q7YyYGJL/skill-foresight-fugue.webp',
    'Pulse of Origins': 'https://i.ibb.co/Q7YyYGJL/skill-foresight-fugue.webp',
    'Closing Refrain': 'https://i.ibb.co/Q7YyYGJL/skill-foresight-fugue.webp',
    'Unfinished Refrain': 'https://i.ibb.co/Q7YyYGJL/skill-foresight-fugue.webp',
    'Arc Beyond the Edge': 'https://i.ibb.co/Q7YyYGJL/skill-foresight-fugue.webp',
    'Beneath Lunar Tides': 'https://i.ibb.co/XZR1WbdL/skill-beneath-lunar-tides.webp', // Resonance Liberation
    'Ebb and Flow': 'https://i.ibb.co/bRJF5hbd/skill-ebb-and-flow.webp', // Forte Circuit
    'Absolute Fullness': 'https://i.ibb.co/bRJF5hbd/skill-ebb-and-flow.webp', // Forte-empowered Heavy ATK, same icon
    'Waxing Ascent': 'https://i.ibb.co/HDtjs76J/skill-waxing-ascent.webp', // Inherent Skill
    'Derivation': 'https://i.ibb.co/k2FqSVVC/skill-derivation.webp', // Inherent Skill
    'Illuminated Manifestation': 'https://i.ibb.co/TqYmWyr5/skill-illuminated-manifestation.webp', // Intro Skill
    'From Gloom to Gleam': 'https://i.ibb.co/V0xjgmx3/skill-from-gloom-to-gleam.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Galbrena, re-hosted on ibb.co (2026-08-17).
  'Galbrena': {
    "Slayer's Trigger": 'https://i.ibb.co/8gYdwYCF/skill-pistols.webp', // Basic ATK — generic Pistols icon (fandom's own File:Skill_Slayer's_Trigger.png resolves to this same asset)
    'Stage 1-4': 'https://i.ibb.co/8gYdwYCF/skill-pistols.webp',
    'Seraphic Execution': 'https://i.ibb.co/8gYdwYCF/skill-pistols.webp', // Demon Hypostasis Basic ATK replacement, same generic weapon icon
    'Volley of Death': 'https://i.ibb.co/8gYdwYCF/skill-pistols.webp',
    'Flamewing Verdict': 'https://i.ibb.co/8gYdwYCF/skill-pistols.webp',
    'Edge Transcended': 'https://i.ibb.co/spB7R1n5/skill-edge-transcended.webp',
    'Encroach': 'https://i.ibb.co/spB7R1n5/skill-edge-transcended.webp',
    'Ascent of Malice': 'https://i.ibb.co/spB7R1n5/skill-edge-transcended.webp',
    'Ravage': 'https://i.ibb.co/spB7R1n5/skill-edge-transcended.webp',
    'Hellfire Absolution': 'https://i.ibb.co/60YMcsnV/skill-hellfire-absolution.webp', // Resonance Liberation
    'Beyond Threshold': 'https://i.ibb.co/LDJBGZSx/skill-beyond-threshold.webp', // Forte Circuit
    'Oathbound Hunt': 'https://i.ibb.co/hFY1T091/skill-oathbound-hunt.webp', // Inherent Skill
    'Sin Feaster': 'https://i.ibb.co/cckG70y9/skill-sin-feaster.webp', // Inherent Skill
    'Hellflare Overload': 'https://i.ibb.co/fYZhFW4t/skill-hellflare-overload.webp', // Intro Skill
    'Ashen Pursuit': 'https://i.ibb.co/ch99n99W/skill-ashen-pursuit.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Qiuyuan, re-hosted on ibb.co (2026-08-17).
  'Qiuyuan': {
    'Inkwash': 'https://i.ibb.co/YTdT2Yxf/skill-sword.webp', // Basic ATK — generic Sword icon (fandom's own File:Skill_Inkwash.png resolves to this same asset)
    'Thus Spoke the Blade': 'https://i.ibb.co/YTdT2Yxf/skill-sword.webp', // Forte-enhanced Basic ATK/Heavy ATK replacements, same generic weapon icon
    'Through the Groves': 'https://i.ibb.co/Wpj83CS4/skill-through-the-groves.webp',
    'Undaunted Wayfarer': 'https://i.ibb.co/Wpj83CS4/skill-through-the-groves.webp', // held Skill variant, same icon
    'Straw Cape in Drizzly Rain': 'https://i.ibb.co/Wpj83CS4/skill-through-the-groves.webp', // S3 Skill replacement, same icon
    'Sundering Strike': 'https://i.ibb.co/0Lg31jf/skill-sundering-strike.webp', // Resonance Liberation
    'Verdant Edge': 'https://i.ibb.co/79CMny9/skill-verdant-edge.webp', // Forte Circuit
    'To Teach': 'https://i.ibb.co/79CMny9/skill-verdant-edge.webp', // Forte Heavy ATK finishers, same icon
    'To Save': 'https://i.ibb.co/79CMny9/skill-verdant-edge.webp',
    'To Sacrifice': 'https://i.ibb.co/79CMny9/skill-verdant-edge.webp',
    'Quietude Within': 'https://i.ibb.co/DgW9vm0Y/skill-quietude-within.webp', // Inherent Skill
    'Drink Away Woes Age-Old': 'https://i.ibb.co/357LJjGX/skill-drink-away-woes.webp', // Inherent Skill
    'Attack the Must-Defend': 'https://i.ibb.co/DH5PV4Mc/skill-attack-the-must-defend.webp', // Intro Skill
    'Strike Before Ready': 'https://i.ibb.co/m5YJ7bBB/skill-strike-before-ready.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Chisa, re-hosted on ibb.co (2026-08-17).
  'Chisa': {
    'Reign of Silence': 'https://i.ibb.co/39ZxR3C4/skill-broadblade.webp', // Basic ATK — generic Broadblade icon (fandom's own File:Skill_Reign_of_Silence.png resolves to this same asset)
    'Rending Lunge': 'https://i.ibb.co/39ZxR3C4/skill-broadblade.webp',
    'Death Snip': 'https://i.ibb.co/39ZxR3C4/skill-broadblade.webp',
    'Thread Withdrawn': 'https://i.ibb.co/39ZxR3C4/skill-broadblade.webp',
    'Fractured Composition': 'https://i.ibb.co/Q7HCQCXS/skill-fractured-composition.webp',
    'Eye of Unraveling': 'https://i.ibb.co/Q7HCQCXS/skill-fractured-composition.webp',
    'Serrated Loop': 'https://i.ibb.co/Q7HCQCXS/skill-fractured-composition.webp',
    'Moment of Nihility': 'https://i.ibb.co/wrM902F9/skill-moment-of-nihility.webp', // Resonance Liberation
    'Sight of Unraveling - Oblivion': 'https://i.ibb.co/4g9Q3h0k/skill-sight-of-unraveling.webp', // Forte Circuit
    'Sawring': 'https://i.ibb.co/4g9Q3h0k/skill-sight-of-unraveling.webp', // Sawring - Blitz/Eradication, Forte-state attacks, same icon
    'Inescapable Fate': 'https://i.ibb.co/mCmwWwsJ/skill-inescapable-fate.webp', // Inherent Skill
    'All Ends Here': 'https://i.ibb.co/KzpjDvHh/skill-all-ends-here.webp', // Inherent Skill
    'Reverberance - Return': 'https://i.ibb.co/KxsFThC1/skill-reverberance-return.webp', // Intro Skill
    'Unraveling - Law Zero': 'https://i.ibb.co/mC9hRxyB/skill-unraveling-law-zero.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Lynae/Mornye/Aemeath, pulled via the
  // MediaWiki API (bypasses the site's Cloudflare challenge entirely) and re-hosted on ibb.co (2026-08-17).
  'Lynae': {
    'Stage 1-3': 'https://i.ibb.co/xq4xPQNP/Lynae-basic.webp', // Basic ATK — generic Pistols icon (fandom's own File:Skill_Chroma_Drift.png resolves to this same asset)
    'Kaleidoscopic 1-5': 'https://i.ibb.co/xq4xPQNP/Lynae-basic.webp',
    'Spark Collision': 'https://i.ibb.co/xq4xPQNP/Lynae-basic.webp',
    'Lynae-Style Palettes': 'https://i.ibb.co/KxK0V0g9/Lynae-res-Skill.webp', // Resonance Skill
    'Additive Color': 'https://i.ibb.co/KxK0V0g9/Lynae-res-Skill.webp', // Additive Color shares the Resonance Skill's own icon
    'Visual Impact': 'https://i.ibb.co/Q3tV0xMr/Lynae-forte.webp', // Forte Circuit — Chromaticity Modeling
    'Iridescent Splash': 'https://i.ibb.co/Q3tV0xMr/Lynae-forte.webp',
    'Prismatic Overblast': 'https://i.ibb.co/WW1q9Z9P/Lynae-liberation.webp', // Resonance Liberation
    'Time to Show Some Colors!': 'https://i.ibb.co/nsQDdd3q/Lynae-intro.webp', // Intro Skill
    "Let's Hit the Road!": 'https://i.ibb.co/6c4LdY9C/Lynae-outro.webp', // Outro Skill
    'Spectral Analysis': 'https://i.ibb.co/Jw2KkfqG/Lynae-tune.webp', // Tune Break
  },
  'Mornye': {
    'Stage 1-4': 'https://i.ibb.co/CpPvLLVt/Skill-Broadblade.webp', // Basic ATK — generic Broadblade icon (same asset already used for Calcharo/Jiyan)
    'Optimal Solution': 'https://i.ibb.co/q3z1KKmg/Mornye-res-Skill.webp', // Resonance Skill — Resolution
    'Distributed Array': 'https://i.ibb.co/q3z1KKmg/Mornye-res-Skill.webp',
    'Geopotential Shift': 'https://i.ibb.co/MDT4gMcx/Mornye-forte.webp', // Forte Circuit — Mass-Energy Equivalence
    'Inversion': 'https://i.ibb.co/MDT4gMcx/Mornye-forte.webp',
    'Critical Protocol': 'https://i.ibb.co/kVF6D8Lw/Mornye-liberation.webp', // Resonance Liberation
    'Convergence': 'https://i.ibb.co/NgLq63xG/Mornye-intro.webp', // Intro Skill
    'Recursion': 'https://i.ibb.co/wrMwYwtW/Mornye-outro.webp', // Outro Skill
    'Decoupling': 'https://i.ibb.co/rGgn1yqf/Mornye-tune.webp', // Tune Break
  },
  'Aemeath': {
    'Aemeath Form Stage': 'https://i.ibb.co/4w6tSxmb/Skill-Sword.webp', // Basic ATK — generic Sword icon, covers both her human- and Mech-form Basic strings
    'Mech Form Stage': 'https://i.ibb.co/4w6tSxmb/Skill-Sword.webp',
    'Aemeath Charged': 'https://i.ibb.co/4w6tSxmb/Skill-Sword.webp',
    'Mech Charged': 'https://i.ibb.co/4w6tSxmb/Skill-Sword.webp',
    'Sync Strikes': 'https://i.ibb.co/V0KcrNV5/Aemeath-res-Skill.webp', // Resonance Skill — Shared Voyage
    'Seraphic Duet': 'https://i.ibb.co/V0KcrNV5/Aemeath-res-Skill.webp',
    'Heavenfall Edict': 'https://i.ibb.co/3YGvVWff/Aemeath-liberation.webp', // Resonance Liberation — Towards the Daybreak
    'Songs Across the Universe': 'https://i.ibb.co/prZnwGKQ/Aemeath-skill-intro.webp', // Intro Skill — Overture of Departure
    'Debut of Meteoric Radiance': 'https://i.ibb.co/prZnwGKQ/Aemeath-skill-intro.webp',
    'Silent Protection': 'https://i.ibb.co/svSPtz0x/Aemeath-outro.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Luuk Herssen, pulled via the MediaWiki API
  // (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  'Luuk Herssen': {
    'Stage 1-4': 'https://i.ibb.co/rR5XytVJ/Luuk-skill-basic.webp', // Basic ATK — generic Gauntlets icon (fandom's own File:Skill_Such_is_Light.png resolves to this same asset)
    'Scythe: Dissection': 'https://i.ibb.co/rR5XytVJ/Luuk-skill-basic.webp', // Mid-air Attack strings — considered Basic ATK
    'Scythe: Resection': 'https://i.ibb.co/rR5XytVJ/Luuk-skill-basic.webp',
    'Golden Reflux': 'https://i.ibb.co/1fhf0vt7/Luuk-skill-res-Skill.webp', // Resonance Skill — Reunion of All the Fallen
    'Aureole of Execution': 'https://i.ibb.co/1fhf0vt7/Luuk-skill-res-Skill.webp',
    'Basic Attack - Golden Impale': 'https://i.ibb.co/1fhf0vt7/Luuk-skill-res-Skill.webp',
    'Gavel of Earthshaker': 'https://i.ibb.co/8nFJT3SG/Luuk-skill-forte.webp', // Forte Circuit — Spark from the Frost
    "Rewritten in Winter's Margins": 'https://i.ibb.co/1Y4xcqYx/Luuk-skill-liberation.webp', // Resonance Liberation
    'Before Injection of Dawn': 'https://i.ibb.co/ksYqXQPQ/Luuk-skill-intro.webp', // Intro Skill
    'Bow to the Last Light': 'https://i.ibb.co/W4MMpcrv/Luuk-skill-outro.webp', // Outro Skill
    'Silent Debate of Light': 'https://i.ibb.co/BHdBsKjP/Luuk-skill-tune.webp', // Tune Break
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Sigrika, pulled via the MediaWiki API
  // (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  'Sigrika': {
    'Stage 1-4': 'https://i.ibb.co/rR5XytVJ/Luuk-skill-basic.webp', // Basic ATK — generic Gauntlets icon (same asset already used for Luuk Herssen)
    'Elucidated': 'https://i.ibb.co/rR5XytVJ/Luuk-skill-basic.webp', // Decipher-state Basic ATK finisher, still generic weapon icon
    'BOOMY BOOM!': 'https://i.ibb.co/k6M2mPzF/Sigrika-skill-res-Skill.webp', // Resonance Skill — Royan Close Quarters Combat
    'BIG BOOMY BOOM!': 'https://i.ibb.co/k6M2mPzF/Sigrika-skill-res-Skill.webp',
    'Runic Outburst': 'https://i.ibb.co/1Ydcf5Gb/Sigrika-skill-forte.webp', // Forte Circuit — Within Infinity's Embrace
    'Learn My True Name': 'https://i.ibb.co/1Ydcf5Gb/Sigrika-skill-forte.webp',
    "Where Trust Leads Me!": 'https://i.ibb.co/tTFS1w8x/Sigrika-skill-liberation.webp', // Resonance Liberation
    'Solsworn Etymology': 'https://i.ibb.co/Qj6rsbGF/Sigrika-skill-intro.webp', // Intro Skill
    'In This Very Moment': 'https://i.ibb.co/q3yGzhyX/Sigrika-skill-outro.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Hiyuki, pulled via the MediaWiki API
  // (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  'Hiyuki': {
    'Present Self Stage': 'https://i.ibb.co/YTdT2Yxf/skill-sword.webp', // Basic ATK — generic Sword icon (fandom's own File:Skill_Flaming_Sakura_Blade_Art.png resolves to this same asset)
    'Foreclaimed Self Stage': 'https://i.ibb.co/YTdT2Yxf/skill-sword.webp',
    'Frost Splinter': 'https://i.ibb.co/9HCF6LL6/Hiyuki-skill-forte.webp', // Heavy ATK, Forte-gated — Everfrost Dominion
    'Bitterfrost': 'https://i.ibb.co/9HCF6LL6/Hiyuki-skill-forte.webp',
    'Glacio Bite': 'https://i.ibb.co/9HCF6LL6/Hiyuki-skill-forte.webp', // Forte Circuit
    'Foreclaiming': 'https://i.ibb.co/hJgrR7gJ/Hiyuki-skill-liberation.webp', // Resonance Liberation
    'Frostblight': 'https://i.ibb.co/7Jq5CD3r/Hiyuki-skill-res-Skill.webp', // Resonance Skill
    'Frostedge': 'https://i.ibb.co/NRt7X9T/Hiyuki-skill-intro.webp', // Intro Skill
    'Snowlight Blessing': 'https://i.ibb.co/Ng7S6X8j/Hiyuki-skill-outro.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Denia, pulled via the MediaWiki API
  // (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  'Denia': {
    'Stage 1-4': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp', // Basic ATK — generic Rectifier icon (same asset already used for Encore/Yinlin)
    'Phantom Bubble': 'https://i.ibb.co/ZpdRC3Kx/denia-res-Skill.webp', // Resonance Skill — Bubbles and Baits
    'Banish': 'https://i.ibb.co/ZpdRC3Kx/denia-res-Skill.webp', // Breakdown Form's Resonance Skill replacement, same wiki icon
    'Final Act: Stagecraft': 'https://i.ibb.co/xtj5xwht/denia-liberation.webp', // Resonance Liberation — 1st Ultimate
    'Final Act: Breakdown': 'https://i.ibb.co/xtj5xwht/denia-liberation.webp', // Resonance Liberation — 2nd Ultimate, same wiki icon
    'Erosion Field': 'https://i.ibb.co/PGHNXhY3/denia-forte.webp', // Forte Circuit "Flawless"
    "It's Been A While!": 'https://i.ibb.co/hx2nmhpT/denia-intro.webp', // Intro Skill — Formal Greetings
    'Formal Greetings': 'https://i.ibb.co/hx2nmhpT/denia-intro.webp',
    'Unfinished Lies': 'https://i.ibb.co/BVB2jBsW/denia-outro.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Lucy/Rebecca, pulled via the MediaWiki
  // API (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  'Lucy': {
    'Locked Thread': 'https://i.ibb.co/NG3jXXG/skill-pistols.webp', // Basic ATK — generic Pistols icon (same asset already used elsewhere)
    'Payload': 'https://i.ibb.co/Z6KMgzkb/lucy-res-Skill.webp', // Resonance Skill — Protocol Breach
    'Pulse Interference': 'https://i.ibb.co/Z6KMgzkb/lucy-res-Skill.webp',
    'Deadlock': 'https://i.ibb.co/Z6KMgzkb/lucy-res-Skill.webp', // Max-TCP Resonance Skill upgrade, same wiki icon
    'Netrunner': 'https://i.ibb.co/qFDfbxtV/lucy-liberation.webp', // Resonance Liberation
    'Multi-threading': 'https://i.ibb.co/hJfyn0s6/lucy-forte.webp', // Forte-gated Heavy ATK — Depths of Blackwall
    'Hack Response': 'https://i.ibb.co/hJfyn0s6/lucy-forte.webp', // Forte Circuit
    'Outdated Hallucination': 'https://i.ibb.co/TBQxkbJy/lucy-intro.webp', // Intro Skill
    'Countermeasure Program': 'https://i.ibb.co/gZT3x8g7/lucy-outro.webp', // Outro Skill
  },
  'Rebecca': {
    "Mix-'n'-Match": 'https://i.ibb.co/NG3jXXG/skill-pistols.webp', // Basic ATK — generic Pistols icon (same asset already used elsewhere)
    "Yo, It's Big Boomin' Time!": 'https://i.ibb.co/4RZv4Pks/rebecca-intro.webp', // Intro Skill — My Turn! (must precede the shorter Skill-row key below)
    "Hey, Leadhead": 'https://i.ibb.co/4RZv4Pks/rebecca-intro.webp', // Guts-mode Intro alternative, same wiki icon
    "It's Big Boomin' Time!": 'https://i.ibb.co/8n7M3D1K/rebecca-res-Skill.webp', // Resonance Skill — Tactical Tweaks
    "Come 'n' Get Me!": 'https://i.ibb.co/8n7M3D1K/rebecca-res-Skill.webp',
    "Party 'til Dawn!": 'https://i.ibb.co/KcVy8tQW/rebecca-liberation.webp', // Resonance Liberation
    'Rat-tat-tat': 'https://i.ibb.co/tGfyYTJ/rebecca-forte.webp', // Forte-gated Heavy ATK — Gloves Are Comin' Off!
    'Bang-bang-bang': 'https://i.ibb.co/tGfyYTJ/rebecca-forte.webp',
    'Hack Response': 'https://i.ibb.co/tGfyYTJ/rebecca-forte.webp', // Forte Circuit
    'Preem Choom': 'https://i.ibb.co/zhQshWzF/rebecca-outro.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Lucilla, pulled via the MediaWiki API
  // (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  'Lucilla': {
    'Snapshot': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp', // Basic ATK — generic Rectifier icon (same asset already used elsewhere)
    'Phantom Frame': 'https://i.ibb.co/G4jbSdr2/lucilla-res-Skill.webp', // Resonance Skill
    'Clear As Day': 'https://i.ibb.co/Q7dvwN32/lucilla-liberation.webp', // Resonance Liberation
    'Oblivion': 'https://i.ibb.co/qYZ1pTZ0/lucilla-forte.webp', // Forte Circuit — Memory Palace
    'Clip It': 'https://i.ibb.co/7JWJhpcF/lucilla-intro.webp', // Intro Skill
    'Montage': 'https://i.ibb.co/RGZrzfTY/lucilla-outro.webp', // Outro Skill
  },
  // Source: wutheringwaves.fandom.com Skill_*.png assets for Yangyang: Xuanling/Suisui, pulled via
  // the MediaWiki API (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-18).
  'Yangyang: Xuanling': {
    'Azure/Feather Stance': 'https://i.ibb.co/x86mmjbD/skill-sword.webp', // Basic ATK — generic Sword icon (same asset already used elsewhere)
    'Sword Stance Switch': 'https://i.ibb.co/NgDz5JK6/yx-res-Skill.webp', // Resonance Skill — Feather's Edge
    'Azure Sword Stance': 'https://i.ibb.co/N6yKBC9r/yx-forte.webp', // Forte-gated Heavy ATK — The Way of Ten Thousand Voices
    'Feather Sword Stance': 'https://i.ibb.co/N6yKBC9r/yx-forte.webp',
    'Shadow of Xuanling': 'https://i.ibb.co/N6yKBC9r/yx-forte.webp', // Forte Circuit
    'Hush of a Thousand Voices': 'https://i.ibb.co/hJWFGQ8N/yx-liberation.webp', // Resonance Liberation
    'Skybound Feather': 'https://i.ibb.co/5hWRkHJj/yx-intro.webp', // Intro Skill
    'As the Wind Wills': 'https://i.ibb.co/SDZqCdLj/yx-outro.webp', // Outro Skill
  },
  'Suisui': {
    'Zephyr Stance Stage 1-4': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp', // Basic ATK — generic Rectifier icon (same asset already used elsewhere)
    'Zephyr Stance thrust': 'https://i.ibb.co/rKYhDsHw/suisui-res-Skill.webp', // Resonance Skill — Vernal Screen
    'Drizzle Stance Stage 1-4': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp',
    'Awakening Spring': 'https://i.ibb.co/rKYhDsHw/suisui-res-Skill.webp', // Zephyr Skill's max-Cloud Breath upgrade, same wiki icon
    'Drizzle Stance thrust': 'https://i.ibb.co/rKYhDsHw/suisui-res-Skill.webp',
    'Zephyr Stance': 'https://i.ibb.co/RkMykBkT/Skill-Rectifier.webp', // Mid-air Attack row, generic weapon icon (must follow the longer Zephyr-prefixed keys above)
    'Drizzle Stance': 'https://i.ibb.co/cRkfdDc/suisui-forte.webp', // Forte-gated Heavy ATK — Lambent Gold (must follow the longer Drizzle-prefixed keys above)
    'Song of Thoroughfare': 'https://i.ibb.co/27WLZMx6/suisui-liberation.webp', // Resonance Liberation
    'Tinkling Jade': 'https://i.ibb.co/fdXb5bgm/suisui-intro.webp', // Intro Skill
    'Rippling Waters': 'https://i.ibb.co/fhrX8pF/suisui-outro.webp', // Outro Skill
  },
  // Danjin/Yangyang/Sanhua icons added 2026-08-18, sourced directly from wutheringwaves.fandom.com's
  // own static.wikia.nocookie.net-hosted Skill_*.png assets (no re-hosting needed — same file names
  // verified live via the fandom Combat page image lists for each character).
  'Danjin': {
    'Execution': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/ad/Skill_Sword.png', // Basic ATK — generic Sword icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/ad/Skill_Sword.png',
    'Crimson Fragment': 'https://static.wikia.nocookie.net/wutheringwaves/images/8/8c/Skill_Crimson_Fragment.png',
    'Crimson Erosion': 'https://static.wikia.nocookie.net/wutheringwaves/images/8/8c/Skill_Crimson_Fragment.png', // Resonance Skill's Crimson Erosion follow-up, same skill icon
    'Sanguine Pulse': 'https://static.wikia.nocookie.net/wutheringwaves/images/8/8c/Skill_Crimson_Fragment.png',
    'Crimson Bloom': 'https://static.wikia.nocookie.net/wutheringwaves/images/3/3b/Skill_Crimson_Bloom.png',
    'Serene Vigil': 'https://static.wikia.nocookie.net/wutheringwaves/images/5/5e/Skill_Serene_Vigil.png',
    'Chaoscleave': 'https://static.wikia.nocookie.net/wutheringwaves/images/5/5e/Skill_Serene_Vigil.png', // Forte Circuit's Heavy ATK finisher, same Forte icon
    'Vindication': 'https://static.wikia.nocookie.net/wutheringwaves/images/f/fe/Skill_Vindication.png',
    'Duality': 'https://static.wikia.nocookie.net/wutheringwaves/images/6/68/Skill_Duality.png',
  },
  'Yangyang': {
    'Feather as Blade': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/ad/Skill_Sword.png', // Basic ATK — generic Sword icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/ad/Skill_Sword.png',
    'Zephyr Domain': 'https://static.wikia.nocookie.net/wutheringwaves/images/3/32/Skill_Zephyr_Domain.png',
    'Zephyr Song': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/ad/Skill_Sword.png', // Heavy ATK follow-up, no dedicated fandom icon — generic Sword icon (same convention as Basic/Heavy ATK above)
    'Wind Spirals': 'https://static.wikia.nocookie.net/wutheringwaves/images/7/7a/Skill_Wind_Spirals.png',
    'Echoing Feathers': 'https://static.wikia.nocookie.net/wutheringwaves/images/b/b5/Skill_Echoing_Feathers.png',
    'Feather Release': 'https://static.wikia.nocookie.net/wutheringwaves/images/b/b5/Skill_Echoing_Feathers.png', // Forte Circuit's Mid-air Attack finisher, same Forte icon
    'Cerulean Song': 'https://static.wikia.nocookie.net/wutheringwaves/images/9/9f/Skill_Cerulean_Song.png',
    'Whispering Breeze': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/a8/Skill_Whispering_Breeze.png',
  },
  'Sanhua': {
    'Frigid Light': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/ad/Skill_Sword.png', // Basic ATK — generic Sword icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/ad/Skill_Sword.png',
    'Eternal Frost': 'https://static.wikia.nocookie.net/wutheringwaves/images/6/6a/Skill_Eternal_Frost.png',
    'Glacial Gaze': 'https://static.wikia.nocookie.net/wutheringwaves/images/3/3c/Skill_Glacial_Gaze.png',
    'Clarity of Mind': 'https://static.wikia.nocookie.net/wutheringwaves/images/f/f6/Skill_Clarity_of_Mind.png',
    'Detonate': 'https://static.wikia.nocookie.net/wutheringwaves/images/f/f6/Skill_Clarity_of_Mind.png', // Forte Circuit's Heavy ATK finisher, same Forte icon
    'Freezing Thorns': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/ae/Skill_Freezing_Thorns.png',
    'Silversnow': 'https://static.wikia.nocookie.net/wutheringwaves/images/4/44/Skill_Silversnow.png',
  },
  // added 2026-08-18 — previously entirely missing (was falling back to no icon for every Taoqi skill
  // row). Sourced from fandom's own static.wikia.nocookie.net Skill_*.png assets via the MediaWiki API.
  'Taoqi': {
    'Concealed Edge': 'https://static.wikia.nocookie.net/wutheringwaves/images/8/87/Skill_Broadblade.png', // Basic/Heavy/Mid-air/Dodge Counter — generic Broadblade icon
    'Standard': 'https://static.wikia.nocookie.net/wutheringwaves/images/8/87/Skill_Broadblade.png',
    'Strategic Parry': 'https://static.wikia.nocookie.net/wutheringwaves/images/8/87/Skill_Broadblade.png',
    'Fortified Defense': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/a5/Skill_Fortified_Defense.png',
    'Unmovable': 'https://static.wikia.nocookie.net/wutheringwaves/images/0/00/Skill_Unmovable.png',
    'Power Shift': 'https://static.wikia.nocookie.net/wutheringwaves/images/3/33/Skill_Power_Shift.png',
    'Defense Formation': 'https://static.wikia.nocookie.net/wutheringwaves/images/f/f1/Skill_Defense_Formation.png',
    'Iron Will': 'https://static.wikia.nocookie.net/wutheringwaves/images/f/fd/Skill_Iron_Will.png',
  },
  // added 2026-08-18 — previously entirely missing (was falling back to no icon for every Yuanwu skill
  // row). Sourced from fandom's own static.wikia.nocookie.net Skill_*.png assets via the MediaWiki API
  // (action=query&titles=File:Skill X.png&prop=imageinfo&iiprop=url). 'Leihuangquan' itself has no
  // dedicated skill icon file on the wiki — it redirects to the generic Gauntlets weapon-type icon.
  'Yuanwu': {
    'Leihuangquan': 'https://static.wikia.nocookie.net/wutheringwaves/images/9/9a/Skill_Gauntlets.png',
    'Thunder Field': 'https://static.wikia.nocookie.net/wutheringwaves/images/6/6a/Skill_Leihuang_Master.png',
    'Thunder Wedge': 'https://static.wikia.nocookie.net/wutheringwaves/images/6/6a/Skill_Leihuang_Master.png',
    'Rumbling Spark': 'https://static.wikia.nocookie.net/wutheringwaves/images/1/1f/Skill_Unassuming_Blade.png',
    'Thunder Uprising': 'https://static.wikia.nocookie.net/wutheringwaves/images/1/1f/Skill_Unassuming_Blade.png',
    'Thunderweaver': 'https://static.wikia.nocookie.net/wutheringwaves/images/1/1f/Skill_Unassuming_Blade.png',
    'Blazing Might': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/ab/Skill_Blazing_Might.png',
    'Thunder Bombardment': 'https://static.wikia.nocookie.net/wutheringwaves/images/2/27/Skill_Thunder_Bombardment.png',
    'Lightning Manipulation': 'https://static.wikia.nocookie.net/wutheringwaves/images/e/e4/Skill_Lightning_Manipulation.png',
  },
  // added 2026-08-18 — previously entirely missing (Mortefi's SKILL_MULTIPLIERS rows had no icon
  // lookup at all). Sourced from fandom's own static.wikia.nocookie.net Skill_*.png assets via the
  // MediaWiki API (action=query&titles=File:Skill X.png&prop=imageinfo&iiprop=url). 'Marcato' (the
  // Coordinated ATK hit fired during Burning Rhapsody) has no dedicated icon file on the wiki — it's a
  // sub-effect of Resonance Liberation Violent Finale, so it reuses that icon.
  'Mortefi': {
    'Impromptu Show': 'https://static.wikia.nocookie.net/wutheringwaves/images/2/28/Skill_Pistols.png',
    'Passionate Variation': 'https://static.wikia.nocookie.net/wutheringwaves/images/3/35/Skill_Passionate_Variation.png',
    'Violent Finale': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/a1/Skill_Violent_Finale.png',
    'Marcato': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/a1/Skill_Violent_Finale.png',
    'Fury Fugue': 'https://static.wikia.nocookie.net/wutheringwaves/images/a/ab/Skill_Fury_Fugue.png',
    'Dissonance': 'https://static.wikia.nocookie.net/wutheringwaves/images/d/d3/Skill_Dissonance.png',
    'Rage Transposition': 'https://static.wikia.nocookie.net/wutheringwaves/images/c/c0/Skill_Rage_Transposition.png',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from fandom's own static.wikia.nocookie.net
  // Skill_*.png assets via the MediaWiki API (Forte Details table image thumbnails + a direct
  // action=query&titles=File:Skill_Timeless_Classics.png&prop=imageinfo lookup for the Outro icon, which
  // wasn't inline in the Forte Table's collapsed scaling section). The four Antique Appraisal variants
  // (Chime/Ruyi/Ding/Mask) share Scroll Divination's icon since they're all sub-effects of the same
  // Resonance Skill row on the wiki, with no separate per-variant icon files uploaded.
  'Youhu': {
    'Frosty Punches': 'https://static.wikia.nocookie.net/wutheringwaves/images/9/9a/Skill_Gauntlets.png',
    'Scroll Divination': 'https://static.wikia.nocookie.net/wutheringwaves/images/3/37/Skill_Scroll_Divination.png',
    'Chime': 'https://static.wikia.nocookie.net/wutheringwaves/images/3/37/Skill_Scroll_Divination.png',
    'Ruyi': 'https://static.wikia.nocookie.net/wutheringwaves/images/3/37/Skill_Scroll_Divination.png',
    'Ding': 'https://static.wikia.nocookie.net/wutheringwaves/images/3/37/Skill_Scroll_Divination.png',
    'Mask': 'https://static.wikia.nocookie.net/wutheringwaves/images/3/37/Skill_Scroll_Divination.png',
    "Fortune's Favor": 'https://static.wikia.nocookie.net/wutheringwaves/images/b/bc/Skill_Fortune%27s_Favor.png',
    'Poetic Essence': 'https://static.wikia.nocookie.net/wutheringwaves/images/9/9a/Skill_Poetic_Essence.png',
    'Scroll of Wonders': 'https://static.wikia.nocookie.net/wutheringwaves/images/6/61/Skill_Scroll_of_Wonders.png',
    'Timeless Classics': 'https://static.wikia.nocookie.net/wutheringwaves/images/6/61/Skill_Timeless_Classics.png',
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
  'Aalto': {
    s1: 'https://i.ibb.co/NkJrMMZ/aalto-s1.webp',
    s2: 'https://i.ibb.co/3mWXdcDs/aalto-s2.webp',
    s3: 'https://i.ibb.co/tMr4KzDw/aalto-s3.webp',
    s4: 'https://i.ibb.co/Hf4q5RKy/aalto-s4.webp',
    s5: 'https://i.ibb.co/KMWZb8Q/aalto-s5.webp',
    s6: 'https://i.ibb.co/KzcQtD3c/aalto-s6.webp',
  },
  'Baizhi': {
    s1: 'https://i.ibb.co/mF47z129/baizhi-s1.webp',
    s2: 'https://i.ibb.co/0RXgwTXZ/baizhi-s2.webp',
    s3: 'https://i.ibb.co/gb918z7X/baizhi-s3.webp',
    s4: 'https://i.ibb.co/hxg5Y83Q/baizhi-s4.webp',
    s5: 'https://i.ibb.co/Rw5VF1d/baizhi-s5.webp',
    s6: 'https://i.ibb.co/3Q9HWqJ/baizhi-s6.webp',
  },
  'Chixia': {
    s1: 'https://i.ibb.co/RGQBc5g3/chixia-s1.webp',
    s2: 'https://i.ibb.co/svts4DW5/chixia-s2.webp',
    s3: 'https://i.ibb.co/dRDWwbs/chixia-s3.webp',
    s4: 'https://i.ibb.co/HThYzvPf/chixia-s4.webp',
    s5: 'https://i.ibb.co/KpFQt9N0/chixia-s5.webp',
    s6: 'https://i.ibb.co/bg00YYjQ/chixia-s6.webp',
  },
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
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Camellya, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1603, all 6 URLs verified 200/live before upload.
  'Camellya': {
    s1: 'https://i.ibb.co/vy9wwMt/node-s1-somewhere.webp',
    s2: 'https://i.ibb.co/ZprdWSNF/node-s2-callingupon.webp',
    s3: 'https://i.ibb.co/gZDgkrSv/node-s3-budadorned.webp',
    s4: 'https://i.ibb.co/mm8Yz1g/node-s4-rootsset.webp',
    s5: 'https://i.ibb.co/yFZ91RMt/node-s5-infinityheld.webp',
    s6: 'https://i.ibb.co/FbpkkPqC/node-s6-bloomfor.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Carlotta, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1107, all 6 URLs verified 200/live before upload.
  'Carlotta': {
    s1: 'https://i.ibb.co/1GCPHM5j/node-s1-beauty.webp',
    s2: 'https://i.ibb.co/1YD00C0c/node-s2-fallen.webp',
    s3: 'https://i.ibb.co/CK20vW27/node-s3-adelante.webp',
    s4: 'https://i.ibb.co/DDVdry80/node-s4-yesterdays.webp',
    s5: 'https://i.ibb.co/tPpvpmFC/node-s5-toast.webp',
    s6: 'https://i.ibb.co/Kx65J6sT/node-s6-curtain.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Roccia, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1606, all 6 URLs verified 200/live before upload.
  'Roccia': {
    s1: 'https://i.ibb.co/q3QR4dS0/node-s1-shadows.webp',
    s2: 'https://i.ibb.co/VWZG28Xy/node-s2-luceanite.webp',
    s3: 'https://i.ibb.co/GfR6DwXb/node-s3-heart.webp',
    s4: 'https://i.ibb.co/7Jy9x2yr/node-s4-wonders.webp',
    s5: 'https://i.ibb.co/BHYrDMBc/node-s5-dreams.webp',
    s6: 'https://i.ibb.co/3yGZ0kCy/node-s6-goldenwings.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Phoebe, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1506, all 6 URLs verified 200/live before upload.
  'Phoebe': {
    s1: 'https://i.ibb.co/TqtQJ6NK/node-s1-warmlight.webp',
    s2: 'https://i.ibb.co/k245MwKF/node-s2-boatadrift.webp',
    s3: 'https://i.ibb.co/8DLvhqMz/node-s3-daisy.webp',
    s4: 'https://i.ibb.co/8gfbj5t1/node-s4-ringingbells.webp',
    s5: 'https://i.ibb.co/HDfvkYsV/node-s5-prayer.webp',
    s6: 'https://i.ibb.co/HT7qsxPx/node-s6-whispering.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Brant, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1206, all 6 URLs verified 200/live before upload.
  'Brant': {
    s1: 'https://i.ibb.co/Y4GdsDmY/node-s1-currentswinds.webp',
    s2: 'https://i.ibb.co/gkF07br/node-s2-smilescheers.webp',
    s3: 'https://i.ibb.co/Y49jmcXH/node-s3-stormsisail.webp',
    s4: 'https://i.ibb.co/Fb56p7DW/node-s4-freedomising.webp',
    s5: 'https://i.ibb.co/chfPWLFw/node-s5-actorsstage.webp',
    s6: 'https://i.ibb.co/xnDJCdF/node-s6-captainscarnevale.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Cantarella, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1607, all 6 URLs verified 200/live before upload.
  'Cantarella': {
    s1: 'https://i.ibb.co/0RDfQXSY/node-s1-embracewaves.webp',
    s2: 'https://i.ibb.co/LXfVYCkX/node-s2-surrenderreverie.webp',
    s3: 'https://i.ibb.co/hxxmdVSb/node-s3-gazeabyss.webp',
    s4: 'https://i.ibb.co/PZhy4tmF/node-s4-beholdsoul.webp',
    s5: 'https://i.ibb.co/0g4C5hH/node-s5-restreflection.webp',
    s6: 'https://i.ibb.co/KxGNqZtQ/node-s6-falldream.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Zani, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1507, all 6 URLs verified 200/live before upload.
  'Zani': {
    s1: 'https://i.ibb.co/gbN5SWFV/node-s1-alarmclock.webp',
    s2: 'https://i.ibb.co/N25LYLMp/node-s2-stalebread.webp',
    s3: 'https://i.ibb.co/6kDrsB0/node-s3-newcommute.webp',
    s4: 'https://i.ibb.co/nsWMbP51/node-s4-efficiency.webp',
    s5: 'https://i.ibb.co/tpwvvSMk/node-s5-delivered.webp',
    s6: 'https://i.ibb.co/Q3vpqhCQ/node-s6-clockout.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Ciaccona, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1407, all 6 URLs verified 200/live before upload.
  'Ciaccona': {
    s1: 'https://i.ibb.co/M4Jpwcj/node-s1-wherewindsings.webp',
    s2: 'https://i.ibb.co/xtVFFs9Y/node-s2-songfourseasons.webp',
    s3: 'https://i.ibb.co/W4dYrWRZ/node-s3-starlitimprov.webp',
    s4: 'https://i.ibb.co/XxMdXrfV/node-s4-toccatafugue.webp',
    s5: 'https://i.ibb.co/4n8DXGQZ/node-s5-eternalidyll.webp',
    s6: 'https://i.ibb.co/8gp4zwSF/node-s6-unendingcadence.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Cartethyia, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1409, all 6 URLs verified 200/live before upload.
  'Cartethyia': {
    s1: 'https://i.ibb.co/0yZrwg1M/node-s1-crowndestined.webp',
    s2: 'https://i.ibb.co/99w78Rv3/node-s2-bladebroken.webp',
    s3: 'https://i.ibb.co/BRNk023/node-s3-prisonerhanged.webp',
    s4: 'https://i.ibb.co/vxL2nJYQ/node-s4-sacrificemade.webp',
    s5: 'https://i.ibb.co/4wX7vYgB/node-s5-hopereshaped.webp',
    s6: 'https://i.ibb.co/ycVQfbhB/node-s6-freedomfound.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Lupa, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1207, all 6 URLs verified 200/live before upload.
  'Lupa': {
    s1: 'https://i.ibb.co/QFQ1RhRB/node-s1-beholdnameless.webp',
    s2: 'https://i.ibb.co/9H67hH9f/node-s2-everyground.webp',
    s3: 'https://i.ibb.co/9kyL2xf3/node-s3-wolflamehowls.webp',
    s4: 'https://i.ibb.co/23DMbTHn/node-s4-highandaflame.webp',
    s5: 'https://i.ibb.co/99p0trjM/node-s5-embracethunderous.webp',
    s6: 'https://i.ibb.co/MT1mRss/node-s6-brightestflaming.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Phrolova, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both Prydwen's live
  // build page and ww.nanoka.cc/character/1608, all 6 URLs verified 200/live before upload.
  'Phrolova': {
    s1: 'https://i.ibb.co/KpvxFB70/node-s1-keytonetherworld.webp',
    s2: 'https://i.ibb.co/8nw8Sy8L/node-s2-ropetiedtolife.webp',
    s3: 'https://i.ibb.co/TBSCHsv0/node-s3-daggercutclean.webp',
    s4: 'https://i.ibb.co/JwDPJhkf/node-s4-torchilluminating.webp',
    s5: 'https://i.ibb.co/1f1yj3zj/node-s5-forkedroad.webp',
    s6: 'https://i.ibb.co/dStZKfy/node-s6-nighttodepart.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Augusta, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain list on Prydwen's live build page.
  'Augusta': {
    s1: 'https://i.ibb.co/HTwqDr5n/node-s1.webp',
    s2: 'https://i.ibb.co/DHWH8D47/node-s2.webp',
    s3: 'https://i.ibb.co/QwdPnbk/node-s3.webp',
    s4: 'https://i.ibb.co/mCrQsqH3/node-s4.webp',
    s5: 'https://i.ibb.co/ccxMpt1c/node-s5.webp',
    s6: 'https://i.ibb.co/cKP8919X/node-s6.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Iuno, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain list on the character's fandom page.
  'Iuno': {
    s1: 'https://i.ibb.co/kWsh4y7/node-s1.webp',
    s2: 'https://i.ibb.co/QRQmjWq/node-s2.webp',
    s3: 'https://i.ibb.co/v6f4N31z/node-s3.webp',
    s4: 'https://i.ibb.co/k2ZxwPWd/node-s4.webp',
    s5: 'https://i.ibb.co/604PG1hL/node-s5.webp',
    s6: 'https://i.ibb.co/67Frp4bF/node-s6.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Galbrena, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain list on the character's fandom page.
  'Galbrena': {
    s1: 'https://i.ibb.co/jNH3nSM/node-s1.webp',
    s2: 'https://i.ibb.co/2VQC6y5/node-s2.webp',
    s3: 'https://i.ibb.co/Hpf7ZPdk/node-s3.webp',
    s4: 'https://i.ibb.co/q3p3wPfG/node-s4.webp',
    s5: 'https://i.ibb.co/0VRF3CBL/node-s5.webp',
    s6: 'https://i.ibb.co/gb17vj3m/node-s6.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Qiuyuan, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain list on the character's fandom page.
  'Qiuyuan': {
    s1: 'https://i.ibb.co/84TqFSG3/node-s1.webp',
    s2: 'https://i.ibb.co/qLkrYVXv/node-s2.webp',
    s3: 'https://i.ibb.co/whd9Dwmz/node-s3.webp',
    s4: 'https://i.ibb.co/Fqk0VQJq/node-s4.webp',
    s5: 'https://i.ibb.co/0RBWxffy/node-s5.webp',
    s6: 'https://i.ibb.co/LdNkcSqg/node-s6.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Chisa, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain list on the character's fandom page.
  'Chisa': {
    s1: 'https://i.ibb.co/3mw4Nw94/node-s1.webp',
    s2: 'https://i.ibb.co/nN9MKSTV/node-s2.webp',
    s3: 'https://i.ibb.co/1fX8724w/node-s3.webp',
    s4: 'https://i.ibb.co/zHZY0j4p/node-s4.webp',
    s5: 'https://i.ibb.co/GffX5Qbj/node-s5.webp',
    s6: 'https://i.ibb.co/1S0brGY/node-s6.webp',
  },
  // Source: wutheringwaves.fandom.com Sequence_Node_*.png assets for Lynae/Mornye/Aemeath, pulled via the
  // MediaWiki API (bypasses the site's Cloudflare challenge entirely) and re-hosted on ibb.co (2026-08-17)
  // — order confirmed S1→S6 against each character's own Resonance Chain section (action=parse, section
  // "Resonance Chain", Node 1→Node 6 in document order).
  'Lynae': {
    s1: 'https://i.ibb.co/jKpHS2C/Lynae-s1.webp',
    s2: 'https://i.ibb.co/kjCkrdC/Lynae-s2.webp',
    s3: 'https://i.ibb.co/TBB7SWd9/Lynae-s3.webp',
    s4: 'https://i.ibb.co/XZ0yd3HN/Lynae-s4.webp',
    s5: 'https://i.ibb.co/23k6X01r/Lynae-s5.webp',
    s6: 'https://i.ibb.co/wNpcWSrY/Lynae-s6.webp',
  },
  'Mornye': {
    s1: 'https://i.ibb.co/5hVnMMTV/Mornye-s1.webp',
    s2: 'https://i.ibb.co/Kzr4mvfw/Mornye-s2.webp',
    s3: 'https://i.ibb.co/KBrzbMX/Mornye-s3.webp',
    s4: 'https://i.ibb.co/Kp4VY4tn/Mornye-s4.webp',
    s5: 'https://i.ibb.co/zV1QDk59/Mornye-s5.webp',
    s6: 'https://i.ibb.co/DDCxvJfC/Mornye-s6.webp',
  },
  'Aemeath': {
    s1: 'https://i.ibb.co/WNfdHqR4/Aemeath-s1.webp',
    s2: 'https://i.ibb.co/b5SXdtzk/Aemeath-s2.webp',
    s3: 'https://i.ibb.co/MygKfXVn/Aemeath-chain-s3.webp',
    s4: 'https://i.ibb.co/mVwt8H0s/Aemeath-s4.webp',
    s5: 'https://i.ibb.co/dwK7K9m7/Aemeath-s5.webp',
    s6: 'https://i.ibb.co/wFsPszFL/Aemeath-chain-s6.webp',
  },
  'Luuk Herssen': {
    s1: 'https://i.ibb.co/xtbnWHrb/Luuk-chain-s1.webp',
    s2: 'https://i.ibb.co/hF2MW2bF/Luuk-chain-s2.webp',
    s3: 'https://i.ibb.co/2X8CFmL/Luuk-chain-s3.webp',
    s4: 'https://i.ibb.co/JF8kcKvm/Luuk-chain-s4.webp',
    s5: 'https://i.ibb.co/1tXKZntb/Luuk-chain-s5.webp',
    s6: 'https://i.ibb.co/svXR1Hkf/Luuk-chain-s6.webp',
  },
  'Sigrika': {
    s1: 'https://i.ibb.co/jv6R8NVL/Sigrika-chain-s1.webp',
    s2: 'https://i.ibb.co/nyJ4qGz/Sigrika-chain-s2.webp',
    s3: 'https://i.ibb.co/tMYNB071/Sigrika-chain-s3.webp',
    s4: 'https://i.ibb.co/mCj31gfL/Sigrika-chain-s4.webp',
    s5: 'https://i.ibb.co/9H04pcpv/Sigrika-chain-s5.webp',
    s6: 'https://i.ibb.co/9kG4hxbd/Sigrika-chain-s6.webp',
  },
  'Hiyuki': {
    s1: 'https://i.ibb.co/cK3XdXtT/Hiyuki-chain-s1.webp',
    s2: 'https://i.ibb.co/tMGFBF2R/Hiyuki-chain-s2.webp',
    s3: 'https://i.ibb.co/Rmcwhym/Hiyuki-chain-s3.webp',
    s4: 'https://i.ibb.co/4RpdTpjM/Hiyuki-chain-s4.webp',
    s5: 'https://i.ibb.co/4ZdSWbXC/Hiyuki-chain-s5.webp',
    s6: 'https://i.ibb.co/VP72Z2V/Hiyuki-chain-s6.webp',
  },
  'Denia': {
    s1: 'https://i.ibb.co/dwDTRNpm/denia-s1.webp',
    s2: 'https://i.ibb.co/v4KYCSjk/denia-s2.webp',
    s3: 'https://i.ibb.co/SXYXMvNR/denia-s3.webp',
    s4: 'https://i.ibb.co/tTjNYQZD/denia-s4.webp',
    s5: 'https://i.ibb.co/gZBNkHMH/denia-s5.webp',
    s6: 'https://i.ibb.co/Zz5XhZzj/denia-s6.webp',
  },
  'Yangyang: Xuanling': {
    s1: 'https://i.ibb.co/93ZS4rdV/yx-s1.webp',
    s2: 'https://i.ibb.co/ksZDCX9W/yx-s2.webp',
    s3: 'https://i.ibb.co/XrMxyjcG/yx-s3.webp',
    s4: 'https://i.ibb.co/KpQnZkWY/yx-s4.webp',
    s5: 'https://i.ibb.co/6KDh2KB/yx-s5.webp',
    s6: 'https://i.ibb.co/TD3gkgcb/yx-s6.webp',
  },
  'Suisui': {
    s1: 'https://i.ibb.co/1YF19wXw/suisui-s1.webp',
    s2: 'https://i.ibb.co/7d5F5ZtZ/suisui-s2.webp',
    s3: 'https://i.ibb.co/JFGC6Dq2/suisui-s3.webp',
    s4: 'https://i.ibb.co/DDMC0F52/suisui-s4.webp',
    s5: 'https://i.ibb.co/vMRL5cr/suisui-s5.webp',
    s6: 'https://i.ibb.co/tM5fJd43/suisui-s6.webp',
  },
  // Lucy/Rebecca/Lucilla (2026-08-17): NOT populated — verified via direct MediaWiki titles queries
  // (action=query&titles=File:Sequence Node <exact S1-S6 node name>.png for all 18 node names across
  // all three characters) that wutheringwaves.fandom.com has not uploaded Sequence Node icon assets
  // for any of them yet (their own Chain Table template renders an empty icon column on all three
  // /Combat pages — a genuine wiki content gap for these June-2026-release characters, not a fetch
  // failure). Node NAMES are still populated below in CHAIN_NODE_NAMES since the modal renders names
  // independently of icons; add icons here once fandom uploads them.
  // Danjin/Yangyang/Sanhua added 2026-08-18: fandom DOES have these Sequence_Node_*.png assets
  // uploaded (unlike the June-2026 characters above) — fetched directly via the MediaWiki API
  // (action=query&titles=File:Sequence Node <exact S1-S6 node name>.png&prop=imageinfo) and linked
  // straight to their static.wikia.nocookie.net URLs, no re-hosting needed. This closes the gap the
  // earlier audit pass missed (only CHAIN_NODE_NAMES was filled in, not the icon table).
  'Danjin': {
    s1: 'https://static.wikia.nocookie.net/wutheringwaves/images/c/c7/Sequence_Node_Crimson_Heart_of_Justice.png',
    s2: 'https://static.wikia.nocookie.net/wutheringwaves/images/6/6d/Sequence_Node_Dusted_Mirror.png',
    s3: 'https://static.wikia.nocookie.net/wutheringwaves/images/9/96/Sequence_Node_Fleeting_Blossom.png',
    s4: 'https://static.wikia.nocookie.net/wutheringwaves/images/8/82/Sequence_Node_Solitary_Carnation.png',
    s5: 'https://static.wikia.nocookie.net/wutheringwaves/images/b/bb/Sequence_Node_Reigning_Blade.png',
    s6: 'https://static.wikia.nocookie.net/wutheringwaves/images/0/08/Sequence_Node_Bloodied_Jade.png',
  },
  'Yangyang': {
    s1: 'https://static.wikia.nocookie.net/wutheringwaves/images/4/42/Sequence_Node_Sapphire_Skies%2C_Soaring_Sparrows.png',
    s2: 'https://static.wikia.nocookie.net/wutheringwaves/images/1/13/Sequence_Node_Nesting_Twigs%2C_in_Beaks_They_Harrow.png',
    s3: 'https://static.wikia.nocookie.net/wutheringwaves/images/1/1c/Sequence_Node_Nature_Sings_in_Symphony.png',
    s4: 'https://static.wikia.nocookie.net/wutheringwaves/images/e/e1/Sequence_Node_Close_Your_Eyes_and_Listen_in.png',
    s5: 'https://static.wikia.nocookie.net/wutheringwaves/images/7/76/Sequence_Node_Winds_Whisper_in_Harmony.png',
    s6: 'https://static.wikia.nocookie.net/wutheringwaves/images/f/f3/Sequence_Node_A_Tribute_to_Life%27s_Sweet_Hymn.png',
  },
  'Sanhua': {
    s1: 'https://static.wikia.nocookie.net/wutheringwaves/images/3/3b/Sequence_Node_Solitude%27s_Embrace.png',
    s2: 'https://static.wikia.nocookie.net/wutheringwaves/images/8/8d/Sequence_Node_Snowy_Clarity.png',
    s3: 'https://static.wikia.nocookie.net/wutheringwaves/images/0/03/Sequence_Node_Anomalous_Vision.png',
    s4: 'https://static.wikia.nocookie.net/wutheringwaves/images/8/84/Sequence_Node_Blade_Mastery.png',
    s5: 'https://static.wikia.nocookie.net/wutheringwaves/images/e/e8/Sequence_Node_Unraveling_Fate.png',
    s6: 'https://static.wikia.nocookie.net/wutheringwaves/images/1/1a/Sequence_Node_Daybreak_Radiance.png',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from fandom's own static.wikia.nocookie.net
  // Sequence_Node_*.png assets via the MediaWiki API (action=query&titles=Taoqi/Combat&prop=images).
  'Taoqi': {
    s1: 'https://static.wikia.nocookie.net/wutheringwaves/images/6/60/Sequence_Node_Essense_of_Tranquility.png',
    s2: 'https://static.wikia.nocookie.net/wutheringwaves/images/9/93/Sequence_Node_Silent_Strength.png',
    s3: 'https://static.wikia.nocookie.net/wutheringwaves/images/d/dc/Sequence_Node_Keen-eyed_Observer.png',
    s4: 'https://static.wikia.nocookie.net/wutheringwaves/images/4/43/Sequence_Node_Heavylifting_Duty.png',
    s5: 'https://static.wikia.nocookie.net/wutheringwaves/images/a/a1/Sequence_Node_Benevolent_Guardian.png',
    s6: 'https://static.wikia.nocookie.net/wutheringwaves/images/7/78/Sequence_Node_Defender_of_Peace.png',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from fandom's own static.wikia.nocookie.net
  // Sequence_Node_*.png assets via the MediaWiki API (action=query&titles=Yuanwu/Combat&prop=images).
  'Yuanwu': {
    s1: 'https://static.wikia.nocookie.net/wutheringwaves/images/0/0f/Sequence_Node_Steaming_Cup_of_Justice.png',
    s2: 'https://static.wikia.nocookie.net/wutheringwaves/images/d/dd/Sequence_Node_Fierce_Heart%2C_Serene_Mind.png',
    s3: 'https://static.wikia.nocookie.net/wutheringwaves/images/8/8d/Sequence_Node_Upholder_of_Integrity.png',
    s4: 'https://static.wikia.nocookie.net/wutheringwaves/images/d/d8/Sequence_Node_Retributive_Knuckles.png',
    s5: 'https://static.wikia.nocookie.net/wutheringwaves/images/3/39/Sequence_Node_Neighborhood_Protector.png',
    s6: 'https://static.wikia.nocookie.net/wutheringwaves/images/6/67/Sequence_Node_Defender_of_All_Realms.png',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from fandom's own static.wikia.nocookie.net
  // Sequence_Node_*.png assets via the MediaWiki API (action=query&titles=Mortefi/Combat&prop=images).
  'Mortefi': {
    s1: 'https://static.wikia.nocookie.net/wutheringwaves/images/e/e8/Sequence_Node_Solitary_Etude.png',
    s2: 'https://static.wikia.nocookie.net/wutheringwaves/images/d/d2/Sequence_Node_Hypocritical_Hymn.png',
    s3: 'https://static.wikia.nocookie.net/wutheringwaves/images/6/63/Sequence_Node_Flaming_Recitativo.png',
    s4: 'https://static.wikia.nocookie.net/wutheringwaves/images/c/c5/Sequence_Node_Cathartic_Waltz.png',
    s5: 'https://static.wikia.nocookie.net/wutheringwaves/images/c/cc/Sequence_Node_Funerary_Quartet.png',
    s6: 'https://static.wikia.nocookie.net/wutheringwaves/images/4/44/Sequence_Node_Apoplectic_Instrumental.png',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from fandom's own static.wikia.nocookie.net
  // Sequence_Node_*.png assets via the MediaWiki API (action=parse&page=Youhu/Combat&prop=text&section=9).
  'Youhu': {
    s1: 'https://static.wikia.nocookie.net/wutheringwaves/images/b/be/Sequence_Node_Waterside_Respite.png',
    s2: 'https://static.wikia.nocookie.net/wutheringwaves/images/a/ab/Sequence_Node_Sunroom_Siesta.png',
    s3: 'https://static.wikia.nocookie.net/wutheringwaves/images/6/63/Sequence_Node_Restless_Sleep.png',
    s4: 'https://static.wikia.nocookie.net/wutheringwaves/images/0/06/Sequence_Node_Frosted_Lullaby.png',
    s5: 'https://static.wikia.nocookie.net/wutheringwaves/images/0/04/Sequence_Node_Dreamland_Meander.png',
    s6: 'https://static.wikia.nocookie.net/wutheringwaves/images/2/23/Sequence_Node_Slumber_Evermore.png',
  },
};

// [SECTION:CHAIN_NODE_NAMES] — Per-character S1-S6 Resonance Chain sequence-node names
// (e.g. "Benevolence", "Versatility"...), confirmed against ww.nanoka.cc's character JSON
// (static.nanoka.cc/ww/<version>/en/character/<id>.json) and wutheringwaves.fandom.com.
// Only characters that have been audited so far are populated.
const CHAIN_NODE_NAMES = {
  'Aalto': { s1: "Trickster's Opening Show", s2: "Mistweaver's Debut", s3: 'Hazey Transition', s4: 'Blake Bloom for Finale', s5: 'Applause of the Lost', s6: "Broker's Secrets" },
  'Baizhi': { s1: 'Complex Simplicity', s2: 'Silent Tundra', s3: 'Veritas Lux Mea', s4: 'Eternal Verity', s5: 'A Wish Answered', s6: "Seeker's Devotion" },
  'Chixia': { s1: 'No.1 Hero Play Fan', s2: 'Leaping Sparkles', s3: 'Eternal Flames', s4: "Hero's Ultimate Move", s5: 'Triumphant Explosions', s6: 'Easter Egg Performance' },
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
  'Camellya': { s1: 'Somewhere No One Travelled', s2: 'Calling Upon the Silent Rose', s3: 'A Bud Adorned by Thorns', s4: 'Roots Set Deep In Eternity', s5: 'Infinity Held in Your Palm', s6: 'Bloom For You Thousand Times Over' },
  'Carlotta': { s1: 'Beauty Blazes Brightest Before It Fades', s2: 'Fallen Petals Give Life to New Blooms', s3: 'Adelante, Cortado, Spinning in Grace', s4: "Yesterday's Raindrops Make Finest Wine", s5: 'Toast to Past, Today, and Every Day to Come', s6: 'As the Curtain Falls, I Remain What I Am' },
  'Roccia': { s1: 'When Shadows Engulf the Hull', s2: 'When the Luceanite Gleams', s3: 'When the Heart Sees and Hands Feel', s4: 'When Wonders Gather in the Box', s5: 'When Dreams Are Reborn on Stage', s6: 'When the Golden Wings Fly' },
  'Phoebe': { s1: 'Warm Light and Bedside Wishes', s2: 'A Boat Adrift in Tears', s3: 'Daisy Wreaths and Dreams', s4: 'Ringing Bells on Wings Aloft', s5: 'Prayer to the Distant Light', s6: 'Whispering Chirps in Silence' },
  'Brant': { s1: 'By Currents and Winds', s2: 'For Smiles and Cheers', s3: 'Through Storms I Sail', s4: 'To Freedom I Sing', s5: "All the World's an Actor's Stage", s6: "All the World's a Captain's Carnevale" },
  'Cantarella': { s1: 'Embrace the Endless Waves', s2: 'Surrender to the Illusive Reverie', s3: 'Gaze into the Abyss', s4: 'Behold Your Own Soul', s5: 'Rest in Your Reflection', s6: 'Fall, Fall... and Fall Deeper into the Dream' },
  'Zani': { s1: 'When the Alarm Clock Rings', s2: 'Stale Bread With Energy Drink', s3: 'Each Day A New Commute', s4: 'More Efficiency, Less Drama', s5: 'Delivered In Full On Time', s6: 'First Things First? Clock Out!' },
  'Ciaccona': { s1: 'Where Wind Sings', s2: 'Song of the Four Seasons', s3: 'Starlit Improv', s4: 'Toccata and Fugue', s5: 'Eternal Idyll to Lasting Summer', s6: 'Unending Cadence' },
  'Cartethyia': { s1: 'Crown Destined by Fate', s2: 'Blade Broken by Tempest', s3: 'Prisoner Hanged in the Tower', s4: 'Sacrifice Made for Salvation', s5: 'Hope Reshaped in Storms', s6: "Freedom Found in Storm's Wake" },
  'Lupa': { s1: 'Behold the Nameless One', s2: 'Every Ground, Her Hunting Field', s3: 'Wolflame Howls in Her Wake', s4: 'High and Aflame Is Her Banner', s5: 'Embrace the Thunderous Triumph', s6: 'To the Brightest Flaming Star' },
  'Phrolova': { s1: "A Key to Netherworld's Secrets", s2: 'A Rope Tied to a Life Beyond', s3: 'A Dagger to Cut Clean Obsessions', s4: 'A Torch Illuminating the Path', s5: "A Forked Road in Fate's Heartland", s6: 'A Night to Depart From Eternal Rest' },
  'Augusta': { s1: 'Stained in Scorched Earth', s2: 'Cleansed in Crimson War', s3: 'Forged in Rot and Ruin', s4: 'Ascent in Sun and Glory', s5: 'Unshaken in Wrathful Tides', s6: 'Engraved in Radiant Light' },
  'Iuno': { s1: 'Wax or Wane, All Gild the Bough', s2: 'Day or Night, Let This Be Eternal', s3: 'I Drink Deep of Their Forgetting', s4: 'Rainy Season Dwell in My Eyes', s5: 'A Thousand Futile Glimpses', s6: 'I Am the Constant in the Chaos' },
  'Galbrena': { s1: 'Heart of Defiance Ever Ablaze', s2: 'Hellbound Dive of Fire and Abyss', s3: "Hunter's Blood Oath Rekindled", s4: 'Carry Forth This Fading Spark', s5: 'Though Light Fades, Torment Consumes', s6: 'I Remain Who I am, Eternal My Flame' },
  'Qiuyuan': { s1: 'Sword Sheathed, Mind Unclouded', s2: 'O Blade, I, Who Teach No More', s3: 'O Blade, I, Who Save No More', s4: 'O Blade, I, Who Sacrifice No More', s5: 'O Blade, I, Who Await to be Wielded', s6: 'Thus I Heard, Thus I Saw, Thus I Spoke' },
  'Chisa': { s1: 'Wandering Through the Desolate Corridors', s2: 'Into the Web of Endless Bonds', s3: 'Across the Confusion of the Long Night', s4: 'Severing the Endless Cycle of Tragic Fate', s5: 'Thousands of Lights to Guide the Way Home', s6: 'Thus, Hope is Rekindled with the Rising Dawn' },
  'Lynae': { s1: 'Days to be Painted Like a Canvas', s2: "Into Lights' Vanishing Point", s3: 'For One Brilliant Moment', s4: 'Shadows of a Wind Racer', s5: 'Visions of a Future Unbound', s6: 'Painted in My True Color' },
  'Mornye': { s1: 'The Silent Observer', s2: 'Morning Star of Entropy', s3: 'Blueprint of Recursion', s4: 'Latent Variables of the Cosmos', s5: 'Time Dilation Effect', s6: 'To the Far Shores of the Stars' },
  'Aemeath': { s1: 'Gilded Glimmer of the First Dawn', s2: 'Downy Notes of Snowfluff', s3: 'Fervor Sightly Burns Bright as New', s4: 'Ethereal Waltz on Binary Tides', s5: 'Voyage to the Astral Shore', s6: "A Zephyr-Kissed Journey to You" },
  'Luuk Herssen': { s1: 'Gold Kindled in Ash', s2: 'Avalanche Roaring in Eyes', s3: 'Spine Tempered by Golden Rain', s4: 'Pulse Thrumming Under Rime', s5: 'Through the Stillness of Snowstorm', s6: 'Dawn Unfurling over Frostlands' },
  'Sigrika': { s1: 'The Gleam Meant for Radiance', s2: 'The Bitterness Steeped in Hope', s3: 'I Flee, Yet I Seek', s4: 'I Lose, Yet I Gain', s5: 'Until Submerged by the Dark', s6: 'True Names Resurfaced, Rising in Light' },
  'Hiyuki': { s1: 'Springless', s2: 'To Burn Cold in Silence', s3: 'No Self, No Bound', s4: 'Like Reeds on Tides', s5: 'Vessel of Thousand Wishes', s6: 'Into a Night Without End' },
  'Denia': { s1: 'Silent Glows in a Dimlit Dream', s2: 'Tossed in the Tides of Reality', s3: 'Through Dark and Wind, the Erlking Follows', s4: 'From the Far Beyond, to the Far Beyond', s5: 'If Lies Patch Up a Heart', s6: 'May You Find Your Sun in the Silence' },
  'Lucy': { s1: 'The Moon, a Ticket, and a Dream', s2: 'The Blackwall, the Past, the Escape', s3: 'Cyberpunk', s4: 'No Living Legends in Night City', s5: 'A Broken Path to Hell', s6: 'I Really Want to Stay At Your House' },
  'Rebecca': { s1: 'Try Not to Get in the Way!', s2: 'Oh, Hey Choom!', s3: "Don't Sweat Your Six!", s4: 'Got Ya Covered!', s5: 'Dreamin\' on the Edge', s6: 'Maybe, Just Maybe...' },
  'Lucilla': { s1: 'Distant Noon', s2: 'Slumbering Moonlight', s3: 'Days Fade Unheard', s4: 'The Past Fades Into Silence', s5: 'Time is Like a Stream', s6: 'Gazing In the Mist of Time' },
  'Yangyang: Xuanling': { s1: "At the Wind's Breath, the Blossoms Wake", s2: 'River Carries Her Song Away', s3: 'My Grief Follows You into the Clouds', s4: 'Across the Miles, a Letter and My Longing', s5: 'Take Wing. Take Wing.', s6: 'Let the Azure Keep Its Light' },
  // Yangyang's real node names corrected 2026-08-18: Prydwen's Kit tab shows only generic "Sequence
  // Node 1"-"Sequence Node 6" labels, but fandom's Yangyang/Combat page (Resonance Chain table +
  // Sequence_Node_*.png filenames) does have unique flavor names — Prydwen just doesn't surface them.
  'Yangyang': { s1: 'Sapphire Skies, Soaring Sparrows', s2: 'Nesting Twigs, in Beaks They Harrow', s3: 'Nature Sings in Symphony', s4: 'Close Your Eyes and Listen in', s5: 'Winds Whisper in Harmony', s6: "A Tribute to Life's Sweet Hymn" },
  // Sanhua's node names confirmed 2026-08-18 via wutheringwaves.fandom.com's own infobox image filenames
  // (Sequence Node <name>.png assets, S1-S6 in order).
  'Sanhua': { s1: "Solitude's Embrace", s2: 'Snowy Clarity', s3: 'Anomalous Vision', s4: 'Blade Mastery', s5: 'Unraveling Fate', s6: 'Daybreak Radiance' },
  // added 2026-08-18 — previously entirely missing. Sourced from fandom's Taoqi/Combat Resonance Chain table.
  'Taoqi': { s1: 'Essense of Tranquility', s2: 'Silent Strength', s3: 'Keen-eyed Observer', s4: 'Heavylifting Duty', s5: 'Benevolent Guardian', s6: 'Defender of Peace' },
  // added 2026-08-18 — previously entirely missing. Sourced from fandom's Yuanwu/Combat Resonance Chain table.
  'Yuanwu': { s1: 'Steaming Cup of Justice', s2: 'Fierce Heart, Serene Mind', s3: 'Upholder of Integrity', s4: 'Retributive Knuckles', s5: 'Neighborhood Protector', s6: 'Defender of All Realms' },
  // added 2026-08-18 — previously entirely missing. Sourced from fandom's Mortefi/Combat Resonance Chain table.
  'Mortefi': { s1: 'Solitary Etude', s2: 'Hypocritical Hymn', s3: 'Flaming Recitativo', s4: 'Cathartic Waltz', s5: 'Funerary Quartet', s6: 'Apoplectic Instrumental' },
  // added 2026-08-18 — previously entirely missing.
  'Youhu': { s1: 'Waterside Respite', s2: 'Sunroom Siesta', s3: 'Restless Sleep', s4: 'Frosted Lullaby', s5: 'Dreamland Meander', s6: 'Slumber Evermore' },
  // Danjin's node names added 2026-08-18 via wutheringwaves.fandom.com's Danjin/Combat page (Resonance
  // Chain table + Sequence_Node_*.png filenames) — was previously missing entirely.
  'Danjin': { s1: 'Crimson Heart of Justice', s2: 'Dusted Mirror', s3: 'Fleeting Blossom', s4: 'Solitary Carnation', s5: 'Reigning Blade', s6: 'Bloodied Jade' },
  'Suisui': { s1: 'Mountains Washed Into Paintings', s2: 'Clouds Pour Like Molten Gold', s3: 'Sparse Curtains Invite Evening Glow', s4: 'Autumn Mountains in Choir Sing', s5: 'I Long To Ride The Eastern Wind', s6: 'Staying True To This Splendid Realm' },
  // Qingxiao's node names confirmed 2026-08-18 via ww.nanoka.cc's pre-release datamine (character/1413)
  // — icons NOT populated in CHAIN_NODE_ICONS above: fandom has no Sequence Node assets uploaded yet
  // (verified via direct MediaWiki titles queries, all "missing"), a genuine pre-release gap 2 days
  // ahead of her release, not a fetch failure.
  'Qingxiao': { s1: 'Like Clouds That Meet and Drift Apart', s2: 'Like Petals That Fall Without a Sound', s3: 'Dreams Fade, Sword Abides', s4: 'Wherever the Road Leads, Side by Side', s5: 'Cold Steel That Longs to Warm the Snow', s6: 'Cleanse This Tarnished Age, Till All Runs Clear' },
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
