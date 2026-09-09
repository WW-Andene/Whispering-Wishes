// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/hiyuki.blocks.js
// Hiyuki converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Hiyuki'], RESONANCE_CHAIN_DATA['Hiyuki'], SKILL_MULTIPLIERS['Hiyuki'],
// CHARACTER_ROTATIONS['Hiyuki'], and Data dump/Hiyuki/Hiyuki.md directly (cited inline per
// finding below). No new numbers invented anywhere in this file.
//
// Also see: engine/characterBlocks/hiyuki.kitRules.js (her real decision-layer state machine —
// Dedication/Frostharden Iai/Whiteout Bitterfrost/Snowforged Blade — registered in
// engine/resolver/decision/kitRulesRegistry.js and actually driving her real DPS calculation via
// calcTeamStats.js, not just this static block file).
//
// Foreclaiming: Blade Liberation's per-Snowforged-Blade DMG scaling (up to +795.24% across 3
// stacks) IS modeled (2026-09-07) — see that block's own comment: it reads the real
// `snowforgedBladeConsumed` field hiyuki.kitRules.js's blade-liberation rule attaches to that
// specific cast (a "leveled action" via `resourceLevel`, checkable for a hypothetical level via
// decisionEngine.js's validateSequence()), not a fabricated max-stacks assumption.
//
// Minor Fortes (Crit Rate+8%/ATK%+12%, dump line 118-119) and Inherent Skill Ephemeral Realm
// (line 100, pure resource-restore utility, zero DPS component) added 2026-09-07.
//
// Glacio Bite (2026-09-07 — her single largest itemized real damage bucket after aggregate
// Liberation, 30.3%/438,900 dmg per the dump's own Damage Profile, line 219/221): modeled as ONE
// real damage block, hiyuki.procdmg.glacio-bite, `trigger:{type:'ally-action', action:'glacio-
// chafe'}` — fires off the shared 'glacio-chafe' appliesTags marker any team member's own
// Chafe-inflicting block can carry (her own 7 blocks here, plus Lucilla's/Suisui's own tagged
// blocks in their files), NOT via DOT_MECHANICS' rotation-aggregate Level-Mult tick formulas
// (Frazzle/Erosion/Fusion Burst/Electro Flare — those are defense-independent flat-Level-Mult
// status ticks; Glacio Bite is an ATK%-scaling instance per Fine Snow's own "+102% Glacio Bite DMG
// instance" text, dump line 99, needing the real crit/dmgBonus/defMult/resMult per-hit chain a
// plain damage block already gets). This single ally-action block IS the "extends to any
// teammate's Chafe application" mechanic dump line 116 (chain.s6) describes — modeled
// unconditionally (assumed always at the 2-Snow-Rust-stacks threshold, same ceiling-not-ramp
// convention as the rest of this file), not gated on a live Snow Rust count this engine doesn't
// track numerically.
//
// Fine Snow's own Glacio Bite DMG Amp (+30%/+30% at 1/3 Snow Rust stacks, dump line 99) and
// chain.s3's own Glacio Bite proc Multiplier (+488% at 2 Snow Rust stacks, dump line 113) are
// folded directly into hiyuki.procdmg.glacio-bite's own %ATK value (102% x [1 + 0.60 + 4.88] =
// 660.96%, summed as one %DMG-Bonus-shaped layer per this engine's own calcDmgBonus() convention —
// a documented assumption, not a sourced combination rule) rather than as separate buff effects,
// since neither bonus has anywhere else to apply (Glacio Bite carries no damage.category — the
// dump's own Damage Profile text says it "is a distinct proc/status damage type... not tied to a
// specific button," so none of the standard skillDmg/libDmg/basicDmg categories should reach it).
// The old hiyuki.selfbuff.fine-snow-glacio-bite (elemDmg:60) this replaced was a real correctness
// bug: elemDmg is Glacio DMG Bonus, which the dump's own text says is "a distinct multiplier from
// base Glacio DMG Bonus" — that block was broadly buffing Hiyuki's ENTIRE kit by +60% Glacio DMG
// instead of the Glacio Bite instances it was meant for.
//
// Full-kit audit, 2026-09-07 (direct request: "take time and track everything") — 3 real
// over-crediting bugs found and fixed in the Resonance Chain nodes (chain.s1/s3/s6, see each
// block's own comment): each was a bare, unscoped stat effect that the dump's own text actually
// names 1-8 SPECIFIC moves for, silently also inflating every OTHER block sharing that same
// category (or, for chain.s6's critDmg, her entire kit — critDmg isn't category-gated at all).
// Fixing this required `scopedToBlockId` to accept an array (previously one block id only) — see
// triggerEngine.js's own blockIdMatches() doc.
//
// chain.s6's own +25% Glacio Bite DMG TAKEN debuff at 3 Snow Rust stacks was FIXED in a later pass
// (hiyuki.chain.s6-glacio-bite-dmg-taken) — the "no matching stat key" claim above was wrong: an
// enemy-side amplify debuff scoped via scopedToBlockId (kind:'debuff', target:'all-enemies'),
// already proven working for Qingxiao's Mindlock, covers it exactly, scoped onto
// hiyuki.procdmg.glacio-bite's own dedicated proc block.
//
// Still NOT modeled (real, sourced, genuinely out of this engine's current reach): Blade
// Liberation's tap-vs-hold input distinction (dump line 67) — not separately modeled since a
// DPS-optimal player always holds to consume whatever's banked, same "assume optimal execution"
// convention used everywhere else in this engine.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Hiyuki';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const HIYUKI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS — most rows are "considered Resonance Liberation DMG"
  //    despite the Basic ATK/Heavy ATK/Skill/Intro slot actually used to cast them) ──
  {
    id: 'hiyuki.liberation.frostedge',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Frostedge' },
    timing: {}, target: { scope: 'self' }, effects: [],
    appliesTags: [{ tag: 'glacio-chafe' }],
    damage: { hits: parseSkillMultiplierHits('156.15%'), category: 'libDmg', basis: 'ATK' },
    note: 'Opener hit applying Glacio Chafe; considered Resonance Liberation DMG despite the Intro Skill input.',
  },
  {
    id: 'hiyuki.basic.present-self-stage3',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Present Self Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says the Intro leaves her primed to land Stage 3 directly (only
    // that segment of the row's 3-stage combo fires) — plain Basic ATK DMG, not reclassified.
    appliesTags: [{ tag: 'glacio-chafe' }],
    damage: { hits: parseSkillMultiplierHits('4.92%×5+98.37%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Only Stage 3 lands (the Intro skips straight to it). Applies Glacio Chafe.',
  },
  {
    id: 'hiyuki.liberation.frost-splinter-present-self',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Frost Splinter: Present Self' },
    timing: {}, target: { scope: 'self' }, effects: [],
    appliesTags: [{ tag: 'glacio-chafe' }],
    damage: { hits: parseSkillMultiplierHits('79.31%×2+158.61%'), category: 'libDmg', basis: 'ATK' },
    note: 'Interruption-immune throughout, applies Glacio Chafe on the last hit; considered Resonance Liberation DMG despite the Heavy ATK input.',
  },
  {
    id: 'hiyuki.liberation.foreclaiming-inward-vision',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Foreclaiming: Inward Vision' },
    timing: {}, target: { scope: 'self' }, effects: [],
    appliesTags: [{ tag: 'glacio-chafe' }],
    damage: { hits: parseSkillMultiplierHits('397.62%'), category: 'libDmg', basis: 'ATK' },
    note: 'Ultimate: enters Foreclaimed Self, applies 4 stacks of Glacio Chafe on hit, grants 3 Frostharden Iai.',
  },
  {
    id: 'hiyuki.liberation.foreclaimed-self-stage1-3',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Foreclaimed Self Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    appliesTags: [{ tag: 'glacio-chafe' }],
    damage: { hits: parseSkillMultiplierHits('49.27% → 40.02%×2 → 25.16%×4+67.08%'), category: 'libDmg', basis: 'ATK' },
    note: 'Basic ATK replacement in Foreclaimed Self; Stage 3 applies Glacio Chafe. Considered Resonance Liberation DMG. Fires twice in the real rotation (real, repeated cast, not a bug).',
  },
  {
    id: 'hiyuki.skill.frostblight-jade-cleave',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Frostblight: Jade Cleave' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('66.01%×4'), category: 'skillDmg', basis: 'ATK' },
    note: 'Ground Resonance Skill replacement in Foreclaimed Self; pulls in targets, restores Frostheart, removes Frostbind.',
  },
  {
    id: 'hiyuki.skill.frostblight-petalfall',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Frostblight: Petalfall' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('64.02%×4+64.02%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Mid-air Resonance Skill replacement in Foreclaimed Self; shares a cooldown with Jade Cleave.',
  },
  {
    id: 'hiyuki.liberation.iai',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Iai' },
    timing: {}, target: { scope: 'self' }, effects: [],
    appliesTags: [{ tag: 'glacio-chafe' }],
    damage: { hits: parseSkillMultiplierHits('283.82%+47.31%×4'), category: 'libDmg', basis: 'ATK' },
    note: 'Cast in Iai Stance (100+ Frostheart), up to 3 uses per entry; each cast consumes 1 Frostharden Iai for 3 Glacio Chafe stacks and grants 1 Whiteout Bitterfrost. Considered Resonance Liberation DMG.',
  },
  {
    id: 'hiyuki.liberation.bitterfrost-foreclaimed-self',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Bitterfrost: Foreclaimed Self' },
    timing: {}, target: { scope: 'self' }, effects: [],
    appliesTags: [{ tag: 'glacio-chafe' }],
    damage: { hits: parseSkillMultiplierHits('15.41%×8+493.05%'), category: 'libDmg', basis: 'ATK' },
    note: 'Forte finisher once Whiteout Bitterfrost is full; consumes it for 1 Snowforged Blade. Considered Resonance Liberation DMG despite the Heavy ATK input.',
  },
  {
    id: 'hiyuki.liberation.foreclaiming-blade-liberation',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Foreclaiming: Blade Liberation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Self-kit cross-interaction (2026-09-07): the real +795.24% total bonus (up to 3 Snowforged
    // Blade stacks, so 795.24/3 = 265.08% per stack — the source's own total divided evenly across
    // its own stated cap, not an invented per-stack figure) now reads the REAL stack count off this
    // specific cast's own `snowforgedBladeConsumed` step field, set by hiyuki.kitRules.js's
    // blade-liberation rule from her actual accumulated Snowforged Blade resource at the moment of
    // cast — not a fabricated max-stacks assumption. Previously modeled at the flat base value only
    // ("no stacking-scalar field for a per-resource-unit damage bonus"); resolveHitComposedDps.js/
    // resolveHitComposedTeamDps.js's new `hit.perStepUnit`/`hit.atkPctPerUnit` support (same pass) is
    // what makes this representable now. A rotation that only ever banks 1 stack (the curated case —
    // only 1 Bitterfrost cast happens) correctly scales less than a hypothetical full-3-stack cast.
    damage: {
      hits: [
        { atkPct: 198.81 },
        { atkPct: 0, perStepUnit: 'snowforgedBladeConsumed', atkPctPerUnit: 265.08 },
      ],
      category: 'libDmg', basis: 'ATK',
    },
    note: "2nd Ultimate. Real DMG scales +795.24% additional across up to 3 Snowforged Blade stacks consumed (265.08%/stack), now read from her own real accumulated resource state at cast time (see this block's own header comment) rather than a fixed base value or a fabricated max. Ends Foreclaimed Self.",
  },

  // Added 2026-09-07 (full-kit completeness re-pass): 8 real, sourced SKILL_MULTIPLIERS rows with no
  // block anywhere in this file — none used in her modeled CHARACTER_ROTATIONS (which never casts the
  // base Mid-air/Dodge Counter variants, her pre-Ultimate Resonance Skill, or Foreclaimed Self's
  // Stage 4-5/Heavy/Mid-air/Dodge Counter follow-ups), same "add unused base kit for completeness"
  // convention already used for Encore/Camellya earlier this session.
  {
    id: 'hiyuki.basic.midair-present-self',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Mid-air Attack - Present Self' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('128.18%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Not reclassified — plain Basic ATK DMG. Unused in the modeled rotation.',
  },
  {
    id: 'hiyuki.basic.dodge-counter-present-self',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Dodge Counter - Present Self' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('173.75%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Not reclassified — plain Basic ATK DMG. Unused in the modeled rotation.',
  },
  {
    id: 'hiyuki.skill.resonance-skill-present-self',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Resonance Skill - Present Self' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('24.50%×4+97.98%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Present Self\'s Resonance Skill (pre-Foreclaimed); enhances the next Basic ATK Stage 3 to restore extra Dedication. Unused in the modeled rotation, which enters Foreclaimed Self before this would ever be cast.',
  },
  {
    id: 'hiyuki.liberation.foreclaimed-self-stage4-5',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Foreclaimed Self Stage 4-5' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('29.93%×5 → 12.17%+109.47%'), category: 'libDmg', basis: 'ATK' },
    note: 'Continuation of the Foreclaimed Self Basic ATK combo past Stage 3. Considered Resonance Liberation DMG. Unused in the modeled rotation, which cancels Stage 3\'s endlag into Skill/Dodge each time rather than continuing to Stage 4-5.',
  },
  {
    id: 'hiyuki.liberation.heavy-foreclaimed-self',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Heavy Attack - Foreclaimed Self' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('107.16%'), category: 'libDmg', basis: 'ATK' },
    note: 'Standard (non-Bitterfrost) Heavy ATK in Foreclaimed Self; considered Resonance Liberation DMG. Unused in the modeled rotation, which only ever reaches Bitterfrost (the Whiteout-Bitterfrost-consuming Heavy ATK finisher, hiyuki.liberation.bitterfrost-foreclaimed-self above).',
  },
  {
    id: 'hiyuki.liberation.midair-foreclaimed-self-stage1-2',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Mid-air Attack - Foreclaimed Self Stage 1-2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('28.83%×2+38.43% → 26.09%×4'), category: 'libDmg', basis: 'ATK' },
    note: 'Considered Resonance Liberation DMG; Stage 2 applies Glacio Chafe. Unused in the modeled rotation (no mid-air segment).',
  },
  {
    id: 'hiyuki.liberation.midair-plunging-foreclaimed-self',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Mid-air Plunging Attack - Foreclaimed Self' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('111.60%'), category: 'libDmg', basis: 'ATK' },
    note: 'Considered Resonance Liberation DMG. Unused in the modeled rotation (no mid-air segment).',
  },
  {
    id: 'hiyuki.liberation.dodge-counter-foreclaimed-self',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Dodge Counter - Foreclaimed Self' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('81.77%×2'), category: 'libDmg', basis: 'ATK' },
    note: 'Considered Resonance Liberation DMG. Unused in the modeled rotation (her only Dodge Counter step enters Iai Stance rather than landing this attack, per CHARACTER_ROTATIONS\' own step note).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'hiyuki.outro.snowlight-blessing',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    condition: { element: 'glacio' },
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Team Glacio DMG +20% vs. targets affected by Glacio Chafe — excludes Hiyuki herself (not modeled, applied team-wide like every other team buff in this schema).',
  },
  {
    id: 'hiyuki.selfbuff.fine-snow-critdmg',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: conditional on Snow Rust stacks, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 40, source: 'self-kit' }],
    note: 'Inherent Fine Snow: +40% Crit DMG at 1 stack of Snow Rust (self-applied via her own Glacio Chafe) — no single CHARACTER_ROTATIONS step names this specifically, kept passive since she applies Glacio Chafe on most of her own casts.',
  },
  // Added 2026-09-07 (completeness pass): Minor Fortes and Inherent Skill Ephemeral Realm.
  {
    id: 'hiyuki.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 8, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Crit Rate+8%, ATK%+12% (Data dump/Hiyuki/Hiyuki.md line 118-119). Unconditional, always active.',
  },
  {
    id: 'hiyuki.inherent.ephemeral-realm',
    source: SOURCE, kind: 'utility', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [],
    note: 'Inherent Skill Ephemeral Realm: after 4s out of combat (post-fight or post-knockout) with <1 Snowforged Blade, restore 1 (Data dump line 100) — pure out-of-combat resource economy, zero DPS component.',
  },

  // ── Glacio Bite proc block — see this file's own header comment for the full derivation.
  //    combinedPct = 102 * (1 + 0.60 + 4.88) = 660.96 (base 102% x [Fine Snow Amp ceiling 60% +
  //    chain.s3 Multiplier 488%], summed as one %DMG-Bonus-shaped layer, then applied to the base).
  //
  //    Cross-character reactivity (2026-09-07, real engine work, not a per-team-pairing hack):
  //    ONE 'ally-action' block firing off the shared 'glacio-chafe' tag — populated by ANY block on
  //    ANY team member whose own note already confirms it applies real Glacio Chafe (currently
  //    tagged: this file's own 7 Chafe-applying blocks above, Lucilla's Clip It/Spotlight/Oblivion,
  //    Suisui's Tinkling Jade/Drizzle Stance Stage 4 — see each file's own appliesTags addition).
  //    This is the general mechanism, not a Hiyuki+Lucilla-specific one: it fires identically for
  //    solo Hiyuki (her own tagged casts populate the same actionTags set — see
  //    resolveHitComposedDps.js's own ally-action handling), for Hiyuki+Suisui with no Lucilla at
  //    all, or for any future Glacio-Chafe-applying character the moment their own block file tags
  //    itself the same way — nothing here names a specific teammate. Replaces the 7 separate
  //    self-only 'cast'-triggered proc blocks this file used before cross-character reactivity was
  //    built (each of those only fired off Hiyuki's OWN casts). ──
  {
    id: 'hiyuki.procdmg.glacio-bite',
    source: SOURCE, kind: 'damage', section: 'Buff',
    trigger: { type: 'ally-action', action: 'glacio-chafe' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('660.96%'), basis: 'ATK' },
    note: 'Glacio Bite proc firing off ANY real Glacio Chafe application on the team (her own included) — see this file\'s header comment for the full derivation/assumptions and the cross-character mechanism.',
  },
  {
    // Fixed (Hiyuki S6 DMG-taken sweep): the prior audit's own chain.s6 comment claimed this had "no
    // matching stat key anywhere in this engine's vocabulary" and was "real engine work, not a data
    // gap" — wrong, confirmed by direct precedent already proven working elsewhere in this codebase:
    // Qingxiao's own qingxiao.debuff.mindlock uses the exact same shape (kind:'debuff',
    // target:'all-enemies', effects:[{stat:'amplify', scopedToBlockId:...}]) for an identical
    // "DMG taken from THIS SPECIFIC move only" enemy-side debuff. Glacio Bite already has its own
    // dedicated, uncategorized damage block (hiyuki.procdmg.glacio-bite above) to scope onto — no new
    // engine capability was actually needed, just noticing the precedent. Modeled at the 3-Snow-Rust
    // ceiling value (kept at ceiling rather than a real stacking ramp, same convention this file
    // already uses for Fine Snow/Glacio Bite/chain.s6's own +40% Crit DMG).
    id: 'hiyuki.chain.s6-glacio-bite-dmg-taken',
    source: SOURCE, kind: 'debuff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'all-enemies' },
    effects: [{ stat: 'amplify', value: 25, scopedToBlockId: 'hiyuki.procdmg.glacio-bite', source: 'self-kit' }],
    note: 'S6, at 3 Snow Rust stacks: total Glacio Bite DMG taken by nearby targets +25% more — scoped to hiyuki.procdmg.glacio-bite only (the dump\'s own text is explicit this only affects Glacio Bite damage, not her wider kit). Sequence-6-gated via the chain.sN id convention.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'hiyuki.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Fixed 2026-09-07 (full-kit audit): was a bare unscoped `libDmg: 120` — a real over-crediting
    // bug. The dump's own S1 text (line 111) is explicit: "Foreclaimed-Self Basic/Heavy/Mid-air/
    // Plunge/Dodge Counter DMG Multipliers +120%" — five NAMED categories, all Foreclaimed-Self
    // context. Several OTHER libDmg-categorized blocks in this file are explicitly NOT in that list
    // (Frostedge is the Intro-slot opener, cast BEFORE Foreclaimed Self; Frost Splinter is a
    // PRESENT SELF move, its own chain.s3 node names it separately; Foreclaiming: Inward Vision and
    // Foreclaiming: Blade Liberation are the two "Foreclaiming:" Ultimates that ENTER/END Foreclaimed
    // Self, not "Basic/Heavy/Mid-air/Plunge/Dodge Counter" moves themselves) — an unscoped libDmg
    // buff was silently also inflating all 4 of those. Scoped to exactly the 8 blocks whose own
    // move name matches one of S1's 5 categories. Iai is included on a documented inference, not a
    // literal citation: her own kit text (dump line 85) names the move "Basic Attack – Iai," and
    // it fires as a Normal-Attack-replacement reached via a Dodge out of Foreclaimed Self — genuine
    // uncertainty, not a confirmed fact, flagged here rather than silently assumed either way.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{
      stat: 'libDmg', value: 120, source: 'self-kit',
      scopedToBlockId: [
        'hiyuki.liberation.foreclaimed-self-stage1-3',
        'hiyuki.liberation.foreclaimed-self-stage4-5',
        'hiyuki.liberation.heavy-foreclaimed-self',
        'hiyuki.liberation.midair-foreclaimed-self-stage1-2',
        'hiyuki.liberation.midair-plunging-foreclaimed-self',
        'hiyuki.liberation.dodge-counter-foreclaimed-self',
        'hiyuki.liberation.bitterfrost-foreclaimed-self',
        'hiyuki.liberation.iai',
      ],
    }],
    note: 'Foreclaimed-Self Basic/Heavy/Mid-air/Plunge/Dodge Counter DMG Multiplier +120% (confirmed exact value) — scoped to the 8 blocks matching those 5 named categories (see this effect\'s own comment for the full list and the Iai inclusion caveat), NOT the two Foreclaiming: Ultimates, Frostedge, or Frost Splinter.',
  },
  {
    id: 'hiyuki.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Iai' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 125, source: 'self-kit' }],
    note: "Basic Attack - Iai's own DMG Multiplier +125% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'hiyuki.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Fixed 2026-09-07 (full-kit audit): was a bare unscoped `libDmg: 160` — a real over-crediting
    // bug of the same class as chain.s1's own fix above. The dump's own S3 text names exactly 2
    // moves ("Frost Splinter (Present)/Bitterfrost (Foreclaimed) Heavy ATK DMG Multipliers +160%"),
    // but an unscoped libDmg buff was silently ALSO inflating Frostedge, Foreclaiming: Inward
    // Vision, Foreclaimed Self Stage 1-3, Iai, and Foreclaiming: Blade Liberation — every other
    // libDmg-categorized block in this file. Scoped to exactly the 2 named blocks.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'libDmg', value: 160, scopedToBlockId: 'hiyuki.liberation.frost-splinter-present-self', source: 'self-kit' },
      { stat: 'libDmg', value: 160, scopedToBlockId: 'hiyuki.liberation.bitterfrost-foreclaimed-self', source: 'self-kit' },
    ],
    note: 'Frost Splinter: Present Self AND Bitterfrost: Foreclaimed Self DMG Multiplier +160% (corrected from heavyDmg -> libDmg per the audit, both are "considered Resonance Liberation DMG" despite the Heavy Attack slot) — scoped to exactly those 2 blocks (see this effect\'s own comment). S3 ALSO carries "+488% Glacio Bite proc DMG Multiplier at 2 Snow Rust stacks" (dump line 113) — that portion is folded directly into hiyuki.procdmg.glacio-bite\'s own %ATK value (see this file\'s header comment) rather than as a separate effect here, since it only ever applies to that proc instance, never to this block\'s own libDmg hits.',
  },
  {
    id: 'hiyuki.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Skill:Frostblight: Jade Cleave' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20, stacking: 'refresh', source: 'self-kit' }],
    note: '+20% DMG dealt by all nearby team Resonators for 30s on Present Self/Jade Cleave/Petalfall cast (corrected from a wrong atkPct:15 to the real allDmg:20 per the audit) — modeled on the Jade Cleave cast used in her real rotation. Self-heal 18% Max HP on the same trigger not modeled (no DPS component).',
  },
  {
    id: 'hiyuki.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 80, source: 'self-kit' }],
    note: 'Present Self/Jade Cleave/Petalfall Resonance Skill DMG +80% (confirmed exact category, corrected value) — kept passive, applies to both Skill blocks above.',
  },
  {
    id: 'hiyuki.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Fixed 2026-09-07 (full-kit audit): the +500% effect was a bare unscoped `critDmg` — a real
    // over-crediting bug, same class as chain.s1/s3's own fixes above but for a NON-category-gated
    // stat: critDmg isn't restricted by damage.category the way libDmg/skillDmg/etc. are (it feeds
    // avgCrit for EVERY hit regardless of category), so an unscoped critDmg effect silently boosted
    // her ENTIRE kit's crit damage, not just the 2 moves the dump's own S6 text actually names
    // ("Foreclaiming: Inward Vision and Blade Liberation Crit DMG +500%"). Scoped to exactly those 2
    // blocks via scopedToBlockId — the SAME mechanism already used for a non-category stat in this
    // exact shape elsewhere in this engine (Aemeath's own "+300% Crit DMG for Heavy ATK
    // specifically," cited in triggerBlocks.schema.js's own Effect.scopedToBlockId doc). The
    // separate +40% at 2 Snow Rust stacks stays UNSCOPED — the dump's own text phrases it as "her
    // own Crit DMG +40%" (line 116), a genuinely broad bonus distinct from S3's own DMG-multiplier
    // concept, not a move-specific one — kept at ceiling, same "modeled at the ceiling rather than
    // the ramp" convention this file already uses for Fine Snow/Glacio Bite. The +25% Glacio Bite
    // DMG TAKEN at 3 stacks is modeled SEPARATELY as its own debuff block
    // (hiyuki.chain.s6-glacio-bite-dmg-taken below) — fixed in a later pass: this comment previously
    // claimed "no matching stat key anywhere in this engine's vocabulary," which was wrong (an enemy-
    // side amplify debuff scoped via scopedToBlockId, already proven working for Qingxiao's Mindlock,
    // covers it exactly).
    effects: [
      { stat: 'critDmg', value: 500, scopedToBlockId: 'hiyuki.liberation.foreclaiming-inward-vision', source: 'self-kit' },
      { stat: 'critDmg', value: 500, scopedToBlockId: 'hiyuki.liberation.foreclaiming-blade-liberation', source: 'self-kit' },
      { stat: 'critDmg', value: 40, source: 'self-kit' },
    ],
    note: 'Foreclaiming: Inward Vision/Blade Liberation Crit DMG +500% (corrected from 100 per the audit) — scoped to exactly those 2 blocks (see this effect\'s own comment; was previously a real over-crediting bug applying to her entire kit). PLUS a further, genuinely broad +40% Crit DMG at 2 Snow Rust stacks (kept at ceiling, same convention as hiyuki.chain.s2). The +25% Glacio Bite DMG TAKEN at 3 stacks is modeled separately — see hiyuki.chain.s6-glacio-bite-dmg-taken below.',
  },
];
