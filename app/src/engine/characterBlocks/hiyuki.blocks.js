// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/hiyuki.blocks.js
// Hiyuki converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Hiyuki'], RESONANCE_CHAIN_DATA['Hiyuki'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Hiyuki'], and CHARACTER_ROTATIONS['Hiyuki']. No new numbers invented.
// Foreclaiming: Blade Liberation's per-Snowforged-Blade DMG scaling (up to
// +2385.72% max) and S6's further conditional Crit DMG/Glacio Bite stacking have
// no home in this flat schema and are documented rather than force-fit.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Hiyuki';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const HIYUKI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS — most rows are "considered Resonance Liberation DMG"
  //    despite the Basic ATK/Heavy ATK/Skill/Intro slot actually used to cast them) ──
  {
    id: 'hiyuki.liberation.frostedge',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Frostedge' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('156.15%'), category: 'libDmg' },
    note: 'Opener hit applying Glacio Chafe; considered Resonance Liberation DMG despite the Intro Skill input.',
  },
  {
    id: 'hiyuki.basic.present-self-stage3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Present Self Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says the Intro leaves her primed to land Stage 3 directly (only
    // that segment of the row's 3-stage combo fires) — plain Basic ATK DMG, not reclassified.
    damage: { hits: parseSkillMultiplierHits('4.92%×5+98.37%'), category: 'basicDmg' },
    note: 'Only Stage 3 lands (the Intro skips straight to it). Applies Glacio Chafe.',
  },
  {
    id: 'hiyuki.liberation.frost-splinter-present-self',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Frost Splinter: Present Self' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('79.31%×2+158.61%'), category: 'libDmg' },
    note: 'Interruption-immune throughout, applies Glacio Chafe on the last hit; considered Resonance Liberation DMG despite the Heavy ATK input.',
  },
  {
    id: 'hiyuki.liberation.foreclaiming-inward-vision',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Foreclaiming: Inward Vision' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('397.62%'), category: 'libDmg' },
    note: 'Ultimate: enters Foreclaimed Self, applies 4 stacks of Glacio Chafe on hit, grants 3 Frostharden Iai.',
  },
  {
    id: 'hiyuki.liberation.foreclaimed-self-stage1-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Foreclaimed Self Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('49.27% → 40.02%×2 → 25.16%×4+67.08%'), category: 'libDmg' },
    note: 'Basic ATK replacement in Foreclaimed Self; Stage 3 applies Glacio Chafe. Considered Resonance Liberation DMG. Fires twice in the real rotation (real, repeated cast, not a bug).',
  },
  {
    id: 'hiyuki.skill.frostblight-jade-cleave',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Frostblight: Jade Cleave' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('66.01%×4'), category: 'skillDmg' },
    note: 'Ground Resonance Skill replacement in Foreclaimed Self; pulls in targets, restores Frostheart, removes Frostbind.',
  },
  {
    id: 'hiyuki.skill.frostblight-petalfall',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Frostblight: Petalfall' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('64.02%×4+64.02%'), category: 'skillDmg' },
    note: 'Mid-air Resonance Skill replacement in Foreclaimed Self; shares a cooldown with Jade Cleave.',
  },
  {
    id: 'hiyuki.liberation.iai',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Iai' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('283.82%+47.31%×4'), category: 'libDmg' },
    note: 'Cast in Iai Stance (100+ Frostheart), up to 3 uses per entry; each cast consumes 1 Frostharden Iai for 3 Glacio Chafe stacks and grants 1 Whiteout Bitterfrost. Considered Resonance Liberation DMG.',
  },
  {
    id: 'hiyuki.liberation.bitterfrost-foreclaimed-self',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Bitterfrost: Foreclaimed Self' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('15.41%×8+493.05%'), category: 'libDmg' },
    note: 'Forte finisher once Whiteout Bitterfrost is full; consumes it for 1 Snowforged Blade. Considered Resonance Liberation DMG despite the Heavy ATK input.',
  },
  {
    id: 'hiyuki.liberation.foreclaiming-blade-liberation',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Foreclaiming: Blade Liberation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.81%+795.24%'), category: 'libDmg' },
    note: '2nd Ultimate; base value used. Real DMG also scales +795.24% additional per Snowforged Blade stack consumed (up to 3 stacks, +2385.72% max) — not modeled (no stacking-scalar field for a per-resource-unit damage bonus). Ends Foreclaimed Self.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'hiyuki.outro.snowlight-blessing',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    condition: { element: 'glacio' },
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'refresh' }],
    note: 'Team Glacio DMG +20% vs. targets affected by Glacio Chafe — excludes Hiyuki herself (not modeled, applied team-wide like every other team buff in this schema).',
  },
  {
    id: 'hiyuki.selfbuff.fine-snow-critdmg',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: conditional on Snow Rust stacks, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 40 }],
    note: 'Inherent Fine Snow: +40% Crit DMG at 1 stack of Snow Rust (self-applied via her own Glacio Chafe) — no single CHARACTER_ROTATIONS step names this specifically, kept passive since she applies Glacio Chafe on most of her own casts.',
  },
  {
    id: 'hiyuki.selfbuff.fine-snow-glacio-bite',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: conditional on Snow Rust stacks (needs teammates applying Glacio Chafe/Havoc Bane), no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 60 }],
    note: 'Inherent Fine Snow: Glacio Bite DMG Amp (distinct multiplier from base Glacio DMG Bonus) +30% at 1 stack of Snow Rust, +30% more at 3 stacks (teammates applying Glacio Chafe/Havoc Bane, e.g. Lucilla/Chisa/Suisui) — modeled at the ceiling (60%) rather than the ramp, kept passive.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'hiyuki.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 120 }],
    note: 'Foreclaimed Self core moves DMG Multiplier +120% (confirmed exact per the audit comment) — kept passive, applies broadly to her many Foreclaimed Self Liberation-labeled blocks above rather than one specific cast.',
  },
  {
    id: 'hiyuki.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Iai' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 125 }],
    note: "Basic Attack - Iai's own DMG Multiplier +125% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'hiyuki.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 160 }],
    note: 'Frost Splinter: Present Self AND Bitterfrost: Foreclaimed Self DMG Multiplier +160% (corrected from heavyDmg -> libDmg per the audit, both are "considered Resonance Liberation DMG" despite the Heavy Attack slot) — kept passive, applies to both blocks above.',
  },
  {
    id: 'hiyuki.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Frostblight: Jade Cleave' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20, stacking: 'refresh' }],
    note: '+20% DMG dealt by all nearby team Resonators for 30s on Present Self/Jade Cleave/Petalfall cast (corrected from a wrong atkPct:15 to the real allDmg:20 per the audit) — modeled on the Jade Cleave cast used in her real rotation. Self-heal 18% Max HP on the same trigger not modeled (no DPS component).',
  },
  {
    id: 'hiyuki.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 80 }],
    note: 'Present Self/Jade Cleave/Petalfall Resonance Skill DMG +80% (confirmed exact category, corrected value) — kept passive, applies to both Skill blocks above.',
  },
  {
    id: 'hiyuki.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 500 }],
    note: 'Foreclaiming: Inward Vision/Blade Liberation Crit DMG +500% (corrected from 100 per the audit) — kept passive. A further conditional +40% Crit DMG at 2 Snow Rust stacks and +25% Glacio Bite DMG taken at 3 stacks are NOT modeled (stacking on top of an already-conditional Inherent Skill mechanic with no clean single-node home in this schema, per the audit\'s own TODO).',
  },
];
