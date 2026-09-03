// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/qingxiao.blocks.js
// Qingxiao converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Qingxiao'], RESONANCE_CHAIN_DATA['Qingxiao'] (+ its own
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Qingxiao'], and CHARACTER_ROTATIONS['Qingxiao']. No new
// numbers invented. Her base-kit Mindlock mechanic (self skillDmg buff + enemy
// deepen debuff, both nonlinear: first 7 stacks worth 7% each, remaining stacks
// worth 2% each, up to 15 stacks base) is modeled at its documented flat ceiling
// value rather than the real nonlinear per-stack curve, which this schema's
// single value+maxStacks stacking shape can't represent losslessly.
//
// appliesTags: ['shifting'] added 2026-09-02 (the engine-architecture history (git log) item 9, Phase 2) on every real
// damage-dealing block: Forte Circuit's own Draw and Sunder text, confirmed verbatim from the raw
// Prydwen page, is "Qingxiao inflicts Tune Strain - Shifting on the target after dealing damage
// WITH SKILLS. Each skill can only trigger this once for the same target" — "skills" here is the
// game's own generic term for any of her active abilities (Basic/Heavy/Skill/Liberation/Forte/Intro/
// Outro), not narrowly the Resonance Skill button; confirmed by explicit user clarification after an
// initial narrower reading was flagged as ambiguous rather than assumed. This is what makes her own
// S4 (chain.s4-actor, see below) self-trigger on nearly every one of her own casts, not just her
// Resonance Skill.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Qingxiao';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const QINGXIAO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'qingxiao.intro.tonality-shift',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Tonality Shift' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('39.79%+46.42%×2') },
    note: 'Grants 30 points of Sword Cadence plus Resonant Chime.',
  },
  {
    id: 'qingxiao.midair.stringblade-stage1-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Mid-air:Mid-air Attack - Stringblade Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    // category fixed 2026-09-02: WuWa's own general mechanic (Mid-air/Plunging Attacks inherit Basic
    // ATK or Heavy ATK DMG, never their own type) plus the dump's own kit structure — listed under
    // "Basic Attack — Strings to Steel", not Heavy Attack — confirms basicDmg.
    damage: { hits: parseSkillMultiplierHits('7.24%×5+54.28% → 44.89%+22.45%×2 → 11.14%×5+83.51%'), category: 'basicDmg' },
    note: 'Builds Qin Heart/Sword Cadence toward her Heavy Attack.',
  },
  {
    id: 'qingxiao.basic.stringblade-stage1-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Basic Attack - Stringblade Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('30.13%×2 → 37.09%×2 → 24.36%×4 → 86.73%+5.43%×4'), category: 'basicDmg' },
    note: 'Ground continuation of the Mid-air Attack combo.',
  },
  {
    id: 'qingxiao.skill.severing-note-judgement',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Severing Note: Judgement' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('20.88%×2+97.42%'), category: 'skillDmg' },
    note: 'Grants 45 points of Qin Heart.',
  },
  {
    id: 'qingxiao.heavy.stringblade',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Heavy Attack - Stringblade' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('14.62%×3+21.92%×6+263.03%'), category: 'heavyDmg' },
    note: 'Once Qin Heart and Sword Cadence are both full; consumes both and enters Ephemeral Transcendence.',
  },
  {
    id: 'qingxiao.forte.ephemeral-transcendence-stage1-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Basic Attack - Ephemeral Transcendence Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('44.89%+22.45%×2 → 23.11%×5 → 20.88%×3+31.32%×2 → 18.10%×4+108.56%'), category: 'basicDmg' },
    note: 'Enhanced 4-hit combo while in Ephemeral Transcendence, builds Heart Sword Intent toward the finisher.',
  },
  {
    id: 'qingxiao.forte.heavens-reckoning',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Forte:Heavy Attack - Heaven's Reckoning: Ephemeral Transcendence" },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('27.84%×9+445.34%'), category: 'heavyDmg' },
    note: 'Once Heart Sword Intent is full; consumes it and ends Ephemeral Transcendence. Her single hardest-hitting move.',
  },
  {
    id: 'qingxiao.liberation.billows-beneath-heaven',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Billows Beneath Heaven' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: parseSkillMultiplierHits('33.41%×10+1336.01%'), category: 'libDmg' },
    note: 'Best saved for last so pre-Ultimate buffs are fully stacked before it fires.',
  },
  {
    id: 'qingxiao.outro.lingering-song',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'],
    damage: { hits: [{ atkPct: 800 }] },
  },

  // ── Buff/debuff blocks (from CHAR_BUFF_TABLE, base-kit Mindlock mechanic) ──
  // qingxiao.selfbuff.mindlock REMOVED 2026-09-02: it duplicated the SAME real mechanic as
  // qingxiao.debuff.mindlock below (confirmed against the raw dump — Characters data dump/Qingxiao/
  // Qingxiao.md lines 41 and 60, both describing ONE enemy-side "DMG taken" amplification, not a
  // separate self-buff) — modeled twice via two different stat channels (self totalMult AND enemy
  // deepen). This was invisible while `stat:'totalMult'` was a dead no-op everywhere in the engine
  // (see the engine-merge history (git log)'s totalMult architecture-bug writeup, fixed same day) — once totalMult
  // actually applies, keeping both would double-count Mindlock's real damage contribution. The single
  // correct model is the enemy-side debuff below.
  {
    id: 'qingxiao.debuff.mindlock',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'passive' },
    timing: { duration: 30 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'deepen', value: 65 }],
    note: 'Base kit Forte (Mindlock) + Inherent Skill To Know, To Banish (same single mechanic, described twice in the dump): targets w/ Mindlock take +2%/stack (+5% more for the first 7) from her key skills, up to 15 base-kit stacks — corrected 2026-09-02 from a wrong 49% to the dump\'s own confirmed "+65% DMG Amplification... 7% for the first 7 stacks, 2% for the next 8" (7×7 + 8×2 = 65, not 49 — the prior value was simply arithmetically wrong). Modeled at the documented flat ceiling value rather than the real nonlinear per-stack curve, which this schema\'s stacking shape can\'t represent losslessly (the engine-merge history (git log) Phase 0.5 gap #1). S2 (not S1 — see that node\'s own corrected note) raises the stack cap to 25 (not modeled — tied to gap #1). S6 chain adds a further flat +40% (see qingxiao.chain.s6).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic) ──
  {
    id: 'qingxiao.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 16 }],
    note: "Corrected 2026-09-02 against the raw dump (Characters data dump/Qingxiao/Qingxiao.md line 69): Crit Rate +16% is real and confirmed, but the stack-cap raise this note previously attributed to S1 actually belongs to S2 (see that node's own note) — S1's OWN real additional mechanic is a separate, currently entirely UNMODELED proc: Swordlight Ward cap +1 (to 2), 25 Exorcising Seal on combat entry, and \"after a Basic Attack/Mid-air/Ephemeral Transcendence Basic hit lands, if she has Exorcising Seal, consumes it to trigger Juque Perdition — Aero DMG = 400% ATK, considered Basic Attack DMG (once per second)\" (Exorcising Seal caps at 25). A real, sourced DPS-contributing proc, not yet built — logged as a new Phase A finding, not modeled here (needs a windowed-proc-style block with a real per-second ICD and a 25-charge consumable resource, more than a quick addition).",
  },
  {
    id: 'qingxiao.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Heavy Attack - Stringblade' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 40 }],
    note: "Heavy Attack multiplier +40% (confirmed) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5. Corrected 2026-09-02: ALSO raises the Mindlock stack cap from 15 to 25 (after combat entry) — was previously wrongly attributed to S1's own note; not modeled here either (tied to the engine-merge history (git log) Phase 0.5 gap #1, the unbuilt nonlinear stacking curve).",
  },
  {
    id: 'qingxiao.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Billows Beneath Heaven' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 100 }],
    note: 'Liberation (Billows Beneath Heaven) Crit DMG +100% (confirmed) — cast-scoped (instant, no persistent duration). Also documented in CHAR_BUFF_TABLE\'s own selfBuffs entry for this same node (not modeled as a separate duplicate block).',
  },
  {
    id: 'qingxiao.chain.s4',
    source: SOURCE, kind: 'buff',
    // Retrofitted 2026-09-02 (the engine-merge history (git log) Phase 0.5 gap #2 — the ally-action mechanism
    // existed but this block predated it) using the dump's own exact text: "After any teammate
    // inflicts Shifting, their ATK +20% for 8s." — "their" is the ALLY who inflicted it, not Qingxiao
    // herself (this includes Qingxiao when SHE inflicts Shifting via her own kit, since every one of
    // her real damage blocks already carries appliesTags:['shifting'] — her own casts now correctly
    // self-trigger this too, not as a special case, just because 'shifting' is a shared tag any
    // 'ally-action' consumer reads regardless of source). Was previously modeled as an unconditional,
    // permanent SELF buff — wrong on three counts: wrong recipient (self instead of whoever applied
    // Shifting), wrong trigger (passive instead of ally-action), wrong duration (indefinite instead of
    // the real 8s window).
    trigger: { type: 'ally-action', action: 'shifting' },
    timing: { duration: 8 },
    target: { scope: 'trigger-actor' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: 'After any teammate inflicts Shifting, THEIR (the inflictor\'s) ATK +20% for 8s — confirmed verbatim from the dump.',
  },
  {
    id: 'qingxiao.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Severing Note: Judgement' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 100 }],
    note: "Skill multiplier +100% (confirmed) — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'qingxiao.chain.s6',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'all-enemies' },
    effects: [{ stat: 'deepen', value: 40 }],
    note: 'DMG Taken +40% flat, scoped narrower than a universal vulnerability in the real text (only applies to Heavy Attack - Stringblade, Heaven\'s Reckoning: Ephemeral Transcendence, Billows Beneath Heaven, and Juque Perdition, not her full kit) — kept as-is since deepen is the closest available category and the value is exact per the re-audit.',
  },
];
