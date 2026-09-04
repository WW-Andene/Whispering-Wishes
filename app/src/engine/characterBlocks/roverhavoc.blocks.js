// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/roverhavoc.blocks.js
// Rover: Havoc converted to TriggerBlocks. Sourced from characters.js's already-
// audited CHAR_BUFF_TABLE['Rover: Havoc'], RESONANCE_CHAIN_DATA['Rover: Havoc']
// (+ its own 2026-09-01 re-audit comment, read directly for each node's real
// mechanic), SKILL_MULTIPLIERS['Rover: Havoc'], and CHARACTER_ROTATIONS
// ['Rover: Havoc']. No new numbers invented. S2/S3 correctly have NO block — zero
// real DPS component per the audit's own zeroing. CHAR_BUFF_TABLE's own selfBuffs/
// debuffs entries for this character are explicitly chain-gated (S6/S4-copy-
// conditional, "not innate") — modeled once via their Resonance Chain blocks
// below, not duplicated as separate base-kit blocks.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Rover: Havoc';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const ROVER_HAVOC_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'roverhavoc.intro.instant-of-annihilation',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Instant of Annihilation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.81%') },
    note: 'Builds Umbra (Forte gauge, 0-100).',
  },
  {
    id: 'roverhavoc.skill.wingblade',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Wingblade' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('286.29%×2'), category: 'skillDmg' },
    note: '12s cooldown, builds Umbra.',
  },
  {
    id: 'roverhavoc.heavy.devastation',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Devastation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('228.14%'), category: 'heavyDmg' },
    note: 'Once Umbra hits 100, HOLD Basic Attack to consume it all and enter Dark Surge; considered Heavy Attack DMG despite the Basic ATK input.',
  },
  {
    id: 'roverhavoc.skill.umbra-lifetaker',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Umbra: Lifetaker' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('276.35%×2+9.95%×4'), category: 'skillDmg' },
    note: 'Replaces Wingblade in Dark Surge; entering Dark Surge instantly resets Skill cooldown.',
  },
  {
    id: 'roverhavoc.liberation.deadening-abyss',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Deadening Abyss' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1520.90%'), category: 'libDmg' },
    note: '16s cooldown, huge single-target nuke.',
  },
  {
    id: 'roverhavoc.outro.soundweaver',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-03 (Phase A audit — REMAINING_WORK.md 1c): had no damage.category — his own kit
    // text is explicit this is "own direct damage, not a team buff" (7.2% of his total per the dump's
    // Damage Profile), the same shape 'outroDmg' was built for (Xiangli Yao's precedent). Silently
    // zeroed any outroDmg-type bonus reaching this hit.
    damage: { hits: [{ atkPct: 143.3 }, { atkPct: 143.3 }, { atkPct: 143.3 }], category: 'outroDmg' },
    note: 'Havoc Field: AoE DoT for the incoming Resonator, 3 ticks over 6s. The optional 1-3 Dark Surge Basic Attack strings (P1-P5) mentioned in the rotation note before this finisher are not sourced as a distinct step, not modeled. The Echo (Dreamless, +50% DMG within 5s of Liberation landing) has no matching SKILL_MULTIPLIERS row, not modeled.',
  },

  // ── Self-buff (from CHAR_BUFF_TABLE — added 2026-09-03 against a real browser snapshot; this
  //    Inherent Skill was entirely missing before this pass, despite being base-kit, not chain-gated) ──
  {
    id: 'roverhavoc.selfbuff.metamorph',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Devastation' },
    timing: { duration: 99 }, // sentinel: conditional on staying in Dark Surge, no natural decay sourced — same pattern as chain.s6
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 20 }],
    note: 'Inherent Skill Metamorph: Havoc DMG Bonus +20% while in Dark Surge — base-kit (not Sequence-gated), anchored to the Devastation cast that enters Dark Surge.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S2/S3 correctly have NO block — zero real DPS component per the
  //    audit's own zeroing) ──
  {
    id: 'roverhavoc.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 30 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  // S2 correctly has NO block — Skill cooldown reset on Devastation cast, zero real DPS component.
  // S3 correctly has NO block — Basic Attack 5 heals 10% of HP lost, zero real DPS component.
  {
    id: 'roverhavoc.chain.s4',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'cast', on: 'Heavy ATK:Devastation' },
    timing: { duration: 20 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'resShred', value: 10 }],
    note: 'S4 (3 copies): Devastation/Liberation hit -> Havoc RES Shred -10% (20s) — chain-gated, not innate to base kit (per CHAR_BUFF_TABLE\'s own note); modeled here on the Devastation cast used in the real rotation.',
  },
  {
    id: 'roverhavoc.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 50 }],
    note: "Basic Attack 5 deals +50% of its own DMG as a bonus hit — approximated via the matching Basic-ATK-type category (a reasonable fit since the value is exact, though technically scoped to Stage 5 only rather than all Basic ATK hits, per the audit comment's own caveat). No plain Basic ATK combo step exists in the real rotation to anchor a cast trigger to, kept passive.",
  },
  {
    id: 'roverhavoc.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Devastation' },
    timing: { duration: 99 }, // sentinel: conditional on staying in Dark Surge, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 25 }],
    note: 'S6 (5 copies): Crit Rate +25% while in Dark Surge — chain-gated, not innate to base kit; modeled anchored to the Devastation cast that enters Dark Surge.',
  },
];
