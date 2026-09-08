import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { simulateRotation, deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { BULING_BLOCKS } from '../engine/characterBlocks/buling.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Buling', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(BULING_BLOCKS, 'Buling');
  });

  it("Mountain Over Thunder's resource-threshold trigger (Trigram-Mountain gate) fires exactly once per rotation — regression test for a real double-fire bug (2026-09-06): pairing a resourceStepOn-anchored trigger with a resourceGain on the SAME resource name makes it fire twice (once dynamically the instant the gain crosses threshold, again at the anchored step). No block in this file may declare `resourceGain` for 'Trigram-Mountain' or 'Trigram-Thunder' — see buling.heavy.mountain-over-thunder's own note.", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Buling'], BULING_BLOCKS);
    const results = simulateRotation(BULING_BLOCKS, steps);
    const firings = results.filter(r => r.firedTriggers.has('resource-threshold:Trigram-Mountain:1'));
    expect(firings.length).toBe(1);
    expect(BULING_BLOCKS.some(b => b.resourceGain?.some(rg => rg.resource === 'Trigram-Mountain' || rg.resource === 'Trigram-Thunder'))).toBe(false);
  });

  it("dmgFocus is ['Basic ATK', 'Skill', 'Liberation'] — was ['Liberation'] only despite 5 real basicDmg blocks and 1 real skillDmg block firing every real rotation loop", () => {
    expect(CHARACTER_DATA['Buling'].dmgFocus).toEqual(['Basic ATK', 'Skill', 'Liberation']);
  });

  it("intro.summon-and-smite is categorized 'skillDmg' — fixed 2026-09-04 (Phase A REDO): was uncategorized, silently rejecting Resonance Skill DMG Bonus; the source dump's own Intro Skill multiplier row is literally labeled \"Skill Damage\"", () => {
    expect(BULING_BLOCKS.find(b => b.id === 'buling.intro.summon-and-smite').damage.category).toBe('skillDmg');
  });

  // Added 2026-09-08 (full re-audit): SKILL_MULTIPLIERS['Buling'] carries a separate "Pull-in Effect"
  // row (5.84%×10) for the SAME Resonance Skill cast as Thunder Talisman — one kit-text sentence
  // ("Attacks the target, Electro DMG, continuously pulls in nearby targets") describing both, but no
  // block ever referenced the pull-in row, with no comment explaining the omission (unlike every other
  // real gap in this file). Now folded into the same block's hit list.
  it('Thunder Talisman includes the real Pull-in Effect continuous DMG (58.40% + 5.84%×10)', () => {
    const skill = BULING_BLOCKS.find(b => b.id === 'buling.skill.thunder-talisman');
    const total = skill.damage.hits.reduce((s, h) => s + (h.atkPct || 0), 0);
    expect(total).toBeCloseTo(58.40 + 5.84 * 10, 2);
  });

  // Added 2026-09-08 (full re-audit): Basic ATK Stage 3, its Dodge Counter alias, the Thunder Over
  // Mountain Heavy ATK sibling, and the base (non-enhanced) Liberation are all real, sourced moves
  // with no block anywhere in this file previously — present and sourced but inert (confirmed unused
  // in her canonical modeled rotation), matching the established completeness convention elsewhere.
  it('Stage 3/Dodge Counter/Thunder Over Mountain/base Liberation are present and sourced but inert', () => {
    const stage3 = BULING_BLOCKS.find(b => b.id === 'buling.basic.stage3');
    const dodge = BULING_BLOCKS.find(b => b.id === 'buling.dodge.counter');
    const thunderOverMountain = BULING_BLOCKS.find(b => b.id === 'buling.heavy.thunder-over-mountain');
    const baseLib = BULING_BLOCKS.find(b => b.id === 'buling.liberation.flashing-thunder-spell-base');
    expect(stage3.damage.hits).toEqual([{ atkPct: 23.51 }, { atkPct: 23.51 }]);
    expect(dodge.damage.hits).toEqual([{ atkPct: 23.51 }, { atkPct: 23.51 }]);
    expect(thunderOverMountain.damage.hits).toEqual([{ atkPct: 89.47 }]);
    expect(baseLib.damage.hits).toEqual([{ atkPct: 357.86 }]);
    const rotationLabels = new Set(CHARACTER_ROTATIONS['Buling'].map(s => `${s.type}:${s.skill}`));
    [stage3, dodge, thunderOverMountain, baseLib].forEach(b => {
      expect(rotationLabels.has(b.trigger.on)).toBe(false);
    });
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
