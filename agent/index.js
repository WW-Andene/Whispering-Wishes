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

import { SOURCES, THRESHOLDS } from './lib/config.js';
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
import { readFileSync } from 'fs';
import { PATHS } from './lib/config.js';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run') || process.env.DRY_RUN === 'true';
const NO_GIT = args.includes('--no-git');
const MODE = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'full';
const ONLY = args.find(a => a.startsWith('--only='))?.split('=')[1] || null;

async function main() {
  log.section(`WW UPDATE AGENT v2 [${MODE.toUpperCase()}]`);
  log.info(`Mode: ${MODE} | Dry run: ${DRY_RUN} | Only: ${ONLY || 'all'}`);
  clearChangeLog();
  const startTime = Date.now();

  // Load persistent memory and skills
  const memory = loadMemory();
  loadSkills();

  // Check if previous evolution patches caused problems
  checkEvolutionHealth(memory);

  const state = readCurrentState();
  if (!state.banners) { log.error('Failed to read state — aborting'); process.exit(1); }
  loadBuffer(state.source);

  const hoursLeft = (new Date(state.banners.endDate).getTime() - Date.now()) / 3600000;
  log.info(`Banner v${state.banners.version} p${state.banners.phase} — ${hoursLeft.toFixed(0)}h left`);

  let hasChanges = false;

  if (MODE === 'micro') hasChanges = await microCycle(state, hoursLeft, memory);
  else if (MODE === 'audit') hasChanges = await auditCycle(state, memory);
  else hasChanges = await fullCycle(state, hoursLeft, memory);

  if (!hasChanges) { log.section('NO UPDATES'); log.ok('Everything current.'); recordRun(memory, MODE, 0, Date.now() - startTime); saveMemory(memory); process.exit(0); }

  if (!DRY_RUN) bumpVersion(state.appVersion);
  const v = validate(getBuffer());
  if (!v.passed) { log.section('VALIDATION FAILED'); v.errors.forEach(e => log.error(`  ✗ ${e}`)); recordFailure(memory, 'validation', v.errors[0]); saveMemory(memory); process.exit(1); }
  if (!DRY_RUN) flush();
  if (!DRY_RUN && !NO_GIT) {
    const summary = getChangeLog().slice(0, 3).map(c => c.description).join('; ').slice(0, 72);
    gitPublish(`${MODE}: ${summary}`);
  }

  // Save memory
  recordRun(memory, MODE, getChangeLog().length, Date.now() - startTime);
  saveMemory(memory);

  log.section('COMPLETE');
  getChangeLog().forEach(c => log.ok(`  [${c.category}] ${c.description}`));
  if (DRY_RUN) log.warn('DRY RUN — no files modified');
}

// ═══ FULL CYCLE (daily 00:00 UTC) ════════════════════════════════════════════
async function fullCycle(state, hoursLeft, memory) {
  let c = false;
  if (!ONLY || ONLY === 'banners')    { log.section('BANNERS');        if (await doBanners(state)) c = true; }
  if (!ONLY || ONLY === 'events')     { log.section('EVENTS');         if (await doEvents(state)) c = true; }
  if (!ONLY || ONLY === 'characters') { log.section('ROSTER');         if (await doRoster(state)) c = true; }
  if (!ONLY || ONLY === 'images')     { log.section('IMAGES');         if (await doImages(state)) c = true; }
  /* Banner art fills — check every cycle since art appears days after banners go live */
  if (!ONLY || ONLY === 'banners' || ONLY === 'images') {
    log.section('BANNER IMAGES');
    if (await doBannerImages(state)) c = true;
  }
  if (!ONLY)                          { log.section('HEALTH CHECK');   await doHealthCheck(state, memory); }
  if (!ONLY)                          { log.section('ENRICHMENT');     if (await doEnrich(state)) c = true; }
  if (!ONLY || ONLY === 'audit')      { log.section('SELF-AUDIT');     if (await doAudit(state, 'full', memory)) c = true; }
  /* Evolution — agent self-improvement (runs last, after all other changes) */
  if (!ONLY)                          { log.section('EVOLUTION');      await doEvolution(state, memory); }
  return c;
}

// ═══ MICRO CYCLE (6h intervals) ══════════════════════════════════════════════
async function microCycle(state, hoursLeft, memory) {
  let c = false;
  log.section('MICRO — EVENTS');
  if (await doEvents(state)) c = true;
  if (hoursLeft < THRESHOLDS.bannerExpiryBufferHours) {
    log.section('MICRO — BANNER EXPIRY');
    log.warn(`${hoursLeft.toFixed(0)}h until banner expires — checking`);
    if (await doBanners(state)) c = true;
  }
  /* Banner art — also check in micro since art can appear at any time */
  log.section('MICRO — BANNER IMAGES');
  if (await doBannerImages(state)) c = true;
  log.section('MICRO — QUICK FIXES');
  if (await doAudit(state, 'micro', memory)) c = true;
  return c;
}

// ═══ AUDIT-ONLY CYCLE ════════════════════════════════════════════════════════
async function auditCycle(state, memory) {
  log.section('SELF-AUDIT (standalone)');
  return await doAudit(state, 'full', memory);
}

// ═══ TASK FUNCTIONS ══════════════════════════════════════════════════════════

async function doBanners(state) {
  const src = await fetchAll(SOURCES.banners);
  const ok = src.filter(s => s.ok);
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
  const src = await fetchAll(SOURCES.events);
  const ok = src.filter(s => s.ok);
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

async function doRoster(state) {
  let c = false;
  // Characters
  const cs = await fetchAll(SOURCES.characters);
  const cOk = cs.filter(s => s.ok);
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
        const bs = await fetchAll(SOURCES.builds);
        const bOk = bs.filter(s => s.ok);
        if (bOk.length) {
          const hc = (ca.newCharacters||[]).filter(x=>x.confidence>=THRESHOLDS.autoApplyConfidence);
          const cd = await generateCombatData(hc, bOk);
          if (Array.isArray(cd)) for (const [n,d,b,db] of cd) addCombatDataEntry(n,d,b,db);
        }
      } catch (e) { log.warn(`Combat data: ${e.message}`); }
    }
  }
  // Weapons
  const ws = await fetchAll(SOURCES.weapons);
  const wOk = ws.filter(s => s.ok);
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
      const pat = new RegExp(`${esc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*'[^']*'`);
      if (buf.match(pat)) { loadBuffer(buf.replace(pat, `${esc}: '${url}'`)); c = true; }
    }
  }
  return c;
}

async function doEnrich(state) {
  const bs = await fetchAll(SOURCES.builds);
  const ok = bs.filter(s => s.ok);
  if (!ok.length) { log.warn('No build sources'); return false; }
  const updates = await enrichData(askClaude, state, ok);
  if (!updates.length) { log.ok('Data complete'); return false; }
  if (DRY_RUN) { log.json('[DRY] Enrichment', updates); return false; }
  let c = false;
  for (const u of updates) {
    if (u.confidence < THRESHOLDS.autoApplyConfidence) continue;
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

async function doHealthCheck(state, memory) {
  const allUrls = extractImageUrls(state.source);
  // Only check URLs not recently verified
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

main().catch(err => { log.error(`Fatal: ${err.message}`); if (err.stack) log.dim(err.stack); process.exit(1); });
