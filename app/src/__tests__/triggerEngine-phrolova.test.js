import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { PHROLOVA_BLOCKS } from '../engine/characterBlocks/phrolova.blocks.js';

describe('triggerEngine parity — Phrolova', () => {
  it('S5 stays correctly unmodeled (no block) — purely defensive per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Phrolova'];
    expect(rc.s5).toEqual({});
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s5')).toBeUndefined();
  });

  it('S1-S4/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Phrolova'];
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s1').effects[0].value).toBe(rc.s1.totalMult);
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s2').effects[0].value).toBe(rc.s2.skillDmg);
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s3').effects[0].value).toBe(rc.s3.echoDmg);
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s4').effects[0].value).toBe(rc.s4.allDmg);
    expect(PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s6').effects[0].value).toBe(rc.s6.elemDmg);
  });

  it('S2 is correctly skillDmg (not heavyDmg despite replacing Heavy Attack)', () => {
    const s2 = PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s2');
    expect(s2.effects[0].stat).toBe('skillDmg');
  });

  it('S4 is team-wide with a real 30s window', () => {
    const s4 = PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('outro and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Phrolova'];
    const outro = PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.outro.unfinished-piece');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'heavyDmg').value).toBe(legacy.outroBuffs[1].value);
    const self = PHROLOVA_BLOCKS.find(b => b.id === 'phrolova.selfbuff.aftersound');
    expect(self.effects[0].value * self.effects[0].maxStacks).toBe(legacy.selfBuffs[0].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Phrolova'], PHROLOVA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(PHROLOVA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'havoc', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('phrolova.intro.suite-of-immortality')).toBe(true);
    expect(fired.has('phrolova.heavy.scarlet-coda')).toBe(true);
    expect(fired.has('phrolova.liberation.waltz-of-forsaken-depths')).toBe(true);
  });
});
