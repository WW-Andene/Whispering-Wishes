import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { SIGRIKA_BLOCKS } from '../engine/characterBlocks/sigrika.blocks.js';

describe('triggerEngine parity — Sigrika', () => {
  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Sigrika'];
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s1').effects[0].value).toBe(rc.s1.totalMult);
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s2').effects[0].value).toBe(rc.s2.echoDmg);
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s3').effects[0].value).toBe(rc.s3.totalMult);
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s5').effects[0].value).toBe(rc.s5.echoDmg);
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s6').effects[0].value).toBe(rc.s6.deepen);
  });

  it('selfBuffs match CHAR_BUFF_TABLE at their documented cap/max-stack values', () => {
    const legacy = CHAR_BUFF_TABLE['Sigrika'];
    const er = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.selfbuff.aligned-names');
    const elem = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.libbuff.blessing-of-runes-elemdmg');
    const echo = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.libbuff.blessing-of-runes-echodmg');
    expect(er.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(elem.effects[0].value).toBe(legacy.selfBuffs[1].value);
    expect(echo.effects[0].value).toBe(legacy.selfBuffs[2].value);
    expect(elem.target.scope).toBe('whole-team');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Sigrika'], SIGRIKA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(SIGRIKA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'aero', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('sigrika.intro.solsworn-etymology')).toBe(true);
    expect(fired.has('sigrika.liberation.where-trust-leads-me')).toBe(true);
    expect(fired.has('sigrika.forte.learn-my-true-name')).toBe(true);
    expect(fired.has('sigrika.forte.schemata-chain-whip')).toBe(true);
  });
});
