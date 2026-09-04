// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — teams/calcEngine.js
// Extracted calculation utilities for the damage calculator.
// Eliminates tripled logic (raw/full/sub-DPS) by providing shared functions.
// ═══════════════════════════════════════════════════════════════════════════════

import { ECHO_SKILL_BUFFS } from '../../data/echoes.js';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA, CHARACTER_ROTATIONS } from '../../data/characters.js';
import { WEAPON_REFINE_SCALE } from '../../data/constants.js';
// Phase 0 structural cleanup (2026-09-04, ENGINE_ARCHITECTURE_PROPOSAL.md v2 §2.1): the
// character-agnostic combat-math constants/formulas and role-substring helpers moved to their
// permanent home under engine/shared/ — byte-identical logic, re-exported here so every existing
// importer of these names from calcEngine.js keeps working unchanged.
import {
  ATTACKER_LEVEL, ATTACKER_FACTOR, BASE_CRIT_RATE, BASE_CRIT_DMG,
  calcDefMult, calcResMult, calcAvgCrit, calcDmgBonus,
} from '../../engine/shared/combatMath.js';
import { isHealerRole, isSupportRole } from '../../engine/shared/roleHelpers.js';
import { collapseDmgTypeBuckets } from '../../engine/shared/buffAccumulation.js';

export {
  ATTACKER_LEVEL, ATTACKER_FACTOR, BASE_CRIT_RATE, BASE_CRIT_DMG,
  calcDefMult, calcResMult, calcAvgCrit, calcDmgBonus,
  isHealerRole, isSupportRole,
  collapseDmgTypeBuckets,
};
// Legacy name, kept as an alias so calcTeamStats.js's existing call sites need no change in this
// pass — see engine/shared/buffAccumulation.js's header for why the function was renamed.
export const routeTypeBonuses = collapseDmgTypeBuckets;
// Engine-merge Stage 1 (2026-09-04): the DOT/Tune-Break rotation-aggregate primitives
// (calcFrazzleDmg/calcErosionDmg/calcFusionBurstDmg/calcElectroFlareDmg/calcTuneBreakDmg and their
// constants) moved to ../../engine/dot/dotFormulas.js — they were never legacy-only math (see
// engine/dot/dotReactions.js, which already applies their output on top of BOTH the legacy RAW total
// and the modern resolveHitComposedTeamDps FULL total). Re-exported here, byte-identical, so every
// existing caller of this file keeps working unchanged; see dotFormulas.js for the real definitions.
export {
  DOT_LEVEL_MULT, DOT_BASE_FACTOR,
  FRAZZLE_TICK_INTERVAL, FRAZZLE_ICD_PER_SOURCE, EROSION_TICK_INTERVAL, EROSION_DURATION,
  FRAZZLE_STACK_TABLE, EROSION_STACK_TABLE,
  FUSION_BURST_THRESHOLD, FUSION_BURST_APP_ICD, FUSION_TRAIL_MULT,
  FLARE_TICK_INTERVAL, FLARE_STACK_MULT, TUNE_BREAK_BASE_DMG,
  calcFrazzleDmg, calcErosionDmg, calcFusionBurstDmg, calcElectroFlareDmg, calcTuneBreakDmg,
} from '../../engine/dot/dotFormulas.js';
// ER breakpoints — how much Energy Regen a character actually needs for full Liberation uptime.
// Community consensus (endgame ER-breakpoint guides, corroborated across multiple independent
// sources) differentiates this by ROLE, not just energy cost: an on-field Main DPS builds energy
// continuously from their own Basic/Heavy Attacks all rotation, so ~100-110% is typically enough;
// a Sub-DPS/off-field character spends most of the rotation NOT generating their own on-field
// energy, so needs more (~120-130%); a dedicated Support/buffer swapping in only briefly needs the
// most (~130-150%). The previous flat ER_THRESHOLD_STANDARD (125% for every non-175-cost role
// alike) ignored that split — same as this file's off-field fieldRatio/onField modeling already
// applies for raw damage, just not carried over to the ER-breakpoint estimate.
export const ER_THRESHOLD_MAIN_DPS = 110;  // on-field Main DPS: builds energy every hit, needs less
export const ER_THRESHOLD_SUB_DPS = 130;   // off-field Sub-DPS: less passive energy gen, needs more
export const ER_THRESHOLD_STANDARD = 140;  // Support/other roles below the 175-cost healer cutoff
export const ER_THRESHOLD_HEALER = 140;    // ER threshold for 175-cost healers

// Echo main stat values by cost tier — rarity-5, max-level (the endgame BiS assumption this
// calculator targets) roll ceilings, sourced from the wiki/Echo/Stats §
// "Mainstats" (fetched 2026-08-25). DEF% is deliberately rolled higher than ATK%/HP% at every
// tier to compensate for it being the weaker stat, and 1-cost HP% is rolled higher than its own
// ATK%/DEF% — both real, confirmed asymmetries, not typos.
// NOTE: Energy Regen is a valid main stat ONLY on 3-cost echoes — 4-cost (Overlord/Calamity)
// echoes never roll it, so it's deliberately absent from the 4-cost table below. Flat ATK (3-cost)
// and flat HP (1-cost) ARE real main-stat rolls too (unlike their % counterparts they need the
// wearer's own base stat to convert into a %-of-base contribution — see the flat-mainstat handling
// in applyEchoStats/calcTeamStats.js, which mirrors the flat-SUBSTAT conversion already used
// there). Flat ATK/DEF are NOT valid 1-cost main stats (only flat HP is).
export const ECHO_MAIN_STAT_VALUES = {
  4: { 'ATK%': 33, 'HP%': 33, 'DEF%': 41.5, 'Crit Rate': 22, 'Crit DMG': 44, 'Healing Bonus': 26 },
  3: { 'ATK%': 30, 'HP%': 30, 'DEF%': 38, 'Glacio DMG': 30, 'Fusion DMG': 30, 'Electro DMG': 30, 'Aero DMG': 30, 'Spectro DMG': 30, 'Havoc DMG': 30, 'Energy Regen': 32, 'ATK': 100 },
  1: { 'ATK%': 18, 'HP%': 22.8, 'DEF%': 18, 'HP': 2280 },
};

// Echo substat values — probability-weighted average of each stat's real roll grades, using
// Kuro's own KR-law-mandated disclosed per-grade roll chances (source:
// the wiki/Echo/Stats § "Detailed substat values distribution", citing
// wutheringwaves.kurogames.com's official disclosure; fetched 2026-08-25). Crit Rate/Crit DMG
// use their own front-loaded chances [23.33%, 23.33%, 23.33%, 8%, 8%, 8%, 3%, 3%]; all other
// 8-grade substats (ATK%/HP%/DEF%/ER/DMG bonuses/flat HP) share chances [6.80%, 7.77%, 20.39%,
// 24.27%, 17.48%, 14.56%, 5.83%, 2.91%]. Each value below is Σ(chance_i × grade_i)/100 for that
// stat's grade list, not a flat min/mid/max snapshot.
export const ECHO_SUB_STAT_VALUES = {
  'ATK%': 8.77, 'HP%': 8.77, 'DEF%': 11.09,
  'Crit Rate': 7.53, 'Crit DMG': 15.06,
  'Energy Regen': 9.36,
  'Basic ATK DMG': 8.77, 'Heavy ATK DMG': 8.77,
  'Resonance Skill DMG': 8.77, 'Resonance Liberation DMG': 8.77,
};

// Flat echo substat values (in raw stat points, NOT %) — probability-weighted average of the
// real roll grades, same official source/date as ECHO_SUB_STAT_VALUES above. HP has 8 grades
// (320-580) using the same 8-grade chance table as the % substats; ATK and DEF have only 4
// grades with their own disclosed chances (ATK: [6.80%, 52.43%, 37.86%, 2.91%], DEF: [14.56%,
// 44.66%, 32.04%, 8.74%]). Unlike the % substats, these can't be looked up context-free: they
// need the wearer's own base ATK/HP/DEF to convert into an equivalent %-of-base contribution
// (see applyEchoStats below), so they're kept in a separate table rather than merged into
// ECHO_SUB_STAT_VALUES.
export const ECHO_FLAT_SUB_STAT_VALUES = {
  'ATK': 43.7, 'HP': 438.3, 'DEF': 53.5,
};

// Every real, discrete roll grade for each substat — same source as ECHO_SUB_STAT_VALUES/
// ECHO_FLAT_SUB_STAT_VALUES above (the wiki/Echo/Stats § "Detailed substat
// values distribution", Kuro's own KR-law-mandated disclosure), lowest grade first. ATK/DEF
// (flat) only have 4 real grades; every other substat has 8. Lets a specific echo store which
// grade it actually rolled instead of always using the probability-weighted average above.
export const ECHO_SUBSTAT_GRADES = {
  'ATK': [30, 40, 50, 60],
  'DEF': [40, 50, 60, 70],
  'HP': [320, 360, 390, 430, 470, 510, 540, 580],
  'DEF%': [8.1, 9.0, 10.0, 10.9, 11.8, 12.8, 13.8, 14.7],
  'ATK%': [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
  'HP%': [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
  'Energy Regen': [6.8, 7.6, 8.4, 9.2, 10.0, 10.8, 11.6, 12.4],
  'Crit Rate': [6.3, 6.9, 7.5, 8.1, 8.7, 9.3, 9.9, 10.5],
  'Crit DMG': [12.6, 13.8, 15.0, 16.2, 17.4, 18.6, 19.8, 21.0],
  'Basic ATK DMG': [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
  'Heavy ATK DMG': [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
  'Resonance Skill DMG': [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
  'Resonance Liberation DMG': [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6],
};

// Resolves a specific echo substat's stored roll grade (1-based index into ECHO_SUBSTAT_GRADES)
// to its real numeric value. Falls back to the probability-weighted average (ECHO_SUB_STAT_VALUES/
// ECHO_FLAT_SUB_STAT_VALUES) when no grade was ever recorded for this substat — this is what keeps
// every echo saved before per-roll tracking existed computing exactly the same stats as before.
export function getSubstatGradeValue(sub, grade) {
  const grades = ECHO_SUBSTAT_GRADES[sub];
  if (!grades || !grade) return ECHO_SUB_STAT_VALUES[sub] ?? ECHO_FLAT_SUB_STAT_VALUES[sub] ?? 0;
  const idx = Math.min(Math.max(1, grade), grades.length) - 1;
  return grades[idx];
}

// The grade (1-based) whose real value sits closest to the probability-weighted average — the
// sane default for a substat that was just toggled on and has no explicit roll recorded yet.
export function getDefaultSubstatGrade(sub) {
  const grades = ECHO_SUBSTAT_GRADES[sub];
  const avg = ECHO_SUB_STAT_VALUES[sub] ?? ECHO_FLAT_SUB_STAT_VALUES[sub];
  if (!grades || avg == null) return 1;
  let best = 1, bestDist = Infinity;
  grades.forEach((v, i) => { const d = Math.abs(v - avg); if (d < bestDist) { bestDist = d; best = i + 1; } });
  return best;
}

// Low/Medium/High/Max tier (0-3) for a given roll grade, splitting the substat's real grade list
// into 4 even bands (grades 1-2 of 8 = Low, 3-4 = Medium, 5-6 = High, 7-8 = Max; each of the 4
// ATK/DEF grades is its own band). Used purely for the build card's roll-value coloring.
export function getSubstatTier(sub, grade) {
  const grades = ECHO_SUBSTAT_GRADES[sub];
  if (!grades || !grade) return 3; // untracked roll (legacy data) — read as the average, shown as Max/neutral-gold
  const n = grades.length;
  return Math.min(3, Math.floor((Math.min(Math.max(1, grade), n) - 1) * 4 / n));
}

// ── Stat accumulator: replaces 50+ loose variables per tier ──
export function createStats() {
  return {
    atkPct: 0, cr: BASE_CRIT_RATE, cd: BASE_CRIT_DMG,
    elemDmg: 0, skillDmg: 0, basicDmg: 0, heavyDmg: 0,
    libDmg: 0, echoDmg: 0, coordDmg: 0, outroDmg: 0,
    deepen: 0, amplify: 0,
    defShred: 0, resShred: 0, defIgnore: 0,
    // totalMult (added 2026-09-02, the engine-merge history (git log) totalMult architecture-bug fix): a flat
    // fallback multiplier for real kit bonuses that don't map to a dedicated category stat — was
    // previously accepted by `applyBuff()`'s switch as a real case in NEITHER `resolveHitComposedDps.js`
    // nor `resolveHitComposedTeamDps.js` (both explicitly skipped it, "no accumulator here yet"), and
    // even where `resolveSimulatedTeamRotation.js` DID accumulate it (its own separate
    // `totalMultBonus` return value), `calcTeamStats.js`'s only caller for a fully-converted team
    // discarded that return field entirely — so a `stat:'totalMult'` effect (38 blocks across 24
    // character files at the time this was found) contributed ZERO to any actually-computed DPS
    // number in the app, in every real code path, despite being a real sourced kit bonus. See
    // the engine-merge history (git log)'s own writeup for the full investigation.
    totalMult: 0,
  };
}

// ── Weapon passive parser (cached) ──
// P5-06 / P11-02 audit fix: LRU cap on the memo table. WuWa has ~60 weapons
// today so the cache is small, but (passive × element) keys plus any future
// locale-translated passive strings could multiply. Map preserves insertion
// order — we delete the oldest when we exceed PASSIVE_CACHE_MAX.
const PASSIVE_CACHE_MAX = 200;
const _passiveCache = new Map();
const _cacheSet = (key, value) => {
  if (_passiveCache.size >= PASSIVE_CACHE_MAX) {
    const oldest = _passiveCache.keys().next().value;
    if (oldest !== undefined) _passiveCache.delete(oldest);
  }
  _passiveCache.set(key, value);
};
export function parsePassive(passive, element) {
  const cacheKey = `${passive || ''}|${element || ''}`;
  if (_passiveCache.has(cacheKey)) {
    // LRU refresh — move to most-recently-used position.
    const v = _passiveCache.get(cacheKey);
    _passiveCache.delete(cacheKey);
    _passiveCache.set(cacheKey, v);
    return v;
  }
  const r = { atkPct: 0, elemDmg: 0, skillDmg: 0, critRate: 0, critDmg: 0, defIgnore: 0, resShred: 0, basicDmg: 0, heavyDmg: 0, libDmg: 0, echoDmg: 0, coordDmg: 0, hpPct: 0, defPct: 0 };
  if (!passive) { _cacheSet(cacheKey, r); return r; }
  const p = passive.toLowerCase();
  const N = '(\\d+(?:\\.\\d+)?)'; // number, with optional decimal — passive text uses both "ATK +7.2%" and "+12%"
  // ATK% appears in both word orders across weapon text ("ATK +X%" and "+X% ATK") — try both.
  const atkMatch = p.match(new RegExp('atk\\s*\\+' + N + '%')) || p.match(new RegExp('\\+' + N + '%\\s*atk\\b'));
  if (atkMatch) r.atkPct += parseFloat(atkMatch[1]);
  if (element) {
    const elLow = element.toLowerCase();
    const elMatch = p.match(new RegExp(elLow + '\\s*dmg\\s*\\+?' + N + '%'));
    if (elMatch) r.elemDmg += parseFloat(elMatch[1]);
    const attrMatch = p.match(new RegExp('(?:all[- ])?attr(?:ibute)?\\s*dmg\\s*(?:bonus\\s*)?\\+?' + N + '%'));
    if (attrMatch) r.elemDmg += parseFloat(attrMatch[1]);
  }
  const skillMatch = p.match(new RegExp('(?:res(?:onance)?\\.?\\s*)?skill\\s*dmg\\s*\\+?' + N + '%'));   if (skillMatch) r.skillDmg += parseFloat(skillMatch[1]);
  const libMatch = p.match(new RegExp('(?:res(?:onance)?\\.?\\s*)?liberation\\s*(?:dmg\\s*)?\\+?' + N + '%')); if (libMatch) r.libDmg += parseFloat(libMatch[1]);
  const basicMatch = p.match(new RegExp('basic\\s*(?:atk?\\s*)?dmg\\s*(?:amp\\s*)?\\+?' + N + '%'));     if (basicMatch) r.basicDmg += parseFloat(basicMatch[1]);
  const heavyMatch = p.match(new RegExp('heavy\\s*(?:atk?\\s*)?(?:dmg\\s*)?\\+?' + N + '%'));           if (heavyMatch) r.heavyDmg += parseFloat(heavyMatch[1]);
  const coordMatch = p.match(new RegExp('coord(?:inated)?\\s*(?:atk?\\s*)?(?:dmg\\s*)?\\+?' + N + '%')); if (coordMatch) r.coordDmg += parseFloat(coordMatch[1]);
  const echoMatch = p.match(new RegExp('echo\\s*(?:skill\\s*)?dmg\\s*(?:amp\\s*)?\\+?' + N + '%'));      if (echoMatch) r.echoDmg += parseFloat(echoMatch[1]);
  const crMatch = p.match(new RegExp('crit\\s*rate\\s*\\+?' + N + '%'));                                if (crMatch) r.critRate += parseFloat(crMatch[1]);
  const cdMatch = p.match(new RegExp('crit\\s*dmg\\s*\\+?' + N + '%'));                                 if (cdMatch) r.critDmg += parseFloat(cdMatch[1]);
  const defMatch = p.match(new RegExp('def\\s*ignore\\s*\\+?' + N + '%'));                              if (defMatch) r.defIgnore += parseFloat(defMatch[1]);
  const resMatch = p.match(new RegExp('res\\s*(?:ignore\\s*)?\\-' + N + '%'));                           if (resMatch) r.resShred += parseFloat(resMatch[1]);
  _cacheSet(cacheKey, r);
  return r;
}

// ── Weapon passive with refinement scaling ──
export function getWeaponPv(weapon, element, refinement) {
  if (!weapon) return {};
  const refScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[(refinement || 1) - 1] || 1 : 1;
  const rawPv = weapon.pv || parsePassive(weapon.passive, element);
  return Object.fromEntries(Object.entries(rawPv).map(([k, v]) => [k, typeof v === 'number' ? v * refScale : v]));
}

// ── Apply weapon pv stats to a stat accumulator ──
export function applyWeaponPv(stats, wp, scaling) {
  if (scaling === 'ATK') stats.atkPct += (wp.atkPct || 0);
  else if (scaling === 'HP') stats.atkPct += (wp.hpPct || 0);
  else if (scaling === 'DEF') stats.atkPct += (wp.defPct || 0);
  stats.elemDmg += (wp.elemDmg || 0);
  stats.skillDmg += (wp.skillDmg || 0);
  stats.cr += (wp.critRate || 0);
  stats.cd += (wp.critDmg || 0);
  stats.defIgnore += (wp.defIgnore || 0);
  stats.resShred += (wp.resShred || 0);
  stats.basicDmg += (wp.basicDmg || 0);
  stats.heavyDmg += (wp.heavyDmg || 0);
  stats.libDmg += (wp.libDmg || 0);
  stats.echoDmg += (wp.echoDmg || 0);
  stats.coordDmg += (wp.coordDmg || 0);
}

// ── Apply echo set bonus values (used for p2val, p5val, p3val) ──
export function applyEchoSetBonus(stats, setData, valKey, element, scaling) {
  const vals = setData?.[valKey];
  if (!vals) return;
  const ek = (element || '').toLowerCase() + 'Dmg';
  // Scaling stat (ATK%/HP%/DEF%) → routes to atkPct for the damage formula
  if (scaling === 'ATK' && vals.atkPct) stats.atkPct += vals.atkPct;
  else if (scaling === 'HP' && vals.hpPct) stats.atkPct += vals.hpPct;
  else if (scaling === 'DEF' && vals.defPct) stats.atkPct += vals.defPct;
  if (vals.critRate) stats.cr += vals.critRate;
  if (vals.critDmg) stats.cd += vals.critDmg;
  if (vals.skillDmg) stats.skillDmg += vals.skillDmg;
  if (vals[ek]) stats.elemDmg += vals[ek];
  if (vals.allDmg) stats.elemDmg += vals.allDmg;
  if (vals.basicDmg) stats.basicDmg += vals.basicDmg;
  if (vals.heavyDmg) stats.heavyDmg += vals.heavyDmg;
  if (vals.libDmg) stats.libDmg += vals.libDmg;
  if (vals.echoDmg) stats.echoDmg += vals.echoDmg;
}

// ── Apply full echo set (handles p2+p5, p3, and hybrid 3pc+2pc) ──
export function applyFullEchoSet(stats, echoSet, echoSet2, element, scaling) {
  if (echoSet) {
    if (echoSet.p3val) {
      applyEchoSetBonus(stats, echoSet, 'p3val', element, scaling);
    } else {
      applyEchoSetBonus(stats, echoSet, 'p2val', element, scaling);
      applyEchoSetBonus(stats, echoSet, 'p5val', element, scaling);
    }
  }
  if (echoSet2) {
    applyEchoSetBonus(stats, echoSet2, 'p2val', element, scaling);
  }
}

// Convert a flat ATK/HP/DEF echo substat into an equivalent %-of-base-stat contribution.
// Flat stat substats only benefit a character whose scaling stat matches the substat's own
// stat type (a flat ATK roll does effectively nothing for an HP-scaling character's Motion
// Value damage — there's no secondary system that consumes raw ATK the way there sort-of is
// for teamwide ATK% buffs on off-scaling characters). So: full conversion when it matches the
// character's scaling stat, 0 credit otherwise — unlike the established 0.25 partial-credit
// convention used elsewhere in this file for off-scaling *team* ATK% buffs (those raise the
// character's actual ATK stat, which can still feed unrelated mechanics; a mismatched flat
// substat conversion has no such secondary use, so partial credit isn't warranted here).
// Shared by both flat substats and the flat mainstat (echoes can roll flat ATK/HP/DEF as either).
function flatToPct(sub, scaling, baseStats, val) {
  if (!baseStats || !val) return 0;
  if (sub === 'ATK' && scaling === 'ATK' && baseStats.atk) return (val / baseStats.atk) * 100;
  if (sub === 'HP' && scaling === 'HP' && baseStats.hp) return (val / baseStats.hp) * 100;
  if (sub === 'DEF' && scaling === 'DEF' && baseStats.def) return (val / baseStats.def) * 100;
  return 0;
}
function flatSubToPct(sub, scaling, baseStats, grade) {
  return flatToPct(sub, scaling, baseStats, getSubstatGradeValue(sub, grade));
}

// ── Apply echo main stats and substats to accumulator ──
// `baseStats` (optional) = { atk, hp, def } — needed only to convert flat ATK/HP/DEF substats
// (see flatSubToPct above). `atk` must be the character's TOTAL base ATK including their weapon's
// base ATK (i.e. what this engine calls totalBaseAtk elsewhere) — atkPct is later applied against
// that combined figure, not the character's own base ATK alone, so using only the character's base
// would overstate a flat ATK substat's converted value by however much the weapon contributes.
// `hp`/`def` stay as the character's own base HP/DEF since weapons in this game never grant a base
// HP or DEF pool. Omitting `baseStats` entirely just skips flat substats (contributes 0, same as
// before this table existed) rather than throwing.
export function applyEchoStats(stats, echoes, element, scaling, baseStats) {
  const scalingStat = scaling === 'HP' ? 'HP%' : scaling === 'DEF' ? 'DEF%' : 'ATK%';
  const elDmgKey = element ? element.charAt(0).toUpperCase() + element.slice(1).toLowerCase() + ' DMG' : '';
  (echoes || []).forEach((echo, i) => {
    if (!echo || typeof echo !== 'object') return;
    const cost = i === 0 ? 4 : i < 3 ? 3 : 1;
    if (echo.mainStat) {
      const val = ECHO_MAIN_STAT_VALUES[cost]?.[echo.mainStat] || 0;
      if (echo.mainStat === 'ATK' || echo.mainStat === 'HP' || echo.mainStat === 'DEF') {
        // Flat ATK (3-cost) / flat HP (1-cost) main stat — same %-of-base conversion as a flat
        // substat (see flatToPct above): full credit only when it matches the wearer's own
        // scaling stat, 0 otherwise.
        stats.atkPct += flatToPct(echo.mainStat, scaling, baseStats, val);
      }
      else if (echo.mainStat === scalingStat) stats.atkPct += val;
      else if (echo.mainStat === 'Crit Rate') stats.cr += val;
      else if (echo.mainStat === 'Crit DMG') stats.cd += val;
      else if (echo.mainStat === elDmgKey) stats.elemDmg += val;
      else if (echo.mainStat === 'Basic ATK DMG') stats.basicDmg += val;
      else if (echo.mainStat === 'Heavy ATK DMG') stats.heavyDmg += val;
      else if (echo.mainStat === 'Resonance Skill DMG') stats.skillDmg += val;
      else if (echo.mainStat === 'Resonance Liberation DMG') stats.libDmg += val;
    }
    // A real echo can never carry the same substat type twice (the game enforces 5 DISTINCT
    // rolls) or more than 5 substats total, but nothing upstream of this function actually
    // guarantees that -- the UI's toggle-button substat picker and auto-equip's own hardcoded
    // templates both happen to keep this true today, but imported/restored save data (App.jsx's
    // backup-restore path writes teamEquipment from a user-supplied JSON with only generic
    // sanitization, no echo-specific validation) could still hand this function something
    // malformed. Guard here, at the point of use, rather than trusting every possible caller.
    const seenSubs = new Set();
    (echo.substats || []).slice(0, 5).forEach(sub => {
      if (seenSubs.has(sub)) return;
      seenSubs.add(sub);
      const grade = echo.substatRolls?.[sub];
      if (sub === 'ATK' || sub === 'HP' || sub === 'DEF') {
        stats.atkPct += flatSubToPct(sub, scaling, baseStats, grade);
        return;
      }
      const val = getSubstatGradeValue(sub, grade);
      if (!val) return;
      if (sub === scalingStat) stats.atkPct += val;
      else if (sub === 'Crit Rate') stats.cr += val;
      else if (sub === 'Crit DMG') stats.cd += val;
      else if (sub === 'Basic ATK DMG') stats.basicDmg += val;
      else if (sub === 'Heavy ATK DMG') stats.heavyDmg += val;
      else if (sub === 'Resonance Skill DMG') stats.skillDmg += val;
      else if (sub === 'Resonance Liberation DMG') stats.libDmg += val;
      else if (sub === 'Energy Regen') { /* tracked separately */ }
    });
  });
}

// Which dmgFocus tag gates each type-specific stat — same mapping routeTypeBonuses/scoreTeamComposition
// already use, kept here too so applyBuff can enforce it itself instead of requiring every call site to
// remember to check first (that's exactly how calcTeamStats.js ended up with 8 near-identical chains
// that individually needed the same deepen/allDmg/elemDmg gating fix applied by hand).
const TYPE_FOCUS_MAP = { basicDmg: 'Basic ATK', heavyDmg: 'Heavy ATK', libDmg: 'Liberation', echoDmg: 'Echo', coordDmg: 'Coordinated ATK' };

// ── Apply buff to stat accumulator (replaces 8 identical if-else chains) ──
// options.condition + options.dpsFocus/dpsElLower let this enforce the exact same gates
// scoreTeamComposition uses (type-focus match for basicDmg/heavyDmg/libDmg/echoDmg/coordDmg; strict
// element match for elemDmg; off-element-mismatch-only for deepen/offTune/allDmg) in ONE place instead
// of at every call site. Passing neither dpsFocus nor dpsElLower skips gating entirely (e.g. a
// character's own selfBuffs, which are inherently about their own damage and need no target-matching).
export function applyBuff(stats, buff, value, options = {}) {
  const { isAmplify = false, condition, dpsFocus, dpsElLower, dpsName } = options;
  if (dpsFocus && TYPE_FOCUS_MAP[buff] && !dpsFocus.includes(TYPE_FOCUS_MAP[buff])) return;
  if (dpsElLower != null) {
    if (buff === 'elemDmg') {
      const cond = (condition || '').toLowerCase();
      if (cond && !cond.includes(dpsElLower) && !cond.includes('all')) return;
    } else if (buff === 'deepen' || buff === 'offTune' || buff === 'allDmg') {
      if (!universalStatApplies(condition, dpsElLower, dpsName)) return;
    }
  }
  const target = isAmplify ? 'amplify' : null;
  switch (buff) {
    case 'atkPct':    stats.atkPct += value; break;
    case 'allDmg':    stats[target || 'elemDmg'] += value; break;
    case 'elemDmg':   stats[target || 'elemDmg'] += value; break;
    case 'deepen':    stats.deepen += value; break;
    case 'offTune':   stats.deepen += value; break;
    case 'basicDmg':  stats[target || 'basicDmg'] += value; break;
    case 'heavyDmg':  stats[target || 'heavyDmg'] += value; break;
    case 'libDmg':    stats[target || 'libDmg'] += value; break;
    case 'echoDmg':   stats[target || 'echoDmg'] += value; break;
    case 'skillDmg':  stats[target || 'skillDmg'] += value; break;
    case 'coordDmg':  stats[target || 'coordDmg'] += value; break;
    case 'outroDmg':  stats[target || 'outroDmg'] += value; break;
    case 'totalMult': stats.totalMult += value; break;
    case 'critRate':  stats.cr += value; break;
    case 'critDmg':   stats.cd += value; break;
    case 'resShred':  stats.resShred += value; break;
    case 'defShred':  stats.defShred += value; break;
    case 'defIgnore': stats.defIgnore += value; break;
    default: break;
  }
}

// ── Count team element occurrences (was duplicated 3 times) ──
export function countTeamElements(members) {
  const counts = {};
  members.forEach(m => {
    const el = m.d?.element;
    if (el) counts[el] = (counts[el] || 0) + 1;
  });
  return counts;
}

// (routeTypeBonuses now lives as collapseDmgTypeBuckets in engine/shared/buffAccumulation.js —
// imported and re-exported under both names above.)

// ── Role matching: some characters carry a compound role string ('Support/Healer' — Chisa, Suisui)
// rather than a single 'Healer'/'Support' tag. Every exact `role === 'Healer'`/`role === 'Support'`
// check in this codebase silently excluded those characters entirely (no healer detected in a team
// that HAS one, no Healing Bonus main-stat option in Auto Equip, excluded from the healer/support
// candidate pool when building team suggestions) — use these substring checks everywhere a role
// CATEGORY is being tested instead, so a compound role matches every category it actually belongs to.
// (isHealerRole/isSupportRole/calcDefMult/calcResMult/calcAvgCrit/calcDmgBonus now live in
// engine/shared/roleHelpers.js and engine/shared/combatMath.js — imported and re-exported above.)

// ── Energy cycle tracking ──
export function calcEnergyCycles(members, teamEquipment, teamIdx) {
  const factors = {};
  members.forEach(m => {
    let totalER = 100;
    if (m.weapSubstat === 'Energy Regen') totalER += parseFloat(m.weapSubVal) || 0;
    const eq = teamEquipment[teamIdx + ':' + m.name];
    (eq?.echoes || []).forEach((echo, ei) => {
      if (!echo || typeof echo !== 'object') return;
      if (echo.mainStat === 'Energy Regen') {
        const cost = ei === 0 ? 4 : ei < 3 ? 3 : 1;
        totalER += cost >= 3 ? 32 : 0;
      }
      (echo.substats || []).forEach(sub => { if (sub === 'Energy Regen') totalER += 8; });
    });
    if (m.echoSet?.p2val?.energyRegen) totalER += m.echoSet.p2val.energyRegen;
    if (m.echoSet2?.p2val?.energyRegen) totalER += m.echoSet2.p2val.energyRegen;
    // Main-slot echo skill buffs that grant Energy Regen (e.g. Reactor Husk +10%) — these use a stat
    // key ('energyRegen') the generic applyBuff() damage-stat switch doesn't handle, since ER isn't a
    // damage stat; it has to feed into this energy-cycle accumulator instead.
    const mainEchoName = eq?.echoes?.[0]?.name;
    const esb = mainEchoName && ECHO_SKILL_BUFFS[mainEchoName];
    if (esb && (esb.target || 'self') === 'self') {
      (esb.buffs || []).forEach(b => { if (b.stat === 'energyRegen') totalER += b.value; });
    }
    const energyCost = m.d.maxEnergy || 125;
    const erThreshold = energyCost >= 175 ? ER_THRESHOLD_HEALER
      : m.d.role === 'Main DPS' ? ER_THRESHOLD_MAIN_DPS
      : m.d.role === 'Sub DPS' ? ER_THRESHOLD_SUB_DPS
      : ER_THRESHOLD_STANDARD;
    factors[m.name] = {
      totalER,
      libUptime: totalER >= erThreshold ? 1.0 : Math.max(0.6, totalER / erThreshold),
      energyCost,
    };
  });
  return factors;
}

// ── Apply resonance chain bonuses ──
export function applyResonanceChain(stats, charName, seqLevel, isMainDps) {
  const rc = RESONANCE_CHAIN_DATA[charName];
  if (!rc || seqLevel <= 0) return 0;
  let totalMultBonus = 0;
  for (let s = 1; s <= Math.min(seqLevel, 6); s++) {
    const lvl = rc['s' + s];
    if (!lvl) continue;
    if (isMainDps) {
      if (lvl.atkPct) stats.atkPct += lvl.atkPct;
      if (lvl.critRate) stats.cr += lvl.critRate;
      if (lvl.critDmg) stats.cd += lvl.critDmg;
      if (lvl.elemDmg) stats.elemDmg += lvl.elemDmg;
      if (lvl.skillDmg) stats.skillDmg += lvl.skillDmg;
      if (lvl.basicDmg) stats.basicDmg += lvl.basicDmg;
      if (lvl.heavyDmg) stats.heavyDmg += lvl.heavyDmg;
      if (lvl.libDmg) stats.libDmg += lvl.libDmg;
      if (lvl.echoDmg) stats.echoDmg += lvl.echoDmg;
      // coordDmg added 2026-09-03: found while fixing Yinlin's S3 (Judgment Strike is a Coordinated
      // Attack, not Skill DMG) — RESONANCE_CHAIN_DATA already supported a coordDmg key (used elsewhere,
      // e.g. weapon/echo parsing at line ~219 and applyBuff's 'coordDmg' case), but this function had no
      // branch for it, so any Resonance Chain node using coordDmg was silently dropped for a main-DPS
      // character.
      if (lvl.coordDmg) stats.coordDmg += lvl.coordDmg;
      if (lvl.deepen) stats.deepen += lvl.deepen;
      if (lvl.defIgnore) stats.defIgnore += lvl.defIgnore;
      if (lvl.defShred) stats.defShred += lvl.defShred;
      if (lvl.resShred) stats.resShred += lvl.resShred;
      if (lvl.totalMult) totalMultBonus += lvl.totalMult;
    } else {
      if (lvl.allDmg) stats.elemDmg += lvl.allDmg;
      if (lvl.deepen) stats.deepen += lvl.deepen;
      if (lvl.defShred) stats.defShred += lvl.defShred;
      if (lvl.resShred) stats.resShred += lvl.resShred;
      if (lvl.atkPct) stats.atkPct += lvl.atkPct;
      if (lvl.critRate) stats.cr += lvl.critRate;
      if (lvl.critDmg) stats.cd += lvl.critDmg;
      if (lvl.basicDmg) stats.basicDmg += lvl.basicDmg;
      if (lvl.heavyDmg) stats.heavyDmg += lvl.heavyDmg;
    }
  }
  return totalMultBonus;
}

// A deepen/offTune/allDmg buff or debuff is universal by convention UNLESS its free-text `condition`
// explicitly names a DIFFERENT element than the target's own (e.g. Ciaccona's outro: "Aero Erosion DMG
// Amp only"; Phoebe's outro: "Spectro Frazzle DMG Amp (Confession)") — a condition naming no element at
// all (the common case: pure activation-trigger text) stays universal. Shared by scoreTeamComposition
// (recommendation ranking) and calcTeamStats.js (the real damage calculator) so this rule can only ever
// be defined in one place — calcTeamStats.js previously summed every deepen contribution completely
// unconditionally with no equivalent check at all, so Ciaccona/Phoebe-style element-locked deepen amps
// were silently applied in full to the actual displayed DPS number for ANY paired main/sub DPS,
// regardless of element match.
const ELEMENT_NAMES = ['fusion', 'spectro', 'aero', 'glacio', 'electro', 'havoc'];
// A deepen buff can also be locked to a specific DAMAGE MECHANIC rather than (or in addition to) an
// element — e.g. Phoebe's outro is "Spectro Frazzle DMG Amp", which only amplifies Frazzle-type
// damage, not a Spectro DPS's general output. Found via a real recommendation audit (Jinhsi+Zhezhi):
// the buff's condition mentions "spectro" (Jinhsi's own element), so the element-only check above let
// it through in full for Jinhsi — who neither deals nor scales off Frazzle at all (her own `desc`'s
// dmgFocus is Skill/Liberation burst damage) — inflating her score 486.2 vs. her real curated partner
// Shorekeeper's 314.5. Phoebe's own kit description says outright she's "built specifically to
// empower Zani, her only current Frazzle-DPS partner" — Zani's Heavy Slash combo is explicitly
// "flagged as both Heavy Attack and Spectro Frazzle DMG" per her own `desc`, i.e. her own hits are
// computed under the Frazzle category, unlike every other character (whose damage a Frazzle DMG Amp
// buff does nothing for). Ciaccona's outro ("Aero Erosion DMG Amp only") has the identical shape for
// Erosion — kept here as an empty allow-list until a character whose own damage is documented as
// Erosion-flagged the same way Zani's is for Frazzle exists (Ciaccona's own outro buffs "the incoming
// Resonator", not herself, and no current kit text says any character's own hits are Erosion-typed).
// Deliberately a small, explicit, data-driven list — not a heuristic guess — so it only ever rejects
// what's actually confirmed, and extends the same way the last two audits' fixes did (grouped mode
// buffs, element-gated elemDmg) instead of another one-off hardcode.
const MECHANIC_DAMAGE_APPLIERS = { frazzle: ['Zani'], erosion: [] };
export function universalStatApplies(condition, targetElementLower, targetName) {
  const cond = (condition || '').toLowerCase();
  if (!cond) return true;
  for (const [mechanic, appliers] of Object.entries(MECHANIC_DAMAGE_APPLIERS)) {
    if (cond.includes(mechanic) && !appliers.includes(targetName)) return false;
  }
  const mentioned = ELEMENT_NAMES.filter(el => cond.includes(el));
  if (mentioned.length === 0) return true; // no element named — a genuine universal/trigger condition
  return mentioned.includes(targetElementLower);
}

// ── Team composition scoring: tier + role coverage + buff/debuff synergy + element resonance +
// BiS weapon ownership, all reusing data that already exists on every character (element, role,
// dmgFocus, tier, CHAR_BUFF_TABLE's outroBuffs/libBuffs/debuffs, bestWeapon) — no separate
// "recommendation" data model needed, just the same combat data combined correctly. Shared by the
// Team Suggestions card (scoring whole curated/roster-built teams) and the character selector
// (scoring hypothetical [...placed, candidate] teams to rank every possible addition, not just
// ones that happen to appear in someone's hand-curated `teams` string list) — a single source of
// truth so the two can never drift the way they did before this was extracted. ──
export const TIER_SCORES = { 'T0': 40, 'T0.5': 35, 'T1': 28, 'T1.5': 22, 'T2': 16, 'T3': 8, 'T4': 0 };

// ── Real per-type damage-share weighting ──
// scoreTeamComposition used to treat every type-specific DMG buff (Basic/Heavy/Skill/Liberation/
// Echo/Coordinated ATK) as equally valuable once a DPS's dmgFocus list even contained that type at
// all — a binary "applies or doesn't" gate with no sense of which type is actually DOMINANT in that
// character's real rotation. E.g. a +50% Heavy ATK DMG buff and a +25% Liberation DMG buff were
// scored as comparably valuable for Augusta regardless of which type she actually deals more damage
// through. Fixes that using CHARACTER_ROTATIONS (a real, ordered per-character move sequence, where
// each entry already carries a `type` — and, when the actual damage type differs from the INPUT
// button pressed, e.g. Augusta's Liberation-button "Sword of Eternal Oath" whose own note says
// "counted as Heavy ATK DMG", that reclassification is honored over the raw type tag).
// A naive first attempt summed SKILL_MULTIPLIERS' raw per-cast % values instead, but that wrongly
// treats a single Liberation cast (~once per rotation) as equal to one Heavy ATK combo repeated
// many times per rotation — CHARACTER_ROTATIONS' real move-count-per-loop is the correct signal.
const NOTE_OVERRIDE_RE = /counted as ([\w][\w\s+-]*?) DMG/i;
function noteOverrideFocus(note) {
  if (!note) return null;
  const m = note.match(NOTE_OVERRIDE_RE);
  if (!m) return null;
  for (const part of m[1].toLowerCase().split('+').map(p => p.trim())) {
    if (part.includes('basic')) return 'Basic ATK';
    if (part.includes('heavy')) return 'Heavy ATK';
    if (part.includes('liberation')) return 'Liberation';
    if (part.includes('echo')) return 'Echo';
    if (part.includes('coordinated')) return 'Coordinated ATK';
    if (part.includes('skill')) return 'Skill'; // catches "Resonance Skill DMG" and "Skill DMG"
  }
  return null; // e.g. "Spectro Frazzle DMG" — a real effect, but not one of the 6 dmgFocus buckets
}
const ROTATION_RAW_TYPE_TO_FOCUS = {
  'Basic ATK': 'Basic ATK', 'Mid-air': 'Basic ATK', 'Charged ATK': 'Basic ATK',
  'Heavy ATK': 'Heavy ATK', 'Skill': 'Skill', 'Liberation': 'Liberation',
  'Echo': 'Echo', 'Coordinated ATK': 'Coordinated ATK',
  // Intro/Outro/Forte excluded by default — Forte entries are usually a multi-hit continuation of
  // one empowered combo string with no type of their own; only their FIRST hit's note typically
  // restates a "counted as X DMG" override (see the Forte-continuation handling below), and
  // Intro/Outro are one-off utility casts, not a repeated rotation-damage type.
};
const damageTypeShareCache = new Map();
// Real per-type damage share for a character, derived from counting how many times each real
// damage type appears in one full CHARACTER_ROTATIONS loop. Returns null (not an empty object) for
// any character without rotation data, so callers can cleanly fall back to the old flat-equal
// behavior instead of dividing by a zero-length share map.
export function computeDamageTypeShares(name) {
  if (damageTypeShareCache.has(name)) return damageTypeShareCache.get(name);
  const rotation = CHARACTER_ROTATIONS[name];
  let result = null;
  if (rotation) {
    const counts = {};
    let lastForteFocus = null;
    rotation.forEach(entry => {
      const override = noteOverrideFocus(entry.note);
      let focus = override || ROTATION_RAW_TYPE_TO_FOCUS[entry.type];
      if (!focus && entry.type === 'Forte' && lastForteFocus) focus = lastForteFocus;
      lastForteFocus = entry.type === 'Forte' ? (override || lastForteFocus) : null;
      if (!focus) return;
      counts[focus] = (counts[focus] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total > 0) {
      result = {};
      for (const [k, v] of Object.entries(counts)) result[k] = v / total;
    }
  }
  damageTypeShareCache.set(name, result);
  return result;
}
const TYPE_STAT_TO_FOCUS = { basicDmg: 'Basic ATK', heavyDmg: 'Heavy ATK', libDmg: 'Liberation', echoDmg: 'Echo', coordDmg: 'Coordinated ATK', skillDmg: 'Skill' };
// Converts a real share into a multiplier calibrated against the OLD flat-equal assumption, so a
// character with no share data (or a type whose real share happens to exactly equal "1 divided by
// however many types they qualify for") is completely unaffected — only a genuinely dominant or
// genuinely minor type moves score up or down from where it used to sit.
//
// Recalibrated 2026-09-02 (found via two real recommendation audits). The ORIGINAL formula
// (`share * qualifyingTypeCount`, uncapped) let a type-specific buff run away for a DPS whose
// rotation happens to touch few move-type categories: Carlotta+Zhezhi's 3rd-slot list ranked Taoqi —
// T4 tier, a single narrow 'next'-only 38% skillDmg outro buff — ABOVE Shorekeeper (Carlotta's own
// twice-curated real partner, three genuine team-wide buffs combined), because Carlotta's 77.8% Skill
// share × only 3 qualifying categories hit a 2.33x multiplier with no ceiling.
//
// The first fix tried — pure `share`, no count factor at all — is the mathematically "correct" isolated
// quantity (the real fraction of this DPS's damage the buff actually touches), and it did fix Taoqi.
// But it broke a SEPARATE, already-validated case: Mortefi (Augusta's own real curated partner, built
// specifically around her Heavy ATK-heavy kit) fell behind Rebecca (not curated) once Mortefi's
// heavyDmg buff was discounted to Augusta's raw 41.7% Heavy ATK share — Augusta's damage is genuinely
// split across 4 close-ish categories (Heavy ATK 41.7% / Skill 25% / Liberation 25% / Echo 8.3%), so
// pure share over-corrects: Heavy ATK is still clearly her *largest* category, and a buff to it should
// still meaningfully outscore a universal buff of comparable %, not fall to ~42% of one.
//
// Landed on: keep the original share*count formula (still the best available signal for "how
// concentrated is this DPS's damage in the buffed type," since raw share alone can't distinguish
// "genuinely dominant type" from "type mildly ahead of an even split") but CAP it at 1.3 — low enough
// that Taoqi's 2.33x inflation can't repeat (any qualifyingTypeCount/share combination collapses to at
// most a 30% boost over a universal buff of the same %), high enough that Mortefi's real, meaningfully-
// dominant-type buff still outranks Rebecca's discounted-plus-universal combination. Verified against
// all 4 known cases (Taoqi<Shorekeeper, Mortefi>Rebecca, Denia<Lupa, Phoebe<Shorekeeper) before landing.
function typeShareMultiplier(stat, dpsName) {
  const focus = TYPE_STAT_TO_FOCUS[stat];
  if (!focus) return 1;
  const shares = computeDamageTypeShares(dpsName);
  if (!shares || shares[focus] == null) return 1;
  return Math.min(shares[focus] * Object.keys(shares).length, 1.3);
}

// ── Mechanic-grounded synergy uplift: replaces flat "+8 points for a deepen buff, +6 for elemDmg"
// pattern-matching with an estimate of what each buff/debuff actually contributes to DPS output,
// using the same multiplicative bracket structure calcDmgBonus/calcAvgCrit already model. This is
// what makes scoreTeamComposition reason about ANY buffer's kit generically (every character's real
// CHAR_BUFF_TABLE entry, not just ones whose stat names happened to match a hardcoded case) instead
// of only recognizing synergy patterns someone thought to hardcode. SYNERGY_BASELINE is a plausible
// endgame-geared solo Main DPS snapshot (roughly BiS-adjacent echo/weapon investment) used ONLY to
// measure each buff type's *relative marginal* value against the game's real formula shape — e.g. a
// deepen buff is genuinely worth more than an equal-% elemDmg buff because deepen is its own
// multiplicative bracket rather than diluted into the already-large elemDmg+skillDmg additive one,
// same reason real theorycrafting prizes deepen buffers (Zhezhi/Roccia/Galbrena-style kits) — this
// derives that from the formula instead of hardcoding the conclusion. Never used for actual damage
// numbers, only for ranking hypothetical teams relative to each other.
const SYNERGY_BASELINE = { atkPct: 220, cr: 65, cd: 220, elemDmg: 40, skillDmg: 0, amplify: 0, deepen: 0 };
function synergyDmgIndex(s) {
  return (1 + s.atkPct / 100) * calcAvgCrit(s.cr, s.cd) * calcDmgBonus(s.elemDmg, s.skillDmg, s.amplify, s.deepen);
}
const SYNERGY_BASE_INDEX = synergyDmgIndex(SYNERGY_BASELINE);
// Returns the % DPS uplift a single buff of this stat/value contributes on top of SYNERGY_BASELINE.
// defShred/resShred/defIgnore go through the real defense/resistance multiplier formulas instead of
// the offense-side dmgIndex (they're a separate multiplicative stage of the damage formula entirely).
export function estimateBuffUplift(stat, value) {
  if (!value) return 0;
  if (stat === 'defShred' || stat === 'defIgnore') {
    const before = calcDefMult(1000, stat === 'defShred' ? 0 : 0, 0);
    const after = calcDefMult(1000, stat === 'defShred' ? value : 0, stat === 'defIgnore' ? value : 0);
    return (after / before - 1) * 100;
  }
  if (stat === 'resShred') {
    const before = calcResMult(10, 0);
    const after = calcResMult(10, value);
    return (after / before - 1) * 100;
  }
  const s = { ...SYNERGY_BASELINE };
  switch (stat) {
    case 'atkPct': s.atkPct += value; break;
    case 'critRate': s.cr = Math.min(100, s.cr + value); break;
    case 'critDmg': s.cd += value; break;
    case 'elemDmg': case 'allDmg': s.elemDmg += value; break;
    case 'skillDmg': case 'basicDmg': case 'heavyDmg': case 'libDmg': case 'echoDmg': case 'coordDmg':
      s.skillDmg += value; break; // once type-matched to the DPS's dmgFocus, these all route into skillDmg's bracket
    case 'deepen': case 'offTune': s.deepen += value; break;
    default: return 0;
  }
  return (synergyDmgIndex(s) / SYNERGY_BASE_INDEX - 1) * 100;
}
// Uptime-scale a buff's uplift by how much of the Main DPS's actual ON-FIELD window it can
// realistically cover — the relevant comparison is against onField, not the full rotTime, because
// a buff sitting on the DPS while they're off-field contributes nothing. Outro-triggered buffs exist
// specifically to be timed with the incoming DPS's swap-in, so this models "does the buff still cover
// them by the time their on-field segment ends" rather than "does it cover the whole team rotation" —
// a 20%-uplift buff lasting 8s covers all of a 6s on-field burst DPS at full value, but only ~40% of
// a 20s on-field hypercarry's window. Falls back to rotTime, then to full uptime, when onField/rotTime
// aren't available (undurationed passive/permanent buffs, or a DPS missing that data).
export function uptimeScaledUplift(stat, value, buffDuration, onFieldOrRotTime) {
  const raw = estimateBuffUplift(stat, value);
  if (!raw || !buffDuration || !onFieldOrRotTime) return raw;
  return raw * Math.min(1, buffDuration / onFieldOrRotTime);
}
// Points-per-%-uplift conversion so the new mechanic-grounded scoring stays on a comparable scale to
// the tier/role/element point totals elsewhere in scoreTeamComposition (Meta/Strong tag thresholds
// were calibrated against the old score range) — 1% real DPS uplift ≈ 2.5 composition-score points.
const UPLIFT_TO_SCORE = 2.5;

// ── Normalized DPS power score (0-25), calibrated against an observed ATK-equivalent totalMult
// range of ~2000-3800 — extracted from what was originally inline-only Main DPS scoring (see the
// comment block that used to live here, now at the mainDps call site below) so a Sub DPS's own real
// damage output can be scored on the exact same calibrated scale instead of inventing a second one.
// Converts HP/DEF-scaling totalMult onto the ATK-scaling unit the 2000-3800 calibration expects —
// see the mainDps call site for the full explanation of why that conversion is needed.
function normalizedDpsPowerScore(charName) {
  const d = CHARACTER_DATA[charName];
  const scalingBase = d?.statScaling === 'HP' ? d?.baseHp
    : d?.statScaling === 'DEF' ? d?.baseDef
    : d?.baseAtk;
  const REFERENCE_BASE_ATK = 400; // typical 5★ Main DPS baseAtk (observed range ~375-460)
  const rawMult = d?.totalMult || 0;
  const isAltScaling = d?.statScaling === 'HP' || d?.statScaling === 'DEF';
  const dpsMult = (isAltScaling && scalingBase) ? rawMult * (scalingBase / REFERENCE_BASE_ATK) : rawMult;
  return Math.max(0, Math.min(25, Math.round((dpsMult - 2000) / 72)));
}

// ── Sub-DPS off-field/Coordinated-ATK field-time-share multiplier ──────────────────────────────
// Mirrors calcTeamStats.js's own real-damage-calculator math for how much of a non-mainDps member's
// totalMult they can actually land — the RAW-tier block at calcTeamStats.js:520-540 (duplicated,
// with team-buff context added, at the FULL-tier block :962-995). That is the ground-truth formula
// this pass was asked to reuse rather than re-approximate: off-field members split the mainDps's
// off-field window proportionally to their own onField need (`fieldRatio`), while the 7
// Coordinated-ATK-role characters (Baizhi, Cantarella, Mortefi, Verina, Yinlin, Yuanwu, Zhezhi —
// resonance-chain-mechanics.md §6) instead deal a `coordShare` portion of their damage during the
// mainDps's ON-field window (`coordUptime`), since their CA hits trigger off the on-field ally's
// attacks rather than needing their own field time. Extracted (not reimplemented) so this scorer's
// numbers can't independently drift from the real calculator's — see the note at the bottom of this
// file on why `composeTeamRotation` was deleted for exactly that failure mode.
export function calcSubDpsFieldMultRatio(member, subDpsPool, mainOnField, rotTime) {
  const d = CHARACTER_DATA[member];
  if (!d || !(d.totalMult > 0)) return 0;
  const subOnField = d.onField || 5;
  const offFieldTime = Math.max(0, rotTime - mainOnField);
  const totalSubNeed = subDpsPool.reduce((s, m) => s + (CHARACTER_DATA[m]?.onField || 5), 0) || 1;
  const allocatedTime = offFieldTime * (subOnField / totalSubNeed);
  const fieldRatio = Math.min(1, allocatedTime / subOnField);
  const focus = d.dmgFocus || [];
  if (focus.includes('Coordinated ATK')) {
    const coordShare = focus.length === 1 ? 0.8 : 0.5; // pure coord chars vs. hybrid, same as calcTeamStats.js
    const coordUptime = Math.min(1, mainOnField / rotTime);
    return coordShare * coordUptime + (1 - coordShare) * fieldRatio;
  }
  return fieldRatio;
}

// dpsOverride: an explicit headline-DPS pick for THIS hypothetical/candidate team — mirrors the
// crown (mainDpsOverride) the player can set on a real built team in calcTeamStats.js. Without it,
// this function could only ever recognize a statically role-tagged 'Main DPS' member as the team's
// carry, so any candidate team built around a Sub DPS (or other off-role character) run as a
// realistic/overused hypercarry — a genuinely common way these are actually played — scored with NO
// DPS-power component at all, understating it versus a canonical Main-DPS-led team of equal quality.
export function scoreTeamComposition(members, ownedWeaps = new Set(), dpsOverride, enemyResMap = null) {
  let score = 0;
  const roles = members.map(m => CHARACTER_DATA[m]?.role).filter(Boolean);
  const tags = [];
  // Tier
  let tierSum = 0;
  members.forEach(m => { const t = CHARACTER_DATA[m]?.tier?.toa; if (t) tierSum += (TIER_SCORES[t] ?? 10); });
  score += tierSum;
  // Meta = truly top-tier (needs ≥2 T0 members, ~115+ pts)
  if (tierSum >= 115) tags.push('Meta');
  else if (tierSum >= 95) tags.push('Strong');
  // Roles
  const hasMain = roles.includes('Main DPS'), hasSub = roles.includes('Sub DPS');
  // .includes() here checks exact array-element equality, not substring — a compound role like
  // 'Support/Healer' (Chisa, Suisui) would never match either, so a team with just one of them as
  // its only healer/support scored as having neither. Use the substring-aware role helpers instead.
  const hasHeal = roles.some(isHealerRole), hasSupp = roles.some(isSupportRole);
  if (hasMain) score += 15; if (hasHeal || hasSupp) score += 10; if (hasSub) score += 8;
  if (hasMain && (hasHeal || hasSupp) && hasSub) { score += 15; tags.push('Balanced'); }
  // DPS power + buff synergy
  const roleMainDps = members.find(m => CHARACTER_DATA[m]?.role === 'Main DPS');
  const mainDps = (dpsOverride && members.includes(dpsOverride)) ? dpsOverride : roleMainDps;
  // Flag any team whose actual carry isn't the statically role-tagged 'Main DPS' — an off-role
  // carry (e.g. a Sub DPS run solo) is a real, often overused way these are actually played,
  // not a mistake, so it's surfaced as a tag rather than hidden or penalized.
  // Named 'Off-Role Carry', NOT 'Hypercarry' — engine-crosscheck-notes.md (2026-08-31) flagged that
  // 'Hypercarry' already names a DIFFERENT, unrelated concept in references/combat-db/synergy/
  // team-archetypes.json: a team shape (one Main DPS + two pure buffers, no other damage dealer at
  // all — see that file's archetypeShapes.Hypercarry). This tag means "the real carry isn't the
  // role-tagged Main DPS", which has nothing to do with that shape and could collide with it once
  // real archetype-shape tags are added to this same `tags` array.
  if (mainDps && mainDps !== roleMainDps) tags.push('Off-Role Carry');
  if (mainDps) {
    // Main DPS totalMult currently spans ~2200 (Lingyang) to 3800 (Aemeath) across the roster --
    // but that range only holds for ATK-scaling DPS. totalMult is "% of the character's own scaling
    // stat" (calcTeamStats.js: mDmg = baseStat * mult/100 * ...), and an HP-scaling DPS's baseStat
    // (Cartethyia: baseHp 14800) is ~35x an ATK-scaling DPS's baseAtk (~350-460), so their totalMult
    // is calibrated on a completely different scale (Cartethyia: 110, not 2200-3800) to produce a
    // comparable real damage number. Reading it as a raw 2200-3800-range value here would have
    // scored every HP/DEF-scaling DPS as ~0 (clamped) regardless of how strong they actually are.
    // Convert to an ATK-equivalent mult first (raw scaling-stat output ÷ a typical 5★ DPS baseAtk)
    // so this stays comparable across ATK/HP/DEF scalers before applying the existing calibration.
    // (Now shared via normalizedDpsPowerScore, above, so a Sub DPS's own contribution — added below
    // — is scored on this exact same calibrated scale rather than a second invented one.)
    let dpsScore = normalizedDpsPowerScore(mainDps);
    const dpsFocus = CHARACTER_DATA[mainDps]?.dmgFocus || [];
    // A Liberation-focused DPS with a 175-Energy cost (calcEnergyCycles' own cutoff for the harder ER
    // threshold, ER_THRESHOLD_HEALER) is genuinely harder to keep at full Liberation uptime without
    // dedicated ER investment — this suggestion context can't assume the player has built that, so
    // apply the same mild discount to their own power score that a high-cost support gets below,
    // rather than only ever discounting OTHER members' output and treating the DPS's own energy cost
    // as free.
    if (dpsFocus.includes('Liberation') && (CHARACTER_DATA[mainDps]?.maxEnergy || 0) >= 175) dpsScore *= 0.85;
    const dpsEl = (CHARACTER_DATA[mainDps]?.element || '').toLowerCase();
    // Without a selected enemy this stays a pure enemy-blind synergy score, same as before. With one,
    // fold in the mainDps's element RES against that specific enemy (same calcResMult the real damage
    // calc uses, and the same "no data -> 10%" fallback calcTeamStats.js's getEnemyRes uses) so the
    // list this powers (TeamsTab's "Team Suggestions" card) actually reorders per-enemy instead of
    // always surfacing the same generically-strongest team regardless of which target is selected.
    if (enemyResMap) dpsScore *= calcResMult(enemyResMap[dpsEl] ?? 10, 0);
    score += dpsScore;
    // Compare a buff/support's uptime against the DPS's actual on-field window, not the whole
    // rotation — a buff sitting on them while off-field does nothing. Falls back to rotTime only
    // when onField isn't tracked for this character.
    const dpsOnField = CHARACTER_DATA[mainDps]?.onField || CHARACTER_DATA[mainDps]?.rotTime;
    // ── Team rotation time + off-field member pool, mirroring calcTeamStats.js's rawRotTime/
    // subDpsMembers setup (calcTeamStats.js:144-145,518-522) so calcSubDpsFieldMultRatio (below)
    // gets the same inputs the real damage calculator itself derives them from — same sumOnField
    // clamp, same "any non-mainDps member with real totalMult competes for off-field time" pool.
    const sumOnField = members.reduce((s, m) => s + (CHARACTER_DATA[m]?.onField ?? (m === mainDps ? 15 : 5)), 0);
    const teamRotTime = Math.max(15, Math.min(35, sumOnField + 2));
    const teamMainOnField = Math.min(dpsOnField || 15, teamRotTime * 0.8);
    // Fixed 2026-09-01 (found via a per-character/all-pairs recommendation audit — top-tier, unrelated-
    // element Main DPS like Hiyuki/Aemeath/Sigrika kept winning "who should I add next" for characters
    // they share nothing with, purely off this credit): this scorer evaluates HYPOTHETICAL teams that
    // may still be incomplete — TeamsTab.jsx's teammate selector scores every candidate against just
    // the already-placed members, as few as 1 of the eventual 3. calcSubDpsFieldMultRatio's own field-
    // time-share math (shared with the real calcTeamStats.js FULL tier, where `members` is always a
    // real, complete 3-slot team) assumes subDpsPool already lists EVERY off-field competitor for the
    // mainDps's remaining on-field window — true there, but not yet true for a 2-member hypothetical: a
    // still-unpicked slot will also compete for that same window once the team is actually finished,
    // and omitting it handed 100% of the off-field time to a single lone candidate that a genuine 3rd
    // teammate will end up splitting it with, inflating that candidate's real off-field-DPS credit well
    // past what they'd realistically land on a finished team. Pad the pool with a placeholder (onField
    // defaults to 5 via calcSubDpsFieldMultRatio's own existing `|| 5` fallback for an unrecognized
    // name) for each still-open slot, so an incomplete hypothetical's off-field-DPS credit reflects the
    // same time-sharing a real completed team would apply — a real, complete team (openSlots === 0)
    // scores byte-identical to before this fix.
    const STANDARD_TEAM_SIZE = 3;
    const openSlots = Math.max(0, STANDARD_TEAM_SIZE - members.length);
    const subDpsPool = members.filter(m => m !== mainDps && (CHARACTER_DATA[m]?.totalMult || 0) > 0)
      .concat(Array.from({ length: openSlots }, (_, i) => `__open-slot-${i}__`));
    // A non-mainDps member's own real-damage-equivalent contribution, on the same 0-25 power scale
    // and enemy-RES gate as the mainDps score above, discounted by how much of their totalMult they
    // can actually realistically land per calcSubDpsFieldMultRatio (real fieldRatio/coordShare math,
    // not a flat guess). Shared by the Sub DPS credit and the second-Main-DPS redundancy check below.
    const subDpsOwnContribution = (m) => {
      const fieldMult = calcSubDpsFieldMultRatio(m, subDpsPool, teamMainOnField, teamRotTime);
      if (fieldMult <= 0) return 0;
      let contribution = normalizedDpsPowerScore(m) * fieldMult;
      if (enemyResMap) {
        const el = (CHARACTER_DATA[m]?.element || '').toLowerCase();
        contribution *= calcResMult(enemyResMap[el] ?? 10, 0);
      }
      return contribution;
    };
    // An elemDmg buff only helps this DPS if its condition (when present) actually names their
    // element or "all" — otherwise it's a buff for a different attribute that does nothing here.
    const elemBuffApplies = (b) => { const cond = (b.condition || '').toLowerCase(); return !cond || cond.includes(dpsEl) || cond.includes('all'); };
    // deepen/offTune/allDmg were previously treated as always-universal (no gate at all), but several
    // kits' amps are explicitly locked to their OWN element/mechanic in free-text condition (e.g.
    // Ciaccona's outro: "Aero Erosion DMG Amp only"; Phoebe's outro: "Spectro Frazzle DMG Amp
    // (Confession)") — those did nothing for an off-element DPS but still scored full uplift, which is
    // exactly how both got phantom-recommended as top-8 teammates for Aemeath (Fusion, no
    // Frazzle/Erosion in her kit). Unlike elemDmg (genuinely element-scoped, needs elemBuffApplies'
    // strict "names this element or says all" check), these three stats are universal BY DEFAULT —
    // this only rejects when the condition explicitly names a DIFFERENT element than the DPS's own. A
    // condition with no element mentioned at all (most of them: pure activation-trigger text, e.g.
    // Denia's "Tune Strain mode..." allDmg outro) stays universal, exactly as its stat name promises.
    const deepenBuffApplies = (b) => universalStatApplies(b.condition, dpsEl, mainDps);
    // A type-specific buff (basicDmg/heavyDmg/echoDmg/skillDmg/coordDmg) only routes into the DPS's
    // damage at all if their dmgFocus actually includes that attack type — routeTypeBonuses in this
    // same file enforces the identical gate for the real damage calc, so scoring has to match it or
    // it'll credit synergy that mechanically does nothing for this specific DPS.
    const typeFocusMap = { basicDmg: 'Basic ATK', heavyDmg: 'Heavy ATK', libDmg: 'Liberation', echoDmg: 'Echo', coordDmg: 'Coordinated ATK', skillDmg: 'Skill' };
    const buffApplies = (b) => {
      if (typeFocusMap[b.stat]) return dpsFocus.includes(typeFocusMap[b.stat]);
      // elemDmg is genuinely element-scoped by definition, so it needs the strict check: condition
      // must explicitly name this DPS's element or say "all" (elemBuffApplies).
      if (b.stat === 'elemDmg') return elemBuffApplies(b);
      // allDmg means "All-Attribute DMG" by its own stat name — it is NOT element-scoped, so routing
      // it through elemBuffApplies (which requires the condition to literally contain "all" or the
      // DPS's element) was wrongly rejecting real allDmg buffs whose condition text only describes an
      // unrelated activation trigger (Denia's "Tune Strain mode..." outro, Suisui's "400+ Floral
      // Epistle consumed..." outro — neither mentions any element or the word "all", so both scored
      // zero synergy for every DPS, including a perfectly-matched one). Same off-element-mismatch-only
      // gate as deepen/offTune below is the correct check here.
      if (b.stat === 'allDmg' || b.stat === 'deepen' || b.stat === 'offTune') return deepenBuffApplies(b);
      return true; // atkPct/critRate/critDmg are universal, no gate needed
    };
    // Score any buff generically via real formula-derived uplift — this is what lets a completely
    // off-meta pairing (any character whose CHAR_BUFF_TABLE just happens to fit) get credited the
    // same way a hand-curated team would, instead of only recognizing patterns someone hardcoded.
    const buffScoreContribution = (b) => {
      if (!buffApplies(b)) return 0;
      const uplift = uptimeScaledUplift(b.stat, b.value, b.duration, dpsOnField);
      if (uplift <= 0) return 0;
      return uplift * UPLIFT_TO_SCORE * typeShareMultiplier(b.stat, mainDps);
    };
    const applyBuffTag = (b) => {
      if (b.stat === 'deepen' || b.stat === 'offTune') tags.push('Deepen');
      else if (b.stat === 'basicDmg') tags.push('ATK Amp');
      else if (b.stat === 'heavyDmg') tags.push('Heavy Amp');
      else if (b.stat === 'echoDmg') tags.push('Echo Amp');
    };
    const scoreBuff = (b) => {
      const contribution = buffScoreContribution(b);
      if (contribution <= 0) return;
      score += contribution;
      applyBuffTag(b);
    };
    // outroBuffs from a dual-mode Hybrid (e.g. Denia: Fusion Burst vs Tune Strain, Lucilla: Glacio
    // Chafe vs Echo mode — both characters' own `desc` field says so explicitly: "depending on
    // Resonance Mode") represent ALTERNATIVE builds a player picks one of, not simultaneous effects —
    // unlike every other multi-entry outroBuffs case in this table (e.g. Yinlin's elemDmg + libDmg,
    // Roccia's elemDmg + basicDmg), which really do fire together off the SAME outro cast. Found via
    // a real audit (Encore+Shorekeeper recommendations): scoring both of Denia's mode-locked buffs at
    // once inflated her above Encore's own curated real partners (Brant/Lupa), crediting a team state
    // that can't actually happen in one rotation. The existing data convention already names the
    // mechanic ("... mode" in the condition text) for every dual-mode entry — group by that literal
    // marker and take only the single best-applying one per group instead of summing, while every
    // other outroBuffs entry (no "mode" in its condition) keeps summing exactly as before.
    const scoreOutroBuffs = (list) => {
      const modeGroup = list.filter(b => (b.condition || '').toLowerCase().includes('mode'));
      const rest = list.filter(b => !modeGroup.includes(b));
      rest.forEach(scoreBuff);
      if (!modeGroup.length) return;
      let best = null;
      let bestContribution = -Infinity;
      modeGroup.forEach(b => {
        const contribution = buffScoreContribution(b);
        if (contribution > bestContribution) { bestContribution = contribution; best = b; }
      });
      if (best && bestContribution > 0) {
        score += bestContribution;
        applyBuffTag(best);
      }
    };
    members.forEach(m => {
      if (m === mainDps) return;
      // Two Main DPS in one team is a real, deliberate pattern in some specific cases (they share a
      // buff that makes running both worth the traded on-field time/energy — e.g. a Fusion Main DPS
      // buffing another Fusion Main DPS's element), but it's a real cost the rest of this scorer never
      // otherwise accounts for (whoever isn't mainDps here spends their own on-field window/energy
      // economy contributing ~nothing to the team's headline damage unless their kit actually buffs the
      // real mainDps). Track this member's own score contribution and penalize redundant hypercarries
      // that bring no such payoff, instead of crediting a second DPS's tier/element-resonance points as
      // if it were a free support slot.
      const scoreBeforeMember = score;
      const bt = CHAR_BUFF_TABLE[m];
      if (bt) {
        scoreOutroBuffs(bt.outroBuffs || []);
        // selfBuffs with target:'team' are a real, deliberate data convention (see Sigrika's Blessing
        // of Runes — "+48% Aero DMG to whichever Resonator is active", explicitly NOT self-only despite
        // living in the selfBuffs array — and Rover: Electro's Overshock team ATK buff) for a passive,
        // always-on team-wide effect that isn't tied to an outro/Liberation trigger. This loop only
        // ever read outroBuffs/libBuffs/debuffs from a teammate, so any character whose real team
        // contribution is modeled this way was scored as if that buff didn't exist at all when being
        // evaluated as a partner for someone else. True self-only entries (target:'self') are correctly
        // still skipped here — only the small number of genuinely team-scoped selfBuffs qualify.
        (bt.selfBuffs || []).forEach(b => { if (b.target === 'team') scoreBuff(b); });
        // Liberation-triggered team/next buffs (Verina/Shorekeeper/Baizhi-style healers/supports).
        // High-cost (175 Energy) Liberation-reliant supports need real ER investment to sustain uptime
        // that a generic roster-suggestion context can't assume the player has built — 175 is the same
        // cost cutoff calcEnergyCycles uses to switch to its harder ER_THRESHOLD_HEALER target, applied
        // here as a mild discount on this support's own libBuff output rather than assuming either full
        // uptime or zero. (Comparing maxEnergy, a cost in the ~100-175 range, directly against
        // ER_THRESHOLD_HEALER, a 140% ER *target*, would silently mix units — use the real 175 cutoff.)
        const erDiscount = (CHARACTER_DATA[m]?.maxEnergy || 0) >= 175 ? 0.85 : 1;
        (bt.libBuffs || []).forEach(b => {
          if (b.target !== 'team' && b.target !== 'next') return;
          if (!buffApplies(b)) return;
          const uplift = uptimeScaledUplift(b.stat, b.value, b.duration, dpsOnField) * erDiscount;
          if (uplift > 0) score += uplift * UPLIFT_TO_SCORE * typeShareMultiplier(b.stat, mainDps);
        });
        (bt.debuffs || []).forEach(db => {
          if (db.stat === 'defShred' || db.stat === 'resShred') {
            // Fixed 2026-09-01 (found via a per-character solo-recommendation deep audit): RES Shred
            // reduces enemy RESISTANCE TO A SPECIFIC ELEMENT — e.g. Lupa's own debuff condition says
            // "Fusion RES ignore..." outright — so it only helps a DPS who deals THAT element's
            // damage, same as an elemDmg buff. Unlike DEF (a flat, element-agnostic stat every damage
            // type is reduced by equally, correctly left ungated), this had NO gate at all: Lupa's
            // Fusion-only RES Shred was crediting full uplift for a placed Havoc/Aero/Electro carry
            // who can never trigger it, helping crown her the #1 recommendation for several off-
            // element characters (Chisa, Ciaccona, Lumi, Rover: Havoc) she has no real Fusion-locked
            // synergy with. Reuse elemBuffApplies (already used for elemDmg buffs) — a condition that
            // doesn't name a specific element stays universal, exactly like it does for elemDmg.
            if (db.stat === 'resShred' && !elemBuffApplies(db)) return;
            const uplift = estimateBuffUplift(db.stat, db.value);
            if (uplift > 0) { score += uplift * UPLIFT_TO_SCORE; tags.push('Shred'); }
          }
          if (db.stat === 'frazzle') { score += 5; tags.push('Frazzle'); }
          if (db.stat === 'erosion') { score += 5; tags.push('Erosion'); }
          // 'deepen'/'offTune' as a debuff stat (enemy DMG Taken, e.g. Galbrena's Afterflame) is a
          // damage multiplier just like the buff-side 'deepen' — same off-element gate applies (a
          // debuff condition can name a specific element/mechanic just as easily as a buff's can).
          // Unlike outroBuffs/libBuffs above, this was given zero uptime/reliability discount at
          // all — Galbrena's Afterflame ("+1.5%/stack DMG Taken... while Galbrena is in Demon
          // Hypostasis, up to 60%") requires HER OWN sustained on-field engagement to generate and
          // hold, which she can't realistically get while benched as a suggested teammate for a
          // different headline DPS (Augusta). Uncapped, this alone (150 score pts) was enough to
          // rank Galbrena #1 above every one of Augusta's real curated partners, and to wrongly
          // earn the "Dual DPS" tag instead of the "Redundant DPS" penalty that check exists
          // specifically to catch (score > scoreBeforeMember only looked true because of this).
          // Same self-state-dependency logic as the ER-uptime/echo-set-potential discounts already
          // established elsewhere in this function: discount a second Main DPS's own state-gated
          // debuff, since a benched, non-headline Main DPS's on-field time can't be assumed.
          if (db.stat === 'deepen' || db.stat === 'offTune') {
            if (deepenBuffApplies(db)) {
              const selfStateDiscount = (CHARACTER_DATA[m]?.role === 'Main DPS' && m !== mainDps) ? 0.35 : 1;
              const u = estimateBuffUplift('deepen', db.value) * selfStateDiscount;
              if (u > 0) score += u * UPLIFT_TO_SCORE;
            }
          }
        });
        // Healer/support team-wide echo-set potential (Rejuvenating Glow, Halo of Starry Radiance, ...):
        // TEAM_SET_BUFFS is only ever applied in calcTeamStats.js for a team the player has ALREADY
        // built with that echo set equipped — the recommendation engine had no equivalent at all, so a
        // healer's single biggest realistic team contribution (their own bestEchoes' documented #1/#2
        // heal-triggered team ATK% set, e.g. Verina/Shorekeeper/Baizhi all list "Rejuvenating Glow 5pc")
        // was invisible here even though it's the character's own data, not a guess. Unlike bestWeapon
        // (only credited when ownedWeaps confirms the player actually has it), echo sets aren't tracked
        // per-candidate here, so this is real but unconfirmed potential, not a guarantee — scored at a
        // discount vs. a confirmed kit buff, same spirit as the ER-uptime discount above.
        const ECHO_SET_POTENTIAL_DISCOUNT = 0.6;
        (CHARACTER_DATA[m]?.bestEchoes || []).forEach(entry => {
          const setName = Object.keys(TEAM_SET_BUFFS).find(sn => entry.includes(sn));
          if (!setName) return;
          TEAM_SET_BUFFS[setName].forEach(b => {
            if (!buffApplies(b)) return;
            const uplift = estimateBuffUplift(b.stat, b.value) * ECHO_SET_POTENTIAL_DISCOUNT;
            if (uplift > 0) { score += uplift * UPLIFT_TO_SCORE; tags.push('Echo Set Potential'); }
          });
        });
      }
      // Redundant-hypercarry penalty: a second Main DPS earns its slot only if it demonstrably
      // buffed the real mainDps above (scoreBeforeMember < score) — that's the "specific case" where
      // running two Main DPS together is genuinely worth it (a shared buff pays for the traded
      // on-field time/energy). Otherwise this member's own tier/element-resonance points are still
      // counted (they ARE a real, buildable Resonator) but the redundancy itself — a hypercarry
      // slot spent on a unit that never turns on for this DPS — costs more than a slot spent on any
      // dedicated support would have, so the whole candidate is pushed back down the ranking instead
      // of parking two same-role carries side by side with no synergy tag to show for it.
      if (CHARACTER_DATA[m]?.role === 'Main DPS') {
        if (score > scoreBeforeMember) tags.push('Dual DPS');
        else {
          // Previously a flat -20 whenever a second Main DPS didn't buff the real mainDps — but a
          // second Main DPS run intentionally off-field (the same real mechanic that makes a
          // role:'Sub DPS' character's own damage worth crediting below) is a genuine, undervalued
          // pattern, not just a benched hypercarry. Give it the same real-damage credit a Sub DPS
          // gets; only penalize when it's neither buffing mainDps NOR contributing real off-field
          // damage of its own.
          const offFieldContribution = subDpsOwnContribution(m);
          if (offFieldContribution > 0) { score += offFieldContribution; tags.push('Off-Field DPS'); }
          else { score -= 20; tags.push('Redundant DPS'); }
        }
      } else if (CHARACTER_DATA[m]?.role === 'Sub DPS') {
        // NEW: credit this Sub DPS's own real off-field/Coordinated-ATK damage contribution — the
        // gap flagged in engine-crosscheck-notes.md's 2026-08-31 "Coordinated Attack presence bonus"
        // entry. Additive to the buff-synergy-to-mainDps scoring above: a Sub DPS who both buffs the
        // mainDps AND deals real damage of their own scores higher than one who does only one.
        const contribution = subDpsOwnContribution(m);
        if (contribution > 0) { score += contribution; tags.push('Sub DPS Damage'); }
      }
    });
  }
  // Element — REMOVED 2026-09-02 (found via a follow-up recommendation audit, after a user's real-
  // game-knowledge check: "being same element gives you nothing in the game unless [a] specific
  // buff [requires it] — there are a lot of teams NOT of the same element", citing a real, played
  // mixed-element trio (Qingxiao + Denia + Mornye) as counter-evidence). Confirmed against the
  // codebase's own domain knowledge: Wuthering Waves has no mono-element/elemental-reaction team
  // mechanic — unlike games that do (e.g. Genshin's elemental reactions), sharing an element between
  // teammates does nothing on its own. The only real elemental synergy is a SPECIFIC character's
  // elemDmg buff actually naming the recipient's element — already scored correctly, separately,
  // elsewhere in this function via elemBuffApplies (buffScoreContribution/scoreBuff), which requires
  // that literal match. This flat, unconditional bonus for element overlap (previously +12 for any
  // partial match, +20 for a complete mono team) was awarding synergy that doesn't mechanically
  // exist, on top of whatever real elemDmg-buff credit already applied correctly — confirmed as the
  // exact mechanism that let Rebecca (Electro, same as Augusta, but no element-locked buff at all)
  // outrank Iuno, Augusta's own curated real partner (Aero — off-element, but with a real, genuine
  // heavyDmg buff): Rebecca's ONLY edge over an off-element pick with equal/better real synergy was
  // this ungrounded +12. Removed entirely rather than re-tuned, since no version of "same element
  // matters on its own" is true here to calibrate toward.
  // BiS weapon
  let hasBis = false, hasGoodWeapon = false;
  members.forEach(m => {
    const d = CHARACTER_DATA[m]; if (!d) return;
    if (d.bestWeapon && ownedWeaps.has(d.bestWeapon)) { score += d.role === 'Main DPS' ? 12 : 4; hasBis = true; return; }
    // Signature/limited bestWeapon is often not owned, but a top-tier alt5 substitute (the character's
    // own documented near-BiS pick, e.g. Aemeath's Emerald of Genesis at 83.5% vs. her signature) is a
    // real, common case that previously scored as if the player had NO good weapon at all for this
    // member — same all-or-nothing gap bestEchoes potential had before this pass, just for weapons.
    // Half the exact-BiS bonus reflects the real (if smaller) DPS gap vs. the signature.
    if ((d.weaponAlts?.alt5 || []).some(w => ownedWeaps.has(w))) { score += d.role === 'Main DPS' ? 6 : 2; hasGoodWeapon = true; }
  });
  if (hasBis) tags.push('BiS Weapon');
  else if (hasGoodWeapon) tags.push('Good Weapon');
  return { score, tags: [...new Set(tags)].slice(0, 3) };
}

// Hardcoded team-wide echo-set bonuses that don't come from a per-member p5val (WuWa sets whose
// team ATK/DMG bonus is an approximated flat number rather than a modeled trigger). Kept as a single
// table so the DPS math and the rotation timeline read the exact same numbers instead of drifting —
// previously these were only added to the stat totals and never shown as a buff bar on the timeline.
const TEAM_SET_BUFFS = {
  'Rejuvenating Glow': [{ stat: 'atkPct', value: 15 }],
  'Moonlit Clouds': [{ stat: 'atkPct', value: 22.5 }],
  'Empyrean Anthem': [{ stat: 'atkPct', value: 30 }], // 20% ATK × 2 stacks, ~75% uptime ≈ 30%
  'Tidebreaking Courage': [{ stat: 'elemDmg', value: 30 }], // 30% All-Attr DMG team-wide at ≥250% ER
  'Halo of Starry Radiance': [{ stat: 'atkPct', value: 25 }], // Up to +25% ATK via Off-Tune healing
  'Pact of Neonlight Leap': [{ stat: 'atkPct', value: 30 }], // +15% base + up to 15% from Tune Break Boost
  'Gusts of Welkin': [{ stat: 'elemDmg', value: 30, elem: 'aero' }], // 15% + 15% Aero DMG on Erosion trigger
  'Windward Pilgrimage': [{ stat: 'elemDmg', value: 15, elem: 'aero' }],
  'Flaming Clawprint': [{ stat: 'elemDmg', value: 15, elem: 'fusion' }, { stat: 'libDmg', value: 20 }],
  'Midnight Veil': [{ stat: 'elemDmg', value: 15, elem: 'havoc' }],
  'Chromatic Foam': [{ stat: 'elemDmg', value: 25, elem: 'fusion' }], // Outro: +25% Fusion for next
};

// Maps CHARACTER_DATA.dmgFocus's short tags to the long-form wiki tag names COMBAT_ROLE_ICONS
// is keyed by — same mapping CollectionTab/CharacterDetailModal use for the "All Damage" filter
// and Combat Role badges, so this section's icons match the rest of the app instead of drifting.
const DMG_FOCUS_ROLE_TAG = {
  'Basic ATK': 'Basic Attack Damage',
  'Heavy ATK': 'Heavy Attack Damage',
  'Skill': 'Resonance Skill Damage',
  'Liberation': 'Resonance Liberation Damage',
  'Echo': 'Echo Skill Damage',
  'Coordinated ATK': 'Coordinated Attack',
};

export { TEAM_SET_BUFFS, DMG_FOCUS_ROLE_TAG };

// NOTE: an earlier version of this file had a second, cruder rotation-composer here
// (composeTeamRotation) that duplicated what DamageCalculator.jsx's rotationTimeline/steps
// computation already does — and did it worse: naive placed-slot order instead of the real
// hasTeamOutro/nextOutroValue-driven ordering, static rather than simulation-derived on-field
// durations, and no shared source of truth with the Rotation Timeline Gantt chart. Two
// independently-maintained "team rotation" features drift apart by construction, so it was
// removed rather than kept as a second implementation — DamageCalculator's rotationTimeline.steps
// (rendered by the "Rotation Guide" card) is the one true composed-rotation feature now, and it
// additionally consumes CHARACTER_ROTATIONS for its per-character skill sequence.
