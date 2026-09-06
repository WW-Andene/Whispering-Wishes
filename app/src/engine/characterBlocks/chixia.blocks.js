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
    note: 'Auto-triggered when 30 Thermobaric Bullets are spent in one DAKA DAKA!, exits DAKA DAKA!. Always Crits (S1), not modeled (no guaranteed-crit flag wired for this proc source).',
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
    id: 'chixia.chain.s5',
    source: SOURCE, kind: 'buff', section: 'Chain',
    trigger: { type: 'cast', on: 'Forte:Heroic Bullets: DAKA DAKA!' },
    timing: { duration: 10 },
    target: { scope: 'self' },
    effects: [{ stat: 'atkPct', value: 30, source: 'self-kit' }],
    note: "ATK +30% at max Numbingly Spicy! stacks (confirmed exact, conditional per the audit comment) — this is the SAME Inherent Skill already modeled as chixia.selfbuff.numbingly-spicy above (S5 is what unlocks/confirms the max-stack value, not a separate additional bonus); both blocks firing together on the same DAKA DAKA! cast would double-count the ATK bonus, a known accepted imprecision (same class as Buling's S6/libBuff overlap), not fixed here.",
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
