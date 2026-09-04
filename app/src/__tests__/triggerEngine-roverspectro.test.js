import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { ROVER_SPECTRO_BLOCKS } from '../engine/characterBlocks/roverspectro.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Rover: Spectro', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(ROVER_SPECTRO_BLOCKS, 'Rover: Spectro');
  });

  it('S3/S4 stay correctly unmodeled (no block) — zero DPS component per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Rover: Spectro'];
    expect(rc.s3).toEqual({});
    expect(rc.s4).toEqual({});
    expect(ROVER_SPECTRO_BLOCKS.find(b => b.id === 'roverspectro.chain.s3')).toBeUndefined();
    expect(ROVER_SPECTRO_BLOCKS.find(b => b.id === 'roverspectro.chain.s4')).toBeUndefined();
  });

  it('S1/S2/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Rover: Spectro'];
    expect(ROVER_SPECTRO_BLOCKS.find(b => b.id === 'roverspectro.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(ROVER_SPECTRO_BLOCKS.find(b => b.id === 'roverspectro.chain.s2').effects[0].value).toBe(rc.s2.elemDmg);
    expect(ROVER_SPECTRO_BLOCKS.find(b => b.id === 'roverspectro.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(ROVER_SPECTRO_BLOCKS.find(b => b.id === 'roverspectro.chain.s6').effects[0].value).toBe(rc.s6.resShred);
  });

  it('Resonating Whirl block combines the real Spin + Whirl segments (2+1 hits)', () => {
    const b = ROVER_SPECTRO_BLOCKS.find(bl => bl.id === 'roverspectro.forte.resonating-whirl');
    expect(b.damage.hits.length).toBe(3);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rover: Spectro'], ROVER_SPECTRO_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(ROVER_SPECTRO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'spectro', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('roverspectro.intro.waveshock')).toBe(true);
    expect(fired.has('roverspectro.liberation.echoing-orchestra')).toBe(true);
    expect(fired.has('roverspectro.forte.resonating-whirl')).toBe(true);
    expect(fired.has('roverspectro.forte.resonating-echoes')).toBe(true);
  });

  // Found 2026-09-03 via a Phase A full-dimension audit (REMAINING_WORK.md 1c): the Heavy ATK warm-up
  // combo had no damage.category at all (a real, category-less hit silently rejects any teammate's
  // Heavy ATK DMG Bonus), and Resonating Echoes was miscategorized basicDmg despite its own kit text
  // explicitly saying "considered Resonance Skill DMG".
  it('Heavy ATK:Standard/Resonance/Aftertune is heavyDmg-categorized (was uncategorized)', () => {
    const b = ROVER_SPECTRO_BLOCKS.find(bl => bl.id === 'roverspectro.heavy.standard-resonance-aftertune');
    expect(b.damage.category).toBe('heavyDmg');
  });

  it('Resonating Echoes is skillDmg-categorized per its own kit text (was wrongly basicDmg)', () => {
    const b = ROVER_SPECTRO_BLOCKS.find(bl => bl.id === 'roverspectro.forte.resonating-echoes');
    expect(b.damage.category).toBe('skillDmg');
  });

  it("dmgFocus includes 'Heavy ATK' (9.2% of her real damage profile), not just Skill/Liberation", () => {
    expect(CHARACTER_DATA['Rover: Spectro'].dmgFocus).toEqual(expect.arrayContaining(['Skill', 'Liberation', 'Heavy ATK']));
  });
});
