import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/composition/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/composition/rotationSimulator.js';
import { BULING_BLOCKS } from '../engine/characterBlocks/buling.blocks.js';

describe('triggerEngine parity — Buling', () => {
  it("dmgFocus is ['Basic ATK', 'Skill', 'Liberation'] — was ['Liberation'] only despite 5 real basicDmg blocks and 1 real skillDmg block firing every real rotation loop", () => {
    expect(CHARACTER_DATA['Buling'].dmgFocus).toEqual(['Basic ATK', 'Skill', 'Liberation']);
  });

  it("intro.summon-and-smite is categorized 'skillDmg' — fixed 2026-09-04 (Phase A REDO): was uncategorized, silently rejecting Resonance Skill DMG Bonus; the source dump's own Intro Skill multiplier row is literally labeled \"Skill Damage\"", () => {
    expect(BULING_BLOCKS.find(b => b.id === 'buling.intro.summon-and-smite').damage.category).toBe('skillDmg');
  });

  it('S2-S5 stay correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Buling'];
    ['s2', 's3', 's4', 's5'].forEach(s => expect(rc[s]).toEqual({}));
    ['buling.chain.s2', 'buling.chain.s3', 'buling.chain.s4', 'buling.chain.s5'].forEach(id => {
      expect(BULING_BLOCKS.find(b => b.id === id)).toBeUndefined();
    });
  });

  it('S1 matches RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Buling'];
    expect(BULING_BLOCKS.find(b => b.id === 'buling.chain.s1').effects[0].value).toBe(rc.s1.critRate);
  });

  it("S6 chain.s6 + libbuff.five-thunders-skill-ramp sum to RESONANCE_CHAIN_DATA's real 50% ceiling — fixed 2026-09-04 (Phase A REDO): chain.s6 used to store the flat 50 absolute value, which stacked ADDITIVELY on top of the base 25% ramp buff (both fire on the same Liberation cast) for a wrong 75% total; now stores the 25-point DELTA so the two blocks sum to the correct 50%", () => {
    const rc = RESONANCE_CHAIN_DATA['Buling'];
    const ramp = BULING_BLOCKS.find(b => b.id === 'buling.libbuff.five-thunders-skill-ramp');
    const s6 = BULING_BLOCKS.find(b => b.id === 'buling.chain.s6');
    expect(ramp.effects[0].value + s6.effects[0].value).toBe(rc.s6.skillDmg);
    expect(s6.effects[0].value).toBe(rc.s6.skillDmg - ramp.effects[0].value);
  });

  it('outro and libBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Buling'];
    const outro = BULING_BLOCKS.find(b => b.id === 'buling.outro.exorcism-spell');
    const lib = BULING_BLOCKS.find(b => b.id === 'buling.libbuff.five-thunders-skill-ramp');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    expect(lib.effects[0].value).toBe(legacy.libBuffs[0].value);
    expect(lib.timing.duration).toBe(legacy.libBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Buling'], BULING_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(BULING_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2000, 'electro', 'Healer');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('buling.intro.summon-and-smite')).toBe(true);
    expect(fired.has('buling.liberation.flashing-thunder-spell-harmony')).toBe(true);
    expect(fired.has('buling.basic.stage1')).toBe(true);
    expect(fired.has('buling.heavy.mountain-over-thunder')).toBe(true);
  });
});
