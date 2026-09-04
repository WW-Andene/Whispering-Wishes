// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/taoqi.blocks.js
// Taoqi converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Taoqi'], RESONANCE_CHAIN_DATA['Taoqi'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Taoqi'], and CHARACTER_ROTATIONS['Taoqi']. No new numbers
// invented. S1/S3/S4 correctly have NO block — shield/utility/DEF%-scaling
// conditional effects with no matching category in this DPS-focused schema, per
// the audit's own zeroing. Liberation Unmovable scales off DEF, not ATK
// (basis: 'DEF').
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Taoqi';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const TAOQI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'taoqi.intro.defense-formation',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Defense Formation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized. The dump's own
    // multiplier table labels this row generically "Skill Damage", same default convention used
    // throughout this Phase A sweep.
    damage: { hits: parseSkillMultiplierHits('208.76%'), category: 'skillDmg' },
    note: 'Havoc DMG opener; Basic Attack afterward casts Timed Counters (Power Shift) directly.',
  },
  {
    id: 'taoqi.skill.fortified-defense',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Fortified Defense' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('134.92%'), category: 'skillDmg' },
    note: 'Havoc DMG to surrounding targets; generates 3 Rocksteady Shield stacks and heals self (not modeled, no DPS component).',
  },
  {
    id: 'taoqi.liberation.unmovable',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Unmovable' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('449.71%'), category: 'libDmg', basis: 'DEF' },
    note: "DEF-scaling Havoc nuke — benefits from her naturally high base DEF, not ATK.",
  },
  // Concealed Edge (real Basic Attack, Stages 1-4) — added 2026-09-04 (Phase A audit,
  // REMAINING_WORK.md 1c). The dump's own Sample Rotation text lists real Basic Attack usage
  // TWICE, distinct from Power Shift's Timed Counters: "Basic P1-3 (pre-rotation) → Intro → Timed
  // Counter 1-3 → Liberation → Basic P1-4 → Skill → Outro." SKILL_MULTIPLIERS already carries this
  // move's own 4-stage row (90.15% / 84.84% / 111.34% / 270.39%), but no engine block or
  // CHARACTER_ROTATIONS step ever referenced it — only Timed Counters was modeled as basicDmg,
  // silently undercounting the actual normal-attack combo the dump's own rotation calls for.
  {
    id: 'taoqi.basic.concealed-edge',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Concealed Edge' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('90.15% → 84.84% → 111.34% → 270.39%'), category: 'basicDmg' },
    note: 'Up to 4 Havoc strikes — real normal-attack combo, distinct from Power Shift\'s Timed Counters.',
  },
  {
    id: 'taoqi.forte.power-shift-timed-counters',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Power Shift: Timed Counters' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('86.2% → 110.93% → 145.41%'), category: 'basicDmg' },
    note: 'Basic ATK after Heavy ATK Strategic Parry/Intro consumes "Resolving Caliber" for extra hits and a shield (not modeled); counted as Basic ATK DMG.',
  },
  {
    id: 'taoqi.outro.iron-will',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 }, target: { scope: 'next-on-field' },
    effects: [{ stat: 'skillDmg', value: 38, stacking: 'refresh' }],
    note: "Buffs the incoming Resonator's Resonance Skill DMG, no direct DMG.",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S1/S3/S4 correctly have NO block — shield/utility/DEF%-scaling
  //    conditional effects, no matching category in this schema, per the audit's own zeroing) ──
  // S1 correctly has NO block — Power Shift's Shield +40%, shield/utility with zero DPS component.
  {
    id: 'taoqi.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Unmovable' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 20 },
      { stat: 'critDmg', value: 20 },
    ],
    note: 'Liberation Unmovable grants BOTH Crit Rate +20% AND Crit DMG +20% simultaneously (confirmed exact, both effects) — cast-scoped (instant, no persistent duration).',
  },
  // S3 correctly has NO block — Rocksteady Shield duration extended to 30s, a pure duration-extension
  // utility with no matching category.
  // S4 correctly has NO block — 25% HP heal + DEF +50% for 5s on a successful Strategic Parry
  // (1x/15s), a healing/DEF%-scaling conditional buff with no matching category in this
  // ATK-DPS-focused schema.
  {
    id: 'taoqi.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Power Shift: Timed Counters' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 50 }],
    note: "Power Shift DMG +50% (confirmed exact; Power Shift is 'considered as Basic Attack DMG' per its own Forte text) — cast-scoped (instant, no persistent duration). Also restores 20 Resonance Energy on hit, not modeled.",
  },
  {
    id: 'taoqi.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    condition: { requiresStance: 'Rocksteady Shield active' },
    effects: [
      { stat: 'basicDmg', value: 40 },
      { stat: 'heavyDmg', value: 40 },
    ],
    note: 'Basic ATK and Heavy ATK DMG +40% while Rocksteady Shield holds (confirmed exact, conditional) — the shield\'s real uptime/duration isn\'t modeled, kept passive.',
  },
];
