import { describe, it, expect } from 'vitest';
import { createStats, applyResonanceChain } from '../features/teams/calcEngine.js';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/triggerEngine.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { BAIZHI_BLOCKS } from '../engine/characterBlocks/baizhi.blocks.js';

describe('triggerEngine parity — Baizhi', () => {
  it('S1/S3/S4/S5 stay zeroed (no fabricated DPS component) in both the block set and the flat table', () => {
    const rc = RESONANCE_CHAIN_DATA['Baizhi'];
    expect(rc.s1).toEqual({});
    expect(rc.s3).toEqual({});
    expect(rc.s4).toEqual({});
    expect(rc.s5).toEqual({});
    ['baizhi.chain.s1', 'baizhi.chain.s3', 'baizhi.chain.s4', 'baizhi.chain.s5'].forEach(id => {
      expect(BAIZHI_BLOCKS.find(b => b.id === id)).toBeUndefined(); // no block created at all for these — correctly not fabricated
    });
  });

  it('S2/S6 elemDmg values match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Baizhi'];
    const s2 = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.chain.s2');
    const s6 = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.chain.s6');
    expect(s2.effects[0].value).toBe(rc.s2.elemDmg);
    expect(s6.effects[0].value).toBe(rc.s6.elemDmg);
    expect(s6.target.scope).toBe('whole-team'); // per its own real mechanic, not self
  });

  it('Rejuvinating Flow outro buff and Euphonia ATK libBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Baizhi'];
    const outroBlock = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.outro.rejuvinating-flow');
    const libBlock = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.libbuff.euphonia-atk');
    expect(outroBlock.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outroBlock.timing.duration).toBe(legacy.outroBuffs[0].duration);
    expect(libBlock.effects[0].value).toBe(legacy.libBuffs[0].value);
    expect(libBlock.timing.duration).toBe(legacy.libBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Baizhi'], BAIZHI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(BAIZHI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2000, 'glacio', 'Healer');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('baizhi.intro.overflowing-frost')).toBe(true);
    expect(fired.has('baizhi.liberation.momentary-union')).toBe(true);
    expect(fired.has('baizhi.skill.emergency-plan')).toBe(true);
    expect(fired.has('baizhi.heavy.destined-promise-channel')).toBe(true);
  });

  it("Intro (Overflowing Frost) is skillDmg-categorized (was uncategorized) — dump's own multiplier row is labeled generically \"Skill Damage\"", () => {
    const intro = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.intro.overflowing-frost');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("dmgFocus gains 'Liberation'/'Heavy ATK' — both already correctly libDmg/heavyDmg-categorized real blocks firing in her real rotation", () => {
    expect(CHARACTER_DATA['Baizhi'].dmgFocus).toEqual(['Skill', 'Liberation', 'Heavy ATK']);
  });
});
