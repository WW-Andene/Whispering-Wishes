// ═══════════════════════════════════════════════════════════════════════════════
// WW-B Dashboard — Smart Context Loader
// Two-step approach: picks relevant files, then loads them in full.
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync, existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_SRC = path.join(__dirname, '..', '..', 'app', 'src');

// All source files with their sizes
function getFileMap() {
  const files = {};

  function scan(dir, prefix = '') {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        scan(path.join(dir, entry.name), rel);
      } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
        const full = path.join(dir, entry.name);
        const content = readFileSync(full, 'utf-8');
        files[rel] = { path: full, lines: content.split('\n').length, chars: content.length };
      }
    }
  }

  scan(APP_SRC);
  return files;
}

// Keyword mapping: what terms map to which files
const KEYWORD_FILES = {
  'banner': ['appcore-data.js', 'features/tracker/TrackerTab.jsx', 'features/events/EventsTab.jsx'],
  'event': ['appcore-data.js', 'features/events/EventsTab.jsx'],
  'collection': ['features/collection/CollectionTab.jsx', 'appcore-components.jsx'],
  'team': ['features/teams/TeamsTab.jsx', 'features/teams/EchoSelector.jsx', 'features/teams/WeaponSelector.jsx', 'features/teams/TeamSelector.jsx'],
  'tracker': ['features/tracker/TrackerTab.jsx'],
  'pull': ['features/tracker/TrackerTab.jsx', 'utils/gachaImporter.js'],
  'import': ['utils/gachaImporter.js', 'features/profile/ProfileTab.jsx'],
  'pity': ['features/tracker/TrackerTab.jsx', 'appcore-engine.js'],
  'calculator': ['features/calculator/CalculatorTab.jsx'],
  'planner': ['features/planner/PlannerTab.jsx'],
  'analytics': ['features/analytics/AnalyticsTab.jsx'],
  'profile': ['features/profile/ProfileTab.jsx', 'features/profile/AdminPanel.jsx'],
  'echo': ['features/teams/EchoSelector.jsx', 'data/echoes.js'],
  'weapon': ['features/teams/WeaponSelector.jsx', 'data/weapons.js', 'appcore-data.js'],
  'character': ['appcore-data.js', 'appcore-components.jsx'],
  'dps': ['features/teams/TeamsTab.jsx'],
  'new player': ['App.jsx', 'features/tracker/TrackerTab.jsx'],
  'onboard': ['App.jsx'],
  'bug': ['App.jsx', 'appcore-engine.js', 'appcore-providers.jsx'],
  'crash': ['App.jsx', 'appcore-providers.jsx'],
  'state': ['App.jsx', 'appcore-providers.jsx'],
  'component': ['appcore-components.jsx'],
  'modal': ['appcore-components.jsx', 'appcore-providers.jsx'],
  'image': ['appcore-data.js', 'appcore-components.jsx'],
  'countdown': ['appcore-engine.js', 'features/events/EventsTab.jsx'],
  'timer': ['appcore-engine.js', 'features/events/EventsTab.jsx'],
};

/**
 * Pick which files are relevant to a user's command.
 * Returns an array of filenames.
 */
export function pickRelevantFiles(commandText) {
  const text = commandText.toLowerCase();
  const matched = new Set();

  // Always include core files
  matched.add('App.jsx');
  matched.add('appcore-engine.js');

  // Keyword matching
  for (const [keyword, files] of Object.entries(KEYWORD_FILES)) {
    if (text.includes(keyword)) {
      for (const f of files) matched.add(f);
    }
  }

  // If it's a broad audit/scenario request, include all feature tabs
  if (text.includes('audit') || text.includes('scenario') || text.includes('bug') || text.includes('full') || text.includes('simulate')) {
    matched.add('appcore-data.js');
    matched.add('appcore-components.jsx');
    matched.add('appcore-providers.jsx');
    matched.add('features/tracker/TrackerTab.jsx');
    matched.add('features/collection/CollectionTab.jsx');
    matched.add('features/teams/TeamsTab.jsx');
    matched.add('features/events/EventsTab.jsx');
    matched.add('features/analytics/AnalyticsTab.jsx');
    matched.add('features/profile/ProfileTab.jsx');
  }

  return [...matched];
}

/**
 * Load file contents, respecting a total character budget.
 * Larger files get truncated to fit the budget.
 */
export function loadFiles(fileNames, maxChars = 90000) {
  const parts = [];
  let remaining = maxChars;

  // Sort: smaller files first (they fit whole), big files last (get truncated)
  const withSize = fileNames.map(name => {
    const full = path.join(APP_SRC, name);
    if (!existsSync(full)) return null;
    const content = readFileSync(full, 'utf-8');
    return { name, content, size: content.length };
  }).filter(Boolean).sort((a, b) => a.size - b.size);

  for (const file of withSize) {
    if (remaining <= 0) break;

    if (file.size <= remaining) {
      // Fits whole
      parts.push(`\n═══ ${file.name} (${file.content.split('\n').length} lines) ═══\n${file.content}`);
      remaining -= file.size;
    } else if (remaining > 2000) {
      // Truncate — take first and last portions
      const half = Math.floor(remaining / 2);
      const head = file.content.slice(0, half);
      const tail = file.content.slice(-half);
      parts.push(`\n═══ ${file.name} (TRUNCATED — ${file.content.split('\n').length} lines, showing first+last ${(remaining/1024).toFixed(0)}KB) ═══\n${head}\n\n... [TRUNCATED] ...\n\n${tail}`);
      remaining = 0;
    }
  }

  return parts.join('\n');
}

/**
 * Build context for a specific command — loads relevant source files.
 */
export function buildContext(commandText) {
  const files = pickRelevantFiles(commandText);
  const fileMap = getFileMap();

  console.log(`[WW-B] Relevant files for command: ${files.join(', ')}`);

  const inventory = Object.entries(fileMap)
    .map(([name, info]) => `  ${name} (${info.lines} lines)`)
    .join('\n');

  const header = `# Whispering Wishes — Source Code
React + Vite + Tailwind. Single-page app, all state in localStorage.
Tabs: Tracker, Collection, Teams, Events, Analytics, Calculator, Planner, Profile.

## All source files:\n${inventory}\n\n## Loaded files for this query:`;

  const loaded = loadFiles(files);

  const context = header + loaded;
  console.log(`[WW-B] Context: ${(context.length / 1024).toFixed(1)}KB (${files.length} files)`);
  return context;
}
