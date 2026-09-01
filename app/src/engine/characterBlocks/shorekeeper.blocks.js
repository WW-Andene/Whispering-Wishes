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
// ═══════════════════════════════════════════════════════════════════════════════

const SOURCE = 'Shorekeeper';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const SHOREKEEPER_BLOCKS = [
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
