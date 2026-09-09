import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { YUANWU_BLOCKS } from '../engine/characterBlocks/yuanwu.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Yuanwu', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(YUANWU_BLOCKS, 'Yuanwu');
  });

  it('S1-S4 stay correctly unmodeled (no block) — no matching DPS category per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Yuanwu'];
    ['s1', 's2', 's3', 's4'].forEach(s => expect(rc[s]).toEqual({}));
    ['yuanwu.chain.s1', 'yuanwu.chain.s2', 'yuanwu.chain.s3', 'yuanwu.chain.s4'].forEach(id => {
      expect(YUANWU_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S5 matches RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Yuanwu'];
    expect(YUANWU_BLOCKS.find(b => b.id === 'yuanwu.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
  });

  // Added 2026-09-09 (full-kit audit): S6 was previously correctly zeroed under a since-stale reasoning
  // ("no team-DEF% stat category") — defPct was wired into the engine on 2026-09-05, so S6 is now a
  // real, representable block. RESONANCE_CHAIN_DATA['Yuanwu'].s6 stays {} deliberately (see its own
  // 2026-09-09 comment): applyResonanceChain() has no defPct branch and no team-broadcast mechanism a
  // whole-team buff needs, unlike the block engine's own generic whole-team effect routing.
  it('S6 is now a real whole-team defPct buff (fixed 2026-09-09) — RESONANCE_CHAIN_DATA.s6 deliberately stays {} since the legacy engine cannot broadcast a team-wide defPct buff at all', () => {
    const rc = RESONANCE_CHAIN_DATA['Yuanwu'];
    expect(rc.s6).toEqual({});
    const s6 = YUANWU_BLOCKS.find(b => b.id === 'yuanwu.chain.s6');
    expect(s6.effects[0]).toEqual({ stat: 'defPct', value: 32, stacking: 'refresh', source: 'self-kit' });
    expect(s6.target.scope).toBe('whole-team');
    expect(s6.trigger).toEqual({ type: 'cast', on: 'Skill:Thunder Wedge' });
  });

  it('S6 real DEF% buff measurably increases Yuanwu\'s own (DEF-basis) damage in his real modeled rotation', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yuanwu'], YUANWU_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const baseStats = { atk: 1000, hp: 8000, def: 1638 };
    const withS6 = resolveHitComposedDps(YUANWU_BLOCKS, steps, ctx, baseStats, 'electro', 'Support');
    const withoutS6 = resolveHitComposedDps(YUANWU_BLOCKS.filter(b => b.id !== 'yuanwu.chain.s6'), steps, ctx, baseStats, 'electro', 'Support');
    expect(withS6.totalDamage).toBeGreaterThan(withoutS6.totalDamage);
  });

  it("Blazing Might's own hit and its Thunder Wedge Detonation are 2 separate blocks with different categories (libDmg vs skillDmg) — the dump's own dedicated \"Thunder Wedge Detonation\" SKILL_MULTIPLIERS row is explicit \"counted as Resonance Skill DMG\", previously wrongly combined into one libDmg block", () => {
    const own = YUANWU_BLOCKS.find(bl => bl.id === 'yuanwu.liberation.blazing-might');
    const detonation = YUANWU_BLOCKS.find(bl => bl.id === 'yuanwu.forte.thunder-wedge-detonation-liberation');
    expect(own.damage.hits.length).toBe(2);
    expect(own.damage.category).toBe('libDmg');
    expect(detonation.damage.hits.length).toBe(1);
    expect(detonation.damage.category).toBe('skillDmg');
  });

  it("Intro (Thunder Bombardment) is skillDmg-categorized (was uncategorized)", () => {
    const intro = YUANWU_BLOCKS.find(b => b.id === 'yuanwu.intro.thunder-bombardment');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("dmgFocus gains 'Skill'/'Liberation' — real, already-categorized damage was entirely missing; 'Coordinated ATK' stays, real per his kit (Thunder Field), just structurally unmodeled as its own block", () => {
    expect(CHARACTER_DATA['Yuanwu'].dmgFocus).toEqual(['Skill', 'Liberation', 'Coordinated ATK']);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    // baseStats needs both atk and def now: 2026-09-02 fixed his damage blocks to basis: 'DEF' (he's a
    // DEF-scaler per a fresh the source dump — every one of his real multipliers is explicitly DEF-scaling,
    // was defaulting to ATK-scaling before this fix, same as CHARACTER_DATA['Yuanwu'].statScaling).
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yuanwu'], YUANWU_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(YUANWU_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { atk: 2000, def: 2000 }, 'electro', 'Support');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('yuanwu.intro.thunder-bombardment')).toBe(true);
    expect(fired.has('yuanwu.liberation.blazing-might')).toBe(true);
    expect(fired.has('yuanwu.forte.thunder-wedge-detonation-liberation')).toBe(true);
    expect(fired.has('yuanwu.forte.rumbling-spark')).toBe(true);
  });
});
