// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/augusta.blocks.js
// Augusta converted to TriggerBlocks — second "hard case," first one requiring an
// actual schema extension (see triggerBlocks.schema.js's new 'partner-outro-return'
// trigger type). Her Majesty/Crown-of-Wills stack gain is conditional on a DIFFERENT
// character's action: the resonator she buffed via her own Outro must cast THEIR OWN
// Outro back before a third swap, or the condition is forfeited. Rover: Electro and
// Shorekeeper never needed this — every one of their triggers depended only on their
// own cast/swap history.
//
// Sourced directly from characters.js's already-audited CHAR_BUFF_TABLE['Augusta'],
// RESONANCE_CHAIN_DATA['Augusta'] (2026-08-31 audit), and CHARACTER_ROTATIONS['Augusta'].
// No new numbers invented here.
//
// Verified for parity against the legacy flat-table path by
// __tests__/triggerEngine-augusta.test.js.
// ═══════════════════════════════════════════════════════════════════════════════

const SOURCE = 'Augusta';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const AUGUSTA_BLOCKS = [
  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'augusta.outro.battlesong',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'swap-out' },
    timing: { duration: 14 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'elemDmg', value: 15, stacking: 'refresh' }],
    note: 'Swap out — incoming Resonator gains +15% All DMG Amp for 14s, lost immediately if THEY swap out. This block\'s id is the requiresActiveBlock target for augusta.majesty.partner-outro-return below.',
  },
  {
    id: 'augusta.selfbuff.crown-of-wills-base',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15 }],
    note: 'Crown of Wills: +15% Electro DMG Bonus per stack, max 1 stack at base kit (S0).',
  },

  // ── The cross-character conditional (this conversion's whole point) ──
  {
    id: 'augusta.majesty.partner-outro-return',
    source: SOURCE,
    kind: 'utility',
    trigger: {
      type: 'partner-outro-return',
      requiresActiveBlock: 'augusta.outro.battlesong',
      maxInterveningSwaps: 1,
    },
    timing: {},
    target: { scope: 'self' },
    effects: [],
    note: 'If the resonator Augusta buffed via Battlesong of the Unyielding casts their OWN Outro Skill (swapping back out) while that 14s buff is still active — i.e. before a third character swaps in — Augusta gains +1 Majesty stack and +1 Crown of Wills stack. Swapping to a third character first ends the buff early and forfeits this. No direct DMG stat: the stack grant feeds augusta.selfbuff.crown-of-wills-base\'s per-stack value, which is itself a stateful stack COUNT this schema does not track yet — TODO: needs the Phase 2 rotation-history/state-machine piece (PHASE2_PLAN.md design question 2) before this can resolve to an actual numeric effect instead of staying a utility marker.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — re-verified 2026-08-31) ──
  {
    id: 'augusta.chain.s1-stained-in-scorched-earth',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 30 }],
    note: 'Crown of Wills +15% Crit DMG per stack, max stack raised 1→2 = 30% at 2 stacks.',
  },
  {
    id: 'augusta.chain.s2-cleansed-in-crimson-war',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 40 }],
    note: 'Crown of Wills +20% Crit Rate per stack (2 stacks = 40%). Also grants "+2% Crit DMG per 1% Crit Rate over 100%, up to +100%" — an unmodeled threshold-conversion, same as the flat table; TODO: verify calcEngine\'s CR/CD pipeline can express this before adding it.',
  },
  {
    id: 'augusta.chain.s3-forged-in-rot-and-ruin',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'passive' },
    condition: { requiresStance: undefined },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 25 }],
    note: '+25% DMG Mult on Heavy Attack - Thunderoar: Backstep/Spinslash/Uppercut and their Dodge Counter equivalents only (her only Heavy ATK hits, so unconditional here is equivalent).',
  },
  {
    id: 'augusta.chain.s4-ascent-in-sun-and-glory',
    source: SOURCE,
    kind: 'buff',
    // Cast-scoped like Shorekeeper's S6 — triggers off casting Intro: Stride of Goldenflare, not
    // always-on, but unlike S6 this buff PERSISTS for 30s after the cast rather than being scoped
    // to that single hit — timing.duration models that.
    trigger: { type: 'cast', on: 'Intro:Stride of Goldenflare' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    note: 'Casting Intro Skill - Stride of Goldenflare grants the WHOLE TEAM +20% ATK for 30s.',
  },
  {
    id: 'augusta.chain.s5-unshaken-in-wrathful-tides',
    source: SOURCE,
    kind: 'utility',
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 15 }],
    note: "Inherent Skill - Glory's Favor shield value +50% — survivability, no direct DPS number; totalMult:15 kept as an approximate DPS-uptime proxy (matches the flat table's own documented approximation, not a real modeled effect).",
  },
  {
    id: 'augusta.chain.s6-engraved-in-radiant-light',
    source: SOURCE,
    kind: 'buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Thunderoar: Spinslash' },
    timing: { cooldown: 1 }, // "capped at 2 stacks/sec" in the source text — modeled as a 1s-per-proc cap
    target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 200 }],
    note: 'Crown of Wills max stacks 2→4; CR-over-150%→CD conversion up to +50% (separate, unmodeled, same caveat as S2); AND casting Thunderoar: Spinslash or Uppercut grants 2 Crown of Wills stacks (capped 2/sec) AND triggers "Thunder Rage" — 2 separate Electro Heavy-ATK hits at 100% ATK each (200% total). heavyDmg:200 approximates the Thunder Rage add-on only, same as the flat table.',
  },
];
