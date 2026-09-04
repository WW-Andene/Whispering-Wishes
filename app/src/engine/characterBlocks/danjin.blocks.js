// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/danjin.blocks.js
// Danjin converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Danjin'], RESONANCE_CHAIN_DATA['Danjin'] (+ its own 2026-08-18
// detailed audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Danjin'], and CHARACTER_ROTATIONS['Danjin']. No new numbers
// invented. S5's extra conditional (+15% more when HP<60%, 30% total) has no
// distinct condition field for an HP threshold in this schema and is documented
// rather than force-fit, matching the source audit's own scope note.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Danjin';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const DANJIN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'danjin.intro.vindication',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Vindication' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus. No override text names a different category, same default-
    // to-skillDmg convention as Calcharo/Encore/Jianxin/Lingyang/Aalto/Baizhi/Chixia.
    damage: { hits: parseSkillMultiplierHits('49.71%×4'), category: 'skillDmg' },
    note: 'Builds Concerto Energy, can chain into Crimson Erosion.',
  },
  {
    id: 'danjin.skill.crimson-erosion',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Crimson Erosion' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('64.42%×2 + 59.65%×2'), category: 'skillDmg' },
    note: 'After Basic ATK 2/Dodge Counter/Intro. Applies Incinerating Will (+20% DMG taken).',
  },
  {
    id: 'danjin.skill.sanguine-pulse',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Sanguine Pulse' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('56.07%×2 + 42.95%×3 + 64.42%×3'), category: 'skillDmg' },
    note: 'After Basic ATK 3, up to 3 consecutive strikes. Builds Ruby Blossom stacks.',
  },
  {
    id: 'danjin.liberation.crimson-bloom',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Crimson Bloom' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('49.09%×8 + 392.65%'), category: 'libDmg' },
    note: 'Consumes HP per hit, not modeled (no DPS component).',
  },
  {
    id: 'danjin.forte.chaoscleave',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Serene Vigil: Chaoscleave' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%×7'), category: 'heavyDmg' },
    note: 'Counts as Heavy ATK per its own CHARACTER_ROTATIONS note, at 60+ Ruby Blossom. Heals Danjin, not modeled. Scatterbloom follow-up (179%, corrected 2026-09-03 from a stale 178.93%) has no own CHARACTER_ROTATIONS step, not separately modeled. The higher-tier "Full Energy" variants (120+ Ruby Blossom) belong to a different rotation (the source\'s "Damage Dealer Combo") than the one modeled here, not used.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    // Added 2026-09-03 against a real browser snapshot: this Inherent Skill (Overflow) was
    // entirely missing before this pass. Sanguine Pulse always precedes Chaoscleave (her only real
    // heavyDmg-categorized damage block) in the modeled rotation, so no scopedToBlockId is needed —
    // no other heavyDmg block exists here to over-credit.
    id: 'danjin.selfbuff.overflow',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Sanguine Pulse' },
    timing: { duration: 5 },
    target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 30 }],
    note: 'Inherent Skill Overflow: Heavy Attack DMG +30% for 5s after casting Sanguine Pulse — directly buffs Chaoscleave.',
  },
  {
    id: 'danjin.outro.duality',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { element: 'havoc' },
    effects: [{ stat: 'elemDmg', value: 23, stacking: 'refresh' }],
    note: 'Havoc DMG Amp to the incoming Resonator (elemDmg, not deepen — a buff to the ally\'s own outgoing DMG, not a vulnerability debuff on the enemy, per the 2026-09-01 correction).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-18 audit comment for
  //    each node's real mechanic) ──
  {
    id: 'danjin.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: real mechanic loses 1 stack per hit TAKEN, no natural-decay duration sourced
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 5, stacking: 'stacking', maxStacks: 6 }],
    note: 'ATK +5% per stack on Incinerating Will hits, stacking up to 6 times (max 30%), loses 1 stack per hit Danjin takes — modeled as per-stack 5% x6 cap (matching the real stacking mechanic) rather than a flat 30%, same convention as Brant\'s S1. The stack-loss-on-hit-taken mechanic is not modeled (no defensive-proc trigger type in this schema).',
  },
  {
    id: 'danjin.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    condition: { requiresStance: 'Incinerating Will target' },
    effects: [{ stat: 'totalMult', value: 20 }],
    note: 'DMG dealt to Incinerating Will targets +20% (confirmed exact, kept as totalMult since it\'s not attribute-specific) — conditional on the target carrying Incinerating Will.',
  },
  {
    id: 'danjin.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Crimson Bloom' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 30 }],
    note: "Liberation DMG Bonus +30% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'danjin.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Serene Vigil: Chaoscleave' },
    timing: { duration: 99 }, // sentinel: conditional on Ruby Blossom staying above 60, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 15 }],
    note: 'Crit Rate +15% while above 60 Ruby Blossom (confirmed exact) — modeled as triggered by the Chaoscleave cast that requires that threshold.',
  },
  {
    id: 'danjin.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15 }],
    note: 'Havoc DMG Bonus +15% unconditional base value (confirmed exact) — the extra conditional +15% more (30% total, only when HP<60%) is NOT separately modeled, per the source audit\'s own documented scope.',
  },
  {
    id: 'danjin.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Serene Vigil: Chaoscleave' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: 'Team ATK +20% for 20s on full-power Chaoscleave (confirmed exact).',
  },
];
