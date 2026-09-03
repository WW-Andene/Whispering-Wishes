import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { ROVER_HAVOC_BLOCKS } from '../engine/characterBlocks/roverhavoc.blocks.js';

describe('triggerEngine parity — Rover: Havoc', () => {
  it('S2/S3 stay correctly unmodeled (no block) — zero DPS component per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Rover: Havoc'];
    expect(rc.s2).toEqual({});
    expect(rc.s3).toEqual({});
    expect(ROVER_HAVOC_BLOCKS.find(b => b.id === 'roverhavoc.chain.s2')).toBeUndefined();
    expect(ROVER_HAVOC_BLOCKS.find(b => b.id === 'roverhavoc.chain.s3')).toBeUndefined();
  });

  it('S1/S4/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Rover: Havoc'];
    expect(ROVER_HAVOC_BLOCKS.find(b => b.id === 'roverhavoc.chain.s1').effects[0].value).toBe(rc.s1.skillDmg);
    expect(ROVER_HAVOC_BLOCKS.find(b => b.id === 'roverhavoc.chain.s4').effects[0].value).toBe(rc.s4.resShred);
    expect(ROVER_HAVOC_BLOCKS.find(b => b.id === 'roverhavoc.chain.s5').effects[0].value).toBe(rc.s5.basicDmg);
    expect(ROVER_HAVOC_BLOCKS.find(b => b.id === 'roverhavoc.chain.s6').effects[0].value).toBe(rc.s6.critRate);
  });

  it('S4 debuff and S6 selfBuff match CHAR_BUFF_TABLE\'s own chain-gated entries', () => {
    const legacy = CHAR_BUFF_TABLE['Rover: Havoc'];
    const s4 = ROVER_HAVOC_BLOCKS.find(b => b.id === 'roverhavoc.chain.s4');
    const s6 = ROVER_HAVOC_BLOCKS.find(b => b.id === 'roverhavoc.chain.s6');
    expect(s4.effects[0].value).toBe(legacy.debuffs[0].value);
    expect(s4.timing.duration).toBe(legacy.debuffs[0].duration);
    expect(s6.effects[0].value).toBe(legacy.selfBuffs[1].value);
    expect(s4.kind).toBe('debuff');
  });

  it('Metamorph (base-kit, not chain-gated) matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Rover: Havoc'];
    const metamorph = ROVER_HAVOC_BLOCKS.find(b => b.id === 'roverhavoc.selfbuff.metamorph');
    expect(metamorph.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(legacy.selfBuffs[0].condition).toMatch(/Metamorph/);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rover: Havoc'], ROVER_HAVOC_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(ROVER_HAVOC_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'havoc', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('roverhavoc.intro.instant-of-annihilation')).toBe(true);
    expect(fired.has('roverhavoc.heavy.devastation')).toBe(true);
    expect(fired.has('roverhavoc.liberation.deadening-abyss')).toBe(true);
  });

  // Found 2026-09-03 via a Phase A full-dimension audit (REMAINING_WORK.md 1c): dmgFocus was
  // ['Heavy ATK', 'Basic ATK'] only — Liberation (26.2%, his 2nd-largest bucket) and Skill (10.9%)
  // were both real, correctly-categorized damage he deals but weren't gated as focus, silently
  // rejecting a teammate's real Liberation/Skill DMG Bonus.
  it("dmgFocus includes 'Liberation' and 'Skill' (26.2%/10.9% of his real damage profile)", () => {
    expect(CHARACTER_DATA['Rover: Havoc'].dmgFocus).toEqual(expect.arrayContaining(['Heavy ATK', 'Basic ATK', 'Liberation', 'Skill']));
  });

  it('Outro Soundweaver is outroDmg-categorized (was uncategorized) — his own kit text: "own direct damage, not a team buff"', () => {
    const b = ROVER_HAVOC_BLOCKS.find(bl => bl.id === 'roverhavoc.outro.soundweaver');
    expect(b.damage.category).toBe('outroDmg');
  });
});
