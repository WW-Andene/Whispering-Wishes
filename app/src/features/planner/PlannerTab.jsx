// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — PlannerTab (extracted from App.jsx)
// Resource income planning and goal tracking
// ═══════════════════════════════════════════════════════════════════════════════
//
// [SECTION INDEX] - Use: grep -n "SECTION:" PlannerTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// [SECTION:PLANNER]      PlannerTab main component (income, goals, saved states)
// ─────────────────────────────────────────────────────────────────────────────
// The calendar/chronology view (event helpers + AstriteCalendar component) lives
// in its own file, AstriteCalendar.jsx — extracted from here since it was already
// a self-contained sub-component with its own [SECTION:] markers and no shared
// state with the rest of this file.

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Check, ChevronDown, Minus, Plus, Search, Star, X } from 'lucide-react';
import { ASTRITE_PER_PULL, LUNITE_DAILY_ASTRITE, HARD_PITY, SUBSCRIPTIONS, RESONATOR_ASCENSION_COSTS, RESONATOR_EXP_COSTS, SKILL_UPGRADE_COSTS, WEAPON_ASCENSION_COSTS_5, WEAPON_ASCENSION_COSTS_4, WEAPON_EXP_COSTS_5, WEAPON_EXP_COSTS_4, COMMON_MAT_TIERS, FORGERY_MAT_TIERS, MATERIAL_IMAGES } from '../../data/constants.js';
import { DEFAULT_COLLECTION_IMAGES, CHARACTER_THEMES, getCurrentBannerAuto } from '../../data/banners.js';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { generateUniqueId } from '../../utils/generateId.js';
import { getElementColor, getElementShape } from '../../shared/utils/elementVisuals.js';
import { CHARACTER_DATA, ALL_5STAR_RESONATORS, ALL_4STAR_RESONATORS } from '../../data/characters.js';
import { WEAPON_DATA, getLocalizedWeaponData } from '../../data/weapons.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { CountdownTimer } from '../../shared/components/CountdownTimer.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import { AstriteCalendar } from './AstriteCalendar.jsx';
import { t, formatNumber, formatDate, getLocale } from '../../utils/i18n.js';


// Computes the full material/shell/EXP-potion requirement for one Ascension Planner target.
// Shared by the per-character breakdown and the combined-total summary so the two never drift.
// `ftg` = { name, ascension, skills, weapon, weaponName }.
function computeFarmMaterials(ftg) {
  const d = CHARACTER_DATA[ftg.name];
  const mats = {};
  const potions = {};
  let shell = 0;
  if (!d) return { mats, potions, shell };
  const addMat = (name, qty) => { if (!name || !qty) return; if (!mats[name]) mats[name] = { qty: 0, img: MATERIAL_IMAGES?.[name] }; mats[name].qty += qty; };
  const addPotion = (name, qty) => { if (!name || !qty) return; potions[name] = (potions[name] || 0) + qty; };

  if (ftg.ascension) {
    addMat(d.ascension?.boss, RESONATOR_ASCENSION_COSTS.boss);
    const ct = COMMON_MAT_TIERS[d.ascension?.common];
    if (ct) {
      if (ct.length >= 4) { addMat(ct[0], RESONATOR_ASCENSION_COSTS.commonT1); addMat(ct[1], RESONATOR_ASCENSION_COSTS.commonT2); }
      addMat(ct[ct.length - 2], RESONATOR_ASCENSION_COSTS.commonT3);
      addMat(ct[ct.length - 1], RESONATOR_ASCENSION_COSTS.commonT4);
    }
    addMat(d.ascension?.specialty, RESONATOR_ASCENSION_COSTS.specialty);
    shell += RESONATOR_ASCENSION_COSTS.shell;
    addPotion('Premium Resonance Potion', RESONATOR_EXP_COSTS['Premium Resonance Potion']);
  }
  if (ftg.skills) {
    const ft = FORGERY_MAT_TIERS[d.skillMaterials?.forgery];
    if (ft) {
      if (ft.length >= 4) { addMat(ft[0], SKILL_UPGRADE_COSTS.forgeryT1); addMat(ft[1], SKILL_UPGRADE_COSTS.forgeryT2); }
      addMat(ft[ft.length - 2], SKILL_UPGRADE_COSTS.forgeryT3);
      addMat(ft[ft.length - 1], SKILL_UPGRADE_COSTS.forgeryT4);
    }
    const ct = COMMON_MAT_TIERS[d.ascension?.common];
    if (ct) {
      if (ct.length >= 4) { addMat(ct[0], SKILL_UPGRADE_COSTS.commonT1); addMat(ct[1], SKILL_UPGRADE_COSTS.commonT2); }
      addMat(ct[ct.length - 2], SKILL_UPGRADE_COSTS.commonT3);
      addMat(ct[ct.length - 1], SKILL_UPGRADE_COSTS.commonT4);
    }
    addMat(d.skillMaterials?.weeklyDrop, SKILL_UPGRADE_COSTS.weeklyDrop);
    shell += SKILL_UPGRADE_COSTS.shell;
  }
  if (ftg.weapon) {
    const weaponName = ftg.weaponName || d.bestWeapon;
    const w = weaponName ? WEAPON_DATA?.[weaponName] : null;
    if (w?.ascensionMaterials) {
      const costs = w.rarity === 5 ? WEAPON_ASCENSION_COSTS_5 : WEAPON_ASCENSION_COSTS_4;
      const expCosts = w.rarity === 5 ? WEAPON_EXP_COSTS_5 : WEAPON_EXP_COSTS_4;
      const ft = FORGERY_MAT_TIERS[w.ascensionMaterials.forgery];
      if (ft) {
        if (ft.length >= 4) { addMat(ft[0], costs.forgeryT1); addMat(ft[1], costs.forgeryT2); }
        addMat(ft[ft.length - 2], costs.forgeryT3);
        addMat(ft[ft.length - 1], costs.forgeryT4);
      }
      const ct = COMMON_MAT_TIERS[w.ascensionMaterials.common];
      if (ct) {
        if (ct.length >= 4) { addMat(ct[0], costs.commonT1); addMat(ct[1], costs.commonT2); }
        addMat(ct[ct.length - 2], costs.commonT3);
        addMat(ct[ct.length - 1], costs.commonT4);
      }
      shell += costs.shell;
      addPotion('Premium Energy Core', expCosts['Premium Energy Core']);
    }
  }
  return { mats, potions, shell };
}

// [SECTION:PLANNER] ── PlannerTab main component ─────────────────────────────
function PlannerTab({
  state,
  dispatch,
  activeBanners,
  bannerEndDate,
  toast,
  confirm,
}) {
  const [showIncomePanel, setShowIncomePanel] = useState(false);
  // Calendar notes stored in localStorage
  const [calendarNotes, setCalendarNotes] = usePersistedState('ww-calendar-notes', {});
  const handleSetNote = useCallback((dateKey, note) => {
    setCalendarNotes(prev => {
      const next = { ...prev };
      if (note) next[dateKey] = note; else delete next[dateKey];
      return next;
    });
  }, []);
  // Ascension planner targets
  const [farmTargetsState, setFarmTargetsState] = usePersistedState('ww-farm-targets', []);
  const [farmPickerOpen, setFarmPickerOpen] = useState(false);
  const [farmSearch, setFarmSearch] = useState('');
  // Materials already in inventory — subtracted from the combined total so it shows what's actually
  // still needed, not just the raw max-level requirement.
  const [ownedMats, setOwnedMats] = usePersistedState('ww-farm-owned-mats', {});
  // Collapsible card state
  const [collapsed, setCollapsed] = useState({});

  const dailyIncome = useMemo(() => {
    return (state.planner.dailyAstrite || 0) + (state.planner.luniteActive ? LUNITE_DAILY_ASTRITE : 0);
  }, [state.planner.dailyAstrite, state.planner.luniteActive]);

  const planData = useMemo(() => {
    const currentAstrite = (+state.calc.astrite || 0) + (+state.calc.lunite || 0);
    const bannerEnd = new Date(bannerEndDate);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((bannerEnd - now) / 86400000));
    const incomeByEnd = dailyIncome * daysLeft;
    const totalAstriteByEnd = currentAstrite + incomeByEnd;
    const convenesByEnd = Math.floor(totalAstriteByEnd / ASTRITE_PER_PULL) + (
      state.calc.bannerCategory === 'featured'
        ? (state.calc.selectedBanner === 'both'
            ? (+state.calc.radiant || 0) + (+state.calc.forging || 0)
            : state.calc.selectedBanner === 'weap' ? (+state.calc.forging || 0) : (+state.calc.radiant || 0))
        : (+state.calc.lustrous || 0)
    );
    const isFeatured = state.calc.bannerCategory === 'featured';
    const isChar = state.calc.selectedBanner === 'char';
    const isWeap = state.calc.selectedBanner === 'weap';
    let goalCopies = 1;
    let goalBannerLabel = '';
    if (isFeatured) {
      if (isChar) { goalCopies = Math.max(1, state.calc.charCopies || 1); goalBannerLabel = `${t('planner.featuredLabel')} ${t('planner.resonatorLabel')}`; }
      else if (isWeap) { goalCopies = Math.max(1, state.calc.weapCopies || 1); goalBannerLabel = `${t('planner.featuredLabel')} ${t('planner.weaponLabel')}`; }
      else { goalCopies = Math.max(1, state.calc.charCopies || 1, state.calc.weapCopies || 1); goalBannerLabel = `${t('planner.featuredLabel')} ${t('planner.bothLabel')}`; }
    } else {
      if (isChar) { goalCopies = Math.max(1, state.calc.stdCharCopies || 1); goalBannerLabel = `${t('planner.standardLabel')} ${t('planner.resonatorLabel')}`; }
      else if (isWeap) { goalCopies = Math.max(1, state.calc.stdWeapCopies || 1); goalBannerLabel = `${t('planner.standardLabel')} ${t('planner.weaponLabel')}`; }
      else { goalCopies = Math.max(1, state.calc.stdCharCopies || 1, state.calc.stdWeapCopies || 1); goalBannerLabel = `${t('planner.standardLabel')} ${t('planner.bothLabel')}`; }
    }
    const targetPulls = Math.max(1, state.planner.goalPulls * goalCopies * state.planner.goalModifier);
    const targetAstrite = targetPulls * ASTRITE_PER_PULL;
    const goalNeeded = Math.max(0, targetAstrite - currentAstrite);
    const goalDaysNeeded = goalNeeded <= 0 ? 0 : (dailyIncome > 0 ? Math.ceil(goalNeeded / dailyIncome) : Infinity);
    const goalProgress = targetAstrite > 0 ? Math.min(100, (currentAstrite / targetAstrite) * 100) : 0;
    // Quick probability estimate: what's the chance of getting the target with available pulls?
    const availablePulls = Math.floor(currentAstrite / ASTRITE_PER_PULL);
    const pullsByEnd = Math.floor(totalAstriteByEnd / ASTRITE_PER_PULL);
    // Simplified probability model: P(5★ in N pulls) using soft pity integral
    const calcProb = (pulls, copies, has5050) => {
      if (pulls <= 0 || copies <= 0) return 0;
      // Expected pulls per 5★ (accounting for soft pity): ~62 avg with soft pity ramp
      const avgPer5Star = 62;
      const pullsPerFeatured = has5050 ? avgPer5Star * 1.5 : avgPer5Star; // 50/50 = 1.5x avg
      const expectedCopies = pulls / pullsPerFeatured;
      // Poisson CDF approximation for P(copies >= target)
      if (expectedCopies >= copies * 2) return 99.9;
      let prob = 0;
      let term = Math.exp(-expectedCopies);
      for (let k = 0; k < copies; k++) {
        prob += term;
        term *= expectedCopies / (k + 1);
      }
      return Math.min(99.9, Math.max(0.1, (1 - prob) * 100));
    };
    const has5050 = isFeatured && state.planner.goalBanner === 'featuredChar';
    const probNow = calcProb(availablePulls, goalCopies, has5050);
    const probByEnd = calcProb(pullsByEnd, goalCopies, has5050);
    return { currentAstrite, daysLeft, incomeByEnd, totalAstriteByEnd, convenesByEnd, isFeatured, goalCopies, goalBannerLabel, targetPulls, targetAstrite, goalNeeded, goalDaysNeeded, goalProgress, probNow, probByEnd, availablePulls, pullsByEnd };
  }, [state.calc, state.planner.goalPulls, state.planner.goalModifier, bannerEndDate, dailyIncome]);

  // Collapsible section toggle
  const toggleSection = useCallback((key) => setCollapsed(p => ({ ...p, [key]: !p[key] })), []);

  return (
    <div role="tabpanel" id="tabpanel-planner" aria-labelledby="tab-planner" tabIndex="0">
    <TabErrorBoundary tabName={t('tabs.planner')}>
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="planner" />

      {/* ── 1. Calendar ────────────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('calendar')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('calendar'); } }} aria-expanded={!collapsed.calendar}>
          <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.calendar ? '' : 'rotate-180'}`} />}><Calendar size={14} className="inline mr-1.5 -mt-0.5 text-yellow-400" />{t('planner.astriteCalendar')}</CardHeader>
        </div>
        {!collapsed.calendar && (
          <CardBody className="space-y-3">
            <AstriteCalendar dailyIncome={dailyIncome} bannerEndDate={bannerEndDate} planData={planData} activeBanners={activeBanners} eventStatus={state.eventStatus} calendarNotes={calendarNotes} onSetNote={handleSetNote} />
          </CardBody>
        )}
      </Card>

      {/* ── 2. Daily Income ────────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('daily')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('daily'); } }} aria-expanded={!collapsed.daily}>
          <CardHeader action={<>
            <span className="text-yellow-400 kuro-number text-base font-bold">{dailyIncome}/day</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.daily ? '' : 'rotate-180'}`} />
          </>}><Calendar size={14} className="inline mr-1.5 -mt-0.5 text-yellow-400" />{t('planner.dailyIncomeTitle')}</CardHeader>
        </div>
        {!collapsed.daily && (
          <CardBody className="space-y-3">
            <div>
              <label className="kuro-label" title={t('planner.dailyAstriteTooltip')}>{t('planner.dailyAstriteLabel')}</label>
              <input type="number" value={state.planner.dailyAstrite} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'dailyAstrite', value: Math.max(0, Math.floor(+e.target.value || 0)) })} className="kuro-input w-full" aria-label={t('planner.dailyAstriteAriaLabel')} />
              <div className="text-gray-500 text-sm mt-1">{t('planner.dailyAstriteHint')}</div>
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 text-md font-medium">{t('planner.total')}</span>
                <span className="text-yellow-400 font-bold kuro-number text-lg">{t('planner.astriteSuffix', { n: formatNumber(dailyIncome) })}</span>
              </div>
              <div className="text-gray-400 text-sm mt-1">{t('planner.perDaySummary', { convenes: (dailyIncome / ASTRITE_PER_PULL).toFixed(2), monthly: formatNumber(Math.floor(dailyIncome * 30 / ASTRITE_PER_PULL)) })}</div>
            </div>
          </CardBody>
        )}
      </Card>

      {/* ── 3. Purchases ───────────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setShowIncomePanel(!showIncomePanel)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowIncomePanel(!showIncomePanel); } }} aria-expanded={showIncomePanel}>
          <CardHeader action={<>
            {state.planner.addedIncome.length > 0 && <span className="text-emerald-400 text-sm">{t('planner.addedCount', { count: state.planner.addedIncome.length })}</span>}
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showIncomePanel ? 'rotate-180' : ''}`} />
          </>}>{t('planner.purchases')}</CardHeader>
        </div>
        {showIncomePanel && (
          <CardBody className="space-y-2">
            <div className="kuro-label">{t('planner.subscriptions')}</div>
            <button onClick={() => dispatch({ type: 'SET_PLANNER', field: 'luniteActive', value: !state.planner.luniteActive })} aria-pressed={state.planner.luniteActive} aria-label={t('planner.luniteSubAriaLabel', { status: state.planner.luniteActive ? t('planner.luniteSubActive') : t('planner.luniteSubInactive') })} className={`kuro-btn w-full text-left ${state.planner.luniteActive ? 'active-emerald' : ''}`}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded flex items-center justify-center ${state.planner.luniteActive ? 'bg-emerald-500 text-black' : ''}`} style={!state.planner.luniteActive ? { background: 'var(--bg-btn)' } : undefined}>
                    {state.planner.luniteActive && <Check size={12} />}
                  </span>
                  <div>
                    <div className={`text-base font-medium ${state.planner.luniteActive ? 'text-emerald-400' : 'text-gray-200'}`}>{t('planner.luniteSubTitle')}</div>
                    <div className="text-gray-300 text-sm">{t('planner.luniteSubDesc', { daily: SUBSCRIPTIONS.lunite.daily, duration: SUBSCRIPTIONS.lunite.duration })}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 text-base">{t('planner.perMonth', { price: SUBSCRIPTIONS.lunite.price })}</span>
                  {state.planner.luniteActive && <div className="text-emerald-400 text-sm">{t('planner.plusPerDay')}</div>}
                </div>
              </div>
            </button>
            <button onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: SUBSCRIPTIONS.weekly.astrite, lunite: SUBSCRIPTIONS.weekly.lunite || 0, radiant: 0, lustrous: 0, label: SUBSCRIPTIONS.weekly.name, price: SUBSCRIPTIONS.weekly.price } }); toast?.addToast?.(t('planner.addedToast', { name: SUBSCRIPTIONS.weekly.name }), 'success'); }} className="kuro-btn w-full text-left">
              <div className="flex items-center justify-between w-full">
                <div><div className="text-gray-200 text-base font-medium">{SUBSCRIPTIONS.weekly.name}</div><div className="text-gray-300 text-sm">{SUBSCRIPTIONS.weekly.desc}</div></div>
                <div className="flex items-center gap-1"><span className="text-emerald-400 text-base">${SUBSCRIPTIONS.weekly.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
              </div>
            </button>
            {Object.entries(SUBSCRIPTIONS).filter(([k]) => k === 'bpInsider' || k === 'bpConnoisseur').map(([k, s]) => (
              <button key={k} onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: s.astrite || 0, lunite: s.lunite || 0, radiant: s.radiant || 0, lustrous: s.lustrous || 0, label: s.name, price: s.price } }); toast?.addToast?.(t('planner.addedToast', { name: s.name }), 'success'); }} className="kuro-btn w-full text-left">
                <div className="flex items-center justify-between w-full">
                  <div><div className="text-gray-200 text-base font-medium">{s.name}</div><div className="text-gray-300 text-sm">{s.desc}</div></div>
                  <div className="flex items-center gap-1"><span className="text-emerald-400 text-base">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                </div>
              </button>
            ))}
            <div className="kuro-label mt-3">{t('planner.directTopUps')}</div>
            {Object.entries(SUBSCRIPTIONS).filter(([k]) => k.startsWith('directTop')).map(([k, s]) => (
              <button key={k} onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: s.astrite || 0, lunite: s.lunite || 0, radiant: 0, lustrous: 0, label: s.name, price: s.price } }); toast?.addToast?.(t('planner.addedToast', { name: s.name }), 'success'); }} className="kuro-btn w-full text-left">
                <div className="flex items-center justify-between w-full">
                  <div><div className="text-gray-200 text-base font-medium">{s.name}</div><div className="text-gray-300 text-sm">{s.desc}</div></div>
                  <div className="flex items-center gap-1"><span className="text-emerald-400 text-base">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                </div>
              </button>
            ))}
            {state.planner.addedIncome.length > 0 && (
              <>
                <div className="kuro-label mt-3">{t('planner.added')}</div>
                {state.planner.addedIncome.map(i => (
                  <div key={i.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-base">
                    <span className="text-gray-200">{i.label}</span>
                    <div className="flex items-center gap-2">
                      {i.astrite > 0 && <span className="text-yellow-400">+{i.astrite}</span>}
                      {i.lunite > 0 && <span className="text-cyan-400">+{i.lunite}L</span>}
                      {i.radiant > 0 && <span className="text-yellow-400">+{i.radiant}R</span>}
                      {i.lustrous > 0 && <span className="text-cyan-400">+{i.lustrous}L</span>}
                      <button onClick={async () => { if (await confirm({ title: t('planner.removePurchaseTitle'), message: t('planner.removePurchaseMessage', { name: i.label }), confirmLabel: t('planner.removeLabel'), destructive: true })) dispatch({ type: 'REMOVE_INCOME', id: i.id }); }} className="text-red-400 min-w-[48px] min-h-[48px] flex items-center justify-center -my-2" aria-label={t('planner.removeAriaLabel', { name: i.label })}><Minus size={12} /></button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-[var(--border-medium)] flex justify-between text-base">
                  <span className="text-gray-400">{t('planner.totalSpent')}</span>
                  <span className="text-emerald-400 font-bold">${state.planner.addedIncome.reduce((s, i) => s + (+i.price || 0), 0).toFixed(2)}</span>
                </div>
                <button onClick={async () => { if (await confirm({ title: t('planner.clearAllTitle'), message: t('planner.clearAllMessage'), confirmLabel: t('planner.clearAllConfirm'), destructive: true })) dispatch({ type: 'CLEAR_ALL_INCOME' }); }} className="text-red-400 text-sm hover:text-red-300 transition-colors w-full text-center py-1">{t('planner.clearAllButton')}</button>
              </>
            )}
          </CardBody>
        )}
      </Card>

      {/* ── 4. Income Projections ──────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('proj')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('proj'); } }} aria-expanded={!collapsed.proj}>
          <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.proj ? '' : 'rotate-180'}`} />}>{t('planner.incomeProjections')}</CardHeader>
        </div>
        {!collapsed.proj && (
          <CardBody>
            {dailyIncome === 0 ? (
              <div className="p-4 text-center rounded-lg" style={{ background: 'var(--bg-stat)' }}>
                <div className="text-gray-400 text-md mb-1">{t('planner.noIncomeSet')}</div>
                <div className="text-gray-400 text-base">{t('planner.setIncomeAbove')}</div>
              </div>
            ) : (
            <div className="grid grid-cols-3 gap-2">
              {[7, 30, 90].map(days => (
                <div key={days} className={`kuro-stat p-3 text-center ${days === 30 ? 'border-yellow-500/30 kuro-stat-gold' : ''}`}>
                  <div className="text-gray-400 text-sm mb-1">{days === 30 ? t('planner.monthly') : t('planner.daysLabel', { days })}</div>
                  <div className={`kuro-number text-yellow-400 font-extrabold ${days === 30 ? 'text-4xl' : 'text-2xl'}`}>{formatNumber(Math.floor(dailyIncome * days / ASTRITE_PER_PULL))}</div>
                  <div className="text-gray-400 text-sm">{t('planner.convenes')}</div>
                  <div className="text-gray-400 text-sm">{t('planner.astriteSuffix', { n: formatNumber(dailyIncome * days) })}</div>
                </div>
              ))}
            </div>
            )}
            {state.planner.luniteActive && (
              <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                <span className="text-emerald-400 text-base">{t('planner.monthlySub')}</span>
                <span className="text-emerald-400 font-bold text-base">{t('planner.perMonth', { price: SUBSCRIPTIONS.lunite.price })}</span>
              </div>
            )}
          </CardBody>
        )}
      </Card>

      {/* ── 5. By Banner End ───────────────────────────────────────────────── */}
      {planData.daysLeft > 0 && (
        <Card>
          <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('banner')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('banner'); } }} aria-expanded={!collapsed.banner}>
            <CardHeader action={<>
              <CountdownTimer endDate={bannerEndDate} compact />
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.banner ? '' : 'rotate-180'}`} />
            </>}>{t('planner.byBannerEnd')}</CardHeader>
          </div>
          {!collapsed.banner && (
            <CardBody className="space-y-2">
              <div className="text-gray-400 text-sm">{t('planner.versionPhase', { version: activeBanners.version, phase: activeBanners.phase, days: planData.daysLeft, plural: planData.daysLeft !== 1 ? 's' : '' })}</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="kuro-stat p-2 flex flex-col items-center justify-center text-center">
                  <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(planData.convenesByEnd)}</div>
                  <div className="text-gray-400 text-sm">{t('planner.totalConvenes')}</div>
                </div>
                <div className="kuro-stat p-2 flex flex-col items-center justify-center text-center">
                  <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(Math.floor(planData.incomeByEnd / ASTRITE_PER_PULL))}</div>
                  <div className="text-gray-400 text-sm">{t('planner.earned')}</div>
                </div>
                <div className="kuro-stat p-2 flex flex-col items-center justify-center text-center">
                  <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(planData.totalAstriteByEnd)}</div>
                  <div className="text-gray-400 text-sm">{(+state.calc.lunite || 0) > 0 ? t('planner.totalAL') : t('planner.astrite')}</div>
                </div>
              </div>
              <div className="text-gray-400 text-sm text-center">{t('planner.currentEarnedSummary', { current: formatNumber(+state.calc.astrite || 0), luniteSuffix: (+state.calc.lunite || 0) > 0 ? t('planner.luniteSuffixText', { lunite: formatNumber(+state.calc.lunite || 0) }) : '', earned: formatNumber(planData.incomeByEnd) })}</div>
            </CardBody>
          )}
        </Card>
      )}

      {/* ── 6. Goal Progress ───────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('goal')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('goal'); } }} aria-expanded={!collapsed.goal}>
          <CardHeader action={<>
            <span className="text-gray-400 text-sm">{planData.goalProgress.toFixed(0)}%</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.goal ? '' : 'rotate-180'}`} />
          </>}>{t('planner.goalProgressTitle')}</CardHeader>
        </div>
        {!collapsed.goal && (
        <CardBody className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="kuro-label">{t('planner.baseConvenes')}</label>
              <KuroSelect
                value={state.planner.goalPulls}
                onChange={v => dispatch({ type: 'SET_PLANNER', field: 'goalPulls', value: +v })}
                options={[
                  { value: HARD_PITY, label: t('planner.hardPityLabel', { n: HARD_PITY }) },
                  { value: HARD_PITY * 2, label: t('planner.guaranteedLabel', { n: HARD_PITY * 2 }) },
                  { value: 240, label: t('planner.charSignatureLabel') },
                ]}
                className="w-full"
                ariaLabel={t('planner.baseConvenes')}
                small
              />
            </div>
            <div>
              <label className="kuro-label">{t('planner.multiplier')}</label>
              <KuroSelect
                value={state.planner.goalModifier}
                onChange={v => dispatch({ type: 'SET_PLANNER', field: 'goalModifier', value: +v })}
                options={[
                  { value: 1, label: '×1' },
                  { value: 2, label: '×2' },
                  { value: 3, label: '×3' },
                ]}
                className="w-full"
                ariaLabel={t('planner.multiplier')}
                small
              />
            </div>
          </div>
          <div className="p-2 bg-white/5 rounded-lg text-sm text-gray-400 text-center">
            {t('planner.usingCalculator')}<span className={planData.isFeatured ? 'text-yellow-400' : 'text-cyan-400'}>{planData.goalBannerLabel}</span> × <span className="text-gray-100">{planData.goalCopies}</span> {t('planner.copiesLabel')}
          </div>
          <div className="text-sm text-gray-500 text-center py-1">
            <span title={t('planner.baseConvenesTooltip')} className="underline decoration-dotted cursor-help">{t('planner.baseConvenes')}</span>
            {' × '}
            <span title={t('planner.multiplierTooltip')} className="underline decoration-dotted cursor-help">{t('planner.multiplier')}</span>
            {' × '}
            <span title={t('planner.copiesTooltip')} className="underline decoration-dotted cursor-help">{t('planner.copiesLabel')}</span>
            {' = '}
            <span className="text-gray-400">{state.planner.goalPulls} × {state.planner.goalModifier} × {planData.goalCopies} = {planData.targetPulls}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-lg" aria-live="polite" aria-atomic="false">
            <div className="flex justify-between text-md mb-2">
              <span className="text-gray-400">{t('planner.target')}</span>
              <span className="text-gray-100 font-bold">{t('planner.targetSummary', { pulls: planData.targetPulls, astrite: formatNumber(planData.targetAstrite) })}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-stat)' }} role="progressbar" aria-valuenow={planData.goalProgress} aria-valuemin={0} aria-valuemax={100} aria-label={t('planner.goalProgressAriaLabel', { pct: planData.goalProgress.toFixed(1) })}>
              <div className={`h-full transition-[width] duration-300 ${planData.isFeatured ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`} style={{ width: `${planData.goalProgress}%` }} />
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">{t('planner.convenesProgress', { current: Math.floor(planData.currentAstrite / ASTRITE_PER_PULL), target: planData.targetPulls })}</span>
              <span className="text-gray-100">{planData.goalProgress.toFixed(1)}%</span>
            </div>
          </div>
          {/* Probability estimate */}
          <div className="grid grid-cols-2 gap-2">
            <div className="kuro-stat p-3 text-center flex flex-col items-center justify-center">
              <div className={`kuro-number text-xl font-bold ${planData.probNow >= 80 ? 'text-emerald-400' : planData.probNow >= 50 ? 'text-yellow-400' : planData.probNow >= 20 ? 'text-orange-400' : 'text-red-400'}`}>{planData.probNow.toFixed(1)}%</div>
              <div className="text-gray-500 text-xs">{t('planner.chanceNow', { pulls: planData.availablePulls })}</div>
            </div>
            <div className="kuro-stat p-3 text-center flex flex-col items-center justify-center">
              <div className={`kuro-number text-xl font-bold ${planData.probByEnd >= 80 ? 'text-emerald-400' : planData.probByEnd >= 50 ? 'text-yellow-400' : planData.probByEnd >= 20 ? 'text-orange-400' : 'text-red-400'}`}>{planData.probByEnd.toFixed(1)}%</div>
              <div className="text-gray-500 text-xs">{t('planner.chanceByEnd', { pulls: planData.pullsByEnd })}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="kuro-stat p-3 text-center flex flex-col items-center justify-center">
              <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(planData.goalNeeded)}</div>
              <div className="text-gray-400 text-sm">{t('planner.astriteNeeded')}</div>
            </div>
            <div className="kuro-stat p-3 text-center flex flex-col items-center justify-center">
              <div className="text-yellow-400 kuro-number text-2xl">{planData.goalDaysNeeded === Infinity ? t('planner.infinitySymbol') : formatNumber(planData.goalDaysNeeded)}</div>
              <div className="text-gray-400 text-sm">{t('planner.daysToGoal')}</div>
            </div>
          </div>
          {planData.goalDaysNeeded === Infinity && dailyIncome === 0 && (
            <div className="p-2 bg-white/5 rounded-lg text-center">
              <span className="text-gray-500 text-sm">{t('planner.setIncome')}</span>
            </div>
          )}
          {planData.goalDaysNeeded !== Infinity && planData.goalDaysNeeded > 0 && (
            <div className="p-2 bg-white/5 rounded-lg text-center">
              <span className="text-yellow-400 text-base font-medium">{t('planner.estimated', { date: formatDate(new Date(Date.now() + planData.goalDaysNeeded * 86400000), { month: 'long', day: 'numeric', year: 'numeric' }) })}</span>
            </div>
          )}
          {planData.goalNeeded >= 16000 && (
            <p className="text-gray-500 text-sm text-center mt-1">{t('planner.costNote', { cost: formatNumber(Math.ceil(planData.goalNeeded / 60)) })}</p>
          )}
        </CardBody>
        )}
      </Card>

      {/* ── 7. Saved States ────────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('saved')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('saved'); } }} aria-expanded={!collapsed.saved}>
          <CardHeader action={<>
            {state.bookmarks.length > 0 && <span className="text-cyan-400 text-sm">{state.bookmarks.length}</span>}
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.saved ? '' : 'rotate-180'}`} />
          </>}>{t('planner.savedStates')}</CardHeader>
        </div>
        {!collapsed.saved && (
        <CardBody className="space-y-2">
          {state.bookmarks.length === 0 ? (
            <p className="kuro-empty-state text-gray-400 text-base text-center py-4">{t('planner.noBookmarks')}</p>
          ) : state.bookmarks.map(b => (
            <div key={b.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
              <div>
                <div className="text-gray-200 text-base font-medium">{b.name}</div>
                <div className="text-gray-400 text-sm">{b.bannerCategory === 'featured' ? t('planner.featuredLabel') : t('planner.standardLabel')} {b.selectedBanner === 'char' ? t('planner.resonatorLabel') : b.selectedBanner === 'weap' ? t('planner.weaponLabel') : t('planner.bothLabel')} • {t('planner.astriteSuffix', { n: formatNumber(b.astrite || 0) })}{b.lustrous ? t('planner.lustrousSuffix', { n: formatNumber(b.lustrous) }) : ''}</div>
                <div className="text-gray-400 text-sm">P{b.charPity}/{b.weapPity}{b.charGuaranteed ? '(G)' : ''} • Std P{b.stdCharPity}/{b.stdWeapPity} • ×{b.charCopies}/{b.weapCopies}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => dispatch({ type: 'LOAD_BOOKMARK', id: b.id })} aria-label={t('planner.loadAriaLabel', { name: b.name })} className="px-3 py-1.5 text-sm bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 transition-colors min-h-[48px]">{t('planner.loadLabel')}</button>
                <button onClick={async () => { if (await confirm({ title: t('planner.deleteBookmarkTitle'), message: t('planner.deleteBookmarkMessage', { name: b.name }), confirmLabel: t('planner.deleteLabel'), destructive: true })) dispatch({ type: 'DELETE_BOOKMARK', id: b.id }); }} aria-label={t('planner.deleteAriaLabel', { name: b.name })} className="px-2 py-1.5 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 transition-colors min-h-[48px]">×</button>
              </div>
            </div>
          ))}
        </CardBody>
        )}
      </Card>
      {/* ── 8. Material Farming Planner ──────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('farm')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('farm'); } }} aria-expanded={!collapsed.farm}>
          <CardHeader action={<>
            {farmTargetsState.length > 0 && <span className="text-orange-400 text-sm">{t('planner.targetsCount', { count: farmTargetsState.length, plural: farmTargetsState.length > 1 ? 's' : '' })}</span>}
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.farm ? '' : 'rotate-180'}`} />
          </>}>{t('planner.farmingPlanner')}</CardHeader>
        </div>
        {!collapsed.farm && (
          <CardBody className="space-y-3">
            {/* Add Resonator button */}
            <button onClick={() => { setFarmPickerOpen(true); setFarmSearch(''); }} className="kuro-btn w-full active-gold" style={{ padding: '8px' }}>
              <Plus size={14} className="inline mr-1.5" />{t('planner.addResonator')}
            </button>

            {/* Resonator picker modal */}
            {farmPickerOpen && (
              <FocusTrapModal isOpen onClose={() => setFarmPickerOpen(false)} className="" onClick={() => setFarmPickerOpen(false)} centered padding="p-3">
                <div className="kuro-card w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)]">
                    <h3 className="text-white text-xl font-semibold">{t('planner.selectResonator')}</h3>
                    <button onClick={() => setFarmPickerOpen(false)} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label={t('planner.closeLabel')}><X size={16} /></button>
                  </div>
                  <div className="p-3 border-b border-[var(--border-subtle)]">
                    <div className="relative">
                      <input type="text" value={farmSearch} onChange={e => setFarmSearch(e.target.value)} placeholder={t('planner.searchResonators')} className="kuro-input w-full pl-8 text-base" aria-label={t('planner.searchResonatorsAria')} autoFocus />
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {/* sm:grid-cols-5 removed — real-viewport-based, predates
                        ScaledCanvas.jsx's engine (canvas is always phone-shaped
                        regardless of real width). Always 4 columns now. */}
                    <div className="grid grid-cols-4 gap-2">
                      {[...ALL_5STAR_RESONATORS, ...ALL_4STAR_RESONATORS].reverse()
                        .filter(n => !farmTargetsState.some(t => t.name === n))
                        .filter(n => !farmSearch || n.toLowerCase().includes(farmSearch.toLowerCase()))
                        .map(name => {
                          const cd = CHARACTER_DATA[name];
                          const img = DEFAULT_COLLECTION_IMAGES[name] || '';
                          const rarity5 = cd?.rarity === 5;
                          return (
                            <button key={name} onClick={() => { setFarmTargetsState(prev => [...prev, { name, ascension: true, skills: true, weapon: false }]); setFarmPickerOpen(false); }}
                              className={`relative rounded-lg overflow-hidden transition-all hover:scale-[1.03] active:scale-95 ${rarity5 ? 'border bg-yellow-500/10 border-yellow-500/30' : 'border bg-purple-500/10 border-purple-500/30'}`}
                              style={{ height: '96px', contain: 'paint' }}>
                              {img && <img src={img} alt={name} className="absolute inset-0 w-full h-full object-contain pointer-events-none" loading="lazy" onError={hideOnError} />}
                              <div className="absolute inset-x-0 bottom-0 h-1/2 kuro-gradient-fade-up" />
                              <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full text-2xs font-bold text-white flex items-center justify-center" style={{ background: getElementColor(cd?.element) }}>{getElementShape(cd?.element) || cd?.element?.[0]}</div>
                              <div className="absolute top-1 right-1"><Star size={8} className={rarity5 ? 'text-yellow-400' : 'text-purple-400'} fill="currentColor" /></div>
                              {cd?.role && <div className="absolute bottom-4 inset-x-0 flex justify-center"><span className="text-2xs px-1 py-0.5 rounded bg-black/60 text-gray-300 border border-[var(--border-medium)]">{cd.role}</span></div>}
                              <div className="absolute bottom-0 inset-x-0 p-1 z-10"><div className="text-white text-2xs font-medium truncate text-center leading-tight">{name}</div></div>
                            </button>
                          );
                      })}
                    </div>
                  </div>
                </div>
              </FocusTrapModal>
            )}

            {/* Farming targets — splash / buttons / resources as separate visual blocks */}
            {farmTargetsState.map((ftg, i) => {
              const d = CHARACTER_DATA[ftg.name];
              if (!d) return null;
              const elColor = d ? getElementColor(d.element) : '#9ca3af';
              const theme = CHARACTER_THEMES.find(ct => ct.name === ftg.name);
              const currentBanner = getCurrentBannerAuto().characters?.find(c => c.name === ftg.name);
              const themeArt = theme?.bannerArt || currentBanner?.imageUrl || DEFAULT_COLLECTION_IMAGES[ftg.name];
              const artPosition = theme?.pos?.header || currentBanner?.imagePosition || 'center 30%';

              // Per-character materials (shared helper — same math as the combined summary below)
              const { mats: charMats, potions: charPotions, shell: charShell } = computeFarmMaterials(ftg);
              const charMatList = Object.entries(charMats).sort((a, b) => b[1].qty - a[1].qty);
              const charPotionList = Object.entries(charPotions);
              const hasAnyToggle = ftg.ascension || ftg.skills || ftg.weapon;
              const weaponType = d.weapon;
              const localizedWeaponData = ftg.weapon ? getLocalizedWeaponData(getLocale()) : null;
              const weaponOptions = ftg.weapon
                ? Object.entries(WEAPON_DATA).filter(([, w]) => w.type === weaponType && (w.rarity === 5 || w.rarity === 4))
                    .map(([name]) => ({ name, label: localizedWeaponData[name]?.displayName || name }))
                : [];

              return (
                <div key={ftg.name} className="space-y-2">
                  {/* ── Splash banner ── */}
                  <div className="relative overflow-hidden rounded-xl" style={{ height: '96px', border: `1px solid ${elColor}40` }}>
                    {themeArt && (
                      <img src={themeArt} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" loading="lazy" onError={hideOnError}
                        style={{ opacity: 0.5, objectPosition: artPosition }} />
                    )}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,14,22,0.6) 0%, rgba(10,14,22,0.2) 50%, rgba(10,14,22,0.6) 100%)' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-bold text-2xl text-white px-4 py-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)', textShadow: `0 1px 6px rgba(0,0,0,0.5)` }}>{ftg.name}</span>
                    </div>
                    <button onClick={() => setFarmTargetsState(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 z-20 w-[30px] h-[30px] aspect-square p-0 rounded-lg bg-black/50 text-white/70 hover:text-white flex items-center justify-center transition-opacity btn-icon-square"
                      aria-label={t('planner.removeCharAria', { name: ftg.name })}><X size={12} /></button>
                  </div>

                  {/* ── Toggle buttons ── */}
                  <div className="flex gap-1.5">
                    {[['ascension', t('planner.ascension')], ['skills', t('planner.forte')], ['weapon', t('planner.weapon')]].map(([key, label]) => (
                      <button key={key} onClick={() => setFarmTargetsState(prev => prev.map((x, j) => j === i ? { ...x, [key]: !x[key] } : x))} className={`kuro-btn flex-1 text-sm ${ftg[key] ? 'active-emerald' : ''}`} style={{ padding: '8px' }}>{ftg[key] ? '✓ ' : ''}{label}</button>
                    ))}
                  </div>

                  {/* ── Weapon picker — only shown once the weapon toggle is on, defaults to the
                       character's recommended weapon but lets the player plan for any weapon of the
                       matching type instead ── */}
                  {ftg.weapon && weaponOptions.length > 0 && (
                    <KuroSelect
                      value={ftg.weaponName || d.bestWeapon || ''}
                      onChange={weaponName => setFarmTargetsState(prev => prev.map((x, j) => j === i ? { ...x, weaponName } : x))}
                      options={weaponOptions.map(({ name, label }) => ({ value: name, label }))}
                      className="w-full"
                      ariaLabel={t('planner.chooseWeaponAria', { name: ftg.name })}
                      small
                    />
                  )}

                  {/* ── Resources card ── */}
                  {hasAnyToggle && charMatList.length > 0 && (
                    <div className="p-3 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                      <div className="flex items-center justify-between p-1.5 rounded bg-yellow-500/10">
                        <span className="text-yellow-400 text-sm font-medium">{t('planner.shellCredit')}</span>
                        <span className="text-yellow-400 font-bold text-sm kuro-number">{formatNumber(charShell)}</span>
                      </div>
                      {charPotionList.length > 0 && (
                        <div className="grid grid-cols-2 gap-1">
                          {charPotionList.map(([name, qty]) => {
                            const img = MATERIAL_IMAGES?.[name];
                            return (
                              <div key={name} className="flex items-center gap-1.5 p-1.5 rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                                {img && <img src={img} alt="" className="w-6 h-6 rounded flex-shrink-0" onError={hideOnError} />}
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text-heading)' }}>{name}</div>
                                </div>
                                <span className="text-cyan-400 font-bold kuro-number text-xs flex-shrink-0">×{formatNumber(qty)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-1">
                        {charMatList.map(([name, { qty, img }]) => (
                          <div key={name} className="flex items-center gap-1.5 p-1.5 rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                            {img && <img src={img} alt="" className="w-6 h-6 rounded flex-shrink-0" onError={hideOnError} />}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate" style={{ color: 'var(--text-heading)' }}>{name}</div>
                            </div>
                            <span className="text-orange-400 font-bold kuro-number text-xs flex-shrink-0">×{qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Combined materials-owned tracker. Triggers for any non-empty target list (not just
                length > 1) — a single-character plan needs "already own" tracking just as much as a
                multi-character one; only the shell/potion summary blocks are skipped for a single
                target since the per-character card above already shows those, and repeating them
                here would just be a duplicate. */}
            {farmTargetsState.length > 0 && (() => {
              const mats = {};
              const potions = {};
              let totalShell = 0;
              farmTargetsState.forEach(ftg => {
                const r = computeFarmMaterials(ftg);
                totalShell += r.shell;
                for (const [name, { qty, img }] of Object.entries(r.mats)) {
                  if (!mats[name]) mats[name] = { qty: 0, img };
                  mats[name].qty += qty;
                }
                for (const [name, qty] of Object.entries(r.potions)) {
                  potions[name] = (potions[name] || 0) + qty;
                }
              });
              if (Object.keys(mats).length === 0) return null;
              const matList = Object.entries(mats).sort((a, b) => b[1].qty - a[1].qty);
              const potionList = Object.entries(potions);
              const isMulti = farmTargetsState.length > 1;
              return (
                <>
                  <div className="kuro-label mt-2">{isMulti ? t('planner.combinedTotal', { count: farmTargetsState.length, plural: farmTargetsState.length > 1 ? 's' : '' }) : t('planner.remainingLabel')}</div>
                  {isMulti && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 text-base font-medium">{t('planner.shellCredit')}</span>
                        <span className="text-yellow-400 font-bold text-lg kuro-number">{formatNumber(totalShell)}</span>
                      </div>
                    </div>
                  )}
                  {isMulti && potionList.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {potionList.map(([name, qty]) => {
                        const img = MATERIAL_IMAGES?.[name];
                        return (
                          <div key={name} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                            {img && <img src={img} alt="" className="w-7 h-7 rounded flex-shrink-0" onError={hideOnError} />}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>{name}</div>
                            </div>
                            <span className="text-cyan-400 font-bold kuro-number text-base flex-shrink-0">×{formatNumber(qty)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="text-2xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{t('planner.remainingHint')}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {matList.map(([name, { qty, img }]) => {
                      const owned = ownedMats[name] || 0;
                      const remaining = Math.max(0, qty - owned);
                      return (
                        <div key={name} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                          {img && <img src={img} alt="" className="w-7 h-7 rounded flex-shrink-0" onError={hideOnError} />}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>{name}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-2xs" style={{ color: 'var(--text-muted)' }}>{t('planner.ownedLabel')}</span>
                              <input
                                type="number"
                                min="0"
                                value={owned || ''}
                                placeholder="0"
                                onChange={e => {
                                  const v = Math.max(0, parseInt(e.target.value, 10) || 0);
                                  setOwnedMats(prev => v === 0 ? (({ [name]: _, ...rest }) => rest)(prev) : { ...prev, [name]: v });
                                }}
                                className="kuro-input text-2xs w-14 px-1 py-0.5"
                                aria-label={t('planner.ownedAria', { name })}
                              />
                            </div>
                          </div>
                          <span className="text-orange-400 font-bold kuro-number text-base flex-shrink-0">×{formatNumber(remaining)}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* Empty state */}
            {farmTargetsState.length === 0 && (
              <div className="kuro-empty-state text-center py-6">
                <div className="text-center py-6" style={{ color: 'var(--text-muted)' }}>{t('planner.awaitingFarming')}</div>
                <p style={{ color: 'var(--text-disabled)', fontSize: 'var(--font-sm)', marginTop: '4px' }}>{t('planner.selectResonatorsHint')}</p>
              </div>
            )}
          </CardBody>
        )}
      </Card>
    </div>
    </TabErrorBoundary>
    </div>
  );
}

export default React.memo(PlannerTab, (prev, next) =>
  prev.state.calc === next.state.calc && prev.state.planner === next.state.planner &&
  prev.state.eventStatus === next.state.eventStatus && prev.state.bookmarks === next.state.bookmarks &&
  prev.activeBanners === next.activeBanners && prev.bannerEndDate === next.bannerEndDate
);
