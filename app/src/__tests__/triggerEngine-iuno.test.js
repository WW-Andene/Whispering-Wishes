import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { IUNO_BLOCKS } from '../engine/characterBlocks/iuno.blocks.js';

describe('triggerEngine parity — Iuno', () => {
  it('S4 stays correctly unmodeled (no block) — pure defensive team shield per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Iuno'];
    expect(rc.s4).toEqual({ totalMult: 0 });
    expect(IUNO_BLOCKS.find(b => b.id === 'iuno.chain.s4')).toBeUndefined();
  });

  it('S1/S2/S3/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Iuno'];
    expect(IUNO_BLOCKS.find(b => b.id === 'iuno.chain.s1').effects[0].value).toBe(rc.s1.atkPct);
    expect(IUNO_BLOCKS.find(b => b.id === 'iuno.chain.s2').effects[0].value).toBe(rc.s2.allDmg);
    expect(IUNO_BLOCKS.find(b => b.id === 'iuno.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(IUNO_BLOCKS.find(b => b.id === 'iuno.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(IUNO_BLOCKS.find(b => b.id === 'iuno.chain.s6').effects[0].value).toBe(rc.s6.libDmg);
  });

  // Found 2026-09-02 against a fresh the source dump: Absolute Fullness (both its own damage block and its
  // S6 chain bonus) was wrongly categorized heavyDmg — its own kit text explicitly says "considered as
  // Resonance Liberation DMG" despite the Heavy ATK slot, the same pattern already correctly applied to
  // Flux: Moonbow/Moonring elsewhere in this file. Confirmed independently by the calc page's own
  // damage profile: a flat 0% Heavy ATK share in both her DPS and Hybrid rotations.
  it("Absolute Fullness (damage block + S6 chain bonus) is libDmg, not heavyDmg — she has zero real Heavy ATK DMG", () => {
    const rc = RESONANCE_CHAIN_DATA['Iuno'];
    expect(rc.s6).toEqual({ libDmg: 1600 });
    expect(rc.s6.heavyDmg).toBeUndefined();
    const absoluteFullness = IUNO_BLOCKS.find(b => b.id === 'iuno.heavy.absolute-fullness');
    expect(absoluteFullness.damage.category).toBe('libDmg');
    const s6 = IUNO_BLOCKS.find(b => b.id === 'iuno.chain.s6');
    expect(s6.effects[0]).toEqual({ stat: 'libDmg', value: 1600 });
  });

  it("dmgFocus is ['Liberation'] only — 'Heavy ATK' removed since she has zero real Heavy ATK DMG share", () => {
    expect(CHARACTER_DATA['Iuno'].dmgFocus).toEqual(['Liberation']);
  });

  it('Outro duration is 14s everywhere (CHAR_BUFF_TABLE, the TriggerBlock, CHARACTER_ROTATIONS, and desc all agree)', () => {
    const legacy = CHAR_BUFF_TABLE['Iuno'];
    expect(legacy.outroBuffs[0].duration).toBe(14);
    const block = IUNO_BLOCKS.find(b => b.id === 'iuno.outro.gloom-to-gleam-buff');
    expect(block.timing.duration).toBe(14);
    const rotationOutro = CHARACTER_ROTATIONS['Iuno'].find(s => s.type === 'Outro');
    expect(rotationOutro.duration).toBe(14);
    expect(CHARACTER_DATA['Iuno'].desc).toContain('for 14s');
    expect(CHARACTER_DATA['Iuno'].desc).not.toContain('for 10s');
  });

  it('outro damage buff and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Iuno'];
    const outro = IUNO_BLOCKS.find(b => b.id === 'iuno.outro.gloom-to-gleam-buff');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const self = IUNO_BLOCKS.find(b => b.id === 'iuno.selfbuff.blessing-of-the-wan-light');
    expect(self.effects[0].value * self.effects[0].maxStacks).toBe(legacy.selfBuffs[0].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Iuno'], IUNO_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(IUNO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'aero', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('iuno.intro.illuminated-manifestation')).toBe(true);
    expect(fired.has('iuno.liberation.beneath-lunar-tides')).toBe(true);
    expect(fired.has('iuno.heavy.absolute-fullness')).toBe(true);
    expect(fired.has('iuno.outro.from-gloom-to-gleam')).toBe(true);
  });
});
