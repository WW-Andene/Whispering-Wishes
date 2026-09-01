/**
 * Phase 2 trigger-engine parity test — Shorekeeper (first "hard case" conversion).
 *
 * Verifies SHOREKEEPER_BLOCKS produces the same stat contributions as the legacy flat
 * tables (CHAR_BUFF_TABLE), AND specifically verifies the cast-scoped S6 behavior that
 * makes this conversion harder than Rover: Electro's: S6's totalMult/critDmg bonus must
 * apply ONLY when the Discernment cast trigger has fired, not as an always-on stat the
 * way the flat RESONANCE_CHAIN_DATA schema was forced to represent it before Phase 1's
 * 2026-08-31 audit fix.
 */
import { describe, it, expect } from 'vitest';
import { createStats } from '../features/teams/calcEngine.js';
import { CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/triggerEngine.js';
import { SHOREKEEPER_BLOCKS } from '../engine/characterBlocks/shorekeeper.blocks.js';

describe('triggerEngine parity — Shorekeeper', () => {
  it('outro All DMG Amp matches CHAR_BUFF_TABLE.outroBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Shorekeeper'].outroBuffs[0];
    const block = SHOREKEEPER_BLOCKS.find(b => b.id === 'shorekeeper.outro.binary-butterfly');
    expect(block.effects[0].value).toBe(legacy.value);
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it('Stellarealm Crit Rate/Crit DMG buffs match CHAR_BUFF_TABLE.libBuffs', () => {
    const legacyCr = CHAR_BUFF_TABLE['Shorekeeper'].libBuffs.find(b => b.stat === 'critRate');
    const legacyCd = CHAR_BUFF_TABLE['Shorekeeper'].libBuffs.find(b => b.stat === 'critDmg');
    const block = SHOREKEEPER_BLOCKS.find(b => b.id === 'shorekeeper.liberation.stellarealm-crit');
    expect(block.effects.find(e => e.stat === 'critRate').value).toBe(legacyCr.value);
    expect(block.effects.find(e => e.stat === 'critDmg').value).toBe(legacyCd.value);
  });

  it('S2 ATK buff matches RESONANCE_CHAIN_DATA.s2', () => {
    const legacy = RESONANCE_CHAIN_DATA['Shorekeeper'].s2;
    const block = SHOREKEEPER_BLOCKS.find(b => b.id === 'shorekeeper.chain.s2-nights-gift-and-refusal');
    expect(block.effects.find(e => e.stat === 'atkPct').value).toBe(legacy.atkPct);
  });

  it('S6 totalMult/critDmg values match RESONANCE_CHAIN_DATA.s6', () => {
    const legacy = RESONANCE_CHAIN_DATA['Shorekeeper'].s6;
    const block = SHOREKEEPER_BLOCKS.find(b => b.id === 'shorekeeper.chain.s6-to-the-new-world');
    expect(block.effects.find(e => e.stat === 'totalMult').value).toBe(legacy.totalMult);
    expect(block.effects.find(e => e.stat === 'critDmg').value).toBe(legacy.critDmg);
  });

  it('S6 is cast-scoped: applies ONLY on the Discernment cast trigger, not passively', () => {
    // Rotation step WITHOUT Discernment cast — S6's critDmg:500 must NOT leak in.
    const statsNoCast = createStats();
    resolveTriggerBlocks(SHOREKEEPER_BLOCKS, {
      firedTriggers: new Set(['passive', 'cast:Skill:Chaos Theory']),
      targetElementLower: 'spectro', targetRole: 'Healer',
    }, statsNoCast);
    expect(statsNoCast.cd).toBe(150); // BASE_CRIT_DMG only — S6 did not fire

    // Rotation step WITH the Discernment cast trigger fired — S6 must apply.
    const statsWithCast = createStats();
    const totalMultBonus = resolveTriggerBlocks(SHOREKEEPER_BLOCKS, {
      firedTriggers: new Set(['passive', 'cast:Intro:Discernment']),
      targetElementLower: 'spectro', targetRole: 'Healer',
    }, statsWithCast);
    expect(statsWithCast.cd).toBe(150 + 500);
    expect(totalMultBonus).toBe(42);
  });

  it('S1/S3/S4/S5 stay non-DPS (no fabricated values) in both the block set and the flat table', () => {
    const rc = RESONANCE_CHAIN_DATA['Shorekeeper'];
    expect(rc.s1).toEqual({});
    expect(rc.s3).toEqual({});
    expect(rc.s4).toEqual({});
    expect(rc.s5).toEqual({});
    ['shorekeeper.chain.s1-unspoken-conjecture', 'shorekeeper.chain.s3-infinity-awaits-me',
     'shorekeeper.chain.s4-overflowing-quietude', 'shorekeeper.chain.s5-echoes-in-silence'].forEach(id => {
      const block = SHOREKEEPER_BLOCKS.find(b => b.id === id);
      expect(block.effects).toHaveLength(0);
    });
  });
});
