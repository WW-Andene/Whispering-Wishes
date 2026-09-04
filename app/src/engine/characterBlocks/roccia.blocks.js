// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/roccia.blocks.js
// Roccia converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Roccia'], RESONANCE_CHAIN_DATA['Roccia'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Roccia'], and CHARACTER_ROTATIONS['Roccia']. No new numbers
// invented. S1 correctly has NO block — pure Imagination/Concerto/interrupt-
// immunity utility, zero DPS component, per the audit's own zeroing. Both Real
// Fantasy 1-3 and Commedia Improvviso! are counted as Heavy Attack DMG per their
// own kit text despite the Forte/Liberation slot.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Roccia';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const ROCCIA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'roccia.intro.pero-help',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Pero, Help' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Intro DMG Bonus buffs (a real ~9,350 damage share per the dump's own Damage Profile).
    // No override text names a different category — Intro damage isn't described as counted under
    // any other type, same default-to-skillDmg convention used throughout this sweep (Aalto/Calcharo/
    // Encore/Jianxin's Intro blocks).
    damage: { hits: parseSkillMultiplierHits('168.99%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Restores a flat +100 Imagination.',
  },
  {
    id: 'roccia.basic.stage1-4',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says the Intro primes her combo to skip straight to Stage 4 —
    // only that segment of the row's 4-stage combo is used.
    damage: { hits: parseSkillMultiplierHits('104.19%×2'), category: 'basicDmg', basis: 'ATK' },
    note: 'Stage 4 only (Intro skips the earlier stages).',
  },
  {
    id: 'roccia.skill.acrobatic-trick',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Acrobatic Trick' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('61.47%×8'), category: 'skillDmg', basis: 'ATK' },
    note: 'Pulls enemies in, restores a flat +100 Imagination (caps at 300), auto-launches into Beyond Imagination.',
  },
  {
    id: 'roccia.forte.real-fantasy',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Real Fantasy 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('322.08% → 339.97% → 357.86%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'While airborne in Beyond Imagination with >=100 Imagination — each tap is one bounce, counted as Heavy Attack DMG, spends exactly 100 Imagination.',
  },
  {
    id: 'roccia.liberation.commedia-improvviso',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Commedia Improvviso!' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('278.34%×3'), category: 'heavyDmg', basis: 'ATK' },
    note: "Counted as Heavy Attack DMG despite the Liberation slot. Also grants a flat team ATK buff scaling with Roccia's own Crit Rate (+1 ATK per 0.1% Crit Rate over 50%, up to +200 at 70%+, 30s) — not a %-stat, not modeled.",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'roccia.outro.applause-please',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { element: 'havoc' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh', source: 'teammate-ally-action' },
      { stat: 'basicDmg', value: 25, stacking: 'refresh', source: 'teammate-ally-action' },
    ],
    note: 'Ends immediately if the incoming Resonator is swapped out before 14s, not modeled. Also grants the incoming Resonator Roccia\'s Magic Box (100 flat Havoc pull-in DMG via Inherent Skill Super Attractive Magic Box) for the same window, not modeled.',
  },
  {
    id: 'roccia.selfbuff.immersive-performance',
    source: SOURCE, kind: 'buff', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Acrobatic Trick' },
    timing: { duration: 12 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20, source: 'self-kit' }],
    note: 'Immersive Performance: Skill or Heavy ATK cast grants self ATK +20% for 12s — modeled on the Skill cast used in her real rotation.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S1 correctly has NO block — pure Imagination/Concerto/interrupt-
  //    immunity utility, zero DPS component per the audit's own zeroing) ──
  // S1 correctly has NO block — Skill Acrobatic Trick grants +100 additional Imagination and +10
  // Concerto Energy; Real Fantasy gains interrupt immunity. Zero DPS component.
  {
    id: 'roccia.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Real Fantasy 1-3' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    condition: { element: 'havoc' },
    effects: [{ stat: 'elemDmg', value: 10, stacking: 'stacking', maxStacks: 4, source: 'self-kit' }],
    note: 'Casting Real Fantasy grants the whole team +10% Havoc DMG Bonus for 30s, stacking up to 3 times (30% at max stacks); reaching max stacks grants a further +10% Havoc DMG Bonus for 30s (40% total) — modeled as per-stack 10% x4 cap (3 real stacks + the max-stack bonus), matching the real stacking mechanic more closely than a flat 40%.',
  },
  {
    id: 'roccia.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Intro:Pero, Help' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 10, source: 'self-kit' },
      { stat: 'critDmg', value: 30, source: 'self-kit' },
    ],
    note: 'Casting Intro Pero, Help grants Roccia herself +10% Crit Rate and +30% Crit DMG for 15s (confirmed exact).',
  },
  {
    id: 'roccia.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Skill:Acrobatic Trick' },
    timing: { duration: 12 },
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 60, scopedToBlockId: 'roccia.forte.real-fantasy', source: 'self-kit' }],
    note: "Casting Skill Acrobatic Trick increases Real Fantasy's own DMG Multiplier by +60% for 12s (confirmed exact). Fixed 2026-09-04: this totalMult effect was previously unscoped, so it silently amplified ALL of Roccia's self-scoped damage blocks cast within the 12s window (Basic ATK, Liberation) instead of only Real Fantasy as the dump's own node text says — now scopedToBlockId'd to roccia.forte.real-fantasy.",
  },
  {
    id: 'roccia.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'heavyDmg', value: 20, scopedToBlockId: 'roccia.liberation.commedia-improvviso', source: 'self-kit' },
      { stat: 'heavyDmg', value: 80, source: 'self-kit' },
    ],
    note: "Unconditionally increases Liberation Commedia Improvviso!'s own DMG Multiplier by +20% and Heavy Attack's DMG Multiplier by +80%. Fixed 2026-09-03: the +20% was previously modeled as a plain libDmg-category effect, but Commedia's damage block above is categorized heavyDmg (per its own kit text), so that effect could never match any block and was a dead buff — now scopedToBlockId'd to roccia.liberation.commedia-improvviso specifically (heavyDmg category, so it stacks additively with the broad +80% on that one block only, not on roccia.forte.real-fantasy).",
  },
  {
    id: 'roccia.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Commedia Improvviso!' },
    timing: { duration: 12 },
    target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 60, source: 'self-kit' }],
    note: 'Casting Liberation grants, for 12s, Real Fantasy DEF Ignore +60% (confirmed exact, corrected from a wrong basicDmg:15 category/value). Also unlocks an extra move-loop (Reality Recreation, a re-triggering Heavy-Attack-typed follow-up), not modeled — no home in this schema for a stateful re-cast mechanic.',
  },
];
