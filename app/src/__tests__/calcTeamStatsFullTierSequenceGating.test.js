// Regression test for a bug found during a post-Phase-3 engine audit (2026-09-01): the FULL-tier
// engine override (calcTeamStats.js's `allMembersConverted` block feeding teamDps/memberDps — the
// numbers the Team tab actually displays) built `engineChosenOrder` from every member's raw,
// ungated TriggerBlocks, so Resonance Chain blocks (chain.s1-s6) fired unconditionally regardless of
// the character's actually-owned sequence — as if every team member were R6. This is the exact class
// of bug PHASE3_PLAN.md Stage 3 item 1 already fixed for the RAW/solo tier (sequenceGating.js), just
// silently reintroduced in the team tier because it never threaded m.seqLevel through at all.
//
// Fixed by gating each member's blocks via gateBlocksBySequence(BLOCKS_BY_CHARACTER[m.name],
// m.seqLevel) before they reach chooseOnFieldOrder/buildTeamSteps, so every downstream consumer of
// engineChosenOrder.blocksByOwner (teamDps/memberDps here, and the main-DPS stat panel) only ever
// sees blocks the character actually has.
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';

describe('calcTeamStats — FULL-tier engine teamDps respects each member\'s owned Resonance Chain sequence', () => {
  it('an unbuilt (S0) team scores meaningfully lower teamDps than the same team at S6', () => {
    const s0 = calcTeamStats(['Lucilla', 'Verina', 'Shorekeeper'], 0, 'Lucilla', { '0:Lucilla': { sequence: 0 } }, '', 90);
    const s6 = calcTeamStats(['Lucilla', 'Verina', 'Shorekeeper'], 0, 'Lucilla', { '0:Lucilla': { sequence: 6 } }, '', 90);
    expect(s6.teamDps).toBeGreaterThan(s0.teamDps * 1.5);
  });

  it('defaults to sequence 0 (no chain bonus) when no equipment/sequence data is provided', () => {
    const noSeq = calcTeamStats(['Lucilla', 'Verina', 'Shorekeeper'], 0, 'Lucilla', {}, '', 90);
    const s0 = calcTeamStats(['Lucilla', 'Verina', 'Shorekeeper'], 0, 'Lucilla', { '0:Lucilla': { sequence: 0 } }, '', 90);
    expect(noSeq.teamDps).toBe(s0.teamDps);
  });
});
