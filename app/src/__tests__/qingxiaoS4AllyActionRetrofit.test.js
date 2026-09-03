// the engine-merge history (git log) Phase 0.5 gap #2 — the ally-action retrofit backlog. qingxiao.chain.s4 used to
// be modeled as an unconditional, permanent SELF buff (+20% ATK, trigger:'passive', target:'self') —
// wrong on three counts against the dump's own exact text: "After any teammate inflicts Shifting,
// THEIR ATK +20% for 8s." The recipient is whoever inflicted Shifting (which can be Qingxiao herself,
// since her own real damage blocks already carry appliesTags:['shifting'] — no special-casing needed,
// 'shifting' is just a shared tag any ally-action consumer reads regardless of source), not always
// Qingxiao; the trigger is a real cross-character event, not passive; the duration is a real 8s
// window, not indefinite.
import { describe, it, expect } from 'vitest';
import { simulateTeamRotation } from '../engine/rotationSimulator.js';
import { resolveSimulatedTeamRotation } from '../engine/resolveSimulatedTeamRotation.js';
import { QINGXIAO_BLOCKS } from '../engine/characterBlocks/qingxiao.blocks.js';

describe('Qingxiao chain.s4 — ally-action retrofit (the engine-merge history (git log) Phase 0.5 gap #2)', () => {
  const s4 = QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s4');

  it('is a real ally-action/trigger-actor block now, not a passive self buff', () => {
    expect(s4.trigger).toEqual({ type: 'ally-action', action: 'shifting' });
    expect(s4.target.scope).toBe('trigger-actor');
    expect(s4.timing.duration).toBe(8);
  });

  it('Qingxiao self-triggers it from her own real casts (which already appliesTags: shifting), no special-casing needed', () => {
    const steps = [
      { owner: 'Qingxiao', type: 'Skill', skill: 'Severing Note: Judgement', stepSeconds: 1 },
      { owner: 'Qingxiao', type: 'Basic ATK', skill: 'Basic Attack - Stringblade Stage 1-4', stepSeconds: 2 },
    ];
    const { stats } = resolveSimulatedTeamRotation(steps, { Qingxiao: QINGXIAO_BLOCKS }, 'Qingxiao');
    expect(stats.atkPct).toBeGreaterThan(0);
  });

  it('reaches an ALLY who inflicts Shifting instead, not Qingxiao (the exact bug class this retrofit fixes)', () => {
    const applierBlocks = [
      { id: 'ally.skill.shift', source: 'Ally', kind: 'damage', trigger: { type: 'cast', on: 'Skill:Shift' }, target: { scope: 'self' }, effects: [], appliesTags: ['shifting'], damage: { hits: [{ atkPct: 50 }] } },
    ];
    const steps = [
      { owner: 'Ally', type: 'Skill', skill: 'Shift', stepSeconds: 1 },
      { owner: 'Ally', type: 'Basic ATK', skill: 'Follow-up', stepSeconds: 2 },
      { owner: 'Qingxiao', type: 'Skill', skill: 'Idle', stepSeconds: 1 },
    ];
    const blocksByOwner = { Ally: applierBlocks, Qingxiao: QINGXIAO_BLOCKS };
    const { stats: allyStats } = resolveSimulatedTeamRotation(steps, blocksByOwner, 'Ally');
    const { stats: qingxiaoStats } = resolveSimulatedTeamRotation(steps, blocksByOwner, 'Qingxiao');
    expect(allyStats.atkPct).toBeGreaterThan(0);
    expect(qingxiaoStats.atkPct).toBe(0);
  });
});
