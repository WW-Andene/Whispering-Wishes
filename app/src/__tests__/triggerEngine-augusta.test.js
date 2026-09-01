/**
 * Phase 2 trigger-engine parity test — Augusta (first cross-character-conditional case).
 *
 * Verifies AUGUSTA_BLOCKS matches the legacy flat tables (CHAR_BUFF_TABLE/
 * RESONANCE_CHAIN_DATA), that S4's cast-scoped-but-persistent (30s) buff behaves correctly,
 * and specifically exercises the new 'partner-outro-return' trigger type added to
 * triggerBlocks.schema.js for her Majesty/Crown-of-Wills mechanic — the first mechanic in
 * this engine that depends on a DIFFERENT character's action, not just Augusta's own
 * trigger history.
 */
import { describe, it, expect } from 'vitest';
import { createStats } from '../features/teams/calcEngine.js';
import { CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/triggerEngine.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';

describe('triggerEngine parity — Augusta', () => {
  it('outro All DMG Amp matches CHAR_BUFF_TABLE.outroBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Augusta'].outroBuffs[0];
    const block = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.outro.battlesong');
    expect(block.effects[0].value).toBe(legacy.value);
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it('Crown of Wills base self-buff matches CHAR_BUFF_TABLE.selfBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Augusta'].selfBuffs[0];
    const block = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.selfbuff.crown-of-wills-base');
    expect(block.effects[0].value).toBe(legacy.value);
  });

  it('Resonance Chain S1/S2/S3/S5/S6 values match RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Augusta'];
    const byId = id => AUGUSTA_BLOCKS.find(b => b.id === id);
    expect(byId('augusta.chain.s1-stained-in-scorched-earth').effects[0].value).toBe(rc.s1.critDmg);
    expect(byId('augusta.chain.s2-cleansed-in-crimson-war').effects[0].value).toBe(rc.s2.critRate);
    expect(byId('augusta.chain.s3-forged-in-rot-and-ruin').effects[0].value).toBe(rc.s3.totalMult);
    expect(byId('augusta.chain.s5-unshaken-in-wrathful-tides').effects[0].value).toBe(rc.s5.totalMult);
    expect(byId('augusta.chain.s6-engraved-in-radiant-light').effects[0].value).toBe(rc.s6.heavyDmg);
  });

  it('S4 team ATK buff matches RESONANCE_CHAIN_DATA.s4 and is cast-scoped (persists 30s once fired)', () => {
    const rc = RESONANCE_CHAIN_DATA['Augusta'];
    const block = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s4-ascent-in-sun-and-glory');
    expect(block.effects[0].value).toBe(rc.s4.atkPct);
    expect(block.timing.duration).toBe(30);

    // Rotation step WITHOUT the Intro cast — must not apply.
    const statsNoCast = createStats();
    resolveTriggerBlocks(AUGUSTA_BLOCKS, {
      firedTriggers: new Set(['passive']), targetElementLower: 'electro', targetRole: 'Main DPS',
    }, statsNoCast);
    expect(statsNoCast.atkPct).toBe(0);

    // Rotation step WITH the Intro cast fired — must apply.
    const statsWithCast = createStats();
    resolveTriggerBlocks(AUGUSTA_BLOCKS, {
      firedTriggers: new Set(['passive', 'cast:Intro:Stride of Goldenflare']),
      targetElementLower: 'electro', targetRole: 'Main DPS',
    }, statsWithCast);
    expect(statsWithCast.atkPct).toBe(20);
  });

  it('partner-outro-return trigger is keyed by the requiresActiveBlock id it references', () => {
    const block = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.majesty.partner-outro-return');
    expect(block.trigger.type).toBe('partner-outro-return');
    expect(block.trigger.requiresActiveBlock).toBe('augusta.outro.battlesong');
    expect(block.trigger.maxInterveningSwaps).toBe(1);

    // Not fired unless the caller (a future rotation simulator) explicitly asserts the partner's
    // return-Outro occurred while the referenced block was still active.
    const statsNotFired = createStats();
    resolveTriggerBlocks(AUGUSTA_BLOCKS, {
      firedTriggers: new Set(['passive']), targetElementLower: 'electro', targetRole: 'Main DPS',
    }, statsNotFired);
    // No numeric effect to assert (the block's effects are intentionally empty — stateful stack
    // count, not a stat, per the block's own note) — this test exists to prove the trigger key
    // format round-trips through resolveTriggerBlocks without throwing, for both states.
    const statsFired = createStats();
    expect(() => resolveTriggerBlocks(AUGUSTA_BLOCKS, {
      firedTriggers: new Set(['passive', 'partner-outro-return:augusta.outro.battlesong']),
      targetElementLower: 'electro', targetRole: 'Main DPS',
    }, statsFired)).not.toThrow();
  });
});
