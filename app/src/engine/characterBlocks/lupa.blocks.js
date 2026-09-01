// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lupa.blocks.js
// Lupa converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Lupa'], RESONANCE_CHAIN_DATA['Lupa'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Lupa'], and CHARACTER_ROTATIONS['Lupa']. No new numbers
// invented. S3/S4 scope moves (Nowhere to Run! / Dance With the Wolf: Climax)
// that are NOT used in her real CHARACTER_ROTATIONS (which stays on the base
// Dance With the Wolf, not the Climax upgrade, and never enters Wild Hunt state)
// — both blocks are present but inert in the standard rotation, same as Jiyan's
// S6/Finale and Lumi's S5/Laser in earlier batches.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Lupa';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const LUPA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'lupa.intro.try-focusing-eh',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Try Focusing, Eh?' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('29.76%+42.16%×4') },
  },
  {
    id: 'lupa.liberation.fire-kissed-glory',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Fire-Kissed Glory' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('820.44%'), category: 'libDmg' },
    note: 'Ultimate nuke that also grants the team Pack Hunt/Glory buffs (see lupa.libbuff.pack-hunt and lupa.debuff.glory below) and enables Wild Hunt.',
  },
  {
    id: 'lupa.skill.foebreaker',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Foebreaker' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('304.46%'), category: 'skillDmg' },
    note: 'Consumes all Wolflame, enters Burning Matchpoint.',
  },
  {
    id: 'lupa.midair.attack-stage1-2',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Mid-air:Attack Stage 1-2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('76.73% → 77.23%+19.31%×4') },
    note: 'Builds toward Firestrike.',
  },
  {
    id: 'lupa.heavy.firestrike',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Firestrike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('28.48%×2'), category: 'heavyDmg' },
    note: 'Replaces Mid-air Attack Stage 3 at 50+ Wolflame; considered Heavy ATK DMG. Consumes 50 Wolflame, grants 1 Wolfaith.',
  },
  {
    id: 'lupa.heavy.wolfs-claw',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Heavy ATK:Wolf's Claw" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('72.15%+18.04%×4+96.19%'), category: 'heavyDmg' },
    note: 'Replaces Heavy ATK at 50+ Wolflame and 1+ Wolfaith; consumes 50 Wolflame, grants 1 more Wolfaith.',
  },
  {
    id: 'lupa.liberation.dance-with-the-wolf',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Dance With the Wolf' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('56.02%+42.02%×4+336.11%'), category: 'libDmg' },
    note: 'Forte finisher at 2 Wolfaith, consumes both; considered Resonance Liberation DMG.',
  },
  {
    id: 'lupa.outro.stand-by-me-warrior',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh' },
      { stat: 'basicDmg', value: 25, stacking: 'refresh' },
    ],
    note: 'Swap-out buff to the next Resonator; no direct DMG.',
  },

  // ── Buff/debuff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'lupa.libbuff.pack-hunt',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Fire-Kissed Glory' },
    timing: { duration: 35 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 6, stacking: 'stacking', maxStacks: 3 }],
    note: 'Pack Hunt: 6% base ATK +6%/Intro cast, up to 2 casts (18% max) — modeled as per-stack 6% x3 (base + 2 Intro casts), matching the real stacking mechanic rather than a flat 18%.',
  },
  {
    id: 'lupa.selfbuff.wildfire-banner',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Fire-Kissed Glory' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 12, stacking: 'refresh' }],
    note: 'Wildfire Banner, from Skill/Forte/Liberation casts — modeled on the Liberation cast used in her real rotation.',
  },
  {
    id: 'lupa.debuff.glory',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'cast', on: 'Liberation:Fire-Kissed Glory' },
    timing: { duration: 35 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'resShred', value: 3, stacking: 'stacking', maxStacks: 5 }],
    note: 'Fusion RES ignore, Glory (from Liberation): 3% base +3%/other Fusion Resonator, up to 15% at 3 Fusion units — needs a mono-Fusion team for max value (S3 chain removes the requirement, not modeled). Modeled as per-stack 3% capped at the documented 15% max; the exact "3 Fusion units" stacking formula is approximated rather than precisely derivable from the source text.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic) ──
  {
    id: 'lupa.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 20 }],
    note: 'Crit Rate +20% for 10s (confirmed exact, corrected from an earlier wrong elemDmg categorization) — no specific cast anchor sourced beyond the flat value/duration, kept passive.',
  },
  {
    id: 'lupa.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'stacking', maxStacks: 2 }],
    note: 'Fusion DMG Bonus +20%/stack, stacking up to 2 stacks (40% max, corrected from allDmg to elemDmg per the re-audit — Fusion DMG Bonus is element-specific, not all-element) — modeled as per-stack stacking rather than a flat 40%.',
  },
  {
    id: 'lupa.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Nowhere to Run!' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 100 }],
    note: "Nowhere to Run!'s own DMG Multiplier +100% (recategorized from totalMult to libDmg per the re-audit — that move's own text confirms it's 'considered Resonance Liberation DMG') — cast-scoped (instant, no persistent duration). Nowhere to Run! replaces the next Intro Skill only in Wild Hunt state, which her real CHARACTER_ROTATIONS never enters, so this block is present but does not fire in the standard rotation.",
  },
  {
    id: 'lupa.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Dance With the Wolf: Climax' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 125 }],
    note: "Dance With the Wolf: Climax's own DMG Multiplier +125% (recategorized from totalMult to libDmg per the re-audit, same reasoning as S3; also fixes a stale data bug where the sourcing comment already said 125 but the stored value was still totalMult:25, off by a factor of 5 and never actually applied) — cast-scoped (instant, no persistent duration). Her real CHARACTER_ROTATIONS uses the base Dance With the Wolf, not the Climax upgrade, so this block is present but does not fire in the standard rotation.",
  },
  {
    id: 'lupa.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 15 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  {
    id: 'lupa.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 30 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
];
