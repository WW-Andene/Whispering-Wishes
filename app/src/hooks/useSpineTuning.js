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

// ─── Per-character unfreeze set ──────────────────────────────────────────────
// Every sprite defaults to FROZEN (renders the static portrait instead of
// spawning a WebGL context). Characters explicitly unfrozen in the admin
// mini panel render the live spine animation. This caps concurrent WebGL
// contexts at however many the user has chosen to animate — normally one or
// two at tuning time — and prevents the 50-context crash.

const UNFROZEN_KEY = 'ww-spine-unfrozen';
const unfrozenListeners = new Set();
let unfrozenCache = null;

function readUnfrozen() {
  if (unfrozenCache) return unfrozenCache;
  try {
    const arr = JSON.parse(localStorage.getItem(UNFROZEN_KEY) || '[]');
    unfrozenCache = new Set(Array.isArray(arr) ? arr : []);
  } catch {
    unfrozenCache = new Set();
  }
  return unfrozenCache;
}

function writeUnfrozen(next) {
  unfrozenCache = next;
  try { localStorage.setItem(UNFROZEN_KEY, JSON.stringify([...next])); } catch {}
  unfrozenListeners.forEach((fn) => { try { fn(next); } catch {} });
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== UNFROZEN_KEY) return;
    try {
      const arr = JSON.parse(e.newValue || '[]');
      unfrozenCache = new Set(Array.isArray(arr) ? arr : []);
    } catch {
      unfrozenCache = new Set();
    }
    unfrozenListeners.forEach((fn) => { try { fn(unfrozenCache); } catch {} });
  });
}

export function useSpineUnfrozen(id) {
  const [unfrozen, setUnfrozen] = useState(() => !!id && readUnfrozen().has(id));
  useEffect(() => {
    const fn = (set) => setUnfrozen(!!id && set.has(id));
    unfrozenListeners.add(fn);
    return () => unfrozenListeners.delete(fn);
  }, [id]);
  const toggle = useCallback(() => {
    if (!id) return;
    const current = new Set(readUnfrozen());
    if (current.has(id)) current.delete(id); else current.add(id);
    writeUnfrozen(current);
  }, [id]);
  const set = useCallback((v) => {
    if (!id) return;
    const current = new Set(readUnfrozen());
    if (v) current.add(id); else current.delete(id);
    writeUnfrozen(current);
  }, [id]);
  return [unfrozen, toggle, set];
}
