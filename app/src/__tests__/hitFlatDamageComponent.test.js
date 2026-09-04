// the engine-merge history (git log) Phase 0.5 gap #8 — a flat (non-%ATK) additive damage component alongside a
// %ATK hit, e.g. Buling's Twin Thunders: "169 flat + 18.30% ATK". Previously only the %ATK portion
// was modeled (no field existed for the flat term at all). This tests both the parser helper and the
// resolvers' damage formula treat it as part of the base-damage term (added before crit/dmgBonus/
// defMult/resMult), not a separate standalone hit.
import { describe, it, expect } from 'vitest';
import { parseSkillMultiplierHits } from '../engine/math/hitParser.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';

describe('DamageHits.flat — non-%ATK additive component (the engine-merge history (git log) Phase 0.5 gap #8)', () => {
  it('parseSkillMultiplierHits attaches a flat value to the first parsed hit only', () => {
    const hits = parseSkillMultiplierHits('18.30%', 169);
    expect(hits).toEqual([{ atkPct: 18.30, flat: 169 }]);
  });

  it('a multi-hit string with a flat value only tags the first hit', () => {
    const hits = parseSkillMultiplierHits('10%×3', 50);
    expect(hits[0]).toEqual({ atkPct: 10, flat: 50 });
    expect(hits[1]).toEqual({ atkPct: 10 });
    expect(hits[2]).toEqual({ atkPct: 10 });
  });

  it('omitting flat leaves hits unchanged (no regression)', () => {
    expect(parseSkillMultiplierHits('18.30%')).toEqual([{ atkPct: 18.30 }]);
  });

  it('resolveHitComposedDps adds the flat term to the base-damage before crit/dmgBonus/defMult', () => {
    const block = {
      id: 'test.flat-hit', source: 'Test', kind: 'damage',
      trigger: { type: 'cast', on: 'Skill:Test' },
      timing: {}, target: { scope: 'self' }, effects: [],
      damage: { hits: [{ atkPct: 0, flat: 1000 }], category: 'skillDmg' },
    };
    const steps = [{ owner: 'Test', type: 'Skill', skill: 'Test', stepSeconds: 1 }];
    const { totalDamage } = resolveHitComposedDps([block], steps, { enemyDef: 0, enemyRes: 0 }, { atk: 1000 });
    // 0% ATK + 1000 flat, no crit (base crit rate applies an avg multiplier), no dmg bonus (all zero
    // stats) — with 0 enemyDef/enemyRes, defMult/resMult are both exactly 1, isolating the flat term's
    // own contribution against the base crit multiplier only.
    expect(totalDamage).toBeGreaterThan(1000);
    expect(totalDamage).toBeLessThan(1500);
  });
});
