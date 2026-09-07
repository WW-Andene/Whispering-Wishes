import { describe, it, expect } from 'vitest';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { runDecisionRotation } from '../engine/resolver/decision/decisionEngine.js';
import { createHiyukiInitialState, HIYUKI_PRIORITY_RULES } from '../engine/characterBlocks/hiyuki.kitRules.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { HIYUKI_BLOCKS } from '../engine/characterBlocks/hiyuki.blocks.js';

// ADAPTIVE_ENGINE_DESIGN.md pilot: this proves the decision layer reproduces the SAME real play
// CHARACTER_ROTATIONS['Hiyuki'] hand-transcribes, by deriving it instead from her own resource
// rules (Dedication/Frostharden Iai/Whiteout Bitterfrost/Snowforged Blade caps and gains, all
// sourced in hiyuki.kitRules.js's own header comment) — not by replaying prose.
describe('decision engine pilot — Hiyuki', () => {
  it('derives the same damage-relevant step sequence as the curated CHARACTER_ROTATIONS, from resource state alone', () => {
    const { steps, firedRuleIds } = runDecisionRotation(createHiyukiInitialState(), HIYUKI_PRIORITY_RULES);

    // CHARACTER_ROTATIONS['Hiyuki']'s own first 11 steps are every damage-relevant cast before the
    // Echo/Outro tail (neither of which this pilot's resource state governs — Echo is a free-timing
    // insert, Outro is a swap-out trigger already handled by resolveHitComposedDps separately).
    const curated = CHARACTER_ROTATIONS['Hiyuki'].slice(0, 11).map(s => ({ type: s.type, skill: s.skill }));
    expect(steps).toEqual(curated);
    expect(firedRuleIds).toEqual([
      'intro', 'basic-stage3-to-cap-dedication', 'frost-splinter', 'inward-vision',
      'foreclaimed-basic-round-1', 'jade-cleave', 'petalfall', 'foreclaimed-basic-round-2',
      'iai', 'bitterfrost', 'blade-liberation',
    ]);
  });

  it('reaches a real terminal state (every resource spent, no rule left that can fire)', () => {
    const { finalState } = runDecisionRotation(createHiyukiInitialState(), HIYUKI_PRIORITY_RULES);
    expect(finalState.dedication).toBe(0);
    expect(finalState.frosthardenIai).toBe(0);
    expect(finalState.whiteoutBitterfrost).toBe(0);
    expect(finalState.bladeLiberationCast).toBe(true);
  });

  it('the derived steps feed resolveHitComposedDps and produce a real, non-zero damage total', () => {
    const { steps } = runDecisionRotation(createHiyukiInitialState(), HIYUKI_PRIORITY_RULES);
    const derivedSteps = deriveStepsFromRotation(steps, HIYUKI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(HIYUKI_BLOCKS, derivedSteps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 4000, 'glacio', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('hiyuki.liberation.frostedge')).toBe(true);
    expect(fired.has('hiyuki.liberation.foreclaiming-blade-liberation')).toBe(true);
  });
});
