import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';

describe('triggerEngine parity — Augusta', () => {
  // Fixed 2026-09-02 against a fresh the source dump: S3's totalMult:25 was a single UNSCOPED effect — a
  // prior session's note claimed this was safe since "her only Heavy ATK hits anyway," but totalMult
  // applies unconditionally to every hit regardless of category, so it was over-crediting her skillDmg
  // hits (Warrior's Blade, Undying Sunlight: Strike/Leap) and Intro too — none of which S3's real kit
  // text lists. Scoped via scopedToBlockId to exactly the 6 real moves named in the kit text.
  it("S3's +25% only applies to its real named moves, not her whole kit", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Augusta'], AUGUSTA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS3 = resolveHitComposedDps(AUGUSTA_BLOCKS, steps, ctx, 3000, 'electro', 'Main DPS', null, 3);
    const skillHit = withS3.hitLog.find(h => h.blockId === "augusta.skill.warriors-blade");
    const introHit = withS3.hitLog.find(h => h.blockId === 'augusta.intro.stride-of-goldenflare');
    const backstepHit = withS3.hitLog.find(h => h.blockId === 'augusta.heavy.thunderoar-backstep');

    const withoutS3Blocks = AUGUSTA_BLOCKS.filter(b => b.id !== 'augusta.chain.s3');
    const withoutS3 = resolveHitComposedDps(withoutS3Blocks, steps, ctx, 3000, 'electro', 'Main DPS', null, 3);
    const skillHitNoS3 = withoutS3.hitLog.find(h => h.blockId === "augusta.skill.warriors-blade");
    const introHitNoS3 = withoutS3.hitLog.find(h => h.blockId === 'augusta.intro.stride-of-goldenflare');
    const backstepHitNoS3 = withoutS3.hitLog.find(h => h.blockId === 'augusta.heavy.thunderoar-backstep');

    // Named moves DO get boosted by S3.
    expect(backstepHit.damage).toBeGreaterThan(backstepHitNoS3.damage);
    // Un-named moves must NOT be boosted by S3.
    expect(skillHit.damage).toBeCloseTo(skillHitNoS3.damage, 5);
    expect(introHit.damage).toBeCloseTo(introHitNoS3.damage, 5);
  });

  // Fixed 2026-09-02: the dump's own row label ("Skill Damage", not "Stride of Goldenflare DMG")
  // confirms this is plain Resonance Skill DMG — was previously left uncategorized.
  it('Intro (Stride of Goldenflare) is skillDmg-categorized', () => {
    const block = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.intro.stride-of-goldenflare');
    expect(block.damage.category).toBe('skillDmg');
  });

  it('S1/S2 model the real per-stack mechanics, matching RESONANCE_CHAIN_DATA at max stacks', () => {
    const rc = RESONANCE_CHAIN_DATA['Augusta'];
    const s1 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s1');
    const s2 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s2');
    expect(s1.effects[0].value * s1.effects[0].maxStacks).toBe(rc.s1.critDmg);
    expect(s2.effects[0].value * s2.effects[0].maxStacks).toBe(rc.s2.critRate);
  });

  it('S3/S4 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Augusta'];
    expect(AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s3').effects[0].value).toBe(rc.s3.totalMult);
    expect(AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s4-ascent-in-sun-and-glory').effects[0].value).toBe(rc.s4.atkPct);
  });

  // S5 (Glory's Favor shield value +50%) has zero DPS component — a purely defensive stat, no basis
  // for any damage number. Zeroed 2026-09-02 in both RESONANCE_CHAIN_DATA and this engine block (was
  // a fabricated totalMult:15 "approximate DPS-uptime proxy" in both, the exact "invented number with
  // no basis" shape this codebase's own rule removes elsewhere, e.g. Brant's S1/Phrolova's S5).
  it('S5 has no DPS component in either RESONANCE_CHAIN_DATA or the engine block', () => {
    const rc = RESONANCE_CHAIN_DATA['Augusta'];
    expect(rc.s5).toEqual({});
    const s5 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s5');
    expect(s5.effects).toEqual([]);
  });

  it('S4 is team-wide with a real 30s window', () => {
    const s4 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s4-ascent-in-sun-and-glory');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('S6 is modeled as a real 2x100%-ATK Thunder Rage proc block, not the flat heavyDmg:200 approximation', () => {
    const rc = RESONANCE_CHAIN_DATA['Augusta'];
    expect(rc.s6).toEqual({ heavyDmg: 200 });
    expect(AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s6')).toBeUndefined();
    const s6 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s6-thunder-rage');
    expect(s6.kind).toBe('damage');
    expect(s6.damage.hits).toEqual([{ atkPct: 100 }, { atkPct: 100 }]);
  });

  it('outro and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Augusta'];
    const outro = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.outro.battlesong');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const self = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.selfbuff.crown-of-wills-base');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Augusta'], AUGUSTA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(AUGUSTA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'electro', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('augusta.intro.stride-of-goldenflare')).toBe(true);
    expect(fired.has('augusta.liberation.sword-of-eternal-oath')).toBe(true);
    expect(fired.has('augusta.liberation.everbright-protector')).toBe(true);
    expect(fired.has('augusta.chain.s6-thunder-rage')).toBe(true);
  });

  // Found during a from-scratch Phase A redo (2026-09-04): CHARACTER_ROTATIONS['Augusta'] casts
  // Thunderoar: Spinslash TWICE per real rotation (once as its own step, once inside the combined
  // 'Thunderoar: Backstep → Spinslash' repeat step) — the kit's own S6 text ("Casting Thunderoar:
  // Spinslash or Thunderoar: Uppercut ALSO triggers Thunder Rage") has no once-per-rotation cap, only
  // a separate 1s Crown-of-Wills-stack ICD that doesn't gate the Thunder Rage hits themselves. The
  // engine's trigger-key matching is exact-label, so a single `augusta.chain.s6-thunder-rage` block
  // (trigger.on: 'Heavy ATK:Thunderoar: Spinslash') only ever matched the FIRST cast, silently
  // dropping the second Thunder Rage proc — fixed by adding augusta.chain.s6-thunder-rage-repeat,
  // triggered on the repeat step's own distinct label.
  it('Thunder Rage (S6) fires on BOTH real Spinslash casts in the rotation, not just the first', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Augusta'], AUGUSTA_BLOCKS);
    const { hitLog } = resolveHitComposedDps(AUGUSTA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'electro', 'Main DPS', null, 6);
    const firstProc = hitLog.filter(h => h.blockId === 'augusta.chain.s6-thunder-rage');
    const secondProc = hitLog.filter(h => h.blockId === 'augusta.chain.s6-thunder-rage-repeat');
    // Each block carries 2 hits of its own (the 2 separate 100%-ATK Thunder Rage instances).
    expect(firstProc.length).toBe(2);
    expect(secondProc.length).toBe(2);
    // The two procs land at different simulated times — genuinely two separate casts, not a duplicate.
    expect(firstProc[0].time).not.toBe(secondProc[0].time);
  });
});
