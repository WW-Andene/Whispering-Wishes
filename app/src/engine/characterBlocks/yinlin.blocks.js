// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/yinlin.blocks.js
// Yinlin converted to TriggerBlocks — the fourth schema extension, and the first
// to stress-test the one remaining unproven mechanic shape flagged in
// PHASE2_PLAN.md's backlog: a DISCRETE FLAT-ATK PROC, not a %-modifier.
//
// Resonance Chain S6 "Pursuit of Justice": in the first 30s after casting
// Liberation Thundering Wrath, each Basic ATK hit has a chance to trigger
// "Furious Thunder" — a separate 419.59%-ATK Electro nuke (considered Resonance
// Skill DMG per its own kit text), up to 4 triggers per Liberation cast. This is
// a whole extra damage instance bolted onto Basic ATK, not a modifier to any
// existing hit — RESONANCE_CHAIN_DATA['Yinlin'].s6 was correctly zeroed to {} by
// Phase 1 rather than fabricating a totalMult guess with no basis in the real
// 419.59% figure (see that field's own audit comment in characters.js).
//
// Added trigger.type: 'windowed-proc' (opensOnProc/windowSeconds/maxProcs/on) +
// TriggerBlock.proc (a Proc typedef carrying the raw atkPct/category, kept OUT of
// `effects` since `effects[].stat` is %-modifier-only through applyBuff() — see
// both typedefs' docs in triggerBlocks.schema.js) + rotationSimulator.js's
// openProcWindow/tryProc, mirroring the same "name the shape here, evaluate for
// real in the state machine" split already established for windowed-cast/
// partner-outro-return/requires-prior-cast.
//
// Sourced directly from characters.js's already-audited SKILL_MULTIPLIERS
// ['Yinlin'], CHARACTER_ROTATIONS['Yinlin'], RESONANCE_CHAIN_DATA['Yinlin'],
// and CHAR_BUFF_TABLE['Yinlin'] (2026-08-31 audit). No new numbers invented here.
//
// Verified for parity against the legacy flat-table path by
// __tests__/triggerEngine-yinlin.test.js, and the windowed-proc trigger type's
// real evaluation (success/cap-forfeit/expiry cases) by
// __tests__/rotationSimulator.test.js.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Yinlin';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const YINLIN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS). `damage.hits` populated 2026-09-01 as the Stage 1
  //    proof-of-concept for the "totalMult -> hit-composed DPS" design doc (PHASE2_PLAN.md) — real
  //    per-hit %ATK, parsed straight from these same already-audited SKILL_MULTIPLIERS strings via
  //    skillMultiplierParser.js, no new numbers invented. `effects` stays [] (damage.hits is a
  //    SEPARATE field for raw hit damage, not a %-modifier — see triggerBlocks.schema.js's own doc
  //    for why it's kept out of effects). ──
  {
    id: 'yinlin.basic.zapstrings-dance',
    source: SOURCE,
    kind: 'damage',
    section: 'BasicATK',
    trigger: { type: 'cast', on: "Basic ATK:Zapstring's Dance Stage 1-4" },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits("28.81% → 33.82%×2 → 13.99%×7 → 75.16%"), category: 'basicDmg', basis: 'ATK' },
    note: "28.81% → 33.82%×2 → 13.99%×7 → 75.16% at Lv.10 across the 4-stage combo; also restores Judgment Points and can carry Furious Thunder procs while yinlin.chain.s6-pursuit-of-justice's window is open (see below).",
  },
  {
    // Added 2026-09-03 (found via a systematic block-coverage audit): CHARACTER_ROTATIONS['Yinlin']
    // has a SECOND, later Basic ATK step — 'Zapstring's Dance Stage 1' (tapped once more to restore
    // Judgment Points toward the 100 cap) — distinct from the first full Stage 1-4 combo above and
    // with no block of its own, a real silent 0-DMG gap for that step. Only the Stage 1 portion lands
    // (interrupted before later stages), so this uses just that first term (28.81%) of the same
    // already-sourced SKILL_MULTIPLIERS row, not a new number.
    id: 'yinlin.basic.zapstrings-dance-stage1',
    source: SOURCE,
    kind: 'damage',
    section: 'BasicATK',
    trigger: { type: 'cast', on: "Basic ATK:Zapstring's Dance Stage 1" },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('28.81%'), category: 'basicDmg', basis: 'ATK' },
    note: 'A single Basic Attack tap restores Judgment Points toward the 100 cap — only Stage 1 of the combo lands (28.81%), the same row as yinlin.basic.zapstrings-dance above, not a new multiplier.',
  },
  {
    // Added 2026-09-03 (same audit): Heavy ATK Standard has a real SKILL_MULTIPLIERS row (29.83%×2)
    // and a real CHARACTER_ROTATIONS step ('HOLD Heavy Attack — consumes Stamina for a puppet
    // strike'), but had no block at all — a real silent 0-DMG gap.
    id: 'yinlin.heavy.standard',
    source: SOURCE,
    kind: 'damage',
    section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Standard' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('29.83%×2'), category: 'heavyDmg', basis: 'ATK' },
    note: 'HOLD Heavy Attack — consumes Stamina for a puppet strike, cast right before Lightning Execution in the real rotation.',
  },
  {
    // Added 2026-09-03 (same audit): Intro Raging Storm has a real SKILL_MULTIPLIERS row (14.32%×10)
    // and is the very first step of her real rotation ('Swap into her — fires automatically'), but had
    // no block at all — a real silent 0-DMG gap on her opener.
    id: 'yinlin.intro.raging-storm',
    source: SOURCE,
    kind: 'damage',
    section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Raging Storm' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // category/basis added for Layer 4 migration — were entirely missing. No override text names a
    // different category, same default-to-skillDmg convention applied project-wide for a generically
    // labeled opener hit.
    damage: { hits: parseSkillMultiplierHits('14.32%×10'), basis: 'ATK' },
    note: 'Swap into her — fires automatically, hits a large area and applies Sinner\'s Mark.',
  },
  {
    id: 'yinlin.skill.magnetic-roar',
    source: SOURCE,
    kind: 'damage',
    section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Magnetic Roar' },
    timing: { cooldown: 12 },
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%×3'), category: 'skillDmg', basis: 'ATK' },
    note: 'Magnetic Roar: 59.65%×3 at Lv.10. Puts Yinlin into 10s Execution Mode and applies Sinner\'s Mark.',
  },
  {
    id: 'yinlin.skill.lightning-execution',
    source: SOURCE,
    kind: 'damage',
    section: 'Skill',
    // Split into its OWN block 2026-09-01 (was previously folded into yinlin.skill.magnetic-roar as
    // one combined block sharing Magnetic Roar's trigger, which meant this cast's own real
    // 'cast:Skill:Lightning Execution' key — the exact key CHARACTER_ROTATIONS' own separate
    // Lightning Execution step produces — could never resolve through simulateRotation() on its own.
    // A real gap, found while building the Stage 1 hit-composed prototype: two rotation steps need
    // two blocks, same "split shared multi-hit nodes" precedent Camellya's S5 already established.
    trigger: { type: 'cast', on: 'Skill:Lightning Execution' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('89.47%×4'), category: 'skillDmg', basis: 'ATK' },
    note: 'Lightning Execution: 89.47%×4 at Lv.10. Only castable for free as the immediate follow-up to Magnetic Roar — cast late, or swap out first, and it goes on a separate cooldown instead. That cast-order dependency is NOT modeled as a trigger condition yet (unconditional cast trigger here) — same simplification the flat table already carried; not attempted in this pass, which was scoped to the hit-composition data prerequisite only.',
  },
  {
    id: 'yinlin.liberation.thundering-wrath',
    source: SOURCE,
    kind: 'damage',
    section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Thundering Wrath' },
    timing: { cooldown: 16 },
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('116.56%×7'), category: 'libDmg', basis: 'ATK' },
    note: '116.56%×7 at Lv.10; re-applies Sinner\'s Mark. Also OPENS the S6 Furious Thunder proc window — see yinlin.chain.s6-pursuit-of-justice below.',
  },
  {
    id: 'yinlin.forte.chameleon-cipher',
    source: SOURCE,
    kind: 'damage',
    section: 'Forte',
    trigger: { type: 'resource-threshold', resource: 'Judgment Points', threshold: 100, resourceStepOn: 'Forte:Chameleon Cipher' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('178.93%×2'), category: 'heavyDmg', basis: 'ATK' },
    note: '178.93%×2 at Lv.10; auto-replaces Heavy Attack at 100/100 Judgment Points, consumes all 100, upgrades any Sinner\'s Mark on the target to an 18s Punishment Mark.',
  },
  {
    id: 'yinlin.coordatk.judgement-strike',
    source: SOURCE,
    kind: 'damage',
    section: 'Buff',
    trigger: { type: 'on-hit' },
    condition: { requiresStance: 'Punishment Mark' },
    timing: { cooldown: 1 },
    target: { scope: 'marked-enemy' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('78.64%'), category: 'coordDmg', basis: 'ATK' },
    note: '78.64% at Lv.10; a Punishment-Marked target taking ANY damage (even off-field) auto-triggers this Coordinated ATK, capped 1/second.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'yinlin.outro.strategist',
    source: SOURCE,
    kind: 'buff',
    section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 14, forfeitOnRecipientSwapOut: true },
    target: { scope: 'next-on-field' },
    condition: { element: 'electro' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh', source: 'teammate-ally-action' },
      { stat: 'libDmg', value: 25, stacking: 'refresh', source: 'teammate-ally-action' },
    ],
    // Retrofitted 2026-09-03 (REMAINING_WORK.md 1a): forfeitOnRecipientSwapOut now actually clamps
    // this to the incoming Resonator's own swap-out instant when it's shorter than the full 14s.
    note: 'Outro Strategist: the incoming Resonator gets +20% Electro DMG Amp and +25% Resonance Liberation DMG Amp for 14s — ends early if that Resonator is switched out.',
  },
  {
    id: 'yinlin.selfbuff.pain-immersion',
    source: SOURCE,
    kind: 'buff',
    section: 'Buff',
    trigger: { type: 'cast', on: 'Skill:Magnetic Roar' },
    timing: { duration: 5 },
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 15, stacking: 'refresh', source: 'self-kit' }],
    note: "Inherent Skill Pain Immersion: Crit Rate +15% for 5s after casting Magnetic Roar.",
  },
  {
    // Added 2026-09-03 against a real browser snapshot: Inherent Skill Deadly Focus was entirely
    // missing from this file. Two components, both real: (1) Lightning Execution DMG+10% vs Sinner's-
    // Marked targets — since the modeled rotation always has Sinner's Mark up by the time Lightning
    // Execution casts (applied by Intro, re-applied by Thundering Wrath), scoped here directly to
    // yinlin.skill.lightning-execution to avoid over-crediting Magnetic Roar/Furious Thunder, her other
    // skillDmg-categorized moves. (2) self ATK+10% for 4s on trigger — see the separate
    // yinlin.selfbuff.deadly-focus-atk block below (also added in CHAR_BUFF_TABLE.selfBuffs).
    id: 'yinlin.selfbuff.deadly-focus-dmg',
    source: SOURCE,
    kind: 'buff',
    section: 'Buff',
    trigger: { type: 'passive' },
    condition: { requiresStance: "Sinner's Mark" },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 10, scopedToBlockId: 'yinlin.skill.lightning-execution', source: 'self-kit' }],
    note: "Inherent Skill Deadly Focus: Lightning Execution DMG +10% vs Sinner's-Marked targets.",
  },
  {
    id: 'yinlin.selfbuff.deadly-focus-atk',
    source: SOURCE,
    kind: 'buff',
    section: 'Buff',
    trigger: { type: 'cast', on: 'Skill:Lightning Execution' },
    timing: { duration: 4 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 10, stacking: 'refresh', source: 'self-kit' }],
    note: "Inherent Skill Deadly Focus: self ATK +10% for 4s after Lightning Execution hits a Sinner's-Marked target — modeled as unconditional on the cast, matching the same rotation-always-marked simplification as the DMG component above.",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — re-verified 2026-08-31) ──
  {
    id: 'yinlin.chain.s1-moralitys-crossroad',
    source: SOURCE,
    kind: 'buff',
    section: 'Chain',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 70, source: 'self-kit' }],
    note: 'Magnetic Roar and Lightning Execution deal 70% more damage.',
  },
  {
    id: 'yinlin.chain.s2-ensnarled-by-rapport',
    source: SOURCE,
    kind: 'utility',
    section: 'Chain',
    trigger: { type: 'on-hit' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: 'Electromagnetic Blast recovers +5 Judgment Points and +5 Resonance Energy on hit — pure resource/Concerto-Energy utility, zero DPS component. TODO: needs Phase 2 schema — a resource-gain-on-hit effect shape this block model doesn\'t have yet (same gap as Camellya S2-style nodes elsewhere).',
  },
  {
    id: 'yinlin.chain.s3-unyielding-verdict',
    source: SOURCE,
    kind: 'buff',
    section: 'Chain',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'coordDmg', value: 55, source: 'self-kit' }],
    note: "Judgement Strike's DMG Multiplier +55%. Fixed 2026-09-03: previously modeled as skillDmg, but Judgment Strike is a Coordinated Attack (yinlin.coordatk.judgement-strike is categorized coordDmg, matching the source's own Review/Synergies text) — the old skillDmg value was a dead-for-its-intended-target buff that instead over-credited Magnetic Roar/Lightning Execution/Furious Thunder.",
  },
  {
    id: 'yinlin.chain.s4-steadfast-conviction',
    source: SOURCE,
    kind: 'buff',
    section: 'Chain',
    trigger: { type: 'on-hit' },
    condition: { requiresStance: 'Punishment Mark' },
    timing: { duration: 12 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh', source: 'self-kit' }],
    note: 'On a Judgement Strike hit: team ATK +20% for 12s. Modeled as on-hit + duration rather than the always-on flat application RESONANCE_CHAIN_DATA was forced into (its own comment already flags the 12s duration/on-hit condition as unrepresentable there).',
  },
  {
    id: 'yinlin.chain.s5-resounding-will',
    source: SOURCE,
    kind: 'buff',
    section: 'Chain',
    trigger: { type: 'passive' },
    condition: { requiresStance: "Sinner's Mark" },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 100, source: 'self-kit' }],
    note: "Thundering Wrath deals 100% extra DMG to Sinner's/Punishment-Marked targets — conditional on the target carrying a mark, not unconditional (flagged as such in RESONANCE_CHAIN_DATA's own comment).",
  },
  {
    id: 'yinlin.chain.s6-pursuit-of-justice',
    source: SOURCE,
    kind: 'damage',
    section: 'Chain',
    // The one previously-unproven mechanic shape: a discrete, repeatable, capped extra-hit proc,
    // not a %-modifier — see file header. RESONANCE_CHAIN_DATA['Yinlin'].s6 was correctly zeroed
    // ({}) by Phase 1 rather than fabricate a totalMult guess for this.
    trigger: {
      type: 'windowed-proc',
      opensOnProc: ['cast:Liberation:Thundering Wrath'],
      windowSeconds: 30,
      maxProcs: 4,
      on: "Basic ATK:Zapstring's Dance Stage 1-4",
    },
    timing: {},
    target: { scope: 'marked-enemy' },
    effects: [],
    // damage payload added for Layer 4 schema validity — this block's real per-hit number lives in
    // `proc` (see resolveHitComposedDps.js's own doc: it reads `proc` when `damage.hits` is empty),
    // so `hits` stays empty on purpose; category/basis mirror the proc's own values.
    damage: { hits: [], basis: 'ATK' },
    proc: { atkPct: 419.59, category: 'skillDmg' },
    note: 'Furious Thunder: in the first 30s after casting Thundering Wrath, each Basic ATK hit has a chance to trigger a separate 419.59%-ATK Electro nuke (considered Resonance Skill DMG per kit text), up to 4 triggers per Liberation cast. Previously unrepresentable in the flat schema (RESONANCE_CHAIN_DATA.s6 was correctly zeroed rather than guessing a totalMult) — the raw proc number now lives in this block\'s `proc` field (see triggerBlocks.schema.js\'s Proc typedef); resolveTriggerBlocks() does not yet route it through applyBuff() (same documented boundary as every other empty-effects damage block), but the real 419.59%/4-cap/30s-window figures are captured and the window/cap are now REALLY evaluated by rotationSimulator.js\'s openProcWindow/tryProc, not just hand-fed.',
  },
];
