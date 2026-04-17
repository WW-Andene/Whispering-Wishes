// Sub-map overlay catalog.
//
// Each entry describes an available overlay image that can be placed
// on the main map. The author panel lets the user pick from this
// catalog, position/scale/rotate the overlay, set its floor level,
// and lock it in place.
//
// Fields:
//   id            — unique string
//   name          — display name
//   imageUrl      — path relative to public/
//   naturalWidth  — native pixel width of the image
//   naturalHeight — native pixel height of the image

export const OVERLAY_CATALOG = [
  {
    id: 'lahai-roi',
    name: 'Lahai Roi',
    imageUrl: 'map-tiles/lahai_roi.webp',
    tiles: [
      { url: 'map-tiles/lahai_roi_0.0.webp', col: 0, row: 0 },
      { url: 'map-tiles/lahai_roi_1.0.webp', col: 1, row: 0 },
      { url: 'map-tiles/lahai_roi_0.1.webp', col: 0, row: 1 },
      { url: 'map-tiles/lahai_roi_1.1.webp', col: 1, row: 1 },
    ],
    tileCols: 2,
    tileRows: 2,
    naturalWidth: 8192,
    naturalHeight: 8192,
  },
];

// Overlay placement data shape (stored in localStorage `ww-overlay-drafts`):
//
// {
//   id:         string,    — unique placement id
//   catalogId:  string,    — references OVERLAY_CATALOG[].id
//   name:       string,    — display name (defaults to catalog name)
//   imageUrl:   string,    — resolved image URL
//   center:     [x, y],    — pixel coords on the 16384×16384 map
//   scale:      number,    — multiplier on natural size (1.0 = native)
//   rotation:   number,    — degrees (0–360)
//   floor:      number,    — geological level (0 = ground)
//   locked:     boolean,   — when true, cannot be dragged/resized
//   naturalWidth:  number,
//   naturalHeight: number,
// }

const OVERLAY_DRAFTS_KEY = 'ww-overlay-drafts';

export function loadOverlayDrafts() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OVERLAY_DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function saveOverlayDrafts(list) {
  try { localStorage.setItem(OVERLAY_DRAFTS_KEY, JSON.stringify(list)); } catch {}
}
