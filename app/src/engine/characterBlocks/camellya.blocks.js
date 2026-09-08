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
//
// Cooldown/concertoEnergyGain added 2026-09-06 (completeness pass, same "bring every character up
// to Aalto's reference standard" direction as the prior passes) — sourced from Data dump/Camellya/
// Camellya.md's own Cooldown/Concerto Regen rows (Crimson Blossom, Floral Ravage, Fervor
// Efflorescent, Everblooming). Ephemeral already carried its real cooldown (25s) before this pass.
// Vining Waltz/Blazing Waltz's own Concerto contribution is NOT a flat per-cast number — the dump's
// own Forte Circuit text describes a variable-rate conversion ("every 10 Crimson Pistils consumed
// recovers 4 Concerto Energy"), a genuinely different mechanic shape (gauge-to-gauge conversion,
// not a fixed per-cast gain) this schema's `concertoEnergyGain` field isn't built to represent —
// left unmodeled rather than fabricating a flat number the source doesn't give. Confirmed safe to
// add `concertoEnergyGain` anywhere in this file despite Ephemeral/S6-Perennial's own
// `resource-threshold` trigger sharing the resource name 'Concerto Energy': `concertoEnergyGain` is
// resolved by a completely separate mechanism (resolveConcertoEnergy.js) that never feeds
// rotationSimulator.js's `resourceGain`/`resourceAtLeast` gauge simulation — the two systems don't
// interact, unlike the real collision found and fixed in Buling's Trigram gauge (see that file's own
// note) where `resourceGain` and `resourceStepOn` DID target the same simulated resource.
//
// Completeness pass 2026-09-07 (next character after Calcharo, alphabetically, same "bring every
// character up to Aalto's reference standard" direction): Minor Fortes (Crit DMG+16%, ATK%+12%,
// Data dump/Camellya/Camellya.md line 125) had no block at all, same class of gap as Aalto's/
// Aemeath's/Augusta's/Calcharo's own missing Minor Fortes. Also added her whole base (non-Blossom-
// Mode) kit — Basic ATK Thorns 1-5, Heavy ATK Standard, Mid-air Plunging Attack, Dodge Counter
// Standard — plus Blossom Mode's Jump/Dodge-Counter replacements Vining Ronde/Atonement: all 6 are
// real moves with their own SKILL_MULTIPLIERS['Camellya'] rows, previously had no block anywhere in
// this file, and none appear in CHARACTER_ROTATIONS['Camellya'] (her real opener casts Intro
// straight into Crimson Blossom/Blossom Mode, never touching base kit) — present and sourced but
// inert, same "documented gap" status as Aalto's/Augusta's own inert blocks. Base Heavy ATK
// (in-game name "Pruning") is categorized basicDmg, not heavyDmg: her Inherent Skill Seedbed's own
// text is explicit ("Heavy Attack Pruning's DMG is now considered Basic Attack DMG"), and this
// file's own camellya.selfbuff.seedbed block already models Seedbed as an unconditional passive
// (Inherent Skills are always-unlocked in this codebase's convention, same as every other
// character's own Minor Fortes/Inherent Skill blocks) — so the category override is live, not
// conditional on anything this rotation doesn't already satisfy.
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
    // cooldown added 2026-09-06 (completeness pass): Data dump/Camellya/Camellya.md's own
    // "Cooldown: 4s" row for Resonance Skill Valse of Bloom and Blight (Crimson Blossom's own cast,
    // the entry point of that ability slot).
    timing: { cooldown: 4 },
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('113.62%×2'), category: 'basicDmg' , basis: 'ATK' },
    note: 'Basic-ATK-type Havoc DMG (considered Basic Attack DMG per its own kit text); enters Blossom Mode (mid-air castable), replacing Basic/Heavy/Dodge-Counter/Skill. Fixed 2026-09-04 (Phase A audit): was previously miscategorized skillDmg, matching the dump\'s 0% Skill / 67.1% Basic Damage Profile split.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Camellya/Camellya.md's own
    // "Crimson Blossom Concerto Regen: 7" row.
    concertoEnergyGain: 7,
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
    // cooldown added 2026-09-06 (completeness pass): Data dump/Camellya/Camellya.md's own
    // "Cooldown: 25s" row for Fervor Efflorescent.
    timing: { cooldown: 25 },
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('1202.81%'), category: 'libDmg' , basis: 'ATK' },
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Camellya/Camellya.md's own
    // "Concerto Regen: 20" row for the same Liberation. Its "Resonance Energy Cost: 125" row is a
    // Liberation-gauge cost, not a gain — no matching schema field, not modeled, same treatment as
    // every other character's own Liberation resource cost.
    concertoEnergyGain: 20,
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
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Camellya/Camellya.md's own
    // "Concerto Regen: 10" row for Intro Skill Everblooming.
    concertoEnergyGain: 10,
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
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Camellya/Camellya.md's own
    // "Floral Ravage Concerto Regen: 7" row. No cooldown added: the dump's own "Cooldown: 4s" row
    // sits in the same Resonance Skill section as Crimson Blossom's (the ability slot's entry
    // point, already carrying that cooldown on camellya.skill.crimson-blossom above) — whether that
    // one shared-slot cooldown ALSO independently gates this in-Blossom-Mode exit cast, or whether
    // Floral Ravage (a mode-transition move, not a fresh Skill-button press from neutral) bypasses
    // it, isn't stated explicitly enough to apply here without guessing; left off rather than assume.
    concertoEnergyGain: 7,
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

  // Added 2026-09-07 (completeness pass): her base (non-Blossom-Mode) kit, previously entirely
  // absent — real, sourced SKILL_MULTIPLIERS['Camellya'] rows, none in CHARACTER_ROTATIONS (see file
  // header). Category basicDmg per Seedbed's own "Pruning's DMG is now considered Basic Attack DMG"
  // (see file header note on why that override applies unconditionally here).
  {
    id: 'camellya.basic.thorns',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Thorns 1-5' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('62.53% → 46.48%×2 → 50.70%×3 → 24.70%×20 → 48.17%×4'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base 5-stage Basic ATK combo (in-game name "Burgeoning"). Not in CHARACTER_ROTATIONS — real move, but her real opener casts Intro straight into Crimson Blossom/Blossom Mode, never touching base kit.',
  },
  {
    id: 'camellya.heavy.pruning',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('88.14%×3'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base Heavy Attack (in-game name "Pruning"). Categorized basicDmg per Inherent Skill Seedbed\'s own text: "Heavy Attack Pruning\'s DMG is now considered Basic Attack DMG" (see file header). Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'camellya.midair.plunging-attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Plunging Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.61%×2'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base Mid-air Attack. No explicit "considered X DMG" override text — kept basicDmg per this schema\'s established convention for mid-air attacks with no override (same precedent as Aalto\'s/Lupa\'s own mid-air blocks). Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'camellya.basic.dodge-counter',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('99.40%×3'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base Dodge Counter — the dump\'s own text calls it a Basic Attack variant explicitly ("Basic Attack after successful Dodge, Havoc DMG"), hence basicDmg. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'camellya.basic.vining-ronde',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Vining Ronde' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('52.95%×3'), category: 'basicDmg', basis: 'ATK' },
    note: 'Blossom Mode\'s Jump replacement, considered Basic Attack DMG per its own kit text; ends Blossom Mode on cast. Not in CHARACTER_ROTATIONS — real move, but her real rotation always exits Blossom Mode via Floral Ravage instead.',
  },
  {
    id: 'camellya.basic.atonement',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Atonement' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('113.33%×2'), category: 'basicDmg', basis: 'ATK' },
    note: 'Blossom Mode\'s Dodge Counter replacement, considered Basic Attack DMG per its own kit text. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
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
  // Added 2026-09-07 (completeness pass): "Minor Fortes: Crit DMG+16%, ATK%+12%" — a permanent,
  // always-on passive stat bonus unlocked via Forte-tree ascension, entirely separate from Seedbed/
  // Epiphyte. Previously had no block anywhere in this file, same class of gap as Aalto's/Aemeath's/
  // Augusta's/Calcharo's own missing Minor Fortes.
  {
    id: 'camellya.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critDmg', value: 16, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Crit DMG+16%, ATK%+12% (Data dump/Camellya/Camellya.md line 125). Unconditional, always active.',
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
    // Fixed 2026-09-08 (full re-audit): `condition.requiresStance` is PURELY DESCRIPTIVE in this
    // engine — triggerEngine.js's own `conditionHolds()` comment says so explicitly ("no state
    // machine tracks which stance is active"), and only the SEPARATE `filterExclusiveModeBlocks`
    // mutual-exclusion pre-filter (for genuinely rival "Mode A vs Mode B" block pairs) ever acts on
    // it. This block had no rival stance-tagged sibling to be excluded against, so it was silently
    // UNCONDITIONAL — the real "while in Budding Mode only" gate never applied, inflating ATK by +58%
    // for her ENTIRE rotation instead of just the ~15s Budding Mode window. (A prior session already
    // suspected this — see characters.js's own RESONANCE_CHAIN_DATA['Camellya'] comment: "TODO: verify
    // calc engine gates this on Budding Mode state rather than applying it unconditionally" — now
    // confirmed and fixed.) Re-anchored to the same real trigger that opens the 15s Budding Mode
    // window (the Ephemeral cast, per CHARACTER_ROTATIONS['Camellya']'s own `duration: 15` on that
    // step), the same resource-threshold pattern camellya.forte.ephemeral itself already uses.
    id: 'camellya.chain.s3-a-bud-adorned-by-thorns',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'resource-threshold', resource: 'Concerto Energy', threshold: 70, resourceStepOn: 'Forte:Ephemeral' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 58, source: 'self-kit' }],
    note: 'ATK +58% while in Budding Mode only (atkPct is not category- or move-gated, so this correctly stays a general stat boost rather than needing scopedToBlockId) — now a real 15s window anchored to the Ephemeral cast that opens Budding Mode, see fix comment above.',
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
    // Fixed 2026-09-08 (full re-audit): SAME dead-`requiresStance` bug as chain.s3-a-bud above (see
    // its own fix comment for the full trace through triggerEngine.js's `conditionHolds()`) — this was
    // ALSO silently unconditional, meaning the +150% totalMult applied to BOTH real occurrences of
    // camellya.skill.vining-waltz-combo (the block's own comment already documents that this exact
    // block id fires TWICE — once BEFORE Ephemeral/outside Budding Mode, once after/inside it), not
    // just the real in-Budding-Mode one. A genuine S6 overstatement bug: her 1st Vining Waltz combo
    // (pre-Ephemeral) was getting Sweet Dream's bonus it should never see. Re-anchored to the same
    // Ephemeral-cast resource-threshold trigger as chain.s3-a-bud, with the real 15s duration — a real
    // buff window now correctly starts AFTER Ephemeral, so the 1st (pre-Ephemeral) vining-waltz-combo
    // hit falls outside the window and the 2nd (post-Ephemeral) one falls inside it.
    id: 'camellya.chain.s6-bloom-for-you-thousand-times-over',
    source: SOURCE,
    kind: 'buff', section: 'Chain',
    trigger: { type: 'resource-threshold', resource: 'Concerto Energy', threshold: 70, resourceStepOn: 'Forte:Ephemeral' },
    timing: { duration: 15 },
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
    note: "Sweet Dream's (Budding Mode's) DMG Multiplier +150% additional, scoped to Budding Mode's real affected moves, now inside a real 15s post-Ephemeral window (see fix comment above) instead of an unenforced condition. Also unlocks Forte Circuit: Perennial — modeled as a separate real damage block, camellya.chain.s6-perennial above.",
  },

  // Added 2026-09-08 (full re-audit): the BASE (non-Sequence-gated) Sweet Dream mechanic itself —
  // "+50% DMG Multiplier to Normal Attack/Vining Waltz/Blazing Waltz/Vining Ronde/Atonement/Crimson
  // Blossom/Floral Ravage" while in Budding Mode, per Data dump/Camellya/Camellya.md's own Forte
  // Circuit text — had NO block anywhere in this file at ANY sequence level, despite being extensively
  // documented in prose (CHARACTER_DATA['Camellya'].desc, CHARACTER_ROTATIONS['Camellya']'s own step
  // notes both describe it in detail) and despite covering her single biggest damage share (67.1%
  // Basic ATK per the dump's own Damage Profile — the 2nd Vining Waltz/Blazing Waltz combo and Floral
  // Ravage, both fired during Budding Mode in the modeled rotation, were missing this multiplier
  // entirely at every sequence, not just below S6). The real bonus scales with Crimson Buds consumed
  // on the Ephemeral cast (+5%/bud, up to +50% more at 10 stacks — a resource-dependent number this
  // schema can't precisely derive without simulating the full Pistil/Bud economy), so this uses the
  // guaranteed, unconditional floor (+50%, true regardless of bud count) rather than fabricating a
  // specific bud count — same "use the sourced guaranteed minimum, not an assumed maximum" principle
  // already applied elsewhere in this codebase. Same real 15s post-Ephemeral window and scoping as
  // chain.s6-bloom above (the S6 node's own +150% stacks additively on top of this base +50%).
  {
    id: 'camellya.selfbuff.sweet-dream',
    source: SOURCE,
    kind: 'buff', section: 'Buff',
    trigger: { type: 'resource-threshold', resource: 'Concerto Energy', threshold: 70, resourceStepOn: 'Forte:Ephemeral' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [
      { stat: 'totalMult', value: 50, scopedToBlockId: 'camellya.skill.vining-waltz-combo', source: 'self-kit' },
      { stat: 'totalMult', value: 50, scopedToBlockId: 'camellya.skill.floral-ravage', source: 'self-kit' },
    ],
    note: 'Base Forte Circuit "Sweet Dream": Budding Mode grants a guaranteed +50% DMG Multiplier to Normal Attack/Vining Waltz/Blazing Waltz/Vining Ronde/Atonement/Crimson Blossom/Floral Ravage (up to +100% total with Crimson Buds consumed on Ephemeral cast — the variable +0-50% bud bonus is not modeled, no sourced way to derive the real bud count without a full Pistil-economy simulation this schema does not have). Scoped to the 2 real damage blocks that fire during Budding Mode in the modeled rotation.',
  },
];
