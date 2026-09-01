// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/chisa.blocks.js
// Chisa converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Chisa'], RESONANCE_CHAIN_DATA['Chisa'] (+ its own audit comment,
// read directly for each node's real mechanic), SKILL_MULTIPLIERS['Chisa'], and
// CHARACTER_ROTATIONS['Chisa']. No new numbers invented. The Intro's own self-buff
// (+20% Havoc DMG/Healing, 12s) is sourced from CHARACTER_ROTATIONS' note text — it
// was entirely missing from CHAR_BUFF_TABLE['Chisa'].selfBuffs (empty array), a real
// omission caught by reading the rotation data directly rather than only the flat
// buff table. S3's real mechanic is not detailed anywhere in its own audit comment
// (unlike every other node in this row) — its flat totalMult:10 value is used as-is,
// documented as unverified rather than guessed at.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Chisa';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const CHISA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'chisa.intro.reverberance-return',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Reverberance - Return' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('95.43%') },
  },
  {
    id: 'chisa.basic.stage2-death-snip',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 2, Rending Lunge, Death Snip' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 'Rending Lunge' has no SKILL_MULTIPLIERS row of its own (not sourced anywhere) — only
    // Stage 2 (from the 'Stage 1-2' row's 2nd segment) and Death Snip's own row are combined.
    damage: { hits: [...parseSkillMultiplierHits('9.55%+19.09%+66.81%'), ...parseSkillMultiplierHits('29.81% + 14.91% + 104.34%')], category: 'basicDmg' },
    note: "'Rending Lunge' (named in the CHARACTER_ROTATIONS step but not in SKILL_MULTIPLIERS) is not modeled — no sourced hit data exists for it.",
  },
  {
    id: 'chisa.liberation.moment-of-nihility',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Moment of Nihility' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('954.29%'), category: 'libDmg' },
    note: 'Also heals the team for 117.60% ATK and enters Woven Myriad - Convergence, neither modeled (no DPS component).',
  },
  {
    id: 'chisa.skill.serrated-loop',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Serrated Loop' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('17.45%×8') },
    note: 'Non-hold variant used (rotation does not specify holding). At full Ring of Chainsaw, entering this enters Chainsaw Mode.',
  },
  {
    id: 'chisa.forte.sawring-blitz-2-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Sawring - Blitz 2-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Sawring - Blitz 1-3' has 3 arrow-separated stages; this step starts from stage 2
    // (per its own "Blitz 2-3" label) through the end.
    damage: { hits: [...parseSkillMultiplierHits('10.64%×8'), ...parseSkillMultiplierHits('15.98%×8')] },
    note: 'Stages 2-3 of the 3-stage Sawring - Blitz combo (Chainsaw Mode).',
  },
  {
    id: 'chisa.forte.sawring-eradication',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Sawring - Eradication' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('51.54% + 206.13%') },
    note: 'Real DMG also scales +2.59% per Ring of Chainsaw consumed, up to 100 — not modeled (no stacking-scalar field in this schema for a per-resource-unit damage bonus), base 2-hit value used. Also grants the team a Shield, not modeled (no DPS component).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE, plus the Intro self-buff sourced from CHARACTER_ROTATIONS'
  //    own note text — real, but entirely missing from CHAR_BUFF_TABLE['Chisa'].selfBuffs) ──
  {
    id: 'chisa.selfbuff.reverberance-return',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Reverberance - Return' },
    timing: { duration: 12 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 20 }],
    note: 'Inherent Skill: Intro grants +20% Havoc DMG/Healing Bonus for 12s. Sourced from CHARACTER_ROTATIONS\' own Intro step note (only the Havoc DMG half is modeled — Healing Bonus has no stat key in this schema); was entirely absent from CHAR_BUFF_TABLE[\'Chisa\'].selfBuffs (empty array) before this read.',
  },
  {
    id: 'chisa.outro.unraveling-law-zero',
    source: SOURCE, kind: 'utility',
    trigger: { type: 'swap-out' },
    timing: { duration: 20 }, target: { scope: 'next-on-field' }, effects: [],
    note: 'Grants the incoming Resonator +3 max Negative Status/Electro Rage stacks for 20s — a resource-cap increase, not a %-stat buff, no DPS component representable in this schema.',
  },
  {
    id: 'chisa.debuff.thread-of-bane',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Eye of Unraveling' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'defIgnore', value: 18, stacking: 'refresh' }],
    note: "Thread of Bane: only benefits teammates who themselves apply/deal Negative Status DMG — not modeled as a per-teammate condition (schema condition doesn't have a 'deals Negative Status DMG' gate), applied team-wide. Stored under CHAR_BUFF_TABLE's debuffs array by convention despite being an ally-side effect (mirrors the same defIgnore-as-ally-buff pattern used for Cantarella/Changli).",
  },
  {
    id: 'chisa.debuff.havoc-bane',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'on-hit' },
    timing: { duration: 2 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'defShred', value: 2, stacking: 'stacking', maxStacks: 6 }],
    note: 'Havoc Bane: 1 stack (2% DEF Shred) per hit on an Unseen Snare target, up to 6 stacks (12% cap), refreshed every 2s — modeled as a real per-stack stacking debuff rather than the flat 12% cap total.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic where documented) ──
  {
    id: 'chisa.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Eye of Unraveling' },
    timing: { duration: 99 }, // sentinel: conditional on the target carrying Unseen Snare, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 30 }],
    note: 'ATK +30% on Unseen Snare (confirmed exact per the audit comment, NOT defShred as an earlier version of this table had it) — modeled as triggered by the Unseen Snare-applying cast.',
  },
  {
    id: 'chisa.chain.s2-alldmg',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 50 }],
    note: 'Team +50% All-Attribute DMG for allies with Thread of Bane already active (confirmed exact per the audit comment) — the larger of S2\'s two real effects.',
  },
  {
    id: 'chisa.chain.s2-resshred',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'all-enemies' },
    effects: [{ stat: 'resShred', value: 10 }],
    note: "Havoc RES ignore +10% — the smaller of S2's two real effects, per the audit comment ('real 10% Havoc RES ignore is the smaller of two S2 effects'). RESONANCE_CHAIN_DATA['Chisa'].s2 only stores the larger allDmg:50 value; this second real, sourced number is used directly rather than left out, same pattern as Calcharo's S6.",
  },
  {
    id: 'chisa.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 10 }],
    note: "Unlike every other node in this row, S3's own audit comment does not describe its real mechanic (no skill name, no condition text) — the flat totalMult:10 value is used as-is rather than guessed at further; flagged here as unverified, not silently treated as fully precise.",
  },
  // S4 correctly has NO block — per its own audit comment ('improves Havoc Bane trigger rate
  // (utility)'), S4's real effect is a proc-rate utility bonus with zero DPS component, despite
  // RESONANCE_CHAIN_DATA still storing a stale totalMult:10 for it (not force-fit into a block here,
  // same "don't fabricate a DPS number for a non-DPS effect" rule already applied elsewhere in this file).
  {
    id: 'chisa.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Moment of Nihility' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 100 }],
    note: "Moment of Nihility's own DMG Multiplier +100% (was totalMult:10 with no basis, corrected) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'chisa.chain.s6',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'cast', on: 'Skill:Eye of Unraveling' },
    timing: { duration: 99 }, // sentinel: conditional on Unseen Snare-Finality state, no natural decay sourced
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'deepen', value: 30 }],
    note: 'Unseen Snare-Finality: targets take 30% more Negative Status DMG (was deepen:15, wrong value, corrected) — an enemy-side debuff, modeled as triggered by the Unseen Snare-applying cast.',
  },
];
