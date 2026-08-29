// @ts-check
// Echo data — extracted from appcore-data.js for maintainability
// Edit this file to add/update echoes, sets, and echo damage data

import ENEMY_LEVEL_STATS from './enemyLevelStats.json';
import ENEMY_STAGGER_STATS from './enemyStaggerStats.json';

/** @type {Record<string, import('../types.js').EchoSetData>} */
const ECHO_SETS = {
  'Freezing Frost':       { element: 'Glacio',  p2: '+10% Glacio DMG',  p2val: { glacioDmg: 10 },  p5: 'Basic/Heavy Attack → +10% Glacio DMG (max x3)', p5val: { glacioDmg: 40 } },
  'Molten Rift':          { element: 'Fusion',  p2: '+10% Fusion DMG',  p2val: { fusionDmg: 10 },  p5: 'Res. Skill → +30% Fusion DMG', p5val: { fusionDmg: 40 } },
  'Void Thunder':         { element: 'Electro', p2: '+10% Electro DMG', p2val: { electroDmg: 10 }, p5: 'Heavy/Skill → +15% Electro DMG (max x2)', p5val: { electroDmg: 40 } },
  'Sierra Gale':          { element: 'Aero',    p2: '+10% Aero DMG',    p2val: { aeroDmg: 10 },    p5: 'Intro Skill → +30% Aero DMG', p5val: { aeroDmg: 40 } },
  'Celestial Light':      { element: 'Spectro', p2: '+10% Spectro DMG', p2val: { spectroDmg: 10 }, p5: 'Intro Skill → +30% Spectro DMG', p5val: { spectroDmg: 40 } },
  'Havoc Eclipse':        { element: 'Havoc',   p2: '+10% Havoc DMG',   p2val: { havocDmg: 10 },   p5: 'Basic/Heavy → +7.5% Havoc DMG (max x4)', p5val: { havocDmg: 40 } },
  // Sun-Sinking Eclipse was renamed to Havoc Eclipse in v1.4 — they are the same set
  'Rejuvenating Glow':    { element: 'Heal',    p2: '+10% Healing',     p2val: { healBonus: 10 },   p5: 'Heal ally → +15% ATK for team', p5val: { teamAtk: 15 } },
  'Moonlit Clouds':       { element: 'Support', p2: '+10% Energy Regen',p2val: { energyRegen: 10 }, p5: 'Outro → +22.5% ATK for next', p5val: { nextAtk: 22.5 } },
  'Lingering Tunes':      { element: 'ATK',     p2: '+10% ATK',         p2val: { atkPct: 10 },      p5: 'ATK +5%/1.5s (max x4), Outro +60%', p5val: { atkPct: 20, outroDmg: 60 } },
  'Frosty Resolve':       { element: 'Glacio',  p2: '+12% Res. Skill DMG', p2val: { skillDmg: 12 }, p5: 'Skill → +22.5% Glacio; Lib → +18% Skill (x2)', p5val: { glacioDmg: 22.5, skillDmg: 36 } },
  'Eternal Radiance':     { element: 'Spectro', p2: '+10% Spectro DMG', p2val: { spectroDmg: 10 }, p5: 'Frazzle → +20% Crit Rate; 10 stacks → +15% Spectro', p5val: { critRate: 20, spectroDmg: 15 } },
  'Midnight Veil':        { element: 'Havoc',   p2: '+10% Havoc DMG',   p2val: { havocDmg: 10 },   p5: 'Outro → 480% Havoc + 15% Havoc for next', p5val: { havocDmg: 15, outroDmg: 480 } },
  // corrected 2026-08-18 (echo audit): p5val.atkPct was doubled to 40 — nanoka.cc's raw sonata data shows
  // the on-crit ATK bonus is a flat, non-stacking +20% for 4s, not +40%.
  'Empyrean Anthem':      { element: 'Support', p2: '+10% Energy Regen',p2val: { energyRegen: 10 }, p5: 'Coord ATK +80%; on crit → +20% ATK', p5val: { coordDmg: 80, atkPct: 20 } },
  'Tidebreaking Courage': { element: 'Support', p2: '+10% Energy Regen',p2val: { energyRegen: 10 }, p5: '+15% ATK; ≥250% ER → +30% all DMG', p5val: { atkPct: 15, allDmg: 30 } },
  // corrected 2026-08-18: Gusts of Welkin and Windward Pilgrimage's 5pc effects were fabricated/swapped —
  // re-verified against nanoka.cc's raw sonata data. Gusts of Welkin's real 5pc is a flat team+self split
  // (Aero Erosion → team Aero DMG +15%, plus the triggerer gets an additional +15%, for 20s — no "per 3s
  // stacking x4" mechanic exists). Windward Pilgrimage's real 5pc is entirely self-target (hitting an
  // Aero-Eroded target → self Crit Rate +10% and Aero DMG +30% for 10s — it has no team component at all).
  'Gusts of Welkin':      { element: 'Aero',    p2: '+10% Aero DMG',    p2val: { aeroDmg: 10 },    p5: 'Aero Erosion → team Aero DMG +15%, +15% more for the triggerer (20s)', p5val: { aeroDmg: 30 } },
  'Windward Pilgrimage':  { element: 'Aero',    p2: '+10% Aero DMG',    p2val: { aeroDmg: 10 },    p5: 'Hitting Aero-Eroded target → self Crit Rate +10%, Aero DMG +30% (10s)', p5val: { critRate: 10, aeroDmg: 30 } },
  // v2.5–2.6 — Sanguis Plateaus sets
  'Flaming Clawprint':    { element: 'Fusion',  p2: '+10% Fusion DMG',  p2val: { fusionDmg: 10 },  p5: 'Liberation → +15% Fusion team, +20% Lib DMG for 35s', p5val: { fusionDmg: 15, libDmg: 20 } },
  'Crown of Valor':       { element: 'Shield',  p3: 'Shield → ATK +6%, Crit DMG +4% for 4s (0.5s CD, max x5)', p3val: { atkPct: 30, critDmg: 20 } },
  'Law of Harmony':       { element: 'Support', p3: 'Echo Skill → +30% Heavy ATK DMG 4s; team Echo Skill DMG +4% 30s (max x4)', p3val: { heavyDmg: 30, echoDmg: 16 } },
  // v2.7–2.8 — Chronorift sets
  "Flamewing's Shadow":   { element: 'Fusion',  p3: 'Echo Skill → +20% Heavy Crit Rate; Heavy ATK → +20% Echo Crit Rate; both → +16% Fusion DMG', p3val: { critRate: 20, fusionDmg: 16 } },
  'Thread of Severed Fate': { element: 'Havoc', p3: 'Havoc Bane → +20% ATK, +30% Liberation DMG for 5s', p3val: { atkPct: 20, libDmg: 30 } },
  'Dream of the Lost':    { element: 'Havoc',   p3: '0 Resonance Energy → +20% Crit Rate, +35% Echo Skill DMG', p3val: { critRate: 20, echoDmg: 35 } },
  // v3.0 — Lahai-Roi sets
  // corrected 2026-08-18: p5val.atkPct was 40 — nanoka.cc's raw sonata data caps the combined bonus at
  // +15% (Outro) + +15% (Tune Break Boost scaling) = 30%, not 40%.
  'Pact of Neonlight Leap': { element: 'Spectro', p2: '+10% Spectro DMG', p2val: { spectroDmg: 10 }, p5: 'Outro → next +15% ATK; per Tune Break Boost +0.3% ATK (max +15%)', p5val: { atkPct: 30 } },
  'Rite of Gilded Revelation': { element: 'Spectro', p2: '+10% Spectro DMG', p2val: { spectroDmg: 10 }, p5: 'Basic ATK → +10% Spectro DMG (max x3); 3 stacks + Lib → +40% Basic ATK DMG', p5val: { spectroDmg: 30, basicDmg: 40 } },
  'Halo of Starry Radiance': { element: 'Heal', p2: '+10% Healing',      p2val: { healBonus: 10 },   p5: 'Heal → per 1% Off-Tune Rate +0.2% ATK team (max +25%)', p5val: { teamAtk: 25 } },
  // v3.1 — Frostlands sets
  'Trailblazing Star':    { element: 'Fusion',  p2: '+10% Fusion DMG',  p2val: { fusionDmg: 10 },  p5: 'Fusion Burst/Tune Rupture → +20% Crit Rate, +20% Fusion DMG for 8s', p5val: { critRate: 20, fusionDmg: 20 } },
  'Chromatic Foam':        { element: 'Fusion',  p2: '+10% Fusion DMG',  p2val: { fusionDmg: 10 },  p5: 'Fusion Burst → +10% Fusion DMG 15s; Outro → +25% Fusion DMG for next 15s', p5val: { fusionDmg: 35 } },
  'Sound of True Name':    { element: 'Aero',    p2: '+10% Aero DMG',    p2val: { aeroDmg: 10 },    p5: 'Echo Skill DMG → +20% Echo Crit Rate, +15% Aero DMG for 5s', p5val: { critRate: 20, aeroDmg: 15 } },
  // v3.5 — Land of Xuanfang sets, confirmed via nanoka.cc live echo pages (2026-08-14)
  'Song of Feathered Trace': { element: 'Support', p2: '+10% Energy Regen', p2val: { energyRegen: 10 },
    p5: "Havoc Bane → self +20% Crit Rate, +35% Heavy ATK DMG for 15s (Xuanling's Feather); Glacio Chafe → team ATK +0.1% per 1% Energy Regen, up to +25%, for 10s (Chongming's Feather)",
    p5val: { critRate: 20, heavyDmg: 35, atkPct: 25 } },
  "Heart of Evil's Purge": { element: 'Aero', p2: '+10% Aero DMG', p2val: { aeroDmg: 10 },
    p5: 'Tune Strain - Shifting → +20% Crit DMG, +30% Aero DMG for 15s', p5val: { critDmg: 20, aeroDmg: 30 } },
  'Lamp of Nether Road':  { element: 'Shield', p2: '+10% HP', p2val: { hpPct: 10 },
    p5: 'Gaining a Shield → +5% Crit Rate for 5s (max x4, 0.5s CD); at max stacks → +15% Fusion DMG', p5val: { critRate: 20, fusionDmg: 15 } },
  // Referenced by Denia's bestEchoes since her character entry was added, but never itemized here — confirmed via nanoka.cc
  'Reel of Spliced Memories': { element: 'ATK', p2: '+10% ATK', p2val: { atkPct: 10 },
    p5: 'Tune Rupture - Shifting or Tune Strain - Shifting → team Tune Break Boost +20 for 30s (same-name effects don\'t stack)', p5val: { atkPct: 10 } },
  // Referenced by Lucilla/Hiyuki's bestEchoes but never itemized here — confirmed via nanoka.cc
  'Wishes of Quiet Snowfall': { element: 'Glacio', p2: '+10% Glacio DMG', p2val: { glacioDmg: 10 },
    p5: 'Glacio Chafe → self +10% Glacio DMG (15s); Snowfall (25s CD): Liberation DMG → +25% Crit Rate (6s, extendable) or Outro → +25% Glacio DMG to incoming (15s)',
    p5val: { glacioDmg: 10, critRate: 25 } },
  // Referenced by Lucy's bestEchoes (as "5pc", incorrectly — it's actually a 1-piece set) but never itemized here — confirmed via nanoka.cc
  'Shadow of Shattered Dreams': { element: 'Support', p2: '1-Pc: Hack - Shifting → self +35% Basic ATK DMG, +35% Heavy ATK DMG for 15s',
    p2val: { basicDmg: 35, heavyDmg: 35 } },
};

// [SECTION:ECHO_LISTS] — All echoes grouped by cost tier (newest first)
const ALL_4COST_ECHOES = [
  // v3.6 — added 2026-08-18 (echo audit): missing from roster entirely. Confirmed 4-cost, Aero,
  // 'Heart of Evil's Purge' set via WebSearch (game8.co Qingxiao build guides, ldshop.gg Qingxiao build
  // guide). Active-skill dmg% and any main-slot buff stats could not be confirmed from any accessible
  // source (nanoka.cc/prydwen.gg blocked by Cloudflare/403, fandom wiki 402, game8/theriagames/wuwacompanion
  // pages didn't carry the specific numbers) — left out of ECHO_SKILL_BUFFS and desc has no fabricated %s.
  'Calamity Effigy',
  // v3.5 — Land of Xuanfang
  'Thousand-Puppet Pavilion', 'Myriad Snare: Rustfire Chassis', 'Reminiscence: Denia',
  'Reminiscence: Threnodian - Voidborne Construct', 'Reminiscence - Nightmare: Adam Smasher',
  // v3.0+ — Lahai-Roi
  'Sigillum', 'Hyvatia', 'Reactor Husk', 'Nameless Explorer',
  // v2.8 — Chronorift
  'Reminiscence: Threnodian - Leviathan',
  // v2.6 — Sanguis Plateaus
  'Lady of the Sea', 'The False Sovereign', 'Lioness of Glory',
  'Nightmare: Kelpie', 'Lorelei', 'Reminiscence: Fenrico',
  // v2.1–2.5 — Rinascita expansion
  'Reminiscence: Fleurdelys', 'Dragon of Dirge', 'Nightmare: Hecate', 'Hecate',
  'Nightmare: Thundering Mephis', 'Nightmare: Tempest Mephis',
  'Nightmare: Inferno Rider', 'Nightmare: Feilian Beringal',
  'Nightmare: Mourning Aix', 'Nightmare: Crownless',
  // v2.0 — Rinascita
  'Dreamless', 'Nightmare: Lampylumen Myriad', 'Nightmare: Impermanence Heron', 'Sentry Construct',
  // v1.2–1.3
  'Fallacy of No Return', 'Jué',
  // v1.0 — Launch
  'Crownless', 'Mech Abomination', 'Lampylumen Myriad', 'Impermanence Heron',
  'Bell-Borne Geochelone', 'Inferno Rider', 'Thundering Mephis', 'Tempest Mephis',
  'Feilian Beringal', 'Mourning Aix',
];

const ALL_3COST_ECHOES = [
  // v3.5 — Land of Xuanfang
  'Forbidden Bastion', 'Fog Lionarch', 'Voidwing Moth',
  // v3.0+ — Lahai-Roi
  'Twin Nova - Nebulous Cannon', 'Twin Nova - Collapsar Blade',
  'Sabercat Prowler', 'Sabercat Reaver', 'Spacetrek Explorer',
  'Flora Reindeer', 'Windlash Coleoid', 'Frostbite Coleoid', 'Glommoth',
  'Ironhoof', 'Mining Reindeer',
  'Reminiscence - Kronaclaw', 'Kronablight',
  // v2.6 — Sanguis Plateaus
  'Corrosaurus', 'Pilgrim\'s Shell', 'Kerasaur', 'Hurriclaw',
  'Nightmare: Viridblaze Saurian', 'Nightmare: Violet-Feathered Heron',
  'Nightmare: Cyan-Feathered Heron', 'Nightmare: Roseshroom', 'Nightmare: Tambourinist',
  // v2.1–2.5 — Rinascita expansion
  'Capitaneus', 'Diurnus Knight', 'Nocturnus Knight', 'Questless Knight',
  'Abyssal Gladius', 'Abyssal Patricius',
  'Rage Against the Statue', 'Vitreum Dancer', 'Cuddle Wuddle',
  'Chop Chop', 'Lightcrusher', 'Rocksteady Guardian',
  // v2.0 — Rinascita
  'Abyssal Mercator', 'Chasm Guardian',
  // v1.1–1.3
  'Glacio Dreadmane',
  // v1.0 — Launch
  'Viridblaze Saurian', 'Autopuppet Scout',
  'Stonewall Bracer', 'Hoochief', 'Flautist',
  'Cyan-Feathered Heron', 'Violet-Feathered Heron',
  'Roseshroom', 'Carapace', 'Spearback',
  'Tambourinist', 'Lumiscale Construct', 'Havoc Dreadmane',
];

const ALL_1COST_ECHOES = [
  // v3.5 — Land of Xuanfang (added 2026-08-18, were missing entirely from the roster)
  'Smiter', 'Porcelain Picket', 'Stone Picket', 'Aureate Picket',
  'Kernel Puppet: Joy', 'Kernel Puppet: Anger', 'Kernel Puppet: Worry',
  'Kernel Puppet: Reflection', 'Kernel Puppet: Grief', 'Kernel Puppet: Fright',
  'Fog Lionarch: Body', 'Fog Lionarch: Head', 'Smolder',
  // v3.0+ — Lahai-Roi
  'Geospider S4', 'Flora Drone', 'Mining Drone', 'Zip Zap',
  'Iceglint Dancer', 'Shadow Stepper', 'Tremor Warrior',
  // v2.6 — Sanguis Plateaus
  'Aero Drake', 'Electro Drake', 'Fusion Drake', 'Glacio Drake',
  'Havoc Drake', 'Spectro Drake',
  'Devotee\'s Flesh', 'Sacerdos', 'Sagittario',
  'La Guardia', 'Calcified Junrock', 'Fission Junrock', 'Golden Junrock', 'Vanguard Junrock',
  'Nightmare: Aero Predator', 'Nightmare: Electro Predator', 'Nightmare: Glacio Predator',
  'Nightmare: Baby Roseshroom', 'Nightmare: Baby Viridblaze Saurian',
  'Nightmare: Chirpuff', 'Nightmare: Dwarf Cassowary',
  'Nightmare: Gulpuff', 'Nightmare: Havoc Warrior', 'Nightmare: Tick Tack',
  // v2.1–2.5 — Rinascita expansion
  'Chop Chop: Headless', 'Chop Chop: Leftless', 'Chop Chop: Rightless',
  'Diggy Duggy', 'Diamondclaw', 'Fae Ignis',
  'Frostscourge Stalker', 'Voltscourge Stalker', 'Galescourge Stalker',
  'Hocus Pocus', 'Nimbus Wraith', 'Hoartoise',
  'Sabyr Boar', 'Traffic Illuminator', 'Tick Tack',
  // v2.0+ — Newer 1-cost echoes
  'Lottie Lost', 'Chest Mimic', 'Aero Prism',
  'Aero Predator', 'Glacio Predator', 'Gulpuff',
  // v1.1 — Mt. Firmament
  'Electro Predator', 'Fusion Dreadmane', 'Lava Larva',
  'Clang Bang', 'Dwarf Cassowary', 'Excarat',
  'Baby Viridblaze Saurian', 'Baby Roseshroom',
  // v1.0 — Launch
  'Fusion Prism', 'Glacio Prism', 'Havoc Prism', 'Spectro Prism',
  'Snip Snap', 'Zig Zag', 'Hooscamp',
  'Fusion Warrior', 'Havoc Warrior',
  'Whiff Whaff', 'Cruisewing', 'Chirpuff',
];

// [SECTION:ECHO_DATA] — Per-echo sonata set & buff type data
const ECHO_DATA = {
  // ── 4-Cost Echoes ──
  'Mourning Aix':                    { sets: ['Celestial Light'], buff: 'Spectro DMG', desc: 'A spectral avian Overlord. Skill transforms into Mourning Aix for 2 claw attacks dealing 157%/236% Spectro DMG, then grants +12% Spectro DMG and +12% Resonance Liberation DMG for 15s.' , iconUrl: './echoes/mourning-aix/XZ09Kvky-Mourning-Aix-Icon.webp' , monsterIconUrl: './echoes/mourning-aix/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_997_UI.webp', rank: 'Overlord' },
  'Feilian Beringal':                { sets: ['Sierra Gale'], buff: 'Aero DMG', desc: 'A towering ape-like Overlord wreathed in wind. Skill transforms into Feilian Beringal for a powerful kick (231% Aero DMG) and follow-up strike (283% Aero DMG), then grants +12% Aero DMG and +12% Heavy ATK DMG for 15s.' , iconUrl: './echoes/feilian-beringal/RppHgV69-Feilian-Beringal-Icon.webp' , monsterIconUrl: './echoes/feilian-beringal/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_996_UI.webp', rank: 'Overlord' },
  'Tempest Mephis':                  { sets: ['Void Thunder'], buff: 'Electro DMG', desc: 'A lightning-wreathed lupine Overlord. Skill transforms into Tempest Mephis for tail swing attacks (102% Electro DMG each) and a claw strike (175% Electro DMG), then grants +12% Electro DMG and +12% Heavy ATK DMG for 15s.' , iconUrl: './echoes/tempest-mephis/m5KgKh6R-Tempest-Mephis-Icon.webp' , monsterIconUrl: './echoes/tempest-mephis/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_225_UI.webp', rank: 'Overlord' },
  'Thundering Mephis':               { sets: ['Void Thunder'], buff: 'Electro DMG', desc: 'A massive wolf-like Overlord crackling with thunder. Skill transforms into Thundering Mephis for up to 6 strikes (132% Electro DMG each, final hit 189%), then grants +12% Electro DMG and +12% Resonance Liberation DMG for 15s.' , iconUrl: './echoes/thundering-mephis/Mbg8kP3-Thundering-Mephis-Icon.webp' , monsterIconUrl: './echoes/thundering-mephis/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_226_UI.webp', rank: 'Overlord' },
  'Inferno Rider':                   { sets: ['Molten Rift'], buff: 'Fusion DMG', desc: 'A blazing mounted knight Overlord. Skill transforms into Inferno Rider for 3 slashes dealing 242%/282%/282% Fusion DMG, then grants +12% Fusion DMG and +12% Basic ATK DMG for 15s. Hold to enter Riding Mode.' , iconUrl: './echoes/inferno-rider/Mkw9SPM7-Inferno-Rider-Icon.webp' , monsterIconUrl: './echoes/inferno-rider/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_325_UI.webp', rank: 'Overlord' },
  'Bell-Borne Geochelone':           { sets: ['Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Shield', desc: 'A giant bell-carrying tortoise. Skill deals 145% DEF-scaled Glacio DMG and grants a Bell-Borne Shield (50% DMG Reduction, +10% DMG Boost for team) lasting 15s or 3 hits.' , iconUrl: './echoes/bell-borne-geochelone/zVZHP0hw-Bell-Borne-Geochelone-Icon.webp' , monsterIconUrl: './echoes/bell-borne-geochelone/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_992_UI.webp', rank: 'Calamity' },
  'Impermanence Heron':              { sets: ['Moonlit Clouds'], buff: 'Havoc DMG', desc: 'A spectral crane-like Overlord. Skill transforms into Impermanence Heron dealing 310% Havoc DMG on dive; hold to spit flames (55% Havoc DMG each). Restores 10 Resonance Energy on hit and boosts next character\'s DMG by 12% for 15s after Outro.' , iconUrl: './echoes/impermanence-heron/k6QDV6H1-Impermanence-Heron-Icon.webp' , monsterIconUrl: './echoes/impermanence-heron/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_995_UI.webp', rank: 'Overlord' },
  'Lampylumen Myriad':               { sets: ['Freezing Frost'], buff: 'Glacio DMG', desc: 'A luminous deep-sea jellyfish Overlord. Skill transforms into Lampylumen Myriad for 3 freezing strikes dealing 220%/200%/266% Glacio DMG. Each hit grants +4% Glacio DMG and +4% Resonance Skill DMG for 15s, stacking 3 times.' , iconUrl: './echoes/lampylumen-myriad/q3yyBwB8-Lampylumen-Myriad-Icon.webp' , monsterIconUrl: './echoes/lampylumen-myriad/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_994_UI.webp', rank: 'Overlord' },
  'Mech Abomination':                { sets: ['Lingering Tunes'], buff: 'Electro DMG', desc: 'A grotesque mechanical construct Overlord. Skill strikes for 48% Electro DMG and summons Mech Waste dealing 320% Electro DMG on hit (explodes for 160% more). Grants +12% ATK for 15s. Mech Waste DMG counts as Outro Skill DMG.' , iconUrl: './echoes/mech-abomination/GqBBWHL-Mech-Abomination-Icon.webp' , monsterIconUrl: './echoes/mech-abomination/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_993_UI.webp', rank: 'Overlord' },
  'Crownless':                       { sets: ['Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A faceless humanoid Overlord of pure Havoc energy. Skill transforms into Crownless for 4 attacks: two hits of 134% Havoc DMG, a double-hit of 100%, and a triple-hit of 67%. Grants +12% Havoc DMG and +12% Resonance Skill DMG for 15s.' , iconUrl: './echoes/crownless/NkpNYzb-Crownless-Icon.webp' , monsterIconUrl: './echoes/crownless/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_999_UI.webp', rank: 'Overlord' },
  'Jué':                    { sets: ['Celestial Light'], buff: 'Spectro DMG', desc: 'The ancient dragon guardian of Jinzhou. Skill summons Jué to soar and strike (48% Spectro DMG), call 5 thunderbolts (19% each), and spiral down twice (48% each). Grants Blessing of Time: +16% Resonance Skill DMG Bonus and Spectro DoT for 15s.' , iconUrl: './echoes/ju/hxsP3fFC-Ju-Icon.webp' , monsterIconUrl: './echoes/ju/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_327_UI.webp', rank: 'Calamity' },
  'Fallacy of No Return':            { sets: ['Rejuvenating Glow'], buff: 'Spectro DMG', desc: 'An otherworldly Overlord that bends reality. Skill blasts surrounding area for 15.86% Max HP Spectro DMG; hold to flurry at 1.58% Max HP per hit, ending with 19.82% Max HP. Grants +10% Energy Regen and +10% ATK to all team members for 20s.' , iconUrl: './echoes/fallacy-of-no-return/tPw0LG3T-Fallacy-of-No-Return-Icon.webp' , monsterIconUrl: './echoes/fallacy-of-no-return/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_350_UI.webp', rank: 'Overlord' },
  'Sentry Construct':                { sets: ['Frosty Resolve'], buff: 'Glacio DMG', desc: 'A massive armored guardian construct. Skill transforms into Sentry Construct dealing 405% Glacio DMG. After enough Resonance Liberations charge the Strike Capacitor to max, resets Echo cooldown and dives for 405% Glacio DMG with freeze. Grants +12% Glacio DMG and +12% Resonance Skill DMG.' , iconUrl: './echoes/sentry-construct/BVJsMKzd-Sentry-Construct-Icon.webp' , monsterIconUrl: './echoes/sentry-construct/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_33012_UI.webp', rank: 'Overlord' },
  'Nightmare: Impermanence Heron':   { sets: ['Midnight Veil'], buff: 'Havoc DMG', desc: 'A nightmare variant of the spectral crane wreathed in prismatic energy. Skill transforms and delivers up to 10 strikes of 40% Havoc DMG each. Main slot grants +12% Havoc DMG and +12% Heavy ATK DMG passively.' , iconUrl: './echoes/nightmare-impermanence-heron/5gct6D18-Nightmare-Impermanence-Heron-Icon.webp' , monsterIconUrl: './echoes/nightmare-impermanence-heron/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_YZ_33015_UI.webp', rank: 'Elite' },
  'Nightmare: Lampylumen Myriad':    { sets: ['Empyrean Anthem', 'Frosty Resolve'], buff: 'Glacio DMG', desc: 'A nightmare variant of the luminous jellyfish. Skill transforms and attacks surrounding enemies for 273% Glacio DMG. Main slot passively grants +12% Glacio DMG and +30% Coordinated ATK DMG.' , iconUrl: './echoes/nightmare-lampylumen-myriad/rWn3RrM-Nightmare-Lampylumen-Myriad-Icon.webp' , monsterIconUrl: './echoes/nightmare-lampylumen-myriad/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34013_UI.webp', rank: 'Elite' },
  'Dragon of Dirge':                 { sets: ['Tidebreaking Courage'], buff: 'Fusion DMG', desc: 'A grieving dragon from the depths of Rinascita. Skill transforms and summons a Grief Rift lasting 5s, periodically dealing 36% Fusion DMG to enemies in the area. Main slot grants +12% Fusion DMG and +12% Basic ATK DMG.' , iconUrl: './echoes/dragon-of-dirge/hFQ1ZCmT-Dragon-of-Dirge-Icon.webp' , monsterIconUrl: './echoes/dragon-of-dirge/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_33013_UI.webp', rank: 'Overlord' },
  'Nightmare: Hecate':               { sets: ['Dream of the Lost'], buff: 'Havoc DMG', desc: 'A nightmare variant of the three-headed witch of the deep. Skill transforms into Nightmare Hecate, leaping up and smashing down for 3 stages of Havoc DMG (152% each). Main slot passively grants +12% Havoc DMG and +20% Echo Skill DMG.' , iconUrl: './echoes/nightmare-hecate/zhskZ8jn-Nightmare-Hecate-Icon.webp' , monsterIconUrl: './echoes/nightmare-hecate/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34016_UI.webp', rank: 'Calamity' },
  'Nightmare: Crownless':            { sets: ['Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A nightmare variant of the faceless Havoc Overlord. Skill transforms and attacks enemies in front for 405% Havoc DMG. 3 charges (1 per 12s). On hit, +20% DMG for 2s. Main slot grants +12% Havoc DMG and +12% Basic ATK DMG.' , iconUrl: './echoes/nightmare-crownless/x8JsLzb0-Nightmare-Crownless-Icon.webp' , monsterIconUrl: './echoes/nightmare-crownless/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_YZ_33018_UI.webp', rank: 'Elite' },
  'Nightmare: Mourning Aix':         { sets: ['Eternal Radiance'], buff: 'Spectro DMG', desc: 'A nightmare variant of the spectral avian. Skill summons Nightmare: Mourning Aix dealing 273% Spectro DMG. DMG to enemies with Spectro Frazzle is increased by 100%. Main slot grants +12% Spectro DMG.' , iconUrl: './echoes/nightmare-mourning-aix/ccWwhHhX-Nightmare-Mourning-Aix-Icon.webp' , monsterIconUrl: './echoes/nightmare-mourning-aix/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_YZ_33020_UI.webp', rank: 'Elite' },
  'Nightmare: Feilian Beringal':     { sets: ['Sierra Gale'], buff: 'Aero DMG', desc: 'A nightmare variant of the wind ape. Skill summons Nightmare: Feilian Beringal dealing 164% Aero DMG, leaving a Whirlwind Beam that attacks 5 more times for 21% Aero DMG each. Main slot grants +12% Aero DMG and +12% Heavy ATK DMG.' , iconUrl: './echoes/nightmare-feilian-beringal/fdBQFmtL-Nightmare-Feilian-Beringal-Icon.webp' , monsterIconUrl: './echoes/nightmare-feilian-beringal/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_YZ_33014_UI.webp', rank: 'Elite' },
  'Nightmare: Inferno Rider':        { sets: ['Molten Rift'], buff: 'Fusion DMG', desc: 'A nightmare variant of the blazing knight. Skill transforms and jumps to attack for 405% Fusion DMG. Hold to enter Riding Mode (exit deals 283% Fusion DMG). Main slot grants +12% Fusion DMG and +12% Resonance Skill DMG.' , iconUrl: './echoes/nightmare-inferno-rider/Z6Hsjwr4-Nightmare-Inferno-Rider-Icon.webp' , monsterIconUrl: './echoes/nightmare-inferno-rider/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_YZ_33019_UI.webp', rank: 'Elite' },
  'Nightmare: Tempest Mephis':       { sets: ['Void Thunder', 'Empyrean Anthem'], buff: 'Electro DMG', desc: 'A nightmare variant of the lightning wolf. Skill transforms and attacks surrounding enemies for 405% Electro DMG. Main slot grants +12% Electro DMG and +12% Resonance Skill DMG.' , iconUrl: './echoes/nightmare-tempest-mephis/Qv6VB480-Nightmare-Tempest-Mephis-Icon.webp' , monsterIconUrl: './echoes/nightmare-tempest-mephis/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_YZ_33017_UI.webp', rank: 'Elite' },
  'Nightmare: Thundering Mephis':    { sets: ['Void Thunder'], buff: 'Electro DMG', desc: 'A nightmare variant of the thunder wolf. Skill transforms and attacks enemies in front for 405% Electro DMG. Main slot grants +12% Electro DMG and +12% Resonance Liberation DMG.' , iconUrl: './echoes/nightmare-thundering-mephis/TMjCxQX9-Nightmare-Thundering-Mephis-Icon.webp' , monsterIconUrl: './echoes/nightmare-thundering-mephis/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_YZ_33016_UI.webp', rank: 'Elite' },
  'Dreamless':                       { sets: ['Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A humanoid Calamity of pure Havoc tied to Rover\'s past. Skill transforms for 6 strikes: first 5 deal 54% Havoc DMG each, final hit deals 270% Havoc DMG. DMG increased by 50% within 5s of Rover: Havoc\'s Resonance Liberation.' , iconUrl: './echoes/dreamless/JjT68rdx-Dreamless-Icon.webp' , monsterIconUrl: './echoes/dreamless/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_998_UI.webp', rank: 'Calamity' },
  'Reminiscence: Fleurdelys':        { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Aero DMG', desc: 'An echo of the ancient flower-dragon guardian. Skill summons the Windcleaver for 8 hits of 27% Aero DMG plus one hit of 136% Aero DMG. Main slot grants +10% Aero DMG (+20% if Rover: Aero or Cartethyia).' , iconUrl: './echoes/reminiscence-fleurdelys/N6r9JSwb-Reminiscence-Fleurdelys-Icon.webp' , monsterIconUrl: './echoes/reminiscence-fleurdelys/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34012_1_UI.webp', rank: 'Calamity' },
  'Lioness of Glory':                { sets: ['Flaming Clawprint'], buff: 'Fusion DMG', desc: 'A proud leonine Overlord wielding the Halberd of Glory. Skill summons the Halberd to crush an area for 82% Fusion DMG, then blasts off for 191% Fusion DMG. Main slot grants +12% Fusion DMG and +12% Resonance Liberation DMG.' , iconUrl: './echoes/lioness-of-glory/TMFh75cg-Lioness-of-Glory-Icon.webp' , monsterIconUrl: './echoes/lioness-of-glory/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_33022_UI.webp', rank: 'Overlord' },
  'The False Sovereign':             { sets: ['Crown of Valor'], buff: 'Electro DMG', desc: 'A puppet-king Overlord infused with Electro. Skill transforms and dashes forward in a spinning strike dealing 55% Electro DMG x4. Upon casting Intro Skill, also summons the False Sovereign for 405% Electro DMG. Main slot grants +12% Electro DMG and +12% Heavy ATK DMG. 2 charges, 1 per 8s.' , iconUrl: './echoes/the-false-sovereign/NHH8K01-The-False-Sovereign-Icon.webp' , monsterIconUrl: './echoes/the-false-sovereign/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34017_UI.webp', rank: 'Overlord' },
  'Lady of the Sea':                 { sets: ['Crown of Valor'], buff: 'Aero DMG', desc: 'A majestic maritime Overlord commanding the tides. Skill summons a Tidestorm dealing 13% Aero DMG x10 and 164% Aero DMG x1. Main slot grants +12% Aero DMG and +12% Resonance Liberation DMG.' , iconUrl: './echoes/lady-of-the-sea/C5kVbQcS-Lady-of-the-Sea-Icon.webp' , monsterIconUrl: './echoes/lady-of-the-sea/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34018_UI.webp', rank: 'Overlord' },
  'Corrosaurus':                     { sets: ['Flaming Clawprint', "Flamewing's Shadow"], buff: 'Fusion DMG', desc: 'A rare armored saurian of the Sanguis Plateaus that spews molten rock. Skill summons Corrosaurus to attack for 273% Fusion DMG. Main slot grants +12% Fusion DMG and +20% Echo Skill DMG.' , iconUrl: './echoes/corrosaurus/1G54DG6K-Corrosaurus-Icon.webp' , monsterIconUrl: './echoes/corrosaurus/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32044_UI.webp', rank: 'Elite' },
  'Reminiscence: Threnodian - Leviathan': { sets: ["Flamewing's Shadow", 'Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A colossal sea-beast Calamity wreathed in Havoc. Skill summons a Collapsing Horizon for 2 hits of 131% Havoc DMG and creates Core of Collapse for 15s (24% Havoc DMG per hit, up to 8 times). Main slot grants +12% Havoc DMG and +12% Resonance Liberation DMG.' , iconUrl: './echoes/reminiscence-threnodian-leviathan/Z12RVspK-Reminiscence-Threnodian-Leviathan-Icon.webp' , monsterIconUrl: './echoes/reminiscence-threnodian-leviathan/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34020_1_UI.webp', rank: 'Calamity' },
  'Hyvatia':                         { sets: ['Pact of Neonlight Leap', 'Rite of Gilded Revelation'], buff: 'Spectro DMG', desc: 'An ancient construct boss from Lahai-Roi that fires converging lasers. Skill summons Hyvatia mid-air to fire lasers dealing 27% Spectro DMG x10. Outro within 15s grants the incoming Resonator +10% All-Attribute DMG Bonus for 15s.' , iconUrl: './echoes/hyvatia/PGtdhhRd-Hyvatia-Icon.webp' , monsterIconUrl: './echoes/hyvatia/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34021_UI.webp', rank: 'Overlord' },
  'Twin Nova - Nebulous Cannon':      { sets: ['Rite of Gilded Revelation', 'Chromatic Foam'], buff: 'Spectro DMG', desc: 'The ranged model of a Spacetrek Collective combat mech pair. Skill transforms to slash enemies twice for 80% Spectro DMG each. Main slot grants +12% Spectro DMG and +12% Basic ATK DMG. Pairing with Collapsar Blade enables combo attacks and Dyad Origins stacks (+10% Echo Skill DMG each, up to 6).' , iconUrl: './echoes/twin-nova-nebulous-cannon/s9rrBgL8-Twin-Nova-Nebulous-Cannon-Icon.webp' , monsterIconUrl: './echoes/twin-nova-nebulous-cannon/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32049_UI.webp', rank: 'Elite' },
  'Sigillum':                        { sets: ['Trailblazing Star'], buff: 'Fusion DMG', desc: 'A Calamity-class star guardian sealed beyond the Gate of the Lost Star. Skill summons Sigillum for two attacks dealing 68%/205% Fusion DMG. When equipped by Aemeath, grants +25% Resonance Liberation DMG.' , iconUrl: './echoes/sigillum/JR620JdC-Sigillum-Icon.webp' , monsterIconUrl: './echoes/sigillum/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34025_UI.webp', rank: 'Calamity' },
  // corrected 2026-08-18 (echo audit): desc fabricated "+12% Fusion DMG and +12% Resonance Skill DMG" and
  // a "Hold to charge Meltdown Beam" mechanic that doesn't exist — nanoka.cc's raw skill data shows a
  // single jumping slash (351% Fusion DMG) and the real main-slot bonus is just +10% Energy Regen.
  'Reactor Husk':                    { sets: ['Halo of Starry Radiance', 'Chromatic Foam'], buff: 'Fusion DMG', desc: 'A massive reactor construct from Lahai-Roi. Skill transforms into Reactor Husk, jumping into the air and unleashing a heavy slash dealing 351% Fusion DMG. Grants +10% Energy Regen.' , iconUrl: './echoes/reactor-husk/4nRHm50w-Reactor-Husk-Icon.webp' , monsterIconUrl: './echoes/reactor-husk/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34022_UI.webp', rank: 'Overlord' },
  // corrected 2026-08-18 (echo audit): was missing the 'Reel of Spliced Memories' set tag, and the desc
  // fabricated a "3-hit wind combo 135%/135%/183%" breakdown and "+12% Heavy ATK DMG" — nanoka.cc's raw
  // skill data shows a single 273.60% Aero DMG application and "+12% Aero DMG, +20% Echo Skill DMG Bonus".
  'Nameless Explorer':               { sets: ['Sound of True Name', 'Reel of Spliced Memories'], buff: 'Aero DMG', desc: 'A mysterious explorer Overlord who wanders between forgotten ruins. Skill summons Nameless Explorer to attack enemies along its path, dealing 273.6% Aero DMG. Grants +12% Aero DMG and +20% Echo Skill DMG.' , iconUrl: './echoes/nameless-explorer/sdWR4SgF-Nameless-Explorer-Icon.webp' , monsterIconUrl: './echoes/nameless-explorer/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34026_UI.webp', rank: 'Overlord' },
  'Lorelei':                         { sets: ['Midnight Veil'], buff: 'Havoc DMG', desc: 'A siren-like Overlord that lures with haunting melodies. Skill transforms into Lorelei and sings a Dirge of Ruin, dealing 68% Havoc DMG x6 to enemies in a cone. Enemies hit by all 6 notes are Silenced for 2s. Grants +12% Havoc DMG and +12% Resonance Liberation DMG.' , iconUrl: './echoes/lorelei/9kynG0DJ-Lorelei-Icon.webp' , monsterIconUrl: './echoes/lorelei/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_33011_UI.webp', rank: 'Overlord' },
  // corrected 2026-08-18: desc's "+12% Basic ATK DMG" was wrong — real second bonus is +12% Aero DMG.
  // Damage breakdown also corrected: real is a single 405% Glacio DMG hit, plus a separate 405% Aero DMG
  // hit from Nightmare: Kelpie summoned on Outro Skill (not "205%+248% Glacio with a freeze chance").
  'Nightmare: Kelpie':               { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Glacio DMG', desc: 'A nightmare variant of a water-horse Overlord wreathed in frozen mist. Skill transforms into Nightmare: Kelpie to attack nearby targets for 405% Glacio DMG. Switching out via Outro Skill summons it again to deal 405% Aero DMG. Grants +12% Glacio DMG and +12% Aero DMG.' , iconUrl: './echoes/nightmare-kelpie/bjtwr7yr-Nightmare-Kelpie-Icon.webp' , monsterIconUrl: './echoes/nightmare-kelpie/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_33021_UI.webp', rank: 'Elite' },
  // corrected 2026-08-18: desc fabricated a "tri-beam + detonation" combo and "+12% Havoc DMG/+12% Skill
  // DMG" — nanoka.cc's raw skill data shows 3 Crescent Servants attacking for a single 45.59% Havoc DMG
  // application, and the real main-slot bonus is just +40% Coordinated Attack DMG (no Havoc DMG at all).
  'Hecate':                          { sets: ['Empyrean Anthem'], buff: 'Havoc DMG', desc: 'The three-headed witch Calamity of the deep. Skill summons 3 twirling Crescent Servants that attack enemies with spinning blades for 45.6% Havoc DMG; triggering a Counterattack resets their duration. Grants +40% Coordinated Attack DMG.' , iconUrl: './echoes/hecate/DH0bCdYK-Hecate-Icon.webp' , monsterIconUrl: './echoes/hecate/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34010_1_UI.webp', rank: 'Calamity' },
  // corrected 2026-08-18: desc's "+12% Resonance Liberation DMG" was wrong — nanoka.cc's raw skill data
  // shows the real second bonus is +12% Heavy Attack DMG.
  'Reminiscence: Fenrico':           { sets: ['Dream of the Lost', 'Law of Harmony'], buff: 'Aero DMG', desc: 'A reminiscence of the wolf guardian Fenrico, howling with primordial wind. Skill summons the Talons of Decree to attack nearby enemies for 273.6% Aero DMG. Grants +12% Aero DMG and +12% Heavy Attack DMG.' , iconUrl: './echoes/reminiscence-fenrico/wZK2x483-Reminiscence-Fenrico-Icon.webp' , monsterIconUrl: './echoes/reminiscence-fenrico/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34015_2_UI.webp', rank: 'Overlord' },
  // v3.5 — Land of Xuanfang echoes, confirmed via nanoka.cc live echo pages (2026-08-14)
  'Thousand-Puppet Pavilion':        { sets: ['Song of Feathered Trace'], buff: 'Havoc DMG', desc: "A Calamity-class puppet-master construct from Land of Xuanfang. Skill attacks nearby enemies for 109.44% Havoc DMG and summons 4 Blades of Thousand Memories (15s); inflicting Havoc Bane consumes a Blade to deal 41.04% Havoc DMG (once per 1s). Main slot grants +12% Havoc DMG and +12% Heavy ATK DMG.", iconUrl: './echoes/thousand-puppet-pavilion/23cVrFbk-Thousand-Puppet-Pavilion.webp' , monsterIconUrl: './echoes/thousand-puppet-pavilion/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34031_UI.webp', rank: 'Calamity' },
  'Myriad Snare: Rustfire Chassis':  { sets: ["Heart of Evil's Purge", 'Lamp of Nether Road'], buff: 'Fusion DMG', desc: "An Overlord-class mechanical hazard from Land of Xuanfang. Skill summons a crushing chassis dealing 10.20% Max HP Fusion DMG on impact, then up to 19 more hits of 0.37% Max HP Fusion DMG each. Main slot grants +12% Fusion DMG and +12% Heavy ATK DMG.", iconUrl: './echoes/myriad-snare-rustfire-chassis/KzxLH0wS-Myriad-Snare-Rustfire-Chassis.webp' , monsterIconUrl: './echoes/myriad-snare-rustfire-chassis/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34030_UI.webp', rank: 'Overlord' },
  'Reminiscence: Denia':             { sets: ['Chromatic Foam'], buff: 'Fusion DMG', desc: "Denia's Calamity-class signature Echo. Skill summons \"Trickster\" for 273.60% Fusion DMG; within 15s, casting Outro Skill grants the incoming Resonator +12% Fusion DMG Bonus for 15s.", iconUrl: './echoes/reminiscence-denia/qYy1Y7Ck-Reminiscence-Denia.webp' , monsterIconUrl: './echoes/reminiscence-denia/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34028_1_UI.webp', rank: 'Calamity' },
  'Reminiscence: Threnodian - Voidborne Construct': { sets: ['Wishes of Quiet Snowfall'], buff: 'Glacio DMG', desc: "Calamity-class Echo from Land of Xuanfang. Skill summons Aleph-1's Creation for 5 hits of 21.88% Glacio DMG plus one hit of 164.16% Glacio DMG. Main slot grants +12% Glacio DMG and +12% Resonance Liberation DMG.", iconUrl: './echoes/reminiscence-threnodian-voidborne-construct/gZdFc1CG-Reminiscence-Threnodian-Voidborne-Construct.webp' , monsterIconUrl: './echoes/reminiscence-threnodian-voidborne-construct/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34027_UI.webp', rank: 'Calamity' },
  'Reminiscence - Nightmare: Adam Smasher': { sets: ['Shadow of Shattered Dreams'], buff: 'Physical DMG', desc: "Overlord-class Echo from the Cyberpunk: Edgerunners collab. Skill deals 16 hits of 10.26% ATK Physical DMG. When equipped by Lucy or Rebecca in the main slot, grants +15% Crit Rate and unlocks a character-specific enhanced Echo Skill (Lucy: Spectro burst; Rebecca: Electro missile barrage).", iconUrl: './echoes/reminiscence-nightmare-adam-smasher/twCtsS1D-Reminiscence-Nightmare-Adam-Smasher.webp' , monsterIconUrl: './echoes/reminiscence-nightmare-adam-smasher/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34029_1_UI.webp', rank: 'Overlord' },
  // added 2026-08-18 (echo audit): Calamity-class Aero echo, Qingxiao's dedicated v3.6 main echo for
  // Heart of Evil's Purge. Set/element/cost confirmed via WebSearch (game8.co & ldshop.gg Qingxiao build
  // guides). Active-skill damage % and any main-slot passive buff numbers could not be confirmed from any
  // accessible source (nanoka.cc/prydwen.gg blocked, fandom wiki paywalled) — no numbers fabricated here,
  // and no ECHO_SKILL_BUFFS entry was added pending confirmation.
  'Calamity Effigy':                 { sets: ["Heart of Evil's Purge"], buff: 'Aero DMG', desc: "A Calamity-class Echo from Land of Xuanfang, Qingxiao's dedicated main Echo. Skill transforms to deal Aero DMG; the main slot grants Aero DMG Bonus (exact percentages unconfirmed)."  , monsterIconUrl: './echoes/calamity-effigy/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_34032_UI.webp', rank: 'Overlord' },
  // ── 3-Cost Echoes ──
  'Forbidden Bastion':               { sets: ['Song of Feathered Trace', "Heart of Evil's Purge", 'Lamp of Nether Road'], buff: 'Healing', desc: 'An Elite-class fortified construct from Land of Xuanfang. Skill summons Forbidden Bastion to bash enemies for 237.60% Glacio DMG. Main slot grants +10% Healing Bonus.', iconUrl: './echoes/forbidden-bastion/Ps1zmbnM-Forbidden-Bastion.webp' , monsterIconUrl: './echoes/forbidden-bastion/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32068_UI.webp', rank: 'Elite' },
  'Fog Lionarch':                    { sets: ['Song of Feathered Trace', "Heart of Evil's Purge", 'Lamp of Nether Road'], buff: 'Fusion DMG', desc: 'An Elite-class beast from Land of Xuanfang. Skill summons Fog Lionarch to spit fire at enemies, dealing 7 stages of 33.93% Fusion DMG.', iconUrl: './echoes/fog-lionarch/TB6d8kTy-Fog-Lionarch.webp' , monsterIconUrl: './echoes/fog-lionarch/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32067_UI.webp', rank: 'Elite' },
  'Voidwing Moth':                   { sets: ['Reel of Spliced Memories'], buff: 'Spectro DMG', desc: "Denia's paired Elite-class moth Echo. Skill transforms into Voidwing Moth for 405% Spectro DMG on cast, or hold for up to 12 hits of 49.33% Spectro DMG. Within 15s, casting Outro Skill grants the incoming Resonator +12% ATK for 15s.", iconUrl: './echoes/voidwing-moth/mCw6NvMt-Voidwing-Moth.webp' , monsterIconUrl: './echoes/voidwing-moth/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32066_UI.webp', rank: 'Elite' },
  'Capitaneus':                      { sets: ['Eternal Radiance', 'Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Spectro DMG', desc: 'The supreme commander of the Order, carrying out judgment on transgressors. Skill summons Capitaneus to jump and smash for 118% Spectro DMG, generating 4 Merciless Judgements at 59% Spectro DMG each. Main slot grants +12% Spectro DMG and +12% Heavy ATK DMG.' , iconUrl: './echoes/capitaneus/VYbs2G44-Capitaneus-Icon.webp' , monsterIconUrl: './echoes/capitaneus/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32033_UI.webp', rank: 'Elite' },
  'Havoc Dreadmane':                 { sets: ['Molten Rift', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A dark-maned lion-like beast radiating Havoc energy. Skill transforms into Havoc Dreadmane for 2 tail strikes, each dealing 116% Havoc DMG plus 77% bonus Havoc DMG on hit.' , iconUrl: './echoes/havoc-dreadmane/3y35jG2X-Havoc-Dreadmane-Icon.webp' , monsterIconUrl: './echoes/havoc-dreadmane/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_984_UI.webp', rank: 'Elite' },
  'Lumiscale Construct':             { sets: ['Freezing Frost', 'Void Thunder'], buff: 'Glacio DMG', desc: 'An armored construct with luminous scales. Skill transforms into a Parry Stance; slash deals 553% Glacio DMG, or counterattack on hit deals 553% + 276% Glacio DMG.' , iconUrl: './echoes/lumiscale-construct/YBYGBw70-Lumiscale-Construct-Icon.webp' , monsterIconUrl: './echoes/lumiscale-construct/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_329_UI.webp', rank: 'Elite' },
  'Tambourinist':                    { sets: ['Freezing Frost', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A rhythmic humanoid Tacet Discord that weaponizes sound. Skill summons Tambourinist playing Melodies of Annihilation; when a Resonator hits a target, deals 14% Havoc DMG up to 10 times over 10s.' , iconUrl: './echoes/tambourinist/Jw8j0SxC-Tambourinist-Icon.webp' , monsterIconUrl: './echoes/tambourinist/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_205_UI.webp', rank: 'Elite' },
  'Spearback':                       { sets: ['Moonlit Clouds', 'Lingering Tunes'], buff: 'Physical DMG', desc: 'A ferocious bear-like beast covered in arrow-shaped Tacetite spines. Skill summons Spearback for 5 attacks: first 4 deal 29% Physical DMG each, final hit deals 51% Physical DMG.' , iconUrl: './echoes/spearback/7JSVwMyC-Spearback-Icon.webp' , monsterIconUrl: './echoes/spearback/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_986_UI.webp', rank: 'Elite' },
  'Carapace':                        { sets: ['Sierra Gale', 'Moonlit Clouds'], buff: 'Aero DMG', desc: 'An elite construct that camouflages among city ruins. Skill transforms into Carapace for a spinning attack (112% Aero DMG) followed by a slash (168% Aero DMG).' , iconUrl: './echoes/carapace/PGkFcS50-Carapace-Icon.webp' , monsterIconUrl: './echoes/carapace/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_970_UI.webp', rank: 'Elite' },
  'Roseshroom':                      { sets: ['Freezing Frost', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A mature fungal Tacet Discord that channels dark energy through its cap. Skill summons Roseshroom to fire a laser dealing 57% Havoc DMG up to 3 times.' , iconUrl: './echoes/roseshroom/kgz25mLM-Roseshroom-Icon.webp' , monsterIconUrl: './echoes/roseshroom/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_315_UI.webp', rank: 'Elite' },
  'Violet-Feathered Heron':          { sets: ['Molten Rift', 'Void Thunder'], buff: 'Electro DMG', desc: 'A purple-winged heron that only spreads its wings in thunderstorms. Skill transforms into a Parry Stance; counterattack deals 288% Electro DMG. If attacked during parry, counters early and recovers 5 Concerto Energy.' , iconUrl: './echoes/violet-feathered-heron/ns6dcr6t-Violet-Feathered-Heron-Icon.webp' , monsterIconUrl: './echoes/violet-feathered-heron/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_125_UI.webp', rank: 'Elite' },
  'Cyan-Feathered Heron':            { sets: ['Sierra Gale', 'Celestial Light'], buff: 'Aero DMG', desc: 'A cyan-winged heron found in forests and shores. Skill transforms and charges at enemies dealing 236% Aero DMG, interrupting enemy Special Skills on hit.' , iconUrl: './echoes/cyan-feathered-heron/DfK0CRyM-Cyan-Feathered-Heron-Icon.webp' , monsterIconUrl: './echoes/cyan-feathered-heron/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_135_UI.webp', rank: 'Elite' },
  'Flautist':                        { sets: ['Void Thunder', 'Lingering Tunes'], buff: 'Electro DMG', desc: 'A humanoid Tacet Discord that wields sound as a weapon. Skill transforms and continuously emits Electro lasers dealing 53% Electro DMG x10. Gains 1 Concerto Energy per hit.' , iconUrl: './echoes/flautist/RphMfMzT-Flautist-Icon.webp' , monsterIconUrl: './echoes/flautist/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_195_UI.webp', rank: 'Elite' },
  'Hoochief':                        { sets: ['Sierra Gale', 'Rejuvenating Glow'], buff: 'Aero DMG', desc: 'A large primate Tacet Discord commanding wind. Skill transforms into Hoochief Cyclone and smacks enemies for 268% Aero DMG.' , iconUrl: './echoes/hoochief/tTL9qbhD-Hoochief-Icon.webp' , monsterIconUrl: './echoes/hoochief/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_989_UI.webp', rank: 'Elite' },
  'Stonewall Bracer':                { sets: ['Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Shield', desc: 'A hulking stone-armored construct. Skill transforms and charges forward for 112% Physical DMG, then smashes for 168% Physical DMG and gains a shield equal to 10% Max HP for 7s.' , iconUrl: './echoes/stonewall-bracer/dw7V5L6T-Stonewall-Bracer-Icon.webp' , monsterIconUrl: './echoes/stonewall-bracer/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_185_UI.webp', rank: 'Elite' },
  'Autopuppet Scout':                { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'A derelict combat puppet hiding in city ruins. Skill transforms dealing 272% Glacio DMG to surroundings and generating up to 3 Ice Walls that block enemies.' , iconUrl: './echoes/autopuppet-scout/5WJVT0ns-Autopuppet-Scout-Icon.webp' , monsterIconUrl: './echoes/autopuppet-scout/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_1003_UI.webp', rank: 'Elite' },
  'Viridblaze Saurian':              { sets: ['Molten Rift', 'Moonlit Clouds'], buff: 'Fusion DMG', desc: 'A large amphibian-like beast found in forests that spits fire. Skill summons Viridblaze Saurian to continuously breathe fire, dealing 17% Fusion DMG x10.' , iconUrl: './echoes/viridblaze-saurian/k2LsdFCf-Viridblaze-Saurian-Icon.webp' , monsterIconUrl: './echoes/viridblaze-saurian/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_295_UI.webp', rank: 'Elite' },
  'Glacio Dreadmane':                { sets: ['Freezing Frost', 'Moonlit Clouds'], buff: 'Physical DMG', desc: 'An icy lion-like beast from Mt. Firmament. Skill lacerates enemies for 214% Glacio DMG with 2 charges. Deals +20% DMG mid-air and generates 6 Icicles on landing (32% Glacio DMG each).' , iconUrl: './echoes/glacio-dreadmane/LXG92c1v-Glacio-Dreadmane-Icon.webp' , monsterIconUrl: './echoes/glacio-dreadmane/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_985_UI.webp', rank: 'Elite' },
  'Chasm Guardian':                  { sets: ['Rejuvenating Glow', 'Lingering Tunes'], buff: 'Havoc DMG', desc: 'A boulder-like construct from the abyss, built to crush rather than protect. Skill transforms for a Leap Strike dealing 273% Havoc DMG at cost of 10% HP, then restores up to 10% Max HP over 5s.' , iconUrl: './echoes/chasm-guardian/1J8M9qx0-Chasm-Guardian-Icon.webp' , monsterIconUrl: './echoes/chasm-guardian/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_215_UI.webp', rank: 'Elite' },
  'Abyssal Mercator':                { sets: ['Frosty Resolve', 'Eternal Radiance'], buff: 'Glacio DMG', desc: 'A battle-hardened combatant from the depths. Skill transforms into Abyssal Mercator to summon 3 Ice Spikes that each deal 89.39% Glacio DMG to enemies.' , iconUrl: './echoes/abyssal-mercator/chV4vWNJ-Abyssal-Mercator-Icon.webp' , monsterIconUrl: './echoes/abyssal-mercator/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32027_UI.webp', rank: 'Elite' },
  'Twin Nova - Collapsar Blade':      { sets: ['Rite of Gilded Revelation', 'Trailblazing Star', 'Sound of True Name'], buff: 'Electro DMG', desc: 'The melee model of a Spacetrek Collective combat mech pair. Skill transforms to rapidly fire at enemies for 5s, each attack dealing 2.01% Electro DMG. Main slot grants +12% Electro DMG and +12% Basic ATK DMG. Pairing with Nebulous Cannon enables combo attacks and Dyad Origins stacks (+10% Echo Skill DMG each, up to 6).' , iconUrl: './echoes/twin-nova-collapsar-blade/rK7B4PM5-Twin-Nova-Collapsar-Blade-Icon.webp' , monsterIconUrl: './echoes/twin-nova-collapsar-blade/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32050_UI.webp', rank: 'Elite' },
  'Sabercat Prowler':                { sets: ['Pact of Neonlight Leap', 'Halo of Starry Radiance', 'Sound of True Name'], buff: 'Havoc DMG', desc: 'A stealthy feline predator from Lahai-Roi. Skill summons Sabercat Prowler to fire beams at enemies, dealing 192.6% Havoc DMG.' , iconUrl: './echoes/sabercat-prowler/JWchKx7x-Sabercat-Prowler-Icon.webp' , monsterIconUrl: './echoes/sabercat-prowler/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32056_UI.webp', rank: 'Elite' },
  'Sabercat Reaver':                 { sets: ['Pact of Neonlight Leap', 'Halo of Starry Radiance', 'Sound of True Name'], buff: 'Fusion DMG', desc: 'A fierce feline combatant from Lahai-Roi. Skill summons Sabercat Reaver to attack enemies, dealing 192.6% Fusion DMG.' , iconUrl: './echoes/sabercat-reaver/JWMcgRY4-Sabercat-Reaver-Icon.webp' , monsterIconUrl: './echoes/sabercat-reaver/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32055_UI.webp', rank: 'Elite' },
  'Spacetrek Explorer':              { sets: ['Halo of Starry Radiance', 'Chromatic Foam', 'Sound of True Name'], buff: 'Shield', desc: "A spacefaring support unit from the Spacetrek Collective. Skill summons Spacetrek Explorer to grant nearby active team members a Shield equal to 10% of the summoner's Max HP for 4s." , iconUrl: './echoes/spacetrek-explorer/4nh1N91b-Spacetrek-Explorer-Icon.webp' , monsterIconUrl: './echoes/spacetrek-explorer/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32054_UI.webp', rank: 'Elite' },
  'Flora Reindeer':                  { sets: ['Rite of Gilded Revelation', 'Reel of Spliced Memories'], buff: 'Aero DMG', desc: 'A gentle reindeer-like creature from Lahai-Roi. Skill summons Flora Reindeer to attack enemies within a large range, dealing 192.6% Aero DMG.' , iconUrl: './echoes/flora-reindeer/LDv0brpC-Flora-Reindeer-Icon.webp' , monsterIconUrl: './echoes/flora-reindeer/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32051_UI.webp', rank: 'Elite' },
  'Windlash Coleoid':                { sets: ['Rite of Gilded Revelation', 'Wishes of Quiet Snowfall'], buff: 'Aero DMG', desc: 'A wind-infused cephalopod creature. Skill transforms into Windlash Coleoid to kick enemies, dealing 268.2% Aero DMG.' , iconUrl: './echoes/windlash-coleoid/1yKLmnC-Windlash-Coleoid-Icon.webp' , monsterIconUrl: './echoes/windlash-coleoid/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32058_UI.webp', rank: 'Elite' },
  'Frostbite Coleoid':               { sets: ['Halo of Starry Radiance', 'Wishes of Quiet Snowfall'], buff: 'Glacio DMG', desc: 'A frost-infused cephalopod creature. Skill summons Frostbite Coleoid to punch enemies, dealing 192.6% Glacio DMG.' , iconUrl: './echoes/frostbite-coleoid/5gdNHqbG-Frostbite-Coleoid-Icon.webp' , monsterIconUrl: './echoes/frostbite-coleoid/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32057_UI.webp', rank: 'Elite' },
  'Glommoth':                        { sets: ['Trailblazing Star', 'Wishes of Quiet Snowfall'], buff: 'Glacio DMG', desc: 'A glowing moth-like creature from Lahai-Roi. Skill summons Glommoth to stomp enemies, dealing 273.6% Glacio DMG. Casting Outro Skill within 15s grants the incoming Resonator +12% Glacio DMG Bonus for 15s.' , iconUrl: './echoes/glommoth/yBX17MGF-Glommoth-Icon.webp' , monsterIconUrl: './echoes/glommoth/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32061_UI.webp', rank: 'Elite' },
  'Ironhoof':                        { sets: ['Pact of Neonlight Leap', 'Wishes of Quiet Snowfall', 'Reel of Spliced Memories'], buff: 'Fusion DMG', desc: 'A heavy hoofed beast from Lahai-Roi. Skill transforms into Ironhoof to charge at enemies, dealing 53.6% Fusion DMG. At the end of the charge, a goring attack deals 13.4% Fusion DMG 3 times and 174.3% Fusion DMG once.' , iconUrl: './echoes/ironhoof/bRNS0DKF-Ironhoof-Icon.webp' , monsterIconUrl: './echoes/ironhoof/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32053_UI.webp', rank: 'Elite' },
  'Mining Reindeer':                 { sets: ['Pact of Neonlight Leap', 'Reel of Spliced Memories'], buff: 'Electro DMG', desc: 'A reindeer-like creature used in mining operations. Skill summons Mining Reindeer to launch a charged attack at enemies, dealing 237.6% Electro DMG.' , iconUrl: './echoes/mining-reindeer/8gc61bfT-Mining-Reindeer-Icon.webp' , monsterIconUrl: './echoes/mining-reindeer/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32052_UI.webp', rank: 'Elite' },
  'Reminiscence - Kronaclaw':         { sets: ['Trailblazing Star', 'Chromatic Foam'], buff: 'Aero DMG', desc: 'A reminiscence of the fearsome Kronaclaw. Skill transforms into Kronaclaw to soar into the air, dealing 8.04% Aero DMG up to 8 times and 24.13% Aero DMG 2 times, then dive to deal 155.55% Aero DMG once.', iconUrl: './echoes/reminiscence-kronaclaw/KxrLYyzN-T-Icon-Monster-Head-32060-UI.webp' , monsterIconUrl: './echoes/reminiscence-kronaclaw/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32060_UI.webp', rank: 'Elite' },
  'Kronablight':                     { sets: ['Trailblazing Star', 'Chromatic Foam'], buff: 'Electro DMG', desc: 'A blighted variant of the Kronaclaw. Skill transforms into Kronablight, soaring into the air and diving to deal 268.2% Electro DMG.' , iconUrl: './echoes/kronablight/4ZJ1Kzwb-Kronablight-Icon.webp' , monsterIconUrl: './echoes/kronablight/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32059_UI.webp', rank: 'Elite' },
  'Pilgrim\'s Shell':                { sets: ['Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Aero DMG', desc: 'A shell-bearing pilgrim creature. Skill transforms into Pilgrim\'s Shell to attack nearby enemies, dealing 268.2% Aero DMG.', iconUrl: './echoes/kronablight/4ZHwcHT6-Pilgrims-Shell.webp' , monsterIconUrl: './echoes/kronablight/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32034_UI.webp', rank: 'Elite' },
  'Kerasaur':                        { sets: ['Windward Pilgrimage', 'Flaming Clawprint', "Flamewing's Shadow"], buff: 'Aero DMG', desc: 'A horned saurian from the Sanguis Plateaus. Skill transforms into Kerasaur to leap and slam down for 268.2% Aero DMG; shortly after, cast Echo Skill again to charge at the target for another 268.2% Aero DMG. Main slot grants +12% Aero DMG and +12% Resonance Liberation DMG.' , iconUrl: './echoes/kerasaur/tP81d0f5-Kerasaur-Icon.webp' , monsterIconUrl: './echoes/kerasaur/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31062_UI.webp', rank: 'Elite' },
  'Hurriclaw':                       { sets: ['Tidebreaking Courage', 'Gusts of Welkin', 'Crown of Valor'], buff: 'Aero DMG', desc: 'A wind-wielding claw beast. Skill transforms into Hurriclaw to charge forward, dealing 156.6% Aero DMG on hit plus a 156.6% Aero DMG sweep attack. Hold to keep charging, or use Echo Skill again mid-charge to sweep.' , iconUrl: './echoes/hurriclaw/RG3XwmV5-Hurriclaw-Icon.webp' , monsterIconUrl: './echoes/hurriclaw/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32032_UI.webp', rank: 'Elite' },
  'Nightmare: Viridblaze Saurian':   { sets: ["Flamewing's Shadow"], buff: 'Fusion DMG', desc: 'A nightmare variant of the fire-breathing saurian. Skill summons it to continuously spit fire, dealing 17.12% Fusion DMG 10 times.' , iconUrl: './echoes/nightmare-viridblaze-saurian/C5Q01c2x-Nightmare-Viridblaze-Saurian-Icon.webp' , monsterIconUrl: './echoes/nightmare-viridblaze-saurian/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32047_UI.webp', rank: 'Elite' },
  'Nightmare: Violet-Feathered Heron': { sets: ['Crown of Valor'], buff: 'Electro DMG', desc: 'A nightmare variant of the purple-winged heron. Skill transforms into a Parry Stance; counterattack deals 288% Electro DMG. If attacked during parry, counters early with a thunderbolt wing slash and recovers 5 Concerto Energy.' , iconUrl: './echoes/nightmare-violet-feathered-heron/rKDvkS2Q-Nightmare-Violet-Feathered-Heron-Icon.webp' , monsterIconUrl: './echoes/nightmare-violet-feathered-heron/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32045_UI.webp', rank: 'Elite' },
  'Nightmare: Cyan-Feathered Heron': { sets: ['Law of Harmony'], buff: 'Aero DMG', desc: 'A nightmare variant of the cyan-winged heron. Skill transforms to charge at enemies, dealing 236.8% Aero DMG; this Echo Skill interrupts enemy Special Skills on hit.' , iconUrl: './echoes/nightmare-cyan-feathered-heron/v6WJ0dJd-Nightmare-Cyan-Feathered-Heron-Icon.webp' , monsterIconUrl: './echoes/nightmare-cyan-feathered-heron/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32046_UI.webp', rank: 'Elite' },
  'Nightmare: Roseshroom':           { sets: ['Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A nightmare variant of the dark fungal creature. Skill summons it to fire a laser, dealing 57.07% Havoc DMG up to 3 times.' , iconUrl: './echoes/nightmare-roseshroom/yn41d4Vx-Nightmare-Roseshroom-Icon.webp' , monsterIconUrl: './echoes/nightmare-roseshroom/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32048_UI.webp', rank: 'Elite' },
  'Nightmare: Tambourinist':         { sets: ['Dream of the Lost'], buff: 'Havoc DMG', desc: 'A nightmare variant of the rhythmic sound-weaponizer. Skill summons it to play Melodies of Annihilation; any team member who obtains a Melody deals an extra 14.4% Havoc DMG to their target on hit, up to 10 times over 10s.' , iconUrl: './echoes/nightmare-tambourinist/rfw6xZrR-Nightmare-Tambourinist-Icon.webp' , monsterIconUrl: './echoes/nightmare-tambourinist/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32043_UI.webp', rank: 'Elite' },
  'Diurnus Knight':                  { sets: ['Eternal Radiance', 'Tidebreaking Courage'], buff: 'Spectro DMG', desc: 'A daytime knight of the Order. Skill transforms into Diurnus Knight to charge forward and attack with the sword for 268.2% Spectro DMG. DMG dealt to enemies inflicted with Spectro Frazzle is increased by 100%.' , iconUrl: './echoes/diurnus-knight/CpyL99C5-Diurnus-Knight-Icon.webp' , monsterIconUrl: './echoes/diurnus-knight/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32023_UI.webp', rank: 'Elite' },
  'Nocturnus Knight':                { sets: ['Midnight Veil', 'Empyrean Anthem'], buff: 'Havoc DMG', desc: 'A nighttime knight of the Order. Skill transforms into Nocturnus Knight to strike enemies in front from the air, dealing 268.2% Havoc DMG.' , iconUrl: './echoes/nocturnus-knight/M5V9hjW5-Nocturnus-Knight-Icon.webp' , monsterIconUrl: './echoes/nocturnus-knight/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32024_UI.webp', rank: 'Elite' },
  'Questless Knight':                { sets: ['Frosty Resolve', 'Midnight Veil'], buff: 'Electro DMG', desc: 'A wandering knight without a quest. Skill transforms into Questless Knight to smash surrounding enemies for 313.2% Electro DMG.' , iconUrl: './echoes/questless-knight/vC2Mqzqc-Questless-Knight-Icon.webp' , monsterIconUrl: './echoes/questless-knight/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32022_UI.webp', rank: 'Elite' },
  'Abyssal Gladius':                 { sets: ['Midnight Veil', 'Tidebreaking Courage', 'Thread of Severed Fate'], buff: 'Glacio DMG', desc: 'A blade-wielding warrior from the abyss. Skill transforms into Abyssal Gladius to attack enemies with the sword for 268.2% Glacio DMG. Hold to maintain the Echo form, slashing and casting a ranged attack forward for 268.2% and 670.5% Glacio DMG respectively.' , iconUrl: './echoes/abyssal-gladius/PZ4WLJ1g-Abyssal-Gladius-Icon.webp' , monsterIconUrl: './echoes/abyssal-gladius/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32026_UI.webp', rank: 'Elite' },
  'Abyssal Patricius':               { sets: ['Frosty Resolve', 'Empyrean Anthem'], buff: 'Glacio DMG', desc: 'A noble warrior from the abyss. Skill transforms into Abyssal Patricius to charge forward, dealing 268.2% Glacio DMG. Main slot grants +12% Glacio DMG Bonus.' , iconUrl: './echoes/abyssal-patricius/nqM5wjZc-Abyssal-Patricius-Icon.webp' , monsterIconUrl: './echoes/abyssal-patricius/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32025_UI.webp', rank: 'Elite' },
  'Rage Against the Statue':         { sets: ['Eternal Radiance', 'Gusts of Welkin', 'Law of Harmony'], buff: 'Spectro DMG', desc: 'An animated statue filled with rage. Skill transforms to attack enemies for 313.2% Spectro DMG. Hold to maintain the form and charge towards enemies for 469.8% Spectro DMG.' , iconUrl: './echoes/rage-against-the-statue/JWzHhr1H-Rage-Against-the-Statue-Icon.webp' , monsterIconUrl: './echoes/rage-against-the-statue/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32031_UI.webp', rank: 'Elite' },
  'Vitreum Dancer':                  { sets: ['Eternal Radiance', 'Empyrean Anthem'], buff: 'Electro DMG', desc: 'A glass-like dancer that channels electricity. Skill transforms into Vitreum Dancer to attack surrounding enemies for 313.2% Electro DMG. Main slot grants +12% Electro DMG Bonus.' , iconUrl: './echoes/vitreum-dancer/HpXcqH2X-Vitreum-Dancer-Icon.webp' , monsterIconUrl: './echoes/vitreum-dancer/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32029_UI.webp', rank: 'Elite' },
  'Cuddle Wuddle':                   { sets: ['Frosty Resolve', 'Midnight Veil'], buff: 'Physical DMG', desc: 'A deceptively cuddly creature. Skill transforms into Cuddle Wuddle for 4 strikes dealing 46.98% Physical DMG each, then a final strike dealing 125.28% Physical DMG.' , iconUrl: './echoes/cuddle-wuddle/C4kjd33-Cuddle-Wuddle-Icon.webp' , monsterIconUrl: './echoes/cuddle-wuddle/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32030_UI.webp', rank: 'Elite' },
  'Chop Chop':                       { sets: ['Empyrean Anthem', 'Tidebreaking Courage', 'Dream of the Lost'], buff: 'Fusion DMG', desc: 'A multi-armed chopping construct. Skill summons Chop Chop for a series of attacks: the first 6 strikes each deal 19.26% Fusion DMG, and the finishing strike deals 77.04% Fusion DMG.' , iconUrl: './echoes/chop-chop/8LRFvBW4-Chop-Chop-Icon.webp' , monsterIconUrl: './echoes/chop-chop/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_32028_UI.webp', rank: 'Elite' },
  'Lightcrusher':                    { sets: ['Celestial Light'], buff: 'Spectro DMG', desc: 'A light-infused crushing construct. Skill transforms into Lightcrusher and lunges forward for 135.36% Spectro DMG, generating 6 Ablucence on hit; each Ablucence explosion deals 15.04% Spectro DMG. Hold to stay in Lightcrusher form and leap/pounce forward.' , iconUrl: './echoes/lightcrusher/RpYdQddL-Lightcrusher-Icon.webp' , monsterIconUrl: './echoes/lightcrusher/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_328_UI.webp', rank: 'Elite' },
  'Rocksteady Guardian':             { sets: ['Celestial Light', 'Rejuvenating Glow'], buff: 'Spectro DMG', desc: "A steadfast rock guardian. Skill transforms into a Parry State; upon being attacked, deals Spectro DMG equal to 8.29% of Max HP with a follow-up attack for another 8.29%. If the attack is a Special Skill, interrupt it, gain a 30% Max HP Shield, and unleash a two-stage follow-up (5.52% Max HP each) plus three ground-breaking waves (4.59% Max HP each)." , iconUrl: './echoes/rocksteady-guardian/8LG9k4bn-Rocksteady-Guardian-Icon.webp' , monsterIconUrl: './echoes/rocksteady-guardian/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_245_UI.webp', rank: 'Elite' },
  // ── 1-Cost Echoes ──
  // added 2026-08-18 (echo audit): entirely missing from the roster despite being live v3.5 Land of
  // Xuanfang echoes, confirmed via nanoka.cc live echo pages. Icons re-hosted from the Fandom wiki to ibb.co.
  'Smiter':                          { sets: ['Song of Feathered Trace'], buff: 'Spectro DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Smiter to jab enemies 7 times for 19.26% Spectro DMG each, finishing with an uppercut for 57.78% Spectro DMG.', iconUrl: './echoes/smiter/JWvmx2xC-Smiter.webp' , monsterIconUrl: './echoes/smiter/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31090_UI.webp', rank: 'Common' },
  'Porcelain Picket':                { sets: ['Lamp of Nether Road'], buff: 'Aero DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Porcelain Picket to slash forward, dealing 2 hits of 19.44% Aero DMG and 7 hits of 12.96% Aero DMG to enemies along its path.', iconUrl: './echoes/porcelain-picket/jP0xbjv8-Porcelain-Picket.webp' , monsterIconUrl: './echoes/porcelain-picket/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31091_UI.webp', rank: 'Common' },
  'Stone Picket':                    { sets: ['Lamp of Nether Road'], buff: 'Aero DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Stone Picket, dealing 129.60% Aero DMG.', iconUrl: './echoes/stone-picket/WvnyB258-Stone-Picket.webp' , monsterIconUrl: './echoes/stone-picket/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31092_UI.webp', rank: 'Common' },
  'Aureate Picket':                  { sets: ["Heart of Evil's Purge"], buff: 'Aero DMG', desc: "An Elite-class puppet from Land of Xuanfang. Skill transforms into an Aureate Picket, recovering HP over time before bashing enemies for 153.90% Aero DMG.", iconUrl: './echoes/aureate-picket/zTK3cyrf-Aureate-Picket.webp' , monsterIconUrl: './echoes/aureate-picket/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31093_UI.webp', rank: 'Common' },
  'Kernel Puppet: Joy':              { sets: ['Song of Feathered Trace'], buff: 'Physical DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Joy to attack enemies, dealing 129.60% Physical DMG.', iconUrl: './echoes/kernel-puppet-joy/nNh2QrRp-Kernel-Puppet-Joy.webp' , monsterIconUrl: './echoes/kernel-puppet-joy/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31094_UI.webp', rank: 'Common' },
  'Kernel Puppet: Anger':            { sets: ["Heart of Evil's Purge"], buff: 'Fusion DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Anger to attack enemies, dealing 129.60% Fusion DMG.', iconUrl: './echoes/kernel-puppet-anger/TxczQftT-Kernel-Puppet-Anger.webp' , monsterIconUrl: './echoes/kernel-puppet-anger/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31095_UI.webp', rank: 'Common' },
  'Kernel Puppet: Worry':            { sets: ["Heart of Evil's Purge"], buff: 'Glacio DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Worry to attack enemies, dealing 64.80% Glacio DMG.', iconUrl: './echoes/kernel-puppet-worry/XrGXPtfJ-Kernel-Puppet-Worry.webp' , monsterIconUrl: './echoes/kernel-puppet-worry/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31096_UI.webp', rank: 'Common' },
  'Kernel Puppet: Reflection':       { sets: ["Heart of Evil's Purge"], buff: 'Electro DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Reflection to attack enemies, dealing 64.80% Electro DMG.', iconUrl: './echoes/kernel-puppet-reflection/5xYH8fVC-Kernel-Puppet-Reflection.webp' , monsterIconUrl: './echoes/kernel-puppet-reflection/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31097_UI.webp', rank: 'Common' },
  'Kernel Puppet: Grief':            { sets: ['Lamp of Nether Road'], buff: 'Spectro DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Grief to attack enemies, dealing 129.60% Spectro DMG.', iconUrl: './echoes/kernel-puppet-grief/RkwnCxWx-Kernel-Puppet-Grief.webp' , monsterIconUrl: './echoes/kernel-puppet-grief/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31098_UI.webp', rank: 'Common' },
  'Kernel Puppet: Fright':           { sets: ['Lamp of Nether Road'], buff: 'Havoc DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Fright to attack enemies, dealing 51.84% Havoc DMG then 77.76% Havoc DMG.', iconUrl: './echoes/kernel-puppet-fright/BHK35m0C-Kernel-Puppet-Fright.webp' , monsterIconUrl: './echoes/kernel-puppet-fright/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31099_UI.webp', rank: 'Common' },
  'Fog Lionarch: Body':              { sets: ['Song of Feathered Trace'], buff: 'Fusion DMG', desc: 'An Elite-class beast fragment from Land of Xuanfang. Skill summons Fog Lionarch: Body to ram into enemies, dealing 192.60% Fusion DMG.', iconUrl: './echoes/fog-lionarch-body/F4bswKCP-Fog-Lionarch-Body.webp' , monsterIconUrl: './echoes/fog-lionarch-body/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31100_UI.webp', rank: 'Common' },
  'Fog Lionarch: Head':              { sets: ['Song of Feathered Trace'], buff: 'Fusion DMG', desc: 'An Elite-class beast fragment from Land of Xuanfang. Skill summons Fog Lionarch: Head to dart toward enemies, dealing 129.60% Fusion DMG.', iconUrl: './echoes/fog-lionarch-head/YJfBqQX-Fog-Lionarch-Head.webp' , monsterIconUrl: './echoes/fog-lionarch-head/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31101_UI.webp', rank: 'Common' },
  'Smolder':                         { sets: ['Song of Feathered Trace'], buff: 'Fusion DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Smolder to hurl a fireball for 192.60% Fusion DMG; if it hits the ground, it explodes for another 192.60% Fusion DMG to enemies in range.', iconUrl: './echoes/smolder/QFv1pCd2-Smolder.webp' , monsterIconUrl: './echoes/smolder/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31102_UI.webp', rank: 'Common' },
  'Electro Predator':                { sets: ['Molten Rift', 'Void Thunder'], buff: 'Electro DMG', desc: 'A nimble humanoid Tacet Discord with electrical projectiles. Skill summons Electro Predator to shoot 5 times: first 4 deal 17% Electro DMG, last deals 46% Electro DMG.' , imageUrl: './echoes/electro-predator/M57X0Nsc-Electro-Predator.png', noBgProcess: true, iconUrl: './echoes/electro-predator/LDX6kPxT-Electro-Predator-Icon.webp' , monsterIconUrl: './echoes/electro-predator/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_035_UI.webp', rank: 'Common' },
  'Fusion Dreadmane':                { sets: ['Molten Rift', 'Rejuvenating Glow'], buff: 'Fusion DMG', desc: 'A fiery lion-like Howler Tacet Discord. Skill summons Fusion Dreadmane to fiercely strike the enemy dealing 32% + 64 Fusion DMG.' , imageUrl: './echoes/fusion-dreadmane/bjZS0vwn-Fusion-Dreadmane.png', noBgProcess: true, iconUrl: './echoes/fusion-dreadmane/pjzkqWTf-Fusion-Dreadmane-Icon.webp' , monsterIconUrl: './echoes/fusion-dreadmane/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_980_UI.webp', rank: 'Common' },
  'Lava Larva':                      { sets: ['Molten Rift', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'A small molten creature that persistently burns. Skill summons Lava Larva to continuously attack enemies dealing 38% Fusion DMG per hit. Disappears when summoner switches out or moves too far.' , imageUrl: './echoes/lava-larva/LzsHbZg3-Lava-Larva.png', noBgProcess: true, iconUrl: './echoes/lava-larva/svpSKC3g-Lava-Larva-Icon.webp' , monsterIconUrl: './echoes/lava-larva/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_326_UI.webp', rank: 'Common' },
  'Whiff Whaff':                     { sets: ['Sierra Gale', 'Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Aero DMG', desc: 'A hovering humanoid TD that manipulates wind. Skill summons Whiff Whaff for an air explosion (51% Aero DMG) creating a Low-pressure Zone that pulls enemies in for 2s, dealing 19% Aero DMG up to 6 times.', imageUrl: './echoes/whiff-whaff/TMv3DykJ-Whiff-Whaff.png', noBgProcess: true , iconUrl: './echoes/whiff-whaff/DDyTMyQR-Whiff-Whaff-Icon.webp' , monsterIconUrl: './echoes/whiff-whaff/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_085_UI.webp', rank: 'Common' },
  'Cruisewing':                      { sets: ['Celestial Light', 'Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Healing', desc: 'A gentle avian Tacet Discord. Skill summons Cruisewing to heal all team members for 1.8% Max HP + 80 HP, up to 4 times.' , imageUrl: './echoes/cruisewing/8DJ1zJ6Q-Cruisewing.png', noBgProcess: true, iconUrl: './echoes/cruisewing/ZpcpkBmb-Cruisewing-Icon.webp' , monsterIconUrl: './echoes/cruisewing/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_255_UI.webp', rank: 'Common' },
  'Chirpuff':                        { sets: ['Sierra Gale', 'Havoc Eclipse'], buff: 'Aero DMG', desc: 'A small puffball creature that inflates with air. Skill summons Chirpuff to blast a powerful gust forward 3 times, each dealing 38% Aero DMG and pushing enemies back.' , imageUrl: './echoes/chirpuff/Q3hR5DgR-Chirpuff.png', noBgProcess: true, iconUrl: './echoes/chirpuff/wZ0sXmbd-Chirpuff-Icon.webp' , monsterIconUrl: './echoes/chirpuff/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_971_UI.webp', rank: 'Common' },
  'Fusion Warrior':                  { sets: ['Molten Rift', 'Void Thunder', 'Sierra Gale'], buff: 'Fusion DMG', desc: 'A humanoid Tacet Discord wreathed in flames. Skill transforms into Fusion Warrior to perform a Counterattack. Successful counter reduces cooldown by 70% and deals 288% Fusion DMG.' , imageUrl: './echoes/fusion-warrior/2JmY21m-Fusion-Warrior.png', noBgProcess: true, iconUrl: './echoes/fusion-warrior/tPpgKfdZ-Fusion-Warrior-Icon.webp' , monsterIconUrl: './echoes/fusion-warrior/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_045_UI.webp', rank: 'Common' },
  'Havoc Warrior':                   { sets: ['Celestial Light', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A humanoid Tacet Discord wreathed in Havoc energy. Skill transforms into Havoc Warrior to perform a Counterattack. Successful counter reduces cooldown by 70% and deals 288% Havoc DMG.' , imageUrl: './echoes/havoc-warrior/zTVJwGWM-Havoc-Warrior.png', noBgProcess: true, iconUrl: './echoes/havoc-warrior/Pzj1bKqw-Havoc-Warrior-Icon.webp' , monsterIconUrl: './echoes/havoc-warrior/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_055_UI.webp', rank: 'Common' },
  'Snip Snap':                       { sets: ['Molten Rift', 'Rejuvenating Glow', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'An immature humanoid TD that exudes small amounts of magma. Skill summons Snip Snap to throw fireballs dealing 32% + 64 Fusion DMG on hit.' , imageUrl: './echoes/snip-snap/M5CzNd2Z-Snip-Snap.png', noBgProcess: true, iconUrl: './echoes/snip-snap/LDv0brpC-Snip-Snap-Icon.webp' , monsterIconUrl: './echoes/snip-snap/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_065_UI.webp', rank: 'Common' },
  'Zig Zag':                         { sets: ['Celestial Light', 'Moonlit Clouds', 'Lingering Tunes'], buff: 'Spectro DMG', desc: 'An immature humanoid TD that emits focused light rays with a "zig zag" sound. Skill summons Zig Zag to detonate Spectro energy dealing 48% + 96 Spectro DMG, creating a Stagnation Zone for 1.8s.' , imageUrl: './echoes/zig-zag/twXBRbPQ-Zigzag.png', noBgProcess: true, iconUrl: './echoes/zig-zag/7J9hK2LX-Zig-Zag-Icon.webp' , monsterIconUrl: './echoes/zig-zag/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_075_UI.webp', rank: 'Common' },
  'Hooscamp':                        { sets: ['Sierra Gale', 'Lingering Tunes'], buff: 'Aero DMG', desc: 'A small primate-like Tacet Discord. Skill transforms into Hooscamp Flinger and pounces at enemies dealing 48% + 96 Aero DMG.' , imageUrl: './echoes/hooscamp/hR9SJCV9-Hooscamp.png', noBgProcess: true, iconUrl: './echoes/hooscamp/twFD9Dn1-Hooscamp-Icon.webp' , monsterIconUrl: './echoes/hooscamp/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_988_UI.webp', rank: 'Common' },
  'Fusion Prism':                    { sets: ['Freezing Frost', 'Molten Rift', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'A mineral TD filled with thermal energy. Skill summons Fusion Prism to fire a crystal shard dealing 32% + 64 Fusion DMG.' , imageUrl: './echoes/fusion-prism/5xYDP9KV-Fusion-Prism.png', noBgProcess: true, iconUrl: './echoes/fusion-prism/pjzkqWTf-Fusion-Prism-Icon.webp' , monsterIconUrl: './echoes/fusion-prism/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_155_UI.webp', rank: 'Common' },
  'Glacio Prism':                    { sets: ['Freezing Frost', 'Havoc Eclipse', 'Moonlit Clouds'], buff: 'Glacio DMG', desc: 'A mineral TD filled with freezing energy. Skill summons Glacio Prism to fire 3 crystal shards, each dealing 38% Glacio DMG.' , imageUrl: './echoes/glacio-prism/7dbkDjsZ-Glacio-Prism.png', noBgProcess: true, iconUrl: './echoes/glacio-prism/9998gFfw-Glacio-Prism-Icon.webp' , monsterIconUrl: './echoes/glacio-prism/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_145_UI.webp', rank: 'Common' },
  'Aero Prism':                      { sets: ['Tidebreaking Courage', 'Eternal Radiance'], buff: 'Aero DMG', desc: 'A mineral TD filled with powerful air currents. Skill summons Aero Prism to attack enemies dealing 19% Aero DMG.' , imageUrl: './echoes/aero-prism/M5DHh169-Aero-Prism.png', noBgProcess: true, iconUrl: './echoes/aero-prism/hRRfbzjd-Aero-Prism-Icon.webp' , monsterIconUrl: './echoes/aero-prism/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31051_UI.webp', rank: 'Common' },
  'Havoc Prism':                     { sets: ['Void Thunder', 'Celestial Light', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A mineral TD filled with Havoc energy. Skill summons Havoc Prism to fire 5 crystal shards, each dealing 23% Havoc DMG.' , imageUrl: './echoes/havoc-prism/GvXxrfB8-Havoc-Prism.png', noBgProcess: true, iconUrl: './echoes/havoc-prism/dwq9gCwp-Havoc-Prism-Icon.webp' , monsterIconUrl: './echoes/havoc-prism/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_175_UI.webp', rank: 'Common' },
  'Spectro Prism':                   { sets: ['Molten Rift', 'Void Thunder', 'Celestial Light'], buff: 'Spectro DMG', desc: 'A mineral TD that emits Spectro light to buff nearby allies. Skill summons Spectro Prism to emit a laser hitting up to 8 times for 14% Spectro DMG each.' , imageUrl: './echoes/spectro-prism/mFgskgrq-Spectro-Prism.png', noBgProcess: true, iconUrl: './echoes/spectro-prism/DfBFLQ5q-Spectro-Prism-Icon.webp' , monsterIconUrl: './echoes/spectro-prism/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_165_UI.webp', rank: 'Common' },
  'Baby Viridblaze Saurian':         { sets: ['Molten Rift', 'Void Thunder', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'A small amphibian-like creature found in forests. Skill transforms into Baby Viridblaze Saurian to rest in place and slowly restore HP.' , imageUrl: './echoes/baby-viridblaze-saurian/bgYKXrZY-Baby-Viridblaze-Saurian.png', noBgProcess: true, iconUrl: './echoes/baby-viridblaze-saurian/DHhNddtp-Baby-Viridblaze-Saurian-Icon.webp' , monsterIconUrl: './echoes/baby-viridblaze-saurian/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_285_UI.webp', rank: 'Common' },
  'Baby Roseshroom':                { sets: ['Sierra Gale', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A young fungal Tacet Discord. Skill summons Baby Roseshroom to fire a laser dealing 32% + 64 Havoc DMG.' , imageUrl: './echoes/baby-roseshroom/wrZwHGPY-Young-Roseshroom.png', noBgProcess: true, iconUrl: './echoes/baby-roseshroom/gMCfrP73-Baby-Roseshroom-Icon.webp' , monsterIconUrl: './echoes/baby-roseshroom/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_305_UI.webp', rank: 'Common' },
  'Clang Bang':                      { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'An immature humanoid TD with ice crystals that make a "clang bang" sound. Skill summons Clang Bang that follows the enemy and self-combusts, dealing 32% + 64 Glacio DMG.' , imageUrl: './echoes/clang-bang/nqNfQkTY-Clang-Bang.png', noBgProcess: true, iconUrl: './echoes/clang-bang/cc3hxYDw-Clang-Bang-Icon.webp' , monsterIconUrl: './echoes/clang-bang/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_1001_UI.webp', rank: 'Common' },
  'Dwarf Cassowary':                 { sets: ['Sierra Gale', 'Rejuvenating Glow'], buff: 'Physical DMG', desc: 'A small flightless bird-like Tacet Discord. Skill summons Dwarf Cassowary to track and attack the enemy dealing 38% Physical DMG x3.' , imageUrl: './echoes/dwarf-cassowary/zWw2yrNK-Dwarf-Cassowary.png', noBgProcess: true, iconUrl: './echoes/dwarf-cassowary/nqkB7N5H-Dwarf-Cassowary-Icon.webp' , monsterIconUrl: './echoes/dwarf-cassowary/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_330_UI.webp', rank: 'Common' },
  'Excarat':                         { sets: ['Freezing Frost', 'Havoc Eclipse'], buff: 'Physical DMG', desc: 'A burrowing rodent-like Tacet Discord. Skill transforms into Excarat and tunnels underground to advance, immune to damage while burrowed. Can change direction freely.' , imageUrl: './echoes/excarat/GQmwQXBz-Excarat.png', noBgProcess: true, iconUrl: './echoes/excarat/7JCWR4LZ-Excarat-Icon.webp' , monsterIconUrl: './echoes/excarat/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_275_UI.webp', rank: 'Common' },
  'Lottie Lost':                     { sets: ['Tidebreaking Courage', 'Frosty Resolve'], buff: 'Spectro DMG', desc: 'A small whimsical Tacet Discord that wanders aimlessly. Skill summons Lottie Lost to attack enemies, dealing 129.6% Spectro DMG.' , imageUrl: './echoes/lottie-lost/cSTS6Mqq-Lottie-Lost.png', noBgProcess: true, iconUrl: './echoes/lottie-lost/C3SrXNVJ-Lottie-Lost-Icon.webp' , monsterIconUrl: './echoes/lottie-lost/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31046_UI.webp', rank: 'Common' },
  'Chest Mimic':                     { sets: ['Empyrean Anthem', 'Frosty Resolve', 'Midnight Veil'], buff: 'Spectro DMG', desc: 'A deceptive Tacet Discord disguised as a treasure chest. Skill summons Chest Mimic to attack with 3 consecutive strikes, each dealing 64.19% Spectro DMG.' , imageUrl: './echoes/chest-mimic/6RnrK82j-Chest-Mimic.png', noBgProcess: true, iconUrl: './echoes/chest-mimic/8DgC4tmx-Chest-Mimic-Icon.webp' , monsterIconUrl: './echoes/chest-mimic/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31048_UI.webp', rank: 'Common' },
  'Aero Predator':                   { sets: ['Void Thunder', 'Sierra Gale'], buff: 'Aero DMG', desc: 'A nimble humanoid Tacet Discord that fires air projectiles. Skill summons Aero Predator to throw a dart that bounces between enemies up to 3 times, dealing 28.8% Aero DMG each hit.' , imageUrl: './echoes/aero-predator/k2qMgVKq-Aero-Predator.png', noBgProcess: true, iconUrl: './echoes/aero-predator/7tyC2t4T-Aero-Predator-Icon.webp' , monsterIconUrl: './echoes/aero-predator/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_235_UI.webp', rank: 'Common' },
  'Glacio Predator':                 { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'A nimble humanoid Tacet Discord that fires ice projectiles. Skill summons Glacio Predator to throw an ice spear dealing 46.08% Glacio DMG on hit, plus 4.61% Glacio DMG up to 10 times during the charge and 23.04% Glacio DMG when the spear explodes.' , imageUrl: './echoes/glacio-predator/jZ5pXHvK-Glacio-Predator.png', noBgProcess: true, iconUrl: './echoes/glacio-predator/nqxnCjR3-Glacio-Predator-Icon.webp' , monsterIconUrl: './echoes/glacio-predator/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_105_UI.webp', rank: 'Common' },
  'Gulpuff':                         { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'A bubble-blowing Tacet Discord. Skill summons Gulpuff to blow bubbles 5 times, each dealing 23.04% Glacio DMG.' , imageUrl: './echoes/gulpuff/TDX9tTPt-Gulpuff.png', noBgProcess: true, iconUrl: './echoes/gulpuff/zhxwmLGT-Gulpuff-Icon.webp' , monsterIconUrl: './echoes/gulpuff/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_115_UI.webp', rank: 'Common' },
  'Aero Drake':                      { sets: ['Tidebreaking Courage', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Aero DMG', desc: 'A wind-elemental drake. Skill summons Aero Drake to attack enemies, dealing 129.6% Aero DMG.' , imageUrl: './echoes/aero-drake/1YfjCKtz-Aero-Drake.png', noBgProcess: true, iconUrl: './echoes/aero-drake/4RFLGcTZ-Aero-Drake-Icon.webp' , monsterIconUrl: './echoes/aero-drake/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31055_UI.webp', rank: 'Common' },
  'Electro Drake':                   { sets: ['Midnight Veil', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Electro DMG', desc: 'A lightning-elemental drake. Skill summons Electro Drake to attack enemies, dealing 43.2% Electro DMG 3 times.' , imageUrl: './echoes/electro-drake/tfKbcQW-Electro-Drake.png', noBgProcess: true, iconUrl: './echoes/electro-drake/Xx06HgcD-Electro-Drake-Icon.webp' , monsterIconUrl: './echoes/electro-drake/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31056_UI.webp', rank: 'Common' },
  'Fusion Drake':                    { sets: ['Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Fusion DMG', desc: 'A fire-elemental drake. Skill summons Fusion Drake to attack enemies, dealing 25.92% Fusion DMG 3 times.' , imageUrl: './echoes/fusion-drake/WvbT01pq-Fusion-Drake.png', noBgProcess: true, iconUrl: './echoes/fusion-drake/jP5ctBKj-Fusion-Drake-Icon.webp' , monsterIconUrl: './echoes/fusion-drake/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31058_UI.webp', rank: 'Common' },
  'Glacio Drake':                    { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Glacio DMG', desc: 'An ice-elemental drake. Skill summons Glacio Drake to attack enemies, dealing 25.92% Glacio DMG 5 times.' , imageUrl: './echoes/glacio-drake/DH0Xc9ds-Glacio-Drake.png', noBgProcess: true, iconUrl: './echoes/glacio-drake/jvDRpdWG-Glacio-Drake-Icon.webp' , monsterIconUrl: './echoes/glacio-drake/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31057_UI.webp', rank: 'Common' },
  'Havoc Drake':                     { sets: ['Windward Pilgrimage', 'Flaming Clawprint', 'Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A havoc-elemental drake. Skill summons Havoc Drake to attack enemies, dealing 129.6% Havoc DMG 3 times.' , imageUrl: './echoes/havoc-drake/cS7gy29z-Havoc-Drake.png', noBgProcess: true, iconUrl: './echoes/havoc-drake/PGM9yxdS-Havoc-Drake-Icon.webp' , monsterIconUrl: './echoes/havoc-drake/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31060_UI.webp', rank: 'Common' },
  'Spectro Drake':                   { sets: ['Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Spectro DMG', desc: 'A spectro-elemental drake. Skill summons Spectro Drake to attack enemies, dealing 43.2% Spectro DMG 3 times.' , imageUrl: './echoes/spectro-drake/Cp8qVJBw-Spectro-Drake.png', noBgProcess: true, iconUrl: './echoes/spectro-drake/sr68RKk-Spectro-Drake-Icon.webp' , monsterIconUrl: './echoes/spectro-drake/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31059_UI.webp', rank: 'Common' },
  'Devotee\'s Flesh':                { sets: ['Gusts of Welkin', 'Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Aero DMG', desc: 'A devout creature born of fanatical devotion. Skill summons Devotee\'s Flesh to attack enemies, dealing 43.2% Aero DMG 3 times.', imageUrl: './echoes/spectro-drake/xtnFQwD2-Devotee-s-Flesh.png', noBgProcess: true, iconUrl: './echoes/spectro-drake/DHRkbQg2-Devotees-Flesh.webp' , monsterIconUrl: './echoes/spectro-drake/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31061_UI.webp', rank: 'Common' },
  'Sacerdos':                        { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Aero DMG', desc: 'A priestly creature that chants wind hymns. Skill summons Sacerdos to attack enemies, dealing 64.8% Aero DMG 2 times.' , imageUrl: './echoes/sacerdos/xKZsHqWy-Sacerdos.png', noBgProcess: true, iconUrl: './echoes/sacerdos/DfyWdfrm-Sacerdos-Icon.webp' , monsterIconUrl: './echoes/sacerdos/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31054_UI.webp', rank: 'Common' },
  'Sagittario':                      { sets: ['Eternal Radiance', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Spectro DMG', desc: 'An archer-like creature that fires arrows of light. Skill transforms into Sagittario to move and fire a ranged attack for 268.2% Spectro DMG. Getting attacked while moving triggers a Dodge Counter, dealing 268.2% Spectro DMG once and 53.64% Spectro DMG 5 times.' , imageUrl: './echoes/sagittario/k6394kjK-Sagittario.png', noBgProcess: true, iconUrl: './echoes/sagittario/mrzscNny-Sagittario-Icon.webp' , monsterIconUrl: './echoes/sagittario/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31053_UI.webp', rank: 'Common' },
  'La Guardia':                      { sets: ['Midnight Veil', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Physical DMG', desc: 'A vigilant guard creature wielding a stone shield. Skill transforms into La Guardia to attack nearby targets for 268.2% Physical DMG. Hold to maintain the Echo form: a slash deals another 268.2% Physical DMG, and a ranged attack deals up to 15 hits of 17.87% Physical DMG.' , imageUrl: './echoes/la-guardia/S4RZBG3x-La-Guardia.png', noBgProcess: true, iconUrl: './echoes/la-guardia/j9wYBLjD-La-Guardia-Icon.webp' , monsterIconUrl: './echoes/la-guardia/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31052_UI.webp', rank: 'Common' },
  'Calcified Junrock':               { sets: ['Empyrean Anthem', 'Tidebreaking Courage', 'Crown of Valor'], buff: 'Healing', desc: 'A calcified junrock variant hardened by mineral deposits. Skill summons Calcified Junrock, restoring HP for nearby team members equal to 2.52% of their Max HP, up to 5 times.' , imageUrl: './echoes/calcified-junrock/jk4DB35N-Calcified-Junrock.png', noBgProcess: true, iconUrl: './echoes/calcified-junrock/HkprCbb-Calcified-Junrock-Icon.webp' , monsterIconUrl: './echoes/calcified-junrock/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31050_UI.webp', rank: 'Common' },
  'Fission Junrock':                 { sets: ['Void Thunder', 'Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Healing', desc: "A fission-powered junrock that radiates warm energy. Skill summons Fission Junrock, generating a Resonance Effect that restores 2% Max HP for friendly units each time. Outside of combat, it can also pick up nearby minerals or plants." , imageUrl: './echoes/fission-junrock/QjD2Dcgs-Fission-Junrock.png', noBgProcess: true, iconUrl: './echoes/fission-junrock/yBhnf1nj-Fission-Junrock-Icon.webp' , monsterIconUrl: './echoes/fission-junrock/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_025_UI.webp', rank: 'Common' },
  'Golden Junrock':                  { sets: ['Frosty Resolve', 'Eternal Radiance', 'Law of Harmony'], buff: 'Spectro DMG', desc: 'A golden junrock variant gleaming with spectral light. Skill summons Golden Junrock to charge forward, dealing 129.6% Spectro DMG to enemies in its path.' , imageUrl: './echoes/golden-junrock/N6mw8bb1-Golden-Junrock.png', noBgProcess: true, iconUrl: './echoes/golden-junrock/R4Mtj1t6-Golden-Junrock-Icon.webp' , monsterIconUrl: './echoes/golden-junrock/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31049_UI.webp', rank: 'Common' },
  'Vanguard Junrock':                { sets: ['Void Thunder', 'Rejuvenating Glow', 'Lingering Tunes'], buff: 'Physical DMG', desc: 'A vanguard junrock variant armored with rocky plates. Skill summons Vanguard Junrock to charge forward, dealing Physical DMG to enemies in its path.' , imageUrl: './echoes/vanguard-junrock/2J94GwJ-Vanguard-Junrock.png', noBgProcess: true, iconUrl: './echoes/vanguard-junrock/zVGNLzdt-Vanguard-Junrock-Icon.webp' , monsterIconUrl: './echoes/vanguard-junrock/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_015_UI.webp', rank: 'Common' },
  'Diamondclaw':                     { sets: ['Moonlit Clouds', 'Lingering Tunes'], buff: 'Physical DMG', desc: 'A diamond-clawed creature with razor-sharp crystalline talons. Skill transforms into Crystal Scorpion and enters a Parry State; counterattack when the Parry State ends, dealing Physical DMG.' , imageUrl: './echoes/diamondclaw/tTRpPm5m-Diamondclaw.png', noBgProcess: true, iconUrl: './echoes/diamondclaw/FbjnCjz4-Diamondclaw-Icon.webp' , monsterIconUrl: './echoes/diamondclaw/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_987_UI.webp', rank: 'Common' },
  'Diggy Duggy':                     { sets: ['Eternal Radiance', 'Tidebreaking Courage'], buff: 'Physical DMG', desc: 'A burrowing creature that attacks from underground. Skill transforms into Diggy Duggy and jumps into the air to smash onto enemies, dealing 268.2% Physical DMG.' , imageUrl: './echoes/diggy-duggy/9HRrnmvf-Diggy-Duggy.png', noBgProcess: true, iconUrl: './echoes/diggy-duggy/DPQc8hqb-Diggy-Duggy-Icon.webp' , monsterIconUrl: './echoes/diggy-duggy/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31047_UI.webp', rank: 'Common' },
  'Fae Ignis':                       { sets: ['Eternal Radiance', 'Midnight Veil', 'Dream of the Lost'], buff: 'Havoc DMG', desc: 'A fairy flame creature flickering with dark fire. Skill summons Fae Ignis to attack enemies, dealing 129.6% Havoc DMG.' , imageUrl: './echoes/fae-ignis/zWRyGSZm-Fae-ignis.png', noBgProcess: true, iconUrl: './echoes/fae-ignis/ZzcvGGGx-Fae-Ignis-Icon.webp' , monsterIconUrl: './echoes/fae-ignis/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31043_UI.webp', rank: 'Common' },
  'Frostscourge Stalker':            { sets: ['Eternal Radiance', 'Midnight Veil'], buff: 'Glacio DMG', desc: 'A frost-infused stalker that hunts in frozen terrain. Skill summons Frostscourge Stalker to attack enemies, dealing 129.6% Glacio DMG.' , imageUrl: './echoes/frostscourge-stalker/fdqK7Myt-Frostscourge-Stalker.png', noBgProcess: true, iconUrl: './echoes/frostscourge-stalker/KcsfTX4n-Frostscourge-Stalker-Icon.webp' , monsterIconUrl: './echoes/frostscourge-stalker/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31039_UI.webp', rank: 'Common' },
  'Voltscourge Stalker':             { sets: ['Midnight Veil', 'Empyrean Anthem'], buff: 'Electro DMG', desc: 'A voltage-infused stalker crackling with static. Skill summons Voltscourge Stalker to perform 3 stages of attacks on enemies, each dealing 43.2% Electro DMG.' , imageUrl: './echoes/voltscourge-stalker/pBFBn0fC-Voltscourge-Stalker.png', noBgProcess: true, iconUrl: './echoes/voltscourge-stalker/V0XSnvpX-Voltscourge-Stalker-Icon.webp' , monsterIconUrl: './echoes/voltscourge-stalker/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31038_UI.webp', rank: 'Common' },
  'Galescourge Stalker':             { sets: ['Frosty Resolve', 'Empyrean Anthem'], buff: 'Healing', desc: 'A gale-infused stalker that moves with the wind. Skill summons Galescourge Stalker, restoring HP for nearby party members equal to 2.7% of their Max HP, up to 3 times.' , imageUrl: './echoes/galescourge-stalker/8LYKBmgY-Galescourge-Stalker.png', noBgProcess: true, iconUrl: './echoes/galescourge-stalker/DP2Y15R7-Galescourge-Stalker-Icon.webp' , monsterIconUrl: './echoes/galescourge-stalker/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31037_UI.webp', rank: 'Common' },
  'Hocus Pocus':                     { sets: ['Frosty Resolve', 'Empyrean Anthem'], buff: 'Havoc DMG', desc: 'A magical trickster creature wreathed in dark illusions. Skill summons Hocus Pocus to attack enemies with 3 consecutive strikes, each dealing 43.2% Havoc DMG.' , imageUrl: './echoes/hocus-pocus/v4SQcJGL-Hocus-Pocus.png', noBgProcess: true, iconUrl: './echoes/hocus-pocus/6cN2yBFt-Hocus-Pocus-Icon.webp' , monsterIconUrl: './echoes/hocus-pocus/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31045_UI.webp', rank: 'Common' },
  'Nimbus Wraith':                   { sets: ['Midnight Veil', 'Empyrean Anthem', "Flamewing's Shadow"], buff: 'Healing', desc: 'A cloud-like wraith that drifts through mist. Skill summons Nimbus Wraith, restoring HP for the active Resonator equal to 2.7% of their Max HP, up to 4 times.' , imageUrl: './echoes/nimbus-wraith/xStdtLv1-Nimbus-Wraith.png', noBgProcess: true, iconUrl: './echoes/nimbus-wraith/DHGcPZhB-Nimbus-Wraith-Icon.webp' , monsterIconUrl: './echoes/nimbus-wraith/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31044_UI.webp', rank: 'Common' },
  'Hoartoise':                       { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Healing', desc: 'A hoary tortoise creature with a frost-covered shell. Skill transforms into Hoartoise and slowly restores HP. Use the Echo Skill again to exit the transformation.' , imageUrl: './echoes/hoartoise/B5j9Znwc-Hoartoise.png', noBgProcess: true, iconUrl: './echoes/hoartoise/N29nQrMF-Hoartoise-Icon.webp' , monsterIconUrl: './echoes/hoartoise/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_969_UI.webp', rank: 'Common' },
  'Sabyr Boar':                      { sets: ['Freezing Frost', 'Sierra Gale', 'Moonlit Clouds'], buff: 'Physical DMG', desc: 'A tusked boar creature that charges with reckless force. Skill summons Sabyr Boar to headbutt the enemy into the air, dealing Physical DMG.' , imageUrl: './echoes/sabyr-boar/SDmW9Jwy-Sabyr-Boar.png', noBgProcess: true, iconUrl: './echoes/sabyr-boar/DHG4d72n-Sabyr-Boar-Icon.webp' , monsterIconUrl: './echoes/sabyr-boar/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_265_UI.webp', rank: 'Common' },
  'Traffic Illuminator':             { sets: ['Molten Rift', 'Void Thunder', 'Sierra Gale'], buff: 'Utility', desc: 'A traffic-light-like construct that flashes warning signals. Skill summons Traffic Illuminator, immobilizing enemies for up to 1s; the immobilization lifts once the enemy is hit. Deals no direct DMG.' , imageUrl: './echoes/traffic-illuminator/Z60JGz9q-Traffic-Illuminator.png', noBgProcess: true, iconUrl: './echoes/traffic-illuminator/RpPVKgcJ-Traffic-Illuminator-Icon.webp' , monsterIconUrl: './echoes/traffic-illuminator/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_1000_UI.webp', rank: 'Common' },
  'Tick Tack':                       { sets: ['Havoc Eclipse', 'Rejuvenating Glow', 'Lingering Tunes'], buff: 'Havoc DMG', desc: 'A clock-like creature whose hands spin erratically. Skill summons Tick Tack to charge and bite the enemy, dealing 68.48% Havoc DMG on the charge and 102.72% Havoc DMG on the bite, reducing enemy Vibration Strength by up to 5% for 5s.' , imageUrl: './echoes/tick-tack/zTw28r3t-Tick-Tack.png', noBgProcess: true, iconUrl: './echoes/tick-tack/jKXRM4g-Tick-Tack-Icon.webp' , monsterIconUrl: './echoes/tick-tack/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_095_UI.webp', rank: 'Common' },
  'Chop Chop: Headless':             { sets: ['Eternal Radiance', 'Tidebreaking Courage'], buff: 'Fusion DMG', desc: 'The headless body of Chop Chop, swinging blindly. Skill summons Chop Chop: Headless to attack enemies, dealing 129.6% Fusion DMG.' , imageUrl: './echoes/chop-chop-headless/KC74nDj-Chop-Chop-Headless.png', noBgProcess: true, iconUrl: './echoes/chop-chop-headless/RpGDpLHH-Chop-Chop-Headless-Icon.webp' , monsterIconUrl: './echoes/chop-chop-headless/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31040_UI.webp', rank: 'Common' },
  'Chop Chop: Leftless':             { sets: ['Frosty Resolve', 'Tidebreaking Courage'], buff: 'Spectro DMG', desc: 'Chop Chop missing its left arm, compensating with spectral energy. Skill summons Chop Chop: Leftless to attack enemies, dealing 129.6% Spectro DMG.' , imageUrl: './echoes/chop-chop-leftless/7JDFGhXw-Chop-Chop-Leftless.png', noBgProcess: true, iconUrl: './echoes/chop-chop-leftless/spG4w7rH-Chop-Chop-Leftless-Icon.webp' , monsterIconUrl: './echoes/chop-chop-leftless/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31041_UI.webp', rank: 'Common' },
  'Chop Chop: Rightless':            { sets: ['Frosty Resolve', 'Tidebreaking Courage'], buff: 'Havoc DMG', desc: 'Chop Chop missing its right arm, leaking havoc energy. Skill summons Chop Chop: Rightless to attack enemies, dealing 129.6% Havoc DMG.' , imageUrl: './echoes/chop-chop-rightless/Q7kSy8xG-Chop-Chop-Rightless.png', noBgProcess: true, iconUrl: './echoes/chop-chop-rightless/VYQ3QPP2-Chop-Chop-Rightless-Icon.webp' , monsterIconUrl: './echoes/chop-chop-rightless/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31042_UI.webp', rank: 'Common' },
  'Geospider S4':                    { sets: ['Pact of Neonlight Leap', 'Halo of Starry Radiance', 'Trailblazing Star'], buff: 'Spectro DMG', desc: 'A mechanical spider from Lahai-Roi. Skill summons Geospider S4 to attack enemies, dealing 51.84% Spectro DMG once and 77.76% Spectro DMG once.' , imageUrl: './echoes/geospider-s4/fYySnfX0-Geospider-S4.png', noBgProcess: true, iconUrl: './echoes/geospider-s4/P7x6wBm-Geospider-S4-Icon.webp' , monsterIconUrl: './echoes/geospider-s4/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31079_UI.webp', rank: 'Common' },
  'Flora Drone':                     { sets: ['Pact of Neonlight Leap', 'Rite of Gilded Revelation', 'Sound of True Name', 'Reel of Spliced Memories'], buff: 'Aero DMG', desc: 'A botanical drone from Lahai-Roi. Skill summons Flora Drone, dealing 64.8% Aero DMG to enemies and healing Resonators in range for 3.6% Max HP + 160.' , imageUrl: './echoes/flora-drone/jYgz8DL-Flora-Drone.png', noBgProcess: true, iconUrl: './echoes/flora-drone/yccgwMG1-Flora-Drone-Icon.webp' , monsterIconUrl: './echoes/flora-drone/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31077_UI.webp', rank: 'Common' },
  'Mining Drone':                    { sets: ['Halo of Starry Radiance', 'Rite of Gilded Revelation', 'Sound of True Name'], buff: 'Havoc DMG', desc: 'A mining drone from Lahai-Roi. Skill transforms into Mining Drone to attack enemies, dealing 102.6% Havoc DMG twice.' , imageUrl: './echoes/mining-drone/4gTgCXhF-Mining-Drone.png', noBgProcess: true, iconUrl: './echoes/mining-drone/q3m55xgj-Mining-Drone-Icon.webp' , monsterIconUrl: './echoes/mining-drone/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31078_UI.webp', rank: 'Common' },
  'Zip Zap':                         { sets: ['Pact of Neonlight Leap', 'Rite of Gilded Revelation', 'Chromatic Foam'], buff: 'Electro DMG', desc: 'An electrical creature from Lahai-Roi. Skill summons Zip Zap to launch spinning attacks at enemies, dealing 25.92% Electro DMG 5 times.' , imageUrl: './echoes/zip-zap/B7kNdn3-Zip-Zap.png', noBgProcess: true, iconUrl: './echoes/zip-zap/CK2xw8bY-Zip-Zap-Icon.webp' , monsterIconUrl: './echoes/zip-zap/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31082_UI.webp', rank: 'Common' },
  'Iceglint Dancer':                 { sets: ['Trailblazing Star', 'Wishes of Quiet Snowfall', 'Reel of Spliced Memories'], buff: 'Glacio DMG', desc: 'A crystalline dancer that spins on blades of ice. Skill transforms into Iceglint Dancer to attack enemies, dealing 205.2% Glacio DMG.' , imageUrl: './echoes/iceglint-dancer/hFzTdNWs-Iceglint-Dancer.png', noBgProcess: true, iconUrl: './echoes/iceglint-dancer/ycSKpxh4-Iceglint-Dancer-Icon.webp' , monsterIconUrl: './echoes/iceglint-dancer/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31083_UI.webp', rank: 'Common' },
  'Shadow Stepper':                  { sets: ['Trailblazing Star', 'Chromatic Foam', 'Wishes of Quiet Snowfall'], buff: 'Havoc DMG', desc: 'A shadow-walking creature that phases through darkness. Skill summons Shadow Stepper to attack enemies, dealing 129.6% Havoc DMG.' , imageUrl: './echoes/shadow-stepper/Pvxw2HHY-Shadow-Stepper.png', noBgProcess: true, iconUrl: './echoes/shadow-stepper/w96PCdB-Shadow-Stepper-Icon.webp' , monsterIconUrl: './echoes/shadow-stepper/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31084_UI.webp', rank: 'Common' },
  'Tremor Warrior':                  { sets: ['Halo of Starry Radiance', 'Chromatic Foam', 'Wishes of Quiet Snowfall'], buff: 'Electro DMG', desc: 'A tremor-inducing warrior that channels seismic electricity. Skill transforms into Tremor Warrior to attack enemies in front, dealing 205.2% Electro DMG.' , imageUrl: './echoes/tremor-warrior/fGnyrJ7Z-Tremor-Warrior.png', noBgProcess: true, iconUrl: './echoes/tremor-warrior/Xfx21DrZ-Tremor-Warrior-Icon.webp' , monsterIconUrl: './echoes/tremor-warrior/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31074_UI.webp', rank: 'Common' },
  'Nightmare: Aero Predator':        { sets: ['Crown of Valor'], buff: 'Aero DMG', desc: 'A nightmare variant of the Aero Predator with enhanced wind projectiles. Skill summons it to throw a dart that bounces between enemies up to 3 times, dealing 28.8% Aero DMG each hit.' , imageUrl: './echoes/nightmare-aero-predator/DHJH53q6-Nightmare-Aero-Predator.png', noBgProcess: true, iconUrl: './echoes/nightmare-aero-predator/0p2B1nyW-Nightmare-Aero-Predator-Icon.webp' , monsterIconUrl: './echoes/nightmare-aero-predator/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31066_UI.webp', rank: 'Common' },
  'Nightmare: Electro Predator':     { sets: ['Crown of Valor'], buff: 'Electro DMG', desc: 'A nightmare variant of the Electro Predator with overcharged bolts. Skill summons it to shoot the enemy 5 times: the first 4 shots deal 17.28% Electro DMG, and the last deals 46.08% Electro DMG.' , imageUrl: './echoes/nightmare-electro-predator/6R6r0GDQ-Nightmare-Electro-Predator.png', noBgProcess: true, iconUrl: './echoes/nightmare-electro-predator/LDX6kPxT-Nightmare-Electro-Predator-Icon.webp' , monsterIconUrl: './echoes/nightmare-electro-predator/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31065_UI.webp', rank: 'Common' },
  'Nightmare: Glacio Predator':      { sets: ['Dream of the Lost'], buff: 'Glacio DMG', desc: 'A nightmare variant of the Glacio Predator with piercing ice shards. Skill summons it to throw an ice spear dealing 46.08% Glacio DMG on hit, plus 4.61% Glacio DMG up to 10 times during the charge and 23.04% Glacio DMG when the spear explodes.' , imageUrl: './echoes/nightmare-glacio-predator/8ngqSSxL-Nightmare-Glacio-Predator.png', noBgProcess: true, iconUrl: './echoes/nightmare-glacio-predator/nqxnCjR3-Nightmare-Glacio-Predator-Icon.webp' , monsterIconUrl: './echoes/nightmare-glacio-predator/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31064_UI.webp', rank: 'Common' },
  'Nightmare: Baby Roseshroom':      { sets: ["Flamewing's Shadow"], buff: 'Havoc DMG', desc: 'A nightmare variant of the Baby Roseshroom with amplified spores. Skill summons it to fire a laser, dealing Havoc DMG.' , imageUrl: './echoes/nightmare-baby-roseshroom/svLQG3mb-Nightmare-Baby-Roseshroom.png', noBgProcess: true, iconUrl: './echoes/nightmare-baby-roseshroom/23k9BbyC-Nightmare-Baby-Roseshroom-Icon.webp' , monsterIconUrl: './echoes/nightmare-baby-roseshroom/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31073_UI.webp', rank: 'Common' },
  'Nightmare: Baby Viridblaze Saurian': { sets: ["Flamewing's Shadow"], buff: 'Healing', desc: 'A nightmare variant of the Baby Viridblaze Saurian wreathed in dark flame. Skill transforms into the saurian to rest in place and slowly restore HP.' , imageUrl: './echoes/nightmare-baby-viridblaze-saurian/JwzmkJJs-Nightmare-Baby-Viridblaze-Saurian.png', noBgProcess: true, iconUrl: './echoes/nightmare-baby-viridblaze-saurian/dwcMGxzb-Nightmare-Baby-Viridblaze-Saurian-Icon.webp' , monsterIconUrl: './echoes/nightmare-baby-viridblaze-saurian/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31072_UI.webp', rank: 'Common' },
  'Nightmare: Chirpuff':             { sets: ['Law of Harmony'], buff: 'Aero DMG', desc: 'A nightmare variant of Chirpuff overinflated with nightmare wind. Skill summons it to self-inflate and blast a gust of wind forward 3 times, each blast dealing 38.4% Aero DMG and pushing enemies back.' , imageUrl: './echoes/nightmare-chirpuff/bgjSz4hN-Nightmare-Chirpuff.png', noBgProcess: true, iconUrl: './echoes/nightmare-chirpuff/ZzyktnkP-Nightmare-Chirpuff-Icon.webp' , monsterIconUrl: './echoes/nightmare-chirpuff/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31068_UI.webp', rank: 'Common' },
  'Nightmare: Dwarf Cassowary':      { sets: ['Thread of Severed Fate'], buff: 'Physical DMG', desc: 'A nightmare variant of the Dwarf Cassowary with razor-edged feathers. Skill summons it to track and attack the enemy, dealing 38.4% Physical DMG 3 times.' , imageUrl: './echoes/nightmare-dwarf-cassowary/VWhV8chg-Nightmare-Dwarf-Cassowary.png', noBgProcess: true, iconUrl: './echoes/nightmare-dwarf-cassowary/n85hWpT6-Nightmare-Dwarf-Cassowary-Icon.webp' , monsterIconUrl: './echoes/nightmare-dwarf-cassowary/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31076_UI.webp', rank: 'Common' },
  'Nightmare: Gulpuff':              { sets: ['Law of Harmony'], buff: 'Glacio DMG', desc: 'A nightmare variant of Gulpuff exhaling freezing mist. Skill summons it to blow bubbles 5 times, each dealing 23.04% Glacio DMG.' , imageUrl: './echoes/nightmare-gulpuff/ksZkkZHf-Nightmare-Gulpuff.png', noBgProcess: true, iconUrl: './echoes/nightmare-gulpuff/2H3QWGB-Nightmare-Gulpuff-Icon.webp' , monsterIconUrl: './echoes/nightmare-gulpuff/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31067_UI.webp', rank: 'Common' },
  'Nightmare: Havoc Warrior':        { sets: ['Dream of the Lost'], buff: 'Havoc DMG', desc: 'A nightmare variant of the Havoc Warrior radiating dark energy. Skill transforms into Nightmare: Havoc Warrior to attack up to 3 times, dealing 171.73% Havoc DMG each time.' , imageUrl: './echoes/nightmare-havoc-warrior/pBBX7ZXS-Nightmare-Havoc-Warrior.png', noBgProcess: true, iconUrl: './echoes/nightmare-havoc-warrior/WvdsKkCT-Nightmare-Havoc-Warrior-Icon.webp' , monsterIconUrl: './echoes/nightmare-havoc-warrior/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31063_UI.webp', rank: 'Common' },
  'Nightmare: Tick Tack':            { sets: ['Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A nightmare variant of Tick Tack whose ticking distorts time. Skill summons it to charge and bite the enemy, dealing 68.48% Havoc DMG on the charge and 102.72% Havoc DMG on the bite, reducing enemy Vibration Strength by up to 5% for 5s.' , imageUrl: './echoes/nightmare-tick-tack/yc0hSd53-Nightmare-Tick-Tack.png', noBgProcess: true, iconUrl: './echoes/nightmare-tick-tack/Y4FwmGSW-Nightmare-Tick-Tack-Icon.webp' , monsterIconUrl: './echoes/nightmare-tick-tack/static.nanoka.cc-assets-ww-UIResources-Common-Image-IconMonsterHead-T_IconMonsterHead_31075_UI.webp', rank: 'Common' },
};

// [SECTION:ECHO_SKILL_BUFFS] — 4-cost echo active skill timed buffs
// buffs: stat bonuses granted by using the echo active skill (or passive from main slot)
// duration: seconds the buff lasts after activation (omit for passive main-slot buffs)
// target: 'self' (default) | 'team' (all members) | 'next' (incoming character on outro)
// passive: true = always active when equipped in main slot (no activation needed)
const ECHO_SKILL_BUFFS = {
  // ── v1.0 — Launch ──
  'Mourning Aix':            { buffs: [{ stat: 'spectroDmg', value: 12 }, { stat: 'libDmg', value: 12 }], duration: 15 },
  'Feilian Beringal':        { buffs: [{ stat: 'aeroDmg', value: 12 }, { stat: 'heavyDmg', value: 12 }], duration: 15 },
  'Tempest Mephis':          { buffs: [{ stat: 'electroDmg', value: 12 }, { stat: 'heavyDmg', value: 12 }], duration: 15 },
  'Thundering Mephis':       { buffs: [{ stat: 'electroDmg', value: 12 }, { stat: 'libDmg', value: 12 }], duration: 15 },
  'Inferno Rider':           { buffs: [{ stat: 'fusionDmg', value: 12 }, { stat: 'basicDmg', value: 12 }], duration: 15 },
  'Bell-Borne Geochelone':   { buffs: [{ stat: 'allDmg', value: 10 }], duration: 15, target: 'team' },
  'Impermanence Heron':      { buffs: [{ stat: 'allDmg', value: 12 }], duration: 15, target: 'next' },
  'Lampylumen Myriad':       { buffs: [{ stat: 'glacioDmg', value: 12 }, { stat: 'skillDmg', value: 12 }], duration: 15 },
  'Mech Abomination':        { buffs: [{ stat: 'atkPct', value: 12 }], duration: 15 },
  'Crownless':               { buffs: [{ stat: 'havocDmg', value: 12 }, { stat: 'skillDmg', value: 12 }], duration: 15 },
  // ── v1.2–1.3 ──
  'Jué':                     { buffs: [{ stat: 'skillDmg', value: 16 }], duration: 15 },
  'Fallacy of No Return':    { buffs: [{ stat: 'atkPct', value: 10 }], duration: 20, target: 'team' },
  // ── v2.0 — Rinascita ──
  // corrected 2026-08-18: real desc has no "for Xs" clause on the main-slot bonus — it's an always-on
  // passive while equipped, not a temporary duration-15 buff.
  'Sentry Construct':        { buffs: [{ stat: 'glacioDmg', value: 12 }, { stat: 'skillDmg', value: 12 }], passive: true },
  'Dreamless':               { buffs: [{ stat: 'allDmg', value: 50 }], duration: 5, condition: 'Rover: Havoc' },
  'Nightmare: Impermanence Heron': { buffs: [{ stat: 'havocDmg', value: 12 }, { stat: 'heavyDmg', value: 12 }], passive: true },
  'Nightmare: Lampylumen Myriad':  { buffs: [{ stat: 'glacioDmg', value: 12 }, { stat: 'coordDmg', value: 30 }], passive: true },
  // ── v2.1–2.5 — Rinascita expansion ──
  'Reminiscence: Fleurdelys':      { buffs: [{ stat: 'aeroDmg', value: 10 }], passive: true },
  'Dragon of Dirge':               { buffs: [{ stat: 'fusionDmg', value: 12 }, { stat: 'basicDmg', value: 12 }], passive: true },
  'Nightmare: Hecate':             { buffs: [{ stat: 'havocDmg', value: 12 }, { stat: 'echoDmg', value: 20 }], passive: true },
  // corrected 2026-08-18: real main-slot bonus is +40% Coordinated Attack DMG only — no Havoc DMG or
  // Skill DMG bonus exists on this echo (that was fabricated), and it's an always-on passive.
  'Hecate':                        { buffs: [{ stat: 'coordDmg', value: 40 }], passive: true },
  'Nightmare: Crownless':          { buffs: [{ stat: 'havocDmg', value: 12 }, { stat: 'basicDmg', value: 12 }], passive: true },
  'Nightmare: Mourning Aix':       { buffs: [{ stat: 'spectroDmg', value: 12 }], passive: true },
  'Nightmare: Feilian Beringal':   { buffs: [{ stat: 'aeroDmg', value: 12 }, { stat: 'heavyDmg', value: 12 }], passive: true },
  'Nightmare: Inferno Rider':      { buffs: [{ stat: 'fusionDmg', value: 12 }, { stat: 'skillDmg', value: 12 }], passive: true },
  'Nightmare: Tempest Mephis':     { buffs: [{ stat: 'electroDmg', value: 12 }, { stat: 'skillDmg', value: 12 }], passive: true },
  'Nightmare: Thundering Mephis':  { buffs: [{ stat: 'electroDmg', value: 12 }, { stat: 'libDmg', value: 12 }], passive: true },
  // ── v2.6 — Sanguis Plateaus ──
  'Lioness of Glory':              { buffs: [{ stat: 'fusionDmg', value: 12 }, { stat: 'libDmg', value: 12 }], passive: true },
  'The False Sovereign':           { buffs: [{ stat: 'electroDmg', value: 12 }, { stat: 'heavyDmg', value: 12 }], passive: true },
  'Lady of the Sea':               { buffs: [{ stat: 'aeroDmg', value: 12 }, { stat: 'libDmg', value: 12 }], passive: true },
  // corrected 2026-08-18: all three below have no "for Xs" clause in the real desc — always-on passives,
  // not temporary duration-15 buffs. Nightmare: Kelpie's second stat was also wrong (basicDmg → aeroDmg,
  // per "gains Glacio DMG Bonus and Aero DMG Bonus"); Reminiscence: Fenrico's was wrong too
  // (libDmg → heavyDmg, per "gains Aero DMG Bonus and Heavy Attack DMG Bonus").
  'Lorelei':                       { buffs: [{ stat: 'havocDmg', value: 12 }, { stat: 'libDmg', value: 12 }], passive: true },
  'Nightmare: Kelpie':             { buffs: [{ stat: 'glacioDmg', value: 12 }, { stat: 'aeroDmg', value: 12 }], passive: true },
  'Reminiscence: Fenrico':         { buffs: [{ stat: 'aeroDmg', value: 12 }, { stat: 'heavyDmg', value: 12 }], passive: true },
  // ── v2.8 — Chronorift ──
  'Reminiscence: Threnodian - Leviathan': { buffs: [{ stat: 'havocDmg', value: 12 }, { stat: 'libDmg', value: 12 }], passive: true },
  // ── v3.0+ — Lahai-Roi ──
  'Hyvatia':                       { buffs: [{ stat: 'allDmg', value: 10 }], duration: 15, target: 'next' },
  'Twin Nova - Nebulous Cannon':   { buffs: [{ stat: 'spectroDmg', value: 12 }, { stat: 'basicDmg', value: 12 }], passive: true },
  // added 2026-08-18 (echo audit): main-slot passives confirmed via nanoka.cc, were entirely missing
  // from ECHO_SKILL_BUFFS despite being described in ECHO_DATA.desc — so were never applied in calcEngine.
  'Twin Nova - Collapsar Blade':   { buffs: [{ stat: 'electroDmg', value: 12 }, { stat: 'basicDmg', value: 12 }], passive: true },
  'Corrosaurus':                   { buffs: [{ stat: 'fusionDmg', value: 12 }, { stat: 'echoDmg', value: 20 }], passive: true },
  'Kerasaur':                      { buffs: [{ stat: 'aeroDmg', value: 12 }, { stat: 'libDmg', value: 12 }], passive: true },
  'Capitaneus':                    { buffs: [{ stat: 'spectroDmg', value: 12 }, { stat: 'heavyDmg', value: 12 }], passive: true },
  'Abyssal Patricius':             { buffs: [{ stat: 'glacioDmg', value: 12 }], passive: true },
  'Vitreum Dancer':                { buffs: [{ stat: 'electroDmg', value: 12 }], passive: true },
  'Glommoth':                      { buffs: [{ stat: 'glacioDmg', value: 12 }], duration: 15, target: 'next' },
  'Sigillum':                      { buffs: [{ stat: 'libDmg', value: 25 }], passive: true, condition: 'Aemeath' },
  // corrected 2026-08-18: real main-slot bonus is +10% Energy Regen only — no Fusion DMG or Skill DMG
  // bonus exists on this echo (that was fabricated), and it's an always-on passive.
  'Reactor Husk':                  { buffs: [{ stat: 'energyRegen', value: 10 }], passive: true },
  // corrected 2026-08-18: was heavyDmg +12%, real is echoDmg +20% (per nanoka.cc's raw skill data).
  'Nameless Explorer':             { buffs: [{ stat: 'aeroDmg', value: 12 }, { stat: 'echoDmg', value: 20 }], duration: 15 },
  // ── v3.5 — Land of Xuanfang (confirmed via nanoka.cc live echo pages) ──
  'Thousand-Puppet Pavilion':      { buffs: [{ stat: 'havocDmg', value: 12 }, { stat: 'heavyDmg', value: 12 }], passive: true },
  'Myriad Snare: Rustfire Chassis':{ buffs: [{ stat: 'fusionDmg', value: 12 }, { stat: 'heavyDmg', value: 12 }], passive: true },
  'Reminiscence: Denia':           { buffs: [{ stat: 'fusionDmg', value: 12 }], duration: 15, target: 'next' },
  'Reminiscence: Threnodian - Voidborne Construct': { buffs: [{ stat: 'glacioDmg', value: 12 }, { stat: 'libDmg', value: 12 }], passive: true },
  'Reminiscence - Nightmare: Adam Smasher': { buffs: [{ stat: 'critRate', value: 15 }], passive: true, condition: 'Lucy or Rebecca' },
};

// [SECTION:GENERIC_SONATA_LOADOUT] — full 5-echo (4/3/3/1/1 cost) loadout builder.
// Community build guides (Prydwen, Beebom, nanoka, etc.) only ever name a specific echo for the
// cost-4 main slot — the other 4 slots exist purely to complete the set bonus, so guides just say
// "any echo of set X". Rather than fabricate names nobody's guide actually recommends, this fills
// those slots with a real, verifiable echo that carries the right set at the right cost tier (first
// match in ALL_3COST_ECHOES/ALL_1COST_ECHOES), and pairs each slot with the generic main-stat
// priority WW players target for that cost tier (Crit DMG/Crit Rate on cost-3, ATK%/HP%/DEF% on
// cost-1) — a placeholder representative, not a claimed "this exact echo" recommendation.
const isSetSlot = (s) => /\d\s*pc\b/i.test(s || '');
const splitEchoLabel = (s) => {
  const m = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(s || '');
  return m ? { text: m[1].trim(), label: m[2].trim() } : { text: (s || '').trim(), label: null };
};
// `exclude` — names already picked for an earlier slot in this same build. A
// real Wuthering Waves loadout can never equip two echoes with the same
// name, but the two cost-3 slots (and separately the two cost-1 slots)
// almost always belong to the same set — without this, calling this
// function twice with identical (setName, costList) arguments is
// deterministic and returns the same echo both times, producing an
// impossible "duplicate echo" build.
const findEchoOfSet = (setName, costList, exclude = []) => {
  const inTier = costList.find(e => ECHO_DATA[e]?.sets?.includes(setName) && !exclude.includes(e));
  if (inTier) return inTier;
  // No unused echo of this set at this cost tier — look across every tier
  // before giving up, still excluding names already used elsewhere in this
  // build (a name from a different cost tier is never actually equippable
  // in this slot anyway, but excluding it here keeps the search honest).
  const anyTier = [ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES].flat()
    .find(e => ECHO_DATA[e]?.sets?.includes(setName) && !exclude.includes(e));
  if (anyTier) return anyTier;
  // Truly only one echo of this set exists anywhere (rare) — reusing it is
  // still better than leaving the slot empty; this is the only path that
  // can still produce a duplicate, and only when no alternative exists at
  // all, not because nothing tried to avoid it.
  return costList.find(e => ECHO_DATA[e]?.sets?.includes(setName)) || null;
};
// Standard WW main-stat convention. Crit Rate/Crit DMG are ONLY rollable on cost-4 echoes — the
// previous version of this file had 'Crit Rate' as one of the two cost-3 slots below, which isn't
// a real cost-3 main stat at all and can't actually appear on an in-game echo at that cost. The
// cost-3 pool is Elemental DMG% / Energy Regen / ATK% / DEF% / HP% — this fills one cost-3 slot
// with the build's own Elemental DMG% (echoes can't roll their own set's DMG% as a main stat, so
// this is always the *character's* element, not necessarily the sonata's) and the other with
// Energy Regen, a standard real second cost-3 pick. Cost-1 echoes can't roll Crit or Elemental
// DMG% at all, so they default to ATK% (or the character's scaling stat).
const cost4MainStat = (statScaling) => statScaling === 'HP' ? 'Healing Bonus' : 'Crit DMG';
const cost3MainStats = (statScaling, element) => statScaling === 'HP' ? ['Healing Bonus', 'Energy Regen'] : ['Energy Regen', element ? `${element} DMG` : 'ATK%'];
const cost1MainStats = (statScaling) => statScaling === 'HP' ? ['HP%', 'HP%'] : statScaling === 'DEF' ? ['DEF%', 'DEF%'] : ['ATK%', 'ATK%'];

/**
 * Builds full 5-echo (cost 4/3/3/1/1) generic loadouts from a character's `bestEchoes` array.
 * Returns [{ sonataName, sonataElement, sonataSetName, label, slots: [{ cost, name, iconUrl, mainStat, generic }] }].
 * `sonataElement` is the sonata's own ECHO_SETS element (a DMG element, or 'Heal'/'Support'/'ATK'/
 * 'Shield' for non-elemental sets); `sonataSetName` is the primary set's exact name — together they
 * let the UI color the sonata name/main-echo highlight in the UI.
 * `generic: true` on a slot marks it as a representative pick (any echo of that set/cost works),
 * as opposed to the cost-4 slot, which is the community-sourced named recommendation.
 * `element` is the character's own element (for the cost-3 Elemental DMG% slot) — distinct from the
 * sonata's element, since echoes can't roll their own set's DMG% as a main stat.
 */
export function getSonataLoadouts(bestEchoes, statScaling, element) {
  if (!bestEchoes?.length) return [];
  const rows = [];
  for (let i = 0; i < bestEchoes.length; i++) {
    const entry = bestEchoes[i];
    if (isSetSlot(entry)) { rows.push({ main: null, set: entry }); }
    else {
      const next = bestEchoes[i + 1];
      if (next && isSetSlot(next)) { rows.push({ main: entry, set: next }); i++; }
      else { rows.push({ main: entry, set: null }); }
    }
  }
  return rows.map((row) => {
    const main = row.main ? splitEchoLabel(row.main) : null;
    const setSlot = row.set ? splitEchoLabel(row.set) : null;
    const setParts = setSlot ? setSlot.text.split('+').map(p => p.trim()).filter(Boolean) : [];
    // e.g. "Wishes of Quiet Snowfall 5pc" → { name: 'Wishes of Quiet Snowfall', count: 5 }
    const parsedSets = setParts.map(p => {
      const m = /^(.*?)\s+(\d+)\s*pc$/i.exec(p);
      return m ? { name: m[1].trim(), count: parseInt(m[2], 10) } : { name: p.replace(/\s+\d+\s*pc$/i, '').trim(), count: 5 };
    });
    const sonataName = parsedSets.map(s => s.name).join(' + ') || (main ? (ECHO_DATA[main.text]?.sets?.[0] || '') : '');
    const label = setSlot?.label || main?.label || null;
    // The sonata's own "element" per ECHO_SETS — not always a DMG element (can be 'Heal'/'Support'/
    // 'ATK'/'Shield') — plus the primary set's own name, both used by the UI to color the sonata
    // name and highlight the main echo slot (the 6 DMG-element sets use the app's standard element
    // colors; the Heal/Support/ATK/Shield sets are keyed by name to a color sampled from their own
    // icon artwork, since there's no shared brand color for those categories).
    const primarySetName = parsedSets[0]?.name || (main ? ECHO_DATA[main.text]?.sets?.[0] : null) || null;
    const sonataElement = primarySetName ? ECHO_SETS[primarySetName]?.element || null : null;
    if (!parsedSets.length && !main) return { sonataName, sonataElement, sonataSetName: primarySetName, label, slots: [] };

    // How many of the 4 non-main slots belong to each set, honoring "3pc + 2pc" splits (main echo
    // itself already counts as 1 piece toward the first-listed set).
    const remainingCounts = parsedSets.map((s, i) => Math.max(0, s.count - (i === 0 && main ? 1 : 0)));
    const setQueue = [];
    parsedSets.forEach((s, i) => { for (let n = 0; n < remainingCounts[i]; n++) setQueue.push(s.name); });
    while (setQueue.length < 4 && parsedSets.length) setQueue.push(parsedSets[setQueue.length % parsedSets.length].name);
    // A row can list just a main echo with no explicit set (e.g. an alt main-echo pick alongside a
    // full [main, set] row elsewhere in the same build list) — fall back to that echo's own set so
    // the cost-3/cost-1 slots still fill in rather than being left empty.
    const primarySet = primarySetName;

    const cost4Name = main ? main.text : (primarySet ? findEchoOfSet(primarySet, ALL_4COST_ECHOES) : null);
    const c3Stats = cost3MainStats(statScaling, element);
    const c1Stats = cost1MainStats(statScaling);
    const slots = [];
    if (cost4Name) slots.push({ cost: 4, name: cost4Name, iconUrl: ECHO_DATA[cost4Name]?.iconUrl || null, mainStat: cost4MainStat(statScaling), generic: !main });
    // usedCost3/usedCost1 accumulate names already picked within THIS tier
    // so the second slot never lands on the same echo as the first — see
    // findEchoOfSet's own comment for why calling it twice without this
    // tracking always produced a duplicate whenever both slots share a set
    // (the normal case for any single-set 4pc/5pc build).
    const usedCost3 = [];
    [0, 1].forEach((n) => {
      const setName = setQueue[n] || primarySet;
      const name = setName ? findEchoOfSet(setName, ALL_3COST_ECHOES, usedCost3) : null;
      if (name) { usedCost3.push(name); slots.push({ cost: 3, name, iconUrl: ECHO_DATA[name]?.iconUrl || null, mainStat: c3Stats[n], generic: true }); }
    });
    const usedCost1 = [];
    [2, 3].forEach((n) => {
      const setName = setQueue[n] || primarySet;
      const name = setName ? findEchoOfSet(setName, ALL_1COST_ECHOES, usedCost1) : null;
      if (name) { usedCost1.push(name); slots.push({ cost: 1, name, iconUrl: ECHO_DATA[name]?.iconUrl || null, mainStat: c1Stats[n - 2], generic: true }); }
    });
    return { sonataName, sonataElement, sonataSetName: primarySetName, label, slots };
  });
}

// Per-level (1-120) HP/ATK/DEF for boss echoes, sourced from nanoka.cc's static monster data
// (static.nanoka.cc/ww/3.6/en/monster/<id>.json, matched by echo id). Index 0 = level 1 ... index
// 119 = level 120 (120 is the ceiling nanoka's own level slider exposes for these bosses — Tower/
// Illusive Realm difficulty scaling goes past the level-90 open-world cap). DEF converges to 1512
// for every boss at level 90 specifically: WW's enemy DEF curve at that level is uniform across
// bosses, not a copy/paste error.

/** Returns { hp, atk, def } for a boss echo at a given level, or null if not tracked/out of range. */
export function getEnemyStatsAtLevel(name, level) {
  const rows = ENEMY_LEVEL_STATS[name];
  if (!rows) return null;
  const lvl = Math.max(1, Math.min(120, Math.round(Number(level) || 90)));
  const row = rows[lvl - 1];
  if (!row) return null;
  const [hp, atk, def] = row;
  return { hp, atk, def };
}

// Per-level (1-120) stagger-system stats — Interruption RES, Vibration Strength, Rage (+ Recovery
// variants) — sourced from wutheringwaves.fandom.com's own Module:Enemy Stats/data + .../scaling
// Lua modules (fetched via the site's api.php, which unlike the page itself isn't behind a
// Cloudflare JS challenge). These genuinely ARE level-scaled for 4 of the 6 fields — confirmed
// directly from the wiki's own render logic (Module:Enemy Stats: `data[name].hardness *
// scaling[level].hardness` etc) — only Interruption RES and its Recovery are flat per-boss
// constants (toughness/toughness_recover in the wiki's raw field names). Vibration Strength/Rage
// turn out to be the exact same underlying numbers as nanoka.cc's hardness_max/rage_max (which
// nanoka's own UI mislabels "Stun DMG"/"Toughness DMG") — cross-checked exactly at every level.
// Lioness of Glory has no entry in the wiki's data module at all (not fabricated — left untracked,
// same null-fallback as every other genuinely-missing stat in this file).

/**
 * Returns { interruptRes, interruptResRecover, vibration, vibrationRecover, rage, rageRecover } at
 * a given level, or null if not tracked/out of range.
 */
export function getEnemyStaggerStatsAtLevel(name, level) {
  const rows = ENEMY_STAGGER_STATS[name];
  if (!rows) return null;
  const lvl = Math.max(1, Math.min(120, Math.round(Number(level) || 90)));
  const row = rows[lvl - 1];
  if (!row) return null;
  const [interruptRes, interruptResRecover, vibration, vibrationRecover, rage, rageRecover] = row;
  return { interruptRes, interruptResRecover, vibration, vibrationRecover, rage, rageRecover };
}

// [SECTION:ECHO_DMG_DATA] — Per-echo active skill damage multipliers & enemy resistance
// dmg: total ATK% damage multiplier of echo active skill (sum of all hits)
// element: damage element of the echo skill
// enemyRes: elemental resistances when this echo is fought as the enemy that drops it — covers all
// 181 tracked echoes (1/3/4-cost alike), not just 4-cost bosses; every row below has real data, no
// nulls left as of the 2026-08-19 enemy-stats audit
[
  // ── 4-Cost Echoes (Bosses) ──
  // added 2026-08-18 (echo audit, task #6): these 5 v3.5 4-cost echoes had full ECHO_DATA entries
  // (desc, sets, buff) but were never merged with a dmg/element tuple, so equipping any of them in the
  // main echo slot silently contributed 0 active-skill DMG in DamageCalculator's echoActiveDmg calc.
  // Myriad Snare: Rustfire Chassis is Max-HP%-scaled, not ATK%-scaled, so its dmg is left unset (same
  // precedent as other %MaxHP echoes elsewhere in this file).
  // RES filled in 2026-08-19 from static.nanoka.cc's monster JSON (same pipeline as the 39 main
  // bosses); Thousand-Puppet Pavilion carries TWO boosted elements (Electro AND Havoc), confirmed
  // directly in its base_stats rather than assumed from its own damage element.
  ['Thousand-Puppet Pavilion', 109, 'Havoc', { electro: 40, havoc: 40 }],
  ['Myriad Snare: Rustfire Chassis', 0, 'Fusion', { fusion: 40 }],
  ['Reminiscence: Denia', 274, 'Fusion', { fusion: 40 }],
  ['Reminiscence: Threnodian - Voidborne Construct', 274, 'Glacio', { fusion: 40 }],
  ['Reminiscence - Nightmare: Adam Smasher', 164, 'Physical', {}],
  // Calamity Effigy had no dmg/element/enemyRes row at all before this — its active-skill dmg% is
  // still genuinely unconfirmed (see its ECHO_DATA desc), left at 0 rather than guessed; RES is real.
  ['Calamity Effigy', 0, 'Aero', { aero: 40 }],
  ['Mourning Aix', 394, 'Spectro', { spectro: 40 }],
  ['Feilian Beringal', 515, 'Aero', { aero: 40 }],
  ['Tempest Mephis', 0, 'Electro', { electro: 40 }],
  ['Thundering Mephis', 884, 'Electro', { electro: 40 }],
  ['Inferno Rider', 808, 'Fusion', { fusion: 40 }],
  ['Bell-Borne Geochelone', 0, 'Glacio', { glacio: 40 }],
  ['Impermanence Heron', 0, 'Havoc', { havoc: 40 }],
  ['Lampylumen Myriad', 687, 'Glacio', { glacio: 40 }],
  ['Mech Abomination', 529, 'Electro', { electro: 40 }],
  ['Crownless', 670, 'Havoc', { havoc: 40 }],
  ['Jué', 243, 'Spectro', { spectro: 40 }],
  ['Fallacy of No Return', 0, 'Spectro', { spectro: 40 }],
  ['Sentry Construct', 405, 'Glacio', { glacio: 40 }],
  ['Dreamless', 541, 'Havoc', { havoc: 40 }],
  ['Nightmare: Impermanence Heron', 405, 'Havoc', { havoc: 40 }],
  ['Nightmare: Lampylumen Myriad', 274, 'Glacio', { glacio: 40 }],
  ['Dragon of Dirge', 0, 'Fusion', { fusion: 40 }],
  ['Nightmare: Hecate', 457, 'Havoc', { havoc: 40 }],
  ['Hecate', 0, 'Havoc', { havoc: 40 }],
  ['Nightmare: Crownless', 405, 'Havoc', { havoc: 40 }],
  ['Nightmare: Mourning Aix', 274, 'Spectro', { spectro: 40 }],
  ['Nightmare: Feilian Beringal', 274, 'Aero', { aero: 40 }],
  ['Nightmare: Inferno Rider', 405, 'Fusion', { fusion: 40 }],
  ['Nightmare: Tempest Mephis', 265, 'Electro', { electro: 40 }],
  ['Nightmare: Thundering Mephis', 405, 'Electro', { electro: 40 }],
  ['Reminiscence: Fleurdelys', 356, 'Aero', { aero: 40 }],
  ['Lioness of Glory', 274, 'Fusion', { fusion: 40 }],
  ['The False Sovereign', 221, 'Electro', { electro: 40 }],
  ['Lady of the Sea', 301, 'Aero', { aero: 40 }],
  ['Corrosaurus', 274, 'Fusion', { fusion: 40 }],
  ['Reminiscence: Threnodian - Leviathan', 264, 'Havoc', { havoc: 40 }],
  ['Hyvatia', 274, 'Spectro', { spectro: 40 }],
  ['Twin Nova - Nebulous Cannon', 161, 'Spectro', { spectro: 40 }],
  ['Sigillum', 274, 'Fusion', { fusion: 40 }],
  ['Reactor Husk', 351, 'Fusion', { fusion: 40 }],
  ['Nameless Explorer', 274, 'Aero', { aero: 40 }],
  ['Lorelei', 405, 'Havoc', { havoc: 40 }],
  ['Nightmare: Kelpie', 405, 'Glacio', { glacio: 40 }],
  ['Reminiscence: Fenrico', 274, 'Aero', { aero: 40 }],
  ['Forbidden Bastion', 238, 'Glacio', { glacio: 40 }],
  ['Fog Lionarch', 238, 'Fusion', { fusion: 40 }],
  ['Voidwing Moth', 405, 'Spectro', { spectro: 40 }],
  ['Capitaneus', 356, 'Spectro', { spectro: 40 }],
  // ── 3-Cost Echoes (Elites) ──
  ['Havoc Dreadmane', 389, 'Havoc', { havoc: 40 }],
  ['Lumiscale Construct', 554, 'Glacio', { glacio: 40 }],
  ['Tambourinist', 0, 'Havoc', { havoc: 40 }],
  ['Spearback', 171, 'Physical', {}],
  ['Carapace', 280, 'Aero', { aero: 40 }],
  ['Roseshroom', 171, 'Havoc', { havoc: 40 }],
  ['Violet-Feathered Heron', 288, 'Electro', { electro: 40 }],
  ['Cyan-Feathered Heron', 237, 'Aero', { aero: 40 }],
  ['Flautist', 533, 'Electro', { electro: 40 }],
  ['Hoochief', 268, 'Aero', { aero: 40 }],
  ['Stonewall Bracer', 282, 'Physical', {}],
  ['Autopuppet Scout', 272, 'Glacio', { glacio: 40 }],
  ['Viridblaze Saurian', 171, 'Fusion', { fusion: 40 }],
  ['Glacio Dreadmane', 406, 'Glacio', { glacio: 40 }],
  ['Chasm Guardian', 274, 'Havoc', { havoc: 40 }],
  ['Abyssal Mercator', 268, 'Glacio', { glacio: 40 }],
  ['Twin Nova - Collapsar Blade', 0, 'Electro', { electro: 40 }],
  ['Sabercat Prowler', 193, 'Havoc', { havoc: 40 }],
  ['Sabercat Reaver', 193, 'Fusion', { fusion: 40 }],
  ['Spacetrek Explorer', 0, 'Shield', { electro: 40 }],
  ['Flora Reindeer', 193, 'Aero', { aero: 40 }],
  ['Windlash Coleoid', 268, 'Aero', { aero: 40 }],
  ['Frostbite Coleoid', 193, 'Glacio', { glacio: 40 }],
  ['Glommoth', 274, 'Glacio', { glacio: 40 }],
  ['Ironhoof', 268, 'Fusion', { fusion: 40 }],
  ['Mining Reindeer', 238, 'Electro', { electro: 40 }],
  ['Reminiscence - Kronaclaw', 268, 'Aero', { aero: 40 }],
  ['Kronablight', 268, 'Electro', { electro: 40 }],
  ["Pilgrim's Shell", 268, 'Aero', { aero: 40 }],
  ['Kerasaur', 536, 'Aero', {}],
  ['Hurriclaw', 313, 'Aero', { aero: 40 }],
  ['Nightmare: Viridblaze Saurian', 171, 'Fusion', { fusion: 40 }],
  ['Nightmare: Violet-Feathered Heron', 288, 'Electro', { electro: 40 }],
  ['Nightmare: Cyan-Feathered Heron', 237, 'Aero', { aero: 40 }],
  ['Nightmare: Roseshroom', 171, 'Havoc', { havoc: 40 }],
  ['Nightmare: Tambourinist', 0, 'Havoc', { havoc: 40 }],
  ['Diurnus Knight', 268, 'Spectro', { spectro: 40 }],
  ['Nocturnus Knight', 268, 'Havoc', { havoc: 40 }],
  ['Questless Knight', 313, 'Electro', { electro: 40 }],
  ['Abyssal Gladius', 268, 'Glacio', { glacio: 40 }],
  ['Abyssal Patricius', 268, 'Glacio', { glacio: 40 }],
  ['Rage Against the Statue', 313, 'Spectro', { spectro: 40 }],
  ['Vitreum Dancer', 313, 'Electro', { electro: 40 }],
  ['Cuddle Wuddle', 313, 'Physical', {}],
  ['Chop Chop', 193, 'Fusion', { fusion: 40 }],
  ['Lightcrusher', 226, 'Spectro', { spectro: 40 }],
  ['Rocksteady Guardian', 0, 'Spectro', { spectro: 40 }],
  // ── 1-Cost Echoes ──
  ['Smiter', 193, 'Spectro', { spectro: 40 }],
  ['Porcelain Picket', 130, 'Aero', { aero: 40 }],
  ['Stone Picket', 130, 'Aero', { aero: 40 }],
  ['Aureate Picket', 154, 'Aero', { aero: 40 }],
  ['Kernel Puppet: Joy', 130, 'Physical', {}],
  ['Kernel Puppet: Anger', 130, 'Fusion', { fusion: 40 }],
  ['Kernel Puppet: Worry', 65, 'Glacio', { glacio: 40 }],
  ['Kernel Puppet: Reflection', 65, 'Electro', { electro: 40 }],
  ['Kernel Puppet: Grief', 130, 'Spectro', { spectro: 40 }],
  ['Kernel Puppet: Fright', 130, 'Havoc', { havoc: 40 }],
  ['Fog Lionarch: Body', 193, 'Fusion', { fusion: 40 }],
  ['Fog Lionarch: Head', 130, 'Fusion', { fusion: 40 }],
  ['Smolder', 193, 'Fusion', { fusion: 40 }],
  ['Electro Predator', 115, 'Electro', { electro: 40 }],
  ['Fusion Dreadmane', 0, 'Fusion', { fusion: 40 }],
  ['Lava Larva', 0, 'Fusion', { fusion: 40 }],
  ['Whiff Whaff', 171, 'Aero', { aero: 40 }],
  ['Cruisewing', 0, 'Healing', { spectro: 40 }],
  ['Chirpuff', 115, 'Aero', { aero: 40 }],
  ['Fusion Warrior', 288, 'Fusion', { fusion: 40 }],
  ['Havoc Warrior', 288, 'Havoc', { havoc: 40 }],
  ['Snip Snap', 0, 'Fusion', { fusion: 40 }],
  ['Zig Zag', 0, 'Spectro', { spectro: 40 }],
  ['Hooscamp', 0, 'Aero', { aero: 40 }],
  ['Fusion Prism', 0, 'Fusion', { fusion: 100 }],
  ['Glacio Prism', 115, 'Glacio', { glacio: 100 }],
  ['Aero Prism', 19, 'Aero', { aero: 100 }],
  ['Havoc Prism', 115, 'Havoc', { havoc: 100 }],
  ['Spectro Prism', 115, 'Spectro', { spectro: 100 }],
  ['Baby Viridblaze Saurian', 0, 'Healing', { fusion: 40 }],
  ['Baby Roseshroom', 0, 'Havoc', { havoc: 40 }],
  ['Clang Bang', 0, 'Glacio', { glacio: 40 }],
  ['Dwarf Cassowary', 115, 'Physical', {}],
  ['Excarat', 0, 'Physical', { havoc: 40 }],
  ['Lottie Lost', 130, 'Spectro', { spectro: 40 }],
  ['Chest Mimic', 193, 'Spectro', { spectro: 40 }],
  ['Aero Predator', 86, 'Aero', { aero: 40 }],
  ['Glacio Predator', 115, 'Glacio', { glacio: 40 }],
  ['Gulpuff', 115, 'Glacio', { glacio: 40 }],
  ['Aero Drake', 130, 'Aero', { aero: 40 }],
  ['Electro Drake', 130, 'Electro', { electro: 40 }],
  ['Fusion Drake', 78, 'Fusion', { fusion: 40 }],
  ['Glacio Drake', 130, 'Glacio', { glacio: 40 }],
  ['Havoc Drake', 389, 'Havoc', { havoc: 40 }],
  ['Spectro Drake', 130, 'Spectro', { spectro: 40 }],
  ["Devotee's Flesh", 130, 'Aero', { aero: 40 }],
  ['Sacerdos', 130, 'Aero', { aero: 40 }],
  ['Sagittario', 268, 'Spectro', { spectro: 40 }],
  ['La Guardia', 804, 'Physical', {}],
  ['Calcified Junrock', 0, 'Healing', { glacio: 40 }],
  ['Fission Junrock', 0, 'Healing', {}],
  ['Golden Junrock', 130, 'Spectro', { spectro: 40 }],
  ['Vanguard Junrock', 0, 'Physical', {}],
  ['Diamondclaw', 0, 'Physical', {}],
  ['Diggy Duggy', 268, 'Physical', {}],
  ['Fae Ignis', 130, 'Havoc', { havoc: 40 }],
  ['Frostscourge Stalker', 130, 'Glacio', { glacio: 40 }],
  ['Voltscourge Stalker', 130, 'Electro', { electro: 40 }],
  ['Galescourge Stalker', 0, 'Healing', { aero: 40 }],
  ['Hocus Pocus', 130, 'Havoc', { havoc: 40 }],
  ['Nimbus Wraith', 0, 'Healing', { spectro: 40 }],
  ['Hoartoise', 0, 'Healing', { glacio: 40 }],
  ['Sabyr Boar', 0, 'Physical', {}],
  ['Traffic Illuminator', 0, 'Utility', { spectro: 40 }],
  ['Tick Tack', 171, 'Havoc', { havoc: 40 }],
  ['Chop Chop: Headless', 130, 'Fusion', { fusion: 40 }],
  ['Chop Chop: Leftless', 130, 'Spectro', { spectro: 40 }],
  ['Chop Chop: Rightless', 130, 'Havoc', { havoc: 40 }],
  ['Geospider S4', 130, 'Spectro', { spectro: 40 }],
  ['Flora Drone', 65, 'Healing', { aero: 40 }],
  ['Mining Drone', 205, 'Havoc', { havoc: 40 }],
  ['Zip Zap', 130, 'Electro', { electro: 40 }],
  ['Iceglint Dancer', 205, 'Glacio', { glacio: 40 }],
  ['Shadow Stepper', 130, 'Havoc', { havoc: 40 }],
  ['Tremor Warrior', 205, 'Electro', { electro: 40 }],
  ['Nightmare: Aero Predator', 86, 'Aero', { aero: 40 }],
  ['Nightmare: Electro Predator', 115, 'Electro', { electro: 40 }],
  ['Nightmare: Glacio Predator', 115, 'Glacio', { glacio: 40 }],
  ['Nightmare: Baby Roseshroom', 0, 'Havoc', { havoc: 40 }],
  ['Nightmare: Baby Viridblaze Saurian', 0, 'Healing', { fusion: 40 }],
  ['Nightmare: Chirpuff', 115, 'Aero', { aero: 40 }],
  ['Nightmare: Dwarf Cassowary', 115, 'Physical', {}],
  ['Nightmare: Gulpuff', 115, 'Glacio', { glacio: 40 }],
  ['Nightmare: Havoc Warrior', 515, 'Havoc', { havoc: 40 }],
  ['Nightmare: Tick Tack', 171, 'Havoc', { havoc: 40 }],
].forEach(([name, dmg, element, enemyRes]) => {
  // enemyStats: full boss stat card shape for MonsterCard/EnemySelector/EchoDetail. hp/atk/def default
  // to level 90 via getEnemyStatsAtLevel (nanoka.cc, full 1-120 curve); any boss genuinely not tracked
  // there is left null (never fabricated), same graceful-degradation behavior as before. Callers that
  // want a different level should call getEnemyStatsAtLevel(name, level) directly rather than reading
  // this fixed level-90 snapshot.
  const lv90 = getEnemyStatsAtLevel(name, 90);
  const stagger90 = getEnemyStaggerStatsAtLevel(name, 90);
  // Each row's own audited RES (enemyRes) only ever records the boosted element(s) — every other
  // element (Physical included) is a flat 10% RES baseline confirmed across every raw nanoka.cc
  // monster JSON sampled, all 181 enemies alike. Fill the full 7-way table from that baseline rather
  // than leaving unlisted elements undisplayed at an implicit 0%.
  const enemyStats = enemyRes ? {
    level: 90, hp: lv90?.hp ?? null, atk: lv90?.atk ?? null, def: lv90?.def ?? null,
    interruptRes: stagger90?.interruptRes ?? null, interruptResRecover: stagger90?.interruptResRecover ?? null,
    vibration: stagger90?.vibration ?? null, vibrationRecover: stagger90?.vibrationRecover ?? null,
    rage: stagger90?.rage ?? null, rageRecover: stagger90?.rageRecover ?? null,
    res: {
      physical: enemyRes.physical || 10,
      glacio: enemyRes.glacio || 10, fusion: enemyRes.fusion || 10, electro: enemyRes.electro || 10,
      aero: enemyRes.aero || 10, spectro: enemyRes.spectro || 10, havoc: enemyRes.havoc || 10,
    },
  } : null;
  if (ECHO_DATA[name]) Object.assign(ECHO_DATA[name], { dmg, element, ...(enemyRes && { enemyRes, enemyStats }) });
});

// All unique echo sonata sets (for filter dropdown, includes sets beyond ECHO_SETS)
const ALL_ECHO_SONATA_SETS = [...new Set(Object.values(ECHO_DATA).flatMap(e => e.sets))].sort();
const ALL_ECHO_BUFF_TYPES = [...new Set(Object.values(ECHO_DATA).flatMap(e => Array.isArray(e.buff) ? e.buff : [e.buff]))].sort();

// [SECTION:LOCALIZATION] — locale-aware overlays for echoes.fr.js.
// English data above is the single source of truth for numbers/mechanics;
// these merge in translated *text* fields only, keyed by the same names.
import { ECHO_SETS_FR, ECHO_DATA_FR, translateBuffFr } from './echoes.fr.js';

/** @param {string} locale */
export function getLocalizedEchoSets(locale) {
  if (locale !== 'fr') return ECHO_SETS;
  const out = {};
  for (const [name, base] of Object.entries(ECHO_SETS)) {
    out[name] = { ...base, ...(ECHO_SETS_FR[name] || {}) };
  }
  return out;
}

/** @param {string} locale */
export function getLocalizedEchoData(locale) {
  if (locale !== 'fr') return ECHO_DATA;
  const out = {};
  for (const [name, base] of Object.entries(ECHO_DATA)) {
    const fr = ECHO_DATA_FR[name];
    out[name] = { ...base, buff: translateBuffFr(base.buff), ...(fr?.name ? { displayName: fr.name } : {}), ...(fr?.desc ? { desc: fr.desc } : {}) };
  }
  return out;
}

// [SECTION:WEAPON_DATA]

export { ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ECHO_DATA, ECHO_SKILL_BUFFS, ALL_ECHO_SONATA_SETS, ALL_ECHO_BUFF_TYPES };
