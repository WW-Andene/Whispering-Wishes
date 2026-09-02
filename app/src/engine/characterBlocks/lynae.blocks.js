// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lynae.blocks.js
// Lynae converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Lynae'], RESONANCE_CHAIN_DATA['Lynae'] (+ its own 2026-09-02
// re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Lynae'], and CHARACTER_ROTATIONS['Lynae']. No new numbers
// invented. Re-audited 2026-09-02 against a fresh Prydwen dump: Basic ATK:Polychrome
// Leap x3 (one of only 7 real rotation steps) previously had NO matching
// SKILL_MULTIPLIERS row at all and dealt 0 DMG — fixed, now modeled below. Visual
// Impact/Iridescent Splash are literally named "Basic Attack - Visual Impact" /
// "Basic Attack - Iridescent Splash" in their own move text — real Basic Attack DMG,
// not a separate Forte category (Visual Impact's damage.category was previously
// unset entirely, silently missing every real Basic ATK DMG buff on her single
// biggest hit — fixed). Iridescent Splash/Additive Color still aren't used in her
// real rotation, not modeled.
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
    id: 'lynae.basic.polychrome-leap',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Polychrome Leap ×3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('33.80%×3 → 16.90%×6 → 13.10%×8'), category: 'basicDmg' },
    note: 'Airborne Jump attack chain (3 stages while in Kaleidoscopic Parade), each stage consuming 1/3 Lumiflow and granting 1 True Color point (caps at 3), inflicting Photochromic Flux each time.',
  },
  {
    id: 'lynae.forte.visual-impact',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Visual Impact' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added 2026-09-02: literally named "Basic Attack - Visual Impact" in its own move text —
    // real Basic Attack DMG, not a Forte-exclusive category. Was previously uncategorized entirely,
    // silently missing every real Basic ATK DMG buff from teammates on her single biggest hit.
    damage: { hits: parseSkillMultiplierHits('1216.72%'), category: 'basicDmg' },
    note: 'With all 3 True Color banked — her big Forte finisher, consumes all 3 True Color, inflicts Photochromic Flux, grants the nearby team +40 Tune Break Boost for 30s (not modeled, no DPS component).',
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
    trigger: { type: 'cast', on: 'Basic ATK:Polychrome Leap ×3' },
    timing: {}, target: { scope: 'self' },
    // corrected 2026-09-02: real effect is Polychrome Leap's own DMG Multiplier +120% (was an unsourced
    // totalMult:10 placeholder) — cast-scoped to match lynae.basic.polychrome-leap's own basicDmg
    // category, now that Polychrome Leap has a real damage block (previously unmodeled entirely).
    effects: [{ stat: 'basicDmg', value: 120 }],
    note: 'Basic Attack - Polychrome Leap DMG Multiplier +120% (cast-scoped, instant). Utility half (Spray Paint duration/pull-in, interruption immunity, Overflow restore out of combat) not modeled, no DPS component.',
  },
  {
    id: 'lynae.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'allDmg', value: 25 }],
    note: 'Self +25% All DMG Amp, unconditional (confirmed exact) — kept passive. See lynae.chain.s2-outro-bonus below for this node\'s separate Outro-scoped effect.',
  },
  {
    id: 'lynae.chain.s2-outro-bonus',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    // sequence-gated to S2+ by the 'chain.s2-<suffix>' id convention (sequenceGating.js) — a second,
    // separate real effect on this same node the flat RESONANCE_CHAIN_DATA schema can't hold alongside
    // s2's self-scoped allDmg:25 (same stat name, different scope): "Outro Skill gains the following
    // effect: Casting Outro Skill grants the incoming Resonator 25% All-DMG Amplification for 14s or
    // until the Resonator is switched out" — additive on top of lynae.outro.lets-hit-the-road-buff's
    // base-kit 15% All DMG + 25% Liberation DMG.
    effects: [{ stat: 'allDmg', value: 25, stacking: 'refresh' }],
    note: 'Resonance Chain 2: Outro additionally grants the incoming Resonator +25% All DMG Amp for 14s (or until they swap out, not modeled), on top of the base-kit Outro buff.',
  },
  {
    id: 'lynae.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Visual Impact' },
    timing: {}, target: { scope: 'self' },
    // corrected 2026-09-02: real effect is Visual Impact's (and Iridescent Splash's, not modeled — not
    // used in the real rotation) own DMG Multiplier +90% (was an unsourced totalMult:15 placeholder) —
    // cast-scoped to match lynae.forte.visual-impact's own basicDmg category.
    effects: [{ stat: 'basicDmg', value: 90 }],
    note: 'Basic Attack - Visual Impact / Iridescent Splash DMG Multiplier +90% (cast-scoped, instant; only Visual Impact fires in the modeled rotation). Premixed Hue\'s Additive Color stacking buff (up to 25 stacks × 55%, gated on Lumiflow≥120) not modeled — Additive Color isn\'t cast in the modeled rotation, no DPS component.',
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
    // zeroed 2026-09-02: real effect is up to +90% DMG on Polychrome Leap/Visual Impact via 3 stacks of
    // Color of Soul (30%/stack), but stacks are only gained by casting Kaleidoscopic Parade - Graffiti
    // Blast or Mid-air Heavy Attack — both exclusive to the S6-only alternate rotation that
    // CHARACTER_ROTATIONS['Lynae'] explicitly doesn't model (see that table's own header comment). Zero
    // reachable DPS component in the modeled rotation — was an unsourced totalMult:40 fabrication.
    effects: [],
    note: 'Up to +90% DMG on Polychrome Leap/Visual Impact via Color of Soul stacks (30%/stack, max 3) gained by casting Graffiti Blast/Mid-air Heavy Attack — both exclusive to the S6-only alternate rotation, not modeled in this file. No reachable DPS component in the modeled standard rotation.',
  },
];
