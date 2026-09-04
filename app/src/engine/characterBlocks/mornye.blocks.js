// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/mornye.blocks.js
// Mornye converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Mornye'], RESONANCE_CHAIN_DATA['Mornye'] (+ its own audit
// comment, read directly for each node's real mechanic), SKILL_MULTIPLIERS
// ['Mornye'], and CHARACTER_ROTATIONS['Mornye']. No new numbers invented. Her
// entire kit scales off DEF, not ATK (confirmed by SKILL_MULTIPLIERS' own row
// comment), so every damage block below uses basis: 'DEF'. S1/S3/S4 correctly have
// NO block — their own RESONANCE_CHAIN_DATA audit comment explicitly says "no
// basis"/"not a DPS stat" for each, so the real effect is pure utility (interrupt
// immunity/marker changes for S1, Concerto/Relative Momentum restoration for S3,
// team DEF/Healing for S4), matching the same "don't force-fit what the audit
// itself flags as zero-DPS" rule already applied for Chisa's S4 in an earlier batch.
// Basic ATK:Wide Field Observation Mode Stage 1-3 now has a matching SKILL_MULTIPLIERS row
// (added 2026-09-02 against a fresh the source dump, closing a real "silent zero-DMG" gap — her
// real rotation's Basic Attack step had no damage block at all before this).
// Full independent 9-dimension re-audit 2026-09-04 (Phase A, REMAINING_WORK.md 1c) against a fresh
// dump re-derivation: fixed the Intro block's missing damage.category (was uncategorized, silently
// rejecting Resonance Skill DMG Bonus — same bug class as Lynae's Outro), corrected
// CHAR_BUFF_TABLE['Mornye'].tuneBreak.ruptureDmgMult from an unsourced 300 to the dump's real exact
// 298.22 (same fix class as Lynae's ruptureDmgMult), and refreshed this file's S1/S3/S4 comments
// (they described RESONANCE_CHAIN_DATA as "still storing a stale nonzero value", which a prior pass
// had already fixed to {} — the comments just hadn't been updated to say so). S5's real second
// component (Tune Rupture Response - Particle Jet DMG Multiplier +160%) is flagged as a known,
// unrepresentable-in-schema gap rather than silently dropped — see that block's own note. Every other
// dimension (SKILL_MULTIPLIERS, CHARACTER_ROTATIONS, dmgFocus, weapon/echo data, icons) verified clean
// against an independently-built kit model — see REMAINING_WORK.md for full reasoning.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Mornye';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const MORNYE_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS — all DEF-scaling) ──
  {
    id: 'mornye.intro.convergence',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Convergence' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting real Resonance Skill DMG Bonus. The dump's own Intro Skill multiplier row gives no
    // "considered X DMG" override ("Attack, Fusion DMG. Jumps into mid-air..."), so per the established
    // default-convention (an un-overridden Intro Skill hit defaults to skillDmg — Calcharo's Wanted
    // Outlaw/Brant's Applaud for Me!/Aalto's Feint Shot/Buling's Summon and Smite all follow this),
    // fixed to skillDmg.
    damage: { hits: parseSkillMultiplierHits('202.79%'), category: 'skillDmg', basis: 'DEF' },
    note: 'Clears Rest Mass Energy, immediately enters Wide Field Observation Mode for 30s, generates a Syntony Field (team healing, +50% Off-Tune Buildup Rate, interruption resistance, not modeled).',
  },
  {
    id: 'mornye.basic.wide-field-stage1-3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Wide Field Observation Mode Stage 1-3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('13.92%×4 → 25.85%×4 → 9.31%×4+33.09%×2'), category: 'basicDmg', basis: 'DEF' },
    note: 'Her real Basic Attack combo — replaces plain Basic ATK while in Wide Field Observation Mode, builds Relative Momentum toward 100.',
  },
  {
    id: 'mornye.skill.distributed-array',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Distributed Array' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('39.77%×4'), category: 'skillDmg', basis: 'DEF' },
    note: 'Heals the team and summons Hover Cannons for more Fusion DMG (not modeled), builds the last of Relative Momentum.',
  },
  {
    id: 'mornye.forte.inversion',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Heavy Attack: Inversion' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('258.46%'), category: 'heavyDmg', basis: 'DEF' },
    note: 'Once Relative Momentum hits 100/100, replaces Heavy Attack — counted as Heavy ATK DMG. Inflicts Observation Marker on the target for 30s.',
  },
  {
    id: 'mornye.liberation.critical-protocol',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Critical Protocol' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('522.33%'), category: 'libDmg', basis: 'DEF' },
    note: 'Replaces the Syntony Field with a stronger High Syntony Field for 25s (+20% team DEF, +40% Healing Multiplier on top of the base field, neither modeled).',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'mornye.outro.recursion',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 25, stacking: 'refresh' }],
    note: "Also causes any teammate's Tune Break damage on a target Mornye marked with Observation Marker to upgrade it to an Interfered Marker, boosting nearby teammates' DMG on that target up to +40% scaling with her Energy Regen above 100% — not modeled (cross-character trigger, no home in this schema).",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each node's
  //    real mechanic; S1/S3/S4 correctly have NO block — pure utility/resource-restoration with zero
  //    DPS component per the audit's own reasoning; RESONANCE_CHAIN_DATA['Mornye'].s1/s3/s4 are
  //    already correctly {} to match, re-verified 2026-09-04 — an older version of this comment
  //    described them as "still storing a stale nonzero value", which is no longer true) ──
  // S1 correctly has NO block — interrupt immunity + Interfered Marker duration/condition changes, no
  // flat % per the audit comment ("no basis"); RESONANCE_CHAIN_DATA['Mornye'].s1 is {}, matching.
  {
    id: 'mornye.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Heavy Attack: Inversion' },
    timing: { duration: 30 }, // matches Observation Marker's own 30s duration, since this scales off targets carrying it
    target: { scope: 'whole-team' },
    effects: [{ stat: 'critDmg', value: 32 }],
    note: 'Team Crit DMG +32% max vs Interfered Marker targets (confirmed exact value, corrected from a wrong deepen category) — Interfered Marker itself is upgraded from Observation Marker by an ALLY\'s Tune Break hit (a cross-character trigger this schema has no clean anchor for), modeled anchored to the Inversion cast that applies the base Observation Marker instead.',
  },
  // S3 correctly has NO block — corrected 2026-09-02 against a fresh the source dump: real effect is
  // "casting Distributed Array additionally restores 25 Concerto Energy and 100 Relative Momentum,
  // once every 25s", pure resource restoration with zero DPS component (same "no real DPS component"
  // pattern as S1/S4 above); RESONANCE_CHAIN_DATA['Mornye'].s3 is {}, matching.
  // S4 correctly has NO block — High Syntony Field healing +30%, not a DPS stat per the audit comment
  // ("no basis"); RESONANCE_CHAIN_DATA['Mornye'].s4 is {}, matching.
  {
    id: 'mornye.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Critical Protocol' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 40 }],
    // Note (2026-09-04, Phase A audit): S5's real dump text is TWO separate multipliers — "Critical
    // Protocol DMG Multiplier +40%. Tune Rupture Response - Particle Jet DMG Multiplier +160%." — this
    // block only covers the first half. Particle Jet has no SKILL_MULTIPLIERS row/hit-composed damage
    // block of its own (it's modeled through the separate legacy CHAR_BUFF_TABLE['Mornye'].tuneBreak.
    // ruptureDmgMult flat-DOT path in calcEngine.js's calcTuneBreakDmg(), which has no per-sequence-
    // level scaling input for any character), so the +160% is a known, schema-level modeling gap — not
    // silently dropped without a paper trail, not force-fit into a stat this schema can't represent.
    note: "Critical Protocol Liberation DMG Multiplier +40% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5. (Real S5 node also grants Tune Rupture Response - Particle Jet DMG Multiplier +160%, unrepresented here — see comment above.)",
  },
  {
    id: 'mornye.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Critical Protocol' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 400 }],
    note: 'Critical Protocol DMG Multiplier +400% (confirmed exact, corrected from an unsourced deepen:15) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo\'s S5.',
  },
];
