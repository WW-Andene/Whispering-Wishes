// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — capacitor-build/build.mjs
// Produces dist-native/ for the Capacitor (native app) build — a filtered copy
// of the normal dist/ build that leaves out the asset directories too large
// to reasonably bundle into an app binary (map-tiles/, portraits/,
// animated-bg/, spine/, convene-animations/, audio/ — together well over 1GB,
// vs a few MB for everything else). convene-animations/ added 2026-08-27 once
// it grew to ~40 per-character videos (~300MB+); audio/ added once the OST
// library grew from 4 small ambient loops to ~40 tracks (~200MB+).
// Those directories are still fetched at runtime, just not from wherever's
// hosting the app build itself: map-tiles/ is the one exception still routed
// through the hosted deployment (VITE_API_BASE_URL / CAPACITOR_HOST_URL) —
// patched into dist-native/sw.js below, and left alone deliberately since
// it's MapTab's own offline-tile system (see that patch's own comment for
// why). The other five (portraits/animated-bg/spine/convene-animations/
// audio) stream straight from the GitHub repo itself via the jsDelivr GitHub
// CDN instead — see public/sw.js's own JSDELIVR_ASSET_BASE comment — so the
// hosting platform is only ever asked to serve the app shell, map tiles, and
// /api/* routes, never any of these ~1GB of media files. Everything else
// (calculator, planner, collection, teams, tracker — all app logic and
// small UI assets) ships fully bundled and works with zero network
// connection, forever, independent of whether any of this hosting is even
// still running.
//
// audio/ specifically ALSO needs a native-Java-side (not just WebView-side)
// version of this: the Soundtrack widget's playback
// (SoundtrackPlaybackService.java) is a plain Android Service outside the
// WebView, so it has no access to the WebView's own Service Worker cache at
// all. It streams straight from the same jsDelivr URL independently — see
// WidgetAssetUtils.streamOrCachedAssetUri()'s own comment.
//
// Usage: npm run build:native   (see package.json)
// Requires VITE_API_BASE_URL (or CAPACITOR_HOST_URL) set to wherever the app
// is actually hosted — see CAPACITOR_APP.md.
// ═══════════════════════════════════════════════════════════════════════════════

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(APP_ROOT, 'dist');
const DIST_NATIVE_DIR = path.join(APP_ROOT, 'dist-native');

// Reuse the same tiny .env loader self-host/server.js uses — keeps this
// script dependency-free and lets `VITE_API_BASE_URL=... npm run build:native`
// or a plain .env file both work.
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile(path.join(APP_ROOT, '.env.local'));
loadEnvFile(path.join(APP_ROOT, '.env'));

const HOST_URL = (process.env.CAPACITOR_HOST_URL || process.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
if (!HOST_URL) {
  console.error('\nCAPACITOR_HOST_URL (or VITE_API_BASE_URL) is not set — the native app needs to know');
  console.error('where your hosted deployment lives to fetch map tiles (MapTab\'s own offline-tile');
  console.error('system) and to call /api/* features. Every other excluded media folder (character');
  console.error('animations, banner videos, soundtrack) streams from the repo itself via jsDelivr now.');
  console.error('Set it in app/.env.local, e.g.:');
  console.error('  VITE_API_BASE_URL=https://whispering-wishes.vercel.app');
  console.error('See CAPACITOR_APP.md.\n');
  process.exit(1);
}

// The directories excluded from the native bundle — see file header.
const EXCLUDED_DIRS = ['map-tiles', 'portraits', 'animated-bg', 'spine', 'convene-animations', 'audio'];

// One single exception carved out of the audio/ exclusion above: the
// default Log Screen ambient track (useVisualSettings.js's own
// DEFAULT_VISUAL_SETTINGS.logScreenTrack: '2'), which is exactly what a
// genuinely first-ever app open needs to autoplay with zero setup. On that
// very first page load, the service worker isn't controlling the page
// yet (a page's first-ever load is never controlled by the SW it's still
// installing — that only starts on the NEXT navigation) — so a request
// for an excluded audio/ file doesn't even reach public/sw.js's own
// JSDELIVR_ASSET_BASE redirect at all; it hits the local WebView asset
// loader directly, where the file genuinely doesn't exist, and 404s
// immediately. That matches the exact reported pattern (silent on the
// very first open, fine after any reopen — the SW is controlling by
// then, and its redirect to jsDelivr works). Bundling this one ~4MB file
// removes that network/SW-timing dependency entirely for the one case
// that actually needs zero setup to just work.
const NATIVE_BUNDLED_AUDIO_FILES = ['log-screen-2.m4a'];

console.log('Building web bundle...');
execSync('npm run build', { cwd: APP_ROOT, stdio: 'inherit', env: { ...process.env, VITE_API_BASE_URL: HOST_URL } });

console.log(`Creating dist-native/ (excluding ${EXCLUDED_DIRS.join(', ')})...`);
fs.rmSync(DIST_NATIVE_DIR, { recursive: true, force: true });
fs.mkdirSync(DIST_NATIVE_DIR, { recursive: true });

function copyFiltered(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    // Only the top-level dist/<dir> entries are candidates for exclusion —
    // matches by directory name directly under dist-native/'s root only.
    if (entry.isDirectory() && src === DIST_DIR && EXCLUDED_DIRS.includes(entry.name)) continue;
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyFiltered(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyFiltered(DIST_DIR, DIST_NATIVE_DIR);

// Carve NATIVE_BUNDLED_AUDIO_FILES back out of the audio/ exclusion above —
// see that const's own comment for why the default track specifically
// can't rely on the network/service-worker path the rest of audio/ uses.
if (NATIVE_BUNDLED_AUDIO_FILES.length > 0) {
  const nativeAudioDir = path.join(DIST_NATIVE_DIR, 'audio');
  fs.mkdirSync(nativeAudioDir, { recursive: true });
  for (const file of NATIVE_BUNDLED_AUDIO_FILES) {
    fs.copyFileSync(path.join(DIST_DIR, 'audio', file), path.join(nativeAudioDir, file));
  }
  console.log(`Bundled ${NATIVE_BUNDLED_AUDIO_FILES.join(', ')} into dist-native/audio/ despite the audio/ exclusion above`);
}

// Patch the service worker so requests for map-tiles/ (the one excluded
// directory still not handled generically by public/sw.js itself — see that
// file's own JSDELIVR_ASSET_BASE comment for portraits/spine/animated-bg/
// convene-animations/audio, which no longer need this patch at all) are
// redirected to the hosted deployment instead of 404ing against local
// (now-missing) files. Only dist-native/sw.js is touched — the real dist/
// used for the web deployment is never modified by this script.
//
// map-tiles/ stays on VITE_API_BASE_URL rather than moving to jsDelivr like
// the others, deliberately: it's MapTab's own offline-download system
// (useOfflineTiles.js, tileSW.js) and this project's standing rule is to
// never touch anything connected to MapTab without being told to explicitly
// — so its existing behavior is preserved byte-for-byte here, just with the
// other 5 directory names dropped out of NATIVE_REMOTE_DIRS below.
const swPath = path.join(DIST_NATIVE_DIR, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf-8');
// stopImmediatePropagation() is essential here — public/sw.js registers its own unconditional
// 'fetch' listener (routes everything into cacheFirst/staleWhileRevalidate/networkFirst by
// extension/domain, with no awareness of this native-only redirect). Listeners for the same
// event fire in registration order; since this patch is PREPENDED (runs first), calling
// stopImmediatePropagation() only when a path actually matches one of the excluded directories
// prevents the original handler from also running and calling event.respondWith() a second time
// on the same event, which throws (each FetchEvent can only be responded to once). Every other
// request is left completely alone and falls through to the original handler as before.
//
// This must itself be cache-first (checking the same TILE_CACHE/ASSET_CACHE the "Download for
// Offline" button and map-tile downloader fill — see providers/assetSW.js, providers/tileSW.js,
// and the cache handling below in this same file) rather than a bare network fetch. A previous
// version did a plain fetch() here with no cache check at all: since this listener runs FIRST and
// stops the original handler (which is the one that actually implements cache-first for these
// exact paths) from running, every single image load — even ones the user explicitly downloaded
// for offline use — went straight to the network and never touched the cache. TILE_CACHE and
// ASSET_CACHE are referenced here even though they're declared further down in this same file:
// safe, because this callback only runs once an actual 'fetch' event fires, by which point the
// whole script (including those consts) has already finished executing top to bottom.
const patch = `
// ─── Injected by capacitor-build/build.mjs — DO NOT hand-edit dist-native/sw.js directly,
// re-run \`npm run build:native\` instead; this file is regenerated from public/sw.js each time. ───
const NATIVE_REMOTE_BASE = ${JSON.stringify(HOST_URL)};
const NATIVE_REMOTE_DIRS = ${JSON.stringify(['map-tiles'])};
self.addEventListener('fetch', (event) => {
  const u = new URL(event.request.url);
  const dir = NATIVE_REMOTE_DIRS.find(d => u.pathname.startsWith('/' + d + '/'));
  if (event.request.method === 'GET' && dir) {
    event.stopImmediatePropagation();
    const cacheName = dir === 'map-tiles' ? TILE_CACHE : ASSET_CACHE;
    // Races the cache-first lookup against a plain direct fetch with ZERO Cache Storage calls —
    // same fix as the OCR route in public/sw.js (see its own comment): caches.match/caches.open
    // are a known hang risk in some WebViews (this handler runs in exactly that context, for
    // every map-tile/portrait/animated-bg/spine/convene-animation request), and a hang here
    // previously meant the request just never resolved — no error, no timeout, forever.
    const cacheFirst = (async () => {
      const cached = await caches.match(event.request, { cacheName });
      if (cached) return cached;
      const resp = await fetch(NATIVE_REMOTE_BASE + u.pathname + u.search);
      if (resp.ok) {
        const cache = await caches.open(cacheName);
        cache.put(event.request, resp.clone()).catch(() => {});
      }
      return resp;
    })().catch(() => new Response('', { status: 503 }));
    const plainFetch = fetch(NATIVE_REMOTE_BASE + u.pathname + u.search).catch(() => new Response('', { status: 503 }));
    event.respondWith(Promise.race([cacheFirst, plainFetch]));
  }
});
`;
sw = patch + sw;
fs.writeFileSync(swPath, sw);

console.log(`\ndist-native/ ready — map-tiles points at ${HOST_URL}, everything else excluded from the bundle streams from the repo via jsDelivr`);
console.log('Next: npx cap sync android   (capacitor.config.json already points webDir at dist-native)');
