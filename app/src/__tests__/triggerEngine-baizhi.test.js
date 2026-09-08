import { describe, it, expect } from 'vitest';
import { createStats, applyResonanceChain } from '../features/teams/calcEngine.js';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { BAIZHI_BLOCKS } from '../engine/characterBlocks/baizhi.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Baizhi', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(BAIZHI_BLOCKS, 'Baizhi');
  });

  it('S1/S3/S4/S5 stay zeroed (no fabricated DPS component) in both the block set and the flat table', () => {
    const rc = RESONANCE_CHAIN_DATA['Baizhi'];
    expect(rc.s1).toEqual({});
    expect(rc.s3).toEqual({});
    expect(rc.s4).toEqual({});
    expect(rc.s5).toEqual({});
    ['baizhi.chain.s1', 'baizhi.chain.s3', 'baizhi.chain.s4', 'baizhi.chain.s5'].forEach(id => {
      expect(BAIZHI_BLOCKS.find(b => b.id === id)).toBeUndefined(); // no block created at all for these — correctly not fabricated
    });
  });

  // Fixed 2026-09-08 (full re-audit): both were `trigger:{type:'passive'}` with a real `timing.duration`
  // set, which every resolver path silently ignores for a passive-trigger block (unconditionally,
  // permanently active instead of a real time-limited window) — re-anchored to the real
  // 'Skill:Emergency Plan' cast that's their actual sourced trigger event.
  it('S2/S6 elemDmg values match RESONANCE_CHAIN_DATA exactly and are real cast-anchored windows, not dead passive-duration', () => {
    const rc = RESONANCE_CHAIN_DATA['Baizhi'];
    const s2 = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.chain.s2');
    const s6 = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.chain.s6');
    expect(s2.effects[0].value).toBe(rc.s2.elemDmg);
    expect(s6.effects[0].value).toBe(rc.s6.elemDmg);
    expect(s6.target.scope).toBe('whole-team'); // per its own real mechanic ("all nearby characters"), not self
    expect(s2.trigger).toEqual({ type: 'cast', on: 'Skill:Emergency Plan' });
    expect(s6.trigger).toEqual({ type: 'cast', on: 'Skill:Emergency Plan' });
    expect(s2.timing.duration).toBe(12);
    expect(s6.timing.duration).toBe(20);
  });

  // Fixed 2026-09-08 (full re-audit): the Euphonia ATK buff had TWO real bugs — target.scope was
  // 'whole-team' (CHAR_BUFF_TABLE's own libBuffs entry likewise said target:'team') despite the kit
  // text being explicit and singular ("the Resonator who picks it up gets ATK+15%"), and the block's
  // trigger was dead `passive` + duration (see S2/S6 fix above, same bug). Both fixed at the root:
  // CHAR_BUFF_TABLE['Baizhi'].libBuffs now stores target:'next', and the block now uses a real
  // cast-anchored window with target.scope 'next-on-field'.
  it('Rejuvinating Flow outro buff and Euphonia ATK libBuff match CHAR_BUFF_TABLE, single-recipient not team-wide', () => {
    const legacy = CHAR_BUFF_TABLE['Baizhi'];
    const outroBlock = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.outro.rejuvinating-flow');
    const libBlock = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.libbuff.euphonia-atk');
    expect(outroBlock.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outroBlock.timing.duration).toBe(legacy.outroBuffs[0].duration);
    expect(legacy.libBuffs[0].target).toBe('next');
    expect(libBlock.effects[0].value).toBe(legacy.libBuffs[0].value);
    expect(libBlock.timing.duration).toBe(legacy.libBuffs[0].duration);
    expect(libBlock.target.scope).toBe('next-on-field');
    expect(libBlock.trigger).toEqual({ type: 'cast', on: 'Skill:Emergency Plan' });
  });

  // Found 2026-09-08 (full redo re-audit, direct user request): CHARACTER_DATA['Baizhi'].statScaling
  // is 'HP' (cross-checked against her own dump: her bestWeapon, Stellar Symphony, is Shorekeeper's
  // signature — another confirmed HP-scaler; her Substat priority never mentions ATK at all, only
  // HP%; and her base ATK, 213, is even lower than Shorekeeper's own 288 "dump stat" ATK) — but EVERY
  // damage block in baizhi.blocks.js used basis:'ATK'. Fixed to basis:'HP' throughout (same class of
  // fix already applied to Cartethyia's own HP-scaling kit). baseStats below updated from a plain
  // ATK number to {hp: ...} to match.
  it('every real damage block uses basis:HP, matching her real HP-scaling kit (statScaling: HP)', () => {
    const damageBlocks = BAIZHI_BLOCKS.filter(b => b.kind === 'damage');
    expect(damageBlocks.length).toBeGreaterThan(0);
    damageBlocks.forEach(b => expect(b.damage.basis).toBe('HP'));
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total, including her Basic ATK combo', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Baizhi'], BAIZHI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(BAIZHI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { hp: 20000 }, 'glacio', 'Healer');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('baizhi.intro.overflowing-frost')).toBe(true);
    expect(fired.has('baizhi.liberation.momentary-union')).toBe(true);
    expect(fired.has('baizhi.skill.emergency-plan')).toBe(true);
    expect(fired.has('baizhi.heavy.destined-promise-channel')).toBe(true);
    // Added 2026-09-08: her 4-stage Basic Attack combo previously had no block AND no
    // CHARACTER_ROTATIONS step at all, despite being a real, necessary part of her rotation (builds
    // Concentration toward Emergency Plan) — the dump's own rotation text names it explicitly.
    expect(fired.has('baizhi.basic.destined-promise')).toBe(true);
  });

  // Added 2026-09-08 (full re-audit): proves the S2/chain buff is no longer permanently active —
  // before this fix, a `trigger:'passive'` block with `timing.duration:12` was silently 100% uptime
  // for the WHOLE rotation regardless of the real 12s window; now it should only be active for a
  // bounded stretch following the Emergency Plan cast, not the entire simulated timeline.
  it("S2's Glacio DMG buff is genuinely time-windowed, not silently permanent", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Baizhi'], BAIZHI_BLOCKS);
    const withS2 = resolveHitComposedDps(BAIZHI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { hp: 20000 }, 'glacio', 'Healer', null, 2);
    const withoutS2Blocks = BAIZHI_BLOCKS.filter(b => b.id !== 'baizhi.chain.s2');
    const withoutS2 = resolveHitComposedDps(withoutS2Blocks, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { hp: 20000 }, 'glacio', 'Healer', null, 2);
    // A hit that happens BEFORE Emergency Plan is ever cast (her Intro) must be unaffected by S2 —
    // proof the buff has a real start time, not just an eventual end time.
    const introWithS2 = withS2.hitLog.find(h => h.blockId === 'baizhi.intro.overflowing-frost');
    const introWithoutS2 = withoutS2.hitLog.find(h => h.blockId === 'baizhi.intro.overflowing-frost');
    expect(introWithS2.damage).toBeCloseTo(introWithoutS2.damage, 5);
    // A hit that happens AFTER Emergency Plan (Liberation, later in the modeled rotation) must be
    // boosted by it, proving the window is real once it starts.
    const libWithS2 = withS2.hitLog.find(h => h.blockId === 'baizhi.liberation.momentary-union');
    const libWithoutS2 = withoutS2.hitLog.find(h => h.blockId === 'baizhi.liberation.momentary-union');
    expect(libWithS2.damage).toBeGreaterThan(libWithoutS2.damage);
  });

  it("Intro (Overflowing Frost) is skillDmg-categorized (was uncategorized) — dump's own multiplier row is labeled generically \"Skill Damage\"", () => {
    const intro = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.intro.overflowing-frost');
    expect(intro.damage.category).toBe('skillDmg');
  });

  // Fixed 2026-09-08 (full re-audit): gained 'Basic ATK' — her 4-stage combo now has a real block and
  // rotation step (see above), so without this her real Basic ATK damage would silently reject any
  // teammate's Basic ATK DMG Bonus buff, same bug class as the 2026-09-03 Liberation/Heavy ATK fix.
  it("dmgFocus gains 'Basic ATK'/'Liberation'/'Heavy ATK' — all correctly categorized real blocks firing in her real rotation", () => {
    expect(CHARACTER_DATA['Baizhi'].dmgFocus).toEqual(['Basic ATK', 'Skill', 'Liberation', 'Heavy ATK']);
  });

  // Added 2026-09-08 (full re-audit): Mid-air Attack/Dodge Counter are real, sourced moves
  // (SKILL_MULTIPLIERS['Baizhi']) with no CHARACTER_ROTATIONS step — present but inert, same
  // "documented gap" convention as other characters' own unused-but-real moves.
  it('Mid-air Attack and Dodge Counter are present and sourced but inert (not in CHARACTER_ROTATIONS)', () => {
    const midair = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.midair.attack');
    const dodge = BAIZHI_BLOCKS.find(b => b.id === 'baizhi.dodge.counter');
    expect(midair.damage.hits).toEqual([{ atkPct: 78.89 }]);
    expect(dodge.damage.hits).toEqual([{ atkPct: 178.65 }]);
    const rotationLabels = new Set(CHARACTER_ROTATIONS['Baizhi'].map(s => `${s.type}:${s.skill}`));
    expect(rotationLabels.has(midair.trigger.on)).toBe(false);
    expect(rotationLabels.has(dodge.trigger.on)).toBe(false);
  });
});
