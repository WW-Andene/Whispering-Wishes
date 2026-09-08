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
//
// Completeness pass 2026-09-07 (continuing the same character-by-character pass): Minor Fortes
// (Fusion DMG+12%, ATK%+12%) had no block at all — both her Inherent Skills were already modeled.
// Also added her whole base (non-Cosmos-Rave) kit — Wooly Attack, base Heavy ATK, Mid-air, base
// Dodge Counter, Flaming Woolies/Energetic Welcome, Cloudy Frenzy, plus the Cosmos-Rave Heavy
// Attack/Dodge Counter variants — all real, sourced SKILL_MULTIPLIERS rows with no block anywhere,
// none used in CHARACTER_ROTATIONS (her modeled rotation goes straight into Cosmos Rave and stays
// there the whole time, per its own opening step), same convention as every other converted
// character's own unused-but-sourced blocks.
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

  // Added 2026-09-07 (completeness pass): her whole base (non-Cosmos-Rave) kit, previously entirely
  // absent — real, sourced SKILL_MULTIPLIERS rows, none in CHARACTER_ROTATIONS (her modeled rotation
  // enters Cosmos Rave right after Intro and never reverts — see file header).
  {
    id: 'encore.basic.wooly-attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Wooly Attack Stage 1-4 → Wooly Strike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('55.66% → 66.20% → 66.30%×2 → 38.27%×4 → 238.57%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base 4-stage Basic ATK combo into a timed-press Wooly Strike finisher. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'encore.heavy.standard',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('187.08%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Base Heavy Attack. No override text — kept heavyDmg. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'encore.midair.plunging-attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Plunging Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('123.26%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base Mid-air Attack. No override text — kept basicDmg per this schema\'s established mid-air convention. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'encore.basic.dodge-counter',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('125.94%×2'), category: 'basicDmg', basis: 'ATK' },
    note: 'Base Dodge Counter. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
  },
  {
    id: 'encore.skill.flaming-woolies',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Flaming Woolies → Energetic Welcome' },
    timing: { cooldown: 10 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('76.61%×8 + 339.16%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Base Resonance Skill, chains into Energetic Welcome if pressed again immediately. Real 10s cooldown per the dump. Not in CHARACTER_ROTATIONS — her modeled rotation always uses the Cosmos: Rampage replacement instead.',
  },
  {
    id: 'encore.forte.cloudy-frenzy',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heavy ATK: Cloudy Frenzy' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('334.00%'), category: 'libDmg', basis: 'ATK' },
    note: 'Base-kit version of Cosmos Rupture, same full-Mayhem/70%-DMG-reduction-channel mechanic outside Cosmos Rave, counted as Resonance Liberation DMG. Not in CHARACTER_ROTATIONS — her modeled rotation always reaches full Mayhem during Cosmos Rave instead, using encore.forte.cosmos-rupture.',
  },
  {
    id: 'encore.heavy.cosmos-heavy-attack',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Cosmos: Heavy Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('217.58%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Enhanced Heavy ATK during Cosmos Rave (replaces Standard), counted as Heavy Attack DMG per its own kit text. Not in CHARACTER_ROTATIONS — her modeled rotation always reaches full Mayhem via Skill/Basic ATK before Heavy Attack comes up, going straight to Cosmos Rupture instead.',
  },
  {
    id: 'encore.basic.cosmos-dodge-counter',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Cosmos: Dodge Counter' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.99%×4'), category: 'basicDmg', basis: 'ATK' },
    note: 'Enhanced Dodge Counter during Cosmos Rave (replaces Standard), counted as Basic Attack DMG per its own kit text. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real rotation.',
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
    // Verified 2026-09-08 (full re-audit): checked whether the real, enforced `condition.casterHpPct`
    // schema field (triggerEngine.js's conditionHolds(), added 2026-09-05) should replace this
    // unenforced `requiresStance` string. It should NOT — resolveHitComposedDps.js (the resolver this
    // block actually runs through for real DPS output) calls conditionHolds() with only 3 args,
    // never supplying `casterHpPctAssumed`, so any block using `casterHpPct` unconditionally FAILS
    // (`casterHpPctAssumed == null` short-circuits to false) in this resolver path — using it here
    // would silently zero this buff out entirely, which is strictly worse than the current always-on
    // approximation for a solo DPS calc that assumes no incoming damage (Encore realistically stays
    // above 70% HP for a full burst rotation). Kept as `requiresStance` (unenforced, i.e. flat
    // always-on for the window) — this is the SAME simplification CHAR_BUFF_TABLE['Encore'] itself
    // already discloses in its own selfBuffs entry ("TODO: needs Phase 2 schema... not a flat
    // always-on buff"), now cross-confirmed rather than assumed correct.
    note: "Inherent Skill Angry Cosmos: +10% DMG dealt during Resonance Liberation Cosmos Rave while Encore's HP is above 70% — duration approximated to Cosmos Rave's own 10s window since the source gives no separate timer (same approximation already flagged in CHAR_BUFF_TABLE's own condition text). HP-gating not enforced (see verification comment above for why casterHpPct would make this worse, not better, in the resolver actually used).",
  },
  // Added 2026-09-07 (completeness pass): "Minor Fortes: Fusion DMG+12%, ATK%+12%" — a permanent,
  // always-on passive stat bonus, previously had no block anywhere in this file.
  {
    id: 'encore.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'elemDmg', value: 12, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Fusion DMG+12%, ATK%+12% (Data dump/Encore/Encore.md). Unconditional, always active.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S2 correctly has NO block — pure Energy-economy utility, zero DPS
  //    component per the audit's own zeroing) ──
  {
    // Retargeted 2026-09-08 (full re-audit): was `trigger:{type:'cast', on:'Basic ATK:Cosmos:
    // Frolicking 1-4'}` with `stacking:'stacking', maxStacks:4` — the same under-counting bug class
    // just found and fixed on chain.s6 above. `activeCountAt()` counts concurrently-active 6s windows
    // opened by real firings of THIS exact cast trigger, but Cosmos: Frolicking (the whole 4-stage
    // combo) only casts twice in the real modeled rotation (CHARACTER_ROTATIONS['Encore']) — measured
    // directly: the 2nd cast's window opens ~3 simulator-steps (4.5s) after the 1st, well inside the
    // 1st's own 6s window, so `activeCountAt()` never sees more than 2 concurrent windows — capping at
    // 2/4 stacks (6% Fusion DMG), never the real 12% max. The real trigger is "Basic Attack hit" (any
    // sub-hit, not the whole-combo cast) — a single Cosmos: Frolicking cast lands 12 real sub-hits
    // (2+3+4+3), so the real 4-stack cap is reached within the first few sub-hits of the FIRST
    // Frolicking cast, well under a second in — then continuously refreshed by the dense hit rate
    // through both combos and into Cosmos Rupture. No "any Basic-ATK sub-hit" trigger type exists in
    // this engine (same limitation as chain.s6's "any damage instance"), so — same fix pattern —
    // modeled as a flat value at the real cap from the first real Basic-ATK-hit event onward, rather
    // than a stacking mechanic tied to an under-firing whole-combo-cast anchor. Sentinel duration
    // since stacks keep getting refreshed by ongoing Basic-ATK-adjacent activity through the rest of
    // the modeled rotation (correctly stays at 0% for the 3 real pre-Frolicking steps: Echo/Intro/
    // Liberation Cosmos Rave, none of which land a Basic ATK hit).
    id: 'encore.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Basic ATK:Cosmos: Frolicking 1-4' },
    timing: { duration: 99 }, // sentinel: persists (continuously refreshed by dense Basic-ATK sub-hits) through the rest of the rotation
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 12, source: 'self-kit' }],
    note: 'Fusion DMG Bonus +3%, stacking up to 4 times for 6s, on Basic ATK hit — modeled as a flat 12% (real cap) from the first Cosmos: Frolicking cast onward rather than a per-whole-combo-cast ramp, since the real per-sub-hit mechanic saturates within the first few hits of that first cast (see retargeting comment above).',
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
    // Retargeted 2026-09-08 (full re-audit): was `trigger:{type:'cast', on:'Skill:Cosmos: Rampage'}`
    // with `stacking:'stacking', maxStacks:5` — the engine's `activeCountAt()` counts CONCURRENTLY
    // ACTIVE 10s windows opened by real firings of this exact trigger, and Cosmos: Rampage only casts
    // 3 times in the real modeled rotation (CHARACTER_ROTATIONS['Encore']), so this was capping at
    // 3/5 stacks (15% ATK) — never reaching the real 25% max. The real mechanic is "1 stack per
    // damage instance" (every landed hit, not just Skill casts) during Cosmos Rave: her modeled
    // rotation lands 3 Cosmos: Rampage hits (4 sub-hits each) PLUS 2 full Cosmos: Frolicking combos
    // (2+3+4+3 = 12 sub-hits each) PLUS Cosmos Rupture's own hits, all within the single 10s Cosmos
    // Rave window — well over 30 distinct damage instances, the first dozen or so landing within
    // roughly the first second. Since each stack independently lasts 10s and Encore keeps landing
    // hits continuously (refreshing) for the rest of the window, she is realistically at the 5-stack
    // cap for virtually the entire Cosmos Rave duration, not slowly ramping through it. The engine
    // has no "any damage instance" trigger type to model the real per-hit ramp directly (same
    // limitation class as Danjin's S1 dead-stacking-metadata fix), so — same established pattern as
    // that fix — modeled as a flat value at the real, sourced cap instead of a stacking mechanic tied
    // to an under-firing anchor. Anchored to the Liberation:Cosmos Rave cast itself (the window's own
    // opening event) with a duration matching Cosmos Rave's real 10s window, since that's the single
    // real cast that actually marks the start of the "any hit stacks this" period.
    id: 'encore.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Cosmos Rave' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 25, source: 'self-kit' }],
    note: 'Gains 1 stack of Lost Lamb per damage instance during Cosmos Rave, each +5% ATK for 10s, stacking up to 5 times (25% max) — per the two-source majority (two independent sources both say 5 stacks/25%, vs. a third source\'s outlier "6 stacks", flagged in the source audit rather than silently resolved). Modeled as a flat 25% (real cap) for the whole Cosmos Rave window rather than a slow per-Rampage-cast ramp — see the retargeting comment above for why the real per-hit mechanic saturates near-instantly.',
  },
];
