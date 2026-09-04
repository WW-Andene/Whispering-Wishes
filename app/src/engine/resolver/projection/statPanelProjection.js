// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/projection/statPanelProjection.js
// [RESOLVER · PROJECTION] Main-DPS stat-panel projection.
// The main-DPS stat-panel projection: turns a fully-converted team's real, per-block
// time-averaged received stats (resolveSimulatedTeamRotation's output, gear-adjusted)
// into the decomposed display numbers the Team tab's stat panel shows —
// effAtk × avgCrit × dmgBonus × defMult × resMult = score.
//
// This is `calcTeamStats.js`'s former inline main-DPS stat-panel block (previously at
// ~line 1074-1103, wrapped around a direct `routeTypeBonuses` call), extracted here per
// ENGINE_ARCHITECTURE_PROPOSAL.md v2 §5 as a faithful, testably-equivalent relocation —
// NOT a redesign. See that section for the full explanation of why v1's original design
// (summing realized per-category damage) would have been wrong, and why the
// dpsFocus-gated collapse this function performs (via collapseDmgTypeBuckets) is the
// actual correct behavior, not a legacy artifact.
//
// Verification requirement per §5: phase3-parityGolden.test.js snapshots this function's
// output (effAtk/avgCrit/dmgBonus/defMult/resMult/score) per character and asserts
// byte-identical values before/after this extraction — any diff there is a bug in the
// extraction, not an intentional improvement.
// ═══════════════════════════════════════════════════════════════════════════════

import { calcAvgCrit, calcDmgBonus, calcDefMult, calcResMult } from '../../math/damageFormula.js';
import { collapseDmgTypeBuckets } from '../../math/moveTypeRouting.js';

/**
 * @param {object} finalStats - resolveSimulatedTeamRotation's real received-stats output for the
 *   main DPS, already merged with their own gear delta (calcTeamStats.js's EXTERNAL_STAT_KEYS
 *   merge) — mutated in place by the dpsFocus collapse, matching the original inline behavior.
 * @param {{ baseStat: number }} mainDpsMember - the main DPS's own baseStat (ATK/HP/DEF per their
 *   scaling), used for effAtk.
 * @param {{ enemyDef90: number, baseRes: number }} enemyContext - enemyDef90 is the enemy's DEF at
 *   level 90 for defMult; baseRes is the enemy's RES to the main DPS's own element for resMult.
 * @param {string[]} dpsFocus - the main DPS's kit-declared move-type focus (mainDps.d.dmgFocus).
 * @param {number} [totalMultBonus] - resolveSimulatedTeamRotation's own totalMult accumulator
 *   (stat:'totalMult' TriggerBlocks), applied as a separate multiplicative factor on score, same as
 *   the original inline code.
 * @returns {{ effAtk: number, avgCrit: number, dmgBonus: number, defMult: number, resMult: number,
 *   score: number, stats: object }} `stats` is the same (now-collapsed) object passed in, returned
 *   so the caller can destructure the individual fields it still tracks separately (atkPct/cr/cd/
 *   elemDmg/skillDmg/amplify/deepen/defShred/resShred/defIgnore) exactly as before.
 */
export function projectMainDpsStatPanel(finalStats, mainDpsMember, enemyContext, dpsFocus, totalMultBonus = 0) {
  collapseDmgTypeBuckets(finalStats, dpsFocus);

  const effAtk = Math.round(mainDpsMember.baseStat * (1 + finalStats.atkPct / 100));
  const avgCrit = calcAvgCrit(finalStats.cr, finalStats.cd);
  const dmgBonus = calcDmgBonus(finalStats.elemDmg, finalStats.skillDmg, finalStats.amplify, finalStats.deepen);
  const defMult = calcDefMult(enemyContext.enemyDef90, finalStats.defShred, finalStats.defIgnore);
  const resMult = calcResMult(enemyContext.baseRes, finalStats.resShred);
  const score = Math.round(effAtk * avgCrit * dmgBonus * defMult * resMult * (1 + (totalMultBonus || 0) / 100));

  return { effAtk, avgCrit, dmgBonus, defMult, resMult, score, stats: finalStats };
}
