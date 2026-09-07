import { describe, it, expect } from 'vitest';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { validateSequence } from '../engine/resolver/decision/decisionEngine.js';
import { createHiyukiInitialState, HIYUKI_PRIORITY_RULES } from '../engine/characterBlocks/hiyuki.kitRules.js';

// Direct answer to "if I swap a skill/action in the rotation, does the engine know what's legal and
// what the output is": validateSequence() walks an ARBITRARY candidate sequence against Hiyuki's
// real kit rules (the same condition/apply functions the generator uses) instead of just executing
// it blindly the way resolveHitComposedDps()/rotationSimulator.js do (confirmed separately: those
// only enforce cooldowns on arbitrary input, and will silently compute real damage for an
// impossible sequence).
describe('decision engine — validateSequence (real kit legality on an arbitrary sequence)', () => {
  it('the real curated CHARACTER_ROTATIONS sequence is fully legal end to end', () => {
    const curated = CHARACTER_ROTATIONS['Hiyuki'].slice(0, 11).map(s => ({ type: s.type, skill: s.skill }));
    const { results, allLegal } = validateSequence(createHiyukiInitialState(), HIYUKI_PRIORITY_RULES, curated);
    expect(allLegal).toBe(true);
    expect(results.every(r => r.legal)).toBe(true);
  });

  it('catches a genuinely impossible sequence: Bitterfrost cast first, with zero Whiteout Bitterfrost ever banked', () => {
    const illegal = [
      { type: 'Liberation', skill: 'Bitterfrost: Foreclaimed Self' },
      { type: 'Liberation', skill: 'Foreclaiming: Blade Liberation' },
    ];
    const { results, allLegal } = validateSequence(createHiyukiInitialState(), HIYUKI_PRIORITY_RULES, illegal);
    expect(allLegal).toBe(false);
    expect(results[0].legal).toBe(false);
    expect(results[0].reason).toMatch(/prerequisites not met/);
  });

  it('catches an illegal SWAP: Iai attempted before Foreclaiming: Inward Vision ever grants Frostharden Iai stacks', () => {
    const curated = CHARACTER_ROTATIONS['Hiyuki'].slice(0, 11).map(s => ({ type: s.type, skill: s.skill }));
    const swapped = [...curated];
    const iaiIdx = swapped.findIndex(s => s.skill === 'Iai');
    const inwardVisionIdx = swapped.findIndex(s => s.skill === 'Foreclaiming: Inward Vision');
    [swapped[iaiIdx], swapped[inwardVisionIdx]] = [swapped[inwardVisionIdx], swapped[iaiIdx]];

    const { results, allLegal } = validateSequence(createHiyukiInitialState(), HIYUKI_PRIORITY_RULES, swapped);
    expect(allLegal).toBe(false);
    // The swap only breaks legality from Iai's new (earlier) position onward — everything up to
    // that point is unaffected by the swap and stays legal.
    const firstIllegal = results.findIndex(r => !r.legal);
    expect(swapped[firstIllegal].skill).toBe('Iai');
  });

  it('Blade Liberation cast immediately after entering Foreclaimed Self (before ever casting Bitterfrost) is LEGAL — real kit text gates it on "Foreclaimed Self only", not on having cast Bitterfrost first — and correctly banks 0 Snowforged Blade', () => {
    const early = [
      { type: 'Liberation', skill: 'Frostedge' },
      { type: 'Basic ATK', skill: 'Present Self Stage 1-3' },
      { type: 'Liberation', skill: 'Frost Splinter: Present Self' },
      { type: 'Liberation', skill: 'Foreclaiming: Inward Vision' },
      { type: 'Liberation', skill: 'Foreclaiming: Blade Liberation' },
    ];
    const { results, allLegal, finalState } = validateSequence(createHiyukiInitialState(), HIYUKI_PRIORITY_RULES, early);
    expect(allLegal).toBe(true);
    expect(results.every(r => r.legal)).toBe(true);
    expect(finalState.snowforgedBlade).toBe(0);
  });

  it('leveled action (resourceLevel): explicitly requesting a Blade Liberation level she can actually afford is legal', () => {
    const withExplicitLevel = [
      { type: 'Liberation', skill: 'Frostedge' },
      { type: 'Basic ATK', skill: 'Present Self Stage 1-3' },
      { type: 'Liberation', skill: 'Frost Splinter: Present Self' },
      { type: 'Liberation', skill: 'Foreclaiming: Inward Vision' },
      // Requests level 0 explicitly (a deliberate, if suboptimal, choice) — legal even with 0 banked.
      { type: 'Liberation', skill: 'Foreclaiming: Blade Liberation', snowforgedBladeConsumed: 0 },
    ];
    const { results, allLegal } = validateSequence(createHiyukiInitialState(), HIYUKI_PRIORITY_RULES, withExplicitLevel);
    expect(allLegal).toBe(true);
    expect(results.at(-1).levelUsed).toBe(0);
  });

  it('leveled action (resourceLevel): requesting a level higher than what is actually banked is illegal, with a real reason naming the shortfall', () => {
    const curated = CHARACTER_ROTATIONS['Hiyuki'].slice(0, 11).map(s => ({ type: s.type, skill: s.skill }));
    // The curated sequence only ever banks 1 Snowforged Blade (a single Bitterfrost cast) —
    // requesting level 3 here is asking for more than she actually has.
    const overspend = curated.slice(0, -1).concat([{ type: 'Liberation', skill: 'Foreclaiming: Blade Liberation', snowforgedBladeConsumed: 3 }]);
    const { results, allLegal } = validateSequence(createHiyukiInitialState(), HIYUKI_PRIORITY_RULES, overspend);
    expect(allLegal).toBe(false);
    const last = results.at(-1);
    expect(last.legal).toBe(false);
    expect(last.reason).toMatch(/requested snowforgedBlade level \(3\) isn't available — has 1 banked/);
  });

  it('leveled action (resourceLevel): omitting the explicit level defaults to "spend everything banked", matching the generator\'s own optimal-play assumption', () => {
    const curated = CHARACTER_ROTATIONS['Hiyuki'].slice(0, 11).map(s => ({ type: s.type, skill: s.skill }));
    const { results } = validateSequence(createHiyukiInitialState(), HIYUKI_PRIORITY_RULES, curated);
    expect(results.at(-1).levelUsed).toBe(1);
  });

  it('flags a move that is not part of her kit rules at all, distinctly from a mistimed real move', () => {
    const { results } = validateSequence(createHiyukiInitialState(), HIYUKI_PRIORITY_RULES, [
      { type: 'Skill', skill: 'This Is Not A Real Hiyuki Move' },
    ]);
    expect(results[0].legal).toBe(false);
    expect(results[0].reason).toMatch(/no kit rule produces this move/);
  });
});
