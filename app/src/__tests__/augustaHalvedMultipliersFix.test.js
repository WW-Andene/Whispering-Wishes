// Regression test found while re-auditing Augusta's kit against a fresh the source.gg source dump
// (requested by the user directly: "correct Augusta data" following the S5 fabricated-value fix).
// Every single one of her 22 Lv.10 damage multipliers in SKILL_MULTIPLIERS['Augusta'] — and the 11
// matching damage blocks in the live TriggerBlock engine (augusta.blocks.js), which feed the actual
// damage calculator — was off by a consistent ~1.988x ratio (i.e. roughly HALF the real value).
// Computed the new/old ratio for all 22 values: every one landed at 1.986-1.991, ruling out rounding
// noise. This is the exact "halving pattern" bug class already found and fixed for Camellya/Carlotta/
// Roccia/Phoebe/Brant (see the comment on Brant's own SKILL_MULTIPLIERS row) — just missed for Augusta
// until now. A high-impact, live-DPS-relevant fix: Augusta is a top-tier (T0.5/T1) Main DPS, so every
// build using her was computing damage numbers roughly half what they should be.
import { describe, it, expect } from 'vitest';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';

describe("Augusta's damage blocks carry the real (not halved) Lv.10 multipliers", () => {
  it.each([
    ['augusta.intro.stride-of-goldenflare', [99.41, 99.41]],
    ['augusta.heavy.thunderoar-backstep', [53.68]],
    ['augusta.heavy.thunderoar-spinslash', [141.72, 141.72, 141.72]],
    ['augusta.skill.warriors-blade', [218.70, 218.70, 218.70]],
    ['augusta.liberation.sword-of-eternal-oath', [32.99, 32.99, 131.94, 131.94, 131.94, 32.99, 32.99, 571.7]],
    ['augusta.skill.undying-sunlight-strike', [139.17, 139.17]],
    ['augusta.skill.undying-sunlight-leap', [222.67, 27.84, 27.84]],
    ['augusta.skill.undying-sunlight-plunge', [86.59, 779.24]],
    ['augusta.liberation.sunborne', Array(9).fill(119.29)],
  ])('%s carries the real, un-halved hit values', (id, expectedAtkPcts) => {
    const block = AUGUSTA_BLOCKS.find(b => b.id === id);
    expect(block.damage.hits.map(h => h.atkPct)).toEqual(expectedAtkPcts);
  });

  it('augusta.liberation.everbright-protector carries the real, un-halved hit values', () => {
    const block = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.liberation.everbright-protector');
    const values = block.damage.hits.map(h => h.atkPct);
    expect(values[0]).toBeCloseTo(238.58, 2);
    expect(values[1]).toBeCloseTo(894.65, 2);
    expect(values.slice(2)).toEqual(Array(10).fill(values[2]));
    expect(values[2]).toBeCloseTo(5.97, 2);
  });
});

describe('Augusta — final audit pass fixes (dmgFocus, missing category, base stats, tier, totalMult)', () => {
  it('dmgFocus is Heavy ATK + Skill, not Liberation (she has zero true libDmg-categorized damage)', async () => {
    const { CHARACTER_DATA } = await import('../data/characters.js');
    expect(CHARACTER_DATA['Augusta'].dmgFocus).toEqual(['Heavy ATK', 'Skill']);
  });

  it('Everbright Protector damage block is categorized heavyDmg, matching every other reclassified Liberation-slot move', () => {
    const block = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.liberation.everbright-protector');
    expect(block.damage.category).toBe('heavyDmg');
  });
});
