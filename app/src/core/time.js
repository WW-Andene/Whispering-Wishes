// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/time.js
// Time utilities: countdowns, server-adjusted dates, daily/weekly resets.
// ═══════════════════════════════════════════════════════════════════════════════

import { SERVERS, getServerOffset } from '../data/constants.js';

// [SECTION:TIME]
const getTimeRemaining = (endDate) => {
  const now = Date.now();
  const end = new Date(endDate).getTime();
  if (isNaN(end)) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }; // P9-FIX: guard NaN (LOW-5e)
  const total = end - now;
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
    expired: false
  };
};

// Events are stored with UTC times based on Europe server timezone.
// IMPORTANT: UTC conversion must account for DST at the EVENT date, not today.
// Europe uses CET (UTC+1) in winter and CEST (UTC+2) in summer (changes last Sun of Mar/Oct).
// For server-specific events (ending at XX:59, following reset times),
// adjust by timezone difference when viewing in another server.
// Reference: Europe — dynamic via getServerOffset('Europe', date) for CET/CEST
// P9-FIX: Use date-aware offset lookup (MEDIUM-5b — DST at event date, not current date)
const getEuropeOffset = (atDate) => getServerOffset('Europe', atDate);

const getServerAdjustedEnd = (currentEnd, server) => {
  if (!currentEnd) return currentEnd;
  const storedMs = new Date(currentEnd).getTime();
  if (isNaN(storedMs)) return currentEnd; // P9-FIX: guard invalid dates (LOW-5b)
  // P9-FIX: Compute DST offsets at the EVENT date, not at 'now' (MEDIUM-5b)
  const serverOffset = getServerOffset(server, storedMs);
  const europeOffset = getEuropeOffset(storedMs);
  // Calculate offset difference from Europe reference (DST-aware at event date)
  const offsetDiff = serverOffset - europeOffset;
  // Adjust: if server is ahead of Europe, event ends earlier in absolute UTC
  const adjustedMs = storedMs - (offsetDiff * 3600000);
  return new Date(adjustedMs).toISOString();
};

// Auto-advance recurring events past their end date (28-day cycles)
// Note: Cycle advancement uses fixed milliseconds; during DST transitions,
// the recalculated end may drift by ±1 hour but self-corrects on next cycle.
const getRecurringEventEnd = (currentEnd, resetType, server) => {
  const adjusted = getServerAdjustedEnd(currentEnd, server);
  if (!adjusted) return adjusted;
  const now = Date.now();
  const end = new Date(adjusted).getTime();
  if (isNaN(end)) return adjusted; // P9-FIX: guard invalid dates (LOW-5c)
  if (end > now) return adjusted;
  // Parse cycle days from resetType like "28 days" or "~28 days"
  const match = resetType && resetType.match(/(\d+)/);
  if (!match) return adjusted;
  const cycleMs = parseInt(match[1], 10) * 86400000;
  if (cycleMs <= 0) return adjusted; // P9-FIX: guard zero/negative cycle (LOW-5d)
  // Use floor+1 to ensure next cycle end is strictly in the future (A3-01)
  const cycles = Math.floor((now - end) / cycleMs) + 1;
  return new Date(end + cycles * cycleMs).toISOString();
};

// Iterative DST correction: verify offset at estimated UTC and correct if needed
const _correctDSTOffset = (server, localEstimate, serverOffset) => {
  let resetOffsetAtTarget = getServerOffset(server, localEstimate - serverOffset * 3600000);
  let utc = localEstimate - resetOffsetAtTarget * 3600000;
  const verifiedOffset = getServerOffset(server, utc);
  if (verifiedOffset !== resetOffsetAtTarget) {
    utc = localEstimate - verifiedOffset * 3600000;
  }
  return utc;
};

// Next daily reset: 04:00 in server's local timezone
const getNextDailyReset = (server) => {
  const serverOffset = getServerOffset(server);
  const now = Date.now();

  // Get current time in server's local timezone
  const nowInServerTz = new Date(now + serverOffset * 3600000);
  const year = nowInServerTz.getUTCFullYear();
  const month = nowInServerTz.getUTCMonth();
  const day = nowInServerTz.getUTCDate();
  const hour = nowInServerTz.getUTCHours();
  const minute = nowInServerTz.getUTCMinutes();

  // Today's 04:00 in server local time
  let reset = Date.UTC(year, month, day, 4, 0, 0, 0);

  // If already past 04:00 local, next reset is tomorrow
  const currentMinutes = hour * 60 + minute;
  if (currentMinutes >= 240) { // 4 * 60 = 240
    reset += 86400000; // Add 24 hours
  }

  // Iterative DST correction: initial estimate may use wrong offset near DST transition
  const resetUtc = _correctDSTOffset(server, reset, serverOffset);
  return new Date(resetUtc).toISOString();
};

// Next weekly reset: Monday 04:00 in server's local timezone
const getNextWeeklyReset = (server) => {
  const serverOffset = getServerOffset(server);
  const now = Date.now();

  // Get current time in server's local timezone
  const nowInServerTz = new Date(now + serverOffset * 3600000);
  const year = nowInServerTz.getUTCFullYear();
  const month = nowInServerTz.getUTCMonth();
  const day = nowInServerTz.getUTCDate();
  const dayOfWeek = nowInServerTz.getUTCDay(); // 0=Sun, 1=Mon
  const hour = nowInServerTz.getUTCHours();
  const minute = nowInServerTz.getUTCMinutes();

  const currentMinutes = hour * 60 + minute;
  const pastReset = currentMinutes >= 240; // Past 04:00

  // Calculate days until next Monday
  let daysToMon;
  if (dayOfWeek === 1 && !pastReset) {
    daysToMon = 0; // It's Monday before 04:00
  } else if (dayOfWeek === 1 && pastReset) {
    daysToMon = 7; // It's Monday after 04:00
  } else {
    // Days until next Monday: (8 - dayOfWeek) % 7, but if Sunday use 1
    daysToMon = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  }

  // Monday 04:00 in server local time
  const mondayLocal = Date.UTC(year, month, day + daysToMon, 4, 0, 0, 0);

  // Iterative DST correction: verify offset at the estimated UTC time
  const mondayUtc = _correctDSTOffset(server, mondayLocal, serverOffset);
  return new Date(mondayUtc).toISOString();
};

export {
  getTimeRemaining, getServerAdjustedEnd,
  getRecurringEventEnd, getNextDailyReset, getNextWeeklyReset,
};
