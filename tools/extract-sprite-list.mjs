#!/usr/bin/env node
// Extracts SPRITE_SPINE_CHARACTERS + BANNER_SPINE_CHARACTERS from
// SpinePlayer.jsx and emits a browser-friendly JSON list at
// app/public/dev/sprite-list.json that the pre-render capture page consumes.
//
// Each entry carries a `surface` field ('sprite' | 'banner') and a `runtime`
// hint ('4.1' | '4.2') so the dev panel knows which spine-player global to
// mount it with, plus an `outPath` describing where the captured idle loop
// should land in the repo (next to its skel/json source so the prerender
// manifest builder picks it up automatically).
//
// Re-run after editing either map so the capture page (app/public/dev/
// prerender.html) and the optional save-to-repo endpoint see the latest
// entries.
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

function extractObjectLiteral(name) {
  const re = new RegExp(`export const ${name}\\s*=\\s*(\\{[\\s\\S]*?^\\});`, 'm');
  const m = src.match(re);
  if (!m) {
    console.error(`Could not locate ${name} literal.`);
    process.exit(1);
  }
  return m[1];
}

// Helpers referenced by the registry literal — must be in scope for `eval`.
const spriteEntry = (name, element, portrait, extras = {}) => ({
  name,
  element,
  portrait,
  dir: extras.dir || portrait.toLowerCase(),
});
const SPRITE_DEF = { scale: 2.3, tx: -3, ty: 27.5 };
void SPRITE_DEF; // referenced only inside eval'd source

const spriteLit = eval(`(${extractObjectLiteral('SPRITE_SPINE_CHARACTERS')})`); // eslint-disable-line no-eval
const bannerLit = eval(`(${extractObjectLiteral('BANNER_SPINE_CHARACTERS')})`); // eslint-disable-line no-eval

const spriteEntries = Object.entries(spriteLit).map(([key, v]) => ({
  key: `sprite:${key}`,
  surface: 'sprite',
  runtime: '4.1',
  name: v.name,
  element: v.element,
  portrait: v.portrait,
  dir: v.dir,
  skelUrl: `/portraits/${v.dir}/Portraits_${v.portrait}.skel`,
  atlasUrl: `/portraits/${v.dir}/Portraits_${v.portrait}.atlas`,
  // outPath is relative to app/public/ — the dev save endpoint writes there.
  outDir: `portraits/${v.dir}`,
  outBase: `Portraits_${v.portrait}_idle`,
}));

const bannerEntries = Object.entries(bannerLit).map(([key, v]) => ({
  key: `banner:${key}`,
  surface: 'banner',
  runtime: '4.2',
  name: v.name,
  element: v.element,
  portrait: key,
  dir: `role_${key}`,
  jsonUrl: `/spine/role_${key}/c_${key}_1.json`,
  atlasUrl: `/spine/role_${key}/c_${key}_1.atlas`,
  outDir: `spine/role_${key}`,
  outBase: `c_${key}_1_idle`,
}));

const list = [...spriteEntries, ...bannerEntries];

const out = path.join(repoRoot, 'app/public/dev/sprite-list.json');
fs.writeFileSync(out, JSON.stringify(list, null, 2) + '\n');
console.log(
  `wrote ${list.length} entries (${spriteEntries.length} sprite, ${bannerEntries.length} banner) to ${path.relative(repoRoot, out)}`,
);
