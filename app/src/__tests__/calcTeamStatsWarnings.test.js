// PHASE3_PLAN.md Stage 4, step 5/6: warnings needed ZERO code changes — it already reads
// mems/mainDps/mainDpsOverride/enemyEcho/getEnemyRes/energyCycleFactors directly, none of which
// steps 1-4 restructured (it never touched totalMult/mult math at all). This test proves that
// explicitly rather than assuming it, for a fully-converted team.
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';

describe('calcTeamStats — warnings (Stage 4 step 5, unchanged verification)', () => {
  it('an incomplete (1-member) team gets the Incomplete team warning', () => {
    const stats = calcTeamStats(['Yinlin', null, null], 0, 'Yinlin', {}, '', 90);
    expect(stats.warnings).toContain('Incomplete team');
  });

  it('a full team with no healer role gets the No healer warning', () => {
    const stats = calcTeamStats(['Yinlin', 'Augusta', 'Rover: Electro'], 0, 'Yinlin', {}, '', 90);
    expect(stats.warnings).toContain('No healer in team');
  });

  it('a full team with a real healer does NOT get the No healer warning', () => {
    const stats = calcTeamStats(['Camellya', 'Danjin', 'Verina'], 0, 'Camellya', {}, '', 90);
    expect(stats.warnings).not.toContain('No healer in team');
  });

  it('an unbuilt (100% base ER) member below their role threshold gets a low-ER warning naming them', () => {
    const stats = calcTeamStats(['Yinlin', 'Augusta', 'Rover: Electro'], 0, 'Yinlin', {}, '', 90);
    expect(stats.warnings.some(w => w.startsWith('Yinlin: low ER'))).toBe(true);
  });
});
