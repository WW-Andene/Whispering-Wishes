import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, CHARACTER_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { HIYUKI_BLOCKS } from '../engine/characterBlocks/hiyuki.blocks.js';

describe('triggerEngine parity — Hiyuki', () => {
  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Hiyuki'];
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s1').effects[0].value).toBe(rc.s1.libDmg);
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s2').effects[0].value).toBe(rc.s2.libDmg);
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s4').effects[0].value).toBe(rc.s4.allDmg);
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s5').effects[0].value).toBe(rc.s5.skillDmg);
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s6').effects[0].value).toBe(rc.s6.critDmg);
  });

  it('S3 is correctly libDmg, not the old wrong heavyDmg category', () => {
    const s3 = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s3');
    expect(s3.effects[0].stat).toBe('libDmg');
  });

  it('S4 is correctly allDmg (team-wide), not the old wrong atkPct category', () => {
    const s4 = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s4');
    expect(s4.effects[0].stat).toBe('allDmg');
    expect(s4.target.scope).toBe('whole-team');
  });

  it('outro and selfBuffs match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Hiyuki'];
    const outro = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.outro.snowlight-blessing');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const critdmg = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.selfbuff.fine-snow-critdmg');
    const glacio = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.selfbuff.fine-snow-glacio-bite');
    expect(critdmg.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(glacio.effects[0].value).toBe(legacy.selfBuffs[1].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Hiyuki'], HIYUKI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(HIYUKI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 4000, 'glacio', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('hiyuki.liberation.frostedge')).toBe(true);
    expect(fired.has('hiyuki.liberation.foreclaiming-inward-vision')).toBe(true);
    expect(fired.has('hiyuki.liberation.iai')).toBe(true);
    expect(fired.has('hiyuki.liberation.foreclaiming-blade-liberation')).toBe(true);
  });

  it('S6 carries both the base +500% Crit DMG AND the further +40% at 2 Snow Rust stacks', () => {
    const s6 = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s6');
    expect(s6.effects).toEqual([
      { stat: 'critDmg', value: 500 },
      { stat: 'critDmg', value: 40 },
    ]);
  });

  it('dmgFocus matches the dump Damage-Type Breakdown: Liberation (60.8%) and Skill (6.1%) are the ' +
     'real non-trivial buckets — Basic ATK is a genuine 0% (all reclassified to Liberation)', () => {
    const focus = CHARACTER_DATA['Hiyuki'].dmgFocus;
    expect(focus).toContain('Liberation');
    expect(focus).toContain('Skill');
    expect(focus).not.toContain('Basic ATK');
  });
});
