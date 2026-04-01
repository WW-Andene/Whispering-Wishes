// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Data Writer
// Applies precise string replacements to appcore-data.js.
// All writes are staged in memory and flushed once at the end.
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, renameSync } from 'fs';
import { PATHS } from './config.js';
import { log, addChange } from './log.js';

// In-memory buffer for the data file
let buffer = null;

/**
 * Load the source file into the write buffer.
 */
export function loadBuffer(source) {
  buffer = source;
}

/**
 * Get the current buffer content.
 */
export function getBuffer() {
  return buffer;
}

/**
 * Safe string replacement — finds `oldStr` in buffer and replaces with `newStr`.
 * Throws if oldStr is not found (prevents silent failures).
 */
function safeReplace(oldStr, newStr, description) {
  if (!oldStr || oldStr.length === 0) {
    throw new Error(`WRITE FAILED — empty search string for: ${description}`);
  }
  if (!buffer.includes(oldStr)) {
    throw new Error(`WRITE FAILED — could not find target string for: ${description}\nSearching for:\n${oldStr.slice(0, 200)}...`);
  }
  const count = buffer.split(oldStr).length - 1;
  if (count > 1) {
    throw new Error(`WRITE FAILED — target string appears ${count} times (must be unique): ${description}`);
  }
  buffer = buffer.replace(oldStr, newStr);
  log.ok(`Applied: ${description}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Bump APP_VERSION (patch increment)
 */
export function bumpVersion(currentVersion) {
  const parts = currentVersion.split('.');
  while (parts.length < 3) parts.push('0');
  parts[2] = String(parseInt(parts[2], 10) + 1);
  const newVersion = parts.join('.');

  safeReplace(
    `const APP_VERSION = '${currentVersion}';`,
    `const APP_VERSION = '${newVersion}';`,
    `Bump version ${currentVersion} → ${newVersion}`
  );

  // Also update package.json
  try {
    const pkg = JSON.parse(readFileSync(PATHS.packageJson, 'utf-8'));
    pkg.version = newVersion;
    writeFileSync(PATHS.packageJson, JSON.stringify(pkg, null, 2) + '\n');
    log.ok(`Updated package.json version to ${newVersion}`);
  } catch (err) {
    log.warn(`Could not update package.json: ${err.message}`);
  }

  // Also update sw.js version
  try {
    let sw = readFileSync(PATHS.swFile, 'utf-8');
    const swOldVersion = sw.match(/const APP_VERSION = '([^']+)'/)?.[1];
    if (swOldVersion) {
      sw = sw.replace(`const APP_VERSION = '${swOldVersion}'`, `const APP_VERSION = '${newVersion}'`);
      writeFileSync(PATHS.swFile, sw);
      log.ok(`Updated sw.js version to ${newVersion}`);
    }
  } catch (err) {
    log.warn(`Could not update sw.js: ${err.message}`);
  }

  addChange('version', `${currentVersion} → ${newVersion}`);
  return newVersion;
}

/**
 * Update CURRENT_BANNERS with new banner data.
 * This replaces the entire CURRENT_BANNERS block.
 */
export function updateCurrentBanners(bannerData) {
  // Build character entries
  const charEntries = bannerData.characters.map(c => {
    const featured4 = c.featured4Stars ? `[${c.featured4Stars.map(s => `'${s}'`).join(', ')}]` : "['TBD', 'TBD', 'TBD']";
    return `    { id: '${c.id}', name: '${c.name}', title: '${c.title || ''}', element: '${c.element}', weaponType: '${c.weaponType}', isNew: ${c.isNew || false}, featured4Stars: ${featured4}, imageUrl: '', imagePosition: 'center 15%' }`;
  }).join(',\n');

  // Build weapon entries
  const weapEntries = bannerData.weapons.map(w => {
    const featured4 = w.featured4Stars ? `[${w.featured4Stars.map(s => `'${s}'`).join(', ')}]` : "['TBD', 'TBD', 'TBD']";
    return `    { id: '${w.id}', name: '${escapeForJSString(w.name)}', title: '${w.title || ''}', type: '${w.type}', forCharacter: '${w.forCharacter}', element: '${w.element}', isNew: ${w.isNew || false}, featured4Stars: ${featured4}, imageUrl: '' }`;
  }).join(',\n');

  // Find and replace the version/phase/dates block
  // We replace from "version:" to just before "characterBannerImage:"
  const oldBlock = buffer.match(
    /(const CURRENT_BANNERS = \{\n\s*version: )'[^']+',\s*phase:\s*\d+[\s\S]*?endDate:\s*'[^']+'/
  );
  if (!oldBlock) {
    log.error('Could not locate CURRENT_BANNERS version/phase/dates block');
    return false;
  }

  const newVersionBlock = `${oldBlock[1]}'${bannerData.version}', phase: ${bannerData.phase}, // Game version (not app version)\n  // Auto-updated by WW Update Agent\n  startDate: '${bannerData.startDate}',\n  endDate: '${bannerData.endDate}'`;
  
  safeReplace(oldBlock[0], newVersionBlock, `Update banner to v${bannerData.version} p${bannerData.phase}`);

  // Replace characters array
  const oldChars = buffer.match(/characters:\s*\[\n([\s\S]*?)\n\s*\],\s*\n\s*weapons:/);
  if (oldChars) {
    safeReplace(
      oldChars[0],
      `characters: [\n${charEntries}\n  ],\n  weapons:`,
      `Update featured characters: ${bannerData.characters.map(c => c.name).join(', ')}`
    );
  } else {
    log.error('Could not match characters array in CURRENT_BANNERS');
    return false;
  }

  // Replace weapons array
  const oldWeaps = buffer.match(/weapons:\s*\[\n([\s\S]*?)\n\s*\],\s*\n\s*\/\/ Standard/);
  if (oldWeaps) {
    safeReplace(
      oldWeaps[0],
      `weapons: [\n${weapEntries}\n  ],\n  // Standard`,
      `Update featured weapons: ${bannerData.weapons.map(w => w.name).join(', ')}`
    );
  } else {
    log.error('Could not match weapons array in CURRENT_BANNERS');
    return false;
  }

  addChange('banners', `Updated to v${bannerData.version} Phase ${bannerData.phase}: ${bannerData.characters.map(c => c.name).join(', ')}`);
  return true;
}

/**
 * Add a new entry to BANNER_HISTORY (prepend to array).
 */
export function addBannerHistoryEntry(entry) {
  const versionComment = `  // Version ${entry.version}`;
  const chars = entry.characters.map(c => `'${c}'`).join(', ');
  const weaps = entry.weapons.map(w => `'${escapeForJSString(w)}'`).join(', ');
  const newEntry = `  { version: '${entry.version}', phase: ${entry.phase}, characters: [${chars}], weapons: [${weaps}], startDate: '${entry.startDate}', endDate: '${entry.endDate}' },`;

  // Find the start of BANNER_HISTORY array
  const marker = 'const BANNER_HISTORY = [\n';
  const idx = buffer.indexOf(marker);
  if (idx === -1) {
    log.error('Could not locate BANNER_HISTORY array');
    return false;
  }

  // Check if this entry already exists (by version + phase)
  const existsPattern = `version: '${entry.version}', phase: ${entry.phase}`;
  if (buffer.includes(existsPattern)) {
    log.warn(`BANNER_HISTORY already contains v${entry.version} p${entry.phase} — skipping`);
    return false;
  }

  // Find the first entry line after the array opening
  const insertPos = idx + marker.length;
  const firstLine = buffer.slice(insertPos, insertPos + 200);

  // Check if the version comment already exists
  const needsComment = !firstLine.includes(`// Version ${entry.version}`);
  const insertion = needsComment
    ? `${versionComment}\n${newEntry}\n`
    : `${newEntry}\n`;

  buffer = buffer.slice(0, insertPos) + insertion + buffer.slice(insertPos);

  log.ok(`Added BANNER_HISTORY entry: v${entry.version} p${entry.phase}`);
  addChange('bannerHistory', `Added v${entry.version} Phase ${entry.phase}`);
  return true;
}

/**
 * Update an event's currentEnd date.
 */
export function updateEventDate(eventKey, newEndDate) {
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(eventKey)) {
    log.warn(`Invalid event key format: ${eventKey}`);
    return false;
  }

  // Find the event block and its currentEnd
  const pattern = new RegExp(
    `(${eventKey}:\\s*\\{[\\s\\S]*?currentEnd:\\s*)'([^']+)'`,
  );
  const match = buffer.match(pattern);
  if (!match) {
    log.warn(`Could not find currentEnd for event "${eventKey}"`);
    return false;
  }

  safeReplace(
    match[0],
    `${match[1]}'${newEndDate}'`,
    `Update ${eventKey} end date → ${newEndDate}`
  );

  addChange('events', `Updated ${eventKey} end date to ${newEndDate}`);
  return true;
}

/**
 * Add a new character entry to CHARACTER_DATA.
 */
export function addCharacterEntry(name, data) {
  // Check if already exists
  if (buffer.includes(`'${name}':`) || buffer.includes(`"${name}":`)) {
    log.dim(`${name} already in CHARACTER_DATA — skipping`);
    return false;
  }

  // Find the end of CHARACTER_DATA (just before the closing };)
  // We insert before the 4★ section if the character is 5★, or at the end of 4★ section
  const isNew5Star = data.rarity === 5;

  // Find insertion point
  const marker = isNew5Star
    ? "  // 4★ Resonators\n"      // Insert before 4-star section
    : "\n};\n\n// Structured combat data"; // Insert before the combat data block

  if (!buffer.includes(marker)) {
    log.error(`Could not find insertion marker for ${name}`);
    return false;
  }

  const skills = data.skills?.map(s => `'${s}'`).join(', ') || "'Skill1', 'Skill2', 'Skill3', 'Skill4'";
  const bestEchoes = data.bestEchoes?.map(e => `'${e}'`).join(', ') || "'TBD', 'TBD'";
  const teams = data.teams?.map(t => `'${t}'`).join(', ') || "'TBD'";

  const entry = `  '${escapeForJSString(name)}': { rarity: ${data.rarity}, element: '${escapeForJSString(data.element)}', weapon: '${escapeForJSString(data.weapon)}', role: '${escapeForJSString(data.role)}',
    desc: '${escapeForJSString(data.desc || '')}',
    skills: [${skills}],
    ascension: { boss: '${escapeForJSString(data.ascension?.boss || 'TBD')}', common: '${escapeForJSString(data.ascension?.common || 'TBD')}', specialty: '${escapeForJSString(data.ascension?.specialty || 'TBD')}' },
    skillMaterials: { weeklyDrop: '${escapeForJSString(data.skillMaterials?.weeklyDrop || 'TBD')}', forgery: '${escapeForJSString(data.skillMaterials?.forgery || 'TBD')}' },
    bestEchoes: [${bestEchoes}], bestWeapon: '${escapeForJSString(data.bestWeapon || 'TBD')}',
    teams: [${teams}] },\n`;

  const insertBefore = isNew5Star ? marker : marker;
  buffer = buffer.replace(insertBefore, entry + insertBefore);

  log.ok(`Added CHARACTER_DATA entry: ${name} (${data.rarity}★ ${data.element} ${data.weapon})`);
  addChange('characters', `Added ${name} (${data.rarity}★ ${data.element} ${data.role})`);
  return true;
}

/**
 * Add a new weapon entry to WEAPON_DATA.
 */
export function addWeaponEntry(name, data) {
  // Check if already exists (both quote styles)
  if (buffer.includes(`'${name}':`) || buffer.includes(`"${name}":`)) {
    log.dim(`${name} already in WEAPON_DATA — skipping`);
    return false;
  }

  // Find the end of WEAPON_DATA
  const marker = "\n};\n\n// [SECTION:EVENTS]";
  if (!buffer.includes(marker)) {
    log.error(`Could not find WEAPON_DATA end marker`);
    return false;
  }

  const bestFor = data.bestFor?.map(b => `'${escapeForJSString(b)}'`).join(', ') || `'${escapeForJSString(data.signatureFor || 'TBD')}'`;
  const qName = name.includes("'") ? `"${name}"` : `'${name}'`;

  const entry = `  ${qName}: { rarity: ${data.rarity}, type: '${escapeForJSString(data.type)}', stat: '${escapeForJSString(data.stat)}', baseAtk: ${data.baseAtk || 587}, subStatValue: '${escapeForJSString(data.subStatValue || 'TBD')}',
    desc: '${escapeForJSString(data.desc || '')}',
    passive: '${escapeForJSString(data.passive || '')}', bestFor: [${bestFor}],
    ascensionMaterials: { forgery: '${escapeForJSString(data.ascensionMaterials?.forgery || 'TBD')}', common: '${escapeForJSString(data.ascensionMaterials?.common || 'TBD')}' } },\n`;

  buffer = buffer.replace(marker, entry + marker);

  log.ok(`Added WEAPON_DATA entry: ${name} (${data.rarity}★ ${data.type})`);
  addChange('weapons', `Added ${name} (${data.rarity}★ ${data.type})`);
  return true;
}

/**
 * Add a name to a list array (ALL_5STAR_RESONATORS, RELEASE_ORDER, etc.)
 */
export function addToList(listName, name) {
  const pattern = new RegExp(`(const ${escapeRegex(listName)}\\s*=\\s*\\[[\\s\\S]*?)(\\];)`);
  const match = buffer.match(pattern);
  if (!match) {
    log.warn(`Could not find list: ${listName}`);
    return false;
  }

  // Check if already present (handle both 'Name' and "Name's Thing" quote styles)
  if (match[1].includes(`'${name}'`) || match[1].includes(`"${name}"`)) {
    log.dim(`${name} already in ${listName}`);
    return false;
  }

  // Use double quotes for names with apostrophes, single quotes otherwise
  const qName = name.includes("'") ? `"${name}"` : `'${name}'`;
  safeReplace(
    match[0],
    `${match[1]}  ${qName},\n${match[2]}`,
    `Add ${name} to ${listName}`
  );
  return true;
}

/**
 * Add a name to the ALL_CHARACTERS Set.
 */
export function addToAllCharacters(name) {
  const pattern = /(const ALL_CHARACTERS = new Set\(\[\n[\s\S]*?)(]\))/;
  const match = buffer.match(pattern);
  if (!match) return false;

  if (match[1].includes(`'${name}'`)) return false;

  // Determine if 4-star or 5-star and add to correct section
  safeReplace(
    match[0],
    `${match[1]}  '${name}',\n${match[2]}`,
    `Add ${name} to ALL_CHARACTERS`
  );
  return true;
}

/**
 * Add combat data entry for a new character.
 */
export function addCombatDataEntry(name, dmgFocus, buffs, debuffs, rarity = 5) {
  // Find the combat data forEach call
  const marker5Star = "  // 4★\n";
  const marker4Star = "].forEach(";

  const marker = rarity === 5 ? marker5Star : marker4Star;
  const dmgArr = (Array.isArray(dmgFocus) ? dmgFocus : []).map(d => `'${d}'`).join(', ');
  const buffArr = (Array.isArray(buffs) ? buffs : []).map(b => `'${b}'`).join(', ');
  const debArr = (Array.isArray(debuffs) ? debuffs : []).map(d => `'${d}'`).join(', ');

  const entry = `  ['${name}',${' '.repeat(Math.max(1, 18 - name.length))}[${dmgArr}],${' '.repeat(Math.max(1, 40 - dmgArr.length))}[${buffArr}],${' '.repeat(Math.max(1, 50 - buffArr.length))}[${debArr}]],\n`;

  if (buffer.includes(marker)) {
    buffer = buffer.replace(marker, entry + marker);
    log.ok(`Added combat data for ${name}`);
    return true;
  }
  return false;
}

/**
 * Flush the buffer to disk (atomic write: temp file → rename).
 */
export function flush() {
  if (!buffer) {
    log.warn('No buffer to flush');
    return false;
  }
  if (buffer.length < 1000 || !buffer.includes('APP_VERSION')) {
    log.error('Buffer appears corrupt or empty — refusing to flush');
    return false;
  }
  // Write to temp file first, then rename — prevents corruption if process dies mid-write
  const tmpPath = PATHS.dataFile + '.tmp';
  try {
    writeFileSync(tmpPath, buffer);
    renameSync(tmpPath, PATHS.dataFile);
  } catch (err) {
    // If rename fails, fall back to direct write
    log.warn(`Atomic write failed, falling back to direct: ${err.message}`);
    writeFileSync(PATHS.dataFile, buffer);
  }
  log.ok(`Wrote updated appcore-data.js (${(buffer.length / 1024).toFixed(1)}KB)`);
  return true;
}

// Utility: escape a string for safe use inside a RegExp
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Utility: escape strings for safe JS string interpolation
function escapeForJSString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\\/g, '\\\\')     // Backslashes first
    .replace(/'/g, "\\'")       // Single quotes
    .replace(/\n/g, '\\n')      // Newlines
    .replace(/\r/g, '\\r')      // Carriage returns
    .replace(/\t/g, '\\t')      // Tabs
    .replace(/\0/g, '\\0')      // Null bytes
    .replace(/`/g, '\\`')       // Backticks
    .replace(/\$/g, '\\$');     // Dollar sign
}
