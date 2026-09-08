// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/chixia.blocks.js
// Chixia converted to TriggerBlocks. Sourced from characters.js's already-audited
// CHAR_BUFF_TABLE['Chixia'], RESONANCE_CHAIN_DATA['Chixia'] (+ its own detailed
// 2026-09-01 re-audit comment, read directly for each node's real mechanic),
// SKILL_MULTIPLIERS['Chixia'], and CHARACTER_ROTATIONS['Chixia']. No new numbers
// invented. S1/S2/S4 correctly have NO block — all 3 are confirmed pure
// resource/utility effects with zero DPS component per the audit's own re-zeroing.
//
// Cooldown/concertoEnergyGain added 2026-09-06 (completeness pass, same "bring every character up
// to Aalto's reference standard" direction as the prior passes) — sourced from Data dump/Chixia/
// Chixia.md's own Cooldown/Concerto Regen rows (Grand Entrance, Whizzing Fight Spirit, DAKA DAKA!,
// Blazing Flames). Whizzing Fight Spirit has 2 real charges (same class of mechanic as Changli's
// True Sight: Capture), but her modeled rotation only casts it once, so — unlike Changli's case —
// adding its real cooldown here doesn't risk misrepresenting a legitimate banked-charge double-use;
// safe to model directly.
//
// Completeness pass 2026-09-07 (continuing the same character-by-character pass): Minor Fortes
// (Fusion DMG+12%, ATK%+12%) had no block at all. Also found a real, significant gap in her
// Inherent Skill Scorching Magazine — "Max Thermobaric Bullets +10; Boom Boom DMG +50%" — only the
// resource-cap half is utility-only; the +50% DMG half is a real, sourced, scoped DMG Multiplier on
// her single hardest-hitting move (chixia.forte.boom-boom, 437.39% base) that had no block at all.
//
// Full re-audit 2026-09-08: the dump's own Burst Combo prose (not just CHARACTER_ROTATIONS' own
// 6-step abstraction of it) is explicit that DAKA DAKA! -> Boom Boom is cast TWICE per real cycle
// ("...Basic Attack (fires Boom Boom...) -> Ultimate (...) -> another full Forte channel into Boom
// Boom -> Outro") — only the first of the two was ever modeled, the same bug class already found and
// fixed on Changli's own 2x Skill/Forte Heavy gap. Added chixia.forte.daka-daka-2/chixia.forte.boom-
// boom-2, riding the same existing triggers rather than new rotation steps (same technique already
// used elsewhere in this file/Changli's). chixia.inherent.scorching-magazine-mult's own scopedToBlockId
// widened to cover both real Boom Boom casts. Also corrected a misleading note on chain.s5: the dump's
// own "ATK is ADDITIONALLY increased by 30%" wording means S5's bonus stacks WITH (not duplicates) the
// base Inherent Skill's own max-stack ATK bonus — the two blocks already added correctly together, the
// prior note's "known accepted imprecision" framing was simply a misreading, not a real issue.
// ═══════════════════════════════════════════════════════════════════════════════

import { parseSkillMultiplierHits } from '../math/hitParser.js';

const SOURCE = 'Chixia';

/** @type {import('../schema/block.schema.js').TriggerBlock[]} */
export const CHIXIA_BLOCKS = [
  // ── Damage blocks (from SKILL_MULTIPLIERS) ──
  {
    id: 'chixia.intro.grand-entrance',
    source: SOURCE, kind: 'damage', section: 'Intro',
    trigger: { type: 'cast', on: 'Intro:Grand Entrance' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized. The dump's own
    // multiplier table labels this row generically "Skill Damage", same convention as Calcharo/Encore/
    // Jianxin/Lingyang/Aalto/Baizhi.
    damage: { hits: parseSkillMultiplierHits('49.21%×2 + 24.61%×4'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Builds Thermobaric Bullets.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Chixia/Chixia.md's own
    // "Con. Energy Regen 10" row for Intro Skill Grand Entrance.
    concertoEnergyGain: 10,
  },
  {
    id: 'chixia.skill.whizzing-fight-spirit',
    source: SOURCE, kind: 'damage', section: 'Skill',
    trigger: { type: 'cast', on: 'Skill:Whizzing Fight Spirit' },
    // cooldown added 2026-09-06 (completeness pass): Data dump/Chixia/Chixia.md's own "Cooldown: 9s"
    // row. Unlike Changli's True Sight: Capture, her modeled rotation only casts this ONCE
    // (CHARACTER_ROTATIONS['Chixia'] has a single 'Skill' step) despite the kit having 2 charges —
    // no charge-banking double-use to misrepresent here, so a real cooldown value is safe to model.
    timing: { cooldown: 9 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('31.81%×8'), category: 'skillDmg' , basis: 'ATK' },
    note: 'Held to enter DAKA DAKA! (2 initial charges).',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Chixia/Chixia.md's own
    // "Con. Energy Regen 10" row for Whizzing Fight Spirit.
    concertoEnergyGain: 10,
  },
  {
    id: 'chixia.forte.daka-daka',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heroic Bullets: DAKA DAKA!' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // Row is '19.89% per Thermobaric Bullet' — CHARACTER_ROTATIONS' own note says this step spends
    // all 30 Thermobaric Bullets in one go before auto-triggering Boom Boom, so 30 hits are used
    // (same "use the max-stack/full-consumption value" convention as this table's own selfBuff entry).
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus on her single BIGGEST damage source (30 hits at 19.89% each,
    // the majority of her real 47.8% Skill share). The kit text is explicit: "continuously consumes
    // Thermobaric Bullets to attack (Resonance Skill DMG)."
    damage: { hits: Array.from({ length: 30 }, () => ({ atkPct: 19.89 })), category: 'skillDmg', basis: 'ATK' },
    note: 'Continuous-fire state; spending all 30 Thermobaric Bullets in one DAKA DAKA! auto-triggers Boom Boom.',
    // concertoEnergyGain added 2026-09-06 (completeness pass): Data dump/Chixia/Chixia.md's own two
    // separate rows — "DAKA DAKA! Con. Energy Regen: 10" (entering/using the state) and "Thermobaric
    // Bullet Con. Energy Regen: 0.5" (per bullet consumed while firing) — summed as 10 + 30×0.5 = 25,
    // matching how this block's own damage.hits already combine all 30 real bullet-consumption hits
    // into one block rather than 30 separate ones.
    concertoEnergyGain: 25,
  },
  // Added 2026-09-08 (full re-audit): the dump's own Burst Combo text was previously only read as far
  // as CHARACTER_ROTATIONS' own 6-step abstraction — but its full prose is explicit that the Forte
  // channel (DAKA DAKA! -> Boom Boom) happens TWICE per real burst cycle: "...Basic Attack (fires Boom
  // Boom...) -> Ultimate (...) -> another full Forte channel into Boom Boom -> Outro." Only the FIRST
  // of the two was ever modeled — a silent 2nd-cast gap on her single BIGGEST damage source (DAKA
  // DAKA!'s 30-hit chain) and her single hardest-hitting move (Boom Boom, 437.39%), the same bug
  // class already found and fixed on Changli's own 2x-cast Skill/Forte Heavy gap. Rides the same
  // existing 'Forte:Heroic Bullets: DAKA DAKA!' trigger rather than a new CHARACTER_ROTATIONS step
  // (same technique already established in this file/Changli's for exactly this situation — adding a
  // new step would inflate the sourced ~8.83s rotation time with no per-move duration data to correct
  // it).
  {
    id: 'chixia.forte.daka-daka-2',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heroic Bullets: DAKA DAKA!' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: Array.from({ length: 30 }, () => ({ atkPct: 19.89 })), category: 'skillDmg', basis: 'ATK' },
    note: '2nd of 2 real DAKA DAKA! channels per rotation (the post-Ultimate 2nd Forte channel per the dump\'s own Burst Combo text) — see chixia.forte.daka-daka for the 1st.',
    concertoEnergyGain: 25,
  },
  {
    id: 'chixia.forte.boom-boom',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heroic Bullets: Boom Boom' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Resonance Skill DMG Bonus on her single hardest-hitting move (437.39%). The kit text is
    // explicit: "casts Boom Boom (Resonance Skill DMG) instead" — NOT Basic Attack DMG, despite being
    // triggered by pressing the Basic Attack button; the OTHER exit path (below 30 bullets) is the one
    // explicitly labeled "Basic Attack IV (Basic Attack DMG)", but that path never fires in her real
    // modeled rotation (matches the dump's own Damage Profile: Basic 0%).
    damage: { hits: parseSkillMultiplierHits('437.39%'), category: 'skillDmg' , basis: 'ATK' },
    note: '1st of 2 real Boom Boom casts per rotation (the one BEFORE Ultimate) — see chixia.forte.boom-boom-2 for the 2nd (post-Ultimate) cast. Auto-triggered when 30 Thermobaric Bullets are spent in one DAKA DAKA!, exits DAKA DAKA!. Always Crits (S1), not modeled (no guaranteed-crit flag wired for this proc source).',
  },
  {
    id: 'chixia.forte.boom-boom-2',
    source: SOURCE, kind: 'damage', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heroic Bullets: Boom Boom' },
    timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('437.39%'), category: 'skillDmg' , basis: 'ATK' },
    note: '2nd of 2 real Boom Boom casts per rotation (the post-Ultimate cast, from the dump\'s own "another full Forte channel into Boom Boom") — also always Crits (S1), not modeled.',
  },
  {
    id: 'chixia.liberation.blazing-flames',
    source: SOURCE, kind: 'damage', section: 'Liberation',
    trigger: { type: 'cast', on: 'Liberation:Blazing Flames' },
    // cooldown added 2026-09-06 (completeness pass): Data dump/Chixia/Chixia.md's own
    // "Cooldown: 20s" row.
    timing: { cooldown: 20 }, target: { scope: 'self' }, effects: [],
    damage: { hits: parseSkillMultiplierHits('954.29% + 57.84%×11'), category: 'libDmg' , basis: 'ATK' },
    // concertoEnergyGain added 2026-09-06 (completeness pass): same row's "Con. Energy Regen 20".
    // Its "Res. Energy Cost: 150" row is a Liberation-gauge cost, not a gain — no matching schema
    // field, not modeled, same treatment as every other character's own Liberation resource cost.
    concertoEnergyGain: 20,
  },
  {
    id: 'chixia.outro.leaping-flames',
    source: SOURCE, kind: 'damage', section: 'Outro',
    trigger: { type: 'swap-out' },
    timing: {}, target: { scope: 'self' }, effects: [],
    // category fixed 2026-09-03 (Phase A audit, REMAINING_WORK.md 1c): was uncategorized, silently
    // rejecting Outro DMG Bonus on a real 9.6% (29,494) damage share. Her own kit text is pure
    // damage — "a shock wave... hitting enemies in range," no team buff — same outroDmg shape already
    // fixed for Rover: Havoc's Soundweaver/Calcharo's Shadowy Raid/Encore's Thermal Field.
    damage: { hits: parseSkillMultiplierHits('530%') , category: 'outroDmg', basis: 'ATK' },
  },

  // ── Buff blocks (from CHAR_BUFF_TABLE) ──
  {
    id: 'chixia.selfbuff.numbingly-spicy',
    source: SOURCE, kind: 'buff', section: 'Forte',
    trigger: { type: 'cast', on: 'Forte:Heroic Bullets: DAKA DAKA!' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 1, stacking: 'stacking', maxStacks: 30, source: 'self-kit' }],
    note: 'Inherent Skill Numbingly Spicy!: ATK +1% per Thermobaric Bullet hit during DAKA DAKA!, stacking up to 30x (30% ATK at max stacks), 10s per-stack duration — modeled as per-stack stacking (matching the real mechanic) rather than a flat 30%, per this table\'s own comment convention.',
  },
  // Added 2026-09-07 (completeness pass): Inherent Skill Scorching Magazine's real, sourced DMG
  // Multiplier half — "Boom Boom DMG +50%" — had no block at all despite being a significant bonus
  // on her single hardest-hitting move. Scoped via scopedToBlockId to chixia.forte.boom-boom only.
  // Widened 2026-09-08 (full re-audit) to also cover chixia.forte.boom-boom-2, the real 2nd Boom Boom
  // cast added this same pass — the Inherent Skill's own +50% applies to EVERY Boom Boom cast, not
  // just the first.
  {
    id: 'chixia.inherent.scorching-magazine-mult',
    source: SOURCE, kind: 'buff', section: 'Forte',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [{ stat: 'totalMult', value: 50, scopedToBlockId: ['chixia.forte.boom-boom', 'chixia.forte.boom-boom-2'], source: 'self-kit' }],
    note: 'Inherent Skill Scorching Magazine (DMG half): Boom Boom DMG Multiplier +50% — scoped to chixia.forte.boom-boom only. See chixia.inherent.scorching-magazine-cap for the Max Thermobaric Bullets +10 half.',
  },
  // Added 2026-09-07 (completeness pass): the OTHER real half of Scorching Magazine — Max
  // Thermobaric Bullets +10 (50->60 cap) — a pure resource-cap increase, no DPS stat to hold. Boom
  // Boom's own trigger threshold (30 bullets fired) is unaffected by the cap raise, per the dump's
  // own text ("if 30 Thermobaric Bullets have been fired... casts Boom Boom"), so this doesn't change
  // any already-modeled block's behavior — kept as a separate documented-inert block for completeness.
  {
    id: 'chixia.inherent.scorching-magazine-cap',
    source: SOURCE, kind: 'utility', section: 'Forte',
    trigger: { type: 'passive' }, timing: {}, target: { scope: 'self' }, effects: [],
    note: 'Inherent Skill Scorching Magazine (resource half): Max Thermobaric Bullets +10 (cap 50->60). Pure resource-cap increase, no DPS component — Boom Boom\'s own 30-bullet trigger threshold is unaffected by the raised cap.',
  },
  // Added 2026-09-07 (completeness pass): "Minor Fortes: Fusion DMG+12%, ATK%+12%" — a permanent,
  // always-on passive stat bonus unlocked via Forte-tree ascension, previously had no block anywhere
  // in this file, same class of gap as every other converted character's own missing Minor Fortes.
  {
    id: 'chixia.buff.minor-fortes',
    source: SOURCE, kind: 'buff', section: 'Buff',
    trigger: { type: 'passive' },
    timing: {}, target: { scope: 'self' },
    effects: [
      { stat: 'elemDmg', value: 12, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ],
    note: 'Minor Fortes: Fusion DMG+12%, ATK%+12% (Data dump/Chixia/Chixia.md). Unconditional, always active.',
  },

  // ── Resonance Chain blocks (from RESONANCE_CHAIN_DATA — see its own 2026-09-01 audit comment for
  //    each node's real mechanic; S1/S2/S4 correctly have NO block — pure resource/utility with zero
  //    DPS component, re-zeroed from earlier undocumented-placeholder values in that same audit) ──
  {
    id: 'chixia.chain.s3',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Liberation:Blazing Flames' },
    timing: {}, target: { scope: 'self' },
    condition: { requiresStance: 'target below 50% HP' },
    effects: [{ stat: 'libDmg', value: 40, source: 'self-kit' }],
    note: 'Blazing Flames DMG +40% against targets below 50% HP (confirmed exact, conditional per the audit comment) — cast-scoped to the Liberation it modifies.',
  },
  {
    // Note corrected 2026-09-08 (full re-audit): the prior note here claimed this was "the SAME
    // Inherent Skill already modeled as chixia.selfbuff.numbingly-spicy... not a separate additional
    // bonus" and that both blocks firing together would be an unintended double-count — but the
    // dump's own kit text is explicit: "At Numbingly Spicy! max stacks, ATK is ADDITIONALLY increased
    // by 30%." "Additionally" means on top of the base Inherent Skill's own +30% (30 stacks × 1%), not
    // a restatement of the same number — so both blocks contributing together (60% total ATK at S5 +
    // max stacks) is the CORRECT, intended real mechanic, not a bug to flag or fix. (The one real,
    // still-accepted imprecision here is unrelated: this block is unconditional on every DAKA DAKA!
    // cast rather than gated specifically to "stacks already at 30" — harmless in practice since
    // CHARACTER_ROTATIONS['Chixia'] only ever casts DAKA DAKA! once, and that one cast is the one that
    // reaches max stacks per its own note.)
    id: 'chixia.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Heroic Bullets: DAKA DAKA!' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 30, source: 'self-kit' }],
    note: "ATK is ADDITIONALLY increased +30% at max Numbingly Spicy! stacks (confirmed exact, conditional per the audit comment) — a real, separate bonus stacking additively on top of the base Inherent Skill's own +30% max-stack ATK (chixia.selfbuff.numbingly-spicy), per the dump's own explicit 'additionally increased' wording.",
  },
  // S1/S2/S4 correctly have NO block — Boom Boom always-Crit (utility, no %-stat fits), Liberation
  // kill-refund of Resonance Energy (utility), and Liberation Thermobaric Bullets grant + Skill CD
  // reset (utility) respectively — all zero DPS component, per the audit's own re-zeroing.
  {
    id: 'chixia.chain.s6',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Heroic Bullets: Boom Boom' },
    timing: { duration: 15 },
    target: { scope: 'whole-team' },
    effects: [{ stat: 'basicDmg', value: 25, stacking: 'refresh', source: 'self-kit' }],
    note: 'Boom Boom grants the team Basic ATK DMG Bonus +25% for 15s (confirmed exact team buff per the audit comment).',
  },
];
