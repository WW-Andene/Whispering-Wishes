// Regression test for the requiresStance gap flagged while auditing Jinhsi+Zhezhi recommendations:
// triggerEngine.js's conditionHolds checked condition.element and condition.requiresRole, but never
// condition.requiresStance at all — so any block naming a stance/mode fired unconditionally whenever
// its trigger fired, regardless of whether that stance was ever actually active. 22 blocks across 16
// characters use requiresStance; auditing all of them found this wasn't uniformly fixable with one
// heuristic. Two distinct, narrowly-justified fixes instead:
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
//
// Correction 2026-09-08 (Camellya full re-audit): this file's own comment previously claimed Camellya's
// Budding Mode chain blocks (no rival stance to be excluded against) were "legitimately always
// applicable per her own kit" — that was WRONG. Budding Mode is a real, temporary ~15s window entered
// by casting Forte Ephemeral (CHARACTER_ROTATIONS['Camellya']'s own `duration: 15` on that step), not
// an always-on state; "no rival to exclude against" only meant filterExclusiveModeBlocks correctly left
// them alone, it never meant conditionHolds() was actually enforcing the real Budding-Mode timing (it
// wasn't — a `requiresStance`-only condition with no rival is simply never checked at all, confirmed by
// conditionHolds()'s own comment: "no state machine tracks which stance is active"). This was a real,
// live overstatement bug: ATK+58% (S3) and Sweet Dream's own DMG Multiplier (S6's +150%, and the base
// kit's own +50%, previously missing a block entirely) were all silently permanent for her WHOLE
// rotation instead of the real post-Ephemeral window — see camellya.blocks.js's own fix comments on
// chain.s3-a-bud-adorned-by-thorns/chain.s6-bloom-for-you-thousand-times-over/selfbuff.sweet-dream, all
// re-anchored to a real resource-threshold + 15s-duration window. The general lesson stands (this file's
// remaining tests below are unaffected): `requiresStance` alone, without a rival AND without a real
// duration-based trigger backing it, is not a safe way to represent a genuinely temporary state — it
// silently degrades to "always on."
import { describe, it, expect } from 'vitest';
import { resolveTriggerBlocks, conditionHolds } from '../engine/resolver/gating/triggerEngine.js';
import { createStats } from '../features/teams/calcEngine.js';
import { filterExclusiveModeBlocks } from '../engine/resolver/gating/sequenceGating.js';
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
    expect(stats.amplify).toBe(0);
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

  // Updated 2026-09-08 (Camellya full re-audit — see this file's own header correction above):
  // camellya.chain.s3-a-bud-adorned-by-thorns and chain.s6-bloom-for-you-thousand-times-over no
  // longer use `condition.requiresStance` at all — that was a real, unenforced-condition bug, fixed
  // by re-anchoring both to a real resource-threshold + 15s-duration window. filterExclusiveModeBlocks
  // still correctly has nothing to exclude here (no rival stance-tagged sibling exists for either), so
  // both still pass through untouched — same conclusion as before, now for the right reason.
  it('Camellya has no requiresStance-tagged blocks left (fixed to real duration-based windows instead), and filterExclusiveModeBlocks has nothing to exclude', () => {
    const filtered = filterExclusiveModeBlocks(CAMELLYA_BLOCKS);
    expect(CAMELLYA_BLOCKS.some(b => b.condition?.requiresStance)).toBe(false);
    const buddingBlockIds = ['camellya.chain.s3-a-bud-adorned-by-thorns', 'camellya.chain.s6-bloom-for-you-thousand-times-over', 'camellya.selfbuff.sweet-dream'];
    buddingBlockIds.forEach(id => {
      expect(CAMELLYA_BLOCKS.find(b => b.id === id)).toBeTruthy();
      expect(filtered.some(b => b.id === id)).toBe(true);
    });
  });

  it('a block list with no mode-tagged blocks at all returns the same array reference', () => {
    const blocks = [{ id: 'a', source: 'X', trigger: { type: 'passive' }, effects: [] }];
    expect(filterExclusiveModeBlocks(blocks)).toBe(blocks);
  });
});
