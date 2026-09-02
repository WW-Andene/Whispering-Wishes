// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/brant.blocks.js
// Brant converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Brant'], RESONANCE_CHAIN_DATA['Brant'] (+ its own detailed audit
// comment, read directly for each node's real mechanic/trigger/stacking),
// SKILL_MULTIPLIERS['Brant'], and CHARACTER_ROTATIONS['Brant']. No new numbers invented.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Brant';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const BRANT_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'brant.intro.applaud-for-me',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Applaud for Me!' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('202.8% + 50.7%') },
  },
  {
    id: 'brant.liberation.to-the-horizon',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:To the Horizon' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('85.1%×4 + 340.2%'), category: 'libDmg' },
  },
  {
    id: 'brant.midair.stage-2-3-charged-flip',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Mid-air:Stage 2-3 + Charged Attack + Flip' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Mid-air, Charged Combo' has 5 arrow-separated stages; this step starts from stage 2 (per
    // its own label) through the end — stages 2-5.
    damage: { hits: parseSkillMultiplierHits('332.5% → 93.0% → 169.0% → 253.9%') },
    note: 'Stages 2-5 of the 5-stage Mid-air Charged Combo (starts from stage 2 per the step\'s own "Stage 2-3" label).',
  },
  {
    id: 'brant.forte.returned-from-ashes',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Returned from Ashes' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('47.2%×2 + 94.4% + 188.9%×2 + 1322.1%'), category: 'basicDmg' },
    note: "Counted as Basic ATK DMG per its own CHARACTER_ROTATIONS note. Also grants the team a 30s shield, not modeled (no DPS component).",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'brant.outro.the-course-is-set',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { element: 'fusion' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh' },
      { stat: 'skillDmg', value: 25, stacking: 'refresh' },
    ],
    note: '+20% Fusion DMG / +25% Resonance Skill DMG to the incoming Resonator, 14s or until they\'re swapped out.',
  },
  {
    id: 'brant.selfbuff.trial-by-fire-and-tide',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: conditional passive, no natural decay
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15 }],
    note: 'Inherent Skill: +15% Fusion DMG Bonus (also grants interrupt resistance during Mid-air Attacks — not modeled, no DPS component).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each
  //    node's real mechanic) ──
  {
    id: 'brant.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Applaud for Me!' },
    timing: { duration: 5 },
    target: { scope: 'self' },
    effects: [{ stat: 'allDmg', value: 20, stacking: 'stacking', maxStacks: 3 }],
    note: 'Real mechanic: casting Intro Skill OR each Mid-air Attack flip grants +20% DMG dealt for 5s, stacking up to 3x (60% at max). RESONANCE_CHAIN_DATA stores the max-stacks total (60); modeled here as per-stack 20% x3 cap so real stacking behavior is captured, not just a flat 60. Only the Intro-cast trigger is wired (a real CHARACTER_ROTATIONS step to anchor it) — the "each Mid-air Attack flip" trigger isn\'t separately modeled (no per-flip step data).',
  },
  {
    id: 'brant.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 30 }],
    note: 'Real trigger: Mid-air Attack / Returned from Ashes hits grant +30% Crit Rate — no duration sourced for this specific node\'s comment, modeled as passive rather than fabricating a timer.',
  },
  {
    id: 'brant.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 42 }],
    note: "Returned from Ashes' own DMG Multiplier +42%.",
  },
  // S4 correctly has NO block — per RESONANCE_CHAIN_DATA's own audit comment, its real effect
  // (Returned from Ashes shield strength +20% + team healing on cast) has zero DPS component.
  {
    id: 'brant.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 15 }],
    note: 'Real trigger: a Basic ATK DMG hit grants +15% Basic Attack DMG Bonus for 10s — no CHARACTER_ROTATIONS step uses a plain \'Basic ATK\' cast (his canonical rotation goes straight to Mid-air combat), so kept passive rather than fabricating a trigger anchor.',
  },
  {
    id: 'brant.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 30 }],
    note: "Mid-air Attack's own DMG Multiplier +30%. Real node ALSO grants a secondary blast on Returned from Ashes worth 30% of its own DMG — a percent-of-another-hit's-damage mechanic this schema can't represent yet, same TODO the flat table's own audit comment carries.",
  },
];
