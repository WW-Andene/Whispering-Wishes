// ═══════════════════════════════════════════════════════════════════════════════
// WW Update Agent — Deployment Verification
//
// After a PR merges, verifies that Vercel deployed successfully.
// Uses GitHub's deployment status API (no Vercel token needed).
//
// If deployment fails:
// 1. Records failure in memory
// 2. Marks recent changes as suspect
// 3. Next run's changelog includes a warning
//
// Runs at the START of each cycle (checks previous merge's deploy status).
// ═══════════════════════════════════════════════════════════════════════════════

import { execSync } from 'child_process';
import { PATHS } from './config.js';
import { log, addChange } from './log.js';

/**
 * Check deployment status via GitHub's deployment API.
 * Returns { status: 'success'|'failure'|'pending'|'unknown', url?, error? }
 */
export async function checkDeploymentStatus() {
  // Method 1: GitHub CLI (works in Actions)
  try {
    const result = execSync(
      'gh api repos/:owner/:repo/deployments --jq ".[0] | {state: .statuses_url, env: .environment, created: .created_at}" 2>/dev/null',
      { cwd: PATHS.repoRoot, encoding: 'utf-8', stdio: 'pipe', timeout: 10000 }
    );
    if (result.trim()) {
      const deployment = JSON.parse(result);
      log.dim(`Latest deployment: ${deployment.env} at ${deployment.created}`);
    }
  } catch {
    // GitHub CLI not available or no permissions — try HTTP
  }

  // Method 2: Check the actual production URL responds
  const productionUrl = 'https://whisperingwishes.app';
  const fallbackUrl = 'https://whispering-wishes.vercel.app';

  for (const url of [productionUrl, fallbackUrl]) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'WhisperingWishes-DeployCheck/1.0' },
      });

      if (res.ok) {
        log.ok(`Deployment healthy: ${url} (${res.status})`);
        return { status: 'success', url, statusCode: res.status };
      } else {
        log.warn(`Deployment issue: ${url} returned ${res.status}`);
        return { status: 'failure', url, statusCode: res.status };
      }
    } catch (err) {
      log.dim(`Could not reach ${url}: ${err.message}`);
      continue;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Neither URL reachable
  log.warn('Could not verify deployment — both URLs unreachable');
  return { status: 'unknown', error: 'Both production URLs unreachable' };
}

/**
 * Run deployment check and update memory.
 * Called at the start of each cycle.
 */
export async function verifyDeployment(memory) {
  // Skip if no recent merge to check
  const lastRun = (memory.runs || []).slice(-1)[0];
  if (!lastRun) return;

  // Only check if the last run had changes
  if (lastRun.changes === 0) return;

  log.info('Checking deployment status...');
  const result = await checkDeploymentStatus();

  if (!memory.deployments) memory.deployments = [];
  memory.deployments.push({
    timestamp: new Date().toISOString(),
    ...result,
  });

  // Trim old entries
  if (memory.deployments.length > 50) {
    memory.deployments = memory.deployments.slice(-50);
  }

  if (result.status === 'failure') {
    log.warn('DEPLOYMENT FAILURE detected — recent changes may have broken the build');
    addChange('deploy-warning', `Production may be down (${result.statusCode || result.error})`);

    // Mark recent evolution patches as suspect
    if (memory.evolutionHistory?.length) {
      const recent = memory.evolutionHistory
        .filter(e => Date.now() - new Date(e.timestamp).getTime() < 24 * 3600000 && e.outcome === 'success');
      for (const entry of recent) {
        entry.outcome = 'suspect-deploy';
      }
    }
  }
}
