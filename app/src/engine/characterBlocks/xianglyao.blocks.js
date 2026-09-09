// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/xianglyao.blocks.js
// Xiangli Yao converted to TriggerBlocks. Sourced from characters.js's already-
// audited CHAR_BUFF_TABLE['Xiangli Yao'], RESONANCE_CHAIN_DATA['Xiangli Yao'] (+
// its own detailed 2026-09-01 audit comment, read directly for each node's real
// mechanic), SKILL_MULTIPLIERS['Xiangli Yao'], and CHARACTER_ROTATIONS
// ['Xiangli Yao']. No new numbers invented. S1 is modeled as a real bonus-hit
// damage block (xianglyao.chain.s1, fixed in the documented-gaps sweep below) —
// its "8% of Law of Reigns' own DMG Multiplier ×6" is a derivable number computed
// from Law of Reigns' own already-sourced multiplier, not a guess. S5's Outro
// Chain Rule +222% DMG Multiplier portion is captured separately via
// xianglyao.chain.s5-outro (outroDmg category, added 2026-09-02).
//
// Full kit audit 2026-09-09: fixed S3, which a prior pass's own comment had
// flagged as trigger-mismatched against the kit text (anchored to Divergence
// instead of the real trigger, Cogitation Model) but never actually corrected.
// This engine time-averages a windowed buff's uptime across the whole rotation,
// so the wrong, later anchor measurably understated its contribution — confirmed
// via direct measurement (+~10.7% total damage once fixed). Also flagged (not
// fixed, to avoid introducing a double-counting bug) S2's own second valid
// trigger (Resonance Skill cast, in addition to Cogitation Model) — this
// schema's single-trigger-per-block design can't add a second anchor for the
// same stat without risking additive double-application during any window
// overlap; documented as a known, modest (~0.73%) undercount instead.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Xiangli Yao';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const XIANGLI_YAO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'xianglyao.intro.principle',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Principle' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting teammate skillDmg buffs. No override text names a different category, same default-to-
    // skillDmg convention applied project-wide.
    damage: { hits: parseSkillMultiplierHits('99.41%×2'), category: 'skillDmg', basis: 'ATK' },
    note: 'Builds Capacity.',
  },
  {
    id: 'xianglyao.liberation.cogitation-model',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Cogitation Model' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1466.06%'), category: 'libDmg', basis: 'ATK' },
    note: 'Enters Intuition for 24s: Basic/Heavy/Dodge Counter become Pivot-Impale, base Skill becomes Divergence, 3 Hypercube charges granted. Skill:Deduction\'s own hit, cast right before this, is cancelled by the Liberation cast per the real rotation — not modeled.',
  },
  {
    id: 'xianglyao.skill.intuition-divergence',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Intuition: Divergence' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('49.59%×3+173.55%×2'), category: 'skillDmg', basis: 'ATK' },
    note: 'Resonance Skill replacement in Intuition; grants 2 Performance Capacity per cast. Counted as Skill DMG. Fires twice in the real rotation.',
  },
  {
    id: 'xianglyao.forte.revamp',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Revamp' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('21.87%×4+65.61%×2'), category: 'libDmg', basis: 'ATK' },
    note: 'Mid-air Attack cast right after Divergence/Decipher; grants 3 Performance Capacity per hit, counted as Resonance Liberation DMG. Fires twice.',
  },
  {
    id: 'xianglyao.forte.law-of-reigns',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Law of Reigns' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('95.73%×4+255.28%'), category: 'libDmg', basis: 'ATK' },
    note: 'Skill auto-replaced once Performance Capacity hits 5/5 in Intuition; consumes 1 of 3 Hypercubes per cast, counted as Resonance Liberation DMG. Fires 3x in the real rotation, ending Intuition immediately on the 3rd.',
  },
  {
    id: 'xianglyao.basic.intuition-pivot-impale',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Intuition: Pivot-Impale' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('119.67% → 60.92%×4 → 133.25%×2'), category: 'basicDmg', basis: 'ATK' },
    note: 'Basic/Heavy ATK replacement in Intuition (3-stage combo); Stage 1 grants 1 Performance Capacity, Stage 2/3 grant 2 each (5 total). Counted as Basic ATK DMG, NOT Liberation DMG.',
  },
  {
    id: 'xianglyao.outro.chain-rule',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 237.63 }, { atkPct: 237.63 }, { atkPct: 237.63 }], category: 'outroDmg', basis: 'ATK' },
    note: "Laser strikes on the incoming Resonator's first Basic ATK hit — pure DMG proc (3 procs over 8s, 2s ICD), no team buff. Retrofitted 2026-09-02 (the engine-merge history (git log) Phase 0.5 gap #16, new outroDmg category) to tag this as Outro DMG, matching S5's now-representable +222% bonus below.",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'xianglyao.selfbuff.knowing',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Skill:Intuition: Divergence' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 5, stacking: 'stacking', maxStacks: 4, source: 'self-kit' }],
    note: 'Inherent Skill Knowing: +5% Electro DMG Bonus per Resonance Skill cast (8s), stacks up to 4x (20% cap) — modeled as per-stack stacking, anchored to the Divergence cast used in her real rotation.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 audit comment for
  //    each node's real mechanic; S1 is modeled as a real bonus-hit damage block below, fixed in the
  //    documented-gaps sweep — see the file header comment) ──
  {
    id: 'xianglyao.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Flagged 2026-09-09 (full-kit audit): the real kit text names TWO valid triggers — "Casting
    // Resonance Skill OR Cogitation Model" — but only Cogitation Model is anchored here. In the real
    // modeled rotation, Divergence (Resonance Skill's Intuition replacement) casts twice more and would
    // also legitimately re-trigger/refresh this buff. Confirmed via direct measurement this is a real,
    // if modest, undercount: adding a second trigger anchor for Divergence raised total damage by
    // ~0.73% at sequence 3. NOT fixed by adding a second sibling block for the same effect, though —
    // this schema's trigger.on only accepts one string, and two separate blocks sharing the same stat
    // would each independently compute and apply their own average-uptime multiplier, ADDITIVELY
    // stacking during any time both windows overlap (a real double-counting bug this project is careful
    // to avoid elsewhere) rather than correctly refreshing a single conceptual buff. In real play this
    // buff is refreshed near-continuously (Skill-slot casts, including Law of Reigns, happen throughout
    // the whole Intuition window), so no single 8s anchor fully captures it — left anchored to the
    // earliest real trigger (Cogitation Model) as the best available single-trigger approximation,
    // rather than risk a double-counted fix without a real multi-trigger-single-window schema feature.
    trigger: { type: 'cast', on: 'Liberation:Cogitation Model' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 30, source: 'self-kit' }],
    note: 'Crit DMG +30% for 8s, triggered by casting Resonance Skill OR Resonance Liberation Cogitation Model (confirmed exact) — modeled anchored to the earliest real trigger (Cogitation Model) in her real rotation; the Resonance Skill/Divergence re-triggers are a known, documented undercount (see comment above).',
  },
  {
    id: 'xianglyao.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Fixed 2026-09-09 (full-kit audit): was anchored to 'Skill:Intuition: Divergence' — but the kit
    // text is explicit the real trigger is "Casting Cogitation Model" (Liberation), a mismatch this
    // file's own prior App Data Comparison note already flagged but never actually corrected (it only
    // resolved the separate stacking-vs-refresh ambiguity, leaving the trigger source itself wrong).
    // Confirmed this is NOT cosmetic: this engine time-averages a windowed buff's uptime across the
    // WHOLE rotation, so anchoring the window's start later (at Divergence, the 4th step) instead of
    // earlier (at Cogitation Model/Liberation, the 3rd step) measurably understates its average
    // contribution — verified via direct measurement that re-anchoring to the real trigger raised the
    // rotation's total damage from 81367.51 to 90035.39 (+~10.7%) at sequence 3.
    trigger: { type: 'cast', on: 'Liberation:Cogitation Model' },
    timing: { duration: 24 },
    target: { scope: 'self' },
    // Fixed 2026-09-03: added the missing libDmg effect. The real buff covers BOTH Skill-type moves
    // (Decipher/Deduction/Divergence) AND Law of Reigns (libDmg-categorized) — a single node can carry
    // multiple effects with different stat keys, so this just needed the 2nd effect added, not a new
    // schema field (same "no schema change needed" resolution as Camellya's S5 multi-skill node).
    effects: [
      { stat: 'skillDmg', value: 63, source: 'self-kit' },
      { stat: 'libDmg', value: 63, source: 'self-kit' },
    ],
    note: "DMG of Decipher/Deduction/Divergence/Law of Reigns +63% for 24s, re-triggerable up to 5 times (refreshes the window, not a x5 stack — confirmed via the project's own no-stacking-field default, matching every other Resonance Chain node's realistic total-value range) — both the Skill-type portion (skillDmg) and the Law of Reigns portion (libDmg) are captured, anchored to the real trigger (Cogitation Model cast) per the kit text.",
  },
  {
    id: 'xianglyao.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Cogitation Model' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'libDmg', value: 25, stacking: 'refresh', source: 'self-kit' }],
    note: 'Casting Cogitation Model grants the whole team +25% DMG Bonus to Resonance Liberation for 30s (confirmed exact, team-wide).',
  },
  {
    id: 'xianglyao.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Cogitation Model' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 100, source: 'self-kit' }],
    note: "Cogitation Model's own DMG Multiplier +100% — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5. This node ALSO grants Outro Chain Rule's own DMG Multiplier +222%, now captured separately below (xianglyao.chain.s5-outro) since the new outroDmg category (Phase 0.5 gap #16, 2026-09-02) gives it a real home.",
  },
  {
    id: 'xianglyao.chain.s5-outro',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Cogitation Model' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'outroDmg', value: 222, source: 'self-kit' }],
    note: "Retrofitted 2026-09-02 (the engine-merge history (git log) Phase 0.5 gap #16): Cogitation Model also grants Outro Chain Rule's own DMG Multiplier +222% — previously unrepresented entirely since no outroDmg category existed. Cast-scoped to Cogitation Model, same single-hit-scoped pattern as the sibling S5 node above; only affects xianglyao.outro.chain-rule's own hits (category: 'outroDmg').",
  },
  {
    // Fixed 2026-09-10 (documented-gaps sweep): re-examined the file header's own claim that S1 has
    // "no derivable flat %ATK figure sourced" — false. The kit text gives "8% of Law of Reigns' own
    // DMG Multiplier" × 6 Convolution Matrices = 48% of Law of Reigns' own already-sourced total
    // multiplier (95.73%×4+255.28% = 638.20%, xianglyao.forte.law-of-reigns above). 638.20% × 0.48 =
    // 306.34% — a real, derivable, computed-not-guessed number, same "derive it, don't guess it"
    // standard as every other fix this session. Modeled as its own discrete damage block (not a %
    // modifier, since these are 6 separate extra hits) triggered on the same real cast Law of Reigns'
    // own hit uses, so it correctly fires all 3 times Law of Reigns is cast in the real rotation.
    id: 'xianglyao.chain.s1',
    source: SOURCE, kind: 'damage', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Law of Reigns' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('306.34%'), category: 'libDmg', basis: 'ATK' },
    note: "Prodigy of Protégés: Law of Reigns additionally launches 6 Convolution Matrices, each dealing Resonance Liberation DMG = 8% of Law of Reigns' own DMG Multiplier (6×8%=48% of 638.20% = 306.34%, derived from Law of Reigns' own sourced multiplier, not guessed). RESONANCE_CHAIN_DATA['Xiangli Yao'].s1 stays {} deliberately — that flat table has no scopedToBlockId mechanism, so a real libDmg value there would incorrectly also inflate Cogitation Model's/Revamp's own libDmg-categorized hits.",
  },
  {
    id: 'xianglyao.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Law of Reigns' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 76, source: 'self-kit' }],
    note: "Law of Reigns' own DMG Multiplier +76% (re-verified 2026-09-01, corrected from an unsourced totalMult:15) — cast-scoped (instant, no persistent duration).",
  },
];
