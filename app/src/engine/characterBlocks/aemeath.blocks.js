// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/aemeath.blocks.js
// Aemeath converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Aemeath'], RESONANCE_CHAIN_DATA['Aemeath'] (+ its own audit comment,
// which spells out each node's real mechanic — read directly, not re-derived),
// SKILL_MULTIPLIERS['Aemeath'], and CHARACTER_ROTATIONS['Aemeath']. No new numbers
// invented. Dual-form (Aemeath/Mech) kit with a cast-order Seraphic Duet
// Overture->Encore combo — NOT modeled as a conditional trigger (kept as
// unconditional 'cast', same simplification as Yinlin's Lightning Execution);
// documented explicitly below, not silently glossed over.
//
// Basic ATK combo damage matched per real rotation step by slicing the row's own
// arrow-separated stages, cross-checked against each step's own note ("Tap Basic
// Attack twice"/"3 times") to confirm the tap COUNT matches the stage count sliced —
// 'Mech Stage 3-4' (2 taps) = stages 3+4; 'Mech Stage 2-4' (3 taps) = stages 2+3+4;
// 'Aemeath Stage 2-4' (3 taps) = stages 2+3+4. Exact, not approximated.
//
// Re-audited 2026-09-02 against a fresh the source dump: every row matched exactly EXCEPT
// Heavenfall Edict (Overdrive/Finale), which was consistently ~1.0754x too high across
// all 4 values (a precise, systematic discrepancy, not rounding — see
// SKILL_MULTIPLIERS['Aemeath']'s own audit comment in characters.js). Retightened both
// damage blocks below to the fresh dump's exact figures. Also zeroed S5's fabricated
// totalMult:40 (no DPS component — see aemeath.chain.s5's own note) and corrected
// CHARACTER_DATA['Aemeath'].dmgFocus (was wrongly including 'Skill' — her real damage-
// output simulation shows a genuine 0% Skill share, matching her kit text: both Seraphic
// Duet casts are "considered Resonance Liberation DMG").
//
// Completeness pass 2026-09-05 (next character after Aalto, alphabetically, same "verify
// against the real dump" discipline): against `Data dump/Aemeath/Aemeath.md`,
// found and fixed 4 real gaps of the same class as Aalto's — Basic Stage 1 (both forms,
// auto-cast on Form Switch) had NO block at all; Minor Fortes (Crit Rate+8%, ATK%+12%)
// had no block at all; Concerto Energy (Overdrive+20, Finale+20, Intro+10) and real
// cooldowns (Overdrive/Finale 25s, Form Switch 1s) were entirely uncaptured; Inherent
// Skill "Before All Sounds" (+200% DMG Amp on Heavy ATK in Instant Response) had no block.
// Also resolved chain.s2's own already-flagged open item (see RESONANCE_CHAIN_DATA's audit
// comment in characters.js: "needs its own dedicated verification pass") — the real
// mechanic ("Seraphic Duet Overture/Encore DMG Multipliers both +100%") is now modeled
// precisely via scopedToBlockId to each of the two real Duet blocks instead of the
// previous, admittedly-unjustified totalMult:25.
//
// Engine-logic pass, same day (per user direction: individual characters first, and build
// real mechanic interaction/logic wherever real values support it — "it's an engine, not
// an Excel sheet"): Instant Response (gating chain.s1's +300% Crit DMG and Before All
// Sounds' +200% DMG Amp, both on Heavy ATK) was previously a `condition.requiresStance`
// this engine never actually evaluates — trusted, not derived. Rebuilt as a REAL derived
// state: her Resonance Rate gauge (cap 4) now accumulates from its 3 fully-sourced numeric
// contributors (Overdrive+2 [base+Starlume, confirmed active at Overdrive's real cast time
// in this rotation], Encore+1, Overture+1 — see rotationSimulator.js's new gainResource/
// resourceAtLeast), genuinely reaching 4/4 at Overture's own cast, matching the rotation's
// own step note independently. Both gated blocks now trigger off the derived
// 'resource-threshold:Resonance Rate:4' key with a real timing.duration (54s — the actual
// remaining time in Heavenfall Edict: Unbound's 60s window at that crossing point), not an
// unenforced condition.
//
// Correction, same day: Synchronization Rate was wrongly treated as entirely blocked by the
// missing Basic/Mid-air/Dodge Counter/Sync Strike per-hit values — those genuinely have no
// sourced number, but 3 of her real contributors always did: Intro+40 ("Casting Intro Skill...
// recovers 40 points"), Overdrive+30 ("...recovers 30 points"), and Charged II's conditional
// full refill (+200, "When in Instant Response and... Unbound at the same time, casting
// [Charged II]... recovers 200 points") — the last one modeled unconditionally on the block
// itself since chain.s1/before-all-sounds's own resource-threshold tests already independently
// verify both conditions genuinely hold at that exact cast in this rotation. Built the same
// partial-but-real way as Resonance Rate: real sourced contributors tracked via resourceGain,
// the genuinely-unsourced Basic/Mid-air/Dodge/Sync-Strike contribution left honestly unmodeled.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Aemeath';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const AEMEATH_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'aemeath.intro.debut-of-meteoric-radiance',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Debut of Meteoric Radiance' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.30% + 97.95%'), basis: 'ATK' },
    // dotApplier added 2026-09-02 (the engine-merge history (git log) Phase 2) — CHARACTER_ROTATIONS' own step note:
    // "applies Tune Rupture/Fusion Burst depending on her Resonance Mode." Fusion-Burst-mode-only per
    // her kit text; gated the same way her tuneBreak.competesWithFusionBurstReaction resolution already
    // is (winningStanceForOwner), not a second mode mechanism.
    // value:1 added 2026-09-06 — real, sourced stack count: "team inflicting Fusion Burst adds 1
    // Fusion Trail stack (30s, cap 30)" (dump line 83), consumed by resolveFusionBurstStacks.js's
    // real team-wide detonation-timing simulation (see that file's own header for the full mechanic).
    dotApplier: { mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode', value: 1 },
    // appliesTags added 2026-09-05, per the dump's own line 84 text ("Both modes: Basic Stage 3/4
    // (either form), Sync Strikes, and both Intro skills inflict Tune Rupture-Shifting / Fusion Burst
    // on hit") — the Tune Rupture-mode HALF of this same real trigger was previously entirely
    // untagged (only the Fusion Burst dotApplier above existed), leaving her toggle non-functional in
    // Tune Rupture mode. Same tag name ('tune-rupture-shifting') and shape Lynae's own blocks already
    // use for the identical status. No new DOT_MECHANICS entry/resolver needed — this is a pure
    // ally-action marker (lets ANOTHER character's own trigger react to it, e.g. Mornye's), same as
    // Lynae/Denia's existing appliesTags; it does not itself compute any Tune Rupture-Shifting damage
    // (that reaction has no engine consumer anywhere yet — a real, separate, larger gap, not built
    // here).
    appliesTags: [{ tag: 'tune-rupture-shifting', requiresStance: 'Tune Rupture mode' }],
    // concertoEnergyGain added 2026-09-05 (completeness pass): dump's own "Concerto Regen (either):
    // 10" row for both Intro variants.
    concertoEnergyGain: 10,
    // resourceGain added 2026-09-05 (engine-logic pass, per user correction — this specific number
    // WAS always sourced, not blocked by the missing Basic/Mid-air/Dodge/Sync-Strike values):
    // "Casting Intro Skill Songs Across the Universe and Debut of Meteoric Radiance recovers 40
    // points of Synchronization Rate."
    resourceGain: [{ resource: 'Synchronization Rate', value: 40 }],
  },
  // Added 2026-09-05 (completeness pass): dump's own "Auto-casts Basic Stage 1 on switch" text for
  // Resonance Skill Form Switch — real, sourced (Mech Form Stage 1: 23.20%×3), previously entirely
  // absent (no block anywhere referenced Basic Stage 1 in either form). Both real 'Skill:Form
  // Switch' casts in CHARACTER_ROTATIONS['Aemeath'] switch INTO Mech form (opener, and the pre-Outro
  // closer) — never into base Aemeath form — so only the Mech-form value is modeled here, matching
  // what actually fires in the real modeled rotation, not a blanket "either form" guess. Not tagged
  // with a fusionBurst/tuneRupture dotApplier: the kit text's own trigger list for that ("Basic Stage
  // 3/4, Sync Strikes, both Intro skills") does not include Stage 1.
  {
    id: 'aemeath.skill.form-switch-basic-1',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Form Switch' },
    timing: { cooldown: 1 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('23.20%×3'), category: 'basicDmg', basis: 'ATK' },
    note: "Mech Form Basic Stage 1 (23.20%×3), auto-cast on Form Switch — real cooldown 1s per the dump's own 'Form Switch cooldown: 1s' row. Aemeath-form Stage 1 (46.35%) exists too but never fires in this rotation (both real switches go into Mech form), so it's not modeled as a separate block.",
  },
  {
    id: 'aemeath.basic.mech-stage-3-4',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Mech Stage 3-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('3.89%×6+81.54%+11.65% + 40.38%+94.21%'), category: 'basicDmg', basis: 'ATK' },
    note: '2 taps (per step note) = stage 3 + stage 4 of the 4-stage Mech Form combo.',
    // dotApplier added 2026-09-02 — Basic Stage 3/4 inflicts Fusion Burst per her kit text (Forte
    // Circuit "To Sculpt the Silence": Basic Stage 3/4, Sync Strikes, both Intro skills), Fusion-Burst-
    // mode only.
    // value:1 added 2026-09-06 — real, sourced stack count: "team inflicting Fusion Burst adds 1
    // Fusion Trail stack (30s, cap 30)" (dump line 83), consumed by resolveFusionBurstStacks.js's
    // real team-wide detonation-timing simulation (see that file's own header for the full mechanic).
    dotApplier: { mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode', value: 1 },
    // appliesTags added 2026-09-05 — see aemeath.intro.debut-of-meteoric-radiance's own comment for
    // the full rationale (same real dump line 84 trigger, Tune Rupture-mode half).
    appliesTags: [{ tag: 'tune-rupture-shifting', requiresStance: 'Tune Rupture mode' }],
  },
  {
    id: 'aemeath.liberation.heavenfall-edict-overdrive',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Heavenfall Edict: Overdrive' },
    // cooldown/concertoEnergyGain added 2026-09-05: dump's own "Overdrive cooldown: 25s" and
    // "Overdrive Concerto Regen: 20" rows.
    timing: { cooldown: 25 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('186.72%+248.96%×3'), category: 'libDmg', basis: 'ATK' },
    concertoEnergyGain: 20,
    // resourceGain added 2026-09-05 (engine-logic pass, per user direction to build real derived
    // state rather than trust a "purely descriptive" condition): dump's own "Resonance Rate (cap
    // 4): +1 from Overdrive; +1 more from Overdrive while in Starlume Acceleration." Starlume
    // Acceleration (granted by Intro, 15s) is real and confirmed still active at Overdrive's own
    // cast time in THIS specific rotation (Intro fires 2 steps/~3s before Overdrive, well inside
    // the 15s window) — so both bonuses apply here; value 2 reflects that real, verified timing
    // fact for this rotation, not a blanket assumption Starlume is always active.
    // Synchronization Rate +30 added same pass (was always sourced, see the file-header
    // correction): "Casting Resonance Liberation Heavenfall Edict: Overdrive recovers 30 points
    // of Synchronization Rate."
    resourceGain: [
      { resource: 'Resonance Rate', value: 2 },
      { resource: 'Synchronization Rate', value: 30 },
    ],
  },
  {
    id: 'aemeath.basic.mech-stage-2-4',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Mech Stage 2-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('18.57%+74.26% + 3.89%×6+81.54%+11.65% + 40.38%+94.21%'), category: 'basicDmg', basis: 'ATK' },
    note: '3 taps (per step note) = stages 2+3+4 of the 4-stage Mech Form combo.',
    // dotApplier added 2026-09-02 — bundles Stage 3/4 (her kit's real Fusion Burst trigger) alongside
    // Stage 2, same combo-bundling approximation this block already makes for its own damage.
    // value:1 added 2026-09-06 — real, sourced stack count: "team inflicting Fusion Burst adds 1
    // Fusion Trail stack (30s, cap 30)" (dump line 83), consumed by resolveFusionBurstStacks.js's
    // real team-wide detonation-timing simulation (see that file's own header for the full mechanic).
    dotApplier: { mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode', value: 1 },
    // appliesTags added 2026-09-05 — see aemeath.intro.debut-of-meteoric-radiance's own comment for
    // the full rationale (same real dump line 84 trigger, Tune Rupture-mode half).
    appliesTags: [{ tag: 'tune-rupture-shifting', requiresStance: 'Tune Rupture mode' }],
  },
  {
    id: 'aemeath.skill.seraphic-duet-encore',
    source: SOURCE, kind: 'damage', section: 'Skill',
    // Gating rebuilt 2026-09-05 (engine-logic pass): real dependency is "while in Seraphic Duo"
    // (dump: "entered for 5s upon casting Basic Stage 4"), NOT an Overture-first cast-order rule —
    // the prior note's "only castable after Overture" claim doesn't match the real rotation order
    // (Encore is cast BEFORE Overture here: ...Mech Stage 2-4 -> Duet Encore -> Aemeath Stage 2-4
    // -> Duet Overture) and no kit text anywhere establishes an Overture-before-Encore rule — that
    // was an unverified assumption, corrected rather than perpetuated. Real gate: opens off the
    // immediately-preceding real Basic-Stage-4-ending combo (Mech Stage 2-4), 5s window, matching
    // the dump's own real number exactly.
    trigger: { type: 'windowed-cast', opensOn: ['cast:Basic ATK:Mech Stage 2-4'], windowSeconds: 5, attemptOn: 'Skill:Seraphic Duet: Encore' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('17.90%×4+35.79%×3+178.93%'), category: 'libDmg', basis: 'ATK' },
    note: 'Counted as Liberation DMG per its own kit text. Cast while in Mech form (switches back to Aemeath form on resolution).',
    // resourceGain added 2026-09-05: dump's own "Resonance Rate: +1 per Seraphic Duet cast."
    resourceGain: [{ resource: 'Resonance Rate', value: 1 }],
  },
  {
    id: 'aemeath.basic.aemeath-stage-2-4',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Aemeath Stage 2-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('13.89%+20.84%+34.73% + 9.32%×3+18.63%+46.56% + 6.73%×5+100.94%'), category: 'basicDmg', basis: 'ATK' },
    note: '3 taps (per step note) = stages 2+3+4 of the 4-stage Aemeath Form combo.',
    // dotApplier added 2026-09-02 — same real Basic Stage 3/4 trigger as her Mech-form combos above,
    // in base Aemeath Form instead.
    // value:1 added 2026-09-06 — real, sourced stack count: "team inflicting Fusion Burst adds 1
    // Fusion Trail stack (30s, cap 30)" (dump line 83), consumed by resolveFusionBurstStacks.js's
    // real team-wide detonation-timing simulation (see that file's own header for the full mechanic).
    dotApplier: { mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode', value: 1 },
    // appliesTags added 2026-09-05 — see aemeath.intro.debut-of-meteoric-radiance's own comment for
    // the full rationale (same real dump line 84 trigger, Tune Rupture-mode half).
    appliesTags: [{ tag: 'tune-rupture-shifting', requiresStance: 'Tune Rupture mode' }],
  },
  {
    id: 'aemeath.skill.seraphic-duet-overture',
    source: SOURCE, kind: 'damage', section: 'Skill',
    // Gating rebuilt 2026-09-05 (engine-logic pass) — same real Seraphic Duo dependency as Encore
    // above, opening off its own immediately-preceding real combo (Aemeath Stage 2-4).
    trigger: { type: 'windowed-cast', opensOn: ['cast:Basic ATK:Aemeath Stage 2-4'], windowSeconds: 5, attemptOn: 'Skill:Seraphic Duet: Overture' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('17.90%+14.92%×6+23.86%×3+59.65%×3'), category: 'skillDmg', basis: 'ATK' },
    note: 'No "counted as" override in its own kit text (unlike Encore) — kept as skillDmg.',
    // resourceGain added 2026-09-05: dump's own "Resonance Rate: +1 per Seraphic Duet cast." This
    // is the SECOND Duet cast in the real rotation (after Overdrive's 2 and Encore's 1 = 3), so
    // this +1 is what brings her to the real 4/4 cap — matching the rotation's own step note at the
    // very next step ("Resonance Rate is now capped from the 2 Duet casts").
    resourceGain: [{ resource: 'Resonance Rate', value: 1 }],
  },
  {
    id: 'aemeath.heavy.mech-charged-ii',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Heavy Attack - Mech: Charged II' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('232.00%'), category: 'libDmg', basis: 'ATK' },
    note: "Step's own CHARACTER_ROTATIONS note: \"counted as Liberation DMG\".",
    // resourceGain added 2026-09-05 (was always sourced): "When in Instant Response and
    // Heavenfall Edict: Unbound at the same time, casting [Charged II] recovers 200 points of
    // Synchronization Rate" — full refill. Modeled unconditionally here (not gated on the real
    // derived Instant Response resource-threshold) because this file's own aemeath.chain.s1/
    // before-all-sounds tests already independently prove BOTH conditions genuinely hold at this
    // exact cast in the real modeled rotation (Instant Response crosses at the prior Duet
    // Overture cast; Unbound's 60s window from Overdrive is still far from expiring) — a verified
    // fact, not a blanket assumption.
    resourceGain: [{ resource: 'Synchronization Rate', value: 200 }],
  },
  {
    id: 'aemeath.liberation.heavenfall-edict-finale',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Heavenfall Edict: Finale' },
    // cooldown/concertoEnergyGain added 2026-09-05: dump's own "Finale cooldown: 25s" and "Finale
    // Concerto Regen: 20" rows.
    timing: { cooldown: 25 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1663.83%'), category: 'libDmg', basis: 'ATK' },
    concertoEnergyGain: 20,
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'aemeath.outro.silent-protection',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 10, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Guaranteed 10% All-DMG Amp floor to the team (excl. self); rises to 20% for Tune Rupture/Fusion Burst inflictors specifically, which this engine\'s condition field can\'t gate on yet — same simplification the flat table already carries.',
  },
  // Added 2026-09-05 (completeness pass): dump's own "Minor Fortes: Crit Rate+8%, ATK%+12%" —
  // previously had no block at all, same class of gap as Aalto's own missing Minor Fortes.
  {
    id: 'aemeath.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 8, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Crit Rate+8%, ATK%+12% (Data dump/Aemeath/Aemeath.md line 140). Unconditional, always active.',
  },
  // Added 2026-09-05 (completeness pass); GATING rebuilt same day (engine-logic pass, per user
  // direction: "if you have actual value and mechanic interaction and logic, build it" — not just
  // tag a condition nobody checks). Inherent Skill "Before All Sounds": in Instant Response, Heavy
  // ATK gains +200% DMG Amplification. Real Instant Response entry condition (dump, S1's own text):
  // "reaching max Resonance Rate while Unbound." Resonance Rate is now a REAL tracked gauge (see
  // the 3 resourceGain entries above: Overdrive+2, Encore+1, Overture+1 = 4, matching the cap) —
  // so this fires off the derived 'resource-threshold:Resonance Rate:4' key the instant that real
  // total is reached (at Overture's own cast, per this rotation's real order), not an
  // unenforced condition.requiresStance. timing.duration:54 is the REAL remaining time in
  // Heavenfall Edict: Unbound's own 60s window at that crossing point (Overdrive grants Unbound at
  // step-time 6.0s in this engine's own step pacing; the crossing happens at step-time 12.0s; 60-6=
  // 54s remaining) — long enough to cover the very next step (Heavy ATK Charged II, step-time
  // 13.5s) with real margin, not a fabricated number. Fragile if step pacing/rotation order ever
  // changes; flagged here rather than silently assumed durable.
  // Forte "Unlanded Melody" (dump line 103, "once a target's Off-Tune Level is full, cast Tune
  // Break on it") used to have a marker block here, firing off RotationSimulator's
  // 'tune-break-detonation' ally-action tag. Removed entirely (2026-09-05, direct user instruction)
  // along with the rest of the Off-Tune mechanic — its own timing was fake (no sourced gauge-fill
  // rate exists), so showing it in the Rotation Timeline at a specific step was fake too, not just
  // its damage. Real, named skill in her kit; simply not modeled here anymore.
  {
    id: 'aemeath.inherent.before-all-sounds',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'resource-threshold', resource: 'Resonance Rate', threshold: 4 },
    timing: { duration: 54 }, target: { scope: 'self' },
    effects: [{ stat: 'amplify', value: 200, scopedToBlockId: 'aemeath.heavy.mech-charged-ii', source: 'self-kit' }],
    note: 'Inherent Skill Before All Sounds: in Instant Response, Heavy ATK (either form) gains +200% DMG Amplification — scoped to her one real Heavy ATK block, gated on a genuinely derived Instant Response window (see block-level comment above), not a trusted condition.',
  },
  {
    id: 'aemeath.selfbuff.between-the-stars-critdmg',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: conditional passive, no natural decay — resets on team/mode change, not a real timer
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 60, source: 'self-kit' }],
    note: "Inherent Skill Between the Stars: Tune Rupture mode 20% per Resonator x3 stacks, or Fusion Burst mode 30% per Resonator x2 stacks (both max 60%) — modeled at the max value.",
  },
  {
    id: 'aemeath.selfbuff.between-the-stars-finale-amp',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // same sentinel convention as above
    target: { scope: 'self' },
    condition: { requiresStance: 'Max Between the Stars stacks' },
    effects: [{ stat: 'amplify', value: 25, scopedToBlockId: 'aemeath.liberation.heavenfall-edict-finale', source: 'self-kit' }],
    note: 'At max Between the Stars stacks, Heavenfall Edict: Finale DMG Amplified +25% — scoped 2026-09-02 (the engine-merge history (git log) Phase 0.5 gap #3, new scopedToBlockId field) to only her Finale hit, not general "amplify" across her whole kit as previously modeled. Only enforced by the hit-composed resolvers; the legacy time-averaged path still applies it at the broader scope (see the field\'s own schema doc).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each
  //    node's real mechanic, read directly rather than re-derived) ──
  {
    // Gating rebuilt 2026-09-05 (engine-logic pass) — same real derived Instant Response window as
    // aemeath.inherent.before-all-sounds above (see that block's own comment for the full
    // Resonance-Rate-cap/Unbound-remaining-time derivation); this node just adds its own +300%
    // Crit DMG to the same real window instead of trusting an unenforced condition.requiresStance.
    id: 'aemeath.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'resource-threshold', resource: 'Resonance Rate', threshold: 4 },
    timing: { duration: 54 }, target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 300, scopedToBlockId: 'aemeath.heavy.mech-charged-ii', source: 'self-kit' }],
    note: '+300% Crit DMG for Heavy ATK specifically, while in Instant Response — scoped 2026-09-02 (Phase 0.5 gap #3) to her one real Heavy ATK block (aemeath.heavy.mech-charged-ii), not general critDmg across her whole kit as previously modeled; gated on a genuinely derived Instant Response window since 2026-09-05, not a trusted condition. Only enforced by the hit-composed resolvers, see scopedToBlockId\'s own schema doc.',
  },
  // Fixed 2026-09-05 (completeness pass, resolving RESONANCE_CHAIN_DATA's own "needs its own
  // dedicated verification pass" flag on this node): was `totalMult:25`, unjustified — real S2 text
  // is "Seraphic Duet: Overture and Encore DMG Multipliers both +100%," a move-specific bonus, not
  // a flat kit-wide multiplier. Modeled via scopedToBlockId to each real Duet block, matching its
  // own damage.category (Overture is skillDmg-categorized, Encore is libDmg — "counted as
  // Liberation DMG" per its own kit text) — this does NOT double up against chain.s3's
  // Finale-scoped libDmg+100 since that's scoped to a DIFFERENT block id (heavenfall-edict-finale,
  // not seraphic-duet-encore).
  {
    id: 'aemeath.chain.s2', source: SOURCE, kind: 'buff', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'skillDmg', value: 100, scopedToBlockId: 'aemeath.skill.seraphic-duet-overture', source: 'self-kit' },
      { stat: 'libDmg', value: 100, scopedToBlockId: 'aemeath.skill.seraphic-duet-encore', source: 'self-kit' },
    ],
  },
  { id: 'aemeath.chain.s3', source: SOURCE, kind: 'buff', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'libDmg', value: 100, scopedToBlockId: 'aemeath.liberation.heavenfall-edict-finale', source: 'self-kit' }, { stat: 'critDmg', value: 60, source: 'self-kit' }], note: "libDmg:100 = Heavenfall Edict: Finale's own DMG Mult +100% (not general Liberation DMG) — scoped 2026-09-02 (Phase 0.5 gap #3) to only that hit, since her other libDmg-categorized block (aemeath.heavy.mech-charged-ii) previously also wrongly received it; critDmg:60 = a further extension of Between the Stars, on top of the two selfbuff blocks above (correctly general, not move-scoped)." },
  {
    id: 'aemeath.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20, source: 'self-kit' }],
    note: 'Real mechanic per RESONANCE_CHAIN_DATA\'s own audit comment: team +20% All-Attr DMG specifically ON casting Intro/Sync Strike/Duet — not a passive always-on buff. Modeled as passive (whole-team, correctly, unlike the earlier draft of this block) because no real duration is sourced for the cast-triggered version (CHAR_BUFF_TABLE/RESONANCE_CHAIN_DATA give no timer for this node) — inventing one to build a proper cast-refresh model would be fabricating data, so this stays a documented simplification rather than a fabricated timing.',
  },
  // Zeroed 2026-09-02 (found while cross-checking a fresh the source dump against this file — no prior
  // audit comment ever justified this row, unlike every other S-node here): was `totalMult: 40`, a
  // fabricated number with no basis — S5's real effect ("On kill, reset Starflux to 100%; on fatal
  // damage, revive with a team shield instead of dying, once per 10 min") is purely a
  // survivability/utility mechanic, zero DPS component. Confirmed independently via the source's own
  // damage-output simulation: S4 and S5 produce byte-identical DMG/DPS (2,581,963/220,869 both) —
  // exactly the same S4==S5 signal already found and fixed for Augusta's own fabricated S5.
  {
    id: 'aemeath.chain.s5',
    source: SOURCE, kind: 'utility', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' }, effects: [],
    note: 'On defeating a target directly: reset Starflux to 100%. On taking fatal damage: enter a 5s revive state instead of dying, granting the team a Shield = 360% of her ATK, then revives at full HP + 30 Resonance Energy (once per 10 min). Purely defensive/utility, no DPS component, not representable in this schema.',
  },
  {
    id: 'aemeath.chain.s6',
    source: SOURCE, kind: 'debuff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'all-enemies' },
    effects: [{ stat: 'libDmg', value: 40, source: 'self-kit' }],
    note: "Real mechanic per RESONANCE_CHAIN_DATA's own audit comment: enemy targets TAKE +40% more Liberation DMG (an enemy-side debuff), not a self-buff — corrected kind:'debuff'/target:'all-enemies' from an earlier draft that modeled it as a self buff.",
  },
];
