// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/carlotta.blocks.js
// Carlotta converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Carlotta'], RESONANCE_CHAIN_DATA['Carlotta'] (+ its own detailed
// 2026-08-31 audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Carlotta'], and CHARACTER_ROTATIONS['Carlotta']. No new numbers
// invented. S3's Kaleidoscope Sparks extra Outro strike is modeled directly (added
// 2026-09-03, see carlotta.chain.s3-kaleidoscope-sparks). S1's Substance resource-
// economy effect has no DPS component and has no home in this schema.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Carlotta';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const CARLOTTA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'carlotta.intro.wintertime-aria',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Wintertime Aria' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('178.93% + 59.65%×2') },
  },
  {
    id: 'carlotta.skill.art-of-violence',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Art of Violence' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('144.11%×2'), category: 'skillDmg' },
  },
  {
    id: 'carlotta.skill.chromatic-splendor',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Chromatic Splendor' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('112.73%×2 + 338.18%'), category: 'skillDmg' },
  },
  {
    id: 'carlotta.forte.imminent-oblivion',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Imminent Oblivion' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('66.83%×5 + 501.21%'), category: 'skillDmg' },
    note: 'Counted as Resonance Skill DMG per its own kit text, despite being a Basic ATK-button cast.',
  },
  {
    id: 'carlotta.liberation.era-of-new-wave',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Era of New Wave' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('402.71%'), category: 'skillDmg' },
    note: 'Counted as Resonance Skill DMG per its own kit text, despite being a Liberation-button cast. Activates 10s Twilight Tango, forcing the next 5 Basic ATK/Liberation presses into Death Knell x4 -> Fatal Finale.',
  },
  {
    id: 'carlotta.liberation.death-knell-x4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Death Knell ×4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row is '(183.64% + 14.50%×4) per shot' — this step represents all 4 forced presses in
    // Twilight Tango, so the per-shot hit-set is repeated 4x to match the real 4-press mechanic.
    damage: { hits: [0, 1, 2, 3].flatMap(() => parseSkillMultiplierHits('183.64% + 14.50%×4')), category: 'skillDmg' },
    note: 'Counted as Resonance Skill DMG per its own kit text. Builds 1 Meta Vector per hit (cap 4), consumed by Fatal Finale.',
  },
  {
    id: 'carlotta.liberation.fatal-finale',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Liberation:Fatal Finale' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('644.33%'), category: 'skillDmg' },
    note: 'Counted as Resonance Skill DMG per its own kit text. Ends Twilight Tango and wipes Substance to 0.',
  },
  {
    id: 'carlotta.skill.art-of-violence-chromatic-splendor-2',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Art of Violence → Chromatic Splendor' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Second Skill-combo cast of the rotation (post-Twilight Tango) — both presses combined into
    // one CHARACTER_ROTATIONS step, so both skills' hit-sets are combined here to match.
    damage: { hits: [...parseSkillMultiplierHits('144.11%×2'), ...parseSkillMultiplierHits('112.73%×2 + 338.18%')], category: 'skillDmg' },
  },
  {
    id: 'carlotta.outro.closing-remark',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('794.2%') },
  },
  {
    // Added 2026-09-03: S3's Kaleidoscope Sparks — a real extra strike on the SAME Outro cast, same
    // "extra hit at the same instant" shape already established by Brant's chain.s6-secondary-blast
    // (a real, sourced flat %ATK value, not a proportion, so modeled directly rather than derived).
    // sN-suffixed id gates this to sequence 3+ via sequenceGating.js's own <char>.chain.sN-<suffix>
    // convention.
    id: 'carlotta.chain.s3-kaleidoscope-sparks',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('1032.18%') },
    note: 'S3 Kaleidoscope Sparks: Closing Remark gains 1 additional 1032.18%-ATK strike on the same Outro cast, gated to sequence 3+.',
  },

  // ── Buff/debuff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'carlotta.selfbuff.final-bow',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 99 }, // sentinel: conditional on full Substance, no CHARACTER_ROTATIONS step directly named "Substance full"
    target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 80 }],
    note: 'Forte Circuit Final Bow: at full (120/120) Substance, Liberation DMG Multiplier (Era of New Wave/Death Knell/Fatal Finale) +80% — ends early if swapped out during Twilight Tango or when Twilight Tango ends, not modeled (no early-consumption trigger in this schema).',
  },
  {
    id: 'carlotta.debuff.deconstruction',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'cast', on: 'Liberation:Era of New Wave' },
    timing: { duration: 4 },
    target: { scope: 'all-enemies' },
    effects: [{ stat: 'defIgnore', value: 18, stacking: 'refresh' }],
    note: 'Also applied by Intro/Chromatic Splendor/Death Knell/Forte Heavy via Ars Gratia Artis — only the Liberation:Era of New Wave application is wired to a real CHARACTER_ROTATIONS step, the others not separately modeled.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic) ──
  {
    id: 'carlotta.chain.s1',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-02 (re-read after being flagged as "found, not fixed" too hastily): was
    // `trigger:{type:'cast', on:'Liberation:Era of New Wave'}` with no `timing.duration` — the same
    // dead cast-scoped/no-duration no-op shape as S2/Lupa's S4/Verina's S6 (Engine development.md
    // item 12), so this never actually applied. Previously left unfixed on the theory that "Crit
    // Rate on a Deconstructed target" was an unsourced blanket guess if made unconditional — but the
    // pasted text's own Review section says outright: "This debuff lasts for 4 seconds but with the
    // Inherent Ability [Ars Gratia Artis] active, it should always be active." That's a direct source
    // for treating Deconstruction uptime as continuous through her real rotation, so an unconditional
    // passive +12.5% Crit Rate is the sourced fix, not a guess.
    trigger: { type: 'passive' },
    timing: {},
    target: { scope: 'self' },
    effects: [{ stat: 'critRate', value: 12.5 }],
    note: "+12.5% Crit Rate, sourced as effectively unconditional per the kit text's own \"should always be active\" claim about Deconstruction uptime with Ars Gratia Artis. Chromatic Splendor hitting a Dispersion target also restores 30 Substance, a resource-economy effect with no DPS stat, not modeled.",
  },
  {
    id: 'carlotta.chain.s2',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-02: this was `trigger:{type:'cast',...}` with no `timing.duration` — a
    // `kind:'buff'` block in that exact shape is a silent no-op in resolveHitComposedDps.js's
    // statsAtInstant() (it only reads passiveBlocks [trigger.type==='passive'] and buffWindows
    // [duration != null]), the same architecture bug already found and fixed on Lupa's S4/Verina's
    // S6 (Engine development.md item 12). Converted to passive + scopedToBlockId (Augusta's S3
    // pattern) so it only ever boosts Fatal Finale's own hit, matching the real "Fatal Finale's own
    // DMG Multiplier +126%" mechanic, without needing a cast-window that never gets built.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 126, scopedToBlockId: 'carlotta.liberation.fatal-finale' }],
    note: "Real scope: Fatal Finale's own DMG Multiplier +126%.",
  },
  {
    id: 'carlotta.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 93 }],
    note: "Real scope: Art of Violence's AND Chromatic Splendor's own DMG Multiplier both +93% — kept passive (applies to both skills' own blocks above whenever they fire) rather than cast-scoping to only one. ALSO enables Outro Skill Kaleidoscope Sparks — modeled as a separate real damage block, carlotta.chain.s3-kaleidoscope-sparks above.",
  },
  {
    id: 'carlotta.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Imminent Oblivion' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'skillDmg', value: 25, stacking: 'refresh' }],
    note: 'Real mechanic: casting Heavy ATK, Containment Tactics, OR Imminent Oblivion grants the WHOLE TEAM +25% Resonance Skill DMG Bonus for 30s (confirmed team-wide target per the audit comment). Only the Imminent Oblivion trigger is wired to a real CHARACTER_ROTATIONS step (her rotation never uses plain Heavy ATK/Containment Tactics).',
  },
  {
    id: 'carlotta.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Forte:Imminent Oblivion' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 47 }],
    note: "Real scope: Imminent Oblivion's own DMG Multiplier +47% — cast-scoped (instant, no persistent duration).",
  },
  {
    id: 'carlotta.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 186.6 }],
    note: "Real scope: Death Knell's own DMG Multiplier +186.6% — kept passive (applies whenever the Death Knell x4 block above fires), same pattern as S3. Also doubles Death Knell's crystal-shard count and adds a 1.5s Scattering immobilize on hit (CC, not a DPS stat), not modeled.",
  },
];
