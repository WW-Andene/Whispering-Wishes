import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { JIYAN_BLOCKS } from '../engine/characterBlocks/jiyan.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Jiyan', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(JIYAN_BLOCKS, 'Jiyan');
  });

  it('S1 stays correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Jiyan'];
    expect(rc.s1).toEqual({ totalMult: 0 });
    expect(JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s1')).toBeUndefined();
  });

  it('S2-S4/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Jiyan'];
    expect(JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s2').effects[0].value).toBe(rc.s2.atkPct);
    const s3 = JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s3');
    expect(s3.effects.find(e => e.stat === 'critRate').value).toBe(rc.s3.critRate);
    expect(s3.effects.find(e => e.stat === 'critDmg').value).toBe(rc.s3.critDmg);
    expect(JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s4').effects[0].value).toBe(rc.s4.heavyDmg);
    expect(JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s6').effects[0].value).toBe(rc.s6.totalMult);
  });

  it('S5 is split into its two real effects, the ATK stack matching RESONANCE_CHAIN_DATA at max stacks', () => {
    const rc = RESONANCE_CHAIN_DATA['Jiyan'];
    const mult = JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s5-outro-mult');
    const stack = JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s5-atk-stack');
    expect(mult.effects[0].value).toBe(rc.s5.totalMult);
    expect(stack.effects[0].value).toBe(rc.s5.atkPct);
  });

  // Found 2026-09-08 (full-kit audit): the ATK stack was `value:3, stacking:'stacking', maxStacks:15`
  // anchored to the Intro cast, which fires only ONCE in the modeled rotation — `activeCountAt()`
  // could never see more than 1 concurrent window, capping at 1/15 stacks (3% ATK) instead of the
  // real 45% the block's own OLD note already said was "instantly maxed after casting Tactical
  // Strike." Retargeted to a flat 45% (same fix pattern as Encore's chain.s1/s6).
  it("S5's ATK stack is a flat 45% (the real instant-max value), not the old under-firing 1/15-stack shape", () => {
    const stack = JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s5-atk-stack');
    expect(stack.effects[0].stacking).toBeUndefined();
    expect(stack.effects[0].maxStacks).toBeUndefined();

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jiyan'], JIYAN_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withStack = resolveHitComposedDps(JIYAN_BLOCKS, steps, ctx, 3000, 'aero', 'Main DPS', null, 5);
    const withoutStackBlocks = JIYAN_BLOCKS.filter(b => b.id !== 'jiyan.chain.s5-atk-stack');
    const withoutStack = resolveHitComposedDps(withoutStackBlocks, steps, ctx, 3000, 'aero', 'Main DPS', null, 5);
    // A real 45% ATK bonus should move total damage meaningfully more than the old bug's ~1.5%.
    const ratio = withStack.totalDamage / withoutStack.totalDamage;
    expect(ratio).toBeGreaterThan(1.1);
  });

  it('S4 is team-wide with a real 30s window', () => {
    const s4 = JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  // Fixed 2026-09-03: had no damage.category — the kit text explicitly calls this a "Coordinated
  // Attack", mapping directly to this schema's own coordDmg category.
  it('Outro Discipline is coordDmg-categorized', () => {
    const outro = JIYAN_BLOCKS.find(b => b.id === 'jiyan.outro.discipline');
    expect(outro.damage.category).toBe('coordDmg');
  });

  // Fixed 2026-09-03: S5's outro-mult block was trigger:{type:'swap-out'} with no timing.duration —
  // a new variant of the item-12 dead-buff architecture bug (any non-passive trigger with no duration
  // is invisible to statsAtInstant(), not just 'cast' specifically). Converted to passive +
  // scopedToBlockId so it actually fires.
  it("S5's Outro DMG Multiplier actually boosts Discipline's damage (was a dead no-op)", () => {
    const mult = JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s5-outro-mult');
    expect(mult.trigger.type).toBe('passive');
    expect(mult.effects[0].scopedToBlockId).toBe('jiyan.outro.discipline');

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jiyan'], JIYAN_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS5 = resolveHitComposedDps(JIYAN_BLOCKS, steps, ctx, 3000, 'aero', 'Main DPS', null, 5);
    const withoutS5Blocks = JIYAN_BLOCKS.filter(b => b.id !== 'jiyan.chain.s5-outro-mult');
    const withoutS5 = resolveHitComposedDps(withoutS5Blocks, steps, ctx, 3000, 'aero', 'Main DPS', null, 5);
    const outroHit = withS5.hitLog.find(h => h.blockId === 'jiyan.outro.discipline');
    const outroHitNoS5 = withoutS5.hitLog.find(h => h.blockId === 'jiyan.outro.discipline');
    expect(outroHit.damage).toBeGreaterThan(outroHitNoS5.damage);
  });

  // Found 2026-09-04 via a fresh, independent Phase A audit (REMAINING_WORK.md 1c): the prior
  // 2026-09-03 fix converted S6 to `trigger:{type:'passive'}` (correctly, to stop it being a dead
  // no-op) but left it WITHOUT `scopedToBlockId` — an unscoped passive totalMult effect applies to
  // EVERY hit block in the kit (resolveHitComposedDps.js only skips a hit when
  // `effect.scopedToBlockId && effect.scopedToBlockId !== hitBlockId`), so selecting S6 was silently
  // inflating Intro/Lance of Qingloong/Windqueller/Outro Discipline all by +240%, not just Finale's
  // own multiplier as the kit text requires. Same bug class as the Jinhsi element-scoping bug: an
  // effect meant for one named move leaking to the whole kit.
  it("S6's totalMult does NOT leak into other damage blocks (was leaking into the whole kit)", () => {
    const s6 = JIYAN_BLOCKS.find(b => b.id === 'jiyan.chain.s6');
    expect(s6.effects[0].scopedToBlockId).toBe('jiyan.forte.emerald-storm-finale');

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jiyan'], JIYAN_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS6 = resolveHitComposedDps(JIYAN_BLOCKS, steps, ctx, 3000, 'aero', 'Main DPS', null, 6);
    const withoutS6Blocks = JIYAN_BLOCKS.filter(b => b.id !== 'jiyan.chain.s6');
    const withoutS6 = resolveHitComposedDps(withoutS6Blocks, steps, ctx, 3000, 'aero', 'Main DPS', null, 6);
    // Since no jiyan.forte.emerald-storm-finale block exists (Finale is never cast in the real
    // rotation), the scoped-but-target-missing S6 effect should be fully inert — same total either way.
    expect(withS6.totalDamage).toBeCloseTo(withoutS6.totalDamage, 5);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jiyan'], JIYAN_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(JIYAN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'aero', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('jiyan.intro.tactical-strike')).toBe(true);
    expect(fired.has('jiyan.heavy.lance-of-qingloong')).toBe(true);
    expect(fired.has('jiyan.skill.windqueller')).toBe(true);
    expect(fired.has('jiyan.outro.discipline')).toBe(true);
  });

  // Found 2026-09-03 via a Phase A full-dimension audit (REMAINING_WORK.md 1c): dmgFocus wrongly
  // included 'Liberation' — his own dump's Damage Profile shows a genuine 0% Liberation share (both
  // Liberation-slot casts are "considered Heavy Attack DMG" per his own kit text, the same
  // no-true-libDmg pattern already found on Augusta), and no jiyan.blocks.js block is libDmg-
  // categorized at all. 'Skill' (8.9%, real, already correctly skillDmg-categorized) was missing.
  it("dmgFocus is ['Heavy ATK', 'Skill'] — not 'Liberation' (his real Liberation-slot damage is 0%, all counted as Heavy ATK)", () => {
    expect(CHARACTER_DATA['Jiyan'].dmgFocus).toEqual(expect.arrayContaining(['Heavy ATK', 'Skill']));
    expect(CHARACTER_DATA['Jiyan'].dmgFocus).not.toContain('Liberation');
  });

  it('no block in his kit is libDmg-categorized (confirms the dmgFocus fix)', () => {
    expect(JIYAN_BLOCKS.some(b => b.damage?.category === 'libDmg')).toBe(false);
  });

  // Added 2026-09-04 (Finale-modeling pass, REMAINING_WORK.md 1c): Emerald Storm: Finale now has a
  // real damage block, matching SKILL_MULTIPLIERS.Jiyan's 'Forte' row (142.91%×2+428.73%) and counted
  // as Heavy ATK DMG per the kit text ("considered Heavy Attack DMG").
  it('Emerald Storm: Finale is modeled as a real heavyDmg-categorized block matching SKILL_MULTIPLIERS', () => {
    const finale = JIYAN_BLOCKS.find(b => b.id === 'jiyan.forte.emerald-storm-finale');
    expect(finale).toBeDefined();
    expect(finale.damage.category).toBe('heavyDmg');
    // 142.91%×2 + 428.73% = three hits: two at 142.91 ATK%, one at 428.73 ATK%.
    expect(finale.damage.hits).toEqual([
      { atkPct: 142.91 }, { atkPct: 142.91 }, { atkPct: 428.73 },
    ]);
    expect(finale.trigger).toEqual({ type: 'cast', on: 'Forte:Emerald Storm: Finale' });
  });

  it('Finale is correctly NOT part of the real CHARACTER_ROTATIONS (Liberation fires as Prelude before Resolve reaches 30)', () => {
    const rotation = CHARACTER_ROTATIONS['Jiyan'];
    expect(rotation.some(s => s.skill === 'Emerald Storm: Finale')).toBe(false);
    expect(rotation.some(s => s.skill === 'Emerald Storm: Prelude')).toBe(true);
  });

  // S6's scoped totalMult now has a real target — proves the previously-inert scoping (see the S6 test
  // above) actually boosts Finale's own damage once Finale is cast, without leaking into the rest of
  // the kit (Intro/Lance of Qingloong/Windqueller/Outro Discipline totals stay identical with/without S6).
  it("S6's Momentum totalMult now boosts Finale's own damage (previously inert — no Finale block existed)", () => {
    const finaleRotation = [
      { type: 'Intro', skill: 'Tactical Strike' },
      { type: 'Forte', skill: 'Emerald Storm: Finale' },
    ];
    const steps = deriveStepsFromRotation(finaleRotation, JIYAN_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };

    const withS6 = resolveHitComposedDps(JIYAN_BLOCKS, steps, ctx, 3000, 'aero', 'Main DPS', null, 6);
    const withoutS6Blocks = JIYAN_BLOCKS.filter(b => b.id !== 'jiyan.chain.s6');
    const withoutS6 = resolveHitComposedDps(withoutS6Blocks, steps, ctx, 3000, 'aero', 'Main DPS', null, 6);

    const finaleHit = withS6.hitLog.find(h => h.blockId === 'jiyan.forte.emerald-storm-finale');
    const finaleHitNoS6 = withoutS6.hitLog.find(h => h.blockId === 'jiyan.forte.emerald-storm-finale');
    expect(finaleHit.damage).toBeGreaterThan(finaleHitNoS6.damage);

    const introHit = withS6.hitLog.find(h => h.blockId === 'jiyan.intro.tactical-strike');
    const introHitNoS6 = withoutS6.hitLog.find(h => h.blockId === 'jiyan.intro.tactical-strike');
    expect(introHit.damage).toBeCloseTo(introHitNoS6.damage, 5);
  });

  // Found 2026-09-08 (full-kit audit): BOTH Inherent Skills (Heavenly Balance, Tempest Taming) and
  // Minor Fortes were entirely missing from this file AND from CHAR_BUFF_TABLE['Jiyan'].selfBuffs
  // (previously empty) — a real, previously-missed completeness gap, unlike every other character
  // audited this session (Encore/Galbrena/Hiyuki/Iuno/Jianxin/Jinhsi all have a Minor Fortes block).
  it('Minor Fortes and both Inherent Skills (Heavenly Balance, Tempest Taming) are now present', () => {
    const legacy = CHAR_BUFF_TABLE['Jiyan'];
    expect(legacy.selfBuffs).toHaveLength(2);

    const mf = JIYAN_BLOCKS.find(b => b.id === 'jiyan.buff.minor-fortes');
    expect(mf.effects).toEqual([
      { stat: 'critRate', value: 8, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ]);

    const heavenlyBalance = JIYAN_BLOCKS.find(b => b.id === 'jiyan.inherent.heavenly-balance');
    expect(heavenlyBalance.trigger).toEqual({ type: 'cast', on: 'Intro:Tactical Strike' });
    expect(heavenlyBalance.timing.duration).toBe(15);
    expect(heavenlyBalance.effects[0]).toEqual({ stat: 'atkPct', value: 10, source: 'self-kit' });

    const tempestTaming = JIYAN_BLOCKS.find(b => b.id === 'jiyan.inherent.tempest-taming');
    expect(tempestTaming.effects[0]).toEqual({ stat: 'critDmg', value: 12, source: 'self-kit' });
  });

  it('Heavenly Balance and Tempest Taming both contribute real damage in the modeled rotation', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jiyan'], JIYAN_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withBoth = resolveHitComposedDps(JIYAN_BLOCKS, steps, ctx, 3000, 'aero', 'Main DPS');
    const inherentIds = new Set(['jiyan.inherent.heavenly-balance', 'jiyan.inherent.tempest-taming']);
    const withoutBoth = resolveHitComposedDps(JIYAN_BLOCKS.filter(b => !inherentIds.has(b.id)), steps, ctx, 3000, 'aero', 'Main DPS');
    expect(withBoth.totalDamage).toBeGreaterThan(withoutBoth.totalDamage);
  });

  // Found 2026-09-08 (full-kit completeness pass): 5 real, sourced SKILL_MULTIPLIERS rows (base Basic
  // ATK, standard Heavy ATK/Windborne Strike/Abyssal Slash, both Mid-air moves, Dodge Counter) had no
  // block anywhere in this file, unlike every other character's own completeness pass this session.
  it('the 5 previously-missing unused base-kit blocks are now present with correct categories', () => {
    const basic = JIYAN_BLOCKS.find(b => b.id === 'jiyan.basic.lone-lance');
    const heavy = JIYAN_BLOCKS.find(b => b.id === 'jiyan.heavy.standard');
    const midair1 = JIYAN_BLOCKS.find(b => b.id === 'jiyan.midair.plunging-attack');
    const midair2 = JIYAN_BLOCKS.find(b => b.id === 'jiyan.midair.banner-of-triumph');
    const dodge = JIYAN_BLOCKS.find(b => b.id === 'jiyan.dodgecounter.standard');
    expect(basic.damage.category).toBe('basicDmg');
    expect(heavy.damage.category).toBe('heavyDmg');
    expect(midair1).toBeDefined();
    expect(midair2).toBeDefined();
    expect(dodge).toBeDefined();
    // None of these should appear in the real modeled rotation's hit log.
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jiyan'], JIYAN_BLOCKS);
    const { hitLog } = resolveHitComposedDps(JIYAN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'aero', 'Main DPS');
    const fired = new Set(hitLog.map(h => h.blockId));
    for (const id of [basic.id, heavy.id, midair1.id, midair2.id, dodge.id]) {
      expect(fired.has(id)).toBe(false);
    }
  });
});
