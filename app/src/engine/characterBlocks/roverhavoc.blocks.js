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
//
// Full kit audit 2026-09-09: fixed a comment/code mismatch on the Intro block (a
// stale comment claimed its category was already set; it wasn't — added
// category:'skillDmg'). Confirmed the whole Umbra Basic Attack combo (his single
// largest real damage bucket, 31.6% per the dump's Damage Profile) is correctly
// absent from this file: the modeled CHARACTER_ROTATIONS entry is the source's own
// named "Short Burst Combo", which explicitly excludes Basic Attacks entirely (see
// the Outro block's own note) — CHARACTER_DATA.dmgFocus already correctly includes
// 'Basic ATK' regardless (fixed in the 2026-09-03 pass), reflecting his real kit
// capability independent of which named combo variant this file models. S5's
// basicDmg:50 bonus is consequently a real no-op in the currently-modeled rotation
// (nothing basicDmg-categorized ever fires) — not a bug, since S5's own kit text
// and value are still correctly sourced; it would matter if a Medium/Long Burst
// Combo variant were ever modeled instead.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Rover: Havoc';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const ROVER_HAVOC_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'roverhavoc.intro.instant-of-annihilation',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Instant of Annihilation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-09 (full-kit audit): the header comment already claimed "category added for
    // Layer 4 schema migration", but the actual field was never set — a stale/aspirational comment
    // vs. code mismatch (same exact bug found on Rover: Aero's own Intro block this session). No
    // override text names a different category for this Intro cast, same default-to-skillDmg
    // convention actually applied on Sanhua/Baizhi/Taoqi's equivalent uncategorized-Intro fixes.
    damage: { hits: parseSkillMultiplierHits('198.81%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Builds Umbra (Forte gauge, 0-100).',
  },
  {
    id: 'roverhavoc.skill.wingblade',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Wingblade' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('286.29%×2'), category: 'skillDmg', basis: 'ATK' },
    note: '12s cooldown, builds Umbra.',
  },
  {
    id: 'roverhavoc.heavy.devastation',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Devastation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('228.14%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Once Umbra hits 100, HOLD Basic Attack to consume it all and enter Dark Surge; considered Heavy Attack DMG despite the Basic ATK input.',
  },
  {
    id: 'roverhavoc.skill.umbra-lifetaker',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Umbra: Lifetaker' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('276.35%×2+9.95%×4'), category: 'skillDmg', basis: 'ATK' },
    note: 'Replaces Wingblade in Dark Surge; entering Dark Surge instantly resets Skill cooldown.',
  },
  {
    id: 'roverhavoc.liberation.deadening-abyss',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Deadening Abyss' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1520.90%'), category: 'libDmg', basis: 'ATK' },
    note: '16s cooldown, huge single-target nuke.',
  },
  {
    id: 'roverhavoc.outro.soundweaver',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-03 (Phase A audit — REMAINING_WORK.md 1c): had no damage.category — his own kit
    // text is explicit this is "own direct damage, not a team buff" (7.2% of his total per the dump's
    // Damage Profile), the same shape 'outroDmg' was built for (Xiangli Yao's precedent). Silently
    // zeroed any outroDmg-type bonus reaching this hit.
    damage: { hits: [{ atkPct: 143.3 }, { atkPct: 143.3 }, { atkPct: 143.3 }], category: 'outroDmg', basis: 'ATK' },
    note: 'Havoc Field: AoE DoT for the incoming Resonator, 3 ticks over 6s. The optional 1-3 Dark Surge Basic Attack strings (P1-P5) mentioned in the rotation note before this finisher are not sourced as a distinct step, not modeled. The Echo (Dreamless, +50% DMG within 5s of Liberation landing) has no matching SKILL_MULTIPLIERS row, not modeled.',
  },

  // ── Self-buff (from CHAR_BUFF_TABLE — added 2026-09-03 against a real browser snapshot; this
  //    Inherent Skill was entirely missing before this pass, despite being base-kit, not chain-gated) ──
  {
    id: 'roverhavoc.selfbuff.metamorph',
    source: SOURCE, kind: 'buff', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Devastation' },
    timing: { duration: 99 }, // sentinel: conditional on staying in Dark Surge, no natural decay sourced — same pattern as chain.s6
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 20, source: 'self-kit' }],
    note: 'Inherent Skill Metamorph: Havoc DMG Bonus +20% while in Dark Surge — base-kit (not Sequence-gated), anchored to the Devastation cast that enters Dark Surge.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S2/S3 correctly have NO block — zero real DPS component per the
  //    audit's own zeroing) ──
  {
    id: 'roverhavoc.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 30, source: 'self-kit' }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  // S2 correctly has NO block — Skill cooldown reset on Devastation cast, zero real DPS component.
  // S3 correctly has NO block — Basic Attack 5 heals 10% of HP lost, zero real DPS component.
  {
    id: 'roverhavoc.chain.s4',
    source: SOURCE, kind: 'debuff', section: 'Chain',
    trigger: { type: 'cast', on: 'Heavy ATK:Devastation' },
    timing: { duration: 20 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'resShred', value: 10 }],
    note: 'S4 (3 copies): Devastation/Liberation hit -> Havoc RES Shred -10% (20s) — chain-gated, not innate to base kit (per CHAR_BUFF_TABLE\'s own note); modeled here on the Devastation cast used in the real rotation.',
  },
  {
    id: 'roverhavoc.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 50, source: 'self-kit' }],
    note: "Basic Attack 5 deals +50% of its own DMG as a bonus hit — approximated via the matching Basic-ATK-type category (a reasonable fit since the value is exact, though technically scoped to Stage 5 only rather than all Basic ATK hits, per the audit comment's own caveat). No plain Basic ATK combo step exists in the real rotation to anchor a cast trigger to, kept passive.",
  },
  {
    id: 'roverhavoc.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Heavy ATK:Devastation' },
    timing: { duration: 99 }, // sentinel: conditional on staying in Dark Surge, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 25, source: 'self-kit' }],
    note: 'S6 (5 copies): Crit Rate +25% while in Dark Surge — chain-gated, not innate to base kit; modeled anchored to the Devastation cast that enters Dark Surge.',
  },
];
