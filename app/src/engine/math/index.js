// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/math/index.js
// [MATH] Single import point for the engine's shared math/parsing primitives.
// Layer 2 of the engine rewrite: damageFormula (the WuWa combat formula itself),
// moveTypeRouting (per-move-type %DMG-bonus collapsing), roleMatch (role-string
// matching), hitParser (kit-text percent-string → structured hit array).
// ═══════════════════════════════════════════════════════════════════════════════

export {
  ATTACKER_LEVEL, ATTACKER_FACTOR, BASE_CRIT_RATE, BASE_CRIT_DMG,
  calcDefMult, calcResMult, calcAvgCrit, calcDmgBonus,
} from './damageFormula.js';

export {
  NO_FOCUS_FALLBACK_BASIC_ATK_CREDIT, NO_FOCUS_FALLBACK_HEAVY_ATK_CREDIT, NO_FOCUS_FALLBACK_LIBERATION_CREDIT,
  collapseDmgTypeBuckets,
} from './moveTypeRouting.js';

export { isHealerRole, isSupportRole } from './roleMatch.js';

export { parseSkillMultiplierHits, sumHitsAtkPct } from './hitParser.js';
