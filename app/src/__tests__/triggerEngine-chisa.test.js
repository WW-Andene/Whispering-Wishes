import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { CHISA_BLOCKS } from '../engine/characterBlocks/chisa.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Chisa', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(CHISA_BLOCKS, 'Chisa');
  });

  it('S1/S3/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Chisa'];
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s1').effects[0].value).toBe(rc.s1.atkPct);
    const s3 = CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s3');
    expect(s3.effects.find(e => e.stat === 'libDmg').value).toBe(rc.s3.libDmg);
    expect(s3.effects.find(e => e.stat === 'totalMult').value).toBe(rc.s3.totalMult);
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    const s6 = CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s6');
    expect(s6.effects.find(e => e.stat === 'amplify').value).toBe(rc.s6.amplify);
    expect(s6.effects.find(e => e.stat === 'elemDmg').value).toBe(rc.s6.elemDmg);
  });

  // Found 2026-09-08 (full re-audit): chain.s3's libDmg:120 was UNSCOPED — libDmg is category-gated,
  // but that only means it reaches every libDmg-categorized block, not just the 3 moves S3's own kit
  // text names. It was silently also boosting Death Snip and the base Liberation ultimate hit itself,
  // neither of which S3's kit text mentions. Rescoped to the 2 real modeled moves, and added the 2nd
  // real effect (a further +120% to the Ring-of-Chainsaw consumption bonus specifically) that was
  // previously left entirely unmodeled.
  it("chain.s3's libDmg is scoped to only Sawring-Blitz/Eradication, not Death Snip or the base Liberation hit", () => {
    const s3 = CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s3');
    const libDmgEffect = s3.effects.find(e => e.stat === 'libDmg');
    expect(libDmgEffect.scopedToBlockId.sort()).toEqual(['chisa.forte.sawring-blitz-2-3', 'chisa.forte.sawring-eradication']);
    const totalMultEffect = s3.effects.find(e => e.stat === 'totalMult');
    expect(totalMultEffect.scopedToBlockId).toBe('chisa.forte.sawring-eradication-ring-scalar');
  });

  // Found 2026-09-08 (full re-audit): Woven Myriad - Convergence — Liberation's own BASE-KIT (not
  // chain-gated) +120% DMG Multiplier to Sawring-Blitz/Eradication, plus a further +120% to the
  // Ring-of-Chainsaw consumption bonus — was entirely unmodeled, with chisa.liberation.moment-of-
  // nihility's own note wrongly claiming Convergence had "no DPS component." This meant every
  // sequence level (not just S3+) was missing a real +120% multiplier on her single largest damage
  // category (Liberation, 84.5% of her rotation per the dump).
  it("Woven Myriad - Convergence (base kit) grants its own +120%/further-120% to the same 2 real moves, stacking additively with chain.s3's own copy", () => {
    const convergence = CHISA_BLOCKS.find(b => b.id === 'chisa.selfbuff.woven-myriad-convergence');
    expect(convergence.trigger).toEqual({ type: 'cast', on: 'Liberation:Moment of Nihility' });
    const libDmgEffect = convergence.effects.find(e => e.stat === 'libDmg');
    expect(libDmgEffect.value).toBe(120);
    expect(libDmgEffect.scopedToBlockId.sort()).toEqual(['chisa.forte.sawring-blitz-2-3', 'chisa.forte.sawring-eradication']);
    const totalMultEffect = convergence.effects.find(e => e.stat === 'totalMult');
    expect(totalMultEffect.value).toBe(120);
    expect(totalMultEffect.scopedToBlockId).toBe('chisa.forte.sawring-eradication-ring-scalar');
  });

  // Positive-verification test for the Convergence fix: proves Sawring-Eradication's real damage is
  // now higher even at S0 (no chain), since Convergence is base-kit and unconditional.
  it("Sawring-Eradication's real damage is higher with Woven Myriad - Convergence present, even at S0", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Chisa'], CHISA_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withConvergence = resolveHitComposedDps(CHISA_BLOCKS, steps, ctx, 3000, 'havoc', 'Healer');
    const withoutConvergenceBlocks = CHISA_BLOCKS.filter(b => b.id !== 'chisa.selfbuff.woven-myriad-convergence' && b.id !== 'chisa.chain.s3');
    const withoutConvergence = resolveHitComposedDps(withoutConvergenceBlocks, steps, ctx, 3000, 'havoc', 'Healer');
    const eradWith = withConvergence.hitLog.find(h => h.blockId === 'chisa.forte.sawring-eradication');
    const eradWithout = withoutConvergence.hitLog.find(h => h.blockId === 'chisa.forte.sawring-eradication');
    expect(eradWith.damage).toBeGreaterThan(eradWithout.damage);
  });

  it('S2 is split into its two real effects — allDmg matches RESONANCE_CHAIN_DATA, resShred is sourced beyond it', () => {
    const rc = RESONANCE_CHAIN_DATA['Chisa'];
    const alldmg = CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s2-alldmg');
    const resshred = CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s2-resshred');
    expect(alldmg.effects[0].value).toBe(rc.s2.allDmg);
    expect(resshred.effects[0].value).toBe(10);
    expect(resshred.kind).toBe('debuff');
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s2')).toBeUndefined();
  });

  it('S4 stays correctly unmodeled (no block) — Havoc Bane trigger-rate utility per its own audit comment', () => {
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s4')).toBeUndefined();
  });

  it('S1 is not defShred (a prior-version miscategorization) — it is atkPct', () => {
    const s1 = CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s1');
    expect(s1.effects[0].stat).toBe('atkPct');
  });

  it('Havoc Bane debuff models the real per-stack stacking mechanic (2 x6 = 12% cap)', () => {
    const hb = CHISA_BLOCKS.find(b => b.id === 'chisa.debuff.havoc-bane');
    expect(hb.effects[0].value * hb.effects[0].maxStacks).toBe(12);
    expect(hb.kind).toBe('debuff');
  });

  it('the Intro/Liberation self-buff (+20% Havoc DMG, 12s) matches CHAR_BUFF_TABLE.selfBuffs', () => {
    // Was asserting CHAR_BUFF_TABLE.selfBuffs was empty (a real gap vs. the engine, which already had
    // this buff) — fixed 2026-09-02 against a fresh the source dump, both now agree.
    const legacy = CHAR_BUFF_TABLE['Chisa'];
    expect(legacy.selfBuffs[0].value).toBe(20);
    expect(legacy.selfBuffs[0].duration).toBe(12);
    const self = CHISA_BLOCKS.find(b => b.id === 'chisa.selfbuff.reverberance-return');
    expect(self.effects[0].value).toBe(20);
    expect(self.timing.duration).toBe(12);
  });

  it('Thread of Bane debuff (defIgnore 18/30s) matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Chisa'];
    const tob = CHISA_BLOCKS.find(b => b.id === 'chisa.debuff.thread-of-bane');
    expect(tob.effects[0].value).toBe(legacy.debuffs[0].value);
    expect(tob.timing.duration).toBe(legacy.debuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Chisa'], CHISA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CHISA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'havoc', 'Healer');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('chisa.intro.reverberance-return')).toBe(true);
    expect(fired.has('chisa.liberation.moment-of-nihility')).toBe(true);
    expect(fired.has('chisa.forte.sawring-eradication')).toBe(true);
    // Phase A audit 2026-09-04: Rending Lunge (bug class f) and Death Snip (split off, bug class a)
    // both fire from the same combined Basic ATK rotation step.
    expect(fired.has('chisa.basic.stage2-rending-lunge')).toBe(true);
    expect(fired.has('chisa.basic.death-snip')).toBe(true);
  });

  it('the 3 Unseen-Snare-application blocks (S1/thread-of-bane/S6) fire off Serrated Loop\'s cast, the move actually used in the modeled rotation (bug class c fix)', () => {
    // hitLog only records 'damage'-kind blocks, so these buff/debuff blocks are checked via the
    // trigger engine's own firedTriggers set directly rather than hitLog.
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Chisa'], CHISA_BLOCKS);
    const castLabels = new Set(steps.map(s => s.type && s.skill ? `cast:${s.type}:${s.skill}` : null));
    expect(castLabels.has('cast:Skill:Serrated Loop')).toBe(true);
    expect(castLabels.has('cast:Skill:Eye of Unraveling')).toBe(false);
    for (const id of ['chisa.chain.s1', 'chisa.debuff.thread-of-bane', 'chisa.chain.s6']) {
      const b = CHISA_BLOCKS.find(x => x.id === id);
      expect(castLabels.has(`cast:${b.trigger.on}`)).toBe(true);
    }
  });

  it('Phase A audit 2026-09-04: every real sourced damage block carries a damage.category', () => {
    // bug class d — Sawring Blitz/Eradication/Serrated Loop/Intro were all uncategorized before this
    // pass despite being real, sourced damage.
    const damageBlocks = CHISA_BLOCKS.filter(b => b.kind === 'damage');
    for (const b of damageBlocks) {
      expect(b.damage.category, `${b.id} missing damage.category`).toBeTruthy();
    }
  });

  it('Death Snip and Sawring Blitz/Eradication are libDmg (kit text: "counted as Resonance Liberation DMG")', () => {
    // bug class a/d
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.basic.death-snip').damage.category).toBe('libDmg');
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.forte.sawring-blitz-2-3').damage.category).toBe('libDmg');
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.forte.sawring-eradication').damage.category).toBe('libDmg');
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.forte.sawring-eradication-ring-scalar').damage.category).toBe('libDmg');
  });

  it('Rending Lunge is real, sourced damage (was silently dropped — bug class f)', () => {
    const b = CHISA_BLOCKS.find(b => b.id === 'chisa.basic.stage2-rending-lunge');
    // Stage 2 (9.55+19.09+66.81=95.45) + Rending Lunge (15.11×4+90.66=151.10)
    const sum = b.damage.hits.reduce((s, h) => s + (h.atkPct || 0), 0);
    expect(sum).toBeCloseTo(95.45 + 151.10, 1);
  });
});
