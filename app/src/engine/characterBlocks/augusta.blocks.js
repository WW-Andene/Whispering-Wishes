// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/augusta.blocks.js
// Augusta converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Augusta'], RESONANCE_CHAIN_DATA['Augusta'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Augusta'], and CHARACTER_ROTATIONS['Augusta']. No new numbers
// invented. S6's real Thunder Rage add-on (2 separate 100%-ATK Electro Heavy-ATK
// hits) is modeled as a real proc-style damage block using the audit's own
// sourced figures, instead of the flat heavyDmg:200 approximation the table
// itself carries. The Outro's real "Majesty condition" (an extra Majesty +
// Crown of Wills stack if the same buffed partner Outros back to Augusta
// before a 3rd swap) is modeled via the engine's dedicated
// 'partner-outro-return' trigger type — see augusta.outro.battlesong and
// augusta.outro.majesty-condition below.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Augusta';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const AUGUSTA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'augusta.intro.stride-of-goldenflare',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Stride of Goldenflare' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('50%×2') },
    note: 'Fully restores Prowess and 20% Ascendancy.',
  },
  {
    id: 'augusta.heavy.thunderoar-backstep',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Backstep' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Thunderoar' has 3 slash-separated variants — the Backstep segment matches this step.
    damage: { hits: parseSkillMultiplierHits('27%'), category: 'heavyDmg' },
    note: 'Once Prowess is capped, replaces Heavy Attack — consumes all Prowess.',
  },
  {
    id: 'augusta.heavy.thunderoar-spinslash',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Spinslash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('71.3%×3'), category: 'heavyDmg' },
    note: 'Auto-chains off Backstep — a whirling follow-up hit. See augusta.chain.s6-thunder-rage below for the S6-granted bonus hits on this cast.',
  },
  {
    id: 'augusta.skill.warriors-blade',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Skill:Warrior's Blade" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('110%×3'), category: 'skillDmg' },
    note: 'A dash-slam hit with a brief time-stop on cast, restores 10% Ascendancy.',
  },
  {
    id: 'augusta.heavy.thunderoar-backstep-spinslash-repeat',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Backstep → Spinslash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 2nd Backstep-into-Spinslash pass, collapsed into one CHARACTER_ROTATIONS step — both segments
    // of the row combined.
    damage: { hits: [...parseSkillMultiplierHits('27%'), ...parseSkillMultiplierHits('71.3%×3')], category: 'heavyDmg' },
    note: 'Once Prowess refills, repeats the Backstep-into-Spinslash combo.',
  },
  {
    id: 'augusta.liberation.sword-of-eternal-oath',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Sword of Eternal Oath' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('16.6%×2 + 66.4%×3 + 16.6%×2 + 287.6%'), category: 'heavyDmg' },
    note: 'Counted as Heavy ATK DMG despite the Liberation slot. Restores the last 40% Ascendancy, capping it at 100%.',
  },
  {
    id: 'augusta.skill.undying-sunlight-strike',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Undying Sunlight: Strike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('70%×2'), category: 'skillDmg' },
    note: 'Once Ascendancy is capped, replaces Skill.',
  },
  {
    id: 'augusta.skill.undying-sunlight-leap',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Undying Sunlight: Leap' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('112%+14%×2'), category: 'skillDmg' },
    note: 'Auto-chains off Strike.',
  },
  {
    id: 'augusta.skill.undying-sunlight-plunge',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Undying Sunlight: Plunge' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('43.6%+392%'), category: 'heavyDmg' },
    note: 'Counted as Heavy ATK DMG. Consumes all Ascendancy, grants 1 Majesty stack.',
  },
  {
    id: 'augusta.liberation.sunborne',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Sublime is the Sun: Sunborne ×9' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('60% ×9'), category: 'heavyDmg' },
    note: '9 rapid Heavy ATK-type hits during the frozen time window of Sworn Allegiance.',
  },
  {
    id: 'augusta.liberation.everbright-protector',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Sublime is the Sun: Everbright Protector' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('120% + 450% + 3%×10') },
    note: 'Ends Sworn Allegiance, consumes all Crown of Wills stacks, deploys Ruler\'s Realm.',
  },
  {
    id: 'augusta.outro.battlesong',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 }, target: { scope: 'next-on-field' },
    // stat corrected 2026-09-01 (found via a recommendation-scoring audit that traced the same wrong
    // stat back into the live damage engine): this was 'elemDmg', silently scoping Battlesong of the
    // Unyielding to Electro-only teammates. Her own kit text is "+15% All-Attribute DMG Amp" — a real
    // damage engine gate difference existed here, matching the identical stale field CHAR_BUFF_TABLE.
    // Augusta already carried (note text there was corrected 2026-08-16 to say allDmg, but the field
    // itself never was) — meaning a non-Electro teammate receiving this outro was getting ZERO benefit
    // from it in the real Team-tab damage calculator, not just the recommendation scorer.
    effects: [{ stat: 'allDmg', value: 15, stacking: 'refresh' }],
    note: 'Battlesong of the Unyielding. Ends immediately if the incoming Resonator is swapped off-field, not modeled. Also grants Augusta 1 Majesty stack. See augusta.outro.majesty-condition below for the conditional partner-Outro-return payoff.',
  },
  {
    id: 'augusta.outro.majesty-condition',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'partner-outro-return', requiresActiveBlock: 'augusta.outro.battlesong', maxInterveningSwaps: 1 },
    timing: {}, target: { scope: 'self' },
    effects: [],
    note: 'The Majesty condition: if the same Resonator buffed by Battlesong of the Unyielding Outros back to Augusta before a 3rd swap, Augusta gains an extra Majesty stack AND an extra Crown of Wills stack. Stateful stack-count payoff, not a flat DPS-stat effect — effects intentionally empty; the trigger firing (see augusta.outro.battlesong\'s partner-outro-return window) is what this block records.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'augusta.selfbuff.crown-of-wills-base',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: base-kit passive, no natural decay sourced
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15 }],
    note: 'Crown of Wills: +15% Electro DMG Bonus per stack, max 1 stack at base kit (S0).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic) ──
  {
    id: 'augusta.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 15, stacking: 'stacking', maxStacks: 2 }],
    note: 'Crown of Wills +15% Crit DMG per stack (max stack raised 1->2) = 30% at 2 stacks (confirmed exact) — modeled as per-stack stacking rather than a flat 30%.',
  },
  {
    id: 'augusta.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 20, stacking: 'stacking', maxStacks: 2 }],
    note: 'Crown of Wills +20% Crit Rate per stack (2 stacks = 40%) — modeled as per-stack stacking. Also converts excess Crit Rate over 100% into Crit DMG (up to +100% more at 150%+ CR), not modeled — flat critRate is the safe partial model per the audit\'s own reasoning.',
  },
  {
    id: 'augusta.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 25 }],
    note: '+25% DMG Multiplier specifically on Heavy Attack - Thunderoar: Backstep/Spinslash/Uppercut and their Dodge Counter equivalents (not a generic Heavy ATK buff) — kept passive, applies to those blocks above (her only Heavy ATK hits anyway, per the audit comment).',
  },
  {
    id: 'augusta.chain.s4-ascent-in-sun-and-glory',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Stride of Goldenflare' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: 'Casting Intro Skill - Stride of Goldenflare grants the WHOLE TEAM +20% ATK for 30s (confirmed exact, team-wide).',
  },
  {
    id: 'augusta.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 15 }],
    note: "Inherent Skill - Glory's Favor shield value +50% — a survivability stat, no direct DPS number; totalMult:15 kept as an approximate DPS-uptime proxy per the audit comment's own reasoning, not a real modeled effect.",
  },
  {
    id: 'augusta.chain.s6-thunder-rage',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Spinslash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 100 }, { atkPct: 100 }], category: 'heavyDmg' },
    note: 'Casting Thunderoar: Spinslash or Uppercut grants 2 Crown of Wills stacks (capped at 2 stacks/sec, not modeled) AND triggers Thunder Rage — 2 separate Electro Heavy-ATK hits at 100% ATK each (200% ATK total, on top of the move\'s own damage) — modeled as a real proc-style damage block using the audit\'s own sourced figures, instead of the flat heavyDmg:200 approximation RESONANCE_CHAIN_DATA itself carries (same "discrete proc, not a modifier" treatment as Yinlin\'s S6/Calcharo\'s S6). Also raises Crown of Wills max stacks 2->4 and the CR-over-150%->CD conversion (unmodeled, same caveat as S2), not represented here.',
  },
];
