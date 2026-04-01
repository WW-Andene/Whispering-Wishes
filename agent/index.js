#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
// WW-B — Audit Agent for Whispering Wishes
//
// WW-B NEVER modifies app code. It audits the codebase, checks game data
// against web sources, simulates user scenarios, and compiles everything
// into WW-B_comment_(x).md for human review.
//
// Workflow:
//   1. Create WW-B_maintenance_(x) branch
//   2. Fetch web sources, compare with app data
//   3. Run code audit, find bugs
//   4. Simulate user scenarios (beta-tester style)
//   5. Generate evolution proposals (if applicable)
//   6. Write WW-B_comment_(x).md with all findings
//   7. Commit & push the comment file only
//
// Usage:
//   node index.js                  # Full audit
//   node index.js --mode=micro     # Quick check (events + banners)
//   node index.js --dry-run        # Preview, no branch/commit
//   node index.js --only=audit     # Code audit only
//
// Environment: GROQ_API_KEY (required)
// ═══════════════════════════════════════════════════════════════════════════════

import { SOURCES, THRESHOLDS } from './lib/config.js';
import { log, addChange, getChangeLog, clearChangeLog } from './lib/log.js';
import { fetchAll } from './lib/scraper.js';
import { readCurrentState } from './lib/reader.js';
import { validate } from './lib/validate.js';
import { initBranch, logAction, writeCommentOnly } from './lib/git.js';
import { loadMemory, saveMemory, recordRun } from './lib/memory.js';
import { extractImageUrls, checkUrls, identifyDeadUrlOwners } from './lib/health.js';
import { loadSkills } from './lib/skills.js';
import { generateReport } from './lib/run-report.js';
import { shouldProceed, writeScheduleHint } from './lib/adaptive-schedule.js';
import { ask } from './lib/ai.js';
import { checkBanners, checkEvents, checkCharacters, checkWeapons } from './lib/checks.js';
import { runScenarios } from './lib/scenarios.js';
import { runSelfAudit } from './lib/audit.js';

// ─── CLI Args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run') || process.env.DRY_RUN === 'true';
const NO_GIT = args.includes('--no-git');
const MODE = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'full';
const ONLY = args.find(a => a.startsWith('--only='))?.split('=')[1] || null;

let _memory = null;
let _startTime = Date.now();
let _runNumber = 0;

process.on('unhandledRejection', (err) => {
  log.error(`Unhandled rejection: ${err?.message || err}`);
  safeExit(1);
});

function safeExit(code) {
  if (_memory) {
    try { saveMemory(_memory); } catch {}
    try { generateReport(MODE, Date.now() - _startTime, _memory); } catch {}
  }
  process.exit(code);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  log.section(`WW-B [${MODE.toUpperCase()}]`);
  log.info(`Mode: ${MODE} | Dry run: ${DRY_RUN} | Only: ${ONLY || 'all'}`);

  // ── Environment ───────────────────────────────────────────────────────────
  if (!process.env.GROQ_API_KEY) {
    log.error('GROQ_API_KEY is not set. Get one at https://console.groq.com/keys');
    safeExit(1);
  }

  clearChangeLog();
  _startTime = Date.now();

  // ── Branch (before any work) ──────────────────────────────────────────────
  if (!DRY_RUN && !NO_GIT) {
    const { branch, runNumber } = initBranch();
    _runNumber = runNumber;
    if (!branch) { log.error('Failed to create branch'); safeExit(1); }
    logAction('init', `WW-B run #${runNumber}`, { mode: MODE });
  }

  // ── Load state ────────────────────────────────────────────────────────────
  _memory = loadMemory();
  loadSkills();

  const state = readCurrentState();
  if (!state.banners) { log.error('Failed to read app state'); safeExit(1); }

  const hoursLeft = (new Date(state.banners.endDate).getTime() - Date.now()) / 3600000;
  log.info(`Banner v${state.banners.version} p${state.banners.phase} — ${hoursLeft.toFixed(0)}h left`);

  // ── Scheduling ────────────────────────────────────────────────────────────
  const schedule = shouldProceed(MODE, state.banners.endDate);
  if (!schedule.proceed) { log.info(`Skipping: ${schedule.reason}`); safeExit(0); }
  writeScheduleHint(state.banners.endDate);

  // ── Run audit ─────────────────────────────────────────────────────────────
  if (MODE === 'micro') await runMicro(state, hoursLeft);
  else                  await runFull(state, hoursLeft);

  // ── Results ───────────────────────────────────────────────────────────────
  const findings = getChangeLog();

  if (!findings.length) {
    log.section('ALL CLEAR');
    log.ok('No issues found.');
  } else {
    log.section(`${findings.length} FINDING(S)`);
    findings.forEach(f => log.info(`  [${f.category}] ${f.description}`));
  }

  // ── Commit comment file ───────────────────────────────────────────────────
  if (!DRY_RUN && !NO_GIT) writeCommentOnly(_runNumber);

  recordRun(_memory, MODE, findings.length, Date.now() - _startTime);
  saveMemory(_memory);

  log.section('DONE');
  log.ok(`Report: WW-B_comment_${_runNumber}.md`);
  if (DRY_RUN) log.warn('DRY RUN — nothing committed');
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL AUDIT
// ═══════════════════════════════════════════════════════════════════════════════

async function runFull(state, hoursLeft) {
  // 1. Game data checks
  if (!ONLY || ONLY === 'banners') await taskCheckBanners(state);
  if (!ONLY || ONLY === 'events')  await taskCheckEvents(state);
  if (!ONLY || ONLY === 'roster')  await taskCheckRoster(state);

  // 2. Health
  if (!ONLY) await taskHealthCheck(state);

  // 3. Structural validation
  log.section('VALIDATION');
  const v = validate(state.source);
  if (v.passed) {
    log.ok('Structural validation passed');
  } else {
    v.errors.forEach(e => {
      addChange('validation-error', e);
      logAction('validation', e);
    });
  }

  // 4. Code audit
  if (!ONLY || ONLY === 'audit') await taskCodeAudit(state);

  // 5. User scenario tests
  if (!ONLY || ONLY === 'audit') await taskScenarios(state);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MICRO AUDIT (quick check)
// ═══════════════════════════════════════════════════════════════════════════════

async function runMicro(state, hoursLeft) {
  log.section('EVENTS');
  await taskCheckEvents(state);

  if (hoursLeft < THRESHOLDS.bannerExpiryBufferHours) {
    log.section('BANNER EXPIRY');
    log.warn(`${hoursLeft.toFixed(0)}h until banner expires`);
    await taskCheckBanners(state);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASKS (all audit-only — report findings, never apply)
// ═══════════════════════════════════════════════════════════════════════════════

const _sourceCache = new Map();
async function fetchCached(key) {
  if (_sourceCache.has(key)) return _sourceCache.get(key);
  const results = await fetchAll(SOURCES[key]);
  const ok = results.filter(s => s.ok);
  _sourceCache.set(key, ok);
  return ok;
}

async function taskCheckBanners(state) {
  log.section('BANNERS');
  const sources = await fetchCached('banners');
  if (!sources.length) { log.warn('No sources available'); return; }
  try {
    const result = await checkBanners(sources, state.banners);
    if (!result.changed) {
      log.ok('Banners up to date');
      logAction('banners', 'Current');
    } else {
      const b = result.banner;
      addChange('banner-update', `v${b?.version} p${b?.phase} detected (${(result.confidence*100).toFixed(0)}%)`, result.confidence);
      logAction('banners', 'Update available', { ...b, confidence: result.confidence, action: 'NEEDS MANUAL APPLY' });
    }
  } catch (e) { log.warn(`Banner check failed: ${e.message}`); }
}

async function taskCheckEvents(state) {
  log.section('EVENTS');
  const sources = await fetchCached('events');
  if (!sources.length) { log.warn('No sources available'); return; }
  try {
    const result = await checkEvents(sources, state.events);
    const updates = result.updates || [];
    const newEvents = result.newEvents || [];

    if (!updates.length && !newEvents.length) {
      log.ok('Events up to date');
      logAction('events', 'Current');
      return;
    }

    for (const u of updates) {
      addChange('event-update', `${u.eventKey}: ${u.oldValue} → ${u.newValue} (${(u.confidence*100).toFixed(0)}%)`, u.confidence);
      logAction('events', `Update: ${u.eventKey}`, { ...u, action: 'NEEDS MANUAL APPLY' });
    }
    for (const ev of newEvents) {
      addChange('new-event', `"${ev.name}" (${(ev.confidence*100).toFixed(0)}%)`, ev.confidence);
      logAction('events', `New: ${ev.name}`, { ...ev, action: 'NEEDS MANUAL APPLY' });
    }
  } catch (e) { log.warn(`Event check failed: ${e.message}`); }
}

async function taskCheckRoster(state) {
  log.section('ROSTER');
  const cSources = await fetchCached('characters');
  if (cSources.length) {
    try {
      const result = await checkCharacters(cSources, state.characterNames);
      for (const ch of (result.newCharacters || [])) {
        addChange('new-character', `${ch.name} (${ch.rarity}★ ${ch.element}, ${(ch.confidence*100).toFixed(0)}%)`, ch.confidence);
        logAction('roster', `New character: ${ch.name}`, { ...ch, action: 'NEEDS MANUAL APPLY' });
      }
      if (!(result.newCharacters || []).length) log.ok('Characters current');
    } catch (e) { log.warn(`Character check failed: ${e.message}`); }
  }

  const wSources = await fetchCached('weapons');
  if (wSources.length) {
    try {
      const result = await checkWeapons(wSources, state.weaponNames);
      for (const w of (result.newWeapons || [])) {
        addChange('new-weapon', `${w.name} (${w.rarity}★ ${w.type}, ${(w.confidence*100).toFixed(0)}%)`, w.confidence);
        logAction('roster', `New weapon: ${w.name}`, { ...w, action: 'NEEDS MANUAL APPLY' });
      }
      if (!(result.newWeapons || []).length) log.ok('Weapons current');
    } catch (e) { log.warn(`Weapon check failed: ${e.message}`); }
  }
}

async function taskHealthCheck(state) {
  log.section('HEALTH');
  const allUrls = extractImageUrls(state.source);
  const { getStaleUrls, recordUrlCheck } = await import('./lib/memory.js');
  const stale = getStaleUrls(_memory, allUrls);
  if (!stale.length) { log.ok(`All ${allUrls.length} URLs checked recently`); return; }

  log.info(`Checking ${stale.length} URL(s)...`);
  const { alive, dead } = await checkUrls(stale);
  for (const url of alive) recordUrlCheck(_memory, url, true);
  for (const d of dead) recordUrlCheck(_memory, d.url, false);

  if (dead.length) {
    const owners = identifyDeadUrlOwners(state.source, dead);
    for (const o of owners) {
      addChange('broken-url', `${o.name}: ${o.url} (${o.status})`);
      logAction('health', `Dead URL: ${o.name}`, o);
    }
  } else {
    log.ok('All URLs alive');
  }
}

async function taskCodeAudit(state) {
  log.section('CODE AUDIT');
  try {
    const patches = await runSelfAudit(ask, MODE === 'micro' ? 'micro' : 'full', state, _memory);
    if (!patches.length) { log.ok('No issues found'); return; }

    for (const p of patches) {
      addChange('audit', `[${p.file}] ${p.description} (${(p.confidence*100).toFixed(0)}%)`, p.confidence);
      logAction('audit', p.description, {
        file: p.file, confidence: p.confidence,
        oldString: p.oldString?.slice(0, 200),
        newString: p.newString?.slice(0, 200),
        action: 'NEEDS MANUAL APPLY',
      });
    }
    log.info(`${patches.length} finding(s)`);
  } catch (e) { log.warn(`Audit failed: ${e.message}`); }
}

async function taskScenarios(state) {
  log.section('USER SCENARIOS');
  try {
    const issues = await runScenarios(state);
    for (const issue of issues) {
      addChange(`scenario-${issue.severity || 'minor'}`, `[${issue.scenario}] ${issue.description}`, 0.7);
      logAction('scenario', `${issue.scenario}: ${issue.description}`, {
        severity: issue.severity, location: issue.location,
        trigger: issue.trigger, suggestion: issue.suggestion,
      });
    }
    if (!issues.length) log.ok('All scenarios clean');
  } catch (e) { log.warn(`Scenarios failed: ${e.message}`); }
}

// ─── Go ─────────────────────────────────────────────────────────────────────
main().catch(err => { log.error(`Fatal: ${err.message}`); safeExit(1); });
