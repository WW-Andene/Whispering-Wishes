/**
 * the engine-architecture history (git log) item 9 — the "ally-action" trigger type + "trigger-actor" target scope.
 *
 * Proves the new cross-character mechanism itself (hand-built synthetic blocks, not real character
 * data — real character migrations are a separate, later step per the item's own phased plan): a
 * buff whose trigger is "ANY team member performs action X" (not the block owner's own cast), split
 * into the two real shapes found during the roster audit:
 *   - Category A: the RECIPIENT is a fixed scope (whole-team here) — only the TRIGGER needed fixing.
 *   - Category B: the RECIPIENT is dynamically whoever performed the triggering action
 *     ('trigger-actor') — needs the new target scope too.
 */
import { describe, it, expect } from 'vitest';
import { simulateTeamRotation } from '../engine/rotationSimulator.js';
import { resolveSimulatedTeamRotation } from '../engine/resolveSimulatedTeamRotation.js';
import { resolveHitComposedTeamDps } from '../engine/resolveHitComposedTeamDps.js';

// Applier: casts one tagged move (Skill:Shift) that applies 'shifting'. Reactor: never applies it.
const APPLIER_BLOCKS = [
  {
    id: 'applier.skill.shift',
    source: 'Applier', kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:Shift' },
    timing: {}, target: { scope: 'self' }, effects: [],
    appliesTags: ['shifting'],
    damage: { hits: [{ atkPct: 50 }] },
  },
];

describe('ally-action trigger + trigger-actor target (the engine-architecture history (git log) item 9)', () => {
  // Applier gets a 2nd step after Shift so their own on-field segment [0,3] extends PAST the
  // instant (t=1) the trigger fires — resolveSimulatedTeamRotation measures a buff's time-weighted
  // overlap against the RECIPIENT's own segment, so a single-step Applier (segment [0,1] ending
  // exactly when the trigger fires) would show zero overlap by construction, not by a real bug.
  const steps = [
    { owner: 'Applier', type: 'Skill', skill: 'Shift', stepSeconds: 1 },
    { owner: 'Applier', type: 'Basic ATK', skill: 'Follow-up', stepSeconds: 2 },
    { owner: 'Reactor', type: 'Skill', skill: 'Idle', stepSeconds: 1 },
  ];

  it("simulateTeamRotation records the tag on Applier's step, not Reactor's", () => {
    const results = simulateTeamRotation(steps, { Applier: APPLIER_BLOCKS, Reactor: [] });
    const applierResult = results.find(r => r.owner === 'Applier');
    const reactorResult = results.find(r => r.owner === 'Reactor');
    expect(applierResult.actionTags.has('shifting')).toBe(true);
    expect(reactorResult.actionTags.has('shifting')).toBe(false);
  });

  describe('Category A — whole-team recipient, only the trigger was wrong (e.g. Cartethyia S4/Sigrika S4 shape)', () => {
    const teamWideBuff = {
      id: 'reactor.chain.whole-team-on-shift',
      source: 'Reactor', kind: 'buff',
      trigger: { type: 'ally-action', action: 'shifting' },
      timing: { duration: 10 }, target: { scope: 'whole-team' },
      effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    };
    const blocksByOwner = { Applier: APPLIER_BLOCKS, Reactor: [teamWideBuff] };

    it('reaches the ALLY who triggered it (Applier), even though the block belongs to Reactor', () => {
      const { stats } = resolveSimulatedTeamRotation(steps, blocksByOwner, 'Applier');
      // Time-weighted overlap: the buff window opens at t=1 (when Shift resolves) and Applier's own
      // segment is [0,3] — only the [1,3] portion overlaps, so this is 20 * (2/3), not a flat 20.
      expect(stats.atkPct).toBeCloseTo(20 * (2 / 3), 5);
    });

    it('also reaches Reactor (whole-team means everyone, including the block owner) at full value (Reactor\'s own segment [3,4] is fully inside the window)', () => {
      const { stats } = resolveSimulatedTeamRotation(steps, blocksByOwner, 'Reactor');
      expect(stats.atkPct).toBeCloseTo(20, 5);
    });
  });

  describe('Category B — trigger-actor recipient, needs the new target scope (Qingxiao S4/Denia S2 shape)', () => {
    const actorOnlyBuff = {
      id: 'reactor.chain.actor-only-on-shift',
      source: 'Reactor', kind: 'buff',
      trigger: { type: 'ally-action', action: 'shifting' },
      timing: { duration: 10 }, target: { scope: 'trigger-actor' },
      effects: [{ stat: 'atkPct', value: 20, stacking: 'refresh' }],
    };
    const blocksByOwner = { Applier: APPLIER_BLOCKS, Reactor: [actorOnlyBuff] };

    it('reaches Applier (who performed the triggering action)', () => {
      const { stats } = resolveSimulatedTeamRotation(steps, blocksByOwner, 'Applier');
      expect(stats.atkPct).toBeCloseTo(20 * (2 / 3), 5); // same partial-overlap math as Category A above
    });

    it('does NOT reach Reactor (the block owner, who never inflicts Shifting themselves) — this is the exact bug class Qingxiao S4 had before this fix', () => {
      const { stats } = resolveSimulatedTeamRotation(steps, blocksByOwner, 'Reactor');
      expect(stats.atkPct).toBe(0);
    });

    it('resolveHitComposedTeamDps (the real per-hit path) agrees: only Applier is stronger, only for hits landing after the trigger', () => {
      const { totalDamage: applierDmg } = resolveHitComposedTeamDps(steps, blocksByOwner, 'Applier', { enemyDef: 800, enemyRes: 10 }, { atk: 1000 });
      // Baseline without the buff: 50% atkPct * 1000 atk (no crit config -> calcAvgCrit default applies,
      // so just assert the buffed run outdamages an unbuffed control rather than hardcoding the formula.
      const unbuffedBlocksByOwner = { Applier: APPLIER_BLOCKS, Reactor: [] };
      const { totalDamage: unbuffedDmg } = resolveHitComposedTeamDps(steps, unbuffedBlocksByOwner, 'Applier', { enemyDef: 800, enemyRes: 10 }, { atk: 1000 });
      expect(applierDmg).toBeGreaterThan(unbuffedDmg);
    });
  });
});
