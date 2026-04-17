// Sub-map overlay catalog + localStorage draft store.
//
// Catalog entry: available sub-map image (id, name, imageUrl, natural dimensions).
// Placement draft: where/how the user has placed one on the main map
//   { id, catalogId, name, center: [x, y], scale, rotation, floor, opacity }.
// Placements live in localStorage under ww-overlay-drafts.

export const OVERLAY_CATALOG = [
  {
    id: 'lahai-roi',
    name: 'Lahai Roi',
    imageUrl: 'map-tiles/lahai_roi.webp',
    naturalWidth: 4096,
    naturalHeight: 4096,
  },
  {
    id: 'hualong-outlines',
    name: 'Huanglong Outlines',
    imageUrl: 'hualong_outlines.png',
    // Fallback dimensions used only until the image loads and reports its
    // real naturalWidth/Height (the renderer prefers those). Scale slider
    // can be adjusted after placement to fit the world map.
    naturalWidth: 4096,
    naturalHeight: 4096,
  },
];

const KEY = 'ww-overlay-drafts';

export function loadOverlayDrafts() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function saveOverlayDrafts(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}
