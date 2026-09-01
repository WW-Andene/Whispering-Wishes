// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/buling.blocks.js
// Buling converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Buling'], RESONANCE_CHAIN_DATA['Buling'] (+ its own detailed audit
// comment), SKILL_MULTIPLIERS['Buling'], and CHARACTER_ROTATIONS['Buling']. No new
// numbers invented. A healer — several Heavy ATK variants and S2-S5 chain nodes are
// intentionally non-damage (healing/utility), correctly zeroed/unmodeled per the
// audit comment.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Buling';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const BULING_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'buling.intro.summon-and-smite',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Summon and Smite' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('131.10%') },
  },
  {
    id: 'buling.basic.stage1',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Hexagram Calls, Lightning Falls: Stage 1' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('20.73%×2'), category: 'basicDmg' },
  },
  {
    id: 'buling.basic.stage2',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Hexagram Calls, Lightning Falls: Stage 2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('33.45%×2'), category: 'basicDmg' },
  },
  {
    id: 'buling.basic.midair',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Mid-air Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('73.96%'), category: 'basicDmg' },
  },
  {
    id: 'buling.skill.thunder-talisman',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:In Shadow Thunder Stirs: Thunder Talisman' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('58.40%'), category: 'skillDmg' },
  },
  {
    id: 'buling.basic.stage4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Hexagram Calls, Lightning Falls: Stage 4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('93.64%'), category: 'basicDmg' },
  },
  {
    id: 'buling.heavy.mountain-over-thunder',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Heavy Attack - Mountain Over Thunder' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('178.93%'), category: 'basicDmg' },
  },
  {
    id: 'buling.heavy.twin-thunders',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Heavy Attack - Twin Thunders' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('18.30%'), category: 'basicDmg' },
    note: 'Real value is "169 flat + 18.30% ATK" — the flat 169 component has no home in this schema (only %ATK hits are modeled), so only the ATK-scaling portion is captured. Primarily a team-heal move (once/s for 8s), not modeled.',
  },
  {
    id: 'buling.liberation.flashing-thunder-spell-harmony',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Flashing Thunder Spell: Harmony' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('536.79%'), category: 'libDmg' },
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'buling.outro.exorcism-spell',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 15, stacking: 'refresh' }],
    note: 'Also heals the active character 18% ATK/s for 16s, not modeled (no DPS component).',
  },
  {
    id: 'buling.libbuff.five-thunders-skill-ramp',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Flashing Thunder Spell: Harmony' },
    timing: { duration: 24 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'skillDmg', value: 25, stacking: 'refresh' }],
    note: 'Five Thunders Spell Array: team Resonance Skill DMG Bonus ramps +10%->+25% as allies cast Intro Skill during it — modeled at the ceiling value (25%), the ramp-up mechanic itself not modeled. See buling.chain.s6 below for the S6 upgrade of this same buff to 50%.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each
  //    node's real mechanic; S2-S5 correctly have NO block — pure Energy-regen/healing utility with
  //    no DPS component) ──
  {
    id: 'buling.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Flashing Thunder Spell: Harmony' },
    timing: { duration: 24 }, // matches the Five Thunders Spell Array's own 24s duration, since this is conditional on it being active
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 20 }],
    note: 'Real mechanic: enhanced Liberation (Flashing Thunder Spell: Harmony) grants +20% Crit Rate upon dealing DMG, while the Five Thunders Spell Array is active — modeled as firing on the same cast, lasting the array\'s own 24s.',
  },
  {
    id: 'buling.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Flashing Thunder Spell: Harmony' },
    timing: { duration: 24 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'skillDmg', value: 50 }],
    note: "Real mechanic: upgrades the Five Thunders Spell Array's own Resonance Skill DMG Bonus from 25% to 50% — NOT additive with buling.libbuff.five-thunders-skill-ramp above (both firing would double-count at S6, giving 75% instead of the correct 50%). This is a known imprecision shared with the legacy flat-table path, which has the exact same additive-not-replacing limitation — not fixed in this conversion, documented rather than silently wrong.",
  },
];
