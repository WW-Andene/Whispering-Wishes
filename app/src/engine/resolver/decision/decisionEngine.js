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
 * @property {(state: Object, level?: number) => {type: string, skill: string}} [buildStep]  Self-kit
 *   cross-interaction support (2026-09-07): builds the step from the CURRENT state, called BEFORE
 *   `apply()` mutates it — for a real per-cast value that depends on live resource state at the
 *   moment of casting (e.g. Hiyuki's Blade Liberation carrying exactly how many Snowforged Blade
 *   stacks she's actually banked this rotation, via a `snowforgedBladeConsumed` extra field the
 *   damage block's own `hit.perStepUnit` reads — see hiyuki.blocks.js/resolveHitComposedDps.js). The
 *   optional `level` param is only ever passed by validateSequence()'s `resourceLevel` handling
 *   below (a specific requested level, e.g. "what if she only spent 1 of her 3 banked stacks") —
 *   omit it to mean "use whatever's currently banked" (runDecisionRotation() never passes it).
 * @property {(state: Object) => boolean} condition  Whether this rule can fire given current state.
 * @property {(state: Object, level?: number) => void} apply  Mutates state in place to reflect the
 *   step happening (resource gains/costs, stance transitions, counters) — same real numbers the
 *   character's own kit rules file sources from its Data dump, never invented here. Same optional
 *   `level` param as `buildStep`.
 * @property {{field: string, min?: number, max?: number}} [resourceLevel]  Leveled-action support
 *   (2026-09-07, direct request: "Liberation has multiple levels, level needs this resource, level
 *   deals that much damage — treat the level as absolute, no animation/charge-duration modeling
 *   needed"): declares this rule represents an action whose real output scales with how much of
 *   `state[field]` gets spent on it (0 to `max`, defaulting to unbounded), rather than always
 *   spending everything banked. ONLY consulted by validateSequence() — the generator
 *   (runDecisionRotation) always spends the max available (real optimal play: more of a resource
 *   spent on a damage-scaling move is never worse), so this only matters for checking a
 *   HYPOTHETICAL candidate sequence that explicitly requests a specific level via a
 *   `${field}Consumed` field on its own step object.
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

/**
 * Validates an ARBITRARY candidate step sequence against a character's real kit rules — the
 * missing half of runDecisionRotation() (which only ever GENERATES a sequence from her own rule
 * set). Answers "if I swap/reorder moves, does the engine know what's actually legal and what
 * happens" (2026-09-07, direct request): walks the given steps one at a time, and at each one asks
 * whether ANY rule in the character's own rule set both (a) produces a step matching this one's
 * {type, skill}, and (b) has a `condition` that holds given the REAL state as of this point in the
 * walk (not the state a human assumed) — i.e. every prerequisite move actually happened first, in
 * this exact candidate sequence, not some other one. This is NOT a copy of runDecisionRotation's
 * own priority-ordering logic — a step can be legal here even if a HIGHER-priority rule was also
 * available and would have been preferred by the generator; this only checks "was this specific
 * move actually possible right now," not "was it what the optimal player would have done."
 *
 * Unlike resolveHitComposedDps()/rotationSimulator.js (which only ever enforce a block's own
 * cooldown on an arbitrary input sequence — confirmed via a real illegal-sequence test: feeding it
 * Bitterfrost before ever building Whiteout Bitterfrost still silently computed real damage), this
 * function is where a character's actual resource/prerequisite legality can be checked.
 *
 * @param {Object} initialState
 * @param {PriorityRule[]} rules  Same rule set runDecisionRotation() would use — does NOT need to
 *   be priority-ordered for this function (order doesn't affect legality checking), but passing the
 *   same array is fine and typical.
 * @param {{type: string, skill: string}[]} candidateSteps  The sequence to check — e.g. a curated
 *   CHARACTER_ROTATIONS array, or a hand-edited "what if I swapped these two" variant.
 * @returns {{
 *   results: {step: {type:string, skill:string}, legal: boolean, reason: string, ruleId: string|null}[],
 *   allLegal: boolean,
 *   finalState: Object,
 * }}
 */
export function validateSequence(initialState, rules, candidateSteps) {
  const state = initialState;
  const results = [];
  let allLegal = true;

  for (const candidate of candidateSteps) {
    // A rule "matches" this candidate step's {type, skill} regardless of whether its OWN
    // condition currently holds — checked separately below, so a real distinction can be drawn
    // between "not part of her kit rules at all" and "part of her kit, but not legal yet."
    const matchingRules = rules.filter(r => {
      const ruleStep = r.buildStep ? r.buildStep(state) : r.step;
      return ruleStep.type === candidate.type && ruleStep.skill === candidate.skill;
    });

    if (!matchingRules.length) {
      results.push({ step: candidate, legal: false, reason: 'no kit rule produces this move at all', ruleId: null });
      allLegal = false;
      continue;
    }

    const readyRule = matchingRules.find(r => r.condition(state));
    if (!readyRule) {
      results.push({ step: candidate, legal: false, reason: 'prerequisites not met yet at this point in the sequence', ruleId: null });
      allLegal = false;
      continue;
    }

    // Leveled-action support (see PriorityRule.resourceLevel's own doc): a candidate step can
    // explicitly request a specific level (e.g. "spend only 1 of her banked 3 Snowforged Blade")
    // via a `${field}Consumed` field — checked against what's REALLY banked at this exact point,
    // not the rule's own default "spend everything" behavior. Omitting the field on the candidate
    // means "use whatever's banked," matching the generator's own default.
    if (readyRule.resourceLevel) {
      const { field, min = 0, max = Infinity } = readyRule.resourceLevel;
      const available = state[field] ?? 0;
      const requestedLevel = candidate[`${field}Consumed`] != null ? candidate[`${field}Consumed`] : available;
      if (requestedLevel < min || requestedLevel > available || requestedLevel > max) {
        results.push({
          step: candidate, legal: false, ruleId: readyRule.id,
          reason: `requested ${field} level (${requestedLevel}) isn't available — has ${available} banked, allowed range ${min}-${max}`,
        });
        allLegal = false;
        continue;
      }
      readyRule.apply(state, requestedLevel);
      results.push({ step: candidate, legal: true, reason: 'ok', ruleId: readyRule.id, levelUsed: requestedLevel });
      continue;
    }

    readyRule.apply(state);
    results.push({ step: candidate, legal: true, reason: 'ok', ruleId: readyRule.id });
  }

  return { results, allLegal, finalState: state };
}
