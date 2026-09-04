// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/ciaccona.blocks.js
// Ciaccona converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Ciaccona'], RESONANCE_CHAIN_DATA['Ciaccona'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Ciaccona'], and CHARACTER_ROTATIONS['Ciaccona']. No new numbers
// invented. S3 correctly has NO block — real effect ("+1 Musical Essence segment" +
// "+1 Harmonic Allegro charge") is pure resource/utility, zero DPS component.
//
// Fixed 2026-09-02 against a fresh the source dump (`Characters data dump/Ciaccona/
// Ciaccona.md`, same session as Phrolova's Apparition of Beyond-Hecate fix): S6 was
// previously zeroed to {} in RESONANCE_CHAIN_DATA too, correctly NOT force-fit as a
// {stat:value} buff (its real shape — a flat 220% ATK Aero DMG hit while in Solo
// Concert, counted as Liberation DMG — doesn't fit that schema) but also never built
// as its own gated damage block. Added `ciaccona.chain.s6` below, same pattern as
// Phrolova's chain.s6-apparition.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Ciaccona';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const CIACCONA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'ciaccona.intro.roaming-with-the-wind',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Roaming with the Wind' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-02: the dump's own multiplier row labels this move's damage generically "Skill
    // Damage" (not e.g. "Roaming with the Wind DMG") — same convention confirmed on Lupa's Try Focusing,
    // Eh?: a move-specific row name flags a non-default category (paired with explicit "considered X
    // DMG" prose elsewhere in these dumps); the generic "Skill Damage" label means plain Resonance
    // Skill DMG, no override needed. Missed this signal on the first pass — corrected to skillDmg.
    damage: { hits: parseSkillMultiplierHits('189.11%'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Inflicts Aero Erosion, skips straight to Basic ATK Stage 3.',
    // dotApplier added 2026-09-02 (the engine-merge history (git log) Phase 2) — value:3 matches her
    // CHAR_BUFF_TABLE.debuffs.erosion's own already-sourced value ("3 stacks Aero Erosion, ticks every
    // 2s"). resolveErosionFromBlocks takes the MAX across every applying block, not a sum, so tagging
    // each of her 4 real Erosion-inflicting moves with the same value is correct, not redundant double
    // counting.
    dotApplier: { mechanic: 'erosion', value: 3 },
  },
  {
    id: 'ciaccona.basic.stage3',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('33.02%×4'), category: 'basicDmg' , basis: 'ATK' },
  },
  {
    id: 'ciaccona.basic.stage4',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('61.14%×4'), category: 'basicDmg' , basis: 'ATK' },
    note: 'Inflicts Aero Erosion, grants 1 Musical Essence, and starts Solo Concert (24% Aero DMG Bonus to nearby team — see ciaccona.libbuff.solo-concert below). Fires twice in the real rotation (real, repeated cast, not a bug).',
    dotApplier: { mechanic: 'erosion', value: 3 },
  },
  {
    id: 'ciaccona.midair.attack-stage1-2',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Attack Stage 1-2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-02: WuWa's own general mechanic (Mid-air/Plunging Attacks have no dedicated damage
    // type of their own — they inherit Basic ATK or Heavy ATK DMG depending on the character's specific
    // kit, per an explicit override elsewhere in the kit text if one applies) plus this dump's own kit
    // STRUCTURE — Mid-air Attack is listed under her "Basic Attack — Quadruple Time Steps" section, not
    // a separate Heavy Attack section, and no override text anywhere calls it Heavy ATK DMG — confirms
    // basicDmg, not a guess.
    damage: { hits: [...parseSkillMultiplierHits('55.43%×2'), ...parseSkillMultiplierHits('24.46%×4')], category: 'basicDmg' , basis: 'ATK' },
  },
  {
    id: 'ciaccona.skill.harmonic-allegro',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Harmonic Allegro' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('40.39%×4'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Inflicts another Aero Erosion stack, restores Concerto Energy.',
    dotApplier: { mechanic: 'erosion', value: 3 },
  },
  {
    id: 'ciaccona.forte.quadruple-downbeat',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Quadruple Downbeat' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Fixed 2026-09-02: had NO damage.category at all — meant this block (her Heavy Attack REPLACEMENT
    // at 3 Musical Essence, no kit-text override to a different category the way Phrolova's Scarlet
    // Coda/Ciaccona's own S6 have) got zero credit from any teammate's Heavy ATK DMG Bonus buff in
    // resolveHitComposedDps.js's routing (`categoryStat = category ? stats[category] : 0`). Confirmed
    // via the dump's own damage profile: her "Heavy" bucket (40,925, 2nd-largest) is exactly this move
    // plus base Heavy Attack, which her real modeled rotation never actually casts (always 3 Musical
    // Essence by the time Heavy Attack comes up).
    damage: { hits: parseSkillMultiplierHits('31.41%×10+314.03%'), category: 'heavyDmg' , basis: 'ATK' },
    note: 'Consumes all 3 stacked Musical Essence, inflicts Aero Erosion, restores 25 Concerto Energy. Replaces Heavy Attack outright — no kit-text override to a different category, so counted as heavyDmg (matches the dump\'s own damage-profile "Heavy" bucket).',
    dotApplier: { mechanic: 'erosion', value: 3 },
  },
  {
    id: 'ciaccona.liberation.singers-triple-cadenza',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: "Liberation:Singer's Triple Cadenza" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1100.42%'), category: 'libDmg' , basis: 'ATK' },
    note: 'Enters Recital: periodic Symphonic Poem: Tonic pulses via green/yellow prompts, even off-field.',
  },
  {
    id: 'ciaccona.liberation.symphonic-poem-tonic',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Symphonic Poem: Tonic' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('6.12%×20'), category: 'libDmg' , basis: 'ATK' },
    note: 'Periodic pulse during Recital over the field duration, triggered by successful prompt interaction. Modeled as one representative full-duration hit-set, not the real per-pulse timing.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'ciaccona.outro.windcalling-tune',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 30 },
    target: { scope: 'next-on-field' },
    condition: { element: 'aero' },
    effects: [{ stat: 'deepen', value: 100, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Aero Erosion DMG Amp only — not a general DMG Amp.',
  },
  {
    id: 'ciaccona.libbuff.solo-concert',
    source: SOURCE, kind: 'buff', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 4' },
    timing: { duration: 99 }, // sentinel: real trigger is the Ensemble Sylph summon from Mid-air-cancelling Stage 4, near-permanent uptime per its own audit note
    target: { scope: 'whole-team' },
    condition: { element: 'aero' },
    effects: [{ stat: 'elemDmg', value: 24, stacking: 'refresh', source: 'self-kit' }],
    note: 'Solo Concert: team +24% Aero DMG Bonus, from Basic ATK Stage 4\'s Ensemble Sylph summon, NOT Liberation itself — near-permanent uptime once active. Was wrongly allDmg (all-element) in an earlier version, corrected to elemDmg (Aero-only).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic; S3/S6 correctly have NO block — pure resource-grant / flat-%ATK-proc
  //    mechanics with no home in this schema, per the audit's own zeroing) ──
  {
    id: 'ciaccona.chain.s1',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 35, source: 'self-kit' }],
    note: 'ATK +35% after Basic ATK (conditional) — kept passive rather than fabricating a specific per-stage trigger anchor, since the source condition text doesn\'t name one particular Basic ATK stage.',
  },
  {
    id: 'ciaccona.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    condition: { element: 'aero' },
    effects: [{ stat: 'elemDmg', value: 40, source: 'self-kit' }],
    note: 'Team +40% Aero DMG Bonus (corrected from allDmg to elemDmg per the 2026-09-01 re-audit — was granting a phantom all-element buff) — no specific cast trigger sourced, kept passive.',
  },
  // S3 correctly has NO block — real effect ("+1 Musical Essence segment on Basic Attack Stage 4" +
  // "+1 charge on Resonance Skill Harmonic Allegro") is pure resource/utility, zero DPS component.
  {
    id: 'ciaccona.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'defIgnore', value: 45, source: 'self-kit' }],
    note: 'DEF Ignore +45% (confirmed exact value/category per the re-audit) — no specific cast trigger or scope sourced beyond the flat value, kept passive/self.',
  },
  {
    id: 'ciaccona.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: "Liberation:Singer's Triple Cadenza" },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 40, source: 'self-kit' }],
    note: "Real scope: Singer's Triple Cadenza's own DMG Multiplier +40% — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  // Added 2026-09-02: S6's real effect is a standalone proc (each Solo Concert pulse deals a flat 220%
  // of Ciaccona's ATK as Aero DMG, counted as Liberation DMG), not a Liberation DMG% buff — RESONANCE_
  // CHAIN_DATA correctly zeroes it to {} rather than force-fitting it as a {stat:value} buff (same class
  // of gap already flagged for Xiangli Yao's S1 and Zhezhi's S5/S6), but that left it unbuilt entirely.
  // Modeled as a real damage block instead, gated to sequence 6 via the `.chain.s6` id convention
  // (sequenceGating.js). Anchored to the same Basic ATK Stage 4 cast that starts Solo Concert
  // (ciaccona.libbuff.solo-concert) — one representative pulse per real Stage 4 cast, same
  // "representative tick" pattern already used for ciaccona.liberation.symphonic-poem-tonic above.
  {
    id: 'ciaccona.chain.s6',
    source: SOURCE, kind: 'damage', section: 'Chain',
    trigger: { type: 'cast', on: 'Basic ATK:Stage 4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('220%'), category: 'libDmg' , basis: 'ATK' },
    note: 'S6: while in Solo Concert, Ciaccona or an Ensemble Sylph deals a pulse of Aero DMG = 220% ATK, considered Resonance Liberation DMG. Modeled as one representative pulse per Basic ATK Stage 4 cast (the same cast that starts/maintains Solo Concert), not the real periodic timing.',
  },
];
