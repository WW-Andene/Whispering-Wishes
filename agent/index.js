#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — Autonomous Update Agent
//
// Fetches current Wuthering Waves game data from web sources, compares with
// the app's codebase, and applies updates automatically.
//
// Usage:
//   node index.js                  # Full update cycle
//   node index.js --dry-run        # Analyze only, no file writes
//   node index.js --only=banners   # Only update banners
//   node index.js --only=events    # Only update events
//   node index.js --only=characters # Only update characters
//   node index.js --no-git         # Update files but don't commit
//
// Environment:
//   ANTHROPIC_API_KEY  — Required. Claude API key for data analysis.
//   DRY_RUN=true       — Same as --dry-run flag.
//
// ═══════════════════════════════════════════════════════════════════════════════

import { SOURCES, THRESHOLDS } from './lib/config.js';
import { log, addChange, getChangeLog, clearChangeLog } from './lib/log.js';
import { fetchPage, fetchAll } from './lib/scraper.js';
import { analyzeBanners, analyzeEvents, analyzeNewCharacters, analyzeNewWeapons, generateCombatData } from './lib/ai.js';
import { readCurrentState, readDataFile } from './lib/reader.js';
import { loadBuffer, getBuffer, flush, bumpVersion, updateCurrentBanners, addBannerHistoryEntry, updateEventDate, addCharacterEntry, addWeaponEntry, addToList, addToAllCharacters, addCombatDataEntry } from './lib/writer.js';
import { validate } from './lib/validate.js';
import { gitPublish, checkGitStatus } from './lib/git.js';

// ─── CLI Args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run') || process.env.DRY_RUN === 'true';
const NO_GIT = args.includes('--no-git');
const ONLY = args.find(a => a.startsWith('--only='))?.split('=')[1] || null;

const TOTAL_STEPS = ONLY ? 4 : 7;
let currentStep = 0;
const step = (msg) => log.step(++currentStep, TOTAL_STEPS, msg);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN UPDATE CYCLE
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  log.section('WHISPERING WISHES — Autonomous Update Agent');
  log.info(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}${ONLY ? ` | Only: ${ONLY}` : ''}`);

  clearChangeLog();

  // ─── Step 1: Read current app state ──────────────────────────────────────
  step('Reading current app state');
  const state = readCurrentState();
  if (!state.banners) {
    log.error('Failed to read current banner state — aborting');
    process.exit(1);
  }

  // Load source into write buffer
  loadBuffer(state.source);

  // Check if banner is approaching expiry
  const bannerEnd = new Date(state.banners.endDate);
  const hoursUntilExpiry = (bannerEnd.getTime() - Date.now()) / 3600000;
  log.info(`Banner v${state.banners.version} p${state.banners.phase} expires in ${hoursUntilExpiry.toFixed(0)} hours`);

  let hasChanges = false;

  // ─── Step 2: Check & update banners ──────────────────────────────────────
  if (!ONLY || ONLY === 'banners') {
    step('Fetching & analyzing banner data');

    const bannerSources = await fetchAll(SOURCES.banners);
    const validSources = bannerSources.filter(s => s.ok);

    if (validSources.length === 0) {
      log.warn('No banner sources available — skipping banner update');
    } else {
      const analysis = await analyzeBanners(validSources, state.banners);

      if (analysis.changed) {
        log.info(`Banner change detected! Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);

        if (analysis.confidence >= THRESHOLDS.autoApplyConfidence) {
          if (!DRY_RUN) {
            // Add old banner to history first
            const oldBanner = state.banners;
            const historyEntry = {
              version: oldBanner.version,
              phase: oldBanner.phase,
              characters: oldBanner.characters.map(c => c.name),
              weapons: oldBanner.weapons.map(w => w.name),
              startDate: oldBanner.startDate.split('T')[0],
              endDate: oldBanner.endDate.split('T')[0],
            };
            addBannerHistoryEntry(historyEntry);

            // Apply new banner
            updateCurrentBanners(analysis.banner);
            hasChanges = true;
          } else {
            log.info('[DRY RUN] Would update banner to:');
            log.json('New banner', analysis.banner);
          }
        } else {
          log.warn(`Confidence ${(analysis.confidence * 100).toFixed(0)}% below threshold ${THRESHOLDS.autoApplyConfidence * 100}% — skipping auto-apply`);
          addChange('banners', `Change detected but confidence too low (${(analysis.confidence * 100).toFixed(0)}%)`, 'NEEDS_REVIEW');
        }
      } else {
        log.ok('Banners are up to date');
      }
    }
  }

  // ─── Step 3: Check & update events ───────────────────────────────────────
  if (!ONLY || ONLY === 'events') {
    step('Fetching & analyzing event data');

    const eventSources = await fetchAll(SOURCES.events);
    const validSources = eventSources.filter(s => s.ok);

    if (validSources.length === 0) {
      log.warn('No event sources available — skipping event update');
    } else {
      const analysis = await analyzeEvents(validSources, state.events);

      if (analysis.updates?.length > 0) {
        for (const update of analysis.updates) {
          if (update.confidence >= THRESHOLDS.autoApplyConfidence) {
            log.info(`Event update: ${update.eventKey} → ${update.newValue} (${(update.confidence * 100).toFixed(0)}%)`);
            if (!DRY_RUN) {
              updateEventDate(update.eventKey, update.newValue);
              hasChanges = true;
            } else {
              log.info(`[DRY RUN] Would update ${update.eventKey}: ${update.oldValue} → ${update.newValue}`);
            }
          } else {
            log.warn(`Event ${update.eventKey} update confidence ${(update.confidence * 100).toFixed(0)}% — skipping`);
          }
        }
      } else {
        log.ok('Events are up to date');
      }
    }
  }

  // ─── Step 4: Check for new characters ────────────────────────────────────
  if (!ONLY || ONLY === 'characters') {
    step('Fetching & analyzing character data');

    const charSources = await fetchAll(SOURCES.characters);
    const validSources = charSources.filter(s => s.ok);

    if (validSources.length === 0) {
      log.warn('No character sources available — skipping character check');
    } else {
      const analysis = await analyzeNewCharacters(validSources, state.characterNames);

      if (analysis.newCharacters?.length > 0) {
        log.info(`Found ${analysis.newCharacters.length} new character(s)!`);

        for (const char of analysis.newCharacters) {
          if (char.confidence >= THRESHOLDS.autoApplyConfidence) {
            log.info(`Adding: ${char.name} (${char.rarity}★ ${char.element} ${char.weapon})`);
            if (!DRY_RUN) {
              addCharacterEntry(char.name, char);
              addToAllCharacters(char.name);

              // Add to appropriate list
              if (char.rarity === 5) {
                addToList('ALL_5STAR_RESONATORS', char.name);
              } else {
                addToList('ALL_4STAR_RESONATORS', char.name);
              }
              addToList('RELEASE_ORDER', char.name);

              hasChanges = true;
            } else {
              log.json(`[DRY RUN] Would add character`, char);
            }
          }
        }

        // Generate combat data for new characters
        if (!DRY_RUN && hasChanges) {
          try {
            const buildSources = await fetchAll(SOURCES.builds);
            const validBuildSources = buildSources.filter(s => s.ok);
            if (validBuildSources.length > 0) {
              const highConfChars = analysis.newCharacters.filter(c => c.confidence >= THRESHOLDS.autoApplyConfidence);
              const combatData = await generateCombatData(highConfChars, validBuildSources);
              if (Array.isArray(combatData)) {
                for (const [name, dmgFocus, buffs, debuffs] of combatData) {
                  addCombatDataEntry(name, dmgFocus, buffs, debuffs);
                }
              }
            }
          } catch (err) {
            log.warn(`Could not generate combat data: ${err.message}`);
          }
        }
      } else {
        log.ok('Character roster is up to date');
      }
    }
  }

  // ─── Step 5: Check for new weapons ───────────────────────────────────────
  if (!ONLY || ONLY === 'characters') {
    step('Fetching & analyzing weapon data');

    const weapSources = await fetchAll(SOURCES.weapons);
    const validSources = weapSources.filter(s => s.ok);

    if (validSources.length > 0) {
      const analysis = await analyzeNewWeapons(validSources, state.weaponNames);

      if (analysis.newWeapons?.length > 0) {
        log.info(`Found ${analysis.newWeapons.length} new weapon(s)!`);

        for (const weapon of analysis.newWeapons) {
          if (weapon.confidence >= THRESHOLDS.autoApplyConfidence) {
            log.info(`Adding: ${weapon.name} (${weapon.rarity}★ ${weapon.type})`);
            if (!DRY_RUN) {
              addWeaponEntry(weapon.name, weapon);

              if (weapon.rarity === 5) {
                addToList('ALL_5STAR_WEAPONS', weapon.name);
                addToList('WEAPON_RELEASE_ORDER', weapon.name);
              } else if (weapon.rarity === 4) {
                addToList('ALL_4STAR_WEAPONS', weapon.name);
              }

              hasChanges = true;
            }
          }
        }
      } else {
        log.ok('Weapon roster is up to date');
      }
    }
  }

  // ─── Step 6: Validate & write ────────────────────────────────────────────
  step('Validating and writing updates');

  if (!hasChanges) {
    log.section('NO UPDATES NEEDED');
    log.ok('All game data is current. Nothing to do.');
    process.exit(0);
  }

  // Bump version
  if (!DRY_RUN) {
    bumpVersion(state.appVersion);
  }

  // Validate the updated source
  const validation = validate(getBuffer());

  if (!validation.passed) {
    log.section('VALIDATION FAILED — ABORTING');
    log.error('The updated source failed integrity checks. No files were written.');
    log.error('Errors:');
    validation.errors.forEach(e => log.error(`  ✗ ${e}`));
    process.exit(1);
  }

  // Write to disk
  if (!DRY_RUN) {
    flush();
    log.ok('Files written successfully');
  }

  // ─── Step 7: Git commit & push ───────────────────────────────────────────
  if (!DRY_RUN && !NO_GIT) {
    step('Committing and pushing changes');

    const changes = getChangeLog();
    const summary = changes.map(c => c.description).join('; ');
    const result = gitPublish(summary.slice(0, 72));

    if (result.pushed) {
      log.ok(`Changes pushed to branch: ${result.branch}`);
    } else if (result.commit) {
      log.ok(`Changes committed (${result.commit}) but push failed — manual push needed`);
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  log.section('UPDATE COMPLETE');
  const changes = getChangeLog();
  log.info(`Applied ${changes.length} change(s):`);
  for (const c of changes) {
    log.ok(`  [${c.category}] ${c.description} (${c.confidence})`);
  }

  if (DRY_RUN) {
    log.warn('DRY RUN — no files were modified');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════════

main().catch(err => {
  log.error(`Fatal error: ${err.message}`);
  if (err.stack) log.dim(err.stack);
  process.exit(1);
});
