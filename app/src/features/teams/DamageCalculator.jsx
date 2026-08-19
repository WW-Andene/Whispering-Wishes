import React, { useState, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, BarChart3, ChevronDown, Diamond, ListOrdered, Sword, Users, X, Zap } from 'lucide-react';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS } from '../../data/characters.js';
import { WEAPON_DATA } from '../../data/weapons.js';
import { ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ECHO_DATA, ECHO_SKILL_BUFFS, getEnemyStatsAtLevel } from '../../data/echoes.js';
import { WEAPON_REFINE_SCALE } from '../../data/constants.js';
import {
  ATTACKER_FACTOR, BASE_CRIT_RATE, BASE_CRIT_DMG,
  ECHO_MAIN_STAT_VALUES, ECHO_SUB_STAT_VALUES, ECHO_FLAT_SUB_STAT_VALUES,
  createStats, parsePassive, getWeaponPv, applyWeaponPv,
  applyFullEchoSet, applyEchoStats, applyBuff,
  countTeamElements, routeTypeBonuses, applyResonanceChain,
  calcDefMult, calcResMult, calcAvgCrit, calcDmgBonus,
  calcFrazzleDmg, calcErosionDmg, calcFusionBurstDmg, calcElectroFlareDmg, calcTuneBreakDmg,
  calcEnergyCycles,
  isHealerRole,
} from './calcEngine.js';
import { haptic, getElementColor, getElementBg, getElementBorder, getElementShape, getElementIcon, getSetIcon, getWeaponTypeIcon, getStatIcon, getCombatRoleIcon } from '../../utils/helpers.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { EchoImage } from '../../shared/components/EchoImage.jsx';
import RotationTimeline, { STAT_LABELS, STAT_LABELS_FULL, stepStyle } from './RotationTimeline.jsx';
import { useSessionState } from '../../utils/useSessionState.js';
import DPSComparisonCard from './DPSComparisonCard.jsx';
import EnemyEchoSelectorModal from './EnemyEchoSelectorModal.jsx';
import MonsterCard from '../../shared/components/MonsterCard.jsx';

// Hardcoded team-wide echo-set bonuses that don't come from a per-member p5val (WuWa sets whose
// team ATK/DMG bonus is an approximated flat number rather than a modeled trigger). Kept as a single
// table so the DPS math and the rotation timeline read the exact same numbers instead of drifting —
// previously these were only added to the stat totals and never shown as a buff bar on the timeline.
const TEAM_SET_BUFFS = {
  'Rejuvenating Glow': [{ stat: 'atkPct', value: 15 }],
  'Moonlit Clouds': [{ stat: 'atkPct', value: 22.5 }],
  'Empyrean Anthem': [{ stat: 'atkPct', value: 30 }], // 20% ATK × 2 stacks, ~75% uptime ≈ 30%
  'Tidebreaking Courage': [{ stat: 'elemDmg', value: 30 }], // 30% All-Attr DMG team-wide at ≥250% ER
  'Halo of Starry Radiance': [{ stat: 'atkPct', value: 25 }], // Up to +25% ATK via Off-Tune healing
  'Pact of Neonlight Leap': [{ stat: 'atkPct', value: 30 }], // +15% base + up to 15% from Tune Break Boost
  'Gusts of Welkin': [{ stat: 'elemDmg', value: 30, elem: 'aero' }], // 15% + 15% Aero DMG on Erosion trigger
  'Windward Pilgrimage': [{ stat: 'elemDmg', value: 15, elem: 'aero' }],
  'Flaming Clawprint': [{ stat: 'elemDmg', value: 15, elem: 'fusion' }, { stat: 'libDmg', value: 20 }],
  'Midnight Veil': [{ stat: 'elemDmg', value: 15, elem: 'havoc' }],
  'Chromatic Foam': [{ stat: 'elemDmg', value: 25, elem: 'fusion' }], // Outro: +25% Fusion for next
};

// Maps CHARACTER_DATA.dmgFocus's short tags to the long-form wiki tag names COMBAT_ROLE_ICONS
// is keyed by — same mapping CollectionTab/CharacterDetailModal use for the "All Damage" filter
// and Combat Role badges, so this section's icons match the rest of the app instead of drifting.
const DMG_FOCUS_ROLE_TAG = {
  'Basic ATK': 'Basic Attack Damage',
  'Heavy ATK': 'Heavy Attack Damage',
  'Skill': 'Resonance Skill Damage',
  'Liberation': 'Resonance Liberation Damage',
  'Echo': 'Echo Skill Damage',
  'Coordinated ATK': 'Coordinated Attack',
};

const DamageCalculator = forwardRef(function DamageCalculator({
  teamEquipment,
  setTeamEquipment,
  state,
  collectionImages,
  teamCompareEntries,
  setTeamCompareEntries,
  confirm,
  onOpenWeaponSelector,
  onOpenEchoSelector,
  onOpenEchoStatPanel,
}, ref) {
  const [enemyLevel, setEnemyLevel] = useState(90);
  const [enemyEcho, setEnemyEcho] = useState('');
  const [enemyEchoModalOpen, setEnemyEchoModalOpen] = useState(false);
  const [enemyEchoSearch, setEnemyEchoSearch] = useState('');
  const [enemyEchoCostFilter, setEnemyEchoCostFilter] = useState('all');
  const [enemyEchoSetFilter, setEnemyEchoSetFilter] = useState('all');
  const [enemyEchoBuffFilter, setEnemyEchoBuffFilter] = useState('all');

  // ── Reusable calculator with proper WuWa damage formula ──
  // Memoized so it only recalculates when teamEquipment changes.
  const calcTeamStats = useCallback((slots, teamIdx, mainDpsOverride) => {
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
    // "Training Dummy" (enemyEcho === '') keeps the original generic level-only formula/0-baseline
    // behavior unchanged. A selected boss echo overrides DEF with its real stat at the chosen
    // enemyLevel (getEnemyStatsAtLevel, full 1-120 per-boss curve) when known, and RES with its full
    // per-element map (enemyStats.res) instead of the old single-element enemyRes lookup.
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
    if (mainDps.weapSubstat === 'Energy Regen') atkPct += 8;

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
    let dotDmgPerRotation = 0;
    const frazzleResult = calcFrazzleDmg(mems, rotTime, defMult, resMult);
    const erosionResult = calcErosionDmg(mems, rotTime, defMult, resMult);
    const fusionBurstResult = calcFusionBurstDmg(mems, rotTime, defMult, resMult);
    const electroFlareResult = calcElectroFlareDmg(mems, rotTime, defMult, resMult);
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
  }, [teamEquipment, enemyLevel, enemyEcho]);

  // Expose calcTeamStats to parent via ref
  useImperativeHandle(ref, () => ({ calcTeamStats }), [calcTeamStats]);

  // Memoize active team stats
  const activeTeamData = state.teams?.[state.activeTeamIndex] || state.teams?.[0] || { name: 'Team 1', slots: [null, null, null] };
  const activeTeamStats = useMemo(() =>
    calcTeamStats(activeTeamData.slots, state.activeTeamIndex, activeTeamData.mainDpsOverride),
    [calcTeamStats, activeTeamData.slots, state.activeTeamIndex, activeTeamData.mainDpsOverride]
  );

  const [overviewCollapsed, setOverviewCollapsed] = useSessionState('ww-team-overview-collapsed', false);

  const stats = activeTeamStats;

  // Enemy Target — drives enemyDef90/enemyResMap in calcTeamStats above, so it's rendered
  // unconditionally (both with and without a team set) rather than only inside DPSComparisonCard,
  // which is gated behind "+ Compare", or only alongside Team Overview, which needs a team. Shows
  // the boss's real icon and full HP/ATK/DEF/RES card (via MonsterCard, stats stacked below the
  // icon/name row) instead of a bare DEF number. No boss selected falls back to a nameless "no
  // target" state with just the level-formula DEF — there's no "Training Dummy" boss to pick since
  // it isn't an actual enemy.
  const enemyTargetEd = enemyEcho ? ECHO_DATA[enemyEcho] : null;
  const enemyTargetIcon = enemyEcho ? (collectionImages[enemyEcho] || enemyTargetEd?.monsterIconUrl || enemyTargetEd?.iconUrl) : null;
  const enemyTargetStats = enemyEcho
    ? enemyTargetEd?.enemyStats
    : { level: enemyLevel, hp: null, atk: null, def: 792 + 8 * (Number(enemyLevel) || 90), res: {} };
  const enemyTargetCard = (
    <Card>
      <CardBody>
        <div className="flex items-center gap-2 mb-2">
          <Sword size={12} className="text-red-400 shrink-0" />
          <span className="text-gray-400 text-sm font-medium shrink-0">Target</span>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-gray-500 text-sm">Lv.</span>
            <input type="text" inputMode="numeric" value={enemyLevel}
              onFocus={e => e.target.select()}
              onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v === '') { setEnemyLevel(''); return; } const n = parseInt(v, 10); setEnemyLevel(Number.isNaN(n) ? 90 : Math.max(1, Math.min(120, n))); }}
              onBlur={e => { if (!e.target.value || isNaN(parseInt(e.target.value, 10))) setEnemyLevel(90); }}
              className="kuro-input w-14 text-sm px-1 py-0.5 text-center" />
            <span className="text-gray-600 text-sm">/ 120</span>
          </div>
        </div>
        <MonsterCard
          name={enemyEcho || 'No Target Selected (Default)'}
          iconUrl={enemyTargetIcon}
          enemyStats={enemyTargetStats}
          level={enemyLevel}
          onClick={() => { setEnemyEchoSearch(''); setEnemyEchoModalOpen(true); }}
        />
      </CardBody>
    </Card>
  );
  const enemyTargetModal = (
    <EnemyEchoSelectorModal
      isOpen={enemyEchoModalOpen} onClose={() => setEnemyEchoModalOpen(false)}
      enemyEcho={enemyEcho} setEnemyEcho={setEnemyEcho}
      enemyLevel={enemyLevel} setEnemyLevel={setEnemyLevel}
      collectionImages={collectionImages}
      search={enemyEchoSearch} setSearch={setEnemyEchoSearch}
      costFilter={enemyEchoCostFilter} setCostFilter={setEnemyEchoCostFilter}
      setFilter={enemyEchoSetFilter} setSetFilter={setEnemyEchoSetFilter}
      buffFilter={enemyEchoBuffFilter} setBuffFilter={setEnemyEchoBuffFilter}
    />
  );

  if (!stats) return (
    <>
      {enemyTargetCard}
      <Card><CardBody className="text-center py-6">
        <Users size={24} className="mx-auto mb-2 text-gray-500" />
        <p className="text-gray-400 text-sm">Add Resonators to your team to see damage analysis</p>
      </CardBody></Card>
      {enemyTargetModal}
    </>
  );
  const { members, mainDps, allBuffs, allDebuffs, effAtk, critRate: cr, critDmg: cd, elemDmg, skillDmg, amplify, deepen, atkPct, defShred, resShred, defIgnore, avgCrit, score, soloDps, teamDps, synergyUplift, dmgSources, warnings, memberDps, rotationTimeline } = stats;
  const roleColors = { 'Main DPS': { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }, 'Sub DPS': { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' }, Support: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' }, Healer: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' } };

  return (
    <>
      {enemyTargetCard}

      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setOverviewCollapsed(p => !p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOverviewCollapsed(p => !p); } }} aria-expanded={!overviewCollapsed}>
          <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${overviewCollapsed ? '' : 'rotate-180'}`} />}><Zap size={14} className="text-yellow-400" /> Team Overview</CardHeader>
        </div>
        {!overviewCollapsed && (
        <CardBody>
          <div className="space-y-3">
            {/* Per-member: overview + damage breakdown */}
            {members.map((m) => {
              const rarity5 = m.d.rarity === 5;
              const rc = roleColors[m.d.role] || roleColors.Support;
              const isMain = m.name === mainDps.name;
              return (
                <div key={m.name} className="p-3 rounded-lg border hover:border-white/15 transition-colors space-y-2 team-member-card"
                  style={{ background: 'var(--bg-stat)', borderColor: `${getElementColor(m.d.element)}25`, boxShadow: `0 0 12px ${getElementColor(m.d.element)}10`, '--element-glow': `${getElementColor(m.d.element)}30` }}>

                  {/* ── Section 1: Character Header ── */}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-11 h-12 rounded-lg overflow-hidden border border-white/15 flex-shrink-0${rarity5 ? ' holo-5star' : ''}`}
                      style={{ background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                      {collectionImages[m.name] ? (
                        <img src={collectionImages[m.name]} alt={m.name} className="w-full h-full object-cover object-top breath-zoom" onError={hideOnError} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">{m.name[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white text-xl font-semibold">{m.name}</span>
                        <span className={`text-sm ${rarity5 ? 'text-yellow-400' : 'text-purple-400'}`}>{rarity5 ? '★★★★★' : '★★★★'}</span>
                      </div>
                      <div className="flex items-center flex-wrap gap-1 mt-1">
                        <span className={`kuro-badge ${rc.bg} ${rc.border} ${rc.text} font-medium`}>{m.d.role}</span>
                        <span className="kuro-badge font-medium"
                          style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                          {getElementIcon(m.d.element) && <img src={getElementIcon(m.d.element)} alt="" className="w-3.5 h-3.5 inline-block align-middle mr-0.5" onError={hideOnError} />}
                          {getElementShape(m.d.element)}{getElementShape(m.d.element) ? ' ' : ''}{m.d.element}
                        </span>
                        <span className="text-sm text-gray-500 inline-flex items-center gap-1">
                          {getWeaponTypeIcon(m.d.weapon) && <img src={getWeaponTypeIcon(m.d.weapon)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                          {m.d.weapon}
                        </span>
                      </div>
                    </div>
                    {/* Auto Equip button */}
                    {(() => {
                      const aeqKey = state.activeTeamIndex + ':' + m.name;
                      return (
                        <button
                          className="kuro-btn text-sm px-2 py-1 flex-shrink-0 self-start"
                          aria-label={`Auto equip best build for ${m.name}`}
                          onClick={() => {
                            const d = m.d;
                            if (!d) return;
                            const weapon = d.bestWeapon && WEAPON_DATA[d.bestWeapon] ? d.bestWeapon : null;
                            const recSets = new Map();
                            const directEchoes = new Set();
                            (d.bestEchoes || []).forEach(entry => {
                              [...ALL_4COST_ECHOES, ...ALL_3COST_ECHOES, ...ALL_1COST_ECHOES].forEach(en => {
                                if (entry.toLowerCase().includes(en.toLowerCase())) directEchoes.add(en);
                              });
                              entry.split('+').forEach(part => {
                                const trimmed = part.trim();
                                const pcMatch = trimmed.match(/^(.+?)\s+(\d+)pc$/i);
                                if (pcMatch && ECHO_SETS[pcMatch[1].trim()]) {
                                  recSets.set(pcMatch[1].trim(), parseInt(pcMatch[2], 10));
                                } else {
                                  const plain = trimmed.replace(/\s+\d+pc$/i, '').trim();
                                  if (ECHO_SETS[plain]) recSets.set(plain, 5);
                                }
                              });
                            });
                            // Read the current echo preset to assign appropriate mainStats
                            const currentEq = teamEquipment[aeqKey];
                            const preset = currentEq?.echoPreset || 'default';
                            const scaling = d.statScaling || 'ATK';
                            const scalingStat = scaling === 'HP' ? 'HP%' : scaling === 'DEF' ? 'DEF%' : 'ATK%';
                            const elDmgKey = d.element ? d.element.charAt(0).toUpperCase() + d.element.slice(1).toLowerCase() + ' DMG' : '';
                            // Preset-aware mainStat assignment per echo cost slot
                            const getMainStat = (cost) => {
                              if (preset === 'er') {
                                if (cost === 4) return 'Energy Regen';
                                if (cost === 3) return 'Energy Regen';
                                return scalingStat;
                              }
                              if (preset === 'support') {
                                if (cost === 4) return isHealerRole(d.role) ? 'Healing Bonus' : 'Energy Regen';
                                if (cost === 3) return elDmgKey || scalingStat;
                                return scaling === 'HP' ? 'HP%' : scalingStat;
                              }
                              // default: ATK/Crit DPS build
                              if (cost === 4) return 'Crit Rate';
                              if (cost === 3) return elDmgKey || scalingStat;
                              return scalingStat;
                            };
                            // Preset-aware substat assignment
                            const getSubstats = () => {
                              if (preset === 'er') return ['Energy Regen', scalingStat, 'Crit Rate', 'Crit DMG', scalingStat];
                              if (preset === 'support') return [scalingStat, 'Energy Regen', 'Crit Rate'];
                              return [scalingStat, 'Crit Rate', 'Crit DMG', scalingStat, 'Crit DMG'];
                            };
                            const defaultSubs = getSubstats();
                            const newEchoes = [null, null, null, null, null];
                            const usedNames = new Set();
                            // Two independent selection concerns for the low-cost slots, checked in
                            // priority order — element match matters far more than "purity":
                            //
                            // 1. ELEMENT MATCH (primary): most 3-cost/1-cost echoes are Elite/Common-class
                            // monster echoes with an own active-skill DMG type (ECHO_DATA[name].buff, e.g.
                            // 'Glacio DMG') that's independent of which sonata set(s) they carry. That
                            // active-skill damage is a real, calculated DPS contributor (see echoActiveDmg
                            // in this file) that uses the ECHO's OWN element for RES lookups — an
                            // off-element echo gets none of the character's own elemental DMG buffs and is
                            // a real, measurable DPS loss, not just a thematic mismatch. Verified this was
                            // happening roster-wide (e.g. a Fusion character auto-equipped with an
                            // Electro-DMG echo) because the old logic picked purely by set membership with
                            // zero regard for the echo's own damage type. A 'Healing' buff tag is only
                            // considered a match for Healer/Support roles — a pure DPS has no use for it.
                            //
                            // 2. PURITY (secondary, since almost no 3-cost/1-cost echo is single-set by
                            // design — that's normal, not a bug): among element-matched candidates, still
                            // prefer one whose entire set list stays within what's actually being targeted.
                            //
                            // Falls back to the plain "any echo carrying this set" pick only if nothing in
                            // the tier matches the character's element at all, so a slot is never left
                            // empty over an unmatched preference.
                            const pickEcho = (tierList, setPrefs) => {
                              for (const name of tierList) { if (!usedNames.has(name) && directEchoes.has(name)) { usedNames.add(name); return name; } }
                              const wanted = new Set(setPrefs.keys());
                              const charEl = (d.element || '').toLowerCase();
                              // A 'Healing' echo is only justified for a character who can actually
                              // heal — a pure buff-Support (no healing) has no more use for it than a
                              // DPS does, so this checks healer capability specifically, not any
                              // Support-adjacent role. isHealerRole covers compound roles too (Chisa/
                              // Suisui's 'Support/Healer').
                              const isRoleForHealing = isHealerRole(d.role);
                              const matchesElement = (ed) => {
                                const buffs = ed?.buff ? (Array.isArray(ed.buff) ? ed.buff : [ed.buff]) : [];
                                if (buffs.length === 0) return true; // no tagged damage type — don't penalize
                                return buffs.every(b => {
                                  if (b === 'Healing') return isRoleForHealing;
                                  if (b === 'Shield' || b === 'Physical DMG') return true; // universal/neutral
                                  if (/ DMG$/.test(b)) return b.toLowerCase().startsWith(charEl);
                                  return true;
                                });
                              };
                              for (const [setName] of setPrefs) {
                                let bestElemMatch = null, bestPure = null, anyMatch = null;
                                for (const name of tierList) {
                                  if (usedNames.has(name)) continue;
                                  const ed = ECHO_DATA[name];
                                  if (!ed?.sets?.includes(setName)) continue;
                                  if (!anyMatch) anyMatch = name;
                                  const elemOk = matchesElement(ed);
                                  const pure = ed.sets.every(s => wanted.has(s));
                                  if (elemOk && pure) { usedNames.add(name); return name; }
                                  if (elemOk && !bestElemMatch) bestElemMatch = name;
                                  if (!elemOk && pure && !bestPure) bestPure = name;
                                }
                                const chosen = bestElemMatch || bestPure || anyMatch;
                                if (chosen) { usedNames.add(chosen); return chosen; }
                              }
                              return null;
                            };
                            const e0 = pickEcho(ALL_4COST_ECHOES, recSets);
                            if (e0) newEchoes[0] = { name: e0, mainStat: getMainStat(4), substats: defaultSubs.slice(0, 5) };
                            for (let i = 1; i <= 2; i++) { const e = pickEcho(ALL_3COST_ECHOES, recSets); if (e) newEchoes[i] = { name: e, mainStat: getMainStat(3), substats: defaultSubs.slice(0, 5) }; }
                            for (let i = 3; i <= 4; i++) { const e = pickEcho(ALL_1COST_ECHOES, recSets); if (e) newEchoes[i] = { name: e, mainStat: getMainStat(1), substats: defaultSubs.slice(0, 5) }; }
                            let echoSetVal = '';
                            let echoSet2Val = '';
                            const recSetKeys = [...recSets.keys()];
                            if (recSetKeys.length > 0) echoSetVal = recSetKeys[0];
                            if (recSetKeys.length > 1) echoSet2Val = recSetKeys[1];
                            setTeamEquipment(prev => {
                              const n = { ...prev };
                              n[aeqKey] = { ...(n[aeqKey] || {}), weapon: weapon || (n[aeqKey]?.weapon || null), echoes: newEchoes, echoSet: echoSetVal, echoSet2: echoSet2Val, echoPreset: preset, sequence: n[aeqKey]?.sequence || 0 };
                              return n;
                            });
                            haptic.success();
                          }}
                        >
                          <Zap size={10} className="inline mr-0.5" />Auto Equip
                        </button>
                      );
                    })()}
                    {/* Reset Equipment button */}
                    {(() => {
                      const reqKey = state.activeTeamIndex + ':' + m.name;
                      const hasEquip = teamEquipment[reqKey] && (teamEquipment[reqKey].weapon || (teamEquipment[reqKey].echoes || []).some(e => e));
                      if (!hasEquip) return null;
                      return (
                        <button
                          className="kuro-btn text-sm px-2 py-1 flex-shrink-0 self-start text-gray-500 hover:text-red-400"
                          aria-label={`Reset equipment for ${m.name}`}
                          onClick={async () => {
                            if (await confirm?.({ title: 'Reset Equipment', message: `Clear all equipment for ${m.name}?`, confirmLabel: 'Reset', destructive: true })) {
                              setTeamEquipment(prev => {
                                const n = { ...prev };
                                n[reqKey] = { weapon: null, echoes: [null, null, null, null, null], sequence: prev[reqKey]?.sequence || 0, refinement: 1, echoSet: '', echoSet2: '', echoPreset: 'default' };
                                return n;
                              });
                              haptic.light();
                            }
                          }}
                        >
                          <X size={10} className="inline mr-0.5" />Reset
                        </button>
                      );
                    })()}
                  </div>

                  {/* ── Section 2: Base Stats ── */}
                  <div>
                    <div className="kuro-label">Base Stats (Lv.90)</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="kuro-badge kuro-badge-neutral">HP {(m.d.baseHp || 0).toLocaleString('en-US')}</span>
                      <span className="kuro-badge kuro-badge-neutral">ATK {m.charAtk}</span>
                      <span className="kuro-badge kuro-badge-neutral">DEF {(m.d.baseDef || 0).toLocaleString('en-US')}</span>
                      <span className="kuro-badge kuro-badge-amber">+Weapon {m.weapAtk}</span>
                    </div>
                  </div>

                  {/* ── Section 3: Equipment & Build ── */}
                  {(() => {
                    const eqKey = state.activeTeamIndex + ':' + m.name;
                    const eq = teamEquipment[eqKey] || { weapon: null, echoes: [null, null, null, null, null] };
                    const equippedWeap = eq.weapon ? WEAPON_DATA[eq.weapon] : null;
                    const slotStyle = 'w-10 h-10 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all text-center relative overflow-hidden';
                    return (
                      <div className="space-y-2">
                        {/* Equipment grid + Weapon info */}
                        <div>
                          <div className="kuro-label">Equipment</div>
                          <div className="flex items-start gap-2">
                            <div className="grid grid-cols-3 gap-1 flex-shrink-0">
                              {/* Weapon slot */}
                              <div
                                className={`${slotStyle} ${equippedWeap ? (equippedWeap.rarity === 5 ? 'border-yellow-500/40 bg-yellow-500/8 holo-5star' : 'border-purple-500/40 bg-purple-500/8') : 'border-dashed border-white/15 hover:border-yellow-500/40'}`}
                                onClick={() => {
                                  onOpenWeaponSelector(state.activeTeamIndex, m.name);
                                  haptic.light();
                                }}
                                title={eq.weapon || 'Select weapon'}
                              >
                                {equippedWeap && collectionImages[eq.weapon] ? (
                                  <img src={collectionImages[eq.weapon]} alt={eq.weapon} className="w-full h-full object-cover rounded-lg" onError={hideOnError} />
                                ) : equippedWeap ? (
                                  <>
                                    <Sword size={14} className={equippedWeap.rarity === 5 ? 'text-yellow-400' : 'text-purple-400'} />
                                    <span className="text-sm text-gray-300 truncate w-full px-0.5 leading-tight mt-0.5">{eq.weapon.split(' ').slice(0, 2).join(' ')}</span>
                                  </>
                                ) : (
                                  <>
                                    <Sword size={14} className="text-gray-500" />
                                    <span className="text-sm text-gray-500">Weapon</span>
                                  </>
                                )}
                              </div>
                              {/* 5 Echo slots */}
                              {[0, 1, 2, 3, 4].map(ei => {
                                const echoEntry = eq.echoes?.[ei];
                                const echoName = typeof echoEntry === 'object' && echoEntry ? echoEntry.name : (typeof echoEntry === 'string' ? echoEntry : null);
                                const echoData = echoName ? ECHO_DATA[echoName] : null;
                                const costLabel = ei === 0 ? '4-cost' : ei < 3 ? '3-cost' : '1-cost';
                                const costNum = ei === 0 ? 4 : ei < 3 ? 3 : 1;
                                const costColor = costNum === 4 ? 'yellow' : costNum === 3 ? 'purple' : 'cyan';
                                return (
                                  <div key={ei}
                                    className={`${slotStyle} ${echoName ? `border-${costColor}-500/40 bg-${costColor}-500/8` : 'border-dashed border-white/15 hover:border-' + costColor + '-500/40'}`}
                                    title={echoName || `Select ${costLabel} echo`}
                                    onClick={() => {
                                      if (echoName) {
                                        onOpenEchoStatPanel(state.activeTeamIndex, m.name, ei, echoName);
                                      } else {
                                        onOpenEchoSelector(state.activeTeamIndex, m.name, ei);
                                      }
                                      haptic.light();
                                    }}
                                  >
                                    {echoName && collectionImages[echoName] ? (
                                      <EchoImage src={collectionImages[echoName]} alt={echoName} className="w-full h-full object-cover rounded-lg" noBgProcess={ECHO_DATA[echoName]?.noBgProcess} />
                                    ) : echoName ? (
                                      <>
                                        <Diamond size={12} className={`text-${costColor}-400`} />
                                        <span className={`text-sm text-${costColor}-400 truncate w-full px-0.5 leading-tight`}>{echoName.split(' ').slice(0, 2).join(' ')}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Diamond size={12} className="text-gray-500" />
                                        <span className="text-sm text-gray-500">{costLabel}</span>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {/* Weapon & Echo info beside grid */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              {equippedWeap ? (
                                <div className="text-sm space-y-0.5">
                                  <div className="text-yellow-400/80 font-medium truncate">{eq.weapon}</div>
                                  <div className="text-gray-500">{equippedWeap.stat} {equippedWeap.subStatValue}</div>
                                </div>
                              ) : m.d.bestWeapon ? (
                                <div className="text-sm space-y-0.5">
                                  <div><span className="text-gray-500">Rec: </span><span className="text-yellow-400/50">{m.d.bestWeapon}</span></div>
                                  {m.d.bestEchoes && <div className="text-cyan-400/50">{m.d.bestEchoes.join(' + ')}</div>}
                                </div>
                              ) : null}
                              {/* Echo summary */}
                              {(() => {
                                const equipped = (eq.echoes || []).filter(e => e != null);
                                if (equipped.length === 0) return null;
                                const echoNames = equipped.map(e => typeof e === 'object' ? e.name : e).filter(Boolean);
                                const setCounts = {};
                                echoNames.forEach(n => {
                                  const ed = ECHO_DATA[n];
                                  if (ed?.sets) ed.sets.forEach(s => { setCounts[s] = (setCounts[s] || 0) + 1; });
                                });
                                const activeSets = Object.entries(setCounts).filter(([, c]) => c >= 2);
                                // All unique sets from equipped echoes (for manual override)
                                const allDetectedSets = [...new Set(echoNames.flatMap(n => ECHO_DATA[n]?.sets || []))];
                                const currentActiveSet = eq.echoSet || (activeSets[0]?.[0] || '');
                                return (
                                  <div className="text-sm mt-1 space-y-0.5">
                                    <div className="text-cyan-400/70">{equipped.length}/5 echoes</div>
                                    {activeSets.length > 0 ? activeSets.map(([setName, count]) => {
                                      const isForced = eq.echoSet === setName;
                                      return (
                                        <div key={setName} className={`text-gray-500 inline-flex items-center gap-1 ${allDetectedSets.length > 1 ? 'cursor-pointer hover:text-white' : ''}`}
                                          title={allDetectedSets.length > 1 ? 'Click to set as active echo set' : ''}
                                          onClick={allDetectedSets.length > 1 ? () => {
                                            const eqk = state.activeTeamIndex + ':' + m.name;
                                            setTeamEquipment(prev => {
                                              const n = { ...prev };
                                              n[eqk] = { ...(n[eqk] || {}), echoSet: setName };
                                              return n;
                                            });
                                            haptic.light();
                                          } : undefined}>
                                          {isForced && <span className="text-emerald-400 mr-0.5">●</span>}
                                          {getSetIcon(setName) && <img src={getSetIcon(setName)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                                          {setName} <span className="text-emerald-400/70">×{count}</span>
                                        </div>
                                      );
                                    }) : allDetectedSets.length > 0 ? (
                                      <div className="text-gray-600 text-2xs">No set bonus (need 2+ matching)</div>
                                    ) : null}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Echo Preset (available for all characters including main DPS) */}
                        {(
                          <div>
                            <div className="kuro-micro-label">Echo Preset</div>
                            <div className="flex gap-0.5">
                              {[
                                { value: 'default', label: 'ATK/Crit', color: 'yellow' },
                                { value: 'er', label: 'ER Focus', color: 'cyan' },
                                { value: 'support', label: 'Support', color: 'blue' },
                              ].map(opt => {
                                const currentPreset = eq.echoPreset || 'default';
                                const isActive = currentPreset === opt.value;
                                return (
                                  <button key={opt.value}
                                    className={`flex-1 py-1 rounded text-sm font-medium transition-all ${isActive ? `bg-${opt.color}-500/20 border-${opt.color}-500/40 text-${opt.color}-400 border` : 'border border-[var(--border-medium)] text-gray-500 hover:text-gray-300 hover:border-white/15'}`}
                                    onClick={() => {
                                      setTeamEquipment(prev => {
                                        const n = { ...prev };
                                        const existing = n[eqKey] || { weapon: null };
                                        const existingEchoes = existing.echoes || [null,null,null,null,null];
                                        // Update mainStats on existing echoes to match new preset, but preserve echo names
                                        const scaling = m.d.statScaling || 'ATK';
                                        const scalingStat = scaling === 'HP' ? 'HP%' : scaling === 'DEF' ? 'DEF%' : 'ATK%';
                                        const elKey = m.d.element ? m.d.element.charAt(0).toUpperCase() + m.d.element.slice(1).toLowerCase() + ' DMG' : '';
                                        const getPresetStat = (cost) => {
                                          if (opt.value === 'er') return cost >= 3 ? 'Energy Regen' : scalingStat;
                                          if (opt.value === 'support') return cost === 4 ? (isHealerRole(m.d.role) ? 'Healing Bonus' : 'Energy Regen') : cost === 3 ? (elKey || scalingStat) : (scaling === 'HP' ? 'HP%' : scalingStat);
                                          return cost === 4 ? 'Crit Rate' : cost === 3 ? (elKey || scalingStat) : scalingStat;
                                        };
                                        const updatedEchoes = existingEchoes.map((echo, i) => {
                                          if (!echo || !echo.name) return echo;
                                          const cost = i === 0 ? 4 : i < 3 ? 3 : 1;
                                          return { ...echo, mainStat: getPresetStat(cost) };
                                        });
                                        n[eqKey] = { ...existing, echoPreset: opt.value, echoes: updatedEchoes };
                                        return n;
                                      });
                                      haptic.light();
                                    }}
                                  >{opt.label}</button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Advanced: Sequence + Refinement + Sonata (collapsible) */}
                        <details className="group" open>
                          <summary className="kuro-label cursor-pointer hover:text-gray-200 transition-colors select-none !flex !flex-row items-center gap-1 list-none [&::-webkit-details-marker]:hidden" style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
                            <ChevronDown size={10} className="transform group-open:rotate-180 transition-transform flex-shrink-0" />
                            <span>Sequence · Refinement</span>
                          </summary>
                        <div className="kuro-detail-box mt-1 space-y-2">
                          <div className="flex" role="group" aria-label={`${m.name} sequence and refinement`} style={{ gap: 'var(--card-padding)' }}>
                            <div className="flex-[7] min-w-0 space-y-0.5">
                              <div className="kuro-micro-label">Sequence</div>
                              <div className="flex gap-0.5" role="radiogroup" aria-label={`${m.name} resonance sequence level`}>
                                {[0,1,2,3,4,5,6].map(s => {
                                  const isActive = (eq.sequence || 0) === s;
                                  return (
                                    <button key={s}
                                      role="radio"
                                      aria-checked={isActive}
                                      className={`kuro-chip flex-1 text-2xs ${isActive ? 'active-gold' : ''}`}
                                      onClick={() => {
                                        setTeamEquipment(prev => {
                                          const n = { ...prev };
                                          n[eqKey] = { ...(n[eqKey] || { weapon: null, echoes: [null,null,null,null,null] }), sequence: s };
                                                    return n;
                                        });
                                        haptic.light();
                                      }}
                                    >S{s}</button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex-[5] min-w-0 space-y-0.5">
                              <div className="kuro-micro-label">Refinement</div>
                              <div className="flex gap-0.5" role="radiogroup" aria-label={`${m.name} weapon refinement level`}>
                                {[1,2,3,4,5].map(r => {
                                  const isActive = (eq.refinement || 1) === r;
                                  return (
                                    <button key={r}
                                      role="radio"
                                      aria-checked={isActive}
                                      className={`kuro-chip flex-1 text-2xs ${isActive ? 'active-gold' : ''}`}
                                      onClick={() => {
                                        setTeamEquipment(prev => {
                                          const n = { ...prev };
                                          n[eqKey] = { ...(n[eqKey] || { weapon: null, echoes: [null,null,null,null,null] }), refinement: r };
                                                    return n;
                                        });
                                        haptic.light();
                                      }}
                                    >R{r}</button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        </details>
                      </div>
                    );
                  })()}

                  {/* ── Section 4: Combat Info ── */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {/* Damage Focus */}
                    <div className="min-w-0">
                      <div className="kuro-label">Damage Focus</div>
                      <div className="flex flex-wrap gap-1">
                        <span className="kuro-badge font-medium"
                          style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                          {getElementIcon(m.d.element) && <img src={getElementIcon(m.d.element)} alt="" className="w-3.5 h-3.5 inline-block align-middle mr-0.5" onError={hideOnError} />}
                          {getElementShape(m.d.element)}{getElementShape(m.d.element) ? ' ' : ''}{m.d.element} DMG
                        </span>
                        {/* Audited combatRoles is the authoritative, iconed tag source (see
                            CharacterDetailModal) — falls back to plain dmgFocus tags, iconed via
                            the same short-tag→wiki-tag mapping, only for un-audited characters. */}
                        {m.d.combatRoles?.length > 0 ? (
                          m.d.combatRoles.map((tag, ti) => {
                            const icon = getCombatRoleIcon(tag);
                            return (
                              <span key={ti} className="kuro-badge kuro-badge-amber inline-flex items-center gap-1">
                                {icon && <img src={icon} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                                {tag}
                              </span>
                            );
                          })
                        ) : (m.d.dmgFocus || []).map((df, di) => {
                          const icon = getCombatRoleIcon(DMG_FOCUS_ROLE_TAG[df]);
                          return (
                            <span key={di} className="kuro-badge kuro-badge-amber inline-flex items-center gap-1">
                              {icon && <img src={icon} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                              {df}
                            </span>
                          );
                        })}
                        {m.d.statScaling && (
                          <span className="kuro-badge kuro-badge-violet inline-flex items-center gap-1">
                            {getStatIcon(m.d.statScaling) && <img src={getStatIcon(m.d.statScaling)} alt="" className="w-3.5 h-3.5" onError={hideOnError} />}
                            {m.d.statScaling} Scaling
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Buffs */}
                    {m.d.buffs?.length > 0 && (
                      <div className="min-w-0">
                        <div className="kuro-label">Buffs</div>
                        <div className="flex flex-wrap gap-1">
                          {m.d.buffs.map((b, bi) => (
                            <span key={bi} className="kuro-badge kuro-badge-emerald">{b}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Debuffs */}
                    {m.d.debuffs?.length > 0 && (
                      <div className="min-w-0">
                        <div className="kuro-label">Debuffs</div>
                        <div className="flex flex-wrap gap-1">
                          {m.d.debuffs.map((db, di) => (
                            <span key={di} className="kuro-badge kuro-badge-red">{db}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Section 5: Damage Stats (Main DPS only) ── */}
                  {isMain && (
                    <div>
                      <div className="kuro-label" title="Includes active team buff modifiers">Damage Stats</div>
                      <div className="flex flex-wrap gap-1">
                        <span className="kuro-badge kuro-badge-yellow">Eff.{mainDps.scaling !== 'ATK' ? mainDps.scaling : 'ATK'} {effAtk.toLocaleString('en-US')}</span>
                        <span className="kuro-badge kuro-badge-cyan">CR {cr.toFixed(1)}%</span>
                        <span className="kuro-badge kuro-badge-cyan">CD {cd.toFixed(1)}%</span>
                        <span className="kuro-badge font-medium"
                          style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                          {getElementIcon(m.d.element) && <img src={getElementIcon(m.d.element)} alt="" className="w-3.5 h-3.5 inline-block align-middle mr-0.5" onError={hideOnError} />}
                          {getElementShape(m.d.element)}{getElementShape(m.d.element) ? ' ' : ''}{m.d.element} +{elemDmg.toFixed(0)}%
                        </span>
                        {skillDmg > 0 && <span className="kuro-badge kuro-badge-amber">Skill +{skillDmg.toFixed(0)}%</span>}
                        {atkPct > 0 && <span className="kuro-badge kuro-badge-emerald">ATK% +{atkPct.toFixed(0)}%</span>}
                        {deepen > 0 && <span className="kuro-badge kuro-badge-purple">Deepen +{deepen.toFixed(0)}%</span>}
                        {defShred > 0 && <span className="kuro-badge kuro-badge-red">DEF Shred {Math.round(defShred)}%</span>}
                        {resShred > 0 && <span className="kuro-badge kuro-badge-red">RES Shred {Math.round(resShred)}%</span>}
                        {defIgnore > 0 && <span className="kuro-badge kuro-badge-red">DEF Ignore {defIgnore}%</span>}
                      </div>
                    </div>
                  )}


                </div>
              );
            })}

            {/* Aggregated buffs/debuffs — values appended to existing tags */}
            {allBuffs.length > 0 && (
              <div>
                <div className="kuro-label">Team Buffs</div>
                <div className="flex flex-wrap gap-1">
                  {allBuffs.map((b, i) => (
                    <span key={i} className="kuro-badge kuro-badge-emerald">
                      {b.buff} <span className="text-gray-500">({b.source})</span>
                    </span>
                  ))}
                  {atkPct > 0 && <span className="kuro-badge kuro-badge-emerald">+{atkPct.toFixed(1)}% ATK</span>}
                  {elemDmg > 0 && <span className="kuro-badge kuro-badge-yellow">+{elemDmg.toFixed(1)}% Elem DMG</span>}
                  {skillDmg > 0 && <span className="kuro-badge kuro-badge-amber">+{skillDmg.toFixed(1)}% Skill DMG</span>}
                  {deepen > 0 && <span className="kuro-badge kuro-badge-purple">+{deepen.toFixed(1)}% Deepen</span>}
                  {amplify > 0 && <span className="kuro-badge kuro-badge-pink">+{amplify.toFixed(1)}% Amplify</span>}
                  {cr > 5 && <span className="kuro-badge kuro-badge-cyan">{cr.toFixed(1)}% Crit Rate</span>}
                  {cd > 150 && <span className="kuro-badge kuro-badge-cyan">{cd.toFixed(1)}% Crit DMG</span>}
                </div>
              </div>
            )}
            {(allDebuffs.length > 0 || defShred > 0 || resShred > 0 || defIgnore > 0) && (
              <div>
                <div className="kuro-label">Enemy Debuffs</div>
                <div className="flex flex-wrap gap-1">
                  {allDebuffs.map((b, i) => (
                    <span key={i} className="kuro-badge kuro-badge-red">
                      {b.debuff} <span className="text-gray-500">({b.source})</span>
                    </span>
                  ))}
                  {defShred > 0 && <span className="kuro-badge kuro-badge-red">-{defShred.toFixed(1)}% DEF Shred</span>}
                  {resShred > 0 && <span className="kuro-badge kuro-badge-red">-{resShred.toFixed(1)}% RES Shred</span>}
                  {defIgnore > 0 && <span className="kuro-badge kuro-badge-red">{defIgnore.toFixed(1)}% DEF Ignore</span>}
                </div>
              </div>
            )}

            {/* DPS Tiers */}
            <div className="grid grid-cols-2 gap-2">
              <div className="kuro-stat kuro-stat-cyan p-2 text-center col-span-2">
                <div className="text-gray-400 text-sm">Team DPS</div>
                <div className="text-2xl font-bold text-cyan-400 kuro-number kuro-tshadow-glow-cyan">{teamDps.toLocaleString('en-US')}/s</div>
                <div className="text-gray-500 text-sm">skills + echoes + DOTs + reactions</div>
              </div>
              {enemyEcho && teamDps > 0 && getEnemyStatsAtLevel(enemyEcho, enemyLevel)?.hp > 0 && (
                <div className="kuro-stat p-2 text-center col-span-2">
                  <div className="text-gray-400 text-sm">Time to Kill</div>
                  <div className="text-lg font-bold text-white kuro-number">{(getEnemyStatsAtLevel(enemyEcho, enemyLevel).hp / teamDps).toFixed(1)}s</div>
                  <div className="text-gray-500 text-sm">{enemyEcho} Lv.{enemyLevel} HP {getEnemyStatsAtLevel(enemyEcho, enemyLevel).hp.toLocaleString('en-US')} ÷ Team DPS</div>
                </div>
              )}
              <div className="kuro-stat kuro-stat-emerald p-2 text-center">
                <div className="text-gray-400 text-sm">Solo DPS</div>
                <div className="text-lg font-bold text-emerald-400 kuro-number kuro-tshadow-glow-emerald">{soloDps.toLocaleString('en-US')}/s</div>
                <div className="text-gray-500 text-sm">no team buffs</div>
              </div>
              <div className={`kuro-stat ${synergyUplift >= 80 ? 'kuro-stat-emerald' : synergyUplift >= 40 ? 'kuro-stat-gold' : 'kuro-stat-red'} p-2 text-center`}>
                <div className="text-gray-400 text-sm">Synergy Uplift</div>
                <div className={`text-lg font-bold kuro-number ${synergyUplift >= 80 ? 'text-emerald-400 synergy-high' : synergyUplift >= 40 ? 'text-amber-400' : 'text-red-400'}`} style={{ textShadow: `0 0 10px ${synergyUplift >= 80 ? 'rgba(34,197,94,0.5)' : synergyUplift >= 40 ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)'}` }}>+{synergyUplift}%</div>
                <div className="text-gray-500 text-sm">team vs solo gain</div>
              </div>
            </div>

            {/* DPS Breakdown per character */}
            {/* Damage Source Breakdown */}
            {dmgSources && (dmgSources.echo > 0 || dmgSources.dot > 0) && (
              <div className="mt-2 p-2 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                <div className="text-gray-500 text-sm">Damage Sources</div>
                {[
                  { label: 'Rotation', pct: dmgSources.rotation, color: '#06b6d4' },
                  ...(dmgSources.echo > 0 ? [{ label: 'Echo Skill', pct: dmgSources.echo, color: '#eab308' }] : []),
                  ...(dmgSources.dot > 0 ? [{ label: 'DOT / Reactions', pct: dmgSources.dot, color: '#a855f7' }] : []),
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="text-sm text-gray-300 w-24 truncate font-medium">{s.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full dps-bar" style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.color}30, ${s.color}60)`, boxShadow: `0 0 8px ${s.color}30` }} />
                    </div>
                    <span className="text-sm font-medium w-10 text-right" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            )}

            {memberDps && (
              <div className="mt-2 p-2 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                <div className="text-gray-500 text-sm mb-1">Damage Distribution</div>
                {memberDps.map(m => {
                  const mData = members.find(mem => mem.name === m.name);
                  const elColor = mData ? getElementColor(mData.d.element) : '#67e8f9';
                  return (
                    <div key={m.name} className="flex items-center gap-2">
                      <span className="text-sm text-gray-300 w-24 truncate font-medium" title={m.name}>{m.name}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="h-full rounded-full dps-bar" style={{ width: `${m.pct}%`, background: `linear-gradient(90deg, ${elColor}30, ${elColor}60)`, boxShadow: `0 0 8px ${elColor}30` }} />
                      </div>
                      <span className="text-sm font-medium w-10 text-right" style={{ color: elColor }}>{m.pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {warnings.map((w, i) => (
                  <span key={i} className="kuro-badge kuro-badge-amber flex items-center gap-1 warning-badge">
                    <AlertTriangle size={12} /> {w}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500 text-center mt-1">Team DPS: full rotation including skills, echoes, DOTs, reactions. Solo DPS: equipment only, no team buffs. Synergy Uplift: actual % DPS gained from team composition.</p>
          </div>
        </CardBody>
        )}
      </Card>

      {/* Rotation Timeline — outside Team Overview Card to avoid overflow:hidden clipping */}
      <RotationTimeline rotationTimeline={rotationTimeline} />
      {members.some(m => (m.seqLevel || 0) > 0) && (
        <p className="text-2xs text-gray-500 -mt-2 px-1">
          Resonance Chain bonuses are included in the DPS number above but apply directly to stats — they don't have an on-field window, so they aren't drawn as bars on the timeline.
        </p>
      )}

      {/* Rotation Guide — Prydwen-style: one self-contained block per character (readable on its
          own — what THEY do on field) chained to its neighbors via explicit inherited/handed-off
          buffs, instead of one flat list mixing everyone's numbers together. */}
      {rotationTimeline?.steps?.length > 0 && (
        <Card>
          <CardHeader>
            <span className="flex items-center gap-1.5"><ListOrdered size={14} /> Rotation Guide</span>
          </CardHeader>
          <CardBody>
            <div className="space-y-0">
              {rotationTimeline.steps.map((step, i) => (
                <React.Fragment key={step.order}>
                  <div className={`p-2.5 rounded-lg border ${step.isDps ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-[var(--border-medium)]'}`} style={step.isDps ? undefined : { background: 'var(--bg-stat)' }}>
                    <div className="flex items-center gap-2">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold ${step.isDps ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-400'}`}>{step.order}</span>
                      <span className={`font-semibold text-sm ${step.isDps ? 'text-yellow-400' : 'text-gray-200'}`}>{step.name}</span>
                      <span className="text-gray-500 text-sm">on-field {step.duration}s</span>
                      {step.isDps && <span className="kuro-badge kuro-badge-yellow ml-auto">Main DPS</span>}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 pl-7">{step.reason}</div>

                    {/* Verified skill-by-skill sequence (Prydwen.gg "Standard Rotation") — real combat
                        data, shown first since it's the most concrete/actionable part of the block.
                        Every abbreviation was replaced with the full action-type word plus a plain-
                        English explanation of what that TYPE of action generally does (a new player
                        shouldn't have to already know what "Forte" or "Outro" means to read this),
                        on top of the character-specific note for what THIS step does in this rotation. */}
                    {step.skillSequence && (
                      <div className="mt-2 pl-7">
                        <div className="text-2xs text-gray-500 uppercase tracking-wide mb-1">Skill sequence — perform in this order</div>
                        <div className="space-y-2">
                          {step.skillSequence.map((s, si) => {
                            const sty = stepStyle(s.type);
                            return (
                              <div key={si} className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/10 text-gray-400 text-2xs font-bold flex items-center justify-center mt-0.5">{si + 1}</span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-2xs font-bold px-1.5 py-0.5 rounded border ${sty.cls}`}>{sty.label}</span>
                                    <span className="text-sm text-gray-200 font-medium">{s.skill}</span>
                                  </div>
                                  {s.note ? (
                                    <div className="text-2xs text-gray-400 mt-0.5">{s.note}</div>
                                  ) : (
                                    <div className="text-2xs text-yellow-600/60 italic mt-0.5">No verified how-to instructions for this step yet.</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Inbound — what earlier blocks handed this one, i.e. how it adapts to the team */}
                    {step.inherits.length > 0 && (
                      <div className="mt-2 pl-7">
                        <div className="text-2xs text-cyan-400/70 uppercase tracking-wide mb-1 flex items-center gap-1">↓ Inherits from team</div>
                        <div className="flex flex-wrap gap-1">
                          {step.inherits.map((b, bi) => <span key={bi} className="kuro-badge kuro-badge-cyan">{b}</span>)}
                        </div>
                      </div>
                    )}
                    {/* Self-contained — this character's own kit, readable with zero team context */}
                    {step.selfActive.length > 0 && (
                      <div className="mt-2 pl-7">
                        <div className="text-2xs text-gray-500 uppercase tracking-wide mb-1">Own kit</div>
                        <div className="flex flex-wrap gap-1">
                          {step.selfActive.map((b, bi) => <span key={bi} className="kuro-badge kuro-badge-violet">{b}</span>)}
                        </div>
                      </div>
                    )}
                    {/* Outbound — what this block hands off to whoever comes next */}
                    {step.handsOff.length > 0 && (
                      <div className="mt-2 pl-7">
                        <div className="text-2xs text-emerald-400/70 uppercase tracking-wide mb-1">↑ Hands off to next</div>
                        <div className="flex flex-wrap gap-1">
                          {step.handsOff.map((b, bi) => <span key={bi} className="kuro-badge kuro-badge-emerald">{b}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                  {i < rotationTimeline.steps.length - 1 && (
                    <div className="flex justify-center py-0.5" aria-hidden="true">
                      <ChevronDown size={14} className="text-gray-600" />
                    </div>
                  )}
                </React.Fragment>
              ))}
              {/* This block chain is one cycle (rotTime seconds) that repeats — each character's own
                  module (skill sequence + inherits/hands-off) is unaffected by which comp it's slotted
                  into, so swapping any member here still "just works": the chain re-derives inherits/
                  hands-off/ordering from whichever 1-3 characters are actually placed. */}
              {rotationTimeline.steps.length > 1 && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="h-px flex-1 bg-purple-500/20" />
                  <span className="text-2xs text-purple-400/80 font-medium">↻ loop back to {rotationTimeline.steps[0]?.name}, repeat every {rotationTimeline.totalTime}s</span>
                  <span className="h-px flex-1 bg-purple-500/20" />
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      <DPSComparisonCard
        teamCompareEntries={teamCompareEntries} setTeamCompareEntries={setTeamCompareEntries}
        calcTeamStats={calcTeamStats}
        enemyEcho={enemyEcho} enemyLevel={enemyLevel} setEnemyLevel={setEnemyLevel}
        setEnemyEchoSearch={setEnemyEchoSearch} setEnemyEchoModalOpen={setEnemyEchoModalOpen}
        confirm={confirm}
        setTeamEquipment={setTeamEquipment}
      />

      {enemyTargetModal}
    </>
  );
});

export default DamageCalculator;
