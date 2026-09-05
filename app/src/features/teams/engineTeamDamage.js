// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/teams/engineTeamDamage.js
// [TEAM-LAYER · ENGINE-DAMAGE] Layer 5 of the engine rewrite: the first extraction
// from calcTeamStats.js's monolithic body (see CALC_TEAM_STATS_DEPENDENCY_MAP.md
// section 13, "Engine-composed damage override"). Byte-identical logic, moved
// verbatim into a named, independently-callable function with an explicit
// return value instead of mutating calcTeamStats()'s local totalRotDmg/
// memberDmgArr in place.
//
// Only ever called for a fully block-converted team (every member has a real
// BLOCKS_BY_CHARACTER entry + CHARACTER_ROTATIONS) — the caller is responsible
// for that gate, same as before this extraction.
// ═══════════════════════════════════════════════════════════════════════════════

import { resolveHitComposedTeamDps } from '../../engine/resolver/dps/resolveHitComposedTeamDps.js';

/**
 * [LOGIC · ENGINE-COMPOSED-TEAM-DAMAGE] Real per-hit team damage for every member, via the
 * TriggerBlock engine, replacing the legacy flat totalMult%-based per-member loop.
 *
 * @param {object} chosenOrder  engineChosenOrder — { ownedSteps, blocksByOwner, order }.
 * @param {object[]} mems  Team member records (calcTeamStats' own `mems` shape).
 * @param {string} mainDpsName
 * @param {object} energyCycleFactors  Per-member { libUptime, totalER } from calcEnergyCycles.
 * @param {object} gearDeltaByName  Per-member gear-only stat delta, from the RAW tier.
 * @param {number} enemyDef90
 * @param {(element: string) => number} getEnemyRes
 * @param {number} rotTime
 * @returns {{ totalRotDmg: number, memberDmgArr: {name: string, dmg: number}[] }}
 */
export function computeEngineComposedTeamDamage(chosenOrder, mems, mainDpsName, energyCycleFactors, gearDeltaByName, enemyDef90, getEnemyRes, rotTime) {
  if (!chosenOrder) return null;
  const { ownedSteps, blocksByOwner } = chosenOrder;
  let totalRotDmg = 0;
  const memberDmgArr = [];
  mems.forEach(m => {
    if ((m.d.totalMult || 0) === 0) { memberDmgArr.push({ name: m.name, dmg: 0 }); return; }
    const focus = m.d.dmgFocus || [];
    const isOffFieldCoord = m.name !== mainDpsName && focus.includes('Coordinated ATK') && focus.length <= 2;
    const ecf = energyCycleFactors[m.name];
    const baseStats = { atk: m.totalBaseAtk, hp: m.d.baseHp || 0, def: m.d.baseDef || 0 };
    const enemyContext = { enemyDef: enemyDef90, enemyRes: getEnemyRes(m.d.element) };
    const { dps: memberEngineDps } = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, m.name, enemyContext, baseStats, {
      targetElementLower: (m.d.element || '').toLowerCase(),
      targetRole: m.d.role,
      libUptime: ecf ? ecf.libUptime : null,
      coordSnapshotDiscount: isOffFieldCoord,
      cooldownSteadyState: true,
      externalStats: gearDeltaByName[m.name],
    });
    const dmg = memberEngineDps * rotTime;
    totalRotDmg += dmg;
    memberDmgArr.push({ name: m.name, dmg });
  });
  return { totalRotDmg, memberDmgArr };
}
