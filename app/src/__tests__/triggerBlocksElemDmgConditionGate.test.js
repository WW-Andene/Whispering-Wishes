// Regression test for the live TriggerBlock damage engine (characterBlocks/*.js, resolved via
// triggerEngine.js and consumed by calcTeamStats.js's FULL tier — resolveHitComposedTeamDps /
// resolveSimulatedTeamRotation, NOT just the legacy CHAR_BUFF_TABLE scorer). Following up on the
// 2026-09-01 CHAR_BUFF_TABLE fix (charBuffTableElemDmgConditions.test.js), a roster-wide audit found
// 24 cross-character `elemDmg` buff blocks (outro/libBuff/resonance-chain, scope 'whole-team' or
// 'next-on-field') across 22 files with NO `condition.element` at all — unlike e.g. hiyuki.blocks.js's
// outro, which already gates via `condition: { element: 'glacio' }`. triggerEngine.js's
// resolveTriggerBlocks() only checks conditionHolds(block.condition, targetElementLower, ...), and an
// absent condition is treated as universal — so these buffs were applying full elemDmg uplift to a
// recipient of ANY element, not just the buff's own (each verified against its own `note` field and/or
// the already-audited CHAR_BUFF_TABLE condition text for the same buff, e.g. Yinlin's 'Electro DMG
// Amp', Lupa's 'Fusion DMG Amp').
import { describe, it, expect } from 'vitest';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';
import { createStats } from '../features/teams/calcEngine.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';
import { LUPA_BLOCKS } from '../engine/characterBlocks/lupa.blocks.js';
import { ROCCIA_BLOCKS } from '../engine/characterBlocks/roccia.blocks.js';
import { ZHEZHI_BLOCKS } from '../engine/characterBlocks/zhezhi.blocks.js';

function resolveFor(blocks, targetElementLower, targetRole = 'Main DPS') {
  const stats = createStats();
  resolveTriggerBlocks(blocks, {
    activeCharacter: 'X',
    firedTriggers: new Set(['swap-out']),
    targetName: 'Target',
    targetElementLower,
    targetRole,
  }, stats);
  return stats.elemDmg || 0;
}

describe('TriggerBlock engine — cross-character elemDmg buffs are gated to their own element', () => {
  it.each([
    ['Yinlin outro (Electro DMG Amp)', YINLIN_BLOCKS, 'yinlin.outro.strategist', 'electro'],
    ['Lupa outro (Fusion DMG Amp)', LUPA_BLOCKS, 'lupa.outro.stand-by-me-warrior', 'fusion'],
    ['Roccia outro (Havoc DMG Amp)', ROCCIA_BLOCKS, 'roccia.outro.applause-please', 'havoc'],
    ['Zhezhi outro (Glacio DMG Amp)', ZHEZHI_BLOCKS, 'zhezhi.outro.carve-and-draw', 'glacio'],
  ])('%s: applies to a matching-element target, not a mismatched one', (_label, blocks, id, ownElement) => {
    const block = blocks.find(b => b.id === id);
    expect(block.condition?.element).toBe(ownElement);

    const matched = resolveFor([block], ownElement);
    const mismatched = resolveFor([block], ownElement === 'glacio' ? 'fusion' : 'glacio');

    expect(matched).toBeGreaterThan(0);
    expect(mismatched).toBe(0);
  });
});
