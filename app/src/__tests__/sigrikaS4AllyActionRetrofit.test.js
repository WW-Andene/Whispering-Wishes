// the engine-merge history (git log) Phase 0.5 gap #2 — the ally-action retrofit backlog. sigrika.chain.s4 used to
// be modeled as an unconditional, permanent, passive team buff (+20% ATK, trigger:'passive') — wrong
// on two counts against the dump's own exact text: "Any teammate's Echo Skill cast grants the whole
// team +20% ATK for 20s." The trigger is a real cross-character event (any teammate using an Echo
// Skill, a universal action not specific to any character's own kit), not passive; the duration is a
// real 20s window, not indefinite. This also exercises the new universal 'echo-skill-cast' action tag
// (rotationSimulator.js), fired directly off any step's own {type:'Echo'} shape rather than a
// per-character appliesTags declaration.
import { describe, it, expect } from 'vitest';
import { resolveSimulatedTeamRotation } from '../engine/resolver/dps/resolveSimulatedTeamRotation.js';
import { SIGRIKA_BLOCKS } from '../engine/characterBlocks/sigrika.blocks.js';

describe('Sigrika chain.s4 — ally-action retrofit (the engine-merge history (git log) Phase 0.5 gap #2)', () => {
  const s4 = SIGRIKA_BLOCKS.find(b => b.id === 'sigrika.chain.s4');

  it('is a real ally-action/whole-team block now, not a passive buff', () => {
    expect(s4.trigger).toEqual({ type: 'ally-action', action: 'echo-skill-cast' });
    expect(s4.target.scope).toBe('whole-team');
    expect(s4.timing.duration).toBe(20);
  });

  it('fires from ANY teammate using an equipped Echo (universal echo-skill-cast tag), reaching Sigrika', () => {
    const applierBlocks = [
      { id: 'ally.echo.use', source: 'Ally', kind: 'damage', trigger: { type: 'cast', on: 'Echo:Use Echo' }, target: { scope: 'self' }, effects: [], damage: { hits: [{ atkPct: 50 }] } },
    ];
    const steps = [
      { owner: 'Ally', type: 'Echo', skill: 'Use Echo', stepSeconds: 1 },
      { owner: 'Sigrika', type: 'Skill', skill: 'Idle', stepSeconds: 1 },
    ];
    const blocksByOwner = { Ally: applierBlocks, Sigrika: SIGRIKA_BLOCKS };
    const { stats: sigrikaStats } = resolveSimulatedTeamRotation(steps, blocksByOwner, 'Sigrika');
    expect(sigrikaStats.atkPct).toBeGreaterThan(0);
  });

  it('does not fire when no Echo Skill is cast anywhere in the rotation', () => {
    const steps = [
      { owner: 'Sigrika', type: 'Skill', skill: 'Idle', stepSeconds: 1 },
    ];
    const blocksByOwner = { Sigrika: SIGRIKA_BLOCKS };
    const { stats: sigrikaStats } = resolveSimulatedTeamRotation(steps, blocksByOwner, 'Sigrika');
    expect(sigrikaStats.atkPct).toBe(0);
  });
});
