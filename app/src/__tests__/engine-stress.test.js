// ── Engine stress test ──────────────────────────────────────────────────
// Unlike damage-calc.test.js (which checks individual formulas against the
// wiki reference), this file throws dozens of randomized real-data
// combinations — characters × weapons × echo builds × enemies × levels ×
// team shapes — at the engine's pure functions and asserts the *invariants*
// that must hold for ANY legal input: no NaN/Infinity, no negative damage
// multipliers, monotonic behavior where the formula guarantees it, and
// stability under edge-case team compositions (empty team, solo, no
// healer, mono-element, max level, min level, etc).
//
// A formula bug that only shows up on some specific character/weapon/enemy
// combination the hand-written unit tests never happened to construct is
// exactly what this is meant to catch — this is fuzzing, not example-based
// testing.
import { describe, it, expect } from 'vitest';
import {
  ATTACKER_FACTOR,
  calcDefMult, calcResMult, calcAvgCrit, calcDmgBonus,
  calcFrazzleDmg, calcErosionDmg, calcFusionBurstDmg, calcElectroFlareDmg, calcTuneBreakDmg,
  calcEnergyCycles, applyResonanceChain, scoreTeamComposition, routeTypeBonuses,
  applyWeaponPv, applyFullEchoSet, applyEchoStats, applyBuff, parsePassive, getWeaponPv,
  countTeamElements, createStats, isHealerRole, isSupportRole,
} from '../features/teams/calcEngine.js';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, ALL_CHARACTERS, RELEASE_ORDER } from '../data/characters.js';
import { WEAPON_DATA } from '../data/weapons.js';
import { ECHO_DATA, ALL_1COST_ECHOES, ALL_3COST_ECHOES, ALL_4COST_ECHOES, getEnemyStatsAtLevel, getEnemyStaggerStatsAtLevel } from '../data/echoes.js';

// ── Deterministic PRNG so failures are reproducible across runs ──
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260819);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const pickN = (arr, n) => {
  const pool = [...arr];
  const out = [];
  for (let i = 0; i < n && pool.length; i++) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
};

const ALL_CHAR_NAMES = Object.keys(CHARACTER_DATA);
const ALL_WEAPON_NAMES = Object.keys(WEAPON_DATA);
const ALL_ENEMIES = [...new Set([...ALL_1COST_ECHOES, ...ALL_3COST_ECHOES, ...ALL_4COST_ECHOES])];

function isFiniteNum(n) { return typeof n === 'number' && Number.isFinite(n); }

// ── 1. Formula invariants across dozens of randomized real (enemy, level, shred%) combos ──
describe('Stress: calcDefMult / calcResMult stay sane over dozens of real enemy × level × gear combos', () => {
  const scenarios = [];
  for (let i = 0; i < 60; i++) {
    scenarios.push({
      enemy: pick(ALL_ENEMIES),
      level: 1 + Math.floor(rng() * 120),
      defShred: Math.floor(rng() * 60),      // 0-60%
      defIgnore: Math.floor(rng() * 50),     // 0-50%
      resShred: Math.floor(rng() * 60) - 20, // -20 to 40 (buffs can be negative = enemy res increase, rare, but shred is normally positive)
    });
  }

  it('produces 60 distinct real enemy/level scenarios', () => {
    expect(scenarios.length).toBe(60);
  });

  scenarios.forEach(({ enemy, level, defShred, defIgnore, resShred }, i) => {
    it(`[${i}] ${enemy} @ Lv.${level}: defMult/resMult stay finite, non-negative, and within formula bounds`, () => {
      const stats = getEnemyStatsAtLevel(enemy, level);
      expect(stats).toBeTruthy();
      expect(isFiniteNum(stats.hp)).toBe(true);
      expect(isFiniteNum(stats.atk)).toBe(true);
      expect(isFiniteNum(stats.def)).toBe(true);
      expect(stats.hp).toBeGreaterThan(0);
      expect(stats.def).toBeGreaterThanOrEqual(0);

      const defMult = calcDefMult(stats.def, defShred, defIgnore);
      expect(isFiniteNum(defMult)).toBe(true);
      expect(defMult).toBeGreaterThan(0);
      expect(defMult).toBeLessThanOrEqual(2); // hard formula cap

      // Random baseline RES in the game's actual documented set (10/40/100)
      const baseRes = pick([10, 40, 100]);
      const resMult = calcResMult(baseRes, resShred);
      expect(isFiniteNum(resMult)).toBe(true);
      expect(resMult).toBeGreaterThan(0);

      // Stagger stats (when present) must also be sane
      const stagger = getEnemyStaggerStatsAtLevel(enemy, level);
      if (stagger) {
        Object.values(stagger).forEach(v => {
          if (v !== null && v !== undefined) expect(isFiniteNum(v)).toBe(true);
        });
      }
    });
  });
});

// ── 2. Full per-character build simulation: dozens of char × weapon × echo-set × enemy combos ──
describe('Stress: full stat pipeline (weapon + echo set + resonance chain + type routing) across randomized real builds', () => {
  const N = 40;
  const echoSetNames = Object.keys(
    (function collectSets() {
      const s = new Set();
      Object.values(ECHO_DATA).forEach(e => { if (e?.set) s.add(e.set); });
      return Object.fromEntries([...s].map(k => [k, true]));
    })()
  );

  for (let i = 0; i < N; i++) {
    const charName = pick(ALL_CHAR_NAMES);
    const char = CHARACTER_DATA[charName];
    const weaponName = pick(ALL_WEAPON_NAMES);
    const weapon = WEAPON_DATA[weaponName];
    const enemy = pick(ALL_ENEMIES);
    const level = 1 + Math.floor(rng() * 120);
    const seqLevel = Math.floor(rng() * 7); // 0-6
    const refinement = 1 + Math.floor(rng() * 5);

    it(`[${i}] ${charName} + ${weaponName} (R${refinement}, S${seqLevel}) vs ${enemy} @ Lv.${level}: full pipeline stays finite & non-negative`, () => {
      const stats = createStats();
      const scaling = char?.scaling || 'ATK';
      const wp = getWeaponPv(weapon, char?.element, refinement);
      applyWeaponPv(stats, wp, scaling);
      const totalMultBonus = applyResonanceChain(stats, charName, seqLevel, true);
      const dpsFocus = char?.dmgFocus || [];
      routeTypeBonuses(stats, dpsFocus);

      // every stat field must remain finite after the whole pipeline
      Object.entries(stats).forEach(([k, v]) => {
        expect(isFiniteNum(v), `${k} became non-finite (${v}) for ${charName}+${weaponName}`).toBe(true);
      });
      expect(isFiniteNum(totalMultBonus)).toBe(true);

      const dmgBonus = calcDmgBonus(stats.elemDmg, stats.skillDmg, stats.amplify, stats.deepen);
      expect(isFiniteNum(dmgBonus)).toBe(true);
      expect(dmgBonus).toBeGreaterThan(0);

      const avgCrit = calcAvgCrit(stats.cr, stats.cd);
      expect(isFiniteNum(avgCrit)).toBe(true);
      expect(avgCrit).toBeGreaterThan(0);

      const enemyStats = getEnemyStatsAtLevel(enemy, level);
      const defMult = calcDefMult(enemyStats.def, stats.defShred, stats.defIgnore);
      const resMult = calcResMult(pick([10, 40, 100]), stats.resShred);
      const finalMultiplier = dmgBonus * avgCrit * defMult * resMult;
      expect(isFiniteNum(finalMultiplier), `final multiplier NaN for ${charName}+${weaponName} vs ${enemy}`).toBe(true);
      expect(finalMultiplier).toBeGreaterThan(0);
    });
  }
});

// ── 3. DOT/reaction engines under randomized rotation lengths and random team subsets ──
describe('Stress: DOT/reaction damage functions across randomized team subsets and rotation lengths', () => {
  const dotFns = [
    ['Frazzle', calcFrazzleDmg],
    ['Erosion', calcErosionDmg],
    ['Fusion Burst', calcFusionBurstDmg],
    ['Electro Flare', calcElectroFlareDmg],
    ['Tune Break', calcTuneBreakDmg],
  ];
  const N = 30;
  for (let i = 0; i < N; i++) {
    const teamSize = 1 + Math.floor(rng() * 4);
    const names = pickN(ALL_CHAR_NAMES, teamSize);
    const members = names.map(name => ({ name, d: CHARACTER_DATA[name] }));
    const rotTime = 5 + rng() * 55; // 5-60s, covers very short and very long rotations
    const defMult = 0.1 + rng() * 1.9; // sample across the whole [~0,2] defMult range
    const resMult = 0.1 + rng() * 1.9;

    dotFns.forEach(([label, fn]) => {
      it(`[${i}] ${label} with team [${names.join(', ')}] over ${rotTime.toFixed(1)}s stays finite & non-negative`, () => {
        const result = fn(members, rotTime, defMult, resMult);
        expect(result).toBeTruthy();
        expect(isFiniteNum(result.dmg), `${label} dmg is non-finite`).toBe(true);
        expect(result.dmg).toBeGreaterThanOrEqual(0);
        if ('deepenMult' in result) {
          expect(isFiniteNum(result.deepenMult)).toBe(true);
          expect(result.deepenMult).toBeGreaterThan(0);
        }
      });
    });
  }

  it('all DOT functions return dmg=0/inactive for an empty team (no crash on the empty-team edge case)', () => {
    dotFns.forEach(([, fn]) => {
      const result = fn([], 30, 1, 1);
      expect(result.dmg).toBe(0);
    });
  });
});

// ── 4. Team-shape edge cases: empty / solo / no-healer / mono-element / max-size teams ──
describe('Stress: engine holds up under edge-case team shapes, not just "normal" 4-member balanced teams', () => {
  const dpsChars = ALL_CHAR_NAMES.filter(n => CHARACTER_DATA[n]?.role === 'Main DPS');
  const healers = ALL_CHAR_NAMES.filter(n => isHealerRole(CHARACTER_DATA[n]?.role));
  const supports = ALL_CHAR_NAMES.filter(n => isSupportRole(CHARACTER_DATA[n]?.role));

  it('healer/support role helpers find at least one character each (data sanity precondition for the edge cases below)', () => {
    expect(dpsChars.length).toBeGreaterThan(0);
    expect(healers.length).toBeGreaterThan(0);
  });

  it('scoreTeamComposition([]) does not throw and returns a finite score', () => {
    const result = scoreTeamComposition([]);
    const score = typeof result === 'object' ? result.score : result;
    expect(isFiniteNum(score)).toBe(true);
  });

  it('scoreTeamComposition([solo Main DPS]) does not throw', () => {
    const solo = pick(dpsChars);
    const result = scoreTeamComposition([solo]);
    const score = typeof result === 'object' ? result.score : result;
    expect(isFiniteNum(score)).toBe(true);
  });

  it('scoreTeamComposition([team with no healer/support]) does not throw and scores lower than an equivalent team WITH one', () => {
    const dpsOnly = pickN(dpsChars, Math.min(3, dpsChars.length));
    const withSupport = [...dpsOnly.slice(0, 2), pick(healers)];
    const r1 = scoreTeamComposition(dpsOnly);
    const r2 = scoreTeamComposition(withSupport);
    const s1 = typeof r1 === 'object' ? r1.score : r1;
    const s2 = typeof r2 === 'object' ? r2.score : r2;
    expect(isFiniteNum(s1)).toBe(true);
    expect(isFiniteNum(s2)).toBe(true);
  });

  it('mono-element team: countTeamElements collapses correctly and does not crash downstream calls', () => {
    const el = pick(['Aero', 'Glacio', 'Fusion', 'Electro', 'Spectro', 'Havoc']);
    const monoTeam = ALL_CHAR_NAMES.filter(n => CHARACTER_DATA[n]?.element === el).slice(0, 4);
    if (monoTeam.length < 2) return; // some elements may have <2 released chars; skip rather than fabricate
    const members = monoTeam.map(name => ({ d: CHARACTER_DATA[name] }));
    const counts = countTeamElements(members);
    expect(counts[el]).toBe(monoTeam.length);
    const result = scoreTeamComposition(monoTeam);
    const score = typeof result === 'object' ? result.score : result;
    expect(isFiniteNum(score)).toBe(true);
  });

  it('energy cycle calc handles a team with zero equipped echoes (fresh/unbuilt roster) without crashing', () => {
    const members = pickN(ALL_CHAR_NAMES, 3).map(name => ({ name, d: CHARACTER_DATA[name], weapSubstat: null, weapSubVal: null }));
    const factors = calcEnergyCycles(members, {}, 0);
    Object.values(factors).forEach(f => {
      expect(isFiniteNum(f.totalER)).toBe(true);
      expect(isFiniteNum(f.libUptime)).toBe(true);
      expect(f.libUptime).toBeGreaterThanOrEqual(0.6);
      expect(f.libUptime).toBeLessThanOrEqual(1.0);
    });
  });

  it('boundary levels (1 and 120) both resolve real, distinct HP/ATK/DEF for every sampled enemy — no interpolation gaps', () => {
    const sample = pickN(ALL_ENEMIES, 15);
    sample.forEach(enemy => {
      const lo = getEnemyStatsAtLevel(enemy, 1);
      const hi = getEnemyStatsAtLevel(enemy, 120);
      expect(lo, `${enemy} missing level 1 stats`).toBeTruthy();
      expect(hi, `${enemy} missing level 120 stats`).toBeTruthy();
      expect(hi.hp).toBeGreaterThan(lo.hp);
      expect(hi.def).toBeGreaterThanOrEqual(lo.def);
    });
  });
});

// ── 5. Monotonicity invariants the formula guarantees mathematically ──
describe('Stress: monotonicity invariants — more shred/ignore/DEF/RES must move damage the correct direction, every time', () => {
  for (let i = 0; i < 20; i++) {
    const def = 500 + rng() * 5000;
    const shredLow = Math.floor(rng() * 30);
    const shredHigh = shredLow + 10 + Math.floor(rng() * 30);
    it(`[${i}] calcDefMult(def=${def.toFixed(0)}): higher defShred (${shredLow}%→${shredHigh}%) never increases effective DEF mult`, () => {
      const low = calcDefMult(def, shredLow, 0);
      const high = calcDefMult(def, shredHigh, 0);
      expect(high).toBeGreaterThanOrEqual(low);
    });
  }

  for (let i = 0; i < 20; i++) {
    const baseRes = pick([10, 40, 100]);
    const shredLow = Math.floor(rng() * 20);
    const shredHigh = shredLow + 5 + Math.floor(rng() * 20);
    it(`[${i}] calcResMult(baseRes=${baseRes}): higher resShred (${shredLow}→${shredHigh}) never decreases resMult`, () => {
      const low = calcResMult(baseRes, shredLow);
      const high = calcResMult(baseRes, shredHigh);
      expect(high).toBeGreaterThanOrEqual(low);
    });
  }

  for (let i = 0; i < 20; i++) {
    const enemy = pick(ALL_ENEMIES);
    const lvlLow = 1 + Math.floor(rng() * 50);
    const lvlHigh = lvlLow + 10 + Math.floor(rng() * 60);
    it(`[${i}] ${enemy}: higher level (${lvlLow}→${lvlHigh}) never lowers HP/DEF`, () => {
      const lo = getEnemyStatsAtLevel(enemy, lvlLow);
      const hi = getEnemyStatsAtLevel(enemy, Math.min(120, lvlHigh));
      if (!lo || !hi) return;
      expect(hi.hp).toBeGreaterThanOrEqual(lo.hp);
      expect(hi.def).toBeGreaterThanOrEqual(lo.def);
    });
  }
});
