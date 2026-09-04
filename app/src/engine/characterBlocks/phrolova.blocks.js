// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/phrolova.blocks.js
// Phrolova converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Phrolova'], RESONANCE_CHAIN_DATA['Phrolova'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Phrolova'], and CHARACTER_ROTATIONS['Phrolova']. No new numbers invented. S5
// correctly has NO block — purely defensive, zero DPS component. The rotation's
// Liberation step name ("Waltz of Forsaken Depths") doesn't match SKILL_MULTIPLIERS'
// row name ("Curtain Call"), but both describe the identical mechanic (ends
// Resolving Chord, enters Maestro) — treated as the same move, sourced from Curtain
// Call's value.
//
// Corrected 2026-09-02 against a fresh the source dump (`Characters data dump/Phrolova/
// Phrolova.md`): her two Forte follow-ups (Movement of Fate and Finality / Murmurs
// in a Haunting Dream — 3 real CHARACTER_ROTATIONS steps) previously had no matching
// SKILL_MULTIPLIERS row at all, leaving S1's own +80% totalMult bonus permanently
// inert. Both moves now have real, sourced values and their own damage blocks below
// (S1 is live). Also added `phrolova.chain.s6-apparition`, a real S6-only damage hit
// (Apparition of Beyond-Hecate, 216.42% ATK) fired during those same two moves —
// previously entirely unmodeled, not just miscategorized (confirmed via the dump,
// absent from every prior source this file was built from).
//
// Also fixed 2026-09-02: `phrolova.liberation.hecate-attack` — Hecate's own attacks during Maestro
// were the largest previously-zero-contribution gap in her kit (Echo = 43.9% of her total damage per
// the source dump), despite SKILL_MULTIPLIERS' 'Liberation, Maestro State: Hecate' row already having
// real values for them — that row had simply never been converted into a firing block. Modeled as one
// representative tick anchored to the Liberation cast (same pattern as Denia's Erosion Field), not the
// real repeating/conditional off-field mechanic — see that block's own note. This also unblocked S6's
// separate +24% Enhanced Attack-Hecate multiplier (now scoped onto it via scopedToBlockId).
//
// Fixed 2026-09-04 (full 9-dimension re-audit, fresh dump): `phrolova.chain.s1`'s totalMult effect had
// no scopedToBlockId — `stats.totalMult` is a flat multiplier applied by resolveHitComposedDps.js to
// EVERY damage block a character has, so this was silently inflating ALL of Phrolova's damage (Basic,
// Skill, Heavy, Liberation, Echo), not just the two named Forte follow-ups the dump's own text scopes
// it to — the same unscoped-totalMult bug class already found and fixed on Jiyan. Scoped to
// phrolova.forte.movement-of-fate-and-finality (the only one of the two moves with its own block here).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Phrolova';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const PHROLOVA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'phrolova.intro.suite-of-immortality',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Suite of Immortality' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('596.4%'), category: 'skillDmg' },
    note: "Enhanced Intro used only while in Maestro state (her Ultimate was cast last rotation) — a Stagnate hit counted as Skill DMG despite the Intro slot. This is the variant her real rotation always uses (never the base 'Suite of Quietus').",
  },
  {
    id: 'phrolova.basic.stage3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('196.1%'), category: 'basicDmg' },
    note: 'Enters Reincarnate, grants 1 Volatile Note: Strings. Uses only Stage 3\'s own segment of the "Stage 1-3" row (rotation step is a single Basic Attack press).',
  },
  {
    id: 'phrolova.skill.whispers-in-a-fleeting-dream',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Whispers in a Fleeting Dream' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('106.0%×2'), category: 'skillDmg' },
    note: 'Grants 1 Volatile Note: Winds, re-enters Reincarnate.',
  },
  {
    id: 'phrolova.forte.movement-of-fate-and-finality',
    source: SOURCE, kind: 'damage',
    // CHARACTER_ROTATIONS' own Forte steps use the combined "Movement of Fate and Finality / Murmurs
    // in a Haunting Dream" label (a real in-game player choice between the two, picked per encounter —
    // single-target vs. group) — same shape, same limitation, as Camellya's own
    // 'Skill:Vining Waltz 1-4 / Blazing Waltz' block: this fires identically for all 3 real occurrences
    // and cannot distinguish which of the two was actually chosen each time. Uses Movement of Fate and
    // Finality's own values (the single-target move), matching the source's own "1 Target scenario" calc
    // benchmark this file's other values are already sourced from.
    trigger: { type: 'cast', on: 'Forte:Movement of Fate and Finality / Murmurs in a Haunting Dream' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('37.88%×4 + 117.83%×3'), category: 'skillDmg' },
    note: 'Reincarnate follow-up (Movement of Fate and Finality variant used) — single-target, Stagnates, ends Reincarnate. Considered Resonance Skill DMG per its own kit text despite the Basic ATK input. Buffed by chain.s1 (+80% totalMult). The Murmurs in a Haunting Dream (grouping) variant — 23.21%×4 + 46.41% + 324.82%, also skillDmg — is undercounted whenever the real rotation would have used it instead; not separately representable since the rotation step doesn\'t distinguish the two.',
  },
  {
    id: 'phrolova.basic.stage1-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('106.9% → 95.4% → 196.1%'), category: 'basicDmg' },
    note: 'Full 3-tap combo, Stage 3 grants another Volatile Note: Strings.',
  },
  {
    id: 'phrolova.heavy.scarlet-coda',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Scarlet Coda' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('33.0%×2 + 12.4%×8 + 495.1%'), category: 'skillDmg' },
    note: "Considered Resonance Skill DMG per its own kit text (not heavyDmg, despite replacing Heavy Attack). Damage scales with stacked Aftersound (cap 24 stacks, real per-stack scaling not modeled — base value used). Activates the Resolving Chord state, unlocking Liberation. Requires 6 Volatile Notes and the Compose state (auto-triggers every 25s, not modeled as a resource gate).",
  },
  {
    id: 'phrolova.liberation.waltz-of-forsaken-depths',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Waltz of Forsaken Depths' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Sourced from the 'Curtain Call' row — same mechanic (ends Resolving Chord, enters Maestro),
    // different name in the rotation data than in SKILL_MULTIPLIERS.
    damage: { hits: parseSkillMultiplierHits('465.2%'), category: 'libDmg' },
    note: 'Costs no Resonance Energy, castable only in Resolving Chord. Ends Resolving Chord and enters Maestro for 24s: +120% self ATK (not modeled, see phrolova.chain.s6 for the S6 Maestro on-field bonus), Hecate fights alongside her.',
  },
  // Added 2026-09-02: Hecate's own attacks during the 24s Maestro window — sourced from
  // SKILL_MULTIPLIERS' existing 'Liberation, Maestro State: Hecate' row (Strings 347.9% / Winds 330.5% /
  // Cadenza 347.9%), which was already in characters.js but had never been converted into a real firing
  // block — the largest previously-zero gap in her kit (Echo is 43.9% of her total damage profile per
  // the source dump, entirely from Hecate). Anchored to the same Liberation cast that starts Maestro,
  // same "one representative tick, not the full sustained mechanic" pattern already used for Denia's
  // Erosion Field (denia.liberation.erosion-field) — the REAL mechanic is a repeating auto-attack every
  // ~1.2-1.5s (per the Review tab's own text) for up to 24s, cued by the player on-field (every 2nd
  // Basic Attack-Hecate becomes Enhanced) or auto-triggered off-field by any teammate's Echo Skill cast
  // (capped 10/Maestro) — neither the real cadence nor the on-field/off-field branching is modeled here.
  // Uses the Strings variant (matches Cadenza's identical value, the majority of the 3-way split;
  // Winds is 330.5%, a documented slight undercount when Winds is the real note playing).
  {
    id: 'phrolova.liberation.hecate-attack',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Waltz of Forsaken Depths' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('104.38% + 243.55%'), category: 'echoDmg' },
    note: 'Enhanced Attack-Hecate: Strings, one representative tick of Hecate\'s repeating off-field Maestro attacks (considered Echo Skill DMG). See this file\'s header comment for what the real repeating/conditional mechanic still isn\'t modeled.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'phrolova.outro.unfinished-piece',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { element: 'havoc' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh' },
      { stat: 'heavyDmg', value: 25, stacking: 'refresh' },
    ],
    note: 'Ends immediately if the incoming Resonator is swapped out, not modeled. Grants Hecate 2 bonus off-field attacks if cast during Maestro, not modeled (no DPS component representable here).',
  },
  {
    id: 'phrolova.selfbuff.aftersound',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: stacking condition, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 2.5, stacking: 'stacking', maxStacks: 24 }],
    note: 'Aftersound: +2.5% Crit DMG per stack up to 24 stacks (60%) — modeled as per-stack stacking. Beyond 24 stacks it instead grants +1%/stack up to a 100% total cap, not modeled (documented, base 60% cap used).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic; S5 correctly has NO block — purely defensive, zero DPS component) ──
  {
    id: 'phrolova.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Fixed 2026-09-04: this totalMult effect had NO scopedToBlockId, so `stats.totalMult` applied it
    // as a flat multiplier on EVERY damage block Phrolova has (Basic/Skill/Heavy/Liberation/Echo, not
    // just the two named Forte follow-ups) — the same unscoped-totalMult architecture bug already found
    // and fixed on Jiyan. The dump's own text ("DMG Multiplier of Movement of Fate and Finality +80%;
    // DMG Multiplier of Murmurs in a Haunting Dream +80%") names two specific moves only. Only
    // phrolova.forte.movement-of-fate-and-finality is modeled as a real block (the Murmurs variant isn't,
    // per this file's combined-rotation-step limitation noted elsewhere), so scoped to that one block —
    // matches the same single-block scoping pattern already used on phrolova.chain.s6's echoDmg effect.
    effects: [{ stat: 'totalMult', value: 80, scopedToBlockId: 'phrolova.forte.movement-of-fate-and-finality' }],
    note: "DMG Multiplier of Movement of Fate and Finality +80% (Murmurs in a Haunting Dream also +80% per the dump, but that variant has no separate block here — see the combined-Forte-step note above). Scoped via scopedToBlockId so it no longer inflates her other damage blocks. Also grants Volatile Note - Cadenza every 4s out-of-combat under certain conditions, not modeled.",
  },
  {
    id: 'phrolova.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Scarlet Coda' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 75 }],
    note: "Scarlet Coda's own DMG Multiplier +75% (correct skillDmg category per the audit comment — the wiki explicitly states this instance of damage 'is considered Resonance Skill DMG', not heavyDmg despite replacing Heavy Attack). Also doubles Aftersound's per-stack bonus and grants 14 Aftersound stacks on cast, not modeled. Cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'phrolova.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'echoDmg', value: 80 }],
    note: 'Echo Skill DMG Amplified +80% (confirmed exact) — kept passive/self rather than anchored to a specific cast, since it buffs the whole echoDmg category (both phrolova.liberation.hecate-attack and phrolova.chain.s6-apparition, added 2026-09-02) not one single move. Also converts all Volatile Notes to Cadenza on Scarlet Coda cast and applies a 20% ATK reduction debuff (15s) to Enhanced Attack-Hecate: Cadenza targets, neither modeled.',
  },
  {
    id: 'phrolova.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Echo:Use Echo' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20, stacking: 'refresh' }],
    note: 'Casting Echo Skill grants the WHOLE TEAM +20% Attribute DMG Bonus for 30s (confirmed exact, team-wide).',
  },
  // S5 correctly has NO block — Maestro-entry Stagnate field (4s, ends early if she leaves Maestro/
  // swaps) + 30% DMG TAKEN reduction during Maestro, a purely defensive/utility node with NO DMG-
  // dealing component at all.
  {
    id: 'phrolova.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Waltz of Forsaken Depths' },
    timing: { duration: 24 }, // matches Maestro's own 24s window
    target: { scope: 'self' },
    effects: [
      { stat: 'elemDmg', value: 60 },
      // Added 2026-09-02: now buildable — phrolova.liberation.hecate-attack exists to scope this to.
      // scopedToBlockId restricts this +24% to Hecate's own attack block only (not Phrolova's whole
      // echoDmg category), matching the node's real text exactly (only Enhanced Attack-Hecate's own
      // Multiplier, not a general Echo Skill DMG buff — that's chain.s3's separate +80% echoDmg).
      { stat: 'echoDmg', value: 24, scopedToBlockId: 'phrolova.liberation.hecate-attack' },
    ],
    note: 'On-field-during-Maestro case: Phrolova gains +60% Havoc DMG Bonus (the larger of two conditional branches — off-field instead grants a +40% DMG-taken debuff on enemies, not modeled here). Modeled anchored to the Liberation cast that enters Maestro, scoped to its 24s window. The separate +24% Enhanced Attack-Hecate DMG Multiplier is now modeled too (fixed 2026-09-02), scoped via scopedToBlockId to phrolova.liberation.hecate-attack specifically so it doesn\'t also inflate her own echoDmg-categorized hits.',
  },
  // Added 2026-09-02 (fresh the source dump): S6 ALSO commands Hecate to cast a real damage instance,
  // Apparition of Beyond-Hecate (216.42% ATK, considered Echo Skill DMG, grants 8 Aftersound on hit —
  // the Aftersound grant itself not modeled, same class as every other stack-grant already left out of
  // this file), during EITHER Forte follow-up. Gated to sequence 6 via the `.chain.s6-<suffix>` id
  // convention (sequenceGating.js). Same combined-label limitation as the Forte damage block above —
  // fires once per real occurrence of the combined rotation step, using Movement of Fate and Finality's
  // side of the choice. Previously entirely unmodeled (not merely miscategorized) — absent from
  // RESONANCE_CHAIN_DATA's flat {stat:value} table since it's a real hit, not a stat bonus.
  {
    id: 'phrolova.chain.s6-apparition',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Movement of Fate and Finality / Murmurs in a Haunting Dream' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('216.42%'), category: 'echoDmg' },
    note: 'S6: Apparition of Beyond-Hecate, 216.42% ATK, considered Echo Skill DMG, fired alongside the Forte follow-up. Also grants 8 Aftersound stacks on hit, not modeled.',
  },
];
