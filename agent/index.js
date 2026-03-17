#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — Autonomous Update Agent v2
//
// Two operational modes:
//   FULL  (daily at 00:00 UTC) — banners, events, characters, weapons, images,
//         data enrichment, self-audit code improvements
//   MICRO (every 6h: 06:00, 12:00, 18:00 UTC) — event timers, banner expiry,
//         quick-fix audit
//
// Usage:
//   node index.js --mode=full|micro|audit  --only=banners|events|characters|images|audit
//   node index.js --dry-run --no-git
//
// Environment: ANTHROPIC_API_KEY (required), IMGBB_API_KEY (for images)
// ═══════════════════════════════════════════════════════════════════════════════

import { SOURCES, THRESHOLDS, PATHS } from './lib/config.js';
import { log, addChange, getChangeLog, clearChangeLog } from './lib/log.js';
import { fetchPage, fetchAll } from './lib/scraper.js';
import { analyzeBanners, analyzeEvents, analyzeNewCharacters, analyzeNewWeapons, generateCombatData, askClaude } from './lib/ai.js';
import { readCurrentState, readDataFile } from './lib/reader.js';
import { loadBuffer, getBuffer, flush, bumpVersion, updateCurrentBanners, addBannerHistoryEntry, updateEventDate, addCharacterEntry, addWeaponEntry, addToList, addToAllCharacters, addCombatDataEntry } from './lib/writer.js';
import { validate } from './lib/validate.js';
import { gitPublish } from './lib/git.js';
import { processMissingImages, findMissingImages } from './lib/images.js';
import { runSelfAudit, applyPatches, enrichData } from './lib/audit.js';
import { loadMemory, saveMemory, recordRun, recordPatch, recordFailure, wasRecentlyPatched } from './lib/memory.js';
import { extractImageUrls, checkUrls, identifyDeadUrlOwners } from './lib/health.js';
import { loadSkills } from './lib/skills.js';
import { findEmptyBannerImages, findBannerImages, applyBannerImages } from './lib/banner-images.js';
import { runEvolution, applyEvolutionPatches, checkEvolutionHealth } from './lib/evolution.js';
import { checkRollbackNeeded } from './lib/shell-swap.js';
import { selectCharactersForRefresh, refreshCharacterBuilds, applyMetaUpdates, recordRefresh } from './lib/meta-refresh.js';
import { generateReport, recordApiCall } from './lib/run-report.js';
import { checkStandardPool, applyStandardPoolUpdates } from './lib/standard-pool.js';
import { closeStalePRs } from './lib/pr-cleanup.js';
import { generateEntries, appendToChangelog, updateAppChangelog } from './lib/changelog.js';
import { crossVerify, extractPerSource, adjustConfidence } from './lib/cross-verify.js';
import { detectNewEvents, addNewEvent } from './lib/new-events.js';
import { verifyDeployment } from './lib/deploy-check.js';
import { shouldProceed, writeScheduleHint, calculateUrgency } from './lib/adaptive-schedule.js';
import { withCheckpoint, clearCheckpoint, hasCheckpoint } from './lib/checkpoint.js';
import { readFileSync } from 'fs';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run') || process.env.DRY_RUN === 'true';
const NO_GIT = args.includes('--no-git');
const MODE = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'full';
const ONLY = args.find(a => a.startsWith('--only='))?.split('=')[1] || null;

// Global state for cleanup on any exit path
let _memory = null;
let _startTime = Date.now();

// BUG 11 FIX: Catch unhandled rejections
process.on('unhandledRejection', (err) => {
  log.error(`Unhandled rejection: ${err?.message || err}`);
  safeExit(1);
});

/** Save memory and exit cleanly — used by every exit path */
function safeExit(code) {
  if (_memory) {
    try { saveMemory(_memory); } catch {}
    try { generateReport(MODE, Date.now() - _startTime, _memory); } catch {}
  }
  process.exit(code);
}

async function main() {
  log.section(`WW UPDATE AGENT v2 [${MODE.toUpperCase()}]`);
  log.info(`Mode: ${MODE} | Dry run: ${DRY_RUN} | Only: ${ONLY || 'all'}`);

  // Validate required environment
  if (!process.env.ANTHROPIC_API_KEY) {
    log.error('ANTHROPIC_API_KEY is not set or is empty.');
    log.error('Go to GitHub repo → Settings → Secrets → Actions');
    log.error('Delete and re-create the secret. The key starts with sk-ant-api03-...');
    safeExit(1);
  }
  clearChangeLog();
  _startTime = Date.now();

  // Load persistent memory and skills
  _memory = loadMemory();
  const memory = _memory;
  loadSkills();

  // Check if previous evolution patches caused problems
  checkEvolutionHealth(memory);

  // Check if a shell-swap needs rollback
  const rollbackTo = checkRollbackNeeded(memory);
  if (rollbackTo) {
    log.warn(`Post-swap failure detected. Rollback to ${rollbackTo.slice(0, 8)} recommended.`);
    log.warn('Run: git revert HEAD --no-edit && git push');
    // Don't auto-revert — leave it for the PR review or manual action
    addChange('rollback-warning', `Shell-swap may have caused failures. Known-good: ${rollbackTo.slice(0, 8)}`);
  }

  const state = readCurrentState();
  if (!state.banners) { log.error('Failed to read state — aborting'); safeExit(1); }
  loadBuffer(state.source);

  const hoursLeft = (new Date(state.banners.endDate).getTime() - Date.now()) / 3600000;
  log.info(`Banner v${state.banners.version} p${state.banners.phase} — ${hoursLeft.toFixed(0)}h left`);

  // Adaptive scheduling: check if this run should proceed
  const schedule = shouldProceed(MODE, state.banners.endDate);
  if (!schedule.proceed) {
    log.info(`Skipping: ${schedule.reason}`);
    safeExit(0);
  }
  if (schedule.reason.includes('urgency')) {
    log.warn(`Adaptive scheduling: ${schedule.reason}`);
  }
  writeScheduleHint(state.banners.endDate);

  // Deployment verification: check if previous changes deployed OK
  await verifyDeployment(memory);

  // Checkpoint: check if resuming from a crashed run
  if (hasCheckpoint(MODE)) {
    log.info('Checkpoint found — resuming from previous crashed run');
  }

  let hasChanges = false;

  if (MODE === 'micro') hasChanges = await microCycle(state, hoursLeft, memory);
  else if (MODE === 'audit') hasChanges = await auditCycle(state, memory);
  else hasChanges = await fullCycle(state, hoursLeft, memory);

  if (!hasChanges) { log.section('NO UPDATES'); log.ok('Everything current.'); recordRun(memory, MODE, 0, Date.now() - _startTime); safeExit(0); }

  if (!DRY_RUN) bumpVersion(state.appVersion);
  const v = validate(getBuffer());
  if (!v.passed) { log.section('VALIDATION FAILED'); v.errors.forEach(e => log.error(`  ✗ ${e}`)); recordFailure(memory, 'validation', v.errors[0]); safeExit(1); }

  // Generate changelog entries before flushing (needs change log)
  const newVersion = getBuffer().match(/const APP_VERSION = '([^']+)'/)?.[1] || state.appVersion;
  const changelogEntries = generateEntries(MODE, newVersion);
  if (changelogEntries.length && !DRY_RUN) {
    appendToChangelog(changelogEntries, newVersion);
    updateAppChangelog(changelogEntries, getBuffer, loadBuffer);
  }

  if (!DRY_RUN) flush();

  if (!DRY_RUN && !NO_GIT) {
    // Clean up stale PRs before creating a new one
    closeStalePRs();

    const summary = getChangeLog().slice(0, 3).map(c => c.description).join('; ').slice(0, 72);
    gitPublish(`${MODE}: ${summary}`);
  }

  // Save memory and generate report
  recordRun(memory, MODE, getChangeLog().length, Date.now() - _startTime);
  saveMemory(memory);
  generateReport(MODE, Date.now() - _startTime, memory);

  _sourceCache.clear();

  log.section('COMPLETE');
  getChangeLog().forEach(c => log.ok(`  [${c.category}] ${c.description}`));
  if (DRY_RUN) log.warn('DRY RUN — no files modified');
}

// ═══ FULL CYCLE (daily 00:00 UTC) ════════════════════════════════════════════
async function fullCycle(state, hoursLeft, memory) {
  let c = false;
  if (!ONLY || ONLY === 'banners')    { log.section('BANNERS');        if (await withCheckpoint(MODE, 'banners', () => doBanners(state))) c = true; }
  if (!ONLY || ONLY === 'events')     { log.section('EVENTS');         if (await withCheckpoint(MODE, 'events', () => doEvents(state))) c = true; }
  if (!ONLY || ONLY === 'events')     { log.section('NEW EVENTS');     if (await withCheckpoint(MODE, 'new-events', () => doNewEvents(state))) c = true; }
  if (!ONLY || ONLY === 'characters') { log.section('ROSTER');         if (await withCheckpoint(MODE, 'roster', () => doRoster(state))) c = true; }
  if (!ONLY || ONLY === 'images')     { log.section('IMAGES');         if (await withCheckpoint(MODE, 'images', () => doImages(state))) c = true; }
  if (!ONLY || ONLY === 'banners' || ONLY === 'images') {
    log.section('BANNER IMAGES');       if (await withCheckpoint(MODE, 'banner-images', () => doBannerImages(state))) c = true;
  }
  if (!ONLY)                          { log.section('STANDARD POOL');  if (await withCheckpoint(MODE, 'std-pool', () => doStandardPool(state))) c = true; }
  if (!ONLY)                          { log.section('META REFRESH');   if (await withCheckpoint(MODE, 'meta-refresh', () => doMetaRefresh(state, memory))) c = true; }
  if (!ONLY)                          { log.section('HEALTH CHECK');   await withCheckpoint(MODE, 'health', () => doHealthCheck(state, memory)); }
  if (!ONLY)                          { log.section('ENRICHMENT');     if (await withCheckpoint(MODE, 'enrichment', () => doEnrich(state))) c = true; }
  if (!ONLY || ONLY === 'audit')      { log.section('SELF-AUDIT');     if (await withCheckpoint(MODE, 'audit', () => doAudit(state, 'full', memory))) c = true; }
  if (!ONLY)                          { log.section('EVOLUTION');      await withCheckpoint(MODE, 'evolution', () => doEvolution(state, memory)); }
  clearCheckpoint(); // Success — no need to resume
  return c;
}

// ═══ MICRO CYCLE (6h intervals) ══════════════════════════════════════════════
async function microCycle(state, hoursLeft, memory) {
  let c = false;
  log.section('MICRO — EVENTS');
  if (await withCheckpoint(MODE, 'events', () => doEvents(state))) c = true;
  if (hoursLeft < THRESHOLDS.bannerExpiryBufferHours) {
    log.section('MICRO — BANNER EXPIRY');
    log.warn(`${hoursLeft.toFixed(0)}h until banner expires — checking`);
    if (await withCheckpoint(MODE, 'banners', () => doBanners(state))) c = true;
  }
  log.section('MICRO — BANNER IMAGES');
  if (await withCheckpoint(MODE, 'banner-images', () => doBannerImages(state))) c = true;
  log.section('MICRO — QUICK FIXES');
  if (await withCheckpoint(MODE, 'audit', () => doAudit(state, 'micro', memory))) c = true;
  clearCheckpoint();
  return c;
}

// ═══ AUDIT-ONLY CYCLE ════════════════════════════════════════════════════════
async function auditCycle(state, memory) {
  log.section('SELF-AUDIT (standalone)');
  return await doAudit(state, 'full', memory);
}

// ═══ TASK FUNCTIONS ══════════════════════════════════════════════════════════

// Cache fetched sources within a single run to avoid duplicate requests
const _sourceCache = new Map();
async function fetchCached(sourceKey) {
  if (_sourceCache.has(sourceKey)) return _sourceCache.get(sourceKey);
  const results = await fetchAll(SOURCES[sourceKey]);
  const ok = results.filter(s => s.ok);
  _sourceCache.set(sourceKey, ok);
  return ok;
}

async function doBanners(state) {
  const ok = await fetchCached('banners');
  
  if (!ok.length) { log.warn('No banner sources'); return false; }
  const a = await analyzeBanners(ok, state.banners);
  if (!a.changed) { log.ok('Banners current'); return false; }
  if (a.confidence < THRESHOLDS.autoApplyConfidence) { log.warn(`Low confidence ${(a.confidence*100).toFixed(0)}%`); return false; }
  if (DRY_RUN) { log.json('[DRY] Banner', a.banner); return false; }
  const old = state.banners;
  addBannerHistoryEntry({ version: old.version, phase: old.phase, characters: old.characters.map(c=>c.name), weapons: old.weapons.map(w=>w.name), startDate: old.startDate.split('T')[0], endDate: old.endDate.split('T')[0] });
  updateCurrentBanners(a.banner);
  return true;
}

async function doEvents(state) {
  const ok = await fetchCached('events');
  if (!ok.length) { log.warn('No event sources'); return false; }
  const a = await analyzeEvents(ok, state.events);
  let c = false;
  for (const u of (a.updates || [])) {
    if (u.confidence >= THRESHOLDS.autoApplyConfidence) {
      if (DRY_RUN) { log.info(`[DRY] ${u.eventKey} → ${u.newValue}`); continue; }
      updateEventDate(u.eventKey, u.newValue); c = true;
    }
  }
  if (!c) log.ok('Events current');
  return c;
}

async function doNewEvents(state) {
  const ok = await fetchCached('events');
  if (!ok.length) { log.warn('No sources for new event detection'); return false; }
  const { newEvents } = await detectNewEvents(ok, state.events, askClaude);
  if (!newEvents.length) { log.ok('No new events detected'); return false; }
  if (DRY_RUN) { log.json('[DRY] New events', newEvents); return false; }
  let c = false;
  for (const event of newEvents) {
    if (event.confidence >= THRESHOLDS.autoApplyConfidence) {
      if (addNewEvent(event, getBuffer, loadBuffer)) c = true;
    } else {
      log.warn(`New event "${event.name}" confidence ${(event.confidence * 100).toFixed(0)}% — skipping`);
    }
  }
  return c;
}

async function doRoster(state) {
  let c = false;
  // Characters
  const cOk = await fetchCached('characters');
  if (cOk.length) {
    const ca = await analyzeNewCharacters(cOk, state.characterNames);
    for (const ch of (ca.newCharacters || [])) {
      if (ch.confidence >= THRESHOLDS.autoApplyConfidence) {
        if (DRY_RUN) { log.json('[DRY] char', ch); continue; }
        addCharacterEntry(ch.name, ch); addToAllCharacters(ch.name);
        addToList(ch.rarity === 5 ? 'ALL_5STAR_RESONATORS' : 'ALL_4STAR_RESONATORS', ch.name);
        addToList('RELEASE_ORDER', ch.name); c = true;
      }
    }
    if (c && !DRY_RUN) {
      try {
        const bOk = await fetchCached('builds');
        if (bOk.length) {
          const hc = (ca.newCharacters||[]).filter(x=>x.confidence>=THRESHOLDS.autoApplyConfidence);
          const cd = await generateCombatData(hc, bOk);
          if (Array.isArray(cd)) for (const [n,d,b,db] of cd) addCombatDataEntry(n,d,b,db);
        }
      } catch (e) { log.warn(`Combat data: ${e.message}`); }
    }
  }
  // Weapons
  const wOk = await fetchCached('weapons');
  if (wOk.length) {
    const wa = await analyzeNewWeapons(wOk, state.weaponNames);
    for (const w of (wa.newWeapons || [])) {
      if (w.confidence >= THRESHOLDS.autoApplyConfidence) {
        if (DRY_RUN) { log.json('[DRY] weapon', w); continue; }
        addWeaponEntry(w.name, w);
        if (w.rarity === 5) { addToList('ALL_5STAR_WEAPONS', w.name); addToList('WEAPON_RELEASE_ORDER', w.name); }
        else if (w.rarity === 4) addToList('ALL_4STAR_WEAPONS', w.name);
        c = true;
      }
    }
  }
  if (!c) log.ok('Roster current');
  return c;
}

async function doImages(state) {
  if (!process.env.IMGBB_API_KEY) { log.warn('IMGBB_API_KEY not set'); return false; }
  const missing = findMissingImages(state.source, state.characterNames, state.weaponNames);
  const total = missing.characters.length + missing.weapons.length;
  if (!total) { log.ok('All images present'); return false; }
  log.info(`${total} missing image(s)`);
  if (DRY_RUN) { log.info('[DRY] Would process images'); return false; }
  let c = false;
  for (const [type, names] of [['character', missing.characters], ['weapon', missing.weapons]]) {
    const real = names.filter(n => !n.startsWith('__'));
    if (!real.length) continue;
    const urls = await processMissingImages(real, type, askClaude, fetchPage);
    for (const [name, url] of Object.entries(urls)) {
      const buf = getBuffer();
      const esc = name.includes("'") ? `"${name}"` : `'${name}'`;
      const pat = new RegExp(`${esc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*'([^']*)'`);
      const existing = buf.match(pat);
      // PROTECTION: Only fill empty slots. Never overwrite existing URLs.
      if (existing && (!existing[1] || existing[1] === '' || existing[1] === 'TBD')) {
        loadBuffer(buf.replace(pat, `${esc}: '${url}'`));
        c = true;
      } else if (existing && existing[1]) {
        log.dim(`Skipped ${name} — already has image: ${existing[1].slice(0, 50)}...`);
      }
    }
  }
  return c;
}

async function doEnrich(state) {
  const ok = await fetchCached('builds');
  if (!ok.length) { log.warn('No build sources'); return false; }
  const updates = await enrichData(askClaude, state, ok);
  if (!updates.length) { log.ok('Data complete'); return false; }
  if (DRY_RUN) { log.json('[DRY] Enrichment', updates); return false; }
  let c = false;
  for (const u of updates) {
    if (u.confidence < THRESHOLDS.autoApplyConfidence) continue;
    // PROTECTION: Only fill TBD/empty placeholders, never overwrite real content
    if (u.oldValue && u.oldValue !== 'TBD' && u.oldValue !== 'N/A' && u.oldValue !== '') {
      log.dim(`Skipped enrichment for ${u.name}.${u.field} — existing value is not a placeholder`);
      continue;
    }
    const buf = getBuffer();
    const ci = buf.indexOf(`'${u.name}':`);
    if (ci === -1) continue;
    const fi = buf.indexOf(`'${u.oldValue}'`, ci);
    if (fi === -1 || fi > ci + 2000) continue;
    const nv = typeof u.newValue === 'string' ? `'${u.newValue}'` : JSON.stringify(u.newValue);
    loadBuffer(buf.slice(0, fi) + nv + buf.slice(fi + `'${u.oldValue}'`.length));
    addChange('enrichment', `${u.name}.${u.field}`); c = true;
  }
  return c;
}

async function doBannerImages(state) {
  if (!process.env.IMGBB_API_KEY) { log.dim('IMGBB_API_KEY not set — skipping banner images'); return false; }
  const emptySlots = findEmptyBannerImages(getBuffer());
  if (!emptySlots.length) { log.ok('All banner images present'); return false; }
  log.info(`Empty banner image slots: ${emptySlots.join(', ')}`);
  if (DRY_RUN) { log.info('[DRY] Would search for banner images'); return false; }
  const found = await findBannerImages(emptySlots, state.banners, askClaude, fetchPage);
  if (!Object.keys(found).length) { log.dim('No banner images found yet — will retry next cycle'); return false; }
  return await applyBannerImages(found, getBuffer, loadBuffer);
}

async function doStandardPool(state) {
  const ok = await fetchCached('banners');
  
  if (!ok.length) { log.warn('No sources for standard pool check'); return false; }
  const analysis = await checkStandardPool(ok, state.source, askClaude);
  if (!analysis.standardCharsChanged && !analysis.standardWeaponsChanged) {
    log.ok('Standard pool unchanged');
    return false;
  }
  if (DRY_RUN) { log.json('[DRY] Standard pool', analysis); return false; }
  return applyStandardPoolUpdates(analysis, getBuffer, loadBuffer);
}

async function doMetaRefresh(state, memory) {
  const characters = selectCharactersForRefresh(state.characterNames, memory);
  if (!characters.length) { log.ok('No characters due for refresh'); return false; }
  const ok = await fetchCached('builds');
  if (!ok.length) { log.warn('No build sources for meta refresh'); recordRefresh(memory, characters); return false; }
  const updates = await refreshCharacterBuilds(characters, state.source, askClaude, ok);
  recordRefresh(memory, characters);
  if (!updates.length) { log.ok(`Meta check: ${characters.join(', ')} — no changes`); return false; }
  log.info(`Meta refresh: ${updates.length} update(s) found`);
  if (DRY_RUN) { log.json('[DRY] Meta updates', updates); return false; }
  return applyMetaUpdates(updates, getBuffer, loadBuffer, memory);
}

async function doHealthCheck(state, memory) {
  const allUrls = extractImageUrls(state.source);
  const { getStaleUrls, recordUrlCheck } = await import('./lib/memory.js');
  const staleUrls = getStaleUrls(memory, allUrls);
  if (!staleUrls.length) { log.ok(`All ${allUrls.length} URLs checked recently`); return; }
  log.info(`Checking ${staleUrls.length} stale URL(s) out of ${allUrls.length} total`);
  const { alive, dead } = await checkUrls(staleUrls);
  // Record results in memory
  for (const url of alive) recordUrlCheck(memory, url, true);
  for (const d of dead) recordUrlCheck(memory, d.url, false);
  if (dead.length) {
    const owners = identifyDeadUrlOwners(state.source, dead);
    for (const o of owners) log.warn(`Broken: ${o.name} → ${o.url} (${o.status})`);
  }
}

async function doAudit(state, mode, memory = null) {
  const patches = await runSelfAudit(askClaude, mode, state, memory);
  if (!patches.length) { log.ok('No improvements found'); return false; }
  if (DRY_RUN) { log.json('[DRY] Patches', patches); return false; }

  // Filter out recently-applied patches (memory dedup)
  const fresh = memory
    ? patches.filter(p => !wasRecentlyPatched(memory, p.description))
    : patches;

  if (fresh.length < patches.length) {
    log.dim(`Filtered ${patches.length - fresh.length} recently-applied patch(es)`);
  }

  const { applied } = applyPatches(fresh, THRESHOLDS.autoApplyConfidence);

  // Record applied patches in memory
  if (memory) {
    for (const p of applied) recordPatch(memory, p.description, p.file);
  }

  if (applied.some(p => p.file === 'appcore-data.js')) {
    loadBuffer(readFileSync(PATHS.dataFile, 'utf-8'));
  }
  return applied.length > 0;
}

async function doEvolution(state, memory) {
  if (DRY_RUN) { log.info('[DRY] Would run evolution cycle'); return; }
  try {
    const results = await runEvolution(askClaude, memory, state);

    if (results.patchesApplied) {
      log.ok(`Agent evolved: ${results.patchesApplied} patch(es) applied`);
    }
    if (results.filesCreated) {
      log.ok(`Agent grew: ${results.filesCreated} new file(s) created`);
    }
    if (results.growthItemsExecuted) {
      log.ok(`Growth plan: ${results.growthItemsExecuted} idea(s) logged`);
    }

    // If evolution modified agent data files, reload the buffer
    if (results.patchesApplied) {
      try {
        loadBuffer(readFileSync(PATHS.dataFile, 'utf-8'));
      } catch { /* data file wasn't touched */ }
    }
  } catch (err) {
    log.warn(`Evolution cycle error: ${err.message}`);
    recordFailure(memory, 'evolution', err.message);
  }
}

main().catch(err => { log.error(`Fatal: ${err.message}`); if (err.stack) log.dim(err.stack); safeExit(1); });
