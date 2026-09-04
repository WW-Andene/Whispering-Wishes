import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { MORTEFI_BLOCKS } from '../engine/characterBlocks/mortefi.blocks.js';

describe('triggerEngine parity — Mortefi', () => {
  it('S2/S4 stay correctly unmodeled (no block) — pure utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Mortefi'];
    expect(rc.s2).toEqual({});
    expect(rc.s4).toEqual({});
    expect(MORTEFI_BLOCKS.find(b => b.id === 'mortefi.chain.s2')).toBeUndefined();
    expect(MORTEFI_BLOCKS.find(b => b.id === 'mortefi.chain.s4')).toBeUndefined();
  });

  it('S1/S5 are modeled as real Marcato bonus-proc damage blocks, not the flat {} approximation', () => {
    const rc = RESONANCE_CHAIN_DATA['Mortefi'];
    expect(rc.s1).toEqual({});
    expect(rc.s5).toEqual({});
    const s1 = MORTEFI_BLOCKS.find(b => b.id === 'mortefi.chain.s1-bonus-marcato');
    expect(s1.kind).toBe('damage');
    expect(s1.damage.hits.length).toBe(2);
    expect(s1.damage.hits[0].atkPct).toBeCloseTo(31.81);
    const s5 = MORTEFI_BLOCKS.find(b => b.id === 'mortefi.chain.s5-bonus-marcato');
    expect(s5.kind).toBe('damage');
    expect(s5.damage.hits.length).toBe(4);
    expect(s5.damage.hits[0].atkPct).toBeCloseTo(15.905);
  });

  it('S3/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Mortefi'];
    expect(MORTEFI_BLOCKS.find(b => b.id === 'mortefi.chain.s3').effects[0].value).toBe(rc.s3.critDmg);
    expect(MORTEFI_BLOCKS.find(b => b.id === 'mortefi.chain.s6').effects[0].value).toBe(rc.s6.atkPct);
  });

  // Fixed 2026-09-03: S3's critDmg wasn't scoped — critDmg isn't category-gated (unlike skillDmg/
  // basicDmg/etc.), so it would have over-credited any of Mortefi's own hits landing within the 10s
  // Burning Rhapsody window, when the kit text is explicit this is Marcato-only.
  it("S3's +30% Crit DMG only applies to Marcato procs, not Mortefi's own attacks", () => {
    const s3 = MORTEFI_BLOCKS.find(b => b.id === 'mortefi.chain.s3');
    expect(s3.effects.every(e => ['mortefi.liberation.burning-rhapsody-marcato', 'mortefi.chain.s1-bonus-marcato', 'mortefi.chain.s5-bonus-marcato'].includes(e.scopedToBlockId))).toBe(true);
  });

  it("base-kit Burning Rhapsody Marcato (2026-09-04, previously entirely unmodeled) fires 28 hits — the kit's own \"1 proc/0.35s\" cap fully saturated over the 10s window — categorized coordDmg", () => {
    const marcato = MORTEFI_BLOCKS.find(b => b.id === 'mortefi.liberation.burning-rhapsody-marcato');
    expect(marcato.damage.hits.length).toBe(28);
    expect(marcato.damage.category).toBe('coordDmg');
    expect(marcato.damage.hits.every(h => h.atkPct === 31.81)).toBe(true);
  });

  it('outro matches CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Mortefi'];
    const outro = MORTEFI_BLOCKS.find(b => b.id === 'mortefi.outro.rage-transposition');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Mortefi'], MORTEFI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(MORTEFI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2000, 'fusion', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('mortefi.intro.dissonance')).toBe(true);
    expect(fired.has('mortefi.forte.fury-fugue')).toBe(true);
    expect(fired.has('mortefi.liberation.violent-finale')).toBe(true);
    expect(fired.has('mortefi.liberation.burning-rhapsody-marcato')).toBe(true);
    expect(fired.has('mortefi.chain.s5-bonus-marcato')).toBe(true);
  });

  it("Intro (Dissonance) is skillDmg-categorized (was uncategorized)", () => {
    const intro = MORTEFI_BLOCKS.find(b => b.id === 'mortefi.intro.dissonance');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("dmgFocus is ['Liberation', 'Skill', 'Basic ATK', 'Coordinated ATK'] — 'Heavy ATK' was wrong (0% real share, no heavyDmg block exists), Liberation/Skill/Basic ATK were all missing despite being real, already-categorized damage", () => {
    expect(CHARACTER_DATA['Mortefi'].dmgFocus).toEqual(['Liberation', 'Skill', 'Basic ATK', 'Coordinated ATK']);
  });
});
