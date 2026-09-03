// the engine-architecture history (git log) item 10 audit — found while systematically scanning the roster for
// dual-mode characters: rebecca.selfbuff.huntress (+30% Crit DMG) and rebecca.selfbuff.guts (+15%
// DEF Ignore) were BOTH trigger:'passive' — always active simultaneously for her entire modeled
// rotation, even though her own kit text describes Huntress/Guts as mutually exclusive in-combo
// states she alternates through (Intro starts Huntress then auto-switches Guts; Basic ATK: Guts
// Stage 1-3 happens in Guts; Skill "switches her back to Huntress mode"). A real double-counting
// bug, same class as this session's Lynae/Aemeath/Denia Tune Break fixes, just within one
// character's own combo instead of a team-composition choice.
import { describe, it, expect } from 'vitest';
import { resolveSimulatedRotation } from '../engine/resolveSimulatedRotation.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { REBECCA_BLOCKS } from '../engine/characterBlocks/rebecca.blocks.js';

describe('Rebecca Huntress/Guts mode fix (the engine-architecture history (git log) item 10)', () => {
  const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rebecca'], REBECCA_BLOCKS);
  const { stats, activity } = resolveSimulatedRotation(REBECCA_BLOCKS, steps);

  it('neither block is passive any more (both are real cast-triggered windows, not always-on)', () => {
    const huntress = REBECCA_BLOCKS.find(b => b.id === 'rebecca.selfbuff.huntress');
    const guts = REBECCA_BLOCKS.find(b => b.id === 'rebecca.selfbuff.guts');
    expect(huntress.trigger.type).toBe('cast');
    expect(guts.trigger.type).toBe('cast');
  });

  it("Huntress's Crit DMG has real PARTIAL uptime over the rotation (avgMultiplier < 1), not a flat always-on 100% uptime a passive trigger would give", () => {
    // stats.cd aggregates EVERY buff block's crit-dmg contribution, not just Huntress's own — isolate
    // via `activity`'s own per-block avgMultiplier (0-1 = fraction of the TARGET segment this specific
    // block was actually active for), same field resolveSimulatedRotation's own stacking-mode tests use.
    const huntress = activity['rebecca.selfbuff.huntress'];
    expect(huntress).toBeDefined();
    expect(huntress.avgMultiplier).toBeGreaterThan(0);
    expect(huntress.avgMultiplier).toBeLessThan(1);
  });

  it("Guts's DEF Ignore has real, bounded uptime, not the whole rotation", () => {
    const guts = activity['rebecca.selfbuff.guts'];
    expect(guts).toBeDefined();
    expect(guts.avgMultiplier).toBeGreaterThan(0);
    expect(guts.avgMultiplier).toBeLessThan(1);
  });

  it('Guts opens BEFORE Huntress in the real timeline (matches her own kit: Guts combo first, Skill switches back to Huntress after)', () => {
    const gutsWindows = activity['rebecca.selfbuff.guts']?.windows || [];
    const huntressWindows = activity['rebecca.selfbuff.huntress']?.windows || [];
    expect(gutsWindows.length).toBeGreaterThan(0);
    expect(huntressWindows.length).toBeGreaterThan(0);
    expect(gutsWindows[0].start).toBeLessThan(huntressWindows[0].start);
  });
});
