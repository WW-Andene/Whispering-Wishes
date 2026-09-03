// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/xianglyao.blocks.js
// Xiangli Yao converted to TriggerBlocks. Sourced from characters.js's already-
// audited CHAR_BUFF_TABLE['Xiangli Yao'], RESONANCE_CHAIN_DATA['Xiangli Yao'] (+
// its own detailed 2026-09-01 audit comment, read directly for each node's real
// mechanic), SKILL_MULTIPLIERS['Xiangli Yao'], and CHARACTER_ROTATIONS
// ['Xiangli Yao']. No new numbers invented. S1 correctly has NO block — its real
// 6-bonus-hits-at-8%-of-another-move's-multiplier mechanic has no derivable flat
// %ATK figure sourced (only "8% of Law of Reigns' own DMG Multiplier" is stated,
// not a computed number), so the source table's own zeroing is kept rather than
// guessing a derivation. S5's Outro Chain Rule +222% DMG Multiplier portion is
// similarly not represented (no matching category exists).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Xiangli Yao';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const XIANGLI_YAO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'xianglyao.intro.principle',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Principle' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('99.41%×2') },
    note: 'Builds Capacity.',
  },
  {
    id: 'xianglyao.liberation.cogitation-model',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Cogitation Model' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1466.06%'), category: 'libDmg' },
    note: 'Enters Intuition for 24s: Basic/Heavy/Dodge Counter become Pivot-Impale, base Skill becomes Divergence, 3 Hypercube charges granted. Skill:Deduction\'s own hit, cast right before this, is cancelled by the Liberation cast per the real rotation — not modeled.',
  },
  {
    id: 'xianglyao.skill.intuition-divergence',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Intuition: Divergence' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('49.59%×3+173.55%×2'), category: 'skillDmg' },
    note: 'Resonance Skill replacement in Intuition; grants 2 Performance Capacity per cast. Counted as Skill DMG. Fires twice in the real rotation.',
  },
  {
    id: 'xianglyao.forte.revamp',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Revamp' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('21.87%×4+65.61%×2'), category: 'libDmg' },
    note: 'Mid-air Attack cast right after Divergence/Decipher; grants 3 Performance Capacity per hit, counted as Resonance Liberation DMG. Fires twice.',
  },
  {
    id: 'xianglyao.forte.law-of-reigns',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Law of Reigns' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('95.73%×4+255.28%'), category: 'libDmg' },
    note: 'Skill auto-replaced once Performance Capacity hits 5/5 in Intuition; consumes 1 of 3 Hypercubes per cast, counted as Resonance Liberation DMG. Fires 3x in the real rotation, ending Intuition immediately on the 3rd.',
  },
  {
    id: 'xianglyao.basic.intuition-pivot-impale',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Intuition: Pivot-Impale' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('119.67% → 60.92%×4 → 133.25%×2'), category: 'basicDmg' },
    note: 'Basic/Heavy ATK replacement in Intuition (3-stage combo); Stage 1 grants 1 Performance Capacity, Stage 2/3 grant 2 each (5 total). Counted as Basic ATK DMG, NOT Liberation DMG.',
  },
  {
    id: 'xianglyao.outro.chain-rule',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 237.63 }, { atkPct: 237.63 }, { atkPct: 237.63 }], category: 'outroDmg' },
    note: "Laser strikes on the incoming Resonator's first Basic ATK hit — pure DMG proc (3 procs over 8s, 2s ICD), no team buff. Retrofitted 2026-09-02 (the engine-merge history (git log) Phase 0.5 gap #16, new outroDmg category) to tag this as Outro DMG, matching S5's now-representable +222% bonus below.",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'xianglyao.selfbuff.knowing',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Intuition: Divergence' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 5, stacking: 'stacking', maxStacks: 4 }],
    note: 'Inherent Skill Knowing: +5% Electro DMG Bonus per Resonance Skill cast (8s), stacks up to 4x (20% cap) — modeled as per-stack stacking, anchored to the Divergence cast used in her real rotation.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 audit comment for
  //    each node's real mechanic; S1 correctly has NO block — no derivable flat %ATK figure sourced
  //    for its real bonus-hit mechanic, per the audit's own zeroing) ──
  // S1 correctly has NO block — Law of Reigns additionally launches 6 Convolution Matrices, each
  // dealing Resonance Liberation DMG = 8% of Law of Reigns' own DMG Multiplier — 6 extra proc hits
  // scaling off another move's multiplier, not a flat stat buff or a directly-computable %ATK figure.
  {
    id: 'xianglyao.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Cogitation Model' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 30 }],
    note: 'Crit DMG +30% for 8s, triggered by casting Resonance Skill OR Resonance Liberation Cogitation Model (confirmed exact) — modeled anchored to the Cogitation Model cast used in her real rotation.',
  },
  {
    id: 'xianglyao.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Intuition: Divergence' },
    timing: { duration: 24 },
    target: { scope: 'self' },
    // Fixed 2026-09-03: added the missing libDmg effect. The real buff covers BOTH Skill-type moves
    // (Decipher/Deduction/Divergence) AND Law of Reigns (libDmg-categorized) — a single node can carry
    // multiple effects with different stat keys, so this just needed the 2nd effect added, not a new
    // schema field (same "no schema change needed" resolution as Camellya's S5 multi-skill node).
    effects: [
      { stat: 'skillDmg', value: 63 },
      { stat: 'libDmg', value: 63 },
    ],
    note: "DMG of Decipher/Deduction/Divergence/Law of Reigns +63% for 24s, up to 5 stacks (corrected from a wrong value of 40) — both the Skill-type portion (skillDmg) and the Law of Reigns portion (libDmg) are now captured.",
  },
  {
    id: 'xianglyao.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Cogitation Model' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'libDmg', value: 25, stacking: 'refresh' }],
    note: 'Casting Cogitation Model grants the whole team +25% DMG Bonus to Resonance Liberation for 30s (confirmed exact, team-wide).',
  },
  {
    id: 'xianglyao.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Cogitation Model' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 100 }],
    note: "Cogitation Model's own DMG Multiplier +100% — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5. This node ALSO grants Outro Chain Rule's own DMG Multiplier +222%, now captured separately below (xianglyao.chain.s5-outro) since the new outroDmg category (Phase 0.5 gap #16, 2026-09-02) gives it a real home.",
  },
  {
    id: 'xianglyao.chain.s5-outro',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Cogitation Model' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'outroDmg', value: 222 }],
    note: "Retrofitted 2026-09-02 (the engine-merge history (git log) Phase 0.5 gap #16): Cogitation Model also grants Outro Chain Rule's own DMG Multiplier +222% — previously unrepresented entirely since no outroDmg category existed. Cast-scoped to Cogitation Model, same single-hit-scoped pattern as the sibling S5 node above; only affects xianglyao.outro.chain-rule's own hits (category: 'outroDmg').",
  },
  {
    id: 'xianglyao.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Law of Reigns' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 76 }],
    note: "Law of Reigns' own DMG Multiplier +76% (re-verified 2026-09-01, corrected from an unsourced totalMult:15) — cast-scoped (instant, no persistent duration).",
  },
];
