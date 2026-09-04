// PHASE3_PLAN.md Stage 3, item 2/5: engine/resolver/dot/dotReactions.js composes calcEngine.js's already-correct
// DOT-reaction functions around engine-derived inputs. These tests prove the composition is exact
// (byte-identical to calling the five calcEngine.js functions directly the way calcTeamStats.js does)
// and that rotTimeFromSteps() matches the sum-of-stepSeconds convention every other engine file uses.
import { describe, it, expect } from 'vitest';
import {
  calcFrazzleDmg, calcErosionDmg, calcFusionBurstDmg, calcElectroFlareDmg, calcTuneBreakDmg,
  calcResMult, calcDefMult,
} from '../features/teams/calcEngine.js';
import { resolveDotReactionDps, rotTimeFromSteps } from '../engine/resolver/dot/dotReactions.js';

const getEnemyRes = (element) => ({ Spectro: 10, Havoc: 12, Fusion: 8, Electro: 15 }[element] ?? 10);

describe('rotTimeFromSteps', () => {
  it('sums stepSeconds, defaulting missing entries to DEFAULT_STEP_SECONDS (1.5)', () => {
    const steps = [{ owner: 'A', stepSeconds: 2 }, { owner: 'A' }, { owner: 'B', stepSeconds: 3 }];
    expect(rotTimeFromSteps(steps)).toBeCloseTo(2 + 1.5 + 3, 10);
  });

  it('returns 0 for an empty step list', () => {
    expect(rotTimeFromSteps([])).toBe(0);
  });
});

describe('resolveDotReactionDps', () => {
  const rotTime = 20;
  const defMult = calcDefMult(800, 0, 0);
  const resShred = 0;
  const mainResMult = calcResMult(10, resShred);

  it('matches calling the five calcEngine.js DOT functions directly, per-element RES routed like calcTeamStats.js', () => {
    const members = [{ name: 'Phoebe' }, { name: 'Buling' }];

    const expectedFrazzle = calcFrazzleDmg(members, rotTime, defMult, calcResMult(getEnemyRes('Spectro'), resShred));
    const expectedErosion = calcErosionDmg(members, rotTime, defMult, calcResMult(getEnemyRes('Havoc'), resShred));
    const expectedFusionBurst = calcFusionBurstDmg(members, rotTime, defMult, calcResMult(getEnemyRes('Fusion'), resShred));
    const expectedElectroFlare = calcElectroFlareDmg(members, rotTime, defMult, calcResMult(getEnemyRes('Electro'), resShred));
    const expectedTuneBreak = calcTuneBreakDmg(members, rotTime, defMult, mainResMult, null);
    const expectedTotal = expectedFrazzle.dmg + expectedErosion.dmg + expectedFusionBurst.dmg + expectedElectroFlare.dmg + expectedTuneBreak.dmg;

    const result = resolveDotReactionDps(members, rotTime, defMult, resShred, getEnemyRes, mainResMult, null);

    expect(result.totalDmg).toBeCloseTo(expectedTotal, 6);
    expect(result.dps).toBeCloseTo(expectedTotal / rotTime, 6);
    expect(result.tuneBreakDeepenMult).toBe(expectedTuneBreak.deepenMult);
    expect(result.breakdown.frazzle.dmg).toBeCloseTo(expectedFrazzle.dmg, 6);
    expect(result.breakdown.erosion.dmg).toBeCloseTo(expectedErosion.dmg, 6);
  });

  it('Phoebe (frazzle applier) actually contributes real Frazzle damage', () => {
    const members = [{ name: 'Phoebe' }];
    const result = resolveDotReactionDps(members, rotTime, defMult, resShred, getEnemyRes, mainResMult, null);
    expect(result.breakdown.frazzle.active).toBe(true);
    expect(result.breakdown.frazzle.dmg).toBeGreaterThan(0);
    expect(result.breakdown.erosion.active).toBe(false);
  });

  it('a team with no DOT-applying members produces zero DOT damage', () => {
    const members = [{ name: 'Aalto' }];
    const result = resolveDotReactionDps(members, rotTime, defMult, resShred, getEnemyRes, mainResMult, null);
    expect(result.totalDmg).toBe(0);
    expect(result.dps).toBe(0);
  });

  it('returns dps 0 (not NaN/Infinity) when rotTime is 0', () => {
    const result = resolveDotReactionDps([{ name: 'Phoebe' }], 0, defMult, resShred, getEnemyRes, mainResMult, null);
    expect(result.dps).toBe(0);
    expect(Number.isFinite(result.dps)).toBe(true);
  });
});
