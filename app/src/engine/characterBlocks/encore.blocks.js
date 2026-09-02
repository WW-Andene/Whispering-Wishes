// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/encore.blocks.js
// Encore converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Encore'], RESONANCE_CHAIN_DATA['Encore'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Encore'], and CHARACTER_ROTATIONS['Encore']. No new numbers
// invented. S2 correctly has NO block — pure Energy-economy utility with zero DPS
// component, per the audit's own zeroing.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Encore';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const ENCORE_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'encore.intro.woolies-helpers',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Woolies Helpers' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.81%') },
    note: 'Restores some Mayhem.',
  },
  {
    id: 'encore.skill.cosmos-rampage',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Cosmos: Rampage' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('63.32%×4'), category: 'skillDmg' },
    note: 'Enhanced Skill during Cosmos Rave (replaces Flaming Woolies), counted as Resonance Skill DMG. 4s internal cooldown, restores Mayhem. Fires 3x in the real rotation (real, repeated cast, not a bug).',
  },
  {
    id: 'encore.basic.cosmos-frolicking',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Cosmos: Frolicking 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('90.18%×2+56.40%×3+65.99%×4+194.01%×3'), category: 'basicDmg' },
    note: 'Enhanced Basic ATK combo during Cosmos Rave (replaces Wooly Attack), counted as Basic Attack DMG, restores Mayhem. Fires twice in the real rotation.',
  },
  {
    id: 'encore.forte.cosmos-rupture',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Cosmos Rupture' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('46.42%×6+495.21%'), category: 'libDmg' },
    note: "Cosmos Rave's version of Cloudy Frenzy — at full Mayhem, enters a 70% DMG-reduction channel (not modeled) that survives swap-out, then unleashes this on exit, counted as Resonance Liberation DMG.",
  },
  {
    id: 'encore.outro.thermal-field',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('176.76%×4') },
    note: 'AoE burn field around the Skill target, every 1.5s for 6s (4 ticks) — no team buff, pure DoT proc.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'encore.selfbuff.woolies-cheer-dance',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Cosmos: Rampage' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 10, stacking: 'refresh' }],
    note: 'Inherent Skill Woolies Cheer Dance: Fusion DMG +10%/10s on Flaming Woolies/Cosmos-Rampage cast — modeled on the Cosmos: Rampage cast (the variant actually used in her real rotation).',
  },
  {
    id: 'encore.selfbuff.angry-cosmos',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Cosmos Rave' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    condition: { requiresStance: 'HP above 70%' },
    effects: [{ stat: 'allDmg', value: 10 }],
    note: "Inherent Skill Angry Cosmos: +10% DMG dealt during Resonance Liberation Cosmos Rave while Encore's HP is above 70% — duration approximated to Cosmos Rave's own 10s window since the source gives no separate timer (same approximation already flagged in CHAR_BUFF_TABLE's own condition text).",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S2 correctly has NO block — pure Energy-economy utility, zero DPS
  //    component per the audit's own zeroing) ──
  {
    id: 'encore.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Basic ATK:Cosmos: Frolicking 1-4' },
    timing: { duration: 6 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 3, stacking: 'stacking', maxStacks: 4 }],
    note: 'Fusion DMG Bonus +3%, stacking up to 4 times for 6s, on Basic ATK hit — modeled as per-stack 3% x4 cap (matching the real stacking mechanic) rather than a flat 12%, same convention as Brant\'s S1.',
  },
  // S2 correctly has NO block — real effect is "additionally restores 10 Resonance Energy when
  // casting Basic Attack Wooly Attack or Resonance Skill Energetic Welcome, once every 10s", pure
  // Energy-economy utility, zero DPS component.
  {
    id: 'encore.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Cosmos Rupture' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 40 }],
    note: "DMG multiplier of Heavy Attack Cloudy Frenzy and Heavy Attack Cosmos Rupture +40% (both explicitly named 'Heavy Attack' by source despite being Forte-triggered, confirming the heavyDmg category) — cast-scoped to the Cosmos Rupture cast used in her real rotation.",
  },
  {
    id: 'encore.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Cosmos Rupture' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    condition: { element: 'fusion' },
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'refresh' }],
    note: 'Heavy Attack Cosmos Rupture increases team Fusion DMG Bonus by 20% for 30s (confirmed exact, team-wide per the audit comment).',
  },
  {
    id: 'encore.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 35 }],
    note: 'Resonance Skill DMG Bonus +35% (confirmed exact, no specific scoping/timer given beyond the flat value) — kept passive.',
  },
  {
    id: 'encore.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Cosmos: Rampage' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 5, stacking: 'stacking', maxStacks: 5 }],
    note: 'Gains 1 stack of Lost Lamb per damage instance during Cosmos Rave, each +5% ATK for 10s, stacking up to 5 times (25% max) — per the two-source majority (fandom + wuthering.gg both say 5 stacks/25%, vs. Prydwen\'s outlier "6 stacks", flagged in the source audit rather than silently resolved). Modeled as per-stack 5% x5 cap, anchored to the Cosmos: Rampage cast as a representative damage-instance trigger.',
  },
];
