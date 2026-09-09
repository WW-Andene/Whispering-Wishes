import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { LUMI_BLOCKS } from '../engine/characterBlocks/lumi.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Lumi', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(LUMI_BLOCKS, 'Lumi');
  });

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

  // Fixed 2026-09-09 (full-kit audit, independent re-verification): S2's defIgnore was UNSCOPED —
  // the note claimed it "applies to both blocks above" but defIgnore isn't category-gated
  // (resolveHitComposedDps.js applies it unconditionally via calcDefMult), so it was silently
  // leaking onto her ENTIRE kit (Intro, Glare, every move), not just Energized Pounce/Rebound.
  it("S2's defIgnore is scoped to only Energized Pounce/Rebound, not leaking onto the rest of her kit", () => {
    const s2 = LUMI_BLOCKS.find(b => b.id === 'lumi.chain.s2');
    expect(s2.effects[0].scopedToBlockId).toEqual(['lumi.forte.energized-pounce', 'lumi.forte.energized-rebound']);

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lumi'], LUMI_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const introDamage = (blocks) => {
      const { hitLog } = resolveHitComposedDps(blocks, steps, ctx, 3000, 'electro', 'Sub DPS', null, 2);
      return hitLog.filter(h => h.blockId === 'lumi.intro.special-delivery').reduce((s, h) => s + h.damage, 0);
    };
    // Intro has nothing to do with S2's own moves — its damage must be IDENTICAL with/without S2.
    expect(introDamage(LUMI_BLOCKS)).toBeCloseTo(introDamage(LUMI_BLOCKS.filter(b => b.id !== 'lumi.chain.s2')), 5);
  });

  // Added 2026-09-09 (full-kit audit): both Inherent Skills (Pathfinding, Expediting) had NO
  // representation anywhere — not CHAR_BUFF_TABLE.selfBuffs (empty array), not a block — despite
  // being real, unconditional, sourced base-kit passives with a genuine DPS component.
  it('Inherent Skill Expediting (+10% ATK for 5s on Energized Pounce/Rebound) is modeled and measurably applied', () => {
    const pounceBuff = LUMI_BLOCKS.find(b => b.id === 'lumi.buff.inherent-skill-expediting-pounce');
    const reboundBuff = LUMI_BLOCKS.find(b => b.id === 'lumi.buff.inherent-skill-expediting-rebound');
    expect(pounceBuff.trigger).toEqual({ type: 'cast', on: 'Forte:Energized Pounce' });
    expect(reboundBuff.trigger).toEqual({ type: 'cast', on: 'Forte:Energized Rebound' });
    expect(pounceBuff.timing.duration).toBe(5);
    expect(pounceBuff.effects[0]).toMatchObject({ stat: 'atkPct', value: 10 });

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lumi'], LUMI_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withBoth = resolveHitComposedDps(LUMI_BLOCKS, steps, ctx, 3000, 'electro', 'Sub DPS', null, 0).totalDamage;
    const withoutEither = resolveHitComposedDps(LUMI_BLOCKS.filter(b => !b.id.includes('expediting')), steps, ctx, 3000, 'electro', 'Sub DPS', null, 0).totalDamage;
    expect(withBoth).toBeGreaterThan(withoutEither);
  });

  it('Inherent Skill Pathfinding (+10% Electro DMG in Red Light Mode) is modeled, scoped only to blocks that fire while already in Red Light/Red Spotlight Mode', () => {
    const path = LUMI_BLOCKS.find(b => b.id === 'lumi.buff.inherent-skill-pathfinding');
    expect(path.effects[0]).toMatchObject({ stat: 'elemDmg', value: 10 });
    // Must NOT include Energized Pounce — it's cast FROM Yellow Mode and only switches to Red
    // Spotlight Mode afterward, so its own hit doesn't yet qualify.
    expect(path.effects[0].scopedToBlockId).not.toContain('lumi.forte.energized-pounce');
    expect(path.effects[0].scopedToBlockId).toEqual(expect.arrayContaining([
      'lumi.forte.red-spotlight-basic-attack', 'lumi.forte.energized-rebound',
    ]));

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lumi'], LUMI_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withPath = resolveHitComposedDps(LUMI_BLOCKS, steps, ctx, 3000, 'electro', 'Sub DPS', null, 0).totalDamage;
    const withoutPath = resolveHitComposedDps(LUMI_BLOCKS.filter(b => b.id !== 'lumi.buff.inherent-skill-pathfinding'), steps, ctx, 3000, 'electro', 'Sub DPS', null, 0).totalDamage;
    expect(withPath).toBeGreaterThan(withoutPath);
  });
});
