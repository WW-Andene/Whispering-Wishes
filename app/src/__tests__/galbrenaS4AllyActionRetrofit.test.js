// REMAINING_WORK.md 1a's ally-action retrofit backlog — galbrena.chain.s4 used to be modeled as an
// unconditional, permanent, passive whole-team buff (+20% allDmg, trigger:'passive') — wrong against
// the kit text's own exact wording: "When Resonators in the team cast Echo Skill, all Resonators in
// the team gain 20% all-Attribute DMG Bonus for 20s." Same shape Sigrika's chain.s4 already uses the
// universal 'echo-skill-cast' action tag for — no new tag needed, just wiring this node to the same
// existing mechanism (fires directly off any step's own {type:'Echo'} shape).
import { describe, it, expect } from 'vitest';
import { resolveSimulatedTeamRotation } from '../engine/composition/resolveSimulatedTeamRotation.js';
import { GALBRENA_BLOCKS } from '../engine/characterBlocks/galbrena.blocks.js';

describe('Galbrena chain.s4 — ally-action retrofit', () => {
  const s4 = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s4');

  it('is a real ally-action/whole-team block now, not a passive buff', () => {
    expect(s4.trigger).toEqual({ type: 'ally-action', action: 'echo-skill-cast' });
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(20);
    expect(s4.effects[0]).toEqual({ stat: 'allDmg', value: 20, stacking: 'refresh' });
  });

  it('fires from ANY teammate using an equipped Echo (universal echo-skill-cast tag), reaching Galbrena', () => {
    const applierBlocks = [
      { id: 'ally.echo.use', source: 'Ally', kind: 'damage', trigger: { type: 'cast', on: 'Echo:Use Echo' }, target: { scope: 'self' }, effects: [], damage: { hits: [{ atkPct: 50 }] } },
    ];
    const steps = [
      { owner: 'Ally', type: 'Echo', skill: 'Use Echo', stepSeconds: 1 },
      { owner: 'Galbrena', type: 'Skill', skill: 'Idle', stepSeconds: 1 },
    ];
    const blocksByOwner = { Ally: applierBlocks, Galbrena: GALBRENA_BLOCKS };
    const { stats: galbrenaStats } = resolveSimulatedTeamRotation(steps, blocksByOwner, 'Galbrena');
    // allDmg ('All-Attribute DMG Bonus') folds into stats.elemDmg by convention (calcEngine.js), not a
    // separate field of its own.
    expect(galbrenaStats.elemDmg).toBeGreaterThan(0);
  });

  it('does not fire when no Echo Skill is cast anywhere in the rotation', () => {
    const steps = [
      { owner: 'Galbrena', type: 'Skill', skill: 'Idle', stepSeconds: 1 },
    ];
    const blocksByOwner = { Galbrena: GALBRENA_BLOCKS };
    const { stats: galbrenaStats } = resolveSimulatedTeamRotation(steps, blocksByOwner, 'Galbrena');
    expect(galbrenaStats.elemDmg).toBe(0);
  });

  it('Afterflame (debuff.afterflame / chain.s1) stays passive/unretrofitted — genuinely blocked on an unsourced per-Echo-name-dedup cap, not the same fix', () => {
    const afterflame = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.debuff.afterflame');
    const s1 = GALBRENA_BLOCKS.find(b => b.id === 'galbrena.chain.s1');
    expect(afterflame.trigger).toEqual({ type: 'passive' });
    expect(s1.trigger).toEqual({ type: 'passive' });
  });
});
