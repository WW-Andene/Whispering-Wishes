#!/usr/bin/env node
// One-off migration helper: downloads i.ibb.co images referenced in a data file
// into app/public/<category>/, then rewrites the file to use local root-relative paths.
// Usage: node tools/migrate-imgbb.mjs <file> <category> [--dry-run]
import fs from 'node:fs';
import path from 'node:path';

const [, , filePath, category, ...flags] = process.argv;
const dryRun = flags.includes('--dry-run');

if (!filePath || !category) {
  console.error('Usage: node tools/migrate-imgbb.mjs <file> <category> [--dry-run]');
  process.exit(1);
}

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, 'app', 'public', category);
fs.mkdirSync(outDir, { recursive: true });

const content = fs.readFileSync(filePath, 'utf8');
const urlRe = /https:\/\/i\.ibb\.co\/[^\s'")]+/g;
const urls = [...new Set([...content.matchAll(urlRe)].map((m) => m[0]))];

console.log(`${filePath}: ${urls.length} unique i.ibb.co URLs`);

const mapping = new Map(); // url -> local root-relative path
let downloaded = 0;
let skipped = 0;
const failures = [];

for (const url of urls) {
  const parts = url.replace('https://i.ibb.co/', '').split('/');
  const id = parts[0];
  const rawName = decodeURIComponent(parts.slice(1).join('/') || `${id}.bin`);
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const localName = `${id}-${safeName}`;
  const localFsPath = path.join(outDir, localName);
  const localWebPath = `/${category}/${localName}`;
  mapping.set(url, localWebPath);

  if (dryRun) continue;

  if (fs.existsSync(localFsPath) && fs.statSync(localFsPath).size > 0) {
    skipped++;
    continue;
  }

  try {
    const res = await fetch(url);
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
