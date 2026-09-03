// the engine-merge history (git log) Phase 0.5 gap #7 — a per-resource-unit-consumed damage scalar. Denia's Dark Core
// scalar ("+150% DMG Multiplier per Dark Core consumed") and Chisa's Ring of Chainsaw scalar ("+2.59%
// per Ring consumed") were both previously unmodeled entirely. Both use the same proportional-second-hit
// pattern gap #6 (Brant's S6 secondary blast) established: a same-instant, same-category hit scales in
// exact proportion through the shared multiplier chain, at the documented resource cap.
import { describe, it, expect } from 'vitest';
import { sumHitsAtkPct } from '../engine/skillMultiplierParser.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { DENIA_BLOCKS } from '../engine/characterBlocks/denia.blocks.js';
import { CHISA_BLOCKS } from '../engine/characterBlocks/chisa.blocks.js';

describe('per-resource-consumed scalar (the engine-merge history (git log) Phase 0.5 gap #7)', () => {
  it("Denia's Dark Core scalar is exactly 4.5x (450%) of Stage 2's own summed %ATK (base-kit 3-core cap)", () => {
    const base = DENIA_BLOCKS.find(b => b.id === 'denia.liberation.banish-breakdown-stage2');
    const scalar = DENIA_BLOCKS.find(b => b.id === 'denia.liberation.banish-breakdown-stage2-dark-core-scalar');
    const baseTotal = sumHitsAtkPct(base.damage.hits);
    expect(scalar.damage.hits[0].atkPct).toBeCloseTo(baseTotal * 4.5, 1);
    expect(scalar.damage.category).toBe('libDmg');
  });

  it("Chisa's Ring of Chainsaw scalar is exactly 2.59x (259%) of Eradication's own summed %ATK (100-point cap)", () => {
    const base = CHISA_BLOCKS.find(b => b.id === 'chisa.forte.sawring-eradication');
    const scalar = CHISA_BLOCKS.find(b => b.id === 'chisa.forte.sawring-eradication-ring-scalar');
    const baseTotal = sumHitsAtkPct(base.damage.hits);
    expect(scalar.damage.hits[0].atkPct).toBeCloseTo(baseTotal * 2.59, 1);
  });

  it("Denia's scalar boosts only Stage 2's own damage, not other hits in the same rotation", () => {
    const steps = [
      { owner: 'Denia', type: 'Liberation', skill: 'Banish - Breakdown Form Stage 2', stepSeconds: 1 },
      { owner: 'Denia', type: 'Skill', skill: 'Banish - Breakdown Form Stage 1', stepSeconds: 1 },
    ];
    const enemyContext = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withScalar = resolveHitComposedDps(DENIA_BLOCKS, steps, enemyContext, 3000, 'fusion', 'Main DPS');
    const withoutScalar = resolveHitComposedDps(
      DENIA_BLOCKS.filter(b => b.id !== 'denia.liberation.banish-breakdown-stage2-dark-core-scalar'),
      steps, enemyContext, 3000, 'fusion', 'Main DPS'
    );
    const stage1Hit = h => h.blockId === 'denia.skill.banish-breakdown-stage1';
    const stage2BaseHit = h => h.blockId === 'denia.liberation.banish-breakdown-stage2';
    const scalarHit = h => h.blockId === 'denia.liberation.banish-breakdown-stage2-dark-core-scalar';
    const stage1WithScalar = withScalar.hitLog.filter(stage1Hit).reduce((s, h) => s + h.damage, 0);
    const stage1WithoutScalar = withoutScalar.hitLog.filter(stage1Hit).reduce((s, h) => s + h.damage, 0);
    const stage2BaseWithScalar = withScalar.hitLog.filter(stage2BaseHit).reduce((s, h) => s + h.damage, 0);
    const stage2BaseWithoutScalar = withoutScalar.hitLog.filter(stage2BaseHit).reduce((s, h) => s + h.damage, 0);
    const scalarDamage = withScalar.hitLog.filter(scalarHit).reduce((s, h) => s + h.damage, 0);
    expect(stage1WithScalar).toBeCloseTo(stage1WithoutScalar, 3); // untouched
    expect(stage2BaseWithScalar).toBeCloseTo(stage2BaseWithoutScalar, 3); // base hit itself untouched
    expect(scalarDamage).toBeCloseTo(stage2BaseWithScalar * 4.5, 1); // the extra hit is exactly 4.5x
    expect(withScalar.totalDamage).toBeCloseTo(withoutScalar.totalDamage + scalarDamage, 1);
  });
});
