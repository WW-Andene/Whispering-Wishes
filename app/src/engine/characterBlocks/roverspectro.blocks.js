// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/roverspectro.blocks.js
// Rover: Spectro converted to TriggerBlocks. Sourced from characters.js's already-
// audited CHAR_BUFF_TABLE['Rover: Spectro'], RESONANCE_CHAIN_DATA['Rover: Spectro']
// (+ its own 2026-09-01 re-audit comment, read directly for each node's real
// mechanic), SKILL_MULTIPLIERS['Rover: Spectro'], and CHARACTER_ROTATIONS
// ['Rover: Spectro']. No new numbers invented. S3/S4 correctly have NO block —
// zero real DPS component per the audit's own zeroing. CHAR_BUFF_TABLE's own
// selfBuffs entry is explicitly chain-gated (S6-conditional, "not innate") —
// modeled once via S6 below, not duplicated. Its Frazzle-stack debuff has no
// matching stat key in this schema (same class as Chisa's), not modeled.
//
// Full kit audit 2026-09-09: fixed a comment/code mismatch on the Intro block (a
// stale comment claimed its category was already set; it wasn't). Fixed S1 (was
// an unconditional always-on passive instead of the real cast-scoped 7s window
// her own kit text specifies — confirmed via direct measurement it was incorrectly
// boosting the Heavy ATK warm-up combo, which fires before any real Resonating
// Slashes/Spin cast) and S6 (was anchored to 'Skill:Resonating Slashes', which
// never fires in the modeled rotation — a confirmed no-op debuff, verified via
// direct measurement that seq5/seq6 totals were byte-identical). Both re-anchored
// to Forte:Resonating Whirl, the real cast event modeling her enhanced Resonating
// Spin in this rotation.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Rover: Spectro';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const ROVER_SPECTRO_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'roverspectro.heavy.standard-resonance-aftertune',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Standard / Resonance / Aftertune' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-03 (Phase A audit — REMAINING_WORK.md 1c): had no damage.category at all — a
    // real Heavy-ATK-slot move with no "considered X DMG" override in the kit text (the dump's own
    // Damage Profile shows Heavy at a genuine 9.2%/15,731 share, comparable to categories already
    // included in dmgFocus elsewhere) — silently zeroed any teammate's Heavy ATK DMG Bonus.
    damage: { hits: parseSkillMultiplierHits('19.27%×5 → 76.05% → 126.75%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Warm-up combo: charged Heavy ATK into timed-press Resonance follow-up into Aftertune finisher. Fills Diminutive Sound fast without a full Basic combo.',
  },
  {
    id: 'roverspectro.intro.waveshock',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Waveshock' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-09 (full-kit audit): the header comment already claimed "category added for
    // Layer 4 schema migration", but the actual field was never set — a stale/aspirational comment
    // vs. code mismatch (the same bug found on Rover: Aero's and Rover: Havoc's own Intro blocks
    // earlier this session). No override text names a different category for this Intro cast, same
    // default-to-skillDmg convention actually applied on Sanhua/Baizhi/Taoqi's equivalent fixes.
    damage: { hits: parseSkillMultiplierHits('168.99%'), category: 'skillDmg', basis: 'ATK' },
    note: 'Adds a bit more Diminutive Sound.',
  },
  {
    id: 'roverspectro.liberation.echoing-orchestra',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Echoing Orchestra' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.81%+675.96%'), category: 'libDmg', basis: 'ATK' },
    note: 'Delayed blast; applies a full 6 stacks of Spectro Frazzle to the target in one hit.',
    // dotApplier added 2026-09-02 (the engine-merge history (git log) Phase 2) — matches this block's own note (6
    // stacks) and CHAR_BUFF_TABLE.debuffs.frazzle's already-sourced condition text exactly.
    // resolveFrazzleFromBlocks SUMS this with roverspectro.forte.resonating-whirl's own 2 stacks below.
    // 2026-09-08 correction (DOT-real-firing pass — "wire the DOT calculator to real per-step firing
    // instead"): the real modeled rotation casts Forte:Resonating Whirl TWICE (2+2=4), not once, so the
    // real total is 6+2+2=10 — matching the dump's own explicit confirmation verbatim (line 109: "2
    // Skills + 1 Ultimate caps it at 10 stacks"). The PRIOR comment here ("matching the legacy
    // pre-combined value... 2+6=8") was itself a real, sourced under-crediting bug: the legacy flat
    // value (8) never accounted for the Skill firing twice in one rotation loop at all. Fixed at the
    // engine level (dotReactionsFromBlocks.js's collectRealApplications(), which now counts one
    // contribution per REAL occurrence in CHARACTER_ROTATIONS instead of one per block regardless of
    // repeat casts), not by hand-editing either dotApplier value here — the block's own per-cast value
    // (2, or 6) stays correct at the single-cast level either way.
    dotApplier: { mechanic: 'frazzle', value: 6 },
  },
  {
    id: 'roverspectro.basic.vibration-manifestation-stage1-4',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Vibration Manifestation Stage 1-4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says only 2 taps are used here — only Stages 1-2 of the row's
    // 4-stage combo are used.
    damage: { hits: parseSkillMultiplierHits('59.15%+76.05%'), category: 'basicDmg', basis: 'ATK' },
    note: 'Tap Basic Attack twice to refill Diminutive Sound toward the next Forte cast (only Stages 1-2 fire).',
  },
  {
    id: 'roverspectro.forte.resonating-whirl',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Resonating Whirl' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // CHARACTER_ROTATIONS' own note says this single step covers Resonating Spin (auto-upgrade from
    // Skill at 50+ Diminutive Sound) AND the immediate Resonating Whirl Basic ATK follow-up chained
    // right after it — both rows' hits combined.
    damage: { hits: [...parseSkillMultiplierHits('129.08%×2'), ...parseSkillMultiplierHits('39.77%')], category: 'skillDmg', basis: 'ATK' },
    note: 'At 50+ Diminutive Sound, Skill auto-upgrades into Resonating Spin (2 Spectro Frazzle stacks + Shimmer, which stops decay), immediately chained into the Resonating Whirl Basic ATK follow-up. Fires twice in the real rotation.',
    // dotApplier added 2026-09-02 — see roverspectro.liberation.echoing-orchestra's own comment.
    // 2026-09-08 correction: this block DOES fire twice in the modeled rotation, and each real cast
    // DOES apply its own 2 stacks (dump line 109: "2 Skills + 1 Ultimate caps it at 10 stacks" — 2+2+6,
    // not 2+6) — resolveFrazzleFromBlocks's real-per-step-firing pass now credits both real
    // occurrences (4 total from this block) instead of the old composition-only single credit (2),
    // fixing a real under-crediting bug the previous "declared kit fact, not per-cast" convention had.
    dotApplier: { mechanic: 'frazzle', value: 2 },
  },
  {
    id: 'roverspectro.forte.resonating-echoes',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Resonating Echoes' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-03 (Phase A audit — REMAINING_WORK.md 1c): was category:'basicDmg' — but her own
    // kit text is explicit ("Resonance Skill: Resonating Echoes ... considered Resonance Skill DMG"),
    // the same "considered X DMG" override pattern found roster-wide this session. A Basic ATK DMG
    // Bonus was being wrongly credited to this hit while a real Skill DMG Bonus was wrongly denied.
    damage: { hits: parseSkillMultiplierHits('79.53%+159.05%'), category: 'skillDmg', basis: 'ATK' },
    note: "Basic-ATK-button cast after Resonating Spin fully ends, but the kit text overrides it to Resonance Skill DMG (same override her own Forte Circuit section states for Resonating Spin/Whirl too).",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S3/S4 correctly have NO block — zero real DPS component per the
  //    audit's own zeroing) ──
  {
    id: 'roverspectro.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Fixed 2026-09-09 (full-kit audit): was an unconditional `trigger:{type:'passive'}` with no
    // duration — S1's own kit text is explicit this is a real cast-scoped window ("Casting Resonating
    // Slashes or Resonating Spin -> Crit Rate +15% for 7s"), not a permanent passive. Confirmed via
    // direct measurement: with the old always-on model, enabling S1 raised
    // roverspectro.heavy.standard-resonance-aftertune's own hit damage — but that Heavy ATK combo is
    // the FIRST step in the real modeled rotation, firing BEFORE either Resonating Slashes or
    // Resonating Spin has ever been cast, so S1's Crit Rate bonus should not be active yet at that
    // point. The real modeled rotation never casts plain Resonating Slashes (CHARACTER_ROTATIONS'
    // only Skill-family step is Forte:Resonating Whirl, the enhanced Resonating Spin + Whirl combo,
    // same anchor already used for chain.s6 below), so anchored here to that same real cast event.
    trigger: { type: 'cast', on: 'Forte:Resonating Whirl' },
    timing: { duration: 7 }, target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 15, source: 'self-kit' }],
    note: 'Casting Resonating Slashes or Resonating Spin grants self Crit Rate +15% for 7s — anchored to the real Resonating Spin cast (Forte:Resonating Whirl) in the modeled rotation.',
  },
  {
    id: 'roverspectro.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 20, source: 'self-kit' }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  // S3 correctly has NO block — Energy Regen +20%, zero real DPS component, no matching category in
  // this schema.
  // S4 correctly has NO block — team heal on Liberation cast, zero real DPS component.
  {
    id: 'roverspectro.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Echoing Orchestra' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 40, source: 'self-kit' }],
    note: "Echoing Orchestra's own DMG Multiplier +40% (confirmed exact) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'roverspectro.chain.s6',
    source: SOURCE, kind: 'debuff', section: 'Chain',
    // Fixed 2026-09-09 (full-kit audit): was anchored to 'Skill:Resonating Slashes', which — per this
    // block's OWN prior note — never fires in the real modeled CHARACTER_ROTATIONS (the warm-up step
    // is Heavy ATK, and Forte auto-upgrades Skill straight to Resonating Spin), so this debuff was a
    // real, confirmed no-op: verified via direct measurement that seq5 and seq6 totals were byte-
    // identical (S6 contributed zero). S6's own kit text explicitly names BOTH "Resonating Slashes/
    // Resonating Spin hit" as valid triggers — the real rotation always casts the enhanced Resonating
    // Spin (modeled as Forte:Resonating Whirl, same real cast event already anchoring chain.s1 above)
    // — re-anchored there so the debuff actually fires in the modeled rotation, matching the real game
    // behavior of a Rover: Spectro dupe owner.
    trigger: { type: 'cast', on: 'Forte:Resonating Whirl' },
    timing: { duration: 20 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'resShred', value: 10 }],
    note: "S6 (5 copies): Resonating Slashes/Spin hit -> Spectro RES Shred -10% (20s, no stacking) — chain-gated, not innate to base kit (per CHAR_BUFF_TABLE's own note); anchored to the real Resonating Spin cast (Forte:Resonating Whirl) that actually fires in the modeled rotation.",
  },
];
