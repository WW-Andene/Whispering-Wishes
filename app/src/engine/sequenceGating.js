// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/sequenceGating.js
// PHASE3_PLAN.md Stage 3, item 1 (the highest-priority gap Stage 2's triage found): every converted
// character's Resonance Chain blocks (chain.s1..chain.s6) were firing unconditionally in the engine —
// as if every character were fully R6-awakened — while calcTeamStats.js's legacy applyResonanceChain()
// correctly returns 0 whenever the character's owned sequence is 0 (calcEngine.js:622-624). Verified
// on Lucilla: stripping her chain blocks dropped her Stage 1 parity ratio from 40.03x to ~4.1x.
//
// Rather than hand-editing `requiresSequence` onto ~300 chain blocks across 56 files (56 more
// opportunities to introduce a typo Phase 2's own "1 by 1, full precision" standard exists to
// prevent), this derives the requirement from the id convention EVERY converted character's file
// already follows with zero exceptions (verified via a full grep sweep before writing this file):
// `<char>.chain.sN` or `<char>.chain.sN-<suffix>`, N always 1-6. An explicit `trigger.requiresSequence`
// still wins when present, for any future block that needs to say otherwise.
// ═══════════════════════════════════════════════════════════════════════════════

const CHAIN_ID_PATTERN = /\.chain\.s([1-6])(?:[-.]|$)/;

/**
 * The minimum owned Resonance Chain sequence (0-6) a block requires. 0 = always available (every
 * non-chain kit block, and any chain block that doesn't match the id convention — none do today, but
 * this doesn't throw if one ever doesn't).
 * @param {import('./triggerBlocks.schema.js').TriggerBlock} block
 * @returns {number}
 */
export function requiredSequenceOf(block) {
  if (block.trigger?.requiresSequence != null) return block.trigger.requiresSequence;
  const m = CHAIN_ID_PATTERN.exec(block.id || '');
  return m ? Number(m[1]) : 0;
}

/**
 * @param {import('./triggerBlocks.schema.js').TriggerBlock} block
 * @param {number|null|undefined} sequence  The character's actually-owned sequence level (0-6).
 *   `null`/`undefined` means "don't gate" — every block passes, same as every caller's behavior
 *   before this file existed. Pass an explicit number (0 for an unbuilt/base-kit character) to
 *   actually filter.
 * @returns {boolean}
 */
export function sequenceAllows(block, sequence) {
  if (sequence == null) return true;
  return requiredSequenceOf(block) <= sequence;
}

/**
 * Filters a block list down to what a character at `sequence` actually has, matching
 * applyResonanceChain()'s own `Math.min(seqLevel, 6)` clamp (chain nodes stop at 6 either way, so no
 * separate clamp is needed here). `sequence == null` returns `blocks` unchanged (same array, not a
 * copy) — the no-gating default.
 * @param {import('./triggerBlocks.schema.js').TriggerBlock[]} blocks
 * @param {number|null|undefined} sequence
 */
export function gateBlocksBySequence(blocks, sequence) {
  if (sequence == null) return blocks;
  return blocks.filter(b => sequenceAllows(b, sequence));
}

// Added 2026-09-02 alongside triggerEngine.js's conditionHolds gaining an assumedInactive check —
// found via a live-DPS-relevant audit (Phoebe's requiresStance was never checked at all): a dual-mode
// Hybrid's outro blocks for two DISTINCT, mutually-exclusive Resonance Modes (Denia: Tune Strain vs
// Fusion Burst; Lucilla: Glacio Chafe vs Echo mode — both blocks share the same real 'swap-out'
// trigger key) were both firing together in the live engine, exactly the double-crediting bug already
// fixed for the legacy CHAR_BUFF_TABLE-driven scorer (scoreTeamCompositionExclusiveModeBuffs.test.js).
// Unlike that fix (which can just sum-then-pick-max at scoring time), the engine has no equivalent
// "scoring" step — this instead filters the block LIST itself, at the same single choke point
// gateBlocksBySequence already occupies (calcTeamStats.js's blocksByOwner construction), before any
// downstream consumer ever sees the losing block.
//
// Deliberately narrow: a block only enters a "mode" group if its own requiresStance text contains
// "mode" (the same literal marker this data file's authors already use for every genuine dual-mode
// kit) AND at least one OTHER sibling block from the same character names a DIFFERENT such value —
// i.e. a real, textually-confirmed rivalry, not a guess. A character with only ONE mode-tagged value
// (e.g. Camellya's Budding Mode chain nodes, which have no rival and are a real always-entered part of
// her own rotation, not an alternative to reject) is left untouched — that class of gap needs
// `assumedInactive` (an explicit, per-block, author-confirmed flag) instead, never this heuristic.
const MODE_MARKER = 'mode';
function modeGroupKey(block) {
  const stance = block.condition?.requiresStance;
  if (typeof stance !== 'string' || !stance.toLowerCase().includes(MODE_MARKER)) return null;
  return `${block.source}::${block.trigger?.type || ''}::${block.trigger?.on || ''}`;
}
function blockMagnitude(block) {
  return (block.effects || []).reduce((sum, e) => sum + (Math.abs(e.value) || 0), 0);
}

/**
 * Drops the losing block(s) of every real, rival mutually-exclusive Resonance-Mode group (see the
 * comment above) from a single character's own block list. Blocks with no mode rivalry pass through
 * unchanged, same array reference when nothing needed filtering.
 * @param {import('./triggerBlocks.schema.js').TriggerBlock[]} blocks
 */
export function filterExclusiveModeBlocks(blocks) {
  const groups = new Map(); // groupKey -> Map<stanceText, TriggerBlock[]>
  blocks.forEach(b => {
    const key = modeGroupKey(b);
    if (!key) return;
    const stance = b.condition.requiresStance;
    if (!groups.has(key)) groups.set(key, new Map());
    const byStance = groups.get(key);
    if (!byStance.has(stance)) byStance.set(stance, []);
    byStance.get(stance).push(b);
  });
  const losers = new Set();
  groups.forEach(byStance => {
    if (byStance.size < 2) return; // no rival stance value present — leave untouched
    let winnerStance = null;
    let winnerValue = -Infinity;
    byStance.forEach((group, stance) => {
      const value = Math.max(...group.map(blockMagnitude));
      if (value > winnerValue) { winnerValue = value; winnerStance = stance; }
    });
    byStance.forEach((group, stance) => {
      if (stance !== winnerStance) group.forEach(b => losers.add(b.id));
    });
  });
  if (!losers.size) return blocks;
  return blocks.filter(b => !losers.has(b.id));
}
