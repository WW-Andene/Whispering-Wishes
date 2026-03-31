import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AlertTriangle, BarChart3, ChevronDown, Diamond, Download, Plus, Search, Share2, Star, Sword, Target, Trash2, Upload, Users, X, Zap } from 'lucide-react';
import {
  haptic,
  CHARACTER_DATA, WEAPON_DATA, ECHO_SETS, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA,
  RELEASE_ORDER, WEAPON_REFINE_SCALE,
  ALL_5STAR_RESONATORS,
  ALL_4STAR_RESONATORS,
  ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ECHO_DATA,
  ALL_ECHO_SONATA_SETS, ALL_ECHO_BUFF_TYPES,
  getElementColor, getElementBg, getElementBorder,
} from '../../appcore-data.js';
import {
  FocusTrapModal,
} from '../../appcore-providers.jsx';
import {
  TabBackground,
  Card, CardHeader, CardBody,
  TabErrorBoundary,
  KuroSelect,
  hideOnError,
} from '../../appcore-components.jsx';
import TeamSelector from './TeamSelector.jsx';
import WeaponSelector from './WeaponSelector.jsx';
import EchoSelector from './EchoSelector.jsx';

export default function TeamsTab({
  state,
  dispatch,
  collectionImages,
  collectionData,
  getImageFraming,
  framingMode,
  editingImage,
  setEditingImage,
  toast,
  confirm,
}) {
  const [teamSelectorOpen, setTeamSelectorOpen] = useState(false);
  const [teamSelectorSlot, setTeamSelectorSlot] = useState(0);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamElementFilter, setTeamElementFilter] = useState('all');
  const [teamRarityFilter, setTeamRarityFilter] = useState('all');
  const [teamBuffFilter, setTeamBuffFilter] = useState('all');
  const [teamDebuffFilter, setTeamDebuffFilter] = useState('all');
  const [teamDmgFilter, setTeamDmgFilter] = useState('all');
  const [teamRoleFilter, setTeamRoleFilter] = useState('all');
  const [teamCompareEntries, setTeamCompareEntries] = useState([]);
  const [teamEquipment, setTeamEquipment] = useState(() => {
    try { const s = localStorage.getItem('ww-team-equipment'); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  // Debounced save for teamEquipment — prevents localStorage thrash on rapid interactions
  const eqSaveTimerRef = useRef(null);
  useEffect(() => {
    if (eqSaveTimerRef.current) clearTimeout(eqSaveTimerRef.current);
    eqSaveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem('ww-team-equipment', JSON.stringify(teamEquipment)); } catch {}
    }, 300);
    return () => { if (eqSaveTimerRef.current) clearTimeout(eqSaveTimerRef.current); };
  }, [teamEquipment]);
  const [weaponSelectorOpen, setWeaponSelectorOpen] = useState(false);
  const [weaponSelectorTarget, setWeaponSelectorTarget] = useState({ teamIdx: 0, charName: '' });
  const [weaponSearch, setWeaponSearch] = useState('');
  const [echoSelectorOpen, setEchoSelectorOpen] = useState(false);
  const [echoSelectorTarget, setEchoSelectorTarget] = useState({ teamIdx: 0, charName: '', slotIdx: 0 });
  const [echoSearch, setEchoSearch] = useState('');
  const [echoSetFilter, setEchoSetFilter] = useState('all');
  const [echoBuffFilter, setEchoBuffFilter] = useState('all');
  const [echoStatPanel, setEchoStatPanel] = useState(null);
  const [enemyLevel, setEnemyLevel] = useState(90);
  const [enemyEcho, setEnemyEcho] = useState('');
  const [enemyEchoModalOpen, setEnemyEchoModalOpen] = useState(false);
  const [enemyEchoSearch, setEnemyEchoSearch] = useState('');
  const [enemyEchoCostFilter, setEnemyEchoCostFilter] = useState('all');
  const [enemyEchoSetFilter, setEnemyEchoSetFilter] = useState('all');
  const [enemyEchoBuffFilter, setEnemyEchoBuffFilter] = useState('all');

  // ── Reusable calculator with proper WuWa damage formula ──
  // Memoized so it only recalculates when teamEquipment changes.
  const calcTeamStats = useCallback((slots, teamIdx) => {
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
      let echoSetName = eq?.echoSet || '';
      if (!echoSetName && d.bestEchoes) { for (const e of d.bestEchoes) { const k = Object.keys(ECHO_SETS).find(k => e.includes(k)); if (k) { echoSetName = k; break; } } }
      const scaling = d.statScaling || 'ATK';
      const baseStat = scaling === 'HP' ? (d.baseHp || 0) : scaling === 'DEF' ? (d.baseDef || 0) : charAtk + weapAtk;
      return { name, d, weapon, weapName, charAtk, weapAtk, totalBaseAtk: charAtk + weapAtk, scaling, baseStat, echoSetName, echoSet: echoSetName ? ECHO_SETS[echoSetName] : null, weapSubstat: weapon?.stat || '', weapSubVal: weapon?.subStatValue || '', seqLevel };
    }).filter(Boolean);
    if (!mems.length) return null;
    const allBuffs = [], allDebuffs = [];
    mems.forEach(m => { (m.d.buffs || []).forEach(b => allBuffs.push({ source: m.name, buff: b })); (m.d.debuffs || []).forEach(b => allDebuffs.push({ source: m.name, debuff: b })); });
    const mainDps = mems.find(m => m.d.role === 'Main DPS') || mems[0];

    const parsePassive = (passive, element) => {
      const r = { atkPct: 0, elemDmg: 0, skillDmg: 0, critRate: 0, critDmg: 0, defIgnore: 0, resShred: 0, basicDmg: 0, heavyDmg: 0, libDmg: 0, echoDmg: 0, coordDmg: 0 };
      if (!passive) return r;
      const p = passive.toLowerCase();
      const atkMatch = p.match(/atk\s*\+(\d+)%/);
      if (atkMatch) r.atkPct += parseInt(atkMatch[1]);
      if (element) {
        const elLow = element.toLowerCase();
        const elMatch = p.match(new RegExp(elLow + '\\s*dmg\\s*\\+?(\\d+)%'));
        if (elMatch) r.elemDmg += parseInt(elMatch[1]);
        const attrMatch = p.match(/(?:all[- ])?attr(?:ibute)?\s*dmg\s*(?:bonus\s*)?\+?(\d+)%/);
        if (attrMatch) r.elemDmg += parseInt(attrMatch[1]);
      }
      const skillMatch = p.match(/(?:res(?:onance)?\.?\s*)?skill\s*dmg\s*\+?(\d+)%/);
      if (skillMatch) r.skillDmg += parseInt(skillMatch[1]);
      const libMatch = p.match(/(?:res(?:onance)?\.?\s*)?liberation\s*(?:dmg\s*)?\+?(\d+)%/);
      if (libMatch) r.libDmg += parseInt(libMatch[1]);
      const basicMatch = p.match(/basic\s*(?:atk?\s*)?dmg\s*(?:amp\s*)?\+?(\d+)%/);
      if (basicMatch) r.basicDmg += parseInt(basicMatch[1]);
      const heavyMatch = p.match(/heavy\s*(?:atk?\s*)?(?:dmg\s*)?\+?(\d+)%/);
      if (heavyMatch) r.heavyDmg += parseInt(heavyMatch[1]);
      const coordMatch = p.match(/coord(?:inated)?\s*(?:atk?\s*)?(?:dmg\s*)?\+?(\d+)%/);
      if (coordMatch) r.coordDmg += parseInt(coordMatch[1]);
      const echoMatch = p.match(/echo\s*(?:skill\s*)?dmg\s*(?:amp\s*)?\+?(\d+)%/);
      if (echoMatch) r.echoDmg += parseInt(echoMatch[1]);
      const crMatch = p.match(/crit\s*rate\s*\+?(\d+)%/);
      if (crMatch) r.critRate += parseInt(crMatch[1]);
      const cdMatch = p.match(/crit\s*dmg\s*\+?(\d+)%/);
      if (cdMatch) r.critDmg += parseInt(cdMatch[1]);
      const defMatch = p.match(/def\s*ignore\s*\+?(\d+)%/);
      if (defMatch) r.defIgnore += parseInt(defMatch[1]);
      const resMatch = p.match(/res\s*(?:ignore\s*)?\-(\d+)%/);
      if (resMatch) r.resShred += parseInt(resMatch[1]);
      return r;
    };

    // ── Enemy scaling ──
    // Wiki: Enemy DEF = 8 × LVL_enemy + 792
    // Wiki: DEF% = (800 + 8×LVL_attacker) / (800 + 8×LVL_attacker + DEF_target × (1 - DEFIgnore))
    const attackerFactor = 800 + 8 * 90; // 1520 at attacker level 90
    const enemyDef90 = 792 + 8 * enemyLevel; // Wiki: Enemy DEF = 8×LVL + 792
    // Wiki RES formula (3-tier piecewise):
    // RES < 0:       1 - RES/2
    // 0 ≤ RES < 0.8: 1 - RES
    // RES ≥ 0.8:     1/(1 + 5×RES)
    const calcResMult = (baseRes, shred) => {
      const totalRes = (baseRes - shred) / 100; // convert to decimal
      if (totalRes < 0) return 1 - totalRes / 2;
      if (totalRes < 0.8) return 1 - totalRes;
      return 1 / (1 + 5 * totalRes);
    };
    const enemyEchoData = enemyEcho ? ECHO_DATA[enemyEcho] : null;
    const enemyResMap = enemyEchoData?.enemyRes || {};
    const getEnemyRes = (el) => {
      const elLow = (el || '').toLowerCase();
      return enemyResMap[elLow] ?? 10;
    };

    // ── RAW TIER: equipment-only stats, no team buffs ──
    const rawRotTime = mainDps.d.rotTime || 25;
    const rawMainOnField = mainDps.d.onField || 15;
    const rawOffFieldTime = Math.max(0, rawRotTime - rawMainOnField);
    const rawNumSubDps = mems.filter(m => m.name !== mainDps.name && (m.d.totalMult || 0) > 0).length || 1;
    const rawSubFieldEach = rawOffFieldTime / rawNumSubDps;
    let rawTotalRotDmg = 0;
    mems.forEach(m => {
      let mult = m.d.totalMult || 0;
      if (mult === 0) return;
      // Sub-DPS: scale mult by field-time ratio
      if (m.name !== mainDps.name) {
        const subOnField = m.d.onField ?? 15;
        mult = mult * Math.min(1, rawSubFieldEach / subOnField);
      }
      const sKey = m.scaling === 'HP' ? 'HP%' : m.scaling === 'DEF' ? 'DEF%' : 'ATK%';
      let rStatPct = 0, rCr = 5, rCd = 150, rElem = 0, rSkillDmg = 0;
      // Weapon substat
      if (m.weapSubstat === 'Crit Rate') rCr += parseFloat(m.weapSubVal) || 0;
      if (m.weapSubstat === 'Crit DMG') rCd += parseFloat(m.weapSubVal) || 0;
      if (m.weapSubstat === sKey) rStatPct += parseFloat(m.weapSubVal) || 0;
      // Weapon passive (own only)
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
      // Echo set (own set bonuses)
      if (m.echoSet) {
        const p2 = m.echoSet.p2val || {}, p5 = m.echoSet.p5val || {};
        if (m.scaling === 'ATK') { if (p2.atkPct) rStatPct += p2.atkPct; if (p5.atkPct) rStatPct += p5.atkPct; }
        if (p2.critRate) rCr += p2.critRate; if (p5.critRate) rCr += p5.critRate;
        if (p2.skillDmg) rSkillDmg += p2.skillDmg; if (p5.skillDmg) rSkillDmg += p5.skillDmg;
        const ek = (m.d.element || '').toLowerCase() + 'Dmg';
        if (p2[ek]) rElem += p2[ek]; if (p5[ek]) rElem += p5[ek];
      }
      // Echo main/substats
      const eqKey = teamIdx + ':' + m.name;
      const eq = teamEquipment[eqKey];
      const echoes = eq?.echoes || [];
      const elKey = (m.d.element || '').toLowerCase();
      const elDmg = elKey ? elKey.charAt(0).toUpperCase() + elKey.slice(1) + ' DMG' : '';
      const mStatVals = { 4: { 'ATK%': 30, 'HP%': 30, 'DEF%': 30, 'Crit Rate': 22, 'Crit DMG': 44 }, 3: { 'ATK%': 30, 'HP%': 30, 'DEF%': 30, 'Glacio DMG': 30, 'Fusion DMG': 30, 'Electro DMG': 30, 'Aero DMG': 30, 'Spectro DMG': 30, 'Havoc DMG': 30 }, 1: { 'ATK%': 18, 'HP%': 18, 'DEF%': 18 } };
      const subV = { [sKey]: 9, 'Crit Rate': 7.5, 'Crit DMG': 15, 'Resonance Skill DMG': 9 };
      echoes.forEach((echo, ei) => {
        if (!echo || typeof echo !== 'object') return;
        const cost = ei === 0 ? 4 : ei < 3 ? 3 : 1;
        if (echo.mainStat) {
          const val = mStatVals[cost]?.[echo.mainStat] || 0;
          if (echo.mainStat === sKey) rStatPct += val;
          else if (echo.mainStat === 'Crit Rate') rCr += val;
          else if (echo.mainStat === 'Crit DMG') rCd += val;
          else if (echo.mainStat === elDmg) rElem += val;
        }
        (echo.substats || []).forEach(sub => {
          if (sub === sKey) rStatPct += 9;
          else if (sub === 'Crit Rate') rCr += 7.5;
          else if (sub === 'Crit DMG') rCd += 15;
          else if (sub === 'Resonance Skill DMG') rSkillDmg += 9;
        });
      });
      // Element resonance
      const elCnts = {};
      mems.forEach(mm => { const el = mm.d.element; if (el) elCnts[el] = (elCnts[el] || 0) + 1; });
      if (m.d.element && elCnts[m.d.element] >= 2) rElem += 10;
      // Raw damage calculation
      const rEff = m.baseStat * (1 + rStatPct / 100);
      const rAvgCrit = 1 + (Math.min(rCr, 100) / 100) * (rCd / 100 - 1);
      // Wiki: %DMG_Bonus = 1 + All_DMG_Bonus (elemental + skill type are ALL additive)
      const rDmgBonus = 1 + (rElem + rSkillDmg) / 100;
      const rDefMult = attackerFactor / (attackerFactor + enemyDef90);
      const rBaseRes = getEnemyRes(m.d.element);
      const rResMult = calcResMult(rBaseRes, 0); // RAW tier: no shred
      rawTotalRotDmg += rEff * (mult / 100) * rAvgCrit * rDmgBonus * rDefMult * rResMult;
    });
    const rawDps = Math.round(rawTotalRotDmg / (mainDps.d.rotTime || 25));

    // ── FULL TIER: Base stats with team buffs ──
    const mainStatKey = mainDps.scaling === 'HP' ? 'HP%' : mainDps.scaling === 'DEF' ? 'DEF%' : 'ATK%';
    let atkPct = 0, cr = 5, cd = 150, elemDmg = 0, skillDmg = 0, deepen = 0, defShred = 0, resShred = 0, defIgnore = 0;

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

    if (mainDps.echoSet) {
      const p2 = mainDps.echoSet.p2val || {}, p5 = mainDps.echoSet.p5val || {};
      if (mainDps.scaling === 'ATK') { if (p2.atkPct) atkPct += p2.atkPct; if (p5.atkPct) atkPct += p5.atkPct; }
      else if (mainDps.scaling === 'HP') { if (p2.hpPct) atkPct += p2.hpPct; if (p5.hpPct) atkPct += p5.hpPct; }
      else if (mainDps.scaling === 'DEF') { if (p2.defPct) atkPct += p2.defPct; if (p5.defPct) atkPct += p5.defPct; }
      if (p2.critRate) cr += p2.critRate; if (p5.critRate) cr += p5.critRate;
      if (p2.skillDmg) skillDmg += p2.skillDmg; if (p5.skillDmg) skillDmg += p5.skillDmg;
      const ek = (mainDps.d.element || '').toLowerCase() + 'Dmg';
      if (p2[ek]) elemDmg += p2[ek]; if (p5[ek]) elemDmg += p5[ek];
    }

    let echoBasicDmg = 0, echoHeavyDmg = 0, echoSkillDmg = 0, echoLibDmg = 0;
    {
      const mainEqKey = teamIdx + ':' + mainDps.name;
      const mainEq = teamEquipment[mainEqKey];
      const echoes = mainEq?.echoes || [];
      const mainEl = (mainDps.d.element || '').toLowerCase();
      const elDmgKey = mainEl ? mainEl.charAt(0).toUpperCase() + mainEl.slice(1) + ' DMG' : '';
      const mainStatVals = {
        4: { 'ATK%': 30, 'HP%': 30, 'DEF%': 30, 'Crit Rate': 22, 'Crit DMG': 44, 'Healing Bonus': 26, 'Energy Regen': 32 },
        3: { 'ATK%': 30, 'HP%': 30, 'DEF%': 30, 'Glacio DMG': 30, 'Fusion DMG': 30, 'Electro DMG': 30, 'Aero DMG': 30, 'Spectro DMG': 30, 'Havoc DMG': 30, 'Energy Regen': 32 },
        1: { 'ATK%': 18, 'HP%': 18, 'DEF%': 18 },
      };
      const subVals = { 'ATK%': 9, 'Crit Rate': 7.5, 'Crit DMG': 15, 'Energy Regen': 8, 'Basic ATK DMG': 9, 'Heavy ATK DMG': 9, 'Resonance Skill DMG': 9, 'Resonance Liberation DMG': 9 };
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
          const val = subVals[sub];
          if (val) applyStat(sub, val);
        });
      });
    }

    {
      const elCounts = {};
      mems.forEach(m => { const el = m.d.element; if (el) elCounts[el] = (elCounts[el] || 0) + 1; });
      const mainEl = mainDps.d.element;
      if (mainEl && elCounts[mainEl] >= 2) elemDmg += 10;
    }

    let basicDmg = wpBasicDmg, heavyDmg = wpHeavyDmg, libDmg = wpLibDmg, echoDmg = wpEchoDmg, coordDmg = wpCoordDmg;
    mems.forEach(m => {
      const bt = CHAR_BUFF_TABLE[m.name];
      if (!bt) return;
      const isMain = m.name === mainDps.name;

      if (!isMain) {
        const teamRotTime = mainDps.d.rotTime || 25;
        (bt.outroBuffs || []).forEach(b => {
          if (b.target === 'next' || b.target === 'enemy') {
            const uptime = Math.min(1, (b.duration || 14) / teamRotTime);
            const val = b.value * uptime;
            if (b.stat === 'atkPct' && mainDps.scaling === 'ATK') atkPct += val;
            else if (b.stat === 'atkPct' && mainDps.scaling === 'HP') { /* HP-scalers need hpPct, not atkPct */ }
            else if (b.stat === 'atkPct' && mainDps.scaling === 'DEF') { /* DEF-scalers need defPct, not atkPct */ }
            else if (b.stat === 'allDmg') elemDmg += val;
            else if (b.stat === 'elemDmg') {
              const buffEl = (b.condition || '').toLowerCase();
              const dpsEl = (mainDps.d.element || '').toLowerCase();
              if (!buffEl || buffEl.includes(dpsEl) || buffEl.includes('all')) elemDmg += val;
            }
            else if (b.stat === 'deepen') deepen += val;
            else if (b.stat === 'basicDmg') basicDmg += val;
            else if (b.stat === 'heavyDmg') heavyDmg += val;
            else if (b.stat === 'libDmg') libDmg += val;
            else if (b.stat === 'echoDmg') echoDmg += val;
            else if (b.stat === 'critRate') cr += val;
            else if (b.stat === 'critDmg') cd += val;
            else if (b.stat === 'resShred') resShred += val;
            else if (b.stat === 'defShred') defShred += val;
            else if (b.stat === 'skillDmg') skillDmg += val;
          }
        });
      }

      (bt.libBuffs || []).forEach(b => {
        if (b.target === 'team' || (!isMain && b.target === 'next')) {
          const teamRotTime = mainDps.d.rotTime || 25;
          const uptime = Math.min(1, (b.duration || 25) / teamRotTime);
          const val = b.value * uptime;
          if (b.stat === 'atkPct' && mainDps.scaling === 'ATK') atkPct += val;
          else if (b.stat === 'allDmg') elemDmg += val;
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
      });
    });

    basicDmg += echoBasicDmg; heavyDmg += echoHeavyDmg; libDmg += echoLibDmg;
    skillDmg += echoSkillDmg;

    const focus = mainDps.d.dmgFocus || [];
    if (focus.includes('Basic ATK')) skillDmg += basicDmg;
    else if (basicDmg > 0 && !focus.length) skillDmg += basicDmg * 0.5;
    if (focus.includes('Heavy ATK')) skillDmg += heavyDmg;
    else if (heavyDmg > 0 && !focus.length) skillDmg += heavyDmg * 0.5;
    if (focus.includes('Liberation')) skillDmg += libDmg;
    else if (libDmg > 0) skillDmg += libDmg * 0.3;
    if (focus.includes('Echo')) skillDmg += echoDmg;
    if (focus.includes('Coordinated ATK')) skillDmg += coordDmg;

    const mainDpsEl = (mainDps.d.element || '').toLowerCase();
    mems.forEach(m => {
      if (m.name === mainDps.name) return;
      const sn = m.echoSetName;
      // Echo set ATK% buffs only benefit ATK-scaling main DPS
      if (sn === 'Rejuvenating Glow' && mainDps.scaling === 'ATK') atkPct += 15;
      if (sn === 'Moonlit Clouds' && mainDps.scaling === 'ATK') atkPct += 22.5;
      if (sn === 'Empyrean Anthem' && mainDps.scaling === 'ATK') { atkPct += 20; }
      if (sn === 'Tidebreaking Courage') { if (mainDps.scaling === 'ATK') atkPct += 15; elemDmg += 20; }
      if (sn === 'Halo of Starry Radiance' && mainDps.scaling === 'ATK') atkPct += 20;
      if (sn === 'Pact of Neonlight Leap' && mainDps.scaling === 'ATK') atkPct += 25;
      if (sn === 'Gusts of Welkin' && mainDpsEl === 'aero') elemDmg += 25;
      if (sn === 'Windward Pilgrimage' && mainDpsEl === 'aero') elemDmg += 15;
      if (sn === 'Flaming Clawprint' && mainDpsEl === 'fusion') elemDmg += 15;
      if (sn === 'Midnight Veil' && mainDpsEl === 'havoc') elemDmg += 15;
      if (sn === 'Chromatic Foam' && mainDpsEl === 'fusion') elemDmg += 25;
      const bt = CHAR_BUFF_TABLE[m.name];
      (bt?.weaponBuffs || []).forEach(wb => {
        if (wb.target !== 'team') return;
        const teamRotTime = mainDps.d.rotTime || 25;
        const uptime = Math.min(1, (wb.duration || 10) / teamRotTime);
        const val = wb.value * uptime;
        if (wb.stat === 'atkPct' && mainDps.scaling === 'ATK') atkPct += val;
        else if (wb.stat === 'critRate') cr += val;
        else if (wb.stat === 'critDmg') cd += val;
        else if (wb.stat === 'allDmg') elemDmg += val;
      });
      // Weapon team buffs (tv)
      if (m.weapon?.tv) {
        const tvRefLevel = (teamEquipment[teamIdx + ':' + m.name])?.refinement || 1;
        const tvRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[tvRefLevel - 1] || 1 : 1;
        const wt = m.weapon.tv;
        const teamRotTime = mainDps.d.rotTime || 25;
        const uptime = Math.min(1, (wt.duration || 15) / teamRotTime);
        if (wt.atkPct) atkPct += wt.atkPct * tvRefScale * uptime;
        if (wt.elemDmg) elemDmg += wt.elemDmg * tvRefScale * uptime;
        if (wt.critRate) cr += wt.critRate * tvRefScale * uptime;
        if (wt.critDmg) cd += wt.critDmg * tvRefScale * uptime;
      }
    });

    let seqTotalMultBonus = 0;
    mems.forEach(m => {
      const rc = RESONANCE_CHAIN_DATA[m.name];
      if (!rc || m.seqLevel <= 0) return;
      const isMain = m.name === mainDps.name;
      for (let s = 1; s <= Math.min(m.seqLevel, 6); s++) {
        const lvl = rc['s' + s];
        if (!lvl) continue;
        if (isMain) {
          if (lvl.atkPct) atkPct += lvl.atkPct;
          if (lvl.critRate) cr += lvl.critRate;
          if (lvl.critDmg) cd += lvl.critDmg;
          if (lvl.elemDmg) elemDmg += lvl.elemDmg;
          if (lvl.skillDmg) skillDmg += lvl.skillDmg;
          if (lvl.basicDmg) basicDmg += lvl.basicDmg;
          if (lvl.heavyDmg) heavyDmg += lvl.heavyDmg;
          if (lvl.libDmg) libDmg += lvl.libDmg;
          if (lvl.echoDmg) echoDmg += lvl.echoDmg;
          if (lvl.deepen) deepen += lvl.deepen;
          if (lvl.defIgnore) defIgnore += lvl.defIgnore;
          if (lvl.defShred) defShred += lvl.defShred;
          if (lvl.resShred) resShred += lvl.resShred;
          if (lvl.totalMult) seqTotalMultBonus += lvl.totalMult;
        } else {
          if (lvl.allDmg) elemDmg += lvl.allDmg;
          if (lvl.deepen) deepen += lvl.deepen;
          if (lvl.defShred) defShred += lvl.defShred;
          if (lvl.resShred) resShred += lvl.resShred;
          if (lvl.atkPct) atkPct += lvl.atkPct;
          if (lvl.critRate) cr += lvl.critRate;
          if (lvl.critDmg) cd += lvl.critDmg;
          if (lvl.basicDmg) basicDmg += lvl.basicDmg;
          if (lvl.heavyDmg) heavyDmg += lvl.heavyDmg;
        }
      }
    });

    const effAtk = Math.round(mainDps.baseStat * (1 + atkPct / 100));
    const avgCrit = 1 + (Math.min(cr, 100) / 100) * (cd / 100 - 1);
    // Wiki: %DMG_Bonus = 1 + All_DMG_Bonus (additive), then × DMG_Amplify (deepen, separate mult)
    const dmgBonus = (1 + (elemDmg + skillDmg) / 100) * (1 + deepen / 100);
    // Wiki: DEF Reduction modifies enemy DEF before formula, DEF Ignore is inside formula
    // DEF_Mult = attacker / (attacker + DEF × (1 - DEF_Reduction) × (1 - DEF_Ignore))
    const reducedDef = enemyDef90 * Math.max(0, 1 - defShred / 100);
    const effectiveDef = reducedDef * Math.max(0, 1 - defIgnore / 100);
    const defMult = Math.min(2, attackerFactor / (attackerFactor + effectiveDef)); // Wiki: capped at 200%
    const mainBaseRes = getEnemyRes(mainDps.d.element);
    const resMult = calcResMult(mainBaseRes, resShred);
    const score = Math.round(effAtk * avgCrit * dmgBonus * defMult * resMult);

    const rotTime = mainDps.d.rotTime || 25;
    const DOT_LEVEL_MULT = 3674;
    const DOT_BASE_FACTOR = 1.25078;
    let dotDmgPerRotation = 0;

    const hasFrazzle = mems.some(m => {
      const bt = CHAR_BUFF_TABLE[m.name];
      return bt?.debuffs?.some(db => db.stat === 'frazzle');
    });
    if (hasFrazzle) {
      const frazzleStacks = mems.some(m => m.name === 'Phoebe') ? 18 : 10;
      const numTicks = Math.min(Math.floor(rotTime / 3), frazzleStacks);
      let frazzleTotal = 0;
      for (let s = frazzleStacks; s > frazzleStacks - numTicks; s--) {
        frazzleTotal += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (s * 0.15);
      }
      const hasPhoebeAmp = mems.some(m => m.name === 'Phoebe');
      const frazzleAmpMult = hasPhoebeAmp ? 2.0 : 1.0;
      dotDmgPerRotation += frazzleTotal * frazzleAmpMult * defMult * resMult;
    }

    const hasErosion = mems.some(m => {
      const bt = CHAR_BUFF_TABLE[m.name];
      return bt?.debuffs?.some(db => db.stat === 'erosion');
    });
    if (hasErosion) {
      const erosionStacks = mems.some(m => m.name === 'Rover') ? 6 : 3;
      const erosionTicks = Math.max(1, Math.floor(rotTime / 15));
      let erosionTotal = 0;
      for (let t = 0; t < erosionTicks; t++) {
        erosionTotal += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (erosionStacks * 0.8);
      }
      dotDmgPerRotation += erosionTotal * defMult * resMult;
    }

    const hasFusionBurst = mems.some(m => {
      const bt = CHAR_BUFF_TABLE[m.name];
      return bt?.debuffs?.some(db => db.stat === 'fusionBurst');
    });
    if (hasFusionBurst) {
      const burstExplosions = 2;
      const burstStacks = 10;
      const fusionTrailMult = 3.0;
      const burstDmg = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (burstStacks * 0.5) * fusionTrailMult;
      dotDmgPerRotation += burstDmg * burstExplosions * defMult * resMult;
    }

    const hasElectroFlare = mems.some(m => {
      return CHAR_BUFF_TABLE[m.name]?.electroFlare;
    });
    if (hasElectroFlare) {
      const flareTicks = Math.min(4, Math.floor(rotTime / 4));
      let flareTotal = 0;
      let stacks = 10;
      for (let t = 0; t < flareTicks; t++) {
        flareTotal += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (stacks * 0.12);
        stacks = Math.ceil(stacks / 2);
      }
      dotDmgPerRotation += flareTotal * defMult * resMult;
    }

    let tuneBreakDmg = 0;
    let tuneBreakAmp = 0;
    let tuneBreakDeepenMult = 1;
    const tuneBreakMembers = mems.filter(m => CHAR_BUFF_TABLE[m.name]?.tuneBreak);
    if (tuneBreakMembers.length > 0) {
      let totalTuneBreakBoost = 0;
      tuneBreakMembers.forEach(m => {
        const tb = CHAR_BUFF_TABLE[m.name].tuneBreak;
        totalTuneBreakBoost += (tb.baseTuneBreakBoost || 0) + (tb.boostToTeam || 0);
      });

      const tuneBreaksPerRotation = 1;

      // Community data: 40 Tune Break Boost ≈ 40% increase → 0.01 per point
      const baseTuneBreakDmg = 5000 * (1 + totalTuneBreakBoost * 0.01);
      tuneBreakDmg += baseTuneBreakDmg * tuneBreaksPerRotation * defMult;

      tuneBreakMembers.forEach(m => {
        const tb = CHAR_BUFF_TABLE[m.name].tuneBreak;
        if (tb.ruptureDmgMult) {
          const responseDmg = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (tb.ruptureDmgMult / 100);
          tuneBreakDmg += responseDmg * tuneBreaksPerRotation * defMult * resMult;
        }
      });

      const mornyeMem = tuneBreakMembers.find(m => CHAR_BUFF_TABLE[m.name].tuneBreak.interferedDmgAmp);
      if (mornyeMem) {
        tuneBreakAmp = CHAR_BUFF_TABLE[mornyeMem.name].tuneBreak.interferedDmgAmp;
        const interferedUptime = Math.min(1, (8 * tuneBreaksPerRotation) / rotTime);
        tuneBreakDeepenMult *= 1 + (tuneBreakAmp / 100) * interferedUptime;
      }

      const maxStrain = Math.max(...tuneBreakMembers.map(m => CHAR_BUFF_TABLE[m.name].tuneBreak.maxStrainStacks || 0));
      if (maxStrain > 0 && totalTuneBreakBoost > 0) {
        const strainDmgPct = maxStrain * totalTuneBreakBoost * 0.12;
        const strainUptime = Math.min(1, (8 * tuneBreaksPerRotation) / rotTime);
        tuneBreakDeepenMult *= 1 + (strainDmgPct / 100) * strainUptime;
      }
    }
    dotDmgPerRotation += tuneBreakDmg;

    let totalRotDmg = 0;
    const memberDmgArr = [];
    // Sub-DPS field time: off-field seconds shared among sub-DPS members
    const mainOnField = mainDps.d.onField || 15;
    const offFieldTime = Math.max(0, rotTime - mainOnField);
    const numSubDps = mems.filter(m => m.name !== mainDps.name && (m.d.totalMult || 0) > 0).length || 1;
    const subFieldEach = offFieldTime / numSubDps;
    mems.forEach(m => {
      let mult = m.d.totalMult || 0;
      if (mult === 0) { memberDmgArr.push({ name: m.name, dmg: 0 }); return; }
      const mBase = m.baseStat;
      const isMain = m.name === mainDps.name;
      if (isMain && seqTotalMultBonus > 0) mult = mult * (1 + seqTotalMultBonus / 100);
      // Sub-DPS: scale mult by their share of off-field time vs their own on-field requirement
      if (!isMain) {
        const subOnField = m.d.onField ?? 15;
        const fieldRatio = Math.min(1, subFieldEach / subOnField);
        mult = mult * fieldRatio;
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
        let sAtkPct = 0, sCr = 5, sCd = 150, sElem = 0, sSkillDmg = 0, sDeepen = 0;
        let sBasicDmg = 0, sHeavyDmg = 0, sLibDmg = 0, sEchoDmg = 0, sCoordDmg = 0, sDefIgnore = 0;
        let sDefShred = 0, sResShred = 0;
        const teamRotTime = mainDps.d.rotTime || 25;
        // Default echo stats for sub-DPS if not configured, based on echo preset
        const echoPreset = sEq?.echoPreset || 'default';
        if (sEchoes.length === 0) {
          if (echoPreset === 'er') {
            // Energy Regen preset: reduced ATK focus, ER main stats instead
            sAtkPct += 18 + 18; // two 1-cost ATK% only (4-cost goes to ER, one 3-cost goes to ER)
            sCr += 22.5; // 3 Crit Rate substats
            sCd += 45; // 3 Crit DMG substats
            sElem += 30; // one 3-cost Elem DMG (other is ER)
          } else if (echoPreset === 'support') {
            // Support preset: HP%/DEF% focused, minimal DPS contribution
            sAtkPct += 18; // one 1-cost ATK% only
            sCr += 15; // 2 Crit Rate substats
            sCd += 30; // 2 Crit DMG substats
            sElem += 30; // one 3-cost Elem DMG
          } else {
            // Default preset: ATK/Crit focused (assumes: 4-cost ATK%/CR, 3-cost ElemDMG×2, 1-cost ATK%×2, +3 CR subs, +3 CD subs)
            sAtkPct += 30 + 18 + 18; // 4-cost ATK% + two 1-cost ATK%
            sCr += 22.5; // 3 Crit Rate substats
            sCd += 45; // 3 Crit DMG substats
            sElem += 60; // two 3-cost Elem DMG
          }
        }
        // Collect buffs from ALL teammates
        mems.forEach(other => {
          if (other.name === m.name) return;
          const obt = CHAR_BUFF_TABLE[other.name];
          if (!obt) return;
          (obt.outroBuffs || []).forEach(b => {
            if (b.target === 'next' || b.target === 'enemy') {
              const uptime = Math.min(1, (b.duration || 14) / teamRotTime);
              const val = b.value * uptime;
              if (b.stat === 'atkPct' && m.scaling === 'ATK') sAtkPct += val;
              else if (b.stat === 'allDmg' || b.stat === 'elemDmg') sElem += val;
              else if (b.stat === 'deepen') sDeepen += val;
              else if (b.stat === 'basicDmg') sBasicDmg += val;
              else if (b.stat === 'heavyDmg') sHeavyDmg += val;
              else if (b.stat === 'libDmg') sLibDmg += val;
              else if (b.stat === 'echoDmg') sEchoDmg += val;
              else if (b.stat === 'critRate') sCr += val;
              else if (b.stat === 'critDmg') sCd += val;
              else if (b.stat === 'skillDmg') sSkillDmg += val;
              else if (b.stat === 'resShred') sResShred += val;
              else if (b.stat === 'defShred') sDefShred += val;
            }
          });
          (obt.libBuffs || []).forEach(b => {
            if (b.target === 'team') {
              const uptime = Math.min(1, (b.duration || 25) / teamRotTime);
              const val = b.value * uptime;
              if (b.stat === 'atkPct' && m.scaling === 'ATK') sAtkPct += val;
              else if (b.stat === 'allDmg') sElem += val;
              else if (b.stat === 'critRate') sCr += val;
              else if (b.stat === 'critDmg') sCd += val;
              else if (b.stat === 'echoDmg') sEchoDmg += val;
            }
          });
          // Debuffs from ALL teammates benefit everyone
          (obt.debuffs || []).forEach(db => {
            if (db.stat === 'defShred') sDefShred += db.value;
            else if (db.stat === 'resShred') sResShred += db.value;
            else if (db.stat === 'offTune') sDeepen += db.value;
            else if (db.stat === 'havocBane') sDefShred += db.value * 2;
          });
        });
        // Own self-buffs
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
          // Own debuffs
          (mbt.debuffs || []).forEach(db => {
            if (db.stat === 'defShred') sDefShred += db.value;
            else if (db.stat === 'resShred') sResShred += db.value;
            else if (db.stat === 'offTune') sDeepen += db.value;
          });
        }
        // Sub-DPS weapon passive
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
        // Echo set (HP/DEF scaling support)
        if (m.echoSet) {
          const ek2 = sEl + 'Dmg';
          const p2 = m.echoSet.p2val || {}, p5 = m.echoSet.p5val || {};
          if (m.scaling === 'ATK') { if (p2.atkPct) sAtkPct += p2.atkPct; if (p5.atkPct) sAtkPct += p5.atkPct; }
          else if (m.scaling === 'HP') { if (p2.hpPct) sAtkPct += p2.hpPct; if (p5.hpPct) sAtkPct += p5.hpPct; }
          else if (m.scaling === 'DEF') { if (p2.defPct) sAtkPct += p2.defPct; if (p5.defPct) sAtkPct += p5.defPct; }
          if (p2.critRate) sCr += p2.critRate; if (p5.critRate) sCr += p5.critRate;
          if (p2[ek2]) sElem += p2[ek2]; if (p5[ek2]) sElem += p5[ek2];
          if (p2.skillDmg) sSkillDmg += p2.skillDmg; if (p5.skillDmg) sSkillDmg += p5.skillDmg;
        }
        // Element resonance for sub-DPS
        const subElCounts = {};
        mems.forEach(mm => { const el = mm.d.element; if (el) subElCounts[el] = (subElCounts[el] || 0) + 1; });
        if (m.d.element && subElCounts[m.d.element] >= 2) sElem += 10;
        // Weapon substat
        if (m.weapSubstat === 'Crit Rate') sCr += parseFloat(m.weapSubVal) || 0;
        if (m.weapSubstat === 'Crit DMG') sCd += parseFloat(m.weapSubVal) || 0;
        if (m.weapSubstat === sStatKey) sAtkPct += parseFloat(m.weapSubVal) || 0;
        // Echo main/substats
        const sMainStatVals = {
          4: { 'ATK%': 30, 'HP%': 30, 'DEF%': 30, 'Crit Rate': 22, 'Crit DMG': 44, 'Healing Bonus': 26, 'Energy Regen': 32 },
          3: { 'ATK%': 30, 'HP%': 30, 'DEF%': 30, 'Glacio DMG': 30, 'Fusion DMG': 30, 'Electro DMG': 30, 'Aero DMG': 30, 'Spectro DMG': 30, 'Havoc DMG': 30, 'Energy Regen': 32 },
          1: { 'ATK%': 18, 'HP%': 18, 'DEF%': 18 },
        };
        const sSubVals = { [sStatKey]: 9, 'Crit Rate': 7.5, 'Crit DMG': 15, 'Energy Regen': 8, 'Resonance Skill DMG': 9 };
        sEchoes.forEach((echo, ei) => {
          if (!echo || typeof echo !== 'object') return;
          const cost = ei === 0 ? 4 : ei < 3 ? 3 : 1;
          if (echo.mainStat) {
            const val = sMainStatVals[cost]?.[echo.mainStat] || 0;
            if (echo.mainStat === sStatKey) sAtkPct += val;
            else if (echo.mainStat === 'Crit Rate') sCr += val;
            else if (echo.mainStat === 'Crit DMG') sCd += val;
            else if (echo.mainStat === sElDmgKey) sElem += val;
          }
          (echo.substats || []).forEach(sub => {
            const val = sSubVals[sub];
            if (!val) return;
            if (sub === sStatKey) sAtkPct += val;
            else if (sub === 'Crit Rate') sCr += val;
            else if (sub === 'Crit DMG') sCd += val;
            else if (sub === 'Resonance Skill DMG') sSkillDmg += val;
          });
        });
        const sEffAtk = mBase * (1 + sAtkPct / 100);
        const sAvgCrit = 1 + (Math.min(sCr, 100) / 100) * (sCd / 100 - 1);
        let sTypeDmg = sSkillDmg;
        const focus = m.d.dmgFocus || [];
        if (focus.includes('Basic ATK')) sTypeDmg += sBasicDmg;
        if (focus.includes('Heavy ATK')) sTypeDmg += sHeavyDmg;
        if (focus.includes('Liberation')) sTypeDmg += sLibDmg;
        if (focus.includes('Echo')) sTypeDmg += sEchoDmg;
        if (focus.includes('Coordinated ATK')) sTypeDmg += sCoordDmg;
        // Wiki: all DMG bonuses additive, deepen is separate multiplicative layer
        const sDmgBonus = (1 + (sElem + sTypeDmg) / 100) * (1 + sDeepen / 100);
        // Wiki: DEF Reduction applied first, then DEF Ignore inside formula
        const sReducedDef = enemyDef90 * Math.max(0, 1 - sDefShred / 100);
        const sEffDef = sReducedDef * Math.max(0, 1 - sDefIgnore / 100);
        const sDefMult = Math.min(2, attackerFactor / (attackerFactor + sEffDef)); // Wiki: capped at 200%
        const sBaseRes = getEnemyRes(m.d.element);
        const sResMult = calcResMult(sBaseRes, sResShred);
        const sDmg = sEffAtk * (mult / 100) * sAvgCrit * sDmgBonus * sDefMult * sResMult;
        totalRotDmg += sDmg;
        memberDmgArr.push({ name: m.name, dmg: sDmg });
      }
    });
    const memberDps = memberDmgArr.map(m => {
      const pct = totalRotDmg > 0 ? Math.round(m.dmg / totalRotDmg * 100) : 0;
      return { name: m.name, dmg: m.dmg, pct };
    });
    const realDps = Math.round((totalRotDmg + dotDmgPerRotation) * tuneBreakDeepenMult / rotTime);

    // ── PERFECT TIER: Full DPS + echo active skill damage ──
    // Echo active skill damage — use actual dmg data from ECHO_DATA
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
          // Include echo DMG bonus from sets and weapon passives
          let echoSkillBonus = 0;
          if (m.echoSet) {
            const p2 = m.echoSet.p2val || {}, p5 = m.echoSet.p5val || {};
            if (p2.echoDmg) echoSkillBonus += p2.echoDmg;
            if (p5.echoDmg) echoSkillBonus += p5.echoDmg;
          }
          const echoDmgMult = 1 + echoSkillBonus / 100;
          // Use the echo user's own crit stats
          const isMain = m.name === mainDps.name;
          const echoCrit = isMain ? avgCrit : (() => {
            let eCr = 5, eCd = 150;
            if (m.weapSubstat === 'Crit Rate') eCr += parseFloat(m.weapSubVal) || 0;
            if (m.weapSubstat === 'Crit DMG') eCd += parseFloat(m.weapSubVal) || 0;
            if (m.weapon?.passive) { const wp = parsePassive(m.weapon.passive, m.d.element); eCr += wp.critRate; eCd += wp.critDmg; }
            if (m.echoSet) { const p2 = m.echoSet.p2val || {}, p5 = m.echoSet.p5val || {}; if (p2.critRate) eCr += p2.critRate; if (p5.critRate) eCr += p5.critRate; }
            return 1 + (Math.min(eCr, 100) / 100) * (eCd / 100 - 1);
          })();
          echoActiveDmg += echoBase * (echoDmgPct / 100) * echoCrit * echoDmgMult * defMult * echoResMult;
        }
      }
    });
    // Perfect = Full + echo active skills
    const perfectDps = Math.round(realDps + (echoActiveDmg / rotTime));

    let syn = 0;
    if (mems.some(m => m.d.role === 'Healer')) syn += 25;
    if (mems.some(m => m.d.role === 'Support' || m.d.role === 'Sub DPS')) syn += 25;
    if (allBuffs.length >= 2) syn += 15;
    if (allDebuffs.length >= 1) syn += 10;
    if (allBuffs.some(b => b.buff.includes(mainDps.d.element))) syn += 15;
    if (mainDps.d.dmgFocus?.length > 0 && allBuffs.some(b => mainDps.d.dmgFocus.some(df => b.buff.includes(df)))) syn += 10;
    syn = Math.min(syn, 100);
    const warnings = [];
    if (mems.length < 3) {
      warnings.push('Incomplete team');
    } else {
      if (!mems.some(m => m.d.role === 'Healer')) warnings.push('No healer in team');
      const els = new Set(mems.map(m => m.d.element));
      if (els.size === mems.length) warnings.push('No element resonance');
    }
    const dotDps = Math.round(dotDmgPerRotation / rotTime);

    // Build rotation timeline for visualizer
    const rotationTimeline = (() => {
      const timeline = [];
      const buffs = [];
      let t = 0;
      // Sort: main DPS first, then sub-DPS by onField descending, healer/support last
      const ordered = [...mems].sort((a, b) => {
        if (a.name === mainDps.name) return -1;
        if (b.name === mainDps.name) return 1;
        const roleOrder = { 'Main DPS': 0, 'Sub DPS': 1, 'Support': 2, 'Healer': 3 };
        return (roleOrder[a.d.role] || 2) - (roleOrder[b.d.role] || 2);
      });
      // Assign field time segments
      ordered.forEach(m => {
        const rawOnField = m.d.onField ?? (m.name === mainDps.name ? 15 : 5);
        const onField = Math.min(rawOnField, Math.max(0, rotTime - t)); // clamp to remaining time
        if (onField <= 0) return; // no time left in rotation
        timeline.push({ name: m.name, element: m.d.element, role: m.d.role, start: t, duration: onField });
        // Collect outro buffs with timing
        const bt = CHAR_BUFF_TABLE[m.name];
        if (bt) {
          (bt.outroBuffs || []).forEach(b => {
            if (b.target === 'next' || b.target === 'enemy') {
              const dur = b.duration || 14;
              buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t + onField, duration: dur });
            }
          });
          (bt.libBuffs || []).forEach(b => {
            if (b.target === 'team') {
              buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t, duration: b.duration || 25 });
            }
          });
        }
        t += onField;
      });
      return { segments: timeline, buffs, totalTime: rotTime };
    })();

    return { members: mems, mainDps, allBuffs, allDebuffs, effAtk, critRate: cr, critDmg: cd, elemDmg, skillDmg, deepen, atkPct, defShred, resShred, defIgnore, avgCrit, defMult, resMult, score, rawDps, realDps, perfectDps, dotDps, hasFrazzle, hasErosion, hasFusionBurst, hasElectroFlare, synergy: syn, warnings, memberDps, rotationTimeline };
  }, [teamEquipment, enemyLevel, enemyEcho]);

  // Memoize active team stats to avoid recalculating on every render
  const activeTeamData = state.teams?.[state.activeTeamIndex] || state.teams?.[0] || { name: 'Team 1', slots: [null, null, null] };
  const activeTeamStats = useMemo(() =>
    calcTeamStats(activeTeamData.slots, state.activeTeamIndex),
    [calcTeamStats, activeTeamData.slots, state.activeTeamIndex]
  );

  return (
          <div role="tabpanel" id="tabpanel-teams" aria-labelledby="tab-teams" tabIndex="0">
          <TabErrorBoundary tabName="Teams">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="teams" />

            {(() => {
              const activeTeam = state.teams[state.activeTeamIndex] || state.teams[0];
              const teamSlots = activeTeam.slots;
              const openSelector = (slotIdx) => {
                setTeamSelectorSlot(slotIdx);
                setTeamSearch('');
                setTeamElementFilter('all');
                setTeamRarityFilter('all');
                setTeamBuffFilter('all');
                setTeamDebuffFilter('all');
                setTeamDmgFilter('all');
                setTeamRoleFilter('all');
                setTeamSelectorOpen(true);
                haptic.light();
              };

              const selectCharacter = (name) => {
                dispatch({ type: 'SET_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: teamSelectorSlot, character: name });
                setTeamSelectorOpen(false);
                haptic.success();
              };

              const removeFromSlot = async (slotIdx) => {
                const charName = teamSlots[slotIdx];
                if (await confirm?.({ title: 'Remove character', message: `Remove ${charName || 'this character'} from the team?`, confirmLabel: 'Remove', destructive: true })) {
                  dispatch({ type: 'CLEAR_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: slotIdx });
                  haptic.light();
                }
              };

              // All available characters for selection
              const allCharNames = [...ALL_5STAR_RESONATORS, ...ALL_4STAR_RESONATORS];

              // Characters already in this team (excluding current slot)
              const usedInTeam = new Set(teamSlots.filter((s, i) => s && i !== teamSelectorSlot));

              // Compute recommended teammates from current team members' team suggestions
              const recommendedNames = new Set();
              teamSlots.filter(s => s).forEach(charInSlot => {
                const d = CHARACTER_DATA[charInSlot];
                if (!d?.teams) return;
                d.teams.forEach(teamStr => {
                  teamStr.split('+').map(m => m.trim()).forEach(m => {
                    if (m !== charInSlot && !usedInTeam.has(m)) recommendedNames.add(m);
                  });
                });
              });

              // Filter characters for selector
              const filteredChars = allCharNames.filter(name => {
                if (usedInTeam.has(name)) return false;
                if (teamSearch && !name.toLowerCase().includes(teamSearch.toLowerCase())) return false;
                const data = CHARACTER_DATA[name];
                if (!data) return false;
                if (teamElementFilter !== 'all' && data.element !== teamElementFilter) return false;
                if (teamRarityFilter !== 'all' && data.rarity !== Number(teamRarityFilter)) return false;
                if (teamBuffFilter !== 'all' && !(data.buffs || []).some(b => b.includes(teamBuffFilter))) return false;
                if (teamDebuffFilter !== 'all' && !(data.debuffs || []).some(b => b.includes(teamDebuffFilter))) return false;
                if (teamDmgFilter !== 'all' && !(data.dmgFocus || []).includes(teamDmgFilter)) return false;
                if (teamRoleFilter !== 'all' && data.role !== teamRoleFilter) return false;
                return true;
              }).sort((a, b) => {
                const aRec = recommendedNames.has(a) ? 0 : 1;
                const bRec = recommendedNames.has(b) ? 0 : 1;
                if (aRec !== bRec) return aRec - bRec;
                // 5★ before 4★
                const aRar = CHARACTER_DATA[a]?.rarity || 0;
                const bRar = CHARACTER_DATA[b]?.rarity || 0;
                if (aRar !== bRar) return bRar - aRar;
                // Within each group, sort newest first (later in array = newer)
                const aIdx = allCharNames.indexOf(a);
                const bIdx = allCharNames.indexOf(b);
                return bIdx - aIdx;
              });

              // P6-FIX: Element color utilities now imported from appcore-data.js (F-P6-046)

              return (
                <div className="space-y-3">
                  {/* Team Card — selector row + grid + stats all inside one Card */}
                  <Card>
                    <CardHeader action={
                      <div className="flex flex-wrap gap-1 items-center">
                        <button
                          onClick={() => {
                            try {
                              const data = JSON.stringify({ teams: state.teams, activeTeamIndex: state.activeTeamIndex, equipment: teamEquipment }, null, 2);
                              const blob = new Blob([data], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a'); a.href = url; a.download = 'ww-teams.json'; a.click();
                              URL.revokeObjectURL(url);
                              toast?.addToast?.('Teams exported!', 'success');
                            } catch { toast?.addToast?.('Export failed', 'error'); }
                          }}
                          className="kuro-btn text-[10px] px-2 py-1.5 whitespace-nowrap"
                          aria-label="Export team loadouts"
                        >
                          <Download size={12} />
                        </button>
                        <button
                          onClick={() => {
                            const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
                            input.onchange = (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                try {
                                  const data = JSON.parse(ev.target.result);
                                  if (!data.teams || !Array.isArray(data.teams)) throw new Error('Invalid format');
                                  dispatch({ type: 'IMPORT_TEAMS', teams: data.teams, activeTeamIndex: data.activeTeamIndex });
                                  if (data.equipment && typeof data.equipment === 'object') {
                                    setTeamEquipment(data.equipment);
                                    try { localStorage.setItem('ww-team-equipment', JSON.stringify(data.equipment)); } catch {}
                                  }
                                  toast?.addToast?.('Teams imported!', 'success');
                                } catch (err) { toast?.addToast?.('Invalid file: ' + err.message, 'error'); }
                              };
                              reader.readAsText(file);
                            };
                            input.click();
                          }}
                          className="kuro-btn kuro-btn-primary text-[10px] px-2 py-1.5 whitespace-nowrap"
                          aria-label="Import team loadouts"
                        >
                          <Upload size={12} />
                        </button>
                        <button
                          onClick={() => {
                            try {
                              const team = state.teams[state.activeTeamIndex] || state.teams[0];
                              const slots = team.slots;
                              if (!slots.some(s => s)) return;
                              const stats = calcTeamStats(slots, state.activeTeamIndex);
                              const charParts = slots.filter(s => s).map(name => {
                                const eqKey = state.activeTeamIndex + ':' + name;
                                const eq = teamEquipment[eqKey];
                                const d = CHARACTER_DATA[name];
                                const weapName = (eq?.weapon) || d?.bestWeapon || 'None';
                                return `${name} (${weapName})`;
                              });
                              const lines = [`Team: ${team.name || 'Team ' + (state.activeTeamIndex + 1)}`];
                              lines.push(charParts.join(' | '));
                              if (stats) {
                                lines.push(`Raw: ${stats.rawDps.toLocaleString()}/s | Full: ${stats.realDps.toLocaleString()}/s | Perfect: ${stats.perfectDps.toLocaleString()}/s`);
                              }
                              const text = lines.join('\n');
                              navigator.clipboard.writeText(text);
                              toast?.addToast?.('Team copied!', 'success');
                              haptic.light();
                            } catch { toast?.addToast?.('Share failed', 'error'); }
                          }}
                          className="kuro-btn text-[10px] px-2 py-1.5 whitespace-nowrap"
                          aria-label="Copy team build to clipboard"
                        >
                          <Share2 size={12} />
                        </button>
                        <button
                          onClick={() => {
                            const slots = (state.teams[state.activeTeamIndex] || state.teams[0]).slots;
                            if (!slots.some(s => s)) return;
                            if (teamCompareEntries.length >= 5) return;
                            setTeamCompareEntries(prev => [...prev, { id: Date.now(), slots: slots.slice(), teamIdx: state.activeTeamIndex }]);
                            haptic.success();
                          }}
                          disabled={teamCompareEntries.length >= 5 || !(state.teams[state.activeTeamIndex] || state.teams[0]).slots.some(s => s)}
                          className="kuro-btn kuro-btn-primary active-gold text-[10px] px-2 py-1.5 whitespace-nowrap"
                          aria-label="Add current team to comparison"
                        >
                          + Compare
                        </button>
                        <button
                          onClick={async () => { if (await confirm?.({ title: 'Clear team', message: 'Remove all characters from this team?', confirmLabel: 'Clear', destructive: true })) { dispatch({ type: 'CLEAR_TEAM', teamIndex: state.activeTeamIndex }); haptic.medium(); } }}
                          className="kuro-btn text-[10px] px-2 py-1.5 whitespace-nowrap"
                          aria-label="Clear all slots in current team"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    }>
                      <Users size={14} className="text-yellow-400" /> Team Builder
                    </CardHeader>
                    <CardBody>
                      {/* Team Selector Tabs — P6-FIX: ARIA tab pattern (F-P6-059) */}
                      <div className="flex gap-1 mb-3" role="tablist" aria-label="Team selector" onKeyDown={(e) => {
                        const idx = state.activeTeamIndex;
                        let next;
                        if (e.key === 'ArrowRight') { e.preventDefault(); next = (idx + 1) % state.teams.length; }
                        else if (e.key === 'ArrowLeft') { e.preventDefault(); next = (idx - 1 + state.teams.length) % state.teams.length; }
                        if (next !== undefined) { dispatch({ type: 'SET_ACTIVE_TEAM', index: next }); setTimeout(() => e.currentTarget.children[next]?.focus(), 50); }
                      }}>
                        {state.teams.map((team, idx) => {
                          const hasChars = team.slots.some(s => s);
                          const isActive = state.activeTeamIndex === idx;
                          return (
                            <button
                              key={idx}
                              role="tab"
                              aria-selected={isActive}
                              tabIndex={isActive ? 0 : -1}
                              onClick={() => { dispatch({ type: 'SET_ACTIVE_TEAM', index: idx }); haptic.light(); }}
                              className={`kuro-btn flex-1 min-w-0 flex items-center justify-center gap-1 ${
                                isActive ? 'active-gold' : ''
                              }`}
                            >
                              <span className="truncate">{team.name}</span>
                              {hasChars && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 flex-shrink-0" aria-hidden="true" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Character Cards Grid — E2-FP2: hero treatment for active team */}
                      <div className="grid grid-cols-3 gap-2 p-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5" style={{ boxShadow: '0 0 16px rgba(237,175,24,0.08)' }}>
                        {!teamSlots.some(s => s) && (
                          <div className="col-span-3 text-center py-4">
                            <div className="text-gray-500 text-sm mb-1">No characters assigned</div>
                            <p className="text-gray-600 text-[10px]">Select a slot below to add a Resonator to this team</p>
                          </div>
                        )}
                        {teamSlots.map((charName, slotIdx) => {
                          const charData = charName ? CHARACTER_DATA[charName] : null;
                          const imgUrl = charName ? (collectionImages[charName] || '') : '';
                          const teamKey = `team-${charName}`;
                          const framing = charName ? getImageFraming(teamKey) : null;

                          if (!charName) {
                            return (
                              <button
                                key={slotIdx}
                                onClick={() => openSelector(slotIdx)}
                                className="relative overflow-hidden border-2 border-dashed rounded-lg border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all flex flex-col items-center justify-center gap-1.5 group"
                                style={{ height: '160px', contain: 'paint' }}
                                aria-label={`Add resonator to slot ${slotIdx + 1}`}
                              >
                                <Plus size={24} className="text-yellow-500/50 group-hover:text-yellow-400 transition-colors" />
                                <span className="text-[10px] text-yellow-500/40 group-hover:text-yellow-400 font-medium transition-colors">Add</span>
                              </button>
                            );
                          }

                          const rarity5 = charData?.rarity === 5;
                          return (
                            <div
                              key={slotIdx}
                              className={`relative overflow-hidden border rounded-lg text-center ${!framingMode ? 'collection-card' : ''} cursor-pointer group ${framingMode && editingImage === teamKey ? 'border-emerald-500 ring-2 ring-emerald-500/50' : rarity5 ? 'bg-yellow-500/10 border-yellow-500/30 holo-5star' : 'bg-purple-500/10 border-purple-500/30'}`}
                              style={{ height: '160px', contain: 'paint' }}
                              onClick={() => {
                                if (framingMode) {
                                  setEditingImage(teamKey);
                                } else {
                                  openSelector(slotIdx);
                                }
                              }}
                            >
                              {framingMode && editingImage === teamKey && (
                                <div className="absolute top-1 left-1 z-20 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <span className="text-black text-[10px]">✓</span>
                                </div>
                              )}
                              {imgUrl && (
                                <div className="absolute inset-0 breath-zoom">
                                <img
                                  src={imgUrl}
                                  alt={charName}
                                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                  style={{
                                    transform: `scale(${framing.zoom / 100}) translate(${-framing.x}%, ${-framing.y}%)`,
                                  }}
                                  loading="lazy"
                                  onError={hideOnError}
                                />
                                </div>
                              )}
                              {/* P6-FIX: Increased from w-5 h-5 to w-[28px] h-[28px] for touch targets (F-P6-050) */}
                              {!framingMode && <button
                                onClick={(e) => { e.stopPropagation(); removeFromSlot(slotIdx); }}
                                className="absolute top-1 right-1 z-20 w-[28px] h-[28px] aspect-square p-0 rounded-lg bg-red-500/80 text-white flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity btn-icon-square"
                                aria-label={`Remove ${charName} from slot ${slotIdx + 1}`}
                              >
                                <X size={12} />
                              </button>}
                              <div className="absolute bottom-0 left-0 right-0 z-10 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                                <div className={`${rarity5 ? 'text-yellow-400' : 'text-purple-400'} text-[8px]`}>{rarity5 ? '★★★★★' : '★★★★'}</div>
                                <div className="text-[10px] truncate text-gray-200">{charName}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Team Elements Summary */}
                      {teamSlots.some(s => s) && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {teamSlots.filter(s => s).map((name, i) => {
                            const d = CHARACTER_DATA[name];
                            return d ? (
                              <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                                style={{ color: getElementColor(d.element), background: getElementBg(d.element), border: `1px solid ${getElementBorder(d.element)}` }}>
                                {d.element}
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </CardBody>
                  </Card>

                  {/* Team Overview + Damage Analysis (merged) */}
                  {(() => {
                    // Use memoized stats for active team
                    const stats = activeTeamStats;
                    if (!stats) return null;
                    const { members, mainDps, allBuffs, allDebuffs, effAtk, critRate: cr, critDmg: cd, elemDmg, skillDmg, deepen, atkPct, defShred, resShred, defIgnore, avgCrit, score, rawDps, realDps, perfectDps, synergy, warnings, memberDps, rotationTimeline } = stats;
                    const roleColors = { 'Main DPS': { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }, 'Sub DPS': { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' }, Support: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' }, Healer: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' } };

                    return (
                      <>
                      <Card>
                        <CardHeader><Zap size={14} className="text-yellow-400" /> Team Overview</CardHeader>
                        <CardBody>
                          <div className="space-y-3">
                            {/* Per-member: overview + damage breakdown */}
                            {members.map((m) => {
                              const rarity5 = m.d.rarity === 5;
                              const rc = roleColors[m.d.role] || roleColors.Support;
                              const isMain = m.name === mainDps.name;
                              return (
                                <div key={m.name} className="p-3 rounded-lg border hover:border-white/15 transition-colors space-y-2.5"
                                  style={{ background: 'var(--bg-stat)', borderColor: `${getElementColor(m.d.element)}25`, boxShadow: `0 0 12px ${getElementColor(m.d.element)}10` }}>

                                  {/* ── Section 1: Character Header ── */}
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-11 h-12 rounded-lg overflow-hidden border border-white/15 flex-shrink-0${rarity5 ? ' holo-5star' : ''}`}
                                      style={{ background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                                      {collectionImages[m.name] ? (
                                        <img src={collectionImages[m.name]} alt={m.name} className="w-full h-full object-cover object-top breath-zoom" onError={hideOnError} />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">{m.name[0]}</div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-white text-sm font-semibold">{m.name}</span>
                                        <span className={`text-[9px] ${rarity5 ? 'text-yellow-400' : 'text-purple-400'}`}>{rarity5 ? '★★★★★' : '★★★★'}</span>
                                      </div>
                                      <div className="flex items-center flex-wrap gap-1 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded ${rc.bg} ${rc.border} ${rc.text} border font-medium`}>{m.d.role}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded font-medium"
                                          style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                                          {m.d.element}
                                        </span>
                                        <span className="text-[10px] text-gray-500">{m.d.weapon}</span>
                                      </div>
                                    </div>
                                    {/* Auto Equip button */}
                                    {(() => {
                                      const aeqKey = state.activeTeamIndex + ':' + m.name;
                                      return (
                                        <button
                                          className="kuro-btn text-[10px] px-2 py-1 flex-shrink-0 self-start"
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
                                                  recSets.set(pcMatch[1].trim(), parseInt(pcMatch[2]));
                                                } else {
                                                  const plain = trimmed.replace(/\s+\d+pc$/i, '').trim();
                                                  if (ECHO_SETS[plain]) recSets.set(plain, 5);
                                                }
                                              });
                                            });
                                            const newEchoes = [null, null, null, null, null];
                                            const usedNames = new Set();
                                            const pickEcho = (tierList, setPrefs) => {
                                              for (const name of tierList) { if (!usedNames.has(name) && directEchoes.has(name)) { usedNames.add(name); return name; } }
                                              for (const [setName] of setPrefs) { for (const name of tierList) { if (usedNames.has(name)) continue; const ed = ECHO_DATA[name]; if (ed?.sets?.includes(setName)) { usedNames.add(name); return name; } } }
                                              return null;
                                            };
                                            const e0 = pickEcho(ALL_4COST_ECHOES, recSets);
                                            if (e0) newEchoes[0] = { name: e0, mainStat: null, substats: [] };
                                            for (let i = 1; i <= 2; i++) { const e = pickEcho(ALL_3COST_ECHOES, recSets); if (e) newEchoes[i] = { name: e, mainStat: null, substats: [] }; }
                                            for (let i = 3; i <= 4; i++) { const e = pickEcho(ALL_1COST_ECHOES, recSets); if (e) newEchoes[i] = { name: e, mainStat: null, substats: [] }; }
                                            let echoSetVal = '';
                                            if (recSets.size > 0) echoSetVal = [...recSets.keys()][0];
                                            setTeamEquipment(prev => {
                                              const n = { ...prev };
                                              n[aeqKey] = { ...(n[aeqKey] || {}), weapon: weapon || (n[aeqKey]?.weapon || null), echoes: newEchoes, echoSet: echoSetVal, sequence: n[aeqKey]?.sequence || 0 };
                                              return n;
                                            });
                                            haptic.success();
                                          }}
                                        >
                                          <Zap size={10} className="inline mr-0.5" />Auto Equip
                                        </button>
                                      );
                                    })()}
                                  </div>

                                  {/* ── Section 2: Base Stats ── */}
                                  <div>
                                    <div className="kuro-label">Base Stats (Lv.90)</div>
                                    <div className="flex flex-wrap gap-1">
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-[var(--border-medium)] text-gray-300">HP {(m.d.baseHp || 0).toLocaleString()}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-[var(--border-medium)] text-gray-300">ATK {m.charAtk}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-[var(--border-medium)] text-gray-300">DEF {(m.d.baseDef || 0).toLocaleString()}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400">+Weapon {m.weapAtk}</span>
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
                                                  setWeaponSelectorTarget({ teamIdx: state.activeTeamIndex, charName: m.name });
                                                  setWeaponSearch('');
                                                  setWeaponSelectorOpen(true);
                                                  haptic.light();
                                                }}
                                                title={eq.weapon || 'Select weapon'}
                                              >
                                                {equippedWeap && collectionImages[eq.weapon] ? (
                                                  <img src={collectionImages[eq.weapon]} alt={eq.weapon} className="w-full h-full object-contain rounded-lg" onError={hideOnError} />
                                                ) : equippedWeap ? (
                                                  <>
                                                    <Sword size={14} className={equippedWeap.rarity === 5 ? 'text-yellow-400' : 'text-purple-400'} />
                                                    <span className="text-[10px] text-gray-300 truncate w-full px-0.5 leading-tight mt-0.5">{eq.weapon.split(' ').slice(0, 2).join(' ')}</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Sword size={14} className="text-gray-500" />
                                                    <span className="text-[10px] text-gray-500">Weapon</span>
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
                                                        // Open stat config panel for equipped echo
                                                        setEchoStatPanel({ teamIdx: state.activeTeamIndex, charName: m.name, slotIdx: ei, echoName });
                                                      } else {
                                                        // Open echo selector
                                                        setEchoSelectorTarget({ teamIdx: state.activeTeamIndex, charName: m.name, slotIdx: ei });
                                                        setEchoSearch('');
                                                        setEchoSelectorOpen(true);
                                                      }
                                                      haptic.light();
                                                    }}
                                                  >
                                                    {echoName && collectionImages[echoName] ? (
                                                      <img src={collectionImages[echoName]} alt={echoName} className="w-full h-full object-contain rounded-lg" onError={hideOnError} />
                                                    ) : echoName ? (
                                                      <>
                                                        <Diamond size={12} className={`text-${costColor}-400`} />
                                                        <span className={`text-[10px] text-${costColor}-400 truncate w-full px-0.5 leading-tight`}>{echoName.split(' ').slice(0, 2).join(' ')}</span>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Diamond size={12} className="text-gray-500" />
                                                        <span className="text-[10px] text-gray-500">{costLabel}</span>
                                                      </>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                            {/* Weapon & Echo info beside grid */}
                                            <div className="flex-1 min-w-0 pt-0.5">
                                              {equippedWeap ? (
                                                <div className="text-[10px] space-y-0.5">
                                                  <div className="text-yellow-400/80 font-medium truncate">{eq.weapon}</div>
                                                  <div className="text-gray-500">{equippedWeap.stat} {equippedWeap.subStatValue}</div>
                                                </div>
                                              ) : m.d.bestWeapon ? (
                                                <div className="text-[10px] space-y-0.5">
                                                  <div><span className="text-gray-500">Rec: </span><span className="text-yellow-400/50">{m.d.bestWeapon}</span></div>
                                                  {m.d.bestEchoes && <div className="text-cyan-400/50">{m.d.bestEchoes.join(' + ')}</div>}
                                                </div>
                                              ) : null}
                                              {/* Echo summary */}
                                              {(() => {
                                                const equipped = (eq.echoes || []).filter(e => e != null);
                                                if (equipped.length === 0) return null;
                                                const echoNames = equipped.map(e => typeof e === 'object' ? e.name : e).filter(Boolean);
                                                // Count sonata sets
                                                const setCounts = {};
                                                echoNames.forEach(n => {
                                                  const ed = ECHO_DATA[n];
                                                  if (ed?.sets) ed.sets.forEach(s => { setCounts[s] = (setCounts[s] || 0) + 1; });
                                                });
                                                const activeSets = Object.entries(setCounts).filter(([, c]) => c >= 2);
                                                return (
                                                  <div className="text-[10px] mt-1 space-y-0.5">
                                                    <div className="text-cyan-400/70">{equipped.length}/5 echoes</div>
                                                    {activeSets.map(([setName, count]) => (
                                                      <div key={setName} className="text-gray-500">{setName} <span className="text-emerald-400/70">×{count}</span></div>
                                                    ))}
                                                  </div>
                                                );
                                              })()}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Echo Preset for non-main-DPS members */}
                                        {!isMain && (
                                          <div>
                                            <div className="text-[10px] text-gray-400 mb-0.5">Echo Preset</div>
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
                                                    className={`flex-1 py-1 rounded text-[10px] font-medium transition-all ${isActive ? `bg-${opt.color}-500/20 border-${opt.color}-500/40 text-${opt.color}-400 border` : 'border border-[var(--border-medium)] text-gray-500 hover:text-gray-300 hover:border-white/15'}`}
                                                    onClick={() => {
                                                      setTeamEquipment(prev => {
                                                        const n = { ...prev };
                                                        n[eqKey] = { ...(n[eqKey] || { weapon: null }), echoPreset: opt.value, echoes: [null,null,null,null,null], echoSet: '' };
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
                                            <span>Sequence · Refinement · Sonata</span>
                                          </summary>
                                        <div className="flex gap-2 mt-1">
                                          <div className="flex-1">
                                            <div className="text-[10px] text-gray-400 mb-0.5">Sequence</div>
                                            <div className="flex gap-0.5" role="radiogroup" aria-label={`${m.name} resonance sequence level`}>
                                              {[0,1,2,3,4,5,6].map(s => {
                                                const isActive = (eq.sequence || 0) === s;
                                                return (
                                                  <button key={s}
                                                    role="radio"
                                                    aria-checked={isActive}
                                                    className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all ${isActive ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 border' : 'border border-[var(--border-medium)] text-gray-500 hover:text-gray-300 hover:border-white/15'}`}
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
                                          <div className="flex-shrink-0">
                                            <div className="text-[10px] text-gray-400 mb-0.5">Refinement</div>
                                            <div className="flex gap-0.5" role="radiogroup" aria-label={`${m.name} weapon refinement level`}>
                                              {[1,2,3,4,5].map(r => {
                                                const isActive = (eq.refinement || 1) === r;
                                                return (
                                                  <button key={r}
                                                    role="radio"
                                                    aria-checked={isActive}
                                                    className={`min-w-[36px] py-1.5 rounded text-[10px] font-bold transition-all ${isActive ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 border' : 'border border-[var(--border-medium)] text-gray-500 hover:text-gray-300 hover:border-white/15'}`}
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

                                        {/* Sonata Set */}
                                        <div>
                                          <div className="text-[10px] text-gray-400 mb-0.5">Sonata Set</div>
                                          <KuroSelect
                                            value={eq.echoSet || ''}
                                            onChange={v => {
                                              setTeamEquipment(prev => {
                                                const n = { ...prev };
                                                n[eqKey] = { ...(n[eqKey] || { weapon: null, echoes: [null,null,null,null,null] }), echoSet: v || '' };
                                                return n;
                                              });
                                              haptic.light();
                                            }}
                                            options={[
                                              { value: '', label: 'Auto (from recommended)' },
                                              ...Object.keys(ECHO_SETS).map(setName => ({ value: setName, label: setName })),
                                            ]}
                                            className="w-full"
                                            ariaLabel={`${m.name} sonata echo set`}
                                            small
                                          />
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
                                        <span className="text-[10px] px-2 py-0.5 rounded font-medium"
                                          style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                                          {m.d.element} DMG
                                        </span>
                                        {(m.d.dmgFocus || []).map((df, di) => (
                                          <span key={di} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400">{df}</span>
                                        ))}
                                        {m.d.statScaling && (
                                          <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/25 text-violet-400">{m.d.statScaling} Scaling</span>
                                        )}
                                      </div>
                                    </div>
                                    {/* Buffs */}
                                    {m.d.buffs?.length > 0 && (
                                      <div className="min-w-0">
                                        <div className="kuro-label">Buffs</div>
                                        <div className="flex flex-wrap gap-1">
                                          {m.d.buffs.map((b, bi) => (
                                            <span key={bi} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">{b}</span>
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
                                            <span key={di} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400">{db}</span>
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
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/25 text-yellow-400">Eff.{mainDps.scaling !== 'ATK' ? mainDps.scaling : 'ATK'} {effAtk.toLocaleString()}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">CR {cr.toFixed(1)}%</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">CD {cd.toFixed(1)}%</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded font-medium"
                                          style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                                          {m.d.element} +{elemDmg.toFixed(0)}%
                                        </span>
                                        {skillDmg > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400">Skill +{skillDmg.toFixed(0)}%</span>}
                                        {atkPct > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">ATK% +{atkPct.toFixed(0)}%</span>}
                                        {deepen > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/25 text-purple-400">Deepen +{deepen.toFixed(0)}%</span>}
                                        {defShred > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400">DEF Shred {defShred}%</span>}
                                        {resShred > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400">RES Shred {resShred}%</span>}
                                        {defIgnore > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400">DEF Ignore {defIgnore}%</span>}
                                      </div>
                                    </div>
                                  )}

                                </div>
                              );
                            })}

                            {/* Aggregated buffs/debuffs */}
                            {allBuffs.length > 0 && (
                              <div>
                                <div className="kuro-label">Team Buffs</div>
                                <div className="flex flex-wrap gap-1">
                                  {allBuffs.map((b, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                                      {b.buff} <span className="text-gray-500">({b.source})</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {allDebuffs.length > 0 && (
                              <div>
                                <div className="kuro-label">Enemy Debuffs</div>
                                <div className="flex flex-wrap gap-1">
                                  {allDebuffs.map((b, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400">
                                      {b.debuff} <span className="text-gray-500">({b.source})</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* DPS Tiers: Raw / Full / Perfect + Synergy */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="kuro-stat kuro-stat-emerald p-2 text-center">
                                <div className="text-gray-400 text-[10px]">Raw DPS</div>
                                <div className="text-lg font-bold text-emerald-400 kuro-number" style={{ textShadow: '0 0 10px rgba(34,197,94,0.5)' }}>{rawDps.toLocaleString()}/s</div>
                                <div className="text-gray-500 text-[8px]">equipment only</div>
                              </div>
                              <div className="kuro-stat kuro-stat-cyan p-2 text-center">
                                <div className="text-gray-400 text-[10px]">Full DPS</div>
                                <div className="text-lg font-bold text-cyan-400 kuro-number" style={{ textShadow: '0 0 10px rgba(6,182,212,0.5)' }}>{realDps.toLocaleString()}/s</div>
                                <div className="text-gray-500 text-[8px]">+buffs &amp; debuffs</div>
                              </div>
                              <div className="kuro-stat kuro-stat-gold p-2 text-center">
                                <div className="text-gray-400 text-[10px]">Perfect DPS</div>
                                <div className="text-lg font-bold text-yellow-400 kuro-number" style={{ textShadow: '0 0 10px rgba(234,179,8,0.5)' }}>{perfectDps.toLocaleString()}/s</div>
                                <div className="text-gray-500 text-[8px]">+echo active skills</div>
                              </div>
                              <div className={`kuro-stat ${synergy >= 75 ? 'kuro-stat-emerald' : synergy >= 50 ? 'kuro-stat-gold' : 'kuro-stat-red'} p-2 text-center`}>
                                <div className="text-gray-400 text-[10px]">Synergy</div>
                                <div className={`text-lg font-bold kuro-number ${synergy >= 75 ? 'text-emerald-400' : synergy >= 50 ? 'text-amber-400' : 'text-red-400'}`} style={{ textShadow: `0 0 10px ${synergy >= 75 ? 'rgba(34,197,94,0.5)' : synergy >= 50 ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)'}` }}>{synergy}%</div>
                                <div className="text-gray-500 text-[8px]">team comp</div>
                              </div>
                            </div>

                            {/* DPS Breakdown per character */}
                            {memberDps && (
                              <div className="mt-2 space-y-1">
                                {memberDps.map(m => (
                                  <div key={m.name} className="flex items-center gap-2">
                                    <span className="text-[9px] text-gray-400 w-20 truncate">{m.name}</span>
                                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                      <div className="h-full rounded-full bg-cyan-500/50" style={{ width: `${m.pct}%` }} />
                                    </div>
                                    <span className="text-[9px] text-gray-500 w-8 text-right">{m.pct}%</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Rotation Timeline Visualizer */}
                            {rotationTimeline && rotationTimeline.segments.length > 0 && (
                              <div className="mt-3 p-3 rounded-xl bg-white/5 border border-[var(--border-medium)]">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Rotation Timeline ({rotationTimeline.totalTime}s)</div>
                                {/* Field time bars */}
                                <div className="flex rounded-lg overflow-hidden h-6 mb-2">
                                  {rotationTimeline.segments.map((seg, i) => {
                                    const pct = (seg.duration / rotationTimeline.totalTime) * 100;
                                    const elColors = { Glacio: '#06b6d4', Fusion: '#f97316', Electro: '#a855f7', Aero: '#10b981', Spectro: '#edaf18', Havoc: '#ec4899' };
                                    const color = elColors[seg.element] || '#6b7280';
                                    return (
                                      <div key={i} className="flex items-center justify-center relative" style={{ width: `${pct}%`, background: `${color}30`, borderRight: i < rotationTimeline.segments.length - 1 ? '1px solid rgba(0,0,0,0.3)' : 'none' }} title={`${seg.name}: ${seg.duration}s on-field`}>
                                        <span className="text-[8px] font-bold truncate px-0.5" style={{ color }}>{seg.name.split(' ')[0]}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Legend */}
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                  {rotationTimeline.segments.map((seg, i) => {
                                    const elColors = { Glacio: '#06b6d4', Fusion: '#f97316', Electro: '#a855f7', Aero: '#10b981', Spectro: '#edaf18', Havoc: '#ec4899' };
                                    const color = elColors[seg.element] || '#6b7280';
                                    return (
                                      <div key={i} className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                        <span className="text-[9px] text-gray-400">{seg.name} <span className="text-gray-500">{seg.duration}s</span></span>
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Buff uptime bars */}
                                {rotationTimeline.buffs.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-[var(--border-medium)]/30 space-y-1">
                                    <div className="text-[9px] text-gray-500 mb-1">Buff Windows</div>
                                    {rotationTimeline.buffs.slice(0, 6).map((buff, i) => {
                                      const startPct = Math.min((buff.start / rotationTimeline.totalTime) * 100, 100);
                                      const durPct = Math.min((buff.duration / rotationTimeline.totalTime) * 100, 100 - startPct);
                                      const statLabels = { atkPct: 'ATK', allDmg: 'All DMG', elemDmg: 'Elem DMG', deepen: 'Deepen', basicDmg: 'Basic', heavyDmg: 'Heavy', libDmg: 'Lib', echoDmg: 'Echo', skillDmg: 'Skill', critRate: 'CR', critDmg: 'CD', resShred: 'RES↓', defShred: 'DEF↓' };
                                      return (
                                        <div key={i} className="flex items-center gap-1.5">
                                          <span className="text-[8px] text-gray-500 w-14 truncate text-right">{buff.source.split(' ')[0]}</span>
                                          <div className="flex-1 h-2.5 rounded-full bg-white/5 relative overflow-hidden">
                                            <div className="absolute h-full rounded-full bg-emerald-500/40 flex items-center justify-center" style={{ left: `${startPct}%`, width: `${durPct}%` }}>
                                              <span className="text-[7px] text-emerald-300 font-medium truncate px-0.5">{statLabels[buff.stat] || buff.stat} +{buff.value}%</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {rotationTimeline.buffs.length > 6 && (
                                      <div className="text-[8px] text-gray-500 text-center mt-0.5">+{rotationTimeline.buffs.length - 6} more</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Warnings */}
                            {warnings.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {warnings.map((w, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center gap-1">
                                    <AlertTriangle size={12} /> {w}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* Accuracy note */}
                            <p className="text-[10px] text-gray-500 text-center mt-1">Raw: equipment only. Full: +team buffs, debuffs, DOTs. Perfect: +echo active skills.</p>
                          </div>
                        </CardBody>
                      </Card>

                      {/* DPS Comparison — computed from stored slots */}
                      {teamCompareEntries.length > 0 && (() => {
                        const computed = teamCompareEntries.map(entry => ({
                          ...entry,
                          stats: calcTeamStats(entry.slots, entry.teamIdx ?? 0),
                        })).filter(e => e.stats);
                        if (!computed.length) return null;
                        // Unified max across all tiers so bars are proportional to their numbers
                        const unifiedMax = Math.max(
                          ...computed.flatMap(e => [e.stats.rawDps, e.stats.realDps, e.stats.perfectDps]),
                          1
                        );
                        const bossEchoes = ALL_4COST_ECHOES.filter(n => ECHO_DATA[n]?.enemyRes);
                        return (
                        <Card id="team-dps-comparison">
                          <CardHeader action={
                            <button onClick={async () => { if (await confirm?.({ title: 'Clear comparison', message: 'Remove all comparison entries?', confirmLabel: 'Clear', destructive: true })) { setTeamCompareEntries([]); haptic.light(); } }}
                              className="kuro-btn text-[10px]"
                              aria-label="Clear all team comparisons">
                              Clear All
                            </button>
                          }><BarChart3 size={14} className="text-purple-400" /> DPS Comparison</CardHeader>
                          <CardBody>
                            {/* Enemy Target Selector */}
                            <div className="flex flex-wrap items-center gap-2 mb-3 p-2 rounded-lg border border-[var(--border-medium)]" style={{ background: 'var(--bg-stat)' }}>
                              <Sword size={12} className="text-red-400" />
                              <span className="text-gray-400 text-[10px] font-medium">Target:</span>
                              <button onClick={() => { setEnemyEchoSearch(''); setEnemyEchoModalOpen(true); haptic.light(); }}
                                className="kuro-btn text-[10px] px-2 py-1 flex-1 min-w-[120px] max-w-[240px] text-left truncate">
                                {enemyEcho ? (() => {
                                  const ed = ECHO_DATA[enemyEcho];
                                  const resEl = ed?.enemyRes ? Object.keys(ed.enemyRes)[0] : '';
                                  const resVal = ed?.enemyRes?.[resEl] || 10;
                                  return `${enemyEcho} (${resEl ? resEl.charAt(0).toUpperCase() + resEl.slice(1) + ' ' + resVal + '%' : '10%'})`;
                                })() : 'Default (10% all RES)'}
                              </button>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500 text-[10px]">Lv.</span>
                                <input type="text" inputMode="numeric" value={enemyLevel}
                                  onFocus={e => e.target.select()}
                                  onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v === '') { setEnemyLevel(''); return; } const n = parseInt(v, 10); setEnemyLevel(Number.isNaN(n) ? 90 : Math.max(1, Math.min(120, n))); }}
                                  onBlur={e => { if (!e.target.value || isNaN(parseInt(e.target.value))) setEnemyLevel(90); }}
                                  className="kuro-input w-12 text-[10px] px-1 py-0.5 text-center" />
                              </div>
                              <span className="text-gray-600 text-[9px]">DEF {792 + 8 * enemyLevel}</span>
                            </div>
                            <div className="space-y-3">
                              {computed.map((entry) => {
                                const s = entry.stats;
                                const rawPct = (s.rawDps / unifiedMax) * 100;
                                const fullPct = (s.realDps / unifiedMax) * 100;
                                const perfectPct = (s.perfectDps / unifiedMax) * 100;
                                return (
                                  <div key={entry.id} className="group p-2.5 rounded-lg border border-[var(--border-medium)] relative" style={{ background: 'var(--bg-stat)' }}>
                                    <div className="flex items-center justify-between mb-1.5 pr-8">
                                      <span className="text-[10px] font-medium text-gray-300 truncate" title={entry.slots.filter(Boolean).join(' / ')}>
                                        {entry.slots.filter(Boolean).join(' / ') || 'Empty Team'}
                                      </span>
                                    </div>
                                    <button onClick={() => { setTeamCompareEntries(prev => prev.filter(e => e.id !== entry.id)); haptic.light(); }}
                                      className="absolute top-1 right-1 z-20 w-[28px] h-[28px] aspect-square p-0 rounded-lg bg-red-500/80 text-white flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity btn-icon-square"
                                      aria-label="Remove this team from comparison">
                                      <X size={12} />
                                    </button>

                                    {/* Character cards */}
                                    <div className="flex gap-1.5 mb-2">
                                      {s.members.map((m, mi) => {
                                        const rarity5 = m.d.rarity === 5;
                                        const rc2 = roleColors[m.d.role] || roleColors.Support;
                                        return (
                                          <div key={mi} className={`flex-1 min-w-0 p-1.5 rounded-lg border text-center ${rarity5 ? 'border-yellow-500/50' : 'border-purple-500/50'}`}
                                            style={{
                                              background: rarity5 ? 'linear-gradient(to top, rgba(237,175,24,0.15), rgba(237,175,24,0.05))' : 'linear-gradient(to top, rgba(168,85,247,0.15), rgba(168,85,247,0.05))',
                                              boxShadow: rarity5 ? '0 0 12px rgba(237,175,24,0.15), inset 0 0 10px rgba(237,175,24,0.05)' : '0 0 12px rgba(168,85,247,0.15), inset 0 0 10px rgba(168,85,247,0.05)'
                                            }}>
                                            <div className="text-[10px] font-semibold truncate" style={{ color: getElementColor(m.d.element), textShadow: `0 0 8px ${getElementColor(m.d.element)}60` }}>{m.name}</div>
                                            <div className={`text-[8px] ${rarity5 ? 'text-yellow-400' : 'text-purple-400'}`}>{rarity5 ? '★★★★★' : '★★★★'}</div>
                                            <span className={`text-[8px] px-1 py-0.5 rounded ${rc2.bg} ${rc2.text} inline-block mt-0.5`}>{m.d.role}</span>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Three-tier DPS bars — each tier scaled independently */}
                                    {[
                                      { label: 'Raw', value: s.rawDps, pct: rawPct, color: '#22c55e' },
                                      { label: 'Full', value: s.realDps, pct: fullPct, color: '#06b6d4' },
                                      { label: 'Perfect', value: s.perfectDps, pct: perfectPct, color: '#eab308' },
                                    ].map((bar, bi) => (
                                      <div key={bi} className={bi < 2 ? 'mb-1' : 'mb-0.5'}>
                                        <div className="flex items-baseline justify-between mb-0.5">
                                          <span className="text-gray-400 text-[10px]">{bar.label}</span>
                                          <span className="font-bold text-xs kuro-number" style={{ color: bar.color, textShadow: `0 0 8px ${bar.color}99` }}>{bar.value.toLocaleString()}/s</span>
                                        </div>
                                        <div className="relative h-4 rounded" style={{ background: 'transparent' }}>
                                          <div className="absolute top-0 left-0 bottom-0 rounded transition-all duration-700"
                                            style={{
                                              width: Math.max(bar.pct, 4) + '%',
                                              background: `linear-gradient(90deg, ${bar.color}40, ${bar.color}20)`,
                                              border: `1px solid ${bar.color}90`,
                                              borderLeft: 'none',
                                              boxShadow: `0 0 12px ${bar.color}50, inset 0 0 15px ${bar.color}30`
                                            }} />
                                          <div className="absolute top-0 bottom-0 w-[2px] rounded-full"
                                            style={{ left: 0, background: bar.color, boxShadow: `0 0 8px ${bar.color}, 0 0 16px ${bar.color}80` }} />
                                        </div>
                                      </div>
                                    ))}

                                    {/* Quick stats */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-[var(--border-medium)]">
                                      <div className="text-[10px]"><span className="text-gray-500">DPS: </span><span className="text-white font-medium">{s.mainDps.name}</span></div>
                                      <div className="text-[10px]"><span className="text-gray-500">{s.mainDps.scaling !== 'ATK' ? s.mainDps.scaling : 'ATK'}: </span><span className="text-yellow-400 kuro-number">{s.effAtk}</span></div>
                                      <div className="text-[10px]"><span className="text-gray-500">CR: </span><span className="text-cyan-400 kuro-number">{s.critRate.toFixed(0)}%</span></div>
                                      <div className="text-[10px]"><span className="text-gray-500">CD: </span><span className="text-cyan-400 kuro-number">{s.critDmg.toFixed(0)}%</span></div>
                                      <div className="text-[10px]"><span className="text-gray-500">Rot: </span><span className="text-gray-300 kuro-number">{s.mainDps.d.rotTime || 25}s</span></div>
                                      {s.mainDps.scaling !== 'ATK' && <div className="text-[10px]"><span className="text-violet-400">{s.mainDps.scaling} scaling</span></div>}
                                      {s.defShred > 0 && <div className="text-[10px]"><span className="text-gray-500">DEF↓ </span><span className="text-red-400 kuro-number">{s.defShred}%</span></div>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {/* Side-by-side stats */}
                            {computed.length > 1 && (
                              <div className="mt-3 overflow-x-auto">
                                <table className="w-full text-[10px]">
                                  <thead>
                                    <tr className="border-b border-[var(--border-medium)]">
                                      <th className="text-left text-gray-500 py-1 pr-2">Stat</th>
                                      {computed.map((e, i) => (
                                        <th key={i} className="text-center text-gray-400 py-1 px-1">{e.stats.mainDps.name}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      ['Eff. ATK', e => e.stats.effAtk?.toLocaleString()],
                                      ['Crit Rate', e => Math.min(e.stats.critRate, 100).toFixed(1) + '%'],
                                      ['Crit DMG', e => e.stats.critDmg?.toFixed(1) + '%'],
                                      ['Elem DMG', e => e.stats.elemDmg?.toFixed(1) + '%'],
                                      ['DEF Shred', e => (e.stats.defShred || 0) + '%'],
                                      ['RES Shred', e => (e.stats.resShred || 0) + '%'],
                                      ['Synergy', e => e.stats.synergy + '%'],
                                    ].map(([label, fn]) => (
                                      <tr key={label} className="border-b border-[var(--border-medium)]/30">
                                        <td className="text-gray-500 py-0.5 pr-2">{label}</td>
                                        {computed.map((e, i) => {
                                          const val = fn(e);
                                          const nums = computed.map(c => parseFloat(fn(c)) || 0);
                                          const isMax = parseFloat(val) === Math.max(...nums) && nums.filter(n => n === Math.max(...nums)).length === 1;
                                          return <td key={i} className={`text-center py-0.5 px-1 ${isMax ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>{val}</td>;
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            {teamCompareEntries.length < 5 && (
                              <p className="text-gray-500 text-[10px] text-center mt-2">Tap <span className="text-yellow-400">+ Compare</span> to add more ({5 - teamCompareEntries.length} left)</p>
                            )}
                          </CardBody>
                        </Card>
                        );
                      })()}
                      </>
                    );
                  })()}

                  {/* Suggested Teams from Character Data */}
                  <Card>
                    <CardHeader><Target size={14} className="text-cyan-400" /> Team Suggestions</CardHeader>
                    <CardBody>
                      <div className="space-y-2 team-suggestions-grid">
                        {(() => {
                          const ownedNames = new Set([
                            ...Object.keys(collectionData.chars5Counts),
                            ...Object.keys(collectionData.chars4Counts),
                          ]);
                          const suggestions = [];
                          const seen = new Set();
                          const orderedChars = [...RELEASE_ORDER].reverse();
                          for (const name of orderedChars) {
                            const d = CHARACTER_DATA[name];
                            if (!d?.teams) continue;
                            for (const t of d.teams) {
                              if (seen.has(t)) continue;
                              seen.add(t);
                              const members = t.split('+').map(m => m.trim());
                              if (members.length < 2) continue;
                              const ownedCount = members.filter(m => ownedNames.has(m)).length;
                              suggestions.push({ text: t, members, ownedCount, allOwned: ownedCount === members.length });
                            }
                          }
                          // Score each suggestion: ownership + DPS estimate + role balance
                          suggestions.forEach(s => {
                            let score = s.ownedCount * 30;
                            if (s.allOwned) score += 50;
                            const roles = s.members.map(m => CHARACTER_DATA[m]?.role).filter(Boolean);
                            if (roles.includes('Main DPS')) score += 20;
                            if (roles.includes('Healer') || roles.includes('Support')) score += 15;
                            if (roles.includes('Sub DPS')) score += 10;
                            const hasMainDps = s.members.find(m => CHARACTER_DATA[m]?.role === 'Main DPS');
                            if (hasMainDps) {
                              const dpsData = CHARACTER_DATA[hasMainDps];
                              score += Math.min(30, Math.round((dpsData?.totalMult || 0) / 100));
                            }
                            // Element synergy bonus
                            const elements = s.members.map(m => CHARACTER_DATA[m]?.element).filter(Boolean);
                            const elSet = new Set(elements);
                            if (elements.length > elSet.size) score += 15; // element resonance
                            s.score = score;
                          });
                          suggestions.sort((a, b) => {
                            if (a.allOwned !== b.allOwned) return b.allOwned ? 1 : -1;
                            return b.score - a.score;
                          });
                          if (suggestions.length === 0) {
                            return <p className="text-gray-500 text-[10px] text-center py-2">No team suggestions available</p>;
                          }
                          return suggestions.slice(0, 15).map((s, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                s.members.slice(0, 3).forEach((m, idx) => {
                                  dispatch({ type: 'SET_TEAM_SLOT', teamIndex: state.activeTeamIndex, slotIndex: idx, character: m });
                                });
                                haptic.success();
                              }}
                              className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-[var(--border-medium)] hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all text-left"
                              style={{ background: 'var(--bg-stat)' }}
                            >
                              <div className="flex gap-1 flex-shrink-0">
                                {s.members.slice(0, 3).map((m, j) => {
                                  const cd = CHARACTER_DATA[m];
                                  const sf = getImageFraming(`collection-${m}`);
                                  return (
                                    <div key={j} className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative${cd?.rarity === 5 ? ' holo-5star' : ''}`}
                                      style={{ background: cd ? getElementBg(cd.element) : 'rgba(255,255,255,0.1)', contain: 'paint', border: cd ? `1px solid ${getElementColor(cd.element)}50` : '1px solid rgba(255,255,255,0.15)', boxShadow: cd ? `0 0 8px ${getElementColor(cd.element)}30` : 'none' }}>
                                      {collectionImages[m] ? (
                                        <div className="absolute inset-0 breath-zoom"><img src={collectionImages[m]} alt={m} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ transform: `scale(${sf.zoom / 100}) translate(${-sf.x}%, ${-sf.y}%)` }} onError={hideOnError} /></div>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-medium">{m[0]}</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-gray-300 truncate">{s.text}</div>
                                <div className="flex gap-1 mt-0.5">
                                  {s.members.slice(0, 3).map((m, j) => {
                                    const role = CHARACTER_DATA[m]?.role;
                                    const rc = role === 'Main DPS' ? 'text-red-400' : role === 'Sub DPS' ? 'text-orange-400' : role === 'Healer' ? 'text-emerald-400' : 'text-blue-400';
                                    return <span key={j} className={`text-[8px] ${rc}`}>{role || '?'}</span>;
                                  })}
                                </div>
                              </div>
                              {s.allOwned ? (
                                <span className="text-[8px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1 py-0.5 rounded flex-shrink-0">All owned</span>
                              ) : (
                                <span className="text-[8px] text-gray-500 flex-shrink-0">{s.ownedCount}/{s.members.length}</span>
                              )}
                            </button>
                          ));
                        })()}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Character Selector Modal */}
                  <TeamSelector
                    teamSelectorOpen={teamSelectorOpen}
                    setTeamSelectorOpen={setTeamSelectorOpen}
                    teamSelectorSlot={teamSelectorSlot}
                    teamSearch={teamSearch}
                    setTeamSearch={setTeamSearch}
                    teamElementFilter={teamElementFilter}
                    setTeamElementFilter={setTeamElementFilter}
                    teamRarityFilter={teamRarityFilter}
                    setTeamRarityFilter={setTeamRarityFilter}
                    teamBuffFilter={teamBuffFilter}
                    setTeamBuffFilter={setTeamBuffFilter}
                    teamDebuffFilter={teamDebuffFilter}
                    setTeamDebuffFilter={setTeamDebuffFilter}
                    teamDmgFilter={teamDmgFilter}
                    setTeamDmgFilter={setTeamDmgFilter}
                    teamRoleFilter={teamRoleFilter}
                    setTeamRoleFilter={setTeamRoleFilter}
                    activeTeam={activeTeam}
                    filteredChars={filteredChars}
                    recommendedNames={recommendedNames}
                    selectCharacter={selectCharacter}
                    collectionImages={collectionImages}
                    collectionData={collectionData}
                    getImageFraming={getImageFraming}
                    state={state}
                  />

                  {/* Weapon Selector Modal */}
                  <WeaponSelector
                    weaponSelectorOpen={weaponSelectorOpen}
                    setWeaponSelectorOpen={setWeaponSelectorOpen}
                    weaponSelectorTarget={weaponSelectorTarget}
                    weaponSearch={weaponSearch}
                    setWeaponSearch={setWeaponSearch}
                    setTeamEquipment={setTeamEquipment}
                    collectionImages={collectionImages}
                  />

                  {/* Echo Selector Modal + Echo Stat Configuration Panel */}
                  <EchoSelector
                    echoSelectorOpen={echoSelectorOpen}
                    setEchoSelectorOpen={setEchoSelectorOpen}
                    echoSelectorTarget={echoSelectorTarget}
                    echoSearch={echoSearch}
                    setEchoSearch={setEchoSearch}
                    echoSetFilter={echoSetFilter}
                    setEchoSetFilter={setEchoSetFilter}
                    echoBuffFilter={echoBuffFilter}
                    setEchoBuffFilter={setEchoBuffFilter}
                    echoStatPanel={echoStatPanel}
                    setEchoStatPanel={setEchoStatPanel}
                    setTeamEquipment={setTeamEquipment}
                    teamEquipment={teamEquipment}
                    setEchoSelectorTarget={setEchoSelectorTarget}
                    collectionImages={collectionImages}
                  />

                  {/* Enemy Echo Selector Modal — same UI as character selector with collection filters */}
                  <FocusTrapModal isOpen={enemyEchoModalOpen} onClose={() => setEnemyEchoModalOpen(false)} className="" onClick={() => setEnemyEchoModalOpen(false)} centered>
                    <div className="kuro-card w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                      <div className="p-3 border-b border-[var(--border-medium)] flex items-center justify-between flex-shrink-0" data-sheet-header>
                        <div>
                          <h3 className="text-white font-semibold text-sm">Select Target Enemy</h3>
                          <p className="text-gray-400 text-[10px]">All echoes — select an enemy to fight against</p>
                        </div>
                        <button onClick={() => setEnemyEchoModalOpen(false)} className="min-w-[44px] min-h-[44px] rounded-full bg-white/10 flex items-center justify-center" aria-label="Close"><X size={16} className="text-gray-400" /></button>
                      </div>
                      {/* Search + Filters */}
                      <div className="p-2 border-b border-[var(--border-subtle)] flex-shrink-0 space-y-1.5">
                        <input value={enemyEchoSearch} onChange={e => setEnemyEchoSearch(e.target.value)} placeholder="Search echoes..." className="kuro-input w-full text-xs" />
                        <div className="flex gap-1">
                          {[['all', 'All'], ['4', '4-Cost'], ['3', '3-Cost'], ['1', '1-Cost']].map(([val, label]) => (
                            <button key={val} onClick={() => setEnemyEchoCostFilter(val)}
                              className={`flex-1 text-[10px] py-1 rounded ${enemyEchoCostFilter === val ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-white/5 border-[var(--border-medium)] text-gray-500'} border`}>{label}</button>
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          <KuroSelect value={enemyEchoSetFilter} onChange={v => setEnemyEchoSetFilter(v)} small
                            options={[{ value: 'all', label: 'All Sets' }, ...ALL_ECHO_SONATA_SETS.map(s => ({ value: s, label: s }))]}
                            className="flex-1 text-[10px]" />
                          <KuroSelect value={enemyEchoBuffFilter} onChange={v => setEnemyEchoBuffFilter(v)} small
                            options={[{ value: 'all', label: 'All Types' }, ...ALL_ECHO_BUFF_TYPES.map(b => ({ value: b, label: b }))]}
                            className="flex-1 text-[10px]" />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1 p-2">
                        <div className="space-y-1">
                          <button onClick={() => { setEnemyEcho(''); setEnemyEchoModalOpen(false); haptic.light(); }}
                            className={`w-full p-2 rounded-lg border text-left transition-all ${!enemyEcho ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-[var(--border-medium)] hover:border-white/20'}`}>
                            <div className="text-xs font-semibold text-white">Default Enemy</div>
                            <div className="text-[10px] text-gray-400">10% all element RES · No special mechanics</div>
                          </button>
                          {(() => {
                            const costList = enemyEchoCostFilter === '4' ? ALL_4COST_ECHOES : enemyEchoCostFilter === '3' ? ALL_3COST_ECHOES : enemyEchoCostFilter === '1' ? ALL_1COST_ECHOES : [...ALL_4COST_ECHOES, ...ALL_3COST_ECHOES, ...ALL_1COST_ECHOES];
                            return costList.filter(n => {
                              if (enemyEchoSearch && !n.toLowerCase().includes(enemyEchoSearch.toLowerCase())) return false;
                              const ed = ECHO_DATA[n];
                              if (!ed) return false;
                              if (enemyEchoSetFilter !== 'all' && !ed.sets?.includes(enemyEchoSetFilter)) return false;
                              if (enemyEchoBuffFilter !== 'all' && !(Array.isArray(ed.buff) ? ed.buff.includes(enemyEchoBuffFilter) : ed.buff === enemyEchoBuffFilter)) return false;
                              return true;
                            }).map(name => {
                              const ed = ECHO_DATA[name];
                              const isActive = enemyEcho === name;
                              const hasRes = ed?.enemyRes;
                              const resEntries = hasRes ? Object.entries(ed.enemyRes) : [];
                              const cost = ALL_4COST_ECHOES.includes(name) ? 4 : ALL_3COST_ECHOES.includes(name) ? 3 : 1;
                              const costColor = cost === 4 ? 'yellow' : cost === 3 ? 'purple' : 'cyan';
                              return (
                                <button key={name} onClick={() => { setEnemyEcho(name); setEnemyEchoModalOpen(false); haptic.success(); }}
                                  className={`w-full p-2 rounded-lg border text-left transition-all hover:scale-[1.01] ${isActive ? `border-2 border-${costColor}-400 bg-${costColor}-500/10` : `border-[var(--border-medium)] hover:border-${costColor}-500/30`}`}
                                  style={isActive ? { boxShadow: `0 0 12px rgba(234,179,8,0.3)` } : {}}>
                                  <div className="flex items-center gap-2">
                                    {collectionImages[name] ? (
                                      <div className={`w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-${costColor}-500/30 bg-${costColor}-500/8`}>
                                        <img src={collectionImages[name]} alt={name} className="w-full h-full object-contain" onError={hideOnError} />
                                      </div>
                                    ) : (
                                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border border-${costColor}-500/30 bg-${costColor}-500/5`}>
                                        <Diamond size={14} className={`text-${costColor}-400`} />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-white truncate">{name}</span>
                                        <span className={`text-[8px] px-1 py-0.5 rounded bg-${costColor}-500/15 text-${costColor}-400 border border-${costColor}-500/25`}>{cost}C</span>
                                      </div>
                                      <div className="flex gap-1 mt-0.5 flex-wrap">
                                        {resEntries.length > 0 ? resEntries.map(([el, val]) => (
                                          <span key={el} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400">
                                            {el.charAt(0).toUpperCase() + el.slice(1)} {val}%
                                          </span>
                                        )) : (
                                          <span className="text-[9px] text-gray-500">10% all RES</span>
                                        )}
                                        {ed?.element && ed.element !== 'Healing' && (
                                          <span className="text-[9px] text-gray-500">· {ed.element}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </FocusTrapModal>

                </div>
              );
            })()}
          </div>
          </TabErrorBoundary>
          </div>
  );
}
