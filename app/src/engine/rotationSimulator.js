// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/rotationSimulator.js
// The rotation-history state machine PHASE2_PLAN.md's design question 2 asks for.
// Everything converted so far (Shorekeeper's cast-scoped S6, Augusta's
// 'partner-outro-return', Jinhsi's 'windowed-cast') proved its trigger SHAPE is
// representable, but every parity test up to this point hand-fed the resulting
// firedTriggers Set — nothing actually evaluated "was this cast within 5s of the
// window opening" or "did a 3rd swap happen before the partner Outro'd back"
// against real elapsed time. This module is that evaluator.
//
// It does NOT try to be a full combat simulator (no damage numbers, no animation
// timing data pulled from anywhere — see DEFAULT_STEP_SECONDS below, an explicit
// engineering approximation for spacing simulated steps, not a sourced per-move
// timing value; nothing here should be read as a real game-timing claim the way
// characters.js's audited data is). It only tracks the THREE pieces of state the
// two conditional trigger types actually need: elapsed time since a window opened,
// swap count since an outro buff was applied, and whether either was later
// consumed within its allowance — then reports which derived trigger keys
// (matching triggerEngine.js's own triggerKey() format) actually fired, so those
// keys can be handed to resolveTriggerBlocks() the same way a 'cast'/'passive' key
// always has been.
// ═══════════════════════════════════════════════════════════════════════════════

// Not a sourced animation-timing value — a placeholder pace for spacing simulated
// rotation steps when the caller doesn't supply a real one via `stepSeconds`.
export const DEFAULT_STEP_SECONDS = 1.5;

export class RotationSimulator {
  constructor() {
    this.time = 0;
    // windowKey (matches a windowed-cast block's opensOn.join('|')) -> time it opened
    this._windows = new Map();
    // outro-buff blockId -> { swaps, maxInterveningSwaps }
    this._outroWindows = new Map();
    // castKey -> true, for every cast seen since the last resetSegment() (swap-in) — backs
    // 'requires-prior-cast', which has no time limit, just "was this seen earlier in the current
    // on-field segment."
    this._castsThisSegment = new Set();
    // windowKey (matches a windowed-proc block's opensOnProc.join('|')) -> { openedAt, count, maxProcs }
    // — backs 'windowed-proc' (Yinlin S6-style repeatable capped procs), distinct from _windows
    // above because a proc window can fire MULTIPLE times up to maxProcs, not just once.
    this._procWindows = new Map();
  }

  /** Call for every 'cast:TYPE:SKILL' key that occurs, so requires-prior-cast can later check it. */
  recordCast(castKey) {
    this._castsThisSegment.add(castKey);
  }

  /** Has `castKey` occurred since the last resetSegment()? Does not consume — a prior cast can gate
   *  multiple later blocks (e.g. every Twining-style hit for the rest of the segment). */
  hasCastThisSegment(castKey) {
    return this._castsThisSegment.has(castKey);
  }

  /** Call on swap-IN (a new on-field segment starting) — requires-prior-cast dependencies don't
   *  carry across a swap-out/swap-in cycle, only within one continuous on-field window. */
  resetSegment() {
    this._castsThisSegment = new Set();
  }

  advance(seconds) {
    this.time += seconds;
  }

  /** Call when a windowed-cast block's opensOn trigger fires. */
  openWindow(windowKey) {
    this._windows.set(windowKey, this.time);
  }

  /**
   * Call when the empowered/windowed move is actually attempted. Consumes the window
   * (a real window can only be tried once) and returns whether it landed in time.
   * Returns false with no side effect beyond consumption if the window was never opened.
   */
  tryWindowedCast(windowKey, windowSeconds) {
    const openedAt = this._windows.get(windowKey);
    this._windows.delete(windowKey);
    if (openedAt == null) return false;
    return (this.time - openedAt) <= windowSeconds;
  }

  /** Call when a windowed-proc block's opensOnProc trigger fires — (re)opens the proc window,
   *  resetting its count. A cast that reopens an already-open window (e.g. re-casting Liberation
   *  before the prior 30s window closed) restarts the count, matching "in the first 30s after
   *  casting" being anchored to the MOST RECENT cast, not accumulating across casts. */
  openProcWindow(windowKey, windowSeconds, maxProcs) {
    this._procWindows.set(windowKey, { openedAt: this.time, windowSeconds, count: 0, maxProcs });
  }

  /** Call when a qualifying hit (the proc block's `on` type) occurs while a proc window might be
   *  open. Returns whether this hit actually procs: window must still be open (within
   *  windowSeconds of when it opened) AND the count must be under maxProcs. Increments the count
   *  on a successful proc; closes (deletes) the window once it's both expired and exhausted is not
   *  required — expiry alone doesn't delete the entry (a later hit checks elapsed time again), but
   *  once maxProcs is reached the window is removed since no further check can ever succeed. */
  tryProc(windowKey) {
    const w = this._procWindows.get(windowKey);
    if (!w) return false;
    if ((this.time - w.openedAt) > w.windowSeconds) { this._procWindows.delete(windowKey); return false; }
    if (w.count >= w.maxProcs) return false;
    w.count += 1;
    if (w.count >= w.maxProcs) this._procWindows.delete(windowKey);
    return true;
  }

  /** Call when this character casts the outro block identified by `outroBlockId`, opening the
   *  partner-return window with the swap allowance named by the gating block's own trigger. */
  openPartnerOutroWindow(outroBlockId, maxInterveningSwaps) {
    this._outroWindows.set(outroBlockId, { swaps: 0, maxInterveningSwaps });
  }

  /** Call on every character-swap event in the simulated rotation (any swap, not just this
   *  character's own) while a partner-outro window might still be open. */
  registerSwap() {
    for (const [id, w] of this._outroWindows) {
      w.swaps += 1;
      if (w.swaps > w.maxInterveningSwaps) this._outroWindows.delete(id);
    }
  }

  /** Call when the buffed partner casts THEIR OWN Outro. Consumes the window and returns
   *  whether it was still open (i.e. within the swap allowance) at that moment. */
  tryPartnerOutroReturn(outroBlockId) {
    const had = this._outroWindows.has(outroBlockId);
    this._outroWindows.delete(outroBlockId);
    return had;
  }
}

/**
 * Walks a simplified rotation-step sequence against one character's block set and returns, per
 * step, the real firedTriggers Set — including derived 'windowed-cast:*'/'partner-outro-return:*'
 * keys that only appear when the simulator's own time/swap tracking says the condition was
 * actually met, not because a caller asserted it.
 *
 * @param {import('./triggerBlocks.schema.js').TriggerBlock[]} blocks
 * @param {Object[]} steps  Each: { type, skill, stepSeconds?, isSwap?, isSwapIn?, isOutroCast?,
 *   partnerReturnFor?, checksPriorCast?, triesProc? } — `type`/`skill` (when present) form the step's own
 *   'cast:TYPE:SKILL' key the same way triggerEngine.js's triggerKey() does, and are also recorded
 *   for 'requires-prior-cast' tracking. `isSwap` marks a character-swap event (advances every open
 *   partner-outro window's swap count). `isSwapIn` marks that this step is THIS character
 *   swapping in (resets the requires-prior-cast segment — a new on-field window). `isOutroCast`
 *   marks that this step IS this character's own outro-buff cast (opens a partner-return window
 *   for any 'partner-outro-return' block in `blocks` that references it). `partnerReturnFor` names
 *   an outro block id — set this on the step representing "the buffed partner cast their own Outro
 *   back" to attempt consuming that window. `checksPriorCast` names a 'requires-prior-cast' block
 *   id whose dependency should be checked at this step. `triesProc` names a 'windowed-proc' block
 *   id whose window should be checked for a proc at this step (only fires if that block's window is
 *   currently open and under its cap — see openProcWindow/tryProc).
 * @returns {{ step: Object, firedTriggers: Set<string> }[]}
 */
export function simulateRotation(blocks, steps) {
  const sim = new RotationSimulator();
  const windowedBlocks = blocks.filter(b => b.trigger.type === 'windowed-cast');
  const partnerBlocks = blocks.filter(b => b.trigger.type === 'partner-outro-return');
  const priorCastBlocks = blocks.filter(b => b.trigger.type === 'requires-prior-cast');
  const procBlocks = blocks.filter(b => b.trigger.type === 'windowed-proc');
  const ownOutroBlock = blocks.find(b => b.trigger.type === 'swap-out' && b.kind === 'buff');

  const results = [];
  for (const ev of steps) {
    sim.advance(ev.stepSeconds ?? DEFAULT_STEP_SECONDS);
    const fired = new Set(['passive']); // passive blocks are always eligible, same as every prior test's convention

    if (ev.isSwap) sim.registerSwap();
    if (ev.isSwapIn) sim.resetSegment();

    if (ev.type && ev.skill) {
      const castKey = `cast:${ev.type}:${ev.skill}`;
      fired.add(castKey);
      sim.recordCast(castKey);
      for (const b of windowedBlocks) {
        if (b.trigger.opensOn.includes(castKey)) sim.openWindow(b.trigger.opensOn.join('|'));
      }
      for (const b of procBlocks) {
        if (b.trigger.opensOnProc.includes(castKey)) {
          sim.openProcWindow(b.trigger.opensOnProc.join('|'), b.trigger.windowSeconds, b.trigger.maxProcs);
        }
      }
    }

    if (ev.checksPriorCast) {
      const b = priorCastBlocks.find(x => x.id === ev.checksPriorCast);
      if (b && sim.hasCastThisSegment(b.trigger.requiresPriorCast)) {
        fired.add(`requires-prior-cast:${b.trigger.requiresPriorCast}`);
      }
    }

    if (ev.consumesWindowBlockId) {
      const b = windowedBlocks.find(x => x.id === ev.consumesWindowBlockId);
      if (b) {
        const windowKey = b.trigger.opensOn.join('|');
        if (sim.tryWindowedCast(windowKey, b.trigger.windowSeconds)) {
          fired.add(`windowed-cast:${windowKey}`);
        }
      }
    }

    if (ev.isOutroCast && ownOutroBlock) {
      const gating = partnerBlocks.find(b => b.trigger.requiresActiveBlock === ownOutroBlock.id);
      if (gating) sim.openPartnerOutroWindow(ownOutroBlock.id, gating.trigger.maxInterveningSwaps);
    }

    if (ev.triesProc) {
      const b = procBlocks.find(x => x.id === ev.triesProc);
      if (b) {
        const windowKey = b.trigger.opensOnProc.join('|');
        if (sim.tryProc(windowKey)) {
          fired.add(`windowed-proc:${windowKey}`);
        }
      }
    }

    if (ev.partnerReturnFor) {
      if (sim.tryPartnerOutroReturn(ev.partnerReturnFor)) {
        fired.add(`partner-outro-return:${ev.partnerReturnFor}`);
      }
    }

    results.push({ step: ev, firedTriggers: fired });
  }
  return results;
}
