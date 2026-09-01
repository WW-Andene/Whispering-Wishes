// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/roverspectro.blocks.js
// Rover: Spectro converted to TriggerBlocks. Sourced from characters.js's already-
// audited CHAR_BUFF_TABLE['Rover: Spectro'], RESONANCE_CHAIN_DATA['Rover: Spectro']
// (+ its own 2026-09-01 re-audit comment, read directly for each node's real
// mechanic), SKILL_MULTIPLIERS['Rover: Spectro'], and CHARACTER_ROTATIONS
// ['Rover: Spectro']. No new numbers invented. S3/S4 correctly have NO block —
// zero real DPS component per the audit's own zeroing. CHAR_BUFF_TABLE's own
// selfBuffs entry is explicitly chain-gated (S6-conditional, "not innate") —
// modeled once via S6 below, not duplicated. Its Frazzle-stack debuff has no
// matching stat key in this schema (same class as Chisa's), not modeled.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Rover: Spectro';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const ROVER_SPECTRO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'roverspectro.heavy.standard-resonance-aftertune',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Standard / Resonance / Aftertune' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('19.27%×5 → 76.05% → 126.75%') },
    note: 'Warm-up combo: charged Heavy ATK into timed-press Resonance follow-up into Aftertune finisher. Fills Diminutive Sound fast without a full Basic combo.',
  },
  {
    id: 'roverspectro.intro.waveshock',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Waveshock' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('168.99%') },
    note: 'Adds a bit more Diminutive Sound.',
  },
  {
    id: 'roverspectro.liberation.echoing-orchestra',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Echoing Orchestra' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.81%+675.96%'), category: 'libDmg' },
    note: 'Delayed blast; applies a full 6 stacks of Spectro Frazzle to the target in one hit.',
  },
  {
    id: 'roverspectro.basic.vibration-manifestation-stage1-4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Vibration Manifestation Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says only 2 taps are used here — only Stages 1-2 of the row's
    // 4-stage combo are used.
    damage: { hits: parseSkillMultiplierHits('59.15%+76.05%'), category: 'basicDmg' },
    note: 'Tap Basic Attack twice to refill Diminutive Sound toward the next Forte cast (only Stages 1-2 fire).',
  },
  {
    id: 'roverspectro.forte.resonating-whirl',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Resonating Whirl' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says this single step covers Resonating Spin (auto-upgrade from
    // Skill at 50+ Diminutive Sound) AND the immediate Resonating Whirl Basic ATK follow-up chained
    // right after it — both rows' hits combined.
    damage: { hits: [...parseSkillMultiplierHits('129.08%×2'), ...parseSkillMultiplierHits('39.77%')], category: 'skillDmg' },
    note: 'At 50+ Diminutive Sound, Skill auto-upgrades into Resonating Spin (2 Spectro Frazzle stacks + Shimmer, which stops decay), immediately chained into the Resonating Whirl Basic ATK follow-up. Fires twice in the real rotation.',
  },
  {
    id: 'roverspectro.forte.resonating-echoes',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Resonating Echoes' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('79.53%+159.05%'), category: 'basicDmg' },
    note: 'Separate Basic ATK combo cast after Resonating Spin fully ends.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S3/S4 correctly have NO block — zero real DPS component per the
  //    audit's own zeroing) ──
  {
    id: 'roverspectro.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 15 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  {
    id: 'roverspectro.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 20 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  // S3 correctly has NO block — Energy Regen +20%, zero real DPS component, no matching category in
  // this schema.
  // S4 correctly has NO block — team heal on Liberation cast, zero real DPS component.
  {
    id: 'roverspectro.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Echoing Orchestra' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 40 }],
    note: "Echoing Orchestra's own DMG Multiplier +40% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'roverspectro.chain.s6',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'cast', on: 'Skill:Resonating Slashes' },
    timing: { duration: 20 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'resShred', value: 10 }],
    note: "S6 (5 copies): Resonating Slashes/Spin hit -> Spectro RES Shred -10% (20s) — chain-gated, not innate to base kit (per CHAR_BUFF_TABLE's own note); modeled anchored to Resonating Slashes' own cast label, but her real CHARACTER_ROTATIONS never uses the base Skill (the warm-up step is Heavy ATK, and Forte auto-upgrades Skill straight to Resonating Spin), so this block is present but does not fire in the standard rotation.",
  },
];
