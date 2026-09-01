// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/cantarella.blocks.js
// Cantarella converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Cantarella'], RESONANCE_CHAIN_DATA['Cantarella'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Cantarella'], and CHARACTER_ROTATIONS['Cantarella']. No new numbers
// invented. Several real mechanics have no home in this schema yet and are documented
// rather than force-fit (Jolt's auto-proc hit, the Diffusion Coordinated ATK summon
// chain, S4's healing-only effect, S5's +5 Dreamweaver hit-count cap) — matching the
// same "don't fabricate a value" rule the source file's own audit already applied.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Cantarella';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const CANTARELLA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'cantarella.intro.ripple',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Cruise' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('42.25%×4') },
  },
  {
    id: 'cantarella.basic.stage3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Illusion Collapse Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('72.57%×2'), category: 'basicDmg' },
    note: 'Intro (Ripple) primes her next Basic ATK to skip straight to Stage 3 — only that primed stage is a real CHARACTER_ROTATIONS step, Stage 1-2 not separately modeled here.',
  },
  {
    id: 'cantarella.skill.graceful-step',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Dance with Shadows' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('73.60%×2'), category: 'skillDmg' },
  },
  {
    id: 'cantarella.liberation.flowing-suffocation',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Beneath the Sea' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('376.00%'), category: 'libDmg' },
    note: 'Also applies Diffusion: for 30s (or 21 Dreamweaver hits, whichever first) every hit landed by her or the team can summon a Coordinated ATK (14.54% each, 21 max) — an off-field summon-chain mechanic with no home in this schema yet, not modeled (same class of gap already flagged for her own S5 Dreamweaver-cap chain node).',
  },
  {
    id: 'cantarella.heavy.delusive-dive',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Delusive Dive' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('53.05%×2') },
    note: 'Consumes all 5 Trance and enters 8s Mirage state.',
  },
  {
    id: 'cantarella.skill.flickering-reverie',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Flickering Reverie' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('196.23%'), category: 'skillDmg' },
    note: 'Mirage-state Skill replacement, considered an Echo Skill cast. Inflicts Hazy Dream, whose follow-up Jolt hit (198.81%, considered Basic ATK DMG) is a separate auto-triggered proc off the target\'s next hit taken — not anchored to its own CHARACTER_ROTATIONS step, not modeled.',
  },
  {
    id: 'cantarella.forte.phantom-sting',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Phantom Sting 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('35.33%×3+62.93%×2+64.62%×4'), category: 'basicDmg' },
    note: 'Mirage-state Basic ATK replacement (3-tap combo, builds Shiver).',
  },
  {
    id: 'cantarella.forte.perception-drain',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Perception Drain' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('667.99%×2'), category: 'basicDmg' },
    note: 'Considered Basic ATK DMG per its own kit text and also counted as an Echo Skill cast. Also heals the team and re-applies Hazy Dream — not modeled (no DPS component).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'cantarella.outro.gentle-tentacles',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [
      { stat: 'elemDmg', value: 20, stacking: 'refresh' },
      { stat: 'skillDmg', value: 25, stacking: 'refresh' },
    ],
    note: 'Forfeited early if the buffed Resonator is swapped out before 14s expires — early-forfeit not modeled (schema has no early-consumption trigger for outro buffs), same simplification already used for Brant/Buling\'s equivalent outros.',
  },
  {
    id: 'cantarella.selfbuff.inherent-skill-poison',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 6, stacking: 'stacking', maxStacks: 2 }],
    note: 'Inherent Skill Poison: +6% Havoc DMG Bonus per Echo Skill cast, stacks up to 2x (12% cap) — modeled as per-stack 6% x2, matching the real stacking mechanic rather than a flat 12%. No Echo Skill cast step exists in CHARACTER_ROTATIONS to anchor the trigger precisely, kept passive per the source table\'s own condition text.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S4/S5 correctly have NO block — heal-only / hit-count-cap-only,
  //    no DPS component per that audit) ──
  {
    id: 'cantarella.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 50 }],
    note: "Real scope: Graceful Step / Flickering Reverie / Perception Drain's own DMG Multiplier +50% (mixed Skill+Forte-that-counts-as-Basic-ATK scope, doesn't cleanly map to one existing stat category — kept as totalMult per the audit comment's own reasoning). Also grants 1 Resonance Skill cast Trance recovery and Perception Drain interrupt immunity, both utility, not modeled.",
  },
  {
    id: 'cantarella.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 245 }],
    note: "Jolt's own DMG Multiplier +245%. Jolt itself is a proc-only auto-trigger not anchored to a CHARACTER_ROTATIONS step (see cantarella.skill.flickering-reverie note), so this buff has no block to apply to in the current rotation simulation — recorded faithfully anyway per the audit's real value, same documented-but-currently-inert pattern as Buling's S6/libBuff overlap.",
  },
  {
    id: 'cantarella.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Beneath the Sea' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 370 }],
    note: "Real mechanic: scoped to Flowing Suffocation's own DMG Multiplier +370%, cast-scoped (instant, no persistent duration) — same single-hit-scoped pattern as Calcharo's S5. Also causes Flowing Suffocation to enter Mirage on cast, utility, not modeled.",
  },
  {
    id: 'cantarella.chain.s6-basic-mult',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'basicDmg', value: 80 }],
    note: "Phantom Sting's own DMG Multiplier +80% (Mirage-state Basic ATK combo, basicDmg category confirmed exact per the audit comment).",
  },
  {
    id: 'cantarella.chain.s6-defignore',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Beneath the Sea' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 30 }],
    note: 'DEF Ignore +30% for 10s after casting Flowing Suffocation (confirmed exact per the audit comment) — split from the basicDmg node above since the two effects have different triggers/durations and the schema only allows one timing per block.',
  },
];
