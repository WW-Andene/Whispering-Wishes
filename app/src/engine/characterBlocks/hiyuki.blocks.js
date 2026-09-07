// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/hiyuki.blocks.js
// Hiyuki converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Hiyuki'], RESONANCE_CHAIN_DATA['Hiyuki'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Hiyuki'], and CHARACTER_ROTATIONS['Hiyuki']. No new numbers invented.
// Foreclaiming: Blade Liberation's per-Snowforged-Blade DMG scaling (up to
// +2385.72% max) is not modeled (no stacking-scalar field for a per-resource-unit
// damage bonus).
//
// Completeness pass 2026-09-07: added Minor Fortes (Crit Rate+8%/ATK%+12%,
// Data dump/Hiyuki/Hiyuki.md line 118-119) and Inherent Skill Ephemeral Realm
// (line 100, pure resource-restore utility, zero DPS component).
//
// Glacio Bite (2026-09-07, direct user instruction to build a real mechanic rather
// than document it as an unmodeled gap — this was her single largest itemized real
// damage bucket after aggregate Liberation, 30.3%/438,900 dmg per her own dump's
// Damage Profile, line 219/221): modeled as one 'cast'-triggered damage proc block
// per real Glacio-Chafe-applying move in her CHARACTER_ROTATIONS (Frostedge, Present
// Self Stage 3, Frost Splinter, Foreclaiming: Inward Vision, Foreclaimed Self Stage
// 1-3, Iai, Bitterfrost — dump line 82's own "each new Glacio Bite stack triggers a
// DMG instance" text, cross-referenced against each move's own "applies Glacio
// Chafe" note already present in the damage blocks below), NOT via DOT_MECHANICS'
// existing rotation-aggregate Level-Mult tick formulas (Frazzle/Erosion/Fusion
// Burst/Electro Flare) — those are for defense-independent flat-Level-Mult status
// ticks; Glacio Bite is explicitly an ATK%-scaling instance (Fine Snow's own "+102%
// Glacio Bite DMG instance" text, dump line 99) that needs the real
// crit/dmgBonus/defMult/resMult per-hit chain resolveHitComposedDps.js already
// applies to every other 'cast' block here, so a plain damage block is the more
// correct shape, not a new DOT-tick mechanic.
//
// Fine Snow's own Glacio Bite DMG Amp (+30%/+30% at 1/3 Snow Rust stacks, dump line
// 99) and chain.s3's own Glacio Bite proc Multiplier (+488% at 2 Snow Rust stacks,
// dump line 113) are folded directly into each proc block's own %ATK value — same
// established "modeled at the ceiling rather than the ramp" convention this file
// already used for the block this replaces (the old hiyuki.selfbuff.fine-snow-
// glacio-bite elemDmg:60 buff, REMOVED: elemDmg is Glacio DMG Bonus, which per the
// dump's own text is "a distinct multiplier from base Glacio DMG Bonus" and so does
// NOT apply to Glacio Bite at all — that block was a real correctness bug, broadly
// buffing Hiyuki's ENTIRE kit by +60% Glacio DMG instead of only the (previously
// nonexistent) Glacio Bite instances). The Amp/Multiplier layers are combined
// additively with the base 102% (100% + 60% + 488% = 648% -> ×6.48), matching this
// engine's own calcDmgBonus() convention of summing %DMG-Bonus-shaped layers rather
// than compounding them multiplicatively — a documented assumption, not a sourced
// combination rule (the dump doesn't state how these two bonuses stack together).
// Category intentionally omitted on every proc block: the dump's own Damage Profile
// text says Glacio Bite "is a distinct proc/status damage type... not tied to a
// specific button," so none of the standard skillDmg/libDmg/basicDmg %DMG Bonus
// categories should apply to it.
//
// Still NOT modeled (real, sourced, but out of THIS single-character block file's
// reach): chain.s6's extension of "her own Chafe procs Glacio Bite" to "ANY
// teammate's Chafe procs Glacio Bite" at 2 Snow Rust stacks (dump line 116) needs
// real cross-character team-roster data (which teammates are present and what they
// apply) that a static per-character file can't see — the same category of gap as
// Aemeath's Between the Stars needed calcTeamStats.js-level `scopedEffects` to
// close; and chain.s6's own already-documented +25% Glacio Bite DMG TAKEN debuff at
// 3 stacks, which has no matching stat key anywhere in this engine (see its own
// note below).
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

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'hiyuki.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 120, source: 'self-kit' }],
    note: 'Foreclaimed Self core moves DMG Multiplier +120% (confirmed exact per the audit comment) — kept passive, applies broadly to her many Foreclaimed Self Liberation-labeled blocks above rather than one specific cast.',
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
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 160, source: 'self-kit' }],
    note: 'Frost Splinter: Present Self AND Bitterfrost: Foreclaimed Self DMG Multiplier +160% (corrected from heavyDmg -> libDmg per the audit, both are "considered Resonance Liberation DMG" despite the Heavy Attack slot) — kept passive, applies to both blocks above. S3 ALSO carries "+488% Glacio Bite proc DMG Multiplier at 2 Snow Rust stacks" (dump line 113) — that portion is folded directly into the hiyuki.procdmg.glacio-bite-* blocks\' own %ATK value (see this file\'s header comment) rather than as a separate effect here, since it only ever applies to those proc instances, never to this block\'s own libDmg hits.',
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
    // Fixed 2026-09-03: added the further conditional +40% Crit DMG at 2 Snow Rust stacks — same
    // sourced stat (critDmg), so a second flat effect on the same passive block cleanly stacks it
    // additively with the base +500%, matching this file's own "kept at ceiling" convention already
    // used for hiyuki.chain.s2's Glacio Bite ramp. The +25% Glacio Bite DMG TAKEN at 3 stacks is a
    // genuinely different concept (a debuff on the enemy's Glacio-Bite-specific damage taken, not a
    // Crit DMG stat) with no matching stat key anywhere in this engine's vocabulary — real engine
    // work (a new stat category), not a data-modeling gap, so still left undone and documented.
    effects: [
      { stat: 'critDmg', value: 500, source: 'self-kit' },
      { stat: 'critDmg', value: 40, source: 'self-kit' },
    ],
    note: 'Foreclaiming: Inward Vision/Blade Liberation Crit DMG +500% (corrected from 100 per the audit), PLUS a further +40% Crit DMG at 2 Snow Rust stacks (kept at ceiling, same convention as hiyuki.chain.s2) — kept passive. The +25% Glacio Bite DMG TAKEN at 3 stacks has no matching stat key in this engine (a Glacio-Bite-specific enemy debuff, not a Crit DMG modifier) and is not modeled — real engine work, not a data gap.',
  },
];
