/**
 * Real bug fix (2026-09-06, caught by direct user question comparing the actual game rotation
 * against my own computed numbers): a `windowed-cast`-triggered block has no `trigger.on` — its
 * match label lives in `trigger.attemptOn` instead (real Seraphic Duo window gating, built earlier
 * this session for Aemeath's Duet casts). `resolveOffTuneGenerated`, `resolveFusionBurstStacks`, and
 * RotationSimulator's own real gauge-tracking loop all originally filtered strictly on
 * `trigger.type === 'cast'` + `trigger.on`, silently excluding every windowed-cast block — for
 * Aemeath specifically, this dropped BOTH her real Duet casts from her own Off-Tune total entirely.
 *
 * Numbers updated again same day after a SECOND real fix (direct user correction: every section
 * must scale by its own real hit count, not just Basic ATK — see offTuneFormula.js's own header).
 * Encore has 8 real hits (17.90%x4+35.79%x3+178.93% -> 4+3+1), Overture has 13 (per her own real
 * damage.hits) — both `section: 'Skill'` (10/hit) — so 80 and 130 respectively, not a flat 10 each.
 */
import { describe, it, expect } from 'vitest';
import { resolveOffTuneGenerated } from '../engine/resolver/dps/resolveOffTune.js';
import { simulateRotation, deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { AEMEATH_BLOCKS } from '../engine/characterBlocks/aemeath.blocks.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';

describe('resolveOffTuneGenerated — includes windowed-cast blocks (Aemeath Duet fix)', () => {
  it("both real Duet casts (Encore, Overture) genuinely contribute — no longer silently dropped, and correctly scaled by their own real hit counts", () => {
    const { perStep, total } = resolveOffTuneGenerated(AEMEATH_BLOCKS, CHARACTER_ROTATIONS['Aemeath']);
    const encore = perStep.find(s => s.skill === 'Seraphic Duet: Encore');
    const overture = perStep.find(s => s.skill === 'Seraphic Duet: Overture');
    expect(encore?.gain).toBe(80);   // 8 real hits x 10 (section: Skill)
    expect(overture?.gain).toBe(130); // 13 real hits x 10 (section: Skill)
    expect(total).toBe(607);
  });
});

describe('RotationSimulator — real Tune Break detonation timing now includes Duet\'s own Off-Tune contribution', () => {
  it('the real detonation fires at Overdrive (t=6) once every section is correctly scaled by its own real hit count', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aemeath'], AEMEATH_BLOCKS);
    const results = simulateRotation(AEMEATH_BLOCKS, steps, 'Fusion Burst mode');
    const detonation = results.find(r => r.actionTags.has('tune-break-detonation'));
    expect(detonation).toBeTruthy();
    expect(detonation.step.skill).toBe('Heavenfall Edict: Overdrive');
    expect(detonation.time).toBe(6);
  });
});
