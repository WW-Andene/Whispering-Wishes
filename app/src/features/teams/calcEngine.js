// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — teams/calcEngine.js
// Extracted calculation utilities for the damage calculator.
// Eliminates tripled logic (raw/full/sub-DPS) by providing shared functions.
// ═══════════════════════════════════════════════════════════════════════════════

import { WEAPON_DATA } from '../../data/weapons.js';
import { ECHO_SETS, ECHO_DATA, ECHO_SKILL_BUFFS } from '../../data/echoes.js';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA } from '../../data/characters.js';
import { WEAPON_REFINE_SCALE } from '../../data/constants.js';

// ── Constants (named, not magic) ──
export const ATTACKER_LEVEL = 90;
export const ATTACKER_FACTOR = 800 + 8 * ATTACKER_LEVEL; // 1520
export const BASE_CRIT_RATE = 5;
export const BASE_CRIT_DMG = 150;
export const DOT_LEVEL_MULT = 3674;   // Level 90 character level multiplier
export const DOT_BASE_FACTOR = 1.25078; // Base damage coefficient for DOT ticks

// DOT mechanic constants (extracted from inline magic numbers)
export const FRAZZLE_TICK_INTERVAL = 3;    // Frazzle ticks every 3s, consumes 1 stack
export const FRAZZLE_ICD_PER_SOURCE = 2.5; // Application ICD per source (seconds)
// Fandom "Negative Status" page: DMG ticks every 3s for both Frazzle and Erosion — the 15s figure
// for Erosion is how often its stacks decay, not the tick rate (was wrongly used as tick interval).
export const EROSION_TICK_INTERVAL = 3;    // Erosion ticks every 3s, does NOT consume stacks
export const EROSION_DURATION = 15;        // Erosion debuff duration (seconds)
// Stack multiplier tables straight from the Fandom "Negative Status" page (Base DMG = Level Mult ×
// 1.25078 × Stack Mult). These are non-linear, not a flat per-stack multiplier — index = stack count.
export const FRAZZLE_STACK_TABLE = [0, 0.240, 0.4355, 0.6298, 0.8251, 1.020, 1.216, 1.409, 1.605, 1.800, 1.995];
export const EROSION_STACK_TABLE = [0, 0.360, 0.899, 1.799, 2.698, 3.597, 4.497]; // stacks >3 need Aero Rover Outro
// Linear extrapolation beyond the wiki's tabulated stack range, using the slope of the last two entries.
function lookupStackMult(table, stacks) {
  if (stacks <= 0) return 0;
  if (stacks < table.length) return table[stacks];
  const last = table[table.length - 1];
  const slope = last - table[table.length - 2];
  return last + (stacks - (table.length - 1)) * slope;
}
export const FUSION_BURST_THRESHOLD = 10;  // Stacks needed to detonate
export const FUSION_BURST_APP_ICD = 1;     // Application ICD (seconds)
export const FUSION_TRAIL_MULT = 3.0;      // Fusion Trail damage multiplier
export const FLARE_TICK_INTERVAL = 4;      // Electro Flare tick interval (seconds)
export const FLARE_STACK_MULT = 0.12;      // DMG multiplier per Flare stack
export const TUNE_BREAK_BASE_DMG = 5000;   // Base Tune Break damage
export const ER_THRESHOLD_STANDARD = 125;  // ER threshold for standard characters
export const ER_THRESHOLD_HEALER = 140;    // ER threshold for 175-cost healers

// Echo main stat values by cost tier
export const ECHO_MAIN_STAT_VALUES = {
  4: { 'ATK%': 30, 'HP%': 30, 'DEF%': 30, 'Crit Rate': 22, 'Crit DMG': 44, 'Healing Bonus': 26, 'Energy Regen': 32 },
  3: { 'ATK%': 30, 'HP%': 30, 'DEF%': 30, 'Glacio DMG': 30, 'Fusion DMG': 30, 'Electro DMG': 30, 'Aero DMG': 30, 'Spectro DMG': 30, 'Havoc DMG': 30, 'Energy Regen': 32 },
  1: { 'ATK%': 18, 'HP%': 18, 'DEF%': 18 },
};

// Echo substat values
export const ECHO_SUB_STAT_VALUES = {
  'ATK%': 9, 'HP%': 9, 'DEF%': 9,
  'Crit Rate': 7.5, 'Crit DMG': 15,
  'Energy Regen': 8,
  'Basic ATK DMG': 9, 'Heavy ATK DMG': 9,
  'Resonance Skill DMG': 9, 'Resonance Liberation DMG': 9,
};

// Flat echo substat max-roll values (in raw stat points, NOT %). Sourced from
// prydwen.gg's Echo Stats guide (https://www.prydwen.gg/wuthering-waves/guides/echo-stats,
// fetched 2026-08-18): substat roll ranges are ATK 30-60, HP 320-580, DEF 40-70 — using the
// highest roll to match the convention of the % table above. Unlike the % substats, these
// can't be looked up context-free: they need the wearer's own base ATK/HP/DEF to convert into
// an equivalent %-of-base contribution (see applyEchoStats below), so they're kept in a
// separate table rather than merged into ECHO_SUB_STAT_VALUES.
export const ECHO_FLAT_SUB_STAT_VALUES = {
  'ATK': 60, 'HP': 580, 'DEF': 70,
};

// ── Stat accumulator: replaces 50+ loose variables per tier ──
export function createStats() {
  return {
    atkPct: 0, cr: BASE_CRIT_RATE, cd: BASE_CRIT_DMG,
    elemDmg: 0, skillDmg: 0, basicDmg: 0, heavyDmg: 0,
    libDmg: 0, echoDmg: 0, coordDmg: 0,
    deepen: 0, amplify: 0,
    defShred: 0, resShred: 0, defIgnore: 0,
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
function flatSubToPct(sub, scaling, baseStats) {
  if (!baseStats) return 0;
  const val = ECHO_FLAT_SUB_STAT_VALUES[sub];
  if (!val) return 0;
  if (sub === 'ATK' && scaling === 'ATK' && baseStats.atk) return (val / baseStats.atk) * 100;
  if (sub === 'HP' && scaling === 'HP' && baseStats.hp) return (val / baseStats.hp) * 100;
  if (sub === 'DEF' && scaling === 'DEF' && baseStats.def) return (val / baseStats.def) * 100;
  return 0;
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
      if (echo.mainStat === scalingStat) stats.atkPct += val;
      else if (echo.mainStat === 'Crit Rate') stats.cr += val;
      else if (echo.mainStat === 'Crit DMG') stats.cd += val;
      else if (echo.mainStat === elDmgKey) stats.elemDmg += val;
      else if (echo.mainStat === 'Basic ATK DMG') stats.basicDmg += val;
      else if (echo.mainStat === 'Heavy ATK DMG') stats.heavyDmg += val;
      else if (echo.mainStat === 'Resonance Skill DMG') stats.skillDmg += val;
      else if (echo.mainStat === 'Resonance Liberation DMG') stats.libDmg += val;
    }
    (echo.substats || []).forEach(sub => {
      if (sub === 'ATK' || sub === 'HP' || sub === 'DEF') {
        stats.atkPct += flatSubToPct(sub, scaling, baseStats);
        return;
      }
      const val = ECHO_SUB_STAT_VALUES[sub];
      if (!val) return;
      if (sub === scalingStat) stats.atkPct += val;
      else if (sub === 'Crit Rate') stats.cr += val;
      else if (sub === 'Crit DMG') stats.cd += val;
      else if (sub === 'Resonance Skill DMG') stats.skillDmg += val;
      else if (sub === 'Energy Regen') { /* tracked separately */ }
    });
  });
}

// ── Apply buff to stat accumulator (replaces 8 identical if-else chains) ──
export function applyBuff(stats, buff, value, options = {}) {
  const { isAmplify = false } = options;
  const target = isAmplify ? 'amplify' : null;
  switch (buff) {
    case 'atkPct':    stats.atkPct += value; break;
    case 'allDmg':    stats[target || 'elemDmg'] += value; break;
    case 'elemDmg':   stats[target || 'elemDmg'] += value; break;
    case 'deepen':    stats.deepen += value; break;
    case 'basicDmg':  stats[target || 'basicDmg'] += value; break;
    case 'heavyDmg':  stats[target || 'heavyDmg'] += value; break;
    case 'libDmg':    stats[target || 'libDmg'] += value; break;
    case 'echoDmg':   stats[target || 'echoDmg'] += value; break;
    case 'skillDmg':  stats[target || 'skillDmg'] += value; break;
    case 'coordDmg':  stats[target || 'coordDmg'] += value; break;
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

// ── Route type-specific DMG bonuses into skillDmg based on damage focus ──
// Every character has a complete, non-empty dmgFocus (see characters.js's own contract comment), so
// the `!dpsFocus.length` branches below are a defensive fallback for the (currently theoretical)
// case of a character missing that data — not a live path in practice. What WAS live: libDmg had no
// such guard at all, so any main DPS whose dmgFocus is defined and simply doesn't include
// 'Liberation' (e.g. a Basic-ATK-focused character with a Liberation DMG buff active from gear/team)
// still got 30% of that buff bled into skillDmg unconditionally — every other type (Basic/Heavy) is
// correctly zeroed out in that same "defined focus, not this type" case.
export function routeTypeBonuses(stats, dpsFocus) {
  if (dpsFocus.includes('Basic ATK')) stats.skillDmg += stats.basicDmg;
  else if (stats.basicDmg > 0 && !dpsFocus.length) stats.skillDmg += stats.basicDmg * 0.5;
  if (dpsFocus.includes('Heavy ATK')) stats.skillDmg += stats.heavyDmg;
  else if (stats.heavyDmg > 0 && !dpsFocus.length) stats.skillDmg += stats.heavyDmg * 0.5;
  if (dpsFocus.includes('Liberation')) stats.skillDmg += stats.libDmg;
  else if (stats.libDmg > 0 && !dpsFocus.length) stats.skillDmg += stats.libDmg * 0.3;
  if (dpsFocus.includes('Echo')) stats.skillDmg += stats.echoDmg;
  if (dpsFocus.includes('Coordinated ATK')) stats.skillDmg += stats.coordDmg;
}

// ── Role matching: some characters carry a compound role string ('Support/Healer' — Chisa, Suisui)
// rather than a single 'Healer'/'Support' tag. Every exact `role === 'Healer'`/`role === 'Support'`
// check in this codebase silently excluded those characters entirely (no healer detected in a team
// that HAS one, no Healing Bonus main-stat option in Auto Equip, excluded from the healer/support
// candidate pool when building team suggestions) — use these substring checks everywhere a role
// CATEGORY is being tested instead, so a compound role matches every category it actually belongs to.
export function isHealerRole(role) { return (role || '').includes('Healer'); }
export function isSupportRole(role) { return (role || '').includes('Support'); }

// ── Defense multiplier calculation ──
export function calcDefMult(enemyDef, defShred, defIgnore) {
  const reducedDef = enemyDef * Math.max(0, 1 - defShred / 100);
  const effectiveDef = reducedDef * Math.max(0, 1 - defIgnore / 100);
  return Math.min(2, ATTACKER_FACTOR / (ATTACKER_FACTOR + effectiveDef));
}

// ── Resistance multiplier calculation ──
export function calcResMult(baseRes, shred) {
  const totalRes = (baseRes - shred) / 100;
  if (totalRes < 0) return 1 - totalRes / 2;
  if (totalRes < 0.8) return 1 - totalRes;
  return 1 / (1 + 5 * totalRes);
}

// ── Average crit multiplier ──
export function calcAvgCrit(cr, cd) {
  return 1 + (Math.min(cr, 100) / 100) * (cd / 100 - 1);
}

// ── WuWa 3-layer DMG bonus formula ──
export function calcDmgBonus(elemDmg, skillDmg, amplify, deepen) {
  return (1 + (elemDmg + skillDmg) / 100) * (1 + amplify / 100) * (1 + deepen / 100);
}

// ── DOT damage calculations (ICD-aware) ──
export function calcFrazzleDmg(members, rotTime, defMult, resMult) {
  const appliers = members.filter(m => CHAR_BUFF_TABLE[m.name]?.debuffs?.some(db => db.stat === 'frazzle'));
  if (!appliers.length) return { dmg: 0, active: false };
  const numSources = appliers.length;
  const effectiveRate = numSources / FRAZZLE_ICD_PER_SOURCE;
  const maxStacksRaw = appliers.reduce((s, m) => {
    const fd = CHAR_BUFF_TABLE[m.name]?.debuffs?.find(db => db.stat === 'frazzle');
    return s + (fd?.value || 10);
  }, 0);
  const stacks = Math.min(maxStacksRaw, Math.floor(effectiveRate * rotTime));
  const numTicks = Math.min(Math.floor(rotTime / FRAZZLE_TICK_INTERVAL), stacks);
  let total = 0;
  for (let s = stacks; s > stacks - numTicks && s > 0; s--) {
    total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * lookupStackMult(FRAZZLE_STACK_TABLE, s);
  }
  const hasPhoebe = members.some(m => m.name === 'Phoebe');
  return { dmg: total * (hasPhoebe ? 2.0 : 1.0) * defMult * resMult, active: true };
}

export function calcErosionDmg(members, rotTime, defMult, resMult) {
  const appliers = members.filter(m => CHAR_BUFF_TABLE[m.name]?.debuffs?.some(db => db.stat === 'erosion'));
  if (!appliers.length) return { dmg: 0, active: false };
  const baseStacks = appliers.reduce((s, m) => {
    const ed = CHAR_BUFF_TABLE[m.name]?.debuffs?.find(db => db.stat === 'erosion');
    return Math.max(s, ed?.value || 3);
  }, 3);
  const uptime = Math.min(1, EROSION_DURATION / rotTime);
  const ticks = Math.floor(EROSION_DURATION / EROSION_TICK_INTERVAL);
  let total = 0;
  for (let t = 0; t < ticks; t++) total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * lookupStackMult(EROSION_STACK_TABLE, baseStacks);
  return { dmg: total * uptime * defMult * resMult, active: true };
}

// Fusion Burst's stack-DMG table isn't published on the wiki (only Frazzle/Erosion are); this stays
// a rough approximation rather than a verified lookup like the two above.
export function calcFusionBurstDmg(members, rotTime, defMult, resMult) {
  const has = members.some(m => CHAR_BUFF_TABLE[m.name]?.debuffs?.some(db => db.stat === 'fusionBurst'));
  if (!has) return { dmg: 0, active: false };
  const explosions = Math.max(1, Math.floor(rotTime / Math.max(FUSION_BURST_THRESHOLD, 8)));
  const dmg = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (FUSION_BURST_THRESHOLD * 0.5) * FUSION_TRAIL_MULT;
  return { dmg: dmg * explosions * defMult * resMult, active: true };
}

// Electro Flare's DMG-per-stack table also isn't published (wiki only documents its old ATK-reduction
// values); stack halving on tick is confirmed by the wiki, the tick interval/mult stay approximations.
export function calcElectroFlareDmg(members, rotTime, defMult, resMult) {
  const has = members.some(m => CHAR_BUFF_TABLE[m.name]?.electroFlare);
  if (!has) return { dmg: 0, active: false };
  const ticks = Math.min(4, Math.floor(rotTime / FLARE_TICK_INTERVAL));
  let total = 0, stacks = 10;
  for (let t = 0; t < ticks; t++) {
    total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (stacks * FLARE_STACK_MULT);
    stacks = Math.ceil(stacks / 2);
  }
  return { dmg: total * defMult * resMult, active: true };
}

// Tune Break is a bespoke per-character mechanic (Off-Tune Level/Mistune, unique Tune Strain/Tune
// Rupture/Hack response skills per wiki) with no generic formula published — this stays a generic
// stack/boost approximation driven entirely by CHAR_BUFF_TABLE[name].tuneBreak fields; accuracy
// depends on those per-character values being filled in correctly (tracked separately).
export function calcTuneBreakDmg(members, rotTime, defMult, resMult) {
  const tbMembers = members.filter(m => CHAR_BUFF_TABLE[m.name]?.tuneBreak);
  if (!tbMembers.length) return { dmg: 0, deepenMult: 1 };
  let totalBoost = 0;
  tbMembers.forEach(m => {
    const tb = CHAR_BUFF_TABLE[m.name].tuneBreak;
    totalBoost += (tb.baseTuneBreakBoost || 0) + (tb.boostToTeam || 0);
  });
  const hasAccel = tbMembers.some(m => CHAR_BUFF_TABLE[m.name].tuneBreak.boostToTeam > 20);
  const breaksPerRot = hasAccel ? Math.min(2, Math.max(1, Math.floor(rotTime / 12))) : 1;
  let dmg = TUNE_BREAK_BASE_DMG * (1 + totalBoost * 0.01) * breaksPerRot * defMult;
  tbMembers.forEach(m => {
    const tb = CHAR_BUFF_TABLE[m.name].tuneBreak;
    if (tb.ruptureDmgMult) {
      dmg += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (tb.ruptureDmgMult / 100) * breaksPerRot * defMult * resMult;
    }
  });
  let deepenMult = 1;
  const mornyeMem = tbMembers.find(m => CHAR_BUFF_TABLE[m.name].tuneBreak.interferedDmgAmp);
  if (mornyeMem) {
    const amp = CHAR_BUFF_TABLE[mornyeMem.name].tuneBreak.interferedDmgAmp;
    deepenMult *= 1 + (amp / 100) * Math.min(1, (8 * breaksPerRot) / rotTime);
  }
  const maxStrain = Math.max(...tbMembers.map(m => CHAR_BUFF_TABLE[m.name].tuneBreak.maxStrainStacks || 0));
  if (maxStrain > 0 && totalBoost > 0) {
    const strainPct = maxStrain * totalBoost * 0.12;
    deepenMult *= 1 + (strainPct / 100) * Math.min(1, (8 * breaksPerRot) / rotTime);
  }
  return { dmg, deepenMult };
}

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
    const erThreshold = energyCost >= 175 ? ER_THRESHOLD_HEALER : ER_THRESHOLD_STANDARD;
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

// ── Team composition scoring: tier + role coverage + buff/debuff synergy + element resonance +
// BiS weapon ownership, all reusing data that already exists on every character (element, role,
// dmgFocus, tier, CHAR_BUFF_TABLE's outroBuffs/libBuffs/debuffs, bestWeapon) — no separate
// "recommendation" data model needed, just the same combat data combined correctly. Shared by the
// Team Suggestions card (scoring whole curated/roster-built teams) and the character selector
// (scoring hypothetical [...placed, candidate] teams to rank every possible addition, not just
// ones that happen to appear in someone's hand-curated `teams` string list) — a single source of
// truth so the two can never drift the way they did before this was extracted. ──
export const TIER_SCORES = { 'T0': 40, 'T0.5': 35, 'T1': 28, 'T1.5': 22, 'T2': 16, 'T3': 8, 'T4': 0 };

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

export function scoreTeamComposition(members, ownedWeaps = new Set()) {
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
  const mainDps = members.find(m => CHARACTER_DATA[m]?.role === 'Main DPS');
  if (mainDps) {
    // Main DPS totalMult currently spans ~2200 (Lingyang) to 3800 (Aemeath) across the roster.
    // Min-max normalize against that observed range so the top of the meta still differentiates
    // (a flat divisor saturates and makes most current-meta DPS score identically).
    const dpsMult = CHARACTER_DATA[mainDps]?.totalMult || 0;
    let dpsScore = Math.max(0, Math.min(25, Math.round((dpsMult - 2000) / 72)));
    const dpsFocus = CHARACTER_DATA[mainDps]?.dmgFocus || [];
    // A Liberation-focused DPS with a 175-Energy cost (calcEnergyCycles' own cutoff for the harder ER
    // threshold, ER_THRESHOLD_HEALER) is genuinely harder to keep at full Liberation uptime without
    // dedicated ER investment — this suggestion context can't assume the player has built that, so
    // apply the same mild discount to their own power score that a high-cost support gets below,
    // rather than only ever discounting OTHER members' output and treating the DPS's own energy cost
    // as free.
    if (dpsFocus.includes('Liberation') && (CHARACTER_DATA[mainDps]?.maxEnergy || 0) >= 175) dpsScore *= 0.85;
    score += dpsScore;
    const dpsEl = (CHARACTER_DATA[mainDps]?.element || '').toLowerCase();
    // Compare a buff/support's uptime against the DPS's actual on-field window, not the whole
    // rotation — a buff sitting on them while off-field does nothing. Falls back to rotTime only
    // when onField isn't tracked for this character.
    const dpsOnField = CHARACTER_DATA[mainDps]?.onField || CHARACTER_DATA[mainDps]?.rotTime;
    // An elemDmg buff only helps this DPS if its condition (when present) actually names their
    // element or "all" — otherwise it's a buff for a different attribute that does nothing here.
    const elemBuffApplies = (b) => { const cond = (b.condition || '').toLowerCase(); return !cond || cond.includes(dpsEl) || cond.includes('all'); };
    // A type-specific buff (basicDmg/heavyDmg/echoDmg/skillDmg/coordDmg) only routes into the DPS's
    // damage at all if their dmgFocus actually includes that attack type — routeTypeBonuses in this
    // same file enforces the identical gate for the real damage calc, so scoring has to match it or
    // it'll credit synergy that mechanically does nothing for this specific DPS.
    const typeFocusMap = { basicDmg: 'Basic ATK', heavyDmg: 'Heavy ATK', echoDmg: 'Echo', coordDmg: 'Coordinated ATK', skillDmg: 'Skill' };
    const buffApplies = (b) => {
      if (typeFocusMap[b.stat]) return dpsFocus.includes(typeFocusMap[b.stat]);
      if (b.stat === 'elemDmg' || b.stat === 'allDmg') return elemBuffApplies(b);
      return true; // atkPct/critRate/critDmg/deepen/offTune are universal, no gate needed
    };
    // Score any buff generically via real formula-derived uplift — this is what lets a completely
    // off-meta pairing (any character whose CHAR_BUFF_TABLE just happens to fit) get credited the
    // same way a hand-curated team would, instead of only recognizing patterns someone hardcoded.
    const scoreBuff = (b) => {
      if (!buffApplies(b)) return;
      const uplift = uptimeScaledUplift(b.stat, b.value, b.duration, dpsOnField);
      if (uplift <= 0) return;
      score += uplift * UPLIFT_TO_SCORE;
      if (b.stat === 'deepen' || b.stat === 'offTune') tags.push('Deepen');
      else if (b.stat === 'basicDmg') tags.push('ATK Amp');
      else if (b.stat === 'heavyDmg') tags.push('Heavy Amp');
      else if (b.stat === 'echoDmg') tags.push('Echo Amp');
    };
    members.forEach(m => {
      if (m === mainDps) return;
      const bt = CHAR_BUFF_TABLE[m]; if (!bt) return;
      (bt.outroBuffs || []).forEach(scoreBuff);
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
        if (uplift > 0) score += uplift * UPLIFT_TO_SCORE;
      });
      (bt.debuffs || []).forEach(db => {
        if (db.stat === 'defShred' || db.stat === 'resShred') {
          const uplift = estimateBuffUplift(db.stat, db.value);
          if (uplift > 0) { score += uplift * UPLIFT_TO_SCORE; tags.push('Shred'); }
        }
        if (db.stat === 'frazzle') { score += 5; tags.push('Frazzle'); }
        if (db.stat === 'erosion') { score += 5; tags.push('Erosion'); }
        // 'deepen'/'offTune' as a debuff stat (enemy DMG Taken, e.g. Galbrena's Afterflame) is a
        // universal damage multiplier just like the buff-side 'deepen'.
        if (db.stat === 'deepen' || db.stat === 'offTune') { const u = estimateBuffUplift('deepen', db.value); if (u > 0) score += u * UPLIFT_TO_SCORE; }
      });
    });
  }
  // Element
  const els = members.map(m => CHARACTER_DATA[m]?.element).filter(Boolean);
  const elSet = new Set(els);
  if (els.length > elSet.size) { score += 12; tags.push('Resonance'); }
  if (elSet.size === 1 && els.length > 1) { score += 8; tags.push('Mono'); }
  // BiS weapon
  let hasBis = false;
  members.forEach(m => { const d = CHARACTER_DATA[m]; if (d?.bestWeapon && ownedWeaps.has(d.bestWeapon)) { score += d.role === 'Main DPS' ? 12 : 4; hasBis = true; } });
  if (hasBis) tags.push('BiS Weapon');
  return { score, tags: [...new Set(tags)].slice(0, 3) };
}

// NOTE: an earlier version of this file had a second, cruder rotation-composer here
// (composeTeamRotation) that duplicated what DamageCalculator.jsx's rotationTimeline/steps
// computation already does — and did it worse: naive placed-slot order instead of the real
// hasTeamOutro/nextOutroValue-driven ordering, static rather than simulation-derived on-field
// durations, and no shared source of truth with the Rotation Timeline Gantt chart. Two
// independently-maintained "team rotation" features drift apart by construction, so it was
// removed rather than kept as a second implementation — DamageCalculator's rotationTimeline.steps
// (rendered by the "Rotation Guide" card) is the one true composed-rotation feature now, and it
// additionally consumes CHARACTER_ROTATIONS for its per-character skill sequence.
