// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/carlotta.blocks.js
// Carlotta converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Carlotta'], RESONANCE_CHAIN_DATA['Carlotta'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Carlotta'], and CHARACTER_ROTATIONS['Carlotta']. No new numbers
// invented. S3's Kaleidoscope Sparks extra Outro strike is modeled directly (added
// 2026-09-03, see carlotta.chain.s3-kaleidoscope-sparks). S1's Substance resource-
// economy effect has no DPS component and has no home in this schema.
//
// Cooldown/concertoEnergyGain added 2026-09-06 (completeness pass, same "bring every character up
// to Aalto's reference standard" direction as the prior passes) — sourced from Data dump/Carlotta/
// Carlotta.md's own Cooldown/Concerto Regen rows (Art of Violence, Chromatic Splendor, Era of New
// Wave, Death Knell, Fatal Finale). Two blocks in this file already fold multiple real casts into
// one combined block (Death Knell ×4, the repeat Art of Violence -> Chromatic Splendor pass) — their
// concertoEnergyGain is the SUMMED total across those real casts, not the single-cast value, to stay
// consistent with how their own damage.hits already combine multiple real casts. Imminent
// Oblivion/Wintertime Aria have no sourced Concerto Regen value anywhere in the dump — left as-is.
//
// Completeness pass 2026-09-07 (next character after Cantarella, alphabetically): found a REAL bug,
// not just a completeness gap — CHARACTER_ROTATIONS['Carlotta'] has a genuine
// `{ type: 'Mid-air', skill: 'Plunging Attack' }` step (framed as "pure repositioning, no damage
// focus" in its own note, but it still deals its real 104.78% ATK hit every rotation cycle per
// SKILL_MULTIPLIERS['Carlotta']'s own 'Mid-air, Attack' row), yet this file had NO block for it at
// all — the prior comment near that SKILL_MULTIPLIERS row ("None of these 3 rows are wired into a
// CHARACTER_ROTATIONS step... so this only fills the data table, no engine block added for them")
// was simply wrong about this one: 'Plunging Attack' DOES substring-match the row name 'Attack', so
// the rotation step resolves a real hit that the modern engine was silently dropping for lack of a
// block. Added carlotta.midair.plunging-attack below to close this real, DPS-relevant gap. Also
// added Minor Fortes (Crit Rate+8%, ATK%+12%, Data dump/Carlotta/Carlotta.md line 89), both Inherent
// Skills (Flawless Purity, Ars Gratia Artis — the latter already referenced by
// carlotta.debuff.deconstruction's own note but never given its own block), and the remaining real,
// sourced-but-genuinely-unused base-kit rows (Basic ATK Stage 1-2, Necessary Measures 1-3, Heavy ATK
// Standard/Containment Tactics, Mid-air Customary Greetings, Dodge Counter Riposte) as documented
// inert blocks, same convention as Aalto's/Camellya's/Cantarella's own unused-but-sourced blocks.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Carlotta';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const CARLOTTA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'carlotta.intro.wintertime-aria',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Wintertime Aria' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('178.93% + 59.65%×2'), basis: 'ATK' },
  },
  {
    id: 'carlotta.skill.art-of-violence',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Art of Violence' },
    // cooldown added 2026-09-06 (completeness pass): Data dump/Carlotta/Carlotta.md's own
    // "Cooldown: 14s" row for Resonance Skill Art of Violence (Chromatic Splendor is a same-slot
    // follow-up press, not a separately-costed ability — see that block's own note).
    timing: { cooldown: 14 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('144.11%×2'), category: 'skillDmg' , basis: 'ATK' },
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Carlotta/Carlotta.md's own
    // "Concerto Regen: 5 (Skill)" row.
    concertoEnergyGain: 5,
  },
  {
    id: 'carlotta.skill.chromatic-splendor',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Chromatic Splendor' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('112.73%×2 + 338.18%'), category: 'skillDmg' , basis: 'ATK' },
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Carlotta/Carlotta.md's own
    // "Concerto Regen: ... 5 (Chromatic Splendor)" row. No separate cooldown: the dump's own kit
    // text is explicit this is a same-ability-slot follow-up press to Art of Violence ("Skill falls
    // off cooldown if Chromatic Splendor isn't cast"), not an independently-cooldown-gated move.
    concertoEnergyGain: 5,
  },
  {
    id: 'carlotta.forte.imminent-oblivion',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Imminent Oblivion' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('66.83%×5 + 501.21%'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Counted as Resonance Skill DMG per its own kit text, despite being a Basic ATK-button cast.',
  },
  {
    id: 'carlotta.liberation.era-of-new-wave',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Era of New Wave' },
    // cooldown added 2026-09-06 (completeness pass): Data dump/Carlotta/Carlotta.md's own
    // "Skill Cooldown: 25s" row (listed under the Liberation section, the real ability-slot cooldown).
    timing: { cooldown: 25 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('402.71%'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Counted as Resonance Skill DMG per its own kit text, despite being a Liberation-button cast. Activates 10s Twilight Tango, forcing the next 5 Basic ATK/Liberation presses into Death Knell x4 -> Fatal Finale.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Carlotta/Carlotta.md's own
    // "Concerto Regen: 20 (Era of New Wave)" row. Its "Resonance Cost: 125" row is a
    // Liberation-gauge cost, not a gain — no matching schema field, not modeled, same treatment as
    // every other character's own Liberation resource cost.
    concertoEnergyGain: 20,
  },
  {
    id: 'carlotta.liberation.death-knell-x4',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Death Knell ×4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row is '(183.64% + 14.50%×4) per shot' — this step represents all 4 forced presses in
    // Twilight Tango, so the per-shot hit-set is repeated 4x to match the real 4-press mechanic.
    damage: { hits: [0, 1, 2, 3].flatMap(() => parseSkillMultiplierHits('183.64% + 14.50%×4')), category: 'skillDmg' , basis: 'ATK' },
    note: 'Counted as Resonance Skill DMG per its own kit text. Builds 1 Meta Vector per hit (cap 4), consumed by Fatal Finale.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Carlotta/Carlotta.md's own
    // "Concerto Regen: ... 7 (Death Knell)" row is PER SHOT — since this one block already folds all
    // 4 real forced presses into its own hit-list (see the note above), the real total Concerto
    // contribution across those 4 presses is 7×4 = 28, not the single-press value, to stay
    // consistent with the same "already-combined 4 real casts" treatment its damage.hits already get.
    concertoEnergyGain: 28,
  },
  {
    id: 'carlotta.liberation.fatal-finale',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Fatal Finale' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('644.33%'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Counted as Resonance Skill DMG per its own kit text. Ends Twilight Tango and wipes Substance to 0.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Carlotta/Carlotta.md's own
    // "Concerto Regen: ... 10 (Fatal Finale)" row.
    concertoEnergyGain: 10,
  },
  {
    id: 'carlotta.skill.art-of-violence-chromatic-splendor-2',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Art of Violence → Chromatic Splendor' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Second Skill-combo cast of the rotation (post-Twilight Tango) — both presses combined into
    // one CHARACTER_ROTATIONS step, so both skills' hit-sets are combined here to match.
    damage: { hits: [...parseSkillMultiplierHits('144.11%×2'), ...parseSkillMultiplierHits('112.73%×2 + 338.18%')], category: 'skillDmg' , basis: 'ATK' },
    // concertoEnergyGain added 2026-09-06 (completeness pass): both presses' own Concerto Regen
    // summed (5 + 5 = 10), same "combined block, combined resource total" treatment as
    // carlotta.liberation.death-knell-x4 above, matching how this block's own damage.hits already
    // combine both real casts.
    concertoEnergyGain: 10,
  },
  {
    id: 'carlotta.outro.closing-remark',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-04 (Phase A audit): had no `damage.category` at all despite being real, sourced
    // damage (3.77%/43,872 of her total per the dump's own Damage Profile) — her own direct swap-out
    // hit, explicitly not a team buff, same shape already fixed to `outroDmg` on Calcharo/Encore/
    // Lingyang/Rover: Havoc's Outros.
    damage: { hits: parseSkillMultiplierHits('794.2%'), category: 'outroDmg' , basis: 'ATK' },
  },
  {
    // Added 2026-09-03: S3's Kaleidoscope Sparks — a real extra strike on the SAME Outro cast, same
    // "extra hit at the same instant" shape already established by Brant's chain.s6-secondary-blast
    // (a real, sourced flat %ATK value, not a proportion, so modeled directly rather than derived).
    // sN-suffixed id gates this to sequence 3+ via sequenceGating.js's own <char>.chain.sN-<suffix>
    // convention.
    id: 'carlotta.chain.s3-kaleidoscope-sparks',
    source: SOURCE, kind: 'damage', section: 'Chain',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit) to match the Closing Remark hit it extends — an extra
    // strike on the same Outro cast, same category, same reasoning as above.
    damage: { hits: parseSkillMultiplierHits('1032.18%'), category: 'outroDmg' , basis: 'ATK' },
    note: 'S3 Kaleidoscope Sparks: Closing Remark gains 1 additional 1032.18%-ATK strike on the same Outro cast, gated to sequence 3+.',
  },

  // Added 2026-09-07 (completeness pass): the REAL bug — CHARACTER_ROTATIONS['Carlotta'] casts this
  // exact step every rotation cycle, and SKILL_MULTIPLIERS['Carlotta']'s 'Mid-air, Attack' row
  // (104.78%) substring-matches it, but no block existed to compose the hit — see file header.
  {
    id: 'carlotta.midair.plunging-attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Plunging Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('104.78%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base Mid-air Attack. No explicit "considered X DMG" override text — kept basicDmg per this schema\'s established convention for mid-air attacks with no override. Genuinely IS in CHARACTER_ROTATIONS (used to reposition after Art of Violence/Chromatic Splendor) — previously missing a block entirely, silently dropping this real per-rotation hit from computed DPS.',
  },

  // Added 2026-09-07 (completeness pass): her remaining base-kit rows, genuinely unused in
  // CHARACTER_ROTATIONS (confirmed — only Plunging Attack above is a real rotation step among her
  // whole base kit) — real, sourced SKILL_MULTIPLIERS rows, previously had no block anywhere.
  {
    id: 'carlotta.basic.stage1-2',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 1-2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('54.08% → 39.55%+39.55%+52.73%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base 2-stage Basic ATK combo (in-game name "Silent Execution"). Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'carlotta.basic.necessary-measures',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Necessary Measures 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.91% → 60.08%+73.43% → 139.93%+23.33%×4'), category: 'basicDmg', basis: 'ATK' },
    note: 'Moldable-Crystal Basic ATK replacement, consumes 1 crystal per strike. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'carlotta.heavy.standard',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('22.82%×4 + 60.84%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Base Heavy Attack. No override text — kept heavyDmg. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'carlotta.heavy.containment-tactics',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Containment Tactics' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('34.23%×4 + 91.26%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Substance-full Heavy Attack replacement, reduces Art of Violence cooldown 6s. No override text — kept heavyDmg. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation (her modeled rotation uses Imminent Oblivion instead).',
  },
  {
    id: 'carlotta.midair.customary-greetings',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Customary Greetings' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('107.99% + 131.99%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Basic Attack shortly after landing from a Mid-air Attack casts this flip-over surprise shot. basicDmg per the same mid-air convention as carlotta.midair.plunging-attack. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'carlotta.basic.dodge-counter',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Riposte' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('103.77% + 137.55%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base Dodge Counter — the dump\'s own text calls it "Normal Attack shortly after a successful Dodge," hence basicDmg. Consumes 1 Moldable Crystal. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },

  // ── Buff/debuff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'carlotta.selfbuff.final-bow',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: conditional on full Substance, no CHARACTER_ROTATIONS step directly named "Substance full"
    target: { scope: 'self' },
    // Fixed 2026-09-04 (Phase A audit): was `{stat:'libDmg', value:80}` unscoped — but NONE of
    // Carlotta's damage blocks are `libDmg`-categorized (Era of New Wave/Death Knell/Fatal Finale are
    // all `skillDmg` per the kit text's own "considered Resonance Skill DMG" override, verified against
    // resolveHitComposedDps.js's `categoryStat = stats[category]` lookup), so this was a complete
    // silent no-op — a `libDmg` stat pool with nothing in the kit ever reading it. Final Bow's own kit
    // text is a flat "+80% DMG Multiplier" on exactly those 3 named moves, not a general Liberation-
    // category bonus, so fixed to 3 `totalMult` effects each `scopedToBlockId`'d to one of those blocks
    // (Aemeath S3's multi-scoped-effects-on-one-block pattern).
    effects: [
      { stat: 'totalMult', value: 80, scopedToBlockId: 'carlotta.liberation.era-of-new-wave', source: 'self-kit' },
      { stat: 'totalMult', value: 80, scopedToBlockId: 'carlotta.liberation.death-knell-x4', source: 'self-kit' },
      { stat: 'totalMult', value: 80, scopedToBlockId: 'carlotta.liberation.fatal-finale', source: 'self-kit' },
    ],
    note: 'Forte Circuit Final Bow: at full (120/120) Substance, DMG Multiplier +80% on Era of New Wave/Death Knell/Fatal Finale specifically — ends early if swapped out during Twilight Tango or when Twilight Tango ends, not modeled (no early-consumption trigger in this schema).',
  },
  {
    id: 'carlotta.debuff.deconstruction',
    source: SOURCE, kind: 'debuff', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Era of New Wave' },
    timing: { duration: 4 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'defIgnore', value: 18, stacking: 'refresh' }],
    note: 'Also applied by Intro/Chromatic Splendor/Death Knell/Forte Heavy via Ars Gratia Artis — only the Liberation:Era of New Wave application is wired to a real CHARACTER_ROTATIONS step, the others not separately modeled.',
  },
  // Added 2026-09-07 (completeness pass): "Minor Fortes: Crit Rate+8%, ATK%+12%" — a permanent,
  // always-on passive stat bonus unlocked via Forte-tree ascension, previously had no block anywhere
  // in this file, same class of gap as every other converted character's own missing Minor Fortes.
  {
    id: 'carlotta.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 8, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Crit Rate+8%, ATK%+12% (Data dump/Carlotta/Carlotta.md line 89). Unconditional, always active.',
  },
  // Added 2026-09-07 (completeness pass): her 2 Inherent Skills, previously not referenced anywhere
  // in this file — real, sourced, kind:'utility' with effects:[] since neither has a representable
  // DPS stat, same pattern as Aalto's own inert Inherent Skill blocks.
  {
    id: 'carlotta.inherent.flawless-purity',
    source: SOURCE, kind: 'utility', section: 'Buff',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Flawless Purity — after Chromatic Splendor, Mid-air Attacks are DMG/interruption-immune before the hit lands; team\'s active Resonator gets -20% Flight STA cost while Carlotta is on team. Purely defensive/utility, no DPS component to model.',
  },
  {
    id: 'carlotta.inherent.ars-gratia-artis',
    source: SOURCE, kind: 'utility', section: 'Buff',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Ars Gratia Artis — Wintertime Aria, Chromatic Splendor, Death Knell, and Imminent Oblivion can also inflict Deconstruction. Already referenced by carlotta.debuff.deconstruction\'s own note; this block gives the Inherent Skill itself a home. No separate DPS component (Deconstruction\'s own defIgnore effect is modeled on carlotta.debuff.deconstruction).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic) ──
  {
    id: 'carlotta.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Fixed 2026-09-02 (re-read after being flagged as "found, not fixed" too hastily): was
    // `trigger:{type:'cast', on:'Liberation:Era of New Wave'}` with no `timing.duration` — the same
    // dead cast-scoped/no-duration no-op shape as S2/Lupa's S4/Verina's S6 (the engine-architecture history (git log)
    // item 12), so this never actually applied. Previously left unfixed on the theory that "Crit
    // Rate on a Deconstructed target" was an unsourced blanket guess if made unconditional — but the
    // pasted text's own Review section says outright: "This debuff lasts for 4 seconds but with the
    // Inherent Ability [Ars Gratia Artis] active, it should always be active." That's a direct source
    // for treating Deconstruction uptime as continuous through her real rotation, so an unconditional
    // passive +12.5% Crit Rate is the sourced fix, not a guess.
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 12.5, source: 'self-kit' }],
    note: "+12.5% Crit Rate, sourced as effectively unconditional per the kit text's own \"should always be active\" claim about Deconstruction uptime with Ars Gratia Artis. Chromatic Splendor hitting a Dispersion target also restores 30 Substance, a resource-economy effect with no DPS stat, not modeled.",
  },
  {
    id: 'carlotta.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Fixed 2026-09-02: this was `trigger:{type:'cast',...}` with no `timing.duration` — a
    // `kind:'buff'` block in that exact shape is a silent no-op in resolveHitComposedDps.js's
    // statsAtInstant() (it only reads passiveBlocks [trigger.type==='passive'] and buffWindows
    // [duration != null]), the same architecture bug already found and fixed on Lupa's S4/Verina's
    // S6 (the engine-architecture history (git log) item 12). Converted to passive + scopedToBlockId (Augusta's S3
    // pattern) so it only ever boosts Fatal Finale's own hit, matching the real "Fatal Finale's own
    // DMG Multiplier +126%" mechanic, without needing a cast-window that never gets built.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 126, scopedToBlockId: 'carlotta.liberation.fatal-finale', source: 'self-kit' }],
    note: "Real scope: Fatal Finale's own DMG Multiplier +126%.",
  },
  {
    id: 'carlotta.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Fixed 2026-09-04 (Phase A audit): was an unscoped `totalMult` effect on a `passive` block —
    // resolveHitComposedDps.js applies `stats.totalMult` unconditionally to EVERY hit (it is not
    // gated by `damage.category` the way `elemDmg`/`skillDmg`/etc. are), so this silently boosted
    // Carlotta's WHOLE kit (Basic ATK/Intro/Outro/every Twilight Tango hit included), not just Art of
    // Violence/Chromatic Splendor as the kit text says — a real unscoped-totalMult-on-a-passive-node
    // leak (the bug class already found and fixed roster-wide, e.g. Rover: Aero's dead chain nodes).
    // Scoped to all 3 real blocks the +93% actually applies to, including the repeat-pass combined
    // block (`...-chromatic-splendor-2`, the 2nd Skill:Art of Violence → Chromatic Splendor cast later
    // in the same rotation) so the 2nd occurrence isn't silently dropped either.
    effects: [
      { stat: 'totalMult', value: 93, scopedToBlockId: 'carlotta.skill.art-of-violence', source: 'self-kit' },
      { stat: 'totalMult', value: 93, scopedToBlockId: 'carlotta.skill.chromatic-splendor', source: 'self-kit' },
      { stat: 'totalMult', value: 93, scopedToBlockId: 'carlotta.skill.art-of-violence-chromatic-splendor-2', source: 'self-kit' },
    ],
    note: "Real scope: Art of Violence's AND Chromatic Splendor's own DMG Multiplier both +93%. ALSO enables Outro Skill Kaleidoscope Sparks — modeled as a separate real damage block, carlotta.chain.s3-kaleidoscope-sparks above.",
  },
  {
    id: 'carlotta.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Imminent Oblivion' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'skillDmg', value: 25, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Real mechanic: casting Heavy ATK, Containment Tactics, OR Imminent Oblivion grants the WHOLE TEAM +25% Resonance Skill DMG Bonus for 30s (confirmed team-wide target per the audit comment). Only the Imminent Oblivion trigger is wired to a real CHARACTER_ROTATIONS step (her rotation never uses plain Heavy ATK/Containment Tactics).',
  },
  {
    id: 'carlotta.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Fixed 2026-09-04 (Phase A audit): was `trigger:{type:'cast', on:'Forte:Imminent Oblivion'}` with
    // no `timing.duration` — the same dead cast-scoped/no-duration no-op shape as this file's own
    // S1/S2 (engine-architecture history item 12; a 6th confirmed instance project-wide). Converted to
    // passive + `scopedToBlockId` (S2's own already-fixed pattern) so it fires and applies only to
    // Imminent Oblivion's own hit.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 47, scopedToBlockId: 'carlotta.forte.imminent-oblivion', source: 'self-kit' }],
    note: "Real scope: Imminent Oblivion's own DMG Multiplier +47%.",
  },
  {
    id: 'carlotta.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Fixed 2026-09-04 (Phase A audit): was an unscoped `totalMult` effect on a `passive` block — the
    // same unconditional-whole-kit leak as S3 above (`stats.totalMult` is not category-gated). Scoped
    // to Death Knell's own block only.
    effects: [{ stat: 'totalMult', value: 186.6, scopedToBlockId: 'carlotta.liberation.death-knell-x4', source: 'self-kit' }],
    note: "Real scope: Death Knell's own DMG Multiplier +186.6%. Also doubles Death Knell's crystal-shard count and adds a 1.5s Scattering immobilize on hit (CC, not a DPS stat), not modeled.",
  },
];
