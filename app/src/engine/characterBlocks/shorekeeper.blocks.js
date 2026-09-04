// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/shorekeeper.blocks.js
// Shorekeeper converted to TriggerBlocks — first "hard case" conversion for the
// Phase 2 engine (see PHASE2_PLAN.md's backlog). Unlike Rover: Electro (the
// proof-of-concept, all always-on/passive nodes), Shorekeeper's S6 is CAST-SCOPED:
// it only applies during her Discernment cast itself, not persistently. This
// stress-tests whether trigger.type: 'cast' already models "only active during
// this one cast" correctly — it does, since a cast-type block only activates when
// its trigger key is present in firedTriggers for that specific rotation step, so
// no schema change was needed for this case (contrast with Jinhsi/Augusta, likely
// the next conversions, which probably WILL need a schema extension for cast-order
// forfeit windows / cross-character partner conditions).
//
// Sourced directly from characters.js's already-audited CHAR_BUFF_TABLE
// ['Shorekeeper'], RESONANCE_CHAIN_DATA['Shorekeeper'] (2026-08-31 audit), and
// CHARACTER_ROTATIONS['Shorekeeper']. No new numbers invented here.
//
// Verified for parity against the legacy flat-table path by
// __tests__/triggerEngine-shorekeeper.test.js.
//
// Full 9-dimension Phase A pass, 2026-09-04: found Flare Star Butterfly damage was completely
// unmodeled despite firing as a guaranteed side effect of the already-modeled rotation (4 real hits,
// 37.29% each) — added as shorekeeper.forte.flare-star-butterfly. Also fixed a real icon-lookup bug
// in SKILL_ICONS (the 'Heavy Attack: Illation' key was too long to ever match getSkillIcon's
// skillName.includes(key) check against the short 'Illation' rotation-step name — same bug class
// already fixed for Xiangli Yao's Revamp key).
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../shared/skillMultiplierParser.js';

const SOURCE = 'Shorekeeper';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const SHOREKEEPER_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) — added 2026-09-01, this character's FIRST damage
  //    blocks (her original conversion only covered buffs/Resonance Chain). She's a healer, so most
  //    of her kit is intentionally non-damage (End Loop/Outro carry no direct DMG at all per their
  //    own kit text — correctly no damage block for either). ──
  {
    id: 'shorekeeper.basic.origin-calculus',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Basic ATK:Origin Calculus Stage 1-4' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('31.78% → 23.86%×2 → 23.32%×3 → 72.72%'), category: 'basicDmg' },
    note: 'Tap Basic Attack 4 times — each hit grants 1 Collapsed Core and Empirical Data.',
  },
  {
    id: 'shorekeeper.skill.chaos-theory',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Chaos Theory' },
    timing: { cooldown: 16 },
    target: { scope: 'self' },
    effects: [],
    damage: { hits: parseSkillMultiplierHits('31.31%×5'), category: 'skillDmg' },
    note: '5 Dim Star Butterflies (31.31% each at Lv.10) — heal component (1313+5.97% HP) not modeled, same "no fabricated non-DPS number" rule as everywhere else in this schema.',
  },
  {
    id: 'shorekeeper.forte.illation',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Illation' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // SKILL_MULTIPLIERS' combined row ('Flare Star Butterfly / Illation / Transmutation') names three
    // separate moves in one row, per its own labels — only the 'Illation, Heavy ATK' figure applies to
    // THIS block (the CHARACTER_ROTATIONS step this trigger matches). Transmutation (Mid-air variant)
    // still correctly has no block — never triggered in her modeled rotation. Flare Star Butterfly IS
    // now modeled — see shorekeeper.forte.flare-star-butterfly below.
    damage: { hits: parseSkillMultiplierHits('18.97%×5'), category: 'heavyDmg' },
    note: 'Once Empirical Data hits 5/5, HOLD Basic Attack (Heavy Attack replaced) — 18.97%×5 at Lv.10, converts pending Collapsed Cores into Flare Star Butterflies.',
  },
  {
    // Added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c — dimension 8): found via a full kit
    // walkthrough, not previously identified in any prior pass. Flare Star Butterfly was wrongly bucketed
    // under "not separately triggered in the modeled rotation, so no block" — but it's not an alternate
    // unused variant, it's a GUARANTEED side effect of steps ALREADY in the rotation: the modeled 4-stage
    // Basic ATK combo generates exactly 4 Collapsed Cores (kit text: "each hit generates 1 Collapsed
    // Core"), and Illation's own kit text is explicit "also instantly converts all Collapsed Cores into
    // Flare Star Butterflies" — so 4 real Butterfly hits (37.29% each, its own dedicated SKILL_MULTIPLIERS
    // sub-value) fire every single rotation, deterministically, not a guess. Rides the existing
    // 'Forte:Illation' trigger (the exact cast that performs the conversion) rather than needing a new
    // step — same "piggyback an existing trigger" technique used for Changli/Zhezhi/Youhu this session.
    // Category is a genuine ambiguity (no "considered X DMG" override anywhere in the kit text) — flagged
    // and explicitly decided by the user: skillDmg (Forte Circuit mechanic bucket), not basicDmg.
    id: 'shorekeeper.forte.flare-star-butterfly',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Illation' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    damage: { hits: Array.from({ length: 4 }, () => ({ atkPct: 37.29 })), category: 'skillDmg' },
    note: 'The 4 real Collapsed Cores generated by the modeled 4-stage Basic ATK combo, instantly converted into Flare Star Butterflies by the Illation cast that immediately follows it in the real rotation.',
  },
  {
    id: 'shorekeeper.intro.discernment',
    source: SOURCE,
    kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Discernment' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    // Scales off HP, not ATK, and is a GUARANTEED Crit — both straight from this cast's own
    // CHARACTER_ROTATIONS note ("scales off her HP", "a guaranteed-Crit hit"), not a guess. See
    // triggerBlocks.schema.js's DamageHits doc (basis/guaranteedCrit fields, added specifically for
    // this cast) and resolveHitComposedDps.js's own handling of both.
    damage: { hits: parseSkillMultiplierHits('19.64%×3'), category: 'libDmg', basis: 'HP', guaranteedCrit: true },
    note: "Empowered Intro (only castable once Stellarealm has reached Supernal): 19.64%×3 at Lv.10, HP-scaling, guaranteed Crit, counted as Liberation DMG. shorekeeper.chain.s6-to-the-new-world (same 'Intro:Discernment' trigger) adds its own +42% DMG Mult/+500% Crit DMG on top of this specific cast, not as a persistent buff.",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'shorekeeper.outro.binary-butterfly',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 15, stacking: 'refresh' }],
    note: 'Swap out to trigger — team +15% All DMG Amp, 30s, persists through swaps.',
  },
  {
    id: 'shorekeeper.liberation.stellarealm-crit',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:End Loop' },
    condition: { requiresStance: 'Stellarealm' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [
      { stat: 'critRate', value: 12.5, stacking: 'refresh' },
      { stat: 'critDmg', value: 25, stacking: 'refresh' },
    ],
    note: 'While the Stellarealm field is up: team +12.5% Crit Rate, +25% Crit DMG, 30s.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — re-verified 2026-08-31) ──
  {
    id: 'shorekeeper.chain.s1-unspoken-conjecture',
    source: SOURCE,
    kind: 'utility',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: 'Stellarealm range +150%, duration +10s; Discernment no longer ends Stellarealm early. Pure utility — no DPS component; TODO: needs Phase 2 schema category.',
  },
  {
    id: 'shorekeeper.chain.s2-nights-gift-and-refusal',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:End Loop' },
    condition: {},
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 40, stacking: 'refresh' }],
    note: "Outer Stellarealm (from the moment Liberation is cast, no Intro gate needed) grants nearby party +40% ATK.",
  },
  {
    id: 'shorekeeper.chain.s3-infinity-awaits-me',
    source: SOURCE,
    kind: 'utility',
    trigger: { type: 'cast', on: 'Liberation:End Loop' },
    timing: { cooldown: 25 },
    target: { scope: 'self' },
    effects: [],
    note: 'Casting End Loop grants 20 Concerto Energy, once per 25s. Resource-economy node, zero DPS component — TODO: needs Phase 2 schema category.',
  },
  {
    id: 'shorekeeper.chain.s4-overflowing-quietude',
    source: SOURCE,
    kind: 'utility',
    trigger: { type: 'cast', on: 'Skill:Chaos Theory' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: '+70% Healing Bonus specifically when casting Chaos Theory. No healingBonus stat key yet — TODO: needs Phase 2 schema (a healBonusPct-on-skill-cast key).',
  },
  {
    id: 'shorekeeper.chain.s5-echoes-in-silence',
    source: SOURCE,
    kind: 'utility',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: 'Extends Basic Attack Stage 3 pull-in range +50%, Illation +30%. Pure AoE-gathering utility, zero DPS component — TODO: needs Phase 2 schema category.',
  },
  {
    id: 'shorekeeper.chain.s6-to-the-new-world',
    source: SOURCE,
    kind: 'buff',
    // CAST-SCOPED, not passive: this block is only active for the single rotation
    // step where Discernment (the empowered Intro) is actually cast, unlike
    // Rover: Electro's always-on chain nodes. Deliberately trigger.type: 'cast',
    // not 'passive' — proves the schema already distinguishes the two cases
    // correctly via the firedTriggers-per-step contract in triggerEngine.js.
    trigger: { type: 'cast', on: 'Intro:Discernment' },
    condition: {},
    timing: {},
    target: { scope: 'self' },
    effects: [
      { stat: 'totalMult', value: 42 },
      { stat: 'critDmg', value: 500 },
    ],
    note: "Discernment's own DMG Multiplier +42%, and Crit DMG +500% — BOTH scoped to that single guaranteed-Crit Discernment hit only, not a persistent buff. This is exactly the case the flat RESONANCE_CHAIN_DATA schema could not represent (would have applied critDmg:500 as an always-on team/self stat); the cast-scoped trigger fixes that.",
  },
];
