import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { XIANGLI_YAO_BLOCKS } from '../engine/characterBlocks/xianglyao.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Xiangli Yao', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(XIANGLI_YAO_BLOCKS, 'Xiangli Yao');
  });

  // Fixed (documented-gaps sweep): S1's "8% of Law of Reigns' own DMG Multiplier ×6" IS derivable —
  // Law of Reigns' own multiplier is already sourced (95.73%×4+255.28%=638.20%), so 48% of that
  // (306.34%) is a computed, not guessed, number. Modeled as a real bonus-hit damage block.
  // RESONANCE_CHAIN_DATA.s1 deliberately stays {} (see its own comment: no scopedToBlockId there).
  it('S1 is now a real bonus-hit damage block (48% of Law of Reigns\' own sourced multiplier)', () => {
    const rc = RESONANCE_CHAIN_DATA['Xiangli Yao'];
    expect(rc.s1).toEqual({});
    const s1 = XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.chain.s1');
    expect(s1.kind).toBe('damage');
    expect(s1.damage.category).toBe('libDmg');
    expect(s1.damage.hits[0].atkPct).toBeCloseTo(306.34, 1);
    expect(s1.trigger).toEqual({ type: 'cast', on: 'Forte:Law of Reigns' });
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
      { stat: 'skillDmg', value: 63, source: 'self-kit' },
      { stat: 'libDmg', value: 63, source: 'self-kit' },
    ]);
  });

  // Fixed 2026-09-09 (full-kit audit): S3 was anchored to 'Skill:Intuition: Divergence', but the kit
  // text is explicit the real trigger is casting Cogitation Model (Liberation) — a mismatch the file's
  // own prior audit note had flagged but never corrected. This engine time-averages a windowed buff's
  // uptime across the whole rotation, so anchoring later measurably understated its contribution.
  it("S3 is anchored to the real trigger (Cogitation Model cast), not Divergence — verified via direct measurement", () => {
    const s3 = XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.chain.s3');
    expect(s3.trigger).toEqual({ type: 'cast', on: 'Liberation:Cogitation Model' });

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Xiangli Yao'], XIANGLI_YAO_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withCorrectAnchor = resolveHitComposedDps(XIANGLI_YAO_BLOCKS, steps, ctx, 2000, 'electro', 'Main DPS', null, 3);
    const wrongAnchorBlocks = XIANGLI_YAO_BLOCKS.map(b => b.id === 'xianglyao.chain.s3' ? { ...b, trigger: { type: 'cast', on: 'Skill:Intuition: Divergence' } } : b);
    const withWrongAnchor = resolveHitComposedDps(wrongAnchorBlocks, steps, ctx, 2000, 'electro', 'Main DPS', null, 3);
    // Anchoring earlier (the real Cogitation Model cast, which precedes Divergence in the rotation)
    // must yield strictly more total damage than the old, later Divergence anchor.
    expect(withCorrectAnchor.totalDamage).toBeGreaterThan(withWrongAnchor.totalDamage);
  });

  it('Intro is skillDmg-categorized (was uncategorized)', () => {
    const intro = XIANGLI_YAO_BLOCKS.find(b => b.id === 'xianglyao.intro.principle');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("dmgFocus is ['Skill', 'Liberation', 'Basic ATK'] — Basic ATK (8% real share, already basicDmg-categorized via xianglyao.basic.intuition-pivot-impale) was missing despite being above this project's 6.8% include threshold", () => {
    expect(CHARACTER_DATA['Xiangli Yao'].dmgFocus).toEqual(['Skill', 'Liberation', 'Basic ATK']);
  });
});
