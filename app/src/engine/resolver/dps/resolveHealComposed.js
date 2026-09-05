// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dps/resolveHealComposed.js
// [RESOLVER · DPS] Real per-cast heal totals over a modeled rotation — the healing
// equivalent of resolveHitComposedDps.js, added 2026-09-05 (engine-readiness pass)
// so `kind: 'heal'` — declared in BLOCK_KINDS since Layer 1, never implemented
// anywhere (Youhu's own block file flagged this directly) — is no longer inert.
//
// Deliberately simpler than resolveHitComposedDps: healing in this game is not
// defended against (no enemy DEF/RES/Crit chain), so there is no per-hit
// stats-at-instant walk here. healBonusPct/hpPct/atkPct/defPct are taken from
// resolveSimulatedRotation()'s own time-averaged `stats` — reusing its existing
// buff-window/passive resolution rather than re-deriving it, at the cost of not
// re-evaluating those stats per individual heal instant the way damage does. Real
// for the common case (a kit-wide healBonusPct passive, not a per-hit-scoped one);
// documented here rather than silently assumed identical to the damage resolver.
// ═══════════════════════════════════════════════════════════════════════════════

import { simulateRotation } from './rotationSimulator.js';
import { resolveSimulatedRotation } from './resolveSimulatedRotation.js';
import { triggerFired, conditionHolds } from '../gating/triggerEngine.js';

/**
 * @param {import('../../schema/block.schema.js').TriggerBlock[]} blocks
 * @param {Object[]} steps  Same shape simulateRotation()/resolveSimulatedRotation() take.
 * @param {{hp?: number, atk?: number, def?: number}} baseStats  Only the basis this character's
 *   heal(s) actually use needs to be present — same "throw if missing" discipline as
 *   resolveHitComposedDps's own baseStats.
 * @param {Object} [opts]
 * @param {string} [opts.targetElementLower]
 * @param {string} [opts.targetRole]
 * @returns {{ totalHealing: number, totalTime: number, healLog: {time: number, blockId: string, healing: number}[] }}
 */
export function resolveHealComposed(blocks, steps, baseStats, opts = {}) {
  const { targetElementLower = null, targetRole = null } = opts;
  const results = simulateRotation(blocks, steps);
  const totalTime = results.length ? results[results.length - 1].time : 0;

  // Time-averaged healBonusPct/hpPct/atkPct/defPct across the whole modeled rotation — see file
  // header for why this reuses resolveSimulatedRotation() rather than a per-instant walk.
  const { stats } = resolveSimulatedRotation(blocks, steps, { targetElementLower, targetRole });

  const healBlocks = blocks.filter(b => b.kind === 'heal' && b.heal?.hits?.length);
  const healLog = [];
  let totalHealing = 0;

  for (const r of results) {
    for (const hb of healBlocks) {
      if (r.ineligibleBlockIds.has(hb.id)) continue;
      if (!triggerFired(hb.trigger, r.firedTriggers)) continue;
      if (!conditionHolds(hb.condition, targetElementLower, targetRole)) continue;

      const basis = hb.heal.basis;
      const baseStatKey = basis === 'HP' ? 'hp' : basis === 'DEF' ? 'def' : basis === 'ATK' ? 'atk' : null;
      if (baseStatKey && baseStats[baseStatKey] == null) {
        throw new Error(`resolveHealComposed: block '${hb.id}' needs baseStats.${baseStatKey} (heal.basis: '${basis}'), but it wasn't provided.`);
      }
      const scalingPct = basis === 'ATK' ? stats.atkPct : basis === 'HP' ? stats.hpPct : basis === 'DEF' ? stats.defPct : 0;
      const effBase = baseStatKey ? baseStats[baseStatKey] * (1 + scalingPct / 100) : 0;

      let healing = 0;
      for (const hit of hb.heal.hits) {
        const base = basis === 'flat' ? (hit.flat || 0) : (effBase * (hit.pct / 100) + (hit.flat || 0));
        healing += base * (1 + stats.healBonusPct / 100);
      }
      totalHealing += healing;
      healLog.push({ time: r.time, blockId: hb.id, healing });
    }
  }

  return { totalHealing, totalTime, healLog };
}
