import { Router } from 'express';
import {
  createRun, completeRun, getRuns, getRun,
  addFindings, getFindings, getPendingFindings,
  reviewFinding, bulkReview, getApprovedFindings,
  addAction, getActions, getStats,
  addCommand, getCommands, completeCommand,
} from './db.js';
import { executeCommand, subscribeCommand } from './executor.js';

const router = Router();

// ─── Runs ───────────────────────────────────────────────────────────────────

router.get('/runs', (req, res) => res.json(getRuns(parseInt(req.query.limit) || 20)));

router.get('/runs/:id', (req, res) => {
  const run = getRun(parseInt(req.params.id));
  if (!run) return res.status(404).json({ error: 'Not found' });
  res.json({ ...run, findings: getFindings(run.id), actions: getActions(run.id) });
});

router.post('/runs', (req, res) => {
  const { runNumber, mode } = req.body;
  if (!runNumber) return res.status(400).json({ error: 'runNumber required' });
  res.json({ id: createRun(runNumber, mode || 'full'), runNumber });
});

router.post('/runs/:id/complete', (req, res) => {
  completeRun(parseInt(req.params.id), req.body.summary || '');
  res.json({ ok: true });
});

// ─── Findings ───────────────────────────────────────────────────────────────

router.post('/runs/:id/findings', (req, res) => {
  if (!Array.isArray(req.body.findings)) return res.status(400).json({ error: 'findings array required' });
  addFindings(parseInt(req.params.id), req.body.findings);
  res.json({ ok: true, count: req.body.findings.length });
});

router.get('/runs/:id/findings', (req, res) => {
  res.json(getFindings(parseInt(req.params.id), req.query.status || null));
});

router.get('/findings/pending', (req, res) => res.json(getPendingFindings()));
router.get('/findings/approved', (req, res) => res.json(getApprovedFindings(req.query.runId ? parseInt(req.query.runId) : null)));

// ─── Review ─────────────────────────────────────────────────────────────────

router.post('/findings/:id/review', (req, res) => {
  const { status, note } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  reviewFinding(parseInt(req.params.id), status, note || '');
  res.json({ ok: true });
});

router.post('/findings/bulk-review', (req, res) => {
  const { ids, status, note } = req.body;
  if (!Array.isArray(ids) || !['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'Invalid' });
  bulkReview(ids, status, note || '');
  res.json({ ok: true, count: ids.length });
});

// ─── Actions ────────────────────────────────────────────────────────────────

router.post('/runs/:id/actions', (req, res) => {
  const { category, description, details } = req.body;
  addAction(parseInt(req.params.id), category || 'general', description || '', details);
  res.json({ ok: true });
});

// ─── Commands (user → WW-B, executed live) ──────────────────────────────────

router.get('/commands', (req, res) => res.json(getCommands(req.query.status || null)));

// Send a command — executes immediately via Groq
router.post('/commands', (req, res) => {
  const { text, type } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'text required' });
  const id = addCommand(text.trim(), type || 'instruction');
  // Fire and forget — client subscribes via SSE to get results
  executeCommand(id, text.trim());
  res.json({ ok: true, id });
});

// SSE stream for live command output
router.get('/commands/:id/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  subscribeCommand(parseInt(req.params.id), res);
});

router.post('/commands/:id/complete', (req, res) => {
  completeCommand(parseInt(req.params.id), req.body.result || '');
  res.json({ ok: true });
});

// ─── Stats ──────────────────────────────────────────────────────────────────

router.get('/stats', (req, res) => res.json(getStats()));

export default router;
