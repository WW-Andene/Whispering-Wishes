// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/zhezhi.blocks.js
// Zhezhi converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Zhezhi'], RESONANCE_CHAIN_DATA['Zhezhi'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Zhezhi'], and CHARACTER_ROTATIONS['Zhezhi']. No new numbers invented. S2
// correctly has NO block — a resource-cap-increase mechanic with no home in this
// flat schema, per the audit's own zeroing. S5/S6's bonus-hit-at-X%-of-move-Y's-
// multiplier mechanics ARE precisely computable and audit-confirmed (140%/120% of
// a sourced move's own multiplier, cross-checked against nanoka's raw damage data),
// so both are modeled as real proc-style damage blocks instead of left zeroed.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Zhezhi';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const ZHEZHI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'zhezhi.intro.radiant-ruin',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Radiant Ruin' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('86.16%×3') },
    note: 'Fills roughly 1.5 of her 3 Afflatus segments.',
  },
  {
    id: 'zhezhi.basic.dimming-brush-stage1-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Dimming Brush Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('41.76%×2 → 20.55%×5 → 133.61%'), category: 'basicDmg' },
    note: 'Fills the remaining Afflatus.',
  },
  {
    id: 'zhezhi.skill.manifestation',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Manifestation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('98.42%×3'), category: 'skillDmg' },
    note: 'At 60+ Afflatus, consumes 60 to summon Phantasmic Imprint - Left and Right. 6s cooldown.',
  },
  {
    id: 'zhezhi.forte.conjuration',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Conjuration' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('83.01%×3'), category: 'heavyDmg' },
    note: 'At 30+ Afflatus, consumes 30 to summon Phantasmic Imprint - Middle.',
  },
  {
    id: 'zhezhi.forte.stroke-of-genius',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Stroke of Genius' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Stroke of Genius / Creation's Zenith' — only the Stroke of Genius segment matches this step.
    damage: { hits: parseSkillMultiplierHits('298.22%'), category: 'basicDmg' },
    note: "Teleports to and consumes a Phantasmic Imprint, counted as Basic ATK DMG. Fires twice in the real rotation, escalating into Creation's Zenith once Painter's Delight hits 2 stacks.",
  },
  {
    id: 'zhezhi.liberation.living-canvas',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Living Canvas' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 'up to 21 over 30s' — the max-consumption case is used as a representative value.
    damage: { hits: Array.from({ length: 21 }, () => ({ atkPct: 65.21 })), category: 'coordDmg' },
    note: 'Summons Coordinated-ATK spirits (Basic ATK DMG-typed, modeled as coordDmg) whenever the active Resonator deals damage — modeled at the max 21-Spirit case. 25s cooldown.',
  },
  {
    id: 'zhezhi.forte.creations-zenith',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Forte:Creation's Zenith" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('119.29%×3'), category: 'basicDmg' },
    note: "Needs 2 stacks of Painter's Delight, counted as Basic ATK DMG. Also grants +18% Basic ATK DMG Bonus for 27s (see zhezhi.kit.creations-zenith-buff below). Finisher — Dash Cancel to skip remaining recovery.",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE, plus a real base-kit multiplier sourced directly from
  //    SKILL_MULTIPLIERS' own row text, not the Resonance Chain) ──
  {
    id: 'zhezhi.outro.carve-and-draw',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 }, target: { scope: 'next-on-field' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh' },
      { stat: 'skillDmg', value: 25, stacking: 'refresh' },
    ],
    note: 'No direct DMG on the Outro itself. Also grants 15 Resonance Energy via Inherent Skill Flourish, not modeled.',
  },
  {
    id: 'zhezhi.kit.creations-zenith-buff',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: "Forte:Creation's Zenith" },
    timing: { duration: 27 },
    target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 18 }],
    note: "Creation's Zenith (base kit, not Resonance Chain): needs 2 stacks of Painter's Delight and also grants +18% Basic ATK DMG Bonus for 27s — sourced directly from SKILL_MULTIPLIERS' own row text.",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own detailed audit comment for each
  //    node's real mechanic; S2/S5/S6 correctly have NO block — resource-cap-increase and bonus-hit-at-
  //    X%-of-move-Y's-multiplier mechanics with no home in this flat schema, per the audit's own zeroing) ──
  {
    id: 'zhezhi.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 10 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  // S2 correctly has NO block — "Max Inklit Spirits summoned by Living Canvas +6" (21 -> 27 cap), not
  // a percentage stat at all, no home in the flat {stat: value} schema.
  {
    id: 'zhezhi.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 15 }],
    note: 'ATK +15% per stack, stacks up to 3, on Manifestation/Stroke of Genius/Creation\'s Zenith cast — the stored RESONANCE_CHAIN_DATA value (15) is used as-is per this file\'s own confirmed-correct note; the real per-stack/max-stack breakdown isn\'t further disambiguated in the source comment, so no stacking mechanic is fabricated here. Kept passive.',
  },
  {
    id: 'zhezhi.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Living Canvas' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: 'Team ATK +20% for 30s on Living Canvas cast (confirmed exact, team-wide).',
  },
  {
    id: 'zhezhi.chain.s5-bonus-hit',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Living Canvas' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 140% x 65.21% = 91.29%, matching nanoka's raw Living Canvas damage-data row 2 of 91.3% exactly
    // per the audit comment's own cross-check — a real, precisely computable figure, not a guess.
    damage: { hits: [{ atkPct: 91.29 }], category: 'coordDmg' },
    note: "Every 3 Inklit Spirits summoned by Living Canvas, 1 extra Inklit Apparition procs a Coordinated ATK at 140% of Inklit Spirit's own DMG Multiplier — modeled as a real proc-style damage block using the audit's own computed figure, instead of the flat {} RESONANCE_CHAIN_DATA carries for this node (same \"discrete proc, not a modifier\" treatment as Yinlin's S6/Calcharo's S6).",
  },
  {
    id: 'zhezhi.chain.s6-bonus-hit',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Stroke of Genius' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 120% x 298.22% = 357.86%, matching nanoka's raw Ink and Wash damage-data row 4 of 357.86%
    // exactly per the audit comment's own cross-check.
    damage: { hits: [{ atkPct: 357.86 }], category: 'basicDmg' },
    note: "On Stroke of Genius/Creation's Zenith cast, an extra Ivory Herald procs at 120% of Stroke of Genius's own DMG Multiplier — modeled as a real proc-style damage block using the audit's own computed figure, same \"discrete proc, not a modifier\" treatment as S5 above. Anchored to the Stroke of Genius cast.",
  },
];
