/**
 * Rotation-history state machine tests — PHASE2_PLAN.md design question 2.
 *
 * Proves simulateRotation()/RotationSimulator actually EVALUATE the two conditional
 * trigger types added so far (Jinhsi's 'windowed-cast', Augusta's
 * 'partner-outro-return') against real elapsed time / swap history, rather than a
 * caller hand-asserting the outcome — the gap every prior parity test in this repo
 * left open. Each test runs both the success path (condition met in time) and the
 * forfeit path (missed), and where relevant feeds the simulator's real output
 * straight into resolveTriggerBlocks() to confirm the derived trigger key actually
 * changes the resulting stats.
 */
import { describe, it, expect } from 'vitest';
import { createStats } from '../features/teams/calcEngine.js';
import { resolveTriggerBlocks } from '../engine/triggerEngine.js';
import { RotationSimulator, simulateRotation, DEFAULT_STEP_SECONDS } from '../engine/rotationSimulator.js';
import { JINHSI_BLOCKS } from '../engine/characterBlocks/jinhsi.blocks.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';
import { CAMELLYA_BLOCKS } from '../engine/characterBlocks/camellya.blocks.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';

describe('RotationSimulator — windowed-cast (Jinhsi)', () => {
  it('fires when the windowed cast lands within the window', () => {
    const sim = new RotationSimulator();
    sim.advance(1);
    sim.openWindow('w1');
    sim.advance(4); // total elapsed since open: 4s, within a 5s window
    expect(sim.tryWindowedCast('w1', 5)).toBe(true);
  });

  it('forfeits when the windowed cast lands after the window closes', () => {
    const sim = new RotationSimulator();
    sim.advance(1);
    sim.openWindow('w1');
    sim.advance(6); // 6s elapsed, past a 5s window
    expect(sim.tryWindowedCast('w1', 5)).toBe(false);
  });

  it('a window can only be consumed once', () => {
    const sim = new RotationSimulator();
    sim.openWindow('w1');
    expect(sim.tryWindowedCast('w1', 5)).toBe(true);
    expect(sim.tryWindowedCast('w1', 5)).toBe(false); // already consumed, treated as never opened
  });

  it('simulateRotation resolves Jinhsi\'s Overflowing Radiance window end-to-end: success case', () => {
    const steps = [
      { type: 'Basic ATK', skill: 'Slash of Breaking Dawn Stage 1-4', stepSeconds: 1 },
      { type: 'Skill', skill: 'Overflowing Radiance', stepSeconds: 3, consumesWindowBlockId: 'jinhsi.window.overflowing-radiance' },
    ];
    const results = simulateRotation(JINHSI_BLOCKS, steps);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has("windowed-cast:cast:Basic ATK:Slash of Breaking Dawn Stage 1-4|cast:Intro:Loong's Halo")).toBe(true);
  });

  it('simulateRotation resolves Jinhsi\'s Overflowing Radiance window end-to-end: forfeit case', () => {
    const steps = [
      { type: 'Basic ATK', skill: 'Slash of Breaking Dawn Stage 1-4', stepSeconds: 1 },
      { type: 'Echo', skill: 'Use Echo', stepSeconds: 6 }, // stalls past the 5s window
      { type: 'Skill', skill: 'Overflowing Radiance', stepSeconds: 0.5, consumesWindowBlockId: 'jinhsi.window.overflowing-radiance' },
    ];
    const results = simulateRotation(JINHSI_BLOCKS, steps);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has("windowed-cast:cast:Basic ATK:Slash of Breaking Dawn Stage 1-4|cast:Intro:Loong's Halo")).toBe(false);
  });

  it('default step pacing is the documented engineering approximation, not a sourced timing value', () => {
    expect(DEFAULT_STEP_SECONDS).toBe(1.5);
  });
});

describe('RotationSimulator — partner-outro-return (Augusta)', () => {
  it('fires when the buffed partner Outros back before a 2nd swap (maxInterveningSwaps: 1)', () => {
    const sim = new RotationSimulator();
    sim.openPartnerOutroWindow('augusta.outro.battlesong', 1);
    sim.registerSwap(); // the partner's own Outro-out swap itself — allowed (counts as swap #1)
    expect(sim.tryPartnerOutroReturn('augusta.outro.battlesong')).toBe(true);
  });

  it('forfeits when a 3rd character swaps in before the partner Outros back', () => {
    const sim = new RotationSimulator();
    sim.openPartnerOutroWindow('augusta.outro.battlesong', 1);
    sim.registerSwap(); // swap #1: to a 3rd character instead of the buffed partner returning
    sim.registerSwap(); // swap #2: now past the 1-swap allowance
    expect(sim.tryPartnerOutroReturn('augusta.outro.battlesong')).toBe(false);
  });

  it('simulateRotation resolves Augusta\'s Majesty condition end-to-end: success case', () => {
    const steps = [
      { type: 'Outro', skill: 'Battlesong of the Unyielding', isSwap: true, isOutroCast: true, stepSeconds: 1 },
      { isSwap: true, partnerReturnFor: 'augusta.outro.battlesong', stepSeconds: 8 }, // partner's own Outro-out
    ];
    const results = simulateRotation(AUGUSTA_BLOCKS, steps);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has('partner-outro-return:augusta.outro.battlesong')).toBe(true);

    // Feed the real derived trigger into resolveTriggerBlocks — proves the whole pipeline (not
    // just the simulator in isolation) produces a working result, even though this particular
    // block's own effects are intentionally empty (stateful stack count — see the block's note).
    const stats = createStats();
    expect(() => resolveTriggerBlocks(AUGUSTA_BLOCKS, {
      firedTriggers: lastFired, targetElementLower: 'electro', targetRole: 'Main DPS',
    }, stats)).not.toThrow();
  });

  it('simulateRotation resolves Augusta\'s Majesty condition end-to-end: forfeit case (3rd-party swap)', () => {
    const steps = [
      { type: 'Outro', skill: 'Battlesong of the Unyielding', isSwap: true, isOutroCast: true, stepSeconds: 1 },
      { isSwap: true, stepSeconds: 5 }, // swap to a 3rd character, not the buffed partner returning
      { isSwap: true, partnerReturnFor: 'augusta.outro.battlesong', stepSeconds: 5 }, // too late
    ];
    const results = simulateRotation(AUGUSTA_BLOCKS, steps);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has('partner-outro-return:augusta.outro.battlesong')).toBe(false);
  });
});

describe('RotationSimulator — requires-prior-cast (Camellya)', () => {
  it('fires when the required cast happened earlier in the same on-field segment', () => {
    const sim = new RotationSimulator();
    sim.recordCast('cast:Forte:Ephemeral');
    expect(sim.hasCastThisSegment('cast:Forte:Ephemeral')).toBe(true);
  });

  it('forfeits when the required cast never happened this segment', () => {
    const sim = new RotationSimulator();
    expect(sim.hasCastThisSegment('cast:Forte:Ephemeral')).toBe(false);
  });

  it('resetSegment() (a new swap-in) clears prior-segment casts', () => {
    const sim = new RotationSimulator();
    sim.recordCast('cast:Forte:Ephemeral');
    sim.resetSegment();
    expect(sim.hasCastThisSegment('cast:Forte:Ephemeral')).toBe(false);
  });

  it('simulateRotation resolves Camellya\'s Twining bonus end-to-end: success case (Ephemeral cast this segment)', () => {
    const steps = [
      { isSwapIn: true, stepSeconds: 0 },
      { type: 'Forte', skill: 'Ephemeral', stepSeconds: 5 },
      { type: 'Outro', skill: 'Twining', isSwap: true, checksPriorCast: 'camellya.outro.twining-ephemeral-bonus', stepSeconds: 3 },
    ];
    const results = simulateRotation(CAMELLYA_BLOCKS, steps);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has('requires-prior-cast:cast:Forte:Ephemeral')).toBe(true);
  });

  it('simulateRotation resolves Camellya\'s Twining bonus end-to-end: forfeit case (Ephemeral never cast this segment)', () => {
    const steps = [
      { isSwapIn: true, stepSeconds: 0 },
      { type: 'Basic ATK', skill: 'Vining Waltz 1', stepSeconds: 5 }, // never casts Ephemeral this segment
      { type: 'Outro', skill: 'Twining', isSwap: true, checksPriorCast: 'camellya.outro.twining-ephemeral-bonus', stepSeconds: 3 },
    ];
    const results = simulateRotation(CAMELLYA_BLOCKS, steps);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has('requires-prior-cast:cast:Forte:Ephemeral')).toBe(false);
  });

  it('forfeits when Ephemeral was cast in a PRIOR on-field segment, not the current one', () => {
    const steps = [
      { isSwapIn: true, stepSeconds: 0 },
      { type: 'Forte', skill: 'Ephemeral', stepSeconds: 5 }, // cast, but in the first segment
      { isSwapIn: true, stepSeconds: 8 }, // swaps back in later — new segment, Ephemeral not re-cast
      { type: 'Outro', skill: 'Twining', isSwap: true, checksPriorCast: 'camellya.outro.twining-ephemeral-bonus', stepSeconds: 3 },
    ];
    const results = simulateRotation(CAMELLYA_BLOCKS, steps);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has('requires-prior-cast:cast:Forte:Ephemeral')).toBe(false);
  });
});

describe('RotationSimulator — windowed-proc (Yinlin)', () => {
  it('procs when a qualifying hit lands within the window and under the cap', () => {
    const sim = new RotationSimulator();
    sim.openProcWindow('w1', 30, 4);
    sim.advance(5); // well within a 30s window
    expect(sim.tryProc('w1')).toBe(true);
  });

  it('forfeits once the window has expired', () => {
    const sim = new RotationSimulator();
    sim.openProcWindow('w1', 30, 4);
    sim.advance(31); // past the 30s window
    expect(sim.tryProc('w1')).toBe(false);
  });

  it('is repeatable up to maxProcs, then forfeits further attempts within the same window', () => {
    const sim = new RotationSimulator();
    sim.openProcWindow('w1', 30, 4);
    expect(sim.tryProc('w1')).toBe(true); // 1
    expect(sim.tryProc('w1')).toBe(true); // 2
    expect(sim.tryProc('w1')).toBe(true); // 3
    expect(sim.tryProc('w1')).toBe(true); // 4 — hits the cap
    expect(sim.tryProc('w1')).toBe(false); // 5th attempt, cap already reached
  });

  it('re-opening the window (a fresh Liberation cast) resets the count', () => {
    const sim = new RotationSimulator();
    sim.openProcWindow('w1', 30, 4);
    sim.tryProc('w1'); sim.tryProc('w1'); sim.tryProc('w1'); sim.tryProc('w1'); // exhausts the cap
    expect(sim.tryProc('w1')).toBe(false);
    sim.openProcWindow('w1', 30, 4); // re-cast Liberation, reopens the window
    expect(sim.tryProc('w1')).toBe(true);
  });

  it("simulateRotation resolves Yinlin's Furious Thunder window end-to-end: success case (Basic ATK lands within 30s of Thundering Wrath)", () => {
    const steps = [
      { type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 1 },
      { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 3, triesProc: 'yinlin.chain.s6-pursuit-of-justice' },
    ];
    const results = simulateRotation(YINLIN_BLOCKS, steps);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has('windowed-proc:cast:Liberation:Thundering Wrath')).toBe(true);
  });

  it("simulateRotation resolves Yinlin's Furious Thunder window end-to-end: forfeit case (Basic ATK lands after the 30s window closes)", () => {
    const steps = [
      { type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 1 },
      { type: 'Echo', skill: 'Use Echo', stepSeconds: 31 }, // stalls past the 30s window
      { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 0.5, triesProc: 'yinlin.chain.s6-pursuit-of-justice' },
    ];
    const results = simulateRotation(YINLIN_BLOCKS, steps);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has('windowed-proc:cast:Liberation:Thundering Wrath')).toBe(false);
  });

  it("simulateRotation resolves Yinlin's Furious Thunder cap: a 5th Basic ATK within the window does not proc again", () => {
    const steps = [
      { type: 'Liberation', skill: 'Thundering Wrath', stepSeconds: 1 },
      { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1, triesProc: 'yinlin.chain.s6-pursuit-of-justice' },
      { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1, triesProc: 'yinlin.chain.s6-pursuit-of-justice' },
      { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1, triesProc: 'yinlin.chain.s6-pursuit-of-justice' },
      { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1, triesProc: 'yinlin.chain.s6-pursuit-of-justice' },
      { type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 1, triesProc: 'yinlin.chain.s6-pursuit-of-justice' },
    ];
    const results = simulateRotation(YINLIN_BLOCKS, steps);
    const procFires = results.map(r => r.firedTriggers.has('windowed-proc:cast:Liberation:Thundering Wrath'));
    // Liberation-cast step never fires the proc key itself; the next 4 Basic ATKs do; the 5th does not.
    expect(procFires).toEqual([false, true, true, true, true, false]);
  });
});
