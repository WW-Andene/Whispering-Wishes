// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/calcharo.blocks.js
// Calcharo converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Calcharo'] (empty — no buffs), RESONANCE_CHAIN_DATA['Calcharo']
// (+ its own detailed audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Calcharo'], and CHARACTER_ROTATIONS['Calcharo']. No new numbers
// invented. Two real, not-modeled mechanics, both explicitly documented:
//   1. Deathblade Gear ending silently swaps his NEXT Intro cast from "Wanted Outlaw"
//      to "Necessary Means" — CHARACTER_ROTATIONS' own note says its reference
//      rotation always assumes the baseline "Wanted Outlaw" opener, so only that path
//      is modeled here, matching the source data's own scope.
//   2. S6's real mechanic (2 separate 100%-ATK Phantom hits on Death Messenger cast,
//      per its own audit comment) IS modeled as a real proc-style damage block
//      (calcharo.chain.s6-phantoms) rather than the flat totalMult:200 approximation
//      RESONANCE_CHAIN_DATA itself falls back to — the real per-hit numbers are
//      sourced, so they're used directly instead of the lossier flat-schema stand-in.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Calcharo';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const CALCHARO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'calcharo.intro.wanted-outlaw',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Wanted Outlaw' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus on a real 5.1% (20,081) damage share. The dump's own
    // multiplier table labels this row generically "Skill Damage" (not a named-move-specific label),
    // the same convention already confirmed on Augusta's Stride of Goldenflare/Lupa's Try Focusing, Eh?
    // — a generic "Skill Damage" label means plain Resonance Skill DMG.
    damage: { hits: parseSkillMultiplierHits('39.77%×2+59.65%×2'), category: 'skillDmg' },
  },
  {
    id: 'calcharo.liberation.phantom-etching',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Phantom Etching' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('596.43%'), category: 'libDmg' },
    note: 'Enters 11s Deathblade Gear: Basic ATK -> Hounds Roar (own block below), Heavy ATK/Dodge Counter deal boosted Liberation DMG (not separately modeled — no CHARACTER_ROTATIONS step uses them).',
  },
  {
    id: 'calcharo.basic.hounds-roar',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Hounds Roar' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('88.07%→35.23%×2+52.84%×2→163.84%→34.82%×6→150.19%×2'), category: 'basicDmg' },
    note: '5-stage combo (grants Killing Intent, cap 5) while in Deathblade Gear.',
  },
  {
    id: 'calcharo.forte.death-messenger',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'resource-threshold', resource: 'Killing Intent', threshold: 5, resourceStepOn: 'Forte:Heavy ATK: "Death Messenger"' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('97.77%×8+195.53%'), category: 'libDmg' },
    note: 'Counted as Resonance Liberation DMG per its own kit text. Fires 3x in her real rotation (real, repeated resource-threshold events, not a bug).',
  },
  {
    id: 'calcharo.chain.s6-phantoms',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'resource-threshold', resource: 'Killing Intent', threshold: 5, resourceStepOn: 'Forte:Heavy ATK: "Death Messenger"' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 100 }, { atkPct: 100 }], category: 'libDmg' },
    note: 'S6 The Ultimatum: 2 separate Phantom hits at 100% ATK each (considered Resonance Liberation DMG) on every Death Messenger cast — real per-hit numbers per RESONANCE_CHAIN_DATA\'s own audit comment, used directly rather than its totalMult:200 flat-schema fallback.',
  },
  {
    id: 'calcharo.outro.shadowy-raid',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Outro DMG Bonus on a real 7.6% (29,693) damage share. His own kit text is explicit
    // this is his own direct damage ("Summons a Phantom that slashes targets"), not a team buff —
    // same outroDmg shape already fixed for Rover: Havoc's Soundweaver/Xiangli Yao's precedent.
    damage: { hits: parseSkillMultiplierHits('195.98%+391.96%'), category: 'outroDmg' },
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each
  //    node's real mechanic; S1 correctly has NO block — pure Energy-regen utility, totalMult:0) ──
  {
    id: 'calcharo.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Wanted Outlaw' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 30 }],
    note: 'Real mechanic: only active 15s after casting Intro Skill Wanted Outlaw/Necessary Means, not a flat passive buff — modeled as cast-scoped on Wanted Outlaw (her only modeled Intro path).',
  },
  { id: 'calcharo.chain.s3', source: SOURCE, kind: 'buff', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'elemDmg', value: 25 }] },
  {
    // Fixed 2026-09-03 against a real browser snapshot: was modeled as a passive, self-scoped,
    // duration-less buff — but the real mechanic is "After casting Outro Skill Shadowy Raid, Electro
    // DMG Bonus of all team members +20% for 30s": whole-team scoped, cast-triggered on Outro, with a
    // real 30s duration. The flat RESONANCE_CHAIN_DATA['Calcharo'].s4 (elemDmg: 20) has no scope/timing
    // concept so it wasn't wrong there, but this schema does track scope/timing and had all three wrong.
    id: 'calcharo.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Outro:Shadowy Raid' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'refresh' }],
    note: 'S4 Dark Alliance: after casting Outro Skill Shadowy Raid, Electro DMG Bonus of all team members +20% for 30s.',
  },
  {
    id: 'calcharo.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Wanted Outlaw' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 50 }],
    note: 'Real mechanic: scoped to Intro Skill Wanted Outlaw/Necessary Means\' own DMG Multiplier, not a generic total multiplier — cast-scoped (instant, no persistent duration), same "single-hit-scoped" pattern as Shorekeeper\'s S6.',
  },
  // S6 modeled above as calcharo.chain.s6-phantoms (a real damage block, not a buff — see file header).
];
