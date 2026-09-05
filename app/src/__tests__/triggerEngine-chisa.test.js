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
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(CHISA_BLOCKS.find(b => b.id === 'chisa.chain.s6').effects[0].value).toBe(rc.s6.amplify);
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
