// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/mortefi.blocks.js
// Mortefi converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Mortefi'], RESONANCE_CHAIN_DATA['Mortefi'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Mortefi'], and CHARACTER_ROTATIONS['Mortefi']. No new numbers
// invented. S1/S5 are modeled as real Marcato bonus-proc damage blocks using the
// source's own sourced 31.81% Marcato value, instead of the flat {} the table
// itself zeroed them to (same "discrete proc, not a modifier" treatment as
// Yinlin's S6/Calcharo's S6). S2/S4 correctly have NO block — pure utility with
// zero DPS component, per the audit's own zeroing.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Mortefi';
const MARCATO_ATK_PCT = 31.81;

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const MORTEFI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'mortefi.intro.dissonance',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Dissonance' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('168.99%') },
    note: 'Builds Annoyance.',
  },
  {
    id: 'mortefi.skill.passionate-variation',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Passionate Variation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('208.76%'), category: 'skillDmg' },
    note: '14s cooldown. Builds Annoyance, opens a 5s window where Basic ATK hits restore extra Annoyance (not modeled).',
  },
  {
    id: 'mortefi.forte.fury-fugue',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Fury Fugue' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('326.05%'), category: 'skillDmg' },
    note: 'Replaces Resonance Skill once Annoyance reaches 100; consumes all Annoyance, counted as Resonance Skill DMG. No cooldown. Fires twice in the real rotation.',
  },
  {
    id: 'mortefi.basic.impromptu-show',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Impromptu Show' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('48.30% → 40.78%×2 → 107.30% → 21.02%×4+126.93%'), category: 'basicDmg' },
    note: 'Full 4-part combo, cast inside the post-Skill Annoyance window to refill Fury Fugue fast.',
  },
  {
    id: 'mortefi.liberation.violent-finale',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Violent Finale' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('159.05%'), category: 'libDmg' },
    note: 'Applies Burning Rhapsody to the whole team (10s, 20s cooldown) — see mortefi.chain.s3/s6 below for the chain effects scoped to this cast.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'mortefi.outro.rage-transposition',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'heavyDmg', value: 38, stacking: 'refresh' }],
    note: 'Ends early if the incoming Resonator is swapped out before 14s, not modeled.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 audit comment for
  //    each node's real mechanic; S2/S4 correctly have NO block — pure utility, zero DPS component
  //    per the audit's own zeroing) ──
  {
    id: 'mortefi.chain.s1-bonus-marcato',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Passionate Variation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: MARCATO_ATK_PCT }, { atkPct: MARCATO_ATK_PCT }], category: 'coordDmg' },
    note: 'During Burning Rhapsody, Coordinated Attacks also trigger off the on-field character\'s Resonance Skill hits, firing 2 extra Marcato — modeled as a real proc-style damage block using the source\'s own sourced 31.81% Marcato value, instead of the flat {} it was zeroed to (same "discrete proc, not a modifier" treatment as Yinlin\'s S6/Calcharo\'s S6). Anchored to the Passionate Variation cast (a real Resonance Skill hit in the rotation).',
  },
  // S2 correctly has NO block — Echo Skill use restores +10 Resonance Energy (20s cooldown), pure
  // Resonance Energy resource-gain utility, zero DPS component.
  {
    id: 'mortefi.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Violent Finale' },
    timing: { duration: 10 }, // matches Burning Rhapsody's own 10s window, since this is conditional on it being active
    target: { scope: 'self' },
    // Fixed 2026-09-03: was a single unscoped `critDmg` effect — `critDmg` isn't category-gated (unlike
    // skillDmg/basicDmg/heavyDmg/libDmg/echoDmg/coordDmg), so without scoping it would over-credit ANY
    // of Mortefi's own hits landing within the 10s Burning Rhapsody window (Basic ATK, Skill, Fury
    // Fugue), when the kit text is explicit this is Marcato-only ("the Crit. DMG of Resonance
    // Liberation's Marcato is increased by 30%"). Scoped to both real Marcato proc blocks
    // (S1's/S5's bonus-hit blocks) via 2 separate scopedToBlockId effects.
    effects: [
      { stat: 'critDmg', value: 30, scopedToBlockId: 'mortefi.chain.s1-bonus-marcato' },
      { stat: 'critDmg', value: 30, scopedToBlockId: 'mortefi.chain.s5-bonus-marcato' },
    ],
    note: "During Burning Rhapsody, Marcato Crit DMG +30% (confirmed exact) — scoped to Burning Rhapsody's own 10s window, applied by the Violent Finale cast that starts it.",
  },
  // S4 correctly has NO block — Burning Rhapsody duration +7s, a pure duration-extension utility with
  // no flat DMG% derivation, zero DPS component.
  {
    id: 'mortefi.chain.s5-bonus-marcato',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Fury Fugue' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: Array.from({ length: 4 }, () => ({ atkPct: MARCATO_ATK_PCT * 0.5 })), category: 'coordDmg' },
    note: 'Skill/Fury Fugue hits fire 4 bonus Marcato hits at 50% reduced DMG — modeled as a real proc-style damage block (4 x 15.905% ATK), instead of the flat {} it was zeroed to, same "discrete proc, not a modifier" treatment as S1 above. Anchored to the Fury Fugue cast.',
  },
  {
    id: 'mortefi.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Violent Finale' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: 'On Liberation cast, team ATK +20% for 20s (confirmed exact, team-wide).',
  },
];
