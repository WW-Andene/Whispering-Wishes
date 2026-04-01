// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Adaptive Scheduling
//
// Banner transitions are the most critical update events. A 6h micro cycle
// can miss a banner that goes live at 03:00 UTC. This module:
//
// 1. Calculates urgency based on proximity to known banner end date
// 2. Writes a schedule hint file that the GitHub Actions workflow reads
// 3. During high-urgency periods, the workflow runs every 2h instead of 6h
//
// Implementation: The workflow has an extra cron for 2h intervals.
// The agent checks urgency at runtime and exits early if not needed.
// This avoids complex dynamic scheduling — just "run often, exit fast."
// ═══════════════════════════════════════════════════════════════════════════════

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { PATHS } from './config.js';
import { log } from './log.js';

const SCHEDULE_FILE = resolve(PATHS.repoRoot, 'agent/.schedule-hint.json');

/**
 * Calculate current urgency level based on banner timing.
 *
 * @param {string} bannerEndDate — ISO date string
 * @param {Object} memory — agent memory
 * @returns {{ urgency: 'normal'|'elevated'|'critical', hoursLeft: number, shouldRun: boolean }}
 */
export function calculateUrgency(bannerEndDate, memory) {
  const endTime = new Date(bannerEndDate).getTime();

  // Guard against invalid dates
  if (isNaN(endTime)) {
    log.warn(`Invalid banner end date: ${bannerEndDate}`);
    return { urgency: 'normal', hoursLeft: Infinity, shouldRun: true };
  }

  const hoursLeft = (endTime - Date.now()) / 3600000;

  // Post-transition: banner ended within the last 6 hours — new data available
  if (hoursLeft <= 0 && hoursLeft > -6) {
    return { urgency: 'critical', hoursLeft, shouldRun: true };
  }

  // Pre-transition: within 6 hours of banner end
  if (hoursLeft > 0 && hoursLeft <= 6) {
    return { urgency: 'critical', hoursLeft, shouldRun: true };
  }

  // Elevated: within 48 hours of banner end
  if (hoursLeft > 6 && hoursLeft <= 48) {
    return { urgency: 'elevated', hoursLeft, shouldRun: true };
  }

  // Normal: more than 48 hours or banner ended >6h ago
  return { urgency: 'normal', hoursLeft, shouldRun: true };
}

/**
 * Determine if a micro run at this hour should proceed or exit early.
 * During normal periods, micro runs happen at 06/12/18 UTC.
 * During elevated/critical periods, every 2h run proceeds.
 *
 * @param {string} mode — 'full' | 'micro'
 * @param {string} bannerEndDate — ISO date string
 * @returns {{ proceed: boolean, reason: string }}
 */
export function shouldProceed(mode, bannerEndDate) {
  // Full runs always proceed
  if (mode === 'full') return { proceed: true, reason: 'full mode always runs' };

  const { urgency, hoursLeft } = calculateUrgency(bannerEndDate);

  // During critical/elevated: always proceed
  if (urgency === 'critical' || urgency === 'elevated') {
    return { proceed: true, reason: `${urgency} urgency — ${hoursLeft.toFixed(0)}h to banner end` };
  }

  // During normal: only proceed at standard micro hours (06, 12, 18 UTC)
  const hour = new Date().getUTCHours();
  const isStandardMicroHour = [6, 12, 18].includes(hour);

  if (isStandardMicroHour) {
    return { proceed: true, reason: `standard micro hour (${hour}:00 UTC)` };
  }

  // Off-hours during normal urgency — skip
  return { proceed: false, reason: `off-hour (${hour}:00 UTC) during normal urgency — skipping` };
}

/**
 * Write schedule hint for the workflow to read.
 * This allows the workflow to display urgency in PR descriptions.
 */
export function writeScheduleHint(bannerEndDate) {
  const { urgency, hoursLeft } = calculateUrgency(bannerEndDate);

  const hint = {
    urgency,
    hoursLeft: Math.round(hoursLeft),
    bannerEnd: bannerEndDate,
    checkedAt: new Date().toISOString(),
  };

  try {
    writeFileSync(SCHEDULE_FILE, JSON.stringify(hint, null, 2));
  } catch {
    // Non-critical
  }

  return hint;
}

/**
 * Read the last schedule hint.
 */
export function readScheduleHint() {
  if (!existsSync(SCHEDULE_FILE)) return null;
  try {
    const hint = JSON.parse(readFileSync(SCHEDULE_FILE, 'utf-8'));
    if (!hint || typeof hint.urgency !== 'string' || typeof hint.hoursLeft !== 'number') {
      return null;
    }
    return hint;
  } catch {
    return null;
  }
}
