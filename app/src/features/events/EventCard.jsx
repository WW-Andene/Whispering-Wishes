// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/events/EventCard.jsx
// Event banner card with countdown timer and status toggling.
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { Check, CheckCircle, SkipForward } from 'lucide-react';
import { getServerAdjustedEnd, getRecurringEventEnd, getNextDailyReset, getNextWeeklyReset, getServerWeekProgress } from '../../core/time.js';

import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { getCurrencyIcon } from '../../shared/utils/elementVisuals.js';
import { CountdownTimer } from '../../shared/components/CountdownTimer.jsx';
import { EVENT_ACCENT_COLORS, TEXT_SHADOW_STYLE, generateMaskGradient } from '../../shared/components/BannerCard.jsx';
import { PLACEHOLDER_IMAGE } from '../../data/banners.js';
import { t } from '../../utils/i18n.js';

// Direct user request 2026-09-11: show the Astrite/Radiant Tide currency icons inline
// wherever those currency names appear in an event's rewards badge text.
const REWARD_ICON_CURRENCIES = ['Radiant Tide', 'Astrite'];
const REWARD_ICON_PATTERN = new RegExp(`(${REWARD_ICON_CURRENCIES.join('|')})`, 'g');
function renderRewardsWithIcons(rewardsText) {
  if (!rewardsText) return rewardsText;
  return rewardsText.split(REWARD_ICON_PATTERN).map((part, i) => {
    const iconSrc = REWARD_ICON_CURRENCIES.includes(part) ? getCurrencyIcon(part) : null;
    if (!iconSrc) return part;
    return (
      <React.Fragment key={i}>
        {part}
        <img src={iconSrc} alt="" className="inline w-4 h-4 -mt-0.5 ml-1" onError={hideOnError} />
      </React.Fragment>
    );
  });
}

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
      // Direct user request: Daily Reset's Done button resets itself every server day but
      // remembers/accumulates the week's completions — NOT a status wipe on every daily reset
      // like this used to do. Just recompute the countdown/today's key here; isDailyDoneToday
      // below naturally reads as unchecked the moment todayKey advances, no explicit reset needed.
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
  // Direct user request 2026-09-11: same "breath-zoom" slow scale-pulse every other banner
  // gets in full-animation mode (BannerCard.jsx, StandardBannerSection.jsx, etc. — see
  // kuro.css's `.animations-full .breath-zoom` rule), now applied to the Event tab's own
  // event picture too.
  const isFull = visualSettings?.animationsEnabled === 'full';

  // Direct user request: Daily Reset is a single Done button, same as every other event, that
  // resets itself back to unchecked each server day but remembers and accumulates how many of
  // the current Monday-Sunday week's days were marked done. status here is { weekStart, days:
  // [dayKey, ...] } rather than the plain 'done'/'skipped' string every other event uses — the
  // button's own on/off state is just "is TODAY's key in that list", so a new server day is
  // automatically unchecked (today's key hasn't been added yet) without any explicit reset,
  // while yesterday's (and every earlier this-week) completion stays counted toward the total.
  // weekStartKey/todayKey come from the same server-local, 04:00-boundary calendar
  // getNextDailyReset already uses, so "today" here always matches the countdown above it.
  const weekProgress = useMemo(() => (isDaily ? getServerWeekProgress(server) : null), [isDaily, server, resetTick]);
  const checkedDays = (isDaily && status && status.weekStart === weekProgress?.weekStartKey && Array.isArray(status.days))
    ? status.days : [];
  const isDailyDoneToday = isDaily && !!weekProgress && checkedDays.includes(weekProgress.todayKey);
  const toggleDailyToday = useCallback(() => {
    if (!onStatusChange || !weekProgress) return;
    const next = isDailyDoneToday
      ? checkedDays.filter(d => d !== weekProgress.todayKey)
      : [...checkedDays, weekProgress.todayKey];
    onStatusChange(next.length ? { weekStart: weekProgress.weekStartKey, days: next } : null);
  }, [onStatusChange, weekProgress, checkedDays, isDailyDoneToday]);
  const dailyFullyChecked = isDaily && checkedDays.length >= 7;

  const isDone = isDaily ? isDailyDoneToday : status === 'done';
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
          className={`absolute inset-0 w-full h-full object-cover ${isFull ? 'breath-zoom' : ''}`}
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
            {renderRewardsWithIcons(event.rewards)}
          </div>
          {onStatusChange && !isExpired && (
            <div className="flex gap-1">
              {!isDone && (
                <button onClick={isDaily ? toggleDailyToday : () => onStatusChange('done')} className="kuro-btn kuro-btn-sm active-emerald min-w-[48px] backdrop-blur-sm" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={`Mark ${event.name} as done`}>
                  <Check size={12} className="inline -mt-0.5" /> Done
                </button>
              )}
              {!isDaily && !isSkipped && (
                <button onClick={() => onStatusChange('skipped')} className="kuro-btn kuro-btn-sm min-w-[48px] backdrop-blur-sm" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={`Skip ${event.name}`}>
                  <SkipForward size={12} className="inline -mt-0.5" /> Skip
                </button>
              )}
              {isDaily ? (isDailyDoneToday && (
                <button onClick={toggleDailyToday} className="kuro-btn kuro-btn-sm backdrop-blur-sm" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={`Undo ${event.name} status`}>
                  Undo Done
                </button>
              )) : (status && (
                <button onClick={() => onStatusChange(null)} className="kuro-btn kuro-btn-sm backdrop-blur-sm" style={{ paddingLeft: 8, paddingRight: 8 }} aria-label={`Undo ${event.name} status`}>
                  {isDone ? 'Undo Done' : 'Undo Skip'}
                </button>
              ))}
            </div>
          )}
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
