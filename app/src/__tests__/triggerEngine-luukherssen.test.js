import { describe, it, expect } from 'vitest';
import { CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { LUUK_HERSSEN_BLOCKS } from '../engine/characterBlocks/luukherssen.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Luuk Herssen', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(LUUK_HERSSEN_BLOCKS, 'Luuk Herssen');
  });

  // Fixed 2026-09-02: category was previously unset on both Mid-air blocks. WuWa's own general mechanic
  // (Mid-air/Plunging Attacks inherit Basic ATK or Heavy ATK DMG, never their own type) plus the dump's
  // own kit structure (listed under "Basic Attack — Such is Light") confirms basicDmg.
  it('both Mid-air Attack blocks are basicDmg-categorized', () => {
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.midair.jump-scythe-resection-stage2-3').damage.category).toBe('basicDmg');
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.midair.basic1-jump-resection2-3').damage.category).toBe('basicDmg');
  });

  // Fixed 2026-09-04 (Phase A audit): the dump's own kit text is explicit that Aureole of Execution
  // (all 3 forms), Gavel of Earthshaker, and the Liberation itself are ALL "considered Basic Attack
  // DMG" — confirmed by the dump's own Damage Profile (Basic 88.9%, Skill/Liberation/Heavy all 0%).
  // These 5 blocks were previously skillDmg/libDmg/uncategorized, silently rejecting every real Basic
  // Attack DMG Bonus buff (his entire weapon/echo-set kit is built around Basic ATK DMG) on 5 of his
  // core damage-dealing casts.
  it('Aureole of Execution (all 3 forms), Gavel of Earthshaker, and Liberation are basicDmg-categorized', () => {
    const ids = [
      'luukherssen.skill.aureole-ring',
      'luukherssen.skill.aureole-breach',
      'luukherssen.skill.aureole-glare',
      'luukherssen.forte.gavel-of-earthshaker',
      "luukherssen.liberation.rewritten-in-winters-margins",
    ];
    for (const id of ids) {
      expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === id).damage.category).toBe('basicDmg');
    }
  });

  // Base Golden Reflux (not Aureole of Execution) has no "considered Basic Attack DMG" kit text —
  // stays skillDmg, matching the dump's own near-zero Skill damage share.
  it('base Golden Reflux stays skillDmg (no kit-text override, unlike Aureole of Execution)', () => {
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.skill.golden-reflux').damage.category).toBe('skillDmg');
  });

  // Fixed 2026-09-04: S2/S6 both grant a "Rewritten in Winter's Margins DMG Multiplier" bonus via
  // stat:'libDmg', which is a no-op once the Liberation block's own category is basicDmg (category-gated
  // stats only apply to matching-category hits) — same 2-bug shape as Lucy's chain.s3. Fixed to
  // stat:'basicDmg' + scopedToBlockId so they still land on that one named move.
  it('S2 and S6 buffs are re-scoped to basicDmg + the Liberation block, not left as dead libDmg', () => {
    const s2 = LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s2');
    const s6 = LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s6');
    expect(s2.effects[0].stat).toBe('basicDmg');
    expect(s2.effects[0].scopedToBlockId).toBe("luukherssen.liberation.rewritten-in-winters-margins");
    expect(s6.effects[0].stat).toBe('basicDmg');
    expect(s6.effects[0].scopedToBlockId).toBe("luukherssen.liberation.rewritten-in-winters-margins");
  });

  // Added 2026-09-04: previously entirely missing base-kit Inherent Skill buff (Uncaused Diagnosis's
  // ATK+25% after a nearby teammate inflicts Shifting).
  it('Uncaused Diagnosis ATK buff exists, is ally-action/shifting triggered, self-scoped, 20s', () => {
    const b = LUUK_HERSSEN_BLOCKS.find(x => x.id === 'luukherssen.inherent.uncaused-diagnosis-atk');
    expect(b).toBeTruthy();
    expect(b.trigger).toEqual({ type: 'ally-action', action: 'shifting' });
    expect(b.target.scope).toBe('self');
    expect(b.timing.duration).toBe(20);
    expect(b.effects[0]).toMatchObject({ stat: 'atkPct', value: 25, stacking: 'refresh' });
  });

  it('S1/S3/S4 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Luuk Herssen'];
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s1').effects[0].value).toBe(150);
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s2').effects[0].value).toBe(rc.s2.libDmg);
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s3').effects[0].value).toBe(rc.s3.totalMult);
    expect(LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s4').effects[0].value).toBe(rc.s4.allDmg);
  });

  it('S6 models the real per-stack Endnotes mechanic (40 x3 stacks = 120 max)', () => {
    const rc = RESONANCE_CHAIN_DATA['Luuk Herssen'];
    const s6 = LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s6');
    expect(s6.effects[0].value).toBe(rc.s6.libDmg);
  });

  it('S4 is team-wide, matching RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Luuk Herssen'];
    const s4 = LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s4');
    expect(s4.effects[0].value).toBe(rc.s4.allDmg);
    expect(s4.target.scope).toBe('whole-team');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Luuk Herssen'], LUUK_HERSSEN_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LUUK_HERSSEN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'spectro', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('luukherssen.intro.before-injection-of-dawn')).toBe(true);
    expect(fired.has("luukherssen.liberation.rewritten-in-winters-margins")).toBe(true);
    expect(fired.has('luukherssen.forte.gavel-of-earthshaker')).toBe(true);
    expect(fired.has('luukherssen.skill.aureole-glare')).toBe(true);
  });

  // Fixed 2026-09-09 (full-kit audit, independent re-verification): chain.s1 was an UNSCOPED
  // `basicDmg: 15` — a prior pass's own DPS-impact-weighted approximation of the real +150% Mid-air
  // ATK DMG Bonus, spread across his whole basicDmg-categorized kit instead of the 2 real Mid-air
  // blocks it names. Since both real blocks already exist with stable ids, this is precisely scopable.
  it("S1's +150% Mid-air ATK DMG Bonus is now precisely scoped to only his 2 real Mid-air blocks", () => {
    const s1 = LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s1');
    expect(s1.effects[0]).toMatchObject({ stat: 'basicDmg', value: 150 });
    expect(s1.effects[0].scopedToBlockId).toEqual(expect.arrayContaining([
      'luukherssen.midair.jump-scythe-resection-stage2-3', 'luukherssen.midair.basic1-jump-resection2-3',
    ]));

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Luuk Herssen'], LUUK_HERSSEN_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const introDamage = (blocks) => {
      const { hitLog } = resolveHitComposedDps(blocks, steps, ctx, 3000, 'spectro', 'Main DPS', null, 1);
      return hitLog.filter(h => h.blockId === 'luukherssen.intro.before-injection-of-dawn').reduce((s, h) => s + h.damage, 0);
    };
    // Intro isn't a Mid-air block — its damage must be unaffected by S1's scoped bonus.
    expect(introDamage(LUUK_HERSSEN_BLOCKS)).toBeCloseTo(introDamage(LUUK_HERSSEN_BLOCKS.filter(b => b.id !== 'luukherssen.chain.s1')), 5);
  });

  // Fixed 2026-09-09: chain.s5 was an UNSCOPED `totalMult: 15` approximating 2 separate, UNCONDITIONAL
  // move bonuses (Intro/Outro +80%, Golden Reflux +50%) — unlike S3's Aureate-Judge-conditional bonus,
  // neither piece here has a live-state gate, so both are precisely scopable via their own block ids.
  it("S5's Intro/Outro/Golden Reflux DMG bonuses are now precisely scoped, not an unrelated flat approximation", () => {
    const s5 = LUUK_HERSSEN_BLOCKS.find(b => b.id === 'luukherssen.chain.s5');
    expect(s5.effects).toContainEqual(expect.objectContaining({ stat: 'totalMult', value: 80 }));
    expect(s5.effects).toContainEqual(expect.objectContaining({ stat: 'totalMult', value: 50, scopedToBlockId: 'luukherssen.skill.golden-reflux' }));

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Luuk Herssen'], LUUK_HERSSEN_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const gavelDamage = (blocks) => {
      const { hitLog } = resolveHitComposedDps(blocks, steps, ctx, 3000, 'spectro', 'Main DPS', null, 5);
      return hitLog.filter(h => h.blockId === 'luukherssen.forte.gavel-of-earthshaker').reduce((s, h) => s + h.damage, 0);
    };
    // Gavel of Earthshaker isn't Intro/Outro/Golden Reflux — its damage must be unaffected by S5.
    expect(gavelDamage(LUUK_HERSSEN_BLOCKS)).toBeCloseTo(gavelDamage(LUUK_HERSSEN_BLOCKS.filter(b => b.id !== 'luukherssen.chain.s5')), 5);
  });

  // Fixed 2026-09-09: the Inherent Skill Uncaused Diagnosis ATK buff (added 2026-09-04) reacts to
  // `ally-action`/`shifting`, but NOT ONE of his own damage blocks carried `appliesTags:[{tag:'shifting'}]`
  // — despite the buff's own note claiming it's "close to permanently up during his own rotation." This
  // made the trigger permanently dead (confirmed: removing the block changed total damage by exactly 0).
  it('Uncaused Diagnosis ATK buff now actually fires off his own real Shifting-inflicting moves', () => {
    const shiftingBlockIds = [
      'luukherssen.midair.jump-scythe-resection-stage2-3',
      'luukherssen.midair.basic1-jump-resection2-3',
      'luukherssen.skill.aureole-ring',
      'luukherssen.skill.aureole-breach',
      'luukherssen.skill.aureole-glare',
      'luukherssen.skill.golden-reflux',
    ];
    for (const id of shiftingBlockIds) {
      const block = LUUK_HERSSEN_BLOCKS.find(b => b.id === id);
      expect(block.appliesTags).toEqual(expect.arrayContaining([{ tag: 'shifting' }]));
    }

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Luuk Herssen'], LUUK_HERSSEN_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withBuff = resolveHitComposedDps(LUUK_HERSSEN_BLOCKS, steps, ctx, 3000, 'spectro', 'Main DPS', null, 0).totalDamage;
    const withoutBuff = resolveHitComposedDps(LUUK_HERSSEN_BLOCKS.filter(b => b.id !== 'luukherssen.inherent.uncaused-diagnosis-atk'), steps, ctx, 3000, 'spectro', 'Main DPS', null, 0).totalDamage;
    expect(withBuff).toBeGreaterThan(withoutBuff);
  });
});
