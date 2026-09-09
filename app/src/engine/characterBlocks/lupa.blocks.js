// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lupa.blocks.js
// [CHARACTER · LUPA] Lupa's TriggerBlock set — Layer 4 of the engine rewrite,
// migrated onto the single canonical schema (block.schema.js). Sourced from
// characters.js's already-audited CHAR_BUFF_TABLE['Lupa'], RESONANCE_CHAIN_DATA
// ['Lupa'] (+ its own detailed 2026-09-01 re-audit comment, read directly for each
// node's real mechanic), SKILL_MULTIPLIERS['Lupa'], and CHARACTER_ROTATIONS['Lupa'].
// No new numbers invented. S3 (Nowhere to Run!) stays correctly inert: reaching Wild
// Hunt needs 2 TEAMMATE Intro casts within Pack Hunt's window, which her own
// solo-modeled CHARACTER_ROTATIONS (only her own steps) has no way to reach — same
// class as Jiyan's S6/Finale and Lumi's S5/Laser in earlier batches.
//
// Corrected 2026-09-02 against a fresh the source dump: S4 (Dance With the Wolf:
// Climax) was ALSO wrongly treated as inert — but unlike S3, this one only
// depends on Lupa's OWN Burning Matchpoint state (entered via her own Foebreaker
// cast, already a real step in her rotation), no teammate dependency at all. The
// dump proves the real bug was CHARACTER_ROTATIONS itself naming the wrong move
// (the base 'Dance With the Wolf', not the Climax upgrade her rotation actually
// casts) — fixed there and here together; see lupa.liberation.dance-with-the-
// wolf-climax's own note below.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Lupa';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const LUPA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'lupa.intro.try-focusing-eh',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Try Focusing, Eh?' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-02: the dump's own multiplier row labels this move's damage generically "Skill
    // Damage" — contrast with Nowhere to Run! (same Intro Skill section) whose row is instead named
    // after the MOVE itself ("Nowhere to Run! DMG"), paired with explicit prose "considered Resonance
    // Liberation DMG". the source's own convention: a move-specific row name flags a non-default category
    // (called out in prose); the generic "Skill Damage" label means plain Resonance Skill DMG, no prose
    // override needed. Missed this signal on the first pass — corrected to skillDmg.
    damage: { hits: parseSkillMultiplierHits('29.76%+42.16%×4'), category: 'skillDmg', basis: 'ATK' },
  },
  {
    id: 'lupa.liberation.fire-kissed-glory',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Fire-Kissed Glory' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('820.44%'), category: 'libDmg', basis: 'ATK' },
    note: 'Ultimate nuke that also grants the team Pack Hunt/Glory buffs (see lupa.libbuff.pack-hunt and lupa.debuff.glory below) and enables Wild Hunt.',
  },
  {
    id: 'lupa.skill.foebreaker',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Foebreaker' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('304.46%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Consumes all Wolflame, enters Burning Matchpoint.',
  },
  {
    id: 'lupa.midair.attack-stage1-2',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Attack Stage 1-2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('76.73% → 77.23%+19.31%×4'), category: 'basicDmg', basis: 'ATK' },
    note: "Builds toward Firestrike. Fixed 2026-09-02: WuWa's own general mechanic (Mid-air/Plunging Attacks inherit Basic ATK or Heavy ATK DMG, never their own type) plus the dump's own kit structure — listed under \"Basic Attack — Flaming Star\", not Heavy Attack — confirms basicDmg. Note the contrast with Mid-air Attack STAGE 3, which gets explicitly REPLACED by Firestrike (its own block, lupa.heavy.firestrike, correctly heavyDmg) — the base Stage 1-2 combo modeled here stays basicDmg.",
  },
  {
    id: 'lupa.heavy.firestrike',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Firestrike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('28.48%×2'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Replaces Mid-air Attack Stage 3 at 50+ Wolflame; considered Heavy ATK DMG. Consumes 50 Wolflame, grants 1 Wolfaith.',
  },
  {
    id: 'lupa.heavy.wolfs-claw',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: "Heavy ATK:Wolf's Claw" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('72.15%+18.04%×4+96.19%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Replaces Heavy ATK at 50+ Wolflame and 1+ Wolfaith; consumes 50 Wolflame, grants 1 more Wolfaith.',
  },
  // Fixed 2026-09-02 against a fresh the source dump: this block was anchored to the BASE 'Dance With the
  // Wolf' cast (56.02%+42.02%×4+336.11%, ~672% total) — matching CHARACTER_ROTATIONS['Lupa'] as it was
  // previously written, which this file's own prior header comment explicitly (and, it turns out,
  // wrongly) treated as authoritative. The dump proves CHARACTER_ROTATIONS itself was the actual bug:
  // her real modeled rotation ALWAYS casts the enhanced 'Dance With the Wolf: Climax' instead
  // (75.63%+56.72%×4+453.75%, ~1256% total, nearly double) since Foebreaker (2 steps earlier in her
  // real rotation) already puts her in Burning Matchpoint — Climax's own real cast condition. Renamed
  // this block's id/trigger/value to match. This also un-inerts lupa.chain.s4's own +125% Climax DMG
  // Multiplier buff below, which was already correctly anchored to the Climax cast label and simply had
  // nothing to scope onto before now.
  {
    id: 'lupa.liberation.dance-with-the-wolf-climax',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Dance With the Wolf: Climax' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('75.63%+56.72%×4+453.75%'), category: 'libDmg', basis: 'ATK' },
    note: 'Forte finisher at 2 Wolfaith while in Burning Matchpoint, consumes both Wolfaith, removes Burning Matchpoint; considered Resonance Liberation DMG. Always the variant her real rotation uses — the weaker base Dance With the Wolf (no Burning Matchpoint requirement) is never actually cast in her modeled rotation per the source dump\'s own text.',
  },
  // Added 2026-09-09 (full-kit audit, completeness pass): a real, sourced SKILL_MULTIPLIERS row with
  // no block anywhere in this file — same "add unused base kit for completeness" convention already
  // used for Lucy/Lucilla's own unused-in-rotation rows. Genuinely unreachable in the modeled
  // rotation (requires Wild Hunt, which needs 2 TEAMMATE Intro casts within Pack Hunt's window — her
  // solo-modeled CHARACTER_ROTATIONS has no way to reach it, same class as Jiyan's S6/Finale), so this
  // block is present but inert here — chain.s3's own cast-scoped buff (below) now has a real block to
  // scope onto if a future team-aware rotation ever fires it.
  {
    id: 'lupa.liberation.nowhere-to-run',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Nowhere to Run!' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('793.57%+49.60%×4'), category: 'libDmg', basis: 'ATK' },
    note: 'Replaces the next Intro Skill only in Wild Hunt state (2 teammate Intro casts within Pack Hunt\'s window); considered Resonance Liberation DMG; removes Pack Hunt/Glory on cast (not modeled). Unused in the modeled rotation — see this file\'s header comment.',
  },
  {
    id: 'lupa.outro.stand-by-me-warrior',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { element: 'fusion' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh', source: 'teammate-ally-action' },
      { stat: 'basicDmg', value: 25, stacking: 'refresh', source: 'teammate-ally-action' },
    ],
    note: 'Swap-out buff to the next Resonator; no direct DMG.',
  },

  // ── Buff/debuff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'lupa.libbuff.pack-hunt',
    source: SOURCE, kind: 'buff', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Fire-Kissed Glory' },
    timing: { duration: 35 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 6, stacking: 'stacking', maxStacks: 3, source: 'self-kit' }],
    note: 'Pack Hunt: 6% base ATK +6%/Intro cast, up to 2 casts (18% max) — modeled as per-stack 6% x3 (base + 2 Intro casts), matching the real stacking mechanic rather than a flat 18%.',
  },
  {
    id: 'lupa.selfbuff.wildfire-banner',
    source: SOURCE, kind: 'buff', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Fire-Kissed Glory' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 12, stacking: 'refresh', source: 'self-kit' }],
    note: 'Wildfire Banner, from Skill/Forte/Liberation casts — modeled on the Liberation cast used in her real rotation.',
  },
  {
    id: 'lupa.debuff.glory',
    source: SOURCE, kind: 'debuff', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Fire-Kissed Glory' },
    timing: { duration: 35 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'resShred', value: 3, stacking: 'stacking', maxStacks: 5 }],
    note: 'Fusion RES ignore, Glory (from Liberation): 3% base +3%/other Fusion Resonator, up to 15% at 3 Fusion units — needs a mono-Fusion team for max value (S3 chain removes the requirement, not modeled). Modeled as per-stack 3% capped at the documented 15% max; the exact "3 Fusion units" stacking formula is approximated rather than precisely derivable from the source text.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic) ──
  {
    // Fixed 2026-09-09 (full-kit audit, independent re-verification): was `trigger:{type:'passive'}`
    // PLUS `timing:{duration:10}` — the "duration is dead metadata on a passive trigger" bug class
    // already found and fixed this session on Baizhi/Brant/Ciaccona/Denia/Galbrena/Jinhsi/Lucilla
    // (resolveHitComposedDps.js's `passiveBlocks` filter only checks `trigger.type === 'passive'` and
    // applies unconditionally, ignoring `timing.duration` entirely). The old note claimed "no specific
    // cast anchor sourced" — but the dump's own S1 text is explicit: "Casting Fire-Kissed Glory...
    // grants +20% Crit Rate for 10s" — a real, sourced cast anchor that was simply missed. Measured
    // directly: her real Intro cast (which fires BEFORE Fire-Kissed Glory in the modeled rotation) was
    // silently getting this Crit Rate too — removing the block dropped Intro's own damage from 3021.15
    // to 2752.60 (a ~9.8% drop, confirming the pre-cast leak). Retargeted to the real Liberation cast.
    id: 'lupa.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Fire-Kissed Glory' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 20, source: 'self-kit' }],
    note: 'Crit Rate +20% for 10s on casting Fire-Kissed Glory (confirmed exact) — now correctly gated to start on that real cast instead of an unconditional passive that was silently active for her pre-Liberation Intro hit too.',
  },
  {
    id: 'lupa.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'elemDmg', value: 40, source: 'self-kit' }],
    // Fixed 2026-09-04: target scope was 'self' but the dump's own text is explicit — "grants the WHOLE
    // TEAM +20% Fusion DMG Bonus" — matching this file's own lupa.libbuff.pack-hunt (Pack Hunt is
    // likewise dump-confirmed whole-team and already correctly scoped that way). A self-only scope
    // silently dropped this buff for every teammate in any team-wide calc while Lupa herself saw no
    // functional difference (self is already inside whole-team), which is exactly how this stayed hidden.
    // value fixed 2026-09-08 (roster-wide sweep for the Augusta S1/S2 bug class): `stacking`/`maxStacks`
    // on a `trigger.type: 'passive'` block is dead metadata in every resolver path (only a real
    // duration-based buff window ever reads it — see resolveHitComposedDps.js's `passiveBlocks` loop,
    // always `applyEffects(block, 1, ...)`). Was silently delivering only 20% (1 stack), team-wide,
    // instead of the 40% (2-stack) total already documented below. Root-caused by writing that total.
    note: 'Fusion DMG Bonus +20%/stack, stacking up to 2 stacks (40% max, corrected from allDmg to elemDmg per the re-audit — Fusion DMG Bonus is element-specific, not all-element) — now modeled flat at the 2-stack total since passive-trigger stacking metadata was dead (see fix comment above). Applies to the whole team per the dump\'s own wording.',
  },
  {
    id: 'lupa.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Nowhere to Run!' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 100, source: 'self-kit' }],
    note: "Nowhere to Run!'s own DMG Multiplier +100% (recategorized from totalMult to libDmg per the re-audit — that move's own text confirms it's 'considered Resonance Liberation DMG') — cast-scoped (instant, no persistent duration). Nowhere to Run! replaces the next Intro Skill only in Wild Hunt state, which her real CHARACTER_ROTATIONS never enters, so this block is present but does not fire in the standard rotation.",
  },
  // Corrected 2026-09-02, 2nd pass: fixing the rotation-name bug above (Climax now really fires) exposed
  // a DEEPER, separate architecture gap while testing — resolveHitComposedDps.js's statsAtInstant() only
  // reads `passiveBlocks` (trigger.type === 'passive') and `buffWindows` (blocks with `timing.duration !=
  // null`); a `kind:'buff'` block with `trigger:{type:'cast',...}` and `timing:{}` (cast-scoped, no
  // duration — this block's exact prior shape) matches NEITHER filter and is a silent no-op in every
  // hit-composed resolver, confirmed by a failing test (`withS4.totalDamage` === `noS4.totalDamage`
  // exactly). This is NOT unique to Lupa — a rough codebase scan found ~65 blocks shaped this way; logged
  // as its own architecture-scale finding in the engine-architecture history (git log) rather than mass-fixed here. For THIS
  // block specifically, converted from a `libDmg` buff-effect (which could never apply, even once the
  // rotation-name bug was fixed) into a real `kind:'damage'` proportional-second-hit block instead — the
  // exact same pattern Brant's S6/Denia's S4/Chisa's S4 already established for a same-instant, same-
  // move-only DMG Multiplier that a cast-scoped buff can't actually deliver. Delta = Climax's own base
  // total (75.63+56.72×4+453.75 = 756.26) at +125% (×2.25 = 1701.585) minus the base total = 945.325,
  // added as one same-instant proportional hit, same category, gated to sequence 4 via the `.chain.s4`
  // id convention (sequenceGating.js).
  {
    id: 'lupa.chain.s4',
    source: SOURCE, kind: 'damage', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Dance With the Wolf: Climax' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('945.325%'), category: 'libDmg', basis: 'ATK' },
    note: "S4: Dance With the Wolf: Climax's own DMG Multiplier +125% (confirmed exact — also fixes a stale prior data bug where an earlier version of this file stored totalMult:25 instead of the sourced 125, a factor-of-5 error). Modeled as a proportional second hit at the same instant as lupa.liberation.dance-with-the-wolf-climax (945.325% = 125% of that block's own 756.26% base total), not a buff effect — see this block's own header comment for why a buff-shaped version can't actually apply here.",
  },
  // Fixed 2026-09-09 (full-kit audit, independent re-verification): was a single unconditional
  // `trigger:{type:'passive'}` block — the dump's own S5 text is explicit: "Casting Intro Skill (Try
  // Focusing, Eh? OR Nowhere to Run!) grants +15% Resonance Liberation DMG Bonus for 10s" — a real
  // cast-anchored window, not an always-on passive. Measured: in the current ~8.14s modeled rotation
  // (where Intro fires as literally the first step), a 10s window from Intro already covers every
  // later libDmg-categorized hit (Fire-Kissed Glory, Dance With the Wolf: Climax) regardless of
  // anchoring, so this fix produces NO measurable DPS change today — but the old shape would have been
  // a real, silent bug the moment a longer rotation, a delayed Intro, or a 2nd-loop rotation entered
  // the picture (exactly the "dead duration on unconditional passive" bug class already fixed on
  // chain.s1 above and on Baizhi/Brant/Ciaccona/Denia/Galbrena/Jinhsi/Lucilla this session). Split into
  // 2 blocks (one per real trigger cast, same "one block per anchor" pattern as Lumi's Expediting).
  {
    id: 'lupa.chain.s5-try-focusing',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Intro:Try Focusing, Eh?' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 15, source: 'self-kit' }],
    note: 'Casting Intro Skill (Try Focusing, Eh?) grants +15% Resonance Liberation DMG Bonus for 10s (confirmed exact) — now correctly gated to start on that real cast.',
  },
  {
    id: 'lupa.chain.s5-nowhere-to-run',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Nowhere to Run!' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 15, source: 'self-kit' }],
    note: 'Same real mechanic as lupa.chain.s5-try-focusing above, anchored to the other real trigger cast (Nowhere to Run! itself counts as the "Intro Skill" slot when in Wild Hunt state). Unused in the modeled rotation, same as lupa.liberation.nowhere-to-run above.',
  },
  {
    // Fixed 2026-09-09 (full-kit audit, independent re-verification): was UNSCOPED — the dump's own S6
    // text names exactly 3 moves ("Dance With the Wolf: Climax, Fire-Kissed Glory, AND Nowhere to
    // Run! all ignore 30% target DEF"), but `defIgnore` is NOT category-gated in
    // resolveHitComposedDps.js (applied unconditionally via `calcDefMult` to every hit resolved at
    // that instant, unlike basicDmg/skillDmg/etc which only apply to matching-category hits) — so the
    // unscoped effect was leaking onto her entire kit, including moves S6 never names (Foebreaker,
    // Mid-air Attacks, Firestrike, Wolf's Claw). Measured directly: Foebreaker's own damage (S6 has
    // nothing to do with it) rose from 7914.28 to 9306.58 with the unscoped block present — confirming
    // a real, active over-crediting bug, same class as Lumi's own chain.s2 defIgnore leak this session.
    id: 'lupa.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 30, scopedToBlockId: [
      'lupa.liberation.fire-kissed-glory',
      'lupa.liberation.dance-with-the-wolf-climax',
      'lupa.liberation.nowhere-to-run',
    ], source: 'self-kit' }],
    note: 'Dance With the Wolf: Climax, Fire-Kissed Glory, and Nowhere to Run! all ignore 30% target DEF (confirmed exact) — now correctly scoped to only those 3 named moves instead of leaking onto her whole kit.',
  },
];
