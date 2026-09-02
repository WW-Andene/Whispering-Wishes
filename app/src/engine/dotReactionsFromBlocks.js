// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/dotReactionsFromBlocks.js
// ENGINE_MERGE_PLAN.md Phase 2: the TriggerBlock-native replacement for engine/dotReactions.js's
// composition of calcEngine.js's five DOT-reaction functions. Reads each character's real
// `dotApplier`-tagged blocks (triggerBlocks.schema.js's own doc has the full rationale) instead of
// CHAR_BUFF_TABLE's flat `debuffs`/`electroFlare` fields — SAME formulas, SAME constants, ported
// verbatim from calcEngine.js (see ENGINE_MERGE_PLAN.md Phase 1 for each mechanic's exact
// derivation), just a different data source. Tune Break is deliberately NOT ported here yet
// (ENGINE_MERGE_PLAN.md 1.5 — most complex of the five, already has extensive session-added
// mode-exclusivity logic on the legacy path; migrated last, once this simpler four-mechanic pattern
// is proven in real character migrations).
//
// Migration is per-character, not all-or-nothing: a character with a `dotApplier` block is read from
// here; the legacy calcEngine.js functions (dotReactions.js) still separately read CHAR_BUFF_TABLE for
// whoever ISN'T migrated yet. calcTeamStats.js is responsible for not double-counting a migrated
// character on both paths (ENGINE_MERGE_PLAN.md Phase 2's own per-character checklist tracks this).
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DOT_LEVEL_MULT, DOT_BASE_FACTOR,
  FRAZZLE_TICK_INTERVAL, FRAZZLE_ICD_PER_SOURCE, FRAZZLE_STACK_TABLE,
  EROSION_TICK_INTERVAL, EROSION_DURATION, EROSION_STACK_TABLE,
  FUSION_BURST_THRESHOLD, FUSION_TRAIL_MULT,
  FLARE_TICK_INTERVAL, FLARE_STACK_MULT,
} from '../features/teams/calcEngine.js';

function lookupStackMult(table, stacks) {
  const idx = Math.max(0, Math.min(table.length - 1, Math.round(stacks)));
  return table[idx];
}

/** Every dotApplier-tagged block across the whole team, keyed by mechanic. */
function collectAppliers(blocksByOwner, mechanic) {
  const allBlocks = Object.values(blocksByOwner).flat();
  return allBlocks.filter(b => b.dotApplier?.mechanic === mechanic);
}

/**
 * Frazzle — ENGINE_MERGE_PLAN.md 1.1. `maxStacksRaw` sums every applying BLOCK's own `value` (not
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
 * Erosion — ENGINE_MERGE_PLAN.md 1.2. `baseStacks` is the MAX across every applying block's own
 * `value` (not summed — a real, different interaction rule than Frazzle's, preserved exactly).
 */
export function resolveErosionFromBlocks(blocksByOwner, rotTime, defMult, resMult) {
  const appliers = collectAppliers(blocksByOwner, 'erosion');
  if (!appliers.length) return { dmg: 0, active: false };
  const baseStacks = appliers.reduce((s, b) => Math.max(s, b.dotApplier.value || 3), 3);
  const uptime = Math.min(1, EROSION_DURATION / rotTime);
  const ticks = Math.floor(EROSION_DURATION / EROSION_TICK_INTERVAL);
  let total = 0;
  for (let t = 0; t < ticks; t++) total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * lookupStackMult(EROSION_STACK_TABLE, baseStacks);
  return { dmg: total * uptime * defMult * resMult, active: true };
}

/**
 * Fusion Burst — ENGINE_MERGE_PLAN.md 1.3. Pure boolean "does anyone apply it" gate, doesn't scale by
 * applier count or their own value at all (matches calcFusionBurstDmg exactly). `excludeNames` kept
 * for parity with the legacy function's own 2026-09-02 addition (Aemeath's mode-exclusivity fix).
 */
export function resolveFusionBurstFromBlocks(blocksByOwner, rotTime, defMult, resMult, excludeNames = []) {
  const appliers = collectAppliers(blocksByOwner, 'fusionBurst').filter(b => !excludeNames.includes(b.source));
  if (!appliers.length) return { dmg: 0, active: false };
  const explosions = Math.max(1, Math.floor(rotTime / Math.max(FUSION_BURST_THRESHOLD, 8)));
  const dmg = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (FUSION_BURST_THRESHOLD * 0.5) * FUSION_TRAIL_MULT;
  return { dmg: dmg * explosions * defMult * resMult, active: true };
}

/**
 * Electro Flare — ENGINE_MERGE_PLAN.md 1.4. Same boolean gate as Fusion Burst; the starting stack
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
