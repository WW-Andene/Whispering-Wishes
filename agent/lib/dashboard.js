// ═══════════════════════════════════════════════════════════════════════════════
// WW-B — Dashboard API Connector
// Pushes findings and actions to the WW-B dashboard for review.
// Falls back to markdown file if dashboard is unreachable.
// ═══════════════════════════════════════════════════════════════════════════════

import { log } from './log.js';

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3001';
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN || '';

async function api(path, body = null) {
  const opts = {
    headers: {
      'Content-Type': 'application/json',
      ...(DASHBOARD_TOKEN ? { 'x-dashboard-token': DASHBOARD_TOKEN } : {}),
    },
    signal: AbortSignal.timeout(10000),
  };
  if (body) {
    opts.method = 'POST';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${DASHBOARD_URL}/api${path}`, opts);
  if (!res.ok) throw new Error(`Dashboard API ${res.status}: ${await res.text()}`);
  return res.json();
}

let _available = null;

/**
 * Check if the dashboard is reachable.
 */
export async function isDashboardAvailable() {
  if (_available !== null) return _available;
  try {
    await api('/stats');
    _available = true;
    log.ok(`Dashboard connected: ${DASHBOARD_URL}`);
  } catch {
    _available = false;
    log.dim('Dashboard not reachable — findings will go to comment file only');
  }
  return _available;
}

/**
 * Create a new run in the dashboard. Returns the run ID.
 */
export async function createDashboardRun(runNumber, mode) {
  try {
    const { id } = await api('/runs', { runNumber, mode });
    log.ok(`Dashboard run created: #${runNumber} (id=${id})`);
    return id;
  } catch (e) {
    log.warn(`Dashboard createRun failed: ${e.message}`);
    return null;
  }
}

/**
 * Push findings to the dashboard.
 */
export async function pushFindings(dashboardRunId, findings) {
  if (!dashboardRunId || !findings.length) return false;
  try {
    await api(`/runs/${dashboardRunId}/findings`, { findings });
    log.ok(`Pushed ${findings.length} findings to dashboard`);
    return true;
  } catch (e) {
    log.warn(`Dashboard pushFindings failed: ${e.message}`);
    return false;
  }
}

/**
 * Log an action to the dashboard.
 */
export async function pushAction(dashboardRunId, category, description, details = null) {
  if (!dashboardRunId) return;
  try {
    await api(`/runs/${dashboardRunId}/actions`, { category, description, details });
  } catch { /* silent — action log is non-critical */ }
}

/**
 * Complete the run in the dashboard.
 */
export async function completeDashboardRun(dashboardRunId, summary) {
  if (!dashboardRunId) return;
  try {
    await api(`/runs/${dashboardRunId}/complete`, { summary });
  } catch (e) {
    log.warn(`Dashboard completeRun failed: ${e.message}`);
  }
}

/**
 * Get approved findings from the dashboard (for future apply workflow).
 */
export async function getApprovedFindings(runId = null) {
  try {
    const path = runId ? `/findings/approved?runId=${runId}` : '/findings/approved';
    return await api(path);
  } catch (e) {
    log.warn(`Dashboard getApproved failed: ${e.message}`);
    return [];
  }
}
