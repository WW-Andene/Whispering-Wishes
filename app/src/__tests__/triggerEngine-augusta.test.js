import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';

describe('triggerEngine parity — Augusta', () => {
  it('S1/S2 model the real per-stack mechanics, matching RESONANCE_CHAIN_DATA at max stacks', () => {
    const rc = RESONANCE_CHAIN_DATA['Augusta'];
    const s1 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s1');
    const s2 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s2');
    expect(s1.effects[0].value * s1.effects[0].maxStacks).toBe(rc.s1.critDmg);
    expect(s2.effects[0].value * s2.effects[0].maxStacks).toBe(rc.s2.critRate);
  });

  it('S3/S4 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Augusta'];
    expect(AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s3').effects[0].value).toBe(rc.s3.totalMult);
    expect(AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s4-ascent-in-sun-and-glory').effects[0].value).toBe(rc.s4.atkPct);
  });

  // S5 (Glory's Favor shield value +50%) has zero DPS component — a purely defensive stat, no basis
  // for any damage number. Zeroed 2026-09-02 in both RESONANCE_CHAIN_DATA and this engine block (was
  // a fabricated totalMult:15 "approximate DPS-uptime proxy" in both, the exact "invented number with
  // no basis" shape this codebase's own rule removes elsewhere, e.g. Brant's S1/Phrolova's S5).
  it('S5 has no DPS component in either RESONANCE_CHAIN_DATA or the engine block', () => {
    const rc = RESONANCE_CHAIN_DATA['Augusta'];
    expect(rc.s5).toEqual({});
    const s5 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s5');
    expect(s5.effects).toEqual([]);
  });

  it('S4 is team-wide with a real 30s window', () => {
    const s4 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s4-ascent-in-sun-and-glory');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('S6 is modeled as a real 2x100%-ATK Thunder Rage proc block, not the flat heavyDmg:200 approximation', () => {
    const rc = RESONANCE_CHAIN_DATA['Augusta'];
    expect(rc.s6).toEqual({ heavyDmg: 200 });
    expect(AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s6')).toBeUndefined();
    const s6 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s6-thunder-rage');
    expect(s6.kind).toBe('damage');
    expect(s6.damage.hits).toEqual([{ atkPct: 100 }, { atkPct: 100 }]);
  });

  it('outro and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Augusta'];
    const outro = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.outro.battlesong');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const self = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.selfbuff.crown-of-wills-base');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Augusta'], AUGUSTA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(AUGUSTA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'electro', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('augusta.intro.stride-of-goldenflare')).toBe(true);
    expect(fired.has('augusta.liberation.sword-of-eternal-oath')).toBe(true);
    expect(fired.has('augusta.liberation.everbright-protector')).toBe(true);
    expect(fired.has('augusta.chain.s6-thunder-rage')).toBe(true);
  });
});
