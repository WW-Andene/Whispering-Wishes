import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { ZHEZHI_BLOCKS } from '../engine/characterBlocks/zhezhi.blocks.js';

describe('triggerEngine parity — Zhezhi', () => {
  it('S2 stays correctly unmodeled (no block) — resource-cap-increase per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Zhezhi'];
    expect(rc.s2).toEqual({});
    expect(ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.chain.s2')).toBeUndefined();
  });

  it('S1/S4 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Zhezhi'];
    expect(ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.chain.s4').target.scope).toBe('whole-team');
  });

  it("S3 (fixed 2026-09-04) is modeled at the real MAX-stack value (15 x3 = 45), per explicit user decision — real mechanic stacks off 3 different casts sharing one pool, which the schema can't express without risking a double-count", () => {
    const rc = RESONANCE_CHAIN_DATA['Zhezhi'];
    const s3 = ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.chain.s3');
    expect(s3.effects[0].value).toBe(rc.s3.atkPct * 3);
  });

  it('S5/S6 are modeled as real, precisely-computed proc-damage blocks, not the flat {} approximation', () => {
    const rc = RESONANCE_CHAIN_DATA['Zhezhi'];
    expect(rc.s5).toEqual({});
    expect(rc.s6).toEqual({});
    const s5 = ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.chain.s5-bonus-hit');
    const s6 = ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.chain.s6-bonus-hit');
    expect(s5.kind).toBe('damage');
    expect(s5.damage.hits[0].atkPct).toBeCloseTo(91.29);
    expect(s6.kind).toBe('damage');
    expect(s6.damage.hits[0].atkPct).toBeCloseTo(357.86);
  });

  it("S5's bonus hit is basicDmg-categorized (fixed 2026-09-04, was wrongly coordDmg) — kit text is explicit \"(Basic Attack DMG)\"", () => {
    const s5 = ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.chain.s5-bonus-hit');
    expect(s5.damage.category).toBe('basicDmg');
  });

  it('S6 (extra Ivory Herald) fires on BOTH real triggers — Stroke of Genius AND Creation\'s Zenith (added 2026-09-04: Creation\'s Zenith was previously never wired despite the kit text explicitly covering it)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Zhezhi'], ZHEZHI_BLOCKS);
    const { hitLog } = resolveHitComposedDps(ZHEZHI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'glacio', 'Sub DPS');
    expect(hitLog.some(h => h.blockId === 'zhezhi.chain.s6-bonus-hit')).toBe(true);
    expect(hitLog.some(h => h.blockId === 'zhezhi.chain.s6-bonus-hit-creations-zenith')).toBe(true);
    const czBonus = ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.chain.s6-bonus-hit-creations-zenith');
    expect(czBonus.damage.hits[0].atkPct).toBeCloseTo(357.86);
    expect(czBonus.damage.category).toBe('basicDmg');
  });

  it('outro matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Zhezhi'];
    const outro = ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.outro.carve-and-draw');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'skillDmg').value).toBe(legacy.outroBuffs[1].value);
  });

  it("Inherent Skill Calligrapher's Touch models real per-stack stacking (6 x3 stacks = 18 max), matching CHAR_BUFF_TABLE's flat max-stack value", () => {
    const legacy = CHAR_BUFF_TABLE['Zhezhi'].selfBuffs[0];
    const block = ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.selfbuff.calligraphers-touch');
    expect(block.effects[0].value * block.effects[0].maxStacks).toBe(legacy.value);
    expect(block.effects[0].stacking).toBe('stacking');
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it("Calligrapher's Touch also fires on Creation's Zenith cast (added 2026-09-04 — the real 3rd trigger was previously missing)", () => {
    const cz = ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.selfbuff.calligraphers-touch-creations-zenith');
    expect(cz.trigger).toEqual({ type: 'cast', on: "Forte:Creation's Zenith" });
    expect(cz.effects[0]).toEqual({ stat: 'atkPct', value: 6, stacking: 'stacking', maxStacks: 3 });
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Zhezhi'], ZHEZHI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(ZHEZHI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'glacio', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('zhezhi.intro.radiant-ruin')).toBe(true);
    expect(fired.has('zhezhi.liberation.living-canvas')).toBe(true);
    expect(fired.has('zhezhi.forte.stroke-of-genius')).toBe(true);
    expect(fired.has('zhezhi.forte.creations-zenith')).toBe(true);
  });

  it("Intro and Living Canvas have real damage.category (both were gaps) — Living Canvas is basicDmg, not coordDmg, per its explicit \"considered Basic Attack DMG\" kit text", () => {
    expect(ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.intro.radiant-ruin').damage.category).toBe('skillDmg');
    expect(ZHEZHI_BLOCKS.find(b => b.id === 'zhezhi.liberation.living-canvas').damage.category).toBe('basicDmg');
  });

  it("dmgFocus is ['Basic ATK'] — 'Coordinated ATK' had zero basis after the Living Canvas/S5 category fix (she has no coordDmg blocks left at all), 'Skill' (5.4% real share) sits in this project's established ambiguous-exclude zone, and 'Basic ATK' (78.4%, her dominant real bucket per the source's own Damage Profile) was entirely missing", () => {
    expect(CHARACTER_DATA['Zhezhi'].dmgFocus).toEqual(['Basic ATK']);
  });
});
