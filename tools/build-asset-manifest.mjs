#!/usr/bin/env node
// Walks app/public/{portraits,animated-bg,spine,convene-animations,characters,
// banners,echoes,materials,misc-assets,achievements,ui-icons,audio}/ and emits a flat list of
// every file's URL path to app/public/dev/asset-manifest.json. Used by the
// "Download for offline" feature (ProfileTab → OfflineAssetsCard) to bulk-
// fetch these directories into the service worker's persistent cache.
//
// A filesystem walk (rather than parsing SpinePlayer.jsx's sprite registry,
// as extract-sprite-list.mjs does) is deliberate here: it also catches the
// .webp/.png texture files an atlas references, which aren't listed
// anywhere in source — this always matches exactly what's actually shipped
// in public/, with no risk of drifting from it.
//
// map-tiles/ doesn't need a manifest — tileUrlsForBaseMap() in
// src/providers/tileSW.js already computes its full tile list mathematically
// from the known tile-pyramid dimensions.
//
// A final "icons" category is scraped separately, below: character/weapon/
// echo/skill icons formerly hotlinked from i.ibb.co have all been downloaded
// into app/public/{characters,banners,echoes,materials}/ and are covered by
// the directory walk above. What's left hotlinked (monster head icons from
// static.nanoka.cc, and any wuwatracker.com/wuwa.gg references) still has no
// local copy, so we still regex those URLs out of src/data/*.js. No file size
// is known ahead of time for these, so totalBytes for this category is left
// at 0 — the UI just won't show a size estimate for it.
//
//   node tools/build-asset-manifest.mjs

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const publicDir = path.join(repoRoot, 'app/public');
const srcDataDir = path.join(repoRoot, 'app/src/data');
const DIRS = ['portraits', 'animated-bg', 'spine', 'convene-animations', 'characters', 'banners', 'echoes', 'materials', 'misc-assets', 'achievements', 'ui-icons', 'audio'];
const ICON_HOSTS = ['i.ibb.co', 'wuwatracker.com', 'wuwa.gg', 'static.nanoka.cc'];
const ICON_URL_RE = new RegExp(
  `https?://(?:${ICON_HOSTS.map(h => h.replace(/\./g, '\\.')).join('|')})/[^"'\`)\\s]+?\\.(?:webp|png|jpg|jpeg)`,
  'g'
);

function walk(dir, urlPrefix, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const urlPath = `${urlPrefix}/${encodeURIComponent(entry.name)}`;
    if (entry.isDirectory()) {
      walk(full, urlPath, out);
    } else {
      out.push({ url: urlPath, bytes: fs.statSync(full).size });
    }
  }
}

const manifest = { generatedAt: new Date().toISOString(), categories: {} };
for (const dirName of DIRS) {
  const dirPath = path.join(publicDir, dirName);
  const files = [];
  if (fs.existsSync(dirPath)) walk(dirPath, `/${dirName}`, files);
  const totalBytes = files.reduce((s, f) => s + f.bytes, 0);
  manifest.categories[dirName] = { fileCount: files.length, totalBytes, files };
}

const iconUrls = new Set();
if (fs.existsSync(srcDataDir)) {
  for (const entry of fs.readdirSync(srcDataDir)) {
    if (!entry.endsWith('.js')) continue;
    const text = fs.readFileSync(path.join(srcDataDir, entry), 'utf8');
    for (const match of text.matchAll(ICON_URL_RE)) iconUrls.add(match[0]);
  }
}
manifest.categories.icons = {
  fileCount: iconUrls.size,
  totalBytes: 0, // hotlinked from third-party hosts — sizes aren't known ahead of download
  files: [...iconUrls].sort().map(u => ({ url: u, bytes: 0 })),
};

const outPath = path.join(publicDir, 'dev/asset-manifest.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(manifest));

const fmtMB = (b) => (b / 1024 / 1024).toFixed(1);
for (const [name, cat] of Object.entries(manifest.categories)) {
  console.log(`  ${name}: ${cat.fileCount} files, ${fmtMB(cat.totalBytes)} MB`);
}
console.log(`wrote asset manifest to ${path.relative(repoRoot, outPath)}`);
