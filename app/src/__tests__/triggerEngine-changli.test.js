import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CHANGLI_BLOCKS } from '../engine/characterBlocks/changli.blocks.js';

describe('triggerEngine parity — Changli', () => {
  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Changli'];
    const s1 = CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s1');
    expect(s1.effects.find(e => e.stat === 'skillDmg').value).toBe(rc.s1.skillDmg);
    expect(s1.effects.find(e => e.stat === 'heavyDmg').value).toBe(rc.s1.heavyDmg);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s2').effects[0].value).toBe(rc.s2.critRate);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s5-heavydmg').effects[0].value).toBe(rc.s5.heavyDmg);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s5-totalmult').effects[0].value).toBe(rc.s5.totalMult);
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s6').effects[0].value).toBe(rc.s6.defIgnore);
  });

  it('S4 is team-wide with the real audit-confirmed 30s window', () => {
    const s4 = CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('S2 is a short 8s Crit Rate window, not a flat passive', () => {
    const s2 = CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s2');
    expect(s2.timing.duration).toBe(8);
  });

  it('outro and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Changli'];
    const outro = CHANGLI_BLOCKS.find(b => b.id === 'changli.outro.strategy-of-duality');
    expect(outro.effects.find(e => e.stat === 'elemDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'libDmg').value).toBe(legacy.outroBuffs[1].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const self = CHANGLI_BLOCKS.find(b => b.id === 'changli.selfbuff.fiery-feather');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(self.timing.duration).toBe(legacy.selfBuffs[0].duration);
    // Retrofitted 2026-09-03 (REMAINING_WORK.md 1a): now actually clamps to the incoming Resonator's
    // own swap-out instant when shorter than the nominal 10s — see forfeitOnRecipientSwapOut.test.js
    // for the mechanism's own proof.
    expect(outro.timing.forfeitOnRecipientSwapOut).toBe(true);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Changli'], CHANGLI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CHANGLI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'fusion', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('changli.intro.obedience-of-rules')).toBe(true);
    expect(fired.has('changli.liberation.radiance-of-fealty')).toBe(true);
    expect(fired.has('changli.forte.flaming-sacrifice')).toBe(true);
    expect(fired.has('changli.heavy.standard')).toBe(true);
  });

  it("Sweeping Force (Inherent Skill, added 2026-09-04, dimension 8: was entirely unmodeled) grants Fusion DMG +20% and DEF Ignore +15%, scoped to BOTH real Forte Heavy casts + Liberation (fixed same day — was unscoped, over-crediting 100% of her damage since elemDmg/defIgnore aren't category-gated)", () => {
    const forte = CHANGLI_BLOCKS.find(b => b.id === 'changli.inherent.sweeping-force-forte');
    const forteScopes = new Set(forte.effects.map(e => e.scopedToBlockId));
    expect(forteScopes).toEqual(new Set(['changli.forte.flaming-sacrifice', 'changli.forte.flaming-sacrifice-2']));
    expect(forte.effects.filter(e => e.stat === 'elemDmg').every(e => e.value === 20)).toBe(true);
    expect(forte.effects.filter(e => e.stat === 'defIgnore').every(e => e.value === 15)).toBe(true);
    const lib = CHANGLI_BLOCKS.find(b => b.id === 'changli.inherent.sweeping-force-liberation');
    expect(lib.effects.every(e => e.scopedToBlockId === 'changli.liberation.radiance-of-fealty')).toBe(true);
    expect(lib.effects.find(e => e.stat === 'elemDmg').value).toBe(20);
    expect(lib.effects.find(e => e.stat === 'defIgnore').value).toBe(15);
  });

  it('full re-segmentation pass (2026-09-04): Intro and Heavy ATK now have real damage.category (were both uncategorized, silently rejecting teammate skillDmg/heavyDmg buffs)', () => {
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.intro.obedience-of-rules').damage.category).toBe('skillDmg');
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.heavy.standard').damage.category).toBe('heavyDmg');
  });

  it('Mid-air Attack Stage 1-4 (added 2026-09-04, previously entirely absent) fires as a real basicDmg block', () => {
    const midair = CHANGLI_BLOCKS.find(b => b.id === 'changli.basic.mid-air-attack');
    expect(midair.damage.category).toBe('basicDmg');
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Changli'], CHANGLI_BLOCKS);
    const { hitLog } = resolveHitComposedDps(CHANGLI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'fusion', 'Main DPS');
    expect(hitLog.some(h => h.blockId === 'changli.basic.mid-air-attack')).toBe(true);
  });

  it('Skill (True Sight: Capture) and Forte Heavy (Flaming Sacrifice) each fire TWICE per rotation (added 2026-09-04 — the real cycle casts both twice, only 1 of each was ever credited before)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Changli'], CHANGLI_BLOCKS);
    const { hitLog } = resolveHitComposedDps(CHANGLI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'fusion', 'Main DPS');
    expect(hitLog.filter(h => h.blockId === 'changli.skill.true-sight-capture' || h.blockId === 'changli.skill.true-sight-capture-2')).toHaveLength(8); // 2 casts × 4 hits each
    expect(hitLog.filter(h => h.blockId === 'changli.forte.flaming-sacrifice' || h.blockId === 'changli.forte.flaming-sacrifice-2')).toHaveLength(12); // 2 casts × 6 hits each
  });

  it("Fiery Feather is scoped to ONLY the 2nd (post-Ultimate) Flaming Sacrifice cast, not the 1st — the real Enflamement-consuming cast that lands before Liberation isn't the one Fiery Feather buffs", () => {
    const fiery = CHANGLI_BLOCKS.find(b => b.id === 'changli.selfbuff.fiery-feather');
    expect(fiery.effects[0].scopedToBlockId).toBe('changli.forte.flaming-sacrifice-2');
  });

  it('S1 and S6 are scoped to the exact real Tripartite Flames/Flaming Sacrifice/Liberation block ids, not an unscoped passive (fixed 2026-09-04: Intro gaining its own skillDmg category this same pass would have made an unscoped S1 leak onto it)', () => {
    const s1 = CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s1');
    expect(s1.effects.some(e => e.scopedToBlockId === 'changli.intro.obedience-of-rules')).toBe(false);
    expect(s1.effects.filter(e => e.stat === 'skillDmg')).toHaveLength(6); // Capture×2, Charge×3, Conquest×1
    expect(s1.effects.filter(e => e.stat === 'heavyDmg')).toHaveLength(2); // Flaming Sacrifice×2
    const s6 = CHANGLI_BLOCKS.find(b => b.id === 'changli.chain.s6');
    expect(s6.effects).toHaveLength(9); // 6 Tripartite Flames + 2 Flaming Sacrifice + 1 Liberation
    expect(s6.effects.every(e => e.value === 40 && e.stat === 'defIgnore')).toBe(true);
  });

  it('True Sight: Conquest/Charge (added 2026-09-04, dimension 8: previously had no block at all) fire all 4 real casts, each with its own scoped Secret Strategist bonus matching the stacks held at cast', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Changli'], CHANGLI_BLOCKS);
    const { hitLog } = resolveHitComposedDps(CHANGLI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'fusion', 'Main DPS');
    const fired = new Set(hitLog.map(h => h.blockId));
    ['changli.skill.true-sight-charge-1', 'changli.skill.true-sight-charge-2', 'changli.skill.true-sight-charge-3', 'changli.skill.true-sight-conquest-1'].forEach(id => {
      expect(fired.has(id)).toBe(true);
    });
    const bonus2 = CHANGLI_BLOCKS.find(b => b.id === 'changli.inherent.secret-strategist-charge-2');
    expect(bonus2.effects[0]).toEqual({ stat: 'elemDmg', value: 5, scopedToBlockId: 'changli.skill.true-sight-charge-2' });
    const bonus3 = CHANGLI_BLOCKS.find(b => b.id === 'changli.inherent.secret-strategist-charge-3');
    expect(bonus3.effects[0]).toEqual({ stat: 'elemDmg', value: 10, scopedToBlockId: 'changli.skill.true-sight-charge-3' });
    const bonusConquest = CHANGLI_BLOCKS.find(b => b.id === 'changli.inherent.secret-strategist-conquest-1');
    expect(bonusConquest.effects[0]).toEqual({ stat: 'elemDmg', value: 15, scopedToBlockId: 'changli.skill.true-sight-conquest-1' });
    // charge-1 (0 stacks held) has NO scoped bonus block at all — 0×5% contributes nothing, correctly omitted
    expect(CHANGLI_BLOCKS.find(b => b.id === 'changli.inherent.secret-strategist-charge-1')).toBeUndefined();
  });
});
