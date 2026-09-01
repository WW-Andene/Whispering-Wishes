import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { JIYAN_BLOCKS } from '../engine/characterBlocks/jiyan.blocks.js';

describe('triggerEngine parity — Jiyan', () => {
  it('S1 stays correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Jiyan'];
    expect(rc.s1).toEqual({ totalMult: 0 });
    expect(JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s1')).toBeUndefined();
  });

  it('S2-S4/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Jiyan'];
    expect(JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s2').effects[0].value).toBe(rc.s2.atkPct);
    const s3 = JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s3');
    expect(s3.effects.find(e => e.stat === 'critRate').value).toBe(rc.s3.critRate);
    expect(s3.effects.find(e => e.stat === 'critDmg').value).toBe(rc.s3.critDmg);
    expect(JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s4').effects[0].value).toBe(rc.s4.heavyDmg);
    expect(JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s6').effects[0].value).toBe(rc.s6.totalMult);
  });

  it('S5 is split into its two real effects, the ATK stack matching RESONANCE_CHAIN_DATA at max stacks', () => {
    const rc = RESONANCE_CHAIN_DATA['Jiyan'];
    const mult = JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s5-outro-mult');
    const stack = JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s5-atk-stack');
    expect(mult.effects[0].value).toBe(rc.s5.totalMult);
    expect(stack.effects[0].value * stack.effects[0].maxStacks).toBe(rc.s5.atkPct);
  });

  it('S4 is team-wide with a real 30s window', () => {
    const s4 = JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jiyan'], JIYAN_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(JIYAN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'aero', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('jiyan.intro.tactical-strike')).toBe(true);
    expect(fired.has('jiyan.heavy.lance-of-qingloong')).toBe(true);
    expect(fired.has('jiyan.skill.windqueller')).toBe(true);
    expect(fired.has('jiyan.outro.discipline')).toBe(true);
  });
});
