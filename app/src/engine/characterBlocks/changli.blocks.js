// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/changli.blocks.js
// Changli converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Changli'], RESONANCE_CHAIN_DATA['Changli'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Changli'], and CHARACTER_ROTATIONS['Changli']. No new numbers
// invented. S1/S4's conditional-cast gating and S2's short 8s window are the same
// class of "flat schema can't fully express a gated bonus" limitation the source
// audit already documents for this row.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Changli';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const CHANGLI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'changli.intro.obedience-of-rules',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Obedience of Rules' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('44.50%+25.96%×4') },
    note: 'Also opens a 12s True Sight window.',
  },
  {
    id: 'changli.skill.true-sight-capture',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:True Sight: Capture' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('81.88%×3+163.76%'), category: 'skillDmg' },
    note: "Row 'True Sight: Capture / Conquest / Charge' has 3 arrow-separated segments (Capture / its ground follow-up Conquest / its mid-air follow-up Charge) — only Capture's own segment used here, since CHARACTER_ROTATIONS has no separate Conquest/Charge step (each True Sight window is consumed by only one of the two, and the rotation doesn't specify which).",
  },
  {
    id: 'changli.heavy.standard',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Standard / Mid-air Heavy' has 2 arrow-separated segments — the rotation step explicitly
    // does both (ground Heavy ATK, then again in the air), so both are combined here.
    damage: { hits: [...parseSkillMultiplierHits('28.99%×3+37.27%'), ...parseSkillMultiplierHits('123.27%')] },
  },
  {
    id: 'changli.liberation.radiance-of-fealty',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Radiance of Fealty' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1212.75%'), category: 'libDmg' },
    note: 'Grants 4 Enflamement (caps, does not stack past 4) and Fiery Feather (self +25% ATK on the next Forte Heavy ATK within 10s).',
  },
  {
    id: 'changli.forte.flaming-sacrifice',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Flaming Sacrifice' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('39.25%×5+457.85%'), category: 'heavyDmg' },
    note: 'At 4 Enflamement stacks, replaces Heavy ATK. 40% DMG reduction while casting, not modeled (no DPS component).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'changli.outro.strategy-of-duality',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 10, forfeitOnRecipientSwapOut: true },
    target: { scope: 'next-on-field' },
    condition: { element: 'fusion' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh' },
      { stat: 'libDmg', value: 25, stacking: 'refresh' },
    ],
    // Retrofitted 2026-09-03 (REMAINING_WORK.md 1a): forfeitOnRecipientSwapOut now actually clamps
    // this to the incoming Resonator's own swap-out instant when it's shorter than the full 10s.
    note: 'Ends early if the incoming Resonator is swapped out before 10s.',
  },
  {
    id: 'changli.selfbuff.fiery-feather',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Radiance of Fealty' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 25 }],
    note: 'Fiery Feather: self ATK +25% on the next Forte Heavy ATK (Flaming Sacrifice) within 10s of Liberation — consuming it ends Fiery Feather early, not modeled.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic) ──
  {
    id: 'changli.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'skillDmg', value: 10 },
      { stat: 'heavyDmg', value: 10 },
    ],
    note: 'Real mechanic: conditional to Resonance Skill Tripartite Flames AND Heavy Attack Flaming Sacrifice casts specifically (+ interruption resistance, no stat field) — modeled passive rather than fabricating separate per-skill timers, matching the closest categories (skillDmg/heavyDmg) per the audit comment.',
  },
  {
    id: 'changli.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Radiance of Fealty' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 25 }],
    note: 'Real mechanic: gaining Enflamement raises Crit Rate +25% for 8s — Radiance of Fealty is the only real CHARACTER_ROTATIONS step that grants Enflamement, so the trigger is scoped to its cast.',
  },
  {
    id: 'changli.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Radiance of Fealty' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 80 }],
    note: "Real scope: Radiance of Fealty's own DMG Multiplier +80% — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'changli.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Obedience of Rules' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: 'Real mechanic: after Intro Skill, team ATK +20% for 30s — gated behind an Intro-Skill cast, not a flat always-on buff.',
  },
  {
    // Corrected 2026-09-03 against a fresh the source dump: this node has TWO separate, compounding +50%
    // effects — "Multiplier is increased by 50%" (a raw DMG Multiplier bonus, modeled via totalMult,
    // same stat/shape as Camellya's own S2/S5 totalMult nodes) AND "DMG dealt is increased by 50%" (a
    // heavyDmg-category bonus). Previously only the latter was modeled — this note used to say the flat
    // table "is the only value sourced for this node," which this pass fixes by sourcing the 2nd value
    // for real, rather than leaving it dropped.
    id: 'changli.chain.s5-heavydmg',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Flaming Sacrifice' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 50 }],
    note: "Flaming Sacrifice's DMG dealt +50% (the 2nd, separate half of this node — see changli.chain.s5-totalmult for the DMG Multiplier half) — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'changli.chain.s5-totalmult',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Flaming Sacrifice' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 50 }],
    note: "Flaming Sacrifice's DMG Multiplier +50% (the 1st, separate half of this node — see changli.chain.s5-heavydmg for the DMG-dealt half) — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'changli.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 40 }],
    note: 'Tripartite Flames, Flaming Sacrifice, and Radiance of Fealty ignore an additional 40% of target DEF — conditional to those 3 specific casts, kept passive rather than fabricating 3 separate per-skill timers.',
  },
];
