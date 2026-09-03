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
    // Fixed 2026-09-02: this was ALSO `trigger:{type:'cast', on:'Echo:Hellfire Absolution'}` with no
    // `timing.duration` — the same dead cast-scoped/no-duration `kind:'buff'` no-op shape found on
    // Carlotta's S1/S2 (Engine development.md item 12; matches neither `passiveBlocks`
    // [trigger.type==='passive'] nor `buffWindows` [duration != null] in
    // resolveHitComposedDps.js's statsAtInstant()), so even after fixing its stat (below) it still
    // never applied — proven by a test showing byte-identical totals with/without this block.
    // Converted to `trigger:{type:'passive'}` + `scopedToBlockId` (Augusta's S3 / Carlotta's S2
    // pattern) so it actually fires and stays scoped to only Hellfire Absolution's own hit.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    // Also fixed: was `stat:'libDmg'` — a real category-gating bug, silently zero-effect regardless
    // of the dead-trigger issue above. Category-specific stats (skillDmg/basicDmg/heavyDmg/libDmg/
    // echoDmg/coordDmg) only apply to hits whose own `damage.category` matches exactly, and
    // `galbrena.echo.hellfire-absolution`'s block above is `category:'echoDmg'`, not `'libDmg'` —
    // RESONANCE_CHAIN_DATA's `s3.libDmg` field name is a legacy "her Liberation-slot node" label
    // (kept as-is, used for display), not a literal damage-category claim. Fixed the engine stat
    // to `echoDmg` to actually apply to the real hit.
    effects: [{ stat: 'echoDmg', value: 130, scopedToBlockId: 'galbrena.echo.hellfire-absolution' }],
    note: "Real scope: Hellfire Absolution's own DMG Multiplier +130% (her Echo-slot ultimate).",
  },
  {
    id: 'galbrena.chain.s4',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-02: was `target:{scope:'self'}` — the pasted kit text is explicit this is
    // team-wide: "When Resonators in the team cast Echo Skill, all Resonators in the team gain 20%
    // all-Attribute DMG Bonus for 20s." CHAR_BUFF_TABLE's "no team support kit" note describes her
    // base-kit selfBuffs, not this Resonance Chain node — S1-S6 aren't in CHAR_BUFF_TABLE at all, so
    // that note never actually covered S4. Fixed scope to whole-team. The real trigger (ANY
    // teammate's Echo Skill cast) has no clean anchor in this schema (same cross-character-trigger
    // gap as her own Afterflame mechanic below) — kept passive/unconditional as an approximation
    // rather than force-fitting a fake trigger, same documented tradeoff used elsewhere in this file.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'whole-team' },
    effects: [{ stat: 'allDmg', value: 20 }],
    note: 'Real mechanic: any teammate casting Echo Skill grants the WHOLE TEAM +20% all-Attribute DMG Bonus for 20s.',
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
    // Fixed 2026-09-02: added a 2nd `echoDmg` effect. The kit text names Seraphic Execution and
    // Flamewing Verdict as WHOLE moves ("the DMG Multipliers of Basic Attack - Seraphic Execution,
    // Heavy Attack - Flamewing Verdict, ... are additionally increased by 60%"), but SKILL_MULTIPLIERS
    // categorizes their own Stage 4/5 (Seraphic Execution) and Stage 3 (Flamewing Verdict) as
    // `echoDmg`, not `heavyDmg` — a single `heavyDmg` effect silently missed those stages entirely
    // (category-gated stats only apply to matching-category hits). Both effects target the same 4
    // named moves' real damage.category split.
    effects: [
      { stat: 'heavyDmg', value: 60 },
      { stat: 'echoDmg', value: 60 },
    ],
    note: "DMG Multiplier of the 4 Demon Hypostasis moves (Seraphic Execution, Flamewing Verdict, Hellsent Barrage, Purgatory Scourge) +60%, split across both real damage.category tags those moves carry (heavyDmg for most stages, echoDmg for Seraphic Execution Stage 4/5 and Flamewing Verdict Stage 3) — kept passive, applies whenever those blocks above fire. Additional conditional layer modeled separately below (galbrena.selfbuff.ascent-fusion-amp).",
  },
  {
    // Added 2026-09-03: Ascent of Malice consuming Afterflame stacks grants up to +35% Fusion DMG
    // Amp — scales with the same Afterflame stack count already approximated passively elsewhere in
    // this file (galbrena.debuff.afterflame/galbrena.chain.s1), so kept at its real sourced cap value
    // as a passive approximation, matching that same established convention rather than inventing a
    // new per-stack consumption trigger this schema doesn't track.
    id: 'galbrena.selfbuff.ascent-fusion-amp',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Heavy ATK:Ascent of Malice' },
    condition: { element: 'fusion' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 35 }],
    note: 'Ascent of Malice consuming Afterflame grants up to +35% Fusion DMG Amp (capped value, scales with consumed Afterflame stacks) — cast-scoped to Ascent of Malice.',
  },
];
