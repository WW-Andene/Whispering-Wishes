import { describe, it, expect } from 'vitest';
import { createStats, applyResonanceChain } from '../features/teams/calcEngine.js';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { AEMEATH_BLOCKS } from '../engine/characterBlocks/aemeath.blocks.js';

describe('triggerEngine parity — Aemeath', () => {
  it('S3 (libDmg 100, critDmg 60) matches RESONANCE_CHAIN_DATA exactly', () => {
    const legacy = RESONANCE_CHAIN_DATA['Aemeath'].s3;
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s3');
    expect(block.effects.find(e => e.stat === 'libDmg').value).toBe(legacy.libDmg);
    expect(block.effects.find(e => e.stat === 'critDmg').value).toBe(legacy.critDmg);
  });

  it("S4 is team-wide (not self) — the correction from the audit comment", () => {
    const legacy = RESONANCE_CHAIN_DATA['Aemeath'].s4;
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s4');
    expect(block.target.scope).toBe('whole-team');
    expect(block.effects[0]).toEqual({ stat: 'allDmg', value: legacy.allDmg });
  });

  it('S6 is a debuff on enemies (Liberation DMG TAKEN), not a self buff — the correction from the audit comment', () => {
    const legacy = RESONANCE_CHAIN_DATA['Aemeath'].s6;
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s6');
    expect(block.kind).toBe('debuff');
    expect(block.target.scope).toBe('all-enemies');
    expect(block.effects[0]).toEqual({ stat: 'libDmg', value: legacy.libDmg });
  });

  it('S1 is conditional on Instant Response stance, not an unconditional +300% Crit DMG', () => {
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s1');
    expect(block.condition.requiresStance).toBe('Instant Response');
    expect(block.effects[0].value).toBe(RESONANCE_CHAIN_DATA['Aemeath'].s1.critDmg);
  });

  it('both real selfBuffs from CHAR_BUFF_TABLE are modeled (critDmg 60 AND deepen 25), not just the first', () => {
    const legacy = CHAR_BUFF_TABLE['Aemeath'].selfBuffs;
    expect(legacy).toHaveLength(2);
    const critBlock = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.selfbuff.between-the-stars-critdmg');
    const deepenBlock = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.selfbuff.between-the-stars-finale-amp');
    expect(critBlock.effects[0].value).toBe(legacy[0].value);
    expect(deepenBlock.effects[0].value).toBe(legacy[1].value);
  });

  it('Silent Protection outro buff matches CHAR_BUFF_TABLE.outroBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Aemeath'].outroBuffs[0];
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.outro.silent-protection');
    expect(block.effects[0].value).toBe(legacy.value);
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aemeath'], AEMEATH_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(AEMEATH_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 4000, 'fusion', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('aemeath.liberation.heavenfall-edict-finale')).toBe(true);
    expect(fired.has('aemeath.skill.seraphic-duet-overture')).toBe(true);
    expect(fired.has('aemeath.skill.seraphic-duet-encore')).toBe(true);
    expect(fired.has('aemeath.basic.mech-stage-3-4')).toBe(true);
    expect(fired.has('aemeath.basic.mech-stage-2-4')).toBe(true);
    expect(fired.has('aemeath.basic.aemeath-stage-2-4')).toBe(true);
  });
});
