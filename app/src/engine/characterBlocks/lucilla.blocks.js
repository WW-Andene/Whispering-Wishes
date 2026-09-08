// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lucilla.blocks.js
// Lucilla converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Lucilla'], RESONANCE_CHAIN_DATA['Lucilla'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Lucilla'], and CHARACTER_ROTATIONS['Lucilla']. No new numbers
// invented. A real Liberation-cast self-buff (+30% Basic ATK/Echo Skill DMG, 10s)
// sourced from CHARACTER_ROTATIONS' own note text was entirely missing from
// CHAR_BUFF_TABLE['Lucilla'].selfBuffs before this read.
//
// Dual Resonance Mode (Glacio Chafe vs Echo) — full-kit cross-interaction audit,
// 2026-09-07 (direct user correction: "i said all cross interactions, condition and
// logic... inside the kit", not just Liberation/stacks): mode is the CENTRAL
// conditional structure of her entire kit, not a side detail. Every mode-dependent
// damage/buff move (Clear As Day, Oblivion, Letting It Go, the Liberation self-buff)
// now has a real Echo-mode sibling block tagged `condition.requiresStance`, so the
// engine's existing filterExclusiveModeBlocks/winningStanceForOwner mode-rivalry
// mechanism (sequenceGating.js — already used for her outro/Inherent-Skill buff
// pairs) resolves which one actually fires per composition/forcedStance, instead of
// hardcoding Glacio Chafe mode as though it were the only mode her real, sourced
// teams (Sigrika/Phrolova/Galbrena Echo squads — see this file's own Synergies
// section) ever use. Tracing Forms Stage 1-3 is the one dual-mode move confirmed
// NOT mode-dependent ("considered Basic Attack DMG regardless of mode") and
// correctly has no Echo sibling. Forte Circuit's own passives (Film Roll, Zoom) —
// previously entirely unrepresented anywhere, not just unmodeled as blocks — are
// now both real, firing blocks: Zoom (self-scoped Crit DMG on her own Echo-mode
// hits), and Film Roll (2026-09-08, on re-challenge — see its own comment below for
// why the first pass wrongly called it unrepresentable, and the root-cause engine
// fix — `actionTagCounts` + `trigger.requiresOtherOwner` — that made it real).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Lucilla';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const LUCILLA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'lucilla.intro.clip-it',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Clip It' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 2026-09-07 cross-character reactivity: real, sourced Glacio Chafe application (see this
    // block's own note below and Data dump/Lucilla/Lucilla.md line 63) — tagged so ANY teammate's
    // own 'ally-action' Chafe-reactive block (e.g. Hiyuki's Glacio Bite proc) can fire off it.
    appliesTags: [{ tag: 'glacio-chafe' }],
    // category/basis added during Layer 4 migration: was uncategorized, silently rejecting Resonance
    // Skill DMG Bonus. No override text names a different category, same default-to-skillDmg convention
    // as Aalto/Calcharo/Encore/Denia/Galbrena/Iuno/Jiyan's own Intro blocks.
    damage: { hits: parseSkillMultiplierHits('97.42%'), basis: 'ATK' },
    note: 'Restores 100 of 150 Trace, inflicts 1 stack of Glacio Chafe.',
  },
  {
    id: 'lucilla.skill.spotlight',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Spotlight' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 2026-09-07 cross-character reactivity: real, sourced "inflicts an extra Glacio Chafe stack in
    // Chafe mode" (Data dump/Lucilla/Lucilla.md line 29) — see lucilla.intro.clip-it's own comment.
    appliesTags: [{ tag: 'glacio-chafe' }],
    // Row 'Phantom Frame / Compensate / Spotlight' has 3 alternative values — the Spotlight variant
    // (perfect-timed release) matches this step's own label.
    damage: { hits: parseSkillMultiplierHits('82.35%×2+274.48%+109.80%'), category: 'skillDmg', basis: 'ATK' },
    note: 'A perfect release triggers Spotlight (restores 50 Trace, unlocks Ultimate once all 3 Photos are held).',
  },
  {
    id: 'lucilla.liberation.clear-as-day',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Clear As Day' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Mode-rivalry fix (2026-09-07, full-kit cross-interaction audit): this was hardcoded to basicDmg
    // ALWAYS, even though her own real, sourced teams (Sigrika/Phrolova/Galbrena Echo squads — see this
    // file's own build-guide Synergies section) put her in Echo mode, where this same hit is
    // "considered Echo Skill DMG" instead. Without a requiresStance-tagged Echo sibling, an Echo-mode
    // composition would silently still classify every one of her real, sourced hits as Basic Attack
    // DMG — missing real Echo Skill DMG Bonus buffs (Sigrika/Phrolova's own kits) and wrongly picking
    // up unrelated Basic ATK DMG buffs instead. `condition.requiresStance` here lets the engine's
    // existing filterExclusiveModeBlocks/winningStanceForOwner mode-rivalry mechanism (already used for
    // her outro/Inherent-Skill buff pairs) pick between this and lucilla.liberation.clear-as-day-echo
    // below, driven by the real per-composition Resonance Mode toggle (forcedStance), same as any other
    // dual-mode buff pair in this file.
    condition: { requiresStance: 'Glacio Chafe mode' },
    damage: { hits: parseSkillMultiplierHits('142.74%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Costs no Resonance Energy, enters Reminiscence for ~10s. Glacio Chafe mode: considered Basic Attack DMG.',
  },
  {
    id: 'lucilla.liberation.clear-as-day-echo',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Clear As Day' },
    timing: {}, target: { scope: 'self' }, effects: [],
    condition: { requiresStance: 'Echo mode' },
    damage: { hits: parseSkillMultiplierHits('142.74%'), category: 'echoDmg', basis: 'ATK' },
    note: 'Echo-mode sibling of lucilla.liberation.clear-as-day (see its own note) — same 142.74% value, considered Echo Skill DMG instead of Basic Attack DMG in Echo mode.',
  },
  {
    id: 'lucilla.basic.tracing-forms',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Tracing Forms Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('30.64%+45.95% → 59.77%+89.65% → 52.12%×8'), category: 'basicDmg', basis: 'ATK' },
    note: 'Reminiscence-state Basic ATK replacement; considered Basic Attack DMG regardless of mode (real dump text: "considered Basic Attack DMG regardless of mode" — the ONE dual-mode move that is NOT mode-dependent, so unlike Clear As Day/Oblivion/Letting It Go it correctly has no Echo-mode sibling). Consumes her 3 Photos as it goes (see lucilla.basic.oblivion below).',
  },
  {
    id: 'lucilla.basic.oblivion',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Tracing Forms Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 2026-09-07 cross-character reactivity: real, sourced "Glacio Chafe mode: considered Basic
    // Attack DMG, inflicts 1 Glacio Chafe stack" (Data dump line 78) — see lucilla.intro.clip-it's
    // own comment. One tag per cast (this block already condenses 3 real Oblivion hits into one
    // cast-triggered block), not per individual Photo consumed.
    appliesTags: [{ tag: 'glacio-chafe' }],
    // Mode-rivalry fix (2026-09-07) — see lucilla.liberation.clear-as-day's own note for why an
    // Echo-mode sibling (lucilla.basic.oblivion-echo below) is required, not optional documentation.
    condition: { requiresStance: 'Glacio Chafe mode' },
    // 3 separate Oblivion hits, one per Photo consumed during Tracing Forms (a full 3-Photo
    // Reminiscence reliably hits all 3, same "use the max case" convention as this table's S6).
    damage: { hits: [{ atkPct: 285.48 }, { atkPct: 285.48 }, { atkPct: 285.48 }], category: 'basicDmg', basis: 'ATK' },
    note: 'Glacio Chafe mode: considered Basic Attack DMG, inflicts Glacio Chafe.',
  },
  {
    id: 'lucilla.basic.oblivion-echo',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Tracing Forms Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    condition: { requiresStance: 'Echo mode' },
    damage: { hits: [{ atkPct: 285.48 }, { atkPct: 285.48 }, { atkPct: 285.48 }], category: 'echoDmg', basis: 'ATK' },
    note: 'Echo-mode sibling of lucilla.basic.oblivion (see its own note) — same 285.48%×3 value, considered Echo Skill DMG instead (each cast counted as a different Echo Skill); does NOT inflict Glacio Chafe in this mode (that\'s a Chafe-mode-only side effect), so no appliesTags here.',
  },
  {
    id: 'lucilla.basic.letting-it-go',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Letting It Go' },
    timing: {}, target: { scope: 'self' }, effects: [],
    condition: { requiresStance: 'Glacio Chafe mode' },
    damage: { hits: parseSkillMultiplierHits('84.81%×3+593.64%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Interruption-immune AoE finisher, fully restores Concerto Energy, ends Reminiscence. Glacio Chafe mode: considered Basic Attack DMG.',
  },
  {
    id: 'lucilla.basic.letting-it-go-echo',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Letting It Go' },
    timing: {}, target: { scope: 'self' }, effects: [],
    condition: { requiresStance: 'Echo mode' },
    damage: { hits: parseSkillMultiplierHits('84.81%×3+593.64%'), category: 'echoDmg', basis: 'ATK' },
    note: 'Echo-mode sibling of lucilla.basic.letting-it-go (see its own note) — same value, considered Echo Skill DMG instead.',
  },

  // Added 2026-09-07 (full-kit completeness re-pass): 7 real, sourced SKILL_MULTIPLIERS rows with no
  // block anywhere in this file — none used in her modeled CHARACTER_ROTATIONS (which enters
  // Reminiscence on the Liberation cast and never lands a pre-Reminiscence Basic ATK/Mid-air/Dodge
  // Counter, the base (non-Spotlight) Skill release, or a Reminiscence-state Mid-air/Dodge Counter),
  // same "add unused base kit for completeness" convention already used for Encore/Camellya/Hiyuki/
  // Iuno earlier this session.
  {
    id: 'lucilla.basic.snapshot',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Snapshot Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Commendable (Perfect Focus) variant used as the representative value, matching the row's own
    // "hold for a stronger finisher" framing and this file's own precedent of using the stronger/
    // canonical variant when a row names alternatives (see lucilla.skill.spotlight above).
    damage: { hits: parseSkillMultiplierHits('59.29% → 26.89%+40.34% → 235.27%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Standard combo before entering Reminiscence; not reclassified — plain Basic ATK DMG. Unused in the modeled rotation, which enters Reminiscence on the Liberation cast.',
  },
  {
    id: 'lucilla.midair.attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('86.29%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Unused in the modeled rotation.',
  },
  {
    id: 'lucilla.dodgecounter.standard',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('67.83%+82.90%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Unused in the modeled rotation.',
  },
  {
    id: 'lucilla.skill.phantom-frame-compensate',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Phantom Frame' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Phantom Frame / Compensate / Spotlight' has 3 alternative values — the Compensate variant
    // (early/missed release) is used here as the representative non-Spotlight value; Phantom Frame
    // itself (13.26%x3) is the un-held tap-cast, folded into the row's base name.
    damage: { hits: parseSkillMultiplierHits('249.07%'), category: 'skillDmg', basis: 'ATK' },
    note: 'An early/missed Focus Ring release triggers Compensate (reduces Skill CD by 8s, chains into Basic Attack Stage 2) instead of the perfect-timed Spotlight (lucilla.skill.spotlight above). Unused in the modeled rotation, which always lands the perfect release.',
  },
  {
    id: 'lucilla.basic.midair-reminiscence',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Mid-air Attack - Reminiscence' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('110.94%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Reminiscence-state Mid-air Attack replacement, chains into Tracing Forms Stage 2. Unused in the modeled rotation (no mid-air segment).',
  },
  {
    id: 'lucilla.basic.dodge-counter-reminiscence',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Dodge Counter - Reminiscence' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('115.55%+141.22%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Reminiscence-state Dodge Counter replacement, chains into Tracing Forms Stage 3. Unused in the modeled rotation.',
  },
  {
    id: 'lucilla.intro.clip-it-hard-cut',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Clip It: Hard Cut' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('149.41%'), basis: 'ATK' },
    note: 'Replaces Clip It while already in Reminiscence. Unused in the modeled rotation, which swaps in from neutral (Reminiscence is not yet active on Intro).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE, plus a real Liberation self-buff sourced from
  //    CHARACTER_ROTATIONS' own note text — entirely missing from CHAR_BUFF_TABLE['Lucilla'].selfBuffs) ──
  {
    id: 'lucilla.outro.montage-chafe',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    condition: { element: 'glacio', requiresStance: 'Glacio Chafe mode' },
    effects: [{ stat: 'elemDmg', value: 60, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Glacio Chafe mode: Amplifies Glacio Chafe DMG near the active Resonator by +60% for 30s (persists through the swap) — modeled team-wide since Chafe DMG isn\'t a separate category.',
  },
  {
    id: 'lucilla.outro.montage-echo',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { requiresStance: 'Echo mode' },
    effects: [{ stat: 'echoDmg', value: 50, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Echo mode: grants the incoming Resonator +50% Echo Skill DMG Amp for 14s (lost if they swap off, not modeled) — mutually exclusive with the Chafe-mode block above.',
  },
  {
    id: 'lucilla.selfbuff.clear-as-day-bonus',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Liberation:Clear As Day' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    condition: { requiresStance: 'Glacio Chafe mode' },
    effects: [{ stat: 'basicDmg', value: 30, source: 'self-kit' }],
    note: "Real effect sourced from CHARACTER_ROTATIONS' own Liberation step note: +30% Basic ATK DMG Bonus for 10s in Glacio Chafe mode — this was entirely absent from CHAR_BUFF_TABLE['Lucilla'].selfBuffs before this read. Mode-rivalry fix (2026-09-07): now paired with lucilla.selfbuff.clear-as-day-bonus-echo below via requiresStance, same fix class as the 4 dual-mode damage blocks above.",
  },
  {
    id: 'lucilla.selfbuff.clear-as-day-bonus-echo',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Liberation:Clear As Day' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    condition: { requiresStance: 'Echo mode' },
    effects: [{ stat: 'echoDmg', value: 30, source: 'self-kit' }],
    note: 'Echo-mode sibling of lucilla.selfbuff.clear-as-day-bonus (see its own note) — same +30% value, Echo Skill DMG Bonus instead of Basic ATK DMG Bonus.',
  },
  {
    id: 'lucilla.debuff.inherent-skill-resshred',
    source: SOURCE, kind: 'debuff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 30 },
    target: { scope: 'all-enemies' },
    condition: { element: 'glacio' },
    effects: [{ stat: 'resShred', value: 8 }],
    note: 'Inherent Skill Slow Motion, Glacio Chafe mode, on casting Spotlight: Glacio RES Shred -8% for 30s.',
  },
  {
    id: 'lucilla.buff.inherent-skill-echo-teamdmg',
    source: SOURCE, kind: 'buff', section: 'Buff',
    // Added Phase A audit (2026-09-04): CHAR_BUFF_TABLE['Lucilla'].selfBuffs was missing this
    // Inherent Skill Slow Motion Echo-mode branch entirely (see that file's own audit comment on
    // this same read) — team +25% Echo Skill DMG Bonus for 30s on casting Spotlight in Echo mode,
    // mutually exclusive with the Chafe-mode resShred debuff above.
    trigger: { type: 'passive' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    condition: { requiresStance: 'Echo mode' },
    effects: [{ stat: 'echoDmg', value: 25, source: 'self-kit' }],
    note: 'Inherent Skill Slow Motion, Echo mode, on casting Spotlight: team +25% Echo Skill DMG Bonus for 30s. Ends early on mode switch (not modeled) — mutually exclusive with lucilla.debuff.inherent-skill-resshred.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 audit comment for
  //    each node's real mechanic; S3/S5/S6 all buff BOTH Letting It Go and Oblivion, so kept passive
  //    rather than scoped to one specific cast) ──
  {
    id: 'lucilla.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: { duration: 10 }, // sourced from CHAR_BUFF_TABLE's own selfBuffs entry for this same node
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 20, source: 'self-kit' }],
    note: 'Confirmed exact value, 10s duration per CHAR_BUFF_TABLE\'s own selfBuffs entry for this node — no specific cast anchor sourced, kept passive.',
  },
  {
    id: 'lucilla.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'echoDmg', value: 40, source: 'self-kit' }],
    note: 'Glacio Chafe DMG Amp +80% in Glacio Chafe mode OR team Echo Skill DMG Bonus +40% in Echo mode — only the Echo-mode branch has a matching schema category (echoDmg), modeled here; the Glacio-Chafe-mode branch (Glacio Chafe DMG Amp, not a plain elemDmg buff) has no matching category, not modeled.',
  },
  {
    id: 'lucilla.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // scopedToBlockId added Phase A audit (2026-09-04): this was an unscoped basicDmg/echoDmg
    // category buff, the exact same bug class already fixed for Jiyan's S6 (see that file's own
    // audit comment) and flagged in the Phase A task brief — a category-wide buff means
    // resolveHitComposedDps.js's statsAtInstant() applies it to EVERY basicDmg/echoDmg-category hit
    // in the kit, not just the one move S3's own kit text names ("Letting It Go's DMG Multiplier
    // +100%"). Without scoping, this was silently inflating lucilla.basic.tracing-forms,
    // lucilla.basic.oblivion, and lucilla.liberation.clear-as-day (all basicDmg-category) in
    // addition to its real target. Fixed by scoping to lucilla.basic.letting-it-go only.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'basicDmg', value: 100, scopedToBlockId: 'lucilla.basic.letting-it-go', source: 'self-kit' },
      { stat: 'echoDmg', value: 100, scopedToBlockId: 'lucilla.basic.letting-it-go-echo', source: 'self-kit' },
    ],
    note: "Letting It Go's own DMG Multiplier +100% (recategorized from libDmg to {basicDmg, echoDmg} per the re-audit — its own move text makes damage type mode-dependent, never Liberation-type despite being part of the Liberation combo). Each key scoped to its own mode's block (2026-09-07 mode-rivalry fix: previously both keys pointed at the same Chafe-mode block id, which meant the echoDmg key scoped to a basicDmg-category block and could never actually match any hit — a real dead-effect bug, not just an over-crediting one). Kept passive so it applies whenever the matching block fires, without leaking to the rest of the kit.",
  },
  {
    // value fixed 2026-09-08 (roster-wide sweep for the Augusta S1/S2 bug class): `stacking`/`maxStacks`
    // on a `trigger.type: 'passive'` block is dead metadata in every resolver path (only a real
    // duration-based buff window ever reads it — see resolveHitComposedDps.js's `passiveBlocks` loop,
    // which always calls `applyEffects(block, 1, ...)`). Was silently delivering only 10% (1 stack)
    // instead of the "confirmed exact" 30% (3 stacks) this note already documented. Root-caused by
    // writing the confirmed 3-stack total directly.
    id: 'lucilla.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 30, source: 'self-kit' }],
    note: 'ATK +10%/stack up to 3 stacks (+30% max, confirmed exact) — now modeled flat since passive-trigger stacking metadata was dead (see fix comment above).',
  },
  {
    id: 'lucilla.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // scopedToBlockId added Phase A audit (2026-09-04): same unscoped-category-buff bug as S3
    // above — S5's kit text names Oblivion specifically ("Oblivion's DMG Multiplier +50%"), but an
    // unscoped basicDmg/echoDmg buff was leaking onto lucilla.basic.tracing-forms,
    // lucilla.basic.letting-it-go, and lucilla.liberation.clear-as-day too. Scoped to
    // lucilla.basic.oblivion only.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'basicDmg', value: 50, scopedToBlockId: 'lucilla.basic.oblivion', source: 'self-kit' },
      { stat: 'echoDmg', value: 50, scopedToBlockId: 'lucilla.basic.oblivion-echo', source: 'self-kit' },
    ],
    note: "Oblivion's own DMG Multiplier +50% (recategorized per the re-audit, same dual-key non-double-counting pattern as S3). Each key scoped to its own mode's block (2026-09-07 mode-rivalry fix, same dead-effect bug class as S3 — see its own note) — kept passive so it applies whenever the matching block fires.",
  },
  {
    id: 'lucilla.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // scopedToBlockId added Phase A audit (2026-09-04): same unscoped-category-buff bug as S3/S5
    // above — S6's kit text names Letting It Go specifically ("increases Letting It Go's DMG to the
    // target by 200%, up to 600% at max"), but an unscoped basicDmg/echoDmg buff was leaking onto
    // lucilla.basic.tracing-forms, lucilla.basic.oblivion, and lucilla.liberation.clear-as-day too
    // (a massive overcount at S6, since 600% is by far the largest bonus in this file). Scoped to
    // lucilla.basic.letting-it-go only.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'basicDmg', value: 600, scopedToBlockId: 'lucilla.basic.letting-it-go', source: 'self-kit' },
      { stat: 'echoDmg', value: 600, scopedToBlockId: 'lucilla.basic.letting-it-go-echo', source: 'self-kit' },
    ],
    note: "Each Photo consumed in Reminiscence grants 1 Remembrance stack (max 3, +200%/stack) on Letting It Go — a full 3-Photo Reminiscence reliably hits max, using the max value +600% (recategorized per the re-audit, same dual-key non-double-counting pattern as S3). Each key scoped to its own mode's block (2026-09-07 mode-rivalry fix, same dead-effect bug class as S3 — see its own note), kept passive.",
  },
  // Added 2026-09-07/08 (full-kit cross-interaction audit, direct user correction: "i said all cross
  // interactions, condition and logic between inside the kit" — and, after an initial pass wrongly
  // called Film Roll unrepresentable, "you sure isn't representable?"): two real, sourced Forte
  // Circuit resources — Film Roll and Zoom (Data dump/Lucilla/Lucilla.md line 73-79) — had NO
  // representation anywhere (not CHAR_BUFF_TABLE, not a block), the same class of gap the S1/S2/S4
  // chain audit already covered for Resonance Chain but never applied to her Forte Circuit's own
  // passives.
  //
  // Film Roll (Chafe mode, gained via Déjà Vu on casting Clear As Day: 4 stacks/30s, 10 with Inherent
  // Skill Remembrance): consumes 1 stack whenever ANOTHER active teammate inflicts Glacio Chafe, to
  // make Lucilla herself inflict Glacio Chafe 2x more on nearby targets. The first pass here declared
  // this unrepresentable because the engine's cross-character reactivity (actionTags) was a per-step
  // BOOLEAN Set — a second application within the same step was a genuine no-op, no distinct number to
  // compute. That was a real engine LIMITATION, not a fact about the mechanic itself, so on
  // re-challenge it was fixed at the root instead of accepted: rotationSimulator.js now ALSO tracks a
  // parallel per-tag COUNT (`actionTagCounts`) alongside the unchanged boolean Set, and a new
  // `trigger.requiresOtherOwner` flag (block.schema.js) lets a block react only to another owner's own
  // application — exactly Film Roll's own "another active teammate" gate. See
  // rotationSimulator.js's own "Reactive self-application" comment and triggerEngine.js's
  // actionCountOf() for the full mechanism; every other roster-wide ally-action consumer
  // (Cartethyia/Galbrena/Sigrika/Qingxiao/Luukherssen, plus Hiyuki's own Glacio Bite) is unaffected
  // since they only ever check tag PRESENCE, never a count.
  {
    id: 'lucilla.buff.forte-film-roll',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'ally-action', action: 'glacio-chafe', requiresOtherOwner: true },
    timing: {}, target: { scope: 'self' }, effects: [],
    condition: { requiresStance: 'Glacio Chafe mode' },
    // Film Roll's own payoff IS the extra application, not a separate damage/buff value — re-applies
    // the same tag it reacted to, crediting Lucilla with a second real instance of Glacio Chafe that
    // any OTHER team member's own ally-action-reactive block (e.g. Hiyuki's Glacio Bite) now counts via
    // actionCountOf() instead of collapsing to the same single boolean as one application.
    appliesTags: [{ tag: 'glacio-chafe' }],
    note: 'Forte Circuit Film Roll (Chafe mode, gained via Déjà Vu on casting Clear As Day: 4 stacks/30s, cap raised to 10 by Inherent Skill Remembrance — assumed active/banked, same convention as every other Inherent-Skill/stack-cap assumption in this file): consumes 1 stack whenever another active teammate inflicts Glacio Chafe, to inflict Glacio Chafe 2x more herself on nearby targets. `requiresOtherOwner` enforces the real "ANOTHER active teammate" gate — this must never fire off Lucilla\'s own Clip It/Spotlight/Oblivion casts, only a genuine ally\'s.',
  },
  {
    id: 'lucilla.buff.forte-zoom',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Skill:Spotlight' },
    timing: { duration: 30 },
    target: { scope: 'self' },
    condition: { requiresStance: 'Echo mode' },
    // Zoom's own value scoped to exactly the 4 Echo-mode (echoDmg-category) blocks in this file — an
    // unscoped critDmg buff would (per this session's own Hiyuki chain audit finding) inflate every hit
    // in the kit regardless of category, since critDmg isn't category-gated by the damage formula
    // (calcAvgCrit takes a flat cr/cd, not a per-category one — see engine/math/damageFormula.js).
    effects: [{ stat: 'critDmg', value: 40, scopedToBlockId: [
      'lucilla.liberation.clear-as-day-echo',
      'lucilla.basic.oblivion-echo',
      'lucilla.basic.letting-it-go-echo',
    ], source: 'self-kit' }],
    note: 'Forte Circuit Zoom (Echo mode, gained via Déjà Vu on casting Clear As Day: 1 stack/30s, cap raised to 4 by Inherent Skill Remembrance — assumed active/maxed, same convention as Minor Fortes and every other Inherent Skill in this file): each stack grants the active Resonator\'s Echo Skill +10% Crit DMG — modeled at the 4-stack max (+40%), anchored to the same Spotlight cast that unlocks Zoom\'s generation path in the modeled rotation. Scoped to her own 3 Echo-mode damage blocks (Tracing Forms Stage 1-3 is excluded — its own move text says "considered Basic Attack DMG regardless of mode", never Echo Skill DMG, so Zoom\'s own "Echo Skill" gate never covers it).',
  },
  // Added 2026-09-07 (completeness pass): Minor Fortes had no block anywhere in this file.
  // Inherent Skill Remembrance (Film Roll cap -> 10, Zoom cap -> 4, both consumption base amounts
  // doubled) is pure resource-cap/economy utility with zero DPS component of its own — correctly has
  // no block, same reasoning already used for Iuno's S4/Waxing Ascent.
  {
    id: 'lucilla.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 8, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Crit Rate+8%, ATK%+12% (Data dump/Lucilla/Lucilla.md line 100-102). Unconditional, always active.',
  },
];
