// PHASE3_PLAN.md Stage 4, step 6/6: closes the gap steps 1-4 left open — effAtk/avgCrit/dmgBonus/
// defMult/resMult/score (and the underlying critRate/critDmg/elemDmg/skillDmg/amplify/deepen/atkPct/
// defShred/resShred/defIgnore fields) now also come from the engine (resolveSimulatedTeamRotation's
// real time-averaged received stats for the main DPS, combined with their own gear delta and
// routeTypeBonuses' same focus-collapsing legacy already used) for a fully-converted team, instead of
// staying on the legacy buff-accumulation computation that steps 1-4 left untouched.
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';

describe('calcTeamStats — main-DPS stat panel via the engine (Stage 4 step 6)', () => {
  it('a fully-converted team produces finite, positive stat-panel fields', () => {
    const stats = calcTeamStats(['Yinlin', 'Augusta', 'Rover: Electro'], 0, 'Yinlin', {}, '', 90);
    for (const key of ['effAtk', 'avgCrit', 'score', 'defMult', 'resMult', 'critRate', 'critDmg']) {
      expect(Number.isFinite(stats[key]), `${key} should be finite`).toBe(true);
    }
    expect(stats.effAtk).toBeGreaterThan(0);
    expect(stats.avgCrit).toBeGreaterThan(1); // base 5%/150% alone gives > 1
    expect(stats.score).toBeGreaterThan(0);
  });

  it('score is internally consistent with effAtk/avgCrit/defMult/resMult (same formula as legacy)', () => {
    const stats = calcTeamStats(['Camellya', 'Danjin', 'Verina'], 0, 'Camellya', {}, '', 90);
    // dmgBonus isn't directly exposed, but score = effAtk * avgCrit * dmgBonus * defMult * resMult,
    // so score / (effAtk * avgCrit * defMult * resMult) recovers dmgBonus — must be a sane positive
    // multiplier (elemDmg/skillDmg/amplify/deepen all being additive %, dmgBonus should be >= ~1).
    const impliedDmgBonus = stats.score / (stats.effAtk * stats.avgCrit * stats.defMult * stats.resMult);
    expect(impliedDmgBonus).toBeGreaterThan(0.5);
    expect(impliedDmgBonus).toBeLessThan(10);
  });

  it('a solo (1-member) fully-converted team still computes a valid stat panel', () => {
    const stats = calcTeamStats(['Yinlin', null, null], 0, 'Yinlin', {}, '', 90);
    expect(Number.isFinite(stats.effAtk)).toBe(true);
    expect(stats.effAtk).toBeGreaterThan(0);
  });

  it('a mixed team (Jingran, not yet converted) still computes a valid stat panel via the legacy fallback', () => {
    const stats = calcTeamStats(['Jingran', 'Verina', null], 0, 'Jingran', {}, '', 90);
    expect(Number.isFinite(stats.effAtk)).toBe(true);
    expect(stats.effAtk).toBeGreaterThan(0);
  });
});
