// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/zhezhi.blocks.js
// Zhezhi converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Zhezhi'], RESONANCE_CHAIN_DATA['Zhezhi'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Zhezhi'], and CHARACTER_ROTATIONS['Zhezhi']. No new numbers invented. S2
// correctly has NO block — a resource-cap-increase mechanic with no home in this
// flat schema, per the audit's own zeroing. S5/S6's bonus-hit-at-X%-of-move-Y's-
// multiplier mechanics ARE precisely computable and audit-confirmed (140%/120% of
// a sourced move's own multiplier, cross-checked against the source's raw damage data),
// so both are modeled as real proc-style damage blocks instead of left zeroed.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Zhezhi';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const ZHEZHI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'zhezhi.intro.radiant-ruin',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Radiant Ruin' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting teammate skillDmg buffs. No override text names a different category, same default-to-
    // skillDmg convention applied project-wide.
    damage: { hits: parseSkillMultiplierHits('86.16%×3'), category: 'skillDmg' },
    note: 'Fills roughly 1.5 of her 3 Afflatus segments.',
  },
  {
    id: 'zhezhi.basic.dimming-brush-stage1-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Dimming Brush Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('41.76%×2 → 20.55%×5 → 133.61%'), category: 'basicDmg' },
    note: 'Fills the remaining Afflatus.',
  },
  {
    id: 'zhezhi.skill.manifestation',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Manifestation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('98.42%×3'), category: 'skillDmg' },
    note: 'At 60+ Afflatus, consumes 60 to summon Phantasmic Imprint - Left and Right. 6s cooldown.',
  },
  {
    id: 'zhezhi.forte.conjuration',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Conjuration' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('83.01%×3'), category: 'heavyDmg' },
    note: 'At 30+ Afflatus, consumes 30 to summon Phantasmic Imprint - Middle.',
  },
  {
    id: 'zhezhi.forte.stroke-of-genius',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Stroke of Genius' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Stroke of Genius / Creation's Zenith' — only the Stroke of Genius segment matches this step.
    damage: { hits: parseSkillMultiplierHits('298.22%'), category: 'basicDmg' },
    note: "Teleports to and consumes a Phantasmic Imprint, counted as Basic ATK DMG. Fires twice in the real rotation, escalating into Creation's Zenith once Painter's Delight hits 2 stacks.",
  },
  {
    id: 'zhezhi.liberation.living-canvas',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Living Canvas' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 'up to 21 over 30s' — the max-consumption case is used as a representative value.
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was coordDmg — kit text is
    // explicit "Coordinated Attack (Glacio DMG, considered Basic Attack DMG)", same "counted as X"
    // convention already applied to Rebecca/Camellya/Lucilla's own coordinated-attack-shaped-but-
    // considered-Basic-ATK moves. Confirmed by this source's own Damage Profile: Basic 78.4% (dominant,
    // matching her spirits being bucketed as Basic ATK) vs Liberation 0% (she has no direct Liberation-
    // press nuke at all — everything routes through these spirit procs).
    damage: { hits: Array.from({ length: 21 }, () => ({ atkPct: 65.21 })), category: 'basicDmg' },
    note: 'Summons Coordinated-ATK-shaped spirits, considered Basic Attack DMG for buff-pool purposes — whenever the active Resonator deals damage. Modeled at the max 21-Spirit case. 25s cooldown.',
  },
  {
    id: 'zhezhi.forte.creations-zenith',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Forte:Creation's Zenith" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('119.29%×3'), category: 'basicDmg' },
    note: "Needs 2 stacks of Painter's Delight, counted as Basic ATK DMG. Also grants +18% Basic ATK DMG Bonus for 27s (see zhezhi.kit.creations-zenith-buff below). Finisher — Dash Cancel to skip remaining recovery.",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE, plus a real base-kit multiplier sourced directly from
  //    SKILL_MULTIPLIERS' own row text, not the Resonance Chain) ──
  {
    id: 'zhezhi.outro.carve-and-draw',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 }, target: { scope: 'next-on-field' },
    condition: { element: 'glacio' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh' },
      { stat: 'skillDmg', value: 25, stacking: 'refresh' },
    ],
    note: 'No direct DMG on the Outro itself. Also grants 15 Resonance Energy via Inherent Skill Flourish, not modeled.',
  },
  {
    id: 'zhezhi.kit.creations-zenith-buff',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: "Forte:Creation's Zenith" },
    timing: { duration: 27 },
    target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 18 }],
    note: "Creation's Zenith (base kit, not Resonance Chain): needs 2 stacks of Painter's Delight and also grants +18% Basic ATK DMG Bonus for 27s — sourced directly from SKILL_MULTIPLIERS' own row text.",
  },
  {
    // Added 2026-09-03 against a real browser snapshot: Inherent Skill Calligrapher's Touch was
    // entirely missing from both this file and CHAR_BUFF_TABLE. Modeled with real per-stack stacking
    // (unlike the flat CHAR_BUFF_TABLE entry, which stores only the flat 18% max-stack value) — anchored
    // to the Stroke of Genius cast, matching zhezhi.chain.s6-bonus-hit's own anchor precedent for the
    // same trigger set (Stroke of Genius/Creation's Zenith).
    id: 'zhezhi.selfbuff.calligraphers-touch',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Stroke of Genius' },
    timing: { duration: 27 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 6, stacking: 'stacking', maxStacks: 3 }],
    note: "Inherent Skill Calligrapher's Touch: self ATK +6% per stack (up to 3, 27s) on Stroke of Genius/Creation's Zenith cast. Fires from BOTH of the real rotation's 2 Stroke of Genius casts (CHARACTER_ROTATIONS has 2 separate 'Forte:Stroke of Genius' steps) — see zhezhi.selfbuff.calligraphers-touch-creations-zenith below for the 3rd real trigger this node was missing.",
  },
  {
    // Added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): Calligrapher's Touch's kit text is
    // explicit "casting Stroke of Genius OR Creation's Zenith" — the real rotation's 1 Creation's
    // Zenith cast never triggered a stack before this, undercounting her real max-stack uptime. A
    // separate block (not a 2nd trigger on the same block, since the schema's trigger field is
    // single-valued) sharing the same stat/duration/stacking as the block above — see this file's own
    // convention note for why 2 blocks contributing to what's really one shared stack pool is safe
    // here specifically: Stroke of Genius already fires twice and Creation's Zenith once within the
    // same rotation pass, so 2 real casts (not concurrent double-firing of the SAME event) drive the
    // 3rd stack, matching the real 3-cast/3-stack cap exactly rather than risking an over-count.
    id: 'zhezhi.selfbuff.calligraphers-touch-creations-zenith',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: "Forte:Creation's Zenith" },
    timing: { duration: 27 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 6, stacking: 'stacking', maxStacks: 3 }],
    note: "Inherent Skill Calligrapher's Touch: the 3rd real trigger (Creation's Zenith cast) — see zhezhi.selfbuff.calligraphers-touch above for the Stroke of Genius half.",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own detailed audit comment for each
  //    node's real mechanic; S2/S5/S6 correctly have NO block — resource-cap-increase and bonus-hit-at-
  //    X%-of-move-Y's-multiplier mechanics with no home in this flat schema, per the audit's own zeroing) ──
  {
    id: 'zhezhi.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 10 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  // S2 correctly has NO block — "Max Inklit Spirits summoned by Living Canvas +6" (21 -> 27 cap), not
  // a percentage stat at all, no home in the flat {stat: value} schema.
  {
    // Fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): real mechanic stacks ATK+15% up to 3
    // times off 3 DIFFERENT casts (Manifestation ×1, Stroke of Genius ×2, Creation's Zenith ×1 — 4
    // real casts feeding ONE shared stack pool). The schema's trigger field can't express "one shared
    // counter fed by multiple different casts" without risking a double-count (unlike Calligrapher's
    // Touch above, where the real cast counts per trigger happen to sum exactly to the cap). Per
    // explicit user decision: modeled as a flat, unconditional passive at the real MAX value (15×3=45),
    // same "assume max/steady-state" approximation already used in this exact file for Living Canvas's
    // spirit count (modeled at the max 21-spirit case). Previously flat at 15 (the un-multiplied base
    // per-stack value) — under-counted her real ceiling.
    id: 'zhezhi.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 45 }],
    note: "ATK +15% per stack (up to 3, 27s) on Manifestation/Stroke of Genius/Creation's Zenith cast — modeled as a flat +45% (max stacks) passive; see this block's own comment above for why.",
  },
  {
    id: 'zhezhi.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Living Canvas' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: 'Team ATK +20% for 30s on Living Canvas cast (confirmed exact, team-wide).',
  },
  {
    id: 'zhezhi.chain.s5-bonus-hit',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Living Canvas' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 140% x 65.21% = 91.29%, matching the source's raw Living Canvas damage-data row 2 of 91.3% exactly
    // per the audit comment's own cross-check — a real, precisely computable figure, not a guess.
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was coordDmg — kit text is
    // explicit "1 extra Inklit Apparition procs at 140% of Inklit Spirit's DMG (Basic Attack DMG)",
    // same fix/convention as zhezhi.liberation.living-canvas above.
    damage: { hits: [{ atkPct: 91.29 }], category: 'basicDmg' },
    note: "Every 3 Inklit Spirits summoned by Living Canvas, 1 extra Inklit Apparition procs a Coordinated ATK at 140% of Inklit Spirit's own DMG Multiplier — modeled as a real proc-style damage block using the audit's own computed figure, instead of the flat {} RESONANCE_CHAIN_DATA carries for this node (same \"discrete proc, not a modifier\" treatment as Yinlin's S6/Calcharo's S6).",
  },
  {
    id: 'zhezhi.chain.s6-bonus-hit',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Stroke of Genius' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 120% x 298.22% = 357.86%, matching the source's raw Ink and Wash damage-data row 4 of 357.86%
    // exactly per the audit comment's own cross-check.
    damage: { hits: [{ atkPct: 357.86 }], category: 'basicDmg' },
    note: "On Stroke of Genius/Creation's Zenith cast, an extra Ivory Herald procs at 120% of Stroke of Genius's own DMG Multiplier — modeled as a real proc-style damage block using the audit's own computed figure, same \"discrete proc, not a modifier\" treatment as S5 above. Fires from BOTH of the real rotation's 2 Stroke of Genius casts — see zhezhi.chain.s6-bonus-hit-creations-zenith below for the 3rd real trigger this node was missing.",
  },
  {
    // Added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): S6's kit text is explicit "On Stroke of
    // Genius/Creation's Zenith cast" — the real rotation's 1 Creation's Zenith cast never triggered
    // this bonus proc before, silently dropping a 3rd real 357.86%-ATK hit every rotation.
    id: 'zhezhi.chain.s6-bonus-hit-creations-zenith',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Forte:Creation's Zenith" },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Same 120%-of-Stroke-of-Genius figure as the block above — the % is always anchored to Stroke of
    // Genius's OWN multiplier regardless of which of the 2 named casts triggers it.
    damage: { hits: [{ atkPct: 357.86 }], category: 'basicDmg' },
    note: "S6's 3rd real trigger (Creation's Zenith cast) — see zhezhi.chain.s6-bonus-hit above for the Stroke of Genius half.",
  },
];
