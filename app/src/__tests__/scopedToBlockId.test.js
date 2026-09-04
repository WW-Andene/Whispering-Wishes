// the engine-merge history (git log) Phase 0.5 gap #3 — a buff scoped to ONE SPECIFIC move, not a whole damage
// category. Aemeath's chain.s1 ("+300% Crit DMG for Heavy ATK specifically") was previously modeled as
// a general critDmg buff, over-crediting every OTHER hit sharing critDmg's pool too. `scopedToBlockId`
// restricts an effect's contribution to exactly one damage block's own hits.
import { describe, it, expect } from 'vitest';
import { resolveHitComposedDps } from '../engine/composition/resolveHitComposedDps.js';
import { AEMEATH_BLOCKS } from '../engine/characterBlocks/aemeath.blocks.js';

describe('scopedToBlockId (the engine-merge history (git log) Phase 0.5 gap #3)', () => {
  it('a scoped effect only boosts its named block, not another block sharing the same stat', () => {
    const scopedBuff = {
      id: 'test.scoped-buff', source: 'Test', kind: 'buff',
      trigger: { type: 'passive' },
      timing: {}, target: { scope: 'self' },
      effects: [{ stat: 'deepen', value: 100, scopedToBlockId: 'test.hit-a' }],
    };
    const hitA = {
      id: 'test.hit-a', source: 'Test', kind: 'damage',
      trigger: { type: 'cast', on: 'Skill:A' },
      timing: {}, target: { scope: 'self' }, effects: [],
      damage: { hits: [{ atkPct: 100 }], category: 'skillDmg' },
    };
    const hitB = {
      id: 'test.hit-b', source: 'Test', kind: 'damage',
      trigger: { type: 'cast', on: 'Skill:B' },
      timing: {}, target: { scope: 'self' }, effects: [],
      damage: { hits: [{ atkPct: 100 }], category: 'skillDmg' },
    };
    const steps = [
      { owner: 'Test', type: 'Skill', skill: 'A', stepSeconds: 1 },
      { owner: 'Test', type: 'Skill', skill: 'B', stepSeconds: 1 },
    ];
    const enemyContext = { enemyDef: 0, enemyRes: 0 };
    const withoutBuff = resolveHitComposedDps([hitA, hitB], steps, enemyContext, { atk: 1000 });
    const withBuff = resolveHitComposedDps([hitA, hitB, scopedBuff], steps, enemyContext, { atk: 1000 });
    // hitA gets 2x (deepen+100%), hitB unaffected -> total should be exactly 1.5x the unscoped total
    // (since hitA and hitB deal identical base damage: 2x + 1x = 3x vs 1x + 1x = 2x -> 1.5x ratio).
    expect(withBuff.totalDamage).toBeCloseTo(withoutBuff.totalDamage * 1.5, 3);
  });

  it("Aemeath's chain.s1 Crit DMG bonus is scoped to her one real Heavy ATK block", () => {
    const s1 = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s1');
    expect(s1.effects[0].scopedToBlockId).toBe('aemeath.heavy.mech-charged-ii');
  });

  it("Aemeath's Between the Stars Finale-amp deepen is scoped to her Finale block, not her other libDmg block", () => {
    const buff = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.selfbuff.between-the-stars-finale-amp');
    expect(buff.effects[0].scopedToBlockId).toBe('aemeath.liberation.heavenfall-edict-finale');
    // Confirm the OTHER libDmg-categorized block exists and is a different id (the real over-credit
    // risk this scoping fixes).
    const otherLibDmgBlock = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.heavy.mech-charged-ii');
    expect(otherLibDmgBlock.damage.category).toBe('libDmg');
  });

  it("Aemeath's chain.s3 libDmg:100 is scoped to Finale, but its critDmg:60 stays general (unscoped)", () => {
    const s3 = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s3');
    const libEffect = s3.effects.find(e => e.stat === 'libDmg');
    const critEffect = s3.effects.find(e => e.stat === 'critDmg');
    expect(libEffect.scopedToBlockId).toBe('aemeath.liberation.heavenfall-edict-finale');
    expect(critEffect.scopedToBlockId).toBeUndefined();
  });
});
