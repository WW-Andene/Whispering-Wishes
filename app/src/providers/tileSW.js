// Map-tile offline API — thin wrapper over postMessage calls to the service
// worker in /public/sw.js. The SW owns a dedicated persistent cache
// (TILE_CACHE) that survives app-version bumps, so user-downloaded tiles
// stay on-device until explicitly purged.
//
// Two kinds of downloadables are supported:
//   * Overlay sub-maps: PNG tiles under <overlay-dir>/lossless/{y}/{x}.png
//   * Base world map (Solaris_3): WebP tiles across all zoom levels
//
// Each call round-trips a unique `id` through the SW so concurrent calls
// don't confuse each other's progress messages.

const TILE_PX = 256;
const BASE_URL = (import.meta.env.BASE_URL || '/');

function encodeDir(imageUrl) {
  // Strip the filename and URL-encode each path segment so folder names with
  // spaces ("Vault Underground") become %20.
  const dir = imageUrl.replace(/\/[^/]+$/, '');
  return dir.split('/').map(encodeURIComponent).join('/');
}

function joinUrl(...parts) {
  return parts.join('/').replace(/([^:])\/\//g, '$1/');
}

export function tileUrlsForOverlay(cat) {
  const cols = Math.ceil(cat.naturalWidth / TILE_PX);
  const rows = Math.ceil(cat.naturalHeight / TILE_PX);
  const encoded = encodeDir(cat.imageUrl);
  const urls = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      urls.push(joinUrl(BASE_URL + encoded, 'lossless', y, `${x}.png`));
    }
  }
  return urls;
}

// Solaris_3 base world map — every tile across the full pyramid.
// MAP_W=12288, MAP_H=16384, NATIVE_ZOOM=6 (matches MapTab.jsx constants).
const BASE_W = 12288;
const BASE_H = 16384;
const BASE_NATIVE_ZOOM = 6;

export function tileUrlsForBaseMap() {
  const urls = [];
  for (let z = 0; z <= BASE_NATIVE_ZOOM; z++) {
    const factor = Math.pow(2, BASE_NATIVE_ZOOM - z);
    const cols = Math.ceil(BASE_W / factor / TILE_PX);
    const rows = Math.ceil(BASE_H / factor / TILE_PX);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        urls.push(joinUrl(`${BASE_URL}map-tiles/Solaris_3`, z, y, `${x}.webp`));
      }
    }
  }
  return urls;
}

function swController() {
  return navigator.serviceWorker?.controller || null;
}

function nextId(itemId, prefix) {
  return `${prefix}:${itemId}:${Date.now().toString(36)}:${Math.floor(Math.random() * 1e6).toString(36)}`;
}

// Max time without ANY progress update before we assume the SW died
// (e.g. browser evicted it) and reject the caller. The download itself can
// run for minutes; this is a stall detector, not a total budget.
const CALL_STALL_MS = 60_000;

function callSW(message, { matchId, terminal, onProgress }) {
  return new Promise((resolve, reject) => {
    const sw = swController();
    if (!sw) { reject(new Error('no-service-worker')); return; }

    let stallTimer = null;
    const resetStall = () => {
      if (stallTimer) clearTimeout(stallTimer);
      stallTimer = setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', handler);
        reject(new Error('service-worker-stalled'));
      }, CALL_STALL_MS);
    };

    const handler = (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object' || msg.id !== matchId) return;
      resetStall();
      if (onProgress && msg.type === 'download-progress') {
        onProgress(msg.done, msg.total, msg.failed || 0);
        return;
      }
      if (terminal.includes(msg.type)) {
        if (stallTimer) clearTimeout(stallTimer);
        navigator.serviceWorker.removeEventListener('message', handler);
        if (msg.type.endsWith('-error')) reject(new Error(msg.error || msg.type));
        else resolve(msg);
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    resetStall();
    sw.postMessage(message);
  });
}

// Generic API working on any { id, urls } pair. Use these for both overlays
// and the base map.
export async function downloadTiles(item, onProgress) {
  const id = nextId(item.id, 'dl');
  const res = await callSW(
    { type: 'download-overlay', id, urls: item.urls },
    { matchId: id, terminal: ['download-done', 'download-error'], onProgress }
  );
  return { total: res.total, failed: res.failed || 0 };
}

export async function purgeTiles(item) {
  const id = nextId(item.id, 'rm');
  await callSW(
    { type: 'purge-overlay', id, urls: item.urls },
    { matchId: id, terminal: ['purge-done', 'purge-error'] }
  );
  return true;
}

export async function queryTiles(item) {
  const id = nextId(item.id, 'q');
  const res = await callSW(
    { type: 'query-overlay', id, urls: item.urls },
    { matchId: id, terminal: ['query-result', 'query-error'] }
  );
  return { cached: res.cached, total: res.total };
}

export function serviceWorkerAvailable() {
  return !!(navigator.serviceWorker && navigator.serviceWorker.controller);
}
