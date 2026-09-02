// Regression test found while cross-checking Yuanwu against a fresh Prydwen.gg source dump. Every one
// of his real Lv.10 multipliers is explicitly DEF-scaling (the source suffixes every value with "DEF")
// — Thunder Wedge, Thunder Wedge Detonation, Rumbling Spark, Blazing Might, Thunder Bombardment, and
// every Lightning Infused attack. His own endgame stat guidance also prioritizes DEF (1800+) over ATK
// (1200+, explicitly "skippable").
//
// Two places had this wrong:
// 1. CHARACTER_DATA['Yuanwu'].statScaling was 'ATK' — this feeds calcTeamStats.js's baseStat routing
//    (scaling === 'DEF' ? d.baseDef : ... : charAtk + weapAtk), so his damage was computing off ATK
//    entirely.
// 2. None of his live-engine damage blocks (yuanwu.blocks.js) carried `basis: 'DEF'` —
//    resolveHitComposedDps.js's own doc says every hit defaults to ATK-scaling unless a block says
//    otherwise, so even with statScaling fixed, the block-engine path (which both of calcTeamStats.js's
//    real callers already pass `def` to) was still silently computing his damage against ATK.
import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA } from '../data/characters.js';
import { YUANWU_BLOCKS } from '../engine/characterBlocks/yuanwu.blocks.js';

describe('Yuanwu is correctly modeled as a DEF-scaler, not ATK', () => {
  it("CHARACTER_DATA['Yuanwu'].statScaling is 'DEF'", () => {
    expect(CHARACTER_DATA['Yuanwu'].statScaling).toBe('DEF');
  });

  it('every damage block carries basis: "DEF"', () => {
    const damageBlocks = YUANWU_BLOCKS.filter(b => b.kind === 'damage');
    expect(damageBlocks.length).toBeGreaterThan(0);
    damageBlocks.forEach(b => expect(b.damage.basis).toBe('DEF'));
  });
});
