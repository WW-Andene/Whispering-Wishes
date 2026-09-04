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

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Camellya';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const CAMELLYA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) — added 2026-09-01, this character's FIRST damage
  //    blocks. Two real ambiguities found and handled honestly rather than forced: ──
  {
    id: 'camellya.basic.vining-waltz-1',
    source: SOURCE,
    kind: 'damage', section: 'BasicATK',
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
    damage: { hits: parseSkillMultiplierHits('96.33%'), category: 'basicDmg' , basis: 'ATK' },
    note: "Fills the last Concerto Energy needed to unlock Ephemeral. Stage 1 of the Vining Waltz combo (96.33% at Lv.10) — fixed 2026-09-04 (Phase A audit): the kit text is explicit Vining Waltz is \"considered Basic Attack DMG\" (not Skill), confirmed by the fresh dump's own Damage Profile showing a genuine 0% Skill share against 67.1% Basic — was previously miscategorized skillDmg, silently rejecting real teammate Basic Attack DMG Bonus buffs on this hit.",
  },
  {
    id: 'camellya.skill.crimson-blossom',
    source: SOURCE,
    kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Crimson Blossom' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('113.62%×2'), category: 'basicDmg' , basis: 'ATK' },
    note: 'Basic-ATK-type Havoc DMG (considered Basic Attack DMG per its own kit text); enters Blossom Mode (mid-air castable), replacing Basic/Heavy/Dodge-Counter/Skill. Fixed 2026-09-04 (Phase A audit): was previously miscategorized skillDmg, matching the dump\'s 0% Skill / 67.1% Basic Damage Profile split.',
  },
  {
    id: 'camellya.skill.vining-waltz-combo',
    source: SOURCE,
    kind: 'damage', section: 'Skill',
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
    damage: { hits: parseSkillMultiplierHits('96.33% → 45.63%×2 → 21.95%×6 → 67.59%×3'), category: 'basicDmg' , basis: 'ATK' },
    note: 'Blossom Mode combo — every hit consumes Crimson Pistils at +150% Energy Regen. Fixed 2026-09-04 (Phase A audit): kit text is explicit the whole Vining Waltz/Blazing Waltz combo is "considered Basic Attack DMG" — was previously miscategorized skillDmg, matching the dump\'s 0% Skill / 67.1% Basic Damage Profile split.',
  },
  {
    id: 'camellya.forte.ephemeral',
    source: SOURCE,
    kind: 'damage', section: 'Forte',
    trigger: { type: 'resource-threshold', resource: 'Concerto Energy', threshold: 70, resourceStepOn: 'Forte:Ephemeral' },
    timing: { cooldown: 25 },
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('1262.45%'), category: 'basicDmg' , basis: 'ATK' },
    note: 'Once Concerto Energy is full and off its own 25s cooldown, replaces Skill. Costs 70 Concerto Energy, consumes all Crimson Buds, enters 15s Budding Mode. Fixed 2026-09-04 (Phase A audit): kit text is explicit Ephemeral deals Havoc DMG "considered Basic Attack DMG" — was previously miscategorized skillDmg, matching the dump\'s 0% Skill / 67.1% Basic Damage Profile split.',
  },
  {
    // Added 2026-09-03: S6 unlocks Forte Circuit: Perennial, a whole new skill dealing Havoc DMG
    // "equal to 100% of Ephemeral's DMG" (per the fresh source dump's own kit text) — considered
    // Basic Attack DMG. Same proportional-second-hit shape as Brant's chain.s6-secondary-blast, just
    // at 100% instead of a fraction: 1262.45% = camellya.forte.ephemeral's own summed %ATK. Anchored
    // to the same trigger as Ephemeral itself (the real "within 15s, Concerto full, off 25s internal
    // cooldown" gating is not separately tracked — same simplification already accepted for every
    // other windowed-cast-shaped mechanic in this schema); sN-suffix gates this to sequence 6 only.
    id: 'camellya.chain.s6-perennial',
    source: SOURCE,
    kind: 'damage', section: 'Chain',
    trigger: { type: 'resource-threshold', resource: 'Concerto Energy', threshold: 70, resourceStepOn: 'Forte:Ephemeral' },
    timing: { cooldown: 25 },
    target: { scope: 'self' },
    effects: [],
    damage: { hits: [{ atkPct: 1262.45 }], category: 'basicDmg', basis: 'ATK' },
    note: "S6 Forte Circuit: Perennial — deals Havoc DMG equal to 100% of Ephemeral's own DMG (considered Basic Attack DMG per its own kit text), recovers 50 Crimson Pistils, enters Budding Mode. Gated to sequence 6.",
  },
  {
    id: 'camellya.liberation.fervor-efflorescent',
    source: SOURCE,
    kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Fervor Efflorescent' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('1202.81%'), category: 'libDmg' , basis: 'ATK' },
  },
  {
    id: 'camellya.intro.everblooming',
    source: SOURCE,
    kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Everblooming' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // No `category` — Intro/Outro excluded from calcEngine.js's dmgFocus-routing buckets, same as
    // every other converted character's Intro/Outro damage block.
    damage: { hits: parseSkillMultiplierHits('198.81%'), basis: 'ATK' },
  },
  {
    // Added 2026-09-03: SKILL_MULTIPLIERS['Camellya'] was missing a 'Skill, Floral Ravage' row entirely
    // even though CHARACTER_ROTATIONS['Camellya'] already casts 'Skill:Floral Ravage' as its
    // Blossom-Mode-ending step — that step was silently resolving to 0 DMG. Row added (52.61%×5,
    // confirmed against a fresh the source dump), block added here to match.
    id: 'camellya.skill.floral-ravage',
    source: SOURCE,
    kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Floral Ravage' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('52.61%×5'), category: 'basicDmg' , basis: 'ATK' },
    note: 'Ends Blossom Mode. Considered Basic Attack DMG per kit text — fixed 2026-09-04 (Phase A audit): was previously miscategorized skillDmg (the original 2026-09-03 note that introduced this block mistakenly matched it to the Vining Waltz combo blocks\' then-also-wrong skillDmg category instead of the kit text\'s own override); confirmed against the dump\'s 0% Skill / 67.1% Basic Damage Profile split.',
  },
  {
    id: 'camellya.outro.twining-base',
    source: SOURCE,
    kind: 'damage', section: 'Outro',
    trigger: { type: 'cast', on: 'Outro:Twining' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // Only the UNCONDITIONAL base hit (329.24% ATK Havoc DMG per its own kit text). The additional
    // conditional +459.02% ATK (only if Forte Ephemeral was cast earlier this on-field rotation) is
    // a SEPARATE block — camellya.outro.twining-ephemeral-bonus, below, whose own 'requires-prior-cast'
    // trigger fires on this same real step only when the condition actually holds.
    damage: { hits: parseSkillMultiplierHits('329.24%'), basis: 'ATK' },
    note: 'Base 329.24% ATK Havoc DMG, unconditional.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'camellya.selfbuff.seedbed',
    source: SOURCE,
    kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15, source: 'self-kit' }],
    note: 'Seedbed: +15% Havoc DMG.',
  },
  {
    id: 'camellya.selfbuff.epiphyte',
    source: SOURCE,
    kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 15, source: 'self-kit' }],
    note: 'Epiphyte: +15% Basic DMG.',
  },

  // ── The cast-order dependency (Twining's conditional bonus DMG) ──
  {
    id: 'camellya.outro.twining-ephemeral-bonus',
    source: SOURCE,
    section: 'Outro',
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
    damage: { hits: parseSkillMultiplierHits('459.02%'), basis: 'ATK' },
    note: 'Outro Twining deals a base 329.24% ATK Havoc DMG unconditionally (see camellya.outro.twining-base), PLUS this additional 459.02% ATK ONLY if Forte Ephemeral was cast earlier in the same on-field rotation.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — re-verified 2026-08-31) ──
  {
    id: 'camellya.chain.s1-somewhere-no-one-travelled',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Intro:Everblooming' },
    timing: { duration: 18, cooldown: 25 },
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 28, source: 'self-kit' }],
    note: 'Casting Intro Skill Everblooming grants +28% Crit DMG for 18s, triggerable once every 25s. Also grants interruption immunity while casting Ephemeral — not modeled, no immunity field in this schema.',
  },
  {
    id: 'camellya.chain.s2-calling-upon-the-silent-rose',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    // Fixed 2026-09-04 (Phase A audit): was unscoped totalMult, over-crediting Camellya's ENTIRE kit
    // instead of just Ephemeral's own DMG Multiplier — the same Augusta-S3/Brant-S3/S6-shape
    // over-crediting bug. Scoped via scopedToBlockId.
    effects: [{ stat: 'totalMult', value: 120, scopedToBlockId: 'camellya.forte.ephemeral', source: 'self-kit' }],
    note: "Ephemeral's DMG Multiplier +120% — scoped to camellya.forte.ephemeral only.",
  },
  {
    // Fixed 2026-09-04 (Phase A audit): the S3 node carries TWO independent effects with different
    // real conditions per the kit text — "Fervor Efflorescent's DMG Multiplier +50%" (unconditional,
    // no Budding Mode gate at all) and "While in Budding Mode, ATK +58%" (genuinely conditional). The
    // previous single-block version wrapped BOTH under `condition: { requiresStance: 'Budding Mode' }`,
    // so the Fervor Efflorescent totalMult+50% incorrectly never applied at all in the real modeled
    // rotation (Liberation is cast BEFORE Ephemeral/Budding Mode there) — split into 2 blocks, and the
    // totalMult half is also now scoped via scopedToBlockId (it was unscoped before, which would have
    // over-credited her whole kit whenever it did apply).
    id: 'camellya.chain.s3-fervor-mult',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 50, scopedToBlockId: 'camellya.liberation.fervor-efflorescent', source: 'self-kit' }],
    note: "Fervor Efflorescent's DMG Multiplier +50%, unconditional (not gated on Budding Mode) — scoped to camellya.liberation.fervor-efflorescent only.",
  },
  {
    id: 'camellya.chain.s3-a-bud-adorned-by-thorns',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    condition: { requiresStance: 'Budding Mode' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 58, source: 'self-kit' }],
    note: 'ATK +58% while in Budding Mode only (atkPct is not category- or move-gated, so this correctly stays a general stat boost rather than needing scopedToBlockId).',
  },
  {
    id: 'camellya.chain.s4-roots-set-deep-in-eternity',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Intro:Everblooming' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'basicDmg', value: 25, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Casting Everblooming grants the WHOLE TEAM +25% Basic ATK DMG Bonus for 30s (team-wide, not Camellya-only).',
  },
  // S5 "Infinity Held in Your Palm" — split into two blocks (see file header). Same node, same
  // source comment, two skills.
  {
    id: 'camellya.chain.s5-everblooming',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    // Fixed 2026-09-04 (Phase A audit): was unscoped totalMult, over-crediting her whole kit instead
    // of only Everblooming — same over-crediting bug class as chain.s2 above.
    effects: [{ stat: 'totalMult', value: 303, scopedToBlockId: 'camellya.intro.everblooming', source: 'self-kit' }],
    note: "S5 Infinity Held in Your Palm, Everblooming half: Everblooming's DMG Multiplier +303% — scoped to camellya.intro.everblooming only.",
  },
  {
    id: 'camellya.chain.s5-twining',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    // Fixed 2026-09-04 (Phase A audit): was unscoped totalMult (same bug class as chain.s2/
    // s5-everblooming). Twining has TWO real damage blocks (the unconditional base hit and the
    // Ephemeral-conditional bonus hit) — both are "Twining's DMG Multiplier", so both get their own
    // scopedToBlockId entry, same multi-block-scoping pattern already used elsewhere (e.g. Mortefi's
    // chain.s1/s5 Marcato crit-dmg scoping).
    effects: [
      { stat: 'totalMult', value: 68, scopedToBlockId: 'camellya.outro.twining-base', source: 'self-kit' },
      { stat: 'totalMult', value: 68, scopedToBlockId: 'camellya.outro.twining-ephemeral-bonus', source: 'self-kit' },
    ],
    note: "S5 Infinity Held in Your Palm, Twining half: Twining's DMG Multiplier +68%, scoped to both of Twining's own damage blocks. Previously unrepresentable in the flat table — RESONANCE_CHAIN_DATA['Camellya'].s5 only had room for one totalMult value (303, the Everblooming half) and dropped this one entirely. The block model fixes this for free: same node, second block, no schema change needed.",
  },
  {
    id: 'camellya.chain.s6-bloom-for-you-thousand-times-over',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    condition: { requiresStance: 'Budding Mode' },
    timing: {},
    target: { scope: 'self' },
    // Fixed 2026-09-04 (Phase A audit): was unscoped totalMult — even gated by the Budding Mode
    // condition, an unscoped totalMult would still over-credit ANY block that happens to fire while
    // that condition holds (e.g. camellya.chain.s6-perennial's basicDmg hit, which is not part of
    // Sweet Dream), not just the real Sweet-Dream-affected moves. Scoped to the 2 real damage blocks
    // that actually fire during Budding Mode in the modeled rotation (Vining Waltz/Blazing Waltz combo,
    // Floral Ravage) via scopedToBlockId, same multi-block-scoping pattern as chain.s5-twining above.
    effects: [
      { stat: 'totalMult', value: 150, scopedToBlockId: 'camellya.skill.vining-waltz-combo', source: 'self-kit' },
      { stat: 'totalMult', value: 150, scopedToBlockId: 'camellya.skill.floral-ravage', source: 'self-kit' },
    ],
    note: "Sweet Dream's (Budding Mode's) DMG Multiplier +150% additional, scoped to Budding Mode's real affected moves. Also unlocks Forte Circuit: Perennial — modeled as a separate real damage block, camellya.chain.s6-perennial above.",
  },
];
