// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/dot/dotFormulas.js
// [RESOLVER · DOT] Pure DOT-reaction formulas (Frazzle/Erosion/Fusion Burst/Electro Flare).
// Tune Break/Off-Tune was removed from the calculator (2026-09-05) — see the note below
// calcElectroFlareDmg for why.
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

import { CHAR_BUFF_TABLE } from '../../../data/characters.js';

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

// Tune Break/Off-Tune removed from the calculator (2026-09-05, direct user instruction): its
// buffs (Tune Rupture/Tune Strain multipliers) are real, sourced kit values, but they only ever
// fire by first assuming a Tune Break detonation FREQUENCY — how many times per rotation the
// enemy's Off-Tune gauge fills and breaks — which has no sourced number behind it anywhere. That
// fabricated frequency was scaling even the real buffs, making the whole mechanic uncalculable.
// Fusion Burst (calcFusionBurstDmg above) is unaffected — its trigger is a concrete, sourced
// stack/threshold system (cap, break threshold, per-target ICD), not a guessed fill rate.
