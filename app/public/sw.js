// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — Service Worker
// P14-FIX: HIGH-6 — Moved from inline blob URL to proper static file.
// Blob URL SWs bypass CSP, are invisible to security scanners, and prevent
// proper SW update lifecycle. A static file fixes all three issues.
// ═══════════════════════════════════════════════════════════════════════════════

let APP_VERSION = '3.5.0'; // Fallback — can be overridden by app via message
let APP_CACHE = `ww-app-v${APP_VERSION}`;
let IMG_CACHE = `ww-images-v${APP_VERSION}`;
let CDN_CACHE = `ww-cdn-v${APP_VERSION}`;
const MAX_IMG_ENTRIES = 250;

// Map-overlay tile cache — independent of APP_VERSION because tile URLs are
// stable across app deploys. Bumping TILE_CACHE_VERSION is the manual opt-in
// to force users to re-download tiles (e.g. if we re-slice an overlay).
const TILE_CACHE_VERSION = 'v1';
const TILE_CACHE = `ww-tiles-${TILE_CACHE_VERSION}`;
// Match tiles for either:
//   * sub-map overlays at /<dir>/lossless/{y}/{x}.png
//   * the Solaris_3 base world map at /map-tiles/Solaris_3/{z}/{y}/{x}.webp
const OVERLAY_TILE_RE = /\/lossless\/\d+\/\d+\.png$/i;
const BASE_TILE_RE = /\/map-tiles\/Solaris_3\/\d+\/\d+\/\d+\.webp$/i;

// Core app shell to precache
// NOTE: Vite hashed assets are cache-busted automatically via networkFirst strategy.
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg'];

// CDN domains — cache-first (these rarely change)
const CDN_DOMAINS = ['cdnjs.cloudflare.com', 'unpkg.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

// Image domains — stale-while-revalidate
const IMG_DOMAINS = ['i.ibb.co', 'i.imgur.com', 'ibb.co', 'cdn.discordapp.com', 'media.discordapp.net', 'pbs.twimg.com', 'raw.githubusercontent.com', 'i.postimg.cc', 'wuwa.gg', 'wuwatracker.com'];

// Install — precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate — purge old caches. Tile cache is preserved as long as its
// version-suffixed name matches TILE_CACHE; older ww-tiles-* buckets get
// cleaned so user-downloaded tiles aren't orphaned on the device.
self.addEventListener('activate', (event) => {
  const currentCaches = [APP_CACHE, IMG_CACHE, CDN_CACHE, TILE_CACHE];
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => !currentCaches.includes(n)).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Trim image cache to MAX_IMG_ENTRIES (LRU by insertion order)
let _trimPending = false;
async function trimCache(cacheName, maxEntries) {
  if (_trimPending) return;
  _trimPending = true;
  await new Promise(r => setTimeout(r, 2000));
  _trimPending = false;
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
      await Promise.all(keys.slice(0, keys.length - maxEntries).map(k => cache.delete(k)));
    }
  } catch {}
}

// Strategy: Cache-first (for CDN assets)
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

// Strategy: Stale-while-revalidate (for images)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
      trimCache(cacheName, MAX_IMG_ENTRIES);
    }
    return response;
  }).catch(() => {
    if (cached) return cached;
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  });

  return cached || fetchPromise;
}

// Strategy: Network-first with cache fallback (for app/API)
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/index.html') || await caches.match('/');
      if (fallback) return fallback;
      // Last resort — styled offline message
      return new Response(
        `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Offline — Whispering Wishes</title>
        <style>body{background:#080c14;color:#e2e8f0;font-family:'Rajdhani',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}
        .box{max-width:400px;padding:2rem}h1{font-size:1.5rem;margin-bottom:1rem}p{opacity:0.7;line-height:1.6}
        button{margin-top:1.5rem;padding:0.75rem 1.5rem;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;font-family:inherit}
        button:hover{background:#3b82f6}</style></head>
        <body><div class="box"><h1>You're Offline</h1><p>Whispering Wishes needs an internet connection to load. Please check your connection and try again.</p>
        <button onclick="location.reload()">Retry</button></div></body></html>`,
        { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
    return new Response('Offline', { status: 503 });
  }
}

// Fetch router — pick strategy by domain/type
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Map overlay tiles + base world map tiles → dedicated persistent cache,
  // cache-first. Matched BEFORE the generic image route so these don't get
  // evicted by the 250-entry image LRU. Users can pre-warm via the
  // "download" button (download-overlay message) and purge via the
  // "remove" button.
  if (OVERLAY_TILE_RE.test(url.pathname) || BASE_TILE_RE.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request, TILE_CACHE));
    return;
  }

  // CDN assets → cache-first
  if (CDN_DOMAINS.some(d => url.hostname.includes(d))) {
    event.respondWith(cacheFirst(event.request, CDN_CACHE));
    return;
  }

  // Images → stale-while-revalidate
  if (IMG_DOMAINS.some(d => url.hostname.includes(d)) || /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request, IMG_CACHE));
    return;
  }

  // Everything else → network-first
  event.respondWith(networkFirst(event.request, APP_CACHE));
});

// Handle messages
self.addEventListener('message', async (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
  if (event.data === 'clearImageCache') {
    caches.delete(IMG_CACHE).then(() => {
      event.source?.postMessage('imageCacheCleared');
    });
  }
  // Version sync from app — keeps cache names aligned with app version
  if (event.data?.type === 'SET_VERSION' && event.data.version) {
    APP_VERSION = event.data.version;
    APP_CACHE = `ww-app-v${APP_VERSION}`;
    IMG_CACHE = `ww-images-v${APP_VERSION}`;
    CDN_CACHE = `ww-cdn-v${APP_VERSION}`;
  }

  // ── Map overlay offline download API ─────────────────────────────────────
  // The app sends the full list of tile URLs for one overlay and we bulk-
  // fetch them into TILE_CACHE. Progress is posted back so the UI can show
  // a percentage. Purge / query mirror the same shape so the UI can show
  // "X / N cached" or wipe an overlay's tiles to free storage.
  const data = event.data;
  if (!data || typeof data !== 'object') return;
  const reply = (msg) => event.source?.postMessage(msg);

  if (data.type === 'download-overlay' && Array.isArray(data.urls)) {
    const { id, urls } = data;
    try {
      const cache = await caches.open(TILE_CACHE);
      let done = 0;
      const total = urls.length;
      const CONCURRENCY = 6; // bound parallel fetches so we don't DoS the server
      let cursor = 0;
      const workers = Array.from({ length: CONCURRENCY }, async () => {
        while (cursor < total) {
          const idx = cursor++;
          const url = urls[idx];
          try {
            const existing = await cache.match(url);
            if (!existing) {
              const resp = await fetch(url, { cache: 'no-cache' });
              if (resp.ok) await cache.put(url, resp);
            }
          } catch {}
          done++;
          if (done % 8 === 0 || done === total) reply({ type: 'download-progress', id, done, total });
        }
      });
      await Promise.all(workers);
      reply({ type: 'download-done', id, total });
    } catch (err) {
      reply({ type: 'download-error', id, error: String(err) });
    }
    return;
  }

  if (data.type === 'purge-overlay' && Array.isArray(data.urls)) {
    const { id, urls } = data;
    try {
      const cache = await caches.open(TILE_CACHE);
      await Promise.all(urls.map((u) => cache.delete(u)));
      reply({ type: 'purge-done', id });
    } catch (err) {
      reply({ type: 'purge-error', id, error: String(err) });
    }
    return;
  }

  if (data.type === 'query-overlay' && Array.isArray(data.urls)) {
    const { id, urls } = data;
    try {
      const cache = await caches.open(TILE_CACHE);
      let cached = 0;
      for (const u of urls) {
        if (await cache.match(u)) cached++;
      }
      reply({ type: 'query-result', id, cached, total: urls.length });
    } catch (err) {
      reply({ type: 'query-error', id, error: String(err) });
    }
    return;
  }
});
// BUILD: v3.5.0
