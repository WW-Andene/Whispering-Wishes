import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { MORNYE_BLOCKS } from '../engine/characterBlocks/mornye.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Mornye', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(MORNYE_BLOCKS, 'Mornye');
  });

  it('S1/S4 stay correctly unmodeled (no block) — RESONANCE_CHAIN_DATA fixed 2026-09-03 to match, was stale nonzero placeholders', () => {
    const rc = RESONANCE_CHAIN_DATA['Mornye'];
    expect(rc.s1).toEqual({});
    expect(rc.s4).toEqual({});
    expect(MORNYE_BLOCKS.find(b => b.id === 'mornye.chain.s1')).toBeUndefined();
    expect(MORNYE_BLOCKS.find(b => b.id === 'mornye.chain.s4')).toBeUndefined();
  });

  it('S3 stays correctly unmodeled (no block) — pure resource restoration, zero DPS component, fixed 2026-09-02', () => {
    const rc = RESONANCE_CHAIN_DATA['Mornye'];
    expect(rc.s3).toEqual({});
    expect(MORNYE_BLOCKS.find(b => b.id === 'mornye.chain.s3')).toBeUndefined();
  });

  it('S2/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Mornye'];
    expect(MORNYE_BLOCKS.find(b => b.id === 'mornye.chain.s2').effects[0].value).toBe(rc.s2.critDmg);
    expect(MORNYE_BLOCKS.find(b => b.id === 'mornye.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(MORNYE_BLOCKS.find(b => b.id === 'mornye.chain.s6').effects[0].value).toBe(rc.s6.libDmg);
  });

  it('every damage block scales off DEF, not ATK', () => {
    const damageBlocks = MORNYE_BLOCKS.filter(b => b.kind === 'damage');
    expect(damageBlocks.length).toBeGreaterThan(0);
    damageBlocks.forEach(b => expect(b.damage.basis).toBe('DEF'));
  });

  it('every damage block has a damage.category set (Phase A audit 2026-09-04 — Intro was missing one entirely, silently rejecting real Resonance Skill DMG Bonus, same bug class as Lynae\'s Outro)', () => {
    const damageBlocks = MORNYE_BLOCKS.filter(b => b.kind === 'damage');
    damageBlocks.forEach(b => expect(b.damage.category).toBeTruthy());
    const intro = MORNYE_BLOCKS.find(b => b.id === 'mornye.intro.convergence');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("tuneBreak.ruptureDmgMult is the real sourced Lv.10 value 298.22, not the unsourced 300 estimate (Phase A audit 2026-09-04, same fix class as Lynae's ruptureDmgMult)", () => {
    expect(CHAR_BUFF_TABLE['Mornye'].tuneBreak.ruptureDmgMult).toBe(298.22);
  });

  it('outro matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Mornye'];
    const outro = MORNYE_BLOCKS.find(b => b.id === 'mornye.outro.recursion');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    expect(outro.target.scope).toBe('whole-team');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total using her DEF base stat', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Mornye'], MORNYE_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(MORNYE_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { def: 2200 }, 'fusion', 'Healer');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('mornye.intro.convergence')).toBe(true);
    expect(fired.has('mornye.liberation.critical-protocol')).toBe(true);
    expect(fired.has('mornye.forte.inversion')).toBe(true);
    // Regression check for the 2026-09-02 fix: her real rotation's Basic ATK step
    // ('Wide Field Observation Mode Stage 1-3') must actually fire a damage block now.
    expect(fired.has('mornye.basic.wide-field-stage1-3')).toBe(true);
  });

  // Added 2026-09-09 (full-kit audit, independent re-verification): Critical Protocol's own base-kit
  // ER-scaling Crit self-buff ("for every 1% ER over 100%, +0.5% Crit Rate cap +80%, +1% Crit DMG cap
  // +160%") had NO representation anywhere (CHAR_BUFF_TABLE's selfBuffs was empty) despite being real,
  // unconditional (not chain-gated), and a significant contributor to her own Liberation hit.
  it('Critical Protocol\'s own ER-scaling Crit self-buff is modeled at the documented cap and measurably applied', () => {
    const block = MORNYE_BLOCKS.find(b => b.id === 'mornye.selfbuff.critical-protocol-crit');
    expect(block).toBeTruthy();
    expect(block.trigger).toEqual({ type: 'cast', on: 'Liberation:Critical Protocol' });
    expect(block.effects).toEqual(expect.arrayContaining([
      expect.objectContaining({ stat: 'critRate', value: 80 }),
      expect.objectContaining({ stat: 'critDmg', value: 160 }),
    ]));

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Mornye'], MORNYE_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const libDamage = (blocks) => {
      const { hitLog } = resolveHitComposedDps(blocks, steps, ctx, { def: 2200 }, 'fusion', 'Healer', null, 0);
      return hitLog.filter(h => h.blockId === 'mornye.liberation.critical-protocol').reduce((s, h) => s + h.damage, 0);
    };
    expect(libDamage(MORNYE_BLOCKS)).toBeGreaterThan(libDamage(MORNYE_BLOCKS.filter(b => b.id !== 'mornye.selfbuff.critical-protocol-crit')));
  });
});
