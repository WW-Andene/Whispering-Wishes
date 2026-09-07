// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/decision/decisionEngine.js
// [RESOLVER · DECISION] Generic priority-list decision runner — the first piece of
// ADAPTIVE_ENGINE_DESIGN.md's proposed "decision layer" (see that doc for the full
// architecture rationale). Pilot: Hiyuki (engine/characterBlocks/hiyuki.kitRules.js).
//
// Replaces a hand-authored CHARACTER_ROTATIONS sequence with a real state machine: given a
// character's own resource/stance state and an ORDERED list of priority rules (highest first),
// each tick fires the first rule whose `condition(state)` holds, applies its `apply(state)`
// mutation, and records the {type, skill} step it produced — the SAME shape
// deriveStepsFromRotation() already expects, so the output feeds directly into the existing
// resolveHitComposedDps() pipeline with zero changes to that side.
//
// This does not decide WHICH move is "best" in any general sense — it mechanically fires
// whatever a character's own kit rules say comes next, in priority order, exactly the way a
// human following that same priority list would play. The kit rules (not this file) are where
// the real per-character logic lives; this file is deliberately character-agnostic.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} PriorityRule
 * @property {string} id             Unique rule id (for debugging/tests).
 * @property {{type: string, skill: string}} [step]  The rotation step this rule produces when
 *   fired — a fixed object, for a rule whose step never needs data from the current state. Mutually
 *   exclusive with `buildStep` below (a rule provides exactly one of the two).
 * @property {(state: Object) => {type: string, skill: string}} [buildStep]  Self-kit
 *   cross-interaction support (2026-09-07): builds the step from the CURRENT state, called BEFORE
 *   `apply()` mutates it — for a real per-cast value that depends on live resource state at the
 *   moment of casting (e.g. Hiyuki's Blade Liberation carrying exactly how many Snowforged Blade
 *   stacks she's actually banked this rotation, via a `snowforgedBladeConsumed` extra field the
 *   damage block's own `hit.perStepUnit` reads — see hiyuki.blocks.js/resolveHitComposedDps.js).
 * @property {(state: Object) => boolean} condition  Whether this rule can fire given current state.
 * @property {(state: Object) => void} apply  Mutates state in place to reflect the step happening
 *   (resource gains/costs, stance transitions, counters) — same real numbers the character's own
 *   kit rules file sources from its Data dump, never invented here.
 */

/**
 * Runs a priority-list decision loop until no rule can fire (a real terminal state, e.g. every
 * resource consumed and no follow-up available) or `maxSteps` is reached (a safety bound against
 * an accidentally-cyclic rule set, not a real gameplay limit).
 *
 * @param {Object} initialState  The character's starting CharacterRuntimeState (see
 *   ADAPTIVE_ENGINE_DESIGN.md's own `CharacterRuntimeState` shape) — plain, mutable object.
 * @param {PriorityRule[]} rules  Ordered highest-priority-first.
 * @param {number} [maxSteps]  Safety bound, default 200.
 * @returns {{ steps: {type: string, skill: string}[], firedRuleIds: string[], finalState: Object }}
 */
export function runDecisionRotation(initialState, rules, maxSteps = 200) {
  const state = initialState;
  const steps = [];
  const firedRuleIds = [];

  for (let i = 0; i < maxSteps; i++) {
    const rule = rules.find(r => r.condition(state));
    if (!rule) break;
    const step = rule.buildStep ? rule.buildStep(state) : rule.step;
    rule.apply(state);
    steps.push(step);
    firedRuleIds.push(rule.id);
  }

  return { steps, firedRuleIds, finalState: state };
}
