import { describe, it, expect } from 'vitest';
import { createStats, applyResonanceChain } from '../features/teams/calcEngine.js';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { AALTO_BLOCKS } from '../engine/characterBlocks/aalto.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';
import { resolveConcertoEnergyGenerated } from '../engine/resolver/dps/resolveConcertoEnergy.js';

describe('triggerEngine parity — Aalto', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(AALTO_BLOCKS, 'Aalto');
  });

  it('Resonance Chain S2/S4/S6 buffs match RESONANCE_CHAIN_DATA (passive-only comparison)', () => {
    // S5 excluded from this blanket passive comparison (2026-09-08 full-kit audit): it's now two real
    // cast-anchored blocks (see its own dedicated test below), not an unconditional passive — the same
    // "flat legacy comparison only covers genuinely-unconditional nodes" pattern already established
    // for Hiyuki/Lucilla's own dual-mode/cast-anchored chain nodes.
    const legacyStats = createStats();
    applyResonanceChain(legacyStats, 'Aalto', 6, true);
    const blockStats = createStats();
    // Scoped to chain.* blocks only — resolveTriggerBlocks has no concept of "just the chain", and
    // AALTO_BLOCKS now also carries a real, unrelated passive (aalto.buff.minor-fortes, added in the
    // 2026-09-05 dump completeness pass) that would otherwise leak into this chain-specific comparison.
    const chainBlocks = AALTO_BLOCKS.filter(b => b.id.startsWith('aalto.chain.') && b.trigger.type === 'passive');
    resolveTriggerBlocks(chainBlocks, { firedTriggers: new Set(['passive']), targetElementLower: 'aero', targetRole: 'Sub DPS' }, blockStats);
    expect(blockStats.atkPct).toBe(legacyStats.atkPct);
    // skillDmg no longer compared 1:1 with the legacy flat total: chain.s4 is now scoped
    // (scopedToBlockId), which the legacy flat stat-panel path (applyResonanceChain/applyBuff) has no
    // concept of and always applies broadly — the two paths are expected to diverge here by design,
    // not a bug (same known, documented gap as aalto.liberation.gate-atk-buff's own scoping note).
    // blockStats.elemDmg intentionally not compared here either — S5's real +25% is excluded from
    // this passive-only block list (see the dedicated cast-anchored test below).
    expect(blockStats.cr - 5).toBe(legacyStats.cr - 5);
    expect(blockStats.heavyDmg).toBe(legacyStats.heavyDmg);
  });

  it('chain.s4 (Mist Bullets DMG+30%) is scoped to Shift Trick/Misty Cover only, not Feint Shot (also skillDmg-category, real over-crediting bug fixed 2026-09-08)', () => {
    const s4 = AALTO_BLOCKS.find(b => b.id === 'aalto.chain.s4');
    expect(s4.effects[0].scopedToBlockId).toEqual(['aalto.skill.shift-trick', 'aalto.forte.misty-cover']);
    // Isolate S4 specifically (not S2's ATK%/S6's Crit Rate, which legitimately affect every hit
    // including Feint Shot) — compare the full chain against the full chain minus only chain.s4.
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aalto'], AALTO_BLOCKS);
    const withoutS4 = resolveHitComposedDps(AALTO_BLOCKS.filter(b => b.id !== 'aalto.chain.s4'), steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 1000, 'aero', 'Sub DPS', null, 6);
    const withChain = resolveHitComposedDps(AALTO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 1000, 'aero', 'Sub DPS', null, 6);
    const feintWithoutS4 = withoutS4.hitLog.find(h => h.blockId === 'aalto.intro.feint-shot').damage;
    const feintWithChain = withChain.hitLog.find(h => h.blockId === 'aalto.intro.feint-shot').damage;
    // Feint Shot must be UNAFFECTED by S4's scoped Mist Bullets buff (it's not a Mist Bullet move) —
    // adding/removing chain.s4 specifically must not move Feint Shot's damage at all.
    expect(feintWithChain).toBeCloseTo(feintWithoutS4, 5);
    // But Shift Trick (a real Mist Bullet move) MUST be affected by chain.s4 — proving the scope
    // isn't just silently matching nothing.
    const shiftWithoutS4 = withoutS4.hitLog.find(h => h.blockId === 'aalto.skill.shift-trick').damage;
    const shiftWithChain = withChain.hitLog.find(h => h.blockId === 'aalto.skill.shift-trick').damage;
    expect(shiftWithChain).toBeGreaterThan(shiftWithoutS4);
  });

  it('chain.s5 (Mistcloak Dash Aero DMG+25%) is a real 6s window anchored to Shift Trick/Misty Cover casts, not a permanent passive (fixed 2026-09-08)', () => {
    const shiftTrick = AALTO_BLOCKS.find(b => b.id === 'aalto.chain.s5-shift-trick');
    const mistyCover = AALTO_BLOCKS.find(b => b.id === 'aalto.chain.s5-misty-cover');
    expect(shiftTrick.trigger).toEqual({ type: 'cast', on: 'Skill:Shift Trick' });
    expect(mistyCover.trigger).toEqual({ type: 'cast', on: 'Forte:Misty Cover' });
    expect(shiftTrick.timing.duration).toBe(6);
    expect(mistyCover.timing.duration).toBe(6);
    expect(shiftTrick.effects[0]).toEqual({ stat: 'elemDmg', value: 25, source: 'self-kit' });
    expect(mistyCover.effects[0]).toEqual({ stat: 'elemDmg', value: 25, source: 'self-kit' });
    // No more unconditional 'passive' S5 block left over from before the fix.
    expect(AALTO_BLOCKS.find(b => b.id === 'aalto.chain.s5')).toBeUndefined();
  });

  it('Dissolving Mist outro buff matches CHAR_BUFF_TABLE.outroBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Aalto'].outroBuffs[0];
    const block = AALTO_BLOCKS.find(b => b.id === 'aalto.outro.dissolving-mist');
    expect(block.effects[0].value).toBe(legacy.value);
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Aalto'], AALTO_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(AALTO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 2500, 'aero', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('aalto.basic.half-truths')).toBe(true);
    expect(fired.has('aalto.liberation.flower-in-the-mist')).toBe(true);
  });

  it("Intro (Feint Shot) and Forte (Misty Cover) are both skillDmg-categorized (were uncategorized)", () => {
    const intro = AALTO_BLOCKS.find(b => b.id === 'aalto.intro.feint-shot');
    const forte = AALTO_BLOCKS.find(b => b.id === 'aalto.forte.misty-cover');
    expect(intro.damage.category).toBe('skillDmg');
    expect(forte.damage.category).toBe('skillDmg');
  });

  it("dmgFocus is ['Basic ATK', 'Skill', 'Liberation'] — was ['Coordinated ATK'], fabricated: Aalto has no Coordinated Attack mechanic anywhere in his kit", () => {
    expect(CHARACTER_DATA['Aalto'].dmgFocus).toEqual(['Basic ATK', 'Skill', 'Liberation']);
  });

  it('Mid-air Attack, Dodge Counter, Heavy ATK (Aimed Shot), and Minor Fortes exist — added 2026-09-05 against Data dump/Aalto/Aalto.md, previously absent entirely', () => {
    const midair = AALTO_BLOCKS.find(b => b.id === 'aalto.midair.attack');
    const dodge = AALTO_BLOCKS.find(b => b.id === 'aalto.basic.dodge-counter');
    const heavy = AALTO_BLOCKS.find(b => b.id === 'aalto.heavy.aimed-shot');
    const minorFortes = AALTO_BLOCKS.find(b => b.id === 'aalto.buff.minor-fortes');
    expect(midair.damage.category).toBe('basicDmg');
    expect(dodge.damage.category).toBe('basicDmg');
    expect(heavy.section).toBe('HeavyATK');
    expect(heavy.damage.category).toBe('heavyDmg');
    expect(minorFortes.effects).toEqual([
      { stat: 'elemDmg', value: 12, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ]);
  });

  it("Concerto Energy generated over his real rotation totals 45 (Intro+10, Skill+15, Liberation+20) — added 2026-09-05 per user direction, Aalto as blueprint", () => {
    const { total, perStep } = resolveConcertoEnergyGenerated(AALTO_BLOCKS, CHARACTER_ROTATIONS['Aalto']);
    expect(total).toBe(45);
    expect(perStep.find(s => s.skill === 'Feint Shot')?.gain).toBe(10);
    expect(perStep.find(s => s.skill === 'Shift Trick')?.gain).toBe(15);
    expect(perStep.find(s => s.skill === 'Flower in the Mist')?.gain).toBe(20);
  });

  it("Gate of Quandary ATK+10% buff exists, scoped to the two Mist Bullet blocks — added 2026-09-05 category-C pass, dump's own 'Gate of Quandary ATK Increase: 10.00%' row was entirely untagged before", () => {
    const gateBuff = AALTO_BLOCKS.find(b => b.id === 'aalto.liberation.gate-atk-buff');
    expect(gateBuff.trigger).toEqual({ type: 'cast', on: 'Liberation:Flower in the Mist' });
    expect(gateBuff.timing.duration).toBe(10);
    expect(gateBuff.effects).toEqual([
      { stat: 'atkPct', value: 10, source: 'self-kit', scopedToBlockId: 'aalto.skill.shift-trick' },
      { stat: 'atkPct', value: 10, source: 'self-kit', scopedToBlockId: 'aalto.forte.misty-cover' },
    ]);
  });

  it('Inherent Skills (Perfect Performance, Mid-game Break) exist as documented inert blocks — added 2026-09-05 category-C pass, previously absent entirely', () => {
    const perfectPerformance = AALTO_BLOCKS.find(b => b.id === 'aalto.inherent.perfect-performance');
    const midGameBreak = AALTO_BLOCKS.find(b => b.id === 'aalto.inherent.mid-game-break');
    expect(perfectPerformance.kind).toBe('utility');
    expect(midGameBreak.kind).toBe('utility');
  });
});
