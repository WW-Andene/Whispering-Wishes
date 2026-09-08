// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/galbrena.blocks.js
// Galbrena converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Galbrena'], RESONANCE_CHAIN_DATA['Galbrena'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Galbrena'], and CHARACTER_ROTATIONS['Galbrena']. No new numbers
// invented. Afterflame (the shared stacking mechanic behind both her S1 and her
// debuff) is gained from ANY team Resonator's Echo Skill cast, not her own —
// a cross-character trigger this schema has no clean anchor for, documented
// rather than force-fit to one of her own casts.
//
// Completeness pass 2026-09-07 (continuing the same character-by-character pass): Minor Fortes
// (Crit DMG+16%, ATK%+12%) had no block at all. Also found both Inherent Skills entirely
// unmodeled. Sin Feaster (STA regen on specific casts) is pure resource-economy utility, added as
// documented-inert. Oathbound Hunt is genuinely ambiguous, not modeled: its own real text amplifies
// "Normal Attack/Skill/Forte/Liberation/Intro/Outro DMG" — the game's standard button-press DMG
// Bonus category names — but conspicuously does NOT list Heavy Attack or Echo Skill DMG, the two
// categories her ENTIRE real kit is overridden into (every SKILL_MULTIPLIERS row is "considered
// Heavy Attack DMG" or "considered Echo Skill DMG" despite the button pressed). Whether this is a
// deliberate design choice (Oathbound Hunt genuinely doesn't buff her own damage) or an incomplete
// enumeration in the source is not determinable from the dump alone — modeling it either way would
// be a guess, so it's documented as an open question rather than force-fit as either a real buff or
// a confirmed no-op.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Galbrena';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const GALBRENA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS — every row is "considered Heavy Attack DMG" or
  //    "considered Echo Skill DMG" despite the button/type used to cast it) ──
  {
    id: 'galbrena.intro.hellflare-overload',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Hellflare Overload' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category/basis added during Layer 4 migration: was uncategorized, silently rejecting Resonance
    // Skill DMG Bonus. No override text names a different category, same default-to-skillDmg convention
    // as Aalto/Calcharo/Encore/Denia's own Intro blocks.
    damage: { hits: parseSkillMultiplierHits('94.12%'), basis: 'ATK' },
  },
  {
    id: 'galbrena.heavy.basic-attack-stage2',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Basic Attack Stage 2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('26.31%×2+78.91%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Threshold State combo, builds Sinflame (skips the weak Stage 1 per the rotation).',
  },
  {
    id: 'galbrena.heavy.basic-attack-stage3',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Basic Attack Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('28.60%×2+42.89%×2'), category: 'heavyDmg', basis: 'ATK' },
  },
  {
    id: 'galbrena.echo.basic-attack-stage4',
    source: SOURCE, kind: 'damage', section: 'Echo',
    trigger: { type: 'cast', on: 'Echo:Basic Attack Stage 4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('177.86%'), category: 'echoDmg', basis: 'ATK' },
  },
  {
    id: 'galbrena.heavy.ascent-of-malice',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Ascent of Malice' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('51.57%×2'), category: 'heavyDmg', basis: 'ATK' },
    note: 'At max Sinflame — enters Demon Hypostasis, endlag cancelled on hit by the Echo (Hellfire Absolution).',
  },
  {
    id: 'galbrena.echo.hellfire-absolution',
    source: SOURCE, kind: 'damage', section: 'Echo',
    trigger: { type: 'cast', on: 'Echo:Hellfire Absolution' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('110.90%+90.74%×11'), category: 'echoDmg', basis: 'ATK' },
    note: 'Ultimate barrage — also grants +85% DMG Mult to Demon Hypostasis attacks for 14s (see galbrena.selfbuff.demon-hypostasis-amp below).',
  },
  {
    id: 'galbrena.heavy.seraphic-execution-stage2',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Seraphic Execution Stage 2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('27.84%×2+83.51%'), category: 'heavyDmg', basis: 'ATK' },
  },
  {
    id: 'galbrena.heavy.seraphic-execution-stage3',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Seraphic Execution Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('24.32%×3+170.21%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Dodge Counter (Purgatory Scourge) can substitute here for higher DMG and Forte if the enemy attacks — not separately modeled (rotation uses this path).',
  },
  {
    id: 'galbrena.echo.seraphic-execution-stage4',
    source: SOURCE, kind: 'damage', section: 'Echo',
    trigger: { type: 'cast', on: 'Echo:Seraphic Execution Stage 4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('18.15%×3+127.02%'), category: 'echoDmg', basis: 'ATK' },
  },
  {
    id: 'galbrena.echo.seraphic-execution-stage5',
    source: SOURCE, kind: 'damage', section: 'Echo',
    trigger: { type: 'cast', on: 'Echo:Seraphic Execution Stage 5' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('67.28%+156.99%'), category: 'echoDmg', basis: 'ATK' },
    note: 'Demon Hypostasis combo finisher.',
  },
  {
    id: 'galbrena.outro.ashen-pursuit',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category/basis added during Layer 4 migration: pure-damage swap-out finisher, same outroDmg shape
    // already used for Encore's Thermal Field / Rover: Havoc's Soundweaver / Calcharo's Shadowy Raid.
    damage: { hits: parseSkillMultiplierHits('79.50%×3+556.50%'), basis: 'ATK' },
    note: 'Pure-damage swap-out finisher; no team buff, so she\'s free to quickswap.',
  },

  // ── Buff/debuff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'galbrena.selfbuff.demon-hypostasis-amp',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Echo:Hellfire Absolution' },
    timing: { duration: 14 },
    target: { scope: 'self' },
    effects: [{ stat: 'allDmg', value: 85, source: 'self-kit' }],
    note: "+85% DMG Mult to Demon Hypostasis attacks on Hellfire Absolution cast — CHAR_BUFF_TABLE describes this loosely as 'Liberation cast', but Hellfire Absolution (her Echo-slot ultimate barrage) is the real cast this scales off per SKILL_MULTIPLIERS' own note text, used directly instead.",
  },
  // Retargeted 2026-09-08 (full re-audit): was ONE block with `trigger:{type:'passive'}` PLUS
  // `timing:{duration:4}` — a real, previously-unflagged instance of the "duration is dead metadata
  // on a passive trigger" bug class already found and fixed on Baizhi/Brant/Ciaccona/Denia this
  // session (`passiveBlocks` in resolveHitComposedDps.js filters ONLY on `trigger.type === 'passive'`
  // and always applies at multiplier 1, completely ignoring `timing.duration`). Measured directly: with
  // the old shape, this +20% ATK was unconditionally active for the ENTIRE modeled rotation (removing
  // the block dropped total damage by ~9.9% in an isolated test) instead of the real, sourced 4s
  // windows after specific casts — a significant overstatement, not a rounding-level approximation.
  // The real kit text names 7 different triggering casts (Intro/Hellstride/Basic Stage 4/Seraphic
  // Execution equivalent/Encroach/Ascent of Malice/Ravage); this schema's `trigger.on` only accepts
  // ONE cast label per block (no array support for `cast`-type triggers, unlike `ally-action`'s
  // `action` field), so — since Hellstride/Encroach/Ravage are all independently confirmed unused in
  // her real modeled rotation (this dump's own "Unused parts of her kit" callout) — split into 4 real
  // cast-anchored blocks below, one per real trigger cast that DOES occur in CHARACTER_ROTATIONS
  // (Intro, Basic Stage 4, Ascent of Malice, Seraphic Execution Stage 5), each independently
  // `stacking:'refresh'` with the same real 4s duration. Verified directly (via
  // deriveStepsFromRotation's own real step timing) that none of these 4 anchors' windows ever
  // overlap in the current modeled rotation — the closest gaps are 4.5s (just outside the 4s window),
  // so no double-counting risk from 2 separate blocks' windows being simultaneously active. This is a
  // rotation-timing fact, not a schema guarantee — if CHARACTER_ROTATIONS['Galbrena'] is ever edited
  // to place two of these 4 trigger casts closer than 4s apart, this would need re-verification.
  {
    id: 'galbrena.selfbuff.burning-drive-intro',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Intro:Hellflare Overload' },
    timing: { duration: 4 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh', source: 'self-kit' }],
    note: "Burning Drive: +20% ATK for 4s on Intro cast (one of 7 real trigger casts named by the kit text — see retargeting comment above for why only the 4 real-rotation ones each get their own block).",
  },
  {
    id: 'galbrena.selfbuff.burning-drive-basic4',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Echo:Basic Attack Stage 4' },
    timing: { duration: 4 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh', source: 'self-kit' }],
    note: 'Burning Drive: +20% ATK for 4s on Basic Attack Stage 4 cast.',
  },
  {
    id: 'galbrena.selfbuff.burning-drive-ascent',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Ascent of Malice' },
    timing: { duration: 4 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh', source: 'self-kit' }],
    note: 'Burning Drive: +20% ATK for 4s on Ascent of Malice cast.',
  },
  {
    id: 'galbrena.selfbuff.burning-drive-seraphic5',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Echo:Seraphic Execution Stage 5' },
    timing: { duration: 4 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh', source: 'self-kit' }],
    note: "Burning Drive: +20% ATK for 4s on Seraphic Execution Stage 5 cast — the real kit's 'Seraphic Execution equivalent' trigger reference (Stage 5 is her Demon Hypostasis combo finisher, per galbrena.echo.seraphic-execution-stage5's own note).",
  },
  {
    // value fixed 2026-09-08 (roster-wide sweep for the Augusta S1/S2 bug class): `stacking`/`maxStacks`
    // on a `trigger.type: 'passive'` block is dead metadata in every resolver path (only a real
    // duration-based buff window ever reads it — see resolveHitComposedDps.js's `passiveBlocks` loop,
    // always `applyEffects(block, 1, ...)`). Was silently delivering only 1.5% (1 stack) instead of the
    // 60% (40-stack) cap CHAR_BUFF_TABLE['Galbrena'].debuffs[0] already stores for this exact mechanic —
    // kept at that same cap value for consistency with the established table (and with every other
    // block fixed in this same sweep, all of which use their own documented stacking cap), rather than
    // substituting the source's separately-noted realistic-average figure (~36-48%, "rarely maxed") in
    // its place — that estimate is real context for interpreting this number, not a different modeled
    // value the table itself ever adopted.
    id: 'galbrena.debuff.afterflame',
    source: SOURCE, kind: 'debuff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'all-enemies' },
    effects: [{ stat: 'amplify', value: 60, source: 'self-kit' }],
    note: 'Afterflame: DMG Taken +1.5% per stack (up to 40 stacks, 60% cap) while Galbrena is in Demon Hypostasis, cleared when she exits — gained from ANY team Resonator\'s Echo Skill cast (capped once per Echo name), not her own casts, so no CHARACTER_ROTATIONS step of hers anchors the stacking trigger; now modeled flat at the 60% cap since passive-trigger stacking metadata was dead (see fix comment above). Realistically ~36% without Phrolova, ~48% with her, per the source note (rarely maxed at 60%) — a known overstatement caveat, not corrected here for consistency with the table\'s own stored cap value.',
  },
  // Added 2026-09-07 (completeness pass): "Minor Fortes: Crit DMG+16%, ATK%+12%" — a permanent,
  // always-on passive stat bonus, previously had no block anywhere in this file.
  {
    id: 'galbrena.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critDmg', value: 16, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Crit DMG+16%, ATK%+12% (Data dump/Galbrena/Galbrena.md). Unconditional, always active.',
  },
  // Added 2026-09-07 (completeness pass): her 2 Inherent Skills, previously not referenced anywhere
  // in this file.
  {
    id: 'galbrena.inherent.sin-feaster',
    source: SOURCE, kind: 'utility', section: 'Buff',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Sin Feaster — casting Basic Stage 4/Seraphic Execution Stage 5/Volley of Death Stage 3/Flamewing Verdict Stage 3 recovers 10 STA. Pure resource-economy utility, no DPS component to model.',
  },
  {
    id: 'galbrena.inherent.oathbound-hunt',
    source: SOURCE, kind: 'utility', section: 'Buff',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Oathbound Hunt — hits from most of her kit inflict 1 stack of Fated End (cap 4, 5.5s), each stack Amplifying "Normal Attack/Skill/Forte/Liberation/Intro/Outro DMG" by 5%. NOT modeled: see file header — this real text conspicuously omits Heavy Attack/Echo Skill DMG, the two categories her entire real kit is overridden into, and it\'s not determinable from the source whether that\'s deliberate (the buff genuinely doesn\'t reach her own damage) or an incomplete category list. Documented as an open question rather than guessed either way.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic) ──
  {
    // value fixed 2026-09-08 (roster-wide sweep for the Augusta S1/S2 bug class): `stacking`/`maxStacks`
    // on a `trigger.type: 'passive'` block is dead metadata in every resolver path (see the fix comment
    // on galbrena.debuff.afterflame above for the full explanation — same underlying engine limitation
    // and same Afterflame stack source, and same "kept at the table's own cap value for consistency"
    // reasoning). Was silently delivering only 2% (1 stack) instead of the 80% (40-stack) cap
    // RESONANCE_CHAIN_DATA['Galbrena'].s1.critDmg already stores.
    id: 'galbrena.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 80, source: 'self-kit' }],
    note: '+2% Crit DMG per Afterflame stack, up to 80% at 40 stacks — same Afterflame stacking mechanic as galbrena.debuff.afterflame above (gained from any teammate\'s Echo Skill cast, not anchored to a real cast step). Now modeled flat at the 80% cap since passive-trigger stacking metadata was dead — see fix comment above and afterflame\'s own note for the same realistic-average caveat (~36-48% real Afterflame stack range, not corrected here for consistency with the table\'s own stored cap).',
  },
  {
    id: 'galbrena.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 90, source: 'self-kit' }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  {
    id: 'galbrena.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Fixed 2026-09-02: this was ALSO `trigger:{type:'cast', on:'Echo:Hellfire Absolution'}` with no
    // `timing.duration` — the same dead cast-scoped/no-duration `kind:'buff'` no-op shape found on
    // Carlotta's S1/S2 (the engine-architecture history (git log) item 12; matches neither `passiveBlocks`
    // [trigger.type==='passive'] nor `buffWindows` [duration != null] in
    // resolveHitComposedDps.js's statsAtInstant()), so even after fixing its stat (below) it still
    // never applied — proven by a test showing byte-identical totals with/without this block.
    // Converted to `trigger:{type:'passive'}` + `scopedToBlockId` (Augusta's S3 / Carlotta's S2
    // pattern) so it actually fires and stays scoped to only Hellfire Absolution's own hit.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Also fixed: was `stat:'libDmg'` — a real category-gating bug, silently zero-effect regardless
    // of the dead-trigger issue above. Category-specific stats (skillDmg/basicDmg/heavyDmg/libDmg/
    // echoDmg/coordDmg) only apply to hits whose own `damage.category` matches exactly, and
    // `galbrena.echo.hellfire-absolution`'s block above is `category:'echoDmg'`, not `'libDmg'` —
    // RESONANCE_CHAIN_DATA's `s3.libDmg` field name is a legacy "her Liberation-slot node" label
    // (kept as-is, used for display), not a literal damage-category claim. Fixed the engine stat
    // to `echoDmg` to actually apply to the real hit.
    effects: [{ stat: 'echoDmg', value: 130, scopedToBlockId: 'galbrena.echo.hellfire-absolution', source: 'self-kit' }],
    note: "Real scope: Hellfire Absolution's own DMG Multiplier +130% (her Echo-slot ultimate).",
  },
  {
    id: 'galbrena.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Fixed 2026-09-02: was `target:{scope:'self'}` — the pasted kit text is explicit this is
    // team-wide: "When Resonators in the team cast Echo Skill, all Resonators in the team gain 20%
    // all-Attribute DMG Bonus for 20s." CHAR_BUFF_TABLE's "no team support kit" note describes her
    // base-kit selfBuffs, not this Resonance Chain node — S1-S6 aren't in CHAR_BUFF_TABLE at all, so
    // that note never actually covered S4. Fixed scope to whole-team.
    // Retrofitted 2026-09-03 (ally-action backlog, REMAINING_WORK.md 1a): the real trigger (ANY
    // teammate's Echo Skill cast) previously had no clean anchor and was left passive/unconditional —
    // but this is exactly the same "any teammate casts Echo Skill" shape Sigrika's chain.s4 already
    // uses the universal 'echo-skill-cast' action tag for (fires directly off any step's own
    // {type:'Echo'} shape, not a per-character kit fact). No new tag needed, just wiring this node to
    // the same existing mechanism. Distinct from her own Afterflame mechanic below, which stays
    // deferred — Afterflame's real cap is per-Echo-NAME (not per-cast), a dedup shape this tag can't
    // express without fabricating which specific Echo names a team runs.
    trigger: { type: 'ally-action', action: 'echo-skill-cast' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Real mechanic: any teammate casting Echo Skill grants the WHOLE TEAM +20% all-Attribute DMG Bonus for 20s.',
  },
  {
    id: 'galbrena.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Heavy ATK:Ascent of Malice' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 150, source: 'self-kit' }],
    note: "DMG Multiplier of Encroach/Ascent of Malice/Ravage +150% (corrected skillDmg -> heavyDmg per the re-audit, all three are 'considered Heavy Attack DMG' despite the Resonance Skill slot) — cast-scoped to Ascent of Malice, the variant used in her real rotation.",
  },
  {
    id: 'galbrena.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Fixed 2026-09-02: added a 2nd `echoDmg` effect. The kit text names Seraphic Execution and
    // Flamewing Verdict as WHOLE moves ("the DMG Multipliers of Basic Attack - Seraphic Execution,
    // Heavy Attack - Flamewing Verdict, ... are additionally increased by 60%"), but SKILL_MULTIPLIERS
    // categorizes their own Stage 4/5 (Seraphic Execution) and Stage 3 (Flamewing Verdict) as
    // `echoDmg`, not `heavyDmg` — a single `heavyDmg` effect silently missed those stages entirely
    // (category-gated stats only apply to matching-category hits). Both effects target the same 4
    // named moves' real damage.category split.
    effects: [
      { stat: 'heavyDmg', value: 60, source: 'self-kit' },
      { stat: 'echoDmg', value: 60, source: 'self-kit' },
    ],
    note: "DMG Multiplier of the 4 Demon Hypostasis moves (Seraphic Execution, Flamewing Verdict, Hellsent Barrage, Purgatory Scourge) +60%, split across both real damage.category tags those moves carry (heavyDmg for most stages, echoDmg for Seraphic Execution Stage 4/5 and Flamewing Verdict Stage 3) — kept passive, applies whenever those blocks above fire. Additional conditional layer modeled separately below (galbrena.selfbuff.ascent-fusion-amp).",
  },
  {
    // Added 2026-09-03: Ascent of Malice consuming Afterflame stacks grants up to +35% Fusion DMG
    // Amp — scales with the same Afterflame stack count already approximated passively elsewhere in
    // this file (galbrena.debuff.afterflame/galbrena.chain.s1), so kept at its real sourced cap value
    // as a passive approximation, matching that same established convention rather than inventing a
    // new per-stack consumption trigger this schema doesn't track.
    id: 'galbrena.selfbuff.ascent-fusion-amp',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Ascent of Malice' },
    condition: { element: 'fusion' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 35, source: 'self-kit' }],
    note: 'Ascent of Malice consuming Afterflame grants up to +35% Fusion DMG Amp (capped value, scales with consumed Afterflame stacks) — cast-scoped to Ascent of Malice.',
  },
];
