// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/iuno.blocks.js
// Iuno converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Iuno'], RESONANCE_CHAIN_DATA['Iuno'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Iuno'], and CHARACTER_ROTATIONS['Iuno']. No new numbers
// invented. S4 correctly has NO block — a pure defensive team shield with zero DPS
// component, per the audit's own zeroing.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Iuno';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const IUNO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS — several rows are "considered Resonance Liberation DMG"
  //    despite the Basic ATK/Heavy ATK/Skill slot actually used to cast them) ──
  {
    id: 'iuno.intro.illuminated-manifestation',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Illuminated Manifestation' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category/basis added during Layer 4 migration: was uncategorized, silently rejecting Resonance
    // Skill DMG Bonus. No override text names a different category, same default-to-skillDmg convention
    // as Aalto/Calcharo/Encore/Denia/Galbrena's own Intro blocks.
    damage: { hits: parseSkillMultiplierHits('15.91%×7 + 47.72%'), basis: 'ATK' },
    note: 'Restores 40 Sentience.',
  },
  {
    id: 'iuno.liberation.beneath-lunar-tides',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Beneath Lunar Tides' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1093.46%'), category: 'libDmg', basis: 'ATK' },
    note: 'Activates Lunar Cycle (starting Half Moon), restores 60 Sentience. No team DMG buff, purely personal damage.',
  },
  {
    id: 'iuno.heavy.flux-moonbow',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Flux: Moonbow' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('250.51%'), category: 'libDmg', basis: 'ATK' },
    note: 'Switches Half Moon -> New Moon; counted as Resonance Liberation DMG despite the Heavy ATK slot.',
  },
  {
    id: 'iuno.basic.moonbow',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Moonbow 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('126.45% → 55.67%×3 → 167.01%×2'), category: 'libDmg', basis: 'ATK' },
    note: 'Empowered combo used while in New Moon; counted as Resonance Liberation DMG. Base (non-Sentience-enhanced) values used — the Sentience-consuming DMG boost + team heal on hit is not modeled.',
  },
  {
    id: 'iuno.skill.arc-beyond-the-edge',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Arc Beyond the Edge' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('219.79%×2'), category: 'libDmg', basis: 'ATK' },
    note: 'New Moon Skill follow-up, 2 charges, consumes Sentience per cast (its own DMG-boost from Sentience not modeled); counted as Resonance Liberation DMG.',
  },
  {
    id: 'iuno.heavy.absolute-fullness',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Absolute Fullness' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('159.05%'), category: 'libDmg', basis: 'ATK' },
    note: 'Forte-empowered Heavy ATK at full Concerto Energy (once per 25s) — corrected 2026-09-02 from heavyDmg to libDmg against a fresh the source dump: "deals Aero DMG to nearby targets, considered as Resonance Liberation DMG" — the exact same Heavy-ATK-slot-but-Liberation-categorized pattern already correctly applied to iuno.heavy.flux-moonbow above (this file\'s own header comment names the pattern), just missed here. Confirmed by the calc page\'s own damage profile showing a flat 0 Heavy ATK share in both DPS and Hybrid modes. Ends Lunar Cycle, heals nearby allies, drops a 30s Full Moon Domain (none modeled, no DPS component).',
  },
  {
    id: 'iuno.outro.from-gloom-to-gleam',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category/basis added during Layer 4 migration: swap-out finisher damage, same outroDmg shape
    // already used for Encore/Galbrena's own Outro damage blocks.
    damage: { hits: parseSkillMultiplierHits('100%'), basis: 'ATK' },
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'iuno.outro.gloom-to-gleam-buff',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    // Duration corrected 2026-09-02 from 10s to 14s — verified against two independent live sources
    // (wuthering.gg, a web search aggregating the source/sportskeeda) while auditing Augusta's
    // real-world curated recommendation list ("Iuno + Augusta"): "The incoming Resonator gains 50%
    // Heavy Attack DMG Amplification for 14s." No source found for the prior 10s value.
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'heavyDmg', value: 50, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Ends early if the incoming Resonator is swapped off-field, not modeled. Casting Outro does NOT interrupt an in-progress Absolute Fullness.',
  },
  {
    id: 'iuno.selfbuff.blessing-of-the-wan-light',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Liberation:Beneath Lunar Tides' },
    timing: { duration: 10 },
    // Target corrected 2026-09-02 from 'self' to 'whole-team' — verified against two independent live
    // sources while auditing Augusta's real-world curated recommendation list. Both quote it as
    // benefiting "the receiving Resonator"/"whichever Resonator receives the shield" inside the Full
    // Moon Domain, NOT Iuno exclusively — this is the exact mechanism the community credits as giving
    // Augusta "a whopping 90% DMG Amplification... in total" (this 40% base-kit max + the outro's 50%
    // heavyDmg above = 90%, matching precisely). Was wrongly self-only, so this 40% never reached any
    // teammate at all — same-shaped bug as iuno.chain.s2 just below, which already correctly models
    // the Resonance-Chain-gated ADDITIONAL 40% as whole-team.
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 4, stacking: 'stacking', maxStacks: 10, source: 'self-kit' }],
    note: 'Blessing of the Wan Light: +4% all DMG Amp per stack, max 10 stacks (40% total) to whichever Resonator receives the shield inside the 30s Full Moon Domain (max 1 stack per 0.5s), each new stack resets the 10s duration, ends early if the receiving Resonator is swapped off-field (not modeled). Derivation Inherent Skill instantly grants 5 stacks on Intro/Liberation cast — modeled anchored to the Liberation cast, per-stack stacking rather than the flat 40% total.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S4 correctly has NO block — pure defensive team shield, zero DPS
  //    component per the audit's own zeroing) ──
  {
    id: 'iuno.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 40, source: 'self-kit' }],
    note: 'ATK +40% while in Lunar Cycle (confirmed exact) — kept passive since her real rotation is almost entirely spent inside Lunar Cycle. +1 Resonance Energy/s inside Full Moon Domain and interrupt immunity for Arc Beyond the Edge/Absolute Fullness are NOT modeled (no home in this schema).',
  },
  {
    id: 'iuno.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 40, source: 'self-kit' }],
    note: 'Resonators with 10 stacks of Blessing of the Wan Light gain an ADDITIONAL 40% all DMG Amp (confirmed exact) — condition-gated on already being at max Wan Light stacks, NOT a free team buff; that gating is not modeled (applied team-wide whenever this block fires).',
  },
  {
    id: 'iuno.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Bug fixed 2026-09-04 (Phase A audit): was a bare category-wide `libDmg: 65` effect. S3's own kit
    // text names exactly 3 moves (Moonbow Basic ATK / Arc Beyond the Edge / Moonbow Dodge Counter) — but
    // 'libDmg' is a damage-CATEGORY stat (see resolveHitComposedDps.js's `categoryStat`), and several
    // OTHER real blocks also carry `category: 'libDmg'` despite not being named by S3's text at all:
    // iuno.liberation.beneath-lunar-tides (the Ultimate), iuno.heavy.flux-moonbow, and
    // iuno.heavy.absolute-fullness. An unscoped libDmg:65 here silently amplified all of those too —
    // the exact category-leak shape described for bare totalMult, just via the category-stat pool
    // instead. Split into per-block `scopedToBlockId` effects covering only the 2 blocks that actually
    // exist for the named moves (iuno.basic.moonbow, iuno.skill.arc-beyond-the-edge); Moonbow Dodge
    // Counter has no engine block since it's unused in the modeled rotation, so no 3rd effect to add.
    effects: [
      { stat: 'libDmg', value: 65, scopedToBlockId: 'iuno.basic.moonbow', source: 'self-kit' },
      { stat: 'libDmg', value: 65, scopedToBlockId: 'iuno.skill.arc-beyond-the-edge', source: 'self-kit' },
    ],
    note: 'While in Lunar Cycle, DMG dealt by Moonbow Basic ATK/Arc Beyond the Edge/Moonbow Dodge Counter Amplified by 65% (confirmed exact, all three are the game\'s own Resonance Liberation DMG-tagged moves) — scoped to only the 2 corresponding blocks that exist (Moonbow Dodge Counter is real but unused in the modeled rotation, so has no block to scope to).',
  },
  // S4 correctly has NO block — Absolute Fullness grants a Shield = 160% of Iuno's ATK to the WHOLE
  // TEAM for 30s (not passed to the incoming Resonator on swap) — purely defensive, ZERO DPS component.
  {
    id: 'iuno.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 20, source: 'self-kit' }],
    note: '+20% Resonance Liberation DMG Bonus (confirmed exact, unconditional) — kept passive.',
  },
  {
    id: 'iuno.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Heavy ATK:Absolute Fullness' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 1600, source: 'self-kit' }],
    note: "Absolute Fullness' own DMG Multiplier +1600% (confirmed exact value) — corrected 2026-09-02 from heavyDmg to libDmg against a fresh the source dump: Absolute Fullness is explicitly \"considered as Resonance Liberation DMG\" despite the Heavy ATK slot used to cast it (same real fact as iuno.heavy.absolute-fullness's own category fix above — a heavyDmg-stat bonus here would have applied to a damage category she has zero real hits in). Cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5. On-cast re-entry into Lunar Cycle - New Moon, 100 Sentience grant, and Arc Beyond the Edge cooldown reset are NOT modeled (no home in this schema).",
  },
];
