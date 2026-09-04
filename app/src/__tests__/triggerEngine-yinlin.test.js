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
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Yinlin', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(YINLIN_BLOCKS, 'Yinlin');
  });

  it('S1/S3/S4/S5 Resonance Chain buffs match RESONANCE_CHAIN_DATA (legacy applyResonanceChain)', () => {
    const legacyStats = createStats();
    applyResonanceChain(legacyStats, 'Yinlin', 6, true);

    const blockStats = createStats();
    const firedTriggers = new Set(['passive', 'on-hit']);
    resolveTriggerBlocks(YINLIN_BLOCKS, {
      firedTriggers, targetElementLower: 'electro', targetRole: 'Sub DPS',
    }, blockStats);

    // S1 (skillDmg 70) is the only unscoped skillDmg chain node now (S3 was fixed 2026-09-03 to
    // coordDmg, matching Judgment Strike's real Coordinated Attack categorization). blockStats also
    // carries the +10 skillDmg from yinlin.selfbuff.deadly-focus-dmg (Inherent Skill Deadly Focus) —
    // resolveTriggerBlocks() (this aggregate path) doesn't honor scopedToBlockId the way
    // resolveHitComposedDps() does, so that scoped effect still lands in the flat tally here; it was
    // deliberately left out of RESONANCE_CHAIN_DATA/CHAR_BUFF_TABLE to avoid over-crediting Magnetic
    // Roar/Furious Thunder in the legacy flat engine, so the two paths now differ by exactly that +10
    // (same kind of intentional asymmetry as S6 Furious Thunder below).
    expect(blockStats.skillDmg).toBe(legacyStats.skillDmg + 10);
    expect(blockStats.coordDmg).toBe(legacyStats.coordDmg); // S3
    expect(blockStats.libDmg).toBe(legacyStats.libDmg); // S5
    expect(blockStats.atkPct).toBe(legacyStats.atkPct); // S4
  });

  it("Inherent Skill Deadly Focus: Lightning Execution DMG+10% is scoped (not a broad skillDmg over-credit), and self ATK+10%/4s matches CHAR_BUFF_TABLE", () => {
    const legacy = CHAR_BUFF_TABLE['Yinlin'].selfBuffs.find(b => b.stat === 'atkPct');
    const dmgBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.selfbuff.deadly-focus-dmg');
    expect(dmgBlock.effects[0].scopedToBlockId).toBe('yinlin.skill.lightning-execution');
    expect(dmgBlock.effects[0].stat).toBe('skillDmg');
    const atkBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.selfbuff.deadly-focus-atk');
    expect(atkBlock.effects[0].value).toBe(legacy.value);
    expect(atkBlock.timing.duration).toBe(legacy.duration);
  });

  it('outro Strategist buff matches CHAR_BUFF_TABLE.outroBuffs', () => {
    const legacyElem = CHAR_BUFF_TABLE['Yinlin'].outroBuffs.find(b => b.stat === 'elemDmg');
    const legacyLib = CHAR_BUFF_TABLE['Yinlin'].outroBuffs.find(b => b.stat === 'libDmg');
    const block = YINLIN_BLOCKS.find(b => b.id === 'yinlin.outro.strategist');
    expect(block.effects.find(e => e.stat === 'elemDmg').value).toBe(legacyElem.value);
    expect(block.effects.find(e => e.stat === 'libDmg').value).toBe(legacyLib.value);
    expect(block.timing.duration).toBe(legacyElem.duration);
    expect(block.timing.duration).toBe(legacyLib.duration);
    // Retrofitted 2026-09-03 (REMAINING_WORK.md 1a): now actually clamps to the incoming Resonator's
    // own swap-out instant when shorter than the nominal 14s — see forfeitOnRecipientSwapOut.test.js
    // for the mechanism's own proof.
    expect(block.timing.forfeitOnRecipientSwapOut).toBe(true);
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

  // Found 2026-09-03 via a systematic block-coverage audit: her literal opener (Intro:Raging Storm),
  // Heavy ATK:Standard, and the standalone Zapstring's Dance Stage 1 tap were all real
  // CHARACTER_ROTATIONS steps with zero block coverage — a silent 0-DMG gap on her opening move.
  it('Intro:Raging Storm, Heavy ATK:Standard, and Zapstring\'s Dance Stage 1 are real damage blocks and all fire in her rotation', () => {
    const intro = YINLIN_BLOCKS.find(b => b.id === 'yinlin.intro.raging-storm');
    const heavy = YINLIN_BLOCKS.find(b => b.id === 'yinlin.heavy.standard');
    const stage1 = YINLIN_BLOCKS.find(b => b.id === 'yinlin.basic.zapstrings-dance-stage1');
    expect(intro.damage.hits.length).toBeGreaterThan(0);
    expect(heavy.damage.hits.length).toBeGreaterThan(0);
    expect(stage1.damage.hits.length).toBeGreaterThan(0);

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yinlin'], YINLIN_BLOCKS);
    const { hitLog } = resolveHitComposedDps(YINLIN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'electro', 'Sub DPS');
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('yinlin.intro.raging-storm')).toBe(true);
    expect(fired.has('yinlin.heavy.standard')).toBe(true);
    expect(fired.has('yinlin.basic.zapstrings-dance-stage1')).toBe(true);
  });

  // Found 2026-09-03 via a Phase A full-dimension audit (REMAINING_WORK.md 1c): dmgFocus was
  // ['Coordinated ATK', 'Skill'] only — Liberation (14.3%) and Heavy ATK (6.8%) are both real,
  // correctly-categorized damage per her own dump's Damage Profile, silently rejecting a real
  // teammate Liberation/Heavy ATK DMG Bonus.
  it("dmgFocus includes 'Liberation' and 'Heavy ATK' (14.3%/6.8% of her real damage profile)", () => {
    expect(CHARACTER_DATA['Yinlin'].dmgFocus).toEqual(expect.arrayContaining(['Coordinated ATK', 'Skill', 'Liberation', 'Heavy ATK']));
  });
});
