import { describe, it, expect } from 'vitest';
import { CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { YUANWU_BLOCKS } from '../engine/characterBlocks/yuanwu.blocks.js';

describe('triggerEngine parity — Yuanwu', () => {
  it('S1-S4/S6 stay correctly unmodeled (no block) — no matching DPS category per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Yuanwu'];
    ['s1', 's2', 's3', 's4', 's6'].forEach(s => expect(rc[s]).toEqual({}));
    ['yuanwu.chain.s1', 'yuanwu.chain.s2', 'yuanwu.chain.s3', 'yuanwu.chain.s4', 'yuanwu.chain.s6'].forEach(id => {
      expect(YUANWU_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S5 matches RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Yuanwu'];
    expect(YUANWU_BLOCKS.find(b => b.id === 'yuanwu.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
  });

  it('Blazing Might combines the Thunder Wedge Detonation and its own hit', () => {
    const b = YUANWU_BLOCKS.find(bl => bl.id === 'yuanwu.liberation.blazing-might');
    expect(b.damage.hits.length).toBe(3); // 1 detonation hit + 2 Blazing Might hits
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    // baseStats needs both atk and def now: 2026-09-02 fixed his damage blocks to basis: 'DEF' (he's a
    // DEF-scaler per a fresh Prydwen dump — every one of his real multipliers is explicitly DEF-scaling,
    // was defaulting to ATK-scaling before this fix, same as CHARACTER_DATA['Yuanwu'].statScaling).
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yuanwu'], YUANWU_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(YUANWU_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { atk: 2000, def: 2000 }, 'electro', 'Support');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('yuanwu.intro.thunder-bombardment')).toBe(true);
    expect(fired.has('yuanwu.liberation.blazing-might')).toBe(true);
    expect(fired.has('yuanwu.forte.rumbling-spark')).toBe(true);
  });
});
