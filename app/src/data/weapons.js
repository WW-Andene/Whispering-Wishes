// @ts-check
// Weapon data — extracted from appcore-data.js for maintainability
// Edit this file to add/update weapons without touching the main data file

// corrected 2026-08-18 (Aalto/Baizhi/Chixia audit): several weaponAlts entries pointed at weapons whose bestFor
// arrays didn't actually name the character, breaking the CharacterDetailModal's weapon-tag cross-check — The Last
// Dance (Aalto/Chixia signature), Woodland Aria (Aalto alt5), Relativistic Jet/Undying Flame (Aalto alt4),
// Call of the Abyss (Baizhi alt4), and Pistols of Night (Chixia alt3) were missing their bestFor tags; added.
/** @type {Record<string, import('../types.js').WeaponData>} */
const WEAPON_DATA = {
  // 5★ Weapons
  // v3.4/3.5 signature weapons — baseAtk/substat/passive re-verified against nanoka.cc's live weapon
  // pages (Lv.90 stats, R1 passive text) on 2026-08-14, replacing this session's earlier per-archetype
  // convention guesses, which turned out wrong on both the stat values and the passive effects.
  'Skull Thrasher': { rarity: 5, type: 'Pistols', stat: 'Crit DMG', baseAtk: 500, subStatValue: '+72.0%',
    desc: "Rebecca signature (\"Wakeful Loner\"). Casting Intro Skill grants self Basic ATK DMG Bonus; inflicting Hack - Shifting grants self Basic ATK DMG Bonus plus a team-wide ATK buff.",
    passive: 'ATK +12%. Intro Skill: self Basic ATK DMG +24% (14s). Hack - Shifting: self Basic ATK DMG +12% (14s), team ATK +24% (30s). Same-name effects don\'t stack.',
    pv: { atkPct: 12, basicDmg: 24 }, bestFor: ['Rebecca'],
    ascensionMaterials: { forgery: 'Combustor', common: 'Exoswarm Pendant' } },
  'Freeze Frame': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Lucilla signature ("Light\'s Offering"). Inflicting Glacio Chafe grants self Glacio DMG Bonus and a team-wide ATK buff.',
    passive: 'ATK +12%. After inflicting Glacio Chafe: self Glacio DMG +30% (12s), team ATK +24% (30s). Same-name effects can\'t stack.',
    pv: { atkPct: 12, elemDmg: 30 }, bestFor: ['Lucilla', 'Zhezhi'],
    ascensionMaterials: { forgery: 'String', common: 'Exoswarm Core' } },
  'Spectral Trigger': { rarity: 5, type: 'Pistols', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: "Lucy signature (\"Sunken Dream\"). Resonance Skill grants stacking self Spectro DMG Bonus; Hack - Shifting grants self Heavy ATK DMG Amplification and DEF Ignore.",
    passive: 'ATK +12%. Resonance Skill: self Spectro DMG +20% (14s, up to 2 stacks). Hack - Shifting: self Heavy ATK DMG +30%, DEF Ignore +10% (14s).',
    pv: { atkPct: 12, elemDmg: 20, heavyDmg: 30, defIgnore: 10 }, bestFor: ['Lucy'],
    ascensionMaterials: { forgery: 'Combustor', common: 'Exoswarm Pendant' } },
  'Azure Oath': { rarity: 5, type: 'Sword', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: "Yangyang: Xuanling signature (\"Unbending\"). Inflicting Havoc Bane grants self Heavy ATK DMG Amplification and DEF Ignore.",
    passive: 'All-Attribute DMG +12%. After inflicting Havoc Bane: self Heavy ATK DMG +36%, DEF Ignore +12% (8s).',
    pv: { allDmg: 12, heavyDmg: 36, defIgnore: 12 }, bestFor: ['Yangyang: Xuanling', 'Rover'],
    ascensionMaterials: { forgery: 'Polarizer', common: 'Mech Core' } },
  'Frostburn': { rarity: 5, type: 'Sword', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Hiyuki signature ("Self No More"). Applying Glacio Chafe amplifies self Glacio DMG and Liberation DEF Ignore, plus an AoE Glacio Chafe DMG amplification while on-field.',
    passive: 'ATK +12%. After applying Glacio Chafe: self Glacio DMG +28%, Resonance Liberation DEF Ignore +10%. While on-field: nearby Glacio Chafe DMG +20% (6s, up to 1x/0.1s). Strongest same-name effect applies.',
    pv: { atkPct: 12, elemDmg: 28, defIgnore: 10 }, bestFor: ['Hiyuki'],
    ascensionMaterials: { forgery: 'Polarizer', common: 'Mech Core' } },
  'Forged Dwarf Star': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+36.0%',
    desc: "Denia signature (\"Dissolution\"). Inflicting Fusion Burst/Tune Strain grants self Liberation DMG Bonus, extending to a team-wide ATK buff for further Fusion Burst/Tune Strain triggers.",
    passive: 'ATK +12%. After inflicting Fusion Burst/Tune Strain: self Resonance Liberation DMG +36% (5s); during that window, team members inflicting Fusion Burst/Tune Strain gain ATK +24% (15s). Same-name effects can\'t stack.',
    pv: { atkPct: 12, libDmg: 36 }, bestFor: ['Denia'],
    ascensionMaterials: { forgery: 'String', common: 'Exoswarm Core' } },
  // v3.6 — real ATK/substat pulled from nanoka.cc's live weapon page (Lv.90)
  'Thousandfold Deliverance': { rarity: 5, type: 'Broadblade', stat: 'HP', baseAtk: 412, subStatValue: '+72.2%',
    desc: "Jingran signature (\"Hark, Spirits and Stars\"). Casting Intro Skill or gaining a Shield builds stacking self Crit DMG and Heavy ATK DEF Ignore, fitting his Shield-focused HP-scaling kit.",
    passive: 'All-Attribute DMG +12%. Intro Skill or gaining a Shield: self Crit DMG +4% (up to 6 stacks/24%; at 6 stacks, Heavy ATK Crit Rate +12%). Casting Heavy Attack consumes up to 2 stacks for Heavy ATK DEF Ignore +15% each (up to 30%, 2s).',
    pv: { allDmg: 12, critDmg: 24, defIgnore: 30 }, bestFor: ['Jingran'],
    ascensionMaterials: { forgery: 'Carved Crystal', common: 'Exoswarm Pendant' } },
  'Glint of Clouds': { rarity: 5, type: 'Sword', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+36.0%',
    desc: "Qingxiao signature. Jade blade wreathed in mist and cloud. Stacking Aero DMG Bonus on inflicting Tune Strain - Shifting, ignoring DEF at max stacks.",
    passive: 'ATK +12%. Inflicting Tune Strain - Shifting grants 11.2% Aero DMG Bonus (2s, stacks ×5, 0.5s ICD); at max stacks, duration extends to 30s and Aero DMG ignores 10% DEF',
    pv: { atkPct: 12, elemDmg: 56, defIgnore: 10 }, bestFor: ['Qingxiao'],
    ascensionMaterials: { forgery: 'Polarizer', common: 'Mech Core' } },
  // v3.5 — real ATK/substat pulled from nanoka.cc's live weapon page (Lv.90)
  "Firstlight's Herald": { rarity: 5, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 412, subStatValue: '+77.0%',
    desc: "Suisui signature. Dawn-forged rectifier etched with the divine bird's legend. Grants Max HP and Liberation energy regen, culminating in a team ATK buff.",
    passive: 'Max HP +12%. Liberation restores 8 Concerto Energy (20s ICD). Inflicting Glacio Chafe + applying healing while on-field grants the next Outro both effects (6s); with both active, team ATK +20%',
    pv: { atkPct: 20 }, bestFor: ['Suisui', 'Shorekeeper'],
    ascensionMaterials: { forgery: 'String', common: 'Exoswarm Core' } },
  // corrected 2026-08-18 (5★ audit): passive was a fabricated "ATK/DMG-type" description that didn't match
  // nanoka.cc's actual R1 effect (Swordsworn) at all — real effect is an Attr DMG Bonus baseline plus a
  // Heavy ATK DMG stack gained from Intro Skill/Liberation, not "Heavy Attack hits grant Skill DMG".
  'Verdant Summit': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Jiyan signature. Verdant blade that commands the wind. Intro Skill/Liberation stack Heavy ATK DMG.',
    passive: 'Swordsworn: Attr DMG +12%. Intro Skill/Liberation → self Heavy ATK DMG +24% (stacks x2, 14s)', pv: { elemDmg: 12, heavyDmg: 48 }, bestFor: ['Jiyan', 'Calcharo', 'Jinhsi', 'Lumi'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  // corrected 2026-08-18: this and the next four "Standard 5★" (Stormy Resolution) weapons all share the
  // same base effect (Energy Regen +12.8%) plus a unique secondary effect; the file previously had unrelated
  // fabricated passives (wrong stat entirely, wrong numbers, or wrong trigger conditions) for all five.
  'Lustrous Razor': { rarity: 5, type: 'Broadblade', stat: 'ATK%', baseAtk: 587, subStatValue: '+36.4%',
    desc: 'Standard 5★. Razor honed to a lustrous edge. Energy Regen with stacking Liberation DMG on Skill use.',
    passive: 'Stormy Resolution: Energy Regen +12.8%. Resonance Skill → self Resonance Liberation DMG +7% (stacks x3, 12s)', pv: { libDmg: 21 }, bestFor: ['Calcharo', 'Jiyan', 'Jinhsi', 'Lumi'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Emerald of Genesis': { rarity: 5, type: 'Sword', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Standard 5★. Jade-forged sword of ancient origin. Energy Regen with stacking ATK buff on Skill use.',
    passive: 'Stormy Resolution: Energy Regen +12.8%. Resonance Skill → self ATK +6% (stacks x2, 10s)', pv: { atkPct: 12 }, bestFor: ['Danjin', 'Yangyang', 'Sanhua', 'Rover', 'Changli'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Static Mist': { rarity: 5, type: 'Pistols', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Standard 5★. Pistols wreathed in lingering mist. Energy Regen with ATK buff for the Resonator swapped in after Outro.',
    passive: 'Stormy Resolution: Energy Regen +12.8%. Outro Skill → incoming Resonator ATK +10% (14s)', pv: { atkPct: 10 }, bestFor: ['Mortefi', 'Aalto'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Abyss Surges': { rarity: 5, type: 'Gauntlets', stat: 'ATK%', baseAtk: 587, subStatValue: '+36.4%',
    desc: 'Standard 5★. Gauntlets surging with abyssal power. Energy Regen with Basic/Skill DMG cross-buffs.',
    passive: 'Stormy Resolution: Energy Regen +12.8%. Resonance Skill hit → self Basic ATK DMG +10% (8s). Basic Attack hit → self Resonance Skill DMG +10% (8s)', pv: { basicDmg: 10, skillDmg: 10 }, bestFor: ['Jianxin', 'Lingyang', 'Xiangli Yao', 'Yuanwu', 'Youhu'], // Yuanwu tag added 2026-08-18: Prydwen's Best Weapons list ranks this as his top free/standard-5★ pick (85.01%, "one of the top Gauntlets options... he's free!"). Youhu tag added 2026-08-18: this is her own signature weapon (bestWeapon in CHARACTER_DATA), ranked #3 on Prydwen's Best Weapons for her.
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Cosmic Ripples': { rarity: 5, type: 'Rectifier', stat: 'ATK%', baseAtk: 500, subStatValue: '+54.0%',
    desc: 'Standard 5★. Rectifier resonating with cosmic ripples. Energy Regen with stacking Basic ATK DMG buff on hit.',
    passive: 'Stormy Resolution: Energy Regen +12.8%. Basic ATK DMG → self Basic ATK DMG +3.2% (stacks x5, 8s, 0.5s ICD)', pv: { basicDmg: 16 }, bestFor: ['Encore', 'Verina', 'Yinlin', 'Zhezhi', 'Shorekeeper', 'Buling'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  // corrected 2026-08-18: passive was fabricated (wrong effect name and mechanic — real effect is
  // "Electric Amplification", an Attr DMG Bonus baseline plus a stacking self/off-field ATK buff from
  // Resonance Skill DMG, not a flat Skill DMG/Crit Rate boost).
  'Stringmaster': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+36.0%',
    desc: 'Yinlin signature. Strings that orchestrate fate itself. Attr DMG with stacking ATK on Skill DMG.',
    passive: 'Electric Amplification: Attr DMG +12%. Resonance Skill DMG → self ATK +12% (stacks x2, 5s). Off-field: additional ATK +12%', pv: { elemDmg: 12, atkPct: 24 }, bestFor: ['Yinlin', 'Buling'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Ages of Harvest': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Jinhsi signature. Blade forged from ages of harvest and resolve. Attr DMG + dual Skill DMG marks.',
    passive: 'Attr DMG +12%, Intro/Skill → Res. Skill DMG +24% each (stacks)', pv: { elemDmg: 12, skillDmg: 48 }, bestFor: ['Jinhsi', 'Jiyan', 'Calcharo', 'Lumi'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  // corrected 2026-08-18 (5★ audit): passive was fabricated (wrong effect name "Crimson Phoenix" and
  // mechanic — real effect is a flat ATK Bonus baseline plus a Searing Feather stack system that boosts
  // Resonance Skill DMG, not "Fusion DMG +12%, Resonance Skill +24%").
  'Blazing Brilliance': { rarity: 5, type: 'Sword', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Changli signature. Sword ablaze with undying brilliance. ATK with stacking Resonance Skill DMG.',
    // 'Yangyang' added 2026-08-18: Prydwen's Build tab ranks this her #1 weapon (102.39%) despite being
    // Changli's signature — usable on any Sword user with heavy Resonance Skill DMG, listed as her
    // primary alt5 alongside the more widely-obtainable standard Emerald of Genesis (bestWeapon).
    // 'Sanhua' added 2026-08-18: Prydwen's Build tab ranks this her #1 weapon overall (108.39%),
    // making it her bestWeapon despite also being Changli's signature.
    passive: 'Crimson Phoenix: ATK +12%. Dealing DMG → 1 Searing Feather stack (0.5s ICD); Resonance Skill → 5 stacks. Each stack: self Resonance Skill DMG +4% (max x14/+56%; resets 12s after reaching cap)', pv: { atkPct: 12, skillDmg: 56 }, bestFor: ['Changli', 'Rover', 'Yangyang', 'Sanhua'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  // corrected 2026-08-18 (5★ audit): passive was fabricated (wrong effect name "Panorama" and mechanic —
  // real effect is a flat ATK baseline plus an on-field Basic ATK DMG stack from Resonance Skill, consumed
  // by Outro Skill to carry the buff off-field; not "Off-field DMG +24%, Glacio DMG +12%").
  'Rime-Draped Sprouts': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG', baseAtk: 500, subStatValue: '+72.0%',
    desc: 'Zhezhi signature. Frost-kissed sprouts that bloom in stillness. Basic ATK DMG buff carried off-field via Outro.',
    passive: 'Panorama: ATK +12%. On-field: Resonance Skill → self Basic ATK DMG +12% (stacks x3, 6s). At 3 stacks, Outro Skill consumes them → Basic ATK DMG +52% for 27s (works off-field)', pv: { atkPct: 12, basicDmg: 52 }, bestFor: ['Zhezhi', 'Yinlin', 'Buling'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  // corrected 2026-08-18: passive was fabricated (wrong effect name "Ad Veritatem" and mechanic — real
  // effect is an Attr DMG Bonus baseline plus an extendable Resonance Liberation DMG buff, not "Electro
  // DMG +12%, Mech form +24%" — Verity's Handle has no Mech-form-specific text in game).
  "Verity's Handle": { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: "Xiangli Yao signature. Handle that unlocks the truth of verity. Attr DMG with extendable Liberation DMG buff.",
    passive: "Ad Veritatem: Attr DMG +12%. Liberation → self Resonance Liberation DMG +48% (8s), extended +5s per Skill cast (up to 3 times)", pv: { elemDmg: 12, libDmg: 48 }, bestFor: ['Xiangli Yao', 'Jianxin'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  // corrected 2026-08-18: passive was missing its Concerto Energy restore clause (Liberation → 8 Concerto
  // Energy, 1x/20s) alongside the already-correct HP/team ATK-on-heal numbers.
  'Stellar Symphony': { rarity: 5, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 412, subStatValue: '+77.0%',
    desc: 'Shorekeeper signature. Symphony echoing across the stellar sea. HP buff, Concerto restore, team ATK on heal.',
    passive: 'Astral Evolvement: HP +12%. Liberation restores 8 Concerto Energy (1x/20s). Healing Skill → team ATK +14% for 30s', pv: { hpPct: 12 }, tv: { atkPct: 14, duration: 30 }, bestFor: ['Shorekeeper', 'Verina'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Red Spring': { rarity: 5, type: 'Sword', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Camellya signature. Crimson blade blooming like a red spring flower. ATK buff with stacking Basic ATK DMG.',
    // 'Sanhua' added 2026-08-18: Prydwen's Build tab ranks this her #2 weapon (103.32%), a strong
    // Basic ATK-focused alt5 alongside Blazing Brilliance.
    passive: 'ATK +12%, Basic ATK DMG +10% per stack (max x3), +40% Basic DMG on Concerto consumed', pv: { atkPct: 12, basicDmg: 50 }, bestFor: ['Camellya', 'Rover', 'Changli', 'Sanhua'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'The Last Dance': { rarity: 5, type: 'Pistols', stat: 'Crit DMG', baseAtk: 500, subStatValue: '+72.0%',
    desc: 'Carlotta signature. Elegant pistols for one final, perfect dance. ATK buff with Res. Skill DMG on Intro/Lib.',
    passive: 'ATK +12%, Intro/Lib → Res. Skill DMG +48% for 5s', pv: { atkPct: 12, skillDmg: 48 }, bestFor: ['Carlotta', 'Aalto', 'Chixia', 'Mortefi'], // Mortefi tag added 2026-08-18: Prydwen's Best Weapons list ranks this his #1 option at 106.12%, ahead of his own signature Static Mist
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  // corrected 2026-08-18 (5★ audit): passive was fabricated — no "team ATK" or "Outro Skill DMG" buff
  // exists on this weapon; real effect (Fool's Warble) is a flat ATK baseline plus a self Heavy ATK DMG
  // buff from Basic Attack/Intro Skill. Also dropped the fabricated tv (there's no team-wide buff here).
  'Tragicomedy': { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Roccia signature. Gauntlets born of comedy and tragedy entwined. ATK with stacking Heavy ATK DMG.',
    passive: "Fool's Warble: ATK +12%. Basic Attack/Intro Skill → self Heavy ATK DMG +48% (3s)", pv: { atkPct: 12, heavyDmg: 48 }, bestFor: ['Roccia', 'Lingyang', 'Xiangli Yao'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  // corrected 2026-08-18: passive was fabricated ("Card skills" isn't a real WuWa mechanic) — real effect
  // (Homebuilder's Anthem) is an ATK baseline plus a Spectro-Frazzle-triggered Basic/Heavy ATK DMG stack,
  // and an Outro Skill Spectro Frazzle DMG amplification.
  'Luminous Hymn': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+36.0%',
    desc: 'Phoebe signature. Rectifier crowned in holy light. ATK with stacking Basic/Heavy ATK DMG on Frazzle DMG.',
    passive: "Homebuilder's Anthem: ATK +12%. DMG to Spectro Frazzle targets → self Basic & Heavy ATK DMG +14% (stacks x3, 6s). Outro Skill → Spectro Frazzle DMG Amp +30% (30s) around active Resonator", pv: { atkPct: 12, basicDmg: 42, heavyDmg: 42 }, bestFor: ['Phoebe', 'Buling'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  // corrected 2026-08-18: passive was fabricated ("ATK speed" isn't a real WuWa stat) — real effect
  // (Laughter Prevails) is a Crit Rate baseline plus Basic ATK DMG buffs from Liberation and from Basic
  // Attacks themselves, not "Fusion DMG +12%, ATK speed +10%".
  'Unflickering Valor': { rarity: 5, type: 'Sword', stat: 'Energy Regen', baseAtk: 412, subStatValue: '+77.0%',
    desc: 'Brant signature. Sword of unflickering valor and burning resolve. Crit Rate with stacking Basic ATK DMG.',
    passive: 'Laughter Prevails: Crit Rate +8%. Liberation → self Basic ATK DMG +24% (10s). Basic ATK DMG → self Basic ATK DMG +24% (4s)', pv: { critRate: 8, basicDmg: 24 }, bestFor: ['Brant'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  // corrected 2026-08-18 (5★ audit): passive was fabricated — real effect (From the Deep) is an ATK
  // baseline plus a post-Intro/Basic Echo Skill window that grants a Basic ATK DMG buff at 1 stack and a
  // Havoc RES ignore at 2 stacks; not a flat "Havoc DMG +12%, Off-field +24%".
  'Whispers of Sirens': { rarity: 5, type: 'Rectifier', stat: 'Crit DMG', baseAtk: 500, subStatValue: '+72.0%',
    desc: 'Cantarella signature. Rectifier whispering siren songs of ruin. ATK with Echo Skill-triggered Basic ATK DMG and Havoc RES ignore.',
    passive: 'From the Deep: ATK +12%. Echo Skill within 10s of Intro Skill/Basic Attack → Gentle Dream stack (max x2, 1x/10s trigger). At 1 stack: self Basic ATK DMG +40%. At 2 stacks: ignores 12% Havoc RES', pv: { atkPct: 12, basicDmg: 40, resShred: 12 }, bestFor: ['Cantarella'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  // corrected 2026-08-18: the extra "+24%" ATK and DEF Ignore value were wrong — real effect (Darkness
  // Breaker) is just the flat ATK baseline plus DEF Ignore +8% (not +16%) and the Frazzle Amp on Basic Attack.
  'Blazing Justice': { rarity: 5, type: 'Gauntlets', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Zani signature. Gauntlets blazing with righteous justice. Boosts ATK with DEF Ignore and Frazzle Amp.',
    passive: 'Darkness Breaker: ATK +12%. Basic Attack → DEF Ignore +8%, Spectro Frazzle DMG Amp +50% (6s, retrigger resets duration)', pv: { atkPct: 12, defIgnore: 8 }, bestFor: ['Zani'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  // corrected 2026-08-18: RES shred value was wrong (real is -10%, not -16%) and the trigger condition/
  // durations were imprecise.
  'Woodland Aria': { rarity: 5, type: 'Pistols', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+36.0%',
    desc: 'Ciaccona signature. Pistols singing a woodland aria of wind and leaves. Boosts Aero DMG with RES shred.',
    passive: 'Lingering Summer Tune: ATK +12%. Inflicting Aero Erosion → self Aero DMG +24% (10s). Hitting Aero-Eroded targets → Aero RES -10% (20s)', pv: { atkPct: 12, elemDmg: 24, resShred: 10 }, bestFor: ['Ciaccona', 'Aalto'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  // corrected 2026-08-18: passive was fabricated — HP bonus is 12% not 24%, DEF Ignore is 8% not 16% and
  // applies unconditionally (within a window after Intro/Basic), and the Aero-Erosion condition actually
  // triggers a separate "DMG taken Amplified +20%" effect, not the DEF Ignore.
  "Defier's Thorn": { rarity: 5, type: 'Sword', stat: 'HP%', baseAtk: 412, subStatValue: '+72.2%',
    desc: 'Cartethyia signature. Thorned sword of a defiant heart. HP scaling with DEF Ignore and Aero Erosion DMG Amp.',
    passive: "A Free Knight's Tarantella: HP +12%. Within 15s of Intro Skill/Basic Attack: DEF Ignore +8%. Targets with ≥1 Aero Erosion stack take +20% DMG", pv: { hpPct: 12, defIgnore: 8 }, bestFor: ['Cartethyia'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Wildfire Mark': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Lupa signature. Broadblade marked by wildfire and fury. Boosts Liberation DMG with team Fusion buff.',
    passive: 'ATK +12%, Res. Liberation DMG +24%, team Fusion DMG +24%', pv: { atkPct: 12, libDmg: 24 }, tv: { elemDmg: 24, duration: 99 }, bestFor: ['Lupa'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  // corrected 2026-08-18 (5★ audit): passive was fabricated — no team-wide buff exists on this weapon
  // (real effect, Underworld Requiem, is entirely self-target); dropped the fabricated tv and replaced
  // with the actual post-Echo-Skill Resonance Skill DMG/Echo Skill DMG/DEF Ignore buffs.
  'Lethean Elegy': { rarity: 5, type: 'Rectifier', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Phrolova signature. Rectifier weaving an elegy of forgotten sorrows. ATK with Echo Skill-triggered self buffs.',
    passive: 'Underworld Requiem: ATK +12%. Within 12s of Echo Skill DMG: self Resonance Skill DMG +32%, Echo Skill DMG +32%, DEF Ignore +8%', pv: { atkPct: 12, skillDmg: 32, echoDmg: 32, defIgnore: 8 }, bestFor: ['Phrolova', 'Buling'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  // corrected 2026-08-18: passive was fabricated — real effect (Thunderblaze Eminence) is an ATK baseline
  // plus a Heavy ATK DMG buff from Intro/Skill and a stacking DEF Ignore from gaining Shields; the file's
  // "Electro DMG +12%, Heavy ATK +24%" numbers/mechanic didn't match at all.
  'Thunderflare Dominion': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate', baseAtk: 675, subStatValue: '+12.2%',
    desc: 'Augusta signature. Broadblade crackling with thunderflare dominion. ATK with Heavy ATK DMG and Shield-triggered DEF Ignore.',
    passive: 'Thunderblaze Eminence: ATK +12%. Intro Skill/Resonance Skill → self Heavy ATK DMG +20% (15s). Gaining a Shield → Heavy ATK DMG ignores 7.2% DEF (stacks x5, 7s, 0.5s ICD)', pv: { atkPct: 12, heavyDmg: 20, defIgnore: 36 }, bestFor: ['Augusta'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  // corrected 2026-08-18 (5★ audit): "Time skills" isn't a real WuWa mechanic — real effect (Plenilune
  // Radiance) is an ATK baseline plus a Liberation DMG buff from Intro/Liberation and a stacking DEF Ignore
  // from gaining Shields (same structure as Thunderflare Dominion, applied to Liberation instead of Heavy ATK).
  "Moongazer's Sigil": { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+36.0%',
    desc: 'Iuno signature. Gauntlets bearing the sigil of moonlit prophecy. ATK with Liberation DMG and Shield-triggered DEF Ignore.',
    passive: 'Plenilune Radiance: ATK +12%. Intro Skill/Liberation → self Resonance Liberation DMG +20% (15s). Gaining a Shield → Liberation DMG ignores 7.2% DEF (stacks x5, 7s, 0.5s ICD; Intro Skill maxes stacks instantly)', pv: { atkPct: 12, libDmg: 20, defIgnore: 36 }, bestFor: ['Iuno', 'Jianxin', 'Lingyang'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  // corrected 2026-08-18: passive was fabricated — real effect (To Fire She Returns) is an ATK baseline
  // plus a cross-buff between Echo Skill DMG and Heavy Attack DMG, capped by a shared DEF Ignore when both
  // are active; not "Fusion DMG +12%, Liberation +24%".
  'Lux & Umbra': { rarity: 5, type: 'Pistols', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Galbrena signature. Twin pistols of light and shadow entwined. ATK with Echo Skill/Heavy ATK DMG cross-buff.',
    passive: 'To Fire She Returns: ATK +12%. Echo Skill DMG → self Heavy ATK DMG +24% (6s). Heavy ATK DMG → self Echo Skill DMG +24% (6s). Both active: DEF Ignore +8%', pv: { atkPct: 12, heavyDmg: 24, echoDmg: 24, defIgnore: 8 }, bestFor: ['Galbrena'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  // corrected 2026-08-18: passive was fabricated — real effect (When A Heart Settles) is an ATK baseline
  // plus a Heavy ATK DMG stack from post-Intro/Basic Echo Skill casts, and a team Echo Skill DMG buff from
  // Intro Skill; not "Aero DMG +12%, Skill +24%".
  'Emerald Sentence': { rarity: 5, type: 'Sword', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Qiuyuan signature. Jade sword passing an emerald sentence on the unjust. ATK with Echo Skill-triggered Heavy ATK DMG and team Echo Skill buff.',
    // corrected 2026-09-02 against a fresh Prydwen dump: the Echo Skill-triggered stack (Bamboo Cleaver)
    // grants +30% Heavy ATK DMG Bonus per stack (up to 2 stacks = 60%, 12s duration, 10s retrigger cooldown)
    // — was wrongly entered as +12% per stack (pv.heavyDmg: 24 for the 2-stack total instead of 60), likely
    // confused with the flat +12% ATK passive listed just before it in the same sentence.
    passive: 'When A Heart Settles: ATK +12%. Echo Skill within 10s of Intro Skill/Basic Attack → self Heavy ATK DMG +30% (stacks x2, 12s, 10s trigger interval). Intro Skill → team Echo Skill DMG +20% (30s)', pv: { atkPct: 12, heavyDmg: 60 }, tv: { echoDmg: 20, duration: 30 }, bestFor: ['Qiuyuan'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  // corrected 2026-08-18 (5★ audit): Liberation DMG was a flat +24%; real effect (Thread of Fate) grants
  // it as +8% per stack up to 3 stacks (same 24% max, but stacking, not flat) — clarified for accuracy.
  'Kumokiri': { rarity: 5, type: 'Broadblade', stat: 'Crit Rate', baseAtk: 500, subStatValue: '+36.0%',
    desc: 'Chisa signature. Mist-veiled blade that severs fog and fate alike. Boosts Liberation and All-Type DMG.',
    passive: 'Thread of Fate: ATK +12%. Intro Skill/inflicting Negative Status → self Resonance Liberation DMG +8% (stacks x3, 15s). At max stacks, team inflicting Negative Status → All-Attribute DMG +24% (15s)', pv: { atkPct: 12, libDmg: 24, elemDmg: 24 }, bestFor: ['Chisa'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Spectrum Blaster': { rarity: 5, type: 'Pistols', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Lynae signature. Pistols that blast prismatic light across the spectrum. Boosts Basic ATK DMG and stacks team All DMG on Tune Break.',
    passive: 'ATK +12%, self Basic ATK DMG +36% (4s) on Intro/Basic ATK hit, team All DMG +8%/stack ×3 (24% max, 30s) on Tune Rupture/Strain - Shifting during Basic ATK', pv: { atkPct: 12, basicDmg: 36 }, tv: { allDmg: 24, duration: 30 }, bestFor: ['Lynae'],
    ascensionMaterials: { forgery: 'Combustor', common: 'Exoswarm Pendant' } },
  'Starfield Calibrator': { rarity: 5, type: 'Broadblade', stat: 'Energy Regen', baseAtk: 412, subStatValue: '+77.0%',
    desc: 'Mornye signature. Broadblade calibrated to the starfield\'s rhythm. DEF scaling with team Crit DMG buff.',
    passive: 'DEF +16%, Concerto +8 (1x/20s), team Crit DMG +20% (4s) on heal', pv: { defPct: 16 }, tv: { critDmg: 20, duration: 4 }, bestFor: ['Mornye'],
    ascensionMaterials: { forgery: 'Carved Crystal', common: 'Exoswarm Pendant' } },
  'Everbright Polestar': { rarity: 5, type: 'Sword', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Aemeath signature. Sword radiating everbright polestar light. DEF Ignore with Fusion RES Ignore.',
    passive: 'All-Attr DMG +12%, DEF Ignore +32%, Fusion RES Ignore +10%', pv: { elemDmg: 12, defIgnore: 32, resShred: 10 }, bestFor: ['Aemeath'],
    ascensionMaterials: { forgery: 'Polarizer', common: 'Mech Core' } },
  "Daybreaker's Spine": { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Luuk Herssen signature. Gauntlets forged from a daybreaker\'s spine. Boosts Basic ATK and Spectro DMG.',
    passive: 'ATK +12%, Basic ATK DMG Amp +20%, Spectro DMG +20%, DEF Ignore +10%', pv: { atkPct: 12, elemDmg: 20, basicDmg: 20, defIgnore: 10 }, bestFor: ['Luuk Herssen'],
    ascensionMaterials: { forgery: 'Waveworn Shard', common: 'Mech Core' } },
  // Standard 5★ Weapons (Lustrous Tide pool - v3.0)
  // corrected 2026-08-18 (5★ audit): all five "Lustrous Tide" standard-5★ weapons below had fabricated
  // passives (wrong stat baseline and/or wrong trigger condition entirely) — re-sourced from nanoka.cc's
  // raw effect data. Radiance Cleaver/Laser Shearer/Pulsation Bracer share the same base mechanic (bonus
  // DMG on hitting a Tune Strain-Interfered target); Phasic Homogenizer/Boson Astrolabe share theirs
  // (bonus on any team member casting a Tune Break skill).
  'Radiance Cleaver': { rarity: 5, type: 'Broadblade', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Standard 5★. Synth broadblade of concentrated force. ATK with Liberation DMG on Tune Strain-Interfered hits.',
    passive: 'Edge Breaker: ATK +12%. DMG to Tune Strain-Interfered targets → self Resonance Liberation DMG +24% (3s, retrigger resets duration)', pv: { atkPct: 12, libDmg: 24 }, bestFor: ['Broadblade users'],
    ascensionMaterials: { forgery: 'Carved Crystal', common: 'Exoswarm Pendant' } },
  'Laser Shearer': { rarity: 5, type: 'Sword', stat: 'Energy Regen', baseAtk: 587, subStatValue: '+38.9%',
    desc: 'Standard 5★. Synth sword that shears away uncertainty. ATK with Skill DMG on Tune Strain-Interfered hits.',
    passive: 'Signal Catcher: ATK +12%. DMG to Tune Strain-Interfered targets → self Resonance Skill DMG +24% (3s, retrigger resets duration)', pv: { atkPct: 12, skillDmg: 24 }, bestFor: ['Sword users', 'Rover'],
    ascensionMaterials: { forgery: 'Polarizer', common: 'Mech Core' } },
  'Phasic Homogenizer': { rarity: 5, type: 'Pistols', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Standard 5★. Synth pistols of piercing focus. ATK with All-Attribute DMG when a teammate casts a Tune Break skill.',
    passive: 'Insight Bearer: ATK +12%. Team member casts a Tune Break skill → self All-Attribute DMG +20% (14s)', pv: { atkPct: 12, allDmg: 20 }, bestFor: ['Pistol users'],
    ascensionMaterials: { forgery: 'Combustor', common: 'Exoswarm Pendant' } },
  'Pulsation Bracer': { rarity: 5, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 587, subStatValue: '+24.3%',
    desc: 'Standard 5★. Synth gauntlets pulsing with decisive surge. ATK with stacking Basic ATK DMG on Tune Strain-Interfered hits.',
    passive: 'Barrier Breacher: ATK +12%. DMG to Tune Strain-Interfered targets → self Basic ATK DMG +6% (stacks x3, 4s, 0.5s ICD, retrigger resets duration)', pv: { atkPct: 12, basicDmg: 18 }, bestFor: ['Gauntlet users'],
    ascensionMaterials: { forgery: 'Waveworn Shard', common: 'Mech Core' } },
  'Boson Astrolabe': { rarity: 5, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 525, subStatValue: '+38.9%',
    desc: 'Standard 5★. Synth rectifier mapping stellar possibilities. ATK and Basic ATK DMG when a teammate casts a Tune Break skill.',
    passive: 'Path Observer: ATK +12%. Team member casts a Tune Break skill → self ATK +12%, Basic ATK DMG +12% (14s)', pv: { atkPct: 24, basicDmg: 12 }, bestFor: ['Rectifier users', 'Encore', 'Verina'],
    ascensionMaterials: { forgery: 'String', common: 'Exoswarm Core' } },
  "Bloodpact's Pledge": { rarity: 5, type: 'Sword', stat: 'Energy Regen', baseAtk: 587, subStatValue: '+38.9%',
    desc: 'Standard 5★. Sword sealed with an unbreakable blood oath. Healing boosts Resonance Skill DMG.',
    passive: 'Healing → Res. Skill DMG +10% for 6s. Aero DMG +10% for 30s', pv: { skillDmg: 10, elemDmg: 10 }, bestFor: ['Sword healers', 'Rover'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Solsworn Ciphers': { rarity: 5, type: 'Gauntlets', stat: 'Crit DMG', baseAtk: 587, subStatValue: '+48.6%',
    desc: 'Sigrika signature. Gauntlets inscribed with solar ciphers. Echo Skill DMG Amp + DEF Ignore.',
    passive: 'ATK +12%. Intro/Echo Skill → Echo Skill DMG Amp +32% for 15s. Echo Skill → Aero DEF Ignore +10%', pv: { atkPct: 12, echoDmg: 32, defIgnore: 10 }, bestFor: ['Sigrika'],
    ascensionMaterials: { forgery: 'Waveworn Shard', common: 'Mech Core' } },
  // 4★ Weapons
  'Discord': { rarity: 4, type: 'Broadblade', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Descending adagio, the curtain never falls. Restores Concerto Energy on Skill use.',
    passive: 'Resonance Skill → restore 8 Concerto Energy (20s CD)', bestFor: ['Taoqi', 'Any Broadblade'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Variation': { rarity: 4, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Descending adagio, changing the battle\'s tune. Restores Concerto Energy on Skill use.',
    passive: 'Resonance Skill → restore 8 Concerto Energy (20s CD)', bestFor: ['Baizhi', 'Healers', 'Verina', 'Shorekeeper'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Marcato': { rarity: 4, type: 'Gauntlets', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Surging waves shattering all like a deadly hymn. Restores Concerto Energy on Skill use.',
    passive: 'Resonance Skill → restore 8 Concerto Energy (20s CD)', bestFor: ['Yuanwu', 'Gauntlet users', 'Jianxin', 'Youhu'], // Youhu tag added 2026-08-18: Prydwen's Best Weapons #1 pick for her by far, thanks to its Energy Regen main stat and Concerto generation easing her Outro access.
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Lunar Cutter': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Sword born from an alien star\'s light. Gains ATK stacks on swap-in.',
    // 'Sanhua' added 2026-08-18: Prydwen's Build tab ranks this her #6 weapon (83.96%) — good for Hybrid
    // characters with minimal field time, like Sanhua's fast rotation.
    passive: 'Swap-in → 6 Oath stacks, each +2% ATK (max 6 stacks/+12%). Loses 1 stack every 2s. On kill: regain 6 stacks. 12s CD on swap-in trigger.', pv: { atkPct: 12 }, bestFor: ['Sword users', 'Rover', 'Sanhua'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Thunderbolt': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 387, subStatValue: '+36.4%',
    desc: 'Huanglong ceremonial pistols, resilient and enduring. Stacking Skill DMG on Basic/Heavy hits.',
    passive: 'Basic/Heavy ATK hit → Res. Skill DMG +7% per stack (max x3, 10s per stack, 1s trigger interval)', pv: { skillDmg: 21 }, bestFor: ['Chixia', 'Pistol users', 'Mortefi'], // Mortefi tag added 2026-08-18: Prydwen's Best Weapons list ranks this his 4★ alt at 83.07%
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },

  'Overture': { rarity: 4, type: 'Sword', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Ascending crescendo, a glorious cutting prelude. Restores Concerto Energy on Skill use.',
    passive: 'Resonance Skill → restore 8 Concerto Energy (20s CD)', bestFor: ['Sword supports', 'Rover'], 
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Cadenza': { rarity: 4, type: 'Pistols', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Ascending crescendo, thunderous symphony of destruction. Restores Concerto Energy on Skill use.',
    passive: 'Resonance Skill → restore 8 Concerto Energy (20s CD)', bestFor: ['Pistol supports'], 
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  "Ocean's Gift": { rarity: 4, type: 'Rectifier', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Rectifier blessed by the sea, a fisher\'s hope. Stacking Spectro DMG against Frazzled enemies.',
    passive: 'DMG to Spectro Frazzle enemies → +6% Spectro DMG per 1s (max x4, 6s)', pv: { elemDmg: 24 }, bestFor: ['Spectro DPS'], 
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Waltz in Masquerade': { rarity: 4, type: 'Rectifier', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Swirling dances concealing whispered secrets. Stacking ATK on Negative Status hits.',
    passive: 'DMG to Negative Status enemies → ATK +4% (max x4, 10s)', pv: { atkPct: 16 }, bestFor: ['Rectifier DPS', 'Yinlin', 'Zhezhi', 'Buling'], 
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Legend of Drunken Hero': { rarity: 4, type: 'Gauntlets', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Wine grants courage but dulls the senses. Stacking ATK on Negative Status hits.',
    passive: 'DMG to Negative Status enemies → ATK +4% (max x4, 10s)', pv: { atkPct: 16 }, bestFor: ['Gauntlet DPS', 'Xiangli Yao'], 
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Romance in Farewell': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Pistols etched with a parting promise of lingering sorrow. Stacking ATK on Negative Status hits.',
    passive: 'DMG to Negative Status enemies → ATK +4% (max x4, 10s)', pv: { atkPct: 16 }, bestFor: ['Pistol DPS', 'Aalto', 'Chixia'], 
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Fables of Wisdom': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Sword etched with witty fables hiding truth. Stacking ATK on Negative Status hits.',
    passive: 'DMG to Negative Status enemies → ATK +4% (max x4, 10s)', pv: { atkPct: 16 }, bestFor: ['Sword DPS'], 
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Meditations on Mercy': { rarity: 4, type: 'Broadblade', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Broadblade of a warrior torn between punishment and mercy. Stacking ATK on Negative Status hits.',
    passive: 'DMG to Negative Status enemies → ATK +4% (max x4, 10s)', pv: { atkPct: 16 }, bestFor: ['Broadblade DPS'], 
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Call of the Abyss': { rarity: 4, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Scepter of lost dominion and faded grandeur. Healing Bonus boost after Liberation.',
    passive: 'Liberation → Healing Bonus +16% for 15s', pv: { healingBonus: 16 }, bestFor: ['Rectifier healers', 'Verina', 'Shorekeeper', 'Baizhi'], 
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Somnoire Anchor': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Dreamkeeper\'s anchor from twilight shores. Stacking ATK buff on dealing damage.',
    // 'Sanhua' added 2026-08-18: Prydwen's Build tab ranks this her #7 weapon (76.66%), a free F2P
    // option for extended field time — loses value fast on her quick-swap rotation.
    passive: 'Dealing DMG → 1 Hiss stack per 1s, each +2% ATK (max x10, 3s/stack). Swap-off clears all. At 10 stacks: Crit Rate +6%.', pv: { atkPct: 20, critRate: 6 }, bestFor: ['Sword DPS', 'Sanhua'], 
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Fusion Accretion': { rarity: 4, type: 'Rectifier', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Black Shores prototype channeling a blazar\'s radiance. Skill grants Resonance Energy and ATK buff.',
    passive: 'Resonance Skill → +6 Resonance Energy, ATK +10% for 16s (20s CD)', pv: { atkPct: 10 }, bestFor: ['Rectifier DPS', 'Encore'], 
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Celestial Spiral': { rarity: 4, type: 'Gauntlets', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'Galactic radiance spiraling toward tragic demise. Skill grants Resonance Energy and ATK buff.',
    passive: 'Resonance Skill → +6 Resonance Energy, ATK +10% for 16s (20s CD)', pv: { atkPct: 10 }, bestFor: ['Gauntlet DPS', 'Lingyang', 'Youhu'], 
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } }, // Youhu tag added 2026-08-18: Prydwen's Best Weapons #4 pick for her, a flat Resonance Energy bonus every 20s.
  'Relativistic Jet': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'A blazar\'s incessant course of cosmic destruction. Skill grants Resonance Energy and ATK buff.',
    passive: 'Resonance Skill → +6 Resonance Energy, ATK +10% for 16s (20s CD)', pv: { atkPct: 10 }, bestFor: ['Pistol DPS', 'Aalto', 'Mortefi'], 
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } }, // Mortefi tag added 2026-08-18: Prydwen's Best Weapons list ranks this his top 4★ alt at 83.92%, noting it "significantly reduces Energy requirements"
  'Endless Collapse': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'The collapsing heart of a dying blazar. Skill grants Resonance Energy and ATK buff.',
    // 'Yangyang' added 2026-08-18: Prydwen's Build tab ranks this her #4 weapon (82.82%), a good F2P
    // Energy Regen option for her when she has Energy issues.
    // 'Sanhua' added 2026-08-18: Prydwen's Build tab ranks this her #5 weapon (84.52%), a great F2P
    // 4★ option when her Energy is short.
    // 'Danjin' added 2026-08-18 (Danjin/Yangyang/Sanhua re-audit): Prydwen's Build tab ranks this her
    // #5 weapon (80.72%) — her weaponAlts already pointed at it but bestFor was missing the tag.
    passive: 'Resonance Skill → +6 Resonance Energy, ATK +10% for 16s (20s CD)', pv: { atkPct: 10 }, bestFor: ['Sword DPS', 'Rover', 'Changli', 'Yangyang', 'Sanhua', 'Danjin'], 
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Waning Redshift': { rarity: 4, type: 'Broadblade', stat: 'ATK%', baseAtk: 462, subStatValue: '+18.2%',
    desc: 'A blazar\'s fading radiance across billions of light-years. Skill grants Resonance Energy and ATK buff.',
    passive: 'Resonance Skill → +6 Resonance Energy, ATK +10% for 16s (20s CD)', pv: { atkPct: 10 }, bestFor: ['Broadblade DPS', 'Jiyan', 'Calcharo', 'Jinhsi', 'Lumi'], 
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Lumingloss': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 387, subStatValue: '+36.4%',
    desc: 'Luminous sword with a glossy ceremonial edge. Basic and Heavy ATK DMG boost after Skill.',
    // 'Yangyang' added 2026-08-18: Prydwen's Build tab ranks this her #3 weapon / top 4★ (82.96%).
    // 'Sanhua' added 2026-08-18: Prydwen's Build tab ranks this her #7 weapon (80.65%), an easy-to-trigger
    // 4★ pick for characters using Skill multiple times per rotation, like Sanhua.
    passive: 'Resonance Skill → Basic & Heavy ATK DMG +20% for 10s (1 stack max, 1s trigger interval)', pv: { basicDmg: 20, heavyDmg: 20 }, bestFor: ['Sword DPS', 'Changli', 'Yangyang', 'Sanhua'], 
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Commando of Conviction': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Spirits unite in resounding gorges of valor. ATK boost on Intro Skill.',
    // 'Danjin' added 2026-08-18: Prydwen ranks this her #4 weapon overall (81.08%), a top F2P Sword pick.
    // 'Sanhua' added 2026-08-18: Prydwen's Build tab ranks this her #4 weapon (85.50%), the best generic
    // F2P Sword pick — near-unconditional bonus since Sanhua always uses her Intro Skill.
    passive: 'Intro Skill → ATK +15% for 15s', pv: { atkPct: 15 }, bestFor: ['Sword users', 'Rover', 'Danjin', 'Sanhua'], 
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Jinzhou Keeper': { rarity: 4, type: 'Rectifier', stat: 'ATK%', baseAtk: 387, subStatValue: '+36.4%',
    desc: 'Vigilant gaze northward where rain veils the city. ATK and HP boost on Intro Skill.',
    passive: 'Intro Skill → ATK +8%, HP +10% for 15s', pv: { atkPct: 8 }, bestFor: ['Rectifier supports'], 
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Comet Flare': { rarity: 4, type: 'Rectifier', stat: 'HP%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Alien starlight forged delicate and responsive. Stacking Healing Bonus on Basic/Heavy ATK hits.',
    passive: 'Basic/Heavy ATK hit → Healing Bonus +3% (max x3, 8s)', bestFor: ['Rectifier healers'], 
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Augment': { rarity: 4, type: 'Rectifier', stat: 'Crit Rate', baseAtk: 412, subStatValue: '+20.3%',
    desc: 'Golden ginkgo of Huanglong\'s resilience. ATK boost after using Liberation.',
    passive: 'Liberation → ATK +15% for 15s', pv: { atkPct: 15 }, bestFor: ['Rectifier DPS', 'Yinlin', 'Encore', 'Zhezhi'], 
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Hollow Mirage': { rarity: 4, type: 'Gauntlets', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Strange star\'s hollow light concealing tremendous force. Iron Armor stacks on Liberation.',
    passive: 'Liberation → 3 Iron Armor stacks, each +3% ATK and +3% DEF (max 3 stacks, no duration; lose 1 stack on taking damage)', pv: { atkPct: 9, defPct: 9 }, bestFor: ['Gauntlet users', 'Lingyang'], 
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Stonard': { rarity: 4, type: 'Gauntlets', stat: 'Crit Rate', baseAtk: 412, subStatValue: '+20.3%',
    desc: 'Ceremonial gauntlets of Huanglong\'s magistrate. Liberation DMG boost after Skill.',
    passive: 'Resonance Skill → Liberation DMG +18% for 15s', pv: { libDmg: 18 }, bestFor: ['Gauntlet DPS', 'Jianxin', 'Xiangli Yao', 'Yuanwu'], 
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } }, // Yuanwu tag added 2026-08-18: Prydwen's Best Weapons list ranks this 93.03%, his best 4★ alt behind Amity Accord
  'Amity Accord': { rarity: 4, type: 'Gauntlets', stat: 'DEF%', baseAtk: 337, subStatValue: '+61.6%',
    desc: 'Rangers\' comradeship, armor against the chill of stars. Liberation DMG boost on Intro Skill.',
    passive: 'Intro Skill → Liberation DMG +20% for 15s', pv: { libDmg: 20 }, bestFor: ['Gauntlet supports', 'Yuanwu'], 
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } }, // Yuanwu tag added 2026-08-18: Prydwen's Best Weapons list ranks this 100% (2nd overall, top DEF-scaler pick)
  'Novaburst': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Pistols erupting with nova-like force. Stacking ATK boost on dash/dodge.',
    passive: 'Dash/dodge → ATK +4% (max x3, 8s)', pv: { atkPct: 12 }, bestFor: ['Pistol DPS', 'Mortefi'], 
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } }, // Mortefi tag added 2026-08-18: Prydwen's Best Weapons list ranks this his 4★ alt at 83.64%
  'Undying Flame': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Pistols burning with an undying flame. Skill DMG boost on Intro Skill.',
    passive: 'Intro Skill → Res. Skill DMG +20% for 15s', pv: { skillDmg: 20 }, bestFor: ['Pistol DPS', 'Mortefi'], 
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } }, // Mortefi tag added 2026-08-18: Prydwen's Best Weapons list ranks this his 4★ alt at 81.87%
  'Helios Cleaver': { rarity: 4, type: 'Broadblade', stat: 'ATK%', baseAtk: 412, subStatValue: '+30.4%',
    desc: 'Broadblade forged in sunfire. Gradual stacking ATK buff after Skill use.',
    passive: 'After Res. Skill → ATK +3% every 2s (max x4, 12s)', pv: { atkPct: 12 }, bestFor: ['Broadblade DPS'], 
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Dauntless Evernight': { rarity: 4, type: 'Broadblade', stat: 'DEF%', baseAtk: 337, subStatValue: '+61.6%',
    desc: 'Broadblade that cuts through the longest night. ATK and DEF boost on Intro Skill.',
    passive: 'Intro Skill → ATK +8%, DEF +15% for 15s', pv: { atkPct: 8, defPct: 15 }, bestFor: ['Taoqi', 'Broadblade supports'], 
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } }, // Taoqi tag added 2026-08-18: Prydwen's Best Weapons list ranks this as her free/signature #2 pick (107.54%), just below Discord.
  'Autumntrace': { rarity: 4, type: 'Broadblade', stat: 'Crit Rate', baseAtk: 412, subStatValue: '+20.3%',
    desc: 'Huanglong\'s golden ginkgo, prosperous and long-lasting. Stacking ATK on Basic/Heavy hits.',
    passive: 'Basic/Heavy ATK DMG → ATK +4% per stack (max x5, 7s per stack, 1s trigger interval)', pv: { atkPct: 20 }, bestFor: ['Broadblade DPS', 'Jiyan', 'Calcharo', 'Jinhsi', 'Lumi'], 
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  // corrected 2026-08-18 (4★ audit): Crit Rate substat is an exact 20.25% at Lv.90 R1 (nanoka.cc's raw
  // stat table), which the game's toFixed(1)-style rounding renders as +20.3%, not +20.2%.
  'Solar Flame': { rarity: 4, type: 'Pistols', stat: 'Crit Rate', baseAtk: 412, subStatValue: '+20.3%',
    desc: 'Pistols burning with solar fire. Stacking ATK and Heavy ATK DMG on hits.',
    passive: 'Basic/Heavy ATK → ATK +2.2%, Heavy ATK DMG +2.2% (max x4, 7s)', pv: { atkPct: 8.8, heavyDmg: 8.8 }, bestFor: ['Pistol DPS'], 
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Feather Edge': { rarity: 4, type: 'Sword', stat: 'Crit Rate', baseAtk: 412, subStatValue: '+20.3%',
    desc: 'Sword light as a feather but sharp as a blade. ATK and Liberation DMG boost after Liberation.',
    passive: 'Liberation → ATK +7.2%, Liberation DMG +10.8% for 15s', pv: { atkPct: 7.2, libDmg: 10.8 }, bestFor: ['Sword DPS'], 
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  // ── 4★ Craftable ──
  // corrected 2026-08-18 (4★ audit): Energy Regen substat was +32.3%, nanoka.cc's raw Lv.90 stat table
  // shows an exact 32.4%.
  'Broadblade#41': { rarity: 4, type: 'Broadblade', stat: 'Energy Regen', baseAtk: 412, subStatValue: '+32.4%',
    desc: 'Craftable broadblade. ATK and healing boost when HP is high or low.',
    passive: 'HP >80% → ATK +12%. HP <40% → heal 5% on ATK', pv: { atkPct: 12 }, bestFor: ['Broadblade users'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Sword#18': { rarity: 4, type: 'Sword', stat: 'ATK%', baseAtk: 387, subStatValue: '+36.4%',
    desc: 'Improved mass-produced sword from Huanglong. Crafted for seasoned warriors.',
    passive: 'Daybreak: HP <40% → Heavy ATK DMG +18%, heal 5% HP on Heavy ATK hit (8s CD)', bestFor: ['Danjin'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Gauntlets#21D': { rarity: 4, type: 'Gauntlets', stat: 'Energy Regen', baseAtk: 387, subStatValue: '+38.9%',
    desc: 'Craftable gauntlets. Counter-focused design with adaptive sustain.',
    passive: 'Mastermind: Dash/dodge → ATK +8%, Dodge Counter DMG +50% for 8s, heal 5% HP on Counter (6s CD)', bestFor: ['Jianxin', 'Youhu'], // Youhu tag added 2026-08-18: Prydwen's Best Weapons #2 pick for her — Energy Regen main stat plus an ATK% boost after dashing/dodging, improving her healing and Liberation access.
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Rectifier#25': { rarity: 4, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 337, subStatValue: '+51.8%',
    desc: 'Craftable rectifier. Adaptive support with conditional heal or ATK buff.',
    passive: 'Dawnbringer: Skill → HP <60%: heal 5% HP (8s CD); HP ≥60%: ATK +12% for 10s', bestFor: ['Rectifier supports'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Pistols#26': { rarity: 4, type: 'Pistols', stat: 'ATK%', baseAtk: 387, subStatValue: '+36.4%',
    desc: 'Craftable pistols. Stacking ATK buff while avoiding damage.',
    passive: 'Omniscient: No DMG taken → ATK +6% every 5s (max 2 stacks, 8s). Taking DMG: lose 1 stack, heal 5% HP', bestFor: ['Pistol users', 'Mortefi'], // Mortefi tag added 2026-08-18: Prydwen's Best Weapons list ranks this his 4★ alt at 82.65%
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },

  // ── 4★ Battle Pass (Hunter's Growl series) ──
  'Aureate Zenith': { rarity: 4, type: 'Broadblade', stat: 'Crit DMG', baseAtk: 412, subStatValue: '+40.5%',
    desc: 'Battle Pass broadblade with Griffrex-inspired engravings. ATK and Heavy ATK DMG after Liberation.',
    passive: 'Oath of Tide Hunters: After Liberation → ATK +7.2%, Heavy ATK DMG +10.8% for 15s', pv: { atkPct: 7.2, heavyDmg: 10.8 }, bestFor: ['Augusta', 'Broadblade DPS'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Aether Strike': { rarity: 4, type: 'Gauntlets', stat: 'Crit DMG', baseAtk: 412, subStatValue: '+40.5%',
    desc: 'Battle Pass gauntlets with Griffrex-inspired engravings. ATK and Liberation DMG after Liberation.',
    passive: 'Oath of Tide Hunters: After Liberation → ATK +7.2%, Liberation DMG +10.8% for 15s', pv: { atkPct: 7.2, libDmg: 10.8 }, bestFor: ['Iuno', 'Gauntlet DPS'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Radiant Dawn': { rarity: 4, type: 'Rectifier', stat: 'Crit DMG', baseAtk: 412, subStatValue: '+40.5%',
    desc: 'Battle Pass rectifier with Griffrex-inspired engravings. ATK and Basic ATK DMG after Skill.',
    passive: 'Oath of Tide Hunters: After Skill → ATK +9%, Basic ATK DMG +9% for 10s', pv: { atkPct: 9, basicDmg: 9 }, bestFor: ['Rectifier DPS'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },

  // ── 3★ Guardian Series (Craftable in Jinzhou) ──
  // Source: game8.co — all stats, passives, materials, bestFor verified per weapon page
  'Guardian Sword': { rarity: 3, type: 'Sword', stat: 'HP%', baseAtk: 300, subStatValue: '+30.4%',
    desc: 'Craftable sword forged in Jinzhou. Enhances Resonance Skill effectiveness.',
    passive: 'Unified: Resonance Skill DMG +12%', pv: { skillDmg: 12 }, bestFor: ['Cartethyia', 'Changli', 'Yangyang'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Guardian Pistols': { rarity: 3, type: 'Pistols', stat: 'ATK%', baseAtk: 300, subStatValue: '+30.4%',
    desc: 'Craftable pistols forged in Jinzhou. Enhances Resonance Skill effectiveness.',
    passive: 'Unity: Resonance Skill DMG +12%', pv: { skillDmg: 12 }, bestFor: ['Carlotta', 'Chixia'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Guardian Gauntlets': { rarity: 3, type: 'Gauntlets', stat: 'DEF%', baseAtk: 300, subStatValue: '+38.5%',
    desc: 'Craftable gauntlets forged in Jinzhou. Enhances Liberation effectiveness.',
    passive: 'Collective Strength: Resonance Liberation DMG +12%', pv: { libDmg: 12 }, bestFor: ['Jianxin', 'Yuanwu'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Guardian Rectifier': { rarity: 3, type: 'Rectifier', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Craftable rectifier forged in Jinzhou. Enhances Basic ATK and Heavy ATK.',
    passive: 'Companionship: Basic ATK and Heavy ATK DMG +12%', pv: { basicDmg: 12, heavyDmg: 12 }, bestFor: ['Encore', 'Zhezhi'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Guardian Broadblade': { rarity: 3, type: 'Broadblade', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Craftable broadblade forged in Jinzhou. Enhances Basic ATK and Heavy ATK effectiveness.',
    passive: 'Consensus: Basic ATK and Heavy ATK DMG +12%', pv: { basicDmg: 12, heavyDmg: 12 }, bestFor: ['Augusta', 'Calcharo', 'Jinhsi', 'Jiyan'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },

  // ── 3★ Voyager Series ──
  // corrected 2026-08-18 (3★ audit): Sword/Rectifier/Broadblade Energy Regen substat was off by 0.1pp
  // (+32.3% vs nanoka.cc's live Lv.90 value of +32.4%); Guardian/Pistols/Gauntlets substats verified correct.
  'Sword of Voyager': { rarity: 3, type: 'Sword', stat: 'Energy Regen', baseAtk: 300, subStatValue: '+32.4%',
    desc: 'Travel sword built for sustained adventuring. Restores energy on Skill use.',
    passive: 'Crusade: Resonance Skill → restore 8 Resonance Energy (20s CD)', bestFor: ['Rover'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Pistols of Voyager': { rarity: 3, type: 'Pistols', stat: 'ATK%', baseAtk: 300, subStatValue: '+30.4%',
    desc: 'Travel pistols built for sustained adventuring. Restores energy on Skill use.',
    passive: 'Long Journey: Resonance Skill → restore 8 Resonance Energy (20s CD)', bestFor: ['Carlotta'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Gauntlets of Voyager': { rarity: 3, type: 'Gauntlets', stat: 'DEF%', baseAtk: 325, subStatValue: '+30.8%',
    desc: 'Travel gauntlets built for sustained adventuring. Restores energy on Skill use.',
    passive: 'Crusade: Resonance Skill → restore 8 Resonance Energy (20s CD)', bestFor: ['Yuanwu'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Rectifier of Voyager': { rarity: 3, type: 'Rectifier', stat: 'Energy Regen', baseAtk: 300, subStatValue: '+32.4%',
    desc: 'Travel rectifier built for sustained adventuring. Restores energy on Skill use.',
    passive: 'Crusade: Resonance Skill → restore 8 Resonance Energy (20s CD)', bestFor: ['Baizhi', 'Shorekeeper', 'Verina', 'Yinlin', 'Zhezhi'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Broadblade of Voyager': { rarity: 3, type: 'Broadblade', stat: 'Energy Regen', baseAtk: 300, subStatValue: '+32.4%',
    desc: 'Travel broadblade built for sustained adventuring. Restores energy on Skill use.',
    passive: 'Long Journey: Resonance Skill → restore 8 Resonance Energy (20s CD)', bestFor: ['Lumi'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },

  // ── 3★ Night Series ──
  // corrected 2026-08-18 (3★ audit): all five Night-series passives share the single in-game name
  // "Valiance" per nanoka.cc's live weapon pages — the per-type names (Tenacity/Chivalry/Assemble/Arrival)
  // previously here were fabricated; effect text (Intro Skill → ATK +8% for 10s) was already correct.
  'Sword of Night': { rarity: 3, type: 'Sword', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Midnight-forged sword. Empowers the wielder on swap-in.',
    passive: 'Valiance: Intro Skill → ATK +8% for 10s', bestFor: ['Rover', 'Sanhua', 'Yangyang', 'Changli'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Pistols of Night': { rarity: 3, type: 'Pistols', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Midnight-forged pistols. Empowers the wielder on swap-in.',
    passive: 'Valiance: Intro Skill → ATK +8% for 10s', bestFor: ['Aalto', 'Mortefi', 'Chixia'],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Gauntlets of Night': { rarity: 3, type: 'Gauntlets', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Midnight-forged gauntlets. Empowers the wielder on swap-in.',
    passive: 'Valiance: Intro Skill → ATK +8% for 10s', bestFor: ['Jianxin', 'Lingyang', 'Roccia', 'Xiangli Yao', 'Youhu'],
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Rectifier of Night': { rarity: 3, type: 'Rectifier', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Midnight-forged rectifier. Empowers the wielder on swap-in.',
    passive: 'Valiance: Intro Skill → ATK +8% for 10s', bestFor: ['Encore', 'Phrolova', 'Yinlin', 'Zhezhi', 'Shorekeeper'],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Broadblade of Night': { rarity: 3, type: 'Broadblade', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Midnight-forged broadblade. Empowers the wielder on swap-in.',
    passive: 'Valiance: Intro Skill → ATK +8% for 10s', bestFor: ['Calcharo', 'Jinhsi', 'Jiyan'],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },

  // ── 3★ Originite Series (Huaxu Academy) ──
  'Originite: Type I': { rarity: 3, type: 'Broadblade', stat: 'DEF%', baseAtk: 300, subStatValue: '+38.5%',
    desc: 'Huaxu Academy broadblade for technical verification. Heals on Skill use.',
    passive: 'Temperance: Resonance Skill → heal 3% Max HP (12s CD)', bestFor: [],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
  'Originite: Type II': { rarity: 3, type: 'Sword', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Huaxu Academy sword for technical verification. Heals on Liberation use.',
    passive: 'Vanquish: Resonance Liberation → heal 5% Max HP (20s CD)', bestFor: ['Danjin'],
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Originite: Type III': { rarity: 3, type: 'Pistols', stat: 'ATK%', baseAtk: 325, subStatValue: '+24.3%',
    desc: 'Huaxu Academy pistols for technical verification. Heals on Dodge Counter.',
    passive: 'Alacrity: Dodge Counter → heal 1.6% Max HP (6s CD)', bestFor: [],
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  // corrected 2026-08-18 (3★ audit): Crit DMG substat was +40.4%, nanoka.cc's live Lv.90 page shows +40.5%.
  'Originite: Type IV': { rarity: 3, type: 'Gauntlets', stat: 'Crit DMG', baseAtk: 300, subStatValue: '+40.5%',
    desc: 'Huaxu Academy gauntlets for technical verification. Heals on Basic ATK hit.',
    passive: 'Rejuvenate: Basic ATK DMG → heal 0.5% Max HP (3s CD)', bestFor: ['Lingyang', 'Yuanwu'], // Yuanwu tag added 2026-08-18: Prydwen's dedicated Support-role weapon pick — its Basic ATK self-heal is what triggers the Rejuvenating Glow 5pc set (his actual meta build), despite low raw combat stats
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Originite: Type V': { rarity: 3, type: 'Rectifier', stat: 'HP%', baseAtk: 300, subStatValue: '+30.4%',
    desc: 'Huaxu Academy rectifier for technical verification. Heals on Intro Skill.',
    passive: 'Augment: Intro Skill → heal 5% Max HP (20s CD)', bestFor: [],
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },

  // ── 3★ Beguiling Melody (Quest Reward — v1.1) ──
  'Beguiling Melody': { rarity: 3, type: 'Broadblade', stat: 'ATK%', baseAtk: 300, subStatValue: '+30.4%',
    desc: 'Forged from the scale of Jué. Resembles a musical instrument more than a weapon.',
    passive: 'Graceful Touch: Intro Skill → restore 4 Concerto Energy; Outro Skill → restore 4 Resonance Energy', bestFor: [],
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },

  // ── 2★ Tyro Series ──
  // corrected 2026-08-18 (1★/2★ audit): baseAtk/subStatValue were guesses (200/+18.2%) that didn't match
  // any in-game level breakpoint — re-verified against nanoka.cc's live weapon pages at their actual max
  // level, Lv.70 (1-2★ weapons cap at Lv.70, not Lv.90 like higher rarities), giving ATK 209/+12.3% ATK.
  'Tyro Sword': { rarity: 2, type: 'Sword', stat: 'ATK%', baseAtk: 209, subStatValue: '+12.3%',
    desc: 'The birth of revolutionary tides. A sword designed for novice Resonators. Contains a power not to be underestimated under its simple outlook.',
    passive: 'Prologue: ATK +5%', bestFor: [], 
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Tyro Rectifier': { rarity: 2, type: 'Rectifier', stat: 'ATK%', baseAtk: 209, subStatValue: '+12.3%',
    desc: 'The origin of universal genesis. A Rectifier designed for novice Resonators. Contains a power not to be underestimated under its simple outlook.',
    passive: 'Prologue: ATK +5%', bestFor: [], 
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Tyro Gauntlets': { rarity: 2, type: 'Gauntlets', stat: 'ATK%', baseAtk: 209, subStatValue: '+12.3%',
    desc: 'The dawn of enduring endeavor. A pair of gauntlets designed for novice Resonators. Contains a power not to be underestimated under its simple outlook.',
    passive: 'Prologue: ATK +5%', bestFor: [], 
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Tyro Pistols': { rarity: 2, type: 'Pistols', stat: 'ATK%', baseAtk: 209, subStatValue: '+12.3%',
    desc: 'The inception of valiant venture. A pair of pistols designed for novice Resonators. Contains a power not to be underestimated under its simple outlook.',
    passive: 'Prologue: ATK +5%', bestFor: [], 
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Tyro Broadblade': { rarity: 2, type: 'Broadblade', stat: 'ATK%', baseAtk: 209, subStatValue: '+12.3%',
    desc: 'The onset of pinnacle pursuit. A broadblade designed for novice Resonators. Contains a power not to be underestimated under its simple outlook.',
    passive: 'Prologue: ATK +5%', bestFor: [], 
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },

  // ── 1★ Training Series ──
  // corrected 2026-08-18 (1★/2★ audit): baseAtk/subStatValue were guesses (100/+12.1%); re-verified
  // against nanoka.cc's live weapon pages at their actual max level, Lv.70, giving ATK 190/+9.5% ATK.
  'Training Sword': { rarity: 1, type: 'Sword', stat: 'ATK%', baseAtk: 190, subStatValue: '+9.5%',
    desc: 'This sword is designed specifically for training and teaching, offering only the basic features.',
    passive: 'Persevere: ATK +4%', bestFor: [], 
    ascensionMaterials: { forgery: 'Metallic Drip', common: 'Howler Core' } },
  'Training Rectifier': { rarity: 1, type: 'Rectifier', stat: 'ATK%', baseAtk: 190, subStatValue: '+9.5%',
    desc: 'This rectifier is designed specifically for training and teaching, offering only the basic features.',
    passive: 'Persevere: ATK +4%', bestFor: [], 
    ascensionMaterials: { forgery: 'Helix', common: 'Ring' } },
  'Training Gauntlets': { rarity: 1, type: 'Gauntlets', stat: 'ATK%', baseAtk: 190, subStatValue: '+9.5%',
    desc: 'These gauntlets are designed specifically for training and teaching, offering only the basic features.',
    passive: 'Persevere: ATK +4%', bestFor: [], 
    ascensionMaterials: { forgery: 'Cadence', common: 'Howler Core' } },
  'Training Pistols': { rarity: 1, type: 'Pistols', stat: 'ATK%', baseAtk: 190, subStatValue: '+9.5%',
    desc: 'These pistols are designed specifically for training and teaching, offering only the basic features.',
    passive: 'Persevere: ATK +4%', bestFor: [], 
    ascensionMaterials: { forgery: 'Phlogiston', common: 'Ring' } },
  'Training Broadblade': { rarity: 1, type: 'Broadblade', stat: 'ATK%', baseAtk: 190, subStatValue: '+9.5%',
    desc: 'This broadblade is designed specifically for training and teaching, offering only the basic features.',
    passive: 'Persevere: ATK +4%', bestFor: [], 
    ascensionMaterials: { forgery: 'Waveworn Residue', common: 'Whisperin Core' } },
};


// [SECTION:LOCALIZATION] — locale-aware overlay for weapons.fr.js.
// English data above is the single source of truth for numbers/mechanics;
// this merges in translated *text* fields only (desc/passive), keyed by the
// same names. calcEngine.js/calcTeamStats.js must keep importing WEAPON_DATA
// directly — parsePassive() regex-parses the raw English passive string as
// a fallback whenever a weapon has no `pv`, so feeding it translated text
// would silently corrupt DPS calculations.
import { WEAPON_DATA_FR } from './weapons.fr.js';

/** @param {string} locale */
export function getLocalizedWeaponData(locale) {
  if (locale !== 'fr') return WEAPON_DATA;
  const out = {};
  for (const [name, base] of Object.entries(WEAPON_DATA)) {
    const fr = WEAPON_DATA_FR[name];
    out[name] = { ...base, ...(fr?.name ? { displayName: fr.name } : {}), ...(fr?.desc ? { desc: fr.desc } : {}), ...(fr?.passive ? { passive: fr.passive } : {}) };
  }
  return out;
}

export { WEAPON_DATA };
