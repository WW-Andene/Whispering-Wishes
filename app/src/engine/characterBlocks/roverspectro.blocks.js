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
    // Fixed 2026-09-03 (Phase A audit — REMAINING_WORK.md 1c): had no damage.category at all — a
    // real Heavy-ATK-slot move with no "considered X DMG" override in the kit text (the dump's own
    // Damage Profile shows Heavy at a genuine 9.2%/15,731 share, comparable to categories already
    // included in dmgFocus elsewhere) — silently zeroed any teammate's Heavy ATK DMG Bonus.
    damage: { hits: parseSkillMultiplierHits('19.27%×5 → 76.05% → 126.75%'), category: 'heavyDmg' },
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
    // dotApplier added 2026-09-02 (the engine-merge history (git log) Phase 2) — matches this block's own note (6
    // stacks) and CHAR_BUFF_TABLE.debuffs.frazzle's already-sourced condition text exactly.
    // resolveFrazzleFromBlocks SUMS this with roverspectro.forte.resonating-whirl's own 2 stacks below
    // (2+6=8), matching the legacy pre-combined value exactly, not double-counted (Frazzle's real
    // interaction rule per the engine-merge history (git log) 1.1 — two separate real application points genuinely
    // add together, unlike Erosion's MAX rule).
    dotApplier: { mechanic: 'frazzle', value: 6 },
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
    // dotApplier added 2026-09-02 — see roverspectro.liberation.echoing-orchestra's own comment (this
    // block's 2 stacks + that one's 6 = the legacy pre-combined 8, summed correctly by
    // resolveFrazzleFromBlocks). Value stays 2 regardless of this block firing twice in the modeled
    // rotation — the SAME "declared kit fact, not per-cast" convention the legacy value already used.
    dotApplier: { mechanic: 'frazzle', value: 2 },
  },
  {
    id: 'roverspectro.forte.resonating-echoes',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Resonating Echoes' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-03 (Phase A audit — REMAINING_WORK.md 1c): was category:'basicDmg' — but her own
    // kit text is explicit ("Resonance Skill: Resonating Echoes ... considered Resonance Skill DMG"),
    // the same "considered X DMG" override pattern found roster-wide this session. A Basic ATK DMG
    // Bonus was being wrongly credited to this hit while a real Skill DMG Bonus was wrongly denied.
    damage: { hits: parseSkillMultiplierHits('79.53%+159.05%'), category: 'skillDmg' },
    note: "Basic-ATK-button cast after Resonating Spin fully ends, but the kit text overrides it to Resonance Skill DMG (same override her own Forte Circuit section states for Resonating Spin/Whirl too).",
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
