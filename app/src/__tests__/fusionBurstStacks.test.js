/**
 * Real Fusion Burst stack accumulation and detonation timing (2026-09-06), replacing the old flat
 * "explosions = floor(rotTime/10)" guess with a real, sourced count. Sourcing (see
 * resolveFusionBurstStacks.js's own header for the full citation trail):
 * - Generic passive rule (verified via a direct fetch of wuthering.gg's own Fusion Burst page, not
 *   the AI-chat text the user separately flagged as unverifiable): stacks accumulate on a target,
 *   auto-detonate and clear at the default cap (10).
 * - Aemeath's own base-kit override (her dump line 83): the same passive detonation fires early at
 *   >5 stacks instead of waiting for 10.
 * - Aemeath's own Duet cast (her dump line 87): a SEPARATE forced detonation at max stack, does NOT
 *   clear the passive counter.
 * - Per-hit stack values: Aemeath +1/hit (her dump line 83), Denia +1 (Basic combo) or +2 (Erosion
 *   Field) per her own dump line 92.
 */
import { describe, it, expect } from 'vitest';
import { resolveFusionBurstDetonations } from '../engine/resolver/dot/resolveFusionBurstStacks.js';
import { BLOCKS_BY_CHARACTER } from '../engine/characterBlocks/index.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { FUSION_BURST_THRESHOLD } from '../engine/resolver/dot/dotFormulas.js';

describe('resolveFusionBurstDetonations', () => {
  it("a solo Aemeath uses her own 5-stack early-detonation override (not the generic 10), plus her real Duet-forced detonations", () => {
    const blocksByOwner = { Aemeath: BLOCKS_BY_CHARACTER['Aemeath'] };
    const result = resolveFusionBurstDetonations(blocksByOwner, CHARACTER_ROTATIONS, { Aemeath: 'Fusion Burst mode' });
    // Her own 4 real Fusion-Burst-tagged blocks each contribute 1 stack (Intro, Mech Stage 3-4, Mech
    // Stage 2-4, Aemeath Stage 2-4) — exactly 4 real casts appear in her own modeled rotation.
    expect(result.totalStackPoints).toBe(4);
    expect(result.passiveDetonations).toBeCloseTo(4 / 5, 6); // her own override threshold, not 10
    // Both real Duet casts (Encore, Overture) force one detonation each.
    expect(result.forcedDetonations).toBe(2);
    expect(result.totalDetonations).toBeCloseTo(4 / 5 + 2, 6);
  });

  it('without Aemeath on the team, the generic 10-stack threshold applies instead of her 5-stack override', () => {
    const blocksByOwner = { Denia: BLOCKS_BY_CHARACTER['Denia'] };
    const result = resolveFusionBurstDetonations(blocksByOwner, CHARACTER_ROTATIONS, { Denia: 'Fusion Burst mode' });
    expect(result.forcedDetonations).toBe(0); // no Aemeath, no Duet
    expect(result.passiveDetonations).toBeCloseTo(result.totalStackPoints / FUSION_BURST_THRESHOLD, 6);
  });

  it("a teammate contributes their own real stack value on top of Aemeath's, raising the total", () => {
    const aemeathOnly = resolveFusionBurstDetonations({ Aemeath: BLOCKS_BY_CHARACTER['Aemeath'] }, CHARACTER_ROTATIONS, { Aemeath: 'Fusion Burst mode' });
    const withDenia = resolveFusionBurstDetonations(
      { Aemeath: BLOCKS_BY_CHARACTER['Aemeath'], Denia: BLOCKS_BY_CHARACTER['Denia'] },
      CHARACTER_ROTATIONS,
      { Aemeath: 'Fusion Burst mode', Denia: 'Fusion Burst mode' }
    );
    expect(withDenia.totalStackPoints).toBeGreaterThan(aemeathOnly.totalStackPoints);
    expect(withDenia.totalDetonations).toBeGreaterThan(aemeathOnly.totalDetonations);
  });

  it('a teammate forced to a non-Fusion-Burst mode contributes nothing', () => {
    const result = resolveFusionBurstDetonations(
      { Aemeath: BLOCKS_BY_CHARACTER['Aemeath'], Denia: BLOCKS_BY_CHARACTER['Denia'] },
      CHARACTER_ROTATIONS,
      { Aemeath: 'Fusion Burst mode', Denia: 'Tune Strain mode' }
    );
    const aemeathOnly = resolveFusionBurstDetonations({ Aemeath: BLOCKS_BY_CHARACTER['Aemeath'] }, CHARACTER_ROTATIONS, { Aemeath: 'Fusion Burst mode' });
    expect(result.totalStackPoints).toBe(aemeathOnly.totalStackPoints);
  });
});
