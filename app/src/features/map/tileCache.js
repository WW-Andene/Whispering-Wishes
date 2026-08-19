// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/map/tileCache.js (extracted from MapTab.jsx)
// Module-scoped overlay tile cache — survives MapTab unmount / tab switches
// so re-opening the Map instantly re-uses already-decoded tiles instead of
// re-fetching. Capped LRU keeps memory bounded on low-end devices. The
// browser HTTP cache (and the offline service worker, when installed) cover
// persistence across page reloads. Cap is set well above any single
// overlay's tile count (Fabricatorium = 1664 tiles, the largest) so panning
// inside one overlay never evicts tiles you just looked at. Must stay a
// module-level singleton, not per-instance hook state.
// ═══════════════════════════════════════════════════════════════════════════════

export const OVERLAY_TILE_CACHE = new Map();        // "catalogId:y:x" → HTMLImageElement
export const OVERLAY_TILE_CACHE_LIMIT = 2000;
