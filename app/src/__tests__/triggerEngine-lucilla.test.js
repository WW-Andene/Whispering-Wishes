import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { LUCILLA_BLOCKS } from '../engine/characterBlocks/lucilla.blocks.js';

describe('triggerEngine parity — Lucilla', () => {
  it('S1/S2/S4 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lucilla'];
    expect(LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s2').effects[0].value).toBe(rc.s2.echoDmg);
    const s4 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s4');
    expect(s4.effects[0].value * s4.effects[0].maxStacks).toBe(rc.s4.atkPct);
  });

  it('S3/S5/S6 carry both real dual-mode categories, matching RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Lucilla'];
    const s3 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s3');
    expect(s3.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s3.basicDmg);
    expect(s3.effects.find(e => e.stat === 'echoDmg').value).toBe(rc.s3.echoDmg);
    const s5 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s5');
    expect(s5.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s5.basicDmg);
    const s6 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s6');
    expect(s6.effects.find(e => e.stat === 'basicDmg').value).toBe(rc.s6.basicDmg);
    expect(s6.effects.find(e => e.stat === 'echoDmg').value).toBe(rc.s6.echoDmg);
  });

  it('both outro modes and the debuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Lucilla'];
    const chafe = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.outro.montage-chafe');
    const echo = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.outro.montage-echo');
    expect(chafe.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(echo.effects[0].value).toBe(legacy.outroBuffs[1].value);
    const deb = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.debuff.inherent-skill-resshred');
    expect(deb.effects[0].value).toBe(legacy.debuffs[0].value);
    expect(deb.kind).toBe('debuff');
  });

  it('the Liberation self-buff is sourced from CHARACTER_ROTATIONS despite CHAR_BUFF_TABLE.selfBuffs not listing it', () => {
    const legacy = CHAR_BUFF_TABLE['Lucilla'];
    expect(legacy.selfBuffs.find(b => b.condition === 'Resonance Chain 1')).toBeTruthy();
    const bonus = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.selfbuff.clear-as-day-bonus');
    expect(bonus.effects[0].value).toBe(30);
    expect(bonus.timing.duration).toBe(10);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Lucilla'], LUCILLA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(LUCILLA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'glacio', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('lucilla.intro.clip-it')).toBe(true);
    expect(fired.has('lucilla.liberation.clear-as-day')).toBe(true);
    expect(fired.has('lucilla.basic.letting-it-go')).toBe(true);
    expect(fired.has('lucilla.basic.oblivion')).toBe(true);
  });

  it('Phase A audit (2026-09-04): S3/S5/S6 are scoped to their own single named move, not a whole damage category', () => {
    // Real bug found: S3 ("Letting It Go's DMG Multiplier +100%"), S5 ("Oblivion's DMG Multiplier
    // +50%"), and S6 (Letting It Go +600%) were all modeled as unscoped basicDmg/echoDmg category
    // buffs — the same bug class already fixed for Jiyan's S6 (see jiyan.blocks.js's own audit
    // comment). Without scopedToBlockId, each would inflate EVERY basicDmg/echoDmg-category block
    // in the kit (Tracing Forms, the other of the S3/S5/S6 pair's own moves, Clear As Day itself),
    // not just the one move its own kit text names.
    const s3 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s3');
    for (const e of s3.effects) expect(e.scopedToBlockId).toBe('lucilla.basic.letting-it-go');
    const s5 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s5');
    for (const e of s5.effects) expect(e.scopedToBlockId).toBe('lucilla.basic.oblivion');
    const s6 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s6');
    for (const e of s6.effects) expect(e.scopedToBlockId).toBe('lucilla.basic.letting-it-go');
  });

  it('Phase A audit (2026-09-04): Inherent Skill Slow Motion Echo-mode team Echo Skill DMG buff is modeled', () => {
    // Real gap found: CHAR_BUFF_TABLE['Lucilla'] only modeled the Chafe-mode half of Slow Motion
    // (the -8% Glacio RES Shred debuff on casting Spotlight) — the Echo-mode half (team +25% Echo
    // Skill DMG Bonus for 30s, same trigger) was entirely missing from both the legacy table and
    // the engine blocks.
    const legacy = CHAR_BUFF_TABLE['Lucilla'];
    const echoBuff = legacy.selfBuffs.find(b => b.stat === 'echoDmg' && b.target === 'team');
    expect(echoBuff).toBeTruthy();
    expect(echoBuff.value).toBe(25);
    expect(echoBuff.duration).toBe(30);
    const block = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.buff.inherent-skill-echo-teamdmg');
    expect(block).toBeTruthy();
    expect(block.effects[0].value).toBe(25);
    expect(block.target.scope).toBe('whole-team');
    expect(block.timing.duration).toBe(30);
  });
});
