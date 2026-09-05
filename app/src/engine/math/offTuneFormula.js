// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/math/offTuneFormula.js
// [MATH · OFF-TUNE] Real, sourced Off-Tune gauge contribution per action TYPE — see
// `Data dump/Mechanic/damage-and-tune-mechanics.md` §2a for the full sourcing.
//
// The source gives RANGES per action type (a gauge out of 100 points), not exact
// per-character-per-move values — e.g. "Liberation: 40-50", not "Aalto's Flower in
// the Mist: 47". SECTION_OFF_TUNE_RANGES below is keyed off the SAME `section` field
// every TriggerBlock already carries (BasicATK/HeavyATK/Skill/Liberation/Forte/Intro/
// Echo — Outro/Chain/Buff blocks don't represent a real in-combat cast, so they're
// not included), so no new per-block data is needed to apply this.
//
// OFF_TUNE_VALUE_BY_SECTION picks the RANGE MIDPOINT as the single value used to
// compute a real number — an explicit, documented approximation (never claim this is
// as precise as a real per-move-per-hit value).
//
// 2026-09-06: briefly "fixed" to apply per real damage-sub-hit for EVERY section, then
// corrected back by a direct user clarification: the "hit" the source's own chart means
// is the real ACTION/cast itself (one Liberation button-press = one Off-Tune tick), NOT
// however many %ATK sub-segments that one cast's own damage formula happens to split
// into for damage-calculation purposes (e.g. a Liberation written as "50%×4+30%" for
// damage math is still ONE real action worth ONE base value, not 4). Basic Attack is the
// one real exception — its own combo genuinely consists of separate real swings, matching
// the source's own explicit "per hit in a combo" wording for that category specifically,
// no other category gets that same qualifier. So: BasicATK scales by its real combo hit
// count; every other section fires ONCE per cast, regardless of its own internal %ATK
// segment count.
// ═══════════════════════════════════════════════════════════════════════════════

export const SECTION_OFF_TUNE_RANGES = {
  Liberation: { min: 40, max: 50 },
  Intro: { min: 15, max: 20 },
  Forte: { min: 15, max: 25 },
  Skill: { min: 8, max: 12 },
  HeavyATK: { min: 4, max: 6 },
  BasicATK: { min: 1, max: 3 },
  Echo: { min: 0, max: 0 },
};

function midpoint(range) {
  return (range.min + range.max) / 2;
}

export const OFF_TUNE_VALUE_BY_SECTION = Object.fromEntries(
  Object.entries(SECTION_OFF_TUNE_RANGES).map(([section, range]) => [section, midpoint(range)])
);

// Real, sourced enemy-side gauge totals — see the Mechanic doc's own table.
export const ENEMY_OFF_TUNE_GAUGE = {
  mob: { min: 30, max: 50 },
  elite: { min: 100, max: 100 },
  boss: { min: 200, max: 200 },
};

/**
 * [FORMULA · OFF-TUNE] Real Off-Tune points a single block contributes when it fires, per the
 * sourced section-range midpoints. BasicATK is applied PER REAL HIT (`damage.hits.length` — the
 * source's own "per hit in a combo" qualifier, unique to that category); every other section
 * fires ONCE per cast, regardless of its own internal %ATK sub-hit count (corrected 2026-09-06 —
 * see file header for the direct user correction this reverts a brief over-generalization of).
 * `damage.category === 'coordDmg'` (Coordinated Attack) always contributes 0 regardless of
 * section, per the source's own "most Coordinated Attacks: 0" rule.
 * @param {import('../schema/block.schema.js').TriggerBlock} block
 * @returns {number}
 */
export function offTuneValueForBlock(block) {
  if (block.damage?.category === 'coordDmg') return 0;
  const perCastValue = OFF_TUNE_VALUE_BY_SECTION[block.section];
  if (perCastValue == null) return 0; // Outro/Chain/Buff/utility — not a real in-combat cast
  if (block.section === 'BasicATK' && block.damage?.hits?.length) {
    return perCastValue * block.damage.hits.length; // "per hit in a combo" — real exception
  }
  return perCastValue;
}
