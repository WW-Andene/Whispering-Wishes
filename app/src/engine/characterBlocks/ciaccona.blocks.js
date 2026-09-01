// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/ciaccona.blocks.js
// Ciaccona converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Ciaccona'], RESONANCE_CHAIN_DATA['Ciaccona'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Ciaccona'], and CHARACTER_ROTATIONS['Ciaccona']. No new numbers
// invented. S3/S6 correctly have NO block — real resource-grant/flat-%ATK-proc
// mechanics with no home in the flat {stat: value} schema, per the audit's own
// zeroing (same "don't force-fit" rule already applied throughout this file).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Ciaccona';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const CIACCONA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'ciaccona.intro.roaming-with-the-wind',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Roaming with the Wind' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('189.11%') },
    note: 'Inflicts Aero Erosion, skips straight to Basic ATK Stage 3.',
  },
  {
    id: 'ciaccona.basic.stage3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('33.02%×4'), category: 'basicDmg' },
  },
  {
    id: 'ciaccona.basic.stage4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('61.14%×4'), category: 'basicDmg' },
    note: 'Inflicts Aero Erosion, grants 1 Musical Essence, and starts Solo Concert (24% Aero DMG Bonus to nearby team — see ciaccona.libbuff.solo-concert below). Fires twice in the real rotation (real, repeated cast, not a bug).',
  },
  {
    id: 'ciaccona.midair.attack-stage1-2',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Mid-air:Attack Stage 1-2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [...parseSkillMultiplierHits('55.43%×2'), ...parseSkillMultiplierHits('24.46%×4')] },
  },
  {
    id: 'ciaccona.skill.harmonic-allegro',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Harmonic Allegro' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('40.39%×4'), category: 'skillDmg' },
    note: 'Inflicts another Aero Erosion stack, restores Concerto Energy.',
  },
  {
    id: 'ciaccona.forte.quadruple-downbeat',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Quadruple Downbeat' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('31.41%×10+314.03%') },
    note: 'Consumes all 3 stacked Musical Essence, inflicts Aero Erosion, restores 25 Concerto Energy.',
  },
  {
    id: 'ciaccona.liberation.singers-triple-cadenza',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Liberation:Singer's Triple Cadenza" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1100.42%'), category: 'libDmg' },
    note: 'Enters Recital: periodic Symphonic Poem: Tonic pulses via green/yellow prompts, even off-field.',
  },
  {
    id: 'ciaccona.liberation.symphonic-poem-tonic',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Symphonic Poem: Tonic' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('6.12%×20'), category: 'libDmg' },
    note: 'Periodic pulse during Recital over the field duration, triggered by successful prompt interaction. Modeled as one representative full-duration hit-set, not the real per-pulse timing.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'ciaccona.outro.windcalling-tune',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'next-on-field' },
    condition: { element: 'aero' },
    effects: [{ stat: 'deepen', value: 100, stacking: 'refresh' }],
    note: 'Aero Erosion DMG Amp only — not a general DMG Amp.',
  },
  {
    id: 'ciaccona.libbuff.solo-concert',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 4' },
    timing: { duration: 99 }, // sentinel: real trigger is the Ensemble Sylph summon from Mid-air-cancelling Stage 4, near-permanent uptime per its own audit note
    target: { scope: 'whole-team' },
    effects: [{ stat: 'elemDmg', value: 24, stacking: 'refresh' }],
    note: 'Solo Concert: team +24% Aero DMG Bonus, from Basic ATK Stage 4\'s Ensemble Sylph summon, NOT Liberation itself — near-permanent uptime once active. Was wrongly allDmg (all-element) in an earlier version, corrected to elemDmg (Aero-only).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S3/S6 correctly have NO block — pure resource-grant / flat-%ATK-proc
  //    mechanics with no home in this schema, per the audit's own zeroing) ──
  {
    id: 'ciaccona.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 35 }],
    note: 'ATK +35% after Basic ATK (conditional) — kept passive rather than fabricating a specific per-stage trigger anchor, since the source condition text doesn\'t name one particular Basic ATK stage.',
  },
  {
    id: 'ciaccona.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'elemDmg', value: 40 }],
    note: 'Team +40% Aero DMG Bonus (corrected from allDmg to elemDmg per the 2026-09-01 re-audit — was granting a phantom all-element buff) — no specific cast trigger sourced, kept passive.',
  },
  // S3 correctly has NO block — real effect ("+1 Musical Essence segment on Basic Attack Stage 4" +
  // "+1 charge on Resonance Skill Harmonic Allegro") is pure resource/utility, zero DPS component.
  {
    id: 'ciaccona.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 45 }],
    note: 'DEF Ignore +45% (confirmed exact value/category per the re-audit) — no specific cast trigger or scope sourced beyond the flat value, kept passive/self.',
  },
  {
    id: 'ciaccona.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: "Liberation:Singer's Triple Cadenza" },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 40 }],
    note: "Real scope: Singer's Triple Cadenza's own DMG Multiplier +40% — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  // S6 correctly has NO block — real effect is a standalone proc (each Solo Concert pulse deals a
  // flat 220% of Ciaccona's ATK as Aero DMG, counted as Liberation DMG), not a Liberation DMG% buff.
  // A flat %-of-ATK bonus hit doesn't fit the {stat: value} buff schema (same class of gap already
  // flagged for Xiangli Yao's S1 and Zhezhi's S5/S6) — zeroed to {} per the source audit.
];
