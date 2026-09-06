// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — AstriteCalendar (extracted from PlannerTab.jsx)
// Monthly calendar + chronology view: daily Astrite projection, event/banner
// timeline bars, and per-day notes.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, GanttChart, X, Bell, BellOff } from 'lucide-react';
import { ASTRITE_PER_PULL } from '../../data/constants.js';
import { getLocalizedEvents, BANNER_HISTORY, PIONEER_PODCAST_HISTORY, DOUBLED_PAWNS_MATRIX_HISTORY, TACTICAL_HOLOGRAM_HISTORY, VERSION_DATES } from '../../data/banners.js';
import { t, formatNumber, formatDate, getLocale } from '../../utils/i18n.js';
import { isNativePlatform } from '../../utils/pushNotifications.js';
import { scheduleEventReminder, cancelEventReminder, isEventReminderScheduled } from '../../utils/localNotifications.js';

const EVENTS = getLocalizedEvents(getLocale());

// 9 colors — one per meaning. Raw hex required because values are used in JS string
// interpolation (e.g. `${color}40` for alpha) where CSS var() would be invalid.
// Canonical tokens are defined in kuro.css (--event-*) for pure-CSS contexts.
const EVENT_COLORS = {
  weeklyBoss:           '#60a5fa',  // marine (rarity-3star blue)
  endstateMatrix:       '#ec4899',  // fuchsia (featured weapon pink)
  towerOfAdversity:     '#ef4444',  // red-500 (better contrast at small sizes)
  whimperingWastes:     '#06b6d4',  // cyan
  tacticalHologram:     '#a3e635',  // lime
  pioneerPodcast:       '#fb923c',  // pumpkin (pity ring orange)
  illusiveRealm:        '#c4b5fd',  // lavender
};
const BANNER_COLOR = '#edaf18';  // gold
const GAME_LAUNCH = new Date('2024-05-23'); // Wuthering Waves global launch date
GAME_LAUNCH.setHours(0, 0, 0, 0);

// Legend labels — maps legendGroup keys to i18n keys under planner.calendar.legend*
const LEGEND_LABEL_KEYS = {
  banner: 'planner.calendar.bannerLegend', weeklyBoss: 'planner.calendar.legendWeeklyBoss', illusiveRealm: 'planner.calendar.legendIllusiveRealm',
  towerOfAdversity: 'planner.calendar.legendTowerOfAdversity', whimperingWastes: 'planner.calendar.legendWhimperingWastes',
  matrix: 'planner.calendar.legendMatrix', tacticalHologram: 'planner.calendar.legendTacticalHologram', pioneerPodcast: 'planner.calendar.legendPioneerPodcast',
};
const getLegendLabel = (group) => t(LEGEND_LABEL_KEYS[group] || group);

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
  if (date < GAME_LAUNCH) return []; // No events before game launch
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
      if (color) result.push({ key: `pp-${pp.version}`, name: t('planner.calendar.pioneerPodcastVersion', { version: pp.version }), astrite: pp.rewards, color });
      break;
    }
  }
  return result;
};

function AstriteCalendar({ dailyIncome, bannerEndDate, planData, activeBanners, eventStatus, calendarNotes, onSetNote, toast }) {
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
    return { year, month, firstDay, daysInMonth, days, monthName: formatDate(view, { month: 'long', year: 'numeric' }) };
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
  const [selectedBar, setSelectedBar] = useState(null);
  // ── End-of-event reminders — on-device only (see localNotifications.js header for why
  // this is a local schedule rather than another server-broadcast push). Only offered for
  // bars with a real single end date (not weekly resets, which recur with no one "end").
  const nativeSupported = useMemo(() => isNativePlatform(), []);
  const [reminderScheduled, setReminderScheduled] = useState(false);
  useEffect(() => {
    if (!nativeSupported || !selectedBar?.endDate || selectedBar.ended) { setReminderScheduled(false); return; }
    let cancelled = false;
    isEventReminderScheduled(selectedBar.key).then(v => { if (!cancelled) setReminderScheduled(v); });
    return () => { cancelled = true; };
  }, [nativeSupported, selectedBar]);
  const toggleReminder = useCallback(async () => {
    if (!selectedBar?.endDate) return;
    if (reminderScheduled) {
      await cancelEventReminder(selectedBar.key);
      setReminderScheduled(false);
      toast?.addToast?.(t('planner.calendar.reminderCancelled', { name: selectedBar.label }), 'success');
    } else {
      const ok = await scheduleEventReminder({
        key: selectedBar.key,
        title: t('planner.calendar.reminderTitle', { name: selectedBar.label }),
        body: t('planner.calendar.reminderBody', { name: selectedBar.label }),
        at: selectedBar.endDate,
      });
      setReminderScheduled(ok);
      toast?.addToast?.(t(ok ? 'planner.calendar.reminderSet' : 'planner.calendar.reminderFailed', { name: selectedBar.label }), ok ? 'success' : 'warning');
    }
  }, [selectedBar, reminderScheduled, toast]);
  const chronoBars = useMemo(() => {
    const monthStart = new Date(cal.year, cal.month, 1);
    const monthEnd = new Date(cal.year, cal.month + 1, 0); monthEnd.setHours(23, 59, 59, 999);
    // No events before game launch
    if (monthEnd < GAME_LAUNCH) return [];
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
        const endLabel = formatDate(bannerEnd, { month: 'short', day: 'numeric' });
        const startLabel = formatDate(bannerStart, { month: 'short', day: 'numeric' });
        bars.push({ key: 'banner', label: `v${activeBanners?.version || '?'} P${activeBanners?.phase || '?'}`, color: BANNER_COLOR, start: bStart, end: bEnd, astrite: 0, daysLeft, endLabel, startLabel, endDate: bannerEnd, legendGroup: 'banner', description: t('planner.calendar.currentBannerPhase', { version: activeBanners?.version || '?', phase: activeBanners?.phase || '?' }) });
      }
    }

    // Past banner phases from BANNER_HISTORY (limit to 3 most recent per month to avoid flooding)
    let pastBannerCount = 0;
    for (const bh of BANNER_HISTORY) {
      if (pastBannerCount >= 3) break;
      const bhStart = new Date(bh.startDate);
      const bhEnd = new Date(bh.endDate);
      if (bhEnd < monthStart || bhStart > monthEnd || bhStart < GAME_LAUNCH) continue;
      if (activeBanners && bh.version === activeBanners.version && bh.phase === activeBanners.phase) continue;
      const pStart = Math.max(0, Math.floor((bhStart - monthStart) / 86400000));
      const pEnd = Math.min(cal.daysInMonth - 1, Math.floor((bhEnd - monthStart) / 86400000));
      if (pEnd >= pStart) {
        const ended = bhEnd < today;
        const label = `v${bh.version} P${bh.phase}`;
        const endLabel = formatDate(bhEnd, { month: 'short', day: 'numeric' });
        const charNames = bh.characters?.slice(0, 2).join(', ') || '';
        bars.push({ key: bh.id, label: `${label}${charNames ? ` — ${charNames}` : ''}`, color: BANNER_COLOR, start: pStart, end: pEnd, astrite: 0, ended, endLabel, pastBanner: true, legendGroup: 'banner', description: t('planner.calendar.bannerPhaseDescription', { version: bh.version, phase: bh.phase, characters: bh.characters?.join(', ') || 'N/A' }) });
        pastBannerCount++;
      }
    }

    // Helper: add a bar if it overlaps this month
    const addBar = (key, label, color, cStart, cEnd, astrite, extra = {}) => {
      if (cEnd < monthStart || cStart > monthEnd || cEnd < GAME_LAUNCH) return;
      const clampedStart = cStart < GAME_LAUNCH ? GAME_LAUNCH : cStart;
      const ended = cEnd < today;
      const eStart = Math.max(0, Math.floor((clampedStart - monthStart) / 86400000));
      const eEnd = Math.min(cal.daysInMonth - 1, Math.floor((cEnd - monthStart) / 86400000));
      if (eEnd >= eStart) {
        const endLabel = formatDate(cEnd, { month: 'short', day: 'numeric' });
        const startLabel = formatDate(clampedStart, { month: 'short', day: 'numeric' });
        const daysLeft = ended ? undefined : Math.max(0, Math.ceil((cEnd - today) / 86400000));
        bars.push({ key, label, color, start: eStart, end: eEnd, astrite, ended, endLabel, startLabel, daysLeft, endDate: cEnd, ...extra });
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
      if (monthEnd < GAME_LAUNCH) continue;
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
      bars.push({ key, label: ev.name, color, astrite, weekly: true, segments, legendGroup: key, description: t('planner.calendar.eventDescription', { name: ev.name, desc: ev.description || ev.subtitle, rewards: ev.rewards }) });
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
        addBar(c === 0 ? key : `${key}-c${c}`, ev.name, color, cStart, cEnd, astrite, { legendGroup: key, description: t('planner.calendar.eventDescriptionCycle', { name: ev.name, desc: ev.description, resetType: ev.resetType, rewards: ev.rewards }) });
      }
    }

    // Endstate Matrix and other events with explicit currentStart/currentEnd
    for (const [key, ev] of Object.entries(EVENTS)) {
      if (ev.dailyReset || ev.weeklyReset || ev.permanent || ev.resetType === '28 days') continue;
      if (!ev.currentEnd || !ev.currentStart) continue;
      const color = EVENT_COLORS[key];
      if (!color) continue;
      const astrite = parseInt(ev.rewards, 10) || 0;
      addBar(key, ev.name, color, new Date(ev.currentStart), new Date(ev.currentEnd), astrite, { legendGroup: 'matrix', description: t('planner.calendar.eventDescription', { name: ev.name, desc: ev.description, rewards: ev.rewards }) });
    }

    // Pioneer Podcast — full history, one bar per version
    for (const pp of PIONEER_PODCAST_HISTORY) {
      const color = EVENT_COLORS.pioneerPodcast;
      if (!color) continue;
      addBar(`pp-${pp.version}`, t('planner.calendar.pioneerPodcastVersion', { version: pp.version }), color, new Date(pp.startDate), new Date(pp.endDate), pp.rewards, { legendGroup: 'pioneerPodcast', description: t('planner.calendar.pioneerPodcastDescription', { version: pp.version, rewards: pp.rewards }) });
    }

    // Doubled Pawns Matrix: Pilot — predecessor to Endstate Matrix (v3.0–v3.1), same color as Matrix
    for (const dp of DOUBLED_PAWNS_MATRIX_HISTORY) {
      const color = EVENT_COLORS.endstateMatrix;
      addBar(`dpm-${dp.version}`, t('planner.calendar.doubledPawnsMatrixLabel', { version: dp.version }), color, new Date(dp.startDate), new Date(dp.endDate), dp.rewards, { legendGroup: 'matrix', description: t('planner.calendar.doubledPawnsDescription', { version: dp.version, rewards: dp.rewards }) });
    }

    // Tactical Hologram — permanent challenges, show when new arenas were introduced
    for (const th of TACTICAL_HOLOGRAM_HISTORY) {
      const color = EVENT_COLORS.tacticalHologram;
      addBar(`th-${th.version}`, t('planner.calendar.tacticalHologramLabel', { name: th.name }), color, new Date(th.startDate), new Date(th.endDate), 0, { legendGroup: 'tacticalHologram', description: t('planner.calendar.tacticalHologramDescription', { name: th.name, version: th.version }) });
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
      addBar(key, ev.name, color, versionStart, new Date(ev.currentEnd), astrite, { legendGroup: key, description: t('planner.calendar.eventDescription', { name: ev.name, desc: ev.description, rewards: ev.rewards }) });
    }
    return bars;
  }, [cal, bannerEndDate, activeBanners]);

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} data-no-swipe className="space-y-3">

        {/* ── VIEW 1: Page Calendar ─────────────────────────────────────────── */}

        {/* Month nav */}
        <div className="flex items-center justify-between">
          {/* U6-04: Don't clear selectedDay on month nav — panel hides naturally, note input preserved */}
          <button onClick={() => setMonthOffset(p => p - 1)} className="p-2 min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-500 hover:text-white transition-colors" aria-label={t('planner.calendar.previousMonth')}><ChevronLeft size={16} /></button>
          {/* U6-03: Show "Today" pill when viewing a non-current month */}
          <button onClick={() => { setMonthOffset(0); }} className="text-gray-100 text-md font-bold tracking-wide hover:text-yellow-400 transition-colors" title={monthOffset !== 0 ? t('planner.calendar.jumpToCurrentMonth') : undefined}>
            {cal.monthName}
            {monthOffset !== 0 && <span className="kuro-badge kuro-badge-yellow" style={{ borderRadius: 'var(--radius-pill)', verticalAlign: 'middle', marginLeft: 'var(--space-base)' }}>{t('planner.calendar.today')}</span>}
          </button>
          <button onClick={() => setMonthOffset(p => p + 1)} className="p-2 min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-500 hover:text-white transition-colors" aria-label={t('planner.calendar.nextMonth')}><ChevronRight size={16} /></button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1">
          {t('planner.calendar.weekdays').map(d => (
            <div key={d} className="text-center text-sm font-bold tracking-wider" style={{ color: 'var(--text-disabled)' }}>{d}</div>
          ))}
        </div>

        {/* P7-F002: Hint that days are tappable (shown only when no day selected) */}
        {!selectedDay && <p className="text-center text-sm text-gray-600 -mb-0.5">{t('planner.calendar.tapHint')}</p>}
        {/* U6-06: Day grid with arrow key navigation */}
        <div className="space-y-1" ref={gridRef} onKeyDown={handleGridKeyDown} role="grid" aria-label={t('planner.calendar.calendarAriaLabel')}>
          {rows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7 gap-1" role="row">
              {row.map((d, ci) => {
                if (!d) return <div key={`e${ci}`} role="gridcell" style={{ aspectRatio: '1', borderRadius: 'var(--radius-sm)', background: 'var(--bg-stat)', opacity: 0.3 }} />;
                const isSel = selectedDay === d.dateKey;
                const isGreen = d.isDailyDone;
                return (
                  <button key={d.day} type="button" role="gridcell" data-day={d.day} onClick={() => handleTap(d)}
                    className="active:scale-95 transition-transform"
                    aria-label={`${formatDate(d.date, { weekday: 'long', month: 'short', day: 'numeric' })}${d.isToday ? t('planner.calendar.todaySuffix') : ''}${d.note ? t('planner.calendar.noteSuffix') : ''}`}
                    style={{
                      aspectRatio: '1', borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative',
                      background: isGreen ? 'linear-gradient(to top, rgba(34,197,94,0.24), rgba(34,197,94,0.08))' : d.isBanner ? 'linear-gradient(to top, rgba(237,175,24,0.10), rgba(237,175,24,0.03))' : 'var(--bg-stat)',
                      border: d.isToday ? '2px solid #edaf18' : isSel ? '2px solid rgba(255,255,255,0.6)' : isGreen ? '1px solid rgba(34,197,94,0.4)' : d.isBanner ? '1px solid rgba(237,175,24,0.15)' : d.isPast ? '1px solid transparent' : '1px solid var(--border-subtle)',
                      boxShadow: isSel ? (d.isToday ? '0 0 10px rgba(237,175,24,0.3)' : '0 0 8px rgba(255,255,255,0.15)') : isGreen ? 'inset 0 0 8px rgba(34,197,94,0.12)' : 'none',
                      transition: 'all var(--transition-fast)',
                    }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span className="kuro-number" style={{
                        fontSize: 'var(--font-md)',
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
        <div className="flex items-center gap-3 justify-center" style={{ fontSize: 'var(--font-sm)', color: 'var(--text-disabled)' }}>
          <span className="flex items-center gap-1"><span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-micro)', border: '2px solid #edaf18', display: 'inline-block' }} />{t('planner.calendar.today')}</span>
          <span className="flex items-center gap-1"><span className="kuro-legend-swatch kuro-legend-swatch--banner" />{t('planner.calendar.bannerLegend')}</span>
          <span className="flex items-center gap-1"><span className="kuro-legend-swatch kuro-legend-swatch--dailies" />{t('planner.calendar.dailiesLegend')}</span>
          <span className="flex items-center gap-1"><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#edaf18', display: 'inline-block' }} />{t('planner.calendar.noteLegend')}</span>
        </div>

        {/* Detail panel */}
        {sel && (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', animation: 'slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-sm)' }}>
              <div>
                <span style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-heading)' }}>
                  {formatDate(sel.date, { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                {sel.isDailyDone && <span style={{ fontSize: 'var(--font-sm)', color: '#22c55e', marginLeft: '8px' }}>&#x2713; {t('planner.calendar.dailiesDone')}</span>}
              </div>
              <button onClick={() => setSelectedDay(null)} className="modal-close-btn flex items-center justify-center text-gray-400 hover:text-white" style={{ width: 'var(--size-touch-min)', height: 'var(--size-touch-min)' }} aria-label={t('planner.calendar.closeDetail')}><X size={14} /></button>
            </div>

            {(dailyIncome > 0 || sel.eventAstrite > 0) && !sel.isPast && (
              <div className="flex gap-4" style={{ fontSize: 'var(--font-sm)', marginBottom: 'var(--space-sm)' }}>
                {dailyIncome > 0 && <span><span className="text-yellow-400 kuro-number font-bold">{formatNumber(dailyIncome)}</span> <span style={{ color: 'var(--text-muted)' }}>{t('planner.calendar.astritePerDay')}</span></span>}
                {sel.eventAstrite > 0 && <span><span className="kuro-number font-bold" style={{ color: selEvents[0]?.color || '#a855f7' }}>+{sel.eventAstrite}</span> <span style={{ color: 'var(--text-muted)' }}>{t('planner.calendar.fromEvents', { count: selEvents.length, plural: selEvents.length !== 1 ? 's' : '' })}</span></span>}
              </div>
            )}

            {selEvents.length > 0 && (
              <div className="flex flex-wrap gap-1" style={{ marginBottom: 'var(--space-sm)' }}>
                {selEvents.map(ev => (
                  <span key={ev.key} style={{ fontSize: 'var(--font-sm)', padding: '4px 8px', borderRadius: 'var(--radius-full)', color: ev.color, border: `1px solid ${ev.color}40`, background: `${ev.color}1a` }}>
                    {ev.name}{ev.astrite > 0 ? ` +${ev.astrite} Astrite` : ''}
                  </span>
                ))}
              </div>
            )}

            {/* U6-10: Empty state when past day has no events and no note */}
            {sel.isPast && selEvents.length === 0 && !sel.note && (
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-disabled)', textAlign: 'center', padding: 'var(--space-sm) 0' }}>{t('planner.calendar.noEventsDay')}</div>
            )}

            {/* U6-02: Hide note input for past days (read-only view) */}
            {!sel.isPast && (
              <div>
                <div className="flex gap-2">
                  <input type="text" value={noteInput} onChange={e => setNoteInput(e.target.value.slice(0, 100))} onKeyDown={e => { if (e.key === 'Enter') saveNote(); }} placeholder={t('planner.calendar.addNotePlaceholder')} className="kuro-input kuro-input-sm flex-1" maxLength={100} aria-label={t('planner.calendar.noteAriaLabel')} />
                  <button onClick={saveNote} disabled={!noteInput.trim()} className={`kuro-btn ${noteInput.trim() ? 'active-gold' : ''}`} style={{ fontSize: 'var(--font-sm)', padding: '4px 12px', opacity: noteInput.trim() ? 1 : 0.4 }}>{sel.note ? t('planner.calendar.update') : t('planner.calendar.save')}</button>
                </div>
                {noteInput.length > 70 && <div style={{ fontSize: 'var(--font-2xs)', color: noteInput.length >= 100 ? '#ef4444' : 'var(--text-disabled)', textAlign: 'right', marginTop: '2px' }}>{noteInput.length}/100</div>}
              </div>
            )}

            {sel.note && (
              <div className="flex items-center gap-2" style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', background: 'var(--bg-stat)' }}>
                <span className="flex-1" style={{ fontSize: 'var(--font-base)', lineHeight: '1.4', color: 'var(--text-body)' }}>{sel.note}</span>
                {/* U6-08: Full read-only on past days — no delete button */}
                {!sel.isPast && <button onClick={deleteNote} className="flex-shrink-0 flex items-center justify-center bg-red-500/80 text-white opacity-60 hover:opacity-100 transition-opacity" style={{ width: 'var(--space-xl)', height: 'var(--space-xl)', borderRadius: 'var(--radius-sm)' }} aria-label={t('planner.calendar.deleteNoteAria')}><X size={12} /></button>}
              </div>
            )}
          </div>
        )}

        {dailyIncome > 0 && (
          <div className="text-center" style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
            <span className="text-yellow-400 kuro-number font-bold">{formatNumber(dailyIncome)}</span> {t('planner.calendar.astritePerDay')}
            <span style={{ margin: '0 8px' }}>&middot;</span>
            <span className="text-yellow-400 kuro-number font-bold">{formatNumber(Math.floor(dailyIncome / ASTRITE_PER_PULL * cal.daysInMonth))}</span> {t('planner.calendar.convenesPerMonth')}
          </div>
        )}

        {/* ── VIEW 2: Chronology ────────────────────────────────────────────── */}

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
          <div style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: 'var(--space-sm)' }}><GanttChart size={12} className="inline mr-1.5 -mt-0.5 text-yellow-400" />{t('planner.calendar.chronology')}</div>

          {/* V5-02: Day scale header — show 1st, every 5th, and last for readability */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cal.daysInMonth}, 1fr)`, marginBottom: '4px' }}>
            {Array.from({ length: cal.daysInMonth }, (_, i) => {
              const day = i + 1;
              const show = day === 1 || day % 5 === 0 || day === cal.daysInMonth;
              return <span key={i} className="kuro-number" style={{ fontSize: 'var(--font-sm)', color: 'var(--text-disabled)', textAlign: 'center' }}>{show ? day : ''}</span>;
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
              const tooltipText = `${bar.label}${bar.astrite > 0 ? ` — +${bar.astrite} ${t('planner.astrite')}` : ''}${bar.startLabel && bar.endLabel ? ` — ${bar.startLabel} → ${bar.endLabel}` : bar.endLabel ? ` — ${t('planner.calendar.endedDate', { date: bar.endLabel })}` : ''}${bar.daysLeft != null ? ` (${t('planner.calendar.daysLeftSuffix', { n: bar.daysLeft })})` : ''}${bar.weekly ? ` (${t('planner.calendar.resetsWeeklyMon')})` : ''}${bar.ended ? ` (${t('planner.calendar.ended')})` : ''}`;
              const handleBarClick = () => setSelectedBar(prev => prev?.key === bar.key ? null : bar);

              // Weekly events: render segmented bars showing Mon-Sun reset boundaries
              if (bar.weekly && bar.segments) {
                return (
                  <div key={bar.key} title={tooltipText} onClick={handleBarClick} style={{ position: 'relative', height: 'var(--size-icon-btn)', marginBottom: '4px', cursor: 'pointer' }}>
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
                          <span style={{ fontSize: 'var(--font-sm)', color: bar.color, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
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
                <div key={bar.key} title={tooltipText} onClick={handleBarClick} style={{ position: 'relative', height: 'var(--size-icon-btn)', marginBottom: '4px', cursor: 'pointer' }}>
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
                    <span style={{ fontSize: 'var(--font-sm)', color: bar.color, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{bar.label}</span>
                    {bar.ended && <span className="kuro-number" style={{ fontSize: 'var(--font-2xs)', color: bar.color, opacity: 0.6, marginLeft: '4px', flexShrink: 0 }}>{bar.endLabel ? t('planner.calendar.endedDate', { date: bar.endLabel }) : t('planner.calendar.ended')}</span>}
                    {bar.astrite > 0 && !bar.ended && <span className="kuro-number" style={{ fontSize: 'var(--font-sm)', color: bar.color, opacity: 0.7, marginLeft: '4px', flexShrink: 0 }}>+{bar.astrite}</span>}
                    {bar.endLabel && !bar.ended && <span className="kuro-number" style={{ fontSize: 'var(--font-2xs)', color: bar.color, opacity: 0.5, marginLeft: '4px', flexShrink: 0 }}>{bar.startLabel ? `${bar.startLabel}→` : '→'}{bar.endLabel}</span>}
                    {bar.daysLeft != null && <span className="kuro-number" style={{ fontSize: 'var(--font-sm)', color: bar.color, opacity: 0.5, marginLeft: '4px', flexShrink: 0 }}>{t('planner.calendar.daysLeftShort', { n: bar.daysLeft })}</span>}
                  </div>
                </div>
              );
            })}
            {chronoBars.length === 0 && (
              <div className="text-center py-2" style={{ fontSize: 'var(--font-sm)', color: 'var(--text-disabled)' }}>{t('planner.calendar.noActiveEvents')}</div>
            )}
          </div>

          {/* Bar detail popup */}
          {selectedBar && (
            <div style={{ marginTop: '4px', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: `${selectedBar.color}15`, border: `1px solid ${selectedBar.color}40` }}>
              <div onClick={() => setSelectedBar(null)} style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: selectedBar.color }}>{selectedBar.label}</div>
                {selectedBar.description && <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>{selectedBar.description}</div>}
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-disabled)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {selectedBar.startLabel && <span>{selectedBar.startLabel} → {selectedBar.endLabel}</span>}
                  {selectedBar.astrite > 0 && <span className="text-yellow-400">{t('planner.astriteSuffix', { n: `+${selectedBar.astrite}` })}</span>}
                  {selectedBar.daysLeft != null && <span>{t('planner.calendar.daysLeftSuffix', { n: selectedBar.daysLeft })}</span>}
                  {selectedBar.ended && <span>{t('planner.calendar.endedLabel')}</span>}
                  {selectedBar.weekly && <span>{t('planner.calendar.resetsWeekly')}</span>}
                </div>
              </div>
              {nativeSupported && selectedBar.endDate && !selectedBar.ended && (
                <button onClick={toggleReminder} className={`kuro-btn kuro-btn-sm w-full flex items-center justify-center gap-1 ${reminderScheduled ? 'active-cyan' : ''}`} style={{ marginTop: '8px' }}>
                  {reminderScheduled ? <Bell size={12} /> : <BellOff size={12} />}
                  {reminderScheduled ? t('planner.calendar.reminderOn') : t('planner.calendar.reminderOff')}
                </button>
              )}
            </div>
          )}

          {/* Chronology legend — adaptive: only shows event types present this month */}
          <div className="flex items-center gap-2 justify-center flex-wrap" style={{ fontSize: 'var(--font-sm)', color: 'var(--text-disabled)', marginTop: 'var(--space-sm)' }}>
            {(() => {
              const seen = new Map();
              for (const bar of chronoBars) {
                const group = bar.legendGroup || bar.key;
                if (!seen.has(group)) seen.set(group, { color: bar.color, weekly: !!bar.weekly });
              }
              return [...seen.entries()].map(([group, { color, weekly }]) => (
                <span key={group} className="flex items-center gap-1">
                  {weekly
                    ? <span style={{ display: 'inline-flex', gap: '1px' }}><span style={{ width: '4px', height: '4px', borderRadius: '1px', background: color }} /><span style={{ width: '4px', height: '4px', borderRadius: '1px', background: color }} /><span style={{ width: '4px', height: '4px', borderRadius: '1px', background: color }} /></span>
                    : <span style={{ width: '16px', height: '4px', borderRadius: 'var(--radius-micro)', background: color, display: 'inline-block' }} />
                  }
                  {getLegendLabel(group)}
                </span>
              ));
            })()}
          </div>
        </div>

    </div>
  );
}

export { AstriteCalendar };
