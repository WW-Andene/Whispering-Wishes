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
  'Mourning Aix':                    { sets: ['Celestial Light'], buff: 'Spectro DMG', desc: 'A spectral avian Overlord. Skill transforms into Mourning Aix for 2 claw attacks dealing 157%/236% Spectro DMG, then grants +12% Spectro DMG and +12% Resonance Liberation DMG for 15s.' , iconUrl: 'https://i.ibb.co/XZ09Kvky/Mourning-Aix-Icon.webp' },
  'Feilian Beringal':                { sets: ['Sierra Gale'], buff: 'Aero DMG', desc: 'A towering ape-like Overlord wreathed in wind. Skill transforms into Feilian Beringal for a powerful kick (231% Aero DMG) and follow-up strike (283% Aero DMG), then grants +12% Aero DMG and +12% Heavy ATK DMG for 15s.' , iconUrl: 'https://i.ibb.co/RppHgV69/Feilian-Beringal-Icon.webp' },
  'Tempest Mephis':                  { sets: ['Void Thunder'], buff: 'Electro DMG', desc: 'A lightning-wreathed lupine Overlord. Skill transforms into Tempest Mephis for tail swing attacks (102% Electro DMG each) and a claw strike (175% Electro DMG), then grants +12% Electro DMG and +12% Heavy ATK DMG for 15s.' , iconUrl: 'https://i.ibb.co/m5KgKh6R/Tempest-Mephis-Icon.webp' },
  'Thundering Mephis':               { sets: ['Void Thunder'], buff: 'Electro DMG', desc: 'A massive wolf-like Overlord crackling with thunder. Skill transforms into Thundering Mephis for up to 6 strikes (132% Electro DMG each, final hit 189%), then grants +12% Electro DMG and +12% Resonance Liberation DMG for 15s.' , iconUrl: 'https://i.ibb.co/Mbg8kP3/Thundering-Mephis-Icon.webp' },
  'Inferno Rider':                   { sets: ['Molten Rift'], buff: 'Fusion DMG', desc: 'A blazing mounted knight Overlord. Skill transforms into Inferno Rider for 3 slashes dealing 242%/282%/282% Fusion DMG, then grants +12% Fusion DMG and +12% Basic ATK DMG for 15s. Hold to enter Riding Mode.' , iconUrl: 'https://i.ibb.co/Mkw9SPM7/Inferno-Rider-Icon.webp' },
  'Bell-Borne Geochelone':           { sets: ['Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Shield', desc: 'A giant bell-carrying tortoise. Skill deals 145% DEF-scaled Glacio DMG and grants a Bell-Borne Shield (50% DMG Reduction, +10% DMG Boost for team) lasting 15s or 3 hits.' , iconUrl: 'https://i.ibb.co/zVZHP0hw/Bell-Borne-Geochelone-Icon.webp' },
  'Impermanence Heron':              { sets: ['Moonlit Clouds'], buff: 'Havoc DMG', desc: 'A spectral crane-like Overlord. Skill transforms into Impermanence Heron dealing 310% Havoc DMG on dive; hold to spit flames (55% Havoc DMG each). Restores 10 Resonance Energy on hit and boosts next character\'s DMG by 12% for 15s after Outro.' , iconUrl: 'https://i.ibb.co/k6QDV6H1/Impermanence-Heron-Icon.webp' },
  'Lampylumen Myriad':               { sets: ['Freezing Frost'], buff: 'Glacio DMG', desc: 'A luminous deep-sea jellyfish Overlord. Skill transforms into Lampylumen Myriad for 3 freezing strikes dealing 220%/200%/266% Glacio DMG. Each hit grants +4% Glacio DMG and +4% Resonance Skill DMG for 15s, stacking 3 times.' , iconUrl: 'https://i.ibb.co/q3yyBwB8/Lampylumen-Myriad-Icon.webp' },
  'Mech Abomination':                { sets: ['Lingering Tunes'], buff: 'Electro DMG', desc: 'A grotesque mechanical construct Overlord. Skill strikes for 48% Electro DMG and summons Mech Waste dealing 320% Electro DMG on hit (explodes for 160% more). Grants +12% ATK for 15s. Mech Waste DMG counts as Outro Skill DMG.' , iconUrl: 'https://i.ibb.co/GqBBWHL/Mech-Abomination-Icon.webp' },
  'Crownless':                       { sets: ['Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A faceless humanoid Overlord of pure Havoc energy. Skill transforms into Crownless for 4 attacks: two hits of 134% Havoc DMG, a double-hit of 100%, and a triple-hit of 67%. Grants +12% Havoc DMG and +12% Resonance Skill DMG for 15s.' , iconUrl: 'https://i.ibb.co/NkpNYzb/Crownless-Icon.webp' },
  'Jué':                    { sets: ['Celestial Light'], buff: 'Spectro DMG', desc: 'The ancient dragon guardian of Jinzhou. Skill summons Jué to soar and strike (48% Spectro DMG), call 5 thunderbolts (19% each), and spiral down twice (48% each). Grants Blessing of Time: +16% Resonance Skill DMG Bonus and Spectro DoT for 15s.' , iconUrl: 'https://i.ibb.co/hxsP3fFC/Ju-Icon.webp' },
  'Fallacy of No Return':            { sets: ['Rejuvenating Glow'], buff: 'Spectro DMG', desc: 'An otherworldly Overlord that bends reality. Skill blasts surrounding area for 15.86% Max HP Spectro DMG; hold to flurry at 1.58% Max HP per hit, ending with 19.82% Max HP. Grants +10% Energy Regen and +10% ATK to all team members for 20s.' , iconUrl: 'https://i.ibb.co/tPw0LG3T/Fallacy-of-No-Return-Icon.webp' },
  'Sentry Construct':                { sets: ['Frosty Resolve'], buff: 'Glacio DMG', desc: 'A massive armored guardian construct. Skill transforms into Sentry Construct dealing 405% Glacio DMG. After enough Resonance Liberations charge the Strike Capacitor to max, resets Echo cooldown and dives for 405% Glacio DMG with freeze. Grants +12% Glacio DMG and +12% Resonance Skill DMG.' , iconUrl: 'https://i.ibb.co/BVJsMKzd/Sentry-Construct-Icon.webp' },
  'Nightmare: Impermanence Heron':   { sets: ['Midnight Veil'], buff: 'Havoc DMG', desc: 'A nightmare variant of the spectral crane wreathed in prismatic energy. Skill transforms and delivers up to 10 strikes of 40% Havoc DMG each. Main slot grants +12% Havoc DMG and +12% Heavy ATK DMG passively.' , iconUrl: 'https://i.ibb.co/5gct6D18/Nightmare-Impermanence-Heron-Icon.webp' },
  'Nightmare: Lampylumen Myriad':    { sets: ['Empyrean Anthem', 'Frosty Resolve'], buff: 'Glacio DMG', desc: 'A nightmare variant of the luminous jellyfish. Skill transforms and attacks surrounding enemies for 273% Glacio DMG. Main slot passively grants +12% Glacio DMG and +30% Coordinated ATK DMG.' , iconUrl: 'https://i.ibb.co/rWn3RrM/Nightmare-Lampylumen-Myriad-Icon.webp' },
  'Dragon of Dirge':                 { sets: ['Tidebreaking Courage'], buff: 'Fusion DMG', desc: 'A grieving dragon from the depths of Rinascita. Skill transforms and summons a Grief Rift lasting 5s, periodically dealing 36% Fusion DMG to enemies in the area. Main slot grants +12% Fusion DMG and +12% Basic ATK DMG.' , iconUrl: 'https://i.ibb.co/hFQ1ZCmT/Dragon-of-Dirge-Icon.webp' },
  'Nightmare: Hecate':               { sets: ['Dream of the Lost'], buff: 'Havoc DMG', desc: 'A nightmare variant of the three-headed witch of the deep. Skill transforms into Nightmare Hecate, leaping up and smashing down for 3 stages of Havoc DMG (152% each). Main slot passively grants +12% Havoc DMG and +20% Echo Skill DMG.' , iconUrl: 'https://i.ibb.co/zhskZ8jn/Nightmare-Hecate-Icon.webp' },
  'Nightmare: Crownless':            { sets: ['Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A nightmare variant of the faceless Havoc Overlord. Skill transforms and attacks enemies in front for 405% Havoc DMG. 3 charges (1 per 12s). On hit, +20% DMG for 2s. Main slot grants +12% Havoc DMG and +12% Basic ATK DMG.' , iconUrl: 'https://i.ibb.co/x8JsLzb0/Nightmare-Crownless-Icon.webp' },
  'Nightmare: Mourning Aix':         { sets: ['Eternal Radiance'], buff: 'Spectro DMG', desc: 'A nightmare variant of the spectral avian. Skill summons Nightmare: Mourning Aix dealing 273% Spectro DMG. DMG to enemies with Spectro Frazzle is increased by 100%. Main slot grants +12% Spectro DMG.' , iconUrl: 'https://i.ibb.co/ccWwhHhX/Nightmare-Mourning-Aix-Icon.webp' },
  'Nightmare: Feilian Beringal':     { sets: ['Sierra Gale'], buff: 'Aero DMG', desc: 'A nightmare variant of the wind ape. Skill summons Nightmare: Feilian Beringal dealing 164% Aero DMG, leaving a Whirlwind Beam that attacks 5 more times for 21% Aero DMG each. Main slot grants +12% Aero DMG and +12% Heavy ATK DMG.' , iconUrl: 'https://i.ibb.co/fdBQFmtL/Nightmare-Feilian-Beringal-Icon.webp' },
  'Nightmare: Inferno Rider':        { sets: ['Molten Rift'], buff: 'Fusion DMG', desc: 'A nightmare variant of the blazing knight. Skill transforms and jumps to attack for 405% Fusion DMG. Hold to enter Riding Mode (exit deals 283% Fusion DMG). Main slot grants +12% Fusion DMG and +12% Resonance Skill DMG.' , iconUrl: 'https://i.ibb.co/Z6Hsjwr4/Nightmare-Inferno-Rider-Icon.webp' },
  'Nightmare: Tempest Mephis':       { sets: ['Void Thunder', 'Empyrean Anthem'], buff: 'Electro DMG', desc: 'A nightmare variant of the lightning wolf. Skill transforms and attacks surrounding enemies for 405% Electro DMG. Main slot grants +12% Electro DMG and +12% Resonance Skill DMG.' , iconUrl: 'https://i.ibb.co/Qv6VB480/Nightmare-Tempest-Mephis-Icon.webp' },
  'Nightmare: Thundering Mephis':    { sets: ['Void Thunder'], buff: 'Electro DMG', desc: 'A nightmare variant of the thunder wolf. Skill transforms and attacks enemies in front for 405% Electro DMG. Main slot grants +12% Electro DMG and +12% Resonance Liberation DMG.' , iconUrl: 'https://i.ibb.co/TMjCxQX9/Nightmare-Thundering-Mephis-Icon.webp' },
  'Dreamless':                       { sets: ['Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A humanoid Calamity of pure Havoc tied to Rover\'s past. Skill transforms for 6 strikes: first 5 deal 54% Havoc DMG each, final hit deals 270% Havoc DMG. DMG increased by 50% within 5s of Rover: Havoc\'s Resonance Liberation.' , iconUrl: 'https://i.ibb.co/JjT68rdx/Dreamless-Icon.webp' },
  'Reminiscence: Fleurdelys':        { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Aero DMG', desc: 'An echo of the ancient flower-dragon guardian. Skill summons the Windcleaver for 8 hits of 27% Aero DMG plus one hit of 136% Aero DMG. Main slot grants +10% Aero DMG (+20% if Rover: Aero or Cartethyia).' , iconUrl: 'https://i.ibb.co/N6r9JSwb/Reminiscence-Fleurdelys-Icon.webp' },
  'Lioness of Glory':                { sets: ['Flaming Clawprint'], buff: 'Fusion DMG', desc: 'A proud leonine Overlord wielding the Halberd of Glory. Skill summons the Halberd to crush an area for 82% Fusion DMG, then blasts off for 191% Fusion DMG. Main slot grants +12% Fusion DMG and +12% Resonance Liberation DMG.' , iconUrl: 'https://i.ibb.co/TMFh75cg/Lioness-of-Glory-Icon.webp' },
  'The False Sovereign':             { sets: ['Crown of Valor'], buff: 'Electro DMG', desc: 'A puppet-king Overlord infused with Electro. Skill transforms and dashes forward in a spinning strike dealing 55% Electro DMG x4. Upon casting Intro Skill, also summons the False Sovereign for 405% Electro DMG. Main slot grants +12% Electro DMG and +12% Heavy ATK DMG. 2 charges, 1 per 8s.' , iconUrl: 'https://i.ibb.co/NHH8K01/The-False-Sovereign-Icon.webp' },
  'Lady of the Sea':                 { sets: ['Crown of Valor'], buff: 'Aero DMG', desc: 'A majestic maritime Overlord commanding the tides. Skill summons a Tidestorm dealing 13% Aero DMG x10 and 164% Aero DMG x1. Main slot grants +12% Aero DMG and +12% Resonance Liberation DMG.' , iconUrl: 'https://i.ibb.co/C5kVbQcS/Lady-of-the-Sea-Icon.webp' },
  'Corrosaurus':                     { sets: ['Flaming Clawprint', "Flamewing's Shadow"], buff: 'Fusion DMG', desc: 'A rare armored saurian of the Sanguis Plateaus that spews molten rock. Skill summons Corrosaurus to attack for 273% Fusion DMG. Main slot grants +12% Fusion DMG and +20% Echo Skill DMG.' , iconUrl: 'https://i.ibb.co/1G54DG6K/Corrosaurus-Icon.webp' },
  'Reminiscence: Threnodian - Leviathan': { sets: ["Flamewing's Shadow", 'Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A colossal sea-beast Calamity wreathed in Havoc. Skill summons a Collapsing Horizon for 2 hits of 131% Havoc DMG and creates Core of Collapse for 15s (24% Havoc DMG per hit, up to 8 times). Main slot grants +12% Havoc DMG and +12% Resonance Liberation DMG.' , iconUrl: 'https://i.ibb.co/Z12RVspK/Reminiscence-Threnodian-Leviathan-Icon.webp' },
  'Hyvatia':                         { sets: ['Pact of Neonlight Leap', 'Rite of Gilded Revelation'], buff: 'Spectro DMG', desc: 'An ancient construct boss from Lahai-Roi that fires converging lasers. Skill summons Hyvatia mid-air to fire lasers dealing 27% Spectro DMG x10. Outro within 15s grants the incoming Resonator +10% All-Attribute DMG Bonus for 15s.' , iconUrl: 'https://i.ibb.co/PGtdhhRd/Hyvatia-Icon.webp' },
  'Twin Nova - Nebulous Cannon':      { sets: ['Rite of Gilded Revelation', 'Chromatic Foam'], buff: 'Spectro DMG', desc: 'The ranged model of a Spacetrek Collective combat mech pair. Skill transforms to slash enemies twice for 80% Spectro DMG each. Main slot grants +12% Spectro DMG and +12% Basic ATK DMG. Pairing with Collapsar Blade enables combo attacks and Dyad Origins stacks (+10% Echo Skill DMG each, up to 6).' , iconUrl: 'https://i.ibb.co/s9rrBgL8/Twin-Nova-Nebulous-Cannon-Icon.webp' },
  'Sigillum':                        { sets: ['Trailblazing Star'], buff: 'Fusion DMG', desc: 'A Calamity-class star guardian sealed beyond the Gate of the Lost Star. Skill summons Sigillum for two attacks dealing 68%/205% Fusion DMG. When equipped by Aemeath, grants +25% Resonance Liberation DMG.' , iconUrl: 'https://i.ibb.co/JR620JdC/Sigillum-Icon.webp' },
  // corrected 2026-08-18 (echo audit): desc fabricated "+12% Fusion DMG and +12% Resonance Skill DMG" and
  // a "Hold to charge Meltdown Beam" mechanic that doesn't exist — nanoka.cc's raw skill data shows a
  // single jumping slash (351% Fusion DMG) and the real main-slot bonus is just +10% Energy Regen.
  'Reactor Husk':                    { sets: ['Halo of Starry Radiance', 'Chromatic Foam'], buff: 'Fusion DMG', desc: 'A massive reactor construct from Lahai-Roi. Skill transforms into Reactor Husk, jumping into the air and unleashing a heavy slash dealing 351% Fusion DMG. Grants +10% Energy Regen.' , iconUrl: 'https://i.ibb.co/4nRHm50w/Reactor-Husk-Icon.webp' },
  // corrected 2026-08-18 (echo audit): was missing the 'Reel of Spliced Memories' set tag, and the desc
  // fabricated a "3-hit wind combo 135%/135%/183%" breakdown and "+12% Heavy ATK DMG" — nanoka.cc's raw
  // skill data shows a single 273.60% Aero DMG application and "+12% Aero DMG, +20% Echo Skill DMG Bonus".
  'Nameless Explorer':               { sets: ['Sound of True Name', 'Reel of Spliced Memories'], buff: 'Aero DMG', desc: 'A mysterious explorer Overlord who wanders between forgotten ruins. Skill summons Nameless Explorer to attack enemies along its path, dealing 273.6% Aero DMG. Grants +12% Aero DMG and +20% Echo Skill DMG.' , iconUrl: 'https://i.ibb.co/sdWR4SgF/Nameless-Explorer-Icon.webp' },
  'Lorelei':                         { sets: ['Midnight Veil'], buff: 'Havoc DMG', desc: 'A siren-like Overlord that lures with haunting melodies. Skill transforms into Lorelei and sings a Dirge of Ruin, dealing 68% Havoc DMG x6 to enemies in a cone. Enemies hit by all 6 notes are Silenced for 2s. Grants +12% Havoc DMG and +12% Resonance Liberation DMG.' , iconUrl: 'https://i.ibb.co/9kynG0DJ/Lorelei-Icon.webp' },
  // corrected 2026-08-18: desc's "+12% Basic ATK DMG" was wrong — real second bonus is +12% Aero DMG.
  // Damage breakdown also corrected: real is a single 405% Glacio DMG hit, plus a separate 405% Aero DMG
  // hit from Nightmare: Kelpie summoned on Outro Skill (not "205%+248% Glacio with a freeze chance").
  'Nightmare: Kelpie':               { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Glacio DMG', desc: 'A nightmare variant of a water-horse Overlord wreathed in frozen mist. Skill transforms into Nightmare: Kelpie to attack nearby targets for 405% Glacio DMG. Switching out via Outro Skill summons it again to deal 405% Aero DMG. Grants +12% Glacio DMG and +12% Aero DMG.' , iconUrl: 'https://i.ibb.co/bjtwr7yr/Nightmare-Kelpie-Icon.webp' },
  // corrected 2026-08-18: desc fabricated a "tri-beam + detonation" combo and "+12% Havoc DMG/+12% Skill
  // DMG" — nanoka.cc's raw skill data shows 3 Crescent Servants attacking for a single 45.59% Havoc DMG
  // application, and the real main-slot bonus is just +40% Coordinated Attack DMG (no Havoc DMG at all).
  'Hecate':                          { sets: ['Empyrean Anthem'], buff: 'Havoc DMG', desc: 'The three-headed witch Calamity of the deep. Skill summons 3 twirling Crescent Servants that attack enemies with spinning blades for 45.6% Havoc DMG; triggering a Counterattack resets their duration. Grants +40% Coordinated Attack DMG.' , iconUrl: 'https://i.ibb.co/DH0bCdYK/Hecate-Icon.webp' },
  // corrected 2026-08-18: desc's "+12% Resonance Liberation DMG" was wrong — nanoka.cc's raw skill data
  // shows the real second bonus is +12% Heavy Attack DMG.
  'Reminiscence: Fenrico':           { sets: ['Dream of the Lost', 'Law of Harmony'], buff: 'Aero DMG', desc: 'A reminiscence of the wolf guardian Fenrico, howling with primordial wind. Skill summons the Talons of Decree to attack nearby enemies for 273.6% Aero DMG. Grants +12% Aero DMG and +12% Heavy Attack DMG.' , iconUrl: 'https://i.ibb.co/wZK2x483/Reminiscence-Fenrico-Icon.webp' },
  // v3.5 — Land of Xuanfang echoes, confirmed via nanoka.cc live echo pages (2026-08-14)
  'Thousand-Puppet Pavilion':        { sets: ['Song of Feathered Trace'], buff: 'Havoc DMG', desc: "A Calamity-class puppet-master construct from Land of Xuanfang. Skill attacks nearby enemies for 109.44% Havoc DMG and summons 4 Blades of Thousand Memories (15s); inflicting Havoc Bane consumes a Blade to deal 41.04% Havoc DMG (once per 1s). Main slot grants +12% Havoc DMG and +12% Heavy ATK DMG.", iconUrl: 'https://i.ibb.co/23cVrFbk/Thousand-Puppet-Pavilion.webp' },
  'Myriad Snare: Rustfire Chassis':  { sets: ["Heart of Evil's Purge", 'Lamp of Nether Road'], buff: 'Fusion DMG', desc: "An Overlord-class mechanical hazard from Land of Xuanfang. Skill summons a crushing chassis dealing 10.20% Max HP Fusion DMG on impact, then up to 19 more hits of 0.37% Max HP Fusion DMG each. Main slot grants +12% Fusion DMG and +12% Heavy ATK DMG.", iconUrl: 'https://i.ibb.co/KzxLH0wS/Myriad-Snare-Rustfire-Chassis.webp' },
  'Reminiscence: Denia':             { sets: ['Chromatic Foam'], buff: 'Fusion DMG', desc: "Denia's Calamity-class signature Echo. Skill summons \"Trickster\" for 273.60% Fusion DMG; within 15s, casting Outro Skill grants the incoming Resonator +12% Fusion DMG Bonus for 15s.", iconUrl: 'https://i.ibb.co/qYy1Y7Ck/Reminiscence-Denia.webp' },
  'Reminiscence: Threnodian - Voidborne Construct': { sets: ['Wishes of Quiet Snowfall'], buff: 'Glacio DMG', desc: "Calamity-class Echo from Land of Xuanfang. Skill summons Aleph-1's Creation for 5 hits of 21.88% Glacio DMG plus one hit of 164.16% Glacio DMG. Main slot grants +12% Glacio DMG and +12% Resonance Liberation DMG.", iconUrl: 'https://i.ibb.co/gZdFc1CG/Reminiscence-Threnodian-Voidborne-Construct.webp' },
  'Reminiscence - Nightmare: Adam Smasher': { sets: ['Shadow of Shattered Dreams'], buff: 'Physical DMG', desc: "Overlord-class Echo from the Cyberpunk: Edgerunners collab. Skill deals 16 hits of 10.26% ATK Physical DMG. When equipped by Lucy or Rebecca in the main slot, grants +15% Crit Rate and unlocks a character-specific enhanced Echo Skill (Lucy: Spectro burst; Rebecca: Electro missile barrage).", iconUrl: 'https://i.ibb.co/twCtsS1D/Reminiscence-Nightmare-Adam-Smasher.webp' },
  // added 2026-08-18 (echo audit): Calamity-class Aero echo, Qingxiao's dedicated v3.6 main echo for
  // Heart of Evil's Purge. Set/element/cost confirmed via WebSearch (game8.co & ldshop.gg Qingxiao build
  // guides). Active-skill damage % and any main-slot passive buff numbers could not be confirmed from any
  // accessible source (nanoka.cc/prydwen.gg blocked, fandom wiki paywalled) — no numbers fabricated here,
  // and no ECHO_SKILL_BUFFS entry was added pending confirmation.
  'Calamity Effigy':                 { sets: ["Heart of Evil's Purge"], buff: 'Aero DMG', desc: "A Calamity-class Echo from Land of Xuanfang, Qingxiao's dedicated main Echo. Skill transforms to deal Aero DMG; the main slot grants Aero DMG Bonus (exact percentages unconfirmed)." },
  // ── 3-Cost Echoes ──
  'Forbidden Bastion':               { sets: ['Song of Feathered Trace', "Heart of Evil's Purge", 'Lamp of Nether Road'], buff: 'Healing', desc: 'An Elite-class fortified construct from Land of Xuanfang. Skill summons Forbidden Bastion to bash enemies for 237.60% Glacio DMG. Main slot grants +10% Healing Bonus.', iconUrl: 'https://i.ibb.co/Ps1zmbnM/Forbidden-Bastion.webp' },
  'Fog Lionarch':                    { sets: ['Song of Feathered Trace', "Heart of Evil's Purge", 'Lamp of Nether Road'], buff: 'Fusion DMG', desc: 'An Elite-class beast from Land of Xuanfang. Skill summons Fog Lionarch to spit fire at enemies, dealing 7 stages of 33.93% Fusion DMG.', iconUrl: 'https://i.ibb.co/TB6d8kTy/Fog-Lionarch.webp' },
  'Voidwing Moth':                   { sets: ['Reel of Spliced Memories'], buff: 'Spectro DMG', desc: "Denia's paired Elite-class moth Echo. Skill transforms into Voidwing Moth for 405% Spectro DMG on cast, or hold for up to 12 hits of 49.33% Spectro DMG. Within 15s, casting Outro Skill grants the incoming Resonator +12% ATK for 15s.", iconUrl: 'https://i.ibb.co/mCw6NvMt/Voidwing-Moth.webp' },
  'Capitaneus':                      { sets: ['Eternal Radiance', 'Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Spectro DMG', desc: 'The supreme commander of the Order, carrying out judgment on transgressors. Skill summons Capitaneus to jump and smash for 118% Spectro DMG, generating 4 Merciless Judgements at 59% Spectro DMG each. Main slot grants +12% Spectro DMG and +12% Heavy ATK DMG.' , iconUrl: 'https://i.ibb.co/VYbs2G44/Capitaneus-Icon.webp' },
  'Havoc Dreadmane':                 { sets: ['Molten Rift', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A dark-maned lion-like beast radiating Havoc energy. Skill transforms into Havoc Dreadmane for 2 tail strikes, each dealing 116% Havoc DMG plus 77% bonus Havoc DMG on hit.' , iconUrl: 'https://i.ibb.co/3y35jG2X/Havoc-Dreadmane-Icon.webp' },
  'Lumiscale Construct':             { sets: ['Freezing Frost', 'Void Thunder'], buff: 'Glacio DMG', desc: 'An armored construct with luminous scales. Skill transforms into a Parry Stance; slash deals 553% Glacio DMG, or counterattack on hit deals 553% + 276% Glacio DMG.' , iconUrl: 'https://i.ibb.co/YBYGBw70/Lumiscale-Construct-Icon.webp' },
  'Tambourinist':                    { sets: ['Freezing Frost', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A rhythmic humanoid Tacet Discord that weaponizes sound. Skill summons Tambourinist playing Melodies of Annihilation; when a Resonator hits a target, deals 14% Havoc DMG up to 10 times over 10s.' , iconUrl: 'https://i.ibb.co/Jw8j0SxC/Tambourinist-Icon.webp' },
  'Spearback':                       { sets: ['Moonlit Clouds', 'Lingering Tunes'], buff: 'Physical DMG', desc: 'A ferocious bear-like beast covered in arrow-shaped Tacetite spines. Skill summons Spearback for 5 attacks: first 4 deal 29% Physical DMG each, final hit deals 51% Physical DMG.' , iconUrl: 'https://i.ibb.co/7JSVwMyC/Spearback-Icon.webp' },
  'Carapace':                        { sets: ['Sierra Gale', 'Moonlit Clouds'], buff: 'Aero DMG', desc: 'An elite construct that camouflages among city ruins. Skill transforms into Carapace for a spinning attack (112% Aero DMG) followed by a slash (168% Aero DMG).' , iconUrl: 'https://i.ibb.co/PGkFcS50/Carapace-Icon.webp' },
  'Roseshroom':                      { sets: ['Freezing Frost', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A mature fungal Tacet Discord that channels dark energy through its cap. Skill summons Roseshroom to fire a laser dealing 57% Havoc DMG up to 3 times.' , iconUrl: 'https://i.ibb.co/kgz25mLM/Roseshroom-Icon.webp' },
  'Violet-Feathered Heron':          { sets: ['Molten Rift', 'Void Thunder'], buff: 'Electro DMG', desc: 'A purple-winged heron that only spreads its wings in thunderstorms. Skill transforms into a Parry Stance; counterattack deals 288% Electro DMG. If attacked during parry, counters early and recovers 5 Concerto Energy.' , iconUrl: 'https://i.ibb.co/ns6dcr6t/Violet-Feathered-Heron-Icon.webp' },
  'Cyan-Feathered Heron':            { sets: ['Sierra Gale', 'Celestial Light'], buff: 'Aero DMG', desc: 'A cyan-winged heron found in forests and shores. Skill transforms and charges at enemies dealing 236% Aero DMG, interrupting enemy Special Skills on hit.' , iconUrl: 'https://i.ibb.co/DfK0CRyM/Cyan-Feathered-Heron-Icon.webp' },
  'Flautist':                        { sets: ['Void Thunder', 'Lingering Tunes'], buff: 'Electro DMG', desc: 'A humanoid Tacet Discord that wields sound as a weapon. Skill transforms and continuously emits Electro lasers dealing 53% Electro DMG x10. Gains 1 Concerto Energy per hit.' , iconUrl: 'https://i.ibb.co/RphMfMzT/Flautist-Icon.webp' },
  'Hoochief':                        { sets: ['Sierra Gale', 'Rejuvenating Glow'], buff: 'Aero DMG', desc: 'A large primate Tacet Discord commanding wind. Skill transforms into Hoochief Cyclone and smacks enemies for 268% Aero DMG.' , iconUrl: 'https://i.ibb.co/tTL9qbhD/Hoochief-Icon.webp' },
  'Stonewall Bracer':                { sets: ['Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Shield', desc: 'A hulking stone-armored construct. Skill transforms and charges forward for 112% Physical DMG, then smashes for 168% Physical DMG and gains a shield equal to 10% Max HP for 7s.' , iconUrl: 'https://i.ibb.co/dw7V5L6T/Stonewall-Bracer-Icon.webp' },
  'Autopuppet Scout':                { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'A derelict combat puppet hiding in city ruins. Skill transforms dealing 272% Glacio DMG to surroundings and generating up to 3 Ice Walls that block enemies.' , iconUrl: 'https://i.ibb.co/5WJVT0ns/Autopuppet-Scout-Icon.webp' },
  'Viridblaze Saurian':              { sets: ['Molten Rift', 'Moonlit Clouds'], buff: 'Fusion DMG', desc: 'A large amphibian-like beast found in forests that spits fire. Skill summons Viridblaze Saurian to continuously breathe fire, dealing 17% Fusion DMG x10.' , iconUrl: 'https://i.ibb.co/k2LsdFCf/Viridblaze-Saurian-Icon.webp' },
  'Glacio Dreadmane':                { sets: ['Freezing Frost', 'Moonlit Clouds'], buff: 'Physical DMG', desc: 'An icy lion-like beast from Mt. Firmament. Skill lacerates enemies for 214% Glacio DMG with 2 charges. Deals +20% DMG mid-air and generates 6 Icicles on landing (32% Glacio DMG each).' , iconUrl: 'https://i.ibb.co/LXG92c1v/Glacio-Dreadmane-Icon.webp' },
  'Chasm Guardian':                  { sets: ['Rejuvenating Glow', 'Lingering Tunes'], buff: 'Havoc DMG', desc: 'A boulder-like construct from the abyss, built to crush rather than protect. Skill transforms for a Leap Strike dealing 273% Havoc DMG at cost of 10% HP, then restores up to 10% Max HP over 5s.' , iconUrl: 'https://i.ibb.co/1J8M9qx0/Chasm-Guardian-Icon.webp' },
  'Abyssal Mercator':                { sets: ['Frosty Resolve', 'Eternal Radiance'], buff: 'Glacio DMG', desc: 'A battle-hardened combatant from the depths. Skill transforms into Abyssal Mercator to summon 3 Ice Spikes that each deal 89.39% Glacio DMG to enemies.' , iconUrl: 'https://i.ibb.co/chV4vWNJ/Abyssal-Mercator-Icon.webp' },
  'Twin Nova - Collapsar Blade':      { sets: ['Rite of Gilded Revelation', 'Trailblazing Star', 'Sound of True Name'], buff: 'Electro DMG', desc: 'The melee model of a Spacetrek Collective combat mech pair. Skill transforms to rapidly fire at enemies for 5s, each attack dealing 2.01% Electro DMG. Main slot grants +12% Electro DMG and +12% Basic ATK DMG. Pairing with Nebulous Cannon enables combo attacks and Dyad Origins stacks (+10% Echo Skill DMG each, up to 6).' , iconUrl: 'https://i.ibb.co/rK7B4PM5/Twin-Nova-Collapsar-Blade-Icon.webp' },
  'Sabercat Prowler':                { sets: ['Pact of Neonlight Leap', 'Halo of Starry Radiance', 'Sound of True Name'], buff: 'Havoc DMG', desc: 'A stealthy feline predator from Lahai-Roi. Skill summons Sabercat Prowler to fire beams at enemies, dealing 192.6% Havoc DMG.' , iconUrl: 'https://i.ibb.co/JWchKx7x/Sabercat-Prowler-Icon.webp' },
  'Sabercat Reaver':                 { sets: ['Pact of Neonlight Leap', 'Halo of Starry Radiance', 'Sound of True Name'], buff: 'Fusion DMG', desc: 'A fierce feline combatant from Lahai-Roi. Skill summons Sabercat Reaver to attack enemies, dealing 192.6% Fusion DMG.' , iconUrl: 'https://i.ibb.co/JWMcgRY4/Sabercat-Reaver-Icon.webp' },
  'Spacetrek Explorer':              { sets: ['Halo of Starry Radiance', 'Chromatic Foam', 'Sound of True Name'], buff: 'Shield', desc: "A spacefaring support unit from the Spacetrek Collective. Skill summons Spacetrek Explorer to grant nearby active team members a Shield equal to 10% of the summoner's Max HP for 4s." , iconUrl: 'https://i.ibb.co/4nh1N91b/Spacetrek-Explorer-Icon.webp' },
  'Flora Reindeer':                  { sets: ['Rite of Gilded Revelation', 'Reel of Spliced Memories'], buff: 'Aero DMG', desc: 'A gentle reindeer-like creature from Lahai-Roi. Skill summons Flora Reindeer to attack enemies within a large range, dealing 192.6% Aero DMG.' , iconUrl: 'https://i.ibb.co/LDv0brpC/Flora-Reindeer-Icon.webp' },
  'Windlash Coleoid':                { sets: ['Rite of Gilded Revelation', 'Wishes of Quiet Snowfall'], buff: 'Aero DMG', desc: 'A wind-infused cephalopod creature. Skill transforms into Windlash Coleoid to kick enemies, dealing 268.2% Aero DMG.' , iconUrl: 'https://i.ibb.co/1yKLmnC/Windlash-Coleoid-Icon.webp' },
  'Frostbite Coleoid':               { sets: ['Halo of Starry Radiance', 'Wishes of Quiet Snowfall'], buff: 'Glacio DMG', desc: 'A frost-infused cephalopod creature. Skill summons Frostbite Coleoid to punch enemies, dealing 192.6% Glacio DMG.' , iconUrl: 'https://i.ibb.co/5gdNHqbG/Frostbite-Coleoid-Icon.webp' },
  'Glommoth':                        { sets: ['Trailblazing Star', 'Wishes of Quiet Snowfall'], buff: 'Glacio DMG', desc: 'A glowing moth-like creature from Lahai-Roi. Skill summons Glommoth to stomp enemies, dealing 273.6% Glacio DMG. Casting Outro Skill within 15s grants the incoming Resonator +12% Glacio DMG Bonus for 15s.' , iconUrl: 'https://i.ibb.co/yBX17MGF/Glommoth-Icon.webp' },
  'Ironhoof':                        { sets: ['Pact of Neonlight Leap', 'Wishes of Quiet Snowfall', 'Reel of Spliced Memories'], buff: 'Fusion DMG', desc: 'A heavy hoofed beast from Lahai-Roi. Skill transforms into Ironhoof to charge at enemies, dealing 53.6% Fusion DMG. At the end of the charge, a goring attack deals 13.4% Fusion DMG 3 times and 174.3% Fusion DMG once.' , iconUrl: 'https://i.ibb.co/bRNS0DKF/Ironhoof-Icon.webp' },
  'Mining Reindeer':                 { sets: ['Pact of Neonlight Leap', 'Reel of Spliced Memories'], buff: 'Electro DMG', desc: 'A reindeer-like creature used in mining operations. Skill summons Mining Reindeer to launch a charged attack at enemies, dealing 237.6% Electro DMG.' , iconUrl: 'https://i.ibb.co/8gc61bfT/Mining-Reindeer-Icon.webp' },
  'Reminiscence - Kronaclaw':         { sets: ['Trailblazing Star', 'Chromatic Foam'], buff: 'Aero DMG', desc: 'A reminiscence of the fearsome Kronaclaw. Skill transforms into Kronaclaw to soar into the air, dealing 8.04% Aero DMG up to 8 times and 24.13% Aero DMG 2 times, then dive to deal 155.55% Aero DMG once.', iconUrl: 'https://i.ibb.co/KxrLYyzN/T-Icon-Monster-Head-32060-UI.webp' },
  'Kronablight':                     { sets: ['Trailblazing Star', 'Chromatic Foam'], buff: 'Electro DMG', desc: 'A blighted variant of the Kronaclaw. Skill transforms into Kronablight, soaring into the air and diving to deal 268.2% Electro DMG.' , iconUrl: 'https://i.ibb.co/4ZJ1Kzwb/Kronablight-Icon.webp' },
  'Pilgrim\'s Shell':                { sets: ['Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Aero DMG', desc: 'A shell-bearing pilgrim creature. Skill transforms into Pilgrim\'s Shell to attack nearby enemies, dealing 268.2% Aero DMG.', iconUrl: 'https://i.ibb.co/4ZHwcHT6/Pilgrims-Shell.webp' },
  'Kerasaur':                        { sets: ['Windward Pilgrimage', 'Flaming Clawprint', "Flamewing's Shadow"], buff: 'Aero DMG', desc: 'A horned saurian from the Sanguis Plateaus. Skill transforms into Kerasaur to leap and slam down for 268.2% Aero DMG; shortly after, cast Echo Skill again to charge at the target for another 268.2% Aero DMG. Main slot grants +12% Aero DMG and +12% Resonance Liberation DMG.' , iconUrl: 'https://i.ibb.co/tP81d0f5/Kerasaur-Icon.webp' },
  'Hurriclaw':                       { sets: ['Tidebreaking Courage', 'Gusts of Welkin', 'Crown of Valor'], buff: 'Aero DMG', desc: 'A wind-wielding claw beast. Skill transforms into Hurriclaw to charge forward, dealing 156.6% Aero DMG on hit plus a 156.6% Aero DMG sweep attack. Hold to keep charging, or use Echo Skill again mid-charge to sweep.' , iconUrl: 'https://i.ibb.co/RG3XwmV5/Hurriclaw-Icon.webp' },
  'Nightmare: Viridblaze Saurian':   { sets: ["Flamewing's Shadow"], buff: 'Fusion DMG', desc: 'A nightmare variant of the fire-breathing saurian. Skill summons it to continuously spit fire, dealing 17.12% Fusion DMG 10 times.' , iconUrl: 'https://i.ibb.co/C5Q01c2x/Nightmare-Viridblaze-Saurian-Icon.webp' },
  'Nightmare: Violet-Feathered Heron': { sets: ['Crown of Valor'], buff: 'Electro DMG', desc: 'A nightmare variant of the purple-winged heron. Skill transforms into a Parry Stance; counterattack deals 288% Electro DMG. If attacked during parry, counters early with a thunderbolt wing slash and recovers 5 Concerto Energy.' , iconUrl: 'https://i.ibb.co/rKDvkS2Q/Nightmare-Violet-Feathered-Heron-Icon.webp' },
  'Nightmare: Cyan-Feathered Heron': { sets: ['Law of Harmony'], buff: 'Aero DMG', desc: 'A nightmare variant of the cyan-winged heron. Skill transforms to charge at enemies, dealing 236.8% Aero DMG; this Echo Skill interrupts enemy Special Skills on hit.' , iconUrl: 'https://i.ibb.co/v6WJ0dJd/Nightmare-Cyan-Feathered-Heron-Icon.webp' },
  'Nightmare: Roseshroom':           { sets: ['Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A nightmare variant of the dark fungal creature. Skill summons it to fire a laser, dealing 57.07% Havoc DMG up to 3 times.' , iconUrl: 'https://i.ibb.co/yn41d4Vx/Nightmare-Roseshroom-Icon.webp' },
  'Nightmare: Tambourinist':         { sets: ['Dream of the Lost'], buff: 'Havoc DMG', desc: 'A nightmare variant of the rhythmic sound-weaponizer. Skill summons it to play Melodies of Annihilation; any team member who obtains a Melody deals an extra 14.4% Havoc DMG to their target on hit, up to 10 times over 10s.' , iconUrl: 'https://i.ibb.co/rfw6xZrR/Nightmare-Tambourinist-Icon.webp' },
  'Diurnus Knight':                  { sets: ['Eternal Radiance', 'Tidebreaking Courage'], buff: 'Spectro DMG', desc: 'A daytime knight of the Order. Skill transforms into Diurnus Knight to charge forward and attack with the sword for 268.2% Spectro DMG. DMG dealt to enemies inflicted with Spectro Frazzle is increased by 100%.' , iconUrl: 'https://i.ibb.co/CpyL99C5/Diurnus-Knight-Icon.webp' },
  'Nocturnus Knight':                { sets: ['Midnight Veil', 'Empyrean Anthem'], buff: 'Havoc DMG', desc: 'A nighttime knight of the Order. Skill transforms into Nocturnus Knight to strike enemies in front from the air, dealing 268.2% Havoc DMG.' , iconUrl: 'https://i.ibb.co/M5V9hjW5/Nocturnus-Knight-Icon.webp' },
  'Questless Knight':                { sets: ['Frosty Resolve', 'Midnight Veil'], buff: 'Electro DMG', desc: 'A wandering knight without a quest. Skill transforms into Questless Knight to smash surrounding enemies for 313.2% Electro DMG.' , iconUrl: 'https://i.ibb.co/vC2Mqzqc/Questless-Knight-Icon.webp' },
  'Abyssal Gladius':                 { sets: ['Midnight Veil', 'Tidebreaking Courage', 'Thread of Severed Fate'], buff: 'Glacio DMG', desc: 'A blade-wielding warrior from the abyss. Skill transforms into Abyssal Gladius to attack enemies with the sword for 268.2% Glacio DMG. Hold to maintain the Echo form, slashing and casting a ranged attack forward for 268.2% and 670.5% Glacio DMG respectively.' , iconUrl: 'https://i.ibb.co/PZ4WLJ1g/Abyssal-Gladius-Icon.webp' },
  'Abyssal Patricius':               { sets: ['Frosty Resolve', 'Empyrean Anthem'], buff: 'Glacio DMG', desc: 'A noble warrior from the abyss. Skill transforms into Abyssal Patricius to charge forward, dealing 268.2% Glacio DMG. Main slot grants +12% Glacio DMG Bonus.' , iconUrl: 'https://i.ibb.co/nqM5wjZc/Abyssal-Patricius-Icon.webp' },
  'Rage Against the Statue':         { sets: ['Eternal Radiance', 'Gusts of Welkin', 'Law of Harmony'], buff: 'Spectro DMG', desc: 'An animated statue filled with rage. Skill transforms to attack enemies for 313.2% Spectro DMG. Hold to maintain the form and charge towards enemies for 469.8% Spectro DMG.' , iconUrl: 'https://i.ibb.co/JWzHhr1H/Rage-Against-the-Statue-Icon.webp' },
  'Vitreum Dancer':                  { sets: ['Eternal Radiance', 'Empyrean Anthem'], buff: 'Electro DMG', desc: 'A glass-like dancer that channels electricity. Skill transforms into Vitreum Dancer to attack surrounding enemies for 313.2% Electro DMG. Main slot grants +12% Electro DMG Bonus.' , iconUrl: 'https://i.ibb.co/HpXcqH2X/Vitreum-Dancer-Icon.webp' },
  'Cuddle Wuddle':                   { sets: ['Frosty Resolve', 'Midnight Veil'], buff: 'Physical DMG', desc: 'A deceptively cuddly creature. Skill transforms into Cuddle Wuddle for 4 strikes dealing 46.98% Physical DMG each, then a final strike dealing 125.28% Physical DMG.' , iconUrl: 'https://i.ibb.co/C4kjd33/Cuddle-Wuddle-Icon.webp' },
  'Chop Chop':                       { sets: ['Empyrean Anthem', 'Tidebreaking Courage', 'Dream of the Lost'], buff: 'Fusion DMG', desc: 'A multi-armed chopping construct. Skill summons Chop Chop for a series of attacks: the first 6 strikes each deal 19.26% Fusion DMG, and the finishing strike deals 77.04% Fusion DMG.' , iconUrl: 'https://i.ibb.co/8LRFvBW4/Chop-Chop-Icon.webp' },
  'Lightcrusher':                    { sets: ['Celestial Light'], buff: 'Spectro DMG', desc: 'A light-infused crushing construct. Skill transforms into Lightcrusher and lunges forward for 135.36% Spectro DMG, generating 6 Ablucence on hit; each Ablucence explosion deals 15.04% Spectro DMG. Hold to stay in Lightcrusher form and leap/pounce forward.' , iconUrl: 'https://i.ibb.co/RpYdQddL/Lightcrusher-Icon.webp' },
  'Rocksteady Guardian':             { sets: ['Celestial Light', 'Rejuvenating Glow'], buff: 'Spectro DMG', desc: "A steadfast rock guardian. Skill transforms into a Parry State; upon being attacked, deals Spectro DMG equal to 8.29% of Max HP with a follow-up attack for another 8.29%. If the attack is a Special Skill, interrupt it, gain a 30% Max HP Shield, and unleash a two-stage follow-up (5.52% Max HP each) plus three ground-breaking waves (4.59% Max HP each)." , iconUrl: 'https://i.ibb.co/8LG9k4bn/Rocksteady-Guardian-Icon.webp' },
  // ── 1-Cost Echoes ──
  // added 2026-08-18 (echo audit): entirely missing from the roster despite being live v3.5 Land of
  // Xuanfang echoes, confirmed via nanoka.cc live echo pages. Icons re-hosted from the Fandom wiki to ibb.co.
  'Smiter':                          { sets: ['Song of Feathered Trace'], buff: 'Spectro DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Smiter to jab enemies 7 times for 19.26% Spectro DMG each, finishing with an uppercut for 57.78% Spectro DMG.', iconUrl: 'https://i.ibb.co/JWvmx2xC/Smiter.webp' },
  'Porcelain Picket':                { sets: ['Lamp of Nether Road'], buff: 'Aero DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Porcelain Picket to slash forward, dealing 2 hits of 19.44% Aero DMG and 7 hits of 12.96% Aero DMG to enemies along its path.', iconUrl: 'https://i.ibb.co/jP0xbjv8/Porcelain-Picket.webp' },
  'Stone Picket':                    { sets: ['Lamp of Nether Road'], buff: 'Aero DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Stone Picket, dealing 129.60% Aero DMG.', iconUrl: 'https://i.ibb.co/WvnyB258/Stone-Picket.webp' },
  'Aureate Picket':                  { sets: ["Heart of Evil's Purge"], buff: 'Aero DMG', desc: "An Elite-class puppet from Land of Xuanfang. Skill transforms into an Aureate Picket, recovering HP over time before bashing enemies for 153.90% Aero DMG.", iconUrl: 'https://i.ibb.co/zTK3cyrf/Aureate-Picket.webp' },
  'Kernel Puppet: Joy':              { sets: ['Song of Feathered Trace'], buff: 'Physical DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Joy to attack enemies, dealing 129.60% Physical DMG.', iconUrl: 'https://i.ibb.co/nNh2QrRp/Kernel-Puppet-Joy.webp' },
  'Kernel Puppet: Anger':            { sets: ["Heart of Evil's Purge"], buff: 'Fusion DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Anger to attack enemies, dealing 129.60% Fusion DMG.', iconUrl: 'https://i.ibb.co/TxczQftT/Kernel-Puppet-Anger.webp' },
  'Kernel Puppet: Worry':            { sets: ["Heart of Evil's Purge"], buff: 'Glacio DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Worry to attack enemies, dealing 64.80% Glacio DMG.', iconUrl: 'https://i.ibb.co/XrGXPtfJ/Kernel-Puppet-Worry.webp' },
  'Kernel Puppet: Reflection':       { sets: ["Heart of Evil's Purge"], buff: 'Electro DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Reflection to attack enemies, dealing 64.80% Electro DMG.', iconUrl: 'https://i.ibb.co/5xYH8fVC/Kernel-Puppet-Reflection.webp' },
  'Kernel Puppet: Grief':            { sets: ['Lamp of Nether Road'], buff: 'Spectro DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Grief to attack enemies, dealing 129.60% Spectro DMG.', iconUrl: 'https://i.ibb.co/RkwnCxWx/Kernel-Puppet-Grief.webp' },
  'Kernel Puppet: Fright':           { sets: ['Lamp of Nether Road'], buff: 'Havoc DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Kernel Puppet: Fright to attack enemies, dealing 51.84% Havoc DMG then 77.76% Havoc DMG.', iconUrl: 'https://i.ibb.co/BHK35m0C/Kernel-Puppet-Fright.webp' },
  'Fog Lionarch: Body':              { sets: ['Song of Feathered Trace'], buff: 'Fusion DMG', desc: 'An Elite-class beast fragment from Land of Xuanfang. Skill summons Fog Lionarch: Body to ram into enemies, dealing 192.60% Fusion DMG.', iconUrl: 'https://i.ibb.co/F4bswKCP/Fog-Lionarch-Body.webp' },
  'Fog Lionarch: Head':              { sets: ['Song of Feathered Trace'], buff: 'Fusion DMG', desc: 'An Elite-class beast fragment from Land of Xuanfang. Skill summons Fog Lionarch: Head to dart toward enemies, dealing 129.60% Fusion DMG.', iconUrl: 'https://i.ibb.co/YJfBqQX/Fog-Lionarch-Head.webp' },
  'Smolder':                         { sets: ['Song of Feathered Trace'], buff: 'Fusion DMG', desc: 'An Elite-class puppet from Land of Xuanfang. Skill summons Smolder to hurl a fireball for 192.60% Fusion DMG; if it hits the ground, it explodes for another 192.60% Fusion DMG to enemies in range.', iconUrl: 'https://i.ibb.co/QFv1pCd2/Smolder.webp' },
  'Electro Predator':                { sets: ['Molten Rift', 'Void Thunder'], buff: 'Electro DMG', desc: 'A nimble humanoid Tacet Discord with electrical projectiles. Skill summons Electro Predator to shoot 5 times: first 4 deal 17% Electro DMG, last deals 46% Electro DMG.' , imageUrl: 'https://i.ibb.co/M57X0Nsc/Electro-Predator.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/LDX6kPxT/Electro-Predator-Icon.webp' },
  'Fusion Dreadmane':                { sets: ['Molten Rift', 'Rejuvenating Glow'], buff: 'Fusion DMG', desc: 'A fiery lion-like Howler Tacet Discord. Skill summons Fusion Dreadmane to fiercely strike the enemy dealing 32% + 64 Fusion DMG.' , imageUrl: 'https://i.ibb.co/bjZS0vwn/Fusion-Dreadmane.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/pjzkqWTf/Fusion-Dreadmane-Icon.webp' },
  'Lava Larva':                      { sets: ['Molten Rift', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'A small molten creature that persistently burns. Skill summons Lava Larva to continuously attack enemies dealing 38% Fusion DMG per hit. Disappears when summoner switches out or moves too far.' , imageUrl: 'https://i.ibb.co/LzsHbZg3/Lava-Larva.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/svpSKC3g/Lava-Larva-Icon.webp' },
  'Whiff Whaff':                     { sets: ['Sierra Gale', 'Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Aero DMG', desc: 'A hovering humanoid TD that manipulates wind. Skill summons Whiff Whaff for an air explosion (51% Aero DMG) creating a Low-pressure Zone that pulls enemies in for 2s, dealing 19% Aero DMG up to 6 times.', imageUrl: 'https://i.ibb.co/TMv3DykJ/Whiff-Whaff.png', noBgProcess: true , iconUrl: 'https://i.ibb.co/DDyTMyQR/Whiff-Whaff-Icon.webp' },
  'Cruisewing':                      { sets: ['Celestial Light', 'Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Healing', desc: 'A gentle avian Tacet Discord. Skill summons Cruisewing to heal all team members for 1.8% Max HP + 80 HP, up to 4 times.' , imageUrl: 'https://i.ibb.co/8DJ1zJ6Q/Cruisewing.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/ZpcpkBmb/Cruisewing-Icon.webp' },
  'Chirpuff':                        { sets: ['Sierra Gale', 'Havoc Eclipse'], buff: 'Aero DMG', desc: 'A small puffball creature that inflates with air. Skill summons Chirpuff to blast a powerful gust forward 3 times, each dealing 38% Aero DMG and pushing enemies back.' , imageUrl: 'https://i.ibb.co/Q3hR5DgR/Chirpuff.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/wZ0sXmbd/Chirpuff-Icon.webp' },
  'Fusion Warrior':                  { sets: ['Molten Rift', 'Void Thunder', 'Sierra Gale'], buff: 'Fusion DMG', desc: 'A humanoid Tacet Discord wreathed in flames. Skill transforms into Fusion Warrior to perform a Counterattack. Successful counter reduces cooldown by 70% and deals 288% Fusion DMG.' , imageUrl: 'https://i.ibb.co/2JmY21m/Fusion-Warrior.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/tPpgKfdZ/Fusion-Warrior-Icon.webp' },
  'Havoc Warrior':                   { sets: ['Celestial Light', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A humanoid Tacet Discord wreathed in Havoc energy. Skill transforms into Havoc Warrior to perform a Counterattack. Successful counter reduces cooldown by 70% and deals 288% Havoc DMG.' , imageUrl: 'https://i.ibb.co/zTVJwGWM/Havoc-Warrior.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/Pzj1bKqw/Havoc-Warrior-Icon.webp' },

  'Snip Snap':                       { sets: ['Molten Rift', 'Rejuvenating Glow', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'An immature humanoid TD that exudes small amounts of magma. Skill summons Snip Snap to throw fireballs dealing 32% + 64 Fusion DMG on hit.' , imageUrl: 'https://i.ibb.co/M5CzNd2Z/Snip-Snap.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/LDv0brpC/Snip-Snap-Icon.webp' },
  'Zig Zag':                         { sets: ['Celestial Light', 'Moonlit Clouds', 'Lingering Tunes'], buff: 'Spectro DMG', desc: 'An immature humanoid TD that emits focused light rays with a "zig zag" sound. Skill summons Zig Zag to detonate Spectro energy dealing 48% + 96 Spectro DMG, creating a Stagnation Zone for 1.8s.' , imageUrl: 'https://i.ibb.co/twXBRbPQ/Zigzag.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/7J9hK2LX/Zig-Zag-Icon.webp' },
  'Hooscamp':                        { sets: ['Sierra Gale', 'Lingering Tunes'], buff: 'Aero DMG', desc: 'A small primate-like Tacet Discord. Skill transforms into Hooscamp Flinger and pounces at enemies dealing 48% + 96 Aero DMG.' , imageUrl: 'https://i.ibb.co/hR9SJCV9/Hooscamp.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/twFD9Dn1/Hooscamp-Icon.webp' },
  'Fusion Prism':                    { sets: ['Freezing Frost', 'Molten Rift', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'A mineral TD filled with thermal energy. Skill summons Fusion Prism to fire a crystal shard dealing 32% + 64 Fusion DMG.' , imageUrl: 'https://i.ibb.co/5xYDP9KV/Fusion-Prism.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/pjzkqWTf/Fusion-Prism-Icon.webp' },
  'Glacio Prism':                    { sets: ['Freezing Frost', 'Havoc Eclipse', 'Moonlit Clouds'], buff: 'Glacio DMG', desc: 'A mineral TD filled with freezing energy. Skill summons Glacio Prism to fire 3 crystal shards, each dealing 38% Glacio DMG.' , imageUrl: 'https://i.ibb.co/7dbkDjsZ/Glacio-Prism.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/9998gFfw/Glacio-Prism-Icon.webp' },
  'Aero Prism':                      { sets: ['Tidebreaking Courage', 'Eternal Radiance'], buff: 'Aero DMG', desc: 'A mineral TD filled with powerful air currents. Skill summons Aero Prism to attack enemies dealing 19% Aero DMG.' , imageUrl: 'https://i.ibb.co/M5DHh169/Aero-Prism.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/hRRfbzjd/Aero-Prism-Icon.webp' },
  'Havoc Prism':                     { sets: ['Void Thunder', 'Celestial Light', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A mineral TD filled with Havoc energy. Skill summons Havoc Prism to fire 5 crystal shards, each dealing 23% Havoc DMG.' , imageUrl: 'https://i.ibb.co/GvXxrfB8/Havoc-Prism.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/dwq9gCwp/Havoc-Prism-Icon.webp' },
  'Spectro Prism':                   { sets: ['Molten Rift', 'Void Thunder', 'Celestial Light'], buff: 'Spectro DMG', desc: 'A mineral TD that emits Spectro light to buff nearby allies. Skill summons Spectro Prism to emit a laser hitting up to 8 times for 14% Spectro DMG each.' , imageUrl: 'https://i.ibb.co/mFgskgrq/Spectro-Prism.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/DfBFLQ5q/Spectro-Prism-Icon.webp' },
  'Baby Viridblaze Saurian':         { sets: ['Molten Rift', 'Void Thunder', 'Lingering Tunes'], buff: 'Fusion DMG', desc: 'A small amphibian-like creature found in forests. Skill transforms into Baby Viridblaze Saurian to rest in place and slowly restore HP.' , imageUrl: 'https://i.ibb.co/bgYKXrZY/Baby-Viridblaze-Saurian.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/DHhNddtp/Baby-Viridblaze-Saurian-Icon.webp' },
  'Baby Roseshroom':                { sets: ['Sierra Gale', 'Havoc Eclipse'], buff: 'Havoc DMG', desc: 'A young fungal Tacet Discord. Skill summons Baby Roseshroom to fire a laser dealing 32% + 64 Havoc DMG.' , imageUrl: 'https://i.ibb.co/wrZwHGPY/Young-Roseshroom.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/gMCfrP73/Baby-Roseshroom-Icon.webp' },
  'Clang Bang':                      { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'An immature humanoid TD with ice crystals that make a "clang bang" sound. Skill summons Clang Bang that follows the enemy and self-combusts, dealing 32% + 64 Glacio DMG.' , imageUrl: 'https://i.ibb.co/nqNfQkTY/Clang-Bang.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/cc3hxYDw/Clang-Bang-Icon.webp' },
  'Dwarf Cassowary':                 { sets: ['Sierra Gale', 'Rejuvenating Glow'], buff: 'Physical DMG', desc: 'A small flightless bird-like Tacet Discord. Skill summons Dwarf Cassowary to track and attack the enemy dealing 38% Physical DMG x3.' , imageUrl: 'https://i.ibb.co/zWw2yrNK/Dwarf-Cassowary.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/nqkB7N5H/Dwarf-Cassowary-Icon.webp' },
  'Excarat':                         { sets: ['Freezing Frost', 'Havoc Eclipse'], buff: 'Physical DMG', desc: 'A burrowing rodent-like Tacet Discord. Skill transforms into Excarat and tunnels underground to advance, immune to damage while burrowed. Can change direction freely.' , imageUrl: 'https://i.ibb.co/GQmwQXBz/Excarat.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/7JCWR4LZ/Excarat-Icon.webp' },
  'Lottie Lost':                     { sets: ['Tidebreaking Courage', 'Frosty Resolve'], buff: 'Spectro DMG', desc: 'A small whimsical Tacet Discord that wanders aimlessly. Skill summons Lottie Lost to attack enemies, dealing 129.6% Spectro DMG.' , imageUrl: 'https://i.ibb.co/cSTS6Mqq/Lottie-Lost.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/C3SrXNVJ/Lottie-Lost-Icon.webp' },
  'Chest Mimic':                     { sets: ['Empyrean Anthem', 'Frosty Resolve', 'Midnight Veil'], buff: 'Spectro DMG', desc: 'A deceptive Tacet Discord disguised as a treasure chest. Skill summons Chest Mimic to attack with 3 consecutive strikes, each dealing 64.19% Spectro DMG.' , imageUrl: 'https://i.ibb.co/6RnrK82j/Chest-Mimic.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/8DgC4tmx/Chest-Mimic-Icon.webp' },
  'Aero Predator':                   { sets: ['Void Thunder', 'Sierra Gale'], buff: 'Aero DMG', desc: 'A nimble humanoid Tacet Discord that fires air projectiles. Skill summons Aero Predator to throw a dart that bounces between enemies up to 3 times, dealing 28.8% Aero DMG each hit.' , imageUrl: 'https://i.ibb.co/k2qMgVKq/Aero-Predator.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/7tyC2t4T/Aero-Predator-Icon.webp' },
  'Glacio Predator':                 { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'A nimble humanoid Tacet Discord that fires ice projectiles. Skill summons Glacio Predator to throw an ice spear dealing 46.08% Glacio DMG on hit, plus 4.61% Glacio DMG up to 10 times during the charge and 23.04% Glacio DMG when the spear explodes.' , imageUrl: 'https://i.ibb.co/jZ5pXHvK/Glacio-Predator.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/nqxnCjR3/Glacio-Predator-Icon.webp' },
  'Gulpuff':                         { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Glacio DMG', desc: 'A bubble-blowing Tacet Discord. Skill summons Gulpuff to blow bubbles 5 times, each dealing 23.04% Glacio DMG.' , imageUrl: 'https://i.ibb.co/TDX9tTPt/Gulpuff.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/zhxwmLGT/Gulpuff-Icon.webp' },
  'Aero Drake':                      { sets: ['Tidebreaking Courage', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Aero DMG', desc: 'A wind-elemental drake. Skill summons Aero Drake to attack enemies, dealing 129.6% Aero DMG.' , imageUrl: 'https://i.ibb.co/1YfjCKtz/Aero-Drake.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/4RFLGcTZ/Aero-Drake-Icon.webp' },
  'Electro Drake':                   { sets: ['Midnight Veil', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Electro DMG', desc: 'A lightning-elemental drake. Skill summons Electro Drake to attack enemies, dealing 43.2% Electro DMG 3 times.' , imageUrl: 'https://i.ibb.co/tfKbcQW/Electro-Drake.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/Xx06HgcD/Electro-Drake-Icon.webp' },
  'Fusion Drake':                    { sets: ['Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Fusion DMG', desc: 'A fire-elemental drake. Skill summons Fusion Drake to attack enemies, dealing 25.92% Fusion DMG 3 times.' , imageUrl: 'https://i.ibb.co/WvbT01pq/Fusion-Drake.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/jP5ctBKj/Fusion-Drake-Icon.webp' },
  'Glacio Drake':                    { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Glacio DMG', desc: 'An ice-elemental drake. Skill summons Glacio Drake to attack enemies, dealing 25.92% Glacio DMG 5 times.' , imageUrl: 'https://i.ibb.co/DH0Xc9ds/Glacio-Drake.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/jvDRpdWG/Glacio-Drake-Icon.webp' },
  'Havoc Drake':                     { sets: ['Windward Pilgrimage', 'Flaming Clawprint', 'Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A havoc-elemental drake. Skill summons Havoc Drake to attack enemies, dealing 129.6% Havoc DMG 3 times.' , imageUrl: 'https://i.ibb.co/cS7gy29z/Havoc-Drake.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/PGM9yxdS/Havoc-Drake-Icon.webp' },
  'Spectro Drake':                   { sets: ['Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Spectro DMG', desc: 'A spectro-elemental drake. Skill summons Spectro Drake to attack enemies, dealing 43.2% Spectro DMG 3 times.' , imageUrl: 'https://i.ibb.co/Cp8qVJBw/Spectro-Drake.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/sr68RKk/Spectro-Drake-Icon.webp' },
  'Devotee\'s Flesh':                { sets: ['Gusts of Welkin', 'Windward Pilgrimage', 'Flaming Clawprint'], buff: 'Aero DMG', desc: 'A devout creature born of fanatical devotion. Skill summons Devotee\'s Flesh to attack enemies, dealing 43.2% Aero DMG 3 times.', imageUrl: 'https://i.ibb.co/xtnFQwD2/Devotee-s-Flesh.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/DHRkbQg2/Devotees-Flesh.webp' },
  'Sacerdos':                        { sets: ['Gusts of Welkin', 'Windward Pilgrimage'], buff: 'Aero DMG', desc: 'A priestly creature that chants wind hymns. Skill summons Sacerdos to attack enemies, dealing 64.8% Aero DMG 2 times.' , imageUrl: 'https://i.ibb.co/xKZsHqWy/Sacerdos.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/DfyWdfrm/Sacerdos-Icon.webp' },
  'Sagittario':                      { sets: ['Eternal Radiance', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Spectro DMG', desc: 'An archer-like creature that fires arrows of light. Skill transforms into Sagittario to move and fire a ranged attack for 268.2% Spectro DMG. Getting attacked while moving triggers a Dodge Counter, dealing 268.2% Spectro DMG once and 53.64% Spectro DMG 5 times.' , imageUrl: 'https://i.ibb.co/k6394kjK/Sagittario.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/mrzscNny/Sagittario-Icon.webp' },
  'La Guardia':                      { sets: ['Midnight Veil', 'Gusts of Welkin', 'Flaming Clawprint'], buff: 'Physical DMG', desc: 'A vigilant guard creature wielding a stone shield. Skill transforms into La Guardia to attack nearby targets for 268.2% Physical DMG. Hold to maintain the Echo form: a slash deals another 268.2% Physical DMG, and a ranged attack deals up to 15 hits of 17.87% Physical DMG.' , imageUrl: 'https://i.ibb.co/S4RZBG3x/La-Guardia.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/j9wYBLjD/La-Guardia-Icon.webp' },
  'Calcified Junrock':               { sets: ['Empyrean Anthem', 'Tidebreaking Courage', 'Crown of Valor'], buff: 'Healing', desc: 'A calcified junrock variant hardened by mineral deposits. Skill summons Calcified Junrock, restoring HP for nearby team members equal to 2.52% of their Max HP, up to 5 times.' , imageUrl: 'https://i.ibb.co/jk4DB35N/Calcified-Junrock.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/HkprCbb/Calcified-Junrock-Icon.webp' },
  'Fission Junrock':                 { sets: ['Void Thunder', 'Rejuvenating Glow', 'Moonlit Clouds'], buff: 'Healing', desc: "A fission-powered junrock that radiates warm energy. Skill summons Fission Junrock, generating a Resonance Effect that restores 2% Max HP for friendly units each time. Outside of combat, it can also pick up nearby minerals or plants." , imageUrl: 'https://i.ibb.co/QjD2Dcgs/Fission-Junrock.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/yBhnf1nj/Fission-Junrock-Icon.webp' },
  'Golden Junrock':                  { sets: ['Frosty Resolve', 'Eternal Radiance', 'Law of Harmony'], buff: 'Spectro DMG', desc: 'A golden junrock variant gleaming with spectral light. Skill summons Golden Junrock to charge forward, dealing 129.6% Spectro DMG to enemies in its path.' , imageUrl: 'https://i.ibb.co/N6mw8bb1/Golden-Junrock.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/R4Mtj1t6/Golden-Junrock-Icon.webp' },
  'Vanguard Junrock':                { sets: ['Void Thunder', 'Rejuvenating Glow', 'Lingering Tunes'], buff: 'Physical DMG', desc: 'A vanguard junrock variant armored with rocky plates. Skill summons Vanguard Junrock to charge forward, dealing Physical DMG to enemies in its path.' , imageUrl: 'https://i.ibb.co/2J94GwJ/Vanguard-Junrock.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/zVGNLzdt/Vanguard-Junrock-Icon.webp' },
  'Diamondclaw':                     { sets: ['Moonlit Clouds', 'Lingering Tunes'], buff: 'Physical DMG', desc: 'A diamond-clawed creature with razor-sharp crystalline talons. Skill transforms into Crystal Scorpion and enters a Parry State; counterattack when the Parry State ends, dealing Physical DMG.' , imageUrl: 'https://i.ibb.co/tTRpPm5m/Diamondclaw.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/FbjnCjz4/Diamondclaw-Icon.webp' },
  'Diggy Duggy':                     { sets: ['Eternal Radiance', 'Tidebreaking Courage'], buff: 'Physical DMG', desc: 'A burrowing creature that attacks from underground. Skill transforms into Diggy Duggy and jumps into the air to smash onto enemies, dealing 268.2% Physical DMG.' , imageUrl: 'https://i.ibb.co/9HRrnmvf/Diggy-Duggy.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/DPQc8hqb/Diggy-Duggy-Icon.webp' },
  'Fae Ignis':                       { sets: ['Eternal Radiance', 'Midnight Veil', 'Dream of the Lost'], buff: 'Havoc DMG', desc: 'A fairy flame creature flickering with dark fire. Skill summons Fae Ignis to attack enemies, dealing 129.6% Havoc DMG.' , imageUrl: 'https://i.ibb.co/zWRyGSZm/Fae-ignis.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/ZzcvGGGx/Fae-Ignis-Icon.webp' },
  'Frostscourge Stalker':            { sets: ['Eternal Radiance', 'Midnight Veil'], buff: 'Glacio DMG', desc: 'A frost-infused stalker that hunts in frozen terrain. Skill summons Frostscourge Stalker to attack enemies, dealing 129.6% Glacio DMG.' , imageUrl: 'https://i.ibb.co/fdqK7Myt/Frostscourge-Stalker.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/KcsfTX4n/Frostscourge-Stalker-Icon.webp' },
  'Voltscourge Stalker':             { sets: ['Midnight Veil', 'Empyrean Anthem'], buff: 'Electro DMG', desc: 'A voltage-infused stalker crackling with static. Skill summons Voltscourge Stalker to perform 3 stages of attacks on enemies, each dealing 43.2% Electro DMG.' , imageUrl: 'https://i.ibb.co/pBFBn0fC/Voltscourge-Stalker.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/V0XSnvpX/Voltscourge-Stalker-Icon.webp' },
  'Galescourge Stalker':             { sets: ['Frosty Resolve', 'Empyrean Anthem'], buff: 'Healing', desc: 'A gale-infused stalker that moves with the wind. Skill summons Galescourge Stalker, restoring HP for nearby party members equal to 2.7% of their Max HP, up to 3 times.' , imageUrl: 'https://i.ibb.co/8LYKBmgY/Galescourge-Stalker.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/DP2Y15R7/Galescourge-Stalker-Icon.webp' },
  'Hocus Pocus':                     { sets: ['Frosty Resolve', 'Empyrean Anthem'], buff: 'Havoc DMG', desc: 'A magical trickster creature wreathed in dark illusions. Skill summons Hocus Pocus to attack enemies with 3 consecutive strikes, each dealing 43.2% Havoc DMG.' , imageUrl: 'https://i.ibb.co/v4SQcJGL/Hocus-Pocus.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/6cN2yBFt/Hocus-Pocus-Icon.webp' },
  'Nimbus Wraith':                   { sets: ['Midnight Veil', 'Empyrean Anthem', "Flamewing's Shadow"], buff: 'Healing', desc: 'A cloud-like wraith that drifts through mist. Skill summons Nimbus Wraith, restoring HP for the active Resonator equal to 2.7% of their Max HP, up to 4 times.' , imageUrl: 'https://i.ibb.co/xStdtLv1/Nimbus-Wraith.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/DHGcPZhB/Nimbus-Wraith-Icon.webp' },
  'Hoartoise':                       { sets: ['Freezing Frost', 'Celestial Light'], buff: 'Healing', desc: 'A hoary tortoise creature with a frost-covered shell. Skill transforms into Hoartoise and slowly restores HP. Use the Echo Skill again to exit the transformation.' , imageUrl: 'https://i.ibb.co/B5j9Znwc/Hoartoise.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/N29nQrMF/Hoartoise-Icon.webp' },
  'Sabyr Boar':                      { sets: ['Freezing Frost', 'Sierra Gale', 'Moonlit Clouds'], buff: 'Physical DMG', desc: 'A tusked boar creature that charges with reckless force. Skill summons Sabyr Boar to headbutt the enemy into the air, dealing Physical DMG.' , imageUrl: 'https://i.ibb.co/SDmW9Jwy/Sabyr-Boar.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/DHG4d72n/Sabyr-Boar-Icon.webp' },
  'Traffic Illuminator':             { sets: ['Molten Rift', 'Void Thunder', 'Sierra Gale'], buff: 'Utility', desc: 'A traffic-light-like construct that flashes warning signals. Skill summons Traffic Illuminator, immobilizing enemies for up to 1s; the immobilization lifts once the enemy is hit. Deals no direct DMG.' , imageUrl: 'https://i.ibb.co/Z60JGz9q/Traffic-Illuminator.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/RpPVKgcJ/Traffic-Illuminator-Icon.webp' },
  'Tick Tack':                       { sets: ['Havoc Eclipse', 'Rejuvenating Glow', 'Lingering Tunes'], buff: 'Havoc DMG', desc: 'A clock-like creature whose hands spin erratically. Skill summons Tick Tack to charge and bite the enemy, dealing 68.48% Havoc DMG on the charge and 102.72% Havoc DMG on the bite, reducing enemy Vibration Strength by up to 5% for 5s.' , imageUrl: 'https://i.ibb.co/zTw28r3t/Tick-Tack.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/jKXRM4g/Tick-Tack-Icon.webp' },
  'Chop Chop: Headless':             { sets: ['Eternal Radiance', 'Tidebreaking Courage'], buff: 'Fusion DMG', desc: 'The headless body of Chop Chop, swinging blindly. Skill summons Chop Chop: Headless to attack enemies, dealing 129.6% Fusion DMG.' , imageUrl: 'https://i.ibb.co/KC74nDj/Chop-Chop-Headless.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/RpGDpLHH/Chop-Chop-Headless-Icon.webp' },
  'Chop Chop: Leftless':             { sets: ['Frosty Resolve', 'Tidebreaking Courage'], buff: 'Spectro DMG', desc: 'Chop Chop missing its left arm, compensating with spectral energy. Skill summons Chop Chop: Leftless to attack enemies, dealing 129.6% Spectro DMG.' , imageUrl: 'https://i.ibb.co/7JDFGhXw/Chop-Chop-Leftless.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/spG4w7rH/Chop-Chop-Leftless-Icon.webp' },
  'Chop Chop: Rightless':            { sets: ['Frosty Resolve', 'Tidebreaking Courage'], buff: 'Havoc DMG', desc: 'Chop Chop missing its right arm, leaking havoc energy. Skill summons Chop Chop: Rightless to attack enemies, dealing 129.6% Havoc DMG.' , imageUrl: 'https://i.ibb.co/Q7kSy8xG/Chop-Chop-Rightless.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/VYQ3QPP2/Chop-Chop-Rightless-Icon.webp' },
  'Geospider S4':                    { sets: ['Pact of Neonlight Leap', 'Halo of Starry Radiance', 'Trailblazing Star'], buff: 'Spectro DMG', desc: 'A mechanical spider from Lahai-Roi. Skill summons Geospider S4 to attack enemies, dealing 51.84% Spectro DMG once and 77.76% Spectro DMG once.' , imageUrl: 'https://i.ibb.co/fYySnfX0/Geospider-S4.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/P7x6wBm/Geospider-S4-Icon.webp' },
  'Flora Drone':                     { sets: ['Pact of Neonlight Leap', 'Rite of Gilded Revelation', 'Sound of True Name', 'Reel of Spliced Memories'], buff: 'Aero DMG', desc: 'A botanical drone from Lahai-Roi. Skill summons Flora Drone, dealing 64.8% Aero DMG to enemies and healing Resonators in range for 3.6% Max HP + 160.' , imageUrl: 'https://i.ibb.co/jYgz8DL/Flora-Drone.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/yccgwMG1/Flora-Drone-Icon.webp' },
  'Mining Drone':                    { sets: ['Halo of Starry Radiance', 'Rite of Gilded Revelation', 'Sound of True Name'], buff: 'Havoc DMG', desc: 'A mining drone from Lahai-Roi. Skill transforms into Mining Drone to attack enemies, dealing 102.6% Havoc DMG twice.' , imageUrl: 'https://i.ibb.co/4gTgCXhF/Mining-Drone.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/q3m55xgj/Mining-Drone-Icon.webp' },
  'Zip Zap':                         { sets: ['Pact of Neonlight Leap', 'Rite of Gilded Revelation', 'Chromatic Foam'], buff: 'Electro DMG', desc: 'An electrical creature from Lahai-Roi. Skill summons Zip Zap to launch spinning attacks at enemies, dealing 25.92% Electro DMG 5 times.' , imageUrl: 'https://i.ibb.co/B7kNdn3/Zip-Zap.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/CK2xw8bY/Zip-Zap-Icon.webp' },
  'Iceglint Dancer':                 { sets: ['Trailblazing Star', 'Wishes of Quiet Snowfall', 'Reel of Spliced Memories'], buff: 'Glacio DMG', desc: 'A crystalline dancer that spins on blades of ice. Skill transforms into Iceglint Dancer to attack enemies, dealing 205.2% Glacio DMG.' , imageUrl: 'https://i.ibb.co/hFzTdNWs/Iceglint-Dancer.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/ycSKpxh4/Iceglint-Dancer-Icon.webp' },
  'Shadow Stepper':                  { sets: ['Trailblazing Star', 'Chromatic Foam', 'Wishes of Quiet Snowfall'], buff: 'Havoc DMG', desc: 'A shadow-walking creature that phases through darkness. Skill summons Shadow Stepper to attack enemies, dealing 129.6% Havoc DMG.' , imageUrl: 'https://i.ibb.co/Pvxw2HHY/Shadow-Stepper.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/w96PCdB/Shadow-Stepper-Icon.webp' },
  'Tremor Warrior':                  { sets: ['Halo of Starry Radiance', 'Chromatic Foam', 'Wishes of Quiet Snowfall'], buff: 'Electro DMG', desc: 'A tremor-inducing warrior that channels seismic electricity. Skill transforms into Tremor Warrior to attack enemies in front, dealing 205.2% Electro DMG.' , imageUrl: 'https://i.ibb.co/fGnyrJ7Z/Tremor-Warrior.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/Xfx21DrZ/Tremor-Warrior-Icon.webp' },
  'Nightmare: Aero Predator':        { sets: ['Crown of Valor'], buff: 'Aero DMG', desc: 'A nightmare variant of the Aero Predator with enhanced wind projectiles. Skill summons it to throw a dart that bounces between enemies up to 3 times, dealing 28.8% Aero DMG each hit.' , imageUrl: 'https://i.ibb.co/DHJH53q6/Nightmare-Aero-Predator.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/0p2B1nyW/Nightmare-Aero-Predator-Icon.webp' },
  'Nightmare: Electro Predator':     { sets: ['Crown of Valor'], buff: 'Electro DMG', desc: 'A nightmare variant of the Electro Predator with overcharged bolts. Skill summons it to shoot the enemy 5 times: the first 4 shots deal 17.28% Electro DMG, and the last deals 46.08% Electro DMG.' , imageUrl: 'https://i.ibb.co/6R6r0GDQ/Nightmare-Electro-Predator.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/LDX6kPxT/Nightmare-Electro-Predator-Icon.webp' },
  'Nightmare: Glacio Predator':      { sets: ['Dream of the Lost'], buff: 'Glacio DMG', desc: 'A nightmare variant of the Glacio Predator with piercing ice shards. Skill summons it to throw an ice spear dealing 46.08% Glacio DMG on hit, plus 4.61% Glacio DMG up to 10 times during the charge and 23.04% Glacio DMG when the spear explodes.' , imageUrl: 'https://i.ibb.co/8ngqSSxL/Nightmare-Glacio-Predator.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/nqxnCjR3/Nightmare-Glacio-Predator-Icon.webp' },
  'Nightmare: Baby Roseshroom':      { sets: ["Flamewing's Shadow"], buff: 'Havoc DMG', desc: 'A nightmare variant of the Baby Roseshroom with amplified spores. Skill summons it to fire a laser, dealing Havoc DMG.' , imageUrl: 'https://i.ibb.co/svLQG3mb/Nightmare-Baby-Roseshroom.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/23k9BbyC/Nightmare-Baby-Roseshroom-Icon.webp' },
  'Nightmare: Baby Viridblaze Saurian': { sets: ["Flamewing's Shadow"], buff: 'Healing', desc: 'A nightmare variant of the Baby Viridblaze Saurian wreathed in dark flame. Skill transforms into the saurian to rest in place and slowly restore HP.' , imageUrl: 'https://i.ibb.co/JwzmkJJs/Nightmare-Baby-Viridblaze-Saurian.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/dwcMGxzb/Nightmare-Baby-Viridblaze-Saurian-Icon.webp' },
  'Nightmare: Chirpuff':             { sets: ['Law of Harmony'], buff: 'Aero DMG', desc: 'A nightmare variant of Chirpuff overinflated with nightmare wind. Skill summons it to self-inflate and blast a gust of wind forward 3 times, each blast dealing 38.4% Aero DMG and pushing enemies back.' , imageUrl: 'https://i.ibb.co/bgjSz4hN/Nightmare-Chirpuff.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/ZzyktnkP/Nightmare-Chirpuff-Icon.webp' },
  'Nightmare: Dwarf Cassowary':      { sets: ['Thread of Severed Fate'], buff: 'Physical DMG', desc: 'A nightmare variant of the Dwarf Cassowary with razor-edged feathers. Skill summons it to track and attack the enemy, dealing 38.4% Physical DMG 3 times.' , imageUrl: 'https://i.ibb.co/VWhV8chg/Nightmare-Dwarf-Cassowary.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/n85hWpT6/Nightmare-Dwarf-Cassowary-Icon.webp' },
  'Nightmare: Gulpuff':              { sets: ['Law of Harmony'], buff: 'Glacio DMG', desc: 'A nightmare variant of Gulpuff exhaling freezing mist. Skill summons it to blow bubbles 5 times, each dealing 23.04% Glacio DMG.' , imageUrl: 'https://i.ibb.co/ksZkkZHf/Nightmare-Gulpuff.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/2H3QWGB/Nightmare-Gulpuff-Icon.webp' },
  'Nightmare: Havoc Warrior':        { sets: ['Dream of the Lost'], buff: 'Havoc DMG', desc: 'A nightmare variant of the Havoc Warrior radiating dark energy. Skill transforms into Nightmare: Havoc Warrior to attack up to 3 times, dealing 171.73% Havoc DMG each time.' , imageUrl: 'https://i.ibb.co/pBBX7ZXS/Nightmare-Havoc-Warrior.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/WvdsKkCT/Nightmare-Havoc-Warrior-Icon.webp' },
  'Nightmare: Tick Tack':            { sets: ['Thread of Severed Fate'], buff: 'Havoc DMG', desc: 'A nightmare variant of Tick Tack whose ticking distorts time. Skill summons it to charge and bite the enemy, dealing 68.48% Havoc DMG on the charge and 102.72% Havoc DMG on the bite, reducing enemy Vibration Strength by up to 5% for 5s.' , imageUrl: 'https://i.ibb.co/yc0hSd53/Nightmare-Tick-Tack.png', noBgProcess: true, iconUrl: 'https://i.ibb.co/Y4FwmGSW/Nightmare-Tick-Tack-Icon.webp' },
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
// enemyRes: elemental resistances when this echo is fought as an enemy boss (4-cost only)
[
  // ── 4-Cost Echoes (Bosses) ──
  // added 2026-08-18 (echo audit, task #6): these 5 v3.5 4-cost echoes had full ECHO_DATA entries
  // (desc, sets, buff) but were never merged with a dmg/element tuple, so equipping any of them in the
  // main echo slot silently contributed 0 active-skill DMG in DamageCalculator's echoActiveDmg calc.
  // Myriad Snare: Rustfire Chassis is Max-HP%-scaled, not ATK%-scaled, so its dmg is left unset (same
  // precedent as other %MaxHP echoes elsewhere in this file).
  ['Thousand-Puppet Pavilion', 109, 'Havoc', null],
  ['Reminiscence: Denia', 274, 'Fusion', null],
  ['Reminiscence: Threnodian - Voidborne Construct', 274, 'Glacio', null],
  ['Reminiscence - Nightmare: Adam Smasher', 164, 'Physical', null],
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
  ['Forbidden Bastion', 238, 'Glacio', null],
  ['Fog Lionarch', 238, 'Fusion', null],
  ['Voidwing Moth', 405, 'Spectro', null],
  ['Capitaneus', 356, 'Spectro', null],
  // ── 3-Cost Echoes (Elites) ──
  ['Havoc Dreadmane', 389, 'Havoc', null],
  ['Lumiscale Construct', 554, 'Glacio', null],
  ['Tambourinist', 0, 'Havoc', null],
  ['Spearback', 171, 'Physical', null],
  ['Carapace', 280, 'Aero', null],
  ['Roseshroom', 171, 'Havoc', null],
  ['Violet-Feathered Heron', 288, 'Electro', null],
  ['Cyan-Feathered Heron', 237, 'Aero', null],
  ['Flautist', 533, 'Electro', null],
  ['Hoochief', 268, 'Aero', null],
  ['Stonewall Bracer', 282, 'Physical', null],
  ['Autopuppet Scout', 272, 'Glacio', null],
  ['Viridblaze Saurian', 171, 'Fusion', null],
  ['Glacio Dreadmane', 406, 'Glacio', null],
  ['Chasm Guardian', 274, 'Havoc', null],
  ['Abyssal Mercator', 268, 'Glacio', null],
  ['Twin Nova - Collapsar Blade', 0, 'Electro', null],
  ['Sabercat Prowler', 193, 'Havoc', null],
  ['Sabercat Reaver', 193, 'Fusion', null],
  ['Spacetrek Explorer', 0, 'Shield', null],
  ['Flora Reindeer', 193, 'Aero', null],
  ['Windlash Coleoid', 268, 'Aero', null],
  ['Frostbite Coleoid', 193, 'Glacio', null],
  ['Glommoth', 274, 'Glacio', null],
  ['Ironhoof', 268, 'Fusion', null],
  ['Mining Reindeer', 238, 'Electro', null],
  ['Reminiscence - Kronaclaw', 268, 'Aero', null],
  ['Kronablight', 268, 'Electro', null],
  ["Pilgrim's Shell", 268, 'Aero', null],
  ['Kerasaur', 536, 'Aero', null],
  ['Hurriclaw', 313, 'Aero', null],
  ['Nightmare: Viridblaze Saurian', 171, 'Fusion', null],
  ['Nightmare: Violet-Feathered Heron', 288, 'Electro', null],
  ['Nightmare: Cyan-Feathered Heron', 237, 'Aero', null],
  ['Nightmare: Roseshroom', 171, 'Havoc', null],
  ['Nightmare: Tambourinist', 0, 'Havoc', null],
  ['Diurnus Knight', 268, 'Spectro', null],
  ['Nocturnus Knight', 268, 'Havoc', null],
  ['Questless Knight', 313, 'Electro', null],
  ['Abyssal Gladius', 268, 'Glacio', null],
  ['Abyssal Patricius', 268, 'Glacio', null],
  ['Rage Against the Statue', 313, 'Spectro', null],
  ['Vitreum Dancer', 313, 'Electro', null],
  ['Cuddle Wuddle', 313, 'Physical', null],
  ['Chop Chop', 193, 'Fusion', null],
  ['Lightcrusher', 226, 'Spectro', null],
  ['Rocksteady Guardian', 0, 'Spectro', null],
  // ── 1-Cost Echoes ──
  ['Smiter', 193, 'Spectro', null],
  ['Porcelain Picket', 130, 'Aero', null],
  ['Stone Picket', 130, 'Aero', null],
  ['Aureate Picket', 154, 'Aero', null],
  ['Kernel Puppet: Joy', 130, 'Physical', null],
  ['Kernel Puppet: Anger', 130, 'Fusion', null],
  ['Kernel Puppet: Worry', 65, 'Glacio', null],
  ['Kernel Puppet: Reflection', 65, 'Electro', null],
  ['Kernel Puppet: Grief', 130, 'Spectro', null],
  ['Kernel Puppet: Fright', 130, 'Havoc', null],
  ['Fog Lionarch: Body', 193, 'Fusion', null],
  ['Fog Lionarch: Head', 130, 'Fusion', null],
  ['Smolder', 193, 'Fusion', null],
  ['Electro Predator', 115, 'Electro', null],
  ['Fusion Dreadmane', 0, 'Fusion', null],
  ['Lava Larva', 0, 'Fusion', null],
  ['Whiff Whaff', 171, 'Aero', null],
  ['Cruisewing', 0, 'Healing', null],
  ['Chirpuff', 115, 'Aero', null],
  ['Fusion Warrior', 288, 'Fusion', null],
  ['Havoc Warrior', 288, 'Havoc', null],
  ['Snip Snap', 0, 'Fusion', null],
  ['Zig Zag', 0, 'Spectro', null],
  ['Hooscamp', 0, 'Aero', null],
  ['Fusion Prism', 0, 'Fusion', null],
  ['Glacio Prism', 115, 'Glacio', null],
  ['Aero Prism', 19, 'Aero', null],
  ['Havoc Prism', 115, 'Havoc', null],
  ['Spectro Prism', 115, 'Spectro', null],
  ['Baby Viridblaze Saurian', 0, 'Healing', null],
  ['Baby Roseshroom', 0, 'Havoc', null],
  ['Clang Bang', 0, 'Glacio', null],
  ['Dwarf Cassowary', 115, 'Physical', null],
  ['Excarat', 0, 'Physical', null],
  ['Lottie Lost', 130, 'Spectro', null],
  ['Chest Mimic', 193, 'Spectro', null],
  ['Aero Predator', 86, 'Aero', null],
  ['Glacio Predator', 115, 'Glacio', null],
  ['Gulpuff', 115, 'Glacio', null],
  ['Aero Drake', 130, 'Aero', null],
  ['Electro Drake', 130, 'Electro', null],
  ['Fusion Drake', 78, 'Fusion', null],
  ['Glacio Drake', 130, 'Glacio', null],
  ['Havoc Drake', 389, 'Havoc', null],
  ['Spectro Drake', 130, 'Spectro', null],
  ["Devotee's Flesh", 130, 'Aero', null],
  ['Sacerdos', 130, 'Aero', null],
  ['Sagittario', 268, 'Spectro', null],
  ['La Guardia', 804, 'Physical', null],
  ['Calcified Junrock', 0, 'Healing', null],
  ['Fission Junrock', 0, 'Healing', null],
  ['Golden Junrock', 130, 'Spectro', null],
  ['Vanguard Junrock', 0, 'Physical', null],
  ['Diamondclaw', 0, 'Physical', null],
  ['Diggy Duggy', 268, 'Physical', null],
  ['Fae Ignis', 130, 'Havoc', null],
  ['Frostscourge Stalker', 130, 'Glacio', null],
  ['Voltscourge Stalker', 130, 'Electro', null],
  ['Galescourge Stalker', 0, 'Healing', null],
  ['Hocus Pocus', 130, 'Havoc', null],
  ['Nimbus Wraith', 0, 'Healing', null],
  ['Hoartoise', 0, 'Healing', null],
  ['Sabyr Boar', 0, 'Physical', null],
  ['Traffic Illuminator', 0, 'Utility', null],
  ['Tick Tack', 171, 'Havoc', null],
  ['Chop Chop: Headless', 130, 'Fusion', null],
  ['Chop Chop: Leftless', 130, 'Spectro', null],
  ['Chop Chop: Rightless', 130, 'Havoc', null],
  ['Geospider S4', 130, 'Spectro', null],
  ['Flora Drone', 65, 'Healing', null],
  ['Mining Drone', 205, 'Havoc', null],
  ['Zip Zap', 130, 'Electro', null],
  ['Iceglint Dancer', 205, 'Glacio', null],
  ['Shadow Stepper', 130, 'Havoc', null],
  ['Tremor Warrior', 205, 'Electro', null],
  ['Nightmare: Aero Predator', 86, 'Aero', null],
  ['Nightmare: Electro Predator', 115, 'Electro', null],
  ['Nightmare: Glacio Predator', 115, 'Glacio', null],
  ['Nightmare: Baby Roseshroom', 0, 'Havoc', null],
  ['Nightmare: Baby Viridblaze Saurian', 0, 'Healing', null],
  ['Nightmare: Chirpuff', 115, 'Aero', null],
  ['Nightmare: Dwarf Cassowary', 115, 'Physical', null],
  ['Nightmare: Gulpuff', 115, 'Glacio', null],
  ['Nightmare: Havoc Warrior', 515, 'Havoc', null],
  ['Nightmare: Tick Tack', 171, 'Havoc', null],
].forEach(([name, dmg, element, enemyRes]) => {
  // enemyStats: full boss stat card shape for MonsterCard/EnemySelector/EchoDetail. hp/atk/def default
  // to level 90 via getEnemyStatsAtLevel (nanoka.cc, full 1-120 curve); any boss genuinely not tracked
  // there is left null (never fabricated), same graceful-degradation behavior as before. Callers that
  // want a different level should call getEnemyStatsAtLevel(name, level) directly rather than reading
  // this fixed level-90 snapshot.
  const lv90 = getEnemyStatsAtLevel(name, 90);
  const stagger90 = getEnemyStaggerStatsAtLevel(name, 90);
  // These 39 boss echoes' own audited RES (enemyRes) only ever records their one boosted element —
  // every other element (Physical included) is a flat 10% RES baseline confirmed across every raw
  // nanoka.cc monster JSON sampled for this class of enemy (Overlord/Calamity). Fill the full 7-way
  // table from that baseline rather than leaving unlisted elements undisplayed at an implicit 0%.
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

// [SECTION:WEAPON_DATA]

export { ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ECHO_DATA, ECHO_SKILL_BUFFS, ALL_ECHO_SONATA_SETS, ALL_ECHO_BUFF_TYPES };
