// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/baizhi.blocks.js
// Baizhi converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Baizhi'], RESONANCE_CHAIN_DATA['Baizhi'] (+ its own audit comment,
// which spells out each node's real mechanic), SKILL_MULTIPLIERS['Baizhi'], and
// CHARACTER_ROTATIONS['Baizhi']. No new numbers invented. A healer — most of her
// kit is intentionally non-damage (S1/S3/S4/S5 chain nodes correctly zeroed by the
// audit; Forte Cycle of Life is pure healing, no block).
//
// Cooldown/concertoEnergyGain added 2026-09-06 (completeness pass, same "bring every character
// up to Aalto's reference standard" direction the Aalto/Aemeath/Augusta passes already used) —
// sourced from Data dump/Baizhi/Baizhi.md's own Cooldown/Con. Energy Regen rows (Emergency
// Plan/Momentary Union/Overflowing Frost). Forte Cycle of Life's own Concentration-gauge energy
// regen (Heavy ATK +4, Skill +8, per the dump's Forte table) is a gauge-consumption-conditional
// mechanic, not a per-cast gain — left unmodeled, same as the rest of that gauge (no block exists
// for Forte at all, per the header above), not a fabricated flat add-on to the Heavy ATK/Skill blocks.
//
// Full re-audit 2026-09-08 (requested explicitly, not assuming the prior passes above caught
// everything): found and fixed 3 real issues.
//   1. Her 4-stage Basic Attack combo (SKILL_MULTIPLIERS' own "Destined Promise Stage 1-4" row) had
//      no block at all, and CHARACTER_ROTATIONS['Baizhi'] had no Basic ATK step either — despite the
//      dump's own real "Rotation S0R0"/"S0R3" text explicitly using it ("Basic P1-4"/"Basic P1-3") to
//      build Concentration toward Emergency Plan. Added the block and the rotation step (see
//      characters.js's own fix comment). Also added Mid-air Attack/Dodge Counter as real-but-unused
//      blocks (present in SKILL_MULTIPLIERS, absent from her modeled rotation).
//   2. CHARACTER_ROTATIONS['Baizhi'] had Liberation listed BEFORE Skill — the dump's real rotation
//      casts Skill (Emergency Plan) first, then Liberation. Reordered (see characters.js).
//   3. baizhi.libbuff.euphonia-atk/chain.s2/chain.s6 were all `trigger:{type:'passive'}` with a real
//      `timing.duration` set — every resolver path treats a passive-trigger block as unconditionally,
//      permanently active, completely ignoring `timing.duration` (only a real 'cast'-triggered buff's
//      window history is ever time-limited). This silently made all three PERMANENTLY active for the
//      whole encounter instead of their real, sourced 12s/20s windows following an Emergency Plan
//      cast — an overstatement bug, the mirror image of the stacking-on-passive UNDERstatement bug
//      class found on Augusta/the roster sweep. Re-anchored all three to the real
//      'Skill:Emergency Plan' cast step. Separately, euphonia-atk's target was 'whole-team' but the
//      kit text is explicit and singular ("the Resonator who picks it up") — fixed to 'next-on-field',
//      matching the same fix applied to CHAR_BUFF_TABLE['Baizhi'].libBuffs (was also 'team') and
//      calcTeamStats.js's rotation-timeline builder (didn't handle a 'next'-target libBuff at all).
//      chain.s6 stays whole-team — its own text explicitly broadens to "all nearby characters."
//
// Full REDO re-audit 2026-09-08 (direct user request: "Redo everything... don't assume anything
// already done"): found ONE major, previously-completely-missed bug spanning the whole file.
// CHARACTER_DATA['Baizhi'].statScaling is 'HP' — cross-checked against this dump directly: her
// bestWeapon (Stellar Symphony) is Shorekeeper's own signature (a confirmed HP-scaler sharing the
// exact same weapon), her Substat priority never mentions ATK at all (only "HP% > Flat HP"), and her
// base ATK (213) is even LOWER than Shorekeeper's own 288 "dump stat" ATK — all consistent with a
// genuinely HP%-scaling kit, matching calcTeamStats.js's own `baseStat = scaling==='HP' ? d.baseHp :
// ...` RAW-tier formula. But EVERY damage block in this file used `basis: 'ATK'` — the wrong scaling
// stat entirely, on every single hit, missed across every prior pass on this file (including the
// "full re-audit 2026-09-08" pass immediately above this one). Fixed to `basis: 'HP'` throughout,
// same class of fix already applied to Cartethyia's own HP-scaling kit.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Baizhi';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const BAIZHI_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'baizhi.intro.overflowing-frost',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Overflowing Frost' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus. The dump's own multiplier table labels this row generically
    // "Skill Damage", same convention as Calcharo/Encore/Jianxin/Lingyang/Aalto.
    damage: { hits: parseSkillMultiplierHits('79.53%'), category: 'skillDmg' , basis: 'HP' },
    note: 'Row also lists "+ heal", not modeled (no fabricated non-DPS number).',
    // concertoEnergyGain added 2026-09-06 (completeness pass, same "consider energy regen" direction
    // as Aalto's): Data dump/Baizhi/Baizhi.md's own "Con. Energy Regen: 10" row for Intro:Overflowing Frost.
    concertoEnergyGain: 10,
  },
  {
    id: 'baizhi.liberation.momentary-union',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Momentary Union' },
    // cooldown added 2026-09-06 (completeness pass): Data dump/Baizhi/Baizhi.md's own "Cooldown: 25s" row.
    timing: { cooldown: 25 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('4.07%×4'), category: 'libDmg' , basis: 'HP' },
    note: "Spawns 4 Remnant Entities (4.07% each) that auto-attack and heal every 2.5s afterward — this block models one representative hit-set (the initial cast), not the sustained repeated-tick damage over the entities' full lifetime (a DOT-like mechanic beyond this schema's single-cast hit-list model). Team heal component not modeled.",
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Baizhi/Baizhi.md's own
    // "Con. Energy Regen: 20" row for Momentary Union. Its "Res. Energy Cost: 175" row is a
    // Liberation-gauge cost, not a gain — no matching schema field, not modeled (no fabricated cost mechanic).
    concertoEnergyGain: 20,
  },
  {
    id: 'baizhi.skill.emergency-plan',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Emergency Plan' },
    // cooldown added 2026-09-06 (completeness pass): Data dump/Baizhi/Baizhi.md's own "Cooldown: 16s" row.
    timing: { cooldown: 16 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('15.94%'), category: 'skillDmg' , basis: 'HP' },
    note: 'Row also lists "+ healing", not modeled.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Baizhi/Baizhi.md's own
    // "Con. Energy Regen: 10" row for Emergency Plan.
    concertoEnergyGain: 10,
  },
  {
    id: 'baizhi.heavy.destined-promise-channel',
    source: SOURCE, kind: 'damage', section: 'HeavyATK',
    trigger: { type: 'cast', on: 'Heavy ATK:Destined Promise (channel)' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('48.86%'), category: 'heavyDmg' , basis: 'HP' },
    note: 'Source value is 48.86%/s (a continuous channel, not a discrete hit) — modeled as one representative 1-second tick; real total scales with channel duration, not captured by this schema\'s single-cast hit-list model.',
  },
  // Added 2026-09-08 (full re-audit): the dump's own real "Rotation S0R0" text explicitly uses her
  // 4-stage Basic Attack combo ("Basic P1-4") to build Concentration toward Emergency Plan — a real,
  // necessary rotation step, not a skippable filler, and SKILL_MULTIPLIERS['Baizhi'] already carried
  // this exact row (Stage 1-4: 65.48% / 78.57% / 13.10%×7 / 78.57%). Previously had no block at all,
  // matching CHARACTER_ROTATIONS['Baizhi'] having no Basic ATK step either (also fixed this pass).
  {
    id: 'baizhi.basic.destined-promise',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: "Basic ATK:Destined Promise Stage 1-4" },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('65.48% + 78.57% + 13.10%×7 + 78.57%'), category: 'basicDmg', basis: 'HP' },
    note: "Standard 4-stage combo, builds 1 Concentration/hit toward the 4-stack cap Emergency Plan consumes. Now fires in the modeled rotation (CHARACTER_ROTATIONS['Baizhi'] gained a matching Basic ATK step this same pass).",
  },
  // Added 2026-09-08 (full re-audit): Mid-air Attack and Dodge Counter both carry real, sourced
  // multiplier rows in SKILL_MULTIPLIERS['Baizhi'] but neither appears in her CHARACTER_ROTATIONS
  // step list (her real rotation's own Basic Attack combo already covers Concentration generation) —
  // present and sourced but inert, same "documented gap" status as other characters' own unused-but-
  // real moves (e.g. Aalto/Augusta's own inert Dodge Counter/Mid-air blocks).
  {
    id: 'baizhi.midair.attack',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Mid-air:Attack' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('78.89%'), category: 'basicDmg', basis: 'HP' },
    note: "Plunging attack, consumes Stamina. Not in CHARACTER_ROTATIONS — real move, but her real optimal rotation's Basic Attack combo doesn't use it.",
  },
  {
    id: 'baizhi.dodge.counter',
    source: SOURCE, kind: 'damage', section: 'BasicATK',
    trigger: { type: 'cast', on: 'Dodge Counter:Standard' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('178.65%'), category: 'basicDmg', basis: 'HP' },
    note: "Post-Dodge Basic Attack. Not in CHARACTER_ROTATIONS — real move, but confirmed unused in her real modeled rotation per the dump.",
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'baizhi.outro.rejuvinating-flow',
    source: SOURCE, kind: 'buff', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: { duration: 6 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'amplify', value: 15, stacking: 'refresh', source: 'teammate-ally-action' }],
    note: 'Row also lists a 30s/3s-tick heal, not modeled. The 15% Amplify ticks/refreshes on heal per CHAR_BUFF_TABLE\'s own note — modeled as a flat 6s duration, refresh stacking, since the refresh-condition ("on heal") isn\'t a trigger this schema can key off yet.',
  },
  {
    // Fixed 2026-09-08 (full re-audit) — TWO real bugs here:
    // 1. target.scope was 'whole-team', but Data dump/Baizhi/Baizhi.md's own Inherent Skill text is
    //    explicit and singular: "the Resonator who picks it up gets ATK+15% for 20s" — ONE resonator
    //    (the DPS she swaps to, per the rotation notes' own "swap, collect Euphonia with your DPS"
    //    choreography), never the whole team. This was a real over-crediting bug shared with
    //    CHAR_BUFF_TABLE['Baizhi'].libBuffs (also fixed this pass, was target:'team') — every teammate
    //    was getting +15% ATK instead of just the one who collects Euphonia. Changed to 'next-on-field',
    //    the same single-recipient scope an Outro buff uses (next-on-field scope only depends on swap
    //    order, not on trigger.type — see resolveSimulatedTeamRotation.js's isImmediateNext(), so this
    //    is safe to combine with a 'cast' trigger below).
    // 2. trigger was `{type:'passive'}` with `timing.duration:20` — every resolver path (see
    //    resolveHitComposedDps.js's `passiveBlocks` loop) applies a passive-trigger block unconditionally
    //    at multiplier 1, COMPLETELY IGNORING `timing.duration` — so this buff was silently PERMANENTLY
    //    active for the whole encounter instead of a real 20s window following Euphonia pickup, a real
    //    overstatement bug (the opposite direction from the stacking-on-passive bug class found on
    //    Augusta/roster sweep, but the same root confusion: 'passive' means "always on," not "on with a
    //    timer"). Euphonia's field spawns on Emergency Plan cast and is picked up "shortly after" per the
    //    dump's own rotation choreography — anchoring the window to that real, existing
    //    CHARACTER_ROTATIONS step ('Skill:Emergency Plan') turns this into a genuine, respected
    //    duration-windowed buff via buildBlockWindows() instead of a silently-permanent one.
    id: 'baizhi.libbuff.euphonia-atk',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'cast', on: 'Skill:Emergency Plan' },
    timing: { duration: 20 },
    target: { scope: 'next-on-field' },
    effects: [{ stat: 'atkPct', value: 15, stacking: 'refresh', source: 'self-kit' }],
    note: 'Inherent Skill: the single Resonator who picks up Euphonia gets ATK+15% for 20s — anchored to the Emergency Plan cast that spawns the field (real pickup happens shortly after, per the rotation notes), applied to the next-on-field recipient rather than the whole team. See fix comment above.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — S1/S3/S4/S5 correctly zeroed by its own
  //    audit comment: pure utility/HP%-scaling/healing effects with no DPS component this schema can
  //    represent) ──
  {
    // Fixed 2026-09-08 (full re-audit): trigger was `{type:'passive'}` with `timing.duration:12` — same
    // dead-duration bug as baizhi.libbuff.euphonia-atk above (passive-trigger blocks ignore
    // timing.duration entirely, applying unconditionally instead of for a real 12s window). Real
    // trigger: Emergency Plan at 4 Concentration — her real modeled rotation always casts Emergency
    // Plan right after the 4-stage Basic Attack combo (added this same pass), which is exactly what
    // builds Concentration to 4, so anchoring to that same cast is not an approximation here, it's the
    // real trigger condition as it plays out in the modeled rotation.
    id: 'baizhi.chain.s2',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Skill:Emergency Plan' },
    timing: { duration: 12 },
    target: { scope: 'self' },
    effects: [{ stat: 'elemDmg', value: 15, source: 'self-kit' }],
    note: 'Real mechanic per RESONANCE_CHAIN_DATA\'s own audit comment: Emergency Plan at 4 Concentration grants Glacio DMG Bonus+15% (+ Healing+15%, not modeled) for 12s — now a real cast-anchored window (see fix comment above) instead of a silently-permanent passive effect.',
  },
  {
    // Fixed 2026-09-08 (full re-audit): same dead-duration bug as chain.s2/euphonia-atk above — was
    // `{type:'passive'}` with `timing.duration:20`, silently permanent instead of a real 20s window.
    // Same Euphonia-pickup trigger as baizhi.libbuff.euphonia-atk, so anchored to the same Emergency
    // Plan cast. Scope stays whole-team (unlike euphonia-atk's own fix above) — S6's own text is
    // explicit: "Glacio DMG Bonus+12% to all nearby characters," genuinely broadening this specific
    // effect to the team, unlike the base Inherent Skill's single-recipient ATK buff.
    id: 'baizhi.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Skill:Emergency Plan' },
    timing: { duration: 20 },
    target: { scope: 'whole-team' },
    condition: { element: 'glacio' },
    effects: [{ stat: 'elemDmg', value: 12, source: 'self-kit' }],
    note: 'Euphonia pickup grants team Glacio DMG Bonus+12% for 20s — now a real cast-anchored window (see fix comment above) instead of a silently-permanent passive effect.',
  },
];
