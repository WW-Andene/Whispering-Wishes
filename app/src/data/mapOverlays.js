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
    imageUrl: 'map-tiles/lahai-roi/Lahai_roi.webp',
    naturalWidth: 8192,
    naturalHeight: 8192,
  },
  {
    id: 'tethys-deep',
    name: 'Tethys Deep',
    imageUrl: 'map-tiles/Tethys_Deep/Tethys_Deep.webp',
    naturalWidth: 8192,
    naturalHeight: 8192,
  },
  {
    id: 'avinoleum',
    name: 'Avinoleum',
    imageUrl: 'map-tiles/Avinoleum/Avinoleum.webp',
    naturalWidth: 9216,
    naturalHeight: 9984,
  },
  {
    id: 'vault-underground',
    name: 'Vault Underground',
    imageUrl: 'map-tiles/Vault Underground/Vault Underground.webp',
    naturalWidth: 8192,
    naturalHeight: 8192,
  },
  {
    id: 'fabricatorium-of-the-deep',
    name: 'Fabricatorium of the Deep',
    imageUrl: 'map-tiles/Fabricatorium of the deep/Fabricatorium of the deep.png',
    naturalWidth: 13312,
    naturalHeight: 8192,
  },
  {
    id: 'hualong-outlines',
    name: 'Huanglong Outlines',
    imageUrl: 'map-tiles/hualong_outlines.png',
    naturalWidth: 1156,
    naturalHeight: 1200,
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
