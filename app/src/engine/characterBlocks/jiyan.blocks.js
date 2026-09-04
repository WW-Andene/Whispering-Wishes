// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/jiyan.blocks.js
// Jiyan converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Jiyan'] (empty — no buffs), RESONANCE_CHAIN_DATA['Jiyan'] (+ its
// own detailed 2026-08-31 audit comment, read directly for each node's real
// mechanic), SKILL_MULTIPLIERS['Jiyan'], and CHARACTER_ROTATIONS['Jiyan']. No new
// numbers invented. S1 correctly has NO block — pure utility with zero DPS
// component, per the audit's own zeroing. S5's per-hit stacking mechanic and S6's
// per-Momentum-stack conditionality are approximated at their documented ceiling
// values, matching the source table's own convention.
//
// Added 2026-09-04 (Finale-modeling pass, REMAINING_WORK.md 1c): 'jiyan.forte.emerald-storm-finale'
// now models Emerald Storm: Finale's own damage (142.91%×2+428.73%, heavyDmg — "considered Heavy
// Attack DMG" per the kit text), giving S6's previously-inert scoped totalMult a real target.
// Deliberately NOT added to CHARACTER_ROTATIONS: the documented burst combo casts Liberation
// immediately after Intro, before Resolve (built only from Basic ATK/Intro hits) reaches the 30
// threshold needed for Finale to replace Prelude — see the block's own note for the full reasoning.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../shared/skillMultiplierParser.js';

const SOURCE = 'Jiyan';

/** @type {import('../triggerBlocks.schema.js').TriggerBlock[]} */
export const JIYAN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'jiyan.intro.tactical-strike',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Intro:Tactical Strike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('198.81%') },
    note: 'Builds Resolve toward the 60 cap.',
  },
  {
    id: 'jiyan.heavy.lance-of-qingloong',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Heavy ATK:Lance of Qingloong' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.52%×8 → 61.55%×8 → 66.76%×8'), category: 'heavyDmg' },
    note: 'Qingloong Mode Heavy ATK replacement, 3-part combo, each part hits 8x; counted as Heavy ATK DMG. Fires 3x in the real rotation (real, repeated cast, not a bug — the first is interrupted early per the rotation note, but full-combo values are used for all 3 as a representative approximation).',
  },
  {
    id: 'jiyan.forte.emerald-storm-finale',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Forte:Emerald Storm: Finale' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Added 2026-09-04 (Finale-modeling pass, REMAINING_WORK.md 1c): at 30+ Resolve, casting
    // Liberation triggers Finale instead of Prelude — consumes 30 Resolve, counted as Heavy ATK DMG
    // per the kit text ("considered Heavy Attack DMG"), castable mid-air at low altitude.
    damage: { hits: parseSkillMultiplierHits('142.91%×2+428.73%'), category: 'heavyDmg' },
    note: "At 30+ Resolve, Liberation cast consumes 30 Resolve for Finale instead of Prelude; counted as Heavy ATK DMG, castable mid-air at low altitude. NOT part of the real CHARACTER_ROTATIONS — the documented burst combo casts Liberation immediately after Intro, before Resolve (built only from Basic ATK/Intro hits) reaches the 30 threshold, so Prelude (free Qingloong Mode entry, feeding the far larger Lance of Qingloong Heavy ATK damage) is what actually fires; the source's own review explicitly recommends saving Resolve for Finale over the Skill's +20% DMG enhancement, but that recommendation only applies once Resolve is already banked outside the immediate post-Intro burst opener, not as a substitute for entering Qingloong Mode. Modeled here for completeness/S6 interaction only.",
  },
  {
    id: 'jiyan.skill.windqueller',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Windqueller' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('106.36%×4'), category: 'skillDmg' },
    note: '7s cooldown. Free +20% DMG (no Resolve cost) while in Qingloong Mode. Fires twice in the real rotation.',
  },
  {
    id: 'jiyan.outro.discipline',
    source: SOURCE, kind: 'damage',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Coordinated ATK triggered when the incoming Resonator lands a Heavy ATK (8s window, once per
    // second, up to 2 procs) — the real per-ally-hit trigger isn't modeled, the max 2-proc case is
    // used as a representative value.
    // Fixed 2026-09-03: had no damage.category — the kit text explicitly calls this a "Coordinated
    // Attack", which maps directly to this schema's own `coordDmg` category (already a supported
    // EXTERNAL_STAT_KEYS entry), not a bare uncategorized hit.
    damage: { hits: [{ atkPct: 313.40 }, { atkPct: 313.40 }], category: 'coordDmg' },
    note: 'Coordinated ATK triggered when the incoming Resonator lands a Heavy ATK (8s window, once per second, up to 2 procs) — modeled at the max 2-proc case, not the real per-ally-hit trigger condition.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S1 correctly has NO block — pure utility, zero DPS component per
  //    the audit's own zeroing) ──
  // S1 correctly has NO block — Benevolence: Windqueller +1 extra charge/use, Resolve cost of
  // Windqueller -15, both pure resource/utility with ZERO DPS component.
  {
    id: 'jiyan.chain.s2',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Tactical Strike' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 28 }],
    note: 'Versatility: after Intro Skill Tactical Strike, gain 30 Resolve and ATK+28% for 15s, once per 15s (confirmed exact) — 30 Resolve grant not modeled (no DPS component).',
  },
  {
    id: 'jiyan.chain.s3',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Skill:Windqueller' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 16 },
      { stat: 'critDmg', value: 32 },
    ],
    note: 'Spectation: casting Windqueller, Liberation Prelude, Finale, OR Intro Tactical Strike grants Crit Rate+16%/Crit DMG+32% for 8s (confirmed exact) — modeled on the Windqueller cast used in her real rotation.',
  },
  {
    id: 'jiyan.chain.s4',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Liberation:Emerald Storm: Prelude' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'heavyDmg', value: 25, stacking: 'refresh' }],
    note: 'Prudence: casting Liberation Prelude or Finale grants the WHOLE TEAM Heavy ATK DMG Bonus +25% for 30s (confirmed exact, team-wide per the audit comment).',
  },
  {
    id: 'jiyan.chain.s5-outro-mult',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-03: was `trigger:{type:'swap-out'}` with no `timing.duration` — a new variant of
    // the item-12 dead-buff architecture bug (the engine-architecture history (git log)): resolveHitComposedDps.js's
    // statsAtInstant() only reads `passiveBlocks` (trigger.type==='passive') and `buffWindows`
    // (duration != null) — ANY non-passive trigger type with no duration is invisible, not just
    // 'cast' specifically (the shape found on every prior instance this session). Converted to
    // `trigger:{type:'passive'}` + `scopedToBlockId` so it fires and stays scoped to only Discipline's
    // own hit.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 120, scopedToBlockId: 'jiyan.outro.discipline' }],
    note: "Resolution: Outro Skill Discipline gains an ADDITIONAL +120% DMG Multiplier.",
  },
  {
    id: 'jiyan.chain.s5-atk-stack',
    source: SOURCE, kind: 'buff',
    trigger: { type: 'cast', on: 'Intro:Tactical Strike' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 3, stacking: 'stacking', maxStacks: 15 }],
    note: 'Resolution: ATK+3% per hit landed, stacking up to 15x (=+45% max) for 8s, instantly maxed after casting Tactical Strike — modeled as per-stack 3% x15 cap (matching the real stacking mechanic) rather than a flat 45%, anchored to the Tactical Strike cast that instant-maxes it. The real per-hit-landed stacking/8s-decay conditionality beyond that instant-max isn\'t modeled.',
  },
  {
    id: 'jiyan.chain.s6',
    source: SOURCE, kind: 'buff',
    // Fixed 2026-09-04 (Phase A audit — this was a REAL, live bug, not the "no live DPS impact today"
    // claimed by the prior 2026-09-03 comment): `trigger:{type:'passive'}` with NO `scopedToBlockId`
    // means resolveHitComposedDps.js's statsAtInstant()/passiveBlocks loop applies this effect to
    // EVERY hit block in the kit unconditionally (it only skips a hit when
    // `effect.scopedToBlockId && effect.scopedToBlockId !== hitBlockId` — an effect with NO
    // scopedToBlockId never gets skipped). So whenever S6 is selected, this was inflating
    // jiyan.intro.tactical-strike, jiyan.heavy.lance-of-qingloong, jiyan.skill.windqueller AND
    // jiyan.outro.discipline all by +240% totalMult — not just Finale's own multiplier as the kit
    // text requires ("each stack consumed granting Finale's own DMG Multiplier +120%"). This is the
    // same class of bug as the Jinhsi element-scoping bug: an effect meant to hit one named move
    // leaking to the whole kit for want of a scope. Fixed by scoping to
    // jiyan.forte.emerald-storm-finale, matching this file's own `jiyan.<slot>.<name>` id convention.
    // Updated 2026-09-04 (Finale-modeling pass): that block now exists (see 'jiyan.forte.emerald-storm-
    // finale' above), so this scoping is live — it correctly boosts ONLY Finale's own damage, still
    // without touching the real CHARACTER_ROTATIONS (which stays under the 30-Resolve Lance of
    // Qingloong / Prelude branch — Finale isn't part of it, see that block's own note for why).
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 240, scopedToBlockId: 'jiyan.forte.emerald-storm-finale' }],
    note: "Fortitude: Momentum stacks (gained on Heavy ATK, Tactical Strike, or Windqueller use, cap 2) that Emerald Storm: Finale consumes entirely on cast, each stack giving Finale's OWN DMG Multiplier +120% (up to +240% at 2 stacks) — modeled at the 2-stack max case per the audit comment's own convention, scoped to the jiyan.forte.emerald-storm-finale damage block. The real per-stack/conditional mechanic (0/120/240 depending on Momentum at cast time) isn't modeled. Finale isn't cast in the real CHARACTER_ROTATIONS (see that block's note), so this scoping has no effect on the standard rotation's total.",
  },
];
