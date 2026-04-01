#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — WW-B Maintenance Agent
//
// WW-B is an AUDIT-ONLY agent. It NEVER applies fixes directly.
// It creates a WW-B_maintenance_(x) branch, audits the codebase,
// simulates user scenarios to find bugs, and compiles all findings
// into WW-B_comment_(x).md for human review.
//
// Evolution proposals are compiled but only applied when the comment
// file is reviewed and approved by the maintainer.
//
// Usage:
//   node index.js                     # Full audit cycle
//   node index.js --mode=micro        # Quick check (events, banners)
//   node index.js --dry-run           # Preview without branch/commit
//   node index.js --only=audit        # Only run code audit
//
// Environment: GROQ_API_KEY (required)
// ═══════════════════════════════════════════════════════════════════════════════

import { SOURCES, THRESHOLDS, PATHS } from './lib/config.js';
import { log, addChange, getChangeLog, clearChangeLog } from './lib/log.js';
import { fetchPage, fetchAll } from './lib/scraper.js';
import { analyzeBanners, analyzeEvents, analyzeNewCharacters, analyzeNewWeapons, askClaude } from './lib/ai.js';
import { readCurrentState } from './lib/reader.js';
import { validate } from './lib/validate.js';
import { gitPublish, initBranch, logAction, writeCommentOnly } from './lib/git.js';
import { runSelfAudit } from './lib/audit.js';
import { loadMemory, saveMemory, recordRun } from './lib/memory.js';
import { extractImageUrls, checkUrls, identifyDeadUrlOwners } from './lib/health.js';
import { loadSkills } from './lib/skills.js';
import { generateReport } from './lib/run-report.js';
import { detectNewEvents } from './lib/new-events.js';
import { shouldProceed, writeScheduleHint } from './lib/adaptive-schedule.js';
import { runEvolution } from './lib/evolution.js';

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

async function main() {
  log.section(`WW-B AUDIT AGENT [${MODE.toUpperCase()}]`);
  log.info(`Mode: ${MODE} | Dry run: ${DRY_RUN} | Only: ${ONLY || 'all'}`);

  if (!process.env.GROQ_API_KEY) {
    log.error('GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys');
    safeExit(1);
  }
  clearChangeLog();
  _startTime = Date.now();

  // Create branch BEFORE any work
  if (!DRY_RUN && !NO_GIT) {
    const { branch, runNumber } = initBranch();
    _runNumber = runNumber;
    if (!branch) { log.error('Failed to create WW-B branch — aborting'); safeExit(1); }
    logAction('init', `WW-B audit run #${runNumber} started`, { mode: MODE });
  }

  _memory = loadMemory();
  const memory = _memory;
  loadSkills();

  const state = readCurrentState();
  if (!state.banners) { log.error('Failed to read state — aborting'); safeExit(1); }

  const hoursLeft = (new Date(state.banners.endDate).getTime() - Date.now()) / 3600000;
  log.info(`Banner v${state.banners.version} p${state.banners.phase} — ${hoursLeft.toFixed(0)}h left`);

  // Adaptive scheduling
  const schedule = shouldProceed(MODE, state.banners.endDate);
  if (!schedule.proceed) { log.info(`Skipping: ${schedule.reason}`); safeExit(0); }
  writeScheduleHint(state.banners.endDate);

  // ═══ RUN AUDIT TASKS ══════════════════════════════════════════════════════
  if (MODE === 'micro') await microAudit(state, hoursLeft, memory);
  else await fullAudit(state, hoursLeft, memory);

  // ═══ WRITE REPORT — NEVER APPLY ═══════════════════════════════════════════
  const findings = getChangeLog();
  if (!findings.length) {
    log.section('NO FINDINGS');
    log.ok('Everything looks good.');
  } else {
    log.section(`${findings.length} FINDING(S) COMPILED`);
    findings.forEach(c => log.info(`  [${c.category}] ${c.description}`));
  }

  // Commit the comment file (findings only, no code changes)
  if (!DRY_RUN && !NO_GIT) {
    writeCommentOnly(_runNumber);
  }

  recordRun(memory, MODE, findings.length, Date.now() - _startTime);
  saveMemory(memory);
  generateReport(MODE, Date.now() - _startTime, memory);

  log.section('COMPLETE');
  log.ok('All findings written to WW-B_comment_' + _runNumber + '.md');
  log.ok('Review and approve before applying any changes.');
  if (DRY_RUN) log.warn('DRY RUN — no files modified');
}

// ═══ FULL AUDIT (daily) ═════════════════════════════════════════════════════
async function fullAudit(state, hoursLeft, memory) {
  if (!ONLY || ONLY === 'banners')    { log.section('CHECK BANNERS');    await checkBanners(state); }
  if (!ONLY || ONLY === 'events')     { log.section('CHECK EVENTS');     await checkEvents(state); }
  if (!ONLY || ONLY === 'events')     { log.section('CHECK NEW EVENTS'); await checkNewEvents(state); }
  if (!ONLY || ONLY === 'characters') { log.section('CHECK ROSTER');     await checkRoster(state); }
  if (!ONLY)                          { log.section('HEALTH CHECK');     await checkHealth(state, memory); }
  if (!ONLY || ONLY === 'audit')      { log.section('CODE AUDIT');       await codeAudit(state, 'full', memory); }
  if (!ONLY || ONLY === 'audit')      { log.section('USER SCENARIOS');   await userScenarioTests(state, memory); }
  if (!ONLY)                          { log.section('EVOLUTION PLAN');   await evolutionPlan(state, memory); }
  // Structural validation
  log.section('VALIDATION');
  const v = validate(state.source);
  if (!v.passed) {
    v.errors.forEach(e => { addChange('validation-error', e); logAction('validation', `Error: ${e}`); });
  } else {
    log.ok('Structural validation passed');
    logAction('validation', 'All checks passed');
  }
}

// ═══ MICRO AUDIT (6h intervals) ═════════════════════════════════════════════
async function microAudit(state, hoursLeft, memory) {
  log.section('MICRO — CHECK EVENTS');
  await checkEvents(state);
  if (hoursLeft < THRESHOLDS.bannerExpiryBufferHours) {
    log.section('MICRO — BANNER EXPIRY');
    log.warn(`${hoursLeft.toFixed(0)}h until banner expires`);
    await checkBanners(state);
  }
  log.section('MICRO — QUICK AUDIT');
  await codeAudit(state, 'micro', memory);
}

// ═══ CHECK TASKS (audit only, never apply) ══════════════════════════════════

const _sourceCache = new Map();
async function fetchCached(sourceKey) {
  if (_sourceCache.has(sourceKey)) return _sourceCache.get(sourceKey);
  const results = await fetchAll(SOURCES[sourceKey]);
  const ok = results.filter(s => s.ok);
  _sourceCache.set(sourceKey, ok);
  return ok;
}

async function checkBanners(state) {
  const ok = await fetchCached('banners');
  if (!ok.length) { log.warn('No banner sources'); return; }
  try {
    const a = await analyzeBanners(ok, state.banners);
    if (!a.changed) { log.ok('Banners current'); logAction('banners', 'No changes needed'); return; }
    addChange('banner-update-needed', `New banner detected (confidence: ${(a.confidence*100).toFixed(0)}%) — v${a.banner?.version} p${a.banner?.phase}`, a.confidence);
    logAction('banners', 'Banner update available', {
      confidence: a.confidence,
      version: a.banner?.version,
      phase: a.banner?.phase,
      characters: a.banner?.characters?.map(c => c.name),
      weapons: a.banner?.weapons?.map(w => w.name),
      action: 'REQUIRES MANUAL APPLY',
    });
  } catch (e) { log.warn(`Banner check failed: ${e.message}`); logAction('banners', `Error: ${e.message}`); }
}

async function checkEvents(state) {
  const ok = await fetchCached('events');
  if (!ok.length) { log.warn('No event sources'); return; }
  try {
    const a = await analyzeEvents(ok, state.events);
    for (const u of (a.updates || [])) {
      addChange('event-update-needed', `${u.eventKey}: ${u.oldValue} → ${u.newValue} (${(u.confidence*100).toFixed(0)}%)`, u.confidence);
      logAction('events', `Date update available: ${u.eventKey}`, {
        old: u.oldValue, new: u.newValue, confidence: u.confidence, reason: u.reason,
        action: 'REQUIRES MANUAL APPLY',
      });
    }
    if (!(a.updates || []).length) { log.ok('Events current'); logAction('events', 'No updates needed'); }
  } catch (e) { log.warn(`Event check failed: ${e.message}`); logAction('events', `Error: ${e.message}`); }
}

async function checkNewEvents(state) {
  const ok = await fetchCached('events');
  if (!ok.length) return;
  try {
    const { newEvents } = await detectNewEvents(ok, state.events, askClaude);
    if (!newEvents.length) { log.ok('No new events detected'); return; }
    for (const ev of newEvents) {
      addChange('new-event-detected', `"${ev.name}" (${ev.resetType}, ${(ev.confidence*100).toFixed(0)}%)`, ev.confidence);
      logAction('new-events', `New event found: ${ev.name}`, { ...ev, action: 'REQUIRES MANUAL APPLY' });
    }
  } catch (e) { log.warn(`New event detection failed: ${e.message}`); }
}

async function checkRoster(state) {
  // Characters
  const cOk = await fetchCached('characters');
  if (cOk.length) {
    try {
      const ca = await analyzeNewCharacters(cOk, state.characterNames);
      for (const ch of (ca.newCharacters || [])) {
        addChange('new-character-detected', `${ch.name} (${ch.rarity}★ ${ch.element} ${ch.weapon}, ${(ch.confidence*100).toFixed(0)}%)`, ch.confidence);
        logAction('roster', `New character found: ${ch.name}`, { ...ch, action: 'REQUIRES MANUAL APPLY' });
      }
      if (!(ca.newCharacters || []).length) log.ok('Character roster current');
    } catch (e) { log.warn(`Character check failed: ${e.message}`); }
  }
  // Weapons
  const wOk = await fetchCached('weapons');
  if (wOk.length) {
    try {
      const wa = await analyzeNewWeapons(wOk, state.weaponNames);
      for (const w of (wa.newWeapons || [])) {
        addChange('new-weapon-detected', `${w.name} (${w.rarity}★ ${w.type}, ${(w.confidence*100).toFixed(0)}%)`, w.confidence);
        logAction('roster', `New weapon found: ${w.name}`, { ...w, action: 'REQUIRES MANUAL APPLY' });
      }
      if (!(wa.newWeapons || []).length) log.ok('Weapon roster current');
    } catch (e) { log.warn(`Weapon check failed: ${e.message}`); }
  }
}

async function checkHealth(state, memory) {
  const allUrls = extractImageUrls(state.source);
  const { getStaleUrls, recordUrlCheck } = await import('./lib/memory.js');
  const staleUrls = getStaleUrls(memory, allUrls);
  if (!staleUrls.length) { log.ok(`All ${allUrls.length} URLs checked recently`); return; }
  log.info(`Checking ${staleUrls.length} stale URL(s)`);
  const { alive, dead } = await checkUrls(staleUrls);
  for (const url of alive) recordUrlCheck(memory, url, true);
  for (const d of dead) recordUrlCheck(memory, d.url, false);
  if (dead.length) {
    const owners = identifyDeadUrlOwners(state.source, dead);
    for (const o of owners) {
      addChange('broken-url', `${o.name}: ${o.url} (${o.status})`);
      logAction('health', `Broken URL: ${o.name}`, { url: o.url, status: o.status });
    }
  } else {
    log.ok('All checked URLs alive');
  }
}

async function codeAudit(state, mode, memory) {
  try {
    const patches = await runSelfAudit(askClaude, mode, state, memory);
    if (!patches.length) { log.ok('No issues found'); logAction('audit', 'Code audit clean'); return; }
    // Compile findings — NEVER apply
    for (const p of patches) {
      addChange('audit-finding', `[${p.file}] ${p.description} (${(p.confidence*100).toFixed(0)}%)`, p.confidence);
      logAction('audit', p.description, {
        file: p.file,
        confidence: p.confidence,
        oldString: p.oldString?.slice(0, 200),
        newString: p.newString?.slice(0, 200),
        action: 'REQUIRES MANUAL APPLY',
      });
    }
    log.info(`${patches.length} audit finding(s) compiled — review WW-B_comment_${_runNumber}.md`);
  } catch (e) { log.warn(`Code audit failed: ${e.message}`); logAction('audit', `Error: ${e.message}`); }
}

// ═══ USER SCENARIO TESTS ════════════════════════════════════════════════════
// WW-B simulates user actions to find bugs — like a beta tester thinking
// through real usage patterns and checking for edge cases.

async function userScenarioTests(state, memory) {
  log.info('Running user scenario simulations...');

  const scenarios = [
    {
      name: 'New player first launch',
      prompt: `Simulate a brand new player opening the app for the first time. They have no pull data, no teams set up, nothing in collection. Walk through what they'd see and do. Check for:
- Does the UI show sensible defaults (no NaN, no "undefined", no blank screens)?
- Are there helpful empty states ("No pulls yet — import your history!")?
- Is the onboarding flow clear?
- Any broken UI when all counts are 0?`,
    },
    {
      name: 'Banner transition edge case',
      prompt: `The current banner ends in ${((new Date(state.banners.endDate).getTime() - Date.now()) / 3600000).toFixed(0)} hours. Simulate what happens when:
- The banner has JUST expired (endDate is in the past)
- The app hasn't been updated yet with new banner data
- A user opens the tracker and tries to see their pity count
Check for: countdown showing negative time, crash on expired banner, confusing messaging.`,
    },
    {
      name: 'Collection overflow',
      prompt: `A whale player has every character at S6 (max constellation) and every weapon at R5. They open the collection tab. Check for:
- Do the counts display correctly (S6 not S7)?
- Performance with all items shown?
- Are "owned" filters working when everything is owned?
- Profile picture selector with 60+ owned characters.`,
    },
    {
      name: 'Data import edge cases',
      prompt: `A user tries to import their pull history. Check for edge cases:
- What if the Convene URL has expired?
- What if they paste garbage text instead of a URL?
- What if they import twice — are pulls deduplicated?
- What if the import has pulls for a character not yet in the app's data?`,
    },
    {
      name: 'Team builder stress test',
      prompt: `A user builds a team with 3 characters. Check for:
- What if they pick the same character twice?
- What if they select a weapon not matching the character's weapon type?
- What happens to DPS calculations with missing echo data?
- Rotation timeline with characters that have no skill multiplier data.`,
    },
  ];

  const scenarioSystemPrompt = `You are WW-B, a QA tester for a Wuthering Waves companion web app. You simulate user scenarios and find bugs, edge cases, and UX issues.

Given the app's source code context and a test scenario, analyze what would happen. Focus on:
1. DATA ISSUES: NaN, undefined, null displayed to user, division by zero
2. LOGIC BUGS: Wrong calculations, impossible states, race conditions
3. UX PROBLEMS: Confusing UI, missing empty states, unclear error messages
4. EDGE CASES: Boundary values, empty arrays, expired dates, missing data

For each issue found, report:
- severity: "critical" | "major" | "minor" | "nit"
- description: What the bug/issue is
- location: Which file/component is affected
- scenario: How a user would trigger it
- suggestion: How to fix it

Return JSON: {"issues": [...]} or {"issues": []} if the scenario looks clean.`;

  // Extract key sections of app code for context (keep it lean for Groq)
  const codeContext = [
    `APP_VERSION: ${state.appVersion}`,
    `Characters: ${state.characterNames?.length || 0}`,
    `Weapons: ${state.weaponNames?.length || 0}`,
    `Banner: v${state.banners?.version} p${state.banners?.phase}, ends ${state.banners?.endDate}`,
    `Events: ${Object.keys(state.events || {}).join(', ')}`,
  ].join('\n');

  for (const scenario of scenarios) {
    log.info(`  Scenario: ${scenario.name}`);
    try {
      const response = await askClaude(scenarioSystemPrompt, `APP CONTEXT:\n${codeContext}\n\nSCENARIO: ${scenario.name}\n${scenario.prompt}\n\nReturn ONLY JSON.`, { maxTokens: 2048 });

      let result;
      try {
        // Try to parse JSON from response
        const match = response.match(/\{[\s\S]*\}/);
        result = match ? JSON.parse(match[0]) : { issues: [] };
      } catch {
        result = { issues: [] };
      }

      if (result.issues?.length) {
        for (const issue of result.issues) {
          addChange(`scenario-${issue.severity || 'minor'}`, `[${scenario.name}] ${issue.description}`, 0.7);
          logAction('scenario-test', `${scenario.name}: ${issue.description}`, {
            severity: issue.severity,
            location: issue.location,
            scenario: issue.scenario,
            suggestion: issue.suggestion,
            action: 'REVIEW SUGGESTED FIX',
          });
        }
        log.info(`    → ${result.issues.length} issue(s) found`);
      } else {
        log.ok(`    → Clean`);
        logAction('scenario-test', `${scenario.name}: no issues found`);
      }
    } catch (e) {
      log.warn(`    → Failed: ${e.message}`);
      logAction('scenario-test', `${scenario.name}: error — ${e.message}`);
    }
  }
}

// ═══ EVOLUTION PLAN (compile only, never apply) ═════════════════════════════
// Evolution proposals are written to the comment file.
// They are ONLY applied when the maintainer reviews and approves.

async function evolutionPlan(state, memory) {
  log.info('Generating evolution proposals...');
  logAction('evolution', 'Generating proposals (compile only — requires approval)');

  try {
    // Run evolution in plan-only mode — capture proposals without applying
    const results = await runEvolution(askClaude, memory, state);

    if (results.plan?.actions?.length) {
      for (const action of results.plan.actions) {
        addChange('evolution-proposal', `[${action.type}] ${action.description || action.file}`, 0.5);
        logAction('evolution', `Proposal: ${action.description || action.file}`, {
          type: action.type,
          file: action.file,
          rationale: action.rationale,
          action: 'REQUIRES APPROVAL — review WW-B_comment file before applying',
        });
      }
      log.info(`${results.plan.actions.length} evolution proposal(s) compiled`);
    } else {
      log.ok('No evolution proposals');
      logAction('evolution', 'No improvements identified');
    }
  } catch (e) {
    log.warn(`Evolution planning failed: ${e.message}`);
    logAction('evolution', `Error: ${e.message}`);
  }
}

main().catch(err => { log.error(`Fatal: ${err.message}`); if (err.stack) log.dim(err.stack); safeExit(1); });
