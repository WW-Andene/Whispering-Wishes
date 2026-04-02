// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — core/reducer.js
// Action constants, undo reducer wrapper, initial state, and main reducer.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  HARD_PITY, HARD_PITY_4STAR, FEATURED_4STAR_RATE,
  LUNITE_DAILY_ASTRITE, MAX_ASTRITE,
  generateUniqueId,
} from '../appcore-data.js';
// NOTE: circular import with storage.js — safe because sanitizeImportedState
// and sanitizeStateObj are only referenced inside function bodies (reducer case
// handlers), never at module-evaluation time.
import { sanitizeImportedState, sanitizeStateObj } from './storage.js';

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
  CLEAR_PROFILE: 'CLEAR_PROFILE',
  SAVE_BOOKMARK: 'SAVE_BOOKMARK',
  LOAD_BOOKMARK: 'LOAD_BOOKMARK',
  DELETE_BOOKMARK: 'DELETE_BOOKMARK',
  SET_ACTIVE_TEAM: 'SET_ACTIVE_TEAM',
  SET_TEAM_SLOT: 'SET_TEAM_SLOT',
  CLEAR_TEAM_SLOT: 'CLEAR_TEAM_SLOT',
  CLEAR_TEAM: 'CLEAR_TEAM',
  RENAME_TEAM: 'RENAME_TEAM',
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
const MAX_UNDO_STACK = 10;
const createUndoReducer = (baseReducer) => {
  const undoStack = [];
  return (state, action) => {
    if (action.type === ACTION.UNDO) {
      return undoStack.length > 0 ? undoStack.pop() : state;
    }
    if (UNDOABLE_ACTIONS.has(action.type)) {
      if (undoStack.length >= MAX_UNDO_STACK) undoStack.shift();
      undoStack.push(state);
    }
    return baseReducer(state, action);
  };
};

// Check if undo is available (for UI)
const canUndo = () => false; // placeholder — actual check is via undoReducer closure

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
  teams: [
    { name: 'Team 1', slots: [null, null, null] },
    { name: 'Team 2', slots: [null, null, null] },
    { name: 'Team 3', slots: [null, null, null] },
    { name: 'Team 4', slots: [null, null, null] },
    { name: 'Team 5', slots: [null, null, null] },
  ],
  activeTeamIndex: 0,
  settings: { showOnboarding: true },
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION.SET_SERVER: return { ...state, server: action.server };
    case ACTION.SET_CALC: return { ...state, calc: { ...state.calc, [action.field]: action.value } };
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
      const incRad = Math.max(0, Math.floor(+action.income.radiant || 0));
      const incLus = Math.max(0, Math.floor(+action.income.lustrous || 0));
      return {
        ...state,
        planner: {
          ...state.planner,
          addedIncome: [...state.planner.addedIncome, action.income],
        },
        calc: {
          ...state.calc,
          astrite: String(Math.min(MAX_ASTRITE, (+state.calc.astrite || 0) + incAst)),
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
          astrite: String(Math.max(0, (+state.calc.astrite || 0) - item.astrite)),
          radiant: String(Math.max(0, (+state.calc.radiant || 0) - (item.radiant || 0))),
          lustrous: String(Math.max(0, (+state.calc.lustrous || 0) - (item.lustrous || 0))),
        },
      };
    }
    case ACTION.CLEAR_ALL_INCOME: {
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
    case ACTION.ADD_DAILY_INCOME: {
      const days = Math.max(0, Math.min(365, Number(action.days) || 0));
      const dailyTotal = (state.planner.dailyAstrite || 0) + (state.planner.luniteActive ? LUNITE_DAILY_ASTRITE : 0);
      const totalAstrite = dailyTotal * days;
      return { ...state, calc: { ...state.calc, astrite: String(Math.min(MAX_ASTRITE, (+state.calc.astrite || 0) + totalAstrite)) } }; // P12-FIX: Cap at MAX_ASTRITE (Step 14 — MEDIUM-10e)
    }
    // SYNC_PITY removed - calculator is fully independent from history
    case ACTION.IMPORT_HISTORY: {
      const safeUid = action.uid ? String(action.uid).slice(0, 32) : state.profile.uid;
      const newProfile = { ...state.profile, importedAt: new Date().toISOString(), uid: safeUid };
      
      // Deduplicate: merge new history with existing, filtering out entries that match by timestamp + name + rarity
      // P9-FIX: Added rarity and id to dedup key to reduce collision risk for duplicate 3★ weapons (Step 4 audit)
      const deduplicateMerge = (existing, incoming) => {
        if (!Array.isArray(incoming) || incoming.length === 0) return existing || [];
        if (!Array.isArray(existing) || existing.length === 0) return incoming;
        const makeKey = (p) => `${p.timestamp || ''}|${p.name || ''}|${p.rarity || ''}|${p.id || ''}`;
        const existingKeys = new Set(existing.map(makeKey));
        const newEntries = incoming.filter(p => !existingKeys.has(makeKey(p)));
        if (newEntries.length === 0) return existing; // All duplicates
        // Re-sort merged history by timestamp
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
          guaranteed: hadNewEntries ? (lastFive?.won5050 === false) : (state.profile.featured?.guaranteed ?? false)
        };
      } else if (action.bannerType === 'weapon') {
        const merged = deduplicateMerge(state.profile.weapon?.history, action.history);
        const hadNewEntries = merged !== state.profile.weapon?.history;
        const { pity5, pity4 } = hadNewEntries ? recalcPity(merged) : { pity5: state.profile.weapon?.pity5 ?? 0, pity4: state.profile.weapon?.pity4 ?? 0 };
        newProfile.weapon = { history: merged, pity5, pity4 };
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
    case ACTION.CLEAR_PROFILE: return { ...state, profile: { ...initialState.profile, username: state.profile.username, profilePic: state.profile.profilePic } };
    case ACTION.SAVE_BOOKMARK: return { ...state, bookmarks: [...state.bookmarks, { id: generateUniqueId(), name: action.name, timestamp: new Date().toISOString(), ...state.calc }] };
    case ACTION.LOAD_BOOKMARK: {
      const b = state.bookmarks.find(bm => bm.id === action.id);
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
    case ACTION.IMPORT_TEAMS: {
      if (!Array.isArray(action.teams) || action.teams.length !== 5) return state;
      const teams = action.teams.map((t, i) => {
        const rawSlots = Array.isArray(t?.slots) ? t.slots.slice(0, 3).map(s => typeof s === 'string' ? s : null) : [null, null, null];
        const seen = new Set();
        const slots = rawSlots.map(s => { if (s && seen.has(s)) return null; if (s) seen.add(s); return s; });
        return { name: (t?.name || `Team ${i + 1}`).slice(0, 20), slots };
      });
      return { ...state, teams, activeTeamIndex: Math.max(0, Math.min(4, action.activeTeamIndex ?? state.activeTeamIndex)) };
    }
    // P9-FIX: Merge with initialState to ensure no missing fields from older schemas (Step 4 audit)
    case ACTION.LOAD_STATE: return { ...initialState, ...sanitizeImportedState(action.state) }; // P10-FIX: Sanitize to prevent prototype pollution (Step 6 audit)
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
