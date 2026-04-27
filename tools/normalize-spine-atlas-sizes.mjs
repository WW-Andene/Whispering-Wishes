#!/usr/bin/env node
// Patches Spine atlas `size:WIDTH,HEIGHT` lines so they match the actual
// dimensions of the texture page each atlas section refers to.
//
// Why this exists: nanoka's exporter writes the tight bounding box of the
// packed REGIONS on the `size:` line (e.g. `size:2044,1748`) instead of the
// actual texture-file dimensions (which are 2048×2048). spine-player uses
// the declared size to normalize UVs (`u = bounds.x / size.width`), so when
// the declared size is smaller than the real file the sampler reads from
// the wrong coordinates and meshes render deformed.
//
// Caught with Zani's eye, Cantarella's hair, Xiangli Yao's clothes — all
// three ship multi-page atlases with declared sizes < the WebP files.
// Single-page chars happen to look fine because the declared size matches
// the file in those cases (or is close enough that small shifts aren't
// visible). Multi-page atlases with uniform 2048×2048 declared sizes
// (aogusita, linnai, ...) also work — the bug only bites when declared
// size != actual file size.
//
// Usage: node tools/normalize-spine-atlas-sizes.mjs
//
// Auto-runs as part of `npm run manifest` and `npm run prebuild` so future
// re-imports of the upstream atlases get corrected automatically.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const SCAN_DIRS = [
  path.join(repoRoot, 'app/public/portraits'),
  path.join(repoRoot, 'app/public/spine'),
];

// Inline WebP/PNG header parser — small enough to avoid pulling a
// dependency, handles every variant the upstream pipeline ships.
function readImageSize(buf) {
  // PNG: signature + IHDR
  if (buf.length >= 24 && buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    return [w, h];
  }
  // WebP: RIFF…WEBP, then VP8/VP8L/VP8X chunk
  if (buf.length >= 30 && buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') {
    const fourcc = buf.slice(12, 16).toString('ascii');
    if (fourcc === 'VP8X') {
      const w = ((buf[24] | (buf[25] << 8) | (buf[26] << 16)) & 0xffffff) + 1;
      const h = ((buf[27] | (buf[28] << 8) | (buf[29] << 16)) & 0xffffff) + 1;
      return [w, h];
    }
    if (fourcc === 'VP8 ') {
      const w = (buf[26] | (buf[27] << 8)) & 0x3fff;
      const h = (buf[28] | (buf[29] << 8)) & 0x3fff;
      return [w, h];
    }
    if (fourcc === 'VP8L') {
      const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
      const w = (b0 | ((b1 & 0x3f) << 8)) + 1;
      const h = ((b1 >> 6) | (b2 << 2) | ((b3 & 0xf) << 10)) + 1;
      return [w, h];
    }
  }
  return null;
}

const PAGE_LINE_RE = /^[A-Za-z0-9_][A-Za-z0-9_-]*\.(webp|png|jpg|jpeg)$/i;

function patchAtlas(atlasPath) {
  const dir = path.dirname(atlasPath);
  const text = fs.readFileSync(atlasPath, 'utf8');
  // Preserve the original line-ending style (these atlases use \n; spine-
  // player tolerates both, but keeping the original avoids spurious diffs).
  const lines = text.split('\n');

  let currentSize = null;
  const fixes = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (PAGE_LINE_RE.test(trimmed)) {
      const filePath = path.join(dir, trimmed);
      try {
        const sz = readImageSize(fs.readFileSync(filePath));
        currentSize = sz;
      } catch {
        currentSize = null;
      }
      continue;
    }
    if (trimmed.startsWith('size:') && currentSize) {
      const [w, h] = currentSize;
      const newLine = lines[i].replace(/size:\s*\d+\s*,\s*\d+/, `size:${w},${h}`);
      if (newLine !== lines[i]) {
        fixes.push({
          line: i + 1,
          before: lines[i].trim(),
          after: newLine.trim(),
        });
        lines[i] = newLine;
      }
      currentSize = null;
    }
  }

  if (fixes.length) {
    fs.writeFileSync(atlasPath, lines.join('\n'));
  }
  return fixes;
}

function findAtlases(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) stack.push(p);
      else if (ent.isFile() && ent.name.endsWith('.atlas')) out.push(p);
    }
  }
  return out;
}

let totalAtlases = 0;
let touchedAtlases = 0;
let totalFixes = 0;
for (const root of SCAN_DIRS) {
  for (const atlas of findAtlases(root)) {
    totalAtlases++;
    const fixes = patchAtlas(atlas);
    if (fixes.length) {
      touchedAtlases++;
      totalFixes += fixes.length;
      const rel = path.relative(repoRoot, atlas);
      for (const f of fixes) {
        console.log(`  ${rel}:${f.line}  ${f.before}  →  ${f.after}`);
      }
    }
  }
}
console.log(
  `atlas-size normalize: scanned ${totalAtlases} atlases, ` +
  `patched ${touchedAtlases} (${totalFixes} size: line${totalFixes === 1 ? '' : 's'} corrected)`,
);
