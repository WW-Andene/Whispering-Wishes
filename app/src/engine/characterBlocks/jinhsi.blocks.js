// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/jinhsi.blocks.js
// Jinhsi converted to TriggerBlocks — second schema extension. Her burst is a
// strict cast-order chain with TWO separate 5-second forfeit windows (see
// CHARACTER_DATA['Jinhsi'].desc and CHARACTER_ROTATIONS['Jinhsi']'s own note: "Every
// step below is cast-order-gated by a 5s window — miss the window and the
// alternate (empowered) cast is forfeited for that step"):
//   1. After landing Basic ATK Stage 4 OR casting Intro Loong's Halo (only while not
//      already in Incarnation), a 5s window opens for Overflowing Radiance (enters
//      Incarnation) — miss it and she casts a normal Trailing Lights of Eons instead.
//   2. After landing Incarnation-Basic Attack Stage 4 (Ordination Glow), a 5s window
//      opens for Illuminous Epiphany (the Incandescence-spending nuke) — miss it and
//      Ordination Glow (and the chance to spend Incandescence) is lost.
//
// Unlike Augusta's 'partner-outro-return' (cross-character), both windows here
// belong entirely to Jinhsi's OWN rotation history — but still require real
// elapsed-time tracking to evaluate ("was the 2nd cast within 5s of the 1st"),
// which is exactly PHASE2_PLAN.md's still-open design question 2. Added
// 'windowed-cast' to the schema for this shape; same limitation as
// 'partner-outro-return' — it names the window, a future rotation simulator has to
// evaluate it.
//
// Sourced directly from characters.js's already-audited CHAR_BUFF_TABLE['Jinhsi'],
// RESONANCE_CHAIN_DATA['Jinhsi'] (2026-08-31 audit), and CHARACTER_ROTATIONS['Jinhsi'].
// No new numbers invented here.
//
// Verified for parity against the legacy flat-table path by
// __tests__/triggerEngine-jinhsi.test.js.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Jinhsi';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const JINHSI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) — added 2026-09-01, this character's FIRST damage
  //    blocks. Several rows combine multiple sub-modes: the Skill row is 'Trailing Lights of Eons →
  //    Overflowing Radiance' (only the Overflowing Radiance half matches a real CHARACTER_ROTATIONS
  //    step — her canonical rotation always lands the windowed empowered cast, never the base
  //    Trailing Lights); the Forte row combines the Incarnation-Basic-ATK combo AND Illuminous
  //    Epiphany's THREE conditional sub-modes (Basic/Crescent Divinity/Solar Flare-Stella Glamor) in
  //    one string — only Solar Flare/Stella Glamor matches, per her own rotation note ("consumes up
  //    to 50 Incandescence... for a scaling Stella Glamor nuke"), the same figure
  //    jinhsi.chain.s2-chronofrost-repose's own note already references. No separate Intro:Loong's
  //    Halo block — no CHARACTER_ROTATIONS step in her canonical sequence casts it as a literal step
  //    (it's referenced only via windowed-cast's opensOn, a different concern), same "only what a
  //    real step needs" rule as Shorekeeper/Augusta. ──
  {
    id: 'jinhsi.basic.slash-of-breaking-dawn',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Slash of Breaking Dawn Stage 1-4' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('66.47% → 38.99%+19.50%×3 → 10.65%×7+31.94% → 63.09%+94.63%'), category: 'basicDmg' },
    note: 'Tap Basic Attack 4 times for the full opening combo — Stage 4 opens a 5s window for Overflowing Radiance.',
  },
  {
    id: 'jinhsi.skill.overflowing-radiance',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Overflowing Radiance' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('9.87%×4+29.59%×4+39.45%'), category: 'skillDmg' },
    note: 'Press Skill within 5s of Basic ATK Stage 4 — sends her into Incarnation for 10s.',
  },
  {
    id: 'jinhsi.liberation.purge-of-light',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Purge of Light' },
    timing: { cooldown: 24 },
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('499.81%+1166.22%'), category: 'libDmg' },
    note: 'Huge AoE nuke, 24s cooldown, can be cast at any point in the rotation.',
  },
  {
    id: 'jinhsi.forte.incarnation-basic-attack',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Incarnation - Basic Attack Stage 1-4' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // "counted as Resonance Skill DMG" per this cast's own CHARACTER_ROTATIONS note.
    damage: { hits: parseSkillMultiplierHits('88.62%→77.97%+25.99%×2→99.44%+66.30%→18.67%×6+74.67%'), category: 'skillDmg' },
    note: 'While in Incarnation (10s), Basic ATK is replaced by this 4-stage combo — counted as Resonance Skill DMG. Landing Stage 4 ends Incarnation and opens a 5s window for Illuminous Epiphany.',
  },
  {
    id: 'jinhsi.skill.illuminous-epiphany',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Illuminous Epiphany' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // The 'Solar Flare/Stella Glamor' sub-mode specifically — per this cast's own rotation note
    // ("consumes up to 50 Incandescence... for a scaling Stella Glamor nuke"), not the row's other two
    // conditional sub-modes (plain 'Basic' or 'Crescent Divinity'), which don't match her canonical
    // full-Incandescence-spend rotation.
    damage: { hits: parseSkillMultiplierHits('19.89%×6+347.92%'), category: 'skillDmg' },
    note: 'Press Skill within 5s of Incarnation-Basic Attack Stage 4 landing — consumes up to 50 Incandescence for a scaling Stella Glamor nuke.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'jinhsi.selfbuff.radiant-surge',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 20 }],
    note: 'Inherent Skill Radiant Surge: Spectro DMG Bonus +20% (always active).',
  },

  // ── The two cast-order forfeit windows (this conversion's whole point) ──
  {
    id: 'jinhsi.window.overflowing-radiance',
    source: SOURCE,
    kind: 'utility',
    trigger: {
      type: 'windowed-cast',
      opensOn: ['cast:Basic ATK:Slash of Breaking Dawn Stage 1-4', 'cast:Intro:Loong\'s Halo'],
      windowSeconds: 5,
      attemptOn: 'Skill:Overflowing Radiance',
    },
    condition: { requiresStance: undefined }, // "only while NOT already in Incarnation"
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: 'Window 1 of 2: after landing Basic ATK Stage 4 OR casting Intro Loong\'s Halo (only while not already in Incarnation), a 5s window opens for the Skill button to become Overflowing Radiance — casting it deals Spectro DMG and enters Incarnation for 10s. Missing the window forfeits the alternate cast for a normal Trailing Lights of Eons instead. No direct DMG stat here — the state transition (entering Incarnation) is what this block represents; Overflowing Radiance\'s own hit damage lives in SKILL_MULTIPLIERS.',
  },
  {
    id: 'jinhsi.window.illuminous-epiphany',
    source: SOURCE,
    kind: 'utility',
    trigger: {
      type: 'windowed-cast',
      opensOn: ['cast:Forte:Incarnation - Basic Attack Stage 1-4'],
      windowSeconds: 5,
      attemptOn: 'Skill:Illuminous Epiphany',
    },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: 'Window 2 of 2: landing Stage 4 of Incarnation-Basic Attack ends Incarnation and opens Ordination Glow — a 5s window in which Resonance Skill becomes Illuminous Epiphany. Missing it loses Ordination Glow entirely, along with the chance to spend Incandescence that rotation. Also grants Unison (once per 25s) on cast: while held, swapping off-field auto-triggers a free Outro/Intro pair instead of requiring full Concerto Energy — not modeled here (resource-economy utility, no DPS stat).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — re-verified 2026-08-31) ──
  {
    id: 'jinhsi.chain.s1-abyssal-ascension',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 40 }],
    note: 'Each of her 4 Incarnation-Basic Attack stages grants a stack (max 4) — hitting with Illuminous Epiphany consumes them, +20% DMG per stack, up to +80% at 4. Modeled as a flat skillDmg:40 rotation-average since real stack count is execution-dependent.',
  },
  {
    id: 'jinhsi.chain.s2-chronofrost-repose',
    source: SOURCE,
    kind: 'utility',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 5 }],
    note: 'Restores 50 Incandescence after 4s+ out of combat, 1 trigger/4s — pure pre-fight/downtime utility, no in-combat DPS number exists for this; totalMult:5 kept as the flat table\'s own minimal non-zero placeholder.',
  },
  {
    id: 'jinhsi.chain.s3-celestial-incarnate',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Loong\'s Halo' },
    timing: { duration: 20 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 50, stacking: 'stacking' }],
    note: "Casting Intro Skill Loong's Halo grants 1 stack of Immortal's Descendancy (+25% ATK/stack, max 2 stacks, 20s) = up to +50% ATK at 2 stacks.",
  },
  {
    id: 'jinhsi.chain.s4-benevolent-grace',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Purge of Light' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20, stacking: 'refresh' }],
    // Fixed 2026-09-04: was `stat: 'elemDmg'` + `condition: { element: 'spectro' }` — this "Attribute
    // DMG Bonus" wording is the generic universal-DMG shape (each teammate buffed on THEIR OWN element),
    // same as Galbrena/Phrolova/Lucy's identically-worded S4 nodes (allDmg, no element condition), not a
    // Spectro-only buff. The old code would have silently zeroed this out for any non-Spectro teammate.
    note: 'Casting Resonance Liberation Purge of Light OR Resonance Skill Illuminous Epiphany grants the WHOLE NEARBY TEAM +20% Attribute DMG Bonus for 20s (team-wide, not Jinhsi-only, and not restricted to Spectro teammates). Modeled here off the Liberation cast; the Illuminous Epiphany cast is the SAME effect and would need a 2nd trigger entry once the windowed-cast state machine can actually distinguish which cast happened.',
  },
  {
    id: 'jinhsi.chain.s5-frostfire-illumination',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 120 }],
    note: 'DMG Multiplier of Resonance Liberation Purge of Light +120%.',
  },
  {
    id: 'jinhsi.chain.s6-thawing-triumph',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [
      { stat: 'skillDmg', value: 45 },
      // Fixed 2026-09-03: the SEPARATE +45% conversion-rate bonus (compounding with S5's
      // Incandescence-spend scaling) has no dedicated "per-resource-consumed rate" stat in this
      // engine, but since jinhsi.skill.illuminous-epiphany is the ONLY skillDmg-categorized block
      // this rate bonus could possibly touch, a second scopedToBlockId'd +45% on that one block
      // reproduces the real compounding total (+90% to Illuminous Epiphany specifically, +45% to
      // any other skillDmg move) without fabricating a new mechanic — the existing scoping tool
      // already built for exactly this "named-move-specific bonus" shape (see Aemeath's Heavy ATK
      // Crit DMG scoping in triggerBlocks.schema.js's own Effect.scopedToBlockId doc).
      { stat: 'skillDmg', value: 45, scopedToBlockId: 'jinhsi.skill.illuminous-epiphany' },
    ],
    note: "DMG Multiplier of Resonance Skill Illuminous Epiphany +45%, PLUS a separate +45% conversion-rate bonus that only ever affects that same move — modeled as a second skillDmg effect scoped to jinhsi.skill.illuminous-epiphany, giving it +90% total while every other skillDmg move gets the unscoped +45% alone.",
  },
];
