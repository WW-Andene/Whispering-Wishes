// ═══════════════════════════════════════════════════════════════════════════════
// WW-B Dashboard — API Routes
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import {
  createRun, completeRun, getRuns, getRun,
  addFindings, getFindings, getPendingFindings,
  reviewFinding, bulkReview, getApprovedFindings,
  addAction, getActions, getStats,
} from './db.js';

const router = Router();

// ─── Auth middleware ────────────────────────────────────────────────────────

function auth(req, res, next) {
  const token = req.headers['x-dashboard-token'] || req.query.token;
  if (!process.env.DASHBOARD_TOKEN) return next(); // No token set = open
  if (token === process.env.DASHBOARD_TOKEN) return next();
  res.status(401).json({ error: 'Invalid token' });
}

router.use(auth);

// ─── Runs ───────────────────────────────────────────────────────────────────

// List all runs
router.get('/runs', (req, res) => {
  res.json(getRuns(parseInt(req.query.limit) || 20));
});

// Get single run with findings
router.get('/runs/:id', (req, res) => {
  const run = getRun(req.params.id);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  const findings = getFindings(run.id);
  const actions = getActions(run.id);
  res.json({ ...run, findings, actions });
});

// WW-B creates a new run
router.post('/runs', (req, res) => {
  const { runNumber, mode } = req.body;
  if (!runNumber) return res.status(400).json({ error: 'runNumber required' });
  const id = createRun(runNumber, mode || 'full');
  res.json({ id, runNumber });
});

// WW-B completes a run
router.post('/runs/:id/complete', (req, res) => {
  const { summary } = req.body;
  completeRun(req.params.id, summary || '');
  res.json({ ok: true });
});

// ─── Findings ───────────────────────────────────────────────────────────────

// WW-B pushes findings for a run
router.post('/runs/:id/findings', (req, res) => {
  const { findings } = req.body;
  if (!Array.isArray(findings)) return res.status(400).json({ error: 'findings array required' });
  addFindings(parseInt(req.params.id), findings);
  res.json({ ok: true, count: findings.length });
});

// Get findings for a run (optional ?status=pending|approved|rejected)
router.get('/runs/:id/findings', (req, res) => {
  res.json(getFindings(parseInt(req.params.id), req.query.status || null));
});

// All pending findings across all runs
router.get('/findings/pending', (req, res) => {
  res.json(getPendingFindings());
});

// All approved findings (ready to apply)
router.get('/findings/approved', (req, res) => {
  res.json(getApprovedFindings(req.query.runId ? parseInt(req.query.runId) : null));
});

// ─── Review (approve/reject) ────────────────────────────────────────────────

// Review a single finding
router.post('/findings/:id/review', (req, res) => {
  const { status, note } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'status must be approved, rejected, or pending' });
  }
  reviewFinding(parseInt(req.params.id), status, note || '');
  res.json({ ok: true });
});

// Bulk review multiple findings
router.post('/findings/bulk-review', (req, res) => {
  const { ids, status, note } = req.body;
  if (!Array.isArray(ids) || !status) return res.status(400).json({ error: 'ids array and status required' });
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'status must be approved, rejected, or pending' });
  }
  bulkReview(ids, status, note || '');
  res.json({ ok: true, count: ids.length });
});

// ─── Actions (audit log) ────────────────────────────────────────────────────

// WW-B logs an action
router.post('/runs/:id/actions', (req, res) => {
  const { category, description, details } = req.body;
  if (!description) return res.status(400).json({ error: 'description required' });
  addAction(parseInt(req.params.id), category || 'general', description, details);
  res.json({ ok: true });
});

// ─── Stats ──────────────────────────────────────────────────────────────────

router.get('/stats', (req, res) => {
  res.json(getStats());
});

export default router;
