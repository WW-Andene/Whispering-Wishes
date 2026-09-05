// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/math/hitParser.js
// [MATH · HIT-PARSER] Parses a kit-text-sourced percent string (e.g.
// '28.81% → 33.82%×2 → 13.99%×7 → 75.16%') into a real per-hit array — no new
// numbers invented, purely re-expressing an already-audited string as structured
// data for a TriggerBlock's `damage.hits` / `Proc`.
//
// Deliberately narrow: only handles "N%" / "N%×M" tokens separated by '→' or '+',
// covering the common case (one skill's own multi-hit combo). A row combining TWO
// DIFFERENT SKILLS in one string is NOT something this parser can tell apart from a
// multi-stage single skill — that judgment call needs a human reading the kit text.
//
// Layer: 2 (shared math primitives), engine rewrite. Formerly
// engine/shared/skillMultiplierParser.js.
// ═══════════════════════════════════════════════════════════════════════════════

const HIT_TOKEN_PATTERN = /(\d+(?:\.\d+)?)%(?:×(\d+))?/g;

/**
 * [LOGIC · PARSE-HITS] Expands a percent-string into one entry per individual hit — a
 * source row's `×N` shorthand becomes N separate entries, not one entry with a multiplier field.
 * @param {string} str  A kit-text-style percent string, e.g. '33.82%×2'.
 * @param {number} [flat]  A flat (non-%ATK) damage component some kit text carries alongside the
 *   %ATK term (e.g. Buling's "169 flat + 18.30% ATK" → `parseSkillMultiplierHits('18.30%', 169)`).
 *   Applied to the FIRST parsed hit only — the common real-game shape.
 * @returns {{atkPct: number, flat?: number}[]}
 */
export function parseSkillMultiplierHits(str, flat) {
  const hits = [];
  for (const m of str.matchAll(HIT_TOKEN_PATTERN)) {
    const pct = parseFloat(m[1]);
    const count = m[2] ? parseInt(m[2], 10) : 1;
    for (let i = 0; i < count; i++) hits.push({ atkPct: pct });
  }
  if (flat != null && hits.length > 0) hits[0].flat = flat;
  return hits;
}

/**
 * [LOGIC · SUM-HITS] Sum of every hit's %ATK — useful for cross-checking a parsed result
 * against its source string by eye.
 * @param {{atkPct: number}[]} hits
 */
export function sumHitsAtkPct(hits) {
  return hits.reduce((s, h) => s + h.atkPct, 0);
}

/**
 * [LOGIC · PARSE-HEAL-HITS] Same expansion as parseSkillMultiplierHits, for a `kind:'heal'`
 * block's `heal.hits` — a separate function (not a reused import) purely so the field is named
 * `pct` rather than `atkPct`, since a heal's real basis is usually HP, not ATK (see
 * block.schema.js's Heal typedef for why the field name matters here).
 * @param {string} str  A kit-text-style percent string, e.g. '2.4%×3'.
 * @param {number} [flat]  A flat, non-%-scaling heal component alongside the % term.
 * @returns {{pct: number, flat?: number}[]}
 */
export function parseHealHits(str, flat) {
  const hits = [];
  for (const m of str.matchAll(HIT_TOKEN_PATTERN)) {
    const pct = parseFloat(m[1]);
    const count = m[2] ? parseInt(m[2], 10) : 1;
    for (let i = 0; i < count; i++) hits.push({ pct });
  }
  if (flat != null && hits.length > 0) hits[0].flat = flat;
  return hits;
}
