import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { REBECCA_BLOCKS } from '../engine/characterBlocks/rebecca.blocks.js';

describe('triggerEngine parity — Rebecca', () => {
  it('S4 stays correctly unmodeled (no block) — buff-to-a-buff, no flat-schema equivalent per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Rebecca'];
    expect(rc.s4).toEqual({});
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s4')).toBeUndefined();
  });

  it('S1/S2/S3/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Rebecca'];
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s1').effects[0].value).toBe(rc.s1.basicDmg);
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s2').effects[0].value).toBe(rc.s2.allDmg);
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s5').effects[0].value).toBe(rc.s5.basicDmg);
    expect(REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s6').effects[0].value).toBe(rc.s6.basicDmg);
  });

  it('S6 additionally has a real 900%-ATK bonus-hit proc block beyond the flat basicDmg multiplier', () => {
    const bonus = REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s6-bonus-hit');
    expect(bonus.kind).toBe('damage');
    expect(bonus.damage.hits[0].atkPct).toBe(900);
  });

  it('S2 is team-wide, matching RESONANCE_CHAIN_DATA', () => {
    const s2 = REBECCA_BLOCKS.find(b => b.id === 'rebecca.chain.s2');
    expect(s2.target.scope).toBe('whole-team');
  });

  it('outro and selfBuffs match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Rebecca'];
    const outro = REBECCA_BLOCKS.find(b => b.id === 'rebecca.outro.preem-choom');
    expect(outro.effects.find(e => e.stat === 'heavyDmg').value).toBe(legacy.outroBuffs[0].value);
    expect(outro.effects.find(e => e.stat === 'allDmg').value).toBe(legacy.outroBuffs[1].value);
    const huntress = REBECCA_BLOCKS.find(b => b.id === 'rebecca.selfbuff.huntress');
    const guts = REBECCA_BLOCKS.find(b => b.id === 'rebecca.selfbuff.guts');
    expect(huntress.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(guts.effects[0].value).toBe(legacy.selfBuffs[1].value);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rebecca'], REBECCA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(REBECCA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'electro', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has("rebecca.intro.yo-its-big-boomin-time")).toBe(true);
    expect(fired.has('rebecca.forte.rat-tat-tat-huntress')).toBe(true);
    expect(fired.has('rebecca.liberation.boom-fireworks')).toBe(true);
    expect(fired.has('rebecca.chain.s6-bonus-hit')).toBe(true);
  });
});
