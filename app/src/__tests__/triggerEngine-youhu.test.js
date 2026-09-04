import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { YOUHU_BLOCKS } from '../engine/characterBlocks/youhu.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Youhu', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(YOUHU_BLOCKS, 'Youhu');
  });

  it('S1/S2/S4 stay correctly unmodeled (no block) per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Youhu'];
    ['s1', 's2', 's4'].forEach(s => expect(rc[s]).toEqual({}));
    ['youhu.chain.s1', 'youhu.chain.s2', 'youhu.chain.s4'].forEach(id => {
      expect(YOUHU_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S3/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Youhu'];
    expect(YOUHU_BLOCKS.find(b => b.id === 'youhu.chain.s3').effects[0].value).toBe(rc.s3.atkPct);
    expect(YOUHU_BLOCKS.find(b => b.id === 'youhu.chain.s5').effects[0].value).toBe(rc.s5.critRate);
    const s6 = YOUHU_BLOCKS.find(b => b.id === 'youhu.chain.s6');
    expect(s6.effects[0].value * s6.effects[0].maxStacks).toBe(rc.s6.critDmg);
  });

  it("S6 (fixed 2026-09-04) is triggered by the real Antique Appraisal cast, not trigger.type:'passive' — the passive path silently ignores stacking/duration, so this used to contribute a flat +15% Crit DMG forever instead of real per-cast stacking toward 60%", () => {
    const s6 = YOUHU_BLOCKS.find(b => b.id === 'youhu.chain.s6');
    expect(s6.trigger).toEqual({ type: 'cast', on: 'Skill:Ruyi' });
    expect(s6.timing.duration).toBe(7);
    expect(s6.effects[0].stacking).toBe('stacking');
    expect(s6.effects[0].maxStacks).toBe(4);
  });

  it('Rare Find (Inherent Skill, added 2026-09-04, dimension 8: was entirely unmodeled) grants +15% Glacio DMG for 14s after Intro', () => {
    const rareFind = YOUHU_BLOCKS.find(b => b.id === 'youhu.inherent.rare-find');
    expect(rareFind.trigger).toEqual({ type: 'cast', on: 'Intro:Scroll of Wonders' });
    expect(rareFind.timing.duration).toBe(14);
    expect(rareFind.effects[0]).toEqual({ stat: 'elemDmg', value: 15, source: 'self-kit' });
  });

  it('Intro is skillDmg-categorized (was uncategorized)', () => {
    const intro = YOUHU_BLOCKS.find(b => b.id === 'youhu.intro.scroll-of-wonders');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("dmgFocus is ['Skill', 'Liberation', 'Basic ATK'] — 'Coordinated ATK' was wrong (that's the buff she GRANTS via Outro, not her own damage; she has zero coordDmg-category blocks), Skill/Liberation/Basic ATK were all missing despite being real, already-categorized damage that fires every real rotation loop", () => {
    expect(CHARACTER_DATA['Youhu'].dmgFocus).toEqual(['Skill', 'Liberation', 'Basic ATK']);
  });

  it('outro matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Youhu'];
    const outro = YOUHU_BLOCKS.find(b => b.id === 'youhu.outro.timeless-classics');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Youhu'], YOUHU_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(YOUHU_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2000, 'glacio', 'Support');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('youhu.intro.scroll-of-wonders')).toBe(true);
    expect(fired.has("youhu.liberation.fortunes-favor")).toBe(true);
    expect(fired.has('youhu.skill.ruyi')).toBe(true);
  });
});
