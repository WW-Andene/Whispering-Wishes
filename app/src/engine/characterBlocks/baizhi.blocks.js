// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/baizhi.blocks.js
// Baizhi converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Baizhi'], RESONANCE_CHAIN_DATA['Baizhi'] (+ its own audit comment,
// which spells out each node's real mechanic), SKILL_MULTIPLIERS['Baizhi'], and
// CHARACTER_ROTATIONS['Baizhi']. No new numbers invented. A healer — most of her
// kit is intentionally non-damage (S1/S3/S4/S5 chain nodes correctly zeroed by the
// audit; Forte Cycle of Life is pure healing, no block).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Baizhi';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const BAIZHI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'baizhi.intro.overflowing-frost',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Overflowing Frost' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('79.53%') },
    note: 'Row also lists "+ heal", not modeled (no fabricated non-DPS number).',
  },
  {
    id: 'baizhi.liberation.momentary-union',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Momentary Union' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('4.07%×4'), category: 'libDmg' },
    note: "Spawns 4 Remnant Entities (4.07% each) that auto-attack and heal every 2.5s afterward — this block models one representative hit-set (the initial cast), not the sustained repeated-tick damage over the entities' full lifetime (a DOT-like mechanic beyond this schema's single-cast hit-list model). Team heal component not modeled.",
  },
  {
    id: 'baizhi.skill.emergency-plan',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Emergency Plan' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('15.94%'), category: 'skillDmg' },
    note: 'Row also lists "+ healing", not modeled.',
  },
  {
    id: 'baizhi.heavy.destined-promise-channel',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Destined Promise (channel)' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('48.86%'), category: 'heavyDmg' },
    note: 'Source value is 48.86%/s (a continuous channel, not a discrete hit) — modeled as one representative 1-second tick; real total scales with channel duration, not captured by this schema\'s single-cast hit-list model.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'baizhi.outro.rejuvinating-flow',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 6 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'deepen', value: 15, stacking: 'refresh' }],
    note: 'Row also lists a 30s/3s-tick heal, not modeled. The 15% Deepen ticks/refreshes on heal per CHAR_BUFF_TABLE\'s own note — modeled as a flat 6s duration, refresh stacking, since the refresh-condition ("on heal") isn\'t a trigger this schema can key off yet.',
  },
  {
    id: 'baizhi.libbuff.euphonia-atk',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 20 }, // real trigger is "on Euphonia pickup" — no CHARACTER_ROTATIONS step identifies exactly when that occurs, so modeled as passive (same "no sourced trigger timing" simplification as Aemeath's S4) rather than fabricating a cast trigger
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 15, stacking: 'refresh' }],
    note: 'Inherent Skill: team ATK +15% for 20s on Euphonia pickup — real trigger event not identifiable from current CHARACTER_ROTATIONS data, modeled as passive rather than fabricating cast timing.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — S1/S3/S4/S5 correctly zeroed by its own
  //    audit comment: pure utility/HP%-scaling/healing effects with no DPS component this schema can
  //    represent) ──
  {
    id: 'baizhi.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 12 }, // real trigger: Emergency Plan at 4 Concentration — same "no precise gauge data" simplification as resource-threshold characters without a matching CHARACTER_ROTATIONS step to anchor it
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15 }],
    note: 'Real mechanic per RESONANCE_CHAIN_DATA\'s own audit comment: Emergency Plan at 4 Concentration grants Glacio DMG Bonus+15% (+ Healing+15%, not modeled) for 12s — the "at 4 Concentration" gate isn\'t modeled (no gauge simulation, same category of gap as Chameleon Cipher\'s resourceStepOn workaround, not applicable here since no CHARACTER_ROTATIONS step marks this specific threshold); kept passive.',
  },
  {
    id: 'baizhi.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 20 }, // same "Euphonia pickup" trigger as baizhi.libbuff.euphonia-atk above, same simplification
    target: { scope: 'whole-team' },
    effects: [{ stat: 'elemDmg', value: 12 }],
    note: 'Euphonia pickup grants team Glacio DMG Bonus+12% for 20s — same real trigger as baizhi.libbuff.euphonia-atk, same "no identifiable rotation step" simplification.',
  },
];
