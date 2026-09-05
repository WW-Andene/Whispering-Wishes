import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { VERINA_BLOCKS } from '../engine/characterBlocks/verina.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Verina', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(VERINA_BLOCKS, 'Verina');
  });

  it('S1/S2/S3/S5 stay correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Verina'];
    ['s1', 's2', 's3', 's5'].forEach(s => expect(rc[s]).toEqual({}));
    ['verina.chain.s1', 'verina.chain.s2', 'verina.chain.s3', 'verina.chain.s5'].forEach(id => {
      expect(VERINA_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S4 matches RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Verina'];
    const s4 = VERINA_BLOCKS.find(b => b.id === 'verina.chain.s4');
    expect(s4.effects[0].value).toBe(rc.s4.elemDmg);
    expect(s4.target.scope).toBe('whole-team');
  });

  // Fixed 2026-09-02: S6 was a dead `kind:'buff'` stat (the engine-architecture history (git log) item 12's architecture
  // gap — a cast-scoped, no-duration buff is a silent no-op) — converted to a real damage block, plus
  // its previously-entirely-unmodeled Coordinated Attack proc was added as its own block.
  it("S6 is a real, sequence-6-gated damage block (proportional 2nd hit + Coordinated Attack proc)", () => {
    const s6 = VERINA_BLOCKS.find(b => b.id === 'verina.chain.s6');
    expect(s6.kind).toBe('damage');
    expect(s6.damage.category).toBe('basicDmg');
    const s6ca = VERINA_BLOCKS.find(b => b.id === 'verina.chain.s6-coordinated-attack');
    expect(s6ca.kind).toBe('damage');
    expect(s6ca.damage.category).toBe('coordDmg');
    expect(s6ca.damage.hits.reduce((sum, h) => sum + h.atkPct, 0)).toBeCloseTo(9.95, 1);
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Verina'], VERINA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const atS6 = resolveHitComposedDps(VERINA_BLOCKS, steps, ctx, 2000, 'spectro', 'Healer', null, 6);
    const atS5 = resolveHitComposedDps(VERINA_BLOCKS, steps, ctx, 2000, 'spectro', 'Healer', null, 5);
    expect(atS6.hitLog.some(h => h.blockId === 'verina.chain.s6')).toBe(true);
    expect(atS6.hitLog.some(h => h.blockId === 'verina.chain.s6-coordinated-attack')).toBe(true);
    expect(atS5.hitLog.some(h => h.blockId === 'verina.chain.s6')).toBe(false);
  });

  it('outro and libBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Verina'];
    const outro = VERINA_BLOCKS.find(b => b.id === 'verina.outro.blossom');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects[0].stat).toBe(legacy.outroBuffs[0].stat);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const lib = VERINA_BLOCKS.find(b => b.id === 'verina.libbuff.gift-of-nature');
    expect(lib.effects[0].value).toBe(legacy.libBuffs[0].value);
    expect(lib.target.scope).toBe('whole-team');
  });

  // Fixed 2026-09-02 against a fresh, user-pasted the source text: her Outro was wrongly stat:'allDmg'
  // ("Amplified") when the kit text explicitly says "Amplify" — a prior session's own note claimed this
  // was confirmed, but this file's own dmgFocus buff-tag entry already said 'DMG Amplify', an internal
  // contradiction that check missed.
  it("Outro (Blossom) is amplify, not allDmg", () => {
    const outro = VERINA_BLOCKS.find(b => b.id === 'verina.outro.blossom');
    expect(outro.effects[0].stat).toBe('amplify');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Verina'], VERINA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(VERINA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2000, 'spectro', 'Healer');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('verina.basic.cultivation-stage3-5')).toBe(true);
    expect(fired.has('verina.liberation.arboreal-flourish')).toBe(true);
    expect(fired.has('verina.forte.starflower-blooms-midair')).toBe(true);
  });

  it("dmgFocus gains 'Basic ATK' — 2 real basicDmg-categorized blocks already exist (her actual Basic ATK combo, and Forte's Mid-air Starflower Blooms, override-categorized \"considered Basic Attack damage\") — Coordinated ATK (S6-gated) stays excluded, not part of her S0 baseline", () => {
    expect(CHARACTER_DATA['Verina'].dmgFocus).toEqual(['Liberation', 'Basic ATK']);
  });
});
