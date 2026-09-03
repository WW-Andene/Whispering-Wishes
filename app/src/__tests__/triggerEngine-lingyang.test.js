import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { LINGYANG_BLOCKS } from '../engine/characterBlocks/lingyang.blocks.js';

describe('triggerEngine parity — Lingyang', () => {
  it('S1/S2 stay correctly unmodeled (no block) — pure poise/resource-gain utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Lingyang'];
    expect(rc.s1).toEqual({ totalMult: 0 });
    expect(rc.s2).toEqual({ totalMult: 0 });
    expect(LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s1')).toBeUndefined();
    expect(LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s2')).toBeUndefined();
  });

  it('S3/S4/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lingyang'];
    const s3 = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s3');
    expect(s3.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s3.basicDmg);
    expect(s3.effects.find(e => e.stat === 'skillDmg').value).toBe(rc.s3.skillDmg);
    expect(LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s4').effects[0].value).toBe(rc.s4.elemDmg);
    expect(LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s6').effects[0].value).toBe(rc.s6.basicDmg);
  });

  it('S5 is modeled as a real 200%-ATK proc-damage block, not the flat totalMult approximation', () => {
    const rc = RESONANCE_CHAIN_DATA['Lingyang'];
    expect(rc.s5).toEqual({ totalMult: 200 });
    expect(LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s5')).toBeUndefined();
    const s5 = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s5-bonus-hit');
    expect(s5.kind).toBe('damage');
    expect(s5.damage.hits[0].atkPct).toBe(200);
  });

  it('S4 is team-wide with a real 30s window', () => {
    const s4 = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(30);
  });

  it('selfBuff matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Lingyang'];
    const self = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.selfbuff.strive');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(self.timing.duration).toBe(legacy.selfBuffs[0].duration);
  });

  it('Diligent Practice matches CHAR_BUFF_TABLE and is scoped to Mountain Roamer only (no over-crediting)', () => {
    const legacy = CHAR_BUFF_TABLE['Lingyang'];
    const diligent = LINGYANG_BLOCKS.find(b => b.id === 'lingyang.selfbuff.diligent-practice');
    expect(diligent.effects[0].value).toBe(legacy.selfBuffs[1].value);
    expect(diligent.timing.duration).toBe(legacy.selfBuffs[1].duration);
    expect(diligent.effects[0].scopedToBlockId).toBe('lingyang.skill.ancient-arts');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lingyang'], LINGYANG_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LINGYANG_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'glacio', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lingyang.intro.lion-awakens')).toBe(true);
    expect(fired.has("lingyang.liberation.strive-lions-vigor")).toBe(true);
    expect(fired.has('lingyang.forte.glorious-plunge')).toBe(true);
    expect(fired.has('lingyang.chain.s5-bonus-hit')).toBe(true);
  });
});
