// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lingyang.blocks.js
// Lingyang converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Lingyang'], RESONANCE_CHAIN_DATA['Lingyang'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Lingyang'], and CHARACTER_ROTATIONS['Lingyang']. No new numbers
// invented. S1/S2 correctly have NO block — pure poise/resource-gain utility with
// zero DPS component, per the audit's own zeroing. S5 is modeled as a real proc-
// style damage block using the source's own "200% of ATK" figure instead of the
// flat totalMult approximation the table itself carried.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Lingyang';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const LINGYANG_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'lingyang.intro.lion-awakens',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Lion Awakens' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('99.41%×2') },
    note: 'One of three casts (with Furious Punches and Strive: Lion\'s Vigor) that restore Lion\'s Spirit; exact restore amount per trigger not published, not modeled.',
  },
  {
    id: 'lingyang.liberation.strive-lions-vigor',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Liberation:Strive: Lion's Vigor" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('397.62%'), category: 'libDmg' },
    note: "20s cooldown. Also grants self +50% Glacio DMG Bonus for 14s (see lingyang.selfbuff.strive below) and restores Lion's Spirit.",
  },
  {
    id: 'lingyang.forte.glorious-plunge',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Unification of Spirits' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Unification of Spirits (Striding Lion)' has 5 named components — only Glorious Plunge (the
    // Forte's own entry hit) is used here; Feral Gyrate/Mountain Roamer/Stormy Kicks/Tail Strike are
    // separately modeled below as the Basic ATK/Skill blocks the real rotation actually casts.
    damage: { hits: parseSkillMultiplierHits('172.37%') },
    note: "At full Lion's Spirit, HOLD Heavy Attack for Glorious Plunge and enter the airborne Striding Lion state.",
  },
  {
    id: 'lingyang.basic.majestic-fists',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Majestic Fists' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says this step is the 2-hit Feral Gyrate while in Striding Lion
    // (alternating with the Skill step below) — that segment of the Forte row is used, not the
    // standalone 'Majestic Fists Stage 1-5' Basic ATK row (not used outside Striding Lion in this rotation).
    damage: { hits: parseSkillMultiplierHits('87.08%×2+116.11%'), category: 'basicDmg' },
    note: "Feral Gyrate (Striding Lion Basic ATK replacement). Once Lion's Spirit drops below 10, this becomes the 8-hit+finisher Stormy Kicks instead (36.03%×8+192.15%, not separately modeled here).",
  },
  {
    id: 'lingyang.skill.ancient-arts',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Ancient Arts' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row segment for Mountain Roamer, the Striding Lion Skill replacement this step actually casts.
    damage: { hits: parseSkillMultiplierHits('82.88%×2'), category: 'skillDmg' },
    note: 'Mountain Roamer (Striding Lion Skill replacement, airborne).',
  },
  {
    id: 'lingyang.outro.frosty-marks',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('587.94%') },
    note: "Pure-damage AoE finisher — no baseline team buff (S4 Resonance Chain grants team Glacio DMG +20%/30s on this Outro, see lingyang.chain.s4 below).",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'lingyang.selfbuff.strive',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: "Liberation:Strive: Lion's Vigor" },
    timing: { duration: 14 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 50, stacking: 'refresh' }],
    note: "While active, Striding Lion's Lion's Spirit drain is halved (extending the state from 5s to 10s), not modeled (no DPS component).",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S1/S2 correctly have NO block — pure poise/resource-gain utility,
  //    zero DPS component per the audit's own zeroing) ──
  // S1 correctly has NO block — during Liberation Lion's Vigor, Anti-Interruption is enhanced, pure
  // poise/interrupt-resistance utility.
  // S2 correctly has NO block — Intro Skill Lion Awakens additionally recovers 10 Resonance Energy,
  // triggered once every 20s, pure Resonance Energy resource-gain.
  {
    id: 'lingyang.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: "Liberation:Strive: Lion's Vigor" },
    timing: { duration: 14 }, // matches Lion's Vigor's own 14s window, since this is conditional on it being active
    target: { scope: 'self' },
    effects: [
      { stat: 'basicDmg', value: 20 },
      { stat: 'skillDmg', value: 10 },
    ],
    note: "During Resonance Liberation Lion's Vigor, Basic Attack DMG Bonus +20%, Resonance Skill DMG Bonus +10% (confirmed exact) — modeled scoped to Lion's Vigor's own 14s window.",
  },
  {
    id: 'lingyang.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    condition: { element: 'glacio' },
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'refresh' }],
    note: 'Outro Skill Frosty Marks increases the Glacio DMG Bonus of all team members by 20% for 30s (confirmed exact, team-wide).',
  },
  {
    id: 'lingyang.chain.s5-bonus-hit',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Liberation:Strive: Lion's Vigor" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 200 }], category: 'libDmg' },
    note: "Resonance Liberation Strive: Lion's Vigor additionally deals Glacio DMG equal to 200% of Lingyang's ATK — modeled as a real proc-style damage block using the source's own exact figure instead of the flat totalMult:200 approximation the table itself carried (same 'discrete proc, not a modifier' treatment as Yinlin's S6/Calcharo's S6).",
  },
  {
    id: 'lingyang.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Ancient Arts' },
    timing: { duration: 3 },
    target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 100 }],
    note: "In Striding Lion state, during the first 3s after every Mountain Roamer, the Basic Attack DMG Bonus for Lingyang's NEXT Basic Attack is increased by 100% (confirmed exact) — the 'next Basic Attack only' scoping (vs. every Basic Attack within the window) isn't capturable by this flat schema, per the audit's own TODO; modeled as a flat 3s window instead.",
  },
];
