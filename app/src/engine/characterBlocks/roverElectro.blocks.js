// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/roverElectro.blocks.js
// Rover: Electro converted to TriggerBlocks — proof-of-concept for the Phase 2
// trigger-driven engine (see ../triggerBlocks.schema.js). Sourced directly from
// characters.js's already-audited SKILL_MULTIPLIERS['Rover: Electro'],
// CHARACTER_ROTATIONS['Rover: Electro'], RESONANCE_CHAIN_DATA['Rover: Electro'],
// and CHAR_BUFF_TABLE['Rover: Electro'] (2026-09-01 audit) — no new numbers
// invented here, only the same values re-expressed as declarative blocks.
//
// Verified for parity against the legacy flat-table path by
// __tests__/triggerEngine-rover-electro.test.js.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../shared/skillMultiplierParser.js';

const SOURCE = 'Rover: Electro';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const ROVER_ELECTRO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS, split per the 2026-09-01 audit fix). `damage.hits`
  //    populated 2026-09-01 alongside the "totalMult -> hit-composed DPS" design doc — real per-hit
  //    %ATK parsed from these same already-audited strings, no new numbers invented. ──
  {
    id: 'rover-electro.basic.deterrence',
    source: SOURCE,
    kind: 'damage',
    // A real gap found while populating damage.hits: this 4-stage combo — the very FIRST real damage
    // step in CHARACTER_ROTATIONS['Rover: Electro'] — had no block of its own at all (only its
    // auto-chained follow-up, Repel, was modeled). Added now, same "fill the gap found during
    // migration" precedent as Yinlin's Lightning Execution split.
    trigger: { type: 'cast', on: 'Basic ATK:Deterrence 1-4' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('51.08% → 26.00%+39.00% → 13.27%×7 → 72.82%+109.22%'), category: 'basicDmg' },
    note: 'Tap Basic Attack 4 times in a row — each hit builds more Electric Surge.',
  },
  {
    id: 'rover-electro.skill.thunderclap',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Thunderclap' },
    timing: { cooldown: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 0 }], // no-op placeholder, kept as-is (harmless — applyBuff's
    // default case ignores it); the real damage now lives in `damage.hits` below.
    damage: { hits: parseSkillMultiplierHits('100.20%×2'), category: 'skillDmg' },
  },
  {
    id: 'rover-electro.basic.repel',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Repel' },
    condition: { requiresStance: undefined },
    timing: { delay: 0 },
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('56.12%+84.17%'), category: 'basicDmg' },
    note: 'Auto-chains from a single Basic Attack tap right after Thunderclap lands.',
  },
  {
    id: 'rover-electro.forte.overshock',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'resource-threshold', resource: 'Electric Surge', threshold: 120, resourceStepOn: 'Forte:Overshock' },
    condition: {},
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('80.72%×7+423.77%+423.77%'), category: 'skillDmg' },
    note: 'TAP at max Electric Surge (HOLD enters Apex Resonance instead) — counted as Resonance Skill DMG per its own kit text. Forte-type per the 2026-09-01 rotation fix.',
  },
  {
    id: 'rover-electro.liberation.ultimate-tactics',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Ultimate Tactics' },
    timing: { cooldown: 25 },
    target: { scope: 'self' },
    effects: [],
    // Fixed 2026-09-03 against a fresh the source dump: was 1192.86%, real value is 1109.22%.
    damage: { hits: parseSkillMultiplierHits('1109.22%'), category: 'libDmg' },
  },
  {
    id: 'rover-electro.intro.thunderous-fury',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'swap-in' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // No `category` — Intro/Outro casts are excluded from calcEngine.js's own dmgFocus-routing
    // buckets (see ROTATION_RAW_TYPE_TO_FOCUS's own comment there: "Intro/Outro are one-off utility
    // casts, not a repeated rotation-damage type"), so this hit's DMG Bonus draws only from elemDmg,
    // not a type-specific category — resolveHitComposedDps.js already handles an absent `category`
    // correctly (categoryStat defaults to 0).
    damage: { hits: parseSkillMultiplierHits('33.41%×2+100.21%') },
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'rover-electro.selfbuff.overshock-atk',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'resource-threshold', resource: 'Electric Surge', threshold: 120, resourceStepOn: 'Forte:Overshock' },
    condition: {},
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 10, stacking: 'refresh' }],
    note: 'Tap-cast Overshock at max Electric Surge grants team ATK +10% (20s).',
  },
  {
    id: 'rover-electro.outro.rumbling-thunders',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'swap-out' },
    condition: {},
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'allDmg', value: 25, stacking: 'refresh' }],
    note: 'Grants Electro Core; next Negative Status hit from the incoming Resonator consumes it for All DMG Amp +25% (14s). Modeled here as applying on swap-out — the real Negative-Status-hit gate is a Phase-2-engine TODO (needs a negative-status-tracking trigger type not yet modeled by calcEngine.js either).',
  },

  // ── Debuff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'rover-electro.debuff.electro-flare',
    source: SOURCE,
    kind: 'debuff',
    trigger: { type: 'cast', on: 'Forte:Overshock' },
    condition: {},
    timing: { duration: 99 },
    target: { scope: 'marked-enemy' },
    effects: [{ stat: 'flare', value: 10, stacking: 'stacking', maxStacks: 10 }],
    note: 'Hold-cast Overshock (Inherent Skill "Decipher") inflicts 10 stacks of Electro Flare.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — S1/S2 zeroed per the 2026-09-01 audit,
  //    no real DPS component/schema category yet) ──
  {
    id: 'rover-electro.chain.s1-celestial-ingenuity',
    source: SOURCE,
    kind: 'utility',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: 'Interruption-resistance utility — no DPS component; TODO: needs Phase 2 schema category.',
  },
  {
    id: 'rover-electro.chain.s2-thousandfold-artifice',
    source: SOURCE,
    kind: 'utility',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: 'Electro Flare stack mechanic — no DPS component; TODO: needs Phase 2 schema category.',
  },
  {
    id: 'rover-electro.chain.s3-alchemy-of-wonders',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 20 }],
    note: 'Overshock DMG +20%.',
  },
  {
    id: 'rover-electro.chain.s4-earthquaking-rumble',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 20 }],
    note: 'Liberation DMG +20%.',
  },
  {
    id: 'rover-electro.chain.s5-principle-of-change',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    condition: { requiresStance: 'Apex Resonance' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 20 }],
    note: 'Crit DMG +20% while in Apex Resonance.',
  },
  {
    id: 'rover-electro.chain.s6-minds-depths',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 20 }],
    note: 'Thrum of All Sounds/Thunder Bane DMG +20%.',
  },
];
