import { describe, it, expect } from 'vitest';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { runDecisionRotation } from '../engine/resolver/decision/decisionEngine.js';
import { createLucillaInitialState, LUCILLA_PRIORITY_RULES } from '../engine/characterBlocks/lucilla.kitRules.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { LUCILLA_BLOCKS } from '../engine/characterBlocks/lucilla.blocks.js';

// ADAPTIVE_ENGINE_DESIGN.md pilot #2: proves the decision layer reproduces the SAME real play
// CHARACTER_ROTATIONS['Lucilla'] hand-transcribes, by deriving it instead from her own Trace/Photo
// resource chain (caps and gains sourced in lucilla.kitRules.js's own header comment).
describe('decision engine pilot — Lucilla', () => {
  it('derives the same damage-relevant step sequence as the curated CHARACTER_ROTATIONS, from resource state alone', () => {
    const { steps, firedRuleIds } = runDecisionRotation(createLucillaInitialState(), LUCILLA_PRIORITY_RULES);

    const curated = CHARACTER_ROTATIONS['Lucilla'].slice(0, 5).map(s => ({ type: s.type, skill: s.skill }));
    expect(steps).toEqual(curated);
    expect(firedRuleIds).toEqual(['intro', 'spotlight', 'clear-as-day', 'tracing-forms', 'letting-it-go']);
  });

  it('reaches a real terminal state (all 3 Photos consumed, no rule left that can fire)', () => {
    const { finalState } = runDecisionRotation(createLucillaInitialState(), LUCILLA_PRIORITY_RULES);
    expect(finalState.trace).toBe(150);
    expect(finalState.photos).toBe(0);
    expect(finalState.lettingItGoCast).toBe(true);
  });

  it('the derived steps feed resolveHitComposedDps and produce a real, non-zero damage total', () => {
    const { steps } = runDecisionRotation(createLucillaInitialState(), LUCILLA_PRIORITY_RULES);
    const derivedSteps = deriveStepsFromRotation(steps, LUCILLA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LUCILLA_BLOCKS, derivedSteps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 4000, 'glacio', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lucilla.intro.clip-it')).toBe(true);
    expect(fired.has('lucilla.basic.letting-it-go')).toBe(true);
  });
});
