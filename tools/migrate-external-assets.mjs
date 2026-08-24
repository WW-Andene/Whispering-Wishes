#!/usr/bin/env node
// Generic migration helper: downloads externally-hosted images referenced in a
// data file into app/public/<category>/, then rewrites the file to use local
// root-relative paths. Successor to migrate-imgbb.mjs, extended to cover any
// host (static.nanoka.cc, wuwatracker.com, wuwa.gg, i.ibb.co, ...).
// Usage: node tools/migrate-external-assets.mjs <file> <category> [--dry-run] [--hosts=host1,host2]
import fs from 'node:fs';
import path from 'node:path';

const [, , filePath, category, ...flags] = process.argv;
const dryRun = flags.includes('--dry-run');
const hostsFlag = flags.find((f) => f.startsWith('--hosts='));
const hosts = hostsFlag
  ? hostsFlag.slice('--hosts='.length).split(',')
  : ['static.nanoka.cc', 'wuwatracker.com', 'wuwa.gg', 'i.ibb.co'];

if (!filePath || !category) {
  console.error('Usage: node tools/migrate-external-assets.mjs <file> <category> [--dry-run] [--hosts=a,b]');
  process.exit(1);
}

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, 'app', 'public', category);
fs.mkdirSync(outDir, { recursive: true });

const content = fs.readFileSync(filePath, 'utf8');
const hostPattern = hosts.map((h) => h.replace(/\./g, '\\.')).join('|');
const urlRe = new RegExp(`https:\\/\\/(?:${hostPattern})\\/[^\\s'")]+`, 'g');
const urls = [...new Set([...content.matchAll(urlRe)].map((m) => m[0]))];

console.log(`${filePath}: ${urls.length} unique external URLs (hosts: ${hosts.join(', ')})`);

function localNameFor(url) {
  const u = new URL(url);
  const rawPath = decodeURIComponent(u.pathname.replace(/^\//, ''));
  const flat = rawPath.replace(/\//g, '-').replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${u.hostname}-${flat}`;
}

const mapping = new Map(); // url -> local root-relative path
let downloaded = 0;
let skipped = 0;
const failures = [];

for (const url of urls) {
  const localName = localNameFor(url);
  const localFsPath = path.join(outDir, localName);
  // Relative (not root-absolute) — this app is served from arbitrary subpaths
  // (see vite.config.js's `base: './'`), so a leading '/' 404s under any
  // non-root deployment. Match the existing ./navicon/, ./Background/ etc. convention.
  const localWebPath = `./${category}/${localName}`;
  mapping.set(url, localWebPath);

  if (dryRun) continue;

  if (fs.existsSync(localFsPath) && fs.statSync(localFsPath).size > 0) {
    skipped++;
    continue;
  }

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(localFsPath, buf);
    downloaded++;
  } catch (err) {
    failures.push({ url, error: String(err.message || err) });
  }
}

console.log(`Downloaded: ${downloaded}, already present: ${skipped}, failed: ${failures.length}`);
if (failures.length) {
  console.log('Failures:');
  for (const f of failures) console.log(`  ${f.url} -> ${f.error}`);
}

if (!dryRun) {
  let rewritten = content;
  for (const [url, local] of mapping) {
    if (failures.some((f) => f.url === url)) continue; // keep remote URL if download failed
    rewritten = rewritten.split(url).join(local);
  }
  fs.writeFileSync(filePath, rewritten);
  console.log(`Rewrote ${filePath}`);
}
