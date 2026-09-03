import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
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

  // Fixed 2026-09-03 (missed in the 2026-09-02 pass): had no damage.category — per the established
  // Mid-air Attack convention (inherits Basic or Heavy ATK DMG, never its own type), fixed to basicDmg.
  it('Mid-air Plunging Attack is basicDmg-categorized', () => {
    const midair = ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.midair.plunging-attack');
    expect(midair.damage.category).toBe('basicDmg');
  });

  it('S3-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Rover: Aero'];
    expect(ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s3').effects[0].value).toBe(rc.s3.elemDmg);
    expect(ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s4').effects[0].value).toBe(rc.s4.skillDmg);
    expect(ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s6').effects[0].value).toBe(rc.s6.skillDmg);
  });

  // Fixed 2026-09-02: S4 was an unconditional passive — kit text is explicit it's a 5s window on
  // Cloudburst Dance cast.
  it('S4 is a real 5s window on Cloudburst Dance cast, not an unconditional passive', () => {
    const s4 = ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s4');
    expect(s4.trigger).toEqual({ type: 'cast', on: 'Forte:Cloudburst Dance' });
    expect(s4.timing.duration).toBe(5);
  });

  // Fixed 2026-09-02: S5 was `trigger:{type:'cast',...}` with no `timing.duration` — the same dead
  // cast-scoped/no-duration no-op shape as Carlotta/Galbrena/Lucy — never actually applied.
  it("S5 actually boosts Omega Storm's damage (was a dead no-op)", () => {
    const s5 = ROVER_AERO_BLOCKS.find(b => b.id === 'roveraero.chain.s5');
    expect(s5.trigger.type).toBe('passive');
    expect(s5.effects[0].scopedToBlockId).toBe('roveraero.liberation.omega-storm');

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rover: Aero'], ROVER_AERO_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS5 = resolveHitComposedDps(ROVER_AERO_BLOCKS, steps, ctx, 2500, 'aero', 'Healer', null, 5);
    const withoutS5Blocks = ROVER_AERO_BLOCKS.filter(b => b.id !== 'roveraero.chain.s5');
    const withoutS5 = resolveHitComposedDps(withoutS5Blocks, steps, ctx, 2500, 'aero', 'Healer', null, 5);
    const omegaHit = withS5.hitLog.find(h => h.blockId === 'roveraero.liberation.omega-storm');
    const omegaHitNoS5 = withoutS5.hitLog.find(h => h.blockId === 'roveraero.liberation.omega-storm');
    expect(omegaHit.damage).toBeGreaterThan(omegaHitNoS5.damage);
  });

  // Fixed 2026-09-02: S6 was an unscoped passive skillDmg:30 — silently over-crediting Cloudburst
  // Dance/Awakening Gale/Skyfall Severance, none of which S6's own kit text lists (Unbound Flow only).
  it("S6's +30% only applies to Unbound Flow, not her whole skillDmg-categorized kit", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rover: Aero'], ROVER_AERO_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS6 = resolveHitComposedDps(ROVER_AERO_BLOCKS, steps, ctx, 2500, 'aero', 'Healer', null, 6);
    const withoutS6Blocks = ROVER_AERO_BLOCKS.filter(b => b.id !== 'roveraero.chain.s6');
    const withoutS6 = resolveHitComposedDps(withoutS6Blocks, steps, ctx, 2500, 'aero', 'Healer', null, 6);
    const unboundHit = withS6.hitLog.find(h => h.blockId === 'roveraero.forte.unbound-flow');
    const unboundHitNoS6 = withoutS6.hitLog.find(h => h.blockId === 'roveraero.forte.unbound-flow');
    expect(unboundHit.damage).toBeGreaterThan(unboundHitNoS6.damage);
    const cloudHit = withS6.hitLog.find(h => h.blockId === 'roveraero.forte.cloudburst-dance');
    const cloudHitNoS6 = withoutS6.hitLog.find(h => h.blockId === 'roveraero.forte.cloudburst-dance');
    expect(cloudHit.damage).toBeCloseTo(cloudHitNoS6.damage, 5);
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

  // Found 2026-09-03 via a Phase A full-dimension audit (REMAINING_WORK.md 1c).
  it("dmgFocus includes 'Liberation' (18.9% of her real damage profile), not just Skill", () => {
    expect(CHARACTER_DATA['Rover: Aero'].dmgFocus).toEqual(expect.arrayContaining(['Skill', 'Liberation']));
  });

  it('weaponAlts.alt5 no longer duplicates bestWeapon as its own alternative', () => {
    const d = CHARACTER_DATA['Rover: Aero'];
    expect(d.weaponAlts.alt5).not.toContain(d.bestWeapon);
  });
});
