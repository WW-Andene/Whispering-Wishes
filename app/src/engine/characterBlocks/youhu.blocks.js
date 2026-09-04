// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/youhu.blocks.js
// Youhu converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Youhu'], RESONANCE_CHAIN_DATA['Youhu'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Youhu'], and CHARACTER_ROTATIONS['Youhu']. No new numbers
// invented. S1/S2/S4 correctly have NO block — defensive-proc/buff-of-a-buff/
// proc-based-cooldown-reduction effects with zero DPS component or no matching
// category, per the audit's own zeroing.
//
// Full 9-dimension Phase A pass, 2026-09-04: Intro was uncategorized (fixed to skillDmg, default
// convention); dmgFocus was ['Coordinated ATK'] with zero basis (that's the buff she GRANTS via
// Outro, not her own damage — fixed in characters.js to ['Skill', 'Liberation', 'Basic ATK']);
// Rare Find (Inherent Skill, +15% Glacio DMG for 14s on Intro) was entirely unmodeled — added; S6 was
// wired to trigger.type:'passive' despite carrying a real duration/stacking config, which the resolver
// silently ignores on the passive path — was contributing a flat +15% Crit DMG forever instead of the
// real per-cast stacking mechanic toward 60%. Retargeted to the real trigger (Antique Appraisal cast).
// Antique Appraisal's own damage category (skillDmg vs basicDmg — kit prose calls it "the next Basic
// Attack" empowered, but no explicit "considered X DMG" override exists either way) was flagged as a
// genuine ambiguity and explicitly decided: kept skillDmg, matching SKILL_MULTIPLIERS' own row type.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Youhu';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const YOUHU_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'youhu.intro.scroll-of-wonders',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Scroll of Wonders' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting teammate skillDmg buffs. No override text names a different category, same default-to-
    // skillDmg convention applied project-wide.
    damage: { hits: parseSkillMultiplierHits('89.47% + 109.35%'), category: 'skillDmg' },
    note: 'Grants Lucky Draw (random Antique).',
  },
  {
    id: 'youhu.skill.ruyi',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Ruyi' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category reviewed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): kit prose calls Antique
    // Appraisal "the next Basic Attack" empowered, and unlike Poetic Essence (explicit "considered
    // Resonance Skill DMG" text) none of the 4 Appraisal variants carry a "considered X" override
    // anywhere in the source — a genuine ambiguity, flagged and explicitly decided by the user: kept
    // skillDmg, matching SKILL_MULTIPLIERS' own 'Skill' type column for this row rather than switched to
    // basicDmg on the mechanic-based read alone.
    damage: { hits: parseSkillMultiplierHits('137.00% + 167.45%'), category: 'skillDmg' },
    note: 'Antique Appraisal variant with the highest DMG Multiplier of the four, consumes the drawn Antique. Fires 3x in the real rotation.',
  },
  {
    id: 'youhu.liberation.fortunes-favor',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: "Liberation:Fortune's Favor" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('327.19%'), category: 'libDmg' },
    note: 'Glacio DMG blast; choose one of four Antiques from the resulting prompt.',
  },
  {
    id: 'youhu.basic.frosty-punches',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Frosty Punches' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('47.38% → 31.91%+59.26% → 38.06%+46.52% → 116.35%'), category: 'basicDmg' },
    note: 'Full 4-part combo, fills the Forte Gauge (Frost).',
  },
  {
    id: 'youhu.skill.scroll-divination',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Scroll Divination' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('156.46%'), category: 'skillDmg' },
    note: 'Glacio DMG hit + heal to all nearby party members + Lucky Draw (grants a random Antique), not modeled.',
  },
  {
    id: 'youhu.outro.timeless-classics',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 28 }, target: { scope: 'next-on-field' },
    effects: [{ stat: 'coordDmg', value: 100, stacking: 'refresh' }],
    note: 'No direct DMG on the Outro itself — the incoming Resonator has their Coordinated Attack DMG Amplified by 100% for 28s.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S1/S2/S4 correctly have NO block — defensive-proc/buff-of-a-buff/
  //    proc-based-cooldown-reduction effects with zero DPS component or no matching category, per the
  //    audit's own zeroing) ──
  // S1 correctly has NO block — 10% chance of 5s damage/interruption immunity on Lucky Draw, pure
  // defensive utility, zero DPS component.
  // S2 correctly has NO block — re-investigated 2026-09-03 now that a dump file exists (see
  // characters.js's own RESONANCE_CHAIN_DATA audit comment for the full reasoning): S2 doubles
  // Antithesis/Triplet/Perfect Rhyme's DMG bonus on Poetic Essence, but her real modeled
  // CHARACTER_ROTATIONS below never casts Poetic Essence at all — she always spends each drawn Antique
  // immediately via Ruyi rather than banking to 4 Auspices. Zero-DPS-in-context, not a missing-schema
  // gap anymore.
  {
    id: 'youhu.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: 'Restless Sleep: ATK +20% (confirmed exact) — no specific cast anchor sourced, kept passive.',
  },
  // S4 correctly has NO block — 20% chance for Scroll Divination to skip its cooldown, a proc-based
  // effective-cooldown-reduction with no flat DMG% equivalent.
  {
    id: 'youhu.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Scroll of Wonders' },
    timing: { duration: 14 },
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 15 }],
    note: 'Dreamland Meander: Crit Rate +15% for 14s after Intro Skill (confirmed exact).',
  },
  {
    // Fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): trigger was 'passive', which — combined
    // with a real duration/stacking config — silently broke the intended mechanic. resolveHitComposedDps
    // only reads stacking/duration on the buffWindows path (trigger.type !== 'passive' AND a real
    // timing.duration); a 'passive' block always applies its effect at a fixed multiplier of 1,
    // regardless of any stacking/maxStacks fields present. So this was contributing a flat +15% Crit DMG
    // forever, never actually ramping toward the real 60% cap. Real trigger is "on Antique Appraisal
    // cast" — retargeted to 'Skill:Ruyi' (the only Antique Appraisal variant this app's rotation casts,
    // firing 3x), which now correctly builds a real stacking window via buildBlockWindows/activeCountAt.
    id: 'youhu.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Ruyi' },
    timing: { duration: 7 },
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 15, stacking: 'stacking', maxStacks: 4 }],
    note: 'Slumber Evermore: Sky Blue stacks (max 4, 7s each) each granting Crit DMG +15% (60% max) — modeled as real per-stack stacking off each real Antique Appraisal (Ruyi) cast.',
  },

  // ── Inherent Skill (added 2026-09-04, Phase A audit, REMAINING_WORK.md 1c — dimension 8: Rare Find
  //    was entirely unmodeled; Treasured Piece is pure healing (30% of Scroll Divination's healing on
  //    Antique Appraisal cast) with zero DPS component, and this engine has no 'heal'-kind block
  //    anywhere in the roster to model it into — correctly left out, not an oversight) ──
  {
    id: 'youhu.inherent.rare-find',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Scroll of Wonders' },
    timing: { duration: 14 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15 }],
    note: 'Rare Find: Glacio DMG Bonus +15% for 14s upon casting Intro Skill (confirmed exact) — a flat, unconditional Fusion-style DMG buff, no scoping needed (kit text names no specific move it\'s restricted to).',
  },
];
