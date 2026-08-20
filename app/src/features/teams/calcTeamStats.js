// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/teams/calcTeamStats.js (extracted from DamageCalculator.jsx)
// Team-wide damage stats orchestration: for each candidate team, invokes the
// calcEngine primitives member-by-member and builds the rotation timeline.
// Moved verbatim from DamageCalculator.jsx's calcTeamStats useCallback —
// teamEquipment/enemyEcho/enemyLevel were closed-over component state there;
// here they're explicit parameters instead. No behavior change: internal
// sub-sections (RAW/FULL/DOT tiers, rotation timeline builder) still share
// local variables rather than being independently callable, so this is a
// verbatim relocation, not a rewrite — a further split is a follow-up pass.
// ═══════════════════════════════════════════════════════════════════════════════

import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS } from '../../data/characters.js';
import { WEAPON_DATA } from '../../data/weapons.js';
import { ECHO_SETS, ECHO_DATA, ECHO_SKILL_BUFFS, getEnemyStatsAtLevel } from '../../data/echoes.js';
import { WEAPON_REFINE_SCALE } from '../../data/constants.js';
import { STAT_LABELS_FULL } from './RotationTimeline.jsx';
import {
  ATTACKER_FACTOR, BASE_CRIT_RATE, BASE_CRIT_DMG,
  ECHO_MAIN_STAT_VALUES, ECHO_SUB_STAT_VALUES, ECHO_FLAT_SUB_STAT_VALUES,
  createStats, parsePassive, getWeaponPv,
  applyFullEchoSet, applyEchoStats,
  countTeamElements, routeTypeBonuses, applyResonanceChain,
  calcDefMult, calcResMult, calcAvgCrit, calcDmgBonus,
  calcFrazzleDmg, calcErosionDmg, calcFusionBurstDmg, calcElectroFlareDmg, calcTuneBreakDmg,
  calcEnergyCycles,
  isHealerRole,
  TEAM_SET_BUFFS,
} from './calcEngine.js';

export function calcTeamStats(slots, teamIdx, mainDpsOverride, teamEquipment, enemyEcho, enemyLevel) {
    const mems = slots.filter(s => s).map(name => {
      const d = CHARACTER_DATA[name];
      if (!d) return null;
      const eqKey = teamIdx + ':' + name;
      const eq = teamEquipment[eqKey];
      const weapName = (eq?.weapon) || d.bestWeapon;
      const weapon = WEAPON_DATA[weapName] || null;
      const charAtk = d.baseAtk || 0;
      const weapAtk = weapon ? weapon.baseAtk : 0;
      const seqLevel = eq?.sequence || 0;
      const equippedEchoes = eq?.echoes || [];
      const hasAnyEcho = equippedEchoes.some(e => e && typeof e === 'object' && e.name);
      // Real equipped-echo set counts — the set bonus must never apply based on a stale/manual
      // echoSet override or a "recommended gear" text guess when it doesn't match what's actually worn.
      const wornSetCounts = {};
      equippedEchoes.forEach(e => {
        const n = e && typeof e === 'object' ? e.name : null;
        if (!n) return;
        (ECHO_DATA[n]?.sets || []).forEach(s => { wornSetCounts[s] = (wornSetCounts[s] || 0) + 1; });
      });
      let echoSetName = eq?.echoSet || '';
      let echoSet2Name = eq?.echoSet2 || '';
      if (!echoSetName && !hasAnyEcho && d.bestEchoes) {
        // No echoes equipped at all yet → preview the recommended build's set bonus (onboarding aid).
        for (const e of d.bestEchoes) {
          // Parse hybrid "SetA 3pc + SetB 2pc" format
          const hybridMatch = e.match(/^(.+?)\s+3pc\s*\+\s*(.+?)\s+2pc$/i);
          if (hybridMatch) {
            const s1 = hybridMatch[1].trim(), s2 = hybridMatch[2].trim();
            if (ECHO_SETS[s1]) { echoSetName = s1; }
            if (ECHO_SETS[s2]) { echoSet2Name = s2; }
            break;
          }
          const k = Object.keys(ECHO_SETS).find(k => e.includes(k));
          if (k) { echoSetName = k; break; }
        }
      } else if (hasAnyEcho) {
        // Echoes are actually equipped — only honor a forced/manual echoSet if it's actually worn
        // in sufficient count (2pc-type sets need ≥2, 3pc-type sets need ≥3), otherwise drop it so a
        // stale override (e.g. after swapping echoes) can't silently keep granting a bonus.
        const meetsThreshold = (setName) => {
          const s = ECHO_SETS[setName];
          if (!s) return false;
          const need = s.p3val ? 3 : 5; // p3val sets unlock at 3pc; standard sets' p2+p5 combo needs 5pc
          return (wornSetCounts[setName] || 0) >= need;
        };
        if (echoSetName && !meetsThreshold(echoSetName)) echoSetName = '';
        if (echoSet2Name && (wornSetCounts[echoSet2Name] || 0) < 2) echoSet2Name = '';
      }
      const scaling = d.statScaling || 'ATK';
      const baseStat = scaling === 'HP' ? (d.baseHp || 0) : scaling === 'DEF' ? (d.baseDef || 0) : charAtk + weapAtk;
      const mainEchoName = eq?.echoes?.[0]?.name || '';
      return { name, d, weapon, weapName, charAtk, weapAtk, totalBaseAtk: charAtk + weapAtk, scaling, baseStat, echoSetName: (echoSetName && ECHO_SETS[echoSetName]) ? echoSetName : '', echoSet: (echoSetName && ECHO_SETS[echoSetName]) ? ECHO_SETS[echoSetName] : null, echoSet2Name: (echoSet2Name && ECHO_SETS[echoSet2Name]) ? echoSet2Name : '', echoSet2: (echoSet2Name && ECHO_SETS[echoSet2Name]) ? ECHO_SETS[echoSet2Name] : null, weapSubstat: weapon?.stat || '', weapSubVal: weapon?.subStatValue || '', seqLevel, mainEchoName };
    }).filter(Boolean);
    if (!mems.length) return null;
    const allBuffs = [], allDebuffs = [];
    mems.forEach(m => { (m.d.buffs || []).forEach(b => allBuffs.push({ source: m.name, buff: b })); (m.d.debuffs || []).forEach(b => allDebuffs.push({ source: m.name, debuff: b })); });
    // DPS selection: an explicit mainDpsOverride wins — needed both for dual-Main-DPS-role team comps
    // (slot order alone can't tell us which one the player wants optimized around) and for pure
    // Sub-DPS/hybrid quickswap comps with zero 'Main DPS'-role members, where auto-detect falls back
    // to highest totalMult with no way for the player to say otherwise. The override no longer
    // requires the target to carry the 'Main DPS' role tag — any team member the player picks can be
    // the headline damage figure the calculator optimizes buff timing/uptime around. Only requirement:
    // they must still actually be in this team. Otherwise fall back to auto-detect: prefer 'Main DPS'
    // role, then highest totalMult character.
    const mainDps = (mainDpsOverride && mems.find(m => m.name === mainDpsOverride))
      || mems.find(m => m.d.role === 'Main DPS')
      || mems.reduce((best, m) => (!best || (m.d.totalMult || 0) > (best.d.totalMult || 0)) ? m : best, null)
      || mems[0];

    // ── Enemy scaling (using named constants from calcEngine) ──
    // No target selected (enemyEcho === '') keeps the original generic level-only formula/0-baseline
    // behavior unchanged. A selected target overrides DEF with its real stat at the chosen enemyLevel
    // (getEnemyStatsAtLevel, full 1-120 per-enemy curve) when known, and RES with its full per-element
    // map (enemyStats.res) instead of the old single-element enemyRes lookup.
    const enemyEchoData = enemyEcho ? ECHO_DATA[enemyEcho] : null;
    const enemyStats = enemyEchoData?.enemyStats || null;
    const enemyLevelStats = enemyEcho ? getEnemyStatsAtLevel(enemyEcho, enemyLevel) : null;
    const enemyDef90 = enemyLevelStats?.def ?? enemyStats?.def ?? (792 + 8 * (Number(enemyLevel) || 90));
    const enemyResMap = enemyStats?.res || enemyEchoData?.enemyRes || {};
    const getEnemyRes = (el) => {
      const elLow = (el || '').toLowerCase();
      return enemyResMap[elLow] ?? 10;
    };

    // ── Shared team data (computed once, used by all tiers) ──
    const elCounts = countTeamElements(mems);
    const sumOnField = mems.reduce((s, m) => s + (m.d.onField || (m.name === mainDps.name ? 15 : 5)), 0);
    const rawRotTime = Math.max(15, Math.min(35, sumOnField + 2)); // +2s for swap animations
    const rotTime = rawRotTime;

    // ── RAW TIER: equipment-only stats, no team buffs ──
    const rawMainOnField = Math.min(mainDps.d.onField || 15, rawRotTime * 0.8); // DPS gets at most 80% of rotation
    const rawOffFieldTime = Math.max(0, rawRotTime - rawMainOnField);
    // Proportional field time based on each sub-DPS's onField needs
    const subDpsMembers = mems.filter(m => m.name !== mainDps.name && (m.d.totalMult || 0) > 0);
    const totalSubNeed = subDpsMembers.reduce((s, m) => s + (m.d.onField || 5), 0) || 1;
    let rawTotalRotDmg = 0;
    mems.forEach(m => {
      let mult = m.d.totalMult || 0;
      if (mult === 0) return;
      if (m.name !== mainDps.name) {
        const subOnField = m.d.onField || 5;
        const allocatedTime = rawOffFieldTime * (subOnField / totalSubNeed);
        const fieldRatio = Math.min(1, allocatedTime / subOnField);
        // Coordinated ATK chars deal off-field damage during main DPS field time
        const rawFocus = m.d.dmgFocus || [];
        const rawHasCoord = rawFocus.includes('Coordinated ATK');
        if (rawHasCoord) {
          const coordShare = rawFocus.length === 1 ? 0.8 : 0.5;
          const coordUptime = Math.min(1, rawMainOnField / rawRotTime);
          mult = mult * (coordShare * coordUptime + (1 - coordShare) * fieldRatio);
        } else {
          mult = mult * fieldRatio;
        }
      }
      const sKey = m.scaling === 'HP' ? 'HP%' : m.scaling === 'DEF' ? 'DEF%' : 'ATK%';
      let rStatPct = 0, rCr = 5, rCd = 150, rElem = 0, rSkillDmg = 0;
      if (m.weapSubstat === 'Crit Rate') rCr += parseFloat(m.weapSubVal) || 0;
      if (m.weapSubstat === 'Crit DMG') rCd += parseFloat(m.weapSubVal) || 0;
      if (m.weapSubstat === sKey) rStatPct += parseFloat(m.weapSubVal) || 0;
      if (m.weapon) {
        const rRefLevel = (teamEquipment[teamIdx + ':' + m.name])?.refinement || 1;
        const rRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[rRefLevel - 1] || 1 : 1;
        const rawPv = m.weapon.pv || parsePassive(m.weapon.passive, m.d.element);
        const wp = Object.fromEntries(Object.entries(rawPv).map(([k, v]) => [k, typeof v === 'number' ? v * rRefScale : v]));
        if (m.scaling === 'ATK') rStatPct += (wp.atkPct || 0);
        else if (m.scaling === 'HP') rStatPct += (wp.hpPct || 0);
        else if (m.scaling === 'DEF') rStatPct += (wp.defPct || 0);
        rElem += (wp.elemDmg || 0); rSkillDmg += (wp.skillDmg || 0);
        rCr += (wp.critRate || 0); rCd += (wp.critDmg || 0);
      }
      // Apply echo set + echo stats using shared utility (was 50 lines of duplicated logic)
      const rStats = { atkPct: rStatPct, cr: rCr, cd: rCd, elemDmg: rElem, skillDmg: rSkillDmg, basicDmg: 0, heavyDmg: 0, libDmg: 0, echoDmg: 0, coordDmg: 0, deepen: 0, amplify: 0, defShred: 0, resShred: 0, defIgnore: 0 };
      applyFullEchoSet(rStats, m.echoSet, m.echoSet2, m.d.element, m.scaling);
      const eqKey = teamIdx + ':' + m.name;
      applyEchoStats(rStats, teamEquipment[eqKey]?.echoes, m.d.element, m.scaling, { atk: m.totalBaseAtk, hp: m.d.baseHp, def: m.d.baseDef });
      if (m.d.element && elCounts[m.d.element] >= 2) rStats.elemDmg += 10;
      const rEff = m.baseStat * (1 + rStats.atkPct / 100);
      const rAvgCrit = calcAvgCrit(rStats.cr, rStats.cd);
      const rDmgBonus = 1 + (rStats.elemDmg + rStats.skillDmg) / 100;
      const rDefMult = ATTACKER_FACTOR / (ATTACKER_FACTOR + enemyDef90);
      const rResMult = calcResMult(getEnemyRes(m.d.element), 0);
      rawTotalRotDmg += rEff * (mult / 100) * rAvgCrit * rDmgBonus * rDefMult * rResMult;
    });
    const rawDps = Math.round(rawTotalRotDmg / rawRotTime);

    // ── FULL TIER: Base stats with team buffs ──
    const mainStatKey = mainDps.scaling === 'HP' ? 'HP%' : mainDps.scaling === 'DEF' ? 'DEF%' : 'ATK%';
    let atkPct = 0, cr = 5, cd = 150, elemDmg = 0, skillDmg = 0, deepen = 0, defShred = 0, resShred = 0, defIgnore = 0;
    let amplify = 0; // WuWa DMG Amplification layer — separate from DMG Bonus, multiplicative

    if (mainDps.weapSubstat === 'Crit Rate') cr += parseFloat(mainDps.weapSubVal) || 0;
    if (mainDps.weapSubstat === 'Crit DMG') cd += parseFloat(mainDps.weapSubVal) || 0;
    if (mainDps.weapSubstat === mainStatKey) atkPct += parseFloat(mainDps.weapSubVal) || 0;

    let wpBasicDmg = 0, wpHeavyDmg = 0, wpLibDmg = 0, wpEchoDmg = 0, wpCoordDmg = 0;
    if (mainDps.weapon) {
      const mainRefLevel = (teamEquipment[teamIdx + ':' + mainDps.name])?.refinement || 1;
      const mainRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[mainRefLevel - 1] || 1 : 1;
      const mainRawPv = mainDps.weapon.pv || parsePassive(mainDps.weapon.passive, mainDps.d.element);
      const wp = Object.fromEntries(Object.entries(mainRawPv).map(([k, v]) => [k, typeof v === 'number' ? v * mainRefScale : v]));
      if (mainDps.scaling === 'ATK') atkPct += (wp.atkPct || 0);
      else if (mainDps.scaling === 'HP') atkPct += (wp.hpPct || 0);
      else if (mainDps.scaling === 'DEF') atkPct += (wp.defPct || 0);
      elemDmg += (wp.elemDmg || 0); skillDmg += (wp.skillDmg || 0);
      cr += (wp.critRate || 0); cd += (wp.critDmg || 0);
      defIgnore += (wp.defIgnore || 0); resShred += (wp.resShred || 0);
      wpBasicDmg = (wp.basicDmg || 0); wpHeavyDmg = (wp.heavyDmg || 0);
      wpLibDmg = (wp.libDmg || 0); wpEchoDmg = (wp.echoDmg || 0);
      wpCoordDmg = (wp.coordDmg || 0);
    }

    // Apply main DPS echo set bonuses (using shared utility)
    {
      const setStats = createStats();
      applyFullEchoSet(setStats, mainDps.echoSet, mainDps.echoSet2, mainDps.d.element, mainDps.scaling);
      atkPct += setStats.atkPct; cr += setStats.cr - BASE_CRIT_RATE; cd += setStats.cd - BASE_CRIT_DMG;
      elemDmg += setStats.elemDmg; skillDmg += setStats.skillDmg;
      wpBasicDmg += setStats.basicDmg; wpHeavyDmg += setStats.heavyDmg;
      wpLibDmg += setStats.libDmg; wpEchoDmg += setStats.echoDmg;
    }

    let echoBasicDmg = 0, echoHeavyDmg = 0, echoSkillDmg = 0, echoLibDmg = 0;
    {
      const mainEqKey = teamIdx + ':' + mainDps.name;
      const mainEq = teamEquipment[mainEqKey];
      const echoes = mainEq?.echoes || [];
      const mainEl = (mainDps.d.element || '').toLowerCase();
      const elDmgKey = mainEl ? mainEl.charAt(0).toUpperCase() + mainEl.slice(1) + ' DMG' : '';
      const mainStatVals = ECHO_MAIN_STAT_VALUES;
      const subVals = ECHO_SUB_STAT_VALUES;
      const applyStat = (stat, val) => {
        if (stat === mainStatKey) atkPct += val;
        else if (stat === 'Crit Rate') cr += val;
        else if (stat === 'Crit DMG') cd += val;
        else if (stat === elDmgKey) elemDmg += val;
        else if (stat === 'Basic ATK DMG') echoBasicDmg += val;
        else if (stat === 'Heavy ATK DMG') echoHeavyDmg += val;
        else if (stat === 'Resonance Skill DMG') echoSkillDmg += val;
        else if (stat === 'Resonance Liberation DMG') echoLibDmg += val;
      };
      echoes.forEach((echo, i) => {
        if (!echo || typeof echo !== 'object') return;
        const cost = i === 0 ? 4 : i < 3 ? 3 : 1;
        if (echo.mainStat) {
          const val = mainStatVals[cost]?.[echo.mainStat] || 0;
          applyStat(echo.mainStat, val);
        }
        (echo.substats || []).forEach(sub => {
          if (sub === 'ATK' || sub === 'HP' || sub === 'DEF') {
            // Flat ATK/HP/DEF substat: converts to %-of-base-stat, and only actually helps the
            // main DPS if it matches their own scaling stat (see calcEngine.js flatSubToPct for
            // the full reasoning — no partial credit here, unlike teamwide ATK% buffs elsewhere).
            const flatVal = ECHO_FLAT_SUB_STAT_VALUES[sub];
            const baseForSub = sub === 'ATK' ? mainDps.totalBaseAtk : sub === 'HP' ? mainDps.d.baseHp : mainDps.d.baseDef;
            if (flatVal && sub === mainDps.scaling && baseForSub) {
              atkPct += (flatVal / baseForSub) * 100;
            }
            return;
          }
          const val = subVals[sub];
          if (val) applyStat(sub, val);
        });
      });
    }

    {
      const mainEl = mainDps.d.element;
      if (mainEl && elCounts[mainEl] >= 2) elemDmg += 10;
    }

    // ── Main DPS echo skill buffs (self buffs from their own 4-cost echo) ──
    if (mainDps.mainEchoName) {
      const mainEsb = ECHO_SKILL_BUFFS[mainDps.mainEchoName];
      if (mainEsb && (mainEsb.target || 'self') === 'self' && (!mainEsb.condition || mainDps.name.includes(mainEsb.condition))) {
        const esbUp = mainEsb.passive ? 1 : Math.min(1, (mainEsb.duration || 15) / rotTime);
        mainEsb.buffs.forEach(b => {
          const val = b.value * esbUp;
          const mainEl = (mainDps.d.element || '').toLowerCase();
          if (b.stat === mainEl + 'Dmg') elemDmg += val;
          else if (b.stat === 'allDmg') elemDmg += val;
          else if (b.stat === 'atkPct') atkPct += val;
          else if (b.stat === 'skillDmg') skillDmg += val;
          else if (b.stat === 'basicDmg') wpBasicDmg += val;
          else if (b.stat === 'heavyDmg') wpHeavyDmg += val;
          else if (b.stat === 'libDmg') wpLibDmg += val;
          else if (b.stat === 'echoDmg') wpEchoDmg += val;
          else if (b.stat === 'coordDmg') wpCoordDmg += val;
          else if (b.stat === 'critRate') cr += val;
          else if (b.stat === 'critDmg') cd += val;
        });
      }
    }

    const dpsFocus = mainDps.d.dmgFocus || [];
    let basicDmg = wpBasicDmg, heavyDmg = wpHeavyDmg, libDmg = wpLibDmg, echoDmg = wpEchoDmg, coordDmg = wpCoordDmg;
    mems.forEach(m => {
      const bt = CHAR_BUFF_TABLE[m.name];
      if (!bt) return;
      const isMain = m.name === mainDps.name;

      if (!isMain) {
        const teamRotTime = rotTime;
        // WuWa outro buffs are "DMG Amplification" — a SEPARATE multiplicative layer
        // from self DMG Bonus. Route element/skill/type Amp buffs to `amplify`.
        // 'ally' (Rover: Electro's Outro) means the same thing as 'next' — the incoming
        // Resonator receives the buff — just labeled differently in the data; treat identically
        // or it silently never applies to anyone.
        (bt.outroBuffs || []).forEach(b => {
          if (b.target === 'next' || b.target === 'enemy' || b.target === 'ally') {
            const uptime = Math.min(1, (b.duration || 14) / teamRotTime);
            const val = b.value * uptime;
            if (b.stat === 'atkPct') {
              if (mainDps.scaling === 'ATK') atkPct += val;
              else atkPct += val * 0.25;
            }
            else if (b.stat === 'allDmg') amplify += val;
            else if (b.stat === 'elemDmg') {
              const buffEl = (b.condition || '').toLowerCase();
              const dpsEl = (mainDps.d.element || '').toLowerCase();
              if (!buffEl || buffEl.includes(dpsEl) || buffEl.includes('all')) amplify += val;
            }
            else if (b.stat === 'deepen') deepen += val;
            else if (b.stat === 'basicDmg') { if (dpsFocus.includes('Basic ATK')) amplify += val; }
            else if (b.stat === 'heavyDmg') { if (dpsFocus.includes('Heavy ATK')) amplify += val; }
            else if (b.stat === 'libDmg') { if (dpsFocus.includes('Liberation')) amplify += val; }
            else if (b.stat === 'echoDmg') { if (dpsFocus.includes('Echo')) amplify += val; }
            else if (b.stat === 'skillDmg') amplify += val;
            else if (b.stat === 'critRate') cr += val;
            else if (b.stat === 'critDmg') cd += val;
            else if (b.stat === 'resShred') resShred += val;
            else if (b.stat === 'defShred') defShred += val;
          }
        });
      }

      // Sonata set p5 team/next ATK% buffs (Rejuvenating Glow/Halo of Starry Radiance's heal-triggered
      // teamAtk, Moonlit Clouds' Outro-triggered nextAtk) — previously only emitted into the cosmetic
      // Rotation Timeline event list, never added to the actual stat totals the DPS number is computed
      // from. teamAtk applies from any member (including the main DPS healing/triggering it themself);
      // nextAtk only from a non-main member swapping the main DPS in via their Outro.
      const p5v = m.echoSet?.p5val;
      if (p5v?.teamAtk) {
        const uptime = Math.min(1, 20 / rotTime);
        const val = p5v.teamAtk * uptime;
        atkPct += mainDps.scaling === 'ATK' ? val : val * 0.25;
      }
      if (!isMain && p5v?.nextAtk) {
        const uptime = Math.min(1, 14 / rotTime);
        const val = p5v.nextAtk * uptime;
        atkPct += mainDps.scaling === 'ATK' ? val : val * 0.25;
      }

      (bt.libBuffs || []).forEach(b => {
        if (b.target === 'team' || (!isMain && b.target === 'next')) {
          const teamRotTime = rotTime;
          const uptime = Math.min(1, (b.duration || 25) / teamRotTime);
          const val = b.value * uptime;
          if (b.stat === 'atkPct' && mainDps.scaling === 'ATK') atkPct += val;
          else if (b.stat === 'allDmg') elemDmg += val;
          else if (b.stat === 'elemDmg') {
            const buffEl = (b.condition || '').toLowerCase();
            const dpsEl = (mainDps.d.element || '').toLowerCase();
            if (!buffEl || buffEl.includes(dpsEl) || buffEl.includes('all')) elemDmg += val;
          }
          else if (b.stat === 'critRate') cr += val;
          else if (b.stat === 'critDmg') cd += val;
          else if (b.stat === 'echoDmg') echoDmg += val;
        }
      });

      if (isMain) {
        (bt.selfBuffs || []).forEach(b => {
          if (b.stat === 'atkPct') atkPct += b.value;
          else if (b.stat === 'elemDmg') elemDmg += b.value;
          else if (b.stat === 'critRate') cr += b.value;
          else if (b.stat === 'critDmg') cd += b.value;
          else if (b.stat === 'defIgnore') defIgnore += b.value;
        });
      }

      (bt.debuffs || []).forEach(db => {
        if (db.stat === 'defShred') defShred += db.value;
        else if (db.stat === 'resShred') resShred += db.value;
        else if (db.stat === 'frazzle') {}
        else if (db.stat === 'erosion') {}
        else if (db.stat === 'offTune') deepen += db.value;
        else if (db.stat === 'havocBane') defShred += db.value * 2;
        // 'deepen' as a debuff stat (e.g. Galbrena's Afterflame — enemy DMG Taken) is the same
        // multiplier as the buff-side 'deepen', just framed as an enemy debuff instead of an ally
        // buff — was never recognized here, silently dropping the whole effect from every DPS calc.
        else if (db.stat === 'deepen') deepen += db.value;
        // 'defIgnore' debuffs (e.g. Carlotta's Deconstruction) target the enemy's own DEF, same as
        // the buff-side 'defIgnore' — was falling through to the no-op default, dropping enemy DEF
        // Ignore debuffs from the calc entirely.
        else if (db.stat === 'defIgnore') defIgnore += db.value;
      });
    });

    // DMG Bonus layer: weapon + echo self-bonuses (NOT outro amplify)
    basicDmg += echoBasicDmg; heavyDmg += echoHeavyDmg; libDmg += echoLibDmg;
    skillDmg += echoSkillDmg;

    // Route type-specific DMG Bonus into skillDmg based on character's damage focus
    { const typeStats = { skillDmg: 0, basicDmg, heavyDmg, libDmg, echoDmg, coordDmg };
      routeTypeBonuses(typeStats, dpsFocus);
      skillDmg += typeStats.skillDmg; }

    const mainDpsEl = (mainDps.d.element || '').toLowerCase();
    mems.forEach(m => {
      if (m.name === mainDps.name) return;
      const sn = m.echoSetName;
      const sn2 = m.echoSet2Name;
      // Healer/Support set team buffs. These grant real ATK% (raises the ATK stat, not "whatever the
      // DPS scales on") — for an ATK-scaling main DPS that's a 1:1 damage gain, but for an HP/DEF
      // scaler ATK barely factors into their Motion Value damage, so it's given the same 25%
      // partial-credit fallback used everywhere else in this file for off-scaling ATK buffs (was
      // previously added at full value regardless of scaling — inconsistent with every other ATK
      // buff site here, and a real undervaluation bug in the other direction for HP/DEF-scaling DPS).
      // Sourced from TEAM_SET_BUFFS so the rotation timeline can render the exact same bonuses.
      (TEAM_SET_BUFFS[sn] || []).forEach(e => {
        if (e.elem && e.elem !== mainDpsEl) return;
        if (e.stat === 'atkPct') atkPct += mainDps.scaling === 'ATK' ? e.value : e.value * 0.25;
        else if (e.stat === 'elemDmg') elemDmg += e.value;
        else if (e.stat === 'libDmg') libDmg += e.value;
      });
      // 3pc set team contribution from sub-DPS (wearer benefits, no direct team buff)
      // 2pc bonus from hybrid secondary set applied to wearer only (handled in sub-DPS calc)
      const bt = CHAR_BUFF_TABLE[m.name];
      (bt?.weaponBuffs || []).forEach(wb => {
        if (wb.target !== 'team') return;
        const teamRotTime = rotTime;
        const uptime = Math.min(1, (wb.duration || 10) / teamRotTime);
        const val = wb.value * uptime;
        if (wb.stat === 'atkPct' && mainDps.scaling === 'ATK') atkPct += val;
        else if (wb.stat === 'critRate') cr += val;
        else if (wb.stat === 'critDmg') cd += val;
        else if (wb.stat === 'allDmg') elemDmg += val;
      });
      if (m.weapon?.tv) {
        const tvRefLevel = (teamEquipment[teamIdx + ':' + m.name])?.refinement || 1;
        const tvRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[tvRefLevel - 1] || 1 : 1;
        const wt = m.weapon.tv;
        const teamRotTime = rotTime;
        const uptime = Math.min(1, (wt.duration || 15) / teamRotTime);
        if (wt.atkPct) atkPct += wt.atkPct * tvRefScale * uptime;
        if (wt.elemDmg) elemDmg += wt.elemDmg * tvRefScale * uptime;
        if (wt.critRate) cr += wt.critRate * tvRefScale * uptime;
        if (wt.critDmg) cd += wt.critDmg * tvRefScale * uptime;
      }
      // ── Echo active skill buffs from sub-DPS (team/next buffs) ──
      if (m.mainEchoName) {
        const esb = ECHO_SKILL_BUFFS[m.mainEchoName];
        if (esb) {
          const target = esb.target || 'self';
          const esbUptime = esb.passive ? 1 : Math.min(1, (esb.duration || 15) / rotTime);
          if ((target === 'team' || target === 'next') && (!esb.condition || m.name.includes(esb.condition))) {
            esb.buffs.forEach(b => {
              const val = b.value * esbUptime;
              if (b.stat === 'allDmg') elemDmg += val;
              else if (b.stat === 'atkPct' && mainDps.scaling === 'ATK') atkPct += val;
              else if (b.stat === 'critRate') cr += val;
              else if (b.stat === 'critDmg') cd += val;
              else {
                const mainEl = (mainDps.d.element || '').toLowerCase();
                if (b.stat === mainEl + 'Dmg') elemDmg += val;
              }
            });
          }
        }
      }
    });

    // Apply resonance chain bonuses (using shared utility)
    let seqTotalMultBonus = 0;
    const seqStats = { atkPct: 0, cr: 0, cd: 0, elemDmg: 0, skillDmg: 0, basicDmg: 0, heavyDmg: 0, libDmg: 0, echoDmg: 0, deepen: 0, amplify: 0, defShred: 0, resShred: 0, defIgnore: 0 };
    mems.forEach(m => {
      const isMain = m.name === mainDps.name;
      const bonus = applyResonanceChain(seqStats, m.name, m.seqLevel, isMain);
      if (isMain) seqTotalMultBonus += bonus;
    });
    atkPct += seqStats.atkPct; cr += seqStats.cr; cd += seqStats.cd;
    elemDmg += seqStats.elemDmg; skillDmg += seqStats.skillDmg;
    basicDmg += seqStats.basicDmg; heavyDmg += seqStats.heavyDmg;
    libDmg += seqStats.libDmg; echoDmg += seqStats.echoDmg;
    deepen += seqStats.deepen; defShred += seqStats.defShred;
    resShred += seqStats.resShred; defIgnore += seqStats.defIgnore;

    const effAtk = Math.round(mainDps.baseStat * (1 + atkPct / 100));
    const avgCrit = calcAvgCrit(cr, cd);
    const dmgBonus = calcDmgBonus(elemDmg, skillDmg, amplify, deepen);
    const defMult = calcDefMult(enemyDef90, defShred, defIgnore);
    const mainBaseRes = getEnemyRes(mainDps.d.element);
    const resMult = calcResMult(mainBaseRes, resShred);
    const score = Math.round(effAtk * avgCrit * dmgBonus * defMult * resMult);

    // ── DOT damage (ICD-aware, from calcEngine) ──
    // Each of these reactions has a fixed damage element regardless of which character on the team
    // triggers it (Frazzle is always Spectro, Erosion always Havoc, etc.) — so its RES must come from
    // the enemy's RES to THAT element, not resMult above (which is keyed to mainDps's own element and
    // was wrong here whenever the team's element differs from the reaction's, e.g. a Glacio main DPS
    // whose support triggers Havoc Erosion). Tune Break has no single canonical element (bespoke
    // per-character mechanic), so it keeps using mainDps's resMult as before.
    let dotDmgPerRotation = 0;
    const frazzleResMult = calcResMult(getEnemyRes('Spectro'), resShred);
    const erosionResMult = calcResMult(getEnemyRes('Havoc'), resShred);
    const fusionBurstResMult = calcResMult(getEnemyRes('Fusion'), resShred);
    const electroFlareResMult = calcResMult(getEnemyRes('Electro'), resShred);
    const frazzleResult = calcFrazzleDmg(mems, rotTime, defMult, frazzleResMult);
    const erosionResult = calcErosionDmg(mems, rotTime, defMult, erosionResMult);
    const fusionBurstResult = calcFusionBurstDmg(mems, rotTime, defMult, fusionBurstResMult);
    const electroFlareResult = calcElectroFlareDmg(mems, rotTime, defMult, electroFlareResMult);
    const tuneBreakResult = calcTuneBreakDmg(mems, rotTime, defMult, resMult);
    dotDmgPerRotation += frazzleResult.dmg + erosionResult.dmg + fusionBurstResult.dmg + electroFlareResult.dmg + tuneBreakResult.dmg;
    const hasFrazzle = frazzleResult.active;
    const hasErosion = erosionResult.active;
    const hasFusionBurst = fusionBurstResult.active;
    const hasElectroFlare = electroFlareResult.active;
    const tuneBreakDeepenMult = tuneBreakResult.deepenMult;

    // ── Energy cycle awareness (from calcEngine) ──
    const energyCycleFactors = calcEnergyCycles(mems, teamEquipment, teamIdx);

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
        const sEl = (m.d.element || '').toLowerCase();
        const sElDmgKey = sEl ? sEl.charAt(0).toUpperCase() + sEl.slice(1) + ' DMG' : '';
        const sStatKey = m.scaling === 'HP' ? 'HP%' : m.scaling === 'DEF' ? 'DEF%' : 'ATK%';
        let sAtkPct = 0, sCr = 5, sCd = 150, sElem = 0, sSkillDmg = 0, sDeepen = 0, sAmplify = 0;
        let sBasicDmg = 0, sHeavyDmg = 0, sLibDmg = 0, sEchoDmg = 0, sCoordDmg = 0, sDefIgnore = 0;
        let sDefShred = 0, sResShred = 0;
        const teamRotTime = rotTime;
        const echoPreset = sEq?.echoPreset || 'default';
        if (sEchoes.length === 0) {
          if (echoPreset === 'er') {
            sAtkPct += 18 + 18;
            sCr += 22.5;
            sCd += 45;
            sElem += 30;
          } else if (echoPreset === 'support') {
            sAtkPct += 18;
            sCr += 15;
            sCd += 30;
            sElem += 30;
          } else {
            sAtkPct += 30 + 18 + 18;
            sCr += 22.5;
            sCd += 45;
            sElem += 60;
          }
        }
        // ── Buff snapshotting for off-field damage ──
        // Coordinated ATK characters snapshot buffs at swap-out time.
        // They benefit from buffs that exist BEFORE they swap out (team-wide Lib buffs,
        // earlier outro buffs), but NOT from outro buffs applied AFTER them in rotation order.
        // On-field sub-DPS characters receive all buffs normally.
        const focus = m.d.dmgFocus || [];
        const isOffField = focus.includes('Coordinated ATK') && focus.length <= 2;
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
              const uptime = Math.min(1, (b.duration || 14) / teamRotTime);
              const val = b.value * uptime * snapshotFactor;
              if (b.stat === 'atkPct') sAtkPct += m.scaling === 'ATK' ? val : val * 0.25;
              else if (b.stat === 'allDmg' || b.stat === 'elemDmg') sAmplify += val;
              else if (b.stat === 'deepen') sDeepen += val;
              else if (b.stat === 'basicDmg') sAmplify += val;
              else if (b.stat === 'heavyDmg') sAmplify += val;
              else if (b.stat === 'libDmg') sAmplify += val;
              else if (b.stat === 'echoDmg') sAmplify += val;
              else if (b.stat === 'critRate') sCr += val;
              else if (b.stat === 'critDmg') sCd += val;
              else if (b.stat === 'skillDmg') sAmplify += val;
              else if (b.stat === 'resShred') sResShred += val;
              else if (b.stat === 'defShred') sDefShred += val;
            }
          });
          // Sonata set p5 team/next ATK% buffs (see the same fix on the main-tier computation above).
          const oP5v = other.echoSet?.p5val;
          if (oP5v?.teamAtk) {
            const uptime = Math.min(1, 20 / teamRotTime);
            const val = oP5v.teamAtk * uptime * (isOffField ? 0.6 : 1.0);
            sAtkPct += m.scaling === 'ATK' ? val : val * 0.25;
          }
          if (oP5v?.nextAtk) {
            const uptime = Math.min(1, 14 / teamRotTime);
            const val = oP5v.nextAtk * uptime * (isOffField ? 0.6 : 1.0);
            sAtkPct += m.scaling === 'ATK' ? val : val * 0.25;
          }
          (obt.libBuffs || []).forEach(b => {
            if (b.target === 'team') {
              const uptime = Math.min(1, (b.duration || 25) / teamRotTime);
              const val = b.value * uptime;
              if (b.stat === 'atkPct') sAtkPct += m.scaling === 'ATK' ? val : val * 0.25;
              else if (b.stat === 'allDmg') sElem += val;
              else if (b.stat === 'elemDmg') {
                const buffEl = (b.condition || '').toLowerCase();
                const subEl = (m.d.element || '').toLowerCase();
                if (!buffEl || buffEl.includes(subEl) || buffEl.includes('all')) sElem += val;
              }
              else if (b.stat === 'critRate') sCr += val;
              else if (b.stat === 'critDmg') sCd += val;
              else if (b.stat === 'echoDmg') sEchoDmg += val;
            }
          });
          (obt.debuffs || []).forEach(db => {
            if (db.stat === 'defShred') sDefShred += db.value;
            else if (db.stat === 'resShred') sResShred += db.value;
            else if (db.stat === 'offTune') sDeepen += db.value;
            else if (db.stat === 'havocBane') sDefShred += db.value * 2;
            else if (db.stat === 'deepen') sDeepen += db.value;
            else if (db.stat === 'defIgnore') sDefIgnore += db.value;
          });
        });
        const mbt = CHAR_BUFF_TABLE[m.name];
        if (mbt) {
          (mbt.selfBuffs || []).forEach(b => {
            if (b.stat === 'atkPct') sAtkPct += b.value;
            else if (b.stat === 'elemDmg') sElem += b.value;
            else if (b.stat === 'critRate') sCr += b.value;
            else if (b.stat === 'critDmg') sCd += b.value;
            else if (b.stat === 'defIgnore') sDefIgnore += b.value;
            else if (b.stat === 'deepen') sDeepen += b.value;
          });
          (mbt.debuffs || []).forEach(db => {
            if (db.stat === 'defShred') sDefShred += db.value;
            else if (db.stat === 'resShred') sResShred += db.value;
            else if (db.stat === 'offTune') sDeepen += db.value;
            else if (db.stat === 'deepen') sDeepen += db.value;
            else if (db.stat === 'defIgnore') sDefIgnore += db.value;
          });
        }
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
          sDefIgnore += (swp.defIgnore || 0); sResShred += (swp.resShred || 0);
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
        let sTypeDmg = sSkillDmg;
        const sFocus = m.d.dmgFocus || [];
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
    // ── Per-member damage with type breakdown ──
    const memberDmg = memberDmgArr.map(m => {
      const mem = mems.find(mm => mm.name === m.name);
      const isMain = m.name === mainDps.name;
      const focus = mem?.d?.dmgFocus || [];
      const hasCoord = focus.includes('Coordinated ATK');
      return {
        name: m.name,
        skillDmg: m.dmg,           // On-field / off-field skill rotation damage
        echoDmg: 0,                // Echo active skill damage (filled below)
        dotDmg: 0,                 // DOT contribution (filled below)
        total: m.dmg,
        isOnField: isMain || (!hasCoord && (mem?.d?.onField || 0) > 3),
        isCoord: hasCoord,
      };
    });

    // ── Echo active skill damage — integrated into rotation (not separate tier) ──
    let echoActiveDmg = 0;
    mems.forEach(m => {
      const eqKey = teamIdx + ':' + m.name;
      const eq = teamEquipment[eqKey];
      const echoes = eq?.echoes || [];
      if (echoes[0]?.name) {
        const echoInfo = ECHO_DATA[echoes[0].name];
        const echoDmgPct = echoInfo?.dmg || 0;
        if (echoDmgPct > 0) {
          const echoEl = echoInfo?.element || m.d.element;
          const echoBase = m.scaling === 'ATK' ? m.totalBaseAtk : m.baseStat * 0.25;
          const echoResRate = getEnemyRes(echoEl);
          const echoResMult = calcResMult(echoResRate, resShred);
          let echoSkillBonus = 0;
          if (m.echoSet) {
            if (m.echoSet.p3val) {
              if (m.echoSet.p3val.echoDmg) echoSkillBonus += m.echoSet.p3val.echoDmg;
            } else {
              const p2 = m.echoSet.p2val || {}, p5 = m.echoSet.p5val || {};
              if (p2.echoDmg) echoSkillBonus += p2.echoDmg;
              if (p5.echoDmg) echoSkillBonus += p5.echoDmg;
            }
          }
          const echoDmgMult = 1 + echoSkillBonus / 100;
          const isMain = m.name === mainDps.name;
          const echoCrit = isMain ? avgCrit : (() => {
            let eCr = 5, eCd = 150;
            if (m.weapSubstat === 'Crit Rate') eCr += parseFloat(m.weapSubVal) || 0;
            if (m.weapSubstat === 'Crit DMG') eCd += parseFloat(m.weapSubVal) || 0;
            if (m.weapon) {
              // Use getWeaponPv (curated pv table + refinement scaling), matching every other crit
              // computation in this file — this branch previously called parsePassive() directly,
              // bypassing curated pv values and always using unrefined (R1) numbers regardless of
              // the weapon's actual refinement level, understating this member's echo-skill crit.
              const eRefLevel = (teamEquipment[teamIdx + ':' + m.name])?.refinement || 1;
              const wp = getWeaponPv(m.weapon, m.d.element, eRefLevel);
              eCr += wp.critRate || 0; eCd += wp.critDmg || 0;
            }
            if (m.echoSet) { const p2 = m.echoSet.p2val || {}, p5 = m.echoSet.p5val || {}; if (p2.critRate) eCr += p2.critRate; if (p5.critRate) eCr += p5.critRate; }
            return 1 + (Math.min(eCr, 100) / 100) * (eCd / 100 - 1);
          })();
          const thisDmg = echoBase * (echoDmgPct / 100) * echoCrit * echoDmgMult * defMult * echoResMult;
          echoActiveDmg += thisDmg;
          // Attribute echo damage to the member who uses it
          const md = memberDmg.find(mm => mm.name === m.name);
          if (md) { md.echoDmg = thisDmg; md.total += thisDmg; }
        }
      }
    });

    // Distribute DOT damage proportionally to members who enable it
    const dotContributors = mems.filter(m => {
      const bt = CHAR_BUFF_TABLE[m.name];
      return bt?.debuffs?.some(db => ['frazzle', 'erosion', 'fusionBurst'].includes(db.stat)) || bt?.electroFlare || bt?.tuneBreak;
    });
    if (dotContributors.length > 0 && dotDmgPerRotation > 0) {
      const share = dotDmgPerRotation / dotContributors.length;
      dotContributors.forEach(m => {
        const md = memberDmg.find(mm => mm.name === m.name);
        if (md) { md.dotDmg = share; md.total += share; }
      });
    }

    // ── TEAM DPS: Single authoritative number (skills + echoes + DOTs + Tune Break) ──
    const grandTotal = totalRotDmg + echoActiveDmg + dotDmgPerRotation;
    const teamDps = Math.round(grandTotal * tuneBreakDeepenMult / rotTime);

    // ── Member DPS with full breakdown ──
    const memberDps = memberDmg.map(m => {
      const adjustedTotal = m.total * tuneBreakDeepenMult;
      const grandTotalAdj = grandTotal * tuneBreakDeepenMult;
      const pct = grandTotalAdj > 0 ? Math.round(adjustedTotal / grandTotalAdj * 100) : 0;
      return {
        name: m.name,
        dmg: adjustedTotal,
        pct,
        // Damage source tags for distribution display
        onField: m.isOnField,
        hasEcho: m.echoDmg > 0,
        hasDot: m.dotDmg > 0,
        isCoord: m.isCoord,
        // Per-source breakdown percentages
        skillShare: m.total > 0 ? Math.round(m.skillDmg / m.total * 100) : 0,
        echoShare: m.total > 0 ? Math.round(m.echoDmg / m.total * 100) : 0,
        dotShare: m.total > 0 ? Math.round(m.dotDmg / m.total * 100) : 0,
      };
    });

    // ── SOLO DPS: sum of individual solo DPS for synergy calculation ──
    const soloDps = Math.round(rawTotalRotDmg / rawRotTime);

    // ── SYNERGY UPLIFT: actual % DPS gain from team synergy ──
    const synergyUplift = soloDps > 0 ? Math.round((teamDps / soloDps - 1) * 100) : 0;

    // ── Damage source type breakdown for the whole team ──
    const totalSkillDmg = memberDmg.reduce((s, m) => s + m.skillDmg, 0);
    const totalDotDmg = dotDmgPerRotation;
    const totalEchoDmg = echoActiveDmg;
    const grandTotalRaw = totalSkillDmg + totalEchoDmg + totalDotDmg;
    const dmgSources = grandTotalRaw > 0 ? {
      rotation: Math.round(totalSkillDmg / grandTotalRaw * 100),
      echo: Math.round(totalEchoDmg / grandTotalRaw * 100),
      dot: Math.round(totalDotDmg / grandTotalRaw * 100),
    } : { rotation: 100, echo: 0, dot: 0 };

    // ── Synergy scoring: measures how well the team works together ──
    let syn = 0;
    // Role coverage (0-30). Compound roles like 'Support/Healer' (Chisa, Suisui) never match an
    // exact 'Healer'/'Support' equality check, so a team with just one of them as its only
    // healer/support scored as having neither — use the substring-aware role helper instead.
    const hasHealer = mems.some(m => isHealerRole(m.d.role));
    const hasSubDps = mems.some(m => m.d.role === 'Sub DPS');
    const hasSupport = mems.some(m => (m.d.role || '').includes('Support'));
    if (hasHealer) syn += 15;
    if (hasSubDps || hasSupport) syn += 15;
    // Element synergy (0-20): matching elements enable resonance + buff alignment
    const mainEl = mainDps.d.element;
    if (mainEl && elCounts[mainEl] >= 2) syn += 10; // Element resonance with DPS
    if (mainEl && elCounts[mainEl] >= 3) syn += 5;  // Mono-element bonus
    // Buff alignment (0-25): do teammates buff what the DPS actually uses?
    const dpsBuffTable = CHAR_BUFF_TABLE[mainDps.name];
    mems.forEach(m => {
      if (m.name === mainDps.name) return;
      const bt = CHAR_BUFF_TABLE[m.name];
      if (!bt) return;
      (bt.outroBuffs || []).forEach(b => {
        if (b.stat === 'deepen') syn += 5; // Universal deepen is always good
        else if (b.stat === 'basicDmg' && dpsFocus.includes('Basic ATK')) syn += 5;
        else if (b.stat === 'heavyDmg' && dpsFocus.includes('Heavy ATK')) syn += 5;
        else if (b.stat === 'libDmg' && dpsFocus.includes('Liberation')) syn += 3;
        else if (b.stat === 'echoDmg' && dpsFocus.includes('Echo')) syn += 5;
        else if (b.stat === 'skillDmg' && dpsFocus.includes('Skill')) syn += 4;
        else if (b.stat === 'elemDmg') {
          const cond = (b.condition || '').toLowerCase();
          const dpsEl = (mainEl || '').toLowerCase();
          if (!cond || cond.includes(dpsEl) || cond.includes('all')) syn += 4;
        }
      });
      // Debuff contribution
      (bt.debuffs || []).forEach(db => {
        if (db.stat === 'defShred' || db.stat === 'resShred') syn += 3;
      });
    });
    // Off-field damage contribution (0-10)
    const offFieldDamagers = mems.filter(m => m.name !== mainDps.name && (m.d.dmgFocus || []).includes('Coordinated ATK'));
    if (offFieldDamagers.length > 0) syn += 5;
    if (offFieldDamagers.length > 1) syn += 5;
    syn = Math.min(syn, 100);
    const warnings = [];
    if (mems.length < 3) {
      warnings.push('Incomplete team');
    } else {
      if (!mems.some(m => isHealerRole(m.d.role))) warnings.push('No healer in team');
      const els = new Set(mems.map(m => m.d.element));
      if (els.size === mems.length) warnings.push('No element resonance');
      const dpsCount = mems.filter(m => m.d.role === 'Main DPS').length;
      if (dpsCount >= 2) warnings.push(`Dual DPS: rotation time shared — use 👑 to pick which one${mainDpsOverride ? ` (${mainDps.name})` : ''}`);
      if (dpsCount === 0) warnings.push(`No Main DPS: using highest damage dealer — use 👑 to pick a different headline DPS${mainDpsOverride ? ` (${mainDps.name})` : ''}`);
      // Real, calculated consequence of the selected enemy (not just a DEF/RES number difference) —
      // flag when the main DPS's own element is one the target specifically resists, since that's the
      // one matchup the player can actually act on (swap main DPS or bring an off-element sub-DPS).
      if (enemyEcho) {
        const mainRes = getEnemyRes(mainDps.d.element);
        if (mainRes > 10) warnings.push(`${enemyEcho} resists ${mainDps.d.element} (${mainRes}% RES) — ${mainDps.name}'s main-hit DMG is reduced against this target`);
      }
    }
    const dotDps = Math.round(dotDmgPerRotation / rotTime);

    const rotationTimeline = (() => {
      const buffs = [];
      // ── Smart rotation ordering based on WuWa swap mechanics ──
      // Rule 1: Main DPS goes LAST (receives all buffs in DPS window)
      // Rule 2: Characters with team-wide outro buffs go FIRST (persist through swaps)
      // Rule 3: Characters with next-only outro buffs go immediately BEFORE the DPS
      //         (next-only buffs vanish when recipient swaps out, so only the last one reaches DPS)
      // Rule 4: If multiple next-only buffers, the one with higher total value goes last (closer to DPS)
      const dpsChar = mems.find(m => m.name === mainDps.name);
      const supports = mems.filter(m => m.name !== mainDps.name);

      // Classify supports by outro buff type
      const hasTeamOutro = (m) => {
        const bt = CHAR_BUFF_TABLE[m.name];
        if (!bt) return false;
        // Team-wide outro buffs persist through swaps (Verina, Shorekeeper, Baizhi, Mornye)
        return (bt.outroBuffs || []).some(b => b.target === 'team');
      };
      const nextOutroValue = (m) => {
        const bt = CHAR_BUFF_TABLE[m.name];
        if (!bt) return 0;
        return (bt.outroBuffs || []).filter(b => b.target === 'next' || b.target === 'enemy' || b.target === 'ally').reduce((s, b) => s + b.value, 0);
      };

      // Sort: team-wide outro first, then by next-outro value ascending (strongest last = closest to DPS)
      supports.sort((a, b) => {
        const aTeam = hasTeamOutro(a) ? 0 : 1;
        const bTeam = hasTeamOutro(b) ? 0 : 1;
        if (aTeam !== bTeam) return aTeam - bTeam; // team-wide outro goes first
        return nextOutroValue(a) - nextOutroValue(b); // stronger next-outro goes last (closer to DPS)
      });
      const ordered = dpsChar ? [...supports, dpsChar] : [...mems];
      // Calculate raw on-field times, then scale proportionally if total exceeds rotTime
      const raw = ordered.map(m => ({
        m, onField: m.d.onField ?? (m.name === mainDps.name ? 15 : 5),
      }));
      const totalRaw = raw.reduce((s, r) => s + r.onField, 0);
      const scale = totalRaw > rotTime ? rotTime / totalRaw : 1;

      const timeline = [];
      let t = 0;
      raw.forEach(({ m, onField: rawField }) => {
        const isMain = m.name === mainDps.name;
        const onField = Math.round(rawField * scale * 10) / 10; // scale + round to 0.1s
        timeline.push({ name: m.name, element: m.d.element, role: m.d.role, start: t, duration: onField });
        const bt = CHAR_BUFF_TABLE[m.name];
        if (bt) {
          (bt.outroBuffs || []).forEach(b => {
            if (b.target === 'next' || b.target === 'enemy' || b.target === 'ally') {
              const dur = b.duration || 14;
              buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t + onField, duration: dur });
            }
          });
          (bt.libBuffs || []).forEach(b => {
            if (b.target === 'team') {
              buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t, duration: b.duration || 25 });
            }
          });
          // CHAR_BUFF_TABLE uses duration: 99 or 999 as sentinels for "conditional passive, no
          // natural decay" (e.g. a Crit DMG bonus active in a stance, or on a periodic proc) — never
          // a literal 99/999-second timer. The real durations used anywhere in the table top out at
          // 30s, so >=90 is an unambiguous sentinel check. Rendered literally these blew the whole
          // chart's time scale out to ~100-1000s, squashing every real segment/buff into an
          // unreadable sliver. Since these are self-target and only matter while the character is
          // actually dealing damage, the correct display window is their own on-field time, same as
          // the default for an unspecified duration.
          (bt.selfBuffs || []).forEach(b => {
            const dur = (!b.duration || b.duration >= 90) ? onField : b.duration;
            buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t, duration: dur });
          });
          (bt.weaponBuffs || []).forEach(b => {
            const dur = (!b.duration || b.duration >= 90) ? onField : b.duration;
            buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t, duration: dur });
          });
        }

        // ── Hardcoded team-wide echo-set bonuses (TEAM_SET_BUFFS) — only counted in the DPS math
        // from non-main members' worn sets, so only render them from those same members here. ──
        if (!isMain) {
          (TEAM_SET_BUFFS[m.echoSetName] || []).forEach(e => {
            if (e.elem && e.elem !== (mainDps.d.element || '').toLowerCase()) return;
            buffs.push({ source: m.echoSetName, owner: m.name, stat: e.stat, value: e.value, start: 0, duration: rotTime });
          });
        }

        // ── Weapon "team value" (tv) passive — team-wide buff added straight to the stat
        // totals in the DPS math; render it the same way here so it isn't invisible. ──
        if (!isMain && m.weapon?.tv) {
          const tvRefLevel = (teamEquipment[teamIdx + ':' + m.name])?.refinement || 1;
          const tvRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[tvRefLevel - 1] || 1 : 1;
          const wt = m.weapon.tv;
          const tvDur = wt.duration || 15;
          Object.entries(wt).forEach(([stat, val]) => {
            if (stat === 'duration' || typeof val !== 'number') return;
            buffs.push({ source: m.weapName, owner: m.name, stat, value: Math.round(val * tvRefScale * 10) / 10, start: t, duration: tvDur });
          });
        }

        // ── Echo set p5 timed buffs ──
        if (m.echoSet) {
          const setName = m.echoSetName;
          const p5 = m.echoSet.p5 || '';
          const p5v = m.echoSet.p5val || {};
          // Outro-triggered echo set buffs (fire when character swaps out)
          if (p5.includes('Outro')) {
            Object.entries(p5v).forEach(([stat, val]) => {
              if (stat === 'outroDmg') return; // raw damage, not a buff
              buffs.push({ source: `${setName}`, owner: m.name, stat, value: val, start: t + onField, duration: 14 });
            });
          }
          // Intro-triggered echo set buffs (fire when character swaps in)
          else if (p5.includes('Intro')) {
            Object.entries(p5v).forEach(([stat, val]) => {
              buffs.push({ source: `${setName}`, owner: m.name, stat, value: val, start: t, duration: onField });
            });
          }
          // Liberation-triggered echo set buffs
          else if (p5.includes('Liberation') || p5.includes('Lib')) {
            Object.entries(p5v).forEach(([stat, val]) => {
              buffs.push({ source: `${setName}`, owner: m.name, stat, value: val, start: t, duration: 35 });
            });
          }
          // Heal-triggered team buffs
          else if (p5.includes('Heal') && p5v.teamAtk) {
            buffs.push({ source: `${setName}`, owner: m.name, stat: 'atkPct', value: p5v.teamAtk, start: t, duration: 20 });
          }
          // On-field stacking buffs (active during field time only)
          else if (p5.includes('max x') || p5.includes('stack')) {
            Object.entries(p5v).forEach(([stat, val]) => {
              buffs.push({ source: `${setName}`, owner: m.name, stat, value: val, start: t, duration: onField });
            });
          }
        }

        // ── Weapon passive timed buffs ──
        if (m.weapon?.pv) {
          const wpn = m.weapon;
          const passive = wpn.passive || '';
          // Weapons with on-hit/on-skill stacking buffs — active during field time
          if (passive.includes('stack') || passive.includes('grant') || passive.includes('use')) {
            Object.entries(wpn.pv).forEach(([stat, val]) => {
              buffs.push({ source: m.weapName, owner: m.name, stat, value: val, start: t, duration: onField });
            });
          }
        }

        // ── 4-cost echo active skill buffs ──
        // Gated to mirror exactly what the DPS math counts (see the two ECHO_SKILL_BUFFS
        // consumption sites above): a 'self' buff is only ever added to the stat totals for
        // the main DPS's own echo; 'team'/'next' buffs are only added from non-main members.
        // Rendering anything outside that would show a bar the DPS number never actually used.
        const esbCountedForMath = m.mainEchoName && (() => {
          const t = ECHO_SKILL_BUFFS[m.mainEchoName]?.target || 'self';
          return isMain ? t === 'self' : (t === 'team' || t === 'next');
        })();
        if (m.mainEchoName && esbCountedForMath) {
          const esb = ECHO_SKILL_BUFFS[m.mainEchoName];
          if (esb) {
            const echoLabel = m.mainEchoName.length > 18 ? m.mainEchoName.split(/[:\s-]+/).slice(0, 2).join(' ') : m.mainEchoName;
            const target = esb.target || 'self';
            if (target === 'next') {
              // Outro-triggered echo buff → fires when character swaps out, applies to next
              esb.buffs.forEach(b => {
                if (esb.condition && !m.name.includes(esb.condition)) return;
                buffs.push({ source: echoLabel, owner: m.name, stat: b.stat, value: b.value, start: t + onField, duration: esb.duration || 15, type: 'echo' });
              });
            } else if (target === 'team') {
              // Team-wide buff → active during field time, persists for duration
              esb.buffs.forEach(b => {
                if (esb.condition && !m.name.includes(esb.condition)) return;
                buffs.push({ source: echoLabel, owner: m.name, stat: b.stat, value: b.value, start: t, duration: esb.duration || 15, type: 'echo' });
              });
            } else if (esb.passive) {
              // Passive main-slot buff → always active during field time
              esb.buffs.forEach(b => {
                if (esb.condition && !m.name.includes(esb.condition)) return;
                buffs.push({ source: echoLabel, owner: m.name, stat: b.stat, value: b.value, start: t, duration: onField, type: 'echo' });
              });
            } else {
              // Standard active skill buff → used during field time
              esb.buffs.forEach(b => {
                if (esb.condition && !m.name.includes(esb.condition)) return;
                buffs.push({ source: echoLabel, owner: m.name, stat: b.stat, value: b.value, start: t, duration: Math.min(esb.duration || 15, onField + 5), type: 'echo' });
              });
            }
          }
        }

        t += onField;
      });

      // ── Rotation blocks — Prydwen-style: one self-contained block per character (what THEY do
      // on field, independent of the rest of the team), plus what it hands off to / inherits from
      // its neighbors in the sequence, so the whole team rotation reads as a chain of blocks rather
      // than one flat, undifferentiated buff dump. One block per on-field window, in the order
      // actually computed above. ──
      const fmtBuff = (b) => `+${b.value}% ${STAT_LABELS_FULL[b.stat] || b.stat}${b.duration ? ` (${b.duration}s)` : ''}`;
      const steps = timeline.map((seg, i) => {
        const isDps = seg.name === mainDps.name;
        const reason = isDps
          ? 'Main DPS — comes on-field last to receive every buff stacked up before it'
          : hasTeamOutro(mems.find(m => m.name === seg.name))
            ? 'Team-wide buff persists through swaps — goes first so it covers the whole rotation'
            : nextOutroValue(mems.find(m => m.name === seg.name)) > 0
              ? 'Buff only reaches whoever swaps in next — placed right before the DPS window'
              : 'Sub-DPS / utility window';
        const own = buffs.filter(b => (b.owner || b.source) === seg.name);
        // Self: fires and is fully spent during this character's own on-field window (Liberation,
        // selfBuffs, weapon/echo passives while they're the one attacking).
        const selfActive = [...new Set(
          own.filter(b => b.start < seg.start + seg.duration - 0.05).map(fmtBuff)
        )];
        // Hands off: starts at/after they leave the field — this is the block's outbound link to
        // whichever block comes next (outro buffs, echo outro procs).
        const handsOff = [...new Set(
          own.filter(b => b.start >= seg.start + seg.duration - 0.05).map(fmtBuff)
        )];
        // Inherits: buffs from an earlier block still active when this one starts — the block's
        // inbound link, i.e. how it adapts to whatever the team set up before it.
        const inherits = [...new Set(
          buffs.filter(b => (b.owner || b.source) !== seg.name && b.start <= seg.start + 0.05 && b.start + b.duration > seg.start + 0.05)
            .map(fmtBuff)
        )];
        // Verified skill-by-skill sequence from Prydwen.gg's "Standard Rotation" guides — real
        // combat data, not derived from CHAR_BUFF_TABLE like the rest of this block. CHARACTER_ROTATIONS
        // (type/skill/note per step, 56 of 58 characters) is the richer, actively-maintained dataset —
        // prefer it over the older CHARACTER_DATA[name].rotation plain-string array, which only exists
        // for ~10 legacy entries and lacks per-step notes/type tagging. Both are normalized to the same
        // {type, skill, note} shape so the rendering below doesn't need to know which source it got.
        const richSequence = CHARACTER_ROTATIONS[seg.name];
        const legacySequence = CHARACTER_DATA[seg.name]?.rotation;
        const skillSequence = richSequence || (legacySequence ? legacySequence.map(s => ({ type: 'Step', skill: s })) : null);
        return { order: i + 1, name: seg.name, role: seg.role, element: seg.element, duration: seg.duration, isDps, reason, selfActive, handsOff, inherits, skillSequence };
      });

      return { segments: timeline, buffs, totalTime: rotTime, steps };
    })();

    // Add energy warnings
    mems.forEach(m => {
      const ecf = energyCycleFactors[m.name];
      if (ecf && ecf.libUptime < 0.9) {
        warnings.push(`${m.name}: low ER (${Math.round(ecf.totalER)}%) — Liberation uptime ${Math.round(ecf.libUptime * 100)}%`);
      }
    });

    return { members: mems, mainDps, allBuffs, allDebuffs, effAtk, critRate: cr, critDmg: cd, elemDmg, skillDmg, amplify, deepen, atkPct, defShred, resShred, defIgnore, avgCrit, defMult, resMult, score, soloDps, teamDps, synergyUplift, dotDps, hasFrazzle, hasErosion, hasFusionBurst, hasElectroFlare, dmgSources, energyCycleFactors, warnings, memberDps, rotationTimeline, rotTime,
      // Legacy aliases for DPSComparisonCard compatibility
      rawDps: soloDps, realDps: teamDps, perfectDps: teamDps, synergy: Math.min(100, Math.max(0, synergyUplift)) };
}
