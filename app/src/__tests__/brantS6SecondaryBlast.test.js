// the engine-merge history (git log) Phase 0.5 gap #6 — a %-of-another-block's-damage mechanic. Brant's S6 grants
// Returned from Ashes a secondary blast worth 30% of its own DMG, previously unrepresented (kept as a
// TODO on the chain.s6 totalMult block's note, no real damage modeled). Turns out to need no new
// %-of-another-block field at all: since the secondary blast fires at the SAME instant under the SAME
// active buffs as the base hit, a plain proportional %ATK hit scales identically through the shared
// crit/dmgBonus/defMult/resMult chain.
import { describe, it, expect } from 'vitest';
import { sumHitsAtkPct } from '../engine/shared/skillMultiplierParser.js';
import { resolveHitComposedDps } from '../engine/composition/resolveHitComposedDps.js';
import { BRANT_BLOCKS } from '../engine/characterBlocks/brant.blocks.js';

describe("Brant S6 secondary blast (the engine-merge history (git log) Phase 0.5 gap #6)", () => {
  it('the secondary blast is exactly 30% of the base hit\'s own summed %ATK', () => {
    const base = BRANT_BLOCKS.find(b => b.id === 'brant.forte.returned-from-ashes');
    const secondary = BRANT_BLOCKS.find(b => b.id === 'brant.chain.s6-secondary-blast');
    const baseTotal = sumHitsAtkPct(base.damage.hits);
    expect(secondary.damage.hits[0].atkPct).toBeCloseTo(baseTotal * 0.3, 1);
  });

  it('is gated to sequence 6+ and fires proportionally to the base hit at the same instant', () => {
    const steps = [{ owner: 'Brant', type: 'Forte', skill: 'Returned from Ashes', stepSeconds: 1 }];
    const enemyContext = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const at0 = resolveHitComposedDps(BRANT_BLOCKS, steps, enemyContext, 3000, 'fusion', 'Main DPS', null, 0);
    const at6 = resolveHitComposedDps(BRANT_BLOCKS, steps, enemyContext, 3000, 'fusion', 'Main DPS', null, 6);
    expect(at0.hitLog.some(h => h.blockId === 'brant.chain.s6-secondary-blast')).toBe(false);
    expect(at6.hitLog.some(h => h.blockId === 'brant.chain.s6-secondary-blast')).toBe(true);
    // At S6, total damage should be at least 30% higher than at S0 (the secondary blast alone), plus
    // whatever the totalMult:30 Mid-air buff and other S6-gated chain nodes also add.
    expect(at6.totalDamage).toBeGreaterThan(at0.totalDamage * 1.3);
  });
});
