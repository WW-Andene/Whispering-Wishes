// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/cartethyia.blocks.js
// Cartethyia converted to TriggerBlocks. Sourced from characters.js's already-
// audited CHAR_BUFF_TABLE['Cartethyia'], RESONANCE_CHAIN_DATA['Cartethyia'] (+ its
// own detailed 2026-08-31 audit comment, read directly for each node's real
// mechanic), SKILL_MULTIPLIERS['Cartethyia'], and CHARACTER_ROTATIONS
// ['Cartethyia']. No new numbers invented. Her whole kit scales off Max HP, not
// ATK (confirmed by her own base-stat sheet and the "totalMult is %HP here, NOT
// %ATK" comment on her resource-cost row), so every damage block below uses
// basis: 'HP'. Several SKILL_MULTIPLIERS rows mix "%" and "%HP" notation within
// the same row (e.g. Heavy ATK Fleurdelys Enhanced) — treated as fully HP-scaling
// per her declared base stat, documented as an approximation rather than split
// across two bases (which this schema's single-basis-per-block shape can't do).
// Mid-air:Cartethyia Plunging Attack's real DMG is now sourced and modeled (2026-09-02, against a
// fresh Prydwen dump — Characters data dump/Cartethyia/Cartethyia.md — which the prior source page
// this file was built from was simply missing). The STATEFUL half of that mechanic (which Sword Shadow
// combo grants which of Heart of Virtue/Mandate of Divinity/Power of Discord to Fleurdelys) is still
// not modeled, per CHARACTER_ROTATIONS's own TODO. The weapon-specific debuff (Sig weapon Defier's
// Thorn) is intentionally NOT modeled — hardcoding a weapon's own passive here would double-count it.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Cartethyia';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const CARTETHYIA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS — all HP-scaling) ──
  {
    id: 'cartethyia.intro.sword-to-mark-tides-trace',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Intro:Sword to Mark Tide's Trace" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('2.08%×3 + 6.24%'), basis: 'HP' },
    note: "Inflicts 2 Aero Erosion stacks, summons Sword of Discord's Shadow (max 1, 20s).",
  },
  {
    id: 'cartethyia.basic.base-form-1-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Base Form 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('4.78% → 13.13% → 17.12% → 15.1%'), category: 'basicDmg', basis: 'HP' },
    note: "Stage 4 inflicts 1 Aero Erosion stack, grants Sword of Divinity's Shadow (max 1, 20s).",
  },
  {
    id: 'cartethyia.skill.base-form',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Base Form' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('6.89%×3 + 8.86%'), category: 'skillDmg', basis: 'HP' },
    note: "Applies 2 stacks of Aero Erosion, summons Sword of Virtue's Shadow (max 1, 20s).",
  },
  {
    id: 'cartethyia.skill.fleurdelys-1',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Fleurdelys 1' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Fleurdelys 1-2' lists both variants' values as '24.8%HP / 24.8%HP' — the first matches this step.
    damage: { hits: parseSkillMultiplierHits('24.8%'), category: 'skillDmg', basis: 'HP' },
    note: "Sword to Answer Waves' Call — restores Conviction on hit.",
  },
  {
    id: 'cartethyia.basic.fleurdelys-1-5',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Fleurdelys 1-5' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('6.49% → 9.09% → 10.65% → 13.7% → 36%'), category: 'basicDmg', basis: 'HP' },
    note: 'Empowered combo used in Fleurdelys form, restores Conviction on hit. Fires twice in the real rotation.',
  },
  {
    id: 'cartethyia.skill.fleurdelys-2',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Fleurdelys 2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('24.8%'), category: 'skillDmg', basis: 'HP' },
    note: "May Tempest Break the Tides — must follow Fleurdelys 1 within a short (unpublished-exact) follow-up window or falls back to Skill's normal cooldown, forfeiting this cast for the Manifest window.",
  },
  {
    id: 'cartethyia.midair.cartethyia-plunging-attack',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Mid-air:Cartethyia Plunging Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-02 against a fresh Prydwen dump: previously had NO SKILL_MULTIPLIERS row at all,
    // a silent zero-DMG gap despite being a real, always-cast step in her modeled rotation. Real value
    // has 4 variants depending on how many Sword Shadows are recalled (0/1/2/3): 5.65% / 5.65% /
    // 3.30%×3 / 11.29%×3 HP. By the point this step fires in the real modeled rotation, all 3 shadow
    // types (Discord via Intro, Divinity via Basic 4, Virtue via Skill) are already up, so the
    // 3-Shadows-Recalled value is the one that actually applies.
    damage: { hits: parseSkillMultiplierHits('11.29%×3'), basis: 'HP', category: 'basicDmg' },
    note: "Recalls all 3 currently-held Sword Shadows (Discord/Divinity/Virtue) at once, granting Fleurdelys the corresponding Heart of Virtue/Mandate of Divinity/Power of Discord buffs for the whole Manifest window — WHICH shadow grants WHICH buff (and each buff's own further per-effect magnitude) is stateful/combinatorial and not modeled, per CHARACTER_ROTATIONS's own TODO. Only this move's own real DMG is captured here. category fixed 2026-09-02: WuWa's own general mechanic (Mid-air/Plunging Attacks inherit Basic ATK or Heavy ATK DMG, never their own type) plus this dump's own kit structure — listed under \"Basic Attack — Sword to Carve My Forms\", not Heavy Attack — confirms basicDmg.",
  },
  {
    id: 'cartethyia.liberation.blade-of-howling-squall',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Blade of Howling Squall' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('13.12%×7'), category: 'libDmg', basis: 'HP' },
    note: 'Available only at exactly 120 Conviction; removes all Conviction, ends Manifest, restores 50% Max HP, strips all stacked Aero Erosion from the target (each stack removed Amplifies DMG taken +20%, capped at 5 stacks = +100%, not modeled).',
  },
  {
    id: 'cartethyia.outro.winds-divine-blessing',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 20 }, target: { scope: 'next-on-field' },
    condition: { element: 'aero' },
    effects: [{ stat: 'elemDmg', value: 17.5, stacking: 'refresh' }],
    note: "Boosts the incoming teammate's (not Cartethyia's own) Aero DMG against Negative-Status-afflicted targets — the Negative Status condition isn't modeled (applied unconditionally).",
  },

  // ── Debuff blocks (from CHAR_BUFF_TABLE — real base-kit mechanic, not weapon-specific) ──
  {
    id: 'cartethyia.debuff.winds-indelible-imprint',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: conditional on max Erosion stacks, no natural decay sourced
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'elemDmg', value: 60 }],
    note: "Wind's Indelible Imprint: targets at max (6) Erosion stacks take +60% more DMG from her (scales from +30% at 1-3 stacks, +10%/stack beyond — modeled at the max-stack ceiling) — a real base-kit mechanic, kept passive.",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S5 correctly has NO block — purely defensive, zero DPS component) ──
  {
    id: 'cartethyia.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 25, stacking: 'stacking', maxStacks: 4 }],
    note: "When Fleurdelys's Conviction hits 30/60/90/120, Crit DMG +25% for 15s, up to 4 stacks (100% at full stack, duration doesn't reset on a new stack) — modeled as per-stack stacking, matching the real mechanic rather than a flat 100%. Also grants a separate, unmodeled Zeal proc (10s window on an Erosion-inflicted kill that maxes Erosion stacks on the next kill's targets), not modeled.",
  },
  {
    id: 'cartethyia.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'basicDmg', value: 50 },
      { stat: 'totalMult', value: 200 },
    ],
    note: "DMG Multiplier of Basic ATK/Heavy ATK/Dodge Counter/Intro Skill +50% (basicDmg) AND DMG Multiplier of Mid-air Attack +200% specifically (totalMult fallback, since there's no dedicated mid-air-only stat) — kept passive, applies broadly. Also raises Erosion's max-stack cap +3 within range on Liberation1 cast, and reduces Skill cooldown per Sword Shadow type recalled via Mid-air Attack (up to -3s at 3 distinct types) — neither modeled. A third real effect (confirmed 2026-09-02 against a fresh dump, previously not captured in this note at all): the NEXT direct-damage hit after Liberation1 cast inflicts 3 Erosion stacks on all nearby targets AND immediately triggers their Erosion DMG once without consuming stacks — a real proc-shaped mechanic, not modeled (no home in this schema for a one-shot conditional proc tied to a resource-cap-raise cast).",
  },
  {
    id: 'cartethyia.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Blade of Howling Squall' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 100 }],
    note: "Blade of Howling Squall's own DMG Multiplier +100% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5. Also makes Basic5/Mid-air2/Enhanced Heavy/Skill2 inflict 2 Erosion stacks each, not modeled.",
  },
  {
    id: 'cartethyia.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20 }],
    note: 'After any team member inflicts Havoc Bane/Fusion Burst/Spectro Frazzle/Electro Flare/Glacio Chafe/Aero Erosion, the WHOLE team gains +20% DMG Bonus for ALL Attributes for 20s (confirmed exact, team-wide) — a cross-character trigger this schema has no clean anchor for, kept passive as an approximation.',
  },
  // S5 correctly has NO block — (a) fatal-blow immunity once per 10 real-time minutes granting a
  // Shield = 20% of Max HP for 10s, (b) Liberation1 HP cost reduced from 50% to 25% of Max HP — both
  // purely defensive, zero DPS component, neither has a DPS-stat equivalent.
  {
    id: 'cartethyia.chain.s6',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'all-enemies' },
    effects: [{ stat: 'elemDmg', value: 40 }],
    note: 'Targets take +40% more DMG from Fleurdelys specifically (confirmed exact, matches the "targets take X% more DMG" enemy-side debuff convention used elsewhere in this file) — kept passive, applies broadly to her Fleurdelys-form blocks above. Also makes Blade of Howling Squall max (instead of remove) target Erosion stacks on cast, and within 30s of any Intro/Liberation cast, any team member inflicting Erosion on an already-max-stack target immediately procs Erosion DMG once — neither modeled.',
  },
];
