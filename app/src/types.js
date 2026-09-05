// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — Type Definitions (JSDoc)
// Provides IntelliSense and type checking via jsconfig.json checkJs mode.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @typedef {'Glacio'|'Fusion'|'Electro'|'Aero'|'Spectro'|'Havoc'} Element
 * @typedef {'Sword'|'Broadblade'|'Pistols'|'Gauntlets'|'Rectifier'} WeaponType
 * @typedef {'Main DPS'|'Sub DPS'|'Support'|'Healer'|'Support/Healer'} CharacterRole
 * @typedef {'ATK'|'HP'|'DEF'} StatScaling
 */

/**
 * @typedef {Object} CharacterData
 * @property {number} rarity - 4 or 5
 * @property {Element} element
 * @property {WeaponType} weapon
 * @property {CharacterRole} role
 * @property {string} desc - Character description
 * @property {string[]} skills - Array of 4 skill names [Basic, Skill, Liberation, Forte]
 * @property {string} bestWeapon - Recommended weapon name
 * @property {string[]} [bestEchoes] - Recommended echo sets
 * @property {StatScaling} [statScaling] - What stat abilities scale on (default: ATK)
 * @property {string[]} [dmgFocus] - Primary damage types ['Basic ATK', 'Heavy ATK', 'Liberation', etc.]
 * @property {string[]} [buffs] - Team buff descriptions
 * @property {string[]} [debuffs] - Debuff descriptions
 * @property {number} [baseHp] - Level 90 base HP
 * @property {number} [baseAtk] - Level 90 base ATK
 * @property {number} [baseDef] - Level 90 base DEF
 * @property {number} [maxEnergy] - Max Resonance Energy
 * @property {number} [totalMult] - Sum of ATK% multipliers in full rotation
 * @property {number} [rotTime] - Full team rotation time (seconds)
 * @property {number} [onField] - Character on-field time (seconds)
 * @property {Object} ascension - Ascension material names
 * @property {string} ascension.boss - Boss drop material
 * @property {string} ascension.specialty - Region specialty
 * @property {string} ascension.common - Common material family
 * @property {Object} [skillMaterials]
 * @property {string} skillMaterials.weeklyDrop - Weekly boss material
 * @property {string} skillMaterials.forgery - Forgery material family
 */

/**
 * @typedef {Object} WeaponData
 * @property {number} rarity - 1-5
 * @property {WeaponType} type
 * @property {string} stat - Substat type ('ATK%', 'Crit Rate', 'Crit DMG', 'Energy Regen', 'HP%', 'DEF%')
 * @property {number} baseAtk - Base ATK at max level
 * @property {string} subStatValue - Substat value string ('+36.4%')
 * @property {string} [desc] - Description
 * @property {string} [passive] - Passive effect description
 * @property {Object} [pv] - Parsed passive values (structured)
 * @property {number} [pv.atkPct] - ATK% bonus
 * @property {number} [pv.elemDmg] - Elemental DMG bonus
 * @property {number} [pv.skillDmg] - Skill DMG bonus
 * @property {number} [pv.critRate] - Crit Rate bonus
 * @property {number} [pv.critDmg] - Crit DMG bonus
 * @property {number} [pv.basicDmg] - Basic ATK DMG bonus
 * @property {number} [pv.heavyDmg] - Heavy ATK DMG bonus
 * @property {number} [pv.libDmg] - Liberation DMG bonus
 * @property {number} [pv.echoDmg] - Echo Skill DMG bonus
 * @property {number} [pv.coordDmg] - Coordinated ATK DMG bonus
 * @property {number} [pv.defIgnore] - DEF Ignore %
 * @property {number} [pv.resShred] - RES Shred %
 * @property {number} [pv.atkSpeed] - ATK Speed bonus
 * @property {Object} [tv] - Team buff values (weapon buffs team)
 * @property {string[]} [bestFor] - Recommended characters
 * @property {Object} [ascensionMaterials]
 */

/**
 * @typedef {Object} EchoSetData
 * @property {Element} element
 * @property {string} p2 - 2-piece bonus description
 * @property {Object} p2val - 2-piece stat values
 * @property {string} p5 - 5-piece bonus description
 * @property {Object} p5val - 5-piece stat values
 */

/**
 * @typedef {Object} EchoData
 * @property {number} cost - Echo cost (1, 3, or 4)
 * @property {string[]} sets - Sonata set names this echo belongs to
 * @property {string|string[]} buff - Buff type(s) this echo provides
 * @property {number} [dmg] - Active skill damage multiplier %
 * @property {Element} [element] - Active skill element
 * @property {Object} [enemyRes] - Enemy resistance values (for boss echoes)
 */

/**
 * @typedef {Object} BuffEntry
 * @property {string} stat - Stat affected (atkPct, elemDmg, amplify, critRate, critDmg, etc.)
 * @property {number} value - Buff value (percentage)
 * @property {'next'|'team'|'enemy'|'self'} target - Who receives the buff
 * @property {number} [duration] - Duration in seconds
 * @property {string} [condition] - Activation condition
 */

/**
 * @typedef {Object} CharBuffTable
 * @property {BuffEntry[]} [outroBuffs] - Buffs applied on outro (swap out)
 * @property {BuffEntry[]} [libBuffs] - Buffs from Resonance Liberation
 * @property {BuffEntry[]} [selfBuffs] - Self-only buffs
 * @property {BuffEntry[]} [weaponBuffs] - Weapon-triggered team buffs
 * @property {BuffEntry[]} [debuffs] - Enemy debuffs applied
 * @property {Object} [tuneBreak] - Tune Break specific data
 * @property {boolean} [electroFlare] - Has Electro Flare mechanic
 * @property {string} [note] - Human-readable summary
 */

/**
 * @typedef {Object} ResonanceChainEntry
 * @property {number} [atkPct] @property {number} [critRate] @property {number} [critDmg]
 * @property {number} [elemDmg] @property {number} [skillDmg] @property {number} [basicDmg]
 * @property {number} [heavyDmg] @property {number} [libDmg] @property {number} [echoDmg]
 * @property {number} [amplify] @property {number} [defIgnore] @property {number} [defShred]
 * @property {number} [resShred] @property {number} [totalMult] @property {number} [coordDmg]
 * @property {number} [allDmg]
 */

/**
 * @typedef {Object} ResonanceChainData
 * @property {ResonanceChainEntry} [s1]
 * @property {ResonanceChainEntry} [s2]
 * @property {ResonanceChainEntry} [s3]
 * @property {ResonanceChainEntry} [s4]
 * @property {ResonanceChainEntry} [s5]
 * @property {ResonanceChainEntry} [s6]
 */

/**
 * Skill multiplier entry: [type, skillName, multiplierString, description?]
 * @typedef {[string, string, string] | [string, string, string, string]} SkillMultEntry
 */

/**
 * @typedef {Object} TeamEquipmentEntry
 * @property {string|null} weapon - Equipped weapon name
 * @property {Array<Object|null>} echoes - 5 echo slots
 * @property {string} [echoSet] - Selected sonata set name
 * @property {'default'|'er'|'support'} [echoPreset] - Sub-DPS echo preset
 * @property {number} [sequence] - Resonance chain level (0-6)
 * @property {number} [refinement] - Weapon refinement level (1-5)
 */

/**
 * @typedef {Object} AppState
 * @property {string} server - Server region
 * @property {Object} profile - User profile and pull history
 * @property {string} profile.uid
 * @property {string|null} profile.importedAt
 * @property {string} profile.username
 * @property {string} profile.profilePic
 * @property {Object} profile.featured - Featured banner data
 * @property {Object} profile.weapon - Weapon banner data
 * @property {Object} profile.standardChar - Standard character banner data
 * @property {Object} profile.standardWeap - Standard weapon banner data
 * @property {Object} profile.beginner - Beginner banner data
 * @property {Object} calc - Calculator state
 * @property {Object} planner - Planner state
 * @property {Object} settings - App settings
 * @property {Object} eventStatus - Event completion status
 * @property {Array} bookmarks - Saved calculator states
 * @property {Array<{name: string, slots: Array<string|null>}>} teams - 5 team slots
 * @property {number} activeTeamIndex - Currently selected team (0-4)
 */

/**
 * @typedef {Object} CalcTeamStats
 * @property {Array} members - Team member objects
 * @property {Object} mainDps - Primary DPS member
 * @property {number} effAtk - Effective ATK
 * @property {number} critRate - Total crit rate %
 * @property {number} critDmg - Total crit DMG %
 * @property {number} elemDmg - Total elemental DMG %
 * @property {number} skillDmg - Total skill DMG %
 * @property {number} amplify - Total amplify %
 * @property {number} avgCrit - Average crit multiplier
 * @property {number} defMult - DEF multiplier (0-2)
 * @property {number} resMult - RES multiplier
 * @property {number} score - Raw damage score
 * @property {number} rawDps - Raw tier DPS (equipment only)
 * @property {number} realDps - Full tier DPS (with team buffs)
 * @property {number} perfectDps - Perfect tier DPS (with echo actives)
 * @property {number} dotDps - DOT damage per second
 * @property {number} synergy - Team synergy score (0-100)
 * @property {string[]} warnings - Team composition warnings
 * @property {Array<{name: string, dmg: number, pct: number}>} memberDps - Per-member damage breakdown
 * @property {Object} rotationTimeline - Rotation visualizer data
 */

export {};
