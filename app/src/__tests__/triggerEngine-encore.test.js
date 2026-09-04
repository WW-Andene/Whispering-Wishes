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

  it('S1 models the real per-stack mechanic (3 x4 stacks = 12 max), not just the flat total', () => {
    const rc = RESONANCE_CHAIN_DATA['Encore'];
    const s1 = ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s1');
    expect(s1.effects[0].value * s1.effects[0].maxStacks).toBe(rc.s1.elemDmg);
  });

  it('S3/S4/S5 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Encore'];
    expect(ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s4').effects[0].value).toBe(rc.s4.elemDmg);
    expect(ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s5').effects[0].value).toBe(rc.s5.skillDmg);
  });

  it('S6 models the real per-stack mechanic (5 x5 stacks = 25 max), matching the two-source majority', () => {
    const rc = RESONANCE_CHAIN_DATA['Encore'];
    const s6 = ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s6');
    expect(s6.effects[0].value * s6.effects[0].maxStacks).toBe(rc.s6.atkPct);
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

  it('S3\'s buff category matches a real damage block category (was heavyDmg — a dead/no-op buff, since no Encore damage block uses that category)', () => {
    const s3 = ENCORE_BLOCKS.find(b => b.id === 'encore.chain.s3');
    expect(s3.effects[0].stat).toBe('libDmg');
    const usedCategories = new Set(ENCORE_BLOCKS.filter(b => b.kind === 'damage' && b.damage?.category).map(b => b.damage.category));
    expect(usedCategories.has(s3.effects[0].stat)).toBe(true);
    expect(usedCategories.has('heavyDmg')).toBe(false);
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
});
