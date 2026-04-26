#!/usr/bin/env node
// Extracts SPRITE_SPINE_CHARACTERS from SpinePlayer.jsx and emits a
// browser-friendly JSON list at app/public/dev/sprite-list.json.
//
// Re-run after editing SPRITE_SPINE_CHARACTERS so the pre-render capture
// page (app/public/dev/prerender.html) sees the latest entries.
//
//   node tools/extract-sprite-list.mjs

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const src = fs.readFileSync(
  path.join(repoRoot, 'app/src/shared/components/SpinePlayer.jsx'),
  'utf8',
);

const m = src.match(/export const SPRITE_SPINE_CHARACTERS\s*=\s*(\{[\s\S]*?^\});/m);
if (!m) {
  console.error('Could not locate SPRITE_SPINE_CHARACTERS literal.');
  process.exit(1);
}

const spriteEntry = (name, element, portrait, extras = {}) => ({
  name,
  element,
  portrait,
  dir: extras.dir || portrait.toLowerCase(),
});
const SPRITE_DEF = { scale: 2.3, tx: -3, ty: 27.5 };
const literal = eval(`(${m[1]})`); // eslint-disable-line no-eval

const list = Object.entries(literal).map(([key, v]) => ({
  key,
  name: v.name,
  element: v.element,
  portrait: v.portrait,
  dir: v.dir,
  skelUrl: `/portraits/${v.dir}/Portraits_${v.portrait}.skel`,
  atlasUrl: `/portraits/${v.dir}/Portraits_${v.portrait}.atlas`,
}));

const out = path.join(repoRoot, 'app/public/dev/sprite-list.json');
fs.writeFileSync(out, JSON.stringify(list, null, 2) + '\n');
console.log(`wrote ${list.length} entries to ${path.relative(repoRoot, out)}`);
// Suppress unused-warning on SPRITE_DEF (eval'd code may reference it).
void SPRITE_DEF;
