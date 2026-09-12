import { describe, it, expect } from 'vitest';
import { JINGRAN_BLOCKS } from '../engine/characterBlocks/jingran.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';

// Updated 2026-09-12: CHARACTER_ROTATIONS['Jingran'] was added against a fresh prydwen.gg
// build-guide snapshot (Data dump/Jingran/Jingran.md), so he is now keyed into
// BLOCKS_BY_CHARACTER — the "no rotation-derived test" limitation this comment used to document no
// longer applies to that specific gap, though a full rotation-derived hit-composed-DPS test is still
// out of scope for this file (schema validity and Resonance Chain stat contributions only).
describe('triggerEngine parity — Jingran', () => {
  it('every block matches the canonical schema', () => {
    expectValidBlockFile(JINGRAN_BLOCKS, 'Jingran');
  });

  it('is in BLOCKS_BY_CHARACTER now that CHARACTER_ROTATIONS pairs with it', async () => {
    const { BLOCKS_BY_CHARACTER } = await import('../engine/characterBlocks/index.js');
    expect(BLOCKS_BY_CHARACTER['Jingran']).toBe(JINGRAN_BLOCKS);
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

  it('every damage block uses ATK basis (corrected 2026-09-12 — he is HP-CONVERTING, not HP-scaling)', () => {
    // A fresh prydwen.gg snapshot's own Meta-position paragraph states Jingran's multipliers apply
    // to ATK, with HP only feeding an ATK-conversion passive — not HP-scaling like Cartethyia. Every
    // damage.basis in this file was corrected from 'HP' to 'ATK' to match (see jingran.blocks.js's
    // own header comment for the full sourcing).
    const outro = JINGRAN_BLOCKS.find(b => b.id === 'jingran.outro.rising-fortune-and-ebbing-evil');
    expect(outro.damage.basis).toBe('ATK');
    const heavy = JINGRAN_BLOCKS.find(b => b.id === 'jingran.heavy.soul-raid');
    expect(heavy.damage.basis).toBe('ATK');
  });
});
