// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — CalculatorTab (extracted from App.jsx)
// Gacha probability calculator with banner selection, pity input, resource split
// ═══════════════════════════════════════════════════════════════════════════════
//
// [SECTION INDEX] - Use: grep -n "SECTION:" CalculatorTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// [SECTION:CALC]         Deferred calculation & astrite allocation
// [SECTION:RENDER]       JSX output
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ASTRITE_PER_PULL, MAX_ASTRITE, MAX_CALC_PULLS } from '../../data/constants.js';
import { haptic } from '../../utils/haptics.js';
import { calcStats } from '../../core/calcStats.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { PityCounterInput } from './PityCounterInput.jsx';
import { CalcResultsCard } from './CalcResults.jsx';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { Crown, Swords, Sword, Star, RefreshCcw, BookmarkPlus, X, Sparkles } from 'lucide-react';

import { MAX_BOOKMARK_NAME_LENGTH } from '../../shared/constants/appConstants.js';
import { useConfirm } from '../../providers/ConfirmProvider.jsx';
import { t, formatNumber } from '../../utils/i18n.js';
import { getCurrencyIcon } from '../../shared/utils/elementVisuals.js';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
const CALC_DEFER_MS = 150;

function CalculatorTab({ state, dispatch }) {
  const confirm = useConfirm();
  // ── Tab-local state ──────────────────────────────────────────────────────
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkName, setBookmarkName] = useState('');

  const setCalc = useCallback((f, v) => dispatch({ type: 'SET_CALC', field: f, value: v }), [dispatch]);

  // F-F02: Flash input border amber when value is clamped at max
  const clampFlashRef = useRef(null);
  const flashClamp = useCallback((inputEl) => {
    if (!inputEl) return;
    inputEl.classList.add('kuro-input-error');
    clearTimeout(clampFlashRef.current);
    clampFlashRef.current = setTimeout(() => inputEl.classList.remove('kuro-input-error'), 400);
  }, []);

  // ── Deferred calc (debounced DP computation) ─────────────────────────────
  // P15-FIX: MEDIUM-16 — Initial deferredCalc is null to defer first DP computation
  // until after first paint, preventing jank on calculator tab open.
  // [SECTION:CALC] ── Deferred calculation & astrite allocation ───────────────
  const [deferredCalc, setDeferredCalc] = useState(state.calc);
  const calcDeferTimerRef = useRef(null);
  useEffect(() => {
    if (calcDeferTimerRef.current) clearTimeout(calcDeferTimerRef.current);
    calcDeferTimerRef.current = setTimeout(() => setDeferredCalc(state.calc), CALC_DEFER_MS);
    return () => { if (calcDeferTimerRef.current) clearTimeout(calcDeferTimerRef.current); };
  }, [state.calc]);

  // Use state.calc as fallback when deferredCalc is null (initial render before deferred computation fires)
  const effectiveCalc = deferredCalc || state.calc;
  // FIX #48: Track whether deferred calc is still pending so we can show a loading indicator
  const isCalcPending = deferredCalc !== state.calc;

  // ── Smart astrite allocation for "Both" mode ─────────────────────────────
  // P2-FIX: Uses deferredCalc so heavy DP isn't triggered on every slider tick
  const astriteAllocation = useMemo(() => {
    const totalAstrite = (+effectiveCalc.astrite || 0) + (+effectiveCalc.lunite || 0); // Lunite converts to Astrite 1:1
    const totalPulls = Math.floor(totalAstrite / ASTRITE_PER_PULL);
    const radiant = +effectiveCalc.radiant || 0;
    const forging = +effectiveCalc.forging || 0;
    const lustrous = +effectiveCalc.lustrous || 0;

    if (effectiveCalc.selectedBanner !== 'both') {
      // Single banner mode - all resources go to that banner
      return {
        charAstritePulls: totalPulls,
        weapAstritePulls: totalPulls,
        charTotal: totalPulls + radiant,
        weapTotal: totalPulls + forging,
        stdCharTotal: totalPulls + lustrous,
        stdWeapTotal: totalPulls + lustrous,
        charPercent: 100,
        weapPercent: 100,
        stdCharAstrite: totalPulls,
        stdWeapAstrite: totalPulls,
        stdCharLustrous: lustrous,
        stdWeapLustrous: lustrous,
      };
    }

    // "Both" mode - split resources based on priority (0-100)
    // 0 = all weapon, 50 = balanced, 100 = all char
    const featPriority = typeof effectiveCalc.allocPriority === 'number' ? effectiveCalc.allocPriority : 50;
    const stdPriority = typeof effectiveCalc.stdAllocPriority === 'number' ? effectiveCalc.stdAllocPriority : 50;
    const charPercent = featPriority;
    const weapPercent = 100 - featPriority;

    const charAstritePulls = Math.floor(totalPulls * (charPercent / 100));
    const weapAstritePulls = totalPulls - charAstritePulls;

    // Standard banners use their own independent priority
    const stdCharPercent = stdPriority;
    const stdCharLustrous = Math.floor(lustrous * (stdCharPercent / 100));
    const stdWeapLustrous = lustrous - stdCharLustrous;

    // Standard Astrite split uses standard priority
    const stdCharAstrite = Math.floor(totalPulls * (stdCharPercent / 100));
    const stdWeapAstrite = totalPulls - stdCharAstrite;

    return {
      charAstritePulls,
      weapAstritePulls,
      charTotal: charAstritePulls + radiant,
      weapTotal: weapAstritePulls + forging,
      stdCharTotal: stdCharAstrite + stdCharLustrous,
      stdWeapTotal: stdWeapAstrite + stdWeapLustrous,
      charPercent,
      weapPercent,
      stdCharAstrite,
      stdWeapAstrite,
      stdCharLustrous,
      stdWeapLustrous,
    };
  }, [effectiveCalc.astrite, effectiveCalc.lunite, effectiveCalc.radiant, effectiveCalc.forging, effectiveCalc.lustrous, effectiveCalc.selectedBanner, effectiveCalc.allocPriority, effectiveCalc.stdAllocPriority]);

  // Calculate pulls for each banner type using allocation
  const { charTotal: charPulls, weapTotal: weapPulls, stdCharTotal: stdCharPulls, stdWeapTotal: stdWeapPulls } = astriteAllocation;

  // Calculate stats for each banner type
  // P2-FIX: Uses deferredCalc so DP arrays aren't allocated 60x/sec during slider drag
  const charStats = useMemo(() => deferredCalc ? calcStats(charPulls, effectiveCalc.charPity, effectiveCalc.charGuaranteed, true, effectiveCalc.charCopies, effectiveCalc.char4StarCopies, true) : null, [deferredCalc, charPulls, effectiveCalc.charPity, effectiveCalc.charGuaranteed, effectiveCalc.charCopies, effectiveCalc.char4StarCopies]);
  const weapStats = useMemo(() => deferredCalc ? calcStats(weapPulls, effectiveCalc.weapPity, false, false, effectiveCalc.weapCopies, effectiveCalc.weap4StarCopies, true) : null, [deferredCalc, weapPulls, effectiveCalc.weapPity, effectiveCalc.weapCopies, effectiveCalc.weap4StarCopies]);
  const stdCharStats = useMemo(() => deferredCalc ? calcStats(stdCharPulls, effectiveCalc.stdCharPity, false, false, effectiveCalc.stdCharCopies, effectiveCalc.stdChar4StarCopies, false) : null, [deferredCalc, stdCharPulls, effectiveCalc.stdCharPity, effectiveCalc.stdCharCopies, effectiveCalc.stdChar4StarCopies]);
  const stdWeapStats = useMemo(() => deferredCalc ? calcStats(stdWeapPulls, effectiveCalc.stdWeapPity, false, false, effectiveCalc.stdWeapCopies, effectiveCalc.stdWeap4StarCopies, false) : null, [deferredCalc, stdWeapPulls, effectiveCalc.stdWeapPity, effectiveCalc.stdWeapCopies, effectiveCalc.stdWeap4StarCopies]);

  // Combined stats for "Both" mode
  const combined = useMemo(() => {
    if (effectiveCalc.selectedBanner !== 'both') return null;
    if (!charStats || !weapStats || !stdCharStats || !stdWeapStats) return null;

    let charProb, weapProb;
    if (effectiveCalc.bannerCategory === 'featured') {
      charProb = (parseFloat(charStats.successRate) || 0) / 100;
      weapProb = (parseFloat(weapStats.successRate) || 0) / 100;
    } else {
      charProb = (parseFloat(stdCharStats.successRate) || 0) / 100;
      weapProb = (parseFloat(stdWeapStats.successRate) || 0) / 100;
    }

    return {
      both: (charProb * weapProb * 100).toFixed(1),
      atLeastOne: ((charProb + weapProb - charProb * weapProb) * 100).toFixed(1),
      charOnly: (charProb * (1 - weapProb) * 100).toFixed(1),
      weapOnly: (weapProb * (1 - charProb) * 100).toFixed(1),
      neither: ((1 - charProb) * (1 - weapProb) * 100).toFixed(1),
    };
  }, [effectiveCalc.selectedBanner, effectiveCalc.bannerCategory, charStats, weapStats, stdCharStats, stdWeapStats]);

  // [SECTION:RENDER] ── JSX output ───────────────────────────────────────────
  return (
    <>
          <div role="tabpanel" id="tabpanel-calculator" aria-labelledby="tab-calculator" tabIndex="0">
          <TabErrorBoundary tabName="Calculator">
          <div className="kuro-calc space-y-3 tab-content">
            <TabBackground id="calc" />

            {/* Banner Selection */}
            <Card>
              <CardHeader action={<div className="flex gap-2"><button onClick={async () => { if (await confirm?.({ title: t('calculator.resetTitle'), message: t('calculator.resetMessage'), confirmLabel: t('calculator.resetConfirm'), destructive: true })) { dispatch({ type: 'SET_CALC', field: '__reset', value: true }); haptic.light(); } }} className="text-gray-500 text-sm flex items-center gap-1 hover:text-red-400 transition-colors" aria-label={t('calculator.resetAria')}><RefreshCcw size={12} />{t('calculator.resetConfirm')}</button><button onClick={() => setShowBookmarkModal(true)} className="text-purple-400 text-sm flex items-center gap-1 hover:text-purple-300 transition-colors" aria-label={t('calculator.saveAria')}><BookmarkPlus size={12} />{t('calculator.saveLabel')}</button></div>}>{t('calculator.bannerSelection')}</CardHeader>
              <CardBody className="space-y-3">
                  {/* Featured Banners */}
                  <div className="space-y-2">
                    <div className="kuro-label" id="featured-convene-label">{t('calculator.featuredConvene')}</div>
                    <div className="text-gray-400 text-sm -mt-1">{t('calculator.limitedTimeBanner')}</div>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="featured-convene-label">
                      <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'char'); setCalc('forging', ''); setCalc('lustrous', ''); }} aria-pressed={state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'char'} className={`kuro-btn ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'char' ? 'active-gold' : ''}`}>
                        <Crown size={16} className="mx-auto mb-1.5" />{t('calculator.resonator')}
                      </button>
                      <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'weap'); setCalc('radiant', ''); setCalc('lustrous', ''); }} aria-pressed={state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'weap'} className={`kuro-btn ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'weap' ? 'active-pink' : ''}`}>
                        <Swords size={16} className="mx-auto mb-1.5" />{t('calculator.weapon')}
                      </button>
                    </div>
                    <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'both'); setCalc('lustrous', ''); }} aria-pressed={state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'both'} className={`kuro-btn w-full ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'both' ? 'active-emerald' : ''}`}>
                      <RefreshCcw size={14} className="inline mr-1.5" />{t('calculator.bothFeatured')}
                    </button>
                  </div>

                  {/* Standard Banners */}
                  <div className="space-y-2">
                    <div className="kuro-label" id="standard-convene-label">{t('calculator.standardConvene')}</div>
                    <div className="text-gray-400 text-sm -mt-1">{t('calculator.permanentBanner')}</div>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="standard-convene-label">
                      <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'char'); setCalc('radiant', ''); setCalc('forging', ''); }} aria-pressed={state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'char'} className={`kuro-btn ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'char' ? 'active-cyan' : ''}`}>
                        <Star size={16} className="mx-auto mb-1.5" />{t('calculator.resonator')}
                      </button>
                      <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'weap'); setCalc('radiant', ''); setCalc('forging', ''); }} aria-pressed={state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'weap'} className={`kuro-btn ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'weap' ? 'active-cyan' : ''}`}>
                        <Sword size={16} className="mx-auto mb-1.5 rotate-45" />{t('calculator.weapon')}
                      </button>
                    </div>
                    <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'both'); setCalc('radiant', ''); setCalc('forging', ''); }} aria-pressed={state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'both'} className={`kuro-btn w-full ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'both' ? 'active-emerald' : ''}`}>
                      <RefreshCcw size={14} className="inline mr-1.5" />{t('calculator.bothStandard')}
                    </button>
                  </div>

                  {/* 50/50 Toggle */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <div className="pb-1.5">
                    <button onClick={() => { const newVal = !state.calc.charGuaranteed; setCalc('charGuaranteed', newVal); setCalc('charGuaranteedManual', newVal); }} aria-pressed={state.calc.charGuaranteed} aria-label={state.calc.charGuaranteed ? t('calculator.guaranteedNext5starAria') : t('calculator.fiftyFiftyActiveAria')} className={`kuro-btn w-full ${state.calc.charGuaranteed ? 'active-emerald' : 'active-gold'}`}>
                      {state.calc.charGuaranteed ? t('calculator.guaranteed') : t('calculator.5050active')}
                    </button>
                    </div>
                  )}
                  {state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'weap' && (
                    <p className="text-gray-400 text-sm text-center">{t('calculator.weaponNoGuaranteed')}</p>
                  )}
              </CardBody>
            </Card>

            {/* Pity Counter */}
            <Card>
              <CardHeader>{t('calculator.pityCounter')}</CardHeader>
              <CardBody className="space-y-3">
                  {/* Featured Character Pity */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label={t('calculator.featuredResonatorLabel')} pity={state.calc.charPity} onPityChange={v => setCalc('charPity', v)}
                      color="#edaf18" softColor="#fb923c" softGlow="rgba(251,146,60,0.5)" sliderClass="" softPityClass="kuro-soft-pity" SoftPityIcon={Sparkles} ariaPrefix="Featured Resonator"
                    />
                  )}

                  {/* Featured Weapon Pity - Pink to match weapon banners */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label={t('calculator.featuredWeaponLabel')} pity={state.calc.weapPity} onPityChange={v => setCalc('weapPity', v)}
                      color="#f9a8d4" softColor="#ec4899" softGlow="rgba(236,72,153,0.5)" sliderClass="pink" softPityClass="kuro-soft-pity-pink" SoftPityIcon={Swords} ariaPrefix="Weapon"
                    />
                  )}

                  {/* Standard Resonator Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label={t('calculator.standardResonatorLabel')} pity={state.calc.stdCharPity} onPityChange={v => setCalc('stdCharPity', v)}
                      color="#22d3ee" softColor="#67e8f9" softGlow="rgba(103,232,249,0.5)" sliderClass="cyan" softPityClass="kuro-soft-pity-cyan" SoftPityIcon={Star} ariaPrefix="Standard Resonator"
                    />
                  )}

                  {/* Standard Weapon Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label={t('calculator.standardWeaponLabel')} pity={state.calc.stdWeapPity} onPityChange={v => setCalc('stdWeapPity', v)}
                      color="#22d3ee" softColor="#67e8f9" softGlow="rgba(103,232,249,0.5)" sliderClass="cyan" softPityClass="kuro-soft-pity-cyan" SoftPityIcon={Sword} ariaPrefix="Standard Weapon"
                    />
                  )}
              </CardBody>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>{t('calculator.resources')}</CardHeader>
              <CardBody className="space-y-3">
                  <div>
                    <label className="kuro-label"><img src={getCurrencyIcon('Astrite')} alt="" className="inline w-4 h-4 -mt-0.5 mr-1" onError={hideOnError} />{t('calculator.astrite')}</label>
                    <input type="number" min="0" max={MAX_ASTRITE} value={state.calc.astrite} onChange={e => { const v = +e.target.value || 0; const clamped = Math.max(0, Math.min(MAX_ASTRITE, v)); if (v > MAX_ASTRITE) flashClamp(e.target); setCalc('astrite', clamped); }} className="kuro-input" placeholder={t('calculator.astritePlaceholder')} aria-label={t('calculator.astriteAmountAria')} />
                    <span className="text-gray-600 text-sm">{t('calculator.maxHint', { max: formatNumber(MAX_ASTRITE) })}</span>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {[[ASTRITE_PER_PULL,t('calculator.convenePlural1')], [ASTRITE_PER_PULL*5,t('calculator.convenesN', { n: 5 })], [ASTRITE_PER_PULL*10,t('calculator.convenesN', { n: 10 })], [ASTRITE_PER_PULL*20,t('calculator.convenesN', { n: 20 })]].map(([amt, tip]) => (
                        <button key={amt} onClick={() => setCalc('astrite', String(Math.min(MAX_ASTRITE, (+state.calc.astrite || 0) + amt)))} className="kuro-btn kuro-btn-sm active-gold" style={{ paddingLeft: 8, paddingRight: 8 }} title={tip} aria-label={t('calculator.addAstriteAria', { amt: formatNumber(amt), tip })}>+{formatNumber(amt)}<span className="text-yellow-600 ml-0.5 text-sm">({tip.split(' ')[0]})</span></button>
                      ))}
                      <button onClick={() => setCalc('astrite', '')} className="kuro-btn kuro-btn-sm active-red ml-auto" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={t('calculator.clearAstriteAria')}>{t('calculator.clearLabel')}</button>
                    </div>
                  </div>
                  <div>
                    <label className="kuro-label"><img src={getCurrencyIcon('Lunite')} alt="" className="inline w-4 h-4 -mt-0.5 mr-1" onError={hideOnError} />{t('calculator.lunite')} <span className="text-gray-500 font-normal">{t('calculator.luniteConvertHint')}</span></label>
                    <input type="number" min="0" max={MAX_ASTRITE} value={state.calc.lunite} onChange={e => { const v = +e.target.value || 0; const clamped = Math.max(0, Math.min(MAX_ASTRITE, v)); if (v > MAX_ASTRITE) flashClamp(e.target); setCalc('lunite', clamped); }} className="kuro-input" placeholder="0" aria-label={t('calculator.luniteAmountAria')} />
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {[[ASTRITE_PER_PULL,t('calculator.convenePlural1')], [ASTRITE_PER_PULL*5,t('calculator.convenesN', { n: 5 })], [ASTRITE_PER_PULL*10,t('calculator.convenesN', { n: 10 })], [ASTRITE_PER_PULL*20,t('calculator.convenesN', { n: 20 })]].map(([amt, tip]) => (
                        <button key={amt} onClick={() => setCalc('lunite', String(Math.min(MAX_ASTRITE, (+state.calc.lunite || 0) + amt)))} className="kuro-btn kuro-btn-sm active-cyan" style={{ paddingLeft: 8, paddingRight: 8 }} title={tip} aria-label={t('calculator.addLuniteAria', { amt: formatNumber(amt), tip })}>+{formatNumber(amt)}<span className="text-cyan-600 ml-0.5 text-sm">({tip.split(' ')[0]})</span></button>
                      ))}
                      <button onClick={() => setCalc('lunite', '')} className="kuro-btn kuro-btn-sm active-red ml-auto" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={t('calculator.clearLuniteAria')}>{t('calculator.clearLabel')}</button>
                    </div>
                  </div>
                  {(() => {
                    const combined = (+state.calc.astrite || 0) + (+state.calc.lunite || 0);
                    const totalConvenes = Math.floor(combined / ASTRITE_PER_PULL);
                    return <p className="text-gray-400 text-sm">{t('calculator.convenesFromSummary', { convenes: formatNumber(totalConvenes), astrite: formatNumber(+state.calc.astrite || 0), luniteSuffix: (+state.calc.lunite || 0) > 0 ? t('calculator.luniteAddendum', { lunite: formatNumber(+state.calc.lunite || 0) }) : '' })}{totalConvenes > MAX_CALC_PULLS ? <span className="text-yellow-500">{t('calculator.calcCappedSuffix', { max: formatNumber(MAX_CALC_PULLS) })}</span> : ''}</p>;
                  })()}

                  {/* Featured banner resources */}
                  {state.calc.bannerCategory === 'featured' && (
                    <div className="grid grid-cols-2 gap-2">
                      {(state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div>
                          <label className="text-base mb-2 flex items-center gap-1 font-medium text-yellow-400"><img src={getCurrencyIcon('Radiant Tide')} alt="" className="w-4 h-4" onError={hideOnError} />{t('calculator.radiantTides')}</label>
                          <input type="number" min="0" max={MAX_CALC_PULLS} value={state.calc.radiant} onChange={e => setCalc('radiant', Math.max(0, Math.min(MAX_CALC_PULLS, +e.target.value || 0)))} className="kuro-input" placeholder="0" aria-label={t('calculator.radiantTides')} />
                          <div className="flex gap-1 mt-1.5">
                            {[1, 5, 10].map(amt => (
                              <button key={amt} onClick={() => setCalc('radiant', String(Math.min(MAX_CALC_PULLS, (+state.calc.radiant || 0) + amt)))} aria-label={t('calculator.addRadiantAria', { amt, plural: amt > 1 ? 's' : '' })} className="kuro-btn kuro-btn-sm active-gold" style={{ paddingLeft: 8, paddingRight: 8 }}>+{amt}</button>
                            ))}
                            <button onClick={() => setCalc('radiant', '')} className="kuro-btn kuro-btn-sm active-red ml-auto" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={t('calculator.clearRadiantAria')}>{t('calculator.clearLabel')}</button>
                          </div>
                        </div>
                      )}
                      {(state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div>
                          <label className="text-base mb-2 flex items-center gap-1 font-medium text-pink-400"><img src={getCurrencyIcon('Forging Tide')} alt="" className="w-4 h-4" onError={hideOnError} />{t('calculator.forgingTides')}</label>
                          <input type="number" min="0" max={MAX_CALC_PULLS} value={state.calc.forging} onChange={e => setCalc('forging', Math.max(0, Math.min(MAX_CALC_PULLS, +e.target.value || 0)))} className="kuro-input" placeholder="0" aria-label={t('calculator.forgingTides')} />
                          <div className="flex gap-1 mt-1.5">
                            {[1, 5, 10].map(amt => (
                              <button key={amt} onClick={() => setCalc('forging', String(Math.min(MAX_CALC_PULLS, (+state.calc.forging || 0) + amt)))} aria-label={t('calculator.addForgingAria', { amt, plural: amt > 1 ? 's' : '' })} className="kuro-btn kuro-btn-sm active-pink" style={{ paddingLeft: 8, paddingRight: 8 }}>+{amt}</button>
                            ))}
                            <button onClick={() => setCalc('forging', '')} className="kuro-btn kuro-btn-sm active-red ml-auto" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={t('calculator.clearForgingAria')}>{t('calculator.clearLabel')}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard banner resources */}
                  {state.calc.bannerCategory === 'standard' && (
                    <div>
                      <label className="text-base mb-2 flex items-center gap-1 font-medium text-cyan-400"><img src={getCurrencyIcon('Lustrous Tide')} alt="" className="w-4 h-4" onError={hideOnError} />{t('calculator.lustrousTides')}</label>
                      <input type="number" min="0" max={MAX_CALC_PULLS} value={state.calc.lustrous} onChange={e => setCalc('lustrous', Math.max(0, Math.min(MAX_CALC_PULLS, +e.target.value || 0)))} className="kuro-input" placeholder="0" aria-label={t('calculator.lustrousTides')} />
                      <div className="flex gap-1 mt-1.5">
                        {[1, 5, 10].map(amt => (
                          <button key={amt} onClick={() => setCalc('lustrous', String(Math.min(MAX_CALC_PULLS, (+state.calc.lustrous || 0) + amt)))} aria-label={t('calculator.addLustrousAria', { amt, plural: amt > 1 ? 's' : '' })} className="kuro-btn kuro-btn-sm active-cyan" style={{ paddingLeft: 8, paddingRight: 8 }}>+{amt}</button>
                        ))}
                        <button onClick={() => setCalc('lustrous', '')} className="kuro-btn kuro-btn-sm active-red ml-auto" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={t('calculator.clearLustrousAria')}>{t('calculator.clearLabel')}</button>
                      </div>
                    </div>
                  )}

                  {/* P8-FIX: HIGH-20 — Astrite Allocation Priority slider (replaces confusing dual +10% buttons) */}
                  {state.calc.selectedBanner === 'both' && (() => {
                    const priorityKey = state.calc.bannerCategory === 'standard' ? 'stdAllocPriority' : 'allocPriority';
                    const currentPriority = state.calc[priorityKey] ?? 50;
                    return (
                    <div>
                      <div className="kuro-label">{t('calculator.astritePriority')}{state.calc.bannerCategory === 'standard' ? t('calculator.astritePriorityStandard') : ''}</div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Crown size={12} style={{ color: currentPriority >= 50 ? '#edaf18' : '#6b7280' }} />
                          <span className="text-base font-medium" style={{ color: currentPriority >= 50 ? '#edaf18' : '#6b7280' }}>{t('calculator.resonatorPercent', { pct: currentPriority })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-medium" style={{ color: currentPriority <= 50 ? '#ec4899' : '#6b7280' }}>{t('calculator.weaponPercent', { pct: 100 - currentPriority })}</span>
                          <Swords size={12} style={{ color: currentPriority <= 50 ? '#ec4899' : '#6b7280' }} />
                        </div>
                      </div>
                      <input
                        type="range" min="0" max="100" step="5" value={currentPriority}
                        onChange={e => setCalc(priorityKey, +e.target.value)}
                        className="kuro-slider priority-slider w-full"
                        aria-label={t('calculator.allocAriaLabel', { char: currentPriority, weap: 100 - currentPriority })}
                        style={{ background: `linear-gradient(to right, #edaf18 0%, #edaf18 ${currentPriority}%, #ec4899 ${currentPriority}%, #ec4899 100%)` }}
                      />
                      {currentPriority !== 50 && (
                        <button
                          onClick={() => setCalc(priorityKey, 50)}
                          className="kuro-btn w-full mt-2 text-base"
                        >
                          <RefreshCcw size={12} className="inline mr-1.5" />{t('calculator.resetTo5050')}
                        </button>
                      )}
                    </div>
                  );
                  })()}

                  {/* Total Convenes Display */}
                  <div className="kuro-stat">
                    <div className="flex justify-around items-center">
                      {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(charPulls)}</div>
                          <div className="text-gray-400 text-sm">{t('calculator.resonatorConvenes')}</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-sm">{t('calculator.tidesSuffix', { n: formatNumber(astriteAllocation.charAstritePulls), extra: formatNumber(+state.calc.radiant || 0) })}</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-pink-400 kuro-number text-2xl">{formatNumber(weapPulls)}</div>
                          <div className="text-gray-400 text-sm">{t('calculator.weaponConvenes')}</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-sm">{t('calculator.tidesSuffix', { n: formatNumber(astriteAllocation.weapAstritePulls), extra: formatNumber(+state.calc.forging || 0) })}</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-cyan-400 kuro-number text-2xl">{formatNumber(stdCharPulls)}</div>
                          <div className="text-gray-400 text-sm">{t('calculator.resonatorConvenes')}</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-sm">{t('calculator.tidesSuffix', { n: formatNumber(astriteAllocation.stdCharAstrite), extra: formatNumber(astriteAllocation.stdCharLustrous) })}</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-cyan-400 kuro-number text-2xl">{formatNumber(stdWeapPulls)}</div>
                          <div className="text-gray-400 text-sm">{t('calculator.weaponConvenes')}</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-sm">{t('calculator.tidesSuffix', { n: formatNumber(astriteAllocation.stdWeapAstrite), extra: formatNumber(astriteAllocation.stdWeapLustrous) })}</div>}
                        </div>
                      )}
                    </div>
                  </div>
              </CardBody>
            </Card>

            {/* Results Cards — aria-live for screen reader announcements (Finding 13.5) */}
            {isCalcPending && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1" aria-live="polite">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400/60 animate-pulse" />
                {t('calculator.calculating')}
              </div>
            )}
            <div aria-live="polite" aria-atomic="false" className={`banner-grid space-y-3 lg:space-y-0 transition-opacity ${isCalcPending ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
            {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && charStats && (
              <CalcResultsCard title={t('calculator.featuredResonatorResults')} stats={charStats} accentStatClass="kuro-stat-gold" copies={state.calc.charCopies} isFeatured={true} />
            )}

            {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && weapStats && (
              <CalcResultsCard title={t('calculator.featuredWeaponResults')} stats={weapStats} accentStatClass="kuro-stat-pink" copies={state.calc.weapCopies} isFeatured={true} />
            )}

            {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && stdCharStats && (
              <CalcResultsCard title={t('calculator.standardResonatorResults')} stats={stdCharStats} accentStatClass="kuro-stat-cyan" copies={state.calc.stdCharCopies} isFeatured={false} />
            )}

            {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && stdWeapStats && (
              <CalcResultsCard title={t('calculator.standardWeaponResults')} stats={stdWeapStats} accentStatClass="kuro-stat-cyan" copies={state.calc.stdWeapCopies} isFeatured={false} />
            )}
            </div>

            {/* Combined Analysis */}
            {state.calc.selectedBanner === 'both' && combined && (
              <Card>
                <CardHeader>{t('calculator.combinedAnalysis')}</CardHeader>
                <CardBody>
                    <p className="text-gray-400 text-sm mb-2 text-center">
                      {t('calculator.chanceOfGetting')}<span className="text-yellow-300 font-semibold">{t('calculator.resonatorTimes', { n: state.calc.bannerCategory === 'featured' ? state.calc.charCopies : state.calc.stdCharCopies })}</span>{t('calculator.andConnector')}<span className="text-pink-300 font-semibold">{t('calculator.weaponTimes', { n: state.calc.bannerCategory === 'featured' ? state.calc.weapCopies : state.calc.stdWeapCopies })}</span>{t('calculator.withResources')}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="kuro-stat kuro-stat-emerald">
                        <div className="text-3xl kuro-number text-emerald-400 font-extrabold">{combined.both}%</div>
                        <div className="text-gray-400 text-sm mt-1">{t('calculator.getBoth')}</div>
                      </div>
                      <div className="kuro-stat kuro-stat-gold kuro-stat-hero">
                        <div className="text-yellow-400 text-3xl kuro-number font-extrabold">{combined.atLeastOne}%</div>
                        <div className="text-gray-400 text-sm mt-1">{t('calculator.atLeastOne')}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className={`kuro-stat ${state.calc.bannerCategory === 'featured' ? 'kuro-stat-gold' : 'kuro-stat-cyan'}`}>
                        <span className={`kuro-number ${state.calc.bannerCategory === 'featured' ? 'text-yellow-400' : 'text-cyan-400'}`}>{combined.charOnly}%</span>
                        <div className="text-gray-400 mt-0.5">{t('calculator.charOnly')}</div>
                      </div>
                      <div className={`kuro-stat ${state.calc.bannerCategory === 'featured' ? 'kuro-stat-pink' : 'kuro-stat-cyan'}`}>
                        <span className={`kuro-number ${state.calc.bannerCategory === 'featured' ? 'text-pink-400' : 'text-cyan-400'}`}>{combined.weapOnly}%</span>
                        <div className="text-gray-400 mt-0.5">{t('calculator.weapOnly')}</div>
                      </div>
                      <div className="kuro-stat kuro-stat-red">
                        <span className="text-red-400 kuro-number">{combined.neither}%</span>
                        <div className="text-gray-400 mt-0.5">{t('calculator.neither')}</div>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                      <p className="text-emerald-400/80 text-sm">{t('calculator.astriteSplit', { char: astriteAllocation.charPercent, weap: astriteAllocation.weapPercent })}</p>
                    </div>
                </CardBody>
              </Card>
            )}
          </div>
          </TabErrorBoundary>
          </div>

      {/* Bookmark Modal */}
      <FocusTrapModal isOpen={showBookmarkModal} onClose={() => setShowBookmarkModal(false)} className="" onClick={() => setShowBookmarkModal(false)} ariaLabel={t('calculator.saveCurrentState')} centered padding="p-3">
          <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <CardHeader action={<button onClick={() => setShowBookmarkModal(false)} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label={t('calculator.closeBookmarkModalAria')}><X size={16} /></button>}>{t('calculator.saveCurrentState')}</CardHeader>
            <CardBody className="space-y-3">
              <input type="text" value={bookmarkName} onChange={e => setBookmarkName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { haptic.success(); dispatch({ type: 'SAVE_BOOKMARK', name: bookmarkName || t('calculator.defaultBookmarkName', { n: (state.bookmarks?.length || 0) + 1 }) }); setBookmarkName(''); setShowBookmarkModal(false); } }} placeholder={t('calculator.bookmarkNamePlaceholder')} maxLength={MAX_BOOKMARK_NAME_LENGTH} className="kuro-input w-full" aria-label={t('calculator.bookmarkNameAria')} />
              <div className="text-gray-300 text-sm">
                <p>{t('calculator.bookmarkBannerLine', { category: state.calc.bannerCategory === 'featured' ? t('planner.featuredLabel') : t('planner.standardLabel'), type: state.calc.selectedBanner === 'char' ? t('planner.resonatorLabel') : state.calc.selectedBanner === 'weap' ? t('planner.weaponLabel') : t('planner.bothLabel') })}</p>
                <p>{t('calculator.bookmarkAstriteLine', { astrite: formatNumber(+state.calc.astrite || 0), radiant: state.calc.radiant || 0, forging: state.calc.forging || 0, lustrous: state.calc.lustrous || 0 })}</p>
                <p>{t('calculator.bookmarkPityLine', { charPity: state.calc.charPity, guaranteed: state.calc.charGuaranteed ? t('calculator.bookmarkGuaranteedSuffix') : '', weapPity: state.calc.weapPity })}</p>
                <p>{t('calculator.bookmarkStdPityLine', { stdCharPity: state.calc.stdCharPity, stdWeapPity: state.calc.stdWeapPity })}</p>
                <p>{t('calculator.bookmarkCopiesLine', { charCopies: state.calc.charCopies, weapCopies: state.calc.weapCopies, stdCharCopies: state.calc.stdCharCopies, stdWeapCopies: state.calc.stdWeapCopies })}</p>
              </div>
              <button onClick={() => { haptic.success(); dispatch({ type: 'SAVE_BOOKMARK', name: bookmarkName || t('calculator.defaultBookmarkName', { n: (state.bookmarks?.length || 0) + 1 }) }); setBookmarkName(''); setShowBookmarkModal(false); }} className="kuro-btn w-full active-purple">{t('calculator.saveBookmarkButton')}</button>
            </CardBody>
          </Card>
      </FocusTrapModal>
    </>
  );
}

// React.memo: only re-render when calc or bookmarks state changes (not profile, events, etc.)
export default React.memo(CalculatorTab, (prev, next) =>
  prev.state.calc === next.state.calc && prev.state.bookmarks === next.state.bookmarks && prev.dispatch === next.dispatch
);
