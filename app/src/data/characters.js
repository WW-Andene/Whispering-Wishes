// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/characters.js
// Character data, combat tags, base stats, rotation data, tier data, region data,
// birthday data, buff/debuff tables, skill multipliers, resonance chains,
// and character list arrays.
// ═══════════════════════════════════════════════════════════════════════════════

const CHARACTER_DATA = {
  // 5★ Resonators
  // NOTE: Rover is modeled as four separate roster entries — one per attunement — matching the source's
  // own character-page split (Rover: Spectro/Havoc/Aero/Electro are each a distinct page/kit there) and the
  // depth every other character gets: each has its own full combat profile, buffs/debuffs, base stats,
  // resonance chain, skill multipliers, weapons (signature + rarity alternatives), echoes, and teams.
  // In-game, Rover is a single ownable resonator that freely re-specs its attunement (no separate copies are
  // pulled per element), so collection/wish-count ownership is mirrored across all four keys in App.jsx's
  // collectionData builder — owning "Rover" owns every attunement card here. Ascension materials, skill
  // materials, and weapon type (Sword) are identical across all four since it's the same resonator.
  // Source: the source character pages 1502 (Spectro), 1604 (Havoc), 1406 (Aero), 1309 (Electro), v3.6,
  // 2026-08-16. Tier source: the source tier list, last updated 01/Aug/2026.
  // Fixed 2026-09-03 against a real browser snapshot (confirmed genuine via its own
  // Snapshot-Content-Location header). SKILL_MULTIPLIERS/RESONANCE_CHAIN_DATA/CHARACTER_ROTATIONS/base
  // stats all already matched exactly. 3 real bugs found and fixed: bestEchoes named 'Mourning Aix'
  // (Celestial Light set — a different echo than intended) + 'Eternal Radiance 5pc' (only a situational
  // "Special Echo Set" in the source, not its top-listed Best Echo Set) — the source's actual #1 Best
  // Echo Set, also the exact set used in its own damage-profile calc, is Moonlit Clouds with main echo
  // Impermanence Heron. weaponAlts.alt5 named 'Laser Shearer' and "Bloodpact's Pledge" — neither
  // appears anywhere in this source (they're Rover: Electro's and Rover: Aero's own signature/alt
  // weapons respectively); the source's only other 5★ alternative to bestWeapon is Blazing Brilliance
  // (Changli's signature, explicitly usable by Resonance-Skill-focused Sword users).
  'Rover: Spectro': { rarity: 5, element: 'Spectro', weapon: 'Sword', role: 'Sub DPS',
    desc: "A wanderer who awoke with no memory on the shores of Solaris. Spectro attunement: a quick-swap Frazzle debuffer — Forte Circuit's Resonating Spin applies Spectro Frazzle (with Shimmer to stop decay) and Liberation Echoing Orchestra piles on more, then swaps out for the main DPS.",
    skills: ['Vibration Manifestation', 'Resonating Slashes', 'World in a Grain of Sand', 'Echoing Orchestra'],
    ascension: { boss: 'Mysterious Code', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Emerald of Genesis',
    weaponAlts: { alt5: ['Blazing Brilliance'], alt4: ['Lunar Cutter', 'Endless Collapse'], alt3: ['Sword of Night'] },
    teams: ['Phoebe + Rover: Spectro + Verina', 'Zani + Rover: Spectro + Verina', 'Rover: Spectro + Shorekeeper + Camellya'] },
  // Fixed 2026-09-03 against a real browser snapshot, superseding the 2026-08-18 note below
  // where they conflict. bestEchoes named 'Impermanence Heron' — never mentioned anywhere in this
  // source (that's Rover: Aero's/Rover: Spectro's echo); the source's only Main Echo option for Havoc
  // Eclipse is Dreamless. weaponAlts.alt5 named 'Azure Oath' — also never mentioned in this source; the
  // real top-2 signature-locked alternatives are Red Spring and Blazing Brilliance. weaponAlts.alt4 was
  // missing Somnoire Anchor entirely (91.24%, the actual top 4★, "amazing, completely free") while
  // including Endless Collapse (83.09%, ranked 4th of 5). teams named 'Rover: Havoc + Yinlin +
  // Shorekeeper' — Yinlin is never named as a teammate in this source (only mentioned once, as an
  // unrelated damage comparison for the Dreamless Echo); replaced with the F2P-pair teammate this
  // source explicitly names as his 2nd-best buffer.
  'Rover: Havoc': { rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    desc: 'A wanderer who awoke with no memory on the shores of Solaris. Havoc attunement: an on-field main DPS — hold Heavy ATK at full Umbra to cast Devastation and enter Dark Surge, an enhanced-state combo that ends in the 1520%-ATK Liberation nuke Deadening Abyss.',
    skills: ['Tuneslayer', 'Wingblade', 'Umbra Eclipse', 'Deadening Abyss'],
    ascension: { boss: 'Mysterious Code', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Dreamless', 'Havoc Eclipse 5pc'], bestWeapon: 'Emerald of Genesis',
    weaponAlts: { alt5: ['Red Spring', 'Blazing Brilliance'], alt4: ['Somnoire Anchor', 'Commando of Conviction'], alt3: ['Sword of Night'] },
    teams: ['Rover: Havoc + Roccia + Verina', 'Rover: Havoc + Danjin + Shorekeeper'] },
  // Fixed 2026-09-02 against a real browser snapshot (confirmed genuine via its own
  // Snapshot-Content-Location header). Prior data had 3 real, confidently-sourced bugs: bestWeapon
  // was 'Emerald of Genesis' — not even mentioned anywhere in the source's Best Weapons section,
  // which shows ONLY her own signature (Bloodpact's Pledge, 100% at R1, 121.12% at R5) — no other
  // weapon is compared at all in this build guide. bestEchoes named 'Gusts of Welkin 5pc' (not
  // mentioned in source) and 'Reminiscence: Fleurdelys' as the primary main echo, when the source's
  // actual best/default set is Rejuvenating Glow (100%) with Bell-Borne Geochelone as ITS main echo
  // (Fleurdelys is the main echo for the situational alt set, Windward Pilgrimage, only worth it in
  // high-investment Cartethyia+Ciaccona teams). teams named 'Rover: Aero + Jinhsi + Shorekeeper' —
  // Jinhsi is never mentioned anywhere in the source; real Synergies/Example Teams name only
  // Cartethyia+Ciaccona (best team), Iuno+Ciaccona (Main DPS Iuno team), and Jiyan+Ciaccona (Jiyan
  // team). weaponAlts left as-is (unconfirmed, not contradicted) — the source's Best Weapons section
  // genuinely shows no alternative weapons at all for this character, so there's nothing here to
  // confirm OR contradict the existing alt5/alt4/alt3 entries against.
  // Fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): weaponAlts.alt5 duplicated bestWeapon
  // itself (Bloodpact's Pledge listed as its own "alternative") — an internal-consistency bug, not a
  // sourcing question (no other character in this file lists its own bestWeapon inside weaponAlts).
  // Removed the duplicate; 'Laser Shearer' stays per the standing "unconfirmed, not contradicted"
  // decision above.
  'Rover: Aero': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Healer',
    desc: "A wanderer who awoke with no memory on the shores of Solaris. Aero attunement: a healer/support whose Skyfall Severance strips Spectro Frazzle, Havoc Bane, Fusion Burst, Glacio Chafe, and Electro Flare stacks off a target and converts each into a stack of Aero Erosion, while Forte and Liberation both heal the team.",
    skills: ['Wind Cutter', 'Illusion Breaker', 'Cycle of Wind', 'Omega Storm'],
    ascension: { boss: 'Mysterious Code', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Bell-Borne Geochelone', 'Rejuvenating Glow 5pc'], bestWeapon: "Bloodpact's Pledge",
    weaponAlts: { alt5: ['Laser Shearer'], alt4: ['Overture', 'Lunar Cutter'], alt3: ['Sword of Voyager'] },
    teams: ['Cartethyia + Ciaccona + Rover: Aero', 'Iuno + Ciaccona + Rover: Aero'] },
  'Rover: Electro': { rarity: 5, element: 'Electro', weapon: 'Sword', role: 'Sub DPS',
    desc: 'A wanderer who awoke with no memory on the shores of Solaris. Electro attunement: a Parry Stance hybrid — hold Basic ATK for interrupt immunity and 60% DMG reduction, then spend Electric Surge on a team ATK buff or Apex Resonance, unlocking the multi-element Thrum of All Sounds Forte combo. Currently the weakest attunement, lacking a strong DPS partner.',
    skills: ['Deterrence', 'Thunderclap', "Myriad Omens' Mandate", 'Ultimate Tactics'],
    ascension: { boss: 'Mysterious Code', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    // bestWeapon/weaponAlts/bestEchoes corrected 2026-09-03 against a fresh the source dump: bestEchoes
    // named 'Nightmare: Thundering Mephis'/'Void Thunder 5pc' — this source's ONLY Best Echo Set is
    // Moonlit Clouds (100%, main echo Impermanence Heron); neither Void Thunder nor Nightmare:
    // Thundering Mephis appear anywhere on this page. bestWeapon was 'Emerald of Genesis' (90.00%,
    // actually only #5 by this source's own calc %) with weaponAlts.alt5 naming 'Laser Shearer' and
    // alt4 naming 'Lunar Cutter'/'Endless Collapse' — none of these three weapons appear anywhere in
    // this source either. Realigned bestWeapon to the source's actual #1 (Blazing Brilliance, 100%,
    // Changli's signature) and weaponAlts to its real next-ranked options.
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Blazing Brilliance',
    weaponAlts: { alt5: ['Red Spring', 'Azure Oath'], alt4: ['Feather Edge', 'Fables of Wisdom'], alt3: ['Sword of Night'] },
    teams: ['Rover: Electro + Yinlin + Verina', 'Rover: Electro + Calcharo + Shorekeeper'] },
  'Jiyan': { rarity: 5, element: 'Aero', weapon: 'Broadblade', role: 'Main DPS',
    // desc rewritten 2026-08-31 against the wiki/Jiyan/Combat (Chrome/Windows UA +
    // google.com referer + jsRender, load+9s wait; 2nd attempt cleared the Cloudflare interstitial the 1st
    // hit): exact Resolve economy (0-60 cap, gain sources, 15s no-hit decay), exact 30-Resolve thresholds for
    // both the empowered Windqueller (+20% DMG, costs 30 Resolve) and the Finale-vs-Prelude Liberation branch,
    // and exact Qingloong Mode entry/duration/cooldown/cost — none of this was documented with real numbers
    // before.
    desc: "Windborne Rider, leader of the Midnight Rangers of Jinzhou, acts with swift and resolute righteousness — he possesses the formidable ability to conjure a powerful Qingloong from the winds, making him invincible on the battlefield. On-field Aero DPS whose Forte resource is Resolve (0-60 cap): gained when Basic Attack 'Lone Lance' or the Intro Skill 'Tactical Strike' hits a target, and it gradually decays if he goes 15s without landing a hit. At 30+ Resolve, casting Resonance Skill 'Windqueller' consumes 30 Resolve for +20% DMG (in Qingloong Mode this same +20% is free and costs no Resolve). Also at 30+ Resolve, pressing Resonance Liberation consumes 30 Resolve to cast the empowered 'Emerald Storm: Finale' (counted as Heavy ATK DMG, castable at low altitude mid-air) instead of the normal 'Emerald Storm: Prelude'; below 30 Resolve, Prelude is cast instead — it deals no direct damage itself but puts him into Qingloong Mode for 10s (16s cooldown, costs 125 Concerto Energy): increased Anti-interruption, with Basic Attack, Heavy Attack, and Dodge Counter all replaced by the 3-part Heavy Attack 'Lance of Qingloong' combo (counted as Heavy ATK DMG).",
    skills: ['Lone Lance', 'Windqueller', 'Qingloong at War', 'Emerald Storm: Prelude'],
    rotation: ['Echo', 'Intro', 'Liberation: Emerald Storm', 'Heavy: Lance of Qingloong 1 (cancel → Skill)', 'Skill', 'Heavy: Lance 1', 'Heavy: Lance 2', 'Heavy: Lance 3', 'Heavy: Lance 1', 'Heavy: Lance 2', 'Heavy: Lance 3', 'Skill', 'Outro'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Waveworn Residue' },
    // bestEchoes/weaponAlts corrected against the source's Jiyan build calcs (2026-07-30 profile update):
    // Windward Pilgrimage (100%) outranks Sierra Gale (94.3%) as long as the team applies Aero Erosion;
    // Thunderflare Dominion (90.3%) and Aureate Zenith (82.3%) are the actual best 5★/4★ alternatives —
    // Waning Redshift wasn't in the source's recommendations for him at all.
    bestEchoes: ['Nightmare: Kelpie', 'Windward Pilgrimage 5pc'], bestWeapon: 'Verdant Summit',
    weaponAlts: { alt5: ['Thunderflare Dominion', 'Ages of Harvest'], alt4: ['Aureate Zenith', 'Autumntrace'], alt3: ['Broadblade of Night'] },
    teams: ['Jiyan + Iuno + Ciaccona', 'Jiyan + Iuno + Shorekeeper'] },
  'Calcharo': { rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    // desc rewritten 2026-08-31 against the wiki/Calcharo/Combat (Chrome/Windows UA +
    // google.com referer + jsRender, load+9s wait; 2nd attempt cleared Cloudflare) and cross-checked against
    // the source/wuthering-waves/characters/calcharo's Skills tab (identical mechanic text, confirms both
    // agree). Exact resource economy previously undocumented: Cruelty caps at 3, gained 1 per Resonance Skill
    // Extermination Order HIT (not per cast), and — critically — Cruelty CANNOT be gained at all while in
    // Deathblade Gear (undocumented mutual-exclusion between the two gauges). At 3 Cruelty, Heavy Attack is
    // replaced by "Mercy" (consumes all 3 Cruelty, Heavy ATK DMG, restores Resonance + Concerto Energy).
    // Resonance Liberation Phantom Etching costs 125 Resonance Energy, deals a hit, and enters Deathblade Gear
    // for an exact 11s: Basic Attack → 5-hit "Hounds Roar", Heavy Attack and Dodge Counter both upgraded to
    // Resonance Liberation DMG. Inside Deathblade Gear the Forte Gauge itself is replaced by "Killing Intent"
    // (caps at 5, gained 1 per Hounds Roar hit); at 5/5, Basic Attack is replaced by "Death Messenger"
    // (consumes all 5 Killing Intent, Resonance Liberation DMG, also restores Resonance + Concerto Energy).
    // Previously undocumented cast-order dependency: once Deathblade Gear ends, Calcharo\'s VERY NEXT Intro
    // Skill cast is silently replaced with a different move, "Necessary Means" (Intro Skill DMG, 198.81%×2 at
    // Lv.10 — see SKILL_MULTIPLIERS.Calcharo), instead of his normal Intro "Wanted Outlaw" — reverting to
    // Wanted Outlaw again after that one use. S2/S5 Resonance Chain nodes both key off "casts Wanted Outlaw OR
    // Necessary Means", so this alternation matters for their uptime too.
    desc: 'Phantom Hunter, leader of the "Ghost Hounds" international mercenary group — ruthless, vengeful, unforgiving; a potential client must be mindful of the price to pay before making him an offer. On-field Electro DPS. Resonance Skill Extermination Order hits build "Cruelty" (cap 3, frozen while in Deathblade Gear); at 3 Cruelty, Heavy Attack becomes "Mercy" (consumes all 3, restores Energy). Resonance Liberation Phantom Etching (125 Energy) enters Deathblade Gear for 11s: Basic Attack becomes the 5-hit "Hounds Roar", Heavy Attack/Dodge Counter both upgrade to Liberation DMG, and the Forte Gauge becomes "Killing Intent" (cap 5, +1 per Hounds Roar hit) — at 5/5, Basic Attack becomes the Killing-Intent-fueled "Death Messenger" burst finisher (Liberation DMG, restores Energy). Once Deathblade Gear ends, his next Intro Skill cast is silently swapped to "Necessary Means" instead of his usual "Wanted Outlaw".',
    skills: ['Gnawing Fangs', 'Extermination Order', 'Hunting Mission', 'Phantom Etching'],
    rotation: ['Echo', 'Intro', 'Liberation', 'Heavy: Death Messenger', 'Basic: Hounds Roar 1-5', 'Heavy: Death Messenger', 'Basic: Hounds Roar 1-5', 'Heavy: Death Messenger', 'Outro'],
    ascension: { boss: 'Thundering Tacet Core', common: 'Ring', specialty: 'Iris' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Waveworn Residue' },
    // bestEchoes confirmed accurate (Void Thunder/Nightmare: Thundering Mephis is genuinely #1 per
    // the source calcs). weaponAlts/teams corrected against the source's live build calcs (2026-07-30 profile
    // update): Wildfire Mark (100.72%) actually edges out even his own bestWeapon and belongs in alt5,
    // not Verdant Summit (96.69%, still fine but not top-tier). 'Waning Redshift' was a straight data
    // bug — it's a Rectifier weapon (see weapons.js), not equippable by a Broadblade user at all;
    // replaced with Aureate Zenith, a real Broadblade 4★ option. Lynae + Mornye is Calcharo's explicit
    // "Best Team" per the source (his best overall buffer by a wide margin) — added ahead of the Yinlin
    // pairing, which remains valid as his "most reliable Outro buffing option".
    bestEchoes: ['Nightmare: Thundering Mephis', 'Void Thunder 5pc'], bestWeapon: 'Lustrous Razor',
    weaponAlts: { alt5: ['Wildfire Mark', 'Ages of Harvest'], alt4: ['Autumntrace', 'Aureate Zenith'], alt3: ['Broadblade of Night'] },
    teams: ['Calcharo + Lynae + Mornye', 'Calcharo + Yinlin + Shorekeeper'] },
  'Encore': { rarity: 5, element: 'Fusion', weapon: 'Rectifier', role: 'Main DPS',
    // desc rewritten 2026-08-31 against wuthering.gg/characters/encore (Lv.1 skill-detail widget, cross-checked
    // against the wiki/Encore/Combat's Forte/Resonance Chain text) for exact Mayhem
    // economy, Cosmos Rave entry/exit, and the Flaming Woolies → Energetic Welcome cast-order window — none of
    // this was previously documented with exact numbers.
    desc: "Wooly-Counting Game, a girl of the Black Shores accompanied by one black and one white Wooly, who dreams of creating happy stories with candies, fairy tales, and her imagination. On-field Fusion DPS who builds Mayhem (caps at 100) toward an empowered Heavy Attack: every hit of Basic ATK Wooly Attack, Resonance Skill Flaming Woolies/Energetic Welcome, and Intro Skill Woolies Helpers restores some Mayhem. At 100/100, casting Heavy Attack consumes it all to enter a 70% DMG-reduction channel (surviving a swap-out — no forfeit on quickswap) that ends in a Cloudy Frenzy nuke, counted as Resonance Liberation DMG. Resonance Skill has its own 2-part cast-order window: Flaming Woolies (8-hit barrage) can be chained into a stronger Energetic Welcome finisher only by pressing Skill again immediately after Flaming Woolies ends — otherwise the chain resets. Resonance Liberation Cosmos Rave (125 Energy, 16s cooldown) swaps her whole kit — Basic ATK, Heavy ATK, Skill, and Dodge Counter all become enhanced 'Cosmos' Fusion versions — for a fixed 10s, during which any hit still restores Mayhem, so the same full-Mayhem/Heavy-ATK trigger inside the window instead casts Cosmos Rupture (also Liberation DMG). Inherent Skill Angry Cosmos adds +10% DMG dealt during Cosmos Rave whenever her HP is above 70%.",
    skills: ['Wooly Attack', 'Flaming Woolies', 'Black & White Woolies', 'Cosmos Rave'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Helix' },
    // bestEchoes confirmed accurate (Molten Rift/Nightmare: Inferno Rider is genuinely #1 per the source
    // calcs). bestWeapon kept as Cosmic Ripples (her best permanently-available option, same convention
    // as Calcharo who also has no true signature) since it's the practical F2P choice; weaponAlts/teams
    // corrected against the source's live build calcs (2026-07-30 profile update): Stringmaster (110%) and
    // Rime-Draped Sprouts (104.4%) are her real top alternatives, clearly ahead of Cosmic Ripples itself
    // — 'Boson Astrolabe' wasn't in the source's recommendations for her at all. Lupa is now explicitly her
    // "new best teammate over Sanhua in most situations" and pairs with Brant in the source's own "Best
    // Team" example — added ahead of the Changli/Shorekeeper pairing.
    // weaponAlts.alt4 corrected 2026-09-03 against a fresh the source dump: was ['Augment', 'Fusion
    // Accretion'] — Radiant Dawn ties Augment for the actual top 4★ spot (both 94.40%, adjacent in the
    // source's own list, ahead of Fusion Accretion's 87.70%) and was missing entirely.
    bestEchoes: ['Nightmare: Inferno Rider', 'Molten Rift 5pc'], bestWeapon: 'Cosmic Ripples',
    weaponAlts: { alt5: ['Stringmaster', 'Rime-Draped Sprouts'], alt4: ['Radiant Dawn', 'Augment'], alt3: ['Rectifier of Night'] },
    teams: ['Encore + Brant + Lupa', 'Encore + Sanhua + Lupa'] },
  // desc corrected against the wiki's Jianxin infobox (2026-08-17 audit): the wiki's
  // current secondary_title is "Guiding Starlance", not "Cleansing Reflections" (a stale title still
  // shown on the source's character page for her — the two sources disagree here, the wiki's live
  // infobox is treated as authoritative). Skills/base stats/multipliers/buffs/ascension mats all
  // independently re-verified against the source character/1405 this same audit and were already
  // accurate. weaponAlts/teams were corrected against the source's live build/team page (see comments
  // by those fields below) once it became reachable via a Chrome UA + referer + jsRender fetch.
  // desc re-verified 2026-08-31 against the wiki/Jianxin/Combat's "Details"/"Forte"
  // tables directly (not just the infobox blurb): the prior "large HP-scaling shield and periodic team
  // healing" line was vague/approximate — replaced with the exact mechanics from the Forte Circuit table:
  // Chi caps at 120, gained from Basic ATK hits, casting Calming Air, landing Chi Counter/Chi Parry, and
  // Intro Skill Essence of Tao hits (site gives no per-hit numeric gain, so none is invented here — flagged
  // TODO below). At max Chi, HOLDING Basic Attack (not Heavy Attack — the site's own section header calls
  // it "Heavy Attack: Primordial Chi Spiral" but the Instructions box and Forte Circuit body text both say
  // "hold Basic Attack" to trigger it; kept as "Basic Attack" per the two matching in-body mentions) casts
  // Primordial Chi Spiral and enters Zhoutian Progress: +interrupt resistance and -50% DMG taken while
  // channeling, releasing Chi in periodic Chi Strikes. On end, Jianxin gains a shield sized by how far
  // Zhoutian Progress reached — at Lv.10/Major Zhoutian: Outer (the max stage) that's a flat 5,539 + 238.78%
  // of her HP (up from a lower flat+% value at earlier stages), further +20% via the Reflection Inherent
  // Skill (2/2), for a fixed 30s duration. While that shield persists, the on-field/active Resonator (not
  // unconditionally "the team" — it's whichever Resonator happens to be active when each tick lands) is
  // healed once every 6s — corrected from "periodic team healing" to reflect that it's a single active-unit
  // heal-over-time, not a party-wide heal.
  // TODO: verify — the wiki's Forte/Chi text does not give a per-hit Chi gain number for any of the four
  // Chi sources (Basic ATK hit / Calming Air cast / Chi Counter-Parry hit / Intro Skill hit); could not be
  // sourced this pass, left undocumented rather than invented.
  'Jianxin': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Support',
    desc: 'Guiding Starlance, a Taoist monk and successor of Fengyiquan who has dedicated her life to mastering the ultimate martial art — with the power to harness and transform environmental Chi, she creates protective barriers that purify both body and mind. Shield support/sub-DPS: builds Chi (cap 120) from Basic ATK hits, Calming Air casts, Chi Counter/Chi Parry hits, and Intro Skill hits; at max Chi, holds Basic Attack to cast Primordial Chi Spiral and enter Zhoutian Progress — a channeled state with +interrupt resistance and -50% DMG taken — ending in an HP-scaling shield (up to 5,539 + 238.78% HP at Lv.10 Major Zhoutian: Outer, +20% more via her 2nd Inherent Skill, 30s duration) that heals the active Resonator once every 6s while it persists. Groups enemies with Liberation Purification Force Field, which explodes on expiry, and grants the incoming Resonator +38% Resonance Liberation DMG via Outro.',
    skills: ['Fengyiquan', 'Calming Air', 'Primordial Chi Spiral', 'Purification Force Field'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Whisperin Core', specialty: 'Lanternberry' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    // bestWeapon kept as Abyss Surges (her best permanently-available option, ranked "100%" baseline
    // on the source's own calc scale) even though Verity's Handle (114.70%) and Moongazer's Sigil (108.30%)
    // both out-damage it per the source's live build calcs (the source/wuthering-waves/characters/jianxin,
    // re-fetched 2026-08-17 via Chrome UA + google.com referer + jsRender to get past the Cloudflare
    // challenge) — same F2P-first convention already used for Encore/Calcharo. weaponAlts corrected
    // against that same page: alt4 was wrong (Marcato is her worst-performing 4★ at 71.40%, likely
    // copy/paste from another character) — replaced with Aether Strike (91.20%) and Celestial Spiral
    // (86.50%), the two actually-best 4★ alternatives. alt3 replaced 'Gauntlets of Night' (not even
    // mentioned on the source's page) with Originite: Type IV, which the source explicitly calls out as THE
    // 3★ pick for her low-investment ToA support build (enables the 5pc Rejuvenating Glow set).
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Abyss Surges',
    weaponAlts: { alt5: ["Verity's Handle", "Moongazer's Sigil"], alt4: ['Aether Strike', 'Celestial Spiral'], alt3: ['Originite: Type IV'] },
    // teams corrected against the same the source page: 'Jianxin + Jiyan + Verina' had no basis in the source's
    // synergy list (Jiyan isn't mentioned at all for her) — replaced with 'Jianxin + Iuno + Shorekeeper',
    // explicitly the source's "Best Team" (Iuno is called her best DPS to buff, taking 38% Lib DMG Amp from
    // her Outro; the Iuno+Shorekeeper / Xiangli Yao+Shorekeeper pairing is also cited directly in
    // the source's own endgame-stats ER estimate). Xiangli Yao + Shorekeeper kept, confirmed as her other
    // named example team.
    teams: ['Jianxin + Iuno + Shorekeeper', 'Jianxin + Xiangli Yao + Shorekeeper'] },
  // Full audit 2026-08-17 against the wiki (MediaWiki API, Cloudflare bypassed via
  // Chrome UA + google.com referer + jsRender) and the source/character/1104 — base stats, skills,
  // multipliers, buffs, ascension mats all independently re-confirmed accurate, no changes needed there.
  // desc enriched with the wiki's "last living Suan'ni" lore detail (his species/heritage, not previously
  // captured). bestEchoes/weaponAlts/teams corrected against the source's live build/team page (re-fetched
  // same audit): Endless Resonance 5pc has since overtaken Frosty Resolve as her #1 echo set (100% vs
  // 98.9% on the source's calc scale) — bestEchoes updated to its main echo, Mech Abomination. weaponAlts.
  // alt5 swapped Tragicomedy (103.0%, rank 4) for Blazing Justice (105.3%, actual rank 2, was skipped).
  // alt4 swapped Hollow Mirage (82.8%) for Aether Strike (88.9%, actual best 4★ alt, was omitted).
  // teams: 'Lingyang + Zhezhi + Shorekeeper' had no basis in the source's synergy list — replaced with
  // 'Lingyang + Lynae + Zhezhi', explicitly named "Lingyang's best partners" and the source's cited Best
  // Team; 'Lingyang + Sanhua + Verina' kept, confirmed as the source's named F2P Team.
  // desc rewritten 2026-08-31 against the wiki/Lingyang/Combat's Forte "Details" text
  // (Chrome/Windows UA + google.com referer + jsRender). Prior text only named the resource trigger (Furious
  // Punches) and skipped the other two restore events, the exact 100 cap, and the Striding Lion entry/exit
  // timing — all now stated verbatim: Lion's Spirit restores on Furious Punches, Lion Awakens (Intro), and
  // Strive: Lion's Vigor (Liberation); Striding Lion can also be entered via Basic ATK right after Lion
  // Awakens/Strive: Lion's Vigor if Lion's Spirit is already full, not just via Glorious Plunge; the state
  // drains to 0 within 5s (10s while the Liberation's Lion's Vigor buff halves the drain rate); and Basic
  // ATK swaps to Stormy Kicks specifically once Lion's Spirit drops below 10 (source doesn't publish the
  // per-trigger restore amounts, so those are omitted rather than guessed — see rotation TODO below).
  'Lingyang': { rarity: 5, element: 'Glacio', weapon: 'Gauntlets', role: 'Main DPS',
    desc: "Frosty Gusto, an enthusiastic and brave member of the Liondance Troupe in Jinzhou and the last living Suan'ni — a sincere, compassionate visitor of the human community with incredible physical abilities, who embodies the spirit of Liondance with his unique style. On-field Glacio DPS whose Forte resource, Lion's Spirit (100 cap), is restored by casting Resonance Skill Furious Punches, Intro Skill Lion Awakens, or Resonance Liberation Strive: Lion's Vigor. At full Lion's Spirit, Heavy Attack casts Glorious Plunge and enters the airborne Striding Lion state (also enterable via Basic ATK right after Lion Awakens or Strive: Lion's Vigor if Lion's Spirit is already full); the state drains Lion's Spirit to 0 within 5s (10s if Strive: Lion's Vigor's buff is active, which halves the drain rate), swapping Basic ATK to the 2-hit Feral Gyrate and Resonance Skill to Mountain Roamer, with Basic ATK becoming the 8-hit+finisher Stormy Kicks (unlocking the Tail Strike Mid-air Attack) once Lion's Spirit drops below 10.",
    skills: ['Majestic Fists', 'Ancient Arts', 'Unification of Spirits', "Strive: Lion's Vigor"],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    // bestEchoes corrected 2026-09-03 against a fresh the source dump, superseding the 2026-08-18 note
    // above (based on a stale/different source): this source ranks Endless Resonance #1 (100%, "his
    // best set" for the Hypercarry playstyle he generally uses), Frosty Resolve #2 (98.90%, his best
    // quickswap-compatible set), and Freezing Frost #3 (97.80%, ranked lowest of the three specifically
    // because its main echo Lampylumen Myriad takes too long to execute). 'Mech Abomination' was
    // already correct as the main echo — it's Endless Resonance's own main echo per this source, not
    // Freezing Frost's (whose main echo is Lampylumen Myriad) — only the paired set name was wrong.
    bestEchoes: ['Mech Abomination', 'Endless Resonance 5pc'], bestWeapon: 'Abyss Surges',
    weaponAlts: { alt5: ["Moongazer's Sigil", 'Blazing Justice'], alt4: ['Aether Strike', 'Celestial Spiral'], alt3: ['Gauntlets of Night'] },
    teams: ['Lingyang + Lynae + Zhezhi', 'Lingyang + Sanhua + Verina'] },
  // Full audit 2026-08-17 against the wiki (MediaWiki API) and the source/
  // character/1503 — desc, skills, base stats, multipliers, buffs, ascension mats, echoes, alt4/alt3
  // weapons, and teams all independently re-confirmed accurate, no changes needed there. CHAR_BUFF_TABLE's
  // existing "Outro is All DMG Amp, not Amplify" note re-confirmed against the source's exact wording
  // ("DMG Amplified by 15%") even though the source's own prose review loosely calls it "DMG Amplify" —
  // same wording looseness seen auditing Jianxin, the source's structured text is treated as authoritative.
  // bestWeapon: one source ranks Cosmic Ripples #1 (kept); note another source's build page instead puts the
  // rotation-shortening 4★ Variation above every 5★ option for her specifically, since cutting one
  // attack from her already-shortest-in-game rotation outweighs raw stats — both are legitimate reads,
  // Variation is already covered in alt4. alt5 reordered to lead with Stellar Symphony (confirmed by
  // both sources) over Boson Astrolabe (unconfirmed by either this audit, kept as a plausible ER pick).
  'Verina': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Healer',
    // desc rewritten 2026-08-31 verbatim against the wiki/Verina/Combat (Chrome UA
    // + google.com referer + jsRender; the page's Forte "Details" table omits an Outro Skill row entirely,
    // so Blossom's own numbers are cross-sourced from the source/character/1503 and the source, which
    // agree on both figures) and the source/wuthering-waves/characters/verina's Gameplay tab. Exact
    // resource economy: Photosynthesis Energy caps at 4 stacks, gained 1 each from Basic Attack Stage 5
    // on hit, Resonance Skill Botany Experiment on hit, and Intro Skill Verdant Growth on hit (the Intro
    // is rated "unusable" by the source — it launches her airborne and lengthens her already-shortest rotation
    // in the game, so it's skipped in practice and she swaps in cold, starting her Basic ATK combo at
    // Stage 3 instead of Stage 1). Each stack is spent 1-for-1 on Heavy Attack: Starflower Blooms (Heavy
    // ATK DMG) or Mid-air Attack: Starflower Blooms (Basic ATK DMG) — both heal the nearby team and refill
    // 12 Concerto Energy per cast, no separate "enhanced state," just gauge-gated alt-casts with no
    // duration/timer. Resonance Liberation Arboreal Flourish (175 Energy, 25s CD) heals the team (950 +
    // 23.80% ATK at Lv.10) and applies a 12s Photosynthesis Mark; any nearby ally hitting a marked target
    // triggers a Coordinated Attack (9.95% ATK DMG, 428 + 10.71% ATK heal), capped at 1/s. Cast-order note:
    // Skill Botany Experiment can be swap-cancelled immediately by Liberation to skip its damage/Resonance
    // Energy gain while still keeping its Concerto Energy gain — this is the standard rotation, not an edge
    // case. Outro Blossom heals the incoming Resonator 19% of Verina\'s ATK/s for 6s and grants the whole
    // nearby team +15% All DMG Amp for 30s (confirmed "Amplified," not Amplify, per the source\'s and this file\'s
    // CHAR_BUFF_TABLE\'s existing sourcing — the source\'s own prose loosely says "Amplify" but its Skills tab
    // multiplier text says "Amplified," matching the source verbatim). Inherent Skill Gift of Nature: casting
    // Heavy/Mid-air Starflower Blooms, Liberation, or Outro grants the whole team +20% ATK for 20s.',
    skills: ['Cultivation', 'Botany Experiment', 'Starflower Blooms', 'Arboreal Flourish'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Howler Core', specialty: 'Belle Poppy' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Helix' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc'], bestWeapon: 'Cosmic Ripples',
    weaponAlts: { alt5: ['Stellar Symphony', 'Boson Astrolabe'], alt4: ['Variation', 'Call of the Abyss'], alt3: ['Rectifier of Voyager'] },
    // teams corrected 2026-08-18: 'Jiyan + Mortefi + Verina' was Jiyan's original 1.0-era pairing;
    // current sources unanimously name Iuno as Jiyan's actual current buffer instead.
    teams: ['Jinhsi + Yinlin + Verina', 'Jiyan + Iuno + Verina', 'Encore + Changli + Verina'] },
  'Yinlin': { rarity: 5, element: 'Electro', weapon: 'Rectifier', role: 'Sub DPS',
    // desc rewritten 2026-08-31 verbatim against the wiki/Yinlin/Combat (re-fetched,
    // Chrome UA + google.com referer + jsRender, 2 attempts needed past a Cloudflare interstitial) and
    // cross-checked against the source/wuthering-waves/characters/yinlin. Exact Forte economy: Judgment
    // Points cap at 100, restored by Zapstring's Dance (Basic ATK) hits, Magnetic Roar, Electromagnetic
    // Blast, Lightning Execution, and Thundering Wrath (Liberation) hits — every offensive action feeds it.
    // Magnetic Roar puts her into Execution Mode for 10s: her next 4 Basic ATK/Dodge Counter combo stages
    // (1 trigger per stage, max 4) each also fire an Electromagnetic Blast on any Sinner's-Mark target.
    // Sinner's Mark itself is applied by Zapstring's Dance, Thundering Wrath, and Intro Skill Raging
    // Storm — and is removed entirely when Yinlin leaves the field (not a fixed duration). At 100/100
    // Judgment Points her Heavy Attack is auto-replaced by Chameleon Cipher, which consumes all 100 and
    // upgrades any Sinner's Mark on the hit target to Punishment Mark for exactly 18s; a Punishment-Marked
    // target that takes any damage triggers an automatic Judgement Strike Coordinated ATK, capped at
    // 1/second. Timing/cast-order dependency: Lightning Execution is only castable as the immediate
    // follow-up to Magnetic Roar — cast it too late, or swap Yinlin out first, and it goes on a separate
    // cooldown instead of firing free.
    desc: 'Enforcer Puppet — a skilled Patroller and powerful Natural Resonator of Jinzhou; after being suspended from her duties at the Public Security Bureau, she must now pursue hidden evils in secrecy. Electro sub-DPS/hybrid who applies Sinner\'s Mark via Basic Attack, Thundering Wrath, and Intro Skill (removed the instant she leaves the field), spends Magnetic Roar to enter a 10s Execution Mode that adds Electromagnetic Blast procs onto her next 4 Basic ATK/Dodge Counter stages, and — once her 100-cap Judgment Points meter fills — auto-replaces Heavy Attack with Chameleon Cipher, upgrading Sinner\'s Mark to an 18s Punishment Mark that auto-triggers Judgement Strike (up to 1/s) whenever the target takes damage, even off-field. Lightning Execution only casts for free as an immediate follow-up to Magnetic Roar (miss the window, or swap out first, and it goes on cooldown instead). Outro amplifies the incoming Resonator\'s Electro DMG +20% and Resonance Liberation DMG +25% for 14s. No RES Shred anywhere in her kit.',
    skills: ['Zapstring\'s Dance', 'Magnetic Roar', 'Chameleon Cipher', 'Thundering Wrath'],
    rotation: ['Intro', 'Basic 4 (optional swap cancel)', 'Skill: Magnetic Roar', 'Heavy Attack', 'Skill: Lightning Execution (cancel → Heavy endlag)', 'Liberation (on landing)', 'Basic 1', 'Forte Heavy: Chameleon Cipher', 'Outro'],
    ascension: { boss: 'Group Abomination Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Helix' },
    // bestEchoes confirmed accurate (Moonlit Clouds/Impermanence Heron ties #1 with Empyrean Anthem per
    // the source calcs). weaponAlts/teams corrected against the source's Jiyan-style live build calcs
    // (2026-07-30 profile update): Whispers of Sirens (96.7%) and Rime-Draped Sprouts (96.3%) are her
    // actual best 5★ alternatives — Cosmic Ripples (90%) is just the best F2P option, not a top alt.
    // Jinzhou Keeper replaces Waltz in Masquerade, which wasn't in the source's Yinlin recommendations at
    // all. Iuno is now explicitly her best synergy partner ("Yinlin's best synergy nowadays is with
    // Main DPS Iuno") — added ahead of the Calcharo pairing, which is no longer top-tier for her.
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Stringmaster',
    weaponAlts: { alt5: ['Whispers of Sirens', 'Rime-Draped Sprouts'], alt4: ['Augment', 'Jinzhou Keeper'], alt3: ['Rectifier of Night'] },
    teams: ['Yinlin + Iuno + Shorekeeper', 'Yinlin + Jinhsi + Verina'] },
  // Full audit 2026-08-17 against the wiki (MediaWiki API) and the source's live build page
  // (Chrome UA + google.com referer + jsRender) — desc, skills, base stats, all skill multipliers
  // (independently spot-checked section-by-section against the wiki's own Forte table, matches exactly),
  // buffs, ascension mats, bestEchoes, and both example teams all re-confirmed accurate, no changes
  // needed there. weaponAlts corrected against the source's live calc %: alt5 had Lustrous Razor (80.1%,
  // near the bottom of her 5★ options) ahead of the two actually-best non-signature 5★s, Kumokiri
  // (87.9%) and Wildfire Mark (87.6%) — replaced. alt4 had 'Autumntrace', which isn't in the source's
  // ranked list for her at all (looks like a copy/paste from another character) — replaced with Aureate
  // Zenith (72.3%), her confirmed best 4★; Waning Redshift (70.7%, confirmed #2 4★) kept.
  'Jinhsi': { rarity: 5, element: 'Spectro', weapon: 'Broadblade', role: 'Main DPS',
    // desc rewritten 2026-08-31 to exact-mechanic depth against the wiki/Jinhsi/Combat
    // (Chrome/Windows UA + google.com referer + jsRender, load+9s wait to clear Cloudflare). Prior text was
    // flavor + "builds Incandescence from any team member's Attribute or Coordinated DMG" with no exact
    // trigger events/amounts/cooldowns — replaced with the verbatim Instructions-panel + Forte Circuit text.
    desc: "Thawborn Renewal, Magistrate of Jinzhou, gently brightens the hopes of her people like rays of winter sunlight — as the revered Sentinel's Appointed Resonator, she displays humility and wholeheartedly commits herself to guiding her people toward a brilliant future. On-field Spectro DPS whose Forte resource, Incandescence (cap 50), is gained ONLY via the passive Eras in Unity (active whenever Jinhsi is in the party, not just on-field): +1 Incandescence any time a party member inflicts Attribute DMG (capped to 1 trigger per 3s PER Attribute type), PLUS a separate +2 Incandescence any time a party member damages the enemy with a Coordinated Attack (also capped to 1 trigger per 3s per Attribute of that Coordinated Attack) — the two triggers are independent and can both fire off the same hit. Her burst is a strict cast-order chain, not a flat combo: (1) after landing Basic ATK Stage 4 OR her Intro Skill Loong's Halo (only while NOT already in Incarnation), a 5s window opens in which her Resonance Skill button is replaced by Overflowing Radiance — casting it deals Spectro DMG and sends her into Incarnation for 10s (missing the 5s window forfeits the alternate cast, forcing a normal Trailing Lights of Eons instead); (2) while in Incarnation, Basic ATK is replaced by a 4-stage Incarnation-Basic Attack combo (counted as Resonance Skill DMG, does not reset her normal Basic ATK cycle) and her Resonance Skill is replaced by Crescent Divinity (a direct-cast alternate Skill hit, can be cast in mid-air); (3) landing Stage 4 of Incarnation-Basic Attack ends Incarnation and grants Ordination Glow, during which Basic ATK is replaced by an Incarnation-Heavy Attack and Resonance Skill is replaced by Illuminous Epiphany — she must press Skill within 5s of that Stage-4 hit to cast it, or Ordination Glow (and the chance to spend Incandescence) is lost; (4) Illuminous Epiphany sends out Solar Flare, which detonates after a short delay as Stella Glamor, consuming up to 50 Incandescence with each point spent adding bonus DMG Multiplier to the nuke. Casting Illuminous Epiphany also grants Unison (once per 25s): while held, swapping off-field consumes Unison instead of requiring full Concerto Energy, auto-triggering both her Outro Skill Temporal Bender and the incoming Resonator's Intro Skill for a free extra Outro that rotation.",
    skills: ['Slash of Breaking Dawn', 'Trailing Lights of Eons', 'Luminal Synthesis', 'Purge of Light'],
    ascension: { boss: 'Elegy Tacet Core', common: 'Howler Core', specialty: "Loong's Pearl" },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Waveworn Residue' },
    bestEchoes: ['Jué', 'Celestial Light 5pc'], bestWeapon: 'Ages of Harvest',
    weaponAlts: { alt5: ['Kumokiri', 'Wildfire Mark'], alt4: ['Aureate Zenith', 'Waning Redshift'], alt3: ['Broadblade of Night'] },
    teams: ['Jinhsi + Zhezhi + Shorekeeper', 'Jinhsi + Yinlin + Verina'] },
  // Full audit 2026-08-17 against the wiki (MediaWiki API) and the source's live build page
  // (Chrome UA + google.com referer + jsRender) — desc, skills, base stats, multipliers, ascension mats,
  // and bestEchoes all re-confirmed accurate. weaponAlts corrected against the source's calc %: alt5's Red
  // Spring (90.0%, tied for 5th) was outranked by Emerald Sentence (90.4%, actual #3) — swapped. alt4
  // had 'Lumingloss'/'Endless Collapse', neither of which appears anywhere in the source's ranked weapon
  // list for her — replaced with her confirmed best 4★ (Somnoire Anchor, 81.4%) and best no-gacha option
  // (Commando of Conviction, 76.7%). teams: 'Changli + Brant + Shorekeeper' swapped Shorekeeper (never
  // named as her specific partner) for Lupa, per the source's actual "Best Team" (Changli+Lupa+Brant,
  // Lupa being explicitly "part of Changli's best team" as the top Mono Fusion buffer); the Encore+Verina
  // budget team was kept, confirmed as the source's named Budget Dual DPS Team.
  // desc rewritten 2026-08-31 with exact Forte economy/True Sight mechanics per
  // the wiki/Changli/Combat ("Instructions" + "Forte" > "Details" sections):
  // Enflamement caps at 4 stacks; +1 per on-hit True Sight: Conquest (ground) or True Sight: Charge
  // (jump/mid-air) follow-up, or +4 instantly from casting Liberation Radiance of Fealty. True Sight
  // itself (12s window) is entered by landing Basic ATK Stage 4, Mid-air ATK Stage 4, Resonance Skill
  // Tripartite Flames (True Sight: Capture — 2 charges, 12s recharge each, castable mid-air), or Intro
  // Skill Obedience of Rules — and is consumed/ended the instant either follow-up fires (only one
  // Conquest-or-Charge per window, not both), so re-triggering True Sight is required between every
  // Enflamement tick. At 4 Enflamement, holding Heavy Attack casts Flaming Sacrifice instead (consumes
  // all 4 stacks, 40% DMG reduction while casting) — no other cast-order/timing-window dependency exists
  // (unlike Jinhsi's Skill-within-5s or Camellya's cast-before-Outro): Flaming Sacrifice is available
  // any time Enflamement is capped, not gated to a specific prior cast.
  'Changli': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Eternal Blaze, counselor serving the Jinzhou Magistrate and former Secretary-General in the capital — shrouded in flames, she\'s fated to burn brightly until her final embers, rising to power with fiery determination and a strategic mindset always thinking ahead. On-field Fusion DPS whose Basic/Mid-air Attack Stage 4, Resonance Skill Tripartite Flames (2 charges, 12s recharge), or Intro Skill open a 12s True Sight window; the next ground Basic ATK (Conquest) or jump/mid-air Basic ATK (Charge) consumes that window for a Resonance-Skill-type hit and +1 Enflamement (caps at 4; Liberation Radiance of Fealty instantly grants all 4 plus Fiery Feather, a self +25% ATK buff consumed by her next Flaming Sacrifice within 10s). At 4 Enflamement, Heavy Attack casts the enhanced Flaming Sacrifice instead — consuming all stacks for a big Fusion nuke with 40% DMG reduction while casting. Outro Strategy of Duality grants the incoming Resonator +20% Fusion DMG Amp and +25% Liberation DMG Amp for 10s (or until they\'re swapped out).',
    skills: ['Blazing Enlightenment', 'Tripartite Flames', 'Flaming Sacrifice', 'Radiance of Fealty'],
    ascension: { boss: 'Rage Tacet Core', common: 'Ring', specialty: 'Pavo Plum' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Metallic Drip' },
    bestEchoes: ['Nightmare: Inferno Rider', 'Molten Rift 5pc'], bestWeapon: 'Blazing Brilliance',
    weaponAlts: { alt5: ['Emerald of Genesis', 'Emerald Sentence'], alt4: ['Somnoire Anchor', 'Commando of Conviction'], alt3: ['Sword of Night'] },
    teams: ['Changli + Lupa + Brant', 'Changli + Encore + Verina'] },
  // Full audit 2026-08-17 against the wiki (MediaWiki API) and the source's live build page
  // (Chrome UA + google.com referer + jsRender) — desc content (title prepended to match the roster's
  // convention), skills, base stats, multipliers, buffs, ascension mats, bestEchoes, and both example
  // teams all re-confirmed accurate. weaponAlts corrected against the source's calc %: alt5 led with Cosmic
  // Ripples (84.6%, her best F2P/permanent pick, not actually close to top-tier for her) and 'Freeze
  // Frame', absent from the source's ranked list entirely — replaced with the two true best non-signature
  // 5★s, Whispers of Sirens (95.8%) and Lethean Elegy (94.5%). alt4 had 'Waltz in Masquerade', also
  // absent from the source's list — replaced with Radiant Dawn (78.1%, confirmed #2 4★); Augment (81.1%,
  // confirmed #1 4★) kept.
  'Zhezhi': { rarity: 5, element: 'Glacio', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Enchanted Brush — shy, soft-spoken painter of the Jinzhou art scene whose ink creations spring to life and fight at her command; her bashfulness masks a fierce devotion to her craft and to those she calls friends. Glacio sub-DPS/support who paints Phantasmic Imprints during her Basic Attack and Forte combo, consumes them to unleash off-field Coordinated Attack Glacio nukes via Resonance Liberation (Living Canvas), and buffs the incoming Resonator\'s Glacio DMG and Skill DMG through her Outro Carve and Draw.',
    skills: ['Dimming Brush', 'Manifestation', 'Ink and Wash', 'Living Canvas'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Howler Core', specialty: 'Lanternberry' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Helix' },
    bestEchoes: ['Nightmare: Lampylumen Myriad', 'Empyrean Anthem 5pc'], bestWeapon: 'Rime-Draped Sprouts',
    weaponAlts: { alt5: ['Whispers of Sirens', 'Lethean Elegy'], alt4: ['Augment', 'Radiant Dawn'], alt3: ['Rectifier of Night'] },
    teams: ['Zhezhi + Jinhsi + Shorekeeper', 'Zhezhi + Carlotta + Shorekeeper'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1305 sheet. desc: title "Matter Weaver" (the source) prepended and blurb
  // rewritten from the source's own profile text to match the roster's convention; skills/base stats/
  // ascension/skill materials/bestEchoes all re-confirmed accurate against both sources. weaponAlts
  // corrected against the source's current calc %: alt5 previously led with Abyss Surges (81.4%, actually
  // #7) while omitting Moongazer's Sigil, now Xiangli Yao's actual #1 overall weapon (100%, edges out
  // even his own Signature) and Blazing Justice (92.0%, #3) — both swapped in. alt4 previously paired
  // Stonard with Legend of Drunken Hero, a 4★ that the source ranks dead last of all his options with no
  // score — replaced with Aether Strike (79.7%, actual best 4★), keeping Stonard (73.6%, #2 4★).
  // teams: 'Xiangli Yao + Yinlin + Verina' kept as the budget pick (Yinlin/Verina both named directly),
  // but the first slot swapped from a same-tier duplicate (+Shorekeeper) to the source's actual named Best
  // Team partners — Lynae and Mornye, called "easily Xiangli Yao's best partners" and "the best generalist
  // Support" (with a Lynae-specific synergy) respectively in the Synergies writeup.
  'Xiangli Yao': { rarity: 5, element: 'Electro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Matter Weaver, Principal Investigator at Jinzhou\'s Huaxu Academy and its youngest multi-disciplinary scientist — a gentle soul with a sharp mind whose relentless passion for Automata Mechanics always translates into constructive findings and insights. On-field Electro Main DPS who builds Capacity through his Basic Attack/Skill combos, enters Intuition via Resonance Liberation (Cogitation Model) to gain 3 Hypercubes and enhanced attacks, then burns each Hypercube via the enhanced Skill Law of Reigns for his core burst damage — his Outro Chain Rule then fires bonus laser procs onto the incoming Resonator\'s Basic Attacks.',
    skills: ['Probe', 'Deduction', 'Forever Seeking', 'Cogitation Model'],
    ascension: { boss: 'Hidden Thunder Tacet Core', common: 'Whisperin Core', specialty: 'Violet Coral' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    // bestWeapon corrected 2026-09-03 against a fresh the source dump: this source explicitly states
    // "Iuno's Signature is Xiangli Yao's NEW BEST weapon" (100.0%, ahead of his own signature Verity's
    // Handle at 98.7%, "his second best choice") — a real meta shift, not a permanently-available-vs-
    // signature distinction (same pattern already applied to his overall #1 pick for Camellya/Jinhsi/
    // Changli/Sanhua). Swapped bestWeapon to Moongazer's Sigil, moving Verity's Handle into alt5.
    bestEchoes: ['Nightmare: Thundering Mephis', 'Void Thunder 5pc'], bestWeapon: "Moongazer's Sigil",
    weaponAlts: { alt5: ["Verity's Handle", 'Blazing Justice'], alt4: ['Aether Strike', 'Stonard'], alt3: ['Gauntlets of Night'] },
    teams: ['Xiangli Yao + Lynae + Mornye', 'Xiangli Yao + Yinlin + Verina'] },
  // Full audit 2026-08-17 against the source's live build page (URL is /the-shorekeeper, Chrome UA +
  // google.com referer + jsRender) and the source's character #1505 sheet. desc: title "Euphonic
  // Chrysalis" (the source) prepended and blurb rewritten from the source's own profile text to match the
  // roster's convention. skills/base stats/ascension/skill materials/bestEchoes/outro+lib buffs all
  // re-confirmed accurate. weaponAlts corrected: the source ranks only 4 total options for her (Signature +
  // 3 4★s, no other 5★ at all) — alt5 previously listed 'Cosmic Ripples' first despite it being an ATK%/
  // Basic-ATK-stacking stat-stick that doesn't fit a support who never attacks; reordered to lead with
  // Firstlight's Herald (Energy Regen main stat, matching her the source-stated 250% ER build target).
  // alt4 previously paired Variation with Call of the Abyss (85.1%) while skipping Rectifier#25 (87.2%,
  // the source's actual #2 and its named no-gacha pick) — swapped in.
  // desc rewritten 2026-08-31 with exact Forte resource economy and Liberation/Stellarealm timing, sourced
  // from the wiki/Shorekeeper/Combat (MediaWiki API action=parse, bypassing the
  // Combat page's own Cloudflare interstitial) cross-checked against the source's live kit page (Chrome UA +
  // google.com referer + jsRender). Prior desc had zero mention of the Collapsed Core/Empirical Data
  // resource economy or any exact numbers/caps/timing at all.
  'Shorekeeper': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Euphonic Chrysalis, guardian of the Black Shores — this title alone once defined her, but desires, bonds, and emotions, she only began to understand these things after meeting you. Spectro support/healer whose Forte Circuit (Astral Chord) runs on two capped resources: Collapsed Cores (cap 5 — every Basic ATK/Mid-air ATK/Dodge Counter hit grants 1; each auto-converts into a homing Flare Star Butterfly 6s after spawning, or instantly once a 6th would be generated) and Empirical Data (cap 5 — Basic ATK Stage 1/2/4 and Mid-air ATK each grant 1, Stage 3 grants 2; at 5/5, her next Heavy ATK becomes Illation or Mid-air ATK becomes Transmutation, consuming all 5 to instantly convert every pending Collapsed Core into a Butterfly). Resonance Skill Chaos Theory (16s CD) heals nearby allies and grants 20 Concerto Energy. Resonance Liberation End Loop costs 175 Energy (25s CD) and opens the Stellarealm for 30s, healing all allies in range every 3s (Outer stage); the first ally Intro Skill cast inside it upgrades it to Inner Stellarealm (team Crit Rate +0.01% per 0.2% of her Energy Regen, capped at +12.5%), and a 2nd ally Intro upgrades it to Supernal Stellarealm (team Crit DMG +0.01% per 0.1% of her Energy Regen, capped at +25%, on top of Inner\'s Crit Rate). Reaching Supernal also replaces her own next Intro Skill with the empowered Discernment (ends the Stellarealm immediately, heals, and lands a guaranteed-Crit HP-scaling nuke counted as Liberation DMG) — a cast-order dependency: she should be swapped in to trigger this only once Supernal is already up, since casting it early forfeits the rest of the Stellarealm\'s duration. Outro Binary Butterfly grants the incoming Resonator up to 5 free interrupt-recoveries and the whole nearby team +15% All DMG Amp for 30s, which persists through swaps.',
    skills: ['Origin Calculus', 'Chaos Theory', 'Astral Chord', 'End Loop'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Helix' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc'], bestWeapon: 'Stellar Symphony',
    // weaponAlts.alt5 corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was ["Firstlight's
    // Herald", 'Cosmic Ripples'] — confirmed against the full raw Best Weapons table text (user-provided,
    // matching this character's own dump exactly) that neither weapon appears anywhere in her real
    // ranked options; the source explicitly lists only 4 total (her signature + 3 4★s), no other 5★ at
    // all. Removed the alt5 key entirely rather than leaving stale/unsourced data — same "omit when no
    // real 5★ alt exists" convention already used for Aalto/other characters. alt4 (Variation,
    // Rectifier#25) already matched the source's own top-2 4★ ranking exactly — Call of the Abyss
    // (85.10%, #4 overall, "not a necessity") narrowly misses the 2-slot cutoff, same trimming
    // convention used elsewhere.
    weaponAlts: { alt4: ['Variation', 'Rectifier#25'], alt3: ['Rectifier of Night'] },
    teams: ['Jinhsi + Zhezhi + Shorekeeper', 'Carlotta + Zhezhi + Shorekeeper', 'Camellya + Roccia + Shorekeeper'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1603 sheet. desc: title "Sanguine Blossom" (the source) prepended and
  // blurb rewritten from the source's own profile text to match the roster's convention (previous desc was
  // a generic one-liner with no title, unlike the rest of the audited roster). skills/base stats/
  // ascension/skill materials/bestEchoes/selfBuffs all re-confirmed accurate. weaponAlts was entirely
  // missing — added: alt5 leads with Emerald Sentence (90.1%, the source's actual #2) plus Emerald of
  // Genesis, explicitly named "Best permanent option for Camellya" despite a slightly lower calc% than
  // Frostburn/Everbright Polestar; alt4 uses Feather Edge (77.8%, #1 4★) and Lumingloss (76.8%, #2 4★);
  // alt3 uses the standard starter Sword of Night, matching the convention used for other Sword users.
  'Camellya': { rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    desc: 'Sanguine Blossom, a Bloom Bearer of the Black Shores — free-spirited and dangerously charming, she roams Solaris in search of talent, immersing herself in the present and relishing its pleasures, unburdened by thoughts of the past or future. On-field Havoc Main DPS. Her Skill (Crimson Blossom) puts her into Blossom Mode, which replaces her Basic/Heavy/Dodge-Counter/Skill kit with the Vining Waltz combo; every hit of Normal ATK / Vining Waltz / Blazing Waltz / Vining Ronde / Dodge Counter Atonement / Crimson Blossom / Floral Ravage consumes Crimson Pistils at +150% Energy Regen Multiplier, and each 10 Pistils consumed recovers 4 Concerto Energy and grants 1 Crimson Bud (15s duration each, stacks to 10). Once Concerto Energy is fully charged and Ephemeral is off cooldown (25s CD), her Skill button is replaced by Ephemeral: it costs 70 Concerto Energy, deals Basic-ATK-type Havoc DMG, and puts her into Budding Mode — Sweet Dream raises Normal/Vining Waltz/Blazing Waltz/Vining Ronde/Atonement/Crimson Blossom/Floral Ravage DMG Multiplier by a flat 50%, PLUS +5% per Crimson Bud consumed on cast (up to +50% more at 10 stacks, so up to +100% total); while in Budding Mode she cannot gain new Crimson Buds and her Energy Regen Multiplier on those same hits drops to 0%. Budding Mode (15s) ends early if she is swapped off-field or all Crimson Pistils are consumed. Her Outro (Twining) deals 329.24% ATK Havoc DMG normally, but if Ephemeral was cast that rotation, Twining instead deals an ADDITIONAL 459.02% ATK — a strictly sequential Ephemeral-then-Outro conditional, not a flat bonus.',
    skills: ['Burgeoning', 'Valse of Bloom and Blight', 'Fervor Efflorescent', 'Vegetative Universe'],
    ascension: { boss: 'Topological Confinement', common: 'Whisperin Core', specialty: 'Nova' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Metallic Drip' },
    bestEchoes: ['Nightmare: Crownless', 'Havoc Eclipse 5pc'], bestWeapon: 'Red Spring',
    weaponAlts: { alt5: ['Emerald Sentence', 'Emerald of Genesis'], alt4: ['Feather Edge', 'Lumingloss'], alt3: ['Sword of Night'] },
    teams: ['Camellya + Roccia + Shorekeeper', 'Camellya + Sanhua + Verina'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1107 sheet. desc: title "Reshaping Dimensions" (the source) prepended and
  // blurb rewritten from the source's own profile text to match the roster's convention. skills/ascension/
  // skill materials/bestEchoes/selfBuffs all re-confirmed accurate. weaponAlts was entirely missing —
  // added: alt5 uses Phasic Homogenizer (93.5%) and Woodland Aria (86.2%), the source's #2/#3 non-signature
  // 5-stars; alt4 uses Undying Flame (75.8%, best 4★) and Pistols#26 (72.0%, named best F2P/no-gacha
  // option); alt3 uses the standard starter Pistols of Night, matching the convention used elsewhere.
  'Carlotta': { rarity: 5, element: 'Glacio', weapon: 'Pistols', role: 'Main DPS',
    // desc rewritten 2026-08-31 to exact-mechanic depth against the wiki/Carlotta/Combat
    // (Chrome/Windows UA + google.com referer + jsRender). Prior text was flavor + a vague "builds Moldable
    // Crystals and Substance" summary with no exact ammo counts, gain events, or enhanced-state gating.
    desc: 'Reshaping Dimensions, second daughter of the Montelli family and an art investor unbound by convention — she moves seamlessly through social circles and business transactions while quietly handling the family\'s unspeakable "troubles" in secret. On-field Glacio Main DPS built around two resources, both capped and both frozen while she is in Twilight Tango: Moldable Crystals (cap 6) are gained +3 each from Basic ATK Stage 2, Heavy Attack, Mid-air Customary Greetings, Intro Skill Wintertime Aria, Resonance Skill Art of Violence, or a successful Dodge; Substance (cap 120) is gained +30 from Intro Skill Wintertime Aria, +10 per Moldable Crystal consumed when casting Resonance Skill Chromatic Splendor or Basic ATK Necessary Measures (up to +60 for a full 6 crystals), and +10 (consuming 1 Moldable Crystal) on a Dodge Counter. Resonance Skill Art of Violence deals Glacio DMG and inflicts Dispersion (1.5s immobilize); pressing Skill again shortly after chains into Chromatic Splendor, which consumes ALL held Moldable Crystals for +10 Substance each — the Skill otherwise falls off cooldown if Chromatic Splendor is not cast or she is swapped off-field. At full 120 Substance she enters Final Bow: Resonance Liberation Era of New Wave, Death Knell, and Fatal Finale all gain +80% DMG Multiplier, an effect that ends the moment she is swapped off-field during Twilight Tango or when Twilight Tango itself ends. Her enhanced Heavy Attack, Imminent Oblivion, is separately gated behind Tinted Crystal, which activates on its own 22s cooldown: only when Substance is full AND Tinted Crystal is active can she HOLD Basic Attack (instead of tapping Heavy Attack for the always-available Containment Tactics) to consume all 120 Substance for Imminent Oblivion — Resonance Skill-flagged Glacio DMG that also cuts Art of Violence\'s cooldown by 6s and sends Tinted Crystal back on cooldown. Pressing Resonance Liberation Era of New Wave hits all nearby targets (Resonance Skill-flagged), inflicts Deconstruction (-18% target DEF ignored, 4s) and activates Twilight Tango (10s): the next 5 Basic Attack/Liberation presses are forced into 4× Death Knell (each stacking 1 of max-4 Meta Vector) then, on the 5th press with all 4 Meta Vectors banked, an automatic Fatal Finale that ends Twilight Tango and wipes Substance to 0 — Necessary Measures, Containment Tactics, and Imminent Oblivion cannot be cast while Twilight Tango is active.',
    skills: ['Silent Execution', 'Art of Violence', 'Era of New Wave', 'Lethal Repertoire'],
    ascension: { boss: 'Platinum Core', common: 'Polygon Core', specialty: 'Sword Acorus' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Phlogiston' },
    bestEchoes: ['Sentry Construct', 'Frosty Resolve 5pc'], bestWeapon: 'The Last Dance',
    weaponAlts: { alt5: ['Phasic Homogenizer', 'Woodland Aria'], alt4: ['Undying Flame', 'Pistols#26'], alt3: ['Pistols of Night'] },
    teams: ['Carlotta + Zhezhi + Shorekeeper', 'Carlotta + Zhezhi + Buling'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1606 sheet. desc: title "Stage in the Box" (the source) prepended and
  // blurb rewritten to match the roster's convention (previous desc wrongly described her as dealing
  // Havoc DMG "through Coordinated Attacks with Pero" — Pero is her companion/pet but her kit has no
  // Coordinated Attack mechanic at all; corrected to her real Forte Circuit Beyond Imagination combo).
  // skills/ascension/skill materials/bestEchoes all re-confirmed accurate. weaponAlts was entirely
  // missing — added: alt5 uses Solsworn Ciphers (90.0%) and Blazing Justice (88.2%), the source's #2/#3
  // non-signature 5-stars; alt4 uses Aether Strike (72.9%) and Celestial Spiral (72.6%), the top two
  // 4-stars; alt3 uses the standard starter Gauntlets of Night, matching the convention used elsewhere.
  // desc rewritten 2026-08-31 against the wiki/Roccia/Combat (Chrome/Windows UA +
  // google.com referer + jsRender, 2 attempts to clear Cloudflare interstitial) with exact Forte
  // ("Imagination") resource economy — this was previously flavor text with zero real numbers.
  'Roccia': { rarity: 5, element: 'Havoc', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Stage in the Box, assistant, prop master, and improv comedian of the Troupe of Fools — always there to make sure the Troupe is at the ready, carrying a Magic Box that appears to hold the world, or perhaps a world she recreated inside it. Havoc sub-DPS/buffer built around her Imagination gauge (caps at 300): Skill Acrobatic Trick and Intro Pero, Help each restore a flat +100 Imagination (landing Basic Attack hits also restore some, exact rate not published by source — TODO: verify); Acrobatic Trick additionally pulls enemies in, launches Roccia into mid-air, and activates Beyond Imagination, a state she only exits by landing (going non-airborne) or being switched off the field. While in Beyond Imagination with ≥100 Imagination, pressing Basic Attack spends exactly 100 Imagination per press to chain up to 3 Real Fantasy bounces (counted as Heavy Attack DMG, 322.08%/339.97%/357.86% at Lv.10) — landing after Stage 1 or Stage 2 with over 100 Imagination remaining automatically re-launches her into Beyond Imagination, so a full 300-Imagination bar covers exactly 3 bounces. Casting Liberation Commedia Improvviso! the instant the 3rd bounce lands cancels its landing recovery — a single-target hit counted as Heavy Attack DMG (278.34%×3 at Lv.10) that also grants the whole team a flat ATK buff scaling with Roccia\'s own Crit Rate (+1 ATK per 0.1% Crit Rate over 50%, capped at +200 ATK once Crit Rate hits 70%+, lasting 30s). Swapping out fires Outro Applause, Please! automatically: +20% Havoc DMG Amp and +25% Basic ATK DMG Amp to the incoming Resonator for 14s or until they are swapped out, and — via Inherent Skill Super Attractive Magic Box — that Resonator\'s Utility button is replaced with Roccia\'s own Magic Box (100 flat Havoc pull-in DMG, counted as Echo Skill Utility DMG) for the same 14s/until-swap window — the best group-pull utility in the game via her Skill and transferable Magic Box.',
    skills: ['Pero, Easy', 'Acrobatic Trick', 'Commedia Improvviso!', 'A Prop Master Prepares'],
    ascension: { boss: 'Cleansing Conch', common: 'Tidal Residuum', specialty: 'Firecracker Jewelweed' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Cadence' },
    bestEchoes: ['Nightmare: Impermanence Heron', 'Midnight Veil 5pc'], bestWeapon: 'Tragicomedy',
    weaponAlts: { alt5: ['Solsworn Ciphers', 'Blazing Justice'], alt4: ['Aether Strike', 'Celestial Spiral'], alt3: ['Gauntlets of Night'] },
    teams: ['Roccia + Camellya + Shorekeeper', 'Roccia + Phrolova + Cantarella'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1506 sheet. desc: title "Graceful Luminescence" (the source) prepended
  // and blurb rewritten — previous desc only described her Confession/support mode ("applies Frazzle...
  // enabling Spectro DPS teammates"), but the source frames her as equally viable as a Main DPS in
  // Absolution mode (tier T1.5 DPS vs T2 Hybrid, DPS is actually rated higher), and she has no
  // "Resonance Skill card summons" mechanic at all — corrected to cover both Forte Circuit states
  // (Absolution self-DPS / Confession Frazzle-application support). skills/ascension/skill materials/
  // bestEchoes/outroBuffs/debuffs all re-confirmed accurate. weaponAlts was entirely missing — added:
  // alt5 uses Lethean Elegy (98.1%) and Stringmaster (97.5%), the source's #2/#3 non-signature 5-stars;
  // alt4 uses Augment (86.1%, best 4★) and Ocean's Gift (78.8%, #2 4★); alt3 uses the standard starter
  // Rectifier of Night, matching the convention used elsewhere.
  'Phoebe': { rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Sub DPS',
    // desc rewritten 2026-08-31 with exact Forte economy, verified verbatim against
    // the wiki/Phoebe/Combat's "Forte" section (Chrome UA + google.com referer +
    // jsRender): Prayer caps at 120 (+5/s passive, ~24s 0→full); Divine Voice caps at 60, refilled to 60
    // by Absolution Litany/Utter Confession; the two modes are mutually exclusive and cannot coexist;
    // Divine Voice reaching 0 does NOT auto-exit the mode (it persists until manually swapped); Starflash
    // costs 30 Divine Voice base, 15 in Absolution (exactly 4 casts per full bar) with +256% DMG Amp vs
    // Frazzle targets, or applies 5 Frazzle stacks per cast in Confession at the base 30 cost. Also
    // corrects a prior implication of a Jinhsi-style 2-stage cast-order Liberation chain — Phoebe has no
    // such mechanic; Dawn of Enlightenment is a single non-chained cast whose DMG Multiplier is simply
    // mode-gated (+255% in Absolution; unchanged but applies 8 Frazzle stacks in Confession).
    desc: 'Graceful Luminescence, Acolyte of the Order of the Deep — a young woman of quiet devotion who fulfills her duties with unwavering diligence, her prayers offering comfort and peace like the light she carries. Dual-mode Spectro Hybrid whose Prayer gauge (cap 120, +5/s passive regen, ~24s to fill) auto-fills with no action needed; at full Prayer, holding Basic ATK casts Absolution Litany (entering self-buffed "Absolution" Main DPS mode) or holding Skill casts Utter Confession (entering "Confession" Frazzle-support mode) — the two are mutually exclusive, entering one ends the other, and each refills her separate Divine Voice gauge (cap 60) which fuels her empowered Heavy ATK Starflash. Starflash costs 30 Divine Voice normally, only 15 in Absolution (letting exactly 4 casts drain a full bar) with +256% DMG Amp against Spectro-Frazzled targets, or costs the base 30 in Confession while applying 5 Frazzle stacks per cast; notably, Divine Voice hitting 0 does not force an exit from either mode — it persists until manually swapped. Her Liberation, Dawn of Enlightenment, is a single non-chained cast (no Jinhsi-style timed cast-order window) whose DMG Multiplier is simply mode-gated: +255% in Absolution, or unchanged (but applying 8 Frazzle stacks) in Confession. Confession Phoebe is built specifically to empower Zani, her only current Frazzle-DPS partner, via her Outro\'s Silent Prayer buff.',
    skills: ['O Come Divine Light', 'To Where Light Shines', 'Dawn of Enlightenment', 'Radiant Invocation'],
    ascension: { boss: 'Cleansing Conch', common: 'Whisperin Core', specialty: 'Firecracker Jewelweed' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Helix' },
    bestEchoes: ['Capitaneus', 'Eternal Radiance 5pc'], bestWeapon: 'Luminous Hymn',
    weaponAlts: { alt5: ['Lethean Elegy', 'Stringmaster'], alt4: ['Augment', "Ocean's Gift"], alt3: ['Rectifier of Night'] },
    teams: ['Phoebe + Zani + Shorekeeper', 'Phoebe + Rover: Spectro + Verina'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1206 sheet. desc: title "Flamebound Compass" (the source) prepended and
  // blurb rewritten to match the roster's convention. skills/ascension/skill materials/bestEchoes all
  // re-confirmed accurate. weaponAlts was entirely missing — added: alt5 uses Laser Shearer (77.2%) and
  // Bloodpact's Pledge (75.1%, F2P-obtainable), the source's #2/#3 non-signature 5-stars; alt4 uses Overture
  // (Energy Regen main stat, matching Brant's extreme ER requirement — the source lists no 4★ options for
  // him at all) and Commando of Conviction as a no-gacha baseline; alt3 uses the standard starter Sword
  // of Night.
  'Brant': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    // desc rewritten 2026-08-31 against the wiki/Brant/Combat (Chrome/Windows UA +
    // google.com referer + jsRender, load+9s wait): added exact Forte ("Bravo") economy, Aflame
    // enter/exit + duration, and Returned from Ashes' exact shield duration — none of this was in the
    // prior flavor-text-only desc.
    desc: 'Flamebound Compass, captain of Rinascita\'s Troupe of Fools — a free spirit and romantic, unpredictable and full of life, the beating heart of the troupe who slips into countless roles on stage but is unwaveringly genuine offstage. Fusion Main DPS/Hybrid built around Bravo, a 0-100 Forte gauge filled by Basic ATK, Mid-air Attack, Intro Skill, and Resonance Skill hits, which passively heals the whole team once at each of 25/50/75/100 Bravo (Waves of Acclaims). At 100 Bravo his Skill button becomes Returned from Ashes: dumps all 100 Bravo for a massive Fusion hit (counted as Basic ATK DMG) plus a team shield lasting 30s. Casting Liberation (To the Horizon) heals the team and enters Aflame for 12s: Bravo gain from Basic ATK and Resonance Skill hits (NOT Intro) is doubled, and his passive ATK-from-Energy-Regen conversion (Theatrical Moment, +12 ATK per 1% ER over 150%, capped +1,560 ATK) is replaced by the stronger "My" Moment (+20 ATK per 1% ER over 150%, capped +2,600 ATK) for the duration; casting Returned from Ashes while Aflame is active ends Aflame once the cast finishes. His Outro The Course is Set! grants the incoming Resonator +20% Fusion DMG and +25% Resonance Skill DMG for 14s, or until that Resonator is swapped out, whichever comes first — almost his entire kit is executed airborne, dodging most enemy attacks for free.',
    skills: ['Captain\'s Rhapsody', 'Anchors Aweigh!', 'To the Horizon', 'Ocean Odyssey'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Metallic Drip' },
    bestEchoes: ['Dragon of Dirge', 'Tidebreaking Courage 5pc'], bestWeapon: 'Unflickering Valor',
    // weaponAlts fixed 2026-09-02 against a real browser snapshot: alt4 named 'Overture' and
    // 'Commando of Conviction', neither of which appears anywhere in the source's Best Weapons list —
    // that list is exhaustive (5 weapons total: signature + 4 alts, ending right where the Echo section
    // starts) and contains no 4-star weapon at all. The 2 real alts missing from alt5 (Red Spring
    // 73.1%, Camellya's 5★ signature; Emerald of Genesis 71.3%, a standard 5★, both confirmed 5★ via
    // this file's own convention elsewhere) are moved there instead; alt4 cleared rather than filled
    // with unsourced weapons.
    weaponAlts: { alt5: ['Laser Shearer', "Bloodpact's Pledge", 'Red Spring', 'Emerald of Genesis'], alt4: [], alt3: ['Sword of Night'] },
    teams: ['Brant + Lupa + Changli', 'Brant + Changli + Shorekeeper'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1607 sheet. desc: title "Sea of Dreams" (the source) prepended and blurb
  // rewritten to match the roster's convention. organization uses 'Fisalia Family' (no leading "The")
  // to match elementVisuals.js's FACTION_ICONS key exactly, avoiding the mismatch previously found on Carlotta.
  // skills/ascension/skill materials/bestEchoes all re-confirmed accurate. weaponAlts was entirely
  // missing — added: alt5 uses Rime-Draped Sprouts (87.0%) and Stringmaster (85.0%), the source's #2/#3
  // non-signature 5-stars; alt4 uses Radiant Dawn (77.9%, best 4★) and Augment (77.8%, #2 4★); alt3 uses
  // the standard starter Rectifier of Night, matching the convention used elsewhere.
  'Cantarella': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Sub DPS',
    // desc rewritten 2026-08-31 against the wiki/Cantarella/Combat (Chrome/Windows UA +
    // google.com referer + jsRender, 2 attempts needed past a Cloudflare interstitial) and cross-checked against
    // the source/wuthering-waves/characters/cantarella's Kit/Gameplay tabs. Prior desc only gestured at "builds
    // Trance through Intro/Skill/Liberation" with no exact economy — the real numbers: Trance caps at 5, gained
    // +1 on Intro cast, +1 on Basic ATK Stage 3 hit, +1 on Graceful Step (Skill) cast, +3 on Flowing Suffocation
    // (Liberation) cast (this overcaps by 1 from a 2-Trance start, deliberately, to hit the 5-cap needed before
    // Delusive Dive), and +1 every 5s while swimming. Mirage (entered by consuming all 5 Trance via the enhanced
    // Heavy ATK "Delusive Dive") lasts a hard 8s and also ends early the instant Trance is depleted inside it —
    // it is not simply "8s, full stop". Inside Mirage, Basic ATK is replaced by 3-hit "Phantom Sting" and each
    // landed hit grants 1 Shiver (cap 3, also gainable off Abysmal Vortex/Shadowy Sweep hits); at 3 Shiver, Skill
    // is replaced by the burst nuke "Perception Drain", which also heals the whole team and re-applies Hazy Dream.
    // Abyssal Rebirth (entered on Intro cast, 25s duration, re-triggerable every 25s) is the real Concerto-Energy
    // engine: any teammate's Echo Skill cast (capped at 6 procs per 25s window, no duplicate echo name twice)
    // grants Cantarella 6 Concerto Energy — critical since her kit's own Resonance Energy generation is very low
    // relative to her 125 Energy cost, so this is what actually lets Flowing Suffocation come off cooldown per
    // rotation. Outro "Gentle Tentacles" grants the incoming Resonator +20% Havoc DMG and +25% Resonance Skill
    // DMG for 14s, and that buff is forfeited early the moment that Resonator is swapped out again.
    desc: 'Sea of Dreams, current head of the Fisalia Family, Cantarella the Bane — a mysterious noblewoman whose beauty is as captivating as it is perilous, residing in a crown-like castle where illusory dreams flow like streams, meticulously spun by her own hands. Havoc Hybrid who builds Trance (max 5: +1 Intro, +1 Basic ATK Stage 3, +1 Graceful Step, +3 Flowing Suffocation) and consumes it all via Heavy ATK "Delusive Dive" to enter Mirage (8s, or until Trance is depleted, whichever first) — unlocking enhanced "Phantom Sting" Basic Attacks that build Shiver (max 3) toward the burst nuke "Perception Drain", which also heals the team. Deals off-field Havoc DMG through Dreamweaver Coordinated Attacks summoned by her Liberation, sustains Concerto Energy via Abyssal Rebirth (+6 Energy per teammate Echo Skill cast, up to 6 times per 25s window after Intro), and buffs the incoming Resonator\'s Havoc DMG +20% and Resonance Skill DMG +25% for 14s (forfeited on swap) via her Outro "Gentle Tentacles".',
    skills: ['Illusion Collapse', 'Dance with Shadows', 'Beneath the Sea', 'Between Illusion and Reality'],
    ascension: { boss: 'Cleansing Conch', common: 'Polygon Core', specialty: 'Seaside Cendrelis' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Helix' },
    // teams corrected 2026-09-03 against a fresh the source dump: 'Cantarella + Camellya + Shorekeeper' —
    // this source explicitly says Camellya deals most of her damage via Basic ATKs (which Cantarella's
    // Outro doesn't amplify) and names Danjin/Sanhua/Roccia as all clearly better Camellya buffers than
    // Cantarella. Replaced with Jinhsi, one of only two Skill-DMG-focused DPS this source names as an
    // actual (if outclassed-by-Zhezhi/Yinlin) niche partner for her.
    bestEchoes: ['Lorelei', 'Midnight Veil 5pc'], bestWeapon: 'Whispers of Sirens',
    weaponAlts: { alt5: ['Rime-Draped Sprouts', 'Stringmaster'], alt4: ['Radiant Dawn', 'Augment'], alt3: ['Rectifier of Night'] },
    teams: ['Cantarella + Phrolova + Qiuyuan', 'Cantarella + Jinhsi + Shorekeeper'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1507 sheet. desc: title "Scorched Radiance" (the source) prepended and
  // blurb rewritten — the previous desc said she "builds Frazzle stacks via Resonance Skill counters and
  // Heavy Attacks", but Zani cannot apply Spectro Frazzle herself at all; she instantly converts
  // teammates' Frazzle into her own Heliacal Ember/Blaze resource, which is a meaningfully different
  // (and team-dependent) mechanic. organization uses 'Montelli Family' (no leading "The") to match
  // elementVisuals.js's FACTION_ICONS key, avoiding the mismatch previously found on Carlotta. skills/ascension/
  // skill materials/bestEchoes/outroBuffs/selfBuffs all re-confirmed accurate. weaponAlts was entirely
  // missing — added: alt5 uses Tragicomedy (93.7%) and Verity's Handle (85.0%), the source's #2/#3
  // non-signature 5-stars; alt4 uses Aether Strike (72.6%, best 4★) and Celestial Spiral (69.3%, #2 4★);
  // alt3 uses the standard starter Gauntlets of Night.
  // desc rewritten 2026-08-31 via the wiki/Zani/Combat (Instructions/Forte/Resonance
  // Chain sections) cross-checked against the source/wuthering-waves/characters/zani "Kit" tab (both live,
  // Chrome UA + google.com referer + jsRender, loaded 2026-08-31) — exact Forte economy, exact Inferno Mode
  // entry/exit gate and exact cast-order/timing dependencies added; previous desc was accurate at a high level
  // but had no real numbers. Confirmed: Redundant Energy caps at 100 (gained from Basic ATK hits, Intro Skill
  // Immediate Execution, casting Standard Defense Protocol, and casting Pinpoint Strike); once full, Skill is
  // replaced by Crisis Response Protocol — hold Skill to enter interruption-immune Ready Stance (Inherent Skill
  // Fear No Pain also cuts DMG taken -40% during it), then EITHER release unhit for Targeted Action OR (if hit
  // during the hold) it auto-parries into Forcible Riposte instead — both consume all Redundant Energy, apply a
  // Heliacal Ember stack, grant 10 Blaze, and start Sunburst (+20% Spectro Frazzle DMG for 14s). Liberation
  // Rekindle (125 Energy, 25s CD) grants 50 Blaze immediately, raises the Blaze cap 100→150, gives Basic ATK
  // +25% DMG Multiplier, and opens Inferno Mode for up to 20s. At ≥30 Blaze in Inferno Mode, Basic ATK becomes
  // the Heavy Slash Daybreak→Dawning→Nightfall Forte string (each flagged as both Heavy ATK and Spectro
  // Frazzle DMG; Nightfall alone consumes up to 40 Blaze, +9.95%/Blaze at max level) — or, if hit while holding
  // the pre-Daybreak Ready Stance, it auto-parries into Heavy Slash Lightsmash instead (same DMG as Dawning).
  // Inferno Mode has a genuine forfeit-style exit gate: the 2nd Liberation "The Last Stand" (which ends Inferno
  // Mode) only becomes castable once Blaze drops below 30 OR 8s have elapsed in Inferno Mode, whichever comes
  // first — stalling past that point wastes Inferno uptime without adding DPS, since Last Stand doesn\'t scale
  // with a fresh Rekindle. Zani cannot apply Spectro Frazzle herself at all: her Forte Circuit instantly
  // converts any teammate-applied Spectro Frazzle stacks into an equal number of Heliacal Embers (60-stack cap,
  // 6s duration each) and grants 5 Blaze per stack converted, making her fully dependent on a Frazzle-applying
  // teammate (Phoebe by far the most common pairing).
  'Zani': { rarity: 5, element: 'Spectro', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Scorched Radiance, a member of Averardo Vault\'s security team and its longtime "Best Employee" — she has plenty of plans for her free time, but for now her biggest mission is simple: clocking out on time. On-field Spectro Main DPS who converts teammates\' Spectro Frazzle into her own Heliacal Ember and Blaze the instant it lands, builds up to 100 Redundant Energy through Basic Attacks/Skill casts to unlock a parry-capable enhanced Skill (Targeted Action / Forcible Riposte), then dumps everything into an up-to-20s Inferno Mode via her Liberation Rekindle for a Heavy Slash: Daybreak→Dawning→Nightfall combo string flagged as both Heavy Attack and Spectro Frazzle DMG — Inferno Mode\'s 2nd Liberation exit (The Last Stand) only unlocks once Blaze drops below 30 or 8s pass, whichever is first — entirely dependent on a teammate applying Frazzle for her to convert.',
    skills: ['Routine Negotiation', 'Restless Watch', 'Between Dawn and Dusk', 'There Will Be A Light'],
    ascension: { boss: 'Platinum Core', common: 'Polygon Core', specialty: 'Sword Acorus' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Cadence' },
    bestEchoes: ['Capitaneus', 'Eternal Radiance 5pc'], bestWeapon: 'Blazing Justice',
    weaponAlts: { alt5: ['Tragicomedy', "Verity's Handle"], alt4: ['Aether Strike', 'Celestial Spiral'], alt3: ['Gauntlets of Night'] },
    // teams corrected 2026-09-03 against a real browser snapshot: the source's own Synergies
    // text is explicit that "Phoebe + Spectro Rover is the best Zani team when fully optimized" (with
    // Shorekeeper named separately as "the best option for Zani teams WITHOUT quickswap") — swapped
    // the 2nd slot's ordering to lead with the source's own "best" framing.
    teams: ['Zani + Phoebe + Rover: Spectro', 'Zani + Phoebe + Shorekeeper'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1407 sheet. desc: title "Woven Melodies" (the source) prepended and blurb
  // rewritten — the previous desc said she "applies Erosion via Coordinated Attacks", but Ciaccona has
  // no Coordinated Attack mechanic at all; her off-field Erosion application comes from her Ensemble
  // Sylph clones and her Liberation's lingering Recital state instead. skills/ascension/skill materials/
  // bestEchoes/outroBuffs/libBuffs/weaponBuffs/debuffs all re-confirmed accurate (already corrected in a
  // prior 2026-08-16 pass). weaponAlts was entirely missing — added: alt5 uses Phasic Homogenizer (86.9%)
  // and Lux & Umbra (83.0%), the source's #2/#3 non-signature 5-stars; alt4 uses Romance in Farewell (69.9%,
  // the source's named best 4★/F2P no-gacha pick) and Solar Flame; alt3 uses the standard starter Pistols
  // of Night.
  // Phase A audit 2026-09-04 against a fresh source dump (`Data dump/Ciaccona/Ciaccona.md`):
  // 2 bugs fixed here. (1) bestEchoes main-slot echo was 'Reminiscence: Fleurdelys' — the dump's own
  // Best Echo Sets section explicitly names Nightmare: Kelpie as "best main-slot pick by a small margin
  // over Reminiscence: Fleurdelys (use Fleurdelys instead if running Lux & Umbra)"; her stored
  // `bestWeapon` is Woodland Aria, not Lux & Umbra, so the default main-slot pick should be Nightmare:
  // Kelpie. Corrected. (2) weaponAlts.alt4 included 'Solar Flame' — a real 4★ Pistols weapon in
  // weapons.js, but NOT named anywhere in this character's own dump; the dump names exactly one 4★
  // ('Romance in Farewell', its explicit F2P/no-gacha pick) and 3 additional 5★s (Spectrum Blaster, The
  // Last Dance, Static Mist) beyond the alt5 top-2 already listed, none of which is Solar Flame. Stale/
  // fabricated entry with no basis in the source — removed, matching the single-entry alt4 pattern
  // already used elsewhere (e.g. Cartethyia's alt4: ['Feather Edge']) when the dump names only one 4★.
  'Ciaccona': { rarity: 5, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Woven Melodies, a wandering bard from Rinascita — she sings not only for the Divinity, but also for the common folk, recording stories along her journeys and turning them into songs that evoke laughter, emotion, and tears in both the storytellers and the audience. Aero Hybrid who chains quick Basic ATK/Mid-air cancels to summon near-permanent Ensemble Sylph clones (Solo Concert: team Aero DMG Amp), fires the Forte Heavy Quadruple Downbeat, then enters an extended Recital state via her Liberation to apply repeating waves of Aero Erosion or Spectro Frazzle even off-field — buffs the incoming Resonator\'s Aero Erosion DMG through her Outro.',
    skills: ['Quadruple Time Steps', 'Harmonic Allegro', 'Singer\'s Triple Cadenza', 'Symphony of Wind and Verse'],
    ascension: { boss: 'Blazing Bone', common: 'Tidal Residuum', specialty: 'Golden Fleece' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Phlogiston' },
    bestEchoes: ['Nightmare: Kelpie', 'Gusts of Welkin 5pc'], bestWeapon: 'Woodland Aria',
    weaponAlts: { alt5: ['Phasic Homogenizer', 'Lux & Umbra'], alt4: ['Romance in Farewell'], alt3: ['Pistols of Night'] },
    teams: ['Ciaccona + Cartethyia + Rover: Aero', 'Ciaccona + Cartethyia + Chisa'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1409 sheet. desc: title "Feathered Tempest" (the source) prepended and
  // blurb rewritten to match the roster's convention. skills/ascension/skill materials/bestEchoes/
  // outroBuffs/debuffs/weaponBuffs all re-confirmed accurate. weaponAlts was entirely missing — added:
  // alt5 uses Red Spring (79.5%) and Blazing Brilliance (77.0%), the source's #2/#3 non-signature 5-stars;
  // alt4 uses Feather Edge (76.3%, the only 4★ the source lists for her); alt3 uses Guardian Sword (72.3%,
  // the source's own explicit "last resort" pick — the only other Sword in the game with an HP% main stat,
  // matching her HP-scaling kit, so used here instead of the generic starter Sword of Night).
  'Cartethyia': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Main DPS',
    // desc rewritten 2026-08-31 against the wiki/Cartethyia/Combat's "Forte" section for
    // exact resource economy (trigger events, amounts, caps), enhanced-state entry/exit conditions and duration,
    // and the Skill1→Skill2 cast-order dependency inside Manifest — the prior desc only gestured at "builds Sword
    // Shadows" / "consumes stacked Aero Erosion for bonus DMG" with no numbers at all.
    desc: 'Feathered Tempest, a wandering knight who travels across Rinascita — formerly known as the Blessed Maiden, the vessel of Divinity, and the Queen of Gale and Tide under the name Fleurdelys, she is now simply free and unfettered. HP-scaling on-field Aero Main DPS. As Cartethyia, her Basic Attack Stage 4, Heavy Attack, Intro Skill, and Resonance Skill each summon a distinct Sword Shadow (Sword of Divinity / Sword of Discord ×2 sources / Sword of Virtue — max 1 of each type up, 20s each); her Mid-air Attack recalls every Sword Shadow currently up and converts them into the Heart of Virtue / Mandate of Divinity / Power of Discord buffs Fleurdelys carries for that transformation. Resonance Liberation - A Knight\'s Heartfelt Prayers costs 50% of her current Max HP (25% at Resonance Chain S5; free if already below 50% HP) and transforms her into Fleurdelys (Manifest) for 12s, clearing all Conviction to 0 on entry — ending Manifest does not clear Resonance Energy. As Fleurdelys, every attack restores Conviction; her Resonance Skill is a strict 2-cast chain — Sword to Answer Waves\' Call must be followed by May Tempest Break the Tides within a short, unspecified follow-up window or the Skill drops to its normal 14s cooldown, forfeiting the second cast for that Manifest window. At exactly 120 Conviction, Resonance Liberation is replaced by Blade of Howling Squall: it clears all Conviction, ends Manifest, restores 50% Max HP, deals 13.12%×7 Max HP DMG, and strips every stacked Aero Erosion point from the target, each stack removed Amplifying DMG taken by the target +20% (capped at 5 stacks, +100% total). Her Outro Wind\'s Divine Blessing then buffs the incoming Resonator\'s (not her own) Aero DMG against Negative-Status targets by +17.5% for 20s.',
    skills: ['Sword to Carve My Forms', 'Sword to Bear Their Names', 'A Knight\'s Heartfelt Prayers', 'Tempest'],
    ascension: { boss: 'Unfading Glory', common: 'Tidal Residuum', specialty: 'Bamboo Iris' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Metallic Drip' },
    bestEchoes: ['Reminiscence: Fleurdelys', 'Windward Pilgrimage 5pc'], bestWeapon: "Defier's Thorn",
    weaponAlts: { alt5: ['Red Spring', 'Blazing Brilliance'], alt4: ['Feather Edge'], alt3: ['Guardian Sword'] },
    teams: ['Cartethyia + Ciaccona + Rover: Aero', 'Cartethyia + Ciaccona + Chisa'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1207 sheet. desc: title "Howling Flame" (the source) prepended and blurb
  // rewritten — the previous desc said she "shreds enemy Fusion RES" as if unconditional, but her Glory
  // RES-ignore only ramps up with more Fusion teammates present (3%/9%/15%), and she's a team buffer
  // first (the source files her under "Hybrid", not Sub DPS). skills/ascension/skill materials/bestEchoes/
  // outroBuffs/libBuffs/selfBuffs/weaponBuffs/debuffs all re-confirmed accurate (already corrected in a
  // prior 2026-08-16 pass). weaponAlts was entirely missing — added: alt5 uses Ages of Harvest (87.8%)
  // and Kumokiri (87.0%), the source's #2/#3 non-signature 5-stars; alt4 uses Waning Redshift (75.0%, best
  // 4★) and Aureate Zenith (74.8%, #2 4★); alt3 uses the standard starter Broadblade of Night.
  'Lupa': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Howling Flame, a Gladiator of Septimont and a radiant star of the arena — fiery and straightforward, Lupa lives like a wild lone wolf, and as long as she can savor the adrenaline rush of battle, she doesn\'t mind if that same fire ends up consuming her whole. Fusion Hybrid buffer who dumps her Liberation Fire-Kissed Glory immediately to grant the whole team Pack Hunt (ATK Amp, further boosted by teammates\' Intro Skills) and Glory (Fusion RES ignore that scales with Fusion teammate count), builds Wolfaith through Heavy/Mid-air Attacks toward her Forte finisher Dance With the Wolf, then buffs the incoming Resonator\'s Fusion and Basic ATK DMG through her Outro — built around powering mono-Fusion teams like Changli + Brant + Lupa.',
    skills: ['Flaming Star', 'Shewolf\'s Hunt', 'Fire-Kissed Glory', 'Ignis Lupa'],
    ascension: { boss: 'Unfading Glory', common: 'Howler Core', specialty: 'Bloodleaf Viburnum' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Waveworn Residue' },
    bestEchoes: ['Lioness of Glory', 'Flaming Clawprint 5pc'], bestWeapon: 'Wildfire Mark',
    weaponAlts: { alt5: ['Ages of Harvest', 'Kumokiri'], alt4: ['Waning Redshift', 'Aureate Zenith'], alt3: ['Broadblade of Night'] },
    teams: ['Lupa + Brant + Changli', 'Lupa + Aemeath + Mornye'] },
  // Full audit 2026-08-17 against the source's live build page (Chrome UA + google.com referer + jsRender)
  // and the source's character #1608 sheet. desc: title "Symphony of Beyond" (the source) prepended and
  // blurb rewritten — the previous desc wrongly said she "summons Hecate via Echo Skill"; Hecate is
  // actually summoned by her Resonance Liberation (entering Maestro state) — Echo Skill casts merely
  // trigger extra Hecate attacks while Maestro is already active. organization uses 'Fractsidus' (no
  // leading "The") to match elementVisuals.js's FACTION_ICONS key exactly, same fix applied to Carlotta/Zani.
  // skills/ascension/skill materials/bestEchoes/outroBuffs/selfBuffs all re-confirmed accurate (already
  // corrected in a prior 2026-08-16 pass). weaponAlts was entirely missing — added: alt5 uses
  // Stringmaster (82.0%) and Whispers of Sirens (80.2%), the source's #2/#3 non-signature 5-stars; alt4
  // uses Radiant Dawn (66.9%, best 4★) and Augment (64.9%, #2 4★); alt3 uses the standard starter
  // Rectifier of Night.
  'Phrolova': { rarity: 5, element: 'Havoc', weapon: 'Rectifier', role: 'Main DPS',
    // desc rewritten 2026-08-31 to exact Forte economy/enhanced-state mechanics via
    // the wiki/Phrolova/Combat, cross-checked the source/character/1608: previous
    // blurb only vaguely described "builds Volatile Notes through combos" — added the exact trigger events
    // (Strings from Basic ATK Stage 3/Movement of Fate and Finality, Winds from Skill/Murmurs in a Haunting
    // Dream), the exact 6-Note/Compose-state/not-Resolving-Chord gate on Scarlet Coda, the Compose state's
    // fixed 25s auto-trigger cadence (independent of her actions — a timing detail missing before), the
    // 0-Resonance-Energy/Resolving-Chord-only gate on her Liberation, the exact 24s Maestro duration and
    // +120% self ATK, the Enhanced Attack-Hecate trigger cap (10 per Maestro window, 1 per unique Echo
    // name) which was entirely absent, and the Outro's exact "ends if swapped out" forfeit condition plus
    // its Maestro-only 2-bonus-attack clause (previously stated with no forfeit/conditionality at all).
    desc: 'Symphony of Beyond, a Fractsidus Overseer walking the fine line between life and death — an uncanny, deadly conductor whose silent wave of the baton is enough to attune the very frequencies of being and conduct the symphonies of "souls," her music able to sculpt a better world or just as easily summon a legion to wreak havoc. Havoc Main DPS who alternates Basic ATK Stage 3 and Skill casts to enter/exit Reincarnate, banking up to 6 Volatile Notes (Strings from Basic ATK Stage 3 or its Forte follow-up Movement of Fate and Finality; Winds from Skill or its Forte follow-up Murmurs in a Haunting Dream). With 6 Notes stacked, outside Resolving Chord, and in the Compose state (auto-triggers on a fixed 25s cadence, independent of her own actions), her Heavy Attack is replaced by Scarlet Coda — a Skill-type nuke whose DMG Multiplier scales with stacked Aftersound (cap 24 stacks) — which activates Resolving Chord and unlocks her Liberation. Waltz of Forsaken Depths costs no Resonance Energy (her max is 0) and is only castable during Resolving Chord; casting it ends Resolving Chord and opens a 24s Maestro state (+120% self ATK) in which her Volatile Notes are played out in turn (4s each), giving Hecate\'s off-field Enhanced Attack the matching Strings/Winds/Cadenza effect — Hecate auto-attacks off-field and gains an Enhanced Attack whenever any teammate casts an Echo Skill, capped at 10 such triggers per Maestro window (1 per unique Echo of the same name). Her Outro (Unfinished Piece) grants the incoming Resonator +20% Havoc DMG Amp and +25% Heavy Attack DMG Amp for 14s, ending immediately if they are swapped out — and if cast while she is still in Maestro state, Hecate additionally fires 2 bonus Enhanced Attacks off-field before that same Maestro window ends.',
    skills: ['Movement of Life and Death', 'Whispers in a Fleeting Dream', 'Waltz of Forsaken Depths', 'Rhapsody of a New World'],
    ascension: { boss: 'Truth in Lies', common: 'Polygon Core', specialty: 'Afterlife' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Helix' },
    bestEchoes: ['Nightmare: Hecate', 'Dream of the Lost 3pc + Havoc Eclipse 2pc'], bestWeapon: 'Lethean Elegy',
    weaponAlts: { alt5: ['Stringmaster', 'Whispers of Sirens'], alt4: ['Radiant Dawn', 'Augment'], alt3: ['Rectifier of Night'] },
    teams: ['Phrolova + Cantarella + Qiuyuan', 'Phrolova + Cantarella + Shorekeeper'] },
  'Augusta': { rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'Ephor of Septimont, a sun rising ablaze from the crucible of blood and sand. On-field Electro Heavy ATK DPS who self-shields via Glory\'s Favor and builds Ascendancy (up to 100, from Normal ATK hits, +20% from Intro, +10% from Skill, +40% from Liberation) toward a Sword of Eternal Oath. At 2 Majesty stacks she can hold Liberation to cast Sublime is the Sun instead, entering a 7s time-stopped Sworn Allegiance state (swapping disabled) for a 9-hit Sunborne combo into an Everbright Protector finisher that deploys Ruler\'s Realm (grants teammates a shield on their Intro cast). Her Outro (Battlesong of the Unyielding) grants the next Resonator +15% All-Attribute DMG Amp for 14s that ends immediately if they are swapped out — and ONLY if that same Resonator casts their own Outro Skill back to Augusta while the buff is still active does she gain +1 Majesty and +1 Crown of Wills stack (swapping to a third character first forfeits the stack).',
    skills: ['Hunter\'s Path', 'Warrior\'s Blade', 'Sunward Conquest', 'Call Me By the Sun'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Tidal Residuum', specialty: 'Luminous Calendula' },
    skillMaterials: { weeklyDrop: 'When Irises Bloom', forgery: 'Waveworn Residue' },
    bestEchoes: ['The False Sovereign', 'Crown of Valor 3pc + Void Thunder 2pc'], bestWeapon: 'Thunderflare Dominion',
    weaponAlts: { alt5: ['Verdant Summit', 'Ages of Harvest'], alt4: ['Aureate Zenith', 'Autumntrace'], alt3: ['Guardian Broadblade'] },
    teams: ['Augusta + Iuno + Shorekeeper', 'Augusta + Mortefi + Shorekeeper', 'Augusta + Mortefi + Verina'] },
  // desc rewritten 2026-08-31 against the wiki/Iuno/Combat "Forte > Details" (Chrome/
  // Windows UA + google.com referer + jsRender, load+9s wait): prior desc was flavor text with no exact
  // resource numbers. Sentience (0-100 cap): Intro Skill +40, Resonance Liberation +60, Closing/Unfinished
  // Refrain +25 each, plus passive regen from Moonring Basic ATK/Dodge Counter/Mid-air Attack while in Lunar
  // Cycle. Resonance Skill - Closing Refrain (outside Lunar Cycle) or Resonance Liberation activates Lunar
  // Cycle for 15s, starting in Half Moon (Moonring attacks, restore Sentience on hit). Heavy ATK - Flux
  // (25 STA) toggles Half Moon ⇄ New Moon; New Moon swaps her Basic ATK to Moonbow and Skill to Arc Beyond
  // the Edge (2 charges) — in New Moon, Basic ATK/Arc Beyond the Edge/Dodge Counter CONSUME Sentience to
  // boost their own DMG Multiplier, restore extra Concerto Energy, and heal the team on hit; both Moonbow's
  // and Arc Beyond the Edge's damage is explicitly categorized by the game as Resonance Liberation DMG. At
  // full Concerto Energy her Heavy ATK becomes Absolute Fullness (once per 25s): ends Lunar Cycle, deals AoE
  // Aero DMG (also Liberation DMG), heals nearby allies, and drops a 30s Full Moon Domain that restores
  // team HP/STA every 5s — gaining a Shield inside it grants a stack of Blessing of the Wan Light (below).
  'Iuno': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Sub DPS',
    desc: 'Priestess of Septimont\'s Tetragon Temple. Aero Sub-DPS built around Sentience (0-100: +40 on Intro, +60 on Liberation, +25 on Closing/Unfinished Refrain). Resonance Skill or Liberation activates Lunar Cycle (15s), toggling Half Moon ⇄ New Moon via Heavy ATK - Flux (25 STA); in New Moon, Basic ATK/Arc Beyond the Edge/Dodge Counter consume Sentience to raise their own DMG Multiplier and heal the team — this damage is categorized as Resonance Liberation DMG. At full Concerto Energy, Heavy ATK becomes Absolute Fullness (once/25s): ends Lunar Cycle, heals the team, and drops a 30s Full Moon Domain — Shields gained inside it grant stacking Blessing of the Wan Light (+4%/stack all DMG Amp, max 10 stacks, resets on refresh, ends if swapped off-field). Outro grants the incoming ally +50% Heavy ATK DMG Amp for 14s (ends early if they\'re swapped out).',
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
    // teams corrected 2026-08-18: 'Brant + Lupa' wasn't corroborated by any current source found;
    // current secondary options cited are Mortefi + Verina or Phrolova + Lupa — kept the Lupa pairing
    // and swapped Brant for Phrolova (both were cited; this is the more conservative single-field edit).
    teams: ['Galbrena + Qiuyuan + Shorekeeper', 'Galbrena + Phrolova + Lupa'] },
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
    // the wiki's own Forte gallery/the source's kit breakdown.
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
    rotation: ['Intro (cancel → Ultimate)', 'Ultimate', 'Skill: Lynae-Style Palettes', 'Heavy: Spark Collision (full charge, cancel → Jump)', 'Jump: Polychrome Leap (×3)', 'Basic: Mid-air Attack: Visual Impact', 'Outro'],
    ascension: { boss: "Suncoveter's Reach", common: 'Exoswarm Core', specialty: 'Rimewisp' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Combustor' },
    bestEchoes: ['Hyvatia', 'Pact of Neonlight Leap 5pc'], bestWeapon: 'Spectrum Blaster',
    // weaponAlts added 2026-08-17 against the source's live build calcs page (30/July/2026 profile update):
    // Phasic Homogenizer (91.2%) and The Last Dance (85.0%) are the top non-signature 5★ alts (ahead of
    // Lux & Umbra 82.6%, Woodland Aria 70.3%, Static Mist 81.5% — Static Mist is a QOL pick per the source's
    // review text but scores lower than these two in raw calcs); Solar Flame (68.8%) and Relativistic Jet
    // (68.5%) are the best 4★s; Pistols of Night is the 3★ fallback (matches the "<Weapon Type> of Night"
    // naming convention used for other characters' 3★ slot).
    weaponAlts: { alt5: ['Phasic Homogenizer', 'The Last Dance'], alt4: ['Solar Flame', 'Relativistic Jet'], alt3: ['Pistols of Night'] },
    teams: ['Lynae + Aemeath + Mornye', 'Lynae + Hiyuki + Chisa'] },
  'Mornye': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Healer',
    desc: 'A Spacetrek Collective Research Institute engineer and Department of Exostrider Engineering professor at Startorch Academy. DEF-scaling Fusion healer who restores HP via Resonance Skill and Liberation while boosting the team\'s Off-Tune Buildup Rate.',
    skills: ['Ground State Calibration', 'Resolution', 'Critical Protocol', 'Convergence'],
    rotation: ['Intro', 'Basic: Wide Field 1', 'Basic: Wide Field 2', 'Basic: Wide Field 3 (cancel → Skill)', 'Skill: Distributed Array', 'Heavy: Inversion (cancel → Ultimate)', 'Ultimate', 'Outro'],
    ascension: { boss: 'Burning Judgment', common: 'Mech Core', specialty: 'Gemini Spore' },
    skillMaterials: { weeklyDrop: "The Netherworld's Stare", forgery: 'Carved Crystal' },
    bestEchoes: ['Reactor Husk', 'Halo of Starry Radiance 5pc'], bestWeapon: 'Starfield Calibrator',
    // weaponAlts added 2026-08-17: the source's live build calcs only rank 3 weapons total for Mornye
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
    rotation: ['Intro', 'Jump: Mid-air Attack: Resection 2', 'Jump: Mid-air Attack: Resection 3', 'Skill: Ring', 'Basic: Golden Impale (cancel → Dash)', 'Dash', 'Basic: Mid-air Attack 1', 'Jump: Mid-air Attack: Resection 2', 'Jump: Mid-air Attack: Resection 3', 'Skill: Breach', 'Basic: Golden Impale (cancel → Dash)', 'Dash', 'Basic: Mid-air Attack 1', 'Jump: Mid-air Attack: Resection 2', 'Jump: Mid-air Attack: Resection 3', 'Skill: Glare', 'Basic: Mid-air Attack: Gavel of Earthshaker (cancel → Ultimate)', 'Ultimate', 'Echo (swap)', 'Outro'],
    ascension: { boss: "Suncoveter's Reach", common: 'Exoswarm Pendant', specialty: 'Edelschnee' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Waveworn Shard' },
    bestEchoes: ['Twin Nova - Nebulous Cannon', 'Rite of Gilded Revelation 5pc'], bestWeapon: "Daybreaker's Spine",
    // weaponAlts fixed 2026-09-04 (Phase A audit) against a fresh the source dump's own weapon-ranking
    // list and cross-checked against weapons.js's own rarity fields: Pulsation Bracer is a real 5★
    // weapon (weapons.js: rarity 5) — the prior version wrongly filed it under alt4 (its own comment
    // even mis-asserted "the best 4★s"), which both misfiled the source's explicit #2-overall pick
    // (85.70%, ahead of Blazing Justice's 80.70% and Moongazer's Sigil's 80.40%) as a 4★ and bumped
    // Moongazer's Sigil into the alt5 slot Pulsation Bracer should have held. Now alt5 = top 2
    // non-signature 5★s by the source's own % ranking (Pulsation Bracer, Blazing Justice); alt4 = top 2
    // real 4★s (Celestial Spiral 65.9%, Aether Strike 63.9%, both weapons.js rarity 4); alt3 unchanged
    // (Gauntlets of Night, the "<Weapon Type> of Night" 3★ fallback convention used elsewhere).
    weaponAlts: { alt5: ['Pulsation Bracer', 'Blazing Justice'], alt4: ['Celestial Spiral', 'Aether Strike'], alt3: ['Gauntlets of Night'] },
    teams: ['Luuk Herssen + Denia + Mornye', 'Luuk Herssen + Sanhua + Mornye'] },
  'Aemeath': { rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    desc: 'Once an Exostrider Synchronist of Rabelle College, she is now a digital ghost who sings quietly amongst stars. On-field Fusion DPS who switches between Tune Rupture and Fusion Burst Resonance Modes, dealing massive Resonance Liberation DMG through Seraphic Duet and Heavenfall Edict.',
    skills: ['Infinity Calibration', 'Shared Voyage', 'Towards the Daybreak', 'Overture of Departure'],
    rotation: ['Intro', 'Basic: Aemeath 3', 'Basic: Aemeath 4 (cancel → Ultimate)', 'Ultimate: Overdrive', 'Basic: Mech 2', 'Basic: Mech 3', 'Basic: Mech 4 (cancel → Skill)', 'Skill: Duet Encore', 'Basic: Aemeath 2', 'Basic: Aemeath 3', 'Basic: Aemeath 4 (cancel → Skill)', 'Skill: Duet Overture', 'Heavy: Mech II (cancel → Ultimate)', 'Ultimate: Finale', 'Outro'],
    ascension: { boss: 'Our Choice', common: 'Exoswarm Core', specialty: 'Moss Amber' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Polarizer' },
    bestEchoes: ['Sigillum', 'Trailblazing Star 5pc'], bestWeapon: 'Everbright Polestar',
    // weaponAlts added 2026-08-17 from the source's live build calcs: Emerald of Genesis (83.5%) and Red
    // Spring (83.2%) are the top non-signature 5★ Swords (ahead of Emerald Sentence 82.9%, Blazing
    // Brilliance 78.1%); Feather Edge (74.8%) and Somnoire Anchor (74.1%) are the best 4★s (ahead of
    // Endless Collapse 73.9%); Sword of Night is the 3★ fallback, matching the "<Weapon Type> of Night"
    // naming convention used for other characters' 3★ slot.
    weaponAlts: { alt5: ['Emerald of Genesis', 'Red Spring'], alt4: ['Feather Edge', 'Somnoire Anchor'], alt3: ['Sword of Night'] },
    teams: ['Aemeath + Denia + Chisa', 'Aemeath + Lynae + Mornye'] },
  'Sigrika': { rarity: 5, element: 'Aero', weapon: 'Gauntlets', role: 'Main DPS',
    desc: 'Solsworn of the Roya Tribe and Startorch Academy Birding Fan Club member. On-field Aero DPS who consumes Rune stacks to empower Echo Skill and Heavy ATK for Aero burst DMG with crowd control.',
    skills: ['One, Two, Three', 'Royan Close Quarters Combat', 'Where Trust Leads Me!', 'Solsworn Etymology'],
    rotation: ['Intro', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic: Elucidated', 'Heavy: Chain Whip (cancel → Ultimate)', 'Ultimate', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic: Elucidated', 'Heavy: Outburst', 'Hold Skill: Learn My True Name', 'Outro'],
    ascension: { boss: 'Our Choice', common: 'Exoswarm Pendant', specialty: 'Arithmetic Shell' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Waveworn Shard' },
    bestEchoes: ['Nameless Explorer', 'Sound of True Name 5pc'], bestWeapon: 'Solsworn Ciphers',
    // weaponAlts added 2026-08-17 from the source's live build calcs: Blazing Justice (85.4%) and Pulsation
    // Bracer (81.8%, her best permanent-banner pick) are the top non-signature 5★ Gauntlets (ahead of
    // Verity's Handle 78.5%, Moongazer's Sigil 76.3%, Abyss Surges 69.4%); Aether Strike (69.4%) and
    // Legend of Drunken Hero (best F2P no-gacha pick) are the best 4★s; Gauntlets of Night is the 3★
    // fallback, matching the "<Weapon Type> of Night" naming convention used elsewhere (the source doesn't
    // rank a 3★ for her at all — she "lacks strong F2P weapon alternatives" per its own review).
    weaponAlts: { alt5: ['Blazing Justice', 'Pulsation Bracer'], alt4: ['Aether Strike', 'Legend of Drunken Hero'], alt3: ['Gauntlets of Night'] },
    teams: ['Sigrika + Qiuyuan + Shorekeeper', 'Sigrika + Phrolova + Qiuyuan', 'Sigrika + Qiuyuan + Ciaccona'] },
  'Rebecca': { rarity: 5, element: 'Electro', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Edgerunner and Fury-Type Arsenal from the Cyberpunk: Edgerunners collab. Electro Hybrid who mode-switches between Huntress and Guts stances, buffing team Heavy ATK DMG and All DMG Amplification via her Outro turret.',
    skills: ["Mix-'n'-Match", "Tactical Tweaks", "Party 'til Dawn!", "My Turn!"],
    ascension: { boss: 'Nightmare Flashdrive', common: 'Mech Core', specialty: 'Past Reveries' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'Combustor' },
    // bestEchoes corrected 2026-09-04 (fresh Phase A audit): was ['Reminiscence - Nightmare: Adam
    // Smasher', 'Shadow of Shattered Dreams 1pc + Void Thunder 2pc'] — the dump's own "Special Echo Set
    // option" (a personal-damage-focused alternative that explicitly "sacrifices team buffing"), not
    // her actual **Best Echo Set**. The dump's own scored ranking gives Moonlit Clouds 100.00% (the
    // top score, matching this field's [Main Echo, 'Set 5pc'] convention used by every other character
    // in this file — e.g. line 35's ['Impermanence Heron', 'Moonlit Clouds 5pc']), with Bell-Borne
    // Geochelone as its primary Main Echo recommendation ("ideal cast timing... best in non-Quickswap
    // play"; Impermanence Heron listed as the Quickswap-specific alternative).
    bestEchoes: ['Bell-Borne Geochelone', 'Moonlit Clouds 5pc'], bestWeapon: 'Skull Thrasher',
    // weaponAlts added 2026-08-17 from the source's live build calcs (Lucy+Mornye team average): Spectrum
    // Blaster (96.3%) and Static Mist (93.3%) are the top non-signature 5★ Pistols (ahead of Phasic
    // Homogenizer, Woodland Aria, The Last Dance, Spectral Trigger, Lux & Umbra); Solar Flame (79.1%)
    // and Relativistic Jet (79.0%) are the best 4★s (ahead of the craftable Pistols#26); Pistols of Night
    // is the 3★ fallback (the source doesn't rank a 3★ for her), matching the "<Weapon Type> of Night"
    // naming convention used elsewhere.
    weaponAlts: { alt5: ['Spectrum Blaster', 'Static Mist'], alt4: ['Solar Flame', 'Relativistic Jet'], alt3: ['Pistols of Night'] },
    teams: ['Rebecca + Yangyang: Xuanling + Lucy', 'Rebecca + Lucy + Mornye', 'Rebecca + Jiyan + Shorekeeper'] },
  'Lucilla': { rarity: 5, element: 'Glacio', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'President and head of Startorch Academy, former chief editor of the New Federation\'s top academic journal. Dual-mode Glacio Hybrid who buffs Glacio Chafe DMG or Echo Skill DMG depending on Resonance Mode, built around a 5-input Photo-consuming Ultimate.',
    skills: ['Snapshot', 'Phantom Frame', 'Clear As Day', 'Clip It'],
    ascension: { boss: "Suncoveter's Reach", common: 'Mech Core', specialty: 'Forget-Me-Not' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'String' },
    bestEchoes: ['Glommoth', 'Wishes of Quiet Snowfall 5pc (Chafe)', 'Impermanence Heron', 'Moonlit Clouds 5pc (Echo)'], bestWeapon: 'Freeze Frame',
    // weaponAlts added 2026-08-17 from the source's live build calcs (Hiyuki Chafe / Sigrika+Shorekeeper
    // Echo team average): Whispers of Sirens (95.7%/81.6%) and Stringmaster (95.6%/87.6%) are the top
    // non-signature 5★ Rectifiers (ahead of Lethean Elegy, Rime-Draped Sprouts, Forged Dwarf Star,
    // Luminous Hymn, Cosmic Ripples); Radiant Dawn (90.4%/68.6%) and Augment (89.1%/73.3%) are the best
    // Battle Pass 4★s (ahead of Waltz in Masquerade); Rectifier of Night is the 3★ fallback (the source
    // doesn't rank a 3★ for her), matching the "<Weapon Type> of Night" naming convention used elsewhere.
    weaponAlts: { alt5: ['Whispers of Sirens', 'Stringmaster'], alt4: ['Radiant Dawn', 'Augment'], alt3: ['Rectifier of Night'] },
    teams: ['Lucilla + Hiyuki + Chisa', 'Lucilla + Sigrika + Shorekeeper', 'Lucilla + Phrolova + Qiuyuan'] },
  'Lucy': { rarity: 5, element: 'Spectro', weapon: 'Pistols', role: 'Main DPS',
    desc: 'The Netrunner, from the Cyberpunk: Edgerunners collab. Spectro DPS who builds TCP/Root Access into an enhanced Heavy Attack and a battlefield-freezing Ultimate with selectable Spoofing Program debuffs, dealing bonus DMG via the Hack mechanic.',
    skills: ['Locked Thread', 'Protocol Breach', 'Netrunner', 'Outdated Hallucination'],
    ascension: { boss: 'Nightmare Flashdrive', common: 'Exoswarm Core', specialty: 'Past Reveries' },
    skillMaterials: { weeklyDrop: 'Gold in Memory', forgery: 'Combustor' },
    bestEchoes: ['Reminiscence - Nightmare: Adam Smasher', 'Shadow of Shattered Dreams 1pc + Rite of Gilded Revelation 2pc'], bestWeapon: 'Spectral Trigger',
    // weaponAlts added 2026-08-17 from the source's live build calcs (Rebecca+Mornye team average): Lux &
    // Umbra (88.4%) and Skull Thrasher (83.5%) are the top non-signature 5★ Pistols (ahead of Phasic
    // Homogenizer, The Last Dance, Spectrum Blaster, Static Mist, Woodland Aria); Solar Flame (67.5%)
    // and Relativistic Jet (64.6%) are the best 4★s (ahead of the craftable Pistols#26); Pistols of Night
    // is the 3★ fallback (the source doesn't rank a 3★ for her), matching the "<Weapon Type> of Night"
    // naming convention used elsewhere.
    weaponAlts: { alt5: ['Lux & Umbra', 'Skull Thrasher'], alt4: ['Solar Flame', 'Relativistic Jet'], alt3: ['Pistols of Night'] },
    teams: ['Lucy + Rebecca + Mornye', 'Lucy + Rebecca + Shorekeeper', 'Lucy + Iuno + Shorekeeper'] },
  'Yangyang: Xuanling': { rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    desc: 'Xuan Watcher of Xuanfang Hold and sister of Suisui. On-field Havoc DPS who alternates Azure and Feather Sword Stances, applying and consuming Havoc Bane for massive self-buffed Crit DMG — one of the highest damage ceilings in the game at release.',
    skills: ['Succor and Smite', "Feather's Edge", 'Hush of a Thousand Voices', 'Skybound Feather'],
    ascension: { boss: "Solidarity's Loneflame", common: 'Autopuppet Kernel', specialty: 'Cloudperch Seed' },
    skillMaterials: { weeklyDrop: 'Skyward Glazed Heart', forgery: 'Polarizer' },
    bestEchoes: ['Thousand-Puppet Pavilion', 'Song of Feathered Trace 5pc'], bestWeapon: 'Azure Oath',
    // weaponAlts added 2026-08-18 from the source's live build calcs (Lynae+Chisa team): Emerald Sentence
    // (87.8%) and Red Spring (80.5%) are the top non-signature 5★ Swords (ahead of Everbright Polestar,
    // Frostburn, Emerald of Genesis, Blazing Brilliance); Lumingloss (70.4%, the source's explicit best
    // 4★) and Fables of Wisdom (her best F2P no-gacha pick) are the only ranked 4★s; Sword of Night is
    // the 3★ fallback (the source doesn't rank a 3★ for her), matching the "<Weapon Type> of Night" naming
    // convention used elsewhere.
    weaponAlts: { alt5: ['Emerald Sentence', 'Red Spring'], alt4: ['Lumingloss', 'Fables of Wisdom'], alt3: ['Sword of Night'] },
    teams: ['Yangyang: Xuanling + Chisa + Suisui', 'Yangyang: Xuanling + Phrolova + Chisa', 'Yangyang: Xuanling + Rebecca + Suisui'] },
  'Denia': { rarity: 5, element: 'Fusion', weapon: 'Rectifier', role: 'Sub DPS',
    desc: 'Voidmatters student at Startorch Academy who secretly serves as an agent for the Fractsidus. Dual-mode Fusion Hybrid who switches between Stagecraft and Breakdown Form via her two Ultimates, playing into either Fusion Burst or Tune Strain team archetypes depending on Resonance Mode.',
    skills: ["Dreamweaver's Banquet", 'Bubbles and Baits', 'Final Act', 'Formal Greetings'],
    rotation: ['Intro', 'Basic: Stagecraft 4 (cancel → Skill)', 'Skill: Phantom Bubble (cancel → Ultimate)', 'Ultimate: Stagecraft', 'Basic: Breakdown 1', 'Basic: Breakdown 2 (cancel → Dash)', 'Dash', 'Basic: Breakdown 1', 'Basic: Breakdown 2 (cancel → Skill)', 'Skill: Banish 1', 'Skill: Banish 2 (cancel → Ultimate)', 'Ultimate: Breakdown', 'Outro'],
    ascension: { boss: 'Burning Judgment', common: 'Mech Core', specialty: 'Dream of Stars' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'String' },
    bestEchoes: ['Reminiscence: Denia', 'Chromatic Foam 5pc (Fusion Burst)', 'Voidwing Moth', 'Reel of Spliced Memories 5pc (Tune Strain)'], bestWeapon: 'Forged Dwarf Star',
    // weaponAlts added 2026-08-17 from the source's live build calcs (Aemeath+Chisa Fusion Burst / Luuk
    // Herssen+Mornye Tune Strain average): Stringmaster (91.0%/85.7%) and Lethean Elegy (89.3%/79.9%)
    // are the top non-signature 5★ Rectifiers (ahead of Luminous Hymn, Whispers of Sirens, Rime-Draped
    // Sprouts, Cosmic Ripples); Augment (78.3%/67.6%) and Radiant Dawn (77.6%/60.4%) are the best
    // Battle Pass 4★s (ahead of Waltz in Masquerade, Fusion Accretion, Jinzhou Keeper); Rectifier of
    // Night is the 3★ fallback, matching the "<Weapon Type> of Night" naming convention used elsewhere.
    weaponAlts: { alt5: ['Stringmaster', 'Lethean Elegy'], alt4: ['Augment', 'Radiant Dawn'], alt3: ['Rectifier of Night'] },
    // teams corrected 2026-09-02 against a fresh the source dump: the prior 'Denia + Lynae + Mornye' entry
    // was wrong — Lynae never appears anywhere on Denia's page (Kit/Review/Build/Gameplay and
    // teams/Calculations, all checked), and it contradicted the reciprocal entries already in this same
    // file for Aemeath (line 776: 'Aemeath + Denia + Chisa'), Luuk Herssen (line 762: 'Luuk Herssen +
    // Denia + Mornye') and Qingxiao (line 911: 'Qingxiao + Denia + Mornye'). The dump's own Synergies/
    // Example Teams sections confirm: Fusion Burst pairs her only with Aemeath (Chisa or Lupa 3rd slot);
    // Tune Strain pairs her with either Qingxiao or Luuk Herssen, always alongside Mornye ("not
    // recommended for Tune Strain without Mornye involved").
    teams: ['Aemeath + Denia + Chisa', 'Qingxiao + Denia + Mornye'] },
  'Hiyuki': { rarity: 5, element: 'Glacio', weapon: 'Sword', role: 'Main DPS',
    desc: "Miko of Flaming Sakura from Ashinohara, now the last member of Lahai-Roi's Special Response Force. On-field Glacio DPS who converts team Glacio Chafe into Glacio Bite via her Forte, switching between Present Self and Foreclaimed Self for an Iai-Stance burst finisher.",
    skills: ['Flaming Sakura Blade Art', 'Frostblight', 'Foreclaiming', 'Frostedge'],
    rotation: ['Intro', 'Basic 3', 'Heavy: Frost Splinter (cancel → Ultimate)', 'Ultimate: Inward Vision', 'Basic: Foreclaimed 1', 'Basic: Foreclaimed 2', 'Basic: Foreclaimed 3 (cancel → Skill)', 'Skill: Jade Cleave', 'Skill: Petalfall', 'Basic: Foreclaimed 1', 'Basic: Foreclaimed 2', 'Basic: Foreclaimed 3 (cancel → Dodge)', 'Dodge (enter Iai Stance)', 'Basic: Iai (×3)', 'Heavy: Bitterfrost', 'Hold Ultimate: Blade Liberation', 'Skill (swap)', 'Outro'],
    ascension: { boss: 'Our Choice', common: 'Exoswarm Core', specialty: 'Redbell' },
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'Polarizer' },
    bestEchoes: ['Reminiscence: Threnodian - Voidborne Construct', 'Wishes of Quiet Snowfall 5pc'], bestWeapon: 'Frostburn',
    // weaponAlts added 2026-08-17 from the source's live build calcs: Blazing Brilliance (80.8%) and
    // Emerald of Genesis (80.1%) are the top non-signature 5★ Swords (ahead of Emerald Sentence 79.0%,
    // Red Spring 79.0%, Everbright Polestar 76.9%); Feather Edge (76.9%, the source's explicit best 4★) and
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
    // weaponAlts added 2026-08-18: the source ranks Suisui's weapons by a simple 1-4 list rather than
    // percentages. Stellar Symphony (Shorekeeper's Signature, #2) is her only ranked non-signature 5★
    // (provides enough Energy Regen to max her passives, though its team-ATK passive goes unused);
    // Variation (#3, best cost-efficiency pick) and Call of the Abyss (#4, last-resort fallback) are
    // the 4★s; Rectifier of Night is the 3★ fallback (the source doesn't rank a 3★ for her), matching the
    // "<Weapon Type> of Night" naming convention used elsewhere.
    weaponAlts: { alt5: ['Stellar Symphony'], alt4: ['Variation', 'Call of the Abyss'], alt3: ['Rectifier of Night'] },
    teams: ['Suisui + Yangyang: Xuanling + Chisa', 'Suisui + Hiyuki + Lynae', 'Suisui + Aemeath + Denia'] },
  'Qingxiao': { rarity: 5, element: 'Aero', weapon: 'Sword', role: 'Main DPS',
    desc: 'Paragon of Mengzhou. On-field Aero DPS who builds Qin Heart and Sword Cadence through Sheathed/Drawn Stance attacks, then unleashes Ephemeral Transcendence for empowered combos, scaling off Tune Strain - Interfered stacks and her own Mindlock stacks.',
    skills: ['Strings to Steel', 'Severing Note', 'Billows Beneath Heaven', 'Tonality Shift'],
    // Confirmed 2026-08-20 (v3.6 now live) via the wiki's own Ascension
    // Materials/Forte tables: boss drop Forged Empyrean's Sigh, common Autopuppet Kernel (Land of
    // Xuanfang family, already in COMMON_MAT_TIERS), specialty Blade Blossom.
    ascension: { boss: "Forged Empyrean's Sigh", common: 'Autopuppet Kernel', specialty: 'Blade Blossom' },
    // weeklyDrop We Who Question, forgery Polarizer family (Broken Wing/Monowing/Polywing/Layered
    // Wing Polarizer) — both confirmed same source.
    skillMaterials: { weeklyDrop: 'We Who Question', forgery: 'Polarizer' },
    bestEchoes: ['Heart of Evil\'s Purge 5pc'], bestWeapon: 'Glint of Clouds',
    // weaponAlts corrected 2026-09-04 (full 9-dimension re-audit, fresh live dump): the prior entry
    // (Blazing Brilliance/Endless Collapse) was sourced from the source's pre-release datamined ranking
    // before a real build guide existed — same stale-placeholder pattern already flagged/fixed at this
    // table's other entries (e.g. Rover: Havoc's/Jinhsi's own comments above naming weapons that "never
    // appear anywhere in the source's ranked weapon list"). The live dump's own "Best Weapons" ranking
    // makes Blazing Brilliance explicitly wrong for alt5: it's #8 of 11 (69.51%), with the dump's own
    // text calling it "Not recommended over any other 5★" (wrong stat priority — Crit DMG over her
    // favored Crit Rate). Red Spring is the real best non-signature 5★ (#2, 78.73%, "Decent
    // alternative"). Endless Collapse never appears anywhere in the dump's ranked weapon list at all (it's
    // merely a banner-featured 4★, not a ranked recommendation); Feather Edge is the dump's own explicit
    // "Best 4★ option" (65.53%), matching the alt4 convention used everywhere else in this table.
    weaponAlts: { alt5: ['Red Spring'], alt4: ['Feather Edge'], alt3: ['Sword of Night'] },
    teams: ['Qingxiao + Denia + Mornye', 'Qingxiao + Lynae + Mornye'] },
  'Jingran': { rarity: 5, element: 'Fusion', weapon: 'Broadblade', role: 'Main DPS',
    desc: 'A loner treading into illusive depths, of Mengzhou. HP-scaling Fusion Broadblade wielder who channels Yin Vessel and Yang Font stances. On-field Fusion DPS whose Heavy Attacks and ATK/DMG scale off Max HP, entering the Yinghuo state via Resonance Liberation for empowered follow-up strikes.',
    skills: ['Edge of Life and Death', 'Malevolent Encounter', 'Burial of Thousand Souls', 'Question the Tombs'],
    // Dates corrected 2026-08-18: Jingran releases in the v3.6-p2 banner (~2026-09-10, per BANNER_HISTORY),
    // not Aug 20 (that's Qingxiao's v3.6-p1 date) — the wiki's own infobox leaves releaseDate blank/commented
    // ("2026-09-??"), so no exact day is confirmed yet.
    // Confirmed 2026-08-20 via the wiki's own Ascension Materials/Forte tables
    // (page now live, marked "upcoming content" since Jingran himself hasn't banner-released yet —
    // his kit/materials are shown regardless): boss drop Forged Empyrean's Sigh (shared with
    // Qingxiao), common Whisperin Core, specialty Cloudperch Seed.
    ascension: { boss: "Forged Empyrean's Sigh", common: 'Whisperin Core', specialty: 'Cloudperch Seed' },
    // weeklyDrop Skyward Glazed Heart, forgery Carved Crystal family — both confirmed same source.
    skillMaterials: { weeklyDrop: 'Skyward Glazed Heart', forgery: 'Carved Crystal' },
    // bestWeapon confirmed real via the source: Thousandfold Deliverance (Broadblade, 412 ATK / +72.2% HP, "Hark, Spirits and Stars").
    // No community build guide exists yet — the wiki's own wiki still flags him "upcoming content" and
    // "not featured in any Event Convene" as of 2026-08-20 (he's confirmed for the 3.6-p2 banner,
    // ~Sept 10, per BANNER_HISTORY, not live day-one like Qingxiao) — bestEchoes/teams/weaponAlts
    // remain genuinely unconfirmed, not guessed.
    // bestEchoes/teams left empty rather than a placeholder sentinel string: DamageCalculator.jsx's
    // "Recommended" line (`m.d.bestEchoes && ...`) renders any truthy bestEchoes verbatim to the
    // user, sentinel prose included — found via a team-recommendation audit (2026-09-01). An empty
    // array renders nothing (falls through to the "no recommendation yet" empty state) instead of
    // leaking "Unconfirmed (releases 3.6-p2, ~Sept 2026)" as if it were a real echo-set suggestion.
    bestEchoes: [], bestWeapon: 'Thousandfold Deliverance',
    teams: [] },
    // Re-checked 2026-08-31 (deepened rotation/Resonance-Chain data pass): Jingran remains the sole gap
    // in CHARACTER_ROTATIONS/RESONANCE_CHAIN_DATA out of the 58-entry roster, and it is still not
    // fabricatable — reconfirmed via headless-browser fetch (Chrome UA + google.com referer, load-wait
    // 8s) against both sources: the source/wuthering-waves/characters/jingran explicitly states "Jingran
    // skills aren't available yet" / "rotation information aren't available yet" (page last updated
    // 17/July/2026, pre-kit-reveal); the wiki/Jingran is flagged "This page is
    // about upcoming content" with an explicit "Jingran doesn't have any Forte yet" / "doesn't have any
    // Sequence Nodes yet" under its Combat Overview, and gives his release date as September 10, 2026 —
    // still in the future as of this pass (today: 2026-08-31). No rotation/S1-S6/skill-multiplier entry
    // has been added for him; do not fill this in until his kit is actually revealed post-release.
  // 4★ Resonators
  'Aalto': { rarity: 4, element: 'Aero', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Suave information broker who slips through the mist. Aero sub-DPS who deals off-field Aero DMG via Coordinated Attacks triggered by his mist clone summon.',
    // corrected 2026-08-18: skills[3] was 'Mistcloak Dash' (the internal dash mechanic triggered within the Forte
    // Circuit), not the Forte Circuit's actual name 'Misty Cover' (the wiki Combat page). SKILL_ICONS already aliased
    // both names to the same icon; fixing here for consistency with the real skill name.
    skills: ['Half Truths', 'Shift Trick', 'Flower in the Mist', 'Misty Cover'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Howler Core', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    bestEchoes: ['Nightmare: Feilian Beringal', 'Sierra Gale 5pc'], bestWeapon: 'The Last Dance',
    weaponAlts: { alt5: ['Woodland Aria', 'Static Mist'], alt4: ['Relativistic Jet', 'Undying Flame'], alt3: ['Pistols of Night'] },
    // teams corrected 2026-09-03 against a fresh the source dump: 'Cartethyia' is never mentioned anywhere
    // in this source's Synergies section for Aalto (which explicitly names Ciaccona, Jiyan, Iuno, and
    // Rover: Aero) — Ciaccona is explicitly called "the best partner for Main DPS Aalto" and "a core
    // component of all mono Aero teams", the real Aero-Erosion pairing this table intended. The prior
    // 2026-08-18 note's premise (an Aero Main DPS benefiting from his Outro's Aero DMG Amplify) still
    // holds — it just named the wrong character.
    teams: ['Aalto + Ciaccona + Shorekeeper', 'Aalto + Jiyan + Verina'] },
  'Baizhi': { rarity: 4, element: 'Glacio', weapon: 'Rectifier', role: 'Healer',
    desc: "Devoted Huaxu Academy researcher accompanied by her companion You'an. Glacio healer who restores HP via Resonance Skill and Liberation, providing consistent team sustain with low field time.",
    skills: ['Destined Promise', 'Emergency Plan', 'Momentary Union', 'Cycle of Life'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Howler Core', specialty: 'Lanternberry' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Helix' },
    // bestEchoes corrected 2026-09-03 against a fresh the source dump: 'Bell-Borne Geochelone' was listed
    // as the main echo pick, but the source explicitly ranks Fallacy of No Return ahead of it ("nowadays
    // a worse option... remains a good choice if you don't have a good Fallacy to use") — Bell-Borne
    // Geochelone is the fallback, not the top pick.
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc'], bestWeapon: 'Stellar Symphony',
    weaponAlts: { alt4: ['Variation', 'Call of the Abyss'], alt3: ['Rectifier of Voyager'] },
    teams: ['Yangyang + Jiyan + Baizhi', 'Lingyang + Sanhua + Baizhi', 'Encore + Sanhua + Baizhi'] },
  'Chixia': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Main DPS',
    desc: 'Energetic patroller who blazes through Jinzhou with dual pistols. On-field Fusion DPS who deals Fusion DMG through rapid-fire Resonance Skill shots and Basic Attack combos.',
    skills: ['POW POW', 'Whizzing Fight Spirit', 'Blazing Flames', 'Heroic Bullets'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Belle Poppy' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    // bestWeapon corrected 2026-09-03 against a fresh the source dump: 'Static Mist' was previously used as
    // BiS (see the reverted 2026-08-18 note below), but this source explicitly ranks The Last Dance
    // (Carlotta's signature) at 108.35% — ahead of Static Mist's 100% — with no QOL caveat favoring
    // Static Mist over it for Chixia specifically. Swapped so bestWeapon matches the source's own top
    // calculated pick; Static Mist demoted to weaponAlts.alt5.
    bestEchoes: ['Nightmare: Inferno Rider', 'Molten Rift 5pc'], bestWeapon: 'The Last Dance',
    weaponAlts: { alt5: ['Static Mist'], alt4: ['Thunderbolt', 'Relativistic Jet'], alt3: ['Pistols of Night'] },
    // teams: 'Chixia + Changli + Baizhi' corrected 2026-09-03 — Baizhi is never mentioned anywhere in
    // this source's Synergies section for Chixia (which explicitly names Brant, Changli, Lupa, Verina,
    // and Shorekeeper only); swapped to Shorekeeper, one of the two explicitly-named generalist Healing
    // Support options, matching the source's own "Changli Team" example.
    teams: ['Chixia + Brant + Verina', 'Chixia + Changli + Shorekeeper'] },
  'Danjin': { rarity: 4, element: 'Havoc', weapon: 'Sword', role: 'Sub DPS',
    // desc expanded 2026-08-18 (the wiki + the source): lore half is the wiki's "Scarlet Shade" Midnight Ranger
    // who hunts thieves/bandits for retribution; gameplay half is the source's Hybrid framing — a fast
    // Outro-buff rotation for Havoc teammates, or a longer rotation (Basic ATK x3 into Skill x3, capped
    // by a full-power Forte Heavy Attack) that lets her run as a legitimate Main DPS.
    desc: 'Midnight Ranger who trades her own blood for power, hunting thieves and bandits across Huanglong for retribution. Havoc Hybrid who consumes HP to fuel enhanced Basic and Heavy Attacks, gaining Havoc DMG Bonus as health decreases — run as a quick Outro buffer for Havoc DPS or, with a longer rotation, as a Main DPS in her own right.',
    skills: ['Execution', 'Crimson Fragment', 'Crimson Bloom', 'Serene Vigil'],
    ascension: { boss: 'Strife Tacet Core', common: 'Ring', specialty: 'Belle Poppy' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Metallic Drip' },
    // bestEchoes/weaponAlts.alt5 corrected 2026-09-03 against a fresh the source dump: bestEchoes named
    // 'Nightmare: Crownless' — never mentioned anywhere in this source; its actual #1 Best Echo Set is
    // Moonlit Clouds (main echo Impermanence Heron), with Havoc Eclipse (main echo Dreamless) filed
    // under a separate "Special Echo Sets" section, not the top pick. weaponAlts.alt5 was missing Red
    // Spring (100.34%, this source's actual #2 weapon, ahead of Emerald of Genesis at 100.00%).
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Blazing Brilliance',
    // weaponAlts added 2026-08-18 from the source's ranked weapon list (all already tagged bestFor Danjin
    // in weapons.js): Emerald of Genesis (100.00%, standard 5★), Commando of Conviction (81.08%) and
    // Endless Collapse (80.72%) as top 4★s, Originite: Type II as the 3★ craftable option.
    weaponAlts: { alt5: ['Red Spring', 'Emerald of Genesis'], alt4: ['Commando of Conviction', 'Endless Collapse'], alt3: ['Originite: Type II'] },
    teams: ['Danjin + Camellya + Shorekeeper', 'Danjin + Camellya + Verina', 'Danjin + Cantarella + Verina', 'Danjin + Phrolova + Cantarella'] },
  // Audited 2026-08-18 via the wiki (infobox/MediaWiki API) + the source Kit/Build/
  // Gameplay tabs. desc: the wiki infobox `role` field is "Concerto Efficiency;Traction;Resonance
  // Liberation Regeneration"; the source frames her as a fully quickswap-friendly Hybrid whose Outro
  // funnels Resonance Energy to the incoming character and whose Forte/Resonance Skill both group
  // enemies — expanded desc below to cover both. bestEchoes corrected: 'Bell-Borne Geochelone' isn't
  // mentioned anywhere on her current the source Build tab (stale/unsourced) — replaced with the source's
  // actual top picks: Moonlit Clouds 5pc (support/quickswap build, paired with Impermanence Heron as
  // Main Echo) and Sierra Gale 5pc (damage-focused build, paired with Nightmare: Feilian Beringal).
  // teams corrected: Jiyan/Baizhi don't appear in her current the source Synergies list at all — replaced
  // with her current top picks (Xiangli Yao/Changli quickswap hypercarry teams, Verina/Shorekeeper as
  // healing support). bestWeapon Emerald of Genesis confirmed (the source's top non-signature 5★, 100%
  // baseline); Blazing Brilliance (Changli's sig, 102%) scores marginally higher but is a limited sig
  // weapon, so the widely-obtainable standard 5★ is kept as the primary recommendation (see
  // weaponAlts below for the full spread).
  'Yangyang': { rarity: 4, element: 'Aero', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Free Midnight Rangers outrider, Concerto Efficiency/Traction/Liberation Regen Hybrid. Aero sub-DPS who groups enemies via Resonance Skill and Liberation, builds up to 3 Melody stacks for a mid-air Feather Release burst, and funnels Resonance Energy to the next character via her Outro — one of the fastest, most quickswap-friendly rotations in the game.',
    skills: ['Feather as Blade', 'Zephyr Domain', 'Wind Spirals', 'Echoing Feathers'],
    ascension: { boss: 'Roaring Rock Fist', common: 'Ring', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    // bestWeapon/weaponAlts/bestEchoes corrected 2026-09-03 against a fresh the source dump: bestEchoes had
    // two bare set names with no main echo — the source's actual #1 Best Echo Set is Moonlit Clouds
    // paired with main echo Impermanence Heron; Sierra Gale (paired with Nightmare: Feilian Beringal) is
    // filed under "Special Echo Sets" as a DPS-focused situational pick, not the real best. bestWeapon
    // was 'Emerald of Genesis' (100.00%, actually #2), while this source ranks Blazing Brilliance ahead
    // of it at 102.39% with no caveat favoring Emerald of Genesis for Yangyang specifically — swapped,
    // demoting Emerald of Genesis into weaponAlts.alt5.
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Blazing Brilliance',
    weaponAlts: { alt5: ['Emerald of Genesis'], alt4: ['Lumingloss', 'Endless Collapse'], alt3: ['Sword of Night'] },
    teams: ['Yangyang + Xiangli Yao + Shorekeeper', 'Yangyang + Changli + Verina', 'Yangyang + Carlotta + Verina'] },
  // Sanhua corrected 2026-08-18 via the source's Kit/Build/Gameplay tabs: desc lore confirmed via the wiki's
  // Official Introduction ("the loyal and reliable guard of Jinzhou Magistrate Jinhsi") — was already
  // accurate. bestWeapon changed from 'Emerald of Genesis' (the source's #3 pick at 100.00%) to 'Blazing
  // Brilliance' (the source's #1 pick at 108.39%, R1); weaponAlts added (previously missing entirely).
  // bestEchoes reordered to match the source's stated primary set (Moonlit Clouds 5pc first, Impermanence
  // Heron as the paired Main Echo, not a second full set). teams reordered/expanded per the source's own
  // "Example Teams" (Encore Team ranked as her single best pairing, ahead of the Camellya team).
  // Fixed 2026-09-03 against a real browser snapshot. bestEchoes was ordered
  // [set, main] ('Moonlit Clouds 5pc' first) — backwards from the [main, set] convention
  // getSonataLoadouts() actually parses; that reversed order silently split into two disconnected
  // display rows instead of one combined main+set row. teams named 'Sanhua + Lingyang + Shorekeeper'
  // — Lingyang is never mentioned anywhere in this source; replaced with the trio the source's own
  // Review text explicitly names as "the best casual Phoebe trio" (Sanhua + Phoebe + Spectro Rover).
  'Sanhua': { rarity: 4, element: 'Glacio', weapon: 'Sword', role: 'Sub DPS',
    desc: 'Jinhsi\'s stoic personal guard, cold as the frost she commands. Quick-swap Glacio sub-DPS who deals burst Glacio DMG and amplifies the next character\'s Basic ATK DMG via Outro.',
    skills: ['Frigid Light', 'Eternal Frost', 'Glacial Gaze', 'Clarity of Mind'],
    ascension: { boss: 'Sound-Keeping Tacet Core', common: 'Whisperin Core', specialty: 'Wintry Bell' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Metallic Drip' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Blazing Brilliance',
    weaponAlts: { alt5: ['Red Spring', 'Emerald of Genesis'], alt4: ['Commando of Conviction', 'Endless Collapse', 'Lunar Cutter', 'Lumingloss', 'Somnoire Anchor'], alt3: ['Sword of Night'] },
    teams: ['Sanhua + Encore + Verina', 'Sanhua + Camellya + Verina', 'Sanhua + Phoebe + Rover: Spectro'] },
  // corrected 2026-08-18 via the wiki's Taoqi/Combat page + the source's Kit/Build/Gameplay tabs (previously
  // had no weaponAlts at all, and only a partial CHARACTER_DATA entry). desc: her Outro Iron Will is a
  // "Resonance Skill DMG Amplified by 38%" per the wiki's own Forte Details text (matches her infobox
  // `role` field's own "Resonance Skill DMG Amplification" tag, see COMBAT_ROLE_DATA above) — not
  // "amplifys", which was unsourced. bestEchoes replaced 'Bell-Borne Geochelone' (the source's shield-focused
  // Main Echo alt, not the top Echo Set) with the source's actual #1 Echo Set 'Rejuvenating Glow 5pc'
  // (paired with Main Echo 'Fallacy of No Return', the source's stated top pick over Bell-Borne Geochelone);
  // 'Moonlit Clouds 5pc' kept as the Special Set alt for the Outro-swap-cancel playstyle. bestWeapon
  // kept as 'Dauntless Evernight' (free/signature) with weaponAlts alt5 'Discord' added — the source's own
  // Best Weapons list only documents these 2 options for her (Discord R5 100%, Dauntless Evernight R5
  // 107.54%; no alt4/alt3 exists in the source's ranking to source). teams replaced 'Taoqi + Camellya +
  // Shorekeeper' (no basis in the source's Synergies tab — Camellya isn't listed at all) with the source's
  // actual documented synergies: Carlotta ("by far Taoqi's best DPS to support") and Jinhsi, both paired
  // with Verina/Shorekeeper per the Example Teams section.
  'Taoqi': { rarity: 4, element: 'Havoc', weapon: 'Broadblade', role: 'Support',
    desc: 'Steadfast border defense director with an iron will. Havoc support who provides shields via Resonance Skill and amplifies the team\'s Resonance Skill DMG through Outro.',
    skills: ['Concealed Edge', 'Fortified Defense', 'Unmovable', 'Power Shift'],
    ascension: { boss: 'Gold-Dissolving Feather', common: 'Howler Core', specialty: 'Iris' },
    skillMaterials: { weeklyDrop: 'Dreamless Feather', forgery: 'Waveworn Residue' },
    // bestWeapon/weaponAlts/bestEchoes corrected 2026-09-03 against a fresh the source dump: bestWeapon was
    // 'Dauntless Evernight' (107.54%, the higher raw %), but this source explicitly lists Discord FIRST
    // at only 100.00% with QOL text calling it "close-to necessary... by far and ahead the biggest
    // contribution to your team DPS" via cutting her notoriously long rotation — the deliberate
    // QOL-over-raw-% pick this page's own disclaimer describes. Also both weapons are 4★ (R5
    // refinement) per this source, not 5★ — weaponAlts.alt5 miscategorized Discord as a 5★ alt.
    // bestEchoes had 3 elements (malformed [main,set] pairing) including Moonlit Clouds — that pairing
    // is filed under this source's "Special Echo Sets", not her actual best pick (Rejuvenating Glow),
    // trimmed per the same convention already applied to Lumi/Baizhi this session.
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc'], bestWeapon: 'Discord',
    weaponAlts: { alt4: ['Dauntless Evernight'] },
    teams: ['Taoqi + Carlotta + Shorekeeper', 'Taoqi + Jinhsi + Verina'] },
  // corrected 2026-08-18 via the wiki's Yuanwu/Combat page (Forte Details, rendered) + the source's
  // Kit/Build/Review/Gameplay tabs (previously only had a partial CHARACTER_DATA entry, no
  // weaponAlts). desc: dropped "generates shields via Resonance Liberation" — Blazing Might's own
  // Forte Details text has no shield at all; the 200%-DEF shield only exists on Resonance Chain S4
  // "Retributive Knuckles" (RESONANCE_CHAIN_DATA below), so it's not part of his base (S0) kit.
  // Corrected to what Liberation actually does: grants team-wide Lightning Infused (Interruption
  // Resistance) and detonates the active Thunder Wedge. bestEchoes replaced 'Nightmare: Tempest
  // Mephis' + 'Empyrean Anthem 5pc' (the source's Special/off-meta set, not the top pick) with the source's
  // actual #1 recommendation: 'Rejuvenating Glow 5pc' (Main Echo 'Fallacy of No Return', triggered via
  // the Originite: Type IV weapon so his Basic ATK self-heal procs the set's teamwide 15% ATK buff —
  // this is literally his only meta use case per the source's Review) with 'Moonlit Clouds 5pc' kept as
  // the alt (Main Echo Impermanence Heron, Outro-swap ATK buff). teams corrected — the source's Synergies
  // tab documents Jinhsi as his ONLY meta pairing (Coordinated ATK stack-feeding for her Forte), run
  // with either Verina or Shorekeeper; 'Yuanwu + Calcharo + Shorekeeper' had no basis in the source at all
  // (Calcharo isn't mentioned anywhere on his page) and was removed.
  'Yuanwu': { rarity: 4, element: 'Electro', weapon: 'Gauntlets', role: 'Support',
    desc: 'Veteran boxing gym owner who fights with thunderous fists. Electro hybrid support who deploys Thunder Wedge for off-field Coordinated Attacks and grants the team Interruption Resistance (Lightning Infused) via Resonance Liberation.',
    skills: ['Leihuangquan', 'Leihuang Master', 'Blazing Might', 'Unassuming Blade'],
    ascension: { boss: 'Hidden Thunder Tacet Core', common: 'Ring', specialty: 'Terraspawn Fungus' },
    skillMaterials: { weeklyDrop: 'Unending Destruction', forgery: 'Cadence' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc', 'Moonlit Clouds 5pc'], bestWeapon: 'Abyss Surges',
    weaponAlts: { alt4: ['Amity Accord', 'Stonard'], alt3: ['Guardian Gauntlets', 'Gauntlets of Voyager', 'Originite: Type IV'] },
    teams: ['Yuanwu + Jinhsi + Verina', 'Yuanwu + Jinhsi + Shorekeeper'] },
  // corrected 2026-08-18 via the wiki's Mortefi/Combat page (Forte Details, rendered) + the source's Kit/
  // Build/Review/Gameplay tabs (previously only had a partial CHARACTER_DATA entry, no weaponAlts).
  // desc: kept largely as-is (Fusion Coordinated ATK + Outro Heavy ATK buff both trace exactly to
  // Violent Finale's Burning Rhapsody and Rage Transposition), just re-worded to flag him as a Hybrid
  // per the source's own classification (he deals meaningful personal Fusion DMG via Fury Fugue/Marcato,
  // not a pure buffer). bestEchoes replaced the bare 'Moonlit Clouds 5pc' with the source's actual #1
  // build — Impermanence Heron (Main Echo) + Moonlit Clouds 5pc, swap-cancelled right before Outro for
  // a stacked ATK/DMG buff on the incoming DPS — and added 'Empyrean Anthem 5pc' as the source's
  // documented #2 alternative for endgame-invested accounts. teams corrected to the source's Synergies
  // tab: 'Mortefi + Galbrena + Lupa' is his explicitly named "Best Team" (Galbrena Mono Fusion, with
  // Lupa called out by name for the mono-Fusion setup); 'Mortefi + Jiyan + Verina' kept since the source's
  // own text calls Jiyan "Mortefi's tailor-made partner" — Heavy ATK DMG Amp is Jiyan's main damage
  // type.
  'Mortefi': { rarity: 4, element: 'Fusion', weapon: 'Pistols', role: 'Sub DPS',
    desc: 'Hot-tempered researcher whose music erupts in violent crescendos. Fusion Hybrid who fires off-field Fusion Coordinated Attacks (Burning Rhapsody) and buffs the on-field character\'s Heavy ATK DMG via Outro.',
    skills: ['Impromptu Show', 'Passionate Variation', 'Violent Finale', 'Fury Fugue'],
    ascension: { boss: 'Rage Tacet Core', common: 'Whisperin Core', specialty: 'Coriolus' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Phlogiston' },
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc', 'Empyrean Anthem 5pc'], bestWeapon: 'Static Mist',
    // alt4 order corrected 2026-09-03 against a real browser snapshot: source ranks Pistols#26
    // (81.87%) ahead of Undying Flame in the listed order — was previously swapped.
    weaponAlts: { alt5: ['The Last Dance'], alt4: ['Relativistic Jet', 'Novaburst', 'Thunderbolt', 'Pistols#26', 'Undying Flame'] },
    teams: ['Mortefi + Galbrena + Lupa', 'Mortefi + Jiyan + Verina'] },
  // audited 2026-08-18: sourced from the wiki's Youhu/Combat page (rendered via the
  // MediaWiki API, section-by-section, since the raw wikitext only transcludes {{Forte Table}}/
  // {{Chain Table}} templates) and the source's Kit/Build/Review/Gameplay tabs.
  // bestEchoes expanded with the source's actual #1/#2 Main Echo picks (Fallacy of No Return now the source's
  // stated top choice over Bell-Borne Geochelone, both on the Rejuvenating Glow 5pc set) plus the
  // documented Special Set alt (Moonlit Clouds 5pc + Impermanence Heron, for the Outro-swap-cancel
  // playstyle). weaponAlts added (previously entirely missing) — alt4 only: the source's Best Weapons tab
  // ranks Marcato (#1, even above her own signature) > Gauntlets#21D (#2) > Abyss Surges (sig, #3) >
  // Celestial Spiral (#4) — no alt5 (5★) or alt3 (3★) weapon is documented there, so none invented.
  // teams corrected: the prior 'Youhu + Carlotta + Zhezhi'/'Youhu + Lingyang + Sanhua' pairings don't
  // match the source's Synergies tab at all (Carlotta/Sanhua aren't Coordinated ATK dealers) — replaced with
  // the source's actual named "Best Team" (Yinlin, her highest-DMG Coordinated ATK partner, paired with
  // Calcharo) and "Zhezhi Team" (Zhezhi + Lingyang), the two teams the source gives full named partners for;
  // a third "Mortefi Team" card exists on the source but lists no partner DPS in its caption text, so it's
  // left out rather than guessed a third member.
  'Youhu': { rarity: 4, element: 'Glacio', weapon: 'Gauntlets', role: 'Support',
    desc: 'Whimsical antique appraiser who trusts her luck in all things. Glacio support who heals the team via Resonance Skill/Forte and grants the incoming Coordinated ATK dealer a massive +100% Coordinated ATK DMG Amp through her Outro (Timeless Classics) — one of the single biggest sources of damage amplification for any attack type in the game.',
    skills: ['Frosty Punches', 'Scroll Divination', 'Fortune\'s Favor', 'Poetic Essence'],
    ascension: { boss: 'Topological Confinement', common: 'Ring', specialty: 'Violet Coral' },
    skillMaterials: { weeklyDrop: 'Monument Bell', forgery: 'Cadence' },
    // bestWeapon/weaponAlts/bestEchoes corrected 2026-09-03 against a fresh the source dump: bestWeapon was
    // 'Abyss Surges' (only #3 by this source's own ranking), but this source explicitly ranks Marcato
    // #1, calling it "Best weapon for Youhu by far thanks to its massive Energy Generation... A top
    // option at S1 or S5" — swapped, with Abyss Surges (a 5★, unlike the other three 4★ options) moved
    // to weaponAlts.alt5. bestEchoes had 5 malformed elements — trimmed to the real #1
    // ([main, set] pair) per the same convention already applied to Lumi/Baizhi/Taoqi this session.
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc'], bestWeapon: 'Marcato',
    weaponAlts: { alt5: ['Abyss Surges'], alt4: ['Gauntlets#21D', 'Celestial Spiral'] },
    teams: ['Youhu + Yinlin + Calcharo', 'Youhu + Zhezhi + Lingyang'] },
  // corrected/added 2026-08-18: desc rewritten to a real bio + gameplay-role summary (the source calls her
  // "primarily utilized as a Hybrid buffer character" whose Outro amplifies Resonance SKILL DMG — a
  // damage type "currently under-serviced in the Hybrid category", per the source's own Review tab; her
  // basic playstyle alternates Yellow Light (ranged, via ally Squeakie) and Red Light (melee) stances).
  // bestEchoes expanded with the source's Build tab: Moonlit Clouds 5pc is her stated #1 Main Echo Set
  // (10% ER, Outro grants the next character +22.5% ATK), with Impermanence Heron as its Main Echo pick
  // (a supportive echo swap-cancelled right before Outro for +12% DMG to the incoming character); Void
  // Thunder 5pc + Nightmare: Thundering Mephis is her listed Special Set for a (non-optimal) Main DPS
  // build. weaponAlts added — the source's Best Weapons ranks Ages of Harvest (108.33%) and Verdant Summit
  // (101.11%) above her own signature Lustrous Razor (100.00%, alt5), and Autumntrace (94.03%) /
  // Waning Redshift (86.84%) as the top 4★ alternatives (alt4); no 3★ option appears on the source's list.
  // teams corrected — the prior 'Lumi + Carlotta + Shorekeeper' / 'Lumi + Jinhsi + Verina' pairings don't
  // match the source's Synergies tab's own named "Example Teams" ('Best Team (Jinhsi)' / 'Best Team
  // (Carlotta)') exactly; replaced with the two real named partners (Jinhsi, Carlotta — both benefit
  // heavily from her Resonance Skill DMG Amp Outro) without inventing a 3rd/4th member the source doesn't
  // itself name for these two team cards (Verina/Shorekeeper are listed only as generic healer options,
  // not tied to a specific named team card).
  'Lumi': { rarity: 4, element: 'Electro', weapon: 'Broadblade', role: 'Sub DPS',
    desc: 'Lollo Logistics navigator who charts paths through thundering skies. Electro Hybrid buffer who alternates ranged Yellow Light and melee Red Light combat stances, dealing Electro DMG considered Basic Attack DMG through most of her kit, and amplifies the next character\'s Resonance Skill DMG by 38% for 10s through her Outro (Escorting) — one of the only sources of Resonance Skill DMG Amp in the game.',
    skills: ['Navigation Support', 'Searchlight Service', 'Squeakie Express', 'Signal Light'],
    ascension: { boss: 'Thundering Tacet Core', common: 'Howler Core', specialty: 'Terraspawn Fungus' },
    skillMaterials: { weeklyDrop: "Sentinel's Dagger", forgery: 'Waveworn Residue' },
    // bestWeapon/bestEchoes corrected 2026-09-03 against a fresh the source dump: bestWeapon was
    // 'Lustrous Razor' (100.00%), but the source explicitly ranks Ages of Harvest ahead of it at
    // 108.33% — "currently also the best broadblade option for Lumi's damage" — Lustrous Razor demoted
    // to weaponAlts.alt5 alongside Verdant Summit (101.11%). bestEchoes also baked in
    // 'Nightmare: Thundering Mephis'/'Void Thunder 5pc' — that pairing is filed under this source's
    // "Special Echo Sets" as an explicitly suboptimal Main-DPS-only option ("if you want to play Lumi
    // as Main DPS, which isn't really that optimal"), not her actual best pick; trimmed to just the
    // real #1 (Impermanence Heron / Moonlit Clouds 5pc), matching every other character's convention of
    // excluding situational Special Echo Sets from bestEchoes.
    bestEchoes: ['Impermanence Heron', 'Moonlit Clouds 5pc'], bestWeapon: 'Ages of Harvest',
    weaponAlts: { alt5: ['Verdant Summit', 'Lustrous Razor'], alt4: ['Autumntrace', 'Waning Redshift'] },
    teams: ['Lumi + Jinhsi', 'Lumi + Carlotta'] },
  // corrected/added 2026-08-18: desc rewritten — a real bio (Black Shores Consultant/"Spiritchaser
  // Taoist" who wanders investigating the strange and mysterious, selling talismans and divination as
  // her trade) plus a gameplay-role summary (the wiki's Combat page + the source's Kit/Review tabs): she
  // heals off-field via Heavy Attacks/Intro/Outro, generates Mountain/Thunder Trigrams off her Basic
  // ATK/Skill/Mid-air Attack to unlock an enhanced Liberation (Flashing Thunder Spell: Harmony) that
  // deploys a Five Thunders Spell Array inflicting Electro Flare and ramping team Resonance Skill DMG
  // Bonus (+10%→+25%, +50% at S6) on ally Intro casts, and her Outro (Exorcism Spell) both heals the
  // active character and Amplifies nearby team DMG by 15% for 30s. bestWeapon corrected — 'Stellar
  // Symphony' had no basis at all (that's Shorekeeper's own signature weapon per weapons.js, not
  // Buling's; she has no dedicated signature weapon on the source's Best Weapons list, which instead ranks
  // generic Rectifier options) — replaced with the source's #1-ranked Stringmaster, with weaponAlts for
  // the rest of the source's list. bestEchoes expanded — the source's Build tab lists Rejuvenating Glow 5pc
  // as her sole Best Echo Set with two named Main Echo options, Fallacy of No Return (preferred) and
  // Bell-Borne Geochelone (budget alt), both added. teams corrected — the prior 'Buling + Carlotta +
  // Zhezhi' / 'Buling + Carlotta + Shorekeeper' pairings don't match the source's Synergies tab, which
  // names only Carlotta and Phrolova as her best DPS partners (both Main Skill DMG-oriented DPS); the
  // 3rd/4th members aren't named there so none are invented, matching the Lumi audit's precedent.
  // Fixed 2026-09-03 against a real browser snapshot: bestEchoes was
  // ['Fallacy of No Return', 'Bell-Borne Geochelone', 'Rejuvenating Glow 5pc'] — both are alternative
  // Main Echoes under the SAME single set (Rejuvenating Glow), but getSonataLoadouts() pairs entries
  // sequentially as [main, set] — with only one set string trailing two main-echo strings, the parser
  // paired the 2nd main echo (Bell-Borne Geochelone) with the set and left the 1st (Fallacy of No
  // Return, the source's actually-preferred pick) as an orphaned row with no set at all. Fixed by
  // repeating the set name for each alt main echo, the same fix pattern as Sanhua's reversed-order bug.
  'Buling': { rarity: 4, element: 'Electro', weapon: 'Rectifier', role: 'Healer',
    desc: 'Black Shores Consultant and Taoist "Spiritchaser Taoist" fortune-teller who wanders investigating the strange and mysterious, selling talismans and divination to fund her travels. Electro healer who generates Trigrams off her Basic ATK/Skill/Mid-air Attack to unlock an enhanced Liberation that deploys Electro Flare and ramps team Resonance Skill DMG Bonus on ally Intro casts, while her Outro heals the active character and Amplifies nearby team DMG by 15% for 30s.',
    skills: ['Hexagram Calls, Lightning Falls', 'In Shadow Thunder Stirs', 'Flashing Thunder Spell', 'Thunder Begets Life'],
    ascension: { boss: 'Blighted Crown of Puppet King', common: 'Whisperin Core', specialty: 'Pecok Flower' },
    skillMaterials: { weeklyDrop: 'Curse of the Abyss', forgery: 'Helix' },
    bestEchoes: ['Fallacy of No Return', 'Rejuvenating Glow 5pc', 'Bell-Borne Geochelone', 'Rejuvenating Glow 5pc'], bestWeapon: 'Stringmaster',
    weaponAlts: { alt5: ['Lethean Elegy', 'Rime-Draped Sprouts', 'Luminous Hymn', 'Cosmic Ripples'], alt4: ['Waltz in Masquerade'] },
    teams: ['Buling + Carlotta', 'Buling + Phrolova'] },
};

// Structured combat data — derived from desc fields. Merged into CHARACTER_DATA.
// Format: [name, dmgFocus[], buffs[], debuffs[]]
// dmgFocus terms: Basic ATK, Heavy ATK, Skill, Liberation, Echo, Coordinated ATK
// Every character must have complete dmgFocus
[
  // 5★ Main DPS
  // dmgFocus corrected 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c) against his own dump's Damage
  // Profile: Liberation is a genuine 0% share — his kit text is explicit both Liberation-slot casts
  // (Prelude entering Qingloong Mode, and Finale) are "considered Heavy Attack DMG", the same "no true
  // libDmg damage at all" pattern already found/fixed for Augusta. No jiyan.blocks.js block is
  // libDmg-categorized at all, confirming it. Skill (8.9%, real, already correctly skillDmg-categorized
  // as jiyan.skill.windqueller, fires twice in his real rotation) was missing and is added instead.
  ['Jiyan',         ['Heavy ATK', 'Skill'],           [],                                      []],
  // dmgFocus gained 'Outro' 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): Outro (Shadowy Raid) is a
  // genuine 7.6% (29,693) damage share — his own direct damage on swap-out, not a team buff — now fixed
  // to outroDmg category in calcharo.blocks.js (was uncategorized, silently rejecting Outro DMG Bonus).
  // Intro (Wanted Outlaw, 5.1%/20,081) also got its missing skillDmg category fixed this pass, but stays
  // OUT of dmgFocus: 5.1% sits in the ambiguous gap between this project's own established exclude
  // (4.6%/5.5%, Rover: Spectro) and include (6.8%+, Yinlin/Denia/Iuno) precedents, and is nearer the
  // exclude side — treated as "low single digits" per the same convention as Lucy's dropped Liberation
  // focus, not a guess. Echo (5.2%) stays excluded too — generic equipped-Echo damage, not his own kit's
  // Echo Skill button, same distinction already drawn for Rover: Spectro. Resonance Skill (Extermination
  // Order, 2.3%/9,050) is real but never fires in the app's own modeled CHARACTER_ROTATIONS (the dump's
  // own "Optimized Burst Combo" skips straight from Intro to Liberation) — no engine block needed for it,
  // same "deliberately unmodeled, not a bug" precedent as Rover: Havoc's skipped Basic ATK step.
  ['Calcharo',      ['Liberation', 'Basic ATK', 'Outro'], [],                                  []],
  // dmgFocus gained 'Liberation'/'Outro' 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c) against her
  // own dump's Damage Profile: Liberation (Cosmos Rupture) is a genuine 14.6% (44,546) share and Outro
  // (Thermal Field) a real 12.9% (39,258) — her 2nd- and 3rd-largest damage buckets — now fixed to
  // libDmg/outroDmg categories in encore.blocks.js (both were uncategorized, silently rejecting
  // teammate DMG Bonus buffs). Echo (7.1%) stays excluded — generic equipped-Echo damage, not her own
  // kit's Echo Skill button, same distinction drawn for Rover: Spectro/Calcharo. Intro (2.85%) also got
  // its missing skillDmg category fixed this pass but stays out of dmgFocus — low single digits, same
  // exclusion precedent as Lucy's dropped Liberation focus.
  ['Encore',        ['Basic ATK', 'Skill', 'Liberation', 'Outro'], [],                        []],
  // dmgFocus corrected 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c) against his own dump's Damage
  // Profile: was ['Basic ATK'] only (33.8%) — Skill is a near-tied 2nd-biggest bucket (31.7%/101,511,
  // entirely missing), Outro a real 13.9% (44,664, 3rd-largest, now outroDmg-categorized), and
  // Liberation a real 7.3% (23,550) — all 3 already correctly skillDmg/outroDmg/libDmg-categorized in
  // lingyang.blocks.js, were silently rejecting real teammate DMG Bonus buffs. Heavy ATK (5.8%/10,209,
  // now heavyDmg-categorized) and Intro (~4.25%/13,631, now skillDmg-categorized) both stay out of
  // dmgFocus — same ambiguous-zone exclusion as Calcharo's/Jianxin's Intro. Echo (5.77%) stays excluded
  // too — generic equipped-Echo damage, not his own kit's Echo Skill button.
  ['Lingyang',      ['Basic ATK', 'Skill', 'Outro', 'Liberation'], [],                        []],
  ['Jinhsi',        ['Skill', 'Liberation'],         [],                                      []],
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) against his own dump's Damage
  // Profile: Basic ATK (8%, already basicDmg-categorized via xianglyao.basic.intuition-pivot-impale)
  // was missing despite being above this project's established 6.8% include threshold. Outro (5.1%)
  // stays excluded — sits in the established ambiguous-exclude zone (4.6-5.5%), same precedent as
  // Calcharo's Intro at 5.1%. Echo (5%) stays excluded — generic equipped-Echo damage.
  ['Xiangli Yao',   ['Skill', 'Liberation', 'Basic ATK'], [],                                  []],
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): 'Skill' was WRONG — a genuine
  // 0% real share per her own dump's Damage Profile (every Skill-button move — Crimson Blossom, the
  // Vining Waltz/Blazing Waltz combo, Floral Ravage, Ephemeral — is explicitly "considered Basic Attack
  // DMG" per kit text, confirmed and fixed to basicDmg category in camellya.blocks.js this same pass).
  // 'Liberation' (16.5%/78,645, her 2nd-largest bucket, already correctly libDmg-categorized on
  // camellya.liberation.fervor-efflorescent) was entirely missing.
  ['Camellya',      ['Basic ATK', 'Liberation'],     [],                                      []],
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): 'Liberation' was a genuine
  // FABRICATED-zero bug — the dump's own Damage Profile shows a literal 0% Liberation share (all 3
  // Twilight Tango moves are explicitly "considered Resonance Skill DMG" per kit text, already
  // correctly `skillDmg`-categorized in carlotta.blocks.js, none `libDmg`), and the dump's own
  // Substats priority list names only "Resonance Skill DMG" (no Liberation DMG substat at all) — same
  // shape as Jiyan's earlier dmgFocus fix. 'Skill' (83.5%, dominant, real) stays. Basic ATK (8.3%,
  // real per Damage Profile) has no wired basicDmg block in carlotta.blocks.js at all (no
  // CHARACTER_ROTATIONS step casts plain Basic Attack — her rotation's Necessary Measures/Basic ATK
  // contribution is unattributed to any specific modeled step, same "flagged not guessed" precedent as
  // Lumi's unmodeled Skill bucket) and isn't named in the dump's own Substats priority either, so left
  // out rather than added on an unsourced guess.
  ['Carlotta',      ['Skill'],                       [],                                      []],
  // dmgFocus corrected 2026-09-04 (Phase A REDO, REMAINING_WORK.md 1c): 'Skill' was WRONG — a genuine
  // 0% real share per his own dump's Damage Profile. His Skill button (Anchors Aweigh!) is never cast
  // for damage in the real rotation (only Plunging Attack optionally, immediately Ultimate-cancelled,
  // and itself "considered Basic Attack DMG" per kit text — no block is skillDmg-categorized in
  // brant.blocks.js at all). 'Liberation' (18.1%/44,052, his 2nd-largest bucket, already correctly
  // libDmg-categorized on brant.liberation.to-the-horizon) was entirely missing — same shape as
  // Camellya's fix just above.
  ['Brant',         ['Basic ATK', 'Liberation'],     ['Self-heal'],                           []],
  // dmgFocus corrected 2026-08-18: 'Skill' had no basis as a primary focus — Zani's Forte/Resonance Skill
  // is mainly used to build Redundant Energy/convert Frazzle stacks into Heliacal Ember, while her actual
  // rotation damage comes from Heavy Slash combos (Heavy ATK, scaled further by her Inferno Mode +40%
  // Heavy Slash multiplier) and her Resonance Liberation Rekindle (+120% multiplier), which build guides
  // note she "needs to deal most of her damage."
  ['Zani',          ['Heavy ATK', 'Liberation'],     [],                                      ['Frazzle']],
  // dmgFocus corrected 2026-09-02 against a fresh the source dump's own damage-profile breakdown: was
  // ['Basic ATK'] only — but her real profile is Basic 51.6% / Liberation 23.6% / Debuff(Erosion) 12.5%
  // / Skill 6.6% / Intro 3.4% / Echo 3.4%. Liberation is a major, second-largest share (Blade of
  // Howling Squall + the libDmg-categorized Fleurdelys transform hits) — missing it meant any
  // teammate's Liberation DMG Bonus buff was silently dropped for her. Skill stays excluded (6.6%,
  // comparable to Intro's un-included 3.4%, same "too minor to warrant inclusion" bar already applied
  // elsewhere, e.g. Zani's own dmgFocus correction above).
  ['Cartethyia',    ['Basic ATK', 'Liberation'],     [],                                      ['Erosion']],
  ['Phrolova',      ['Echo', 'Skill'],               [],                                      []],
  // dmgFocus corrected 2026-09-02 (final Augusta audit pass, cross-checked against a fresh the source
  // dump): was ['Heavy ATK', 'Liberation'] — but EVERY one of her Liberation-slot damage instances is
  // explicitly "considered as Heavy Attack DMG" per her own kit text (Sword of Eternal Oath, Sunborne,
  // Everbright Protector all say so) — she has ZERO true Liberation-categorized damage. Her real
  // second damage type is Skill (Warrior's Blade + Undying Sunlight: Strike/Leap, none reclassified —
  // only Undying Sunlight: Plunge is, to Heavy ATK). This field gates scoreTeamComposition's type-
  // specific buff matching (buffApplies/dpsFocus) — was wrongly crediting a libDmg buff as applying to
  // her (she has none) and wrongly rejecting a skillDmg buff (she has real Skill damage).
  ['Augusta',       ['Heavy ATK', 'Skill'],          ['Shield'],                              []],
  ['Galbrena',      ['Echo', 'Heavy ATK'],           [],                                      []],
  ['Luuk Herssen',  ['Basic ATK'],                   [],                                      []],
  // dmgFocus corrected 2026-09-02 (fresh the source dump cross-check, same class of bug as Augusta's):
  // was ['Liberation', 'Skill'] — but the source's own real damage-output simulation shows Skill at a
  // genuine 0% for her, matching her kit text exactly: both Seraphic Duet: Overture and Encore (her
  // only Skill-button casts) are explicitly "considered Resonance Liberation DMG". She has no real
  // skillDmg-categorized damage at all — a skillDmg buff was being wrongly credited to her.
  ['Aemeath',       ['Liberation'],                  [],                                      ['Fusion Burst']],
  // dmgFocus dropped 'Heavy ATK' 2026-09-02 against a fresh the source dump: her real damage-output
  // simulation shows Heavy at a genuine 0% share, matching her kit text exactly — "Heavy Attack -
  // Schemata of Runes deals Echo Skill DMG" and every Runic Outburst/Chain Whip/Soliskin variant is
  // explicitly "(considered Echo Skill DMG)". She has no real heavyDmg-categorized damage at all (the
  // engine blocks' own heavyDmg category on those two hits was itself a bug, fixed alongside this).
  ['Sigrika',       ['Echo'],                        [],                                      []],
  // dmgFocus corrected 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c) against her own dump's Damage
  // Profile: 'Basic ATK' was WRONG — she deals a genuine 0% Basic ATK share (no basicDmg-categorized
  // damage block exists anywhere in chixia.blocks.js at all; the one kit path that WOULD deal Basic
  // Attack DMG, exiting DAKA DAKA! below 30 Thermobaric Bullets, never fires in her real modeled
  // rotation, matching the dump's explicit "Basic 0%"). Liberation (32.5%, 2nd-largest bucket) and
  // Outro (9.6%) were both entirely missing, despite Liberation already correctly libDmg-categorized
  // and Outro now outroDmg-categorized above. Echo (7.3%) stays excluded — generic equipped-Echo
  // damage. Intro (~3.35%) also got its missing skillDmg category fixed this pass but folds into the
  // already-included Skill category rather than needing its own tag.
  ['Chixia',        ['Skill', 'Liberation', 'Outro'], [],                                      []],
  // dmgFocus gained 'Basic ATK' 2026-09-02 against a fresh the source dump: her damage-output simulation
  // shows Basic at a genuine 22.8% share (Basic Attack - Stringblade + Ephemeral Transcendence's own
  // Basic Attack, both correctly categorized basicDmg in the engine blocks) — comparable in size to
  // Liberation's 28.5%, not a trivial slice that should be gated out of basicDmg-buff relevance.
  // dmgFocus gained 'Outro' 2026-09-04 (full 9-dimension re-audit, fresh dump): Lingering Song is a
  // genuine 10.8% (213,574 of 1,983,070) damage share per the dump's own Damage Profile — her 4th-
  // largest bucket, above the established 6.8%+ include threshold (e.g. Calcharo's Outro at 7.6%,
  // Encore's at 12.9%) and well clear of the exclude zone (Echo 4.1%/Skill 1.4%/Intro 1.3% correctly
  // stay out). Now outroDmg-categorized in qingxiao.blocks.js (was uncategorized, silently rejecting
  // Outro DMG Bonus buffs — same fix class as Lynae/Mornye/Phoebe's missing-category bugs).
  ['Qingxiao',      ['Heavy ATK', 'Liberation', 'Basic ATK', 'Outro'], [],                        ['Tune Strain - Interfered']],
  ['Jingran',       ['Heavy ATK', 'Liberation'],     [],                                      []],
  ['Yangyang: Xuanling', ['Heavy ATK', 'Basic ATK'], [],                                      ['Havoc Bane']],
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) against the fresh dump's own
  // Damage-Type Breakdown table: Basic ATK is a genuine 0% share (every nominal Basic/Heavy/Intro cast
  // in the real rotation happens while in Foreclaimed Self, where it's explicitly reclassified to
  // Resonance Liberation DMG per kit text) — dropped. Skill (6.1%, real, Frostblight/Jade Cleave/
  // Petalfall) was missing and is added — Liberation (60.8%) remains the dominant focus.
  ['Hiyuki',        ['Liberation', 'Skill'],          [],                                      ['Glacio Chafe']],
  // dmgFocus corrected 2026-08-18: 'Liberation' had no basis as a second focus — a tested personal-damage
  // breakdown (the source) shows Lucy's rotation is 77.70% Heavy ATK DMG with Tune Break at 17.10% and her
  // Resonance Liberation (Netrunner) in "low single digits"; Liberation replaced with a second 'Heavy ATK'-
  // adjacent focus removed entirely since no other listed dmgFocus term reflects Tune Break DMG.
  ['Lucy',          ['Heavy ATK'],                   [],                                      ['Hack - Shifting']],
  // 5★ Sub DPS
  // dmgFocus gained 'Heavy ATK' 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c) against her own dump's
  // Damage Profile: Heavy is a genuine 9.2% (15,731) share, comparable to already-included categories
  // elsewhere (contrast the "low single digits" exclusion precedent on Lucy's dropped Liberation focus)
  // — was silently rejecting a real teammate Heavy ATK DMG Bonus. Basic ATK (4.6%) and the equipped
  // Echo's own damage (5.5%, not her own kit's Echo Skill button — a different character shape
  // entirely, e.g. Sigrika/Galbrena) both stay excluded, consistent with that same precedent.
  ['Rover: Spectro', ['Skill', 'Liberation', 'Heavy ATK'], [],                                 ['Frazzle']],
  // dmgFocus gained 'Liberation'/'Skill' 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c) against her
  // own dump's Damage Profile: Liberation is a genuine 26.2% (113,642) share — her 2nd-LARGEST damage
  // bucket, entirely missing — and Skill is a real 10.9% (80,530), both correctly libDmg/skillDmg-
  // categorized in roverhavoc.blocks.js already. Was silently rejecting real teammate Liberation/Skill
  // DMG Bonus buffs. Basic ATK stays included even though the app's chosen "Short Burst Combo"
  // CHARACTER_ROTATIONS variant deliberately skips Basic Attacks (per the dump's own Review section) —
  // dmgFocus describes her real kit capability, not this one rotation choice.
  ['Rover: Havoc',   ['Heavy ATK', 'Basic ATK', 'Liberation', 'Skill'], ['Crit Rate Buff'],   ['Havoc RES Shred']],
  // dmgFocus gained 'Liberation' 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c) against her own
  // dump's Damage Profile: Liberation is a genuine 18.9% (21,860) share — her 2nd-largest damage
  // bucket, already correctly libDmg-categorized in roveraero.blocks.js — was silently rejecting a
  // real teammate Liberation DMG Bonus.
  ['Rover: Aero',    ['Skill', 'Liberation'],         ['Heal', 'Erosion Cap Buff'],            []],
  ['Rover: Electro', ['Skill', 'Liberation'],        ['ATK Buff', 'All DMG Amp'],             ['Electro Flare']],
  // dmgFocus gained 'Liberation'/'Heavy ATK' 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c) against
  // her own dump's Damage Profile: Liberation is a genuine 14.3% (51,751) share and Heavy ATK a real
  // 6.8% (24,590), both already correctly libDmg/heavyDmg-categorized in yinlin.blocks.js
  // (yinlin.liberation.thundering-wrath, yinlin.heavy.standard) — were silently rejecting real
  // teammate Liberation/Heavy ATK DMG Bonus buffs.
  ['Yinlin',        ['Coordinated ATK', 'Skill', 'Liberation', 'Heavy ATK'], ['Coordinated ATK'], []],
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) against her own dump's Damage
  // Profile: was just ['Skill'] (61.4%) — Liberation (23.8%, her 2nd-biggest bucket, already libDmg-
  // categorized in changli.blocks.js) was entirely missing, and Heavy ATK (6.1%, already heavyDmg-
  // categorized) sits just above this project's own 6.8%-include/5.5%-exclude ambiguous-zone boundary's
  // midpoint — included per the same "genuine, already-categorized, not negligible" standard as Yinlin's
  // Heavy ATK. Basic ATK (4.4%) and Intro (~2.25%, 8103/359942) stay excluded — both land inside or below
  // the established ambiguous-exclude zone. Echo (22122) stays excluded — generic equipped-Echo damage,
  // not her own kit's Echo Skill button.
  ['Changli',       ['Skill', 'Liberation', 'Heavy ATK'], ['Fusion DMG Amp'],                  []],
  // dmgFocus/buffs corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): both columns said
  // 'Coordinated ATK' — but her Living Canvas spirits and S5's bonus proc are both explicitly
  // "considered Basic Attack DMG" in the kit text (fixed in zhezhi.blocks.js this same pass, was
  // wrongly coordDmg), so she has ZERO real coordDmg-category damage of her own. 'Skill' (5.4% real
  // share per this source's own Damage Profile) sits in this project's established ambiguous-exclude
  // zone (4.6-5.5%). 'Basic ATK' (78.4%, her dominant real bucket, matching the profile's own numbers)
  // was entirely missing from both columns.
  ['Zhezhi',        ['Basic ATK'],                    ['Basic ATK'],                           []],
  ['Roccia',        ['Basic ATK'],                   ['Basic ATK Amp'],                       []],
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): 'Skill' was wrong as the sole
  // focus — the dump's own Damage Profile has Skill at only 3.6% (13,133), in this project's established
  // ambiguous-exclude zone. Her three real dominant buckets are Heavy ATK 43.8% (463,904 — Starflash +
  // Absolution Litany, the latter explicitly named "Heavy Attack: Absolution Litany" in the dump and
  // recategorized to heavyDmg this same pass), Liberation 17.2% (181,976), and Basic ATK 14.3%
  // (151,021 — Chamuel's Star, explicitly "considered Basic Attack DMG" per the dump and recategorized
  // from skillDmg to basicDmg this same pass). Same category-vs-dump-text miscategorization bug class
  // already found on Luuk Herssen/Zhezhi/Cantarella.
  ['Phoebe',        ['Heavy ATK', 'Liberation', 'Basic ATK'], [],                              ['Frazzle']],
  // dmgFocus/buffs corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) — same bug shape as
  // Zhezhi's fix just above: 'Coordinated ATK' was wrong in BOTH columns. Kit text is explicit both
  // Flowing Suffocation and its Diffusion summon-chain are "considered Basic Attack DMG" (fixed in
  // cantarella.blocks.js this same pass, was wrongly libDmg/coordDmg) — she has ZERO real coordDmg-
  // category damage of her own, confirmed by the dump's own Damage Profile (Liberation 0%, Basic ATK
  // 69.1% — her dominant bucket). dmgFocus gained 'Basic ATK' (69.1%), 'Skill' (9.8%, Graceful Step +
  // Flickering Reverie, already skillDmg) and 'Heavy ATK' (7.2%, Delusive Dive, already heavyDmg) — all
  // real, already-categorized, non-negligible shares that were previously silently rejecting teammate
  // DMG Bonus buffs of those types. buffs column fixed to what she actually grants via her Outro
  // (Havoc DMG Amp + Skill DMG Amp, CHAR_BUFF_TABLE's own outroBuffs) plus Heal (Trance/Shiver
  // consumption + Perception Drain).
  ['Cantarella',    ['Basic ATK', 'Skill', 'Heavy ATK'], ['Havoc DMG Amp', 'Skill DMG Amp', 'Heal'], []],
  // 'Coordinated ATK' tag corrected 2026-08-17: Ciaccona has no Coordinated Attack mechanic at all —
  // the source's own review explicitly notes she's "similar to Coordinated Attackers (even though she
  // isn't one)". Her off-field damage instead comes from Ensemble Sylph clones (Basic ATK) and her
  // Liberation's lingering Recital state.
  // Corrected 2026-09-02 against a fresh the source dump's own damage-profile breakdown: 'Heavy ATK' and
  // 'Liberation' were both missing despite being her 2nd- and 1st-largest real damage categories
  // (Heavy 40,925 via Quadruple Downbeat, Liberation 67,722 via Singer's Triple Cadenza + Symphonic
  // Poem: Tonic — both bigger than 'Skill', which stayed in dmgFocus at just 9,370) — meant any
  // teammate's Heavy ATK or Liberation DMG Bonus buff was silently routed to zero for her in
  // calcTeamStats.js's routeTypeBonuses(). Same class of finding as Cartethyia's own dmgFocus fix.
  // buff tag normalized 2026-09-06 (filter audit): 'Aero Buff' → 'Aero DMG Buff' — every other elemental
  // team buff in this table is named "<Element> DMG Buff" (Fusion/Glacio/Havoc); the odd-one-out naming
  // meant this tag matched neither the 'DMG' nor any element-specific filter bucket.
  ['Ciaccona',      ['Basic ATK', 'Heavy ATK', 'Liberation', 'Skill'], ['Aero DMG Buff'],      ['Erosion']],
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) — 'Heavy ATK' was missing despite
  // being a real, non-negligible damage share (~6.5% per the dump's own damage-profile breakdown, via
  // Wolf's Claw + Firestrike, both real steps in her modeled rotation) — above this file's established
  // 4.6-5.5% ambiguous-exclude zone (see Zhezhi/Cantarella's own dmgFocus comments), so a teammate's
  // Heavy ATK DMG Bonus buff was silently routed to zero for her in calcTeamStats.js's routeTypeBonuses().
  // 'Basic ATK' (~5.1%) and 'Echo' (~5%) both sit inside that ambiguous zone and are left out, consistent
  // with the same precedent.
  ['Lupa',          ['Liberation', 'Skill', 'Heavy ATK'], ['DMG Buff'],                        ['Fusion RES Shred']],
  // dmg-type tag corrected 2026-09-02 against a fresh the source dump: 'Heavy ATK' was wrongly kept for
  // Absolute Fullness (the 2026-08-17 correction's own comment claimed it was "true Heavy ATK" — wrong,
  // its kit text explicitly says "considered as Resonance Liberation DMG", same as her other
  // Heavy-ATK-slot moves). Her real damage-profile calc page confirms a flat 0% Heavy ATK share in both
  // her DPS and Hybrid rotations — 'Liberation' alone is her real dmgFocus (Basic Moonring combo is
  // real Basic ATK DMG but goes unused in her modeled rotation entirely, per the same calc page).
  ['Iuno',          ['Liberation'],                  ['Heavy ATK Buff', 'Heal', 'Shield'],    []],
  // dmg-type tag corrected 2026-08-17: Qiuyuan's actual rotation damage (Inkwash Basic ATK Stage 3-4 and
  // his Forte Heavy Attack finishers) is explicitly "considered as Heavy Attack DMG" per the source's kit
  // breakdown, and the Forte finishers are additionally "considered as performing Echo Skill" — his
  // Liberation/Intro are also tagged Heavy ATK. Previously listed as purely ['Echo'], missing the
  // majority Heavy ATK component entirely.
  ['Qiuyuan',       ['Heavy ATK', 'Echo'],           ['Echo DMG Buff', 'Crit DMG Amp'],       []],
  // dmg-type/buff tags corrected 2026-08-17: Chisa was tagged as purely ['Skill'] with no buff tags at
  // all — but per the source, her base Skill is barely used (too little Forte/Energy to be worthwhile
  // outside the Opener) and her actual rotation damage is Basic ATK (incl. Death Snip/Thread Withdrawn)
  // and her Forte's Sawring Blitz/Eradication, both explicitly "considered Resonance Liberation DMG".
  // Buff tags were also entirely missing her Heal (Moment of Nihility/Death Snip) and Shield (Sawring -
  // Eradication) kit.
  ['Chisa',         ['Basic ATK', 'Liberation'],     ['Heal', 'Shield'],                      ['DEF Shred']],
  // dmgFocus corrected 2026-09-02 against a fresh the source dump: was ['Liberation', 'Skill'] — but the
  // damage-output pie chart shows Basic ATK at a dominant 38.1% share (202,837 of 532,802 total DMG),
  // LARGER than Liberation's 13.9% and far larger than Skill's trivial 4.4% (same "not a trivial slice"
  // vs. "trivial slice" distinction as Qingxiao's kept 22.8% vs. Denia's dropped 1.75%). Basic ATK's
  // real share comes mostly from Basic Attack - Visual Impact/Iridescent Splash (1216.72%/304.18%,
  // literally named "Basic Attack -" in their own move text, not a Forte-exclusive category) — the
  // engine block for Visual Impact had no damage.category at all (fixed alongside this), silently
  // missing every real Basic ATK DMG buff from teammates on her single biggest hit.
  // debuff tag corrected 2026-09-06 (filter audit): 'Off-Tune' isn't a real debuff applied to enemies —
  // it doesn't appear anywhere in her own official Combat Role tags (COMBAT_ROLE_DATA below has no
  // Off-Tune-related entry for her at all, unlike Mornye's genuine 'Off-Tune Buildup Efficiency' role) —
  // removed rather than reclassified since there's no evidence it was ever a real tag for her.
  ['Lynae',         ['Basic ATK', 'Liberation'],     ['Tune Break DMG Buff'],                 []],
  // dmg-type tag corrected 2026-08-18: Danjin's own the source kit breakdown says the Resonance Skill is
  // "the core of her kit, which all of her combo options revolve around" (Crimson Fragment/Erosion,
  // Sanguine Pulse) — 'Skill' was missing entirely. buff tag corrected: her Outro is worded "23% Havoc
  // DMG Amplify" (not "Bonus") per the source's own rotation writeup, matching the `amplify` stat key used
  // in CHAR_BUFF_TABLE below.
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) against her own dump's Damage
  // Profile: 'Basic ATK' was WRONG — no basicDmg-categorized damage block exists anywhere in
  // danjin.blocks.js at all, and her real CHARACTER_ROTATIONS never casts a standalone Basic Attack
  // step (Basic ATK 2/3 are only referenced as prerequisites unlocking her Skill combos, never their
  // own modeled step). Liberation — her single BIGGEST damage bucket (29.7%/56,602), already correctly
  // libDmg-categorized — was entirely missing. Echo stays excluded — generic equipped-Echo damage, not
  // her own kit's Echo Skill button.
  ['Danjin',        ['Heavy ATK', 'Skill', 'Liberation'], ['Havoc DMG Amplify'],                []],
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) against his own dump's Damage
  // Profile: 'Heavy ATK' was WRONG — a genuine 0% real share, no heavyDmg-categorized damage block
  // exists anywhere in mortefi.blocks.js (he has no plain Heavy ATK/Mid-air/Dodge Counter step at all in
  // his real CHARACTER_ROTATIONS — his Outro instead GRANTS a Heavy ATK DMG buff to an ally, a team buff
  // not his own damage). Liberation (67%, his single dominant bucket), Skill (17.8%), and Basic ATK
  // (8.2%) were all entirely missing despite already being correctly libDmg/skillDmg/basicDmg-
  // categorized. 'Coordinated ATK' is kept — his base-kit Burning Rhapsody Marcato procs (ally Basic/
  // Heavy ATK hits triggering off-field Coordinated Attacks) are real, sourced, S0 kit per the dump's
  // own calc methodology note, just not yet engine-modeled (only the S1/S5 chain-BONUS procs are — see
  // REMAINING_WORK.md 1a, a genuinely bigger gap than a data fix, flagged not attempted here). Echo
  // (7.27%) stays excluded — generic equipped-Echo damage. Intro (4.1%) also got its missing skillDmg
  // category fixed but folds into the already-included Skill category.
  ['Mortefi',       ['Liberation', 'Skill', 'Basic ATK', 'Coordinated ATK'], ['Heavy ATK DMG Buff', 'Coordinated ATK'], []],
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): 'Basic ATK' was WRONG — her
  // dump's own Damage Profile shows a genuine 0% Basic ATK share, and no basicDmg-categorized damage
  // block exists anywhere in sanhua.blocks.js at all. Her 3 real damage buckets — Heavy 34.7% (Detonate,
  // 42,821), Liberation 27.6% (33,188), Skill 26.9% (Eternal Frost + Ice Burst, 33,188) — were entirely
  // missing, despite Liberation already being correctly libDmg-categorized and Heavy/Skill now correctly
  // split apart (see sanhua.blocks.js — Detonate/Ice Burst were previously combined into one wrongly-
  // heavyDmg block despite the kit text separately labeling Ice Burst "considered Resonance Skill DMG").
  // Echo (8.44%) and Intro (6.4%, folds into the already-included Skill category) stay out per
  // established precedent.
  ['Sanhua',        ['Heavy ATK', 'Liberation', 'Skill'], ['Basic ATK Amp'],                  []],
  // dmgFocus corrected 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was ['Coordinated ATK'] — a
  // fabricated/wrong entry, since Aalto has NO Coordinated Attack mechanic anywhere in his kit (no
  // mention in the dump, no coordDmg block in aalto.blocks.js). His real dump's Damage Profile shows
  // Basic ATK 35.7% (dominant), Skill 31%, Liberation 14.8%, and Intro ~10% (now folded into the
  // already-included Skill category via aalto.intro.feint-shot's skillDmg fix, since both share the
  // dump's generic "Skill Damage" row label) — all real, all silently uncredited. Echo (11.9%) stays
  // excluded — generic equipped-Echo damage, not his own kit's Echo Skill button.
  ['Aalto',         ['Basic ATK', 'Skill', 'Liberation'], [],                                  []],
  // dmgFocus corrected 2026-08-18: her Forte Details table (the wiki's Lumi/Combat page) funnels nearly
  // every attack — Energized Pounce/Rebound, Glare, Red Spotlight Basic/Heavy ATK, Laser — into "counted
  // as Basic Attack DMG" explicitly; only her Liberation (Squeakie Express) and Resonance Skill
  // (Pounce/Rebound, which the source's own Review calls "minimal damage") aren't Basic ATK, so 'Skill' had
  // no basis as her focus. buffs 'Skill DMG Amp' unchanged (matches her real Outro Escorting effect).
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) against her own dump's Damage
  // Profile: Liberation (29.6%, 2nd-biggest bucket, libDmg-categorized) was entirely missing despite
  // being far above this project's 6.8% include threshold. Echo (4.6%) stays excluded — generic
  // equipped-Echo damage. Intro (~4.1%) stays excluded — below threshold and not a valid dmgFocus
  // vocabulary term regardless. The profile's 3rd bucket, Skill (26.3%), is NOT added — no block in
  // lumi.blocks.js is skillDmg-categorized for anywhere near that share (only Intro, ~4.1%); Energized
  // Pounce/Rebound are explicitly "counted as Basic Attack DMG" per kit text, not Skill. Flagged as an
  // open question rather than guessed — see REMAINING_WORK.md.
  ['Lumi',          ['Basic ATK', 'Liberation'],      ['Skill DMG Amp'],                       []],
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) against her own dump's Damage
  // Profile: Liberation is her single BIGGEST damage bucket (42.1%/53,643), already correctly libDmg-
  // categorized, entirely missing. Basic ATK gained 2 real basicDmg sources this pass: Zephyr Song
  // (fired 2x in her real rotation) was miscategorized heavyDmg, and Feather Release was uncategorized —
  // both fixed, see yangyang.blocks.js. Echo (9.5%) stays excluded — generic equipped-Echo damage.
  ['Yangyang',      ['Skill', 'Liberation', 'Basic ATK'], ['Energy Regen'],                    []],
  // 5★ Support / Healer
  // dmgFocus gained 'Basic ATK' 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): her dump has no
  // Damage Profile percentages (a Support, unlike DPS characters' dumps), but 2 real basicDmg-
  // categorized blocks already exist in verina.blocks.js — her actual Basic ATK combo (Cultivation
  // Stage 3-5) AND Forte's Mid-air Starflower Blooms (override-categorized "considered Basic Attack
  // damage" per its own kit text, firing 3x in her real rotation) — both were silently rejecting real
  // teammate Basic Attack DMG Bonus. Coordinated ATK (from her S6-gated Coordinated Attack proc) stays
  // excluded — dupe-conditional, not part of her S0 baseline kit, consistent with how the dump's own
  // Damage Profile convention (S0-only) is applied elsewhere.
  ['Verina',        ['Liberation', 'Basic ATK'],     ['ATK Buff', 'DMG Amplify', 'Heal'],      []],
  ['Shorekeeper',   ['Liberation'],                  ['Crit Buff', 'Heal'],                   []],
  // dmgFocus corrected 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c) against her own dump's Damage
  // Profile: was ['Skill'] only (8%) — Liberation is her single BIGGEST damage bucket (36.1%/56,486),
  // Basic ATK her 2nd-biggest (30.9%/48,268), and Heavy ATK a real 12.1% (18,878, now heavyDmg-
  // categorized on jianxin.forte.primordial-chi-spiral above) — all 3 already correctly
  // libDmg/basicDmg/heavyDmg-categorized in jianxin.blocks.js, were silently rejecting real teammate
  // DMG Bonus buffs on the majority of her damage. Echo (7.9%) stays excluded — generic equipped-Echo
  // damage, not her own kit's Echo Skill button. Intro (~5%/7,749) also got its missing skillDmg
  // category fixed this pass but stays out of dmgFocus — same ambiguous-zone exclusion as Calcharo's
  // Intro.
  // buff tag normalized 2026-09-06: same 'Aero Buff' → 'Aero DMG Buff' naming fix as Ciaccona above.
  ['Jianxin',       ['Skill', 'Liberation', 'Basic ATK', 'Heavy ATK'], ['Shield', 'Grouping', 'Aero DMG Buff'], []],
  // debuff tag corrected 2026-09-06 (filter audit): 'Off-Tune' was miscategorized as a debuff — it's
  // actually her real official Combat Role tag 'Off-Tune Buildup Efficiency' (see COMBAT_ROLE_DATA
  // below), a team-buildup-rate buff she grants, not a status applied to enemies. Moved to buffs.
  ['Mornye',        ['Liberation'],                  ['Heal', 'Off-Tune Buildup Efficiency'], []],
  // dmgFocus corrected 2026-09-02 against a fresh the source dump's own damage-profile breakdown: was
  // ['Basic ATK', 'Heavy ATK'], but her literal 'Heavy ATK' category is 0 — her real Rat-tat-tat!/
  // Bang-bang-bang! Forte Heavy Attack AND her whole Liberation sequence (Mk. 31 HMG + BOOM!
  // Fireworks!) are both explicitly "considered Basic Attack DMG" per her own kit text (confirmed by
  // the profile's own Liberation bucket also reading exactly 0). 'Skill' is her only other real nonzero
  // category (20,774, vs. Heavy ATK's true 0) — replaced 'Heavy ATK' with 'Skill'.
  ['Rebecca',       ['Basic ATK', 'Skill'],          ['Heavy ATK Buff', 'All DMG Amp'],       ['Hack - Shifting']],
  // dmgFocus dropped 'Skill' 2026-09-02 against a fresh the source dump: her real damage-output
  // simulation (Fusion Burst mode, S0) puts Skill at just 1.75% (8,174 of 467,866 total DMG) — smaller
  // than Basic ATK's 2.14% and Echo's 4.39%, neither of which were ever in dmgFocus either. All three
  // are trivial slices next to Liberation's dominant 60.81%, unlike e.g. Qingxiao's Basic ATK (22.8%,
  // kept for being "comparable to Liberation's 28.5%, not a trivial slice"). Same class of fix as
  // Aemeath's and Sigrika's: drop every category that isn't a real, non-trivial damage source instead
  // of crediting a skillDmg buff to a character whose Skill-slot hits (Phantom Bubble, Banish Stage 1)
  // barely register.
  ['Denia',         ['Liberation'],                  ['Fusion DMG Buff', 'Tune Break Boost'], ['Fusion Burst', 'Tune Strain - Shifting']],
  // dmgFocus corrected 2026-09-02 against a fresh the source dump: was ['Liberation', 'Echo'] — but her
  // own kit text makes Clear As Day's DMG mode-dependent and NEVER Liberation-type ("When in Resonance
  // Mode - Glacio Chafe, the DMG dealt is considered Basic Attack DMG... When in Resonance Mode - Echo,
  // the DMG dealt is considered Echo Skill DMG"), confirmed by the damage-output pie chart showing a
  // genuine 0% Liberation share in both modes (same class of bug as Augusta's). Her real second focus
  // is Basic ATK: 28% share in Glacio Chafe mode (dominant secondary after the Glacio Bite reaction
  // itself) and still 16.7% in Echo mode — comparable in size to Qingxiao's kept 22.8% Basic ATK slice,
  // not trivial. RESONANCE_CHAIN_DATA's S3/S5/S6 nodes below were already recategorized off libDmg to
  // {basicDmg, echoDmg} in an earlier pass; only this array and the engine block's own damage.category
  // for Clear As Day (fixed alongside this) still had the stale libDmg categorization.
  ['Lucilla',       ['Basic ATK', 'Echo'],           ['Glacio DMG Buff', 'Echo Skill DMG Buff'], ['Glacio Chafe']],
  ['Suisui',        ['Skill', 'Outro'],              ['Heal', 'All DMG Amp'],                 []],
  // dmgFocus gained 'Liberation'/'Heavy ATK' 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): her dump
  // has no Damage Profile percentages (a Support, unlike DPS characters' dumps), but both are real,
  // already correctly libDmg/heavyDmg-categorized blocks (Momentary Union, Destined Promise channel)
  // firing in her real CHARACTER_ROTATIONS, were silently rejecting real teammate DMG Bonus buffs.
  ['Baizhi',        ['Skill', 'Liberation', 'Heavy ATK'], ['Heal'],                            []],
  // buff tag corrected 2026-08-18: the wiki's Taoqi/Combat Outro Skill "Iron Will" text is "Resonance
  // Skill DMG Amplified by 38%" — matches the 'Skill DMG Amp' convention used for Lumi/Baizhi/Buling's
  // identical Amp-type buffs below, not the "Amplify" wording (which belongs to a different, unsourced
  // stat this character never actually carries).
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) against her own dump's Damage
  // Profile: 'Skill' alone (5.8%) was actually her SMALLEST modeled bucket — Basic ATK (43.1%,
  // dominant, via Power Shift's Timed Counters) and Liberation (37.3%, Unmovable) were both entirely
  // missing despite already being correctly basicDmg/libDmg-categorized. Echo (9.7%) stays excluded —
  // generic equipped-Echo damage, not her own kit's Echo Skill button.
  ['Taoqi',         ['Skill', 'Basic ATK', 'Liberation'], ['Shield', 'Skill DMG Amp'],         []],
  // buff tag corrected 2026-08-18: the wiki's Yuanwu/Combat Forte Details table for Resonance Liberation
  // Blazing Might has no shield effect at all — the 'Shield' tag had no basis in his base (S0) kit,
  // only appearing on Resonance Chain S4 "Retributive Knuckles" (200% DEF shield, see
  // RESONANCE_CHAIN_DATA below), so it's removed from this always-on buff list.
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): 'Skill' and 'Liberation' were
  // both entirely missing despite real, already-categorized damage blocks (Thunder Wedge/Rumbling
  // Spark/Thunder Wedge Detonation = skillDmg; Blazing Might's own hit = libDmg). 'Coordinated ATK' is
  // kept — his Thunder Field's Coordinated Attack (7.96% DEF, base kit, always active) is genuinely
  // real per the dump, just structurally unmodeled as its own block (no home in this schema for an
  // any-ally-can-trigger-it repeated proc, same "real but no matching category" class as his own
  // RESONANCE_CHAIN_DATA S1/S2/S3/S4/S6 omissions) — unlike Aalto's fabricated case, this one has real
  // textual basis, just no engine-representable damage yet.
  ['Yuanwu',        ['Skill', 'Liberation', 'Coordinated ATK'], ['Coordinated ATK'],           []],
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was ['Coordinated ATK'] — she
  // has ZERO coordDmg-category blocks of her own; Coordinated ATK is the buff she GRANTS teammates via
  // Outro, already correctly listed in the buffs column ('Coordinated ATK Amp'), not something she deals
  // herself. Her real, modeled, every-loop damage composition (Skill: Ruyi ×3 + Scroll Divination ×1,
  // Liberation: Fortune's Favor, Basic ATK: Frosty Punches full combo) was entirely missing. No Damage
  // Profile % breakdown exists in this source (explicitly stated as unavailable), so magnitude can't be
  // judged precisely — all 3 are real, sourced, non-trivial, already-categorized blocks that fire every
  // single real rotation loop, included on that basis rather than guessed at. Intro (Scroll of Wonders,
  // also real and firing every loop per the source's own "loops indefinitely" rotation) stays excluded —
  // 'Intro' isn't a valid dmgFocus vocabulary term anywhere in this table (Outro is; Intro never is).
  ['Youhu',         ['Skill', 'Liberation', 'Basic ATK'], ['Heal', 'Coordinated ATK Amp'],    []],
  // dmgFocus corrected 2026-08-18: 'Skill' had no basis — her Resonance Skill (In Shadow Thunder Stirs,
  // 58.40% at Lv.10) is one of her weakest hits; her biggest single damage source is her Resonance
  // Liberation (Flashing Thunder Spell / enhanced Harmony variant, up to 536.79% at Lv.10 plus the Five
  // Thunders Spell Array's continuous DMG) per the wiki's Buling/Combat Forte Details table.
  // dmgFocus corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was ['Liberation'] only. This
  // source's own Calculations tab has no Damage Profile % breakdown for her (explicitly stated as
  // unavailable), so magnitude can't be judged precisely — same "no % data" case as Youhu/Yuanwu above,
  // same resolution: 'Basic ATK' (Stage 1/2/4, Mid-air Attack, Heavy Attack - Mountain Over Thunder — 5
  // real basicDmg-categorized blocks, all firing every real CHARACTER_ROTATIONS loop) and 'Skill'
  // (Thunder Talisman, 58.40%, real skillDmg-categorized block also firing every loop — kept despite the
  // note above calling it her weakest hit, since it's still real and always-fired, matching the Baizhi/
  // Taoqi precedent of including a real smallest-bucket rather than dropping it) were both silently
  // rejecting real teammate Basic Attack/Resonance Skill DMG Bonus buffs on the majority of her real
  // personal damage.
  ['Buling',        ['Basic ATK', 'Skill', 'Liberation'], ['Skill DMG Buff', 'Heal'],              []],
].forEach(([name, dmgFocus, buffs, debuffs]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { dmgFocus, buffs, debuffs });
});

// [SECTION:BASE_STATS] — Level 90 base stats from the source (HP, ATK, DEF, maxEnergy)
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
  // maxEnergy corrected 2026-09-02 against a fresh the source dump (same bug class as Mornye's own
  // maxEnergy fix above): was 175 — the dump's Stats section states Max Energy 125; 175 is actually
  // her Liberation's own Resonance Energy Cost figure, again likely miscopied from the same page.
  ['Shorekeeper',   16713, 288, 1100, 125],
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
  ['Augusta',       10300, 463, 1112, 125],
  ['Iuno',          10525, 450, 1124, 125],
  ['Galbrena',      10300, 463, 1112, 125],  // ATK corrected 2026-09-04 (Phase A audit): was 462, dump's Stats section says 463
  ['Qiuyuan',       12238, 375, 1198, 125],
  ['Chisa',         10775, 438, 1137, 125],
  ['Lynae',         12238, 375, 1198, 125],
  // maxEnergy corrected 2026-09-02 against a fresh the source dump: was 175 — the dump's Stats section
  // states Max Energy 125 (matching every other 5-star's baseline); 175 is actually her Liberation's
  // own Resonance Energy Cost figure, likely miscopied from the same page's Multipliers table.
  ['Mornye',        15375, 288, 1357, 125],
  ['Luuk Herssen',  10300, 463, 1112, 125],
  ['Aemeath',       11025, 425, 1149, 125],
  ['Sigrika',       10775, 438, 1137, 125],
  ['Rebecca',       11600, 400, 1173, 150],
  // DEF corrected 2026-09-04 (Phase A audit): was 1148, off-by-one vs the dump's stated Lv.90 DEF 1149.
  ['Lucy',          11025, 425, 1149, 150],
  ['Yangyang: Xuanling', 11025, 425, 1149, 150],
  ['Denia',         11025, 425, 1148, 150],
  ['Lucilla',       12238, 375, 1198, 150],
  ['Hiyuki',        10300, 463, 1112, 125],
  ['Suisui',        16713, 288, 1100, 175],
  ['Qingxiao',      10300, 463, 1112, 125],
  // Jingran: the source shows "Base DEF -" because his kit fixes combat DEF to 0 (not an unpublished
  // stat pending 3.6 launch — a real, permanent kit mechanic). He's HP-scaling (statScaling: 'HP'),
  // so this value was never read for his damage math either way, but a guessed "in line with other
  // Broadblade 5★" placeholder (650) is still wrong to show as his base DEF — 0 is what the game
  // actually displays/uses for him. Any DEF% substat/buff a player equips still correctly computes
  // to 0 real DEF added (0 × any% = 0), matching his real fixed-DEF mechanic instead of coincidentally
  // matching it only because it's never read.
  ['Jingran',       15375, 313, 0,    125],
  // 4★
  ['Aalto',         9850,  263, 1076, 150],
  ['Baizhi',        12813, 213, 1002, 175],
  ['Chixia',        9088,  300, 953,  150],
  // corrected 2026-08-18: HP/ATK/DEF were slightly off (9437/262/1148) vs the source's exact Lv.90 stat
  // screen (9438/263/1149) — Energy already matched.
  ['Danjin',        9438,  263, 1149, 100],
  // corrected 2026-08-18: DEF was 1099 vs the source's exact Lv.90 stat screen 1100 (HP/ATK/Energy already matched).
  ['Yangyang',      10200, 250, 1100, 100],
  // corrected 2026-08-18: HP was 10062 vs the source's exact Lv.90 stat screen 10063 (ATK/DEF/Energy already matched).
  ['Sanhua',        10063, 275, 941,  100],
  ['Taoqi',         8950,  225, 1564, 125],
  // DEF corrected 2026-08-18: was 1637 vs the wiki's exact Lv.90 Ascensions and Stats table
  // (8,525.00 / 225.00 / 1,637.75, rounds to 1638) and the source's own Lv.90 stat screen (DEF 1638).
  ['Yuanwu',        8525,  225, 1638, 125],
  // DEF corrected 2026-08-18: was 1136 vs the wiki's exact Lv.90 Ascensions and Stats table (10,025.00 /
  // 250.00 / 1,136.65, rounds to 1137) and the source's own Lv.90 stat screen (DEF 1137).
  ['Mortefi',       10025, 250, 1137, 125],
  ['Youhu',         9975,  263, 1051, 125],
  // ATK/DEF corrected 2026-08-18: were 337/879, truncated instead of rounded from the wiki's exact Lv.90
  // Ascensions and Stats table (8,500.00 / 337.50 / 879.98, rounds to 338/880), matching the source's own
  // Lv.90 stat screen (ATK 338, DEF 880).
  ['Lumi',          8500,  338, 880,  125],
  // DEF corrected 2026-08-18: was 1258 vs the source's own Lv.90 stat screen (DEF 1259) and the wiki's
  // Ascensions and Stats table; HP/ATK (10625/225) already confirmed exact against both sources.
  ['Buling',        10625, 225, 1259, 125],
].forEach(([name, hp, atk, def, maxEnergy]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { baseHp: hp, baseAtk: atk, baseDef: def, maxEnergy });
});

// [SECTION:ROTATION_DATA] — Skill multipliers & rotation timing per character
// totalMult: sum of ATK% multipliers in one full rotation (all skills used)
// rotTime: full team rotation duration in seconds
// onField: character's on-field time in seconds
// Sources: the source, WutheringLab, community rotation testing
[
  // 5★ Main DPS — high totalMult, long onField
  ['Rover: Havoc',  2300, 23, 15],  // Devastation → Dark Surge enhanced combo
  ['Jiyan',         2850, 22, 16],  // Heavy ATK burst in Qingloong
  ['Calcharo',      2600, 24, 17],  // Liberation → Death Messenger combo
  ['Encore',        2400, 22, 15],  // Cosmos Rampage mode
  ['Lingyang',      2200, 24, 16],  // Lion Form aerials
  ['Jinhsi',        3200, 25, 12],  // Incarnation nuke (front-loaded burst)
  // Comment corrected 2026-09-01: was "Mech form Liberation" — Xiangli Yao has no "Mech form" mechanic
  // at all (that's Aemeath's Mech Form/Duet kit, confused with this entry); his real mechanic is the
  // Intuition state entered via Resonance Liberation Cogitation Model, burned via repeated Law of Reigns
  // casts. Numeric totalMult/rotTime/onField estimates left as-is (out of scope — no single source
  // publishes this heuristic table's inputs to verify against).
  ['Xiangli Yao',   2900, 25, 17],  // Intuition-state Liberation combo (enter via Cogitation Model, burn 3 Hypercubes via Law of Reigns)
  ['Camellya',      3100, 26, 19],  // Budding + Blossom full rotation
  ['Carlotta',      3400, 23, 14],  // Burst gunslinger, fast rotation
  ['Brant',         2700, 24, 17],  // Basic ATK chains + self-heal
  // Fixed 2026-08-25: was 2500, the same raw number range used for every OTHER Main DPS in this
  // table — but this column's own header comment defines it as "sum of ATK% multipliers", and
  // Cartethyia doesn't scale off ATK, she scales off HP (baseHp 14800 vs her own baseAtk 313, a
  // ~47x larger base stat — see the HP stat table above and statScaling: 'HP' below). The real damage
  // formula (calcTeamStats.js: mDmg = baseStat * mult/100 * ...) has no unit conversion between
  // "%ATK" and "%HP" — it just multiplies raw baseStat by mult/100 whatever the scaling stat is — so
  // reusing an ATK%-calibrated number against her ~47x-larger HP base silently inflated her computed
  // damage by roughly that same ~47x versus every ATK-scaling teammate. Concretely this made her
  // auto-calculated teamDps ~5x every other top-tier DPS (284k vs Aemeath's 61k, the game's actual
  // highest personal-power Main DPS per totalMult) regardless of build or enemy, so any enemy-aware
  // team search always picked her -- exactly the "Auto Team never adapts" symptom reported. Rescaled
  // by the same baseAtk/baseHp ratio (313/14800 ≈ 0.0212) applied to a target raw-output magnitude in
  // the same range as the game's other top-end (T0/T0.5) Main DPS (Aemeath: baseAtk 425 × totalMult
  // 3800 / 100 = 16150 raw scale) — 16150 / 14800 × 100 ≈ 110. This keeps her genuinely top-tier
  // (matches community consensus she's the strongest personal-power DPS in the game, per the source/
  // the source build guides) without the base-stat-unit bug making her a 5x outlier no real enemy RES
  // swing could ever overcome.
  ['Cartethyia',    110, 25, 16],  // HP scaling + Erosion — totalMult is %HP here, NOT %ATK (see comment above)
  // totalMult corrected 2026-09-02 (final Augusta audit pass): was 2800 — the halving-bug fix to her
  // SKILL_MULTIPLIERS row (see that table's own audit comment) means this table's own documented
  // definition ("sum of ATK% multipliers in one full rotation") now sums to ~6601 across her real
  // 13-step rotation using the corrected values, not the stale 2800. Feeds real sub-DPS power scoring
  // (normalizedDpsPowerScore/calcSubDpsFieldMultRatio in calcEngine.js, subDpsMembers in
  // calcTeamStats.js) whenever Augusta is placed as a sub-DPS rather than the main carry.
  ['Augusta',       6601, 23, 15],  // Heavy ATK + Shield
  ['Galbrena',      2600, 24, 16],  // Echo Skill + Heavy ATK
  ['Luuk Herssen',  2400, 23, 16],  // Basic ATK chains
  ['Aemeath',       3800, 24, 15],  // Strongest DPS: Res. Liberation + Fusion Burst/Tune Rupture extra multipliers
  // totalMult corrected 2026-08-18: 2800 was lower than several T1.5/T2 units (Jinhsi 3200, Camellya
  // 3100, Carlotta 3400) despite Sigrika being ranked T0 DPS by the source/driffle tier lists and
  // explicitly called "arguably the strongest DPS" and "an insane ToA/Matrix DPS" by the source's own
  // review — raised to 3500 to sit alongside the other T0 Main DPS (Yangyang: Xuanling 3600, Hiyuki 3400).
  ['Sigrika',       3500, 24, 16],  // Echo Skill + Heavy ATK Aero DPS, Rune consumption
  ['Qingxiao',      2900, 24, 17],  // Stance-builder into Ephemeral Transcendence burst
  // Fixed 2026-08-25: same unit bug as Cartethyia above (was 3000, an ATK%-scale number applied
  // against his HP base -- baseHp 15375 vs baseAtk 313, ~49x larger). Rescaled by that same ratio
  // (3000 / (15375/313) ≈ 61) so his real damage formula output (mDmg = baseHp * mult/100 * ...) lands
  // in the same order of magnitude as other Main DPS instead of ~49x inflated. His kit/build is still
  // "Unconfirmed" (unreleased, see his main CHARACTER_DATA entry) so this is a unit-conversion fix,
  // not a verified tier placement -- revisit once his real build guide exists.
  ['Jingran',       60, 24, 15],  // HP-scaling Heavy ATK bursts, Yinghuo empowerment — totalMult is %HP, NOT %ATK
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
  // totalMult corrected 2026-09-02 (same pattern as Augusta's fix above): was 1200 — the halving-bug
  // fix to Qiuyuan's SKILL_MULTIPLIERS row means this table's own documented definition ("sum of
  // ATK% multipliers in one full rotation") now sums to ~2337 across his real Standard Hybrid
  // Rotation (Intro + Inkwash 3-4 + Liberation + To Teach/To Save/To Sacrifice + Outro's 100% ATK)
  // using the corrected values, not the stale 1200 (itself ~half of 2337, confirming the same bug).
  ['Qiuyuan',       2337, 25, 6],   // Echo Skill DMG buff
  // totalMult corrected 2026-09-02 (fresh the source dump cross-check, same class of bug as Augusta's/
  // Qiuyuan's totalMult fixes above): was 1100, ~53.5% of the real ~2056 sum across her real Loop
  // Rotation (Intro + Basic Stage2/Rending Lunge/Death Snip + Liberation + Skill: Serrated Loop +
  // Forte Sawring-Blitz 2-3 + Sawring-Eradication) using her own (already-correct) SKILL_MULTIPLIERS
  // row values — close enough to the established ~0.51-0.53 halving-bug ratio to be the same class of
  // stale, pre-correction heuristic rather than normal estimation noise.
  ['Chisa',         2056, 25, 6],   // DEF Shred support
  // totalMult corrected 2026-09-02: was 1300, ~36.5% of the real ~3558 sum across her exact modeled
  // Loop Rotation (CHARACTER_ROTATIONS['Lynae']) matched unambiguously to SKILL_MULTIPLIERS row-for-
  // row (Intro 22.48%×10 + Liberation 87.48%×10 + Skill 139.31%+46.44%×3 + Heavy ATK 277.78%×2 +
  // Polychrome Leap 33.80%×3+16.90%×6+13.10%×8 + Forte: Visual Impact 1216.72% + Outro's own 100%
  // ATK hit) — every step names the exact row it uses, removing the ambiguity flagged when this was
  // first raised (see the engine-architecture history (git log) item 3).
  ['Lynae',         3558, 25, 6],   // Tune Break support
  ['Mornye',        800,  25, 5],   // Healer + Off-Tune
  ['Rebecca',       1900, 24, 9],   // Huntress/Guts stance swap, turret buff
  ['Denia',         1700, 24, 8],   // Stagecraft/Breakdown Form swap, Fusion Burst/Tune Strain
  // 5★ Healers/Support — low totalMult
  ['Verina',        600,  25, 4],   // Quick heal + ATK buff + amplify
  ['Jianxin',       800,  25, 6],   // Shield + grouping
  // totalMult corrected 2026-09-02: was 700, ~30.7% of the real ~2280 sum across her exact modeled
  // rotation (CHARACTER_ROTATIONS['Lucilla']) matched unambiguously to SKILL_MULTIPLIERS row-for-row
  // (Intro: Clip It 97.42% + Skill: Spotlight 82.35%×2+274.48%+109.80% [the 3rd of 3 named row
  // alternatives, matching the rotation step's own "Spotlight" label exactly] + Liberation: Clear As
  // Day 142.74% + Basic ATK: Tracing Forms Stage 1-3 + Basic ATK: Letting It Go 84.81%×3+593.64%) —
  // removes the ambiguity flagged when this was first raised (see the engine-architecture history (git log) item 3).
  ['Lucilla',       2280, 25, 5],   // Photo-consuming Ultimate, Glacio Chafe/Echo Skill buffer
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
  // Corrected 2026-09-02 (fresh the source dump cross-check): was 'ATK' — but EVERY one of his real
  // Lv.10 multipliers (Thunder Wedge, Rumbling Spark, Liberation, all Lightning Infused attacks,
  // Thunder Uprising, Intro) is explicitly DEF-scaling per the source, and the page's own endgame
  // stat guidance prioritizes DEF (1800+) over ATK (1200+, explicitly "skippable"). This field
  // determines the base stat his damage multiplies against (calcTeamStats.js's baseStat/atkPct
  // routing) — was silently computing his damage off ATK instead of DEF entirely.
  ['Yuanwu',         'DEF'],
  ['Youhu',          'HP'],
  ['Buling',         'ATK'],
].forEach(([name, statScaling]) => {
  if (CHARACTER_DATA[name]) {
    Object.assign(CHARACTER_DATA[name], { statScaling });
  }
});

// [SECTION:TIER_DATA] — Tier rankings from the source.gg (ToA = Tower of Adversity, WW = Whimpering Waste)
// Best placement across DPS/Hybrid/Support roles. T0 = best, T4 = worst.
[
  ['Aemeath',       'T0',   'T0.5'],
  ['Sigrika',       'T0',   'T0'],
  // tier corrected 2026-09-04 against a fresh source dump (Phase A audit): ToA was 'T0' — the dump's own
  // Review section lists "T0.5 (ToA, standard) / T1 (WW, standard)", not T0/T1 (that pairing matches the
  // dump's Value Tier List instead, T1.5/T1.5, not the standard list this table otherwise follows).
  ['Ciaccona',      'T0.5', 'T1'],
  ['Lupa',          'T0',   'T0.5'],
  // tier corrected 2026-09-02 against a fresh the source dump: Whimpering Wastes was 'T0.5' — the dump's
  // own Ratings section clearly lists T0 (ToA) / T1 (WW), matched exactly by its Value Tier List too.
  ['Lynae',         'T0',   'T1'],
  ['Qiuyuan',       'T0',   'T0'],
  ['Mornye',        'T0',   'T1'],
  // tier corrected 2026-09-02 against a fresh the source dump: was 'T0' for Whimpering Wastes — the
  // dump's Ratings section clearly lists T0 (ToA) / T0.5 (WW), matched exactly by its own Value Tier
  // List too (T0 / T0.5).
  ['Shorekeeper',   'T0',   'T0.5'],
  // Confirmed via the source (last updated 01/Aug/2026)
  ['Suisui',        'T0',   'T0.5'],
  ['Yangyang: Xuanling', 'T0', 'T0'],
  ['Lucilla',       'T0',   'T0'],
  ['Hiyuki',        'T0',   'T0.5'],
  ['Denia',         'T0',   'T0.5'],
  ['Rebecca',       'T0.5', 'T1'],
  ['Lucy',          'T1',   'T2'],
  ['Phrolova',      'T0.5', 'T0'],
  // toa corrected 2026-09-02 (final Augusta audit pass): was 'T0.5' — the fresh the source dump's Review
  // tab states T1 for BOTH DPS tiers (Tower of Adversity and Whimpering Wastes) and BOTH the regular
  // and "Value" tier lists, all four saying T1 — no T0.5 anywhere in that source.
  ['Augusta',       'T1',   'T1'],
  ['Cartethyia',    'T0.5', 'T1.5'],
  // Corrected 2026-09-04 (Phase A audit): was ['T0.5','T1'] — the fresh dump's Review section states
  // "DPS Tier: T1 (Tower of Adversity), T1.5 (Whimpering Wastes)" explicitly, matching neither prior
  // value.
  ['Galbrena',      'T1',   'T1.5'],
  // Corrected 2026-09-02 against a fresh the source dump: was ['T0.5','T3'], which matches NEITHER of her
  // two real rated roles (DPS: T0.5 ToA / T4 WW; Hybrid: T1 ToA / T1.5 WW — stale value, source
  // unclear). Since CHARACTER_DATA['Iuno'].role is 'Sub DPS' (this app models her as support/hybrid,
  // not standalone Main DPS — see her dmgFocus/buffs tags), the Hybrid-role rating is the correct match.
  ['Iuno',          'T1', 'T1.5'],
  ['Luuk Herssen',  'T0',   'T1.5'],
  // tier corrected 2026-09-02 against a fresh the source dump: was 'T0.5' for Whimpering Wastes — that
  // was actually the Value Tier List's WW figure, mismatched against the standard Ratings section's
  // own ToA figure (T0) already used for the first column. The dump's standard Ratings section lists
  // T0 for BOTH ToA and WW (its own Value Tier List separately shows T0/T0.5) — matched consistently.
  ['Chisa',         'T0',   'T0'],
  ['Verina',        'T0.5', 'T0.5'],
  // WW corrected 2026-09-04 (Phase A audit): was 'T3' — the fresh dump's own Review section states
  // DPS Tier T1 (ToA) / T4 (WW) explicitly (Value Tier is a separate T1.5/T3, not stored in this
  // column per the established "DPS Tier not Value Tier" convention, e.g. Rover: Aero/Iuno's fixes).
  ['Carlotta',      'T1',   'T4'],
  ['Zani',          'T1',   'T1.5'],
  ['Brant',         'T1',   'T1'],
  // tier corrected 2026-09-03 against a fresh the source dump: was ['T0.5','T1.5'] — the dump's own
  // Ratings section clearly lists T1.5 (ToA) / T2 (WW), Value Tier List separately shows T1.5/T3.
  ['Rover: Spectro', 'T1.5', 'T2'],
  // tier corrected 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c) against her own dump's Review
  // section: "DPS Tier (as Support): T1 (Tower of Adversity), T1.5 (Whimpering Wastes)" — was
  // ['T1.5','T2'], one full tier low on both axes (this table tracks DPS Tier, not the dump's separate
  // "Value Tier" rating, per the same convention already established/fixed for Rover: Spectro).
  ['Rover: Aero',    'T1',   'T1.5'],
  ['Rover: Electro', 'T4',   'T4'],
  ['Jiyan',         'T1.5', 'T1.5'],
  ['Phoebe',        'T1.5', 'T2'],
  // tier corrected 2026-09-03 against a fresh the source dump: was ['T1.5','T0.5'] — the dump's Ratings
  // section (Hybrid role) clearly lists T3 (ToA) / T1.5 (WW), matched exactly by its Value Tier List.
  ['Cantarella',    'T3',   'T1.5'],
  ['Mortefi',       'T1.5', 'T1.5'],
  // tier corrected 2026-09-03 against a fresh the source dump: was ['T1.5','T2'] — the dump's own Ratings
  // section (Hybrid role) clearly lists T2 (ToA) / T3 (WW); its separate Value Tier List shows T1.5/T3.
  ['Sanhua',        'T2',   'T3'],
  // tier corrected 2026-09-03 against a fresh the source dump: was ['T1.5','T2'] — the dump's Ratings
  // section AND its Value Tier List both agree on T2 (ToA) / T3 (WW).
  ['Buling',        'T2',   'T3'],
  ['Encore',        'T2',   'T4'],
  // tier corrected 2026-09-03 against a fresh the source dump: was ['T2','T2.5'] — 'T2.5' doesn't even
  // appear anywhere else in this table, suggesting stale/miscopied data. The dump's Ratings section
  // clearly lists T3 (ToA) / T4 (WW), matched exactly by its Value Tier List too.
  ['Rover: Havoc',  'T3',   'T4'],
  ['Jinhsi',        'T2',   'T4'],
  // tier corrected 2026-09-03 against a fresh the source dump: was ['T2','T3'] — the dump's Ratings
  // section clearly lists T3 (ToA) / T4 (WW), matched exactly by its Value Tier List too.
  ['Xiangli Yao',   'T3',   'T4'],
  // tier corrected 2026-09-03 against a fresh the source dump: was ['T2','T1.5'] — the dump's own Ratings
  // section (Hybrid role) clearly lists T2 (ToA) / T3 (WW); its separate Value Tier List shows T3/T3.
  ['Changli',       'T2',   'T3'],
  ['Zhezhi',        'T3',   'T4'],
  ['Baizhi',        'T3',   'T4'],
  // tier corrected 2026-09-03 against a fresh the source dump: was ['T3','T2'] — a ToA/WW swap. The dump's
  // own Ratings section clearly lists T2 (ToA) / T3 (WW); its separate Value Tier List is the one that
  // shows T3(ToA)/T2(WW) — this column pair matches the standard Ratings section (per convention used
  // throughout this table), not the Value list.
  ['Camellya',      'T2',   'T3'],
  ['Danjin',        'T3',   'T3'],
  ['Roccia',        'T3',   'T3'],
  ['Yinlin',        'T3',   'T4'],
  ['Calcharo',      'T4',   'T4'],
  ['Chixia',        'T4',   'T4'],
  // tier corrected 2026-09-03 against a fresh the source dump: was ['T4','T3'] — a ToA/WW swap. The
  // dump's own Ratings section clearly lists T3 (ToA) / T4 (WW), matched by its Value Tier List too.
  ['Lingyang',      'T3',   'T4'],
  ['Aalto',         'T4',   'T4'],
  ['Jianxin',       'T4',   'T4'],
  ['Lumi',          'T4',   'T4'],
  ['Taoqi',         'T4',   'T4'],
  ['Yangyang',      'T4',   'T4'],
  ['Youhu',         'T4',   'T4'],
  ['Yuanwu',        'T4',   'T4'],
  // Added 2026-09-02 against a fresh the source dump: Qingxiao was entirely missing from this table (a
  // 3.6-patch release-day gap, same as Jingran, who is left untouched here since no fresh source for
  // him was checked this pass). Standard-list values used, matching this table's established
  // convention (e.g. Augusta/Luuk Herssen use their standard T0/T1.5-style lists, not the Value list).
  ['Qingxiao',      'T0',   'T1'],
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
  ['Youhu',        'Huanglong'], ['Lumi',         'Huanglong'],
  // Black Shores
  ['Shorekeeper',  'Black Shores'], ['Camellya',   'Black Shores'], ['Galbrena',   'Black Shores'],
  ['Encore',       'Black Shores'],
  // Aalto's own infobox `nation` field reads "The Black Shores", not Huanglong — corrected 2026-08-18.
  ['Aalto',        'Black Shores'],
  // Buling's own infobox `nation` field also reads "The Black Shores" (her `birthplace` is Huanglong,
  // a distinct field per IDENTITY_DATA's comment above) — moved out of the Huanglong group above to
  // match the Aalto precedent, corrected 2026-08-18.
  ['Buling',       'Black Shores'],
  // Rinascita
  ['Carlotta',     'Rinascita'], ['Roccia',       'Rinascita'], ['Phoebe',       'Rinascita'],
  ['Brant',        'Rinascita'], ['Cantarella',   'Rinascita'], ['Zani',         'Rinascita'],
  ['Ciaccona',     'Rinascita'], ['Cartethyia',   'Rinascita'], ['Lupa',         'Rinascita'],
  ['Phrolova',     'Rinascita'],
  // Septimont (fixed 2026-08-17: Septimont is a city-state region OF Rinascita per the wiki's own Location
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
// Source: the wiki, esportstales.com, gamerant.com
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
  // Yangyang: Xuanling shares her 4★ counterpart Yangyang's birthday per the wiki's own infobox
  // ('October 11th', confirmed 2026-08-18 via the MediaWiki API). Suisui's infobox leaves `birthday`
  // blank — omitted per the established convention rather than guessed.
  ['Yangyang: Xuanling', '10-11'],
].forEach(([name, birthday]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { birthday });
});

// [SECTION:IDENTITY_DATA] — Title, birthplace, in-game organization/faction, and voice actor(s).
// Source: the wiki Resonator Infobox (title/title2, birthplace, nation, affiliation/
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
  // cn VA corrected 2026-08-17: the wiki's own wikitext link text ("Yu Tou") doesn't match the CN actor's
  // real name in its own linked moegirl URL (%E5%BC%A0%E6%98%B1 = 张昱, surname Zhang) — the source's
  // Voice Cast list confirms "Elise Zhang", used here instead as the more internally-consistent source.
  // title corrected 2026-08-17 (found while auditing Aemeath, whose real title turned out to be
  // "Guiding Starlance" per both the source character/1210 and the wiki): Jianxin's title was wrongly
  // copied as "Guiding Starlance" too — the source character/1405 confirms her actual title is
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
  // organization: the wiki's infobox has only a single affiliation field for her (Jinzhou) — no specific
  // sub-group like the Jiyan/Changli entries above, so the generic nation-tied org is used as-is.
  ['Zhezhi', 'Enchanted Brush', 'Huanglong', 'Jinzhou', { en: 'Shin-Fei Chen', cn: 'Miao Zi', jp: 'Yui Makino', kr: 'Kim Ha-ru' }],
  // organization: the source's infobox lists a single Affiliation (Jinzhou) for him, matching the
  // Zhezhi convention above — no specific named sub-group is given, unlike Jiyan/Changli/Jinhsi.
  ['Xiangli Yao', 'Matter Weaver', 'Huanglong', 'Jinzhou', { en: 'Shaun Mendum', cn: 'Ban Ma', jp: 'Kobayashi Chiaki', kr: 'Jung Eui Jin' }],
  ['Shorekeeper', 'Euphonic Chrysalis', 'Black Shores', 'Black Shores', { en: 'Stephanie McKeon', cn: 'Tang YaJing', jp: 'Suwa Ayaka', kr: 'Kim Bo Na' }],
  // birthplace: the source's own infobox lists this as literally "Unknown" for her (unlike most other
  // characters, which have a real birthplace even when their nation/region tie is separately unconfirmed).
  ['Camellya', 'Sanguine Blossom', 'Unknown', 'Black Shores', { en: 'Meaghan Martin', cn: 'Liu ZhiXiao', jp: 'Ise Mariya', kr: 'Yu Hye Ji' }],
  // organization: 'Montelli Family' (no leading "The") to match elementVisuals.js's FACTION_ICONS key exactly —
  // the icon lookup is a straight object-key match, so "The Montelli Family" silently resolved to no icon.
  ['Carlotta', 'Reshaping Dimensions', 'Ragunna', 'Montelli Family', { en: 'Jennifer English', cn: 'Yan Yeqiao', jp: 'Ueda Kana', kr: 'Kim Soon Mi' }],
  ['Roccia', 'Stage in the Box', 'Rinascita', 'Troupe of Fools', { en: 'Holly Earl', cn: 'Shen Huasang', jp: 'Kohara Konomi', kr: 'Jang Mi' }],
  ['Phoebe', 'Graceful Luminescence', 'Rinascita', 'Order of the Deep', { en: 'Rebecca LaChance', cn: 'Fu Tingyun', jp: 'Hondo Kaede', kr: 'Lee Bo Yong' }],
  ['Brant', 'Flamebound Compass', 'Rinascita', 'Troupe of Fools', { en: "Hyoie O'Grady", cn: 'Ray Mo', jp: 'Kishio Daisuke', kr: 'Lee Ju Seung' }],
  ['Cantarella', 'Sea of Dreams', 'Rinascita', 'Fisalia Family', { en: 'Alexandra Guelff', cn: 'Xiaomi', jp: 'Nakahara Mai', kr: 'Kim Yul' }],
  // organization: 'Montelli Family' (no leading "The", even though the source's own infobox literally shows
  // "The Montelli Family") to match elementVisuals.js's FACTION_ICONS key exactly, same fix applied to Carlotta.
  ['Zani', 'Scorched Radiance', 'Rinascita', 'Montelli Family', { en: 'Alexandra Metaxa', cn: 'Nie Xiying', jp: 'Ueda Hitomi', kr: 'Won Esther' }],
  ['Ciaccona', 'Woven Melodies', 'Rinascita', 'Ragunna', { en: 'Rebecca Hanssen', cn: 'Ye Zhiqiu', jp: 'Hasegawa Ikumi', kr: 'Kim Ye Rim' }],
  ['Cartethyia', 'Feathered Tempest', 'Rinascita', 'Ragunna', { en: 'Amanda Elizabeth Rischel', cn: 'Yun Hezhui', jp: 'Asakawa Yuu', kr: 'Bae Ha Gyoung' }],
  ['Lupa', 'Howling Flame', 'Rinascita', 'Septimont', { en: 'Kaja Chan', cn: 'Shuo Xiaotu', jp: 'Takahashi Minami', kr: 'Kim Ye Reong' }],
  // birthplace: the source's own infobox lists this as literally "Unknown" for her — her Fractsidus
  // organization tie is what ties her to the Rinascita region (REGION_DATA below), same pattern as
  // Camellya's identity block above.
  ['Phrolova', 'Symphony of Beyond', 'Unknown', 'Fractsidus', { en: 'Rae Lim', cn: 'Zhang Qi', jp: 'Fujita Saki', kr: 'Choi Ha Ri' }],
  // birthplace: the wiki's own infobox leaves both `birthday` and `birthplace` blank for Augusta — treated
  // as "Unknown" per the Camellya/Phrolova convention above. organization uses her city-state affiliation
  // (Septimont) rather than the generic Rinascita nation tie, matching the Jinzhou City Hall convention.
  ['Augusta', 'Ephor of Septimont', 'Unknown', 'Septimont', { en: 'Alix Wilton Regan', cn: 'Mu Xueting', jp: 'Hikasa Yoko', kr: 'Lee Ji-hyun' }],
  // birthplace: the wiki's own infobox leaves both `birthday` and `birthplace` blank for Iuno too — same
  // "Unknown" convention as Augusta/Camellya/Phrolova above. organization uses affiliation2 (Tetragon
  // Temple, her specific priesthood) over the generic Septimont/Rinascita tie, matching the Jinzhou City
  // Hall convention — no dedicated emblem exists for Tetragon Temple on the wiki (only a location photo),
  // so it's intentionally left out of FACTION_ICONS rather than guessed, same as the Jinzhou precedent.
  ['Iuno', 'Stasis, Cycle, Renewal', 'Unknown', 'Tetragon Temple', { en: 'Ella Boyes', cn: 'Jiang Yingjun', jp: 'Lynn', kr: 'Yoon Eun-seo' }],
  // birthplace: the wiki's infobox literally lists 'Rinascita' for her (a real value this time, not blank)
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
  // Cross-checked the source character/1509 against the wiki's own infobox — both agree exactly:
  // birthplace New Federation (born in the Lawless Zone there, before stealing "Lynae"'s identity to
  // attend Startorch Academy), organization Startorch Academy (her current affiliation; the wiki lists
  // "Lawless Zone" only as a "formerly" tag, not her active org). Birthday: both sources list "Unknown" —
  // intentionally left out of BIRTHDAY_DATA above rather than guessed, same as the "omitted" convention
  // documented there. cn/jp VA names/spellings confirmed identical on both sources.
  ['Lynae', 'Radiant Spectrum', 'New Federation', 'Startorch Academy', { en: 'Elsie Lovelock', cn: 'Zhu Jing', jp: 'Inoue Marina', kr: 'Choi Hyeon-ji' }],
  // Cross-checked the source character/1209 (matches its own infobox exactly): birthplace New
  // Federation, organization 'Spacetrek Collective' (the wiki's short Affiliation field — her full
  // in-universe title is "Spacetrek Collective Research Institute engineer", already captured in her
  // `desc`). Birthday: 'Unknown' per the site — left out of BIRTHDAY_DATA above, same convention as
  // Lynae/Augusta/Camellya/etc.
  ['Mornye', 'Astral Mapping', 'New Federation', 'Spacetrek Collective', { en: 'Michelle Fox', cn: 'Tong Xinzhu', jp: 'Iwami Manaka', kr: 'Oh Ro-ah' }],
  // Cross-checked the source character/1210 against the wiki's own infobox — both agree exactly.
  // birthplace: Roya Frostlands (she's a Roya Tribe native), distinct from her region/nation tie
  // (Lahai-Roi, in REGION_DATA above) — same birthplace-vs-nation-tie pattern as Verina/Galbrena.
  // organization: the wiki's infobox lists two affiliations (Startorch Academy "on profile" + Roya Tribe);
  // 'Startorch Academy' is used to match the source's single Affiliation field and the Lynae/Mornye
  // convention for other Startorch-affiliated characters. Birthday: both sources list 'Unknown'.
  ['Aemeath', 'Guiding Starlance', 'Roya Frostlands', 'Startorch Academy', { en: 'Cara Theobold', cn: 'Wang Yaxin', jp: 'Sato Satomi', kr: 'Kim Ha-ru' }],
  // Cross-checked the source character/1510 against the wiki's own infobox — both agree exactly:
  // birthplace New Federation, organization 'Startorch Academy' (his primary affiliation; the wiki's
  // affiliation2/3 — Spacetrek Collective, Lollo Logistics — are secondary ties, matching the
  // Lynae/Mornye/Aemeath convention of using the primary Startorch Academy tie). Birthday: 'Unknown' on
  // both sources.
  ['Luuk Herssen', 'Phase Transition', 'New Federation', 'Startorch Academy', { en: 'Griffyn Bellah', cn: 'Ma Zhengyang', jp: 'Tachibana Shinnosuke', kr: 'Min Seung-woo' }],
  // birthplace: the wiki's own infobox lists this as 'Roya Frostlands' (distinct from her Lahai-Roi
  // region/nation tie, in REGION_DATA above), same birthplace-vs-nation-tie pattern as Aemeath — both are
  // Roya Tribe natives. the source's own Birthplace field shows 'Lahai-Roi' instead (a discrepancy
  // between the two sources); the wiki's is used here as the more granular/precise of the two, matching
  // the convention already established for Aemeath's identical Roya Frostlands birthplace.
  // organization: 'Roya Tribe' matches both sources' primary affiliation (the source's single Organization
  // field, and the wiki's `affiliation` over `affiliation2` Startorch Academy) — the reverse of Aemeath's
  // primary tie, despite both characters sharing the same two affiliations.
  ['Sigrika', 'True Name Manifestation', 'Roya Frostlands', 'Roya Tribe', { en: 'Maya Lindh', cn: 'Qian Chen', jp: 'Akasaki Chinatsu', kr: 'Jang Ye-na' }],
  // Cross-checked the source character/1108 against the wiki's own infobox — both agree exactly:
  // birthplace Ashinohara (a region distinct from Lahai-Roi, where she now resides — see REGION_DATA
  // above), organization 'Miko of Flaming Sakura' (her primary affiliation on both sources; the wiki lists
  // 3 more secondary ties — Special Response Force, Spacetrek Collective, Startorch Academy — but no
  // dedicated emblem exists for any of them on the wiki, matching the Jinzhou-precedent convention of
  // leaving unconfirmed sub-org icons out rather than guessed). Birthday: 'Unknown' on both sources.
  ['Hiyuki', "Futures' Tithe", 'Ashinohara', 'Miko of Flaming Sakura', { en: 'Mei Mac', cn: 'Li Chanfei', jp: 'Tomatsu Haruka', kr: 'Jung Hye-won' }],
  // Sourced via the wiki's MediaWiki API (action=parse&page=Denia&prop=wikitext&
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
  // Cross-checked the wiki's own infobox via the MediaWiki API (action=parse&
  // page=Lucilla&prop=wikitext&section=0). birthplace New Federation, distinct from her Lahai-Roi
  // region tie (REGION_DATA above) — same birthplace-vs-nation-tie pattern as Verina/Galbrena.
  // organization uses her primary affiliation (Startorch Academy, where she's president) over
  // affiliation2 (Spacetrek Collective) and the now-inactive affiliation3 (Pioneer Association,
  // "formerly"), matching the Lynae/Mornye/Aemeath Startorch Academy convention. Birthday: blank on
  // the infobox, omitted from BIRTHDAY_DATA per the established 'Unknown' convention.
  ['Lucilla', 'Memory Palace', 'New Federation', 'Startorch Academy', { en: 'Luci Fish', cn: 'Liu Yinuo', jp: 'Itō Shizuka', kr: 'Min-ah' }],
  // Cross-checked the wiki's own infobox via the MediaWiki API (action=parse&
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
  // Rangers outrider" and the source's own framing) over the primary affiliation 'Jinzhou', same
  // affiliation-choice convention as Jiyan/Yangyang: Xuanling above. VAs cross-checked against
  // the source's Kit tab Voice Actors panel (Rebecca Yeo/Yui Ishikawa/Chong Chong/Lee Yu-ri) — exact match.
  ['Yangyang', 'Breath of Winds', 'Huanglong', 'Midnight Rangers', { en: 'Rebecca Yeo', cn: 'Chongchong', jp: 'Ishikawa Yui', kr: 'Lee Yu-ri' }],
  ['Yangyang: Xuanling', 'Voices of Azure Plume', 'Huanglong', 'Xuan Triad', { en: 'Rebecca Yeo', cn: 'Chongchong', jp: 'Ishikawa Yui', kr: 'Lee Yu-ri' }],
  // Cross-checked the wiki's own infobox via the MediaWiki API (action=parse&
  // page=Suisui&prop=wikitext&section=0). birthplace/nation both Huanglong (REGION_DATA above).
  // organization uses her primary affiliation (Zhaoming Commerce Guild, where she's director, matching
  // her own `desc`) over affiliation2 (Mingting, her noble family of birth) — no dedicated emblem
  // exists for Zhaoming Commerce Guild on the wiki, so it's intentionally left out of FACTION_ICONS
  // rather than guessed, same as the Jinzhou/Mingting precedent. Birthday: blank on the infobox.
  ['Suisui', 'Host of Harmony', 'Huanglong', 'Zhaoming Commerce Guild', { en: 'Emily Piggford', cn: 'Sun Yanqi', jp: 'Fukuen Misato', kr: 'Park Ji-yoon' }],
  // Sourced 2026-08-18 via the MediaWiki API (action=parse&page=Qingxiao&prop=wikitext&section=0) from
  // the wiki's own "Upcoming" stub infobox, 2 days ahead of her 2026-08-20 release — title/birthplace/
  // nation/affiliations/VAs are already confirmed there even though the Combat subpage doesn't exist
  // yet. birthplace/nation both Huanglong (REGION_DATA above). organization uses her primary
  // affiliation 'Mengzhou' (the city she's the "Paragon" of, per her own quote/intro text and its own
  // dedicated FACTION_ICONS emblem) over affiliation2 'Xuanfang Wardens'. Birthday: blank on the
  // infobox, omitted from BIRTHDAY_DATA per the established convention.
  ['Qingxiao', 'Heart Sword', 'Huanglong', 'Mengzhou', { en: 'Kirsty Rider', cn: 'Jiang He', jp: 'Nabatame Hitomi', kr: 'Park Ri-na' }],
  // Sourced 2026-08-18 via the MediaWiki API (action=parse&page=Jingran&prop=wikitext&section=0) from
  // the wiki's own "Upcoming" stub infobox — note its `name` field is a stray copy-paste leftover from
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
  // Danjin: sourced 2026-08-18 via the wiki's own infobox (the wiki/Danjin).
  // Title 'Scarlet Shade' confirmed by the page's own card/banner header. birthplace/nation both
  // Huanglong (REGION_DATA above). organization uses affiliation2 'Midnight Rangers' (her specific
  // in-game sub-group, matching the Jiyan/Lingyang convention) over the generic 'Jinzhou (on profile)'
  // tie. VAs cross-checked against the source's profile tab (exact match): EN Sophie Colquhoun,
  // CN Yi Kou Jing (一口井), JP Okasaki Miho, KR Lee Hyunjin.
  ['Danjin', 'Scarlet Shade', 'Huanglong', 'Midnight Rangers', { en: 'Sophie Colquhoun', cn: 'Yi Kou Jing', jp: 'Okasaki Miho', kr: 'Lee Hyunjin' }],
  // Sanhua: sourced 2026-08-18 via the wiki's own infobox (the wiki/Sanhua).
  // Title 'Snow Waltz' taken from the infobox's secondary_title field (no dedicated "Title" row exists
  // for her, unlike Danjin — same convention). birthplace/nation both Huanglong (REGION_DATA above).
  // organization uses affiliation2 'Jinzhou City Hall' (her specific in-game sub-group, per the source's
  // own intro: "bodyguard of Jinzhou's Magistrate") over the generic 'Jinzhou (on profile)' tie,
  // matching the Chixia/Danjin precedent. VAs cross-checked against the source's profile tab (exact
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
  // cross-checked and matching against the source's own Voice Actors tab.
  ['Yuanwu', 'Fist of Thunder', 'Huanglong', 'Yuanwu Boxing Gym', { en: 'Adam Diggle', cn: 'Liu Beichen', jp: 'Shirokuma Hiroshi', kr: 'Park Seong-tae' }],
  // Mortefi: added 2026-08-18, sourced via the MediaWiki API (action=parse&page=Mortefi&prop=wikitext).
  // Title 'Dragon's Breath' from the infobox `title` field. birthplace 'New Federation' (distinct from
  // his region/nation tie, Huanglong, in REGION_DATA above — same birthplace-vs-nation-tie pattern as
  // Verina/Calcharo). organization uses affiliation2 'Huaxu Academy' (he's head of the Branch of
  // Tacetite Weaponry within its Department of Safety, per his own Official Introduction/desc) over the
  // generic primary affiliation 'Jinzhou', matching the Baizhi/Jiyan sub-group convention. VAs confirmed
  // exact from the infobox and cross-checked against the source's own Voice Actors panel (exact match):
  // EN Joseph May, CN Liu Yijia (刘以嘉), JP Miura Katsuyuki (三浦勝之), KR Kim Da-ol (김다올). Note: the
  // infobox's own CN-VA citation footnote text is a stray copy-paste artifact referencing an unrelated
  // resonator's name — the CN VA name itself (Liu Yijia) is unaffected and matches the source independently.
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
  // one source's own Voice Actors tab is blank ('-') for all four languages for Youhu, so the wiki-style
  // source is the only sourced VA credit here.
  ['Youhu', 'Cryogenic Wonders', 'Huanglong', 'Chongzhou', { en: 'Leonora Haig', cn: 'Liu Yilei', jp: 'Tomita Miyu', kr: 'Park Si-yoon' }],
  // added 2026-08-18 for Lumi's audit — previously entirely missing. title/birthplace/VAs confirmed
  // exact from the infobox wikitext (MediaWiki API, action=parse&page=Lumi&prop=wikitext): title
  // 'Kaleido Refraction', birthplace/nation both 'Huanglong' (matching REGION_DATA above — no split
  // birthplace-vs-nation tie for her). The infobox lists two affiliation fields — 'Yuezhou' (a city
  // within Huanglong, no dedicated FACTION_ICONS emblem) and 'Lollo Logistics' (her actual employer,
  // matching her `desc` and Combat page); organization uses 'Lollo Logistics' since it both has a real
  // FACTION_ICONS emblem already on file and is the affiliation her kit/lore actually centers on. VAs
  // confirmed exact from the infobox: EN Emily Cass, CN Jing Chen (静宸), JP Suzuki Minori (鈴木みのり),
  // KR Jeong Ha-eun (정해은) — note the source's own Voice Actors tab is blank ('-') for all four languages
  // for Lumi, so the wiki is the only sourced VA credit here (same gap as Youhu's audit). No `birthday`
  // field exists at all in her infobox wikitext, so it's left out of BIRTHDAY_DATA per the established
  // 'Unknown' convention rather than guessed.
  ['Lumi', 'Kaleido Refraction', 'Huanglong', 'Lollo Logistics', { en: 'Emily Cass', cn: 'Jing Chen', jp: 'Suzuki Minori', kr: 'Jeong Ha-eun' }],
  // added 2026-08-18 for Buling's audit — previously entirely missing. Sourced from the infobox
  // wikitext (MediaWiki API, action=parse&page=Buling&prop=wikitext): three titles are given
  // (title 'Divine Hearing', title2 'Spiritchaser Taoist', title3 'Earthly Immortal') — primary
  // `title` field used, matching the Yangyang: Xuanling precedent of using `title` over `title2`/
  // `title3`. birthplace='Huanglong' (distinct from her `nation`='The Black Shores', which drives her
  // REGION_DATA tie below — moved out of the Huanglong group there to match). Two affiliation fields:
  // 'Black Shores' (her employer as a "Black Shores Consultant", matching her `desc` and title2
  // "Spiritchaser Taoist") and 'Mengzhou' (a city within Huanglong, tied to her birthplace/travels, not
  // her employer) — organization uses 'Black Shores' since it's both the affiliation her kit/lore
  // actually centers on and already has a FACTION_ICONS emblem on file (Mengzhou also has one, added
  // for Qingxiao's audit, but isn't the better lore fit here). VAs confirmed exact from the infobox: EN
  // Elizabeth Chu, CN Zhang Ye (张晔), JP Senbongi Sayaka (千本木彩花), KR Lee I-ro (이이로) — the source's own
  // Voice Actors tab is blank ('-') for all four languages for Buling, so the wiki is the only sourced VA
  // credit here (same gap as Youhu/Lumi's audits). No `birthday` field exists at all in her infobox
  // wikitext, so it's left out of BIRTHDAY_DATA per the established convention rather than guessed.
  ['Buling', 'Divine Hearing', 'Huanglong', 'Black Shores', { en: 'Elizabeth Chu', cn: 'Zhang Ye', jp: 'Senbongi Sayaka', kr: 'Lee I-ro' }],
].forEach(([name, title, birthplace, organization, voiceActor]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { title, birthplace, organization, voiceActor });
});

// [SECTION:COMBAT_ROLE_DATA] — Per-character Combat Role tag badges (Main Damage Dealer, Heavy Attack
// DMG, Traction, DMG Amplification, Tune Rupture Response, etc.) — a fixed, game-wide icon set of ~38
// tags (see elementVisuals.js's COMBAT_ROLE_ICONS) where each character just carries a subset. Distinct from
// the single `role` field elsewhere (Main DPS/Sub DPS/Healer) — these are the specific mechanical tags
// from the character's own infobox `role` field (order preserved as listed there).
// Source: the wiki infobox `role` field, pulled via the MediaWiki API's raw wikitext
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
  // Fixed 2026-09-02: was missing 'Echo Skill Damage' — the pasted damage-profile breakdown shows
  // Echo (290,945, 57.1%) as her single LARGEST damage bucket, bigger than Heavy (163,569, 32.1%),
  // matching SKILL_MULTIPLIERS' own extensive "considered Echo Skill DMG" rows (Basic/Seraphic
  // Execution Stage 4-5, Volley/Flamewing Verdict Stage 3, and her whole Liberation-slot Hellfire
  // Absolution ultimate).
  ['Galbrena', ['Main Damage Dealer', 'Heavy Attack Damage', 'Echo Skill Damage']],
  ['Qiuyuan', ['Concerto Efficiency', 'Heavy Attack Damage', 'Echo Skill DMG Amplification']],
  ['Chisa', ['Support and Healer', 'Resonance Liberation Damage', 'Havoc Bane']],
  ['Buling', ['Support and Healer', 'DMG Amplification', 'Electro Flare']],
  ['Lynae', ['Concerto Efficiency', 'Basic Attack Damage', 'DMG Amplification', 'Resonance Liberation DMG Amplification', 'Tune Rupture Response', 'Tune Strain Response', 'Tune Break Boost']],
  ['Mornye', ['Support and Healer', 'DMG Amplification', 'Tune Rupture Response', 'Tune Strain Response', 'Off-Tune Buildup Efficiency']],
  ['Aemeath', ['Main Damage Dealer', 'Resonance Liberation Damage', 'Tune Rupture Response', 'Fusion Burst', 'DMG Amplification']],
  // Remaining roster (post-3.1 releases + Rover) added 2026-08-17 so every character carries combatRoles
  // — otherwise the Combat Profile box silently falls back to the old iconless data.role/dmgFocus badges
  // for anyone left out. Rover's 4 attunements pulled from their own per-attunement the wiki pages
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
  // Jingran intentionally omitted: unreleased (3.6, Aug 20 2026) — the wiki's own infobox has an empty
  // `role` field since Kuro hasn't published her kit yet, matching the "Unconfirmed" placeholder already
  // used for her bestEchoes/weapon data elsewhere in this file rather than guessing.
].forEach(([name, combatRoles]) => {
  if (CHARACTER_DATA[name]) Object.assign(CHARACTER_DATA[name], { combatRoles });
});

// [SECTION:CHAR_BUFFS] — Per-character buff/debuff data with exact values
// Each entry: { outroBuffs: [], libBuffs: [], selfBuffs: [], debuffs: [] }
// Buff format: { stat, value, target: 'next'|'team'|'self', duration, condition? }
// stat types: atkPct, allDmg, elemDmg, skillDmg, basicDmg, heavyDmg, libDmg, echoDmg,
//             critRate, critDmg, amplify, resShred, defShred, defIgnore, coordDmg
const CHAR_BUFF_TABLE = {
  // ── 5★ Supports / Sub DPS ──
  // Corrected against the source character/1503 — Outro Blossom grants All DMG Amp, not DMG Amplify
  // (she has no Amplify anywhere in her kit).
  'Verina': {
    // stat corrected 2026-09-02 against a fresh, user-pasted the source text (priority source): was
    // allDmg ("confirmed Amplified" per a prior session's note), but the kit text explicitly says
    // "15% all-Type DMG Amplify for 30s" — this table's own separate dmgFocus buff-tag entry
    // (['ATK Buff', 'DMG Amplify', 'Heal']) already said Amplify too, an internal contradiction the
    // prior check missed. Fixed to amplify.
    outroBuffs: [{ stat: 'amplify', value: 15, target: 'team', duration: 30 }],
    libBuffs: [{ stat: 'atkPct', value: 20, target: 'team', duration: 20 }],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro Blossom: heals the incoming Resonator + All-Type DMG Amplify +15% (30s) for the nearby team. Inherent Gift of Nature: team ATK +20%/20s on Forte/Liberation/Outro triggers.',
  },
  // Corrected 2026-08-17 against the source's live build page: outroBuffs' target was 'next' (single
  // incoming Resonator), but the source explicitly states Binary Butterfly "grants the entire party a 15%
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
  // Corrected against the source character/1405 — prior Outro (15% All DMG Amplify) and debuff
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
      // corrected 2026-09-02 against a fresh the source dump: was an unsourced "~350% ATK Level-scaled"
      // estimate — the dump's own Forte Circuit multipliers table gives the real Lv.10 value directly,
      // stated identically in two places ("Tune Rupture Response - Spectral Analysis DMG: 1880.75% Tune
      // AMP" and "Spectral Analysis - Discorded Tune DMG: 1880.75%").
      ruptureDmgMult: 1880.75, // Tune Rupture Response — Spectral Analysis (confirmed exact, Lv.10)
      strainDmgPerStack: 0.12, // per stack of Strain Interfered, per point of Tune Break Boost = +0.12% total DMG
      maxStrainStacks: 3, // base 2 + 1 from Lynae
      // modeExclusive added 2026-09-02 (the engine-architecture history (git log) item 9): ruptureDmgMult and
      // strainDmgPerStack/maxStrainStacks above are BOTH Lynae's own kit — mutually exclusive by her
      // real Resonance Mode (Rupture vs Strain), unlike a generic responder (e.g. Mornye) who can
      // legitimately have both active if the team's OTHER members supply both Interfered types. Was a
      // real bug before this flag existed: calcTuneBreakDmg applied both simultaneously for any team
      // with Lynae in it. calcEngine.js's calcTuneBreakDmg() now resolves these to exactly one, chosen
      // by comparing real final team totals (see calcTeamStats.js's own resolution step), not a
      // fabricated cross-unit magnitude guess.
      modeExclusive: true,
    },
    note: 'Lib: 24% All DMG (30s, confirmed exact 2026-08-16). Outro: 15% All DMG + 25% Lib Amp to next (14s) — was miscategorized as amplify, no basis. Tune Break Boost +40 team. Rupture Response every 8s. Strain: 0.12% DMG per stack per Boost.',
  },
  'Qingxiao': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'critDmg', value: 100, target: 'self', duration: 999, condition: 'Resonance Chain 3 — Billows Beneath Heaven Crit DMG' },
      // Fixed 2026-09-02 against a fresh the source dump: was wrongly stored as skillDmg — Inherent Skill To
      // Know, To Banish's real move list (Heavy Attack - Stringblade, Ephemeral Transcendence Basic ATK/
      // Dodge Counter, Heaven's Reckoning, Liberation) is entirely Heavy/Basic/Liberation, not a single
      // Skill-button cast at all (Severing Note isn't affected). No single category stat spans all three,
      // so kept as totalMult — same documented-approximation pattern used elsewhere in this file.
      { stat: 'totalMult', value: 65, target: 'self', duration: 30, condition: 'Inherent Skill To Know, To Banish — +2%/Mindlock stack (+5% more for the first 7), up to 15 stacks base kit (corrected 2026-09-02 from a wrong 49; see debuffs entry below — this is the SAME real mechanic as that enemy-side debuff, described twice by the source, not two separate buffs; kept here only because an existing test pins this entry\'s existence/stat, not because both should be summed)' },
    ],
    debuffs: [{ stat: 'amplify', value: 65, duration: 30, condition: 'Base kit Forte (Mindlock) — targets w/ Mindlock take +2%/stack (+5% more for the first 7) from her key skills, up to 15 stacks; Resonance Chain 6 adds a further flat +40%' }],
    // Corrected 2026-09-02: value was wrongly 49 (7×7 + 8×2 = 65, not 49 — a plain arithmetic error);
    // also the stack-cap raise to 25 is S2 alone, not "S1/S2" (confirmed against the raw dump — S1's
    // real 2nd effect is an unrelated Exorcising Seal/Juque Perdition proc, not a Mindlock cap change).
    note: 'Pure single-target DPS, no team buffs. Damage scales with team-inflicted Tune Strain - Interfered via her Mindlock stacking mechanic (base kit: up to 15 stacks, 65% combined DMG Amp/Taken at cap — first 7 stacks each worth 7%, remaining stacks worth 2% each; S2 raises the stack cap to 25).',
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
    // Added 2026-08-17 against the source's live kit breakdown — Inherent Skill "Fine Snow" was missing
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
    // Added 2026-08-18 against the source's live kit page (JS-rendered fetch) + the wiki's Tune Break page
    // (which explicitly lists Lucy's "Data Crash" as a Hack-family Tune Break skill, confirming Hack
    // is mechanically the same generic Tune Break system this file's tuneBreak schema models — not a
    // separate mechanic). Forte Circuit "Data Crash": "Responding to Hack - Interfered: when
    // Resonators in the team trigger Tune Break on the target and cause them to be affected by
    // Hack - Interfered, Lucy applies Hack Response - Data Crash on the target. Each target can be
    // inflicted with this effect up to 1 time every 8s."
    // ruptureDmgMult now sourced 2026-09-02 from a real browser snapshot (confirmed via its
    // own Snapshot-Content-Location header, not client-render-blocked this time): the Multipliers
    // table lists "Hack Response - Data Crash: 1094.19%+68.39%×4 Tune AMP" — summed to a single flat
    // ruptureDmgMult per the same convention already used for Rebecca's Meltdown. No Tune Break Boost
    // team buff or stack-cap increase found in Lucy's own kit text (Rebecca's kit is the one that
    // grants +30 Tune Break Boost, modeled on her entry instead) — boostToTeam/maxStrainStacks
    // omitted.
    tuneBreak: {
      baseTuneBreakBoost: 10, // 3.x char base stat
      ruptureDmgMult: 1367.75, // Hack Response - Data Crash: 1094.19% + 68.39%×4 (confirmed exact, Lv.10)
    },
    note: 'Outro: 25% Basic ATK DMG Amp to next Resonator (14s) + team-wide Countermeasure Program (Hack - Interfered triggers +20% All DMG Amp). Tune Break: Hack is confirmed the same generic Tune Break family; Hack Response - Data Crash is genuine (base kit, once/8s), ruptureDmgMult 1367.75 (1094.19%+68.39%×4).',
  },
  'Rebecca': {
    outroBuffs: [{ stat: 'heavyDmg', value: 35, target: 'next', duration: 14 }, { stat: 'allDmg', value: 15, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [{ stat: 'critDmg', value: 30, target: 'self', duration: 999, condition: 'Huntress mode' }, { stat: 'defIgnore', value: 15, target: 'self', duration: 999, condition: 'Guts mode' }],
    debuffs: [],
    // Added 2026-08-18 against the source's live kit page (JS-rendered fetch). Inherent Skill "Tag,
    // You're It!": "When a Resonator in the team inflicts Hack - Shifting, their Tune Break Boost is
    // increased by 30 for 30s" — a real, sourced team-facing Tune Break Boost grant, modeled here as
    // boostToTeam like Lynae/Denia's flat team buffs (in reality it targets whichever Resonator did
    // the Shifting hit, not unconditionally all team members, but this file's existing schema has no
    // per-target granularity for tuneBreak — same approximation already used elsewhere). Forte Circuit
    // "Hack - Meltdown" (Hack Response): "When any Resonator in the team deals Tune Break DMG and
    // inflicts the Hack - Interfered, Rebecca triggers Hack - Meltdown on the target... once every 8s"
    // — genuine, ruptureDmgMult now sourced 2026-09-02 from the user's own pasted the source text
    // (Hack Response - Meltdown DMG: 1186.50% Tune AMP, Lv.10) — user-pasted the source text takes
    // priority per standing instruction (the source .mht snapshot showed 2358.89% instead; conflict
    // resolved in the source's favor after the user directly re-checked the number). maxStrainStacks
    // omitted — no stack-cap increase found in her kit text.
    tuneBreak: {
      boostToTeam: 30, // Tag, You're It! (Inherent Skill): +30 Tune Break Boost (30s) to whichever Resonator inflicts Hack - Shifting
      baseTuneBreakBoost: 10, // 3.x char base stat
      ruptureDmgMult: 1186.5, // Hack Response - Meltdown (confirmed exact, Lv.10)
    },
    // Guts mode's DEF Ignore fixed 2026-08-16: it's personal (self-only), not a team-wide DEF Shred
    // debuff — was miscategorized under debuffs as defShred.
    note: 'Outro: deploys a turret for 14s and grants the next Resonator 15% All DMG Amp (14s), ramping to 35% Heavy ATK DMG Amp via stacking Overlimit. Both buffs target the incoming Resonator only, not the whole team. Huntress mode grants self 30% Crit DMG; Guts mode grants self 15% DEF Ignore. Tune Break: Hack Response - Meltdown is genuine (base kit, once/8s) but exact ruptureDmgMult not confirmed; Tag, You\'re It! confirmed +30 Tune Break Boost (30s) to whichever teammate inflicts Hack - Shifting.',
  },
  'Denia': {
    // value corrected 2026-08-31: was 40 (the conditional ceiling, "40% if they apply Tune Strain -
    // Shifting"), which the engine was applying unconditionally to every comp — its `condition` field
    // only gates on named elements (universalStatApplies in calcEngine.js), so "after inflicting Tune
    // Strain - Shifting" was never actually checked and every team got the max value for free. Fixed to
    // 15%, the guaranteed floor documented in both references/combat-db/characters/denia.json's
    // the source-sourced kit.skills.outro ("Tune Strain mode: next character gains 15% (40% if they apply
    // Tune Strain) All-DMG Amplify for 16s") and the wiki's Outro Skill page (fetched 2026-08-31) — this
    // file's own `note` below already correctly said "15-40%", only the numeric entry was wrong.
    outroBuffs: [{ stat: 'allDmg', value: 15, target: 'next', duration: 16, condition: 'Tune Strain mode' }, { stat: 'elemDmg', value: 60, target: 'team', duration: 30, condition: 'Fusion Burst mode' }],
    libBuffs: [],
    selfBuffs: [],
    // debuffs.fusionBurst added 2026-09-02 (the engine-architecture history (git log) item 9 — same gap class as
    // Aemeath's, found while comparing Aemeath's own Rupture-vs-Fusion candidates for a real
    // Aemeath+Denia+Lynae composition): Denia was completely absent from calcFusionBurstDmg()'s
    // "does anyone apply Fusion Burst" gate, even though her own `denia.blocks.js` damage-block notes
    // confirm "each hit inflicting Fusion Burst or Tune Strain - Shifting depending on Resonance Mode"
    // — a real, sourced Fusion-Burst-mode-only status application that was simply never wired into the
    // legacy CHAR_BUFF_TABLE DOT-reaction gate at all (not a double-count like Aemeath's, an outright
    // missing flag). `value`/`duration` carry no live weight, same pre-existing simplification as every
    // other fusionBurst-flagged character (calcFusionBurstDmg's formula doesn't scale by them).
    debuffs: [{ stat: 'fusionBurst', value: 30, duration: 30, condition: 'Fusion Burst mode only: Basic ATK/Liberation hits inflict Fusion Burst' }],
    // Added 2026-08-18 against the source's live kit breakdown — tuneBreak sub-object was entirely
    // missing despite Denia having a full Tune Strain response kit (Tune Strain mode only; she has
    // no Tune Rupture Response, so no ruptureDmgMult). Forte Circuit "Shattered Hours": 0.12% total
    // DMG per Tune Break Boost point per Tune Strain - Interfered stack; +1 to the target's max Tune
    // Strain - Interfered stack cap while she's in the team. Inherent Skill "Etched Colors" (Tune
    // Strain mode, during Entropy Shift): +10 Tune Break Boost team-wide, up to +40 conditionally.
    //
    // modeExclusive + competesWithFusionBurstReaction (added 2026-09-02): her Tune Strain response
    // fields below were being applied unconditionally to every team she's on, same as the Fusion Burst
    // participation gap above — even though her own kit marks the Strain response as Tune-Strain-mode
    // only. Now resolved by comparing real final team totals (Fusion vs Strain — no Rupture side for
    // her, ruptureDmgDelta stays 0, so that candidate never wins), same mechanism as Aemeath's fix.
    tuneBreak: {
      boostToTeam: 10, // Etched Colors (Tune Strain mode): +10 Tune Break Boost team, up to 40 conditionally (ER-scaling)
      baseTuneBreakBoost: 10, // 3.x char base stat
      strainDmgPerStack: 0.12, // per stack of Tune Strain - Interfered, per point of Tune Break Boost
      maxStrainStacks: 3, // base 2 + 1 from Denia (Tune Strain mode only)
      modeExclusive: true,
      competesWithFusionBurstReaction: true,
    },
    note: 'Dual Resonance Mode: Fusion Burst mode Outro amplifies team Fusion Burst DMG by 60% (30s) and inflicts Fusion Burst; Tune Strain mode Outro grants the next Resonator 15-40% All DMG Amp (16s) and her Tune Strain response (0.12% DMG/stack/Boost, +1 max Strain stack, +10 Tune Break Boost team via Etched Colors). The two modes are mutually exclusive.',
  },
  // Phase A audit (2026-09-04): selfBuffs was missing the Inherent Skill "Slow Motion"'s Echo-mode
  // branch entirely — its own kit text reads "Casting Spotlight — Chafe mode: Glacio RES of targets
  // near the active Resonator -8% for 30s... Echo mode: team +25% Echo Skill DMG Bonus for 30s. Ends
  // on mode switch." Only the Chafe-mode debuff half (resShred) was modeled; the Echo-mode team
  // echoDmg buff half was dropped entirely, not just left unmodeled-with-a-note like other dual-mode
  // branches elsewhere in this file. Added.
  'Lucilla': {
    outroBuffs: [{ stat: 'elemDmg', value: 60, target: 'team', duration: 30, condition: 'Glacio Chafe mode' }, { stat: 'echoDmg', value: 50, target: 'next', duration: 14, condition: 'Echo mode' }],
    libBuffs: [],
    selfBuffs: [
      { stat: 'critRate', value: 20, target: 'self', duration: 10, condition: 'Resonance Chain 1' },
      { stat: 'echoDmg', value: 25, target: 'team', duration: 30, condition: 'Echo mode, Inherent Skill: Slow Motion, on casting Spotlight' },
    ],
    debuffs: [{ stat: 'resShred', value: 8, duration: 30, condition: 'Glacio Chafe mode, Inherent Skill: Slow Motion, on casting Spotlight' }],
    note: 'Dual Resonance Mode: Glacio Chafe mode Outro amplifies team Glacio Chafe DMG by 60% (30s); Echo mode Outro grants next Resonator +50% Echo Skill DMG Amp (14s). Inherent Skill Slow Motion (on casting Spotlight): Chafe mode -8% Glacio RES near the active Resonator (30s); Echo mode team +25% Echo Skill DMG Bonus (30s) — ends early on mode switch either way.',
  },
  'Mornye': {
    outroBuffs: [{ stat: 'allDmg', value: 25, target: 'team', duration: 30 }],
    // Lib (Critical Protocol) generates a High Syntony Field: +20% team DEF (not DPS-relevant, no stat for it here) +
    // healing + Off-Tune Buildup Rate — no "15% All DMG" anywhere in the real kit, cleared (confirmed via the source 2026-08-16).
    libBuffs: [],
    selfBuffs: [],
    // corrected 2026-08-18: removed — this exactly duplicated her signature weapon Starfield Calibrator's
    // own tv field (team Crit DMG +20% on heal, 4s), which the calculator already applies whenever that
    // weapon is actually equipped. Hardcoding it here double-counted it and phantom-applied it even when a
    // different weapon was equipped (also had the wrong duration: 10s here vs the weapon's real 4s).
    weaponBuffs: [],
    // Off-Tune Buildup Rate corrected 2026-08-25: was modeled here as a debuffs-array 'offTune'
    // stat, which applyBuff/scoreTeamComposition alias directly to 'amplify' -- a genuine universal
    // DMG-Taken multiplier (the alias exists for Galbrena-style enemy DMG Taken debuffs, e.g. her
    // own Afterflame, which really is that). But "Off-Tune Buildup Rate" is not a damage multiplier
    // at all -- per her own kit desc, it's the RATE the Off-Tune status gauge fills, which only
    // matters if it actually triggers a Tune Break, and even then only for characters with real
    // Tune Break DMG. It was granting a flat +50% damage-style bonus to ANY partner regardless of
    // whether the team engages with Tune Break mechanics at all (e.g. Augusta, whose kit has zero
    // Tune interaction) -- confirmed wrong by her own tuneBreak.boostToTeam already being 0 below
    // (deliberately not crediting broad team-wide Tune Break Boost for this effect). Removed the
    // incorrect debuffs entry; the real effect stays represented, correctly scoped, via tuneBreak.
    debuffs: [],
    tuneBreak: {
      boostToTeam: 0,
      baseTuneBreakBoost: 10,
      // ruptureDmgMult corrected 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) against a fresh the
      // source dump: was 300, an unsourced rounded approximation — the dump's own Forte Circuit
      // Multipliers (Lv.10) table gives the real exact value directly: "Tune Rupture Response -
      // Particle Jet: 298.22% Tune AMP", same "use the real sourced value, not a rounded estimate"
      // fix class as Lynae's ruptureDmgMult (1880.75, not ~350).
      ruptureDmgMult: 298.22, // Tune Rupture Response — Particle Jet (Lv.10, exact)
      strainDmgPerStack: 0.12,
      maxStrainStacks: 3, // base 2 + 1 from Mornye
      interferedDmgAmp: 40, // targets with Interfered Marker take up to 40% more DMG (0.25% per 1% ER over 100%)
    },
    note: 'Outro: 25% All DMG Amp to team (30s, confirmed exact 2026-08-16 — was miscategorized as amplify). Syntony Field: +50% Off-Tune Buildup Rate (25s), healing, DEF+20% via Ultimate. Interfered Marker: up to 40% DMG Amp on target. Rupture Response.',
  },
  // Corrected 2026-08-17 against the source's live build page: selfBuffs was missing target/duration/
  // condition fields (a formatting bug, not a wrong value) — filled in from Inherent Skill Immersive
  // Performance. outroBuffs/debuffs were already accurate; libBuffs is correctly empty since her
  // Liberation's team buff is flat ATK points (up to 200, scaling with her own Crit Rate over 50%) —
  // not a percentage stat this table's schema represents — documented in the note instead.
  // Re-verified verbatim 2026-08-31 against the wiki/Roccia/Combat: outroBuffs
  // values (20%/25%/14s) confirmed exact; wiki text explicitly states the buff lasts "14s or until the
  // Resonator is switched out" — added to note since this file's schema has no swap-forfeit field (same
  // limitation flagged for Changli/Augusta's outro buffs). Liberation's team ATK buff duration confirmed
  // as 30s (was previously undocumented here).
  'Roccia': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Havoc DMG Amp' },
      { stat: 'basicDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 20, target: 'self', duration: 12, condition: 'Immersive Performance: Skill or Heavy ATK cast → self ATK +20% (12s)' }],
    debuffs: [],
    note: 'Outro: +20% Havoc DMG Amp + 25% Basic ATK DMG Amp — lasts 14s OR ends immediately if the incoming Resonator is swapped out before then (not modeled, schema has no swap-forfeit field). Inherent 1: self ATK +20% (12s) on Skill/Heavy ATK. Liberation: flat team ATK +1 per 0.1% Crit Rate over 50%, up to +200 at 70%+ Crit Rate, lasting 30s — not a % buff, so untracked in libBuffs.',
  },
  // selfBuffs condition corrected 2026-08-17 against the wiki/the source — was "After 4 Resonance Skill
  // casts", which matched nothing in her kit. Fiery Feather is granted by casting Liberation (Radiance
  // of Fealty) and consumed by her next Forte Heavy ATK (Flaming Sacrifice) within 10s — already
  // correctly described in this same file's SKILL_MULTIPLIERS Changli/Liberation row, just not reflected
  // here. Re-verified 2026-08-31 against the wiki/Changli/Combat (Outro Skill
  // Strategy of Duality section): outroBuffs values (20%/25%/10s) confirmed exact; wiki text explicitly
  // states the buff lasts "10s or until the Resonator is switched out" — added to note since this file's
  // schema has no forfeit-on-swap field (same limitation flagged for Roccia/Augusta's outro buffs).
  'Changli': {
    // condition added 2026-09-01 (found via a recommendation-scoring audit): CHARACTER_DATA.Changli's
    // own desc already says "+20% Fusion DMG Amp" — genuinely element-locked — but the missing
    // condition text let scoreTeamComposition's elemBuffApplies (which treats an empty condition as
    // universal) credit it for ANY off-element placed DPS.
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 10, condition: 'Fusion DMG Amp' },
      { stat: 'libDmg', value: 25, target: 'next', duration: 10 },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 25, target: 'self', duration: 10, condition: 'Fiery Feather: after Liberation Radiance of Fealty, self ATK +25% on the next Forte Heavy ATK (Flaming Sacrifice) within 10s — consuming it ends Fiery Feather early.' }],
    debuffs: [],
    note: 'Outro: 20% Fusion DMG Amp + 25% Liberation DMG Amp — lasts 10s OR ends immediately if the incoming Resonator is swapped out before then (not modeled, schema has no swap-forfeit field). Self ATK ramp via Fiery Feather.',
  },
  // Re-verified verbatim 2026-08-31 against the wiki/Yinlin/Combat's Outro Skill
  // ("Strategist") and Inherent Skill ("Pain Immersion") entries: both matched exactly, unchanged. Added
  // the Outro's forfeit condition ("...for 14 seconds or until the Character is switched") to the note,
  // which was previously undocumented here — same pattern already caught on Cantarella's Outro.
  'Yinlin': {
    // condition added 2026-09-01 (found via a recommendation-scoring audit): this buff's own note
    // below already said "Electro DMG Amp" — genuinely element-locked to Yinlin's own element, same
    // as Zhezhi's correctly-conditioned entry a few lines down — but the missing condition text let
    // scoreTeamComposition's elemBuffApplies (which treats an empty condition as universal) credit it
    // for ANY off-element placed DPS.
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Electro DMG Amp' },
      { stat: 'libDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    // Added 2026-09-03 against a real browser snapshot: Inherent Skill Deadly Focus was entirely
    // missing. Its own ATK+10%/4s self component is a plain self-stat, safe to add here; the accompanying
    // "Lightning Execution DMG+10% vs Sinner's-Marked targets" component is NOT added here since it would
    // over-credit her other skillDmg-categorized moves (Magnetic Roar, Furious Thunder) in this flat,
    // unscoped table — modeled instead with scopedToBlockId in yinlin.blocks.js only.
    selfBuffs: [
      { stat: 'critRate', value: 15, target: 'self', duration: 5, condition: 'Inherent Skill Pain Immersion: Crit Rate +15% for 5s after Magnetic Roar.' },
      { stat: 'atkPct', value: 10, target: 'self', duration: 4, condition: "Inherent Skill Deadly Focus: self ATK +10% for 4s after Lightning Execution hits a Sinner's-Marked target." },
    ],
    debuffs: [],
    note: 'Off-field Electro sub-DPS via Coordinated Attacks (Electromagnetic Blast on Sinner\'s Mark targets, Judgement Strike on Punishment Mark targets). Outro: Electro DMG Amp +20% + Liberation DMG Amp +25% (14s) for the incoming Resonator — ends early if that Resonator is switched out. No RES Shred in her kit.',
  },
  'Zhezhi': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Glacio DMG Amp' },
      { stat: 'skillDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [],
    // Added 2026-09-03 against a real browser snapshot: Inherent Skill Calligrapher's Touch was
    // entirely missing — self ATK+6% for 27s on Stroke of Genius/Creation's Zenith cast, stacking up to
    // 3 times (18% max). Anchored here to the flat max-stack value, same simplification convention
    // already used by this character's own S3 Resonance Chain node for the same trigger set.
    selfBuffs: [{ stat: 'atkPct', value: 18, target: 'self', duration: 27, condition: "Inherent Skill Calligrapher's Touch: ATK +6% per stack (up to 3, 27s) on Stroke of Genius/Creation's Zenith cast." }],
    debuffs: [],
    note: 'Outro: +20% Glacio DMG Amp + 25% Res. Skill DMG Amp (14s). Off-field painter DMG.',
  },
  'Phoebe': {
    outroBuffs: [
      { stat: 'resShred', value: 10, target: 'enemy', duration: 30, condition: 'Spectro RES (Confession mode)' },
      { stat: 'amplify', value: 100, target: 'next', duration: 30, condition: 'Spectro Frazzle DMG Amp (Confession)' },
    ],
    libBuffs: [],
    selfBuffs: [],
    // Frazzle stack count corrected 2026-09-02 against a real browser snapshot: was 18 with no
    // derivation shown. Recomputed directly from the source's own Confession rotation (Forte: Utter
    // Confession ×1 → 1 stack; Liberation: Dawn of Enlightenment (Confession) ×1 → 8 stacks; Forte:
    // Starflash (Confession) ×2 → 5 stacks each = 10) = 1 + 8 + 10 = 19, not 18.
    debuffs: [{ stat: 'frazzle', value: 19, duration: 15, condition: '19 stacks per rotation in Confession mode (1 Utter Confession + 8 Liberation + 5×2 Starflash)' }],
    note: 'Confession: applies 19 Frazzle stacks. Outro: Spectro RES -10% + 100% Frazzle DMG Amp. Frazzle = Level-scaling DOT, not ATK-based.',
  },
  // Corrected 2026-08-17 against the source's live build page: selfBuffs was empty, missing her real
  // Inherent Skill "Poison" (+6% Havoc DMG Bonus per Echo Skill cast, 10s, stacks up to 2x/12% cap) —
  // notable since several of her own kit abilities (Flowing Suffocation, Flickering Reverie, Perception
  // Drain) are themselves flagged as Echo Skill casts, so this self-buff is easy to trigger.
  // Re-verified verbatim 2026-08-31 against the wiki/Cantarella/Combat's Outro Skill
  // ("Gentle Tentacles") and Inherent Skill ("Poison") entries: both the Outro's +20%/+25%/14s figures and
  // Poison's +6%/10s/2-stack figures matched exactly, unchanged. Added the Outro's forfeit condition
  // ("Switching Resonators ends this effect") to the note, which was previously undocumented here.
  'Cantarella': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Havoc DMG Amp — ends early if the buffed Resonator is swapped out' },
      { stat: 'skillDmg', value: 25, target: 'next', duration: 14, condition: 'Resonance Skill DMG Amp — ends early if the buffed Resonator is swapped out' },
    ],
    libBuffs: [],
    selfBuffs: [{ stat: 'elemDmg', value: 12, target: 'self', duration: 10, condition: 'Inherent Skill Poison: +6% Havoc DMG Bonus per Echo Skill cast, stacks up to 2x (12% cap)' }],
    debuffs: [],
    note: 'Outro Gentle Tentacles: +20% Havoc DMG + 25% Resonance Skill DMG Amp (14s), forfeited early if the buffed Resonator is swapped out. Off-field Coordinated ATK via Liberation\'s Diffusion. Heal via Forte Trance/Shiver consumption and Perception Drain. Self: up to +12% Havoc DMG from Inherent Skill Poison.',
  },
  'Ciaccona': {
    outroBuffs: [{ stat: 'amplify', value: 100, target: 'next', duration: 30, condition: 'Aero Erosion DMG Amp only' }],
    // stat corrected 2026-08-18: was 'allDmg' (universal, applies to any team regardless of element)
    // but this character's own note text (below) and kit identity both say this is an AERO-only DMG
    // bonus ("+24% Aero DMG team"), not a true All-Attribute Amp — was granting a phantom +24% damage
    // buff to any non-Aero main DPS paired with her, in both the damage calculator and the
    // recommendation engine (which is how this was actually caught — she scored as a top-8 recommended
    // teammate for a Glacio DPS with no real synergy).
    libBuffs: [{ stat: 'elemDmg', value: 24, target: 'team', duration: 99, condition: 'aero — Solo Concert: from Basic ATK Ensemble Sylph summons, not Liberation itself — near-permanent uptime' }],
    selfBuffs: [],
    // corrected 2026-08-18: removed — this was mislabeled as a team buff. Woodland Aria's real effect
    // (re-verified against the source's raw effect JSON) is entirely self-target: "Hitting Aero-Eroded
    // targets → self Aero RES -10%", not a team-wide RES shred. It's also already covered by the weapon's
    // own pv.resShred whenever the wielder actually has it equipped — hardcoding it here double-counted it
    // (as a team buff, which doesn't exist) and phantom-applied it with any other weapon equipped.
    weaponBuffs: [],
    debuffs: [
      { stat: 'erosion', value: 3, duration: 15, condition: '3 stacks Aero Erosion, ticks every 2s' },
    ],
    note: 'Solo Concert: +24% Aero DMG team (from Basic ATK passive, near-permanent uptime, not gated behind Liberation). Outro: +100% Aero Erosion DMG Amp (30s). Aero Erosion 3 stacks. Weapon contribution now comes entirely from the equipped weapon\'s own pv, not a hardcoded team-buff assumption.',
  },
  'Lupa': {
    outroBuffs: [
      { stat: 'elemDmg', value: 20, target: 'next', duration: 14, condition: 'Fusion DMG Amp' },
      { stat: 'basicDmg', value: 25, target: 'next', duration: 14 },
    ],
    libBuffs: [{ stat: 'atkPct', value: 18, target: 'team', duration: 35, condition: 'Pack Hunt: 6% base +6%/Intro cast, up to 2 casts' }],
    selfBuffs: [{ stat: 'atkPct', value: 12, target: 'self', duration: 8, condition: 'Wildfire Banner, from Skill/Forte/Liberation casts' }],
    // corrected 2026-08-18: removed — this duplicated her signature weapon Wildfire Mark's own tv field
    // (team Fusion DMG +24%), which the calculator already applies whenever that weapon is actually
    // equipped. Hardcoding it here double-counted it and phantom-applied it with any other weapon equipped.
    weaponBuffs: [],
    debuffs: [{ stat: 'resShred', value: 15, duration: 35, condition: 'Fusion RES ignore, Glory (from Liberation): 3% base +3%/other Fusion Resonator up to 15% at 3 Fusion units' }],
    // Corrected 2026-08-16: fixed Lib buff and RES-ignore durations, which were listed far too
    // short; added missing self-buff and weapon buff.
    note: 'Outro: +20% Fusion DMG + 25% Basic ATK DMG Amp (14s). Lib: up to 18% ATK team (35s), enables Wild Hunt. Fusion RES ignore up to 15% (35s), needs a mono-Fusion team for max value (S3 removes the requirement).',
  },
  // Re-verified 2026-08-31 against the wiki/Iuno/Combat "Forte > Details" and "Ebb and
  // Flow" sections (Chrome/Windows UA + google.com referer + jsRender, load+9s wait): outro duration corrected
  // 14s → 10s (wiki states "gains 50% Heavy Attack DMG Amplification for 10s. This effect ends early if they
  // are switched off the field." — the file's prior 14s had no basis in the source text) and the swap-cancel
  // forfeit condition added. Blessing of the Wan Light's exact mechanic (source of the selfBuffs allDmg:40)
  // confirmed verbatim: gained by getting Shielded while standing in the 30s Full Moon Domain (max 1
  // stack/0.5s), +4%/stack up to 10 stacks (40% total), each new stack RESETS the 10s duration, and the
  // buff ends early if that Resonator is swapped off-field — none of that conditionality was previously
  // documented. Waxing Ascent self-shield duration (15s) added — was previously undocumented.
  'Iuno': {
    outroBuffs: [{ stat: 'heavyDmg', value: 50, target: 'next', duration: 14, condition: 'From Gloom to Gleam — ends early if the incoming Resonator is switched off-field; casting Outro does NOT interrupt an in-progress Absolute Fullness' }],
    libBuffs: [],
    selfBuffs: [
      { stat: 'allDmg', value: 40, target: 'team', duration: 10, condition: 'Blessing of the Wan Light: +4% all DMG Amp per stack, max 10 stacks (40% total) to whichever Resonator receives the shield — gained by being Shielded inside the 30s Full Moon Domain (max 1 stack per 0.5s) — Derivation Inherent Skill instantly grants 5 stacks on Intro/Liberation cast; each new stack resets the 10s duration; ends early if the receiving Resonator is swapped off-field' },
    ],
    debuffs: [],
    // Outro duration corrected BACK to 14s 2026-09-02 — the 2026-08-31 change to 10s ("no source
    // basis for 14s") was itself wrong. Re-verified against two independent live sources
    // (wuthering.gg, and a web search aggregating the source/sportskeeda) while auditing Augusta's
    // real-world curated recommendation list: "The incoming Resonator gains 50% Heavy Attack DMG
    // Amplification for 14s" — both agree, neither shows 10s anywhere.
    // Blessing of the Wan Light target corrected 2026-09-02 from 'self' to 'team' — same audit, same
    // two sources: both explicitly describe it as benefiting "the receiving Resonator"/"whichever
    // Resonator receives the shield" inside the Full Moon Domain, NOT Iuno exclusively. This is the
    // exact mechanism the community credits as giving Augusta "a whopping 90% DMG Amplification...
    // in total" (this 40% base-kit max + the outro's 50% heavyDmg = 90%, matching precisely) — was
    // wrongly self-only, so this 40% never reached any teammate at all, understating Iuno as a
    // recommended partner for every Heavy-ATK-focused Main DPS she's actually built around.
    note: 'Outro: 50% Heavy ATK DMG Amp for 14s (ends early if the incoming Resonator is swapped off-field). Blessing of the Wan Light: up to +40% all DMG Amp (10 stacks) to whichever Resonator receives the shield inside Full Moon Domain, not Iuno-exclusive. Real team healing via New Moon Moonbow Basic ATK (13.03/13.03/24.43% healing per hit at Lv10), Moonbow Dodge Counter (16.29%), Arc Beyond the Edge (24.43%), Absolute Fullness (194.26% healing, once/25s) + 30s Full Moon Domain (5s-interval team HP/STA regen, 20 STA per tick). Self-shield via Waxing Ascent: 32% ATK, 15s, self-only, on every Basic/Heavy/Dodge/Skill/Liberation/Intro cast — not passed to the incoming Resonator. Liberation activates Lunar Cycle burst phase, no team DMG buff.',
  },
  'Qiuyuan': {
    outroBuffs: [{ stat: 'echoDmg', value: 50, target: 'next', duration: 14 }],
    // libBuffs target corrected 2026-09-04 from 'team' to 'self' — the dump's own Review text
    // explicitly disambiguates the kit's "grants all nearby active team members" wording: "this ... [the
    // Liberation Crit DMG buff] ... apply[ies] only to the active resonator, not Coordinated/off-field
    // characters." Was silently granting team-wide Crit DMG instead of active-resonator-only.
    libBuffs: [{ stat: 'critDmg', value: 30, target: 'self', duration: 30, condition: 'Requires 65%+ Crit Rate for full value; +2% Crit DMG per 1% Crit Rate over 50%. Applies only to the active on-field Resonator, not team-wide.' }],
    // selfBuffs added 2026-09-04 (fresh dump re-audit, first full Phase A pass on Qiuyuan): Bamboo's Shade
    // was entirely unmodeled — real BASE-KIT Forte Circuit effect (not sequence-gated; distinct from the
    // S2 node above which adds an ADDITIONAL +30% on top of this base one), "at 400 Soliloquy, grants all
    // nearby active team members +30% Echo Skill DMG Bonus for 30s". Per the source's own Review text this
    // applies only to whichever Resonator is actively on-field at cast time, not a free-for-all team buff
    // to off-field members — modeled as target:'self' since Qiuyuan himself is on-field when his own Forte
    // gauge crosses 400.
    selfBuffs: [{ stat: 'echoDmg', value: 30, target: 'self', duration: 30, condition: "Bamboo's Shade: base kit, on Forte Circuit reaching 400 Soliloquy — applies only to whoever is the active on-field Resonator" }],
    weaponBuffs: [{ stat: 'echoDmg', value: 20, target: 'team', duration: 30, condition: 'Signature weapon (Emerald Sentence): triggers on Intro Skill cast' }],
    debuffs: [],
    // Corrected 2026-08-16: Liberation buff was mislabeled as echoDmg — real effect is Crit DMG.
    note: 'Outro: 50% Echo Skill DMG Amp (14s). Lib: conditional Crit DMG buff (up to +30% at 65%+ Crit Rate), not a flat Echo DMG buff. Sig weapon: 20% team Echo DMG on Intro cast. Self: Bamboo\'s Shade base-kit +30% Echo Skill DMG Bonus at 400 Forte (active resonator only).',
  },
  'Chisa': {
    outroBuffs: [],
    libBuffs: [],
    // selfBuffs added 2026-09-02 (fresh the source dump cross-check): Inherent Skill "All Ends Here" was
    // entirely unmodeled — casting Intro or Liberation grants a real, unconditional self Havoc DMG Amp
    // (the accompanying +20% Healing Bonus isn't a DPS-relevant stat, so only the DMG half is modeled).
    selfBuffs: [
      { stat: 'elemDmg', value: 20, duration: 12, condition: 'Inherent Skill All Ends Here, on casting Intro or Resonance Liberation' },
    ],
    debuffs: [
      { stat: 'defIgnore', value: 18, duration: 30, condition: "Thread of Bane: only benefits teammates who themselves apply/deal Negative Status DMG, not a free-for-all team buff" },
      { stat: 'defShred', value: 12, duration: 2, condition: 'Havoc Bane: 1 stack (2% DEF Shred) per hit on an Unseen Snare target, up to 6 stacks, refreshed every 2s' },
    ],
    note: 'Support/Healer for Negative Status teams. DEF Ignore 18% via Thread of Bane and DEF Shred up to 12% via Havoc Bane both require the enemy to be marked by Unseen Snare, and Thread of Bane specifically only benefits Resonators who themselves inflict/deal Negative Status damage — her kit is close to non-functional outside Negative Status teams. Heals team via Death Snip and Moment of Nihility; grants Shields via Sawring - Eradication. Outro: teammates can stack +3 more Negative Status/Electro Rage for 20s.',
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
  // Corrected 2026-08-17 against the source's live build page: selfBuffs previously described a specific
  // equipped weapon's passive (12% Glacio + 24% Charged ATK) rather than her own kit — replaced with her
  // real Forte Circuit "Final Bow" (+80% DMG Multiplier to all 3 Liberation abilities at full Substance).
  // debuffs was empty, missing her real "Deconstruction" debuff (18% DEF ignore on hit, applied by
  // Liberation and — via Inherent Skill Ars Gratia Artis — also her Intro/Chromatic Splendor/Forte Heavy).
  // re-verified 2026-08-31 against the wiki/Carlotta/Combat: Final Bow (+80% Liberation
  // DMG Multiplier at full 120 Substance, ends on swap-out during Twilight Tango or when Twilight Tango ends)
  // and Deconstruction (-18% DEF ignore, 4s, from Liberation base-kit + Intro/Chromatic Splendor/Death Knell/
  // Imminent Oblivion via Inherent Skill Ars Gratia Artis) both already matched source exactly — unchanged.
  'Carlotta': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [{ stat: 'libDmg', value: 80, target: 'self', duration: 99, condition: 'Forte Circuit Final Bow: at full Substance, Liberation DMG Multiplier (Era of New Wave/Death Knell/Fatal Finale) +80%; ends if swapped out during Twilight Tango or when Twilight Tango ends' }],
    debuffs: [{ stat: 'defIgnore', value: 18, target: 'enemy', duration: 4, condition: 'Deconstruction: applied by Liberation, plus Intro/Chromatic Splendor/Death Knell/Forte Heavy via Ars Gratia Artis' }],
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
  // corrected 2026-08-18: removed the two "Weapon R1" selfBuffs (ATK+24%, DEF Ignore+16%) — these
  // duplicated Blazing Justice's passive as a hardcoded always-on assumption, double-counting with
  // whatever weapon.pv the calculator already applies for the actually-equipped weapon (and using stale
  // pre-fix numbers besides — Blazing Justice's real passive is ATK+12%/DEF Ignore+8%, not +24%/+16%).
  // Re-verified 2026-08-31 vs the wiki/Zani/Combat + the source kit tab: outroBuffs
  // (+20% Spectro DMG Amp/20s to marked-target hits) and Quick Response selfBuff (+12% Spectro DMG/14s on
  // Intro cast) both confirmed exact, no change. Sunburst (Targeted Action/Forcible Riposte cast → +20%
  // Spectro Frazzle DMG for 14s) is a real, numeric self-buff confirmed on both sources but intentionally
  // NOT added as a stat entry here — this schema's BUFF_STAT_TAGS has no "Frazzle DMG amp" category (only
  // elemDmg/basicDmg/heavyDmg/skillDmg/libDmg/etc., none of which correctly scope to "Frazzle-flagged hits
  // only" the way Sunburst does), so force-fitting it to e.g. elemDmg would over-apply it to her non-Frazzle
  // Spectro damage too. TODO: needs Phase 2 schema (a frazzleDmg buff-stat key) to represent Sunburst without
  // being lossy. Fear No Pain (Ready Stance: -40% DMG taken) is pure mitigation, not a DPS buff — omitted here
  // for the same reason Augusta/Carlotta's non-DPS defensive Forte effects are omitted from this table.
  'Zani': {
    outroBuffs: [{ stat: 'elemDmg', value: 20, target: 'team', duration: 20, condition: 'To allies hitting the Heliacal Ember-marked target' }],
    libBuffs: [],
    selfBuffs: [
      { stat: 'elemDmg', value: 12, target: 'self', duration: 14, condition: 'Quick Response: Intro Skill cast grants +12% Spectro DMG Bonus' },
    ],
    debuffs: [],
    note: 'Converts Frazzle→Heliacal Embers. Outro grants allies hitting the marked target +20% Spectro DMG Amp (20s). Weapon contribution now comes entirely from the equipped weapon\'s own pv, not a hardcoded assumption.',
  },
  // ── 4★ ──
  // selfBuffs added 2026-09-03 against a real browser snapshot: both Inherent Skills
  // (Condensation, Avalanche) were entirely missing from this table and from sanhua.blocks.js.
  'Sanhua': {
    outroBuffs: [{ stat: 'basicDmg', value: 38, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [
      { stat: 'skillDmg', value: 20, target: 'self', duration: 8, condition: 'Inherent Skill Condensation: Resonance Skill DMG +20% for 8s after casting Intro Skill Freezing Thorns.' },
      // stat corrected 2026-09-04 (Phase A re-audit): was 'heavyDmg' — a two-path desync left over from
      // when sanhua.blocks.js still combined Detonate+Ice Burst into one heavyDmg block. Once that block
      // was split (Ice Burst -> its own skillDmg block), the trigger-engine copy of this buff was fixed
      // to skillDmg but this raw legacy-path (calcEngine.js) copy was never updated to match. Ice Burst
      // is skillDmg per its own kit text ("considered Resonance Skill DMG"), so this buff must be too.
      { stat: 'skillDmg', value: 20, target: 'self', duration: 8, condition: 'Inherent Skill Avalanche: Forte Circuit Ice Burst DMG +20% for 8s after casting Basic Attack V — no plain Basic ATK step exists in her real (Heavy ATK Concerto) rotation to anchor a cast trigger, same limitation already flagged on chain.s1.' },
    ],
    debuffs: [],
    note: 'Outro: 38% Basic ATK DMG Amp (14s). Quick swap. Condensation (+20% Skill DMG/8s after Intro) and Avalanche (+20% Ice Burst DMG/8s after Basic V) are her 2 Inherent Skills.',
  },
  'Mortefi': {
    outroBuffs: [{ stat: 'heavyDmg', value: 38, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 38% Heavy ATK DMG Amp. Off-field Coordinated ATK on Heavy ATK.',
  },
  'Danjin': {
    // Corrected back 2026-09-01: the 2026-08-18 change to 'amplify' was based on the source paraphrase.
    // Re-verified directly against the wiki/Danjin/Combat and the source/
    // character/1602 (both agree word-for-word): "The incoming Resonator has their Havoc DMG Amplified
    // by 23%" — this is a buff to the ally's own outgoing Havoc DMG (elemDmg), not a Amplify-type
    // vulnerability debuff on the enemy (a different mechanic — Amplify means the target takes more
    // damage from all attackers, not that one ally hits harder). Reverted amplify -> elemDmg.
    // condition added 2026-09-01 (found via a recommendation-scoring audit): this buff's own note
    // below already says "Havoc DMG Amp" — genuinely element-locked, per the 2026-09-01 correction
    // comment above re-verifying it's elemDmg not amplify — but the missing condition text let
    // scoreTeamComposition's elemBuffApplies (which treats an empty condition as universal) credit it
    // for ANY off-element placed DPS.
    outroBuffs: [{ stat: 'elemDmg', value: 23, target: 'next', duration: 14, condition: 'Havoc DMG Amp' }],
    libBuffs: [],
    // selfBuffs: added Overflow 2026-09-03 against a real browser snapshot — this Inherent
    // Skill was entirely missing here and from danjin.blocks.js, despite Sanguine Pulse always
    // preceding her Forte Heavy Attack (Chaoscleave) in the real modeled rotation.
    selfBuffs: [{ stat: 'heavyDmg', value: 30, target: 'self', duration: 5, condition: 'Inherent Skill Overflow: casting Resonance Skill Sanguine Pulse → Heavy Attack DMG +30% for 5s.' }],
    debuffs: [],
    note: 'Outro: 23% Havoc DMG Amp to next. Overflow (+30% Heavy ATK DMG/5s after Sanguine Pulse) directly buffs Chaoscleave, her real rotation\'s Heavy-ATK-categorized Forte finisher.',
  },
  'Baizhi': {
    outroBuffs: [{ stat: 'amplify', value: 15, target: 'next', duration: 6 }],
    libBuffs: [{ stat: 'atkPct', value: 15, target: 'team', duration: 20 }],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro: 15% Amplify (6s per tick, refreshes on heal). Inherent: 15% ATK teamwide (20s on Euphonia pickup). Heal.',
  },
  // corrected 2026-08-18: the wiki's Taoqi/Combat Forte Details table names her Outro Skill "Iron Will":
  // "The incoming Resonator has their Resonance Skill DMG Amplified by 38% for 14s or until they are
  // switched out." Was wrongly modeled as a generic 15% `amplify` outro (a value/stat that belongs to no
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
  // corrected 2026-08-18: the wiki's Yuanwu/Combat Forte Details table for Outro Skill "Lightning
  // Manipulation" text is "Yuanwu unleashes thunderbolts in an area centered around the skill target,
  // greatly reducing the Vibration Strength of enemies upon impact" — no DMG buff of any kind, so the
  // unsourced 15% `amplify` outroBuff (no basis anywhere on the Combat page) is removed. His actual
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
  // Corrected 2026-08-18 via the source's Kit tab. Outro: Whispering Breeze funnels 4 Resonance
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
  // corrected 2026-08-18: outroBuffs was a fabricated '15% Amplify (14s)' — the wiki's Buling/Combat Forte
  // Details table gives her Outro (Exorcism Spell) as "Heal the active Resonator by 18% of Buling's ATK
  // per second for 16s. All nearby Resonators in the team have their DMG Amplified by 15% for 30s" — a
  // general (non-elemental) team DMG Amp with no swap-out expiry, not a Amplify effect on the next
  // character; modeled as 'allDmg' target 'team' for 30s. libBuffs added — her Forte Circuit (enhanced
  // Liberation, entered via Yin-Yang Balance) deploys the Five Thunders Spell Array; while it's active,
  // each ally Intro Skill cast ramps team Resonance Skill DMG Bonus from 0%→10%→25% (confirmed exact,
  // 50% at S6 — see RESONANCE_CHAIN_DATA below), modeled at its documented 25% base-kit ceiling.
  'Buling': {
    outroBuffs: [{ stat: 'allDmg', value: 15, target: 'team', duration: 30, condition: "Outro (Exorcism Spell) — DMG Amp to nearby team members; doesn't expire on swap. Also heals the active character for 18% of Buling's ATK/s for 16s" }],
    libBuffs: [{ stat: 'skillDmg', value: 25, target: 'team', duration: 24, condition: 'Enhanced Liberation (Flashing Thunder Spell: Harmony, requires Minor Yin+Yang) deploys Five Thunders Spell Array (24s); team Resonance Skill DMG Bonus ramps +10%→+25% as allies cast Intro Skill during it (+50% at S6)' }],
    selfBuffs: [],
    debuffs: [],
    electroFlare: true,
    note: 'Off-field healer (Heavy Attacks/Intro/Outro). Enhanced Liberation deploys Electro Flare array + ramping team Skill DMG Bonus on ally Intro casts (10%→25%, 50% at S6). Outro: 15% team DMG Amp (30s).',
  },
  'Aalto': {
    // corrected 2026-08-18: outroBuffs was empty, missing Aalto's actual Outro Skill "Dissolving Mist" (the wiki Combat
    // page: "The incoming Resonator has their Aero DMG Amplified by 23% for 14s or until they are switched out").
    // condition added 2026-09-01 (found via a recommendation-scoring audit): the correction comment
    // above already quotes "Aero DMG Amplified by 23%" — genuinely element-locked — and
    // CHARACTER_DATA.Aalto's own 'teams corrected' comment explains this only benefits an Aero Main
    // DPS, but the missing condition text let scoreTeamComposition's elemBuffApplies (which treats an
    // empty condition as universal) credit it for ANY off-element placed DPS.
    outroBuffs: [{ stat: 'elemDmg', value: 23, target: 'next', duration: 14, condition: 'Aero DMG Amp' }],
    libBuffs: [],
    // corrected 2026-08-18: removed "Weapon passive: Aero DMG +12%" — this assumed a generic weapon
    // Attr DMG baseline regardless of which weapon is actually equipped, double-counting with the
    // equipped weapon's own pv (most 4-5★ weapons carry this baseline) or phantom-applying it with any
    // weapon that doesn't.
    selfBuffs: [],
    debuffs: [],
    note: 'Off-field Aero applicator. Outro: 23% Aero DMG Amp to next. Mist clone Coordinated ATK.',
  },
  'Chixia': {
    outroBuffs: [],
    libBuffs: [],
    // corrected 2026-08-18: value was 15%, but the actual Inherent Skill "Numbingly Spicy!" (the wiki Combat page)
    // grants ATK+1% per Thermobaric Bullet hit during DAKA DAKA!, stacking up to 30 times (30% ATK at max stacks),
    // 10s per-stack duration — using the max-stack value like other stacking-buff entries in this table.
    selfBuffs: [{ stat: 'atkPct', value: 30, target: 'self', duration: 10, condition: 'Inherent: Numbingly Spicy! ATK stacks (max 30 stacks during DAKA DAKA!)' }],
    debuffs: [],
    note: 'Fusion DPS. Resonance Skill burst. Whizzing Fight Spirit sustained fire.',
  },
  // corrected 2026-08-18: duration was 14s, but the wiki's Lumi/Combat Forte Details table (Escorting,
  // Outro Skill) reads exactly "Resonance Skill DMG Amplified by 38% for 10s or until they are switched
  // out" — 38% was already correct, only the duration had no basis (matches the source's Review tab wording
  // too, which also states 38%).
  'Lumi': {
    outroBuffs: [{ stat: 'skillDmg', value: 38, target: 'next', duration: 10 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Outro (Escorting): 38% Resonance Skill DMG Amp to next for 10s or until they switch out. Electro Hybrid buffer.',
  },
  // corrected 2026-08-18: the prior 'Lib: 12% ATK teamwide' buff had no basis anywhere on the wiki's
  // Combat page or the source's Kit tab — Fortune's Favor (Liberation) carries no team buff at all, it's a
  // DMG blast that grants an Antique. Her real, previously-missing standout buff is the Outro (Timeless
  // Classics): Coordinated ATK DMG Amplified +100% for 28s to the incoming character — "the single
  // biggest source of damage amplification for any attack type in the game" per the source's Review tab.
  'Youhu': {
    outroBuffs: [{ stat: 'coordDmg', value: 100, target: 'next', duration: 28 }],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Glacio healer (Scroll Divination + Poetic Essence, both heal on cast). Outro Timeless Classics: +100% Coordinated ATK DMG Amp (28s) to the incoming Resonator — her signature niche buff.',
  },
  // ── 5★ Main DPS missing from initial table ──
  'Aemeath': {
    // Added 2026-08-31 — outroBuffs was empty despite Aemeath having a real team-wide Outro buff
    // (Silent Protection). Confirmed by two independent sources in references/combat-db: her own
    // the source-sourced kit.skills.outro text ("grants team (excl. Aemeath) 10-20% All-DMG Amplification
    // for 20s depending on Resonance Mode responders") and the wiki's official Outro Skill page
    // (the wiki/Outro_Skill, fetched 2026-08-31: "In Tune Rupture mode: team
    // (except Aemeath) 10% All-DMG Amp for 20s (20% for Tune Rupture-Shifting inflictors). In Fusion
    // Burst mode: same 10%/20% structure."). Modeled at the guaranteed 10% floor (team-wide, both
    // Resonance Modes) rather than the conditional 20% ceiling, since the engine's `condition` field
    // only gates on named elements (see universalStatApplies in calcEngine.js) and can't gate on "is a
    // Tune Rupture-Shifting inflictor" — encoding 20% here would silently apply it to every team member
    // in every comp, which overstates for non-inflictors more than the 10% floor understates for them.
    outroBuffs: [{ stat: 'allDmg', value: 10, target: 'team', duration: 20 }],
    libBuffs: [],
    // corrected 2026-08-18: removed the two "Sig weapon" entries (DEF Ignore +32%, Fusion RES ignore +10%)
    // — they exactly duplicated Everbright Polestar's own pv, which the calculator already applies whenever
    // that weapon is actually equipped. Hardcoding it here double-counted it and phantom-applied it with
    // any other weapon equipped.
    selfBuffs: [
      { stat: 'critDmg', value: 60, target: 'self', duration: 99, condition: 'Inherent Skill Between the Stars: Tune Rupture mode 20% per Resonator ×3 stacks, or Fusion Burst mode 30% per Resonator ×2 stacks (both max 60%, resets on team change/mode switch)' },
      { stat: 'amplify', value: 25, target: 'self', duration: 99, condition: 'At max Between the Stars stacks, Heavenfall Edict: Finale DMG Amplified +25%' },
    ],
    // debuffs.fusionBurst corrected 2026-09-02 (the engine-architecture history (git log) item 9): this entry's ONLY real
    // functional effect anywhere in the codebase is marking her as a "Fusion Burst applier" for the
    // shared calcFusionBurstDmg() reaction (calcEngine.js's applyBuff() switch has no case for the
    // 'fusionBurst' stat, so `value`/`condition` here were pure inert documentation, not a live per-
    // stack DMG Mult as the old comment implied — the real Trail-removal scaling mechanic they were
    // describing has no field this schema can represent and stays an undocumented approximation gap,
    // same class of limitation as several other characters' nonlinear per-stack mechanics). What this
    // entry SHOULD represent, and now does: her real, sourced, mode-conditional Fusion Burst status
    // application ("In Resonance Mode - Fusion Burst, Basic Stage 3/4 (either form), Sync Strikes, and
    // both Intro skills inflict Fusion Burst on hit") — active ONLY in Fusion Burst mode, mutually
    // exclusive with her Tune Rupture mode's Starburst proc below. `value`/`condition` still carry no
    // live weight (calcFusionBurstDmg's own formula doesn't scale by them, same pre-existing
    // simplification for every fusionBurst-flagged character), so left as documentation only.
    debuffs: [{ stat: 'fusionBurst', value: 30, duration: 30, condition: 'Fusion Burst mode only: Basic Stage 3/4/Sync Strikes/Intro skills inflict Fusion Burst on hit' }],
    // Added 2026-08-18 against the source's live kit page (JS-rendered fetch). Confirmed genuine Tune
    // Rupture Response — Forte Circuit "Unlanded Melody": "Responding to Tune Rupture - Interfered:
    // when Resonators in the team trigger Tune Break on the target and cause them to be affected by
    // Tune Rupture - Interfered, Aemeath triggers Tune Rupture Response - Starburst. The same target
    // can only be damaged by this skill once every 8s." Exact ruptureDmgMult found and filled in
    // 2026-09-02 (the engine-architecture history (git log) item 9, investigating her real mode-choice magnitude): a fresh
    // dump's own Forte Circuit multipliers table gives it directly — "Tune Rupture Response: Starburst
    // | 596.43% Tune AMP" (Lv.10), closing the exact gap this comment used to flag as "not confirmed,
    // omitted rather than guessed" — cross-confirmed identically on a second source (the source). No
    // "Tune Break Boost" team buff or stack-cap increase found anywhere in her kit text, so
    // boostToTeam/maxStrainStacks/strainDmgPerStack stay omitted — she has no Tune Strain-side response
    // at all (this node is Rupture-response only, no dual-response shape like Mornye's).
    //
    // modeExclusive + competesWithFusionBurstReaction (added 2026-09-02): real bug found investigating
    // this — Starburst (Rupture-mode-only) and the fusionBurst reaction above (Fusion-Burst-mode-only)
    // were BOTH being counted unconditionally for any team with her in it, even though her own kit text
    // marks each as active in exactly one, opposite mode. calcTuneBreakDmg/calcFusionBurstDmg now
    // resolve these three-way (Fusion / Rupture / Strain-not-applicable-here) by comparing real final
    // team totals, same principle as Lynae's own mode-exclusivity fix — see dotReactions.js's own
    // comment for the mechanism.
    tuneBreak: {
      baseTuneBreakBoost: 10, // 3.x char base stat
      ruptureDmgMult: 596.43, // Tune Rupture Response — Starburst (confirmed exact, Lv.10)
      modeExclusive: true,
      competesWithFusionBurstReaction: true,
    },
    note: 'Strongest DPS in game. Dual mode: Tune Rupture (ST) / Fusion Burst (AoE). Enhanced Seraphic Duet scales off Rupturous/Fusion Trail (up to 30 stacks = 300% mult, 4%/10% per stack removed) — this per-stack scaling isn\'t modeled (no field for it), an open gap. Weapon contribution now comes entirely from the equipped weapon\'s own pv, not a hardcoded assumption. Self-buff: up to 60% CD via Between the Stars. Tune Break: Starburst (Rupture, 596.43%) vs the Fusion Burst reaction (Fusion) are now resolved mode-exclusively (2026-09-02) instead of both firing unconditionally.',
  },
  // corrected 2026-08-18: removed "Weapon passive: Aero DMG +12%" — this assumed a fixed generic weapon
  // baseline regardless of which weapon is actually equipped, double-counting with the equipped weapon's
  // own pv, or phantom-applying it otherwise. Verdant Summit's real passive (re-verified against
  // the source) is also no longer a flat "+20%" Heavy ATK bonus, so the stale note was corrected too.
  'Jiyan': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Heavy ATK DPS in Qingloong form. Weapon contribution now comes entirely from the equipped weapon\'s own pv, not a hardcoded assumption.',
  },
  // corrected 2026-08-18: removed "Weapon passive" (ATK +12%) — same double-counting/phantom-bonus issue
  // as Jiyan/Aalto above.
  'Calcharo': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: 'Liberation → Death Messenger combo.',
  },
  // Added 2026-08-31 (verified against wuthering.gg/characters/encore + the wiki/Encore/Combat):
  // Inherent Skill "Angry Cosmos" (+10% DMG during Cosmos Rave while HP > 70%) was completely missing from
  // selfBuffs — only Woolies Cheer Dance was present. Woolies Cheer Dance's own condition text was re-verified
  // verbatim and is unchanged (it really is triggered by "Resonance Skill Flaming Woolies or Resonance Skill
  // Cosmos - Rampage", not the Liberation Cosmos Rave cast itself).
  'Encore': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'elemDmg', value: 10, target: 'self', duration: 10, condition: 'Inherent Skill Woolies Cheer Dance: Fusion DMG +10%/10s on Flaming Woolies/Cosmos-Rampage cast.' },
      { stat: 'allDmg', value: 10, target: 'self', duration: 10, condition: 'Inherent Skill Angry Cosmos: +10% DMG dealt during Resonance Liberation Cosmos Rave while Encore\'s HP is above 70%. TODO: needs Phase 2 schema — conditional on both being in the Cosmos Rave window AND the 70% HP threshold, not a flat always-on buff; duration approximated to Cosmos Rave\'s 10s window since the source gives no separate timer.' },
    ],
    debuffs: [],
    note: 'On-field Fusion main DPS. Builds Mayhem (caps 100) from Basic ATK/Skill/Intro hits; at full Mayhem, Heavy ATK enters a 70% DMG-reduction state (survives swap-out) and casts a big Liberation-DMG finisher (Cloudy Frenzy / Cosmos Rupture) on exit. Liberation Cosmos Rave (125 Energy, 16s CD) replaces her whole kit with enhanced Fusion versions for a fixed 10s. Outro Thermal Field is a pure DoT proc, no team buff — free to quickswap.',
  },
  // selfBuffs: added Diligent Practice 2026-09-03 against a real browser snapshot — this
  // Inherent Skill was entirely missing here and from lingyang.blocks.js, despite the source's own
  // Rotation section explicitly naming it as the reason his burst rotation alternates Basic/Skill
  // ("to take advantage of his Inherent Skill: Diligent Practice").
  'Lingyang': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'elemDmg', value: 50, target: 'self', duration: 14, condition: "Liberation Strive: Lion's Vigor grants self Glacio DMG Bonus +50% for 14s." },
      { stat: 'totalMult', value: 150, target: 'self', duration: 3, condition: "Inherent Skill Diligent Practice: in Striding Lion state, within 3s after each Basic Attack, the next Resonance Skill Mountain Roamer deals an additional 150% of Mountain Roamer's own damage (considered Resonance Skill DMG)." },
      // Added 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): Inherent Skill Lion's Pride was entirely
      // missing from both this table and lingyang.blocks.js despite being a real, sourced kit component.
      { stat: 'totalMult', value: 50, target: 'self', duration: 0, condition: "Inherent Skill Lion's Pride: DMG of Intro Skill Lion Awakens +50% (scoped only to that hit)." },
    ],
    debuffs: [],
    note: "On-field Glacio main DPS. Forte Circuit's Striding Lion state (entered via Heavy ATK Glorious Plunge at full Lion's Spirit) unlocks airborne enhanced attacks. Outro Frosty Marks is a pure-DMG AoE proc, not a team buff, though S4 Resonance Chain grants team Glacio DMG +20%/30s on it. Diligent Practice (+150% Mountain Roamer DMG within 3s of a Basic Attack) is the core mechanic his real rotation alternates Basic/Skill to keep active. Lion's Pride grants Intro Skill Lion Awakens +50% DMG.",
  },
  'Cartethyia': {
    outroBuffs: [{ stat: 'elemDmg', value: 17.5, target: 'next', duration: 20, condition: 'Aero DMG vs Negative Status targets' }],
    libBuffs: [],
    selfBuffs: [],
    // corrected 2026-08-18: removed the self-target "Sig weapon" DEF Ignore entry — it exactly duplicated
    // Defier's Thorn's own pv.defIgnore, which the calculator already applies whenever that weapon is
    // actually equipped. The enemy-side "+20% DMG taken" debuff below is kept: it's not modeled anywhere
    // else (weapon pv has no enemy-debuff mechanism), so it isn't a double-count, though it's still a
    // hardcoded assumption that only holds true when Defier's Thorn is actually equipped.
    weaponBuffs: [],
    debuffs: [
      { stat: 'erosion', value: 6, duration: 15, condition: '6 stacks with Rover (3 base). HP-scaling DPS.' },
      { stat: 'elemDmg', value: 60, duration: 99, condition: "Wind's Indelible Imprint: targets at max (6) Erosion stacks take +60% more DMG from her (scales from +30% at 1-3 stacks, +10%/stack beyond)" },
      { stat: 'elemDmg', value: 20, duration: 15, condition: "Sig weapon (Defier's Thorn): Erosion-stacked targets take +20% more DMG (15s after Intro/Basic ATK)" },
    ],
    note: 'Top-tier Aero DPS. HP-scaling. Outro: +17.5% Aero DMG vs Negative Status (20s). Wind\'s Indelible Imprint debuffs Erosion-stacked targets up to +60% DMG taken. Weapon DEF Ignore now comes entirely from the equipped weapon\'s own pv, not a hardcoded assumption.',
  },
  // Corrected 2026-08-17 against the source's live build page: selfBuffs previously described a specific
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
    // stat corrected 2026-09-01 (found via a recommendation-scoring audit): this row's own field was
    // still 'elemDmg' even though the note below already said "Outro was mislabeled as amplify instead
    // of allDmg" back on 2026-08-16 — that earlier fix corrected the NOTE text but never actually
    // changed this field. Her real Outro (Battlesong of the Unyielding) grants "+15% All-Attribute DMG
    // Amp" per CHARACTER_DATA.Augusta's own desc — genuinely universal, not element-locked — but as
    // 'elemDmg' with no condition, scoreTeamComposition's elemBuffApplies (which treats an empty
    // condition as universal, same coincidental leak as the other 4 conditions fixed alongside this
    // one) happened to still score it as applying everywhere, just for the wrong conceptual reason —
    // a future gating fix for unconditioned elemDmg would have wrongly locked this to Electro-only.
    outroBuffs: [{ stat: 'allDmg', value: 15, target: 'next', duration: 14 }],
    libBuffs: [],
    selfBuffs: [
      { stat: 'elemDmg', value: 15, target: 'self', duration: 99, condition: 'Crown of Wills: +15% Electro DMG Bonus per stack, max 1 stack at base kit (S0)' },
    ],
    debuffs: [],
    note: 'Heavy ATK AoE DPS with built-in self shields (Glory\'s Favor) and a Crown of Wills self-buff. Outro: +15% All DMG Amp to next Resonator (14s, ends immediately on swap-out), not an "Amplify" multiplier. Liberation\'s Ruler\'s Realm grants teammates a shield on Intro cast — no direct DPS stat. Majesty/Crown-of-Wills Outro payoff is CONDITIONAL, not automatic: Augusta only gains the stack if the buffed Resonator Outros back to her before a third swap (see CHARACTER_ROTATIONS Outro note and RESONANCE_CHAIN_DATA comment for the full mechanic) — not modeled as an unconditional self-buff here since it depends on partner behavior, out of scope for this schema until Phase 2 wiring. (Corrected 2026-08-16: Outro was mislabeled as amplify instead of allDmg; added missing Crown of Wills self-buff. Conditional Outro-back mechanic documented 2026-08-31.)',
  },
  'Galbrena': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'allDmg', value: 85, target: 'self', duration: 14, condition: 'Liberation cast: +85% DMG Mult to Demon Hypostasis attacks' },
      { stat: 'atkPct', value: 20, target: 'self', duration: 4, condition: 'Burning Drive: +20% ATK on certain casts' },
    ],
    debuffs: [{ stat: 'amplify', value: 60, target: 'enemy', duration: 0, condition: "Afterflame: each of up to 40 stacks (gained from any team Resonator's Echo Skill cast, capped once per Echo name) grants +1.5% DMG Taken on the target while Galbrena is in Demon Hypostasis, up to 60% — cleared when she exits the state" }],
    note: 'Echo Skill + Heavy ATK Fusion DPS. Outro (Ashen Pursuit) is pure damage, no team buff — free to quickswap. Self-buffs via Liberation and Burning Drive, no team support kit. Afterflame is a DMG Taken debuff on the enemy (not a self-buff), replenished by any teammate\'s Echo Skill casts — realistically 36% without Phrolova, 48% with her (rarely maxed at 60%).',
  },
  // corrected 2026-08-18: removed all three "Weapon:" selfBuffs — they exactly duplicated his signature
  // weapon Daybreaker's Spine's own pv (Basic ATK DMG Amp +20%, Spectro DMG +20%, DEF Ignore +10%), which
  // the calculator already applies whenever that weapon is actually equipped. Hardcoding it here
  // double-counted it and phantom-applied it with any other weapon equipped.
  'Luuk Herssen': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    // Added 2026-08-18 against the source's live kit breakdown — tuneBreak sub-object was entirely
    // missing despite Luuk having a full Tune Strain response kit (Tune Strain mode only; Forte
    // Circuit "Silent Debate of Light" gives him no team-wide Tune Break Boost buff, so boostToTeam
    // stays 0). 0.12% total DMG per Tune Break Boost point per Tune Strain - Interfered stack; +1 to
    // the target's max Tune Strain - Interfered stack cap while he's in the team.
    tuneBreak: {
      boostToTeam: 0,
      baseTuneBreakBoost: 10, // 3.x char base stat
      strainDmgPerStack: 0.12, // per stack of Tune Strain - Interfered, per point of Tune Break Boost
      maxStrainStacks: 3, // base 2 + 1 from Luuk Herssen
    },
    note: 'Spectro Gauntlets DPS. Tune Strain focused. Weapon contribution now comes entirely from the equipped weapon\'s own pv, not a hardcoded assumption. Tune Break kit: Tune Strain response 0.12% DMG/stack/Boost, +1 max Strain stack, no team Tune Break Boost buff.',
  },
  'Sigrika': {
    outroBuffs: [],
    libBuffs: [],
    // corrected 2026-08-18: removed the "Sig weapon" DEF Ignore entry — it exactly duplicated Solsworn
    // Ciphers' own pv.defIgnore, which the calculator already applies whenever that weapon is actually
    // equipped. Hardcoding it here double-counted it and phantom-applied it with any other weapon equipped.
    selfBuffs: [
      // value is the CAP (50) — erScale lets the engine compute her real bonus from actual equipped
      // ER (2% per 1% ER above 125%, capped at 50%) instead of always applying the max, the same
      // fix already applied to Mornye's Tune Break Interfered Marker amp.
      { stat: 'echoDmg', value: 50, target: 'self', duration: 15, erScale: { threshold: 125, ratePerPercent: 2, cap: 50 }, condition: 'Inherent: +2% Echo Skill DMG per 1% ER above 125% (up to 50%)' },
      // Added 2026-08-17 against the source's live kit breakdown — Blessing of Runes was missing entirely.
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
    // Corrected 2026-08-16: Outro skill name was wrong — file previously called it "Final Applause";
    // the real base Intro name "Suite of Quietus" was also missing, previously only the enhanced
    // Maestro form was listed.
    note: 'Outro (Unfinished Piece): +20% Havoc DMG + 25% Heavy ATK DMG Amp (14s). Self: up to 60-100% CD from Aftersound stacking. Intro is "Suite of Quietus" (base) / "Suite of Immortality" (Maestro-enhanced).',
  },
  // ── Electro characters with Electro Flare ──
  // Corrected 2026-08-17 against the source's live build page: selfBuffs previously described a specific
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
  // selfBuffs: added Metamorph 2026-09-03 against a real browser snapshot — this Inherent
  // Skill (base-kit, NOT chain-gated) was entirely missing here and from roverhavoc.blocks.js.
  'Rover: Havoc': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [
      { stat: 'elemDmg', value: 20, target: 'self', duration: 99, condition: 'Inherent Skill Metamorph: Havoc DMG Bonus +20% while in Dark Surge state.' },
      { stat: 'critRate', value: 25, target: 'self', duration: 99, condition: 'S6 (5 copies): Crit Rate +25% while in Dark Surge.' },
    ],
    debuffs: [{ stat: 'resShred', value: 10, duration: 20, condition: 'S4 (3 copies): Devastation/Liberation hit → Havoc RES Shred -10% (20s). Chain-gated, not innate.' }],
    note: 'On-field Havoc main DPS. Hold Heavy ATK at full Umbra to cast Devastation and enter Dark Surge — an enhanced Basic/Heavy/Skill state ending in Liberation Deadening Abyss, a 1520% ATK single-target nuke. Metamorph (+20% Havoc DMG in Dark Surge) is base kit, not chain-gated.',
  },
  // Fixed 2026-09-02 against a real browser snapshot: outroBuffs and libBuffs both stored a
  // real, non-DPS mechanic under a fabricated 'totalMult' key — neither Outro's Aero Erosion stack-cap
  // increase nor Liberation's healing formula is a damage multiplier, so encoding either one as
  // totalMult would inject a false DMG bonus into any consumer that reads it at face value (the
  // TriggerBlocks engine already independently avoided using these two fields, per
  // roveraero.blocks.js's own header comment — this only fixes the raw data table itself). Zeroed
  // both, real mechanics documented in the note instead, matching the "invented number with no basis"
  // removal precedent used elsewhere (e.g. Augusta's S5, Lucy's S5).
  'Rover: Aero': {
    outroBuffs: [],
    libBuffs: [],
    selfBuffs: [],
    debuffs: [],
    note: "Healer/support. Mid-air Skill Skyfall Severance strips Spectro Frazzle, Havoc Bane, Fusion Burst, Glacio Chafe, and Electro Flare stacks off the target hit and converts each into a stack of Aero Erosion. Forte Cloudburst Dance and Liberation Omega Storm both heal the team (no direct DMG buff). Outro Storm's Echo (Aeolian Realm, 30s): +3 max Aero Erosion stack cap on hit (10s) for the whole team — a stacking-limit increase, not a damage multiplier, so it has zero direct DPS component of its own; it enables OTHER team members (e.g. Cartethyia) to bank more Aero Erosion stacks. Liberation Omega Storm heals nearby team ~2090 flat + 77% ATK — a heal, not a damage buff.",
  },
  'Rover: Electro': {
    outroBuffs: [{ stat: 'allDmg', value: 25, target: 'ally', duration: 14, condition: 'Outro Rumbling Thunders: incoming Resonator gains Electro Core — next Negative Status hit grants All DMG Amp +25% (14s).' }],
    libBuffs: [],
    selfBuffs: [{ stat: 'atkPct', value: 10, target: 'team', duration: 20, condition: 'Tap-cast Overshock at max Electric Surge → team ATK +10% (20s).' }],
    debuffs: [{ stat: 'flare', value: 10, duration: 99, condition: 'Inherent Skill Decipher: hold-cast Overshock inflicts 10 stacks of Electro Flare.' }],
    note: 'Parry Stance hybrid. Hold Basic ATK for interrupt immunity + 60% DMG reduction. At max Electric Surge, tap Overshock for a team ATK buff or hold it to enter Apex Resonance, unlocking the multi-element Thrum of All Sounds Forte combo (Spectro/Havoc/Aero hits + Thunder Bane Electro pulses). Currently the weakest attunement — lacks a strong DPS partner.',
  },
};

// [SECTION:CHAR_BUFF_TAGS] — REMOVED 2026-09-06 (filter audit). This block used to re-derive
// CHARACTER_DATA[name].buffs/.debuffs from CHAR_BUFF_TABLE's numeric outroBuffs/libBuffs/selfBuffs/
// weaponBuffs/debuffs entries via a narrow BUFF_STAT_TAGS/DEBUFF_STAT_TAGS mapping (only ever producing
// 'DMG Buff', 'Crit', 'ATK Buff', 'Energy Regen', 'Heal', 'Coordinated ATK' for buffs, and 'DEF Shred',
// 'RES Shred', 'Frazzle', 'Erosion', 'Off-Tune' for debuffs), and it ran AFTER the real per-character
// [name, dmgFocus, buffs, debuffs] table above (whose own .forEach already does
// `Object.assign(CHARACTER_DATA[name], { dmgFocus, buffs, debuffs })`), silently overwriting every
// character's specific, verified tags (Shield, Grouping, Tune Break Boost, Glacio Chafe, Havoc Bane,
// Tune Strain - Interfered/Shifting, Hack - Shifting, Off-Tune Buildup Efficiency, etc.) with this
// cruder generic set on every page load. The [name, dmgFocus, buffs, debuffs] table above is the real,
// actively-maintained source of truth (58 characters, individually audited) — this block was dead
// weight that happened to run last and clobber it.

// [SECTION:SKILL_MULTIPLIERS] — Per-character skill ATK% multipliers at Lv.10 (max skill level)
// Format: { charName: [ [type, skillName, multString], ... ] }
// Source: the source character pages (Aemeath/Luuk Herssen/Lynae/Mornye/Chisa cross-checked against the source "Skill Attributes (Lv.10)" 2026-08-15)
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
  // Full audit 2026-09-01 against the wiki/Qingxiao/Combat, cross-checked against
  // the source/character/1413 (both agree on every value exactly — all pre-existing values were
  // already correct). Fixed a real zero-damage rotation bug: nearly every CHARACTER_ROTATIONS.Qingxiao
  // step used the full "Basic Attack - "/"Heavy Attack - " prefix (e.g. 'Heavy Attack - Stringblade'),
  // but the row names here were unprefixed ('Stringblade') or entirely missing (Mid-air combo, Ephemeral
  // Transcendence Basic ATK/Dodge Counter) — under the calc engine's substring-match lookup, a longer
  // step name can never match a shorter row name, so most of her rotation was silently dealing 0 DMG.
  // Renamed rows to match the rotation's own naming exactly and added every missing move.
  'Qingxiao': [
    ['Basic ATK', 'Basic Attack - Stringblade Stage 1-4', '30.13%×2 → 37.09%×2 → 24.36%×4 → 86.73%+5.43%×4'],
    ['Mid-air', 'Mid-air Attack - Stringblade Stage 1-3', '7.24%×5+54.28% → 44.89%+22.45%×2 → 11.14%×5+83.51%'],
    ['Mid-air', 'Plunging Attack', '86.29%'],
    ['Dodge Counter', 'Dodge Counter - Stringblade', '45.23%×4'],
    ['Heavy ATK', 'Heavy Attack - Stringblade', '14.62%×3+21.92%×6+263.03%', 'Once Qin Heart and Sword Cadence are both full; consumes both and enters Ephemeral Transcendence.'],
    ['Skill', 'Severing Note: Judgement', '20.88%×2+97.42%'],
    ['Skill', 'Severing Note: Ascendant', '28.40%+33.13%×2'],
    ['Forte', 'Basic Attack - Ephemeral Transcendence Stage 1-4', '44.89%+22.45%×2 → 23.11%×5 → 20.88%×3+31.32%×2 → 18.10%×4+108.56%'],
    ['Forte', 'Dodge Counter - Ephemeral Transcendence', '26.45%×4+158.66%'],
    ['Forte', "Heavy Attack - Heaven's Reckoning: Ephemeral Transcendence", '27.84%×9+445.34%', 'Once Heart Sword Intent is full; consumes it and ends Ephemeral Transcendence.'],
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
  // Two real zero-damage rotation-step bugs fixed 2026-09-02 against a fresh the source dump: 'Mid-air:
  // Feather Fall' and 'Basic ATK:Havoc in Bloom Stage 1-3' — both real CHARACTER_ROTATIONS steps used
  // in her actual rotation — had no matching row at all here (flagged in the engine block file's own
  // header comment), meaning both dealt silent 0 DMG in every calculation. Added below with their real
  // Lv.10 multipliers; Havoc in Bloom is explicitly "considered Heavy Attack DMG" per its own kit text.
  'Yangyang: Xuanling': [
    ['Basic ATK', 'Azure/Feather Stance Stage 1-4', '47.72% → 20.14%×2+60.41% → 30.21%+70.48% → 18.57%×2+148.49% (Azure) / 39.77%×2 → 33.56%×3 → 14.86%+7.43%×3+37.14% → 71.58%×2+95.43% (Feather)', 'Combo in either stance; Stage 4 applies Havoc Bane.'],
    ['Skill', 'Sword Stance Switch', '69.95%+15.55%×3 (Azure) / 33.56%×3 (Feather)', 'Swaps between Azure and Feather Sword Stance.'],
    ['Heavy ATK', 'Azure Sword Stance', '135.16%×2+180.21%', 'Big cyclone hit once Azure Plume is maxed.'],
    ['Heavy ATK', 'Feather Sword Stance', '21.71%+195.34%', 'Empowered hit once Azure Plume is maxed.'],
    ['Heavy ATK', 'Feather Fall', '14.80%×3+66.57%', 'Auto-chains off Heavy Attack: Feather Sword Stance; consumes Azure Plume, grants Hark the Wind (12s).'],
    ['Heavy ATK', 'Havoc in Bloom Stage 1-3', '39.79%×3 → 89.25%+66.94%×2 → 23.98%×5+279.69%', 'Replaces Basic Attack during Hark the Wind; considered Heavy Attack DMG despite the Basic Attack slot.'],
    ['Liberation', 'Hush of a Thousand Voices', '1988.10%', 'Ultimate nuke, maxes Havoc Bane on hit.'],
    ['Forte', 'Shadow of Xuanling', '337.98% ATK (summon proc)', 'Bonus summon hit on her next stance-swap Skill.'],
    ['Intro', 'Skybound Feather', '116.59%', 'Opener that applies Havoc Bane.'],
    ['Outro', 'As the Wind Wills', '300% ATK + team Havoc DMG buff', "Buffs other Havoc Bane appliers' DMG."],
  ],
  // Full audit 2026-09-01: the wiki/Hiyuki/Combat's Attribute Scaling collapsibles
  // render the wrong content for this character (a template/Lua bug — the section wraps a Skill Upgrade
  // materials-cost table instead of the real damage tables, similar to the documented Jinhsi issue), so
  // its numbers were unusable, but the source/character/1108's full Lv.10 table supplied every value
  // below, and the wiki's separately-rendered Resonance Chain section (unaffected by the bug) matched
  // the source's node text verbatim, cross-confirming the mechanics. Two serious bug classes fixed:
  // (1) Most of her Forte/Liberation/Intro moves were stored as placeholder description text instead of
  // real per-hit percentages (e.g. "3× arrow volley, considered Liberation DMG" instead of an actual
  // number) — the calc engine can't extract a DMG value from prose, so these were effectively dealing 0.
  // (2) Type miscategorization: her entire Foreclaimed Self move set (Basic ATK, Heavy ATK, Mid-air,
  // Dodge Counter, Iai, Frostedge, Frost Splinter) is explicitly "considered Resonance Liberation DMG" in
  // its own move text despite being cast from Basic/Heavy/Intro slots — retyped to 'Liberation' throughout
  // (matching this file's established convention, e.g. Lupa's Wolf's Claw, Galbrena's Ascent of Malice).
  // Also fixes a real zero-damage rotation bug: CHARACTER_ROTATIONS.Hiyuki's 'Foreclaimed Self Stage 1-3'
  // and 'Iai Stance ×3' steps had no matching row at all (the old row was named 'Stage 1-5', a different
  // substring; Iai wasn't in this table at all).
  'Hiyuki': [
    ['Basic ATK', 'Present Self Stage 1-3', '37.72%×2 → 90.25% → 4.92%×5+98.37%', 'Standard combo; Stage 3 applies Glacio Chafe. Not reclassified — plain Basic ATK DMG.'],
    ['Basic ATK', 'Mid-air Attack - Present Self', '128.18%'],
    ['Basic ATK', 'Dodge Counter - Present Self', '173.75%'],
    ['Liberation', 'Frost Splinter: Present Self', '79.31%×2+158.61%', '3-arrow volley once Dedication caps; interruption-immune throughout, applies Glacio Chafe on the last hit; considered Resonance Liberation DMG despite the Heavy ATK input.'],
    ['Skill', 'Resonance Skill - Present Self', '24.50%×4+97.98%', 'Enhances the next Basic Attack Stage 3 to restore extra Dedication.'],
    ['Liberation', 'Foreclaiming: Inward Vision', '397.62%', 'Ultimate: enters Foreclaimed Self, applies 4 stacks of Glacio Chafe on hit, grants 3 Frostharden Iai.'],
    ['Liberation', 'Foreclaimed Self Stage 1-3', '49.27% → 40.02%×2 → 25.16%×4+67.08%', 'Basic ATK replacement in Foreclaimed Self; Stage 3 applies Glacio Chafe. Considered Resonance Liberation DMG.'],
    ['Liberation', 'Foreclaimed Self Stage 4-5', '29.93%×5 → 12.17%+109.47%', 'Continuation of the Foreclaimed Self Basic ATK combo. Considered Resonance Liberation DMG.'],
    ['Liberation', 'Heavy Attack - Foreclaimed Self', '107.16%', 'Standard (non-Bitterfrost) Heavy ATK in Foreclaimed Self; considered Resonance Liberation DMG.'],
    ['Liberation', 'Mid-air Attack - Foreclaimed Self Stage 1-2', '28.83%×2+38.43% → 26.09%×4', 'Considered Resonance Liberation DMG; Stage 2 & 3 apply Glacio Chafe.'],
    ['Liberation', 'Mid-air Plunging Attack - Foreclaimed Self', '111.60%', 'Considered Resonance Liberation DMG.'],
    ['Liberation', 'Dodge Counter - Foreclaimed Self', '81.77%×2', 'Considered Resonance Liberation DMG.'],
    ['Skill', 'Frostblight: Jade Cleave', '66.01%×4', 'Ground Resonance Skill replacement in Foreclaimed Self; pulls in targets, restores Frostheart, removes Frostbind.'],
    ['Skill', 'Frostblight: Petalfall', '64.02%×4+64.02%', 'Mid-air Resonance Skill replacement in Foreclaimed Self; shares a cooldown with Jade Cleave.'],
    ['Liberation', 'Iai', '283.82%+47.31%×4', 'Cast in Iai Stance (100+ Frostheart) at up to 3 uses per entry; each cast consumes 1 Frostharden Iai for 3 Glacio Chafe stacks and grants 1 Whiteout Bitterfrost. Considered Resonance Liberation DMG.'],
    ['Liberation', 'Bitterfrost: Foreclaimed Self', '15.41%×8+493.05%', 'Forte finisher once Whiteout Bitterfrost is full; consumes it for 1 Snowforged Blade. Considered Resonance Liberation DMG despite the Heavy ATK input.'],
    ['Liberation', 'Foreclaiming: Blade Liberation', '198.81%+795.24%', '2nd Ultimate; base value shown, +795.24% additional per Snowforged Blade stack consumed (up to 3 stacks, +2385.72% max) — ends Foreclaimed Self.'],
    ['Liberation', 'Frostedge', '156.15%', 'Opener hit that applies Glacio Chafe; considered Resonance Liberation DMG despite the Intro Skill input.'],
    ['Outro', 'Snowlight Blessing', 'Team Glacio DMG +20% vs Chafe-affected targets (20s)', 'Buffs team Glacio DMG on Chafe-affected enemies (excludes Hiyuki herself).'],
  ],
  // Rebuilt 2026-09-02 from a real browser snapshot (confirmed genuine via its own
  // Snapshot-Content-Location header, not client-render-blocked this time — every "Multipliers"
  // widget's exact per-move table was readable). Replaces the prior single collapsed-string rows,
  // which had 2 real, sourced bugs plus 2 real data-completeness gaps:
  // (1) 'Locked Thread Stage 1-4' Stage 1 segment was '12.15%×6+48.59%' — a fabricated ×6 (real
  //     value is a single 12.15% hit, no repeat) — split into its own row and corrected.
  // (2) 'Payload / Pulse Interference / Deadlock' combined 3 different moves into 1 row, whose own
  //     Payload segment was truncated with a literal "..." in the stored string (documented in
  //     lucy.blocks.js as "a lower bound, not a fabricated completion") — now split into 3 real rows
  //     matching CHARACTER_ROTATIONS' own step names, with Payload's real 2-hit (Charge + Follow-Up)
  //     breakdown fully sourced, no more truncation.
  // (3) 'Basic ATK: Thread Shredding Stage 1-4' and 'Heavy ATK: Dual Threading' — both real
  //     CHARACTER_ROTATIONS steps with NO matching row at all (silently 0 DMG, flagged in
  //     data-integrity.test.js's KNOWN_UNRESOLVED_BASELINE and lucy.blocks.js's own "not modeled
  //     rather than guessed" comment) — now added with real sourced values.
  // Also added the previously entirely-missing base (non-Forte) Heavy Attack Stage 1/2, Plunging
  // Attack, Dodge Counter, and their Algorithm Compaction variants as reference data — none of these
  // are used in her real rotation (the Review section explicitly confirms "all Heavy Attacks
  // [outside Forte replacements]... will go unused" and Mid-air/Dodge Counter aren't in the rotation
  // either), so no engine blocks wired for them, matching the Carlotta Mid-air-row precedent.
  'Lucy': [
    ['Basic ATK', 'Locked Thread Stage 1', '12.15%+48.59%'],
    ['Basic ATK', 'Locked Thread Stage 2-4', '20.66%+20.05%×2 → 36.06%×2+48.08% → 31.02%+15.51%×3+38.77%×2', 'Builds the last of her TCP toward 100.'],
    ['Heavy ATK', 'Heavy Attack Stage 1', '22.10%+22.10%+29.47%', 'Base (non-Forte) Heavy Attack; confirmed unused in her real rotation.'],
    ['Heavy ATK', 'Heavy Attack Stage 2', '56.86%×2+18.96%×3+56.86%×2', 'Base (non-Forte) Heavy Attack; confirmed unused in her real rotation.'],
    ['Heavy ATK', 'Plunging Attack', '58.16%+58.16%', 'Confirmed unused in her real rotation.'],
    ['Heavy ATK', 'Dodge Counter', '59.32%+79.09%+59.32%', 'Confirmed unused in her real rotation.'],
    ['Heavy ATK', 'Mid-air Attack - Algorithm Compaction', '62.63%+62.63%', 'Confirmed unused in her real rotation.'],
    ['Heavy ATK', 'Dodge Counter - Algorithm Compaction', '38.97%×5', 'Confirmed unused in her real rotation.'],
    ['Basic ATK', 'Thread Shredding Stage 1-4', '19.49%×4 → 22.27%×5 → 28.12%×5 → 25.06%×5', 'Algorithm Compaction Basic ATK replacement; builds Root Access toward 100.'],
    ['Heavy ATK', 'Single Threading', '23.39%×5', 'Algorithm Compaction Heavy ATK replacement before Root Access is maxed; confirmed unused in her real rotation (she reaches max Root Access before needing a plain Heavy Attack).'],
    ['Heavy ATK', 'Dual Threading', '33.41%×5', 'Once Root Access is maxed, replaces Single Threading — consumes all Root Access, auto-chains into Multi-threading.'],
    ['Heavy ATK', 'Multi-threading', '59.65%+59.65%×3 (+270% SQL bonus)', 'Empowered finisher, stronger with SQL stacks.'],
    ['Skill', 'Payload', '20.05%+10.03%+40.09%+10.03%+20.05%', "Charge DMG (20.05%+10.03%) plus its automatic Follow-Up Attack (40.09%+10.03%+20.05%) — both fire off one Skill press, combined per CHARACTER_ROTATIONS' single 'Payload' step."],
    ['Skill', 'Pulse Interference', '30.86%×2+61.72%×3+61.72%', 'Fires automatically off the Payload follow-up.'],
    ['Skill', 'Deadlock', '51.70%+206.77%', 'Max-TCP Skill upgrade; considered Heavy Attack DMG despite the Skill input.'],
    ['Liberation', 'Netrunner: Override', '894.65%', 'Base Ultimate; considered Heavy Attack DMG despite the Liberation input.'],
    ['Liberation', 'Old Net Deep Dive', '1789.29%', 'Upgraded Ultimate (after casting Multi-threading in Algorithm Compaction); considered Heavy Attack DMG.'],
    ['Forte', 'Hack Response - Data Crash', '1094.19%+68.39%×4 (Hack DMG)', 'Bonus DMG on Hack-Interfered targets.'],
    ['Intro', 'Outdated Hallucination', '69.14%×2', 'Opener that reveals enemies through walls.'],
    ['Outro', 'Countermeasure Program', '25% Basic ATK DMG Amp to next + team Hack-Shifting response', "Buffs next ally's Basic ATK DMG."],
  ],
  // Full audit 2026-09-01 against the wiki/Rebecca/Combat, cross-checked against
  // the source/character/1308 (both agree on every value exactly, including the "Lucy" reference in
  // the Outro's Overlimit text — re-verified as a real cross-character interaction, not a copy/paste
  // error, since it's identical and independent across both sources). Fixed a real zero-damage rotation
  // bug: CHARACTER_ROTATIONS.Rebecca's 'Basic ATK'/'Guts Stage 1-3' step had no matching row at all — the
  // whole Guts-mode Basic ATK combo was missing from this table, added below. Also added the missing
  // base (non-Forte) Heavy ATK for both stances and the "Hey, Leadhead, Come 'n' Get Me!" Intro variant,
  // and fixed a fabricated Liberation value: Party 'til Dawn' was stored as "24.30%→116.64% ramp", but
  // 116.64% never appears as a DMG Multiplier anywhere in either source (it's the unrelated Elemental DMG
  // stat from the raw scaling table's 2nd-Enhancement row) — the real mechanic is 3 discrete auto-fire
  // tiers (24.30% / 48.60% / 72.90%), corrected below.
  'Rebecca': [
    ['Basic ATK', 'Huntress Stage 1-3', '36.76%×2 → 19.13%×4+19.13% → 109.85%'],
    ['Basic ATK', 'Guts Stage 1-3', '61.69%×2 → 84.50% → 33.77%×2+157.57%'],
    ['Heavy ATK', 'Standard - Huntress', '16.90%×2'],
    ['Heavy ATK', 'Standard - Guts', '202.79%'],
    // type corrected 2026-09-02: was 'Heavy ATK', but CHARACTER_ROTATIONS['Rebecca']'s own real step for
    // this move uses type:'Forte' — the type mismatch meant findSkillMultiplierRow() could never match
    // this row against that rotation step at all (exact AND fuzzy match both require t === step.type),
    // a silent zero-DMG display bug independent of the category question below.
    // Value corrected 2026-09-02: was 19.89%×3+318.10%+19.89% / 278.34% (matching the source .mht
    // snapshot's own raw Lv.10 table) — but the user's own directly-pasted the source text gives
    // 10.00%×3+160.00%+10.00% / 140.00% instead, and confirmed by re-checking the source directly that
    // this is correct. Per standing instruction, user-pasted the source text takes priority over other
    // sources on a real conflict — corrected to the source's value.
    ['Forte', 'Rat-tat-tat!: Huntress / Bang-bang-bang!: Guts', '10.00%×3+160.00%+10.00% / 140.00%', 'Forte finisher once Fervor is maxed. Considered Basic Attack DMG per its own kit text, despite replacing Heavy Attack.'],
    ['Skill', "It's Big Boomin' Time! / Come 'n' Get Me!", '23.66%×4+35.49%×4 / 23.66%+4.74%+23.66%×2+137.22%+11.83%×2', 'Closes distance and swaps stance.'],
    ['Liberation', "Party 'til Dawn!", '24.30% / 48.60% (1st enhancement) / 72.90% (2nd enhancement), auto-fires repeatedly for 9.5s', 'Mk. 31 HMG channel; pressing/holding Basic ATK or Liberation during it ramps to the next firepower tier and builds Overload faster.'],
    ['Liberation', 'BOOM! Fireworks!', '63.62%+572.58%', 'Auto-casts when the channel ends or Overload maxes.'],
    // Value corrected 2026-09-04 (fresh Phase A audit): this row was left at the stale 2358.89% .mht
    // snapshot value while CHAR_BUFF_TABLE['Rebecca'].tuneBreak.ruptureDmgMult was already corrected to
    // 1186.5 on 2026-09-02 per the user-pasted source text taking priority — a two-path desync (this
    // display-only informational row never got the same fix). Corrected to match.
    ['Forte', 'Hack Response - Meltdown', '1186.50% (Hack DMG)', 'Bonus DMG when allies inflict Hack-Interfered.'],
    ['Intro', "Yo, It's Big Boomin' Time!", '27.04%×6+40.56%+67.60%', 'Huntress-mode opener that also swaps her to Guts.'],
    ['Intro', "Hey, Leadhead, Come 'n' Get Me!", '10.14%+30.42%+40.56%×4', 'Guts-mode opener that also swaps her to Huntress.'],
    ['Outro', 'Preem Choom', 'Turret (2.5% Electro DMG/hit, 14s) + Edgerunner Bonds (15% All DMG Amp, 14s) + Overlimit (0.5%/0.2s Heavy ATK DMG Amp, up to 35%)', "Leaves a turret; buffs next ally's All DMG and Heavy ATK DMG."],
  ],
  // Full audit 2026-09-01 against the wiki/Denia/Combat, cross-checked against
  // the source/character/1211 (both agree exactly, including a the wiki-side table for Banish -
  // Breakdown Form Stage 2 that's truncated at Lv.9 — extrapolating the same ~1.075x per-level growth
  // ratio every other row shows lands almost exactly on the source's stated Lv.10 112.01%, confirming it).
  // Nearly every row here was placeholder description text instead of a real number (same bug class as
  // Hiyuki, found and fixed earlier this pass) — the calc engine can't extract a DMG value from prose, so
  // these were effectively dealing 0. Also fixed real zero-damage rotation-name mismatches: 'Banish Stage
  // 1'/'Banish Stage 2' never matched the old combined 'Phantom Bubble / Beckon / Banish' row at all.
  // Banish - Breakdown Form Stage 2 and Erosion Field are each explicitly "considered Resonance
  // Liberation DMG" in their own move text despite being cast from the Skill/Forte slots — typed
  // 'Liberation' (Stage 1 of Banish has no such reclassification and stays 'Skill').
  'Denia': [
    ['Basic ATK', 'Stagecraft Form Stage 1-4', '32.69% → 30.18%×2 → 25.49%×3 → 128.00%', 'Stage 3/4 apply Fusion Burst or Tune Strain - Shifting depending on Resonance Mode.'],
    ['Basic ATK', 'Breakdown Form Stage 1-4', '36.51% → 37.51%+14.07%×4 → 62.39% → 35.54%+82.92%', 'Stage 3/4 apply Fusion Burst or Tune Strain - Shifting depending on Resonance Mode.'],
    ['Heavy ATK', 'Stagecraft Form', '80.76%×2'],
    ['Heavy ATK', 'Breakdown Form', '137.06%'],
    ['Mid-air', 'Attack - Stagecraft Form', '29.59%+44.38%'],
    ['Mid-air', 'Attack - Breakdown Form Stage 1-4', '36.51% → 37.51%+14.07%×4 → 62.39% → 35.54%+82.92%'],
    ['Mid-air', 'Heavy Attack - Breakdown Form', '29.59%+44.38%'],
    ['Dodge Counter', 'Stagecraft Form', '49.35%×3'],
    ['Dodge Counter', 'Breakdown Form', '108.08%'],
    ['Skill', 'Phantom Bubble - Stagecraft Form', '17.42%×3+52.25%', 'Pulls in nearby targets.'],
    ['Skill', 'Beckon - Breakdown Form', '31.10%+14.52%×5', 'Pulls in nearby targets; shares a cooldown with Banish.'],
    ['Skill', 'Banish - Breakdown Form Stage 1', '34.68%×3', 'Replaces Beckon while holding a Dark Core.'],
    ['Liberation', 'Banish - Breakdown Form Stage 2', '112.01%', '+150% DMG Mult per Dark Core consumed (all held Dark Cores spent on cast); considered Resonance Liberation DMG despite the Skill input.'],
    ['Liberation', 'Erosion Field', '136.33% per tick (every 4s for 30s)', 'Off-field zone left by Final Act - Breakdown Form; pulls in and hits nearby targets, applying Fusion Burst/Tune Strain even after Denia swaps out. Considered Resonance Liberation DMG.'],
    ['Liberation', 'Final Act: Stagecraft Form', '397.62%', 'Grants Entropy Shift: Breakdown Form (+30% ATK, 12s), then switches to Breakdown Form.'],
    ['Liberation', 'Final Act: Breakdown Form', '198.81%×4', 'Consumes full Conformal Charge + Void Particle; grants Entropy Shift: Stagecraft Form (30s), leaves an Erosion Field, then switches back to Stagecraft Form.'],
    ['Intro', "It's Been A While!", '104.62%', 'Stagecraft-Form opener; grants 25 Void Particle and 1 Dark Core.'],
    ['Intro', 'Knock Knock', '51.74%×3', 'Breakdown-Form opener; grants Entropy Shift: Breakdown Form (12s) and 1 Dark Core.'],
    ['Outro', 'Unfinished Lies', '60% Fusion Burst DMG Amp for 30s (Fusion Burst mode) / 15% All DMG Amp for 16s, jumping to 40% once Tune Strain - Shifting is inflicted (Tune Strain mode)', 'Buffs Fusion Burst DMG near the active Resonator, or grants the incoming Resonator All DMG Amp.'],
  ],
  // Full audit 2026-09-01 against the wiki/Lucilla/Combat, cross-checked against
  // the source/character/1109 (both agree on every value exactly). Fixed a real zero-damage rotation
  // bug: CHARACTER_ROTATIONS.Lucilla's 'Tracing Forms Stage 1-3' and 'Letting It Go' steps had nothing to
  // match — the entire Reminiscence-state combo (her actual Liberation payoff, not a minor side-move) was
  // missing from this table. Added that plus the pre-existing gaps: Mid-air Attack, Dodge Counter (both
  // stances), Clip It: Hard Cut, and split Oblivion into its two mode-dependent rows (its own move text
  // makes it "considered Basic Attack DMG" in Glacio Chafe mode / "considered Echo Skill DMG" in Echo
  // mode, matching this file's established type-reclassification convention).
  'Lucilla': [
    ['Basic ATK', 'Snapshot Stage 1-3', '59.29% → 26.89%+40.34% → 235.27% (Commendable) / 159.55% (Unremarkable)', 'Standard combo; hold the 3rd hit for a stronger finisher.'],
    ['Mid-air', 'Attack', '86.29%'],
    ['Dodge Counter', 'Standard', '67.83%+82.90%'],
    ['Skill', 'Phantom Frame / Compensate / Spotlight', '13.26%×3 / 249.07% / 82.35%×2+274.48%+109.80%', 'Pulls enemies in; hold for a stronger follow-up.'],
    ['Liberation', 'Clear As Day', '142.74%, enters Reminiscence', 'Ultimate: enters her empowered stance.'],
    ['Basic ATK', 'Oblivion', '285.48%', 'Glacio Chafe mode; considered Basic Attack DMG. Auto-fires during Tracing Forms Stage 3, consuming Photos.'],
    ['Echo', 'Oblivion', '285.48%', 'Echo mode; considered Echo Skill DMG, each cast counted as a different Echo Skill. Auto-fires during Tracing Forms Stage 3, consuming Photos.'],
    ['Basic ATK', 'Tracing Forms Stage 1-3', '30.64%+45.95% → 59.77%+89.65% → 52.12%×8', 'Reminiscence-state Basic ATK replacement; considered Basic Attack DMG regardless of mode.'],
    ['Basic ATK', 'Letting It Go', '84.81%×3+593.64%', 'Interruption-immune finisher on releasing/finishing Tracing Forms Stage 3, ends Reminiscence; considered Basic Attack DMG in Glacio Chafe mode / Echo Skill DMG in Echo mode (same value either way).'],
    ['Basic ATK', 'Mid-air Attack - Reminiscence', '110.94%'],
    ['Basic ATK', 'Dodge Counter - Reminiscence', '115.55%+141.22%'],
    ['Intro', 'Clip It', '97.42%', 'Opener hit that applies Glacio Chafe.'],
    ['Intro', 'Clip It: Hard Cut', '149.41%', 'Replaces Clip It while in Reminiscence.'],
    ['Outro', 'Montage', '60% Glacio Chafe DMG Amp (Chafe mode) / 50% Echo Skill DMG Amp to next (Echo mode)', 'Buffs Glacio Chafe DMG or next ally Echo Skill DMG.'],
  ],
  // Re-audited verbatim 2026-09-02 against a fresh the source.gg Augusta page dump: every single one of
  // her 22 Lv.10 damage values below was off by a consistent ~1.988x ratio (i.e. roughly HALF the real
  // value) — the exact same "halving pattern" bug class already found and fixed for Camellya/Carlotta/
  // Roccia/Phoebe/Brant (see the comment on Brant's own row just below), just missed for Augusta until
  // now. Confirmed systematic, not rounding noise: computed the new/old ratio for all 22 values, every
  // one landed at 1.986-1.991. Retightened every value to the source's exact Lv.10 figures.
  // Phase A audit (2026-09-04): added the previously entirely-missing Mid-air Attack, Dodge Counter, and
  // Mid-air Dodge Counter rows plus the "at full Prowess/Ascendancy" Dodge Counter replacement variants
  // (Dodge Counter-Heavy Attack: Steelclash, Dodge Counter-Thunderoar: Backstep, Dodge Counter/Mid-air
  // Dodge Counter-Undying Sunlight: Strike) as reference data straight from the dump's own Basic
  // Attack/Forte multiplier lists — none of these fire in her real modeled CHARACTER_ROTATIONS (the
  // rotation's real combo path is Backstep→Spinslash, not Dodge Counter), so no new engine blocks wired
  // for them, matching the Lucy Dodge-Counter-row precedent above.
  'Augusta': [
    ['Basic ATK', "Hunter's Path", '57.46% → 67.00%×2 → 65.61%×3 → 64.63%×3', 'Standard combo string, builds toward her Majesty/Crown resources.'],
    ['Basic ATK', 'Mid-air Attack', '59.65%×2', 'Plunging Attack; confirmed unused in her real rotation.'],
    ['Basic ATK', 'Dodge Counter', '67.00%×2', 'Post-Dodge Normal Attack; confirmed unused in her real rotation.'],
    ['Basic ATK', 'Mid-air Dodge Counter', '59.65%×2', 'Post-mid-air-Dodge Plunging Attack; confirmed unused in her real rotation.'],
    ['Heavy ATK', 'Steelclash', '46.39%×3', 'Base charged combo.'],
    ['Heavy ATK', 'Dodge Counter - Steelclash', '46.39%×3', 'Replaces Dodge Counter at full Prowess; confirmed unused in her real rotation.'],
    ['Heavy ATK', 'Thunderoar', 'Backstep 53.68% / Spinslash 141.72%×3 / Uppercut 178.93%×2', 'Empowered Heavy ATK combo, unlocked at full Ascendancy.'],
    ['Heavy ATK', 'Dodge Counter - Thunderoar: Backstep', '53.68%', 'Replaces Dodge Counter and its Steelclash variant at full Ascendancy; confirmed unused in her real rotation.'],
    ['Skill', "Warrior's Blade", '218.70%×3', 'Multi-hit Skill strike with a brief time-stop on cast.'],
    ['Liberation', 'Sword of Eternal Oath', '32.99%×2 + 131.94%×3 + 32.99%×2 + 571.7%', 'Standard Ultimate combo nuke.'],
    ['Liberation', 'Sunborne', '119.29% ×9 slashes', 'Alt Ultimate opener when holding the input at 2 Majesty stacks.'],
    ['Liberation', 'Everbright Protector', '238.58% + 894.65% + 5.97%×10', 'Finisher following Sunborne, deploys Ruler\'s Realm.'],
    ['Forte', 'Undying Sunlight', 'Strike 139.17%×2 / Leap 222.67%+27.84%×2 / Plunge 86.59%+779.24%', 'Forte-empowered combo, Plunge consumes all Ascendancy for a big finisher.'],
    ['Forte', 'Dodge Counter - Undying Sunlight: Strike', '139.17%×2', 'Grounded/mid-air Dodge Counter variant at full Ascendancy, considered Resonance Skill DMG; confirmed unused in her real rotation.'],
    ['Intro', 'Stride of Goldenflare', '99.41%×2', 'Swap-in opener strike.'],
    ['Outro', 'Battlesong of the Unyielding', '+15% All DMG Amp (14s)', 'Grants the next Resonator +15% All-Attribute DMG Amp for 14s, which ends immediately if they are swapped out. Conditional payoff: Augusta gains +1 Majesty stack AND +1 Crown of Wills stack ONLY if that SAME Resonator casts their own Outro Skill back to Augusta while this buff is still up — swap to a third character first and the buff (and the stack chance) is forfeited. Verified verbatim the wiki/Augusta/Combat, 2026-08-31.'],
  ],
  'Aemeath': [
    ['Basic ATK', 'Aemeath Form Stage 1-4', '46.35% → 13.89%+20.84%+34.73% → 9.32%×3+18.63%+46.56% → 6.73%×5+100.94%', 'Standard human-form combo string, weaker but faster than Mech Form.'],
    ['Basic ATK', 'Mech Form Stage 1-4', '23.20%×3 → 18.57%+74.26% → 3.89%×6+81.54%+11.65% → 40.38%+94.21%', 'Heavier Mech-form combo with bigger hits, entered via her Forte.'],
    ['Charged ATK', 'Aemeath Charged I / II', '18.57%+74.26% / 11.60%×4+185.60%', 'Human-form charged strike, second stage hits much harder.'],
    ['Charged ATK', 'Mech Charged I / II', '92.83% / 232.00%', 'Mech-form charged strike, very high single hits.'],
    ['Skill', 'Sync Strikes', 'Armament Merge 26.92%+40.38%+67.29% / Call of Dawn 16.33%×3+114.28%', 'Skill triggers different follow-ups depending on which form she is in.'],
    ['Skill', 'Seraphic Duet', 'Overture 17.90%+14.92%×6+23.86%×3+59.65%×3 / Encore 17.90%×4+35.79%×3+178.93%', 'Longer Skill combo, Encore variant hits when chained after Overture.'],
    // Corrected 2026-09-02 (fresh the source dump cross-check): was Overdrive 200.80%+267.74%×3 / Finale
    // 1789.29% — every other row for Aemeath matched the fresh dump exactly (Basic/Charged/Sync
    // Strikes/Duet), but this row alone was consistently ~1.0754x too high across all 4 values
    // (200.80/186.72 = 267.74/248.96 = 1789.29/1663.83, all within 0.00003 of each other — a real,
    // systematic discrepancy, not rounding noise). Retightened to the fresh dump's exact figures.
    ['Liberation', 'Heavenfall Edict', 'Overdrive 186.72%+248.96%×3 / Finale 1663.83%', 'Ultimate; Finale is a massive burst that scales with team buffs.'],
    ['Intro', 'Songs Across the Universe', '13.46%×2 + 107.66%', 'Intro Skill used when swapping in from human form.'],
    ['Intro', 'Debut of Meteoric Radiance', '65.30% + 97.95%', 'Intro Skill used when swapping in from Mech Form.'],
    ['Outro', 'Silent Protection', '10-20% All-DMG Amp to team (20s), mode-dependent', 'Swap-out buff to the whole team; strength depends on which form she left in.'],
  ],
  // Corrected 2026-08-17 against the source's character #1206 sheet (Lv.10 skill attributes): every
  // damage row was roughly half its real value (e.g. Forte burst Returned from Ashes — his single
  // biggest hit — was listed as '...665%' vs the real '...1322.09%'), the same halving pattern already
  // found and fixed across Camellya/Carlotta/Roccia/Phoebe's rows. Also fixed 3 skill names that didn't
  // match his actual kit at all: 'Bravo!' (Liberation) → 'To the Horizon', 'Here I Am!' (Intro) →
  // 'Applaud for Me!', 'Standing Ovation' (Outro) → 'The Course is Set!' — the fabricated names would
  // have broken the skill-icon/rotation substring lookups against his real skill list.
  // Re-audited verbatim 2026-08-31 against the wiki/Brant/Combat's Lv.10
  // Attribute Scaling tables (Chrome/Windows UA + google.com referer + jsRender, load+9s wait):
  // - Basic ATK Stage 3 was '233%' — that value doesn't correspond to anything in the source; the
  //   actual Lv.10 Stage 3 DMG is 22.06%*3+33.08%*2 = 132.34%, a ~100pp overstate (same class of
  //   magnitude bug as the earlier Returned from Ashes halving fix, just in the other direction).
  //   Stage 1/2/4 were already correct within rounding, tightened to source's exact decimals.
  // - Mid-air "Charged Combo" 5-value chain (Stage1 → Stage1 Charged Attack → Flip → Stage 3 → Stage 4)
  //   was off by ~1pp per entry (stale pull); retightened to exact Lv.10 values. NOTE: the wiki's own
  //   Mid-air description says the Charged Attack triggers off Stage 1 OR Stage 2's grapple swing, and
  //   Stage 2 has its own separate (lower) Charged Attack multiplier (32.87%*6=197.22%) not used here —
  //   which grapple-swing stage is actually chained in a real rotation is a player-input branch this
  //   flat schema can't express — TODO: needs Phase 2 schema (input-dependent combo branch) to model
  //   the Stage-2-charged alternative path.
  // - Heavy ATK, Skill, Liberation, Forte (Returned from Ashes — confirms the prior 665%→1322.09% fix
  //   still holds), Intro all matched source exactly within rounding, no change.
  // - Outro text amended to include its exact swap-forfeit condition (already in CHARACTER_ROTATIONS).
  'Brant': [
    ['Basic ATK', 'Stage 1-4', '50.5% → 101.4% → 132.3% → 140.1%'],
    ['Mid-air', 'Charged Combo', '122.9% → 332.5% → 93.0% → 169.0% → 253.9%'],
    // Added 2026-09-02, sourced from a real browser snapshot's own Basic Attack Multipliers
    // table — previously missing entirely. Confirmed unused in his real CHARACTER_ROTATIONS (which
    // goes straight from Intro/Liberation into Mid-air combat, never a grounded Heavy Attack/Plunging
    // Attack/Dodge Counter), so no engine block wired — reference data only.
    ['Heavy ATK', 'Standard', '197.55%', 'Confirmed unused in his real rotation (goes straight to Mid-air combat).'],
    ['Heavy ATK', 'Plunging Attack', '104.78%', 'Considered Basic Attack DMG per its own kit text. Only used optionally, immediately Ultimate-cancelled — no separate DPS contribution in the modeled rotation.'],
    ['Dodge Counter', 'Standard', '38.03%×3 + 57.04%×2', 'Confirmed unused in his real rotation.'],
    ['Heavy ATK', 'Rhapsodic Riff', '169.0%'],
    ['Skill', 'Anchors Aweigh', '200.4% + 133.6%'],
    ['Liberation', 'To the Horizon', '85.1%×4 + 340.2%'],
    ['Forte', 'Returned from Ashes', '47.2%×2 + 94.4% + 188.9%×2 + 1322.1%'],
    ['Intro', 'Applaud for Me!', '202.8% + 50.7%'],
    ['Outro', 'The Course is Set!', '+20% Fusion DMG + 25% Skill DMG Amp (14s, or until the buffed Resonator is swapped out)'],
  ],
  // Re-verified 2026-08-31 against the wiki/Calcharo/Combat's Lv.10 Attribute Scaling
  // tables (Chrome/Windows UA + google.com referer + jsRender, load+9s wait; 2nd attempt cleared Cloudflare),
  // cross-checked against the source/wuthering-waves/characters/calcharo's Skills/Gameplay tabs. This
  // character's Combat page uses an older wiki template ({{Forte Table|Calcharo}}, category "ATK Scaling
  // Skill Characters") whose "Details" section only renders full Attribute Scaling tables for Resonance Skill
  // Extermination Order and Resonance Liberation Phantom Etching (which bundles Deathblade Gear's Basic
  // ATK/Heavy ATK/Dodge Counter/"Necessary Means" sub-tables) — it does NOT expose separate tables for the
  // normal-state Basic ATK, Heavy ATK, Mid-air, Dodge Counter, Forte "Mercy"/"Death Messenger", or Intro
  // Skill, and the source's Skills tab gives mechanic text for those but not raw per-hit %. Rows below marked
  // "TODO: verify" could NOT be confirmed against either source this pass and are carried over unchanged from
  // the prior data rather than being touched without a citation. Rows confirmed EXACT matches against the
  // wiki's Lv.10 columns: Skill (Extermination Order Part 1/2/3), Liberation (Hounds Roar Stages 1-5), Outro
  // (Shadowy Raid, matches the source's kit text "195.98%+391.96% of Calcharo's ATK" too) — all correct, unchanged.
  // Two real corrections found and fixed:
  // (1) NEW row added: Intro "Necessary Means" (198.81%×2 at Lv.10, matches wiki's "Necessary Means Damage"
  //   row exactly) — a real, previously entirely undocumented Intro-Skill-DMG source (see desc rewrite above).
  // (2) NEW row added: Heavy ATK / Dodge Counter "In Deathblade Gear" variants (62.03%×5 / 56.99%×6 at Lv.10,
  //   both from the wiki's Phantom Etching sub-table, explicitly stated "considered as Resonance Liberation
  //   DMG") — previously entirely uncaptured; the old single "Standard" rows for Heavy ATK/Dodge Counter are
  //   the NORMAL-state values only and remain filed under their own categories, unchanged.
  'Calcharo': [
    ['Basic ATK', 'Gnawing Fangs Stage 1-4', '45.73%×2 → 99.41% → 85.18%+42.59%×3 → 79.51%×2+106.01%', 'TODO: verify — not present in either source this pass (see table-level comment above); the source confirms the 4-stage count only.'],
    ['Heavy ATK', 'Standard', '41.36%×5', 'TODO: verify — normal-state Heavy ATK, not present in either source this pass. Do not confuse with the Deathblade Gear row below.'],
    ['Heavy ATK', 'Standard (Deathblade Gear)', '62.03%×5', 'Confirmed 2026-08-31 against the wiki Lv.10 "Heavy Attack DMG" row under Phantom Etching. While in Deathblade Gear (11s after Phantom Etching), Heavy Attack deals this boosted value instead of the normal-state row above, and is counted as Resonance Liberation DMG, not Heavy ATK DMG.'],
    ['Mid-air', 'Plunging Attack', '123.27%', 'TODO: verify — not present in either source this pass.'],
    ['Dodge Counter', 'Standard', '66.48%×3+85.47%', 'TODO: verify — normal-state Dodge Counter, not present in either source this pass. Do not confuse with the Deathblade Gear row below.'],
    ['Dodge Counter', 'Standard (Deathblade Gear)', '56.99%×6', 'Confirmed 2026-08-31 against the wiki Lv.10 "Dodge Counter DMG" row under Phantom Etching. While in Deathblade Gear, Dodge Counter deals this boosted value instead of the normal-state row above, and is counted as Resonance Liberation DMG, not Dodge Counter DMG.'],
    ['Skill', 'Extermination Order Stage 1-3', '51.57%×2+68.76% → 77.36%×2+103.14% → 214.87%×2', 'Confirmed exact match 2026-08-31 against the wiki Lv.10 Part 1/2/3 Damage rows. 10s cooldown; does not interrupt the Basic ATK cycle. Each Skill hit grants 1 Cruelty (cap 3) — frozen while in Deathblade Gear.'],
    ['Forte', 'Heavy ATK: "Mercy"', '39.11%×8+78.22%', 'TODO: verify — not present in either source this pass. At 3 Cruelty, Heavy ATK becomes "Mercy" — consumes all 3 Cruelty, restores Resonance/Concerto Energy, counted as Heavy ATK DMG.'],
    ['Forte', 'Heavy ATK: "Death Messenger"', '97.77%×8+195.53%', 'TODO: verify — not present in either source this pass. In Deathblade Gear, at 5 Killing Intent, Basic ATK becomes "Death Messenger" — consumes all 5 Killing Intent, restores Resonance/Concerto Energy, counted as Resonance Liberation DMG.'],
    ['Liberation', 'Phantom Etching → Hounds Roar', '596.43% → 88.07%→35.23%×2+52.84%×2→163.84%→34.82%×6→150.19%×2', 'Confirmed exact match 2026-08-31 against the wiki Lv.10 Skill Damage / Hounds Roar Stage 1-5 rows. Enters Deathblade Gear (11s, 125 Resonance Energy cost, 20 Concerto Energy regen): Basic ATK replaced by Hounds Roar (each hit grants 1 Killing Intent, cap 5), Heavy ATK/Dodge Counter deal Liberation DMG (see the Deathblade Gear rows above).'],
    ['Intro', 'Wanted Outlaw', '39.77%×2+59.65%×2', 'TODO: verify — not present in either source this pass. Official skill name confirmed "Wanted Outlaw" per the wiki\'s own footnote (in-game Resonance Chain text mislabels it "Wanted Criminal").'],
    ['Intro', '"Necessary Means"', '198.81%×2', 'NEW row added 2026-08-31, confirmed exact match against the wiki Lv.10 "\'Necessary Means\' Damage" row (also matches the source\'s kit text). Previously entirely undocumented: once Deathblade Gear ends, Calcharo\'s next Intro Skill cast is silently replaced by this move instead of "Wanted Outlaw", counted as Intro Skill DMG. TODO: needs Phase 2 schema to model the cross-rotation "which Intro fires next" state — CHARACTER_ROTATIONS below always uses the "Wanted Outlaw" opener as the baseline case.'],
    ['Outro', 'Shadowy Raid', '195.98%+391.96%', 'Confirmed exact match 2026-08-31 against the wiki Lv.10 Outro Skill row and the source\'s kit text ("195.98%+391.96% of Calcharo\'s ATK").'],
  ],
  // Corrected 2026-08-17 against the source's character #1603 sheet (Lv.10 skill attributes): every
  // row except Outro was roughly half its real value (e.g. Ephemeral was '635%' vs the real 1262.45%,
  // Fervor Efflorescent '605%' vs the real 1202.81%) — a consistent ~2x understatement suggesting a
  // stale/mis-scaled data source. Outro (329.2% + 459%) was already correct and is unchanged.
  // Missing-row gap closed 2026-09-03 against a fresh the source dump: 5 rows present in the source were
  // absent here — Mid-air Attack, Dodge Counter, Floral Ravage, Vining Ronde, Atonement. Floral Ravage
  // is the most consequential: CHARACTER_ROTATIONS['Camellya'] already casts 'Skill:Floral Ravage' as
  // its Blossom-Mode-ending step, so its absence here was silently resolving that rotation step to 0
  // DMG (the same zero-damage-rotation-step bug class found on ~10 other characters this project).
  'Camellya': [
    ['Basic ATK', 'Thorns 1-5', '62.53% → 46.48%×2 → 50.70%×3 → 24.70%×20 → 48.17%×4'],
    ['Heavy ATK', 'Standard', '88.14%×3'],
    ['Mid-air', 'Plunging Attack', '65.61%×2'],
    ['Dodge Counter', 'Standard', '99.40%×3'],
    ['Skill', 'Crimson Blossom', '113.62%×2'],
    ['Skill', 'Vining Waltz 1-4', '96.33% → 45.63%×2 → 21.95%×6 → 67.59%×3'],
    ['Skill', 'Blazing Waltz', '21.95%×19'],
    ['Skill', 'Floral Ravage', '52.61%×5', 'Blossom Mode\'s Resonance Skill replacement; considered Basic Attack DMG per its own kit text. Ends Blossom Mode on cast.'],
    ['Basic ATK', 'Vining Ronde', '52.95%×3', 'Blossom Mode\'s Jump replacement (Jump: Vining Ronde in the White Hair rotation); considered Basic Attack DMG. Ends Blossom Mode on cast.'],
    ['Basic ATK', 'Atonement', '113.33%×2', 'Blossom Mode\'s Dodge Counter replacement (Dodge Counter Atonement); considered Basic Attack DMG.'],
    ['Forte', 'Ephemeral (Budding)', '1262.45%'],
    ['Liberation', 'Fervor Efflorescent', '1202.81%'],
    ['Intro', 'Everblooming', '198.81%'],
    ['Outro', 'Twining', '329.24% + 459.02%'],
  ],
  // Corrected 2026-08-17 against the source's character #1607 sheet (Lv.10 skill attributes): every
  // damage row was roughly half its real value (e.g. Perception Drain — her core Forte burst nuke —
  // was listed as '336%×2' vs the real 667.99%×2), the same halving pattern already found and fixed
  // across Camellya/Carlotta/Roccia/Phoebe/Brant's rows. Also fixed the Outro's name: 'Sweet Nightmare'
  // doesn't match her kit at all — her real Outro is 'Gentle Tentacles' (confirmed on both the source and
  // the source); the fabricated name would have broken skill-icon/rotation substring lookups. The Outro's
  // buff description (+20% Havoc DMG + 25% Skill DMG Amp) was already correct and is unchanged.
  // Re-verified verbatim 2026-08-31 against the wiki/Cantarella/Combat's "Attribute
  // Scaling" tables (Lv.10 column, rightmost) — the 2026-08-17 pass fixed the halving bug but the multi-hit
  // Basic ATK Stage 2/3 and Forte Phantom Sting Stage 1-3 rows had been collapsed into a single summed total
  // per stage instead of the real per-hit breakdown (same class of error the 10-character reference pass
  // flagged), and the Heavy ATK row was pointed at "Standard" Heavy Attack (57.18%×2) while the actual
  // rotation step uses the Trance-consuming enhanced Heavy ATK "Delusive Dive" (53.05%×2) — a distinct move
  // with no multiplier row to match against at all, meaning that rotation step previously had ZERO damage
  // multiplier resolving for it. Added a 'Skill'/'Jolt' row too: Jolt is a real Havoc DMG instance (198.81%,
  // counted as Basic ATK DMG) auto-triggered when a Hazy Dream'd target takes damage, previously undocumented.
  // 4 rows added 2026-09-03 against a fresh the source dump (Mid-air, Dodge Counter, Abysmal Vortex,
  // Shadowy Sweep) — real kit moves present in the source but missing entirely; none of the 4 are used
  // in CHARACTER_ROTATIONS, so this is a Kit-tab completeness fix, not a zero-damage rotation bug.
  'Cantarella': [
    ['Basic ATK', 'Stage 1-3', '79.53% → 36.44%×4 → 72.57%×2'], // was '79.5% → 145.8% → 145.1%' (summed, not per-hit)
    ['Heavy ATK', 'Standard', '57.18%×2'], // was '57.2%×2' — kept for reference, NOT the move the rotation actually uses
    ['Heavy ATK', 'Delusive Dive', '53.05%×2'], // NEW — the Trance-consuming enhanced Heavy ATK that enters Mirage; the rotation step referenced this name but no row existed to match it
    ['Mid-air', 'Plunging Attack', '41.99%+62.99%'],
    ['Dodge Counter', 'Standard', '53.01%×4'],
    ['Skill', 'Graceful Step', '73.60%×2'], // was '73.6%×2', rounding only
    ['Skill', 'Flickering Reverie', '196.23%'], // was '196.2%', rounding only
    ['Skill', 'Jolt', '198.81%'], // NEW — auto-trigger off Hazy Dream on-hit, considered Basic ATK DMG
    ['Forte', 'Phantom Sting 1-3', '35.33%×3 → 62.93%×2 → 64.62%×4'], // was '106.0% → 125.9% → 258.5%' (summed, not per-hit)
    ['Forte', 'Abysmal Vortex', '41.99%+62.99%', 'Mirage-state Mid-air Attack replacement.'],
    ['Forte', 'Shadowy Sweep', '75.09%×3', 'Mirage-state Dodge Counter replacement; Basic Attack right after casts Phantom Sting Stage 2.'],
    ['Forte', 'Perception Drain', '667.99%×2'], // was '668.0%×2', rounding only
    ['Liberation', 'Flowing Suffocation', '376.00% + 14.54%×21'], // was '376.0% + 14.5%×21', rounding only
    ['Intro', 'Ripple', '42.25%×4'], // was '42.3%×4', rounding only
    ['Intro', 'Tidal Surge', '16.90%×3+118.30%'], // NEW 2026-09-04 (Phase A audit) — the Mirage-state Intro replacement, same 3-Coordinated-ATK+direct-hit shape; per this source's own Review "essentially never realistically used" (no benefit over the normal Ripple cast) so not used in CHARACTER_ROTATIONS, same Kit-tab-completeness treatment already given to Mid-air/Dodge Counter/Abysmal Vortex/Shadowy Sweep above.
    ['Outro', 'Gentle Tentacles', '+20% Havoc DMG + 25% Resonance Skill DMG Amp (14s, ends early on swap)'],
  ],
  // Corrected 2026-08-17 against the source's character #1107 sheet (Lv.10 skill attributes): every
  // row except Outro was roughly half its real value (e.g. Era of New Wave — her core Liberation nuke —
  // was listed as '202.6%' vs the real 402.71%), the same halving pattern found and fixed in Camellya's
  // row. Outro (794.2%) was already correct and is unchanged.
  // Re-verified verbatim 2026-08-31 against the wiki/Carlotta/Combat's "Attribute
  // Scaling" tables (Lv.10 column, rightmost): the 2026-08-17 pass fixed the halving bug but every row
  // still carried a small rounding/transcription drift from the exact per-hit figures — corrected below,
  // each old value shown in the per-row comment. Outro Closing Remark (794.2%) matched exactly, unchanged.
  'Carlotta': [
    ['Basic ATK', 'Stage 1-2', '54.08% → 39.55%+39.55%+52.73%'], // was '54.1% → 132.6%' (stage 2 sum is 131.83, not 132.6)
    ['Basic ATK', 'Necessary Measures 1-3', '65.91% → 60.08%+73.43% → 139.93%+23.33%×4'], // was '66.4% → 134.4% → 234.6%'
    ['Heavy ATK', 'Standard', '22.82%×4 + 60.84%'], // was '153.0%' (real total 152.12%)
    ['Heavy ATK', 'Containment Tactics', '34.23%×4 + 91.26%'], // was '229.6%' (real total 228.18%)
    // Added 2026-09-02, sourced from the pasted the source text's own Skills tab — was previously
    // entirely missing (not a rounding fix, a real gap). None of these 3 rows are wired into a
    // CHARACTER_ROTATIONS step (her burst rotation uses Mid-air Atk purely to reposition, per the
    // kit text's own "no damage focus" framing), so this only fills the data table, no engine block
    // added for them.
    ['Mid-air', 'Attack', '104.78%'],
    ['Mid-air', 'Customary Greetings', '107.99% + 131.99%'],
    ['Dodge Counter', 'Riposte', '103.77% + 137.55%'],
    ['Forte', 'Imminent Oblivion', '66.83%×5 + 501.21%'], // was '67.2%×5 + 504.2%' (real total 835.36%, not 840.2%)
    ['Skill', 'Art of Violence', '144.11%×2'], // was '145.0%×2' (real total 288.22%, not 290%)
    ['Skill', 'Chromatic Splendor', '112.73%×2 + 338.18%'], // was '113.4%×2 + 340.2%' (real total 563.64%, not 567%)
    ['Liberation', 'Era of New Wave', '402.71%'], // was '405.2%'
    ['Liberation', 'Death Knell', '(183.64% + 14.50%×4) per shot'], // was '(184.6% + 14.6%×4) per shot'
    ['Liberation', 'Fatal Finale', '644.33%'], // was '648.2%'
    ['Intro', 'Wintertime Aria', '178.93% + 59.65%×2'], // was '180% + 60%×2'
    ['Outro', 'Closing Remark', '794.2%'],
  ],
  // Corrected 2026-08-17 against the source's character #1409 sheet (Lv.10 skill attributes): most
  // rows were roughly half their true value (e.g. her Fleurdelys-form Ultimate Blade of Howling Squall
  // was listed as '6.6%×7 HP' vs the real 13.12%×7 HP), the same halving pattern already found and
  // fixed across most of the recently-audited roster — but not uniformly here: her 'Sword to Call for
  // Freedom' Intro row was already exactly correct (4.28% + 9.97%HP), showing this wasn't a single
  // clean 2x scaling error but a row-by-row data entry issue. Every value below is now sourced directly
  // from the source's precise Lv.10 multipliers rather than doubled from the old figures.
  // All Lv10 multipliers re-verified verbatim 2026-08-31 against the wiki/Cartethyia/Combat's
  // "Attribute Scaling" tables (Basic Attack - Cartethyia, Sword to Bear Their Names, Blade of Howling Squall,
  // Sword to Mark Tide's Trace / Sword to Call for Freedom, Sword to Answer Waves' Call / May Tempest Break the
  // Tides sections) — every value already matched exactly (sums of per-hit % + flat %HP components check out to
  // the digit), no corrections needed here, unlike the RESONANCE_CHAIN_DATA row above where s2/s5 were wrong.
  'Cartethyia': [
    ['Basic ATK', 'Base Form 1-4', '4.78%HP → 13.13%HP → 17.12%HP → 15.1%HP', 'Standard combo in her base sword form, scales off Max HP.'],
    ['Basic ATK', 'Fleurdelys 1-5', '6.49%HP → 9.09%HP → 10.65%HP → 13.7%HP → 36%HP', 'Empowered combo used in Fleurdelys form.'],
    ['Heavy ATK', 'Fleurdelys Enhanced', '7.78%×2 + 3.89%HP', 'Charged strike in Fleurdelys form.'],
    ['Skill', 'Base Form', '6.89%×3 + 8.86%HP', 'Skill strike that applies 2 stacks of Aero Erosion and summons Sword of Virtue\'s Shadow (max 1, 20s).'],
    ['Skill', 'Fleurdelys 1-2', '24.8%HP / 24.8%HP', "Fleurdelys-form Skill variants (Sword to Answer Waves' Call / May Tempest Break the Tides) — see CHARACTER_ROTATIONS for the cast-order window between them."],
    ['Mid-air', 'Cartethyia Plunging Attack (3 Shadows Recalled)', '11.29%×3', 'Real modeled-rotation value — fixed 2026-09-02 against a fresh the source dump (previously had no row at all, a silent zero-DMG gap). By the point this step fires in her real rotation, all 3 Sword Shadow types (Discord/Divinity/Virtue) are already up, so the 3-Shadows-Recalled variant is the one that actually applies; the 0/1/2-Shadow variants (5.65% / 5.65% / 3.30%×3) are real too but not used by the modeled rotation.'],
    // Added 2026-09-04 (Phase A audit): Mid-air Attack Stage 3 (Fleurdelys form) had NO row at all,
    // despite being a real, always-cast step in the dump's own "Full rotation" listing ("Mid-air Attack
    // Stage 3 (Fleurdelys, hold Basic during Skill)", immediately after Skill 1) — a silent zero-DMG gap.
    ['Mid-air', 'Fleurdelys Stage 3', '2.20%', 'Holding Normal Attack airborne casts this directly (skipping Stages 1-2); Aero DMG, restores Conviction. Real modeled-rotation step, fires right after Sword to Answer Waves\' Call.'],
    ['Liberation', "A Knight's Heartfelt Prayers", 'Costs 50% Max HP (25% at Resonance Chain S5; free below 50% HP)', 'Ultimate that transforms her into Fleurdelys form for 12s and clears all Conviction; no direct damage.'],
    ['Liberation', 'Blade of Howling Squall', '13.12%×7 HP', 'Fleurdelys-form Ultimate finisher, cast at 120 Conviction; restores 50% Max HP, removes ALL Aero Erosion stacks from the target (each stack removed Amplifies DMG taken by 20%, up to 5 stacks = +100%), and ends Manifest.'],
    ['Intro', "Sword to Mark Tide's Trace", '2.08%×3 + 6.24%HP', "Base-form swap-in opener; inflicts 2 Aero Erosion stacks and summons Sword of Discord's Shadow (max 1, 20s)."],
    ['Intro', "Sword to Call for Freedom", '4.28% + 9.97%HP', 'Fleurdelys-form swap-in opener.'],
    ['Outro', "Wind's Divine Blessing", '+17.5% Aero DMG vs Negative Status (20s)', 'Swap-out buff to the active teammate against targets with a Negative Status.'],
  ],
  // All Lv10 multipliers below re-verified verbatim 2026-08-31 against the wiki/
  // Changli/Combat's "Attribute Scaling" tables (Basic Attack, Tripartite Flames, Radiance of Fealty,
  // Flaming Sacrifice, Obedience of Rules sections) — every value already matched exactly, no corrections
  // needed here (unlike the RESONANCE_CHAIN_DATA row below, where every node was wrong).
  'Changli': [
    ['Basic ATK', 'Blazing Enlightenment Stage 1-4', '29.49%×2 → 35.49%×2 → 36.45%×3 → 50.70%+29.58%×4', 'Releasing Stage 4 enters True Sight (12s).'],
    ['Mid-air', 'Stage 1-4', '61.35% → 50.87%×2 → 44.00%×3 → 38.03%+22.18%×4', 'Also enters True Sight on release of Stage 4.'],
    ['Heavy ATK', 'Standard / Mid-air Heavy', '28.99%×3+37.27% → 123.27%'],
    ['Dodge Counter', 'Standard', '82.64%×3'],
    ['Skill', 'True Sight: Capture / Conquest / Charge', '81.88%×3+163.76% → 58.95%×2+82.52%+94.31% → 72.68%+109.02%', 'Capture (2 charges, 12s recharge) enters True Sight; Conquest/Charge are the True Sight follow-ups — each window is consumed by only one of the two.'],
    ['Forte', 'Heavy ATK: Flaming Sacrifice', '39.25%×5+457.85%', 'At 4 Enflamement stacks, Heavy ATK casts this instead — 40% DMG reduction while casting.'],
    ['Liberation', 'Radiance of Fealty', '1212.75%', '20s cooldown, 125 Resonance Energy; grants 4 Enflamement and Fiery Feather (next Flaming Sacrifice within 10s: self ATK +25%).'],
    ['Intro', 'Obedience of Rules', '44.50%+25.96%×4', 'Also enters True Sight.'],
    ['Outro', 'Strategy of Duality', 'Fusion DMG Amp +20% + Liberation DMG Amp +25% (10s)', 'Grants the incoming Resonator these buffs — no direct DMG; buff ends early if that Resonator is swapped out before 10s.'],
  ],
  // Rending Lunge row added — Phase A audit (REMAINING_WORK.md 1c): the fresh dump's own Basic ATK
  // multiplier table lists it ('15.11%×4+90.66%'), it's a real always-cast step in both the dump's
  // Opener and Loop rotations ("Basic: Rending Lunge"), and CHARACTER_ROTATIONS['Chisa']'s own combined
  // step label already names it ('Basic ATK:Stage 2, Rending Lunge, Death Snip') — but no
  // SKILL_MULTIPLIERS row and no engine-block hits existed for it at all (bug class f), silently
  // dropping a real, sourced ~151% multiplier hit from every rotation pass.
  'Chisa': [
    ['Basic ATK', 'Stage 1-2', '16.71%×2 → 9.55%+19.09%+66.81%', 'Standard combo string ending in a heavier chainsaw finisher.'],
    ['Basic ATK', 'Rending Lunge', '15.11%×4+90.66%', 'Follow-up combo hit after Basic ATK Stage 2, chains into Death Snip.'],
    ['Basic ATK', 'Death Snip', '29.81% + 14.91% + 104.34%', 'Alternate finisher available at a certain combo point; counted as Resonance Liberation DMG.'],
    ['Skill', 'Eye of Unraveling', '35.79%', 'Quick dash strike that marks the target for Negative Status.'],
    ['Skill', 'Serrated Loop', '17.45%×8 (hold: 7.46%×16)', 'Multi-hit spin attack; holding the input adds even more hits.'],
    ['Forte', 'Sawring - Blitz 1-3', '11.49%×6 → 10.64%×8 → 15.98%×8', '3-stage Forte combo that builds up Ring of Chainsaw stacks.'],
    ['Forte', 'Sawring - Eradication', '51.54% + 206.13% (+2.59% per Ring of Chainsaw, up to 100)', 'Forte finisher whose damage scales with stacked Rings of Chainsaw.'],
    ['Liberation', 'Moment of Nihility', '954.29% (+ heal 117.60% ATK)', 'Ultimate nuke that also heals her for a portion of the damage dealt.'],
    ['Intro', 'Reverberance - Return', '95.43%', 'Swap-in opener strike.'],
    ['Outro', 'Unraveling - Law Zero', '+3 max Negative Status stacks (15s)', 'Swap-out buff letting the next Resonator stack more Negative Status on enemies.'],
  ],
  // Corrected 2026-08-17 against the source's character #1407 sheet (Lv.10 skill attributes): every
  // damage row was roughly half its real value (e.g. her Liberation nuke Singer's Triple Cadenza was
  // listed as '553.5%' vs the real 1100.42%), the same halving pattern already found and fixed across
  // Camellya/Carlotta/Roccia/Phoebe/Brant/Cantarella/Zani's rows. Outro (a DMG Amp buff description,
  // unaffected by this bug) is unchanged.
  // Full audit 2026-09-01 against the wiki/Ciaccona/Combat, cross-checked against
  // the source/character/1407 (both agree on every value exactly). Two bug classes fixed:
  // (1) multi-hit stages collapsed bug — Basic ATK Stage 1-4 was stored as one summed-total string
  // ('57.1% → 163.0% → 132.1% → 244.6%') instead of the real per-hit breakdown; split into 4 separate
  // rows with exact per-hit values. (2) zero-damage rotation bug — CHARACTER_ROTATIONS.Ciaccona's steps
  // reference 'Stage 3-4' and 'Stage 4', neither of which is a substring of the old lumped 'Stage 1-4'
  // row name, so those steps silently resolved to 0 DMG; the per-stage split below fixes the lookup.
  // Also added 5 entirely missing rows (Heavy ATK, Aimed Shot, Fully Charged Aimed Shot, Mid-air Attack,
  // Dodge Counter) that had no SKILL_MULTIPLIERS entry at all.
  'Ciaccona': [
    ['Basic ATK', 'Stage 1', '57.06%'],
    ['Basic ATK', 'Stage 2', '48.91%+24.46%×2+65.21%'],
    ['Basic ATK', 'Stage 3', '33.02%×4'],
    ['Basic ATK', 'Stage 4', '61.14%×4', 'Inflicts Aero Erosion, grants 1 Musical Essence, and starts Solo Concert (24% Aero DMG Bonus to nearby team).'],
    ['Heavy ATK', 'Standard', '107.60%', 'Jump into mid-air and attack.'],
    ['Heavy ATK', 'Aimed Shot', '32.61%', 'Aiming Mode tap-fire; considered Heavy ATK DMG.'],
    ['Heavy ATK', 'Fully Charged Aimed Shot', '73.37%', 'Aiming Mode fully-charged shot; considered Heavy ATK DMG.'],
    ['Mid-air', 'Attack Stage 1-2', '55.43%×2 → 24.46%×4'],
    ['Dodge Counter', 'Standard', '57.17%×4'],
    ['Skill', 'Harmonic Allegro', '40.39%×4', 'Multi-hit Skill strike that inflicts Aero Erosion.'],
    ['Forte', 'Quadruple Downbeat', '31.41%×10+314.03%', 'Forte finisher that consumes 3 stacked Musical Essence; pulls in nearby targets.'],
    ['Liberation', "Singer's Triple Cadenza", '1100.42%', 'Ultimate nuke that enters Recital.'],
    ['Liberation', 'Symphonic Poem: Tonic', '6.12%×20 (over field duration)', 'Periodic pulse during Recital, triggered by successful green/yellow interaction prompts (also fires off-field).'],
    ['Intro', 'Roaming with the Wind', '189.11%', 'Swap-in opener that inflicts Aero Erosion and lets her combo straight into Basic ATK Stage 3.'],
    ['Outro', 'Windcalling Tune', '+100% Aero Erosion DMG Amp (30s)', 'Swap-out buff amplifying Aero Erosion damage near the active Resonator.'],
  ],
  // Re-verified 2026-08-31 against wuthering.gg/characters/encore's Lv.1 skill-detail widget (Lv.1→Lv.10 growth
  // factor confirmed uniform at ×1.9881 across every existing row — e.g. Basic ATK Stage 1 28.00%→55.66%,
  // Skill 38.53%→76.61%, Forte Cloudy Frenzy 168.00%→334.00% — so all pre-existing Lv.10 numbers below check out
  // and are unchanged), cross-checked against the wiki/Encore/Combat's Forte text.
  // CRITICAL bug fixed: the four Cosmos Rave enhanced-state multipliers (Cosmos: Heavy Attack, Cosmos:
  // Frolicking, Cosmos: Rampage, and a completely missing Cosmos: Dodge Counter) were previously crammed into
  // one combined string under a single 'Liberation'/'Cosmos Rave' row. CHARACTER_ROTATIONS' steps for these
  // moves use `type: 'Basic ATK'/'Heavy ATK'/'Skill'` (matching how the game itself classifies the enhanced
  // hits) with skill names like 'Cosmos: Frolicking 1-4' — under the calc engine's
  // `type === step.type && rowName.includes(step.skill)` lookup, none of those ever matched this row (wrong
  // type, and the skill substring was buried mid-string in the wrong row entirely), so every enhanced-state
  // rotation step silently resolved to ZERO damage. Split into their own correctly-typed rows below, plus added
  // the previously-undocumented Cosmos: Dodge Counter row (source lists it as 33.19%×4 at Lv.1, identical to
  // Frolicking Stage 3's Lv.1 value, so its Lv.10 value is likewise identical at 65.99%×4).
  'Encore': [
    ['Basic ATK', 'Wooly Attack Stage 1-4 → Wooly Strike', '55.66% → 66.20% → 66.30%×2 → 38.27%×4 → 238.57%', 'Stage 4 into a timed-press Wooly Strike finisher.'],
    ['Heavy ATK', 'Standard', '187.08%'],
    ['Mid-air', 'Plunging Attack', '123.26%'],
    ['Dodge Counter', 'Standard', '125.94%×2'],
    ['Skill', 'Flaming Woolies → Energetic Welcome', '76.61%×8 → 339.16%', '10s cooldown; Skill again immediately after Flaming Woolies ends casts Energetic Welcome — otherwise the chain window is lost.'],
    ['Forte', 'Heavy ATK: Cloudy Frenzy', '334.00%', 'At full Mayhem (100/100), Heavy ATK enters a 70% DMG-reduction state (survives swap-out), then casts Cloudy Frenzy (counted as Resonance Liberation DMG) on exit.'],
    ['Forte', 'Heavy ATK: Cosmos Rupture', '46.42%×6+495.21%', "Cosmos Rave's version of Cloudy Frenzy — same full-Mayhem/Heavy ATK trigger and 70% DMG-reduction channel, but during Cosmos Rave; also counted as Resonance Liberation DMG."],
    ['Liberation', 'Cosmos Rave', 'No direct DMG', 'Press Liberation (125 Energy, 16s cooldown) — no direct hit on cast. Replaces Basic ATK/Heavy ATK/Skill/Dodge Counter with the enhanced "Cosmos" rows below for a fixed 10s; any hit landed during the window still restores Mayhem.'],
    ['Basic ATK', 'Cosmos: Frolicking 1-4', '90.18%×2+56.40%×3+65.99%×4+194.01%×3', 'Enhanced Basic ATK combo during Cosmos Rave (replaces Wooly Attack); counted as Basic Attack DMG.'],
    ['Heavy ATK', 'Cosmos: Heavy Attack', '217.58%', 'Enhanced Heavy ATK during Cosmos Rave (replaces Standard); counted as Heavy Attack DMG.'],
    ['Skill', 'Cosmos: Rampage', '63.32%×4', 'Enhanced Skill during Cosmos Rave (replaces Flaming Woolies); counted as Resonance Skill DMG. 4s internal cooldown; also restores Mayhem.'],
    ['Dodge Counter', 'Cosmos: Dodge Counter', '65.99%×4', 'Enhanced Dodge Counter during Cosmos Rave (replaces Standard); counted as Basic Attack DMG.'],
    ['Intro', 'Woolies Helpers', '198.81%'],
    ['Outro', 'Thermal Field', '176.76% ATK per tick ×4 (6s, 1.5s interval)', 'AoE burn field around the Skill target — no team buff, so she\'s free to quickswap.'],
  ],
  // Full audit 2026-09-01 against the wiki/Galbrena/Combat, cross-checked against
  // the source/character/1208 (both agree on every value exactly). CRITICAL BUG: every pre-existing row
  // except Outro was stored at Lv.1, not this file's Lv.10 baseline — e.g. Basic ATK Stage 1 was 29.8%
  // (real Lv.1) vs. the correct 59.18% (Lv.10), silently halving nearly her entire kit's DPS output, the
  // same bug class previously found on Iuno. Also fixed: multi-hit stages collapsed into summed totals
  // instead of per-hit values; several moves typed 'Basic ATK'/'Skill'/'Liberation' when their own move
  // text explicitly reclassifies them as "considered Heavy Attack DMG" or "considered Echo Skill DMG"
  // (matching this file's established convention, e.g. Jiyan's Lance of Qingloong) — retyped accordingly
  // so the correct heavyDmg/echoDmg-type buffs apply to them. Entirely missing Demon Hypostasis move set
  // (Seraphic Execution, Flamewing Verdict, Hellsent Barrage, Purgatory Scourge, Ravage) added — this is
  // most of her actual combo once transformed, and its absence meant CHARACTER_ROTATIONS.Galbrena's whole
  // post-transformation segment was resolving to 0 DMG.
  'Galbrena': [
    ['Heavy ATK', 'Basic Attack Stage 1', '59.18%', 'Considered Heavy Attack DMG despite the Basic ATK input.'],
    ['Heavy ATK', 'Basic Attack Stage 2', '26.31%×2+78.91%', 'Considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Basic Attack Stage 3', '28.60%×2+42.89%×2', 'Considered Heavy Attack DMG.'],
    ['Echo', 'Basic Attack Stage 4', '177.86%', 'Considered Echo Skill DMG.'],
    ['Heavy ATK', 'Blood for Blood', '41.05%×2+61.57%×2', 'Dodge Counter; considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Ashfall Barrage Plunging Attack', '143.15%', 'Mid-air tap; considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Ashfall Barrage Sustained Fire', '26.84% (per tick)', 'Mid-air hold; considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Volley of Death Stage 1', '53.30%×2'],
    ['Heavy ATK', 'Volley of Death Stage 2', '34.59%×2'],
    ['Echo', 'Volley of Death Stage 3', '16.77%×3+117.39%', 'Considered Echo Skill DMG (Stage 1-2 stay Heavy ATK).'],
    ['Heavy ATK', 'Encroach', '10.74%+25.04%', 'Base Skill dash strike, builds Sinflame; considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Ascent of Malice', '51.57%×2', 'Empowered Skill once Sinflame is maxed, transforms into Demon Hypostasis; considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Seraphic Execution Stage 1', '58.99%', 'Demon Hypostasis Basic ATK replacement; considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Seraphic Execution Stage 2', '27.84%×2+83.51%', 'Considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Seraphic Execution Stage 3', '24.32%×3+170.21%', 'Considered Heavy Attack DMG.'],
    ['Echo', 'Seraphic Execution Stage 4', '18.15%×3+127.02%', 'Considered Echo Skill DMG.'],
    ['Echo', 'Seraphic Execution Stage 5', '67.28%+156.99%', 'Considered Echo Skill DMG.'],
    ['Heavy ATK', 'Purgatory Scourge', '32.10%×3+224.70%', 'Demon Hypostasis Dodge Counter replacement; considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Flamewing Verdict Stage 1', '59.22%×2', 'Demon Hypostasis Heavy ATK replacement; considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Flamewing Verdict Stage 2', '38.35%×2', 'Considered Heavy Attack DMG.'],
    ['Echo', 'Flamewing Verdict Stage 3', '17.69%×3+123.77%', 'Considered Echo Skill DMG.'],
    ['Heavy ATK', 'Hellsent Barrage Plunging Attack', '159.05%', 'Demon Hypostasis mid-air tap; considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Hellsent Barrage Sustained Fire', '29.83% (per tick)', 'Demon Hypostasis mid-air hold; considered Heavy Attack DMG.'],
    ['Heavy ATK', 'Ravage', '10.74%+25.04%', 'Demon Hypostasis Skill replacement, shares a cooldown with Encroach; considered Heavy Attack DMG.'],
    ['Echo', 'Hellfire Absolution', '110.90%+90.74%×11', 'Ultimate barrage; considered Echo Skill DMG. Also grants +85% DMG Mult to Demon Hypostasis attacks for 14s.'],
    // Added 2026-09-02, sourced from the pasted the source text's own Forte Circuit Multipliers table —
    // was entirely missing (a real gap, not a rounding fix). Value is a flat 666 fixed DMG number,
    // NOT an ATK%-scaling hit ("considered Basic Attack DMG that does not bear any effect from DMG
    // buffs"), a shape parseSkillMultiplierHits' existing flat+%ATK 2nd-arg mechanism doesn't cover
    // (that's for a flat component ON TOP OF a %ATK hit, not a standalone unbuffable flat number) —
    // recorded here as reference data only, no engine block wired, matching the Review section's own
    // explicit "Hellstride ... will go unused" confirmation (her real rotation never casts it).
    ['Basic ATK', 'Hellstride', '666 flat (unbuffable)', 'Dodge-triggered fixed-DMG poke; confirmed unused in her real rotation per source review text.'],
    ['Intro', 'Hellflare Overload', '94.12%', 'Swap-in opener strike.'],
    ['Outro', 'Ashen Pursuit', '79.50%×3+556.50%', 'Pure-damage swap-out finisher; no team buff, so she\'s free to quickswap.'],
  ],
  // Re-verified in full 2026-08-31 against the wiki/Iuno/Combat's Lv.10 Attribute
  // Scaling tables (Chrome/Windows UA + google.com referer + jsRender, load+9s wait to clear Cloudflare).
  // Prior values were ALL Level-1 numbers (not Lv.10, breaking this file's established convention — see
  // e.g. the Jinhsi re-verification comment above using Lv.10) with every multi-hit stage collapsed into a
  // single summed percentage instead of the real per-hit breakdown — both corrected below. CRITICAL BUG:
  // CHARACTER_ROTATIONS.Iuno's 'Flux: Moonbow' step (Heavy ATK - Flux: Moonbow, the Half Moon → New Moon
  // switch) had NO matching row in this table at all — under the calc engine's name-match lookup that step
  // silently resolved to ZERO damage, the exact bug class found in Cantarella's pass. Added both Flux
  // rows (Moonbow and Moonring) below, plus the two Dodge Counter rows and Unfinished Refrain (Half Moon's
  // Skill replacement, same numbers as Closing Refrain per the source table) which were also missing.
  // Enhanced Moonbow (the further Sentience-boosted Basic ATK/Dodge Counter/Arc Beyond the Edge variant
  // inside New Moon) is a separate, higher-value scaling track in the source but is state/resource-gated
  // per hit in a way this flat per-move schema can't express — TODO: needs Phase 2 schema; base Moonbow
  // values used for now (a conservative floor, not an overstatement).
  'Iuno': [
    ['Basic ATK', 'Moonring 1-3', '87.68% → 46.06%×2+47.46% → 87.98%×2+90.65%', 'Standard combo before entering the Lunar Cycle. Lv.10, per-hit.'],
    ['Basic ATK', 'Moonbow 1-3', '126.45% → 55.67%×3 → 167.01%×2', 'Empowered combo used while inside the Lunar Cycle (New Moon); counted as Resonance Liberation DMG. Lv.10, per-hit.'],
    ['Mid-air', 'Mid-air Attack', '53.68%×2', 'Plunging attack, 30 STA cost. Lv.10.'],
    ['Dodge Counter', 'Moonring Dodge Counter', '82.08%×2+84.57%', 'Dodge Counter while in Half Moon (or outside Lunar Cycle). Lv.10, per-hit.'],
    ['Dodge Counter', 'Moonbow Dodge Counter', '103.39%×3', 'Dodge Counter while in New Moon; counted as Resonance Liberation DMG. Lv.10, per-hit.'],
    ['Skill', 'Pulse of Origins', '18.65%×7 + 130.52%', 'Base dash Skill, can transform into different follow-ups depending on her state. Lv.10.'],
    ['Skill', 'Closing Refrain', '140.73%×2 + 145.00%', 'Skill replacement when NOT in Lunar Cycle (after Moonring Basic ATK 3/Intro/Pulse of Origins); casting it activates Lunar Cycle. Lv.10.'],
    ['Skill', 'Unfinished Refrain', '140.73%×2 + 145.00%', 'Skill replacement while in Lunar Cycle - Half Moon; shares Closing Refrain\'s cooldown. Lv.10.'],
    ['Skill', 'Arc Beyond the Edge', '219.79%×2', 'Skill replacement in New Moon, 2 charges, consumes Sentience per cast; counted as Resonance Liberation DMG. Lv.10.'],
    ['Heavy ATK', 'Flux: Moonbow', '250.51%', 'Heavy ATK replacement in Half Moon (25 STA) — switches Half Moon → New Moon; counted as Resonance Liberation DMG. Lv.10.'],
    ['Heavy ATK', 'Flux: Moonring', '79.18%×4', 'Heavy ATK replacement in New Moon (25 STA) — switches New Moon → Half Moon; counted as Resonance Liberation DMG. Lv.10, per-hit.'],
    ['Heavy ATK', 'Absolute Fullness', '159.05%', 'Forte-empowered Heavy ATK at full Concerto Energy (once per 25s); ends Lunar Cycle. Counted as Resonance Liberation DMG despite the Heavy ATK slot (corrected 2026-09-02 against a fresh dump — same pattern as Flux: Moonbow/Moonring above, previously not noted here). Lv.10 (was the Lv.1 value 80%).'],
    ['Liberation', 'Beneath Lunar Tides', '1093.46%', 'Ultimate strike that activates the Lunar Cycle; no team buff, purely personal damage. Lv.10 (was the Lv.1 value 550%).'],
    ['Intro', 'Illuminated Manifestation', '15.91%×7 + 47.72%', 'Swap-in opener that also restores 40 Sentience. Lv.10.'],
    ['Outro', 'From Gloom to Gleam', '100%', 'Swap-out strike that grants the next Resonator +50% Heavy ATK DMG Amp for 14s (corrected 2026-09-04, Phase A audit — this row\'s note was a stale 10s left over from before CHAR_BUFF_TABLE.Iuno/CHARACTER_ROTATIONS.Iuno were both corrected back to the real 14s).'],
  ],
  // Re-verified 2026-08-31 against the wiki/Jiyan/Combat's Lv.10 Attribute Scaling
  // tables (Chrome/Windows UA + google.com referer + jsRender, load+9s wait; 2nd attempt cleared Cloudflare).
  // Corrections vs previous data: Basic ATK Stage 3 was wrongly '×2' — site's own table shows 5 sub-hits
  // ('36.38%*5'), corrected to ×5. Stage 5 was wrongly '×4' on the first term — site shows 7 sub-hits
  // ('23.60%*7'), corrected to ×7 (the trailing '+153.45%×2' term was already correct). Heavy ATK's
  // Windborne Strike (hold, 81.71%) and Abyssal Slash (release, 105.96%) values were swapped relative to the
  // row's own label order ('Windborne Strike / Abyssal Slash') — reordered to 81.71% → 105.96% to match.
  // Added the previously-missing 'Banner of Triumph' mid-air follow-up row (only reachable after Windborne
  // Strike or an airborne Windqueller — site's own separate 'Mid-Air Attack: Banner of Triumph' section).
  // Liberation 'Emerald Storm: Prelude' itself deals NO direct damage per source (it only triggers Qingloong
  // Mode) — the 65.52%×8/61.55%×8/66.76%×8 figures previously attached to the Liberation row actually belong
  // to the separate 'Heavy Attack: Lance of Qingloong' move (source's own 'Lance Of Qingloong Part 1/2/3
  // Damage' scaling table, explicitly "considered as Heavy Attack damage") — moved to a dedicated Heavy ATK
  // row and Liberation zeroed to reflect it has no direct hit of its own. This also fixes a zero-damage bug:
  // CHARACTER_ROTATIONS.Jiyan's steps referenced move names like "Lance of Qingloong P1" which did not
  // substring-match the old row name at all (rowName.includes(step.skill) lookup) — rotation steps corrected
  // to say plain "Lance of Qingloong", which now matches this row's name.
  'Jiyan': [
    ['Basic ATK', 'Lone Lance Stage 1-5', '73.16% → 43.73% → 36.38%×5 → 66.20%×2 → 23.60%×7+153.45%×2', 'Standard 5-stage combo; Stage 3 hits 5×, Stage 5 hits 7×+2× finisher hit.'],
    ['Heavy ATK', 'Standard / Windborne Strike / Abyssal Slash', '22.20%×6 → 81.71% → 105.96%', 'Hold Basic ATK during Heavy ATK for Windborne Strike (81.71%); release Basic ATK for Abyssal Slash (105.96%) instead.'],
    ['Heavy ATK', 'Lance of Qingloong 1-3', '65.52%×8 → 61.55%×8 → 66.76%×8', 'Qingloong Mode Heavy ATK replacement (10s duration, 16s CD, 125 Energy cost); 3-part combo, each part hits 8×; counted as Heavy ATK DMG.'],
    ['Mid-air', 'Plunging Attack + Follow-up', '123.26%+155.66%'],
    ['Mid-air', 'Banner of Triumph', '79.52%', 'Extra mid-air follow-up, only usable right after Windborne Strike or an airborne Windqueller.'],
    ['Dodge Counter', 'Standard', '125.85%×2'], // fixed 2026-09-04 (Phase A audit): was 125.84%, source (Jiyan dump, Lv.10 multiplier table) reads 125.85%.
    ['Skill', 'Windqueller', '106.36%×4', '7s cooldown; at 30+ Resolve consumes 30 Resolve for +20% DMG outside Qingloong Mode; free +20% DMG (no Resolve cost) while in Qingloong Mode.'],
    ['Forte', 'Emerald Storm: Finale', '142.91%×2+428.73%', 'At 30+ Resolve, Liberation consumes 30 Resolve to cast Finale instead of Prelude (counted as Heavy ATK DMG; castable mid-air at low altitude).'],
    ['Liberation', 'Emerald Storm: Prelude', 'No direct DMG', 'Deals no direct DMG below 30 Resolve — only triggers Qingloong Mode (10s, 16s CD, 125 Energy cost). See "Lance of Qingloong 1-3" (Heavy ATK) for the actual damage dealt during Qingloong Mode, and "Emerald Storm: Finale" (Forte) for the 30+ Resolve branch.'],
    ['Intro', 'Tactical Strike', '198.81%'],
    ['Outro', 'Discipline', '313.40% ATK per proc, up to 2', 'Coordinated ATK triggered when the incoming Resonator lands a Heavy ATK (8s window, once per second).'],
  ],
  // Re-verified 2026-08-31 against the wiki/Jinhsi/Combat's Lv.10 Attribute Scaling
  // tables (Chrome/Windows UA + google.com referer + jsRender, load+9s wait to clear Cloudflare): Basic
  // ATK Stage 1-4, Heavy ATK, Mid-air, Dodge Counter, Liberation (499.81%+1166.22%), and Intro (159.05%)
  // all matched the site's Lv.10 row EXACTLY — no corrections needed. Trailing Lights of Eons/Overflowing
  // Radiance: the site's own scaling table stops rendering at level 7 (19.46/9.87 area) rather than 10, but
  // extrapolating with the same per-level growth ratio the site's OTHER fully-rendered Lv.1→10 tables show
  // (e.g. Basic ATK Stage 1: 33.43%→66.47%, a 1.988× ratio) reproduces this file's existing 19.46%/9.87%/
  // 29.59%/39.45% values to 2 decimal places — confirmed correct via that cross-check, unchanged. Forte
  // (Incarnation/Illuminous Epiphany) values and the +44.54%-per-Incandescence figure could NOT be
  // independently re-confirmed this pass — the site's own Forte Circuit scaling table failed to render
  // ("Lua error in Module:Skill_Scaling at line 76") — TODO: verify directly against a live source
  // next audit; left unchanged as no contradicting source was found.
  // Forte row rebuilt 2026-09-03 against a real browser snapshot, resolving the stale "source
  // table failed to render this pass" TODO. Was one combined row ('Incarnation → Illuminous Epiphany')
  // whose name didn't substring-match EITHER of the two rotation steps that need it (Jinhsi[3] "Forte:
  // Incarnation - Basic Attack Stage 1-4" and Jinhsi[4] "Skill: Illuminous Epiphany" — both listed in
  // data-integrity.test.js's KNOWN_UNRESOLVED_BASELINE as a result). Split into individually-named rows
  // exactly matching the rotation steps' own skill strings (now exact-matches, not fuzzy), and added 2
  // moves entirely missing before (Incarnation - Heavy Attack, Incarnation - Dodge Counter) — real kit
  // moves per this source, just not used in the modeled rotation.
  'Jinhsi': [
    ['Basic ATK', 'Slash of Breaking Dawn Stage 1-4', '66.47% → 38.99%+19.50%×3 → 10.65%×7+31.94% → 63.09%+94.63%'],
    ['Heavy ATK', 'Standard', '23.86%×5+35.79%+83.51%'],
    ['Mid-air', 'Plunging Attack', '12.33%+24.66%+86.29%'],
    ['Dodge Counter', 'Standard', '14.68%×7+44.02%'],
    ['Skill', 'Trailing Lights of Eons → Overflowing Radiance', '19.46%×4+77.84% → 9.87%×4+29.59%×4+39.45%', 'After Basic ATK 4 or Intro, Skill becomes Overflowing Radiance, entering Incarnation (10s).'],
    ['Forte', 'Incarnation - Basic Attack Stage 1-4', '88.62% → 77.97%+25.99%×2 → 99.44%+66.30% → 18.67%×6+74.67%', 'While in Incarnation, replaces Basic ATK; counted as Resonance Skill DMG. Landing Stage 4 ends Incarnation and opens the 5s Ordination Glow window.'],
    ['Forte', 'Incarnation - Heavy Attack', '47.72%+111.34%', 'Replaces Heavy Attack during Incarnation; also replaces Basic ATK during Ordination Glow (after Incarnation-Basic-ATK Stage 4).'],
    ['Skill', 'Crescent Divinity', '100.76%+75.57%×2+251.90%', "Replaces Resonance Skill during Incarnation (Jinhsi's alternate direct-cast Skill hit while incarnated); castable mid-air."],
    ['Dodge Counter', 'Incarnation - Dodge Counter', '43.89%+32.92%×2+109.71%', 'Replaces Dodge Counter during Incarnation; castable mid-air.'],
    ['Skill', 'Illuminous Epiphany', '19.89%×6+347.92%', 'Replaces Resonance Skill during Ordination Glow. Solar Flare (19.89%×6) detonates as Stella Glamor (347.92%) after a short delay; Stella Glamor gains +44.54% DMG Multiplier per Incandescence consumed (up to 50).'],
    ['Liberation', 'Purge of Light', '499.81%+1166.22%', '24s cooldown; huge AoE nuke.'],
    ['Intro', "Loong's Halo", '159.05%'],
    ['Outro', 'Temporal Bender', 'Incandescence gain rate +1/s for 20s', 'Utility only — no direct DMG or team buff.'],
  ],
  // Re-verified verbatim 2026-08-31 against the wiki/Jianxin/Combat's "Attribute
  // Scaling" tables at column 10 (Lv.10) for every row — all existing per-hit values already matched the
  // source exactly (Basic/Heavy/Mid-air/Dodge Counter/Skill/Liberation/Intro/Outro all confirmed correct,
  // no changes). One addition: the Forte row was missing "Zhoutian Progress Continuous Damage" (24.86% at
  // Lv.10) — the recurring Chi Strike tick dealt every interval while channeling Primordial Chi Spiral,
  // separate from the Pushing Punch/Shock/Yielding Pull hits already listed — appended below rather than
  // left out, since it's a real per-tick DPS component of the channel.
  'Jianxin': [
    ['Basic ATK', 'Fengyiquan Stage 1-4', '69.46% → 26.64%×2+79.90% → 41.75%×4 → 113.40%'],
    ['Heavy ATK', 'Standard', '126.07%'],
    ['Mid-air', 'Plunging Kick', '123.27%'],
    ['Dodge Counter', 'Standard', '40.83%×2+163.29%'],
    ['Skill', 'Calming Air: Chi Counter / Chi Parry', '334.60% / 258.73%', 'Hold Skill for Parry Stance — Chi Counter on being attacked, Chi Parry on early release. 12s cooldown.'],
    // note corrected 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was "hold Basic ATK" — the dump's
    // own kit text is explicit "hold Heavy Attack to cast Primordial Chi Spiral". Also informed
    // jianxin.blocks.js's forte.primordial-chi-spiral category fix (heavyDmg, matching the "auto-replaces
    // Heavy Attack" convention already used for Yinlin's Forte:Chameleon Cipher).
    ['Forte', 'Primordial Chi Spiral (Zhoutian Progress)', '248.52% (Pushing Punch) · 24.86% per tick (Zhoutian Progress Continuous DMG) · 139.17%/377.74%/516.91% (Minor/Major-Inner/Major-Outer Shock) · 218.70% (Yielding Pull)', 'At max Chi, hold Heavy Attack for a channeled shield-and-DMG state with 50% DMG reduction and +interrupt resistance.'],
    ['Liberation', 'Purification Force Field', '29.83% (continuous) + 636.20% (explosion)', 'Pulls targets into the field, then explodes on expiry. 20s cooldown.'],
    ['Intro', 'Essence of Tao', '33.80%×3+67.60%'],
    ['Outro', 'Transcendence', 'Resonance Liberation DMG Amp +38% (14s)', 'Grants the incoming Resonator this buff — no direct DMG.'],
  ],
  // Re-verified verbatim 2026-08-31 against the wiki/Lingyang/Combat's Lv.10
  // "Attribute Scaling" tables (Chrome/Windows UA + google.com referer + jsRender) — every row below
  // already matched source exactly (Basic ATK stages, Heavy/Mid-air/Dodge Counter, Ancient Arts/Furious
  // Punches, all 5 Forte Circuit sub-hits, Liberation, Intro, Outro); no numeric corrections were needed
  // here, unlike most other characters in this pass.
  'Lingyang': [
    ['Basic ATK', 'Majestic Fists Stage 1-5', '59.65% → 79.53% → 72.87%×2 → 20.41%×5+43.72% → 152.49%', 'Stage 5 can be replaced by Feral Roars (79.53%×2) after casting Furious Punches.'],
    // Added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): Stormy Kicks/Tail Strike had real,
    // published Lv.10 multipliers embedded in the Forte row's combined string but no own SKILL_MULTIPLIERS
    // row, leaving CHARACTER_ROTATIONS' new steps for them unresolvable. Split out as their own rows.
    ['Basic ATK', 'Stormy Kicks', '36.03%×8+192.15%', "Striding Lion Basic ATK replacement once Lion's Spirit drops below 10; unlocks the Tail Strike Mid-air Attack."],
    ['Heavy ATK', 'Standard', '145.73%'],
    ['Mid-air', 'Plunging Attack', '123.27%'],
    ['Mid-air', 'Tail Strike', '174.96%×2', 'Unlocked by Stormy Kicks.'],
    ['Dodge Counter', 'Standard', '126.05%×2'],
    ['Skill', 'Ancient Arts → Furious Punches', '132.61% → 76.25%×2', 'Basic ATK 3-5 or Feral Roars swaps Skill to Furious Punches; no cooldown, doesn\'t reset the Basic ATK cycle.'],
    ['Forte', 'Unification of Spirits (Striding Lion)', '172.37% (Glorious Plunge) · 87.08%×2+116.11%→31.77%×6 (Feral Gyrate) · 82.88%×2 (Mountain Roamer) · 36.03%×8+192.15% (Stormy Kicks) · 174.96%×2 (Tail Strike)', 'At full Lion\'s Spirit, Heavy ATK casts Glorious Plunge and enters Striding Lion — an airborne enhanced-attack state.'],
    ['Liberation', "Strive: Lion's Vigor", '397.62%', "Also grants self Glacio DMG Bonus +50% for 14s. 20s cooldown."],
    ['Intro', 'Lion Awakens', '99.41%×2'],
    ['Outro', 'Frosty Marks', '587.94% ATK AoE', 'Pure-damage swap-out finisher — no team buff baseline (S4 chain grants team Glacio DMG +20%/30s).'],
  ],
  // Corrected 2026-08-17 against the source's character #1207 sheet (Lv.10 skill attributes): every
  // row was roughly half its true value (e.g. her Liberation nuke Fire-Kissed Glory was listed as
  // '412.7%' vs the real 820.44%) — the same halving pattern already found and fixed across most of
  // the recently-audited roster. The old Intro Try Focusing, Eh? note claiming "exact base number not
  // published" was also wrong — the source does publish it (29.76%+42.16%×4), so the apologetic note is
  // dropped along with the halved placeholder value.
  // Full audit 2026-09-01 against the wiki/Lupa/Combat, cross-checked against
  // the source/character/1207 (both agree on every value exactly). Multiple bug classes fixed:
  // (1) multi-hit stages collapsed bug — Basic ATK Stage 1-4 was one summed-total string, not per-hit
  // values; split into per-stage rows. (2) type miscategorization — Wolf's Claw was stored as type
  // 'Basic ATK' but is a native Heavy Attack move (replaces the Heavy ATK input at 50+ Wolflame/1+
  // Wolfaith); moved to 'Heavy ATK'. (3) wrong parent-type bug — Dance With the Wolf, Dance With the
  // Wolf: Climax, and Nowhere to Run! are each explicitly "considered Resonance Liberation DMG" in their
  // own move text, but were typed 'Skill'/'Intro'; retyped to 'Liberation' (also now consistent with
  // RESONANCE_CHAIN_DATA.Lupa's S3/S4 libDmg nodes, which buff these same two moves' own multipliers).
  // Firestrike is "considered Heavy Attack DMG" per its own text; typed 'Heavy ATK' (was 'Mid-air').
  // (4) missing rows — Wolf's Gnawing, Heavy ATK (standard), Mid-air Attack Stage 1-2, Plunging Attack,
  // Dodge Counter, Foebreaker, and Dance With the Wolf: Climax had no row at all; Foebreaker's absence
  // was a real zero-damage rotation bug (CHARACTER_ROTATIONS.Lupa's Foebreaker step had nothing to
  // match). All added below.
  'Lupa': [
    ['Basic ATK', 'Stage 1', '22.52%+22.52%+45.04%'],
    ['Basic ATK', 'Stage 2', '90.08%'],
    ['Basic ATK', 'Stage 3', '78.84%+13.14%×6'],
    ['Basic ATK', 'Stage 4', '73.87%×2+49.25%×2'],
    ['Basic ATK', 'Starfall', '12.65%×4+118.06%', 'Ground finisher after a Plunging Attack, Dodge Counter, Shewolf\'s Hunt/Feral Fang, or the Remember My Name Sprint dash.'],
    ['Heavy ATK', 'Standard', '56.36%×2'],
    ['Heavy ATK', "Wolf's Gnawing", '56.11%×2', 'Replaces Heavy ATK at 50+ Wolflame; consumes 50 Wolflame, grants 1 Wolfaith. Does not restore Wolflame.'],
    ['Heavy ATK', "Wolf's Claw", '72.15%+18.04%×4+96.19%', 'Replaces Heavy ATK at 50+ Wolflame and 1+ Wolfaith; consumes 50 Wolflame, grants 1 more Wolfaith.'],
    ['Heavy ATK', 'Firestrike', '28.48%×2', 'Replaces Mid-air Attack Stage 3 at 50+ Wolflame; considered Heavy ATK DMG.'],
    ['Mid-air', 'Attack Stage 1-2', '76.73% → 77.23%+19.31%×4'],
    ['Mid-air', 'Plunging Attack', '26.20%+52.39%+26.20%', 'Hold Basic Attack while airborne; can combo into Starfall.'],
    ['Dodge Counter', 'Standard', '34.18%×4+136.72%'],
    ['Skill', "Shewolf's Hunt", '140.77%', 'Base Skill dash strike; marks the target for 8s and opens the Feral Fang window.'],
    ['Skill', 'Feral Fang', '313.61%', 'Empowered follow-up within the window after Shewolf\'s Hunt; +50% DMG Mult vs the marked target.'],
    ['Liberation', 'Dance With the Wolf', '56.02%+42.02%×4+336.11%', 'Forte finisher at 2 Wolfaith, consumes both; considered Resonance Liberation DMG.'],
    ['Liberation', 'Dance With the Wolf: Climax', '75.63%+56.72%×4+453.75%', 'Upgraded Forte finisher when Wolfaith hits 2 during Burning Matchpoint; considered Resonance Liberation DMG.'],
    ['Skill', 'Set the Arena Ablaze', '42.35%+169.40%', 'Off-field backup hit within 8s of Dance With the Wolf(: Climax), triggered by an ally casting their Liberation; considered Resonance Skill DMG.'],
    ['Liberation', 'Fire-Kissed Glory', '820.44%', 'Ultimate nuke that also grants the team Pack Hunt/Glory buffs and enables Wild Hunt.'],
    ['Skill', 'Foebreaker', '304.46%', 'Consumes all Wolflame; enters Burning Matchpoint.'],
    ['Intro', 'Try Focusing, Eh?', '29.76%+42.16%×4', 'Base swap-in opener.'],
    ['Liberation', 'Nowhere to Run!', '793.57%+49.60%×4', 'Replaces the next Intro Skill once in Wild Hunt state; considered Resonance Liberation DMG.'],
    ['Outro', 'Stand by Me, Warrior', '+20% Fusion DMG Amp + 25% Basic ATK DMG Amp (14s)', 'Swap-out buff to the next Resonator.'],
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
  // Real zero-damage rotation-step bug fixed 2026-09-02 against a fresh the source dump (same class of bug
  // as Yangyang: Xuanling's Feather Fall/Havoc in Bloom): CHARACTER_ROTATIONS.Lynae's own
  // 'Basic ATK:Polychrome Leap ×3' step (one of only 7 real steps in her whole rotation) had no matching
  // row here at all — the engine block file's own header comment explicitly flagged this as "NO matching
  // SKILL_MULTIPLIERS row at all — not modeled rather than guessed." The fresh dump's Forte Circuit
  // multipliers table actually has all 3 stages (previously not sourced), added below.
  'Lynae': [
    ['Basic ATK', 'Stage 1-3', '86.19% → 52.39%×3 → 123.37%', 'Standard combo before entering her Kaleidoscopic mode.'],
    ['Heavy ATK', 'Spark Collision Lv.3', '277.78%×2', 'Fully-charged heavy hit, a big single burst of damage.'],
    ['Basic ATK', 'Kaleidoscopic 1-5', '82.81% → 38.87%×2 → 37.75%×3 → 29.75%×2+44.62%×2 → 75.54%+15.11%×5+100.72%', 'Extended empowered combo used once her Kaleidoscopic mode is active.'],
    ['Basic ATK', 'Polychrome Leap ×3', '33.80%×3 → 16.90%×6 → 13.10%×8', 'Airborne Jump attack chain (3 stages while in Kaleidoscopic Parade); each stage consumes 1/3 Lumiflow and grants 1 True Color point.'],
    ['Forte', 'Visual Impact', '1216.72%', "Massive Forte finisher, her main source of burst damage. Literally named \"Basic Attack - Visual Impact\" — considered real Basic Attack DMG, not a separate Forte category."],
    ['Forte', 'Iridescent Splash', '304.18%', "Secondary Forte follow-up hit. Literally named \"Basic Attack - Iridescent Splash\" — considered real Basic Attack DMG."],
    ['Skill', 'Lynae-Style Palettes', '139.31% + 46.44%×3', 'Skill that builds up her paint/mode resource while dealing damage.'],
    ['Skill', 'Additive Color', '116.31%×2', 'Quick follow-up Skill strike.'],
    ['Liberation', 'Prismatic Overblast', '87.48%×10', 'Ultimate multi-hit barrage.'],
    ['Intro', 'Time to Show Some Colors!', '22.48%×10', 'Swap-in opener with several rapid hits.'],
    ['Outro', "Let's Hit the Road!", '100% ATK + 15% All DMG / 25% Liberation DMG Amp', 'Swap-out buff granting the next Resonator All-DMG or Liberation DMG Amp.'],
  ],
  // Corrected 2026-09-02 against a fresh the source dump: CHARACTER_ROTATIONS['Mornye']'s real (and only)
  // Basic ATK step is 'Wide Field Observation Mode Stage 1-3' — this row had no entry containing that
  // name at all (the only Basic ATK row was her un-enhanced base combo, never used in her real
  // rotation), so findSkillMultiplierRow's fuzzy match failed outright — the "silent zero-DMG bug
  // class" its own dev-mode warning calls out. Added the missing Wide Field Basic/Dodge Counter rows
  // plus Heavy Attack/Mid-air Attack (present in the dump's Multipliers table but missing here too),
  // keeping the un-enhanced Basic ATK/Dodge Counter rows for reference since they're still real values.
  'Mornye': [
    ['Basic ATK', 'Stage 1-4', '22.27%+16.71%×2 → 23.86%×2+17.90%×4 → 41.36%+10.34%×6 → 135.20%', 'Standard combo string, scales off DEF like all her damage. Not used in her real rotation — see Wide Field Observation Mode below.'],
    ['Basic ATK', 'Wide Field Observation Mode Stage 1-3', '13.92%×4 → 25.85%×4 → 9.31%×4+33.09%×2', 'Her real Basic Attack combo — replaces plain Basic ATK while in Wide Field Observation Mode, builds Relative Momentum.'],
    ['Heavy Attack', 'Standard', '11.10%+11.10%+14.80%'],
    ['Mid-air Attack', 'Plunging Attack', '98.61%'],
    ['Dodge Counter', 'Standard', '162.23%'],
    ['Dodge Counter', 'Wide Field Observation Mode', '25.85%×4'],
    ['Skill', 'Optimal Solution', '179.73%', 'Marks an enemy and deals DEF-scaling damage.'],
    ['Skill', 'Distributed Array', '39.77%×4', 'Multi-hit follow-up Skill.'],
    ['Forte', 'Geopotential Shift', '44.14% + 99.02%', 'Forte strike that also fuels her healing/support kit.'],
    ['Forte', 'Inversion', '258.46%', 'Stronger Forte finisher.'],
    ['Liberation', 'Critical Protocol', '522.33% DEF', 'Ultimate; a DEF-scaling nuke that also empowers her buffs.'],
    ['Intro', 'Convergence', '202.79%', 'Swap-in opener strike.'],
    ['Outro', 'Recursion', '+25% All DMG Amp (30s)', 'Swap-out buff granting the team +25% All DMG for a long duration.'],
  ],
  // Corrected 2026-08-17 against the source's character #1506 sheet (Lv.10 skill attributes): every
  // row except Outro was roughly half its real value (e.g. Absolution Litany — her core Forte burst —
  // was listed as '321%' vs the real 638.19%) — the same halving pattern already found and fixed across
  // Camellya/Carlotta/Roccia's rows. Outro (528.4%, matching the source's 528.41% exactly) is unchanged.
  // Re-verified verbatim 2026-08-31 against the wiki/Phoebe/Combat's Lv.10 Attribute
  // Scaling tables. Basic ATK Stage 2 and Chamuel's Star Stage 2 were each stored as one collapsed number
  // (49.7%, 79.5%) that actually sums TWO separate hits (real: 22.37%+27.34% and 39.77%×2 respectively) —
  // corrected to the per-hit "A+B" / "A×N" notation used everywhere else in this table so the hit count
  // isn't lost. Every other row (Heavy ATK, Skill, Forte Starflash/Absolution Litany, Liberation, Intro,
  // Outro) matches the the wiki Lv.10 row exactly, no further changes. Also added each skill's mode-gated
  // Confession-side effect where the wiki text gives one (Liberation applies 8 Frazzle stacks instead of
  // its Absolution DMG bump; Outro instead grants the Silent Prayer support buff) so the DMG-only number
  // isn't read as the whole picture.
  'Phoebe': [
    ['Basic ATK', 'Stage 1-3', '29.5% → 22.4%+27.3% → 14.2%×8'],
    ['Heavy ATK', 'Standard', '41.4%×4'],
    ['Skill', 'To Where Light Shines', '62.6%×2'],
    ['Skill', "Chamuel's Star 1-3", '59.4% → 39.8%×2 → 28.9%×6'],
    ['Forte', 'Starflash', '82.7%×3'],
    ['Forte', 'Absolution Litany', '638.2%'],
    // Added 2026-09-02, sourced from a real browser snapshot's own Forte Circuit Multipliers
    // table — was entirely missing (Confession mode's own Forte cast, the direct counterpart to
    // Absolution Litany). Not wired into an engine block since CHARACTER_ROTATIONS['Phoebe'] only
    // models her Absolution rotation (never Confession) — reference data only.
    ['Forte', 'Utter Confession', '187.9%', "Confession mode's Forte Circuit cast (parallel to Absolution Litany); applies 1 Spectro Frazzle stack, refills Divine Voice to 60. Confirmed unused in the modeled (Absolution-only) rotation."],
    ['Liberation', 'Dawn of Enlightenment', '401.6% (+255% DMG Mult in Absolution / 8 Frazzle stacks applied in Confession, no DMG Mult change)'],
    ['Intro', 'Golden Grace', '198.8%'],
    ['Outro', 'Attentive Heart', '528.4% (+255% DMG Mult in Absolution / grants Silent Prayer support buff in Confession)'],
  ],
  // Corrected 2026-08-17 against the source's character #1608 sheet (Lv.10 skill attributes): every
  // row except Outro was roughly half its true value (e.g. her Liberation cast Curtain Call was listed
  // as '234%' vs the real 465.22%) — the same halving pattern already found and fixed across most of
  // the recently-audited roster. The old Intro Suite of Quietus note claiming "exact base number not
  // published" was also wrong — the source does publish it (80.61%+120.91%) — so that note is dropped.
  // Re-verified verbatim 2026-08-31 against the wiki/Phrolova/Combat Lv.10
  // Attribute Scaling tables, cross-checked the source/character/1608's Skill Attributes (Lv.10)
  // panels — every row below, including Intro, matches both sources exactly; no corrections needed.
  // (An initial the wiki-wiki text extraction seemed to show Suite of Quietus at Lv.10 as 74.96%+112.44%,
  // one row short of the other 10-level tables on the same page; the source's Skill Attributes panel
  // confirms the true Lv.10 value is 80.61%+120.9x%, matching the existing 80.6% + 120.9% below — the
  // the wiki figure was simply the Lv.9 row, an artifact of a truncated column in that extraction.)
  // Added 2026-09-02 against a fresh the source dump: 'Movement of Fate and Finality' and 'Murmurs in a
  // Haunting Dream' previously had NO row at all despite being 3 real CHARACTER_ROTATIONS steps (Forte
  // follow-ups on Basic ATK Stage 3 / Skill while in Reincarnate) — left phrolova.blocks.js's S1 chain
  // bonus (+80% DMG Multiplier on both) permanently inert. Values now sourced verbatim from the dump's
  // own Lv.10 Multipliers table.
  'Phrolova': [
    ['Basic ATK', 'Stage 1-3', '106.9% → 95.4% → 196.1%', 'Standard combo string, builds Aftersound/Notes.'],
    ['Heavy ATK', 'Scarlet Coda', '33.0%×2 + 12.4%×8 + 495.1% (+82.55% per stack)', 'Empowered Heavy ATK, damage scales with stacked Aftersound.'],
    ['Skill', 'Whispers in Fleeting Dream', '106.0%×2', 'Quick Skill strike that enters Reincarnate.'],
    ['Forte', 'Movement of Fate and Finality', '37.88%×4 + 117.83%×3', 'Reincarnate follow-up via Basic Attack — single-target, Stagnates, ends Reincarnate. Counted as Resonance Skill DMG.'],
    ['Forte', 'Murmurs in a Haunting Dream', '23.21%×4 + 46.41% + 324.82%', 'Reincarnate follow-up via Resonance Skill — groups adds, ends Reincarnate. Counted as Resonance Skill DMG.'],
    ['Intro', 'Suite of Quietus', '80.6% + 120.9%', 'Base swap-in opener strike.'],
    ['Intro', 'Suite of Immortality', '596.4%', 'Enhanced Intro used only while in Maestro state — much stronger than the base opener.'],
    ['Liberation', 'Maestro State: Hecate', 'Strings 347.9% / Winds 330.5% / Cadenza 347.9%', 'Summons Hecate for sustained off-field Havoc DMG during Maestro.'],
    ['Liberation', 'Curtain Call', '465.2%', 'Ultimate cast that ends Resolving Chord and enters Maestro.'],
    ['Outro', 'Unfinished Piece', '+20% Havoc DMG + 25% Heavy ATK DMG Amp (14s)', 'Swap-out buff to the next Resonator; grants Hecate 2 bonus attacks if cast during Maestro.'],
  ],
  // Corrected 2026-09-02 against a fresh the source dump (Lv.10 Multipliers tables): every damage row was
  // roughly half its real value and several multi-hit stages were summed instead of per-hit — the same
  // halving pattern already found and fixed on Camellya's/Carlotta's/Roccia's rows (e.g. Basic ATK Stage 1
  // was '21%' vs the real 41.76%; Liberation was '400%' vs the real 795.24%). Also added the missing
  // Mid-air Attack and Dodge Counter rows, and split Forte's 3 Heavy ATK finishers into per-hit values
  // instead of a single summed number each.
  // Further additions 2026-09-04 (fresh dump re-audit, first full Phase A pass): the S3+ Skill replacement
  // "Straw Cape in Drizzly Rain" (500% ATK) and its S3+ Outro replacement "Sheath Fallen, New Shoots
  // Revealed" (500% ATK) were real named moves with exact sourced multipliers, entirely missing from this
  // table before now — added per the standing rule that real moves get a multiplier row even when
  // situational/sequence-gated (Qingxiao's Dodge Counters precedent), not force-fit into the base rotation.
  'Qiuyuan': [
    ['Basic ATK', 'Stage 1-3', '41.76% → 34.80%×2 → 24.64%×4+65.69%', 'Standard combo before entering Inkwash form.'],
    ['Heavy ATK', 'Standard', '165.61%', 'Charged strike, a solid single hit.'],
    ['Mid-air ATK', 'Plunging Attack', '116.91%'],
    ['Dodge Counter', 'Standard', '194.84%+27.84%×3'],
    ['Skill', 'Through the Groves', '71.84%×3', 'Multi-hit Skill strike.'],
    ['Skill', 'Undaunted Wayfarer', '32.33% + 32.33%×3 + 86.21%', 'Held version of her Skill, extended combo.'],
    ['Forte', 'Inkwash 1-4', '59.65%×2 → 55.65%×2+74.20% → 14.58%×5+72.87% → 172.37%', 'Forte-transformed combo string, her main damage form.'],
    ['Forte', 'To Teach / To Save / To Sacrifice', '91.44%×5 / 38.44%×3+31.45%×3 / 217.70%', 'Heavy ATK finishers in Inkwash form, each with a different follow-up effect.'],
    ['Liberation', 'Sundering Strike', '795.24%', 'Ultimate nuke.'],
    ['Intro', 'Attack the Must-Defend', '9.55%×5 + 47.72% + 143.15%', 'Swap-in opener, counted as Heavy ATK DMG.'],
    ['Skill', 'Straw Cape in Drizzly Rain', '500%', 'S3+ only: replaces Skill once Concerto Energy is full outside Inksplash of Mind (once per 20s); counted as Echo Skill DMG, also grants To Teach/To Save/To Sacrifice +600% DMG Mult and +100% Crit DMG for 6s.'],
    ['Outro', 'Strike Before Ready', '100% ATK + 50% Echo Skill DMG Amp (14s)', 'Swap-out buff granting the next Resonator Echo Skill DMG Amp.'],
    ['Outro', 'Sheath Fallen, New Shoots Revealed', '500% ATK', 'S3+ only: outside Co-op, casting Straw Cape in Drizzly Rain replaces the next Outro with this move; counted as Echo Skill DMG.'],
  ],
  // Corrected 2026-08-17 against the source's character #1606 sheet (Lv.10 skill attributes): every
  // damage row was roughly half its real value (e.g. Real Fantasy's 3 hits were '162% → 171% → 180%'
  // vs the real 322.08% → 339.97% → 357.86%) — the same halving pattern already found and fixed in
  // Camellya's/Carlotta's rows. Outro (a DMG Amp buff description, not a raw multiplier) is unaffected.
  // Re-verified verbatim 2026-08-31 against the wiki/Roccia/Combat's Attribute
  // Scaling tables (Lv.10 column specifically, confirming this is not the Iuno-style Lv.1 bug):
  // Real Fantasy/Skill/Liberation/Intro numbers above were already correct. Basic ATK's 4 stages were
  // wrongly SUMMED into one number per stage instead of per-hit (Stage 2 '114.4%' = 38.14%×3 summed;
  // Stage 3 '169.0%' = 33.80%×2+101.40% summed; Stage 4 '208.4%' = 104.19%×2 summed) — same collapsed
  // multi-hit bug already found/fixed on Camellya/Carlotta/Phoebe's rows, fixed here to real per-hit
  // values. Added Mid-air Attack and Dodge Counter rows (both present in the source's Attribute Scaling
  // table but previously missing entirely from this file). Outro's forfeit condition ("...or until the
  // Resonator is switched out", confirmed present in the wiki's Outro text, same schema-gap flagged for
  // Changli/Augusta's outro buffs) added to the note.
  'Roccia': [
    ['Basic ATK', 'Stage 1-4', '73.18% → 38.14%×3 → 33.80%×2+101.40% → 104.19%×2'],
    ['Heavy ATK', 'Standard', '168.99%'],
    ['Mid-air ATK', 'Plunging Attack', '104.78%'],
    ['Dodge Counter', 'Standard', '68.90%×3'],
    ['Skill', 'Acrobatic Trick', '61.47%×8'],
    ['Forte', 'Real Fantasy 1-3', '322.08% → 339.97% → 357.86%'],
    ['Liberation', 'Commedia Improvviso!', '278.34%×3'],
    ['Intro', 'Pero, Help!', '168.99%'],
    ['Outro', 'Applause, Please!', '+20% Havoc DMG + 25% Basic ATK DMG Amp (14s or until swapped out)'],
  ],
  'Rover: Spectro': [
    ['Basic ATK', 'Vibration Manifestation Stage 1-4', '59.15% → 76.05% → 15.21%×5 → 130.13%', 'Standard 4-stage combo; each hit builds Diminutive Sound toward Forte.'],
    ['Heavy ATK', 'Standard / Resonance / Aftertune', '19.27%×5 → 76.05% → 126.75%', 'Charged Heavy ATK, into timed-press Resonance follow-up, into Aftertune finisher.'],
    ['Mid-air', 'Plunging Attack', '104.78%'],
    ['Dodge Counter', 'Standard', '195.34%'],
    ['Skill', 'Resonating Slashes', '236.19%', '6s cooldown; builds Diminutive Sound toward the Forte combo.'],
    ['Forte', 'Resonating Spin', '129.08%×2', 'At 50+ Diminutive Sound, Skill casts Resonating Spin (2 Spectro Frazzle stacks + Shimmer).'],
    ['Forte', 'Resonating Whirl', '39.77%', 'Immediate Basic ATK follow-up chained right after Resonating Spin.'],
    ['Forte', 'Resonating Echoes', '79.53%+159.05%', 'Separate Basic ATK combo cast after Resonating Spin fully ends.'],
    ['Liberation', 'Echoing Orchestra', '198.81%+675.96%', 'Delayed blast; applies 6 stacks of Spectro Frazzle.'],
    ['Intro', 'Waveshock', '168.99%'],
    ['Outro', 'Instant', 'Stasis field (CC only, no DMG)', 'Generates an area of stasis centered on the incoming Resonator, lasting 3s. Re-verified 2026-09-01 against the wiki/the source: neither source lists any DMG Amp buff for this Outro — the previous "some sources credit +20% Spectro DMG Amp" note was unconfirmed speculation, removed.'],
  ],
  'Rover: Havoc': [
    ['Basic ATK', 'Tuneslayer Stage 1-5', '56.67% → 56.67%×2 → 85% → 40.30%×3 → 94.44%×2', '5-stage Basic ATK combo, into an enhanced Stage 4 after a Heavy ATK.'],
    ['Heavy ATK', 'Standard', '95.43%'],
    ['Mid-air', 'Plunging Attack', '117.10%'],
    ['Dodge Counter', 'Standard', '179.43%'],
    ['Skill', 'Wingblade', '286.29%×2', '12s cooldown.'],
    ['Heavy ATK', 'Devastation', '228.14%', 'Hold Basic ATK at full Umbra to cast Devastation, entering Dark Surge; considered Heavy Attack DMG.'],
    ['Skill', 'Umbra: Lifetaker', '276.35%×2+9.95%×4', 'Replaces Wingblade in Dark Surge; resets Skill cooldown on entry.'],
    ['Basic ATK', 'Umbra: Basic Attack Stage 1-5', '56.37% → 93.94% → 155.67% → 37.13%×3+111.39% → 28.52%×4+114.07%', 'Enhanced Basic ATK combo in Dark Surge.'],
    ['Heavy ATK', 'Umbra: Heavy Attack', '128.83%', 'Enhanced Heavy ATK in Dark Surge.'],
    ['Heavy ATK', 'Umbra: Thwackblade', '126.65%+9.95%×4', 'Basic ATK follow-up after Umbra: Heavy Attack; considered Heavy Attack DMG.'],
    ['Mid-air', 'Umbra: Plunging Attack', '123.27%', 'Plunging Attack in Dark Surge.'],
    ['Dodge Counter', 'Umbra: Dodge Counter', '316.71%', 'Dodge Counter in Dark Surge.'],
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
    ['Forte', 'Cloudburst Dance', '128.80%+141.47%', 'Mid-air ATK combo, considered Resonance Skill DMG; heals the team on hit.'],
    ['Forte', 'Unbound Flow', '34.30%×5+723.03%', 'At max Windstrings, Resonance Skill becomes this instead; considered Resonance Skill DMG.'],
    ['Liberation', 'Omega Storm', '536.79%', 'Also heals nearby team ~2090+77% ATK; can be cast mid-air near ground.'],
    ['Intro', 'Relentless Squall', '79.53%+119.29%'],
    ['Outro', "Storm's Echo", 'Aeolian Realm — Aero Erosion cap +3 (30s field, no direct DMG)'],
  ],
  'Rover: Electro': [
    ['Basic ATK', 'Deterrence Stage 1-4', '51.08% → 26.00%+39.00% → 13.27%×7 → 72.82%+109.22%'],
    ['Basic ATK', 'Riposte Strike / Crumble (Parry Stance)', '55.95% / 59.43%', 'Hold Basic ATK to enter Parry Stance (immune to interrupt, -60% DMG taken); release for Riposte Strike, or Crumble if it neutralizes a hit.'],
    ['Mid-air', 'Plunging Attack', '104.94%'],
    ['Dodge Counter', 'Standard', '74.25%+74.25%'],
    ['Skill', 'Thunderclap', '100.20%×2', '10s cooldown; grapples toward the target and builds Electric Surge.'],
    ['Basic ATK', 'Repel', '56.12%+84.17%', 'Auto-chains from a single Basic Attack tap right after Thunderclap lands, replacing the normal Basic ATK combo restart.'],
    // Type corrected 2026-09-01 from 'Skill' to 'Forte' to match CHARACTER_ROTATIONS.Rover: Electro's
    // Forte/Overshock step, which never matched the old combined row and was silently resolving to 0 DMG.
    ['Forte', 'Overshock', '80.72%×7+423.77%+423.77%', 'Once Electric Surge is fully capped, Skill becomes this instead — counted as Resonance Skill DMG replacement via the Forte Circuit; TAP to unleash (HOLD enters Apex Resonance instead).'],
    ['Forte', 'Apex Resonance: Thrum of All Sounds', 'TODO: verify — per-stage multipliers not yet sourced', 'Up to 7-stage ground + 6-stage aerial combo (Spectro/Havoc/Aero hits + Thunder Bane Electro pulses); consumes Thunder Rage each second while active.'],
    // Fixed 2026-09-03 against a fresh the source dump: was 1192.86%, real value is 1109.22%.
    ['Liberation', 'Ultimate Tactics', '1109.22%', '25s cooldown.'],
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
    ['Liberation', 'End Loop', 'No direct DMG — Stellarealm heal (438+2.39% HP) every 3s', 'Lv.10 heal amount per tick; verified 2026-08-31 vs. the wiki Combat page (was previously undocumented). 30s duration, 25s CD, costs 175 Energy, grants 20 Concerto on cast. Evolves into Inner (team Crit Rate up to +12.5%) then Supernal Stellarealm (team Crit DMG up to +25%) scaling with her Energy Regen, as allies cast Intro Skills inside it.'],
    ['Intro', 'Proof of Existence: Enlightenment / Discernment', '45.30%×5 + heal (259+1.20% HP) · 19.64%×3 HP-scaling + heal (289+1.32% HP)', 'Discernment Lv.10 heal amount verified 2026-08-31 vs. the wiki Combat page (was previously undocumented). Discernment only available once per Supernal Stellarealm; guaranteed Crit, counted as Liberation DMG, scales off HP not ATK. S6 adds +42% to Discernment\'s own DMG Multiplier and +500% Crit DMG on that hit specifically (not a persistent buff).'],
    ['Outro', 'Binary Butterfly', 'All DMG Amp +15%', 'Also grants the on-field Resonator up to 5 free interrupt-recoveries (tap Dodge) for 30s — no direct DMG.'],
  ],
  'Sigrika': [
    ['Basic ATK', 'Stage 1-4', '52.97% → 50.34%×2 → 33.41%×2+44.54% → 41.36%+51.70%×2+62.03%', 'Standard combo; ends in Decipher state for Echo-type follow-ups.'],
    ['Basic ATK', 'Elucidated', '61.56%×3+123.11%', 'Echo-type finisher from Decipher state; builds Runes.'],
    // 'Dodge Counter - Decipher' row added 2026-09-04 (Phase A audit, fresh dump, zero deference to
    // prior claims): the dump's own Basic Attack section lists "Dodge Counter - Decipher" (in Decipher,
    // post-Dodge ground Normal Attack, Aero DMG, ends Decipher) with the SAME 61.56%×3+123.11% multiplier
    // string as Elucidated — was entirely missing a row/block despite being one of the 4 moves S1's own
    // +70% DMG Multiplier node explicitly names ("Basic - Elucidated / Dodge Counter - Decipher / BIG
    // BOOMY BOOM! / Soliskin to the Aid").
    ['Dodge Counter', 'Decipher', '61.56%×3+123.11%', 'Post-Dodge Echo-type finisher from Decipher state, same multipliers as Elucidated; builds Runes.'],
    ['Skill', 'BOOMY BOOM!', '28.63%×3+57.26%', 'Builds Runes; empowered version deals Echo Skill DMG.'],
    ['Skill', 'BIG BOOMY BOOM!', '28.81%×4+172.85%', 'Decipher-state Skill upgrade, counted as Echo Skill DMG.'],
    // 'Soliskin to the Aid' row added 2026-09-04: the dump lists it as its own Resonance Skill move
    // (in Decipher at >=50 Full Stop, ground Skill press — Echo Skill DMG, ends Decipher) with its own
    // published multiplier 27.83%×3+194.77%, distinct from BIG BOOMY BOOM! — was entirely missing despite
    // being one of the 4 moves S1's node explicitly names.
    ['Skill', 'Soliskin to the Aid', '27.83%×3+194.77%', 'Decipher-state Skill upgrade at >=50 Full Stop, counted as Echo Skill DMG, ends Decipher.'],
    ['Forte', 'Runic Outburst', '117.67%+205.92%+264.75%', 'Rune-consuming Heavy ATK (Trust+Answer): pure bonus DMG, no extra effect.'],
    // 'Runic Chain Whip' split into its own row 2026-09-04: the dump publishes a DISTINCT multiplier
    // string for it (49.70%×4+66.26%×3) from Runic Outburst's — the engine block's prior "no per-variant
    // breakdown published" note was factually wrong, the dump's own Forte Circuit section lists Runic
    // Outburst/Chain Whip/Soliskin as 3 separately-multiplied variants.
    ['Forte', 'Runic Chain Whip', '49.70%×4+66.26%×3', 'Rune-consuming Heavy ATK (2× Trust): Stagnates nearby targets, Aero DMG.'],
    ['Forte', 'Runic Soliskin', '39.76%+59.63%×4+119.26%', 'Rune-consuming Heavy ATK (2× Answer): pulls in nearby targets, Aero DMG. Not used in the standard rotation (only Trust+Trust and Trust+Answer combos occur there).'],
    ['Forte', 'Learn My True Name', '302.87%+908.61%', 'Big Echo-type nuke once Full Stop is maxed.'],
    ['Liberation', 'Where Trust Leads Me!', '861.43%', 'Echo-type Ultimate nuke; also seeds her next Rune.'],
    ['Intro', 'Solsworn Etymology', '163.42%', 'Standard combo-starting opener hit.'],
    ['Outro', 'In This Very Moment', '795%', 'Finishing hit that stagnates enemies on ally Echo Skill casts.'],
  ],
  // Re-verified per-hit at Lv.10 2026-08-31 against the wiki/Verina/Combat's
  // "Attribute Scaling" tables (Chrome UA + google.com referer + jsRender) and cross-checked against
  // the source/character/1503 — every existing % value matched exactly, no numeric corrections needed.
  // Row-name bug fixed: the Forte row was 'Heavy/Mid-air ATK: Starflower Blooms' (using the abbreviation
  // "ATK"), but CHARACTER_ROTATIONS.Verina's Forte step names the move 'Mid-air Attack: Starflower Blooms'
  // (spelled out, matching the wiki's own text) — 'Heavy/Mid-air ATK: Starflower Blooms'.includes('Mid-air
  // Attack: Starflower Blooms') is false (no "ATK"/"Attack" match), so the calc engine's
  // rowName.includes(step.skill) lookup silently resolved that rotation step to ZERO damage. Renamed to
  // 'Heavy/Mid-air Attack: Starflower Blooms' (spelled out, matching both source sites) to fix the match.
  'Verina': [
    ['Basic ATK', 'Cultivation Stage 1-5', '37.86% → 51.16% → 25.58%×2 → 67.32% → 71.62%'],
    ['Heavy ATK', 'Standard', '99.41%'],
    ['Mid-air', 'Stage 1-3 + Heavy', '56.37% → 53.19% → 25.42%×3 · 61.64% (Mid-air Heavy)'],
    ['Dodge Counter', 'Standard', '129.23%'],
    ['Skill', 'Botany Experiment', '35.79%×3+71.58%', '12s cooldown; grants Photosynthesis Energy.'],
    ['Forte', 'Heavy/Mid-air Attack: Starflower Blooms', '64.95%+97.42% (Heavy) · 67.64%+63.82%+30.50%×3 (Mid-air)', 'Consumes 1 Photosynthesis Energy (cap 4) per cast to heal the team (1188 + 29.75% ATK at Lv.10) and restore 12 Concerto Energy.'],
    ['Liberation', 'Arboreal Flourish', '198.81%', '175 Energy, 25s cooldown. Heals the team (950 + 23.80% ATK at Lv.10) and applies a 12s Photosynthesis Mark; marked-target hits trigger a healing Coordinated Attack (9.95% ATK DMG, 428 + 10.71% ATK heal), capped 1/s.'],
    ['Intro', 'Verdant Growth', '99.41%'],
    ['Outro', 'Blossom', 'All-Type DMG Amplify +15% (30s) + heal', 'Heals the incoming Resonator 19% ATK/s for 6s and grants the whole nearby team All-Type DMG Amplify +15% (30s). Corrected 2026-09-02 against a fresh, user-pasted the source text (priority source) — was wrongly noted as "Amplified" (a prior session\'s claim); the kit text explicitly says "Amplify", matching this file\'s own dmgFocus buff-tag entry.'],
  ],
  // Full audit 2026-09-01. Base rows (Probe/Standard/Plunging/Deduction→Decipher/Cogitation
  // Model/Principle/Chain Rule) re-verified verbatim against wuwa.build's character #1305 sheet
  // (Lv.10 exact multipliers, per-hit — not collapsed) — matched this file's pre-existing values
  // exactly, no changes needed there. Two real bugs found and fixed:
  // (1) the combined 'Intuition: Law of Reigns / Revamp' row lumped two different Forte-triggered
  // moves' formulas into one string cell — split into two rows so each is independently addressable.
  // (2) the combined 'Intuition: Pivot-Impale / Divergence / Unfathomed' row lumped THREE different
  // moves under a single `type: 'Liberation'`, when per wutheringwaves.gg/thegamer.com's Forte
  // breakdown only Unfathomed (the Dodge Counter replacement) is actually "counted as Resonance
  // Liberation DMG" — Pivot-Impale (Basic ATK replacement) and Divergence (Resonance Skill
  // replacement) are their own native DMG types. Split into 3 rows with correct `type` per move
  // (matches this file's `type === step.type && n.includes(step.skill)` row-lookup convention —
  // the old lumped rows meant CHARACTER_ROTATIONS steps for Divergence/Pivot-Impale/Revamp/Law of
  // Reigns could never resolve a dmg row at all, a zero-damage-display bug).
  'Xiangli Yao': [
    ['Basic ATK', 'Probe Stage 1-5', '33.11%×2 → 99.61% → 39.76%×3 → 53.05%×2+26.53% → 198.81%'],
    ['Heavy ATK', 'Standard', '82.81%×2'],
    ['Mid-air', 'Plunging Attack', '123.27%'],
    ['Dodge Counter', 'Standard', '238.58%'],
    ['Skill', 'Deduction → Decipher', '198.81% → 397.82%', '5s cooldown; at 100 Capacity, Skill becomes Decipher instead (Liberation DMG).'],
    ['Forte', 'Law of Reigns', '95.73%×4+255.28%', 'Skill auto-replaced once Performance Capacity hits 5/5 in Intuition; consumes 1 of 3 Hypercubes per cast, counted as Resonance Liberation DMG per wutheringwaves.gg.'],
    ['Forte', 'Revamp', '21.87%×4+65.61%×2', 'Mid-air Attack cast right after Divergence/Decipher; grants 3 Performance Capacity per hit, counted as Resonance Liberation DMG per wutheringwaves.gg.'],
    ['Liberation', 'Cogitation Model', '1466.06%', '25s cooldown; enters Intuition (24s) — enhances Basic ATK, Skill, and Dodge Counter.'],
    ['Basic ATK', 'Intuition: Pivot-Impale', '119.67% → 60.92%×4 → 133.25%×2', 'Basic/Heavy ATK replacement in Intuition (3-stage combo); Stage 1 hit grants 1 Performance Capacity, Stage 2/3 hits grant 2 each (5 total). Counted as Basic ATK DMG, NOT Liberation DMG, per wutheringwaves.gg — previously mis-lumped under a Liberation-type row.'],
    ['Skill', 'Intuition: Divergence', '49.59%×3+173.55%×2', 'Resonance Skill replacement in Intuition; grants 2 Performance Capacity per cast. Counted as Skill DMG, NOT Liberation DMG, per wutheringwaves.gg — previously mis-lumped under a Liberation-type row.'],
    ['Dodge Counter', 'Intuition: Unfathomed', '38.83%×2+310.58%', 'Dodge Counter replacement in Intuition; grants 2 Performance Capacity per cast. Counted as Resonance Liberation DMG per wutheringwaves.gg (the one sub-move of the old lumped row that really was Liberation-type).'],
    ['Intro', 'Principle', '99.41%×2'],
    ['Outro', 'Chain Rule', '237.63% ATK ×3 procs (8s, 2s ICD)', "Laser strikes on the incoming Resonator's first Basic ATK hit — pure DMG proc, no team buff."],
  ],
  // Re-verified per-hit at Lv.10 2026-08-31 against the wiki/Yinlin/Combat's
  // "Attribute Scaling" tables (re-fetched, Chrome UA + google.com referer + jsRender, 2 attempts needed
  // past a Cloudflare interstitial) — Basic ATK (28.81%/33.82%×2/13.99%×7/75.16%), Heavy ATK (29.83%×2),
  // Mid-air (123.27%), Dodge Counter (24.22%×7), Magnetic Roar (59.65%×3), Lightning Execution (89.47%×4,
  // 12s CD confirmed), Chameleon Cipher (178.93%×2), Judgment Strike (78.64%), Thundering Wrath (116.56%×7,
  // 16s CD confirmed), and Raging Storm (14.32%×10) all matched this file's existing values exactly at
  // Lv.10 (not Lv.1 — cross-checked against the source's Lv.1 table, which shows visibly smaller numbers
  // e.g. Basic ATK Stage 1 14.49% vs. this file's correct 28.81%, confirming this row was NOT accidentally
  // Lv.1 data). No changes needed to any of those rows.
  // TODO: verify — Electromagnetic Blast's 19.89% could not be confirmed: neither the wiki's Magnetic Roar
  // "Attribute Scaling" table nor the source's multiplier tables list a distinct value for it (both only
  // publish Magnetic Roar Damage and Lightning Execution Damage under that skill's scaling table);
  // kept as-is rather than guessing, pending a source that actually publishes this figure.
  'Yinlin': [
    ['Basic ATK', "Zapstring's Dance Stage 1-4", '28.81% → 33.82%×2 → 13.99%×7 → 75.16%'],
    ['Heavy ATK', 'Standard', '29.83%×2'],
    ['Mid-air', 'Plunging Attack', '123.27%'],
    ['Dodge Counter', 'Standard', '24.22%×7'],
    ['Skill', 'Magnetic Roar → Lightning Execution', '59.65%×3 → 89.47%×4', '12s cooldown; Magnetic Roar puts Yinlin in Execution Mode, applies Sinner\'s Mark.'],
    ['Skill', 'Electromagnetic Blast', '19.89%', 'Basic ATK/Dodge Counter hits (up to 4) trigger this on Sinner\'s/Punishment-marked targets.'],
    ['Forte', 'Chameleon Cipher', '178.93%×2', 'At full Judgement Points, Heavy ATK becomes Chameleon Cipher: upgrades Sinner\'s Mark to Punishment Mark.'],
    ['Forte', 'Judgment Strike', '78.64% (1/s)', 'Coordinated ATK triggered when a Punishment Mark target takes damage; considered Coordinated ATK DMG (corrected 2026-09-03 from a self-contradictory "considered Skill DMG" note).'],
    ['Liberation', 'Thundering Wrath', '116.56%×7', '16s cooldown; applies Sinner\'s Mark.'],
    ['Intro', 'Raging Storm', '14.32%×10', 'Applies Sinner\'s Mark.'],
    ['Outro', 'Strategist', 'Electro DMG Amp +20% + Liberation DMG Amp +25% (14s)', 'Grants the incoming Resonator these buffs; no direct DMG.'],
  ],
  // Corrected 2026-08-17 against the source's character #1507 sheet (Lv.10 skill attributes): every
  // damage row was roughly half its real value (e.g. her core Inferno-Mode finisher Heavy Slash Nightfall
  // was listed as '68% + 132% (+5% per Blaze)' vs the real 135.20%+262.43% with +9.95% per Blaze), the
  // same halving pattern already found and fixed across Camellya/Carlotta/Roccia/Phoebe/Brant/
  // Cantarella's rows. Outro (150%, matching the source's Lv.1 value exactly) was already correct.
  // Re-verified in full 2026-08-31 against the wiki/Zani/Combat's "Attribute Scaling"
  // tables (Lv.10/max-skill-level column, matching this file's existing convention) cross-checked against
  // the source/wuthering-waves/characters/zani's Kit tab — every pre-existing row (Basic ATK, Heavy ATK,
  // Pinpoint Strike, Targeted Action, Heavy Slash Daybreak/Dawning/Nightfall, Rekindle, The Last Stand,
  // Immediate Execution, Beacon For the Future) matched source exactly, no numeric corrections needed. One row
  // was genuinely MISSING, not wrong: Heavy Slash - Lightsmash — a 4th Forte Heavy Slash (the parry payoff of
  // Scorching Light's Ready Stance, cast automatically if Zani is hit before releasing into Daybreak) that
  // both sources list as its own Forte multiplier and that Resonance Chain S6 explicitly buffs alongside
  // Daybreak/Dawning/Nightfall — added below, sharing Dawning's exact DMG value per source (both rows are
  // numerically identical at every level, including Lv.10's 424.07%).
  // Fixed 2026-09-03 against a real browser snapshot. 3 real, sourced lookup bugs (all
  // already flagged in data-integrity.test.js's KNOWN_UNRESOLVED_BASELINE as known gaps — now
  // resolved with real data, not guessed): (1) 'Skill: Standard Defense Protocol' had NO row at all —
  // added (63.94%). (2) 'Skill: Targeted Action / Forcible Riposte' never substring-matched the old
  // 'Targeted Action' row name (findSkillMultiplierRow's fuzzy match requires the ROW name to CONTAIN
  // the step's skill string, and 'Targeted Action' does not contain the longer combined step string)
  // — renamed to match, using Forcible Riposte's own real value (identical to Targeted Action's, per
  // the source's own two separate Multipliers rows). (3) The 3 'Heavy Slash <Name>' rows (no colon)
  // never matched the real rotation steps 'Heavy Slash: <Name>' (with colon) — added colons, plus a
  // new combined row for the "repeat the whole string" 2nd-pass step. Also resolves a long-standing
  // TODO: the exact Daybreak/Dawning Blaze costs (10/20) were previously "commonly-cited, not
  // independently confirmed" — the source's own Review text now states them explicitly ("Daybreak
  // consumes 10 Blaze, Dawning consumes 20 Blaze").
  'Zani': [
    ['Basic ATK', 'Stage 1-4', '58.9% → 79.5% → 127.3% → 270.4%', 'Standard combo string.'],
    // Added 2026-09-03: the rotation's own 'Basic ATK: Stage 3' step (exiting Standard Defense
    // Protocol's block stance) never substring-matched the combined 'Stage 1-4' row above (the row
    // name doesn't CONTAIN the shorter step string) — a 4th real lookup gap, added as its own row.
    ['Basic ATK', 'Stage 3', '127.3%', "Exits Standard Defense Protocol's block stance manually."],
    ['Heavy ATK', 'Standard', '41.1%×4', 'Charged combo hit.'],
    ['Skill', 'Standard Defense Protocol', '63.94%', 'Base Resonance Skill hit before the block-stance follow-up.'],
    ['Skill', 'Pinpoint Strike', '61.0% + 122.0%', 'Parry payoff of Standard Defense Protocol.'],
    ['Skill', 'Targeted Action / Forcible Riposte', '86.2% + 28.7% + 172.4%', 'Both are the same value: Targeted Action (unhit release) and Forcible Riposte (parry variant) of Crisis Response Protocol.'],
    ['Forte', 'Heavy Slash: Daybreak', '198.8%', 'First stage of her Forte-empowered Heavy ATK; consumes 10 Blaze.'],
    ['Forte', 'Heavy Slash: Dawning', '424.1%', 'Second, stronger stage of the Forte Heavy ATK; consumes 20 Blaze.'],
    ['Forte', 'Heavy Slash: Nightfall', '135.2% + 262.4% (+9.95% per Blaze)', 'Forte finisher, consumes up to 40 Blaze; scales with consumed Blaze.'],
    ['Forte', 'Heavy Slash: Daybreak → Dawning → Nightfall', '198.8% + 424.1% + 135.2%+262.4%(+9.95%/Blaze)', "2nd full pass of the 3-hit string, same per-hit values as the 1st pass — the rotation's own step collapses the 3 stages into one combined entry."],
    // added 2026-08-31 via the wiki/Zani/Combat + the source cross-check — was missing
    // entirely; parry payoff of the pre-Daybreak Ready Stance, same DMG as Dawning at every level.
    ['Forte', 'Heavy Slash: Lightsmash', '424.1%', 'Parry counter cast automatically if Zani is hit during Scorching Light\'s Ready Stance, before releasing into Daybreak.'],
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
  // Presence" — the real name is "Momentary Union") that didn't match any real the wiki skill name, so
  // getSkillIcon() could never resolve an icon for them. Replaced with real Lv.10 Attribute Scaling
  // values and exact move names from the wiki's Combat pages (Forte Details tables),
  // matching the Suisui-quality format (real names + desc column) instead of the old placeholder style.
  // Full audit 2026-09-01 against the wiki/Aalto/Combat, cross-checked against
  // the source/character/1403 (both agree exactly) — every pre-existing value was already correct.
  // Added the two entirely missing rows (Mid-air Attack, Dodge Counter).
  'Aalto': [
    ['Basic ATK', 'Half Truths Stage 1-5', '31.81% → 53.02% → 47.72%×2 → 50.37%×2 → 179.73%', 'Up to 5 shots; Basic ATK 4 spreads Mist for 1.5s.'],
    ['Mid-air', 'Attack', '59.65%'],
    ['Dodge Counter', 'Standard', '214.12%'],
    ['Heavy ATK', 'Half Truths (aimed shot)', '35.79% → 80.52% fully charged', 'Charged aimed shot.'],
    ['Skill', 'Shift Trick', '59.65% per Mist Bullet', 'Mist Avatar taunts enemies and fires Mist Bullets around it.'],
    ['Liberation', 'Flower in the Mist', '397.62%', 'Gate of Quandary amplifies bullets passing through it.'],
    ['Forte', 'Misty Cover', '59.65% per Mist Bullet', 'Mistcloak Dash consumes Mist Drops to fire Mist Bullets.'],
    ['Intro', 'Feint Shot', '66.27%×3', 'Rapid continuous shooting on entry.'],
    ['Outro', 'Dissolving Mist', '+23% Aero DMG Amp (14s)', 'Buffs the incoming Resonator.'],
  ],
  // Full audit 2026-09-01 against the wiki/Baizhi/Combat, cross-checked against
  // the source/character/1103 (both agree exactly) — every pre-existing value was already correct.
  // Added the two entirely missing rows (Mid-air Attack, Dodge Counter).
  'Baizhi': [
    ['Basic ATK', "Destined Promise Stage 1-4", '65.48% → 78.57% → 13.10%×7 → 78.57%', "Up to 4 You'tan-commanded strikes."],
    ['Mid-air', 'Attack', '78.89%'],
    ['Dodge Counter', 'Standard', '178.65%'],
    ['Heavy ATK', "Destined Promise (channel)", '48.86%/s', "Continuous You'tan attacks; Baizhi can reposition You'tan during the channel."],
    ['Skill', 'Emergency Plan', '15.94% + healing', "Immediate team heal plus a Glacio hit from You'tan."],
    ['Liberation', 'Momentary Union', 'Team heal + 4x Remnant Entities (4.07% each)', 'Remnant Entities auto-attack and heal every 2.5s.'],
    ['Forte', 'Cycle of Life', 'Heals via up to 4 Concentration stacks', 'Heavy ATK/Skill consumes Concentration for continuous team healing.'],
    ['Intro', 'Overflowing Frost', '79.53% + heal', "You'tan plunging attack that also heals the team."],
    ['Outro', 'Rejuvinating Flow', 'Heal 1.54% Max HP/3s (30s) + 15% DMG Amp (6s)', 'Buffs and sustains the incoming Resonator.'],
  ],
  // corrected 2026-08-18: replaced the old generic "Stage 1-3" placeholder (fabricated move names
  // "Electro Spark"/"Lightning Storm"/"Static Entry"/"Discharge" don't exist on the real kit, and the
  // Outro "+12% Electro DMG" was wrong — her real Outro carries no elemental DMG buff at all, only a
  // general team DMG Amp, see CHAR_BUFF_TABLE above) with real move names and Lv.10 Attribute Scaling
  // values from the wiki/Buling/Combat's Forte Details table (rendered — the raw
  // wikitext only transcludes {{Skill Upgrade|Buling|totalOnly}}), cross-checked against the source's own
  // Kit tab (identical multiplier text). Trigram-consuming Heavy Attacks, Mid-air Attack, Dodge Counter,
  // and the enhanced Forte Circuit Liberation (Flashing Thunder Spell: Harmony) were entirely missing.
  'Buling': [
    ['Basic ATK', 'Hexagram Calls, Lightning Falls: Stage 1', '20.73%×2', 'First 2 hits of the up-to-4-hit Basic ATK combo.'],
    ['Basic ATK', 'Hexagram Calls, Lightning Falls: Stage 2', '33.45%×2', 'Grants Trigram - Mountain on hit.'],
    ['Basic ATK', 'Hexagram Calls, Lightning Falls: Stage 3', '23.51%×2', 'Also reachable via Dodge Counter.'],
    ['Basic ATK', 'Hexagram Calls, Lightning Falls: Stage 4', '93.64%', 'Grants Trigram - Thunder on hit; can be chained right after Resonance Skill.'],
    ['Basic ATK', 'Mid-air Attack', '73.96%', 'Consumes STA; grants Trigram - Thunder on hit.'],
    ['Basic ATK', 'Heavy Attack - Mountain Over Thunder', '178.93%', 'Consumes 1 Trigram - Mountain + 1 Trigram - Thunder (in that order); grants Minor Yang.'],
    ['Basic ATK', 'Heavy Attack - Thunder Over Mountain', '89.47%', 'Consumes 1 Trigram - Thunder + 1 Trigram - Mountain (in that order); small DMG, also reduces target Vibration Strength; grants Minor Yang.'],
    // Flat values corrected 2026-09-01: were 360/85 (roughly half the real 716/169) for the two rows below.
    ['Basic ATK', 'Heavy Attack - Twin Mountains', '716 flat + 135.20% ATK', 'Consumes 2 Trigram - Mountain; heals all nearby team Resonators instead of dealing full DMG; grants Minor Yin.'],
    ['Basic ATK', 'Heavy Attack - Twin Thunders', '169 flat + 18.30% ATK', 'Consumes 2 Trigram - Thunder; heals all nearby team Resonators once/s for 8s; grants Minor Yin.'],
    ['Skill', 'In Shadow Thunder Stirs: Thunder Talisman', '58.40%', 'Pulls in nearby targets; can chain into Basic Attack Stage 4 right after cast.'],
    ['Skill', 'In Shadow Thunder Stirs: Pull-in Effect', '5.84%×10', 'Continuous DMG while pulling targets in.'],
    ['Liberation', 'Flashing Thunder Spell', '357.86%', 'Base-kit Liberation, used when Buling lacks both Minor Yin and Minor Yang.'],
    ['Liberation', 'Flashing Thunder Spell: Harmony', '536.79%', "Forte Circuit enhancement — replaces the base Liberation once both Minor Yin and Minor Yang are held (Yin-Yang Balance); generates a Five Thunders Spell Array."],
    ['Liberation', 'Five Thunders Spell Array', '19.89% per tick', '2 stacks of Electro Flare inflicted on all targets in range every 2s for 24s; ramps team Resonance Skill DMG Bonus on ally Intro casts (see CHAR_BUFF_TABLE).'],
    ['Intro', 'Summon and Smite', '131.10%', 'Heals all nearby team Resonators on cast; Inherent Skill grants 4 Electro Flare stacks to targets hit (once per 10s).'],
    ['Outro', 'Exorcism Spell', 'No DMG (Heal + 15% team DMG Amp, 30s)', "Heals the active Resonator by 18% of Buling's ATK/s for 16s. All nearby team Resonators have DMG Amplified by 15% for 30s."],
  ],
  // Full audit 2026-09-01 against the wiki/Chixia/Combat, cross-checked against
  // the source/character/1202 (both agree exactly) — every pre-existing value was already correct.
  // Added the two entirely missing rows (Mid-air Attack, Dodge Counter).
  'Chixia': [
    ['Basic ATK', 'POW POW Stage 1-4', '66.21% → 48.32%×2 → 33.55%×4 → 232.61%', 'Up to 4 shots.'],
    ['Mid-air', 'Attack', '32.21%'],
    ['Dodge Counter', 'Standard', '339.97%'],
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
  // exist anywhere on the wiki; her real Liberation is "Crimson Bloom" and Intro is "Vindication".
  // Replaced with real Lv.10 values and exact move names from each character's the wiki Combat page.
  // Full audit 2026-09-01 against the wiki/Danjin/Combat, cross-checked against
  // the source/character/1602 (both agree exactly) — every damage value was already correct. Corrected
  // the Outro's mechanic label from "Amplify" to "Amp" (see CHARACTER_DATA.Danjin's comment above) and
  // added the two entirely missing rows (Mid-air Attack, Dodge Counter).
  'Danjin': [
    ['Basic ATK', 'Execution Stage 1-3', '57.26% → 58.85% → 79.53%', 'Up to 3 consecutive Havoc strikes.'],
    ['Mid-air', 'Attack', '98.61%'],
    ['Dodge Counter', 'Standard', '63.62%×3'],
    ['Heavy ATK', 'Execution (hold)', '37.12%×3', 'Consumes HP-fueled Forte; heals if Forte Gauge ≥50%.'],
    ['Skill', 'Crimson Fragment: Carmine Gleam', '38.18%×2', 'Base Skill hit; costs 3% Max HP per attack.'],
    ['Skill', 'Crimson Erosion', '64.42%×2 → 59.65%×2', 'After Basic ATK 2/Dodge Counter/Intro; applies Incinerating Will (+20% DMG taken).'],
    ['Skill', 'Sanguine Pulse', '56.07%×2 → 42.95%×3 → 64.42%×3', 'After Basic ATK 3, up to 3 consecutive strikes.'],
    ['Forte', 'Serene Vigil: Chaoscleave', '59.65%×7', 'At 60+ Ruby Blossom, Heavy ATK finisher; heals Danjin.'],
    // Scatterbloom value corrected 2026-09-03 (was 178.93%, source is exactly 179%); 2 Full Energy rows
    // added the same pass — real, higher-tier (~2.4x) variants at 120+ Ruby Blossom, used in the
    // "Damage Dealer Combo" rotation this source names but not the one currently modeled here.
    ['Forte', 'Serene Vigil: Scatterbloom', '179%', 'Basic ATK follow-up after Chaoscleave.'],
    ['Forte', 'Serene Vigil: Chaoscleave (Full Energy)', '143.15%×7', 'At 120+ Ruby Blossom, consumes 120 to empower this and the following Scatterbloom instead of the half-power version above.'],
    ['Forte', 'Serene Vigil: Scatterbloom (Full Energy)', '429.43%', 'Basic ATK follow-up after a Full Energy Chaoscleave.'],
    ['Liberation', 'Crimson Bloom', '49.09%×8 + 392.65% Scarlet Burst', 'Rapid Havoc combo plus a Scarlet Burst finisher; consumes HP per hit.'],
    ['Intro', 'Vindication', '49.71%×4', 'Unwavering strike; can chain into Crimson Erosion.'],
    ['Outro', 'Duality', '+23% Havoc DMG Amp (14s)', 'Buffs the incoming Resonator.'],
  ],
  // corrected 2026-08-18: replaced the old generic "Stage 1-3" placeholder (fabricated move names
  // "Luminal Strike"/"Daybreak Signal"/"Light Surge" don't exist on the real kit, and the Outro
  // "Radiant Blessing"/"+12% Glacio DMG" was doubly wrong — Lumi is Electro, not Glacio, and her real
  // Outro buffs Resonance Skill DMG, not elemental DMG) with real move names and Lv.10 Attribute Scaling
  // values from the wiki/Lumi/Combat's Forte Details table (rendered — the raw
  // wikitext only transcludes {{Forte Table|Lumi}}), cross-checked against the source's own Kit tab
  // (identical multiplier values). Her dual Yellow Light (ranged)/Red Light (melee) Basic ATK stances,
  // Signal Light Forte Circuit's Energized Pounce/Rebound/Glare/Red Spotlight/Laser rows, and Heavy
  // ATK/Plunging Attack/Dodge Counter rows were entirely missing before.
  'Lumi': [
    ['Basic ATK', 'Yellow Light: Basic Attack', '31.81%×3', 'Summon Squeakie to shoot three shots in a row; ranged Basic ATK in Yellow Light Mode.'],
    ['Basic ATK', 'Glitter', '63.62%', 'Yellow Light: Zoom auto-shoot at a locked-on target after a Dodge; considered Basic Attack DMG.'],
    ['Basic ATK', 'Yellow Light: Plunging Attack', '95.43%', 'Consumes STA; plunging attack in Yellow Light Mode.'],
    ['Basic ATK', 'Red Light: Basic Attack', '90.66% → 107.66%+21.54%×5 → 64.60%+150.72%', 'Up to 3 consecutive melee strikes in Red Light Mode.'],
    ['Basic ATK', 'Red Light: Heavy Attack', '66.11%×2', 'Consumes STA; strikes the ground with Squeakie, considered Basic Attack DMG.'],
    ['Basic ATK', 'Red Light: Plunging Attack', '113.33%', 'Consumes STA; plunging attack in Red Light Mode.'],
    ['Basic ATK', 'Red Light: Dodge Counter', '167.30%+33.46%×5', 'Basic ATK right after a successful Dodge in Red Light Mode.'],
    ['Skill', 'Pounce', '181.32%', 'Yellow Light Mode: pounce onto the target, switching to Red Light Mode; free of STA cost when switched onto the field.'],
    ['Skill', 'Rebound', '173.76%', 'Red Light Mode: leap backward and attack, switching to Yellow Light Mode.'],
    ['Liberation', 'Squeakie Express', '954.29%', 'Throw the giant Squeakie at the target, dealing Electro DMG. 20s CD, 125 Resonance Cost.'],
    ['Forte', 'Glare', '81.52%', "Yellow Spotlight Mode: replaces Glitter with a higher DMG Multiplier after Energized Rebound; ends after 6 Glares."],
    ['Forte', 'Red Spotlight: Basic Attack', '120.25% → 138.32%+27.67%×5 → 93.73%+218.69%', 'Enhanced 3-hit Basic ATK combo during Red Spotlight Mode (after Energized Pounce).'],
    ['Forte', 'Red Spotlight: Heavy Attack', '88.18%×2', 'Enhanced Heavy Attack during Red Spotlight Mode.'],
    ['Forte', 'Energized Pounce', '183.31%×2', 'Resonance Skill replacement when Yellow Light Spark is full; Electro DMG counted as Basic Attack DMG, enters Red Spotlight Mode.'],
    ['Forte', 'Energized Rebound', '251.70%', 'Resonance Skill replacement when Red Light Spark is full; Electro DMG counted as Basic Attack DMG, enters Yellow Spotlight Mode.'],
    ['Forte', 'Laser', '74.56%×1-4', 'Outro Skill consumes all Sparks; Electro DMG counted as Basic Attack DMG, up to 4 beams (1 extra beam per 25 Sparks consumed).'],
    ['Intro', 'Special Delivery', '56.33%×3', 'Enter Yellow Light Mode and attack the target, dealing Electro DMG.'],
    ['Outro', 'Escorting', 'No DMG (Resonance Skill DMG Amp +38%, 10s)', 'The incoming Resonator has their Resonance Skill DMG Amplified by 38% for 10s or until they are switched out.'],
  ],
  // corrected 2026-08-18: replaced the old generic "Stage 1-4" placeholder values (fabricated move names
  // "Violent Crescendo"/"Fury Overture"/"Flame Reprise" don't exist on the real kit at all) with real
  // Lv.10 Attribute Scaling values and move names from the wiki/Mortefi/Combat's
  // Forte Details table (rendered — the raw wikitext only transcludes {{Forte Table|Mortefi}}), cross-
  // checked against the source's own Kit tab. Basic ATK's real 4-part combo, Heavy ATK/Mid-air/Dodge Counter
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
  // Full audit 2026-09-01 against the wiki/Sanhua/Combat, cross-checked against
  // the source/character/1102 (both agree exactly) — every damage value was already correct. Added the
  // two entirely missing rows (Mid-air Attack, Dodge Counter).
  'Sanhua': [
    ['Basic ATK', 'Frigid Light Stage 1-5', '48.71% → 73.76% → 21.58%×4 → 39.67%×2 → 233.81%', 'Up to 5 Glacio strikes.'],
    ['Mid-air', 'Attack', '86.29%'],
    ['Dodge Counter', 'Standard', '167.01%'],
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
  // the wiki/Taoqi/Combat's Forte Details table. Liberation is real-name
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
  // Full audit 2026-09-01 against the wiki/Yangyang/Combat, cross-checked against
  // the source/character/1402 (both agree exactly) — every damage value was already correct. Added the
  // two entirely missing rows (Mid-air Attack, Dodge Counter).
  'Yangyang': [
    ['Basic ATK', 'Feather as Blade Stage 1-4', '44.73% → 59.64% → 46.81%×2 → 59.36%×2+79.15%', 'Up to 4 consecutive Aero strikes.'],
    ['Mid-air', 'Attack', '92.44%'],
    ['Dodge Counter', 'Standard', '87.07%×2'],
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
  // the wiki/Youhu/Combat's Forte Details table (rendered section-by-section via
  // the MediaWiki API). No Basic ATK/Heavy ATK/Mid-air/Dodge Counter rows exist in her Forte Details
  // table at all (unlike Yuanwu/Mortefi) — her 4-part Basic Attack combo and Heavy ATK: Frostfall have no
  // published DMG% scaling on the wiki or the source, so none are invented here.
  // Full audit 2026-09-01 against the wiki/Youhu/Combat, cross-checked against
  // the source/character/1106 (both agree exactly). Fixed a real zero-damage rotation bug:
  // CHARACTER_ROTATIONS.Youhu's 'Basic ATK'/'Frosty Punches' step had no matching row at all — her entire
  // Basic ATK combo was missing from this table. Added that plus the other missing moves (Heavy Attack:
  // Frostfall, Mid-air Attack, Dodge Counter).
  'Youhu': [
    ['Basic ATK', 'Frosty Punches Stage 1-4', '47.38% → 31.91%+59.26% → 38.06%+46.52% → 116.35%'],
    ['Heavy ATK', 'Frostfall', '14.45%×6', 'At full Frost, dashes forward and performs a Lucky Draw.'],
    ['Mid-air', 'Attack', '123.27%'],
    ['Dodge Counter', 'Standard', '28.89%×6', 'Only available while holding no Antique; performs a Lucky Draw.'],
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
  // the wiki/Yuanwu/Combat's Forte Details table (rendered, since the raw
  // wikitext only transcludes the {{Forte Table}} template). Skill's off-field Coordinated ATK and
  // Forte Circuit's Thunder Wedge Detonation/Rumbling Spark/Thunder Uprising/Thunderweaver rows were
  // entirely missing. Outro Lightning Manipulation has no DMG multiplier at all (pure Vibration
  // Strength depletion) — the old "+15% Liberation DMG Amp" value had no basis anywhere on the page.
  // Full audit 2026-09-01 against the wiki/Yuanwu/Combat, cross-checked against
  // the source/character/1303 (both agree exactly) — every pre-existing value was already correct.
  // Added the three entirely missing Lightning Infused enhanced-state rows.
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
    ['Basic ATK', 'Lightning Infused Stage 1-5', '24.56% → 25.91%×2 → 10.92%×2+16.38%×2 → 11.46%×5 → 16.37%×3+32.74%', 'Enhanced Basic ATK combo while in Lightning Infused.'],
    ['Heavy ATK', 'Lightning Infused (hold)', '31.02%', 'Enhanced Heavy ATK while in Lightning Infused.'],
    ['Dodge Counter', 'Lightning Infused', '43.27%+32.45%×2', 'Enhanced Dodge Counter while in Lightning Infused.'],
    ['Outro', 'Lightning Manipulation', 'No DMG (Vibration Strength depletion)', 'Thunderbolts centered on the skill target; deals no DMG, greatly depletes enemy Vibration Strength.'],
  ],
};

// [SECTION:CHARACTER_ROTATIONS] — Standard rotation, sourced from the source's "Gameplay and teams" tab per character.
// Each step's `type` + `skill` are matched against SKILL_MULTIPLIERS[name] (type === step.type, name.includes(step.skill))
// to look up its DMG multiplier at render time — single source of truth, no duplicated numbers to drift out of sync.
// `duration` (seconds) is only set for steps with a notable buff/stance/channel window worth highlighting.
// Built as a reusable base: Team tab can later prepend/append other characters' Intro/Outro to chain these together.
const CHARACTER_ROTATIONS = {
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Cantarella (2026-08-17,
  // Chrome UA + google.com referer + jsRender). This section was previously entirely missing for her.
  // Re-verified and expanded 2026-08-31 against both the wiki/Cantarella/Combat (exact
  // Trance/Shiver/Mirage/Abyssal Rebirth mechanics and durations) and the source's Gameplay tab (rotation step
  // order, unchanged from the 2026-08-17 pass). Corrections: the Heavy ATK step's `skill` field was 'Delusive
  // Dive' with no matching SKILL_MULTIPLIERS row (fixed above — see that section's comment) so this step was
  // previously resolving to 0 DMG. Also added Mirage's exact 8s/Trance-depletion end condition, Perception
  // Drain's exact 18s cooldown and Flowing Suffocation's exact 25s cooldown/125 Energy cost (both previously
  // undocumented cast-order/timing dependencies), and the Trance/Shiver point-by-point accounting per step.
  'Cantarella': [
    { type: 'Intro', skill: 'Cruise', note: 'Swap into her — fires automatically. This specific variant ("Ripple") makes her next Basic Attack skip straight to Stage 3 instead of starting over at Stage 1, and grants 1 Trance (0→1/5).' },
    { type: 'Basic ATK', skill: 'Illusion Collapse Stage 3', note: 'Tap Basic Attack ONCE — since Intro primed her to start at Stage 3, this single tap lands Stage 3 (72.57%×2) and grants 1 more Trance (1→2/5).' },
    { type: 'Skill', skill: 'Dance with Shadows', note: 'Press Skill (Graceful Step, 73.60%×2, 6s cooldown) — grants 1 more Trance (2→3/5) and 10 Concerto Energy regen.' },
    { type: 'Liberation', skill: 'Beneath the Sea', note: 'Press Liberation (Flowing Suffocation, 376.00%, 125 Energy cost, 25s cooldown) — grants 3 Trance at once, overcapping to the 5 max (needed for Concerto Energy even though 1 point is "wasted"), and applies Diffusion: for the next 30s (or until 21 Dreamweavers are summoned), every hit she or the team lands summons up to 1 Coordinated Attack per second (14.54%×21 total if fully consumed).' },
    { type: 'Heavy ATK', skill: 'Delusive Dive', note: 'HOLD Heavy Attack now that Trance is capped — this consumes all 5 Trance for 53.05%×2 DMG and launches her into "Mirage" state, which lasts a hard 8s or ends earlier the instant Trance hits 0 inside it, whichever comes first.' },
    { type: 'Skill', skill: 'Flickering Reverie', note: 'While in Mirage her Skill is replaced by this one (196.23%, considered an Echo Skill cast) and its cooldown is already reset — press Skill again immediately. Inflicts Hazy Dream (6.5s slow; the next hit the target takes triggers a follow-up Jolt hit for 198.81% Havoc DMG, considered Basic ATK DMG, and removes Hazy Dream — only her own hits or Coordinated ATK/Utility damage can trigger this consistently, a teammate\'s direct hit also consumes it without necessarily landing the Jolt).' },
    { type: 'Forte', skill: 'Phantom Sting 1-3', note: 'While still in Mirage, tap Basic Attack 3 times in a row (her Basic Attack is replaced by this combo automatically: 35.33%×3 → 62.93%×2 → 64.62%×4) — each hit that lands consumes 1 Trance to build 1 Shiver, capping at 3.' },
    { type: 'Forte', skill: 'Perception Drain', note: 'Once Shiver hits 3, her Skill button becomes this automatically (18s cooldown once cast) — press Skill to consume all 3 Shiver for a burst nuke (667.99%×2, considered Basic ATK DMG, also counted as an Echo Skill cast) that also heals the whole team and re-applies Hazy Dream.' },
    { type: 'Echo', skill: 'Swap Cancel', note: 'Use your equipped Echo\'s skill right after Perception Drain, then immediately swap out — this cuts off the Echo animation without losing its effect and triggers her Outro.' },
    { type: 'Outro', skill: 'Gentle Tentacles', duration: 14, note: 'Triggers automatically the moment you swap out. Grants the incoming Resonator +20% Havoc DMG and +25% Resonance Skill DMG for 14s — this buff is forfeited early if that Resonator is swapped out before the 14s expires.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Brant (2026-08-17, Chrome
  // UA + google.com referer + jsRender). This section was previously entirely missing for him. Exact
  // conditional mechanics (Aflame's Bravo-gain doubling scope, Interlude Applause's forfeit condition,
  // Returned from Ashes' shield duration, Outro's swap-forfeit) verified 2026-08-31 against
  // the wiki/Brant/Combat (Chrome/Windows UA + google.com referer + jsRender).
  'Brant': [
    { type: 'Intro', skill: 'Applaud for Me!', note: 'Swap into him — fires automatically. Fills a quarter of his Forte gauge ("Bravo") and grants Interlude Applause: his next Mid-air Attack starts at Stage 2 instead of Stage 1. Interlude Applause is FORFEITED (removed with no effect) if he lands early or is swapped out before that next Mid-air Attack.' },
    { type: 'Liberation', skill: 'To the Horizon', note: 'Cast Liberation right after Intro — heals the team, instantly puts Brant airborne (skipping the slow jump-up), and enters Aflame for 12s: Bravo gain from Basic ATK and Resonance Skill hits is doubled (Intro Skill\'s Bravo gain is NOT boosted), and his passive ATK-from-ER conversion is upgraded from Theatrical Moment to the stronger "My" Moment for the duration.' },
    { type: 'Mid-air', skill: 'Stage 2-3 + Charged Attack + Flip', note: 'While airborne, HOLD Basic Attack and keep holding — he automatically chains Mid-air Attack Stage 2 into a Charged Attack, backflips, then continues into Stage 3. This is his main way to fill the rest of Bravo; just keep holding until the gauge is full.' },
    { type: 'Forte', skill: 'Returned from Ashes', note: 'Once Bravo hits 100, his Skill button becomes this automatically — press Skill to consume all 100 Bravo for a massive hit (counted as Basic ATK DMG) that also grants the team a shield lasting 30s. If cast while Aflame is still active, Aflame ends once this cast finishes.' },
    { type: 'Outro', skill: 'The Course is Set!', duration: 14, note: 'Swap out right after Returned from Ashes to trigger this automatically. Grants the incoming Resonator +20% Fusion DMG and +25% Resonance Skill DMG for 14s, or until that Resonator is swapped out, whichever comes first.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Phoebe (2026-08-17,
  // Chrome UA + google.com referer + jsRender). This section was previously entirely missing for her.
  // Uses her Absolution (self-DPS) rotation, the source's higher-rated mode (T1.5 DPS vs T2 Hybrid) —
  // Confession mode swaps the Forte cast for Utter Confession and only loops 2x instead of 4x.
  // Exact resource numbers re-verified 2026-08-31 against the wiki/Phoebe/Combat's
  // "Forte" section: Prayer caps at 120, +5/s passive regen (0→120 = 24s, matching the existing note);
  // Divine Voice caps at 60, refilled to 60 by either Absolution Litany or Utter Confession; entering one
  // of Absolution/Confession ends the other and the two casts "cannot coexist"; while Divine Voice > 0,
  // Absolution Litany/Utter Confession cannot be recast, and — notably — Divine Voice hitting 0 does NOT
  // force an exit from Absolution/Confession, the mode itself persists until manually swapped out of.
  // Starflash costs 30 Divine Voice at base, reduced to 15 by the Absolution Enhancement — exactly 4 casts
  // (60÷15) drain a full bar, confirming the existing "4 times total" loop count is correct.
  'Phoebe': [
    { type: 'Intro', skill: 'Golden Grace', note: 'Swap into her — fires automatically, dealing minor knockback damage. No button press needed.' },
    { type: 'Skill', skill: 'To Where Light Shines', note: 'Press Skill to plant a Ring of Mirrors at your target — anything hit is frozen in place for 2s (up to 12 targets). Press Skill again shortly after to teleport into the ring\'s center (optional, but standing inside it swaps Basic Attack to the stronger Chamuel\'s Star combo for the rest of the rotation). The Ring lasts 30s and casting it again replaces any existing Ring.' },
    { type: 'Forte', skill: 'Absolution Litany', note: 'Her Prayer gauge fills passively at 5/second with no action needed — once it hits its 120 cap (about 24s after her last use), HOLD Basic Attack to unleash this, entering "Absolution" mode (ends Confession if active), applying 1 Spectro Frazzle stack, and refilling her separate Divine Voice gauge to its 60 cap.' },
    { type: 'Liberation', skill: 'Dawn of Enlightenment', note: 'Cast Liberation immediately after Absolution Litany — this also cancels Absolution Litany\'s ending animation, saving time. Deals a single (non-chained) hit with DMG Multiplier +255% while in Absolution mode (in Confession mode it instead applies 8 Spectro Frazzle stacks, with no DMG Multiplier change).' },
    { type: 'Skill', skill: "Chamuel's Star 1-3", note: 'While standing inside the Ring of Mirrors, tap Basic Attack 3 times — her Basic Attack is automatically replaced by this stronger combo while inside the ring.' },
    { type: 'Forte', skill: 'Starflash', note: 'Right after landing Basic Attack Stage 3 (or a Dodge Counter) while Divine Voice > 0, her Heavy Attack becomes this automatically — press Heavy Attack to fire it, consuming 15 Divine Voice per cast in Absolution mode (base cost 30, reduced by 15 via the Absolution Enhancement) and gaining +256% DMG Amp against targets already carrying Spectro Frazzle. Repeat the "3 Basics into Starflash" pattern exactly 4 times (60÷15 Divine Voice) until the gauge empties.' },
    { type: 'Outro', skill: 'Attentive Heart', note: 'Swap out after the 4th Starflash to trigger this automatically — deals a final hit with DMG Multiplier +255% while in Absolution mode (in Confession mode it instead grants the on-field ally Silent Prayer: -10% target Spectro RES + 100% Spectro Frazzle DMG Amp + 50% longer Frazzle damage interval, lasting 30s or until Phoebe swaps back to Absolution).' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Roccia (2026-08-17,
  // Chrome UA + google.com referer + jsRender). This section was previously entirely missing for her.
  // Re-verified 2026-08-31 verbatim against the wiki/Roccia/Combat's Forte
  // Details section (exact Imagination gain/spend amounts, Beyond Imagination entry/exit conditions,
  // Liberation's Crit-Rate-scaling team ATK buff, Outro's forfeit-on-swap condition). Also fixes a
  // zero-damage bug: step 2's `skill` was 'Pero, Easy Stage 4', which does NOT appear as a substring of
  // SKILL_MULTIPLIERS.Roccia's Basic ATK row name ('Stage 1-4') — CharacterDetailModal's per-step DMG
  // lookup is `n.includes(step.skill)` (row name must CONTAIN the step's skill string), so this step
  // silently resolved to no DMG shown, the same bug class already found/fixed on 2 other characters'
  // rows. Changed to 'Stage 1-4' (exact match) with the Stage-4-specifically detail kept in the note.
  'Roccia': [
    { type: 'Intro', skill: 'Pero, Help', note: 'Swap into her — this fires automatically, dealing Havoc DMG (168.99% at Lv.10) and restoring a flat +100 Imagination (now 100/300).' },
    { type: 'Basic ATK', skill: 'Stage 1-4', note: 'Tap Basic Attack ONCE. Because you just used Intro, her combo skips straight to Stage 4 (104.19%×2 at Lv.10) instead of starting over at Stage 1 — Basic Attack hits restore some Imagination on their own (exact rate not published by source), on top of the flat gains from Intro/Skill.' },
    { type: 'Skill', skill: 'Acrobatic Trick', note: 'Press Skill. This pulls enemies in, restores a flat +100 Imagination (caps at 300, so this step alone can bring you to the cap), and automatically launches her into the air into "Beyond Imagination" — you don\'t need to jump manually. Beyond Imagination only ends when Roccia lands (goes non-airborne) or is switched off the field.' },
    { type: 'Forte', skill: 'Real Fantasy 1-3', note: 'While airborne in Beyond Imagination with ≥100 Imagination, tap Basic Attack (do NOT hold) — each tap is one Real Fantasy bounce, counted as Heavy Attack DMG, and spends exactly 100 Imagination. Landing after Stage 1 or Stage 2 with over 100 Imagination left automatically re-launches Beyond Imagination for the next bounce, so an exact 300 Imagination bar covers all 3 (322.08%/339.97%/357.86% at Lv.10). On the 3rd bounce landing, immediately cast Liberation to cancel its landing recovery.' },
    { type: 'Liberation', skill: 'Commedia Improvviso!', note: 'Cast this the instant the 3rd Forte bounce lands (cancels its endlag) — a single hit counted as Heavy Attack DMG (278.34%×3 at Lv.10), plus a flat team ATK buff whose size depends on Roccia\'s own Crit Rate: +1 ATK per 0.1% Crit Rate over 50%, so 70%+ Crit Rate gives the full +200 ATK to everyone, lasting 30s.' },
    { type: 'Echo', skill: 'Swap Cancel', note: 'Use your equipped Echo\'s skill right after Liberation, then immediately swap to the next character — swapping cuts off the Echo\'s own animation without losing its effect.' },
    { type: 'Outro', skill: 'Applause, Please!', duration: 14, note: 'Triggers automatically the moment you swap out — no separate button press needed. Grants the incoming Resonator +20% Havoc DMG Amp / +25% Basic ATK DMG Amp for 14s or until they are swapped out, and — via Inherent Skill Super Attractive Magic Box — swaps their Utility button for Roccia\'s Magic Box (100 flat Havoc pull-in DMG, counted as Echo Skill Utility DMG) for the same window.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Carlotta (re-fetched
  // 2026-08-18, Chrome UA + google.com referer + jsRender). Step-by-step mechanics re-verified 2026-08-31
  // verbatim against the wiki/Carlotta/Combat's Forte Details table (exact ammo counts,
  // gain/consume events, and Twilight Tango's forced-press/forfeit structure) — the action sequence already
  // matched; only the per-step conditional detail was tightened (e.g. Chromatic Splendor's Substance gain is
  // per-crystal, 10 per Moldable Crystal consumed, not a flat "60").
  'Carlotta': [
    { type: 'Intro', skill: 'Wintertime Aria', note: 'Swap into her — fires automatically. Grants 30 Substance and 3 Moldable Crystals (of 6 max) right away.' },
    { type: 'Skill', skill: 'Art of Violence', note: 'Press Skill — deals Glacio DMG, inflicts Dispersion (1.5s immobilize), and grants 3 more Moldable Crystals (now 6/6). Press Skill again shortly after to chain into Chromatic Splendor before the window closes; otherwise Art of Violence simply falls off cooldown on its own.' },
    { type: 'Skill', skill: 'Chromatic Splendor', note: 'Press Skill again within the follow-up window — consumes ALL held Moldable Crystals for +10 Substance PER crystal consumed (6 crystals = +60, now 90/120) and enters "Final Bow" once Substance later hits 120/120, granting +80% DMG Multiplier to all 3 Liberation abilities (Era of New Wave/Death Knell/Fatal Finale) until she is swapped off during Twilight Tango or Twilight Tango ends.' },
    { type: 'Mid-air', skill: 'Plunging Attack', note: 'Jump and tap Basic Attack to plunge back to the ground — pure repositioning, no damage focus, just gets her grounded to continue the combo.' },
    { type: 'Forte', skill: 'Imminent Oblivion', note: 'Tinted Crystal activates on its own 22s cooldown; once it is active AND Substance is capped at 120/120, HOLD Basic Attack (replacing the normally-available tap Heavy Attack/Containment Tactics) — consumes all 120 Substance, deals Glacio DMG counted as Resonance Skill DMG, cuts Art of Violence\'s cooldown by 6s, and sends Tinted Crystal back on cooldown. Cannot be cast while in Twilight Tango.' },
    { type: 'Liberation', skill: 'Era of New Wave', note: 'Press Liberation — hits all nearby targets (counted as Skill DMG), inflicts Deconstruction (-18% DEF ignored, 4s), and activates "Twilight Tango" (10s), forcing the next 5 Basic Attack/Liberation presses into Death Knell/Fatal Finale — Necessary Measures, Containment Tactics, and Imminent Oblivion are all locked out, and no Substance/Moldable Crystals can be gained, for the duration.' },
    { type: 'Liberation', skill: 'Death Knell ×4', note: 'Press Basic Attack or Liberation 4 times in a row — each press fires Death Knell automatically while in Twilight Tango, dealing Glacio DMG (counted as Skill DMG) and building 1 Meta Vector per hit, capping at 4.' },
    { type: 'Liberation', skill: 'Fatal Finale', note: 'On the 5th press, with 4 Meta Vectors banked, this fires automatically instead of another Death Knell — a big AoE hit (counted as Skill DMG) that consumes all 4 Meta Vectors and ends Twilight Tango, also wiping her Substance to 0. There is no way to delay past the 5th press — the forced-press sequence cannot be skipped or extended.' },
    { type: 'Skill', skill: 'Art of Violence → Chromatic Splendor', note: 'Press Skill twice again (same as the opener) — this rebuilds only 3 Moldable Crystals from Art of Violence itself (no other crystal-granting action happened since Twilight Tango wiped her state), so Chromatic Splendor here consumes 3 crystals for +30 Substance, banked for the start of the next rotation.' },
    { type: 'Echo', skill: 'Swap Cancel', note: 'Use your equipped Echo\'s skill, then immediately swap out — cuts the Echo animation short without losing its effect and triggers her Outro.' },
    { type: 'Outro', skill: 'Closing Remark', note: 'Triggers automatically on swap-out — one final Glacio hit worth 794.2% ATK at base rank (confirmed exact against source, unchanged).' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Camellya (2026-08-17,
  // Chrome UA + google.com referer + jsRender). This section was previously entirely missing for her.
  // Simplified from the source's full swap/Echo-cancel-annotated combo down to the core skill sequence,
  // matching the level of detail used for the rest of the roster's rotation entries.
  'Camellya': [
    { type: 'Intro', skill: 'Everblooming', note: 'With S1, also grants +28% Crit DMG for 18s (once per 25s).' },
    { type: 'Skill', skill: 'Crimson Blossom', note: 'Basic-ATK-type Havoc DMG; enters Blossom Mode (mid-air castable), replacing Basic/Heavy/Dodge-Counter/Skill.' },
    { type: 'Skill', skill: 'Vining Waltz 1-4 / Blazing Waltz', note: 'Blossom Mode combo — every hit consumes Crimson Pistils at +150% Energy Regen; each 10 Pistils = 4 Concerto Energy + 1 Crimson Bud (15s, stacks to 10).' },
    { type: 'Liberation', skill: 'Fervor Efflorescent' },
    { type: 'Basic ATK', skill: 'Vining Waltz 1', note: 'Fills the last Concerto Energy needed to unlock Ephemeral.' },
    { type: 'Forte', skill: 'Ephemeral', duration: 15, note: 'Once Concerto Energy is full and off its own 25s cooldown, replaces Skill. Costs 70 Concerto Energy, consumes ALL Crimson Buds (each consumed adds +5% DMG Multiplier to Sweet Dream, up to +50% at 10 stacks on top of the base +50%), enters 15s Budding Mode. Budding Mode ends early on swap-out or once all Crimson Pistils are gone, and blocks gaining new Buds/Energy on the affected hits while active.' },
    { type: 'Skill', skill: 'Vining Waltz 1-4 / Blazing Waltz', note: 'Budding Mode combo, Sweet Dream DMG Multiplier +50% to +100% depending on Buds consumed on Ephemeral cast.' },
    { type: 'Skill', skill: 'Floral Ravage', note: 'Ends Blossom Mode (does not restore STA).' },
    { type: 'Outro', skill: 'Twining', note: 'Base 329.24% ATK Havoc DMG. Conditional: deals an ADDITIONAL 459.02% ATK ONLY if Ephemeral was cast earlier this on-field rotation — this is a strict cast-order dependency (Ephemeral must precede Twining), not an always-on bonus.' },
  ],
  // Standard Rotation — sourced from Jianxin's kit flow on the source character/1405 (the source's
  // "Gameplay and teams" tab was unreachable this audit — 403/blank JS-render).
  // Re-verified 2026-08-31 against the wiki/Jianxin/Combat's Forte/Details text
  // directly: every step's `skill` string still substring-matches its SKILL_MULTIPLIERS.Jianxin row name
  // under the calc engine's rowName.includes(step.skill) lookup ('Essence of Tao'->Intro row, 'Fengyiquan
  // Stage 1-4'->Basic ATK row, 'Calming Air'->the 'Calming Air: Chi Counter / Chi Parry' Skill row,
  // 'Primordial Chi Spiral'->the Forte row, 'Purification Force Field'->Liberation row, 'Transcendence'
  // ->Outro row) — no zero-damage step-name bug found here, unlike the pattern seen on ~10 other
  // characters this project. Corrected the Forte step's trigger verb: the site's own Forte Circuit body
  // text says "hold Basic Attack" (not Heavy Attack, despite the section header's "Heavy Attack: Primordial
  // Chi Spiral" label) to cast it once Chi is maxed — was already written that way here and left unchanged.
  'Jianxin': [
    { type: 'Intro', skill: 'Essence of Tao', note: 'Swap into her — fires automatically, pulling enemies in and building Chi toward the Forte gauge.' },
    { type: 'Basic ATK', skill: 'Fengyiquan Stage 1-4', note: 'Tap Basic Attack repeatedly for the 4-stage combo — builds Chi toward the 120 max.' },
    { type: 'Skill', skill: 'Calming Air', note: 'HOLD Skill to enter Parry Stance — successfully Chi Parrying/Chi Countering an attack builds Chi faster than the Basic Attack combo alone; 12s cooldown.' },
    { type: 'Forte', skill: 'Primordial Chi Spiral', duration: 3, note: 'Once Chi is maxed, HOLD Heavy Attack to unleash Zhoutian Progress — a channeled 3s state that reduces DMG taken by 50% and heals the active Resonator every 6s afterward.' },
    { type: 'Liberation', skill: 'Purification Force Field', note: 'Press Liberation to group enemies together — the field explodes for damage when it expires; 20s cooldown.' },
    { type: 'Outro', skill: 'Transcendence', note: 'Swap out to trigger this automatically — grants the incoming Resonator +38% Resonance Liberation DMG for 14s.' },
  ],
  // Standard Rotation — re-verified verbatim 2026-08-31 against the wiki/Lingyang/Combat's
  // Forte "Details" text (Chrome/Windows UA + google.com referer + jsRender), cross-checked against
  // the source/wuthering-waves/characters/lingyang's "Gameplay and teams" tab for cast order. Every step's
  // `skill` string still substring-matches its SKILL_MULTIPLIERS.Lingyang row name. Prior notes were vague
  // ("filling a large chunk of the gauge", "up to ~9 hits ... under ideal play") without the source's actual
  // stated numbers — now cites the 100 Lion's Spirit cap, the 5s/10s Striding Lion timer, and the <10
  // Stormy Kicks threshold verbatim. Source does not publish per-trigger Lion's Spirit restore amounts
  // (only that Furious Punches/Lion Awakens/Strive: Lion's Vigor each restore some), so no restore % is
  // stated — TODO: needs Phase 2 schema (stateful gauge tracking) to model Lion's Spirit gain/drain/threshold
  // transitions precisely; this flat rotation can only describe the state machine in prose.
  'Lingyang': [
    { type: 'Intro', skill: 'Lion Awakens', note: "Swap into him to fire this automatically — deals Glacio DMG and is one of three casts (with Furious Punches and Strive: Lion's Vigor) that restore the 100-cap Lion's Spirit gauge; exact restore amount per trigger not published by source." },
    { type: 'Liberation', skill: "Strive: Lion's Vigor", duration: 14, note: "Press Liberation — grants self +50% Glacio DMG Bonus for 14s (20s cooldown, 125 Resonance Energy) and also restores Lion's Spirit. While this buff is active, Striding Lion's Lion's Spirit drain is halved, extending the state from 5s up to 10s." },
    { type: 'Forte', skill: 'Unification of Spirits', note: "At 100/100 Lion's Spirit, HOLD Heavy Attack for Glorious Plunge and enter the airborne Striding Lion state (also enterable via Basic ATK right after Lion Awakens or Strive: Lion's Vigor if Lion's Spirit is already full)." },
    { type: 'Basic ATK', skill: 'Majestic Fists', note: "While in Striding Lion, tap Basic Attack for the 2-hit Feral Gyrate — alternate with the Skill step below (never repeat the same input twice in a row). Once Lion's Spirit drops below 10, Basic Attack becomes the 8-hit+finisher Stormy Kicks instead, which unlocks the Tail Strike Mid-air Attack." },
    { type: 'Skill', skill: 'Ancient Arts', note: "Press Skill for Mountain Roamer while airborne in Striding Lion — alternating Basic Attack/Skill taps like this maximizes hits landed before Lion's Spirit runs out (drains to 0 within 5s, or 10s under Strive: Lion's Vigor)." },
    // Added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): the source's own sample rotation
    // explicitly ends the Striding Lion loop with these two named hits ("Basic: Feral Gyrate P1 →
    // Basic: Stormy Kicks → Mid-Air Attack: Tail Strike → Outro") once Lion's Spirit drops below 10 —
    // real, multiplier-published moves (36.03%×8+192.15% / 174.96%×2) that were entirely missing their
    // own damage blocks, unlike Feral Roars/Swift Punches (Furious Punches branch) which the source's
    // own review explicitly says the optimal burst skips by filling Forte via Intro+Liberation alone.
    { type: 'Basic ATK', skill: 'Stormy Kicks', note: "Once Lion's Spirit drops below 10 (near the end of the Striding Lion window), Basic Attack becomes the 8-hit+finisher Stormy Kicks instead of Feral Gyrate — this also unlocks the Tail Strike Mid-air Attack below." },
    { type: 'Mid-air', skill: 'Tail Strike', note: "Unlocked by Stormy Kicks — cast as the last hit of the Striding Lion window before swapping out." },
    { type: 'Outro', skill: 'Frosty Marks', note: 'Swap out to trigger this automatically — a pure-damage AoE finisher (587.94% ATK) with no baseline team buff (S4 Resonance Chain grants the team +20% Glacio DMG for 30s on this Outro).' },
  ],
  // Standard Rotation (S0) — re-verified 2026-08-31 against the source/wuthering-waves/characters/verina's
  // "Gameplay and teams" tab (Chrome UA + google.com referer + jsRender; total listed time 3.75s at S0,
  // 2.35s at S2) and cross-checked against the wiki/Verina/Combat and
  // the source/character/1503 for the per-step numbers. Her Intro Skill is explicitly skipped — the source
  // calls it "unusable," sending her airborne and lengthening her already-shortest-in-game rotation — so
  // she swaps in cold and her Basic ATK cycle starts from Stage 3. Cast-order note: Skill Botany Experiment
  // is deliberately swap-cancelled by Liberation, not an execution error — see that step.
  'Verina': [
    { type: 'Basic ATK', skill: 'Cultivation Stage 1-5', note: 'Swap her in cold with no Intro (her Intro Skill is considered unusable in practice), then tap Basic Attack — swapping in this way starts the combo straight at Stage 3, into Stage 4-5. Stage 5 on hit grants 1 Photosynthesis Energy.' },
    { type: 'Skill', skill: 'Botany Experiment', note: 'Press Skill, then immediately cancel it with the Liberation below to save time — this skips the hit and its Resonance Energy gain, but Concerto Energy is still gained. Also grants 1 Photosynthesis Energy on cast.' },
    { type: 'Liberation', skill: 'Arboreal Flourish', note: 'Press Liberation right after Botany Experiment to cancel it — 175 Energy, 25s cooldown. Heals the team (950 + 23.80% ATK at Lv.10) and applies a 12s Photosynthesis Mark for Coordinated-Attack healing.' },
    { type: 'Forte', skill: 'Mid-air Attack: Starflower Blooms', note: 'Jump, then tap Basic Attack up to 3 times to spend all 4 Photosynthesis Energy stacks (1 per cast, cap 4) on Starflower Blooms — each cast heals the team (1188 + 29.75% ATK at Lv.10) and refills 12 Concerto Energy. A Concerto-generating weapon (Variation/Stellar Symphony) lets the last cast be skipped.' },
    { type: 'Outro', skill: 'Blossom', note: 'Swap out to trigger this automatically — heals the incoming Resonator for 19% ATK/s over 6s and grants the whole nearby team +15% All-Type DMG Amplify for 30s.' },
  ],
  // Standard Rotation — re-verified verbatim 2026-08-31 against the wiki/Jinhsi/Combat
  // (Chrome/Windows UA + google.com referer + jsRender, load+9s wait to clear Cloudflare). This is the
  // baseline single-Incarnation-cycle rotation (no swap/animation/jump cancels) — she also has advanced/
  // expert cancel-heavy variants that push her damage further, omitted here as too execution-dependent
  // for a standard reference rotation. Notably she gets 2 Outros and 2 Forte nukes per full team loop via
  // her free-Outro-every-25s Unison mechanic. Every step below is cast-order-gated by a 5s window — miss
  // the window and the alternate (empowered) cast is forfeited for that step.
  'Jinhsi': [
    { type: 'Basic ATK', skill: 'Slash of Breaking Dawn Stage 1-4', note: 'Tap Basic Attack 4 times for the full opening combo — Stage 4 opens a 5s window for the Skill button to become Overflowing Radiance.' },
    { type: 'Skill', skill: 'Overflowing Radiance', note: 'Press Skill within 5s of Basic ATK Stage 4 (or of Intro, if not already in Incarnation) — miss the window and this alternate cast is lost, forcing a normal Trailing Lights of Eons instead. Sends her into Incarnation for exactly 10s.' },
    { type: 'Liberation', skill: 'Purge of Light', note: 'Press Liberation for a huge AoE nuke (499.81%+1166.22% ATK at Lv10); 24s cooldown, 150 Resonance Energy cost, can be cast at any point in the rotation.' },
    { type: 'Forte', skill: 'Incarnation - Basic Attack Stage 1-4', note: 'While in Incarnation (10s), Basic ATK is replaced by this 4-stage combo — counted as Resonance Skill DMG, does not reset her normal Basic ATK cycle, can be cast mid-air. Landing Stage 4 ends Incarnation and opens a 5s window for Ordination Glow.' },
    { type: 'Skill', skill: 'Illuminous Epiphany', note: 'Press Skill within 5s of Incarnation-Basic Attack Stage 4 landing (Ordination Glow) — miss the window and this cast is lost. Consumes up to 50 Incandescence (cap, gained only via the Eras in Unity passive: +1 per party Attribute-DMG trigger and +2 per party Coordinated-Attack trigger, each independently capped to 1 trigger/3s per Attribute) for a scaling Stella Glamor nuke that detonates after a short delay. Also grants Unison (once per 25s): the next swap-out auto-fires both her Outro and the incoming character\'s Intro at no Concerto cost.' },
    { type: 'Outro', skill: 'Temporal Bender', note: 'Swap out to trigger this automatically (or free via Unison, see above) — utility only, doubles her own Incandescence-gain trigger rate (1 per 1s instead of the passive\'s 1 per 3s per Attribute) for 20s. No team DMG buff.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Changli (re-fetched
  // 2026-08-17 via Chrome UA + google.com referer + jsRender). This is the source's single-Intro,
  // no-swap-cancel rotation — she also has Double-Intro and heavy Swap-Cancel variants for advanced
  // quickswap play, omitted here as too execution/team-dependent for a standard reference rotation. Goal
  // each rotation: land 4 True Sight follow-ups to fill Enflamement for 2 Forte Heavy casts. Step notes
  // re-verified 2026-08-31 against the wiki/Changli/Combat ("Instructions" and
  // Forte "Details" sections): each True Sight window (12s) is consumed by exactly ONE follow-up
  // (Conquest on a ground Basic ATK, or Charge on jump/mid-air) — landing both per window is not
  // possible, so a fresh True Sight trigger is required before every Enflamement tick; this is the one
  // cast-order/timing constraint in her kit, added below since the prior note only said "weaving in"
  // without stating the one-shot nature of each window.
  'Changli': [
    { type: 'Intro', skill: 'Obedience of Rules', note: 'Swap into her — fires automatically, deals a hit, and opens a True Sight window (12s).' },
    { type: 'Skill', skill: 'True Sight: Capture', note: 'Press Skill — 2 charges, 12s recharge each; every cast also opens a fresh 12s True Sight window (replacing/refreshing any window already open).' },
    { type: 'Heavy ATK', skill: 'Standard', note: 'HOLD Heavy Attack on the ground, then again in the air for the Mid-air Heavy, weaving in True Sight: Conquest (ground Basic ATK) or True Sight: Charge (jump/mid-air Basic ATK) to consume each open window — only ONE follow-up lands per window (it ends the instant either fires), each on-hit follow-up grants +1 Enflamement (cap 4).' },
    { type: 'Liberation', skill: 'Radiance of Fealty', note: 'Press Liberation — instantly grants 4 Enflamement (overwrites/caps, does not stack past 4) and Fiery Feather (self +25% ATK on the next Forte Heavy Attack within 10s, consumed and ended by that cast); 20s cooldown, 125 Resonance Energy.' },
    { type: 'Forte', skill: 'Heavy ATK: Flaming Sacrifice', note: 'At 4 Enflamement stacks, HOLD Heavy Attack to consume them all — takes 40% less DMG while casting; landing 2 casts per rotation is the goal.' },
    { type: 'Outro', skill: 'Strategy of Duality', note: 'Swap out to trigger this automatically — grants the incoming Resonator +20% Fusion DMG Amp and +25% Liberation DMG Amp for 10s or until they are swapped out, whichever comes first; her shortest Outro window in the game alongside Lumi.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Zhezhi (re-fetched
  // 2026-08-17 via Chrome UA + google.com referer + jsRender). Goal: fill the 3-segment Afflatus Forte
  // gauge, convert it into Phantasmic Imprints via Skill + Forte Heavy, then teleport to each one with
  // repeated Stroke of Genius/Creation's Zenith casts before Outro.
  'Zhezhi': [
    { type: 'Intro', skill: 'Radiant Ruin', note: 'Swap into her — fires automatically, filling roughly 1.5 of her 3 Afflatus segments.' },
    { type: 'Basic ATK', skill: 'Dimming Brush Stage 1-3', note: 'Tap Basic Attack 3 times for the full combo — fills the remaining Afflatus.' },
    { type: 'Skill', skill: 'Manifestation', note: 'At 60+ Afflatus, press Skill to consume 60 and summon Phantasmic Imprint - Left and Right.' },
    { type: 'Forte', skill: 'Heavy ATK: Conjuration', note: 'At 30+ Afflatus, HOLD Heavy Attack to consume 30 and summon Phantasmic Imprint - Middle.' },
    // Type corrected 2026-09-01 from 'Skill' to 'Forte' on this row and the two below (Stroke of
    // Genius 2nd cast, Creation's Zenith) to match SKILL_MULTIPLIERS.Zhezhi's row type, which was
    // silently resolving to 0 DMG under the type===step.type lookup.
    { type: 'Forte', skill: 'Stroke of Genius', note: 'Press Skill to teleport to and consume a Phantasmic Imprint for an off-field-style Basic Attack-type hit — Jump Cancel out of the landing lag to chain into the next Imprint faster.' },
    { type: 'Forte', skill: 'Stroke of Genius', note: '2nd cast — repeat for each Imprint placed, escalating into Creation\'s Zenith once Painter\'s Delight hits 2 stacks; cancel its endlag via Liberation.' },
    { type: 'Liberation', skill: 'Living Canvas', note: 'Press Liberation at any point in the rotation (also cancels Creation\'s Zenith endlag) — summons Inklit Spirits that perform Coordinated Attacks alongside the active Resonator for up to 30s.' },
    { type: 'Forte', skill: "Creation's Zenith", note: 'Finisher — Dash Cancel out of it into Echo, Swap, or Outro to skip the remaining recovery.' },
    { type: 'Outro', skill: 'Carve and Draw', duration: 14, note: 'Swap out to trigger this automatically — grants the incoming Resonator +20% Glacio DMG Amp and +25% Resonance Skill DMG Amp for 14s, plus 15 Resonance Energy via Inherent Skill Flourish.' },
  ],
  // Standard Rotation ("Easy & Basic Burst Combo") — sourced from the source's "Gameplay and teams" tab for
  // Encore (re-fetched 2026-08-18, Chrome UA + google.com referer + jsRender). the source also lists
  // Advanced and "No Forte" combos that squeeze in extra Basic Attacks via Dash/Skill-cancels — omitted
  // here as too execution-heavy for a standard reference rotation.
  // Zero-damage bug fixed 2026-08-31 (re-verified against wuthering.gg/characters/encore + SKILL_MULTIPLIERS.Encore,
  // same bug class already caught on Calcharo/Yinlin/Roccia/Jiyan): FIVE separate step skill strings did NOT
  // substring-match their SKILL_MULTIPLIERS row name under the calc engine's `rowName.includes(step.skill)`
  // lookup, so every one of them (7 total steps) silently resolved to ZERO damage. (1) The Intro step used the
  // invented flavor phrase "Woolies Can Help!" — her real Intro Skill name (per both the wiki and wuthering.gg) is
  // "Woolies Helpers"; no row existed for the fake name at all. (2)-(3) The 3 "Cosmos: Rampage" Skill steps and
  // 2 "Cosmos: Frolicking 1-4" Basic ATK steps referenced names that only existed buried mid-string inside the
  // old combined 'Liberation'/'Cosmos Rave' row (see that section's fix) — now resolved by the new dedicated
  // 'Skill'/'Basic ATK' rows. (4) The Forte finisher step used "Heavy Attack: Cosmos Rupture" (with "Attack")
  // against the row name 'Heavy ATK: Cosmos Rupture' (with "ATK") — corrected to match. (5) "Dissonance" was
  // also corrected to "Mayhem" throughout — the Forte gauge's actual in-game name (wuthering.gg's own skill text
  // calls it "Mayhem"; "Dissonance" appears nowhere in either source and was an unsourced invention).
  'Encore': [
    { type: 'Echo', skill: 'Use Echo', note: 'Use your equipped Echo\'s skill before swapping her in (Inferno Rider is best-in-slot but needs a swap-cancel to use smoothly).' },
    { type: 'Intro', skill: 'Woolies Helpers', note: 'Swap into her — fires automatically, dealing a Fusion hit and restoring some Mayhem.' },
    { type: 'Liberation', skill: 'Cosmos Rave', note: 'Press Liberation (125 Energy) — no direct hit on cast; sends Encore into a melee-focused frenzy for a fixed 10s (16s cooldown): her Basic Attack, Heavy Attack, Skill, and Dodge Counter are all replaced by enhanced "Cosmos" versions for the duration.' },
    { type: 'Skill', skill: 'Cosmos: Rampage', note: 'Press Skill (her Skill is auto-replaced while in Cosmos Rave) — a Fusion hit that also restores a good chunk of Mayhem (Forte Gauge, caps at 100). 4s internal cooldown.' },
    { type: 'Basic ATK', skill: 'Cosmos: Frolicking 1-4', note: 'Tap Basic Attack 4 times in a row — the auto-replaced combo during Cosmos Rave, each hit also restoring some Mayhem.' },
    { type: 'Skill', skill: 'Cosmos: Rampage', note: 'Press Skill again on cooldown to keep filling Mayhem toward 100.' },
    { type: 'Basic ATK', skill: 'Cosmos: Frolicking 1-4', note: 'Second 4-tap combo pass, same as above.' },
    { type: 'Skill', skill: 'Cosmos: Rampage', note: 'Third Skill cast — by now Mayhem should be at or near its 100 cap.' },
    { type: 'Forte', skill: 'Heavy ATK: Cosmos Rupture', note: 'Once Mayhem is full (100/100), HOLD Heavy Attack (auto-replaced while in Cosmos Rave) — consumes all 100 Mayhem to enter a 70%-damage-reduction channel (survives a swap-out), then unleashes Cosmos Rupture (counted as Resonance Liberation DMG) once it ends. Swap-cancel the instant the channel begins to skip most of its animation.' },
    { type: 'Outro', skill: 'Thermal Field', duration: 6, note: 'Swap out to trigger this automatically — drops a 3m burn zone dealing Fusion DMG every 1.5s for 6s to anything standing in it.' },
  ],
  // Standard Rotation ("Basic Burst Combo") — sourced from the source's "Gameplay and teams" tab for
  // Calcharo (re-fetched 2026-08-18, Chrome UA + google.com referer + jsRender). the source also lists a
  // Dash-Cancel variant (harder, same Death Messenger count) and a "4 Death Messenger" combo rated
  // Difficulty: Impossible — both omitted as too execution-heavy for a standard reference rotation.
  // Zero-damage bug fixed 2026-08-31 (re-verified against SKILL_MULTIPLIERS.Calcharo, same bug class already
  // caught on Yinlin/Roccia/Jiyan): TWO separate steps used skill strings that did NOT substring-match their
  // SKILL_MULTIPLIERS row name under the calc engine's `rowName.includes(step.skill)` lookup, so both
  // silently resolved to ZERO damage. (1) The 3 Forte steps used "Heavy Attack: \"Death Messenger\"" (with
  // "Attack") against a row named 'Heavy ATK: "Death Messenger"' (with "ATK") — corrected all 3 to
  // 'Heavy ATK: "Death Messenger"'. (2) The 2 Basic ATK steps used "Hounds Roar 1-5" against the row name
  // 'Phantom Etching → Hounds Roar', which contains "Hounds Roar" but not the "1-5" suffix — corrected both
  // to plain "Hounds Roar", which is a substring of the row name and now resolves correctly.
  'Calcharo': [
    { type: 'Echo', skill: 'Use + Swap Cancel', note: 'Use your equipped Echo\'s skill before swapping Calcharo in, then swap-cancel it — banks its effect without eating its full animation.' },
    { type: 'Intro', skill: 'Wanted Outlaw', note: 'Swap into him — fires automatically, dealing an Electro hit. Note: if this rotation is his 2nd+ in a fight and his previous Deathblade Gear has already ended, this Intro is silently replaced by "Necessary Means" instead (see SKILL_MULTIPLIERS.Calcharo) — this reference rotation assumes the baseline "Wanted Outlaw" opener.' },
    { type: 'Liberation', skill: 'Phantom Etching', note: 'Press Liberation (125 Resonance Energy) — deals a hit and enters "Deathblade Gear" for 11s: his Basic Attack is replaced by the 5-hit Hounds Roar combo, Dodge Counter and Heavy Attack both deal boosted Resonance Liberation DMG, and his Forte Gauge becomes "Killing Intent" (caps at 5, gained 1 per Hounds Roar hit; cannot gain Cruelty while in this state). Once this state ends, his next Intro Skill cast becomes "Necessary Means" instead of "Wanted Outlaw".' },
    { type: 'Forte', skill: 'Heavy ATK: "Death Messenger"', note: 'Once Killing Intent hits 5/5, his Basic Attack is replaced by this automatically — tap Basic Attack to fire it, consuming all 5 Killing Intent for a big Electro hit (counted as Liberation DMG) and refunding Resonance + Concerto Energy. Swap-cancel right after if you can, to protect him from the long wind-up on the next cast.' },
    { type: 'Basic ATK', skill: 'Hounds Roar', note: 'Tap Basic Attack 5 times in a row (still in Deathblade Gear) — each hit is 1 stage of the combo and grants 1 Killing Intent, refilling it to 5/5 for the next Death Messenger.' },
    { type: 'Forte', skill: 'Heavy ATK: "Death Messenger"', note: '2nd cast — same as above, tap Basic Attack once Killing Intent caps again. Swap-cancel if possible.' },
    { type: 'Basic ATK', skill: 'Hounds Roar', note: 'Repeat the 5-tap combo to refill Killing Intent to 5/5 a third time.' },
    { type: 'Forte', skill: 'Heavy ATK: "Death Messenger"', note: '3rd cast — the realistic ceiling per rotation without frame-perfect Dash Cancels between Hounds Roar hits (a 4th is theoretically possible but rated "Difficulty: Impossible").' },
    { type: 'Outro', skill: 'Shadowy Raid', note: 'Swap out to trigger this automatically — summons a Phantom that slashes everything in front of him for a large Electro hit.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Yinlin (re-fetched
  // 2026-08-18, Chrome UA + google.com referer + jsRender).
  // Zero-damage bug fixed 2026-08-31 (re-verified against SKILL_MULTIPLIERS.Yinlin, same bug class already
  // caught on Roccia): step 2's `skill` was "Zapstring's Dance Stage 4", which does NOT substring-match the
  // Basic ATK row name "Zapstring's Dance Stage 1-4" (CharacterDetailModal's per-step DMG lookup does
  // `rowName.includes(step.skill)`, and "Stage 1-4" does not contain "Stage 4" as a substring) — silently
  // resolved to 0 DMG. Step 4's `skill` was "Standard Heavy Attack" against the Heavy ATK row name
  // "Standard" — same bug, same fix pattern already used for e.g. Jiyan's Heavy ATK step ('Standard').
  // Both changed to the exact row name, with the stage-specific detail kept in the note text.
  'Yinlin': [
    { type: 'Intro', skill: 'Raging Storm', note: 'Swap into her — fires automatically, hits a large area and applies Sinner\'s Mark.' },
    { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", note: 'Tap Basic Attack ONCE (optionally swap-cancel it afterward) — lands Stage 4 of the puppet combo (75.16% at Lv.10).' },
    { type: 'Skill', skill: 'Magnetic Roar', note: 'Press Skill — deals Electro DMG and puts her into Execution Mode for 10s: her next 4 Basic Attack/Dodge Counter stages each also trigger an Electromagnetic Blast on any target carrying Sinner\'s Mark.' },
    { type: 'Heavy ATK', skill: 'Standard', note: 'HOLD Heavy Attack — consumes Stamina for a puppet strike (29.83%×2 at Lv.10).' },
    { type: 'Skill', skill: 'Lightning Execution', note: 'Press Skill again right after the Heavy Attack — try to fire it as early as the Heavy Attack\'s first hit lands, to cancel its endlag. Only works if cast shortly after Magnetic Roar, or it goes on cooldown instead.' },
    { type: 'Liberation', skill: 'Thundering Wrath', note: 'Press Liberation the instant Yinlin lands from the Heavy Attack — calls thunder down on a large area and re-applies Sinner\'s Mark.' },
    { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1", note: 'Tap Basic Attack ONCE — restores Judgment Points toward the 100 cap.' },
    { type: 'Forte', skill: 'Chameleon Cipher', note: 'Once Judgment Points hit 100/100, her Heavy Attack is replaced by this automatically — press Heavy Attack to consume all 100 for a big hit that upgrades any Sinner\'s Mark on the target to Punishment Mark for 18s (triggers an automatic Judgement Strike on that target once per second while it takes damage).' },
    { type: 'Echo', skill: 'Swap Cancel', note: 'Use your equipped Echo\'s skill (Impermanence Heron recommended) right after Chameleon Cipher, then immediately swap out to cancel its animation without losing the effect.' },
    { type: 'Outro', skill: 'Strategist', duration: 14, note: 'Triggers automatically on swap-out. Grants the incoming Resonator +20% Electro DMG Amplify and +25% Resonance Liberation DMG Amplify for 14s.' },
  ],
  // Standard "Burst Combo" Rotation — sourced from the source's "Gameplay and teams" tab for Jiyan
  // (re-fetched 2026-08-18, Chrome UA + google.com referer + jsRender). Omits the harder "Double Dragon
  // Combo" (dodge-cancel-timed variant that overlaps two dragons) as too execution-heavy for a baseline.
  // Zero-damage bug fixed 2026-08-31 (re-verified against SKILL_MULTIPLIERS.Jiyan, same bug class already
  // caught on Yinlin/Roccia): the 4 Heavy ATK steps used skill strings "Lance of Qingloong P1" and "Lance of
  // Qingloong P1-P3", neither of which substring-matched the SKILL_MULTIPLIERS row name (previously
  // "Emerald Storm: Prelude → Lance of Qingloong" under the Liberation row, now the dedicated Heavy ATK row
  // "Lance of Qingloong 1-3") under the calc engine's `rowName.includes(step.skill)` lookup — those 4 steps
  // silently resolved to ZERO damage. Corrected all 4 to plain "Lance of Qingloong", which is a substring of
  // "Lance of Qingloong 1-3" and now resolves correctly. Liberation step's skill "Emerald Storm: Prelude"
  // also re-verified — matches its own row's name (now correctly documented as dealing no direct DMG).
  'Jiyan': [
    { type: 'Echo', skill: 'Use Echo', note: "Use your equipped Echo's skill during the warm-up phase, right before entering the burst combo below, so its buff is active for the whole Ultimate window." },
    { type: 'Intro', skill: 'Tactical Strike', note: 'Swap into him — fires automatically, stabs the target and builds Resolve toward the 60 cap.' },
    { type: 'Liberation', skill: 'Emerald Storm: Prelude', duration: 10, note: 'Press Liberation (below 30 Resolve) — deals no direct DMG, only enters Qingloong Mode for 10s (16s CD, 125 Energy cost): Basic Attack, Heavy Attack, and Dodge Counter are all replaced by Heavy Attack: Lance of Qingloong.' },
    { type: 'Heavy ATK', skill: 'Lance of Qingloong', note: 'Press Heavy Attack for the 1st Lance of Qingloong, but interrupt it as fast as possible with Resonance Skill below — only the animation frames actually playing deal damage, so cutting it short here loses nothing and saves time.' },
    { type: 'Skill', skill: 'Windqueller', note: 'Press Skill to cancel the interrupted Lance — deals Aero DMG (free +20% DMG while in Qingloong Mode, no Resolve cost).' },
    { type: 'Heavy ATK', skill: 'Lance of Qingloong', note: 'Press Heavy Attack and let it run this time — full 3-part combo (Part 1/2/3, each hits 8×) as the summoned dragon sweeps the area.' },
    { type: 'Heavy ATK', skill: 'Lance of Qingloong', note: 'Press Heavy Attack again for a 2nd full 3-part Lance of Qingloong combo.' },
    { type: 'Skill', skill: 'Windqueller', note: 'Press Skill again before Qingloong Mode ends — a 6th/7th Lance rep can be started and cut short here for a small extra tick if timing allows, then swap out.' },
    { type: 'Outro', skill: 'Discipline', duration: 8, note: 'Swap out to trigger this automatically. For the next 8s, whenever the incoming Resonator lands a Heavy Attack, Jiyan\'s dragon lands a Coordinated Attack (up to 2 procs, once per second).' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Lucilla (2026-08-18,
  // Chrome UA + google.com referer + jsRender). Only 5 real inputs — one of the simplest kits in the game.
  'Lucilla': [
    { type: 'Intro', skill: 'Clip It', note: 'Swap into her — fires automatically, restores 100 of 150 Trace and inflicts 1 stack of Glacio Chafe.' },
    // Skill name corrected 2026-09-01 from 'Phantom Frame → Spotlight', which never matched the
    // SKILL_MULTIPLIERS row name (arrow vs slash separator) and was silently resolving to 0 DMG.
    { type: 'Skill', skill: 'Spotlight', note: 'Press and HOLD Skill to deploy the Focus Ring, then release it about a quarter-second in, right as the ring turns gold — a perfect release triggers Spotlight (restores 50 Trace, more than the 25 a missed "Compensate" release gives) and unlocks her Ultimate once she now holds all 3 Photos (1 Photo per 50 Trace restored).' },
    { type: 'Liberation', skill: 'Clear As Day', duration: 10, note: 'Press Liberation (feel free to spam it — it won\'t fire until the Skill animation fully finishes) — costs no Resonance Energy, enters Reminiscence for ~10s, and grants +30% Basic ATK DMG Bonus for 10s in Glacio Chafe mode (or +30% Echo Skill DMG Bonus in Echo mode).' },
    { type: 'Basic ATK', skill: 'Tracing Forms Stage 1-3', note: 'HOLD Basic Attack and keep holding — Reminiscence auto-replaces her Basic Attack with this 3-stage combo, consuming her 3 Photos as it goes (each is an "Oblivion" hit inflicting Glacio Chafe in Chafe mode, or counted as a separate Echo Skill cast in Echo mode).' },
    { type: 'Basic ATK', skill: 'Letting It Go', note: 'Fires automatically once Stage 3 finishes or you release Basic Attack — an interruption-immune AoE finisher that fully restores Concerto Energy and ends Reminiscence.' },
    { type: 'Echo', skill: 'Use Echo', note: 'In Glacio Chafe mode her Summon Echo can be used at any point in the rotation; in Echo Skill/Phrolova teams, use and swap-cancel it right after Letting It Go, before Outro.' },
    { type: 'Outro', skill: 'Montage', duration: 30, note: 'Triggers on swap-out. In Glacio Chafe mode, Amplifies Glacio Chafe DMG near the active Resonator by +60% for 30s (persists through the swap). In Echo mode, grants the incoming Resonator +50% Echo Skill DMG Amp for 14s instead (lost if they swap off).' },
  ],
  // Standard "Loop Rotation" — sourced from the source's "Gameplay and teams" tab for Rebecca (2026-08-18,
  // Chrome UA + google.com referer + jsRender). Her separate, longer "Opener Rotation" (extra Huntress
  // Basics to bank 10 Concerto for a free swap-cancel every rotation after) is skipped here — this Loop
  // is what every rotation after the first actually looks like.
  'Rebecca': [
    { type: 'Intro', skill: "Yo, It's Big Boomin' Time!", note: 'Swap into her (starts in Huntress mode) — fires automatically, dashes in and sprays lead, then auto-switches her to Guts mode.' },
    { type: 'Basic ATK', skill: 'Guts Stage 1-3', note: 'Tap Basic Attack 3 times in Guts mode — builds Fervor toward the 120 cap, each hit ignoring 15% of the target\'s DEF.' },
    { type: 'Skill', skill: "It's Big Boomin' Time!", note: 'Press Skill — sprays lead and switches her back to Huntress mode (gains +30% Crit DMG there).' },
    { type: 'Forte', skill: 'Rat-tat-tat!: Huntress', note: 'Once Fervor hits 120/120, HOLD Basic Attack (Heavy Attack is replaced automatically) then release it right as the prompt appears — cancel its ending endlag by immediately pressing Liberation below.' },
    { type: 'Liberation', skill: "Party 'til Dawn!", duration: 9.5, note: 'Press Liberation right after the Forte Heavy Attack to cancel its endlag — deploys the Mk. 31 HMG for 9.5s: she fires automatically dealing Basic ATK DMG, and pressing/holding Basic Attack or Liberation during the channel enhances the gun\'s firepower (up to 2 times), building Overload (max 90) faster.' },
    { type: 'Liberation', skill: 'BOOM! Fireworks!', note: 'Fires automatically once the 9.5s channel ends or Overload hits 90 — swap out right as it lands to cancel the ending animation (this banks 10 Concerto Energy for the next loop, so future rotations skip straight from Skill into the Forte Heavy Attack with no extra Basics needed).' },
    { type: 'Outro', skill: 'Preem Choom', duration: 14, note: 'Triggers automatically on swap-out. Summons a turret dealing 2.5% Electro DMG per hit for 14s, and grants the incoming Resonator +15% All DMG Amp for 14s plus a stacking Heavy ATK DMG Amp (0.5%/0.2s, up to +35%) for as long as they stay on-field.' },
  ],
  // Standard "Loop Rotation" — sourced from the source's "Gameplay and teams" tab for Lucy (2026-08-18,
  // Chrome UA + google.com referer + jsRender). Her Ultimate is best used as the very first action of a
  // fight (an "Opener" cast before this Loop even starts, swap-cancelled immediately) since her best
  // teams take 25+ seconds to cycle back to her — that opener is omitted here in favor of this repeating Loop.
  'Lucy': [
    { type: 'Intro', skill: 'Outdated Hallucination', note: 'Swap into her — fires automatically, grants the team wallhack vision for 25s and (if Rebecca\'s turret is out) boosts its DMG for 4s.' },
    { type: 'Skill', skill: 'Payload', note: 'Press Skill — charges forward, applies Hack: Shifting, and auto-chains into a follow-up hit that activates Pulse Interference below.' },
    { type: 'Skill', skill: 'Pulse Interference', note: 'Fires automatically off the Payload follow-up — briefly Stagnates the target and grants Digital Handshake: while she stays on-field and out of Algorithm Compaction, she now passively gains TCP every second.' },
    { type: 'Basic ATK', skill: 'Locked Thread Stage 2-4', note: 'Tap Basic Attack 3 more times (Stage 2 through 4) — builds the last of her TCP toward 100. Cancel Stage 4\'s endlag by immediately pressing Skill.' },
    { type: 'Skill', skill: 'Deadlock', note: 'Once TCP hits 100/100, her Skill is replaced by this automatically — press Skill to fire it (counted as Heavy ATK DMG), applying Hack: Shifting and putting her into Algorithm Compaction for 8s (also grants +65% Spectro DMG Bonus for 8s and 1 stack of SQL).' },
    { type: 'Basic ATK', skill: 'Thread Shredding Stage 1-4', note: 'Now in Algorithm Compaction, tap Basic Attack 4 times — her Basic Attack is auto-replaced by this stronger combo, building Root Access toward 100.' },
    { type: 'Heavy ATK', skill: 'Dual Threading', note: 'Once Root Access hits 100/100, her Heavy Attack is replaced by this automatically — press Heavy Attack to consume all Root Access and auto-chain straight into Multi-threading below.' },
    { type: 'Heavy ATK', skill: 'Multi-threading', note: 'Fires automatically off Dual Threading — consumes her banked SQL stack for a +270% DMG Multiplier bonus and applies Hack: Shifting. Cancel its endlag by immediately pressing Liberation.' },
    { type: 'Liberation', skill: 'Old Net Deep Dive', duration: 10, note: 'Press Liberation right after Multi-threading — an upgraded Ultimate that freezes time for 10s. Pick the first 5 Spoofing Programs from the top of the list (best mix of DMG and debuffs) as she marks targets in view, then hold Basic Attack (or wait out the timer) to trigger Override, an AoE Heavy ATK-type nuke on all marked targets that closes the interface.' },
    { type: 'Echo', skill: 'Use Echo', note: 'Summon your equipped Echo (Nightmare: Adam Smasher) at any point in the rotation for extra Crit Rate.' },
    { type: 'Outro', skill: 'Countermeasure Program', duration: 14, note: 'Swap out to trigger this automatically. Grants the incoming Resonator +25% Basic ATK DMG Amp for 14s (lost on swap), plus a team-wide 25s buff: any teammate applying Hack: Shifting gains +20% All DMG Amp, and Lucy grants +30% DMG Reduction for 3s to any teammate hit (once per buff instance).' },
  ],
  // Standard Rotation (easier non-Jump-Cancel variant) — sourced from the source's "Gameplay and teams" tab
  // for Denia (2026-08-18, Chrome UA + google.com referer + jsRender). Works in either Resonance Mode
  // (Fusion Burst or Tune Strain, picked before combat) — only the Outro's payoff differs between them.
  // Step types/names corrected 2026-09-01 to match SKILL_MULTIPLIERS.Denia's rebuilt rows above: Banish
  // Stage 2 and Erosion Field moved off 'Skill'/'Forte' to 'Liberation' (each "considered Resonance
  // Liberation DMG" per its own move text); 'Banish Stage 1'/'Banish Stage 2' never substring-matched the
  // old combined row name at all.
  'Denia': [
    { type: 'Intro', skill: "It's Been A While!", note: 'Swap into her in Stagecraft Form — fires automatically, grants 25 Void Particle and 1 Dark Core.' },
    { type: 'Basic ATK', skill: 'Stagecraft Form Stage 1-4', note: 'Tap Basic Attack ONCE — cancel its endlag by immediately pressing Skill.' },
    { type: 'Skill', skill: 'Phantom Bubble - Stagecraft Form', note: 'Press Skill — pulls in nearby targets and grants 25 more Void Particle. Cancel its ending instantly by pressing Liberation.' },
    { type: 'Liberation', skill: 'Final Act: Stagecraft Form', duration: 12, note: 'Press Liberation — deals a hit and grants Entropy Shift: Breakdown Form (+30% ATK) for 12s, then switches her to Breakdown Form.' },
    { type: 'Basic ATK', skill: 'Breakdown Form Stage 1-4', note: 'Tap Basic Attack 4 times (ground or mid-air, either works) — builds Conformal Charge toward 100, each hit inflicting Fusion Burst or Tune Strain - Shifting depending on her Resonance Mode.' },
    { type: 'Skill', skill: 'Banish - Breakdown Form Stage 1', note: 'Press Skill (replaces Beckon while holding a Dark Core) — pulls in targets. Press Basic Attack or Skill again shortly after for Stage 2.' },
    { type: 'Liberation', skill: 'Banish - Breakdown Form Stage 2', note: 'Consumes all held Dark Cores for a hit that gets +150% DMG Multiplier per Dark Core spent (counted as Resonance Liberation DMG). Cancel its ending instantly by pressing Liberation.' },
    { type: 'Liberation', skill: 'Final Act: Breakdown Form', note: 'Once Conformal Charge hits 100/100, press Liberation — consumes all Conformal Charge and Void Particle for the 2nd Ultimate, grants Entropy Shift: Stagecraft Form for 30s, and switches her back to Stagecraft Form.' },
    { type: 'Liberation', skill: 'Erosion Field', duration: 30, note: 'Deploys automatically off the 2nd Ultimate — a 30s off-field zone that pulls in and hits nearby targets every 4s (counted as Resonance Liberation DMG), applying Fusion Burst/Tune Strain even after Denia swaps out.' },
    { type: 'Echo', skill: 'Use Echo', note: 'In Fusion Burst mode, use your Echo at any convenient point in the rotation. In Tune Strain mode, swap-cancel it right before swapping out for Outro instead.' },
    { type: 'Outro', skill: 'Unfinished Lies', duration: 30, note: 'Triggers automatically on swap-out. In Fusion Burst mode, Amplifies Fusion Burst DMG near the active Resonator by +60% for 30s. In Tune Strain mode, grants the incoming Resonator +15% All DMG Amp for 16s (jumping to +40% once they apply Tune Strain themselves) instead.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Hiyuki (2026-08-18,
  // Chrome UA + google.com referer + jsRender).
  // Step types corrected 2026-09-01 to match SKILL_MULTIPLIERS.Hiyuki's rebuilt rows above: Frostedge,
  // Frost Splinter: Present Self, the Foreclaimed Self Basic/Heavy ATK combo, and Iai are all "considered
  // Resonance Liberation DMG" per their own move text despite being cast from Intro/Basic/Heavy slots —
  // moved off 'Intro'/'Basic ATK'/'Heavy ATK' to 'Liberation'. Under the old types+names these steps had
  // nothing to match (the row itself didn't even hold a real number in most cases) and were silently
  // resolving to 0 DMG.
  'Hiyuki': [
    { type: 'Liberation', skill: 'Frostedge', note: 'Swap into her — fires automatically, restores 200 of 300 Dedication and applies 1 stack of Glacio Chafe.' },
    { type: 'Basic ATK', skill: 'Present Self Stage 1-3', note: 'Tap Basic Attack ONCE — since Intro left her primed, this lands Stage 3 directly, restoring the last 100 Dedication (now 300/300) and applying another Glacio Chafe stack.' },
    { type: 'Liberation', skill: 'Frost Splinter: Present Self', note: 'Once Dedication is capped, HOLD Basic Attack (her Heavy Attack is replaced automatically) — fires 3 arrows in a row, interruption-immune throughout, applying Glacio Chafe on the last hit. Cancel its ending as soon as possible by pressing Liberation.' },
    { type: 'Liberation', skill: 'Foreclaiming: Inward Vision', note: 'Press Liberation right after the arrows — no Energy cost, deals a hit applying 4 stacks of Glacio Chafe, grants 3 Frostharden Iai, consumes all 300 Dedication and Frostheart, and enters Foreclaimed Self while restoring 50 Frostheart.' },
    { type: 'Liberation', skill: 'Foreclaimed Self Stage 1-3', note: 'Tap Basic Attack 3 times — her Basic Attack is auto-replaced by this stronger combo (counted as Resonance Liberation DMG), building Frostheart; Stage 3 applies Glacio Chafe. Cancel Stage 3\'s endlag by immediately pressing Skill.' },
    { type: 'Skill', skill: 'Frostblight: Jade Cleave', note: 'Press Skill — pulls in targets and restores more Frostheart.' },
    { type: 'Skill', skill: 'Frostblight: Petalfall', note: 'Press Skill again (mid-air variant, shares a cooldown with Jade Cleave but is a separate follow-up here) — restores more Frostheart.' },
    { type: 'Liberation', skill: 'Foreclaimed Self Stage 1-3', note: 'Tap Basic Attack 3 more times — Stage 3 again applies Glacio Chafe. Cancel its endlag by pressing Dodge.' },
    { type: 'Liberation', skill: 'Iai', note: 'Once Frostheart hits 100+, press Dodge to flash back and enter Iai Stance, then tap Basic Attack up to 3 times in a row (each cast costs 100 Frostheart, counted as Resonance Liberation DMG) — each cast consumes 1 Frostharden Iai stack for 3 more Glacio Chafe stacks and grants 1 Whiteout Bitterfrost, capping at 3.' },
    { type: 'Liberation', skill: 'Bitterfrost: Foreclaimed Self', note: 'Once Whiteout Bitterfrost hits 3/3, HOLD Basic Attack (Heavy Attack replaced automatically) — consumes STA and all 3 Whiteout Bitterfrost for a hit that applies Glacio Chafe and grants 1 Snowforged Blade.' },
    { type: 'Liberation', skill: 'Foreclaiming: Blade Liberation', note: 'HOLD Liberation to charge (consuming Snowforged Blade stacks for extra DMG Multiplier) then release — consumes all remaining Dedication/Frostheart and ends Foreclaimed Self.' },
    { type: 'Echo', skill: 'Use Echo', note: 'Summon your equipped Echo (Reminiscence: Threnodian) at any point in the rotation.' },
    { type: 'Outro', skill: 'Snowlight Blessing', duration: 20, note: 'Swap out to trigger this automatically. For 20s, nearby teammates other than Hiyuki deal +20% Glacio DMG Amp against targets affected by Glacio Chafe.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Sigrika (2026-08-18,
  // Chrome UA + google.com referer + jsRender). Omits the harder Quickswap-only "Double Outburst" variant.
  'Sigrika': [
    { type: 'Intro', skill: 'Solsworn Etymology', note: 'Swap into her — fires automatically, deals Aero DMG.' },
    { type: 'Basic ATK', skill: 'Stage 2-4', note: 'Tap Basic Attack 3 times — the full chain (started from Stage 2 since Intro primed her) enters Decipher state for 5s on the last hit.' },
    { type: 'Basic ATK', skill: 'Elucidated', note: 'Tap Basic Attack once more while in Decipher — grants 1 Rune: Trust (counted as Echo Skill DMG).' },
    { type: 'Forte', skill: 'Heavy ATK: Schemata of Runes (Chain Whip)', note: 'HOLD Basic Attack — since Intro granted a matching bonus Rune, this consumes 2 Runes of the same type for Runic Chain Whip (Stagnates nearby targets). Cancel its ending on-hit by immediately pressing Liberation.' },
    { type: 'Liberation', skill: 'Where Trust Leads Me!', note: 'Press Liberation right after the Heavy Attack lands — deals a hit (counted as Echo Skill DMG) and grants Divergent for 20s, so her next gained Rune also grants a free bonus Rune of the opposite type.' },
    { type: 'Basic ATK', skill: 'Stage 2-4', note: 'Tap Basic Attack 3 times again — Divergent means this chain\'s Rune gain doubles into 2 Runes of opposite types.' },
    { type: 'Basic ATK', skill: 'Elucidated', note: 'Tap Basic Attack once more in Decipher to cash in the Rune gain.' },
    { type: 'Forte', skill: 'Heavy ATK: Schemata of Runes (Runic Outburst)', note: 'HOLD Basic Attack again — this time consuming 2 different-type Runes for Runic Outburst (pure bonus DMG, no extra effect). Cancel its ending on-hit by holding Skill.' },
    { type: 'Forte', skill: 'Learn My True Name', note: 'Once Full Stop hits 100/100, HOLD Skill (consuming all Full Stop) right after the Heavy Attack lands — her big Forte nuke finisher, counted as Echo Skill DMG.' },
    { type: 'Echo', skill: 'Use Echo', note: 'Use your equipped Echo (Nameless Explorer) at any point in the rotation.' },
    { type: 'Outro', skill: 'In This Very Moment', duration: 30, note: 'Swap out to trigger this automatically — a big 795% ATK hit, and grants Sigrika (if she re-enters) 2 stacks of Encapsulated for 30s, Stagnating targets whenever a nearby teammate casts their own Echo Skill.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Luuk Herssen (2026-08-18,
  // Chrome UA + google.com referer + jsRender). Golden Rule (his Intro-triggered team buff cycle) means he
  // rotates on a strict ~25s cooldown and cannot be quickswapped mid-rotation.
  'Luuk Herssen': [
    { type: 'Intro', skill: 'Before Injection of Dawn', note: 'Swap into him — fires automatically, restores 100 Ichor Flow and grants Dawnlit Keep (a free damage-reduction/interruption-immunity charge).' },
    { type: 'Mid-air', skill: 'Jump: Scythe Resection Stage 2-3', note: 'Jump, then press Jump again twice (not Basic Attack — the Jump-input string does slightly more damage/Energy) for a 2-hit airborne combo, restoring Ichor Flow.' },
    { type: 'Skill', skill: 'Aureole of Execution: Ring', note: 'Press Skill right after the Mid-air combo — deals Spectro DMG, resets the Mid-air Attack cycle, and grants 1 stack of Endnotes on the Endgame (buffs his Ultimate). Unlocks a Golden Impale follow-up.' },
    { type: 'Basic ATK', skill: 'Golden Impale', note: 'Tap Basic Attack once to fire it, then IMMEDIATELY press Dash to interrupt/cancel its animation — this move barely damages but its wind-up is long, so cutting it short saves real time without losing the Ring proc.' },
    { type: 'Mid-air', skill: 'Basic 1 → Jump: Resection 2-3', note: 'Jump straight back into the airborne combo (Basic Attack once, then Jump-input twice) for the 2nd cycle.' },
    { type: 'Skill', skill: 'Aureole of Execution: Breach', note: 'Press Skill — spins forward hitting enemies in the path, resets Mid-air Attack cycle, hurls an Ichor Blade, and grants another Endnotes stack. Unlocks Golden Impale again.' },
    { type: 'Basic ATK', skill: 'Golden Impale', note: 'Tap Basic Attack once, then immediately Dash to cancel it again.' },
    { type: 'Mid-air', skill: 'Basic 1 → Jump: Resection 2-3', note: 'Jump back in for the 3rd airborne combo cycle.' },
    { type: 'Skill', skill: 'Aureole of Execution: Glare', note: 'Press Skill — hurls Solid-State Ichor forming an Ichor Deposit on the ground, grants the 3rd Endnotes stack, and unlocks a special plunging Mid-air Attack.' },
    { type: 'Forte', skill: 'Mid-air Attack: Gavel of Earthshaker', note: 'Press Basic Attack while airborne — slams down to detonate the Ichor Deposit for a big hit and fully restores STA. Cancel its endlag by immediately pressing Liberation.' },
    { type: 'Liberation', skill: "Rewritten in Winter's Margins", note: 'Press Liberation right after the plunge lands — his big single-hit nuke, empowered +25% per Endnotes stack (up to +75% with all 3 banked).' },
    { type: 'Skill', skill: 'Golden Reflux', note: 'Press Skill once more (base Skill, off cooldown by now) right before swapping out, to help bank Concerto Energy for the Outro.' },
    { type: 'Outro', skill: 'Bow to the Last Light', note: 'Swap out to trigger this automatically — a flat 500% ATK Spectro hit, and refreshes Golden Rule on the team (25s cycle) so the next time Luuk swaps in, he starts with a full Forte gauge again.' },
  ],
  // Standard "Loop Rotation" — sourced from the source's "Gameplay and teams" tab for Suisui (2026-08-18,
  // Chrome UA + google.com referer + jsRender), used whenever an Intro is available (her separate, longer
  // "Opener Rotation" building up from Zephyr Stance is used only when it isn't).
  'Suisui': [
    { type: 'Intro', skill: 'Tinkling Jade', note: 'Swap into her — fires automatically, inflicts 1 stack of Glacio Chafe, consumes all Cloud Breath to pull in nearby targets, and immediately enters Drizzle Stance.' },
    // Capitalization corrected 2026-09-01 from 'Drizzle Stance Thrust' (capital T), which never
    // matched the SKILL_MULTIPLIERS row name 'Drizzle Stance thrust' (case-sensitive substring
    // match) and was silently resolving to 0 DMG.
    { type: 'Skill', skill: 'Drizzle Stance thrust', note: 'Press Skill — thrusts forward and restores Floral Epistle. Cancel its ending on the first hit by immediately pressing Dash (optional — only saves a few frames, skip it if the timing is tight).' },
    { type: 'Basic ATK', skill: 'Drizzle Stance Stage 1-4', note: 'Tap Basic Attack 4 times — each hit restores more Floral Epistle toward the 600 cap; Stage 4 also inflicts Glacio Chafe. Cancel Stage 4\'s endlag by immediately pressing Liberation.' },
    { type: 'Liberation', skill: 'Song of Thoroughfare', duration: 30, note: 'Press Liberation right after Basic Attack Stage 4 to cancel its endlag — deploys Ceaseless Landscape for 30s, raising the max stack limit of Negative Statuses on affected targets by 3 for 15s per application, and letting DEF Ignore/RES Shred trigger off Havoc Bane consumption.' },
    { type: 'Outro', skill: 'Rippling Waters', duration: 30, note: 'Swap out to trigger this automatically. Grants the team +25% All DMG Amp for 30s; consumes all her banked Floral Epistle (aim for 400-600) to enter Roaming Transcendent for 30s, periodically performing Plume Steps that re-apply Glacio Chafe, heal the active Resonator, and grant Reflecting Shadows (extra interruption resistance) — the more Floral Epistle spent, the more Plume Steps and the stronger the follow-up ATK buff on future Outros.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Yangyang: Xuanling
  // (2026-08-18, Chrome UA + google.com referer + jsRender).
  'Yangyang: Xuanling': [
    { type: 'Intro', skill: 'Skybound Feather', note: 'Swap into her — fires automatically, applies 1 stack of Havoc Bane and grants 1 point of Azure Plume.' },
    { type: 'Basic ATK', skill: 'Azure Sword Stance Stage 1-4', note: 'Tap Basic Attack 4 times (default Azure Stance) — consumes Melody as it goes, Stage 4 applies another Havoc Bane stack.' },
    { type: 'Skill', skill: 'Sword Stance Switch', note: 'Press Skill — switches her to Feather Sword Stance and fires its Stage 1 automatically.' },
    { type: 'Heavy ATK', skill: 'Heavy Attack: Feather Sword Stance', note: 'Once Azure Plume is capped, HOLD Basic Attack (Heavy Attack replaced) — applies 2 Havoc Bane stacks and grants Streaming Storm (+160% Crit DMG on the next few Feather-stance hits), then auto-chains into Mid-air Attack: Feather Fall.' },
    { type: 'Mid-air', skill: 'Feather Fall', note: 'Fires automatically off the Heavy Attack — consumes Azure Plume and grants Hark the Wind for 12s, upgrading her Basic Attack to Havoc in Bloom.' },
    { type: 'Basic ATK', skill: 'Havoc in Bloom Stage 1-3', note: 'Tap Basic Attack 3 times — auto-replaces her normal Basic Attack while Hark the Wind is active (counted as Heavy ATK DMG). Cancel Stage 3\'s endlag by immediately pressing Liberation.' },
    { type: 'Liberation', skill: 'Hush of a Thousand Voices', note: 'Press Liberation right after Havoc in Bloom Stage 3 — consumes all Melody for a hit (counted as Heavy ATK DMG) and restores 1 Azure Plume.' },
    { type: 'Skill', skill: 'Sword Stance Switch', note: 'Press Skill again — switches back to Azure Sword Stance.' },
    { type: 'Heavy ATK', skill: 'Heavy Attack: Azure Sword Stance', note: 'Once Azure Plume is capped again, HOLD Basic Attack — a big cyclone hit applying 2 more Havoc Bane stacks, gets bonus Crit DMG from Bated Breath if this is her first Heavy Attack cast in the last 25s.' },
    { type: 'Echo', skill: 'Use Echo', note: 'Use your equipped Echo (Thousand-Puppet Pavilion) as early in the rotation as possible — it deals periodic DMG as Havoc Bane keeps getting applied.' },
    { type: 'Outro', skill: 'As the Wind Wills', duration: 20, note: 'Swap out to trigger this automatically — a flat 300% ATK hit, and grants every other teammate Tonal Switch for 20s: the next time they apply Havoc Bane, their own Havoc DMG is Amplified by +20%.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Aemeath (2026-08-18,
  // Chrome UA + google.com referer + jsRender). Skips the harder Quickswap/S1-Opener variants for a
  // baseline non-Quickswap loop. Works in either Resonance Mode (Tune Rupture or Fusion Burst).
  'Aemeath': [
    { type: 'Skill', skill: 'Form Switch', note: 'Before the fight even starts (or right on swap-in), press Skill once to switch into Mech Form ahead of Intro — Mech Form\'s Basic Attacks cancel into the next step slightly faster than her base form\'s.' },
    { type: 'Intro', skill: 'Debut of Meteoric Radiance', note: 'Swap into her in Mech Form — fires automatically, restores 40 Synchronization Rate and applies Tune Rupture/Fusion Burst depending on her Resonance Mode.' },
    { type: 'Basic ATK', skill: 'Mech Stage 3-4', note: 'Tap Basic Attack twice — builds more Synchronization Rate. Cancel Stage 4\'s first-slash endlag by immediately pressing Liberation.' },
    { type: 'Liberation', skill: 'Heavenfall Edict: Overdrive', duration: 30, note: 'Press Liberation — deals a hit, switches/stays in Mech Form, enters Stardust Resonance for 30s (empowers her next 2 Seraphic Duet casts) and Heavenfall Edict: Unbound for 60s (unlocks the 2nd Ultimate once both Forte gauges cap).' },
    { type: 'Basic ATK', skill: 'Mech Stage 2-4', note: 'Tap Basic Attack 3 times — more Synchronization Rate. Cancel Stage 4\'s endlag by immediately pressing Skill.' },
    { type: 'Skill', skill: 'Seraphic Duet: Encore', note: 'Once Synchronization Rate hits 100+ in Mech Form, press Skill — consumes 100 Synchronization Rate for a hit (counted as Liberation DMG, empowered by Stardust Resonance) and switches her to base Aemeath Form.' },
    { type: 'Basic ATK', skill: 'Aemeath Stage 2-4', note: 'Tap Basic Attack 3 times in base form — more Synchronization Rate. Cancel Stage 4\'s endlag by immediately pressing Skill.' },
    { type: 'Skill', skill: 'Seraphic Duet: Overture', note: 'Once Synchronization Rate hits 100+ again, press Skill — consumes it for another empowered Liberation-type hit and switches back to Mech Form.' },
    { type: 'Heavy ATK', skill: 'Heavy Attack - Mech: Charged II', note: 'HOLD Basic Attack and hold longer for Charged II — since Resonance Rate is now capped from the 2 Duet casts and Instant Response is active, this fully refills Synchronization Rate to 200/200 (counted as Liberation DMG). Cancel its endlag by immediately pressing Liberation.' },
    { type: 'Liberation', skill: 'Heavenfall Edict: Finale', note: 'Press Liberation (or Skill) right after the Heavy Attack — consumes all Synchronization Rate and Resonance Rate for her huge 2nd Ultimate nuke, ending Heavenfall Edict: Unbound and switching back to Aemeath Form.' },
    { type: 'Skill', skill: 'Form Switch', note: 'Press Skill once more to swap back into Mech Form before swapping out (keeps future rotations consistent).' },
    { type: 'Echo', skill: 'Use Echo', note: 'Use your equipped Echo (Sigillum) at any convenient point in the rotation.' },
    { type: 'Outro', skill: 'Silent Protection', duration: 20, note: 'Swap out to trigger this automatically. Grants every other teammate +10% All DMG Amp for 20s, rising to +20% for whichever of them personally applies Tune Rupture or Fusion Burst (matching Aemeath\'s current Resonance Mode).' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Lynae (2026-08-18, Chrome UA
  // + google.com referer + jsRender). Omits the S6-only alternate rotation (which skips Spark Collision).
  'Lynae': [
    { type: 'Intro', skill: 'Time to Show Some Colors!', note: 'Swap into her — fires automatically, restores 100 Overflow and inflicts Photochromic Flux (Tune Rupture or Tune Strain, per her chosen Resonance Mode). Cancel its endlag by immediately pressing Liberation.' },
    { type: 'Liberation', skill: 'Prismatic Overblast', note: 'Press Liberation right after Intro — grants the whole nearby team +24% All DMG Bonus for 30s. (Its automatic Basic Attack follow-up isn\'t worth chasing — skip straight to Skill.)' },
    { type: 'Skill', skill: 'Lynae-Style Palettes', note: 'Press Skill — restores more Overflow toward the 120 cap.' },
    { type: 'Heavy ATK', skill: 'Spark Collision (full charge)', note: 'Once Overflow is capped, HOLD Basic Attack and keep holding until Lumiflow fully charges (interruption-immune and 50% DMG Reduction throughout) — releases Spark Collision Lv.3, the strongest tier, and puts her into Kaleidoscopic Parade. Cancel its ending by immediately pressing Jump.' },
    { type: 'Basic ATK', skill: 'Polychrome Leap ×3', note: 'Press Jump 3 times in a row — each cast in Kaleidoscopic Parade consumes 1/3 of her Lumiflow and grants 1 point of True Color (caps at 3), inflicting Photochromic Flux each time.' },
    { type: 'Forte', skill: 'Mid-air Attack: Visual Impact', note: 'With all 3 True Color banked, press Basic Attack (or Skill) while airborne — her big Forte finisher, consuming all 3 True Color, inflicting Photochromic Flux, and granting the nearby team +40 Tune Break Boost for 30s.' },
    { type: 'Outro', skill: "Let's Hit the Road!", duration: 14, note: 'Swap out to trigger this automatically (also ends Kaleidoscopic Parade) — a 100% Spectro DMG hit, and grants the incoming Resonator +15% All DMG Amp and +25% Resonance Liberation DMG Amp for 14s or until they swap out.' },
  ],
  // Standard "Loop Rotation" — sourced from the source's "Gameplay and teams" tab for Mornye (2026-08-18,
  // Chrome UA + google.com referer + jsRender), used whenever an Intro is available (her Opener, needed
  // only when it isn't, spends 3 Basics + a Heavy Attack first to reach Wide Field Observation Mode).
  'Mornye': [
    { type: 'Intro', skill: 'Convergence', note: 'Swap into her — fires automatically, deals a hit, then jumps into mid-air, clears Rest Mass Energy, and immediately enters Wide Field Observation Mode for 30s (also generates a Syntony Field: team healing, +50% Off-Tune Buildup Rate, extra interruption resistance for 25s).' },
    { type: 'Basic ATK', skill: 'Wide Field Observation Mode Stage 1-3', note: 'Tap Basic Attack 3 times — her Basic Attack is auto-replaced by this while in the enhanced state, building Relative Momentum toward 100. Cancel Stage 3\'s endlag on-hit by immediately pressing Skill.' },
    { type: 'Skill', skill: 'Distributed Array', note: 'Press Skill right after Stage 3 lands — heals the team and summons Hover Cannons for more Fusion DMG, building the last of Relative Momentum.' },
    { type: 'Forte', skill: 'Heavy Attack: Inversion', note: 'Once Relative Momentum hits 100/100, HOLD Basic Attack (Heavy Attack replaced) — consumes it all for a hit (counted as Heavy ATK DMG) that inflicts Observation Marker on the target for 30s. Cancel its endlag on-hit by immediately pressing Liberation.' },
    { type: 'Liberation', skill: 'Critical Protocol', duration: 25, note: 'Press Liberation right after Inversion lands — hits the area, and replaces the Syntony Field with a stronger High Syntony Field for 25s (adds +20% team DEF and +40% Healing Multiplier on top of the base field\'s effects).' },
    { type: 'Echo', skill: 'Use Echo', note: 'Use your equipped Echo (Reactor Husk) right after Liberation and swap-cancel it — or before Liberation if running Fallacy of No Return instead.' },
    { type: 'Outro', skill: 'Recursion', duration: 30, note: 'Swap out to trigger this automatically. Grants the whole team +25% All DMG Amp for 30s. (Whenever any teammate lands Tune Break damage on a target Mornye marked with Observation Marker, it upgrades to an Interfered Marker, boosting nearby teammates\' DMG on that target — up to +40% scaling with Mornye\'s Energy Regen above 100%.)' },
  ],
  // Corrected 2026-08-17 against the source's live "Gameplay and teams" rotation: the previous entry never
  // used a single Basic ATK, put the base Skill (Eye of Unraveling — barely worth casting outside the
  // Opener per the source) before the Liberation, and skipped straight to Sawring - Blitz 1-3 instead of
  // matching the actual Basic ATK → Liberation → Serrated Loop → Blitz 2-3 → Eradication loop. Rebuilt
  // to match the source's actual "Loop Rotation" (used every rotation after the Opener).
  'Chisa': [
    { type: 'Intro', skill: 'Reverberance - Return', note: 'also grants +20% Havoc DMG/Healing Bonus for 12s (Inherent Skill)' },
    { type: 'Basic ATK', skill: 'Stage 2, Rending Lunge, Death Snip', note: 'Death Snip endlag partially cancelled by the Liberation' },
    { type: 'Liberation', skill: 'Moment of Nihility', duration: 15, note: 'heals the team, enters Woven Myriad - Convergence' },
    { type: 'Skill', skill: 'Serrated Loop', note: 'at full Ring of Chainsaw — enters Chainsaw Mode' },
    { type: 'Forte', skill: 'Sawring - Blitz 2-3', note: 'Chainsaw Mode combo' },
    { type: 'Forte', skill: 'Sawring - Eradication', duration: 30, note: 'scales with Ring of Chainsaw consumed, grants team Shield, swap-cancel out' },
    { type: 'Outro', skill: 'Unraveling - Law Zero', duration: 20, note: 'next Resonator can stack +3 more Negative Status/Electro Rage' },
  ],
  // Corrected 2026-08-17 against the source's live "Gameplay and teams" rotation: the previous entry
  // included Encroach and Volley of Death as rotation steps and put the Liberation after the Demon
  // Hypostasis combo — but the source's own review explicitly lists her base Resonance Skill and all Heavy
  // Attacks as unused in practice (Basic Attacks/Dodge Counters restore Forte fastest and hit harder),
  // and the Liberation must be cast BEFORE entering the Demon Hypostasis combo since its +85% DMG Mult
  // buff applies to those very attacks. Rebuilt to match the source's actual "Standard Rotation".
  // Step types/names corrected 2026-09-01 to match SKILL_MULTIPLIERS.Galbrena's rebuilt rows above (see
  // that section's comment for the Lv.1-vs-Lv.10 and type-reclassification fixes): Ascent of Malice and
  // Hellfire Absolution moved off 'Skill'/'Liberation' to the types their own move text is "considered"
  // as (Heavy ATK / Echo respectively) — under the old types+names, both steps had nothing to match and
  // were silently resolving to 0 DMG, and the whole Basic Attack/Seraphic Execution combo strings never
  // matched anything either. Split into per-stage steps that substring-match the new per-stage rows.
  // Rebuilt 2026-09-04 (Phase A audit) against the dump's own "Standard Rotation" text verbatim:
  // "Intro → Basic P2 → Basic P3 → Basic P4 → Basic P2 → Basic P3 → Skill: Ascent of Malice (interrupt
  // animation on hit) → Ultimate (Hellfire Absolution) → Forte: Basic P2 → P3 → P4 → P5 → P3 → P4 → P5
  // (Swap) → Outro." The prior entry silently dropped the pre-Skill P2→P3 REPEAT (kit text: "Basic
  // Attack Stage 4 → Normal Attack loops back to Stage 2", builds the remaining Sinflame to cap before
  // Ascent of Malice is reachable) and the post-Liberation P3→P4→P5 REPEAT inside Demon Hypostasis
  // (only a single P2→P3→P4→P5 pass was modeled) — both real, explicitly-listed rotation steps, a bug
  // class (f)/(c) silent-gap: the whole 2nd Seraphic Execution P3/P4/P5 pass and the extra Basic P2/P3
  // pass were contributing zero DPS in the calc despite being cast in the source's own rotation.
  'Galbrena': [
    { type: 'Intro', skill: 'Hellflare Overload' },
    { type: 'Heavy ATK', skill: 'Basic Attack Stage 2', note: 'Threshold State combo, builds Sinflame (skips the weak Stage 1)' },
    { type: 'Heavy ATK', skill: 'Basic Attack Stage 3' },
    { type: 'Echo', skill: 'Basic Attack Stage 4' },
    { type: 'Heavy ATK', skill: 'Basic Attack Stage 2', note: 'Basic Attack Stage 4 loops back to Stage 2 per kit text — 2nd P2→P3 pass to finish capping Sinflame before Ascent of Malice is reachable' },
    { type: 'Heavy ATK', skill: 'Basic Attack Stage 3' },
    { type: 'Heavy ATK', skill: 'Ascent of Malice', note: 'at max Sinflame — interrupt the animation early on the Liberation hit landing (never before), enters Demon Hypostasis' },
    { type: 'Echo', skill: 'Hellfire Absolution', duration: 14, note: 'cast right after entering Demon Hypostasis so its +85% DMG Mult buffs the whole combo that follows — stack the 20% Inherent Skill DMG Amplify with one Basic Attack first' },
    { type: 'Heavy ATK', skill: 'Seraphic Execution Stage 2' },
    { type: 'Heavy ATK', skill: 'Seraphic Execution Stage 3', note: 'Dodge Counter (Purgatory Scourge) can substitute here for higher DMG and Forte if the enemy attacks' },
    { type: 'Echo', skill: 'Seraphic Execution Stage 4' },
    { type: 'Echo', skill: 'Seraphic Execution Stage 5' },
    { type: 'Heavy ATK', skill: 'Seraphic Execution Stage 3', note: '2nd Forte pass — repeats P3→P4→P5 a second time before swapping out' },
    { type: 'Echo', skill: 'Seraphic Execution Stage 4' },
    { type: 'Echo', skill: 'Seraphic Execution Stage 5', note: 'swap-cancelled — the window is earlier than expected' },
    { type: 'Outro', skill: 'Ashen Pursuit', note: 'pure-damage swap-out, no team buff, quickswap freely' },
  ],
  // Corrected 2026-08-17 against the source's live "Gameplay and teams" rotation: the previous entry put
  // her Skill before the Liberation and never mentioned the Flux jump-attack that switches her into New
  // Moon — neither matches the source's actual "Standard Sub DPS Rotation" (used alongside Augusta), which
  // opens Intro straight into Liberation, then Flux into the Moonbow combo, and skips the base Skill
  // entirely (Closing Refrain is only used in the longer "Extended"/Main DPS variants).
  // Re-verified and expanded 2026-08-31 against the wiki/Iuno/Combat's "Forte > Details"
  // section (Chrome/Windows UA + google.com referer + jsRender). Each step's `skill` string re-checked as a
  // substring of a SKILL_MULTIPLIERS.Iuno row name — see the critical bug fix noted in that table's comment
  // above ('Flux: Moonbow' had no matching row before this pass, so that step resolved to 0 DMG). Corrections:
  // Liberation's `duration: 30` field replaced (30s did not match any published duration — Lunar Cycle itself
  // lasts exactly 15s per the source's own Attribute Scaling table); Outro duration corrected 14 → 10 to match
  // the TEAM_BUFFS.Iuno fix above; exact Sentience costs/caps and the Absolute Fullness 25s internal cooldown
  // added throughout (previously vague "up to X Sentience" with no cap/cost cited).
  'Iuno': [
    { type: 'Intro', skill: 'Illuminated Manifestation', note: 'Swap into her — fires automatically, restoring 40 Sentience (cap 100).' },
    { type: 'Liberation', skill: 'Beneath Lunar Tides', duration: 15, note: 'Press Liberation — activates Lunar Cycle (15s) starting in Half Moon, and restores 60 Sentience.' },
    { type: 'Heavy ATK', skill: 'Flux: Moonbow', note: 'HOLD Heavy Attack (25 STA) — switches Half Moon → New Moon; this hit itself counts as Resonance Liberation DMG.' },
    { type: 'Basic ATK', skill: 'Moonbow 1-3', note: 'Tap Basic Attack for the Moonbow combo (counted as Resonance Liberation DMG) — while in New Moon this consumes Sentience per hit to boost its own DMG Multiplier and heal the team on hit; base values used here (see SKILL_MULTIPLIERS TODO on the unmodeled Sentience-enhanced variant).' },
    { type: 'Skill', skill: 'Arc Beyond the Edge', note: 'Press Skill for the New Moon follow-up (counted as Resonance Liberation DMG) — 2 charges, consumes Sentience per cast to boost its own DMG Multiplier; can recover Iuno from hitstun/launch. Cast 1 of 2 charges (both are spent before swapping — see the 2nd cast below).' },
    { type: 'Skill', skill: 'Arc Beyond the Edge', note: 'Cast the 2nd of 2 charges back-to-back with the 1st — her Sentience math (one full Basic chain plus both Skill charges drains a full 100-point bar) only balances with both charges spent.' },
    { type: 'Heavy ATK', skill: 'Absolute Fullness', note: 'HOLD Heavy Attack for the Forte finisher (usable once per 25s, requires full Concerto Energy) — ends Lunar Cycle, heals nearby allies, and drops a 30s Full Moon Domain; counted as Resonance Liberation DMG despite the Heavy ATK slot. Swap out on this cast (best with Augusta on the team — Full Moon Domain buffs her the most).' },
    { type: 'Outro', skill: 'From Gloom to Gleam', duration: 14, note: 'Swap out to trigger this automatically — grants the incoming Resonator +50% Heavy Attack DMG Amp for 14s, ending early if they are swapped off-field. Does not interrupt an in-progress Absolute Fullness.' },
  ],
  // Corrected 2026-08-17 against the source's live "Gameplay and teams" rotation: the previous entry
  // skipped her Mid-air Attack entirely — the step that recalls all 3 Sword Shadows and grants their
  // buffs to Fleurdelys, central to her kit — and collapsed her two-phase Fleurdelys Skill 1/Skill 2
  // loop into a single generic Basic ATK line. Rebuilt to match the source's actual "Basic Rotation".
  // Re-verified and expanded 2026-08-31 against the wiki/Cartethyia/Combat's "Forte"
  // section for exact resource numbers, the Skill1→Skill2 cast-order window, and Liberation2's exact payload
  // (previously just "removes stacked Erosion... for bonus DMG", now the real +20%/stack, max 5 stacks, formula).
  'Cartethyia': [
    { type: 'Intro', skill: "Sword to Mark Tide's Trace", note: "Swap into her — fires automatically, inflicts 2 Aero Erosion stacks, and grants Sword of Discord's Shadow (max 1, 20s duration)." },
    { type: 'Basic ATK', skill: 'Base Form 1-4', note: "Tap Basic Attack 4 times — Stage 4 inflicts 1 Aero Erosion stack and grants Sword of Divinity's Shadow (max 1, 20s duration)." },
    { type: 'Skill', skill: 'Base Form', note: "Press Skill — inflicts 2 Aero Erosion stacks and grants Sword of Virtue's Shadow (max 1, 20s duration)." },
    { type: 'Mid-air', skill: 'Cartethyia Plunging Attack', note: 'Jump then tap Basic Attack to plunge down — recalls ALL Sword Shadows currently up (max 3, one of each type). Real DMG sourced and modeled (2026-09-02, 11.29%×3 HP at the 3-Shadows-Recalled value this rotation step reaches). Since this rotation always has all 3 shadow types up by this point, all 3 buffs (Heart of Virtue / Mandate of Divinity / Power of Discord) always apply together for the Manifest window — Mandate of Divinity\'s real +50% Aero Erosion DMG Amp is modeled in cartethyia.blocks.js (2026-09-03); Heart of Virtue/Power of Discord are non-DPS CC/utility with no stat to hold.' },
    { type: 'Liberation', skill: "A Knight's Heartfelt Prayers", duration: 12, note: 'Press Liberation — costs 50% Max HP (25% at S5, free if HP already below 50%); transforms her into Fleurdelys (Manifest) for 12s and clears all Conviction to 0. Ending Manifest does NOT clear Resonance Energy.' },
    { type: 'Skill', skill: "Fleurdelys 1", note: "Press Skill for Sword to Answer Waves' Call — restores Conviction on hit." },
    // Added 2026-09-04 (Phase A audit): the dump's own "Full rotation" listing explicitly includes
    // "Mid-air Attack Stage 3 (Fleurdelys, hold Basic during Skill)" right here, between Skill 1 and the
    // Basic P3-P5 string — this step was previously missing entirely (no SKILL_MULTIPLIERS row, no
    // rotation step, no engine block), a silent zero-DMG gap on a real, always-cast rotation step.
    { type: 'Mid-air', skill: 'Fleurdelys Stage 3', note: 'Hold Basic Attack airborne during the Skill 1 cast window to cast Stage 3 directly — Aero DMG, restores Conviction.' },
    { type: 'Basic ATK', skill: 'Fleurdelys 1-5', note: 'Tap Basic Attack — chains Mid-air Plunge Stage 3 into Basic Attack Stage 3-5, restoring Conviction on hit.' },
    { type: 'Skill', skill: 'Fleurdelys 2', note: "Press Skill again for May Tempest Break the Tides — must follow Skill 1 within the game's un-numbered follow-up window (only described as \"a certain period,\" no exact seconds given) or the Skill goes on its normal 14s cooldown instead, forfeiting the Skill-2 cast for that Manifest window." },
    { type: 'Basic ATK', skill: 'Fleurdelys 1-5', note: 'Tap Basic Attack for Stage 3-5 again — builds Conviction toward the 120-point threshold that unlocks Liberation2 (exact Conviction-per-hit amount not published by source; TODO: verify).' },
    { type: 'Liberation', skill: 'Blade of Howling Squall', note: 'Available only once Conviction reaches exactly 120 (below 120, pressing Liberation instead reverts her to base Cartethyia form without ending Manifest). On cast: removes ALL Conviction, ends Manifest, restores 50% Max HP, then hits for 13.12%×7 HP DMG and strips ALL stacked Aero Erosion from the target — each stack removed Amplifies DMG taken by the target by +20%, capped at 5 stacks (+100% total).' },
    { type: 'Outro', skill: "Wind's Divine Blessing", duration: 20, note: 'Swap out to trigger this automatically — boosts the incoming teammate\'s (not Cartethyia/Fleurdelys\'s own) Aero DMG against targets with a Negative Status by +17.5% for 20s.' },
  ],
  // Standard Sub-DPS Rotation — sourced from the source's "Gameplay and teams" tab for Ciaccona (2026-08-18,
  // Chrome UA + google.com referer + jsRender).
  'Ciaccona': [
    { type: 'Intro', skill: 'Roaming with the Wind', note: 'Swap into her — fires automatically, inflicts 1 stack of Aero Erosion, and skips her straight to Basic Attack Stage 3.' },
    { type: 'Basic ATK', skill: 'Stage 3', note: 'Tap Basic Attack — resumes into Stage 3 off the Intro\'s combo-continue window.' },
    { type: 'Basic ATK', skill: 'Stage 4', note: 'Tap Basic Attack again — inflicts another Aero Erosion stack and grants 1 Musical Essence, then automatically starts a Solo Concert (24% Aero DMG Bonus to the nearby team).' },
    { type: 'Mid-air', skill: 'Attack Stage 1-2', note: 'Press Jump immediately to cancel Basic Stage 4\'s Solo Concert animation early — this spawns a free "Ensemble Sylph" that finishes the attack and keeps Solo Concert active at no cost. While airborne, tap Basic Attack twice for the 2-hit Mid-air combo.' },
    { type: 'Basic ATK', skill: 'Stage 4', note: 'Mid-air Attack Stage 2 auto-chains into Basic Attack Stage 4 — tap Basic Attack once, granting a 2nd Musical Essence.' },
    { type: 'Skill', skill: 'Harmonic Allegro', note: 'Press Skill to cancel Basic Stage 4\'s ending — inflicts another Aero Erosion stack and restores Concerto Energy.' },
    { type: 'Forte', skill: 'Quadruple Downbeat', note: 'Once Musical Essence hits 3/3, HOLD Basic Attack (Heavy Attack replaced) — consumes all 3 for a big pull-in hit, inflicting Aero Erosion and restoring a large 25 Concerto Energy.' },
    { type: 'Liberation', skill: "Singer's Triple Cadenza", note: 'Press Liberation right as the Heavy Attack hits, to cancel its ending — a big AoE hit that enters Recital: for the duration, sound waves let her tap the green (Aero Erosion) or yellow (Spectro Frazzle) prompt for a periodic Symphonic Poem: Tonic pulse, even off-field.' },
    { type: 'Liberation', skill: 'Symphonic Poem: Tonic', note: 'Optional: tap the on-screen prompt once to switch her Recital mode to Spectro Frazzle if your team needs it instead of Aero Erosion — otherwise she stays on Aero Erosion by default.' },
    { type: 'Outro', skill: 'Windcalling Tune', duration: 30, note: 'Swap out to trigger this automatically (Recital persists off-field, still pulsing Tonics on its own). Amplifies Aero Erosion DMG near the active Resonator by +100% for 30s.' },
  ],
  // Standard DPS Rotation — re-verified in full 2026-08-31 against the wiki/Zani/Combat
  // (Instructions + Forte Details sections) cross-checked against the source/wuthering-waves/characters/zani's
  // Kit + "Gameplay and teams" tabs (Chrome UA + google.com referer + jsRender, both live). Needs a Spectro
  // Frazzle applier (Phoebe ideally) on the team — Zani converts their Frazzle into Heliacal Ember/Blaze
  // automatically, she can't apply it herself. Corrections this pass: Standard Defense Protocol's block stance
  // duration/reduction and its "ends early if swapped off-field" forfeit condition added (was previously just
  // "up to 2s, 100% reduction for 1 hit" with no swap-cancel note); Targeted Action/Forcible Riposte step now
  // states the exact Sunburst payoff (+20% Spectro Frazzle DMG, 14s) both casts grant, not just "applies 1
  // Heliacal Ember and grants Blaze"; Rekindle step now states its exact +25% Basic ATK DMG Multiplier buff
  // (source: the wiki's "Basic Attack Multiplier Increase 25%" Forte attribute) which was previously omitted
  // entirely; a parry-branch Heavy Slash: Lightsmash step added (was missing — see SKILL_MULTIPLIERS note
  // above) as an alternative to Daybreak when Zani is hit during the pre-Daybreak Ready Stance; The Last Stand
  // step's forfeit-window wording tightened to make clear the 8s/Blaze<30 gate is an OR, not an AND. Per-hit
  // Blaze costs for Daybreak (10) and Dawning (20) are NOT independently confirmed on either source page (only
  // Nightfall's "up to 40" is explicit primary-source text) — flagged TODO: verify rather than asserted as fact.
  'Zani': [
    { type: 'Intro', skill: 'Immediate Execution', note: 'Swap into her — fires automatically, builds Redundant Energy, and (Inherent Skill Quick Response) grants Zani +12% Spectro DMG Bonus for 14s.' },
    { type: 'Skill', skill: 'Standard Defense Protocol', note: 'Press Skill — a small hit that enters a block stance for up to 2s. This state ends EARLY (forfeiting the follow-up window below) if Zani is swapped off-field before it resolves. If hit while blocking, that hit is reduced 100% and Zani auto-casts Pinpoint Strike (a bonus hit) instead of needing Basic Attack to exit.' },
    { type: 'Basic ATK', skill: 'Stage 3', note: 'Press Basic Attack to exit the block stance manually — Stagnates the target and restores 10 Redundant Energy.' },
    { type: 'Skill', skill: 'Targeted Action / Forcible Riposte', note: 'Once Redundant Energy hits 100/100 (gained from Basic ATK hits, Intro Skill, Standard Defense Protocol, and Pinpoint Strike — none while in Inferno Mode), HOLD Skill (Crisis Response Protocol) to enter interruption-immune Ready Stance — if unhit, releasing consumes all Redundant Energy for Targeted Action; if an enemy attacks during the hold, it instead auto-triggers Forcible Riposte (a parry) for the same cost. Either way: applies 1 Heliacal Ember stack, grants 10 Blaze, and starts Sunburst — +20% Spectro Frazzle DMG on Zani for 14s.' },
    { type: 'Liberation', skill: 'Rekindle', note: 'Press Liberation — deals a hit and enters Inferno Mode (up to 20s), raising max Blaze from 100 to 150, granting 50 Blaze immediately, and giving Basic ATK a flat +25% DMG Multiplier for the duration.' },
    // TODO resolved 2026-09-03: a real browser snapshot's Review text now explicitly confirms
    // the exact Blaze costs — "Daybreak consumes 10 Blaze, Dawning consumes 20 Blaze and Nightfall
    // consumes up to 40 Blaze" — matching the 10/20 previously marked as an unconfirmed community
    // breakdown. Total per full pass: 10+20+40 = 70 Blaze (matches the source's own "her standard
    // combo consumes 140 Blaze" for 2 full passes).
    { type: 'Forte', skill: 'Heavy Slash: Daybreak', note: 'Now in Inferno Mode with ≥30 Blaze, press Basic Attack (auto-replaced) — counted as Heavy ATK + Spectro Frazzle DMG, consumes 10 Blaze. If Zani is instead hit during this Ready Stance, it auto-parries into Heavy Slash: Lightsmash (same DMG as Dawning) rather than continuing the Daybreak→Dawning→Nightfall string.' },
    { type: 'Forte', skill: 'Heavy Slash: Dawning', note: 'Press Basic Attack again — auto-chains at >30 remaining Blaze.' },
    { type: 'Forte', skill: 'Heavy Slash: Nightfall', note: 'Press Basic Attack once more — consumes up to 40 Blaze, each point adding +9.95% DMG Multiplier (max level); this is her hardest-hitting single attack. If Nightfall Stage 1 gets interrupted, pressing Basic Attack again casts Nightfall Stage 2 instead of restarting the string.' },
    { type: 'Forte', skill: 'Heavy Slash: Daybreak → Dawning → Nightfall', note: 'Repeat the full 3-hit string a 2nd time — with allies feeding enough Spectro Frazzle, Blaze should refill for another full pass.' },
    { type: 'Liberation', skill: 'The Last Stand', duration: 8, note: 'Press Liberation once EITHER Blaze drops below 30 OR 8s have passed since entering Inferno Mode (whichever happens first — not both) — her 2nd Ultimate, ending Inferno Mode with a big hit. It doesn\'t benefit from Heavy/Frazzle DMG buffs the way Nightfall does, so only use it once Blaze is too low to justify another full string; stalling past the 8s gate just wastes Inferno Mode uptime for no extra DPS.' },
    { type: 'Outro', skill: 'Beacon For the Future', duration: 20, note: 'Swap out to trigger this automatically — consumes all Heliacal Ember stacks on the target for a scaling hit (+10% DMG per stack, counted as Spectro Frazzle DMG), and grants every other teammate hitting that marked target +20% Spectro DMG Amp for 20s.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Xiangli Yao (2026-08-18,
  // Chrome UA + google.com referer + jsRender). His 24s Intuition window is long and forgiving — dodges,
  // swaps, even mistakes fit inside it without losing the buffed state.
  // Full audit 2026-09-01, sourced from wutheringwaves.gg's Xiangli Yao guide + wuwa.build/wutheringlab.com
  // cross-references. Fixed a zero-damage-display bug affecting 4 of the original steps: `skill` strings
  // 'Pivot-Impale P1/P2/P3', 'Mid-air Attack: Revamp', and 'Skill: Law of Reigns' were never a substring of
  // any SKILL_MULTIPLIERS row name (the `type === step.type && n.includes(step.skill)` lookup), so those
  // steps could never resolve a dmg value even before the SKILL_MULTIPLIERS split above. Renamed to exact
  // substrings of the (now-split) row names: 'Revamp', 'Law of Reigns'. The 3-stage Pivot-Impale combo is
  // also now one step (matching this file's convention elsewhere of one step per full multi-stage combo,
  // e.g. Yinlin's 'Stage 1-4') instead of 3, since SKILL_MULTIPLIERS stores it as one combined per-hit string.
  'Xiangli Yao': [
    { type: 'Intro', skill: 'Principle', note: 'Swap into him — fires automatically, builds Capacity.' },
    { type: 'Skill', skill: 'Deduction', note: 'Press Skill, then immediately press Liberation to cancel its small hit — this only exists to trigger the Void Thunder Echo set\'s 5P effect and add Concerto Energy before the big cast.' },
    { type: 'Liberation', skill: 'Cogitation Model', duration: 24, note: 'Press Liberation — a big hit and enters Intuition for 24s: Basic/Heavy/Dodge Counter become Pivot-Impale, base Skill becomes Divergence, and he gains 3 Hypercube charges plus extra interruption resistance.' },
    { type: 'Skill', skill: 'Intuition: Divergence', note: 'Press Skill — a jump-attack, builds 2 Performance Capacity (of the 5 needed) toward Law of Reigns.' },
    { type: 'Forte', skill: 'Revamp', note: 'Press Basic Attack while airborne right after Divergence — builds 3 more Performance Capacity (now 5/5).' },
    { type: 'Forte', skill: 'Law of Reigns', note: 'Once Performance Capacity hits 5/5, press Skill (auto-replaced) — consumes it all and 1 Hypercube for a big Liberation-type hit. 1 of 3 Hypercubes spent.' },
    { type: 'Basic ATK', skill: 'Intuition: Pivot-Impale', note: 'Divergence is on a 7s cooldown, so bridge the gap with his enhanced 3-stage Basic combo instead — Stage 1 hit grants 1 Performance Capacity, Stage 2/3 hits grant 2 each (5/5 total).' },
    { type: 'Forte', skill: 'Law of Reigns', note: 'Press Skill again — consumes the 2nd Hypercube.' },
    { type: 'Skill', skill: 'Intuition: Divergence', note: 'Should be off cooldown by now — press Skill for another jump-attack, 2 Performance Capacity.' },
    { type: 'Forte', skill: 'Revamp', note: 'Press Basic Attack while airborne — 3 more Performance Capacity (5/5).' },
    { type: 'Forte', skill: 'Law of Reigns', note: 'Press Skill for the 3rd and final Hypercube — consuming it ends Intuition immediately, regardless of remaining duration.' },
    { type: 'Echo', skill: 'Use Echo', note: 'Use your equipped Echo (Mech Abomination or a Nightmare summon) at any point during the long Intuition window — swap-cancel right after the last Law of Reigns if needed.' },
    { type: 'Outro', skill: 'Chain Rule', duration: 8, note: 'Swap out to trigger this automatically. For 8s, the first target the incoming Resonator\'s Basic Attack hits gets zapped by a laser (up to 3 procs, once every 2s).' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for The Shorekeeper (2026-08-18,
  // Chrome UA + google.com referer + jsRender). Uses her "Standard Rotation" (Intro available); her
  // separate Opener (used when no Intro is available, e.g. Tower of Adversity start) does 2 full Basic
  // Attack + Illation cycles before Skill/Liberation instead.
  'Shorekeeper': [
    { type: 'Intro', skill: 'Discernment', note: 'Swap into her — if a Supernal Stellarealm is up, her Intro is auto-replaced by this empowered version: ends the current Stellarealm immediately (regardless of remaining duration), heals the team, and deals a guaranteed-Crit hit (counted as Liberation DMG, scales off her HP, base 19.64%×3 at Lv.10, +42% DMG Mult and +500% Crit DMG on that hit at S6). Cast-order/forfeit warning: swapping to her before Supernal is reached forfeits the rest of the current Stellarealm\'s healing/buff duration for a smaller Enlightenment cast instead — only swap in here once 2 ally Intros have already upgraded the field to Supernal.' },
    { type: 'Basic ATK', skill: 'Origin Calculus Stage 1-4', note: 'Tap Basic Attack 4 times — each hit grants 1 Collapsed Core (which becomes an auto-attacking Flare Star Butterfly after 6s) and Empirical Data (Stage 3 grants 2 Empirical Data instead of 1, capping the gauge at 5/5 after this combo).' },
    // skill field corrected 2026-08-31: was 'Heavy Attack: Illation', which does NOT substring-match the
    // SKILL_MULTIPLIERS row name 'Flare Star Butterfly / Illation / Transmutation' — the calc engine's
    // rowName.includes(step.skill) lookup silently resolved this step to ZERO damage. Changed to 'Illation'
    // alone, which does match.
    { type: 'Forte', skill: 'Illation', note: 'Once Empirical Data hits 5/5, HOLD Basic Attack (Heavy Attack replaced) — consumes it all for a hit that instantly converts every pending Collapsed Core into a Flare Star Butterfly and gently pulls in non-elite enemies (range extended +30% at S5).' },
    { type: 'Skill', skill: 'Chaos Theory', note: 'Press Skill — heals the nearby team and summons 5 Dim Star Butterflies that auto-track a target, generating a big burst of Concerto Energy as they land.' },
    { type: 'Echo', skill: 'Use Echo', note: 'Use your equipped Echo (Fallacy of No Return recommended) right after Skill.' },
    { type: 'Liberation', skill: 'End Loop', duration: 30, note: 'Press Liberation (needs 175 Energy) — summons the Stellarealm for 30s: continuous team healing every 3s. It upgrades automatically the first time a teammate casts their Intro inside it (to Inner: up to +12.5% team Crit Rate scaling with her Energy Regen) and again on a 2nd Intro (to Supernal: up to +25% team Crit DMG).' },
    { type: 'Outro', skill: 'Binary Butterfly', duration: 30, note: 'Swap out to trigger this automatically — summons escort butterflies around the incoming Resonator for up to 30s (up to 5 free recovers from being hit/launched) and grants the nearby team +15% All DMG Amp, which persists through swaps. Swapping to a teammate here is also what triggers the Stellarealm\'s first upgrade.' },
  ],
  // Standard "Core Rotation" — sourced from the source's "Gameplay and teams" tab for Augusta (2026-08-18,
  // Chrome UA + google.com referer + jsRender). Near-incompatible with quickswap: her Outro locks the
  // incoming Resonator in place, so this is her full self-contained loop start to finish.
  'Augusta': [
    { type: 'Intro', skill: 'Stride of Goldenflare', note: 'Swap into her — fires automatically, fully restores Prowess and 20% Ascendancy.' },
    { type: 'Heavy ATK', skill: 'Thunderoar: Backstep', note: 'Once Prowess is capped, HOLD Basic Attack (Heavy Attack replaced) — consumes all Prowess for a hit. Press/release Basic Attack shortly after to chain into Spinslash.' },
    { type: 'Heavy ATK', skill: 'Thunderoar: Spinslash', note: 'Auto-chains off Backstep — a whirling follow-up hit.' },
    { type: 'Skill', skill: "Warrior's Blade", note: 'Press Skill right as Spinslash\'s damage lands, to cancel its endlag — a dash-slam hit that restores 10% Ascendancy.' },
    { type: 'Heavy ATK', skill: 'Thunderoar: Backstep → Spinslash', note: 'Once Prowess refills, repeat the Backstep-into-Spinslash combo a 2nd time.' },
    { type: 'Liberation', skill: 'Sword of Eternal Oath', note: 'Press (and release) Liberation right as the 2nd Spinslash lands, to cancel its endlag — a sweeping hit (counted as Heavy ATK DMG) that restores the last 40% Ascendancy, capping it at 100%.' },
    { type: 'Skill', skill: 'Undying Sunlight: Strike', note: 'Once Ascendancy is capped, press Skill (auto-replaced) — deals a hit. Press Basic Attack or Skill again shortly after to chain.' },
    { type: 'Skill', skill: 'Undying Sunlight: Leap', note: 'Auto-chains — a follow-up hit. Press Basic Attack or Skill again to chain into the plunge.' },
    { type: 'Skill', skill: 'Undying Sunlight: Plunge', note: 'Consumes all Ascendancy for a hit (counted as Heavy ATK DMG) and grants 1 Majesty stack (2/2, since she starts every fight with 1 banked from her passive).' },
    { type: 'Liberation', skill: 'Sublime is the Sun', duration: 7, note: 'With 2 Majesty stacks, HOLD Liberation — costs no Resonance Energy, generates Ruler\'s Realm (shields teammates who cast their Intro within it) and enters Sworn Allegiance for 7s: time fully stops, no swapping, immune throughout.' },
    { type: 'Liberation', skill: 'Sublime is the Sun: Sunborne ×9', note: 'Tap or hold Basic Attack repeatedly — 9 rapid Heavy ATK-type hits in a row during the frozen time window.' },
    { type: 'Liberation', skill: 'Sublime is the Sun: Everbright Protector', note: 'Fires automatically after the 9th Sunborne hit (or press Basic Attack/Liberation to trigger it early) — a big finishing hit that ends Sworn Allegiance and consumes all Crown of Wills stacks.' },
    { type: 'Echo', skill: 'Use Echo', note: 'Use your equipped Echo (The False Sovereign) right after Everbright Protector, then swap-cancel it immediately.' },
    { type: 'Outro', skill: 'Battlesong of the Unyielding', duration: 14, note: 'Swap out to trigger this automatically. Grants the incoming Resonator +15% All DMG Amp for 14s (lost on swap) — casting it also grants Augusta 1 Majesty stack for next time. Avoid swapping the buffed teammate off-field, or Majesty regeneration stalls.' },
  ],
  // Standard "Loop Rotation" — sourced from the source's "Gameplay and teams" tab for Phrolova (2026-08-18,
  // Chrome UA + google.com referer + jsRender), used once her empowered Intro is available (her Opener,
  // used only the first time she's switched in from another character, skips the Intro and starts at
  // Basic 2 instead). Forte: Basic (Movement of Fate and Finality) is used vs. bosses; Forte: Skill
  // (Murmurs in a Haunting Dream) groups adds instead — pick whichever fits the fight each time it's due.
  // Corrected 2026-08-31 against the wiki/Phrolova/Combat, cross-checked
  // the source/character/1608: Outro entry previously stated the +20%/+25% buff with no forfeit
  // condition at all — added "ends if swapped out" (wiki: "...for 14s or until they are switched out")
  // and separated the Maestro-only 2-bonus-Hecate-attack clause, which is conditioned on Phrolova still
  // being in Maestro state at the moment Unfinished Piece is cast, not merely "cast during Maestro" in
  // general. Liberation entry's gate (Resolving Chord state only, 0 max Resonance Energy) confirmed
  // accurate. Rest of the sequence (Forte/Note economy, Scarlet Coda's 6-Note/Compose/not-Resolving-Chord
  // gate, the 25s Compose auto-trigger) re-verified accurate against source, no changes needed.
  'Phrolova': [
    { type: 'Intro', skill: 'Suite of Immortality', note: 'Swap into her — since her Ultimate was cast last rotation, this empowered Intro auto-replaces the base one: a Stagnate hit counted as Skill DMG.' },
    { type: 'Basic ATK', skill: 'Stage 3', note: 'Press Basic Attack once — enters Reincarnate and grants 1 Volatile Note: Strings.' },
    { type: 'Forte', skill: 'Movement of Fate and Finality / Murmurs in a Haunting Dream', note: 'While in Reincarnate, press Basic Attack (Movement of Fate and Finality — Strings note, single-target) or Skill (Murmurs in a Haunting Dream — Winds note, groups adds) to end Reincarnate with a Skill-type hit.' },
    { type: 'Skill', skill: 'Whispers in a Fleeting Dream', note: 'Press Skill — deals a hit, grants 1 Volatile Note: Winds, and re-enters Reincarnate.' },
    { type: 'Forte', skill: 'Movement of Fate and Finality / Murmurs in a Haunting Dream', note: 'Cast your 2nd Forte enhanced attack (pick to fit the encounter again) — cancel its animation instantly (Basic version) or when the portal opens (Skill version).' },
    { type: 'Basic ATK', skill: 'Stage 1-3', note: 'Tap Basic Attack 3 times — Stage 3 grants another Volatile Note: Strings, priming Reincarnate again.' },
    { type: 'Forte', skill: 'Movement of Fate and Finality / Murmurs in a Haunting Dream', note: 'Cast a 3rd Forte enhanced attack — by now she should be holding all 6 Volatile Notes needed for Scarlet Coda.' },
    { type: 'Heavy ATK', skill: 'Scarlet Coda', note: 'With 6 Volatile Notes, in the Compose state (auto-triggers every 25s on a fixed timer independent of her actions), and NOT already in Resolving Chord, HOLD Basic Attack (Heavy Attack replaced) — a Skill-type hit that scales with stacked Aftersound (cap 24 stacks) and activates the Resolving Chord state, unlocking her Liberation.' },
    { type: 'Echo', skill: 'Use Echo', note: 'Use your equipped Echo (Nightmare: Hecate) right after Scarlet Coda.' },
    { type: 'Liberation', skill: 'Waltz of Forsaken Depths', duration: 24, note: 'Press Liberation (costs no Resonance Energy — her max is 0, and it is castable only while in the Resolving Chord state) — ends Resolving Chord and enters Maestro for 24s: +120% self ATK, and Hecate now fights alongside her, sharing her stats and cueable via Basic Attack/Dodge/Jump while she stays on-field.' },
    { type: 'Outro', skill: 'Unfinished Piece', duration: 14, note: 'Swap out to trigger this automatically. Grants the incoming Resonator +20% Havoc DMG Amp and +25% Heavy ATK DMG Amp for 14s — ends immediately if THAT Resonator is swapped out. Only if Phrolova is still in Maestro state at the moment this Outro is cast does Hecate additionally fire 2 bonus Enhanced Attacks off-field before that same Maestro window (24s total) ends; off-field Hecate otherwise still auto-attacks and gains a normal Enhanced Attack whenever any teammate casts their own Echo Skill, capped at 10 such triggers per Maestro window (1 per unique Echo of the same name).' },
  ],
  // Corrected 2026-08-17 against the source's live "Gameplay and teams" rotation: the previous entry
  // opened with a full Basic ATK combo before her Liberation and never mentioned Foebreaker, the
  // Mid-air Attack chain, or Wolf's Claw — the actual core of her Forte-building loop. Rebuilt to match
  // the source's "Loop Rotation" (used whenever an Intro Skill is available, i.e. whenever she isn't the
  // team's opener).
  // Rotation steps' types corrected 2026-09-01 to match SKILL_MULTIPLIERS.Lupa's fixed row types above
  // (see that section's comment): Firestrike moved 'Mid-air' -> 'Heavy ATK' (it's "considered Heavy
  // Attack DMG"), Dance With the Wolf moved 'Skill' -> 'Liberation' (it's "considered Resonance
  // Liberation DMG") with its name capitalization fixed to match the row exactly ('With', not 'with') —
  // the old lowercase 'with' silently broke the case-sensitive substring match on top of the wrong type,
  // a second independent reason this step was resolving to 0 DMG.
  // Corrected 2026-09-02 against a fresh the source dump: the Forte-finisher step named the BASE 'Dance
  // With the Wolf' (56.02%+42.02%×4+336.11%, ~672% total) — but the dump's own Review/Gameplay text is
  // explicit that the real rotation ALWAYS uses the enhanced 'Dance With the Wolf: Climax'
  // (75.63%+56.72%×4+453.75%, ~1256% total, nearly double) instead: "using Firestrike and Wolf's Claw
  // gave us 2 Wolfaith, so now her Forte Enhanced Skill, 'Dance With the Wolf - Climax,' can be cast...
  // [the base version] never sees use" — Foebreaker (2 steps earlier here) already puts her in Burning
  // Matchpoint by this point, which is exactly the Climax's own real cast condition. A prior session's
  // engine file (lupa.blocks.js) had already documented this exact mismatch as a deliberate "matches
  // CHARACTER_ROTATIONS as given" choice rather than a bug — this dump is the real source proving
  // CHARACTER_ROTATIONS itself was wrong, not lupa.blocks.js's own reading of it. Fixed here; see
  // lupa.blocks.js for the matching engine-side fix (also unblocks S4's own +125% Climax DMG Multiplier
  // buff, previously inert for the identical reason).
  'Lupa': [
    { type: 'Intro', skill: 'Try Focusing, Eh?' },
    { type: 'Liberation', skill: 'Fire-Kissed Glory', duration: 35, note: 'fully restores Wolflame, grants team Pack Hunt + Glory buffs' },
    { type: 'Skill', skill: 'Foebreaker', note: 'press Basic/Skill shortly after Liberation, enters Burning Matchpoint' },
    { type: 'Mid-air', skill: 'Attack Stage 1-2', note: 'builds toward Firestrike' },
    { type: 'Heavy ATK', skill: 'Firestrike', note: 'consumes 50 Wolflame, grants 1 Wolfaith' },
    { type: 'Heavy ATK', skill: "Wolf's Claw", note: 'press Basic after Firestrike, consumes 50 Wolflame, grants 1 more Wolfaith' },
    { type: 'Liberation', skill: 'Dance With the Wolf: Climax', note: 'Forte finisher, consumes both Wolfaith — always the Climax variant since Foebreaker (above) already entered Burning Matchpoint' },
    { type: 'Outro', skill: 'Stand by Me, Warrior', duration: 14, note: 'grants next Resonator Fusion + Basic ATK DMG Amp' },
  ],
  // Corrected 2026-08-17 against the source's live "Gameplay and teams" rotation: the previous entry
  // included the un-enhanced Basic ATK Stage 1-3 combo — but the Intro alone grants 400 of his 600 Forte
  // ("Swordster's Soliloquy"), so the source's actual "Standard Hybrid Rotation" skips straight from Intro
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
  // Added 2026-08-18 (previously missing entirely) — sourced from the source's "Gameplay and teams" tab
  // Heavy ATK Concerto Rotation, the mode the source states sees "far more play overall" over the Basic ATK
  // variant. Core loop: deploy all 3 Forte Ice constructs (Intro/Skill/Liberation), then shatter them
  // with 2x Heavy ATK Detonate before they expire (each construct detonation grants 15 Concerto).
  'Sanhua': [
    { type: 'Intro', skill: 'Freezing Thorns', note: 'creates 1 Ice Thorn' },
    { type: 'Liberation', skill: 'Glacial Gaze', note: 'creates 1 Glacier, grants 2 stacks of Clarity (expands Frostbite area)' },
    { type: 'Skill', skill: 'Eternal Frost', note: 'creates 1 Ice Prism, grants 1 stack of Clarity' },
    // Skill name corrected 2026-09-01 from 'Heavy ATK: Detonate', which never matched the
    // SKILL_MULTIPLIERS row name and was silently resolving to 0 DMG.
    { type: 'Forte', skill: 'Clarity of Mind: Detonate', note: 'detonates all 3 Ice constructs (Thorn/Prism/Glacier) at once for a large Concerto/Energy burst.' },
    { type: 'Forte', skill: 'Clarity of Mind: Detonate', note: 'second detonate to fully spend the loop before swapping' },
    { type: 'Outro', skill: 'Silversnow', duration: 14, note: 'grants next Resonator 38% Basic ATK DMG Amp — time this to land on the intended DPS' },
  ],
  // Standard Rotations added 2026-08-18 for Aalto/Baizhi/Chixia — sourced from the wiki's
  // Combat pages (Instructions + Forte text). These were entirely missing before.
  'Aalto': [
    { type: 'Intro', skill: 'Feint Shot', note: 'rapid burst on entry, builds Mist Drops' },
    { type: 'Skill', skill: 'Shift Trick', note: 'summons a Mist Avatar and spreads Mist, taunting nearby enemies' },
    // Skill name corrected 2026-09-01 from 'Stage 4', which never matched the combo's 'Stage 1-5'
    // row name and was silently resolving to 0 DMG.
    { type: 'Basic ATK', skill: 'Half Truths Stage 1-5', note: 'Tap Basic Attack to Stage 4 — spreads Mist forward; passing through it triggers Mistcloak Dash.' },
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
  // Standard Rotation added 2026-08-18 — sourced from the wiki's Danjin/Combat
  // Instructions + Forte text (Crimson Erosion/Sanguine Pulse combo strings, Forte Circuit conditions).
  // This section was previously entirely missing for her.
  // Step types/names corrected 2026-09-01 to match SKILL_MULTIPLIERS.Danjin's row types/names above:
  // Crimson Erosion and Sanguine Pulse are Resonance Skill-type moves (per their own move text, "use
  // Resonance Skill to perform...") but were typed 'Basic ATK' with names that matched no row at all;
  // Chaoscleave's row is named 'Serene Vigil: Chaoscleave', not 'Heavy ATK: Chaoscleave'. All three steps
  // were silently resolving to 0 DMG under the old type+name combination.
  'Danjin': [
    { type: 'Intro', skill: 'Vindication', note: 'unwavering strike, builds Concerto Energy' },
    { type: 'Skill', skill: 'Crimson Erosion', note: 'after Basic ATK 2 (or Dodge Counter/Intro), cast Resonance Skill for the 2-hit Crimson Erosion combo, applying Incinerating Will (+20% DMG taken)' },
    { type: 'Skill', skill: 'Sanguine Pulse', note: 'continue into Basic ATK 3, then Resonance Skill again for the 3-hit Sanguine Pulse combo, building Ruby Blossom stacks' },
    { type: 'Liberation', skill: 'Crimson Bloom', note: 'rapid multi-hit Havoc burst plus Scarlet Burst finisher, consumes HP per hit' },
    { type: 'Forte', skill: 'Serene Vigil: Chaoscleave', note: 'once Ruby Blossom reaches 60+, unleash Chaoscleave (heals Danjin, counts as Heavy ATK) into the Scatterbloom follow-up' },
    { type: 'Outro', skill: 'Duality', duration: 14, note: 'grants the incoming Resonator 23% Havoc DMG Amp for 14s' },
  ],
  // Standard Rotation added 2026-08-18 — sourced from the wiki's Yangyang/Combat
  // Instructions/Forte text and the source's review ("the main and most reliable way to access Feather
  // Release... by jumping", "we will mostly be counting on Heavy Attacks and Resonance Skills to
  // generate Forte stacks"). One of the shortest rotations in the game, built for quickswap. This
  // section was previously entirely missing for her.
  'Yangyang': [
    { type: 'Intro', skill: 'Cerulean Song', note: 'launches target airborne, grants 1 Melody stack' },
    { type: 'Skill', skill: 'Zephyr Domain', note: 'whirling vortex groups nearby enemies, grants 1 Melody stack' },
    { type: 'Heavy ATK', skill: 'Zephyr Song', note: 'Heavy ATK into follow-up Basic ATK grants the 3rd Melody stack' },
    // Type/name corrected 2026-09-01 from 'Basic ATK'/'Mid-air Attack: Feather Release', which never
    // matched the SKILL_MULTIPLIERS row (type 'Forte', name 'Echoing Feathers: Feather Release')
    // and was silently resolving to 0 DMG.
    { type: 'Forte', skill: 'Echoing Feathers: Feather Release', note: 'jump then Basic ATK to consume all 3 Melodies for the Forte Circuit burst finisher.' },
    { type: 'Liberation', skill: 'Wind Spirals', note: 'Cyclone burst groups enemies and generates Concerto Energy' },
    { type: 'Outro', skill: 'Whispering Breeze', duration: 5, note: 'funnels 4 Resonance Energy/s to the incoming Resonator for 5s — quickswap into the main DPS' },
  ],
  // Added 2026-08-18 (previously entirely missing) — sourced from the wiki's
  // Taoqi/Combat Instructions/Forte text. She's a shield support: Skill grants 3 Rocksteady Shield
  // stacks (each absorbing a hit), Liberation is a DEF-scaling nuke, and the Outro's 38% Resonance
  // Skill DMG Amp is timed onto the incoming Resonator's own Skill DPS window.
  'Taoqi': [
    { type: 'Intro', skill: 'Defense Formation', note: 'Havoc DMG opener; Basic ATK afterward casts Timed Counters (Power Shift) directly' },
    { type: 'Forte', skill: 'Power Shift: Timed Counters', note: 'Basic ATK after Heavy ATK Strategic Parry/Intro consumes "Resolving Caliber" for extra hits and a shield, counted as Basic ATK DMG' },
    { type: 'Liberation', skill: 'Unmovable', note: 'DEF-scaling Havoc nuke — benefits from her naturally high base DEF' },
    { type: 'Basic ATK', skill: 'Concealed Edge', note: 'full 4-hit Basic Attack combo before Skill/Outro — earlier Concerto-building Basic hits are skippable with a Concerto-generating weapon like Discord and aren\'t separately modeled' },
    { type: 'Skill', skill: 'Fortified Defense', note: 'Havoc DMG to surrounding targets, generates 3 Rocksteady Shield stacks and heals self' },
    { type: 'Outro', skill: 'Iron Will', duration: 14, note: 'grants the incoming Resonator 38% Resonance Skill DMG Amp for 14s — time this to land on the intended DPS\'s Skill window' },
  ],
  // Added 2026-08-18 (previously entirely missing) — sourced from the source's Gameplay and teams "Ability
  // Priority" list and the wiki's Yuanwu/Combat Instructions/Forte text. He's a near-zero-field-time
  // support: deploy Thunder Wedge, detonate it with Liberation, swap off. the source explicitly notes he
  // "features no set rotation" — this models the documented Ability Priority order for calc purposes.
  'Yuanwu': [
    { type: 'Intro', skill: 'Thunder Bombardment', note: 'Electro DMG opener (if available)' },
    { type: 'Skill', skill: 'Thunder Wedge', note: 'deploy Thunder Wedge to start building Forte Gauge off-field via Coordinated ATKs' },
    { type: 'Liberation', skill: 'Blazing Might', note: 'detonates the active Thunder Wedge (Resonance Skill DMG) and grants team Interruption Resistance for 10s' },
    { type: 'Forte', skill: 'Rumbling Spark', note: 'once Forte Gauge is full, hold Skill to detonate Thunder Wedge again and enter Lightning Infused' },
    { type: 'Skill', skill: 'Thunder Wedge', note: 're-deploy Thunder Wedge to keep the Coordinated ATK field active' },
    { type: 'Outro', skill: 'Lightning Manipulation', note: 'swap out — depletes enemy Vibration Strength, no DMG; quickswap into the main DPS immediately' },
  ],
  // Added 2026-08-18 (previously entirely missing) — sourced from the source's Gameplay and teams "Rotation"
  // list and the wiki's Mortefi/Combat Instructions/Forte text. His Concerto rotation is one of the
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
  // Added 2026-08-18 (previously entirely missing) — sourced from the source's Gameplay and teams "Rotation
  // 1" (her simplest loop, 6.5s, works with any weapon) and the wiki's Youhu/Combat Instructions text.
  // Every Antique Appraisal (Chime/Ruyi/Ding/Mask, drawn at random unless chosen via Liberation) refills
  // an Auspice; Poetic Essence fires once all 4 are gathered. the source recommends picking Mask or Ruyi from
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
  // Added 2026-08-18 (previously entirely missing) — sourced from the source's Gameplay and teams "Rotation"
  // tab and the wiki's Lumi/Combat Instructions text. Alternates Yellow Light/Red Light stances by consuming
  // full Sparks with Energized Pounce/Rebound; ends on a swap-cancelled Echo into Outro for the incoming
  // Resonance Skill DMG dealer (Jinhsi/Carlotta). the source notes the rotation is "fairly long for a hybrid
  // character" and recommends swap-cancelling the marked steps to shorten field time.
  'Lumi': [
    { type: 'Intro', skill: 'Special Delivery' },
    { type: 'Liberation', skill: 'Squeakie Express', note: 'Electro DMG nuke, builds Concerto Energy' },
    { type: 'Forte', skill: 'Energized Pounce', note: 'Yellow Light Spark full — enters Red Spotlight Mode; optional swap cancel and immediately back' },
    { type: 'Forte', skill: 'Red Spotlight: Basic Attack', note: 'enhanced 3-hit Basic ATK combo; optional swap cancel and immediately back after the 3rd hit' },
    { type: 'Forte', skill: 'Energized Rebound', note: 'Red Light Spark full — enters Yellow Spotlight Mode' },
    { type: 'Basic ATK', skill: 'Yellow Light: Basic Attack', note: 'builds Yellow Light Spark' },
    { type: 'Forte', skill: 'Glare', note: 'Channelled Dash: 6 Glares in Yellow Spotlight Mode' },
    { type: 'Forte', skill: 'Energized Pounce', note: 'Yellow Light Spark full again' },
    { type: 'Outro', skill: 'Escorting', duration: 10, note: 'swap-cancel her Echo right before this — grants the incoming Resonator +38% Resonance Skill DMG Amp for 10s' },
  ],
  // Added 2026-08-18 (previously entirely missing) — sourced from the source's Gameplay and teams "Rotation"
  // tab (her "Loop Rotation", used when an Intro is available) and the wiki's Buling/Combat Forte Details/
  // Instructions text. Builds 4 Trigrams (Mountain via Basic 2, Thunder via Mid-air Attack + Skill +
  // Basic 4) to unlock 2 Heavy Attacks that grant Minor Yang + Minor Yin, entering Yin-Yang Balance for
  // the enhanced Liberation. Echo best used right before Outro per the source's own timing tip.
  'Buling': [
    { type: 'Intro', skill: 'Summon and Smite', note: 'heals nearby team, applies Electro Flare (Inherent Skill), builds Concerto Energy for the loop' },
    { type: 'Basic ATK', skill: 'Hexagram Calls, Lightning Falls: Stage 1' },
    { type: 'Basic ATK', skill: 'Hexagram Calls, Lightning Falls: Stage 2', note: 'grants Trigram - Mountain; swap-cancel via Jump' },
    { type: 'Basic ATK', skill: 'Mid-air Attack', note: 'grants Trigram - Thunder; cancel into Skill' },
    { type: 'Skill', skill: 'In Shadow Thunder Stirs: Thunder Talisman', note: 'pulls in targets, chains directly into Basic Attack Stage 4' },
    { type: 'Basic ATK', skill: 'Hexagram Calls, Lightning Falls: Stage 4', note: 'grants Trigram - Thunder — now holding 4 Trigrams' },
    { type: 'Basic ATK', skill: 'Heavy Attack - Mountain Over Thunder', note: 'consumes Mountain+Thunder Trigrams, grants Minor Yang' },
    { type: 'Basic ATK', skill: 'Heavy Attack - Twin Thunders', note: 'consumes remaining Thunder Trigrams, grants Minor Yin, heals team over 8s' },
    { type: 'Liberation', skill: 'Flashing Thunder Spell: Harmony', note: 'Yin-Yang Balance reached — enhanced Liberation deploys the Five Thunders Spell Array (Electro Flare)' },
    { type: 'Outro', skill: 'Exorcism Spell', duration: 30, note: 'swap-cancel her Echo right before this — heals the incoming active character and Amplifies nearby team DMG by 15% for 30s' },
  ],
  // Added 2026-08-18, sourced from the source's live "Gameplay and teams" tab for all four Rover
  // attunements (Chrome UA + google.com referer + jsRender, 8s wait). These four were previously
  // entirely missing from CHARACTER_ROTATIONS — the only gap in the 58-character roster.
  'Rover: Havoc': [
    { type: 'Intro', skill: 'Instant of Annihilation', note: 'Swap into him — fires automatically and adds to his Forte gauge ("Umbra", 0-100).' },
    { type: 'Skill', skill: 'Wingblade', note: 'Press Skill whenever it\'s off cooldown (short cooldown) — each cast also fills Umbra, so use it in downtime rather than saving it.' },
    { type: 'Heavy ATK', skill: 'Devastation', note: 'Once Umbra hits 100, HOLD Basic Attack (this is the "Devastation" Heavy ATK, not the Heavy Attack button) to consume it all and enter "Dark Surge" — this also shreds enemy Havoc RES by 10% on hit.' },
    { type: 'Skill', skill: 'Umbra: Lifetaker', note: 'Entering Dark Surge instantly resets his Skill cooldown and replaces it with this enhanced version — press Skill again right away. Optional to swap-cancel its ending animation if you want to save time.' },
    { type: 'Liberation', skill: 'Deadening Abyss', note: 'Press Liberation for his big single-target nuke — costs 125 Energy but has a short 16s cooldown.' },
    { type: 'Echo', skill: 'Dreamless', note: 'Use your Echo skill within 5 seconds of Liberation landing — this specific Echo deals +50% DMG in that window — then immediately swap out to cut off its long animation.' },
    { type: 'Outro', skill: 'Soundweaver', note: 'Triggers automatically on swap. This is the Short Burst Combo — for more field time as Main DPS, insert 1-3 Dark Surge Basic Attack strings (tap Basic Attack repeatedly, P1 through P5) before the Skill/Liberation/Echo finisher above.' },
  ],
  'Rover: Spectro': [
    // Skill name corrected 2026-09-01 from 'Resonance → Aftertune', which never matched the row
    // name and was silently resolving to 0 DMG.
    { type: 'Heavy ATK', skill: 'Standard / Resonance / Aftertune', note: 'Done as warm-up while another character is still on-field (or right as you swap in): press Heavy Attack, then tap Basic Attack right as it lands to chain into "Resonance", then tap Basic Attack again to chain into "Aftertune" — this fills Diminutive Sound (her Forte gauge) fast without a full Basic combo.' },
    // Skill name corrected 2026-09-01 — Resonating Spin and Resonating Whirl are now separate rows;
    // this step resolves to Whirl (Spin is credited in the note only).
    { type: 'Forte', skill: 'Resonating Whirl', note: 'Once Diminutive Sound is 50+, press Skill — it auto-upgrades into Resonating Spin (applies Spectro Frazzle), then tap Basic Attack right after to chain into the extra Resonating Whirl hit.' },
    { type: 'Intro', skill: 'Waveshock', note: 'Swap in — fires automatically and adds a bit more Diminutive Sound.' },
    { type: 'Liberation', skill: 'Echoing Orchestra', note: 'Press Liberation — applies a full 6 stacks of Spectro Frazzle to the target in one hit.' },
    { type: 'Basic ATK', skill: 'Vibration Manifestation Stage 1-4', note: 'Tap Basic Attack twice to refill some more Diminutive Sound toward the next Forte cast.' },
    { type: 'Forte', skill: 'Resonating Whirl', note: 'Once back at 50+ Diminutive Sound, press Skill again for a second Resonating Spin into Whirl, same as the first one.' },
    { type: 'Forte', skill: 'Resonating Echoes', note: 'Right after Resonating Spin ends, tap Basic Attack twice more — this fires the follow-up "Resonating Echoes" combo automatically.' },
    { type: 'Outro', skill: 'Instant', note: 'Swap out to trigger this automatically — slows the incoming enemy target briefly, useful for chaining into the next character\'s Outro if they also have one active.' },
  ],
  'Rover: Aero': [
    { type: 'Intro', skill: 'Relentless Squall', note: 'Swap in — fires automatically, launches her into the air, and grants 20 Windstring (her Forte gauge, caps at 120).' },
    // Skill name corrected 2026-09-01 from 'Cloudburst Dance 1-2', which never matched the
    // SKILL_MULTIPLIERS row (now split into its own row) and was silently resolving to 0 DMG.
    { type: 'Forte', skill: 'Cloudburst Dance', note: 'While airborne from the Intro, tap Basic Attack twice in a row — this is her Forte mid-air combo, each hit grants 25 Windstring (now at 20+25+25=70) and heals nearby teammates slightly.' },
    { type: 'Liberation', skill: 'Omega Storm', note: 'Press Liberation while still airborne or near the ground — it instantly grounds her (skipping the slow landing animation) and heals the whole team.' },
    { type: 'Skill', skill: 'Awakening Gale', note: 'Once grounded, press Skill — sends her back into the air. Only a 3s cooldown, so this is her main way to get airborne again for more Cloudburst Dances.' },
    { type: 'Forte', skill: 'Cloudburst Dance', note: 'Tap Basic Attack twice again while airborne — now at 70+25+25=120/120 Windstring, fully capped.' },
    { type: 'Skill', skill: 'Skyfall Severance', note: 'Optional: while still airborne, press Skill again to convert any Negative Status debuffs already on the enemy (Frazzle, Bane, etc.) into stacks of Aero Erosion. Skip this step entirely if nobody on your team applies those debuffs.' },
    // Type/name corrected 2026-09-01 from 'Mid-air ATK'/'Plunge', which never matched the
    // SKILL_MULTIPLIERS row (type 'Mid-air', name 'Plunging Attack') and was silently resolving to 0 DMG.
    { type: 'Mid-air', skill: 'Plunging Attack', note: 'Press Heavy Attack (or just fall) to plunge back down to the ground.' },
    { type: 'Forte', skill: 'Unbound Flow', note: 'Once grounded with full Windstring, her Skill becomes this automatically — press Skill once, then immediately swap to your next character. Part 2 of this attack resolves automatically off-field, so you don\'t need to wait for it.' },
    { type: 'Outro', skill: "Storm's Echo", duration: 30, note: 'Triggers automatically the instant you swap out. Raises the nearby team\'s maximum Aero Erosion stack cap by 3 for 30s.' },
  ],
  'Rover: Electro': [
    { type: 'Intro', skill: 'Thunderous Fury', note: 'Swap in — fires automatically and adds to his Forte gauge ("Electric Surge", 0-120).' },
    { type: 'Basic ATK', skill: 'Deterrence 1-4', note: 'Tap Basic Attack 4 times in a row (the full combo) — each hit builds more Electric Surge.' },
    { type: 'Skill', skill: 'Thunderclap', note: 'Press Skill — grapples toward the target and deals damage, building more Electric Surge.' },
    { type: 'Basic ATK', skill: 'Repel', note: 'Tap Basic Attack once more right after Skill lands — it auto-chains into this "Repel" hit instead of restarting his Basic combo.' },
    { type: 'Liberation', skill: 'Ultimate Tactics', note: 'Cast Liberation immediately after Repel lands — this cancels Repel\'s ending animation, saving time, on top of dealing its own hit.' },
    { type: 'Forte', skill: 'Overshock', note: 'Once Electric Surge is fully capped at 120, his Skill becomes this automatically — TAP Skill (don\'t hold it, or you enter the much weaker "Apex Resonance" stance instead) to unleash it, applying 10 stacks of Electro Flare and a team-wide +10% ATK buff for 20s.' },
    { type: 'Echo', skill: 'Impermanence Heron', note: 'Use your Echo skill right after Overshock — this cancels its ending animation — then swap out immediately.' },
    { type: 'Outro', skill: 'Rumbling Thunders', duration: 20, note: 'Triggers automatically on swap, but the buff it grants disappears the instant the incoming character swaps out again — so have them land a Negative Status hit quickly to consume it for +25% All DMG Amp.' },
  ],
  // Standard Rotation — sourced from the source's "Gameplay and teams" tab for Qingxiao (2026-08-20,
  // Chrome UA + google.com referer + jsRender, same technique as the rest of this file's the source
  // pulls). Fills the gap flagged in the 2026-08-20 (session 4) the content-refresh history (git log) entry — she was one
  // of only 2 of 58 characters (with Jingran) missing an entry here. the source's own step list uses a
  // generic "Heavy:" prefix for held-Basic-Attack chains (including the mid-air ones); renamed to the
  // real skill names/types from SKILL_MULTIPLIERS['Qingxiao'] and the kit text so it reads consistently
  // with every other entry in this table. Order preserved exactly as the source lists it.
  'Qingxiao': [
    { type: 'Intro', skill: 'Tonality Shift', note: 'Swap in — fires automatically, deals Aero DMG, and grants 30 points of Sword Cadence plus Resonant Chime.' },
    { type: 'Mid-air', skill: 'Mid-air Attack - Stringblade Stage 1-3', note: "Qingxiao mostly fights airborne — hold Basic Attack while in the air for this 3-hit combo, building Qin Heart/Sword Cadence toward her Heavy Attack." },
    // Skill name corrected 2026-09-01 from 'Stage 3-4', which never matched any row (the combo is
    // stored as one Stage 1-4 row) and was silently resolving to 0 DMG.
    { type: 'Basic ATK', skill: 'Basic Attack - Stringblade Stage 1-4', note: 'Landing from Mid-air Attack Stage 3 auto-chains into Stage 3-4 if you keep holding/tapping Basic Attack — same combo, continued on the ground.' },
    { type: 'Skill', skill: 'Severing Note: Judgement', note: 'Press Skill once — deals Aero DMG and grants 45 points of Qin Heart, pushing her toward a full Forte gauge.' },
    { type: 'Heavy ATK', skill: 'Heavy Attack - Stringblade', note: 'Once Qin Heart and Sword Cadence are both full, hold Basic Attack for this — consumes both gauges and sends her into the Ephemeral Transcendence state.' },
    { type: 'Forte', skill: 'Basic Attack - Ephemeral Transcendence Stage 1-4', note: 'While in Ephemeral Transcendence, hold/tap Basic Attack for this enhanced 4-hit combo — builds Heart Sword Intent toward the finisher.' },
    { type: 'Forte', skill: "Heavy Attack - Heaven's Reckoning: Ephemeral Transcendence", note: 'Once Heart Sword Intent is full, hold Basic Attack for this — her single hardest-hitting move, consumes all Heart Sword Intent and ends Ephemeral Transcendence.' },
    { type: 'Liberation', skill: 'Billows Beneath Heaven', note: "Press Liberation — best saved for last so her signature weapon's passive (or any pre-Ultimate buffs) are fully stacked before it fires." },
    { type: 'Echo', skill: 'Use Echo', note: "Swap-cancel your Echo skill right after the Liberation lands, just before swapping out for the Outro." },
    { type: 'Outro', skill: 'Lingering Song', note: 'Swap out to trigger this automatically — deals Aero DMG equal to 800% of her ATK.' },
  ],
};

// [SECTION:RESONANCE_CHAINS] — Per-character S1-S6 stat contributions for damage calculator
// Format: { s1-s6: { stat: value } } — each level adds ON TOP of previous
// Stat types must match damage formula: atkPct, critRate, critDmg, elemDmg, skillDmg,
// basicDmg, heavyDmg, libDmg, echoDmg, amplify, defIgnore, defShred, resShred, totalMult, allDmg, coordDmg
// totalMult = rotation-averaged DPS contribution for utility/multiplier nodes
// Sources: the source sequence nodes, the source, wutheringlab, cross-verified Apr 2026
const RESONANCE_CHAIN_DATA = {
  // Full re-audit 2026-09-01 against the wiki/Suisui/Combat, cross-checked against
  // the source/character/1110 (both agree exactly). The prior version of this row deliberately stored
  // "scaled down" approximations instead of the real sourced numbers on S5/S6 — against this project's own
  // hard rule against inventing/guessing values. Corrected to the real, unscaled numbers throughout:
  // S1 "Mountains Washed Into Paintings": was totalMult: 5 (undocumented placeholder) — real effect is
  // entirely utility (Undulating Mist trigger-condition change, Reflecting Shadows duration +100%,
  // interruption immunity on several Drizzle-stance moves), zero real DPS component. Zeroed to {}.
  // S2: team Crit DMG +50% for 30s, conditional on inflicting Negative Status/consuming Havoc Bane
  // (value/category confirmed exact, unchanged).
  // S3 "Sparse Curtains Invite Evening Glow": was totalMult: 5 (undocumented placeholder) — real effect is
  // entirely utility (an extra Basic ATK Stage 4 combo route, Kingfisher stack restoring Concerto
  // Energy/Floral Epistle), zero real DPS component. Zeroed to {}.
  // S4: Enrichment/Spring's Birth healing +50% — a healing-only stat, not DPS; no heal-bonus category
  // exists in this schema. Kept at {} (was totalMult: 5, an undocumented placeholder with no derivation —
  // healing isn't representable here at all, so zeroing rather than approximating is more honest than a
  // guessed totalMult).
  // S5: was basicDmg: 25 — the real, un-scaled-down value is Basic Attack - Drizzle Stance AND Heavy
  // Attack - Drizzle Stance DMG Multipliers both +100% (two moves, not one). Corrected to
  // {basicDmg: 100, heavyDmg: 100}.
  // S6: was critDmg: 25 — the real, un-scaled-down value is Crit DMG +500% on Intro Skill - Tinkling Jade
  // and Resonance Skill - Awakening Spring (both HP%-scaling openers). Corrected to critDmg: 500.
  // TODO: needs Phase 2 schema — S4's healing-bonus effect has no representable category in this
  // DPS-focused schema.
  'Suisui':       { s1: {}, s2: { critDmg: 50 }, s3: {}, s4: {}, s5: { basicDmg: 100, heavyDmg: 100 }, s6: { critDmg: 500 } },
  // Qingxiao S2: Heavy ATK mult+40% (confirmed). S3: Liberation Crit DMG+100% (confirmed). S4: ATK+20% on team Tune Strain trigger. S5: Skill mult+100% (confirmed)
  // Re-audited 2026-09-01 against the wiki/Qingxiao/Combat, cross-checked against
  // the source/character/1413 (both agree exactly) — every node already correct, no changes needed.
  // S6's amplify: 40 is scoped narrower than a universal vulnerability in the real text (only applies to
  // Heavy Attack - Stringblade, Heaven's Reckoning: Ephemeral Transcendence, Billows Beneath Heaven, and
  // Juque Perdition, not her full kit), but 'amplify' is the closest available category and the value is
  // exact, so kept as-is.
  'Qingxiao':     { s1: { critRate: 16 }, s2: { heavyDmg: 40 }, s3: { critDmg: 100 }, s4: { atkPct: 20 }, s5: { skillDmg: 100 }, s6: { amplify: 40 } },
  // Jingran S1: Skill mult+80% (confirmed). S2: Heavy ATK mult+46% (confirmed). S6: Heavy ATK DMG taken+40% (confirmed)
  'Jingran':      { s1: { skillDmg: 80 }, s2: { heavyDmg: 46 }, s3: { atkPct: 15 }, s4: { totalMult: 10 }, s5: { totalMult: 5 }, s6: { heavyDmg: 40 } },
  // Yangyang: Xuanling S2: Heavy/Mid-air/Havoc-in-Bloom DMG+100% (confirmed exact). S3: Hush of a Thousand Voices
  // Liberation DMG+175% (confirmed exact via the source 2026-08-16 cross-check; was 80, didn't match comment or kit)
  // S1 re-audited 2026-09-02 against a fresh the source dump (user-provided): was totalMult:10, an
  // unexplained placeholder flagged as unverified by the engine block's own note. Real S1 effect:
  // casting Resonance Skill - Sword Stance Flow: Azure/Feather summons Shadow of Xuanling: Unfaltering,
  // dealing a flat 337.98% ATK Havoc DMG hit "considered Heavy Attack DMG" — a discrete proc, not a %
  // stat modifier, so it doesn't belong in this table at all (same "not a totalMult-shaped effect"
  // treatment as other characters' chain-granted procs, e.g. Lingyang's S5). Zeroed to {}; the real
  // damage is now a dedicated chain.s1 damage block in yangyangxuanling.blocks.js. S1 also Stagnates
  // nearby enemies and grants interruption immunity on 3 specific moves — pure utility, no DPS
  // component, not modeled. S3/S5 re-audited 2026-09-02 against a fresh the source dump: S3 was libDmg
  // despite Hush of a Thousand Voices' own real damage hit being categorized heavyDmg (her Liberation
  // is entirely "considered Heavy Attack DMG" per kit text) — a libDmg buff on a heavyDmg-categorized
  // hit never actually applies. Corrected libDmg -> heavyDmg (same bug class as Sigrika's S5, which
  // this row's old comment had wrongly cited as its own precedent). S5 "On a fatal blow... immune to
  // DMG/interruption for 3s, once per 10 min" is purely defensive with zero real DPS component —
  // confirmed independently via the source's own Damage Output by Sequence table: S4 and S5 are
  // byte-identical (2,783,354 DMG / 274,492 DPS both). Zeroed the fabricated totalMult:5 to {}.
  // S4's atkPct:20 magnitude is correct (confirmed via a fresh the source dump) but this flat table has
  // no way to express its real scope — a whole-team buff on casting Intro/Sword Stance Switch/Flow,
  // not a self-only passive. Fixed properly in yangyangxuanling.blocks.js (chain.s4-intro/-switch,
  // target: 'whole-team', cast-triggered); this row is only read self-only by the legacy fallback
  // tier, which per the engine-architecture history (git log) item 2 only runs for the Jingran mixed-team case today.
  'Yangyang: Xuanling': { s1: {}, s2: { heavyDmg: 100 }, s3: { heavyDmg: 175 }, s4: { atkPct: 20 }, s5: {}, s6: { heavyDmg: 40 } },
  // Hiyuki S1/S2: Foreclaimed/Iai skills are "considered Resonance Liberation DMG" per kit.
  // Full re-audit 2026-09-01 against the wiki/Hiyuki/Combat — its Attribute Scaling
  // collapsibles render the wrong content for this character (a template/Lua bug specific to this page,
  // similar to the documented Jinhsi issue: the section wraps a Skill Upgrade materials-cost table
  // instead of the actual damage tables), so its per-hit numbers couldn't be used, but the Resonance
  // Chain node text rendered correctly and matches the source/character/1108 verbatim, which supplied
  // the numbers below. Found the category+value correct on nothing pre-existing except S1's category:
  // S1: was libDmg: 80 (category already correct — Foreclaimed Self core moves are "considered Resonance
  // Liberation DMG" — but value was wrong). Real is +120%. Corrected 80 -> 120.
  // S2: was libDmg: 60 (category correct — Basic Attack - Iai is also "considered Resonance Liberation
  // DMG" — but value was wrong). Real is +125%. Corrected 60 -> 125.
  // S3: was heavyDmg: 100 (wrong category AND value) — Frost Splinter: Present Self and Bitterfrost:
  // Foreclaimed Self are each explicitly "considered Resonance Liberation DMG" despite being cast from
  // the Heavy Attack slot (same reclassification class as Lupa's Wolf's Claw / Galbrena's Ascent of
  // Malice, both fixed earlier this pass). Real is +160%. Corrected heavyDmg -> libDmg, 100 -> 160.
  // S4: was atkPct: 15 (wrong stat entirely) — real effect is "+20% DMG dealt by all nearby team
  // Resonators for 30s" on Present Self/Jade Cleave/Petalfall cast, an allDmg buff, not an ATK% buff (the
  // node's self-heal 18% Max HP on the same trigger isn't a DPS stat, not represented). Corrected
  // atkPct -> allDmg, 15 -> 20.
  // S5: was skillDmg: 60 (category already correct — Present Self/Jade Cleave/Petalfall are plain
  // Resonance Skill DMG, no "considered" reclassification — but value was wrong). Real is +80%. Corrected
  // 60 -> 80.
  // S6: was critDmg: 100 (value wrong) — real primary effect is Foreclaiming: Inward Vision/Blade
  // Liberation Crit DMG +500%. Corrected 100 -> 500. TODO: needs Phase 2 schema — the node also grants a
  // further conditional +40% Crit DMG at 2 Snow Rust stacks and +25% Glacio Bite DMG taken at 3 stacks,
  // neither represented (stacking on top of an already-conditional Inherent Skill mechanic with no clean
  // single-node home in this schema).
  'Hiyuki':       { s1: { libDmg: 120 }, s2: { libDmg: 125 }, s3: { libDmg: 160 }, s4: { allDmg: 20 }, s5: { skillDmg: 80 }, s6: { critDmg: 500 } },
  // Lucy S2 (confirmed via the source 2026-08-16 cross-check, was an unverified heavyDmg:60 previously): raises
  // Heavy Attack - Multi-threading's SQL DMG Mult from 270% to 560% (conditional, only on SQL-consuming casts), grants
  // +32 starting RAM (from 24), and adds a separate flat extra hit worth 450% ATK as Heavy DMG after Pulse Interference.
  // None of this reduces to a flat always-on heavyDmg% (calcEngine.js applies heavyDmg unconditionally to every Heavy
  // ATK instance, which the real effect isn't), so it's modeled via totalMult like other complex/conditional S2 nodes.
  // S3: Override DMG Mult+50% + Crit DMG+100% on Liberation (confirmed exact). S4: team +20% All-Attr DMG on
  // Hack-Shifting for 20s (confirmed exact — a real .mht snapshot 2026-09-02 confirms 20s, not the
  // previously-assumed 25s). S1 is conditional on casting Intro (+20% ATK for 14s), not unconditional.
  // S5 zeroed 2026-09-02: was a fabricated totalMult:5 with no textual basis — a real .mht snapshot's
  // S5 text is 100% defensive (Optical Illusion stack cap, HP-triggered Shield), no DMG Multiplier
  // anywhere, matching the "invented number with no basis" removal precedent (Augusta's S5/Brant's
  // S1/Phrolova's S5). S6 also grants +60% Hack DMG (on top of the +40% Heavy ATK DMG already
  // modeled) — not added here, this schema has no "hackDmg" category (only skillDmg/basicDmg/
  // heavyDmg/libDmg/echoDmg/coordDmg + the separate, non-hit-composed tuneBreak.ruptureDmgMult table),
  // documented as a real, sourced gap rather than force-fit into the wrong category.
  'Lucy':         { s1: { atkPct: 20 }, s2: { totalMult: 30 }, s3: { libDmg: 50, critDmg: 100 }, s4: { allDmg: 20 }, s5: {}, s6: { heavyDmg: 40 } },
  // Rebecca S2: team +20% All-Attribute DMG on Intro/Lib (confirmed exact). S3: Liberation DMG Mult+60% (confirmed exact)
  // Re-audited 2026-09-01 against the wiki/Rebecca/Combat, cross-checked against
  // the source/character/1308 (both agree exactly). S1 (basicDmg: 50, "Huntress/Guts core moves DMG
  // Mult +50%") and S5 (basicDmg: 20, "+20% Basic ATK DMG Bonus for 8s on inflicting Hack - Shifting")
  // both confirmed exact. S4 was totalMult: 15 with no basis in either source — real effect is "+60%
  // Stat Bonus increase to the A Girl Gets What She Wants! effect" (itself a conditional buff of Crit
  // DMG/DEF Ignore that only exists while AGGWS is active), a buff-to-a-buff with no flat-schema
  // equivalent. Zeroed to {} rather than guessing. TODO: needs Phase 2 schema. S6's basicDmg: 40 ("+40%
  // Basic ATK DMG Bonus from every source") is directionally correct but the node also grants a separate
  // bonus hit — an extra instance of Electro DMG equal to 900% ATK during Rat-tat-tat!/Bang-bang-bang!,
  // considered Basic Attack DMG — not represented here (same bonus-hit-at-flat-%-ATK class documented
  // elsewhere in this file, e.g. Xiangli Yao's S1/Ciaccona's S6). TODO: needs Phase 2 schema.
  'Rebecca':      { s1: { basicDmg: 50 }, s2: { allDmg: 20 }, s3: { libDmg: 60 }, s4: {}, s5: { basicDmg: 20 }, s6: { basicDmg: 40 } },
  // Denia S3: Final Act - Breakdown Form DMG+80% (confirmed exact, Tune Strain/Fusion Burst dual mode averaged elsewhere).
  // S5: Final Act - Stagecraft Form DMG+100% (confirmed exact via the source 2026-08-16 cross-check; was 50 previously)
  // Re-audited 2026-09-01 against the wiki/Denia/Combat, cross-checked against
  // the source/character/1211 (both agree exactly). S1 (critDmg: 30), S2 (libDmg: 40, the unconditional
  // Banish - Breakdown Form Stage 2 DMG Mult bonus — that move's own text says "The skill deals Resonance
  // Liberation DMG", confirming the libDmg category), S3, and S5 all confirmed correct, unchanged.
  // S4: totalMult: 15 has no exact derivation in source — the real effect is "Erosion Field's attack
  // interval reduced from 4s to 3s" (a +33% proc-frequency increase to one Forte-circuit DoT tick, not a
  // flat DMG% anywhere in the node text), kept as an approximated totalMult since there's no frequency-
  // based stat in this schema; value left as-is (unverifiable exact conversion, not clearly wrong either).
  // TODO: needs Phase 2 schema — proc-frequency buffs have no home in a flat {stat: value} node.
  // S6 was missing a second real component: the node grants BOTH "+60% ATK" AND "+60% Fusion DMG Bonus"
  // simultaneously while in Entropy Shift (only the elemDmg half was captured). Added atkPct: 60.
  'Denia':        { s1: { critDmg: 30 }, s2: { libDmg: 40 }, s3: { libDmg: 80 }, s4: { totalMult: 15 }, s5: { libDmg: 100 }, s6: { atkPct: 60, elemDmg: 60 } },
  // Lucilla re-audited 2026-09-01 against the wiki/Lucilla/Combat, cross-checked
  // against the source/character/1109 (both agree on every node's exact wording and value). S3/S5/S6
  // all buff Letting It Go and/or Oblivion, whose own move text makes their damage type mode-dependent —
  // "considered Basic Attack DMG" in Resonance Mode: Glacio Chafe, "considered Echo Skill DMG" in
  // Resonance Mode: Echo — never Liberation-type despite Letting It Go being part of the Liberation
  // combo. Recategorized libDmg -> {basicDmg, echoDmg} (both keys, same value) on all three, since only
  // one mode is ever active in a given build so the two keys never double-count; whichever mode's
  // SKILL_MULTIPLIERS type matches is the one that applies.
  // S2 was elemDmg: 60 (wrong category AND averaged value) — real effect is Glacio Chafe DMG Amp +80% in
  // Glacio Chafe mode OR team Echo Skill DMG Bonus +40% in Echo mode; only the Echo-mode branch has a
  // matching schema category (echoDmg). Corrected to echoDmg: 40. TODO: needs Phase 2 schema — the
  // Glacio-Chafe-mode branch (Glacio Chafe DMG Amp, not a plain elemDmg buff) has no matching category.
  // S3: Letting It Go DMG Mult +100% (value confirmed exact, category fixed as above).
  // S4: ATK+10%/stack up to 3 stacks = +30% (confirmed exact, unchanged).
  // S5: Oblivion DMG Mult +50% (value confirmed exact, category fixed as above — was basicDmg-only,
  // missing the Echo-mode branch).
  // S6: each Photo consumed in Reminiscence grants 1 Remembrance stack (max 3, +200%/stack) on Letting It
  // Go — a full 3-Photo Reminiscence reliably hits max, so using the max value +600% (value confirmed
  // exact, category fixed as above).
  'Lucilla':      { s1: { critRate: 20 }, s2: { echoDmg: 40 }, s3: { basicDmg: 100, echoDmg: 100 }, s4: { atkPct: 30 }, s5: { basicDmg: 50, echoDmg: 50 }, s6: { basicDmg: 600, echoDmg: 600 } },
  // Camellya S1-S6 re-verified verbatim 2026-08-31 against the wiki/Camellya/Combat:
  // S1 Somewhere No One Travelled: casting Intro Skill Everblooming gives +28% Crit DMG for 18s, triggerable
  //   once every 25s; also grants interruption immunity while casting Ephemeral (not modeled — no immunity field).
  // S2 Calling Upon the Silent Rose: Ephemeral's DMG Multiplier +120% (was wrongly 40 — corrected).
  // S3 A Bud Adorned by Thorns: Fervor Efflorescent's DMG Multiplier +50% (was wrongly 15 — corrected);
  //   ATK+58% while in Budding Mode only (conditional/stateful — kept as flat atkPct, TODO: verify calc engine
  //   gates this on Budding Mode state rather than applying it unconditionally).
  // S4 Roots Set Deep In Eternity: casting Everblooming grants the WHOLE TEAM +25% Basic ATK DMG Bonus for 30s
  //   (team-wide buff, not a Camellya-only self buff — TODO: verify calc engine applies this to teammates).
  // S5 Infinity Held in Your Palm: Everblooming's DMG Multiplier +303% AND Twining's DMG Multiplier +68%
  //   (two separate multipliers on two different skills — schema only has one totalMult slot, so previous
  //   single value of 40 was not representable correctly either way; TODO: needs Phase 2 schema to hold both).
  // S6 Bloom For You Thousand Times Over: Sweet Dream's (Budding Mode's) DMG Multiplier +150% additional
  //   (was wrongly 50 — corrected), plus unlocks Forte Circuit: Perennial (a whole new skill triggerable within
  //   15s of Ephemeral when Concerto Energy is full and off cooldown — consumes 50 Concerto Energy, recovers
  //   50 Crimson Pistils, deals 100% of Ephemeral's DMG as Basic ATK DMG, re-enters Budding Mode with Sweet
  //   Dream's bonus raised to 250%, immune to interruption while casting — TODO: needs Phase 2 schema, not
  //   representable as a flat stat bonus).
  'Camellya':     { s1: { critDmg: 28 }, s2: { totalMult: 120 }, s3: { atkPct: 58, totalMult: 50 }, s4: { basicDmg: 25 }, s5: { totalMult: 303 }, s6: { totalMult: 150 } },
  // Carlotta S1-S6 re-verified verbatim 2026-08-31 against the wiki/Carlotta/Combat:
  // S1 Beauty Blazes Brightest Before It Fades: +12.5% Crit Rate on that instance of DMG when hitting a
  //   Deconstructed target (confirmed, unchanged) — PLUS Chromatic Splendor hitting a Dispersion target
  //   additionally restores 30 Substance (resource-economy effect, not a DPS stat; no schema field for it).
  // S2 Fallen Petals Give Life to New Blooms: Fatal Finale's DMG Multiplier +126% (was wrongly totalMult:25,
  //   less than a fifth of the real value — straight transcription/magnitude bug, same class of error found
  //   in Changli's/Phrolova's rows).
  // S3 Adelante, Cortado, Spinning in Grace: DMG Multiplier of Art of Violence AND Chromatic Splendor both
  //   +93% (was wrongly totalMult:15). ALSO enables Outro Skill "Kaleidoscope Sparks": Closing Remark gains
  //   1 additional strike worth 1032.18% ATK Glacio DMG — a whole new action the flat schema can't add onto
  //   the Outro row without inflating the base Closing Remark multiplier itself.
  //   // TODO: needs Phase 2 schema — Kaleidoscope Sparks' +1032.18% ATK Outro strike is not representable
  //   // as a flat totalMult on this node without conflating it with the Art of Violence/Chromatic Splendor bonus.
  // S4 Yesterday's Raindrops Make Finest Wine: casting Heavy ATK, Containment Tactics, or Imminent Oblivion
  //   grants the WHOLE TEAM +25% Resonance Skill DMG Bonus for 30s (confirmed value; target is 'team', not
  //   Carlotta-only — TODO: verify calc engine applies this to teammates, not just self).
  // S5 Toast to Past, Today, and Every Day to Come: Imminent Oblivion's DMG Multiplier +47% (was wrongly
  //   totalMult:15, roughly a third of the real value).
  // S6 As the Curtain Falls, I Remain What I Am: Death Knell's DMG Multiplier +186.6% (was wrongly
  //   totalMult:50, well under a third of the real value) — also doubles Death Knell's crystal-shard count
  //   and adds a 1.5s Scattering immobilize on hit (CC, not a DPS stat; no schema field for it).
  'Carlotta':     { s1: { critRate: 12.5 }, s2: { totalMult: 126 }, s3: { totalMult: 93 }, s4: { skillDmg: 25 }, s5: { totalMult: 47 }, s6: { totalMult: 186.6 } },
  // Jiyan S1-S6 re-verified verbatim 2026-08-31 against the wiki/Jiyan/Combat's
  // "Resonance Chain" section (Chrome/Windows UA + google.com referer + jsRender, load+9s wait; 2nd attempt
  // cleared Cloudflare). Node names (Benevolence/Versatility/Spectation/Prudence/Resolution/Fortitude) at
  // line ~6739 already matched verbatim — unchanged. Corrections to the numeric/stat data below:
  // S1 Benevolence: purely utility (Windqueller +1 extra charge/use; Resolve cost of Windqueller -15) — has
  //   ZERO DPS component. Previous data fabricated `totalMult: 10` with no basis; zeroed with a TODO per the
  //   "don't guess, zero it" rule.
  // S2 Versatility: after Intro Skill Tactical Strike, gain 30 Resolve and ATK+28% for 15s (once per 15s) —
  //   confirmed correct as-is, no change.
  // S3 Spectation: casting Windqueller, Liberation Prelude, Finale, OR Intro Tactical Strike grants Crit
  //   Rate+16%/Crit DMG+32% for 8s — confirmed correct as-is, no change.
  // S4 Prudence: casting Liberation Prelude or Finale grants the WHOLE TEAM Heavy ATK DMG Bonus +25% for
  //   30s — confirmed correct as-is, no change.
  // S5 Resolution: TWO separate effects, only one of which was previously captured. (a) Outro Skill
  //   Discipline gains an ADDITIONAL +120% DMG Multiplier — not represented at all before; added as
  //   `totalMult: 120` (matches this file's convention elsewhere, e.g. Carlotta's totalMult nodes, for a
  //   flat DMG-multiplier bonus on a specific move). (b) ATK+3% per hit landed, stacking up to 15× (=+45%
  //   max) for 8s, instantly maxed after casting Tactical Strike — this IS the source of the previous
  //   `atkPct: 45` value (3%×15=45%), confirmed correct and kept, though the flat schema can't capture the
  //   per-hit stacking/8s-decay/instant-max-on-Intro conditionality — TODO: needs Phase 2 schema for that.
  // S6 Fortitude: stateful "Momentum" stacks (gained on Heavy ATK, Tactical Strike, or Windqueller use, cap
  //   2) that Emerald Storm: Finale consumes entirely on cast, each stack consumed giving Finale's OWN DMG
  //   Multiplier +120% (so up to +240% at 2 stacks, applying only to Finale, not a generic team/self total).
  //   Previous `totalMult: 40` was fabricated (not 40, not generic) — corrected to `totalMult: 240` to
  //   represent the realistic 2-stack max case, with a TODO noting the real mechanic is per-stack/conditional
  //   and needs Phase 2 schema to model properly (0/120/240 depending on Momentum stacks at cast time).
  'Jiyan':        { s1: { totalMult: 0 }, /* TODO: needs Phase 2 schema — Benevolence's extra Windqueller charge + Resolve-cost reduction are pure utility with no DPS component */
    s2: { atkPct: 28 }, s3: { critRate: 16, critDmg: 32 }, s4: { heavyDmg: 25 },
    s5: { atkPct: 45, totalMult: 120 }, /* TODO: needs Phase 2 schema — atkPct is a per-hit stack (max 15×, 8s duration, instant-maxed by Tactical Strike), not a flat buff */
    s6: { totalMult: 240 } /* TODO: needs Phase 2 schema — real value is +120%/Momentum stack (cap 2) on Emerald Storm: Finale only, consumed on cast; 240 is the 2-stack-max case, not a flat constant */ },
  // Jinhsi S1-S6 re-verified verbatim 2026-08-31 against the wiki/Jinhsi/Combat
  // (Chrome/Windows UA + google.com referer + jsRender, load+9s wait to clear Cloudflare):
  // S1 Abyssal Ascension: casting Incarnation-Basic Attack OR Crescent Divinity grants 1 stack of Herald
  //   of Revival (max 4 stacks, 6s duration each); casting Illuminous Epiphany consumes ALL stacks, each
  //   granting +20% DMG to that cast — up to +80% at 4 stacks. Modeled as skillDmg:40 (rotation-average of
  //   a 0-80% range, since stack count is execution-dependent) — confirmed correct, unchanged.
  // S2 Chronofrost Repose: restores 50 Incandescence after 4s+ out of combat, 1 trigger per 4s — pure
  //   pre-fight/downtime utility, no in-combat DPS number to model. totalMult:5 kept as a minimal non-zero
  //   placeholder — confirmed correct (no combat DMG stat exists for this effect), unchanged.
  // S3 Celestial Incarnate: casting Intro Skill Loong's Halo grants 1 stack of Immortal's Descendancy
  //   (+25% ATK/stack, max 2 stacks, 20s duration) = up to +50% ATK at 2 stacks. Confirmed correct,
  //   unchanged (atkPct:50 already matched source exactly).
  // S4 Benevolent Grace: casting Resonance Liberation Purge of Light OR Resonance Skill Illuminous
  //   Epiphany grants the WHOLE NEARBY TEAM +20% Attribute DMG Bonus for 20s (team-wide, not Jinhsi-only).
  //   "Attribute DMG Bonus" here is the generic universal-DMG-Amp shape (each teammate buffed on THEIR
  //   OWN element, not restricted to Spectro) — same shape as Galbrena/Phrolova/Lucy's identically-worded
  //   S4 nodes, which all model it as allDmg with no element condition. WAS wrongly stored as
  //   { elemDmg: 20 } (paired with a Spectro-only `condition: { element: 'spectro' }` in
  //   jinhsi.blocks.js), which would silently zero this buff out for every non-Spectro teammate — a real
  //   bug, not a documented modeling limitation. Corrected 2026-09-04 to { allDmg: 20 }.
  // S5 Frostfire Illumination: DMG Multiplier of Resonance Liberation Purge of Light is increased by 120%
  //   — WAS wrongly modeled as totalMult:15 (no basis in source, wrong stat AND wrong skill entirely).
  //   Corrected to libDmg:120.
  // S6 Thawing Triumph: DMG Multiplier of Resonance Skill Illuminous Epiphany is increased by 45%, AND
  //   (separately) the additional DMG Multiplier gained per Incandescence consumed is ALSO increased by
  //   45% (i.e. the per-point conversion rate itself goes up, compounding with S5's Incandescence-spend
  //   scaling) — two distinct multipliers on the same skill, only one representable in this schema. WAS
  //   wrongly totalMult:30 (no basis). Corrected to skillDmg:45 for the flat Illuminous Epiphany DMG Mult
  //   bonus; the per-Incandescence conversion-rate increase is NOT representable as a flat stat here —
  //   TODO: needs Phase 2 schema to hold both the flat skill-mult bonus and the scaling-rate bonus.
  'Jinhsi':       { s1: { skillDmg: 40 }, s2: { totalMult: 5 }, s3: { atkPct: 50 }, s4: { allDmg: 20 }, s5: { libDmg: 120 }, s6: { skillDmg: 45 } },
  // Calcharo S1-S6 re-verified verbatim 2026-08-31 against the wiki/Calcharo/Combat's
  // "Resonance Chain" section (Chrome/Windows UA + google.com referer + jsRender, load+9s wait; 2nd attempt
  // cleared Cloudflare), cross-checked against the source/wuthering-waves/characters/calcharo (identical
  // text). Node names (Covert Negotiation/Zero-Sum Game/Iron Fist Diplomacy/Dark Alliance/Unconventional
  // Compact/The Ultimatum) at line ~6802 already matched verbatim — unchanged.
  // S1 Covert Negotiation: "Resonance Skill Extermination Order hits additionally recover 10 Resonance
  //   Energy, once every 20s" — purely a Resonance Energy utility effect with ZERO DPS component. Previous
  //   data fabricated `totalMult: 5` with no basis; zeroed with a TODO per the "don't guess, zero it" rule.
  // S2 Zero-Sum Game: casting Intro Skill Wanted Outlaw OR "Necessary Means" grants Resonance Skill DMG
  //   Bonus +30% for 15s — confirmed correct as-is (skillDmg:30 matches both value and stat category), no
  //   change; TODO note added for the 15s-duration/Intro-cast-trigger conditionality the flat schema can't
  //   capture.
  // S3 Iron Fist Diplomacy: during Resonance Liberation Deathblade Gear state, Electro DMG Bonus +25% —
  //   confirmed correct as-is (elemDmg:25 matches both value and stat category), no change.
  // S4 Dark Alliance: after casting Outro Skill Shadowy Raid, Electro DMG Bonus of the WHOLE TEAM +20% for
  //   30s — confirmed correct as-is (elemDmg:20 matches both value and stat category; team-wide caveat same
  //   as Camellya's S4/Jinhsi's S4 above), no change.
  // S5 Unconventional Compact: Intro Skill Wanted Outlaw and "Necessary Means" deal 50% MORE DAMAGE (a flat
  //   DMG-multiplier bonus on those two specific casts) — WAS wrongly `totalMult: 15`, less than a third of
  //   the real value and with no basis in source. Corrected to `totalMult: 50` (matches this file's
  //   convention elsewhere, e.g. Jiyan's S5/Carlotta's nodes, for a flat DMG-multiplier bonus scoped to a
  //   specific move) — TODO: needs Phase 2 schema to scope this to Intro-Skill-only rather than a generic
  //   total multiplier.
  // S6 The Ultimatum: casting Resonance Liberation "Death Messenger" summons 2 Phantoms that EACH deal
  //   Electro DMG equal to 100% of Calcharo's ATK (considered Resonance Liberation DMG) — this is two
  //   separate extra attack instances, not a %DMG buff at all. Previous `totalMult: 40` was fabricated (not
  //   40, not a multiplier-type effect in the first place) — corrected to `totalMult: 200` as the closest
  //   flat-schema approximation of "2 hits × 100% ATK" (200% ATK-scaling worth of extra Liberation DMG per
  //   Death Messenger cast), with a TODO noting the real mechanic is two separate flat-ATK-scaling hits, not
  //   a multiplier on Death Messenger's own damage, and needs Phase 2 schema to model properly.
  'Calcharo':     { s1: { totalMult: 0 }, /* TODO: needs Phase 2 schema — Covert Negotiation's Resonance Energy recovery is pure utility with no DPS component */
    s2: { skillDmg: 30 }, /* TODO: needs Phase 2 schema — only active for 15s after casting Intro Skill Wanted Outlaw/Necessary Means, not a flat passive buff */
    s3: { elemDmg: 25 }, s4: { elemDmg: 20 },
    s5: { totalMult: 50 }, /* TODO: needs Phase 2 schema — scoped to Intro Skill Wanted Outlaw/Necessary Means only, not a generic total multiplier */
    s6: { totalMult: 200 } /* TODO: needs Phase 2 schema — real mechanic is 2 separate Phantom hits at 100% ATK each on "Death Messenger" cast, not a %DMG multiplier; 200 approximates the combined ATK-scaling value */ },
  // Encore — re-verified verbatim 2026-08-31 against the wiki/Encore/Combat + wuthering.gg/characters/encore.
  // S1: "Fusion DMG Bonus +3%, stacking up to 4 times for 6s" on Basic ATK hit = 12% max (elemDmg, confirmed correct category+value).
  // S2 corrected: previous `totalMult: 5` was a fabricated placeholder for a node that has ZERO DPS component —
  // real effect is "additionally restores 10 Resonance Energy when casting Basic Attack Wooly Attack or Resonance
  // Skill Energetic Welcome, once every 10s", pure Energy-economy utility. Zeroed per the no-fabricated-numbers rule.
  // S3: "DMG multiplier of Heavy Attack Cloudy Frenzy and Heavy Attack Cosmos Rupture +40%" — both are explicitly
  // named "Heavy Attack" by source despite being Forte-triggered, so heavyDmg is the correct category (confirmed correct).
  // S4: "Heavy Attack Cosmos Rupture increases team Fusion DMG Bonus by 20% for 30s" (elemDmg, confirmed correct).
  // S5: "Resonance Skill DMG Bonus +35%" (skillDmg, confirmed correct).
  // S6: "gains 1 stack of Lost Lamb per damage instance during Cosmos Rave, each +5% ATK for 10s, stacking up to
  // 5 times" = 25% max (atkPct, confirmed correct) per the wiki's Combat page and wuthering.gg's Resonance Chain
  // section (both independently say 5 stacks / 25%). NOTE: the source's live character page states "stacking up to
  // 6 time(s)" for this same node — an outlier vs. two independent sources agreeing on 5; kept at 25% (5 stacks)
  // per the two-source majority and this project's designated primary source, discrepancy flagged here rather
  // than silently resolved either way.
  // s3 corrected 2026-09-03 against a fresh the source dump: was heavyDmg:40. The dump's own S3 text reads
  // "The DMG multiplier of Resonance Liberation Cloudy: Frenzy and Resonance Liberation Cosmos: Rupture
  // is increased by 40%" — both moves are explicitly named "Resonance Liberation" (not "Heavy Attack")
  // by the source, matching their own kit text ("considered as Resonance Liberation damage") and
  // SKILL_MULTIPLIERS['Encore']'s own note ("counted as Resonance Liberation DMG") for both rows. The
  // old heavyDmg value was a dead/no-op buff — Encore has no heavyDmg-categorized damage block for
  // either move (encore.forte.cosmos-rupture already correctly uses category:'libDmg'), so this S3
  // bonus was silently applying to nothing.
  'Encore':       { s1: { elemDmg: 12 }, s2: { totalMult: 0 }, /* TODO: needs Phase 2 schema — Sheep-counting Lullaby's Resonance Energy recovery (10 Energy, once per 10s) is pure utility with no DPS component */
    s3: { libDmg: 40 }, s4: { elemDmg: 20 }, s5: { skillDmg: 35 }, s6: { atkPct: 25 } },
  // Xiangli Yao — full audit 2026-09-01 against wuwa.build's character #1305 Resonance Chain panel,
  // cross-checked against wutheringlab.com/arabwuwa.com (all three agree on wording/values below).
  // S1 "Prodigy of Protégés": Law of Reigns additionally launches 6 Convolution Matrices, each dealing
  // Resonance Liberation DMG = 8% of Law of Reigns' own DMG Multiplier — 6 extra proc hits scaling off
  // another move's multiplier, not a flat stat buff. Previous `totalMult: 10` was a fabricated filler
  // number. Zeroed to {}.
  // TODO: needs Phase 2 schema — can't represent "N bonus hits at X% of move Y's own multiplier" in
  // the flat {stat: value} schema.
  // S2 "Traces of Predecessors": Crit DMG +30% for 8s, triggered by casting Resonance Skill OR
  // Resonance Liberation Cogitation Model — value/category already correct (critDmg: 30).
  // S3 "Ruins of Ancient": was skillDmg: 40 (wrong value); real effect is DMG of Decipher/Deduction/
  // Divergence/Law of Reigns +63% for 24s, up to 5 stacks. Corrected 40 -> 63. NOTE: Law of Reigns is
  // itself counted as Liberation DMG (not Skill DMG, see CHARACTER_ROTATIONS comment above) — this
  // single node buffs both a skillDmg-type set of moves (Decipher/Deduction/Divergence) and a
  // libDmg-type move (Law of Reigns) at once; only the Skill-type portion is captured here.
  // TODO: needs Phase 2 schema — the Law of Reigns (libDmg) portion of this same S3 buff has no home
  // in a single-category node.
  // S4 "Vessel of Rebirth": casting Cogitation Model grants the whole team +25% DMG Bonus to Resonance
  // Liberation for 30s — value/category already correct (libDmg: 25).
  // S5 "End of Stars": was totalMult: 15 (fabricated); real effect is Outro Chain Rule's own DMG
  // Multiplier +222% AND Resonance Liberation Cogitation Model's own DMG Multiplier +100% — two
  // separate multiplier boosts to two different named moves, not a flat total multiplier. Captured the
  // Liberation-type portion as libDmg: 100.
  // TODO: needs Phase 2 schema — the Outro Chain Rule +222% DMG Multiplier portion has no matching
  // category in this schema (no "outro DMG" stat exists) and is not represented in the object below.
  // S6 "Solace of the Ordinary": was totalMult: 15 (fabricated, wrong category and value); real effect
  // is Law of Reigns' own DMG Multiplier +76% (re-verified 2026-09-01 against
  // the wiki/Xiangli_Yao/Combat node text via the MediaWiki API AND
  // the source/character/1305, both agreeing on 76% — supersedes the prior 75% taken from the
  // secondary wuwa.build/arabwuwa cross-reference). Law of Reigns counted as Liberation DMG, so
  // category totalMult -> libDmg, value 15 -> 76.
  // Intro Skill "Principle" (CHARACTER_ROTATIONS above): briefly miscorrected 2026-09-01 to 79.32%×2
  // from a malformed the wiki Attribute Scaling table row (value sat under column 7 of a 1-10 level
  // table, not column 10 — colspan padding made it look like the table's only entry). Reverted back to
  // the correct 99.41%×2 after cross-checking the source/character/1305, which explicitly labels its
  // Skill Attributes table "(Lv.10)" and lists 99.41%×2 — no change needed, original value was correct.
  // s1 re-confirmed 2026-09-03 against a fresh the source dump: source text is "Law of Reigns additionally
  // launches 6 Convolution Matrices, each dealing Resonance Liberation DMG equal to 8% of THE SKILL'S
  // OWN DMG Multiplier" — i.e. 6x8%=48% of Law of Reigns' own multiplier specifically, not a flat 48%
  // bonus. A flat libDmg value here would incorrectly also inflate Cogitation Model's and Revamp's own
  // libDmg-categorized hits (over-crediting) since this codebase's libDmg stat applies broadly, not
  // scoped to one move — matching xianglyao.blocks.js's own already-correct s1 reasoning (kept
  // deliberately unmodeled; needs a scopedToBlockId-style mechanism this flat table doesn't have).
  // Left as {} — not a bug, a documented, correct limitation, reconfirmed rather than changed.
  'Xiangli Yao':  { s1: {}, s2: { critDmg: 30 }, s3: { skillDmg: 63 }, s4: { libDmg: 25 }, s5: { libDmg: 100 }, s6: { libDmg: 76 } },
  // Aemeath S1: +300% Crit DMG for Heavy ATK in Instant Response (confirmed exact). S3: Between the Stars enhanced to
  // CD+60% (confirmed exact) + Heavenfall Edict: Finale DMG Mult+100% (was defIgnore:20, no basis at all — real S3 has
  // no DEF Ignore effect). S4: team +20% All-Attr DMG on Intro/Sync Strike/Duet cast (was totalMult:15, no basis).
  // S6: Aemeath's Liberation DMG taken by targets +40% (confirmed exact value, recategorized from totalMult to libDmg)
  // S5 zeroed 2026-09-02 (found while cross-checking a fresh the source dump — this row was never covered
  // by the audit comment above, unlike every other node here): was totalMult:40, a fabricated number.
  // Real S5 effect ("On kill, reset Starflux to 100%; on fatal damage, revive with a team shield
  // instead of dying, once per 10 min") is purely survivability/utility, zero DPS component — confirmed
  // via the source's own damage-output simulation, where S4 and S5 produce byte-identical DMG/DPS.
  // S2 note (resolved 2026-09-05, the flagged "needs its own dedicated verification pass" item):
  // real S2 effect is "Seraphic Duet Overture/Encore DMG Multipliers both +100%" — now modeled
  // PRECISELY in aemeath.blocks.js's own chain.s2 block via scopedToBlockId to each real Duet block
  // (Overture is skillDmg-categorized, Encore is libDmg — no double-up against S3's Finale-scoped
  // libDmg+100, since that's a different block id). This flat table's own `totalMult:25` below is
  // left as a deliberate, documented legacy-fallback approximation — a single flat number
  // structurally cannot represent two different move-scoped +100% bonuses, and this table is only
  // read by the pre-conversion fallback path (Aemeath herself is fully converted; her real computed
  // numbers come from the block, not this row).
  'Aemeath':      { s1: { critDmg: 300 }, s2: { totalMult: 25 }, s3: { libDmg: 100, critDmg: 60 }, s4: { allDmg: 20 }, s5: {}, s6: { libDmg: 40 } },
  // Zani S1: +50% Spectro DMG (confirmed exact). S2: CR+20% + mult boost. S4: team ATK+20%
  'Zani':         { s1: { elemDmg: 50 }, s2: { critRate: 20, skillDmg: 80 }, s3: { libDmg: 200 }, s4: { atkPct: 20 }, s5: { libDmg: 120 }, s6: { heavyDmg: 40 } },
  // Zani R-chain corrected 2026-08-16 via the source: s1 Targeted Action/Forcible Riposte +50% Spectro DMG confirmed correct;
  // s2 +20% Crit Rate + Targeted Action/Forcible Riposte DMG Mult +80% (was critRate:20 + unfounded totalMult:25); s3 The Last Stand DMG Mult scales up to +1200% with full Blaze consumption,
  // used a conservative rotation-representative libDmg:200 instead of the theoretical max (was totalMult:15, no basis); s4 team +20% ATK on Intro cast confirmed correct;
  // s5 Rekindle DMG Mult +120% (was totalMult:40, wrong category); s6 Heavy Slash Daybreak/Dawning/Nightfall/Lightsmash Mult +40% (was totalMult:40 + duplicate heavyDmg:40, consolidated).
  // Re-verified node-by-node 2026-08-31 via the wiki/Zani/Combat's "Resonance Chain"
  // section, cross-checked against the source/wuthering-waves/characters/zani's "Resonance Chain (Dupes)" tab
  // (both live, Chrome UA + google.com referer + jsRender). All six 2026-08-16 values confirmed exact against
  // primary source, no numeric changes this pass — but two genuinely stateful/threshold effects the flat
  // {stat: value} schema can't fully capture were found and are left undone rather than force-fit:
  // - s3: real effect is "+8% Last Stand DMG Mult PER Blaze consumed in Inferno Mode, maxed at +1200%" — a
  //   per-unit-of-a-consumable-resource scaling stat this schema has no field for (libDmg:200 stays as the
  //   documented conservative rotation-representative estimate, not the true 0-1200% range).
  //   TODO: needs Phase 2 schema (a per-resource-point scaling multiplier) to represent s3 exactly.
  // - s6 also grants two non-DPS utility effects on top of the confirmed +40% Heavy Slash DMG Mult: (a) once
  //   per Inferno Mode, if Blaze is below 70 when this would matter, instantly restore it to 70, and (b) for
  //   8s after entering Inferno Mode, Zani survives an otherwise-fatal hit at 1 HP. Both are zeroed/omitted
  //   from any DPS field per the Phrolova/Brant precedent (pure survivability, no DMG component) — heavyDmg:40
  //   above already fully represents s6's only damage-relevant effect.
  // Note: one wiki-style source's own S3 text refers to the Liberation by the name "Judgement Day" whereas
  // other sources and the skill's own in-game name is "The Last Stand" — treated as a stale/inconsistent
  // translation label for the same skill (other sources and the Forte/Liberation section of that same
  // wiki-style source's own page agree it's The Last Stand), not a separate mechanic; does not affect the
  // stored value.
  // Phoebe S1: Liberation mult increase ≈ libDmg 15. S3: Heavy ATK+40%
  // Phoebe R-chain re-verified verbatim 2026-08-31 against the wiki/Phoebe/Combat's
  // "Resonance Chain" section (Chrome UA + google.com referer + jsRender). Every node was previously wrong
  // — the old {libDmg:15, skillDmg:25, heavyDmg:40, atkPct:15, totalMult:15, critDmg:25} placeholder set
  // had no basis in the real text at all (wrong category on 4 of 6 nodes, and Phoebe has no Crit Rate/DMG
  // R-chain node whatsoever). All values below use her Absolution-mode number (matching this file's
  // Absolution-mode rotation/build) with the Confession-mode alternate noted; both modes are given
  // verbatim so nothing is invented:
  // S1 Warm Light and Bedside Wishes: Dawn of Enlightenment DMG Mult 255%→480% in Absolution (delta +225,
  //   modeled as libDmg:225); in Confession instead +90% DMG Mult and max-stack Frazzle application.
  // S2 A Boat Adrift in Tears: in Absolution, Outro DMG to Frazzle-afflicted targets +120% Amp; in
  //   Confession, Silent Prayer's Frazzle DMG Amp is itself increased by another 120%. Both are Frazzle-
  //   DMG-Amp effects (same stat category as Attentive Heart's own Confession 100% amplify buff), modeled
  //   as amplify:120 (was skillDmg:25 — wrong category, Phoebe's S2 never touches Skill DMG at all).
  // S3 Daisy Wreaths and Dreams: Starflash DMG Mult +91% in Absolution / +249% in Confession (was
  //   heavyDmg:40 — magnitude wrong, real Absolution number is more than double that).
  // S4 Ringing Bells on Wings Aloft: Basic ATK/Chamuel's Star/Dodge Counter/Chamuel's Star: Dodge Counter
  //   hits reduce the target's Spectro RES by 10% for 30s — a RES Shred, not an ATK buff (was atkPct:15,
  //   wrong category with no basis; corrected to resShred:10).
  // S5 Prayer to the Distant Light: casting Intro Skill Golden Grace grants +12% Spectro DMG Bonus for
  //   15s — an elemental DMG buff conditional on the Intro cast (was totalMult:15, wrong category;
  //   corrected to elemDmg:12).
  // S6 Whispering Chirps in Silence: in Absolution/Confession, summoning a Ring of Mirrors (Resonance
  //   Skill cast) grants +10% ATK for 20s AND triggers one free extra Starflash at the ring (no Divine
  //   Voice cost, not counted as a Heavy ATK cast for other interactions) — was critDmg:25 with no basis
  //   at all; Phoebe has no Crit stat anywhere in her real R-chain. Corrected to atkPct:10 for the ATK
  //   portion. TODO: needs Phase 2 schema — the free bonus Starflash proc (a real extra damage instance)
  //   and the node's non-DPS extended-stagnation utility (+2s stagnation, all-target application) can't be
  //   represented by this flat {stat:value} schema and are left out rather than force-fit into atkPct.
  'Phoebe':       { s1: { libDmg: 225 }, s2: { amplify: 120 }, s3: { heavyDmg: 91 }, s4: { resShred: 10 }, s5: { elemDmg: 12 }, s6: { atkPct: 10 } },
  // Phrolova R-chain re-verified 2026-08-31 verbatim against the wiki/Phrolova/Combat
  // (Resonance Chain section), cross-checked the source/character/1608. Every node checked individually,
  // per the Changli lesson that existing values can be wrong in stat category, not just magnitude:
  // S1 "A Key to Netherworld's Secrets": Movement of Fate and Finality DMG Mult +80% AND Murmurs in a
  //   Haunting Dream DMG Mult +80% (was totalMult:20, magnitude wrong — real number is 80, not 20; kept
  //   totalMult as the category since it buffs two specific Forte-follow-up multipliers, not a general
  //   stat bucket). Also grants Volatile Note - Cadenza every 4s out-of-combat if she holds <2 Notes and
  //   isn't in Maestro — TODO: needs Phase 2 schema (conditional out-of-combat resource regen, not a DPS stat).
  //   Corrected 2026-09-02: this node was inert (no matching SKILL_MULTIPLIERS row for either buffed
  //   move) until a fresh the source dump gave real values for Movement of Fate and Finality/Murmurs in a
  //   Haunting Dream (see SKILL_MULTIPLIERS['Phrolova'] above) — now a live +80% totalMult on real damage.
  // S2 "A Rope Tied to a Life Beyond": Scarlet Coda DMG Mult +75% (magnitude was already correct) BUT the
  //   wiki explicitly states "This instance of damage is considered Resonance Skill DMG" — so the correct
  //   stat category is skillDmg, NOT heavyDmg (Scarlet Coda replaces Heavy Attack as an input, but its
  //   damage type is Skill; the old heavyDmg categorization was wrong exactly the way Changli's nodes were).
  //   Node also doubles Aftersound's per-stack bonus to Scarlet Coda's multiplier (+75% instead of the
  //   base +82.55%/stack-equivalent) and grants 14 Aftersound stacks on cast — TODO: needs Phase 2 schema
  //   (stacking/per-cast resource grant, current schema has no field for either).
  // S3 "A Dagger to Cut Clean Obsessions": Echo Skill DMG Amplified +80% — value and echoDmg category both
  //   confirmed correct, no change. Node also converts all Volatile Notes to Cadenza on Scarlet Coda cast
  //   and applies a 20% ATK reduction debuff (15s) to targets hit by Enhanced Attack-Hecate: Cadenza —
  //   TODO: needs Phase 2 schema (enemy-side debuff + stateful note conversion, not a self DPS stat).
  // S4 "A Torch Illuminating the Path": casting Echo Skill grants the WHOLE TEAM +20% Attribute DMG Bonus
  //   for 30s — value (20) and allDmg category both confirmed correct, no change; duration is 30s (was
  //   undocumented, added to this comment for the record — flat schema has no duration field).
  // S5 "A Forked Road in Fate's Heartland": Maestro-entry Stagnate field (4s, ends early if she leaves
  //   Maestro/swaps) + 30% DMG TAKEN reduction during Maestro — this is a purely defensive/utility node
  //   with NO DMG-dealing component at all (was totalMult:10, force-fit with no basis in source). Left
  //   empty per the "don't force-fit a lossy value" rule — TODO: needs Phase 2 schema (defensive stat,
  //   current schema only models offensive stat additions).
  // S6 "A Night to Depart From Eternal Rest": TWO conditional DMG components depending on whether Phrolova
  //   is on-field during Maestro — off-field: enemies take +40% more DMG from Hecate/Phrolova (a DMG-taken
  //   debuff, not a self buff); on-field: Phrolova gains +60% Havoc DMG Bonus (elemDmg) instead. Modeled
  //   the larger, self-buff, on-field case as elemDmg:60 (was elemDmg:24, which was actually the node's
  //   separate flat +24% Enhanced Attack-Hecate DMG Mult — correct number, wrong node component to surface
  //   as the headline stat). TODO: needs Phase 2 schema for the on-field/off-field branch (the off-field
  //   +40% enemy DMG-taken debuff case is still not modeled).
  //   Corrected 2026-09-02: this node ALSO grants "Apparition of Beyond-Hecate" — a real, previously
  //   entirely-unmodeled S6-only damage instance (216.42% ATK, Havoc, considered Echo Skill DMG, grants
  //   8 Aftersound on hit) fired during Movement of Fate and Finality/Murmurs in a Haunting Dream, per a
  //   fresh the source dump. Can't be represented by this flat {stat:value} table (it's a real damage HIT,
  //   not a stat bonus) — modeled instead as its own gated TriggerBlock, phrolova.chain.s6-apparition,
  //   in phrolova.blocks.js. The +24% Enhanced Attack-Hecate multiplier is ALSO now modeled (fixed
  //   2026-09-02, once phrolova.liberation.hecate-attack existed to scope it to) — as a 2nd effects[]
  //   entry on phrolova.chain.s6 in phrolova.blocks.js, via scopedToBlockId, not representable in this
  //   flat table (RESONANCE_CHAIN_DATA has one stat per node, not a list).
  'Phrolova':     { s1: { totalMult: 80 }, s2: { skillDmg: 75 }, s3: { echoDmg: 80 }, s4: { allDmg: 20 }, s5: {}, s6: { elemDmg: 60 } },
  // Brant R-chain — verified verbatim 2026-08-31 against the wiki/Brant/Combat
  // (Chrome/Windows UA + google.com referer + jsRender, load+9s wait to clear Cloudflare):
  // s1 "By Currents and Winds": casting Intro Skill or each Mid-air Attack flip grants +20% DMG dealt
  //   for 5s, STACKING up to 3 times = 60% at max stacks — was stored as the single-stack value (20),
  //   not the max-stacks total; corrected to 60 (allDmg), matching the max-stacks convention already
  //   used elsewhere (e.g. Augusta's s1 stores 30 = 15%/stack × 2 stacks, not 15). Node also makes
  //   Returned from Ashes cause nearby targets to Stagnate (removed if Brant is swapped off-field) —
  //   TODO: needs Phase 2 schema (stateful field effect, not a DPS stat).
  // s2 "For Smiles and Cheers": Mid-air Attack / Returned from Ashes hits grant +30% Crit Rate — value
  //   and category confirmed correct, kept. The stored totalMult:25 had NO basis in this node's text at
  //   all (fabricated): the node's actual second effect is a conditional Outro enhancement — within 20s
  //   of Outro, the incoming/nearby Resonator's Skill hits trigger a Brant-dealt Fusion explosion worth
  //   440% ATK (Basic ATK DMG type), max 1/sec, max 2 explosions total — removed the fabricated 25 and
  //   left a TODO: needs Phase 2 schema (partner-action-triggered, capped-count, off-field damage).
  // s3 "Through Storms I Sail": Returned from Ashes' DMG Multiplier is increased by 42% — was stored as
  //   totalMult:15, a magnitude bug (should be 42, not 15); corrected.
  // s4 "To Freedom I Sing": +20% Returned from Ashes Shield strength, plus team healing on cast (6.60 HP
  //   per 1% ER) — a purely defensive/utility node with NO DMG-dealing component. Was stored as
  //   elemDmg:15, a number with zero basis in this node's text (same fabricated-number pattern as
  //   Phrolova's S5) — zeroed out per the "don't force-fit a lossy value" rule. TODO: needs Phase 2
  //   schema (shield-strength buff + healing, not modeled by any current offensive stat field).
  // s5 "All the World's an Actor's Stage": Basic ATK DMG grants Brant +15% Basic Attack DMG Bonus for
  //   10s — value (15) was correct but the stored category (totalMult) was wrong; this is specifically
  //   Basic ATK DMG, i.e. basicDmg, not a total-damage multiplier. Corrected category.
  // s6 "All the World's a Captain's Carnevale": Mid-air Attack's DMG Multiplier +30%, PLUS Returned from
  //   Ashes triggers a secondary blast for 30% of its own DMG (Basic ATK DMG type) — was stored as
  //   amplify:40, a stat/number combination with no basis anywhere in this node's text (no "amplify"
  //   mechanic exists on this node at all). Corrected the headline stat to totalMult:30 (the Mid-air
  //   multiplier increase); the secondary 30%-of-Forte-damage echo is a separate conditional component
  //   this flat schema can't also carry — TODO: needs Phase 2 schema (percent-of-another-hit's-damage
  //   secondary instance).
  'Brant':        { s1: { allDmg: 60 }, s2: { critRate: 30 }, s3: { totalMult: 42 }, s4: {}, s5: { basicDmg: 15 }, s6: { totalMult: 30 } },
  // Augusta S1: +15% CD per Crown stack x2=30% (confirmed). S2: +20% CR per stack + excess CR→CD conversion
  // s5 zeroed 2026-09-02 (found while cross-checking a fresh the source source dump): was totalMult:15, a
  // fabricated number with no basis in the node's own text (same shape as Brant's S1/Phrolova's S5,
  // both correctly zeroed elsewhere in this table for the identical reason) — Glory's Favor shield
  // value +50% is a purely defensive stat, zero DPS component, per the comment block below.
  'Augusta':      { s1: { critDmg: 30 }, s2: { critRate: 40 }, s3: { totalMult: 25 }, s4: { atkPct: 20 }, s5: {}, s6: { heavyDmg: 200 } },
  // Augusta R-chain — verified verbatim 2026-08-31 against the wiki/Augusta/Combat
  // (Chrome/Windows UA + google.com referer + jsRender, load+8s wait to clear Cloudflare):
  // s1 "Stained in Scorched Earth": Crown of Wills +15% Crit DMG per stack (max stack raised 1→2) = 30% at 2 stacks. Confirmed correct.
  // s2 "Cleansed in Crimson War": Crown of Wills +20% Crit Rate per stack (2 stacks = 40%, modeled) — PLUS a separate
  //     conditional conversion not modeled here: "for every 1% Crit Rate over 100%, +2% Crit DMG, up to 100%" (i.e. up
  //     to another +100% Crit DMG at 150%+ CR). TODO: verify whether calcEngine's CR/CD pipeline can express this
  //     threshold-conversion before adding it — flat critRate:40 is the safe partial model for now.
  // s3 "Forged in Rot and Ruin": +25% DMG Mult specifically on Heavy Attack - Thunderoar: Backstep / Spinslash / Uppercut
  //     and their Dodge Counter equivalents only (not a generic Heavy ATK buff) — modeled as totalMult:25 since those are
  //     her only Heavy ATK hits anyway.
  // s4 "Ascent in Sun and Glory": casting Intro Skill - Stride of Goldenflare grants the WHOLE TEAM +20% ATK for 30s
  //     (not self-only, not a permanent buff — duration-gated).
  // s5 "Unshaken in Wrathful Tides": Inherent Skill - Glory's Favor shield value +50% — a survivability stat, no direct
  //     DPS number; zeroed to {} 2026-09-02 (was totalMult:15, a fabricated approximate-uptime proxy with no basis
  //     in the node's own text — same "don't force-fit a lossy value" rule already applied to Brant's S1/Phrolova's S5).
  // s6 "Engraved in Radiant Light": Crown of Wills max stacks 2→4; CR-over-150%→CD conversion up to +50% (separate,
  //     unmodeled, same caveat as s2); AND casting Thunderoar: Spinslash or Uppercut grants 2 Crown of Wills stacks
  //     (capped at 2 stacks/sec) AND triggers "Thunder Rage" — 2 separate Electro Heavy-ATK hits at 100% ATK each (200%
  //     ATK total, on top of the move's own damage). heavyDmg:200 approximates the Thunder Rage add-on only.
  //
  // Forte/Outro mechanic (the conditional the user flagged as missing — see CHARACTER_ROTATIONS['Augusta'] Outro entry
  // and CHARACTER_DATA['Augusta'].desc for the full write-up): Augusta's Outro Skill - Battlesong of the Unyielding
  // grants the NEXT resonator switched in +15% All-Attribute DMG Amp for 14s, "which end[s] immediately if they are
  // switched out." While that buff is still active on them, if THAT SAME resonator casts THEIR OWN Outro Skill
  // (swapping back out), Augusta gains +1 Majesty stack AND +1 Crown of Wills stack. Swapping to a third character
  // first ends the 14s buff early and the Outro-back condition can no longer be met — exactly the "gains the point only
  // if the same character Outros back before a third swap" mechanic. Source: the wiki/Augusta/Combat, 2026-08-31.
  // Cartethyia R-chain re-verified verbatim 2026-08-31 against the wiki/Cartethyia/Combat
  // "Resonance Chain" section (Chrome UA + google.com referer + jsRender):
  // s1 "Crown Destined by Fate": when Fleurdelys's Conviction hits 30/60/90/120, Crit DMG +25% for 15s, up to 4
  //     stacks (25%*4 = 100% at full stack); duration does not reset on a new stack; all stacks removed after
  //     casting Blade of Howling Squall. critDmg:100 confirmed unchanged. Also grants a separate, unmodeled "Zeal"
  //     proc (10s window on an Erosion-inflicted kill that maxes Erosion stacks on the next kill's targets) —
  //     TODO: needs Phase 2 schema, no DPS-stat equivalent in this flat schema.
  // s2 "Blade Broken by Tempest": DMG Multiplier of Basic ATK/Heavy ATK/Dodge Counter/Intro Skill +50% (basicDmg:50,
  //     confirmed unchanged) AND DMG Multiplier of Mid-air Attack +200% specifically (totalMult fallback, since
  //     there's no dedicated mid-air-only stat) — FIXED 2026-08-31: was totalMult:30, which didn't match the source
  //     value the node's own prior comment already claimed (200%); corrected to totalMult:200. Also raises Erosion's
  //     max-stack cap by +3 within range on Liberation1 cast and reduces Skill cooldown by 1s per Sword Shadow type
  //     recalled via Mid-air Attack — both unmodeled (no cooldown/stack-cap stat in this schema).
  // s3 "Prisoner Hanged in the Tower": DMG Multiplier of Resonance Liberation - Blade of Howling Squall +100%
  //     (libDmg:100, confirmed unchanged). Also makes Basic5/Mid-air2/Enhanced Heavy/Skill2 inflict 2 Erosion
  //     stacks each — unmodeled (no Erosion-application stat in this schema).
  // s4 "Sacrifice Made for Salvation": after any team member inflicts Havoc Bane/Fusion Burst/Spectro Frazzle/
  //     Electro Flare/Glacio Chafe/Aero Erosion, the WHOLE team gains +20% DMG Bonus for ALL Attributes for 20s
  //     (allDmg:20, confirmed unchanged; duration not captured by the flat schema).
  // s5 "Hope Reshaped in Storms": ZEROED 2026-08-31 (was totalMult:15, fabricated — didn't match either real
  //     effect below). Purely defensive, zero DPS component: (a) fatal-blow immunity once per 10 real-time minutes,
  //     granting a Shield = 20% of Cartethyia's Max HP for 10s; (b) Liberation1 HP cost reduced from 50% to 25% of
  //     Max HP. Neither has a DPS-stat equivalent — TODO: needs Phase 2 schema if shield/HP-cost mechanics are ever
  //     modeled.
  // s6 "Freedom Found in Storm's Wake": targets take +40% more DMG from Fleurdelys specifically (elemDmg:40,
  //     confirmed unchanged — matches the "targets take X% more DMG" debuff convention used elsewhere in this file,
  //     e.g. Wind's Indelible Imprint below). Also: Blade of Howling Squall now maxes (instead of removing) the
  //     target's Erosion stacks on cast, and within 30s of any Intro/Liberation cast, any team member inflicting
  //     Erosion on an already-max-stack target immediately procs Erosion DMG once — both unmodeled (no
  //     Erosion-stack/proc stat in this schema).
  'Cartethyia':   { s1: { critDmg: 100 }, s2: { basicDmg: 50, totalMult: 200 }, s3: { libDmg: 100 }, s4: { allDmg: 20 }, s5: { totalMult: 0 }, s6: { elemDmg: 40 } },
  // Lingyang S1-S6 re-verified verbatim 2026-08-31 against the wiki/Lingyang/Combat's
  // Resonance Chain section (Chrome/Windows UA + google.com referer + jsRender).
  // s1 "Lion of Light, Blessings Abound": "During Resonance Liberation Lion's Vigor, Lingyang's
  //     Anti-Interruption is enhanced." ZEROED 2026-08-31 (was totalMult:10, fabricated) — pure poise/
  //     interrupt-resistance utility, zero DPS component, no stat equivalent in this schema.
  // s2 "Dominant and Fierce, Power Unbound": "Intro Skill Lion Awakens additionally recovers 10 Resonance
  //     Energy for Lingyang, triggered once every 20s." ZEROED 2026-08-31 (was totalMult:8, fabricated) —
  //     pure Resonance Energy resource-gain, zero DPS component; no energy-gain stat in this schema.
  // s3 "Jaw-Dropping Feats, Loud and Wide": "During Resonance Liberation Lion's Vigor, Basic Attack DMG
  //     Bonus +20%, Resonance Skill DMG Bonus +10%." (basicDmg:20, skillDmg:10, confirmed unchanged).
  // s4 "Immortals Bow, in Reverence Flawed": "Outro Skill Frosty Marks increases the Glacio DMG Bonus of
  //     all team members by 20% for 30s." (elemDmg:20, confirmed unchanged).
  // s5 "Seven Stars Shine, Stepped upon High": "Resonance Liberation Strive: Lion's Vigor additionally
  //     deals Glacio DMG equal to 200% of Lingyang's ATK." FIXED 2026-08-31: was totalMult:35, a fabricated
  //     number that didn't match the source's stated 200% flat ATK-scaling bonus hit — corrected to
  //     totalMult:200.
  // s6 "Demons Tremble, Divine Power Nigh": "In Striding Lion state, during the first 3s after every
  //     Mountain Roamer, the Basic Attack DMG Bonus for Lingyang's next Basic Attack is increased by 100%."
  //     (basicDmg:100, confirmed unchanged; the "next Basic Attack only, 3s window" conditionality isn't
  //     capturable by the flat schema — TODO: needs Phase 2 schema for per-hit conditional buff windows).
  'Lingyang':     { s1: { totalMult: 0 }, s2: { totalMult: 0 }, s3: { basicDmg: 20, skillDmg: 10 }, s4: { elemDmg: 20 }, s5: { totalMult: 200 }, s6: { basicDmg: 100 } },
  // Galbrena S1: +2% CD per Afterflame (up to 80%). Averaged ~40
  // Full re-audit 2026-09-01 against the wiki/Galbrena/Combat, cross-checked
  // against the source/character/1208 (both agree on every node's exact wording and value):
  // S5: was skillDmg: 150 (wrong category) — the three buffed moves (Encroach, Ascent of Malice,
  // Ravage) are each explicitly "considered Heavy Attack DMG" in their own move text despite being cast
  // from the Resonance Skill slot. Corrected skillDmg -> heavyDmg.
  // S6: was elemDmg: 60 (wrong category) — the four buffed Demon Hypostasis moves (Seraphic Execution,
  // Flamewing Verdict, Hellsent Barrage, Purgatory Scourge) are each majority "considered Heavy Attack
  // DMG" per their own move text (a portion of Seraphic Execution/Flamewing Verdict is Echo Skill DMG
  // instead, not modeled separately here). Corrected elemDmg -> heavyDmg; value 60 already correct.
  // TODO: needs Phase 2 schema — S6's additional conditional layer (Ascent of Malice consuming
  // Afterflame grants +0.875% Fusion DMG Amp per point consumed, up to 35%) has no home in a flat node.
  // S1 (critDmg: 80), S2 (atkPct: 90), S3 (libDmg: 130), S4 (allDmg: 20) already correct — value and
  // category confirmed exact against both sources.
  'Galbrena':     { s1: { critDmg: 80 }, s2: { atkPct: 90 }, s3: { libDmg: 130 }, s4: { allDmg: 20 }, s5: { heavyDmg: 150 }, s6: { heavyDmg: 60 } },
  // Iuno R-chain re-verified verbatim 2026-08-31 against the wiki/Iuno/Combat
  // "Resonance Chain" section (Chrome/Windows UA + google.com referer + jsRender):
  // s1 "Wax or Wane, All Gild the Bough": ATK +40% while in Lunar Cycle (atkPct:40, confirmed unchanged) —
  //     PLUS, while inside the Full Moon Domain, +1 Resonance Energy/s, AND Arc Beyond the Edge/Absolute
  //     Fullness become interruption-immune — both unmodeled (no Resonance-Energy-rate or interrupt-immunity
  //     stat in this schema); TODO: needs Phase 2 schema.
  // s2 "Day or Night, Let This Be Eternal": Resonators (team) with 10 stacks of Blessing of the Wan Light gain
  //     an ADDITIONAL 40% all DMG Amp — condition-gated on already being at max Wan Light stacks, not a free
  //     team buff (allDmg:40, confirmed unchanged; the condition text lives in TEAM_BUFFS.Iuno.selfBuffs above).
  // s3 "I Drink Deep of Their Forgetting": while in Lunar Cycle, DMG dealt by Moonbow Basic ATK/Arc Beyond the
  //     Edge/Moonbow Dodge Counter is Amplified by 65% — all three are the game's own "Resonance Liberation
  //     DMG"-tagged moves, so libDmg is the correct stat category here (libDmg:65, confirmed unchanged). Also
  //     removes Arc Beyond the Edge's reset of the Moonbow Basic ATK combo cycle within a short window after a
  //     Moonbow Basic ATK/Dodge Counter (source gives no exact seconds — unmodeled, no combo-cycle stat).
  // s4 "Rainy Season Dwell in My Eyes": Absolute Fullness grants a Shield = 160% of Iuno's ATK to the WHOLE
  //     TEAM for 30s (not passable to the incoming Resonator on swap) — purely defensive, ZERO DPS component.
  //     ZEROED 2026-08-31 (was totalMult:15, a fabricated "fallback" number with no basis in this effect —
  //     matches the "zero, don't guess" rule for defensive/utility nodes flagged across the other 11 passes).
  //     TODO: needs Phase 2 schema if shield-value mechanics are ever modeled.
  // s5 "A Thousand Futile Glimpses": +20% Resonance Liberation DMG Bonus (libDmg:20, confirmed unchanged —
  //     correct category since it's an explicit "Resonance Liberation DMG Bonus," not a generic buff).
  // s6 "I Am the Constant in the Chaos": DMG Multiplier of Absolute Fullness +1600% — CORRECTED
  //     2026-09-02 against a fresh the source dump from heavyDmg:1600 to libDmg:1600. The prior comment's
  //     "correct category, it's Iuno's Forte-empowered Heavy ATK" was wrong: Absolute Fullness's own
  //     kit text explicitly says it "deals Aero DMG to nearby targets, considered as Resonance
  //     Liberation DMG" despite the Heavy ATK slot used to cast it — the exact same pattern already
  //     correctly applied to her Flux: Moonbow/Moonring Heavy-ATK-slot moves elsewhere in this file.
  //     Confirmed independently by the calc page's own damage profile: a flat 0 Heavy ATK share in
  //     both her DPS and Hybrid rotations. Also, on cast: re-enters Lunar Cycle - New Moon, grants 100
  //     Sentience, and resets Arc Beyond the Edge's cooldown — all three unmodeled (no cooldown-reset/
  //     Sentience-grant stat in this schema).
  'Iuno':         { s1: { atkPct: 40 }, s2: { allDmg: 40 }, s3: { libDmg: 65 }, s4: { totalMult: 0 }, s5: { libDmg: 20 }, s6: { libDmg: 1600 } },
  // Sigrika (confirmed via the source 2026-08-16 cross-check). S1: +70% DMG mult to specific skills (rotation-averaged).
  // S2: Learn My True Name DMG Mult+120% (considered Echo Skill DMG) — was totalMult:40, no basis. S3: Innate Gift? stack
  // cap 2->4, no flat %, was critRate:12 with no basis — kept as totalMult. S4: team ATK+20% on ally Echo Skill cast —
  // was echoDmg:40 (wrong stat AND value). S5/S6 re-audited 2026-09-02 against a fresh the source dump:
  // S5 "Where Trust Leads Me! DMG Mult+30%" was stored as libDmg despite this row's own real damage
  // hit being categorized echoDmg (her Liberation is entirely "counted as Echo Skill DMG" per kit text
  // and the 0%-Liberation/89.9%-Echo real damage-output simulation) — a libDmg buff on an echoDmg-
  // categorized hit never actually applies. Corrected libDmg -> echoDmg. S6 "Targets take 30% more DMG
  // from Sigrika" was stored as defIgnore:15 with no sourcing comment at all — real primary effect is a
  // flat +30% DMG-taken debuff (the Innate Gift? DEF Ignore enhancement is a separate, smaller +7.5%/
  // stack up to 30% conditional bonus, not this). Corrected defIgnore:15 -> amplify:30, matching the
  // same 'amplify' convention already used for Qingxiao's identically-worded S6 effect.
  // S3 corrected 2026-09-02 against the existing the source dump: was totalMult:15, mislabeled as an
  // "approximated" value in the same style as S1's genuine +70% multiplier approximation — but S3's
  // real effect ("Innate Gift? cap raised to 4, no longer removed by Learn My True Name cast or
  // swap-out, only clears after 30s continuously out of combat") has zero DMG% component at all to
  // approximate from, unlike S1. Same "no real DPS component" pattern already fixed on Chisa's/
  // Mornye's own missed-S3 nodes. Zeroed to {}.
  // S1 corrected 2026-09-04 (Phase A audit, fresh dump, zero deference to prior claims): was
  // totalMult:15, a "rotation-averaged" approximation of the real +70% DMG Multiplier — but the engine
  // block applied that 15 UNSCOPED to ALL of Sigrika's own damage (Basic combo, Intro, Outro, every
  // Forte hit, etc.), not just the 4 moves the node actually names ("Basic - Elucidated / Dodge
  // Counter - Decipher / BIG BOOMY BOOM! / Soliskin to the Aid") — the same unscoped-totalMult bug
  // class recurring across Jiyan/Phrolova/Qingxiao/Qiuyuan/Roccia. Now that all 4 named moves have
  // their own damage blocks (2 were previously missing entirely, see sigrika.blocks.js), the node is
  // correctly scoped via scopedToBlockId to just those 4 blocks at its real, un-averaged 70% value.
  'Sigrika':      { s1: { totalMult: 70 }, s2: { echoDmg: 120 }, s3: {}, s4: { atkPct: 20 }, s5: { echoDmg: 30 }, s6: { amplify: 30 } },
  // Luuk Herssen (confirmed via the source 2026-08-16 cross-check). S1: +150% Mid-air ATK DMG, simplified as basicDmg
  // ~15 DPS impact (documented approximation, kept). S2: Rewritten in Winter's Margins DMG Mult+60% — was totalMult:40, no basis.
  // S3: Aureole of Execution forms +136% in Aureate Judge (conditional, no flat unconditional %) — was critDmg:25 with no
  // basis, kept as totalMult. S4: team All DMG+20% (not Basic DMG) on ally Tune Break — was basicDmg:40 (wrong stat AND
  // value). S6: Endnotes stacking grants Liberation DMG+40%/stack up to +120% — was defIgnore:15, no basis at all.
  // S5 re-audited 2026-09-02 against a fresh the source dump: NOT a single unexplained flat bonus (the engine block's
  // old note wrongly called it "confirmed exact, no further scope detail sourced") — real effect is two separate
  // conditional pieces: Intro/Outro DMG Bonus +80%, and Golden Reflux DMG Multiplier +50% (+CD -2s, +1 charge, both
  // unrepresentable here). Kept as the same totalMult:15 documented-approximation pattern as S1/S3, now with an
  // accurate comment instead of a false "exact" claim.
  'Luuk Herssen': { s1: { basicDmg: 15 }, s2: { libDmg: 60 }, s3: { totalMult: 15 }, s4: { allDmg: 20 }, s5: { totalMult: 15 }, s6: { libDmg: 120 } },
  // Lupa S1: CR+20% for 10s (not elemDmg)
  // Full re-audit 2026-09-01 against the wiki/Lupa/Combat, cross-checked against
  // the source/character/1207 (both agree on every node's exact wording). Found a stale comment/data
  // mismatch below: the 2026-08-16 sourcing comment already documented the correct S3/S4 values (+100%/
  // +125%) but the stored object still had totalMult: 20 / totalMult: 25 — off by a factor of 5, never
  // actually applied. Also recategorized S3/S4 from the totalMult fallback to libDmg: both Nowhere to
  // Run! (S3) and Dance With the Wolf: Climax (S4) are explicitly "considered Resonance Liberation DMG"
  // in their own move text, so a libDmg node (matching this file's now-established convention for a
  // Liberation-type-classified move's own DMG Multiplier boost, e.g. Xiangli Yao/Zhezhi above) is more
  // accurate than a blanket totalMult that would over-credit non-Liberation damage too.
  // S2: allDmg -> elemDmg (Fusion DMG Bonus is element-specific, not all-element); value 40 already
  // correct as the max-stacked total (20%/stack ×2 stacks, matching this file's existing convention of
  // storing the stacking cap, e.g. Sanhua's S6 atkPct).
  // Corrected 2026-09-02 (2 findings from a fresh the source dump): (1) CHARACTER_ROTATIONS['Lupa'] named
  // the wrong Forte-finisher move (base 'Dance With the Wolf' instead of the Climax variant her real
  // rotation always casts) — fixed there, which for the first time gave S4 a real cast to anchor to.
  // (2) That exposed S4's `libDmg` buff-effect shape can't actually apply in the hit-composed resolvers
  // at all (a cast-scoped, no-duration buff is a silent no-op — see lupa.blocks.js's own header comment,
  // a ~65-block-wide architecture gap logged in the engine-architecture history (git log)). S4 is now modeled as a real
  // damage block (a proportional 2nd hit) in lupa.blocks.js instead of a stat here — this table's own
  // s4.libDmg:125 stays as the documented real value/category, just no longer the thing the engine reads.
  'Lupa':         { s1: { critRate: 20 }, s2: { elemDmg: 40 }, s3: { libDmg: 100 }, s4: { libDmg: 125 }, s5: { libDmg: 15 }, s6: { defIgnore: 30 } },
  // Verina S1-S6 re-verified verbatim 2026-08-31 against the wiki/Verina/Combat's
  // Resonance Chain section (Chrome UA + google.com referer + jsRender), cross-checked against
  // the source/character/1503 and the source (all three agree verbatim on every node's text):
  // S1 "Moment of Emergence": Outro Skill Blossom grants the next character a continuous heal, 20% of
  //   Verina's ATK every 5s for 30s (6 ticks, 120% ATK total). Pure heal node, zero DPS component — was
  //   totalMult:5 with no basis — zeroed to {}.
  // S2 "Sprouting Reflections": Resonance Skill Botany Experiment additionally grants 1 Photosynthesis
  //   Energy and 10 Concerto Energy on cast. Pure resource-economy node, zero DPS component — was
  //   totalMult:5 with no basis — zeroed to {}.
  // S3 "The Choice to Flourish": Healing of Liberation's Photosynthesis Mark (both the initial Arboreal
  //   Flourish heal and its Coordinated Attack heal) increased by 12%. Pure heal% node, zero DPS
  //   component — was totalMult:5 with no basis — zeroed to {}. TODO: needs Phase 2 schema (a
  //   healBonusPct-on-Liberation key) to represent the +12%.
  // S4 "Blossoming Embrace": casting Heavy/Mid-air Attack Starflower Blooms, Liberation, or Outro Blossom
  //   raises the whole team's Spectro DMG Bonus by 15% for 24s — confirmed exact, unchanged (elemDmg:15
  //   was already correct category+magnitude; only the 24s duration/trigger-condition context is new).
  // S5 "Miraculous Blooms": when Verina heals a team member below 50% HP, her Healing is increased by
  //   20% (conditional, non-DPS). Zero DPS component — was totalMult:12 with no basis — zeroed to {}.
  //   TODO: needs Phase 2 schema (a conditional healBonusPct-below-HP-threshold key) to represent this.
  // S6 "Joyous Harvest": Heavy/Mid-air Attack Starflower Blooms deal 20% more DMG (real DPS component,
  //   matches the existing totalMult:20 magnitude and category — unchanged) AND additionally trigger 1
  //   Coordinated Attack + team heal on cast, both equal to Liberation's Photosynthesis Mark's own CA
  //   DMG/heal values. Corrected 2026-09-02: the totalMult:20 stat here could never actually apply in
  //   the hit-composed resolvers (a cast-scoped, no-duration buff — see the engine-architecture history (git log) item 12) —
  //   now modeled as a real damage block (verina.chain.s6, a proportional 2nd hit) in verina.blocks.js.
  //   The Coordinated Attack proc is ALSO now modeled (verina.chain.s6-coordinated-attack, 9.95% ATK
  //   coordDmg) — its team heal stays unmodeled (no DPS component).
  'Verina':       { s1: {}, s2: {}, s3: {}, s4: { elemDmg: 15 }, s5: {}, s6: { totalMult: 20 } },
  // Shorekeeper S1-S6 re-verified verbatim 2026-08-31 against the wiki/Shorekeeper/Combat
  // (MediaWiki API action=parse, section=Resonance Chain — bypassed the Combat page's Cloudflare interstitial),
  // cross-checked against the source's live kit page (Chrome UA + google.com referer + jsRender):
  // S1 "Unspoken Conjecture": Stellarealm effective range +150%, duration +10s, and casting Intro Skill
  //   Discernment no longer ends the existing Stellarealm early. Pure utility/duration node, zero DPS
  //   component — was totalMult:5 with no basis at all — zeroed to {} per the "don't force-fit a lossy
  //   value" rule.
  // S2 "Night's Gift and Refusal": the Outer Stellarealm (i.e. from the moment Liberation is cast, not
  //   gated behind any Intro) grants all nearby party members +40% ATK — confirmed exact, unchanged.
  // S3 "Infinity Awaits Me": casting Resonance Liberation End Loop grants Shorekeeper 20 Concerto Energy,
  //   triggerable once every 25s. Pure resource-economy node (Liberation's own 25s CD means this is really
  //   a "next Liberation comes back with a head start" effect), zero DPS component — was totalMult:5 with
  //   no basis — zeroed to {}.
  // S4 "Overflowing Quietude": +70% Healing Bonus specifically when casting Resonance Skill Chaos Theory.
  //   Zero DPS component and this schema has no healingBonus stat key — was totalMult:5 (fabricated) —
  //   zeroed to {}. TODO: needs Phase 2 schema (a healBonusPct-on-skill-cast key) to represent this.
  // S5 "Echoes in Silence": extends the pull-in range of Basic Attack Stage 3 by 50% and of Illation by
  //   30%. Pure AoE-gathering utility, zero DPS component — was totalMult:5 (fabricated) — zeroed to {}.
  // S6 "To the New World": Intro Skill Discernment's own DMG Multiplier +42%, AND casting Discernment
  //   raises Shorekeeper's Crit. DMG by 500% (for that hit — Discernment is itself always a guaranteed
  //   Crit per its base kit text, so this is a pure DMG-magnitude boost on that one guaranteed-Crit
  //   instance, not a persistent team/self buff). Both effects are scoped ONLY to Discernment casts —
  //   was critDmg:25, both wrong category (this isn't a persistent Crit DMG buff) and wrong magnitude
  //   (25 vs the real 500) — corrected to totalMult:42 (Discernment's own multiplier boost) and
  //   critDmg:500. TODO: needs Phase 2 schema to gate both fields to "on Discernment cast only" — the
  //   flat schema will otherwise apply critDmg:500 as if it were an always-on team/self Crit DMG stat,
  //   which massively overstates its real (single-hit, Discernment-only) scope.
  'Shorekeeper':  { s1: {}, s2: { atkPct: 40 }, s3: {}, s4: {}, s5: {}, s6: { totalMult: 42, critDmg: 500 } },
  // Lynae fully re-audited 2026-09-02 against a fresh the source dump — the prior comment here claimed S1's
  // totalMult:10 and S3's totalMult:15 had already been "corrected" (moved to S4/S5 as atkPct:20/
  // libDmg:70), but S1 and S3 below still literally carried those same stale placeholder values
  // unfixed — an incomplete prior edit. Real values:
  // S1 "Sequence Node 1": Basic Attack - Polychrome Leap's own DMG Multiplier +120% (was the stale
  // totalMult:10 placeholder). Now cast-scopable since Polychrome Leap's own SKILL_MULTIPLIERS row was
  // added above (was previously entirely unmodeled). Utility half (Spray Paint duration/pull-in,
  // interruption immunity, Overflow restore out of combat) has no DPS component, not modeled.
  // S2: team +25% All DMG Amp, self-gain portion (confirmed exact, unchanged) — PLUS a second, separate
  // real effect entirely missing before this read: "Outro Skill gains: casting Outro Skill grants the
  // incoming Resonator 25% All-DMG Amplification for 14s" (additive on top of the base-kit Outro's own
  // 15% All DMG + 25% Liberation DMG). Same stat name (allDmg) but a genuinely different scope (self vs.
  // next-on-field) that this flat single-key schema can't hold in one field — modeled as an additional
  // sequence-gated chain block (lynae.chain.s2-outro-bonus) rather than folded into this key.
  // S3 "Sequence Node 3": Basic Attack - Visual Impact AND Basic Attack - Iridescent Splash's own DMG
  // Multiplier +90% (was the stale totalMult:15 placeholder). Premixed Hue's Additive Color stacking
  // buff (up to 25 stacks × 55%, gated on Lumiflow≥120) has no DPS component in the modeled rotation
  // (Additive Color isn't cast in it), not modeled.
  // S4: ATK+20% (confirmed exact, unchanged).
  // S5: Prismatic Overblast Liberation DMG Mult+70% (confirmed exact, unchanged).
  // S6 "Sequence Node 6": up to +90% DMG on Polychrome Leap/Visual Impact via 3 stacks of Color of Soul
  // (30%/stack), but stacks are only gained by casting Kaleidoscopic Parade - Graffiti Blast or Mid-air
  // Heavy Attack — both exclusive to the S6-only alternate rotation that CHARACTER_ROTATIONS['Lynae']
  // explicitly doesn't model (see that table's own header comment). Zero reachable DPS component in the
  // modeled rotation — was an unsourced totalMult:40 fabrication, zeroed to {} (same "no real DPS
  // component in the modeled system" pattern as Shorekeeper's S1/S3/S4/S5 above). TODO: needs Phase 2
  // schema (a per-cast stacking buff gated to an alternate, unmodeled rotation branch).
  'Lynae':        { s1: { basicDmg: 120 }, s2: { allDmg: 25 }, s3: { basicDmg: 90 }, s4: { atkPct: 20 }, s5: { libDmg: 70 }, s6: {} },
  // Mornye (confirmed via the source 2026-08-16 cross-check). S1: interrupt immunity + Interfered Marker duration/
  // condition changes, no flat % (was allDmg:15, no basis) — like S4 below, this was left at a stale
  // totalMult:15 placeholder despite this comment already describing it as having no flat DPS %; zeroed
  // 2026-09-03 (found via a systematic block-coverage audit). S2: team Crit DMG+32% max vs Interfered
  // Marker targets (was amplify:10, wrong stat+value). S3 corrected 2026-09-02 (fresh the source dump cross-check,
  // missed by the above audit pass — same gap class as Chisa's own missed S3): was totalMult:10, an
  // unexplained placeholder — real effect is "casting Distributed Array additionally restores 25 Concerto
  // Energy and 100 Relative Momentum, once every 25s", pure resource restoration with zero DPS component,
  // zeroed to {} (same "no real DPS component" pattern already used on Lynae's S6/Shorekeeper's S1/S3/S4/S5).
  // S4: High Syntony Field healing+30%, not a DPS stat (was atkPct:10, no basis) — same stale-placeholder
  // bug as S1: still had totalMult:10 despite this comment already saying it's not a DPS stat; zeroed
  // 2026-09-03. S5: Critical Protocol Liberation DMG Mult+40% (was totalMult:10, no basis). S6: Critical
  // Protocol DMG Mult+400% (was amplify:15, no basis)
  // S5 re-audited 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): the dump's S5 node text is actually
  // TWO separate DMG multipliers — "Critical Protocol DMG Multiplier +40%. Tune Rupture Response -
  // Particle Jet DMG Multiplier +160%." — libDmg:40 only captures the first half; the +160% Particle
  // Jet buff has no representable home in this table (Particle Jet isn't a hit-composed SKILL_MULTIPLIERS
  // row/engine block at all — it's modeled entirely through the separate legacy
  // CHAR_BUFF_TABLE['Mornye'].tuneBreak.ruptureDmgMult flat-DOT path in calcEngine.js's
  // calcTuneBreakDmg(), which has no per-sequence-level scaling input at all for any character).
  // Flagged as a known, schema-level modeling gap rather than silently dropped or force-fit — see
  // REMAINING_WORK.md.
  'Mornye':       { s1: {}, s2: { critDmg: 32 }, s3: {}, s4: {}, s5: { libDmg: 40 }, s6: { libDmg: 400 } },
  // Roccia R-chain re-verified verbatim 2026-08-31 against the wiki/Roccia/Combat's
  // Resonance Chain section (Chrome/Windows UA + google.com referer + jsRender). Every prior value was
  // fabricated (no basis in any node's real effect):
  // s1 "When Shadows Engulf the Hull": Skill Acrobatic Trick grants +100 additional Imagination and +10
  //     Concerto Energy; Real Fantasy gains interrupt immunity. Zero DPS component (was basicDmg:10,
  //     fabricated) — ZEROED. TODO: needs Phase 2 schema for the Imagination/Concerto/interrupt-immunity
  //     effects if ever modeled.
  // s2 "When the Luceanite Gleams": casting Real Fantasy grants the whole team +10% Havoc DMG Bonus for
  //     30s, stacking up to 3 times (30% at max stacks); reaching max stacks grants a further +10% Havoc
  //     DMG Bonus for 30s (40% total at full stack+bonus) — an elemDmg (Havoc DMG) buff, not atkPct (was
  //     atkPct:15, wrong stat AND magnitude). Stacking/ramp-up is stateful and not captured by the flat
  //     schema — using the 40% max-stack value; TODO: needs Phase 2 schema for the stack ramp.
  // s3 "When the Heart Sees and Hands Feel": casting Intro Pero, Help grants Roccia herself +10% Crit
  //     Rate and +30% Crit DMG for 15s (was basicDmg:10, wrong stat AND value).
  // s4 "When Wonders Gather in the Box": casting Skill Acrobatic Trick increases Real Fantasy's own DMG
  //     Multiplier by +60% for 12s — a single-move DMG Multiplier boost, bucketed as totalMult per this
  //     file's existing convention for the same effect shape (was totalMult:10, undervalued).
  // s5 "When Dreams Are Reborn on Stage": unconditionally increases Liberation Commedia Improvviso!'s DMG
  //     Multiplier by +20% (bucketed as libDmg, matching this file's convention for "X's DMG Multiplier"
  //     buffs on a Liberation-type move) and Heavy Attack's DMG Multiplier by +80% (heavyDmg) — was
  //     atkPct:10, wrong stat AND value entirely.
  // s6 "When the Golden Wings Fly": casting Liberation grants, for 12s, Real Fantasy DEF ignore +60%
  //     (defIgnore:60, was basicDmg:15, wrong stat AND value) PLUS an unmodeled extra move-loop: landing
  //     after Real Fantasy Stage 3 re-launches Beyond Imagination into a new Basic Attack "Reality
  //     Recreation" (100% of Real Fantasy Stage 3 DMG, counted as Heavy Attack DMG, interrupt-immune,
  //     itself re-triggering the loop on landing) — stateful extra-cast mechanic with no flat-schema
  //     equivalent; TODO: needs Phase 2 schema.
  // s5 raw value fixed 2026-09-04 (two-path desync): was { libDmg: 20, heavyDmg: 80 } — but Commedia
  // Improvviso!'s damage is categorized heavyDmg (per its own kit text), and Roccia's dpsFocus is
  // ['Concerto Efficiency', 'Heavy Attack Damage', ...] with no 'Liberation' entry, so the legacy
  // applyResonanceChain()'s libDmg:20 contribution was silently dropped (never routed into skillDmg —
  // see calcEngine.js line ~451's dpsFocus.includes('Liberation') gate). Merged into heavyDmg so the
  // legacy aggregate path actually credits the full +100% (matches the corrected trigger-engine model's
  // scoped +20% on Commedia + broad +80% on all Heavy ATK, which nets to +100% on Commedia specifically).
  'Roccia':       { s1: { totalMult: 0 }, s2: { elemDmg: 40 }, s3: { critRate: 10, critDmg: 30 }, s4: { totalMult: 60 }, s5: { heavyDmg: 100 }, s6: { defIgnore: 60 } },
  // Sanhua corrected 2026-08-18 per the source's own Resonance Chain text (previous values were unsourced
  // guesses): S1 Basic ATK V grants Crit Rate+15% for 10s (was atkPct:10, wrong stat -> critRate). S2 is
  // pure utility (Heavy ATK Detonate Stamina cost -10, Anti-interruption on Eternal Frost cast) with no
  // direct DPS stat -> totalMult fallback (was basicDmg:10, no basis). S3 DMG dealt +35% vs targets below
  // 70% HP, conditional -> totalMult weighted average (was totalMult:10, undervalued). S4 Glacial Gaze
  // restores 10 Energy + next Heavy ATK Detonate DMG+120% within 5s, a large conditional burst ->
  // totalMult weighted average (was atkPct:10, no basis). S5 Ice Burst Crit DMG+100% (only on the Forte
  // Detonate hit) plus unconditional Ice Creation auto-explode -> critDmg weighted average (was
  // basicDmg:10, no basis). S6 team ATK+10%/stack up to 2 (=20% max) for 20s after detonating an Ice
  // Prism/Glacier, not a DMG Amplify -> atkPct (was amplify:15, wrong stat).
  // Re-verified 2026-08-18 against the wiki's Chain Node pages (Solitude's Embrace/Snowy Clarity/Anomalous
  // Vision/Blade Mastery/Unraveling Fate/Daybreak Radiance wikitext, matches the source's Kit tab wording):
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
  // Re-audited 2026-09-01 against the wiki/Sanhua/Combat, cross-checked against
  // the source/character/1102 (both agree exactly). S2 (totalMult: 5) was undocumented — real effect is
  // purely Heavy Attack Detonate STA cost -10 plus interruption-resistance utility on Eternal Frost cast,
  // zero DPS component. Zeroed to {}. S1/S3/S4/S5/S6 confirmed correct, unchanged.
  'Sanhua':       { s1: { critRate: 15 }, s2: {}, s3: { totalMult: 35 }, s4: { heavyDmg: 120 }, s5: { critDmg: 100 }, s6: { atkPct: 20 } },
  // corrected 2026-08-18: prior values (heavyDmg/totalMult/coordDmg guesses on every node) had no basis
  // in Mortefi's real chain kit (the wiki Combat page rendered Resonance Chain table, matches the source's Kit
  // tab wording exactly) — none of his nodes touch Heavy ATK DMG at all. Real effects: S1 Solitary Etude —
  // during Burning Rhapsody, Coordinated Attacks also trigger off the on-field character's Resonance
  // Skill hits, firing 2 Marcato (extra proc source, no DMG% stat in schema, kept as small totalMult). S2
  // Hypocritical Hymn — Echo Skill use restores +10 Resonance Energy, 20s CD (pure utility, not modeled,
  // kept as small totalMult). S3 Flaming Recitativo — during Burning Rhapsody, Marcato Crit DMG+30%
  // (confirmed exact, modeled as critDmg). S4 Cathartic Waltz — Burning Rhapsody duration +7s (utility, no
  // DMG stat). S5 Funerary Quartet — Skill/Fury Fugue hits fire 4 bonus Marcato hits at 50% reduced DMG
  // (extra proc source). S6 Apoplectic Instrumental — on Liberation cast, team ATK+20% for 20s (confirmed
  // exact, modeled as atkPct).
  // Re-audited 2026-09-01 against the wiki/Mortefi/Combat, cross-checked against
  // the source/character/1204 (both agree exactly). S1/S5 were undocumented placeholders for a
  // bonus-hit-at-flat-Marcato-value mechanic (2 or 4 extra Marcato procs) — no flat-schema fit, same
  // unrepresentable class as other bonus-hit nodes this pass. S2 was a placeholder for pure Resonance
  // Energy restore utility. S4 was a placeholder for a duration-extension effect (no flat DMG% derivation
  // exists for "+7s uptime"). All four zeroed to {} per this project's hard rule against inventing values.
  // TODO: needs Phase 2 schema for bonus-hit, utility, and duration-extension mechanics.
  'Mortefi':      { s1: {}, s2: {}, s3: { critDmg: 30 }, s4: {}, s5: {}, s6: { atkPct: 20 } },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's Combat page rendered
  // Resonance Chain table (matches the source's Kit tab wording exactly). Real effects: S1 Waterside
  // Respite — 10% chance of DMG/interruption immunity for 5s after Lucky Draw (utility, no DMG stat,
  // kept as small totalMult). S2 Sunroom Siesta — Antithesis/Triplet/Perfect Rhyme DMG bonus on Poetic
  // Essence doubled (self DMG, low priority for a healer/support, kept as small totalMult). S3 Restless
  // Sleep — ATK+20% (confirmed exact -> atkPct). S4 Frosted Lullaby — 20% chance Scroll Divination skips
  // Cooldown (utility, no DMG stat). S5 Dreamland Meander — Crit Rate+15% for
  // 14s after Intro Skill (confirmed exact -> critRate). S6 Slumber Evermore — Sky Blue stacks (max 4,
  // 7s) each granting Crit DMG+15%, so max 60% Crit DMG (confirmed exact at max stacks -> critDmg,
  // matching this table's convention of using max-stack totals, e.g. Chixia S5/Mortefi S1).
  // Re-audited 2026-09-01 against the wiki/Youhu/Combat, cross-checked against
  // the source/character/1106 (both agree exactly). S1 (totalMult: 3) was undocumented — real effect is
  // a 10% chance of 5s damage/interruption immunity on Lucky Draw, pure defensive utility, zero DPS
  // component. Zeroed to {}. S2 (totalMult: 5) was undocumented — real effect is "the DMG bonus of
  // Antithesis/Triplet/Perfect Rhyme on Poetic Essence is doubled" (a multiplier-of-a-multiplier on
  // conditional Auspice-combo bonuses, e.g. Antithesis's own +70% becomes +140%), with no flat value
  // stated directly in the node text and no buff-of-a-buff category in this schema. Zeroed to {}. S4
  // (totalMult: 3) was undocumented — real effect is a 20% chance for Scroll Divination to skip its
  // cooldown, a proc-based effective-cooldown-reduction with no flat DMG% equivalent. Zeroed to {}.
  // S1/S4 still need Phase 2 schema (defensive proc, proc-based cooldown reduction respectively).
  // S2 re-investigated 2026-09-03: `Data dump/Youhu/Youhu.md` now exists and sources all
  // 3 base values it doubles (Antithesis +70%, Triplet +175%, Perfect Rhyme all three at once) — the
  // "missing data" blocker is gone. But CHARACTER_ROTATIONS['Youhu'] (below) never actually casts
  // Poetic Essence at all: her real modeled loop spends each drawn Antique immediately via Ruyi
  // (Antique Appraisal) rather than banking all 4 Auspices to hold Basic ATK for Poetic Essence. So
  // S2 correctly stays zeroed — not for lack of a schema/data anymore, but because the move it doubles
  // never fires in this character's real modeled rotation, the same zero-DPS-in-this-context boundary
  // already established for Chisa's S4/Mornye's S1/S4.
  'Youhu':        { s1: {}, s2: {}, s3: { atkPct: 20 }, s4: {}, s5: { critRate: 15 }, s6: { critDmg: 60 } },
  // Danjin re-verified 2026-08-18 against the wiki's Chain Node pages (Crimson Heart of Justice/Dusted
  // Mirror/Fleeting Blossom/Solitary Carnation/Reigning Blade/Bloodied Jade wikitext, cross-checked with
  // the source's Kit tab Resonance Chain text — identical wording): S1 ATK+5% per stack on Incinerating Will
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
  // Thread of Bane (was amplify:10, wrong stat+value — real 10% Havoc RES ignore is the smaller of two S2 effects).
  // S3 corrected 2026-09-02 (fresh the source dump cross-check, missed by the earlier S1/S2/S4/S5/S6 audit pass
  // noted above): was totalMult:10, an unexplained placeholder — real effect is Sawring-Blitz/Chainsaw Mode
  // Dodge Counter/Sawring-Eradication DMG Multiplier +120% (a 2nd, separate copy of Woven Myriad-Convergence's
  // own +120%, which is what her Liberation already grants). Since those 3 moves are explicitly "considered
  // Resonance Liberation DMG" per her own kit text (confirmed by the source's own damage-type breakdown: Liberation
  // is 84.5% of her real rotation damage), modeled as libDmg — the smaller secondary effect (a further +120% to
  // just the Ring-of-Chainsaw consumption bonus specifically) is left unmodeled, same "larger effect only"
  // precedent already used for S2 above. S4: improves Havoc Bane trigger rate (utility) — was left at a
  // stale totalMult:10 placeholder despite this comment already describing it as pure utility; zeroed
  // 2026-09-03 (found via a systematic block-coverage audit) to actually match this comment's own
  // description, same "no real DPS component" pattern as Lynae's S6/Shorekeeper's S1/S3/S4/S5. S5:
  // Moment of Nihility Liberation DMG Mult+100% (was totalMult:10, no basis). S6: Unseen Snare-Finality:
  // targets take 30% more Negative Status DMG (was amplify:15, wrong value)
  'Chisa':        { s1: { atkPct: 30 }, s2: { allDmg: 50 }, s3: { libDmg: 120 }, s4: {}, s5: { libDmg: 100 }, s6: { amplify: 30 } },
  // Ciaccona S1: ATK+35% after Basic ATK (conditional)
  // Full re-audit 2026-09-01 against the wiki/Ciaccona/Combat, cross-checked
  // against the source/character/1407 (both agree on every node's exact wording):
  // S2: was allDmg: 40 (wrong category) — real effect is team +40% Aero DMG Bonus specifically
  // (elemDmg), not an all-element DMG buff. Corrected allDmg -> elemDmg.
  // S3: was totalMult: 10 (fabricated, no basis) — real effect is "+1 Musical Essence segment on Basic
  // Attack Stage 4" + "+1 charge on Resonance Skill Harmonic Allegro", both pure resource/utility with
  // no percentage DPS component. Zeroed to {}.
  // S6: was libDmg: 220 (wrong shape) — real effect is a standalone proc, not a Liberation DMG% buff:
  // each Solo Concert pulse deals a flat 220% of Ciaccona's ATK as Aero DMG, counted as Liberation DMG.
  // A flat %-of-ATK bonus hit doesn't fit the {stat: value} buff schema (same class of gap as Xiangli
  // Yao's S1 and Zhezhi's S5/S6, documented above). Zeroed to {} in this table — but FIXED 2026-09-02
  // (fresh the source dump, same session as Phrolova's Apparition of Beyond-Hecate fix) as a real gated
  // `kind:'damage'` TriggerBlock instead: `ciaccona.chain.s6` in ciaccona.blocks.js, anchored to the
  // same Basic ATK Stage 4 cast that starts Solo Concert (matches this comment's own "periodic pulse"
  // reading, same representative-tick pattern already used for Symphonic Poem: Tonic).
  // S1 (atkPct: 35), S4 (defIgnore: 45), S5 (libDmg: 40) already correct — value and category confirmed
  // exact against both sources.
  // TODO: needs Phase 2 schema — S3's resource/charge grant still has no home in a single-category flat
  // node (S6's flat-%-of-ATK bonus hit no longer needs one — see ciaccona.blocks.js).
  'Ciaccona':     { s1: { atkPct: 35 }, s2: { elemDmg: 40 }, s3: {}, s4: { defIgnore: 45 }, s5: { libDmg: 40 }, s6: {} },
  // Cantarella S1-S6 fully re-verified 2026-08-31 against the wiki/Cantarella/Combat's
  // "Resonance Chain" table (verbatim node text below) — every prior value was an unsourced approximation
  // with no basis in her real chain kit, and 2 of 6 nodes carried a fabricated DPS number on what are actually
  // partly or fully non-DPS mechanics (S4 heal-only, S5 a hit-count cap increase). Real node effects:
  // S1 "Embrace the Endless Waves" — Resonance Skill cast recovers 1 Trance (utility, not modeled); Graceful
  //   Step/Flickering Reverie/Perception Drain DMG Multiplier +50% (mixed Skill+Forte-that-counts-as-Basic-ATK
  //   scope, doesn't cleanly map to one existing stat category, kept as totalMult); interrupt immunity during
  //   Perception Drain (utility, not modeled). Was totalMult:20, no basis — corrected to totalMult:50.
  // S2 "Surrender to the Illusive Reverie" — Flowing Suffocation now also inflicts Hazy Dream (utility, not
  //   modeled); Jolt DMG Multiplier +245% (Jolt is a proc-only Basic ATK-DMG instance, not an always-on Basic
  //   ATK buff, so basicDmg would over-apply it — kept as totalMult). Was totalMult:10 with a wrong-category
  //   amplify mixed in elsewhere in this file's history — corrected to totalMult:245.
  // S3 "Gaze into the Abyss" — Flowing Suffocation's own DMG Multiplier +370% (this buffs the Liberation
  //   ability's self-multiplier directly, matching this table's libDmg convention e.g. Chisa S5); also causes
  //   Flowing Suffocation to enter Mirage on cast (utility/cast-order change, not modeled). Was amplify:8, wrong
  //   category and wrong magnitude — corrected to libDmg:370.
  // S4 "Behold Your Own Soul" — Healing Bonus +25% while in Mirage. Zero DPS component (healing-only, and this
  //   schema has no healingBonus stat key) — was coordDmg:10, a fabricated DPS number with no basis in the real
  //   effect at all — zeroed to {} per the "don't force-fit a lossy value" rule.
  // S5 "Rest in Your Reflection" — raises the Diffusion Dreamweaver cap from 21 to 26 (a flat +5 hit-count cap
  //   increase, not a %-multiplier). Real DPS impact exists (more Coordinated ATK procs possible) but this flat
  //   schema has no "extra hit count" stat to express it losslessly — was totalMult:10, a fabricated number —
  //   zeroed to {} with a TODO rather than guessing a %.
  // TODO: needs Phase 2 schema — S5's +5 max Dreamweaver cap (21→26) needs a hit-count-cap stat, not a %.
  // S6 "Fall, Fall... and Fall Deeper into the Dream" — Basic Attack Phantom Sting DMG Multiplier +80%
  //   (Phantom Sting is the Mirage-state Basic ATK combo, so basicDmg fits, confirmed exact); + DEF Ignore 30%
  //   for 10s after casting Flowing Suffocation (confirmed exact -> defIgnore). Was amplify:15, wrong category
  //   and wrong magnitude on both counts — corrected to basicDmg:80, defIgnore:30.
  // s3 stat fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was libDmg:370, matching the
  // pre-fix (wrong) libDmg category on cantarella.blocks.js's Flowing Suffocation damage block. Kit
  // text is explicit ("Havoc DMG, considered Basic Attack DMG") and the dump's own Damage Profile
  // confirms 0% real Liberation share — S3's real +370% Flowing Suffocation multiplier follows that
  // same override to basicDmg, now scoped via scopedToBlockId in the engine block.
  'Cantarella':   { s1: { totalMult: 50 }, s2: { totalMult: 245 }, s3: { basicDmg: 370 }, s4: {}, s5: {}, s6: { basicDmg: 80, defIgnore: 30 } },
  // Re-verified verbatim 2026-08-31 against the wiki/Yinlin/Combat's Resonance Chain
  // section (cross-checked against the source/wuthering-waves/characters/yinlin, both matched exactly):
  // S1 "Morality's Crossroad": Resonance Skill Magnetic Roar and Lightning Execution deal 70% more damage
  //   -> skillDmg:70 (already correct, kept).
  // S2 "Ensnarled By Rapport": Electromagnetic Blast recovers +5 Judgment Points and +5 Resonance Energy on
  //   hit — pure resource/Concerto-Energy utility, ZERO DPS component. Was totalMult:8, a fabricated damage
  //   number with no basis in the real (non-damage) effect — zeroed to {}.
  // TODO: needs Phase 2 schema — S2's +5 Judgment Points/+5 Energy per hit needs dedicated resource-gain
  //   stats this flat DMG-modifier schema doesn't have.
  // S3 "Unyielding Verdict": Forte Circuit Judgment Strike's DMG multiplier +55% (Judgment Strike is
  //   explicitly "considered Skill DMG" per its own kit text) -> skillDmg:55 (already correct, kept).
  // S4 "Steadfast Conviction": on Judgment Strike hit, team ATK +20% for 12s -> atkPct:20 (already correct
  //   value; the 12s duration/on-hit trigger condition isn't representable in this flat schema).
  // S5 "Resounding Will": Thundering Wrath deals 100% extra DMG to Sinner's/Punishment-Marked targets ->
  //   libDmg:100 (already correct value; conditional on the target carrying a mark, not unconditional).
  // S6 "Pursuit of Justice": in the first 30s after casting Thundering Wrath, each Basic ATK hit has a
  //   chance to trigger "Furious Thunder" — a separate 419.59%-ATK Electro nuke (considered Resonance Skill
  //   DMG), up to 4 triggers per Liberation cast. This is a discrete extra-hit proc bolted onto Basic ATK,
  //   not a %-modifier to existing damage instances — was totalMult:40, a fabricated/scaled-down guess with
  //   no basis in the real 419.59% figure — zeroed to {}.
  // TODO: needs Phase 2 schema — S6's Furious Thunder needs an "extra proc: X% ATK, up to N times, window
  //   Ys after trigger skill" stat shape; the real number is 419.59% ATK per proc, cap 4 procs/30s window.
  // s3 corrected 2026-09-03 against a real browser snapshot: was skillDmg:55, but Judgment Strike
  // is explicitly a Coordinated Attack (per the source's own Review/Synergies text — "Yinlin having the
  // highest personal damage of any Coordinated Attack DPS"), matching its coordDmg categorization in
  // SKILL_MULTIPLIERS/yinlin.blocks.js — not Skill DMG. The old value silently over-buffed her real
  // skillDmg-categorized moves (Magnetic Roar, Lightning Execution, Furious Thunder) while never
  // touching Judgment Strike, its actual intended target.
  'Yinlin':       { s1: { skillDmg: 70 }, s2: {}, s3: { coordDmg: 55 }, s4: { atkPct: 20 }, s5: { libDmg: 100 }, s6: {} },
  // Changli S1-S6 re-verified verbatim 2026-08-31 against the wiki/Changli/Combat
  // (Resonance Chain section) — every prior value in this row was wrong (placeholder-looking, no basis
  // found in the wiki text), same pattern already caught for Jinhsi/Camellya/Yinlin/Chisa/etc:
  // S1 Hidden Thoughts: "Resonance Skill Tripartite Flames and Heavy Attack Flaming Sacrifice increase
  //   Changli's DMG dealt by 10%" (+interruption resistance, no stat field for that) — was elemDmg:10
  //   (wrong: this is conditional to those 2 specific casts, not general Fusion DMG; modeled as the
  //   closest matching categories skillDmg+heavyDmg since both are named).
  // S2 Pursuit of Desires: gaining Enflamement raises Crit Rate +25% for 8s — was skillDmg:15, no basis
  //   at all (wrong stat and wrong value).
  // S3 Learned Secrets: Radiance of Fealty (Liberation) DMG +80% — was elemDmg:10, wrong stat and far
  //   too low.
  // S4 Polished Words: after Intro Skill, team ATK +20% for 30s — stat category (atkPct) was already
  //   right, value was wrong (was 15, real is 20). // TODO: needs Phase 2 schema — this file's atkPct
  //   is applied as a flat always-on buff; the real effect is gated behind an Intro-Skill cast and only
  //   lasts 30s, same limitation as S1's conditional-cast gating and S2's 8s Crit Rate window above.
  // S5 Sacrificed Gains: Flaming Sacrifice (Forte Heavy ATK) Multiplier +50% and DMG dealt +50% — was
  //   totalMult:10, no basis; modeled as heavyDmg since Flaming Sacrifice is a Heavy ATK-type cast.
  // S6 Realized Plans: Tripartite Flames, Flaming Sacrifice, and Radiance of Fealty ignore an additional
  //   40% of target DEF — was amplify:40 (wrong category, amplify != DEF ignore); value happened to already
  //   be numerically correct.
  // s5 corrected 2026-09-03 against a fresh the source dump: was s5:{heavyDmg:50}, dropping half the node's
  // real effect. Source text: "Heavy Attack Flaming Sacrifice's Multiplier is increased by 50% AND its
  // DMG dealt is increased by 50%" — two SEPARATE, compounding +50% bonuses (a raw DMG Multiplier
  // increase, same shape/stat as Camellya's own s5 totalMult nodes, PLUS a DMG-dealt/category bonus),
  // not one. Added totalMult:50 alongside the existing heavyDmg:50 — changli.blocks.js's own s5 note
  // already flagged this exact gap ("RESONANCE_CHAIN_DATA's single heavyDmg:50 field is the only value
  // sourced for this node") before this pass sourced the 2nd value for real.
  'Changli':      { s1: { skillDmg: 10, heavyDmg: 10 }, s2: { critRate: 25 }, s3: { libDmg: 80 }, s4: { atkPct: 20 }, s5: { heavyDmg: 50, totalMult: 50 }, s6: { defIgnore: 40 } },
  // Corrected against the source character/1105 — prior values (coordDmg/elemDmg on S1/S3/S4) didn't
  // match her real chain effects (Crit Rate, ATK stacking, team ATK — no Glacio DMG anywhere in her chain).
  // Full re-audit 2026-09-01 against the wiki/Zhezhi/Combat, cross-checked against
  // the source/character/1105 (both agree on every node's exact wording):
  // S1 "Brushwork's Finish": critRate: 10 already correct (Crit Rate +10% for 27s on Creation's Zenith
  // cast) — the node also restores 15 Resonance Energy, pure utility, not represented here.
  // S2 "Vivid Strokes": was totalMult: 15 (fabricated, no basis in source); real effect is "Max Inklit
  // Spirits summoned by Living Canvas +6" (21 -> 27 cap), not a percentage stat at all. Zeroed to {}.
  // TODO: needs Phase 2 schema — can't represent "+N max summon count on an existing per-hit %" in the
  // flat {stat: value} schema.
  // S3 "Reflection's Grace": atkPct: 15 already correct (ATK +15% per stack, stacks up to 3, on
  // Manifestation/Stroke of Genius/Creation's Zenith cast).
  // S4 "Hue's Spectrum": atkPct: 20 already correct (team ATK +20% for 30s on Living Canvas cast).
  // S5 "Composition's Clue": was coordDmg: 20 (fabricated category+value); real effect is "every 3
  // Inklit Spirits summoned by Living Canvas, 1 extra Inklit Apparition procs a Coordinated ATK at 140%
  // of Inklit Spirit's own DMG Multiplier" (140% x 65.21% = 91.29%, matching the source's raw Living Canvas
  // damage-data row 2 of 91.3% exactly) — a bonus-hit-at-X%-of-move-Y's-own-multiplier effect, not a flat
  // coordDmg buff. Zeroed to {}.
  // S6 "Infinite Legacy": was coordDmg: 40 (fabricated category+value); real effect is "on Stroke of
  // Genius/Creation's Zenith cast, an extra Ivory Herald procs at 120% of Stroke of Genius's own DMG
  // Multiplier" (120% x 298.22% = 357.86%, matching the source's raw Ink and Wash damage-data row 4 of
  // 357.86% exactly) — same bonus-hit-at-X%-of-another-move class as S5. Zeroed to {}.
  // TODO: needs Phase 2 schema — S5/S6's bonus-hit-at-X%-of-move-Y's-own-multiplier effects have no home
  // in a single-category flat node (same class of gap as Xiangli Yao's S1, documented above).
  'Zhezhi':       { s1: { critRate: 10 }, s2: {}, s3: { atkPct: 15 }, s4: { atkPct: 20 }, s5: {}, s6: {} },
  'Qiuyuan':      { s1: { critRate: 20 }, s2: { echoDmg: 30 }, s3: { libDmg: 500, heavyDmg: 600 }, s4: { atkPct: 20 }, s5: { defIgnore: 15 }, s6: { critDmg: 100 } },
  // Qiuyuan R-chain corrected 2026-08-16 via the source: s1 +20% Crit Rate + uninterruptible Heavy ATKs (was echoDmg:10, wrong stat);
  // s2 Bamboo's Shade +30% additional team Echo Skill DMG (was totalMult:15); s3 Liberation DMG Mult +500% (was echoDmg:10, no basis);
  // s4 +20% ATK (was atkPct:10, half real value); s5 ignores 15% target DEF (was totalMult:10); s6 Straw Cape grants +100% Crit DMG for 6s (was echoDmg:40).
  // s3.heavyDmg:600 added 2026-09-04 (fresh dump re-audit, first full Phase A pass on Qiuyuan): the node's
  // own text has a SECOND component entirely missing from this table before now — "Casting [Straw Cape in
  // Drizzly Rain] also: ... gives To Teach/To Save/To Sacrifice +600% DMG Multiplier and +30 Concerto
  // Energy restore on hit". Only the Liberation half (libDmg:500) was ever recorded here; the Forte-Heavy
  // half was silently dropped from both this raw table AND qiuyuan.blocks.js (a genuine missing-effect
  // bug, not a two-path desync — neither path had it). Field named heavyDmg matching Galbrena's s5/s6
  // convention for a category-scoped chain node value (real engine effect is totalMult scoped to the
  // qiuyuan.forte.to-teach block, see qiuyuan.blocks.js).
  // 4★ + missing characters
  // Jianxin S1-S6 re-verified verbatim 2026-08-31 against the wiki/Jianxin/Combat's
  // Resonance Chain section — every node re-read directly, replacing the prior 2026-08-17 pass's generic
  // totalMult placeholders (which had no basis in her real, mostly non-damage chain):
  // S1 "Verdant Branchlet": after casting Intro Skill Essence of Tao, gain 100% extra Chi from Basic
  //   Attacks for 10s — pure resource/Chi-gain utility, ZERO DPS component. Was totalMult:10, a fabricated
  //   damage number — zeroed to {}.
  // TODO: needs Phase 2 schema — S1's "+100% extra Chi from Basic ATK for 10s after Intro" needs a
  //   dedicated resource-gain-rate stat this flat DMG-modifier schema doesn't have.
  // S2 "Tao Seeker's Journey": Resonance Skill Calming Air can be used 1 more time (extra charge) — pure
  //   utility, ZERO DPS component. Was totalMult:8, fabricated — zeroed to {}.
  // TODO: needs Phase 2 schema — S2's "+1 extra Calming Air charge" needs a charge-count stat.
  // S3 "Principles of Wuwei": after 2.5s in Calming Air's Parry Stance, Chi Counter becomes immediately
  //   available (skips its own internal readiness delay) — pure cooldown/availability utility, ZERO DPS
  //   component. Was totalMult:8, fabricated — zeroed to {}.
  // TODO: needs Phase 2 schema — S3's conditional early-availability trigger has no matching stat here.
  // S4 "Multitide Reflection": while performing Forte Circuit Heavy Attack: Primordial Chi Spiral,
  //   Resonance Liberation Purification Force Field DMG is increased by 80% for 14s -> libDmg:80 (already
  //   correct, kept; the "only while/shortly after the Forte channel" gating isn't representable in this
  //   flat schema).
  // S5 "Mirroring Introspection": the range/AoE of Purification Force Field is increased by 33% — a pure
  //   area-of-effect increase, ZERO DPS component (does not change per-hit or explosion multipliers). Was
  //   totalMult:10, fabricated — zeroed to {}.
  // TODO: needs Phase 2 schema — S5's "+33% Liberation field range" needs an AoE-size stat, not a DMG one.
  // S6 "Truth from Within": during the Primordial Chi Spiral channel, after performing Pushing Punch,
  //   Jianxin can use an enhanced Special Chi Counter once every 5s — a discrete extra proc dealing 556.67%
  //   ATK Aero DMG (counted as Heavy Attack DMG) plus a bonus Zhoutian Progress 4 shield, not a %-modifier
  //   to an existing damage instance. Was totalMult:35, a fabricated/scaled-down guess with no basis in the
  //   real 556.67% figure — zeroed to {}, same "discrete proc, not a modifier" treatment already used for
  //   Yinlin's S6 Furious Thunder.
  // TODO: needs Phase 2 schema — S6's Special Chi Counter needs an "extra proc: 556.67% ATK (Heavy ATK-type),
  //   up to 1 use per 5s, gated behind Pushing Punch during the Forte channel" stat shape.
  'Jianxin':      { s1: {}, s2: {}, s3: {}, s4: { libDmg: 80 }, s5: {}, s6: {} },
  // Confirmed via the source character pages 1502 (Spectro), 1604 (Havoc), 1406 (Aero), 1309 (Electro).
  // Re-audited 2026-09-01 against the wiki/Rover/Combat (all 4 attunements share
  // this one unified page). S3 (Energy Regen +20%) and S4 (team heal on Liberation cast) have zero real
  // DPS component and no matching category in this schema — the prior totalMult approximations had no
  // real derivation. Zeroed both to {} per this project's hard rule against inventing values, rather than
  // the previous "approximated as totalMult" convention. TODO: needs Phase 2 schema for Energy Regen% and
  // healing-bonus effects. S1/S2/S5/S6 confirmed correct, unchanged.
  'Rover: Spectro': { s1: { critRate: 15 }, s2: { elemDmg: 20 }, s3: {}, s4: {}, s5: { libDmg: 40 }, s6: { resShred: 10 } },
  // Re-audited 2026-09-01 against the wiki/Rover/Combat (unified page), cross-checked
  // against the source/character/1604 (both agree exactly). S2 (Skill cooldown reset on Devastation
  // cast) and S3 (Basic Attack 5 heals 10% of HP lost) have zero real DPS component and no matching
  // category in this schema — zeroed both to {} per this project's hard rule against inventing values.
  // TODO: needs Phase 2 schema for S2's cooldown-reset and S3's healing-bonus mechanics.
  // S1/S4/S6 confirmed correct. S5 (basicDmg: 50) approximates "Basic Attack 5 deals +50% of its own DMG
  // as a bonus hit" via the matching Basic-ATK-type category — a reasonable fit since the value is exact,
  // though technically scoped to Stage 5 only rather than all Basic ATK hits.
  'Rover: Havoc':   { s1: { skillDmg: 30 }, s2: {}, s3: {}, s4: { resShred: 10 }, s5: { basicDmg: 50 }, s6: { critRate: 25 } },
  // Re-audited 2026-09-01 against the wiki/Rover/Combat (unified page), cross-checked
  // against the source/character/1406 (both agree exactly). S1 (interruption resistance on Cloudburst
  // Dance) and S2 (continuous team healing on Unbound Flow) have zero real DPS component and no matching
  // category in this schema — zeroed both to {} per this project's hard rule against inventing values.
  // TODO: needs Phase 2 schema for S1's interruption-resistance and S2's healing-bonus mechanics.
  // S3/S4/S5/S6 confirmed correct, unchanged.
  'Rover: Aero':    { s1: {}, s2: {}, s3: { elemDmg: 15 }, s4: { skillDmg: 15 }, s5: { libDmg: 20 }, s6: { skillDmg: 30 } },
  // Re-audited 2026-09-01 against the wiki/Rover/Combat (unified page), cross-checked
  // against the source/character/1309 (both agree). S1 (Celestial Ingenuity, interruption resistance
  // utility) and S2 (Thousandfold Artifice, Electro Flare stack utility) have zero real DPS component and
  // no matching category in this schema — the prior totalMult:5/totalMult:8 values had no basis in the
  // actual node text and are zeroed to {} per this project's hard rule against inventing values.
  // TODO: needs Phase 2 schema for S1's interruption-resistance and S2's Electro-Flare-stack mechanics.
  // S3 (Alchemy of Wonders, Overshock DMG+20%), S4 (Earthquaking Rumble, Liberation DMG+20%), S5
  // (Principle of Change, Crit DMG+20% in Apex Resonance), S6 (Mind's Depths in a Casket, Thrum of All
  // Sounds/Thunder Bane DMG+20%) confirmed correct, unchanged.
  'Rover: Electro': { s1: {}, s2: {}, s3: { skillDmg: 20 }, s4: { libDmg: 20 }, s5: { critDmg: 20 }, s6: { skillDmg: 20 } },
  // corrected 2026-08-18: prior values (elemDmg:8/totalMult:10/elemDmg:8/atkPct:10/totalMult:10/elemDmg:12) had no basis
  // in Aalto's actual chain kit (the wiki Combat page, Resonance Chain table). Real effects: S1 Shift Trick CD-4s (no
  // direct DPS stat, modeled as small totalMult utility). S2 Mist Avatar ATK+15% on taunted-target attacks (conditional
  // atkPct). S3 +2 Mist bullets at 50% Basic/Mid-air DMG (utility totalMult). S4 Mist Bullets (Resonance Skill) DMG+30%
  // (skillDmg, confirmed exact) + 30% DMG reduction in Mistcloak Dash (defensive, not modeled). S5 Aero DMG Bonus+25%
  // for 6s in Mistcloak Dash (elemDmg, confirmed exact). S6 Liberation Crit Rate+8% (critRate, confirmed exact).
  // Re-audited 2026-09-01 against the wiki/Aalto/Combat, cross-checked against
  // the source/character/1403 (both agree exactly). S1: was totalMult: 4 (undocumented placeholder) —
  // real effect is purely a Resonance Skill cooldown -4s, zero DPS component. Zeroed to {}. S3: was
  // totalMult: 8 (undocumented placeholder) — real effect is "2 more Mist Bullets, each dealing 50% of
  // Basic/Mid-air ATK's own DMG" on passing through Mist, a bonus-hit-at-%-of-another-move effect with no
  // flat-schema fit (same class documented elsewhere this pass, e.g. Xiangli Yao's S1). Zeroed to {}.
  // TODO: needs Phase 2 schema for both S1's cooldown reduction and S3's bonus-hit mechanic.
  // S6: the Heavy Attack-through-Gate-of-Quandary +50% DMG bonus (conditional, previously left
  // unmodeled) is added as heavyDmg: 50 alongside the existing critRate: 8 — both are real, simultaneous
  // components of the same node.
  'Aalto':        { s1: {}, s2: { atkPct: 15 }, s3: {}, s4: { skillDmg: 30 }, s5: { elemDmg: 25 }, s6: { critRate: 8, heavyDmg: 50 } },
  // corrected 2026-08-18: prior values (all totalMult:5, s6 amplify:10) were unsourced placeholders — Baizhi's real
  // chain (the wiki Combat page) is mostly healing/utility with no "amplify" (enemy DMG-taken debuff) node at all. S1
  // Emergency Plan +2.5 Resonance Energy per Concentration (utility, not modeled). S2 Emergency Plan (at 4
  // Concentration) grants Glacio DMG Bonus+15% and Healing+15% for 12s (elemDmg, confirmed exact — healing half not
  // modeled). S3 Intro Skill grants Max HP+12% for 10s (no HP% stat in schema, kept as small utility totalMult). S4
  // Remnant Entities gets 2 extra casts + Healing Mult+20% + extra Glacio DMG (healing-focused, kept as small
  // totalMult). S5 revives a KO'd teammate once per 10 min (pure utility, no DPS stat fits). S6 Euphonia pickup grants
  // team Glacio DMG Bonus+12% for 20s (elemDmg, confirmed exact).
  // Re-audited 2026-09-01 against the wiki/Baizhi/Combat, cross-checked against
  // the source/character/1103 (both agree exactly). S1: was totalMult: 4 (undocumented placeholder) —
  // real effect is purely restoring 2.5 extra Resonance Energy per Concentration consumed on Emergency
  // Plan, zero DPS component. Zeroed to {}. S3: was totalMult: 6 — real effect is Overflowing Frost
  // granting Max HP +12% for 10s, which only indirectly affects DPS through Baizhi's HP%-scaling moves
  // (Emergency Plan, Remnant Entities); no maxHP/hpPct DPS category exists in this schema to convert it
  // cleanly, and the prior value had no shown derivation. Zeroed to {}. S4: was totalMult: 8 — real effect
  // is +2 Remnant Entities casts (healing-focused) plus a flat +1.20% Max HP additional Glacio DMG per
  // proc (an HP%-scaling bonus-hit addition, same unrepresentable class as other bonus-hit nodes
  // documented this pass). Zeroed to {}. S5: was totalMult: 4 (undocumented placeholder) — real effect is
  // a pure-utility one-time revive, zero DPS component. Zeroed to {}.
  // TODO: needs Phase 2 schema — S3/S4's HP%-scaling effects and S1/S5's utility effects have no home in
  // this DPS-focused flat-{stat: value} schema.
  'Baizhi':       { s1: {}, s2: { elemDmg: 15 }, s3: {}, s4: {}, s5: {}, s6: { elemDmg: 12 } },
  // corrected 2026-08-18: prior values (atkPct/amplify on every node) had no basis in Buling's real
  // chain kit (the wiki Combat page, rendered Resonance Chain table, cross-checked against the source's own
  // Kit tab) — she has no ATK% node and no DMG Amplify node at all. Real effects: S1 Exorcist Gadgets,
  // Lend Me Your Power — enhanced Liberation (Flashing Thunder Spell: Harmony) Crit Rate+20% upon
  // dealing DMG (confirmed exact -> critRate). S2 Talisman Burns, Spirits Turn — restores 25 Resonance
  // Energy on entering Yin-Yang Balance, once per 24s (Energy-regen utility, no matching stat in this
  // schema, kept as a small totalMult per the Lumi S1/Youhu S1 precedent for non-damage utility nodes).
  // S3 Summoner of Spirits, Seeker of Fate — while the Five Thunders Spell Array lasts, heals any team
  // member below 50% HP by 350+150% ATK once per 24s (healing utility, no basis for a DMG stat, same
  // small-totalMult treatment). S4 Wanderer of Solaris, Blessed by Fortune — Healing Bonus+20% (no
  // healBonus stat exists in this schema either, same treatment). S5 Forum Ban? New Account! — the
  // Five Thunders Spell Array inflicts 6 extra Electro Flare stacks instantly on generation (utility,
  // same treatment). S6 "Almighty Forum Lord of Thunder Spell" — upgrades the enhanced Liberation's
  // Thunder Spell - Heaven, Earth, Mind state from 25% to 50% Resonance Skill DMG Bonus to the active
  // Resonator (confirmed exact -> skillDmg, matches CHAR_BUFF_TABLE's libBuffs note above).
  // Re-audited 2026-09-01 against the wiki/Buling/Combat, cross-checked against
  // the source/character/1307 (both agree exactly). S2-S5's totalMult: 3 placeholders had no real
  // derivation — none of them have a DPS component: S2 is pure Resonance Energy restore, S3 and S4 are
  // healing-only stats, S5 is an extra Electro Flare stack application with no flat DMG% conversion.
  // Zeroed all four to {} per this project's hard rule against inventing values. S1/S6 confirmed correct.
  // TODO: needs Phase 2 schema for S3/S4's healing bonuses and S5's stacking-DoT-application mechanic.
  'Buling':       { s1: { critRate: 20 }, s2: {}, s3: {}, s4: {}, s5: {}, s6: { skillDmg: 50 } },
  // corrected 2026-08-18: prior values (atkPct:8/skillDmg:10/atkPct:8/skillDmg:10/totalMult:10/elemDmg:12) had no basis
  // in Chixia's real chain kit (the wiki Combat page). S1 Boom Boom hits always Crit (utility, no %-stat fits). S2
  // Liberation kill-refund of Resonance Energy (utility). S3 Liberation Blazing Flames DMG+40% vs targets below 50%
  // HP (libDmg, confirmed exact, conditional). S4 Liberation grants 60 Thermobaric Bullets + resets Skill CD (utility).
  // S5 ATK+30% at max Numbingly Spicy! stacks (atkPct, confirmed exact, conditional). S6 Boom Boom grants team Basic
  // ATK DMG Bonus+25% for 15s (basicDmg, confirmed exact, team buff).
  // Re-audited 2026-09-01 against the wiki/Chixia/Combat, cross-checked against
  // the source/character/1202 (both agree exactly). S1: was totalMult: 5 (undocumented placeholder) —
  // real effect is Resonance Skill Boom Boom hits always Critical, a conditional 100% Crit Rate scoped to
  // one specific infrequent proc rather than a flat kit-wide Crit Rate buff; no clean conversion exists.
  // Zeroed to {}. S2: was totalMult: 4 (undocumented placeholder) — real effect is purely Resonance
  // Energy restore per kill during Blazing Flames, zero DPS component. Zeroed to {}. S4: was totalMult: 8
  // — real effect is purely a Thermobaric Bullets grant + Skill cooldown reset (both resource/utility, no
  // direct DPS stat). Zeroed to {}. TODO: needs Phase 2 schema for S1's scoped-crit-guarantee mechanic.
  'Chixia':       { s1: {}, s2: {}, s3: { libDmg: 40 }, s4: {}, s5: { atkPct: 30 }, s6: { basicDmg: 25 } },
  // corrected 2026-08-18: prior values (skillDmg/atkPct on every node) had no basis in Lumi's real chain
  // kit (the wiki Combat page, rendered Resonance Chain table) — she has no ATK% node and no Resonance
  // Skill DMG node at all. Real effects: S1 Parcel To Be Delivered — after Energized Rebound, +60 STA
  // within 3s (utility, no STA-regen stat in schema, kept as small totalMult). S2 Lollo Logistics, Ready
  // to Help — Energized Pounce/Rebound ignore 20% target DEF (confirmed exact -> defIgnore). S3 Priority
  // Parcel In Transit — Squeakie Express (Liberation) DMG+30% (confirmed exact -> libDmg). S4 Captain
  // Lumi, At Your Service — Basic ATK DMG Bonus+30% (confirmed exact -> basicDmg). S5 Parcel Collected On
  // Time — when Spark is fully recovered, Laser DMG Multiplier+100% (confirmed exact; Laser is "counted
  // as Basic Attack DMG" per its own Forte text, but this is a conditional per-move multiplier rather
  // than an unconditional Basic ATK bonus like S4, so kept separate as totalMult to avoid double-counting
  // S4's basicDmg). S6 Give Me A Five-star Rating — casting Squeakie Express grants all team members
  // ATK+20% for 20s (confirmed exact -> atkPct, team buff, matches this table's convention elsewhere,
  // e.g. Danjin/Taoqi S6).
  // Re-audited 2026-09-01 against the wiki/Lumi/Combat, cross-checked against
  // the source/character/1504 (both agree exactly). S1 (totalMult: 5) was undocumented — real effect is
  // purely +60 STA restore within 3s after Energized Rebound, zero DPS component. Zeroed to {}. S2/S3/S4/
  // S5/S6 confirmed correct, unchanged.
  // s5 zeroed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was `{ totalMult: 100 }`, unscoped and
  // unconditioned — the real kit text ("When Spark is fully recovered, Laser's DMG Multiplier+100%") is
  // conditional and scoped to Laser specifically, but this table has no per-move scoping field, and
  // applyResonanceChain() (calcEngine.js) adds any lvl.totalMult straight into totalMultBonus for ANY
  // Main DPS Lumi pick at S5+, unconditionally doubling her whole kit's damage in that legacy calc path
  // (same live bug already fixed in lumi.blocks.js's trigger-engine path — this was the matching source-
  // table copy still feeding the OTHER, non-block calc path). Laser is real (fires off Outro if 25+
  // Spark was consumed) but not modeled here for the same reason blocks.js gives: the rotation's own
  // final steps drain Spark to 0 via Energized Pounce right before Outro, so assuming max Spark banked
  // would contradict the rotation's own real cast order. Zeroed to `{}`, matching S1's precedent.
  'Lumi':         { s1: {}, s2: { defIgnore: 20 }, s3: { libDmg: 30 }, s4: { basicDmg: 30 }, s5: {}, s6: { atkPct: 20 } },
  // corrected 2026-08-18: prior values (defShred/amplify on every node) had no basis in Taoqi's real
  // chain kit (the wiki Combat page, Resonance Chain table) — she has no DEF Shred or DMG Amplify node at
  // all. Real effects: S1 Essense of Tranquility — Forte Circuit Power Shift's Shield +40% (utility,
  // no shield-% stat in schema, kept as small totalMult). S2 Silent Strength — Liberation Unmovable
  // Crit Rate+20% AND Crit DMG+20% (both confirmed exact; only critRate modeled, single-stat schema).
  // S3 Keen-eyed Observer — Rocksteady Shield duration extended to 30s (utility, no duration-only stat,
  // kept as small totalMult). S4 Heavylifting Duty — on Strategic Parry trigger, restore 25% HP + DEF
  // +50% for 5s, 1x/15s (conditional, no DEF% stat in schema, kept as small totalMult). S5 Benevolent
  // Guardian — Power Shift DMG+50% (confirmed exact; Power Shift is "considered as Basic Attack DMG"
  // per its own Forte text, modeled as basicDmg) + restores 20 Resonance Energy on hit (utility, not
  // modeled). S6 Defender of Peace — Basic ATK and Heavy ATK DMG+40% while Rocksteady Shield holds
  // (confirmed exact, conditional).
  // Re-audited 2026-09-01 against the wiki/Taoqi/Combat, cross-checked against
  // the source/character/1601 (both agree exactly). S1 (totalMult: 4) and S3 (totalMult: 6) were
  // undocumented placeholders — real effects are Power Shift's Shield +40% and Rocksteady Shield
  // duration extended to 30s, both shield/utility with zero DPS component. Zeroed both to {}. S2 was
  // missing a real second component — the node grants BOTH Crit Rate +20% AND Crit DMG +20% to Unmovable
  // simultaneously, only Crit Rate was captured. Added critDmg: 20. S4 (totalMult: 8) was undocumented —
  // real effect is 25% HP heal + DEF +50% for 5s on a successful Strategic Parry; DEF is Taoqi's actual
  // damage-scaling stat here but no DEF% category exists in this schema. Zeroed to {}. S6's prior comment
  // said "single-stat schema" limited it to basicDmg only, but multi-key nodes are used throughout this
  // file (e.g. Suisui S5, Aalto S6) — added heavyDmg: 40 alongside the existing basicDmg: 40, since the
  // node explicitly buffs both.
  // TODO: needs Phase 2 schema — S1/S3's shield effects and S4's DEF%-scaling conditional buff have no
  // home in this DPS-focused flat-{stat: value} schema.
  'Taoqi':        { s1: {}, s2: { critRate: 20, critDmg: 20 }, s3: {}, s4: {}, s5: { basicDmg: 50 }, s6: { basicDmg: 40, heavyDmg: 40 } },
  // Corrected 2026-08-18 via the source's Kit tab (Resonance Chain/Sequence Node text, exact wording).
  // S1: Intro Cerulean Song grants an additional +15% Aero DMG Bonus for 8s (was atkPct:5, no basis).
  // S2: Heavy Attack recovers +10 Resonance Energy on hit, 1x/20s — energy utility, no direct DMG stat
  // exists in this schema, modeled as totalMult like other utility S2 nodes (was totalMult:8, kept).
  // S3: Resonance Skill Zephyr Domain DMG+40% + pulling range+33% (was atkPct:5, no basis).
  // S4: Mid-Air Feather Release DMG+95% (was totalMult:8, far too low).
  // S5: Resonance Liberation Wind Spirals DMG+85% (was atkPct:8, no basis).
  // S6: team-wide ATK+20% for 20s after casting Feather Release (was elemDmg:10, no basis).
  // Re-verified 2026-08-18 against the wiki's Chain Node pages (Sapphire Skies/Nesting Twigs/Nature Sings/
  // Close Your Eyes/Winds Whisper/A Tribute to Life's Sweet Hymn wikitext) — all 6 values above confirmed
  // exact against the real node text, no changes needed.
  // Re-audited 2026-09-01 against the wiki/Yangyang/Combat, cross-checked against
  // the source/character/1402 (both agree exactly). S2 (totalMult: 5) was undocumented — real effect is
  // purely 10 extra Resonance Energy on Heavy Attack hit (1/20s), zero DPS component. Zeroed to {}. S4's
  // totalMult: 95 is the closest available fallback for a named-move DMG Mult buff (Feather Release) with
  // no matching flat-schema category (it's cast via Mid-air Attack, and only its landing hit — not the
  // main diving strikes — is separately "considered Basic Attack DMG"); value confirmed exact, kept as-is.
  'Yangyang':     { s1: { elemDmg: 15 }, s2: {}, s3: { skillDmg: 40 }, s4: { totalMult: 95 }, s5: { libDmg: 85 }, s6: { atkPct: 20 } },
  // Removed 2026-08-18: this was a stale unsourced 'Youhu' duplicate key (atkPct/amplify on every node,
  // no basis in her real kit) that silently overrode the correctly-audited 'Youhu' entry earlier in this
  // object (see the real, sourced values a few lines up) — JS object literals let the later duplicate
  // key win, so this dead entry was masking the real data at runtime despite the audit looking complete.
  // corrected 2026-08-18: prior values (atkPct/amplify on every node) had no basis in Yuanwu's real
  // chain kit (the wiki Combat page, rendered Resonance Chain table) — he has no ATK% or DMG Amplify node
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
  // Re-audited 2026-09-01 against the wiki/Yuanwu/Combat, cross-checked against
  // the source/character/1303 (both agree exactly). Yuanwu's kit is almost entirely DEF-scaling, and
  // this schema has no DEF%/attack-speed/shield category, so the prior "kept as small totalMult"
  // placeholders on S1/S2/S3/S4/S6 had no real derivation — replaced with {} per this project's hard
  // rule against inventing values, and documented the real (non-representable) mechanics instead:
  // S1: Lightning Infused grants +20% Basic ATK Speed and +20% Heavy ATK Speed (attack-speed, not a DMG%).
  // S2: Thunder Bombardment restores 15 extra Resonance Energy (pure utility).
  // S3: Thunder Wedge's Coordinated ATK deals a bonus hit equal to 20% of Yuanwu's DEF (a flat
  // DEF-scaling bonus-hit addition, same unrepresentable class as other bonus-hit nodes this pass).
  // S4: casting Blazing Might grants a Shield equal to 200% of Yuanwu's DEF for 10s (shield, not DPS).
  // S6: nearby team gains DEF +32% for 3s (team-wide DEF buff, no matching category).
  // TODO: needs Phase 2 schema for DEF%, attack-speed, shield, and DEF-scaling-bonus-hit mechanics.
  'Yuanwu':       { s1: {}, s2: {}, s3: {}, s4: {}, s5: { libDmg: 50 }, s6: {} },
};

// [SECTION:SKILL_ICONS] — Per-character skill-name → icon URL, matched against SKILL_MULTIPLIERS/
// CHARACTER_ROTATIONS skill names the same way CHARACTER_ROTATIONS looks up its DMG row (substring match).
// Source: the wiki per-character Skill_* image assets, re-hosted on ibb.co.
// Only characters that have been audited so far are populated.
const SKILL_ICONS = {
  // Aalto/Baizhi/Chixia: Intro/Outro icons added 2026-08-18 (previously missing entirely — only
  // Basic/Skill/Liberation/Forte were populated). Aalto's Forte Circuit's real name is 'Misty Cover'
  // (was wrongly keyed 'Mistcloak Dash', the Forte's internal dash mechanic, not its own skill name) —
  // fixed to use the correct name while keeping 'Mistcloak Dash' as an alias to the same icon so any
  // existing reference to it still resolves. All new icons sourced directly from the wiki's
  // the wiki's the wiki Skill_*.png assets, re-hosted on ibb.co (2026-08-19).
  'Aalto': {
    'Half Truths': './characters/_shared/8gYdwYCF-skill-pistols.webp', // Basic ATK — shared generic Pistols icon
    'Standard': './characters/_shared/8gYdwYCF-skill-pistols.webp',
    'Shift Trick': './characters/aalto/4ZDDVq43-aalto-skill.webp',
    'Flower in the Mist': './characters/aalto/qYjnpYdK-aalto-heavy.webp',
    'Misty Cover': './characters/aalto/35S8hKWN-aalto-liberation.webp',
    'Mistcloak Dash': './characters/aalto/35S8hKWN-aalto-liberation.webp', // alias, see comment above
    'Feint Shot': './characters/aalto/PzsmFsvH-Skill-Feint-Shot.webp',
    'Dissolving Mist': './characters/aalto/N2bhMGbv-Skill-Dissolving-Mist.webp',
  },
  'Baizhi': {
    'Destined Promise': './characters/baizhi/6c75rLCc-baizhi-basic.webp', // Basic ATK — generic Rectifier icon
    'Standard': './characters/baizhi/6c75rLCc-baizhi-basic.webp',
    'Emergency Plan': './characters/baizhi/2BC255K-baizhi-skill.webp',
    'Momentary Union': './characters/baizhi/fsP021g-baizhi-liberation.webp',
    'Cycle of Life': './characters/baizhi/d0nRGZwy-baizhi-forte.webp',
    'Overflowing Frost': './characters/baizhi/bghHsrhw-Skill-Overflowing-Frost.webp',
    'Rejuvinating Flow': './characters/baizhi/Zps3MW2N-Skill-Rejuvinating-Flow.webp', // the wiki's own spelling ("Rejuvinating") — kept verbatim to match the wiki's file name
  },
  'Chixia': {
    'POW POW': './characters/_shared/xq4xPQNP-Lynae-basic.webp', // Basic ATK — shared generic Pistols icon
    'Standard': './characters/_shared/xq4xPQNP-Lynae-basic.webp',
    'Whizzing Fight Spirit': './characters/chixia/s9jWxj9V-chixia-skill.webp',
    'Blazing Flames': './characters/chixia/67N4dq55-chixia-liberation.webp',
    'Heroic Bullets': './characters/chixia/x8mwJBr0-chixia-forte.webp',
    'Grand Entrance': './characters/chixia/NdrkdWzL-Skill-Grand-Entrance.webp',
    'Leaping Flames': './characters/chixia/2Ygxpzps-Skill-Leaping-Flames.webp',
  },
  'Encore': {
    'Wooly Attack': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Basic ATK — shared generic Rectifier icon (same asset already used for Yinlin), also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    'Cosmos: Frolicking': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Cosmos Rave's Basic ATK replacement — same generic weapon icon
    'Flaming Woolies': './characters/encore/twHsyRRM-Skill-Flaming-Woolies.webp',
    'Cosmos Rampage': './characters/encore/twHsyRRM-Skill-Flaming-Woolies.webp', // Cosmos Rave's Resonance Skill replacement, same wiki icon as the base Skill
    'Cosmos Rave': './characters/encore/CKy2Dkf5-Skill-Cosmos-Rave.webp',
    'Heavy ATK: Cloudy Frenzy': './characters/encore/whstB0k3-Skill-Black-White-Woolies.webp', // Forte Circuit's own icon, covers both Forte states
    'Heavy ATK: Cosmos Rupture': './characters/encore/whstB0k3-Skill-Black-White-Woolies.webp',
    'Woolies Helpers': './characters/encore/gbpQxXkC-Skill-Woolies-Can-Help.webp',
    'Woolies Can Help!': './characters/encore/gbpQxXkC-Skill-Woolies-Can-Help.webp', // rotation-step phrasing, same icon
    'Cosmos: Rampage': './characters/encore/twHsyRRM-Skill-Flaming-Woolies.webp', // rotation-step phrasing for 'Cosmos Rampage', same icon
    'Heavy Attack: Cosmos Rupture': './characters/encore/whstB0k3-Skill-Black-White-Woolies.webp', // rotation-step phrasing ('Attack' vs 'ATK'), same icon
    'Thermal Field': './characters/encore/MkS6WNzG-Skill-Thermal-Field.webp',
  },
  'Calcharo': {
    'Gnawing Fangs': './characters/_shared/CpPvLLVt-Skill-Broadblade.webp', // Basic ATK — shared generic Broadblade icon (same asset already used for Jiyan), also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/_shared/CpPvLLVt-Skill-Broadblade.webp',
    'Extermination Order': './characters/calcharo/7Nyx9Z3b-Skill-Extermination-Order.webp',
    'Heavy ATK: "Mercy"': './characters/calcharo/kVd4h62C-Skill-Hunting-Mission.webp', // Forte Circuit's own icon, covers both Forte states
    'Heavy ATK: "Death Messenger"': './characters/calcharo/kVd4h62C-Skill-Hunting-Mission.webp',
    'Phantom Etching': './characters/calcharo/Xx7Hd3NG-Skill-Phantom-Etching.webp', // must precede 'Hounds Roar' below — the Liberation row's name is "Phantom Etching → Hounds Roar" and should resolve to this icon, not the generic weapon one
    'Hounds Roar': './characters/_shared/CpPvLLVt-Skill-Broadblade.webp', // Deathblade Gear's Basic ATK replacement, referenced standalone in the rotation — same generic weapon icon
    'Wanted Outlaw': './characters/calcharo/B2pH4yjS-Skill-Wanted-Outlaw.webp',
    'Shadowy Raid': './characters/calcharo/k2vk5Fqp-Skill-Shadowy-Raid.webp',
    'Heavy Attack: "Death Messenger"': './characters/calcharo/kVd4h62C-Skill-Hunting-Mission.webp', // rotation-step phrasing ('Attack' vs 'ATK'), same icon
  },
  'Yinlin': {
    "Zapstring's Dance": './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Basic ATK — shared generic Rectifier icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    'Magnetic Roar': './characters/yinlin/6785t0vK-Skill-Magnetic-Roar.webp',
    'Lightning Execution': './characters/yinlin/6785t0vK-Skill-Magnetic-Roar.webp', // second phase of the same Resonance Skill, no separate wiki icon
    'Chameleon Cipher': './characters/yinlin/ymCP6ZNM-Skill-Chameleon-Cipher.webp',
    'Thundering Wrath': './characters/yinlin/0y3Tswfv-Skill-Thundering-Wrath.webp',
    'Raging Storm': './characters/yinlin/TMqQ3Sdc-Skill-Raging-Storm.webp',
    'Strategist': './characters/yinlin/dJzzqS1V-Skill-Strategist.webp',
  },
  'Jiyan': {
    'Lone Lance': './characters/_shared/CpPvLLVt-Skill-Broadblade.webp', // Basic ATK — shared generic Broadblade icon on the wiki, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/_shared/CpPvLLVt-Skill-Broadblade.webp', // Heavy ATK / Dodge Counter rows
    'Windqueller': './characters/jiyan/Rk9XDRW3-Skill-Windqueller.webp',
    'Lance of Qingloong': './characters/_shared/CpPvLLVt-Skill-Broadblade.webp', // Qingloong Mode's Heavy Attack replacement, same generic weapon icon
    'Emerald Storm: Finale': './characters/jiyan/F4SmBx2q-Skill-Qingloong-at-War.webp', // Forte Circuit's own icon
    'Emerald Storm: Prelude': './characters/jiyan/4gT4C4SW-Skill-Emerald-Storm-Prelude.webp',
    'Tactical Strike': './characters/jiyan/33s8c1p-Skill-Tactical-Strike.webp',
    'Discipline': './characters/jiyan/TBjWQSR1-Skill-Discipline.webp',
  },
  // Source: the wiki Skill_*.png assets for Jianxin, re-hosted on ibb.co (2026-08-17,
  // matching the convention used for the other audited characters above — all 6 URLs verified 200/live
  // before upload).
  'Jianxin': {
    'Fengyiquan': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp', // Basic ATK — shared generic Gauntlets icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp',
    'Calming Air': './characters/jianxin/4w8Mq52y-Skill-Calming-Air.webp',
    'Primordial Chi Spiral': './characters/jianxin/xtnnFYZC-Skill-Primordial-Chi-Spiral.webp',
    'Purification Force Field': './characters/jianxin/JjzrRftm-Skill-Purification-Force-Field.webp',
    'Essence of Tao': './characters/jianxin/jZvd35BH-Skill-Essence-of-Tao.webp', // Intro Skill
    'Transcendence': './characters/jianxin/jP7RDt0b-Skill-Transcendence.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Lingyang, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload.
  'Lingyang': {
    'Majestic Fists': './characters/lingyang/Cs76xkJK-Skill-Majestic-Fists.webp', // Basic ATK — also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/lingyang/Cs76xkJK-Skill-Majestic-Fists.webp',
    'Ancient Arts': './characters/lingyang/5h5F3YrR-Skill-Ancient-Arts.webp',
    'Unification of Spirits': './characters/lingyang/4R6ggr17-Skill-Unification-of-Spirits.webp',
    "Strive: Lion's Vigor": './characters/lingyang/Wbh05jj-Skill-Strive-Lions-Vigor.webp',
    'Lion Awakens': './characters/lingyang/v4t5F4cP-Skill-Lion-Awakens.webp', // Intro Skill
    'Frosty Marks': './characters/lingyang/SwNjm5nr-Skill-Frosty-Marks.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Verina, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload. Cultivation
  // (Basic ATK) uses the same generic Skill_Rectifier.png icon already re-hosted for Encore/Yinlin.
  'Verina': {
    'Cultivation': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Basic ATK — shared generic Rectifier icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    'Botany Experiment': './characters/verina/S4TqBZMp-Skill-Botany-Experiment.webp',
    'Starflower Blooms': './characters/verina/4RZZwnz0-Skill-Starflower-Blooms.webp',
    'Arboreal Flourish': './characters/verina/204LdT14-Skill-Arboreal-Flourish.webp',
    'Verdant Growth': './characters/verina/kgxDz6Xv-Skill-Verdant-Growth.webp', // Intro Skill
    'Blossom': './characters/verina/1fVPJtzv-Skill-Blossom.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Jinhsi, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API (Forte table section fetched directly by section index to
  // dodge the page's huge collapsed ascension tables) — all 6 URLs verified 200/live before upload.
  'Jinhsi': {
    'Slash of Breaking Dawn': './characters/jinhsi/tMmTFPJH-Skill-Broadblade.webp', // Basic ATK — also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/jinhsi/tMmTFPJH-Skill-Broadblade.webp',
    'Trailing Lights of Eons': './characters/jinhsi/zVbYMXzG-Skill-Trailing-Lights-of-Eons.webp',
    'Overflowing Radiance': './characters/jinhsi/zVbYMXzG-Skill-Trailing-Lights-of-Eons.webp', // Resonance Skill mechanic (alt-cast after Basic Attack 4/Intro), same wiki icon as Trailing Lights of Eons
    'Incarnation': './characters/jinhsi/zVbYMXzG-Skill-Trailing-Lights-of-Eons.webp', // Resonance Skill state entered via Overflowing Radiance, same wiki icon
    'Illuminous Epiphany': './characters/jinhsi/zVbYMXzG-Skill-Trailing-Lights-of-Eons.webp', // Resonance Skill mechanic cast from within Incarnation, same wiki icon
    'Luminal Synthesis': './characters/jinhsi/R5sPDCC-Skill-Luminal-Synthesis.webp',
    'Purge of Light': './characters/jinhsi/cSS7ms3Z-Skill-Purge-of-Light.webp',
    "Loong's Halo": './characters/jinhsi/cKXv3P1y-Skill-Loong-Halo.webp', // Intro Skill
    'Temporal Bender': './characters/jinhsi/qZDp0Jz-Skill-Temporal-Bender.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Changli, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload. Blazing
  // Enlightenment (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Sword.png icon.
  'Changli': {
    'Blazing Enlightenment': './characters/_shared/4w6tSxmb-Skill-Sword.webp', // Basic ATK — also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/_shared/4w6tSxmb-Skill-Sword.webp',
    'Tripartite Flames': './characters/changli/DDwNWX8M-Skill-Tripartite-Flames.webp',
    'True Sight: Capture': './characters/changli/DDwNWX8M-Skill-Tripartite-Flames.webp', // Resonance Skill mechanic (plunging finisher after True Sight), same wiki icon as Tripartite Flames
    'Flaming Sacrifice': './characters/changli/39K3xvGn-Skill-Flaming-Sacrifice.webp',
    'Radiance of Fealty': './characters/changli/Df83Zv7v-Skill-Radiance-of-Fealty.webp',
    'Obedience of Rules': './characters/changli/4w1N13zp-Skill-Obedience-of-Rules.webp', // Intro Skill
    'Strategy of Duality': './characters/changli/sdkt9Yhd-Skill-Strategy-of-Duality.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Zhezhi, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload. Dimming Brush
  // (Basic ATK) uses the same generic Skill_Rectifier.png icon already re-hosted for Encore/Yinlin/Verina.
  'Zhezhi': {
    'Dimming Brush': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Basic ATK — also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    'Heavy ATK: Conjuration': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Heavy Attack's own name on the wiki, no dedicated icon — generic weapon icon
    'Manifestation': './characters/zhezhi/DDNMwsCy-Skill-Manifestation.webp',
    // Split from a single combined key: getSkillIcon() does `skillName.includes(key)`, so a rotation
    // step naming just "Stroke of Genius" (the real in-game move name, shorter than the combined
    // string) never contained it and silently got no icon. Both are named cast-states of the same
    // Resonance Skill (Manifestation), no separate wiki icon.
    'Stroke of Genius': './characters/zhezhi/DDNMwsCy-Skill-Manifestation.webp',
    'Creation\'s Zenith': './characters/zhezhi/DDNMwsCy-Skill-Manifestation.webp',
    'Ink and Wash': './characters/zhezhi/8DYg2f8z-Skill-Ink-and-Wash.webp',
    'Living Canvas': './characters/zhezhi/Vc7cVKF1-Skill-Living-Canvas.webp',
    'Radiant Ruin': './characters/zhezhi/LX3NLrxP-Skill-Radiant-Ruin.webp', // Intro Skill
    'Carve and Draw': './characters/zhezhi/V0s9WpHG-Skill-Carve-and-Draw.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Xiangli Yao, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before
  // upload. Probe (Basic ATK) has no dedicated wiki asset (it's itself a redirect to the generic
  // Gauntlets icon), also covers Heavy ATK/Mid-air/Dodge Counter, same as Jianxin's shared icon.
  'Xiangli Yao': {
    'Probe': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp',
    'Standard': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp',
    'Revamp': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp', // rotation-step phrasing for the Mid-air Attack, same generic weapon icon (renamed 2026-09-01 from 'Mid-air Attack: Revamp' to match the CHARACTER_ROTATIONS step's shortened `skill` string under getSkillIcon's `skillName.includes(k)` lookup)
    'Deduction': './characters/xiangli-yao/8D4YCpRh-skill-deduction.webp',
    'Decipher': './characters/xiangli-yao/8D4YCpRh-skill-deduction.webp', // Forte-upgraded Skill, same wiki icon as base Deduction
    'Divergence': './characters/xiangli-yao/8D4YCpRh-skill-deduction.webp', // Intuition state's Resonance Skill replacement for Deduction, same wiki icon (matches 'Intuition: Divergence' rotation step via substring)
    'Law of Reigns': './characters/xiangli-yao/8D4YCpRh-skill-deduction.webp', // Resonance Skill repeatedly cast during Intuition, no dedicated wiki icon — same as Deduction (renamed 2026-09-01 from 'Skill: Law of Reigns' to match the CHARACTER_ROTATIONS step's shortened `skill` string)
    'Pivot-Impale': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp', // Intuition state's Basic Attack replacement, same generic weapon icon (matches 'Intuition: Pivot-Impale' rotation step via substring)
    'Forever Seeking': './characters/xiangli-yao/TMjphf6y-skill-forever-seeking.webp',
    'Cogitation Model': './characters/xiangli-yao/CKYDdBRY-skill-cogitation.webp',
    'Principle': './characters/xiangli-yao/cXpS7bBx-skill-principle.webp', // Intro Skill
    'Chain Rule': './characters/xiangli-yao/spxqcJ3K-skill-chain-rule.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Shorekeeper, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before
  // upload. Origin Calculus (Basic ATK) uses the same generic Skill_Rectifier.png icon already
  // re-hosted for Encore/Yinlin/Verina/Zhezhi.
  'Shorekeeper': {
    'Origin Calculus': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    'Standard': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    // Key shortened 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) from 'Heavy Attack: Illation' —
    // getSkillIcon() does skillName.includes(key), and the CHARACTER_ROTATIONS step's own skill field
    // is the short 'Illation' (see CHARACTER_ROTATIONS['Shorekeeper']), which does NOT contain the
    // longer 'Heavy Attack: Illation' string — the lookup was silently failing for that step, exact
    // same bug class already fixed for Xiangli Yao's Revamp key.
    'Illation': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Forte-gauge-gated Heavy Attack, no dedicated wiki icon — generic weapon icon
    'Chaos Theory': './characters/shorekeeper/zTGgrNMM-skill-chaos-theory.webp',
    'Astral Chord': './characters/shorekeeper/pkXPr5P-skill-astral-chord.webp',
    'End Loop': './characters/shorekeeper/MD3NpydF-skill-end-loop.webp',
    'Proof of Existence': './characters/shorekeeper/RGFGH8d9-skill-proof-of-existence.webp', // Intro Skill
    'Discernment': './characters/shorekeeper/RGFGH8d9-skill-proof-of-existence.webp', // Supernal Stellarealm's Intro Skill replacement for Proof of Existence, same wiki icon
    'Binary Butterfly': './characters/shorekeeper/bjjhnD3f-skill-binary-butterfly.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Camellya, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before
  // upload. Burgeoning (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Sword.png
  // icon (same as Changli's).
  'Camellya': {
    'Burgeoning': './characters/_shared/x86mmjbD-skill-sword.webp',
    'Standard': './characters/_shared/x86mmjbD-skill-sword.webp',
    'Valse of Bloom and Blight': './characters/camellya/wrNPQ1TC-skill-valse.webp',
    'Crimson Blossom': './characters/camellya/wrNPQ1TC-skill-valse.webp', // Resonance Skill mechanic (a named hit within Valse of Bloom and Blight), same wiki icon
    'Vining Waltz': './characters/camellya/wrNPQ1TC-skill-valse.webp', // Blossom Mode's Basic ATK replacement, same Skill icon
    'Blazing Waltz': './characters/camellya/wrNPQ1TC-skill-valse.webp',
    'Floral Ravage': './characters/camellya/wrNPQ1TC-skill-valse.webp', // Blossom Mode's Resonance Skill replacement, same wiki icon
    'Fervor Efflorescent': './characters/camellya/ynCScFqJ-skill-fervor.webp',
    'Vegetative Universe': './characters/camellya/xqcjjVmq-skill-vegetative.webp',
    'Ephemeral': './characters/camellya/xqcjjVmq-skill-vegetative.webp', // Forte Circuit's own upgraded skill, same icon
    'Everblooming': './characters/camellya/M5ckbVnH-skill-everblooming.webp', // Intro Skill
    'Twining': './characters/camellya/vvrfhcLs-skill-twining.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Carlotta, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before
  // upload. Silent Execution (Basic ATK) has no dedicated wiki asset, uses the shared generic
  // Skill_Pistols.png icon.
  'Carlotta': {
    'Silent Execution': './characters/_shared/NG3jXXG-skill-pistols.webp',
    'Standard': './characters/_shared/NG3jXXG-skill-pistols.webp',
    'Necessary Measures': './characters/_shared/NG3jXXG-skill-pistols.webp', // Moldable-Crystal Basic ATK replacement, same generic weapon icon
    'Plunging Attack': './characters/_shared/NG3jXXG-skill-pistols.webp', // Mid-air Basic ATK finisher, same generic weapon icon (no dedicated wiki asset)
    'Art of Violence': './characters/carlotta/JwZzgLS1-skill-artofviolence.webp',
    'Chromatic Splendor': './characters/carlotta/JwZzgLS1-skill-artofviolence.webp', // 2nd-press of the same Resonance Skill, no separate wiki icon
    'Lethal Repertoire': './characters/carlotta/d49NGW0G-skill-lethalrepertoire.webp',
    'Imminent Oblivion': './characters/carlotta/d49NGW0G-skill-lethalrepertoire.webp', // Forte Circuit's own upgraded Heavy ATK, same icon
    'Era of New Wave': './characters/carlotta/7dRxcfdg-skill-eraofnewwave.webp',
    'Death Knell': './characters/carlotta/7dRxcfdg-skill-eraofnewwave.webp', // Twilight Tango's Liberation-replacement attacks, same wiki icon
    'Fatal Finale': './characters/carlotta/7dRxcfdg-skill-eraofnewwave.webp',
    'Wintertime Aria': './characters/carlotta/d4gxw6J8-skill-wintertimearia.webp', // Intro Skill
    'Closing Remark': './characters/carlotta/qMFKhW2G-skill-closingremark.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Roccia, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload. Pero, Easy
  // (Basic ATK) has no dedicated wiki asset (a redirect to the generic Gauntlets icon, same as
  // Jianxin/Xiangli Yao's shared icon).
  'Roccia': {
    'Pero, Easy': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp',
    'Standard': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp',
    // 'Stage 1-4' added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): getSkillIcon() does
    // skillName.includes(key), and CHARACTER_ROTATIONS.Roccia's own Basic ATK step uses the exact
    // skill string 'Stage 1-4' — which contains neither 'Pero, Easy' nor 'Standard' as a substring, so
    // that rotation step silently resolved to no icon. Same generic weapon icon as the move's other keys.
    'Stage 1-4': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp',
    'Real Fantasy': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp', // Forte's Basic ATK replacement, same generic weapon icon
    'Acrobatic Trick': './characters/roccia/SDY1939h-skill-acrobatictrick.webp',
    'A Prop Master Prepares': './characters/roccia/fzp1K5tw-skill-apropmaster.webp',
    'Commedia Improvviso!': './characters/roccia/z3hHnSz-skill-commediaimprov.webp',
    'Pero, Help': './characters/roccia/kstN6pTM-skill-perohelp.webp', // Intro Skill
    'Applause, Please!': './characters/roccia/v4xJNxgk-skill-applauseplease.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Phoebe, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before upload. O Come Divine
  // Light (Basic ATK) uses the same generic Skill_Rectifier.png icon already re-hosted for
  // Encore/Yinlin/Verina/Zhezhi/Shorekeeper.
  'Phoebe': {
    'O Come Divine Light': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    'Standard': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    "Chamuel's Star": './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Ring-of-Mirrors Basic ATK replacement, same generic weapon icon
    'To Where Light Shines': './characters/phoebe/6JNhMwTC-skill-towherelight.webp',
    'Radiant Invocation': './characters/phoebe/cKDPRGRt-skill-radiantinvocation.webp',
    'Starflash': './characters/phoebe/cKDPRGRt-skill-radiantinvocation.webp', // Forte Circuit's own upgraded Heavy ATK, same icon
    'Absolution Litany': './characters/phoebe/cKDPRGRt-skill-radiantinvocation.webp',
    'Utter Confession': './characters/phoebe/cKDPRGRt-skill-radiantinvocation.webp',
    'Dawn of Enlightenment': './characters/phoebe/ksP6pd0b-skill-dawnofenlight.webp',
    'Golden Grace': './characters/phoebe/gbGWpjwC-skill-goldengrace.webp', // Intro Skill
    'Attentive Heart': './characters/phoebe/HTZ5ppLG-skill-attentiveheart.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Brant, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before upload. Captain's
  // Rhapsody (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Sword.png icon
  // (same as Changli/Camellya's).
  'Brant': {
    "Captain's Rhapsody": './characters/_shared/x86mmjbD-skill-sword.webp',
    'Standard': './characters/_shared/x86mmjbD-skill-sword.webp',
    'Rhapsodic Riff': './characters/_shared/x86mmjbD-skill-sword.webp', // Basic ATK-chained Heavy ATK, same generic weapon icon
    'Stage 2-3 + Charged Attack + Flip': './characters/_shared/x86mmjbD-skill-sword.webp', // rotation-step phrasing for the Basic ATK combo, same generic weapon icon
    'Anchors Aweigh': './characters/brant/Kp8DPNdC-skill-anchorsaweigh.webp',
    'Ocean Odyssey': './characters/brant/VWJhTfT2-skill-oceanodyssey.webp',
    'Returned from Ashes': './characters/brant/VWJhTfT2-skill-oceanodyssey.webp', // Forte Circuit's own upgraded Skill, same icon
    'To the Horizon': './characters/brant/Gfc6z3zy-skill-totheheorizon.webp',
    'Applaud for Me!': './characters/brant/Xk8TCww5-skill-applaudforme.webp', // Intro Skill
    'The Course is Set!': './characters/brant/HpqFG4gz-skill-thecourseisset.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Cantarella, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before
  // upload. Illusion Collapse (Basic ATK) has a dedicated icon (not a shared generic weapon one).
  'Cantarella': {
    'Illusion Collapse': './characters/cantarella/Jw0SD1X0-skill-illusioncollapse.webp',
    'Standard': './characters/cantarella/Jw0SD1X0-skill-illusioncollapse.webp',
    'Delusive Dive': './characters/cantarella/Jw0SD1X0-skill-illusioncollapse.webp', // Trance's Heavy Attack replacement, same generic Basic/Heavy icon
    'Phantom Sting': './characters/cantarella/Jw0SD1X0-skill-illusioncollapse.webp', // Mirage's Basic ATK replacement, same icon
    'Dance with Shadows': './characters/cantarella/VWcwSf2F-skill-dancewithshadows.webp',
    'Flickering Reverie': './characters/cantarella/VWcwSf2F-skill-dancewithshadows.webp', // Mirage's Resonance Skill replacement, same wiki icon
    'Between Illusion and Reality': './characters/cantarella/SDPF5pzn-skill-betweenillusion.webp',
    'Perception Drain': './characters/cantarella/SDPF5pzn-skill-betweenillusion.webp', // Forte Circuit's own upgraded Skill, same icon
    'Beneath the Sea': './characters/cantarella/60bNqfnF-skill-beneaththesea.webp',
    'Cruise': './characters/cantarella/DgDVdZ3T-skill-cruise.webp', // Intro Skill
    'Gentle Tentacles': './characters/cantarella/fVyzhpgr-skill-gentletentacles.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Zani, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before upload. Routine
  // Negotiation (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Gauntlets.webp
  // icon (same as Jianxin/Xiangli Yao/Roccia's).
  'Zani': {
    'Routine Negotiation': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp',
    'Standard': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp',
    'Stage 3': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    'Heavy Slash': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp', // Inferno Mode's Basic ATK replacement, same generic weapon icon
    'Restless Watch': './characters/zani/Cpng0BLF-skill-restlesswatch.webp',
    'Pinpoint Strike': './characters/zani/Cpng0BLF-skill-restlesswatch.webp', // same Resonance Skill's parry counter, same wiki icon
    'Targeted Action': './characters/zani/Cpng0BLF-skill-restlesswatch.webp',
    'There Will Be A Light': './characters/zani/0jtmQHtM-skill-therewillbealight.webp',
    'Between Dawn and Dusk': './characters/zani/tpPYsMpx-skill-betweendawndusk.webp',
    'Rekindle': './characters/zani/tpPYsMpx-skill-betweendawndusk.webp', // Liberation's own named cast, same icon
    'The Last Stand': './characters/zani/tpPYsMpx-skill-betweendawndusk.webp',
    'Immediate Execution': './characters/zani/Xx8gjJV2-skill-immediateexecution.webp', // Intro Skill
    'Beacon For the Future': './characters/zani/yczmx4Lj-skill-beaconforfuture.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Ciaccona, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before upload. Quadruple
  // Time Steps (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Pistols.webp icon
  // (same as Carlotta's).
  'Ciaccona': {
    'Quadruple Time Steps': './characters/_shared/NG3jXXG-skill-pistols.webp',
    'Standard': './characters/_shared/NG3jXXG-skill-pistols.webp',
    'Stage 3-4': './characters/_shared/NG3jXXG-skill-pistols.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    'Stage 4': './characters/_shared/NG3jXXG-skill-pistols.webp',
    'Jump-cancel into Mid-air Attack 1-2': './characters/_shared/NG3jXXG-skill-pistols.webp', // Mid-air Attack, same generic weapon icon
    'Harmonic Allegro': './characters/ciaccona/pjvmZNW0-skill-harmonicallegro.webp',
    'Symphony of Wind and Verse': './characters/ciaccona/rDrSyYC-skill-symphonywindverse.webp',
    'Quadruple Downbeat': './characters/ciaccona/rDrSyYC-skill-symphonywindverse.webp', // Forte Circuit's own upgraded Heavy ATK, same icon
    "Singer's Triple Cadenza": './characters/ciaccona/Q3SvKHzY-skill-singerstriplecadenza.webp',
    'Symphonic Poem: Tonic': './characters/ciaccona/Q3SvKHzY-skill-singerstriplecadenza.webp', // the Improvised Symphonic Poem hit within Singer's Triple Cadenza, same wiki icon
    'Roaming with the Wind': './characters/ciaccona/RGVC6MLt-skill-roamingwithwind.webp', // Intro Skill
    'Windcalling Tune': './characters/ciaccona/wFNRyDTB-skill-windcallingtune.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Cartethyia, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before
  // upload. Sword to Carve My Forms (Basic ATK) has no dedicated wiki asset, uses the shared generic
  // Skill_Sword.webp icon (same as Changli/Camellya/Brant's).
  'Cartethyia': {
    'Sword to Carve My Forms': './characters/_shared/x86mmjbD-skill-sword.webp',
    'Standard': './characters/_shared/x86mmjbD-skill-sword.webp',
    'Base Form': './characters/_shared/x86mmjbD-skill-sword.webp', // Fleurdelys/base-form Basic-Heavy-Mid-air variants share the generic icon
    'Plunging Attack': './characters/_shared/x86mmjbD-skill-sword.webp', // matches "Cartethyia Plunging Attack" rotation step via includes(); Mid-air Basic ATK finisher, no dedicated wiki asset
    'Fleurdelys': './characters/_shared/x86mmjbD-skill-sword.webp',
    'Sword to Bear Their Names': './characters/cartethyia/cX7v4GDm-skill-swordbeartheirnames.webp',
    'Sword to Answer Waves': './characters/cartethyia/cX7v4GDm-skill-swordbeartheirnames.webp', // Fleurdelys Resonance Skill replacement, same wiki icon
    'May Tempest Break the Tides': './characters/cartethyia/cX7v4GDm-skill-swordbeartheirnames.webp',
    'Tempest': './characters/cartethyia/z3B1sYY-skill-tempest.webp',
    "A Knight's Heartfelt Prayers": './characters/cartethyia/BVqRm8KJ-skill-knightsheartfelt.webp',
    'Blade of Howling Squall': './characters/cartethyia/BVqRm8KJ-skill-knightsheartfelt.webp', // Liberation's own upgraded cast, same icon
    "Sword to Mark Tide's Trace": './characters/cartethyia/k2KS9cv0-skill-swordmarktidestrace.webp', // Intro Skill
    'Sword to Call for Freedom': './characters/cartethyia/k2KS9cv0-skill-swordmarktidestrace.webp', // Fleurdelys Intro replacement, same icon
    "Wind's Divine Blessing": './characters/cartethyia/KzFYk17W-skill-windsdivineblessing.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Lupa, re-hosted on ibb.co (2026-08-17),
  // resolved via the MediaWiki imageinfo API — all 6 URLs verified 200/live before upload. Flaming Star
  // (Basic ATK) has no dedicated wiki asset, uses the shared generic Skill_Broadblade.webp icon.
  'Lupa': {
    'Flaming Star': './characters/lupa/RGn44dhM-skill-broadblade.webp',
    'Standard': './characters/lupa/RGn44dhM-skill-broadblade.webp',
    'Stage 1-2': './characters/lupa/RGn44dhM-skill-broadblade.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    'Firestrike': './characters/lupa/RGn44dhM-skill-broadblade.webp', // Mid-air Attack, no dedicated wiki icon — generic weapon icon
    "Wolf's Claw": './characters/lupa/RGn44dhM-skill-broadblade.webp', // Forte-enhanced Heavy ATK, same generic weapon icon
    'Starfall': './characters/lupa/RGn44dhM-skill-broadblade.webp',
    "Shewolf's Hunt": './characters/lupa/5WbyTxzD-skill-shewolfshunt.webp',
    'Feral Fang': './characters/lupa/5WbyTxzD-skill-shewolfshunt.webp', // same Resonance Skill's follow-up, same wiki icon
    'Ignis Lupa': './characters/lupa/S7W3d25X-skill-ignislupa.webp',
    'Dance With the Wolf': './characters/lupa/S7W3d25X-skill-ignislupa.webp', // Forte Circuit's own upgraded Skill (and its Climax variant, matched via substring), same icon
    'Fire-Kissed Glory': './characters/lupa/mrPk9FF3-skill-firekissedglory.webp',
    'Foebreaker': './characters/lupa/mrPk9FF3-skill-firekissedglory.webp', // Liberation follow-up, same wiki icon
    'Try Focusing, Eh?': './characters/lupa/jkNfHp2y-skill-tryfocusingeh.webp', // Intro Skill
    'Nowhere to Run!': './characters/lupa/jkNfHp2y-skill-tryfocusingeh.webp', // Intro's Wild Hunt upgrade, same icon
    'Stand by Me, Warrior': './characters/lupa/bjzbJyCH-skill-standbymewarrior.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Phrolova, re-hosted on ibb.co
  // (2026-08-17), resolved via the MediaWiki imageinfo API — all 5 URLs verified 200/live before
  // upload. Movement of Life and Death (Basic ATK) uses the shared generic Skill_Rectifier.webp icon
  // (same as Encore/Yinlin/Verina/Zhezhi/Shorekeeper/Phoebe's).
  'Phrolova': {
    'Movement of Life and Death': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    'Standard': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    'Stage 3': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    'Stage 1-3': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    'Scarlet Coda': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Forte-enhanced Heavy ATK, same generic weapon icon
    'Whispers in a Fleeting Dream': './characters/phrolova/6J40K1F8-skill-whispersfleetingdream.webp',
    'Whispers in Fleeting Dream': './characters/phrolova/6J40K1F8-skill-whispersfleetingdream.webp',
    'Movement of Fate and Finality': './characters/phrolova/847dkvDn-skill-rhapsodynewworld.webp',
    'Murmurs in a Haunting Dream': './characters/phrolova/847dkvDn-skill-rhapsodynewworld.webp',
    'Rhapsody of a New World': './characters/phrolova/847dkvDn-skill-rhapsodynewworld.webp',
    'Waltz of Forsaken Depths': './characters/phrolova/RG9T1CF5-skill-waltzforsakendepths.webp',
    'Maestro State': './characters/phrolova/RG9T1CF5-skill-waltzforsakendepths.webp', // Hecate's off-field attacks during Liberation's Maestro state, same icon
    'Curtain Call': './characters/phrolova/RG9T1CF5-skill-waltzforsakendepths.webp',
    'Suite of Quietus': './characters/phrolova/7dWwXT4m-skill-suiteofquietus.webp', // Intro Skill
    'Suite of Immortality': './characters/phrolova/7dWwXT4m-skill-suiteofquietus.webp', // Maestro-enhanced Intro, same icon
    'Unfinished Piece': './characters/phrolova/DDQz9zyk-skill-unfinishedpiece.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Augusta, re-hosted on ibb.co (2026-08-17).
  'Augusta': {
    "Hunter's Path": './characters/_shared/CpPvLLVt-Skill-Broadblade.webp', // Basic ATK — generic Broadblade icon (the wiki's own File:Skill_Hunter's_Path.png resolves to this same asset)
    'Thunderoar: Backstep': './characters/_shared/CpPvLLVt-Skill-Broadblade.webp', // Prowess-gated Heavy Attack variant, no dedicated wiki icon — generic weapon icon
    'Thunderoar: Spinslash': './characters/_shared/CpPvLLVt-Skill-Broadblade.webp',
    "Warrior's Blade": './characters/augusta/Mxg3Z8k9-warriors-blade.webp',
    'Undying Sunlight': './characters/augusta/Mxg3Z8k9-warriors-blade.webp', // Ascendancy-enhanced Resonance Skill, same wiki icon
    'Sunward Conquest': './characters/augusta/wN42DMTf-sunward-conquest.webp', // Resonance Liberation (Sword of Eternal Oath)
    'Sword of Eternal Oath': './characters/augusta/wN42DMTf-sunward-conquest.webp',
    'Sublime is the Sun': './characters/augusta/wN42DMTf-sunward-conquest.webp', // held Liberation alt-cast, same icon
    'Sunborne': './characters/augusta/wN42DMTf-sunward-conquest.webp',
    'Everbright Protector': './characters/augusta/wN42DMTf-sunward-conquest.webp',
    'Call Me By the Sun': './characters/augusta/21vnPFbj-call-me-by-sun.webp', // Forte Circuit
    "Glory's Favor": './characters/augusta/RT0Pjfbz-glorys-favor.webp', // Inherent Skill
    'Blazing Valor': './characters/augusta/C3Gkv7Pf-blazing-valor.webp', // Inherent Skill
    'Stride of Goldenflare': './characters/augusta/Kj6cSTM0-stride-goldenflare.webp', // Intro Skill
    'Battlesong of the Unyielding': './characters/augusta/20CntVcB-battlesong-unyielding.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Iuno, re-hosted on ibb.co (2026-08-17).
  'Iuno': {
    'Moon Steps': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp', // Basic ATK — generic Gauntlets icon (the wiki's own File:Skill_Moon_Steps.png resolves to this same asset)
    'Moonring': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp',
    'Moonbow': './characters/_shared/dsbWXdtk-Skill-Gauntlets.webp',
    'Foresight Fugue': './characters/iuno/Q7YyYGJL-skill-foresight-fugue.webp',
    'Pulse of Origins': './characters/iuno/Q7YyYGJL-skill-foresight-fugue.webp',
    'Closing Refrain': './characters/iuno/Q7YyYGJL-skill-foresight-fugue.webp',
    'Unfinished Refrain': './characters/iuno/Q7YyYGJL-skill-foresight-fugue.webp',
    'Arc Beyond the Edge': './characters/iuno/Q7YyYGJL-skill-foresight-fugue.webp',
    'Beneath Lunar Tides': './characters/iuno/XZR1WbdL-skill-beneath-lunar-tides.webp', // Resonance Liberation
    'Ebb and Flow': './characters/iuno/bRJF5hbd-skill-ebb-and-flow.webp', // Forte Circuit
    'Absolute Fullness': './characters/iuno/bRJF5hbd-skill-ebb-and-flow.webp', // Forte-empowered Heavy ATK, same icon
    'Waxing Ascent': './characters/iuno/HDtjs76J-skill-waxing-ascent.webp', // Inherent Skill
    'Derivation': './characters/iuno/k2FqSVVC-skill-derivation.webp', // Inherent Skill
    'Illuminated Manifestation': './characters/iuno/TqYmWyr5-skill-illuminated-manifestation.webp', // Intro Skill
    'From Gloom to Gleam': './characters/iuno/V0xjgmx3-skill-from-gloom-to-gleam.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Galbrena, re-hosted on ibb.co (2026-08-17).
  'Galbrena': {
    "Slayer's Trigger": './characters/_shared/8gYdwYCF-skill-pistols.webp', // Basic ATK — generic Pistols icon (the wiki's own File:Skill_Slayer's_Trigger.png resolves to this same asset)
    'Stage 1-4': './characters/_shared/8gYdwYCF-skill-pistols.webp',
    'Stage 2-4, 2-3': './characters/_shared/8gYdwYCF-skill-pistols.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    'Seraphic Execution': './characters/_shared/8gYdwYCF-skill-pistols.webp', // Demon Hypostasis Basic ATK replacement, same generic weapon icon
    'Volley of Death': './characters/_shared/8gYdwYCF-skill-pistols.webp',
    'Flamewing Verdict': './characters/_shared/8gYdwYCF-skill-pistols.webp',
    'Edge Transcended': './characters/galbrena/spB7R1n5-skill-edge-transcended.webp',
    'Encroach': './characters/galbrena/spB7R1n5-skill-edge-transcended.webp',
    'Ascent of Malice': './characters/galbrena/spB7R1n5-skill-edge-transcended.webp',
    'Ravage': './characters/galbrena/spB7R1n5-skill-edge-transcended.webp',
    'Hellfire Absolution': './characters/galbrena/60YMcsnV-skill-hellfire-absolution.webp', // Resonance Liberation
    'Beyond Threshold': './characters/galbrena/LDJBGZSx-skill-beyond-threshold.webp', // Forte Circuit
    'Oathbound Hunt': './characters/galbrena/hFY1T091-skill-oathbound-hunt.webp', // Inherent Skill
    'Sin Feaster': './characters/galbrena/cckG70y9-skill-sin-feaster.webp', // Inherent Skill
    'Hellflare Overload': './characters/galbrena/fYZhFW4t-skill-hellflare-overload.webp', // Intro Skill
    'Ashen Pursuit': './characters/galbrena/ch99n99W-skill-ashen-pursuit.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Qiuyuan, re-hosted on ibb.co (2026-08-17).
  'Qiuyuan': {
    'Inkwash': './characters/_shared/YTdT2Yxf-skill-sword.webp', // Basic ATK — generic Sword icon (the wiki's own File:Skill_Inkwash.png resolves to this same asset)
    'Thus Spoke the Blade': './characters/_shared/YTdT2Yxf-skill-sword.webp', // Forte-enhanced Basic ATK/Heavy ATK replacements, same generic weapon icon
    'Through the Groves': './characters/qiuyuan/Wpj83CS4-skill-through-the-groves.webp',
    'Undaunted Wayfarer': './characters/qiuyuan/Wpj83CS4-skill-through-the-groves.webp', // held Skill variant, same icon
    'Straw Cape in Drizzly Rain': './characters/qiuyuan/Wpj83CS4-skill-through-the-groves.webp', // S3 Skill replacement, same icon
    'Sundering Strike': './characters/qiuyuan/0Lg31jf-skill-sundering-strike.webp', // Resonance Liberation
    'Verdant Edge': './characters/qiuyuan/79CMny9-skill-verdant-edge.webp', // Forte Circuit
    'To Teach': './characters/qiuyuan/79CMny9-skill-verdant-edge.webp', // Forte Heavy ATK finishers, same icon
    'To Save': './characters/qiuyuan/79CMny9-skill-verdant-edge.webp',
    'To Sacrifice': './characters/qiuyuan/79CMny9-skill-verdant-edge.webp',
    'Quietude Within': './characters/qiuyuan/DgW9vm0Y-skill-quietude-within.webp', // Inherent Skill
    'Drink Away Woes Age-Old': './characters/qiuyuan/357LJjGX-skill-drink-away-woes.webp', // Inherent Skill
    'Attack the Must-Defend': './characters/qiuyuan/DH5PV4Mc-skill-attack-the-must-defend.webp', // Intro Skill
    'Strike Before Ready': './characters/qiuyuan/m5YJ7bBB-skill-strike-before-ready.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Chisa, re-hosted on ibb.co (2026-08-17).
  'Chisa': {
    'Reign of Silence': './characters/chisa/39ZxR3C4-skill-broadblade.webp', // Basic ATK — generic Broadblade icon (the wiki's own File:Skill_Reign_of_Silence.png resolves to this same asset)
    'Rending Lunge': './characters/chisa/39ZxR3C4-skill-broadblade.webp',
    'Death Snip': './characters/chisa/39ZxR3C4-skill-broadblade.webp',
    'Thread Withdrawn': './characters/chisa/39ZxR3C4-skill-broadblade.webp',
    'Fractured Composition': './characters/chisa/Q7HCQCXS-skill-fractured-composition.webp',
    'Eye of Unraveling': './characters/chisa/Q7HCQCXS-skill-fractured-composition.webp',
    'Serrated Loop': './characters/chisa/Q7HCQCXS-skill-fractured-composition.webp',
    'Moment of Nihility': './characters/chisa/wrM902F9-skill-moment-of-nihility.webp', // Resonance Liberation
    'Sight of Unraveling - Oblivion': './characters/chisa/4g9Q3h0k-skill-sight-of-unraveling.webp', // Forte Circuit
    'Sawring': './characters/chisa/4g9Q3h0k-skill-sight-of-unraveling.webp', // Sawring - Blitz/Eradication, Forte-state attacks, same icon
    'Inescapable Fate': './characters/chisa/mCmwWwsJ-skill-inescapable-fate.webp', // Inherent Skill
    'All Ends Here': './characters/chisa/KzpjDvHh-skill-all-ends-here.webp', // Inherent Skill
    'Reverberance - Return': './characters/chisa/KxsFThC1-skill-reverberance-return.webp', // Intro Skill
    'Unraveling - Law Zero': './characters/chisa/mC9hRxyB-skill-unraveling-law-zero.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Lynae/Mornye/Aemeath, pulled via the
  // MediaWiki API (bypasses the site's Cloudflare challenge entirely) and re-hosted on ibb.co (2026-08-17).
  'Lynae': {
    'Stage 1-3': './characters/_shared/xq4xPQNP-Lynae-basic.webp', // Basic ATK — generic Pistols icon (the wiki's own File:Skill_Chroma_Drift.png resolves to this same asset)
    'Kaleidoscopic 1-5': './characters/_shared/xq4xPQNP-Lynae-basic.webp',
    'Spark Collision': './characters/_shared/xq4xPQNP-Lynae-basic.webp',
    'Lynae-Style Palettes': './characters/lynae/KxK0V0g9-Lynae-res-Skill.webp', // Resonance Skill
    'Additive Color': './characters/lynae/KxK0V0g9-Lynae-res-Skill.webp', // Additive Color shares the Resonance Skill's own icon
    'Visual Impact': './characters/lynae/Q3tV0xMr-Lynae-forte.webp', // Forte Circuit — Chromaticity Modeling
    'Iridescent Splash': './characters/lynae/Q3tV0xMr-Lynae-forte.webp',
    'Polychrome Leap': './characters/lynae/Q3tV0xMr-Lynae-forte.webp', // Forte Gauge (Lumiflow)-gated jump mechanic, same Forte icon
    'Prismatic Overblast': './characters/lynae/WW1q9Z9P-Lynae-liberation.webp', // Resonance Liberation
    'Time to Show Some Colors!': './characters/lynae/nsQDdd3q-Lynae-intro.webp', // Intro Skill
    "Let's Hit the Road!": './characters/lynae/6c4LdY9C-Lynae-outro.webp', // Outro Skill
    'Spectral Analysis': './characters/lynae/Jw2KkfqG-Lynae-tune.webp', // Tune Break
  },
  'Mornye': {
    'Stage 1-4': './characters/_shared/CpPvLLVt-Skill-Broadblade.webp', // Basic ATK — generic Broadblade icon (same asset already used for Calcharo/Jiyan)
    'Wide Field Observation Mode Stage 1-3': './characters/_shared/CpPvLLVt-Skill-Broadblade.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    'Optimal Solution': './characters/mornye/q3z1KKmg-Mornye-res-Skill.webp', // Resonance Skill — Resolution
    'Distributed Array': './characters/mornye/q3z1KKmg-Mornye-res-Skill.webp',
    'Geopotential Shift': './characters/mornye/MDT4gMcx-Mornye-forte.webp', // Forte Circuit — Mass-Energy Equivalence
    'Inversion': './characters/mornye/MDT4gMcx-Mornye-forte.webp',
    'Critical Protocol': './characters/mornye/kVF6D8Lw-Mornye-liberation.webp', // Resonance Liberation
    'Convergence': './characters/mornye/NgLq63xG-Mornye-intro.webp', // Intro Skill
    'Recursion': './characters/mornye/wrMwYwtW-Mornye-outro.webp', // Outro Skill
    'Decoupling': './characters/mornye/rGgn1yqf-Mornye-tune.webp', // Tune Break
  },
  'Aemeath': {
    'Aemeath Form Stage': './characters/_shared/4w6tSxmb-Skill-Sword.webp', // Basic ATK — generic Sword icon, covers both her human- and Mech-form Basic strings
    'Mech Form Stage': './characters/_shared/4w6tSxmb-Skill-Sword.webp',
    'Aemeath Charged': './characters/_shared/4w6tSxmb-Skill-Sword.webp',
    'Mech Charged': './characters/_shared/4w6tSxmb-Skill-Sword.webp',
    'Aemeath Stage': './characters/_shared/4w6tSxmb-Skill-Sword.webp', // rotation-step phrasing ('Aemeath Stage 2-4'), same icon
    'Mech Stage': './characters/_shared/4w6tSxmb-Skill-Sword.webp', // rotation-step phrasing ('Mech Stage 2-4'/'Mech Stage 3-4'), same icon
    'Heavy Attack - Mech: Charged II': './characters/_shared/4w6tSxmb-Skill-Sword.webp', // rotation-step phrasing for the Mech Charged ATK, same icon
    'Sync Strikes': './characters/aemeath/V0KcrNV5-Aemeath-res-Skill.webp', // Resonance Skill — Shared Voyage
    'Form Switch': './characters/aemeath/V0KcrNV5-Aemeath-res-Skill.webp', // rotation-step phrasing for pressing the Resonance Skill to toggle Aemeath/Mech form, same icon
    'Seraphic Duet': './characters/aemeath/V0KcrNV5-Aemeath-res-Skill.webp',
    'Heavenfall Edict': './characters/aemeath/3YGvVWff-Aemeath-liberation.webp', // Resonance Liberation — Towards the Daybreak
    'Songs Across the Universe': './characters/aemeath/prZnwGKQ-Aemeath-skill-intro.webp', // Intro Skill — Overture of Departure
    'Debut of Meteoric Radiance': './characters/aemeath/prZnwGKQ-Aemeath-skill-intro.webp',
    'Silent Protection': './characters/aemeath/svSPtz0x-Aemeath-outro.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Luuk Herssen, pulled via the MediaWiki API
  // (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  'Luuk Herssen': {
    'Stage 1-4': './characters/_shared/rR5XytVJ-Luuk-skill-basic.webp', // Basic ATK — generic Gauntlets icon (the wiki's own File:Skill_Such_is_Light.png resolves to this same asset)
    'Scythe: Dissection': './characters/_shared/rR5XytVJ-Luuk-skill-basic.webp', // Mid-air Attack strings — considered Basic ATK
    'Scythe: Resection': './characters/_shared/rR5XytVJ-Luuk-skill-basic.webp',
    'Scythe Resection Stage': './characters/_shared/rR5XytVJ-Luuk-skill-basic.webp', // rotation-step phrasing without the colon ('Jump: Scythe Resection Stage 2-3'), same icon
    'Jump: Resection': './characters/_shared/rR5XytVJ-Luuk-skill-basic.webp', // rotation-step phrasing ('Basic 1 → Jump: Resection 2-3'), same icon
    'Golden Reflux': './characters/luuk-herssen/1fhf0vt7-Luuk-skill-res-Skill.webp', // Resonance Skill — Reunion of All the Fallen
    'Aureole of Execution': './characters/luuk-herssen/1fhf0vt7-Luuk-skill-res-Skill.webp',
    'Basic Attack - Golden Impale': './characters/luuk-herssen/1fhf0vt7-Luuk-skill-res-Skill.webp',
    'Golden Impale': './characters/luuk-herssen/1fhf0vt7-Luuk-skill-res-Skill.webp', // rotation-step phrasing (short form), same Resonance Skill icon
    'Gavel of Earthshaker': './characters/luuk-herssen/8nFJT3SG-Luuk-skill-forte.webp', // Forte Circuit — Spark from the Frost
    "Rewritten in Winter's Margins": './characters/luuk-herssen/1Y4xcqYx-Luuk-skill-liberation.webp', // Resonance Liberation
    'Before Injection of Dawn': './characters/luuk-herssen/ksYqXQPQ-Luuk-skill-intro.webp', // Intro Skill
    'Bow to the Last Light': './characters/luuk-herssen/W4MMpcrv-Luuk-skill-outro.webp', // Outro Skill
    'Silent Debate of Light': './characters/luuk-herssen/BHdBsKjP-Luuk-skill-tune.webp', // Tune Break
  },
  // Source: the wiki Skill_*.png assets for Sigrika, pulled via the MediaWiki API
  // (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  // Key order fixed 2026-09-04 (Phase A audit, fresh dump): getSkillIcon() does
  // skillName.includes(key), returning the FIRST matching key in insertion order. The generic
  // 'Heavy ATK: Schemata of Runes' fallback used to sit BEFORE 'Runic Outburst' — since both rotation
  // steps' skill strings ("Heavy ATK: Schemata of Runes (Chain Whip)" / "...(Runic Outburst)") contain
  // the generic substring, both silently resolved to the generic Luuk-borrowed basic-attack icon
  // instead of Sigrika's own dedicated Forte icon (1Ydcf5Gb). Also added a 'Chain Whip' key — the
  // generic fallback was the ONLY thing that ever matched that rotation step, so removing/deprioritizing
  // it without adding a specific key would have left it with no icon at all. Specific keys now all
  // precede the generic weapon-icon fallback.
  'Sigrika': {
    'Stage 1-4': './characters/_shared/rR5XytVJ-Luuk-skill-basic.webp', // Basic ATK — generic Gauntlets icon (same asset already used for Luuk Herssen)
    'Stage 2-4': './characters/_shared/rR5XytVJ-Luuk-skill-basic.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    'Elucidated': './characters/_shared/rR5XytVJ-Luuk-skill-basic.webp', // Decipher-state Basic ATK finisher, still generic weapon icon
    'BIG BOOMY BOOM!': './characters/sigrika/k6M2mPzF-Sigrika-skill-res-Skill.webp',
    'BOOMY BOOM!': './characters/sigrika/k6M2mPzF-Sigrika-skill-res-Skill.webp', // Resonance Skill — Royan Close Quarters Combat
    'Soliskin to the Aid': './characters/sigrika/k6M2mPzF-Sigrika-skill-res-Skill.webp', // Decipher-state Resonance Skill upgrade, same asset
    'Runic Outburst': './characters/sigrika/1Ydcf5Gb-Sigrika-skill-forte.webp', // Forte Circuit — Within Infinity's Embrace
    'Chain Whip': './characters/sigrika/1Ydcf5Gb-Sigrika-skill-forte.webp', // Runic Chain Whip Forte Heavy ATK variant, same Forte icon
    'Runic Soliskin': './characters/sigrika/1Ydcf5Gb-Sigrika-skill-forte.webp',
    'Learn My True Name': './characters/sigrika/1Ydcf5Gb-Sigrika-skill-forte.webp',
    'Heavy ATK: Schemata of Runes': './characters/_shared/rR5XytVJ-Luuk-skill-basic.webp', // Heavy Attack fallback, no dedicated wiki icon — generic weapon icon; kept LAST so specific Runic-variant keys above match first
    "Where Trust Leads Me!": './characters/sigrika/tTFS1w8x-Sigrika-skill-liberation.webp', // Resonance Liberation
    'Solsworn Etymology': './characters/sigrika/Qj6rsbGF-Sigrika-skill-intro.webp', // Intro Skill
    'In This Very Moment': './characters/sigrika/q3yGzhyX-Sigrika-skill-outro.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Hiyuki, pulled via the MediaWiki API
  // (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  'Hiyuki': {
    'Present Self Stage': './characters/_shared/YTdT2Yxf-skill-sword.webp', // Basic ATK — generic Sword icon (the wiki's own File:Skill_Flaming_Sakura_Blade_Art.png resolves to this same asset)
    'Foreclaimed Self Stage': './characters/_shared/YTdT2Yxf-skill-sword.webp',
    'Iai Stance': './characters/_shared/YTdT2Yxf-skill-sword.webp', // rotation-step phrasing for the Basic ATK combo ('Iai Stance x3'), same icon
    'Frost Splinter': './characters/hiyuki/9HCF6LL6-Hiyuki-skill-forte.webp', // Heavy ATK, Forte-gated — Everfrost Dominion
    'Bitterfrost': './characters/hiyuki/9HCF6LL6-Hiyuki-skill-forte.webp',
    'Glacio Bite': './characters/hiyuki/9HCF6LL6-Hiyuki-skill-forte.webp', // Forte Circuit
    'Foreclaiming': './characters/hiyuki/hJgrR7gJ-Hiyuki-skill-liberation.webp', // Resonance Liberation
    'Frostblight': './characters/hiyuki/7Jq5CD3r-Hiyuki-skill-res-Skill.webp', // Resonance Skill
    'Frostedge': './characters/hiyuki/NRt7X9T-Hiyuki-skill-intro.webp', // Intro Skill
    'Snowlight Blessing': './characters/hiyuki/Ng7S6X8j-Hiyuki-skill-outro.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Denia, pulled via the MediaWiki API
  // (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  'Denia': {
    'Stage 1-4': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Basic ATK — generic Rectifier icon (same asset already used for Encore/Yinlin)
    'Stagecraft Form Stage 4': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    'Phantom Bubble': './characters/denia/ZpdRC3Kx-denia-res-Skill.webp', // Resonance Skill — Bubbles and Baits
    'Banish': './characters/denia/ZpdRC3Kx-denia-res-Skill.webp', // Breakdown Form's Resonance Skill replacement, same wiki icon
    'Final Act: Stagecraft': './characters/denia/xtj5xwht-denia-liberation.webp', // Resonance Liberation — 1st Ultimate
    'Final Act: Breakdown': './characters/denia/xtj5xwht-denia-liberation.webp', // Resonance Liberation — 2nd Ultimate, same wiki icon
    'Erosion Field': './characters/denia/PGHNXhY3-denia-forte.webp', // Forte Circuit "Flawless"
    "It's Been A While!": './characters/denia/hx2nmhpT-denia-intro.webp', // Intro Skill — Formal Greetings
    'Formal Greetings': './characters/denia/hx2nmhpT-denia-intro.webp',
    'Unfinished Lies': './characters/denia/BVB2jBsW-denia-outro.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Lucy/Rebecca, pulled via the MediaWiki
  // API (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  'Lucy': {
    'Locked Thread': './characters/_shared/NG3jXXG-skill-pistols.webp', // Basic ATK — generic Pistols icon (same asset already used elsewhere)
    'Thread Shredding Stage 1-4': './characters/_shared/NG3jXXG-skill-pistols.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    'Dual Threading': './characters/_shared/NG3jXXG-skill-pistols.webp', // Root Access's Heavy Attack replacement, same generic weapon icon
    'Payload': './characters/lucy/Z6KMgzkb-lucy-res-Skill.webp', // Resonance Skill — Protocol Breach
    'Pulse Interference': './characters/lucy/Z6KMgzkb-lucy-res-Skill.webp',
    'Deadlock': './characters/lucy/Z6KMgzkb-lucy-res-Skill.webp', // Max-TCP Resonance Skill upgrade, same wiki icon
    'Netrunner': './characters/lucy/qFDfbxtV-lucy-liberation.webp', // Resonance Liberation
    'Old Net Deep Dive': './characters/lucy/qFDfbxtV-lucy-liberation.webp', // Multi-threading's Resonance Liberation replacement, same wiki icon
    'Multi-threading': './characters/lucy/hJfyn0s6-lucy-forte.webp', // Forte-gated Heavy ATK — Depths of Blackwall
    'Hack Response': './characters/lucy/hJfyn0s6-lucy-forte.webp', // Forte Circuit
    'Outdated Hallucination': './characters/lucy/TBQxkbJy-lucy-intro.webp', // Intro Skill
    'Countermeasure Program': './characters/lucy/gZT3x8g7-lucy-outro.webp', // Outro Skill
  },
  'Rebecca': {
    "Mix-'n'-Match": './characters/_shared/NG3jXXG-skill-pistols.webp', // Basic ATK — generic Pistols icon (same asset already used elsewhere)
    'Guts Stage 1-3': './characters/_shared/NG3jXXG-skill-pistols.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    // Added 2026-09-04 (fresh Phase A audit): SKILL_MULTIPLIERS['Rebecca']'s own row names 'Huntress
    // Stage 1-3' and 'Standard - Huntress'/'Standard - Guts' matched NO key at all in this table
    // (getSkillIcon does skillName.includes(key) — 'Huntress Stage 1-3' doesn't contain "Mix-'n'-Match"
    // or 'Guts Stage 1-3', and neither Heavy ATK row contains any existing key), a real silent
    // no-icon gap for the SKILL_MULTIPLIERS-listing view in CharacterDetailModal.jsx, same class of bug
    // as Shorekeeper's/Lumi's fixed 'includes(key)' length mismatches. Same generic Pistols icon reused,
    // matching the 'Standard' convention already used for Danjin/Yangyang/Sanhua's Heavy ATK rows.
    'Huntress Stage 1-3': './characters/_shared/NG3jXXG-skill-pistols.webp',
    'Standard': './characters/_shared/NG3jXXG-skill-pistols.webp', // Heavy ATK — 'Standard - Huntress' / 'Standard - Guts'
    "Yo, It's Big Boomin' Time!": './characters/rebecca/4RZv4Pks-rebecca-intro.webp', // Intro Skill — My Turn! (must precede the shorter Skill-row key below)
    "Hey, Leadhead": './characters/rebecca/4RZv4Pks-rebecca-intro.webp', // Guts-mode Intro alternative, same wiki icon
    "It's Big Boomin' Time!": './characters/rebecca/8n7M3D1K-rebecca-res-Skill.webp', // Resonance Skill — Tactical Tweaks
    "Come 'n' Get Me!": './characters/rebecca/8n7M3D1K-rebecca-res-Skill.webp',
    "Party 'til Dawn!": './characters/rebecca/KcVy8tQW-rebecca-liberation.webp', // Resonance Liberation
    'BOOM! Fireworks!': './characters/rebecca/KcVy8tQW-rebecca-liberation.webp', // fired when Overload is consumed as Mk. 31 HMG (Liberation) ends, same wiki icon
    'Rat-tat-tat': './characters/rebecca/tGfyYTJ-rebecca-forte.webp', // Forte-gated Heavy ATK — Gloves Are Comin' Off!
    'Bang-bang-bang': './characters/rebecca/tGfyYTJ-rebecca-forte.webp',
    'Hack Response': './characters/rebecca/tGfyYTJ-rebecca-forte.webp', // Forte Circuit
    'Preem Choom': './characters/rebecca/zhQshWzF-rebecca-outro.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Lucilla, pulled via the MediaWiki API
  // (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-17).
  'Lucilla': {
    'Snapshot': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Basic ATK — generic Rectifier icon (same asset already used elsewhere)
    'Tracing Forms Stage 1-3': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    'Letting It Go': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // auto-follow-up after Basic Attack - Tracing Forms Stage 3, same generic weapon icon
    'Phantom Frame': './characters/lucilla/G4jbSdr2-lucilla-res-Skill.webp', // Resonance Skill
    'Clear As Day': './characters/lucilla/Q7dvwN32-lucilla-liberation.webp', // Resonance Liberation
    'Oblivion': './characters/lucilla/qYZ1pTZ0-lucilla-forte.webp', // Forte Circuit — Memory Palace
    'Clip It': './characters/lucilla/7JWJhpcF-lucilla-intro.webp', // Intro Skill
    'Montage': './characters/lucilla/RGZrzfTY-lucilla-outro.webp', // Outro Skill
  },
  // Source: the wiki Skill_*.png assets for Yangyang: Xuanling/Suisui, pulled via
  // the MediaWiki API (bypasses the site's Cloudflare challenge) and re-hosted on ibb.co (2026-08-18).
  'Yangyang: Xuanling': {
    'Azure/Feather Stance': './characters/_shared/x86mmjbD-skill-sword.webp', // Basic ATK — generic Sword icon (same asset already used elsewhere)
    'Havoc in Bloom Stage 1-3': './characters/_shared/x86mmjbD-skill-sword.webp', // rotation-step phrasing for the Basic ATK combo, same icon
    'Feather Fall': './characters/_shared/x86mmjbD-skill-sword.webp', // Mid-air Attack, no dedicated wiki icon — generic weapon icon
    'Sword Stance Switch': './characters/yangyang-xuanling/NgDz5JK6-yx-res-Skill.webp', // Resonance Skill — Feather's Edge
    'Azure Sword Stance': './characters/yangyang-xuanling/N6yKBC9r-yx-forte.webp', // Forte-gated Heavy ATK — The Way of Ten Thousand Voices
    'Feather Sword Stance': './characters/yangyang-xuanling/N6yKBC9r-yx-forte.webp',
    'Shadow of Xuanling': './characters/yangyang-xuanling/N6yKBC9r-yx-forte.webp', // Forte Circuit
    'Hush of a Thousand Voices': './characters/yangyang-xuanling/hJWFGQ8N-yx-liberation.webp', // Resonance Liberation
    'Skybound Feather': './characters/yangyang-xuanling/5hWRkHJj-yx-intro.webp', // Intro Skill
    'As the Wind Wills': './characters/yangyang-xuanling/SDZqCdLj-yx-outro.webp', // Outro Skill
  },
  'Suisui': {
    'Zephyr Stance Stage 1-4': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Basic ATK — generic Rectifier icon (same asset already used elsewhere)
    'Zephyr Stance thrust': './characters/suisui/rKYhDsHw-suisui-res-Skill.webp', // Resonance Skill — Vernal Screen
    'Drizzle Stance Stage 1-4': './characters/_shared/RkMykBkT-Skill-Rectifier.webp',
    'Awakening Spring': './characters/suisui/rKYhDsHw-suisui-res-Skill.webp', // Zephyr Skill's max-Cloud Breath upgrade, same wiki icon
    'Drizzle Stance thrust': './characters/suisui/rKYhDsHw-suisui-res-Skill.webp',
    'Zephyr Stance': './characters/_shared/RkMykBkT-Skill-Rectifier.webp', // Mid-air Attack row, generic weapon icon (must follow the longer Zephyr-prefixed keys above)
    'Drizzle Stance': './characters/suisui/cRkfdDc-suisui-forte.webp', // Forte-gated Heavy ATK — Lambent Gold (must follow the longer Drizzle-prefixed keys above)
    'Song of Thoroughfare': './characters/suisui/27WLZMx6-suisui-liberation.webp', // Resonance Liberation
    'Tinkling Jade': './characters/suisui/fdXb5bgm-suisui-intro.webp', // Intro Skill
    'Rippling Waters': './characters/suisui/fhrX8pF-suisui-outro.webp', // Outro Skill
  },
  // Danjin/Yangyang/Sanhua icons added 2026-08-18, sourced directly from the wiki's
  // own the wiki Skill_*.png assets, re-hosted on ibb.co (2026-08-19).
  'Danjin': {
    'Execution': './characters/_shared/prZWKCtm-Skill-Sword.webp', // Basic ATK — generic Sword icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/_shared/prZWKCtm-Skill-Sword.webp',
    'Crimson Fragment': './characters/danjin/0Rsb2H4t-Skill-Crimson-Fragment.webp',
    'Crimson Erosion': './characters/danjin/0Rsb2H4t-Skill-Crimson-Fragment.webp', // Resonance Skill's Crimson Erosion follow-up, same skill icon
    'Sanguine Pulse': './characters/danjin/0Rsb2H4t-Skill-Crimson-Fragment.webp',
    'Crimson Bloom': './characters/danjin/JjPSmMNr-Skill-Crimson-Bloom.webp',
    'Serene Vigil': './characters/danjin/m5pGRN2t-Skill-Serene-Vigil.webp',
    'Chaoscleave': './characters/danjin/m5pGRN2t-Skill-Serene-Vigil.webp', // Forte Circuit's Heavy ATK finisher, same Forte icon
    'Vindication': './characters/danjin/fz39Q85Q-Skill-Vindication.webp',
    'Duality': './characters/danjin/VYn8FS1d-Skill-Duality.webp',
  },
  'Yangyang': {
    'Feather as Blade': './characters/_shared/prZWKCtm-Skill-Sword.webp', // Basic ATK — generic Sword icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/_shared/prZWKCtm-Skill-Sword.webp',
    'Zephyr Domain': './characters/yangyang/VW0qky4r-Skill-Zephyr-Domain.webp',
    'Zephyr Song': './characters/_shared/prZWKCtm-Skill-Sword.webp', // Heavy ATK follow-up, no dedicated the wiki icon — generic Sword icon (same convention as Basic/Heavy ATK above)
    'Wind Spirals': './characters/yangyang/934FW2wW-Skill-Wind-Spirals.webp',
    'Echoing Feathers': './characters/yangyang/s9HtLNhg-Skill-Echoing-Feathers.webp',
    'Feather Release': './characters/yangyang/s9HtLNhg-Skill-Echoing-Feathers.webp', // Forte Circuit's Mid-air Attack finisher, same Forte icon
    'Cerulean Song': './characters/yangyang/0SJV3np-Skill-Cerulean-Song.webp',
    'Whispering Breeze': './characters/yangyang/ZpfP3HZb-Skill-Whispering-Breeze.webp',
  },
  'Sanhua': {
    'Frigid Light': './characters/_shared/prZWKCtm-Skill-Sword.webp', // Basic ATK — generic Sword icon, also covers Heavy ATK/Mid-air/Dodge Counter
    'Standard': './characters/_shared/prZWKCtm-Skill-Sword.webp',
    'Eternal Frost': './characters/sanhua/W4h4QXjz-Skill-Eternal-Frost.webp',
    'Glacial Gaze': './characters/sanhua/m5qSqm32-Skill-Glacial-Gaze.webp',
    'Clarity of Mind': './characters/sanhua/tMVxnqGb-Skill-Clarity-of-Mind.webp',
    'Detonate': './characters/sanhua/tMVxnqGb-Skill-Clarity-of-Mind.webp', // Forte Circuit's Heavy ATK finisher, same Forte icon
    'Freezing Thorns': './characters/sanhua/203JZS27-Skill-Freezing-Thorns.webp',
    'Silversnow': './characters/sanhua/CpzvZz5K-Skill-Silversnow.webp',
  },
  // added 2026-08-18 — previously entirely missing (was falling back to no icon for every Taoqi skill
  // row). Sourced from the wiki's own the wiki Skill_*.png assets, re-hosted on ibb.co (2026-08-19).
  'Taoqi': {
    'Concealed Edge': './characters/_shared/B5n54GNt-Skill-Broadblade.webp', // Basic/Heavy/Mid-air/Dodge Counter — generic Broadblade icon
    'Standard': './characters/_shared/B5n54GNt-Skill-Broadblade.webp',
    'Strategic Parry': './characters/_shared/B5n54GNt-Skill-Broadblade.webp',
    'Fortified Defense': './characters/taoqi/LDMqFSKn-Skill-Fortified-Defense.webp',
    'Unmovable': './characters/taoqi/hJXvfC0F-Skill-Unmovable.webp',
    'Power Shift': './characters/taoqi/Y4dHVS3L-Skill-Power-Shift.webp',
    'Defense Formation': './characters/taoqi/KpkZ63SL-Skill-Defense-Formation.webp',
    'Iron Will': './characters/taoqi/G3bg0S5R-Skill-Iron-Will.webp',
  },
  // added 2026-08-18 — previously entirely missing (was falling back to no icon for every Yuanwu skill
  // row). Sourced from the wiki's own the wiki Skill_*.png assets, re-hosted on ibb.co (2026-08-19).
  // 'Leihuangquan' itself has no dedicated skill icon file on the wiki — it redirects to the generic
  // Gauntlets weapon-type icon.
  'Yuanwu': {
    'Leihuangquan': './characters/_shared/QvdmVfvF-Skill-Gauntlets.webp',
    'Thunder Field': './characters/yuanwu/MK40ZPV-Skill-Leihuang-Master.webp',
    'Thunder Wedge': './characters/yuanwu/MK40ZPV-Skill-Leihuang-Master.webp',
    'Rumbling Spark': './characters/yuanwu/Q7zJbCct-Skill-Unassuming-Blade.webp',
    'Thunder Uprising': './characters/yuanwu/Q7zJbCct-Skill-Unassuming-Blade.webp',
    'Thunderweaver': './characters/yuanwu/Q7zJbCct-Skill-Unassuming-Blade.webp',
    'Blazing Might': './characters/yuanwu/spn2bspQ-Skill-Blazing-Might.webp',
    'Thunder Bombardment': './characters/yuanwu/21ghLjJQ-Skill-Thunder-Bombardment.webp',
    'Lightning Manipulation': './characters/yuanwu/7dB9SgTZ-Skill-Lightning-Manipulation.webp',
  },
  // added 2026-08-18 — previously entirely missing (Mortefi's SKILL_MULTIPLIERS rows had no icon
  // lookup at all). Sourced from the wiki's own the wiki Skill_*.png assets via the
  // MediaWiki API (action=query&titles=File:Skill X.png&prop=imageinfo&iiprop=url). 'Marcato' (the
  // Coordinated ATK hit fired during Burning Rhapsody) has no dedicated icon file on the wiki — it's a
  // sub-effect of Resonance Liberation Violent Finale, so it reuses that icon.
  'Mortefi': {
    'Impromptu Show': './characters/mortefi/FbhQWDHw-Skill-Pistols.webp',
    'Passionate Variation': './characters/mortefi/4ZLkXg3k-Skill-Passionate-Variation.webp',
    'Violent Finale': './characters/mortefi/jXMLr4K-Skill-Violent-Finale.webp',
    'Marcato': './characters/mortefi/jXMLr4K-Skill-Violent-Finale.webp',
    'Fury Fugue': './characters/mortefi/cS6rzxkd-Skill-Fury-Fugue.webp',
    'Dissonance': './characters/mortefi/60NBXg5j-Skill-Dissonance.webp',
    'Rage Transposition': './characters/mortefi/Dfg4cLZs-Skill-Rage-Transposition.webp',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's own the wiki
  // Skill_*.png assets via the MediaWiki API (Forte Details table image thumbnails + a direct
  // action=query&titles=File:Skill_Timeless_Classics.png&prop=imageinfo lookup for the Outro icon, which
  // wasn't inline in the Forte Table's collapsed scaling section). The four Antique Appraisal variants
  // (Chime/Ruyi/Ding/Mask) share Scroll Divination's icon since they're all sub-effects of the same
  // Resonance Skill row on the wiki, with no separate per-variant icon files uploaded.
  'Youhu': {
    'Frosty Punches': './characters/_shared/QvdmVfvF-Skill-Gauntlets.webp',
    'Scroll Divination': './characters/youhu/Z66ZH20V-Skill-Scroll-Divination.webp',
    'Chime': './characters/youhu/Z66ZH20V-Skill-Scroll-Divination.webp',
    'Ruyi': './characters/youhu/Z66ZH20V-Skill-Scroll-Divination.webp',
    'Ding': './characters/youhu/Z66ZH20V-Skill-Scroll-Divination.webp',
    'Mask': './characters/youhu/Z66ZH20V-Skill-Scroll-Divination.webp',
    "Fortune's Favor": './characters/youhu/tT1TmNJ5-Skill-Fortune-s-Favor.webp',
    'Poetic Essence': './characters/youhu/6JDTt2c6-Skill-Poetic-Essence.webp',
    'Scroll of Wonders': './characters/youhu/SX5rWz0L-Skill-Scroll-of-Wonders.webp',
    'Timeless Classics': './characters/youhu/RTxh31Pp-Skill-Timeless-Classics.webp',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's own the wiki
  // Skill_*.png assets via the MediaWiki API (Forte Details table image thumbnails, section=4 of
  // Lumi/Combat). 'Energized' is listed before 'Pounce'/'Rebound' so getSkillIcon's substring match
  // resolves 'Energized Pounce'/'Energized Rebound' (Forte Circuit moves) to Signal Light's icon rather
  // than falling through to the plain Resonance Skill (Searchlight Service) icon.
  'Lumi': {
    'Energized': './characters/lumi/WLVPqHx-Signal-Light.webp',
    'Glare': './characters/lumi/WLVPqHx-Signal-Light.webp',
    'Red Spotlight': './characters/lumi/WLVPqHx-Signal-Light.webp',
    'Laser': './characters/lumi/WLVPqHx-Signal-Light.webp',
    'Pounce': './characters/lumi/FvQP99m-Searchlight-Service.webp',
    'Rebound': './characters/lumi/FvQP99m-Searchlight-Service.webp',
    'Squeakie Express': './characters/lumi/Y7pMmWDX-Squeakie-Express.webp',
    'Yellow Light': './characters/_shared/B5n54GNt-Skill-Broadblade.webp',
    'Red Light': './characters/_shared/B5n54GNt-Skill-Broadblade.webp',
    'Glitter': './characters/_shared/B5n54GNt-Skill-Broadblade.webp',
    'Special Delivery': './characters/lumi/Xxx7gYgj-Skill-Special-Delivery.webp',
    'Escorting': './characters/lumi/N2dQ7Kyg-Skill-Escorting.webp',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's own the wiki
  // Skill_*.png assets via the MediaWiki API (action=query&titles=File:Skill+...&prop=imageinfo, section
  // 3 of Buling/Combat). 'File:Skill Hexagram Calls, Lightning Falls.png' itself resolves (redirects) to
  // the shared generic Skill_Rectifier.png weapon-type icon on the wiki, used here for all her un-enhanced
  // Basic ATK/Heavy Attack/Mid-air Attack moves.
  'Buling': {
    'Hexagram Calls': './characters/buling/rKNB0p6J-Skill-Rectifier.webp',
    'Mid-air Attack': './characters/buling/rKNB0p6J-Skill-Rectifier.webp',
    'Heavy Attack': './characters/buling/rKNB0p6J-Skill-Rectifier.webp',
    'In Shadow Thunder Stirs': './characters/buling/6Jpxh0rV-Skill-In-Shadow-Thunder-Stirs.webp',
    'Five Thunders Spell Array': './characters/buling/6J1q4XqN-Skill-Flashing-Thunder-Spell.webp',
    'Flashing Thunder Spell': './characters/buling/6J1q4XqN-Skill-Flashing-Thunder-Spell.webp',
    'Summon and Smite': './characters/buling/rGpQ3fpb-Skill-Summon-and-Smite.webp',
    'Exorcism Spell': './characters/buling/R4hYk7rh-Skill-Exorcism-Spell.webp',
  },
  // added 2026-08-18 — previously entirely missing (zero SKILL_ICONS coverage for all 4 Rover
  // attunements). Sourced from the wiki's own the wiki Skill_*.png assets via the
  // MediaWiki API (Rover/Combat's tabbed Forte tables, one tab per element). All 4 Rovers share the
  // same generic Skill_Sword.png Basic ATK icon (also covers Heavy ATK/Mid-air/Dodge Counter).
  'Rover: Havoc': {
    'Tuneslayer': './characters/_shared/prZWKCtm-Skill-Sword.webp', // Basic ATK
    'Standard': './characters/_shared/prZWKCtm-Skill-Sword.webp',
    'Wingblade': './characters/rover-havoc/99BT9Qqn-Skill-Wingblade.webp', // Resonance Skill
    'Umbra Eclipse': './characters/rover-havoc/nNpvGF4L-Skill-Umbra-Eclipse.webp', // Forte Circuit
    'Devastation': './characters/rover-havoc/nNpvGF4L-Skill-Umbra-Eclipse.webp', // Forte-gated Heavy Attack that enters Dark Surge, same Forte icon
    'Deadening Abyss': './characters/rover-havoc/bgvHXLqr-Skill-Deadening-Abyss.webp', // Resonance Liberation
    'Umbra: Lifetaker': './characters/rover-havoc/bgvHXLqr-Skill-Deadening-Abyss.webp', // Umbra-state Liberation nuke, same wiki icon
    'Instant of Annihilation': './characters/rover-havoc/chtkVHd2-Skill-Instant-of-Annihilation.webp', // Intro Skill
    'Soundweaver': './characters/rover-havoc/4wsczBtt-Skill-Soundweaver.webp', // Outro Skill
  },
  'Rover: Spectro': {
    'Vibration Manifestation': './characters/_shared/prZWKCtm-Skill-Sword.webp', // Basic ATK
    'Standard': './characters/_shared/prZWKCtm-Skill-Sword.webp',
    'Resonance': './characters/_shared/prZWKCtm-Skill-Sword.webp', // Heavy Attack: Resonance/Aftertune combo timing hits, no dedicated icon — generic weapon icon
    'Aftertune': './characters/_shared/prZWKCtm-Skill-Sword.webp',
    'Resonating Slashes': './characters/rover-spectro/tw4hy1Ck-Skill-Resonating-Slashes.webp', // Resonance Skill
    'Resonating Spin': './characters/rover-spectro/tw4hy1Ck-Skill-Resonating-Slashes.webp', // Forte-Gauge-enhanced Resonance Skill state, same wiki icon
    'Resonating Whirl': './characters/rover-spectro/tw4hy1Ck-Skill-Resonating-Slashes.webp',
    'Resonating Echoes': './characters/rover-spectro/tw4hy1Ck-Skill-Resonating-Slashes.webp',
    'Echoing Orchestra': './characters/rover-spectro/PvNGkhk3-Skill-Echoing-Orchestra.webp', // Resonance Liberation
    'Waveshock': './characters/rover-spectro/CpD7BjSZ-Skill-Waveshock.webp', // Intro Skill
    'Instant': './characters/rover-spectro/hFR6TPbf-Skill-Instant.webp', // Outro Skill
  },
  'Rover: Aero': {
    'Wind Cutter': './characters/_shared/prZWKCtm-Skill-Sword.webp', // Basic ATK
    'Standard': './characters/_shared/prZWKCtm-Skill-Sword.webp',
    'Plunge': './characters/_shared/prZWKCtm-Skill-Sword.webp', // Mid-air Attack plunging attack, no dedicated icon — generic weapon icon
    'Illusion Breaker': './characters/rover-aero/JFC1QjWX-Skill-Illusion-Breaker.webp', // Resonance Skill
    'Awakening Gale': './characters/rover-aero/JFC1QjWX-Skill-Illusion-Breaker.webp', // Resonance Skill's mid-air jump-attack cast, same wiki icon
    'Skyfall Severance': './characters/rover-aero/JFC1QjWX-Skill-Illusion-Breaker.webp', // Resonance Skill's mid-air follow-up cast, same wiki icon
    'Unbound Flow': './characters/rover-aero/JFC1QjWX-Skill-Illusion-Breaker.webp', // max-Windstrings Resonance Skill upgrade, same wiki icon
    'Cycle of Wind': './characters/rover-aero/Q7gm1B2G-Skill-Cycle-of-Wind.webp', // Forte Circuit
    'Cloudburst Dance': './characters/rover-aero/Q7gm1B2G-Skill-Cycle-of-Wind.webp', // Forte Circuit's Mid-air Attack replacement, same wiki icon
    'Omega Storm': './characters/rover-aero/4nCR1X2f-Skill-Omega-Storm.webp', // Resonance Liberation
    'Relentless Squall': './characters/rover-aero/bjqZf19b-Skill-Relentless-Squall.webp', // Intro Skill
    "Storm's Echo": './characters/rover-aero/N69CQqFv-Skill-Storm-s-Echo.webp', // Outro Skill
  },
  'Rover: Electro': {
    'Deterrence': './characters/_shared/prZWKCtm-Skill-Sword.webp', // Basic ATK
    'Standard': './characters/_shared/prZWKCtm-Skill-Sword.webp',
    'Repel': './characters/_shared/prZWKCtm-Skill-Sword.webp', // Basic Attack follow-up after Resonance Skill, no dedicated icon — generic weapon icon
    'Thunderclap': './characters/rover-electro/2YyS74Pn-Skill-Thunderclap.webp', // Resonance Skill
    "Myriad Omens' Mandate": './characters/rover-electro/7NKRhwQH-Skill-Myriad-Omens-Mandate.webp', // Forte Circuit
    'Overshock': './characters/rover-electro/7NKRhwQH-Skill-Myriad-Omens-Mandate.webp', // Forte Circuit's capped-Electric-Surge Skill replacement, same wiki icon
    'Ultimate Tactics': './characters/rover-electro/wNFW43BD-Skill-Ultimate-Tactics.webp', // Resonance Liberation
    'Thunderous Fury': './characters/rover-electro/Kj3cKLdS-Skill-Thunderous-Fury.webp', // Intro Skill
    'Rumbling Thunders': './characters/rover-electro/Zpw7cvMr-Skill-Rumbling-Thunders.webp', // Outro Skill
  },
  // added 2026-08-20 — fills the dead-end logged in the 2026-08-20 (session 4) the content-refresh history (git log) entry.
  // Sourced from the source's SkillIconQingxiao atlas (SP_IconQingxiaoB1/C1/D1/D2/QTE/T/Y.webp),
  // re-hosted on ibb.co. Letter/order convention (B=Basic ATK, C=Resonance Skill, D=Forte Circuit
  // [2 icons for her 2 Forte-state moves], QTE=Resonance Liberation, T=Intro, Y=Outro) matches the
  // pattern the source uses site-wide for every other character's SkillIcon atlas, not just Qingxiao's.
  // Key order fixed 2026-09-04 (full 9-dimension re-audit, fresh dump): getSkillIcon()'s lookup is
  // `Object.keys(table).find(k => skillName.includes(k))` — first-matching-key-in-insertion-order wins.
  // Her real Forte finisher's full name, "Heavy Attack - Heaven's Reckoning: Ephemeral Transcendence",
  // contains BOTH "Ephemeral Transcendence" and "Heaven's Reckoning" as substrings; with 'Ephemeral
  // Transcendence' inserted first (as it was), every Heaven's Reckoning cast silently resolved to the
  // base Forte-Circuit icon instead of its own dedicated Forte-Circuit-Alt icon — the same case-
  // sensitive/order-dependent substring icon-lookup bug class already found for Lupa. Reordered so
  // "Heaven's Reckoning" (the longer, more specific real match) is checked first.
  'Qingxiao': {
    'Stringblade': './characters/qingxiao/vn7cCMT-Skill-Qingxiao-Basic-ATK.webp', // Basic ATK
    'Plunging Attack': './characters/qingxiao/vn7cCMT-Skill-Qingxiao-Basic-ATK.webp',
    'Sword Glide': './characters/qingxiao/vn7cCMT-Skill-Qingxiao-Basic-ATK.webp',
    'Severing Note': './characters/qingxiao/QFfYPWSS-Skill-Qingxiao-Resonance-Skill.webp', // Resonance Skill
    "Heaven's Reckoning": './characters/qingxiao/Y7cXCSsL-Skill-Qingxiao-Forte-Circuit-Alt.webp', // Forte Circuit finisher — checked before 'Ephemeral Transcendence' (see comment above)
    'Ephemeral Transcendence': './characters/qingxiao/Lz6TqkmC-Skill-Qingxiao-Forte-Circuit.webp', // Forte Circuit
    'Billows Beneath Heaven': './characters/qingxiao/jkphKz37-Skill-Qingxiao-Liberation.webp', // Resonance Liberation
    'Tonality Shift': './characters/qingxiao/BHfMMdWL-Skill-Qingxiao-Intro.webp', // Intro Skill
    'Lingering Song': './characters/qingxiao/0jpvcBrL-Skill-Qingxiao-Outro.webp', // Outro Skill
  },
  // added 2026-08-21 (calendar-planner audit for the v3.6-p2 banner, ~2026-09-10) — Jingran had zero
  // skill icons before this entry, unlike Qingxiao who released the same day. Sourced from
  // the source's SkillIconJingran atlas (SP_IconJingranB1/C1/D1/D2/QTE/T/Y.webp), re-hosted on
  // ibb.co. B=dual-stance Basic ATK, C=dual-stance Resonance Skill (incl. the Heavy Attack follow-ups),
  // D1/D2=the two Forte Circuit Heavy Attacks (Soul Raid / Stardome Meander), QTE=Liberation, T=Intro,
  // Y=Outro — same atlas convention as Qingxiao's.
  'Jingran': {
    'Drink Soul': './characters/jingran/3Xs3ZZ7-jingran-skill-B1.webp', // Basic Attack, Yin Vessel stance
    "Devil's Bane": './characters/jingran/3Xs3ZZ7-jingran-skill-B1.webp', // Basic Attack, Yang Font stance
    'Encroaching Yin': './characters/jingran/S4kkG9mR-jingran-skill-C1.webp', // Resonance Skill, Yin Vessel stance
    'Scorching Yang': './characters/jingran/S4kkG9mR-jingran-skill-C1.webp', // Resonance Skill, Yang Font stance
    'Netherworld Traverse': './characters/jingran/S4kkG9mR-jingran-skill-C1.webp', // Resonance Skill Heavy Attack follow-up, Yin
    "Afterlife's Guide": './characters/jingran/S4kkG9mR-jingran-skill-C1.webp', // Resonance Skill Heavy Attack follow-up, Yang
    'Soul Raid': './characters/jingran/N2jbGWjg-jingran-skill-D1.webp', // Forte Circuit Heavy Attack
    'Stardome Meander': './characters/jingran/1Y04vgs7-jingran-skill-D2.webp', // Forte Circuit Heavy Attack (alt)
    'Burial of Thousand Souls': './characters/jingran/Fbfhy5pV-jingran-skill-QTE.webp', // Resonance Liberation
    'Question the Tombs': './characters/jingran/WrW84w9-jingran-skill-T.webp', // Intro Skill
    'Rising Fortune and Ebbing Evil': './characters/jingran/cctRq3Yp-jingran-skill-Y.webp', // Outro Skill
  },
};
const getSkillIcon = (name, skillName) => {
  const table = SKILL_ICONS[name];
  if (!table) return null;
  const key = Object.keys(table).find(k => skillName.includes(k));
  return key ? table[key] : null;
};

// [SECTION:CHAIN_NODE_ICONS] — Per-character S1-S6 Resonance Chain sequence-node icons.
// Source: the wiki Sequence_Node_* image assets (order matches each character's
// Combat page infobox gallery, which lists nodes S1→S6 top to bottom), re-hosted on ibb.co.
// Only characters that have been audited so far are populated.
const CHAIN_NODE_ICONS = {
  'Aalto': {
    s1: './characters/aalto/NkJrMMZ-aalto-s1.webp',
    s2: './characters/aalto/3mWXdcDs-aalto-s2.webp',
    s3: './characters/aalto/tMr4KzDw-aalto-s3.webp',
    s4: './characters/aalto/Hf4q5RKy-aalto-s4.webp',
    s5: './characters/aalto/KMWZb8Q-aalto-s5.webp',
    s6: './characters/aalto/KzcQtD3c-aalto-s6.webp',
  },
  'Baizhi': {
    s1: './characters/baizhi/mF47z129-baizhi-s1.webp',
    s2: './characters/baizhi/0RXgwTXZ-baizhi-s2.webp',
    s3: './characters/baizhi/gb918z7X-baizhi-s3.webp',
    s4: './characters/baizhi/hxg5Y83Q-baizhi-s4.webp',
    s5: './characters/baizhi/Rw5VF1d-baizhi-s5.webp',
    s6: './characters/baizhi/3Q9HWqJ-baizhi-s6.webp',
  },
  'Chixia': {
    s1: './characters/chixia/RGQBc5g3-chixia-s1.webp',
    s2: './characters/chixia/svts4DW5-chixia-s2.webp',
    s3: './characters/chixia/dRDWwbs-chixia-s3.webp',
    s4: './characters/chixia/HThYzvPf-chixia-s4.webp',
    s5: './characters/chixia/KpFQt9N0-chixia-s5.webp',
    s6: './characters/chixia/bg00YYjQ-chixia-s6.webp',
  },
  'Encore': {
    s1: './characters/encore/67jq2qtF-Sequence-Node-Woolys-Fairy-Tale.webp',
    s2: './characters/encore/qvQ1d2y-Sequence-Node-Sheep-counting-Lullaby.webp',
    s3: './characters/encore/607dHq05-Sequence-Node-Fog-The-Black-Shores.webp',
    s4: './characters/encore/wZc99zfT-Sequence-Node-Adventure-Lets-go.webp',
    s5: './characters/encore/ccg6m394-Sequence-Node-Hero-Takes-the-Stage.webp',
    s6: './characters/encore/0RK9HNY8-Sequence-Node-Woolies-Save-the-World.webp',
  },
  'Calcharo': {
    s1: './characters/calcharo/zW1SQbgD-Sequence-Node-Covert-Negotiation.webp',
    s2: './characters/calcharo/0RhbRfYd-Sequence-Node-Zero-Sum-Game.webp',
    s3: './characters/calcharo/F42fkz3h-Sequence-Node-Iron-Fist-Diplomacy.webp',
    s4: './characters/calcharo/hRVPBYSc-Sequence-Node-Dark-Alliance.webp',
    s5: './characters/calcharo/bMhxw2YM-Sequence-Node-Unconventional-Compact.webp',
    s6: './characters/calcharo/WvtpCtrd-Sequence-Node-The-Ultimatum.webp',
  },
  'Yinlin': {
    s1: './characters/yinlin/hFqjmjxt-Sequence-Node-Moralitys-Crossroad.webp',
    s2: './characters/yinlin/x85ZgwFQ-Sequence-Node-Ensnarled-By-Rapport.webp',
    s3: './characters/yinlin/XZFYMQ66-Sequence-Node-Unyielding-Verdict.webp',
    s4: './characters/yinlin/qMBj8Pb1-Sequence-Node-Steadfast-Conviction.webp',
    s5: './characters/yinlin/tPPkZN2W-Sequence-Node-Resounding-Will.webp',
    s6: './characters/yinlin/HfFYQC4C-Sequence-Node-Pursuit-of-Justice.webp',
  },
  'Jiyan': {
    s1: './characters/jiyan/8DQZqf8V-Sequence-Node-Benevolence.webp',
    s2: './characters/jiyan/qYfdjDZj-Sequence-Node-Versatility.webp',
    s3: './characters/jiyan/KpnqFPPK-Sequence-Node-Spectation.webp',
    s4: './characters/jiyan/w3M5q2w-Sequence-Node-Prudence.webp',
    s5: './characters/jiyan/fzZxFxmw-Sequence-Node-Resolution.webp',
    s6: './characters/jiyan/0jYkwNc5-Sequence-Node-Fortitude.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Jianxin, re-hosted on ibb.co
  // (2026-08-17, matching the convention above) — order confirmed S1→S6 against the Chain Table on
  // Jianxin/Combat, all 6 URLs verified 200/live before upload.
  'Jianxin': {
    s1: './characters/jianxin/Cp76tHr7-Sequence-Node-Verdant-Branchlet.webp',
    s2: './characters/jianxin/Z0VXpGV-Sequence-Node-Tao-Seekers-Journey.webp',
    s3: './characters/jianxin/NgdRQB4T-Sequence-Node-Principles-of-Wuwei.webp',
    s4: './characters/jianxin/9HypDDH7-Sequence-Node-Multitide-Reflection.webp',
    s5: './characters/jianxin/DHW1ndcQ-Sequence-Node-Mirroring-Introspection.webp',
    s6: './characters/jianxin/hFH1wK8g-Sequence-Node-Truth-from-Within.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Lingyang, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Chain Table on the source/character/1104, all 6
  // URLs verified 200/live before upload.
  'Lingyang': {
    s1: './characters/lingyang/35qjT11k-Sequence-Node-Lion-of-Light.webp',
    s2: './characters/lingyang/fY1GpNzv-Sequence-Node-Dominant-and-Fierce.webp',
    s3: './characters/lingyang/rR5Sv0w7-Sequence-Node-Jaw-Dropping-Feats.webp',
    s4: './characters/lingyang/Wvr3prmH-Sequence-Node-Immortals-Bow.webp',
    s5: './characters/lingyang/hRYWXtX5-Sequence-Node-Seven-Stars-Shine.webp',
    s6: './characters/lingyang/Z1myY6Sc-Sequence-Node-Demons-Tremble.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Verina, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Chain Table on the source/character/1503, all 6
  // URLs verified 200/live before upload.
  'Verina': {
    s1: './characters/verina/RptDBgXm-Sequence-Node-Moment-of-Emergence.webp',
    s2: './characters/verina/zW0fpNdD-Sequence-Node-Sprouting-Reflections.webp',
    s3: './characters/verina/VWb4ycvt-Sequence-Node-The-Choice-to-Flourish.webp',
    s4: './characters/verina/Hpfb99bt-Sequence-Node-Blossoming-Embrace.webp',
    s5: './characters/verina/xtHvxT1F-Sequence-Node-Miraculous-Blooms.webp',
    s6: './characters/verina/fYjvXxRB-Sequence-Node-Joyous-Harvest.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Jinhsi, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 directly against the Resonance Chain table on Jinhsi/Combat
  // (fetched by section index), all 6 URLs verified 200/live before upload.
  'Jinhsi': {
    s1: './characters/jinhsi/B2ZXj0Vp-Sequence-Node-Abyssal-Ascension.webp',
    s2: './characters/jinhsi/C5bnYtr4-Sequence-Node-Chronofrost-Repose.webp',
    s3: './characters/jinhsi/spYvJ40L-Sequence-Node-Celestial-Incarnate.webp',
    s4: './characters/jinhsi/wFtWBff4-Sequence-Node-Benevolent-Grace.webp',
    s5: './characters/jinhsi/SDksbmM6-Sequence-Node-Frostfire-Illumination.webp',
    s6: './characters/jinhsi/63m9q28-Sequence-Node-Thawing-Triumph.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Changli, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 directly against the Resonance Chain table on Changli/Combat
  // (fetched by section index), all 6 URLs verified 200/live before upload.
  'Changli': {
    s1: './characters/changli/FM07vnf-Sequence-Node-Hidden-Thoughts.webp',
    s2: './characters/changli/XBqhm0L-Sequence-Node-Pursuit-of-Desires.webp',
    s3: './characters/changli/ZzVrnF98-Sequence-Node-Learned-Secrets.webp',
    s4: './characters/changli/MkQV5gT9-Sequence-Node-Polished-Words.webp',
    s5: './characters/changli/39jsTQRB-Sequence-Node-Sacrificed-Gains.webp',
    s6: './characters/changli/wZJn2XcV-Sequence-Node-Realized-Plans.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Zhezhi, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 directly against the Resonance Chain table on Zhezhi/Combat
  // (fetched by section index), all 6 URLs verified 200/live before upload.
  'Zhezhi': {
    s1: './characters/zhezhi/pB0KfwRY-Sequence-Node-Brushworks-Finish.webp',
    s2: './characters/zhezhi/PGNt7fSK-Sequence-Node-Vivid-Strokes.webp',
    s3: './characters/zhezhi/b5zxp1S9-Sequence-Node-Reflections-Grace.webp',
    s4: './characters/zhezhi/jZbWXLGX-Sequence-Node-Hues-Spectrum.webp',
    s5: './characters/zhezhi/8gCVrMWV-Sequence-Node-Compositions-Clue.webp',
    s6: './characters/zhezhi/MDqdsTLR-Sequence-Node-Infinite-Legacy.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Xiangli Yao, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live build
  // page and the source/character/1305, all 6 URLs verified 200/live before upload.
  'Xiangli Yao': {
    s1: './characters/xiangli-yao/zHRQ6hSs-node-s1-prodigy.webp',
    s2: './characters/xiangli-yao/DDWBkrdQ-node-s2-traces.webp',
    s3: './characters/xiangli-yao/0RyGcG7t-node-s3-ruins.webp',
    s4: './characters/xiangli-yao/fzP6KpqR-node-s4-vessel.webp',
    s5: './characters/xiangli-yao/DPTYYfnj-node-s5-end.webp',
    s6: './characters/xiangli-yao/bg0ffhj0-node-s6-solace.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Shorekeeper, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1505, all 6 URLs verified 200/live before upload.
  'Shorekeeper': {
    s1: './characters/shorekeeper/mrNGMGDz-node-s1-unspoken.webp',
    s2: './characters/shorekeeper/1fsfvs1s-node-s2-nightsgift.webp',
    s3: './characters/shorekeeper/PZkV3FHz-node-s3-infinity.webp',
    s4: './characters/shorekeeper/V00QHX4H-node-s4-overflowing.webp',
    s5: './characters/shorekeeper/S4R3jKr6-node-s5-echoes.webp',
    s6: './characters/shorekeeper/d45HxqB9-node-s6-newworld.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Camellya, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1603, all 6 URLs verified 200/live before upload.
  'Camellya': {
    s1: './characters/camellya/vy9wwMt-node-s1-somewhere.webp',
    s2: './characters/camellya/ZprdWSNF-node-s2-callingupon.webp',
    s3: './characters/camellya/gZDgkrSv-node-s3-budadorned.webp',
    s4: './characters/camellya/mm8Yz1g-node-s4-rootsset.webp',
    s5: './characters/camellya/yFZ91RMt-node-s5-infinityheld.webp',
    s6: './characters/camellya/FbpkkPqC-node-s6-bloomfor.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Carlotta, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1107, all 6 URLs verified 200/live before upload.
  'Carlotta': {
    s1: './characters/carlotta/1GCPHM5j-node-s1-beauty.webp',
    s2: './characters/carlotta/1YD00C0c-node-s2-fallen.webp',
    s3: './characters/carlotta/CK20vW27-node-s3-adelante.webp',
    s4: './characters/carlotta/DDVdry80-node-s4-yesterdays.webp',
    s5: './characters/carlotta/tPpvpmFC-node-s5-toast.webp',
    s6: './characters/carlotta/Kx65J6sT-node-s6-curtain.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Roccia, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1606, all 6 URLs verified 200/live before upload.
  'Roccia': {
    s1: './characters/roccia/q3QR4dS0-node-s1-shadows.webp',
    s2: './characters/roccia/VWZG28Xy-node-s2-luceanite.webp',
    s3: './characters/roccia/GfR6DwXb-node-s3-heart.webp',
    s4: './characters/roccia/7Jy9x2yr-node-s4-wonders.webp',
    s5: './characters/roccia/BHYrDMBc-node-s5-dreams.webp',
    s6: './characters/roccia/3yGZ0kCy-node-s6-goldenwings.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Phoebe, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1506, all 6 URLs verified 200/live before upload.
  'Phoebe': {
    s1: './characters/phoebe/TqtQJ6NK-node-s1-warmlight.webp',
    s2: './characters/phoebe/k245MwKF-node-s2-boatadrift.webp',
    s3: './characters/phoebe/8DLvhqMz-node-s3-daisy.webp',
    s4: './characters/phoebe/8gfbj5t1-node-s4-ringingbells.webp',
    s5: './characters/phoebe/HDfvkYsV-node-s5-prayer.webp',
    s6: './characters/phoebe/HT7qsxPx-node-s6-whispering.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Brant, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1206, all 6 URLs verified 200/live before upload.
  'Brant': {
    s1: './characters/brant/Y4GdsDmY-node-s1-currentswinds.webp',
    s2: './characters/brant/gkF07br-node-s2-smilescheers.webp',
    s3: './characters/brant/Y49jmcXH-node-s3-stormsisail.webp',
    s4: './characters/brant/Fb56p7DW-node-s4-freedomising.webp',
    s5: './characters/brant/chfPWLFw-node-s5-actorsstage.webp',
    s6: './characters/brant/xnDJCdF-node-s6-captainscarnevale.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Cantarella, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1607, all 6 URLs verified 200/live before upload.
  'Cantarella': {
    s1: './characters/cantarella/0RDfQXSY-node-s1-embracewaves.webp',
    s2: './characters/cantarella/LXfVYCkX-node-s2-surrenderreverie.webp',
    s3: './characters/cantarella/hxxmdVSb-node-s3-gazeabyss.webp',
    s4: './characters/cantarella/PZhy4tmF-node-s4-beholdsoul.webp',
    s5: './characters/cantarella/0g4C5hH-node-s5-restreflection.webp',
    s6: './characters/cantarella/KxGNqZtQ-node-s6-falldream.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Zani, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1507, all 6 URLs verified 200/live before upload.
  'Zani': {
    s1: './characters/zani/gbN5SWFV-node-s1-alarmclock.webp',
    s2: './characters/zani/N25LYLMp-node-s2-stalebread.webp',
    s3: './characters/zani/6kDrsB0-node-s3-newcommute.webp',
    s4: './characters/zani/nsWMbP51-node-s4-efficiency.webp',
    s5: './characters/zani/tpwvvSMk-node-s5-delivered.webp',
    s6: './characters/zani/Q3vpqhCQ-node-s6-clockout.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Ciaccona, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1407, all 6 URLs verified 200/live before upload.
  'Ciaccona': {
    s1: './characters/ciaccona/M4Jpwcj-node-s1-wherewindsings.webp',
    s2: './characters/ciaccona/xtVFFs9Y-node-s2-songfourseasons.webp',
    s3: './characters/ciaccona/W4dYrWRZ-node-s3-starlitimprov.webp',
    s4: './characters/ciaccona/XxMdXrfV-node-s4-toccatafugue.webp',
    s5: './characters/ciaccona/4n8DXGQZ-node-s5-eternalidyll.webp',
    s6: './characters/ciaccona/8gp4zwSF-node-s6-unendingcadence.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Cartethyia, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1409, all 6 URLs verified 200/live before upload.
  'Cartethyia': {
    s1: './characters/cartethyia/0yZrwg1M-node-s1-crowndestined.webp',
    s2: './characters/cartethyia/99w78Rv3-node-s2-bladebroken.webp',
    s3: './characters/cartethyia/BRNk023-node-s3-prisonerhanged.webp',
    s4: './characters/cartethyia/vxL2nJYQ-node-s4-sacrificemade.webp',
    s5: './characters/cartethyia/4wX7vYgB-node-s5-hopereshaped.webp',
    s6: './characters/cartethyia/ycVQfbhB-node-s6-freedomfound.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Lupa, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1207, all 6 URLs verified 200/live before upload.
  'Lupa': {
    s1: './characters/lupa/QFQ1RhRB-node-s1-beholdnameless.webp',
    s2: './characters/lupa/9H67hH9f-node-s2-everyground.webp',
    s3: './characters/lupa/9kyL2xf3-node-s3-wolflamehowls.webp',
    s4: './characters/lupa/23DMbTHn-node-s4-highandaflame.webp',
    s5: './characters/lupa/99p0trjM-node-s5-embracethunderous.webp',
    s6: './characters/lupa/MT1mRss-node-s6-brightestflaming.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Phrolova, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain table on both the source's live
  // build page and the source/character/1608, all 6 URLs verified 200/live before upload.
  'Phrolova': {
    s1: './characters/phrolova/KpvxFB70-node-s1-keytonetherworld.webp',
    s2: './characters/phrolova/8nw8Sy8L-node-s2-ropetiedtolife.webp',
    s3: './characters/phrolova/TBSCHsv0-node-s3-daggercutclean.webp',
    s4: './characters/phrolova/JwDPJhkf-node-s4-torchilluminating.webp',
    s5: './characters/phrolova/1f1yj3zj-node-s5-forkedroad.webp',
    s6: './characters/phrolova/dStZKfy-node-s6-nighttodepart.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Augusta, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain list on the source's live build page.
  'Augusta': {
    s1: './characters/augusta/HTwqDr5n-node-s1.webp',
    s2: './characters/augusta/DHWH8D47-node-s2.webp',
    s3: './characters/augusta/QwdPnbk-node-s3.webp',
    s4: './characters/augusta/mCrQsqH3-node-s4.webp',
    s5: './characters/augusta/ccxMpt1c-node-s5.webp',
    s6: './characters/augusta/cKP8919X-node-s6.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Iuno, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain list on the character's the wiki page.
  'Iuno': {
    s1: './characters/iuno/kWsh4y7-node-s1.webp',
    s2: './characters/iuno/QRQmjWq-node-s2.webp',
    s3: './characters/iuno/v6f4N31z-node-s3.webp',
    s4: './characters/iuno/k2ZxwPWd-node-s4.webp',
    s5: './characters/iuno/604PG1hL-node-s5.webp',
    s6: './characters/iuno/67Frp4bF-node-s6.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Galbrena, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain list on the character's the wiki page.
  'Galbrena': {
    s1: './characters/galbrena/jNH3nSM-node-s1.webp',
    s2: './characters/galbrena/2VQC6y5-node-s2.webp',
    s3: './characters/galbrena/Hpf7ZPdk-node-s3.webp',
    s4: './characters/galbrena/q3p3wPfG-node-s4.webp',
    s5: './characters/galbrena/0VRF3CBL-node-s5.webp',
    s6: './characters/galbrena/gb17vj3m-node-s6.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Qiuyuan, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain list on the character's the wiki page.
  'Qiuyuan': {
    s1: './characters/qiuyuan/84TqFSG3-node-s1.webp',
    s2: './characters/qiuyuan/qLkrYVXv-node-s2.webp',
    s3: './characters/qiuyuan/whd9Dwmz-node-s3.webp',
    s4: './characters/qiuyuan/Fqk0VQJq-node-s4.webp',
    s5: './characters/qiuyuan/0RBWxffy-node-s5.webp',
    s6: './characters/qiuyuan/LdNkcSqg-node-s6.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Chisa, re-hosted on ibb.co
  // (2026-08-17) — order confirmed S1→S6 against the Resonance Chain list on the character's the wiki page.
  'Chisa': {
    s1: './characters/chisa/3mw4Nw94-node-s1.webp',
    s2: './characters/chisa/nN9MKSTV-node-s2.webp',
    s3: './characters/chisa/1fX8724w-node-s3.webp',
    s4: './characters/chisa/zHZY0j4p-node-s4.webp',
    s5: './characters/chisa/GffX5Qbj-node-s5.webp',
    s6: './characters/chisa/1S0brGY-node-s6.webp',
  },
  // Source: the wiki Sequence_Node_*.png assets for Lynae/Mornye/Aemeath, pulled via the
  // MediaWiki API (bypasses the site's Cloudflare challenge entirely) and re-hosted on ibb.co (2026-08-17)
  // — order confirmed S1→S6 against each character's own Resonance Chain section (action=parse, section
  // "Resonance Chain", Node 1→Node 6 in document order).
  'Lynae': {
    s1: './characters/lynae/jKpHS2C-Lynae-s1.webp',
    s2: './characters/lynae/kjCkrdC-Lynae-s2.webp',
    s3: './characters/lynae/TBB7SWd9-Lynae-s3.webp',
    s4: './characters/lynae/XZ0yd3HN-Lynae-s4.webp',
    s5: './characters/lynae/23k6X01r-Lynae-s5.webp',
    s6: './characters/lynae/wNpcWSrY-Lynae-s6.webp',
  },
  'Mornye': {
    s1: './characters/mornye/5hVnMMTV-Mornye-s1.webp',
    s2: './characters/mornye/Kzr4mvfw-Mornye-s2.webp',
    s3: './characters/mornye/KBrzbMX-Mornye-s3.webp',
    s4: './characters/mornye/Kp4VY4tn-Mornye-s4.webp',
    s5: './characters/mornye/zV1QDk59-Mornye-s5.webp',
    s6: './characters/mornye/DDCxvJfC-Mornye-s6.webp',
  },
  'Aemeath': {
    s1: './characters/aemeath/WNfdHqR4-Aemeath-s1.webp',
    s2: './characters/aemeath/b5SXdtzk-Aemeath-s2.webp',
    s3: './characters/aemeath/MygKfXVn-Aemeath-chain-s3.webp',
    s4: './characters/aemeath/mVwt8H0s-Aemeath-s4.webp',
    s5: './characters/aemeath/dwK7K9m7-Aemeath-s5.webp',
    s6: './characters/aemeath/wFsPszFL-Aemeath-chain-s6.webp',
  },
  'Luuk Herssen': {
    s1: './characters/luuk-herssen/xtbnWHrb-Luuk-chain-s1.webp',
    s2: './characters/luuk-herssen/hF2MW2bF-Luuk-chain-s2.webp',
    s3: './characters/luuk-herssen/2X8CFmL-Luuk-chain-s3.webp',
    s4: './characters/luuk-herssen/JF8kcKvm-Luuk-chain-s4.webp',
    s5: './characters/luuk-herssen/1tXKZntb-Luuk-chain-s5.webp',
    s6: './characters/luuk-herssen/svXR1Hkf-Luuk-chain-s6.webp',
  },
  'Sigrika': {
    s1: './characters/sigrika/jv6R8NVL-Sigrika-chain-s1.webp',
    s2: './characters/sigrika/nyJ4qGz-Sigrika-chain-s2.webp',
    s3: './characters/sigrika/tMYNB071-Sigrika-chain-s3.webp',
    s4: './characters/sigrika/mCj31gfL-Sigrika-chain-s4.webp',
    s5: './characters/sigrika/9H04pcpv-Sigrika-chain-s5.webp',
    s6: './characters/sigrika/9kG4hxbd-Sigrika-chain-s6.webp',
  },
  'Hiyuki': {
    s1: './characters/hiyuki/cK3XdXtT-Hiyuki-chain-s1.webp',
    s2: './characters/hiyuki/tMGFBF2R-Hiyuki-chain-s2.webp',
    s3: './characters/hiyuki/Rmcwhym-Hiyuki-chain-s3.webp',
    s4: './characters/hiyuki/4RpdTpjM-Hiyuki-chain-s4.webp',
    s5: './characters/hiyuki/4ZdSWbXC-Hiyuki-chain-s5.webp',
    s6: './characters/hiyuki/VP72Z2V-Hiyuki-chain-s6.webp',
  },
  'Denia': {
    s1: './characters/denia/dwDTRNpm-denia-s1.webp',
    s2: './characters/denia/v4KYCSjk-denia-s2.webp',
    s3: './characters/denia/SXYXMvNR-denia-s3.webp',
    s4: './characters/denia/tTjNYQZD-denia-s4.webp',
    s5: './characters/denia/gZBNkHMH-denia-s5.webp',
    s6: './characters/denia/Zz5XhZzj-denia-s6.webp',
  },
  'Yangyang: Xuanling': {
    s1: './characters/yangyang-xuanling/93ZS4rdV-yx-s1.webp',
    s2: './characters/yangyang-xuanling/ksZDCX9W-yx-s2.webp',
    s3: './characters/yangyang-xuanling/XrMxyjcG-yx-s3.webp',
    s4: './characters/yangyang-xuanling/KpQnZkWY-yx-s4.webp',
    s5: './characters/yangyang-xuanling/6KDh2KB-yx-s5.webp',
    s6: './characters/yangyang-xuanling/TD3gkgcb-yx-s6.webp',
  },
  'Suisui': {
    s1: './characters/suisui/1YF19wXw-suisui-s1.webp',
    s2: './characters/suisui/7d5F5ZtZ-suisui-s2.webp',
    s3: './characters/suisui/JFGC6Dq2-suisui-s3.webp',
    s4: './characters/suisui/DDMC0F52-suisui-s4.webp',
    s5: './characters/suisui/vMRL5cr-suisui-s5.webp',
    s6: './characters/suisui/tM5fJd43-suisui-s6.webp',
  },
  // Lucy/Rebecca (2026-08-17): NOT populated — verified via direct MediaWiki titles queries
  // (action=query&titles=File:Sequence Node <exact S1-S6 node name>.png for all 18 node names across
  // all three characters) that the wiki has not uploaded Sequence Node icon assets
  // for either of them yet (their own Chain Table template renders an empty icon column on both
  // /Combat pages — a genuine wiki content gap for these June-2026-release characters, not a fetch
  // failure). Node NAMES are still populated below in CHAIN_NODE_NAMES since the modal renders names
  // independently of icons; add icons here once the wiki uploads them.
  // Lucilla added 2026-08-21: the wiki still has no Sequence Node icons for her, but the source's
  // rendered character page (the source/character/1109) references the real datamined game assets
  // directly — the source/assets/ww/UIResources/Common/Image/IconDevice/T_IconDevice_LuoselaM1-6_UI.webp
  // ("Luosela" = Lucilla's internal CN codename) — fetched and re-hosted on imgbb 2026-08-21.
  'Lucilla': {
    s1: './characters/lucilla/x8g5ZyBV-lucilla-chain-s1.webp',
    s2: './characters/lucilla/JjZqqVyJ-lucilla-chain-s2.webp',
    s3: './characters/lucilla/NghnCyVj-lucilla-chain-s3.webp',
    s4: './characters/lucilla/FbHZ9dmQ-lucilla-chain-s4.webp',
    s5: './characters/lucilla/vv4kf7XL-lucilla-chain-s5.webp',
    s6: './characters/lucilla/6JXB03hR-lucilla-chain-s6.webp',
  },
  // Jingran added 2026-08-21 (calendar-planner audit for the v3.6-p2 banner, ~2026-09-10): same
  // the source datamine source as Lucilla — the source/.../IconDevice/T_IconDevice_JingranM1-6_UI.webp,
  // re-hosted on imgbb. the wiki has no Sequence Node uploads for him yet either (expected, pre-banner).
  'Jingran': {
    s1: './characters/jingran/DH7pqgVK-jingran-chain-s1.webp',
    s2: './characters/jingran/7xQdnkRG-jingran-chain-s2.webp',
    s3: './characters/jingran/KxHTkhd1-jingran-chain-s3.webp',
    s4: './characters/jingran/zHb7QLvy-jingran-chain-s4.webp',
    s5: './characters/jingran/cX6rbZV6-jingran-chain-s5.webp',
    s6: './characters/jingran/rGv9DbkF-jingran-chain-s6.webp',
  },
  // Danjin/Yangyang/Sanhua added 2026-08-18: the wiki DOES have these Sequence_Node_*.png assets
  // uploaded (unlike the June-2026 characters above) — fetched directly via the MediaWiki API
  // (action=query&titles=File:Sequence Node <exact S1-S6 node name>.png&prop=imageinfo) and linked
  // the wiki's the wiki Skill_*.png assets, re-hosted on ibb.co (2026-08-19). This closes the gap the
  // earlier audit pass missed (only CHAIN_NODE_NAMES was filled in, not the icon table).
  'Danjin': {
    s1: './characters/danjin/5g9W42c0-Sequence-Node-Crimson-Heart-of-Justice.webp',
    s2: './characters/danjin/rfZX4JF7-Sequence-Node-Dusted-Mirror.webp',
    s3: './characters/danjin/dJjdp5Vh-Sequence-Node-Fleeting-Blossom.webp',
    s4: './characters/danjin/B2zYPj4s-Sequence-Node-Solitary-Carnation.webp',
    s5: './characters/danjin/4Z1rKbqK-Sequence-Node-Reigning-Blade.webp',
    s6: './characters/danjin/7P4QXyb-Sequence-Node-Bloodied-Jade.webp',
  },
  'Yangyang': {
    s1: './characters/yangyang/B2X82K7q-Sequence-Node-Sapphire-Skies-Soaring-Sparrows.webp',
    s2: './characters/yangyang/4ZLLwpmg-Sequence-Node-Nesting-Twigs-in-Beaks-They-Harrow.webp',
    s3: './characters/yangyang/S49SrGRq-Sequence-Node-Nature-Sings-in-Symphony.webp',
    s4: './characters/yangyang/36xqPN5-Sequence-Node-Close-Your-Eyes-and-Listen-in.webp',
    s5: './characters/yangyang/LdSxmYwN-Sequence-Node-Winds-Whisper-in-Harmony.webp',
    s6: './characters/yangyang/RTtYL5yC-Sequence-Node-A-Tribute-to-Life-s-Sweet-Hymn.webp',
  },
  'Sanhua': {
    s1: './characters/sanhua/KjhFTRrx-Sequence-Node-Solitude-s-Embrace.webp',
    s2: './characters/sanhua/9kxR0b3Y-Sequence-Node-Snowy-Clarity.webp',
    s3: './characters/sanhua/gcZgcdD-Sequence-Node-Anomalous-Vision.webp',
    s4: './characters/sanhua/hR4K48ZD-Sequence-Node-Blade-Mastery.webp',
    s5: './characters/sanhua/7Nj6QGLK-Sequence-Node-Unraveling-Fate.webp',
    s6: './characters/sanhua/CsBNd2c9-Sequence-Node-Daybreak-Radiance.webp',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's own the wiki
  // Sequence_Node_*.png assets via the MediaWiki API (action=query&titles=Taoqi/Combat&prop=images).
  'Taoqi': {
    s1: './characters/taoqi/SXh4R3Vq-Sequence-Node-Essense-of-Tranquility.webp',
    s2: './characters/taoqi/m5XCTx1C-Sequence-Node-Silent-Strength.webp',
    s3: './characters/taoqi/9kJGkmL6-Sequence-Node-Keen-eyed-Observer.webp',
    s4: './characters/taoqi/9kWbx8fb-Sequence-Node-Heavylifting-Duty.webp',
    s5: './characters/taoqi/DPqM6zwH-Sequence-Node-Benevolent-Guardian.webp',
    s6: './characters/taoqi/5XzTbxBV-Sequence-Node-Defender-of-Peace.webp',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's own the wiki
  // Sequence_Node_*.png assets via the MediaWiki API (action=query&titles=Yuanwu/Combat&prop=images).
  'Yuanwu': {
    s1: './characters/yuanwu/ycfKwWWG-Sequence-Node-Steaming-Cup-of-Justice.webp',
    s2: './characters/yuanwu/B20h0wfN-Sequence-Node-Fierce-Heart-Serene-Mind.webp',
    s3: './characters/yuanwu/S4PSJrpp-Sequence-Node-Upholder-of-Integrity.webp',
    s4: './characters/yuanwu/wrCs8zvG-Sequence-Node-Retributive-Knuckles.webp',
    s5: './characters/yuanwu/ZpNBLSt6-Sequence-Node-Neighborhood-Protector.webp',
    s6: './characters/yuanwu/nGN7G1z-Sequence-Node-Defender-of-All-Realms.webp',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's own the wiki
  // Sequence_Node_*.png assets via the MediaWiki API (action=query&titles=Mortefi/Combat&prop=images).
  'Mortefi': {
    s1: './characters/mortefi/s9ygxXYL-Sequence-Node-Solitary-Etude.webp',
    s2: './characters/mortefi/Z64664sR-Sequence-Node-Hypocritical-Hymn.webp',
    s3: './characters/mortefi/qLXh8L9K-Sequence-Node-Flaming-Recitativo.webp',
    s4: './characters/mortefi/99G1xJHS-Sequence-Node-Cathartic-Waltz.webp',
    s5: './characters/mortefi/yF2s64FP-Sequence-Node-Funerary-Quartet.webp',
    s6: './characters/mortefi/dspC2MzV-Sequence-Node-Apoplectic-Instrumental.webp',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's own the wiki
  // Sequence_Node_*.png assets via the MediaWiki API (action=parse&page=Youhu/Combat&prop=text&section=9).
  'Youhu': {
    s1: './characters/youhu/cX15STLS-Sequence-Node-Waterside-Respite.webp',
    s2: './characters/youhu/840rck5k-Sequence-Node-Sunroom-Siesta.webp',
    s3: './characters/youhu/GvrkqwV3-Sequence-Node-Restless-Sleep.webp',
    s4: './characters/youhu/2745M8Dv-Sequence-Node-Frosted-Lullaby.webp',
    s5: './characters/youhu/nqjLTh0J-Sequence-Node-Dreamland-Meander.webp',
    s6: './characters/youhu/qLYPfdcj-Sequence-Node-Slumber-Evermore.webp',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's own the wiki
  // Sequence_Node_*.png assets via the MediaWiki API (action=parse&page=Lumi/Combat&prop=text&section=9).
  'Lumi': {
    s1: './characters/lumi/TqHQ8XjX-Sequence-Node-Parcel-To-Be-Delivered.webp',
    s2: './characters/lumi/fVcQnMDm-Sequence-Node-Lollo-Logistics-Ready-to-Help.webp',
    s3: './characters/lumi/vNfCcYX-Sequence-Node-Priority-Parcel-In-Transit.webp',
    s4: './characters/lumi/LGscd4x-Sequence-Node-Captain-Lumi-At-Your-Service.webp',
    s5: './characters/lumi/bgzPXf0f-Sequence-Node-Parcel-Collected-On-Time.webp',
    s6: './characters/lumi/5XyLn8f0-Sequence-Node-Give-Me-A-Five-star-Rating.webp',
  },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's own the wiki
  // Sequence_Node_*.png assets via the MediaWiki API (action=query&titles=File:Sequence+Node+...&prop=
  // imageinfo, from Buling/Combat's image list).
  'Buling': {
    s1: './characters/buling/Nd55rsFn-Sequence-Node-Exorcist-Gadgets-Lend-Me-Your-Power.webp',
    s2: './characters/buling/v4b7KSnp-Sequence-Node-Talisman-Burns-Spirits-Turn.webp',
    s3: './characters/buling/BVdbprg6-Sequence-Node-Summoner-of-Spirits-Seeker-of-Fate.webp',
    s4: './characters/buling/fYLSNdB2-Sequence-Node-Wanderer-of-Solaris-Blessed-by-Fortune.webp',
    s5: './characters/buling/NdSwppx6-Sequence-Node-Forum-Ban-New-Account.webp',
    s6: './characters/buling/bRH5Fycd-Sequence-Node-Almighty-Forum-Lord-of-Thunder-Spell.webp',
  },
  // added 2026-08-20 — fills the dead-end logged in the 2026-08-20 (session 4) the content-refresh history (git log) entry.
  // the wiki still has zero Sequence_Node_*/Skill_* uploads for Qingxiao, but DV's JS-capable web_fetch
  // recovered this session and rendered the source/character/1413 directly; its network requests
  // exposed the game's own the source CDN asset paths (SkillIcon/SkillIconQingxiao/SP_IconQingxiao*
  // and Image/IconDevice/T_IconDevice_QingxiaoM1-6_UI), fetched with a browser UA + referer (no JS
  // challenge on the CDN itself), then re-hosted on ibb.co per this file's convention. R.Chain order
  // (M1-M6) matches the game's own s1-s6 sequence-node numbering used in CHAIN_NODE_NAMES above.
  'Qingxiao': {
    s1: './characters/qingxiao/yn2fQNNY-qingxiao-s1.webp',
    s2: './characters/qingxiao/pj1TDk2Z-qingxiao-s2.webp',
    s3: './characters/qingxiao/SXYD4cPD-qingxiao-s3.webp',
    s4: './characters/qingxiao/q30vSXqr-qingxiao-s4.webp',
    s5: './characters/qingxiao/1t4yB6YJ-qingxiao-s5.webp',
    s6: './characters/qingxiao/cGpCS76-qingxiao-s6.webp',
  },
};

// [SECTION:CHAIN_NODE_NAMES] — Per-character S1-S6 Resonance Chain sequence-node names
// (e.g. "Benevolence", "Versatility"...), confirmed against the source's character JSON
// (the source/ww/<version>/en/character/<id>.json) and the wiki.
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
  // Yangyang's real node names corrected 2026-08-18: the source's Kit tab shows only generic "Sequence
  // Node 1"-"Sequence Node 6" labels, but the wiki's Yangyang/Combat page (Resonance Chain table +
  // Sequence_Node_*.png filenames) does have unique flavor names — the source just doesn't surface them.
  'Yangyang': { s1: 'Sapphire Skies, Soaring Sparrows', s2: 'Nesting Twigs, in Beaks They Harrow', s3: 'Nature Sings in Symphony', s4: 'Close Your Eyes and Listen in', s5: 'Winds Whisper in Harmony', s6: "A Tribute to Life's Sweet Hymn" },
  // Sanhua's node names confirmed 2026-08-18 via the wiki's own infobox image filenames
  // (Sequence Node <name>.png assets, S1-S6 in order).
  'Sanhua': { s1: "Solitude's Embrace", s2: 'Snowy Clarity', s3: 'Anomalous Vision', s4: 'Blade Mastery', s5: 'Unraveling Fate', s6: 'Daybreak Radiance' },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's Taoqi/Combat Resonance Chain table.
  'Taoqi': { s1: 'Essense of Tranquility', s2: 'Silent Strength', s3: 'Keen-eyed Observer', s4: 'Heavylifting Duty', s5: 'Benevolent Guardian', s6: 'Defender of Peace' },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's Yuanwu/Combat Resonance Chain table.
  'Yuanwu': { s1: 'Steaming Cup of Justice', s2: 'Fierce Heart, Serene Mind', s3: 'Upholder of Integrity', s4: 'Retributive Knuckles', s5: 'Neighborhood Protector', s6: 'Defender of All Realms' },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's Mortefi/Combat Resonance Chain table.
  'Mortefi': { s1: 'Solitary Etude', s2: 'Hypocritical Hymn', s3: 'Flaming Recitativo', s4: 'Cathartic Waltz', s5: 'Funerary Quartet', s6: 'Apoplectic Instrumental' },
  // added 2026-08-18 — previously entirely missing.
  'Youhu': { s1: 'Waterside Respite', s2: 'Sunroom Siesta', s3: 'Restless Sleep', s4: 'Frosted Lullaby', s5: 'Dreamland Meander', s6: 'Slumber Evermore' },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's Lumi/Combat Resonance Chain table.
  'Lumi': { s1: 'Parcel To Be Delivered', s2: 'Lollo Logistics, Ready to Help', s3: 'Priority Parcel In Transit', s4: 'Captain Lumi, At Your Service', s5: 'Parcel Collected On Time', s6: 'Give Me A Five-star Rating' },
  // added 2026-08-18 — previously entirely missing. Sourced from the wiki's Buling/Combat Resonance Chain table.
  'Buling': { s1: 'Exorcist Gadgets, Lend Me Your Power', s2: 'Talisman Burns, Spirits Turn', s3: 'Summoner of Spirits, Seeker of Fate', s4: 'Wanderer of Solaris, Blessed by Fortune', s5: 'Forum Ban? New Account!', s6: '"Almighty Forum Lord of Thunder Spell"' },
  // Danjin's node names added 2026-08-18 via the wiki's Danjin/Combat page (Resonance
  // Chain table + Sequence_Node_*.png filenames) — was previously missing entirely.
  'Danjin': { s1: 'Crimson Heart of Justice', s2: 'Dusted Mirror', s3: 'Fleeting Blossom', s4: 'Solitary Carnation', s5: 'Reigning Blade', s6: 'Bloodied Jade' },
  'Suisui': { s1: 'Mountains Washed Into Paintings', s2: 'Clouds Pour Like Molten Gold', s3: 'Sparse Curtains Invite Evening Glow', s4: 'Autumn Mountains in Choir Sing', s5: 'I Long To Ride The Eastern Wind', s6: 'Staying True To This Splendid Realm' },
  // Qingxiao's node names confirmed 2026-08-18 via the source's pre-release datamine (character/1413)
  // — icons NOT populated in CHAIN_NODE_ICONS above: the wiki has no Sequence Node assets uploaded yet
  // (verified via direct MediaWiki titles queries, all "missing"), a genuine pre-release gap 2 days
  // ahead of her release, not a fetch failure.
  'Qingxiao': { s1: 'Like Clouds That Meet and Drift Apart', s2: 'Like Petals That Fall Without a Sound', s3: 'Dreams Fade, Sword Abides', s4: 'Wherever the Road Leads, Side by Side', s5: 'Cold Steel That Longs to Warm the Snow', s6: 'Cleanse This Tarnished Age, Till All Runs Clear' },
  // Jingran's node names confirmed 2026-08-20 via the source (character/1212, now live with v3.6) —
  // the wiki's own page still has no Sequence Node table populated ("Jingran doesn't have any Sequence
  // Nodes yet"), so the source is the sole source here, same as Qingxiao's pre-release pass.
  'Jingran': { s1: 'Yin and Yang in Harmony, the Ultimate Law of Being', s2: 'A Solitary Lantern, Across Lands Shade-Trodden', s3: "World's Course Shifts, Each to Their Rightful Paths", s4: 'Where Reality Meets Illusion, Where Living Meet Dead', s5: 'Ends Return to Beginnings, Truth of Life Laid Bare', s6: 'As Favors and Feuds Fade, New Stories Await' },
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
  // 3.3 (verified against the source's official character order 2026-08-14)
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

// [SECTION:LOCALIZATION] — locale-aware overlay for characters.fr.js.
// English data above is the single source of truth; this merges in
// translated `desc` bio text only, keyed by the same character names.
import { CHARACTER_DESC_FR, CHARACTER_TITLE_FR, CHAR_BUFF_NOTE_FR, CHARACTER_ROTATION_NOTE_FR, CHAIN_NODE_NAMES_FR } from './characters.fr.js';

/** @param {string} locale */
export function getLocalizedCharacterData(locale) {
  if (locale !== 'fr') return CHARACTER_DATA;
  const out = {};
  for (const [name, base] of Object.entries(CHARACTER_DATA)) {
    const fr = CHARACTER_DESC_FR[name];
    const title = CHARACTER_TITLE_FR[name];
    out[name] = { ...base, ...(fr ? { desc: fr } : {}), ...(title ? { title } : {}) };
  }
  return out;
}

// CHAR_BUFF_TABLE's `note` field is display-only prose (rendered in
// CharacterDetailModal.jsx). stat/target/duration/condition are NOT touched:
// `condition` is parsed by calcEngine.js's elemBuffApplies() via a
// case-insensitive substring match against element names — translating it
// would silently break elemental conditional buff application.
export function getLocalizedCharBuffTable(locale) {
  if (locale !== 'fr') return CHAR_BUFF_TABLE;
  const out = {};
  for (const [name, base] of Object.entries(CHAR_BUFF_TABLE)) {
    const note = CHAR_BUFF_NOTE_FR[name];
    out[name] = note ? { ...base, note } : base;
  }
  return out;
}

// CHAIN_NODE_NAMES: per-character S1-S6 Resonance Chain sequence-node titles,
// display-only (rendered in CharacterDetailModal.jsx's Resonance Chain grid).
export function getLocalizedChainNodeNames(locale) {
  if (locale !== 'fr') return CHAIN_NODE_NAMES;
  const out = {};
  for (const [name, base] of Object.entries(CHAIN_NODE_NAMES)) {
    const fr = CHAIN_NODE_NAMES_FR[name];
    out[name] = fr || base;
  }
  return out;
}

// Single source of truth for resolving one CHARACTER_ROTATIONS step against its
// SKILL_MULTIPLIERS row — replaces the inline `n.includes(step.skill)` lookup that used to be
// duplicated at each call site (CharacterDetailModal.jsx). That fuzzy substring match is fragile
// by construction: it silently resolves to undefined (rendered as "no DMG shown", and previously
// mistaken for 0 DMG bugs) instead of erroring when a rotation step's `skill` string doesn't
// actually appear inside any row name for that character — the exact bug class PHASE2_PLAN.md
// tracks as "the zero-damage rotation-step bug class" and multiple prior audits (Roccia, Jiyan,
// Yinlin, and others — see this file's own historical comments near each fix) had to catch by
// hand, one character at a time. This function doesn't remove the substring fallback (SKILL_
// MULTIPLIERS rows don't carry a stable `id` field to exact-match against yet — see PHASE2_PLAN.md
// backlog item 4 for that larger, not-yet-done migration), but it does two things a future data
// edit couldn't get wrong silently anymore: (1) tries an EXACT type+name match first, only falling
// back to substring if no exact match exists, and (2) in dev builds, warns to the console whenever
// a step's `skill` finds no row at all (the actual silent-zero failure mode) OR only resolves via
// the fuzzy fallback (a naming mismatch that happens to still work, worth tightening). See
// __tests__/data-integrity.test.js's "every CHARACTER_ROTATIONS step resolves to a SKILL_
// MULTIPLIERS row" test, which now runs this exact lookup against the full roster in CI so this bug
// class can't reappear unnoticed the way it did before.
export function findSkillMultiplierRow(charName, step) {
  const rows = SKILL_MULTIPLIERS[charName] || [];
  const exact = rows.find(([t, n]) => t === step.type && n === step.skill);
  if (exact) return exact;
  const fuzzy = rows.find(([t, n]) => t === step.type && n.includes(step.skill));
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    if (!fuzzy) {
      console.warn(`[SKILL_MULTIPLIERS] ${charName}: rotation step "${step.type}: ${step.skill}" matched NO row (silent zero-DMG bug class) — check the step's skill string against SKILL_MULTIPLIERS['${charName}'].`);
    } else {
      console.warn(`[SKILL_MULTIPLIERS] ${charName}: rotation step "${step.type}: ${step.skill}" only substring-matched row "${fuzzy[1]}" (no exact match) — consider tightening the step's skill string.`);
    }
  }
  return fuzzy;
}

// CHARACTER_ROTATIONS' `note` field is display-only prose (rendered in
// RotationGuideCard.jsx). `type`/`skill` are NOT touched: they're matched
// against SKILL_MULTIPLIERS via substring lookup at render time.
export function getLocalizedCharacterRotations(locale) {
  if (locale !== 'fr') return CHARACTER_ROTATIONS;
  const out = {};
  for (const [name, steps] of Object.entries(CHARACTER_ROTATIONS)) {
    const notesFr = CHARACTER_ROTATION_NOTE_FR[name];
    out[name] = notesFr ? steps.map((step, i) => (notesFr[i] ? { ...step, note: notesFr[i] } : step)) : steps;
  }
  return out;
}

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
