// Per-character spine tuning overrides (scale / tx / ty) backed by
// localStorage. Shared between SpinePlayer (reads current values) and
// AdminMiniPanel (writes via sliders). Updates propagate within the same
// tab via a module-level listener set; cross-tab via the storage event.

import { useCallback, useEffect, useState } from 'react';

const KEY = 'ww-spine-tuning';
const listeners = new Set();
let cache = null;

function readAll() {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    cache = {};
  }
  return cache;
}

function writeAll(next) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((fn) => {
    try { fn(next); } catch {}
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    try {
      cache = JSON.parse(e.newValue || '{}') || {};
    } catch {
      cache = {};
    }
    listeners.forEach((fn) => {
      try { fn(cache); } catch {}
    });
  });
}

export function useSpineTuning(id) {
  const [values, setValues] = useState(() => readAll()[id] || {});
  useEffect(() => {
    const fn = (next) => setValues(next[id] || {});
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, [id]);
  const set = useCallback(
    (updates) => {
      const all = readAll();
      const prev = all[id] || {};
      writeAll({ ...all, [id]: { ...prev, ...updates } });
    },
    [id],
  );
  const reset = useCallback(() => {
    const all = readAll();
    const { [id]: _, ...rest } = all;
    writeAll(rest);
  }, [id]);
  return [values, set, reset];
}

export function getAllSpineTuning() {
  return readAll();
}

// ─── Global freeze toggle ────────────────────────────────────────────────────
// Set to true to pause every live spine player's animation state (timeScale=0
// after the first frame). Tuning-friendly: static frame to line up against
// without RAF/GPU pressure. Same localStorage+listener pattern as tuning.

const FREEZE_KEY = 'ww-spine-frozen';
const freezeListeners = new Set();
let freezeCache = null;

function readFreeze() {
  if (freezeCache !== null) return freezeCache;
  try {
    freezeCache = localStorage.getItem(FREEZE_KEY) === '1';
  } catch {
    freezeCache = false;
  }
  return freezeCache;
}

function writeFreeze(next) {
  freezeCache = !!next;
  try {
    if (freezeCache) localStorage.setItem(FREEZE_KEY, '1');
    else localStorage.removeItem(FREEZE_KEY);
  } catch {}
  freezeListeners.forEach((fn) => {
    try { fn(freezeCache); } catch {}
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== FREEZE_KEY) return;
    freezeCache = e.newValue === '1';
    freezeListeners.forEach((fn) => {
      try { fn(freezeCache); } catch {}
    });
  });
}

export function useSpineFreeze() {
  const [frozen, setFrozen] = useState(() => readFreeze());
  useEffect(() => {
    const fn = (next) => setFrozen(next);
    freezeListeners.add(fn);
    return () => freezeListeners.delete(fn);
  }, []);
  const toggle = useCallback(() => writeFreeze(!readFreeze()), []);
  const set = useCallback((v) => writeFreeze(v), []);
  return [frozen, toggle, set];
}
