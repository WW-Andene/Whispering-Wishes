// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lucilla.blocks.js
// Lucilla converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Lucilla'], RESONANCE_CHAIN_DATA['Lucilla'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Lucilla'], and CHARACTER_ROTATIONS['Lucilla']. No new numbers
// invented. Dual Resonance Mode (Glacio Chafe vs Echo) — Glacio Chafe mode is
// modeled throughout as the default; the Echo-mode branch's identical values are
// documented but not separately fired, since only one mode is ever active in a
// given build (matching the source table's own "never double-count" reasoning).
// A real Liberation-cast self-buff (+30% Basic ATK/Echo Skill DMG, 10s) sourced
// from CHARACTER_ROTATIONS' own note text was entirely missing from
// CHAR_BUFF_TABLE['Lucilla'].selfBuffs before this read.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Lucilla';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const LUCILLA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'lucilla.intro.clip-it',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Clip It' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('97.42%') },
    note: 'Restores 100 of 150 Trace, inflicts 1 stack of Glacio Chafe.',
  },
  {
    id: 'lucilla.skill.spotlight',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Spotlight' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Phantom Frame / Compensate / Spotlight' has 3 alternative values — the Spotlight variant
    // (perfect-timed release) matches this step's own label.
    damage: { hits: parseSkillMultiplierHits('82.35%×2+274.48%+109.80%'), category: 'skillDmg' },
    note: 'A perfect release triggers Spotlight (restores 50 Trace, unlocks Ultimate once all 3 Photos are held).',
  },
  {
    id: 'lucilla.liberation.clear-as-day',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Clear As Day' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('142.74%'), category: 'libDmg' },
    note: 'Costs no Resonance Energy, enters Reminiscence for ~10s.',
  },
  {
    id: 'lucilla.basic.tracing-forms',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Tracing Forms Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('30.64%+45.95% → 59.77%+89.65% → 52.12%×8'), category: 'basicDmg' },
    note: 'Reminiscence-state Basic ATK replacement; considered Basic Attack DMG regardless of mode. Consumes her 3 Photos as it goes (see lucilla.basic.oblivion below).',
  },
  {
    id: 'lucilla.basic.oblivion',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Tracing Forms Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 3 separate Oblivion hits, one per Photo consumed during Tracing Forms (a full 3-Photo
    // Reminiscence reliably hits all 3, same "use the max case" convention as this table's S6).
    damage: { hits: [{ atkPct: 285.48 }, { atkPct: 285.48 }, { atkPct: 285.48 }], category: 'basicDmg' },
    note: 'Glacio Chafe mode: considered Basic Attack DMG, inflicts Glacio Chafe. Echo mode: same 285.48% value but considered Echo Skill DMG instead (each cast a different Echo Skill) — not separately fired, only Glacio Chafe mode is modeled.',
  },
  {
    id: 'lucilla.basic.letting-it-go',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Letting It Go' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('84.81%×3+593.64%'), category: 'basicDmg' },
    note: 'Interruption-immune AoE finisher, fully restores Concerto Energy, ends Reminiscence. Glacio Chafe mode: considered Basic Attack DMG (modeled). Echo mode: same value, considered Echo Skill DMG instead — not separately fired.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE, plus a real Liberation self-buff sourced from
  //    CHARACTER_ROTATIONS' own note text — entirely missing from CHAR_BUFF_TABLE['Lucilla'].selfBuffs) ──
  {
    id: 'lucilla.outro.montage-chafe',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    condition: { requiresStance: 'Glacio Chafe mode' },
    effects: [{ stat: 'elemDmg', value: 60, stacking: 'refresh' }],
    note: 'Glacio Chafe mode: Amplifies Glacio Chafe DMG near the active Resonator by +60% for 30s (persists through the swap) — modeled team-wide since Chafe DMG isn\'t a separate category.',
  },
  {
    id: 'lucilla.outro.montage-echo',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { requiresStance: 'Echo mode' },
    effects: [{ stat: 'echoDmg', value: 50, stacking: 'refresh' }],
    note: 'Echo mode: grants the incoming Resonator +50% Echo Skill DMG Amp for 14s (lost if they swap off, not modeled) — mutually exclusive with the Chafe-mode block above.',
  },
  {
    id: 'lucilla.selfbuff.clear-as-day-bonus',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Clear As Day' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 30 }],
    note: "Real effect sourced from CHARACTER_ROTATIONS' own Liberation step note: +30% Basic ATK DMG Bonus for 10s in Glacio Chafe mode (modeled; the Echo-mode branch is +30% Echo Skill DMG Bonus instead, same value, not separately fired) — this was entirely absent from CHAR_BUFF_TABLE['Lucilla'].selfBuffs before this read.",
  },
  {
    id: 'lucilla.debuff.inherent-skill-resshred',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'passive' },
    timing: { duration: 30 },
    target: { scope: 'all-enemies' },
    condition: { element: 'glacio' },
    effects: [{ stat: 'resShred', value: 8 }],
    note: 'Inherent Skill: Glacio RES Shred -8% for 30s, Glacio mode.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 audit comment for
  //    each node's real mechanic; S3/S5/S6 all buff BOTH Letting It Go and Oblivion, so kept passive
  //    rather than scoped to one specific cast) ──
  {
    id: 'lucilla.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 10 }, // sourced from CHAR_BUFF_TABLE's own selfBuffs entry for this same node
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 20 }],
    note: 'Confirmed exact value, 10s duration per CHAR_BUFF_TABLE\'s own selfBuffs entry for this node — no specific cast anchor sourced, kept passive.',
  },
  {
    id: 'lucilla.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'echoDmg', value: 40 }],
    note: 'Glacio Chafe DMG Amp +80% in Glacio Chafe mode OR team Echo Skill DMG Bonus +40% in Echo mode — only the Echo-mode branch has a matching schema category (echoDmg), modeled here; the Glacio-Chafe-mode branch (Glacio Chafe DMG Amp, not a plain elemDmg buff) has no matching category, not modeled.',
  },
  {
    id: 'lucilla.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'basicDmg', value: 100 },
      { stat: 'echoDmg', value: 100 },
    ],
    note: "Letting It Go's own DMG Multiplier +100% (recategorized from libDmg to {basicDmg, echoDmg} per the re-audit — its own move text makes damage type mode-dependent, never Liberation-type despite being part of the Liberation combo). Both keys carry the same value since only one mode's SKILL_MULTIPLIERS type ever applies in a given build, so they never double-count. Kept passive, applies whenever lucilla.basic.letting-it-go fires.",
  },
  {
    id: 'lucilla.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 10, stacking: 'stacking', maxStacks: 3 }],
    note: 'ATK +10%/stack up to 3 stacks (+30% max, confirmed exact) — modeled as per-stack 10% x3 cap, matching the real stacking mechanic.',
  },
  {
    id: 'lucilla.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'basicDmg', value: 50 },
      { stat: 'echoDmg', value: 50 },
    ],
    note: "Oblivion's own DMG Multiplier +50% (recategorized per the re-audit, same dual-key non-double-counting pattern as S3) — kept passive, applies whenever lucilla.basic.oblivion fires.",
  },
  {
    id: 'lucilla.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'basicDmg', value: 600 },
      { stat: 'echoDmg', value: 600 },
    ],
    note: "Each Photo consumed in Reminiscence grants 1 Remembrance stack (max 3, +200%/stack) on Letting It Go — a full 3-Photo Reminiscence reliably hits max, using the max value +600% (recategorized per the re-audit, same dual-key non-double-counting pattern as S3). Kept passive.",
  },
];
