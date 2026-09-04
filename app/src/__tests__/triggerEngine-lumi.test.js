import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { LUMI_BLOCKS } from '../engine/characterBlocks/lumi.blocks.js';

describe('triggerEngine parity — Lumi', () => {
  it('S1 stays correctly unmodeled (no block) — pure STA-restore utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Lumi'];
    expect(rc.s1).toEqual({});
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s1')).toBeUndefined();
  });

  it('S2/S3/S4/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lumi'];
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s2').effects[0].value).toBe(rc.s2.defIgnore);
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s4').effects[0].value).toBe(rc.s4.basicDmg);
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s6').effects[0].value).toBe(rc.s6.atkPct);
  });

  it("S5 (fixed 2026-09-04) is correctly removed, not left as an unscoped, always-on totalMult passive — it was silently DOUBLING her entire kit's damage (confirmed: removing it dropped simulated total from 94,044 to 47,022, exactly 2x), since totalMult isn't category-gated and the block had no scoping or condition at all", () => {
    expect(LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s5')).toBeUndefined();
  });

  it("S5 is zeroed in RESONANCE_CHAIN_DATA itself, not just absent from LUMI_BLOCKS — the legacy applyResonanceChain() (calcEngine.js) Main-DPS totalMult path reads RESONANCE_CHAIN_DATA directly and would still double her damage there if s5.totalMult were left in place", () => {
    const rc = RESONANCE_CHAIN_DATA['Lumi'];
    expect(rc.s5).toEqual({});
  });

  it('S6 is team-wide with a real 20s window', () => {
    const s6 = LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s6');
    expect(s6.target.scope).toBe('whole-team');
    expect(s6.timing.duration).toBe(20);
  });

  it('outro matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Lumi'];
    const outro = LUMI_BLOCKS.find(b => b.id === 'lumi.outro.escorting');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lumi'], LUMI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LUMI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'electro', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lumi.intro.special-delivery')).toBe(true);
    expect(fired.has('lumi.liberation.squeakie-express')).toBe(true);
    expect(fired.has('lumi.forte.energized-pounce')).toBe(true);
    expect(fired.has('lumi.forte.glare')).toBe(true);
  });

  it('Glare fires the real 6-hit Channelled Dash (fixed 2026-09-04 — was a single 81.52% hit, undercounting by 6x)', () => {
    const glare = LUMI_BLOCKS.find(b => b.id === 'lumi.forte.glare');
    expect(glare.damage.hits).toHaveLength(6);
    expect(glare.damage.hits.every(h => h.atkPct === 81.52)).toBe(true);
  });

  it('Intro is skillDmg-categorized (was uncategorized)', () => {
    const intro = LUMI_BLOCKS.find(b => b.id === 'lumi.intro.special-delivery');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("dmgFocus is ['Basic ATK', 'Liberation'] — Liberation (29.6% real share, libDmg-categorized) was missing despite being far above this project's 6.8% include threshold", () => {
    expect(CHARACTER_DATA['Lumi'].dmgFocus).toEqual(['Basic ATK', 'Liberation']);
  });
});
