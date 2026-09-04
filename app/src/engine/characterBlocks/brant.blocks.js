// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/brant.blocks.js
// Brant converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Brant'], RESONANCE_CHAIN_DATA['Brant'] (+ its own detailed audit
// comment, read directly for each node's real mechanic/trigger/stacking),
// SKILL_MULTIPLIERS['Brant'], and CHARACTER_ROTATIONS['Brant']. No new numbers invented.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Brant';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const BRANT_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'brant.intro.applaud-for-me',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Applaud for Me!' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-04 (Phase A REDO, REMAINING_WORK.md 1c): had no damage.category at all, silently
    // rejecting Resonance Skill DMG Bonus on a real 1.63% (10,359) damage share. Brant's kit text gives
    // this Intro no "considered X DMG" override at all ("Attack target, Fusion DMG, grants Interlude
    // Applause") — per the established default-convention (Calcharo's Wanted Outlaw/Encore's Woolies'
    // Helpers: an un-overridden Intro Skill hit defaults to skillDmg), fixed to skillDmg.
    damage: { hits: parseSkillMultiplierHits('202.8% + 50.7%'), category: 'skillDmg' , basis: 'ATK' },
  },
  {
    id: 'brant.liberation.to-the-horizon',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:To the Horizon' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('85.1%×4 + 340.2%'), category: 'libDmg' , basis: 'ATK' },
  },
  {
    id: 'brant.midair.stage-2-3-charged-flip',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Stage 2-3 + Charged Attack + Flip' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Mid-air, Charged Combo' has 5 arrow-separated stages; this step starts from stage 2 (per
    // its own label) through the end — stages 2-5.
    // Fixed 2026-09-02: had no damage.category at all — his kit text never gives Mid-air Attack a
    // "considered X DMG" override, so per the established Mid-air Attack convention (a Mid-air/Plunging
    // Attack inherits Basic or Heavy ATK DMG per the character's own kit, never its own type — already
    // applied to Ciaccona/Lupa/Cartethyia/Luuk Herssen/Qingxiao), and Brant is a Basic-ATK-focused sword
    // character with no Heavy Attack replacement tied to Mid-air, this resolves to basicDmg.
    damage: { hits: parseSkillMultiplierHits('332.5% → 93.0% → 169.0% → 253.9%'), category: 'basicDmg' , basis: 'ATK' },
    note: 'Stages 2-5 of the 5-stage Mid-air Charged Combo (starts from stage 2 per the step\'s own "Stage 2-3" label).',
  },
  {
    id: 'brant.forte.returned-from-ashes',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Returned from Ashes' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('47.2%×2 + 94.4% + 188.9%×2 + 1322.1%'), category: 'basicDmg' , basis: 'ATK' },
    note: "Counted as Basic ATK DMG per its own CHARACTER_ROTATIONS note. Also grants the team a 30s shield, not modeled (no DPS component).",
  },
  {
    id: 'brant.chain.s6-secondary-blast',
    source: SOURCE, kind: 'damage', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Returned from Ashes' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // the engine-merge history (git log) Phase 0.5 gap #6, fixed 2026-09-02: S6's real "secondary blast worth 30% of
    // Returned from Ashes' own DMG" turns out not to need any new %-of-another-block's-damage field at
    // all — since this block fires at the SAME instant as brant.forte.returned-from-ashes under the
    // SAME active buffs, a plain %ATK-equivalent hit scales in exact proportion through the shared
    // crit/dmgBonus/defMult/resMult chain (both = effBase * X * avgCrit * dmgBonus * ... at that
    // instant, so a 0.3x %ATK hit IS exactly 0.3x that hit's real damage, whatever buffs are active).
    // 566.61% = 30% of the base hit's own summed %ATK (47.2×2 + 94.4 + 188.9×2 + 1322.1 = 1888.7,
    // ×0.3 = 566.61) — chain.sN-suffix gates this to sequence 6+ only, matching sequenceGating.js's
    // established `<char>.chain.sN-<suffix>` convention (see e.g. Qingxiao's chain.s4-actor).
    damage: { hits: [{ atkPct: 566.61 }], category: 'basicDmg', basis: 'ATK' },
    note: "S6: Returned from Ashes also grants a secondary blast worth 30% of its own DMG (confirmed exact) — modeled as a proportional second hit at the same instant, same category, gated to sequence 6.",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'brant.outro.the-course-is-set',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    condition: { element: 'fusion' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh', source: 'teammate-ally-action' },
      { stat: 'skillDmg', value: 25, stacking: 'refresh', source: 'teammate-ally-action' },
    ],
    note: '+20% Fusion DMG / +25% Resonance Skill DMG to the incoming Resonator, 14s or until they\'re swapped out.',
  },
  {
    id: 'brant.selfbuff.trial-by-fire-and-tide',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: conditional passive, no natural decay
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15, source: 'self-kit' }],
    note: 'Inherent Skill: +15% Fusion DMG Bonus (also grants interrupt resistance during Mid-air Attacks — not modeled, no DPS component).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each
  //    node's real mechanic) ──
  {
    id: 'brant.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Intro:Applaud for Me!' },
    timing: { duration: 5 },
    target: { scope: 'self' },
    effects: [{ stat: 'allDmg', value: 20, stacking: 'stacking', maxStacks: 3, source: 'self-kit' }],
    note: 'Real mechanic: casting Intro Skill OR each Mid-air Attack flip grants +20% DMG dealt for 5s, stacking up to 3x (60% at max). RESONANCE_CHAIN_DATA stores the max-stacks total (60); modeled here as per-stack 20% x3 cap so real stacking behavior is captured, not just a flat 60. Only the Intro-cast trigger is wired (a real CHARACTER_ROTATIONS step to anchor it) — the "each Mid-air Attack flip" trigger isn\'t separately modeled (no per-flip step data).',
  },
  {
    id: 'brant.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 30, source: 'self-kit' }],
    note: 'Real trigger: Mid-air Attack / Returned from Ashes hits grant +30% Crit Rate — no duration sourced for this specific node\'s comment, modeled as passive rather than fabricating a timer.',
  },
  {
    id: 'brant.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Fixed 2026-09-02 (Augusta S3 over-crediting pattern): was a single UNSCOPED `totalMult:42`
    // effect — totalMult applies unconditionally to EVERY hit regardless of category, so this was
    // silently boosting his whole kit (Intro, Liberation, Mid-air combo) by +42%, when the kit text
    // is explicit this is scoped to just Returned from Ashes ("The DMG Multiplier of Returned from
    // Ashes is increased by 42%"). Scoped via scopedToBlockId to both Returned from Ashes AND its S6
    // secondary blast (a direct 30%-of-Returned-from-Ashes proportional hit, so it compounds the same
    // way at Sequence 6+, where both nodes are simultaneously unlocked).
    effects: [
      { stat: 'totalMult', value: 42, scopedToBlockId: 'brant.forte.returned-from-ashes', source: 'self-kit' },
      { stat: 'totalMult', value: 42, scopedToBlockId: 'brant.chain.s6-secondary-blast', source: 'self-kit' },
    ],
    note: "Returned from Ashes' own DMG Multiplier +42%.",
  },
  // S4 correctly has NO block — per RESONANCE_CHAIN_DATA's own audit comment, its real effect
  // (Returned from Ashes shield strength +20% + team healing on cast) has zero DPS component.
  {
    id: 'brant.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 15, source: 'self-kit' }],
    note: 'Real trigger: a Basic ATK DMG hit grants +15% Basic Attack DMG Bonus for 10s — no CHARACTER_ROTATIONS step uses a plain \'Basic ATK\' cast (his canonical rotation goes straight to Mid-air combat), so kept passive rather than fabricating a trigger anchor.',
  },
  {
    id: 'brant.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Fixed 2026-09-02 (same Augusta S3 over-crediting pattern as S3 above): was a single UNSCOPED
    // `totalMult:30` effect, silently boosting his whole kit instead of just Mid-air Attack ("Mid-air
    // Attack's DMG Multiplier is increased by 30%" — Mid-air Attack only). Scoped via scopedToBlockId.
    effects: [{ stat: 'totalMult', value: 30, scopedToBlockId: 'brant.midair.stage-2-3-charged-flip', source: 'self-kit' }],
    note: "Mid-air Attack's own DMG Multiplier +30%. Real node ALSO grants a secondary blast on Returned from Ashes worth 30% of its own DMG — now modeled separately as brant.chain.s6-secondary-blast (Phase 0.5 gap #6, fixed 2026-09-02), a real damage block rather than a stat modifier.",
  },
];
