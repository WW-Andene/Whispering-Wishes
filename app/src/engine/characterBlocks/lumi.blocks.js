// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lumi.blocks.js
// Lumi converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Lumi'], RESONANCE_CHAIN_DATA['Lumi'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Lumi'], and CHARACTER_ROTATIONS['Lumi']. No new numbers
// invented. S1 correctly has NO block — pure STA-restore utility with zero DPS
// component, per the audit's own zeroing. Laser (S5's real scope) has no
// CHARACTER_ROTATIONS step at all, so that block is present but inert in the
// standard rotation, same as Jiyan's S6/Finale in batch 2.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../shared/skillMultiplierParser.js';

const SOURCE = 'Lumi';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const LUMI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS — many rows are "considered Basic Attack DMG" despite
  //    being cast from the Resonance Skill/Forte slot) ──
  {
    id: 'lumi.intro.special-delivery',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Special Delivery' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting teammate skillDmg buffs. No override text names a different category, same default-to-
    // skillDmg convention applied project-wide.
    damage: { hits: parseSkillMultiplierHits('56.33%×3'), category: 'skillDmg' },
    note: 'Enters Yellow Light Mode.',
  },
  {
    id: 'lumi.liberation.squeakie-express',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Squeakie Express' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('954.29%'), category: 'libDmg' },
    note: '20s cooldown, 125 Resonance Cost. Builds Concerto Energy.',
  },
  {
    id: 'lumi.forte.energized-pounce',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Energized Pounce' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('183.31%×2'), category: 'basicDmg' },
    note: 'Resonance Skill replacement when Yellow Light Spark is full; counted as Basic Attack DMG, enters Red Spotlight Mode. Fires twice in the real rotation.',
  },
  {
    id: 'lumi.forte.red-spotlight-basic-attack',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Red Spotlight: Basic Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('120.25% → 138.32%+27.67%×5 → 93.73%+218.69%'), category: 'basicDmg' },
    note: 'Enhanced 3-hit Basic ATK combo during Red Spotlight Mode (after Energized Pounce).',
  },
  {
    id: 'lumi.forte.energized-rebound',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Energized Rebound' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('251.70%'), category: 'basicDmg' },
    note: 'Resonance Skill replacement when Red Light Spark is full; counted as Basic Attack DMG, enters Yellow Spotlight Mode.',
  },
  {
    id: 'lumi.basic.yellow-light-basic-attack',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Yellow Light: Basic Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('31.81%×3'), category: 'basicDmg' },
    note: 'Summon Squeakie to shoot three shots in a row; ranged Basic ATK in Yellow Light Mode. Builds Yellow Light Spark.',
  },
  {
    id: 'lumi.forte.glare',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Glare' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-04 (full re-segmentation pass, decomposing the dump's real rotation text): was a
    // single 81.52% hit — but the CHARACTER_ROTATIONS step's own note ("Channelled Dash: 6 Glares")
    // and the kit text ("ends after 6 Glares") both confirm 6 real hits land per cast, undercounting by
    // 6x. Fixed to 6 real hits, same value each (no per-hit variation sourced).
    damage: { hits: Array.from({ length: 6 }, () => ({ atkPct: 81.52 })), category: 'basicDmg' },
    note: "Yellow Spotlight Mode: replaces Glitter with a higher DMG Multiplier after Energized Rebound; the real 6-Glare Channelled Dash (channelled dash), not a single hit.",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'lumi.outro.escorting',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 10 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'skillDmg', value: 38, stacking: 'refresh' }],
    note: 'Ends early if the incoming Resonator is switched out before 10s, not modeled.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 audit comment for
  //    each node's real mechanic; S1 correctly has NO block — pure STA-restore utility, zero DPS
  //    component per the audit's own zeroing) ──
  // S1 correctly has NO block — after Energized Rebound, +60 STA restore within 3s, pure utility.
  {
    id: 'lumi.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 20 }],
    note: 'Energized Pounce/Rebound ignore 20% target DEF (confirmed exact) — kept passive, applies to both blocks above.',
  },
  {
    id: 'lumi.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Squeakie Express' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 30 }],
    note: "Squeakie Express (Liberation) DMG +30% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'lumi.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 30 }],
    note: 'Basic ATK DMG Bonus +30% (confirmed exact, unconditional) — kept passive.',
  },
  // Fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): S5's block used to sit here as an
  // unscoped, unconditioned trigger.type:'passive' with totalMult:100 — since totalMult has NO
  // category gate (applies to every hit resolved at that instant, not just Laser's), this was
  // silently DOUBLING her entire kit's damage for the whole rotation, confirmed directly (removing
  // the block dropped her simulated total from 94,044 to 47,022 — exactly 2x). Laser itself is real
  // (it CAN fire off her Outro cast, a real modeled step, if 25+ of her 100-cap Spark were consumed)
  // but is deliberately left unmodeled rather than assumed-at-max: the rotation's own final steps are
  // "...Skill: Energized Pounce -> Echo -> Outro" — Energized Pounce drains that exact Spark pool to
  // 0 the instant it's cast, with only a non-Spark-generating Echo cast before Outro, so a max-Spark
  // assumption would be directly contradicted by the rotation's own real cast order, not a defensible
  // steady-state approximation. Removed entirely (same "real but not fireable without live state we
  // don't track" treatment as S1), rather than left as the broken unscoped version.
  // S5 correctly has NO block — see this comment.
  {
    id: 'lumi.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Squeakie Express' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: 'Casting Squeakie Express grants all team members ATK+20% for 20s (confirmed exact, team-wide).',
  },
];
