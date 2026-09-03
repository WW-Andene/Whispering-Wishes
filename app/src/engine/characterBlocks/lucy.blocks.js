// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lucy.blocks.js
// Lucy converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Lucy'], RESONANCE_CHAIN_DATA['Lucy'] (+ its own audit comment,
// read directly for each node's real mechanic), SKILL_MULTIPLIERS['Lucy'], and
// CHARACTER_ROTATIONS['Lucy']. No new numbers invented.
//
// Fixed 2026-09-02 against a real prydwen.gg .mht snapshot (SKILL_MULTIPLIERS rebuilt from it, see
// that table's own header comment): Payload's previously-truncated value ("...") is now the real
// full Charge+Follow-Up total; lucy.basic.thread-shredding-stage1-4 and
// lucy.heavy.dual-threading are newly added — both are real CHARACTER_ROTATIONS steps that
// previously had no matching SKILL_MULTIPLIERS row at all (silently 0 DMG).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Lucy';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const LUCY_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'lucy.intro.outdated-hallucination',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Outdated Hallucination' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('69.14%×2') },
    note: 'Grants the team wallhack vision for 25s.',
  },
  {
    id: 'lucy.skill.payload',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Payload' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-02: previously '20.05%+10.03%+40.09%' — a lower bound, since the old source
    // string was truncated with a literal "...". A real .mht snapshot gives the full split: Charge
    // DMG (20.05%+10.03%) plus its automatic Follow-Up Attack (40.09%+10.03%+20.05%), combined here
    // since both fire off the one 'Payload' rotation step.
    damage: { hits: parseSkillMultiplierHits('20.05%+10.03%+40.09%+10.03%+20.05%'), category: 'skillDmg' },
    note: 'Charge + automatic Follow-Up Attack. Applies Hack: Shifting, auto-chains into Pulse Interference.',
  },
  {
    id: 'lucy.skill.pulse-interference',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Pulse Interference' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('30.86%×2+61.72%×3+61.72%'), category: 'skillDmg' },
    note: 'Fires automatically off the Payload follow-up, grants Digital Handshake (passive TCP/s while on-field). See lucy.chain.s2-bonus-hit below for the real S2 flat bonus hit that fires after this.',
  },
  {
    id: 'lucy.basic.locked-thread-stage2-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Locked Thread Stage 2-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Locked Thread Stage 1-4' has 4 arrow-separated stages; this step uses stages 2-4 (skips
    // Stage 1's own segment, per its own "Stage 2-4" label).
    damage: { hits: parseSkillMultiplierHits('20.66%+20.05%×2 → 36.06%×2+48.08% → 31.02%+15.51%×3+38.77%×2'), category: 'basicDmg' },
    note: 'Builds TCP toward 100.',
  },
  {
    id: 'lucy.skill.deadlock',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Deadlock' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Last segment of the 'Payload / Pulse Interference / Deadlock' row.
    damage: { hits: parseSkillMultiplierHits('51.70%+206.77%'), category: 'heavyDmg' },
    note: 'Once TCP hits 100/100, replaces Skill — counted as Heavy ATK DMG. Applies Hack: Shifting, enters 8s Algorithm Compaction (+65% Spectro DMG Bonus, 1 SQL stack).',
  },
  {
    id: 'lucy.basic.thread-shredding-stage1-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Thread Shredding Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Added 2026-09-02: previously not modeled (no matching SKILL_MULTIPLIERS row at all — this real
    // rotation step was silently 0 DMG), now sourced from a real .mht snapshot.
    damage: { hits: parseSkillMultiplierHits('19.49%×4 → 22.27%×5 → 28.12%×5 → 25.06%×5'), category: 'heavyDmg' },
    note: 'Algorithm Compaction Basic ATK replacement (considered Heavy Attack DMG per its own kit text) — builds Root Access toward 100.',
  },
  {
    id: 'lucy.heavy.dual-threading',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Dual Threading' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Added 2026-09-02: previously not modeled (no matching SKILL_MULTIPLIERS row at all — this real
    // rotation step was silently 0 DMG), now sourced from a real .mht snapshot.
    damage: { hits: parseSkillMultiplierHits('33.41%×5'), category: 'heavyDmg' },
    note: 'Once Root Access hits 100/100, replaces Single Threading — consumes all Root Access, auto-chains straight into Multi-threading.',
  },
  {
    id: 'lucy.heavy.multi-threading',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Multi-threading' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%+59.65%×3'), category: 'heavyDmg' },
    note: 'Fires automatically off Dual Threading, consumes banked SQL stack for a +270% DMG Multiplier bonus (see lucy.chain.s2 below), applies Hack: Shifting.',
  },
  {
    id: 'lucy.liberation.old-net-deep-dive',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Old Net Deep Dive' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // The row's upgraded 'Old Net Deep Dive' parenthetical value is used, matching the real rotation
    // step (which uses this upgraded Ultimate branch, not the base 894.65% Override).
    damage: { hits: parseSkillMultiplierHits('1789.29%'), category: 'heavyDmg' },
    note: 'Upgraded Ultimate: freezes time for 10s, marks up to 5 targets with chosen Spoofing Programs, then triggers Override — an AoE Heavy ATK-type nuke on all marked targets (counted as Heavy ATK DMG despite the Liberation input).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'lucy.outro.countermeasure-program',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'basicDmg', value: 25, stacking: 'refresh' }],
    note: 'Also triggers a team-wide 25s Hack-Shifting response buff (see lucy.chain.s4 below) and a 30% DMG Reduction proc for hit teammates, not modeled (no DPS component).',
  },
  {
    id: 'lucy.debuff.breach-protocol',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'cast', on: 'Liberation:Old Net Deep Dive' },
    timing: { duration: 30 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'defShred', value: 5 }],
    note: 'Spoofing Program: Breach Protocol — one of the Spoofing Programs chosen during Old Net Deep Dive, modeled as anchored to that cast.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'lucy.chain.s1',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-02: was `trigger:{type:'passive'}`, modeled as an unconditional always-on +20%
    // ATK — but the source is explicit this is conditional: "Casting Intro Skill - Outdated
    // Hallucination increases ATK by 20% for 14s." Converted to cast-scoped on the real Intro cast
    // with the real 14s duration (still a real, sourced buffWindow shape, not the dead cast+no-duration
    // no-op pattern — this one HAS a duration, so it correctly enters buffWindows).
    trigger: { type: 'cast', on: 'Intro:Outdated Hallucination' },
    timing: { duration: 14 }, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: 'Casting Intro Skill grants +20% ATK for 14s.',
  },
  {
    id: 'lucy.chain.s2',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-02: was `trigger:{type:'cast',...}` with no `timing.duration` — the same dead
    // cast-scoped/no-duration `kind:'buff'` no-op shape found on Carlotta's S1/S2 and Galbrena's S3
    // (the engine-architecture history (git log) item 12), so this never actually applied. Converted to
    // `trigger:{type:'passive'}` + `scopedToBlockId` (Augusta's S3 pattern) so it fires and stays
    // scoped to only Multi-threading's own hit.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 30, scopedToBlockId: 'lucy.heavy.multi-threading' }],
    note: "Raises Heavy Attack - Multi-threading's SQL DMG Mult from 270% to 560% (conditional, only on SQL-consuming casts) and grants +32 starting RAM (from 24, resource-economy, not modeled) — none of this reduces to a flat always-on heavyDmg% (calcEngine.js applies heavyDmg unconditionally to every Heavy ATK instance, which the real effect isn't), kept as an approximated totalMult per the audit comment's own reasoning. See lucy.chain.s2-bonus-hit below for the node's separately-representable real bonus hit.",
  },
  {
    id: 'lucy.chain.s2-bonus-hit',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Pulse Interference' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 450 }], category: 'heavyDmg' },
    note: 'S2 also adds a separate flat extra hit worth 450% ATK as Heavy DMG after Pulse Interference — modeled as a real proc-style damage block using the source\'s own exact figure, instead of folding it into the lossy totalMult:30 approximation above (same "discrete proc, not a modifier" treatment as Yinlin\'s S6/Calcharo\'s S6).',
  },
  {
    id: 'lucy.chain.s3',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-02: 2 stacked bugs, same shape as Galbrena's S3. (1) was `trigger:{type:'cast',
    // ...}` with no `timing.duration` — the same dead cast-scoped/no-duration no-op shape as S2
    // above — converted to `trigger:{type:'passive'}` + `scopedToBlockId`. (2) `stat:'libDmg'` when
    // its target block (`lucy.liberation.old-net-deep-dive`) is `category:'heavyDmg'` (Old Net Deep
    // Dive's Override is "considered Heavy Attack DMG" per its own kit text) — category-gated stats
    // only apply to matching-category hits, so this was ALSO independently a no-op. Fixed to
    // `heavyDmg`. `critDmg` isn't category-gated, so it only had the dead-trigger bug, not this one.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'heavyDmg', value: 50, scopedToBlockId: 'lucy.liberation.old-net-deep-dive' },
      { stat: 'critDmg', value: 100, scopedToBlockId: 'lucy.liberation.old-net-deep-dive' },
    ],
    note: "Override DMG Mult +50% + Crit DMG +100% on Liberation (confirmed exact).",
  },
  {
    id: 'lucy.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Payload' },
    // Fixed 2026-09-02: duration was 25 (the Outro's OWN separate 25s Countermeasure Program window,
    // per lucy.outro.countermeasure-program's note above) — conflated two different real buffs, not a
    // rounding drift. S4's own kit text is explicit: "...gain 20% all-Attribute DMG Bonus for 20s."
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20, stacking: 'refresh' }],
    note: 'Team +20% All-Attribute DMG on Hack-Shifting for 20s (confirmed exact, team-wide) — modeled on the Payload cast, the first real rotation step that applies Hack: Shifting.',
  },
  {
    id: 'lucy.chain.s5',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-02: was `totalMult:5` with no textual basis at all — a real .mht snapshot's S5
    // text is 100% defensive/survivability ("Optical Illusion stack limit increased to 2... gains a
    // Shield equal to 150% of ATK for 10s"), no DMG Multiplier mentioned anywhere. Zeroed, matching
    // the established "invented number with no basis" removal precedent (e.g. Augusta's S5,
    // Brant's S1, Phrolova's S5).
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [],
    note: 'Purely defensive: Optical Illusion stack cap 1→2, HP<50% auto-triggers a stack (180s CD), grants a 150%-ATK 10s Shield on trigger. Zero DPS component — no fabricated value.',
  },
  {
    id: 'lucy.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 40 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive, applies to her Heavy ATK-categorized blocks above.',
  },
];
