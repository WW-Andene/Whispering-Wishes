/**
 * Real, manual per-character Resonance Mode toggle (2026-09-05, direct user correction): the game
 * gives dual-mode characters (Lynae, Denia, Aemeath) a literal switch in their own build panel,
 * available only outside combat — it is NOT auto-derived from her own kit magnitudes, and NOT set by
 * team composition. This proves the plumbing: a caller-supplied forced stance wins outright over the
 * pre-existing magnitude heuristic, and Aemeath's own Tune Rupture-Shifting side (previously entirely
 * untagged — only her Fusion Burst side existed) is now real and toggleable too.
 */
import { describe, it, expect } from 'vitest';
import { winningStanceForOwner, filterExclusiveModeBlocks } from '../engine/resolver/gating/sequenceGating.js';
import { LYNAE_BLOCKS } from '../engine/characterBlocks/lynae.blocks.js';
import { DENIA_BLOCKS } from '../engine/characterBlocks/denia.blocks.js';
import { AEMEATH_BLOCKS } from '../engine/characterBlocks/aemeath.blocks.js';
import { RESONANCE_MODE_OPTIONS, defaultResonanceMode, hasResonanceModeToggle } from '../data/resonanceModes.js';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';

describe('resonanceModes.js — canonical mode catalog', () => {
  it('only lists real, sourced dual-mode characters (Mornye excluded per direct user correction)', () => {
    expect(hasResonanceModeToggle('Lynae')).toBe(true);
    expect(hasResonanceModeToggle('Denia')).toBe(true);
    expect(hasResonanceModeToggle('Aemeath')).toBe(true);
    expect(hasResonanceModeToggle('Mornye')).toBe(false);
  });

  it('defaults to index 0 of each character\'s own mode list', () => {
    expect(defaultResonanceMode('Lynae')).toBe(RESONANCE_MODE_OPTIONS['Lynae'][0]);
    expect(defaultResonanceMode('Aemeath')).toBe('Tune Rupture mode');
    expect(defaultResonanceMode('Denia')).toBe('Fusion Burst mode');
    expect(defaultResonanceMode('NotACharacter')).toBeNull();
  });
});

describe('winningStanceForOwner — a forced (manual) stance wins outright', () => {
  it('overrides Lynae\'s own confirmedWinningStance (Tune Rupture) when a different manual stance is forced', () => {
    expect(winningStanceForOwner(LYNAE_BLOCKS, 'Lynae')).toBe('Tune Rupture mode');
    expect(winningStanceForOwner(LYNAE_BLOCKS, 'Lynae', 'Tune Strain mode')).toBe('Tune Strain mode');
  });

  it('gives Aemeath a real, non-null resolution when forced — she has no self-magnitude rival blocks to compare, so the un-forced heuristic alone returns null', () => {
    expect(winningStanceForOwner(AEMEATH_BLOCKS, 'Aemeath')).toBeNull();
    expect(winningStanceForOwner(AEMEATH_BLOCKS, 'Aemeath', 'Fusion Burst mode')).toBe('Fusion Burst mode');
    expect(winningStanceForOwner(AEMEATH_BLOCKS, 'Aemeath', 'Tune Rupture mode')).toBe('Tune Rupture mode');
  });
});

describe('filterExclusiveModeBlocks — a forced stance wins the rival-block filter', () => {
  it("Denia's outro rivalry (Fusion Burst +60% vs Tune Strain +15%) normally picks the higher-magnitude Fusion Burst side, but a forced Tune Strain choice keeps her Tune Strain block instead", () => {
    const auto = filterExclusiveModeBlocks(DENIA_BLOCKS);
    expect(auto.some(b => b.id === 'denia.outro.unfinished-lies-fusion-burst')).toBe(true);
    expect(auto.some(b => b.id === 'denia.outro.unfinished-lies-tune-strain')).toBe(false);
    const forced = filterExclusiveModeBlocks(DENIA_BLOCKS, 'Tune Strain mode');
    const survivingOutro = forced.filter(b => b.id.startsWith('denia.outro'));
    expect(survivingOutro.some(b => b.condition?.requiresStance === 'Tune Strain mode')).toBe(true);
    expect(survivingOutro.some(b => b.condition?.requiresStance === 'Fusion Burst mode')).toBe(false);
  });
});

describe("Aemeath's own Tune Rupture-Shifting tag — the 2026-09-05 fix (previously only Fusion Burst existed)", () => {
  it('every real Fusion-Burst-tagged block also carries the Tune Rupture-Shifting half, per the dump\'s own "both modes" line', () => {
    const fusionBlocks = AEMEATH_BLOCKS.filter(b => b.dotApplier?.mechanic === 'fusionBurst');
    expect(fusionBlocks.length).toBeGreaterThan(0);
    fusionBlocks.forEach(b => {
      expect(b.appliesTags).toEqual([{ tag: 'tune-rupture-shifting', requiresStance: 'Tune Rupture mode' }]);
    });
  });
});

describe('calcTeamStats — end-to-end: a manual Aemeath mode choice actually changes what the engine resolves', () => {
  it('does not report Fusion Burst active by default (index 0 is Tune Rupture mode), but does when the build explicitly picks Fusion Burst mode', () => {
    // Tune Break/Off-Tune (which used to resolve/report a Rupture-vs-Strain-vs-Fusion "winning
    // stance" for damage purposes) was removed entirely (2026-09-05, direct user instruction) —
    // Fusion Burst's own real, sourced damage is the remaining signal that a manual mode choice
    // actually changes what the engine resolves.
    const defaultTeam = calcTeamStats(['Aemeath'], 0, 'Aemeath', {}, '', 90);
    expect(defaultTeam.hasFusionBurst).toBe(false);

    const fusionTeam = calcTeamStats(['Aemeath'], 0, 'Aemeath', { '0:Aemeath': { resonanceMode: 'Fusion Burst mode' } }, '', 90);
    expect(fusionTeam.hasFusionBurst).toBe(true);
  });
});
