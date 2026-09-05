/**
 * Real per-event Fusion Burst detonation timing (2026-09-06) — the infrastructure chain.s2 needs:
 * instead of only a per-rotation RATE, RotationSimulator tags a real, timestamped
 * 'fusion-burst-detonation' event directly into the SAME step's actionTags the moment it happens —
 * consumable by any 'ally-action' trigger the exact same way a real appliesTags-driven status
 * already is (Denia/Lynae's own Shifting tags), just sourced from a real running gauge instead of
 * a static per-block tag. (A matching 'tune-break-detonation' tag used to exist alongside this for
 * Off-Tune — removed entirely 2026-09-05, direct user instruction, along with the rest of that
 * mechanic; see dotFormulas.js's own note for why.)
 *
 * Real bugs caught and fixed before shipping (both are the SAME root cause: solo mode keys
 * blocksByOwner/stanceOverrides under '' regardless of which character is being simulated, while
 * team mode keys them under the real character name):
 * 1. Aemeath's Duet blocks are `windowed-cast` triggers — their match label lives in
 *    `trigger.attemptOn`, not `trigger.on`.
 * 2. Checking `owner === 'Aemeath'` / `blocksByOwner['Aemeath']` silently never matched in solo
 *    mode — fixed by resolving identity via `b.source` (a block's own static field) instead.
 */
import { describe, it, expect } from 'vitest';
import { simulateRotation, deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { BLOCKS_BY_CHARACTER } from '../engine/characterBlocks/index.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';

describe('RotationSimulator — real gauge-crossing detonation events tagged into actionTags', () => {
  it('a solo Aemeath (Fusion Burst mode) gets a real fusion-burst-detonation tag at the EXACT step of each of her two real Duet casts (forced, not threshold-crossing)', () => {
    const blocks = BLOCKS_BY_CHARACTER['Aemeath'];
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aemeath'], blocks);
    const results = simulateRotation(blocks, steps, 'Fusion Burst mode');
    const fusionEvents = results.filter(r => r.actionTags.has('fusion-burst-detonation'));
    expect(fusionEvents).toHaveLength(2);
    expect(fusionEvents.map(r => r.step.skill)).toEqual(['Seraphic Duet: Encore', 'Seraphic Duet: Overture']);
  });

  it("in Tune Rupture mode, her Duet casts do NOT force a fusion-burst-detonation (that's her Fusion-Burst-mode-only kit enhancement)", () => {
    const blocks = BLOCKS_BY_CHARACTER['Aemeath'];
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aemeath'], blocks);
    const results = simulateRotation(blocks, steps, 'Tune Rupture mode');
    expect(results.some(r => r.actionTags.has('fusion-burst-detonation'))).toBe(false);
  });
});
