import { describe, it, expect } from 'vitest';
import { createStats, applyResonanceChain } from '../features/teams/calcEngine.js';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/triggerEngine.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { AALTO_BLOCKS } from '../engine/characterBlocks/aalto.blocks.js';

describe('triggerEngine parity — Aalto', () => {
  it('Resonance Chain S2/S4/S5/S6 buffs match RESONANCE_CHAIN_DATA', () => {
    const legacyStats = createStats();
    applyResonanceChain(legacyStats, 'Aalto', 6, true);
    const blockStats = createStats();
    resolveTriggerBlocks(AALTO_BLOCKS, { firedTriggers: new Set(['passive']), targetElementLower: 'aero', targetRole: 'Sub DPS' }, blockStats);
    expect(blockStats.atkPct).toBe(legacyStats.atkPct);
    expect(blockStats.skillDmg).toBe(legacyStats.skillDmg);
    expect(blockStats.elemDmg).toBe(legacyStats.elemDmg);
    expect(blockStats.cr - 5).toBe(legacyStats.cr - 5);
    expect(blockStats.heavyDmg).toBe(legacyStats.heavyDmg);
  });

  it('Dissolving Mist outro buff matches CHAR_BUFF_TABLE.outroBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Aalto'].outroBuffs[0];
    const block = AALTO_BLOCKS.find(b => b.id === 'aalto.outro.dissolving-mist');
    expect(block.effects[0].value).toBe(legacy.value);
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aalto'], AALTO_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(AALTO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'aero', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('aalto.basic.half-truths')).toBe(true);
    expect(fired.has('aalto.liberation.flower-in-the-mist')).toBe(true);
  });
});
