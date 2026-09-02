// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/skillMultiplierParser.js
// Parses SKILL_MULTIPLIERS' existing percent-string format (e.g. '28.81% → 33.82%×2 → 13.99%×7 →
// 75.16%') into a real hit array — no new numbers invented, purely re-expressing characters.js's
// already-audited strings as structured data. This is the data prerequisite the
// "totalMult → hit-composed DPS" design doc (PHASE2_PLAN.md) names as step 1: a real damage number
// has to live SOMEWHERE on a TriggerBlock before any hit-composed calculation is possible.
//
// Deliberately narrow: only handles the "N%" / "N%×M" token shapes separated by '→' or '+', which
// covers the common case (a single skill's own multi-hit combo, e.g. Yinlin's 4-stage Basic ATK).
// A row combining TWO DIFFERENT SKILLS in one string via '→' (e.g. Yinlin's 'Magnetic Roar →
// Lightning Execution: 59.65%×3 → 89.47%×4') is NOT something this parser can tell apart from a
// multi-STAGE single skill — that judgment call needs a human reading the kit text, same as every
// other per-character interpretation already made throughout this schema (e.g. Camellya's S5 split).
// This parser is a building block for populating a block's `damage.hits`, not a drop-in "run it over
// the whole SKILL_MULTIPLIERS table" migration.
//
// A single flat (non-%) number is also accepted as a SEPARATE optional 2nd argument (Phase 0.5 gap
// #8, added 2026-09-02) — not auto-detected from the string, since a bare number in these source rows
// has no reliable, unambiguous shape to regex for safely. Callers with a real "N flat + M% ATK" kit
// text (e.g. Buling's Twin Thunders) pass the flat number explicitly, applied to the FIRST parsed hit
// only (the common real-game shape: one hit carries both components, not one flat number spread
// across a multi-hit combo).
// ═══════════════════════════════════════════════════════════════════════════════

const TOKEN_RE = /(\d+(?:\.\d+)?)%(?:×(\d+))?/g;

/**
 * @param {string} str  A SKILL_MULTIPLIERS-style percent string, e.g. '33.82%×2'.
 * @param {number} [flat]  A flat (non-%ATK) damage component to attach to the first parsed hit, e.g.
 *                          Buling's "169 flat + 18.30% ATK" → `parseSkillMultiplierHits('18.30%', 169)`.
 * @returns {{atkPct: number, flat?: number}[]} One entry per individual hit (a '×N' token expands to
 *   N entries).
 */
export function parseSkillMultiplierHits(str, flat) {
  const hits = [];
  for (const m of str.matchAll(TOKEN_RE)) {
    const pct = parseFloat(m[1]);
    const count = m[2] ? parseInt(m[2], 10) : 1;
    for (let i = 0; i < count; i++) hits.push({ atkPct: pct });
  }
  if (flat != null && hits.length > 0) hits[0].flat = flat;
  return hits;
}

/** Sum of every hit's %ATK — the same total a naive "add up the row" reading would give, useful for
 *  cross-checking a parsed result against the source string by eye. */
export function sumHitsAtkPct(hits) {
  return hits.reduce((s, h) => s + h.atkPct, 0);
}
