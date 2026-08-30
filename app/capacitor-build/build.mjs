// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — capacitor-build/build.mjs
// Produces dist-native/ for the Capacitor (native app) build — a filtered copy
// of the normal dist/ build that leaves out the asset directories too large
// to reasonably bundle into an app binary (map-tiles/, portraits/,
// animated-bg/, spine/, convene-animations/, audio/ — together well over 1GB,
// vs a few MB for everything else). convene-animations/ added 2026-08-27 once
// it grew to ~40 per-character videos (~300MB+); audio/ added once the OST
// library grew from 4 small ambient loops to ~40 tracks (~200MB+).
// Those directories are still fetched at runtime, just from the hosted
// deployment (VITE_API_BASE_URL / CAPACITOR_HOST_URL) instead of from local
// files — patched into dist-native/sw.js below for the WebView side. audio/
// also needs a NATIVE-side equivalent: SoundtrackPlaybackService.java is a
// plain Android Service outside the WebView, with no access to its Service
// Worker/Cache Storage, so it can't reuse that same JS-side redirect — it
// reads the same HOST_URL from a generated Android string resource instead
// (android/app/src/main/res/values/remote_config.xml, written below) via
// WidgetAssetUtils.streamOrCachedAssetUri(). Everything else (calculator,
// planner, collection, teams, tracker — all app logic and small UI assets)
// ships fully bundled and works with zero network connection, forever,
// independent of whether that hosting is even still running.
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
  console.error('where your hosted deployment lives to fetch the heavy media folders (map tiles,');
  console.error('character animations, banner videos) and to call /api/* features.');
  console.error('Set it in app/.env.local, e.g.:');
  console.error('  VITE_API_BASE_URL=https://whispering-wishes.vercel.app');
  console.error('See CAPACITOR_APP.md.\n');
  process.exit(1);
}

// The directories excluded from the native bundle — see file header.
const EXCLUDED_DIRS = ['map-tiles', 'portraits', 'animated-bg', 'spine', 'convene-animations', 'audio'];

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

// Patch the service worker so requests for the excluded directories are
// redirected to the hosted deployment instead of 404ing against local
// (now-missing) files. Only dist-native/sw.js is touched — the real dist/
// used for the web deployment is never modified by this script.
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
const NATIVE_REMOTE_DIRS = ${JSON.stringify(EXCLUDED_DIRS)};
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

// Native-side (Java) equivalent of the sw.js patch above, for
// SoundtrackPlaybackService.java / WidgetAssetUtils.streamOrCachedAssetUri() —
// see this file's own header for why audio/ needs one. Regenerated on every
// native build, same as dist-native/sw.js; not meant to be hand-edited.
const remoteConfigPath = path.join(APP_ROOT, 'android/app/src/main/res/values/remote_config.xml');
const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
fs.mkdirSync(path.dirname(remoteConfigPath), { recursive: true });
fs.writeFileSync(remoteConfigPath,
  `<?xml version="1.0" encoding="utf-8"?>\n` +
  `<!-- Generated by capacitor-build/build.mjs on every native build — do not hand-edit,\n` +
  `     it's overwritten each time. See that script's own file header. -->\n` +
  `<resources>\n` +
  `    <string name="soundtrack_remote_base" translatable="false">${escapeXml(HOST_URL)}</string>\n` +
  `</resources>\n`
);

console.log(`\ndist-native/ ready — pointing map-tiles/portraits/animated-bg/spine/convene-animations/audio at ${HOST_URL}`);
console.log('Next: npx cap sync android   (capacitor.config.json already points webDir at dist-native)');
