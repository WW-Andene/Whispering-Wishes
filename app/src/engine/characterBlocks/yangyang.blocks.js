// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/yangyang.blocks.js
// Yangyang converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Yangyang'] (all empty — no buffs), RESONANCE_CHAIN_DATA
// ['Yangyang'] (+ its own detailed 2026-09-01 audit comment, read directly for
// each node's real mechanic), SKILL_MULTIPLIERS['Yangyang'], and
// CHARACTER_ROTATIONS['Yangyang']. No new numbers invented. S2 correctly has NO
// block — pure Resonance Energy utility with zero DPS component, per the audit's
// own zeroing.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Yangyang';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const YANGYANG_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'yangyang.intro.cerulean-song',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Cerulean Song' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized. The dump's own
    // multiplier table labels this row generically "Skill Damage", same convention as
    // Calcharo/Encore/Jianxin/Lingyang/Aalto/Baizhi/Chixia/Danjin.
    damage: { hits: parseSkillMultiplierHits('79.52%×2'), category: 'skillDmg' },
    note: 'Launches target airborne, grants 1 Melody stack.',
  },
  {
    id: 'yangyang.skill.zephyr-domain',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Zephyr Domain' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('34.53%×4 + 207.19%'), category: 'skillDmg' },
    note: 'Whirling vortex groups nearby enemies, grants 1 Melody stack.',
  },
  {
    id: 'yangyang.heavy.zephyr-song',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Zephyr Song' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was wrongly 'heavyDmg' — the
    // kit text is explicit "Zephyr Song is a Basic ATK follow-up after Heavy Attack or Dodge Counter"
    // (the "Heavy ATK" rotation-step type is just the INPUT that leads into it, same shape as Chixia's
    // Boom Boom triggered via the Basic Attack button but categorized skillDmg). Confirmed by the dump's
    // own Damage Profile showing an explicit 0% Heavy share.
    damage: { hits: parseSkillMultiplierHits('106.61%'), category: 'basicDmg' },
    note: 'Basic ATK follow-up after Heavy ATK or Dodge Counter, grants the 3rd Melody stack.',
  },
  {
    id: 'yangyang.forte.feather-release',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Echoing Feathers: Feather Release' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized. Per this
    // project's own "counted as X" convention, a kit-text category label applies to the whole named
    // move/row it's attached to, not just the sub-clause it happens to sit nearest — the dump's kit text
    // ("landing with a sword-sheathe attack, counted as Basic Attack DMG") describes the Feather Release
    // move as a whole, so the full combined row (diving strikes + landing hit) is basicDmg.
    damage: { hits: parseSkillMultiplierHits('21.73%×5 + 126.81%×2'), category: 'basicDmg' },
    note: 'Mid-air Basic ATK consuming all 3 Melodies, counted as Basic Attack DMG.',
  },
  {
    id: 'yangyang.liberation.wind-spirals',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Wind Spirals' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('46.58%×12 + 372.70%'), category: 'libDmg' },
    note: 'Cyclone groups nearby enemies, generates Concerto Energy.',
  },
  {
    id: 'yangyang.outro.whispering-breeze',
    source: SOURCE, kind: 'utility',
    trigger: { type: 'swap-out' },
    timing: { duration: 5 }, target: { scope: 'next-on-field' }, effects: [],
    note: 'Funnels 4 Resonance Energy/s to the incoming Resonator for 5s — no direct DMG buff, not representable as a DPS stat.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 audit comment for
  //    each node's real mechanic; S2 correctly has NO block — pure Resonance Energy utility, zero DPS
  //    component per the audit's own zeroing) ──
  {
    id: 'yangyang.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Cerulean Song' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15 }],
    note: 'Intro Cerulean Song grants an additional +15% Aero DMG Bonus for 8s (confirmed exact).',
  },
  // S2 correctly has NO block — Heavy Attack recovers +10 Resonance Energy on hit, 1x/20s, pure
  // Energy utility, zero DPS component.
  {
    id: 'yangyang.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Zephyr Domain' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 40 }],
    note: "Resonance Skill Zephyr Domain DMG +40% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5. Also increases pulling range +33%, not modeled.",
  },
  {
    id: 'yangyang.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Echoing Feathers: Feather Release' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 95 }],
    note: "Mid-Air Feather Release DMG +95% (confirmed exact) — kept as totalMult, the closest available fallback for a named-move DMG Multiplier buff with no matching flat-schema category, per the audit's own reasoning. Cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'yangyang.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Wind Spirals' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 85 }],
    note: "Resonance Liberation Wind Spirals DMG +85% (confirmed exact) — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'yangyang.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Echoing Feathers: Feather Release' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: 'Team-wide ATK +20% for 20s after casting Feather Release (confirmed exact, team-wide).',
  },
];
