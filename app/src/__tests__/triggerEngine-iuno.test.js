import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, SKILL_MULTIPLIERS } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { IUNO_BLOCKS } from '../engine/characterBlocks/iuno.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Iuno', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(IUNO_BLOCKS, 'Iuno');
  });

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

  // Found 2026-09-08 (full-kit re-audit): S1 ("ATK +40% while in Lunar Cycle") was a bare
  // `trigger:{type:'passive'}`, unconditionally active for her ENTIRE kit including her real
  // pre-Lunar-Cycle Intro hit (CHARACTER_ROTATIONS['Iuno'] casts Intro BEFORE the Liberation cast that
  // starts Lunar Cycle) — the same "unenforced condition on a real pre-condition period" bug class
  // already found on Camellya/Danjin/Denia/Galbrena this session. Measured directly: removing the
  // block dropped Intro's own damage by exactly the 1/1.4 ATK-scaling ratio (~26%), confirming Intro
  // was wrongly receiving the Lunar-Cycle-only buff. Retargeted to a cast-anchored window on the real
  // Liberation cast that starts Lunar Cycle in her modeled rotation.
  it("S1 is a real cast-anchored window starting on Beneath Lunar Tides, not an unconditional passive that leaked onto the pre-Lunar-Cycle Intro hit", () => {
    const s1 = IUNO_BLOCKS.find(b => b.id === 'iuno.chain.s1');
    expect(s1.trigger).toEqual({ type: 'cast', on: 'Liberation:Beneath Lunar Tides' });
    expect(s1.timing.duration).toBe(99);
  });

  it("S1's +40% ATK no longer inflates her pre-Lunar-Cycle Intro hit, but boosts hits after Beneath Lunar Tides is cast", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Iuno'], IUNO_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS1 = resolveHitComposedDps(IUNO_BLOCKS, steps, ctx, 3000, 'aero', 'Sub DPS');
    const withoutS1Blocks = IUNO_BLOCKS.filter(b => b.id !== 'iuno.chain.s1');
    const withoutS1 = resolveHitComposedDps(withoutS1Blocks, steps, ctx, 3000, 'aero', 'Sub DPS');
    const introWith = withS1.hitLog.find(h => h.blockId === 'iuno.intro.illuminated-manifestation');
    const introWithout = withoutS1.hitLog.find(h => h.blockId === 'iuno.intro.illuminated-manifestation');
    expect(introWith.damage).toBeCloseTo(introWithout.damage, 5);
    const heavyWith = withS1.hitLog.find(h => h.blockId === 'iuno.heavy.absolute-fullness');
    const heavyWithout = withoutS1.hitLog.find(h => h.blockId === 'iuno.heavy.absolute-fullness');
    expect(heavyWith.damage).toBeGreaterThan(heavyWithout.damage);
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
    expect(s6.effects[0]).toEqual({ stat: 'libDmg', value: 1600, source: 'self-kit' });
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
    // Split 2026-09-08 (full-kit re-audit) into 2 real cast-anchored flat-value blocks (Intro +
    // Liberation, each granting the real 5-stack/20% Derivation grant per the dump's own "Intro +5/
    // Ultimate +5" breakdown) — see iuno.blocks.js's own header comment for why the old single
    // Liberation-anchored `stacking:'stacking'` block only ever delivered 1/10 of the real total.
    const introGrant = IUNO_BLOCKS.find(b => b.id === 'iuno.selfbuff.blessing-of-the-wan-light-intro');
    const libGrant = IUNO_BLOCKS.find(b => b.id === 'iuno.selfbuff.blessing-of-the-wan-light-liberation');
    expect(introGrant.effects[0].value + libGrant.effects[0].value).toBe(legacy.selfBuffs[0].value);
  });

  // Found 2026-09-08 (full-kit re-audit): the old single-block Blessing of the Wan Light modeling
  // (Liberation-anchored, `stacking:'stacking', maxStacks:10, value:4`) could never exceed 1 real
  // trigger event's worth of stacks (4%, 1/10 of the real 40% cap), since only ONE cast
  // (Liberation) ever fired in the modeled rotation. Positive-verification test for the fix: proves
  // the pre-Intro state has none of this buff, and the post-both-casts state carries the full 40%.
  it("Blessing of the Wan Light reaches the real 40% total only after BOTH Intro and Liberation have cast, not capped at 1/10 of that from a single under-firing anchor", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Iuno'], IUNO_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withBlessing = resolveHitComposedDps(IUNO_BLOCKS, steps, ctx, 3000, 'aero', 'Sub DPS');
    const blessingIds = new Set(['iuno.selfbuff.blessing-of-the-wan-light-intro', 'iuno.selfbuff.blessing-of-the-wan-light-liberation']);
    const withoutBlessing = resolveHitComposedDps(IUNO_BLOCKS.filter(b => !blessingIds.has(b.id)), steps, ctx, 3000, 'aero', 'Sub DPS');
    expect(withBlessing.totalDamage).toBeGreaterThan(withoutBlessing.totalDamage);
    // allDmg is an amplify-shaped stat (multiplicative on top of dmgBonus) — a real 40% All DMG Amp
    // should produce a meaningfully larger uplift than the old bug's ~1.5% (1/10-stack) contribution.
    const ratio = withBlessing.totalDamage / withoutBlessing.totalDamage;
    expect(ratio).toBeGreaterThan(1.1);
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

  // Added (Iuno Enhanced Moonbow sweep): Moonbow Basic ATK/Arc Beyond the Edge were previously using
  // their BASE (Sentience = 0) values under a claim of "state-gated, no home in this schema" — wrong.
  // The dump's own text says the enhancement is a binary gate (any nonzero Sentience), and her real
  // modeled rotation's Sentience math keeps it nonzero for the whole combo, so the Enhanced values
  // (a straightforward, already-sourced number swap) are what actually fire.
  it('Moonbow Basic ATK and Arc Beyond the Edge use the real Sentience-enhanced values, not the base ones', () => {
    const moonbow = IUNO_BLOCKS.find(b => b.id === 'iuno.basic.moonbow');
    expect(moonbow.damage.hits[0].atkPct).toBeCloseTo(205.97, 2);
    const abe = IUNO_BLOCKS.find(b => b.id === 'iuno.skill.arc-beyond-the-edge');
    expect(abe.damage.hits[0].atkPct).toBeCloseTo(319.19, 2);
    expect(SKILL_MULTIPLIERS['Iuno'].some(r => r[1] === 'Enhanced Moonbow 1-3')).toBe(true);
    expect(SKILL_MULTIPLIERS['Iuno'].some(r => r[1] === 'Enhanced Arc Beyond the Edge')).toBe(true);
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
    // '319.19%×2' (Enhanced Arc Beyond the Edge) is 2 sub-hits per cast — 2 casts × 2 sub-hits = 4 logged hits.
    expect(abeHitCount).toBe(4);
  });

  // Bug fixed 2026-09-04 (Phase A audit): S3's kit text names exactly 3 moves (Moonbow Basic ATK / Arc
  // Beyond the Edge / Moonbow Dodge Counter), but 'libDmg' is a damage-CATEGORY stat — several other
  // real blocks (the Ultimate, Flux: Moonbow, Absolute Fullness) also carry category:'libDmg' despite
  // not being named by S3's text at all. A bare (unscoped) libDmg:65 effect silently amplified those
  // too — the same category-leak shape the critical totalMult fact describes, via the category-stat
  // pool instead of totalMult. Verifies S3 now only touches the 2 blocks its own kit text names.
  // Found 2026-09-08 (full-kit re-audit): the 2026-09-07 completeness pass added
  // iuno.dodgecounter.moonbow-dodge-counter (a real block for the 3rd move S3's own kit text names)
  // but never updated this scoping list — fixed to include all 3 named moves now that all 3 have blocks.
  it('S3 (+65% Amp) is scoped to all 3 named moves (Moonbow Basic ATK, Arc Beyond the Edge, Moonbow Dodge Counter) — does not leak onto the Ultimate/Flux/Absolute Fullness', () => {
    const s3 = IUNO_BLOCKS.find(b => b.id === 'iuno.chain.s3');
    const scopedIds = s3.effects.map(e => e.scopedToBlockId);
    expect(scopedIds.sort()).toEqual(['iuno.basic.moonbow', 'iuno.dodgecounter.moonbow-dodge-counter', 'iuno.skill.arc-beyond-the-edge'].sort());
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
