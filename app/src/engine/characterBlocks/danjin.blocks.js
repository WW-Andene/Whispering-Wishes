// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/danjin.blocks.js
// Danjin converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Danjin'], RESONANCE_CHAIN_DATA['Danjin'] (+ its own 2026-08-18
// detailed audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Danjin'], and CHARACTER_ROTATIONS['Danjin']. No new numbers
// invented. S5's extra conditional (+15% more when HP<60%, 30% total) has no
// distinct condition field for an HP threshold in this schema and is documented
// rather than force-fit, matching the source audit's own scope note.
//
// Cooldown/concertoEnergyGain added 2026-09-06 (completeness pass, same "bring every character up
// to Aalto's reference standard" direction as the prior passes) — sourced from Data dump/Danjin/
// Danjin.md's own Cooldown/Concerto Regen rows (Vindication, Crimson Erosion/Sanguine Pulse's shared
// Resonance Skill cooldown of 0s, Crimson Bloom, Chaoscleave). The 0s Skill cooldown is recorded
// faithfully even though it's functionally inert (falsy, so resolveHitComposedDps.js's
// cooldownGate never engages) — real data, not a placeholder.
//
// Completeness pass 2026-09-07 (continuing the same character-by-character pass): Minor Fortes
// (Havoc DMG+12%, ATK%+12%) had no block at all. Also found her other Inherent Skill, Crimson Light
// ("Crimson Erosion damage triggered by Dodge Counter: Ruby Shades +20%; HP cost and Ruby Blossom
// stacks recovered are doubled") — Overflow was already modeled, but Crimson Light was never
// referenced anywhere. Checked whether its DMG bonus applies in the modeled rotation: it doesn't —
// CHARACTER_ROTATIONS['Danjin']'s own Crimson Erosion step fires right after Intro:Vindication, not
// after a Dodge Counter (the "after Basic ATK 2 (or Dodge Counter/Intro)" note is general kit
// flavor-text, not this rotation's real cast order), so the Dodge-Counter-specific +20% genuinely
// doesn't reach danjin.skill.crimson-erosion here. Added as documented-inert utility rather than a
// guessed always-on buff.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Danjin';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const DANJIN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'danjin.intro.vindication',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Vindication' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus. No override text names a different category, same default-
    // to-skillDmg convention as Calcharo/Encore/Jianxin/Lingyang/Aalto/Baizhi/Chixia.
    damage: { hits: parseSkillMultiplierHits('49.71%×4'), category: 'skillDmg', basis: 'ATK' },
    note: 'Builds Concerto Energy, can chain into Crimson Erosion.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Danjin/Danjin.md's own
    // "Con. Energy Regen 10" row for Intro Skill Vindication.
    concertoEnergyGain: 10,
  },
  {
    id: 'danjin.skill.crimson-erosion',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Crimson Erosion' },
    // Data dump/Danjin/Danjin.md's own Resonance Skill (Crimson Fragment) row states "Cooldown: 0" —
    // recorded faithfully (2026-09-06 completeness pass) even though a 0 cooldown is functionally
    // inert in resolveHitComposedDps.js's own cooldownGate check (`db.timing?.cooldown &&
    // totalTime > 0` — 0 is falsy, so the gate never engages), same as omitting it entirely.
    timing: { cooldown: 0 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('64.42%×2 + 59.65%×2'), category: 'skillDmg', basis: 'ATK' },
    note: 'After Basic ATK 2/Dodge Counter/Intro. Applies Incinerating Will (+20% DMG taken).',
  },
  {
    id: 'danjin.skill.sanguine-pulse',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Sanguine Pulse' },
    // Same real, sourced 0s cooldown as Crimson Erosion above (same Resonance Skill ability slot).
    timing: { cooldown: 0 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('56.07%×2 + 42.95%×3 + 64.42%×3'), category: 'skillDmg', basis: 'ATK' },
    note: 'After Basic ATK 3, up to 3 consecutive strikes. Builds Ruby Blossom stacks.',
  },
  {
    id: 'danjin.liberation.crimson-bloom',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Crimson Bloom' },
    // cooldown added 2026-09-06 (completeness pass): Data dump/Danjin/Danjin.md's own
    // "Cooldown: 16s" row.
    timing: { cooldown: 16 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('49.09%×8 + 392.65%'), category: 'libDmg', basis: 'ATK' },
    note: 'Consumes HP per hit, not modeled (no DPS component).',
    // concertoEnergyGain added 2026-09-06 (completeness pass): same row's "Con. Energy Regen 20".
    // Its "Res. Energy Cost: 100" row is a Liberation-gauge cost, not a gain — no matching schema
    // field, not modeled, same treatment as every other character's own Liberation resource cost.
    concertoEnergyGain: 20,
  },
  {
    id: 'danjin.forte.chaoscleave',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Serene Vigil: Chaoscleave' },
    // No cooldown: gated by consuming 60+ Ruby Blossom, a resource threshold, not a timer.
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%×7'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Counts as Heavy ATK per its own CHARACTER_ROTATIONS note, at 60+ Ruby Blossom. Heals Danjin, not modeled. Scatterbloom follow-up (179%, corrected 2026-09-03 from a stale 178.93%) has no own CHARACTER_ROTATIONS step, not separately modeled. The higher-tier "Full Energy" variants (120+ Ruby Blossom) belong to a different rotation (the source\'s "Damage Dealer Combo") than the one modeled here, not used.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Danjin/Danjin.md's own
    // "Chaoscleave Con. Energy Regen 50" row.
    concertoEnergyGain: 50,
  },

  // Added 2026-09-07 (completeness pass): her base kit and Skill's base cast, genuinely unused in
  // CHARACTER_ROTATIONS['Danjin'] (which opens straight into Intro -> Crimson Erosion -> Sanguine
  // Pulse) — real, sourced SKILL_MULTIPLIERS rows, none of which had a block anywhere in this file.
  {
    id: 'danjin.basic.execution',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Execution Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('57.26% → 58.85% → 79.53%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base 3-stage Basic ATK combo. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'danjin.midair.attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('98.61%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base Mid-air Attack. No override text — kept basicDmg per this schema\'s established convention. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'danjin.basic.dodge-counter',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('63.62%×3'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base Dodge Counter — "Basic Attack after successful Dodge" per its own kit text, hence basicDmg. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'danjin.heavy.execution',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Execution (hold)' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('37.12%×3'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Base Heavy Attack, consumes HP-fueled Forte, heals if Forte Gauge >=50%. No override text — kept heavyDmg. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation (her modeled rotation reaches Chaoscleave instead).',
  },
  {
    id: 'danjin.skill.carmine-gleam',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Crimson Fragment: Carmine Gleam' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('38.18%×2'), category: 'skillDmg', basis: 'ATK' },
    note: 'Base Resonance Skill hit, costs 3% Max HP per attack. Not in CHARACTER_ROTATIONS — her modeled rotation always chains Skill into Crimson Erosion/Sanguine Pulse instead of this base cast.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    // Added 2026-09-03 against a real browser snapshot: this Inherent Skill (Overflow) was
    // entirely missing before this pass.
    // Rescoped 2026-09-07 (completeness pass): was unscoped heavyDmg — safe at the time (Chaoscleave
    // was the only heavyDmg-categorized block in this file), but this same pass added
    // danjin.heavy.execution (a real, sourced but rotation-unused base Heavy ATK block), which would
    // otherwise also silently receive this +30% if it ever fired. Scoped via scopedToBlockId to
    // Chaoscleave only, the real move this Inherent Skill buffs (it directly follows Sanguine Pulse
    // in the modeled rotation).
    id: 'danjin.selfbuff.overflow',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Skill:Sanguine Pulse' },
    timing: { duration: 5 },
    target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 30, scopedToBlockId: 'danjin.forte.chaoscleave', source: 'self-kit' }],
    note: 'Inherent Skill Overflow: Heavy Attack DMG +30% for 5s after casting Sanguine Pulse — scoped to danjin.forte.chaoscleave, the real move it buffs.',
  },
  // Added 2026-09-07 (completeness pass): "Minor Fortes: Havoc DMG+12%, ATK%+12%" — a permanent,
  // always-on passive stat bonus, previously had no block anywhere in this file.
  {
    id: 'danjin.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'elemDmg', value: 12, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Havoc DMG+12%, ATK%+12% (Data dump/Danjin/Danjin.md). Unconditional, always active.',
  },
  // Added 2026-09-07 (completeness pass): her other Inherent Skill, Crimson Light — previously not
  // referenced anywhere in this file (only Overflow was modeled). See file header for why its real
  // Dodge-Counter-specific DMG bonus doesn't apply in the modeled rotation.
  {
    id: 'danjin.inherent.crimson-light',
    source: SOURCE, kind: 'utility', section: 'Skill',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: "Crimson Light — Crimson Erosion damage triggered by Dodge Counter: Ruby Shades +20%; HP cost and Ruby Blossom stacks recovered are doubled. Not modeled: CHARACTER_ROTATIONS['Danjin']'s own Crimson Erosion cast fires right after Intro, not after Dodge Counter, so this DMG bonus genuinely doesn't apply to the modeled rotation (see file header).",
  },
  {
    id: 'danjin.outro.duality',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { element: 'havoc' },
    effects: [{ stat: 'elemDmg', value: 23, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Havoc DMG Amp to the incoming Resonator (elemDmg, not amplify — a buff to the ally\'s own outgoing DMG, not a vulnerability debuff on the enemy, per the 2026-09-01 correction).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-18 audit comment for
  //    each node's real mechanic) ──
  {
    id: 'danjin.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: real mechanic loses 1 stack per hit TAKEN, no natural-decay duration sourced
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 5, stacking: 'stacking', maxStacks: 6, source: 'self-kit' }],
    note: 'ATK +5% per stack on Incinerating Will hits, stacking up to 6 times (max 30%), loses 1 stack per hit Danjin takes — modeled as per-stack 5% x6 cap (matching the real stacking mechanic) rather than a flat 30%, same convention as Brant\'s S1. The stack-loss-on-hit-taken mechanic is not modeled (no defensive-proc trigger type in this schema).',
  },
  {
    id: 'danjin.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    condition: { requiresStance: 'Incinerating Will target' },
    effects: [{ stat: 'totalMult', value: 20, source: 'self-kit' }],
    note: 'DMG dealt to Incinerating Will targets +20% (confirmed exact, kept as totalMult since it\'s not attribute-specific) — conditional on the target carrying Incinerating Will.',
  },
  {
    id: 'danjin.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Crimson Bloom' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 30, source: 'self-kit' }],
    note: "Liberation DMG Bonus +30% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'danjin.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Serene Vigil: Chaoscleave' },
    timing: { duration: 99 }, // sentinel: conditional on Ruby Blossom staying above 60, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 15, source: 'self-kit' }],
    note: 'Crit Rate +15% while above 60 Ruby Blossom (confirmed exact) — modeled as triggered by the Chaoscleave cast that requires that threshold.',
  },
  {
    id: 'danjin.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15, source: 'self-kit' }],
    note: 'Havoc DMG Bonus +15% unconditional base value (confirmed exact) — the extra conditional +15% more (30% total, only when HP<60%) is NOT separately modeled, per the source audit\'s own documented scope.',
  },
  {
    id: 'danjin.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Serene Vigil: Chaoscleave' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh', source: 'self-kit' }],
    note: 'Team ATK +20% for 20s on full-power Chaoscleave (confirmed exact).',
  },
];
