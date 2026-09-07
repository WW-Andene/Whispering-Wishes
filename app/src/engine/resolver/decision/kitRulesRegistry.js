// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/resolver/decision/kitRulesRegistry.js
// [RESOLVER · DECISION] Registry connecting a character's real decision-layer kit rules (see
// ADAPTIVE_ENGINE_DESIGN.md) to the actual DPS calculator — calcTeamStats.js's own "converted
// member" real-engine branch calls `deriveRotationFromKitRules()` in place of reading
// CHARACTER_ROTATIONS[name] directly.
//
// Deliberately additive, never destructive: a character with no registered kit rules (everyone
// except the pilot) is completely untouched — deriveRotationFromKitRules() returns null and the
// caller falls back to CHARACTER_ROTATIONS[name], exactly as before this file existed. Even for a
// registered character, this is not "throw away the curated rotation and hope the state machine
// is right" — decisionEngine-hiyuki.test.js already proves the decision layer reproduces the SAME
// damage-relevant steps CHARACTER_ROTATIONS['Hiyuki'] hand-transcribes, so swapping the SOURCE of
// those steps from "someone typed this down" to "derived from her own resource rules" changes
// nothing about the computed number for the curated solo case — it only changes what happens once
// something (a future teammate-reactive rule) makes her state actually diverge from that one
// curated scenario. If a registered character's decision engine ever produces zero steps (a bug,
// or a state machine that can't reach its own terminal state), this still falls back to the
// curated rotation rather than silently computing 0 DPS — a state-machine defect must never
// regress a character's damage number below what the proven curated data already gives.
// ═══════════════════════════════════════════════════════════════════════════════

import { runDecisionRotation } from './decisionEngine.js';
import { createHiyukiInitialState, HIYUKI_PRIORITY_RULES } from '../../characterBlocks/hiyuki.kitRules.js';

const KIT_RULES_BY_CHARACTER = {
  Hiyuki: { createInitialState: createHiyukiInitialState, rules: HIYUKI_PRIORITY_RULES },
};

/**
 * @param {string} name
 * @param {{type: string, skill?: string}[]|undefined} curatedRotation  CHARACTER_ROTATIONS[name],
 *   used only as the source for her free-timing tail steps (Echo/Outro) the decision layer doesn't
 *   model yet — see hiyuki.kitRules.js's own header for why those two are out of scope for now.
 * @returns {{type: string, skill?: string}[]|null}  null when this character has no registered kit
 *   rules, OR when the decision engine produced zero steps (defensive: never silently prefer a
 *   broken derivation over the proven curated rotation).
 */
export function deriveRotationFromKitRules(name, curatedRotation) {
  const entry = KIT_RULES_BY_CHARACTER[name];
  if (!entry) return null;
  const { steps } = runDecisionRotation(entry.createInitialState(), entry.rules);
  if (!steps.length) return null;
  const tail = (curatedRotation || []).filter(s => s.type === 'Echo' || s.type === 'Outro');
  return [...steps, ...tail];
}
