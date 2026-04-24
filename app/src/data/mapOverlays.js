// Sub-map overlay catalog + localStorage draft store.
//
// Catalog entry: available sub-map image (id, name, imageUrl, natural dimensions).
// Placement draft: where/how the user has placed one on the main map
//   { id, catalogId, name, center: [x, y], scale, rotation, floor, opacity }.
// Placements live in localStorage under ww-overlay-drafts; first visit is
// seeded from DEFAULT_OVERLAY_DRAFTS in mapDefaults.js.

import { DEFAULT_OVERLAY_DRAFTS } from './mapDefaults.js';

export const OVERLAY_CATALOG = [
  {
    id: 'lahai-roi',
    name: 'Lahai Roi',
    imageUrl: 'map-tiles/lahai-roi/Lahai-roi.webp',
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
    imageUrl: 'map-tiles/Vault-Underground/Vault-Underground.webp',
    naturalWidth: 8192,
    naturalHeight: 8192,
  },
  {
    id: 'fabricatorium-of-the-deep',
    name: 'Fabricatorium of the Deep',
    imageUrl: 'map-tiles/Fabricatorium-of-the-deep/Fabricatorium-of-the-deep.webp',
    naturalWidth: 13312,
    naturalHeight: 8192,
  },
  {
    id: 'honami-city',
    name: 'Honami City',
    imageUrl: 'map-tiles/Honami_City/Honami_City.webp',
    naturalWidth: 8192,
    naturalHeight: 8192,
  },
  {
    id: 'chronorift-metropolis',
    name: 'Chronorift Metropolis',
    imageUrl: 'map-tiles/chronorift-metropolis/chronorift-metropolis.webp',
    naturalWidth: 8192,
    naturalHeight: 8192,
  },
  {
    id: 'hualong-outlines',
    name: 'Huanglong Outlines',
    imageUrl: 'map-tiles/hualong-outlines.png',
    naturalWidth: 1156,
    naturalHeight: 1200,
  },
];

const KEY = 'ww-overlay-drafts';

export function loadOverlayDrafts() {
  if (typeof localStorage === 'undefined') return DEFAULT_OVERLAY_DRAFTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return DEFAULT_OVERLAY_DRAFTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_OVERLAY_DRAFTS;
  } catch { return DEFAULT_OVERLAY_DRAFTS; }
}

export function saveOverlayDrafts(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}
