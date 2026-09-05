/**
 * PHASE3_PLAN.md Stage 1 — the parity harness. Composes the engine's real per-hit damage
 * (resolveHitComposedDps, gear-aware via its externalStats param — see resolveHitComposedDps.js's
 * own jsdoc) against calcTeamStats.js's real, equipment-inclusive RAW tier (equipment-only, no team
 * buffs — the cleanest solo-comparable slice, since it skips the rotation order-search,
 * cross-character buff routing, DOT, and energy-cycle gating that PHASE3_PLAN.md's Stage 0 audit
 * found have no engine equivalent yet).
 *
 * This does NOT assert close numeric equality — the two models are legitimately different (real
 * per-hit composition vs. a single flat totalMult%), and this file's own header note already
 * establishes that divergence is often a real precision IMPROVEMENT, not a bug. Every case logs its
 * real numbers (visible in `npx vitest run --reporter=verbose` output) for PHASE3_PLAN.md Stage 2's
 * triage pass to consume — sanity bounds only (both positive, finite), not tolerance assertions.
 *
 * Covers all 56 characters with a converted `.blocks.js` file (Jingran excluded — unreleased, no
 * rotation data, per every prior Phase 2/3 note).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';
import { CHARACTER_DATA, CHARACTER_ROTATIONS } from '../data/characters.js';
import { WEAPON_DATA } from '../data/weapons.js';
import { ECHO_SETS } from '../data/echoes.js';
import { applyFullEchoSet, getWeaponPv } from '../features/teams/calcEngine.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { PARITY_CHARACTERS as BLOCK_FILES } from './phase3-parityCharacterList.js';

const BLOCKS_BY_NAME = {};
beforeAll(async () => {
  await Promise.all(BLOCK_FILES.map(async ({ name, file, exportName }) => {
    const base = file.replace(/\.blocks\.js$/, '');
    const mod = await import(`../engine/characterBlocks/${base}.blocks.js`);
    BLOCKS_BY_NAME[name] = mod[exportName];
  }));
});

// Reproduces calcTeamStats.js's RAW-tier gear-stat assembly (the private per-member rStats object
// built inside its own forEach loop) for a SOLO team's sole member — NOT imported, since it's not an
// exported function; same "reproduce the live file's own real formula, don't modify it for test
// plumbing" approach verifyEngineAgainstCalcTeamStats.test.js already established for
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
  const rStats = { atkPct, cr, cd, elemDmg, skillDmg, basicDmg, heavyDmg, libDmg, echoDmg, amplify: 0, defShred: 0, resShred: 0, defIgnore: 0 };
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
// weapon+set calcTeamStats() itself actually used for its RAW tier.
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

describe('PHASE3_PLAN.md Stage 1 — parity harness (engine hit-composed DPS vs. calcTeamStats RAW tier), all converted characters', () => {
  BLOCK_FILES.forEach(({ name }) => {
    it(`${name}: engine-composed solo damage vs. calcTeamStats() rawDps — logs real numbers for Stage 2 triage`, () => {
      const d = CHARACTER_DATA[name];
      const rotation = CHARACTER_ROTATIONS[name];
      const blocks = BLOCKS_BY_NAME[name];
      expect(blocks, `no blocks loaded for ${name}`).toBeTruthy();
      if (!rotation) {
        // A handful of converted characters may still lack a CHARACTER_ROTATIONS entry — nothing to
        // derive real steps from; log and skip rather than fail the whole sweep on a data gap that's
        // not this harness's job to fix.
          // eslint-disable-next-line no-console
        console.log(`[Stage1 parity] ${name}: SKIPPED — no CHARACTER_ROTATIONS entry`);
        return;
      }

      const { echoSet, echoSet2 } = previewEchoSet(d.bestEchoes);
      const weapon = d.bestWeapon;
      const teamIdx = 0;
      const teamEquipment = {}; // calcTeamStats() runs its own real preview inference from this

      const legacy = calcTeamStats([name], teamIdx, name, teamEquipment, '', 90);
      expect(legacy, `calcTeamStats() returned null for solo ${name}`).toBeTruthy();
      const legacyRawDps = legacy.rawDps;

      const scaling = d.statScaling || 'ATK';
      const usedWeapon = WEAPON_DATA[weapon];
      // Always supply all three raw base stats (not just the character's own scaling stat) — several
      // HP/DEF-scaling characters mix ATK-basis hits into an otherwise HP/DEF-scaling kit (same
      // documented pattern as Cartethyia's own audit comment on mixed "%"/"%HP" notation), so a block
      // needing a basis other than the character's main scaling stat still needs a real number, not a
      // thrown error. atkPct-style %-buffs (gear + kit) still only ever apply to the ATK-basis figure
      // per resolveHitComposedDps's own convention — this only fixes the "which raw number is
      // available at all" gap, not scaling routing.
      const baseStats = { atk: (d.baseAtk || 0) + (usedWeapon?.baseAtk || 0), hp: d.baseHp || 0, def: d.baseDef || 0 };
      const gearDelta = toExternalStatsDelta(rawTierGearStats(name, weapon, echoSet, echoSet2));

      let engineDps = 0, totalDamage = 0, totalTime = 0, threw = null;
      try {
        const steps = deriveStepsFromRotation(rotation, blocks);
        // sequence: 0 — matches calcTeamStats()'s own default for an unbuilt character (no `eq.sequence`
        // override in teamEquipment above -> `eq?.sequence || 0`), so this is now a genuine apples-to-
        // apples S0 comparison. Before PHASE3_PLAN.md Stage 3's sequenceGating.js, chain blocks fired
        // unconditionally regardless of this param even existing — see Stage 2's write-up for how much
        // that skewed the ratios (Lucilla's alone was inflated 40.03x -> ~4.1x by this fix).
        ({ totalDamage, totalTime } = resolveHitComposedDps(blocks, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, baseStats, (d.element || '').toLowerCase(), d.role, gearDelta, 0));
        engineDps = totalTime > 0 ? totalDamage / totalTime : 0;
      } catch (err) {
        threw = err;
      }

      expect(legacyRawDps).toBeGreaterThan(0);

      if (threw) {
        // eslint-disable-next-line no-console
        console.log(`[Stage1 parity] ${name}: ENGINE THREW — ${threw.message}`);
        // A thrown error (e.g. a missing baseStats.hp/def for a block needing it) is itself a real
        // Stage 2 finding, not a harness failure to swallow — surface it, don't silently zero it out.
        expect(threw, `${name}: engine threw during hit composition — see console log above`).toBeNull();
        return;
      }

      expect(Number.isFinite(engineDps)).toBe(true);
      const ratio = legacyRawDps > 0 ? engineDps / legacyRawDps : Infinity;
      // eslint-disable-next-line no-console
      console.log(`[Stage1 parity] ${name}: calcTeamStats.rawDps=${Math.round(legacyRawDps)}  engine dps=${Math.round(engineDps)}  ratio(engine/legacy)=${ratio.toFixed(3)}  weapon=${weapon}`);
    });
  });
});
