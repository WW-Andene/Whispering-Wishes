// ═══════════════════════════════════════════════════════════════════════════════
// WW-B Dashboard — App Context Builder
// Extracts a compact summary of the Whispering Wishes app source code
// to give the LLM real context instead of hallucinating.
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Look for app source relative to dashboard (sibling folder)
const APP_SRC = path.join(__dirname, '..', '..', 'app', 'src');

function readFile(name) {
  const p = path.join(APP_SRC, name);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf-8');
}

function extractSection(source, marker) {
  const idx = source.indexOf(marker);
  if (idx === -1) return '';
  return source.slice(idx, idx + 2000);
}

/**
 * Build a compact context string about the app (~8-12K chars).
 * Includes: structure, key data shapes, component names, state shape.
 */
export function buildAppContext() {
  const parts = [];

  // App structure
  parts.push(`# Whispering Wishes — App Structure
A Wuthering Waves companion web app (React + Vite + Tailwind).
Single-page app with tabs: Tracker, Collection, Teams, Events, Analytics, Calculator, Planner, Profile.
All state in localStorage. No backend DB. Pull data imported via Kuro's Convene History URL.`);

  // Data file summary
  const data = readFile('appcore-data.js');
  if (data) {
    // Extract key exports
    const exports = data.match(/export (const|function) \w+/g) || [];
    parts.push(`\n## appcore-data.js (${(data.length / 1024).toFixed(0)}KB)\nExports: ${exports.map(e => e.replace('export ', '')).join(', ')}`);

    // Extract current banners
    const banners = extractSection(data, 'const CURRENT_BANNERS');
    if (banners) parts.push(`\nCurrent banners:\n${banners.slice(0, 1500)}`);

    // Extract events
    const events = extractSection(data, 'const EVENTS');
    if (events) parts.push(`\nEvents:\n${events.slice(0, 1500)}`);

    // Character count
    const charMatch = data.match(/const CHARACTER_DATA = \{/);
    if (charMatch) {
      const charSection = data.slice(charMatch.index, charMatch.index + 50000);
      const charCount = (charSection.match(/'[^']+': \{/g) || []).length;
      parts.push(`\nCHARACTER_DATA: ${charCount} characters`);
    }
  }

  // Engine summary
  const engine = readFile('appcore-engine.js');
  if (engine) {
    const fns = engine.match(/export (function|const) \w+/g) || [];
    parts.push(`\n## appcore-engine.js (${(engine.length / 1024).toFixed(0)}KB)\nExports: ${fns.map(e => e.replace('export ', '')).join(', ')}`);
  }

  // Components summary
  const components = readFile('appcore-components.jsx');
  if (components) {
    const comps = components.match(/(?:const|function) (\w+)\s*=\s*memo|export default function (\w+)/g) || [];
    parts.push(`\n## appcore-components.jsx (${(components.length / 1024).toFixed(0)}KB)\nComponents: ${comps.join(', ')}`);
  }

  // App.jsx — state shape
  const app = readFile('App.jsx');
  if (app) {
    // Extract useState calls to understand state shape
    const stateVars = app.match(/const \[(\w+),/g) || [];
    parts.push(`\n## App.jsx (${(app.length / 1024).toFixed(0)}KB)\nState variables: ${stateVars.map(s => s.match(/\[(\w+)/)?.[1]).filter(Boolean).join(', ')}`);

    // Extract tab names
    const tabs = app.match(/['"](\w+)['"].*tab|TAB/gi) || [];
    if (tabs.length) parts.push(`Tabs: ${[...new Set(tabs.map(t => t.match(/['"](\w+)['"]/)?.[1]).filter(Boolean))].join(', ')}`);
  }

  // Feature tabs
  const features = ['TrackerTab', 'CollectionTab', 'TeamsTab', 'EventsTab', 'AnalyticsTab', 'CalculatorTab', 'PlannerTab', 'ProfileTab'];
  for (const feat of features) {
    const kebab = feat.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);
    const dir = path.join(APP_SRC, 'features', kebab.replace('-tab', ''));
    const file = path.join(dir, `${feat}.jsx`);
    if (existsSync(file)) {
      const src = readFileSync(file, 'utf-8');
      const lines = src.split('\n').length;
      // Extract first comment block or prop destructuring for context
      const propsMatch = src.match(/export default function \w+\(\{([^}]+)\}/);
      const props = propsMatch ? propsMatch[1].trim() : '';
      parts.push(`\n### ${feat} (${lines} lines)${props ? `\nProps: ${props.slice(0, 200)}` : ''}`);
    }
  }

  const context = parts.join('\n');
  console.log(`[WW-B] App context built: ${(context.length / 1024).toFixed(1)}KB`);
  return context;
}
