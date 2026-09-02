// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/qingxiao.blocks.js
// Qingxiao converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Qingxiao'], RESONANCE_CHAIN_DATA['Qingxiao'] (+ its own
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Qingxiao'], and CHARACTER_ROTATIONS['Qingxiao']. No new
// numbers invented. Her base-kit Mindlock mechanic (self skillDmg buff + enemy
// deepen debuff, both nonlinear: first 7 stacks worth 7% each, remaining stacks
// worth 2% each, up to 15 stacks base) is modeled at its documented flat ceiling
// value rather than the real nonlinear per-stack curve, which this schema's
// single value+maxStacks stacking shape can't represent losslessly.
//
// appliesTags: ['shifting'] added 2026-09-02 (Engine development.md item 9, Phase 2) on every real
// damage-dealing block: Forte Circuit's own Draw and Sunder text, confirmed verbatim from the raw
// Prydwen page, is "Qingxiao inflicts Tune Strain - Shifting on the target after dealing damage
// WITH SKILLS. Each skill can only trigger this once for the same target" — "skills" here is the
// game's own generic term for any of her active abilities (Basic/Heavy/Skill/Liberation/Forte/Intro/
// Outro), not narrowly the Resonance Skill button; confirmed by explicit user clarification after an
// initial narrower reading was flagged as ambiguous rather than assumed. This is what makes her own
// S4 (chain.s4-actor, see below) self-trigger on nearly every one of her own casts, not just her
// Resonance Skill.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Qingxiao';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const QINGXIAO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'qingxiao.intro.tonality-shift',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Tonality Shift' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('39.79%+46.42%×2') },
    note: 'Grants 30 points of Sword Cadence plus Resonant Chime.',
  },
  {
    id: 'qingxiao.midair.stringblade-stage1-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Mid-air:Mid-air Attack - Stringblade Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('7.24%×5+54.28% → 44.89%+22.45%×2 → 11.14%×5+83.51%') },
    note: 'Builds Qin Heart/Sword Cadence toward her Heavy Attack.',
  },
  {
    id: 'qingxiao.basic.stringblade-stage1-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Basic Attack - Stringblade Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('30.13%×2 → 37.09%×2 → 24.36%×4 → 86.73%+5.43%×4'), category: 'basicDmg' },
    note: 'Ground continuation of the Mid-air Attack combo.',
  },
  {
    id: 'qingxiao.skill.severing-note-judgement',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Severing Note: Judgement' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('20.88%×2+97.42%'), category: 'skillDmg' },
    note: 'Grants 45 points of Qin Heart.',
  },
  {
    id: 'qingxiao.heavy.stringblade',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Heavy Attack - Stringblade' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('14.62%×3+21.92%×6+263.03%'), category: 'heavyDmg' },
    note: 'Once Qin Heart and Sword Cadence are both full; consumes both and enters Ephemeral Transcendence.',
  },
  {
    id: 'qingxiao.forte.ephemeral-transcendence-stage1-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Basic Attack - Ephemeral Transcendence Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('44.89%+22.45%×2 → 23.11%×5 → 20.88%×3+31.32%×2 → 18.10%×4+108.56%'), category: 'basicDmg' },
    note: 'Enhanced 4-hit combo while in Ephemeral Transcendence, builds Heart Sword Intent toward the finisher.',
  },
  {
    id: 'qingxiao.forte.heavens-reckoning',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Forte:Heavy Attack - Heaven's Reckoning: Ephemeral Transcendence" },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('27.84%×9+445.34%'), category: 'heavyDmg' },
    note: 'Once Heart Sword Intent is full; consumes it and ends Ephemeral Transcendence. Her single hardest-hitting move.',
  },
  {
    id: 'qingxiao.liberation.billows-beneath-heaven',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Billows Beneath Heaven' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('33.41%×10+1336.01%'), category: 'libDmg' },
    note: 'Best saved for last so pre-Ultimate buffs are fully stacked before it fires.',
  },
  {
    id: 'qingxiao.outro.lingering-song',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: [{ atkPct: 800 }] },
  },

  // ── Buff/debuff blocks (from CHAR_BUFF_TABLE, base-kit Mindlock mechanic) ──
  {
    id: 'qingxiao.selfbuff.mindlock',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 30 },
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 49 }],
    note: "Inherent Skill To Know, To Banish: +2%/Mindlock stack (+5% more for the first 7), up to 15 base-kit stacks (~49% at cap) — modeled at the documented flat ceiling value rather than the real nonlinear per-stack curve (first 7 stacks worth 7% each, remaining worth 2% each), which this schema's stacking shape can't represent losslessly. Damage scales with team-inflicted Tune Strain - Interfered. Corrected 2026-09-02 from a wrong skillDmg category — the real move list (Heavy Attack - Stringblade, Ephemeral Transcendence Basic ATK/Dodge Counter, Heaven's Reckoning, Liberation) has no Skill-button cast in it at all; no single category spans Heavy+Basic+Liberation, so kept as totalMult.",
  },
  {
    id: 'qingxiao.debuff.mindlock',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'passive' },
    timing: { duration: 30 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'deepen', value: 49 }],
    note: 'Base kit Forte (Mindlock): targets w/ Mindlock take +2%/stack (+5% more for the first 7) from her key skills, up to 15 stacks (~49% at cap) — same flat-ceiling approximation as the selfBuff above. S6 chain adds a further flat +40% (see qingxiao.chain.s6).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic) ──
  {
    id: 'qingxiao.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 16 }],
    note: 'Confirmed exact value/category. Also raises the Mindlock stack cap from 15 to 25 (not modeled, no stacking-cap-increase field in this schema).',
  },
  {
    id: 'qingxiao.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Heavy Attack - Stringblade' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 40 }],
    note: "Heavy Attack multiplier +40% (confirmed) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'qingxiao.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Billows Beneath Heaven' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 100 }],
    note: 'Liberation (Billows Beneath Heaven) Crit DMG +100% (confirmed) — cast-scoped (instant, no persistent duration). Also documented in CHAR_BUFF_TABLE\'s own selfBuffs entry for this same node (not modeled as a separate duplicate block).',
  },
  {
    id: 'qingxiao.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: 'ATK +20% on team Tune Strain trigger — a cross-character trigger (an ALLY applying Tune Break, not Qingxiao\'s own cast) this schema has no clean anchor for, kept passive as an approximation.',
  },
  {
    id: 'qingxiao.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Severing Note: Judgement' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 100 }],
    note: "Skill multiplier +100% (confirmed) — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'qingxiao.chain.s6',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'all-enemies' },
    effects: [{ stat: 'deepen', value: 40 }],
    note: 'DMG Taken +40% flat, scoped narrower than a universal vulnerability in the real text (only applies to Heavy Attack - Stringblade, Heaven\'s Reckoning: Ephemeral Transcendence, Billows Beneath Heaven, and Juque Perdition, not her full kit) — kept as-is since deepen is the closest available category and the value is exact per the re-audit.',
  },
];
