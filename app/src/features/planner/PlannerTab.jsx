// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — PlannerTab (extracted from App.jsx)
// Resource income planning and goal tracking
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, GanttChart, Minus, Plus, X } from 'lucide-react';
import { ASTRITE_PER_PULL, LUNITE_DAILY_ASTRITE, HARD_PITY, SUBSCRIPTIONS } from '../../data/constants.js';
import { EVENTS, BANNER_HISTORY, PIONEER_PODCAST_HISTORY, VERSION_DATES } from '../../data/banners.js';
import { generateUniqueId } from '../../utils/helpers.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/Backgrounds.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { CountdownTimer } from '../../shared/components/CountdownTimer.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';


// ══════════════════════════════════════════════════════════════════════════════
// ASTRITE CALENDAR v9 — Two views: Page Calendar + Chronology
// ══════════════════════════════════════════════════════════════════════════════

// 9 colors — one per meaning.
const EVENT_COLORS = {
  weeklyBoss:        '#60a5fa',  // marine (rarity-3star blue)
  endstateMatrix:    '#ec4899',  // fuchsia (featured weapon pink)
  towerOfAdversity:  '#ef4444',  // red-500 (better contrast at small sizes)
  whimperingWastes:  '#06b6d4',  // cyan
  tacticalHologram:  '#a3e635',  // lime
  pioneerPodcast:    '#fb923c',  // pumpkin (pity ring orange)
  illusiveRealm:     '#c4b5fd',  // lavender
};
const BANNER_COLOR = '#edaf18';  // gold

// Get the earliest date an event type existed (from introducedVersion)
const getIntroducedDate = (ev) => {
  if (!ev.introducedVersion) return null;
  const vd = VERSION_DATES.find(v => v.version === ev.introducedVersion);
  return vd ? new Date(vd.start) : null;
};

// For 28-day events: find the cycle that contains a given date
const get28DayCycle = (ev, date) => {
  if (ev.resetType !== '28 days' || !ev.currentEnd) return null;
  const introduced = getIntroducedDate(ev);
  if (introduced && date < introduced) return null;
  const baseEnd = new Date(ev.currentEnd);
  const cycleMs = 28 * 86400000;
  const diff = baseEnd.getTime() - date.getTime();
  const cyclesAway = Math.floor(diff / cycleMs);
  const cEnd = new Date(baseEnd.getTime() - cyclesAway * cycleMs);
  const cStart = new Date(cEnd.getTime() - cycleMs);
  if (date >= cStart && date <= cEnd) return { start: cStart, end: cEnd };
  return null;
};

const getActiveEvents = (date) => {
  const result = [];
  // Weekly events — only show after their introduction version
  for (const [key, ev] of Object.entries(EVENTS)) {
    if (!ev.weeklyReset || !ev.rewards) continue;
    const color = EVENT_COLORS[key];
    if (!color) continue;
    const introduced = getIntroducedDate(ev);
    if (introduced && date < introduced) continue;
    const a = parseInt(ev.rewards, 10) || 0;
    result.push({ key, name: ev.name, astrite: a, color });
  }
  // 28-day cycling events
  for (const [key, ev] of Object.entries(EVENTS)) {
    if (ev.dailyReset || ev.weeklyReset || !ev.currentEnd) continue;
    if (ev.permanent) continue; // Skip permanent content
    const color = EVENT_COLORS[key];
    if (!color) continue;
    const a = parseInt(ev.rewards, 10) || 0;
    if (ev.resetType === '28 days') {
      if (get28DayCycle(ev, date)) {
        result.push({ key, name: ev.name, astrite: a, color });
      }
    } else if (ev.currentStart) {
      // Events with explicit start/end (Endstate Matrix, etc.)
      if (date >= new Date(ev.currentStart) && date <= new Date(ev.currentEnd)) {
        result.push({ key, name: ev.name, astrite: a, color });
      }
    } else if (ev.resetType === 'Version update') {
      // Version-scoped events: use VERSION_DATES to find the right version
      const vd = VERSION_DATES.find(v => date >= new Date(v.start) && date <= new Date(v.end));
      if (vd) result.push({ key, name: ev.name, astrite: a, color });
    }
  }
  // Pioneer Podcast — check full history
  for (const pp of PIONEER_PODCAST_HISTORY) {
    if (date >= new Date(pp.startDate) && date <= new Date(pp.endDate)) {
      const color = EVENT_COLORS.pioneerPodcast;
      if (color) result.push({ key: `pp-${pp.version}`, name: `Pioneer Podcast v${pp.version}`, astrite: pp.rewards, color });
      break;
    }
  }
  return result;
};

function AstriteCalendar({ dailyIncome, bannerEndDate, planData, activeBanners, eventStatus, calendarNotes, onSetNote }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [noteInput, setNoteInput] = useState('');

  const cal = useMemo(() => {
    const now = new Date();
    const view = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = view.getFullYear(), month = view.getMonth();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const bannerEnd = new Date(bannerEndDate); bannerEnd.setHours(23, 59, 59, 999);
    const dailyDone = eventStatus?.dailyReset === 'done';

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d); date.setHours(0, 0, 0, 0);
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const isBanner = date <= bannerEnd && date >= today;
      const daysFwd = Math.max(0, Math.floor((date - today) / 86400000));
      const earned = isPast ? 0 : dailyIncome * (daysFwd + (isToday ? 0 : 1));
      // U6-07: Show events on all days (not just future) for consistency with chronology
      const events = getActiveEvents(date);
      const eventAstrite = events.reduce((s, e) => s + e.astrite, 0);
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDailyDone = isToday && dailyDone;
      days.push({
        day: d, date, dateKey, isPast, isToday, isBanner, earned, events, eventAstrite,
        note: calendarNotes?.[dateKey] || '', isDailyDone,
      });
    }
    return { year, month, firstDay, daysInMonth, days, monthName: view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }, [monthOffset, dailyIncome, bannerEndDate, calendarNotes, eventStatus]);

  const sel = selectedDay ? cal.days.find(d => d.dateKey === selectedDay) : null;
  // U6-02: Allow tapping past days (read-only — can view notes/events but not add new notes)
  const handleTap = useCallback((d) => { setSelectedDay(prev => prev === d.dateKey ? null : d.dateKey); setNoteInput(d.note); }, []);
  // U6-06: Arrow key navigation for calendar grid
  const gridRef = useRef(null);
  const handleGridKeyDown = useCallback((e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const grid = gridRef.current;
    if (!grid) return;
    const buttons = Array.from(grid.querySelectorAll('button[data-day]'));
    const idx = buttons.indexOf(document.activeElement);
    if (idx === -1) { buttons[0]?.focus(); return; }
    let next = idx;
    if (e.key === 'ArrowRight') next = Math.min(idx + 1, buttons.length - 1);
    else if (e.key === 'ArrowLeft') next = Math.max(idx - 1, 0);
    else if (e.key === 'ArrowDown') next = Math.min(idx + 7, buttons.length - 1);
    else if (e.key === 'ArrowUp') next = Math.max(idx - 7, 0);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    buttons[next]?.focus();
  }, []);
  const saveNote = useCallback(() => { if (!selectedDay || !onSetNote || !noteInput.trim()) return; onSetNote(selectedDay, noteInput.trim()); setNoteInput(''); }, [selectedDay, noteInput, onSetNote]);
  const deleteNote = useCallback(() => { if (!selectedDay || !onSetNote) return; onSetNote(selectedDay, ''); setNoteInput(''); }, [selectedDay, onSetNote]);

  // Swipe gesture for month navigation
  const touchRef = useRef(null);
  const handleTouchStart = useCallback((e) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const handleTouchEnd = useCallback((e) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    touchRef.current = null;
    // Only trigger if horizontal swipe > 60px and more horizontal than vertical
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setMonthOffset(p => dx > 0 ? p - 1 : p + 1);
    }
  }, []);

  const rows = useMemo(() => {
    const cells = [...Array(cal.firstDay).fill(null), ...cal.days];
    const r = [];
    for (let i = 0; i < Math.ceil(cells.length / 7); i++) r.push(cells.slice(i * 7, i * 7 + 7));
    return r;
  }, [cal]);

  const selEvents = useMemo(() => {
    if (!sel) return [];
    const unique = {};
    for (const ev of sel.events) { if (!unique[ev.key]) unique[ev.key] = { ...ev }; }
    return Object.values(unique);
  }, [sel]);

  // ── Chronology bars ──────────────────────────────────────────────────────
  const chronoBars = useMemo(() => {
    const monthStart = new Date(cal.year, cal.month, 1);
    const monthEnd = new Date(cal.year, cal.month + 1, 0); monthEnd.setHours(23, 59, 59, 999);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const bars = [];

    // Banner bar — use actual start date from BANNER_HISTORY
    const bannerEnd = new Date(bannerEndDate);
    const currentBannerHistory = BANNER_HISTORY.find(b => b.version === activeBanners?.version && b.phase === activeBanners?.phase);
    const bannerStart = currentBannerHistory ? new Date(currentBannerHistory.startDate) : monthStart;
    if (bannerEnd >= monthStart && bannerStart <= monthEnd) {
      const bStart = Math.max(0, Math.floor((bannerStart - monthStart) / 86400000));
      const bEnd = Math.min(cal.daysInMonth - 1, Math.floor((bannerEnd - monthStart) / 86400000));
      if (bEnd >= bStart) {
        const daysLeft = Math.max(0, Math.ceil((bannerEnd - today) / 86400000));
        const endLabel = bannerEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const startLabel = bannerStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        bars.push({ key: 'banner', label: `v${activeBanners?.version || '?'} P${activeBanners?.phase || '?'}`, color: BANNER_COLOR, start: bStart, end: bEnd, astrite: 0, daysLeft, endLabel, startLabel });
      }
    }

    // Past banner phases from BANNER_HISTORY (limit to 3 most recent per month to avoid flooding)
    let pastBannerCount = 0;
    for (const bh of BANNER_HISTORY) {
      if (pastBannerCount >= 3) break;
      const bhStart = new Date(bh.startDate);
      const bhEnd = new Date(bh.endDate);
      if (bhEnd < monthStart || bhStart > monthEnd) continue;
      if (activeBanners && bh.version === activeBanners.version && bh.phase === activeBanners.phase) continue;
      const pStart = Math.max(0, Math.floor((bhStart - monthStart) / 86400000));
      const pEnd = Math.min(cal.daysInMonth - 1, Math.floor((bhEnd - monthStart) / 86400000));
      if (pEnd >= pStart) {
        const ended = bhEnd < today;
        const label = `v${bh.version} P${bh.phase}`;
        const endLabel = bhEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const charNames = bh.characters?.slice(0, 2).join(', ') || '';
        bars.push({ key: bh.id, label: `${label}${charNames ? ` — ${charNames}` : ''}`, color: BANNER_COLOR, start: pStart, end: pEnd, astrite: 0, ended, endLabel, pastBanner: true });
        pastBannerCount++;
      }
    }

    // Helper: add a bar if it overlaps this month
    const addBar = (key, label, color, cStart, cEnd, astrite, extra = {}) => {
      if (cEnd < monthStart || cStart > monthEnd) return;
      const ended = cEnd < today;
      const eStart = Math.max(0, Math.floor((cStart - monthStart) / 86400000));
      const eEnd = Math.min(cal.daysInMonth - 1, Math.floor((cEnd - monthStart) / 86400000));
      if (eEnd >= eStart) {
        const endLabel = cEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const startLabel = cStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const daysLeft = ended ? undefined : Math.max(0, Math.ceil((cEnd - today) / 86400000));
        bars.push({ key, label, color, start: eStart, end: eEnd, astrite, ended, endLabel, startLabel, daysLeft, ...extra });
      }
    };

    // Weekly events — segmented bars (only after their introduction)
    const todayIdx = Math.floor((today - monthStart) / 86400000);
    for (const [key, ev] of Object.entries(EVENTS)) {
      if (!ev.weeklyReset) continue;
      const color = EVENT_COLORS[key];
      if (!color) continue;
      const introduced = getIntroducedDate(ev);
      if (introduced && monthEnd < introduced) continue;
      const astrite = parseInt(ev.rewards, 10) || 0;
      const mondays = [];
      for (let d = 1; d <= cal.daysInMonth; d++) {
        const date = new Date(cal.year, cal.month, d);
        if (date.getDay() === 1) mondays.push(d - 1);
      }
      const segments = [];
      if (mondays.length > 0 && mondays[0] > 0) {
        const partialEnd = mondays[0] - 1;
        segments.push({ start: 0, end: partialEnd, isCurrent: todayIdx >= 0 && todayIdx <= partialEnd });
      }
      for (let i = 0; i < mondays.length; i++) {
        const segStart = mondays[i];
        const segEnd = i + 1 < mondays.length ? mondays[i + 1] - 1 : cal.daysInMonth - 1;
        segments.push({ start: segStart, end: segEnd, isCurrent: todayIdx >= segStart && todayIdx <= segEnd });
      }
      if (mondays.length === 0) segments.push({ start: 0, end: cal.daysInMonth - 1 });
      bars.push({ key, label: ev.name, color, astrite, weekly: true, segments });
    }

    // 28-day cycling events (ToA, Whimpering Wastes) — compute all cycles
    for (const [key, ev] of Object.entries(EVENTS)) {
      if (ev.resetType !== '28 days' || !ev.currentEnd) continue;
      const color = EVENT_COLORS[key];
      if (!color) continue;
      const astrite = parseInt(ev.rewards, 10) || 0;
      const introduced = getIntroducedDate(ev);
      const baseEnd = new Date(ev.currentEnd);
      const cycleMs = 28 * 86400000;
      for (let c = -24; c <= 1; c++) {
        const cEnd = new Date(baseEnd.getTime() + c * cycleMs);
        const cStart = new Date(cEnd.getTime() - cycleMs);
        if (introduced && cStart < introduced) continue;
        addBar(c === 0 ? key : `${key}-c${c}`, ev.name, color, cStart, cEnd, astrite);
      }
    }

    // Endstate Matrix and other events with explicit currentStart/currentEnd
    for (const [key, ev] of Object.entries(EVENTS)) {
      if (ev.dailyReset || ev.weeklyReset || ev.permanent || ev.resetType === '28 days') continue;
      if (!ev.currentEnd || !ev.currentStart) continue;
      const color = EVENT_COLORS[key];
      if (!color) continue;
      const astrite = parseInt(ev.rewards, 10) || 0;
      addBar(key, ev.name, color, new Date(ev.currentStart), new Date(ev.currentEnd), astrite);
    }

    // Pioneer Podcast — full history, one bar per version
    for (const pp of PIONEER_PODCAST_HISTORY) {
      const color = EVENT_COLORS.pioneerPodcast;
      if (!color) continue;
      addBar(`pp-${pp.version}`, `Pioneer Podcast v${pp.version}`, color, new Date(pp.startDate), new Date(pp.endDate), pp.rewards);
    }

    // Version-scoped events without explicit start (Pioneer Podcast already handled above)
    for (const [key, ev] of Object.entries(EVENTS)) {
      if (ev.dailyReset || ev.weeklyReset || ev.permanent || ev.resetType === '28 days') continue;
      if (!ev.currentEnd || ev.currentStart) continue; // skip if has explicit start (already handled)
      if (key === 'pioneerPodcast') continue; // handled via PIONEER_PODCAST_HISTORY
      const color = EVENT_COLORS[key];
      if (!color) continue;
      const astrite = parseInt(ev.rewards, 10) || 0;
      // Show for current version only
      const versionStart = BANNER_HISTORY.length > 0 ? new Date(BANNER_HISTORY[0].startDate) : monthStart;
      addBar(key, ev.name, color, versionStart, new Date(ev.currentEnd), astrite);
    }
    return bars;
  }, [cal, bannerEndDate, activeBanners]);

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
    <Card>
      <CardHeader><Calendar size={14} className="inline mr-1.5 -mt-0.5 text-yellow-400" />Astrite Calendar</CardHeader>
      <CardBody className="space-y-3">

        {/* ── VIEW 1: Page Calendar ─────────────────────────────────────────── */}

        {/* Month nav */}
        <div className="flex items-center justify-between">
          {/* U6-04: Don't clear selectedDay on month nav — panel hides naturally, note input preserved */}
          <button onClick={() => setMonthOffset(p => p - 1)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-white transition-colors" aria-label="Previous month"><ChevronLeft size={16} /></button>
          {/* U6-03: Show "Today" pill when viewing a non-current month */}
          <button onClick={() => { setMonthOffset(0); }} className="text-gray-100 text-sm font-bold tracking-wide hover:text-yellow-400 transition-colors" style={{ fontFamily: 'var(--font-display)' }} title={monthOffset !== 0 ? 'Jump to current month' : undefined}>
            {cal.monthName}
            {monthOffset !== 0 && <span style={{ fontSize: '9px', marginLeft: '6px', padding: '1px 6px', borderRadius: '9999px', background: 'rgba(237,175,24,0.15)', border: '1px solid rgba(237,175,24,0.3)', color: '#edaf18', verticalAlign: 'middle' }}>Today</span>}
          </button>
          <button onClick={() => setMonthOffset(p => p + 1)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-white transition-colors" aria-label="Next month"><ChevronRight size={16} /></button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1">
          {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold tracking-wider" style={{ color: 'var(--text-disabled)' }}>{d}</div>
          ))}
        </div>

        {/* U6-06: Day grid with arrow key navigation */}
        <div className="space-y-1" ref={gridRef} onKeyDown={handleGridKeyDown} role="grid" aria-label="Calendar days">
          {rows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7 gap-1" role="row">
              {row.map((d, ci) => {
                if (!d) return <div key={`e${ci}`} role="gridcell" style={{ aspectRatio: '1', borderRadius: 'var(--radius-sm)', background: 'var(--bg-stat)', opacity: 0.3 }} />;
                const isSel = selectedDay === d.dateKey;
                const isGreen = d.isDailyDone;
                return (
                  <button key={d.day} type="button" role="gridcell" data-day={d.day} onClick={() => handleTap(d)}
                    className="active:scale-95 transition-transform"
                    aria-label={`${d.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}${d.isToday ? ' (today)' : ''}${d.note ? ' (has note)' : ''}`}
                    style={{
                      aspectRatio: '1', borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative',
                      background: isGreen ? 'linear-gradient(to top, rgba(34,197,94,0.24), rgba(34,197,94,0.08))' : 'var(--bg-stat)',
                      border: d.isToday ? '2px solid #edaf18' : isSel ? '2px solid rgba(255,255,255,0.6)' : isGreen ? '1px solid rgba(34,197,94,0.4)' : d.isPast ? '1px solid transparent' : '1px solid var(--border-subtle)',
                      boxShadow: isSel ? (d.isToday ? '0 0 10px rgba(237,175,24,0.3)' : '0 0 8px rgba(255,255,255,0.15)') : isGreen ? 'inset 0 0 8px rgba(34,197,94,0.12)' : 'none',
                      transition: 'all var(--transition-fast)',
                    }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span style={{
                        fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-data)',
                        color: d.isToday ? '#edaf18' : d.isPast ? 'var(--text-disabled)' : isGreen ? '#22c55e' : isSel ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)',
                      }}>{d.day}</span>
                      {d.note && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#edaf18', marginTop: '2px', opacity: d.isPast ? 0.5 : 1 }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Calendar legend — only calendar-specific items */}
        {/* V5-05: Standardized 8px indicators */}
        <div className="flex items-center gap-3 justify-center" style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>
          <span className="flex items-center gap-1"><span style={{ width: '8px', height: '8px', borderRadius: '2px', border: '2px solid #edaf18', display: 'inline-block' }} />Today</span>
          <span className="flex items-center gap-1"><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'linear-gradient(to top, rgba(34,197,94,0.24), rgba(34,197,94,0.08))', border: '1px solid rgba(34,197,94,0.4)', display: 'inline-block' }} />Dailies</span>
          <span className="flex items-center gap-1"><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#edaf18', display: 'inline-block' }} />Note</span>
        </div>

        {/* Detail panel */}
        {sel && (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', animation: 'slideUp 0.2s ease-out' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-sm)' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-heading)' }}>
                  {sel.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                {sel.isDailyDone && <span style={{ fontSize: '10px', color: '#22c55e', marginLeft: '8px' }}>&#x2713; Dailies</span>}
              </div>
              <button onClick={() => setSelectedDay(null)} className="flex items-center justify-center text-gray-400 hover:text-white transition-colors" style={{ width: '44px', height: '44px' }} aria-label="Close"><X size={14} /></button>
            </div>

            {(dailyIncome > 0 || sel.eventAstrite > 0) && !sel.isPast && (
              <div className="flex gap-4" style={{ fontSize: '10px', marginBottom: 'var(--space-sm)' }}>
                {dailyIncome > 0 && <span><span className="text-yellow-400 kuro-number font-bold">{dailyIncome.toLocaleString('en-US')}</span> <span style={{ color: 'var(--text-muted)' }}>Astrite/day</span></span>}
                {sel.eventAstrite > 0 && <span><span className="kuro-number font-bold" style={{ color: selEvents[0]?.color || '#a855f7' }}>+{sel.eventAstrite}</span> <span style={{ color: 'var(--text-muted)' }}>from {selEvents.length} event{selEvents.length !== 1 ? 's' : ''}</span></span>}
              </div>
            )}

            {selEvents.length > 0 && (
              <div className="flex flex-wrap gap-1" style={{ marginBottom: 'var(--space-sm)' }}>
                {selEvents.map(ev => (
                  <span key={ev.key} style={{ fontSize: '10px', padding: '4px 8px', borderRadius: 'var(--radius-full)', color: ev.color, border: `1px solid ${ev.color}40`, background: `${ev.color}1a` }}>
                    {ev.name}{ev.astrite > 0 ? ` +${ev.astrite} Astrite` : ''}
                  </span>
                ))}
              </div>
            )}

            {/* U6-10: Empty state when past day has no events and no note */}
            {sel.isPast && selEvents.length === 0 && !sel.note && (
              <div style={{ fontSize: '10px', color: 'var(--text-disabled)', textAlign: 'center', padding: 'var(--space-sm) 0' }}>No events on this day</div>
            )}

            {/* U6-02: Hide note input for past days (read-only view) */}
            {!sel.isPast && (
              <div>
                <div className="flex gap-2">
                  <input type="text" value={noteInput} onChange={e => setNoteInput(e.target.value.slice(0, 100))} onKeyDown={e => { if (e.key === 'Enter') saveNote(); }} placeholder="Add a note..." className="kuro-input kuro-input-sm flex-1" maxLength={100} aria-label="Calendar day note" />
                  <button onClick={saveNote} disabled={!noteInput.trim()} className={`kuro-btn ${noteInput.trim() ? 'active-gold' : ''}`} style={{ fontSize: '10px', padding: '4px 12px', opacity: noteInput.trim() ? 1 : 0.4 }}>{sel.note ? 'Update' : 'Save'}</button>
                </div>
                {noteInput.length > 70 && <div style={{ fontSize: '9px', color: noteInput.length >= 100 ? '#ef4444' : 'var(--text-disabled)', textAlign: 'right', marginTop: '2px' }}>{noteInput.length}/100</div>}
              </div>
            )}

            {sel.note && (
              <div className="flex items-center gap-2" style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', background: 'var(--bg-stat)' }}>
                <span className="flex-1" style={{ fontSize: '12px', lineHeight: '1.4', color: 'var(--text-body)' }}>{sel.note}</span>
                {/* U6-08: Full read-only on past days — no delete button */}
                {!sel.isPast && <button onClick={deleteNote} className="flex-shrink-0 flex items-center justify-center bg-red-500/80 text-white opacity-60 hover:opacity-100 transition-opacity" style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-sm)' }} aria-label="Delete note"><X size={12} /></button>}
              </div>
            )}
          </div>
        )}

        {dailyIncome > 0 && (
          <div className="text-center" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            <span className="text-yellow-400 kuro-number font-bold">{dailyIncome.toLocaleString('en-US')}</span> Astrite/day
            <span style={{ margin: '0 8px' }}>&middot;</span>
            <span className="text-yellow-400 kuro-number font-bold">{Math.floor(dailyIncome / ASTRITE_PER_PULL * cal.daysInMonth)}</span> Convenes/month
          </div>
        )}

        {/* ── VIEW 2: Chronology ────────────────────────────────────────────── */}

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-heading)', marginBottom: 'var(--space-sm)' }}><GanttChart size={12} className="inline mr-1.5 -mt-0.5 text-yellow-400" />Chronology</div>

          {/* V5-02: Day scale header — show 1st, every 5th, and last for readability */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cal.daysInMonth}, 1fr)`, marginBottom: '4px' }}>
            {Array.from({ length: cal.daysInMonth }, (_, i) => {
              const day = i + 1;
              const show = day === 1 || day % 5 === 0 || day === cal.daysInMonth;
              return <span key={i} style={{ fontSize: '10px', color: 'var(--text-disabled)', fontFamily: 'var(--font-data)', textAlign: 'center' }}>{show ? day : ''}</span>;
            })}
          </div>

          {/* Chronology bars */}
          <div style={{ position: 'relative' }}>
            {/* V5-01: Today marker line */}
            {(() => {
              const today = new Date(); today.setHours(0, 0, 0, 0);
              const monthStart = new Date(cal.year, cal.month, 1);
              const todayIdx = Math.floor((today - monthStart) / 86400000);
              if (todayIdx >= 0 && todayIdx < cal.daysInMonth) {
                const leftPct = ((todayIdx + 0.5) / cal.daysInMonth) * 100;
                return <div style={{ position: 'absolute', left: `${leftPct}%`, top: 0, bottom: 0, width: '2px', background: '#edaf18', opacity: 0.5, zIndex: 2, borderRadius: '1px', pointerEvents: 'none' }} aria-hidden="true" />;
              }
              return null;
            })()}
            {chronoBars.map((bar) => {
              const tooltipText = `${bar.label}${bar.astrite > 0 ? ` — +${bar.astrite} Astrite` : ''}${bar.startLabel && bar.endLabel ? ` — ${bar.startLabel} → ${bar.endLabel}` : bar.endLabel ? ` — ends ${bar.endLabel}` : ''}${bar.daysLeft != null ? ` (${bar.daysLeft}d left)` : ''}${bar.weekly ? ' (resets weekly Mon)' : ''}${bar.ended ? ' (ended)' : ''}`;

              // Weekly events: render segmented bars showing Mon-Sun reset boundaries
              if (bar.weekly && bar.segments) {
                return (
                  <div key={bar.key} title={tooltipText} style={{ position: 'relative', height: '22px', marginBottom: '4px' }}>
                    {bar.segments.map((seg, si) => {
                      const segLeft = (seg.start / cal.daysInMonth) * 100;
                      const segWidth = ((seg.end - seg.start + 1) / cal.daysInMonth) * 100;
                      return (
                        <div key={si} style={{
                          position: 'absolute', left: `${segLeft}%`, width: `calc(${segWidth}% - 2px)`,
                          height: '100%', borderRadius: 'var(--radius-sm)',
                          background: seg.isCurrent ? `linear-gradient(to right, ${bar.color}45, ${bar.color}28)` : `linear-gradient(to right, ${bar.color}30, ${bar.color}18)`,
                          border: `1px solid ${bar.color}${seg.isCurrent ? '90' : '60'}`,
                          boxShadow: seg.isCurrent ? `0 0 6px ${bar.color}30` : 'none',
                          display: 'flex', alignItems: 'center', padding: '0 4px',
                          overflow: 'hidden', minWidth: '0',
                        }}>
                          <span style={{ fontSize: '10px', color: bar.color, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                            {bar.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Non-weekly events: single bar with end date label
              const leftPct = (bar.start / cal.daysInMonth) * 100;
              const widthPct = ((bar.end - bar.start + 1) / cal.daysInMonth) * 100;
              return (
                <div key={bar.key} title={tooltipText} style={{ position: 'relative', height: '22px', marginBottom: '4px' }}>
                  <div style={{
                    position: 'absolute', left: `${leftPct}%`, width: `${widthPct}%`,
                    height: '100%', borderRadius: 'var(--radius-sm)',
                    background: bar.ended ? `${bar.color}15` : `linear-gradient(to right, ${bar.color}30, ${bar.color}18)`,
                    border: `1px ${bar.pastBanner ? 'dashed' : 'solid'} ${bar.color}${bar.ended ? '40' : '60'}`,
                    boxShadow: bar.ended ? 'none' : `0 0 8px ${bar.color}20`,
                    display: 'flex', alignItems: 'center', padding: '0 6px',
                    overflow: 'hidden', minWidth: '0',
                    opacity: bar.pastBanner ? 0.45 : bar.ended ? 0.6 : 1,
                  }}>
                    <span style={{ fontSize: '10px', color: bar.color, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{bar.label}</span>
                    {bar.ended && <span style={{ fontSize: '9px', color: bar.color, fontFamily: 'var(--font-data)', opacity: 0.6, marginLeft: '4px', flexShrink: 0 }}>{bar.endLabel ? `ended ${bar.endLabel}` : 'ended'}</span>}
                    {bar.astrite > 0 && !bar.ended && <span style={{ fontSize: '10px', color: bar.color, fontFamily: 'var(--font-data)', opacity: 0.7, marginLeft: '4px', flexShrink: 0 }}>+{bar.astrite}</span>}
                    {bar.endLabel && !bar.ended && <span style={{ fontSize: '9px', color: bar.color, fontFamily: 'var(--font-data)', opacity: 0.5, marginLeft: '4px', flexShrink: 0 }}>{bar.startLabel ? `${bar.startLabel}→` : '→'}{bar.endLabel}</span>}
                    {bar.daysLeft != null && <span style={{ fontSize: '10px', color: bar.color, fontFamily: 'var(--font-data)', opacity: 0.5, marginLeft: '4px', flexShrink: 0 }}>{bar.daysLeft}d</span>}
                  </div>
                </div>
              );
            })}
            {chronoBars.length === 0 && (
              <div className="text-center py-2" style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>No active events this month</div>
            )}
          </div>

          {/* Chronology legend */}
          <div className="flex items-center gap-2 justify-center flex-wrap" style={{ fontSize: '10px', color: 'var(--text-disabled)', marginTop: 'var(--space-sm)' }}>
            <span className="flex items-center gap-1"><span style={{ width: '16px', height: '4px', borderRadius: '2px', background: BANNER_COLOR, display: 'inline-block' }} />Banner</span>
            {Object.entries(EVENT_COLORS).map(([key, color]) => (
              <span key={key} className="flex items-center gap-1">
                {EVENTS[key]?.weeklyReset
                  ? <span style={{ display: 'inline-flex', gap: '1px' }}><span style={{ width: '5px', height: '4px', borderRadius: '1px', background: color }} /><span style={{ width: '5px', height: '4px', borderRadius: '1px', background: color }} /><span style={{ width: '5px', height: '4px', borderRadius: '1px', background: color }} /></span>
                  : <span style={{ width: '16px', height: '4px', borderRadius: '2px', background: color, display: 'inline-block' }} />
                }
                {EVENTS[key]?.name || key}
              </span>
            ))}
          </div>
        </div>

      </CardBody>
    </Card>
    </div>
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
            <span className="text-yellow-400 kuro-number text-xs font-bold">{dailyIncome}/day</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.daily ? '' : 'rotate-180'}`} />
          </>}><Calendar size={14} className="inline mr-1.5 -mt-0.5 text-yellow-400" />Daily Income</CardHeader>
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
                <span className="text-yellow-400 text-sm font-medium">Total</span>
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
            {state.planner.addedIncome.length > 0 && <span className="text-emerald-400 text-[10px]">{state.planner.addedIncome.length} added</span>}
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
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.banner ? '' : 'rotate-180'}`} />
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
            <span className="text-gray-400 text-[10px]">{planData.goalProgress.toFixed(0)}%</span>
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
            {state.bookmarks.length > 0 && <span className="text-cyan-400 text-[10px]">{state.bookmarks.length}</span>}
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
