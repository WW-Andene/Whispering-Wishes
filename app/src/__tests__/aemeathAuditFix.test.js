// Regression tests found while cross-checking Aemeath against a fresh the source.gg source dump
// (following the same treatment already applied to Augusta and Yuanwu).
import { describe, it, expect } from 'vitest';
import { CHARACTER_DATA, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { AEMEATH_BLOCKS } from '../engine/characterBlocks/aemeath.blocks.js';

describe('Aemeath — final audit pass fixes', () => {
  it("dmgFocus no longer includes 'Skill' — her real damage-output simulation shows a genuine 0% Skill share (both Seraphic Duet casts are counted as Liberation DMG)", () => {
    expect(CHARACTER_DATA['Aemeath'].dmgFocus).toEqual(['Liberation']);
  });

  it('Resonance Chain S5 has no DPS component in either RESONANCE_CHAIN_DATA or the engine block', () => {
    // S5 (Starflux reset on kill / revive-on-fatal-damage) is purely survivability/utility — no DPS
    // component per its own kit text. Was a fabricated totalMult:40 in both places, never covered by
    // this row's own audit comment (unlike every other node). Independently confirmed via the source's own
    // simulation: S4 and S5 produce byte-identical DMG/DPS (2,581,963 / 220,869 both).
    expect(RESONANCE_CHAIN_DATA['Aemeath'].s5).toEqual({});
    const s5 = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.chain.s5');
    expect(s5.effects).toEqual([]);
  });

  it('Heavenfall Edict Overdrive/Finale carry the real (not ~1.0754x inflated) Lv.10 multipliers', () => {
    // Every other Aemeath row matched the fresh dump exactly; only this one was systematically off by
    // a consistent ~1.0754x across all 4 hit values.
    const overdrive = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.liberation.heavenfall-edict-overdrive');
    expect(overdrive.damage.hits.map(h => h.atkPct)).toEqual([186.72, 248.96, 248.96, 248.96]);

    const finale = AEMEATH_BLOCKS.find(b => b.id === 'aemeath.liberation.heavenfall-edict-finale');
    expect(finale.damage.hits.map(h => h.atkPct)).toEqual([1663.83]);
  });
});
