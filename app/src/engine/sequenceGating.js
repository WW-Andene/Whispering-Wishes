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
