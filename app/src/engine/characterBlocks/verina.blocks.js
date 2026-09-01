// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/verina.blocks.js
// Verina converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Verina'], RESONANCE_CHAIN_DATA['Verina'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Verina'], and CHARACTER_ROTATIONS['Verina']. No new numbers invented. S1/S2/
// S3/S5 correctly have NO block — pure resource/healing-percent utility with zero
// DPS component, per the audit's own zeroing. Her real rotation cancels Botany
// Experiment's hit with the Liberation, so it deals no damage, and she has no
// Intro cast at all (Prydwen rates it "unusable").
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Verina';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const VERINA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'verina.basic.cultivation-stage3-5',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Cultivation Stage 1-5' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says she swaps in cold with no Intro, starting the combo straight
    // at Stage 3 — only stages 3-5 of the row's 5-stage combo are used.
    damage: { hits: parseSkillMultiplierHits('25.58%×2 → 67.32% → 71.62%'), category: 'basicDmg' },
    note: 'Stage 5 on hit grants 1 Photosynthesis Energy.',
  },
  {
    id: 'verina.liberation.arboreal-flourish',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Arboreal Flourish' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.81%'), category: 'libDmg' },
    note: '175 Energy, 25s cooldown. Heals the team (950 + 23.80% ATK), applies a 12s Photosynthesis Mark for Coordinated-Attack healing — not modeled (no DPS component).',
  },
  {
    id: 'verina.forte.starflower-blooms-midair',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Starflower Blooms' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('67.64%+63.82%+30.50%×3') },
    note: 'Consumes 1 Photosynthesis Energy (cap 4) per cast to heal the team (1188 + 29.75% ATK) and restore 12 Concerto Energy — not modeled (no DPS component).',
  },
  {
    id: 'verina.outro.blossom',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 }, target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 15, stacking: 'refresh' }],
    note: 'Also heals the incoming Resonator 19% ATK/s for 6s, not modeled (no DPS component). Confirmed "Amplified" (allDmg), not Deepen.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'verina.libbuff.gift-of-nature',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Arboreal Flourish' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: 'Inherent Gift of Nature: team ATK +20%/20s on Forte/Liberation/Outro triggers — modeled anchored to the Liberation cast used in her real rotation.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own detailed audit comment for each
  //    node's real mechanic; S1/S2/S3/S5 correctly have NO block — pure resource/healing-percent
  //    utility with zero DPS component, per the audit's own zeroing) ──
  // S1 correctly has NO block — Moment of Emergence's real effect has zero DPS component.
  // S2 correctly has NO block — Resonance Skill Botany Experiment additionally grants 1
  // Photosynthesis Energy and 10 Concerto Energy on cast, pure resource-economy.
  // S3 correctly has NO block — Healing of Liberation's Photosynthesis Mark +12%, pure heal% node.
  {
    id: 'verina.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Starflower Blooms' },
    timing: { duration: 24 },
    target: { scope: 'whole-team' },
    condition: { element: 'spectro' },
    effects: [{ stat: 'elemDmg', value: 15, stacking: 'refresh' }],
    note: 'Casting Heavy/Mid-air Attack Starflower Blooms, Liberation, or Outro Blossom raises the whole team\'s Spectro DMG Bonus by 15% for 24s (confirmed exact, team-wide) — modeled anchored to the Starflower Blooms cast used in her real rotation.',
  },
  // S5 correctly has NO block — when Verina heals a team member below 50% HP, her Healing is
  // increased by 20% (conditional, non-DPS), zero DPS component.
  {
    id: 'verina.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Mid-air Attack: Starflower Blooms' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 20 }],
    note: 'Heavy/Mid-air Attack Starflower Blooms deal 20% more DMG (confirmed exact) — cast-scoped (instant, no persistent duration). Also triggers an extra Coordinated Attack + team heal on cast (equal to Liberation\'s Photosynthesis Mark values), not modeled.',
  },
];
