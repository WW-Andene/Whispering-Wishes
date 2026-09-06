// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/echoFarmingData.js
// Echo farming probability/yield constants — backs the Planner tab's Echo Farming
// Calculator. Every number here is sourced in Data dump/Echoes/ (Probability.md,
// Data Bank.md, Drop Rates.md), not guessed — see each table's own comment for which
// file and section it comes from, and how confident that source is.
// ═══════════════════════════════════════════════════════════════════════════════

// Main stat roll probability per Echo cost tier — empirical, from the wiki's Echo/Stats
// "Detailed mainstat values distribution" (sample sizes: 1414 rolls for 1-Cost, 1758 for
// 3-Cost, 1829 for 4-Cost). This is NOT an official Kuro disclosure like the substat table
// below — it's a large community sample, so treat it as a strong estimate, not an exact rate.
// See Data dump/Echoes/Probability.md.
export const ECHO_MAIN_STAT_CHANCE = {
  1: { 'HP%': 33.33, 'ATK%': 33.33, 'DEF%': 33.33 },
  3: {
    'Electro DMG': 13.94, 'Glacio DMG': 13.65, 'Fusion DMG': 12.86, 'Aero DMG': 12.86,
    'Havoc DMG': 11.83, 'Spectro DMG': 11.38, 'Energy Regen': 6.09,
    'ATK%': 5.92, 'DEF%': 5.86, 'HP%': 5.63,
  },
  4: {
    'Crit Rate': 20.17, 'Crit DMG': 19.79, 'ATK%': 17.28, 'HP%': 16.51,
    'DEF%': 14.71, 'Healing Bonus': 11.54,
  },
};

// The wiki describes Echoes as having a "Primary" (random) and a "Secondary" (predetermined,
// i.e. fixed per specific Echo — not re-rolled per drop) main stat. This app has no real
// per-Echo secondary-mainstat table (that would require sourcing ~100 individual Echoes'
// fixed second stat, which nothing in Data dump/ currently covers), so the calculator below
// treats "Secondary Stat" as an independent roll from this SAME distribution as an explicit,
// labeled approximation — never claim it's the real per-Echo mechanic.
export const ECHO_SECONDARY_STAT_IS_APPROXIMATED = true;

// Substat TYPE pick chance — officially disclosed by Kuro (KR gaming-disclosure law). Uniform
// across the 13-substat pool, shrinking as substats already on the Echo are removed from it.
// Index 0 = chance for the 1st substat slot (pool size 13), index 4 = chance for the 5th slot
// (pool size 9). See Data dump/Echoes/Probability.md § "Detailed substat values distribution".
export const ECHO_SUBSTAT_POOL_SIZE_AT_SLOT = [13, 12, 11, 10, 9];

// All 13 real substat names, matching calcEngine.js's ECHO_SUBSTAT_GRADES keys exactly (that
// file holds the VALUE at each grade; this file holds the CHANCE of landing each grade).
export const ALL_ECHO_SUBSTATS = [
  'ATK', 'HP', 'DEF', 'ATK%', 'HP%', 'DEF%', 'Energy Regen', 'Crit Rate', 'Crit DMG',
  'Basic ATK DMG', 'Heavy ATK DMG', 'Resonance Skill DMG', 'Resonance Liberation DMG',
];

// Per-grade roll chance (%), index-aligned with calcEngine.js's ECHO_SUBSTAT_GRADES[stat]
// array (grade 1 = index 0). Three distinct curves, all officially disclosed:
// - ATK/DEF (flat, 4 grades) each have their own curve.
// - Crit Rate/Crit DMG (8 grades) share a front-loaded curve.
// - every other 8-grade substat (HP, %-stats, Energy Regen, the 4 DMG Bonus substats) shares
//   one bell-shaped curve.
// See Data dump/Echoes/Probability.md § "Per-substat value/grade roll chances".
export const ECHO_SUBSTAT_GRADE_CHANCE = {
  'ATK': [6.7961, 52.4272, 37.8641, 2.9126],
  'DEF': [14.5631, 44.6602, 32.0388, 8.7379],
  'Crit Rate': [23.3333, 23.3333, 23.3333, 8.0000, 8.0000, 8.0000, 3.0000, 3.0000],
  'Crit DMG': [23.3333, 23.3333, 23.3333, 8.0000, 8.0000, 8.0000, 3.0000, 3.0000],
};
const SHARED_8_GRADE_CHANCE = [6.7961, 7.7670, 20.3883, 24.2718, 17.4757, 14.5631, 5.8252, 2.9126];
['HP', 'ATK%', 'HP%', 'DEF%', 'Energy Regen', 'Basic ATK DMG', 'Heavy ATK DMG', 'Resonance Skill DMG', 'Resonance Liberation DMG']
  .forEach(stat => { ECHO_SUBSTAT_GRADE_CHANCE[stat] = SHARED_8_GRADE_CHANCE; });

// Plateau tiers — same 4-band split as calcEngine.js's getSubstatTier (grades 1-2 = Low,
// 3-4 = Medium, 5-6 = High, 7-8 = Max; the 4-grade flat ATK/DEF stats use bands of 1). Given a
// substat and a MINIMUM accepted tier, returns the probability of rolling that tier or better.
export const PLATEAU_TIERS = ['Low', 'Medium', 'High', 'Max'];
export function getPlateauChance(stat, minTierIdx) {
  const chances = ECHO_SUBSTAT_GRADE_CHANCE[stat];
  if (!chances) return 0;
  const n = chances.length;
  const bandSize = n / 4;
  const minGradeIdx = Math.floor(minTierIdx * bandSize);
  return chances.slice(minGradeIdx).reduce((s, c) => s + c, 0);
}

// Tacet Field cost — user-confirmed: Echoes never cost Waveplate except at Tacet Fields.
// See Data dump/Echoes/Data Bank.md.
export const TACET_FIELD_WAVEPLATE_COST = 60;

// ── Data Bank Level table (Data dump/Echoes/Data Bank.md) — rarity split changes drastically
// by level and swings back down for lower rarities as they age out of the pool (e.g. 4★ peaks
// at 80% around level 19-20, then drops to 0% at endgame once the pool becomes 100% 5★), so a
// target's real rarity chance genuinely depends on which level the player is farming at — it
// must be an input, never assumed. rarity: { 2, 3, 4, 5 } percentages sum to 100 at each level
// (blank cells in the source table are 0 — that rarity isn't in the pool yet/anymore).
export const DATA_BANK_LEVELS = [
  { level: 0, baseDropRate: 6, cost4Enhanced: 20, cost1n3Enhanced: 0, rarity: { 2: 100, 3: 0, 4: 0, 5: 0 } },
  { level: 1, baseDropRate: 10, cost4Enhanced: 20, cost1n3Enhanced: 0, rarity: { 2: 100, 3: 0, 4: 0, 5: 0 } },
  { level: 2, baseDropRate: 10, cost4Enhanced: 20, cost1n3Enhanced: 0, rarity: { 2: 100, 3: 0, 4: 0, 5: 0 } },
  { level: 3, baseDropRate: 10, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 100, 3: 0, 4: 0, 5: 0 } },
  { level: 4, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 100, 3: 0, 4: 0, 5: 0 } },
  { level: 5, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 70, 3: 30, 4: 0, 5: 0 } },
  { level: 6, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 50, 3: 50, 4: 0, 5: 0 } },
  { level: 7, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 20, 3: 80, 4: 0, 5: 0 } },
  { level: 8, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 70, 4: 30, 5: 0 } },
  { level: 9, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 70, 4: 30, 5: 0 } },
  { level: 10, baseDropRate: 20, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 70, 4: 30, 5: 0 } },
  { level: 11, baseDropRate: 20, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 50, 4: 50, 5: 0 } },
  { level: 12, baseDropRate: 20, cost4Enhanced: 50, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 50, 4: 50, 5: 0 } },
  { level: 13, baseDropRate: 20, cost4Enhanced: 50, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 25, 4: 75, 5: 0 } },
  { level: 14, baseDropRate: 20, cost4Enhanced: 60, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 25, 4: 75, 5: 0 } },
  { level: 15, baseDropRate: 20, cost4Enhanced: 60, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 70, 5: 30 } },
  { level: 16, baseDropRate: 20, cost4Enhanced: 80, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 70, 5: 30 } },
  { level: 17, baseDropRate: 20, cost4Enhanced: 80, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 50, 5: 50 } },
  { level: 18, baseDropRate: 20, cost4Enhanced: 90, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 50, 5: 50 } },
  { level: 19, baseDropRate: 20, cost4Enhanced: 90, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 20, 5: 80 } },
  { level: 20, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 20, 5: 80 } },
  { level: 21, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 22, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 23, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 24, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 25, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 26, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 27, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 100, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 28, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 100, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 29, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 100, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 30, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 100, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
];
export const MAX_DATA_BANK_LEVEL = 30;

// Endgame (max Data Bank level / Union Level 70, SOL3 Phase 8) average yield per Tacet Field
// run — the community-sampled row with by far the largest sample size (1697 runs) in
// Data dump/Echoes/Drop Rates.md's Tacet Field table. Used as the default farming-rate
// assumption; there is no published breakdown of drop rate BY SONATA SET or BY COST TIER
// (only by star Rarity, which the wiki notes is independent of cost) — so this treats any
// Echo the run drops as a candidate instance, which is optimistic if the target set/cost is
// actually rarer than average. Flagged in the calculator's own UI, not hidden.
export const TACET_FIELD_ENDGAME_YIELD = {
  runsSampled: 1697,
  avgEchoesPerRun: 4.30,
  avgShellCreditPerRun: 5250,
};

// ── Echo Leveling — Data dump/Echoes/Echo Leveling.md (wiki's "Echo Leveling Table",
// Refunding section excluded per request). Cumulative EXP needed to reach each level from 0,
// per rarity — max level differs by rarity (2★→10, 3★→15, 4★→20, 5★→25, matching Data
// Bank.md's own rarity/max-level table). Index = level, value = cumulative EXP; undefined
// past a rarity's own max level.
export const ECHO_LEVEL_CUMULATIVE_EXP = {
  5: [0, 400, 1000, 1900, 3000, 4400, 6100, 8100, 10500, 13300, 16500, 20100, 24200, 28800, 33900, 39600, 46000, 53100, 60900, 69600, 79100, 89600, 101100, 113700, 127500, 142600],
  4: [0, 320, 800, 1520, 2400, 3520, 4880, 6480, 8400, 10640, 13200, 16080, 19360, 23040, 27120, 31680, 36800, 42480, 48720, 55680, 63380],
  3: [0, 160, 400, 760, 1200, 1760, 2440, 3240, 4200, 5320, 6600, 8040, 9680, 11520, 13560, 15840],
  2: [0, 100, 250, 475, 750, 1100, 1525, 2025, 2625, 3325, 4125],
};
export const ECHO_MAX_LEVEL_BY_RARITY = { 2: 10, 3: 15, 4: 20, 5: 25 };
// Shell Credit conversion — wiki's own disclosed rate, same source as the EXP table above.
export const SHELL_CREDIT_PER_ECHO_EXP = 0.1;
export const SHELL_CREDIT_PER_TUNE_ATTEMPT = 2000;
// EXP granted per Sealed Tube tier (Echo Development Material) — same source.
export const SEALED_TUBE_EXP = { Basic: 500, Medium: 1000, Advanced: 2000, Premium: 5000 };
