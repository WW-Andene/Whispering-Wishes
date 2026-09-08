import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, CHARACTER_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { BRANT_BLOCKS } from '../engine/characterBlocks/brant.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Brant', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(BRANT_BLOCKS, 'Brant');
  });

  it('S1 models the real per-stack mechanic (20 x3 stacks), not just the flat max-stacks total', () => {
    const rc = RESONANCE_CHAIN_DATA['Brant'];
    const s1 = BRANT_BLOCKS.find(b => b.id === 'brant.chain.s1');
    expect(s1.effects[0].value * s1.effects[0].maxStacks).toBe(rc.s1.allDmg); // 20 * 3 = 60
    expect(s1.effects[0].stacking).toBe('stacking');
  });

  it('S3/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Brant'];
    expect(BRANT_BLOCKS.find(b => b.id === 'brant.chain.s3').effects[0].value).toBe(rc.s3.totalMult);
    expect(BRANT_BLOCKS.find(b => b.id === 'brant.chain.s5').effects[0].value).toBe(rc.s5.basicDmg);
    expect(BRANT_BLOCKS.find(b => b.id === 'brant.chain.s6').effects[0].value).toBe(rc.s6.totalMult);
  });

  // Fixed 2026-09-08 (full re-audit): was `trigger:{type:'passive'}` with `timing.duration:10` set —
  // every resolver path applies a passive-trigger block unconditionally at multiplier 1, completely
  // ignoring timing.duration (only a real 'cast'-triggered buff's window history is ever time-limited)
  // — so this was silently PERMANENTLY active for the whole encounter instead of a real 10s window
  // following an actual Basic ATK DMG hit. Re-anchored to his real Mid-air combo cast (basicDmg-
  // categorized, so it genuinely satisfies "Dealing Basic Attack DMG" per the kit text).
  it("S5's Basic ATK DMG buff is a real cast-anchored window, not dead passive-duration", () => {
    const s5 = BRANT_BLOCKS.find(b => b.id === 'brant.chain.s5');
    expect(s5.trigger).toEqual({ type: 'cast', on: 'Mid-air:Charged Combo (Stage 2-3)' });
    expect(s5.timing.duration).toBe(10);
  });

  // Positive-verification test for the fix above: proves the real numeric effect, not just that the
  // trigger field changed. A hit BEFORE the Mid-air combo (his Intro) must be unaffected; a hit AFTER
  // it (Returned from Ashes, later in the modeled rotation) must be boosted, proving the buff has a
  // real start time yet still covers the rest of his short (~8.2s) rotation.
  it("S5's Basic ATK DMG buff has a real start time and covers the rest of the short rotation", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Brant'], BRANT_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS5 = resolveHitComposedDps(BRANT_BLOCKS, steps, ctx, 3500, 'fusion', 'Main DPS', null, 5);
    const withoutS5Blocks = BRANT_BLOCKS.filter(b => b.id !== 'brant.chain.s5');
    const withoutS5 = resolveHitComposedDps(withoutS5Blocks, steps, ctx, 3500, 'fusion', 'Main DPS', null, 5);
    const introWithS5 = withS5.hitLog.find(h => h.blockId === 'brant.intro.applaud-for-me');
    const introWithoutS5 = withoutS5.hitLog.find(h => h.blockId === 'brant.intro.applaud-for-me');
    expect(introWithS5.damage).toBeCloseTo(introWithoutS5.damage, 5);
    const returnedWithS5 = withS5.hitLog.find(h => h.blockId === 'brant.forte.returned-from-ashes');
    const returnedWithoutS5 = withoutS5.hitLog.find(h => h.blockId === 'brant.forte.returned-from-ashes');
    expect(returnedWithS5.damage).toBeGreaterThan(returnedWithoutS5.damage);
  });

  // Fixed 2026-09-02 (Augusta S3 over-crediting pattern): S3 and S6 were both single UNSCOPED
  // totalMult effects — totalMult applies unconditionally to every hit regardless of category, so
  // both were silently boosting his whole kit (Intro/Liberation/Mid-air) instead of only their real
  // named target (S3: Returned from Ashes only; S6: Mid-air Attack only).
  it("S3's +42% only applies to Returned from Ashes (+ its S6 secondary blast), not his whole kit", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Brant'], BRANT_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS3 = resolveHitComposedDps(BRANT_BLOCKS, steps, ctx, 3500, 'fusion', 'Main DPS', null, 3);
    const withoutS3Blocks = BRANT_BLOCKS.filter(b => b.id !== 'brant.chain.s3');
    const withoutS3 = resolveHitComposedDps(withoutS3Blocks, steps, ctx, 3500, 'fusion', 'Main DPS', null, 3);
    const returnedHit = withS3.hitLog.find(h => h.blockId === 'brant.forte.returned-from-ashes');
    const returnedHitNoS3 = withoutS3.hitLog.find(h => h.blockId === 'brant.forte.returned-from-ashes');
    expect(returnedHit.damage).toBeGreaterThan(returnedHitNoS3.damage);
    const introHit = withS3.hitLog.find(h => h.blockId === 'brant.intro.applaud-for-me');
    const introHitNoS3 = withoutS3.hitLog.find(h => h.blockId === 'brant.intro.applaud-for-me');
    expect(introHit.damage).toBeCloseTo(introHitNoS3.damage, 5);
    const midairHit = withS3.hitLog.find(h => h.blockId === 'brant.midair.stage-2-3-charged-flip');
    const midairHitNoS3 = withoutS3.hitLog.find(h => h.blockId === 'brant.midair.stage-2-3-charged-flip');
    expect(midairHit.damage).toBeCloseTo(midairHitNoS3.damage, 5);
  });

  it("S6's +30% only applies to Mid-air Attack, not his whole kit", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Brant'], BRANT_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS6 = resolveHitComposedDps(BRANT_BLOCKS, steps, ctx, 3500, 'fusion', 'Main DPS', null, 6);
    const withoutS6Blocks = BRANT_BLOCKS.filter(b => b.id !== 'brant.chain.s6');
    const withoutS6 = resolveHitComposedDps(withoutS6Blocks, steps, ctx, 3500, 'fusion', 'Main DPS', null, 6);
    const midairHit = withS6.hitLog.find(h => h.blockId === 'brant.midair.stage-2-3-charged-flip');
    const midairHitNoS6 = withoutS6.hitLog.find(h => h.blockId === 'brant.midair.stage-2-3-charged-flip');
    expect(midairHit.damage).toBeGreaterThan(midairHitNoS6.damage);
    const returnedHit = withS6.hitLog.find(h => h.blockId === 'brant.forte.returned-from-ashes');
    const returnedHitNoS6 = withoutS6.hitLog.find(h => h.blockId === 'brant.forte.returned-from-ashes');
    expect(returnedHit.damage).toBeCloseTo(returnedHitNoS6.damage, 5);
  });

  // Fixed 2026-09-02: had no damage.category at all — per the established Mid-air Attack convention
  // (inherits Basic or Heavy ATK DMG per the character's own kit, never its own type), and Brant's kit
  // never gives Mid-air Attack a "considered X DMG" override, so it resolves to basicDmg.
  it('Mid-air Attack combo is basicDmg-categorized', () => {
    const midair = BRANT_BLOCKS.find(b => b.id === 'brant.midair.stage-2-3-charged-flip');
    expect(midair.damage.category).toBe('basicDmg');
  });

  // Fixed 2026-09-08 (full re-audit): the prior hit list summed to 848.4% but didn't correspond to
  // any real, consecutive Mid-air combo path — a garbled compilation, not the real Stage 2/3 sequence
  // his own CHARACTER_ROTATIONS step ('Mid-air:Charged Combo (Stage 2-3)') actually fires. Re-derived
  // directly from Data dump/Brant/Brant.md's raw per-move table: Stage 2 base (169.84%) + Stage 2
  // Charged Attack (197.22%) + Stage 2 Flip (92.95%) + Stage 3 base (169.02%) + Stage 3 Flip (92.95%)
  // = 721.98%, a real ~17.5% reduction on his single largest recurring damage block.
  it('Mid-air Attack combo sums to the real 5-sub-move Stage 2/3 sequence (721.98%), not the old garbled 848.4%', () => {
    const midair = BRANT_BLOCKS.find(b => b.id === 'brant.midair.stage-2-3-charged-flip');
    const total = midair.damage.hits.reduce((s, h) => s + (h.atkPct || 0), 0);
    expect(total).toBeCloseTo(721.98, 1);
  });

  it('S4 stays correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    expect(RESONANCE_CHAIN_DATA['Brant'].s4).toEqual({});
    expect(BRANT_BLOCKS.find(b => b.id === 'brant.chain.s4')).toBeUndefined();
  });

  it('outro and self buffs match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Brant'];
    const outro = BRANT_BLOCKS.find(b => b.id === 'brant.outro.the-course-is-set');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'skillDmg').value).toBe(legacy.outroBuffs[1].value);
    const self = BRANT_BLOCKS.find(b => b.id === 'brant.selfbuff.trial-by-fire-and-tide');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
  });

  // Fixed 2026-09-04 (Phase A REDO, REMAINING_WORK.md 1c): had no damage.category at all, silently
  // rejecting Resonance Skill DMG Bonus on a real 1.63% (10,359) damage share per his own dump's Damage
  // Profile. His Intro carries no "considered X DMG" override, so per the established default
  // convention (Calcharo's Wanted Outlaw/Encore's Woolies' Helpers) it resolves to skillDmg.
  it('Intro is skillDmg-categorized', () => {
    const intro = BRANT_BLOCKS.find(b => b.id === 'brant.intro.applaud-for-me');
    expect(intro.damage.category).toBe('skillDmg');
  });

  // Fixed 2026-09-04 (Phase A REDO, REMAINING_WORK.md 1c): dmgFocus was ['Basic ATK', 'Skill'] — 'Skill'
  // had a genuine 0% real share (no block in brant.blocks.js is skillDmg-categorized for any real
  // rotation damage; Anchors Aweigh! is never cast for damage in the real rotation), while 'Liberation'
  // (18.1%/44,052, his 2nd-largest bucket, already correctly libDmg-categorized) was entirely missing.
  it('dmgFocus is Basic ATK + Liberation, not Skill (0% real share)', () => {
    expect(CHARACTER_DATA['Brant'].dmgFocus).toEqual(['Basic ATK', 'Liberation']);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Brant'], BRANT_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(BRANT_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'fusion', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('brant.intro.applaud-for-me')).toBe(true);
    expect(fired.has('brant.liberation.to-the-horizon')).toBe(true);
    expect(fired.has('brant.midair.stage-2-3-charged-flip')).toBe(true);
    expect(fired.has('brant.forte.returned-from-ashes')).toBe(true);
  });
});
