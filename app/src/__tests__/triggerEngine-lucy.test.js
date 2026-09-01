import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { LUCY_BLOCKS } from '../engine/characterBlocks/lucy.blocks.js';

describe('triggerEngine parity — Lucy', () => {
  it('S1/S2/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lucy'];
    expect(LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s1').effects[0].value).toBe(rc.s1.atkPct);
    expect(LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s2').effects[0].value).toBe(rc.s2.totalMult);
    expect(LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s5').effects[0].value).toBe(rc.s5.totalMult);
    expect(LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s6').effects[0].value).toBe(rc.s6.heavyDmg);
  });

  it('S2 additionally has a real 450%-ATK bonus-hit proc block beyond the flat totalMult approximation', () => {
    const bonus = LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s2-bonus-hit');
    expect(bonus.kind).toBe('damage');
    expect(bonus.damage.hits[0].atkPct).toBe(450);
  });

  it('S3 has both real effects, matching RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lucy'];
    const s3 = LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s3');
    expect(s3.effects.find(e => e.stat === 'libDmg').value).toBe(rc.s3.libDmg);
    expect(s3.effects.find(e => e.stat === 'critDmg').value).toBe(rc.s3.critDmg);
  });

  it('S4 is team-wide, matching RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Lucy'];
    const s4 = LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s4');
    expect(s4.effects[0].value).toBe(rc.s4.allDmg);
    expect(s4.target.scope).toBe('whole-team');
  });

  it('outro and debuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Lucy'];
    const outro = LUCY_BLOCKS.find(b => b.id === 'lucy.outro.countermeasure-program');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const deb = LUCY_BLOCKS.find(b => b.id === 'lucy.debuff.breach-protocol');
    expect(deb.effects[0].value).toBe(legacy.debuffs[0].value);
    expect(deb.timing.duration).toBe(legacy.debuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lucy'], LUCY_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LUCY_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'spectro', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lucy.intro.outdated-hallucination')).toBe(true);
    expect(fired.has('lucy.heavy.multi-threading')).toBe(true);
    expect(fired.has('lucy.liberation.old-net-deep-dive')).toBe(true);
    expect(fired.has('lucy.chain.s2-bonus-hit')).toBe(true);
  });
});
