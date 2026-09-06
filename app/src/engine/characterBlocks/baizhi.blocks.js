// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/baizhi.blocks.js
// Baizhi converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Baizhi'], RESONANCE_CHAIN_DATA['Baizhi'] (+ its own audit comment,
// which spells out each node's real mechanic), SKILL_MULTIPLIERS['Baizhi'], and
// CHARACTER_ROTATIONS['Baizhi']. No new numbers invented. A healer — most of her
// kit is intentionally non-damage (S1/S3/S4/S5 chain nodes correctly zeroed by the
// audit; Forte Cycle of Life is pure healing, no block).
//
// Cooldown/concertoEnergyGain added 2026-09-06 (completeness pass, same "bring every character
// up to Aalto's reference standard" direction the Aalto/Aemeath/Augusta passes already used) —
// sourced from Data dump/Baizhi/Baizhi.md's own Cooldown/Con. Energy Regen rows (Emergency
// Plan/Momentary Union/Overflowing Frost). Forte Cycle of Life's own Concentration-gauge energy
// regen (Heavy ATK +4, Skill +8, per the dump's Forte table) is a gauge-consumption-conditional
// mechanic, not a per-cast gain — left unmodeled, same as the rest of that gauge (no block exists
// for Forte at all, per the header above), not a fabricated flat add-on to the Heavy ATK/Skill blocks.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Baizhi';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const BAIZHI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'baizhi.intro.overflowing-frost',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Overflowing Frost' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus. The dump's own multiplier table labels this row generically
    // "Skill Damage", same convention as Calcharo/Encore/Jianxin/Lingyang/Aalto.
    damage: { hits: parseSkillMultiplierHits('79.53%'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Row also lists "+ heal", not modeled (no fabricated non-DPS number).',
    // concertoEnergyGain added 2026-09-06 (completeness pass, same "consider energy regen" direction
    // as Aalto's): Data dump/Baizhi/Baizhi.md's own "Con. Energy Regen: 10" row for Intro:Overflowing Frost.
    concertoEnergyGain: 10,
  },
  {
    id: 'baizhi.liberation.momentary-union',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Momentary Union' },
    // cooldown added 2026-09-06 (completeness pass): Data dump/Baizhi/Baizhi.md's own "Cooldown: 25s" row.
    timing: { cooldown: 25 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('4.07%×4'), category: 'libDmg' , basis: 'ATK' },
    note: "Spawns 4 Remnant Entities (4.07% each) that auto-attack and heal every 2.5s afterward — this block models one representative hit-set (the initial cast), not the sustained repeated-tick damage over the entities' full lifetime (a DOT-like mechanic beyond this schema's single-cast hit-list model). Team heal component not modeled.",
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Baizhi/Baizhi.md's own
    // "Con. Energy Regen: 20" row for Momentary Union. Its "Res. Energy Cost: 175" row is a
    // Liberation-gauge cost, not a gain — no matching schema field, not modeled (no fabricated cost mechanic).
    concertoEnergyGain: 20,
  },
  {
    id: 'baizhi.skill.emergency-plan',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Emergency Plan' },
    // cooldown added 2026-09-06 (completeness pass): Data dump/Baizhi/Baizhi.md's own "Cooldown: 16s" row.
    timing: { cooldown: 16 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('15.94%'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Row also lists "+ healing", not modeled.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Baizhi/Baizhi.md's own
    // "Con. Energy Regen: 10" row for Emergency Plan.
    concertoEnergyGain: 10,
  },
  {
    id: 'baizhi.heavy.destined-promise-channel',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Destined Promise (channel)' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('48.86%'), category: 'heavyDmg' , basis: 'ATK' },
    note: 'Source value is 48.86%/s (a continuous channel, not a discrete hit) — modeled as one representative 1-second tick; real total scales with channel duration, not captured by this schema\'s single-cast hit-list model.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'baizhi.outro.rejuvinating-flow',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 6 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'amplify', value: 15, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Row also lists a 30s/3s-tick heal, not modeled. The 15% Amplify ticks/refreshes on heal per CHAR_BUFF_TABLE\'s own note — modeled as a flat 6s duration, refresh stacking, since the refresh-condition ("on heal") isn\'t a trigger this schema can key off yet.',
  },
  {
    id: 'baizhi.libbuff.euphonia-atk',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 20 }, // real trigger is "on Euphonia pickup" — no CHARACTER_ROTATIONS step identifies exactly when that occurs, so modeled as passive (same "no sourced trigger timing" simplification as Aemeath's S4) rather than fabricating a cast trigger
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 15, stacking: 'refresh', source: 'self-kit' }],
    note: 'Inherent Skill: team ATK +15% for 20s on Euphonia pickup — real trigger event not identifiable from current CHARACTER_ROTATIONS data, modeled as passive rather than fabricating cast timing.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — S1/S3/S4/S5 correctly zeroed by its own
  //    audit comment: pure utility/HP%-scaling/healing effects with no DPS component this schema can
  //    represent) ──
  {
    id: 'baizhi.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: { duration: 12 }, // real trigger: Emergency Plan at 4 Concentration — same "no precise gauge data" simplification as resource-threshold characters without a matching CHARACTER_ROTATIONS step to anchor it
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15, source: 'self-kit' }],
    note: 'Real mechanic per RESONANCE_CHAIN_DATA\'s own audit comment: Emergency Plan at 4 Concentration grants Glacio DMG Bonus+15% (+ Healing+15%, not modeled) for 12s — the "at 4 Concentration" gate isn\'t modeled (no gauge simulation, same category of gap as Chameleon Cipher\'s resourceStepOn workaround, not applicable here since no CHARACTER_ROTATIONS step marks this specific threshold); kept passive.',
  },
  {
    id: 'baizhi.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: { duration: 20 }, // same "Euphonia pickup" trigger as baizhi.libbuff.euphonia-atk above, same simplification
    target: { scope: 'whole-team' },
    condition: { element: 'glacio' },
    effects: [{ stat: 'elemDmg', value: 12, source: 'self-kit' }],
    note: 'Euphonia pickup grants team Glacio DMG Bonus+12% for 20s — same real trigger as baizhi.libbuff.euphonia-atk, same "no identifiable rotation step" simplification.',
  },
];
