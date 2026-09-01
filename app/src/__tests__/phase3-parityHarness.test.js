/**
 * PHASE3_PLAN.md Stage 1 — the parity harness. Composes the engine's real per-hit damage
 * (resolveHitComposedDps, now gear-aware via its externalStats param — see resolveHitComposedDps.js's
 * own jsdoc, added this same stage) against calcTeamStats.js's real, equipment-inclusive RAW tier
 * (equipment-only, no team buffs — the cleanest solo-comparable slice, since it skips the rotation
 * order-search, cross-character buff routing, DOT, and energy-cycle gating that PHASE3_PLAN.md's
 * Stage 0 audit found have no engine equivalent yet).
 *
 * This does NOT assert close numeric equality — the two models are legitimately different (real
 * per-hit composition vs. a single flat totalMult%), and PHASE2_PLAN.md/this file's own header note
 * already establish that divergence is often a real precision IMPROVEMENT, not a bug. Every case here
 * logs its real numbers (visible in `npx vitest run` output) for PHASE3_PLAN.md Stage 2's triage pass
 * to consume — sanity bounds only (both positive, no NaN/crash), not tolerance assertions.
 */
import { describe, it, expect } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';
import { CHARACTER_DATA, CHARACTER_ROTATIONS } from '../data/characters.js';
import { WEAPON_DATA } from '../data/weapons.js';
import { ECHO_SETS } from '../data/echoes.js';
import { applyFullEchoSet, getWeaponPv } from '../features/teams/calcEngine.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';
import { CARTETHYIA_BLOCKS } from '../engine/characterBlocks/cartethyia.blocks.js';
import { CALCHARO_BLOCKS } from '../engine/characterBlocks/calcharo.blocks.js';

const BLOCKS_BY_NAME = { Augusta: AUGUSTA_BLOCKS, Cartethyia: CARTETHYIA_BLOCKS, Calcharo: CALCHARO_BLOCKS };

// Reproduces calcTeamStats.js's RAW-tier gear-stat assembly (the private per-member rStats object
// built inside its own forEach loop) for a SOLO team's sole member — NOT imported, since it's not an
// exported function; same "reproduce the live file's own real formula, don't modify it for test
// plumbing" approach the existing verifyEngineAgainstCalcTeamStats.test.js already established for
// overlapUptimeForSeg. RAW tier deliberately zeroes defIgnore/defShred regardless of gear (see that
// tier's own rStats literal in calcTeamStats.js) — reproduced here, not "fixed", to stay comparable.
function rawTierGearStats(name, weaponName, echoSetName, echoSet2Name) {
  const d = CHARACTER_DATA[name];
  const weapon = WEAPON_DATA[weaponName];
  const scaling = d.statScaling || 'ATK';
  let cr = 5, cd = 150, atkPct = 0, elemDmg = 0, skillDmg = 0, basicDmg = 0, heavyDmg = 0, libDmg = 0, echoDmg = 0;
  if (weapon?.stat === 'Crit Rate') cr += parseFloat(weapon.subStatValue) || 0;
  if (weapon?.stat === 'Crit DMG') cd += parseFloat(weapon.subStatValue) || 0;
  const statKey = scaling === 'HP' ? 'HP%' : scaling === 'DEF' ? 'DEF%' : 'ATK%';
  if (weapon?.stat === statKey) atkPct += parseFloat(weapon.subStatValue) || 0;
  const wp = getWeaponPv(weapon, d.element, 1);
  if (scaling === 'ATK') atkPct += (wp.atkPct || 0);
  else if (scaling === 'HP') atkPct += (wp.hpPct || 0);
  else if (scaling === 'DEF') atkPct += (wp.defPct || 0);
  elemDmg += (wp.elemDmg || 0); skillDmg += (wp.skillDmg || 0);
  cr += (wp.critRate || 0); cd += (wp.critDmg || 0);
  basicDmg += (wp.basicDmg || 0); heavyDmg += (wp.heavyDmg || 0);
  libDmg += (wp.libDmg || 0); echoDmg += (wp.echoDmg || 0);
  const rStats = { atkPct, cr, cd, elemDmg, skillDmg, basicDmg, heavyDmg, libDmg, echoDmg, deepen: 0, amplify: 0, defShred: 0, resShred: 0, defIgnore: 0 };
  const echoSet = echoSetName ? ECHO_SETS[echoSetName] : null;
  const echoSet2 = echoSet2Name ? ECHO_SETS[echoSet2Name] : null;
  applyFullEchoSet(rStats, echoSet, echoSet2, d.element, scaling);
  return rStats;
}

// externalStats for resolveHitComposedDps wants DELTAS (cr/cd NOT pre-seeded with the 5/150
// baseline — see resolveHitComposedDps.js's own EXTERNAL_STAT_KEYS comment), so cr/cd are
// re-based to 0 here before handing off.
function toExternalStatsDelta(rStats) {
  return { ...rStats, cr: rStats.cr - 5, cd: rStats.cd - 150 };
}

// Mirrors calcTeamStats.js's own "no echoes equipped → preview the recommended build's set bonus"
// branch (its per-member mapping's inline echoSetName inference), so a bare-kit case gets the SAME
// weapon+set calcTeamStats() itself actually used for its RAW tier — not an inconsistent zero-gear
// comparison against a real-gear legacy number.
function previewEchoSet(bestEchoes) {
  for (const e of bestEchoes || []) {
    const hybridMatch = e.match(/^(.+?)\s+3pc\s*\+\s*(.+?)\s+2pc$/i);
    if (hybridMatch) {
      const s1 = hybridMatch[1].trim(), s2 = hybridMatch[2].trim();
      return { echoSet: ECHO_SETS[s1] ? s1 : '', echoSet2: ECHO_SETS[s2] ? s2 : '' };
    }
    const k = Object.keys(ECHO_SETS).find(k => e.includes(k));
    if (k) return { echoSet: k, echoSet2: '' };
  }
  return { echoSet: '', echoSet2: '' };
}

const CASES = ['Augusta', 'Cartethyia', 'Calcharo'].map(name => {
  const d = CHARACTER_DATA[name];
  const { echoSet, echoSet2 } = previewEchoSet(d.bestEchoes);
  return { name, weapon: d.bestWeapon, echoSet, echoSet2, el: (d.element || '').toLowerCase() };
});

describe('PHASE3_PLAN.md Stage 1 — parity harness (engine hit-composed DPS vs. calcTeamStats RAW tier)', () => {
  CASES.forEach(({ name, weapon, echoSet, echoSet2, el }) => {
    it(`${name}: engine-composed solo damage vs. calcTeamStats() rawDps — logs real numbers for Stage 2 triage`, () => {
      const d = CHARACTER_DATA[name];
      const teamIdx = 0;
      // Empty teamEquipment — calcTeamStats() runs its OWN real "no echoes equipped → preview
      // recommended build" inference here, same as any never-built-yet character in the app; `weapon`/
      // `echoSet`/`echoSet2` (computed above via the same inference, reproduced for test purposes) are
      // used only to build the engine-side gear delta below, kept consistent with what calcTeamStats()
      // actually resolved for itself.
      const teamEquipment = {};

      const legacy = calcTeamStats([name], teamIdx, name, teamEquipment, '', 90);
      expect(legacy, `calcTeamStats() returned null for solo ${name}`).toBeTruthy();
      const legacyRawDps = legacy.rawDps;

      const scaling = d.statScaling || 'ATK';
      const usedWeapon = WEAPON_DATA[weapon];
      const charBase = scaling === 'HP' ? (d.baseHp || 0) : scaling === 'DEF' ? (d.baseDef || 0) : (d.baseAtk || 0) + (usedWeapon?.baseAtk || 0);
      const baseStats = scaling === 'ATK' ? charBase : { [scaling.toLowerCase()]: charBase };

      const gearDelta = toExternalStatsDelta(rawTierGearStats(name, weapon, echoSet, echoSet2));
      const blocks = BLOCKS_BY_NAME[name];
      const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS[name], blocks);
      const { totalDamage, totalTime } = resolveHitComposedDps(blocks, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, baseStats, el, d.role, gearDelta);
      const engineDps = totalTime > 0 ? totalDamage / totalTime : 0;

      expect(legacyRawDps).toBeGreaterThan(0);
      expect(engineDps).toBeGreaterThan(0);
      expect(Number.isFinite(engineDps)).toBe(true);

      // eslint-disable-next-line no-console
      console.log(`[Stage1 parity] ${name}: calcTeamStats.rawDps=${legacyRawDps}  engine dps=${Math.round(engineDps)}  ratio(engine/legacy)=${(engineDps / legacyRawDps).toFixed(3)}  weapon=${weapon}`);
    });
  });
});
