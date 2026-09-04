#!/usr/bin/env node
// engine/schema naming CI check (ENGINE_ARCHITECTURE_PROPOSAL.md v2 §4.2/§8 item 2).
//
// Rule (§4.2): filename = the character's canonical Name (§1), lowercased, spaces and
// non-alphanumerics stripped, `.blocks.js` appended. No manual exceptions.
//
// This script parses characterBlocks/index.js's own source (its import lines and its
// BLOCKS_BY_CHARACTER map literal) rather than re-deriving filenames from CHARACTER_DATA,
// so it's checking the exact same file/name pairing the runtime loader uses — a
// mismatch here would mean index.js's own map and its imports have drifted from each
// other, not just from CHARACTER_DATA.
//
// Read-only, no file changed. Exits non-zero (CI-blocking) on any violation.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.join(__dirname, '../src/engine/characterBlocks/index.js');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function checkCharacterBlockNaming(indexSource = fs.readFileSync(INDEX_PATH, 'utf8')) {
  const violations = [];

  // 1. import { VAR } from './filename.blocks.js';  ->  VAR -> filename (without .blocks.js)
  const varToFile = {};
  const importRe = /import\s*\{\s*([A-Z0-9_]+)\s*\}\s*from\s*'\.\/([a-zA-Z0-9]+)\.blocks\.js'/g;
  let m;
  while ((m = importRe.exec(indexSource))) {
    varToFile[m[1]] = m[2];
  }

  // 2. 'Display Name': VAR,   inside the BLOCKS_BY_CHARACTER map literal
  const mapRe = /'([^']+)':\s*([A-Z0-9_]+),/g;
  const nameToVar = {};
  while ((m = mapRe.exec(indexSource))) {
    nameToVar[m[1]] = m[2];
  }

  const names = Object.keys(nameToVar);
  if (names.length === 0) {
    violations.push('found zero BLOCKS_BY_CHARACTER map entries — index.js format may have changed; this checker needs updating, not silently skipped');
  }

  for (const name of names) {
    const varName = nameToVar[name];
    const file = varToFile[varName];
    if (!file) {
      violations.push(`"${name}" -> ${varName} has no matching import line found`);
      continue;
    }
    const expected = slugify(name);
    if (file.toLowerCase() !== expected) {
      violations.push(`"${name}" slugifies to "${expected}.blocks.js" but index.js imports it from "${file}.blocks.js"`);
    }
    if (file !== file.toLowerCase()) {
      violations.push(`"${file}.blocks.js" is not all-lowercase (real filename casing must match its own display-name slug exactly, not just case-insensitively) — e.g. §0.3's flagged roverElectro.blocks.js vs. its siblings roveraero/roverhavoc/roverspectro.blocks.js`);
    }
  }

  return violations;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const violations = checkCharacterBlockNaming();
  if (violations.length) {
    console.error(`checkCharacterBlockNaming: ${violations.length} naming violation(s):`);
    violations.forEach(v => console.error(`  - ${v}`));
    console.error('\nPer ENGINE_ARCHITECTURE_PROPOSAL.md v2 §4.2, fixing these requires renaming files inside');
    console.error('characterBlocks/ — explicitly deferred to the Phase A-integrated migration (§7), not done');
    console.error('automatically by this checker. This script only reports; it does not rename.');
    process.exit(1);
  } else {
    console.log('checkCharacterBlockNaming: all characterBlocks/ filenames match their canonical Name slug.');
  }
}
