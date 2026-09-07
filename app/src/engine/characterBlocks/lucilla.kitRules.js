// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/characterBlocks/lucilla.kitRules.js
// [DECISION · Lucilla] ADAPTIVE_ENGINE_DESIGN.md decision-layer pilot #2 (after Hiyuki) — a real
// state machine + priority-list rule set deriving her rotation from her own Trace/Photo resource
// chain, replacing CHARACTER_ROTATIONS['Lucilla'] as the SOURCE of her damage-relevant steps.
// Every cap/gain below is sourced verbatim from Data dump/Lucilla/Lucilla.md's own "Forte Circuit —
// Memory Palace / Tune Break: Rectifier" section (line 86-90):
//   Trace (cap 150): +100 on Intro (Clip It), +50 on a perfect Spotlight release, +50 on Basic
//     Stage 3 - Commendable, +25 on Compensate or Stage 3 - Unremarkable.
//   Photos (cap 3): every 50 Trace restored generates 1 Photo.
//   Liberation Clear As Day unlocks once she holds all 3 Photos (CHARACTER_ROTATIONS' own Skill:
//     Spotlight step note: "unlocks her Ultimate once she now holds all 3 Photos").
//   Tracing Forms Stage 1-3 (the Reminiscence Basic ATK combo) consumes her 3 Photos as it goes,
//     one Oblivion instance per Photo (already modeled in lucilla.blocks.js's own
//     lucilla.basic.oblivion block, 3 fixed hits for a full 3-Photo Reminiscence).
//
// Her modeled rotation only ever generates Trace via Intro + a perfect Spotlight release
// (100 + 50 = 150, exactly capped), so this pilot's priority list follows that same real path —
// the Compensate/Basic-Stage-3-Commendable Trace sources stay real but unused here, same as their
// own lucilla.blocks.js damage-block counterparts (added the same completeness pass, documented
// there as unused in the modeled rotation).
// ═══════════════════════════════════════════════════════════════════════════════

const TRACE_CAP = 150;
const PHOTO_TRACE_COST = 50;

export function createLucillaInitialState() {
  return {
    introCast: false,
    spotlightCast: false,
    clearAsDayCast: false,
    tracingFormsCast: false,
    lettingItGoCast: false,
    trace: 0,
    photos: 0,
  };
}

function gainTrace(state, amount) {
  state.trace = Math.min(TRACE_CAP, state.trace + amount);
  state.photos = Math.min(3, Math.floor(state.trace / PHOTO_TRACE_COST));
}

/** @type {import('../resolver/decision/decisionEngine.js').PriorityRule[]} */
export const LUCILLA_PRIORITY_RULES = [
  {
    id: 'intro',
    step: { type: 'Intro', skill: 'Clip It' },
    condition: s => !s.introCast,
    apply: s => { s.introCast = true; gainTrace(s, 100); },
  },
  {
    id: 'spotlight',
    step: { type: 'Skill', skill: 'Spotlight' },
    condition: s => s.introCast && !s.spotlightCast,
    apply: s => { s.spotlightCast = true; gainTrace(s, 50); },
  },
  {
    id: 'clear-as-day',
    step: { type: 'Liberation', skill: 'Clear As Day' },
    condition: s => s.photos >= 3 && !s.clearAsDayCast,
    apply: s => { s.clearAsDayCast = true; },
  },
  {
    id: 'tracing-forms',
    step: { type: 'Basic ATK', skill: 'Tracing Forms Stage 1-3' },
    condition: s => s.clearAsDayCast && !s.tracingFormsCast,
    apply: s => { s.tracingFormsCast = true; s.photos = 0; },
  },
  {
    id: 'letting-it-go',
    step: { type: 'Basic ATK', skill: 'Letting It Go' },
    condition: s => s.tracingFormsCast && !s.lettingItGoCast,
    apply: s => { s.lettingItGoCast = true; },
  },
];
