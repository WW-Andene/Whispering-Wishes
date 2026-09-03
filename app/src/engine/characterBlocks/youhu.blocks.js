// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/youhu.blocks.js
// Youhu converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Youhu'], RESONANCE_CHAIN_DATA['Youhu'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Youhu'], and CHARACTER_ROTATIONS['Youhu']. No new numbers
// invented. S1/S2/S4 correctly have NO block — defensive-proc/buff-of-a-buff/
// proc-based-cooldown-reduction effects with zero DPS component or no matching
// category, per the audit's own zeroing.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Youhu';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const YOUHU_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'youhu.intro.scroll-of-wonders',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Scroll of Wonders' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('89.47% + 109.35%') },
    note: 'Grants Lucky Draw (random Antique).',
  },
  {
    id: 'youhu.skill.ruyi',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Ruyi' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('137.00% + 167.45%'), category: 'skillDmg' },
    note: 'Antique Appraisal variant with the highest DMG Multiplier of the four, consumes the drawn Antique. Fires 3x in the real rotation.',
  },
  {
    id: 'youhu.liberation.fortunes-favor',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Liberation:Fortune's Favor" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('327.19%'), category: 'libDmg' },
    note: 'Glacio DMG blast; choose one of four Antiques from the resulting prompt.',
  },
  {
    id: 'youhu.basic.frosty-punches',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Frosty Punches' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('47.38% → 31.91%+59.26% → 38.06%+46.52% → 116.35%'), category: 'basicDmg' },
    note: 'Full 4-part combo, fills the Forte Gauge (Frost).',
  },
  {
    id: 'youhu.skill.scroll-divination',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Scroll Divination' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('156.46%'), category: 'skillDmg' },
    note: 'Glacio DMG hit + heal to all nearby party members + Lucky Draw (grants a random Antique), not modeled.',
  },
  {
    id: 'youhu.outro.timeless-classics',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 28 }, target: { scope: 'next-on-field' },
    effects: [{ stat: 'coordDmg', value: 100, stacking: 'refresh' }],
    note: 'No direct DMG on the Outro itself — the incoming Resonator has their Coordinated Attack DMG Amplified by 100% for 28s.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S1/S2/S4 correctly have NO block — defensive-proc/buff-of-a-buff/
  //    proc-based-cooldown-reduction effects with zero DPS component or no matching category, per the
  //    audit's own zeroing) ──
  // S1 correctly has NO block — 10% chance of 5s damage/interruption immunity on Lucky Draw, pure
  // defensive utility, zero DPS component.
  // S2 correctly has NO block — re-investigated 2026-09-03 now that a dump file exists (see
  // characters.js's own RESONANCE_CHAIN_DATA audit comment for the full reasoning): S2 doubles
  // Antithesis/Triplet/Perfect Rhyme's DMG bonus on Poetic Essence, but her real modeled
  // CHARACTER_ROTATIONS below never casts Poetic Essence at all — she always spends each drawn Antique
  // immediately via Ruyi rather than banking to 4 Auspices. Zero-DPS-in-context, not a missing-schema
  // gap anymore.
  {
    id: 'youhu.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: 'Restless Sleep: ATK +20% (confirmed exact) — no specific cast anchor sourced, kept passive.',
  },
  // S4 correctly has NO block — 20% chance for Scroll Divination to skip its cooldown, a proc-based
  // effective-cooldown-reduction with no flat DMG% equivalent.
  {
    id: 'youhu.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Scroll of Wonders' },
    timing: { duration: 14 },
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 15 }],
    note: 'Dreamland Meander: Crit Rate +15% for 14s after Intro Skill (confirmed exact).',
  },
  {
    id: 'youhu.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 7 },
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 15, stacking: 'stacking', maxStacks: 4 }],
    note: 'Slumber Evermore: Sky Blue stacks (max 4, 7s each) each granting Crit DMG +15% (60% max) — modeled as per-stack stacking, matching the real stacking mechanic rather than a flat 60%.',
  },
];
