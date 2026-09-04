import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { SANHUA_BLOCKS } from '../engine/characterBlocks/sanhua.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Sanhua', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(SANHUA_BLOCKS, 'Sanhua');
  });

  it('S2 stays correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Sanhua'];
    expect(rc.s2).toEqual({});
    expect(SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s2')).toBeUndefined();
  });

  it('S1/S3/S4/S5 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Sanhua'];
    expect(SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s3').effects[0].value).toBe(rc.s3.totalMult);
    expect(SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s4').effects[0].value).toBe(rc.s4.heavyDmg);
    expect(SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s5').effects[0].value).toBe(rc.s5.critDmg);
  });

  it('S6 models the real per-stack mechanic (10 x2 stacks = 20 max), team-wide', () => {
    const rc = RESONANCE_CHAIN_DATA['Sanhua'];
    const s6 = SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s6');
    expect(s6.effects[0].value * s6.effects[0].maxStacks).toBe(rc.s6.atkPct);
    expect(s6.target.scope).toBe('whole-team');
  });

  it("Detonate and Ice Burst are 2 separate blocks with different categories (heavyDmg vs skillDmg) — the kit text labels each differently (\"considered Heavy Attack DMG\" vs \"considered Resonance Skill DMG\"), previously wrongly combined into one heavyDmg block", () => {
    const detonate = SANHUA_BLOCKS.find(bl => bl.id === 'sanhua.forte.detonate');
    const iceBurst = SANHUA_BLOCKS.find(bl => bl.id === 'sanhua.forte.ice-burst');
    expect(detonate.damage.hits.length).toBe(2);
    expect(detonate.damage.category).toBe('heavyDmg');
    expect(iceBurst.damage.hits.length).toBe(3);
    expect(iceBurst.damage.category).toBe('skillDmg');
  });

  it("Avalanche and S5 are now correctly scoped to sanhua.forte.ice-burst only, no longer over-crediting Detonate", () => {
    const avalanche = SANHUA_BLOCKS.find(b => b.id === 'sanhua.selfbuff.avalanche');
    const s5 = SANHUA_BLOCKS.find(b => b.id === 'sanhua.chain.s5');
    expect(avalanche.effects[0]).toEqual({ stat: 'skillDmg', value: 20, scopedToBlockId: 'sanhua.forte.ice-burst', source: 'self-kit' });
    expect(s5.effects[0]).toEqual({ stat: 'critDmg', value: 100, scopedToBlockId: 'sanhua.forte.ice-burst', source: 'self-kit' });
  });

  it("Intro (Freezing Thorns) is skillDmg-categorized (was uncategorized)", () => {
    const intro = SANHUA_BLOCKS.find(b => b.id === 'sanhua.intro.freezing-thorns');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("dmgFocus is ['Heavy ATK', 'Liberation', 'Skill'] — 'Basic ATK' was wrong (0% real share, no basicDmg block exists), all 3 real categories were missing", () => {
    expect(CHARACTER_DATA['Sanhua'].dmgFocus).toEqual(['Heavy ATK', 'Liberation', 'Skill']);
  });

  it('outro matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Sanhua'];
    const outro = SANHUA_BLOCKS.find(b => b.id === 'sanhua.outro.silversnow');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
  });

  it('both Inherent Skill selfBuffs (Condensation, Avalanche) match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Sanhua'];
    const condensation = SANHUA_BLOCKS.find(b => b.id === 'sanhua.selfbuff.condensation');
    const avalanche = SANHUA_BLOCKS.find(b => b.id === 'sanhua.selfbuff.avalanche');
    expect(condensation.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(condensation.timing.duration).toBe(legacy.selfBuffs[0].duration);
    expect(avalanche.effects[0].value).toBe(legacy.selfBuffs[1].value);
  });

  it("two-path desync fix: CHAR_BUFF_TABLE Avalanche stat matches sanhua.blocks.js (skillDmg, not the stale heavyDmg left over from before Detonate/Ice Burst were split)", () => {
    const legacy = CHAR_BUFF_TABLE['Sanhua'];
    const avalanche = SANHUA_BLOCKS.find(b => b.id === 'sanhua.selfbuff.avalanche');
    expect(legacy.selfBuffs[1].stat).toBe('skillDmg');
    expect(legacy.selfBuffs[1].stat).toBe(avalanche.effects[0].stat);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Sanhua'], SANHUA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(SANHUA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2000, 'glacio', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('sanhua.intro.freezing-thorns')).toBe(true);
    expect(fired.has('sanhua.liberation.glacial-gaze')).toBe(true);
    expect(fired.has('sanhua.forte.detonate')).toBe(true);
    expect(fired.has('sanhua.forte.ice-burst')).toBe(true);
  });
});
