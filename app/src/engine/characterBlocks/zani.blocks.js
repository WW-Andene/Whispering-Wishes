// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/zani.blocks.js
// Zani converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Zani'], RESONANCE_CHAIN_DATA['Zani'] (+ its own audit comment,
// read directly for each node's real mechanic), SKILL_MULTIPLIERS['Zani'], and
// CHARACTER_ROTATIONS['Zani']. No new numbers invented. Skill:Standard Defense
// Protocol has NO matching SKILL_MULTIPLIERS row at all, not modeled.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Zani';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const ZANI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'zani.intro.immediate-execution',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Immediate Execution' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('24.2%×5 + 80.8%') },
    note: 'Builds Redundant Energy. Inherent Skill Quick Response grants +12% Spectro DMG Bonus for 14s (see zani.selfbuff.quick-response below).',
  },
  {
    id: 'zani.basic.stage3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('127.3%'), category: 'basicDmg' },
    note: 'Exits the block stance manually — Stagnates the target, restores 10 Redundant Energy. Skill:Standard Defense Protocol, the block-stance cast preceding this, has no matching SKILL_MULTIPLIERS row at all, not modeled.',
  },
  {
    id: 'zani.skill.targeted-action',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Targeted Action / Forcible Riposte' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('86.2% + 28.7% + 172.4%') },
    note: 'Once Redundant Energy hits 100/100 — applies 1 Heliacal Ember stack, grants 10 Blaze, starts Sunburst (+20% Spectro Frazzle DMG for 14s, not modeled).',
  },
  {
    id: 'zani.liberation.rekindle',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Rekindle' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('318.5%'), category: 'libDmg' },
    note: 'Enters Inferno Mode (up to 20s), raises max Blaze from 100 to 150, grants 50 Blaze immediately, gives Basic ATK a flat +25% DMG Multiplier for the duration (not modeled).',
  },
  {
    id: 'zani.forte.heavy-slash-daybreak',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy Slash: Daybreak' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.8%'), category: 'heavyDmg' },
    note: 'Counted as Heavy ATK + Spectro Frazzle DMG.',
  },
  {
    id: 'zani.forte.heavy-slash-dawning',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy Slash: Dawning' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('424.1%'), category: 'heavyDmg' },
    note: 'Auto-chains at >30 remaining Blaze.',
  },
  {
    id: 'zani.forte.heavy-slash-nightfall',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy Slash: Nightfall' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('135.2% + 262.4%'), category: 'heavyDmg' },
    note: 'Consumes up to 40 Blaze, each point adding +9.95% DMG Multiplier — not modeled (base value used), her hardest-hitting single attack.',
  },
  {
    id: 'zani.forte.heavy-slash-string-2nd-pass',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy Slash: Daybreak → Dawning → Nightfall' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 2nd full pass of the 3-hit string, combining all 3 rows since the rotation collapses them into
    // a single step.
    damage: { hits: [...parseSkillMultiplierHits('198.8%'), ...parseSkillMultiplierHits('424.1%'), ...parseSkillMultiplierHits('135.2% + 262.4%')], category: 'heavyDmg' },
    note: 'Repeats the full 3-hit string a 2nd time, with Blaze refilled by allies feeding Spectro Frazzle.',
  },
  {
    id: 'zani.liberation.the-last-stand',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:The Last Stand' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('191.1% + 1083.0%'), category: 'libDmg' },
    note: '2nd Ultimate, cast once Blaze drops below 30 or 8s pass since entering Inferno Mode; ends Inferno Mode.',
  },
  {
    id: 'zani.outro.beacon-for-the-future',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('150%') },
    note: 'Consumes all Heliacal Ember stacks on the target for a scaling hit (+10% DMG/stack, not modeled, base value used), counted as Spectro Frazzle DMG (no matching category, left uncategorized). Also grants every other teammate hitting that marked target +20% Spectro DMG Amp (see the buff block below).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'zani.outro.beacon-buff',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    condition: { element: 'spectro' },
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'refresh' }],
    note: "To allies hitting the Heliacal Ember-marked target — the target-marked gating isn't modeled (applied team-wide).",
  },
  {
    id: 'zani.selfbuff.quick-response',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Immediate Execution' },
    timing: { duration: 14 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 12 }],
    note: 'Quick Response: Intro Skill cast grants +12% Spectro DMG Bonus.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'zani.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 50 }],
    note: '+50% Spectro DMG (confirmed exact) — no further scope detail sourced beyond the flat value, kept passive.',
  },
  {
    id: 'zani.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Targeted Action / Forcible Riposte' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 20 },
      { stat: 'skillDmg', value: 80 },
    ],
    note: 'Crit Rate +20% + a multiplier boost to Targeted Action/Forcible Riposte (confirmed exact per the audit comment) — modeled together, cast-scoped to the Skill cast.',
  },
  {
    id: 'zani.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Rekindle' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 200 }],
    note: "Rekindle's own DMG Multiplier +200% — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'zani.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: 'Team ATK +20% (confirmed exact, team-wide) — no specific cast anchor sourced, kept passive.',
  },
  {
    id: 'zani.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:The Last Stand' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 120 }],
    note: "The Last Stand's own DMG Multiplier +120% — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'zani.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 40 }],
    note: 'Heavy ATK DMG +40% (confirmed exact) — kept passive, applies broadly to her many Heavy Slash-categorized blocks above.',
  },
];
