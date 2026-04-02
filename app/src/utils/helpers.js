// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — utils/helpers.js
// Utility functions: haptic feedback, ID generation, luck rating, element colors
// ═══════════════════════════════════════════════════════════════════════════════

import { ECHO_SETS, ECHO_DATA } from '../data/echoes.js';

// Haptic feedback utility — fails silently on unsupported devices
const haptic = {
  light: () => { navigator?.vibrate?.(10); },
  medium: () => { navigator?.vibrate?.(25); },
  heavy: () => { navigator?.vibrate?.(50); },
  success: () => { navigator?.vibrate?.([15, 50, 15]); },
  warning: () => { navigator?.vibrate?.([30, 30, 30]); },
  error: () => { navigator?.vibrate?.([50, 50, 80]); },
};


// Unique ID generator (used by toast & reducer)
// P12-FIX: Monotonic counter prevents ID collisions in the crypto.randomUUID fallback path
// (same-millisecond calls to Date.now() would otherwise produce identical IDs) (Step 12 audit — LOW-12n)
let __uniqueIdCounter = 0;
const generateUniqueId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return crypto.randomUUID(); } catch {}
  }
  // 5.3 fix: CSPRNG fallback (crypto.getRandomValues is older/wider than randomUUID)
  try {
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    return `${Date.now()}-${++__uniqueIdCounter}-${Array.from(arr, b => b.toString(36)).join('')}`;
  } catch {
    return `${Date.now()}-${++__uniqueIdCounter}-${Math.random().toString(36).slice(2)}`;
  }
};

// [SECTION:LUCK]
// Luck rating: maps average pity to a percentile using a normal distribution.
// Theoretical parameters derived from WuWa's rate function (0.8% base, soft pity 65–79, hard pity 80):
//   Mean pity at 5★ = 53.5 pulls, Std dev = 22.7 pulls (single draw).
// For N 5★ pulls, the sample mean has std dev = 22.7/√N (central limit theorem).
// We use max(N, 3) to avoid extreme percentiles from tiny samples.
// Computed from app's soft pity model: SOFT_PITY_START=64, HARD_PITY=80, BASE_RATE=0.8%
const LUCK_MEAN_PITY = 53.0;
const LUCK_STD_DEV_SINGLE = 22.4;

const calculateLuckRating = (avgPity, numFiveStars) => {
  if (!avgPity || avgPity === '—') return null;
  const avg = parseFloat(avgPity);
  if (isNaN(avg) || avg <= 0) return null;

  // Sample-size adjusted std dev: shrinks with more data points
  const n = Math.max(numFiveStars || 1, 3); // floor of 3 to prevent extreme swings
  const adjustedStd = LUCK_STD_DEV_SINGLE / Math.sqrt(n);

  // Inverted: lower avg pity = luckier = higher z-score/percentile
  const zScore = (LUCK_MEAN_PITY - avg) / adjustedStd;

  // Abramowitz & Stegun approximation of normal CDF (accurate to ±0.0005)
  const absZ = Math.abs(zScore);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989422804014327; // 1/√(2π)
  const p = d * Math.exp(-absZ * absZ / 2) * (t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))));
  const cdf = zScore >= 0 ? 1 - p : p;
  const percentile = Math.min(99, Math.max(1, Math.round(cdf * 100)));

  // WuWa-themed rank names (5 tiers for better distribution)
  if (percentile >= 90) return { rating: 'Arbiter', color: '#edaf18', tier: 'S+', percentile };
  if (percentile >= 70) return { rating: 'Sentinel', color: '#a855f7', tier: 'S', percentile };
  if (percentile >= 40) return { rating: 'Resonator', color: '#3b82f6', tier: 'A', percentile };
  if (percentile >= 20) return { rating: 'Drifter', color: '#6b7280', tier: 'B', percentile };
  return { rating: 'Civilian', color: '#ef4444', tier: 'C', percentile };
};

// ═══════════════════════════════════════════════════════════════════════════════
// ELEMENT COLOR UTILITIES — Single source of truth for element→color mappings
// P6-FIX: Consolidates 3 duplicate inline copies (F-P6-046)
// ═══════════════════════════════════════════════════════════════════════════════
const ELEMENT_COLORS = {
  Fusion:  { hex: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)' },
  Electro: { hex: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)' },
  Aero:    { hex: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)' },
  Glacio:  { hex: '#06b6d4', bg: 'rgba(6,182,212,0.15)',  border: 'rgba(6,182,212,0.4)' },
  Havoc:   { hex: '#ec4899', bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)' },
  Spectro: { hex: '#edaf18', bg: 'rgba(237,175,24,0.15)',  border: 'rgba(237,175,24,0.4)' }, /* MED-1: brand gold */
  Heal:    { hex: '#22c55e', bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)' },
  Support: { hex: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.4)' },
  ATK:     { hex: '#ef4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)' },
  Shield:  { hex: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)' },
  Physical:{ hex: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)' },
};
const getElementColor = (el) => ELEMENT_COLORS[el]?.hex || '#6b7280';
const getElementBg = (el) => ELEMENT_COLORS[el]?.bg || 'rgba(107,114,128,0.15)';
const getElementBorder = (el) => ELEMENT_COLORS[el]?.border || 'rgba(107,114,128,0.4)';
// Get element color for a sonata set name
const getSetElementColor = (setName) => {
  const setData = ECHO_SETS[setName];
  return setData ? getElementColor(setData.element) : '#6b7280';
};
// Get unique element colors for an echo's sets (for multi-color gradients)
const getEchoSetColors = (echoName) => {
  const data = ECHO_DATA[echoName];
  if (!data) return [];
  const seen = new Set();
  return data.sets.map(s => {
    const el = ECHO_SETS[s]?.element;
    const hex = getElementColor(el);
    if (seen.has(hex)) return null;
    seen.add(hex);
    return hex;
  }).filter(Boolean);
};
// Get buff element color (maps 'Glacio DMG' → Glacio, etc.)
const getBuffElementColor = (buff) => {
  const el = typeof buff === 'string' ? buff.replace(' DMG', '') : '';
  return ELEMENT_COLORS[el]?.hex || ELEMENT_COLORS[buff]?.hex || '#6b7280';
};

export {
  haptic,
  generateUniqueId,
  calculateLuckRating,
  ELEMENT_COLORS,
  getElementColor,
  getElementBg,
  getElementBorder,
  getSetElementColor,
  getEchoSetColors,
  getBuffElementColor,
};
