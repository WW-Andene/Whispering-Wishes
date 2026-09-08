import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { DENIA_BLOCKS } from '../engine/characterBlocks/denia.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Denia', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(DENIA_BLOCKS, 'Denia');
  });

  it('S1-S5 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Denia'];
    expect(DENIA_BLOCKS.find(b => b.id === 'denia.chain.s1').effects[0].value).toBe(rc.s1.critDmg);
    expect(DENIA_BLOCKS.find(b => b.id === 'denia.chain.s2').effects[0].value).toBe(rc.s2.libDmg);
    expect(DENIA_BLOCKS.find(b => b.id === 'denia.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(DENIA_BLOCKS.find(b => b.id === 'denia.chain.s4').effects[0].value).toBe(rc.s4.totalMult);
    expect(DENIA_BLOCKS.find(b => b.id === 'denia.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
  });

  it('S6 has both real effects (atkPct AND elemDmg), matching RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Denia'];
    const s6 = DENIA_BLOCKS.find(b => b.id === 'denia.chain.s6');
    expect(s6.effects.find(e => e.stat === 'atkPct').value).toBe(rc.s6.atkPct);
    expect(s6.effects.find(e => e.stat === 'elemDmg').value).toBe(rc.s6.elemDmg);
  });

  it('the two Outro modes are mutually-exclusive real blocks matching CHAR_BUFF_TABLE exactly', () => {
    const legacy = CHAR_BUFF_TABLE['Denia'];
    const tuneStrain = DENIA_BLOCKS.find(b => b.id === 'denia.outro.unfinished-lies-tune-strain');
    const fusionBurst = DENIA_BLOCKS.find(b => b.id === 'denia.outro.unfinished-lies-fusion-burst');
    expect(tuneStrain.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(tuneStrain.timing.duration).toBe(legacy.outroBuffs[0].duration);
    expect(fusionBurst.effects[0].value).toBe(legacy.outroBuffs[1].value);
    expect(fusionBurst.timing.duration).toBe(legacy.outroBuffs[1].duration);
    expect(fusionBurst.target.scope).toBe('whole-team');
  });

  it('the Stagecraft-Form Basic ATK step only fires Stage 1, not the full 4-stage combo', () => {
    const b = DENIA_BLOCKS.find(bl => bl.id === 'denia.basic.stagecraft-stage1');
    expect(b.damage.hits.length).toBe(1);
    expect(b.damage.hits[0].atkPct).toBeCloseTo(32.69);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Denia'], DENIA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(DENIA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'fusion', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has("denia.intro.its-been-a-while")).toBe(true);
    expect(fired.has('denia.liberation.final-act-stagecraft')).toBe(true);
    expect(fired.has('denia.liberation.final-act-breakdown')).toBe(true);
    expect(fired.has('denia.liberation.erosion-field')).toBe(true);
  });

  // Found 2026-09-08 (full re-audit): both blocks previously used `trigger:{type:'passive'}` gated only
  // by an unenforced `condition.requiresStance` (or no condition at all) — the same bug class already
  // found on Camellya's chain.s3/s6 and Danjin's chain.s2. Entropy Shift doesn't exist until the FIRST
  // Final Act cast, so both were silently crediting her 3 real pre-Ultimate hits (Intro, Basic
  // Stagecraft 1, Phantom Bubble) with bonuses the kit text says shouldn't apply yet.
  it('S6 and Etched Colors (Fusion Burst half) are real cast-anchored windows opening on the first Final Act cast, not unenforced-condition passives', () => {
    const s6 = DENIA_BLOCKS.find(b => b.id === 'denia.chain.s6');
    const etched = DENIA_BLOCKS.find(b => b.id === 'denia.inherent.etched-colors-fusion-burst');
    expect(s6.trigger).toEqual({ type: 'cast', on: 'Liberation:Final Act: Stagecraft Form' });
    expect(etched.trigger).toEqual({ type: 'cast', on: 'Liberation:Final Act: Stagecraft Form' });
  });

  // Positive-verification test for the S6/Etched-Colors fix: proves the 3 real pre-Ultimate hits are no
  // longer boosted, but hits after the first Final Act cast are.
  it("S6's +60% ATK/+60% Fusion DMG no longer inflates her pre-Entropy-Shift hits, but boosts hits after Final Act: Stagecraft Form is cast", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Denia'], DENIA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS6 = resolveHitComposedDps(DENIA_BLOCKS, steps, ctx, 3500, 'fusion', 'Sub DPS');
    const withoutS6Blocks = DENIA_BLOCKS.filter(b => b.id !== 'denia.chain.s6' && b.id !== 'denia.inherent.etched-colors-fusion-burst');
    const withoutS6 = resolveHitComposedDps(withoutS6Blocks, steps, ctx, 3500, 'fusion', 'Sub DPS');
    const introWith = withS6.hitLog.find(h => h.blockId === 'denia.intro.its-been-a-while');
    const introWithout = withoutS6.hitLog.find(h => h.blockId === 'denia.intro.its-been-a-while');
    expect(introWith.damage).toBeCloseTo(introWithout.damage, 5);
    const breakdownWith = withS6.hitLog.find(h => h.blockId === 'denia.liberation.final-act-breakdown');
    const breakdownWithout = withoutS6.hitLog.find(h => h.blockId === 'denia.liberation.final-act-breakdown');
    expect(breakdownWith.damage).toBeGreaterThan(breakdownWithout.damage);
  });

  // Found 2026-09-08 (full re-audit): the Denia dump's own kit text (line 92, Forte Circuit section)
  // names Intro AND both Final Act casts as real Fusion-Burst appliers in the exact same sentence as
  // Erosion Field ("Intro/Final Act (both forms)/Erosion Field inflict 2 stacks of Fusion Burst") — but
  // only Erosion Field carried a `dotApplier` tag. Since dotApplier is purely tag-driven with no
  // fallback (dotReactionsFromBlocks.js), this was a real, silent gap in the cross-character Fusion
  // Burst reactivity system for 3 of her 4 named appliers.
  it('Intro and both Final Act casts now carry dotApplier tags matching Erosion Field (all 4 are named Fusion Burst appliers in the same kit-text sentence)', () => {
    const intro = DENIA_BLOCKS.find(b => b.id === "denia.intro.its-been-a-while");
    const finalActStagecraft = DENIA_BLOCKS.find(b => b.id === 'denia.liberation.final-act-stagecraft');
    const finalActBreakdown = DENIA_BLOCKS.find(b => b.id === 'denia.liberation.final-act-breakdown');
    const erosionField = DENIA_BLOCKS.find(b => b.id === 'denia.liberation.erosion-field');
    for (const b of [intro, finalActStagecraft, finalActBreakdown]) {
      expect(b.dotApplier).toEqual({ mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode', value: 2 });
    }
    expect(erosionField.dotApplier).toEqual({ mechanic: 'fusionBurst', requiresStance: 'Fusion Burst mode', value: 2 });
  });
});
