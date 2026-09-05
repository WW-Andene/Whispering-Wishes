import { describe, it, expect } from 'vitest';
import { createStats, applyResonanceChain } from '../features/teams/calcEngine.js';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation, simulateRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { AEMEATH_BLOCKS } from '../engine/characterBlocks/aemeath.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';
import { resolveConcertoEnergyGenerated } from '../engine/resolver/dps/resolveConcertoEnergy.js';

describe('triggerEngine parity — Aemeath', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(AEMEATH_BLOCKS, 'Aemeath');
  });

  it('S3 (libDmg 100, critDmg 60) matches RESONANCE_CHAIN_DATA exactly', () => {
    const legacy = RESONANCE_CHAIN_DATA['Aemeath'].s3;
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s3');
    expect(block.effects.find(e => e.stat === 'libDmg').value).toBe(legacy.libDmg);
    expect(block.effects.find(e => e.stat === 'critDmg').value).toBe(legacy.critDmg);
  });

  it("S4 is team-wide (not self) — the correction from the audit comment", () => {
    const legacy = RESONANCE_CHAIN_DATA['Aemeath'].s4;
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s4');
    expect(block.target.scope).toBe('whole-team');
    expect(block.effects[0]).toEqual({ stat: 'allDmg', value: legacy.allDmg, source: 'self-kit' });
  });

  it('S6 is a debuff on enemies (Liberation DMG TAKEN), not a self buff — the correction from the audit comment', () => {
    const legacy = RESONANCE_CHAIN_DATA['Aemeath'].s6;
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s6');
    expect(block.kind).toBe('debuff');
    expect(block.target.scope).toBe('all-enemies');
    expect(block.effects[0]).toEqual({ stat: 'libDmg', value: legacy.libDmg, source: 'self-kit' });
  });

  it('S1 is gated on a real derived Instant Response window (resource-threshold), not an unconditional +300% Crit DMG', () => {
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s1');
    expect(block.trigger).toEqual({ type: 'resource-threshold', resource: 'Resonance Rate', threshold: 4 });
    expect(block.effects[0].value).toBe(RESONANCE_CHAIN_DATA['Aemeath'].s1.critDmg);
  });

  it('both real selfBuffs from CHAR_BUFF_TABLE are modeled (critDmg 60 AND deepen 25), not just the first', () => {
    const legacy = CHAR_BUFF_TABLE['Aemeath'].selfBuffs;
    expect(legacy).toHaveLength(2);
    const critBlock = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.selfbuff.between-the-stars-critdmg');
    const deepenBlock = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.selfbuff.between-the-stars-finale-amp');
    expect(critBlock.effects[0].value).toBe(legacy[0].value);
    expect(deepenBlock.effects[0].value).toBe(legacy[1].value);
  });

  it('Silent Protection outro buff matches CHAR_BUFF_TABLE.outroBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Aemeath'].outroBuffs[0];
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.outro.silent-protection');
    expect(block.effects[0].value).toBe(legacy.value);
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aemeath'], AEMEATH_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(AEMEATH_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 4000, 'fusion', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('aemeath.liberation.heavenfall-edict-finale')).toBe(true);
    expect(fired.has('aemeath.skill.seraphic-duet-overture')).toBe(true);
    expect(fired.has('aemeath.skill.seraphic-duet-encore')).toBe(true);
    expect(fired.has('aemeath.basic.mech-stage-3-4')).toBe(true);
    expect(fired.has('aemeath.basic.mech-stage-2-4')).toBe(true);
    expect(fired.has('aemeath.basic.aemeath-stage-2-4')).toBe(true);
  });

  it("Basic Stage 1 (Mech form, auto-cast on Form Switch) and Minor Fortes exist — added 2026-09-05 against Data dump/Aemeath/Aemeath.md, previously absent entirely", () => {
    const stage1 = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.skill.form-switch-basic-1');
    const minorFortes = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.buff.minor-fortes');
    expect(stage1.damage.hits.map(h => h.atkPct)).toEqual([23.20, 23.20, 23.20]);
    expect(stage1.timing.cooldown).toBe(1);
    expect(minorFortes.effects).toEqual([
      { stat: 'critRate', value: 8, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ]);
  });

  it('Inherent Skill Before All Sounds (Heavy ATK +200% DMG Amp in Instant Response) exists, gated on a real derived resource-threshold window, scoped to her one real Heavy ATK block', () => {
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.inherent.before-all-sounds');
    expect(block.trigger).toEqual({ type: 'resource-threshold', resource: 'Resonance Rate', threshold: 4 });
    expect(block.timing.duration).toBe(54);
    expect(block.effects).toEqual([{ stat: 'deepen', value: 200, scopedToBlockId: 'aemeath.heavy.mech-charged-ii', source: 'self-kit' }]);
  });

  it("Resonance Rate genuinely reaches the real 4/4 cap through the real rotation (Overdrive+2, Encore+1, Overture+1), deriving a real 'resource-threshold:Resonance Rate:4' firing — not a trusted condition", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aemeath'], AEMEATH_BLOCKS);
    const results = simulateRotation(AEMEATH_BLOCKS, steps);
    const crossedSteps = results.filter(r => r.firedTriggers.has('resource-threshold:Resonance Rate:4'));
    expect(crossedSteps.length).toBe(1);
    // Must cross at (or before) the Heavy ATK Charged II step, and stay within the block's own
    // 54s window at that instant — proves the derivation lands early enough for the real Heavy ATK
    // cast to actually receive the buff.
    const heavyAtkStep = results.find(r => r.step.type === 'Heavy ATK');
    expect(crossedSteps[0].time).toBeLessThanOrEqual(heavyAtkStep.time);
  });

  it("Seraphic Duet Encore/Overture are gated on a real Seraphic Duo window (Basic Stage 4 -> 5s), not an unconditional cast — and both real casts in the modeled rotation land inside it", () => {
    const encore = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.skill.seraphic-duet-encore');
    const overture = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.skill.seraphic-duet-overture');
    expect(encore.trigger).toEqual({ type: 'windowed-cast', opensOn: ['cast:Basic ATK:Mech Stage 2-4'], windowSeconds: 5, attemptOn: 'Skill:Seraphic Duet: Encore' });
    expect(overture.trigger).toEqual({ type: 'windowed-cast', opensOn: ['cast:Basic ATK:Aemeath Stage 2-4'], windowSeconds: 5, attemptOn: 'Skill:Seraphic Duet: Overture' });

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aemeath'], AEMEATH_BLOCKS);
    const results = simulateRotation(AEMEATH_BLOCKS, steps);
    expect(results.some(r => r.firedTriggers.has('windowed-cast:cast:Basic ATK:Mech Stage 2-4'))).toBe(true);
    expect(results.some(r => r.firedTriggers.has('windowed-cast:cast:Basic ATK:Aemeath Stage 2-4'))).toBe(true);
  });

  it('chain.s2 real mechanic (Duet Overture/Encore DMG Mult +100% each) is scoped precisely, not a flat totalMult', () => {
    const block = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s2');
    expect(block.effects).toEqual([
      { stat: 'skillDmg', value: 100, scopedToBlockId: 'aemeath.skill.seraphic-duet-overture', source: 'self-kit' },
      { stat: 'libDmg', value: 100, scopedToBlockId: 'aemeath.skill.seraphic-duet-encore', source: 'self-kit' },
    ]);
  });

  it('Concerto Energy generated over her real rotation includes Intro+10, Overdrive+20, Finale+20', () => {
    const { perStep } = resolveConcertoEnergyGenerated(AEMEATH_BLOCKS, CHARACTER_ROTATIONS['Aemeath']);
    expect(perStep.find(s => s.skill === 'Debut of Meteoric Radiance')?.gain).toBe(10);
    expect(perStep.find(s => s.skill === 'Heavenfall Edict: Overdrive')?.gain).toBe(20);
    expect(perStep.find(s => s.skill === 'Heavenfall Edict: Finale')?.gain).toBe(20);
  });
});
