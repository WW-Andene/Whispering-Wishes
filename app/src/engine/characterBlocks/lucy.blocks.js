// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lucy.blocks.js
// Lucy converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Lucy'], RESONANCE_CHAIN_DATA['Lucy'] (+ its own audit comment,
// read directly for each node's real mechanic), SKILL_MULTIPLIERS['Lucy'], and
// CHARACTER_ROTATIONS['Lucy']. No new numbers invented. Several real
// CHARACTER_ROTATIONS steps (Basic ATK:Thread Shredding Stage 1-4, Heavy
// ATK:Dual Threading) have NO matching SKILL_MULTIPLIERS row at all — not
// modeled rather than guessed. The 'Payload / Pulse Interference / Deadlock'
// row's first segment is itself truncated with a literal "..." in the source
// string, documented as incomplete rather than treated as the real full value.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Lucy';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const LUCY_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'lucy.intro.outdated-hallucination',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Outdated Hallucination' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('69.14%×2') },
    note: 'Grants the team wallhack vision for 25s.',
  },
  {
    id: 'lucy.skill.payload',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Payload' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Payload / Pulse Interference / Deadlock' has 3 arrow/slash-separated segments — Payload's
    // own segment ('20.05%+10.03%+40.09%+...') is itself truncated with a literal "..." in the source
    // string; only the numeric tokens actually present are used.
    damage: { hits: parseSkillMultiplierHits('20.05%+10.03%+40.09%'), category: 'skillDmg' },
    note: "Applies Hack: Shifting, auto-chains into Pulse Interference. Source row for this segment is itself incomplete ('...'), so this is a lower bound on the real value, not a fabricated completion.",
  },
  {
    id: 'lucy.skill.pulse-interference',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Pulse Interference' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('30.86%×2+61.72%×3+61.72%'), category: 'skillDmg' },
    note: 'Fires automatically off the Payload follow-up, grants Digital Handshake (passive TCP/s while on-field). See lucy.chain.s2-bonus-hit below for the real S2 flat bonus hit that fires after this.',
  },
  {
    id: 'lucy.basic.locked-thread-stage2-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Locked Thread Stage 2-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Locked Thread Stage 1-4' has 4 arrow-separated stages; this step uses stages 2-4 (skips
    // Stage 1's own segment, per its own "Stage 2-4" label).
    damage: { hits: parseSkillMultiplierHits('20.66%+20.05%×2 → 36.06%×2+48.08% → 31.02%+15.51%×3+38.77%×2'), category: 'basicDmg' },
    note: 'Builds TCP toward 100.',
  },
  {
    id: 'lucy.skill.deadlock',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Deadlock' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Last segment of the 'Payload / Pulse Interference / Deadlock' row.
    damage: { hits: parseSkillMultiplierHits('51.70%+206.77%'), category: 'heavyDmg' },
    note: 'Once TCP hits 100/100, replaces Skill — counted as Heavy ATK DMG. Applies Hack: Shifting, enters 8s Algorithm Compaction (+65% Spectro DMG Bonus, 1 SQL stack).',
  },
  {
    id: 'lucy.heavy.multi-threading',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Multi-threading' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%+59.65%×3'), category: 'heavyDmg' },
    note: 'Fires automatically off Dual Threading, consumes banked SQL stack for a +270% DMG Multiplier bonus (see lucy.chain.s2 below), applies Hack: Shifting. Heavy ATK:Dual Threading itself has no matching SKILL_MULTIPLIERS row — not modeled (auto-chains straight into this).',
  },
  {
    id: 'lucy.liberation.old-net-deep-dive',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Old Net Deep Dive' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // The row's upgraded 'Old Net Deep Dive' parenthetical value is used, matching the real rotation
    // step (which uses this upgraded Ultimate branch, not the base 894.65% Override).
    damage: { hits: parseSkillMultiplierHits('1789.29%'), category: 'heavyDmg' },
    note: 'Upgraded Ultimate: freezes time for 10s, marks up to 5 targets with chosen Spoofing Programs, then triggers Override — an AoE Heavy ATK-type nuke on all marked targets (counted as Heavy ATK DMG despite the Liberation input).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'lucy.outro.countermeasure-program',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'basicDmg', value: 25, stacking: 'refresh' }],
    note: 'Also triggers a team-wide 25s Hack-Shifting response buff (see lucy.chain.s4 below) and a 30% DMG Reduction proc for hit teammates, not modeled (no DPS component).',
  },
  {
    id: 'lucy.debuff.breach-protocol',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'cast', on: 'Liberation:Old Net Deep Dive' },
    timing: { duration: 30 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'defShred', value: 5 }],
    note: 'Spoofing Program: Breach Protocol — one of the Spoofing Programs chosen during Old Net Deep Dive, modeled as anchored to that cast.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'lucy.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  {
    id: 'lucy.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Multi-threading' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 30 }],
    note: "Raises Heavy Attack - Multi-threading's SQL DMG Mult from 270% to 560% (conditional, only on SQL-consuming casts) and grants +32 starting RAM (from 24, resource-economy, not modeled) — none of this reduces to a flat always-on heavyDmg% (calcEngine.js applies heavyDmg unconditionally to every Heavy ATK instance, which the real effect isn't), kept as an approximated totalMult per the audit comment's own reasoning. See lucy.chain.s2-bonus-hit below for the node's separately-representable real bonus hit.",
  },
  {
    id: 'lucy.chain.s2-bonus-hit',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Pulse Interference' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 450 }], category: 'heavyDmg' },
    note: 'S2 also adds a separate flat extra hit worth 450% ATK as Heavy DMG after Pulse Interference — modeled as a real proc-style damage block using the source\'s own exact figure, instead of folding it into the lossy totalMult:30 approximation above (same "discrete proc, not a modifier" treatment as Yinlin\'s S6/Calcharo\'s S6).',
  },
  {
    id: 'lucy.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Old Net Deep Dive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'libDmg', value: 50 },
      { stat: 'critDmg', value: 100 },
    ],
    note: "Override DMG Mult +50% + Crit DMG +100% on Liberation (confirmed exact) — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'lucy.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Payload' },
    timing: { duration: 25 }, // matches the Outro's own 25s Hack-Shifting response window per CHARACTER_ROTATIONS' note
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20, stacking: 'refresh' }],
    note: 'Team +20% All-Attribute DMG on Hack-Shifting (confirmed exact, team-wide) — modeled on the Payload cast, the first real rotation step that applies Hack: Shifting.',
  },
  {
    id: 'lucy.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 5 }],
    note: 'Confirmed exact value, no further scope detail sourced beyond the flat value — kept passive.',
  },
  {
    id: 'lucy.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 40 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive, applies to her Heavy ATK-categorized blocks above.',
  },
];
