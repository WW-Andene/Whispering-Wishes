/**
 * Off-Tune gauge accumulation — engine-readiness pass (2026-09-05), built from real, sourced
 * range data (Data dump/Mechanic/damage-and-tune-mechanics.md §2a). Tested against a real
 * character's own rotation (Aalto) for a realistic sanity check, plus synthetic blocks for the
 * per-hit/coordDmg/unlisted-section edge cases.
 */
import { describe, it, expect } from 'vitest';
import { SECTION_OFF_TUNE_RANGES, OFF_TUNE_VALUE_BY_SECTION, offTuneValueForBlock } from '../engine/math/offTuneFormula.js';
import { resolveOffTuneGenerated } from '../engine/resolver/dps/resolveOffTune.js';
import { AALTO_BLOCKS } from '../engine/characterBlocks/aalto.blocks.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';

describe('offTuneFormula — section range midpoints', () => {
  it('midpoints match the sourced ranges exactly', () => {
    expect(OFF_TUNE_VALUE_BY_SECTION.Liberation).toBe(45); // (40+50)/2
    expect(OFF_TUNE_VALUE_BY_SECTION.Intro).toBe(17.5);    // (15+20)/2
    expect(OFF_TUNE_VALUE_BY_SECTION.Forte).toBe(20);      // (15+25)/2
    expect(OFF_TUNE_VALUE_BY_SECTION.Skill).toBe(10);      // (8+12)/2
    expect(OFF_TUNE_VALUE_BY_SECTION.HeavyATK).toBe(5);    // (4+6)/2
    expect(OFF_TUNE_VALUE_BY_SECTION.BasicATK).toBe(2);    // (1+3)/2, applied per hit
    expect(OFF_TUNE_VALUE_BY_SECTION.Echo).toBe(0);
  });

  it('Coordinated Attack (damage.category coordDmg) always contributes 0, regardless of section', () => {
    const block = { section: 'Liberation', damage: { category: 'coordDmg', hits: [{ atkPct: 100 }] } };
    expect(offTuneValueForBlock(block)).toBe(0);
  });

  it('Basic ATK is applied PER REAL HIT (the source\'s own "per hit in a combo" qualifier); every other section fires ONCE per cast regardless of its own internal %ATK sub-hit count (corrected 2026-09-06 — a Liberation with 4 real %ATK sub-hits in its damage formula is still ONE real action, not 4)', () => {
    const threeHitCombo = { section: 'BasicATK', damage: { hits: [{ atkPct: 10 }, { atkPct: 10 }, { atkPct: 10 }] } };
    expect(offTuneValueForBlock(threeHitCombo)).toBe(2 * 3);
    const fourHitLiberation = { section: 'Liberation', damage: { hits: [{ atkPct: 10 }, { atkPct: 10 }, { atkPct: 10 }, { atkPct: 10 }] } };
    expect(offTuneValueForBlock(fourHitLiberation)).toBe(45); // ONE cast, not 45*4
    const singleHitSkill = { section: 'Skill', damage: { hits: [{ atkPct: 10 }] } };
    expect(offTuneValueForBlock(singleHitSkill)).toBe(10);
  });

  it('a non-real-cast section (Outro/Chain/Buff/utility) contributes 0', () => {
    expect(offTuneValueForBlock({ section: 'Outro', damage: {} })).toBe(0);
    expect(offTuneValueForBlock({ section: 'Chain', damage: {} })).toBe(0);
    expect(offTuneValueForBlock({ section: 'Buff', damage: {} })).toBe(0);
  });
});

describe('resolveOffTuneGenerated — real rotation (Aalto)', () => {
  it('computes a real, non-zero total from his real rotation, matching hand-computed section values', () => {
    const { total, perStep } = resolveOffTuneGenerated(AALTO_BLOCKS, CHARACTER_ROTATIONS['Aalto']);
    // Intro (17.5, one cast) + Skill (10, one cast) + Basic ATK Half Truths (7 real hits x 2 = 14) +
    // Liberation (45, one cast) + Forte (20, one cast) = 106.5. Outro contributes 0 (not a real
    // in-combat cast section).
    expect(total).toBeCloseTo(17.5 + 10 + 14 + 45 + 20, 6);
    expect(perStep.find(s => s.skill === 'Feint Shot')?.gain).toBe(17.5);
    expect(perStep.find(s => s.skill === 'Shift Trick')?.gain).toBe(10);
    expect(perStep.find(s => s.skill === 'Half Truths Stage 1-5')?.gain).toBe(14);
    expect(perStep.find(s => s.skill === 'Flower in the Mist')?.gain).toBe(45);
    expect(perStep.find(s => s.skill === 'Misty Cover')?.gain).toBe(20);
    expect(perStep.find(s => s.skill === 'Dissolving Mist')).toBeUndefined(); // Outro, 0 contribution
  });
});
