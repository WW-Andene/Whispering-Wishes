// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dps/resolveRawStatScore.js
// [RESOLVER · DPS] Raw stat score: base character stats + real equipment (weapon
// refinement, echoes, echo sets) + Resonance Chain, folded with ONLY unconditional
// passive TriggerBlock effects (trigger.type === 'passive') — deliberately excludes
// every rotation/time-derived contribution: no simulated casts, no windowed/
// resource-threshold/swap-in/swap-out/ally-action/on-hit buffs, no per-hit
// composition, no uptime. Per direct user request (2026-09-10): "every raw value
// and unconditional buff. no timed and rotation induce." Not a DPS number — it has
// no time dimension at all, which is why it's displayed as its own figure above
// Team DPS rather than folded into it.
//
// An effect with `scopedToBlockId` (e.g. Aemeath's chain.s2, "+100% DMG Mult to
// Seraphic Duet: Overture specifically") is skipped here on purpose: it only means
// something applied to ONE specific hit, and this projection has no specific hit to
// apply it to — folding it in generally would overstate a move-specific bonus as
// kit-wide. A real, documented simplification, not a silently dropped value.
// ═══════════════════════════════════════════════════════════════════════════════

import { createStats, applyBuff } from '../../../features/teams/calcEngine.js';
import { projectMainDpsStatPanel } from '../projection/statPanelProjection.js';
import { gateBlocksBySequence, filterExclusiveModeBlocks } from '../gating/sequenceGating.js';

/**
 * @param {import('../../schema/block.schema.js').TriggerBlock[]} blocks  BLOCKS_BY_CHARACTER[name].
 * @param {object} gearDelta  calcTeamStats()'s own gear-only stat delta for this member (weapon
 *   refinement + echoes + echo set bonuses + team-element bonus — no chain, no rotation).
 * @param {number|null} [sequence]  Owned Resonance Chain sequence (0-6), or null/undefined to not gate.
 * @param {string|null} [forcedStance]  The real manual Resonance Mode toggle, if this character has one.
 * @param {{baseStat:number, dmgFocus?:string[]}} member
 * @param {{enemyDef90:number, baseRes:number}} enemyContext
 * @returns {{effAtk:number, avgCrit:number, dmgBonus:number, defMult:number, resMult:number, score:number}}
 */
export function resolveRawStatScore(blocks, gearDelta, sequence, forcedStance, member, enemyContext) {
  const stats = createStats();
  for (const k in gearDelta) {
    if (typeof gearDelta[k] === 'number') stats[k] = (stats[k] || 0) + gearDelta[k];
  }

  const eligible = filterExclusiveModeBlocks(gateBlocksBySequence(blocks || [], sequence), forcedStance);
  for (const block of eligible) {
    if (block.trigger?.type !== 'passive') continue;
    for (const effect of block.effects || []) {
      if (effect.scopedToBlockId) continue; // move-specific — see file header
      if (effect.stat === 'totalMult') continue; // no per-hit total for this to multiply
      applyBuff(stats, effect.stat, effect.value, {});
    }
  }

  const panel = projectMainDpsStatPanel(stats, member, enemyContext, member.dmgFocus || []);
  return { effAtk: panel.effAtk, avgCrit: panel.avgCrit, dmgBonus: panel.dmgBonus, defMult: panel.defMult, resMult: panel.resMult, score: panel.score };
}
