// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/teams/engineMainDpsStatPanel.js
// [TEAM-LAYER · ENGINE-STAT-PANEL] Layer 5 of the engine rewrite: second extraction
// from calcTeamStats.js's monolithic body (CALC_TEAM_STATS_DEPENDENCY_MAP.md
// section 10, "FULL tier — stat-panel engine override"). Byte-identical logic,
// moved verbatim into a named, independently-callable function returning an
// explicit values object instead of reassigning calcTeamStats()'s local
// atkPct/cr/cd/.../effAtk/avgCrit/.../score variables in place.
//
// Only ever called for a fully block-converted team with a real engineChosenOrder
// — the caller is responsible for that gate, same as before this extraction.
// ═══════════════════════════════════════════════════════════════════════════════

import { resolveSimulatedTeamRotation } from '../../engine/resolver/dps/resolveSimulatedTeamRotation.js';
import { projectMainDpsStatPanel } from '../../engine/resolver/projection/statPanelProjection.js';

const EXTERNAL_STAT_KEYS = ['atkPct', 'cr', 'cd', 'elemDmg', 'skillDmg', 'basicDmg', 'heavyDmg', 'libDmg', 'echoDmg', 'coordDmg', 'deepen', 'amplify', 'defShred', 'resShred', 'defIgnore'];

/**
 * [LOGIC · ENGINE-MAIN-DPS-STAT-PANEL] The main DPS's real, engine-composed time-averaged received
 * stats (buff windows overlapping their own real on-field segment, from the same engineChosenOrder
 * used everywhere else), folded with their own gear delta and projected into the one-number-per-stat
 * summary panel (effAtk/avgCrit/dmgBonus/defMult/resMult/score).
 *
 * @param {object} engineChosenOrder  { ownedSteps, blocksByOwner, order }.
 * @param {object} mainDps  calcTeamStats' own mainDps member record.
 * @param {object[]} mems  Team member records (for sequenceByOwner).
 * @param {object} gearDeltaByName  Per-member gear-only stat delta, from the RAW tier.
 * @param {number} enemyDef90
 * @param {number} mainBaseRes  getEnemyRes(mainDps.d.element).
 * @returns {{atkPct:number, cr:number, cd:number, elemDmg:number, skillDmg:number, amplify:number,
 *   deepen:number, defShred:number, resShred:number, defIgnore:number, effAtk:number, avgCrit:number,
 *   dmgBonus:number, defMult:number, resMult:number, score:number}}
 */
export function computeEngineMainDpsStatPanel(engineChosenOrder, mainDps, mems, gearDeltaByName, enemyDef90, mainBaseRes) {
  const { ownedSteps, blocksByOwner } = engineChosenOrder;
  const { stats: mainReceived, totalMultBonus: mainTotalMultBonus } = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, mainDps.name, {
    targetElementLower: (mainDps.d.element || '').toLowerCase(),
    targetRole: mainDps.d.role,
    sequenceByOwner: Object.fromEntries(mems.map(m => [m.name, m.seqLevel])),
  });
  const mainGearDelta = gearDeltaByName[mainDps.name] || {};
  const finalStats = { ...mainReceived };
  for (const k of EXTERNAL_STAT_KEYS) { if (mainGearDelta[k]) finalStats[k] = (finalStats[k] || 0) + mainGearDelta[k]; }

  // `mainTotalMultBonus` (fixed 2026-09-02, the engine-merge history (git log) totalMult architecture-bug fix):
  // resolveSimulatedTeamRotation() already computed this real accumulator — applied the same way
  // legacy's own `seqTotalMultBonus` is applied to `mult` in the legacy branch: a separate
  // multiplicative factor.
  const panel = projectMainDpsStatPanel(finalStats, mainDps, { enemyDef90, baseRes: mainBaseRes }, mainDps.d.dmgFocus || [], mainTotalMultBonus);

  return {
    atkPct: finalStats.atkPct, cr: finalStats.cr, cd: finalStats.cd, elemDmg: finalStats.elemDmg,
    skillDmg: finalStats.skillDmg, amplify: finalStats.amplify, deepen: finalStats.deepen,
    defShred: finalStats.defShred, resShred: finalStats.resShred, defIgnore: finalStats.defIgnore,
    effAtk: panel.effAtk, avgCrit: panel.avgCrit, dmgBonus: panel.dmgBonus,
    defMult: panel.defMult, resMult: panel.resMult, score: panel.score,
  };
}
