// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/phoebe.blocks.js
// Phoebe converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Phoebe'], RESONANCE_CHAIN_DATA['Phoebe'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Phoebe'], and CHARACTER_ROTATIONS['Phoebe']. No new numbers invented. Her real
// CHARACTER_ROTATIONS stays entirely in Absolution mode (never Confession), so the
// Confession-only Outro/debuff blocks are present (matching CHAR_BUFF_TABLE) but
// inert in the standard rotation. Two real own-kit DMG Multiplier bonuses (+255%
// Absolution on Liberation/Outro, +256% Frazzle-target Amp on Starflash) are kit-
// inherent (not Resonance Chain) and modeled as separate cast-scoped buff blocks,
// distinct from S1-S6. S6's free bonus Starflash proc is left unmodeled per the
// audit's own TODO (no exact %ATK sourced for that specific instance).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Phoebe';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const PHOEBE_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'phoebe.intro.golden-grace',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Golden Grace' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.8%') },
  },
  {
    id: 'phoebe.skill.to-where-light-shines',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:To Where Light Shines' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('62.6%×2'), category: 'skillDmg' },
    note: 'Plants a Ring of Mirrors (30s, freezes hit targets 2s). Standing inside it swaps Basic ATK to Chamuel\'s Star for the rest of the rotation.',
  },
  {
    id: 'phoebe.forte.absolution-litany',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Absolution Litany' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('638.2%') },
    note: 'Prayer gauge fills passively (5/s, 120 cap). Enters Absolution mode, applies 1 Spectro Frazzle stack, refills Divine Voice to 60.',
  },
  {
    id: 'phoebe.liberation.dawn-of-enlightenment',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Dawn of Enlightenment' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('401.6%'), category: 'libDmg' },
    note: 'Base (non-Absolution-boosted) value; see phoebe.kit.dawn-of-enlightenment-absolution-mult below for the +255% Absolution DMG Multiplier bonus this cast gets in her real (Absolution-mode) rotation.',
  },
  {
    id: 'phoebe.skill.chamuels-star',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Skill:Chamuel's Star 1-3" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.4% → 39.8%×2 → 28.9%×6'), category: 'skillDmg' },
    note: "Basic ATK replacement while standing inside the Ring of Mirrors.",
  },
  {
    id: 'phoebe.forte.starflash',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Starflash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('82.7%×3'), category: 'heavyDmg' },
    note: 'Heavy ATK replacement once Divine Voice > 0. Real rotation repeats "3 Basics into Starflash" 4x per Absolution Litany (60/15 Divine Voice) — only one CHARACTER_ROTATIONS step models this, so it fires once here rather than 4x. See phoebe.kit.starflash-frazzle-amp below for the +256% Frazzle-target DMG Amp bonus.',
  },
  {
    id: 'phoebe.outro.attentive-heart',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('528.4%') },
    note: 'Base (non-Absolution-boosted) value; see phoebe.kit.attentive-heart-absolution-mult below for the +255% Absolution DMG Multiplier bonus this cast gets in her real (Absolution-mode) rotation. In Confession mode this instead grants Silent Prayer (see phoebe.outro.confession-* blocks below), not modeled here since her real rotation stays in Absolution.',
  },

  // ── Own-kit DMG Multiplier bonuses (NOT Resonance Chain — real, sourced values from her base kit
  //    text, cast-scoped like every other "own multiplier" block in this file) ──
  {
    id: 'phoebe.kit.dawn-of-enlightenment-absolution-mult',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Dawn of Enlightenment' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 255 }],
    note: 'Dawn of Enlightenment deals a single (non-chained) hit with DMG Multiplier +255% while in Absolution mode (base kit, not Resonance Chain) — cast-scoped (instant, no persistent duration).',
  },
  {
    id: 'phoebe.kit.attentive-heart-absolution-mult',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 255 }],
    note: 'Attentive Heart deals a final hit with DMG Multiplier +255% while in Absolution mode (base kit, not Resonance Chain) — cast-scoped (instant, no persistent duration).',
  },
  {
    id: 'phoebe.kit.starflash-frazzle-amp',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Starflash' },
    timing: {}, target: { scope: 'self' },
    condition: { requiresStance: 'target carries Spectro Frazzle' },
    effects: [{ stat: 'totalMult', value: 256 }],
    note: 'Starflash gains +256% DMG Amp against targets already carrying Spectro Frazzle (base kit, not Resonance Chain) — cast-scoped (instant, no persistent duration).',
  },

  // ── Buff/debuff blocks (from CHAR_BUFF_TABLE) — both Confession-mode-only, present per legacy
  //    convention but inert in her real (Absolution-only) CHARACTER_ROTATIONS ──
  {
    id: 'phoebe.outro.confession-resshred',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'all-enemies' },
    condition: { requiresStance: 'Confession mode' },
    effects: [{ stat: 'resShred', value: 10 }],
    note: 'Confession mode only: Spectro RES -10% for 30s — her real rotation stays in Absolution mode, so this block does not fire.',
  },
  {
    id: 'phoebe.outro.confession-frazzle-amp',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'next-on-field' },
    condition: { requiresStance: 'Confession mode' },
    effects: [{ stat: 'deepen', value: 100, stacking: 'refresh' }],
    note: 'Confession mode only: grants the on-field ally Silent Prayer (+100% Spectro Frazzle DMG Amp, plus -10% target Spectro RES and 50% longer Frazzle interval, neither modeled) — her real rotation stays in Absolution mode, so this block does not fire. The 18-Frazzle-stack debuff (frazzle stat, Level-scaling DOT) has no matching stat key in this schema, not modeled.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'phoebe.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Dawn of Enlightenment' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 225 }],
    note: "In Absolution, Dawn of Enlightenment's own DMG Multiplier +225% additional (in Confession instead +90% DMG Mult and max-stack Frazzle application, not modeled since her real rotation stays in Absolution) — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'phoebe.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'deepen', value: 120 }],
    note: 'In Absolution, Outro DMG to Frazzle-afflicted targets +120% Amp (in Confession instead increases Silent Prayer\'s own Frazzle DMG Amp by another 120%, not modeled) — cast-scoped to the Outro (instant, no persistent duration).',
  },
  {
    id: 'phoebe.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Starflash' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 91 }],
    note: "Starflash DMG Multiplier +91% in Absolution (+249% in Confession, not modeled) — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'phoebe.chain.s4',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'cast', on: "Skill:Chamuel's Star 1-3" },
    timing: { duration: 30 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'resShred', value: 10, stacking: 'refresh' }],
    note: "Basic ATK/Chamuel's Star/Dodge Counter/Chamuel's Star: Dodge Counter hits reduce the target's Spectro RES by 10% for 30s — modeled anchored to Chamuel's Star (the real rotation's Basic ATK-equivalent while inside the Ring of Mirrors).",
  },
  {
    id: 'phoebe.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Golden Grace' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 12 }],
    note: 'Casting Intro Skill Golden Grace grants +12% Spectro DMG Bonus for 15s.',
  },
  {
    id: 'phoebe.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:To Where Light Shines' },
    timing: { duration: 20 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 10 }],
    note: 'In Absolution/Confession, summoning a Ring of Mirrors (Resonance Skill cast) grants +10% ATK for 20s. Also triggers one free extra Starflash at the ring (no Divine Voice cost) and +2s stagnation/all-target application, neither modeled — no exact %ATK sourced for the free Starflash instance and no home for the non-DPS stagnation utility in this schema, per the audit\'s own TODO.',
  },
];
