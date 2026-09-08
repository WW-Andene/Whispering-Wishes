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

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Jiyan';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const JIYAN_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'jiyan.intro.tactical-strike',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Tactical Strike' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category/basis added during Layer 4 migration: was uncategorized, silently rejecting Resonance
    // Skill DMG Bonus. No override text names a different category, same default-to-skillDmg convention
    // as Aalto/Calcharo/Encore/Denia/Galbrena/Iuno's own Intro blocks.
    damage: { hits: parseSkillMultiplierHits('198.81%'), basis: 'ATK' },
    note: 'Builds Resolve toward the 60 cap.',
  },
  {
    id: 'jiyan.heavy.lance-of-qingloong',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Lance of Qingloong' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.52%×8 → 61.55%×8 → 66.76%×8'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Qingloong Mode Heavy ATK replacement, 3-part combo, each part hits 8x; counted as Heavy ATK DMG. Fires 3x in the real rotation (real, repeated cast, not a bug — the first is interrupted early per the rotation note, but full-combo values are used for all 3 as a representative approximation).',
  },
  {
    id: 'jiyan.forte.emerald-storm-finale',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Emerald Storm: Finale' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Added 2026-09-04 (Finale-modeling pass, REMAINING_WORK.md 1c): at 30+ Resolve, casting
    // Liberation triggers Finale instead of Prelude — consumes 30 Resolve, counted as Heavy ATK DMG
    // per the kit text ("considered Heavy Attack DMG"), castable mid-air at low altitude.
    damage: { hits: parseSkillMultiplierHits('142.91%×2+428.73%'), category: 'heavyDmg', basis: 'ATK' },
    note: "At 30+ Resolve, Liberation cast consumes 30 Resolve for Finale instead of Prelude; counted as Heavy ATK DMG, castable mid-air at low altitude. NOT part of the real CHARACTER_ROTATIONS — the documented burst combo casts Liberation immediately after Intro, before Resolve (built only from Basic ATK/Intro hits) reaches the 30 threshold, so Prelude (free Qingloong Mode entry, feeding the far larger Lance of Qingloong Heavy ATK damage) is what actually fires; the source's own review explicitly recommends saving Resolve for Finale over the Skill's +20% DMG enhancement, but that recommendation only applies once Resolve is already banked outside the immediate post-Intro burst opener, not as a substitute for entering Qingloong Mode. Modeled here for completeness/S6 interaction only.",
  },
  {
    id: 'jiyan.skill.windqueller',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Windqueller' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('106.36%×4'), category: 'skillDmg', basis: 'ATK' },
    note: '7s cooldown. Free +20% DMG (no Resolve cost) while in Qingloong Mode. Fires twice in the real rotation.',
  },
  // Added 2026-09-08 (full-kit completeness pass): 5 real, sourced SKILL_MULTIPLIERS rows with no
  // block anywhere in this file — none used in her modeled CHARACTER_ROTATIONS (which enters
  // Qingloong Mode via Prelude immediately and never lands a base-form Basic ATK/Heavy ATK/Mid-air/
  // Dodge Counter input), same "add unused base kit for completeness" convention already used for
  // Encore/Camellya/Hiyuki/Iuno/Jianxin/Jinhsi this session.
  {
    id: 'jiyan.basic.lone-lance',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Basic ATK:Lone Lance Stage 1-5' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('73.16% → 43.73% → 36.38%×5 → 66.20%×2 → 23.60%×7+153.45%×2'), category: 'basicDmg', basis: 'ATK' },
    note: 'Standard 5-stage Basic ATK combo, unused in the modeled rotation (which enters Qingloong Mode via Prelude right after Intro).',
  },
  {
    id: 'jiyan.heavy.standard',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Standard / Windborne Strike / Abyssal Slash' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('22.20%×6 → 81.71% → 105.96%'), category: 'heavyDmg', basis: 'ATK' },
    note: 'Base (non-Qingloong) Heavy Attack, branching into Windborne Strike (hold Basic during it) or Abyssal Slash (release). Unused in the modeled rotation.',
  },
  {
    id: 'jiyan.midair.plunging-attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Plunging Attack + Follow-up' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('123.26%+155.66%'), basis: 'ATK' },
    note: 'Unused in the modeled rotation.',
  },
  {
    id: 'jiyan.midair.banner-of-triumph',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Banner of Triumph' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('79.52%'), basis: 'ATK' },
    note: 'Extra mid-air follow-up, only usable right after Windborne Strike or an airborne Windqueller. Unused in the modeled rotation.',
  },
  {
    id: 'jiyan.dodgecounter.standard',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('125.85%×2'), basis: 'ATK' },
    note: 'Unused in the modeled rotation.',
  },
  {
    id: 'jiyan.outro.discipline',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Coordinated ATK triggered when the incoming Resonator lands a Heavy ATK (8s window, once per
    // second, up to 2 procs) — the real per-ally-hit trigger isn't modeled, the max 2-proc case is
    // used as a representative value.
    // Fixed 2026-09-03: had no damage.category — the kit text explicitly calls this a "Coordinated
    // Attack", which maps directly to this schema's own `coordDmg` category (already a supported
    // EXTERNAL_STAT_KEYS entry), not a bare uncategorized hit.
    damage: { hits: [{ atkPct: 313.40 }, { atkPct: 313.40 }], category: 'coordDmg', basis: 'ATK' },
    note: 'Coordinated ATK triggered when the incoming Resonator lands a Heavy ATK (8s window, once per second, up to 2 procs) — modeled at the max 2-proc case, not the real per-ally-hit trigger condition.',
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) — added 2026-09-08 (full-kit audit): BOTH Inherent Skills
  //    and Minor Fortes were entirely missing from this file (unlike every other character audited
  //    this session — Encore/Galbrena/Hiyuki/Iuno/Jianxin/Jinhsi all have a Minor Fortes block). A
  //    real, previously-missed completeness gap, not an intentional omission — CHAR_BUFF_TABLE
  //    ['Jiyan'].selfBuffs was also empty before this pass. ──
  {
    id: 'jiyan.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 8, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Crit Rate+8%, ATK%+12% (Data dump/Jiyan/Jiyan.md line 95-96). Unconditional, always active.',
  },
  {
    id: 'jiyan.inherent.heavenly-balance',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Intro:Tactical Strike' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 10, source: 'self-kit' }],
    note: 'Inherent Skill Heavenly Balance: after Intro Skill Tactical Strike cast, +10% ATK for 15s — cast-anchored to the real Intro used in her modeled rotation, same real cast jiyan.chain.s2/jiyan.chain.s5-atk-stack already anchor to.',
  },
  {
    // Anchored to the Intro cast (the first real landed hit in her modeled rotation) rather than a
    // bare passive: the real mechanic is "on hit" (any landed hit), and her modeled rotation lands
    // dense, continuous hits throughout (Intro -> Forte:Emerald Storm -> Heavy:Lance x3 interspersed
    // with Skill x2) — the 8s window opens on the very first hit and is continuously refreshed by
    // the dense ongoing hit rate for virtually the entire rest of the rotation, same "saturates near-
    // instantly, model as a flat value from the first real trigger onward" reasoning already
    // established this session (e.g. Encore's chain.s1/s6 fixes). Correctly zero before Intro (the
    // rotation's very first step, so this has no real pre-trigger period to model incorrectly).
    id: 'jiyan.inherent.tempest-taming',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Intro:Tactical Strike' },
    timing: { duration: 99 }, // sentinel: continuously refreshed by the dense ongoing "on hit" trigger for the rest of the rotation
    target: { scope: 'self' },
    effects: [{ stat: 'critDmg', value: 12, source: 'self-kit' }],
    note: "Inherent Skill Tempest Taming: on hit, +12% Crit DMG for 8s — real trigger is any landed hit (not specifically Intro), but anchored to Intro (the rotation's first real hit) since the dense ongoing hit rate that follows keeps refreshing this for virtually the whole rotation.",
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-08-31 audit comment for
  //    each node's real mechanic; S1 correctly has NO block — pure utility, zero DPS component per
  //    the audit's own zeroing) ──
  // S1 correctly has NO block — Benevolence: Windqueller +1 extra charge/use, Resolve cost of
  // Windqueller -15, both pure resource/utility with ZERO DPS component.
  {
    id: 'jiyan.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Intro:Tactical Strike' },
    timing: { duration: 15 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 28, source: 'self-kit' }],
    note: 'Versatility: after Intro Skill Tactical Strike, gain 30 Resolve and ATK+28% for 15s, once per 15s (confirmed exact) — 30 Resolve grant not modeled (no DPS component).',
  },
  {
    // Verified 2026-09-08 (full-kit audit), disclosed explicitly: the real trigger is ANY of 4
    // casts (Windqueller, Prelude, Finale, OR Intro Tactical Strike), but this schema's `trigger.on`
    // only accepts one cast label per block. Anchoring to a 2nd real triggering cast (e.g. Intro,
    // which fires BEFORE the first Windqueller cast in the modeled rotation — steps: Intro@t=1.5s,
    // Prelude@t=3s, Lance@t=4.5s, Windqueller@t=6s) is NOT safe here, unlike Galbrena's Burning Drive
    // fix earlier this session: Intro's own 8s window (ending ~t=9.5s) would still be active when
    // Windqueller's SEPARATE block opens its own window at t=6s, so two independent blocks would
    // double-apply this crit buff during the overlap (32%/64% instead of the real single-instance
    // 16%/32%). Kept anchored to Windqueller alone (the choice the prior pass already made) — the
    // real, disclosed consequence is that Intro's own hit and the first (interrupted) Lance of
    // Qingloong cast (both landing BEFORE the first Windqueller cast) do not receive this buff, even
    // though Intro is a real, sourced trigger for it. A genuine engine limitation (no safe way to
    // cover 2 real anchors without either double-counting or building real per-buff dedup logic),
    // not a data error.
    id: 'jiyan.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Skill:Windqueller' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [
      { stat: 'critRate', value: 16, source: 'self-kit' },
      { stat: 'critDmg', value: 32, source: 'self-kit' },
    ],
    note: "Spectation: casting Windqueller, Liberation Prelude, Finale, OR Intro Tactical Strike grants Crit Rate+16%/Crit DMG+32% for 8s (confirmed exact) — modeled on the Windqueller cast used in her real rotation. Known gap: Intro's own hit and the first (interrupted) Lance of Qingloong cast, both landing before the first Windqueller cast, do NOT receive this buff in this model, even though Intro is also a real trigger for it — see this effect's own verification comment above for why a 2nd anchor isn't safely addable without double-counting.",
  },
  {
    id: 'jiyan.chain.s4',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Emerald Storm: Prelude' },
    timing: { duration: 30 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'heavyDmg', value: 25, stacking: 'refresh', source: 'self-kit' }],
    note: 'Prudence: casting Liberation Prelude or Finale grants the WHOLE TEAM Heavy ATK DMG Bonus +25% for 30s (confirmed exact, team-wide per the audit comment).',
  },
  {
    id: 'jiyan.chain.s5-outro-mult',
    source: SOURCE, kind: 'buff', section: 'Chain',
    // Fixed 2026-09-03: was `trigger:{type:'swap-out'}` with no `timing.duration` — a new variant of
    // the item-12 dead-buff architecture bug (the engine-architecture history (git log)): resolveHitComposedDps.js's
    // statsAtInstant() only reads `passiveBlocks` (trigger.type==='passive') and `buffWindows`
    // (duration != null) — ANY non-passive trigger type with no duration is invisible, not just
    // 'cast' specifically (the shape found on every prior instance this session). Converted to
    // `trigger:{type:'passive'}` + `scopedToBlockId` so it fires and stays scoped to only Discipline's
    // own hit.
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 120, scopedToBlockId: 'jiyan.outro.discipline', source: 'self-kit' }],
    note: "Resolution: Outro Skill Discipline gains an ADDITIONAL +120% DMG Multiplier.",
  },
  {
    // Fixed 2026-09-08 (full-kit audit): was `value:3, stacking:'stacking', maxStacks:15` — the SAME
    // under-firing-anchor bug class found and fixed on Encore's chain.s1/s6 this session.
    // `activeCountAt()` counts CONCURRENTLY-ACTIVE windows opened by real firings of this exact cast
    // trigger, but `Intro:Tactical Strike` only casts ONCE in the real modeled rotation — so this
    // could never exceed 1/15 stacks (3% ATK), never the real 45%. Measured directly: removing the
    // block only changed total damage by ~1.5%, confirming the under-crediting (a real 45% ATK bonus
    // would move total damage far more). The block's own OLD note already said "instantly maxed
    // after casting Tactical Strike" — the real mechanic IS a flat 45% from that one cast, not a
    // per-cast ramp; the per-hit-landed accumulation only matters for a player who casts Intro without
    // already having built stacks another way, which doesn't apply here. Retargeted to a flat value at
    // the real, sourced cap, matching the established fix pattern.
    id: 'jiyan.chain.s5-atk-stack',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Intro:Tactical Strike' },
    timing: { duration: 8 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 45, source: 'self-kit' }],
    note: 'Resolution: ATK+3% per hit landed, stacking up to 15x (=+45% max) for 8s, instantly maxed after casting Tactical Strike — modeled as a flat 45% (the real, documented instant-max value) anchored to the Tactical Strike cast, rather than a stacking mechanic tied to an under-firing whole-cast anchor (see retargeting comment above). The real per-hit-landed stacking/8s-decay conditionality beyond that instant-max isn\'t modeled.',
  },
  {
    id: 'jiyan.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
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
    effects: [{ stat: 'totalMult', value: 240, scopedToBlockId: 'jiyan.forte.emerald-storm-finale', source: 'self-kit' }],
    note: "Fortitude: Momentum stacks (gained on Heavy ATK, Tactical Strike, or Windqueller use, cap 2) that Emerald Storm: Finale consumes entirely on cast, each stack giving Finale's OWN DMG Multiplier +120% (up to +240% at 2 stacks) — modeled at the 2-stack max case per the audit comment's own convention, scoped to the jiyan.forte.emerald-storm-finale damage block. The real per-stack/conditional mechanic (0/120/240 depending on Momentum at cast time) isn't modeled. Finale isn't cast in the real CHARACTER_ROTATIONS (see that block's note), so this scoping has no effect on the standard rotation's total.",
  },
];
