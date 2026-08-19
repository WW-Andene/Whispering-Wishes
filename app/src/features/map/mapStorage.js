// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/map/mapStorage.js (extracted from MapTab.jsx)
// localStorage persistence for zone drafts and freehand paint strokes.
// ═══════════════════════════════════════════════════════════════════════════════

import { DEFAULT_ZONE_DRAFTS } from '../../data/mapDefaults.js';

export const DRAFTS_KEY = 'ww-zone-drafts';
export const PAINT_KEY = 'ww-paint-strokes';

export function loadDrafts() {
  if (typeof localStorage === 'undefined') return DEFAULT_ZONE_DRAFTS;
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (raw === null) return DEFAULT_ZONE_DRAFTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_ZONE_DRAFTS;
  } catch { return DEFAULT_ZONE_DRAFTS; }
}
export function saveDrafts(list) {
  try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(list)); } catch {}
}
export function loadPaintStrokes() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PAINT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
export function savePaintStrokes(list) {
  try { localStorage.setItem(PAINT_KEY, JSON.stringify(list)); } catch {}
}
