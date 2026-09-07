// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/hiyuki.kitRules.js
// [DECISION · Hiyuki] Pilot implementation of ADAPTIVE_ENGINE_DESIGN.md's decision layer —
// a real state machine + priority-list rule set replacing CHARACTER_ROTATIONS['Hiyuki'] as the
// SOURCE of her rotation, rather than the hand-authored ground truth. Every resource cap/gain
// below is sourced verbatim from Data dump/Hiyuki/Hiyuki.md's own "Forte Circuit" section
// (line 86-90):
//   Dedication (cap 300): Present Self Basic Stage 3 restores 100 each.
//   Frostheart (cap 300, threshold 100 to enter Iai Stance): restored by Jade Cleave/Petalfall or
//     any Foreclaimed-Self normal attack landing — NO exact per-hit gain value is sourced anywhere
//     (only "restores Frostheart", never a number), so `iaiEligible` below is a documented boolean
//     gate reached after the SAME action count CHARACTER_ROTATIONS['Hiyuki'] itself already
//     demonstrates reaches it (one Foreclaimed Basic combo + Jade Cleave + Petalfall + a second
//     Foreclaimed Basic combo) rather than a fabricated numeric Frostheart value — same class of
//     documented assumption as this session's own Glacio Bite Amp/Multiplier combination choice.
//   Frostharden Iai (cap 3): +3 from casting Inward Vision.
//   Whiteout Bitterfrost (cap 3): +1 each time a Frostharden Iai stack is consumed via Iai.
//   Snowforged Blade (cap 3): +1 per Bitterfrost Heavy ATK cast.
// Frostedge's real +200 Dedication and Frost Splinter's 300-Dedication unlock/consume are sourced
// from line 16 ("unlocks at 300 Dedication... consumes all 300 Dedication") and CHARACTER_ROTATIONS'
// own existing step notes (Frostedge "restores 200 of 300 Dedication").
//
// The Iai step is modeled as ONE decision-engine step consuming all 3 Frostharden Iai stacks at
// once (rather than 3 separate steps), matching hiyuki.liberation.iai's own existing damage block,
// which already aggregates all 3 real button presses into one combined %ATK value
// (283.82%+47.31%×4) — firing 3 separate steps would triple-count that block's damage.
// ═══════════════════════════════════════════════════════════════════════════════

export function createHiyukiInitialState() {
  return {
    introCast: false,
    dedication: 0,
    frostSplinterCast: false,
    inForeclaimedSelf: false,
    foreclaimedRoundsCompleted: 0,
    jadeCleaveCast: false,
    petalfallCast: false,
    iaiEligible: false,
    frosthardenIai: 0,
    iaiCast: false,
    whiteoutBitterfrost: 0,
    bitterfrostCast: false,
    snowforgedBlade: 0,
    bladeLiberationCast: false,
    inwardVisionCast: false,
  };
}

/** @type {import('../resolver/decision/decisionEngine.js').PriorityRule[]} */
export const HIYUKI_PRIORITY_RULES = [
  {
    id: 'intro',
    step: { type: 'Liberation', skill: 'Frostedge' },
    condition: s => !s.introCast,
    apply: s => { s.introCast = true; s.dedication = Math.min(300, s.dedication + 200); },
  },
  {
    id: 'basic-stage3-to-cap-dedication',
    step: { type: 'Basic ATK', skill: 'Present Self Stage 1-3' },
    condition: s => s.introCast && !s.frostSplinterCast && s.dedication < 300,
    apply: s => { s.dedication = Math.min(300, s.dedication + 100); },
  },
  {
    id: 'frost-splinter',
    step: { type: 'Liberation', skill: 'Frost Splinter: Present Self' },
    condition: s => s.dedication >= 300 && !s.frostSplinterCast,
    apply: s => { s.frostSplinterCast = true; s.dedication = 0; },
  },
  {
    id: 'inward-vision',
    step: { type: 'Liberation', skill: 'Foreclaiming: Inward Vision' },
    condition: s => s.frostSplinterCast && !s.inwardVisionCast,
    apply: s => { s.inwardVisionCast = true; s.inForeclaimedSelf = true; s.frosthardenIai = 3; },
  },
  {
    id: 'foreclaimed-basic-round-1',
    step: { type: 'Liberation', skill: 'Foreclaimed Self Stage 1-3' },
    condition: s => s.inForeclaimedSelf && !s.iaiEligible && s.foreclaimedRoundsCompleted === 0,
    apply: s => { s.foreclaimedRoundsCompleted = 1; },
  },
  {
    id: 'jade-cleave',
    step: { type: 'Skill', skill: 'Frostblight: Jade Cleave' },
    condition: s => s.foreclaimedRoundsCompleted === 1 && !s.jadeCleaveCast,
    apply: s => { s.jadeCleaveCast = true; },
  },
  {
    id: 'petalfall',
    step: { type: 'Skill', skill: 'Frostblight: Petalfall' },
    condition: s => s.jadeCleaveCast && !s.petalfallCast,
    apply: s => { s.petalfallCast = true; },
  },
  {
    id: 'foreclaimed-basic-round-2',
    step: { type: 'Liberation', skill: 'Foreclaimed Self Stage 1-3' },
    condition: s => s.petalfallCast && s.foreclaimedRoundsCompleted === 1,
    apply: s => { s.foreclaimedRoundsCompleted = 2; s.iaiEligible = true; },
  },
  {
    id: 'iai',
    step: { type: 'Liberation', skill: 'Iai' },
    condition: s => s.iaiEligible && s.frosthardenIai > 0 && !s.iaiCast,
    apply: s => { s.iaiCast = true; s.frosthardenIai = 0; s.whiteoutBitterfrost = 3; },
  },
  {
    id: 'bitterfrost',
    step: { type: 'Liberation', skill: 'Bitterfrost: Foreclaimed Self' },
    condition: s => s.whiteoutBitterfrost === 3 && !s.bitterfrostCast,
    apply: s => { s.bitterfrostCast = true; s.whiteoutBitterfrost = 0; s.snowforgedBlade = Math.min(3, s.snowforgedBlade + 1); },
  },
  {
    id: 'blade-liberation',
    // Self-kit cross-interaction, corrected 2026-09-07 (a swap/legality test surfaced a real gating
    // bug in the first version of this rule): the dump's own text (line 67) is "press-release
    // consumes all 3 Snowforged Blade stacks if present (else none consumed); OR hold to charge,
    // consuming 1 Snowforged Blade periodically, auto-casts on release/depletion/timeout." Two
    // distinct real facts follow:
    //   1. The TRUE legality gate is "Foreclaimed Self only" (the dump's own parenthetical) — NOT
    //      "only after casting Bitterfrost." Blade Liberation can legally be cast at ANY point
    //      during Foreclaimed Self, even with 0 Snowforged Blade banked (dealing base damage only,
    //      via a tap). The previous version of this rule wrongly required `bitterfrostCast`, which
    //      happened to match the curated rotation's own real play order but wasn't the actual
    //      underlying legality requirement.
    //   2. The tap-vs-hold input choice only matters for a player who executes imperfectly (tapping
    //      away banked stacks instead of holding to actually consume them) — since more stacks
    //      always means more damage, a DPS-optimal play always holds to consume whatever is
    //      currently banked (0-3), never taps one away. This engine already assumes optimal
    //      execution everywhere else (e.g. "perfect timing," "reliably hits max stacks" — see other
    //      characters' own established convention), so modeling "always hold, consume real banked
    //      amount" is the correct optimal-play assumption, not a data gap — the fix needed was the
    //      gating condition above, not this formula.
    buildStep: s => ({ type: 'Liberation', skill: 'Foreclaiming: Blade Liberation', snowforgedBladeConsumed: s.snowforgedBlade }),
    condition: s => s.inForeclaimedSelf && !s.bladeLiberationCast,
    apply: s => { s.bladeLiberationCast = true; s.inForeclaimedSelf = false; s.snowforgedBlade = 0; },
  },
];
