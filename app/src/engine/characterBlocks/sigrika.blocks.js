// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/sigrika.blocks.js
// Sigrika converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Sigrika'], RESONANCE_CHAIN_DATA['Sigrika'] (+ its own audit
// comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Sigrika'], and CHARACTER_ROTATIONS['Sigrika']. No new numbers invented. Her
// selfBuffs' real ER-scaling formula (erScale in CHAR_BUFF_TABLE, +2% Echo Skill
// DMG per 1% ER above 125%, capped at 50%) is modeled at its documented cap
// rather than the real formula, which this schema can't express. The two Forte
// Heavy ATK: Schemata of Runes rotation steps (Chain Whip / Runic Outburst) both
// source their damage from the single 'Runic Outburst' SKILL_MULTIPLIERS row,
// since no per-variant breakdown is published.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Sigrika';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const SIGRIKA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'sigrika.intro.solsworn-etymology',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Solsworn Etymology' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('163.42%') },
    note: 'Primes the next Basic ATK combo to start from Stage 2.',
  },
  {
    id: 'sigrika.basic.stage2-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 2-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row 'Stage 1-4' has 4 arrow-separated stages; this step uses stages 2-4 (per its own label).
    damage: { hits: parseSkillMultiplierHits('50.34%×2 → 33.41%×2+44.54% → 41.36%+51.70%×2+62.03%'), category: 'basicDmg' },
    note: 'Enters Decipher state for 5s on the last hit. Fires twice in the real rotation.',
  },
  {
    id: 'sigrika.basic.elucidated',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Elucidated' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('61.56%×3+123.11%'), category: 'echoDmg' },
    note: 'Echo-type finisher from Decipher state; counted as Echo Skill DMG. Grants 1 Rune. Fires twice in the real rotation.',
  },
  {
    id: 'sigrika.forte.schemata-chain-whip',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Schemata of Runes (Chain Whip)' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('117.67%+205.92%+264.75%'), category: 'echoDmg' },
    note: 'Consumes 2 Runes of the same type for Runic Chain Whip (Stagnates nearby targets, not modeled). Sourced from the single "Runic Outburst" row (no per-variant breakdown published). Category corrected 2026-09-02 from heavyDmg to echoDmg — the kit text explicitly says "Heavy Attack - Schemata of Runes deals Echo Skill DMG" and Runic Chain Whip itself is "(considered Echo Skill DMG)"; a fresh Prydwen dump\'s damage-output simulation shows Heavy at a genuine 0% share.',
  },
  {
    id: 'sigrika.liberation.where-trust-leads-me',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Where Trust Leads Me!' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('861.43%'), category: 'echoDmg' },
    note: 'Counted as Echo Skill DMG despite the Liberation slot. Grants Divergent for 20s (next Rune gain doubles into 2 Runes of opposite types), not modeled.',
  },
  {
    id: 'sigrika.forte.schemata-runic-outburst',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Schemata of Runes (Runic Outburst)' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('117.67%+205.92%+264.75%'), category: 'echoDmg' },
    note: 'Consumes 2 different-type Runes for Runic Outburst (pure bonus DMG, no extra effect). Category corrected 2026-09-02 from heavyDmg to echoDmg — same fix and reasoning as the Chain Whip block above.',
  },
  {
    id: 'sigrika.forte.learn-my-true-name',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Learn My True Name' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('302.87%+908.61%'), category: 'echoDmg' },
    note: 'Once Full Stop hits 100/100; her big Forte nuke finisher, counted as Echo Skill DMG.',
  },
  {
    id: 'sigrika.outro.in-this-very-moment',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 795 }] },
    note: 'Also grants Sigrika (if she re-enters) 2 stacks of Encapsulated for 30s, Stagnating targets whenever a nearby teammate casts their own Echo Skill — not modeled.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'sigrika.selfbuff.aligned-names',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [{ stat: 'echoDmg', value: 50 }],
    note: 'Inherent Aligned Names 2: +2% Echo Skill DMG per 1% ER above 125% (up to 50%) — modeled at the documented cap value rather than the real ER-scaling formula, which this schema can\'t express.',
  },
  {
    id: 'sigrika.libbuff.blessing-of-runes-elemdmg',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: refreshed by teammates' Echo Skill casts, no natural decay sourced
    target: { scope: 'whole-team' },
    condition: { element: 'aero' },
    effects: [{ stat: 'elemDmg', value: 48 }],
    note: "Inherent True Names Aligned — Blessing of Runes, max 6 stacks (18% base + 30% at max): +48% Aero DMG to whichever Resonator is active, refreshed by teammates' Echo Skill casts — modeled at the max-stack value, team-wide.",
  },
  {
    id: 'sigrika.libbuff.blessing-of-runes-echodmg',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'echoDmg', value: 48 }],
    note: 'Same Blessing of Runes stacks as above, +48% Echo Skill DMG to the active Resonator — modeled at the max-stack value, team-wide.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic) ──
  {
    id: 'sigrika.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 15 }],
    note: '+70% DMG Multiplier to specific skills, rotation-averaged to a flat totalMult:15 per the source\'s own documented approximation — kept as-is, passive.',
  },
  {
    id: 'sigrika.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Learn My True Name' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'echoDmg', value: 120 }],
    note: "Learn My True Name's own DMG Multiplier +120% (considered Echo Skill DMG, confirmed exact) — cast-scoped (instant, no persistent duration).",
  },
  // S3 correctly has NO block — corrected 2026-09-02: Innate Gift stack cap raised to 4 (+ persists
  // through Learn My True Name cast/swap-out) is pure resource utility, zero DPS component, unlike
  // S1's genuine +70% multiplier that legitimately warrants a totalMult approximation.
  // RESONANCE_CHAIN_DATA['Sigrika'].s3 is now correctly {} to match.
  {
    id: 'sigrika.chain.s4',
    source: SOURCE, kind: 'buff',
    // Retrofitted 2026-09-02 (the engine-merge history (git log) Phase 0.5 gap #2), same pattern as Qingxiao's
    // chain.s4, using the dump's own exact text: "Any teammate's Echo Skill cast grants the whole
    // team +20% ATK for 20s." Casting an Echo isn't a per-character kit fact (any character can use
    // any equipped Echo), so this reads the new universal 'echo-skill-cast' action tag
    // (rotationSimulator.js, fired directly off any step's own {type:'Echo'} shape) rather than a
    // per-character appliesTags declaration. Was previously modeled as an unconditional, permanent,
    // passive team buff — wrong on two counts: wrong trigger (passive instead of ally-action) and
    // wrong duration (indefinite instead of the real 20s window).
    trigger: { type: 'ally-action', action: 'echo-skill-cast' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: "Any teammate's Echo Skill cast grants the whole team +20% ATK for 20s — confirmed verbatim from the dump.",
  },
  {
    id: 'sigrika.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Where Trust Leads Me!' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'echoDmg', value: 30 }],
    note: "Where Trust Leads Me!'s own DMG Multiplier +30% — cast-scoped (instant, no persistent duration). Corrected 2026-09-02 from libDmg to echoDmg: the damage block this node scopes to (sigrika.liberation.where-trust-leads-me, above) is itself categorized echoDmg (counted as Echo Skill DMG per kit text), so a libDmg buff never actually applied to it.",
  },
  {
    id: 'sigrika.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'deepen', value: 30 }],
    note: 'Targets take +30% more DMG from Sigrika (a flat DMG-taken debuff) — kept passive. Corrected 2026-09-02 from an unsourced defIgnore:15: the real primary S6 effect is this +30% deepen, not a DEF Ignore figure (a separate, smaller Innate Gift? enhancement grants +7.5%/stack DEF Ignore up to 30%, not modeled here, same documented-approximation limits as elsewhere in this file).',
  },
];
