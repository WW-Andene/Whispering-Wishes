// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/galbrena.blocks.js
// Galbrena converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Galbrena'], RESONANCE_CHAIN_DATA['Galbrena'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Galbrena'], and CHARACTER_ROTATIONS['Galbrena']. No new numbers
// invented. Afterflame (the shared stacking mechanic behind both her S1 and her
// debuff) is gained from ANY team Resonator's Echo Skill cast, not her own —
// a cross-character trigger this schema has no clean anchor for, documented
// rather than force-fit to one of her own casts.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../skillMultiplierParser.js';

const SOURCE = 'Galbrena';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const GALBRENA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS — every row is "considered Heavy Attack DMG" or
  //    "considered Echo Skill DMG" despite the button/type used to cast it) ──
  {
    id: 'galbrena.intro.hellflare-overload',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Hellflare Overload' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('94.12%') },
  },
  {
    id: 'galbrena.heavy.basic-attack-stage2',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Basic Attack Stage 2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('26.31%×2+78.91%'), category: 'heavyDmg' },
    note: 'Threshold State combo, builds Sinflame (skips the weak Stage 1 per the rotation).',
  },
  {
    id: 'galbrena.heavy.basic-attack-stage3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Basic Attack Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('28.60%×2+42.89%×2'), category: 'heavyDmg' },
  },
  {
    id: 'galbrena.echo.basic-attack-stage4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Echo:Basic Attack Stage 4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('177.86%'), category: 'echoDmg' },
  },
  {
    id: 'galbrena.heavy.ascent-of-malice',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Ascent of Malice' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('51.57%×2'), category: 'heavyDmg' },
    note: 'At max Sinflame — enters Demon Hypostasis, endlag cancelled on hit by the Echo (Hellfire Absolution).',
  },
  {
    id: 'galbrena.echo.hellfire-absolution',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Echo:Hellfire Absolution' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('110.90%+90.74%×11'), category: 'echoDmg' },
    note: 'Ultimate barrage — also grants +85% DMG Mult to Demon Hypostasis attacks for 14s (see galbrena.selfbuff.demon-hypostasis-amp below).',
  },
  {
    id: 'galbrena.heavy.seraphic-execution-stage2',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Seraphic Execution Stage 2' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('27.84%×2+83.51%'), category: 'heavyDmg' },
  },
  {
    id: 'galbrena.heavy.seraphic-execution-stage3',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Seraphic Execution Stage 3' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('24.32%×3+170.21%'), category: 'heavyDmg' },
    note: 'Dodge Counter (Purgatory Scourge) can substitute here for higher DMG and Forte if the enemy attacks — not separately modeled (rotation uses this path).',
  },
  {
    id: 'galbrena.echo.seraphic-execution-stage4',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Echo:Seraphic Execution Stage 4' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('18.15%×3+127.02%'), category: 'echoDmg' },
  },
  {
    id: 'galbrena.echo.seraphic-execution-stage5',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Echo:Seraphic Execution Stage 5' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('67.28%+156.99%'), category: 'echoDmg' },
    note: 'Demon Hypostasis combo finisher.',
  },
  {
    id: 'galbrena.outro.ashen-pursuit',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('79.50%×3+556.50%') },
    note: 'Pure-damage swap-out finisher; no team buff, so she\'s free to quickswap.',
  },

  // ── Buff/debuff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'galbrena.selfbuff.demon-hypostasis-amp',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Echo:Hellfire Absolution' },
    timing: { duration: 14 },
    target: { scope: 'self' },
    effects: [{ stat: 'allDmg', value: 85 }],
    note: "+85% DMG Mult to Demon Hypostasis attacks on Hellfire Absolution cast — CHAR_BUFF_TABLE describes this loosely as 'Liberation cast', but Hellfire Absolution (her Echo-slot ultimate barrage) is the real cast this scales off per SKILL_MULTIPLIERS' own note text, used directly instead.",
  },
  {
    id: 'galbrena.selfbuff.burning-drive',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: { duration: 4 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 20 }],
    note: "Burning Drive: +20% ATK on certain casts — CHAR_BUFF_TABLE's own condition text doesn't name which specific casts trigger it, kept passive rather than guessing an anchor.",
  },
  {
    id: 'galbrena.debuff.afterflame',
    source: SOURCE, kind: 'debuff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'all-enemies' },
    effects: [{ stat: 'deepen', value: 1.5, stacking: 'stacking', maxStacks: 40 }],
    note: 'Afterflame: DMG Taken +1.5% per stack (up to 40 stacks, 60% cap) while Galbrena is in Demon Hypostasis, cleared when she exits — gained from ANY team Resonator\'s Echo Skill cast (capped once per Echo name), not her own casts, so no CHARACTER_ROTATIONS step of hers anchors the stacking trigger; modeled passive as an approximation. Realistically ~36% without Phrolova, ~48% with her, per the source note (rarely maxed at 60%).',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 re-audit comment for
  //    each node's real mechanic) ──
  {
    id: 'galbrena.chain.s1',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 2, stacking: 'stacking', maxStacks: 40 }],
    note: '+2% Crit DMG per Afterflame stack, up to 80% at 40 stacks — same Afterflame stacking mechanic as galbrena.debuff.afterflame above (gained from any teammate\'s Echo Skill cast, not modeled per-cast, kept passive as an approximation).',
  },
  {
    id: 'galbrena.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 90 }],
    note: 'Confirmed exact value/category, no further scope detail sourced beyond the flat value — kept passive.',
  },
  {
    id: 'galbrena.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Echo:Hellfire Absolution' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'libDmg', value: 130 }],
    note: "Real scope: Hellfire Absolution's own DMG Multiplier +130% (her Echo-slot ultimate, functionally her Liberation-equivalent per RESONANCE_CHAIN_DATA's libDmg categorization) — cast-scoped (instant, no persistent duration), same single-hit-scoped pattern as Calcharo's S5.",
  },
  {
    id: 'galbrena.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'allDmg', value: 20 }],
    note: "Confirmed exact value/category, no team-wide scope stated — modeled self-scoped per her own CHAR_BUFF_TABLE note ('no team support kit'), unlike other characters' team-wide allDmg nodes.",
  },
  {
    id: 'galbrena.chain.s5',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Ascent of Malice' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 150 }],
    note: "DMG Multiplier of Encroach/Ascent of Malice/Ravage +150% (corrected skillDmg -> heavyDmg per the re-audit, all three are 'considered Heavy Attack DMG' despite the Resonance Skill slot) — cast-scoped to Ascent of Malice, the variant used in her real rotation.",
  },
  {
    id: 'galbrena.chain.s6',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'heavyDmg', value: 60 }],
    note: "DMG Multiplier of the 4 Demon Hypostasis moves (Seraphic Execution, Flamewing Verdict, Hellsent Barrage, Purgatory Scourge) +60% (corrected elemDmg -> heavyDmg per the re-audit; value already correct) — kept passive, applies whenever those blocks above fire. Additional conditional layer (Ascent of Malice consuming Afterflame grants up to +35% Fusion DMG Amp) not modeled (no home in a flat node, per the audit's own TODO).",
  },
];
