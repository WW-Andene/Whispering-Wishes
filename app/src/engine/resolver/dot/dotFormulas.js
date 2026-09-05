// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dot/dotFormulas.js
// [RESOLVER · DOT] Pure DOT-reaction formulas (Frazzle/Erosion/Fusion Burst/Electro Flare/Tune Break).
//
// Engine-merge Stage 1 (2026-09-04, see ENGINE_MERGE_INVESTIGATION.md §2a/§5#1/§6 Stage 2):
// relocates the rotation-aggregate DOT/Tune-Break primitives OUT of the legacy
// features/teams/calcEngine.js file and into the modern engine tree, since they are NOT
// legacy-only math — engine/dot/dotReactions.js already applies every one of these functions'
// output on top of BOTH the legacy RAW-tier total AND the modern resolveHitComposedTeamDps
// FULL-tier total (calcTeamStats.js calls resolveDotReactionDps() unconditionally, outside
// the `allMembersConverted` branch — see calcTeamStats.js:1118). So this was already a shared
// primitive in practice; it just lived in the wrong file. This move is a pure relocation —
// byte-identical formulas, byte-identical constants, zero numeric change. calcEngine.js keeps
// re-exporting these names (`export { ... } from '../engine/dot/dotFormulas.js'`) so every existing
// caller (tests included) keeps working unchanged; new modern-engine code should import
// directly from here instead.
//
// Frazzle/Erosion/Fusion Burst/Electro Flare all have a real dotApplier-tagged TriggerBlock
// anchor and could in principle be ported to true per-hit triggers later — they stay here for
// now alongside Tune Break (which has no per-hit anchor at all, see the module doc above) so all
// five rotation-aggregate DOT mechanics have one shared home rather than being split arbitrarily.
// ═══════════════════════════════════════════════════════════════════════════════

import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS } from '../../../data/characters.js';
import { resolveOffTuneGenerated } from '../dps/resolveOffTune.js';
import { ENEMY_OFF_TUNE_GAUGE } from '../../math/offTuneFormula.js';

// ── Constants (named, not magic) ──
export const DOT_LEVEL_MULT = 3674;   // Level 90 character level multiplier
export const DOT_BASE_FACTOR = 1.25078; // Base damage coefficient for DOT ticks

// DOT mechanic constants (extracted from inline magic numbers)
export const FRAZZLE_TICK_INTERVAL = 3;    // Frazzle ticks every 3s, consumes 1 stack
export const FRAZZLE_ICD_PER_SOURCE = 2.5; // Application ICD per source (seconds)
// the wiki "Negative Status" page: DMG ticks every 3s for both Frazzle and Erosion — the 15s figure
// for Erosion is how often its stacks decay, not the tick rate (was wrongly used as tick interval).
export const EROSION_TICK_INTERVAL = 3;    // Erosion ticks every 3s, does NOT consume stacks
export const EROSION_DURATION = 15;        // Erosion debuff duration (seconds)
// Stack multiplier tables straight from the the wiki "Negative Status" page (Base DMG = Level Mult ×
// 1.25078 × Stack Mult). These are non-linear, not a flat per-stack multiplier — index = stack count.
export const FRAZZLE_STACK_TABLE = [0, 0.240, 0.4355, 0.6298, 0.8251, 1.020, 1.216, 1.409, 1.605, 1.800, 1.995];
export const EROSION_STACK_TABLE = [0, 0.360, 0.899, 1.799, 2.698, 3.597, 4.497]; // stacks >3 need Aero Rover Outro
// Linear extrapolation beyond the wiki's tabulated stack range, using the slope of the last two entries.
function lookupStackMult(table, stacks) {
  if (stacks <= 0) return 0;
  if (stacks < table.length) return table[stacks];
  const last = table[table.length - 1];
  const slope = last - table[table.length - 2];
  return last + (stacks - (table.length - 1)) * slope;
}
export const FUSION_BURST_THRESHOLD = 10;  // Stacks needed to detonate
export const FUSION_BURST_APP_ICD = 1;     // Application ICD (seconds)
export const FUSION_TRAIL_MULT = 3.0;      // Fusion Trail damage multiplier
export const FLARE_TICK_INTERVAL = 4;      // Electro Flare tick interval (seconds)
export const FLARE_STACK_MULT = 0.12;      // DMG multiplier per Flare stack
export const TUNE_BREAK_BASE_DMG = 5000;   // Base Tune Break damage

// ── DOT damage calculations (ICD-aware) ──
export function calcFrazzleDmg(members, rotTime, defMult, resMult) {
  const appliers = members.filter(m => CHAR_BUFF_TABLE[m.name]?.debuffs?.some(db => db.stat === 'frazzle'));
  if (!appliers.length) return { dmg: 0, active: false };
  const numSources = appliers.length;
  const effectiveRate = numSources / FRAZZLE_ICD_PER_SOURCE;
  const maxStacksRaw = appliers.reduce((s, m) => {
    const fd = CHAR_BUFF_TABLE[m.name]?.debuffs?.find(db => db.stat === 'frazzle');
    return s + (fd?.value || 10);
  }, 0);
  const stacks = Math.min(maxStacksRaw, Math.floor(effectiveRate * rotTime));
  const numTicks = Math.min(Math.floor(rotTime / FRAZZLE_TICK_INTERVAL), stacks);
  let total = 0;
  for (let s = stacks; s > stacks - numTicks && s > 0; s--) {
    total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * lookupStackMult(FRAZZLE_STACK_TABLE, s);
  }
  const hasPhoebe = members.some(m => m.name === 'Phoebe');
  return { dmg: total * (hasPhoebe ? 2.0 : 1.0) * defMult * resMult, active: true };
}

export function calcErosionDmg(members, rotTime, defMult, resMult) {
  const appliers = members.filter(m => CHAR_BUFF_TABLE[m.name]?.debuffs?.some(db => db.stat === 'erosion'));
  if (!appliers.length) return { dmg: 0, active: false };
  const baseStacks = appliers.reduce((s, m) => {
    const ed = CHAR_BUFF_TABLE[m.name]?.debuffs?.find(db => db.stat === 'erosion');
    return Math.max(s, ed?.value || 3);
  }, 3);
  const uptime = Math.min(1, EROSION_DURATION / rotTime);
  const ticks = Math.floor(EROSION_DURATION / EROSION_TICK_INTERVAL);
  let total = 0;
  for (let t = 0; t < ticks; t++) total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * lookupStackMult(EROSION_STACK_TABLE, baseStacks);
  return { dmg: total * uptime * defMult * resMult, active: true };
}

// Fusion Burst's stack-DMG table isn't published on the wiki (only Frazzle/Erosion are); this stays
// a rough approximation rather than a verified lookup like the two above.
//
// excludeNames (added 2026-09-02, the engine-architecture history (git log) item 9 — Aemeath's mode-exclusivity fix):
// lets a caller ask "would this reaction still be active WITHOUT member X's participation" — needed
// for a member whose own `debuffs.fusionBurst` entry is mode-conditional (Aemeath only inflicts real
// Fusion Burst status while in Fusion Burst mode; her Tune Rupture mode instead grants her the
// separate Starburst tuneBreak proc, mutually exclusive with this reaction — see her own
// tuneBreak.competesWithFusionBurstReaction comment in characters.js). Doesn't change the formula
// itself, only who counts toward the `has` gate — every existing caller (empty default) is unaffected.
export function calcFusionBurstDmg(members, rotTime, defMult, resMult, excludeNames = []) {
  const has = members.some(m => !excludeNames.includes(m.name) && CHAR_BUFF_TABLE[m.name]?.debuffs?.some(db => db.stat === 'fusionBurst'));
  if (!has) return { dmg: 0, active: false };
  const explosions = Math.max(1, Math.floor(rotTime / Math.max(FUSION_BURST_THRESHOLD, 8)));
  const dmg = DOT_LEVEL_MULT * DOT_BASE_FACTOR * (FUSION_BURST_THRESHOLD * 0.5) * FUSION_TRAIL_MULT;
  return { dmg: dmg * explosions * defMult * resMult, active: true };
}

// Electro Flare's DMG-per-stack table also isn't published (wiki only documents its old ATK-reduction
// values); stack halving on tick is confirmed by the wiki, the tick interval/mult stay approximations.
export function calcElectroFlareDmg(members, rotTime, defMult, resMult) {
  const has = members.some(m => CHAR_BUFF_TABLE[m.name]?.electroFlare);
  if (!has) return { dmg: 0, active: false };
  const ticks = Math.min(4, Math.floor(rotTime / FLARE_TICK_INTERVAL));
  let total = 0, stacks = 10;
  for (let t = 0; t < ticks; t++) {
    total += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (stacks * FLARE_STACK_MULT);
    stacks = Math.ceil(stacks / 2);
  }
  return { dmg: total * defMult * resMult, active: true };
}

// Tune Break is a bespoke per-character mechanic (Off-Tune Level/Mistune, unique Tune Strain/Tune
// Rupture/Hack response skills per wiki) with no generic formula published — this stays a generic
// stack/boost approximation driven entirely by CHAR_BUFF_TABLE[name].tuneBreak fields; accuracy
// depends on those per-character values being filled in correctly (tracked separately).
//
// modeExclusive (added 2026-09-02, the engine-architecture history (git log) item 9): a real bug found while auditing
// Lynae's dual-mode tagging — her OWN tuneBreak object carries BOTH ruptureDmgMult (Tune Rupture
// Response - Spectral Analysis, her Rupture-mode-only proc) AND strainDmgPerStack/maxStrainStacks
// (her Strain-mode-only per-stack response), but her real Resonance Mode is mutually exclusive — she
// can never have both active on the same run. Every OTHER tbMember with strain/rupture fields
// (currently only Mornye) is a genuine generic RESPONDER, not a mode-locked applier: her own
// ruptureDmgMult/strainDmgPerStack fire off whichever Interfered TYPE the team's actual appliers
// produce, so both CAN legitimately coexist for her (e.g. a team with both a Rupture and a Strain
// applier) — nothing to fix there. `modeExclusive: true` marks a character whose OWN rupture/strain
// contributions must be resolved to exactly one, and this function no longer folds their contribution
// into the unconditional `dmg`/`deepenMult` totals — instead it's returned as `exclusiveCandidates`
// for the caller to resolve by comparing REAL final totals (see calcTeamStats.js's own resolution
// right after `grandTotal` is known), not a fabricated unit conversion between flat DOT damage and a
// multiplicative deepen (the two are not comparable in isolation — see this session's own
// investigation into why a context-free comparator can't do this honestly).
//
// This is the engine's rotation-aggregate-rate DOT model for Tune Break/Hack Response (Rebecca's
// Meltdown, Lynae's Spectral Analysis, Lucy's Data Crash, Aemeath's Starburst, Denia, Mornye, Luuk
// Herssen, plus base Tune Break application itself — ~9 characters, see ENGINE_MERGE_INVESTIGATION.md
// §2a). It has no per-hit trigger anchor (unlike Frazzle/Erosion/Fusion Burst/Electro Flare, each of
// which has a real dotApplier-tagged block a per-hit engine could hang a trigger on) — it's a
// rotation-average heuristic by design, not an event. engine/dot/dotReactions.js folds its output into
// BOTH the legacy RAW total and the modern resolveHitComposedTeamDps FULL total identically (see
// calcTeamStats.js:1118-1124), so every converted character's Tune Break contribution already comes
// from the SAME code whether or not their own kit is otherwise legacy- or modern-computed — this
// relocation just moves that shared code out of the legacy file it used to live in.
export function calcTuneBreakDmg(members, rotTime, defMult, resMult, energyCycleFactors, blocksByOwner = null) {
  const tbMembers = members.filter(m => CHAR_BUFF_TABLE[m.name]?.tuneBreak);

  // breaksPerRot (real, 2026-09-06): how many times the enemy's own Off-Tune gauge actually fills
  // within this rotation — direct user instruction: "when it's automatic, trigger when gauge is
  // full, when it's not automatic trigger on the rotation optimal window/character... in the end
  // it's a DPS question as always." This calculator already assumes optimal play everywhere else
  // (perfect timing, perfect uptime), so the automatic-vs-manual-F-press distinction converges to
  // the SAME math either way: an optimal player presses F the instant the gauge is full, same as
  // an automatic mob's instant break. Every enemy selectable in this app (`enemyEcho`) is boss/
  // Overlord-tier anyway — echoes only drop from that tier — so `ENEMY_OFF_TUNE_GAUGE.boss` (200,
  // the sourced fixed total, see offTuneFormula.js) is the correct gauge size unconditionally, no
  // per-target classification needed.
  //
  // UNIVERSAL GATE FIX (real bug, direct user correction, 2026-09-06): "tune break is universal
  // (when off tune gauge is full and you break it). what is not universal is Tune Rupture and Tune
  // Strain." The base Tune Break burst below is NOT restricted to `tuneBreak`-flagged specialist
  // characters — ANY team's real hits fill the shared Off-Tune gauge and eventually break it, the
  // exact same way Frazzle/Erosion apply for any team with a real applier, no character-specific
  // gate. The previous version returned `{dmg:0}` outright whenever `tbMembers` was empty — a real,
  // roster-wide gap: any team without one of the ~9 Rupture/Strain specialists got ZERO Tune Break
  // damage, when it should have gotten the universal base burst regardless. Real total is now
  // summed over EVERY team member (not just tbMembers) — every character's own real hits
  // contribute to the SAME shared gauge (resolveOffTuneGenerated, built earlier this session). Only
  // the Rupture/Strain BONUS layer below (ruptureDmgMult/strainDmgPerStack) stays gated on a real
  // specialist being present — that part genuinely is character-specific.
  //
  // A steady-state RATE (can be fractional, e.g. 1.5), not an integer count — same "fraction of a
  // cooldown actually sustainable" convention already used elsewhere in this engine
  // (resolveHitComposedDps.js's own cooldownSteadyState gate) rather than an artificial floor/cap.
  //
  // Falls back to the old flat heuristic (still specialist-gated — there's no real data to derive a
  // universal rate from) only when blocksByOwner isn't supplied at all (a caller that genuinely
  // can't provide real blocks — e.g. a mixed/legacy-only team, or this file's own older tests).
  let breaksPerRot;
  if (blocksByOwner) {
    const totalOffTunePerRot = members.reduce((sum, m) => {
      const blocks = blocksByOwner[m.name];
      const rotation = CHARACTER_ROTATIONS[m.name];
      if (!blocks || !rotation) return sum;
      return sum + resolveOffTuneGenerated(blocks, rotation).total;
    }, 0);
    breaksPerRot = totalOffTunePerRot / ENEMY_OFF_TUNE_GAUGE.boss.max;
  } else if (tbMembers.length) {
    const hasAccel = tbMembers.some(m => CHAR_BUFF_TABLE[m.name].tuneBreak.boostToTeam > 20);
    breaksPerRot = hasAccel ? Math.min(2, Math.max(1, Math.floor(rotTime / 12))) : 1;
  } else {
    return { dmg: 0, deepenMult: 1, exclusiveCandidates: [] };
  }
  if (breaksPerRot <= 0) return { dmg: 0, deepenMult: 1, exclusiveCandidates: [] };

  let totalBoost = 0;
  tbMembers.forEach(m => {
    const tb = CHAR_BUFF_TABLE[m.name].tuneBreak;
    totalBoost += (tb.baseTuneBreakBoost || 0) + (tb.boostToTeam || 0);
  });

  const uptimeFactor = rotTime > 0 ? Math.min(1, (8 * breaksPerRot) / rotTime) : 0;
  let dmg = TUNE_BREAK_BASE_DMG * (1 + totalBoost * 0.01) * breaksPerRot * defMult;

  const sharedMembers = tbMembers.filter(m => !CHAR_BUFF_TABLE[m.name].tuneBreak.modeExclusive);
  sharedMembers.forEach(m => {
    const tb = CHAR_BUFF_TABLE[m.name].tuneBreak;
    if (tb.ruptureDmgMult) {
      // (1 + totalBoost * 0.01) added 2026-09-06 — real, sourced formula (user-provided, matching
      // the Mechanic doc's own §2d "NEEDS SOURCE" flag): "degat de rupture = multiplicateur du
      // resonator (Tune AMP) x (1 + Tune Break Boost)". `ruptureDmgMult` IS the resonator's own Tune
      // AMP (e.g. Aemeath's 596.43%, sourced from her kit's Tune Rupture Response text); totalBoost
      // (already computed above from real baseTuneBreakBoost/boostToTeam data) was previously only
      // applied to the base Tune Break DMG term and to Strain's own term, never to Rupture's — this
      // was the exact open discrepancy the Mechanic doc flagged, now closed. Same 0.01 scaling
      // convention the base-DMG term above already uses (totalBoost stored as whole points, e.g. 40
      // for "+40 Tune Break Boost", not a pre-divided fraction).
      dmg += DOT_LEVEL_MULT * DOT_BASE_FACTOR * (tb.ruptureDmgMult / 100) * (1 + totalBoost * 0.01) * breaksPerRot * defMult * resMult;
    }
  });

  let deepenMult = 1;
  const mornyeMem = tbMembers.find(m => CHAR_BUFF_TABLE[m.name].tuneBreak.interferedDmgAmp);
  if (mornyeMem) {
    // interferedDmgAmp is the CAP (e.g. Mornye: up to 40% at 260%+ ER), not a flat value — the wiki-
    // documented rate is 0.25% amp per 1% Energy Regen over 100%. Scale by her real equipped ER
    // (from calcEnergyCycles) instead of always applying the max, which overstated DPS for any
    // non-ER-built Mornye.
    const ampCap = CHAR_BUFF_TABLE[mornyeMem.name].tuneBreak.interferedDmgAmp;
    const totalER = energyCycleFactors?.[mornyeMem.name]?.totalER ?? (100 + ampCap / 0.25);
    const amp = Math.min(ampCap, Math.max(0, totalER - 100) * 0.25);
    deepenMult *= 1 + (amp / 100) * uptimeFactor;
  }
  const sharedMaxStrain = Math.max(0, ...sharedMembers.map(m => CHAR_BUFF_TABLE[m.name].tuneBreak.maxStrainStacks || 0));
  if (sharedMaxStrain > 0 && totalBoost > 0) {
    // Read each character's own strainDmgPerStack rather than assuming the 0.12 every current
    // Tune Strain character happens to share — a future character with a different rate would
    // otherwise silently get the wrong value.
    const strainRateMember = sharedMembers.find(m => CHAR_BUFF_TABLE[m.name].tuneBreak.strainDmgPerStack != null);
    const strainDmgPerStack = strainRateMember ? CHAR_BUFF_TABLE[strainRateMember.name].tuneBreak.strainDmgPerStack : 0.12;
    const strainPct = sharedMaxStrain * totalBoost * strainDmgPerStack;
    deepenMult *= 1 + (strainPct / 100) * uptimeFactor;
  }

  // Mode-exclusive members: compute each one's OWN Rupture-only and Strain-only deltas in isolation
  // (their own contribution alone, on top of the shared/generic totalBoost every tbMember feeds),
  // for the caller to pick between using real final totals.
  const exclusiveMembers = tbMembers.filter(m => CHAR_BUFF_TABLE[m.name].tuneBreak.modeExclusive);
  const exclusiveCandidates = exclusiveMembers.map(m => {
    const tb = CHAR_BUFF_TABLE[m.name].tuneBreak;
    // (1 + totalBoost * 0.01) — see the shared-members loop's own comment above for the full
    // rationale; same real formula applies to a mode-exclusive candidate's own Rupture delta.
    const ruptureDmgDelta = tb.ruptureDmgMult
      ? DOT_LEVEL_MULT * DOT_BASE_FACTOR * (tb.ruptureDmgMult / 100) * (1 + totalBoost * 0.01) * breaksPerRot * defMult * resMult
      : 0;
    const strainDeepenDelta = (tb.maxStrainStacks && tb.strainDmgPerStack && totalBoost > 0)
      ? (tb.maxStrainStacks * totalBoost * tb.strainDmgPerStack / 100) * uptimeFactor
      : 0;
    return { name: m.name, ruptureDmgDelta, strainDeepenDelta };
  });

  return { dmg, deepenMult, exclusiveCandidates };
}
