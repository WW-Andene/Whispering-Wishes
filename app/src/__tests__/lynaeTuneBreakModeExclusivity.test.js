// the engine-architecture history (git log) item 9 — two real bugs fixed together, in logic order:
//   1. calcTuneBreakDmg() used to apply Lynae's ruptureDmgMult AND strainDmgPerStack/maxStrainStacks
//      simultaneously, even though her real Resonance Mode makes them mutually exclusive (unlike a
//      generic responder like Mornye, who legitimately can have both active if the team's OTHER
//      members supply both Interfered types) — fixed via tuneBreak.modeExclusive + calcTeamStats.js's
//      own real-total comparison (calcTuneBreakDmg's own comment has the full rationale).
//   2. That same now-fixed resolution is what backs sequenceGating.js's winningStanceForOwner()
//      confirmedWinningStance check for Lynae's appliesTags gating (lynae.blocks.js's
//      'lynae.stancevote.tune-rupture' marker block) — closing the engine-architecture history (git log)'s own
//      previously-logged "neither tag fires" gap.
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';
import { calcTuneBreakDmg } from '../features/teams/calcEngine.js';
import { winningStanceForOwner } from '../engine/triggers/sequenceGating.js';
import { simulateTeamRotation } from '../engine/composition/rotationSimulator.js';
import { LYNAE_BLOCKS } from '../engine/characterBlocks/lynae.blocks.js';

describe('Lynae Tune Break mode-exclusivity fix', () => {
  it('calcTuneBreakDmg returns Lynae\'s rupture/strain contributions as exclusiveCandidates, not folded into the unconditional dmg/deepenMult', () => {
    const result = calcTuneBreakDmg([{ name: 'Lynae' }], 20, 1, 1, null);
    expect(result.exclusiveCandidates).toHaveLength(1);
    expect(result.exclusiveCandidates[0].name).toBe('Lynae');
    expect(result.exclusiveCandidates[0].ruptureDmgDelta).toBeGreaterThan(0);
    expect(result.exclusiveCandidates[0].strainDeepenDelta).toBeGreaterThan(0);
  });

  it('a generic responder (Mornye) still gets her own rupture+strain applied unconditionally — not mode-exclusive, no regression', () => {
    const result = calcTuneBreakDmg([{ name: 'Mornye' }], 20, 1, 1, null);
    expect(result.exclusiveCandidates).toEqual([]);
    // her ruptureDmgMult (300) folds straight into dmg, unconditionally
    expect(result.dmg).toBeGreaterThan(0);
  });

  it('calcTeamStats resolves Lynae to Tune Rupture mode for a real composition, matching the dump\'s own meta verdict', () => {
    const stats = calcTeamStats(['Lynae', 'Aemeath', 'Mornye'], 0, 'Aemeath', {}, '', 90);
    const lynaeStance = stats.tuneBreakResolvedStances.find(s => s.name === 'Lynae');
    expect(lynaeStance).toBeDefined();
    expect(lynaeStance.stance).toBe('Tune Rupture mode');
  });

  it('winningStanceForOwner resolves Lynae to Tune Rupture mode via the confirmedWinningStance marker block, not null', () => {
    expect(winningStanceForOwner(LYNAE_BLOCKS, 'Lynae')).toBe('Tune Rupture mode');
  });

  it('the rotation simulator tags Lynae\'s Photochromic-Flux blocks with tune-rupture-shifting, not shifting', () => {
    const steps = [{ owner: 'Lynae', type: 'Intro', skill: "Time to Show Some Colors!", stepSeconds: 1 }];
    const results = simulateTeamRotation(steps, { Lynae: LYNAE_BLOCKS });
    const introResult = results.find(r => r.owner === 'Lynae');
    expect(introResult.actionTags.has('tune-rupture-shifting')).toBe(true);
    expect(introResult.actionTags.has('shifting')).toBe(false);
  });
});
