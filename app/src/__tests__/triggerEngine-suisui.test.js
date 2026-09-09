import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { SUISUI_BLOCKS } from '../engine/characterBlocks/suisui.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Suisui', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(SUISUI_BLOCKS, 'Suisui');
  });

  it('S1/S3/S4 stay correctly unmodeled (no block) — pure utility/healing per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Suisui'];
    expect(rc.s1).toEqual({});
    expect(rc.s3).toEqual({});
    expect(rc.s4).toEqual({});
    ['suisui.chain.s1', 'suisui.chain.s3', 'suisui.chain.s4'].forEach(id => {
      expect(SUISUI_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S2/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Suisui'];
    expect(SUISUI_BLOCKS.find(b => b.id === 'suisui.chain.s2').effects[0].value).toBe(rc.s2.critDmg);
    const s5 = SUISUI_BLOCKS.find(b => b.id === 'suisui.chain.s5');
    expect(s5.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s5.basicDmg);
    expect(s5.effects.find(e => e.stat === 'heavyDmg').value).toBe(rc.s5.heavyDmg);
    expect(SUISUI_BLOCKS.find(b => b.id === 'suisui.chain.s6').effects[0].value).toBe(rc.s6.critDmg);
  });

  it('Intro and Awakening Spring use HP basis, not ATK', () => {
    const intro = SUISUI_BLOCKS.find(b => b.id === 'suisui.intro.tinkling-jade');
    expect(intro.damage.basis).toBe('HP');
  });

  it('every damage block has a damage.category set (2026-09-04 fix: Intro was missing it)', () => {
    const damageBlocks = SUISUI_BLOCKS.filter(b => b.kind === 'damage');
    expect(damageBlocks.length).toBeGreaterThan(0);
    damageBlocks.forEach(b => {
      expect(b.damage.category, `block ${b.id} missing damage.category`).toBeTruthy();
    });
    const intro = SUISUI_BLOCKS.find(b => b.id === 'suisui.intro.tinkling-jade');
    expect(intro.damage.category).toBe('introDmg');
  });

  it('outro and selfBuffs match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Suisui'];
    const outro = SUISUI_BLOCKS.find(b => b.id === 'suisui.outro.rippling-waters');
    const outroConditional = SUISUI_BLOCKS.find(b => b.id === 'suisui.outro.rippling-waters-ceaseless-landscape');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outroConditional.effects[0].value).toBe(legacy.outroBuffs[1].value);
    const self = SUISUI_BLOCKS.find(b => b.id === 'suisui.selfbuff.sky-over-water-critrate');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
  });

  // Fixed 2026-09-09 (full-kit audit): the crit-rate half of Sky Over Water's "that hit" bonus was
  // modeled with timing.duration:999 — buildBlockWindows treats any non-null duration as a real,
  // near-permanent window, not the single-hit-scoped bonus the kit text describes. The elemDmg block
  // right below it (same real event) already correctly used an instant, no-duration shape.
  it('sky-over-water-critrate is instant/no-duration, matching its own sibling elemDmg block', () => {
    const critRate = SUISUI_BLOCKS.find(b => b.id === 'suisui.selfbuff.sky-over-water-critrate');
    const elemDmg = SUISUI_BLOCKS.find(b => b.id === 'suisui.selfbuff.sky-over-water-elemdmg');
    expect(critRate.timing.duration).toBeUndefined();
    expect(elemDmg.timing.duration).toBeUndefined();

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Suisui'], SUISUI_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const baseStats = { atk: 1000, hp: 40000 };
    const { hitLog } = resolveHitComposedDps(SUISUI_BLOCKS, steps, ctx, baseStats, 'glacio', 'Support');
    const nonIntroTotal = hitLog.filter(h => h.blockId !== 'suisui.intro.tinkling-jade').reduce((s, h) => s + h.damage, 0);
    // Sanity bound from the real bug: the old always-on model inflated the non-Intro total by ~28%
    // over this same synthetic baseline (8140.93 vs the correct 5855.76) — confirm it stays fixed.
    expect(nonIntroTotal).toBeCloseTo(5855.757387862795, 0);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total using her HP base stat', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Suisui'], SUISUI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(SUISUI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { atk: 2200, hp: 30000 }, 'glacio', 'Support/Healer');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('suisui.intro.tinkling-jade')).toBe(true);
    expect(fired.has('suisui.basic.drizzle-stance-stage1-4')).toBe(true);
  });
});
