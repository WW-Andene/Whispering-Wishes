/**
 * Reducer & State Management Tests
 * Tests all reducer actions, undo system, and state transitions.
 */
import { describe, it, expect } from 'vitest';
import { reducer, createUndoReducer, initialState, ACTION, UNDOABLE_ACTIONS } from '../appcore-engine.js';

describe('Reducer — basic actions', () => {
  it('SET_SERVER changes server', () => {
    const state = reducer(initialState, { type: ACTION.SET_SERVER, server: 'Europe' });
    expect(state.server).toBe('Europe');
  });

  it('SET_CALC updates calc field', () => {
    const state = reducer(initialState, { type: ACTION.SET_CALC, field: 'astrite', value: '1000' });
    expect(state.calc.astrite).toBe('1000');
  });

  it('SET_PLANNER updates planner field', () => {
    const state = reducer(initialState, { type: ACTION.SET_PLANNER, field: 'dailyAstrite', value: 90 });
    expect(state.planner.dailyAstrite).toBe(90);
  });

  it('SET_EVENT_STATUS sets event status', () => {
    const state = reducer(initialState, { type: ACTION.SET_EVENT_STATUS, eventKey: 'dailyReset', status: 'done' });
    expect(state.eventStatus.dailyReset).toBe('done');
  });

  it('SET_EVENT_STATUS null removes status', () => {
    let state = reducer(initialState, { type: ACTION.SET_EVENT_STATUS, eventKey: 'dailyReset', status: 'done' });
    state = reducer(state, { type: ACTION.SET_EVENT_STATUS, eventKey: 'dailyReset', status: null });
    expect(state.eventStatus.dailyReset).toBeUndefined();
  });
});

describe('Reducer — income actions', () => {
  it('ADD_INCOME adds to planner and calc', () => {
    const income = { id: 'test-1', name: 'Test', astrite: 1000, radiant: 0, lustrous: 0 };
    const state = reducer(initialState, { type: ACTION.ADD_INCOME, income });
    expect(state.planner.addedIncome).toHaveLength(1);
    expect(state.planner.addedIncome[0].name).toBe('Test');
    expect(+state.calc.astrite).toBe(1000);
  });

  it('REMOVE_INCOME subtracts from calc', () => {
    const income = { id: 'test-1', name: 'Test', astrite: 500, radiant: 0, lustrous: 0 };
    let state = reducer(initialState, { type: ACTION.ADD_INCOME, income });
    state = reducer(state, { type: ACTION.REMOVE_INCOME, id: 'test-1' });
    expect(state.planner.addedIncome).toHaveLength(0);
    expect(+state.calc.astrite).toBe(0);
  });

  it('CLEAR_ALL_INCOME empties all income', () => {
    const income1 = { id: 'a', name: 'A', astrite: 300, radiant: 0, lustrous: 0 };
    const income2 = { id: 'b', name: 'B', astrite: 200, radiant: 0, lustrous: 0 };
    let state = reducer(initialState, { type: ACTION.ADD_INCOME, income: income1 });
    state = reducer(state, { type: ACTION.ADD_INCOME, income: income2 });
    expect(+state.calc.astrite).toBe(500);
    state = reducer(state, { type: ACTION.CLEAR_ALL_INCOME });
    expect(state.planner.addedIncome).toHaveLength(0);
    expect(+state.calc.astrite).toBe(0);
  });
});

describe('Reducer — team actions', () => {
  it('SET_TEAM_SLOT assigns character to team', () => {
    const state = reducer(initialState, { type: ACTION.SET_TEAM_SLOT, teamIndex: 0, slotIndex: 0, character: 'Augusta' });
    expect(state.teams[0].slots[0]).toBe('Augusta');
  });

  it('CLEAR_TEAM_SLOT removes character', () => {
    let state = reducer(initialState, { type: ACTION.SET_TEAM_SLOT, teamIndex: 0, slotIndex: 1, character: 'Verina' });
    state = reducer(state, { type: ACTION.CLEAR_TEAM_SLOT, teamIndex: 0, slotIndex: 1 });
    expect(state.teams[0].slots[1]).toBeNull();
  });

  it('CLEAR_TEAM resets all slots', () => {
    let state = reducer(initialState, { type: ACTION.SET_TEAM_SLOT, teamIndex: 0, slotIndex: 0, character: 'Encore' });
    state = reducer(state, { type: ACTION.SET_TEAM_SLOT, teamIndex: 0, slotIndex: 1, character: 'Verina' });
    state = reducer(state, { type: ACTION.CLEAR_TEAM, teamIndex: 0 });
    expect(state.teams[0].slots).toEqual([null, null, null]);
  });

  it('RENAME_TEAM changes team name', () => {
    const state = reducer(initialState, { type: ACTION.RENAME_TEAM, teamIndex: 0, name: 'My Team' });
    expect(state.teams[0].name).toBe('My Team');
  });

  it('RENAME_TEAM truncates to 20 chars', () => {
    const state = reducer(initialState, { type: ACTION.RENAME_TEAM, teamIndex: 0, name: 'A'.repeat(30) });
    expect(state.teams[0].name.length).toBe(20);
  });

  it('SET_ACTIVE_TEAM clamps to valid range', () => {
    const state = reducer(initialState, { type: ACTION.SET_ACTIVE_TEAM, index: 99 });
    expect(state.activeTeamIndex).toBeLessThanOrEqual(4);
    const state2 = reducer(initialState, { type: ACTION.SET_ACTIVE_TEAM, index: -5 });
    expect(state2.activeTeamIndex).toBeGreaterThanOrEqual(0);
  });
});

describe('Reducer — bookmark actions', () => {
  it('SAVE_BOOKMARK creates bookmark', () => {
    const state = reducer(initialState, { type: ACTION.SAVE_BOOKMARK, name: 'Test Save' });
    expect(state.bookmarks).toHaveLength(1);
    expect(state.bookmarks[0].name).toBe('Test Save');
    expect(state.bookmarks[0].id).toBeTruthy();
  });

  it('DELETE_BOOKMARK removes bookmark', () => {
    let state = reducer(initialState, { type: ACTION.SAVE_BOOKMARK, name: 'To Delete' });
    const id = state.bookmarks[0].id;
    state = reducer(state, { type: ACTION.DELETE_BOOKMARK, id });
    expect(state.bookmarks).toHaveLength(0);
  });
});

describe('Reducer — profile actions', () => {
  it('SET_USERNAME updates username', () => {
    const state = reducer(initialState, { type: ACTION.SET_USERNAME, value: 'TestUser' });
    expect(state.profile.username).toBe('TestUser');
  });

  it('CLEAR_PROFILE resets but keeps username', () => {
    let state = reducer(initialState, { type: ACTION.SET_USERNAME, value: 'Keep' });
    state = reducer(state, { type: ACTION.CLEAR_PROFILE });
    expect(state.profile.username).toBe('Keep');
    expect(state.profile.featured.history).toEqual([]);
  });

  it('RESET returns to initial state', () => {
    let state = reducer(initialState, { type: ACTION.SET_SERVER, server: 'Europe' });
    state = reducer(state, { type: ACTION.SET_USERNAME, value: 'SomeUser' });
    state = reducer(state, { type: ACTION.RESET });
    expect(state.server).toBe(initialState.server);
  });
});

describe('Reducer — unknown actions', () => {
  it('returns same state for unknown action', () => {
    const state = reducer(initialState, { type: 'NONEXISTENT_ACTION' });
    expect(state).toBe(initialState);
  });
});

describe('Undo system', () => {
  it('UNDOABLE_ACTIONS set has the expected actions', () => {
    expect(UNDOABLE_ACTIONS.has(ACTION.CLEAR_TEAM)).toBe(true);
    expect(UNDOABLE_ACTIONS.has(ACTION.CLEAR_PROFILE)).toBe(true);
    expect(UNDOABLE_ACTIONS.has(ACTION.DELETE_BOOKMARK)).toBe(true);
    expect(UNDOABLE_ACTIONS.has(ACTION.RESET)).toBe(true);
    // Non-destructive actions should NOT be undoable
    expect(UNDOABLE_ACTIONS.has(ACTION.SET_SERVER)).toBe(false);
    expect(UNDOABLE_ACTIONS.has(ACTION.SET_CALC)).toBe(false);
  });

  it('createUndoReducer wraps reducer and supports UNDO', () => {
    const undoReducer = createUndoReducer(reducer);
    // Set up state
    let state = undoReducer(initialState, { type: ACTION.SET_TEAM_SLOT, teamIndex: 0, slotIndex: 0, character: 'Augusta' });
    expect(state.teams[0].slots[0]).toBe('Augusta');
    // Clear team (undoable)
    state = undoReducer(state, { type: ACTION.CLEAR_TEAM, teamIndex: 0 });
    expect(state.teams[0].slots[0]).toBeNull();
    // Undo
    state = undoReducer(state, { type: ACTION.UNDO });
    expect(state.teams[0].slots[0]).toBe('Augusta');
  });

  it('UNDO with empty stack returns same state', () => {
    const undoReducer = createUndoReducer(reducer);
    const state = undoReducer(initialState, { type: ACTION.UNDO });
    expect(state).toBe(initialState);
  });

  it('supports multiple undos', () => {
    const undoReducer = createUndoReducer(reducer);
    let state = initialState;
    // Setup: add char, then clear (undoable), add another, clear again
    state = undoReducer(state, { type: ACTION.SET_TEAM_SLOT, teamIndex: 0, slotIndex: 0, character: 'A' });
    state = undoReducer(state, { type: ACTION.CLEAR_TEAM, teamIndex: 0 }); // snapshot: has 'A'
    state = undoReducer(state, { type: ACTION.SET_TEAM_SLOT, teamIndex: 0, slotIndex: 0, character: 'B' });
    state = undoReducer(state, { type: ACTION.CLEAR_TEAM, teamIndex: 0 }); // snapshot: has 'B'
    expect(state.teams[0].slots[0]).toBeNull();
    // Undo second clear → restores 'B'
    state = undoReducer(state, { type: ACTION.UNDO });
    expect(state.teams[0].slots[0]).toBe('B');
    // Undo first clear → restores 'A'
    state = undoReducer(state, { type: ACTION.UNDO });
    expect(state.teams[0].slots[0]).toBe('A');
  });
});
