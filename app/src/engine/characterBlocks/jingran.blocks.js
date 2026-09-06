// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/jingran.blocks.js
// [CHARACTER · JINGRAN] Jingran's TriggerBlock set — written 2026-09-06, ~4 days before his
// real v3.6-p2 banner release (~2026-09-10, per BANNER_HISTORY/characters.js's own comments).
// He is the LAST character in the roster without a block file (characterBlocks/index.js's own
// header comment), and deliberately stays that way in one sense: characters.js's Jingran entry
// (line ~1053) explicitly documents "Re-checked 2026-08-31... still not fabricatable... no
// rotation/S1-S6/skill-multiplier entry has been added for him [in CHARACTER_ROTATIONS]; do not
// fill this in until his kit is actually revealed post-release." That instruction is about
// CHARACTER_ROTATIONS (the ordered-cast-sequence table), NOT about whether a blocks file can
// exist — SKILL_MULTIPLIERS['Jingran'] and RESONANCE_CHAIN_DATA['Jingran'] ARE already real,
// sourced numeric data sitting in characters.js today (dated entries, some marked "(confirmed)"),
// per direct user instruction: "make the Jingran block even incomplete, he gets released in 3
// days." This file is built from exactly that already-sourced data — no new numbers invented,
// no rotation/trigger timing/cooldown/duration guessed where the source doesn't give one.
//
// Because CHARACTER_ROTATIONS['Jingran'] still doesn't exist (and this file does not add one —
// that would be exactly the fabrication the characters.js comment above forbids), Jingran is
// NOT part of BLOCKS_BY_CHARACTER's whole-team allMembersConverted gate in calcTeamStats.js —
// that check requires BOTH a blocks file AND a CHARACTER_ROTATIONS entry
// (`BLOCKS_BY_CHARACTER[m.name] && CHARACTER_ROTATIONS[m.name]`). A team including Jingran
// correctly keeps falling back to the legacy per-member RAW-tier formula
// (routeTypeBonuses/calcAvgCrit/calcResMult, calcTeamStats.js's per-member RAW loop) and the
// legacy FULL-tier buff accumulation for the WHOLE team, exactly as documented in this repo's
// own dependency map and RESONANCE_CHAIN_DATA['Jingran']'s own comment ("this row is only read
// self-only by the legacy fallback tier, which... only runs for the Jingran mixed-team case
// today") — this file does not and cannot change that until his real rotation is sourced.
//
// Sparse by design, not by neglect: this is deliberately one of the thinnest block files in the
// codebase. Every block below traces to one of: SKILL_MULTIPLIERS['Jingran'] (characters.js
// ~3735), RESONANCE_CHAIN_DATA['Jingran'] (~6225), CHAR_BUFF_TABLE['Jingran'] (~2774, empty —
// "Pure HP-scaling DPS, no team buffs"), CHARACTER_DATA['Jingran'].desc/statScaling ('HP') and
// dmgFocus (~1491, ['Heavy ATK', 'Liberation']), and SKILL_ICONS['Jingran']'s own move-name-to-
// section mapping (~8438, the only place his individual move names are cross-referenced to a
// real section/stance). No CHARACTER_ROTATIONS, no cooldowns, no Concerto Energy values, no
// Inherent Skill text, no Minor Fortes stat bonuses, no bestEchoes/build/weapon-alts exist
// anywhere in the codebase for him yet — all correctly absent below rather than guessed.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Jingran';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const JINGRAN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS['Jingran'], characters.js ~3735) ──
  // Basis: 'HP' throughout, per CHARACTER_DATA['Jingran'].statScaling ('HP', characters.js ~2052)
  // and his own kit desc ("ATK/DMG scale off Max HP") — the character-wide HP-scaling statement,
  // same convention already used for Cartethyia's blocks (the only other HP-scaling DPS in the
  // roster) rather than defaulting to the schema's 'ATK' default, which the kit text explicitly
  // contradicts. The two Heavy ATK rows' own "(+ Max HP scaling)" suffix in the source table is
  // NOT separately modeled as an extra hit — it's ambiguous whether that means an additional
  // distinct HP-scaling term on top of the listed %, or is just re-stating the row's own basis;
  // modeling either interpretation without a source confirming which would be a guess, so it's
  // left as a note on those two blocks instead.
  //
  // Basic ATK is a real stance-swap kit (Yin Vessel / Yang Font, per SKILL_ICONS['Jingran']'s own
  // 'Drink Soul' (Yin) / "Devil's Bane" (Yang) naming) — modeled as two separate blocks gated by
  // condition.requiresStance, the schema's own field for exactly this (block.schema.js Condition
  // typedef), rather than one block averaging or picking one stance arbitrarily.
  {
    id: 'jingran.basic.drink-soul',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Drink Soul Stage 1-4' },
    condition: { requiresStance: 'Yin Vessel' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('44.74% → 37.28%×2 → 27.33%×4 → 45.95%×2+30.63%×2'), category: 'basicDmg', basis: 'HP' },
    note: "Yin Vessel stance Basic ATK combo (Drink Soul), per SKILL_ICONS['Jingran']. Stance selection (which of Yin Vessel/Yang Font is active at any point in a real rotation) has no sourced trigger/gating logic yet — no CHARACTER_ROTATIONS entry exists for him at all.",
  },
  {
    id: 'jingran.basic.devils-bane',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: "Basic ATK:Devil's Bane Stage 1-4" },
    condition: { requiresStance: 'Yang Font' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('39.82% → 59.68%+39.79% → 47.73%×2+63.64% → 86.95%+12.43%×3'), category: 'basicDmg', basis: 'HP' },
    note: "Yang Font stance Basic ATK combo (Devil's Bane), per SKILL_ICONS['Jingran'].",
  },
  // Skill row 1 (SKILL_MULTIPLIERS 'Encroaching Yin / Scorching Yang'): the source gives ONE
  // shared %-string for both stance names, unlike the Basic ATK/Heavy ATK/second Skill rows below
  // which give distinct per-stance values — modeled as two blocks (one per stance, for the same
  // "which stance is active" gating as the Basic ATK pair above) sharing that one sourced hit
  // list, not as a guess splitting it unevenly between stances.
  {
    id: 'jingran.skill.encroaching-yin',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Encroaching Yin' },
    condition: { requiresStance: 'Yin Vessel' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.61%+32.81%×3'), category: 'skillDmg', basis: 'HP' },
    note: 'Yin Vessel Resonance Skill. SKILL_MULTIPLIERS gives one shared value for Encroaching Yin/Scorching Yang (see block header note).',
  },
  {
    id: 'jingran.skill.scorching-yang',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Scorching Yang' },
    condition: { requiresStance: 'Yang Font' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.61%+32.81%×3'), category: 'skillDmg', basis: 'HP' },
    note: 'Yang Font Resonance Skill, same shared multiplier row as Encroaching Yin — see block header note.',
  },
  // Skill row 2 (SKILL_MULTIPLIERS 'Netherworld Traverse / Afterlife's Guide' — SKILL_ICONS calls
  // these "Resonance Skill Heavy Attack follow-up" moves, but kept as section:'Skill' per the
  // SKILL_MULTIPLIERS table's own literal section column, which is the more specific per-row
  // source for this field per CONTRIBUTING.md ("derive it from the block's own trigger.on value
  // or its place in the kit").
  {
    id: 'jingran.skill.netherworld-traverse',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Netherworld Traverse' },
    condition: { requiresStance: 'Yin Vessel' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('51.69%+25.85%×2+38.77%×4'), category: 'skillDmg', basis: 'HP' },
    note: 'Yin Vessel Resonance Skill Heavy Attack follow-up (per SKILL_ICONS).',
  },
  {
    id: 'jingran.skill.afterlifes-guide',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: "Skill:Afterlife's Guide" },
    condition: { requiresStance: 'Yang Font' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.87%×2+131.74%'), category: 'skillDmg', basis: 'HP' },
    note: "Yang Font Resonance Skill Heavy Attack follow-up (per SKILL_ICONS)." ,
  },
  // Heavy ATK — both are real Forte Circuit Heavy Attacks per SKILL_ICONS ("Forte Circuit Heavy
  // Attack"/"(alt)"), kept as section:'HeavyATK' per SKILL_MULTIPLIERS' own literal section label
  // (same precedent as the Skill-row-2 note above).
  {
    id: 'jingran.heavy.soul-raid',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Soul Raid' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('16.40%×2+21.09%×3+138.22%'), category: 'heavyDmg', basis: 'HP' },
    note: "Real text also carries \"(+ Max HP scaling)\" beyond this % row — a real, sourced additional scaling component with no confirmed distinct value/form, not modeled (see block header note). Forte Circuit Heavy Attack per SKILL_ICONS.",
  },
  {
    id: 'jingran.heavy.stardome-meander',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Stardome Meander' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('24.04%+24.04%+48.08%+144.22%'), category: 'heavyDmg', basis: 'HP' },
    note: '"(+ Max HP scaling)" beyond this % row, same unmodeled-extra-component caveat as Soul Raid above. Forte Circuit Heavy Attack (alt) per SKILL_ICONS.',
  },
  {
    id: 'jingran.liberation.burial-of-thousand-souls',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Burial of Thousand Souls' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('93.15%×8'), category: 'libDmg', basis: 'HP' },
    note: 'Real text: entering the Yinghuo empowerment state (per CHARACTER_DATA desc) via this cast — the empowered-state follow-up strikes it grants have no separately sourced multiplier row, not modeled.',
  },
  {
    id: 'jingran.forte.chimei-wangliang',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Chimei Wangliang' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('83.51%'), basis: 'HP' },
    // category left unset: SKILL_MULTIPLIERS gives no explicit "considered X DMG" label for this row,
    // and it's a summon-proc rather than a directly-cast move, so guessing forteDmg/heavyDmg would be
    // exactly the invented-category mistake CONTRIBUTING.md warns against.
    note: 'Real text: "summon proc on Heavy ATK" — this is a Forte-summon proc that fires off a Heavy ATK cast, not an independently-cast move. Modeled here as its own cast-triggered block (best available trigger shape in this schema) rather than a windowed-proc, since no proc rate/window/cap is sourced. The real "fires off Heavy ATK" linkage is therefore not modeled as a dependency on the Heavy ATK blocks above — an honest gap, not a guess.',
  },
  {
    id: 'jingran.intro.question-the-tombs',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Question the Tombs' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.81%'), basis: 'HP' },
  },
  {
    id: 'jingran.outro.rising-fortune-and-ebbing-evil',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Basis kept 'ATK' here (not 'HP' like every other block above) because SKILL_MULTIPLIERS'
    // own row text explicitly says "795% ATK" — the one row in his whole table that states its
    // own basis in plain text, overriding the character-wide HP-scaling default per CONTRIBUTING.md
    // ("Only use HP/DEF when the character's own kit text says explicitly the hit scales off that
    // stat" — the inverse holds too: don't override an explicit ATK statement with the general case).
    damage: { hits: parseSkillMultiplierHits('795%'), basis: 'ATK' },
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA['Jingran'], characters.js ~6225) ──
  // S1/S2/S6 explicitly marked "(confirmed)" in that table's own comment; S3/S4/S5 are the same
  // real sourced table entries without that extra confirmation label — kept as-is (real data
  // already in the codebase), not omitted, per the user's own explicit direction to use exactly
  // this already-sourced data.
  { id: 'jingran.chain.s1', source: SOURCE, kind: 'buff', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'skillDmg', value: 80, source: 'self-kit' }] },
  { id: 'jingran.chain.s2', source: SOURCE, kind: 'buff', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'heavyDmg', value: 46, source: 'self-kit' }] },
  { id: 'jingran.chain.s3', source: SOURCE, kind: 'buff', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'atkPct', value: 15, source: 'self-kit' }] },
  // S4/S5 stored as 'totalMult' in RESONANCE_CHAIN_DATA (a flat-table-only rotation-averaged
  // stat with no per-hit-category equivalent in this schema) — kept as kind:'utility' with no
  // effects rather than fabricating a category-specific stat this schema has no honest slot for;
  // same "not a totalMult-shaped effect" treatment CHAR_BUFF_TABLE/RESONANCE_CHAIN_DATA's own
  // comments use elsewhere (e.g. Yangyang: Xuanling's S1). CHAR_BUFF_TABLE['Jingran'].note also
  // separately documents a real S4 team buff (+20% All-Attribute DMG Bonus, 30s, conditional on
  // any Resonator gaining a Shield) that this totalMult:10 doesn't obviously match — left
  // unreconciled rather than guessing which (or both) is the real effect.
  { id: 'jingran.chain.s4', source: SOURCE, kind: 'utility', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [], note: 'RESONANCE_CHAIN_DATA stores totalMult:10 here, a rotation-averaged flat-table-only figure with no representable per-category stat in this schema. CHAR_BUFF_TABLE separately documents a real conditional team buff ("+20% All-Attribute DMG Bonus, 30s, on any Resonator gaining a Shield") not reconciled with that number — neither fabricated into an effect.' },
  { id: 'jingran.chain.s5', source: SOURCE, kind: 'utility', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [], note: 'RESONANCE_CHAIN_DATA stores totalMult:5 here, a rotation-averaged flat-table-only figure with no representable per-category stat in this schema — real mechanic, not modeled as an effect.' },
  // S6 note: RESONANCE_CHAIN_DATA's own comment calls this "Heavy ATK DMG taken+40%" — an enemy-
  // side vulnerability/debuff, not a self-buff. Stored on the 'heavyDmg' stat (same table-wide
  // convention as every other character's chain row — this table has no separate debuff-vs-buff
  // split), kept here as a buff on heavyDmg matching the table's own stored shape rather than
  // reinterpreting it into a debuff block the table doesn't structurally support distinguishing.
  { id: 'jingran.chain.s6', source: SOURCE, kind: 'buff', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'heavyDmg', value: 40, source: 'self-kit' }], note: "RESONANCE_CHAIN_DATA's own comment describes this as \"Heavy ATK DMG taken+40%\" (an enemy-side vulnerability on Jingran's Heavy ATK hits landing), stored on the table's shared heavyDmg slot — same shape as every other character's row in that table." },
];
