import { describe, it, expect } from 'vitest';
import { createStats, applyResonanceChain } from '../features/teams/calcEngine.js';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { AALTO_BLOCKS } from '../engine/characterBlocks/aalto.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Aalto', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(AALTO_BLOCKS, 'Aalto');
  });

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

  it("Intro (Feint Shot) and Forte (Misty Cover) are both skillDmg-categorized (were uncategorized)", () => {
    const intro = AALTO_BLOCKS.find(b => b.id === 'aalto.intro.feint-shot');
    const forte = AALTO_BLOCKS.find(b => b.id === 'aalto.forte.misty-cover');
    expect(intro.damage.category).toBe('skillDmg');
    expect(forte.damage.category).toBe('skillDmg');
  });

  it("dmgFocus is ['Basic ATK', 'Skill', 'Liberation'] — was ['Coordinated ATK'], fabricated: Aalto has no Coordinated Attack mechanic anywhere in his kit", () => {
    expect(CHARACTER_DATA['Aalto'].dmgFocus).toEqual(['Basic ATK', 'Skill', 'Liberation']);
  });
});
