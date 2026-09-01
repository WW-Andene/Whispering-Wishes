import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { LUMI_BLOCKS } from '../engine/characterBlocks/lumi.blocks.js';

describe('triggerEngine parity — Lumi', () => {
  it('S1 stays correctly unmodeled (no block) — pure STA-restore utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Lumi'];
    expect(rc.s1).toEqual({});
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s1')).toBeUndefined();
  });

  it('S2-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lumi'];
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s2').effects[0].value).toBe(rc.s2.defIgnore);
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s4').effects[0].value).toBe(rc.s4.basicDmg);
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s5').effects[0].value).toBe(rc.s5.totalMult);
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s6').effects[0].value).toBe(rc.s6.atkPct);
  });

  it('S6 is team-wide with a real 20s window', () => {
    const s6 = LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s6');
    expect(s6.target.scope).toBe('whole-team');
    expect(s6.timing.duration).toBe(20);
  });

  it('outro matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Lumi'];
    const outro = LUMI_BLOCKS.find(b => b.id === 'lumi.outro.escorting');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lumi'], LUMI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LUMI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'electro', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lumi.intro.special-delivery')).toBe(true);
    expect(fired.has('lumi.liberation.squeakie-express')).toBe(true);
    expect(fired.has('lumi.forte.energized-pounce')).toBe(true);
    expect(fired.has('lumi.forte.glare')).toBe(true);
  });
});
