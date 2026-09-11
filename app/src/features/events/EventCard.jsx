// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/events/EventCard.jsx
// Event banner card with countdown timer and status toggling.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { Check, CheckCircle, SkipForward } from 'lucide-react';
import { getServerAdjustedEnd, getRecurringEventEnd, getNextDailyReset, getNextWeeklyReset, getServerWeekProgress } from '../../core/time.js';

import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { CountdownTimer } from '../../shared/components/CountdownTimer.jsx';
import { EVENT_ACCENT_COLORS, TEXT_SHADOW_STYLE, generateMaskGradient } from '../../shared/components/BannerCard.jsx';
import { PLACEHOLDER_IMAGE } from '../../data/banners.js';
import { t } from '../../utils/i18n.js';

const EventCard = memo(({ event, server, bannerImage, visualSettings, status, onStatusChange, isExpired }) => {
  const [resetTick, setResetTick] = useState(0);
  const isDaily = event.dailyReset;
  const isWeekly = event.weeklyReset;
  const isRecurring = !isDaily && !isWeekly && event.resetType && /^~?\d+\s*(days?|d|h|m)?$/i.test(event.resetType.trim());

  const endDate = useMemo(() => {
    if (isDaily) return getNextDailyReset(server);
    if (isWeekly) return getNextWeeklyReset(server);
    if (isRecurring) return getRecurringEventEnd(event.currentEnd, event.resetType, server);
    return getServerAdjustedEnd(event.currentEnd, server);
  }, [event, server, isDaily, isWeekly, isRecurring, resetTick]);

  const handleExpire = useCallback(() => {
    if (isWeekly || isRecurring) {
      setResetTick(t => t + 1);
      // Auto-reset done/skipped status on new cycle so recurring events start fresh
      if (onStatusChange) onStatusChange(null);
    } else if (isDaily) {
      // Direct user request: Daily Reset is checkable per server-day, Monday-Sunday (7x/week),
      // not a single status that used to get wiped every day. Just recompute the countdown/
      // day-grid on each daily reset — the day-grid below (and progressStats in EventsTab)
      // already treat a grid from a past week as stale via its own weekStart comparison, so
      // no explicit reset is needed here; wiping it every day would defeat the whole point.
      setResetTick(t => t + 1);
    }
  }, [isDaily, isWeekly, isRecurring, onStatusChange]);

  const recalcFn = useMemo(() => {
    if (isDaily) return () => getNextDailyReset(server);
    if (isWeekly) return () => getNextWeeklyReset(server);
    if (isRecurring) return () => getRecurringEventEnd(event.currentEnd, event.resetType, server);
    return null;
  }, [isDaily, isWeekly, isRecurring, server, event]);

  const colors = EVENT_ACCENT_COLORS[event.accentColor] || EVENT_ACCENT_COLORS.cyan;
  const imgUrl = bannerImage;

  const maskGradient = visualSettings
    ? generateMaskGradient(visualSettings.shadowFadePosition, visualSettings.shadowFadeIntensity)
    : generateMaskGradient();
  const pictureOpacity = visualSettings ? visualSettings.shadowOpacity / 100 : 0.9;

  // Direct user request: Daily Reset is checkable per server-day, Monday-Sunday (7x/week) —
  // status here is { weekStart, days: [dayKey, ...] } rather than the 'done'/'skipped' string
  // every other event uses. weekStartKey/todayKey/todayIndex come from the same server-local,
  // 04:00-boundary calendar getNextDailyReset already uses, so "today" here always matches
  // the countdown above it.
  const weekProgress = useMemo(() => (isDaily ? getServerWeekProgress(server) : null), [isDaily, server, resetTick]);
  const dailyDayKeys = useMemo(() => {
    if (!weekProgress) return [];
    const start = new Date(`${weekProgress.weekStartKey}T00:00:00Z`);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [weekProgress]);
  const checkedDays = (isDaily && status && status.weekStart === weekProgress?.weekStartKey && Array.isArray(status.days))
    ? status.days : [];
  const toggleDailyDay = useCallback((dayKey) => {
    if (!onStatusChange || !weekProgress) return;
    const next = checkedDays.includes(dayKey) ? checkedDays.filter(d => d !== dayKey) : [...checkedDays, dayKey];
    onStatusChange(next.length ? { weekStart: weekProgress.weekStartKey, days: next } : null);
  }, [onStatusChange, weekProgress, checkedDays]);
  const dailyFullyChecked = isDaily && checkedDays.length >= 7;

  const isDone = !isDaily && status === 'done';
  const isSkipped = !isDaily && status === 'skipped';
  const dimmed = isSkipped || isExpired;
  const showDoneStyle = isDone || dailyFullyChecked;

  return (
    <div className={`relative overflow-hidden rounded-xl border ${isExpired ? 'border-gray-700/40' : showDoneStyle ? 'border-emerald-500/30' : isSkipped ? 'border-gray-600/30' : colors.border}`} style={{ minHeight: 'var(--height-banner)', isolation: 'isolate', zIndex: 5, opacity: dimmed ? 0.6 : 1 }}>
      {!imgUrl && event.gradient && <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient}`} />}
      {imgUrl && (
        <img
          src={imgUrl}
          alt={event.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            zIndex: 1,
            opacity: pictureOpacity,
            objectPosition: imgUrl === PLACEHOLDER_IMAGE ? 'center 15%' : undefined,
            maskImage: maskGradient,
            WebkitMaskImage: maskGradient,
            filter: dimmed ? 'grayscale(0.8)' : showDoneStyle ? 'grayscale(0.3)' : 'none'
          }}
          loading="lazy"
          onError={hideOnError}
        />
      )}

      {showDoneStyle && <div className="absolute inset-0 z-[2] bg-emerald-900/20" />}

      <div className="absolute inset-0 z-10 p-3 flex flex-col justify-between" style={TEXT_SHADOW_STYLE}>
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h4 className={`font-bold text-xl ${isExpired ? 'text-gray-500' : showDoneStyle ? 'text-emerald-400' : isSkipped ? 'text-gray-500 ' : colors.text}`}>
              {showDoneStyle && <CheckCircle size={12} className="inline mr-1 -mt-0.5" />}
              {isSkipped && <SkipForward size={12} className="inline mr-1 -mt-0.5" />}
              {event.name}
            </h4>
            <p className="text-gray-200 text-sm">{event.subtitle}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {isExpired ? (
              <span className="kuro-badge kuro-badge-red font-medium">{t('events.expired')}</span>
            ) : (
              <>
                <div className="text-gray-400 text-sm mb-1">{isDaily ? 'Resets in' : isWeekly ? 'Weekly reset' : 'Ends in'}</div>
                <CountdownTimer endDate={endDate} color={event.color} alwaysShow={isDaily || isWeekly || isRecurring} onExpire={handleExpire} recalcFn={recalcFn} />
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className={event.rewards ? `kuro-badge font-medium ${isExpired ? 'kuro-badge-gray' : showDoneStyle ? 'kuro-badge-emerald' : isSkipped ? 'kuro-badge-gray line-through' : `${colors.bg} ${colors.text}`}` : ''}>
            {event.rewards}
          </div>
          {isDaily && onStatusChange && !isExpired ? (
            // Direct user request: 7 tappable day-cells (Monday-Sunday), not a single Done/
            // Skip toggle — a day before today's server-day isn't retroactively checkable
            // (you can't back-mark a reset that already came and went uncompleted), and a day
            // after today isn't reachable yet either.
            <div className="flex gap-1">
              {dailyDayKeys.map((dayKey, i) => {
                const dayLabelKey = ['dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat', 'daySun'][i];
                const checked = checkedDays.includes(dayKey);
                const reachable = weekProgress && i <= weekProgress.todayIndex;
                return (
                  <button
                    key={dayKey}
                    onClick={reachable ? () => toggleDailyDay(dayKey) : undefined}
                    disabled={!reachable}
                    className={`kuro-btn kuro-btn-sm backdrop-blur-sm ${checked ? 'active-emerald' : ''} ${!reachable ? 'opacity-30 cursor-not-allowed' : ''}`}
                    style={{ paddingLeft: 6, paddingRight: 6, minWidth: 24 }}
                    aria-label={t('events.dailyDayAria', { day: t(`events.${dayLabelKey}`) })}
                    aria-pressed={checked}
                  >
                    {checked ? <Check size={12} className="inline" /> : t(`events.${dayLabelKey}`)}
                  </button>
                );
              })}
            </div>
          ) : !isDaily && onStatusChange && !isExpired ? (
            <div className="flex gap-1">
              {!isDone && (
                <button onClick={() => onStatusChange('done')} className="kuro-btn kuro-btn-sm active-emerald min-w-[48px] backdrop-blur-sm" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={`Mark ${event.name} as done`}>
                  <Check size={12} className="inline -mt-0.5" /> Done
                </button>
              )}
              {!isSkipped && (
                <button onClick={() => onStatusChange('skipped')} className="kuro-btn kuro-btn-sm min-w-[48px] backdrop-blur-sm" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={`Skip ${event.name}`}>
                  <SkipForward size={12} className="inline -mt-0.5" /> Skip
                </button>
              )}
              {status && (
                <button onClick={() => onStatusChange(null)} className="kuro-btn kuro-btn-sm backdrop-blur-sm" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={`Undo ${event.name} status`}>
                  {isDone ? 'Undo Done' : 'Undo Skip'}
                </button>
              )}
            </div>
          ) : null}
          {!onStatusChange && (
            <div className="text-gray-400 text-sm">{event.resetType}</div>
          )}
        </div>
      </div>
    </div>
  );
});
EventCard.displayName = 'EventCard';

export { EventCard };
