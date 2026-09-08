import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Augusta', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(AUGUSTA_BLOCKS, 'Augusta');
  });

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

  // Fixed 2026-09-08: `stacking`/`maxStacks` is dead metadata on a `trigger.type: 'passive'` block in
  // every resolver path (resolveHitComposedDps.js's/resolveHitComposedTeamDps.js's `passiveBlocks` loop
  // and resolveSimulatedRotation.js's/resolveSimulatedTeamRotation.js's own passive branch all call
  // `applyEffects(block, 1, ...)` unconditionally — only a real duration-based buff block's window
  // history ever reads `stackingMode`/`maxStacks`). This test previously asserted the OLD, buggy
  // per-stack shape (value:15 × maxStacks:2), which silently delivered only 15/20 in the live engine
  // instead of the RESONANCE_CHAIN_DATA-confirmed 30/40 totals. Now asserts the corrected flat value.
  it('S1/S2 deliver the real confirmed 2-stack total, matching RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Augusta'];
    const s1 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s1');
    const s2 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s2');
    expect(s1.effects[0].value).toBe(rc.s1.critDmg);
    expect(s2.effects[0].value).toBe(rc.s2.critRate);
  });

  // Found 2026-09-08 (full redo re-audit, "redo everything" request): the kit text explicitly names
  // "Dodge Counter-Thunderoar: Backstep" and "Thunderoar: Uppercut" among S3's 7 real scoped moves,
  // and both have real blocks in this file — but were missing from S3's own scopedToBlockId list
  // (the note even wrongly claimed "Uppercut has no block"). Both are inert in the current modeled
  // rotation, but the scope is corrected for completeness/consistency with kit text.
  it("S3's scope includes ALL 7 real moves the kit text names, including the 2 currently-unused ones", () => {
    const s3 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s3');
    const scopedIds = s3.effects.map(e => e.scopedToBlockId).sort();
    expect(scopedIds).toEqual([
      'augusta.heavy.dodge-counter-thunderoar-backstep',
      'augusta.heavy.thunderoar-backstep',
      'augusta.heavy.thunderoar-backstep-spinslash-repeat',
      'augusta.heavy.thunderoar-spinslash',
      'augusta.heavy.thunderoar-uppercut',
      'augusta.liberation.everbright-protector',
      'augusta.liberation.sunborne',
      'augusta.skill.undying-sunlight-plunge',
    ].sort());
  });

  // Found 2026-09-08: the kit text says Thunder Rage triggers on "Thunderoar: Spinslash OR Thunderoar:
  // Uppercut" — Uppercut has its own real block but no matching Thunder Rage proc existed.
  it('Thunder Rage also has a real proc block for the Uppercut trigger (inert in the current rotation, but sourced)', () => {
    const b = AUGUSTA_BLOCKS.find(x => x.id === 'augusta.chain.s6-thunder-rage-uppercut');
    expect(b).toBeDefined();
    expect(b.trigger).toEqual({ type: 'cast', on: 'Heavy ATK:Thunderoar: Uppercut' });
    expect(b.damage.hits).toEqual([{ atkPct: 100 }, { atkPct: 100 }]);
  });

  // Found 2026-09-08: "Sublime is the Sun" (the state-transition cast, distinct from "Sword of Eternal
  // Oath") is a real, always-cast CHARACTER_ROTATIONS step with a real sourced 25s cooldown and no
  // block anywhere to hold it.
  it('Sublime is the Sun has a utility block carrying its real 25s cooldown', () => {
    const b = AUGUSTA_BLOCKS.find(x => x.id === 'augusta.liberation.sublime-is-the-sun');
    expect(b).toBeDefined();
    expect(b.kind).toBe('utility');
    expect(b.timing.cooldown).toBe(25);
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Augusta'], AUGUSTA_BLOCKS);
    const castLabels = new Set(steps.map(s => s.type && s.skill ? `cast:${s.type}:${s.skill}` : null));
    expect(castLabels.has(`cast:${b.trigger.on}`)).toBe(true);
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

  // Positive-verification test for the 2026-09-08 fix: proves the real numeric DPS effect of moving
  // S1/S2 off dead passive-stacking metadata (value:15/20 × unread maxStacks:2) onto the flat,
  // already-confirmed 2-stack total (30/40) — not just that the block's own `.value` field changed.
  it('S1 Crit DMG bonus actually reaches the engine\'s crit-avg damage math at its real 30% value', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Augusta'], AUGUSTA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS1 = resolveHitComposedDps(AUGUSTA_BLOCKS, steps, ctx, 3500, 'electro', 'Main DPS', null, 1);
    const withoutS1Blocks = AUGUSTA_BLOCKS.filter(b => b.id !== 'augusta.chain.s1');
    const withoutS1 = resolveHitComposedDps(withoutS1Blocks, steps, ctx, 3500, 'electro', 'Main DPS', null, 1);
    // Real, measured damage increase from S1 being present — confirms the 30% Crit DMG value is not
    // a dead/inert field, it genuinely reaches the crit-average multiplier used on every hit.
    expect(withS1.totalDamage).toBeGreaterThan(withoutS1.totalDamage);
    // Reverting to the old buggy per-stack shape (flat 15 instead of 30) would have produced roughly
    // HALF this block's real contribution to the crit-avg multiplier — sanity-check the fixed value
    // itself rather than just its presence.
    const s1 = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s1');
    expect(s1.effects[0].value).toBe(30);
  });
});
