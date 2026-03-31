// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — PlannerTab (extracted from App.jsx)
// Resource income planning and goal tracking
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo } from 'react';
import { Calendar, Check, ChevronDown, Minus, Plus } from 'lucide-react';
import {
  ASTRITE_PER_PULL, LUNITE_DAILY_ASTRITE, HARD_PITY,
  SUBSCRIPTIONS, generateUniqueId,
} from '../../appcore-data.js';
import {
  Card, CardHeader, CardBody, TabBackground, TabErrorBoundary,
  CountdownTimer, KuroSelect,
} from '../../appcore-components.jsx';

export default function PlannerTab({
  state,
  dispatch,
  activeBanners,
  bannerEndDate,
  toast,
  confirm,
}) {
  const [showIncomePanel, setShowIncomePanel] = useState(false);

  const isCalcDefaults = !state.calc.astrite && state.calc.charPity === 0 && state.calc.weapPity === 0 && !state.calc.charGuaranteed && !state.calc.radiant && !state.calc.forging && !state.calc.lustrous;

  const dailyIncome = useMemo(() => {
    return (state.planner.dailyAstrite || 0) + (state.planner.luniteActive ? LUNITE_DAILY_ASTRITE : 0);
  }, [state.planner.dailyAstrite, state.planner.luniteActive]);

  const planData = useMemo(() => {
    const currentAstrite = +state.calc.astrite || 0;
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
      if (isChar) { goalCopies = Math.max(1, state.calc.charCopies || 1); goalBannerLabel = 'Featured Resonator'; }
      else if (isWeap) { goalCopies = Math.max(1, state.calc.weapCopies || 1); goalBannerLabel = 'Featured Weapon'; }
      else { goalCopies = Math.max(1, state.calc.charCopies || 1, state.calc.weapCopies || 1); goalBannerLabel = 'Featured Both'; }
    } else {
      if (isChar) { goalCopies = Math.max(1, state.calc.stdCharCopies || 1); goalBannerLabel = 'Standard Resonator'; }
      else if (isWeap) { goalCopies = Math.max(1, state.calc.stdWeapCopies || 1); goalBannerLabel = 'Standard Weapon'; }
      else { goalCopies = Math.max(1, state.calc.stdCharCopies || 1, state.calc.stdWeapCopies || 1); goalBannerLabel = 'Standard Both'; }
    }
    const targetPulls = Math.max(1, state.planner.goalPulls * goalCopies * state.planner.goalModifier);
    const targetAstrite = targetPulls * ASTRITE_PER_PULL;
    const goalNeeded = Math.max(0, targetAstrite - currentAstrite);
    const goalDaysNeeded = goalNeeded <= 0 ? 0 : (dailyIncome > 0 ? Math.ceil(goalNeeded / dailyIncome) : Infinity);
    const goalProgress = targetAstrite > 0 ? Math.min(100, (currentAstrite / targetAstrite) * 100) : 0;
    return { currentAstrite, daysLeft, incomeByEnd, totalAstriteByEnd, convenesByEnd, isFeatured, goalCopies, goalBannerLabel, targetPulls, targetAstrite, goalNeeded, goalDaysNeeded, goalProgress };
  }, [state.calc, state.planner.goalPulls, state.planner.goalModifier, bannerEndDate, dailyIncome]);

  return (
    <div role="tabpanel" id="tabpanel-planner" aria-labelledby="tab-planner" tabIndex="0">
    <TabErrorBoundary tabName="Planner">
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="planner" />

      {isCalcDefaults && (
        <div className="text-center text-gray-500" style={{ fontSize: '10px', padding: '4px 0' }}>
          💡 Set up your pity &amp; banner in the Calculator tab for accurate projections.
        </div>
      )}

      <Card>
        <CardHeader>Daily Income</CardHeader>
        <CardBody className="space-y-3">
          <div>
            <label className="kuro-label" title="Includes Commissions, Dailies, etc.">Daily Astrite</label>
            <input type="number" value={state.planner.dailyAstrite} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'dailyAstrite', value: Math.max(0, Math.floor(+e.target.value || 0)) })} className="kuro-input w-full" aria-label="Daily Astrite income" />
            <div className="text-gray-500 text-[10px] mt-1">Avg. daily Astrite from commissions + dailies</div>
          </div>
          {state.planner.luniteActive && (
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400 text-xs">Lunite Subscription</span>
              </div>
              <span className="text-emerald-400 text-xs">+90/day</span>
            </div>
          )}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 text-sm font-medium"><Calendar size={14} className="inline mr-1.5 -mt-0.5" />Daily Income</span>
              <span className="text-yellow-400 font-bold kuro-number text-base">{dailyIncome} Astrite</span>
            </div>
            <div className="text-gray-400 text-[10px] mt-1">≈ <span className="kuro-number">{(dailyIncome / ASTRITE_PER_PULL).toFixed(2)}</span> Convenes/day • <span className="kuro-number">{Math.floor(dailyIncome * 30 / ASTRITE_PER_PULL)}</span> Convenes/month</div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setShowIncomePanel(!showIncomePanel)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowIncomePanel(!showIncomePanel); } }} aria-expanded={showIncomePanel}>
          <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showIncomePanel ? 'rotate-180' : ''}`} />}>Add Purchases</CardHeader>
        </div>
        {showIncomePanel && (
          <CardBody className="space-y-2">
            <div className="kuro-label">Subscriptions</div>
            <button onClick={() => dispatch({ type: 'SET_PLANNER', field: 'luniteActive', value: !state.planner.luniteActive })} aria-pressed={state.planner.luniteActive} aria-label={`Lunite Subscription: ${state.planner.luniteActive ? 'active' : 'inactive'}`} className={`kuro-btn w-full text-left ${state.planner.luniteActive ? 'active-emerald' : ''}`}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded flex items-center justify-center ${state.planner.luniteActive ? 'bg-emerald-500 text-black' : ''}`} style={!state.planner.luniteActive ? { background: 'var(--bg-btn)' } : undefined}>
                    {state.planner.luniteActive && <Check size={10} />}
                  </span>
                  <div>
                    <div className={`text-xs font-medium ${state.planner.luniteActive ? 'text-emerald-400' : 'text-gray-200'}`}>Lunite Subscription</div>
                    <div className="text-gray-300 text-[10px]">300 Lunite + {SUBSCRIPTIONS.lunite.daily} Astrite/day × {SUBSCRIPTIONS.lunite.duration}d</div>
                  </div>
                </div>
                <span className="text-emerald-400 text-xs">${SUBSCRIPTIONS.lunite.price}/mo</span>
              </div>
            </button>
            {/* Weekly sub: Lunite is a separate in-game currency (not tracked here), only Astrite counts toward pulls */}
            {/* AUDIT-FIX L22: Toast feedback for purchases */}
            <button onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: SUBSCRIPTIONS.weekly.astrite, radiant: 0, lustrous: 0, label: SUBSCRIPTIONS.weekly.name, price: SUBSCRIPTIONS.weekly.price } }); toast?.addToast?.(`Added ${SUBSCRIPTIONS.weekly.name}`, 'success'); }} className="kuro-btn w-full text-left">
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="text-gray-200 text-xs font-medium">{SUBSCRIPTIONS.weekly.name}</div>
                  <div className="text-gray-300 text-[10px]">{SUBSCRIPTIONS.weekly.desc}</div>
                </div>
                <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">${SUBSCRIPTIONS.weekly.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
              </div>
            </button>
            {Object.entries(SUBSCRIPTIONS).filter(([k]) => k === 'bpInsider' || k === 'bpConnoisseur').map(([k, s]) => (
              <button key={k} onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: s.astrite, radiant: s.radiant || 0, lustrous: s.lustrous || 0, label: s.name, price: s.price } }); toast?.addToast?.(`Added ${s.name}`, 'success'); }} className="kuro-btn w-full text-left">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="text-gray-200 text-xs font-medium">{s.name}</div>
                    <div className="text-gray-300 text-[10px]">{s.desc}</div>
                  </div>
                  <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                </div>
              </button>
            ))}
            <div className="kuro-label mt-3">Direct Top-Ups</div>
            {Object.entries(SUBSCRIPTIONS).filter(([k]) => k.startsWith('directTop')).map(([k, s]) => (
              <button key={k} onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: s.astrite, radiant: 0, lustrous: 0, label: s.name, price: s.price } }); toast?.addToast?.(`Added ${s.name}`, 'success'); }} className="kuro-btn w-full text-left">
                <div className="flex items-center justify-between w-full">
                  <div><div className="text-gray-200 text-xs font-medium">{s.name}</div><div className="text-gray-300 text-[10px]">{s.desc}</div></div>
                  <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                </div>
              </button>
            ))}
          </CardBody>
        )}
      </Card>

      {state.planner.addedIncome.length > 0 && (
        <Card>
          {/* AUDIT-FIX H6: Confirm before clearing all purchases */}
          <CardHeader action={<button onClick={async () => { if (await confirm({ title: 'Clear purchases', message: 'Remove all added purchases?', confirmLabel: 'Remove All', destructive: true })) dispatch({ type: 'CLEAR_ALL_INCOME' }); }} className="text-red-400 text-[10px] hover:text-red-300 transition-colors" aria-label="Clear all added purchases">Clear All</button>}>Added Purchases</CardHeader>
          <CardBody className="space-y-2">
            {state.planner.addedIncome.map(i => (
              <div key={i.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-xs">
                <span className="text-gray-200">{i.label}</span>
                <div className="flex items-center gap-2">
                  {i.astrite > 0 && <span className="text-yellow-400">+{i.astrite}</span>}
                  {i.radiant > 0 && <span className="text-yellow-400" title="Radiant Tide — Featured banner pull ticket">+{i.radiant} Radiant Tide{i.radiant !== 1 ? 's' : ''}</span>}
                  {i.lustrous > 0 && <span className="text-cyan-400" title="Lustrous Tide — Standard banner pull ticket">+{i.lustrous} Lustrous Tide{i.lustrous !== 1 ? 's' : ''}</span>}
                  {/* AUDIT-FIX H6: Confirm before removing individual purchase */}
                  <button onClick={async () => { if (await confirm({ title: 'Remove purchase', message: `Remove "${i.label}"?`, confirmLabel: 'Remove', destructive: true })) dispatch({ type: 'REMOVE_INCOME', id: i.id }); }} className="text-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center -my-2" aria-label={`Remove purchase: ${i.label}`}><Minus size={12} /></button>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-[var(--border-medium)] flex justify-between text-xs">
              <span className="text-gray-400">Total Spent</span>
              <span className="text-emerald-400 font-bold">${state.planner.addedIncome.reduce((s, i) => s + i.price, 0).toFixed(2)}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {planData.daysLeft > 0 && (
        <Card>
          <CardHeader>By Banner End</CardHeader>
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[10px]" title={`Game version ${activeBanners.version}, phase ${activeBanners.phase} — each version has two limited-time banner phases`}>Version {activeBanners.version} Phase {activeBanners.phase} ends in {planData.daysLeft} day{planData.daysLeft !== 1 ? 's' : ''}</span>
              <CountdownTimer endDate={bannerEndDate} compact />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="kuro-stat p-2 text-center">
                <div className="text-yellow-400 kuro-number text-xl">{planData.convenesByEnd}</div>
                <div className="text-gray-400 text-[10px]">Total Convenes</div>
              </div>
              <div className="kuro-stat p-2 text-center">
                <div className="text-yellow-400 kuro-number text-xl">{Math.floor(planData.incomeByEnd / ASTRITE_PER_PULL)}</div>
                <div className="text-gray-400 text-[10px]">Earned Convenes</div>
              </div>
              <div className="kuro-stat p-2 text-center">
                <div className="text-yellow-400 kuro-number text-xl">{planData.totalAstriteByEnd.toLocaleString()}</div>
                <div className="text-gray-400 text-[10px]">Total Astrite</div>
              </div>
            </div>
            <div className="text-gray-400 text-[10px] text-center">Current {planData.currentAstrite.toLocaleString()} + {planData.incomeByEnd.toLocaleString()} earned ({dailyIncome}/day × {planData.daysLeft}d)</div>
          </CardBody>
        </Card>
      )}

      {/* Income Projections */}
      <Card>
        <CardHeader>Income Projections</CardHeader>
        <CardBody>
          {/* MED-29: 30-day emphasized as primary planning horizon */}
          {dailyIncome === 0 ? (
            <div className="p-4 text-center rounded-lg" style={{ background: 'var(--bg-stat)' }}>
              <div className="text-gray-400 text-sm mb-1">No daily income set</div>
              <div className="text-gray-500 text-xs">Set your Daily Astrite income above to see projections.</div>
            </div>
          ) : (
          <div className="grid grid-cols-3 gap-2">
            {[7, 30, 90].map(days => (
              <div key={days} className={`kuro-stat p-3 text-center ${days === 30 ? 'border-yellow-500/30 kuro-stat-gold' : ''}`}>
                <div className="text-gray-400 text-[10px] mb-1">{days === 30 ? 'Monthly' : `${days} Days`}</div>
                <div className={`kuro-number text-yellow-400 font-extrabold ${days === 30 ? 'text-3xl' : 'text-xl'}`}>{Math.floor(dailyIncome * days / ASTRITE_PER_PULL)}</div>
                <div className="text-gray-400 text-[10px]">Convenes</div>
                <div className="text-gray-400 text-[10px]">{(dailyIncome * days).toLocaleString()} Astrite</div>
              </div>
            ))}
          </div>
          )}
          {state.planner.luniteActive && (
            <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
              <span className="text-emerald-400 text-xs">Monthly Subscription Cost: </span>
              <span className="text-emerald-400 font-bold text-xs">${SUBSCRIPTIONS.lunite.price}/month</span>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>Goal Progress</CardHeader>
        <CardBody className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="kuro-label">Base Convenes (per copy)</label>
              <KuroSelect
                value={state.planner.goalPulls}
                onChange={v => dispatch({ type: 'SET_PLANNER', field: 'goalPulls', value: +v })}
                options={[
                  { value: HARD_PITY, label: `${HARD_PITY} (Hard Pity)` },
                  { value: HARD_PITY * 2, label: `${HARD_PITY * 2} (Guaranteed)` },
                  { value: 240, label: '240 (Char + Signature)' },
                ]}
                className="w-full"
                ariaLabel="Base Convenes per copy"
                small
              />
            </div>
            <div>
              <label className="kuro-label">Multiplier</label>
              <KuroSelect
                value={state.planner.goalModifier}
                onChange={v => dispatch({ type: 'SET_PLANNER', field: 'goalModifier', value: +v })}
                options={[
                  { value: 1, label: '×1' },
                  { value: 2, label: '×2' },
                  { value: 3, label: '×3' },
                ]}
                className="w-full"
                ariaLabel="Copies multiplier"
                small
              />
            </div>
          </div>
          <div className="p-2 bg-white/5 rounded-lg text-[10px] text-gray-400 text-center">
            Using Calculator: <span className={planData.isFeatured ? 'text-yellow-400' : 'text-cyan-400'}>{planData.goalBannerLabel}</span> × <span className="text-gray-100">{planData.goalCopies}</span> copies
          </div>
          <div className="text-[10px] text-gray-500 text-center" style={{ marginTop: '-4px' }}>
            <span title="How many Convenes needed for one copy (e.g. 80 at hard pity, 160 if guaranteed)">Base Convenes</span>{' × '}
            <span title="Optional multiplier to plan for multiple goal sets at once">Multiplier</span>{' × '}
            <span title="Number of copies of the selected banner target (from Calculator)">Copies</span>{' = total Convenes needed'}
          </div>
          <div className="p-3 bg-white/5 rounded-lg" aria-live="polite" aria-atomic="false">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Target</span>
              <span className="text-gray-100 font-bold">{planData.targetPulls} Convenes ({planData.targetAstrite.toLocaleString()} Astrite)</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-stat)' }} role="progressbar" aria-valuenow={planData.goalProgress} aria-valuemin={0} aria-valuemax={100} aria-label={`Goal progress: ${planData.goalProgress.toFixed(1)}%`}>
              <div className={`h-full transition-[width] duration-300 ${planData.isFeatured ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`} style={{ width: `${planData.goalProgress}%` }} />
            </div>
            <div className="flex justify-between text-[10px] mt-1">
              <span className="text-gray-400">{Math.floor(planData.currentAstrite / ASTRITE_PER_PULL)} / {planData.targetPulls} Convenes</span>
              <span className="text-gray-100">{planData.goalProgress.toFixed(1)}%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="kuro-stat p-3 text-center">
              <div className="text-yellow-400 kuro-number text-xl">{planData.goalNeeded.toLocaleString()}</div>
              <div className="text-gray-400 text-[10px]">Astrite Needed</div>
            </div>
            <div className="kuro-stat p-3 text-center">
              <div className="text-yellow-400 kuro-number text-xl">{planData.goalDaysNeeded === Infinity ? '∞' : planData.goalDaysNeeded}</div>
              <div className="text-gray-400 text-[10px]">Days to Goal</div>
            </div>
          </div>
          {planData.goalDaysNeeded === Infinity && dailyIncome === 0 && (
            <div className="p-2 bg-white/5 rounded-lg text-center">
              <span className="text-gray-500 text-[10px]">Set a daily Astrite income to estimate days to goal.</span>
            </div>
          )}
          {planData.goalDaysNeeded !== Infinity && planData.goalDaysNeeded > 0 && (
            <div className="p-2 bg-white/5 rounded-lg text-center">
              <span className="text-gray-400 text-[10px]">Estimated: </span>
              <span className="text-yellow-400 text-xs font-medium">{new Date(Date.now() + planData.goalDaysNeeded * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* AUDIT-FIX M21: Always show Saved States card with empty state message */}
      <Card>
        <CardHeader>Saved States</CardHeader>
        <CardBody className="space-y-2">
          {state.bookmarks.length === 0 ? (
            <p className="kuro-empty-state text-gray-500 text-xs text-center py-3">Awaiting archived states. Save a configuration in the Calculator to create a bookmark.</p>
          ) : state.bookmarks.map(b => (
            <div key={b.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
              <div>
                <div className="text-gray-200 text-xs font-medium">{b.name}</div>
                <div className="text-gray-400 text-[10px]">{b.bannerCategory === 'featured' ? 'Featured' : 'Standard'} {b.selectedBanner === 'char' ? 'Res' : b.selectedBanner === 'weap' ? 'Wep' : 'Both'} • {b.astrite || 0} Astrite{b.lustrous ? ` • ${b.lustrous} Lustrous` : ''}</div>
                <div className="text-gray-400 text-[10px]">P{b.charPity}/{b.weapPity}{b.charGuaranteed ? '(G)' : ''} • Std P{b.stdCharPity}/{b.stdWeapPity} • ×{b.charCopies}/{b.weapCopies}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => dispatch({ type: 'LOAD_BOOKMARK', id: b.id })} aria-label={`Load bookmark: ${b.name}`} className="px-3 py-1.5 text-[10px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 transition-colors min-h-[44px]">Load</button>
                {/* AUDIT-FIX H6: Confirm before deleting bookmark */}
                <button onClick={async () => { if (await confirm({ title: 'Delete bookmark', message: `Delete bookmark "${b.name}"?`, confirmLabel: 'Delete', destructive: true })) dispatch({ type: 'DELETE_BOOKMARK', id: b.id }); }} aria-label={`Delete bookmark: ${b.name}`} className="px-2.5 py-1.5 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 transition-colors min-h-[44px]">×</button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
    </TabErrorBoundary>
    </div>
  );
}
