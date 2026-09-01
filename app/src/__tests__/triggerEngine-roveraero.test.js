import { describe, it, expect } from 'vitest';
import { CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { ROVER_AERO_BLOCKS } from '../engine/characterBlocks/roveraero.blocks.js';

describe('triggerEngine parity — Rover: Aero', () => {
  it('S1/S2 stay correctly unmodeled (no block), already empty in RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Rover: Aero'];
    expect(rc.s1).toEqual({});
    expect(rc.s2).toEqual({});
    expect(ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s1')).toBeUndefined();
    expect(ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s2')).toBeUndefined();
  });

  it('S3-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Rover: Aero'];
    expect(ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s3').effects[0].value).toBe(rc.s3.elemDmg);
    expect(ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s4').effects[0].value).toBe(rc.s4.skillDmg);
    expect(ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s6').effects[0].value).toBe(rc.s6.skillDmg);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rover: Aero'], ROVER_AERO_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(ROVER_AERO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'aero', 'Healer');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('roveraero.intro.relentless-squall')).toBe(true);
    expect(fired.has('roveraero.forte.cloudburst-dance')).toBe(true);
    expect(fired.has('roveraero.liberation.omega-storm')).toBe(true);
    expect(fired.has('roveraero.forte.unbound-flow')).toBe(true);
  });
});
