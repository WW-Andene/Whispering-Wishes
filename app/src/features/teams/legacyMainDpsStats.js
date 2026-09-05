// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/teams/legacyMainDpsStats.js
// [TEAM-LAYER · LEGACY-FALLBACK] Layer 5 of the engine rewrite: fourth and final
// extraction from calcTeamStats.js's monolithic body (CALC_TEAM_STATS_DEPENDENCY_MAP.md
// section 9, "FULL tier — legacy buff accumulation"). Byte-identical logic — the
// interior body below is an EXACT, unedited extraction of the original inline
// block (extracted via `sed`, not retyped, specifically to eliminate transcription
// risk on this file's highest-variable-mutation-surface section) — only the
// function wrapper (parameter destructuring + local declarations + return) around
// it is new.
//
// This is the legacy main-DPS buff-accumulation computation (weapon/echo/
// resonance-chain/cross-character outro-lib-debuff routing) — calcTeamStats()'s
// only remaining caller of it today is a team containing Jingran (unreleased, no
// converted TriggerBlocks file yet). Every fully block-converted team has every
// variable this function produces UNCONDITIONALLY overridden by
// computeEngineMainDpsStatPanel() (engineMainDpsStatPanel.js, Layer 5's second
// extraction) regardless, so this function should only ever be called behind an
// `!allMembersConverted` gate — computing it for a fully-converted team is pure
// wasted work, same as before this extraction.
// ═══════════════════════════════════════════════════════════════════════════════

import { WEAPON_REFINE_SCALE } from '../../data/constants.js';
import { CHAR_BUFF_TABLE, CHARACTER_DATA } from '../../data/characters.js';
import { ECHO_SKILL_BUFFS } from '../../data/echoes.js';
import {
  BASE_CRIT_RATE, BASE_CRIT_DMG, ECHO_MAIN_STAT_VALUES, getSubstatGradeValue,
  createStats, parsePassive, applyFullEchoSet,
  routeTypeBonuses, applyResonanceChain, applyBuff, TEAM_SET_BUFFS,
} from './calcEngine.js';

/**
 * [LOGIC · LEGACY-MAIN-DPS-STATS] The legacy main-DPS buff-accumulation computation —
 * calcTeamStats()'s pre-engine fallback for the stat-panel fields, kept exact/unmodified for a
 * mixed team.
 *
 * @param {object} ctx
 * @param {object} ctx.mainDps
 * @param {object[]} ctx.mems
 * @param {object} ctx.teamEquipment
 * @param {number} ctx.teamIdx
 * @param {object} ctx.dpsSeg  rotSegByName[mainDps.name] — the main DPS's own rotation-timeline segment.
 * @param {number} ctx.rotTime
 * @param {object} ctx.elCounts
 * @param {(weaponName: string, rawDefIgnore: number) => number} ctx.gateWeaponDefIgnore
 * @param {(start: number, duration: number) => number} ctx.overlapUptime  Bound to the main DPS's own dpsSeg.
 * @param {(ownerName: string) => number} ctx.outroStart
 * @param {(ownerName: string) => number} ctx.blockStart
 * @param {string[]} ctx.dpsFocus  mainDps.d.dmgFocus || [].
 * @param {object} ctx.energyCycleFactors  Per-member { libUptime, totalER } from calcEnergyCycles.
 * @param {(b: object, totalER: number|undefined) => number} ctx.resolveBuffValue
 * @returns {{atkPct:number, cr:number, cd:number, elemDmg:number, skillDmg:number, deepen:number,
 *   defShred:number, resShred:number, defIgnore:number, amplify:number, seqTotalMultBonus:number}}
 */
export function computeLegacyMainDpsStats(ctx) {
  const { mainDps, mems, teamEquipment, teamIdx, dpsSeg, rotTime, elCounts, gateWeaponDefIgnore, overlapUptime, outroStart, blockStart, dpsFocus, energyCycleFactors, resolveBuffValue } = ctx;
  let atkPct = 0, cr = 5, cd = 150, elemDmg = 0, skillDmg = 0, deepen = 0, defShred = 0, resShred = 0, defIgnore = 0;
  let amplify = 0;
  let seqTotalMultBonus = 0;

    const mainStatKey = mainDps.scaling === 'HP' ? 'HP%' : mainDps.scaling === 'DEF' ? 'DEF%' : 'ATK%';

    if (mainDps.weapSubstat === 'Crit Rate') cr += parseFloat(mainDps.weapSubVal) || 0;
    if (mainDps.weapSubstat === 'Crit DMG') cd += parseFloat(mainDps.weapSubVal) || 0;
    if (mainDps.weapSubstat === mainStatKey) atkPct += parseFloat(mainDps.weapSubVal) || 0;

    let wpBasicDmg = 0, wpHeavyDmg = 0, wpLibDmg = 0, wpEchoDmg = 0, wpCoordDmg = 0, wpSkillDmg = 0;
    if (mainDps.weapon) {
      const mainRefLevel = (teamEquipment[teamIdx + ':' + mainDps.name])?.refinement || 1;
      const mainRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[mainRefLevel - 1] || 1 : 1;
      const mainRawPv = mainDps.weapon.pv || parsePassive(mainDps.weapon.passive, mainDps.d.element);
      const wp = Object.fromEntries(Object.entries(mainRawPv).map(([k, v]) => [k, typeof v === 'number' ? v * mainRefScale : v]));
      if (mainDps.scaling === 'ATK') atkPct += (wp.atkPct || 0);
      else if (mainDps.scaling === 'HP') atkPct += (wp.hpPct || 0);
      else if (mainDps.scaling === 'DEF') atkPct += (wp.defPct || 0);
      elemDmg += (wp.elemDmg || 0); wpSkillDmg += (wp.skillDmg || 0);
      cr += (wp.critRate || 0); cd += (wp.critDmg || 0);
      defIgnore += gateWeaponDefIgnore(mainDps.weapName, wp.defIgnore || 0); resShred += (wp.resShred || 0);
      wpBasicDmg = (wp.basicDmg || 0); wpHeavyDmg = (wp.heavyDmg || 0);
      wpLibDmg = (wp.libDmg || 0); wpEchoDmg = (wp.echoDmg || 0);
      wpCoordDmg = (wp.coordDmg || 0);
    }

    // Apply main DPS echo set bonuses (using shared utility)
    {
      const setStats = createStats();
      applyFullEchoSet(setStats, mainDps.echoSet, mainDps.echoSet2, mainDps.d.element, mainDps.scaling);
      atkPct += setStats.atkPct; cr += setStats.cr - BASE_CRIT_RATE; cd += setStats.cd - BASE_CRIT_DMG;
      elemDmg += setStats.elemDmg; wpSkillDmg += setStats.skillDmg;
      wpBasicDmg += setStats.basicDmg; wpHeavyDmg += setStats.heavyDmg;
      wpLibDmg += setStats.libDmg; wpEchoDmg += setStats.echoDmg;
    }

    let echoBasicDmg = 0, echoHeavyDmg = 0, echoSkillDmg = 0, echoLibDmg = 0;
    {
      const mainEqKey = teamIdx + ':' + mainDps.name;
      const mainEq = teamEquipment[mainEqKey];
      const echoes = mainEq?.echoes || [];
      const mainEl = (mainDps.d.element || '').toLowerCase();
      const elDmgKey = mainEl ? mainEl.charAt(0).toUpperCase() + mainEl.slice(1) + ' DMG' : '';
      const mainStatVals = ECHO_MAIN_STAT_VALUES;
      const applyStat = (stat, val) => {
        if (stat === mainStatKey) atkPct += val;
        else if (stat === 'Crit Rate') cr += val;
        else if (stat === 'Crit DMG') cd += val;
        else if (stat === elDmgKey) elemDmg += val;
        else if (stat === 'Basic ATK DMG') echoBasicDmg += val;
        else if (stat === 'Heavy ATK DMG') echoHeavyDmg += val;
        else if (stat === 'Resonance Skill DMG') echoSkillDmg += val;
        else if (stat === 'Resonance Liberation DMG') echoLibDmg += val;
      };
      echoes.forEach((echo, i) => {
        if (!echo || typeof echo !== 'object') return;
        const cost = i === 0 ? 4 : i < 3 ? 3 : 1;
        if (echo.mainStat) {
          const val = mainStatVals[cost]?.[echo.mainStat] || 0;
          if (echo.mainStat === 'ATK' || echo.mainStat === 'HP' || echo.mainStat === 'DEF') {
            // Flat ATK (3-cost) / flat HP (1-cost) main stat — same %-of-base conversion as a flat
            // substat below, same reasoning (calcEngine.js's flatToPct): full credit only when it
            // matches the main DPS's own scaling stat.
            const baseForSub = echo.mainStat === 'ATK' ? mainDps.totalBaseAtk : echo.mainStat === 'HP' ? mainDps.d.baseHp : mainDps.d.baseDef;
            if (val && echo.mainStat === mainDps.scaling && baseForSub) atkPct += (val / baseForSub) * 100;
          } else {
            applyStat(echo.mainStat, val);
          }
        }
        // Same duplicate-substat guard as calcEngine.js's applyEchoStats (a real echo can never
        // carry the same substat type twice or more than 5 total) -- this block hand-duplicates
        // that function's logic instead of calling it, so it needs the same defense independently
        // rather than trusting it stays in sync.
        const seenMainSubs = new Set();
        (echo.substats || []).slice(0, 5).forEach(sub => {
          if (seenMainSubs.has(sub)) return;
          seenMainSubs.add(sub);
          if (sub === 'ATK' || sub === 'HP' || sub === 'DEF') {
            // Flat ATK/HP/DEF substat: converts to %-of-base-stat, and only actually helps the
            // main DPS if it matches their own scaling stat (see calcEngine.js flatSubToPct for
            // the full reasoning — no partial credit here, unlike teamwide ATK% buffs elsewhere).
            const flatVal = getSubstatGradeValue(sub, echo.substatRolls?.[sub]);
            const baseForSub = sub === 'ATK' ? mainDps.totalBaseAtk : sub === 'HP' ? mainDps.d.baseHp : mainDps.d.baseDef;
            if (flatVal && sub === mainDps.scaling && baseForSub) {
              atkPct += (flatVal / baseForSub) * 100;
            }
            return;
          }
          const val = getSubstatGradeValue(sub, echo.substatRolls?.[sub]);
          if (val) applyStat(sub, val);
        });
      });
    }

    {
      const mainEl = mainDps.d.element;
      if (mainEl && elCounts[mainEl] >= 2) elemDmg += 10;
    }

    // ── Main DPS echo skill buffs (self buffs from their own 4-cost echo) ──
    if (mainDps.mainEchoName) {
      const mainEsb = ECHO_SKILL_BUFFS[mainDps.mainEchoName];
      if (mainEsb && (mainEsb.target || 'self') === 'self' && (!mainEsb.condition || mainDps.name.includes(mainEsb.condition))) {
        // Self-targeted — only matters while the DPS is actually on field, so the right denominator
        // is their own on-field window (dpsSeg.duration), not the whole rotation. Same dilution bug
        // as the cross-character sites above, just self-scoped: a 15s proc buff on a DPS with a 17s
        // on-field window is ~88% uptime during their own combo, not ~37% of a 40s full rotation.
        const esbUp = mainEsb.passive ? 1 : (dpsSeg?.duration > 0 ? Math.min(1, (mainEsb.duration || 15) / dpsSeg.duration) : Math.min(1, (mainEsb.duration || 15) / rotTime));
        mainEsb.buffs.forEach(b => {
          const val = b.value * esbUp;
          const mainEl = (mainDps.d.element || '').toLowerCase();
          if (b.stat === mainEl + 'Dmg') elemDmg += val;
          else if (b.stat === 'allDmg') elemDmg += val;
          else if (b.stat === 'atkPct') atkPct += val;
          else if (b.stat === 'skillDmg') wpSkillDmg += val;
          else if (b.stat === 'basicDmg') wpBasicDmg += val;
          else if (b.stat === 'heavyDmg') wpHeavyDmg += val;
          else if (b.stat === 'libDmg') wpLibDmg += val;
          else if (b.stat === 'echoDmg') wpEchoDmg += val;
          else if (b.stat === 'coordDmg') wpCoordDmg += val;
          else if (b.stat === 'critRate') cr += val;
          else if (b.stat === 'critDmg') cd += val;
        });
      }
    }

    let basicDmg = wpBasicDmg, heavyDmg = wpHeavyDmg, libDmg = wpLibDmg, echoDmg = wpEchoDmg, coordDmg = wpCoordDmg, mainSkillDmg = wpSkillDmg;
    // Bridges the flat atkPct/cr/cd/elemDmg/deepen/amplify/resShred/defShred/defIgnore/echoDmg
    // accumulators (used throughout this whole FULL TIER section) into a single object applyBuff can
    // mutate directly, then syncs back once after the loop -- addition is commutative so accumulating
    // into the bridge across every member first and reading the flat variables only after the loop
    // (instead of after each individual buff) changes nothing about the final totals. This is what lets
    // every buff/debuff branch below share ONE gated implementation (calcEngine.js's applyBuff) instead
    // of each repeating its own copy of the type-focus/element-match checks -- previously the actual
    // cause of the deepen/allDmg/elemDmg gating bugs needing ~8 separate hand-patches across this file.
    const mainDpsElLower = (mainDps.d.element || '').toLowerCase();
    const mainStats = { atkPct, cr, cd, elemDmg, deepen, amplify, resShred, defShred, defIgnore, echoDmg };
    mems.forEach(m => {
      const bt = CHAR_BUFF_TABLE[m.name];
      if (!bt) return;
      const isMain = m.name === mainDps.name;

      if (!isMain) {
        // WuWa outro buffs are "DMG Amplification" — a SEPARATE multiplicative layer
        // from self DMG Bonus. Route element/skill/type Amp buffs to `amplify`.
        // 'ally' (Rover: Electro's Outro) means the same thing as 'next' — the incoming
        // Resonator receives the buff — just labeled differently in the data; treat identically
        // or it silently never applies to anyone.
        (bt.outroBuffs || []).forEach(b => {
          if (b.target === 'next' || b.target === 'enemy' || b.target === 'ally') {
            const uptime = overlapUptime(outroStart(m.name), b.duration || 14);
            const val = b.value * uptime;
            if (b.stat === 'atkPct') {
              mainStats.atkPct += mainDps.scaling === 'ATK' ? val : val * 0.25;
            } else if (['allDmg', 'elemDmg', 'basicDmg', 'heavyDmg', 'libDmg', 'echoDmg', 'skillDmg'].includes(b.stat)) {
              applyBuff(mainStats, b.stat, val, { isAmplify: true, condition: b.condition, dpsFocus, dpsElLower: mainDpsElLower });
            } else if (b.stat === 'deepen') {
              applyBuff(mainStats, 'deepen', val, { condition: b.condition, dpsElLower: mainDpsElLower, dpsName: mainDps.name });
            } else if (b.stat === 'critRate' || b.stat === 'critDmg' || b.stat === 'resShred' || b.stat === 'defShred') {
              applyBuff(mainStats, b.stat, val);
            }
          }
        });
        // target: 'team' outroBuffs — found completely unhandled 2026-09-02 (the engine-architecture history (git log)
        // item 10): none of the three places this file reads outroBuffs (this one, the rotation-
        // timeline builder, the mode-3 team-application loop) ever checked for 'team', only
        // 'next'/'enemy'/'ally' — 11 real, sourced roster-wide entries (Denia's Fusion Burst mode
        // Outro +60% elemDmg, Lucilla's Glacio Chafe mode Outro +60% elemDmg, Aemeath's own +10% All
        // DMG Outro, etc.) were dead data, contributing zero DPS regardless of team composition. Same
        // outro-triggered timing convention as the 'next'/'ally' branch above (fires at THIS member's
        // own outroStart, not blockStart — a real cast event, not passive from swap-in) since a 'team'
        // outro buff is still triggered by casting the Outro, just with a wider recipient set; same
        // routing table as 'next' (isAmplify layer, same stat list) since WuWa's own Outro buffs are
        // always DMG Amplification regardless of recipient scope.
        (bt.outroBuffs || []).forEach(b => {
          if (b.target !== 'team') return;
          const uptime = overlapUptime(outroStart(m.name), b.duration || 30);
          const val = b.value * uptime;
          if (b.stat === 'atkPct') {
            mainStats.atkPct += mainDps.scaling === 'ATK' ? val : val * 0.25;
          } else if (['allDmg', 'elemDmg', 'basicDmg', 'heavyDmg', 'libDmg', 'echoDmg', 'skillDmg'].includes(b.stat)) {
            applyBuff(mainStats, b.stat, val, { isAmplify: true, condition: b.condition, dpsFocus, dpsElLower: mainDpsElLower });
          } else if (b.stat === 'deepen') {
            applyBuff(mainStats, 'deepen', val, { condition: b.condition, dpsElLower: mainDpsElLower, dpsName: mainDps.name });
          } else if (b.stat === 'critRate' || b.stat === 'critDmg' || b.stat === 'resShred' || b.stat === 'defShred') {
            applyBuff(mainStats, b.stat, val);
          }
          // 'totalMult' (Rover: Aero's Storm's Echo outro) deliberately falls through unhandled here,
          // same as every other 'totalMult'-stat buff in this per-stat routing table — it's summed
          // separately elsewhere in this file, not through applyBuff()'s stat switch.
        });
      }

      // Sonata set p5 team/next ATK% buffs (Rejuvenating Glow/Halo of Starry Radiance's heal-triggered
      // teamAtk, Moonlit Clouds' Outro-triggered nextAtk) — previously only emitted into the cosmetic
      // Rotation Timeline event list, never added to the actual stat totals the DPS number is computed
      // from. teamAtk applies from any member (including the main DPS healing/triggering it themself);
      // nextAtk only from a non-main member swapping the main DPS in via their Outro.
      const p5v = m.echoSet?.p5val;
      if (p5v?.teamAtk) {
        const uptime = overlapUptime(blockStart(m.name), 20);
        const val = p5v.teamAtk * uptime;
        mainStats.atkPct += mainDps.scaling === 'ATK' ? val : val * 0.25;
      }
      if (!isMain && p5v?.nextAtk) {
        const uptime = overlapUptime(outroStart(m.name), 14);
        const val = p5v.nextAtk * uptime;
        mainStats.atkPct += mainDps.scaling === 'ATK' ? val : val * 0.25;
      }

      (bt.libBuffs || []).forEach(b => {
        if (b.target === 'team' || (!isMain && b.target === 'next')) {
          const uptime = overlapUptime(blockStart(m.name), b.duration || 25);
          const val = b.value * uptime;
          if (b.stat === 'atkPct') { if (mainDps.scaling === 'ATK') mainStats.atkPct += val; }
          else if (b.stat === 'allDmg' || b.stat === 'elemDmg') applyBuff(mainStats, b.stat, val, { condition: b.condition, dpsElLower: mainDpsElLower, dpsName: mainDps.name });
          else if (b.stat === 'critRate' || b.stat === 'critDmg' || b.stat === 'echoDmg') applyBuff(mainStats, b.stat, val);
        }
      });

      // A real, deliberate data convention: some passive, always-on team-wide buffs (not tied to an
      // outro/Liberation trigger) are stored in selfBuffs with target:'team' instead of a dedicated
      // team-buff array (see Sigrika's Blessing of Runes -- "+48% Aero DMG to whichever Resonator is
      // active", explicitly NOT self-only despite the array name -- and Rover: Electro's Overshock
      // team ATK buff). This loop previously only ever read a non-main teammate's outroBuffs/libBuffs,
      // never selfBuffs at all, so a teammate's real target:'team' buff was completely invisible to
      // the actual DPS number -- confirmed via a direct A/B calcTeamStats comparison (Sigrika vs. a
      // same-element filler with no such buff produced byte-identical elemDmg). isMain is excluded
      // here since a main DPS's own selfBuffs (any target) already apply to themselves below.
      if (!isMain) {
        (bt.selfBuffs || []).forEach(b => {
          if (b.target !== 'team') return;
          const uptime = overlapUptime(blockStart(m.name), b.duration || 25);
          const val = b.value * uptime;
          if (b.stat === 'atkPct') { if (mainDps.scaling === 'ATK') mainStats.atkPct += val; }
          else if (b.stat === 'allDmg' || b.stat === 'elemDmg') applyBuff(mainStats, b.stat, val, { condition: b.condition, dpsElLower: mainDpsElLower, dpsName: mainDps.name });
          else if (b.stat === 'critRate' || b.stat === 'critDmg' || b.stat === 'echoDmg') applyBuff(mainStats, b.stat, val);
        });
      }

      if (isMain) {
        const mainTotalER = energyCycleFactors?.[mainDps.name]?.totalER;
        (bt.selfBuffs || []).forEach(b => {
          const val = resolveBuffValue(b, mainTotalER);
          // Own kit's self-target buffs always apply to their own damage — no target-matching gate
          // needed (that's exactly what a "self" buff means), so no dpsFocus/dpsElLower passed here.
          if (['atkPct', 'elemDmg', 'critRate', 'critDmg', 'defIgnore', 'deepen', 'echoDmg'].includes(b.stat)) applyBuff(mainStats, b.stat, val);
        });
      }

      (bt.debuffs || []).forEach(db => {
        if (db.stat === 'frazzle' || db.stat === 'erosion') return; // handled separately by the DOT tier
        if (db.stat === 'havocBane') { mainStats.defShred += db.value * 2; return; }
        // 'deepen'/'offTune' as a debuff stat (e.g. Galbrena's Afterflame — enemy DMG Taken) is the
        // same multiplier as the buff-side 'deepen', just framed as an enemy debuff instead of an ally
        // buff — was never recognized here before, silently dropping the whole effect from every DPS
        // calc. 'defIgnore' debuffs (e.g. Carlotta's Deconstruction) target the enemy's own DEF, same
        // as the buff-side 'defIgnore' — was falling through to the no-op default too.
        // Same self-state-dependency discount as calcEngine.js's scoreTeamComposition: a non-headline
        // Main DPS's own deepen/offTune debuff (e.g. Galbrena's Afterflame, gated to "while Galbrena is
        // in Demon Hypostasis" -- her own sustained active-state) can't be assumed to reliably fire when
        // she isn't the character actually receiving the rotation's on-field time. Verified this was a
        // real gap: with Jiyan as the real headline, Galbrena's Afterflame applied its full raw 60%
        // regardless of her own on-field presence, identical to a teammate with no such debuff at all
        // except for this one uncapped bonus. Discounted, not zeroed, since she still spends SOME
        // on-field time via her own rotation block, just not enough to assume the full value.
        const selfStateDiscount = (db.stat === 'deepen' || db.stat === 'offTune') && !isMain && CHARACTER_DATA[m.name]?.role === 'Main DPS' ? 0.35 : 1;
        applyBuff(mainStats, db.stat, db.value * selfStateDiscount, { condition: db.condition, dpsElLower: mainDpsElLower, dpsName: mainDps.name });
      });
    });
    ({ atkPct, cr, cd, elemDmg, deepen, amplify, resShred, defShred, defIgnore, echoDmg } = mainStats);

    // DMG Bonus layer: weapon + echo self-bonuses (NOT outro amplify)
    basicDmg += echoBasicDmg; heavyDmg += echoHeavyDmg; libDmg += echoLibDmg;
    mainSkillDmg += echoSkillDmg;

    // Apply resonance chain bonuses (using shared utility) — moved ahead of the type-routing step
    // below (was previously applied AFTER it): basicDmg/heavyDmg/libDmg/echoDmg/skillDmg contributions
    // from a character's own Resonance Chain (e.g. Qingxiao's S2 "+40% Heavy ATK DMG", S5 "+100% Skill
    // DMG") were being added to these variables only after routeTypeBonuses had already consumed them
    // into the final dmgBonus figure — calcDmgBonus() never reads basicDmg/heavyDmg/libDmg/echoDmg
    // again afterward, so those contributions were silently discarded for every character whose chain
    // grants one of these 5 stat types (100 such entries across the roster). Moving this block ahead
    // means it now correctly feeds the same pre-routing pools everything else here uses.
    const seqStats = { atkPct: 0, cr: 0, cd: 0, elemDmg: 0, skillDmg: 0, basicDmg: 0, heavyDmg: 0, libDmg: 0, echoDmg: 0, deepen: 0, amplify: 0, defShred: 0, resShred: 0, defIgnore: 0 };
    mems.forEach(m => {
      const isMain = m.name === mainDps.name;
      const bonus = applyResonanceChain(seqStats, m.name, m.seqLevel, isMain);
      if (isMain) seqTotalMultBonus += bonus;
    });
    atkPct += seqStats.atkPct; cr += seqStats.cr; cd += seqStats.cd;
    elemDmg += seqStats.elemDmg; mainSkillDmg += seqStats.skillDmg;
    basicDmg += seqStats.basicDmg; heavyDmg += seqStats.heavyDmg;
    libDmg += seqStats.libDmg; echoDmg += seqStats.echoDmg;
    deepen += seqStats.deepen; defShred += seqStats.defShred;
    resShred += seqStats.resShred; defIgnore += seqStats.defIgnore;

    // Route type-specific DMG Bonus into skillDmg based on character's damage focus
    { const typeStats = { skillDmg: mainSkillDmg, basicDmg, heavyDmg, libDmg, echoDmg, coordDmg };
      routeTypeBonuses(typeStats, dpsFocus);
      skillDmg += typeStats.skillDmg; }

    const mainDpsEl = (mainDps.d.element || '').toLowerCase();
    mems.forEach(m => {
      if (m.name === mainDps.name) return;
      const sn = m.echoSetName;
      const sn2 = m.echoSet2Name;
      // Healer/Support set team buffs. These grant real ATK% (raises the ATK stat, not "whatever the
      // DPS scales on") — for an ATK-scaling main DPS that's a 1:1 damage gain, but for an HP/DEF
      // scaler ATK barely factors into their Motion Value damage, so it's given the same 25%
      // partial-credit fallback used everywhere else in this file for off-scaling ATK buffs (was
      // previously added at full value regardless of scaling — inconsistent with every other ATK
      // buff site here, and a real undervaluation bug in the other direction for HP/DEF-scaling DPS).
      // Sourced from TEAM_SET_BUFFS so the rotation timeline can render the exact same bonuses.
      (TEAM_SET_BUFFS[sn] || []).forEach(e => {
        if (e.elem && e.elem !== mainDpsEl) return;
        if (e.stat === 'atkPct') atkPct += mainDps.scaling === 'ATK' ? e.value : e.value * 0.25;
        else if (e.stat === 'elemDmg') elemDmg += e.value;
        // Was `libDmg += e.value` — but this forEach runs after the type-routing step above has
        // already spent `libDmg` into the final `skillDmg` figure; a further addition to `libDmg`
        // here was silently discarded (calcDmgBonus never reads it again), same dead-write bug as the
        // resonance chain fix above, just for TEAM_SET_BUFFS' one 'Flaming Clawprint' libDmg entry.
        // Added directly to the already-routed `skillDmg`, gated by the same Liberation-focus check
        // routeTypeBonuses would have applied.
        else if (e.stat === 'libDmg' && dpsFocus.includes('Liberation')) skillDmg += e.value;
      });
      // 3pc set team contribution from sub-DPS (wearer benefits, no direct team buff)
      // 2pc bonus from hybrid secondary set applied to wearer only (handled in sub-DPS calc)
      const bt = CHAR_BUFF_TABLE[m.name];
      (bt?.weaponBuffs || []).forEach(wb => {
        if (wb.target !== 'team') return;
        const uptime = overlapUptime(blockStart(m.name), wb.duration || 10);
        const val = wb.value * uptime;
        if (wb.stat === 'atkPct' && mainDps.scaling === 'ATK') atkPct += val;
        else if (wb.stat === 'critRate') cr += val;
        else if (wb.stat === 'critDmg') cd += val;
        else if (wb.stat === 'allDmg') elemDmg += val;
      });
      if (m.weapon?.tv) {
        const tvRefLevel = (teamEquipment[teamIdx + ':' + m.name])?.refinement || 1;
        const tvRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[tvRefLevel - 1] || 1 : 1;
        const wt = m.weapon.tv;
        const uptime = overlapUptime(blockStart(m.name), wt.duration || 15);
        if (wt.atkPct) atkPct += wt.atkPct * tvRefScale * uptime;
        if (wt.elemDmg) elemDmg += wt.elemDmg * tvRefScale * uptime;
        if (wt.critRate) cr += wt.critRate * tvRefScale * uptime;
        if (wt.critDmg) cd += wt.critDmg * tvRefScale * uptime;
      }
      // ── Echo active skill buffs from sub-DPS (team/next buffs) ──
      if (m.mainEchoName) {
        const esb = ECHO_SKILL_BUFFS[m.mainEchoName];
        if (esb) {
          const target = esb.target || 'self';
          // 'next' is an outro-triggered handoff (starts when the owner swaps out); 'team' is active
          // from the owner's own on-field start — same distinction the rotationTimeline closure above
          // already makes for these two target types, now applied to the real uptime too.
          const esbUptime = esb.passive ? 1 : overlapUptime(target === 'next' ? outroStart(m.name) : blockStart(m.name), esb.duration || 15);
          if ((target === 'team' || target === 'next') && (!esb.condition || m.name.includes(esb.condition))) {
            esb.buffs.forEach(b => {
              const val = b.value * esbUptime;
              if (b.stat === 'allDmg') elemDmg += val;
              else if (b.stat === 'atkPct' && mainDps.scaling === 'ATK') atkPct += val;
              else if (b.stat === 'critRate') cr += val;
              else if (b.stat === 'critDmg') cd += val;
              else {
                const mainEl = (mainDps.d.element || '').toLowerCase();
                if (b.stat === mainEl + 'Dmg') elemDmg += val;
              }
            });
          }
        }
      }
    });

  return { atkPct, cr, cd, elemDmg, skillDmg, deepen, defShred, resShred, defIgnore, amplify, seqTotalMultBonus };
}
