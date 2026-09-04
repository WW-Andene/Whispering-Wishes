import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { CALCHARO_BLOCKS } from '../engine/characterBlocks/calcharo.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Calcharo', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(CALCHARO_BLOCKS, 'Calcharo');
  });

  it('CHAR_BUFF_TABLE is empty — no buff blocks modeled', () => {
    const legacy = CHAR_BUFF_TABLE['Calcharo'];
    expect(legacy.outroBuffs).toEqual([]);
    expect(legacy.libBuffs).toEqual([]);
    expect(legacy.selfBuffs).toEqual([]);
    expect(legacy.debuffs).toEqual([]);
  });

  it('S1 stays correctly unmodeled (no block) — pure Energy-regen utility per RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Calcharo'];
    expect(rc.s1).toEqual({ totalMult: 0 });
    expect(CALCHARO_BLOCKS.find(b => b.id === 'calcharo.chain.s1')).toBeUndefined();
  });

  it('S2/S3/S4/S5 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Calcharo'];
    expect(CALCHARO_BLOCKS.find(b => b.id === 'calcharo.chain.s2').effects[0].value).toBe(rc.s2.skillDmg);
    expect(CALCHARO_BLOCKS.find(b => b.id === 'calcharo.chain.s3').effects[0].value).toBe(rc.s3.elemDmg);
    expect(CALCHARO_BLOCKS.find(b => b.id === 'calcharo.chain.s4').effects[0].value).toBe(rc.s4.elemDmg);
    expect(CALCHARO_BLOCKS.find(b => b.id === 'calcharo.chain.s5').effects[0].value).toBe(rc.s5.totalMult);
  });

  it("S4 is whole-team scoped and cast-triggered on Outro, with a real 30s duration — fixed 2026-09-03 from a passive self-scoped duration-less buff", () => {
    const s4 = CALCHARO_BLOCKS.find(b => b.id === 'calcharo.chain.s4');
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.trigger.type).toBe('cast');
    expect(s4.trigger.on).toBe('Outro:Shadowy Raid');
    expect(s4.timing.duration).toBe(30);
  });

  it('S6 is modeled as a real 2x100% ATK proc-damage block, not the flat totalMult:200 fallback', () => {
    const rc = RESONANCE_CHAIN_DATA['Calcharo'];
    expect(rc.s6).toEqual({ totalMult: 200 });
    expect(CALCHARO_BLOCKS.find(b => b.id === 'calcharo.chain.s6')).toBeUndefined();
    const s6 = CALCHARO_BLOCKS.find(b => b.id === 'calcharo.chain.s6-phantoms');
    expect(s6.kind).toBe('damage');
    expect(s6.damage.hits).toEqual([{ atkPct: 100 }, { atkPct: 100 }]);
    expect(s6.damage.category).toBe('libDmg');
  });

  it('S6 phantoms and Death Messenger fire together on the same resource-threshold event', () => {
    const forte = CALCHARO_BLOCKS.find(b => b.id === 'calcharo.forte.death-messenger');
    const s6 = CALCHARO_BLOCKS.find(b => b.id === 'calcharo.chain.s6-phantoms');
    expect(forte.trigger.resourceStepOn).toBe(s6.trigger.resourceStepOn);
    expect(forte.trigger.type).toBe('resource-threshold');
    expect(s6.trigger.type).toBe('resource-threshold');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total, with Death Messenger and its S6 phantoms both firing', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Calcharo'], CALCHARO_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(CALCHARO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'electro', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('calcharo.intro.wanted-outlaw')).toBe(true);
    expect(fired.has('calcharo.liberation.phantom-etching')).toBe(true);
    expect(fired.has('calcharo.basic.hounds-roar')).toBe(true);
    expect(fired.has('calcharo.outro.shadowy-raid')).toBe(true);
    expect(fired.has('calcharo.forte.death-messenger')).toBe(true);
    expect(fired.has('calcharo.chain.s6-phantoms')).toBe(true);
  });

  it("Intro (Wanted Outlaw) is skillDmg-categorized (was uncategorized) — dump's own multiplier row is labeled generically \"Skill Damage\"", () => {
    const intro = CALCHARO_BLOCKS.find(b => b.id === 'calcharo.intro.wanted-outlaw');
    expect(intro.damage.category).toBe('skillDmg');
  });

  it("Outro (Shadowy Raid) is outroDmg-categorized (was uncategorized) — his own kit text: own direct damage, not a team buff", () => {
    const outro = CALCHARO_BLOCKS.find(b => b.id === 'calcharo.outro.shadowy-raid');
    expect(outro.damage.category).toBe('outroDmg');
  });

  it("dmgFocus gains 'Outro' (real 7.6% share, now outroDmg-categorized) — Intro (5.1%) and Echo (5.2%, generic equipped-Echo damage) both stay excluded per this project's own precedent", () => {
    expect(CHARACTER_DATA['Calcharo'].dmgFocus).toEqual(['Liberation', 'Basic ATK', 'Outro']);
  });
});
