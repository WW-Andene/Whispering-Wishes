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
 * @param {Object[]} steps  Each: { type, skill, stepSeconds?, isSwap?, isOutroCast?,
 *   partnerReturnFor? } — `type`/`skill` (when present) form the step's own 'cast:TYPE:SKILL' key
 *   the same way triggerEngine.js's triggerKey() does. `isSwap` marks a character-swap event
 *   (advances every open partner-outro window's swap count). `isOutroCast` marks that this step
 *   IS this character's own outro-buff cast (opens a partner-return window for any
 *   'partner-outro-return' block in `blocks` that references it). `partnerReturnFor` names an
 *   outro block id — set this on the step representing "the buffed partner cast their own Outro
 *   back" to attempt consuming that window.
 * @returns {{ step: Object, firedTriggers: Set<string> }[]}
 */
export function simulateRotation(blocks, steps) {
  const sim = new RotationSimulator();
  const windowedBlocks = blocks.filter(b => b.trigger.type === 'windowed-cast');
  const partnerBlocks = blocks.filter(b => b.trigger.type === 'partner-outro-return');
  const ownOutroBlock = blocks.find(b => b.trigger.type === 'swap-out' && b.kind === 'buff');

  const results = [];
  for (const ev of steps) {
    sim.advance(ev.stepSeconds ?? DEFAULT_STEP_SECONDS);
    const fired = new Set(['passive']); // passive blocks are always eligible, same as every prior test's convention

    if (ev.isSwap) sim.registerSwap();

    if (ev.type && ev.skill) {
      const castKey = `cast:${ev.type}:${ev.skill}`;
      fired.add(castKey);
      for (const b of windowedBlocks) {
        if (b.trigger.opensOn.includes(castKey)) sim.openWindow(b.trigger.opensOn.join('|'));
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

    if (ev.partnerReturnFor) {
      if (sim.tryPartnerOutroReturn(ev.partnerReturnFor)) {
        fired.add(`partner-outro-return:${ev.partnerReturnFor}`);
      }
    }

    results.push({ step: ev, firedTriggers: fired });
  }
  return results;
}
