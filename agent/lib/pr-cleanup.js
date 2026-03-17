// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Stale PR Cleanup
//
// Closes old auto-update PRs before creating new ones.
// Prevents PR pile-up when the human doesn't review for days.
// Uses GitHub CLI (gh) which is pre-installed on GitHub Actions runners.
// ═══════════════════════════════════════════════════════════════════════════════

import { execSync, execFileSync } from 'child_process';
import { PATHS } from './config.js';
import { log } from './log.js';

/**
 * Close all open PRs created by the agent (matching the auto-update label).
 * Called before creating a new PR.
 */
export function closeStalePRs() {
  if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
    log.dim('No GitHub token — skipping stale PR cleanup');
    return 0;
  }

  try {
    // List open PRs with auto-update label
    const result = execSync(
      'gh pr list --label "auto-update" --state open --json number,title,createdAt --limit 20',
      { cwd: PATHS.repoRoot, encoding: 'utf-8', stdio: 'pipe', timeout: 15000 }
    ).trim();

    if (!result || result === '[]') {
      log.dim('No stale auto-update PRs found');
      return 0;
    }

    const prs = JSON.parse(result);
    let closed = 0;

    for (const pr of prs) {
      const ageHours = (Date.now() - new Date(pr.createdAt).getTime()) / 3600000;

      // Close PRs older than 12 hours — they're stale
      if (ageHours > 12) {
        const prNumber = pr.number;
        if (!Number.isInteger(prNumber) || prNumber <= 0) {
          log.warn(`Invalid PR number: ${prNumber} — skipping`);
          continue;
        }
        try {
          execFileSync('gh', ['pr', 'close', String(prNumber), '--comment', 'Superseded by newer auto-update. Closing stale PR.'], {
            cwd: PATHS.repoRoot, encoding: 'utf-8', stdio: 'pipe', timeout: 10000
          });
          log.ok(`Closed stale PR #${prNumber}: ${pr.title} (${ageHours.toFixed(0)}h old)`);
          closed++;
        } catch (err) {
          log.warn(`Could not close PR #${pr.number}: ${err.message}`);
        }
      }
    }

    if (closed) log.ok(`Closed ${closed} stale PR(s)`);
    return closed;
  } catch (err) {
    log.dim(`PR cleanup skipped: ${err.message}`);
    return 0;
  }
}
