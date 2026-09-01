// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/luukherssen.blocks.js
// Luuk Herssen converted to TriggerBlocks. Sourced from characters.js's already-
// audited CHAR_BUFF_TABLE['Luuk Herssen'] (all zero, plus its own Tune Break
// sub-object — no DPS-representable buffs), RESONANCE_CHAIN_DATA['Luuk Herssen']
// (+ its own audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Luuk Herssen'], and CHARACTER_ROTATIONS['Luuk Herssen']. No
// new numbers invented. S1/S3/S5's approximated totalMult/basicDmg values are
// kept as documented approximations per the source table's own reasoning, not
// re-derived further.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Luuk Herssen';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const LUUK_HERSSEN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'luukherssen.intro.before-injection-of-dawn',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Before Injection of Dawn' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('72.67%×3') },
    note: 'Restores 100 Ichor Flow, grants Dawnlit Keep (free damage-reduction/interruption-immunity charge, not modeled). Also inflicts Tune Strain.',
  },
  {
    id: 'luukherssen.midair.jump-scythe-resection-stage2-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Mid-air:Jump: Scythe Resection Stage 2-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('50.42%×2 → 74.92%×2') },
    note: 'Jump-input airborne combo (does slightly more damage/Energy than the Basic-input variant), restores Ichor Flow, applies Tune Strain.',
  },
  {
    id: 'luukherssen.skill.aureole-ring',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Aureole of Execution: Ring' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('26.56%×5+88.53%'), category: 'skillDmg' },
    note: 'Resets the Mid-air Attack cycle, grants 1 Endnotes stack. Unlocks a Golden Impale follow-up.',
  },
  {
    id: 'luukherssen.basic.golden-impale',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Golden Impale' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('155.47%'), category: 'basicDmg' },
    note: 'Follow-up dash hit after Ring or Breach (its wind-up is long, cancelled early in the real rotation, barely damaging by design). Fires twice.',
  },
  {
    id: 'luukherssen.midair.basic1-jump-resection2-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Mid-air:Basic 1 → Jump: Resection 2-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // No separate SKILL_MULTIPLIERS row for the "Basic 1" prefix hit — the Resection Stage 2-3 segment
    // is used as a representative value for the combo cycle this step performs.
    damage: { hits: parseSkillMultiplierHits('50.42%×2 → 74.92%×2') },
    note: 'Jump back into the airborne combo for a further cycle. No separate row for the leading Basic Attack input, not modeled. Fires twice in the real rotation.',
  },
  {
    id: 'luukherssen.skill.aureole-breach',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Aureole of Execution: Breach' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('95.91%×3'), category: 'skillDmg' },
    note: 'Resets the Mid-air Attack cycle, hurls an Ichor Blade, grants another Endnotes stack.',
  },
  {
    id: 'luukherssen.skill.aureole-glare',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Aureole of Execution: Glare' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('354.11%'), category: 'skillDmg' },
    note: 'Hurls Solid-State Ichor forming an Ichor Deposit, grants the 3rd Endnotes stack, unlocks the plunging Mid-air Attack finisher.',
  },
  {
    id: 'luukherssen.forte.gavel-of-earthshaker',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Gavel of Earthshaker' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('306.90%') },
    note: 'Plunge attack that detonates his Ichor Deposit, fully restores STA.',
  },
  {
    id: 'luukherssen.liberation.rewritten-in-winters-margins',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Liberation:Rewritten in Winter's Margins" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('745.54% + 49.71%×5'), category: 'libDmg' },
    note: 'Ultimate nuke, empowered +25% per Endnotes stack (up to +75% with all 3 banked) — real Endnotes stack scaling not modeled (base value used), see luukherssen.chain.s6 below for the S6 chain-boosted upgrade of that same mechanic.',
  },
  {
    id: 'luukherssen.skill.golden-reflux',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Golden Reflux' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('201.20%'), category: 'skillDmg' },
    note: 'Dash strike, unlocks the 3-stage Aureole of Execution. Cast a 2nd time near the end of the rotation to bank Concerto Energy for the Outro.',
  },
  {
    id: 'luukherssen.outro.bow-to-the-last-light',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('500%') },
    note: 'Flat 500% ATK Spectro hit, also refreshes Golden Rule on the team (25s cycle, full-Forte swap-in) — not modeled (no DPS component).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'luukherssen.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 15 }],
    note: '+150% Mid-air ATK DMG — simplified as a basicDmg ~15 DPS-impact approximation, documented and kept per the source table\'s own reasoning (not a literal Mid-air-only category in this schema).',
  },
  {
    id: 'luukherssen.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: "Liberation:Rewritten in Winter's Margins" },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 60 }],
    note: "Rewritten in Winter's Margins DMG Multiplier +60% — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'luukherssen.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 15 }],
    note: 'Aureole of Execution forms +136% in Aureate Judge (conditional, no flat unconditional %) — kept as an approximated totalMult per the source table\'s own reasoning, not the literal 136% conditional figure.',
  },
  {
    id: 'luukherssen.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20 }],
    note: 'Team All DMG +20% (not Basic DMG) on ally Tune Break — a cross-character trigger (an ALLY applying Tune Break, not Luuk\'s own cast) this schema has no clean anchor for, kept passive team-wide as an approximation.',
  },
  {
    id: 'luukherssen.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 15 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  {
    id: 'luukherssen.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 40, stacking: 'stacking', maxStacks: 3 }],
    note: 'Endnotes stacking grants Liberation DMG +40%/stack up to +120% (3 stacks) — modeled as per-stack 40% x3 cap, matching the real stacking mechanic (Endnotes stacks are gained on each Aureole of Execution cast above, consumed/read at Liberation cast time) rather than a flat 120%.',
  },
];
