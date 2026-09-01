// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/jianxin.blocks.js
// Jianxin converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Jianxin'], RESONANCE_CHAIN_DATA['Jianxin'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Jianxin'], and CHARACTER_ROTATIONS['Jianxin']. No new numbers
// invented. S1/S2/S3/S5 correctly have NO block — all 4 are confirmed pure
// resource/utility/AoE-range effects with zero DPS component per the audit's own
// zeroing. S6 is modeled as a real proc-style damage block using its own sourced
// 556.67% ATK figure instead of the flat totalMult approximation the source table
// itself zeroed out (same "discrete proc, not a modifier" treatment as Yinlin's S6).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Jianxin';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const JIANXIN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'jianxin.intro.essence-of-tao',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Essence of Tao' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('33.80%×3+67.60%') },
    note: 'Pulls enemies in, builds Chi toward the Forte gauge.',
  },
  {
    id: 'jianxin.basic.fengyiquan',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Fengyiquan Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('69.46% → 26.64%×2+79.90% → 41.75%×4 → 113.40%'), category: 'basicDmg' },
    note: 'Builds Chi toward the 120 max.',
  },
  {
    id: 'jianxin.skill.calming-air',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Calming Air' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row is 'Calming Air: Chi Counter / Chi Parry' with 2 alternative values — the Chi Counter
    // variant (fired "on being attacked") is used as the primary/representative value.
    damage: { hits: parseSkillMultiplierHits('334.60%'), category: 'skillDmg' },
    note: 'Hold Skill for Parry Stance — Chi Counter on being attacked (used here), Chi Parry on early release (258.73%, not separately modeled). 12s cooldown.',
  },
  {
    id: 'jianxin.forte.primordial-chi-spiral',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Primordial Chi Spiral' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row has 4 separate named components (Pushing Punch / Zhoutian Progress Continuous DMG /
    // Minor-Major Shock variants / Yielding Pull) — only Pushing Punch (the channel's own opening
    // hit) is used as the representative value; the continuous-tick DoT and Shock/Pull variants are
    // not separately modeled (no per-tick timing data or trigger condition sourced for them).
    damage: { hits: parseSkillMultiplierHits('248.52%') },
    note: 'At max Chi, a channeled shield-and-DMG state with 50% DMG reduction and interrupt resistance. Only the Pushing Punch opening hit is modeled; Zhoutian Progress continuous tick (24.86%/tick) and the Shock/Yielding Pull variants are not.',
  },
  {
    id: 'jianxin.liberation.purification-force-field',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Purification Force Field' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('29.83% + 636.20%'), category: 'libDmg' },
    note: 'Pulls targets into the field, then explodes on expiry. 20s cooldown.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'jianxin.outro.transcendence',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'libDmg', value: 38, stacking: 'refresh' }],
    note: 'Grants the incoming Resonator this buff — no direct DMG on the Outro itself.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S1/S2/S3/S5 correctly have NO block — pure resource/utility/AoE-range
  //    effects with zero DPS component per the audit's own zeroing) ──
  // S1 correctly has NO block — after Intro Skill, +100% extra Chi from Basic Attacks for 10s, pure
  // resource/Chi-gain utility.
  // S2 correctly has NO block — Resonance Skill Calming Air gains 1 extra charge, pure utility.
  // S3 correctly has NO block — Chi Counter's own internal readiness delay is skipped after 2.5s in
  // Parry Stance, pure cooldown/availability utility.
  {
    id: 'jianxin.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Primordial Chi Spiral' },
    timing: { duration: 14 },
    target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 80 }],
    note: 'While performing Forte Circuit Heavy Attack: Primordial Chi Spiral, Resonance Liberation Purification Force Field DMG +80% for 14s (confirmed exact) — the "only while/shortly after the Forte channel" gating is approximated by anchoring the trigger to the channel\'s own cast.',
  },
  // S5 correctly has NO block — the range/AoE of Purification Force Field is increased by 33%, a pure
  // area-of-effect increase with ZERO DPS component (does not change per-hit or explosion multipliers).
  {
    id: 'jianxin.chain.s6-chi-counter',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Primordial Chi Spiral' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 556.67 }], category: 'heavyDmg' },
    note: 'Truth from Within: during the Primordial Chi Spiral channel, after performing Pushing Punch, Jianxin can use an enhanced Special Chi Counter once every 5s — a discrete extra proc dealing 556.67% ATK Aero DMG (counted as Heavy Attack DMG), modeled directly with the real sourced figure instead of the flat totalMult approximation the source table itself zeroed out (same "discrete proc, not a modifier" treatment as Yinlin\'s S6 Furious Thunder). Also grants a bonus Zhoutian Progress 4 shield, not modeled.',
  },
];
