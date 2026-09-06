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

// The wiki describes Echoes as having a "Primary" (random) and a "Secondary" (predetermined —
// fixed per cost tier, not re-rolled per drop, and never the same stat as the Primary) main
// stat. Cross-referencing Probability.md's own "Mainstats" pool per cost against its "Detailed
// mainstat values distribution" Primary-roll sample shows exactly one flat stat missing from
// each cost tier's Primary sample — that's the fixed Secondary for that tier, not a coincidence:
// 1-Cost never rolls flat HP as Primary, 3-Cost and 4-Cost never roll flat ATK as Primary. So
// Secondary Stat is a deterministic fact per cost, not a probability at all.
export const SECONDARY_STAT_BY_COST = { 1: 'HP', 3: 'ATK', 4: 'ATK' };

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
  { level: 0, sol3Phase: 1, baseDropRate: 6, cost4Enhanced: 20, cost1n3Enhanced: 0, rarity: { 2: 100, 3: 0, 4: 0, 5: 0 } },
  { level: 1, sol3Phase: 1, baseDropRate: 10, cost4Enhanced: 20, cost1n3Enhanced: 0, rarity: { 2: 100, 3: 0, 4: 0, 5: 0 } },
  { level: 2, sol3Phase: 1, baseDropRate: 10, cost4Enhanced: 20, cost1n3Enhanced: 0, rarity: { 2: 100, 3: 0, 4: 0, 5: 0 } },
  { level: 3, sol3Phase: 1, baseDropRate: 10, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 100, 3: 0, 4: 0, 5: 0 } },
  { level: 4, sol3Phase: 1, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 100, 3: 0, 4: 0, 5: 0 } },
  { level: 5, sol3Phase: 1, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 70, 3: 30, 4: 0, 5: 0 } },
  { level: 6, sol3Phase: 1, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 50, 3: 50, 4: 0, 5: 0 } },
  { level: 7, sol3Phase: 1, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 20, 3: 80, 4: 0, 5: 0 } },
  { level: 8, sol3Phase: 3, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 70, 4: 30, 5: 0 } },
  { level: 9, sol3Phase: 3, baseDropRate: 15, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 70, 4: 30, 5: 0 } },
  { level: 10, sol3Phase: 3, baseDropRate: 20, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 70, 4: 30, 5: 0 } },
  { level: 11, sol3Phase: 3, baseDropRate: 20, cost4Enhanced: 40, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 50, 4: 50, 5: 0 } },
  { level: 12, sol3Phase: 3, baseDropRate: 20, cost4Enhanced: 50, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 50, 4: 50, 5: 0 } },
  { level: 13, sol3Phase: 3, baseDropRate: 20, cost4Enhanced: 50, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 25, 4: 75, 5: 0 } },
  { level: 14, sol3Phase: 3, baseDropRate: 20, cost4Enhanced: 60, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 25, 4: 75, 5: 0 } },
  { level: 15, sol3Phase: 4, baseDropRate: 20, cost4Enhanced: 60, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 70, 5: 30 } },
  { level: 16, sol3Phase: 4, baseDropRate: 20, cost4Enhanced: 80, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 70, 5: 30 } },
  { level: 17, sol3Phase: 4, baseDropRate: 20, cost4Enhanced: 80, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 50, 5: 50 } },
  { level: 18, sol3Phase: 4, baseDropRate: 20, cost4Enhanced: 90, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 50, 5: 50 } },
  { level: 19, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 90, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 20, 5: 80 } },
  { level: 20, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 20, 5: 80 } },
  { level: 21, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 22, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 23, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 24, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 25, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 26, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 0, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 27, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 100, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 28, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 100, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 29, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 100, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
  { level: 30, sol3Phase: 5, baseDropRate: 20, cost4Enhanced: 100, cost1n3Enhanced: 100, rarity: { 2: 0, 3: 0, 4: 0, 5: 100 } },
];
export const MAX_DATA_BANK_LEVEL = 30;

// Tacet Field average yield per run, keyed by SOL3 Phase (1-8) — Data dump/Echoes/Drop
// Rates.md's Tacet Field table breaks its sample down by SOL3 Phase already (UL19 Phase1/2,
// UL20 Phase3, UL30 Phase4, UL40 Phase5, UL50 Phase6, UL60 Phase7, UL70 Phase8), and that
// file's own note says "Rarity distribution of Echoes is based on your Data Bank level" — so
// it's not just an endgame number, it genuinely varies with progression the same way rarity
// does. Data Bank.md's own level table gives the SOL3 Phase required per Data Bank Level
// (see `sol3Phase` on DATA_BANK_LEVELS above), which is how getTacetFieldYield below picks the
// right row instead of always assuming endgame. There is still no published breakdown of drop
// rate BY SONATA SET or BY COST TIER (only by star Rarity) — so this still treats any Echo the
// run drops as a candidate instance, optimistic if the target set/cost is rarer than average.
// Flagged in the calculator's own UI, not hidden.
export const TACET_FIELD_YIELD_BY_SOL3_PHASE = {
  1: { runsSampled: 33, avgEchoesPerRun: 2.61, avgShellCreditPerRun: 2500 },
  2: { runsSampled: 17, avgEchoesPerRun: 2.41, avgShellCreditPerRun: 2500 },
  3: { runsSampled: 79, avgEchoesPerRun: 2.92, avgShellCreditPerRun: 3500 },
  4: { runsSampled: 115, avgEchoesPerRun: 4.13, avgShellCreditPerRun: 4500 },
  5: { runsSampled: 102, avgEchoesPerRun: 4.24, avgShellCreditPerRun: 4750 },
  6: { runsSampled: 214, avgEchoesPerRun: 4.25, avgShellCreditPerRun: 5000 },
  7: { runsSampled: 269, avgEchoesPerRun: 4.33, avgShellCreditPerRun: 5125 },
  8: { runsSampled: 1697, avgEchoesPerRun: 4.30, avgShellCreditPerRun: 5250 },
};
// Given a Data Bank Level, returns the Tacet Field yield for the SOL3 Phase it requires.
export function getTacetFieldYield(dataBankLevel) {
  const row = DATA_BANK_LEVELS.find(r => r.level === dataBankLevel) || DATA_BANK_LEVELS[DATA_BANK_LEVELS.length - 1];
  return TACET_FIELD_YIELD_BY_SOL3_PHASE[row.sol3Phase] || TACET_FIELD_YIELD_BY_SOL3_PHASE[8];
}

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
// EXP granted per Sealed Tube tier (Echo Development Material) — same source as the leveling
// table above. Highest-value tier first: greedy tube-count breakdowns (see
// getSealedTubeBreakdown below) walk this order so they favor fewer, bigger tubes.
export const SEALED_TUBE_EXP = { Premium: 5000, Advanced: 2000, Medium: 1000, Basic: 500 };

// Greedy Premium→Basic breakdown of how many of each Sealed Tube tier covers a given amount of
// EXP — shown alongside the raw EXP/Shell Credit numbers so leveling cost reads as something
// you can actually go buy/farm, not just an abstract point total. Real inventories won't split
// a tube, so any leftover remainder rounds up into one more of the smallest tier used.
export function getSealedTubeBreakdown(exp) {
  const tiers = Object.entries(SEALED_TUBE_EXP);
  let remaining = exp;
  const counts = tiers.map(([tier, value], i) => {
    const isLast = i === tiers.length - 1;
    const count = isLast ? Math.ceil(remaining / value) : Math.floor(remaining / value);
    remaining -= count * value;
    return { tier, count };
  });
  return counts.filter(({ count }) => count > 0);
}
