// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/yuanwu.blocks.js
// Yuanwu converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Yuanwu'] (all empty — no buffs), RESONANCE_CHAIN_DATA['Yuanwu']
// (+ its own detailed 2026-09-01 re-audit comment, read directly for each node's
// real mechanic), SKILL_MULTIPLIERS['Yuanwu'], and CHARACTER_ROTATIONS['Yuanwu'].
// No new numbers invented. S1/S2/S3/S4/S6 correctly have NO block — his kit is
// almost entirely attack-speed/DEF%/shield/resource-scaling, with no matching
// category in this ATK-DPS-focused schema, per the audit's own zeroing (only S5
// carries a real representable value).
//
// Fixed 2026-09-02 (found while re-auditing against a fresh Prydwen dump): added
// `basis: 'DEF'` to every damage block below — resolveHitComposedDps.js's own doc
// says every hit is ATK-scaling BY DEFAULT unless the block says otherwise, and
// none of these did, despite every one of Yuanwu's real multipliers being
// explicitly DEF-scaling (his own dump literally suffixes every value with "DEF").
// Same fix applied to CHARACTER_DATA['Yuanwu'].statScaling (was 'ATK', corrected
// to 'DEF') — this was a live-DPS-relevant bug, not cosmetic, same pattern as
// Taoqi/Mornye (both already correctly carry basis: 'DEF' on every block).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Yuanwu';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const YUANWU_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'yuanwu.intro.thunder-bombardment',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Thunder Bombardment' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('63.62%'), basis: 'DEF' },
  },
  {
    id: 'yuanwu.skill.thunder-wedge',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Thunder Wedge' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('23.86%'), category: 'skillDmg', basis: 'DEF' },
    note: 'Summons Thunder Wedge (lasts 12s), forms a Thunder Field around it — the on-field character\'s hits inside trigger a Coordinated ATK (7.96%, 1x/1.2s, not modeled). Fires twice in the real rotation.',
  },
  {
    id: 'yuanwu.liberation.blazing-might',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Blazing Might' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Combines Thunder Wedge Detonation (59.65%) with Blazing Might's own hit (174.96%x2) — the
    // rotation's own note says this cast detonates the active Thunder Wedge AND deals its own blow.
    damage: { hits: [...parseSkillMultiplierHits('59.65%'), ...parseSkillMultiplierHits('174.96%×2')], category: 'libDmg', basis: 'DEF' },
    note: 'Detonates the active Thunder Wedge (counted as Resonance Skill DMG) and grants Forte Circuit Lightning Infused (Interruption Resistance) to the nearby team for 10s (not modeled), then a powerful blow.',
  },
  {
    id: 'yuanwu.forte.rumbling-spark',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Rumbling Spark' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Combines Thunder Wedge Detonation (59.65%) with Rumbling Spark's own hit (108.54%) — the
    // rotation's own note says this cast detonates Thunder Wedge again on the way into Lightning Infused.
    damage: { hits: [...parseSkillMultiplierHits('59.65%'), ...parseSkillMultiplierHits('108.54%')], category: 'skillDmg', basis: 'DEF' },
    note: 'Once Forte Gauge is full, hold Skill to consume all Readiness and enter Lightning Infused, detonating the active Thunder Wedge on the way in.',
  },
  {
    id: 'yuanwu.outro.lightning-manipulation',
    source: SOURCE, kind: 'utility',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Depletes enemy Vibration Strength on swap-out — no DMG, no DPS-representable buff.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S1/S2/S3/S4/S6 correctly have NO block — attack-speed/DEF%/shield/
  //    resource-scaling effects with no matching category in this schema, per the audit's own zeroing) ──
  // S1 correctly has NO block — Lightning Infused grants +20% Basic ATK Speed and +20% Heavy ATK
  // Speed, attack-speed (not a DMG%), no matching category.
  // S2 correctly has NO block — Thunder Bombardment restores 15 extra Resonance Energy, pure utility.
  // S3 correctly has NO block — Thunder Wedge's Coordinated ATK deals a bonus hit equal to 20% of
  // Yuanwu's DEF, a flat DEF-scaling bonus-hit addition with no representable derivation.
  // S4 correctly has NO block — casting Blazing Might grants a Shield equal to 200% of Yuanwu's DEF
  // for 10s, a shield, not DPS.
  {
    id: 'yuanwu.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Blazing Might' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 50 }],
    note: "Blazing Might's own DMG Multiplier +50% — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  // S6 correctly has NO block — nearby team gains DEF +32% for 3s, a team-wide DEF buff with no
  // matching category in this schema.
];
