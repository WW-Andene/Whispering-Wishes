// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES v3.2.2 — appcore-engine.js
// Time utilities, gacha simulation, state/reducer, calcStats. No React.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  SERVERS, getServerOffset,
  HARD_PITY, SOFT_PITY_START,
  LUNITE_DAILY_ASTRITE, ASTRITE_PER_PULL,
  MAX_ASTRITE, MAX_CALC_PULLS,
  HARD_PITY_4STAR, FEATURED_4STAR_RATE,
  generateUniqueId,
} from './appcore-data.js';

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
  const cycles = Math.ceil((now - end) / cycleMs);
  return new Date(end + cycles * cycleMs).toISOString();
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
  
  // P9-FIX: Use offset at the reset time for conversion, not current offset (MEDIUM-5c)
  // This handles DST transitions between now and the next reset
  const resetOffsetAtTarget = getServerOffset(server, reset - serverOffset * 3600000);
  const resetUtc = reset - resetOffsetAtTarget * 3600000;
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
  
  // P9-FIX: Use offset at the reset time for conversion, not current offset (MEDIUM-5c)
  const resetOffsetAtTarget = getServerOffset(server, mondayLocal - serverOffset * 3600000);
  const mondayUtc = mondayLocal - resetOffsetAtTarget * 3600000;
  return new Date(mondayUtc).toISOString();
};

// [SECTION:SIMULATION]
// === GACHA PROBABILITY ENGINE v2.0 ===
// Hybrid DP (exact) + Monte Carlo (verification/large N) approach
// Matches known WuWa rates: soft pity 65-79, hard pity 80, base 0.8%

const MAX_PITY = HARD_PITY; // P7-FIX: Use single source of truth (7E)
const GACHA_EPS = 1e-15;

// Soft pity rate function: 0.8% base, linear ramp from SOFT_PITY_START to 100% at HARD_PITY
const BASE_5STAR_RATE = 0.008; // 0.8%
const SOFT_PITY_STEPS = MAX_PITY - SOFT_PITY_START; // 80 - 65 = 15 steps
const getPullRate = (pity) => {
  if (pity < SOFT_PITY_START) return BASE_5STAR_RATE;
  return Math.min(BASE_5STAR_RATE + ((pity - SOFT_PITY_START + 1) / SOFT_PITY_STEPS) * (1.0 - BASE_5STAR_RATE), 1.0);
};

// === DYNAMIC PROGRAMMING (EXACT) ===
// Computes exact probability distribution for getting K copies in N pulls
// isWeapon: true = weapon banner (100% featured), false = character banner (50/50)
const computeDistDP = (N, isWeapon, startPity = 0, startGuar = 0, maxCopies = 10) => {
  // Clamp startPity to valid range
  const clampedPity = Math.max(0, Math.min(MAX_PITY, startPity));
  
  // DP state: dp[pulls][pity][guar?][copies] = probability
  // For weapon: no guarantee dimension
  const dp = Array.from({length: N+1}, () => 
    Array.from({length: MAX_PITY+1}, () => 
      isWeapon ? 
        Array(maxCopies+1).fill(0) :
        Array.from({length: 2}, () => Array(maxCopies+1).fill(0))
    )
  );
  
  // Initial state
  if (isWeapon) {
    dp[0][clampedPity][0] = 1.0;
  } else {
    dp[0][clampedPity][startGuar][0] = 1.0;
  }
  
  // Fill DP table
  for (let n = 0; n < N; n++) {
    for (let p = 0; p <= MAX_PITY; p++) {
      const states = isWeapon ? [null] : [0, 1];
      for (const g of states) {
        for (let k = 0; k <= maxCopies; k++) {
          const prob = isWeapon ? dp[n][p][k] : dp[n][p][g][k];
          if (prob < GACHA_EPS) continue;
          
          const rate = getPullRate(p);
          const nextPity = Math.min(MAX_PITY, p + 1);
          
          // Non-5★ outcome
          if (isWeapon) {
            dp[n+1][nextPity][k] += prob * (1 - rate);
          } else {
            dp[n+1][nextPity][g][k] += prob * (1 - rate);
          }
          
          // 5★ outcome
          const pFeatured = (isWeapon || g === 1) ? 1.0 : 0.5;
          const nextK = Math.min(k + 1, maxCopies); // Absorb overflow into maxCopies bucket
          if (isWeapon) {
            dp[n+1][0][nextK] += prob * rate; // Weapon always featured
          } else {
            dp[n+1][0][0][nextK] += prob * rate * pFeatured; // Win: copies++, guar=0
          }
          // Character loss (not featured): guar becomes 1, copies unchanged
          if (!isWeapon && g === 0) {
            dp[n+1][0][1][k] += prob * rate * 0.5;
          }
        }
      }
    }
  }
  
  // Extract final distribution
  const dist = Array(maxCopies+1).fill(0);
  for (let p = 0; p <= MAX_PITY; p++) {
    const states = isWeapon ? [null] : [0, 1];
    for (const g of states) {
      for (let k = 0; k <= maxCopies; k++) {
        dist[k] += isWeapon ? dp[N][p][k] : dp[N][p][g][k];
      }
    }
  }
  
  // Normalize
  const total = dist.reduce((a, b) => a + b, 0);
  return dist.map(x => total > 0 ? x / total : 0);
};

// === MONTE CARLO (FAST APPROXIMATION) ===
// For large N or when DP is too memory-intensive
const simulateOneRun = (isWeapon, N, startPity, startGuar) => {
  let pity = startPity, guar = startGuar, copies = 0;
  for (let i = 0; i < N; i++) {
    const rate = getPullRate(pity);
    if (Math.random() < rate) {
      const featured = (isWeapon || guar === 1) ? true : (Math.random() < 0.5);
      if (featured) copies++;
      guar = featured ? 0 : 1;
      pity = 0;
    } else {
      pity = Math.min(MAX_PITY, pity + 1);
    }
  }
  return copies;
};

const computeDistMC = (N, isWeapon, startPity = 0, startGuar = 0, maxCopies = 10, trials = 50000) => {
  const counts = Array(maxCopies + 1).fill(0);
  for (let t = 0; t < trials; t++) {
    const k = simulateOneRun(isWeapon, N, startPity, startGuar);
    counts[Math.min(k, maxCopies)]++;
  }
  return counts.map(c => c / trials);
};

// P11-FIX: Named constant for DP-to-MC threshold (Step 7 audit — LOW-3e)
// At N=500, DP table = (N+1) × (MAX_PITY+1) × 2 × (maxCopies+1) = 501 × 81 × 2 × 11 = ~891K Float64 entries ≈ 7.1MB
// Beyond this, memory cost grows linearly and MC becomes preferable.
const DP_MAX_PULLS = 500;

// === HYBRID: Auto-select best method ===
const computeGachaDist = (N, isWeapon, startPity = 0, startGuar = 0, maxCopies = 10) => {
  // P12-FIX: Safety cap — MC for N > 5000 with 100K trials = 500M+ iterations, would freeze browser (Step 14 — MEDIUM-10g)
  const safeN = Math.min(N, 5000);
  // Use DP for smaller N (more accurate), MC for larger N (faster, lower memory)
  if (safeN <= DP_MAX_PULLS) {
    return computeDistDP(safeN, isWeapon, startPity, startGuar, maxCopies);
  } else {
    return computeDistMC(safeN, isWeapon, startPity, startGuar, maxCopies, 100000);
  }
};

// === HELPER FUNCTIONS ===

// Get cumulative probability P(copies >= K)
const getCumulativeProb = (dist, k) => {
  return dist.slice(k).reduce((a, b) => a + b, 0);
};

// Compute expected value and standard deviation
const computeGachaStats = (dist) => {
  let e = 0, e2 = 0;
  for (let k = 0; k < dist.length; k++) {
    e += k * dist[k];
    e2 += k * k * dist[k];
  }
  // Guard: floating-point arithmetic can make e2 - e*e slightly negative
  return { expected: e, stddev: Math.sqrt(Math.max(0, e2 - e * e)) };
};

// Expected pulls to reach targetK copies (value iteration)
const expectedPullsToTarget = (isWeapon, targetK, startPity = 0, startGuar = 0) => {
  if (targetK <= 0) return 0;
  const clampedPity = Math.max(0, Math.min(MAX_PITY, startPity));
  
  // v[pity][guar][copies] = expected remaining pulls
  const v = Array.from({length: MAX_PITY + 1}, () =>
    isWeapon ?
      Array(targetK).fill(0) :
      Array.from({length: 2}, () => Array(targetK).fill(0))
  );
  
  // Solve backwards from copies = targetK-1 down to 0
  for (let c = targetK - 1; c >= 0; c--) {
    // FIX: g loop OUTSIDE p loop — v[*][1][c] must be fully computed before any v[*][0][c]
    // because v[p][0][c] depends on v[0][1][c] (the cost of losing 50/50 and restarting with guarantee)
    const gs = isWeapon ? [null] : [1, 0];
    for (const g of gs) {
      for (let p = MAX_PITY; p >= 0; p--) {
        const rate = getPullRate(p);
        const nextPity = Math.min(MAX_PITY, p + 1);
        const pFeatured = (isWeapon || g === 1) ? 1 : 0.5;
        
        let expected = 1; // This pull
        
        // Non-5★: continue at next pity
        if (isWeapon) {
          expected += (1 - rate) * v[nextPity][c];
        } else {
          expected += (1 - rate) * v[nextPity][g][c];
        }
        
        // 5★ featured: +1 copy
        const nextC = c + 1;
        if (nextC < targetK) {
          expected += rate * pFeatured * (isWeapon ? v[0][nextC] : v[0][0][nextC]);
        }
        // 5★ not featured (char only, g=0): same copies, guar=1
        if (!isWeapon && g === 0) {
          expected += rate * 0.5 * v[0][1][c];
        }
        
        if (isWeapon) {
          v[p][c] = expected;
        } else {
          v[p][g][c] = expected;
        }
      }
    }
  }
  
  return isWeapon ? v[clampedPity][0] : v[clampedPity][startGuar][0];
};

// Min pulls N such that P(copies >= targetK | N pulls) >= minProb%
const minPullsForProb = (isWeapon, targetK, minProb, startPity = 0, startGuar = 0) => {
  // Lower bound must be 1, not targetK*40, to handle high starting pity correctly
  let low = 1, high = Math.min(targetK * 200, 5000); // P12-FIX: Cap at 5000 to prevent extreme MC (Step 14 — MEDIUM-10e)
  let ans = high;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    // Use higher MC trials in binary search to reduce stochastic oscillation
    const dist = mid <= DP_MAX_PULLS
      ? computeDistDP(mid, isWeapon, startPity, startGuar, targetK)
      : computeDistMC(mid, isWeapon, startPity, startGuar, targetK, 200000);
    const pGeK = getCumulativeProb(dist, targetK) * 100;
    
    if (pGeK >= minProb) {
      ans = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return ans;
};

// [SECTION:STATE]
const initialState = {
  server: 'Asia',
  profile: {
    uid: '', importedAt: null,
    username: '', // User-set display name
    profilePic: '', // Character name for profile pic (from collection) or '' for default icon
    featured: { history: [], pity5: 0, pity4: 0, guaranteed: false },
    weapon: { history: [], pity5: 0, pity4: 0 },
    standardChar: { history: [], pity5: 0, pity4: 0 },
    standardWeap: { history: [], pity5: 0, pity4: 0 },
    beginner: { history: [], pity5: 0, pity4: 0 },
  },
  calc: {
    bannerCategory: 'featured',
    selectedBanner: 'char',
    charPity: 0, charGuaranteed: false, charGuaranteedManual: false, charCopies: 1,
    weapPity: 0, weapCopies: 1,
    stdCharPity: 0, stdCharCopies: 1,
    stdWeapPity: 0, stdWeapCopies: 1,
    char4StarCopies: 1, weap4StarCopies: 1, stdChar4StarCopies: 1, stdWeap4StarCopies: 1,
    astrite: '', radiant: '', forging: '', lustrous: '',
    allocPriority: 50, // 0-100: 0=all weapon, 50=balanced, 100=all char (featured banners)
    stdAllocPriority: 50, // Same for standard banners — independent control
  },
  planner: {
    dailyAstrite: 60, luniteActive: false,
    goalType: '5star', goalBanner: 'featuredChar', goalTarget: 1, goalPulls: HARD_PITY, goalModifier: 1,
    goal4StarTarget: 1, goal4StarType: 'featured',
    addedIncome: [],
  },
  bookmarks: [],
  eventStatus: {},
  settings: { showOnboarding: true },
};

// Load saved state from persistent storage
// Key kept as v2.2 for backwards compatibility — existing user data loads seamlessly.
// If schema changes require migration, add a migration function here.
const STORAGE_KEY = 'whispering-wishes-v2.2';

// Helper to check if localStorage is available (fails in some preview modes)
const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

const storageAvailable = isStorageAvailable();

// P10-FIX: Sanitize imported state to prevent prototype pollution and reject unknown keys (Step 6 audit)
const ALLOWED_STATE_KEYS = new Set(['server', 'profile', 'calc', 'planner', 'settings', 'bookmarks', 'eventStatus']);
const sanitizeStateObj = (obj) => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
  const clean = {};
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    clean[key] = obj[key];
  }
  return clean;
};
const sanitizeImportedState = (s) => {
  if (typeof s !== 'object' || s === null) return {};
  const clean = {};
  for (const key of Object.keys(s)) {
    if (ALLOWED_STATE_KEYS.has(key)) {
      clean[key] = sanitizeStateObj(s[key]);
    }
  }
  return clean;
};

const loadFromStorage = () => {
  if (!storageAvailable) return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // P10-FIX: Sanitize loaded state to prevent prototype pollution from tampered localStorage (Step 6 audit)
    const safeParsed = sanitizeStateObj(parsed);
    return {
      ...initialState,
      ...sanitizeImportedState(safeParsed),
      server: safeParsed.server || initialState.server,
      profile: {
        ...initialState.profile,
        ...(safeParsed.profile ? sanitizeStateObj(safeParsed.profile) : {}),
        featured: { ...initialState.profile.featured, ...(safeParsed.profile?.featured ? sanitizeStateObj(safeParsed.profile.featured) : {}) },
        weapon: { ...initialState.profile.weapon, ...(safeParsed.profile?.weapon ? sanitizeStateObj(safeParsed.profile.weapon) : {}) },
        standardChar: { ...initialState.profile.standardChar, ...(safeParsed.profile?.standardChar ? sanitizeStateObj(safeParsed.profile.standardChar) : {}) },
        standardWeap: { ...initialState.profile.standardWeap, ...(safeParsed.profile?.standardWeap ? sanitizeStateObj(safeParsed.profile.standardWeap) : {}) },
        beginner: { ...initialState.profile.beginner, ...(safeParsed.profile?.beginner ? sanitizeStateObj(safeParsed.profile.beginner) : {}) },
      },
      calc: { ...initialState.calc }, // Always start calculator fresh - no sync from saved data
      planner: { ...initialState.planner, ...safeParsed.planner },
      settings: { ...initialState.settings, ...safeParsed.settings },
      bookmarks: safeParsed.bookmarks || [],
      eventStatus: safeParsed.eventStatus || {},
    };
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
};

const saveToStorage = (state) => {
  if (!storageAvailable) return true; // P12-FIX: Return success status (Step 14 — MEDIUM-10a)
  try {
    const data = JSON.stringify(state);
    // Warn if approaching 5MB localStorage limit (~80% = 4MB)
    if (data.length > 4 * 1024 * 1024) {
      console.warn('Storage approaching limit:', (data.length / 1024 / 1024).toFixed(1) + 'MB');
    }
    localStorage.setItem(STORAGE_KEY, data);
    return true;
  } catch (e) {
    // QuotaExceededError — storage is full
    console.error('Save failed (storage full?):', e);
    return false; // P12-FIX: Return false on failure so UI can notify user (Step 14 — MEDIUM-10a)
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_SERVER': return { ...state, server: action.server };
    case 'SET_CALC': return { ...state, calc: { ...state.calc, [action.field]: action.value } };
    case 'SET_PLANNER': return { ...state, planner: { ...state.planner, [action.field]: action.value } };
    case 'SET_SETTINGS': return { ...state, settings: { ...state.settings, [action.field]: action.value } };
    case 'SET_EVENT_STATUS': {
      const newStatus = { ...state.eventStatus };
      if (action.status === null) { delete newStatus[action.eventKey]; } 
      else { newStatus[action.eventKey] = action.status; }
      return { ...state, eventStatus: newStatus };
    }
    case 'ADD_INCOME': {
      return {
        ...state,
        planner: {
          ...state.planner,
          addedIncome: [...state.planner.addedIncome, action.income],
        },
        calc: {
          ...state.calc,
          astrite: String(Math.min(MAX_ASTRITE, (+state.calc.astrite || 0) + action.income.astrite)), // P12-FIX: Cap at MAX_ASTRITE (Step 14 — MEDIUM-10e)
          radiant: String((+state.calc.radiant || 0) + (action.income.radiant || 0)),
          lustrous: String((+state.calc.lustrous || 0) + (action.income.lustrous || 0)),
        },
      };
    }
    case 'REMOVE_INCOME': {
      const item = state.planner.addedIncome.find(i => i.id === action.id);
      if (!item) return state;
      return {
        ...state,
        planner: {
          ...state.planner,
          addedIncome: state.planner.addedIncome.filter(i => i.id !== action.id),
        },
        calc: {
          ...state.calc,
          astrite: String(Math.max(0, (+state.calc.astrite || 0) - item.astrite)),
          radiant: String(Math.max(0, (+state.calc.radiant || 0) - (item.radiant || 0))),
          lustrous: String(Math.max(0, (+state.calc.lustrous || 0) - (item.lustrous || 0))),
        },
      };
    }
    case 'CLEAR_ALL_INCOME': {
      const totalAst = state.planner.addedIncome.reduce((s, i) => s + (i.astrite || 0), 0);
      const totalRad = state.planner.addedIncome.reduce((s, i) => s + (i.radiant || 0), 0);
      const totalLus = state.planner.addedIncome.reduce((s, i) => s + (i.lustrous || 0), 0);
      return {
        ...state,
        planner: { ...state.planner, addedIncome: [] },
        calc: {
          ...state.calc,
          astrite: String(Math.max(0, (+state.calc.astrite || 0) - totalAst)),
          radiant: String(Math.max(0, (+state.calc.radiant || 0) - totalRad)),
          lustrous: String(Math.max(0, (+state.calc.lustrous || 0) - totalLus)),
        },
      };
    }
    case 'ADD_DAILY_INCOME': {
      const days = Math.max(0, Math.min(365, Number(action.days) || 0));
      const dailyTotal = (state.planner.dailyAstrite || 0) + (state.planner.luniteActive ? LUNITE_DAILY_ASTRITE : 0);
      const totalAstrite = dailyTotal * days;
      return { ...state, calc: { ...state.calc, astrite: String(Math.min(MAX_ASTRITE, (+state.calc.astrite || 0) + totalAstrite)) } }; // P12-FIX: Cap at MAX_ASTRITE (Step 14 — MEDIUM-10e)
    }
    // SYNC_PITY removed - calculator is fully independent from history
    case 'IMPORT_HISTORY': {
      const newProfile = { ...state.profile, importedAt: new Date().toISOString(), uid: action.uid || state.profile.uid };
      
      // Deduplicate: merge new history with existing, filtering out entries that match by timestamp + name + rarity
      // P9-FIX: Added rarity and id to dedup key to reduce collision risk for duplicate 3★ weapons (Step 4 audit)
      const deduplicateMerge = (existing, incoming) => {
        if (!incoming || incoming.length === 0) return existing || []; // P12-FIX: Guard empty incoming (Step 14 — LOW-10a)
        if (!existing || existing.length === 0) return incoming;
        const makeKey = (p) => `${p.timestamp || ''}|${p.name || ''}|${p.rarity || ''}|${p.id || ''}`;
        const existingKeys = new Set(existing.map(makeKey));
        const newEntries = incoming.filter(p => !existingKeys.has(makeKey(p)));
        if (newEntries.length === 0) return existing; // All duplicates
        // Re-sort merged history by timestamp
        return [...existing, ...newEntries].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      };
      
      if (action.bannerType === 'featured') {
        const merged = deduplicateMerge(state.profile.featured?.history, action.history);
        // P9-FIX: Only update pity values if new entries were actually merged (Step 4 audit)
        const hadNewEntries = merged !== state.profile.featured?.history;
        newProfile.featured = { 
          history: merged, 
          pity5: hadNewEntries ? action.pity5 : (state.profile.featured?.pity5 ?? action.pity5), 
          pity4: hadNewEntries ? action.pity4 : (state.profile.featured?.pity4 ?? action.pity4), 
          guaranteed: hadNewEntries ? (action.guaranteed || false) : (state.profile.featured?.guaranteed ?? false) 
        };
      } else if (action.bannerType === 'weapon') {
        const merged = deduplicateMerge(state.profile.weapon?.history, action.history);
        const hadNewEntries = merged !== state.profile.weapon?.history;
        newProfile.weapon = { 
          history: merged, 
          pity5: hadNewEntries ? action.pity5 : (state.profile.weapon?.pity5 ?? action.pity5), 
          pity4: hadNewEntries ? action.pity4 : (state.profile.weapon?.pity4 ?? action.pity4) 
        };
      } else if (action.bannerType === 'standardChar') {
        const merged = deduplicateMerge(state.profile.standardChar?.history, action.history);
        const hadNewEntries = merged !== state.profile.standardChar?.history;
        newProfile.standardChar = { 
          history: merged, 
          pity5: hadNewEntries ? action.pity5 : (state.profile.standardChar?.pity5 ?? action.pity5), 
          pity4: hadNewEntries ? action.pity4 : (state.profile.standardChar?.pity4 ?? action.pity4) 
        };
      } else if (action.bannerType === 'standardWeap') {
        const merged = deduplicateMerge(state.profile.standardWeap?.history, action.history);
        const hadNewEntries = merged !== state.profile.standardWeap?.history;
        newProfile.standardWeap = { 
          history: merged, 
          pity5: hadNewEntries ? action.pity5 : (state.profile.standardWeap?.pity5 ?? action.pity5), 
          pity4: hadNewEntries ? action.pity4 : (state.profile.standardWeap?.pity4 ?? action.pity4) 
        };
      } else if (action.bannerType === 'beginner') {
        const merged = deduplicateMerge(state.profile.beginner?.history, action.history);
        const hadNewEntries = merged !== state.profile.beginner?.history;
        newProfile.beginner = { 
          history: merged, 
          pity5: hadNewEntries ? action.pity5 : (state.profile.beginner?.pity5 ?? action.pity5), 
          pity4: hadNewEntries ? action.pity4 : (state.profile.beginner?.pity4 ?? action.pity4) 
        };
      }
      return { ...state, profile: newProfile };
    }
    case 'SET_UID': return { ...state, profile: { ...state.profile, uid: action.uid } };
    case 'SET_USERNAME': return { ...state, profile: { ...state.profile, username: action.value } };
    case 'SET_PROFILE_PIC': return { ...state, profile: { ...state.profile, profilePic: action.value } };
    case 'CLEAR_PROFILE': return { ...state, profile: { ...initialState.profile, username: state.profile.username, profilePic: state.profile.profilePic } };
    case 'SAVE_BOOKMARK': return { ...state, bookmarks: [...state.bookmarks, { id: generateUniqueId(), name: action.name, timestamp: new Date().toISOString(), ...state.calc }] };
    case 'LOAD_BOOKMARK': {
      const b = state.bookmarks.find(bm => bm.id === action.id);
      if (!b) return state;
      // P9-FIX: Restore ALL saved calc fields, not just a subset (Step 4 audit)
      // Bookmarks save ...state.calc, so we restore every calc field that was captured.
      // Destructure out non-calc metadata, spread the rest as calc fields.
      const { id: _id, name: _name, timestamp: _ts, ...savedCalc } = b;
      return {
        ...state,
        calc: {
          ...state.calc,
          ...savedCalc,
        },
      };
    }
    case 'DELETE_BOOKMARK': return { ...state, bookmarks: state.bookmarks.filter(b => b.id !== action.id) };
    // P9-FIX: Merge with initialState to ensure no missing fields from older schemas (Step 4 audit)
    case 'LOAD_STATE': return { ...initialState, ...sanitizeImportedState(action.state) }; // P10-FIX: Sanitize to prevent prototype pollution (Step 6 audit)
    case 'RESET': return initialState;
    default: return state;
  }
};

// [SECTION:CALCULATIONS]
const calcStats = (pulls, pity, guaranteed, isChar, copies) => {
  // Defensive input validation — clamp to valid ranges
  const safePulls = Math.max(0, Math.min(MAX_CALC_PULLS, Math.floor(pulls) || 0)); // P12-FIX: Cap at MAX_CALC_PULLS (Step 14 — HIGH-10e)
  const safePity = Math.max(0, Math.min(MAX_PITY, Math.floor(pity) || 0));
  const safeCopies = Math.max(0, Math.floor(copies) || 0);
  const isWeapon = !isChar;
  const startGuar = guaranteed ? 1 : 0;
  
  // Use exact DP formula for probability distribution
  const dist = computeGachaDist(safePulls, isWeapon, safePity, startGuar, Math.max(safeCopies, 7));
  
  // P(X >= k) cumulative probabilities
  const pGe = (k) => getCumulativeProb(dist, k) * 100;
  
  // Expected value and standard deviation
  const stats = computeGachaStats(dist);
  
  // Expected pulls to reach target copies
  const expectedToTarget = expectedPullsToTarget(isWeapon, safeCopies, safePity, startGuar);
  
  // Worst case: hard pity every time, always losing 50/50 (subtract current pity progress)
  // Guarantee only applies to the FIRST copy — subsequent copies can still lose 50/50
  const worstCase = Math.max(0, isChar
    ? (HARD_PITY * 2 * safeCopies - (guaranteed ? HARD_PITY : 0) - safePity)
    : (HARD_PITY * safeCopies - safePity));
  const successRate = pGe(safeCopies);
  const missingPulls = Math.max(0, Math.ceil(expectedToTarget) - safePulls);
  
  // 4-star calculations (estimate: assumes hard pity every 10 pulls, ignores actual 4★ pity counter)
  // This is a floor estimate — actual 4★ count is typically higher due to base rate hits
  const fourStarCount = Math.floor(safePulls / HARD_PITY_4STAR);
  const featuredFourStarCount = Math.floor(fourStarCount * FEATURED_4STAR_RATE);
  const pity4 = safePulls % HARD_PITY_4STAR;
  
  return {
    successRate: successRate.toFixed(1),
    p1: pGe(1).toFixed(1),
    p2: pGe(2).toFixed(1),
    p3: pGe(3).toFixed(1),
    p4: pGe(4).toFixed(1),
    p5: pGe(5).toFixed(1),
    p6: pGe(6).toFixed(1),
    p7: pGe(7).toFixed(1),
    missingPulls,
    missingAstrite: missingPulls * ASTRITE_PER_PULL,
    fourStarCount,
    featuredFourStarCount,
    pity4,
    // New stats from DP formula
    expectedCopies: stats.expected.toFixed(2),
    stddev: stats.stddev.toFixed(2),
    expectedPullsToTarget: Math.ceil(expectedToTarget),
    worstCase,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════

export {
  getTimeRemaining, getEuropeOffset, getServerAdjustedEnd,
  getRecurringEventEnd, getNextDailyReset, getNextWeeklyReset,
  MAX_PITY, GACHA_EPS, BASE_5STAR_RATE, SOFT_PITY_STEPS,
  getPullRate, computeDistDP, simulateOneRun, computeDistMC,
  DP_MAX_PULLS, computeGachaDist, getCumulativeProb, computeGachaStats,
  expectedPullsToTarget, minPullsForProb,
  initialState, STORAGE_KEY, isStorageAvailable, storageAvailable,
  ALLOWED_STATE_KEYS, sanitizeStateObj, sanitizeImportedState,
  loadFromStorage, saveToStorage, reducer, calcStats,
};
