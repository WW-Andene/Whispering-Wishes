/**
 * Real bug fix (2026-09-06, caught by direct user question comparing the actual game rotation
 * against my own computed numbers): a `windowed-cast`-triggered block has no `trigger.on` — its
 * match label lives in `trigger.attemptOn` instead (real Seraphic Duo window gating, built earlier
 * this session for Aemeath's Duet casts). `resolveOffTuneGenerated`, `resolveFusionBurstStacks`, and
 * RotationSimulator's own real gauge-tracking loop all originally filtered strictly on
 * `trigger.type === 'cast'` + `trigger.on`, silently excluding every windowed-cast block — for
 * Aemeath specifically, this dropped BOTH her real Duet casts from her own Off-Tune total entirely.
 *
 * (A brief follow-up "fix" made this per-real-%ATK-sub-hit for every section, then got reverted
 * the same day by a direct user correction: the real "hit" this mechanic counts is the ACTION
 * itself — a Liberation with 4 %ATK sub-hits in its own damage formula is still ONE real cast, not
 * 4. Only Basic ATK's own combo genuinely consists of separate real swings. So Encore/Overture,
 * both `section: 'Skill'`, are back to a flat 10 each — one real cast apiece.)
 */
import { describe, it, expect } from 'vitest';
import { resolveOffTuneGenerated } from '../engine/resolver/dps/resolveOffTune.js';
import { simulateRotation, deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { AEMEATH_BLOCKS } from '../engine/characterBlocks/aemeath.blocks.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';

describe('resolveOffTuneGenerated — includes windowed-cast blocks (Aemeath Duet fix)', () => {
  it("both real Duet casts (Encore, Overture) genuinely contribute their real 10 Off-Tune points (section: 'Skill') — no longer silently dropped", () => {
    const { perStep, total } = resolveOffTuneGenerated(AEMEATH_BLOCKS, CHARACTER_ROTATIONS['Aemeath']);
    const encore = perStep.find(s => s.skill === 'Seraphic Duet: Encore');
    const overture = perStep.find(s => s.skill === 'Seraphic Duet: Overture');
    expect(encore?.gain).toBe(10);
    expect(overture?.gain).toBe(10);
    expect(total).toBe(224.5);
  });
});

describe('RotationSimulator — real Tune Break detonation timing now includes Duet\'s own Off-Tune contribution', () => {
  it('the real detonation fires at Finale (t=15), not one step later at the pre-Outro Form Switch', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aemeath'], AEMEATH_BLOCKS);
    const results = simulateRotation(AEMEATH_BLOCKS, steps, 'Fusion Burst mode');
    const detonation = results.find(r => r.actionTags.has('tune-break-detonation'));
    expect(detonation).toBeTruthy();
    expect(detonation.step.skill).toBe('Heavenfall Edict: Finale');
    expect(detonation.time).toBe(15);
  });
});
