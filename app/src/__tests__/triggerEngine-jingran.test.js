import { describe, it, expect } from 'vitest';
import { JINGRAN_BLOCKS } from '../engine/characterBlocks/jingran.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';

// Jingran has no CHARACTER_ROTATIONS entry yet (unreleased, no sourced rotation — see
// jingran.blocks.js's own header comment), so there is no rotation-derived hit-composed-DPS test
// here the way every other character's triggerEngine-*.test.js has — that would require inventing
// a rotation order, exactly what this file's own sourcing discipline forbids. This test only
// covers what's actually sourced: schema validity and the Resonance Chain stat contributions.
describe('triggerEngine parity — Jingran', () => {
  it('every block matches the canonical schema', () => {
    expectValidBlockFile(JINGRAN_BLOCKS, 'Jingran');
  });

  it('is not in BLOCKS_BY_CHARACTER (no CHARACTER_ROTATIONS entry to pair it with yet)', async () => {
    const { BLOCKS_BY_CHARACTER } = await import('../engine/characterBlocks/index.js');
    expect(BLOCKS_BY_CHARACTER['Jingran']).toBeUndefined();
  });

  it('Resonance Chain S1/S2/S3/S6 buffs match RESONANCE_CHAIN_DATA', () => {
    const chainBlocks = JINGRAN_BLOCKS.filter(b => b.id.startsWith('jingran.chain.'));
    const stats = { skillDmg: 0, heavyDmg: 0, atkPct: 0 };
    resolveTriggerBlocks(chainBlocks, { firedTriggers: new Set(['passive']) }, stats);
    expect(stats.skillDmg).toBe(80); // S1
    expect(stats.heavyDmg).toBe(46 + 40); // S2 + S6
    expect(stats.atkPct).toBe(15); // S3
  });

  it('Yin/Yang Basic ATK blocks are stance-gated, not both unconditional', () => {
    const yin = JINGRAN_BLOCKS.find(b => b.id === 'jingran.basic.drink-soul');
    const yang = JINGRAN_BLOCKS.find(b => b.id === "jingran.basic.devils-bane");
    expect(yin.condition.requiresStance).toBe('Yin Vessel');
    expect(yang.condition.requiresStance).toBe('Yang Font');
  });

  it('Outro damage uses ATK basis (explicit "795% ATK" in source), unlike every other HP-basis block', () => {
    const outro = JINGRAN_BLOCKS.find(b => b.id === 'jingran.outro.rising-fortune-and-ebbing-evil');
    expect(outro.damage.basis).toBe('ATK');
    const heavy = JINGRAN_BLOCKS.find(b => b.id === 'jingran.heavy.soul-raid');
    expect(heavy.damage.basis).toBe('HP');
  });
});
