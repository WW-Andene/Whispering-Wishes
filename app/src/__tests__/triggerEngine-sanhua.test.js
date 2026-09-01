import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { SANHUA_BLOCKS } from '../engine/characterBlocks/sanhua.blocks.js';

describe('triggerEngine parity — Sanhua', () => {
  it('S2 stays correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Sanhua'];
    expect(rc.s2).toEqual({});
    expect(SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s2')).toBeUndefined();
  });

  it('S1/S3/S4/S5 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Sanhua'];
    expect(SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s3').effects[0].value).toBe(rc.s3.totalMult);
    expect(SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s4').effects[0].value).toBe(rc.s4.heavyDmg);
    expect(SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s5').effects[0].value).toBe(rc.s5.critDmg);
  });

  it('S6 models the real per-stack mechanic (10 x2 stacks = 20 max), team-wide', () => {
    const rc = RESONANCE_CHAIN_DATA['Sanhua'];
    const s6 = SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s6');
    expect(s6.effects[0].value * s6.effects[0].maxStacks).toBe(rc.s6.atkPct);
    expect(s6.target.scope).toBe('whole-team');
  });

  it('the Detonate block combines both Detonate and Ice Burst hits', () => {
    const b = SANHUA_BLOCKS.find(bl => bl.id === 'sanhua.forte.clarity-of-mind-detonate');
    expect(b.damage.hits.length).toBe(5); // 186.29%x2 + 3 separate Ice Burst hits
  });

  it('outro matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Sanhua'];
    const outro = SANHUA_BLOCKS.find(b => b.id === 'sanhua.outro.silversnow');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Sanhua'], SANHUA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(SANHUA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2000, 'glacio', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('sanhua.intro.freezing-thorns')).toBe(true);
    expect(fired.has('sanhua.liberation.glacial-gaze')).toBe(true);
    expect(fired.has('sanhua.forte.clarity-of-mind-detonate')).toBe(true);
  });
});
