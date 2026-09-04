// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/sanhua.blocks.js
// Sanhua converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Sanhua'], RESONANCE_CHAIN_DATA['Sanhua'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Sanhua'], and CHARACTER_ROTATIONS['Sanhua']. No new numbers invented. S2
// correctly has NO block — pure STA-cost-reduction/interruption-resist utility
// with zero DPS component, per the audit's own zeroing.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../shared/skillMultiplierParser.js';

const SOURCE = 'Sanhua';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const SANHUA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'sanhua.intro.freezing-thorns',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Freezing Thorns' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized. No override
    // text names a different category, same default-to-skillDmg convention as every other character's
    // similarly generic Intro row.
    damage: { hits: parseSkillMultiplierHits('139.17%'), category: 'skillDmg' },
    note: 'Creates 1 Ice Thorn.',
  },
  {
    id: 'sanhua.liberation.glacial-gaze',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Glacial Gaze' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('809.48%'), category: 'libDmg' },
    note: 'Creates 1 Glacier, grants 2 stacks of Clarity (expands Frostbite area).',
  },
  {
    id: 'sanhua.skill.eternal-frost',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Eternal Frost' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('359.85%'), category: 'skillDmg' },
    note: 'Creates 1 Ice Prism, detonable by Heavy ATK: Detonate. Grants 1 stack of Clarity.',
  },
  {
    // Split 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) from a single combined block that lumped
    // both rows into one heavyDmg-categorized hit-list. The kit text separately labels each: "Detonate...
    // (considered Heavy Attack DMG)" vs. "Ice Burst... (considered Resonance Skill DMG)" — a real,
    // confirmed miscategorization, not just a missing one, matching the dump's own Damage Profile
    // showing Heavy (34.7%) and Skill (26.9%) as two separate substantial buckets. Detonate's own hit
    // stays heavyDmg below; Ice Burst is now its own skillDmg block (sanhua.forte.ice-burst).
    id: 'sanhua.forte.detonate',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Clarity of Mind: Detonate' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('186.29%×2'), category: 'heavyDmg' },
    note: 'Timed Heavy ATK release inside the Frostbite area, counted as Heavy Attack DMG. Fires twice in the real rotation.',
  },
  {
    id: 'sanhua.forte.ice-burst',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Clarity of Mind: Detonate' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65% + 79.53% + 139.17%'), category: 'skillDmg' },
    note: 'Simultaneously bursts all active Ice Thorns/Prisms/Glaciers, counted as Resonance Skill DMG per its own kit text. Fires alongside Detonate, twice in the real rotation.',
  },
  // ── Self-buffs (from CHAR_BUFF_TABLE — Inherent Skills, added 2026-09-03 against a real browser
  //    snapshot; both were entirely missing before this pass) ──
  {
    id: 'sanhua.selfbuff.condensation',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Freezing Thorns' },
    timing: { duration: 8 }, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 20 }],
    note: 'Inherent Skill Condensation: Resonance Skill DMG +20% for 8s after casting Intro Skill.',
  },
  {
    id: 'sanhua.selfbuff.avalanche',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // stat/scope fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was 'heavyDmg' with no
    // scopedToBlockId, documented at the time as over-crediting the Detonate portion since both hits
    // shared one combined heavyDmg block. Now that Ice Burst is its own skillDmg block
    // (sanhua.forte.ice-burst), this buff can finally be modeled correctly — the approximation is gone.
    effects: [{ stat: 'skillDmg', value: 20, scopedToBlockId: 'sanhua.forte.ice-burst' }],
    note: 'Inherent Skill Avalanche: Forte Circuit Ice Burst DMG +20% for 8s after casting Basic Attack V — no plain Basic ATK step exists in her real rotation to anchor a real cast trigger (same limitation as chain.s1 below), kept passive.',
  },
  {
    id: 'sanhua.outro.silversnow',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 }, target: { scope: 'next-on-field' },
    effects: [{ stat: 'basicDmg', value: 38, stacking: 'refresh' }],
    note: 'Buffs the incoming Resonator, no direct DMG.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic; S2 correctly has NO block — pure STA/interrupt-resist utility, zero DPS component
  //    per the audit's own zeroing) ──
  {
    id: 'sanhua.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 15 }],
    note: 'Basic Attack V grants +15% Crit Rate for 10s (confirmed exact) — no plain Basic ATK step exists in her real rotation to anchor the cast trigger, kept passive.',
  },
  // S2 correctly has NO block — Heavy Attack Detonate STA cost -10 plus interruption-resistance
  // utility on Eternal Frost cast, zero DPS component.
  {
    id: 'sanhua.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    condition: { requiresStance: 'target below 70% HP' },
    effects: [{ stat: 'totalMult', value: 35 }],
    note: 'DMG dealt +35% vs targets below 70% HP (confirmed exact, general damage — kept as totalMult since it\'s not attribute/skill-specific).',
  },
  {
    id: 'sanhua.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Glacial Gaze' },
    timing: { duration: 5 },
    target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 120 }],
    note: 'Heavy ATK Detonate DMG +120% for 5s after Liberation (confirmed exact) — modeled anchored to the Liberation cast.',
  },
  {
    id: 'sanhua.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Clarity of Mind: Detonate' },
    timing: {}, target: { scope: 'self' },
    // scopedToBlockId added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): critDmg is a flat modifier
    // that applies to every crit regardless of damage category, so without scoping this would have
    // boosted crit damage on her WHOLE kit, not just Ice Burst as the kit text specifies — now that Ice
    // Burst is its own block, it can be scoped correctly.
    effects: [{ stat: 'critDmg', value: 100, scopedToBlockId: 'sanhua.forte.ice-burst' }],
    note: "Forte Circuit Ice Burst Crit DMG +100% (confirmed exact, conditional to that one hit) — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'sanhua.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Clarity of Mind: Detonate' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 10, stacking: 'stacking', maxStacks: 2 }],
    note: 'Team ATK +10%/stack, stacking to 2 (20% max) for 20s (confirmed exact) — modeled as per-stack stacking, anchored to the Detonate cast used in her real rotation.',
  },
];
