// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dot/dotReactionsFromBlocks.js
// [RESOLVER · DOT] The TriggerBlock-native replacement for dotReactions.js's per-character-table lookups.
// the engine-merge history (git log) Phase 2: the TriggerBlock-native replacement for engine/dot/dotReactions.js's
// composition of calcEngine.js's five DOT-reaction functions. Reads each character's real
// `dotApplier`-tagged blocks (triggerBlocks.schema.js's own doc has the full rationale) instead of
// CHAR_BUFF_TABLE's flat `debuffs`/`electroFlare` fields — SAME formulas, SAME constants, ported
// verbatim from calcEngine.js (see the engine-merge history (git log) Phase 1 for each mechanic's exact
// derivation), just a different data source. Tune Break is deliberately NOT ported here yet
// (the engine-merge history (git log) 1.5 — most complex of the five, already has extensive session-added
// mode-exclusivity logic on the legacy path; migrated last, once this simpler four-mechanic pattern
// is proven in real character migrations).
//
// Migration is per-character, not all-or-nothing: a character with a `dotApplier` block is read from
// here; the legacy calcEngine.js functions (dotReactions.js) still separately read CHAR_BUFF_TABLE for
// whoever ISN'T migrated yet. calcTeamStats.js is responsible for not double-counting a migrated
// character on both paths (the engine-merge history (git log) Phase 2's own per-character checklist tracks this).
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DOT_LEVEL_MULT, DOT_BASE_FACTOR,
  FRAZZLE_TICK_INTERVAL, FRAZZLE_ICD_PER_SOURCE, FRAZZLE_STACK_TABLE,
  EROSION_TICK_INTERVAL, EROSION_DURATION, EROSION_STACK_TABLE,
  FUSION_BURST_THRESHOLD, FUSION_TRAIL_MULT,
  FLARE_TICK_INTERVAL, FLARE_STACK_MULT,
} from './dotFormulas.js';
import { winningStanceForOwner } from '../gating/sequenceGating.js';
import { resolveFusionBurstDetonations } from './resolveFusionBurstStacks.js';

function lookupStackMult(table, stacks) {
  const idx = Math.max(0, Math.min(table.length - 1, Math.round(stacks)));
  return table[idx];
}

/**
 * Every dotApplier-tagged block across the whole team, keyed by mechanic — filtered by mode where the
 * block declares one. `dotApplier.requiresStance` (added alongside Denia/Aemeath's migration, same
 * shape/rationale as `appliesTags`'s own `{tag, requiresStance}` — see triggerBlocks.schema.js) only
 * counts the block when the owner's resolved mode matches the exact stance text. By default that
 * resolution is `winningStanceForOwner()` (the SAME resolution this session already built and tested
 * for Denia/Aemeath's Tune Break exclusivity) — but `stanceOverrides` (keyed by owner name) takes
 * priority when a caller passes one, needed by calcTeamStats.js's own combinatorial resolver: THAT
 * resolver enumerates hypothetical stances per candidate ("what if Denia picked Strain instead") to
 * find the real global optimum, which is a fundamentally different question than "what does this one
 * owner's own blocks resolve to in isolation" — reusing `winningStanceForOwner`'s single fixed answer
 * inside a search that's supposed to be TESTING alternatives would make every hypothesis collapse to
 * the same one answer, defeating the search. A block with no `requiresStance` counts unconditionally
 * regardless of any override (Buling's Electro Flare shape).
 */
function collectAppliers(blocksByOwner, mechanic, stanceOverrides = null) {
  const allBlocks = Object.values(blocksByOwner).flat();
  const stanceCache = new Map();
  const ownerStance = (owner) => {
    if (stanceOverrides && Object.prototype.hasOwnProperty.call(stanceOverrides, owner)) return stanceOverrides[owner];
    if (!stanceCache.has(owner)) stanceCache.set(owner, winningStanceForOwner(allBlocks, owner));
    return stanceCache.get(owner);
  };
  return allBlocks.filter(b => {
    if (b.dotApplier?.mechanic !== mechanic) return false;
    const stance = b.dotApplier.requiresStance;
    return stance == null || ownerStance(b.source) === stance;
  });
}

/**
 * Frazzle — the engine-merge history (git log) 1.1. `maxStacksRaw` sums every applying BLOCK's own `value` (not
 * just one per character — Rover: Spectro's Forte (2) and Liberation (6) are two real, separate
 * application points, more precise than the legacy table's single pre-summed 8). `numSources` counts
 * unique OWNERS (matches calcFrazzleDmg's own `appliers.length`, an ICD-per-character divisor, not
 * per-application-point).
 */
export function resolveFrazzleFromBlocks(blocksByOwner, rotTime, defMult, resMult, hasPhoebe) {
  const appliers = collectAppliers(blocksByOwner, 'frazzle');
  if (!appliers.length) return { dmg: 0, active: false };
  const numSources = new Set(appliers.map(b => b.source)).size;
  const effectiveRate = numSources / FRAZZLE_ICD_PER_SOURCE;
  const maxStacksRaw = appliers.reduce((s, b) => s + (b.dotApplier.value || 10), 0);
  const stacks = Math.min(maxStacksRaw, Math.floor(effectiveRate * rotTime));
  const numTicks = Math.min(Math.floor(rotTime / FRAZZLE_TICK_INTERVAL), stacks);
  let total = 0;
  for (let s = stacks; s > stacks - numTicks && s > 0; s--) {
    total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * lookupStackMult(FRAZZLE_STACK_TABLE, s);
  }
  return { dmg: total * (hasPhoebe ? 2.0 : 1.0) * defMult * resMult, active: true };
}

/**
 * Erosion — the engine-merge history (git log) 1.2. `baseStacks` is the MAX across every applying block's own
 * `value` (not summed — a real, different interaction rule than Frazzle's, preserved exactly).
 *
 * `dotApplier.requiresTeammate`/`valueWithTeammate` (added 2026-09-06, closing the Cartethyia gap
 * dotReactions.js's own comment used to document): when an applying block names a
 * `requiresTeammate`, its contribution is `valueWithTeammate` instead of `value` whenever that
 * teammate is present anywhere in `blocksByOwner` (the real, engine-derived team roster — only
 * populated for a fully-converted team, see calcTeamStats.js's `allMembersConverted` gate), and
 * `value` (the base case) otherwise. Both are real, sourced numbers (characters.js's own "6 stacks
 * with Rover (3 base)") — never a computed ×2 assumption.
 */
export function resolveErosionFromBlocks(blocksByOwner, rotTime, defMult, resMult) {
  const appliers = collectAppliers(blocksByOwner, 'erosion');
  if (!appliers.length) return { dmg: 0, active: false };
  const baseStacks = appliers.reduce((s, b) => {
    const { requiresTeammate, value, valueWithTeammate } = b.dotApplier;
    const hasTeammate = requiresTeammate && Object.prototype.hasOwnProperty.call(blocksByOwner, requiresTeammate);
    const applierValue = (hasTeammate && valueWithTeammate != null) ? valueWithTeammate : (value || 3);
    return Math.max(s, applierValue);
  }, 3);
  const uptime = Math.min(1, EROSION_DURATION / rotTime);
  const ticks = Math.floor(EROSION_DURATION / EROSION_TICK_INTERVAL);
  let total = 0;
  for (let t = 0; t < ticks; t++) total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * lookupStackMult(EROSION_STACK_TABLE, baseStacks);
  return { dmg: total * uptime * defMult * resMult, active: true };
}

/**
 * Fusion Burst — the engine-merge history (git log) 1.3. `excludeNames` kept for parity with the
 * legacy function's own 2026-09-02 addition (Aemeath's mode-exclusivity fix).
 *
 * `explosions` (real, 2026-09-06 — see resolveFusionBurstStacks.js's own header for the full
 * mechanic/sourcing): when `rotationsByOwner` is supplied, this is the real detonation count/rate
 * derived from each real dotApplier's own sourced stack value (Aemeath +1/hit, Denia +1 or +2
 * depending on move) crossing the real threshold (10 generically, 5 once Aemeath's own kit override
 * applies) plus her own Duet-forced detonations — replacing the old flat "explosions =
 * floor(rotTime/10)" guess. Falls back to that old heuristic when rotationsByOwner isn't supplied
 * (every existing caller without the new param behaves byte-identically to before).
 */
export function resolveFusionBurstFromBlocks(blocksByOwner, rotTime, defMult, resMult, excludeNames = [], stanceOverrides = null, rotationsByOwner = null) {
  const appliers = collectAppliers(blocksByOwner, 'fusionBurst', stanceOverrides).filter(b => !excludeNames.includes(b.source));
  if (!appliers.length) return { dmg: 0, active: false };
  const explosions = rotationsByOwner
    ? resolveFusionBurstDetonations(blocksByOwner, rotationsByOwner, stanceOverrides).totalDetonations
    : Math.max(1, Math.floor(rotTime / Math.max(FUSION_BURST_THRESHOLD, 8)));
  const dmg = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (FUSION_BURST_THRESHOLD * 0.5) * FUSION_TRAIL_MULT;
  return { dmg: dmg * explosions * defMult * resMult, active: true };
}

/**
 * Electro Flare — the engine-merge history (git log) 1.4. Same boolean gate as Fusion Burst; the starting stack
 * seed (10) and halving-on-tick are both unsourced/wiki-approximated per calcElectroFlareDmg's own
 * comment, ported verbatim rather than "fixed" without a real source.
 */
export function resolveElectroFlareFromBlocks(blocksByOwner, rotTime, defMult, resMult) {
  const appliers = collectAppliers(blocksByOwner, 'electroFlare');
  if (!appliers.length) return { dmg: 0, active: false };
  const ticks = Math.min(4, Math.floor(rotTime / FLARE_TICK_INTERVAL));
  let total = 0, stacks = 10;
  for (let t = 0; t < ticks; t++) {
    total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (stacks * FLARE_STACK_MULT);
    stacks = Math.ceil(stacks / 2);
  }
  return { dmg: total * defMult * resMult, active: true };
}
