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

  const state = readCurrentState();
  if (!state.banners) { log.error('Failed to read state — aborting'); process.exit(1); }
  loadBuffer(state.source);

  const hoursLeft = (new Date(state.banners.endDate).getTime() - Date.now()) / 3600000;
  log.info(`Banner v${state.banners.version} p${state.banners.phase} — ${hoursLeft.toFixed(0)}h left`);

  let hasChanges = false;

  if (MODE === 'micro') hasChanges = await microCycle(state, hoursLeft);
  else if (MODE === 'audit') hasChanges = await auditCycle(state);
  else hasChanges = await fullCycle(state, hoursLeft);

  if (!hasChanges) { log.section('NO UPDATES'); log.ok('Everything current.'); process.exit(0); }

  if (!DRY_RUN) bumpVersion(state.appVersion);
  const v = validate(getBuffer());
  if (!v.passed) { log.section('VALIDATION FAILED'); v.errors.forEach(e => log.error(`  ✗ ${e}`)); process.exit(1); }
  if (!DRY_RUN) flush();
  if (!DRY_RUN && !NO_GIT) {
    const summary = getChangeLog().slice(0, 3).map(c => c.description).join('; ').slice(0, 72);
    gitPublish(`${MODE}: ${summary}`);
  }

  log.section('COMPLETE');
  getChangeLog().forEach(c => log.ok(`  [${c.category}] ${c.description}`));
  if (DRY_RUN) log.warn('DRY RUN — no files modified');
}

// ═══ FULL CYCLE (daily 00:00 UTC) ════════════════════════════════════════════
async function fullCycle(state, hoursLeft) {
  let c = false;
  if (!ONLY || ONLY === 'banners')    { log.section('BANNERS');    if (await doBanners(state)) c = true; }
  if (!ONLY || ONLY === 'events')     { log.section('EVENTS');     if (await doEvents(state)) c = true; }
  if (!ONLY || ONLY === 'characters') { log.section('ROSTER');     if (await doRoster(state)) c = true; }
  if (!ONLY || ONLY === 'images')     { log.section('IMAGES');     if (await doImages(state)) c = true; }
  if (!ONLY)                          { log.section('ENRICHMENT'); if (await doEnrich(state)) c = true; }
  if (!ONLY || ONLY === 'audit')      { log.section('SELF-AUDIT'); if (await doAudit(state, 'full')) c = true; }
  return c;
}

// ═══ MICRO CYCLE (6h intervals) ══════════════════════════════════════════════
async function microCycle(state, hoursLeft) {
  let c = false;
  log.section('MICRO — EVENTS');
  if (await doEvents(state)) c = true;
  if (hoursLeft < THRESHOLDS.bannerExpiryBufferHours) {
    log.section('MICRO — BANNER EXPIRY');
    log.warn(`${hoursLeft.toFixed(0)}h until banner expires — checking`);
    if (await doBanners(state)) c = true;
  }
  log.section('MICRO — QUICK FIXES');
  if (await doAudit(state, 'micro')) c = true;
  return c;
}

// ═══ AUDIT-ONLY CYCLE ════════════════════════════════════════════════════════
async function auditCycle(state) {
  log.section('SELF-AUDIT (standalone)');
  return await doAudit(state, 'full');
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

async function doAudit(state, mode) {
  const patches = await runSelfAudit(askClaude, mode, state);
  if (!patches.length) { log.ok('No improvements found'); return false; }
  if (DRY_RUN) { log.json('[DRY] Patches', patches); return false; }
  const { applied } = applyPatches(patches, THRESHOLDS.autoApplyConfidence);
  if (applied.some(p => p.file === 'appcore-data.js')) {
    loadBuffer(readFileSync(PATHS.dataFile, 'utf-8'));
  }
  return applied.length > 0;
}

main().catch(err => { log.error(`Fatal: ${err.message}`); if (err.stack) log.dim(err.stack); process.exit(1); });
