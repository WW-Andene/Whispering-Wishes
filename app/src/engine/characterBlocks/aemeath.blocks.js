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
    dotApplier: { mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode' },
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
    dotApplier: { mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode' },
  },
  {
    id: 'aemeath.liberation.heavenfall-edict-overdrive',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Heavenfall Edict: Overdrive' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('186.72%+248.96%×3'), category: 'libDmg', basis: 'ATK' },
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
    dotApplier: { mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode' },
  },
  {
    id: 'aemeath.skill.seraphic-duet-encore',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Seraphic Duet: Encore' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('17.90%×4+35.79%×3+178.93%'), category: 'libDmg', basis: 'ATK' },
    note: 'Counted as Liberation DMG per its own kit text. Real cast-order dependency (only castable after Overture, empowered by Stardust Resonance) not modeled as a conditional trigger this pass — kept as an unconditional cast, same simplification already used for Yinlin\'s Lightning Execution.',
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
    dotApplier: { mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode' },
  },
  {
    id: 'aemeath.skill.seraphic-duet-overture',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Seraphic Duet: Overture' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('17.90%+14.92%×6+23.86%×3+59.65%×3'), category: 'skillDmg', basis: 'ATK' },
    note: 'No "counted as" override in its own kit text (unlike Encore) — kept as skillDmg.',
  },
  {
    id: 'aemeath.heavy.mech-charged-ii',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Heavy Attack - Mech: Charged II' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('232.00%'), category: 'libDmg', basis: 'ATK' },
    note: "Step's own CHARACTER_ROTATIONS note: \"counted as Liberation DMG\".",
  },
  {
    id: 'aemeath.liberation.heavenfall-edict-finale',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Heavenfall Edict: Finale' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1663.83%'), category: 'libDmg', basis: 'ATK' },
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
    effects: [{ stat: 'deepen', value: 25, scopedToBlockId: 'aemeath.liberation.heavenfall-edict-finale', source: 'self-kit' }],
    note: 'At max Between the Stars stacks, Heavenfall Edict: Finale DMG Amplified +25% — scoped 2026-09-02 (the engine-merge history (git log) Phase 0.5 gap #3, new scopedToBlockId field) to only her Finale hit, not general "deepen" across her whole kit as previously modeled. Only enforced by the hit-composed resolvers; the legacy time-averaged path still applies it at the broader scope (see the field\'s own schema doc).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own audit comment for each
  //    node's real mechanic, read directly rather than re-derived) ──
  {
    id: 'aemeath.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    condition: { requiresStance: 'Instant Response' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 300, scopedToBlockId: 'aemeath.heavy.mech-charged-ii', source: 'self-kit' }],
    note: '+300% Crit DMG for Heavy ATK specifically, while in Instant Response — scoped 2026-09-02 (Phase 0.5 gap #3) to her one real Heavy ATK block (aemeath.heavy.mech-charged-ii), not general critDmg across her whole kit as previously modeled; the STANCE condition (requiresStance) still gates whether it\'s active at all. Only enforced by the hit-composed resolvers, see the field\'s own schema doc.',
  },
  { id: 'aemeath.chain.s2', source: SOURCE, kind: 'buff', section: 'Chain', trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [{ stat: 'totalMult', value: 25, source: 'self-kit' }] },
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
