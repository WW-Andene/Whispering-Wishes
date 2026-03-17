// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Data Reader
// Reads and parses the current appcore-data.js to extract live app state.
// Uses regex parsing (no eval) for safety.
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync } from 'fs';
import { PATHS } from './config.js';
import { log } from './log.js';

/**
 * Read the full content of appcore-data.js
 */
export function readDataFile() {
  return readFileSync(PATHS.dataFile, 'utf-8');
}

/**
 * Read package.json version
 */
export function readAppVersion() {
  try {
    const pkg = JSON.parse(readFileSync(PATHS.packageJson, 'utf-8'));
    return pkg.version;
  } catch {
    return null;
  }
}

/**
 * Extract APP_VERSION constant from appcore-data.js
 */
export function extractAppVersion(source) {
  const m = source.match(/const APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
  return m ? m[1] : null;
}

/**
 * Extract CURRENT_BANNERS object data using regex.
 * Returns a structured object with the key banner fields.
 */
export function extractCurrentBanners(source) {
  try {
    const versionMatch = source.match(/CURRENT_BANNERS\s*=\s*\{[\s\S]*?version:\s*'([^']+)'/);
    const phaseMatch = source.match(/CURRENT_BANNERS\s*=\s*\{[\s\S]*?phase:\s*(\d+)/);
    const startMatch = source.match(/CURRENT_BANNERS\s*=\s*\{[\s\S]*?startDate:\s*'([^']+)'/);
    const endMatch = source.match(/CURRENT_BANNERS\s*=\s*\{[\s\S]*?endDate:\s*'([^']+)'/);

    // Extract character names from the characters array
    const charsBlock = source.match(/CURRENT_BANNERS\s*=\s*\{[\s\S]*?characters:\s*\[([\s\S]*?)\]\s*,\s*weapons/);
    const charNames = [];
    if (charsBlock) {
      const nameMatches = charsBlock[1].matchAll(/name:\s*'([^']+)'/g);
      for (const m of nameMatches) charNames.push(m[1]);
    }

    // Extract weapon names
    const weapBlock = source.match(/CURRENT_BANNERS\s*=\s*\{[\s\S]*?weapons:\s*\[([\s\S]*?)\]\s*,\s*\/\//);
    const weapNames = [];
    if (weapBlock) {
      const nameMatches = weapBlock[1].matchAll(/name:\s*['"]([^'"]+)['"]/g);
      for (const m of nameMatches) weapNames.push(m[1]);
    }

    return {
      version: versionMatch?.[1] || '',
      phase: parseInt(phaseMatch?.[1] || '0'),
      startDate: startMatch?.[1] || '',
      endDate: endMatch?.[1] || '',
      characters: charNames.map(n => ({ name: n })),
      weapons: weapNames.map(n => ({ name: n })),
    };
  } catch (err) {
    log.error('Failed to extract CURRENT_BANNERS:', err.message);
    return null;
  }
}

/**
 * Extract all character names from CHARACTER_DATA object.
 */
export function extractCharacterNames(source) {
  const names = [];
  // Match all top-level keys in CHARACTER_DATA = { 'Name': { ... }, ... }
  const block = source.match(/const CHARACTER_DATA\s*=\s*\{([\s\S]*?)\n\};\s*\n/);
  if (!block) return names;

  const keyMatches = block[1].matchAll(/^\s*'([^']+)':\s*\{/gm);
  for (const m of keyMatches) names.push(m[1]);
  return names;
}

/**
 * Extract all weapon names from WEAPON_DATA object.
 */
export function extractWeaponNames(source) {
  const names = [];
  const block = source.match(/const WEAPON_DATA\s*=\s*\{([\s\S]*?)\n\};\s*\n/);
  if (!block) return names;

  const keyMatches = block[1].matchAll(/^\s*['"]([^'"]+)['"]:\s*\{/gm);
  for (const m of keyMatches) names.push(m[1]);
  return names;
}

/**
 * Extract EVENTS object — returns { key: { name, currentEnd, resetType } }
 */
export function extractEvents(source) {
  const events = {};
  // Match each event block
  const eventsBlock = source.match(/const EVENTS\s*=\s*\{([\s\S]*?)\n\};\s*\n/);
  if (!eventsBlock) return events;

  const content = eventsBlock[1];
  
  // Match each event key and its properties
  const eventMatches = content.matchAll(/^  (\w+):\s*\{([\s\S]*?)\n  \}/gm);
  for (const m of eventMatches) {
    const key = m[1];
    const body = m[2];
    const name = body.match(/name:\s*'([^']+)'/)?.[1] || '';
    const currentEnd = body.match(/currentEnd:\s*'([^']+)'/)?.[1] || null;
    const resetType = body.match(/resetType:\s*'([^']+)'/)?.[1] || '';
    const rewards = body.match(/rewards:\s*'([^']+)'/)?.[1] || '';
    events[key] = { name, currentEnd, resetType, rewards };
  }
  return events;
}

/**
 * Extract BANNER_HISTORY array length and last entry.
 */
export function extractBannerHistory(source) {
  const block = source.match(/const BANNER_HISTORY\s*=\s*\[([\s\S]*?)\];\s*\n/);
  if (!block) return { count: 0, lastEntry: null };

  const entries = block[1].matchAll(/\{\s*version:\s*'([^']+)',\s*phase:\s*(\d+)/g);
  const all = [];
  for (const m of entries) all.push({ version: m[1], phase: parseInt(m[2]) });

  return {
    count: all.length,
    firstEntry: all[0] || null,
    lastEntry: all[all.length - 1] || null,
    entries: all,
  };
}

/**
 * Extract all array lists (ALL_5STAR_RESONATORS, ALL_4STAR_RESONATORS, etc.)
 */
export function extractLists(source) {
  const extract = (varName) => {
    const m = source.match(new RegExp(`const ${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
    if (!m) return [];
    // Match both single-quoted 'Name' and double-quoted "Name's Thing" strings
    return [...m[1].matchAll(/(?:'([^']+)'|"([^"]+)")/g)].map(x => x[1] || x[2]);
  };

  return {
    all5StarResonators: extract('ALL_5STAR_RESONATORS'),
    all4StarResonators: extract('ALL_4STAR_RESONATORS'),
    all5StarWeapons: extract('ALL_5STAR_WEAPONS'),
    all4StarWeapons: extract('ALL_4STAR_WEAPONS'),
    all3StarWeapons: extract('ALL_3STAR_WEAPONS'),
    releaseOrder: extract('RELEASE_ORDER'),
    weaponReleaseOrder: extract('WEAPON_RELEASE_ORDER'),
  };
}

/**
 * Extract ALL_CHARACTERS set entries.
 */
export function extractAllCharacters(source) {
  const m = source.match(/const ALL_CHARACTERS\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
  if (!m) return [];
  return [...m[1].matchAll(/(?:'([^']+)'|"([^"]+)")/g)].map(x => x[1] || x[2]);
}

/**
 * Read the full current state needed for diffing.
 */
export function readCurrentState() {
  log.info('Reading current app state from appcore-data.js...');
  const source = readDataFile();

  const state = {
    source,
    appVersion: extractAppVersion(source),
    banners: extractCurrentBanners(source),
    bannerHistory: extractBannerHistory(source),
    characterNames: extractCharacterNames(source),
    weaponNames: extractWeaponNames(source),
    events: extractEvents(source),
    lists: extractLists(source),
    allCharacters: extractAllCharacters(source),
  };

  log.ok(`Read state: v${state.appVersion}, ${state.characterNames.length} chars, ${state.weaponNames.length} weapons, banner v${state.banners?.version} p${state.banners?.phase}`);
  return state;
}
