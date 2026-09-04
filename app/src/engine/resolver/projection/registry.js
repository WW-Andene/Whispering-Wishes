// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/projection/registry.js
// [RESOLVER · PROJECTION] Registrable-projection mechanism.
// A small registrable-projection mechanism (ENGINE_ARCHITECTURE_PROPOSAL.md v2 §6):
// each projection turns composed engine output into one specific UI surface's shape.
// `projectMainDpsStatPanel` registers itself under 'mainDpsStatPanel' below; a future
// comparison view or build-planner view adds its own projection function and registers
// it under its own name, without touching calcTeamStats.js or any existing projection.
//
// Deliberately ~10 lines, not a plugin framework — additive infrastructure per Phase 0
// (§7 step 4). calcTeamStats.js is NOT required to call through this registry in this
// pass; it may keep calling projectMainDpsStatPanel directly (simpler, one call site).
// This registry exists so a *second* projection has a real, enforced home to register
// into later, instead of inventing its own one-off convention.
// ═══════════════════════════════════════════════════════════════════════════════

import { projectMainDpsStatPanel } from './statPanelProjection.js';

const projections = new Map();

export function registerProjection(name, fn) {
  projections.set(name, fn);
}

// Variadic on purpose: a projection's real argument shape is its own business (e.g.
// projectMainDpsStatPanel takes 5 positional args, not a fixed (composedResult, context) pair) —
// the registry's only job is name -> function lookup, not standardizing call signatures.
export function project(name, ...args) {
  const fn = projections.get(name);
  if (!fn) throw new Error(`Unknown projection: ${name}`);
  return fn(...args);
}

registerProjection('mainDpsStatPanel', projectMainDpsStatPanel);
