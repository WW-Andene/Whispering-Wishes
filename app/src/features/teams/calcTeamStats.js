// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/teams/calcTeamStats.js (extracted from DamageCalculator.jsx)
// Team-wide damage stats orchestration: for each candidate team, invokes the
// calcEngine primitives member-by-member and builds the rotation timeline.
// Moved verbatim from DamageCalculator.jsx's calcTeamStats useCallback —
// teamEquipment/enemyEcho/enemyLevel were closed-over component state there;
// here they're explicit parameters instead. No behavior change: internal
// sub-sections (RAW/FULL/DOT tiers, rotation timeline builder) still share
// local variables rather than being independently callable, so this is a
// verbatim relocation, not a rewrite — a further split is a follow-up pass.
// ═══════════════════════════════════════════════════════════════════════════════

import { CHARACTER_DATA, CHAR_BUFF_TABLE, CHARACTER_ROTATIONS } from '../../data/characters.js';
import { WEAPON_DATA } from '../../data/weapons.js';
import { ECHO_SETS, ECHO_DATA, ECHO_SKILL_BUFFS, getEnemyStatsAtLevel } from '../../data/echoes.js';
import { WEAPON_REFINE_SCALE } from '../../data/constants.js';
import { STAT_LABELS_FULL } from './RotationTimeline.jsx';
import {
  ATTACKER_FACTOR, BASE_CRIT_RATE, BASE_CRIT_DMG,
  ECHO_MAIN_STAT_VALUES, getSubstatGradeValue,
  createStats, parsePassive, getWeaponPv,
  applyFullEchoSet, applyEchoStats,
  countTeamElements, routeTypeBonuses, applyResonanceChain,
  calcDefMult, calcResMult, calcAvgCrit, calcDmgBonus,
  calcEnergyCycles,
  isHealerRole,
  TEAM_SET_BUFFS,
  universalStatApplies,
  applyBuff,
} from './calcEngine.js';
import { BLOCKS_BY_CHARACTER } from '../../engine/characterBlocks/index.js';
import { deriveStepsFromRotation } from '../../engine/rotationSimulator.js';
import { resolveHitComposedDps } from '../../engine/resolveHitComposedDps.js';
import { resolveHitComposedTeamDps } from '../../engine/resolveHitComposedTeamDps.js';
import { resolveSimulatedTeamRotation } from '../../engine/resolveSimulatedTeamRotation.js';
import { resolveDotReactionDps, recomputeFusionBurstDmg } from '../../engine/dotReactions.js';
import { chooseOnFieldOrder } from '../../engine/rotationOrderSearch.js';
import { coordinatedMultShare } from '../../engine/coordinatedAtk.js';
import { gateBlocksBySequence, filterExclusiveModeBlocks } from '../../engine/sequenceGating.js';

// A selfBuff/outroBuff/libBuff whose real value scales with the character's own equipped Energy
// Regen (e.g. Sigrika's "+2% Echo Skill DMG per 1% ER above 125%, up to 50%", Mornye's Tune Break
// Interfered Marker amp) carries an optional erScale: { threshold, ratePerPercent, cap }. b.value
// stays the CAP for display/fallback purposes; this resolves the buff's actual contribution from
// totalER when known, so an under-ER-built character doesn't silently get credited the max anyway.
function resolveBuffValue(b, totalER) {
  if (!b.erScale) return b.value;
  if (totalER == null) return b.value; // no ER data available (yet) — fall back to the cap
  const { threshold, ratePerPercent, cap } = b.erScale;
  return Math.min(cap, Math.max(0, totalER - threshold) * ratePerPercent);
}

// Shared with scoreTeamComposition (calcEngine.js) so TeamsTab's "Team Suggestions" list can fold
// the selected enemy's per-element RES into its ranking using the exact same lookup calcTeamStats
// itself uses below (enemyStats.res when the full per-level curve is known, else the older flat
// enemyRes map, else {} so getEnemyRes's own ?? 10 fallback applies uniformly).
export function getEnemyResMap(enemyEcho) {
  if (!enemyEcho) return null;
  const enemyEchoData = ECHO_DATA[enemyEcho];
  const enemyStats = enemyEchoData?.enemyStats || null;
  return enemyStats?.res || enemyEchoData?.enemyRes || {};
}

export function calcTeamStats(slots, teamIdx, mainDpsOverride, teamEquipment, enemyEcho, enemyLevel) {
    const mems = slots.filter(s => s).map(name => {
      const d = CHARACTER_DATA[name];
      if (!d) return null;
      const eqKey = teamIdx + ':' + name;
      const eq = teamEquipment[eqKey];
      const weapName = (eq?.weapon) || d.bestWeapon;
      const weapon = WEAPON_DATA[weapName] || null;
      const charAtk = d.baseAtk || 0;
      const weapAtk = weapon ? weapon.baseAtk : 0;
      const seqLevel = eq?.sequence || 0;
      const equippedEchoes = eq?.echoes || [];
      const hasAnyEcho = equippedEchoes.some(e => e && typeof e === 'object' && e.name);
      // Real equipped-echo set counts — the set bonus must never apply based on a stale/manual
      // echoSet override or a "recommended gear" text guess when it doesn't match what's actually worn.
      const wornSetCounts = {};
      equippedEchoes.forEach(e => {
        const n = e && typeof e === 'object' ? e.name : null;
        if (!n) return;
        (ECHO_DATA[n]?.sets || []).forEach(s => { wornSetCounts[s] = (wornSetCounts[s] || 0) + 1; });
      });
      let echoSetName = eq?.echoSet || '';
      let echoSet2Name = eq?.echoSet2 || '';
      if (!echoSetName && !hasAnyEcho && d.bestEchoes) {
        // No echoes equipped at all yet → preview the recommended build's set bonus (onboarding aid).
        for (const e of d.bestEchoes) {
          // Parse hybrid "SetA 3pc + SetB 2pc" format
          const hybridMatch = e.match(/^(.+?)\s+3pc\s*\+\s*(.+?)\s+2pc$/i);
          if (hybridMatch) {
            const s1 = hybridMatch[1].trim(), s2 = hybridMatch[2].trim();
            if (ECHO_SETS[s1]) { echoSetName = s1; }
            if (ECHO_SETS[s2]) { echoSet2Name = s2; }
            break;
          }
          const k = Object.keys(ECHO_SETS).find(k => e.includes(k));
          if (k) { echoSetName = k; break; }
        }
      } else if (hasAnyEcho) {
        // Echoes are actually equipped — only honor a forced/manual echoSet if it's actually worn
        // in sufficient count (2pc-type sets need ≥2, 3pc-type sets need ≥3), otherwise drop it so a
        // stale override (e.g. after swapping echoes) can't silently keep granting a bonus.
        const meetsThreshold = (setName) => {
          const s = ECHO_SETS[setName];
          if (!s) return false;
          const need = s.p3val ? 3 : 5; // p3val sets unlock at 3pc; standard sets' p2+p5 combo needs 5pc
          return (wornSetCounts[setName] || 0) >= need;
        };
        if (echoSetName && !meetsThreshold(echoSetName)) echoSetName = '';
        if (echoSet2Name && (wornSetCounts[echoSet2Name] || 0) < 2) echoSet2Name = '';
      }
      const scaling = d.statScaling || 'ATK';
      const baseStat = scaling === 'HP' ? (d.baseHp || 0) : scaling === 'DEF' ? (d.baseDef || 0) : charAtk + weapAtk;
      const mainEchoName = eq?.echoes?.[0]?.name || '';
      return { name, d, weapon, weapName, charAtk, weapAtk, totalBaseAtk: charAtk + weapAtk, scaling, baseStat, echoSetName: (echoSetName && ECHO_SETS[echoSetName]) ? echoSetName : '', echoSet: (echoSetName && ECHO_SETS[echoSetName]) ? ECHO_SETS[echoSetName] : null, echoSet2Name: (echoSet2Name && ECHO_SETS[echoSet2Name]) ? echoSet2Name : '', echoSet2: (echoSet2Name && ECHO_SETS[echoSet2Name]) ? ECHO_SETS[echoSet2Name] : null, weapSubstat: weapon?.stat || '', weapSubVal: weapon?.subStatValue || '', seqLevel, mainEchoName };
    }).filter(Boolean);
    if (!mems.length) return null;
    const allBuffs = [], allDebuffs = [];
    mems.forEach(m => { (m.d.buffs || []).forEach(b => allBuffs.push({ source: m.name, buff: b })); (m.d.debuffs || []).forEach(b => allDebuffs.push({ source: m.name, debuff: b })); });
    // DPS selection: an explicit mainDpsOverride wins — needed both for dual-Main-DPS-role team comps
    // (slot order alone can't tell us which one the player wants optimized around) and for pure
    // Sub-DPS/hybrid quickswap comps with zero 'Main DPS'-role members, where auto-detect falls back
    // to highest totalMult with no way for the player to say otherwise. The override no longer
    // requires the target to carry the 'Main DPS' role tag — any team member the player picks can be
    // the headline damage figure the calculator optimizes buff timing/uptime around. Only requirement:
    // they must still actually be in this team. Otherwise fall back to auto-detect: prefer 'Main DPS'
    // role, then highest totalMult character.
    const mainDps = (mainDpsOverride && mems.find(m => m.name === mainDpsOverride))
      || mems.find(m => m.d.role === 'Main DPS')
      || mems.reduce((best, m) => (!best || (m.d.totalMult || 0) > (best.d.totalMult || 0)) ? m : best, null)
      || mems[0];

    // ── Enemy scaling (using named constants from calcEngine) ──
    // No target selected (enemyEcho === '') keeps the original generic level-only formula/0-baseline
    // behavior unchanged. A selected target overrides DEF with its real stat at the chosen enemyLevel
    // (getEnemyStatsAtLevel, full 1-120 per-enemy curve) when known, and RES with its full per-element
    // map (enemyStats.res) instead of the old single-element enemyRes lookup.
    const enemyEchoData = enemyEcho ? ECHO_DATA[enemyEcho] : null;
    const enemyStats = enemyEchoData?.enemyStats || null;
    const enemyLevelStats = enemyEcho ? getEnemyStatsAtLevel(enemyEcho, enemyLevel) : null;
    const enemyDef90 = enemyLevelStats?.def ?? enemyStats?.def ?? (792 + 8 * (Number(enemyLevel) || 90));
    const enemyResMap = enemyStats?.res || enemyEchoData?.enemyRes || {};
    const getEnemyRes = (el) => {
      const elLow = (el || '').toLowerCase();
      return enemyResMap[elLow] ?? 10;
    };

    // ── Shared team data (computed once, used by all tiers) ──
    const elCounts = countTeamElements(mems);
    const sumOnField = mems.reduce((s, m) => s + (m.d.onField || (m.name === mainDps.name ? 15 : 5)), 0);
    const rawRotTime = Math.max(15, Math.min(35, sumOnField + 2)); // +2s for swap animations
    const rotTime = rawRotTime;
    // Computed early (was previously computed much later, after the buff-accumulation tiers had
    // already run) so per-character ER-scaling selfBuffs (e.g. Sigrika's "+2% Echo Skill DMG per 1%
    // ER above 125%, up to 50%") can read each member's real equipped ER instead of only ever
    // applying their hardcoded cap — same fix already applied to Mornye's Tune Break amp.
    const energyCycleFactors = calcEnergyCycles(mems, teamEquipment, teamIdx);

    // PHASE3_PLAN.md Stage 4 step 4: computed once, here — BEFORE rotationTimeline's own IIFE, so it
    // can reuse this exact order instead of running its own separate permutation search — and reused
    // again by the FULL tier's engine path below (step 2), instead of calling chooseOnFieldOrder a
    // second time for the same team. A team where every member is converted gets ONE real,
    // engine-derived on-field order; rotationTimeline's own legacy search stays the fallback for a
    // mixed team, unchanged.
    const allMembersConverted = mems.every(m => BLOCKS_BY_CHARACTER[m.name] && CHARACTER_ROTATIONS[m.name]);
    // Blocks are gated by each member's own owned Resonance Chain sequence (gateBlocksBySequence,
    // engine/sequenceGating.js) BEFORE reaching chooseOnFieldOrder/buildTeamSteps — fixed 2026-09-01:
    // this was passing every member's raw, ungated blocks (as if everyone were R6), so an unbuilt
    // member's chain buffs/damage fired unconditionally in both the order search's own scoring AND
    // every downstream consumer of engineChosenOrder.blocksByOwner (the FULL-tier teamDps/memberDps
    // override below, and the main-DPS stat panel's resolveSimulatedTeamRotation call) — the exact
    // "counted as if R6" bug Stage 3 item 1 already fixed for the RAW/solo tier, silently reintroduced
    // here since this tier never threaded m.seqLevel through at all.
    const engineChosenOrder = allMembersConverted
      ? chooseOnFieldOrder(mems.map(m => ({ name: m.name, blocks: filterExclusiveModeBlocks(gateBlocksBySequence(BLOCKS_BY_CHARACTER[m.name], m.seqLevel)), rotation: CHARACTER_ROTATIONS[m.name] })), mainDps.name)
      : null;

    const rotationTimeline = (() => {
      // ── Smart rotation ordering based on WuWa swap mechanics ──
      // Rule 1: Main DPS goes LAST (receives all buffs in DPS window)
      // Rule 2: Characters with team-wide outro buffs go FIRST (persist through swaps)
      // Rule 3: Characters with next-only outro buffs go immediately BEFORE the DPS
      //         (next-only buffs vanish when recipient swaps out, so only the last one reaches DPS)
      // Rule 4: If multiple next-only buffers, the one with higher total value goes last (closer to DPS)
      const dpsChar = mems.find(m => m.name === mainDps.name);
      const supports = mems.filter(m => m.name !== mainDps.name);

      // Classify supports by outro buff type
      const hasTeamOutro = (m) => {
        const bt = CHAR_BUFF_TABLE[m.name];
        if (!bt) return false;
        // Team-wide outro buffs persist through swaps (Verina, Shorekeeper, Baizhi, Mornye)
        return (bt.outroBuffs || []).some(b => b.target === 'team');
      };
      const nextOutroValue = (m) => {
        const bt = CHAR_BUFF_TABLE[m.name];
        if (!bt) return 0;
        return (bt.outroBuffs || []).filter(b => b.target === 'next' || b.target === 'enemy' || b.target === 'ally').reduce((s, b) => s + b.value, 0);
      };

      // Sort: team-wide outro first, then by next-outro value ascending (strongest last = closest to DPS)
      // — this is the FALLBACK order (also the tie-break/first candidate below), not the final word.
      supports.sort((a, b) => {
        const aTeam = hasTeamOutro(a) ? 0 : 1;
        const bTeam = hasTeamOutro(b) ? 0 : 1;
        if (aTeam !== bTeam) return aTeam - bTeam; // team-wide outro goes first
        return nextOutroValue(a) - nextOutroValue(b); // stronger next-outro goes last (closer to DPS)
      });

      // ── Order search — referring to real buff/debuff durations, not just target-type heuristics ──
      // The sort above only classifies buffs by target ('team' vs 'next') and static value; it never
      // checks whether a buff's actual timed duration is long enough to survive the gap until the DPS
      // window actually opens. With supports.length <= 3 (this app's team size cap), brute-forcing
      // every permutation and scoring each by how much buff value-time from non-DPS members actually
      // lands inside the DPS's own on-field window (using each buff's real `duration` field from
      // CHAR_BUFF_TABLE/echo/weapon data — the same numbers the `inherits` badge below already reads)
      // is cheap (<=6 orderings) and gives a genuinely duration-grounded pick instead of a fixed rule.
      // This only reorders whole per-character blocks for DISPLAY (this closure runs after teamDps/
      // grandTotal are already final above) — it cannot change the real DPS number, only which
      // ordering the Rotation Guide presents as the swap sequence.
      function permutations(arr) {
        if (arr.length <= 1) return [arr];
        const out = [];
        for (let i = 0; i < arr.length; i++) {
          const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
          for (const p of permutations(rest)) out.push([arr[i], ...p]);
        }
        return out;
      }

      // Calculate raw on-field times, then scale proportionally if total exceeds rotTime — same for
      // every candidate order (durations don't depend on sequence), computed once up front.
      const onFieldOf = (m) => m.d.onField ?? (m.name === mainDps.name ? 15 : 5);
      const totalRaw = mems.reduce((s, m) => s + onFieldOf(m), 0);
      const scale = totalRaw > rotTime ? rotTime / totalRaw : 1;

      // Builds the timeline + buff list for one candidate ordering of [...supports, dpsChar].
      function buildForOrder(orderedMems) {
      const timeline = [];
      const buffs = [];
      let t = 0;
      orderedMems.forEach((m) => {
        const isMain = m.name === mainDps.name;
        const onField = Math.round(onFieldOf(m) * scale * 10) / 10; // scale + round to 0.1s
        timeline.push({ name: m.name, element: m.d.element, role: m.d.role, start: t, duration: onField });
        const bt = CHAR_BUFF_TABLE[m.name];
        if (bt) {
          (bt.outroBuffs || []).forEach(b => {
            if (b.target === 'next' || b.target === 'enemy' || b.target === 'ally') {
              const dur = b.duration || 14;
              buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t + onField, duration: dur });
            }
          });
          (bt.libBuffs || []).forEach(b => {
            if (b.target === 'team') {
              buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t, duration: b.duration || 25 });
            }
          });
          // CHAR_BUFF_TABLE uses duration: 99 or 999 as sentinels for "conditional passive, no
          // natural decay" (e.g. a Crit DMG bonus active in a stance, or on a periodic proc) — never
          // a literal 99/999-second timer. The real durations used anywhere in the table top out at
          // 30s, so >=90 is an unambiguous sentinel check. Rendered literally these blew the whole
          // chart's time scale out to ~100-1000s, squashing every real segment/buff into an
          // unreadable sliver. Since these are self-target and only matter while the character is
          // actually dealing damage, the correct display window is their own on-field time, same as
          // the default for an unspecified duration.
          //
          // Self-only clamp (fixed 2026-08-20): a selfBuff/weaponBuff's `target` field already says
          // who it can help — 'self' (or unset, same default calcEngine.js itself uses) means it
          // physically cannot outlive its owner's own on-field window, no matter what explicit
          // `duration` the source data carries (some run longer than the owner's own onField, e.g.
          // Qingxiao's 30s Mindlock DMG bonus vs. her 17s onField — real durations describing how
          // long the EFFECT would persist if she stayed on field, not a promise she stays that long
          // in THIS team's block). Before this fix, that longer duration bled into whatever teammate
          // came on-field right after, showing up as a false "inherits" badge for a buff that target:
          // 'self' says can never apply to them. Only a buff explicitly marked target: 'team' (a real,
          // if rare, case — e.g. Rover: Electro's Overshock ATK buff) is allowed to actually cross the
          // block boundary into the next segment.
          (bt.selfBuffs || []).forEach(b => {
            const isSelfOnly = !b.target || b.target === 'self';
            const rawDur = (!b.duration || b.duration >= 90) ? onField : b.duration;
            const dur = isSelfOnly ? Math.min(rawDur, onField) : rawDur;
            buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t, duration: dur });
          });
          (bt.weaponBuffs || []).forEach(b => {
            const isSelfOnly = !b.target || b.target === 'self';
            const rawDur = (!b.duration || b.duration >= 90) ? onField : b.duration;
            const dur = isSelfOnly ? Math.min(rawDur, onField) : rawDur;
            buffs.push({ source: m.name, stat: b.stat, value: b.value, start: t, duration: dur });
          });
        }

        // ── Hardcoded team-wide echo-set bonuses (TEAM_SET_BUFFS) — only counted in the DPS math
        // from non-main members' worn sets, so only render them from those same members here. ──
        if (!isMain) {
          (TEAM_SET_BUFFS[m.echoSetName] || []).forEach(e => {
            if (e.elem && e.elem !== (mainDps.d.element || '').toLowerCase()) return;
            buffs.push({ source: m.echoSetName, owner: m.name, stat: e.stat, value: e.value, start: 0, duration: rotTime });
          });
        }

        // ── Weapon "team value" (tv) passive — team-wide buff added straight to the stat
        // totals in the DPS math; render it the same way here so it isn't invisible. ──
        if (!isMain && m.weapon?.tv) {
          const tvRefLevel = (teamEquipment[teamIdx + ':' + m.name])?.refinement || 1;
          const tvRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[tvRefLevel - 1] || 1 : 1;
          const wt = m.weapon.tv;
          const tvDur = wt.duration || 15;
          Object.entries(wt).forEach(([stat, val]) => {
            if (stat === 'duration' || typeof val !== 'number') return;
            buffs.push({ source: m.weapName, owner: m.name, stat, value: Math.round(val * tvRefScale * 10) / 10, start: t, duration: tvDur });
          });
        }

        // ── Echo set p5 timed buffs ──
        if (m.echoSet) {
          const setName = m.echoSetName;
          const p5 = m.echoSet.p5 || '';
          const p5v = m.echoSet.p5val || {};
          // Outro-triggered echo set buffs (fire when character swaps out)
          if (p5.includes('Outro')) {
            Object.entries(p5v).forEach(([stat, val]) => {
              if (stat === 'outroDmg') return; // raw damage, not a buff
              buffs.push({ source: `${setName}`, owner: m.name, stat, value: val, start: t + onField, duration: 14 });
            });
          }
          // Intro-triggered echo set buffs (fire when character swaps in)
          else if (p5.includes('Intro')) {
            Object.entries(p5v).forEach(([stat, val]) => {
              buffs.push({ source: `${setName}`, owner: m.name, stat, value: val, start: t, duration: onField });
            });
          }
          // Liberation-triggered echo set buffs
          else if (p5.includes('Liberation') || p5.includes('Lib')) {
            Object.entries(p5v).forEach(([stat, val]) => {
              buffs.push({ source: `${setName}`, owner: m.name, stat, value: val, start: t, duration: 35 });
            });
          }
          // Heal-triggered team buffs
          else if (p5.includes('Heal') && p5v.teamAtk) {
            buffs.push({ source: `${setName}`, owner: m.name, stat: 'atkPct', value: p5v.teamAtk, start: t, duration: 20 });
          }
          // On-field stacking buffs (active during field time only)
          else if (p5.includes('max x') || p5.includes('stack')) {
            Object.entries(p5v).forEach(([stat, val]) => {
              buffs.push({ source: `${setName}`, owner: m.name, stat, value: val, start: t, duration: onField });
            });
          }
        }

        // ── Weapon passive timed buffs ──
        if (m.weapon?.pv) {
          const wpn = m.weapon;
          const passive = wpn.passive || '';
          // Weapons with on-hit/on-skill stacking buffs — active during field time
          if (passive.includes('stack') || passive.includes('grant') || passive.includes('use')) {
            Object.entries(wpn.pv).forEach(([stat, val]) => {
              buffs.push({ source: m.weapName, owner: m.name, stat, value: val, start: t, duration: onField });
            });
          }
        }

        // ── 4-cost echo active skill buffs ──
        // Gated to mirror exactly what the DPS math counts (see the two ECHO_SKILL_BUFFS
        // consumption sites above): a 'self' buff is only ever added to the stat totals for
        // the main DPS's own echo; 'team'/'next' buffs are only added from non-main members.
        // Rendering anything outside that would show a bar the DPS number never actually used.
        const esbCountedForMath = m.mainEchoName && (() => {
          const t = ECHO_SKILL_BUFFS[m.mainEchoName]?.target || 'self';
          return isMain ? t === 'self' : (t === 'team' || t === 'next');
        })();
        if (m.mainEchoName && esbCountedForMath) {
          const esb = ECHO_SKILL_BUFFS[m.mainEchoName];
          if (esb) {
            const echoLabel = m.mainEchoName.length > 18 ? m.mainEchoName.split(/[:\s-]+/).slice(0, 2).join(' ') : m.mainEchoName;
            const target = esb.target || 'self';
            if (target === 'next') {
              // Outro-triggered echo buff → fires when character swaps out, applies to next
              esb.buffs.forEach(b => {
                if (esb.condition && !m.name.includes(esb.condition)) return;
                buffs.push({ source: echoLabel, owner: m.name, stat: b.stat, value: b.value, start: t + onField, duration: esb.duration || 15, type: 'echo' });
              });
            } else if (target === 'team') {
              // Team-wide buff → active during field time, persists for duration
              esb.buffs.forEach(b => {
                if (esb.condition && !m.name.includes(esb.condition)) return;
                buffs.push({ source: echoLabel, owner: m.name, stat: b.stat, value: b.value, start: t, duration: esb.duration || 15, type: 'echo' });
              });
            } else if (esb.passive) {
              // Passive main-slot buff → always active during field time
              esb.buffs.forEach(b => {
                if (esb.condition && !m.name.includes(esb.condition)) return;
                buffs.push({ source: echoLabel, owner: m.name, stat: b.stat, value: b.value, start: t, duration: onField, type: 'echo' });
              });
            } else {
              // Standard active skill buff → used during field time
              esb.buffs.forEach(b => {
                if (esb.condition && !m.name.includes(esb.condition)) return;
                buffs.push({ source: echoLabel, owner: m.name, stat: b.stat, value: b.value, start: t, duration: Math.min(esb.duration || 15, onField + 5), type: 'echo' });
              });
            }
          }
        }

        t += onField;
      });
      return { timeline, buffs };
      }

      // PHASE3_PLAN.md Stage 4 step 4: when every member is converted, skip this whole legacy
      // permutation search — reuse the ALREADY-computed real engine order (chooseOnFieldOrder,
      // Stage 3 item 5) instead, so the Rotation Guide's displayed swap sequence matches the same
      // order the actual engine-composed teamDps (step 2) was computed against, not a second,
      // independently-derived guess. Falls back to the legacy search for a mixed team, unchanged.
      const engineOrderedMems = engineChosenOrder
        ? engineChosenOrder.order.map(name => mems.find(m => m.name === name)).filter(Boolean)
        : null;

      // Candidate orderings: every permutation of supports (dpsChar always last — Rule 1 is not up
      // for debate, only which support leads/trails is). Capped at 3! = 6 candidates since team size
      // maxes at 3 (≤2 supports); if that cap is ever raised, falls back to just the heuristic order
      // above rather than a factorial blowup.
      const candidateOrders = engineOrderedMems
        ? [engineOrderedMems]
        : (supports.length <= 3 ? permutations(supports) : [supports]).map(perm => dpsChar ? [...perm, dpsChar] : [...perm]);

      // Score = total buff value-time from non-DPS members that's actually still active (per its real
      // `duration`) when the DPS's own on-field window starts — i.e. how much of what this ordering
      // hands off actually reaches the damage dealer, not just "did we tag it 'next' vs 'team'".
      function scoreOrder(timeline, buffs) {
        const dpsSeg = timeline.find(s => s.name === mainDps.name);
        if (!dpsSeg) return 0;
        return buffs.reduce((sum, b) => {
          const owner = b.owner || b.source;
          if (owner === mainDps.name) return sum; // only cross-character handoffs count
          const stillActive = b.start <= dpsSeg.start + 0.05 && b.start + b.duration > dpsSeg.start + 0.05;
          return stillActive ? sum + Math.abs(b.value || 0) : sum;
        }, 0);
      }

      let best = null;
      candidateOrders.forEach((order, idx) => {
        const built = buildForOrder(order);
        const score = scoreOrder(built.timeline, built.buffs);
        // idx 0 is always the original heuristic order (permutations()'s first result preserves input
        // order) — strictly-greater comparison means ties keep that heuristic pick, so behavior is
        // unchanged whenever duration data doesn't actually favor a different sequence.
        if (!best || score > best.score) best = { ...built, score, order };
      });
      const { timeline, buffs } = best;

      // ── Rotation blocks — the source-style: one self-contained block per character (what THEY do
      // on field, independent of the rest of the team), plus what it hands off to / inherits from
      // its neighbors in the sequence, so the whole team rotation reads as a chain of blocks rather
      // than one flat, undifferentiated buff dump. One block per on-field window, in the order
      // actually computed above. ──
      const fmtBuff = (b) => `+${b.value}% ${STAT_LABELS_FULL[b.stat] || b.stat}${b.duration ? ` (${b.duration}s)` : ''}`;
      const steps = timeline.map((seg, i) => {
        const isDps = seg.name === mainDps.name;
        const reason = isDps
          ? 'Main DPS — comes on-field last to receive every buff stacked up before it'
          : hasTeamOutro(mems.find(m => m.name === seg.name))
            ? 'Team-wide buff persists through swaps — goes first so it covers the whole rotation'
            : nextOutroValue(mems.find(m => m.name === seg.name)) > 0
              ? 'Buff only reaches whoever swaps in next — placed right before the DPS window'
              : 'Sub-DPS / utility window';
        const own = buffs.filter(b => (b.owner || b.source) === seg.name);
        // Self: fires and is fully spent during this character's own on-field window (Liberation,
        // selfBuffs, weapon/echo passives while they're the one attacking).
        const selfActive = [...new Set(
          own.filter(b => b.start < seg.start + seg.duration - 0.05).map(fmtBuff)
        )];
        // Hands off: starts at/after they leave the field — this is the block's outbound link to
        // whichever block comes next (outro buffs, echo outro procs).
        const handsOff = [...new Set(
          own.filter(b => b.start >= seg.start + seg.duration - 0.05).map(fmtBuff)
        )];
        // Inherits: buffs from an earlier block still active when this one starts — the block's
        // inbound link, i.e. how it adapts to whatever the team set up before it.
        const inherits = [...new Set(
          buffs.filter(b => (b.owner || b.source) !== seg.name && b.start <= seg.start + 0.05 && b.start + b.duration > seg.start + 0.05)
            .map(fmtBuff)
        )];
        // Verified skill-by-skill sequence from the source.gg's "Standard Rotation" guides — real
        // combat data, not derived from CHAR_BUFF_TABLE like the rest of this block. CHARACTER_ROTATIONS
        // (type/skill/note per step, 56 of 58 characters) is the richer, actively-maintained dataset —
        // prefer it over the older CHARACTER_DATA[name].rotation plain-string array, which only exists
        // for ~10 legacy entries and lacks per-step notes/type tagging. Both are normalized to the same
        // {type, skill, note} shape so the rendering below doesn't need to know which source it got.
        const richSequence = CHARACTER_ROTATIONS[seg.name];
        const legacySequence = CHARACTER_DATA[seg.name]?.rotation;
        const skillSequence = richSequence || (legacySequence ? legacySequence.map(s => ({ type: 'Step', skill: s })) : null);
        return { order: i + 1, name: seg.name, role: seg.role, element: seg.element, duration: seg.duration, isDps, reason, selfActive, handsOff, inherits, skillSequence };
      });

      return { segments: timeline, buffs, totalTime: rotTime, steps };
    })();

    // ── Overlap-based uptime for cross-character buffs reaching the main DPS ──
    // Every cross-character buff uptime below used to be `min(1, duration / rotTime)` — averaged
    // against the WHOLE rotation, not against when the main DPS is actually on field receiving it.
    // rotationTimeline (just computed above) already has the real, ordered start/duration for every
    // member's block — the exact same positions the Rotation Guide displays — so the mechanically
    // correct fraction is how much of a buff's [start, start+duration) window actually overlaps the
    // DPS's own [dpsSeg.start, dpsSeg.start+dpsSeg.duration) window, not a share of the whole cycle.
    // A quantitative audit (200 random teams) found this matters a lot: 76.5% of cross-character
    // buffs shift by more than 2 uptime points under this correction, and 43.5% collapse to exactly
    // zero — buffs the old formula credited as partially helping the DPS, that in the app's own
    // computed rotation ordering never overlap the DPS's window at all.
    const rotSegByName = {};
    (rotationTimeline?.segments || []).forEach(s => { rotSegByName[s.name] = s; });
    const dpsSeg = rotSegByName[mainDps.name] || null;
    // General form — recipientSeg defaults to the main DPS, but the same fix applies to any other
    // team member receiving a cross-character buff (the sub-DPS damage tier below uses this with the
    // sub-DPS's own segment as recipient, since off-field members get a real segment here too).
    function overlapUptimeForSeg(recipientSeg, start, duration) {
      if (!recipientSeg || !(duration > 0)) return 0;
      const overlapStart = Math.max(start, recipientSeg.start);
      const overlapEnd = Math.min(start + duration, recipientSeg.start + recipientSeg.duration);
      const overlap = Math.max(0, overlapEnd - overlapStart);
      return recipientSeg.duration > 0 ? Math.min(1, overlap / recipientSeg.duration) : 0;
    }
    function overlapUptime(start, duration) {
      return overlapUptimeForSeg(dpsSeg, start, duration);
    }
    // Buff timing conventions — must mirror the rotationTimeline closure above exactly, since that's
    // the source of truth this correction reads positions from: Outro-triggered buffs start when the
    // owner swaps OUT (ownerSeg.start + ownerSeg.duration); Liberation/weapon/echo "team"-target buffs
    // start when the owner's own block begins (ownerSeg.start).
    const outroStart = (ownerName) => { const s = rotSegByName[ownerName]; return s ? s.start + s.duration : 0; };
    const blockStart = (ownerName) => { const s = rotSegByName[ownerName]; return s ? s.start : 0; };

    // ── Shield-gated weapon DEF Ignore ──
    // Thunderflare Dominion (Augusta signature, passive name "Thunderblaze Eminence") and Moongazer's
    // Sigil (Iuno signature, passive name "Plenilune Radiance") both encode their DEF Ignore stat as
    // "Gaining a Shield -> ... ignores 7.2% DEF (stacks x5)" — pv.defIgnore: 36 is that fully-stacked
    // MAXIMUM, pre-multiplied, same convention as every other "stacks x" weapon passive in this file.
    // But unlike a self-triggered stack (built from the wearer's own Basic ATK/Resonance Skill, always
    // reachable while they're attacking), gaining a Shield needs an actual shield source — either the
    // wearer's own kit (both weapons' signature owners, Augusta/Iuno, self-shield) or a teammate's.
    // Applying it unconditionally overcredits every OTHER wielder with 36% DEF Ignore they have no way
    // to trigger. Found via a diagnostic comparing this app's own engine against its static `bestWeapon`
    // data: it ranked Iuno's signature above Xiangli Yao's own signature for Xiangli Yao specifically
    // because of this exact unconditional 36% DEF Ignore, in a team with no shield source at all.
    const SHIELD_GATED_WEAPONS = new Set(['Thunderflare Dominion', "Moongazer's Sigil"]);
    const teamHasShield = mems.some(m => (CHARACTER_DATA[m.name]?.buffs || []).includes('Shield'));
    function gateWeaponDefIgnore(weaponName, rawDefIgnore) {
      if (!weaponName || !SHIELD_GATED_WEAPONS.has(weaponName)) return rawDefIgnore;
      return teamHasShield ? rawDefIgnore : 0;
    }

    // ── RAW TIER: equipment-only stats, no team buffs ──
    const rawMainOnField = Math.min(mainDps.d.onField || 15, rawRotTime * 0.8); // DPS gets at most 80% of rotation
    const rawOffFieldTime = Math.max(0, rawRotTime - rawMainOnField);
    // Proportional field time based on each sub-DPS's onField needs
    const subDpsMembers = mems.filter(m => m.name !== mainDps.name && (m.d.totalMult || 0) > 0);
    const totalSubNeed = subDpsMembers.reduce((s, m) => s + (m.d.onField || 5), 0) || 1;
    let rawTotalRotDmg = 0;
    // Captured here (RAW tier already builds this exact gear composition per member) and reused by
    // the FULL tier's own engine path below (PHASE3_PLAN.md Stage 4 step 2) instead of computing the
    // same weapon-pv/echo-set/echo-stat delta a second time — a member's base equipment contribution
    // doesn't depend on which tier is asking for it.
    const gearDeltaByName = {};
    mems.forEach(m => {
      let mult = m.d.totalMult || 0;
      if (mult === 0) return;
      // fieldMultFactor (0-1): how much of this member's FULL output actually lands within
      // rawRotTime, given field-time allocation / Coordinated ATK's coord-vs-onField blend. Kept
      // separate from `mult` (which also carries the legacy totalMult% for the fallback formula
      // below) so the engine path — a real per-second dps rate, not a totalMult% — can apply the
      // SAME discount without double-multiplying a percentage into it.
      let fieldMultFactor = 1;
      if (m.name !== mainDps.name) {
        const subOnField = m.d.onField || 5;
        const allocatedTime = rawOffFieldTime * (subOnField / totalSubNeed);
        const fieldRatio = Math.min(1, allocatedTime / subOnField);
        // Coordinated ATK chars deal off-field damage during main DPS field time
        const rawFocus = m.d.dmgFocus || [];
        const rawHasCoord = rawFocus.includes('Coordinated ATK');
        if (rawHasCoord) {
          const coordShare = rawFocus.length === 1 ? 0.8 : 0.5;
          const coordUptime = Math.min(1, rawMainOnField / rawRotTime);
          fieldMultFactor = coordinatedMultShare({ coordShare, coordUptime, fieldRatio });
        } else {
          fieldMultFactor = fieldRatio;
        }
        mult = mult * fieldMultFactor;
      }
      const sKey = m.scaling === 'HP' ? 'HP%' : m.scaling === 'DEF' ? 'DEF%' : 'ATK%';
      let rStatPct = 0, rCr = 5, rCd = 150, rElem = 0, rSkillDmg = 0;
      let rBasicDmg = 0, rHeavyDmg = 0, rLibDmg = 0, rEchoDmg = 0, rCoordDmg = 0;
      if (m.weapSubstat === 'Crit Rate') rCr += parseFloat(m.weapSubVal) || 0;
      if (m.weapSubstat === 'Crit DMG') rCd += parseFloat(m.weapSubVal) || 0;
      if (m.weapSubstat === sKey) rStatPct += parseFloat(m.weapSubVal) || 0;
      if (m.weapon) {
        const rRefLevel = (teamEquipment[teamIdx + ':' + m.name])?.refinement || 1;
        const rRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[rRefLevel - 1] || 1 : 1;
        const rawPv = m.weapon.pv || parsePassive(m.weapon.passive, m.d.element);
        const wp = Object.fromEntries(Object.entries(rawPv).map(([k, v]) => [k, typeof v === 'number' ? v * rRefScale : v]));
        if (m.scaling === 'ATK') rStatPct += (wp.atkPct || 0);
        else if (m.scaling === 'HP') rStatPct += (wp.hpPct || 0);
        else if (m.scaling === 'DEF') rStatPct += (wp.defPct || 0);
        rElem += (wp.elemDmg || 0); rSkillDmg += (wp.skillDmg || 0);
        rCr += (wp.critRate || 0); rCd += (wp.critDmg || 0);
        rBasicDmg += (wp.basicDmg || 0); rHeavyDmg += (wp.heavyDmg || 0);
        rLibDmg += (wp.libDmg || 0); rEchoDmg += (wp.echoDmg || 0);
        rCoordDmg += (wp.coordDmg || 0);
      }
      // Apply echo set + echo stats using shared utility (was 50 lines of duplicated logic)
      const rStats = { atkPct: rStatPct, cr: rCr, cd: rCd, elemDmg: rElem, skillDmg: rSkillDmg, basicDmg: rBasicDmg, heavyDmg: rHeavyDmg, libDmg: rLibDmg, echoDmg: rEchoDmg, coordDmg: rCoordDmg, deepen: 0, amplify: 0, defShred: 0, resShred: 0, defIgnore: 0 };
      applyFullEchoSet(rStats, m.echoSet, m.echoSet2, m.d.element, m.scaling);
      const eqKey = teamIdx + ':' + m.name;
      applyEchoStats(rStats, teamEquipment[eqKey]?.echoes, m.d.element, m.scaling, { atk: m.totalBaseAtk, hp: m.d.baseHp, def: m.d.baseDef });
      if (m.d.element && elCounts[m.d.element] >= 2) rStats.elemDmg += 10;

      // PHASE3_PLAN.md Stage 4 step 1: a converted member (real TriggerBlocks + real
      // CHARACTER_ROTATIONS) gets REAL per-hit composed damage instead of the flat totalMult%
      // formula below — resolveHitComposedDps already reads basicDmg/heavyDmg/libDmg/echoDmg/coordDmg
      // per-hit by their own real category (see its own EXTERNAL_STAT_KEYS), so `rStats` is handed
      // over BEFORE routeTypeBonuses flattens those into a single skillDmg bucket — that flattening
      // is a legacy-only approximation the engine doesn't need. Falls back to the legacy formula
      // for any not-yet-converted character (currently just Jingran, unreleased) so an incomplete
      // roster never breaks a team containing one.
      const blocks = BLOCKS_BY_CHARACTER[m.name];
      const rotation = CHARACTER_ROTATIONS[m.name];
      if (blocks && rotation) {
        const gearDelta = { ...rStats, cr: rStats.cr - BASE_CRIT_RATE, cd: rStats.cd - BASE_CRIT_DMG };
        gearDeltaByName[m.name] = gearDelta;
        const baseStats = { atk: m.totalBaseAtk, hp: m.d.baseHp || 0, def: m.d.baseDef || 0 };
        const steps = deriveStepsFromRotation(rotation, blocks);
        const enemyContext = { enemyDef: enemyDef90, enemyRes: getEnemyRes(m.d.element) };
        const { totalDamage, totalTime } = resolveHitComposedDps(
          blocks, steps, enemyContext, baseStats, (m.d.element || '').toLowerCase(), m.d.role,
          gearDelta, m.seqLevel, null, true, // sequence: m.seqLevel, libUptime: none at RAW tier (matches legacy, which never gates RAW), cooldownSteadyState: true
        );
        const memberDps = totalTime > 0 ? totalDamage / totalTime : 0;
        // fieldMultFactor (0-1, computed above) applies the same field-time/coord discount as the
        // legacy formula — then re-scale the per-second rate back up to rawRotTime's shared
        // denominator (rawTotalRotDmg accumulates a TOTAL across rawRotTime, not a rate, summed
        // across every member before a single division at the end).
        rawTotalRotDmg += memberDps * fieldMultFactor * rawRotTime;
        return;
      }

      routeTypeBonuses(rStats, m.d.dmgFocus || []);
      const rEff = m.baseStat * (1 + rStats.atkPct / 100);
      const rAvgCrit = calcAvgCrit(rStats.cr, rStats.cd);
      const rDmgBonus = 1 + (rStats.elemDmg + rStats.skillDmg) / 100;
      const rDefMult = ATTACKER_FACTOR / (ATTACKER_FACTOR + enemyDef90);
      const rResMult = calcResMult(getEnemyRes(m.d.element), 0);
      rawTotalRotDmg += rEff * (mult / 100) * rAvgCrit * rDmgBonus * rDefMult * rResMult;
    });

    // ── FULL TIER: Base stats with team buffs ──
    // PHASE3_PLAN.md Stage 4 step 6 cleanup: atkPct/cr/cd/elemDmg/skillDmg/deepen/defShred/resShred/
    // defIgnore/amplify (declared here with their legacy baseline defaults) and dpsFocus/
    // seqTotalMultBonus (read outside this block — dpsFocus by the pre-existing, already-dead `syn`
    // scoring section a few hundred lines down that never actually gets returned; seqTotalMultBonus
    // by the sub-DPS loop's own separately-gated legacy block below) are hoisted OUTSIDE the
    // `!allMembersConverted` gate below so both legacy blocks (and any code between them) can still
    // see them, while the actual buff-accumulation WORK stays gated — the whole point of this
    // cleanup pass.
    let atkPct = 0, cr = 5, cd = 150, elemDmg = 0, skillDmg = 0, deepen = 0, defShred = 0, resShred = 0, defIgnore = 0;
    let amplify = 0; // WuWa DMG Amplification layer — separate from DMG Bonus, multiplicative
    const dpsFocus = mainDps.d.dmgFocus || [];
    let seqTotalMultBonus = 0;

    // PHASE3_PLAN.md Stage 4 step 6 cleanup: this whole legacy main-DPS buff-accumulation
    // computation (weapon/echo/resonance-chain/cross-character outro-lib-debuff routing) is now
    // SKIPPED ENTIRELY for a fully-converted team — every variable it feeds
    // (atkPct/cr/cd/elemDmg/skillDmg/deepen/defShred/resShred/defIgnore/amplify, and in turn
    // effAtk/avgCrit/dmgBonus/defMult/resMult/score) is unconditionally overridden by the
    // engine-composed block below (Stage 4 step 6's own `resolveSimulatedTeamRotation` call)
    // regardless, so computing it first was pure wasted work once that override landed. Kept as the
    // exact, unmodified fallback for a mixed team (currently only Jingran, unreleased).
    if (!allMembersConverted) {
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
    }

    let effAtk = Math.round(mainDps.baseStat * (1 + atkPct / 100));
    let avgCrit = calcAvgCrit(cr, cd);
    let dmgBonus = calcDmgBonus(elemDmg, skillDmg, amplify, deepen);
    let defMult = calcDefMult(enemyDef90, defShred, defIgnore);
    const mainBaseRes = getEnemyRes(mainDps.d.element);
    let resMult = calcResMult(mainBaseRes, resShred);
    let score = Math.round(effAtk * avgCrit * dmgBonus * defMult * resMult);

    // PHASE3_PLAN.md Stage 4 step 6: the main-DPS stat-panel fields above (effAtk/avgCrit/dmgBonus/
    // defMult/resMult/score, plus the underlying cr/cd/elemDmg/skillDmg/amplify/deepen/atkPct/
    // defShred/resShred/defIgnore returned at the bottom of this function) still came from the
    // legacy buff-accumulation computation even for a fully-converted team — steps 1-3 only
    // overrode totalRotDmg/memberDmgArr/dotDmgPerRotation, not these. Closing that gap here: for a
    // fully-converted team, resolveSimulatedTeamRotation gives the main DPS's own REAL time-averaged
    // received stats (real buff windows overlapping their own real on-field segment, from the same
    // engineChosenOrder used everywhere else in this rewrite) instead of the legacy overlapUptimeForSeg
    // hand-rolled routing. Combined with their own gear delta (already computed in step 1's
    // gearDeltaByName) the same way externalStats folds into the engine everywhere else, then
    // routeTypeBonuses (the SAME function the legacy path already used) collapses basicDmg/heavyDmg/
    // libDmg/echoDmg/coordDmg into the single skillDmg bucket calcDmgBonus expects for this
    // one-number-per-stat summary panel — a deliberately different (less precise) representation
    // than the per-hit engine composition steps 1-3 use, appropriate for a stat *summary*, not a
    // per-hit total.
    if (allMembersConverted && engineChosenOrder) {
      const { ownedSteps, blocksByOwner } = engineChosenOrder;
      const { stats: mainReceived, totalMultBonus: mainTotalMultBonus } = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, mainDps.name, {
        targetElementLower: (mainDps.d.element || '').toLowerCase(),
        targetRole: mainDps.d.role,
        sequenceByOwner: Object.fromEntries(mems.map(m => [m.name, m.seqLevel])),
      });
      const mainGearDelta = gearDeltaByName[mainDps.name] || {};
      const EXTERNAL_STAT_KEYS = ['atkPct', 'cr', 'cd', 'elemDmg', 'skillDmg', 'basicDmg', 'heavyDmg', 'libDmg', 'echoDmg', 'coordDmg', 'deepen', 'amplify', 'defShred', 'resShred', 'defIgnore'];
      const finalStats = { ...mainReceived };
      for (const k of EXTERNAL_STAT_KEYS) { if (mainGearDelta[k]) finalStats[k] = (finalStats[k] || 0) + mainGearDelta[k]; }
      routeTypeBonuses(finalStats, mainDps.d.dmgFocus || []);

      atkPct = finalStats.atkPct; cr = finalStats.cr; cd = finalStats.cd; elemDmg = finalStats.elemDmg;
      skillDmg = finalStats.skillDmg; amplify = finalStats.amplify; deepen = finalStats.deepen;
      defShred = finalStats.defShred; resShred = finalStats.resShred; defIgnore = finalStats.defIgnore;

      effAtk = Math.round(mainDps.baseStat * (1 + atkPct / 100));
      avgCrit = calcAvgCrit(cr, cd);
      dmgBonus = calcDmgBonus(elemDmg, skillDmg, amplify, deepen);
      defMult = calcDefMult(enemyDef90, defShred, defIgnore);
      resMult = calcResMult(mainBaseRes, resShred);
      // `mainTotalMultBonus` (fixed 2026-09-02, the engine-merge history (git log) totalMult architecture-bug fix):
      // resolveSimulatedTeamRotation() already computed this real accumulator, but this caller
      // previously discarded it entirely (only ever destructured `stats`) — silently dropping every
      // `stat:'totalMult'` TriggerBlock's contribution to the FULL-tier stat-panel score for every
      // fully-converted team. Applied the same way legacy's own `seqTotalMultBonus` is applied to
      // `mult` in the `!allMembersConverted` branch above: a separate multiplicative factor.
      score = Math.round(effAtk * avgCrit * dmgBonus * defMult * resMult * (1 + mainTotalMultBonus / 100));
    }

    // ── DOT damage (ICD-aware, composed via engine/dotReactions.js — PHASE3_PLAN.md Stage 3 item 2 /
    // Stage 4 step 3) ──
    // Each of these reactions has a fixed damage element regardless of which character on the team
    // triggers it (Frazzle is always Spectro, Erosion always Havoc, etc.) — so its RES must come from
    // the enemy's RES to THAT element, not resMult above (which is keyed to mainDps's own element and
    // was wrong here whenever the team's element differs from the reaction's, e.g. a Glacio main DPS
    // whose support triggers Havoc Erosion). Tune Break has no single canonical element (bespoke
    // per-character mechanic), so it keeps using mainDps's resMult — resolveDotReactionDps's own
    // `mainResMult` param, matching its jsdoc's documented Stage 0 fallback exactly. Pure plumbing
    // swap versus calling calcFrazzleDmg/calcErosionDmg/etc. individually — same underlying
    // calcEngine.js functions, same rotTime/defMult/resShred inputs, byte-identical output; the actual
    // engine-vs-legacy `rotTime` reconciliation stays step 4's job (rotationTimeline itself), not this
    // one — DOT keeps using the same shared `rotTime` every other FULL-tier total already does.
    const dotResult = resolveDotReactionDps(mems, rotTime, defMult, resShred, getEnemyRes, resMult, energyCycleFactors, engineChosenOrder?.blocksByOwner || null);
    let dotDmgPerRotation = dotResult.totalDmg;
    const hasFrazzle = dotResult.breakdown.frazzle.active;
    const hasErosion = dotResult.breakdown.erosion.active;
    const hasFusionBurst = dotResult.breakdown.fusionBurst.active;
    const hasElectroFlare = dotResult.breakdown.electroFlare.active;
    let tuneBreakDeepenMult = dotResult.tuneBreakDeepenMult;
    // Resolved once grandTotal is known below (the engine-architecture history (git log) item 9's mode-exclusivity fix) —
    // exposed on the return value mainly so tests/other consumers can see which mode(s) were assumed.
    let tuneBreakResolvedStances = [];

    let totalRotDmg = 0;
    const memberDmgArr = [];
    // PHASE3_PLAN.md Stage 4 step 6 cleanup: this whole legacy per-member damage loop (flat
    // totalMult%-plus-hand-written-buff-routing) is now SKIPPED ENTIRELY for a fully-converted team —
    // its only outputs, totalRotDmg/memberDmgArr, are unconditionally overridden by the engine-composed
    // block right below (Stage 4 step 2) regardless, so computing it first was pure wasted work once
    // that override landed. Kept as the exact, unmodified fallback for a mixed team (currently only
    // Jingran, unreleased, lacks a converted TriggerBlocks file).
    if (!allMembersConverted) {
    const mainOnField = Math.min(mainDps.d.onField || 15, rotTime * 0.8);
    const offFieldTime = Math.max(0, rotTime - mainOnField);
    // Proportional field time allocation based on each sub-DPS's actual needs
    const fullSubDpsMembers = mems.filter(m => m.name !== mainDps.name && (m.d.totalMult || 0) > 0);
    const fullTotalSubNeed = fullSubDpsMembers.reduce((s, m) => s + (m.d.onField || 5), 0) || 1;
    mems.forEach(m => {
      let mult = m.d.totalMult || 0;
      if (mult === 0) { memberDmgArr.push({ name: m.name, dmg: 0 }); return; }
      const mBase = m.baseStat;
      const isMain = m.name === mainDps.name;
      // Apply energy cycle factor: if Liberation can't be cast every rotation, reduce mult
      const ecf = energyCycleFactors[m.name];
      if (ecf && ecf.libUptime < 1) {
        // Liberation typically accounts for 20-40% of totalMult. Reduce that portion by uptime.
        const libShare = (m.d.dmgFocus || []).includes('Liberation') ? 0.35 : 0.2;
        mult = mult * (1 - libShare * (1 - ecf.libUptime));
      }
      if (isMain && seqTotalMultBonus > 0) mult = mult * (1 + seqTotalMultBonus / 100);
      if (!isMain) {
        const subOnField = m.d.onField || 5;
        const allocatedTime = offFieldTime * (subOnField / fullTotalSubNeed);
        const fieldRatio = Math.min(1, allocatedTime / subOnField);
        // Coordinated ATK characters deal off-field damage during main DPS's field time.
        // Their coordinated portion should scale with main DPS uptime, not their own field time.
        const focus = m.d.dmgFocus || [];
        const hasCoord = focus.includes('Coordinated ATK');
        if (hasCoord) {
          // Split damage: coordinated portion (60-80%) scales with DPS uptime, on-field portion scales with field ratio
          const coordShare = focus.length === 1 ? 0.8 : 0.5; // Pure coord chars vs hybrid
          const coordUptime = Math.min(1, mainOnField / rotTime); // Active during DPS field time
          const onFieldShare = 1 - coordShare;
          mult = mult * (coordShare * coordUptime + onFieldShare * fieldRatio);
        } else {
          mult = mult * fieldRatio;
        }
      }
      if (isMain && m.weapon?.pv?.atkSpeed) {
        const mainRefLevel = (teamEquipment[teamIdx + ':' + m.name])?.refinement || 1;
        const mainRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[mainRefLevel - 1] || 1 : 1;
        mult = mult * (1 + (m.weapon.pv.atkSpeed * mainRefScale) / 100);
      }
      if (isMain) {
        const mDmg = mBase * (1 + atkPct / 100) * (mult / 100) * avgCrit * dmgBonus * defMult * resMult;
        totalRotDmg += mDmg;
        memberDmgArr.push({ name: m.name, dmg: mDmg });
      } else {
        const sEqKey = teamIdx + ':' + m.name;
        const sEq = teamEquipment[sEqKey];
        const sEchoes = sEq?.echoes || [];
        const sEl = (m.d.element || '').toLowerCase();
        const sElDmgKey = sEl ? sEl.charAt(0).toUpperCase() + sEl.slice(1) + ' DMG' : '';
        const sStatKey = m.scaling === 'HP' ? 'HP%' : m.scaling === 'DEF' ? 'DEF%' : 'ATK%';
        let sAtkPct = 0, sCr = 5, sCd = 150, sElem = 0, sSkillDmg = 0, sDeepen = 0, sAmplify = 0;
        let sBasicDmg = 0, sHeavyDmg = 0, sLibDmg = 0, sEchoDmg = 0, sCoordDmg = 0, sDefIgnore = 0;
        let sDefShred = 0, sResShred = 0;
        const sSeg = rotSegByName[m.name] || null;
        // An unbuilt sub-DPS (no echoes equipped) gets no fabricated "recommended build" stats here —
        // a real player with empty echo slots has zero bonus stats, same as an unequipped Main DPS
        // already correctly shows. A previous version injected a hardcoded preset stat block (e.g.
        // +66% ATK, +22.5% Crit Rate) to preview a "likely" build, but that meant an unbuilt sub-DPS
        // was scored as if near-BiS-geared while an unbuilt Main DPS was scored as bare — inconsistent
        // across roles and not representative of what the player actually has equipped.
        // Coordinated ATK characters snapshot buffs at swap-out time.
        // They benefit from buffs that exist BEFORE they swap out (team-wide Lib buffs,
        // earlier outro buffs), but NOT from outro buffs applied AFTER them in rotation order.
        // On-field sub-DPS characters receive all buffs normally.
        const focus = m.d.dmgFocus || [];
        const isOffField = focus.includes('Coordinated ATK') && focus.length <= 2;
        // Same applyBuff bridge pattern as the main-DPS tier above -- consolidates this sub-DPS's own
        // 4 near-identical chains (outroBuffs/libBuffs/debuffs-from-others/own selfBuffs+debuffs) onto
        // the one shared, gated implementation instead of each carrying its own copy. Note this block
        // deliberately does NOT pass dpsFocus to the outroBuffs applyBuff calls below: unlike the main
        // DPS tier, this sub-DPS path never gated basicDmg/heavyDmg/libDmg/echoDmg/skillDmg by dmgFocus
        // here (they all route into sAmplify unconditionally) -- preserved as-is as a pure dedup, not
        // changed, since that's a separate question from the deepen/allDmg/elemDmg bug this migration
        // targets.
        const subElLower = (m.d.element || '').toLowerCase();
        const sStats = { atkPct: sAtkPct, cr: sCr, cd: sCd, elemDmg: sElem, deepen: sDeepen, amplify: sAmplify, echoDmg: sEchoDmg, defShred: sDefShred, resShred: sResShred, defIgnore: sDefIgnore };
        mems.forEach(other => {
          if (other.name === m.name) return;
          const obt = CHAR_BUFF_TABLE[other.name];
          if (!obt) return;
          (obt.outroBuffs || []).forEach(b => {
            if (b.target === 'next' || b.target === 'enemy' || b.target === 'ally') {
              // Snapshot rule: off-field chars only get outro buffs from characters who swap BEFORE them.
              // In typical rotation, supports swap before sub-DPS. The DPS-adjacent outro buff
              // (the last support before DPS) does NOT reach the off-field sub-DPS who already left.
              // Approximate: off-field chars get 60% effective value from outro buffs (snapshot discount).
              const snapshotFactor = isOffField ? 0.6 : 1.0;
              const uptime = overlapUptimeForSeg(sSeg, outroStart(other.name), b.duration || 14);
              const val = b.value * uptime * snapshotFactor;
              if (b.stat === 'atkPct') {
                sStats.atkPct += m.scaling === 'ATK' ? val : val * 0.25;
              } else if (['allDmg', 'elemDmg', 'basicDmg', 'heavyDmg', 'libDmg', 'echoDmg', 'skillDmg'].includes(b.stat)) {
                // Type-focus gate (dpsFocus) was missing here even though the main-DPS tier enforces it
                // (routeTypeBonuses' own gate, mirrored by applyBuff's TYPE_FOCUS_MAP) -- a real support
                // with a type-specific outro (Iuno's 50% Heavy ATK Amp, Lucy's Basic ATK Amp, Qiuyuan's
                // Echo Amp, etc., 14 characters carry one) applied its full value to ANY sub-DPS
                // regardless of whether that sub-DPS's own dmgFocus includes that attack type at all.
                applyBuff(sStats, b.stat, val, { isAmplify: true, condition: b.condition, dpsFocus: focus, dpsElLower: subElLower, dpsName: m.name });
              } else if (b.stat === 'deepen') {
                applyBuff(sStats, 'deepen', val, { condition: b.condition, dpsElLower: subElLower, dpsName: m.name });
              } else if (b.stat === 'critRate' || b.stat === 'critDmg' || b.stat === 'resShred' || b.stat === 'defShred') {
                applyBuff(sStats, b.stat, val);
              }
            }
          });
          // Sonata set p5 team/next ATK% buffs (see the same fix on the main-tier computation above).
          const oP5v = other.echoSet?.p5val;
          if (oP5v?.teamAtk) {
            const uptime = overlapUptimeForSeg(sSeg, blockStart(other.name), 20);
            const val = oP5v.teamAtk * uptime * (isOffField ? 0.6 : 1.0);
            sStats.atkPct += m.scaling === 'ATK' ? val : val * 0.25;
          }
          if (oP5v?.nextAtk) {
            const uptime = overlapUptimeForSeg(sSeg, outroStart(other.name), 14);
            const val = oP5v.nextAtk * uptime * (isOffField ? 0.6 : 1.0);
            sStats.atkPct += m.scaling === 'ATK' ? val : val * 0.25;
          }
          (obt.libBuffs || []).forEach(b => {
            if (b.target === 'team' || b.target === 'next') {
              const uptime = overlapUptimeForSeg(sSeg, blockStart(other.name), b.duration || 25);
              const val = b.value * uptime;
              if (b.stat === 'atkPct') { sStats.atkPct += m.scaling === 'ATK' ? val : val * 0.25; }
              else if (b.stat === 'allDmg' || b.stat === 'elemDmg') applyBuff(sStats, b.stat, val, { condition: b.condition, dpsElLower: subElLower, dpsName: m.name });
              else if (b.stat === 'critRate' || b.stat === 'critDmg' || b.stat === 'echoDmg') applyBuff(sStats, b.stat, val);
            }
          });
          (obt.debuffs || []).forEach(db => {
            if (db.stat === 'havocBane') { sStats.defShred += db.value * 2; return; }
            applyBuff(sStats, db.stat, db.value, { condition: db.condition, dpsElLower: subElLower, dpsName: m.name });
          });
        });
        const mbt = CHAR_BUFF_TABLE[m.name];
        if (mbt) {
          const subTotalER = energyCycleFactors?.[m.name]?.totalER;
          (mbt.selfBuffs || []).forEach(b => {
            const val = resolveBuffValue(b, subTotalER);
            // Own kit's self-target buffs — no target-matching gate needed, same as the main tier.
            if (['atkPct', 'elemDmg', 'critRate', 'critDmg', 'defIgnore', 'deepen', 'echoDmg'].includes(b.stat)) applyBuff(sStats, b.stat, val);
          });
          (mbt.debuffs || []).forEach(db => {
            applyBuff(sStats, db.stat, db.value, { condition: db.condition, dpsElLower: subElLower, dpsName: m.name });
          });
        }
        ({ atkPct: sAtkPct, cr: sCr, cd: sCd, elemDmg: sElem, deepen: sDeepen, amplify: sAmplify, echoDmg: sEchoDmg, defShred: sDefShred, resShred: sResShred, defIgnore: sDefIgnore } = sStats);
        if (m.weapon) {
          const subRefLevel = sEq?.refinement || 1;
          const subRefScale = WEAPON_REFINE_SCALE ? WEAPON_REFINE_SCALE[subRefLevel - 1] || 1 : 1;
          const subRawPv = m.weapon.pv || parsePassive(m.weapon.passive, m.d.element);
          const swp = Object.fromEntries(Object.entries(subRawPv).map(([k, v]) => [k, typeof v === 'number' ? v * subRefScale : v]));
          if (m.scaling === 'ATK') sAtkPct += (swp.atkPct || 0);
          else if (m.scaling === 'HP') sAtkPct += (swp.hpPct || 0);
          else if (m.scaling === 'DEF') sAtkPct += (swp.defPct || 0);
          sElem += (swp.elemDmg || 0); sSkillDmg += (swp.skillDmg || 0);
          sCr += (swp.critRate || 0); sCd += (swp.critDmg || 0);
          sBasicDmg += (swp.basicDmg || 0); sHeavyDmg += (swp.heavyDmg || 0);
          sLibDmg += (swp.libDmg || 0); sEchoDmg += (swp.echoDmg || 0);
          sCoordDmg += (swp.coordDmg || 0);
          sDefIgnore += gateWeaponDefIgnore(m.weapName, swp.defIgnore || 0); sResShred += (swp.resShred || 0);
        }
        // Apply sub-DPS echo set + echo stats (using shared utility)
        {
          const subSetStats = createStats();
          applyFullEchoSet(subSetStats, m.echoSet, m.echoSet2, m.d.element, m.scaling);
          applyEchoStats(subSetStats, sEchoes, m.d.element, m.scaling, { atk: m.totalBaseAtk, hp: m.d.baseHp, def: m.d.baseDef });
          // Sonata set p5 team ATK% (Rejuvenating Glow/Halo of Starry Radiance) applies to the wearer
          // too, not just teammates — applyFullEchoSet doesn't know this key (see calcEngine.js), and
          // the cross-member loop above explicitly skips self, so it must be added here.
          if (m.echoSet?.p5val?.teamAtk) sAtkPct += m.scaling === 'ATK' ? m.echoSet.p5val.teamAtk : m.echoSet.p5val.teamAtk * 0.25;
          sAtkPct += subSetStats.atkPct; sCr += subSetStats.cr - BASE_CRIT_RATE; sCd += subSetStats.cd - BASE_CRIT_DMG;
          sElem += subSetStats.elemDmg; sSkillDmg += subSetStats.skillDmg;
          sBasicDmg += subSetStats.basicDmg; sHeavyDmg += subSetStats.heavyDmg;
          sLibDmg += subSetStats.libDmg; sEchoDmg += subSetStats.echoDmg;
        }
        if (m.d.element && elCounts[m.d.element] >= 2) sElem += 10;
        if (m.weapSubstat === 'Crit Rate') sCr += parseFloat(m.weapSubVal) || 0;
        if (m.weapSubstat === 'Crit DMG') sCd += parseFloat(m.weapSubVal) || 0;
        if (m.weapSubstat === sStatKey) sAtkPct += parseFloat(m.weapSubVal) || 0;
        const sEffAtk = mBase * (1 + sAtkPct / 100);
        const sAvgCrit = 1 + (Math.min(sCr, 100) / 100) * (sCd / 100 - 1);
        const sFocus = m.d.dmgFocus || [];
        // Same dmgFocus gate as the main DPS fix above (routeTypeBonuses) — a sub-DPS without
        // 'Skill' in their own focus shouldn't get full credit for a literal Resonance Skill DMG%
        // contribution (weapon passive, echo set) as if it always applies to their damage.
        let sTypeDmg = sFocus.includes('Skill') ? sSkillDmg : 0;
        if (sFocus.includes('Basic ATK')) sTypeDmg += sBasicDmg;
        if (sFocus.includes('Heavy ATK')) sTypeDmg += sHeavyDmg;
        if (sFocus.includes('Liberation')) sTypeDmg += sLibDmg;
        if (sFocus.includes('Echo')) sTypeDmg += sEchoDmg;
        if (sFocus.includes('Coordinated ATK')) sTypeDmg += sCoordDmg;
        const sDmgBonus = (1 + (sElem + sTypeDmg) / 100) * (1 + sAmplify / 100) * (1 + sDeepen / 100);
        const sReducedDef = enemyDef90 * Math.max(0, 1 - sDefShred / 100);
        const sEffDef = sReducedDef * Math.max(0, 1 - sDefIgnore / 100);
        const sDefMult = Math.min(2, ATTACKER_FACTOR / (ATTACKER_FACTOR + sEffDef));
        const sBaseRes = getEnemyRes(m.d.element);
        const sResMult = calcResMult(sBaseRes, sResShred);
        const sDmg = sEffAtk * (mult / 100) * sAvgCrit * sDmgBonus * sDefMult * sResMult;
        totalRotDmg += sDmg;
        memberDmgArr.push({ name: m.name, dmg: sDmg });
      }
    });
    }

    // PHASE3_PLAN.md Stage 4 step 2: when EVERY team member has a converted TriggerBlocks file +
    // real CHARACTER_ROTATIONS, override totalRotDmg/memberDmgArr with real engine-composed team
    // damage instead of the flat totalMult%-plus-hand-written-buff-routing computation above — which,
    // per step 6's own cleanup pass, is now itself gated behind `!allMembersConverted` and genuinely
    // SKIPPED for a fully-converted team, not just computed-and-discarded. Still the exact, unmodified
    // fallback for a mixed team (currently only Jingran, unreleased).
    // `engineChosenOrder` (computed once, near the top of this function, right before
    // rotationTimeline — Stage 4 step 4 also reuses it for rotationTimeline's own displayed order,
    // so both agree on the same real on-field sequence instead of two independently-derived guesses).
    //
    // Each member's own `dps` (resolveHitComposedTeamDps's real damage / their own real on-field
    // segment duration, itself derived from real CHARACTER_ROTATIONS timing, not a proportional
    // field-time fudge) is re-scaled to `rotTime`'s shared denominator the same way Step 1 did for
    // the RAW tier — NOT also multiplied by the legacy coordShare/fieldRatio discount, since the
    // engine's own real per-member segment (via chooseOnFieldOrder + coordSnapshotDiscount) already
    // replaces that heuristic with something more precise; applying both would double-discount.
    if (allMembersConverted) {
      const chosenOrder = engineChosenOrder;
      if (chosenOrder) {
        const { ownedSteps, blocksByOwner } = chosenOrder;
        let engineTotalRotDmg = 0;
        const engineMemberDmgArr = [];
        mems.forEach(m => {
          if ((m.d.totalMult || 0) === 0) { engineMemberDmgArr.push({ name: m.name, dmg: 0 }); return; }
          const focus = m.d.dmgFocus || [];
          const isOffFieldCoord = m.name !== mainDps.name && focus.includes('Coordinated ATK') && focus.length <= 2;
          const ecf = energyCycleFactors[m.name];
          const baseStats = { atk: m.totalBaseAtk, hp: m.d.baseHp || 0, def: m.d.baseDef || 0 };
          const enemyContext = { enemyDef: enemyDef90, enemyRes: getEnemyRes(m.d.element) };
          const { dps: memberEngineDps } = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, m.name, enemyContext, baseStats, {
            targetElementLower: (m.d.element || '').toLowerCase(),
            targetRole: m.d.role,
            libUptime: ecf ? ecf.libUptime : null,
            coordSnapshotDiscount: isOffFieldCoord,
            cooldownSteadyState: true,
            externalStats: gearDeltaByName[m.name],
          });
          const dmg = memberEngineDps * rotTime;
          engineTotalRotDmg += dmg;
          engineMemberDmgArr.push({ name: m.name, dmg });
        });
        totalRotDmg = engineTotalRotDmg;
        memberDmgArr.length = 0;
        memberDmgArr.push(...engineMemberDmgArr);
      }
    }

    // ── Per-member damage with type breakdown ──
    const memberDmg = memberDmgArr.map(m => {
      const mem = mems.find(mm => mm.name === m.name);
      const isMain = m.name === mainDps.name;
      const focus = mem?.d?.dmgFocus || [];
      const hasCoord = focus.includes('Coordinated ATK');
      return {
        name: m.name,
        skillDmg: m.dmg,           // On-field / off-field skill rotation damage
        echoDmg: 0,                // Echo active skill damage (filled below)
        dotDmg: 0,                 // DOT contribution (filled below)
        total: m.dmg,
        isOnField: isMain || (!hasCoord && (mem?.d?.onField || 0) > 3),
        isCoord: hasCoord,
      };
    });

    // ── Echo active skill damage — integrated into rotation (not separate tier) ──
    let echoActiveDmg = 0;
    mems.forEach(m => {
      const eqKey = teamIdx + ':' + m.name;
      const eq = teamEquipment[eqKey];
      const echoes = eq?.echoes || [];
      if (echoes[0]?.name) {
        const echoInfo = ECHO_DATA[echoes[0].name];
        const echoDmgPct = echoInfo?.dmg || 0;
        if (echoDmgPct > 0) {
          const echoEl = echoInfo?.element || m.d.element;
          const echoBase = m.scaling === 'ATK' ? m.totalBaseAtk : m.baseStat * 0.25;
          const echoResRate = getEnemyRes(echoEl);
          const echoResMult = calcResMult(echoResRate, resShred);
          let echoSkillBonus = 0;
          if (m.echoSet) {
            if (m.echoSet.p3val) {
              if (m.echoSet.p3val.echoDmg) echoSkillBonus += m.echoSet.p3val.echoDmg;
            } else {
              const p2 = m.echoSet.p2val || {}, p5 = m.echoSet.p5val || {};
              if (p2.echoDmg) echoSkillBonus += p2.echoDmg;
              if (p5.echoDmg) echoSkillBonus += p5.echoDmg;
            }
          }
          const echoDmgMult = 1 + echoSkillBonus / 100;
          const isMain = m.name === mainDps.name;
          const echoCrit = isMain ? avgCrit : (() => {
            let eCr = 5, eCd = 150;
            if (m.weapSubstat === 'Crit Rate') eCr += parseFloat(m.weapSubVal) || 0;
            if (m.weapSubstat === 'Crit DMG') eCd += parseFloat(m.weapSubVal) || 0;
            if (m.weapon) {
              // Use getWeaponPv (curated pv table + refinement scaling), matching every other crit
              // computation in this file — this branch previously called parsePassive() directly,
              // bypassing curated pv values and always using unrefined (R1) numbers regardless of
              // the weapon's actual refinement level, understating this member's echo-skill crit.
              const eRefLevel = (teamEquipment[teamIdx + ':' + m.name])?.refinement || 1;
              const wp = getWeaponPv(m.weapon, m.d.element, eRefLevel);
              eCr += wp.critRate || 0; eCd += wp.critDmg || 0;
            }
            if (m.echoSet) { const p2 = m.echoSet.p2val || {}, p5 = m.echoSet.p5val || {}; if (p2.critRate) eCr += p2.critRate; if (p5.critRate) eCr += p5.critRate; }
            return 1 + (Math.min(eCr, 100) / 100) * (eCd / 100 - 1);
          })();
          const thisDmg = echoBase * (echoDmgPct / 100) * echoCrit * echoDmgMult * defMult * echoResMult;
          echoActiveDmg += thisDmg;
          // Attribute echo damage to the member who uses it
          const md = memberDmg.find(mm => mm.name === m.name);
          if (md) { md.echoDmg = thisDmg; md.total += thisDmg; }
        }
      }
    });

    // Mode-exclusive Tune Break candidates (the engine-architecture history (git log) item 9): resolve each mode-locked
    // character's own Rupture-vs-Strain contribution to whichever ACTUALLY yields more total damage
    // for this real composition — comparing real final totals (not a fabricated unit conversion
    // between flat DOT damage and a multiplicative deepen, which aren't comparable in isolation; see
    // calcTuneBreakDmg's own comment for why this needs `totalRotDmg`/`echoActiveDmg` already final.
    // Resolved BEFORE the DOT-distribution loop below so a Rupture win's added dmg is actually
    // reflected in the member breakdown it feeds, not just the aggregate grandTotal.
    {
      const candidates = dotResult.tuneBreakExclusiveCandidates;
      if (candidates.length) {
        // Full combinatorial resolution (the engine-architecture history (git log) item 9) — replaced an earlier
        // marginal-"delta if this one member is excluded" approach after it produced a real wrong
        // answer once TWO members (Aemeath, Denia) both competed for the SAME shared boolean-gated
        // Fusion Burst reaction: excluding just one of two co-appliers reads as zero marginal cost
        // (the OTHER one alone keeps the reaction active), which made that member's own mode choice
        // look free when it wasn't actually independent of the other's. A full enumeration over every
        // candidate's own valid options — cheap, since real teams have at most a couple of mode-locked
        // members — has no such blind spot: each combination's real final total is computed directly,
        // including a fresh calcFusionBurstDmg() call for whichever subset of fusion-competing
        // candidates opted in for that specific combination.
        //
        // Clean baseline: strip the shared Fusion Burst reaction's dmg out of dotDmgPerRotation (its
        // real value depends on which candidates opt in, enumerated below) — the exclusive candidates'
        // OWN tuneBreak rupture/strain contributions are already excluded by calcTuneBreakDmg itself,
        // only the fusion reaction needs stripping here.
        const baseDotDmg = dotDmgPerRotation - dotResult.breakdown.fusionBurst.dmg;
        const baseGrandTotal = totalRotDmg + echoActiveDmg + baseDotDmg;

        const optionsFor = (c) => c.competesWithFusionBurstReaction ? ['fusion', 'rupture', 'strain'] : ['rupture', 'strain'];
        // Cartesian product of every candidate's own option list — e.g. Aemeath{fusion,rupture,strain}
        // × Denia{fusion,rupture,strain} × Lynae{rupture,strain} = 18 combinations, trivial to evaluate.
        let combos = [[]];
        for (const c of candidates) {
          const opts = optionsFor(c);
          combos = combos.flatMap(prefix => opts.map(opt => [...prefix, opt]));
        }

        // Real hypothesis per combo, not a "reuse the baseline when nothing's excluded" shortcut
        // (the engine-merge history (git log) Phase 2 — Denia/Aemeath's Fusion Burst migration): the baseline
        // `dotResult.breakdown.fusionBurst.dmg` reflects whatever `winningStanceForOwner()` naturally
        // resolves for a BLOCK-migrated candidate, which is a DIFFERENT question than "what if this
        // combo's own hypothesis holds" — reusing it as a shortcut would silently reintroduce the exact
        // stale-baseline class of bug this resolver was built to eliminate. Always pass an explicit
        // stanceOverrides entry for every fusion-competing candidate in the combo (both `excludeNames`
        // for any still-legacy/unmigrated candidate and `stanceOverrides` for block-migrated ones are
        // populated together — a candidate might be either shape).
        const blocksByOwnerForFusion = engineChosenOrder?.blocksByOwner || null;
        let best = null;
        for (const combo of combos) {
          const fusionCompetingInCombo = candidates.filter((c, i) => c.competesWithFusionBurstReaction);
          const excludeNames = candidates
            .filter((c, i) => c.competesWithFusionBurstReaction && combo[i] !== 'fusion')
            .map(c => c.name);
          const stanceOverrides = {};
          candidates.forEach((c, i) => {
            if (!c.competesWithFusionBurstReaction) return;
            stanceOverrides[c.name] = combo[i] === 'fusion' ? 'Fusion Burst mode' : '__not-fusion-this-combo__';
          });
          const fusionDmg = fusionCompetingInCombo.length
            ? recomputeFusionBurstDmg(mems, rotTime, defMult, dotResult.fusionBurstResMult, excludeNames, blocksByOwnerForFusion, stanceOverrides).dmg
            : dotResult.breakdown.fusionBurst.dmg;
          let dmgAdj = fusionDmg, multAdj = 1;
          candidates.forEach((c, i) => {
            if (combo[i] === 'rupture') dmgAdj += c.ruptureDmgDelta;
            else if (combo[i] === 'strain') multAdj *= (1 + c.strainDeepenDelta);
          });
          const total = (baseGrandTotal + dmgAdj) * (tuneBreakDeepenMult * multAdj);
          if (!best || total > best.total) best = { total, dmgAdj, multAdj, combo };
        }

        dotDmgPerRotation = baseDotDmg + best.dmgAdj;
        tuneBreakDeepenMult = tuneBreakDeepenMult * best.multAdj;
        candidates.forEach((c, i) => {
          const stance = best.combo[i] === 'fusion' ? 'Fusion Burst mode' : best.combo[i] === 'rupture' ? 'Tune Rupture mode' : 'Tune Strain mode';
          tuneBreakResolvedStances.push({ name: c.name, stance });
        });
      }
    }

    // Distribute DOT damage proportionally to members who enable it
    const dotContributors = mems.filter(m => {
      const bt = CHAR_BUFF_TABLE[m.name];
      return bt?.debuffs?.some(db => ['frazzle', 'erosion', 'fusionBurst'].includes(db.stat)) || bt?.electroFlare || bt?.tuneBreak;
    });
    if (dotContributors.length > 0 && dotDmgPerRotation > 0) {
      const share = dotDmgPerRotation / dotContributors.length;
      dotContributors.forEach(m => {
        const md = memberDmg.find(mm => mm.name === m.name);
        if (md) { md.dotDmg = share; md.total += share; }
      });
    }

    // ── TEAM DPS: Single authoritative number (skills + echoes + DOTs + Tune Break) ──
    const grandTotal = totalRotDmg + echoActiveDmg + dotDmgPerRotation;
    const teamDps = Math.round(grandTotal * tuneBreakDeepenMult / rotTime);

    // ── Member DPS with full breakdown ──
    const memberDps = memberDmg.map(m => {
      const adjustedTotal = m.total * tuneBreakDeepenMult;
      const grandTotalAdj = grandTotal * tuneBreakDeepenMult;
      const pct = grandTotalAdj > 0 ? Math.round(adjustedTotal / grandTotalAdj * 100) : 0;
      return {
        name: m.name,
        dmg: adjustedTotal,
        pct,
        // Damage source tags for distribution display
        onField: m.isOnField,
        hasEcho: m.echoDmg > 0,
        hasDot: m.dotDmg > 0,
        isCoord: m.isCoord,
        // Per-source breakdown percentages
        skillShare: m.total > 0 ? Math.round(m.skillDmg / m.total * 100) : 0,
        echoShare: m.total > 0 ? Math.round(m.echoDmg / m.total * 100) : 0,
        dotShare: m.total > 0 ? Math.round(m.dotDmg / m.total * 100) : 0,
      };
    });

    // ── SOLO DPS: sum of individual solo DPS for synergy calculation ──
    const soloDps = Math.round(rawTotalRotDmg / rawRotTime);

    // ── SYNERGY UPLIFT: actual % DPS gain from team synergy ──
    const synergyUplift = soloDps > 0 ? Math.round((teamDps / soloDps - 1) * 100) : 0;

    // ── Damage source type breakdown for the whole team ──
    const totalSkillDmg = memberDmg.reduce((s, m) => s + m.skillDmg, 0);
    const totalDotDmg = dotDmgPerRotation;
    const totalEchoDmg = echoActiveDmg;
    const grandTotalRaw = totalSkillDmg + totalEchoDmg + totalDotDmg;
    const dmgSources = grandTotalRaw > 0 ? {
      rotation: Math.round(totalSkillDmg / grandTotalRaw * 100),
      echo: Math.round(totalEchoDmg / grandTotalRaw * 100),
      dot: Math.round(totalDotDmg / grandTotalRaw * 100),
    } : { rotation: 100, echo: 0, dot: 0 };

    // ── Synergy scoring: measures how well the team works together ──
    let syn = 0;
    // Role coverage (0-30). Compound roles like 'Support/Healer' (Chisa, Suisui) never match an
    // exact 'Healer'/'Support' equality check, so a team with just one of them as its only
    // healer/support scored as having neither — use the substring-aware role helper instead.
    const hasHealer = mems.some(m => isHealerRole(m.d.role));
    const hasSubDps = mems.some(m => m.d.role === 'Sub DPS');
    const hasSupport = mems.some(m => (m.d.role || '').includes('Support'));
    if (hasHealer) syn += 15;
    if (hasSubDps || hasSupport) syn += 15;
    // Element synergy (0-20): matching elements enable resonance + buff alignment
    const mainEl = mainDps.d.element;
    if (mainEl && elCounts[mainEl] >= 2) syn += 10; // Element resonance with DPS
    if (mainEl && elCounts[mainEl] >= 3) syn += 5;  // Mono-element bonus
    // Buff alignment (0-25): do teammates buff what the DPS actually uses?
    const dpsBuffTable = CHAR_BUFF_TABLE[mainDps.name];
    mems.forEach(m => {
      if (m.name === mainDps.name) return;
      const bt = CHAR_BUFF_TABLE[m.name];
      if (!bt) return;
      (bt.outroBuffs || []).forEach(b => {
        // Not actually universal — an element-restricted deepen (Ciaccona's "Aero Erosion DMG Amp
        // only", Phoebe's "Spectro Frazzle DMG Amp (Confession)") credited full synergy points here
        // even against an unrelated main DPS.
        if (b.stat === 'deepen') { if (universalStatApplies(b.condition, (mainEl || '').toLowerCase(), mainDps.name)) syn += 5; }
        else if (b.stat === 'basicDmg' && dpsFocus.includes('Basic ATK')) syn += 5;
        else if (b.stat === 'heavyDmg' && dpsFocus.includes('Heavy ATK')) syn += 5;
        else if (b.stat === 'libDmg' && dpsFocus.includes('Liberation')) syn += 3;
        else if (b.stat === 'echoDmg' && dpsFocus.includes('Echo')) syn += 5;
        else if (b.stat === 'skillDmg' && dpsFocus.includes('Skill')) syn += 4;
        else if (b.stat === 'elemDmg') {
          const cond = (b.condition || '').toLowerCase();
          const dpsEl = (mainEl || '').toLowerCase();
          if (!cond || cond.includes(dpsEl) || cond.includes('all')) syn += 4;
        }
      });
      // Debuff contribution
      (bt.debuffs || []).forEach(db => {
        if (db.stat === 'defShred' || db.stat === 'resShred') syn += 3;
      });
    });
    // Off-field damage contribution (0-10)
    const offFieldDamagers = mems.filter(m => m.name !== mainDps.name && (m.d.dmgFocus || []).includes('Coordinated ATK'));
    if (offFieldDamagers.length > 0) syn += 5;
    if (offFieldDamagers.length > 1) syn += 5;
    syn = Math.min(syn, 100);
    const warnings = [];
    if (mems.length < 3) {
      warnings.push('Incomplete team');
    } else {
      if (!mems.some(m => isHealerRole(m.d.role))) warnings.push('No healer in team');
      const els = new Set(mems.map(m => m.d.element));
      if (els.size === mems.length) warnings.push('No element resonance');
      const dpsCount = mems.filter(m => m.d.role === 'Main DPS').length;
      if (dpsCount >= 2) warnings.push(`Dual DPS: rotation time shared — use 👑 to pick which one${mainDpsOverride ? ` (${mainDps.name})` : ''}`);
      if (dpsCount === 0) warnings.push(`No Main DPS: using highest damage dealer — use 👑 to pick a different headline DPS${mainDpsOverride ? ` (${mainDps.name})` : ''}`);
      // Real, calculated consequence of the selected enemy (not just a DEF/RES number difference) —
      // flag when the main DPS's own element is one the target specifically resists, since that's the
      // one matchup the player can actually act on (swap main DPS or bring an off-element sub-DPS).
      if (enemyEcho) {
        const mainRes = getEnemyRes(mainDps.d.element);
        if (mainRes > 10) warnings.push(`${enemyEcho} resists ${mainDps.d.element} (${mainRes}% RES) — ${mainDps.name}'s main-hit DMG is reduced against this target`);
      }
    }
    const dotDps = Math.round(dotDmgPerRotation / rotTime);


    // Add energy warnings
    mems.forEach(m => {
      const ecf = energyCycleFactors[m.name];
      if (ecf && ecf.libUptime < 0.9) {
        warnings.push(`${m.name}: low ER (${Math.round(ecf.totalER)}%) — Liberation uptime ${Math.round(ecf.libUptime * 100)}%`);
      }
    });

    return { members: mems, mainDps, allBuffs, allDebuffs, effAtk, critRate: cr, critDmg: cd, elemDmg, skillDmg, amplify, deepen, atkPct, defShred, resShred, defIgnore, avgCrit, defMult, resMult, score, soloDps, teamDps, synergyUplift, dotDps, hasFrazzle, hasErosion, hasFusionBurst, hasElectroFlare, dmgSources, energyCycleFactors, warnings, memberDps, rotationTimeline, rotTime, tuneBreakResolvedStances,
      // Legacy aliases for DPSComparisonCard compatibility
      rawDps: soloDps, realDps: teamDps, perfectDps: teamDps, synergy: Math.min(100, Math.max(0, synergyUplift)) };
}
