import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { CARTETHYIA_BLOCKS } from '../engine/characterBlocks/cartethyia.blocks.js';

describe('triggerEngine parity — Cartethyia', () => {
  it('S5 stays correctly unmodeled (no block) — purely defensive per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Cartethyia'];
    expect(rc.s5).toEqual({ totalMult: 0 });
    expect(CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s5')).toBeUndefined();
  });

  it('S1 models the real per-stack mechanic (25 x4 stacks = 100 max)', () => {
    const rc = RESONANCE_CHAIN_DATA['Cartethyia'];
    const s1 = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s1');
    expect(s1.effects[0].value * s1.effects[0].maxStacks).toBe(rc.s1.critDmg);
  });

  it('S2/S3/S4/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Cartethyia'];
    const s2 = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s2');
    expect(s2.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s2.basicDmg);
    expect(s2.effects.find(e => e.stat === 'totalMult').value).toBe(rc.s2.totalMult);
    expect(CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s4').effects[0].value).toBe(rc.s4.allDmg);
    expect(CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s6').effects[0].value).toBe(rc.s6.elemDmg);
  });

  it('S6 is correctly a debuff on enemies, not a self buff', () => {
    const s6 = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.chain.s6');
    expect(s6.kind).toBe('debuff');
    expect(s6.target.scope).toBe('all-enemies');
  });

  it('every damage block scales off HP, not ATK', () => {
    const damageBlocks = CARTETHYIA_BLOCKS.filter(b => b.kind === 'damage');
    expect(damageBlocks.length).toBeGreaterThan(0);
    damageBlocks.forEach(b => expect(b.damage.basis).toBe('HP'));
  });

  it('outro and the Wind\'s Indelible Imprint debuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Cartethyia'];
    const outro = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.outro.winds-divine-blessing');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    const imprint = CARTETHYIA_BLOCKS.find(b => b.id === 'cartethyia.debuff.winds-indelible-imprint');
    expect(imprint.effects[0].value).toBe(legacy.debuffs[1].value);
    expect(imprint.kind).toBe('debuff');
  });

  it('the weapon-specific debuff is NOT modeled (avoids double-counting the weapon\'s own pv)', () => {
    expect(CARTETHYIA_BLOCKS.find(b => b.id.includes('weapon'))).toBeUndefined();
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total using her HP base stat', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Cartethyia'], CARTETHYIA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CARTETHYIA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, { hp: 40000 }, 'aero', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has("cartethyia.intro.sword-to-mark-tides-trace")).toBe(true);
    expect(fired.has('cartethyia.liberation.blade-of-howling-squall')).toBe(true);
    expect(fired.has('cartethyia.basic.fleurdelys-1-5')).toBe(true);
  });
});
