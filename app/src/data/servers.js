// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — data/servers.js (split from constants.js)
// Server timezone data + DST-aware UTC offset lookup for daily/weekly resets.
// ═══════════════════════════════════════════════════════════════════════════════

// Each server has its own timezone for daily/weekly resets (04:00 local)
// Source: https://wuwatracker.com/timeline
const SERVERS = {
  'Asia': { name: 'Asia', timezone: 'Asia/Shanghai', utcOffset: 8, resetHour: 4, hasDST: false },
  'America': { name: 'America', timezone: 'America/New_York', utcOffset: -5, resetHour: 4, hasDST: true },
  'Europe': { name: 'Europe', timezone: 'Europe/Paris', utcOffset: 1, resetHour: 4, hasDST: true },
  'SEA': { name: 'SEA', timezone: 'Asia/Singapore', utcOffset: 8, resetHour: 4, hasDST: false },
  'HMT': { name: 'HMT', timezone: 'Asia/Hong_Kong', utcOffset: 8, resetHour: 4, hasDST: false },
};

// Intl.DateTimeFormat cache — avoids re-creating formatters on every getServerOffset call
const _dtfCache = new Map();
const getCachedFormatter = (tz) => {
  if (_dtfCache.has(tz)) return _dtfCache.get(tz);
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
  _dtfCache.set(tz, f);
  return f;
};

// Get UTC offset for a server at a specific date (DST-aware)
// P9-FIX: Accept optional date parameter for future-date DST correctness (MEDIUM-5a)
const getServerOffset = (server, atDate) => {
  const serverData = SERVERS[server];
  if (!serverData) {
    console.warn(`[WW] Unknown server "${server}", defaulting to Europe (UTC+1)`);
    return 1; // Default to Europe
  }
  if (!serverData.hasDST) return serverData.utcOffset;

  // Use Intl API to detect DST offset at the specified date (or now)
  try {
    const date = atDate ? new Date(atDate) : new Date();
    if (isNaN(date.getTime())) return serverData.utcOffset; // P9-FIX: guard NaN dates (LOW-5a)
    const formatter = getCachedFormatter(serverData.timezone);
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (tzPart) {
      // Parse offset like "GMT-4", "GMT+2", or "GMT+5:30" (P7-FIX: half-hour support 7F)
      const match = tzPart.value.match(/GMT([+-]\d+)(?::(\d{2}))?/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = match[2] ? parseInt(match[2], 10) / 60 : 0;
        return hours + (hours < 0 ? -minutes : minutes);
      }
    }
  } catch (e) {
    // Fallback to hardcoded offset if Intl API fails
  }
  return serverData.utcOffset;
};

export { SERVERS, getServerOffset };
