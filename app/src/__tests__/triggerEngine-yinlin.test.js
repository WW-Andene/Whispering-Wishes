/**
 * Phase 2 trigger-engine parity test — Yinlin (discrete flat-ATK proc conversion).
 *
 * Verifies YINLIN_BLOCKS produces the same stat contributions as the legacy flat tables
 * (CHAR_BUFF_TABLE / RESONANCE_CHAIN_DATA) for every %-modifier node, AND specifically
 * verifies the S6 Furious Thunder proc — the first character needing a discrete flat-ATK
 * damage instance instead of a %-modifier — carries its real 419.59%/4-cap/30s-window
 * figures in `proc`/`trigger` rather than the fabricated totalMult guess Phase 1 zeroed
 * out of RESONANCE_CHAIN_DATA['Yinlin'].s6.
 */
import { describe, it, expect } from 'vitest';
import { createStats, applyResonanceChain } from '../features/teams/calcEngine.js';
import { CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/triggerEngine.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';

describe('triggerEngine parity — Yinlin', () => {
  it('S1/S3/S4/S5 Resonance Chain buffs match RESONANCE_CHAIN_DATA (legacy applyResonanceChain)', () => {
    const legacyStats = createStats();
    applyResonanceChain(legacyStats, 'Yinlin', 6, true);

    const blockStats = createStats();
    const firedTriggers = new Set(['passive', 'on-hit']);
    resolveTriggerBlocks(YINLIN_BLOCKS, {
      firedTriggers, targetElementLower: 'electro', targetRole: 'Sub DPS',
    }, blockStats);

    // S1 (skillDmg 70) + S3 (skillDmg 55) both route to skillDmg.
    expect(blockStats.skillDmg).toBe(legacyStats.skillDmg);
    expect(blockStats.libDmg).toBe(legacyStats.libDmg); // S5
    expect(blockStats.atkPct).toBe(legacyStats.atkPct); // S4
  });

  it('outro Strategist buff matches CHAR_BUFF_TABLE.outroBuffs', () => {
    const legacyElem = CHAR_BUFF_TABLE['Yinlin'].outroBuffs.find(b => b.stat === 'elemDmg');
    const legacyLib = CHAR_BUFF_TABLE['Yinlin'].outroBuffs.find(b => b.stat === 'libDmg');
    const block = YINLIN_BLOCKS.find(b => b.id === 'yinlin.outro.strategist');
    expect(block.effects.find(e => e.stat === 'elemDmg').value).toBe(legacyElem.value);
    expect(block.effects.find(e => e.stat === 'libDmg').value).toBe(legacyLib.value);
    expect(block.timing.duration).toBe(legacyElem.duration);
    expect(block.timing.duration).toBe(legacyLib.duration);
  });

  it('Pain Immersion self Crit Rate buff matches CHAR_BUFF_TABLE.selfBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Yinlin'].selfBuffs.find(b => b.stat === 'critRate');
    const block = YINLIN_BLOCKS.find(b => b.id === 'yinlin.selfbuff.pain-immersion');
    expect(block.effects[0].value).toBe(legacy.value);
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it('S2 stays zeroed (resource-economy utility, no fabricated DPS) in both the block set and the flat table', () => {
    expect(RESONANCE_CHAIN_DATA['Yinlin'].s2).toEqual({});
    const s2 = YINLIN_BLOCKS.find(b => b.id === 'yinlin.chain.s2-ensnarled-by-rapport');
    expect(s2.effects).toHaveLength(0);
  });

  it('S6 Furious Thunder: zeroed in the flat table, but the real proc figures now live on the block', () => {
    expect(RESONANCE_CHAIN_DATA['Yinlin'].s6).toEqual({});

    const s6 = YINLIN_BLOCKS.find(b => b.id === 'yinlin.chain.s6-pursuit-of-justice');
    expect(s6.effects).toHaveLength(0); // no fabricated %-modifier, same boundary as the flat table
    expect(s6.proc.atkPct).toBe(419.59);
    expect(s6.proc.category).toBe('skillDmg');
    expect(s6.trigger.type).toBe('windowed-proc');
    expect(s6.trigger.opensOnProc).toEqual(['cast:Liberation:Thundering Wrath']);
    expect(s6.trigger.windowSeconds).toBe(30);
    expect(s6.trigger.maxProcs).toBe(4);
  });
});
