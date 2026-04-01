// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Checkpoint & Resume
//
// If the agent crashes mid-run (API timeout, OOM, network failure), without
// checkpointing it restarts from scratch — re-fetching sources it already
// fetched, re-analyzing data it already analyzed.
//
// This module saves progress after each major step. On the next run, if a
// checkpoint exists from the last 2 hours, it resumes from where it left off.
//
// Checkpoint data is stored in agent/.checkpoint.json (gitignored).
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { PATHS } from './config.js';
import { log } from './log.js';

const CHECKPOINT_FILE = resolve(PATHS.repoRoot, 'agent/.checkpoint.json');
const MAX_AGE_MS = 2 * 3600000; // Checkpoints older than 2h are stale

/**
 * Save a checkpoint after completing a step.
 *
 * @param {string} mode — 'full' | 'micro'
 * @param {string} completedStep — step name (e.g. 'banners', 'events')
 * @param {Object} stepResult — result data to cache
 */
export function saveCheckpoint(mode, completedStep, stepResult = {}) {
  let checkpoint = loadRawCheckpoint();

  if (!checkpoint || checkpoint.mode !== mode) {
    // New run or different mode — start fresh
    checkpoint = {
      mode,
      startedAt: new Date().toISOString(),
      completedSteps: {},
    };
  }

  checkpoint.completedSteps[completedStep] = {
    completedAt: new Date().toISOString(),
    result: stepResult,
  };
  checkpoint.lastUpdated = new Date().toISOString();

  try {
    writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
  } catch {
    // Non-critical — worst case we just re-run the step
  }
}

/**
 * Check if a step was already completed in the current checkpoint.
 * Returns the cached result or null if not found / stale.
 */
export function getCheckpoint(mode, stepName) {
  const checkpoint = loadRawCheckpoint();
  if (!checkpoint) return null;

  // Wrong mode or too old
  if (checkpoint.mode !== mode) return null;
  const age = Date.now() - new Date(checkpoint.startedAt).getTime();
  if (age > MAX_AGE_MS) {
    clearCheckpoint();
    return null;
  }

  const step = checkpoint.completedSteps?.[stepName];
  if (!step) return null;

  log.dim(`Resuming from checkpoint: ${stepName} (completed ${step.completedAt})`);
  return step.result;
}

/**
 * Get list of completed steps for the current run.
 */
export function getCompletedSteps(mode) {
  const checkpoint = loadRawCheckpoint();
  if (!checkpoint || checkpoint.mode !== mode) return [];

  const age = Date.now() - new Date(checkpoint.startedAt).getTime();
  if (age > MAX_AGE_MS) return [];

  return Object.keys(checkpoint.completedSteps || {});
}

/**
 * Check if any usable checkpoint exists for this mode.
 */
export function hasCheckpoint(mode) {
  const checkpoint = loadRawCheckpoint();
  if (!checkpoint || checkpoint.mode !== mode) return false;

  const age = Date.now() - new Date(checkpoint.startedAt).getTime();
  if (age > MAX_AGE_MS) return false;

  const steps = Object.keys(checkpoint.completedSteps || {});
  return steps.length > 0;
}

/**
 * Clear the checkpoint (called after successful completion).
 */
export function clearCheckpoint() {
  try {
    if (existsSync(CHECKPOINT_FILE)) {
      unlinkSync(CHECKPOINT_FILE);
    }
  } catch {
    // Non-critical
  }
}

/**
 * Wrap a step function with checkpoint support.
 * If the step was already completed (from a crashed run), returns cached result.
 * Otherwise runs the step and saves a checkpoint.
 *
 * @param {string} mode — 'full' | 'micro'
 * @param {string} stepName — unique step identifier
 * @param {Function} stepFn — async function to run (returns any result)
 * @returns {*} — the step result (from cache or live execution)
 */
export async function withCheckpoint(mode, stepName, stepFn) {
  // Check if already completed
  const cached = getCheckpoint(mode, stepName);
  if (cached !== null) {
    return { fromCheckpoint: true, result: cached };
  }

  // Run the step
  const result = await stepFn();

  // Save checkpoint
  // Only cache simple values (booleans, small objects) — not full source content
  const cacheable = typeof result === 'boolean' || typeof result === 'number' || result === null
    ? result
    : { completed: true, hadChanges: !!result };

  saveCheckpoint(mode, stepName, cacheable);
  return { fromCheckpoint: false, result };
}

// ── Internal ─────────────────────────────────────────────────────────────────

function loadRawCheckpoint() {
  if (!existsSync(CHECKPOINT_FILE)) return null;
  try {
    return JSON.parse(readFileSync(CHECKPOINT_FILE, 'utf-8'));
  } catch {
    return null;
  }
}
