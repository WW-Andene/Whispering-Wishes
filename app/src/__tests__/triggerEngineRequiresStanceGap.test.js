// Regression test for the requiresStance gap flagged while auditing Jinhsi+Zhezhi recommendations:
// triggerEngine.js's conditionHolds checked condition.element and condition.requiresRole, but never
// condition.requiresStance at all — so any block naming a stance/mode fired unconditionally whenever
// its trigger fired, regardless of whether that stance was ever actually active. 22 blocks across 16
// characters use requiresStance; auditing all of them found this wasn't uniformly fixable with one
// heuristic (a blanket "reject any unverified stance" rule would have zeroed out Camellya's real,
// always-entered Budding Mode chain bonuses, which have no rival stance and are legitimately always
// applicable per her own kit). Two distinct, narrowly-justified fixes instead:
//
// 1. `condition.assumedInactive` (explicit, per-block, author-confirmed) — Phoebe's two Confession-mode
//    outro blocks: her own note already said "her real rotation stays in Absolution mode, so this
//    block does not fire" before this flag existed to actually enforce it. conditionHolds now honors it.
// 2. `filterExclusiveModeBlocks` (sequenceGating.js) — when a character has ≥2 sibling blocks whose
//    requiresStance text differs but both contain "mode" (a real, textually-confirmed Resonance-Mode
//    rivalry, e.g. Denia's Tune Strain vs Fusion Burst, Lucilla's Glacio Chafe vs Echo mode), only the
//    higher-magnitude one survives — mirrors the identical fix already shipped for the legacy
//    CHAR_BUFF_TABLE scorer (scoreTeamCompositionExclusiveModeBuffs.test.js), now applied to the live
//    engine too (wired into both of gateBlocksBySequence's call sites: calcTeamStats.js's FULL-tier
//    blocksByOwner construction, and resolveHitComposedDps.js's RAW-tier path).
import { describe, it, expect } from 'vitest';
import { resolveTriggerBlocks, conditionHolds } from '../engine/triggers/triggerEngine.js';
import { createStats } from '../features/teams/calcEngine.js';
import { filterExclusiveModeBlocks } from '../engine/triggers/sequenceGating.js';
import { DENIA_BLOCKS } from '../engine/characterBlocks/denia.blocks.js';
import { LUCILLA_BLOCKS } from '../engine/characterBlocks/lucilla.blocks.js';
import { PHOEBE_BLOCKS } from '../engine/characterBlocks/phoebe.blocks.js';
import { CAMELLYA_BLOCKS } from '../engine/characterBlocks/camellya.blocks.js';

function resolveElemDmgFor(blocks, targetElementLower) {
  const stats = createStats();
  resolveTriggerBlocks(blocks, {
    activeCharacter: 'X',
    firedTriggers: new Set(['swap-out']),
    targetName: 'Target',
    targetElementLower,
    targetRole: 'Main DPS',
  }, stats);
  return stats;
}

describe('conditionHolds — assumedInactive is now enforced', () => {
  it('rejects a block flagged assumedInactive regardless of every other check passing', () => {
    expect(conditionHolds({ assumedInactive: true }, 'spectro', 'Main DPS')).toBe(false);
    expect(conditionHolds({ element: 'spectro', assumedInactive: true }, 'spectro', 'Main DPS')).toBe(false);
  });

  it("Phoebe's two Confession-mode outro blocks are flagged assumedInactive", () => {
    const confessionBlocks = PHOEBE_BLOCKS.filter(b => b.id.includes('confession'));
    expect(confessionBlocks.length).toBe(2);
    confessionBlocks.forEach(b => expect(b.condition.assumedInactive).toBe(true));
  });

  it('Phoebe\'s Confession blocks now resolve to zero effect, matching their own long-standing note', () => {
    const confessionBlocks = PHOEBE_BLOCKS.filter(b => b.id.includes('confession'));
    const stats = resolveElemDmgFor(confessionBlocks, 'spectro');
    expect(stats.deepen).toBe(0);
    expect(stats.resShred).toBe(0);
  });
});

describe('filterExclusiveModeBlocks — rival Resonance-Mode blocks no longer double-fire', () => {
  it('Denia: only Fusion Burst (the higher-magnitude rival) survives', () => {
    const filtered = filterExclusiveModeBlocks(DENIA_BLOCKS).filter(b => b.id.startsWith('denia.outro.unfinished'));
    expect(filtered.map(b => b.id)).toEqual(['denia.outro.unfinished-lies-fusion-burst']);
  });

  it('Lucilla: only Glacio Chafe (the higher-magnitude rival) survives', () => {
    const filtered = filterExclusiveModeBlocks(LUCILLA_BLOCKS).filter(b => b.id.startsWith('lucilla.outro'));
    expect(filtered.map(b => b.id)).toEqual(['lucilla.outro.montage-chafe']);
  });

  it("Camellya's Budding Mode chain blocks (no rival stance) are left untouched", () => {
    const filtered = filterExclusiveModeBlocks(CAMELLYA_BLOCKS);
    const buddingIds = CAMELLYA_BLOCKS.filter(b => b.condition?.requiresStance === 'Budding Mode').map(b => b.id);
    expect(buddingIds.length).toBe(2);
    buddingIds.forEach(id => expect(filtered.some(b => b.id === id)).toBe(true));
  });

  it('a block list with no mode-tagged blocks at all returns the same array reference', () => {
    const blocks = [{ id: 'a', source: 'X', trigger: { type: 'passive' }, effects: [] }];
    expect(filterExclusiveModeBlocks(blocks)).toBe(blocks);
  });
});
