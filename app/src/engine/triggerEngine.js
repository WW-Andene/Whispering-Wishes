// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/triggerEngine.js
// Resolves a set of TriggerBlocks (see triggerBlocks.schema.js) for a given team/
// rotation context into stat contributions, using the SAME applyBuff() stat switch
// calcEngine.js already uses — so a converted character's blocks feed the existing
// damage formula unchanged, and their output can be diffed against the legacy flat-
// table path (CHAR_BUFF_TABLE/RESONANCE_CHAIN_DATA) for verification before cutover.
//
// This module is additive: it does not modify calcEngine.js/calcTeamStats.js/
// autoEquip.js, and nothing in the live calculator imports it yet. It's exercised by
// the parity test in __tests__/triggerEngine-rover-electro.test.js.
// ═══════════════════════════════════════════════════════════════════════════════

import { applyBuff } from '../features/teams/calcEngine.js';

/**
 * @param {import('./triggerBlocks.schema.js').TriggerBlock[]} blocks
 * @param {Object} ctx
 * @param {string} ctx.activeCharacter   Name of the character whose block is being evaluated
 *                                        as "self" for trigger purposes
 * @param {Set<string>} ctx.firedTriggers  Trigger keys ('cast:Skill:Thunderclap', 'swap-in',
 *                                          'resource-threshold:Electric Surge:120', ...) known
 *                                          to have occurred in this rotation pass
 * @param {string} ctx.targetName        Character whose stat accumulator effects should land on
 * @param {string} ctx.targetElementLower Target's element, lowercased (for condition.element gating)
 * @param {string} ctx.targetRole        Target's role (for condition.requiresRole gating)
 * @param {Object} stats                 Stat accumulator (createStats() shape from calcEngine.js)
 */
export function resolveTriggerBlocks(blocks, ctx, stats) {
  const { firedTriggers, targetElementLower, targetRole } = ctx;
  let totalMultBonus = 0;
  for (const block of blocks) {
    if (!triggerFired(block.trigger, firedTriggers)) continue;
    if (!conditionHolds(block.condition, targetElementLower, targetRole)) continue;
    for (const effect of block.effects) {
      if (effect.stat === 'totalMult') { totalMultBonus += effect.value; continue; }
      applyBuff(stats, effect.stat, effect.value, {});
    }
  }
  return totalMultBonus;
}

function triggerKey(trigger) {
  if (trigger.type === 'cast') return `cast:${trigger.on}`;
  if (trigger.type === 'resource-threshold') return `resource-threshold:${trigger.resource}:${trigger.threshold}`;
  // Keyed by the referenced block, not a fixed string — this trigger only fires for the ONE
  // outro-buff block it names, e.g. a caller marking 'partner-outro-return:augusta.outro.battlesong'
  // as fired asserts "the character buffed by that specific block just cast their own Outro while
  // it was still active, within the allowed swap count." Evaluating whether that's actually true for
  // a real rotation is the caller's job (a rotation simulator, not yet built — see
  // triggerBlocks.schema.js's requiresActiveBlock doc) — this resolver only checks whether the key
  // is present, same as every other trigger type.
  if (trigger.type === 'partner-outro-return') return `partner-outro-return:${trigger.requiresActiveBlock}`;
  // Keyed by the block itself, not by opensOn — same reasoning as partner-outro-return: this
  // resolver doesn't track elapsed time or evaluate whether the real cast landed inside
  // `windowSeconds` of one of `opensOn`'s triggers firing. It only checks whether the caller (a
  // future rotation simulator) already asserted "yes, this windowed cast happened in time" by
  // including this exact key in firedTriggers.
  if (trigger.type === 'windowed-cast') return `windowed-cast:${trigger.opensOn?.join('|')}`;
  // Same reasoning as the other two conditional types: this resolver only checks whether the
  // caller already asserted the dependency was met (via this key being present in
  // firedTriggers) — evaluating "was requiresPriorCast actually seen earlier this on-field
  // segment" is rotationSimulator.js's job (recordCast/hasCastThisSegment/resetSegment).
  if (trigger.type === 'requires-prior-cast') return `requires-prior-cast:${trigger.requiresPriorCast}`;
  // Keyed by opensOnProc, mirroring windowed-cast's own opensOn-keying — this resolver doesn't
  // track window elapsed time or the proc count cap itself (see rotationSimulator.js's
  // openProcWindow/tryProc); it only checks whether the caller already asserted "yes, a proc fired
  // within this window and under its cap" by including this exact key in firedTriggers. Each
  // individual proc occurrence is a separate call with the same key (repeatable, unlike
  // windowed-cast's one-shot), so resolveTriggerBlocks applying this block's effects once per
  // firedTriggers check is intentional — the CALLER is responsible for invoking resolution once per
  // actual proc, not this resolver deduping them.
  if (trigger.type === 'windowed-proc') return `windowed-proc:${trigger.opensOnProc?.join('|')}`;
  return trigger.type;
}

function triggerFired(trigger, firedTriggers) {
  if (trigger.type === 'passive') return true;
  return firedTriggers.has(triggerKey(trigger));
}

function conditionHolds(condition, targetElementLower, targetRole) {
  if (!condition) return true;
  if (condition.element && condition.element.toLowerCase() !== targetElementLower) return false;
  if (condition.requiresRole && condition.requiresRole.length && !condition.requiresRole.includes(targetRole)) return false;
  return true;
}

export { triggerKey };
