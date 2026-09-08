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

  // Added 2026-09-07 (full-kit completeness re-pass): 8 real, sourced SKILL_MULTIPLIERS rows with no
  // block anywhere in this file — none used in her modeled CHARACTER_ROTATIONS (which enters Lunar
  // Cycle on Intro and stays there, so her pre-Cycle Basic ATK/Skill/Dodge Counter rows and the
  // New-Moon-to-Half-Moon Flux never fire), same "add unused base kit for completeness" convention
  // already used for Encore/Camellya/Hiyuki earlier this session.
  {
    id: 'iuno.basic.moonring',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Moonring 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('87.68% → 46.06%×2+47.46% → 87.98%×2+90.65%'), basis: 'ATK' },
    note: 'Standard combo before entering the Lunar Cycle; not reclassified — plain Basic ATK DMG. Unused in the modeled rotation, which enters Lunar Cycle on Intro.',
  },
  {
    id: 'iuno.midair.midair-attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Mid-air Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('53.68%×2'), basis: 'ATK' },
    note: 'Plunging attack, 30 STA cost. Unused in the modeled rotation.',
  },
  {
    id: 'iuno.dodgecounter.moonring-dodge-counter',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Moonring Dodge Counter' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('82.08%×2+84.57%'), basis: 'ATK' },
    note: 'Dodge Counter while in Half Moon (or outside Lunar Cycle). Unused in the modeled rotation.',
  },
  {
    id: 'iuno.dodgecounter.moonbow-dodge-counter',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Moonbow Dodge Counter' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('103.39%×3'), category: 'libDmg', basis: 'ATK' },
    note: 'Dodge Counter while in New Moon; counted as Resonance Liberation DMG. Unused in the modeled rotation.',
  },
  {
    id: 'iuno.skill.pulse-of-origins',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Pulse of Origins' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('18.65%×7 + 130.52%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Base dash Skill, can transform into different follow-ups depending on her state. Unused in the modeled rotation, which enters Lunar Cycle before this base cast would be needed.',
  },
  {
    id: 'iuno.skill.closing-refrain',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Closing Refrain' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('140.73%×2 + 145.00%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Skill replacement when NOT in Lunar Cycle; casting it activates Lunar Cycle. Unused in the modeled rotation, which enters Lunar Cycle via the Liberation cast instead.',
  },
  {
    id: 'iuno.skill.unfinished-refrain',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Unfinished Refrain' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('140.73%×2 + 145.00%'), category: 'skillDmg', basis: 'ATK' },
    note: "Skill replacement while in Lunar Cycle - Half Moon; shares Closing Refrain's cooldown. Unused in the modeled rotation, which stays in New Moon (Arc Beyond the Edge is the New Moon Skill replacement).",
  },
  {
    id: 'iuno.heavy.flux-moonring',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Flux: Moonring' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('79.18%×4'), category: 'libDmg', basis: 'ATK' },
    note: 'Heavy ATK replacement in New Moon (25 STA) — switches New Moon -> Half Moon; counted as Resonance Liberation DMG. Unused in the modeled rotation, which stays in New Moon throughout (only Flux: Moonbow, the reverse switch, is cast).',
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
  // Found 2026-09-08 (full-kit re-audit): the single block below was a real, significant
  // under-crediting bug — measured directly: it delivered only a ~1.5% total-damage uplift instead of
  // anywhere near a real 40% All DMG Amp's worth. Two stacked problems: (1) it only anchored to the
  // Liberation cast, but the dump's own Review section (line 164, "+4%/stack... up to 10 stacks/40%
  // max, from Intro +5/Ultimate +5") is explicit that BOTH Intro AND Liberation independently trigger
  // Derivation's grant — Intro's own +5 stacks was entirely missing. (2) `stacking:'stacking',
  // maxStacks:10` with value:4 models this as if EACH cast opens a window worth only 1 stack (4%),
  // but Derivation's real text (dump line 102) is "casting Intro Skill or Resonance Liberation
  // IMMEDIATELY GRANTS 5 STACKS" — a flat 20%-per-qualifying-cast grant, not a 1-stack ramp. With only
  // 1 real trigger event actually firing (Liberation), the old model could never exceed 1/10 stacks
  // regardless of how it stacked. Split into 2 real cast-anchored flat-value blocks — one per real
  // triggering cast in the modeled rotation — each worth the real 5-stack (20%) grant; together they
  // sum to exactly the real 40% cap once both have fired (5+5=10 stacks), matching the dump's own
  // "Intro +5/Ultimate +5" breakdown precisely. Correctly zero before Intro, 20% between Intro and
  // Liberation, 40% for the rest of the rotation.
  {
    id: 'iuno.selfbuff.blessing-of-the-wan-light-intro',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Intro:Illuminated Manifestation' },
    timing: { duration: 99 }, // sentinel: refreshed by ongoing Shield-gain stacks in the unmodeled Full Moon Domain, no natural decay sourced
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20, source: 'self-kit' }],
    note: "Derivation Inherent Skill: casting Intro Skill immediately grants 5 stacks of Blessing of the Wan Light (5 x4% = 20%) to whichever Resonator receives the shield inside the Full Moon Domain — see this file's own header comment above for the full derivation and the 2nd (Liberation) trigger.",
  },
  {
    id: 'iuno.selfbuff.blessing-of-the-wan-light-liberation',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Liberation:Beneath Lunar Tides' },
    // Target corrected 2026-09-02 from 'self' to 'whole-team' — verified against two independent live
    // sources while auditing Augusta's real-world curated recommendation list. Both quote it as
    // benefiting "the receiving Resonator"/"whichever Resonator receives the shield" inside the Full
    // Moon Domain, NOT Iuno exclusively — this is the exact mechanism the community credits as giving
    // Augusta "a whopping 90% DMG Amplification... in total" (this 40% base-kit max + the outro's 50%
    // heavyDmg above = 90%, matching precisely). Was wrongly self-only, so this 40% never reached any
    // teammate at all — same-shaped bug as iuno.chain.s2 just below, which already correctly models
    // the Resonance-Chain-gated ADDITIONAL 40% as whole-team.
    timing: { duration: 99 }, // sentinel: same reasoning as the Intro grant above
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20, source: 'self-kit' }],
    note: "Derivation Inherent Skill: casting Resonance Liberation immediately grants ANOTHER 5 stacks of Blessing of the Wan Light (5 x4% = 20%), stacking with the Intro grant above for the real 40%/10-stack cap once both have fired. Full real mechanic: +4% all DMG Amp per stack, max 10 stacks (40% total), to whichever Resonator receives the shield inside the 30s Full Moon Domain (also gainable 1 stack/0.5s from further Shield gains there — not modeled, no clean anchor), each new stack resets the 10s duration, ends early if the receiving Resonator is swapped off-field (not modeled).",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S4 correctly has NO block — pure defensive team shield, zero DPS
  //    component per the audit's own zeroing) ──
  {
    // Retargeted 2026-09-08 (full-kit audit): was `trigger:{type:'passive'}`, unconditionally active
    // for her ENTIRE kit — but the kit text is explicit this only applies "while in Lunar Cycle," a
    // real, temporary state that doesn't exist until her Liberation cast (Beneath Lunar Tides) or
    // Closing Refrain activates it. Her real modeled rotation (CHARACTER_ROTATIONS['Iuno']) opens with
    // Intro BEFORE Lunar Cycle ever starts — the old unconditional-passive version was silently
    // crediting +40% ATK to that pre-Cycle Intro hit too. Measured directly: removing the block dropped
    // Intro's own damage by ~26% (488.06 -> 359.62, exactly the 1/1.4 ATK-scaling ratio), confirming
    // Intro was wrongly getting the Lunar-Cycle-only buff. Retargeted to a cast-anchored window opening
    // on the real Liberation cast that starts Lunar Cycle in her modeled rotation (same bug class
    // already found and fixed on Camellya/Danjin/Denia/Galbrena this session). Sentinel duration since
    // her rotation stays inside Lunar Cycle (with a brief Half-Moon/New-Moon toggle) through to
    // Absolute Fullness, which ends the cycle — Outro's own swap-out damage fires on the same cast per
    // the rotation's own note ("swap out on this cast"), so the sentinel's slight imprecision past
    // Absolute Fullness doesn't reach any further real hit.
    id: 'iuno.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Beneath Lunar Tides' },
    timing: { duration: 99 }, // sentinel: persists through the rest of the rotation (Lunar Cycle stays active until Absolute Fullness ends it)
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 40, source: 'self-kit' }],
    note: 'ATK +40% while in Lunar Cycle (confirmed exact) — now gated to start on the real cast that enters Lunar Cycle in her modeled rotation, instead of an unconditional passive that was silently crediting it to her pre-Cycle Intro hit too. +1 Resonance Energy/s inside Full Moon Domain and interrupt immunity for Arc Beyond the Edge/Absolute Fullness are NOT modeled (no home in this schema).',
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
    // instead. Originally split into per-block `scopedToBlockId` effects covering only the 2 blocks
    // that existed at the time for the named moves (iuno.basic.moonbow, iuno.skill.arc-beyond-the-edge)
    // — Moonbow Dodge Counter had no engine block yet.
    //
    // Found 2026-09-08 (full-kit re-audit): the 2026-09-07 completeness pass added
    // `iuno.dodgecounter.moonbow-dodge-counter` (a real, sourced, libDmg-categorized block) but never
    // updated this scoping list to include it — a real, silent scope-completeness gap (the same class
    // of bug the Hiyuki audit's S1/S3 re-verification checked for). Currently zero DPS impact since
    // that block is unused in the modeled rotation, but the scoping is now genuinely incomplete against
    // an existing real block that the dump's own S3 text explicitly names as one of exactly 3 buffed
    // moves — fixed so the data stays correct if that block is ever exercised by a different rotation.
    effects: [
      { stat: 'libDmg', value: 65, scopedToBlockId: 'iuno.basic.moonbow', source: 'self-kit' },
      { stat: 'libDmg', value: 65, scopedToBlockId: 'iuno.skill.arc-beyond-the-edge', source: 'self-kit' },
      { stat: 'libDmg', value: 65, scopedToBlockId: 'iuno.dodgecounter.moonbow-dodge-counter', source: 'self-kit' },
    ],
    note: 'While in Lunar Cycle, DMG dealt by Moonbow Basic ATK/Arc Beyond the Edge/Moonbow Dodge Counter Amplified by 65% (confirmed exact, all three are the game\'s own Resonance Liberation DMG-tagged moves) — scoped to all 3 corresponding blocks (Moonbow Dodge Counter is unused in the modeled rotation but its block exists and is now correctly included).',
  },
  // S4 correctly has NO block — Absolute Fullness grants a Shield = 160% of Iuno's ATK to the WHOLE
  // TEAM for 30s (not passed to the incoming Resonator on swap) — purely defensive, ZERO DPS component.
  // Inherent Skill Waxing Ascent (Data dump/Iuno/Iuno.md line 100-101, "every Basic/Heavy/Dodge
  // Counter/Resonance Skill/Resonance Liberation/Intro Skill cast grants 1 Shield = 32% of her ATK for
  // 15s") also correctly has NO block, same reasoning as S4 — purely defensive, zero DPS component.
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
  // Added 2026-09-07 (completeness pass): Minor Fortes had no block anywhere in this file.
  {
    id: 'iuno.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 8, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Crit Rate+8%, ATK%+12% (Data dump/Iuno/Iuno.md line 128-129). Unconditional, always active.',
  },
];
