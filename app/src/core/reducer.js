// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/reducer.js
// Action constants, undo reducer wrapper, initial state, and main reducer.
// ═══════════════════════════════════════════════════════════════════════════════

import { HARD_PITY, HARD_PITY_4STAR, LUNITE_DAILY_ASTRITE, MAX_ASTRITE } from '../data/constants.js';
import { generateUniqueId } from '../utils/generateId.js';
// Sanitizers moved to dedicated leaf module (P1-08 audit fix) — formerly this
// line imported from ./storage.js, which created a reducer.js ↔ storage.js cycle.
// The cycle was documented-safe but fragile: any future module-eval-time reference
// to exports of the other file would have produced a silent TDZ bug.
import { sanitizeImportedState } from './stateSanitizer.js';

// P15-FIX: MEDIUM-12 — Action type constants to prevent silent typo failures in dispatch calls
const ACTION = Object.freeze({
  SET_SERVER: 'SET_SERVER',
  SET_CALC: 'SET_CALC',
  SET_PLANNER: 'SET_PLANNER',
  SET_SETTINGS: 'SET_SETTINGS',
  SET_EVENT_STATUS: 'SET_EVENT_STATUS',
  ADD_INCOME: 'ADD_INCOME',
  REMOVE_INCOME: 'REMOVE_INCOME',
  CLEAR_ALL_INCOME: 'CLEAR_ALL_INCOME',
  ADD_DAILY_INCOME: 'ADD_DAILY_INCOME',
  IMPORT_HISTORY: 'IMPORT_HISTORY',
  SET_UID: 'SET_UID',
  SET_USERNAME: 'SET_USERNAME',
  SET_PROFILE_PIC: 'SET_PROFILE_PIC',
  SET_WALLPAPER_ASSET: 'SET_WALLPAPER_ASSET',
  CLEAR_PROFILE: 'CLEAR_PROFILE',
  SAVE_BOOKMARK: 'SAVE_BOOKMARK',
  LOAD_BOOKMARK: 'LOAD_BOOKMARK',
  DELETE_BOOKMARK: 'DELETE_BOOKMARK',
  SET_ACTIVE_TEAM: 'SET_ACTIVE_TEAM',
  SET_TEAM_SLOT: 'SET_TEAM_SLOT',
  CLEAR_TEAM_SLOT: 'CLEAR_TEAM_SLOT',
  CLEAR_TEAM: 'CLEAR_TEAM',
  RENAME_TEAM: 'RENAME_TEAM',
  SET_TEAM_MAIN_DPS: 'SET_TEAM_MAIN_DPS',
  IMPORT_TEAMS: 'IMPORT_TEAMS',
  LOAD_STATE: 'LOAD_STATE',
  RESET: 'RESET',
  UNDO: 'UNDO',
});

// Destructive actions that support undo
const UNDOABLE_ACTIONS = new Set([
  ACTION.CLEAR_TEAM, ACTION.CLEAR_TEAM_SLOT, ACTION.CLEAR_PROFILE,
  ACTION.CLEAR_ALL_INCOME, ACTION.REMOVE_INCOME, ACTION.DELETE_BOOKMARK, ACTION.RESET,
]);

// Undo-aware reducer wrapper: snapshots state before destructive actions
const MAX_UNDO_STACK = 5;
const createUndoReducer = (baseReducer) => {
  const undoStack = [];
  return (state, action) => {
    if (action.type === ACTION.UNDO) {
      return undoStack.length > 0 ? undoStack.pop() : state;
    }
    if (UNDOABLE_ACTIONS.has(action.type)) {
      if (undoStack.length >= MAX_UNDO_STACK) undoStack.shift();
      // P11-01 audit fix: prefer native structuredClone (2-3× faster on large
      // states, no round-trip through string); fall back to JSON deep-clone
      // for environments that lack it. Both paths produce identical plain-JSON
      // snapshots for this state shape (no Dates, Maps, or class instances).
      undoStack.push(typeof structuredClone === 'function' ? structuredClone(state) : JSON.parse(JSON.stringify(state)));
    }
    return baseReducer(state, action);
  };
};

// [SECTION:STATE]
const initialState = {
  server: 'Asia',
  profile: {
    uid: '', importedAt: null,
    username: '', // User-set display name
    profilePic: '', // Character name for profile pic (from collection) or '' for default icon
    featured: { history: [], pity5: 0, pity4: 0, guaranteed: false, guaranteed4Star: false },
    weapon: { history: [], pity5: 0, pity4: 0, guaranteed4Star: false },
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
    astrite: '', lunite: '', radiant: '', forging: '', lustrous: '',
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
  teams: [
    { name: 'Team 1', slots: [null, null, null], mainDpsOverride: null },
    { name: 'Team 2', slots: [null, null, null], mainDpsOverride: null },
    { name: 'Team 3', slots: [null, null, null], mainDpsOverride: null },
    { name: 'Team 4', slots: [null, null, null], mainDpsOverride: null },
    { name: 'Team 5', slots: [null, null, null], mainDpsOverride: null },
  ],
  activeTeamIndex: 0,
  settings: { showOnboarding: true },
};

// P4-19 audit fix: per-field numeric bounds for SET_CALC. UI already clamps
// allocPriority to 0-100, but a bypassed UI (replay of a stale action, programmatic
// dispatch) would otherwise admit any value. This enforces the invariant at the
// reducer — the cheapest place to defend it.
const CALC_FIELD_BOUNDS = Object.freeze({
  // 0-100 sliders
  allocPriority:    { min: 0,   max: 100 },
  stdAllocPriority: { min: 0,   max: 100 },
  // Pity counters: 0..HARD_PITY (80) for 5★, 0..HARD_PITY_4STAR (10) for 4★
  charPity:         { min: 0,   max: 80 },
  weapPity:         { min: 0,   max: 80 },
  stdCharPity:      { min: 0,   max: 80 },
  stdWeapPity:      { min: 0,   max: 80 },
  // Copies targets: defensive cap at MAX_CALC_PULLS/40 = 50 (even S6 + sig is 7+7=14)
  charCopies:          { min: 1,   max: 50 },
  weapCopies:          { min: 1,   max: 50 },
  stdCharCopies:       { min: 1,   max: 50 },
  stdWeapCopies:       { min: 1,   max: 50 },
  char4StarCopies:     { min: 1,   max: 99 },
  weap4StarCopies:     { min: 1,   max: 99 },
  stdChar4StarCopies:  { min: 1,   max: 99 },
  stdWeap4StarCopies:  { min: 1,   max: 99 },
});
const _clampCalcField = (field, value) => {
  const bounds = CALC_FIELD_BOUNDS[field];
  if (!bounds) return value; // fields not in the map (strings like astrite, booleans) pass through
  const n = Number(value);
  if (!Number.isFinite(n)) return bounds.min;
  return Math.max(bounds.min, Math.min(bounds.max, Math.round(n)));
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION.SET_SERVER: return { ...state, server: action.server };
    case ACTION.SET_CALC: {
      if (action.field === '__reset') return { ...state, calc: { ...initialState.calc } };
      const value = _clampCalcField(action.field, action.value);
      return { ...state, calc: { ...state.calc, [action.field]: value } };
    }
    case ACTION.SET_PLANNER: return { ...state, planner: { ...state.planner, [action.field]: action.value } };
    case ACTION.SET_SETTINGS: return { ...state, settings: { ...state.settings, [action.field]: action.value } };
    case ACTION.SET_EVENT_STATUS: {
      const newStatus = { ...state.eventStatus };
      if (action.status === null) { delete newStatus[action.eventKey]; } 
      else { newStatus[action.eventKey] = action.status; }
      return { ...state, eventStatus: newStatus };
    }
    case ACTION.ADD_INCOME: {
      const incAst = Math.max(0, Math.floor(+action.income.astrite || 0));
      const incLun = Math.max(0, Math.floor(+action.income.lunite || 0));
      const incRad = Math.max(0, Math.floor(+action.income.radiant || 0));
      const incLus = Math.max(0, Math.floor(+action.income.lustrous || 0));
      return {
        ...state,
        planner: {
          ...state.planner,
          addedIncome: [...state.planner.addedIncome, { ...action.income, astrite: incAst, lunite: incLun, radiant: incRad, lustrous: incLus }],
        },
        calc: {
          ...state.calc,
          astrite: String(Math.min(MAX_ASTRITE, (+state.calc.astrite || 0) + incAst)),
          lunite: String(Math.min(MAX_ASTRITE, (+state.calc.lunite || 0) + incLun)),
          radiant: String((+state.calc.radiant || 0) + incRad),
          lustrous: String((+state.calc.lustrous || 0) + incLus),
        },
      };
    }
    case ACTION.REMOVE_INCOME: {
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
          astrite: String(Math.max(0, (+state.calc.astrite || 0) - (item.astrite || 0))),
          lunite: String(Math.max(0, (+state.calc.lunite || 0) - (item.lunite || 0))),
          radiant: String(Math.max(0, (+state.calc.radiant || 0) - (item.radiant || 0))),
          lustrous: String(Math.max(0, (+state.calc.lustrous || 0) - (item.lustrous || 0))),
        },
      };
    }
    case ACTION.CLEAR_ALL_INCOME: {
      const totalAst = state.planner.addedIncome.reduce((s, i) => s + (i.astrite || 0), 0);
      const totalLun = state.planner.addedIncome.reduce((s, i) => s + (i.lunite || 0), 0);
      const totalRad = state.planner.addedIncome.reduce((s, i) => s + (i.radiant || 0), 0);
      const totalLus = state.planner.addedIncome.reduce((s, i) => s + (i.lustrous || 0), 0);
      return {
        ...state,
        planner: { ...state.planner, addedIncome: [] },
        calc: {
          ...state.calc,
          astrite: String(Math.max(0, (+state.calc.astrite || 0) - totalAst)),
          lunite: String(Math.max(0, (+state.calc.lunite || 0) - totalLun)),
          radiant: String(Math.max(0, (+state.calc.radiant || 0) - totalRad)),
          lustrous: String(Math.max(0, (+state.calc.lustrous || 0) - totalLus)),
        },
      };
    }
    case ACTION.ADD_DAILY_INCOME: {
      const days = Math.max(0, Math.min(365, Number(action.days) || 0));
      const dailyTotal = (state.planner.dailyAstrite || 0) + (state.planner.luniteActive ? LUNITE_DAILY_ASTRITE : 0);
      const totalAstrite = dailyTotal * days;
      return { ...state, calc: { ...state.calc, astrite: String(Math.min(MAX_ASTRITE, (+state.calc.astrite || 0) + totalAstrite)) } }; // P12-FIX: Cap at MAX_ASTRITE (Step 14 — MEDIUM-10e)
    }
    // SYNC_PITY removed - calculator is fully independent from history
    case ACTION.IMPORT_HISTORY: {
      // P2-07 audit fix: WuWa player IDs are numeric (observed data).
      // Previously `safeUid` was any string truncated to 32 chars — could store
      // control chars / whitespace. Now coerce to digits only; if nothing is left,
      // keep the existing uid (same fallback behavior for empty input as before).
      const rawUid = action.uid ? String(action.uid).replace(/[^0-9]/g, '').slice(0, 32) : '';
      const safeUid = rawUid || state.profile.uid;
      const newProfile = { ...state.profile, importedAt: new Date().toISOString(), uid: safeUid };
      
      // Deduplicate: merge new history with existing, filtering out entries that match by timestamp + name + rarity
      // P9-FIX: Added rarity and id to dedup key to reduce collision risk for duplicate 3★ weapons (Step 4 audit)
      const deduplicateMerge = (existing, incoming) => {
        if (!Array.isArray(incoming) || incoming.length === 0) return existing || [];
        if (!Array.isArray(existing) || existing.length === 0) return incoming;
        // Cross-source dedup (API French + WuWaTracker English):
        // Same pull has different names (language), timestamps (off by ~1h timezone),
        // but same resourceId. Use resourceId + rounded timestamp to match across
        // sources while distinguishing truly different pulls.
        // P2-05 audit fix: renamed from TWO_HOURS — the 2h window's purpose is to
        // bridge timezone-drift between API sources, not "2 hours" as a semantic unit.
        const TIMEZONE_WINDOW_MS = 7200000;
        const makeKey = (p) => {
          const tsMs = new Date(p.timestamp || 0).getTime();
          const timeSlot = Math.round(tsMs / TIMEZONE_WINDOW_MS);
          if (p.id && !p.id.startsWith('imp_')) {
            // Extract resourceId from "1210_1738903202000"
            const resId = p.id.split('_')[0];
            if (resId && resId !== p.id) return `${resId}|${timeSlot}`;
          }
          // Fallback: name + hour-rounded timestamp + rarity
          return `${p.name || ''}|${timeSlot}|${p.rarity || ''}`;
        };
        const existingKeys = new Set(existing.map(makeKey));
        const newEntries = incoming.filter(p => !existingKeys.has(makeKey(p)));
        if (newEntries.length === 0) return existing; // All duplicates
        return [...existing, ...newEntries].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      };
      
      // FIX #4: Recalculate pity from MERGED history (not just import batch)
      const recalcPity = (history) => {
        let pity5 = 0, pity4 = 0;
        for (let i = history.length - 1; i >= 0; i--) {
          if (history[i].rarity === 5) break;
          pity5++;
        }
        for (let i = history.length - 1; i >= 0; i--) {
          if (history[i].rarity >= 4) break;
          pity4++;
        }
        return { pity5: Math.min(pity5, HARD_PITY), pity4: Math.min(pity4, HARD_PITY_4STAR) };
      };

      if (action.bannerType === 'featured') {
        const merged = deduplicateMerge(state.profile.featured?.history, action.history);
        const hadNewEntries = merged !== state.profile.featured?.history;
        const { pity5, pity4 } = hadNewEntries ? recalcPity(merged) : { pity5: state.profile.featured?.pity5 ?? 0, pity4: state.profile.featured?.pity4 ?? 0 };
        const fiveStars = merged.filter(p => p.rarity === 5);
        const lastFive = fiveStars[fiveStars.length - 1];
        newProfile.featured = {
          history: merged, pity5, pity4,
          // P2-F004: Guard against empty 5-star history — preserve existing guarantee state if no 5-stars found
          guaranteed: hadNewEntries ? (fiveStars.length > 0 ? (lastFive?.won5050 === false) : (state.profile.featured?.guaranteed ?? false)) : (state.profile.featured?.guaranteed ?? false),
          guaranteed4Star: hadNewEntries ? (action.guaranteed4Star ?? false) : (state.profile.featured?.guaranteed4Star ?? false),
        };
      } else if (action.bannerType === 'weapon') {
        const merged = deduplicateMerge(state.profile.weapon?.history, action.history);
        const hadNewEntries = merged !== state.profile.weapon?.history;
        const { pity5, pity4 } = hadNewEntries ? recalcPity(merged) : { pity5: state.profile.weapon?.pity5 ?? 0, pity4: state.profile.weapon?.pity4 ?? 0 };
        newProfile.weapon = {
          history: merged, pity5, pity4,
          guaranteed4Star: hadNewEntries ? (action.guaranteed4Star ?? false) : (state.profile.weapon?.guaranteed4Star ?? false),
        };
      } else if (action.bannerType === 'standardChar') {
        const merged = deduplicateMerge(state.profile.standardChar?.history, action.history);
        const hadNewEntries = merged !== state.profile.standardChar?.history;
        const { pity5, pity4 } = hadNewEntries ? recalcPity(merged) : { pity5: state.profile.standardChar?.pity5 ?? 0, pity4: state.profile.standardChar?.pity4 ?? 0 };
        newProfile.standardChar = { history: merged, pity5, pity4 };
      } else if (action.bannerType === 'standardWeap') {
        const merged = deduplicateMerge(state.profile.standardWeap?.history, action.history);
        const hadNewEntries = merged !== state.profile.standardWeap?.history;
        const { pity5, pity4 } = hadNewEntries ? recalcPity(merged) : { pity5: state.profile.standardWeap?.pity5 ?? 0, pity4: state.profile.standardWeap?.pity4 ?? 0 };
        newProfile.standardWeap = { history: merged, pity5, pity4 };
      } else if (action.bannerType === 'beginner') {
        const merged = deduplicateMerge(state.profile.beginner?.history, action.history);
        const hadNewEntries = merged !== state.profile.beginner?.history;
        const { pity5, pity4 } = hadNewEntries ? recalcPity(merged) : { pity5: state.profile.beginner?.pity5 ?? 0, pity4: state.profile.beginner?.pity4 ?? 0 };
        newProfile.beginner = { history: merged, pity5, pity4 };
      }
      return { ...state, profile: newProfile };
    }
    case ACTION.SET_UID: return { ...state, profile: { ...state.profile, uid: action.uid } };
    case ACTION.SET_USERNAME: return { ...state, profile: { ...state.profile, username: action.value } };
    case ACTION.SET_PROFILE_PIC: return { ...state, profile: { ...state.profile, profilePic: action.value } };
    // Picked via a small icon on a CollectionGrid card (mirrors profilePic's own crown icon)
    // — just remembers WHICH asset is selected; actually applying it to the phone's home/lock
    // screen happens from ProfileTab's WallpaperCard, since that's a native one-shot action
    // (WallpaperManager.setBitmap), not app state to keep in sync with.
    case ACTION.SET_WALLPAPER_ASSET: return { ...state, profile: { ...state.profile, wallpaperAsset: action.value } };
    case ACTION.CLEAR_PROFILE: return { ...state, profile: { ...initialState.profile, username: state.profile.username, profilePic: state.profile.profilePic } };
    case ACTION.SAVE_BOOKMARK: return { ...state, bookmarks: [...state.bookmarks, { id: generateUniqueId(), name: action.name, timestamp: new Date().toISOString(), ...state.calc }] };
    case ACTION.LOAD_BOOKMARK: {
      const b = state.bookmarks.find(bm => bm?.id === action.id);
      if (!b) return state;
      // P9-FIX: Restore ALL saved calc fields, not just a subset (Step 4 audit)
      // Bookmarks save ...state.calc, so we restore every calc field that was captured.
      // Destructure out non-calc metadata, validate remaining fields against known calc keys.
      const { id: _id, name: _name, timestamp: _ts, ...savedCalc } = b;
      // Only spread fields that exist in initialState.calc to prevent state pollution
      const validCalc = {};
      for (const key of Object.keys(savedCalc)) {
        if (key in initialState.calc) validCalc[key] = savedCalc[key];
      }
      return {
        ...state,
        calc: {
          ...state.calc,
          ...validCalc,
        },
      };
    }
    case ACTION.DELETE_BOOKMARK: return { ...state, bookmarks: state.bookmarks.filter(b => b.id !== action.id) };
    // Team builder actions
    case ACTION.SET_ACTIVE_TEAM: return { ...state, activeTeamIndex: Math.max(0, Math.min(4, action.index)) };
    case ACTION.SET_TEAM_SLOT: {
      const teams = state.teams.map((t, i) => i === action.teamIndex
        ? { ...t, slots: t.slots.map((s, j) => j === action.slotIndex ? action.character : s) }
        : t
      );
      return { ...state, teams };
    }
    case ACTION.CLEAR_TEAM_SLOT: {
      const teams = state.teams.map((t, i) => i === action.teamIndex
        ? { ...t, slots: t.slots.map((s, j) => j === action.slotIndex ? null : s) }
        : t
      );
      return { ...state, teams };
    }
    case ACTION.CLEAR_TEAM: {
      const teams = state.teams.map((t, i) => i === action.teamIndex
        ? { ...t, slots: [null, null, null] }
        : t
      );
      return { ...state, teams };
    }
    case ACTION.RENAME_TEAM: {
      const teams = state.teams.map((t, i) => i === action.teamIndex
        ? { ...t, name: (action.name || '').slice(0, 20) || t.name }
        : t
      );
      return { ...state, teams };
    }
    // Manually picks which team member the DPS calculator treats as the headline "Main DPS" —
    // needed for dual-Main-DPS-role team comps, where the auto-detect (first Main DPS in slot order)
    // has no way to know which one the player actually wants optimized around. Pass name: null to
    // clear the override and fall back to auto-detect.
    case ACTION.SET_TEAM_MAIN_DPS: {
      const teams = state.teams.map((t, i) => i === action.teamIndex
        ? { ...t, mainDpsOverride: action.name || null }
        : t
      );
      return { ...state, teams };
    }
    case ACTION.IMPORT_TEAMS: {
      if (!Array.isArray(action.teams) || action.teams.length !== 5) return state;
      const teams = action.teams.map((t, i) => {
        const rawSlots = Array.isArray(t?.slots) ? t.slots.slice(0, 3).map(s => typeof s === 'string' ? s : null) : [null, null, null];
        const seen = new Set();
        const slots = rawSlots.map(s => { if (s && seen.has(s)) return null; if (s) seen.add(s); return s; });
        return { name: (t?.name || `Team ${i + 1}`).slice(0, 20), slots, mainDpsOverride: typeof t?.mainDpsOverride === 'string' ? t.mainDpsOverride : null };
      });
      return { ...state, teams, activeTeamIndex: Math.max(0, Math.min(4, action.activeTeamIndex ?? state.activeTeamIndex)) };
    }
    // P9-FIX: Merge with initialState to ensure no missing fields from older schemas (Step 4 audit)
    case ACTION.LOAD_STATE: {
      // P10-FIX: Sanitize to prevent prototype pollution (Step 6 audit)
      const loaded = { ...initialState, ...sanitizeImportedState(action.state) };
      // P2-F005: Validate team array length (matches loadFromStorage validation)
      if (!Array.isArray(loaded.teams) || loaded.teams.length !== 5) loaded.teams = initialState.teams;
      loaded.activeTeamIndex = typeof loaded.activeTeamIndex === 'number' ? Math.max(0, Math.min(4, loaded.activeTeamIndex)) : 0;
      return loaded;
    }
    case ACTION.RESET: return initialState;
    default: {
      if (typeof action.type === 'string' && !Object.values(ACTION).includes(action.type)) {
        console.warn(`[WW] Unknown action type: "${action.type}"`);
      }
      return state;
    }
  }
};

export {
  ACTION, UNDOABLE_ACTIONS,
  createUndoReducer,
  initialState,
  reducer,
};
