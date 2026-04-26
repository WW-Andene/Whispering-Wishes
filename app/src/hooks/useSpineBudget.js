// Caps simultaneous spine WebGL contexts to protect against the browser's
// hard limit (Chrome ~16, Firefox ~8). When more spine players are visible
// at once than the cap, the latecomers fall through to their static portrait
// fallback until a slot frees up.
//
// Slots are claimed when a component wants to render live spine and the
// component is currently in the viewport; released when either condition
// flips. First-come-first-served — no eviction. Combined with viewport
// gating, slots flow naturally as cards scroll in and out.

import { useEffect, useState } from 'react';

// Conservative cap. Chrome lets you create 16 WebGL contexts before evicting,
// but spine-player carries enough overhead that 8+ active contexts already
// stutter on lower-end hardware. Six is a safe floor across mobile + desktop.
const MAX_CONCURRENT = 6;

const occupied = new Set();
const waiters = []; // [{ id, onGranted }]

function tryGrant(id, onGranted) {
  if (occupied.has(id)) {
    onGranted(true);
    return;
  }
  if (occupied.size < MAX_CONCURRENT) {
    occupied.add(id);
    onGranted(true);
    return;
  }
  waiters.push({ id, onGranted });
  onGranted(false);
}

function release(id) {
  if (occupied.has(id)) {
    occupied.delete(id);
    while (waiters.length > 0 && occupied.size < MAX_CONCURRENT) {
      const next = waiters.shift();
      occupied.add(next.id);
      try { next.onGranted(true); } catch {}
    }
    return;
  }
  const idx = waiters.findIndex((w) => w.id === id);
  if (idx >= 0) waiters.splice(idx, 1);
}

export function useSpineBudget(id, wanted) {
  const [granted, setGranted] = useState(false);
  useEffect(() => {
    if (!wanted || !id) {
      release(id);
      setGranted(false);
      return undefined;
    }
    tryGrant(id, setGranted);
    return () => release(id);
  }, [id, wanted]);
  return granted;
}

// Test/admin only — current occupancy snapshot.
export function getSpineBudgetSnapshot() {
  return { active: occupied.size, waiting: waiters.length, max: MAX_CONCURRENT };
}
