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

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Camellya';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const CAMELLYA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) — added 2026-09-01, this character's FIRST damage
  //    blocks. Two real ambiguities found and handled honestly rather than forced: ──
  {
    id: 'camellya.basic.vining-waltz-1',
    source: SOURCE,
    kind: 'damage',
    // Real cross-reference ambiguity: CHARACTER_ROTATIONS tags this step type: 'Basic ATK' (which
    // BUTTON was pressed — Blossom Mode replaces Basic ATK with the Vining Waltz combo per Crimson
    // Blossom's own kit text), but SKILL_MULTIPLIERS only has a 'Skill, Vining Waltz 1-4' row (how
    // the damage TYPE is categorized) — no distinct 'Basic ATK, Vining Waltz' row exists.
    // 'Vining Waltz 1' names stage 1 of that same combo (96.33%, the first token in the row) — no new
    // number invented, just the specific stage this one-tap step represents.
    trigger: { type: 'cast', on: 'Basic ATK:Vining Waltz 1' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('96.33%'), category: 'skillDmg' },
    note: "Fills the last Concerto Energy needed to unlock Ephemeral. Stage 1 of the Vining Waltz combo (96.33% at Lv.10) — counted as Skill DMG per Blossom Mode's own kit text (Basic/Heavy/Dodge-Counter/Skill all replaced by this combo while active).",
  },
  {
    id: 'camellya.skill.crimson-blossom',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Crimson Blossom' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('113.62%×2'), category: 'skillDmg' },
    note: 'Basic-ATK-type Havoc DMG; enters Blossom Mode (mid-air castable), replacing Basic/Heavy/Dodge-Counter/Skill.',
  },
  {
    id: 'camellya.skill.vining-waltz-combo',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Vining Waltz 1-4 / Blazing Waltz' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // Real, documented limitation: this exact combined step label appears TWICE in her
    // CHARACTER_ROTATIONS (once in Blossom Mode, once again in Budding Mode after casting Ephemeral,
    // where the combo mechanically becomes Blazing Waltz instead — a DIFFERENT SKILL_MULTIPLIERS row,
    // '21.95%×19'). Because both occurrences share the identical {type, skill} label, this one block
    // fires identically both times — it cannot currently distinguish "1st cast (Vining Waltz)" from
    // "2nd cast (Blazing Waltz, Budding Mode)" the way e.g. Yinlin's Lightning Execution split needed
    // a genuinely distinct label to separate. Uses the Vining Waltz values (the first-named move in
    // the combined label) for BOTH occurrences rather than fabricate a blended number — the 2nd
    // occurrence's real Blazing Waltz damage is undercounted as a result. A future fix would need
    // CHARACTER_ROTATIONS itself to distinguish the two steps with different skill strings (the same
    // fix category as the "zero-damage rotation-step" class PHASE2_PLAN.md already tracks), not
    // something this schema alone can solve.
    damage: { hits: parseSkillMultiplierHits('96.33% → 45.63%×2 → 21.95%×6 → 67.59%×3'), category: 'skillDmg' },
    note: 'Blossom Mode combo — every hit consumes Crimson Pistils at +150% Energy Regen.',
  },
  {
    id: 'camellya.forte.ephemeral',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'resource-threshold', resource: 'Concerto Energy', threshold: 70, resourceStepOn: 'Forte:Ephemeral' },
    timing: { cooldown: 25 },
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('1262.45%'), category: 'skillDmg' },
    note: 'Once Concerto Energy is full and off its own 25s cooldown, replaces Skill. Costs 70 Concerto Energy, consumes all Crimson Buds, enters 15s Budding Mode.',
  },
  {
    id: 'camellya.liberation.fervor-efflorescent',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Fervor Efflorescent' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('1202.81%'), category: 'libDmg' },
  },
  {
    id: 'camellya.intro.everblooming',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Everblooming' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // No `category` — Intro/Outro excluded from calcEngine.js's dmgFocus-routing buckets, same as
    // every other converted character's Intro/Outro damage block.
    damage: { hits: parseSkillMultiplierHits('198.81%') },
  },
  {
    id: 'camellya.outro.twining-base',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Outro:Twining' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // Only the UNCONDITIONAL base hit (329.24% ATK Havoc DMG per its own kit text). The additional
    // conditional +459.02% ATK (only if Forte Ephemeral was cast earlier this on-field rotation) is
    // a SEPARATE block — camellya.outro.twining-ephemeral-bonus, below, whose own 'requires-prior-cast'
    // trigger fires on this same real step only when the condition actually holds.
    damage: { hits: parseSkillMultiplierHits('329.24%') },
    note: 'Base 329.24% ATK Havoc DMG, unconditional.',
  },

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
    // Changed from 'utility' to 'damage' 2026-09-01: now that resolveHitComposedDps.js/
    // resolveHitComposedTeamDps.js exist, the conditional +459.02% ATK bonus can actually be
    // composed as a real extra hit instead of staying a bare condition marker. This block's own
    // trigger (checksAt: 'Outro:Twining') already fires on the SAME step as
    // camellya.outro.twining-base's cast — deriveStepsFromRotation() tags that one step with BOTH
    // the cast key and (when the condition holds) the requires-prior-cast key, so both blocks
    // resolve together automatically; no new wiring was needed beyond adding `damage` here.
    kind: 'damage',
    trigger: { type: 'requires-prior-cast', requiresPriorCast: 'cast:Forte:Ephemeral', checksAt: 'Outro:Twining' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('459.02%') },
    note: 'Outro Twining deals a base 329.24% ATK Havoc DMG unconditionally (see camellya.outro.twining-base), PLUS this additional 459.02% ATK ONLY if Forte Ephemeral was cast earlier in the same on-field rotation.',
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
