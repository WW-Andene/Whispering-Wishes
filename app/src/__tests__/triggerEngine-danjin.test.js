import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { DANJIN_BLOCKS } from '../engine/characterBlocks/danjin.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Danjin', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(DANJIN_BLOCKS, 'Danjin');
  });

  // Fixed 2026-09-08: `stacking`/`maxStacks` on a `trigger.type: 'passive'` block is dead metadata in
  // every resolver path (only a real duration-based buff window ever reads it), so this block was
  // silently delivering only 5% (1 stack) instead of the 30% (6-stack) cap. Now modeled as a flat value
  // at the confirmed cap instead of (inert) per-stack metadata — see danjin.blocks.js's own fix comment.
  it('S1 models the real 6-stack cap total (5 x6 = 30 max), not the old dead per-stack metadata', () => {
    const rc = RESONANCE_CHAIN_DATA['Danjin'];
    const s1 = DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s1');
    expect(s1.effects[0].value).toBe(rc.s1.atkPct);
  });

  it('S2/S3/S4/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Danjin'];
    expect(DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s2').effects[0].value).toBe(rc.s2.totalMult);
    expect(DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s4').effects[0].value).toBe(rc.s4.critRate);
    expect(DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s5').effects[0].value).toBe(rc.s5.elemDmg);
    expect(DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s6').effects[0].value).toBe(rc.s6.atkPct);
  });

  // Found 2026-09-08 (full re-audit): chain.s2 previously used `condition.requiresStance`, which
  // triggerEngine.js's own conditionHolds() never actually enforces (purely descriptive except via a
  // separate exclusive-mode mechanism that doesn't apply here) — the same bug class already found on
  // Camellya's chain.s3/s6. This totalMult:20 effect (uncategorized, reaches every hit) was silently
  // unconditional across her whole kit instead of only Incinerating-Will-marked-target hits. Retargeted
  // to a cast-anchored window on the Crimson Erosion cast (the real move that applies the mark), with
  // a duration matching the mark's own real 12s lifetime.
  it("S2 is a real cast-anchored 12s window (matching Incinerating Will's own duration), not an unenforced requiresStance condition", () => {
    const s2 = DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s2');
    expect(s2.trigger).toEqual({ type: 'cast', on: 'Skill:Crimson Erosion' });
    expect(s2.timing.duration).toBe(12);
    expect(s2.condition).toBeUndefined();
  });

  // Positive-verification test for the S2 fix: proves her pre-mark Intro hit is no longer boosted.
  it("S2's +20% no longer inflates her pre-mark Intro hit, but boosts hits after Crimson Erosion is cast", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Danjin'], DANJIN_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS2 = resolveHitComposedDps(DANJIN_BLOCKS, steps, ctx, 2500, 'havoc', 'Sub DPS');
    const withoutS2Blocks = DANJIN_BLOCKS.filter(b => b.id !== 'danjin.chain.s2');
    const withoutS2 = resolveHitComposedDps(withoutS2Blocks, steps, ctx, 2500, 'havoc', 'Sub DPS');
    const introWith = withS2.hitLog.find(h => h.blockId === 'danjin.intro.vindication');
    const introWithout = withoutS2.hitLog.find(h => h.blockId === 'danjin.intro.vindication');
    expect(introWith.damage).toBeCloseTo(introWithout.damage, 5);
    const libWith = withS2.hitLog.find(h => h.blockId === 'danjin.liberation.crimson-bloom');
    const libWithout = withoutS2.hitLog.find(h => h.blockId === 'danjin.liberation.crimson-bloom');
    expect(libWith.damage).toBeGreaterThan(libWithout.damage);
  });

  // Found 2026-09-08 (full re-audit): CHARACTER_ROTATIONS['Danjin']'s own step note for this exact
  // step already says "unleash Chaoscleave...into the Scatterbloom follow-up" — a real, guaranteed
  // follow-up move with its own SKILL_MULTIPLIERS row (179%) that had no block anywhere. The dump's
  // own Damage Profile "Heavy 24.4%" bucket is consistent with the combined total, not Chaoscleave
  // alone.
  it('Chaoscleave includes the guaranteed Scatterbloom follow-up (179%) in its own hit list', () => {
    const block = DANJIN_BLOCKS.find(b => b.id === 'danjin.forte.chaoscleave');
    const sum = block.damage.hits.reduce((s, h) => s + (h.atkPct || 0), 0);
    expect(sum).toBeCloseTo(59.65 * 7 + 179, 1);
  });

  it('S6 is team-wide with a real 20s window (not a flat passive)', () => {
    const s6 = DANJIN_BLOCKS.find(b => b.id === 'danjin.chain.s6');
    expect(s6.target.scope).toBe('whole-team');
    expect(s6.timing.duration).toBe(20);
  });

  it('outro matches CHAR_BUFF_TABLE — correctly elemDmg, not amplify', () => {
    const legacy = CHAR_BUFF_TABLE['Danjin'];
    const outro = DANJIN_BLOCKS.find(b => b.id === 'danjin.outro.duality');
    expect(outro.effects[0].stat).toBe('elemDmg');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Danjin'], DANJIN_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(DANJIN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'havoc', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('danjin.intro.vindication')).toBe(true);
    expect(fired.has('danjin.liberation.crimson-bloom')).toBe(true);
    expect(fired.has('danjin.forte.chaoscleave')).toBe(true);
  });

  // Updated 2026-09-07 (completeness pass): danjin.heavy.execution (a real, sourced but
  // rotation-unused base Heavy ATK block) was added this same pass, so Chaoscleave is no longer the
  // ONLY heavyDmg block — Overflow was rescoped via scopedToBlockId to Chaoscleave specifically to
  // avoid over-crediting the new block, so the real assertion now is that scoping, not exclusivity.
  it('Inherent Skill Overflow matches CHAR_BUFF_TABLE and is correctly scoped to Chaoscleave only', () => {
    const legacy = CHAR_BUFF_TABLE['Danjin'];
    const overflow = DANJIN_BLOCKS.find(b => b.id === 'danjin.selfbuff.overflow');
    expect(overflow.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(overflow.timing.duration).toBe(legacy.selfBuffs[0].duration);
    expect(overflow.effects[0].scopedToBlockId).toBe('danjin.forte.chaoscleave');
    const heavyDmgBlocks = DANJIN_BLOCKS.filter(b => b.kind === 'damage' && b.damage?.category === 'heavyDmg');
    expect(heavyDmgBlocks.map(b => b.id).sort()).toEqual(['danjin.forte.chaoscleave', 'danjin.heavy.execution']);
  });

  it("Intro (Vindication) is skillDmg-categorized (was uncategorized)", () => {
    const intro = DANJIN_BLOCKS.find(b => b.id === 'danjin.intro.vindication');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("dmgFocus is ['Heavy ATK', 'Skill', 'Liberation'] — 'Basic ATK' was wrong (no basicDmg block exists, and Basic ATK never appears as its own CHARACTER_ROTATIONS step), Liberation (29.7%, her single biggest bucket) was missing", () => {
    expect(CHARACTER_DATA['Danjin'].dmgFocus).toEqual(['Heavy ATK', 'Skill', 'Liberation']);
  });
});
