// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/encore.blocks.js
// Encore converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Encore'], RESONANCE_CHAIN_DATA['Encore'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Encore'], and CHARACTER_ROTATIONS['Encore']. No new numbers
// invented. S2 correctly has NO block — pure Energy-economy utility with zero DPS
// component, per the audit's own zeroing.
//
// Cooldown/concertoEnergyGain added 2026-09-06 (completeness pass, same "bring every character up
// to Aalto's reference standard" direction as the prior passes) — sourced from Data dump/Encore/
// Encore.md's own Cooldown/Concerto Regen rows (Woolies Can Help!, Cosmos Rave, Cosmos: Rupture).
// Also added encore.liberation.cosmos-rave, a new utility-only block for pressing Liberation itself
// — a real, always-cast rotation step with real, sourced Concerto Energy/cooldown numbers that had
// no block anywhere to hold them (correctly no damage: the cast itself deals none, per its own
// CHARACTER_ROTATIONS note). Cosmos: Rampage's own real 4s cooldown was tested and REVERTED — see
// that block's own note for why applying it actually broke her computed damage (a real engine
// step-timing limitation, not a data error).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Encore';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const ENCORE_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'encore.intro.woolies-helpers',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Woolies Helpers' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus on a real 2.85% (10,587) damage share. No override text names
    // a different category, same default-to-skillDmg convention as Calcharo's Intro/Augusta's Stride of
    // Goldenflare.
    damage: { hits: parseSkillMultiplierHits('198.81%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Restores some Mayhem.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Encore/Encore.md's own
    // "Con. Energy Regen 10" row for Intro Skill Woolies Can Help!.
    concertoEnergyGain: 10,
  },
  {
    id: 'encore.skill.cosmos-rampage',
    source: SOURCE, kind: 'damage', section: 'Skill',
    // NOT given a timing.cooldown, despite a real sourced value existing (Data dump/Encore/
    // Encore.md's own "Cosmos Rampage Cooldown: 4s" row) — a real bug found and reverted 2026-09-06
    // while doing the completeness pass. Tested it first (per direct user instruction to verify, not
    // assume): adding cooldown:4 dropped this rotation's total damage by ~5.3% (39445 -> 37337 in an
    // isolated test), because `resolveHitComposedDps`'s own per-cast cooldown enforcement
    // (`r.ineligibleBlockIds`, unconditional — NOT gated by the separate `cooldownSteadyState` flag)
    // uses the SIMULATOR's coarse, flat 1.5s-per-step pacing to judge real-time spacing between
    // casts, not actual move-animation durations. Her 3 real Cosmos: Rampage casts land only 1
    // Basic-ATK-combo step apart in CHARACTER_ROTATIONS (3.0s simulated gap at 1.5s/step), less than
    // the real 4s cooldown — so the engine wrongly rejected the 2nd/3rd casts as premature, even
    // though the real game (with real animation timing across the 10s Cosmos Rave window) allows all
    // 3. Same root cause as the note this file already carries for the True Sight: Capture class of
    // gap (Changli) — the engine's coarse step model can turn a real value into a WRONG one — just a
    // different failure mode (rejection here, vs a charge-system misread there). Left unmodeled.
    trigger: { type: 'cast', on: 'Skill:Cosmos: Rampage' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('63.32%×4'), category: 'skillDmg', basis: 'ATK' },
    note: 'Enhanced Skill during Cosmos Rave (replaces Flaming Woolies), counted as Resonance Skill DMG. 4s internal cooldown, restores Mayhem. Fires 3x in the real rotation (real, repeated cast, not a bug).',
  },
  {
    id: 'encore.basic.cosmos-frolicking',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Cosmos: Frolicking 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('90.18%×2+56.40%×3+65.99%×4+194.01%×3'), category: 'basicDmg', basis: 'ATK' },
    note: 'Enhanced Basic ATK combo during Cosmos Rave (replaces Wooly Attack), counted as Basic Attack DMG, restores Mayhem. Fires twice in the real rotation.',
  },
  {
    id: 'encore.forte.cosmos-rupture',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Cosmos Rupture' },
    // No cooldown: gated by consuming full (100/100) Mayhem, a resource threshold, not a timer.
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('46.42%×6+495.21%'), category: 'libDmg', basis: 'ATK' },
    note: "Cosmos Rave's version of Cloudy Frenzy — at full Mayhem, enters a 70% DMG-reduction channel (not modeled) that survives swap-out, then unleashes this on exit, counted as Resonance Liberation DMG.",
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Encore/Encore.md's own
    // "Cosmos: Rupture Con. Energy Regen 10" row.
    concertoEnergyGain: 10,
  },
  {
    // Added 2026-09-06 (completeness pass): "Cosmos Rave" (pressing Liberation to enter the state)
    // was previously entirely absent from this file — a real, always-cast CHARACTER_ROTATIONS step
    // ("Press Liberation (125 Energy) — no direct hit on cast") that correctly has no damage
    // (confirmed by its own rotation-step note: "no direct hit on cast") but DOES carry real,
    // sourced Concerto Energy/cooldown numbers (Data dump/Encore/Encore.md's own "Cooldown: 16s ...
    // Con. Energy Regen: 20" row) with no block anywhere to hold them — a silent gap in Concerto
    // Energy accounting, not a damage gap. Added as a kind:'utility' block purely to carry the real,
    // sourced resource numbers, same convention as Cartethyia's own Manifest-transform Liberation
    // block (a-knights-heartfelt-prayers).
    id: 'encore.liberation.cosmos-rave',
    source: SOURCE, kind: 'utility', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Cosmos Rave' },
    timing: { cooldown: 16 }, target: { scope: 'self' }, effects: [],
    concertoEnergyGain: 20,
    note: "Enters Cosmos Rave (10s), replacing Basic/Heavy/Skill/Dodge Counter with their Cosmos-enhanced forms — costs 125 Resonance Energy (not modeled, no matching schema field). No direct-damage value: this block exists only to carry the real, sourced cooldown/Concerto Energy Regen numbers.",
  },
  {
    id: 'encore.outro.thermal-field',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Outro DMG Bonus on a real 12.9% (39,258) damage share — her 2nd-largest bucket after
    // Basic ATK. Her own kit text is explicit this is a free-to-quickswap DoT proc, not a team buff —
    // same outroDmg shape already fixed for Rover: Havoc's Soundweaver/Calcharo's Shadowy Raid.
    damage: { hits: parseSkillMultiplierHits('176.76%×4'), category: 'outroDmg', basis: 'ATK' },
    note: 'AoE burn field around the Skill target, every 1.5s for 6s (4 ticks) — no team buff, pure DoT proc.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'encore.selfbuff.woolies-cheer-dance',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Skill:Cosmos: Rampage' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 10, stacking: 'refresh', source: 'self-kit' }],
    note: 'Inherent Skill Woolies Cheer Dance: Fusion DMG +10%/10s on Flaming Woolies/Cosmos-Rampage cast — modeled on the Cosmos: Rampage cast (the variant actually used in her real rotation).',
  },
  {
    id: 'encore.selfbuff.angry-cosmos',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Liberation:Cosmos Rave' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    condition: { requiresStance: 'HP above 70%' },
    effects: [{ stat: 'allDmg', value: 10, source: 'self-kit' }],
    note: "Inherent Skill Angry Cosmos: +10% DMG dealt during Resonance Liberation Cosmos Rave while Encore's HP is above 70% — duration approximated to Cosmos Rave's own 10s window since the source gives no separate timer (same approximation already flagged in CHAR_BUFF_TABLE's own condition text).",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S2 correctly has NO block — pure Energy-economy utility, zero DPS
  //    component per the audit's own zeroing) ──
  {
    id: 'encore.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Basic ATK:Cosmos: Frolicking 1-4' },
    timing: { duration: 6 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 3, stacking: 'stacking', maxStacks: 4, source: 'self-kit' }],
    note: 'Fusion DMG Bonus +3%, stacking up to 4 times for 6s, on Basic ATK hit — modeled as per-stack 3% x4 cap (matching the real stacking mechanic) rather than a flat 12%, same convention as Brant\'s S1.',
  },
  // S2 correctly has NO block — real effect is "additionally restores 10 Resonance Energy when
  // casting Basic Attack Wooly Attack or Resonance Skill Energetic Welcome, once every 10s", pure
  // Energy-economy utility, zero DPS component.
  {
    id: 'encore.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Cosmos Rupture' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 40, source: 'self-kit' }],
    // Corrected 2026-09-03 against a fresh the source dump: was stat:'heavyDmg', a dead/no-op buff — both
    // Cloudy Frenzy and Cosmos Rupture are explicitly named "Resonance Liberation" by the source (not
    // "Heavy Attack"), matching their own kit text and SKILL_MULTIPLIERS['Encore']'s "counted as
    // Resonance Liberation DMG" note for both rows; encore.forte.cosmos-rupture above already uses
    // category:'libDmg', so a heavyDmg buff had no matching damage block to apply to.
    note: "DMG multiplier of Resonance Liberation Cloudy: Frenzy and Resonance Liberation Cosmos: Rupture +40% — cast-scoped to the Cosmos Rupture cast used in her real rotation.",
  },
  {
    id: 'encore.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Cosmos Rupture' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    condition: { element: 'fusion' },
    effects: [{ stat: 'elemDmg', value: 20, stacking: 'refresh', source: 'self-kit' }],
    note: 'Heavy Attack Cosmos Rupture increases team Fusion DMG Bonus by 20% for 30s (confirmed exact, team-wide per the audit comment).',
  },
  {
    id: 'encore.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'skillDmg', value: 35, source: 'self-kit' }],
    note: 'Resonance Skill DMG Bonus +35% (confirmed exact, no specific scoping/timer given beyond the flat value) — kept passive.',
  },
  {
    id: 'encore.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Skill:Cosmos: Rampage' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 5, stacking: 'stacking', maxStacks: 5, source: 'self-kit' }],
    note: 'Gains 1 stack of Lost Lamb per damage instance during Cosmos Rave, each +5% ATK for 10s, stacking up to 5 times (25% max) — per the two-source majority (two independent sources both say 5 stacks/25%, vs. a third source\'s outlier "6 stacks", flagged in the source audit rather than silently resolved). Modeled as per-stack 5% x5 cap, anchored to the Cosmos: Rampage cast as a representative damage-instance trigger.',
  },
];
