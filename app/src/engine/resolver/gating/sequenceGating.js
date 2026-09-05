// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/gating/sequenceGating.js
// [RESOLVER · GATING] Chain-level/Resonance-Mode sequence gating.
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
 * @param {string|null} [forcedStance]  Added 2026-09-05 — the real in-game mode toggle (see
 *   winningStanceForOwner's own doc for the full rationale): Resonance Mode is a player-set switch
 *   in the character's own build panel, NOT something the game derives from magnitude. When a group
 *   has a stance matching `forcedStance`, that stance wins outright, no magnitude comparison —
 *   exactly mirroring what a player would see in-game if they flipped the toggle. A group whose
 *   rival stances DON'T include `forcedStance` (e.g. this group belongs to a different rivalry than
 *   the one being forced) falls back to the existing magnitude heuristic, unaffected.
 */
export function filterExclusiveModeBlocks(blocks, forcedStance = null) {
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
    if (forcedStance != null && byStance.has(forcedStance)) {
      winnerStance = forcedStance;
    } else {
      let winnerValue = -Infinity;
      byStance.forEach((group, stance) => {
        const value = Math.max(...group.map(blockMagnitude));
        if (value > winnerValue) { winnerValue = value; winnerStance = stance; }
      });
    }
    byStance.forEach((group, stance) => {
      if (stance !== winnerStance) group.forEach(b => losers.add(b.id));
    });
  });
  if (!losers.size) return blocks;
  return blocks.filter(b => !losers.has(b.id));
}

// Added 2026-09-02 for the engine-architecture history (git log) item 9's Denia/Lynae mode-conditional `appliesTags`
// blocker: `appliesTags` entries (rotationSimulator.js) need a per-OWNER "which mode is assumed
// active" answer, not just a per-trigger-group winner — a mode-invariant damage block (e.g. Denia's
// Basic ATK: Breakdown Form, identical %ATK either mode) has nothing of its own to compare, only a
// side-effect tag that differs. Rather than invent a second, disconnected heuristic, this reuses the
// EXACT same "highest blockMagnitude wins" rule filterExclusiveModeBlocks already applies to Denia's
// real outro rivalry (Tune Strain +15% vs Fusion Burst +60% -> Fusion Burst already wins there today)
// — aggregated across every one of that owner's mode-tagged blocks (not just one trigger group), so a
// character with several small per-group rivalries still resolves to one single assumed mode, matching
// the user's own framing: "pick whichever mode gives the most damage for this composition."
export function winningStanceForOwner(blocks, owner, forcedStance = null) {
  // Added 2026-09-05, per direct user correction: Resonance Mode is NOT something the game derives
  // automatically (this function's own magnitude heuristic was always a stand-in, never a claim about
  // real game behavior) — in the real game it's a manual toggle in the character's own build panel,
  // available only outside combat. A caller-supplied forcedStance IS that real toggle's chosen value
  // and wins outright, even higher priority than `confirmedWinningStance` below (that flag answers a
  // narrower question — "which stance wins when nothing else says otherwise" — the player's own
  // explicit choice always overrides it). Only characters with a real second mode ever pass this;
  // every other caller keeps passing null, so the pre-existing heuristic is unchanged for them.
  if (forcedStance != null) return forcedStance;
  const ownerModeBlocks = blocks.filter(b => b.source === owner && modeGroupKey(b));
  if (!ownerModeBlocks.length) return null;
  // confirmedWinningStance (added 2026-09-02, Lynae's case): an explicit, sourced pointer for when the
  // real per-mode difference genuinely can't be reduced to a comparable `effects[].value` (Lynae's own
  // Rupture-mode bonus is a flat DOT-engine proc, her Strain-mode bonus a %-amplify multiplier — not the
  // same unit, and this function has no ATK/team context to convert between them honestly). Set ONLY
  // on the block matching a verdict independently verified by actually RUNNING calcTeamStats.js's own
  // now-fixed calcTuneBreakDmg mode-exclusivity resolution (real numbers, not a guess) — never a
  // fabricated magnitude forced through the comparison below just to make one exist. Checked first
  // since it's a stronger source of truth than the generic magnitude heuristic when both are present.
  const confirmed = ownerModeBlocks.find(b => b.condition.confirmedWinningStance);
  if (confirmed) return confirmed.condition.requiresStance;
  const byStance = new Map();
  ownerModeBlocks.forEach(b => {
    const stance = b.condition.requiresStance;
    const mag = blockMagnitude(b);
    byStance.set(stance, Math.max(byStance.get(stance) ?? -Infinity, mag));
  });
  let winner = null, best = -Infinity;
  byStance.forEach((mag, stance) => { if (mag > best) { best = mag; winner = stance; } });
  return winner;
}
