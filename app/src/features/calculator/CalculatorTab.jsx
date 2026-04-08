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
import { haptic } from '../../utils/helpers.js';
import { calcStats } from '../../core/calcStats.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { PityCounterInput } from '../../shared/components/PityCounterInput.jsx';
import { CalcResultsCard } from '../../shared/components/CalcResults.jsx';
import { FocusTrapModal } from '../../providers/FocusTrapModal.jsx';
import { Crown, Swords, Sword, Star, Diamond, RefreshCcw, BookmarkPlus, X, Sparkles } from 'lucide-react';

import { MAX_BOOKMARK_NAME_LENGTH } from '../../shared/constants/appConstants.js';
const CALC_DEFER_MS = 150;

function CalculatorTab({ state, dispatch }) {
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
  const [deferredCalc, setDeferredCalc] = useState(null);
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
              <CardHeader action={<button onClick={() => setShowBookmarkModal(true)} className="text-purple-400 text-xs flex items-center gap-1 hover:text-purple-300 transition-colors" aria-label="Save current state as bookmark"><BookmarkPlus size={12} />Save</button>}>Banner Selection</CardHeader>
              <CardBody className="space-y-3">
                  {/* Featured Banners */}
                  <div className="space-y-2">
                    <div className="kuro-label" id="featured-convene-label">Featured Convene</div>
                    <div className="text-gray-400 text-xs -mt-1">Limited-time banner</div>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="featured-convene-label">
                      <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'char'); setCalc('forging', ''); setCalc('lustrous', ''); }} aria-pressed={state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'char'} className={`kuro-btn ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'char' ? 'active-gold' : ''}`}>
                        <Crown size={16} className="mx-auto mb-1.5" />Resonator
                      </button>
                      <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'weap'); setCalc('radiant', ''); setCalc('lustrous', ''); }} aria-pressed={state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'weap'} className={`kuro-btn ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'weap' ? 'active-pink' : ''}`}>
                        <Swords size={16} className="mx-auto mb-1.5" />Weapon
                      </button>
                    </div>
                    <button onClick={() => { setCalc('bannerCategory', 'featured'); setCalc('selectedBanner', 'both'); setCalc('lustrous', ''); }} aria-pressed={state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'both'} className={`kuro-btn w-full ${state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'both' ? 'active-emerald' : ''}`}>
                      <RefreshCcw size={14} className="inline mr-1.5" />Both Featured
                    </button>
                  </div>

                  {/* Standard Banners */}
                  <div className="space-y-2">
                    <div className="kuro-label" id="standard-convene-label">Standard Convene</div>
                    <div className="text-gray-400 text-xs -mt-1">Permanent banner</div>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="standard-convene-label">
                      <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'char'); setCalc('radiant', ''); setCalc('forging', ''); }} aria-pressed={state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'char'} className={`kuro-btn ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'char' ? 'active-cyan' : ''}`}>
                        <Star size={16} className="mx-auto mb-1.5" />Resonator
                      </button>
                      <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'weap'); setCalc('radiant', ''); setCalc('forging', ''); }} aria-pressed={state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'weap'} className={`kuro-btn ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'weap' ? 'active-cyan' : ''}`}>
                        <Sword size={16} className="mx-auto mb-1.5 rotate-45" />Weapon
                      </button>
                    </div>
                    <button onClick={() => { setCalc('bannerCategory', 'standard'); setCalc('selectedBanner', 'both'); setCalc('radiant', ''); setCalc('forging', ''); }} aria-pressed={state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'both'} className={`kuro-btn w-full ${state.calc.bannerCategory === 'standard' && state.calc.selectedBanner === 'both' ? 'active-emerald' : ''}`}>
                      <RefreshCcw size={14} className="inline mr-1.5" />Both Standard
                    </button>
                  </div>

                  {/* 50/50 Toggle */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <button onClick={() => { const newVal = !state.calc.charGuaranteed; setCalc('charGuaranteed', newVal); setCalc('charGuaranteedManual', newVal); }} aria-pressed={state.calc.charGuaranteed} aria-label={state.calc.charGuaranteed ? 'Guaranteed next 5-star: on' : '50/50 active: off'} className={`kuro-btn w-full ${state.calc.charGuaranteed ? 'active-emerald' : 'active-gold'}`}>
                      {state.calc.charGuaranteed ? '✓ Guaranteed (100%)' : '⚠ 50/50 Active'}
                    </button>
                  )}
                  {state.calc.bannerCategory === 'featured' && state.calc.selectedBanner === 'weap' && (
                    <p className="text-gray-400 text-xs text-center">Weapon banners do not have a guaranteed pity system.</p>
                  )}
              </CardBody>
            </Card>

            {/* Pity Counter */}
            <Card>
              <CardHeader>Pity Counter</CardHeader>
              <CardBody className="space-y-3">
                  {/* Featured Character Pity */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label="Featured Resonator" pity={state.calc.charPity} onPityChange={v => setCalc('charPity', v)}
                      copies={state.calc.charCopies} maxCopies={7} onCopiesChange={v => setCalc('charCopies', v)}
                      fourStarCopies={state.calc.char4StarCopies} maxFourStar={21} onFourStarChange={v => setCalc('char4StarCopies', v)}
                      color="#edaf18" softColor="#fb923c" softGlow="rgba(251,146,60,0.5)" sliderClass="" softPityClass="kuro-soft-pity" SoftPityIcon={Sparkles} ariaPrefix="Featured Resonator"
                    />
                  )}

                  {/* Featured Weapon Pity - Pink to match weapon banners */}
                  {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label="Featured Weapon" pity={state.calc.weapPity} onPityChange={v => setCalc('weapPity', v)}
                      copies={state.calc.weapCopies} maxCopies={5} onCopiesChange={v => setCalc('weapCopies', v)}
                      fourStarCopies={state.calc.weap4StarCopies} maxFourStar={15} onFourStarChange={v => setCalc('weap4StarCopies', v)}
                      color="#f9a8d4" softColor="#ec4899" softGlow="rgba(236,72,153,0.5)" sliderClass="pink" softPityClass="kuro-soft-pity-pink" SoftPityIcon={Swords} ariaPrefix="Weapon"
                    />
                  )}

                  {/* Standard Resonator Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label="Standard Resonator" pity={state.calc.stdCharPity} onPityChange={v => setCalc('stdCharPity', v)}
                      copies={state.calc.stdCharCopies} maxCopies={7} onCopiesChange={v => setCalc('stdCharCopies', v)}
                      fourStarCopies={state.calc.stdChar4StarCopies} maxFourStar={21} onFourStarChange={v => setCalc('stdChar4StarCopies', v)}
                      color="#22d3ee" softColor="#67e8f9" softGlow="rgba(103,232,249,0.5)" sliderClass="cyan" softPityClass="kuro-soft-pity-cyan" SoftPityIcon={Star} ariaPrefix="Standard Resonator"
                    />
                  )}

                  {/* Standard Weapon Pity */}
                  {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                    <PityCounterInput
                      label="Standard Weapon" pity={state.calc.stdWeapPity} onPityChange={v => setCalc('stdWeapPity', v)}
                      copies={state.calc.stdWeapCopies} maxCopies={5} onCopiesChange={v => setCalc('stdWeapCopies', v)}
                      fourStarCopies={state.calc.stdWeap4StarCopies} maxFourStar={15} onFourStarChange={v => setCalc('stdWeap4StarCopies', v)}
                      color="#22d3ee" softColor="#67e8f9" softGlow="rgba(103,232,249,0.5)" sliderClass="cyan" softPityClass="kuro-soft-pity-cyan" SoftPityIcon={Sword} ariaPrefix="Standard Weapon"
                    />
                  )}
              </CardBody>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>Resources</CardHeader>
              <CardBody className="space-y-3">
                  <div>
                    <label className="kuro-label"><Diamond size={12} className="inline -mt-0.5 mr-1 text-yellow-400" />Astrite</label>
                    <input type="number" min="0" max={MAX_ASTRITE} value={state.calc.astrite} onChange={e => { const v = +e.target.value || 0; const clamped = Math.max(0, Math.min(MAX_ASTRITE, v)); if (v > MAX_ASTRITE) flashClamp(e.target); setCalc('astrite', clamped); }} className="kuro-input" placeholder="e.g. 1600" aria-label="Astrite amount" />
                    <span className="text-gray-600 text-xs">Max {MAX_ASTRITE.toLocaleString('en-US')}</span>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {[[ASTRITE_PER_PULL,'1 Convene'], [ASTRITE_PER_PULL*5,'5 Convenes'], [ASTRITE_PER_PULL*10,'10 Convenes'], [ASTRITE_PER_PULL*20,'20 Convenes']].map(([amt, tip]) => (
                        <button key={amt} onClick={() => setCalc('astrite', String(Math.min(MAX_ASTRITE, (+state.calc.astrite || 0) + amt)))} className="kuro-btn kuro-btn-sm active-gold" title={tip} aria-label={`Add ${amt.toLocaleString('en-US')} Astrite (${tip})`}>+{amt.toLocaleString('en-US')}<span className="text-yellow-600 ml-0.5 text-xs">({tip.split(' ')[0]})</span></button>
                      ))}
                      <button onClick={() => setCalc('astrite', '')} className="kuro-btn kuro-btn-sm active-red" aria-label="Clear Astrite">Clear</button>
                    </div>
                  </div>
                  <div>
                    <label className="kuro-label"><Diamond size={12} className="inline -mt-0.5 mr-1 text-cyan-400" />Lunite <span className="text-gray-500 font-normal">(converts to Astrite 1:1)</span></label>
                    <input type="number" min="0" max={MAX_ASTRITE} value={state.calc.lunite} onChange={e => { const v = +e.target.value || 0; const clamped = Math.max(0, Math.min(MAX_ASTRITE, v)); if (v > MAX_ASTRITE) flashClamp(e.target); setCalc('lunite', clamped); }} className="kuro-input" placeholder="0" aria-label="Lunite amount" />
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {[[ASTRITE_PER_PULL,'1 Convene'], [ASTRITE_PER_PULL*5,'5 Convenes'], [ASTRITE_PER_PULL*10,'10 Convenes'], [ASTRITE_PER_PULL*20,'20 Convenes']].map(([amt, tip]) => (
                        <button key={amt} onClick={() => setCalc('lunite', String(Math.min(MAX_ASTRITE, (+state.calc.lunite || 0) + amt)))} className="kuro-btn kuro-btn-sm active-cyan" title={tip} aria-label={`Add ${amt.toLocaleString('en-US')} Lunite (${tip})`}>+{amt.toLocaleString('en-US')}<span className="text-cyan-600 ml-0.5 text-xs">({tip.split(' ')[0]})</span></button>
                      ))}
                      <button onClick={() => setCalc('lunite', '')} className="kuro-btn kuro-btn-sm active-red" aria-label="Clear Lunite">Clear</button>
                    </div>
                  </div>
                  {(() => {
                    const combined = (+state.calc.astrite || 0) + (+state.calc.lunite || 0);
                    const totalConvenes = Math.floor(combined / ASTRITE_PER_PULL);
                    return <p className="text-gray-400 text-xs">= {totalConvenes.toLocaleString('en-US')} Convenes from {(+state.calc.astrite || 0).toLocaleString('en-US')} Astrite{(+state.calc.lunite || 0) > 0 ? ` + ${(+state.calc.lunite || 0).toLocaleString('en-US')} Lunite` : ''}{totalConvenes > MAX_CALC_PULLS ? <span className="text-yellow-500"> (calc capped at {MAX_CALC_PULLS.toLocaleString('en-US')})</span> : ''}</p>;
                  })()}

                  {/* Featured banner resources */}
                  {state.calc.bannerCategory === 'featured' && (
                    <div className="grid grid-cols-2 gap-2">
                      {(state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div>
                          <label className="text-xs mb-2 block font-medium text-yellow-400">Radiant Tides</label>
                          <input type="number" min="0" max={MAX_CALC_PULLS} value={state.calc.radiant} onChange={e => setCalc('radiant', Math.max(0, Math.min(MAX_CALC_PULLS, +e.target.value || 0)))} className="kuro-input" placeholder="0" aria-label="Radiant Tides" />
                          <div className="flex gap-1 mt-1.5">
                            {[1, 5, 10].map(amt => (
                              <button key={amt} onClick={() => setCalc('radiant', String(Math.min(MAX_CALC_PULLS, (+state.calc.radiant || 0) + amt)))} aria-label={`Add ${amt} Radiant Tide${amt > 1 ? 's' : ''}`} className="kuro-btn kuro-btn-sm active-gold">+{amt}</button>
                            ))}
                            <button onClick={() => setCalc('radiant', '')} className="kuro-btn kuro-btn-sm active-red" aria-label="Clear Radiant Tides">Clear</button>
                          </div>
                        </div>
                      )}
                      {(state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div>
                          <label className="text-xs mb-2 block font-medium text-pink-400">Forging Tides</label>
                          <input type="number" min="0" max={MAX_CALC_PULLS} value={state.calc.forging} onChange={e => setCalc('forging', Math.max(0, Math.min(MAX_CALC_PULLS, +e.target.value || 0)))} className="kuro-input" placeholder="0" aria-label="Forging Tides" />
                          <div className="flex gap-1 mt-1.5">
                            {[1, 5, 10].map(amt => (
                              <button key={amt} onClick={() => setCalc('forging', String(Math.min(MAX_CALC_PULLS, (+state.calc.forging || 0) + amt)))} aria-label={`Add ${amt} Forging Tide${amt > 1 ? 's' : ''}`} className="kuro-btn kuro-btn-sm active-pink">+{amt}</button>
                            ))}
                            <button onClick={() => setCalc('forging', '')} className="kuro-btn kuro-btn-sm active-red" aria-label="Clear Forging Tides">Clear</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard banner resources */}
                  {state.calc.bannerCategory === 'standard' && (
                    <div>
                      <label className="text-xs mb-2 block font-medium text-cyan-400">Lustrous Tides</label>
                      <input type="number" min="0" max={MAX_CALC_PULLS} value={state.calc.lustrous} onChange={e => setCalc('lustrous', Math.max(0, Math.min(MAX_CALC_PULLS, +e.target.value || 0)))} className="kuro-input" placeholder="0" aria-label="Lustrous Tides" />
                      <div className="flex gap-1 mt-1.5">
                        {[1, 5, 10].map(amt => (
                          <button key={amt} onClick={() => setCalc('lustrous', String(Math.min(MAX_CALC_PULLS, (+state.calc.lustrous || 0) + amt)))} aria-label={`Add ${amt} Lustrous Tide${amt > 1 ? 's' : ''}`} className="kuro-btn kuro-btn-sm active-cyan">+{amt}</button>
                        ))}
                        <button onClick={() => setCalc('lustrous', '')} className="kuro-btn kuro-btn-sm active-red" aria-label="Clear Lustrous Tides">Clear</button>
                      </div>
                    </div>
                  )}

                  {/* P8-FIX: HIGH-20 — Astrite Allocation Priority slider (replaces confusing dual +10% buttons) */}
                  {state.calc.selectedBanner === 'both' && (() => {
                    const priorityKey = state.calc.bannerCategory === 'standard' ? 'stdAllocPriority' : 'allocPriority';
                    const currentPriority = state.calc[priorityKey] ?? 50;
                    return (
                    <div>
                      <div className="kuro-label">Astrite Priority{state.calc.bannerCategory === 'standard' ? ' (Standard)' : ''}</div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Crown size={12} style={{ color: currentPriority >= 50 ? '#edaf18' : '#6b7280' }} />
                          <span className="text-xs font-medium" style={{ color: currentPriority >= 50 ? '#edaf18' : '#6b7280' }}>Resonator {currentPriority}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium" style={{ color: currentPriority <= 50 ? '#ec4899' : '#6b7280' }}>Weapon {100 - currentPriority}%</span>
                          <Swords size={12} style={{ color: currentPriority <= 50 ? '#ec4899' : '#6b7280' }} />
                        </div>
                      </div>
                      <input
                        type="range" min="0" max="100" step="5" value={currentPriority}
                        onChange={e => setCalc(priorityKey, +e.target.value)}
                        className="kuro-slider priority-slider w-full"
                        aria-label={`Astrite allocation: ${currentPriority}% Resonator, ${100 - currentPriority}% Weapon`}
                        style={{ background: `linear-gradient(to right, #edaf18 0%, #edaf18 ${currentPriority}%, #ec4899 ${currentPriority}%, #ec4899 100%)` }}
                      />
                      {currentPriority !== 50 && (
                        <button
                          onClick={() => setCalc(priorityKey, 50)}
                          className="kuro-btn w-full mt-2 text-xs"
                        >
                          <RefreshCcw size={12} className="inline mr-1.5" />Reset to 50/50
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
                          <div className="text-yellow-400 kuro-number text-xl">{charPulls.toLocaleString('en-US')}</div>
                          <div className="text-gray-400 text-xs">Resonator Convenes</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-xs">({astriteAllocation.charAstritePulls.toLocaleString('en-US')} + {(+state.calc.radiant || 0).toLocaleString('en-US')} tides)</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-pink-400 kuro-number text-xl">{weapPulls.toLocaleString('en-US')}</div>
                          <div className="text-gray-400 text-xs">Weapon Convenes</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-xs">({astriteAllocation.weapAstritePulls.toLocaleString('en-US')} + {(+state.calc.forging || 0).toLocaleString('en-US')} tides)</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-cyan-400 kuro-number text-xl">{stdCharPulls.toLocaleString('en-US')}</div>
                          <div className="text-gray-400 text-xs">Resonator Convenes</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-xs">({astriteAllocation.stdCharAstrite.toLocaleString('en-US')} + {astriteAllocation.stdCharLustrous.toLocaleString('en-US')} tides)</div>}
                        </div>
                      )}
                      {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && (
                        <div className="text-center">
                          <div className="text-cyan-400 kuro-number text-xl">{stdWeapPulls.toLocaleString('en-US')}</div>
                          <div className="text-gray-400 text-xs">Weapon Convenes</div>
                          {state.calc.selectedBanner === 'both' && <div className="text-gray-400 text-xs">({astriteAllocation.stdWeapAstrite.toLocaleString('en-US')} + {astriteAllocation.stdWeapLustrous.toLocaleString('en-US')} tides)</div>}
                        </div>
                      )}
                    </div>
                  </div>
              </CardBody>
            </Card>

            {/* Results Cards — aria-live for screen reader announcements (Finding 13.5) */}
            {isCalcPending && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1" aria-live="polite">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400/60 animate-pulse" />
                Calculating…
              </div>
            )}
            <div aria-live="polite" aria-atomic="false" className={`banner-grid space-y-3 lg:space-y-0 transition-opacity ${isCalcPending ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
            {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && charStats && (
              <CalcResultsCard title="Featured Resonator Results" stats={charStats} accentStatClass="kuro-stat-gold" copies={state.calc.charCopies} isFeatured={true} />
            )}

            {state.calc.bannerCategory === 'featured' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && weapStats && (
              <CalcResultsCard title="Featured Weapon Results" stats={weapStats} accentStatClass="kuro-stat-pink" copies={state.calc.weapCopies} isFeatured={true} />
            )}

            {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'char' || state.calc.selectedBanner === 'both') && stdCharStats && (
              <CalcResultsCard title="Standard Resonator Results" stats={stdCharStats} accentStatClass="kuro-stat-cyan" copies={state.calc.stdCharCopies} isFeatured={false} />
            )}

            {state.calc.bannerCategory === 'standard' && (state.calc.selectedBanner === 'weap' || state.calc.selectedBanner === 'both') && stdWeapStats && (
              <CalcResultsCard title="Standard Weapon Results" stats={stdWeapStats} accentStatClass="kuro-stat-cyan" copies={state.calc.stdWeapCopies} isFeatured={false} />
            )}
            </div>

            {/* Combined Analysis */}
            {state.calc.selectedBanner === 'both' && combined && (
              <Card>
                <CardHeader>Combined Analysis</CardHeader>
                <CardBody>
                    <p className="text-gray-400 text-xs mb-2 text-center">
                      Chance of getting <span className="text-yellow-300 font-semibold">{state.calc.bannerCategory === 'featured' ? state.calc.charCopies : state.calc.stdCharCopies}× Resonator</span> AND <span className="text-pink-300 font-semibold">{state.calc.bannerCategory === 'featured' ? state.calc.weapCopies : state.calc.stdWeapCopies}× Weapon</span> with your current resources
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="kuro-stat kuro-stat-emerald">
                        <div className="text-2xl kuro-number text-emerald-400 font-extrabold">{combined.both}%</div>
                        <div className="text-gray-400 text-xs mt-1">Get Both</div>
                      </div>
                      <div className="kuro-stat kuro-stat-gold kuro-stat-hero">
                        <div className="text-yellow-400 text-2xl kuro-number font-extrabold">{combined.atLeastOne}%</div>
                        <div className="text-gray-400 text-xs mt-1">At Least One</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className={`kuro-stat ${state.calc.bannerCategory === 'featured' ? 'kuro-stat-gold' : 'kuro-stat-cyan'}`}>
                        <span className={`kuro-number ${state.calc.bannerCategory === 'featured' ? 'text-yellow-400' : 'text-cyan-400'}`}>{combined.charOnly}%</span>
                        <div className="text-gray-400 mt-0.5">Char Only</div>
                      </div>
                      <div className={`kuro-stat ${state.calc.bannerCategory === 'featured' ? 'kuro-stat-pink' : 'kuro-stat-cyan'}`}>
                        <span className={`kuro-number ${state.calc.bannerCategory === 'featured' ? 'text-pink-400' : 'text-cyan-400'}`}>{combined.weapOnly}%</span>
                        <div className="text-gray-400 mt-0.5">Weap Only</div>
                      </div>
                      <div className="kuro-stat kuro-stat-red">
                        <span className="text-red-400 kuro-number">{combined.neither}%</span>
                        <div className="text-gray-400 mt-0.5">Neither</div>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                      <p className="text-emerald-400/80 text-xs">✓ Astrite split: {astriteAllocation.charPercent}% Resonator / {astriteAllocation.weapPercent}% Weapon</p>
                    </div>
                </CardBody>
              </Card>
            )}
          </div>
          </TabErrorBoundary>
          </div>

      {/* Bookmark Modal */}
      <FocusTrapModal isOpen={showBookmarkModal} onClose={() => setShowBookmarkModal(false)} className="" onClick={() => setShowBookmarkModal(false)} ariaLabel="Save bookmark" centered>
          <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <CardHeader action={<button onClick={() => setShowBookmarkModal(false)} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close bookmark modal"><X size={16} /></button>}>Save Current State</CardHeader>
            <CardBody className="space-y-3">
              <input type="text" value={bookmarkName} onChange={e => setBookmarkName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { haptic.success(); dispatch({ type: 'SAVE_BOOKMARK', name: bookmarkName || `Save ${(state.bookmarks?.length || 0) + 1}` }); setBookmarkName(''); setShowBookmarkModal(false); } }} placeholder="Enter name…" maxLength={MAX_BOOKMARK_NAME_LENGTH} className="kuro-input w-full" aria-label="Bookmark name" />
              <div className="text-gray-300 text-xs">
                <p>Banner: {state.calc.bannerCategory === 'featured' ? 'Featured' : 'Standard'} {state.calc.selectedBanner === 'char' ? 'Resonator' : state.calc.selectedBanner === 'weap' ? 'Weapon' : 'Both'}</p>
                <p>Astrite: {(+state.calc.astrite || 0).toLocaleString('en-US')} • Radiant: {state.calc.radiant || 0} • Forging: {state.calc.forging || 0} • Lustrous: {state.calc.lustrous || 0}</p>
                <p>Resonator Pity: {state.calc.charPity}{state.calc.charGuaranteed ? ' (G)' : ''} • Weapon Pity: {state.calc.weapPity}</p>
                <p>Standard Resonator Pity: {state.calc.stdCharPity} • Standard Weapon Pity: {state.calc.stdWeapPity}</p>
                <p>Copies: Resonator x{state.calc.charCopies} • Weapon x{state.calc.weapCopies} • Standard Resonator x{state.calc.stdCharCopies} • Standard Weapon x{state.calc.stdWeapCopies}</p>
              </div>
              <button onClick={() => { haptic.success(); dispatch({ type: 'SAVE_BOOKMARK', name: bookmarkName || `Save ${(state.bookmarks?.length || 0) + 1}` }); setBookmarkName(''); setShowBookmarkModal(false); }} className="kuro-btn w-full active-purple">Save Bookmark</button>
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
