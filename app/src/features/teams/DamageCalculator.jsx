import React, { useState, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, BarChart3, ChevronDown, Diamond, Sword, X, Zap } from 'lucide-react';
import { CHARACTER_DATA, CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA } from '../../data/characters.js';
import { WEAPON_DATA } from '../../data/weapons.js';
import { ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ECHO_DATA, ECHO_SKILL_BUFFS } from '../../data/echoes.js';
import { WEAPON_REFINE_SCALE } from '../../data/constants.js';
import { haptic, getElementColor, getElementBg, getElementBorder } from '../../utils/helpers.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { EchoImage } from '../../shared/components/EchoImage.jsx';
import RotationTimeline from './RotationTimeline.jsx';
import DPSComparisonCard from './DPSComparisonCard.jsx';
import EnemyEchoSelectorModal from './EnemyEchoSelectorModal.jsx';

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
      const mainEchoName = eq?.echoes?.[0]?.name || '';
      return { name, d, weapon, weapName, charAtk, weapAtk, totalBaseAtk: charAtk + weapAtk, scaling, baseStat, echoSetName: (echoSetName && ECHO_SETS[echoSetName]) ? echoSetName : '', echoSet: (echoSetName && ECHO_SETS[echoSetName]) ? ECHO_SETS[echoSetName] : null, weapSubstat: weapon?.stat || '', weapSubVal: weapon?.subStatValue || '', seqLevel, mainEchoName };
    }).filter(Boolean);
    if (!mems.length) return null;
    const allBuffs = [], allDebuffs = [];
    mems.forEach(m => { (m.d.buffs || []).forEach(b => allBuffs.push({ source: m.name, buff: b })); (m.d.debuffs || []).forEach(b => allDebuffs.push({ source: m.name, debuff: b })); });
    const mainDps = mems.find(m => m.d.role === 'Main DPS') || mems[0];

    const _passiveCache = new Map();
    const parsePassive = (passive, element) => {
      const cacheKey = `${passive || ''}|${element || ''}`;
      if (_passiveCache.has(cacheKey)) return _passiveCache.get(cacheKey);
      const r = { atkPct: 0, elemDmg: 0, skillDmg: 0, critRate: 0, critDmg: 0, defIgnore: 0, resShred: 0, basicDmg: 0, heavyDmg: 0, libDmg: 0, echoDmg: 0, coordDmg: 0 };
      if (!passive) { _passiveCache.set(cacheKey, r); return r; }
      const p = passive.toLowerCase();
      const atkMatch = p.match(/atk\s*\+(\d+)%/);
      if (atkMatch) r.atkPct += parseInt(atkMatch[1], 10);
      if (element) {
        const elLow = element.toLowerCase();
        const elMatch = p.match(new RegExp(elLow + '\\s*dmg\\s*\\+?(\\d+)%'));
        if (elMatch) r.elemDmg += parseInt(elMatch[1], 10);
        const attrMatch = p.match(/(?:all[- ])?attr(?:ibute)?\s*dmg\s*(?:bonus\s*)?\+?(\d+)%/);
        if (attrMatch) r.elemDmg += parseInt(attrMatch[1], 10);
      }
      const skillMatch = p.match(/(?:res(?:onance)?\.?\s*)?skill\s*dmg\s*\+?(\d+)%/);
      if (skillMatch) r.skillDmg += parseInt(skillMatch[1], 10);
      const libMatch = p.match(/(?:res(?:onance)?\.?\s*)?liberation\s*(?:dmg\s*)?\+?(\d+)%/);
      if (libMatch) r.libDmg += parseInt(libMatch[1], 10);
      const basicMatch = p.match(/basic\s*(?:atk?\s*)?dmg\s*(?:amp\s*)?\+?(\d+)%/);
      if (basicMatch) r.basicDmg += parseInt(basicMatch[1], 10);
      const heavyMatch = p.match(/heavy\s*(?:atk?\s*)?(?:dmg\s*)?\+?(\d+)%/);
      if (heavyMatch) r.heavyDmg += parseInt(heavyMatch[1], 10);
      const coordMatch = p.match(/coord(?:inated)?\s*(?:atk?\s*)?(?:dmg\s*)?\+?(\d+)%/);
      if (coordMatch) r.coordDmg += parseInt(coordMatch[1], 10);
      const echoMatch = p.match(/echo\s*(?:skill\s*)?dmg\s*(?:amp\s*)?\+?(\d+)%/);
      if (echoMatch) r.echoDmg += parseInt(echoMatch[1], 10);
      const crMatch = p.match(/crit\s*rate\s*\+?(\d+)%/);
      if (crMatch) r.critRate += parseInt(crMatch[1], 10);
      const cdMatch = p.match(/crit\s*dmg\s*\+?(\d+)%/);
      if (cdMatch) r.critDmg += parseInt(cdMatch[1], 10);
      const defMatch = p.match(/def\s*ignore\s*\+?(\d+)%/);
      if (defMatch) r.defIgnore += parseInt(defMatch[1], 10);
      const resMatch = p.match(/res\s*(?:ignore\s*)?\-(\d+)%/);
      if (resMatch) r.resShred += parseInt(resMatch[1], 10);
      _passiveCache.set(cacheKey, r);
      return r;
    };

    // ── Enemy scaling ──
    const attackerFactor = 800 + 8 * 90; // 1520 at attacker level 90
    const enemyDef90 = 792 + 8 * (Number(enemyLevel) || 90);
    const calcResMult = (baseRes, shred) => {
      const totalRes = (baseRes - shred) / 100;
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
      if (m.name !== mainDps.name) {
        const subOnField = m.d.onField ?? 15;
        mult = mult * Math.min(1, rawSubFieldEach / subOnField);
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
      if (m.echoSet) {
        const p2 = m.echoSet.p2val || {}, p5 = m.echoSet.p5val || {};
        if (m.scaling === 'ATK') { if (p2.atkPct) rStatPct += p2.atkPct; if (p5.atkPct) rStatPct += p5.atkPct; }
        if (p2.critRate) rCr += p2.critRate; if (p5.critRate) rCr += p5.critRate;
        if (p2.skillDmg) rSkillDmg += p2.skillDmg; if (p5.skillDmg) rSkillDmg += p5.skillDmg;
        const ek = (m.d.element || '').toLowerCase() + 'Dmg';
        if (p2[ek]) rElem += p2[ek]; if (p5[ek]) rElem += p5[ek];
      }
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
      const elCnts = {};
      mems.forEach(mm => { const el = mm.d.element; if (el) elCnts[el] = (elCnts[el] || 0) + 1; });
      if (m.d.element && elCnts[m.d.element] >= 2) rElem += 10;
      const rEff = m.baseStat * (1 + rStatPct / 100);
      const rAvgCrit = 1 + (Math.min(rCr, 100) / 100) * (rCd / 100 - 1);
      const rDmgBonus = 1 + (rElem + rSkillDmg) / 100;
      const rDefMult = attackerFactor / (attackerFactor + enemyDef90);
      const rBaseRes = getEnemyRes(m.d.element);
      const rResMult = calcResMult(rBaseRes, 0);
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
    const dmgBonus = (1 + (elemDmg + skillDmg) / 100) * (1 + deepen / 100);
    const reducedDef = enemyDef90 * Math.max(0, 1 - defShred / 100);
    const effectiveDef = reducedDef * Math.max(0, 1 - defIgnore / 100);
    const defMult = Math.min(2, attackerFactor / (attackerFactor + effectiveDef));
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
          (obt.debuffs || []).forEach(db => {
            if (db.stat === 'defShred') sDefShred += db.value;
            else if (db.stat === 'resShred') sResShred += db.value;
            else if (db.stat === 'offTune') sDeepen += db.value;
            else if (db.stat === 'havocBane') sDefShred += db.value * 2;
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
        const subElCounts = {};
        mems.forEach(mm => { const el = mm.d.element; if (el) subElCounts[el] = (subElCounts[el] || 0) + 1; });
        if (m.d.element && subElCounts[m.d.element] >= 2) sElem += 10;
        if (m.weapSubstat === 'Crit Rate') sCr += parseFloat(m.weapSubVal) || 0;
        if (m.weapSubstat === 'Crit DMG') sCd += parseFloat(m.weapSubVal) || 0;
        if (m.weapSubstat === sStatKey) sAtkPct += parseFloat(m.weapSubVal) || 0;
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
        const sDmgBonus = (1 + (sElem + sTypeDmg) / 100) * (1 + sDeepen / 100);
        const sReducedDef = enemyDef90 * Math.max(0, 1 - sDefShred / 100);
        const sEffDef = sReducedDef * Math.max(0, 1 - sDefIgnore / 100);
        const sDefMult = Math.min(2, attackerFactor / (attackerFactor + sEffDef));
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
            const p2 = m.echoSet.p2val || {}, p5 = m.echoSet.p5val || {};
            if (p2.echoDmg) echoSkillBonus += p2.echoDmg;
            if (p5.echoDmg) echoSkillBonus += p5.echoDmg;
          }
          const echoDmgMult = 1 + echoSkillBonus / 100;
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
        return (bt.outroBuffs || []).filter(b => b.target === 'next' || b.target === 'enemy').reduce((s, b) => s + b.value, 0);
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
        const onField = Math.round(rawField * scale * 10) / 10; // scale + round to 0.1s
        timeline.push({ name: m.name, element: m.d.element, role: m.d.role, start: t, duration: onField });
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
          (bt.selfBuffs || []).forEach(b => {
            buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t, duration: b.duration || onField });
          });
          (bt.weaponBuffs || []).forEach(b => {
            buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t, duration: b.duration || onField });
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
        if (m.mainEchoName) {
          const esb = ECHO_SKILL_BUFFS[m.mainEchoName];
          if (esb) {
            const echoLabel = m.mainEchoName.length > 18 ? m.mainEchoName.split(/[:\s-]+/).slice(0, 2).join(' ') : m.mainEchoName;
            const target = esb.target || 'self';
            if (target === 'next') {
              // Outro-triggered echo buff → fires when character swaps out, applies to next
              esb.buffs.forEach(b => {
                buffs.push({ source: echoLabel, owner: m.name, stat: b.stat, value: b.value, start: t + onField, duration: esb.duration || 15, type: 'echo' });
              });
            } else if (target === 'team') {
              // Team-wide buff → active during field time, persists for duration
              esb.buffs.forEach(b => {
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
                buffs.push({ source: echoLabel, owner: m.name, stat: b.stat, value: b.value, start: t, duration: Math.min(esb.duration || 15, onField + 5), type: 'echo' });
              });
            }
          }
        }

        t += onField;
      });
      return { segments: timeline, buffs, totalTime: rotTime };
    })();

    return { members: mems, mainDps, allBuffs, allDebuffs, effAtk, critRate: cr, critDmg: cd, elemDmg, skillDmg, deepen, atkPct, defShred, resShred, defIgnore, avgCrit, defMult, resMult, score, rawDps, realDps, perfectDps, dotDps, hasFrazzle, hasErosion, hasFusionBurst, hasElectroFlare, synergy: syn, warnings, memberDps, rotationTimeline };
  }, [teamEquipment, enemyLevel, enemyEcho]);

  // Expose calcTeamStats to parent via ref
  useImperativeHandle(ref, () => ({ calcTeamStats }), [calcTeamStats]);

  // Memoize active team stats
  const activeTeamData = state.teams?.[state.activeTeamIndex] || state.teams?.[0] || { name: 'Team 1', slots: [null, null, null] };
  const activeTeamStats = useMemo(() =>
    calcTeamStats(activeTeamData.slots, state.activeTeamIndex),
    [calcTeamStats, activeTeamData.slots, state.activeTeamIndex]
  );

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
                <div key={m.name} className="p-3 rounded-lg border hover:border-white/15 transition-colors space-y-2"
                  style={{ background: 'var(--bg-stat)', borderColor: `${getElementColor(m.d.element)}25`, boxShadow: `0 0 12px ${getElementColor(m.d.element)}10` }}>

                  {/* ── Section 1: Character Header ── */}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-11 h-12 rounded-lg overflow-hidden border border-white/15 flex-shrink-0${rarity5 ? ' holo-5star' : ''}`}
                      style={{ background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                      {collectionImages[m.name] ? (
                        <img src={collectionImages[m.name]} alt={m.name} className="w-full h-full object-cover object-top breath-zoom" onError={hideOnError} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">{m.name[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white text-base font-semibold">{m.name}</span>
                        <span className={`text-xs ${rarity5 ? 'text-yellow-400' : 'text-purple-400'}`}>{rarity5 ? '★★★★★' : '★★★★'}</span>
                      </div>
                      <div className="flex items-center flex-wrap gap-1 mt-1">
                        <span className={`kuro-badge ${rc.bg} ${rc.border} ${rc.text} font-medium`}>{m.d.role}</span>
                        <span className="kuro-badge font-medium"
                          style={{ color: getElementColor(m.d.element), background: getElementBg(m.d.element), border: `1px solid ${getElementBorder(m.d.element)}` }}>
                          {m.d.element}
                        </span>
                        <span className="text-xs text-gray-500">{m.d.weapon}</span>
                      </div>
                    </div>
                    {/* Auto Equip button */}
                    {(() => {
                      const aeqKey = state.activeTeamIndex + ':' + m.name;
                      return (
                        <button
                          className="kuro-btn text-xs px-2 py-1 flex-shrink-0 self-start"
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
                                  <img src={collectionImages[eq.weapon]} alt={eq.weapon} className="w-full h-full object-contain rounded-lg" onError={hideOnError} />
                                ) : equippedWeap ? (
                                  <>
                                    <Sword size={14} className={equippedWeap.rarity === 5 ? 'text-yellow-400' : 'text-purple-400'} />
                                    <span className="text-xs text-gray-300 truncate w-full px-0.5 leading-tight mt-0.5">{eq.weapon.split(' ').slice(0, 2).join(' ')}</span>
                                  </>
                                ) : (
                                  <>
                                    <Sword size={14} className="text-gray-500" />
                                    <span className="text-xs text-gray-500">Weapon</span>
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
                                      <EchoImage src={collectionImages[echoName]} alt={echoName} className="w-full h-full object-contain rounded-lg" noBgProcess={ECHO_DATA[echoName]?.noBgProcess} />
                                    ) : echoName ? (
                                      <>
                                        <Diamond size={12} className={`text-${costColor}-400`} />
                                        <span className={`text-xs text-${costColor}-400 truncate w-full px-0.5 leading-tight`}>{echoName.split(' ').slice(0, 2).join(' ')}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Diamond size={12} className="text-gray-500" />
                                        <span className="text-xs text-gray-500">{costLabel}</span>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {/* Weapon & Echo info beside grid */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              {equippedWeap ? (
                                <div className="text-xs space-y-0.5">
                                  <div className="text-yellow-400/80 font-medium truncate">{eq.weapon}</div>
                                  <div className="text-gray-500">{equippedWeap.stat} {equippedWeap.subStatValue}</div>
                                </div>
                              ) : m.d.bestWeapon ? (
                                <div className="text-xs space-y-0.5">
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
                                return (
                                  <div className="text-xs mt-1 space-y-0.5">
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

                        {/* Echo Preset */}
                        {isMain && (
                          <div className="text-xs text-gray-500 italic">Echo stats: default ATK/Crit preset</div>
                        )}
                        {!isMain && (
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
                                    className={`flex-1 py-1 rounded text-xs font-medium transition-all ${isActive ? `bg-${opt.color}-500/20 border-${opt.color}-500/40 text-${opt.color}-400 border` : 'border border-[var(--border-medium)] text-gray-500 hover:text-gray-300 hover:border-white/15'}`}
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
                                      className={`kuro-chip flex-1 text-xs ${isActive ? 'active-gold' : ''}`}
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
                                      className={`kuro-chip flex-1 text-xs ${isActive ? 'active-gold' : ''}`}
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
                          {m.d.element} DMG
                        </span>
                        {(m.d.dmgFocus || []).map((df, di) => (
                          <span key={di} className="kuro-badge kuro-badge-amber">{df}</span>
                        ))}
                        {m.d.statScaling && (
                          <span className="kuro-badge kuro-badge-violet">{m.d.statScaling} Scaling</span>
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
                          {m.d.element} +{elemDmg.toFixed(0)}%
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

            {/* Aggregated buffs/debuffs */}
            {allBuffs.length > 0 && (
              <div>
                <div className="kuro-label">Team Buffs</div>
                <div className="flex flex-wrap gap-1">
                  {allBuffs.map((b, i) => (
                    <span key={i} className="kuro-badge kuro-badge-emerald">
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
                    <span key={i} className="kuro-badge kuro-badge-red">
                      {b.debuff} <span className="text-gray-500">({b.source})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* DPS Tiers */}
            <div className="grid grid-cols-2 gap-2">
              <div className="kuro-stat kuro-stat-emerald p-2 text-center">
                <div className="text-gray-400 text-xs">Raw DPS</div>
                <div className="text-md font-bold text-emerald-400 kuro-number kuro-tshadow-glow-emerald">{rawDps.toLocaleString('en-US')}/s</div>
                <div className="text-gray-500 text-xs">equipment only</div>
              </div>
              <div className="kuro-stat kuro-stat-cyan p-2 text-center">
                <div className="text-gray-400 text-xs">Full DPS</div>
                <div className="text-md font-bold text-cyan-400 kuro-number kuro-tshadow-glow-cyan">{realDps.toLocaleString('en-US')}/s</div>
                <div className="text-gray-500 text-xs">+buffs &amp; debuffs</div>
              </div>
              <div className="kuro-stat kuro-stat-gold p-2 text-center">
                <div className="text-gray-400 text-xs">Perfect DPS</div>
                <div className="text-md font-bold text-yellow-400 kuro-number kuro-tshadow-glow-yellow">{perfectDps.toLocaleString('en-US')}/s</div>
                <div className="text-gray-500 text-xs">+echo active skills</div>
              </div>
              <div className={`kuro-stat ${synergy >= 75 ? 'kuro-stat-emerald' : synergy >= 50 ? 'kuro-stat-gold' : 'kuro-stat-red'} p-2 text-center`}>
                <div className="text-gray-400 text-xs">Synergy</div>
                <div className={`text-md font-bold kuro-number ${synergy >= 75 ? 'text-emerald-400' : synergy >= 50 ? 'text-amber-400' : 'text-red-400'}`} style={{ textShadow: `0 0 10px ${synergy >= 75 ? 'rgba(34,197,94,0.5)' : synergy >= 50 ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.5)'}` }}>{synergy}%</div>
                <div className="text-gray-500 text-xs">team comp</div>
              </div>
            </div>

            {/* DPS Breakdown per character */}
            {memberDps && (
              <div className="mt-2 space-y-1">
                {memberDps.map(m => (
                  <div key={m.name} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-24 truncate" title={m.name}>{m.name}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-l-full bg-cyan-500/50" style={{ width: `${m.pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{m.pct}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {warnings.map((w, i) => (
                  <span key={i} className="kuro-badge kuro-badge-amber flex items-center gap-1">
                    <AlertTriangle size={12} /> {w}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-1">Raw: equipment only. Full: +team buffs, debuffs, DOTs. Perfect: +echo active skills. Synergy is an approximate team composition score.</p>
          </div>
        </CardBody>
      </Card>

      {/* Rotation Timeline — outside Team Overview Card to avoid overflow:hidden clipping */}
      <RotationTimeline rotationTimeline={rotationTimeline} />

      <DPSComparisonCard
        teamCompareEntries={teamCompareEntries} setTeamCompareEntries={setTeamCompareEntries}
        calcTeamStats={calcTeamStats}
        enemyEcho={enemyEcho} enemyLevel={enemyLevel} setEnemyLevel={setEnemyLevel}
        setEnemyEchoSearch={setEnemyEchoSearch} setEnemyEchoModalOpen={setEnemyEchoModalOpen}
        confirm={confirm}
      />

      <EnemyEchoSelectorModal
        isOpen={enemyEchoModalOpen} onClose={() => setEnemyEchoModalOpen(false)}
        enemyEcho={enemyEcho} setEnemyEcho={setEnemyEcho}
        collectionImages={collectionImages}
        search={enemyEchoSearch} setSearch={setEnemyEchoSearch}
        costFilter={enemyEchoCostFilter} setCostFilter={setEnemyEchoCostFilter}
        setFilter={enemyEchoSetFilter} setSetFilter={setEnemyEchoSetFilter}
        buffFilter={enemyEchoBuffFilter} setBuffFilter={setEnemyEchoBuffFilter}
      />
    </>
  );
});

export default DamageCalculator;
