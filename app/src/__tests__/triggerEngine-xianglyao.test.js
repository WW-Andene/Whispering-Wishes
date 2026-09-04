import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { XIANGLI_YAO_BLOCKS } from '../engine/characterBlocks/xianglyao.blocks.js';

describe('triggerEngine parity — Xiangli Yao', () => {
  it('S1 stays correctly unmodeled (no block) — no derivable %ATK figure per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Xiangli Yao'];
    expect(rc.s1).toEqual({});
    expect(XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.chain.s1')).toBeUndefined();
  });

  it('S2-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Xiangli Yao'];
    expect(XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.chain.s2').effects[0].value).toBe(rc.s2.critDmg);
    expect(XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.chain.s3').effects[0].value).toBe(rc.s3.skillDmg);
    expect(XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.chain.s4').effects[0].value).toBe(rc.s4.libDmg);
    expect(XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.chain.s6').effects[0].value).toBe(rc.s6.libDmg);
  });

  it('S4 is team-wide with a real 30s window', () => {
    const s4 = XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('the Outro Chain Rule deals real 3x237.63%-ATK procs, no team buff', () => {
    const legacy = CHAR_BUFF_TABLE['Xiangli Yao'];
    expect(legacy.outroBuffs).toEqual([]);
    const outro = XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.outro.chain-rule');
    expect(outro.damage.hits.length).toBe(3);
    expect(outro.damage.hits[0].atkPct).toBeCloseTo(237.63);
  });

  it('selfBuff matches CHAR_BUFF_TABLE with the real per-stack mechanic (5 x4 = 20 max)', () => {
    const legacy = CHAR_BUFF_TABLE['Xiangli Yao'];
    const self = XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.selfbuff.knowing');
    expect(self.effects[0].value * self.effects[0].maxStacks).toBe(legacy.selfBuffs[0].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Xiangli Yao'], XIANGLI_YAO_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(XIANGLI_YAO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'electro', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('xianglyao.intro.principle')).toBe(true);
    expect(fired.has('xianglyao.liberation.cogitation-model')).toBe(true);
    expect(fired.has('xianglyao.forte.law-of-reigns')).toBe(true);
    expect(fired.has('xianglyao.outro.chain-rule')).toBe(true);
  });

  it('S3 covers both the Skill-type portion (skillDmg) AND the Law of Reigns portion (libDmg) of the same buff', () => {
    const s3 = XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.chain.s3');
    expect(s3.effects).toEqual([
      { stat: 'skillDmg', value: 63 },
      { stat: 'libDmg', value: 63 },
    ]);
  });

  it('Intro is skillDmg-categorized (was uncategorized)', () => {
    const intro = XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.intro.principle');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("dmgFocus is ['Skill', 'Liberation', 'Basic ATK'] — Basic ATK (8% real share, already basicDmg-categorized via xianglyao.basic.intuition-pivot-impale) was missing despite being above this project's 6.8% include threshold", () => {
    expect(CHARACTER_DATA['Xiangli Yao'].dmgFocus).toEqual(['Skill', 'Liberation', 'Basic ATK']);
  });
});
