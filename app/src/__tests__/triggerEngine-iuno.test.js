import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, SKILL_MULTIPLIERS } from '../data/characters.js';
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

  // Added 2026-09-04 (Phase A audit, REMAINING_WORK.md 1c): the dump's "Standard Sub DPS Rotation"
  // explicitly spends both Arc Beyond the Edge charges ("Arc Beyond the Edge ×2") before swapping out —
  // and her own Sentience math only balances (100-point bar: 1 full Basic chain @ 50 + 2 Skill charges
  // @ 25 each) with both charges cast. The rotation previously only cast it once, silently dropping half
  // of a real, non-trivial rotation step's damage (bug class f).
  it('Arc Beyond the Edge is cast twice (both charges) in the modeled rotation, matching the dump\'s "×2"', () => {
    const abeSteps = CHARACTER_ROTATIONS['Iuno'].filter(s => s.type === 'Skill' && s.skill === 'Arc Beyond the Edge');
    expect(abeSteps.length).toBe(2);
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Iuno'], IUNO_BLOCKS);
    const { hitLog } = resolveHitComposedDps(IUNO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'aero', 'Sub DPS');
    const abeHitCount = hitLog.filter(h => h.blockId === 'iuno.skill.arc-beyond-the-edge').length;
    // '219.79%×2' is 2 sub-hits per cast — 2 casts × 2 sub-hits = 4 logged hits.
    expect(abeHitCount).toBe(4);
  });

  // Bug fixed 2026-09-04 (Phase A audit): S3's kit text names exactly 3 moves (Moonbow Basic ATK / Arc
  // Beyond the Edge / Moonbow Dodge Counter), but 'libDmg' is a damage-CATEGORY stat — several other
  // real blocks (the Ultimate, Flux: Moonbow, Absolute Fullness) also carry category:'libDmg' despite
  // not being named by S3's text at all. A bare (unscoped) libDmg:65 effect silently amplified those
  // too — the same category-leak shape the critical totalMult fact describes, via the category-stat
  // pool instead of totalMult. Verifies S3 now only touches the 2 blocks its own kit text names.
  it('S3 (+65% Amp) is scoped to only Moonbow Basic ATK and Arc Beyond the Edge — does not leak onto the Ultimate/Flux/Absolute Fullness', () => {
    const s3 = IUNO_BLOCKS.find(b => b.id === 'iuno.chain.s3');
    const scopedIds = s3.effects.map(e => e.scopedToBlockId);
    expect(scopedIds.sort()).toEqual(['iuno.basic.moonbow', 'iuno.skill.arc-beyond-the-edge'].sort());
    for (const e of s3.effects) expect(e.value).toBe(65);

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Iuno'], IUNO_BLOCKS);
    // Isolate S3's real contribution by diffing total damage with vs without the S3 block present.
    const withS3 = resolveHitComposedDps(IUNO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'aero', 'Sub DPS');
    const withoutS3Blocks = IUNO_BLOCKS.filter(b => b.id !== 'iuno.chain.s3');
    const stepsNoS3 = deriveStepsFromRotation(CHARACTER_ROTATIONS['Iuno'], withoutS3Blocks);
    const withoutS3 = resolveHitComposedDps(withoutS3Blocks, stepsNoS3, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'aero', 'Sub DPS');
    // Only Moonbow Basic ATK + Arc Beyond the Edge hits should have changed damage; the Ultimate hit's
    // own damage must be byte-identical with or without S3.
    const ultimateWith = withS3.hitLog.find(h => h.blockId === 'iuno.liberation.beneath-lunar-tides').damage;
    const ultimateWithout = withoutS3.hitLog.find(h => h.blockId === 'iuno.liberation.beneath-lunar-tides').damage;
    expect(ultimateWith).toBeCloseTo(ultimateWithout, 6);
    expect(withS3.totalDamage).toBeGreaterThan(withoutS3.totalDamage);
  });

  it('SKILL_MULTIPLIERS Outro note says 14s, not the stale 10s', () => {
    const outroRow = SKILL_MULTIPLIERS['Iuno'].find(r => r[0] === 'Outro');
    expect(outroRow[3]).toContain('14s');
    expect(outroRow[3]).not.toContain('for 10s');
  });
});
