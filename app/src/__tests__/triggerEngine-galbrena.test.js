import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { GALBRENA_BLOCKS } from '../engine/characterBlocks/galbrena.blocks.js';

describe('triggerEngine parity — Galbrena', () => {
  it('S1 models the real per-stack mechanic (2 x40 stacks = 80 max)', () => {
    const rc = RESONANCE_CHAIN_DATA['Galbrena'];
    const s1 = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s1');
    expect(s1.effects[0].value * s1.effects[0].maxStacks).toBe(rc.s1.critDmg);
  });

  it('S2-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Galbrena'];
    expect(GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s2').effects[0].value).toBe(rc.s2.atkPct);
    expect(GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s4').effects[0].value).toBe(rc.s4.allDmg);
    expect(GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s5').effects[0].value).toBe(rc.s5.heavyDmg);
    expect(GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s6').effects[0].value).toBe(rc.s6.heavyDmg);
  });

  it('S5/S6 are correctly heavyDmg, not the wrong skillDmg/elemDmg categories an earlier version had', () => {
    const s5 = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s5');
    const s6 = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s6');
    expect(s5.effects[0].stat).toBe('heavyDmg');
    expect(s6.effects[0].stat).toBe('heavyDmg');
  });

  // Fixed 2026-09-02: S3 had 2 stacked bugs. (1) `trigger:{type:'cast',...}` with no `timing.duration`
  // — the same dead cast-scoped/no-duration no-op shape as Carlotta's S1/S2 — converted to
  // `trigger:{type:'passive'}` + `scopedToBlockId`. (2) `stat:'libDmg'` — category-gated stats only
  // apply to hits whose own `damage.category` matches exactly, and Hellfire Absolution's block is
  // `category:'echoDmg'`, so S3 was also a category-mismatched no-op. Fixed to `echoDmg`.
  it("S3 actually boosts Hellfire Absolution's damage (was a dead no-op, doubly)", () => {
    const s3 = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s3');
    expect(s3.trigger.type).toBe('passive');
    expect(s3.effects[0].stat).toBe('echoDmg');
    expect(s3.effects[0].scopedToBlockId).toBe('galbrena.echo.hellfire-absolution');

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Galbrena'], GALBRENA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS3 = resolveHitComposedDps(GALBRENA_BLOCKS, steps, ctx, 3000, 'fusion', 'Main DPS', null, 3);
    const withoutS3Blocks = GALBRENA_BLOCKS.filter(b => b.id !== 'galbrena.chain.s3');
    const withoutS3 = resolveHitComposedDps(withoutS3Blocks, steps, ctx, 3000, 'fusion', 'Main DPS', null, 3);
    const hellfireHit = withS3.hitLog.find(h => h.blockId === 'galbrena.echo.hellfire-absolution');
    const hellfireHitNoS3 = withoutS3.hitLog.find(h => h.blockId === 'galbrena.echo.hellfire-absolution');
    expect(hellfireHit.damage).toBeGreaterThan(hellfireHitNoS3.damage);
  });

  // Fixed 2026-09-02: S4 was `target:{scope:'self'}` — the kit text is explicit this is team-wide
  // ("all Resonators in the team gain 20% all-Attribute DMG Bonus for 20s" on any teammate's Echo
  // Skill cast).
  it('S4 is team-wide, not self-only', () => {
    const s4 = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
  });

  // Fixed 2026-09-02: S6 previously only had a `heavyDmg` effect, missing the Echo-tagged stages
  // (Seraphic Execution Stage 4/5, Flamewing Verdict Stage 3) of the same named moves its own kit
  // text lists as whole abilities.
  it('S6 covers both the heavyDmg AND echoDmg stages of its 4 named moves', () => {
    const s6 = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s6');
    expect(s6.effects).toHaveLength(2);
    expect(s6.effects.map(e => e.stat).sort()).toEqual(['echoDmg', 'heavyDmg']);
    expect(s6.effects[0].value).toBe(60);
    expect(s6.effects[1].value).toBe(60);
  });

  it('Afterflame debuff matches CHAR_BUFF_TABLE with the real per-stack mechanic (1.5 x40 = 60 max)', () => {
    const legacy = CHAR_BUFF_TABLE['Galbrena'];
    const af = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.debuff.afterflame');
    expect(af.effects[0].value * af.effects[0].maxStacks).toBe(legacy.debuffs[0].value);
    expect(af.kind).toBe('debuff');
  });

  it('selfBuffs match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Galbrena'];
    const dh = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.selfbuff.demon-hypostasis-amp');
    const bd = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.selfbuff.burning-drive');
    expect(dh.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(dh.timing.duration).toBe(legacy.selfBuffs[0].duration);
    expect(bd.effects[0].value).toBe(legacy.selfBuffs[1].value);
    expect(bd.timing.duration).toBe(legacy.selfBuffs[1].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Galbrena'], GALBRENA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(GALBRENA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'fusion', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('galbrena.intro.hellflare-overload')).toBe(true);
    expect(fired.has('galbrena.echo.hellfire-absolution')).toBe(true);
    expect(fired.has('galbrena.heavy.ascent-of-malice')).toBe(true);
    expect(fired.has('galbrena.echo.seraphic-execution-stage5')).toBe(true);
  });

  it('Ascent of Malice consuming Afterflame grants +35% Fusion DMG Amp', () => {
    const block = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.selfbuff.ascent-fusion-amp');
    expect(block.trigger).toEqual({ type: 'cast', on: 'Heavy ATK:Ascent of Malice' });
    expect(block.condition.element).toBe('fusion');
    expect(block.effects[0]).toEqual({ stat: 'elemDmg', value: 35 });
  });

  // Fixed 2026-09-04 (Phase A audit): the rotation previously modeled only a single Basic Attack
  // P2->P3 pass before Ascent of Malice and only a single Seraphic Execution P2->P3->P4->P5 pass in
  // Demon Hypostasis, silently dropping the source's own "Standard Rotation" repeat of both segments
  // ("Basic P2 -> Basic P3 -> Basic P4 -> Basic P2 -> Basic P3 -> Skill..." and "...Forte: Basic P2 ->
  // P3 -> P4 -> P5 -> P3 -> P4 -> P5 (Swap) -> Outro") — a bug class (f)/(c) silent-gap where a real,
  // explicitly-listed rotation segment contributed zero DPS.
  it('CHARACTER_ROTATIONS repeats both the pre-Skill Basic combo and the post-Liberation Forte pass, matching the source Standard Rotation exactly', () => {
    const rotation = CHARACTER_ROTATIONS['Galbrena'];
    const names = rotation.map(s => s.skill);
    expect(names.filter(n => n === 'Basic Attack Stage 2')).toHaveLength(2);
    expect(names.filter(n => n === 'Basic Attack Stage 3')).toHaveLength(2);
    expect(names.filter(n => n === 'Seraphic Execution Stage 3')).toHaveLength(2);
    expect(names.filter(n => n === 'Seraphic Execution Stage 4')).toHaveLength(2);
    expect(names.filter(n => n === 'Seraphic Execution Stage 5')).toHaveLength(2);
    // Every repeated step still resolves to real damage via the engine blocks' name-match trigger,
    // not just the first occurrence.
    const steps = deriveStepsFromRotation(rotation, GALBRENA_BLOCKS);
    const { hitLog } = resolveHitComposedDps(GALBRENA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'fusion', 'Main DPS');
    // Seraphic Execution Stage 5 is a 2-sub-hit move (67.28%+156.99%), so 2 casts produce 4 hitLog rows.
    const seraphic5Hits = hitLog.filter(h => h.blockId === 'galbrena.echo.seraphic-execution-stage5');
    expect(seraphic5Hits).toHaveLength(4);
    for (const hit of seraphic5Hits) expect(hit.damage).toBeGreaterThan(0);
  });
});
