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

const SOURCE = 'Jinhsi';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const JINHSI_BLOCKS = [
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
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'refresh' }],
    note: 'Casting Resonance Liberation Purge of Light OR Resonance Skill Illuminous Epiphany grants the WHOLE NEARBY TEAM +20% Attribute DMG Bonus for 20s (team-wide, not Jinhsi-only). Modeled here off the Liberation cast; the Illuminous Epiphany cast is the SAME effect and would need a 2nd trigger entry once the windowed-cast state machine can actually distinguish which cast happened.',
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
    effects: [{ stat: 'skillDmg', value: 45 }],
    note: 'DMG Multiplier of Resonance Skill Illuminous Epiphany +45%. A SEPARATE +45% increase to the per-Incandescence-consumed conversion rate (compounding with S5\'s Incandescence-spend scaling) also exists but has no representable stat here — TODO: needs Phase 2 schema to hold both the flat skill-mult bonus and the scaling-rate bonus, same limitation as the flat table.',
  },
];
