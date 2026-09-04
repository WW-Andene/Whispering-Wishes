import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/composition/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/composition/rotationSimulator.js';
import { DENIA_BLOCKS } from '../engine/characterBlocks/denia.blocks.js';

describe('triggerEngine parity — Denia', () => {
  it('S1-S5 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Denia'];
    expect(DENIA_BLOCKS.find(b => b.id === 'denia.chain.s1').effects[0].value).toBe(rc.s1.critDmg);
    expect(DENIA_BLOCKS.find(b => b.id === 'denia.chain.s2').effects[0].value).toBe(rc.s2.libDmg);
    expect(DENIA_BLOCKS.find(b => b.id === 'denia.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(DENIA_BLOCKS.find(b => b.id === 'denia.chain.s4').effects[0].value).toBe(rc.s4.totalMult);
    expect(DENIA_BLOCKS.find(b => b.id === 'denia.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
  });

  it('S6 has both real effects (atkPct AND elemDmg), matching RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Denia'];
    const s6 = DENIA_BLOCKS.find(b => b.id === 'denia.chain.s6');
    expect(s6.effects.find(e => e.stat === 'atkPct').value).toBe(rc.s6.atkPct);
    expect(s6.effects.find(e => e.stat === 'elemDmg').value).toBe(rc.s6.elemDmg);
  });

  it('the two Outro modes are mutually-exclusive real blocks matching CHAR_BUFF_TABLE exactly', () => {
    const legacy = CHAR_BUFF_TABLE['Denia'];
    const tuneStrain = DENIA_BLOCKS.find(b => b.id === 'denia.outro.unfinished-lies-tune-strain');
    const fusionBurst = DENIA_BLOCKS.find(b => b.id === 'denia.outro.unfinished-lies-fusion-burst');
    expect(tuneStrain.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(tuneStrain.timing.duration).toBe(legacy.outroBuffs[0].duration);
    expect(fusionBurst.effects[0].value).toBe(legacy.outroBuffs[1].value);
    expect(fusionBurst.timing.duration).toBe(legacy.outroBuffs[1].duration);
    expect(fusionBurst.target.scope).toBe('whole-team');
  });

  it('the Stagecraft-Form Basic ATK step only fires Stage 1, not the full 4-stage combo', () => {
    const b = DENIA_BLOCKS.find(bl => bl.id === 'denia.basic.stagecraft-stage1');
    expect(b.damage.hits.length).toBe(1);
    expect(b.damage.hits[0].atkPct).toBeCloseTo(32.69);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Denia'], DENIA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(DENIA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'fusion', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has("denia.intro.its-been-a-while")).toBe(true);
    expect(fired.has('denia.liberation.final-act-stagecraft')).toBe(true);
    expect(fired.has('denia.liberation.final-act-breakdown')).toBe(true);
    expect(fired.has('denia.liberation.erosion-field')).toBe(true);
  });
});
