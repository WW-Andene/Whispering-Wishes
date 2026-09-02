// ENGINE_MERGE_PLAN.md Phase 0.5 gap #16 — a dedicated 'outroDmg' damage-type category. Xiangli Yao's
// S5 grants Outro Chain Rule's own DMG Multiplier +222%, which previously had no matching category
// in this schema (the 6 existing categories don't cover "Outro DMG") and was entirely unrepresented.
import { describe, it, expect } from 'vitest';
import { createStats, applyBuff } from '../features/teams/calcEngine.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { XIANGLI_YAO_BLOCKS } from '../engine/characterBlocks/xianglyao.blocks.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';

describe("outroDmg category (ENGINE_MERGE_PLAN.md Phase 0.5 gap #16)", () => {
  it('createStats() initializes outroDmg to 0 and applyBuff() routes it correctly', () => {
    const stats = createStats();
    expect(stats.outroDmg).toBe(0);
    applyBuff(stats, 'outroDmg', 25);
    expect(stats.outroDmg).toBe(25);
  });

  it("xianglyao.outro.chain-rule is tagged category:'outroDmg', and chain.s5-outro grants it +222%, gated to sequence 5", () => {
    const outro = XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.outro.chain-rule');
    const s5outro = XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.chain.s5-outro');
    expect(outro.damage.category).toBe('outroDmg');
    expect(s5outro.effects).toEqual([{ stat: 'outroDmg', value: 222 }]);
  });

  it('at sequence 5, the real rotation deals more total damage than at sequence 0 (S5 outro bonus applies)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Xiangli Yao'], XIANGLI_YAO_BLOCKS);
    const enemyContext = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const at0 = resolveHitComposedDps(XIANGLI_YAO_BLOCKS, steps, enemyContext, 3000, 'electro', 'Main DPS', null, 0);
    const at5 = resolveHitComposedDps(XIANGLI_YAO_BLOCKS, steps, enemyContext, 3000, 'electro', 'Main DPS', null, 5);
    expect(at5.totalDamage).toBeGreaterThan(at0.totalDamage);
  });
});
