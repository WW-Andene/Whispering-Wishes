// the engine-architecture history (git log) item 9: sequenceGating.js's winningStanceForOwner()
// confirmedWinningStance check for Lynae's appliesTags gating (lynae.blocks.js's
// 'lynae.stancevote.tune-rupture' marker block) — closing the engine-architecture history (git log)'s own
// previously-logged "neither tag fires" gap. calcTuneBreakDmg itself (and the Lynae/Mornye
// mode-exclusivity tests that used to live here) was removed along with the whole Tune Break/
// Off-Tune mechanic (2026-09-05, direct user instruction) — this file now only covers the
// rotation-order/stance-gating side, which is unaffected.
import { describe, it, expect } from 'vitest';
import { winningStanceForOwner } from '../engine/resolver/gating/sequenceGating.js';
import { simulateTeamRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { LYNAE_BLOCKS } from '../engine/characterBlocks/lynae.blocks.js';

describe('Lynae Tune Break mode-exclusivity fix', () => {
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
