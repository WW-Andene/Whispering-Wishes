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
