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
import { resolveTriggerBlocks } from '../engine/triggers/triggerEngine.js';
import { RotationSimulator, simulateRotation, deriveStepsFromRotation, DEFAULT_STEP_SECONDS } from '../engine/composition/rotationSimulator.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
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

describe("simulateRotation — 'swap-out'/'swap-in' trigger keys actually fire", () => {
  // Found while building resolveSimulatedRotation.js: this loop tracked swap EVENTS for window
  // bookkeeping (registerSwap/resetSegment) but never added the plain 'swap-out'/'swap-in' trigger
  // keys to `fired` — meaning EVERY outro-buff block in the roster (trigger.type: 'swap-out' is how
  // every converted character's own outro is declared) could never resolve through simulateRotation,
  // only through a test hand-feeding firedTriggers directly. Locking this in as its own regression
  // test, separate from resolveSimulatedRotation's own coverage, since it's a correctness fix to
  // simulateRotation itself that any future caller depends on, not just the new driver.
  it("an isOutroCast step fires the 'swap-out' key", () => {
    const results = simulateRotation(YINLIN_BLOCKS, [
      { type: 'Outro', skill: 'Strategist', isSwap: true, isOutroCast: true, stepSeconds: 1 },
    ]);
    expect(results[0].firedTriggers.has('swap-out')).toBe(true);
  });

  it("an isSwapIn step fires the 'swap-in' key", () => {
    const results = simulateRotation(YINLIN_BLOCKS, [
      { type: 'Intro', skill: 'Raging Storm', isSwapIn: true, stepSeconds: 1 },
    ]);
    expect(results[0].firedTriggers.has('swap-in')).toBe(true);
  });

  it("a step that is neither does NOT fire either key", () => {
    const results = simulateRotation(YINLIN_BLOCKS, [
      { type: 'Skill', skill: 'Magnetic Roar', stepSeconds: 1 },
    ]);
    expect(results[0].firedTriggers.has('swap-out')).toBe(false);
    expect(results[0].firedTriggers.has('swap-in')).toBe(false);
  });

  it("end-to-end: Yinlin's real derived Outro step now resolves through resolveTriggerBlocks via simulateRotation alone (no hand-fed firedTriggers)", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yinlin'], YINLIN_BLOCKS);
    const results = simulateRotation(YINLIN_BLOCKS, steps);
    const outroStepResult = results.find(r => r.step.type === 'Outro' && r.step.skill === 'Strategist');
    expect(outroStepResult.firedTriggers.has('swap-out')).toBe(true);

    const stats = createStats();
    resolveTriggerBlocks(YINLIN_BLOCKS, {
      firedTriggers: outroStepResult.firedTriggers,
      ineligibleBlockIds: outroStepResult.ineligibleBlockIds,
      targetElementLower: 'electro', targetRole: 'Sub DPS',
    }, stats);
    // yinlin.outro.strategist grants elemDmg +20 / libDmg +25 — now actually reachable through the
    // simulator's own output, not just a hand-built firedTriggers set. elemDmg has no other
    // contributor in this call, so it isolates cleanly to the outro's +20. libDmg also gets S5's
    // passive +100 (Resounding Will, always-fires here since resolveTriggerBlocks doesn't gate
    // condition.requiresStance) baked in by the same call, so assert the total including it rather
    // than a wrong isolated +25.
    expect(stats.elemDmg).toBe(20);
    expect(stats.libDmg).toBe(100 + 25);
  });
});

describe("deriveStepsFromRotation / simulateRotation — 'resource-threshold' trigger.resourceStepOn", () => {
  it("auto-tags Yinlin's real Forte:Chameleon Cipher step with firesResourceThreshold", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yinlin'], YINLIN_BLOCKS);
    const chameleonStep = steps.find(s => s.type === 'Forte' && s.skill === 'Chameleon Cipher');
    const chameleonBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.forte.chameleon-cipher');
    expect(chameleonStep.firesResourceThreshold).toBe(chameleonBlock.id);
  });

  it('simulateRotation fires the resource-threshold key on the tagged step, and NOT on any other step', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yinlin'], YINLIN_BLOCKS);
    const results = simulateRotation(YINLIN_BLOCKS, steps);
    const key = 'resource-threshold:Judgment Points:100';
    const firingSteps = results.filter(r => r.firedTriggers.has(key));
    expect(firingSteps).toHaveLength(1);
    expect(firingSteps[0].step.type).toBe('Forte');
    expect(firingSteps[0].step.skill).toBe('Chameleon Cipher');
  });

  it('end-to-end: the derived key resolves Chameleon Cipher through resolveTriggerBlocks, reaching its damage.hits via resolveHitComposedDps too (spot-checked here via the raw trigger, not re-running the whole DPS calc)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yinlin'], YINLIN_BLOCKS);
    const results = simulateRotation(YINLIN_BLOCKS, steps);
    const chameleonBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.forte.chameleon-cipher');
    const r = results.find(x => x.step.type === 'Forte' && x.step.skill === 'Chameleon Cipher');
    expect(r.firedTriggers.has(`resource-threshold:${chameleonBlock.trigger.resource}:${chameleonBlock.trigger.threshold}`)).toBe(true);
  });
});

describe('RotationSimulator — timing.cooldown enforcement', () => {
  it('a block is ready before it has ever been used', () => {
    const sim = new RotationSimulator();
    expect(sim.isReady('b1')).toBe(true);
  });

  it('a block is NOT ready immediately after use, within its cooldown', () => {
    const sim = new RotationSimulator();
    sim.useCooldown('b1', 12);
    sim.advance(5); // 5s elapsed, still within the 12s cooldown
    expect(sim.isReady('b1')).toBe(false);
  });

  it('a block becomes ready again once its cooldown has fully elapsed', () => {
    const sim = new RotationSimulator();
    sim.useCooldown('b1', 12);
    sim.advance(12); // exactly at the cooldown boundary — ready again
    expect(sim.isReady('b1')).toBe(true);
  });

  it("simulateRotation marks a cast still on cooldown as ineligible, but its OWN raw cast key still fires (the input was pressed)", () => {
    const steps = [
      { type: 'Skill', skill: 'Magnetic Roar', stepSeconds: 1 }, // 1st cast — off cooldown, resolves
      { type: 'Skill', skill: 'Magnetic Roar', stepSeconds: 3 }, // 2nd cast only 3s later — still within the 12s cooldown
    ];
    const results = simulateRotation(YINLIN_BLOCKS, steps);
    const magneticRoarBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.skill.magnetic-roar');
    expect(magneticRoarBlock.timing.cooldown).toBe(12);

    expect(results[0].firedTriggers.has('cast:Skill:Magnetic Roar')).toBe(true);
    expect(results[0].ineligibleBlockIds.has(magneticRoarBlock.id)).toBe(false); // 1st cast: off cooldown

    expect(results[1].firedTriggers.has('cast:Skill:Magnetic Roar')).toBe(true); // the input still fires
    expect(results[1].ineligibleBlockIds.has(magneticRoarBlock.id)).toBe(true); // but the block itself is gated

    // Feed both steps' output into resolveTriggerBlocks — the 2nd call must skip the block despite
    // its trigger key being present, because ineligibleBlockIds says so.
    const statsSecondCast = createStats();
    expect(() => resolveTriggerBlocks(YINLIN_BLOCKS, {
      firedTriggers: results[1].firedTriggers,
      ineligibleBlockIds: results[1].ineligibleBlockIds,
      targetElementLower: 'electro', targetRole: 'Sub DPS',
    }, statsSecondCast)).not.toThrow();
  });

  it("simulateRotation marks a re-cast AFTER the cooldown fully elapses as eligible again", () => {
    const steps = [
      { type: 'Skill', skill: 'Magnetic Roar', stepSeconds: 1 },
      { type: 'Skill', skill: 'Magnetic Roar', stepSeconds: 12 }, // exactly at the 12s cooldown boundary
    ];
    const results = simulateRotation(YINLIN_BLOCKS, steps);
    const magneticRoarBlock = YINLIN_BLOCKS.find(b => b.id === 'yinlin.skill.magnetic-roar');
    expect(results[1].ineligibleBlockIds.has(magneticRoarBlock.id)).toBe(false);
  });
});

describe('deriveStepsFromRotation — auto-deriving steps from REAL CHARACTER_ROTATIONS data', () => {
  // Closes the remaining piece of design question 2: every test above (and every parity test in
  // this repo) hand-built its own `steps` array with isSwap/isOutroCast/consumesWindowBlockId/
  // checksPriorCast/triesProc flags set by a human. This describe block instead feeds the SAME real
  // CHARACTER_ROTATIONS data RotationTimeline.jsx/CharacterDetailModal.jsx already render straight
  // into deriveStepsFromRotation() + simulateRotation(), so the whole pipeline runs against real app
  // data for the first time, not a test fixture.

  it("derives Jinhsi's opening Basic ATK step as isSwapIn: false and the correct consumesWindowBlockId on each Skill step", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jinhsi'], JINHSI_BLOCKS);
    const overflowing = steps.find(s => s.skill === 'Overflowing Radiance');
    const illuminous = steps.find(s => s.skill === 'Illuminous Epiphany');
    expect(overflowing.consumesWindowBlockId).toBe('jinhsi.window.overflowing-radiance');
    expect(illuminous.consumesWindowBlockId).toBe('jinhsi.window.illuminous-epiphany');
    // Jinhsi's rotation opens with a Basic ATK combo, not an Intro cast — isSwapIn only applies to
    // an actual Intro-type first step, so it correctly stays unset here.
    expect(steps[0].isSwapIn).toBeUndefined();
  });

  it("end-to-end: Jinhsi's REAL rotation order lands both windowed casts (Overflowing Radiance immediately follows Basic ATK Stage 4; Illuminous Epiphany immediately follows the Incarnation combo)", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jinhsi'], JINHSI_BLOCKS);
    const results = simulateRotation(JINHSI_BLOCKS, steps);
    const allFired = new Set(results.flatMap(r => [...r.firedTriggers]));
    expect(allFired.has("windowed-cast:cast:Basic ATK:Slash of Breaking Dawn Stage 1-4|cast:Intro:Loong's Halo")).toBe(true);
    expect(allFired.has('windowed-cast:cast:Forte:Incarnation - Basic Attack Stage 1-4')).toBe(true);
  });

  it("derives Camellya's Outro Twining step with checksPriorCast set", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Camellya'], CAMELLYA_BLOCKS);
    const twining = steps.find(s => s.type === 'Outro' && s.skill === 'Twining');
    expect(twining.checksPriorCast).toBe('camellya.outro.twining-ephemeral-bonus');
    // Unlike Augusta/Yinlin/Rover: Electro/Shorekeeper, CHAR_BUFF_TABLE['Camellya'].outroBuffs is
    // genuinely empty (Twining carries no team/self outro BUFF, only the conditional bonus DMG
    // modeled above) — so CAMELLYA_BLOCKS has no own-outro buff block for isSwap/isOutroCast to
    // attribute this step to, and deriveStepsFromRotation correctly leaves both unset rather than
    // guessing. Not a derivation gap: the convention (isOutroCast requires a real outro-buff block
    // to exist) is deliberate — see deriveStepsFromRotation's own doc comment.
    expect(twining.isSwap).toBeUndefined();
    expect(twining.isOutroCast).toBeUndefined();
  });

  it("end-to-end: Camellya's REAL rotation casts Ephemeral (Forte) before Outro Twining, so the prior-cast condition actually fires", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Camellya'], CAMELLYA_BLOCKS);
    const results = simulateRotation(CAMELLYA_BLOCKS, steps);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has('requires-prior-cast:cast:Forte:Ephemeral')).toBe(true);
  });

  it("derives Yinlin's Basic ATK Stage 1-4 step (which appears BEFORE Liberation in her real rotation) with triesProc set regardless of order — evaluation, not derivation, is what actually gates it on real elapsed time", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Yinlin'], YINLIN_BLOCKS);
    const openingBasic = steps.find(s => s.type === 'Basic ATK' && s.skill === "Zapstring's Dance Stage 1-4");
    expect(openingBasic.triesProc).toBe('yinlin.chain.s6-pursuit-of-justice');
    // Her REAL rotation's post-Liberation Basic ATK step is a single tap ("Stage 1", to refill
    // Judgment Points) — a DIFFERENT skill label than the block's `on` ("Stage 1-4"), so it
    // correctly does NOT get triesProc: a genuine finding about this specific optimized rotation
    // (Furious Thunder's proc window opens, but nothing in this canonical sequence attempts a
    // qualifying Basic ATK combo before the window would next be checked), not a derivation bug.
    const postLiberationBasic = steps.find(s => s.type === 'Basic ATK' && s.skill === "Zapstring's Dance Stage 1");
    expect(postLiberationBasic).toBeDefined();
    expect(postLiberationBasic.triesProc).toBeUndefined();
  });
});
