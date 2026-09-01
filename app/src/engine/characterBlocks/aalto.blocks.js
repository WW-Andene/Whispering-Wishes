// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/aalto.blocks.js
// Aalto converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Aalto'], RESONANCE_CHAIN_DATA['Aalto'], SKILL_MULTIPLIERS['Aalto'],
// and CHARACTER_ROTATIONS['Aalto'] — no new numbers invented. Simple kit: every
// trigger is 'cast' or 'passive', no conditional/cast-order mechanics found.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Aalto';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const AALTO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'aalto.intro.feint-shot',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Feint Shot' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('66.27%×3') },
  },
  {
    id: 'aalto.skill.shift-trick',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Shift Trick' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%'), category: 'skillDmg' },
    note: '59.65% per Mist Bullet — real bullet count depends on encounter length, kept as 1 base bullet (no fabricated count).',
  },
  {
    id: 'aalto.basic.half-truths',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Half Truths Stage 1-5' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('31.81% → 53.02% → 47.72%×2 → 50.37%×2 → 179.73%'), category: 'basicDmg' },
  },
  {
    id: 'aalto.liberation.flower-in-the-mist',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Flower in the Mist' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('397.62%'), category: 'libDmg' },
  },
  {
    id: 'aalto.forte.misty-cover',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Misty Cover' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%') },
    note: '59.65% per Mist Bullet, same base-count caveat as Shift Trick.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'aalto.outro.dissolving-mist',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { element: 'aero' },
    effects: [{ stat: 'elemDmg', value: 23, stacking: 'refresh' }],
    note: 'Incoming Resonator gets +23% Aero DMG Amp for 14s.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA) ──
  { id: 'aalto.chain.s1', source: SOURCE, kind: 'utility', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [], note: "Trickster's Opening Show — no DPS component sourced yet." },
  { id: 'aalto.chain.s2', source: SOURCE, kind: 'buff', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'atkPct', value: 15 }] },
  { id: 'aalto.chain.s3', source: SOURCE, kind: 'utility', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [], note: 'Hazey Transition — no DPS component sourced yet.' },
  { id: 'aalto.chain.s4', source: SOURCE, kind: 'buff', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'skillDmg', value: 30 }] },
  { id: 'aalto.chain.s5', source: SOURCE, kind: 'buff', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'elemDmg', value: 25 }] },
  { id: 'aalto.chain.s6', source: SOURCE, kind: 'buff', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'critRate', value: 8 }, { stat: 'heavyDmg', value: 50 }] },
];
