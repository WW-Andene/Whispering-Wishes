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
//
// Re-audited 2026-09-02 against a fresh the source.gg source dump (see
// characters.js's SKILL_MULTIPLIERS['Augusta'] for the full ratio verification):
// every damage block below was carrying the exact same value SKILL_MULTIPLIERS
// had — which was itself off by a consistent ~1.988x (roughly HALF the real
// value) across all 11 hits, the same "halving pattern" bug class already fixed
// for Camellya/Carlotta/Roccia/Phoebe/Brant, just missed for Augusta until now.
// Retightened every hit to the source's exact Lv.10 figures — a real, live-DPS-
// relevant fix, not cosmetic: this engine file feeds the actual damage calculator.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../shared/skillMultiplierParser.js';

const SOURCE = 'Augusta';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const AUGUSTA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'augusta.intro.stride-of-goldenflare',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Stride of Goldenflare' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-02 against a fresh the source dump: the multiplier row is labeled generically
    // "Skill Damage" (not "Stride of Goldenflare DMG"), the same convention already confirmed on Lupa's
    // Try Focusing, Eh?/Ciaccona's Roaming with the Wind — a generic "Skill Damage" label means plain
    // Resonance Skill DMG.
    damage: { hits: parseSkillMultiplierHits('99.41%×2'), category: 'skillDmg' },
    note: 'Fully restores Prowess and 20% Ascendancy.',
  },
  {
    id: 'augusta.heavy.thunderoar-backstep',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Backstep' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Thunderoar' has 3 slash-separated variants — the Backstep segment matches this step.
    damage: { hits: parseSkillMultiplierHits('53.68%'), category: 'heavyDmg' },
    note: 'Once Prowess is capped, replaces Heavy Attack — consumes all Prowess.',
  },
  {
    id: 'augusta.heavy.thunderoar-spinslash',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Spinslash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('141.72%×3'), category: 'heavyDmg' },
    note: 'Auto-chains off Backstep — a whirling follow-up hit. See augusta.chain.s6-thunder-rage below for the S6-granted bonus hits on this cast.',
  },
  {
    id: 'augusta.skill.warriors-blade',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Skill:Warrior's Blade" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('218.70%×3'), category: 'skillDmg' },
    note: 'A dash-slam hit with a brief time-stop on cast, restores 10% Ascendancy.',
  },
  {
    id: 'augusta.heavy.thunderoar-backstep-spinslash-repeat',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Backstep → Spinslash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // 2nd Backstep-into-Spinslash pass, collapsed into one CHARACTER_ROTATIONS step — both segments
    // of the row combined.
    damage: { hits: [...parseSkillMultiplierHits('53.68%'), ...parseSkillMultiplierHits('141.72%×3')], category: 'heavyDmg' },
    note: 'Once Prowess refills, repeats the Backstep-into-Spinslash combo.',
  },
  {
    id: 'augusta.liberation.sword-of-eternal-oath',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Sword of Eternal Oath' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('32.99%×2 + 131.94%×3 + 32.99%×2 + 571.7%'), category: 'heavyDmg' },
    note: 'Counted as Heavy ATK DMG despite the Liberation slot. Restores the last 40% Ascendancy, capping it at 100%.',
  },
  {
    id: 'augusta.skill.undying-sunlight-strike',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Undying Sunlight: Strike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('139.17%×2'), category: 'skillDmg' },
    note: 'Once Ascendancy is capped, replaces Skill.',
  },
  {
    id: 'augusta.skill.undying-sunlight-leap',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Undying Sunlight: Leap' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('222.67%+27.84%×2'), category: 'skillDmg' },
    note: 'Auto-chains off Strike.',
  },
  {
    id: 'augusta.skill.undying-sunlight-plunge',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Undying Sunlight: Plunge' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('86.59%+779.24%'), category: 'heavyDmg' },
    note: 'Counted as Heavy ATK DMG. Consumes all Ascendancy, grants 1 Majesty stack.',
  },
  {
    id: 'augusta.liberation.sunborne',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Sublime is the Sun: Sunborne ×9' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-02: was '119.29% ×9' (with a space before ×) — parseSkillMultiplierHits' token
    // regex requires × immediately after %, so the space silently dropped the ×9 count entirely,
    // producing a SINGLE hit instead of the 9 this block's own note (and its real kit) describes.
    damage: { hits: parseSkillMultiplierHits('119.29%×9'), category: 'heavyDmg' },
    note: '9 rapid Heavy ATK-type hits during the frozen time window of Sworn Allegiance.',
  },
  {
    // category corrected 2026-09-02 (final Augusta audit pass): had no `category` at all — the fresh
    // the source dump confirms "Deal Electro DMG, considered as Heavy Attack DMG", matching every other
    // Liberation-slot move in her kit (Sword of Eternal Oath, Sunborne — both already correctly tagged
    // heavyDmg above). This was the one omission.
    id: 'augusta.liberation.everbright-protector',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Sublime is the Sun: Everbright Protector' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('238.58% + 894.65% + 5.97%×10'), category: 'heavyDmg' },
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
    // Fixed 2026-09-02 against a fresh the source dump: was a single unscoped totalMult effect — a prior
    // session's note claimed this was safe since "her only Heavy ATK hits anyway," but that's wrong:
    // totalMult applies unconditionally to EVERY hit regardless of category (calcEngine.js's `(1 +
    // stats.totalMult/100)` factor, not category-gated), so it was silently over-crediting her real
    // skillDmg hits too (Warrior's Blade, Undying Sunlight: Strike/Leap) and her Intro — none of which
    // are in S3's real move list. The kit text names exactly 6 moves: Thunderoar: Backstep/Spinslash/
    // Uppercut (+ their Dodge Counter equivalents), Undying Sunlight: Plunge, Sublime is the Sun:
    // Sunborne, and Sublime is the Sun: Everbright Protector — notably NOT Undying Sunlight: Strike/Leap
    // despite those being the same Forte family. Scoped via scopedToBlockId (Phase 0.5 gap #3's
    // mechanism) to each real block that fires in her modeled rotation; Uppercut has no block (never
    // used in the modeled rotation) so isn't listed.
    effects: [
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.heavy.thunderoar-backstep' },
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.heavy.thunderoar-spinslash' },
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.heavy.thunderoar-backstep-spinslash-repeat' },
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.skill.undying-sunlight-plunge' },
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.liberation.sunborne' },
      { stat: 'totalMult', value: 25, scopedToBlockId: 'augusta.liberation.everbright-protector' },
    ],
    note: '+25% DMG Multiplier specifically on Thunderoar: Backstep/Spinslash/Uppercut (+ Dodge Counter equivalents), Undying Sunlight: Plunge, and Sublime is the Sun: Sunborne/Everbright Protector — NOT a generic Heavy ATK buff (Undying Sunlight: Strike/Leap are excluded despite also being heavyDmg... actually skillDmg-categorized, and correctly excluded either way per the kit text\'s own explicit move list).',
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
    // Zeroed 2026-09-02 (found while cross-checking a fresh the source source dump against this file):
    // was `totalMult: 15`, a fabricated number with the SAME "no basis in the node's own text" shape
    // this codebase's own rule elsewhere removes (see Brant's S1/Phrolova's S5, both zeroed for the
    // identical reason) — this node's own comment already admitted "not a real modeled effect," an
    // approximate DPS-uptime proxy standing in for a purely defensive stat (Glory's Favor shield value
    // +50%) with zero DPS component. That fabricated 15% was still live in this real damage-calculating
    // engine file (not just the legacy flat table), inflating any S5+ Augusta build's damage by a made-
    // up amount for a node that deals no damage at all.
    id: 'augusta.chain.s5',
    source: SOURCE, kind: 'utility',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' }, effects: [],
    note: "Unshaken in Wrathful Tides: Inherent Skill Glory's Favor shield value +50% — purely defensive, no DPS component, not representable in this schema.",
  },
  {
    id: 'augusta.chain.s6-thunder-rage',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Spinslash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 100 }, { atkPct: 100 }], category: 'heavyDmg' },
    note: 'Casting Thunderoar: Spinslash or Uppercut grants 2 Crown of Wills stacks (capped at 2 stacks/sec, not modeled) AND triggers Thunder Rage — 2 separate Electro Heavy-ATK hits at 100% ATK each (200% ATK total, on top of the move\'s own damage) — modeled as a real proc-style damage block using the audit\'s own sourced figures, instead of the flat heavyDmg:200 approximation RESONANCE_CHAIN_DATA itself carries (same "discrete proc, not a modifier" treatment as Yinlin\'s S6/Calcharo\'s S6). Also raises Crown of Wills max stacks 2->4 and the CR-over-150%->CD conversion (unmodeled, same caveat as S2), not represented here. See augusta.chain.s6-thunder-rage-repeat below for the SECOND Spinslash cast in her real modeled rotation — this block\'s own `trigger.on` only matches the FIRST cast\'s distinct rotation-step label.',
  },
  {
    // Added during a from-scratch Phase A redo (2026-09-04): CHARACTER_ROTATIONS['Augusta'] casts
    // Thunderoar: Spinslash TWICE per full rotation — once as its own step ('Heavy ATK:Thunderoar:
    // Spinslash', covered by augusta.chain.s6-thunder-rage above) and once as part of the combined
    // repeat step 'Heavy ATK:Thunderoar: Backstep → Spinslash' (see augusta.heavy.
    // thunderoar-backstep-spinslash-repeat). Trigger keys are matched by EXACT rotation-step label
    // (rotationSimulator.js's castKey = `cast:${type}:${skill}`), so the first block's trigger.on
    // never matches the second step's differently-worded label — Thunder Rage silently fired only
    // once per rotation in the live engine instead of twice, per the kit's own unconditional "Casting
    // Thunderoar: Spinslash or Thunderoar: Uppercut ALSO triggers Thunder Rage" text (no once-per-
    // rotation cap stated, only the separate 1s Crown-of-Wills-stack ICD, which doesn't gate this).
    // Same duplicate-trigger pattern as the S3 totalMult scoping already covering both Spinslash casts
    // via separate scopedToBlockId entries.
    id: 'augusta.chain.s6-thunder-rage-repeat',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Backstep → Spinslash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 100 }, { atkPct: 100 }], category: 'heavyDmg' },
    note: 'Same Thunder Rage proc as augusta.chain.s6-thunder-rage, firing for the SECOND (repeat combo) Spinslash cast in her real modeled rotation instead of being silently dropped.',
  },
];
