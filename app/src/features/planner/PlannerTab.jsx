// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — PlannerTab (extracted from App.jsx)
// Resource income planning and goal tracking
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { ASTRITE_PER_PULL, LUNITE_DAILY_ASTRITE, HARD_PITY, SUBSCRIPTIONS } from '../../data/constants.js';
import { EVENTS } from '../../data/banners.js';
import { generateUniqueId } from '../../utils/helpers.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/Backgrounds.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { CountdownTimer } from '../../shared/components/CountdownTimer.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';

// ══════════════════════════════════════════════════════════════════════════════
// ASTRITE CALENDAR — Clean, minimal, neon-bar style from analytics histogram
// One accent color per cell based on earned progress. No clutter.
// ══════════════════════════════════════════════════════════════════════════════

// Neon color by earned convenes (matches analytics pity distribution bars)
const getDayColor = (earned, target) => {
  if (earned <= 0) return null;
  const pct = target > 0 ? (earned / target) * 100 : earned;
  if (pct >= 80) return '#ef4444';  // red — nearly there
  if (pct >= 60) return '#f97316';  // orange
  if (pct >= 40) return '#edaf18';  // gold
  if (pct >= 20) return '#4ade80';  // lime
  return '#22c55e';                  // green — just started
};

// Collect event astrite rewards for a date
const getEventAstrite = (date) => {
  let total = 0;
  const dow = date.getDay();
  // Weekly rewards (Monday)
  if (dow === 1) {
    for (const ev of Object.values(EVENTS)) {
      if (ev.weeklyReset && ev.rewards) {
        const a = parseInt(ev.rewards, 10);
        if (a > 0) total += a;
      }
    }
  }
  return total;
};

function AstriteCalendar({ dailyIncome, bannerEndDate, planData, activeBanners, eventStatus, calendarNotes, onSetNote }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [noteInput, setNoteInput] = useState('');

  const calendarData = useMemo(() => {
    const now = new Date();
    const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const bannerEnd = new Date(bannerEndDate); bannerEnd.setHours(23, 59, 59, 999);

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d); date.setHours(0, 0, 0, 0);
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const isBannerDay = date <= bannerEnd && date >= today;
      const daysSinceToday = Math.max(0, Math.floor((date - today) / 86400000));
      const earned = isPast ? 0 : dailyIncome * (daysSinceToday + (isToday ? 0 : 1));
      const eventBonus = isPast ? 0 : getEventAstrite(date);
      const totalEarned = earned + eventBonus;
      const convenes = Math.floor(totalEarned / ASTRITE_PER_PULL);
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      days.push({ day: d, date, dateKey, isPast, isToday, isBannerDay, earned: totalEarned, convenes, eventBonus, note: calendarNotes?.[dateKey] || '' });
    }

    return { year, month, firstDay, daysInMonth, days, monthName: viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }, [monthOffset, dailyIncome, bannerEndDate, calendarNotes]);

  const handleDayTap = useCallback((d) => {
    if (d.isPast) return;
    if (selectedDay === d.dateKey) { setSelectedDay(null); return; }
    setSelectedDay(d.dateKey);
    setNoteInput(d.note);
  }, [selectedDay]);

  const saveNote = useCallback(() => {
    if (selectedDay && onSetNote) onSetNote(selectedDay, noteInput.trim());
    setSelectedDay(null);
    setNoteInput('');
  }, [selectedDay, noteInput, onSetNote]);

  const selectedData = selectedDay ? calendarData.days.find(d => d.dateKey === selectedDay) : null;

  return (
    <Card>
      <CardHeader>
        <Calendar size={14} className="inline mr-1.5 -mt-0.5 text-yellow-400" />Astrite Calendar
      </CardHeader>
      <CardBody className="space-y-3">
        {/* ── Month nav ── */}
        <div className="flex items-center justify-between">
          <button onClick={() => setMonthOffset(p => p - 1)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white" aria-label="Previous month"><ChevronLeft size={16} /></button>
          <button onClick={() => setMonthOffset(0)} className="text-gray-200 text-sm font-medium hover:text-yellow-400 transition-colors" aria-label="Current month">{calendarData.monthName}</button>
          <button onClick={() => setMonthOffset(p => p + 1)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white" aria-label="Next month"><ChevronRight size={16} /></button>
        </div>

        {/* ── Weekday headers ── */}
        <div className="grid grid-cols-7 gap-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-gray-600 text-[9px] font-bold py-0.5">{d}</div>
          ))}
        </div>

        {/* ── Calendar grid — neon bar fill per day ── */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: calendarData.firstDay }, (_, i) => <div key={`e${i}`} />)}
          {calendarData.days.map(d => {
            const color = getDayColor(d.earned, planData.targetAstrite);
            const fillPct = planData.targetAstrite > 0 ? Math.min(100, (d.earned / planData.targetAstrite) * 100) : 0;
            const isSelected = selectedDay === d.dateKey;
            const hasNote = !!d.note;

            return (
              <button
                key={d.day} type="button" disabled={d.isPast}
                onClick={() => handleDayTap(d)}
                className={`relative rounded overflow-hidden transition-all ${
                  isSelected ? 'ring-1 ring-yellow-400'
                  : d.isToday ? 'ring-1 ring-yellow-500/60'
                  : ''
                }`}
                style={{ aspectRatio: '1', background: 'var(--bg-stat)' }}
                title={d.isPast ? '' : `+${d.earned.toLocaleString('en-US')} Astrite${d.eventBonus ? ` (${d.eventBonus} from events)` : ''} — ${d.convenes} Convenes${d.note ? `\n${d.note}` : ''}`}
              >
                {/* Neon fill bar from bottom — same style as histogram */}
                {!d.isPast && color && fillPct > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 transition-all" style={{
                    height: `${Math.max(fillPct, 8)}%`,
                    background: `linear-gradient(to top, ${color}35, ${color}10)`,
                    borderTop: `1px solid ${color}60`,
                    boxShadow: `inset 0 0 8px ${color}20`,
                  }} />
                )}

                {/* Day number */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <span className={`text-[11px] leading-none font-semibold ${
                    d.isToday ? 'text-yellow-400' : d.isPast ? 'text-gray-700' : color ? '' : 'text-gray-400'
                  }`} style={!d.isPast && color ? { color } : undefined}>
                    {d.day}
                  </span>

                  {/* Banner period dot */}
                  {d.isBannerDay && !d.isPast && (
                    <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />
                  )}
                </div>

                {/* Note indicator */}
                {hasNote && <span className="absolute top-0 right-0.5 text-[6px] z-10">📝</span>}
              </button>
            );
          })}
        </div>

        {/* ── Legend — minimal ── */}
        <div className="flex items-center gap-4 justify-center text-[9px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />Today</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />Banner</span>
          <span className="flex items-center gap-1">
            <span className="flex gap-px">{['#22c55e','#edaf18','#ef4444'].map(c => <span key={c} className="w-1.5 h-3 rounded-sm" style={{ background: `${c}40`, borderTop: `1px solid ${c}` }} />)}</span>
            Progress
          </span>
        </div>

        {/* ── Selected day panel ── */}
        {selectedData && (
          <div className="p-3 rounded-lg border border-[var(--border-medium)]" style={{ background: 'var(--bg-elevated)' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-200 text-xs font-medium">
                {selectedData.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <div className="flex items-center gap-3">
                {selectedData.earned > 0 && (
                  <span className="text-[10px]">
                    <span className="text-yellow-400 kuro-number font-bold">{selectedData.earned.toLocaleString('en-US')}</span>
                    <span className="text-gray-500"> Astrite</span>
                    {selectedData.eventBonus > 0 && <span className="text-purple-400 ml-1">(+{selectedData.eventBonus} events)</span>}
                  </span>
                )}
                <button onClick={() => setSelectedDay(null)} className="text-gray-500 p-1 hover:text-white">✕</button>
              </div>
            </div>

            {/* Note editor */}
            <div className="flex gap-1.5">
              <input
                type="text" value={noteInput}
                onChange={e => setNoteInput(e.target.value.slice(0, 100))}
                onKeyDown={e => { if (e.key === 'Enter') saveNote(); }}
                placeholder="Add a note or goal..."
                className="kuro-input flex-1 text-[10px] py-1.5 px-2"
                aria-label="Calendar note"
              />
              <button onClick={saveNote} className="kuro-btn text-[10px] px-3 py-1 active-gold">
                {selectedData.note ? 'Update' : 'Save'}
              </button>
            </div>
            {selectedData.note && (
              <div className="mt-1.5 flex justify-between items-center">
                <span className="text-gray-300 text-[10px]">📝 {selectedData.note}</span>
                <button onClick={() => { onSetNote(selectedDay, ''); setNoteInput(''); }} className="text-red-400 text-[10px] hover:text-red-300">Remove</button>
              </div>
            )}
          </div>
        )}

        {/* ── Month total ── */}
        {dailyIncome > 0 && (
          <div className="flex justify-center gap-4 text-[10px]">
            <span className="text-gray-400">This month: <span className="text-yellow-400 kuro-number font-bold">{(dailyIncome * calendarData.daysInMonth).toLocaleString('en-US')}</span> Astrite</span>
            <span className="text-gray-400">≈ <span className="text-yellow-400 kuro-number font-bold">{Math.floor(dailyIncome * calendarData.daysInMonth / ASTRITE_PER_PULL)}</span> Convenes</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default function PlannerTab({
  state,
  dispatch,
  activeBanners,
  bannerEndDate,
  toast,
  confirm,
}) {
  const [showIncomePanel, setShowIncomePanel] = useState(false);
  // Calendar notes stored in localStorage
  const [calendarNotes, setCalendarNotes] = useState(() => {
    try { const v = localStorage.getItem('ww-calendar-notes'); return v ? JSON.parse(v) : {}; } catch { return {}; }
  });
  const handleSetNote = useCallback((dateKey, note) => {
    setCalendarNotes(prev => {
      const next = { ...prev };
      if (note) next[dateKey] = note; else delete next[dateKey];
      try { localStorage.setItem('ww-calendar-notes', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
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

  // Collapsible section toggle
  const toggleSection = useCallback((key) => setCollapsed(p => ({ ...p, [key]: !p[key] })), []);

  return (
    <div role="tabpanel" id="tabpanel-planner" aria-labelledby="tab-planner" tabIndex="0">
    <TabErrorBoundary tabName="Planner">
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="planner" />

      {/* ── 1. Calendar ────────────────────────────────────────────────────── */}
      <AstriteCalendar dailyIncome={dailyIncome} bannerEndDate={bannerEndDate} planData={planData} activeBanners={activeBanners} eventStatus={state.eventStatus} calendarNotes={calendarNotes} onSetNote={handleSetNote} />

      {/* ── 2. Daily Income ────────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('daily')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('daily'); } }} aria-expanded={!collapsed.daily}>
          <CardHeader action={<>
            <span className="text-yellow-400 kuro-number text-xs font-bold mr-2">{dailyIncome}/day</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.daily ? '' : 'rotate-180'}`} />
          </>}>Daily Income</CardHeader>
        </div>
        {!collapsed.daily && (
          <CardBody className="space-y-3">
            <div>
              <label className="kuro-label" title="Includes Commissions, Dailies, etc.">Daily Astrite</label>
              <input type="number" value={state.planner.dailyAstrite} onChange={e => dispatch({ type: 'SET_PLANNER', field: 'dailyAstrite', value: Math.max(0, Math.floor(+e.target.value || 0)) })} className="kuro-input w-full" aria-label="Daily Astrite income" />
              <div className="text-gray-500 text-[10px] mt-1">Avg. daily Astrite from commissions + dailies</div>
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 text-sm font-medium"><Calendar size={14} className="inline mr-1.5 -mt-0.5" />Daily Income</span>
                <span className="text-yellow-400 font-bold kuro-number text-base">{dailyIncome} Astrite</span>
              </div>
              <div className="text-gray-400 text-[10px] mt-1">≈ <span className="kuro-number">{(dailyIncome / ASTRITE_PER_PULL).toFixed(2)}</span> Convenes/day • <span className="kuro-number">{Math.floor(dailyIncome * 30 / ASTRITE_PER_PULL)}</span> Convenes/month</div>
            </div>
          </CardBody>
        )}
      </Card>

      {/* ── 3. Purchases ───────────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setShowIncomePanel(!showIncomePanel)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowIncomePanel(!showIncomePanel); } }} aria-expanded={showIncomePanel}>
          <CardHeader action={<>
            {state.planner.addedIncome.length > 0 && <span className="text-emerald-400 text-[10px] mr-2">{state.planner.addedIncome.length} added</span>}
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showIncomePanel ? 'rotate-180' : ''}`} />
          </>}>Purchases</CardHeader>
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
                    <div className="text-gray-300 text-[10px]">{SUBSCRIPTIONS.lunite.daily} Astrite/day × {SUBSCRIPTIONS.lunite.duration}d + 300 Lunite</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 text-xs">${SUBSCRIPTIONS.lunite.price}/mo</span>
                  {state.planner.luniteActive && <div className="text-emerald-400 text-[10px]">+90/day</div>}
                </div>
              </div>
            </button>
            <button onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: SUBSCRIPTIONS.weekly.astrite, lunite: SUBSCRIPTIONS.weekly.lunite || 0, radiant: 0, lustrous: 0, label: SUBSCRIPTIONS.weekly.name, price: SUBSCRIPTIONS.weekly.price } }); toast?.addToast?.(`Added ${SUBSCRIPTIONS.weekly.name}`, 'success'); }} className="kuro-btn w-full text-left">
              <div className="flex items-center justify-between w-full">
                <div><div className="text-gray-200 text-xs font-medium">{SUBSCRIPTIONS.weekly.name}</div><div className="text-gray-300 text-[10px]">{SUBSCRIPTIONS.weekly.desc}</div></div>
                <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">${SUBSCRIPTIONS.weekly.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
              </div>
            </button>
            {Object.entries(SUBSCRIPTIONS).filter(([k]) => k === 'bpInsider' || k === 'bpConnoisseur').map(([k, s]) => (
              <button key={k} onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: s.astrite || 0, lunite: s.lunite || 0, radiant: s.radiant || 0, lustrous: s.lustrous || 0, label: s.name, price: s.price } }); toast?.addToast?.(`Added ${s.name}`, 'success'); }} className="kuro-btn w-full text-left">
                <div className="flex items-center justify-between w-full">
                  <div><div className="text-gray-200 text-xs font-medium">{s.name}</div><div className="text-gray-300 text-[10px]">{s.desc}</div></div>
                  <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                </div>
              </button>
            ))}
            <div className="kuro-label mt-3">Direct Top-Ups</div>
            {Object.entries(SUBSCRIPTIONS).filter(([k]) => k.startsWith('directTop')).map(([k, s]) => (
              <button key={k} onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: s.astrite || 0, lunite: s.lunite || 0, radiant: 0, lustrous: 0, label: s.name, price: s.price } }); toast?.addToast?.(`Added ${s.name}`, 'success'); }} className="kuro-btn w-full text-left">
                <div className="flex items-center justify-between w-full">
                  <div><div className="text-gray-200 text-xs font-medium">{s.name}</div><div className="text-gray-300 text-[10px]">{s.desc}</div></div>
                  <div className="flex items-center gap-1"><span className="text-emerald-400 text-xs">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                </div>
              </button>
            ))}
            {state.planner.addedIncome.length > 0 && (
              <>
                <div className="kuro-label mt-3">Added</div>
                {state.planner.addedIncome.map(i => (
                  <div key={i.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-xs">
                    <span className="text-gray-200">{i.label}</span>
                    <div className="flex items-center gap-2">
                      {i.astrite > 0 && <span className="text-yellow-400">+{i.astrite}</span>}
                      {i.lunite > 0 && <span className="text-cyan-400">+{i.lunite}L</span>}
                      {i.radiant > 0 && <span className="text-yellow-400">+{i.radiant}R</span>}
                      {i.lustrous > 0 && <span className="text-cyan-400">+{i.lustrous}L</span>}
                      <button onClick={async () => { if (await confirm({ title: 'Remove purchase', message: `Remove "${i.label}"?`, confirmLabel: 'Remove', destructive: true })) dispatch({ type: 'REMOVE_INCOME', id: i.id }); }} className="text-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center -my-2" aria-label={`Remove: ${i.label}`}><Minus size={12} /></button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-[var(--border-medium)] flex justify-between text-xs">
                  <span className="text-gray-400">Total Spent</span>
                  <span className="text-emerald-400 font-bold">${state.planner.addedIncome.reduce((s, i) => s + (+i.price || 0), 0).toFixed(2)}</span>
                </div>
                <button onClick={async () => { if (await confirm({ title: 'Clear all purchases', message: 'Remove all added purchases?', confirmLabel: 'Clear all', destructive: true })) dispatch({ type: 'CLEAR_ALL_INCOME' }); }} className="text-red-400 text-[10px] hover:text-red-300 transition-colors w-full text-center py-1">Clear All</button>
              </>
            )}
          </CardBody>
        )}
      </Card>

      {/* ── 4. Income Projections ──────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('proj')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('proj'); } }} aria-expanded={!collapsed.proj}>
          <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.proj ? '' : 'rotate-180'}`} />}>Income Projections</CardHeader>
        </div>
        {!collapsed.proj && (
          <CardBody>
            {dailyIncome === 0 ? (
              <div className="p-4 text-center rounded-lg" style={{ background: 'var(--bg-stat)' }}>
                <div className="text-gray-400 text-sm mb-1">No daily income set</div>
                <div className="text-gray-500 text-xs">Set your Daily Astrite income above.</div>
              </div>
            ) : (
            <div className="grid grid-cols-3 gap-2">
              {[7, 30, 90].map(days => (
                <div key={days} className={`kuro-stat p-3 text-center ${days === 30 ? 'border-yellow-500/30 kuro-stat-gold' : ''}`}>
                  <div className="text-gray-400 text-[10px] mb-1">{days === 30 ? 'Monthly' : `${days} Days`}</div>
                  <div className={`kuro-number text-yellow-400 font-extrabold ${days === 30 ? 'text-3xl' : 'text-xl'}`}>{Math.floor(dailyIncome * days / ASTRITE_PER_PULL).toLocaleString('en-US')}</div>
                  <div className="text-gray-400 text-[10px]">Convenes</div>
                  <div className="text-gray-400 text-[10px]">{(dailyIncome * days).toLocaleString('en-US')} Astrite</div>
                </div>
              ))}
            </div>
            )}
            {state.planner.luniteActive && (
              <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                <span className="text-emerald-400 text-xs">Monthly Sub: </span>
                <span className="text-emerald-400 font-bold text-xs">${SUBSCRIPTIONS.lunite.price}/mo</span>
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
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ml-1 ${collapsed.banner ? '' : 'rotate-180'}`} />
            </>}>By Banner End</CardHeader>
          </div>
          {!collapsed.banner && (
            <CardBody className="space-y-2">
              <div className="text-gray-400 text-[10px]">v{activeBanners.version} P{activeBanners.phase} — {planData.daysLeft} day{planData.daysLeft !== 1 ? 's' : ''} left</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="kuro-stat p-2 text-center">
                  <div className="text-yellow-400 kuro-number text-xl">{planData.convenesByEnd.toLocaleString('en-US')}</div>
                  <div className="text-gray-400 text-[10px]">Total Convenes</div>
                </div>
                <div className="kuro-stat p-2 text-center">
                  <div className="text-yellow-400 kuro-number text-xl">{Math.floor(planData.incomeByEnd / ASTRITE_PER_PULL).toLocaleString('en-US')}</div>
                  <div className="text-gray-400 text-[10px]">Earned</div>
                </div>
                <div className="kuro-stat p-2 text-center">
                  <div className="text-yellow-400 kuro-number text-xl">{planData.totalAstriteByEnd.toLocaleString('en-US')}</div>
                  <div className="text-gray-400 text-[10px]">{(+state.calc.lunite || 0) > 0 ? 'Total (A+L)' : 'Astrite'}</div>
                </div>
              </div>
              <div className="text-gray-400 text-[10px] text-center">{(+state.calc.astrite || 0).toLocaleString('en-US')} current{(+state.calc.lunite || 0) > 0 ? ` + ${(+state.calc.lunite || 0).toLocaleString('en-US')}L` : ''} + {planData.incomeByEnd.toLocaleString('en-US')} earned</div>
            </CardBody>
          )}
        </Card>
      )}

      {/* ── 6. Goal Progress ───────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('goal')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('goal'); } }} aria-expanded={!collapsed.goal}>
          <CardHeader action={<>
            <span className="text-gray-400 text-[10px] mr-2">{planData.goalProgress.toFixed(0)}%</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.goal ? '' : 'rotate-180'}`} />
          </>}>Goal Progress</CardHeader>
        </div>
        {!collapsed.goal && (
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
          <div className="text-[10px] text-gray-500 text-center py-1">
            <span title="How many Convenes needed for one copy (e.g. 80 at hard pity, 160 if guaranteed)" className="underline decoration-dotted cursor-help">Base Convenes</span>
            {' × '}
            <span title="Optional multiplier to plan for multiple goal sets at once" className="underline decoration-dotted cursor-help">Multiplier</span>
            {' × '}
            <span title="Number of copies of the selected banner target (from Calculator)" className="underline decoration-dotted cursor-help">Copies</span>
            {' = '}
            <span className="text-gray-400">{state.planner.goalPulls} × {state.planner.goalModifier} × {planData.goalCopies} = {planData.targetPulls}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-lg" aria-live="polite" aria-atomic="false">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Target</span>
              <span className="text-gray-100 font-bold">{planData.targetPulls} Convenes ({planData.targetAstrite.toLocaleString('en-US')} Astrite)</span>
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
              <div className="text-yellow-400 kuro-number text-xl">{planData.goalNeeded.toLocaleString('en-US')}</div>
              <div className="text-gray-400 text-[10px]">Astrite Needed</div>
            </div>
            <div className="kuro-stat p-3 text-center">
              <div className="text-yellow-400 kuro-number text-xl">{planData.goalDaysNeeded === Infinity ? '∞' : planData.goalDaysNeeded.toLocaleString('en-US')}</div>
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
          {planData.goalNeeded >= 16000 && (
            <p className="text-gray-500 text-[10px] text-center mt-1">≈ ${Math.ceil(planData.goalNeeded / 60).toLocaleString('en-US')} via top-up at best rate (~60 Astrite/$1)</p>
          )}
        </CardBody>
        )}
      </Card>

      {/* ── 7. Saved States ────────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('saved')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('saved'); } }} aria-expanded={!collapsed.saved}>
          <CardHeader action={<>
            {state.bookmarks.length > 0 && <span className="text-cyan-400 text-[10px] mr-2">{state.bookmarks.length}</span>}
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.saved ? '' : 'rotate-180'}`} />
          </>}>Saved States</CardHeader>
        </div>
        {!collapsed.saved && (
        <CardBody className="space-y-2">
          {state.bookmarks.length === 0 ? (
            <p className="kuro-empty-state text-gray-400 text-xs text-center py-4">No saved states yet — head to the Calculator and tap Save to bookmark a configuration.</p>
          ) : state.bookmarks.map(b => (
            <div key={b.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
              <div>
                <div className="text-gray-200 text-xs font-medium">{b.name}</div>
                <div className="text-gray-400 text-[10px]">{b.bannerCategory === 'featured' ? 'Featured' : 'Standard'} {b.selectedBanner === 'char' ? 'Resonator' : b.selectedBanner === 'weap' ? 'Weapon' : 'Both'} • {b.astrite || 0} Astrite{b.lustrous ? ` • ${b.lustrous} Lustrous` : ''}</div>
                <div className="text-gray-400 text-[10px]">P{b.charPity}/{b.weapPity}{b.charGuaranteed ? '(G)' : ''} • Std P{b.stdCharPity}/{b.stdWeapPity} • ×{b.charCopies}/{b.weapCopies}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => dispatch({ type: 'LOAD_BOOKMARK', id: b.id })} aria-label={`Load bookmark: ${b.name}`} className="px-3 py-1.5 text-[10px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 transition-colors min-h-[44px]">Load</button>
                <button onClick={async () => { if (await confirm({ title: 'Delete bookmark', message: `Delete bookmark "${b.name}"?`, confirmLabel: 'Delete', destructive: true })) dispatch({ type: 'DELETE_BOOKMARK', id: b.id }); }} aria-label={`Delete bookmark: ${b.name}`} className="px-2.5 py-1.5 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 transition-colors min-h-[44px]">×</button>
              </div>
            </div>
          ))}
        </CardBody>
        )}
      </Card>
    </div>
    </TabErrorBoundary>
    </div>
  );
}
