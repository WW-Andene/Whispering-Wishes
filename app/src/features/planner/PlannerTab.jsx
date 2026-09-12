// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — PlannerTab (extracted from App.jsx)
// Resource income planning and goal tracking
// ═══════════════════════════════════════════════════════════════════════════════
//
// [SECTION INDEX] - Use: grep -n "SECTION:" PlannerTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// [SECTION:PLANNER]      PlannerTab main component (income, goals, saved states)
// ─────────────────────────────────────────────────────────────────────────────
// The calendar/chronology view (event helpers + AstriteCalendar component) lives
// in its own file, AstriteCalendar.jsx — extracted from here since it was already
// a self-contained sub-component with its own [SECTION:] markers and no shared
// state with the rest of this file.

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Check, ChevronDown, Link2, Minus, Plus, Search, Star, Unlink2, X } from 'lucide-react';
import { ASTRITE_PER_PULL, LUNITE_DAILY_ASTRITE, AVG_UPDATE_ASTRITE, AVG_UPDATE_DAYS, AVG_UPDATE_P1_DAILY_ASTRITE, AVG_UPDATE_P2_DAILY_ASTRITE, AVG_UPDATE_DAILY_COMMISSION_ASTRITE, HARD_PITY, MAX_ASTRITE, SUBSCRIPTIONS, RESONATOR_ASCENSION_COSTS, RESONATOR_EXP_COSTS, SKILL_UPGRADE_COSTS, WEAPON_ASCENSION_COSTS_5, WEAPON_ASCENSION_COSTS_4, WEAPON_EXP_COSTS_5, WEAPON_EXP_COSTS_4, COMMON_MAT_TIERS, FORGERY_MAT_TIERS, MATERIAL_IMAGES } from '../../data/constants.js';
import { DEFAULT_COLLECTION_IMAGES, CHARACTER_THEMES, getCurrentBannerAuto } from '../../data/banners.js';
import { FocusTrapModal } from '../../shared/components/FocusTrapModal.jsx';
import { hideOnError } from '../../shared/utils/imageHelpers.js';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { generateUniqueId } from '../../utils/generateId.js';
import { getElementColor, getElementShape } from '../../shared/utils/elementVisuals.js';
import { CHARACTER_DATA, ALL_5STAR_RESONATORS, ALL_4STAR_RESONATORS } from '../../data/characters.js';
import { WEAPON_DATA, getLocalizedWeaponData } from '../../data/weapons.js';
import { Card, CardHeader, CardBody } from '../../shared/components/Card.jsx';
import { TabBackground } from '../../shared/backgrounds/TabBackground.jsx';
import { TabErrorBoundary } from '../../shared/errors/ErrorBoundaries.jsx';
import { CountdownTimer } from '../../shared/components/CountdownTimer.jsx';
import { KuroSelect } from '../../shared/components/KuroSelect.jsx';
import { TargetInput } from '../../shared/components/TargetInput.jsx';
import { AstriteCalendar } from './AstriteCalendar.jsx';
import EchoFarmPlanner from './EchoFarmPlanner.jsx';
import { t, formatNumber, formatDate, getLocale } from '../../utils/i18n.js';
import { calcStats } from '../../core/calcStats.js';
import { computePullAllocation } from '../../core/pullAllocation.js';
import { TIER_SCORES } from '../teams/calcEngine.js';
import { isHealerRole, isSupportRole } from '../../engine/math/roleMatch.js';


// Computes the full material/shell/EXP-potion requirement for one Ascension Planner target.
// Shared by the per-character breakdown and the combined-total summary so the two never drift.
// `ftg` = { name, ascension, skills, weapon, weaponName }.
function computeFarmMaterials(ftg) {
  const d = CHARACTER_DATA[ftg.name];
  const mats = {};
  const potions = {};
  let shell = 0;
  if (!d) return { mats, potions, shell };
  const addMat = (name, qty) => { if (!name || !qty) return; if (!mats[name]) mats[name] = { qty: 0, img: MATERIAL_IMAGES?.[name] }; mats[name].qty += qty; };
  const addPotion = (name, qty) => { if (!name || !qty) return; potions[name] = (potions[name] || 0) + qty; };

  if (ftg.ascension) {
    addMat(d.ascension?.boss, RESONATOR_ASCENSION_COSTS.boss);
    const ct = COMMON_MAT_TIERS[d.ascension?.common];
    if (ct) {
      if (ct.length >= 4) { addMat(ct[0], RESONATOR_ASCENSION_COSTS.commonT1); addMat(ct[1], RESONATOR_ASCENSION_COSTS.commonT2); }
      addMat(ct[ct.length - 2], RESONATOR_ASCENSION_COSTS.commonT3);
      addMat(ct[ct.length - 1], RESONATOR_ASCENSION_COSTS.commonT4);
    }
    addMat(d.ascension?.specialty, RESONATOR_ASCENSION_COSTS.specialty);
    shell += RESONATOR_ASCENSION_COSTS.shell;
    addPotion('Premium Resonance Potion', RESONATOR_EXP_COSTS['Premium Resonance Potion']);
  }
  if (ftg.skills) {
    const ft = FORGERY_MAT_TIERS[d.skillMaterials?.forgery];
    if (ft) {
      if (ft.length >= 4) { addMat(ft[0], SKILL_UPGRADE_COSTS.forgeryT1); addMat(ft[1], SKILL_UPGRADE_COSTS.forgeryT2); }
      addMat(ft[ft.length - 2], SKILL_UPGRADE_COSTS.forgeryT3);
      addMat(ft[ft.length - 1], SKILL_UPGRADE_COSTS.forgeryT4);
    }
    const ct = COMMON_MAT_TIERS[d.ascension?.common];
    if (ct) {
      if (ct.length >= 4) { addMat(ct[0], SKILL_UPGRADE_COSTS.commonT1); addMat(ct[1], SKILL_UPGRADE_COSTS.commonT2); }
      addMat(ct[ct.length - 2], SKILL_UPGRADE_COSTS.commonT3);
      addMat(ct[ct.length - 1], SKILL_UPGRADE_COSTS.commonT4);
    }
    addMat(d.skillMaterials?.weeklyDrop, SKILL_UPGRADE_COSTS.weeklyDrop);
    shell += SKILL_UPGRADE_COSTS.shell;
  }
  if (ftg.weapon) {
    const weaponName = ftg.weaponName || d.bestWeapon;
    const w = weaponName ? WEAPON_DATA?.[weaponName] : null;
    if (w?.ascensionMaterials) {
      const costs = w.rarity === 5 ? WEAPON_ASCENSION_COSTS_5 : WEAPON_ASCENSION_COSTS_4;
      const expCosts = w.rarity === 5 ? WEAPON_EXP_COSTS_5 : WEAPON_EXP_COSTS_4;
      const ft = FORGERY_MAT_TIERS[w.ascensionMaterials.forgery];
      if (ft) {
        if (ft.length >= 4) { addMat(ft[0], costs.forgeryT1); addMat(ft[1], costs.forgeryT2); }
        addMat(ft[ft.length - 2], costs.forgeryT3);
        addMat(ft[ft.length - 1], costs.forgeryT4);
      }
      const ct = COMMON_MAT_TIERS[w.ascensionMaterials.common];
      if (ct) {
        if (ct.length >= 4) { addMat(ct[0], costs.commonT1); addMat(ct[1], costs.commonT2); }
        addMat(ct[ct.length - 2], costs.commonT3);
        addMat(ct[ct.length - 1], costs.commonT4);
      }
      shell += costs.shell;
      addPotion('Premium Energy Core', expCosts['Premium Energy Core']);
    }
  }
  return { mats, potions, shell };
}

// Real success-rate-to-get-all-targets for the Goal Progress card — replaces a previous
// crude Poisson approximation that ignored the user's actual pity, ignored their tides
// entirely, and collapsed a "Both" goal into a single target instead of modeling two
// independent successes (direct user report 2026-09-10). Reuses computePullAllocation
// (the exact same per-banner pull split the Calculator tab uses) and calcStats (the
// exact same DP/Monte Carlo engine) so this card can never again disagree with the
// Calculator tab about the same goal. `calc` is state.calc, optionally with astrite
// overridden to a projected total (for the "by banner end" variant).
// Direct user report 2026-09-10: the Goal Progress card's "Target" figure was a flat
// 80/160/240-per-copy formula with zero awareness of the goal's actual pity — so a target
// already exceeded (100% success) could still show as e.g. "45.8% of Target," a real
// contradiction, not just two metrics answering different questions. worstCasePulls below is
// the SAME pity-aware worst-case number calcStats already computes for the probability side
// (HARD_PITY-based, minus current pity, minus the guarantee if already banked) — reusing it
// here means Target and the success-rate tiles can never disagree again.
function goalStats(calc) {
  const alloc = computePullAllocation(calc);
  const isFeatured = calc.bannerCategory === 'featured';
  const isChar = calc.selectedBanner === 'char';
  const isWeap = calc.selectedBanner === 'weap';

  let pChar = 1, pWeap = 1, worstCasePulls = 0;
  if (!isWeap) {
    const pulls = isFeatured ? alloc.charTotal : alloc.stdCharTotal;
    const copies = isFeatured ? Math.max(1, +calc.charCopies || 1) : Math.max(1, +calc.stdCharCopies || 1);
    const pity = isFeatured ? (+calc.charPity || 0) : (+calc.stdCharPity || 0);
    const guaranteed = isFeatured ? !!calc.charGuaranteed : false; // standard banners have no 50/50
    const stats = calcStats(pulls, pity, guaranteed, true, copies, 0, isFeatured);
    pChar = parseFloat(stats.successRate) / 100;
    worstCasePulls += stats.worstCase;
  }
  if (!isChar) {
    const pulls = isFeatured ? alloc.weapTotal : alloc.stdWeapTotal;
    const copies = isFeatured ? Math.max(1, +calc.weapCopies || 1) : Math.max(1, +calc.stdWeapCopies || 1);
    const pity = isFeatured ? (+calc.weapPity || 0) : (+calc.stdWeapPity || 0);
    const stats = calcStats(pulls, pity, false, false, copies, 0, isFeatured); // weapons: no 50/50
    pWeap = parseFloat(stats.successRate) / 100;
    worstCasePulls += stats.worstCase;
  }
  return { successRate: pChar * pWeap * 100, worstCasePulls };
}

// [SECTION:PLANNER] ── PlannerTab main component ─────────────────────────────
function PlannerTab({
  state,
  dispatch,
  activeBanners,
  bannerEndDate,
  collectionData,
  toast,
  confirm,
}) {
  const [showIncomePanel, setShowIncomePanel] = useState(false);
  // Calendar notes stored in localStorage
  const [calendarNotes, setCalendarNotes] = usePersistedState('ww-calendar-notes', {});
  const handleSetNote = useCallback((dateKey, note) => {
    setCalendarNotes(prev => {
      const next = { ...prev };
      if (note) next[dateKey] = note; else delete next[dateKey];
      return next;
    });
  }, []);
  // Ascension planner targets
  const [farmTargetsState, setFarmTargetsState] = usePersistedState('ww-farm-targets', []);
  const [farmPickerOpen, setFarmPickerOpen] = useState(false);
  const [farmSearch, setFarmSearch] = useState('');
  // Materials already in inventory — subtracted from the combined total so it shows what's actually
  // still needed, not just the raw max-level requirement.
  const [ownedMats, setOwnedMats] = usePersistedState('ww-farm-owned-mats', {});
  // Collapsible card state
  const [collapsed, setCollapsed] = useState({});

  // Direct user correction: Lunite Subscription stacks do NOT stack the daily Astrite rate —
  // only ONE subscription's +90/day bonus is ever active at a time, the same as in the real
  // game. Buying multiple queues them back-to-back instead, extending how many total days
  // that bonus lasts (count × duration), not multiplying what it pays per day.
  const baseDailyAstrite = state.planner.dailyAstrite || 0;
  const luniteDaysActive = (state.planner.luniteSubCount || 0) * SUBSCRIPTIONS.lunite.duration;
  // Today's rate — shown in the Daily Income card/header. Flat +90 while ANY stacked sub is
  // still within its queued duration, 0 once they've all run out.
  const dailyIncome = baseDailyAstrite + (luniteDaysActive > 0 ? LUNITE_DAILY_ASTRITE : 0);
  // Astrite earned over `days` days starting today — the Lunite bonus only applies for the
  // first luniteDaysActive of those days, then income drops back to the base rate. Anything
  // projecting more than "today" (calendar totals, income projections, days-to-goal) must use
  // this instead of a flat dailyIncome × days multiplication, or it silently assumes the
  // bonus lasts forever.
  const cumulativeIncome = useCallback((days) => {
    const d = Math.max(0, days);
    return baseDailyAstrite * d + LUNITE_DAILY_ASTRITE * Math.min(d, luniteDaysActive);
  }, [baseDailyAstrite, luniteDaysActive]);

  // Adds the average income a "usual" game update grants (AVG_UPDATE_ASTRITE, sourced/derived in
  // gachaRates.js) on top of the player's own known income (cumulativeIncome above), prorated to
  // a flat per-day rate over AVG_UPDATE_DAYS — direct user request, 2026-09-13. Reuses
  // cumulativeIncome rather than reimplementing the Lunite-boost piecewise math, so this can never
  // drift from the base projection it's extending.
  // FIXED 2026-09-13 (direct user catch — double counting): AVG_UPDATE_ASTRITE is a GROSS
  // whole-patch total that already includes daily commissions (see
  // AVG_UPDATE_DAILY_COMMISSION_ASTRITE's own comment in gachaRates.js) — the player's own
  // baseDailyAstrite ALSO represents commissions, so adding the raw AVG_UPDATE rate on top of
  // cumulativeIncome() double-counts that overlap. Subtract the commission-only rate first, so
  // only the genuinely-additional portion (events/exploration/tower/etc.) gets added.
  const AVG_UPDATE_DAILY_ASTRITE = Math.max(0, (AVG_UPDATE_ASTRITE / AVG_UPDATE_DAYS) - AVG_UPDATE_DAILY_COMMISSION_ASTRITE);
  const cumulativeIncomeWithUpdates = useCallback((days) => {
    const d = Math.max(0, days);
    return cumulativeIncome(d) + AVG_UPDATE_DAILY_ASTRITE * d;
  }, [cumulativeIncome]);

  // "By Banner End"/Goal Progress use a PHASE-SPECIFIC rate instead of the flat
  // AVG_UPDATE_DAILY_ASTRITE above — direct user follow-up, 2026-09-13: daysLeft here is always
  // days remaining in the CURRENT phase (activeBanners.phase), and real patches are front-loaded
  // (Phase 1 carries new-area exploration/story rewards Phase 2 doesn't have), so applying the
  // whole-patch average to Phase-2-only remaining days overstates it. The flat rate above is kept
  // for the 7/30/90-day Income Projections row, which naturally spans both phases over a rolling
  // window and isn't tied to "this specific phase's remaining days" the way Banner End is.
  // Same double-counting fix applied here (subtract the commission-only rate before adding).
  const AVG_UPDATE_PHASE_DAILY_ASTRITE = Math.max(0, (activeBanners.phase === 1 ? AVG_UPDATE_P1_DAILY_ASTRITE : AVG_UPDATE_P2_DAILY_ASTRITE) - AVG_UPDATE_DAILY_COMMISSION_ASTRITE);
  const cumulativeIncomeByPhaseWithUpdates = useCallback((days) => {
    const d = Math.max(0, days);
    return cumulativeIncome(d) + AVG_UPDATE_PHASE_DAILY_ASTRITE * d;
  }, [cumulativeIncome, AVG_UPDATE_PHASE_DAILY_ASTRITE]);

  const planData = useMemo(() => {
    const currentAstrite = (+state.calc.astrite || 0) + (+state.calc.lunite || 0);
    // Deadline: the pinned date if one is set, else the actual banner end date (direct user
    // request — "chance by banner end should be obviously by the banner end by default,
    // unless i pin a marker in the calendar").
    const deadline = state.planner.deadlinePin ? new Date(state.planner.deadlinePin) : new Date(bannerEndDate);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((deadline - now) / 86400000));
    const incomeByEnd = cumulativeIncome(daysLeft);
    const totalAstriteByEnd = currentAstrite + incomeByEnd;
    // "By Banner End" including the average-update-income addition — same daysLeft, routed
    // through cumulativeIncomeByPhaseWithUpdates (the current phase's own rate, not the flat
    // whole-patch average — see that helper's own comment above).
    const incomeByEndWithUpdates = cumulativeIncomeByPhaseWithUpdates(daysLeft);
    const totalAstriteByEndWithUpdates = currentAstrite + incomeByEndWithUpdates;

    // Target AND allocation split — fully independent from the Calculator tab by default
    // (direct user request: "plan should not be wired on calc slider unless button link
    // used... assume 50/50 by default"). state.planner.linkedToCalc is a persistent on/off
    // toggle (the header's link button): while ON, both the target fields and the
    // char/weapon allocation slider mirror Calc LIVE; while OFF (the default), the goal uses
    // its own independent target fields and a fixed 50/50 allocation.
    const linked = !!state.planner.linkedToCalc;
    const goalBannerCategoryField = linked ? state.calc.bannerCategory : state.planner.goalBannerCategory;
    const goalSelectedBannerField = linked ? state.calc.selectedBanner : state.planner.goalSelectedBanner;
    const goalCharCopiesField = linked ? state.calc.charCopies : state.planner.goalCharCopies;
    const goalWeapCopiesField = linked ? state.calc.weapCopies : state.planner.goalWeapCopies;
    const goalStdCharCopiesField = linked ? state.calc.stdCharCopies : state.planner.goalStdCharCopies;
    const goalStdWeapCopiesField = linked ? state.calc.stdWeapCopies : state.planner.goalStdWeapCopies;
    const isFeatured = goalBannerCategoryField === 'featured';
    const isChar = goalSelectedBannerField === 'char';
    const isWeap = goalSelectedBannerField === 'weap';
    let goalCopies = 1;
    let goalBannerLabel = '';
    if (isFeatured) {
      if (isChar) { goalCopies = Math.max(1, goalCharCopiesField || 1); goalBannerLabel = `${t('planner.featuredLabel')} ${t('planner.resonatorLabel')}`; }
      else if (isWeap) { goalCopies = Math.max(1, goalWeapCopiesField || 1); goalBannerLabel = `${t('planner.featuredLabel')} ${t('planner.weaponLabel')}`; }
      else { goalCopies = Math.max(1, goalCharCopiesField || 1, goalWeapCopiesField || 1); goalBannerLabel = `${t('planner.featuredLabel')} ${t('planner.bothLabel')}`; }
    } else {
      if (isChar) { goalCopies = Math.max(1, goalStdCharCopiesField || 1); goalBannerLabel = `${t('planner.standardLabel')} ${t('planner.resonatorLabel')}`; }
      else if (isWeap) { goalCopies = Math.max(1, goalStdWeapCopiesField || 1); goalBannerLabel = `${t('planner.standardLabel')} ${t('planner.weaponLabel')}`; }
      else { goalCopies = Math.max(1, goalStdCharCopiesField || 1, goalStdWeapCopiesField || 1); goalBannerLabel = `${t('planner.standardLabel')} ${t('planner.bothLabel')}`; }
    }
    // Direct user report: the Multiplier dropdown fed into the Target pull-count formula
    // (goalPulls × goalCopies × goalModifier) but NOT into the success-rate tiles, which read
    // charCopies/weapCopies directly — so "×3" on the Multiplier moved the Target bar to 720
    // pulls while the success-rate tiles still modeled only 1 copy. effModifier folds the
    // Multiplier into the copies actually simulated by goalStats() below, so both numbers are
    // always describing the same goal (N copies × the Multiplier), never two different ones.
    const effModifier = Math.max(1, +state.planner.goalModifier || 1);

    // Tides (Radiant/Forging/Lustrous) relevant to the GOAL's own banner selection — the
    // resource AMOUNTS are still shared/read from state.calc (only the target decoupled), but
    // which of them count toward THIS goal depends on the goal's own selection, not whatever
    // Calc currently happens to be showing.
    const relevantTides = isFeatured
      ? (isChar ? (+state.calc.radiant || 0) : isWeap ? (+state.calc.forging || 0) : (+state.calc.radiant || 0) + (+state.calc.forging || 0))
      : (+state.calc.lustrous || 0);
    const convenesByEnd = Math.floor(totalAstriteByEnd / ASTRITE_PER_PULL) + relevantTides;
    const convenesByEndWithUpdates = Math.floor(totalAstriteByEndWithUpdates / ASTRITE_PER_PULL) + relevantTides;

    // Real success-rate-to-get-all-targets AND a pity-aware Target (direct user report
    // 2026-09-10: the old flat 80/160/240-per-copy Target formula had zero awareness of
    // current pity, so it could show e.g. "45.8% of Target" for a goal the success-rate tiles
    // already correctly reported as 100% guaranteed — a real contradiction, not two metrics
    // answering different questions. worstCasePulls reuses the exact same pity-aware
    // HARD_PITY-based worst-case calcStats already computes for the probability side, so
    // Target and the success-rate tiles can never disagree again. Currency amounts always
    // come from Calc (shared) — the goal's own target fields AND the char/weapon allocation
    // split only mirror Calc while `linked` is on; otherwise they use Planner's own
    // independent goal fields and a fixed 50/50 split (direct user request: "plan should not
    // be wired on calc slider unless button link used... assume 50/50 by default"). "By end"
    // reruns the same allocation with astrite/lunite bumped to the projected total (tides
    // don't accrue via dailyIncome, so they stay as-is).
    const goalCalcLike = {
      astrite: state.calc.astrite, lunite: state.calc.lunite, radiant: state.calc.radiant,
      forging: state.calc.forging, lustrous: state.calc.lustrous,
      allocPriority: linked ? state.calc.allocPriority : 50,
      stdAllocPriority: linked ? state.calc.stdAllocPriority : 50,
      bannerCategory: goalBannerCategoryField, selectedBanner: goalSelectedBannerField,
      charCopies: (goalCharCopiesField || 1) * effModifier, charPity: linked ? state.calc.charPity : state.planner.goalCharPity, charGuaranteed: linked ? state.calc.charGuaranteed : state.planner.goalCharGuaranteed,
      weapCopies: (goalWeapCopiesField || 1) * effModifier, weapPity: linked ? state.calc.weapPity : state.planner.goalWeapPity,
      stdCharCopies: (goalStdCharCopiesField || 1) * effModifier, stdCharPity: linked ? state.calc.stdCharPity : state.planner.goalStdCharPity,
      stdWeapCopies: (goalStdWeapCopiesField || 1) * effModifier, stdWeapPity: linked ? state.calc.stdWeapPity : state.planner.goalStdWeapPity,
    };
    const nowStats = goalStats(goalCalcLike);
    const endStats = goalStats({ ...goalCalcLike, astrite: totalAstriteByEnd, lunite: 0 });
    // 3rd success-rate figure: "by end" but including the average-update-income addition —
    // direct user request, 2026-09-13. Added ALONGSIDE probNow/probByEnd rather than replacing
    // either, matching the pattern already used for the Income Projections/By Banner End rows
    // above (base figure kept, a 2nd figure shows the range with average future-update income
    // folded in).
    const endStatsWithUpdates = goalStats({ ...goalCalcLike, astrite: totalAstriteByEndWithUpdates, lunite: 0 });
    const probNow = nowStats.successRate;
    const probByEnd = endStats.successRate;
    const probByEndWithUpdates = endStatsWithUpdates.successRate;

    // Target — reverted to the original flat Base-Convenes-per-copy × Multiplier × Copies
    // formula (direct user request), instead of the later pity-aware worstCasePulls Target.
    // The success-rate tiles above still use the real pity-aware goalStats(), so a
    // guaranteed-100%-success goal can once again show as "under Target" — that's the
    // known, explicitly-requested tradeoff of this revert.
    const targetPulls = Math.max(1, state.planner.goalPulls * goalCopies * state.planner.goalModifier);
    const targetAstrite = targetPulls * ASTRITE_PER_PULL;
    // Availability in PULLS first (tides included), THEN converted to an Astrite shortfall —
    // converting currentAstrite alone (an earlier approach) silently dropped every tide from
    // the "still needed" figure, overstating it by relevantTides * ASTRITE_PER_PULL (direct user
    // report 2026-09-10, confirmed against the app's own numbers: 47 Radiant + 38 Forging tides
    // were worth 85 * 160 = 13,600 Astrite that never got credited).
    const availablePulls = Math.floor(currentAstrite / ASTRITE_PER_PULL) + relevantTides;
    const pullsByEnd = Math.floor(totalAstriteByEnd / ASTRITE_PER_PULL) + relevantTides;
    const goalNeeded = Math.max(0, targetPulls - availablePulls) * ASTRITE_PER_PULL;
    // Days to reach goalNeeded — NOT a flat division, since the Lunite bonus only lasts
    // luniteDaysActive days before income drops to the base rate (see cumulativeIncome above).
    // Solved directly rather than iterated: cumulativeIncome is piecewise-linear with one
    // breakpoint at luniteDaysActive, so either the target is reached within the boosted
    // period (divide by the boosted rate), or it's reached only after the boost runs out
    // (the boosted period's own total, plus however many further days the base rate alone
    // needs for the remainder).
    let goalDaysNeeded;
    if (goalNeeded <= 0) {
      goalDaysNeeded = 0;
    } else {
      const boostRate = baseDailyAstrite + (luniteDaysActive > 0 ? LUNITE_DAILY_ASTRITE : 0);
      const incomeAtBoostEnd = cumulativeIncome(luniteDaysActive);
      if (goalNeeded <= incomeAtBoostEnd) {
        goalDaysNeeded = boostRate > 0 ? Math.ceil(goalNeeded / boostRate) : Infinity;
      } else if (baseDailyAstrite > 0) {
        goalDaysNeeded = luniteDaysActive + Math.ceil((goalNeeded - incomeAtBoostEnd) / baseDailyAstrite);
      } else {
        goalDaysNeeded = Infinity; // boost expired and no base income — goal is never reached
      }
    }
    const goalProgress = targetPulls > 0 ? Math.min(100, (availablePulls / targetPulls) * 100) : 0;
    return { currentAstrite, daysLeft, incomeByEnd, totalAstriteByEnd, incomeByEndWithUpdates, totalAstriteByEndWithUpdates, convenesByEnd, convenesByEndWithUpdates, isFeatured, isChar, isWeap, goalCopies, goalBannerLabel, targetPulls, targetAstrite, goalNeeded, goalDaysNeeded, goalProgress, probNow, probByEnd, probByEndWithUpdates, availablePulls, pullsByEnd };
  }, [state.calc, state.planner, bannerEndDate, dailyIncome, baseDailyAstrite, luniteDaysActive, cumulativeIncome, cumulativeIncomeByPhaseWithUpdates]);

  // ── Banner Recommendation ── direct user request: after Goal Progress, a section that gives
  // a realistic "who/what to pull" suggestion based on the player's own collection and this
  // patch's actual featured banners — not a generic tier-list dump. Priority mirrors the Teams
  // tab's own "no picks yet" ranking philosophy (dump-sourced tier first, then a concrete,
  // dump-cited reason, only using raw power as a last-resort tiebreak): an unowned character
  // always outranks an owned one (a recommendation to pull something already owned isn't useful),
  // then ToA tier (CHARACTER_DATA.tier.toa, literal dump text via TIER_SCORES), then whether they
  // fill a real gap in the player's own roster (no Main DPS yet / no Support-or-Healer yet), then
  // how many characters they already own are named in their own curated `teams` field — the same
  // dump-sourced citation data the Teams tab's recommendation engine reads, so "recommend Jingran
  // because you own Iuno" is a real, sourced claim, not an invented one.
  const bannerRecommendation = useMemo(() => {
    const ownedCharNames = new Set([
      ...Object.keys(collectionData?.chars5Counts || {}),
      ...Object.keys(collectionData?.chars4Counts || {}),
    ]);
    const ownedWeapNames = new Set([
      ...Object.keys(collectionData?.weaps5Counts || {}),
      ...Object.keys(collectionData?.weaps4Counts || {}),
    ]);
    const ownedArr = [...ownedCharNames].filter(n => CHARACTER_DATA[n]);
    // BUG FIX (direct user report: "how come Hiyuki and Mornye are good with Jingran?" — both
    // showed the generic fallback reason instead of the real "fills your Main DPS/Support gap"
    // text): Rover attunements are always counted "owned" (App.jsx: free starter character),
    // and Rover: Havoc (Main DPS)/Rover: Aero (Healer) being permanently in ownedArr silently
    // satisfied both role-gap checks below even on a completely fresh account with nothing
    // pulled — the exact same false signal already found and fixed in the Teams tab's own
    // "no picks yet" ranking. Excluded here for the same reason: Rover being trivially owned
    // isn't a meaningful "you already have a Main DPS/Support" signal.
    const ownedArrExcludingRover = ownedArr.filter(n => !n.startsWith('Rover:'));
    const hasMainDps = ownedArrExcludingRover.some(n => CHARACTER_DATA[n].role === 'Main DPS');
    const hasSupportOrHealer = ownedArrExcludingRover.some(n => isHealerRole(CHARACTER_DATA[n].role) || isSupportRole(CHARACTER_DATA[n].role));

    const featuredChars = (activeBanners?.characters || []).map(c => c.name).filter(n => n && CHARACTER_DATA[n]);
    if (featuredChars.length === 0) return null;

    const scored = featuredChars.map(name => {
      const d = CHARACTER_DATA[name];
      const owned = ownedCharNames.has(name);
      const tierScore = TIER_SCORES[d.tier?.toa] ?? -1;
      const fillsRoleGap = (d.role === 'Main DPS' && !hasMainDps) || ((isHealerRole(d.role) || isSupportRole(d.role)) && !hasSupportOrHealer);
      // Real, dump-sourced synergy: this character's OWN curated `teams` field naming a
      // character the player already owns — the exact same citation data the Teams tab reads,
      // never an invented pairing.
      // BUG FIX (direct user correction, Hiyuki case): raw match COUNT treats every citation as
      // equally strong evidence, but a character's `teams` array is ordered roughly best-first
      // (Hiyuki's own dump: "Lucilla wins out" over Lynae as her best buffer, then "Suisui/Chisa/
      // Mornye/Verina... ranked in order" as her supports, then Yinlin/Zhezhi/Changli/Jianxin as
      // explicit "last resort" — and her `teams` array is genuinely grouped in that same
      // best-to-worst order). A late "last resort" match (e.g. Jianxin) shouldn't count for as
      // much as an early "this is literally her best partner" match (e.g. Lucilla). Weight each
      // owned partner by 1/(firstIndex+1) — the earliest (best) team entry citing them — and sum,
      // so being cited early counts far more than being cited often. Two owned characters BOTH
      // named in the SAME early entry (a real, complete dump-endorsed team) score especially high,
      // since each independently gets that entry's full weight.
      const teamsList = d.teams || [];
      const partnerFirstIndex = new Map();
      teamsList.forEach((team, idx) => {
        team.split('+').map(m => m.trim()).forEach(m => {
          if (m !== name && ownedCharNames.has(m) && !partnerFirstIndex.has(m)) partnerFirstIndex.set(m, idx);
        });
      });
      const ownedSynergyPartners = [...partnerFirstIndex.keys()].sort((a, b) => partnerFirstIndex.get(a) - partnerFirstIndex.get(b));
      const synergyWeight = ownedSynergyPartners.reduce((sum, p) => sum + 1 / (partnerFirstIndex.get(p) + 1), 0);
      return { name, d, owned, tierScore, fillsRoleGap, ownedSynergyPartners, synergyWeight };
    });
    // Direct user request: "element is a small bonus, especially if I don't already have a
    // strong DPS/support for [that] element or damage type or buff" — three coverage checks, not
    // just element. Real but minor signals, all folded into ONE lowest-priority tiebreak (never
    // blended into synergyWeight) so they only ever decide between otherwise-equal candidates,
    // matching the Teams tab's own lexicographic-chain precedent rather than one weighted number.
    const damageDealers = ownedArrExcludingRover.filter(n => CHARACTER_DATA[n].role === 'Main DPS' || CHARACTER_DATA[n].role === 'Sub DPS');
    const supports = ownedArrExcludingRover.filter(n => isHealerRole(CHARACTER_DATA[n].role) || isSupportRole(CHARACTER_DATA[n].role));
    const ownedElementsWithDps = new Set(damageDealers.map(n => CHARACTER_DATA[n].element));
    const ownedDmgFocus = new Set(damageDealers.flatMap(n => CHARACTER_DATA[n].dmgFocus || []));
    const ownedBuffs = new Set(supports.flatMap(n => CHARACTER_DATA[n].buffs || []));
    scored.forEach(s => {
      const isDps = s.d.role === 'Main DPS' || s.d.role === 'Sub DPS';
      const isSupport = isHealerRole(s.d.role) || isSupportRole(s.d.role);
      s.fillsElementGap = isDps && !ownedElementsWithDps.has(s.d.element);
      s.fillsDamageTypeGap = isDps && (s.d.dmgFocus || []).length > 0 && !(s.d.dmgFocus || []).some(t => ownedDmgFocus.has(t));
      s.fillsBuffGap = isSupport && (s.d.buffs || []).length > 0 && !(s.d.buffs || []).some(b => ownedBuffs.has(b));
      s.fillsCoverageGap = s.fillsElementGap || s.fillsDamageTypeGap || s.fillsBuffGap;
    });
    scored.sort((a, b) => {
      if (a.owned !== b.owned) return a.owned ? 1 : -1;
      if (a.tierScore !== b.tierScore) return b.tierScore - a.tierScore;
      if (a.fillsRoleGap !== b.fillsRoleGap) return a.fillsRoleGap ? -1 : 1;
      if (a.synergyWeight !== b.synergyWeight) return b.synergyWeight - a.synergyWeight;
      if (a.fillsCoverageGap !== b.fillsCoverageGap) return a.fillsCoverageGap ? -1 : 1;
      return 0;
    });

    const top = scored[0];
    // Direct user feedback: "their signature weapon is on the banner" said nothing useful on its
    // own. Now a real Must-Have/Not-Essential verdict: no listed alt5 5★ alternative at all means
    // the signature is close to mandatory to unlock the kit; otherwise it's a nice-to-have, and if
    // the player already owns one of the listed alt5/alt4 alternatives, that's named directly
    // instead of a generic "alternatives exist" — real data (weaponAlts), never invented.
    const featuredWeapons = activeBanners?.weapons || [];
    const topWeaponRaw = top ? featuredWeapons.find(w => w.forCharacter === top.name) : null;
    let topWeapon = null;
    if (topWeaponRaw) {
      const alt5 = top.d.weaponAlts?.alt5 || [];
      const alt4 = top.d.weaponAlts?.alt4 || [];
      const ownedAlt = [...alt5, ...alt4].find(w => ownedWeapNames.has(w));
      // Direct user correction: "no alt5 listed" alone missed characters whose own dump
      // explicitly calls them signature-reliant DESPITE having listed alternatives (Jingran:
      // "one of the most Signature-weapon-reliant characters in the game," 3 alt5s listed) — a
      // real per-character audit added `signatureReliant` to CHARACTER_DATA for exactly these
      // cases, sourced from each one's own dump text. reliantDespiteAlts distinguishes that case
      // from "no alternative exists at all" for the reason text below.
      const noAlt5AtAll = alt5.length === 0;
      topWeapon = {
        ...topWeaponRaw,
        owned: ownedWeapNames.has(topWeaponRaw.name),
        mustHave: noAlt5AtAll || !!top.d.signatureReliant,
        reliantDespiteAlts: !noAlt5AtAll && !!top.d.signatureReliant,
        ownedAlt,
        altOptions: alt5,
      };
    }
    const allOwned = scored.every(s => s.owned);

    return { scored, top, topWeapon, allOwned };
  }, [activeBanners, collectionData]);

  // Collapsible section toggle
  const toggleSection = useCallback((key) => setCollapsed(p => ({ ...p, [key]: !p[key] })), []);

  return (
    <div role="tabpanel" id="tabpanel-planner" aria-labelledby="tab-planner" tabIndex="0">
    <TabErrorBoundary tabName={t('tabs.planner')}>
    <div className="kuro-calc space-y-3 tab-content">
      <TabBackground id="planner" />

      {/* ── 1. Calendar ────────────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('calendar')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('calendar'); } }} aria-expanded={!collapsed.calendar}>
          <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.calendar ? '' : 'rotate-180'}`} />}><Calendar size={14} className="inline mr-1.5 -mt-0.5 text-yellow-400" />{t('planner.astriteCalendar')}</CardHeader>
        </div>
        {!collapsed.calendar && (
          <CardBody className="space-y-3">
            <AstriteCalendar dailyIncome={dailyIncome} cumulativeIncome={cumulativeIncome} bannerEndDate={bannerEndDate} planData={planData} activeBanners={activeBanners} eventStatus={state.eventStatus} calendarNotes={calendarNotes} onSetNote={handleSetNote} deadlinePin={state.planner.deadlinePin} onSetDeadlinePin={(dateKey) => dispatch({ type: 'SET_PLANNER', field: 'deadlinePin', value: dateKey })} toast={toast} />
          </CardBody>
        )}
      </Card>

      {/* ── 2. Daily Income ────────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('daily')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('daily'); } }} aria-expanded={!collapsed.daily}>
          <CardHeader action={<>
            <span className="text-yellow-400 kuro-number text-base font-bold">{dailyIncome}/day</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.daily ? '' : 'rotate-180'}`} />
          </>}><Calendar size={14} className="inline mr-1.5 -mt-0.5 text-yellow-400" />{t('planner.dailyIncomeTitle')}</CardHeader>
        </div>
        {!collapsed.daily && (
          <CardBody className="space-y-3">
            <div>
              <label className="kuro-label" title={t('planner.dailyAstriteTooltip')}>{t('planner.dailyAstriteLabel')}</label>
              <TargetInput value={state.planner.dailyAstrite} min={0} max={MAX_ASTRITE} onChange={v => dispatch({ type: 'SET_PLANNER', field: 'dailyAstrite', value: v })} className="kuro-input w-full" ariaLabel={t('planner.dailyAstriteAriaLabel')} />
              <div className="text-gray-500 text-sm mt-1">{t('planner.dailyAstriteHint')}</div>
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 text-md font-medium">{t('planner.total')}</span>
                <span className="text-yellow-400 font-bold kuro-number text-lg">{t('planner.astriteSuffix', { n: formatNumber(dailyIncome) })}</span>
              </div>
              <div className="text-gray-400 text-sm mt-1">{t('planner.perDaySummary', { convenes: (dailyIncome / ASTRITE_PER_PULL).toFixed(2), monthly: formatNumber(Math.floor(cumulativeIncome(30) / ASTRITE_PER_PULL)) })}</div>
            </div>
          </CardBody>
        )}
      </Card>

      {/* ── 3. Purchases ───────────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => setShowIncomePanel(!showIncomePanel)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowIncomePanel(!showIncomePanel); } }} aria-expanded={showIncomePanel}>
          <CardHeader action={<>
            {state.planner.addedIncome.length > 0 && <span className="text-emerald-400 text-sm">{t('planner.addedCount', { count: state.planner.addedIncome.length })}</span>}
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showIncomePanel ? 'rotate-180' : ''}`} />
          </>}>{t('planner.purchases')}</CardHeader>
        </div>
        {showIncomePanel && (
          <CardBody className="space-y-2">
            <div className="kuro-label">{t('planner.subscriptions')}</div>
            <div className={`kuro-btn w-full text-left ${state.planner.luniteSubCount > 0 ? 'active-emerald' : ''}`}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded flex items-center justify-center ${state.planner.luniteSubCount > 0 ? 'bg-emerald-500 text-black' : ''}`} style={!state.planner.luniteSubCount ? { background: 'var(--bg-btn)' } : undefined}>
                    {state.planner.luniteSubCount > 0 && <Check size={12} />}
                  </span>
                  <div>
                    <div className={`text-base font-medium ${state.planner.luniteSubCount > 0 ? 'text-emerald-400' : 'text-gray-200'}`}>{t('planner.luniteSubTitle')}</div>
                    <div className="text-gray-300 text-sm">{t('planner.luniteSubDesc', { daily: SUBSCRIPTIONS.lunite.daily, duration: SUBSCRIPTIONS.lunite.duration })}</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <span className="text-emerald-400 text-base">{t('planner.perMonth', { price: SUBSCRIPTIONS.lunite.price })}</span>
                    {state.planner.luniteSubCount > 0 && <div className="text-emerald-400 text-sm">{t('planner.luniteSubActiveSummary', { daily: SUBSCRIPTIONS.lunite.daily, days: state.planner.luniteSubCount * SUBSCRIPTIONS.lunite.duration })}</div>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => dispatch({ type: 'SET_PLANNER', field: 'luniteSubCount', value: Math.max(0, (state.planner.luniteSubCount || 0) - 1) })} disabled={!state.planner.luniteSubCount} className="text-red-400 min-w-[48px] min-h-[48px] flex items-center justify-center disabled:opacity-30" aria-label={t('planner.luniteSubRemoveAriaLabel')}><Minus size={12} /></button>
                    <span className="text-gray-100 w-4 text-center kuro-number">{state.planner.luniteSubCount || 0}</span>
                    <button onClick={() => dispatch({ type: 'SET_PLANNER', field: 'luniteSubCount', value: (state.planner.luniteSubCount || 0) + 1 })} className="text-yellow-400 min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label={t('planner.luniteSubAddAriaLabel')}><Plus size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: SUBSCRIPTIONS.weekly.astrite, lunite: SUBSCRIPTIONS.weekly.lunite || 0, radiant: 0, lustrous: 0, label: SUBSCRIPTIONS.weekly.name, price: SUBSCRIPTIONS.weekly.price } }); toast?.addToast?.(t('planner.addedToast', { name: SUBSCRIPTIONS.weekly.name }), 'success'); }} className="kuro-btn w-full text-left">
              <div className="flex items-center justify-between w-full">
                <div><div className="text-gray-200 text-base font-medium">{SUBSCRIPTIONS.weekly.name}</div><div className="text-gray-300 text-sm">{SUBSCRIPTIONS.weekly.desc}</div></div>
                <div className="flex items-center gap-1"><span className="text-emerald-400 text-base">${SUBSCRIPTIONS.weekly.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
              </div>
            </button>
            {Object.entries(SUBSCRIPTIONS).filter(([k]) => k === 'bpInsider' || k === 'bpConnoisseur').map(([k, s]) => (
              <button key={k} onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: s.astrite || 0, lunite: s.lunite || 0, radiant: s.radiant || 0, lustrous: s.lustrous || 0, label: s.name, price: s.price } }); toast?.addToast?.(t('planner.addedToast', { name: s.name }), 'success'); }} className="kuro-btn w-full text-left">
                <div className="flex items-center justify-between w-full">
                  <div><div className="text-gray-200 text-base font-medium">{s.name}</div><div className="text-gray-300 text-sm">{s.desc}</div></div>
                  <div className="flex items-center gap-1"><span className="text-emerald-400 text-base">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                </div>
              </button>
            ))}
            <div className="kuro-label mt-3">{t('planner.directTopUps')}</div>
            {Object.entries(SUBSCRIPTIONS).filter(([k]) => k.startsWith('directTop')).map(([k, s]) => (
              <button key={k} onClick={() => { dispatch({ type: 'ADD_INCOME', income: { id: generateUniqueId(), astrite: s.astrite || 0, lunite: s.lunite || 0, radiant: 0, lustrous: 0, label: s.name, price: s.price } }); toast?.addToast?.(t('planner.addedToast', { name: s.name }), 'success'); }} className="kuro-btn w-full text-left">
                <div className="flex items-center justify-between w-full">
                  <div><div className="text-gray-200 text-base font-medium">{s.name}</div><div className="text-gray-300 text-sm">{s.desc}</div></div>
                  <div className="flex items-center gap-1"><span className="text-emerald-400 text-base">${s.price.toFixed(2)}</span><Plus size={12} className="text-yellow-400" /></div>
                </div>
              </button>
            ))}
            {state.planner.addedIncome.length > 0 && (
              <>
                <div className="kuro-label mt-3">{t('planner.added')}</div>
                {state.planner.addedIncome.map(i => (
                  <div key={i.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-base">
                    <span className="text-gray-200">{i.label}</span>
                    <div className="flex items-center gap-2">
                      {i.astrite > 0 && <span className="text-yellow-400">+{i.astrite}</span>}
                      {i.lunite > 0 && <span className="text-cyan-400">+{i.lunite}L</span>}
                      {i.radiant > 0 && <span className="text-yellow-400">+{i.radiant}R</span>}
                      {i.lustrous > 0 && <span className="text-cyan-400">+{i.lustrous}L</span>}
                      <button onClick={async () => { if (await confirm({ title: t('planner.removePurchaseTitle'), message: t('planner.removePurchaseMessage', { name: i.label }), confirmLabel: t('planner.removeLabel'), destructive: true })) dispatch({ type: 'REMOVE_INCOME', id: i.id }); }} className="text-red-400 min-w-[48px] min-h-[48px] flex items-center justify-center -my-2" aria-label={t('planner.removeAriaLabel', { name: i.label })}><Minus size={12} /></button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-[var(--border-medium)] flex justify-between text-base">
                  <span className="text-gray-400">{t('planner.totalSpent')}</span>
                  <span className="text-emerald-400 font-bold">${state.planner.addedIncome.reduce((s, i) => s + (+i.price || 0), 0).toFixed(2)}</span>
                </div>
                <button onClick={async () => { if (await confirm({ title: t('planner.clearAllTitle'), message: t('planner.clearAllMessage'), confirmLabel: t('planner.clearAllConfirm'), destructive: true })) dispatch({ type: 'CLEAR_ALL_INCOME' }); }} className="text-red-400 text-sm hover:text-red-300 transition-colors w-full text-center py-1">{t('planner.clearAllButton')}</button>
              </>
            )}
          </CardBody>
        )}
      </Card>

      {/* ── 4. Income Projections ──────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('proj')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('proj'); } }} aria-expanded={!collapsed.proj}>
          <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.proj ? '' : 'rotate-180'}`} />}>{t('planner.incomeProjections')}</CardHeader>
        </div>
        {!collapsed.proj && (
          <CardBody>
            {dailyIncome === 0 ? (
              <div className="p-4 text-center rounded-lg" style={{ background: 'var(--bg-stat)' }}>
                <div className="text-gray-400 text-md mb-1">{t('planner.noIncomeSet')}</div>
                <div className="text-gray-400 text-base">{t('planner.setIncomeAbove')}</div>
              </div>
            ) : (
            <div className="grid grid-cols-3 gap-2">
              {[7, 30, 90].map(days => (
                <div key={days} className={`kuro-stat p-3 text-center ${days === 30 ? 'border-yellow-500/30 kuro-stat-gold' : ''}`}>
                  <div className="text-gray-400 text-sm mb-1">{days === 30 ? t('planner.monthly') : t('planner.daysLabel', { days })}</div>
                  <div className={`kuro-number text-yellow-400 font-extrabold ${days === 30 ? 'text-4xl' : 'text-2xl'}`}>{formatNumber(Math.floor(cumulativeIncome(days) / ASTRITE_PER_PULL))}</div>
                  <div className="text-gray-400 text-sm">{t('planner.convenes')}</div>
                  <div className="text-gray-400 text-sm">{t('planner.astriteSuffix', { n: formatNumber(cumulativeIncome(days)) })}</div>
                </div>
              ))}
            </div>
            )}
            {/* 2nd row: same projection PLUS the average income a "usual" game update grants
                (AVG_UPDATE_ASTRITE/AVG_UPDATE_DAYS, gachaRates.js) prorated over the same day
                count — direct user request, 2026-09-13. All 3 columns use the plain
                t('planner.daysLabel') (no "Monthly" label on the 30-day column here). */}
            <div className="mt-2 pt-2 border-t border-[var(--border-medium)]">
              <div className="text-gray-400 text-sm mb-2">{t('planner.incomeProjectionsWithUpdates')}</div>
              <div className="grid grid-cols-3 gap-2">
                {[7, 30, 90].map(days => (
                  <div key={days} className="kuro-stat p-3 text-center">
                    <div className="text-gray-400 text-sm mb-1">{t('planner.daysLabel', { days })}</div>
                    <div className="kuro-number text-yellow-400 font-extrabold text-2xl">{formatNumber(Math.floor(cumulativeIncomeWithUpdates(days) / ASTRITE_PER_PULL))}</div>
                    <div className="text-gray-400 text-sm">{t('planner.convenes')}</div>
                    <div className="text-gray-400 text-sm">{t('planner.astriteSuffix', { n: formatNumber(Math.round(cumulativeIncomeWithUpdates(days))) })}</div>
                  </div>
                ))}
              </div>
            </div>
            {state.planner.luniteSubCount > 0 && (
              <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                <span className="text-emerald-400 text-base">{t('planner.monthlySub')}</span>
                <span className="text-emerald-400 font-bold text-base">{t('planner.perMonth', { price: SUBSCRIPTIONS.lunite.price * state.planner.luniteSubCount })}</span>
                {state.planner.luniteSubCount > 1 && <span className="text-emerald-400 text-sm"> ({t('planner.luniteSubCountSuffix', { n: state.planner.luniteSubCount })})</span>}
              </div>
            )}
          </CardBody>
        )}
      </Card>

      {/* ── 5. By Banner End ───────────────────────────────────────────────── */}
      {planData.daysLeft > 0 && (
        <Card>
          <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('banner')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('banner'); } }} aria-expanded={!collapsed.banner}>
            <CardHeader action={<>
              <CountdownTimer endDate={bannerEndDate} compact />
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.banner ? '' : 'rotate-180'}`} />
            </>}>{t('planner.byBannerEnd')}</CardHeader>
          </div>
          {!collapsed.banner && (
            <CardBody className="space-y-2">
              <div className="text-gray-400 text-sm">{t('planner.versionPhase', { version: activeBanners.version, phase: activeBanners.phase, days: planData.daysLeft, plural: planData.daysLeft !== 1 ? 's' : '' })}</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="kuro-stat p-2 flex flex-col items-center justify-center text-center">
                  <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(planData.convenesByEnd)}</div>
                  <div className="text-gray-400 text-sm">{t('planner.totalConvenes')}</div>
                </div>
                <div className="kuro-stat p-2 flex flex-col items-center justify-center text-center">
                  <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(Math.floor(planData.incomeByEnd / ASTRITE_PER_PULL))}</div>
                  <div className="text-gray-400 text-sm">{t('planner.earned')}</div>
                </div>
                <div className="kuro-stat p-2 flex flex-col items-center justify-center text-center">
                  <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(planData.totalAstriteByEnd)}</div>
                  <div className="text-gray-400 text-sm">{(+state.calc.lunite || 0) > 0 ? t('planner.totalAL') : t('planner.astrite')}</div>
                </div>
              </div>
              <div className="text-gray-400 text-sm text-center">{t('planner.currentEarnedSummary', { current: formatNumber(+state.calc.astrite || 0), luniteSuffix: (+state.calc.lunite || 0) > 0 ? t('planner.luniteSuffixText', { lunite: formatNumber(+state.calc.lunite || 0) }) : '', earned: formatNumber(planData.incomeByEnd) })}</div>
              {/* Same 3 tiles, but including the average-update-income addition, prorated over
                  the same daysLeft — direct user request, 2026-09-13. */}
              <div className="pt-2 border-t border-[var(--border-medium)]">
                <div className="text-gray-400 text-sm mb-2">{t('planner.byBannerEndWithUpdates')}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="kuro-stat p-2 flex flex-col items-center justify-center text-center">
                    <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(planData.convenesByEndWithUpdates)}</div>
                    <div className="text-gray-400 text-sm">{t('planner.totalConvenes')}</div>
                  </div>
                  <div className="kuro-stat p-2 flex flex-col items-center justify-center text-center">
                    <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(Math.floor(planData.incomeByEndWithUpdates / ASTRITE_PER_PULL))}</div>
                    <div className="text-gray-400 text-sm">{t('planner.earned')}</div>
                  </div>
                  <div className="kuro-stat p-2 flex flex-col items-center justify-center text-center">
                    <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(Math.round(planData.totalAstriteByEndWithUpdates))}</div>
                    <div className="text-gray-400 text-sm">{(+state.calc.lunite || 0) > 0 ? t('planner.totalAL') : t('planner.astrite')}</div>
                  </div>
                </div>
              </div>
            </CardBody>
          )}
        </Card>
      )}

      {/* ── 6. Goal Progress ───────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('goal')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('goal'); } }} aria-expanded={!collapsed.goal}>
          <CardHeader action={<>
            {/* Direct user request: the goal target (and its char/weapon allocation split) is
                independent from the Calculator tab by default, using a fixed 50/50 split —
                this is a persistent on/off link, not a one-shot copy: while ON, both mirror
                Calc live; while OFF, Planner uses its own goal fields. stopPropagation so
                clicking it doesn't also toggle this card's own collapse (the whole header row
                has its own onClick above). */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextLinked = !state.planner.linkedToCalc;
                dispatch({ type: 'SET_PLANNER', field: 'linkedToCalc', value: nextLinked });
                toast?.addToast?.(t(nextLinked ? 'planner.linkedToCalcToast' : 'planner.unlinkedFromCalcToast'), 'success');
              }}
              className={`min-w-[48px] min-h-[48px] flex items-center justify-center -my-2 ${state.planner.linkedToCalc ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-gray-200'}`}
              title={t(state.planner.linkedToCalc ? 'planner.unlinkFromCalcTooltip' : 'planner.linkToCalcTooltip')}
              aria-pressed={state.planner.linkedToCalc}
              aria-label={t(state.planner.linkedToCalc ? 'planner.unlinkFromCalcAriaLabel' : 'planner.linkToCalcAriaLabel')}
            >
              {state.planner.linkedToCalc ? <Link2 size={14} /> : <Unlink2 size={14} />}
            </button>
            <span className="text-gray-400 text-sm">{planData.goalProgress.toFixed(0)}%</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.goal ? '' : 'rotate-180'}`} />
          </>}>{t('planner.goalProgressTitle')}</CardHeader>
        </div>
        {!collapsed.goal && (
        <CardBody className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="kuro-label">{t('planner.baseConvenes')}</label>
              <KuroSelect
                value={state.planner.goalPulls}
                onChange={v => dispatch({ type: 'SET_PLANNER', field: 'goalPulls', value: +v })}
                options={[
                  { value: HARD_PITY, label: t('planner.hardPityLabel', { n: HARD_PITY }) },
                  { value: HARD_PITY * 2, label: t('planner.guaranteedLabel', { n: HARD_PITY * 2 }) },
                  { value: 240, label: t('planner.charSignatureLabel') },
                ]}
                className="w-full"
                ariaLabel={t('planner.baseConvenes')}
                small
              />
            </div>
            <div>
              <label className="kuro-label">{t('planner.multiplier')}</label>
              <KuroSelect
                value={state.planner.goalModifier}
                onChange={v => dispatch({ type: 'SET_PLANNER', field: 'goalModifier', value: +v })}
                options={[
                  { value: 1, label: '×1' },
                  { value: 2, label: '×2' },
                  { value: 3, label: '×3' },
                ]}
                className="w-full"
                ariaLabel={t('planner.multiplier')}
                small
              />
            </div>
          </div>
          <div className="p-2 bg-white/5 rounded-lg text-sm text-gray-400 text-center">
            {t('planner.goalSummaryPrefix')}<span className={planData.isFeatured ? 'text-yellow-400' : 'text-cyan-400'}>{planData.goalBannerLabel}</span> × <span className="text-gray-100">{planData.goalCopies}</span> {t('planner.copiesLabel')}
          </div>
          <div className="text-sm text-gray-500 text-center py-1">
            <span title={t('planner.baseConvenesTooltip')} className="underline decoration-dotted cursor-help">{t('planner.baseConvenes')}</span>
            {' × '}
            <span title={t('planner.multiplierTooltip')} className="underline decoration-dotted cursor-help">{t('planner.multiplier')}</span>
            {' × '}
            <span title={t('planner.copiesTooltip')} className="underline decoration-dotted cursor-help">{t('planner.copiesLabel')}</span>
            {' = '}
            <span className="text-gray-400">{state.planner.goalPulls} × {state.planner.goalModifier} × {planData.goalCopies} = {planData.targetPulls}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-lg" aria-live="polite" aria-atomic="false">
            <div className="flex justify-between text-md mb-2">
              <span className="text-gray-400">{t('planner.target')}</span>
              <span className="text-gray-100 font-bold">{t('planner.targetSummary', { pulls: planData.targetPulls, astrite: formatNumber(planData.targetAstrite) })}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-stat)' }} role="progressbar" aria-valuenow={planData.goalProgress} aria-valuemin={0} aria-valuemax={100} aria-label={t('planner.goalProgressAriaLabel', { pct: planData.goalProgress.toFixed(1) })}>
              <div className={`h-full transition-[width] duration-300 ${planData.isFeatured ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`} style={{ width: `${planData.goalProgress}%` }} />
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">{t('planner.convenesProgress', { current: planData.availablePulls, target: planData.targetPulls })}</span>
              <span className="text-gray-100">{planData.goalProgress.toFixed(1)}%</span>
            </div>
          </div>
          {/* Probability estimate. 3rd tile (with-updates) added alongside the existing 2 rather
              than replacing "by end" — direct user request, 2026-09-13, matching the pattern
              already used for the Income Projections/By Banner End rows above. */}
          <div className="grid grid-cols-3 gap-2">
            <div className="kuro-stat p-3 text-center flex flex-col items-center justify-center">
              <div className={`kuro-number text-xl font-bold ${planData.probNow >= 80 ? 'text-emerald-400' : planData.probNow >= 50 ? 'text-yellow-400' : planData.probNow >= 20 ? 'text-orange-400' : 'text-red-400'}`}>{planData.probNow.toFixed(1)}%</div>
              <div className="text-gray-500 text-xs">{t('planner.chanceNow', { pulls: planData.availablePulls })}</div>
            </div>
            <div className="kuro-stat p-3 text-center flex flex-col items-center justify-center">
              <div className={`kuro-number text-xl font-bold ${planData.probByEnd >= 80 ? 'text-emerald-400' : planData.probByEnd >= 50 ? 'text-yellow-400' : planData.probByEnd >= 20 ? 'text-orange-400' : 'text-red-400'}`}>{planData.probByEnd.toFixed(1)}%</div>
              <div className="text-gray-500 text-xs">{t(state.planner.deadlinePin ? 'planner.chanceByDeadlinePin' : 'planner.chanceByEnd', { pulls: planData.pullsByEnd, date: state.planner.deadlinePin ? formatDate(new Date(state.planner.deadlinePin), { month: 'short', day: 'numeric' }) : undefined })}</div>
            </div>
            <div className="kuro-stat p-3 text-center flex flex-col items-center justify-center">
              <div className={`kuro-number text-xl font-bold ${planData.probByEndWithUpdates >= 80 ? 'text-emerald-400' : planData.probByEndWithUpdates >= 50 ? 'text-yellow-400' : planData.probByEndWithUpdates >= 20 ? 'text-orange-400' : 'text-red-400'}`}>{planData.probByEndWithUpdates.toFixed(1)}%</div>
              <div className="text-gray-500 text-xs">{t('planner.chanceByEndWithUpdates', { pulls: planData.convenesByEndWithUpdates })}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="kuro-stat p-3 text-center flex flex-col items-center justify-center">
              <div className="text-yellow-400 kuro-number text-2xl">{formatNumber(planData.goalNeeded)}</div>
              <div className="text-gray-400 text-sm">{t('planner.astriteNeeded')}</div>
            </div>
            <div className="kuro-stat p-3 text-center flex flex-col items-center justify-center">
              <div className="text-yellow-400 kuro-number text-2xl">{planData.goalDaysNeeded === Infinity ? t('planner.infinitySymbol') : formatNumber(planData.goalDaysNeeded)}</div>
              <div className="text-gray-400 text-sm">{t('planner.daysToGoal')}</div>
            </div>
          </div>
          {planData.goalDaysNeeded === Infinity && dailyIncome === 0 && (
            <div className="p-2 bg-white/5 rounded-lg text-center">
              <span className="text-gray-500 text-sm">{t('planner.setIncome')}</span>
            </div>
          )}
          {planData.goalDaysNeeded !== Infinity && planData.goalDaysNeeded > 0 && (
            <div className="p-2 bg-white/5 rounded-lg text-center">
              <span className="text-yellow-400 text-base font-medium">{t('planner.estimated', { date: formatDate(new Date(Date.now() + planData.goalDaysNeeded * 86400000), { month: 'long', day: 'numeric', year: 'numeric' }) })}</span>
            </div>
          )}
          {planData.goalNeeded >= 16000 && (
            <p className="text-gray-500 text-sm text-center mt-1">{t('planner.costNote', { cost: formatNumber(Math.ceil(planData.goalNeeded / 60)) })}</p>
          )}
        </CardBody>
        )}
      </Card>

      {/* ── 6b. Recommendations ────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('recommendation')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('recommendation'); } }} aria-expanded={!collapsed.recommendation}>
          <CardHeader action={<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.recommendation ? '' : 'rotate-180'}`} />}>{t('planner.recommendationTitle')}</CardHeader>
        </div>
        {!collapsed.recommendation && (
        <CardBody className="space-y-3">
          <p className="text-gray-500 text-xs text-center -mt-1">{t('planner.recommendationSubtitle')}</p>
          {!bannerRecommendation && (
            <p className="text-gray-500 text-sm text-center py-2">{t('planner.recommendationNoBanner')}</p>
          )}
          {bannerRecommendation && bannerRecommendation.allOwned && (
            <div className="p-3 bg-white/5 rounded-lg text-center space-y-1">
              <p className="text-gray-100 text-sm font-medium">{t('planner.recommendationAllOwnedTitle')}</p>
              <p className="text-gray-400 text-sm">
                {bannerRecommendation.topWeapon && !bannerRecommendation.topWeapon.owned
                  ? t('planner.recommendationAllOwnedWithWeapon', { weapon: bannerRecommendation.topWeapon.name, character: bannerRecommendation.topWeapon.forCharacter })
                  : t('planner.recommendationAllOwnedNoWeapon')}
              </p>
            </div>
          )}
          {bannerRecommendation && !bannerRecommendation.allOwned && bannerRecommendation.top && (() => {
            const { top, topWeapon } = bannerRecommendation;
            const imgUrl = DEFAULT_COLLECTION_IMAGES[top.name];
            return (
              <>
                <div className="p-3 bg-white/5 rounded-lg" style={{ borderLeft: '3px solid #eab308' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-yellow-400 flex-shrink-0" fill="currentColor" />
                    <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">{t('planner.recommendationBestPick')}</span>
                  </div>
                  <div className="flex gap-3">
                    {imgUrl && (
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-yellow-500/40 flex-shrink-0 bg-black/25">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: 'center top', transform: 'translateY(-14%) scale(1.9)', transformOrigin: 'top' }} onError={hideOnError} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-100 font-bold">{top.name}</span>
                      </div>
                      <ul className="text-gray-400 text-sm space-y-0.5 list-disc list-inside">
                        {top.fillsRoleGap && (
                          <li>{t(top.d.role === 'Main DPS' ? 'planner.recommendationFillsMainDps' : 'planner.recommendationFillsSupport')}</li>
                        )}
                        {!top.fillsRoleGap && top.fillsElementGap && (
                          <li>{t('planner.recommendationFillsElementGap', { element: top.d.element })}</li>
                        )}
                        {!top.fillsRoleGap && !top.fillsElementGap && top.fillsDamageTypeGap && (
                          <li>{t('planner.recommendationFillsDamageTypeGap', { types: (top.d.dmgFocus || []).join(', ') })}</li>
                        )}
                        {!top.fillsRoleGap && !top.fillsElementGap && !top.fillsDamageTypeGap && top.fillsBuffGap && (
                          <li>{t('planner.recommendationFillsBuffGap', { buffs: (top.d.buffs || []).join(', ') })}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Direct user feedback: "their signature weapon is on the banner" said nothing
                    useful on its own — replaced with a real Must-Have/Not-Essential verdict and
                    why, naming an owned alternative directly when one exists rather than a vague
                    "alternatives exist" line. */}
                {topWeapon && !topWeapon.owned && (
                  <div className="p-3 bg-white/5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-100 text-sm font-medium truncate">{topWeapon.name}</span>
                      <span className={`kuro-badge text-2xs flex-shrink-0 ${topWeapon.mustHave ? 'kuro-badge-red' : 'kuro-badge-cyan'}`}>
                        {t(topWeapon.mustHave ? 'planner.recommendationWeaponMustHave' : 'planner.recommendationWeaponNotEssential')}
                      </span>
                    </div>
                    {DEFAULT_COLLECTION_IMAGES[topWeapon.name] && (
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 bg-black/25">
                        <img src={DEFAULT_COLLECTION_IMAGES[topWeapon.name]} alt="" className="w-full h-full object-cover pointer-events-none" onError={hideOnError} />
                      </div>
                    )}
                    <p className="text-gray-500 text-xs">
                      {topWeapon.reliantDespiteAlts
                        ? t('planner.recommendationWeaponReliantDespiteAlts', { name: top.name })
                        : topWeapon.mustHave
                          ? t('planner.recommendationWeaponMustHaveReason', { name: top.name })
                          : topWeapon.ownedAlt
                            ? t('planner.recommendationWeaponAlreadyHaveAlt', { alt: topWeapon.ownedAlt })
                            : t('planner.recommendationWeaponAltExists', { alts: topWeapon.altOptions.join(', ') })}
                    </p>
                  </div>
                )}
                {/* Direct user correction: this must be about the player's OWNED roster, not a
                    list of other characters on the same banner — "who is this Best Pick good
                    for, among what I already have." Sourced from top.name's own curated `teams`
                    field citing an owned character, the same dump-citation data the Teams tab
                    reads — never an invented pairing. */}
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1.5">{t('planner.recommendationGoodForHeader', { name: top.name })}</p>
                  {top.ownedSynergyPartners.length > 0 ? (
                    <div className="space-y-1.5">
                      {top.ownedSynergyPartners.map(name => (
                        <div key={name} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                          {DEFAULT_COLLECTION_IMAGES[name] && (
                            <div className="w-8 h-8 rounded-md overflow-hidden border border-white/10 flex-shrink-0 bg-black/25">
                              <img src={DEFAULT_COLLECTION_IMAGES[name]} alt="" className="w-full h-full object-cover pointer-events-none" onError={hideOnError} />
                            </div>
                          )}
                          <span className="text-gray-300 text-sm truncate">{name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm p-2 bg-white/5 rounded-lg text-center">{t('planner.recommendationGoodForEmpty')}</p>
                  )}
                </div>
              </>
            );
          })()}
        </CardBody>
        )}
      </Card>

      {/* ── 7. Saved States ────────────────────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('saved')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('saved'); } }} aria-expanded={!collapsed.saved}>
          <CardHeader action={<>
            {state.bookmarks.length > 0 && <span className="text-cyan-400 text-sm">{state.bookmarks.length}</span>}
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.saved ? '' : 'rotate-180'}`} />
          </>}>{t('planner.savedStates')}</CardHeader>
        </div>
        {!collapsed.saved && (
        <CardBody className="space-y-2">
          {state.bookmarks.length === 0 ? (
            <p className="kuro-empty-state text-gray-400 text-base text-center py-4">{t('planner.noBookmarks')}</p>
          ) : state.bookmarks.map(b => (
            <div key={b.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
              <div>
                <div className="text-gray-200 text-base font-medium">{b.name}</div>
                <div className="text-gray-400 text-sm">{b.bannerCategory === 'featured' ? t('planner.featuredLabel') : t('planner.standardLabel')} {b.selectedBanner === 'char' ? t('planner.resonatorLabel') : b.selectedBanner === 'weap' ? t('planner.weaponLabel') : t('planner.bothLabel')} • {t('planner.astriteSuffix', { n: formatNumber(b.astrite || 0) })}{b.lustrous ? t('planner.lustrousSuffix', { n: formatNumber(b.lustrous) }) : ''}</div>
                <div className="text-gray-400 text-sm">P{b.charPity}/{b.weapPity}{b.charGuaranteed ? '(G)' : ''} • Std P{b.stdCharPity}/{b.stdWeapPity} • ×{b.charCopies}/{b.weapCopies}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => dispatch({ type: 'LOAD_BOOKMARK', id: b.id })} aria-label={t('planner.loadAriaLabel', { name: b.name })} className="px-3 py-1.5 text-sm bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 transition-colors min-h-[48px]">{t('planner.loadLabel')}</button>
                <button onClick={async () => { if (await confirm({ title: t('planner.deleteBookmarkTitle'), message: t('planner.deleteBookmarkMessage', { name: b.name }), confirmLabel: t('planner.deleteLabel'), destructive: true })) dispatch({ type: 'DELETE_BOOKMARK', id: b.id }); }} aria-label={t('planner.deleteAriaLabel', { name: b.name })} className="px-2 py-1.5 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 transition-colors min-h-[48px]">×</button>
              </div>
            </div>
          ))}
        </CardBody>
        )}
      </Card>
      {/* ── 8. Material Farming Planner ──────────────────────────────────── */}
      <Card>
        <div className="cursor-pointer" role="button" tabIndex={0} onClick={() => toggleSection('farm')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection('farm'); } }} aria-expanded={!collapsed.farm}>
          <CardHeader action={<>
            {farmTargetsState.length > 0 && <span className="text-orange-400 text-sm">{t('planner.targetsCount', { count: farmTargetsState.length, plural: farmTargetsState.length > 1 ? 's' : '' })}</span>}
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed.farm ? '' : 'rotate-180'}`} />
          </>}>{t('planner.farmingPlanner')}</CardHeader>
        </div>
        {!collapsed.farm && (
          <CardBody className="space-y-3">
            {/* Add Resonator button */}
            <button onClick={() => { setFarmPickerOpen(true); setFarmSearch(''); }} className="kuro-btn w-full active-gold" style={{ padding: '8px' }}>
              <Plus size={14} className="inline mr-1.5" />{t('planner.addResonator')}
            </button>

            {/* Resonator picker modal */}
            {farmPickerOpen && (
              <FocusTrapModal isOpen onClose={() => setFarmPickerOpen(false)} className="" onClick={() => setFarmPickerOpen(false)} centered padding="p-3">
                <div className="kuro-card w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-medium)]">
                    <h3 className="text-white text-xl font-semibold">{t('planner.selectResonator')}</h3>
                    <button onClick={() => setFarmPickerOpen(false)} className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" aria-label={t('planner.closeLabel')}><X size={16} /></button>
                  </div>
                  <div className="p-3 border-b border-[var(--border-subtle)]">
                    <div className="relative">
                      <input type="text" value={farmSearch} onChange={e => setFarmSearch(e.target.value)} placeholder={t('planner.searchResonators')} className="kuro-input w-full pl-8 text-base" aria-label={t('planner.searchResonatorsAria')} autoFocus />
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {/* sm:grid-cols-5 removed — real-viewport-based, predates
                        ScaledCanvas.jsx's engine (canvas is always phone-shaped
                        regardless of real width). Always 4 columns now. */}
                    <div className="grid grid-cols-4 gap-2">
                      {[...ALL_5STAR_RESONATORS, ...ALL_4STAR_RESONATORS].reverse()
                        .filter(n => !farmTargetsState.some(t => t.name === n))
                        .filter(n => !farmSearch || n.toLowerCase().includes(farmSearch.toLowerCase()))
                        .map(name => {
                          const cd = CHARACTER_DATA[name];
                          const img = DEFAULT_COLLECTION_IMAGES[name] || '';
                          const rarity5 = cd?.rarity === 5;
                          return (
                            <button key={name} onClick={() => { setFarmTargetsState(prev => [...prev, { name, ascension: true, skills: true, weapon: false }]); setFarmPickerOpen(false); }}
                              className={`relative rounded-lg overflow-hidden transition-all hover:scale-[1.03] active:scale-95 ${rarity5 ? 'border bg-yellow-500/10 border-yellow-500/30' : 'border bg-purple-500/10 border-purple-500/30'}`}
                              style={{ height: '96px', contain: 'paint' }}>
                              {img && <img src={img} alt={name} className="absolute inset-0 w-full h-full object-contain pointer-events-none" loading="lazy" onError={hideOnError} />}
                              <div className="absolute inset-x-0 bottom-0 h-1/2 kuro-gradient-fade-up" />
                              <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full text-2xs font-bold text-white flex items-center justify-center" style={{ background: getElementColor(cd?.element) }}>{getElementShape(cd?.element) || cd?.element?.[0]}</div>
                              <div className="absolute top-1 right-1"><Star size={8} className={rarity5 ? 'text-yellow-400' : 'text-purple-400'} fill="currentColor" /></div>
                              {cd?.role && <div className="absolute bottom-4 inset-x-0 flex justify-center"><span className="text-2xs px-1 py-0.5 rounded bg-black/60 text-gray-300 border border-[var(--border-medium)]">{cd.role}</span></div>}
                              <div className="absolute bottom-0 inset-x-0 p-1 z-10"><div className="text-white text-2xs font-medium truncate text-center leading-tight">{name}</div></div>
                            </button>
                          );
                      })}
                    </div>
                  </div>
                </div>
              </FocusTrapModal>
            )}

            {/* Farming targets — splash / buttons / resources as separate visual blocks */}
            {farmTargetsState.map((ftg, i) => {
              const d = CHARACTER_DATA[ftg.name];
              if (!d) return null;
              const elColor = d ? getElementColor(d.element) : '#9ca3af';
              const theme = CHARACTER_THEMES.find(ct => ct.name === ftg.name);
              const currentBanner = getCurrentBannerAuto().characters?.find(c => c.name === ftg.name);
              const themeArt = theme?.bannerArt || currentBanner?.imageUrl || DEFAULT_COLLECTION_IMAGES[ftg.name];
              const artPosition = theme?.pos?.header || currentBanner?.imagePosition || 'center 30%';

              // Per-character materials (shared helper — same math as the combined summary below)
              const { mats: charMats, potions: charPotions, shell: charShell } = computeFarmMaterials(ftg);
              const charMatList = Object.entries(charMats).sort((a, b) => b[1].qty - a[1].qty);
              const charPotionList = Object.entries(charPotions);
              const hasAnyToggle = ftg.ascension || ftg.skills || ftg.weapon;
              const weaponType = d.weapon;
              const localizedWeaponData = ftg.weapon ? getLocalizedWeaponData(getLocale()) : null;
              const weaponOptions = ftg.weapon
                ? Object.entries(WEAPON_DATA).filter(([, w]) => w.type === weaponType && (w.rarity === 5 || w.rarity === 4))
                    .map(([name]) => ({ name, label: localizedWeaponData[name]?.displayName || name }))
                : [];

              return (
                <div key={ftg.name} className="space-y-2">
                  {/* ── Splash banner ── */}
                  <div className="relative overflow-hidden rounded-xl" style={{ height: '96px', border: `1px solid ${elColor}40` }}>
                    {themeArt && (
                      <img src={themeArt} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" loading="lazy" onError={hideOnError}
                        style={{ opacity: 0.5, objectPosition: artPosition }} />
                    )}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,14,22,0.6) 0%, rgba(10,14,22,0.2) 50%, rgba(10,14,22,0.6) 100%)' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-bold text-2xl text-white px-4 py-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)', textShadow: `0 1px 6px rgba(0,0,0,0.5)` }}>{ftg.name}</span>
                    </div>
                    <button onClick={() => setFarmTargetsState(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 z-20 w-[30px] h-[30px] aspect-square p-0 rounded-lg bg-black/50 text-white/70 hover:text-white flex items-center justify-center transition-opacity btn-icon-square"
                      aria-label={t('planner.removeCharAria', { name: ftg.name })}><X size={12} /></button>
                  </div>

                  {/* ── Toggle buttons ── */}
                  <div className="flex gap-1.5">
                    {[['ascension', t('planner.ascension')], ['skills', t('planner.forte')], ['weapon', t('planner.weapon')]].map(([key, label]) => (
                      <button key={key} onClick={() => setFarmTargetsState(prev => prev.map((x, j) => j === i ? { ...x, [key]: !x[key] } : x))} className={`kuro-btn flex-1 text-sm ${ftg[key] ? 'active-emerald' : ''}`} style={{ padding: '8px' }}>{ftg[key] ? '✓ ' : ''}{label}</button>
                    ))}
                  </div>

                  {/* ── Weapon picker — only shown once the weapon toggle is on, defaults to the
                       character's recommended weapon but lets the player plan for any weapon of the
                       matching type instead ── */}
                  {ftg.weapon && weaponOptions.length > 0 && (
                    <KuroSelect
                      value={ftg.weaponName || d.bestWeapon || ''}
                      onChange={weaponName => setFarmTargetsState(prev => prev.map((x, j) => j === i ? { ...x, weaponName } : x))}
                      options={weaponOptions.map(({ name, label }) => ({ value: name, label }))}
                      className="w-full"
                      ariaLabel={t('planner.chooseWeaponAria', { name: ftg.name })}
                      small
                    />
                  )}

                  {/* ── Resources card ── */}
                  {hasAnyToggle && charMatList.length > 0 && (
                    <div className="p-3 rounded-lg space-y-1.5" style={{ background: 'var(--bg-stat)', border: '1px solid var(--border-hover)' }}>
                      <div className="flex items-center justify-between p-1.5 rounded bg-yellow-500/10">
                        <span className="text-yellow-400 text-sm font-medium">{t('planner.shellCredit')}</span>
                        <span className="text-yellow-400 font-bold text-sm kuro-number">{formatNumber(charShell)}</span>
                      </div>
                      {charPotionList.length > 0 && (
                        <div className="grid grid-cols-2 gap-1">
                          {charPotionList.map(([name, qty]) => {
                            const img = MATERIAL_IMAGES?.[name];
                            return (
                              <div key={name} className="flex items-center gap-1.5 p-1.5 rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                                {img && <img src={img} alt="" className="w-6 h-6 rounded flex-shrink-0" onError={hideOnError} />}
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text-heading)' }}>{name}</div>
                                </div>
                                <span className="text-cyan-400 font-bold kuro-number text-xs flex-shrink-0">×{formatNumber(qty)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-1">
                        {charMatList.map(([name, { qty, img }]) => (
                          <div key={name} className="flex items-center gap-1.5 p-1.5 rounded" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                            {img && <img src={img} alt="" className="w-6 h-6 rounded flex-shrink-0" onError={hideOnError} />}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate" style={{ color: 'var(--text-heading)' }}>{name}</div>
                            </div>
                            <span className="text-orange-400 font-bold kuro-number text-xs flex-shrink-0">×{qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Combined materials-owned tracker. Triggers for any non-empty target list (not just
                length > 1) — a single-character plan needs "already own" tracking just as much as a
                multi-character one; only the shell/potion summary blocks are skipped for a single
                target since the per-character card above already shows those, and repeating them
                here would just be a duplicate. */}
            {farmTargetsState.length > 0 && (() => {
              const mats = {};
              const potions = {};
              let totalShell = 0;
              farmTargetsState.forEach(ftg => {
                const r = computeFarmMaterials(ftg);
                totalShell += r.shell;
                for (const [name, { qty, img }] of Object.entries(r.mats)) {
                  if (!mats[name]) mats[name] = { qty: 0, img };
                  mats[name].qty += qty;
                }
                for (const [name, qty] of Object.entries(r.potions)) {
                  potions[name] = (potions[name] || 0) + qty;
                }
              });
              if (Object.keys(mats).length === 0) return null;
              const matList = Object.entries(mats).sort((a, b) => b[1].qty - a[1].qty);
              const potionList = Object.entries(potions);
              const isMulti = farmTargetsState.length > 1;
              return (
                <>
                  <div className="kuro-label mt-2">{isMulti ? t('planner.combinedTotal', { count: farmTargetsState.length, plural: farmTargetsState.length > 1 ? 's' : '' }) : t('planner.remainingLabel')}</div>
                  {isMulti && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 text-base font-medium">{t('planner.shellCredit')}</span>
                        <span className="text-yellow-400 font-bold text-lg kuro-number">{formatNumber(totalShell)}</span>
                      </div>
                    </div>
                  )}
                  {isMulti && potionList.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {potionList.map(([name, qty]) => {
                        const img = MATERIAL_IMAGES?.[name];
                        return (
                          <div key={name} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                            {img && <img src={img} alt="" className="w-7 h-7 rounded flex-shrink-0" onError={hideOnError} />}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>{name}</div>
                            </div>
                            <span className="text-cyan-400 font-bold kuro-number text-base flex-shrink-0">×{formatNumber(qty)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="text-2xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{t('planner.remainingHint')}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {matList.map(([name, { qty, img }]) => {
                      const owned = ownedMats[name] || 0;
                      const remaining = Math.max(0, qty - owned);
                      return (
                        <div key={name} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                          {img && <img src={img} alt="" className="w-7 h-7 rounded flex-shrink-0" onError={hideOnError} />}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>{name}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-2xs" style={{ color: 'var(--text-muted)' }}>{t('planner.ownedLabel')}</span>
                              <input
                                type="number"
                                min="0"
                                value={owned || ''}
                                placeholder="0"
                                onChange={e => {
                                  const v = Math.max(0, parseInt(e.target.value, 10) || 0);
                                  setOwnedMats(prev => v === 0 ? (({ [name]: _, ...rest }) => rest)(prev) : { ...prev, [name]: v });
                                }}
                                className="kuro-input text-2xs w-14 px-1 py-0.5"
                                aria-label={t('planner.ownedAria', { name })}
                              />
                            </div>
                          </div>
                          <span className="text-orange-400 font-bold kuro-number text-base flex-shrink-0">×{formatNumber(remaining)}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* Empty state */}
            {farmTargetsState.length === 0 && (
              <div className="kuro-empty-state text-center py-6">
                <div className="text-center py-6" style={{ color: 'var(--text-muted)' }}>{t('planner.awaitingFarming')}</div>
                <p style={{ color: 'var(--text-disabled)', fontSize: 'var(--font-sm)', marginTop: '4px' }}>{t('planner.selectResonatorsHint')}</p>
              </div>
            )}
          </CardBody>
        )}
      </Card>
      {/* ── 9. Echo Farming Calculator ───────────────────────────────────── */}
      <EchoFarmPlanner />
    </div>
    </TabErrorBoundary>
    </div>
  );
}

export default React.memo(PlannerTab, (prev, next) =>
  prev.state.calc === next.state.calc && prev.state.planner === next.state.planner &&
  prev.state.eventStatus === next.state.eventStatus && prev.state.bookmarks === next.state.bookmarks &&
  prev.activeBanners === next.activeBanners && prev.bannerEndDate === next.bannerEndDate
);
