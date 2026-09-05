/**
 * Forte "Unlanded Melody" (2026-09-06) — a real gap caught by direct user question: her own kit
 * dump names this Forte explicitly ("once a target's Off-Tune Level is full, cast Tune Break on it
 * (chains into Basic Stage 3)"), but it was never modeled anywhere. No separate damage value is
 * sourced for it — it's a `kind: 'utility'` marker firing off the engine's own real shared Off-Tune
 * gauge crossing (the 'tune-break-detonation' ally-action tag built earlier this session), not a
 * fixed rotation step, since the real trigger is the gauge state itself.
 */
import { describe, it, expect } from 'vitest';
import { AEMEATH_BLOCKS } from '../engine/characterBlocks/aemeath.blocks.js';
import { simulateRotation, deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';

describe('aemeath.forte.unlanded-melody', () => {
  it('exists as a real, sourced utility block with no fabricated damage value', () => {
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.forte.unlanded-melody');
    expect(block).toBeTruthy();
    expect(block.kind).toBe('utility');
    expect(block.damage).toBeUndefined();
    expect(block.trigger).toEqual({ type: 'ally-action', action: 'tune-break-detonation' });
  });

  it('genuinely fires at the exact real step where the shared Off-Tune gauge crosses the enemy total (Overdrive, per the per-hit Off-Tune fix)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aemeath'], AEMEATH_BLOCKS);
    const results = simulateRotation(AEMEATH_BLOCKS, steps, 'Fusion Burst mode');
    const firingStep = results.find(r => r.actionTags.has('tune-break-detonation'));
    expect(firingStep).toBeTruthy();
    expect(firingStep.step.skill).toBe('Heavenfall Edict: Overdrive');
    // Same real actionTags-matching logic resolveSimulatedTeamRotation.js/resolveHitComposedTeamDps.js
    // already use for every 'ally-action' block — this block's own `trigger.action` is genuinely
    // present in the real step's actionTags, not just declared.
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.forte.unlanded-melody');
    expect(firingStep.actionTags.has(block.trigger.action)).toBe(true);
  });
});
