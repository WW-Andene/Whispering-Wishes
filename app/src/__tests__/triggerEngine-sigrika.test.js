import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { SIGRIKA_BLOCKS } from '../engine/characterBlocks/sigrika.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Sigrika', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(SIGRIKA_BLOCKS, 'Sigrika');
  });

  it('S3 stays correctly unmodeled (no block) — pure resource-cap utility, zero DPS component, fixed 2026-09-02', () => {
    const rc = RESONANCE_CHAIN_DATA['Sigrika'];
    expect(rc.s3).toEqual({});
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s3')).toBeUndefined();
  });

  it('S1,S2,S4,S5,S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Sigrika'];
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s1').effects[0].value).toBe(rc.s1.totalMult);
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s2').effects[0].value).toBe(rc.s2.echoDmg);
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s5').effects[0].value).toBe(rc.s5.echoDmg);
    expect(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s6').effects[0].value).toBe(rc.s6.deepen);
  });

  it('selfBuffs match CHAR_BUFF_TABLE at their documented cap/max-stack values', () => {
    const legacy = CHAR_BUFF_TABLE['Sigrika'];
    const er = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.selfbuff.aligned-names');
    const elem = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.libbuff.blessing-of-runes-elemdmg');
    const echo = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.libbuff.blessing-of-runes-echodmg');
    expect(er.effects[0].value).toBe(legacy.selfBuffs[0].value);
    expect(elem.effects[0].value).toBe(legacy.selfBuffs[1].value);
    expect(echo.effects[0].value).toBe(legacy.selfBuffs[2].value);
    expect(elem.target.scope).toBe('whole-team');
  });

  it('chain.s1 (2026-09-04 fix) is scoped via scopedToBlockId to exactly the 4 moves the node names, at the real un-averaged 70% value, not an unscoped rotation-averaged approximation', () => {
    const rc = RESONANCE_CHAIN_DATA['Sigrika'];
    expect(rc.s1).toEqual({ totalMult: 70 });
    const s1 = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s1');
    const scopedIds = s1.effects.map(e => e.scopedToBlockId).sort();
    expect(scopedIds).toEqual([
      'sigrika.basic.dodge-counter-decipher',
      'sigrika.basic.elucidated',
      'sigrika.skill.big-boomy-boom',
      'sigrika.skill.soliskin-to-the-aid',
    ].sort());
    expect(s1.effects.every(e => e.stat === 'totalMult' && e.value === 70)).toBe(true);
    // none of the scoped block IDs may be missing from the block set
    scopedIds.forEach(id => expect(SIGRIKA_BLOCKS.find(b => b.id === id)).toBeDefined());
  });

  it('BIG BOOMY BOOM! / Soliskin to the Aid / Dodge Counter - Decipher (2026-09-04 fix) are modeled as echoDmg damage blocks with their own real multipliers, not fabricated', () => {
    const boom = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.skill.big-boomy-boom');
    const soliskin = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.skill.soliskin-to-the-aid');
    const dodge = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.basic.dodge-counter-decipher');
    expect(boom.damage.category).toBe('echoDmg');
    expect(soliskin.damage.category).toBe('echoDmg');
    expect(dodge.damage.category).toBe('echoDmg');
    expect(dodge.damage.hits).toEqual(SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.basic.elucidated').damage.hits);
  });

  it("Runic Chain Whip (2026-09-04 fix) uses its own distinct multiplier row, not Runic Outburst's borrowed one", () => {
    const chainWhip = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.forte.schemata-chain-whip');
    const outburst = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.forte.schemata-runic-outburst');
    expect(chainWhip.damage.hits).not.toEqual(outburst.damage.hits);
  });

  it('every Sigrika damage block has a damage.category set', () => {
    SIGRIKA_BLOCKS.filter(b => b.kind === 'damage').forEach(b => {
      expect(b.damage.category, `block ${b.id} missing damage.category`).toBeTruthy();
    });
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Sigrika'], SIGRIKA_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(SIGRIKA_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'aero', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('sigrika.intro.solsworn-etymology')).toBe(true);
    expect(fired.has('sigrika.liberation.where-trust-leads-me')).toBe(true);
    expect(fired.has('sigrika.forte.learn-my-true-name')).toBe(true);
    expect(fired.has('sigrika.forte.schemata-chain-whip')).toBe(true);
  });
});
