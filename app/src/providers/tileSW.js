// Map-overlay offline tile API — thin wrapper over postMessage calls to the
// service worker in /public/sw.js. The SW owns a dedicated persistent cache
// (TILE_CACHE) that survives app-version bumps, so user-downloaded overlays
// stay on-device until explicitly purged.
//
// Usage (from MapTab):
//   const urls = tileUrlsForOverlay(cat);           // pure, no IO
//   await downloadOverlay(cat, (done, total) => ...);
//   await purgeOverlay(cat);
//   const { cached, total } = await queryOverlay(cat);
//
// Each call round-trips a unique `id` through the SW so concurrent calls
// don't confuse each other's progress messages.

const TILE_PX = 256;

function encodeDir(imageUrl) {
  // Strip the filename and URL-encode each path segment so folder names with
  // spaces ("Vault Underground") become %20. Must match MapTab's renderer.
  const dir = imageUrl.replace(/\/[^/]+$/, '');
  return dir.split('/').map(encodeURIComponent).join('/');
}

export function tileUrlsForOverlay(cat) {
  const cols = Math.ceil(cat.naturalWidth / TILE_PX);
  const rows = Math.ceil(cat.naturalHeight / TILE_PX);
  const base = (import.meta.env.BASE_URL || '/');
  const encoded = encodeDir(cat.imageUrl);
  const urls = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      urls.push((base + encoded + `/lossless/${y}/${x}.png`).replace(/([^:])\/\//g, '$1/'));
    }
  }
  return urls;
}

function swController() {
  return navigator.serviceWorker?.controller || null;
}

function nextId(catId, prefix) {
  return `${prefix}:${catId}:${Date.now().toString(36)}:${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function callSW(message, { matchId, terminal, onProgress }) {
  return new Promise((resolve, reject) => {
    const sw = swController();
    if (!sw) { reject(new Error('no-service-worker')); return; }
    const handler = (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object' || msg.id !== matchId) return;
      if (onProgress && msg.type === 'download-progress') {
        onProgress(msg.done, msg.total);
        return;
      }
      if (terminal.includes(msg.type)) {
        navigator.serviceWorker.removeEventListener('message', handler);
        if (msg.type.endsWith('-error')) reject(new Error(msg.error || msg.type));
        else resolve(msg);
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    sw.postMessage(message);
  });
}

export async function downloadOverlay(cat, onProgress) {
  const urls = tileUrlsForOverlay(cat);
  const id = nextId(cat.id, 'dl');
  const res = await callSW(
    { type: 'download-overlay', id, urls },
    { matchId: id, terminal: ['download-done', 'download-error'], onProgress }
  );
  return { total: res.total };
}

export async function purgeOverlay(cat) {
  const urls = tileUrlsForOverlay(cat);
  const id = nextId(cat.id, 'rm');
  await callSW(
    { type: 'purge-overlay', id, urls },
    { matchId: id, terminal: ['purge-done', 'purge-error'] }
  );
  return true;
}

export async function queryOverlay(cat) {
  const urls = tileUrlsForOverlay(cat);
  const id = nextId(cat.id, 'q');
  const res = await callSW(
    { type: 'query-overlay', id, urls },
    { matchId: id, terminal: ['query-result', 'query-error'] }
  );
  return { cached: res.cached, total: res.total };
}

export function serviceWorkerAvailable() {
  return !!(navigator.serviceWorker && navigator.serviceWorker.controller);
}
