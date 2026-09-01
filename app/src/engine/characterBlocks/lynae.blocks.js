// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lynae.blocks.js
// Lynae converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Lynae'], RESONANCE_CHAIN_DATA['Lynae'] (+ its own audit comment,
// read directly for each node's real mechanic), SKILL_MULTIPLIERS['Lynae'], and
// CHARACTER_ROTATIONS['Lynae']. No new numbers invented. Basic ATK:Polychrome
// Leap x3 has NO matching SKILL_MULTIPLIERS row at all — not modeled rather than
// guessed. Iridescent Splash/Additive Color aren't used in her real rotation, not
// modeled.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Lynae';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const LYNAE_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'lynae.intro.time-to-show-some-colors',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Time to Show Some Colors!' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('22.48%×10') },
    note: 'Restores 100 Overflow, inflicts Photochromic Flux (Tune Rupture or Tune Strain, per chosen Resonance Mode).',
  },
  {
    id: 'lynae.liberation.prismatic-overblast',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Prismatic Overblast' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('87.48%×10'), category: 'libDmg' },
    note: 'Also grants the whole nearby team +24% All DMG Bonus for 30s (see lynae.libbuff.prismatic-overblast below). Its automatic Basic Attack follow-up is skipped, not modeled.',
  },
  {
    id: 'lynae.skill.lynae-style-palettes',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Lynae-Style Palettes' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('139.31% + 46.44%×3'), category: 'skillDmg' },
    note: 'Restores more Overflow toward the 120 cap.',
  },
  {
    id: 'lynae.heavy.spark-collision-full-charge',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Spark Collision (full charge)' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Matches the row 'Spark Collision Lv.3' — the strongest tier, per the rotation's own note text.
    damage: { hits: parseSkillMultiplierHits('277.78%×2') },
    note: 'Interruption-immune and 50% DMG Reduction throughout the charge. Releases the strongest tier (Lv.3), puts her into Kaleidoscopic Parade.',
  },
  {
    id: 'lynae.forte.visual-impact',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Visual Impact' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1216.72%') },
    note: 'With all 3 True Color banked — her big Forte finisher, consumes all 3 True Color, inflicts Photochromic Flux, grants the nearby team +40 Tune Break Boost for 30s (not modeled, no DPS component). Basic ATK:Polychrome Leap x3 (which builds True Color) has no matching SKILL_MULTIPLIERS row at all, not modeled.',
  },
  {
    id: 'lynae.outro.lets-hit-the-road',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 100 }] },
    note: 'Also ends Kaleidoscopic Parade and grants the incoming Resonator buffs (see lynae.outro.lets-hit-the-road-buff below).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'lynae.outro.lets-hit-the-road-buff',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [
      { stat: 'allDmg', value: 15, stacking: 'refresh' },
      { stat: 'libDmg', value: 25, stacking: 'refresh' },
    ],
    note: 'Ends early if the incoming Resonator swaps out before 14s, not modeled.',
  },
  {
    id: 'lynae.libbuff.prismatic-overblast',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Prismatic Overblast' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 24, stacking: 'refresh' }],
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'lynae.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 10 }],
    note: 'Confirmed exact value, no further scope detail sourced beyond the flat value — kept passive.',
  },
  {
    id: 'lynae.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'allDmg', value: 25 }],
    note: 'Team +25% All DMG Amp, self-gain portion (confirmed exact) — the audit comment describes this as the self-facing share of a team-scoped mechanic, so modeled self-scoped rather than team-wide (ambiguous phrasing, documented rather than guessed toward team-wide).',
  },
  {
    id: 'lynae.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 15 }],
    note: 'Confirmed exact value, no further scope detail sourced beyond the flat value — kept passive.',
  },
  {
    id: 'lynae.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: 'ATK+20% (confirmed exact, corrected from an earlier unsourced totalMult:10) — no further scope detail sourced, kept passive.',
  },
  {
    id: 'lynae.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Prismatic Overblast' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 70 }],
    note: "Prismatic Overblast Liberation DMG Multiplier +70% (confirmed exact, corrected from an earlier unsourced totalMult:15) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'lynae.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 40 }],
    note: 'Confirmed exact value, no further scope detail sourced beyond the flat value — kept passive.',
  },
];
