// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/suisui.blocks.js
// Suisui converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Suisui'], RESONANCE_CHAIN_DATA['Suisui'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Suisui'], and CHARACTER_ROTATIONS['Suisui']. No new numbers invented. S1/S3/S4
// correctly have NO block — pure utility/healing effects with zero DPS component,
// per the audit's own zeroing. Her two openers (Tinkling Jade, Awakening Spring)
// scale off Max HP (basis: 'HP'), not ATK, per their own row text.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../shared/skillMultiplierParser.js';

const SOURCE = 'Suisui';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const SUISUI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'suisui.intro.tinkling-jade',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Tinkling Jade' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('28.63%'), category: 'introDmg', basis: 'HP' },
    note: 'Max HP-scaling opener. Inflicts 1 stack of Glacio Chafe, consumes all Cloud Breath to pull in nearby targets, enters Drizzle Stance.',
  },
  {
    id: 'suisui.skill.drizzle-stance-thrust',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Drizzle Stance thrust' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('11.93%×6+71.58%'), category: 'skillDmg' },
    note: 'Restores Floral Epistle toward her Outro payoff.',
  },
  {
    id: 'suisui.basic.drizzle-stance-stage1-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Drizzle Stance Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('19.57%×4 → 31.81%×3+15.91%×4 → 13.76%×12 → 159.05%'), category: 'basicDmg' },
    note: 'Builds Floral Epistle toward the 600 cap; Stage 4 also inflicts Glacio Chafe.',
  },
  {
    id: 'suisui.heavy.drizzle-stance',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Drizzle Stance' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('11.93%×10+119.29%'), category: 'heavyDmg' },
    note: 'Builds Floral Epistle. Not used in her real (Basic-ATK-focused) CHARACTER_ROTATIONS, so this block is present per S5\'s own kit scope but does not fire in the standard rotation.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'suisui.outro.rippling-waters',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 25, stacking: 'refresh' }],
    note: 'Unconditional. Also consumes banked Floral Epistle to enter Roaming Transcendent (Plume Steps, healing, Reflecting Shadows), not modeled.',
  },
  {
    id: 'suisui.outro.rippling-waters-ceaseless-landscape',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 6 },
    target: { scope: 'whole-team' },
    condition: { requiresStance: '400+ Floral Epistle consumed, Ceaseless Landscape active' },
    effects: [{ stat: 'allDmg', value: 12, stacking: 'refresh' }],
    note: 'Roaming Transcendent: up to +12% All DMG Amp (0.2% per 1% Energy Regen above 200%, capped at 260% ER) for 6s — modeled at the documented cap, not the real ER-scaling formula.',
  },
  {
    id: 'suisui.selfbuff.sky-over-water-critrate',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Tinkling Jade' },
    timing: { duration: 999 }, // sentinel: gated once every 25s, no natural decay sourced beyond the gate
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 80 }],
    note: 'Inherent Skill Sky Over Water: Awakening Spring/Tinkling Jade hit, once every 25s — the 25s gate is not modeled, kept passive on the Intro cast.',
  },
  {
    id: 'suisui.selfbuff.sky-over-water-elemdmg',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Tinkling Jade' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 240 }],
    note: 'Same Sky Over Water trigger, also grants +240% Glacio DMG on that one hit (sourced from CHAR_BUFF_TABLE\'s own condition text, not represented as a structured selfBuffs entry there) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo\'s S5.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own detailed audit comment for each
  //    node's real mechanic; S1/S3/S4 correctly have NO block — pure utility/healing with zero DPS
  //    component, per the audit's own zeroing) ──
  // S1 correctly has NO block — Undulating Mist trigger-condition change, Reflecting Shadows duration
  // +100%, interruption immunity on several Drizzle-stance moves, zero real DPS component.
  {
    id: 'suisui.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Song of Thoroughfare' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'critDmg', value: 50, stacking: 'refresh' }],
    note: 'Team Crit DMG +50% for 30s, conditional on inflicting Negative Status/consuming Havoc Bane (confirmed exact) — modeled anchored to the Liberation cast, which deals with Negative Status stack caps.',
  },
  // S3 correctly has NO block — an extra Basic ATK Stage 4 combo route, Kingfisher stack restoring
  // Concerto Energy/Floral Epistle, zero real DPS component.
  // S4 correctly has NO block — Enrichment/Spring's Birth healing +50%, a healing-only stat with no
  // matching category in this schema.
  {
    id: 'suisui.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'basicDmg', value: 100 },
      { stat: 'heavyDmg', value: 100 },
    ],
    note: 'Basic Attack - Drizzle Stance AND Heavy Attack - Drizzle Stance DMG Multipliers both +100% (two moves, confirmed exact) — kept passive, applies to both damage blocks above.',
  },
  {
    id: 'suisui.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Tinkling Jade' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 500 }],
    note: "Crit DMG +500% on Intro Skill - Tinkling Jade and Resonance Skill - Awakening Spring (both HP%-scaling openers, confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5. Awakening Spring is not used in her real rotation, so only the Tinkling Jade trigger is modeled.",
  },
];
