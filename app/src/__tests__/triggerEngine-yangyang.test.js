import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { YANGYANG_BLOCKS } from '../engine/characterBlocks/yangyang.blocks.js';

describe('triggerEngine parity — Yangyang', () => {
  it('S2 stays correctly unmodeled (no block) — pure Energy utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Yangyang'];
    expect(rc.s2).toEqual({});
    expect(YANGYANG_BLOCKS.find(b => b.id === 'yangyang.chain.s2')).toBeUndefined();
  });

  it('S1/S3-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Yangyang'];
    expect(YANGYANG_BLOCKS.find(b => b.id === 'yangyang.chain.s1').effects[0].value).toBe(rc.s1.elemDmg);
    expect(YANGYANG_BLOCKS.find(b => b.id === 'yangyang.chain.s3').effects[0].value).toBe(rc.s3.skillDmg);
    expect(YANGYANG_BLOCKS.find(b => b.id === 'yangyang.chain.s4').effects[0].value).toBe(rc.s4.totalMult);
    expect(YANGYANG_BLOCKS.find(b => b.id === 'yangyang.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(YANGYANG_BLOCKS.find(b => b.id === 'yangyang.chain.s6').effects[0].value).toBe(rc.s6.atkPct);
  });

  it('S6 is team-wide with a real 20s window', () => {
    const s6 = YANGYANG_BLOCKS.find(b => b.id === 'yangyang.chain.s6');
    expect(s6.target.scope).toBe('whole-team');
    expect(s6.timing.duration).toBe(20);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yangyang'], YANGYANG_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(YANGYANG_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2000, 'aero', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('yangyang.intro.cerulean-song')).toBe(true);
    expect(fired.has('yangyang.liberation.wind-spirals')).toBe(true);
    expect(fired.has('yangyang.forte.feather-release')).toBe(true);
  });

  it("Intro (Cerulean Song) is skillDmg-categorized (was uncategorized)", () => {
    const intro = YANGYANG_BLOCKS.find(b => b.id === 'yangyang.intro.cerulean-song');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("Zephyr Song is basicDmg-categorized (was wrongly heavyDmg) — the kit text is explicit it's a Basic ATK follow-up, matching the dump's own 0% Heavy share", () => {
    const zephyr = YANGYANG_BLOCKS.find(b => b.id === 'yangyang.heavy.zephyr-song');
    expect(zephyr.damage.category).toBe('basicDmg');
  });

  it("Feather Release is basicDmg-categorized (was uncategorized) — the kit text's \"counted as Basic Attack DMG\" applies to the whole move, not just its landing sub-hit", () => {
    const feather = YANGYANG_BLOCKS.find(b => b.id === 'yangyang.forte.feather-release');
    expect(feather.damage.category).toBe('basicDmg');
  });

  it("dmgFocus is ['Skill', 'Liberation', 'Basic ATK'] — Liberation (42.1%, her single biggest bucket) was missing; Basic ATK gained real sources once Zephyr Song and Feather Release were correctly categorized", () => {
    expect(CHARACTER_DATA['Yangyang'].dmgFocus).toEqual(['Skill', 'Liberation', 'Basic ATK']);
  });
});
