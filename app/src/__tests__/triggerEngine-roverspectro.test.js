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

  // Fixed 2026-09-09 (full-kit audit): a prior comment mislabeled Basic ATK's real damage share as
  // 4.6% (that 4.6% actually belongs to Intro per the dump's own Damage Profile) — Basic's real share
  // is 6.46% (7,811/120,893), comparable to Heavy's own already-included 9.2%.
  it("dmgFocus includes 'Basic ATK' (6.46% of her real damage profile, not the mislabeled 4.6%)", () => {
    expect(CHARACTER_DATA['Rover: Spectro'].dmgFocus).toEqual(expect.arrayContaining(['Skill', 'Liberation', 'Heavy ATK', 'Basic ATK']));
  });

  // Fixed 2026-09-09 (full-kit audit): the header comment already claimed "category added for Layer 4
  // schema migration", but the field was never actually set — comment/code mismatch, the same bug
  // found on Rover: Aero's and Rover: Havoc's own Intro blocks this session.
  it('Intro Waveshock is skillDmg-categorized (was silently uncategorized)', () => {
    const intro = ROVER_SPECTRO_BLOCKS.find(b => b.id === 'roverspectro.intro.waveshock');
    expect(intro.damage.category).toBe('skillDmg');
  });

  // Fixed 2026-09-09: S1 was an unconditional passive (no duration) instead of the real cast-scoped 7s
  // window her own kit text specifies ("Casting Resonating Slashes or Resonating Spin -> Crit Rate
  // +15% for 7s"). Verified via direct measurement: the old always-on model incorrectly boosted the
  // Heavy ATK warm-up combo, which fires BEFORE any Resonating Slashes/Spin cast in the real rotation.
  it('S1 is a real cast-scoped 7s window (was an incorrect always-on passive)', () => {
    const s1 = ROVER_SPECTRO_BLOCKS.find(b => b.id === 'roverspectro.chain.s1');
    expect(s1.trigger).toEqual({ type: 'cast', on: 'Forte:Resonating Whirl' });
    expect(s1.timing.duration).toBe(7);

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rover: Spectro'], ROVER_SPECTRO_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const s0 = resolveHitComposedDps(ROVER_SPECTRO_BLOCKS, steps, ctx, 3000, 'spectro', 'Sub DPS', null, 0);
    const s1res = resolveHitComposedDps(ROVER_SPECTRO_BLOCKS, steps, ctx, 3000, 'spectro', 'Sub DPS', null, 1);
    const heavyAt = (res) => res.hitLog.filter(h => h.blockId === 'roverspectro.heavy.standard-resonance-aftertune').reduce((sum, h) => sum + h.damage, 0);
    // Heavy ATK fires as the FIRST step, before any Resonating Spin cast — S1's Crit Rate bonus must
    // not have kicked in yet, so its damage should be identical with or without S1 active.
    expect(heavyAt(s1res)).toBeCloseTo(heavyAt(s0), 5);
  });

  // Fixed 2026-09-09: S6 was anchored to 'Skill:Resonating Slashes', which never fires in the real
  // modeled rotation (confirmed via the block's own prior note) — a real, confirmed no-op debuff.
  // Verified via direct measurement that seq5 vs seq6 totals were previously byte-identical.
  it('S6 now actually fires (was a confirmed no-op — anchored to a move never cast in the modeled rotation)', () => {
    const s6 = ROVER_SPECTRO_BLOCKS.find(b => b.id === 'roverspectro.chain.s6');
    expect(s6.trigger).toEqual({ type: 'cast', on: 'Forte:Resonating Whirl' });

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rover: Spectro'], ROVER_SPECTRO_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const s5 = resolveHitComposedDps(ROVER_SPECTRO_BLOCKS, steps, ctx, 3000, 'spectro', 'Sub DPS', null, 5);
    const s6res = resolveHitComposedDps(ROVER_SPECTRO_BLOCKS, steps, ctx, 3000, 'spectro', 'Sub DPS', null, 6);
    expect(s6res.totalDamage).toBeGreaterThan(s5.totalDamage);
  });
});
