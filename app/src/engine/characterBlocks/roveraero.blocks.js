// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/roveraero.blocks.js
// Rover: Aero converted to TriggerBlocks. Sourced from characters.js's already-
// audited CHAR_BUFF_TABLE['Rover: Aero'], RESONANCE_CHAIN_DATA['Rover: Aero'],
// SKILL_MULTIPLIERS['Rover: Aero'], and CHARACTER_ROTATIONS['Rover: Aero']. No new
// numbers invented. Unlike most other rows in this file, RESONANCE_CHAIN_DATA's
// own line for Rover: Aero has no adjacent per-node audit comment (the nearby
// comment block actually documents Rover: Electro's chain, confirmed by its node
// names — Celestial Ingenuity/Overshock — which belong to the Electro attunement,
// not Aero) — S1/S2 are already correctly empty in the source data, and S3-S6 are
// used as-is, flagged here as unverified beyond their flat values rather than
// silently treated as fully precise. Both her outroBuffs and libBuffs store
// non-DPS values (an Aero Erosion stack-cap increase, a flat+%ATK healing
// formula) under a 'totalMult' key that doesn't actually represent a damage
// multiplier — neither is modeled, to avoid injecting a false DMG bonus.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Rover: Aero';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const ROVER_AERO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'roveraero.intro.relentless-squall',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Relentless Squall' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('79.53%+119.29%') },
    note: 'Launches into the air, grants 20 Windstring.',
  },
  {
    id: 'roveraero.forte.cloudburst-dance',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Cloudburst Dance' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('128.80%+141.47%'), category: 'skillDmg' },
    note: 'Mid-air ATK combo, considered Resonance Skill DMG; heals the team on hit (not modeled). Fires twice in the real rotation.',
  },
  {
    id: 'roveraero.liberation.omega-storm',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Omega Storm' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('536.79%'), category: 'libDmg' },
    note: 'Also heals nearby team ~2090 + 77% ATK, not modeled (no DPS component). Instantly grounds her, can be cast mid-air near ground.',
  },
  {
    id: 'roveraero.skill.awakening-gale',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Awakening Gale' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('66.44%+99.66%'), category: 'skillDmg' },
    note: 'Ground Skill, 3s cooldown, sends her back into the air.',
  },
  {
    id: 'roveraero.skill.skyfall-severance',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Skyfall Severance' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('23.37%×3+105.15%'), category: 'skillDmg' },
    note: 'Mid-air Skill (12s cooldown), converts negative-status debuffs on the target into Aero Erosion stacks. Optional — skipped if no teammate applies those debuffs.',
  },
  {
    id: 'roveraero.midair.plunging-attack',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Mid-air:Plunging Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('140.76%') },
    note: 'Plunges back down to the ground.',
  },
  {
    id: 'roveraero.forte.unbound-flow',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Unbound Flow' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('34.30%×5+723.03%'), category: 'skillDmg' },
    note: 'At max Windstring, Resonance Skill becomes this instead; considered Resonance Skill DMG. Part 2 resolves automatically off-field.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — no adjacent per-node audit comment exists
  //    for this row specifically, see file header; S1/S2 correctly have NO block, already empty in the
  //    source data) ──
  {
    id: 'roveraero.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15 }],
    note: 'Flat value used as-is — no adjacent audit comment sourced beyond the RESONANCE_CHAIN_DATA line itself, flagged as unverified rather than silently treated as fully precise. Kept passive.',
  },
  {
    id: 'roveraero.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 15 }],
    note: 'Flat value used as-is — no adjacent audit comment sourced beyond the RESONANCE_CHAIN_DATA line itself, flagged as unverified. Kept passive.',
  },
  {
    id: 'roveraero.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Omega Storm' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 20 }],
    note: "Modeled as Omega Storm's own DMG Multiplier +20%, matching this file's established convention for libDmg-categorized chain nodes (Calcharo's S5 and others) — cast-scoped (instant, no persistent duration). No adjacent audit comment confirms this specific scoping, flagged as unverified.",
  },
  {
    id: 'roveraero.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 30 }],
    note: 'Flat value used as-is — no adjacent audit comment sourced beyond the RESONANCE_CHAIN_DATA line itself, flagged as unverified. Kept passive.',
  },
];
