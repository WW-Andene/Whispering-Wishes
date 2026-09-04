// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/phoebe.blocks.js
// Phoebe converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Phoebe'], RESONANCE_CHAIN_DATA['Phoebe'] (+ its own detailed
// audit comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Phoebe'], and CHARACTER_ROTATIONS['Phoebe']. No new numbers invented. Her real
// CHARACTER_ROTATIONS stays entirely in Absolution mode (never Confession), so the
// Confession-only Outro/debuff blocks are present (matching CHAR_BUFF_TABLE) but
// inert in the standard rotation. Two real own-kit DMG Multiplier bonuses (+255%
// Absolution on Liberation/Outro, +256% Frazzle-target Amp on Starflash) are kit-
// inherent (not Resonance Chain) and modeled as separate cast-scoped buff blocks,
// distinct from S1-S6. S6's free bonus Starflash proc is modeled (added 2026-09-03,
// see phoebe.chain.s6-free-starflash) by reusing Starflash's own multiplier — a
// fresh source pull confirmed it's the same move, not a uniquely-scaled instance.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Phoebe';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const PHOEBE_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'phoebe.intro.golden-grace',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Golden Grace' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus. No override text names a different category, same default-
    // to-skillDmg convention as Calcharo/Encore/Jianxin/Lingyang/Aalto/Baizhi/Chixia/Danjin.
    damage: { hits: parseSkillMultiplierHits('198.8%'), category: 'skillDmg' },
  },
  {
    id: 'phoebe.skill.to-where-light-shines',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:To Where Light Shines' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('62.6%×2'), category: 'skillDmg' },
    note: 'Plants a Ring of Mirrors (30s, freezes hit targets 2s). Standing inside it swaps Basic ATK to Chamuel\'s Star for the rest of the rotation.',
  },
  {
    id: 'phoebe.forte.absolution-litany',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Absolution Litany' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized. The dump's
    // own Forte Circuit text explicitly names this cast "Heavy Attack: Absolution Litany" (cast by
    // holding Basic Attack at full Prayer) — it IS a Heavy Attack for weapon/echo DMG-bonus purposes,
    // matching the dump's "Heavy 43.8%" being by far her largest Damage Profile bucket (Starflash x4 +
    // Absolution Litany combined). Miscategorization bug class already found on Luuk Herssen's kit.
    damage: { hits: parseSkillMultiplierHits('638.2%'), category: 'heavyDmg' },
    note: 'Prayer gauge fills passively (5/s, 120 cap). Enters Absolution mode, applies 1 Spectro Frazzle stack, refills Divine Voice to 60.',
  },
  {
    id: 'phoebe.liberation.dawn-of-enlightenment',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Dawn of Enlightenment' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('401.6%'), category: 'libDmg' },
    note: 'Base (non-Absolution-boosted) value; see phoebe.kit.dawn-of-enlightenment-absolution-mult below for the +255% Absolution DMG Multiplier bonus this cast gets in her real (Absolution-mode) rotation.',
  },
  {
    id: 'phoebe.skill.chamuels-star',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Skill:Chamuel's Star 1-3" },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was skillDmg, contradicting the
    // dump's own explicit kit text — "Inside the ring, Basic Attack → Chamuel's Star (up to 3 attacks,
    // considered Basic Attack DMG)" — Chamuel's Star is a Basic ATK replacement, not Resonance Skill
    // DMG, so it was silently excluded from Basic ATK DMG Bonus buffs and wrongly credited to Skill DMG
    // Bonus ones instead. Same miscategorization-vs-dump-text bug class already found on Luuk Herssen.
    damage: { hits: parseSkillMultiplierHits('59.4% → 39.8%×2 → 28.9%×6'), category: 'basicDmg' },
    note: "Basic ATK replacement while standing inside the Ring of Mirrors; counted as Basic Attack DMG per the dump's own text.",
  },
  {
    id: 'phoebe.forte.starflash',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Starflash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('82.7%×3'), category: 'heavyDmg' },
    note: 'Heavy ATK replacement once Divine Voice > 0. Real rotation repeats "3 Basics into Starflash" 4x per Absolution Litany (60/15 Divine Voice) — only one CHARACTER_ROTATIONS step models this, so it fires once here rather than 4x. See phoebe.kit.starflash-frazzle-amp below for the +256% Frazzle-target DMG Amp bonus.',
  },
  {
    id: 'phoebe.outro.attentive-heart',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // excluded from the outroDmg weapon/echo bonus bucket — same recurring bug class already found on
    // Lynae's/Mornye's Outro blocks. Same outroDmg convention as Calcharo/Carlotta/Chixia/Encore/
    // Lingyang/Lynae/Rover: Havoc/Xiangli Yao.
    damage: { hits: parseSkillMultiplierHits('528.4%'), category: 'outroDmg' },
    note: 'Base (non-Absolution-boosted) value; see phoebe.kit.attentive-heart-absolution-mult below for the +255% Absolution DMG Multiplier bonus this cast gets in her real (Absolution-mode) rotation. In Confession mode this instead grants Silent Prayer (see phoebe.outro.confession-* blocks below), not modeled here since her real rotation stays in Absolution.',
  },

  // ── Own-kit DMG Multiplier bonuses (NOT Resonance Chain — real, sourced values from her base kit
  //    text, cast-scoped like every other "own multiplier" block in this file) ──
  // Fixed 2026-09-03: all 3 of these were `kind:'buff'` blocks with a non-passive trigger
  // (`'cast'`/`'swap-out'`) and NO `timing.duration` — the item-12 dead-buff architecture bug
  // (the engine-architecture history (git log)): resolveHitComposedDps.js's statsAtInstant() only reads `passiveBlocks`
  // (trigger.type==='passive') and `buffWindows` (duration != null); any non-passive trigger with no
  // duration is invisible regardless of trigger type. All 3 were silent no-ops — together they cover
  // nearly her entire multiplier stack (+255% Liberation, +255% Outro, +256% Starflash Frazzle Amp).
  // Fixed via `trigger:{type:'passive'}` + `scopedToBlockId`, matching the pattern used everywhere
  // else this bug was found this session.
  {
    id: 'phoebe.kit.dawn-of-enlightenment-absolution-mult',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 255, scopedToBlockId: 'phoebe.liberation.dawn-of-enlightenment' }],
    note: 'Dawn of Enlightenment deals a single (non-chained) hit with DMG Multiplier +255% while in Absolution mode (base kit, not Resonance Chain).',
  },
  {
    id: 'phoebe.kit.attentive-heart-absolution-mult',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 255, scopedToBlockId: 'phoebe.outro.attentive-heart' }],
    note: 'Attentive Heart deals a final hit with DMG Multiplier +255% while in Absolution mode (base kit, not Resonance Chain).',
  },
  {
    id: 'phoebe.kit.starflash-frazzle-amp',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    condition: { requiresStance: 'target carries Spectro Frazzle' },
    effects: [{ stat: 'totalMult', value: 256, scopedToBlockId: 'phoebe.forte.starflash' }],
    note: 'Starflash gains +256% DMG Amp against targets already carrying Spectro Frazzle (base kit, not Resonance Chain).',
  },

  // ── Buff/debuff blocks (from CHAR_BUFF_TABLE) — both Confession-mode-only, present per legacy
  //    convention but inert in her real (Absolution-only) CHARACTER_ROTATIONS ──
  {
    id: 'phoebe.outro.confession-resshred',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'all-enemies' },
    condition: { requiresStance: 'Confession mode', assumedInactive: true },
    effects: [{ stat: 'resShred', value: 10 }],
    note: 'Confession mode only: Spectro RES -10% for 30s — her real rotation stays in Absolution mode, so this block does not fire.',
  },
  {
    id: 'phoebe.outro.confession-frazzle-amp',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'next-on-field' },
    condition: { requiresStance: 'Confession mode', assumedInactive: true },
    effects: [{ stat: 'deepen', value: 100, stacking: 'refresh' }],
    note: 'Confession mode only: grants the on-field ally Silent Prayer (+100% Spectro Frazzle DMG Amp, plus -10% target Spectro RES and 50% longer Frazzle interval, neither modeled) — her real rotation stays in Absolution mode, so this block does not fire. The 18-Frazzle-stack debuff (frazzle stat, Level-scaling DOT) has no matching stat key in this schema, not modeled.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  // Fixed 2026-09-03: S1-S3 had the identical dead cast-scoped/swap-out-scoped no-duration no-op shape
  // as the 3 kit-multiplier blocks above — all 3 were silent no-ops too.
  {
    id: 'phoebe.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 225, scopedToBlockId: 'phoebe.liberation.dawn-of-enlightenment' }],
    note: "In Absolution, Dawn of Enlightenment's own DMG Multiplier +225% additional (in Confession instead +90% DMG Mult and max-stack Frazzle application, not modeled since her real rotation stays in Absolution).",
  },
  {
    id: 'phoebe.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'deepen', value: 120, scopedToBlockId: 'phoebe.outro.attentive-heart' }],
    note: 'In Absolution, Outro DMG to Frazzle-afflicted targets +120% Amp (in Confession instead increases Silent Prayer\'s own Frazzle DMG Amp by another 120%, not modeled) — scoped to the Outro (not category-gated, so scopedToBlockId is required to avoid over-crediting her whole kit).',
  },
  {
    id: 'phoebe.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 91, scopedToBlockId: 'phoebe.forte.starflash' }],
    // scopedToBlockId added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): the note here previously
    // claimed heavyDmg was category-gated to Starflash alone, but phoebe.forte.absolution-litany was
    // just recategorized to heavyDmg too (it's the dump's own "Heavy Attack: Absolution Litany") — an
    // unscoped heavyDmg node here would now silently leak S3's Starflash-only +91% onto Absolution
    // Litany as well. The dump names only Starflash for this node, so it's pinned explicitly. Same
    // unscoped-buff-leak bug class already found on Jiyan's totalMult passive.
    note: "Starflash DMG Multiplier +91% in Absolution (+249% in Confession, not modeled) — scoped to Starflash specifically since heavyDmg now also covers Absolution Litany.",
  },
  {
    id: 'phoebe.chain.s4',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'cast', on: "Skill:Chamuel's Star 1-3" },
    timing: { duration: 30 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'resShred', value: 10, stacking: 'refresh' }],
    note: "Basic ATK/Chamuel's Star/Dodge Counter/Chamuel's Star: Dodge Counter hits reduce the target's Spectro RES by 10% for 30s — modeled anchored to Chamuel's Star (the real rotation's Basic ATK-equivalent while inside the Ring of Mirrors).",
  },
  {
    id: 'phoebe.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Golden Grace' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 12 }],
    note: 'Casting Intro Skill Golden Grace grants +12% Spectro DMG Bonus for 15s.',
  },
  {
    id: 'phoebe.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:To Where Light Shines' },
    timing: { duration: 20 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 10 }],
    note: 'In Absolution/Confession, summoning a Ring of Mirrors (Resonance Skill cast) grants +10% ATK for 20s. Also triggers one free extra Starflash — modeled as a separate real damage block, phoebe.chain.s6-free-starflash below. The +2s stagnation/all-target application is non-DPS CC utility, still not modeled.',
  },
  {
    // Added 2026-09-03: the "free extra Starflash" IS Starflash itself (no unique multiplier of its
    // own is ever published — the dump's own kit text just says "free extra Starflash", i.e. the
    // same move, not a new one), so this reuses phoebe.forte.starflash's own summed %ATK as a
    // proportional-second-hit at the same instant, same shape as Brant's chain.s6-secondary-blast/
    // Camellya's chain.s6-perennial. 82.7%×3 = 248.1%. Anchored to the same Ring of Mirrors cast as
    // chain.s6 above; sN-suffix gates this to sequence 6 only.
    id: 'phoebe.chain.s6-free-starflash',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:To Where Light Shines' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 248.1 }], category: 'heavyDmg' },
    note: 'S6: summoning a Ring of Mirrors triggers one free extra Starflash (no Divine Voice cost, not counted as a Heavy Attack cast) — reuses Starflash\'s own 82.7%×3 multiplier, gated to sequence 6.',
  },
];
