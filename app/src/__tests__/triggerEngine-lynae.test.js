import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { LYNAE_BLOCKS } from '../engine/characterBlocks/lynae.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Lynae', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(LYNAE_BLOCKS, 'Lynae');
  });

  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lynae'];
    expect(LYNAE_BLOCKS.find(b => b.id === 'lynae.chain.s1').effects[0].value).toBe(rc.s1.basicDmg);
    expect(LYNAE_BLOCKS.find(b => b.id === 'lynae.chain.s2').effects[0].value).toBe(rc.s2.allDmg);
    expect(LYNAE_BLOCKS.find(b => b.id === 'lynae.chain.s3').effects[0].value).toBe(rc.s3.basicDmg);
    expect(LYNAE_BLOCKS.find(b => b.id === 'lynae.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(LYNAE_BLOCKS.find(b => b.id === 'lynae.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(LYNAE_BLOCKS.find(b => b.id === 'lynae.chain.s6').effects).toEqual([]);
  });

  it('outro and libBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Lynae'];
    const outro = LYNAE_BLOCKS.find(b => b.id === 'lynae.outro.lets-hit-the-road-buff');
    expect(outro.effects.find(e => e.stat === 'allDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'libDmg').value).toBe(legacy.outroBuffs[1].value);
    const lib = LYNAE_BLOCKS.find(b => b.id === 'lynae.libbuff.prismatic-overblast');
    expect(lib.effects[0].value).toBe(legacy.libBuffs[0].value);
    expect(lib.timing.duration).toBe(legacy.libBuffs[0].duration);
    expect(lib.target.scope).toBe('whole-team');
  });

  it("lynae.outro.lets-hit-the-road is tagged category:'outroDmg' (Phase A audit 2026-09-04 fix — was uncategorized, silently missing any real outroDmg-scoped buff)", () => {
    const outroHit = LYNAE_BLOCKS.find(b => b.id === 'lynae.outro.lets-hit-the-road');
    expect(outroHit.damage.category).toBe('outroDmg');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lynae'], LYNAE_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LYNAE_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'spectro', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lynae.intro.time-to-show-some-colors')).toBe(true);
    expect(fired.has('lynae.liberation.prismatic-overblast')).toBe(true);
    expect(fired.has('lynae.forte.visual-impact')).toBe(true);
    expect(fired.has('lynae.outro.lets-hit-the-road')).toBe(true);
  });
});
