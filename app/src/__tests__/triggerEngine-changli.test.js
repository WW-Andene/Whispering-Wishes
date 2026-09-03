import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CHANGLI_BLOCKS } from '../engine/characterBlocks/changli.blocks.js';

describe('triggerEngine parity — Changli', () => {
  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Changli'];
    const s1 = CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s1');
    expect(s1.effects.find(e => e.stat === 'skillDmg').value).toBe(rc.s1.skillDmg);
    expect(s1.effects.find(e => e.stat === 'heavyDmg').value).toBe(rc.s1.heavyDmg);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s2').effects[0].value).toBe(rc.s2.critRate);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s5-heavydmg').effects[0].value).toBe(rc.s5.heavyDmg);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s5-totalmult').effects[0].value).toBe(rc.s5.totalMult);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s6').effects[0].value).toBe(rc.s6.defIgnore);
  });

  it('S4 is team-wide with the real audit-confirmed 30s window', () => {
    const s4 = CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('S2 is a short 8s Crit Rate window, not a flat passive', () => {
    const s2 = CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s2');
    expect(s2.timing.duration).toBe(8);
  });

  it('outro and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Changli'];
    const outro = CHANGLI_BLOCKS.find(b => b.id === 'changli.outro.strategy-of-duality');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'libDmg').value).toBe(legacy.outroBuffs[1].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const self = CHANGLI_BLOCKS.find(b => b.id === 'changli.selfbuff.fiery-feather');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(self.timing.duration).toBe(legacy.selfBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Changli'], CHANGLI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CHANGLI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'fusion', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('changli.intro.obedience-of-rules')).toBe(true);
    expect(fired.has('changli.liberation.radiance-of-fealty')).toBe(true);
    expect(fired.has('changli.forte.flaming-sacrifice')).toBe(true);
    expect(fired.has('changli.heavy.standard')).toBe(true);
  });
});
