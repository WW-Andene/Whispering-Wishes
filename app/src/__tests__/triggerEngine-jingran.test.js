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

  // Updated 2026-09-07 (real-kit rewrite against Data dump/Jingran/Jingran.md): S1/S2 are now
  // scopedToBlockId'd (2 skillDmg@80 + 2 heavyDmg@80 for S1; 2 heavyDmg@46 for S2) instead of one
  // flat unscoped entry each — resolveTriggerBlocks doesn't filter by scope, so it sums every
  // matching-stat effect regardless (the same known legacy-flat-panel limitation documented on
  // Aalto's own scopedToBlockId blocks), giving 160 skillDmg (2×80) and 80+92=172 heavyDmg total
  // (S1's 2 heavyDmg@80 + S2's 2 heavyDmg@46) plus S6's flat 40 = 212. S3/S4/S5 no longer carry any
  // stat at all (their prior unsourced placeholder values were zeroed — see RESONANCE_CHAIN_DATA's
  // own updated comment), and S6 now also contributes a totalMult:80 (Chimei Wangliang's own scoped
  // multiplier, not summed into heavyDmg).
  it('Resonance Chain S1/S2/S6 buffs match the real, scoped kit text', () => {
    const chainBlocks = JINGRAN_BLOCKS.filter(b => b.id.startsWith('jingran.chain.'));
    const stats = { skillDmg: 0, heavyDmg: 0, atkPct: 0 };
    // resolveTriggerBlocks does NOT write 'totalMult' effects onto `stats` — it accumulates them
    // separately and returns the sum (see the module's own comment on that line), matching
    // calcEngine.js's own totalMult architecture.
    const totalMultBonus = resolveTriggerBlocks(chainBlocks, { firedTriggers: new Set(['passive']) }, stats);
    expect(stats.skillDmg).toBe(80 + 80); // S1: Encroaching Yin + Scorching Yang, 80 each
    expect(stats.heavyDmg).toBe(80 + 80 + 46 + 46 + 40); // S1: Netherworld Traverse + Afterlife's Guide (80 each) + S2: Soul Raid + Stardome Meander (46 each) + S6 flat 40
    expect(totalMultBonus).toBe(80); // S6: Chimei Wangliang's own DMG Multiplier
    expect(stats.atkPct).toBe(0); // S3 has no representable stat, correctly zero
  });

  it('Yin/Yang Basic ATK blocks are stance-gated, not both unconditional', () => {
    const yin = JINGRAN_BLOCKS.find(b => b.id === 'jingran.basic.drink-soul-stage1-2');
    const yang = JINGRAN_BLOCKS.find(b => b.id === "jingran.basic.devils-bane-stage1-2");
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
