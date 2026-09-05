// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/denia.blocks.js
// Denia converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Denia'], RESONANCE_CHAIN_DATA['Denia'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Denia'], and CHARACTER_ROTATIONS['Denia']. No new numbers
// invented. S4's proc-frequency buff (Erosion Field tick interval 4s->3s) has no
// frequency-based stat in this schema and is kept as an approximated totalMult
// per the source audit's own documented uncertainty, not corrected further here.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Denia';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const DENIA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'denia.intro.its-been-a-while',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: "Intro:It's Been A While!" },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category/basis added during Layer 4 migration: was uncategorized, silently rejecting Resonance
    // Skill DMG Bonus. No override text names a different category, same default-to-skillDmg convention
    // as Aalto/Calcharo/Encore/Jianxin/Danjin's own Intro blocks.
    damage: { hits: parseSkillMultiplierHits('104.62%'), basis: 'ATK' },
    note: 'Stagecraft-Form opener; grants 25 Void Particle and 1 Dark Core.',
  },
  {
    id: 'denia.basic.stagecraft-stage1',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Stagecraft Form Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says "Tap Basic Attack ONCE — cancel its endlag by immediately
    // pressing Skill", meaning only Stage 1 lands, not the full 4-stage combo — only that segment used.
    damage: { hits: parseSkillMultiplierHits('32.69%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Only Stage 1 of the row\'s 4-stage combo fires — the rotation cancels the rest to chain into Skill immediately.',
  },
  {
    id: 'denia.skill.phantom-bubble-stagecraft',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Phantom Bubble - Stagecraft Form' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('17.42%×3+52.25%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Pulls in nearby targets, grants 25 more Void Particle.',
  },
  {
    id: 'denia.liberation.final-act-stagecraft',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Final Act: Stagecraft Form' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('397.62%'), category: 'libDmg', basis: 'ATK' },
    note: 'Grants Entropy Shift: Breakdown Form (+30% ATK, 12s), then switches to Breakdown Form.',
  },
  {
    id: 'denia.basic.breakdown-stage1-4',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Breakdown Form Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says "Tap Basic Attack 4 times" — the full combo, unlike the
    // Stagecraft-Form step above.
    damage: { hits: parseSkillMultiplierHits('36.51% → 37.51%+14.07%×4 → 62.39% → 35.54%+82.92%'), category: 'basicDmg', basis: 'ATK' },
    // appliesTags added 2026-09-02 (the engine-architecture history (git log) item 9, Phase 2): the %ATK values above are
    // IDENTICAL either mode — only the side-effect status differs, so both mode variants are listed on
    // this ONE block rather than duplicating it (which would double-count her real damage). Gated by
    // sequenceGating.js's winningStanceForOwner() — see triggerBlocks.schema.js's appliesTags doc.
    appliesTags: [
      { tag: 'fusion-burst', requiresStance: 'Fusion Burst mode' },
      { tag: 'shifting', requiresStance: 'Tune Strain mode' },
    ],
    // dotApplier added 2026-09-02 (the engine-merge history (git log) Phase 2) — the SAME real Fusion Burst
    // application this block's own appliesTags entry already names, now also feeding the shared
    // Fusion Burst DOT reaction total (dotReactionsFromBlocks.js) instead of CHAR_BUFF_TABLE's
    // debuffs.fusionBurst flag. Reuses the identical winningStanceForOwner() resolution as appliesTags
    // — one mode decision, two consumers, not two independent mode mechanisms.
    // value:1 added 2026-09-06 — real, sourced: "Basic Stage 3/4 (both forms)/Mid-air Stage 3/4
    // inflict 1 stack" (Denia dump line 92) — this block is her Breakdown-form Basic ATK combo.
    dotApplier: { mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode', value: 1 },
    note: 'Builds Conformal Charge toward 100, each hit inflicting Fusion Burst or Tune Strain - Shifting depending on Resonance Mode.',
  },
  {
    id: 'denia.skill.banish-breakdown-stage1',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Banish - Breakdown Form Stage 1' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('34.68%×3'), category: 'skillDmg', basis: 'ATK' },
    note: 'Replaces Beckon while holding a Dark Core, pulls in targets.',
  },
  {
    id: 'denia.liberation.banish-breakdown-stage2',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Banish - Breakdown Form Stage 2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('112.01%'), category: 'libDmg', basis: 'ATK' },
    note: 'Counted as Resonance Liberation DMG despite the Skill input. Real DMG also gets +150% Multiplier per Dark Core consumed (all held Dark Cores spent on cast) — the per-Dark-Core scalar itself is now modeled as denia.liberation.banish-breakdown-stage2-dark-core-scalar below (Phase 0.5 gap #7, fixed 2026-09-02), at the documented base-kit cap of 3 Dark Cores.',
  },
  {
    id: 'denia.liberation.banish-breakdown-stage2-dark-core-scalar',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Banish - Breakdown Form Stage 2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // the engine-merge history (git log) Phase 0.5 gap #7, fixed 2026-09-02: "+150% DMG Multiplier per Dark Core
    // consumed" is a per-resource-unit scalar on the SAME hit as denia.liberation.banish-breakdown-stage2
    // — modeled the same proportional-second-hit way gap #6 (Brant's S6 secondary blast) established:
    // a same-instant, same-category hit under the same active buffs scales in exact proportion through
    // the shared crit/dmgBonus/defMult/resMult chain, so "+450% multiplier on THIS hit" (documented
    // base-kit cap of 3 Dark Cores × 150%, dump: "holds up to 3 (5 at S3)") is just an additional hit
    // worth 4.5× the base hit's own %ATK: 112.01% × 4.5 = 504.045%. (A `scopedToBlockId` totalMult buff
    // was tried first but doesn't actually fire in the hit-composed resolvers — a cast-scoped, no-
    // duration buff only feeds the LEGACY totalMultBonus path, not this one — so the proportional-hit
    // shape is used instead, consistent with gap #6.)
    damage: { hits: [{ atkPct: 504.045 }], category: 'libDmg', basis: 'ATK' },
    note: '+150% DMG Multiplier per Dark Core consumed on Stage 2 cast, modeled at the base-kit 3-Dark-Core cap (450% total, i.e. this hit = 4.5× the base hit) — S3 raises the cap to 5, not modeled here (would need real evidence the modeled rotation reliably holds 5 at cast time).',
  },
  {
    id: 'denia.liberation.final-act-breakdown',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Final Act: Breakdown Form' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.81%×4'), category: 'libDmg', basis: 'ATK' },
    note: 'Consumes full Conformal Charge + Void Particle, grants Entropy Shift: Stagecraft Form (30s), leaves an Erosion Field, switches back to Stagecraft Form.',
  },
  {
    id: 'denia.liberation.erosion-field',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Erosion Field' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('136.33%'), category: 'libDmg', basis: 'ATK' },
    // appliesTags added 2026-09-02 (the engine-architecture history (git log) item 9, Phase 2) — same mode-gated shape as
    // denia.basic.breakdown-stage1-4 above, per this block's own note (applies Fusion Burst/Shifting
    // regardless of which mode Denia swapped out in).
    appliesTags: [
      { tag: 'fusion-burst', requiresStance: 'Fusion Burst mode' },
      { tag: 'shifting', requiresStance: 'Tune Strain mode' },
    ],
    // dotApplier added 2026-09-02 (the engine-merge history (git log) Phase 2) — same rationale as
    // denia.basic.breakdown-stage1-4 above.
    // value:2 added 2026-09-06 — real, sourced: "Intro/Final Act (both forms)/Erosion Field inflict 2
    // stacks of Fusion Burst" (Denia dump line 92) — this block IS Erosion Field.
    dotApplier: { mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode', value: 2 },
    note: 'Off-field zone left by Final Act - Breakdown Form; pulls in and hits nearby targets every 4s for 30s, applying Fusion Burst/Tune Strain even after Denia swaps out. Modeled as one representative tick, not the full sustained-duration mechanic.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) — two mutually-exclusive real Outro effects depending on
  //    her Resonance Mode at swap-out ──
  {
    id: 'denia.outro.unfinished-lies-tune-strain',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 16 },
    target: { scope: 'next-on-field' },
    condition: { requiresStance: 'Tune Strain mode' },
    effects: [{ stat: 'allDmg', value: 15, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Tune Strain mode: incoming Resonator gains +15% All DMG Amp for 16s (the guaranteed floor — jumps to +40% if they apply Tune Strain - Shifting themselves, not separately modeled, per the 2026-08-31 correction that fixed this from being applied unconditionally at the 40% ceiling).',
  },
  {
    id: 'denia.outro.unfinished-lies-fusion-burst',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    condition: { element: 'fusion', requiresStance: 'Fusion Burst mode' },
    effects: [{ stat: 'elemDmg', value: 60, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Fusion Burst mode: Amplifies Fusion Burst DMG near the active Resonator by +60% for 30s — modeled as a team-wide elemDmg buff (closest existing category), mutually exclusive with the Tune Strain-mode block above.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 audit comment for
  //    each node's real mechanic) ──
  {
    id: 'denia.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 30, source: 'self-kit' }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  {
    id: 'denia.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Banish - Breakdown Form Stage 2' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 40, source: 'self-kit' }],
    note: "Banish - Breakdown Form Stage 2's own DMG Multiplier +40% (unconditional; confirmed exact — that move's own text confirms it deals Resonance Liberation DMG) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'denia.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Final Act: Breakdown Form' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 80, source: 'self-kit' }],
    note: "Final Act - Breakdown Form's own DMG Multiplier +80% (confirmed exact) — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'denia.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Erosion Field' },
    timing: { duration: 30 }, // matches Erosion Field's own 30s window, since this scales its tick rate
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 15, source: 'self-kit' }],
    note: "Real effect: Erosion Field's attack interval reduced from 4s to 3s (a +33% proc-frequency increase to one Forte-circuit DoT tick, not a flat DMG%) — no frequency-based stat exists in this schema, kept as an approximated totalMult per the audit comment's own documented uncertainty (value neither verified exact nor known wrong).",
  },
  {
    id: 'denia.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Final Act: Stagecraft Form' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 100, source: 'self-kit' }],
    note: "Final Act - Stagecraft Form's own DMG Multiplier +100% (confirmed exact, was 50 previously) — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'denia.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: conditional on being in Entropy Shift (grantable by either Final Act cast), no single cast anchor picked
    target: { scope: 'self' },
    effects: [
      { stat: 'atkPct', value: 60, source: 'self-kit' },
      { stat: 'elemDmg', value: 60, source: 'self-kit' },
    ],
    note: 'While in Entropy Shift: +60% ATK AND +60% Fusion DMG Bonus simultaneously (the atkPct component was missing from an earlier version of this table, only elemDmg was captured — added). Entropy Shift can be granted by either Final Act cast, so kept passive rather than picking one specific anchor.',
  },
];
