/**
 * Phase 2 trigger-engine parity test — Rover: Electro proof-of-concept.
 *
 * Verifies that resolving ROVER_ELECTRO_BLOCKS (engine/characterBlocks/roverElectro.blocks.js)
 * through triggerEngine.js's resolveTriggerBlocks() produces the SAME stat contributions as
 * reading the legacy flat tables (RESONANCE_CHAIN_DATA / CHAR_BUFF_TABLE) directly, for the
 * specific values the block set claims to carry (S3-S6 Resonance Chain buffs and the tap-
 * Overshock team ATK self-buff). This is the gate for trusting a converted character's blocks
 * before rolling the trigger engine out further — see triggerBlocks.schema.js's rollout note.
 */
import { describe, it, expect } from 'vitest';
import { createStats, applyResonanceChain } from '../features/teams/calcEngine.js';
import { CHAR_BUFF_TABLE } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/triggers/triggerEngine.js';
import { ROVER_ELECTRO_BLOCKS } from '../engine/characterBlocks/roverElectro.blocks.js';

describe('triggerEngine parity — Rover: Electro', () => {
  it('Resonance Chain S3-S6 buffs match RESONANCE_CHAIN_DATA (legacy applyResonanceChain)', () => {
    const legacyStats = createStats();
    applyResonanceChain(legacyStats, 'Rover: Electro', 6, true);

    const blockStats = createStats();
    const firedTriggers = new Set(['passive']);
    resolveTriggerBlocks(ROVER_ELECTRO_BLOCKS, {
      firedTriggers, targetElementLower: 'electro', targetRole: 'Sub DPS',
    }, blockStats);

    // S3 (skillDmg 20) + S6 (skillDmg 20) both route to skillDmg; S4 -> libDmg; S5 -> critDmg.
    expect(blockStats.skillDmg).toBe(legacyStats.skillDmg);
    expect(blockStats.libDmg).toBe(legacyStats.libDmg);
    expect(blockStats.cd - 150).toBe(legacyStats.cd - 150); // both start from BASE_CRIT_DMG
  });

  it('tap-Overshock team ATK buff matches CHAR_BUFF_TABLE.selfBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Rover: Electro'].selfBuffs.find(b => b.stat === 'atkPct');
    const block = ROVER_ELECTRO_BLOCKS.find(b => b.id === 'rover-electro.selfbuff.overshock-atk');
    expect(block.effects[0].value).toBe(legacy.value);
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it('Rumbling Thunders outro buff matches CHAR_BUFF_TABLE.outroBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Rover: Electro'].outroBuffs[0];
    const block = ROVER_ELECTRO_BLOCKS.find(b => b.id === 'rover-electro.outro.rumbling-thunders');
    expect(block.effects[0].value).toBe(legacy.value);
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it('S1/S2 stay zeroed (no fabricated DPS component) in both the block set and the flat table', () => {
    const legacyStats = createStats();
    applyResonanceChain(legacyStats, 'Rover: Electro', 2, true);
    expect(legacyStats.skillDmg).toBe(0);
    expect(legacyStats.libDmg).toBe(0);

    const s1 = ROVER_ELECTRO_BLOCKS.find(b => b.id === 'rover-electro.chain.s1-celestial-ingenuity');
    const s2 = ROVER_ELECTRO_BLOCKS.find(b => b.id === 'rover-electro.chain.s2-thousandfold-artifice');
    expect(s1.effects).toHaveLength(0);
    expect(s2.effects).toHaveLength(0);
  });
});
