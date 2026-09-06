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

// Endgame Weekly/World Boss average yield — bosses do not cost Waveplate (user-confirmed).
// From Drop Rates.md's own largest-sample rows (UL60/SOL7 for Weekly Boss at 291 runs, UL70/
// SOL8 for World Boss at 335 runs — picked for sample size over raw recency since both are
// within one tier of endgame).
export const WEEKLY_BOSS_ENDGAME_YIELD = { runsSampled: 291, avgEchoesPerRun: 10.14, avgShellCreditPerRun: 54000 };
export const WORLD_BOSS_ENDGAME_YIELD = { runsSampled: 335, avgEchoesPerRun: 3.62, avgShellCreditPerRun: 10000 };
