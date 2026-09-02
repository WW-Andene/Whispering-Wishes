// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/qiuyuan.blocks.js
// Qiuyuan converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Qiuyuan'], RESONANCE_CHAIN_DATA['Qiuyuan'] (+ its own audit
// comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Qiuyuan'], and CHARACTER_ROTATIONS['Qiuyuan']. No new numbers invented.
// weaponBuffs (echoDmg+20 team on Signature Weapon Emerald Sentence's own pv) is
// intentionally NOT modeled — this file's own convention elsewhere already
// documents that hardcoding a weapon's own passive here double-counts it whenever
// that weapon is actually equipped (the calculator applies it separately).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Qiuyuan';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const QIUYUAN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'qiuyuan.intro.attack-the-must-defend',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Attack the Must-Defend' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('9.55%×5 + 47.72% + 143.15%'), category: 'heavyDmg' },
    note: 'Counted as Heavy ATK DMG per its own kit text. Grants 400 of 600 Forte, skips straight to Inkwash Stage 3.',
  },
  {
    id: 'qiuyuan.basic.inkwash-stage3-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Inkwash Stage 3-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Inkwash 1-4' has 4 arrow-separated stages; this step uses stages 3-4 (per its own label,
    // since the Intro already skipped to Stage 3).
    damage: { hits: parseSkillMultiplierHits('14.58%×5+72.87% → 172.37%'), category: 'basicDmg' },
    note: 'Fills Forte to 600.',
  },
  {
    id: 'qiuyuan.skill.through-the-groves',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Through the Groves' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('71.84%×3'), category: 'skillDmg' },
    note: 'Optional — best cast before this rotation via quickswap, skipped if not needed for Energy.',
  },
  {
    id: 'qiuyuan.liberation.sundering-strike',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Sundering Strike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('795.24%'), category: 'libDmg' },
    note: "Cancels the Skill's endlag on hit, grants self/team Crit DMG at 65%+ Crit Rate (see qiuyuan.libbuff.crit-dmg below).",
  },
  {
    id: 'qiuyuan.forte.to-teach',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:To Teach / To Save / To Sacrifice' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 3 alternative Heavy ATK finishers (91.44%×5 / 38.44%×3+31.45%×3 / 217.70%) — "To Teach" (the
    // strongest/first-listed) is used as a representative value; the other two follow-up effects are
    // not modeled.
    damage: { hits: parseSkillMultiplierHits('91.44%×5') },
    note: 'Heavy ATK finisher sequence in Inkwash form, empties Forte and restores Concerto Energy. Only "To Teach" is modeled — "To Save"/"To Sacrifice" have different follow-up effects, not separately represented.',
  },
  {
    id: 'qiuyuan.outro.strike-before-ready',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 100 }] },
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'qiuyuan.outro.strike-before-ready-buff',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'echoDmg', value: 50, stacking: 'refresh' }],
  },
  {
    id: 'qiuyuan.libbuff.crit-dmg',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Sundering Strike' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'critDmg', value: 30, stacking: 'refresh' }],
    note: 'Requires 65%+ Crit Rate for full value; +2% Crit DMG per 1% Crit Rate over 50% — modeled at the flat ceiling value (the real conditional Crit-Rate-scaling formula is not modeled).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'qiuyuan.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 20 }],
    note: '+20% Crit Rate (confirmed exact). Also grants uninterruptible Heavy ATKs, not modeled (no DPS component).',
  },
  {
    id: 'qiuyuan.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'echoDmg', value: 30 }],
    note: "Bamboo's Shade: +30% additional team Echo Skill DMG (confirmed exact, team-wide) — no specific cast anchor sourced, kept passive.",
  },
  {
    id: 'qiuyuan.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Sundering Strike' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 500 }],
    note: "Liberation DMG Multiplier +500% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'qiuyuan.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: '+20% ATK (confirmed exact, corrected from an earlier half-value 10) — no specific cast anchor sourced, kept passive.',
  },
  {
    id: 'qiuyuan.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 15 }],
    note: 'Ignores 15% target DEF (confirmed exact) — no specific cast anchor sourced, kept passive.',
  },
  {
    id: 'qiuyuan.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:To Teach / To Save / To Sacrifice' },
    timing: { duration: 6 },
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 100 }],
    note: 'Straw Cape grants +100% Crit DMG for 6s (confirmed exact) — modeled on the Forte finisher cast used in her real rotation.',
  },
];
