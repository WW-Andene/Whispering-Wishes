// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Run Memory
//
// Persists a JSON log of what the agent has done across runs.
// Prevents: repeating failed attempts, undoing recent changes, re-checking
// items that were just verified, applying the same patch twice.
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { PATHS } from './config.js';
import { log } from './log.js';

const MEMORY_FILE = resolve(PATHS.repoRoot, 'agent/.memory.json');
const MAX_ENTRIES = 200; // Keep last 200 events

/**
 * Load memory from disk. Returns { runs: [], patches: [], failures: [] }
 */
export function loadMemory() {
  if (!existsSync(MEMORY_FILE)) {
    return { runs: [], patches: [], failures: [], checkedUrls: {} };
  }
  try {
    return JSON.parse(readFileSync(MEMORY_FILE, 'utf-8'));
  } catch {
    log.warn('Memory file corrupted — starting fresh');
    return { runs: [], patches: [], failures: [], checkedUrls: {} };
  }
}

/**
 * Save memory to disk.
 */
export function saveMemory(memory) {
  // Trim old entries
  if (memory.runs.length > MAX_ENTRIES) memory.runs = memory.runs.slice(-MAX_ENTRIES);
  if (memory.patches.length > MAX_ENTRIES) memory.patches = memory.patches.slice(-MAX_ENTRIES);
  if (memory.failures.length > MAX_ENTRIES) memory.failures = memory.failures.slice(-MAX_ENTRIES);

  try {
    writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
    log.dim('Memory saved');
  } catch (err) {
    log.warn(`Could not save memory: ${err.message}`);
  }
}

/**
 * Record that a run completed.
 */
export function recordRun(memory, mode, changesApplied, duration) {
  memory.runs.push({
    timestamp: new Date().toISOString(),
    mode,
    changes: changesApplied,
    durationMs: duration,
  });
}

/**
 * Record a patch that was applied (to avoid re-applying).
 */
export function recordPatch(memory, description, file) {
  memory.patches.push({
    timestamp: new Date().toISOString(),
    description,
    file,
  });
}

/**
 * Record a failure (to avoid repeating).
 */
export function recordFailure(memory, category, description) {
  memory.failures.push({
    timestamp: new Date().toISOString(),
    category,
    description,
    retryAfter: new Date(Date.now() + 24 * 3600000).toISOString(), // Retry after 24h
  });
}

/**
 * Check if a patch description was recently applied (within 48h).
 */
export function wasRecentlyPatched(memory, description) {
  const cutoff = Date.now() - 48 * 3600000;
  return memory.patches.some(p =>
    p.description === description && new Date(p.timestamp).getTime() > cutoff
  );
}

/**
 * Check if a category+description recently failed (within retry window).
 */
export function wasRecentFailure(memory, category, description) {
  return memory.failures.some(f =>
    f.category === category &&
    f.description === description &&
    new Date(f.retryAfter).getTime() > Date.now()
  );
}

/**
 * Record a URL health check result.
 */
export function recordUrlCheck(memory, url, isAlive) {
  memory.checkedUrls[url] = {
    alive: isAlive,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Get URLs that haven't been checked in the last 7 days.
 */
export function getStaleUrls(memory, allUrls) {
  const cutoff = Date.now() - 7 * 24 * 3600000;
  return allUrls.filter(url => {
    const record = memory.checkedUrls[url];
    return !record || new Date(record.checkedAt).getTime() < cutoff;
  });
}

/**
 * Build a summary of recent activity for the audit prompt.
 */
export function getRecentActivitySummary(memory) {
  const recentRuns = memory.runs.slice(-5);
  const recentPatches = memory.patches.slice(-10);

  if (!recentRuns.length) return 'No previous runs recorded.';

  const lines = [
    `Last ${recentRuns.length} runs:`,
    ...recentRuns.map(r => `  ${r.timestamp.slice(0, 16)} — ${r.mode} — ${r.changes} changes`),
  ];

  if (recentPatches.length) {
    lines.push(`\nRecent patches (do NOT re-apply these):`);
    lines.push(...recentPatches.map(p => `  - ${p.description}`));
  }

  return lines.join('\n');
}
