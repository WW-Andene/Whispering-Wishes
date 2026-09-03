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

import { winningStanceForOwner } from './sequenceGating.js';

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
    // blockId -> time it next becomes eligible again — backs timing.cooldown enforcement (see
    // isReady/useCooldown below). PHASE2_PLAN.md flagged this as a known gap: `timing.cooldown` was
    // declared on many blocks (Rover's Thunderclap: 10s, Yinlin's Magnetic Roar: 12s, Augusta's S6:
    // 1s, etc.) but nothing ever checked it — a block re-triggered every time its cast key appeared
    // in firedTriggers, even within its own cooldown window. This only matters across a MULTI-loop
    // or repeated-cast simulated rotation (a single canonical one-cast-per-skill loop never hits it
    // in practice), but it's a real correctness gap for anything simulating more than one loop.
    this._cooldowns = new Map();
  }

  // Owner-namespacing: every method below that tracks a SINGLE character's own rotation history
  // (cooldowns, windowed-cast windows, proc windows, requires-prior-cast segments) takes an optional
  // `owner` string and composes it into the internal Map/Set key. Single-character callers (every
  // test/driver written before multi-character interleaving) simply omit `owner`, which defaults to
  // '' consistently everywhere — same effective keys as before this refactor, so no behavior change
  // for any existing caller. `_outroWindows` and `registerSwap()` deliberately have NO owner
  // parameter: partner-outro-return is inherently cross-character (Augusta's OWN block tracks
  // whether a DIFFERENT character returned an Outro), and the swap counter has to be one shared
  // clock across the whole team, not per-character.
  #ns(key, owner) { return `${owner || ''}::${key}`; }

  /** Is `blockId` off cooldown (or never used) at the simulator's current time? */
  isReady(blockId, owner) {
    const readyAt = this._cooldowns.get(this.#ns(blockId, owner));
    return readyAt == null || this.time >= readyAt;
  }

  /** Record that `blockId` was just used, starting its cooldown. Call this ONLY when isReady()
   *  already returned true for it — this doesn't itself check readiness, so a caller that ignores
   *  isReady() can still record overlapping activations (garbage in, garbage out, same as every
   *  other method on this class). */
  useCooldown(blockId, cooldownSeconds, owner) {
    this._cooldowns.set(this.#ns(blockId, owner), this.time + cooldownSeconds);
  }

  /** Call for every 'cast:TYPE:SKILL' key that occurs, so requires-prior-cast can later check it. */
  recordCast(castKey, owner) {
    this._castsThisSegment.add(this.#ns(castKey, owner));
  }

  /** Has `castKey` occurred since the last resetSegment()? Does not consume — a prior cast can gate
   *  multiple later blocks (e.g. every Twining-style hit for the rest of the segment). */
  hasCastThisSegment(castKey, owner) {
    return this._castsThisSegment.has(this.#ns(castKey, owner));
  }

  /** Call on swap-IN (a new on-field segment starting) — requires-prior-cast dependencies don't
   *  carry across a swap-out/swap-in cycle, only within one continuous on-field window. Only clears
   *  THIS owner's cast records (matters in team mode — one member swapping in must not wipe every
   *  other member's already-recorded casts). */
  resetSegment(owner) {
    const prefix = this.#ns('', owner);
    for (const k of this._castsThisSegment) {
      if (k.startsWith(prefix)) this._castsThisSegment.delete(k);
    }
  }

  advance(seconds) {
    this.time += seconds;
  }

  /** Call when a windowed-cast block's opensOn trigger fires. */
  openWindow(windowKey, owner) {
    this._windows.set(this.#ns(windowKey, owner), this.time);
  }

  /**
   * Call when the empowered/windowed move is actually attempted. Consumes the window
   * (a real window can only be tried once) and returns whether it landed in time.
   * Returns false with no side effect beyond consumption if the window was never opened.
   */
  tryWindowedCast(windowKey, windowSeconds, owner) {
    const k = this.#ns(windowKey, owner);
    const openedAt = this._windows.get(k);
    this._windows.delete(k);
    if (openedAt == null) return false;
    return (this.time - openedAt) <= windowSeconds;
  }

  /** Call when a windowed-proc block's opensOnProc trigger fires — (re)opens the proc window,
   *  resetting its count. A cast that reopens an already-open window (e.g. re-casting Liberation
   *  before the prior 30s window closed) restarts the count, matching "in the first 30s after
   *  casting" being anchored to the MOST RECENT cast, not accumulating across casts. */
  openProcWindow(windowKey, windowSeconds, maxProcs, owner) {
    this._procWindows.set(this.#ns(windowKey, owner), { openedAt: this.time, windowSeconds, count: 0, maxProcs, lastProcAt: null });
  }

  /** Call when a qualifying hit (the proc block's `on` type) occurs while a proc window might be
   *  open. Returns whether this hit actually procs: window must still be open (within
   *  windowSeconds of when it opened) AND the count must be under maxProcs. Increments the count
   *  on a successful proc; closes (deletes) the window once it's both expired and exhausted is not
   *  required — expiry alone doesn't delete the entry (a later hit checks elapsed time again), but
   *  once maxProcs is reached the window is removed since no further check can ever succeed.
   *  `minInterval` (added alongside `crossCharacterHit` — Cantarella's Diffusion, "up to 1 Coordinated
   *  Attack per second"): when set, a hit within `minInterval` seconds of the window's own last
   *  successful proc doesn't count — still a legitimate qualifying hit, it just doesn't advance the
   *  window this time (no side effect, can proc again once enough time passes). */
  tryProc(windowKey, owner, minInterval) {
    const k = this.#ns(windowKey, owner);
    const w = this._procWindows.get(k);
    if (!w) return false;
    if ((this.time - w.openedAt) > w.windowSeconds) { this._procWindows.delete(k); return false; }
    if (w.count >= w.maxProcs) return false;
    if (minInterval && w.lastProcAt != null && (this.time - w.lastProcAt) < minInterval) return false;
    w.count += 1;
    w.lastProcAt = this.time;
    if (w.count >= w.maxProcs) this._procWindows.delete(k);
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
 * @returns {{ step: Object, firedTriggers: Set<string>, ineligibleBlockIds: Set<string>, time: number }[]}
 *   `ineligibleBlockIds` names blocks whose OWN `timing.cooldown` says they can't fire yet even
 *   though their trigger key is present in `firedTriggers` (see cooldown-gated 'cast' blocks below)
 *   — pass it as `ctx.ineligibleBlockIds` to resolveTriggerBlocks() to have it actually skip them.
 *   `time` is the simulator's cumulative elapsed time AFTER this step (i.e. when this step's cast/
 *   effect actually lands) — used by resolveSimulatedRotation.js to place each activation on a real
 *   timeline instead of only knowing relative step order.
 */
export function simulateRotation(blocks, steps) {
  return simulateStepsCore(new RotationSimulator(), steps.map(s => ({ ...s, owner: '' })), { '': blocks });
}

// The real shared implementation behind both simulateRotation() (single character) and
// simulateTeamRotation() (multi-character — see that function below). Single-character mode is
// simply the special case where every step's owner is '' and `blocksByOwner` has one entry — this
// function doesn't know or care whether it's resolving one character's own kit or a full team's
// interleaved timeline, since every owner-scoped RotationSimulator call already takes the owner
// namespace as a parameter (see RotationSimulator's own #ns doc comment for why `_outroWindows`/
// registerSwap() deliberately have NO owner param: partner-outro-return and the swap clock are
// inherently cross-character/global, not per-owner).
function simulateStepsCore(sim, ownedSteps, blocksByOwner) {
  const allBlocks = Object.values(blocksByOwner).flat();
  // the engine-architecture history (git log) item 9 (Denia/Lynae mode-conditional appliesTags gap): resolved once per
  // owner up front, not per step — the "assumed active mode" for a dual-mode character doesn't
  // change mid-rotation in this theoretical-optimizer reading (see winningStanceForOwner's own
  // comment), and every tag-entry check below just reads this cache.
  const ownerStances = new Map();
  const stanceForOwner = (owner) => {
    if (!ownerStances.has(owner)) ownerStances.set(owner, winningStanceForOwner(allBlocks, owner));
    return ownerStances.get(owner);
  };
  // partnerBlocks is intentionally NOT scoped per-owner: a 'partner-outro-return' block can belong
  // to any team member (in practice, so far, only Augusta-shaped kits have one) and its
  // `requiresActiveBlock` references THAT SAME member's own outro-buff block id — which step's
  // isOutroCast should open that gate is resolved per-step below by looking up the CURRENT step's
  // own owner's outro block, then searching this global list for a match.
  const partnerBlocks = allBlocks.filter(b => b.trigger.type === 'partner-outro-return');
  // Cross-character 'windowed-proc' blocks (Cantarella's Diffusion — REMAINING_WORK.md 1a): NOT
  // scoped per-owner, same reason partnerBlocks isn't — the window OPENS off its owner's own cast
  // (handled by the normal per-owner procBlocks loop below, since blocksByOwner[owner] already
  // includes the block when iterating that owner's own steps), but ADVANCING it happens off every
  // step ANY team member takes, checked unconditionally on every iteration below rather than needing
  // a hand-set `ev.triesProc` flag the way single-owner windowed-proc blocks do.
  const crossCharacterProcBlocks = allBlocks.filter(b => b.trigger.type === 'windowed-proc' && b.trigger.crossCharacterHit);

  const results = [];
  for (const ev of ownedSteps) {
    const owner = ev.owner || '';
    const blocks = blocksByOwner[owner] || [];
    const windowedBlocks = blocks.filter(b => b.trigger.type === 'windowed-cast');
    const priorCastBlocks = blocks.filter(b => b.trigger.type === 'requires-prior-cast');
    const procBlocks = blocks.filter(b => b.trigger.type === 'windowed-proc');
    const ownOutroBlock = blocks.find(b => b.trigger.type === 'swap-out');
    // Cooldown-gated 'cast' blocks — trigger.on is the same TYPE:SKILL label attemptOn/checksAt/on
    // (proc) already use, so matching a step to its own block(s) is the same lookup pattern.
    const cooldownCastBlocks = blocks.filter(b => b.trigger.type === 'cast' && b.trigger.on && b.timing?.cooldown != null);

    sim.advance(ev.stepSeconds ?? DEFAULT_STEP_SECONDS);
    const fired = new Set(['passive']); // passive blocks are always eligible, same as every prior test's convention
    const ineligibleBlockIds = new Set();
    const actionTags = new Set(); // 'ally-action' support — see the collection loop below

    // registerSwap()/the swap clock are global (no owner) — every swap counts against every open
    // partner-outro window across the WHOLE team, not just this step's own owner. resetSegment IS
    // owner-scoped: one member swapping in must not wipe another member's already-recorded casts.
    if (ev.isSwap) sim.registerSwap();
    if (ev.isSwapIn) sim.resetSegment(owner);
    // Real gap found while building resolveSimulatedRotation.js: this loop tracked swap EVENTS for
    // window bookkeeping (registerSwap/resetSegment above) but never actually marked the plain
    // 'swap-out'/'swap-in' trigger keys as fired — meaning every outro-buff block in the roster
    // (trigger.type: 'swap-out' is how EVERY converted character's own outro buff is declared, e.g.
    // Rover: Electro's Rumbling Thunders, Yinlin's Strategist) could never actually resolve through
    // simulateRotation(), only through a test hand-feeding firedTriggers directly. isOutroCast/
    // isSwapIn already name exactly which step IS this character's own outro cast / own swap-in, so
    // this reuses those same flags rather than adding new ones.
    if (ev.isOutroCast) fired.add('swap-out');
    if (ev.isSwapIn) fired.add('swap-in');

    // 'resource-threshold' blocks: see deriveStepsFromRotation()'s own resourceStepOn handling and
    // triggerBlocks.schema.js's doc for why this trusts the step itself rather than tracking a real
    // gauge value — `firesResourceThreshold` names which block's threshold this step represents.
    if (ev.firesResourceThreshold) {
      const b = blocks.find(x => x.id === ev.firesResourceThreshold && x.trigger.type === 'resource-threshold');
      if (b) fired.add(`resource-threshold:${b.trigger.resource}:${b.trigger.threshold}`);
    }

    if (ev.type && ev.skill) {
      const castKey = `cast:${ev.type}:${ev.skill}`;
      fired.add(castKey);
      sim.recordCast(castKey, owner);
      for (const b of windowedBlocks) {
        if (b.trigger.opensOn.includes(castKey)) sim.openWindow(b.trigger.opensOn.join('|'), owner);
      }
      for (const b of procBlocks) {
        if (b.trigger.opensOnProc.includes(castKey)) {
          // crossCharacterHit blocks are keyed by the block's own declared owner (b.source), not the
          // step's owner — needed for solo mode, where every step's `owner` is forced to '' regardless
          // of which character's blocks they're from (simulateRotation()'s single-character shorthand),
          // but the cross-character advancement pass below (crossCharacterProcBlocks) always looks the
          // window up under b.source since it runs for steps belonging to OTHER owners too, who have no
          // reason to know what key this step's own owner used. Every other windowed-proc block keeps
          // using the step's own `owner`, unchanged.
          const openOwner = b.trigger.crossCharacterHit ? b.source : owner;
          sim.openProcWindow(b.trigger.opensOnProc.join('|'), b.trigger.windowSeconds, b.trigger.maxProcs, openOwner);
        }
      }
      const label = `${ev.type}:${ev.skill}`;
      for (const b of cooldownCastBlocks) {
        if (b.trigger.on !== label) continue;
        if (sim.isReady(b.id, owner)) {
          sim.useCooldown(b.id, b.timing.cooldown, owner);
        } else {
          // Cast attempted while this specific block is still on cooldown — the raw input still
          // shows up in `fired` (the button was pressed), but the block itself must not resolve
          // this time. resolveTriggerBlocks() has no way to know this on its own (it only sees a
          // shared trigger key, not per-block cooldown state), so the caller has to pass this set
          // explicitly — same "name it in the state machine, apply it via ctx" split as every other
          // conditional trigger type in this file.
          ineligibleBlockIds.add(b.id);
        }
      }
      // 'ally-action' support (the engine-architecture history (git log) item 9): collect which real-game status/action
      // tags THIS step's own cast applies, from any of this owner's OWN blocks whose trigger matches
      // this exact cast and that carry `appliesTags` (usually the damage block for this same move).
      // Cooldown-ineligible blocks (just computed above) don't count as actually resolving, so their
      // tags don't fire either. Attached to the result row below as `actionTags` — a GLOBAL, owner-
      // tagged event stream any OTHER team member's 'ally-action' trigger can scan across every
      // owner's results, not just its own (see buildBlockWindows.js's own doc for how consumers read
      // this cross-character, unlike every other trigger type which is intentionally owner-scoped).
      for (const b of blocks) {
        if (b.trigger.type !== 'cast' || b.trigger.on !== label || !b.appliesTags?.length) continue;
        if (ineligibleBlockIds.has(b.id)) continue;
        for (const entry of b.appliesTags) {
          // Bare-string entries (Qingxiao's shape) are unconditional, as before. Object entries
          // ({tag, requiresStance} — Denia/Lynae's shape) only fire when this owner's own resolved
          // mode (see stanceForOwner above) matches — added 2026-09-02, the engine-architecture history (git log) item 9.
          if (typeof entry === 'string') { actionTags.add(entry); continue; }
          if (entry.requiresStance == null || stanceForOwner(owner) === entry.requiresStance) actionTags.add(entry.tag);
        }
      }
      // Universal 'echo-skill-cast' tag (added 2026-09-02, the engine-merge history (git log) Phase 0.5 gap #2 —
      // Sigrika's S4 retrofit): using an equipped Echo isn't a per-character KIT fact the way Shifting
      // application is (any character can use ANY Echo, unrelated to their own kit) — real
      // CHARACTER_ROTATIONS data already represents it uniformly as `{type:'Echo', skill:'Use Echo'}`
      // for whoever casts it, so this tag fires directly off the step's own `type`, not off a
      // per-character `appliesTags` declaration nobody would sensibly own. One small universal rule
      // here benefits every current/future character with an "ally casts Echo Skill" reactive mechanic,
      // not just Sigrika.
      if (ev.type === 'Echo') actionTags.add('echo-skill-cast');

      // Cross-character 'windowed-proc' advancement (Cantarella's Diffusion): checked on EVERY
      // step's own qualifying hit, regardless of whose kit the block belongs to — `on`, when set,
      // still restricts which hit TYPE counts (same label match as the per-owner path); when omitted
      // (Diffusion's real text has no move-type filter — "every hit she or the team lands"), any
      // step with a real cast/hit label qualifies. `owner` passed to tryProc is the BLOCK's own
      // owner (b.source), not this step's owner — the window belongs to whoever opened it.
      for (const b of crossCharacterProcBlocks) {
        if (b.trigger.on && b.trigger.on !== label) continue;
        const windowKey = b.trigger.opensOnProc.join('|');
        if (sim.tryProc(windowKey, b.source, b.trigger.minProcInterval)) {
          fired.add(`windowed-proc:${windowKey}`);
        }
      }
    }

    if (ev.checksPriorCast) {
      const b = priorCastBlocks.find(x => x.id === ev.checksPriorCast);
      if (b && sim.hasCastThisSegment(b.trigger.requiresPriorCast, owner)) {
        fired.add(`requires-prior-cast:${b.trigger.requiresPriorCast}`);
      }
    }

    if (ev.consumesWindowBlockId) {
      const b = windowedBlocks.find(x => x.id === ev.consumesWindowBlockId);
      if (b) {
        const windowKey = b.trigger.opensOn.join('|');
        if (sim.tryWindowedCast(windowKey, b.trigger.windowSeconds, owner)) {
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
        if (sim.tryProc(windowKey, owner)) {
          fired.add(`windowed-proc:${windowKey}`);
        }
      }
    }

    if (ev.partnerReturnFor) {
      if (sim.tryPartnerOutroReturn(ev.partnerReturnFor)) {
        fired.add(`partner-outro-return:${ev.partnerReturnFor}`);
      }
    }

    results.push({ step: ev, owner, firedTriggers: fired, ineligibleBlockIds, actionTags, time: sim.time });
  }
  return results;
}

/**
 * Walks a REAL CHARACTER_ROTATIONS[charName] array (the {type, skill, note, duration?} shape
 * characters.js already carries for ~56 of ~60 characters) and derives the annotated `steps` array
 * simulateRotation() expects — closing PHASE2_PLAN.md design question 2's remaining gap: until now,
 * every test in this repo (rotationSimulator.test.js) hand-built its own `steps` array with
 * `isSwap`/`isOutroCast`/`consumesWindowBlockId`/`checksPriorCast`/`triesProc` flags set by a human
 * reading the block set, which meant simulateRotation had never actually been run against the SAME
 * rotation data the rest of the app (RotationTimeline.jsx, CharacterDetailModal.jsx) already reads.
 *
 * What this derives automatically, from the block set alone (no new data entry needed):
 *   - `isSwapIn`: the character's own opening Intro-type step (index 0, type 'Intro').
 *   - `isSwap`/`isOutroCast`: the character's own Outro-type step, when this character has an
 *     own-outro buff block (trigger.type 'swap-out', kind 'buff') to attribute it to.
 *   - `consumesWindowBlockId`: any step whose `TYPE:SKILL` label matches a 'windowed-cast' block's
 *     `attemptOn` field (added alongside this function specifically so this match is possible).
 *   - `triesProc`: any step whose `TYPE:SKILL` label matches a 'windowed-proc' block's `on` field.
 *   - `checksPriorCast`: any step whose `TYPE:SKILL` label matches a 'requires-prior-cast' block's
 *     `checksAt` field (added alongside this function, same reasoning as `attemptOn`).
 *
 * What this does NOT derive (still needs a hand-built step, or item 2 below in PHASE2_PLAN.md's
 * backlog — multi-character interleaving): `partnerReturnFor` for 'partner-outro-return' blocks
 * (Augusta-style) — evaluating whether a DIFFERENT character's Outro actually returned in time is
 * fundamentally a cross-character question a single character's own CHARACTER_ROTATIONS array can't
 * answer; a block set with a 'partner-outro-return' trigger still needs that one step supplied by
 * the caller (or, once multi-character interleaving lands, by a team-level deriver built on top of
 * this one). Blocks whose `attemptOn`/`on`/`checksAt` field isn't set yet (an older conversion that
 * predates this function) simply won't auto-resolve that one condition — same as before, no
 * regression, just not upgraded yet.
 *
 * @param {{type: string, skill?: string, duration?: number}[]} rotation  CHARACTER_ROTATIONS[charName]
 * @param {import('./triggerBlocks.schema.js').TriggerBlock[]} blocks
 * @param {number} [stepSeconds]  Pacing override, same DEFAULT_STEP_SECONDS caveat as simulateRotation.
 * @returns {Object[]} a `steps` array ready to pass straight into simulateRotation()
 */
export function deriveStepsFromRotation(rotation, blocks, stepSeconds = DEFAULT_STEP_SECONDS) {
  const windowedBlocks = blocks.filter(b => b.trigger.type === 'windowed-cast' && b.trigger.attemptOn);
  const procBlocks = blocks.filter(b => b.trigger.type === 'windowed-proc' && b.trigger.on);
  const priorCastBlocks = blocks.filter(b => b.trigger.type === 'requires-prior-cast' && b.trigger.checksAt);
  const resourceBlocks = blocks.filter(b => b.trigger.type === 'resource-threshold' && b.trigger.resourceStepOn);
  const ownOutroBlock = blocks.find(b => b.trigger.type === 'swap-out');

  return rotation.map((raw, i) => {
    const step = { type: raw.type, skill: raw.skill, stepSeconds };
    const label = raw.type && raw.skill ? `${raw.type}:${raw.skill}` : null;

    if (i === 0 && raw.type === 'Intro') step.isSwapIn = true;

    if (raw.type === 'Outro' && ownOutroBlock) {
      step.isSwap = true;
      step.isOutroCast = true;
    }

    const consumesBlock = label && windowedBlocks.find(b => b.trigger.attemptOn === label);
    if (consumesBlock) step.consumesWindowBlockId = consumesBlock.id;

    const procBlock = label && procBlocks.find(b => b.trigger.on === label);
    if (procBlock) step.triesProc = procBlock.id;

    const priorCastBlock = label && priorCastBlocks.find(b => b.trigger.checksAt === label);
    if (priorCastBlock) step.checksPriorCast = priorCastBlock.id;

    const resourceBlock = label && resourceBlocks.find(b => b.trigger.resourceStepOn === label);
    if (resourceBlock) step.firesResourceThreshold = resourceBlock.id;

    return step;
  });
}

/**
 * Multi-character interleaving — PHASE2_PLAN.md's other remaining engine gap. Everything above this
 * point (RotationSimulator, simulateRotation, deriveStepsFromRotation) resolves ONE character's own
 * kit in isolation. Real teams interleave: Augusta's 'partner-outro-return' needs to know when a
 * DIFFERENT character casts their own Outro; the swap clock that gates it has to count every swap
 * across the WHOLE team, not just one character's own. This is exactly why RotationSimulator's
 * methods were just refactored to take an optional `owner` namespace (see the class's own #ns doc
 * comment) — `simulateTeamRotation` is the actual multi-character consumer of that refactor.
 *
 * @param {{owner: string, blocks: import('./triggerBlocks.schema.js').TriggerBlock[]}[]} membersWithSteps
 *   Not quite right shape — see buildTeamSteps below for how real callers should normally get here.
 *   This function's OWN contract is simpler and lower-level: it just needs an already-owner-tagged,
 *   already-time-ordered step array (each step has an `owner` field naming which team member it
 *   belongs to) plus a lookup of each owner's own block set.
 * @param {Object[]} ownedSteps  Same per-step shape simulateRotation() takes, PLUS a required
 *   `owner` field (the team member's name) on every step.
 * @param {Object<string, import('./triggerBlocks.schema.js').TriggerBlock[]>} blocksByOwner
 *   Each team member's own block set, keyed by the same owner name used in `ownedSteps`.
 * @returns Same shape as simulateRotation()'s return, with `owner` populated per result instead of
 *   always ''.
 */
export function simulateTeamRotation(ownedSteps, blocksByOwner) {
  return simulateStepsCore(new RotationSimulator(), ownedSteps, blocksByOwner);
}

/**
 * Builds a real, owner-tagged, time-ordered team step sequence from each member's own
 * CHARACTER_ROTATIONS data and block set — the team-level equivalent of deriveStepsFromRotation(),
 * and the thing that actually makes simulateTeamRotation() usable against real app data instead of a
 * hand-built fixture. Reuses deriveStepsFromRotation() per member (no duplicated annotation logic),
 * then adds exactly two things a single character's own view can't know:
 *
 *   1. Swap boundaries between members — guaranteed on every non-last member's own final step
 *      regardless of whether that member happens to have an outro-BUFF block (Camellya, for example,
 *      has no outroBuffs at all — CHAR_BUFF_TABLE['Camellya'].outroBuffs is genuinely empty — but her
 *      swap-out still has to count against the team's shared swap clock, or Augusta-style
 *      maxInterveningSwaps counting would silently undercount). deriveStepsFromRotation's own
 *      isSwap/isOutroCast heuristic (Outro-type step + an own-outro BUFF block) is trusted first
 *      since it's more semantically precise (real cast happening then); this only backfills the
 *      swap BOUNDARY itself when that heuristic had nothing to attach it to.
 *   2. `partnerReturnFor` cross-referencing for 'partner-outro-return' blocks (Augusta-shaped kits):
 *      when member i has such a block gating on their OWN outro, and member i+1 (the very next member
 *      in team order — who is who they buffed, matching how 'next-on-field' buffs already resolve
 *      elsewhere in this codebase) later casts THEIR OWN outro, that step is tagged so
 *      tryPartnerOutroReturn() actually gets attempted there — a single character's own
 *      deriveStepsFromRotation output has no way to know this, since it doesn't know who comes next
 *      in the team.
 *
 * @param {{name: string, rotation: Object[], blocks: import('./triggerBlocks.schema.js').TriggerBlock[], stepSeconds?: number}[]} members
 *   Team members in ON-FIELD ORDER (matches calcTeamStats.js's own rotationTimeline.segments
 *   ordering convention — supports first, main DPS last). `rotation` is that member's own
 *   CHARACTER_ROTATIONS[name] array.
 * @returns {{ownedSteps: Object[], blocksByOwner: Object}} ready to pass straight into
 *   simulateTeamRotation(ownedSteps, blocksByOwner).
 */
export function buildTeamSteps(members) {
  const ownedSteps = [];
  const blocksByOwner = {};
  const ownOutroBlockOf = (m) => m.blocks.find(b => b.trigger.type === 'swap-out');
  const partnerReturnBlockOf = (m) => m.blocks.find(b => b.trigger.type === 'partner-outro-return');

  members.forEach((member, i) => {
    blocksByOwner[member.name] = member.blocks;
    const perMemberSteps = deriveStepsFromRotation(member.rotation, member.blocks, member.stepSeconds);
    const tagged = perMemberSteps.map(s => ({ ...s, owner: member.name }));

    // Guarantee (1): every member's own first step is a real swap-in for THEM, regardless of
    // whether their CHARACTER_ROTATIONS happens to literally start with an 'Intro'-type step.
    if (tagged.length) tagged[0].isSwapIn = true;
    // Guarantee (1) continued: every non-last member's own final step is a real swap boundary,
    // regardless of whether deriveStepsFromRotation's own Outro-type + own-outro-block heuristic
    // already caught it.
    if (tagged.length && i < members.length - 1) tagged[tagged.length - 1].isSwap = true;

    ownedSteps.push(...tagged);

    // Guarantee (2): if the PREVIOUS member has a partner-outro-return block gating on their own
    // outro, and THIS member is the very next one in team order (the partner they buffed), tag THIS
    // member's own outro-cast step (if any) as the return attempt.
    if (i > 0) {
      const prev = members[i - 1];
      const prevOwnOutro = ownOutroBlockOf(prev);
      const prevPartnerBlock = partnerReturnBlockOf(prev);
      if (prevOwnOutro && prevPartnerBlock && prevPartnerBlock.trigger.requiresActiveBlock === prevOwnOutro.id) {
        const thisMembersOutroStep = [...tagged].reverse().find(s => s.isOutroCast);
        if (thisMembersOutroStep) thisMembersOutroStep.partnerReturnFor = prevPartnerBlock.trigger.requiresActiveBlock;
      }
    }
  });

  return { ownedSteps, blocksByOwner };
}
