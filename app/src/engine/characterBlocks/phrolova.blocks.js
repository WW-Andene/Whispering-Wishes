// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/phrolova.blocks.js
// Phrolova converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Phrolova'], RESONANCE_CHAIN_DATA['Phrolova'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Phrolova'], and CHARACTER_ROTATIONS['Phrolova']. No new numbers invented. Her
// Forte follow-ups (Movement of Fate and Finality / Murmurs in a Haunting Dream)
// — 3 real CHARACTER_ROTATIONS steps — have NO matching SKILL_MULTIPLIERS row at
// all, so they're not modeled, and S1 (which scopes those same moves) is inert as
// a result (documented, not silently dropped). S5 correctly has NO block — purely
// defensive, zero DPS component. The rotation's Liberation step name ("Waltz of
// Forsaken Depths") doesn't match SKILL_MULTIPLIERS' row name ("Curtain Call"),
// but both describe the identical mechanic (ends Resolving Chord, enters
// Maestro) — treated as the same move, sourced from Curtain Call's value.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Phrolova';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const PHROLOVA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'phrolova.intro.suite-of-immortality',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Suite of Immortality' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('596.4%'), category: 'skillDmg' },
    note: "Enhanced Intro used only while in Maestro state (her Ultimate was cast last rotation) — a Stagnate hit counted as Skill DMG despite the Intro slot. This is the variant her real rotation always uses (never the base 'Suite of Quietus').",
  },
  {
    id: 'phrolova.basic.stage3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('196.1%'), category: 'basicDmg' },
    note: 'Enters Reincarnate, grants 1 Volatile Note: Strings. Uses only Stage 3\'s own segment of the "Stage 1-3" row (rotation step is a single Basic Attack press).',
  },
  {
    id: 'phrolova.skill.whispers-in-a-fleeting-dream',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Whispers in a Fleeting Dream' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('106.0%×2'), category: 'skillDmg' },
    note: 'Grants 1 Volatile Note: Winds, re-enters Reincarnate.',
  },
  {
    id: 'phrolova.basic.stage1-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('106.9% → 95.4% → 196.1%'), category: 'basicDmg' },
    note: 'Full 3-tap combo, Stage 3 grants another Volatile Note: Strings.',
  },
  {
    id: 'phrolova.heavy.scarlet-coda',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Scarlet Coda' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('33.0%×2 + 12.4%×8 + 495.1%'), category: 'skillDmg' },
    note: "Considered Resonance Skill DMG per its own kit text (not heavyDmg, despite replacing Heavy Attack). Damage scales with stacked Aftersound (cap 24 stacks, real per-stack scaling not modeled — base value used). Activates the Resolving Chord state, unlocking Liberation. Requires 6 Volatile Notes and the Compose state (auto-triggers every 25s, not modeled as a resource gate).",
  },
  {
    id: 'phrolova.liberation.waltz-of-forsaken-depths',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Waltz of Forsaken Depths' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Sourced from the 'Curtain Call' row — same mechanic (ends Resolving Chord, enters Maestro),
    // different name in the rotation data than in SKILL_MULTIPLIERS.
    damage: { hits: parseSkillMultiplierHits('465.2%'), category: 'libDmg' },
    note: 'Costs no Resonance Energy, castable only in Resolving Chord. Ends Resolving Chord and enters Maestro for 24s: +120% self ATK (not modeled, see phrolova.chain.s6 for the S6 Maestro on-field bonus), Hecate fights alongside her.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'phrolova.outro.unfinished-piece',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { element: 'havoc' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh' },
      { stat: 'heavyDmg', value: 25, stacking: 'refresh' },
    ],
    note: 'Ends immediately if the incoming Resonator is swapped out, not modeled. Grants Hecate 2 bonus off-field attacks if cast during Maestro, not modeled (no DPS component representable here).',
  },
  {
    id: 'phrolova.selfbuff.aftersound',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: stacking condition, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 2.5, stacking: 'stacking', maxStacks: 24 }],
    note: 'Aftersound: +2.5% Crit DMG per stack up to 24 stacks (60%) — modeled as per-stack stacking. Beyond 24 stacks it instead grants +1%/stack up to a 100% total cap, not modeled (documented, base 60% cap used).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic; S5 correctly has NO block — purely defensive, zero DPS component) ──
  {
    id: 'phrolova.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 80 }],
    note: "Haunting Dream DMG Multiplier +80% (buffs the two Forte follow-up moves — Movement of Fate and Finality / Murmurs in a Haunting Dream) — those moves have NO matching SKILL_MULTIPLIERS row at all, so this block is present per the source data but does not modify anything modeled (inert, not silently dropped). Also grants Volatile Note - Cadenza every 4s out-of-combat under certain conditions, not modeled.",
  },
  {
    id: 'phrolova.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Scarlet Coda' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 75 }],
    note: "Scarlet Coda's own DMG Multiplier +75% (correct skillDmg category per the audit comment — the wiki explicitly states this instance of damage 'is considered Resonance Skill DMG', not heavyDmg despite replacing Heavy Attack). Also doubles Aftersound's per-stack bonus and grants 14 Aftersound stacks on cast, not modeled. Cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'phrolova.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'echoDmg', value: 80 }],
    note: 'Echo Skill DMG Amplified +80% (confirmed exact) — Enhanced Attack-Hecate is an off-field mechanic with no direct rotation cast to anchor a trigger to, kept passive. Also converts all Volatile Notes to Cadenza on Scarlet Coda cast and applies a 20% ATK reduction debuff (15s) to Enhanced Attack-Hecate: Cadenza targets, neither modeled.',
  },
  {
    id: 'phrolova.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Echo:Use Echo' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20, stacking: 'refresh' }],
    note: 'Casting Echo Skill grants the WHOLE TEAM +20% Attribute DMG Bonus for 30s (confirmed exact, team-wide).',
  },
  // S5 correctly has NO block — Maestro-entry Stagnate field (4s, ends early if she leaves Maestro/
  // swaps) + 30% DMG TAKEN reduction during Maestro, a purely defensive/utility node with NO DMG-
  // dealing component at all.
  {
    id: 'phrolova.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Waltz of Forsaken Depths' },
    timing: { duration: 24 }, // matches Maestro's own 24s window
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 60 }],
    note: 'On-field-during-Maestro case: Phrolova gains +60% Havoc DMG Bonus (the larger of two conditional branches — off-field instead grants a +40% DMG-taken debuff on enemies, not modeled here). Modeled anchored to the Liberation cast that enters Maestro, scoped to its 24s window. The separate +24% Enhanced Attack-Hecate DMG Multiplier (echoDmg-typed) this same node also grants is not tracked alongside this elemDmg value, per the audit\'s own TODO.',
  },
];
