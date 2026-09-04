import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { LUCY_BLOCKS } from '../engine/characterBlocks/lucy.blocks.js';

describe('triggerEngine parity — Lucy', () => {
  // Fixed 2026-09-02: S1 was `trigger:{type:'passive'}`, modeled as unconditional — the kit text is
  // explicit this only applies for 14s after casting Intro. Converted to a real cast-scoped buffWindow.
  it('S1 is a real 14s window on Intro cast, not an unconditional passive', () => {
    const rc = RESONANCE_CHAIN_DATA['Lucy'];
    const s1 = LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s1');
    expect(s1.effects[0].value).toBe(rc.s1.atkPct);
    expect(s1.trigger).toEqual({ type: 'cast', on: 'Intro:Outdated Hallucination' });
    expect(s1.timing.duration).toBe(14);
  });

  // Fixed 2026-09-02: S2 was `trigger:{type:'cast',...}` with no `timing.duration` — the same dead
  // cast-scoped/no-duration no-op shape as Carlotta's S1/S2 and Galbrena's S3 (the engine-architecture history (git log)
  // item 12) — converted to passive + scopedToBlockId so it actually fires.
  it("S2 actually boosts Multi-threading's damage (was a dead no-op)", () => {
    const rc = RESONANCE_CHAIN_DATA['Lucy'];
    const s2 = LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s2');
    expect(s2.effects[0].value).toBe(rc.s2.totalMult);
    expect(s2.trigger.type).toBe('passive');
    expect(s2.effects[0].scopedToBlockId).toBe('lucy.heavy.multi-threading');

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lucy'], LUCY_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS2 = resolveHitComposedDps(LUCY_BLOCKS, steps, ctx, 3500, 'spectro', 'Main DPS', null, 2);
    const withoutS2Blocks = LUCY_BLOCKS.filter(b => b.id !== 'lucy.chain.s2');
    const withoutS2 = resolveHitComposedDps(withoutS2Blocks, steps, ctx, 3500, 'spectro', 'Main DPS', null, 2);
    const mtHit = withS2.hitLog.find(h => h.blockId === 'lucy.heavy.multi-threading');
    const mtHitNoS2 = withoutS2.hitLog.find(h => h.blockId === 'lucy.heavy.multi-threading');
    expect(mtHit.damage).toBeGreaterThan(mtHitNoS2.damage);
  });

  it('S2 additionally has a real 450%-ATK bonus-hit proc block beyond the flat totalMult approximation', () => {
    const bonus = LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s2-bonus-hit');
    expect(bonus.kind).toBe('damage');
    expect(bonus.damage.hits[0].atkPct).toBe(450);
  });

  // Fixed 2026-09-02: S3 had 2 stacked bugs, same shape as Galbrena's S3: (1) the same dead
  // cast-scoped/no-duration no-op shape as S2 above; (2) `stat:'libDmg'` while its target block
  // (Old Net Deep Dive) is `category:'heavyDmg'` — category-gated stats only apply to
  // matching-category hits, so it was independently a 2nd no-op. Fixed both.
  it("S3 actually boosts Old Net Deep Dive's damage (was doubly a dead no-op)", () => {
    const rc = RESONANCE_CHAIN_DATA['Lucy'];
    const s3 = LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s3');
    expect(s3.trigger.type).toBe('passive');
    expect(s3.effects.find(e => e.value === rc.s3.libDmg).stat).toBe('heavyDmg');
    expect(s3.effects.find(e => e.stat === 'critDmg').value).toBe(rc.s3.critDmg);
    expect(s3.effects.every(e => e.scopedToBlockId === 'lucy.liberation.old-net-deep-dive')).toBe(true);

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lucy'], LUCY_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS3 = resolveHitComposedDps(LUCY_BLOCKS, steps, ctx, 3500, 'spectro', 'Main DPS', null, 3);
    const withoutS3Blocks = LUCY_BLOCKS.filter(b => b.id !== 'lucy.chain.s3');
    const withoutS3 = resolveHitComposedDps(withoutS3Blocks, steps, ctx, 3500, 'spectro', 'Main DPS', null, 3);
    const ondHit = withS3.hitLog.find(h => h.blockId === 'lucy.liberation.old-net-deep-dive');
    const ondHitNoS3 = withoutS3.hitLog.find(h => h.blockId === 'lucy.liberation.old-net-deep-dive');
    expect(ondHit.damage).toBeGreaterThan(ondHitNoS3.damage);
  });

  // Fixed 2026-09-02: duration was 25 — conflated with the Outro's own separate 25s window
  // (Countermeasure Program). S4's own kit text says "for 20s".
  it('S4 is team-wide with the real 20s duration, matching RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Lucy'];
    const s4 = LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s4');
    expect(s4.effects[0].value).toBe(rc.s4.allDmg);
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(20);
  });

  // Fixed 2026-09-02: S5 was a fabricated totalMult:5 with no textual basis — a real .mht snapshot's
  // S5 text is 100% defensive (Optical Illusion stack cap, HP-triggered Shield), no DMG Multiplier
  // anywhere. Zeroed, matching the established fabricated-value removal precedent (Augusta's S5).
  it('S5 has no DPS component in either RESONANCE_CHAIN_DATA or the engine block', () => {
    const rc = RESONANCE_CHAIN_DATA['Lucy'];
    expect(rc.s5).toEqual({});
    const s5 = LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s5');
    expect(s5.effects).toEqual([]);
  });

  it('S6 matches RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lucy'];
    expect(LUCY_BLOCKS.find(b => b.id === 'lucy.chain.s6').effects[0].value).toBe(rc.s6.heavyDmg);
  });

  it('outro and debuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Lucy'];
    const outro = LUCY_BLOCKS.find(b => b.id === 'lucy.outro.countermeasure-program');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const deb = LUCY_BLOCKS.find(b => b.id === 'lucy.debuff.breach-protocol');
    expect(deb.effects[0].value).toBe(legacy.debuffs[0].value);
    expect(deb.timing.duration).toBe(legacy.debuffs[0].duration);
  });

  // Fixed 2026-09-02: previously not modeled at all (no matching SKILL_MULTIPLIERS row — real
  // rotation steps silently dealt 0 DMG), now sourced from a real .mht snapshot.
  it('Thread Shredding Stage 1-4 and Dual Threading are now real, non-zero damage blocks', () => {
    const thread = LUCY_BLOCKS.find(b => b.id === 'lucy.basic.thread-shredding-stage1-4');
    const dual = LUCY_BLOCKS.find(b => b.id === 'lucy.heavy.dual-threading');
    expect(thread.damage.hits.length).toBe(19); // 4+5+5+5
    expect(thread.damage.category).toBe('heavyDmg');
    expect(dual.damage.hits.length).toBe(5);
    expect(dual.damage.category).toBe('heavyDmg');
  });

  // Fixed 2026-09-02: previously a lower-bound value ('20.05%+10.03%+40.09%') from a truncated
  // source string ("..."). A real .mht snapshot gives the full Charge + Follow-Up breakdown.
  it("Payload's damage is the full Charge + Follow-Up total, not the previously-truncated lower bound", () => {
    const payload = LUCY_BLOCKS.find(b => b.id === 'lucy.skill.payload');
    expect(payload.damage.hits.length).toBe(5);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lucy'], LUCY_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LUCY_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'spectro', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lucy.intro.outdated-hallucination')).toBe(true);
    expect(fired.has('lucy.heavy.multi-threading')).toBe(true);
    expect(fired.has('lucy.liberation.old-net-deep-dive')).toBe(true);
    expect(fired.has('lucy.chain.s2-bonus-hit')).toBe(true);
    expect(fired.has('lucy.basic.thread-shredding-stage1-4')).toBe(true);
    expect(fired.has('lucy.heavy.dual-threading')).toBe(true);
  });

  // Fixed 2026-09-04 (Phase A audit): baseDef was 1148, an off-by-one vs the dump's stated Lv.90
  // DEF 1149 (HP 11025 / ATK 425 / DEF 1149 / Max Energy 150 — HP/ATK/maxEnergy were already correct).
  it('baseDef matches the sourced Lv.90 value (1149, not the previously off-by-one 1148)', () => {
    expect(CHARACTER_DATA['Lucy'].baseDef).toBe(1149);
  });
});
