// ═══════════════════════════════════════════════════════════════════════════════
// WW-B Dashboard — JSON File Storage
// Zero dependencies. Just reads/writes a JSON file.
// ═══════════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'wwb.json');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function load() {
  try {
    if (existsSync(DB_FILE)) return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
  } catch {}
  return { runs: [], findings: [], actions: [], commands: [], nextId: 1 };
}

function save(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function nextId(data) {
  return data.nextId++;
}

// ─── Runs ───────────────────────────────────────────────────────────────────

export function createRun(runNumber, mode = 'full') {
  const data = load();
  const run = { id: nextId(data), run_number: runNumber, mode, status: 'pending', created_at: new Date().toISOString(), summary: '' };
  data.runs.push(run);
  save(data);
  return run.id;
}

export function completeRun(runId, summary = '') {
  const data = load();
  const run = data.runs.find(r => r.id === runId);
  if (run) { run.status = 'completed'; run.completed_at = new Date().toISOString(); run.summary = summary; }
  save(data);
}

export function getRuns(limit = 20) {
  const data = load();
  return data.runs
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit)
    .map(r => ({
      ...r,
      finding_count: data.findings.filter(f => f.run_id === r.id).length,
      pending_count: data.findings.filter(f => f.run_id === r.id && f.status === 'pending').length,
      approved_count: data.findings.filter(f => f.run_id === r.id && f.status === 'approved').length,
      rejected_count: data.findings.filter(f => f.run_id === r.id && f.status === 'rejected').length,
    }));
}

export function getRun(id) {
  return load().runs.find(r => r.id === id) || null;
}

// ─── Findings ───────────────────────────────────────────────────────────────

export function addFinding(runId, finding) {
  const data = load();
  const f = {
    id: nextId(data), run_id: runId,
    category: finding.category || 'general',
    severity: finding.severity || 'minor',
    title: finding.title || finding.description || '',
    description: finding.description || '',
    file: finding.file || null,
    old_value: finding.old_value || finding.oldValue || null,
    new_value: finding.new_value || finding.newValue || null,
    confidence: finding.confidence || 0,
    status: 'pending',
    review_note: '',
    created_at: new Date().toISOString(),
  };
  data.findings.push(f);
  save(data);
  return f.id;
}

export function addFindings(runId, findings) {
  const data = load();
  for (const finding of findings) {
    data.findings.push({
      id: nextId(data), run_id: runId,
      category: finding.category || 'general',
      severity: finding.severity || 'minor',
      title: finding.title || finding.description || '',
      description: finding.description || '',
      file: finding.file || null,
      old_value: finding.old_value || finding.oldValue || null,
      new_value: finding.new_value || finding.newValue || null,
      confidence: finding.confidence || 0,
      status: 'pending', review_note: '',
      created_at: new Date().toISOString(),
    });
  }
  save(data);
}

export function getFindings(runId, status = null) {
  const data = load();
  let results = data.findings.filter(f => f.run_id === runId);
  if (status) results = results.filter(f => f.status === status);
  return results.sort((a, b) => {
    const sev = { critical: 0, major: 1, minor: 2, nit: 3 };
    return (sev[a.severity] || 9) - (sev[b.severity] || 9) || b.confidence - a.confidence;
  });
}

export function getPendingFindings() {
  const data = load();
  const runs = Object.fromEntries(data.runs.map(r => [r.id, r.run_number]));
  return data.findings
    .filter(f => f.status === 'pending')
    .map(f => ({ ...f, run_number: runs[f.run_id] || '?' }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function reviewFinding(id, status, note = '') {
  const data = load();
  const f = data.findings.find(f => f.id === id);
  if (f) { f.status = status; f.reviewed_at = new Date().toISOString(); f.review_note = note; }
  save(data);
}

export function bulkReview(ids, status, note = '') {
  const data = load();
  for (const id of ids) {
    const f = data.findings.find(f => f.id === id);
    if (f) { f.status = status; f.reviewed_at = new Date().toISOString(); f.review_note = note; }
  }
  save(data);
}

export function getApprovedFindings(runId = null) {
  const data = load();
  let results = data.findings.filter(f => f.status === 'approved');
  if (runId) results = results.filter(f => f.run_id === runId);
  return results;
}

// ─── Actions ────────────────────────────────────────────────────────────────

export function addAction(runId, category, description, details = null) {
  const data = load();
  data.actions.push({
    id: nextId(data), run_id: runId, category, description,
    details: details ? JSON.stringify(details) : null,
    created_at: new Date().toISOString(),
  });
  save(data);
}

export function getActions(runId) {
  return load().actions.filter(a => a.run_id === runId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

// ─── Commands (user instructions to WW-B) ───────────────────────────────────

export function addCommand(text, type = 'instruction') {
  const data = load();
  const cmd = { id: nextId(data), text, type, status: 'pending', created_at: new Date().toISOString(), result: null };
  data.commands.push(cmd);
  save(data);
  return cmd.id;
}

export function getCommands(status = null) {
  const data = load();
  let results = data.commands;
  if (status) results = results.filter(c => c.status === status);
  return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function completeCommand(id, result) {
  const data = load();
  const cmd = data.commands.find(c => c.id === id);
  if (cmd) { cmd.status = 'done'; cmd.result = result; }
  save(data);
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export function getStats() {
  const data = load();
  return {
    total: data.findings.length,
    pending: data.findings.filter(f => f.status === 'pending').length,
    approved: data.findings.filter(f => f.status === 'approved').length,
    rejected: data.findings.filter(f => f.status === 'rejected').length,
    runs: data.runs.length,
    commands: data.commands.filter(c => c.status === 'pending').length,
  };
}
