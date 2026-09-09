// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/yuanwu.blocks.js
// Yuanwu converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Yuanwu'] (all empty — no buffs), RESONANCE_CHAIN_DATA['Yuanwu']
// (+ its own detailed 2026-09-01 re-audit comment, read directly for each node's
// real mechanic), SKILL_MULTIPLIERS['Yuanwu'], and CHARACTER_ROTATIONS['Yuanwu'].
// No new numbers invented. S1/S2/S3/S4/S6 correctly have NO block — his kit is
// almost entirely attack-speed/DEF%/shield/resource-scaling, with no matching
// category in this ATK-DPS-focused schema, per the audit's own zeroing (only S5
// carries a real representable value).
//
// Fixed 2026-09-02 (found while re-auditing against a fresh the source dump): added
// `basis: 'DEF'` to every damage block below — resolveHitComposedDps.js's own doc
// says every hit is ATK-scaling BY DEFAULT unless the block says otherwise, and
// none of these did, despite every one of Yuanwu's real multipliers being
// explicitly DEF-scaling (his own dump literally suffixes every value with "DEF").
// Same fix applied to CHARACTER_DATA['Yuanwu'].statScaling (was 'ATK', corrected
// to 'DEF') — this was a live-DPS-relevant bug, not cosmetic, same pattern as
// Taoqi/Mornye (both already correctly carry basis: 'DEF' on every block).
//
// 2026-09-09 full-kit audit (independent re-audit, cross-checked every characters.js table fresh
// against Data dump/Yuanwu/Yuanwu.md): 2 real fixes.
//   1. S6 (Defender of All Realms: nearby team +32% DEF for 3s) was correctly zeroed under the
//      2026-09-01 audit's own reasoning ("no team-DEF% stat category in this schema") — but that went
//      stale on 2026-09-05 when hpPct/defPct were wired into the engine (resolveHitComposedDps.js's own
//      dated comment). Added as a new whole-team, refresh-stacking block (defPct+32, triggered on each
//      real Thunder Wedge cast, duration approximated at Thunder Wedge's own 12s field lifetime — a
//      documented judgment call for the kit's real spatial condition, which this engine has no
//      positional model for). Since Yuanwu is a DEF-scaler, this also self-applies to boost his own
//      damage. Measured directly: materially raises his own hit-composed total. RESONANCE_CHAIN_DATA
//      ['Yuanwu'].s6 deliberately stays {} (see its own comment) since applyResonanceChain() has no
//      defPct branch or team-broadcast mechanism — this value only exists as a block.
//   2. CHARACTER_DATA['Yuanwu'].bestWeapon was 'Abyss Surges', inconsistent with his own #1 bestEchoes
//      pick (Rejuvenating Glow) — the dump's own Best Weapons section is explicit that Originite: Type
//      IV, not Abyss Surges, is what actually activates that set for his real (only viable) use case.
//      Corrected; Abyss Surges moved into weaponAlts.alt5.
// Full suite verified green (1896/1896) after; golden fixtures regenerated (both fixes move his real
// solo DPS/avgCrit) with the reason logged in phase3-parityGolden.test.js's own header comment.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Yuanwu';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const YUANWU_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'yuanwu.intro.thunder-bombardment',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Thunder Bombardment' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized. No override
    // text names a different category, same default-to-skillDmg convention used throughout this sweep.
    damage: { hits: parseSkillMultiplierHits('63.62%'), category: 'skillDmg', basis: 'DEF' },
  },
  {
    id: 'yuanwu.skill.thunder-wedge',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Thunder Wedge' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('23.86%'), category: 'skillDmg', basis: 'DEF' },
    note: 'Summons Thunder Wedge (lasts 12s), forms a Thunder Field around it — the on-field character\'s hits inside trigger a Coordinated ATK (7.96%, 1x/1.2s, not modeled). Fires twice in the real rotation.',
  },
  {
    // Split 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c) from a single combined block that wrongly
    // lumped Thunder Wedge Detonation into libDmg alongside Blazing Might's own hit — the previous
    // block's own comment already said the detonation is "counted as Resonance Skill DMG" but the code
    // didn't apply it. SKILL_MULTIPLIERS['Yuanwu'] even carries this as its own dedicated "Thunder Wedge
    // Detonation" row with that exact label, confirming the split. Blazing Might's own hit stays libDmg
    // below; the detonation is now its own skillDmg block.
    id: 'yuanwu.liberation.blazing-might',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Blazing Might' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('174.96%×2'), category: 'libDmg', basis: 'DEF' },
    note: 'Grants Forte Circuit Lightning Infused (Interruption Resistance) to the nearby team for 10s (not modeled), then a powerful blow.',
  },
  {
    id: 'yuanwu.forte.thunder-wedge-detonation-liberation',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Liberation:Blazing Might' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('59.65%'), category: 'skillDmg', basis: 'DEF' },
    note: 'Detonates the active Thunder Wedge, counted as Resonance Skill DMG per its own dedicated SKILL_MULTIPLIERS row.',
  },
  {
    id: 'yuanwu.forte.rumbling-spark',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Rumbling Spark' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Combines Thunder Wedge Detonation (59.65%) with Rumbling Spark's own hit (108.54%) — the
    // rotation's own note says this cast detonates Thunder Wedge again on the way into Lightning Infused.
    damage: { hits: [...parseSkillMultiplierHits('59.65%'), ...parseSkillMultiplierHits('108.54%')], category: 'skillDmg', basis: 'DEF' },
    note: 'Once Forte Gauge is full, hold Skill to consume all Readiness and enter Lightning Infused, detonating the active Thunder Wedge on the way in.',
  },
  {
    id: 'yuanwu.outro.lightning-manipulation',
    source: SOURCE, kind: 'utility', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Depletes enemy Vibration Strength on swap-out — no DMG, no DPS-representable buff.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S1/S2/S3/S4/S6 correctly have NO block — attack-speed/DEF%/shield/
  //    resource-scaling effects with no matching category in this schema, per the audit's own zeroing) ──
  // S1 correctly has NO block — Lightning Infused grants +20% Basic ATK Speed and +20% Heavy ATK
  // Speed, attack-speed (not a DMG%), no matching category.
  // S2 correctly has NO block — Thunder Bombardment restores 15 extra Resonance Energy, pure utility.
  // S3 correctly has NO block — Thunder Wedge's Coordinated ATK deals a bonus hit equal to 20% of
  // Yuanwu's DEF, a flat DEF-scaling bonus-hit addition with no representable derivation.
  // S4 correctly has NO block — casting Blazing Might grants a Shield equal to 200% of Yuanwu's DEF
  // for 10s, a shield, not DPS.
  {
    id: 'yuanwu.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Blazing Might' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 50, source: 'self-kit' }],
    note: "Blazing Might's own DMG Multiplier +50% — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    // Fixed 2026-09-09 (full-kit audit): S6 was correctly zeroed under the 2026-09-01 audit's own
    // reasoning ("no team-DEF% stat category in this schema"), but that reasoning went stale on
    // 2026-09-05 when hpPct/defPct were wired into the engine-readiness pass (see
    // resolveHitComposedDps.js's own dated comment on `stats.defPct` — a DEF-basis hit, which is every
    // single one of Yuanwu's own damage blocks, now genuinely scales off it). Modeled as a whole-team,
    // refresh-stacking buff triggered by each real Thunder Wedge cast, with duration set to Thunder
    // Wedge's own real 12s field lifetime — a judgment call, not a sourced number: the kit text's actual
    // condition is spatial ("while within Thunder Wedge's range"), which this engine has no positional
    // model for, so the existing convention for this class of "near a persistent field" effect is used
    // (approximate real uptime via the field's own lifespan, refreshed on each re-summon, exactly
    // matching the 2 real Thunder Wedge casts in CHARACTER_ROTATIONS['Yuanwu']) rather than inventing a
    // shorter/longer number with no basis. Uncertainty flagged explicitly per project convention rather
    // than silently guessing a duration.
    id: 'yuanwu.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Skill:Thunder Wedge' },
    timing: { duration: 12, stacking: 'refresh' },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'defPct', value: 32, stacking: 'refresh', source: 'self-kit' }],
    note: 'Defender of All Realms: nearby team members gain DEF +32% for 3s while within Thunder Wedge\'s range — modeled as a whole-team buff refreshed by each Thunder Wedge cast, approximated at the Wedge\'s own 12s field lifetime (see comment above for the spatial-vs-duration modeling caveat).',
  },
];
