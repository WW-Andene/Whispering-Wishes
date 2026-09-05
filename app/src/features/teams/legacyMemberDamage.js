// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/teams/legacyMemberDamage.js
// [TEAM-LAYER · LEGACY-FALLBACK] Layer 5 of the engine rewrite: third extraction
// from calcTeamStats.js's monolithic body (CALC_TEAM_STATS_DEPENDENCY_MAP.md
// section 12, "Legacy per-member damage loop"). Byte-identical logic, moved
// verbatim into a named, independently-callable function.
//
// This is the flat totalMult%-plus-hand-written-buff-routing computation —
// calcTeamStats()'s only remaining caller of it today is a team containing
// Jingran (unreleased, no converted TriggerBlocks file yet). Every fully
// block-converted team has its totalRotDmg/memberDmgArr output UNCONDITIONALLY
// overridden by computeEngineComposedTeamDamage() (engineTeamDamage.js)
// regardless, so this function should only ever be called behind an
// `!allMembersConverted` gate — computing it for a fully-converted team is
// pure wasted work, same as before this extraction.
// ═══════════════════════════════════════════════════════════════════════════════

import { WEAPON_REFINE_SCALE } from '../../data/constants.js';
import {
  ATTACKER_FACTOR, BASE_CRIT_RATE, BASE_CRIT_DMG,
  createStats, parsePassive, applyFullEchoSet, applyEchoStats,
  calcResMult, applyBuff,
} from './calcEngine.js';
import { CHAR_BUFF_TABLE } from '../../data/characters.js';

/**
 * [LOGIC · LEGACY-MEMBER-DAMAGE] The flat totalMult%-based per-member damage loop —
 * calcTeamStats()'s pre-engine fallback, kept exact/unmodified for a mixed team.
 *
 * @param {object} ctx
 * @param {object} ctx.mainDps
 * @param {object[]} ctx.mems
 * @param {number} ctx.rotTime
 * @param {object} ctx.energyCycleFactors
 * @param {number} ctx.seqTotalMultBonus
 * @param {object} ctx.teamEquipment
 * @param {number} ctx.teamIdx
 * @param {number} ctx.atkPct  Main DPS's own final atkPct from the legacy buff-accumulation tier.
 * @param {number} ctx.avgCrit
 * @param {number} ctx.dmgBonus
 * @param {number} ctx.defMult
 * @param {number} ctx.resMult
 * @param {object} ctx.rotSegByName
 * @param {(seg: object, start: number, duration: number) => number} ctx.overlapUptimeForSeg
 * @param {(ownerName: string) => number} ctx.outroStart
 * @param {(ownerName: string) => number} ctx.blockStart
 * @param {object} ctx.elCounts
 * @param {number} ctx.enemyDef90
 * @param {(element: string) => number} ctx.getEnemyRes
 * @param {(weaponName: string, rawDefIgnore: number) => number} ctx.gateWeaponDefIgnore
 * @param {(b: object, totalER: number|undefined) => number} ctx.resolveBuffValue
 * @returns {{ totalRotDmg: number, memberDmgArr: {name: string, dmg: number}[] }}
 */
export function computeLegacyMemberDamage(ctx) {
  const {
    mainDps, mems, rotTime, energyCycleFactors, seqTotalMultBonus, teamEquipment, teamIdx,
    atkPct, avgCrit, dmgBonus, defMult, resMult, rotSegByName, overlapUptimeForSeg,
    outroStart, blockStart, elCounts, enemyDef90, getEnemyRes, gateWeaponDefIgnore, resolveBuffValue,
  } = ctx;

  let totalRotDmg = 0;
  const memberDmgArr = [];

  const mainOnField = Math.min(mainDps.d.onField || 15, rotTime * 0.8);
  const offFieldTime = Math.max(0, rotTime - mainOnField);
  // Proportional field time allocation based on each sub-DPS's actual needs
  const fullSubDpsMembers = mems.filter(m => m.name !== mainDps.name && (m.d.totalMult || 0) > 0);
  const fullTotalSubNeed = fullSubDpsMembers.reduce((s, m) => s + (m.d.onField || 5), 0) || 1;
  mems.forEach(m => {
    let mult = m.d.totalMult || 0;
    if (mult === 0) { memberDmgArr.push({ name: m.name, dmg: 0 }); return; }
    const mBase = m.baseStat;
    const isMain = m.name === mainDps.name;
    // Apply energy cycle factor: if Liberation can't be cast every rotation, reduce mult
    const ecf = energyCycleFactors[m.name];
    if (ecf && ecf.libUptime < 1) {
      // Liberation typically accounts for 20-40% of totalMult. Reduce that portion by uptime.
      const libShare = (m.d.dmgFocus || []).includes('Liberation') ? 0.35 : 0.2;
      mult = mult * (1 - libShare * (1 - ecf.libUptime));
    }
    if (isMain && seqTotalMultBonus > 0) mult = mult * (1 + seqTotalMultBonus / 100);
    if (!isMain) {
      const subOnField = m.d.onField || 5;
      const allocatedTime = offFieldTime * (subOnField / fullTotalSubNeed);
      const fieldRatio = Math.min(1, allocatedTime / subOnField);
      // Coordinated ATK characters deal off-field damage during main DPS's field time.
      // Their coordinated portion should scale with main DPS uptime, not their own field time.
      const focus = m.d.dmgFocus || [];
      const hasCoord = focus.includes('Coordinated ATK');
      if (hasCoord) {
        // Split damage: coordinated portion (60-80%) scales with DPS uptime, on-field portion scales with field ratio
        const coordShare = focus.length === 1 ? 0.8 : 0.5; // Pure coord chars vs hybrid
        const coordUptime = Math.min(1, mainOnField / rotTime); // Active during DPS field time
        const onFieldShare = 1 - coordShare;
        mult = mult * (coordShare * coordUptime + onFieldShare * fieldRatio);
      } else {
        mult = mult * fieldRatio;
      }
    }
    if (isMain && m.weapon?.pv?.atkSpeed) {
      const mainRefLevel = (teamEquipment[teamIdx + ':' + m.name])?.refinement || 1;
      const mainRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[mainRefLevel - 1] || 1 : 1;
      mult = mult * (1 + (m.weapon.pv.atkSpeed * mainRefScale) / 100);
    }
    if (isMain) {
      const mDmg = mBase * (1 + atkPct / 100) * (mult / 100) * avgCrit * dmgBonus * defMult * resMult;
      totalRotDmg += mDmg;
      memberDmgArr.push({ name: m.name, dmg: mDmg });
    } else {
      const sEqKey = teamIdx + ':' + m.name;
      const sEq = teamEquipment[sEqKey];
      const sEchoes = sEq?.echoes || [];
      const sStatKey = m.scaling === 'HP' ? 'HP%' : m.scaling === 'DEF' ? 'DEF%' : 'ATK%';
      let sAtkPct = 0, sCr = 5, sCd = 150, sElem = 0, sSkillDmg = 0, sDeepen = 0, sAmplify = 0;
      let sBasicDmg = 0, sHeavyDmg = 0, sLibDmg = 0, sEchoDmg = 0, sCoordDmg = 0, sDefIgnore = 0;
      let sDefShred = 0, sResShred = 0;
      const sSeg = rotSegByName[m.name] || null;
      // An unbuilt sub-DPS (no echoes equipped) gets no fabricated "recommended build" stats here —
      // a real player with empty echo slots has zero bonus stats, same as an unequipped Main DPS
      // already correctly shows. A previous version injected a hardcoded preset stat block (e.g.
      // +66% ATK, +22.5% Crit Rate) to preview a "likely" build, but that meant an unbuilt sub-DPS
      // was scored as if near-BiS-geared while an unbuilt Main DPS was scored as bare — inconsistent
      // across roles and not representative of what the player actually has equipped.
      // Coordinated ATK characters snapshot buffs at swap-out time.
      // They benefit from buffs that exist BEFORE they swap out (team-wide Lib buffs,
      // earlier outro buffs), but NOT from outro buffs applied AFTER them in rotation order.
      // On-field sub-DPS characters receive all buffs normally.
      const focus = m.d.dmgFocus || [];
      const isOffField = focus.includes('Coordinated ATK') && focus.length <= 2;
      // Same applyBuff bridge pattern as the main-DPS tier above -- consolidates this sub-DPS's own
      // 4 near-identical chains (outroBuffs/libBuffs/debuffs-from-others/own selfBuffs+debuffs) onto
      // the one shared, gated implementation instead of each carrying its own copy. Note this block
      // deliberately does NOT pass dpsFocus to the outroBuffs applyBuff calls below: unlike the main
      // DPS tier, this sub-DPS path never gated basicDmg/heavyDmg/libDmg/echoDmg/skillDmg by dmgFocus
      // here (they all route into sAmplify unconditionally) -- preserved as-is as a pure dedup, not
      // changed, since that's a separate question from the deepen/allDmg/elemDmg bug this migration
      // targets.
      const subElLower = (m.d.element || '').toLowerCase();
      const sStats = { atkPct: sAtkPct, cr: sCr, cd: sCd, elemDmg: sElem, deepen: sDeepen, amplify: sAmplify, echoDmg: sEchoDmg, defShred: sDefShred, resShred: sResShred, defIgnore: sDefIgnore };
      mems.forEach(other => {
        if (other.name === m.name) return;
        const obt = CHAR_BUFF_TABLE[other.name];
        if (!obt) return;
        (obt.outroBuffs || []).forEach(b => {
          if (b.target === 'next' || b.target === 'enemy' || b.target === 'ally') {
            // Snapshot rule: off-field chars only get outro buffs from characters who swap BEFORE them.
            // In typical rotation, supports swap before sub-DPS. The DPS-adjacent outro buff
            // (the last support before DPS) does NOT reach the off-field sub-DPS who already left.
            // Approximate: off-field chars get 60% effective value from outro buffs (snapshot discount).
            const snapshotFactor = isOffField ? 0.6 : 1.0;
            const uptime = overlapUptimeForSeg(sSeg, outroStart(other.name), b.duration || 14);
            const val = b.value * uptime * snapshotFactor;
            if (b.stat === 'atkPct') {
              sStats.atkPct += m.scaling === 'ATK' ? val : val * 0.25;
            } else if (['allDmg', 'elemDmg', 'basicDmg', 'heavyDmg', 'libDmg', 'echoDmg', 'skillDmg'].includes(b.stat)) {
              // Type-focus gate (dpsFocus) was missing here even though the main-DPS tier enforces it
              // (routeTypeBonuses' own gate, mirrored by applyBuff's TYPE_FOCUS_MAP) -- a real support
              // with a type-specific outro (Iuno's 50% Heavy ATK Amp, Lucy's Basic ATK Amp, Qiuyuan's
              // Echo Amp, etc., 14 characters carry one) applied its full value to ANY sub-DPS
              // regardless of whether that sub-DPS's own dmgFocus includes that attack type at all.
              applyBuff(sStats, b.stat, val, { isAmplify: true, condition: b.condition, dpsFocus: focus, dpsElLower: subElLower, dpsName: m.name });
            } else if (b.stat === 'deepen') {
              applyBuff(sStats, 'deepen', val, { condition: b.condition, dpsElLower: subElLower, dpsName: m.name });
            } else if (b.stat === 'critRate' || b.stat === 'critDmg' || b.stat === 'resShred' || b.stat === 'defShred') {
              applyBuff(sStats, b.stat, val);
            }
          }
        });
        // Sonata set p5 team/next ATK% buffs (see the same fix on the main-tier computation above).
        const oP5v = other.echoSet?.p5val;
        if (oP5v?.teamAtk) {
          const uptime = overlapUptimeForSeg(sSeg, blockStart(other.name), 20);
          const val = oP5v.teamAtk * uptime * (isOffField ? 0.6 : 1.0);
          sStats.atkPct += m.scaling === 'ATK' ? val : val * 0.25;
        }
        if (oP5v?.nextAtk) {
          const uptime = overlapUptimeForSeg(sSeg, outroStart(other.name), 14);
          const val = oP5v.nextAtk * uptime * (isOffField ? 0.6 : 1.0);
          sStats.atkPct += m.scaling === 'ATK' ? val : val * 0.25;
        }
        (obt.libBuffs || []).forEach(b => {
          if (b.target === 'team' || b.target === 'next') {
            const uptime = overlapUptimeForSeg(sSeg, blockStart(other.name), b.duration || 25);
            const val = b.value * uptime;
            if (b.stat === 'atkPct') { sStats.atkPct += m.scaling === 'ATK' ? val : val * 0.25; }
            else if (b.stat === 'allDmg' || b.stat === 'elemDmg') applyBuff(sStats, b.stat, val, { condition: b.condition, dpsElLower: subElLower, dpsName: m.name });
            else if (b.stat === 'critRate' || b.stat === 'critDmg' || b.stat === 'echoDmg') applyBuff(sStats, b.stat, val);
          }
        });
        (obt.debuffs || []).forEach(db => {
          if (db.stat === 'havocBane') { sStats.defShred += db.value * 2; return; }
          applyBuff(sStats, db.stat, db.value, { condition: db.condition, dpsElLower: subElLower, dpsName: m.name });
        });
      });
      const mbt = CHAR_BUFF_TABLE[m.name];
      if (mbt) {
        const subTotalER = energyCycleFactors?.[m.name]?.totalER;
        (mbt.selfBuffs || []).forEach(b => {
          const val = resolveBuffValue(b, subTotalER);
          // Own kit's self-target buffs — no target-matching gate needed, same as the main tier.
          if (['atkPct', 'elemDmg', 'critRate', 'critDmg', 'defIgnore', 'deepen', 'echoDmg'].includes(b.stat)) applyBuff(sStats, b.stat, val);
        });
        (mbt.debuffs || []).forEach(db => {
          applyBuff(sStats, db.stat, db.value, { condition: db.condition, dpsElLower: subElLower, dpsName: m.name });
        });
      }
      ({ atkPct: sAtkPct, cr: sCr, cd: sCd, elemDmg: sElem, deepen: sDeepen, amplify: sAmplify, echoDmg: sEchoDmg, defShred: sDefShred, resShred: sResShred, defIgnore: sDefIgnore } = sStats);
      if (m.weapon) {
        const subRefLevel = sEq?.refinement || 1;
        const subRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[subRefLevel - 1] || 1 : 1;
        const subRawPv = m.weapon.pv || parsePassive(m.weapon.passive, m.d.element);
        const swp = Object.fromEntries(Object.entries(subRawPv).map(([k, v]) => [k, typeof v === 'number' ? v * subRefScale : v]));
        if (m.scaling === 'ATK') sAtkPct += (swp.atkPct || 0);
        else if (m.scaling === 'HP') sAtkPct += (swp.hpPct || 0);
        else if (m.scaling === 'DEF') sAtkPct += (swp.defPct || 0);
        sElem += (swp.elemDmg || 0); sSkillDmg += (swp.skillDmg || 0);
        sCr += (swp.critRate || 0); sCd += (swp.critDmg || 0);
        sBasicDmg += (swp.basicDmg || 0); sHeavyDmg += (swp.heavyDmg || 0);
        sLibDmg += (swp.libDmg || 0); sEchoDmg += (swp.echoDmg || 0);
        sCoordDmg += (swp.coordDmg || 0);
        sDefIgnore += gateWeaponDefIgnore(m.weapName, swp.defIgnore || 0); sResShred += (swp.resShred || 0);
      }
      // Apply sub-DPS echo set + echo stats (using shared utility)
      {
        const subSetStats = createStats();
        applyFullEchoSet(subSetStats, m.echoSet, m.echoSet2, m.d.element, m.scaling);
        applyEchoStats(subSetStats, sEchoes, m.d.element, m.scaling, { atk: m.totalBaseAtk, hp: m.d.baseHp, def: m.d.baseDef });
        // Sonata set p5 team ATK% (Rejuvenating Glow/Halo of Starry Radiance) applies to the wearer
        // too, not just teammates — applyFullEchoSet doesn't know this key (see calcEngine.js), and
        // the cross-member loop above explicitly skips self, so it must be added here.
        if (m.echoSet?.p5val?.teamAtk) sAtkPct += m.scaling === 'ATK' ? m.echoSet.p5val.teamAtk : m.echoSet.p5val.teamAtk * 0.25;
        sAtkPct += subSetStats.atkPct; sCr += subSetStats.cr - BASE_CRIT_RATE; sCd += subSetStats.cd - BASE_CRIT_DMG;
        sElem += subSetStats.elemDmg; sSkillDmg += subSetStats.skillDmg;
        sBasicDmg += subSetStats.basicDmg; sHeavyDmg += subSetStats.heavyDmg;
        sLibDmg += subSetStats.libDmg; sEchoDmg += subSetStats.echoDmg;
      }
      if (m.d.element && elCounts[m.d.element] >= 2) sElem += 10;
      if (m.weapSubstat === 'Crit Rate') sCr += parseFloat(m.weapSubVal) || 0;
      if (m.weapSubstat === 'Crit DMG') sCd += parseFloat(m.weapSubVal) || 0;
      if (m.weapSubstat === sStatKey) sAtkPct += parseFloat(m.weapSubVal) || 0;
      const sEffAtk = mBase * (1 + sAtkPct / 100);
      const sAvgCrit = 1 + (Math.min(sCr, 100) / 100) * (sCd / 100 - 1);
      const sFocus = m.d.dmgFocus || [];
      // Same dmgFocus gate as the main DPS fix above (routeTypeBonuses) — a sub-DPS without
      // 'Skill' in their own focus shouldn't get full credit for a literal Resonance Skill DMG%
      // contribution (weapon passive, echo set) as if it always applies to their damage.
      let sTypeDmg = sFocus.includes('Skill') ? sSkillDmg : 0;
      if (sFocus.includes('Basic ATK')) sTypeDmg += sBasicDmg;
      if (sFocus.includes('Heavy ATK')) sTypeDmg += sHeavyDmg;
      if (sFocus.includes('Liberation')) sTypeDmg += sLibDmg;
      if (sFocus.includes('Echo')) sTypeDmg += sEchoDmg;
      if (sFocus.includes('Coordinated ATK')) sTypeDmg += sCoordDmg;
      const sDmgBonus = (1 + (sElem + sTypeDmg) / 100) * (1 + sAmplify / 100) * (1 + sDeepen / 100);
      const sReducedDef = enemyDef90 * Math.max(0, 1 - sDefShred / 100);
      const sEffDef = sReducedDef * Math.max(0, 1 - sDefIgnore / 100);
      const sDefMult = Math.min(2, ATTACKER_FACTOR / (ATTACKER_FACTOR + sEffDef));
      const sBaseRes = getEnemyRes(m.d.element);
      const sResMult = calcResMult(sBaseRes, sResShred);
      const sDmg = sEffAtk * (mult / 100) * sAvgCrit * sDmgBonus * sDefMult * sResMult;
      totalRotDmg += sDmg;
      memberDmgArr.push({ name: m.name, dmg: sDmg });
    }
  });

  return { totalRotDmg, memberDmgArr };
}
