import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { ENCORE_BLOCKS } from '../engine/characterBlocks/encore.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Encore', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(ENCORE_BLOCKS, 'Encore');
  });

  it('S2 stays correctly unmodeled (no block) — pure Energy-economy utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Encore'];
    expect(rc.s2).toEqual({ totalMult: 0 });
    expect(ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s2')).toBeUndefined();
  });

  // Found 2026-09-08 (full re-audit): S1's real trigger is "Basic Attack hit" (any sub-hit), but the
  // old `stacking:'stacking', maxStacks:4` version anchored to the whole-combo CAST of Cosmos:
  // Frolicking, which only casts twice in the real modeled rotation — `activeCountAt()` never saw
  // more than 2 concurrent 6s windows, capping at 2/4 stacks (6%) instead of the real 12% max (a
  // single Frolicking cast's 12 real sub-hits reach the cap within the first few hits). Retargeted to
  // a flat value at the real cap — see encore.chain.s1's own retargeting comment for the full
  // reasoning (same fix pattern as S6 below).
  it('S1 models the real 4-stack cap total (3 x4 = 12 max), not the old under-firing per-whole-combo-cast stacking', () => {
    const rc = RESONANCE_CHAIN_DATA['Encore'];
    const s1 = ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s1');
    expect(s1.effects[0].value).toBe(rc.s1.elemDmg);
    expect(s1.effects[0].stacking).toBeUndefined();
    expect(s1.trigger).toEqual({ type: 'cast', on: 'Basic ATK:Cosmos: Frolicking 1-4' });
  });

  // Positive-verification test for the S1 fix: proves the pre-Frolicking hits (Intro, before any
  // Basic ATK has landed) get none of this Fusion DMG bonus, but hits from the first Frolicking cast
  // onward do.
  it("S1's +12% Fusion DMG doesn't inflate her pre-Frolicking Intro hit, but boosts hits from the first Cosmos: Frolicking cast onward", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Encore'], ENCORE_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS1 = resolveHitComposedDps(ENCORE_BLOCKS, steps, ctx, 3000, 'fusion', 'Main DPS');
    const withoutS1Blocks = ENCORE_BLOCKS.filter(b => b.id !== 'encore.chain.s1');
    const withoutS1 = resolveHitComposedDps(withoutS1Blocks, steps, ctx, 3000, 'fusion', 'Main DPS');
    const introWith = withS1.hitLog.find(h => h.blockId === 'encore.intro.woolies-helpers');
    const introWithout = withoutS1.hitLog.find(h => h.blockId === 'encore.intro.woolies-helpers');
    expect(introWith.damage).toBeCloseTo(introWithout.damage, 5);
    const rupWith = withS1.hitLog.find(h => h.blockId === 'encore.forte.cosmos-rupture');
    const rupWithout = withoutS1.hitLog.find(h => h.blockId === 'encore.forte.cosmos-rupture');
    expect(rupWith.damage).toBeGreaterThan(rupWithout.damage);
  });

  it('S3/S4/S5 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Encore'];
    expect(ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s4').effects[0].value).toBe(rc.s4.elemDmg);
    expect(ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s5').effects[0].value).toBe(rc.s5.skillDmg);
  });

  // Found 2026-09-08 (full re-audit): S6's real trigger is "per damage instance" during Cosmos Rave,
  // but the old `stacking:'stacking', maxStacks:5` version anchored to the Cosmos: Rampage CAST,
  // which only fires 3 times in the real modeled rotation — `activeCountAt()` never saw more than 3
  // concurrent 10s windows, capping at 3/5 stacks (15%) instead of the real 25% max (dozens of real
  // sub-hits land within the first second of Cosmos Rave, saturating the cap almost instantly).
  // Retargeted to a flat value at the real cap, anchored to the Liberation:Cosmos Rave cast itself
  // (the window's own real opening event) — see encore.chain.s6's own retargeting comment for the
  // full reasoning.
  it('S6 models the real 5-stack cap total (5 x5 = 25 max), not the old under-firing per-Rampage-cast stacking, matching the two-source majority', () => {
    const rc = RESONANCE_CHAIN_DATA['Encore'];
    const s6 = ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s6');
    expect(s6.effects[0].value).toBe(rc.s6.atkPct);
    expect(s6.effects[0].stacking).toBeUndefined();
    expect(s6.trigger).toEqual({ type: 'cast', on: 'Liberation:Cosmos Rave' });
  });

  // Positive-verification test for the S6 fix: proves the pre-Cosmos-Rave hits (Intro) get no ATK
  // bonus, but hits from the moment Cosmos Rave is entered onward do.
  it("S6's +25% ATK doesn't inflate her pre-Cosmos-Rave Intro hit, but boosts hits once Cosmos Rave is entered", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Encore'], ENCORE_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS6 = resolveHitComposedDps(ENCORE_BLOCKS, steps, ctx, 3000, 'fusion', 'Main DPS');
    const withoutS6Blocks = ENCORE_BLOCKS.filter(b => b.id !== 'encore.chain.s6');
    const withoutS6 = resolveHitComposedDps(withoutS6Blocks, steps, ctx, 3000, 'fusion', 'Main DPS');
    const introWith = withS6.hitLog.find(h => h.blockId === 'encore.intro.woolies-helpers');
    const introWithout = withoutS6.hitLog.find(h => h.blockId === 'encore.intro.woolies-helpers');
    expect(introWith.damage).toBeCloseTo(introWithout.damage, 5);
    const rupWith = withS6.hitLog.find(h => h.blockId === 'encore.forte.cosmos-rupture');
    const rupWithout = withoutS6.hitLog.find(h => h.blockId === 'encore.forte.cosmos-rupture');
    expect(rupWith.damage).toBeGreaterThan(rupWithout.damage);
  });

  it('S4 is team-wide with a real 30s window', () => {
    const s4 = ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('both selfBuffs match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Encore'];
    const cheer = ENCORE_BLOCKS.find(b => b.id === 'encore.selfbuff.woolies-cheer-dance');
    const angry = ENCORE_BLOCKS.find(b => b.id === 'encore.selfbuff.angry-cosmos');
    expect(cheer.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(angry.effects[0].value).toBe(legacy.selfBuffs[1].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Encore'], ENCORE_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(ENCORE_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'fusion', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('encore.intro.woolies-helpers')).toBe(true);
    expect(fired.has('encore.forte.cosmos-rupture')).toBe(true);
    expect(fired.has('encore.skill.cosmos-rampage')).toBe(true);
    expect(fired.has('encore.basic.cosmos-frolicking')).toBe(true);
  });

  // Updated 2026-09-07 (completeness pass): heavyDmg IS now a real, used category (base Heavy ATK/
  // Cosmos: Heavy Attack blocks were added this same pass, both genuinely unused in her modeled
  // rotation) — the "heavyDmg has no matching block" premise no longer holds, but that's irrelevant
  // to S3's own correctness (its cast-scoped trigger only ever fires on the Cosmos Rupture cast, an
  // instant no other block shares), so only the libDmg-match assertion is still meaningful.
  it("S3's buff category matches a real damage block category (libDmg, corrected from a stale heavyDmg)", () => {
    const s3 = ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s3');
    expect(s3.effects[0].stat).toBe('libDmg');
    const usedCategories = new Set(ENCORE_BLOCKS.filter(b => b.kind === 'damage' && b.damage?.category).map(b => b.damage.category));
    expect(usedCategories.has(s3.effects[0].stat)).toBe(true);
  });

  it("Intro (Woolies Helpers) is skillDmg-categorized (was uncategorized) — no override text names a different category", () => {
    const intro = ENCORE_BLOCKS.find(b => b.id === 'encore.intro.woolies-helpers');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("Outro (Thermal Field) is outroDmg-categorized (was uncategorized) — a free-to-quickswap DoT proc, not a team buff", () => {
    const outro = ENCORE_BLOCKS.find(b => b.id === 'encore.outro.thermal-field');
    expect(outro.damage.category).toBe('outroDmg');
  });

  it("dmgFocus gains 'Liberation'/'Outro' (real 14.6%/12.9% shares, now libDmg/outroDmg-categorized) — Echo (7.1%, generic equipped-Echo damage) and Intro (2.85%) both stay excluded per this project's own precedent", () => {
    expect(CHARACTER_DATA['Encore'].dmgFocus).toEqual(['Basic ATK', 'Skill', 'Liberation', 'Outro']);
  });

  // Verified 2026-09-08 (full re-audit): confirmed Angry Cosmos deliberately does NOT use the real,
  // enforced `condition.casterHpPct` schema field — resolveHitComposedDps.js's conditionHolds() calls
  // never supply `casterHpPctAssumed`, so any block using casterHpPct unconditionally fails in the
  // resolver this block actually runs through, which would silently zero the buff out entirely (worse
  // than the current always-on approximation). This is the SAME simplification CHAR_BUFF_TABLE's own
  // selfBuffs entry for Encore already discloses.
  it('Angry Cosmos deliberately omits casterHpPct (would zero the buff out in the resolver actually used, not enforce it)', () => {
    const angry = ENCORE_BLOCKS.find(b => b.id === 'encore.selfbuff.angry-cosmos');
    expect(angry.condition.casterHpPct).toBeUndefined();
    expect(angry.condition.requiresStance).toBe('HP above 70%');
  });
});
