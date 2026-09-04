// PHASE3_PLAN.md Stage 4, step 4/6: for a fully-converted team, rotationTimeline's own displayed
// on-field order now reuses the SAME chooseOnFieldOrder() result the FULL tier (step 2) computed
// teamDps against, instead of running a second, independently-derived legacy permutation search —
// so the Rotation Guide's swap sequence and the real DPS number are never contradicting each other.
// A mixed team (not-yet-converted member present) keeps the legacy search, unchanged.
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';

describe('calcTeamStats — rotationTimeline order reconciliation (Stage 4 step 4)', () => {
  it('a fully-converted team\'s rotationTimeline order matches a fresh chooseOnFieldOrder call for the same team', async () => {
    const { chooseOnFieldOrder } = await import('../engine/orchestration/rotationOrderSearch.js');
    const { BLOCKS_BY_CHARACTER } = await import('../engine/characterBlocks/index.js');
    const { CHARACTER_ROTATIONS } = await import('../data/characters.js');

    const names = ['Yinlin', 'Augusta', 'Rover: Electro'];
    const expected = chooseOnFieldOrder(
      names.map(name => ({ name, blocks: BLOCKS_BY_CHARACTER[name], rotation: CHARACTER_ROTATIONS[name] })),
      'Yinlin',
    );

    const stats = calcTeamStats(names, 0, 'Yinlin', {}, '', 90);
    expect(stats.rotationTimeline.segments.map(s => s.name)).toEqual(expected.order);
  });

  it('the Main DPS is always the last segment, even under the engine order', () => {
    const stats = calcTeamStats(['Yinlin', 'Augusta', 'Rover: Electro'], 0, 'Yinlin', {}, '', 90);
    const segs = stats.rotationTimeline.segments;
    expect(segs[segs.length - 1].name).toBe('Yinlin');
  });

  it('a solo (1-member) team degenerates to a single segment, order search included', () => {
    const stats = calcTeamStats(['Yinlin', null, null], 0, 'Yinlin', {}, '', 90);
    expect(stats.rotationTimeline.segments).toHaveLength(1);
    expect(stats.rotationTimeline.segments[0].name).toBe('Yinlin');
  });

  it('a mixed team (Jingran, not yet converted) still produces a valid rotationTimeline via the legacy search', () => {
    const stats = calcTeamStats(['Jingran', 'Verina', null], 0, 'Jingran', {}, '', 90);
    expect(stats.rotationTimeline.segments.length).toBeGreaterThan(0);
    expect(stats.rotationTimeline.segments[stats.rotationTimeline.segments.length - 1].name).toBe('Jingran');
  });
});
