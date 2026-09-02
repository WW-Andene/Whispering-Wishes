// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/roveraero.blocks.js
// Rover: Aero converted to TriggerBlocks. Sourced from characters.js's already-
// audited CHAR_BUFF_TABLE['Rover: Aero'], RESONANCE_CHAIN_DATA['Rover: Aero'],
// SKILL_MULTIPLIERS['Rover: Aero'], and CHARACTER_ROTATIONS['Rover: Aero']. No new
// numbers invented. S1/S2 are correctly empty (no DPS component — pure
// resource/healing mechanics). S3-S6 confirmed exact 2026-09-02 against a real
// prydwen.gg .mht snapshot (resolving the previous "no adjacent audit comment,
// flagged as unverified" gap) — 3 real bugs found and fixed that pass: S4 was
// modeled as an unconditional passive when the kit text is explicit it's a 5s
// window on Cloudburst Dance cast; S5 was a dead cast-scoped/no-duration
// `kind:'buff'` no-op (Engine development.md item 12); S6 was an unscoped passive
// silently over-crediting her other skillDmg-categorized moves instead of only
// Unbound Flow. Both her outroBuffs and libBuffs store non-DPS values (an Aero
// Erosion stack-cap increase, a flat+%ATK healing formula) — CHAR_BUFF_TABLE
// itself previously fabricated these under a 'totalMult' key (fixed 2026-09-02),
// and this file never used them to begin with, to avoid injecting a false DMG
// bonus.
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
    note: '+15% Aero DMG Bonus, unconditional (confirmed exact against a real .mht snapshot 2026-09-02).',
  },
  {
    id: 'roveraero.chain.s4',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-02 against a real prydwen.gg .mht snapshot (confirms S3-S6 exactly, resolving the
    // "no adjacent audit comment" gap this file previously flagged): was `trigger:{type:'passive'}`,
    // modeled as unconditional — the real kit text is explicit this is conditional: "Casting Mid-air
    // Attack Cloudburst Dance increases Resonance Skill DMG Bonus by 15% for 5s." Converted to a real
    // cast-scoped 5s buffWindow.
    trigger: { type: 'cast', on: 'Forte:Cloudburst Dance' },
    timing: { duration: 5 }, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 15 }],
    note: 'Casting Cloudburst Dance grants +15% Resonance Skill DMG Bonus for 5s.',
  },
  {
    id: 'roveraero.chain.s5',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-02: was `trigger:{type:'cast',...}` with no `timing.duration` — the same dead
    // cast-scoped/no-duration `kind:'buff'` no-op shape found on Carlotta's S1/S2, Galbrena's S3, and
    // Lucy's S2/S3 (Engine development.md item 12) — never actually applied. Converted to
    // `trigger:{type:'passive'}` + `scopedToBlockId` so it fires and stays scoped to only Omega
    // Storm's own hit.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 20, scopedToBlockId: 'roveraero.liberation.omega-storm' }],
    note: "Omega Storm's own DMG Multiplier +20% (confirmed exact against a real .mht snapshot).",
  },
  {
    id: 'roveraero.chain.s6',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-02: was an unscoped passive `skillDmg:30` — since `skillDmg` applies to EVERY
    // skillDmg-categorized hit unconditionally, this was silently over-crediting Cloudburst
    // Dance/Awakening Gale/Skyfall Severance too, none of which S6's own kit text lists ("The DMG
    // Multiplier of Resonance Skill Unbound Flow is increased by 30%" — Unbound Flow only). Fixed via
    // `scopedToBlockId` (Augusta's S3 over-crediting fix pattern), same double-check now applied
    // roster-wide.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 30, scopedToBlockId: 'roveraero.forte.unbound-flow' }],
    note: "Unbound Flow's own DMG Multiplier +30% (confirmed exact against a real .mht snapshot) — scoped to only that move, not her whole skillDmg-categorized kit.",
  },
];
