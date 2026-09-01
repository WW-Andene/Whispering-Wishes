// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/rebecca.blocks.js
// Rebecca converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Rebecca'], RESONANCE_CHAIN_DATA['Rebecca'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Rebecca'], and CHARACTER_ROTATIONS['Rebecca']. No new numbers
// invented. S4 correctly has NO block — a buff-to-a-buff mechanic with no flat-
// schema equivalent, per the audit's own zeroing. S6's real 900%-ATK bonus hit is
// modeled as a proc-style damage block using the source's own sourced figure,
// alongside (not instead of) the flat basicDmg:40 multiplier the table stores.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Rebecca';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const REBECCA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'rebecca.intro.yo-its-big-boomin-time',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Intro:Yo, It's Big Boomin' Time!" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('27.04%×6+40.56%+67.60%'), category: 'basicDmg' },
    note: 'Huntress-mode opener that also swaps her to Guts mode.',
  },
  {
    id: 'rebecca.basic.guts-stage1-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Guts Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('61.69%×2 → 84.50% → 33.77%×2+157.57%'), category: 'basicDmg' },
    note: "Builds Fervor toward the 120 cap, each hit ignoring 15% of the target's DEF (Guts mode, not separately modeled — see rebecca.selfbuff.guts below).",
  },
  {
    id: 'rebecca.skill.its-big-boomin-time',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Skill:It's Big Boomin' Time!" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('23.66%×4+35.49%×4'), category: 'skillDmg' },
    note: 'Switches her back to Huntress mode (see rebecca.selfbuff.huntress below).',
  },
  {
    id: 'rebecca.forte.rat-tat-tat-huntress',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Rat-tat-tat!: Huntress' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('19.89%×3+318.10%+19.89%'), category: 'heavyDmg' },
    note: 'Once Fervor hits 120/120, replaces Heavy Attack. See rebecca.chain.s6-bonus-hit below for the S6-granted bonus proc on this cast.',
  },
  {
    id: 'rebecca.liberation.party-til-dawn',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Liberation:Party 'til Dawn!" },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Base (un-enhanced) tier used — the channel's ramp-up firepower (up to 2 enhancements, 48.60%/
    // 72.90%) and its auto-fire-for-9.5s mechanic are not modeled (base per-shot value used).
    damage: { hits: parseSkillMultiplierHits('24.30%'), category: 'libDmg' },
    note: 'Deploys the Mk. 31 HMG for 9.5s, auto-firing Basic ATK DMG; pressing/holding Basic Attack or Liberation during the channel ramps firepower and builds Overload faster — not modeled.',
  },
  {
    id: 'rebecca.liberation.boom-fireworks',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:BOOM! Fireworks!' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('63.62%+572.58%'), category: 'libDmg' },
    note: "Auto-casts when the channel ends or Overload maxes. Swap-cancelling this banks 10 Concerto Energy for the next loop.",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'rebecca.outro.preem-choom',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [
      { stat: 'heavyDmg', value: 35, stacking: 'refresh' },
      { stat: 'allDmg', value: 15, stacking: 'refresh' },
    ],
    note: 'Also summons a turret dealing 2.5% Electro DMG/hit for 14s, and grants a stacking Heavy ATK DMG Amp (0.5%/0.2s, up to +35%) — neither modeled (no DPS component for the turret; the stacking Heavy ATK Amp is folded into the flat heavyDmg value above rather than modeled as a real ramp).',
  },
  {
    id: 'rebecca.selfbuff.huntress',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 999 }, // sentinel: conditional on Huntress mode, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 30 }],
    note: 'Huntress mode: +30% Crit DMG.',
  },
  {
    id: 'rebecca.selfbuff.guts',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 999 }, // sentinel: conditional on Guts mode, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 15 }],
    note: 'Guts mode: DEF Ignore +15% (matches the 15% DEF ignore already noted on Guts Stage 1-3\'s own kit text).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S4 correctly has NO block — buff-to-a-buff, no flat-schema equivalent) ──
  {
    id: 'rebecca.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 50 }],
    note: 'Huntress/Guts core moves DMG Multiplier +50% (confirmed exact) — kept passive, applies broadly to both mode\'s Basic ATK-categorized blocks above.',
  },
  {
    id: 'rebecca.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: "Intro:Yo, It's Big Boomin' Time!" },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20 }],
    note: 'Team +20% All-Attribute DMG on Intro/Liberation cast (confirmed exact, team-wide) — modeled anchored to the Intro cast (the first of the two qualifying casts in her real rotation).',
  },
  {
    id: 'rebecca.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:BOOM! Fireworks!' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 60 }],
    note: "Liberation DMG Multiplier +60% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  // S4 correctly has NO block — real effect is "+60% Stat Bonus increase to the A Girl Gets What She
  // Wants! effect" (itself a conditional buff of Crit DMG/DEF Ignore that only exists while AGGWS is
  // active), a buff-to-a-buff with no flat-schema equivalent — zeroed per the audit's own reasoning.
  {
    id: 'rebecca.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: "Intro:Yo, It's Big Boomin' Time!" },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 20 }],
    note: '+20% Basic ATK DMG Bonus for 8s on inflicting Hack - Shifting (confirmed exact) — modeled anchored to the Intro cast, which inflicts Hack - Shifting in her real rotation.',
  },
  {
    id: 'rebecca.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 40 }],
    note: '+40% Basic ATK DMG Bonus from every source (directionally correct per the audit comment) — kept passive.',
  },
  {
    id: 'rebecca.chain.s6-bonus-hit',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Rat-tat-tat!: Huntress' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 900 }], category: 'basicDmg' },
    note: 'S6 also grants a separate bonus hit — an extra instance of Electro DMG equal to 900% ATK during Rat-tat-tat!/Bang-bang-bang!, considered Basic Attack DMG — modeled as a real proc-style damage block using the source\'s own sourced figure, alongside (not instead of) the flat basicDmg:40 multiplier above (same "discrete proc, not a modifier" treatment as Yinlin\'s S6/Calcharo\'s S6/Lingyang\'s S5).',
  },
];
