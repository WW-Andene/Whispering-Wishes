// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/camellya.blocks.js
// Camellya converted to TriggerBlocks — third schema extension, and the first
// character with TWO distinct new mechanic shapes at once:
//
// 1. Resonance Chain S5 "Infinity Held in Your Palm" carries TWO separate DMG
//    Multiplier bonuses on TWO DIFFERENT skills (Everblooming's +303%, Twining's
//    +68%) — the flat RESONANCE_CHAIN_DATA schema only has one totalMult slot per
//    node, so the real table (RESONANCE_CHAIN_DATA['Camellya'].s5) could only
//    carry one of the two values. NO SCHEMA CHANGE was needed to represent this in
//    TriggerBlocks: the block model is already many-blocks-per-mechanic, so this
//    just becomes two separate blocks sharing the S5 node's sourcing comment — see
//    camellya.chain.s5-everblooming / camellya.chain.s5-twining below. This is the
//    actual resolution to the "multi-skill-shared-node" question flagged in
//    PHASE2_PLAN.md's backlog: splitting nodes into multiple blocks, not adding a
//    multi-target-effect field.
//
// 2. Her Outro Twining deals bonus DMG (+459.02% ATK) ONLY if her Forte Ephemeral
//    was cast earlier in the SAME on-field rotation (CHARACTER_ROTATIONS['Camellya']'s
//    own Outro note: "a strict cast-order dependency ... not an always-on bonus").
//    This is a genuinely new shape: same-character (like Jinhsi's windowed-cast) but
//    NOT time-bounded (unlike Jinhsi — no 5s window, just "was it cast at all this
//    segment"). Added trigger.type: 'requires-prior-cast' + rotationSimulator.js's
//    recordCast/hasCastThisSegment/resetSegment to evaluate it for real.
//
// Sourced directly from characters.js's already-audited CHAR_BUFF_TABLE['Camellya'],
// RESONANCE_CHAIN_DATA['Camellya'] (2026-08-31 audit), and CHARACTER_ROTATIONS['Camellya'].
// No new numbers invented here.
//
// Verified for parity against the legacy flat-table path by
// __tests__/triggerEngine-camellya.test.js, and end-to-end (real evaluation, not
// hand-fed) by __tests__/rotationSimulator.test.js.
// ═══════════════════════════════════════════════════════════════════════════════

const SOURCE = 'Camellya';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const CAMELLYA_BLOCKS = [
  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'camellya.selfbuff.seedbed',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15 }],
    note: 'Seedbed: +15% Havoc DMG.',
  },
  {
    id: 'camellya.selfbuff.epiphyte',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 15 }],
    note: 'Epiphyte: +15% Basic DMG.',
  },

  // ── The cast-order dependency (Twining's conditional bonus DMG) ──
  {
    id: 'camellya.outro.twining-ephemeral-bonus',
    source: SOURCE,
    kind: 'utility',
    trigger: { type: 'requires-prior-cast', requiresPriorCast: 'cast:Forte:Ephemeral', checksAt: 'Outro:Twining' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: 'Outro Twining deals a base 329.24% ATK Havoc DMG unconditionally, PLUS an additional 459.02% ATK ONLY if Forte Ephemeral was cast earlier in the same on-field rotation. The base hit lives in SKILL_MULTIPLIERS as always-applying; this block represents just the conditional additional-DMG portion, which resolveTriggerBlocks() only applies when a rotation simulator (rotationSimulator.js) has confirmed Ephemeral was actually seen this segment — no fabricated damage number added here, since translating "459.02% ATK conditional bonus" into a flat stat effect isn\'t attempted; this block is presently a utility marker for the condition itself.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — re-verified 2026-08-31) ──
  {
    id: 'camellya.chain.s1-somewhere-no-one-travelled',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Everblooming' },
    timing: { duration: 18, cooldown: 25 },
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 28 }],
    note: 'Casting Intro Skill Everblooming grants +28% Crit DMG for 18s, triggerable once every 25s. Also grants interruption immunity while casting Ephemeral — not modeled, no immunity field in this schema.',
  },
  {
    id: 'camellya.chain.s2-calling-upon-the-silent-rose',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 120 }],
    note: "Ephemeral's DMG Multiplier +120%.",
  },
  {
    id: 'camellya.chain.s3-a-bud-adorned-by-thorns',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    condition: { requiresStance: 'Budding Mode' },
    timing: {},
    target: { scope: 'self' },
    effects: [
      { stat: 'totalMult', value: 50 },
      { stat: 'atkPct', value: 58 },
    ],
    note: "Fervor Efflorescent's DMG Multiplier +50%; ATK+58% while in Budding Mode only (conditional/stateful — the atkPct portion is kept flat here same as the source table, TODO: verify calc engine gates this on Budding Mode state rather than applying it unconditionally, same caveat the flat table already carries).",
  },
  {
    id: 'camellya.chain.s4-roots-set-deep-in-eternity',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Everblooming' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'basicDmg', value: 25, stacking: 'refresh' }],
    note: 'Casting Everblooming grants the WHOLE TEAM +25% Basic ATK DMG Bonus for 30s (team-wide, not Camellya-only).',
  },
  // S5 "Infinity Held in Your Palm" — split into two blocks (see file header). Same node, same
  // source comment, two skills.
  {
    id: 'camellya.chain.s5-everblooming',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 303 }],
    note: "S5 Infinity Held in Your Palm, Everblooming half: Everblooming's DMG Multiplier +303%.",
  },
  {
    id: 'camellya.chain.s5-twining',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 68 }],
    note: "S5 Infinity Held in Your Palm, Twining half: Twining's DMG Multiplier +68%. Previously unrepresentable — RESONANCE_CHAIN_DATA['Camellya'].s5 only had room for one totalMult value (303, the Everblooming half) and dropped this one entirely. The block model fixes this for free: same node, second block, no schema change needed.",
  },
  {
    id: 'camellya.chain.s6-bloom-for-you-thousand-times-over',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    condition: { requiresStance: 'Budding Mode' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 150 }],
    note: "Sweet Dream's (Budding Mode's) DMG Multiplier +150% additional. Also unlocks Forte Circuit: Perennial (a whole new skill, triggerable within 15s of Ephemeral when Concerto Energy is full/off cooldown) — not representable as a flat stat bonus, same TODO the flat table carries.",
  },
];
