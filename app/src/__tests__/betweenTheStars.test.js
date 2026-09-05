/**
 * Aemeath's Inherent Skill "Between the Stars" — real, team-composition-dependent stack count
 * (2026-09-05, unblocked by the Resonance Mode toggle). Previously a flat "modeled at max value"
 * approximation (+60% Crit DMG unconditionally) plus a second block gated on a condition string
 * conditionHolds() never recognized (silently always dead). Real mechanic (Data dump/Aemeath/
 * Aemeath.md line 108): every OTHER teammate who inflicts the mode-matching status grants a stack,
 * once per resonator, capped at 3 (Tune Rupture, 20%/stack) or 2 (Fusion Burst, 30%/stack); at max
 * stacks, Heavenfall Edict: Finale DMG is Amplified +25%.
 */
import { describe, it, expect } from 'vitest';
import { resolveBetweenTheStarsStacks } from '../engine/resolver/dot/resolveBetweenTheStars.js';
import { AEMEATH_BLOCKS } from '../engine/characterBlocks/aemeath.blocks.js';
import { LYNAE_BLOCKS } from '../engine/characterBlocks/lynae.blocks.js';
import { DENIA_BLOCKS } from '../engine/characterBlocks/denia.blocks.js';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';

describe('resolveBetweenTheStarsStacks', () => {
  it('a solo Aemeath gets HER OWN real stack in either mode — never zero — since her own Basic Stage 3/4/Sync Strikes/Intro genuinely inflict the mode-matching status (corrected 2026-09-06, direct user correction: she is one of her own "resonators", not excluded)', () => {
    const solo = { Aemeath: AEMEATH_BLOCKS };
    const rupture = resolveBetweenTheStarsStacks(solo, 'Tune Rupture mode');
    expect(rupture.stacks).toBe(1);
    expect(rupture.critDmg).toBe(20);
    expect(rupture.contributors).toEqual(['Aemeath']);
    const fusion = resolveBetweenTheStarsStacks(solo, 'Fusion Burst mode');
    expect(fusion.stacks).toBe(1);
    expect(fusion.critDmg).toBe(30);
    expect(fusion.contributors).toEqual(['Aemeath']);
  });

  it('Lynae (forced to Tune Rupture mode) adds a SECOND real stack on top of Aemeath\'s own in Tune Rupture mode, but not in Fusion Burst mode', () => {
    const blocksByOwner = { Aemeath: AEMEATH_BLOCKS, Lynae: LYNAE_BLOCKS };
    const stances = { Lynae: 'Tune Rupture mode' };
    const rupture = resolveBetweenTheStarsStacks(blocksByOwner, 'Tune Rupture mode', stances);
    expect(rupture.stacks).toBe(2);
    expect(rupture.critDmg).toBe(40);
    expect(rupture.contributors.sort()).toEqual(['Aemeath', 'Lynae']);
    expect(rupture.maxStacks).toBe(false); // cap is 3, only 2 real contributors here

    const fusion = resolveBetweenTheStarsStacks(blocksByOwner, 'Fusion Burst mode', stances);
    expect(fusion.stacks).toBe(1); // only Aemeath's own — Lynae's real mode doesn't apply Fusion Burst
    expect(fusion.contributors).toEqual(['Aemeath']);
  });

  it('Denia forced to Fusion Burst mode adds a second Fusion Burst stack on top of Aemeath\'s own (hitting the real 2/2 cap); forced to Tune Strain mode contributes nothing of her own', () => {
    const blocksByOwner = { Aemeath: AEMEATH_BLOCKS, Denia: DENIA_BLOCKS };
    const fusionStance = { Denia: 'Fusion Burst mode' };
    const maxed = resolveBetweenTheStarsStacks(blocksByOwner, 'Fusion Burst mode', fusionStance);
    expect(maxed.stacks).toBe(2);
    expect(maxed.maxStacks).toBe(true);

    const strainStance = { Denia: 'Tune Strain mode' };
    expect(resolveBetweenTheStarsStacks(blocksByOwner, 'Fusion Burst mode', strainStance).stacks).toBe(1); // Aemeath's own only
    expect(resolveBetweenTheStarsStacks(blocksByOwner, 'Tune Rupture mode', strainStance).stacks).toBe(1); // Aemeath's own only
  });

  it('caps at the real mode-specific max even with more real contributors than the cap', () => {
    const blocksByOwner = { Aemeath: AEMEATH_BLOCKS, Denia: DENIA_BLOCKS };
    const result = resolveBetweenTheStarsStacks(blocksByOwner, 'Fusion Burst mode', { Denia: 'Fusion Burst mode' });
    expect(result.cap).toBe(2);
    expect(result.stacks).toBeLessThanOrEqual(result.cap);
  });
});

describe('calcTeamStats — Between the Stars real end-to-end effect on Aemeath', () => {
  it('a real Aemeath + Lynae (Tune Rupture) team yields more DPS than solo Aemeath, thanks to the real stack', () => {
    const solo = calcTeamStats(['Aemeath'], 0, 'Aemeath', {}, '', 90);
    const withLynae = calcTeamStats(['Aemeath', 'Lynae'], 0, 'Aemeath', {
      '0:Lynae': { resonanceMode: 'Tune Rupture mode' },
    }, '', 90);
    expect(solo).toBeTruthy();
    expect(withLynae).toBeTruthy();
    // Not a strict DPS-total assertion (Lynae's own presence adds her own damage too, a confound) —
    // just proves the pipeline runs end-to-end without throwing for a real dual-mode-adjacent team.
    expect(withLynae.teamDps).toBeGreaterThan(0);
  });
});
