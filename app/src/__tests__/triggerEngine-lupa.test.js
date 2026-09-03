import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { LUPA_BLOCKS } from '../engine/characterBlocks/lupa.blocks.js';

describe('triggerEngine parity — Lupa', () => {
  // Fixed 2026-09-02: category was previously unset. WuWa's own general mechanic (Mid-air/Plunging
  // Attacks inherit Basic ATK or Heavy ATK DMG, never their own type) plus the dump's own kit structure
  // (listed under "Basic Attack — Flaming Star", contrasted with Firestrike's explicit Heavy ATK
  // override on Mid-air Stage 3 specifically) confirms basicDmg for the base Stage 1-2 combo.
  it('Mid-air Attack Stage 1-2 is basicDmg-categorized', () => {
    const block = LUPA_BLOCKS.find(b => b.id === 'lupa.midair.attack-stage1-2');
    expect(block.damage.category).toBe('basicDmg');
  });

  it('S1/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lupa'];
    expect(LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s6').effects[0].value).toBe(rc.s6.defIgnore);
  });

  it('S2/S3 model the real per-stack/scoped mechanics, matching the max/scoped RESONANCE_CHAIN_DATA values', () => {
    const rc = RESONANCE_CHAIN_DATA['Lupa'];
    const s2 = LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s2');
    expect(s2.effects[0].value * s2.effects[0].maxStacks).toBe(rc.s2.elemDmg);
    expect(LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
  });

  it('S3 is correctly libDmg, not the old wrong totalMult category', () => {
    const s3 = LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s3');
    expect(s3.effects[0].stat).toBe('libDmg');
  });

  // Fixed 2026-09-02, 2nd pass (see this block's own header comment in lupa.blocks.js): S4 was a
  // `kind:'buff'` libDmg effect, but that shape (cast-scoped, no timing.duration) is a silent no-op in
  // every hit-composed resolver — statsAtInstant() only reads passiveBlocks/buffWindows, neither of
  // which a no-duration cast-triggered buff matches. Converted to a real `kind:'damage'` proportional
  // 2nd-hit block instead, same pattern as Brant's S6/Denia's S4/Chisa's S4.
  it("S4 is a real damage block (not an ineffective buff), gated to sequence 4, worth 125% of Climax's own base total", () => {
    const s4 = LUPA_BLOCKS.find(b => b.id === 'lupa.chain.s4');
    expect(s4.kind).toBe('damage');
    expect(s4.damage.category).toBe('libDmg');
    const s4Total = s4.damage.hits.reduce((sum, h) => sum + h.atkPct, 0);
    expect(s4Total).toBeCloseTo(945.325, 1);
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lupa'], LUPA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const atS4 = resolveHitComposedDps(LUPA_BLOCKS, steps, ctx, 3000, 'fusion', 'Sub DPS', null, 4);
    const atS3 = resolveHitComposedDps(LUPA_BLOCKS, steps, ctx, 3000, 'fusion', 'Sub DPS', null, 3);
    expect(atS4.hitLog.some(h => h.blockId === 'lupa.chain.s4')).toBe(true);
    expect(atS3.hitLog.some(h => h.blockId === 'lupa.chain.s4')).toBe(false);
  });

  it('outro, libBuff, selfBuff, and debuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Lupa'];
    const outro = LUPA_BLOCKS.find(b => b.id === 'lupa.outro.stand-by-me-warrior');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'basicDmg').value).toBe(legacy.outroBuffs[1].value);
    const lib = LUPA_BLOCKS.find(b => b.id === 'lupa.libbuff.pack-hunt');
    expect(lib.effects[0].value * lib.effects[0].maxStacks).toBe(legacy.libBuffs[0].value);
    const self = LUPA_BLOCKS.find(b => b.id === 'lupa.selfbuff.wildfire-banner');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
    const deb = LUPA_BLOCKS.find(b => b.id === 'lupa.debuff.glory');
    expect(deb.effects[0].value * deb.effects[0].maxStacks).toBe(legacy.debuffs[0].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lupa'], LUPA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LUPA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'fusion', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lupa.intro.try-focusing-eh')).toBe(true);
    // Fixed 2026-09-02: the dump's own row label ("Skill Damage", not a move-specific name) confirms
    // this is plain Resonance Skill DMG — was previously left uncategorized on a first pass.
    expect(LUPA_BLOCKS.find(b => b.id === 'lupa.intro.try-focusing-eh').damage.category).toBe('skillDmg');
    expect(fired.has('lupa.liberation.fire-kissed-glory')).toBe(true);
    expect(fired.has('lupa.liberation.dance-with-the-wolf-climax')).toBe(true);
    expect(fired.has('lupa.heavy.wolfs-claw')).toBe(true);
  });

  // Fixed 2026-09-02 against a fresh the source dump: CHARACTER_ROTATIONS['Lupa'] previously named the
  // Forte finisher as the BASE 'Dance With the Wolf' (~672% total, no Burning Matchpoint requirement) —
  // a real data bug, not a legitimate approximation, since her rotation always enters Burning Matchpoint
  // via Foebreaker 2 steps earlier, and the dump's own text confirms the base version "never sees use."
  // This silently computed roughly HALF her real Forte-finisher damage, and left S4's own +125% Climax
  // DMG Multiplier buff permanently inert (its trigger already correctly named the Climax cast — nothing
  // in the rotation ever matched it).
  it("the Forte finisher fires the Climax variant (not the weaker base version) and S4's buff is no longer inert", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lupa'], LUPA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withoutS4 = LUPA_BLOCKS.filter(b => b.id !== 'lupa.chain.s4');
    const withS4 = resolveHitComposedDps(LUPA_BLOCKS, steps, ctx, 3000, 'fusion', 'Sub DPS', null, 6);
    const noS4 = resolveHitComposedDps(withoutS4, steps, ctx, 3000, 'fusion', 'Sub DPS', null, 6);
    expect(withS4.totalDamage).toBeGreaterThan(noS4.totalDamage);
    // The old base-version block id no longer exists at all — renamed, not left as a dead duplicate.
    expect(LUPA_BLOCKS.find(b => b.id === 'lupa.liberation.dance-with-the-wolf')).toBeUndefined();
    expect(withS4.hitLog.filter(h => h.blockId === 'lupa.liberation.dance-with-the-wolf-climax').length).toBe(6);
  });
});
