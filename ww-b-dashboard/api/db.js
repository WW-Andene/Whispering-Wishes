// ═══════════════════════════════════════════════════════════════════════════════
// WW-B Dashboard — Database (SQLite)
// Stores findings, runs, approvals. Zero config, file-based.
// ═══════════════════════════════════════════════════════════════════════════════

import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'wwb.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ─────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_number INTEGER NOT NULL,
    mode TEXT NOT NULL DEFAULT 'full',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    summary TEXT
  );

  CREATE TABLE IF NOT EXISTS findings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'minor',
    title TEXT NOT NULL,
    description TEXT,
    file TEXT,
    old_value TEXT,
    new_value TEXT,
    confidence REAL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'pending',
    reviewed_at TEXT,
    review_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_findings_run ON findings(run_id);
  CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
  CREATE INDEX IF NOT EXISTS idx_actions_run ON actions(run_id);
`);

// ─── Runs ───────────────────────────────────────────────────────────────────

export function createRun(runNumber, mode = 'full') {
  const stmt = db.prepare('INSERT INTO runs (run_number, mode) VALUES (?, ?)');
  const result = stmt.run(runNumber, mode);
  return result.lastInsertRowid;
}

export function completeRun(runId, summary = '') {
  db.prepare("UPDATE runs SET status = 'completed', completed_at = datetime('now'), summary = ? WHERE id = ?")
    .run(summary, runId);
}

export function getRuns(limit = 20) {
  return db.prepare(`
    SELECT r.*,
      (SELECT COUNT(*) FROM findings WHERE run_id = r.id) as finding_count,
      (SELECT COUNT(*) FROM findings WHERE run_id = r.id AND status = 'approved') as approved_count,
      (SELECT COUNT(*) FROM findings WHERE run_id = r.id AND status = 'rejected') as rejected_count,
      (SELECT COUNT(*) FROM findings WHERE run_id = r.id AND status = 'pending') as pending_count
    FROM runs r ORDER BY r.created_at DESC LIMIT ?
  `).all(limit);
}

export function getRun(id) {
  return db.prepare('SELECT * FROM runs WHERE id = ?').get(id);
}

// ─── Findings ───────────────────────────────────────────────────────────────

export function addFinding(runId, finding) {
  const stmt = db.prepare(`
    INSERT INTO findings (run_id, category, severity, title, description, file, old_value, new_value, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    runId,
    finding.category || 'general',
    finding.severity || 'minor',
    finding.title || finding.description || 'Untitled',
    finding.description || '',
    finding.file || null,
    finding.old_value || finding.oldValue || null,
    finding.new_value || finding.newValue || null,
    finding.confidence || 0,
  );
  return result.lastInsertRowid;
}

export function addFindings(runId, findings) {
  const insert = db.transaction((items) => {
    for (const f of items) addFinding(runId, f);
  });
  insert(findings);
}

export function getFindings(runId, status = null) {
  if (status) {
    return db.prepare('SELECT * FROM findings WHERE run_id = ? AND status = ? ORDER BY severity DESC, confidence DESC')
      .all(runId, status);
  }
  return db.prepare('SELECT * FROM findings WHERE run_id = ? ORDER BY severity DESC, confidence DESC')
    .all(runId);
}

export function getPendingFindings() {
  return db.prepare(`
    SELECT f.*, r.run_number FROM findings f
    JOIN runs r ON f.run_id = r.id
    WHERE f.status = 'pending'
    ORDER BY f.created_at DESC
  `).all();
}

export function reviewFinding(id, status, note = '') {
  db.prepare("UPDATE findings SET status = ?, reviewed_at = datetime('now'), review_note = ? WHERE id = ?")
    .run(status, note, id);
}

export function bulkReview(ids, status, note = '') {
  const stmt = db.prepare("UPDATE findings SET status = ?, reviewed_at = datetime('now'), review_note = ? WHERE id = ?");
  const update = db.transaction((items) => {
    for (const id of items) stmt.run(status, note, id);
  });
  update(ids);
}

export function getApprovedFindings(runId = null) {
  if (runId) {
    return db.prepare("SELECT * FROM findings WHERE run_id = ? AND status = 'approved'").all(runId);
  }
  return db.prepare("SELECT * FROM findings WHERE status = 'approved' ORDER BY created_at DESC").all();
}

// ─── Actions (audit log) ────────────────────────────────────────────────────

export function addAction(runId, category, description, details = null) {
  db.prepare('INSERT INTO actions (run_id, category, description, details) VALUES (?, ?, ?, ?)')
    .run(runId, category, description, details ? JSON.stringify(details) : null);
}

export function getActions(runId) {
  return db.prepare('SELECT * FROM actions WHERE run_id = ? ORDER BY created_at ASC').all(runId);
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export function getStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM findings').get().count;
  const approved = db.prepare("SELECT COUNT(*) as count FROM findings WHERE status = 'approved'").get().count;
  const rejected = db.prepare("SELECT COUNT(*) as count FROM findings WHERE status = 'rejected'").get().count;
  const pending = db.prepare("SELECT COUNT(*) as count FROM findings WHERE status = 'pending'").get().count;
  const runs = db.prepare('SELECT COUNT(*) as count FROM runs').get().count;
  return { total, approved, rejected, pending, runs };
}

export default db;
