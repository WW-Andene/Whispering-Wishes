// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — features/teams/autoEquip.js (extracted from DamageCalculator.jsx)
// Auto-equip echo/weapon selection logic for a team member.
// ═══════════════════════════════════════════════════════════════════════════════

import { CHARACTER_DATA } from '../../data/characters.js';
import { WEAPON_DATA } from '../../data/weapons.js';
import { ECHO_SETS, ALL_4COST_ECHOES, ALL_3COST_ECHOES, ALL_1COST_ECHOES, ECHO_DATA } from '../../data/echoes.js';
import { isHealerRole, isSupportRole, scoreTeamComposition } from './calcEngine.js';
import { calcTeamStats } from './calcTeamStats.js';
import { RESONANCE_MODE_OPTIONS } from '../../data/resonanceModes.js';

// Extracted from the per-character "Auto Equip" button's onClick so both that button and the
// team-wide "Full Auto Build" button (which needs to run this for every member in one pass, with
// each member's 4-cost pick visible to the next member's collision check) share one implementation
// instead of drifting. Pure w.r.t. its inputs — takes an explicit teamEquipmentSnapshot rather than
// reading component state directly, so a caller can thread an in-progress snapshot across multiple
// sequential calls before committing a single setTeamEquipment update.
// Generic weapon fallback for when bestWeapon is missing/unresolvable (a data-entry gap, not
// something reachable today — every current roster entry has a real bestWeapon — but nothing
// should silently equip zero weapon if a future character ever lacks one). Picks the highest-
// rarity weapon of the character's own weapon type, preferring one whose substat matches what
// this role actually wants: Crit Rate/Crit DMG for a DPS, Energy Regen for a healer/support,
// or the character's own scaling stat as a last resort.
function pickGenericWeapon(d) {
  const candidates = Object.entries(WEAPON_DATA).filter(([, w]) => w.type === d.weapon);
  if (!candidates.length) return null;
  const scaling = d.statScaling || 'ATK';
  const scalingStat = scaling === 'HP' ? 'HP%' : scaling === 'DEF' ? 'DEF%' : 'ATK%';
  const isDpsRole = d.role === 'Main DPS' || d.role === 'Sub DPS';
  const score = ([, w]) => {
    let s = (w.rarity || 0) * 100;
    if (isDpsRole && (w.stat === 'Crit Rate' || w.stat === 'Crit DMG')) s += 50;
    else if (!isDpsRole && w.stat === 'Energy Regen') s += 30;
    else if (w.stat === scalingStat) s += 20;
    return s;
  };
  candidates.sort((a, b) => score(b) - score(a));
  return candidates[0][0];
}

function computeAutoEquipEntry(memberName, teamEquipmentSnapshot, activeTeamIndex, allMemberNames, mainDpsOverrideName) {
  const d = CHARACTER_DATA[memberName];
  if (!d) return null;
  const aeqKey = activeTeamIndex + ':' + memberName;
  const weapon = (d.bestWeapon && WEAPON_DATA[d.bestWeapon]) ? d.bestWeapon : pickGenericWeapon(d);
  const recSets = new Map();
  const rawDirectEchoes = new Set();
  // Some bestEchoes entries carry a trailing parenthetical note distinguishing alternate builds
  // (e.g. "Havoc Eclipse 2pc (personal DMG)", "Rejuvenating Glow 5pc (best overall team ATK)" —
  // see Chisa/Aemeath/Denia's multi-build entries). The pc-count regex below needs the string to
  // END in "Npc", so that trailing "(...)" silently broke the match and dropped the set from
  // recSets entirely for every character using this annotation convention. Stripped here first so
  // "Havoc Eclipse 2pc (personal DMG)" still parses as "Havoc Eclipse", 2.
  const stripAnnotation = s => s.replace(/\s*\([^)]*\)\s*$/, '').trim();
  // A multi-build entry also lists TWO OR MORE separate, mutually-exclusive build options back to
  // back in one array (main echo + set for build A, then main echo + set for build B, ...) rather
  // than one coherent 5-piece loadout. Merging every one of those sets into a single recSets map
  // produces an impossible target (e.g. needing 3pc of one set AND 2pc of another AND 5pc of a
  // third all in the same 5-echo loadout) that can never be satisfied once the earlier sets have
  // already claimed all 5 slots — pickEcho then finds every remaining set's threshold "already
  // met" or unreachable and returns null for the leftover slots. So once the running total of
  // requested pieces reaches a full loadout (5), stop folding in further entries: they belong to
  // a different, alternate build, not additional pieces of this one.
  let totalRequestedPc = 0;
  for (const entry of (d.bestEchoes || [])) {
    if (totalRequestedPc >= 5) break;
    [...ALL_4COST_ECHOES, ...ALL_3COST_ECHOES, ...ALL_1COST_ECHOES].forEach(en => {
      if (entry.toLowerCase().includes(en.toLowerCase())) rawDirectEchoes.add(en);
    });
    for (const rawPart of entry.split('+')) {
      if (totalRequestedPc >= 5) break;
      const trimmed = stripAnnotation(rawPart);
      const pcMatch = trimmed.match(/^(.+?)\s+(\d+)pc$/i);
      if (pcMatch && ECHO_SETS[pcMatch[1].trim()]) {
        const pc = parseInt(pcMatch[2], 10);
        recSets.set(pcMatch[1].trim(), pc);
        totalRequestedPc += pc;
      } else {
        const plain = trimmed.replace(/\s+\d+pc$/i, '').trim();
        if (ECHO_SETS[plain]) { recSets.set(plain, 5); totalRequestedPc += 5; }
      }
    }
  }
  const isTeamMainDps = mainDpsOverrideName === memberName;
  if (isTeamMainDps && d.role !== 'Main DPS') {
    const allTierEchoes = [...ALL_4COST_ECHOES, ...ALL_3COST_ECHOES, ...ALL_1COST_ECHOES];
    const ownElementSet = [...recSets.keys()].find(s => ECHO_SETS[s]?.element === d.element)
      || Object.keys(ECHO_SETS).find(s => ECHO_SETS[s].element === d.element
        && allTierEchoes.some(n => ECHO_DATA[n]?.sets?.includes(s)));
    if (ownElementSet) {
      recSets.clear();
      recSets.set(ownElementSet, 5);
    }
  }
  // No curated set recommendation to parse at all (bestEchoes is missing/unconfirmed — e.g. an
  // unreleased character, or any future data-entry gap) — without this, pickEcho below has an
  // empty setPrefs map and its whole selection loop never runs, silently leaving every echo slot
  // null instead of degrading to a worse-but-real build. Same generic same-element fallback the
  // off-role-hypercarry branch above already uses, just applied unconditionally whenever there's
  // still nothing to build off of, not only for that one specific case.
  if (recSets.size === 0) {
    const allTierEchoes = [...ALL_4COST_ECHOES, ...ALL_3COST_ECHOES, ...ALL_1COST_ECHOES];
    const genericElementSet = Object.keys(ECHO_SETS).find(s => ECHO_SETS[s].element === d.element
      && allTierEchoes.some(n => ECHO_DATA[n]?.sets?.includes(s)));
    if (genericElementSet) recSets.set(genericElementSet, 5);
  }
  const directEchoes = new Set(
    [...rawDirectEchoes].filter(name => (ECHO_DATA[name]?.sets || []).some(s => recSets.has(s)))
  );
  const currentEq = teamEquipmentSnapshot[aeqKey];
  // Tried making a "redundant" non-headline DPS (no healer/support anywhere on the team) build
  // toward ER/utility instead of another personal Crit template, reasoning a spare DPS should
  // contribute energy uptime if it can't contribute damage-carry duty. Measured it against the
  // real engine on a concrete case (Jinhsi/Encore/Augusta, no healer): teamDps went from 12613 to
  // 9767 -- a real regression, not an improvement. ER is a personal stat that only speeds up that
  // character's OWN Liberation cast; it doesn't share to teammates, so for a kit that isn't
  // Liberation-DMG-heavy, trading Crit Rate/DMG for it is a straight loss with nothing to show for
  // it. Reverted -- a bad 3-DPS/no-healer comp doesn't have a gear-choice fix; each member's own
  // best personal build is still genuinely the best available result for the team as a whole.
  const roleDefaultPreset = isTeamMainDps ? 'default'
    : (isHealerRole(d.role) || isSupportRole(d.role)) ? 'support' : 'default';
  const preset = currentEq?.echoPreset || roleDefaultPreset;
  const scaling = d.statScaling || 'ATK';
  const scalingStat = scaling === 'HP' ? 'HP%' : scaling === 'DEF' ? 'DEF%' : 'ATK%';
  const elDmgKey = d.element ? d.element.charAt(0).toUpperCase() + d.element.slice(1).toLowerCase() + ' DMG' : '';
  // Energy Regen is a 3-cost-ONLY main stat — 4-cost (Overlord/Calamity) echoes never roll it
  // (the wiki/Echo/Stats § "Mainstats"), so the 4-cost branches below fall
  // back to Crit Rate / Healing Bonus instead of an ER roll that can't actually exist.
  const getMainStat = (cost) => {
    if (preset === 'er') {
      if (cost === 4) return 'Crit Rate';
      if (cost === 3) return 'Energy Regen';
      return scalingStat;
    }
    if (preset === 'support') {
      if (cost === 4) return isHealerRole(d.role) ? 'Healing Bonus' : 'Crit Rate';
      if (cost === 3) return elDmgKey || scalingStat;
      return scaling === 'HP' ? 'HP%' : scalingStat;
    }
    if (cost === 4) return 'Crit Rate';
    if (cost === 3) return elDmgKey || scalingStat;
    return scalingStat;
  };
  // Each echo's 5 substats must be 5 DISTINCT stat types (matches how echoes actually roll
  // in-game) — applyEchoStats in calcEngine.js sums each array entry independently, so a
  // repeated stat here silently double-counts its value. 'ATK' (flat) is always a safe
  // distinct filler: it's a different substat type from the '%' stats above, handled via
  // flatSubToPct rather than colliding with scalingStat (which is always the '%' form).
  //
  // Ordering for the 'default' (Crit DPS) preset follows the real substat value weights
  // (the wiki/Echo/Stats, fetched 2026-08-25): Crit Rate 2.0 > Crit DMG
  // 1.0 > ATK%/scalingStat 0.75 > a DMG-bonus substat matching the character's own dmgFocus 0.5
  // > flat ATK 0.1 > Energy Regen 0. Energy Regen is explicitly the worst substat for a pure
  // Crit DPS (weight 0) so it's dropped from this preset entirely in favor of the character's
  // matching DMG-bonus substat when their kit has one (Basic/Heavy ATK, Skill, or Liberation
  // DMG); 'er' and 'support' presets keep Energy Regen since it's weighted 0.5-1.0 there instead.
  const FOCUS_TO_DMG_SUBSTAT = { 'Basic ATK': 'Basic ATK DMG', 'Heavy ATK': 'Heavy ATK DMG', 'Skill': 'Resonance Skill DMG', 'Liberation': 'Resonance Liberation DMG' };
  const focusSubstat = (d.dmgFocus || []).map(f => FOCUS_TO_DMG_SUBSTAT[f]).find(Boolean);
  const getSubstats = () => {
    if (preset === 'er') return ['Energy Regen', scalingStat, 'Crit Rate', 'Crit DMG', 'ATK'];
    if (preset === 'support') return [scalingStat, 'Energy Regen', 'Crit Rate', 'Crit DMG', 'ATK'];
    if (focusSubstat) return [scalingStat, 'Crit Rate', 'Crit DMG', focusSubstat, 'ATK'];
    return [scalingStat, 'Crit Rate', 'Crit DMG', 'ATK', 'Energy Regen'];
  };
  const defaultSubs = getSubstats();
  const newEchoes = [null, null, null, null, null];
  // Echoes are not a limited/unique resource in WuWa. Weapons aren't exclusive-per-account either
  // -- any number of characters can equip the same named weapon simultaneously (nothing stops two
  // Broadblade users both running the same signature sword); the only real weapon constraint is
  // refinement rank, which caps at R5 (WEAPON_REFINE_SCALE has exactly 5 entries) regardless of
  // how many duplicate copies are owned. Neither weapons nor echoes are quantity-tracked anywhere
  // in this app (no echoCounts/weapsCounts inventory model, unlike the real chars5Counts/
  // weaps5Counts collection), so there's nothing to gate equip selection on here either way. A
  // prior version excluded a teammate's own 4-cost echo
  // from this member's candidate pool here, with no in-game or in-app basis for the exclusion.
  // For the ~14 sets that only have a single 4-cost echo in the whole roster (Eternal Radiance,
  // Halo of Starry Radiance, Lingering Tunes, etc.), that exclusion could deny this member their
  // only possible 4-cost slot for the set whenever a teammate got auto-built first, capping the
  // whole set at 4/5 pieces -- never completable -- for no real reason.
  const usedNames = new Set();
  const assignedCounts = new Map();
  const markAssigned = (name, setPrefs) => {
    (ECHO_DATA[name]?.sets || []).forEach(s => {
      if (setPrefs.has(s)) assignedCounts.set(s, (assignedCounts.get(s) || 0) + 1);
    });
  };
  const pickEcho = (tierList, setPrefs) => {
    for (const name of tierList) {
      if (!usedNames.has(name) && directEchoes.has(name)) {
        usedNames.add(name); markAssigned(name, setPrefs); return name;
      }
    }
    const wanted = new Set(setPrefs.keys());
    const charEl = (d.element || '').toLowerCase();
    const isRoleForHealing = isHealerRole(d.role);
    const matchesElement = (ed) => {
      const buffs = ed?.buff ? (Array.isArray(ed.buff) ? ed.buff : [ed.buff]) : [];
      if (buffs.length === 0) return true;
      return buffs.every(b => {
        if (b === 'Healing') return isRoleForHealing;
        if (b === 'Shield' || b === 'Physical DMG') return true;
        if (/ DMG$/.test(b)) return b.toLowerCase().startsWith(charEl);
        return true;
      });
    };
    const isDeadWeight = (ed) => {
      const buffs = ed?.buff ? (Array.isArray(ed.buff) ? ed.buff : [ed.buff]) : [];
      return buffs.length > 0 && buffs.every(b => b === 'Healing') && !isRoleForHealing;
    };
    for (const [setName, targetPc] of setPrefs) {
      if ((assignedCounts.get(setName) || 0) >= targetPc) continue;
      let bestElemMatch = null, bestPure = null, bestLive = null, anyMatch = null;
      for (const name of tierList) {
        if (usedNames.has(name)) continue;
        const ed = ECHO_DATA[name];
        if (!ed?.sets?.includes(setName)) continue;
        if (!anyMatch) anyMatch = name;
        if (!bestLive && !isDeadWeight(ed)) bestLive = name;
        const elemOk = matchesElement(ed);
        const pure = ed.sets.every(s => wanted.has(s));
        if (elemOk && pure) { usedNames.add(name); markAssigned(name, setPrefs); return name; }
        if (elemOk && !bestElemMatch) bestElemMatch = name;
        if (!elemOk && pure && !bestPure) bestPure = name;
      }
      const chosen = bestElemMatch || bestPure || bestLive || anyMatch;
      if (chosen) { usedNames.add(chosen); markAssigned(chosen, setPrefs); return chosen; }
    }
    // Every named set target is already satisfied (or there's no set target at all) but this
    // slot still needs an echo — a real player doesn't leave a slot empty just because the build
    // guide's set-piece count adds up to less than 5 (e.g. Rebecca/Lucy's curated "Shadow of
    // Shattered Dreams 1pc + Void Thunder 2pc" only specifies 3 pieces on purpose, meaning the
    // other 2 slots are meant to be generic best-substat fillers). Fall back to any unused,
    // element-appropriate, non-dead-weight echo instead of returning null here.
    let fallbackLive = null, fallbackAny = null;
    for (const name of tierList) {
      if (usedNames.has(name)) continue;
      const ed = ECHO_DATA[name];
      if (!ed) continue;
      if (!fallbackAny) fallbackAny = name;
      if (!fallbackLive && matchesElement(ed) && !isDeadWeight(ed)) { fallbackLive = name; break; }
    }
    const fallback = fallbackLive || fallbackAny;
    if (fallback) { usedNames.add(fallback); markAssigned(fallback, setPrefs); return fallback; }
    return null;
  };
  const e0 = pickEcho(ALL_4COST_ECHOES, recSets);
  if (e0) newEchoes[0] = { name: e0, mainStat: getMainStat(4), substats: defaultSubs.slice(0, 5) };
  for (let i = 1; i <= 2; i++) { const e = pickEcho(ALL_3COST_ECHOES, recSets); if (e) newEchoes[i] = { name: e, mainStat: getMainStat(3), substats: defaultSubs.slice(0, 5) }; }
  for (let i = 3; i <= 4; i++) { const e = pickEcho(ALL_1COST_ECHOES, recSets); if (e) newEchoes[i] = { name: e, mainStat: getMainStat(1), substats: defaultSubs.slice(0, 5) }; }
  let echoSetVal = '';
  let echoSet2Val = '';
  const recSetKeys = [...recSets.keys()];
  if (recSetKeys.length > 0) echoSetVal = recSetKeys[0];
  if (recSetKeys.length > 1) echoSet2Val = recSetKeys[1];
  const entry = { ...(currentEq || {}), weapon: weapon || (currentEq?.weapon || null), echoes: newEchoes, echoSet: echoSetVal, echoSet2: echoSet2Val, echoPreset: preset, sequence: currentEq?.sequence || 0 };
  return { aeqKey, entry };
}

// Search-based auto-equip: for a member whose ideal preset isn't already forced by their own
// static role (the headline DPS always wants 'default'; a Healer/Support always wants 'support'),
// don't guess at a team-aware heuristic -- actually build each real candidate preset and run it
// through the real calcTeamStats, keeping whichever produces the highest teamDps. This replaces
// a static rule with a measurement: a plausible-sounding heuristic tried here previously (spare
// non-headline DPS -> ER when no healer is on the team) turned out to be a real 21% teamDps
// regression once actually checked against the engine (12613 -> 9767 on a concrete case) --
// exactly the kind of wrong-but-plausible guess this search-based approach can't make, since it
// never assumes an answer, it tries the real options and measures the real result.
// Only searches members with a genuinely ambiguous preset (non-headline Main/Sub DPS); headline
// DPS and Healer/Support members skip straight to the normal single build, since re-deriving an
// already-unambiguous choice would just waste calcTeamStats calls for the same answer every time.
const CANDIDATE_PRESETS = ['default', 'er', 'support'];
// Real, manual Resonance Mode toggle (2026-09-05) — the player's own build-panel choice always wins
// for a normal build (see calcTeamStats.js's own default-to-index-0 fallback). Auto-build/auto-team
// is the one context where the ENGINE itself should pick, per direct user instruction: "if the user
// did use the auto build and/or auto team, the app choose by itself depending which do the most
// damage" — same search-not-guess discipline CANDIDATE_PRESETS above already established (measure
// the real engine result for each real option, keep the winner, never assume). Only runs here (the
// `Optimized`/search-based entry point actually used by Full Auto Build and Auto Team), never for
// the plain single-character "Auto Equip" button's direct computeAutoEquipEntry() call, which keeps
// respecting whatever the player already has (or the character's own default) unchanged.
function searchBestResonanceMode(memberName, result, teamEquipmentSnapshot, activeTeamIndex, mainDpsOverrideName, slots, enemyEcho, enemyLevel) {
  const modes = RESONANCE_MODE_OPTIONS[memberName];
  if (!result || !slots || !modes) return result;
  let bestEntry = result.entry, bestDps = -Infinity;
  for (const mode of modes) {
    const candidateEntry = { ...result.entry, resonanceMode: mode };
    const trialTeamEquipment = { ...teamEquipmentSnapshot, [result.aeqKey]: candidateEntry };
    let teamDps = 0;
    try {
      teamDps = calcTeamStats(slots, activeTeamIndex, mainDpsOverrideName, trialTeamEquipment, enemyEcho, enemyLevel)?.teamDps || 0;
    } catch { teamDps = 0; }
    if (teamDps > bestDps) { bestDps = teamDps; bestEntry = candidateEntry; }
  }
  return { ...result, entry: bestEntry };
}
function computeAutoEquipEntryOptimized(memberName, teamEquipmentSnapshot, activeTeamIndex, allMemberNames, mainDpsOverrideName, slots, enemyEcho, enemyLevel) {
  const d = CHARACTER_DATA[memberName];
  if (!d) return null;
  const isTeamMainDps = mainDpsOverrideName === memberName;
  const hasUnambiguousPreset = isTeamMainDps || isHealerRole(d.role) || isSupportRole(d.role);
  if (hasUnambiguousPreset || !slots) {
    const result = computeAutoEquipEntry(memberName, teamEquipmentSnapshot, activeTeamIndex, allMemberNames, mainDpsOverrideName);
    return searchBestResonanceMode(memberName, result, teamEquipmentSnapshot, activeTeamIndex, mainDpsOverrideName, slots, enemyEcho, enemyLevel);
  }
  const aeqKey = activeTeamIndex + ':' + memberName;
  let best = null, bestDps = -Infinity;
  for (const candidatePreset of CANDIDATE_PRESETS) {
    const forcedSnapshot = { ...teamEquipmentSnapshot, [aeqKey]: { echoPreset: candidatePreset } };
    const result = computeAutoEquipEntry(memberName, forcedSnapshot, activeTeamIndex, allMemberNames, mainDpsOverrideName);
    if (!result) continue;
    const trialTeamEquipment = { ...teamEquipmentSnapshot, [result.aeqKey]: result.entry };
    let teamDps = 0;
    try {
      teamDps = calcTeamStats(slots, activeTeamIndex, mainDpsOverrideName, trialTeamEquipment, enemyEcho, enemyLevel)?.teamDps || 0;
    } catch { teamDps = 0; }
    if (teamDps > bestDps) { bestDps = teamDps; best = result; }
  }
  const chosen = best || computeAutoEquipEntry(memberName, teamEquipmentSnapshot, activeTeamIndex, allMemberNames, mainDpsOverrideName);
  return searchBestResonanceMode(memberName, chosen, teamEquipmentSnapshot, activeTeamIndex, mainDpsOverrideName, slots, enemyEcho, enemyLevel);
}

// ── Enemy-aware "Auto Team" ──
// Generates a bounded set of candidate 3-member teams from a character pool (either the player's
// owned roster, or the full roster to include aspirational/unowned picks), pre-filters them with
// the cheap enemy-blind scoreTeamComposition (same synergy heuristic the "Team Suggestions" list
// already uses), then actually builds and calc's the real top candidates against the SPECIFIC
// selected enemy and keeps whichever produces the highest real teamDps. This is the missing link
// between two things that already existed independently: calcTeamStats already knows an enemy's
// real elemental resistance (surfaces as e.g. "Lorelei resists Havoc"), and scoreTeamComposition
// already ranks team synergy -- but nothing previously combined them, so team suggestions never
// changed based on which enemy was selected. Candidate generation mirrors TeamsTab.jsx's own
// owned-roster suggestion logic (top-3 sub-partner x top-2 healer/support per DPS candidate) so
// the two stay consistent, just parameterized by pool instead of hardcoded to ownedNames.
function generateCandidateTeams(pool, ownedWeaps) {
  const validPool = pool.filter(n => CHARACTER_DATA[n]);
  const dpsPool = validPool.filter(n => CHARACTER_DATA[n].role === 'Main DPS');
  const hypercarryPool = validPool.filter(n => CHARACTER_DATA[n].role === 'Sub DPS' && (CHARACTER_DATA[n].totalMult || 0) > 0);
  const dpsCandidates = [...dpsPool, ...hypercarryPool];
  const subPool = validPool.filter(n => CHARACTER_DATA[n].role === 'Sub DPS');
  const healPool = validPool.filter(n => isHealerRole(CHARACTER_DATA[n].role) || isSupportRole(CHARACTER_DATA[n].role));
  const scoreTeam = (members, dpsOverride) => scoreTeamComposition(members, ownedWeaps, dpsOverride);
  const seen = new Set();
  const candidates = [];
  for (const dps of dpsCandidates) {
    const subCandidates = subPool.filter(s => s !== dps)
      .map(sub => ({ name: sub, fit: scoreTeam([dps, sub], dps).score }))
      .sort((a, b) => b.fit - a.fit).slice(0, 3);
    const healCandidates = healPool.filter(h => h !== dps)
      .map(heal => ({ name: heal, fit: scoreTeam([dps, heal], dps).score }))
      .sort((a, b) => b.fit - a.fit).slice(0, 2);
    for (const sub of subCandidates) {
      for (const heal of healCandidates) {
        if (sub.name === heal.name) continue;
        const members = [dps, sub.name, heal.name];
        const key = [...members].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        const { score } = scoreTeam(members, dps);
        candidates.push({ members, dpsOverride: dps, cheapScore: score });
      }
    }
  }
  return candidates;
}

// pool: character names to draw from (pass an owned-only list for "owned", or the full roster for
// "any" -- the caller decides ownership mode, this function is pool-agnostic). ownedNames (a Set)
// is used only to report how many of each candidate's 3 members are actually owned, so a caller
// searching the full roster can still show that info without a second, separate pass.
function pickBestTeamForEnemy(pool, ownedWeaps, ownedNames, enemyEcho, enemyLevel, teamIdx = 0) {
  // Cap per-mainDps rather than taking a single flat top-N slice across all candidates: the
  // cheapScore used to rank candidates here is scoreTeamComposition, which is entirely enemy-blind
  // (no RES/element awareness). Keeping a few candidates per distinct mainDps guarantees every DPS
  // character in the pool gets a real (enemy RES-aware) shot at winning, so a target that resists
  // the generically-best DPS's element can actually surface a different, better-suited team.
  //
  // A previous version of this function ALSO sliced the per-DPS-capped list down to one flat
  // top-N (by the same enemy-blind cheapScore) before running the real calc, on top of this
  // per-DPS cap -- meant to protect against evaluating too many candidates, but it re-introduced
  // the exact bug the per-DPS cap exists to prevent, just one level up: verified against a concrete
  // case, Aemeath's real best partner pairing (Lynae + Shorekeeper, real teamDps 61028, beating
  // every other DPS tried including the generic favorite) correctly survived the per-DPS cap, but
  // then got cut by the flat top-N slice because its enemy-blind cheapScore (419) happened to rank
  // outside it globally -- so the search still landed on a worse team (54450) even though a
  // genuinely better one had already been generated and just never got a real evaluation. A
  // "guarantee one shot per element" patch on top of that only forwarded each element's cheap-score
  // #1 combo, which for Aemeath's element (Denia + Shorekeeper, cheapScore 481) real-evaluated to
  // 49143 -- worse than the Lynae pairing the flat slice had already discarded. Removed both layers:
  // every candidate that survives the per-DPS cap now gets a real evaluation below, no further
  // enemy-blind slicing on top of it.
  const perDpsCap = 3;
  const sortedCandidates = generateCandidateTeams(pool, ownedWeaps).sort((a, b) => b.cheapScore - a.cheapScore);
  const byDps = new Map();
  for (const cand of sortedCandidates) {
    const list = byDps.get(cand.dpsOverride) || [];
    if (list.length >= perDpsCap) continue;
    list.push(cand);
    byDps.set(cand.dpsOverride, list);
  }
  const candidates = [...byDps.values()].flat();
  let best = null;
  for (const cand of candidates) {
    const slots = [...cand.members, null];
    let teamEquipment = {};
    for (const name of cand.members) {
      const result = computeAutoEquipEntryOptimized(name, teamEquipment, teamIdx, cand.members, cand.dpsOverride, slots, enemyEcho, enemyLevel);
      if (result) teamEquipment = { ...teamEquipment, [result.aeqKey]: result.entry };
    }
    let result;
    try { result = calcTeamStats(slots, teamIdx, cand.dpsOverride, teamEquipment, enemyEcho, enemyLevel); } catch { continue; }
    const teamDps = result?.teamDps || 0;
    const ownedCount = ownedNames ? cand.members.filter(m => ownedNames.has(m)).length : 0;
    if (!best || teamDps > best.teamDps) {
      best = { members: cand.members, mainDps: cand.dpsOverride, teamEquipment, teamDps, ownedCount };
    }
  }
  return best;
}

export { computeAutoEquipEntry, computeAutoEquipEntryOptimized, pickBestTeamForEnemy };
