// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/schema/validateBlock.js
// The single place schemaVersion-branching validation logic lives, per
// ENGINE_ARCHITECTURE_PROPOSAL.md v2 §3.4/§8. NOT wired into the runtime
// characterBlocks/index.js load path in this Phase 0 pass — see the note at the
// bottom of this file for why, and what wiring it in would require.
//
// Rules (§8 item 1):
//   - `id` matches the naming pattern (§4.3): `<name-slug>.<section>.<kebab-move-name>`.
//   - `source` is a non-empty string (the caller supplies the file's own SOURCE const
//     to cross-check against — this module has no way to know a file's SOURCE itself).
//   - For a `schemaVersion` absent/1 block (today's shape): only `id`/`kind`/`trigger`
//     are required — the same minimal shape every existing .blocks.js file already
//     satisfies. Warn-only: a v1 block failing a v2-only check (missing `section`,
//     `damage.basis`, etc.) is reported as a warning, never an error — §7 leaves v1
//     blocks valid and un-migrated until each is separately touched for any reason.
//   - For a `schemaVersion: 2` block: `section` required (closed enum, §1.1); for a
//     `kind:'damage'` block, `damage.category` must pass knownCategories.js's
//     checkCategory() and `damage.basis` must be present — both real errors, not warnings,
//     per §8's "CI-blocking mode from day one for any block declaring schemaVersion: 2."
//   - For a `kind:'buff'` block on a v2 block: every entry in `effects` must carry a
//     `source` passing buffSource.js's checkBuffSource() — WHERE the buff comes from
//     (self-kit/teammate-ally-action/echo/weapon), a distinct question from `target`
//     (WHO receives it). v1 blocks: warn-only, same rationale as everything else v1.
// ═══════════════════════════════════════════════════════════════════════════════

import { checkCategory } from './knownCategories.js';
import { checkBuffSource } from './buffSource.js';

const ID_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.[a-zA-Z]+\.[a-z0-9]+(-[a-z0-9]+)*$/;
const SECTIONS = ['BasicATK', 'HeavyATK', 'Skill', 'Liberation', 'Forte', 'Intro', 'Outro', 'Chain', 'Echo', 'Buff'];

/**
 * @param {object} block  A single TriggerBlock.
 * @param {string} [expectedSource]  The file's own SOURCE const, to cross-check block.source.
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateBlock(block, expectedSource) {
  const errors = [];
  const warnings = [];

  if (!block || typeof block !== 'object') {
    return { errors: ['block is not an object'], warnings };
  }
  if (!block.id || typeof block.id !== 'string') {
    errors.push('missing required field: id');
  } else if (!ID_PATTERN.test(block.id)) {
    (block.schemaVersion === 2 ? errors : warnings).push(
      `id "${block.id}" does not match the required <name-slug>.<section>.<kebab-move-name> pattern (§4.3)`
    );
  }
  if (!block.kind) errors.push(`missing required field: kind (block id: ${block.id || '?'})`);
  if (!block.trigger || typeof block.trigger !== 'object') {
    errors.push(`missing required field: trigger (block id: ${block.id || '?'})`);
  }
  if (expectedSource != null && block.source !== expectedSource) {
    errors.push(`source "${block.source}" does not match this file's declared SOURCE "${expectedSource}" (block id: ${block.id || '?'})`);
  }

  const isV2 = block.schemaVersion === 2;
  if (!isV2) {
    // v1 (schemaVersion absent/1): today's shape is valid as-is. Only flag v2-shaped fields as
    // warnings if present-but-wrong, never require them.
    if (block.section != null && !SECTIONS.includes(block.section)) {
      warnings.push(`section "${block.section}" is not one of ${SECTIONS.join('/')} (block id: ${block.id})`);
    }
    return { errors, warnings };
  }

  // v2: section is required and closed-enum.
  if (!block.section) {
    errors.push(`schemaVersion:2 block missing required field: section (block id: ${block.id})`);
  } else if (!SECTIONS.includes(block.section)) {
    errors.push(`section "${block.section}" is not one of ${SECTIONS.join('/')} (block id: ${block.id})`);
  }

  if (block.kind === 'damage') {
    if (!block.damage || typeof block.damage !== 'object') {
      errors.push(`schemaVersion:2 damage block missing damage payload (block id: ${block.id})`);
    } else {
      const catCheck = checkCategory(block.damage.category);
      if (!catCheck.valid) errors.push(`damage.category invalid: ${catCheck.reason} (block id: ${block.id})`);
      if (!block.damage.basis) errors.push(`schemaVersion:2 damage block missing damage.basis (block id: ${block.id})`);
    }
  }

  if (block.kind === 'buff' && Array.isArray(block.effects)) {
    block.effects.forEach((effect, i) => {
      const srcCheck = checkBuffSource(effect?.source);
      if (!srcCheck.valid) errors.push(`effects[${i}].source invalid: ${srcCheck.reason} (block id: ${block.id})`);
    });
  }

  return { errors, warnings };
}

/**
 * Test-utility entry point (§8 item 3): validates a whole character's block array and throws on
 * any error (never on warnings), so a character test file's first assertion catches a malformed
 * block immediately instead of relying on the loader's console-warn being noticed.
 *
 * @param {object[]} blocksArray
 * @param {string} expectedSource
 */
export function expectValidBlockFile(blocksArray, expectedSource) {
  if (!Array.isArray(blocksArray)) {
    throw new Error(`expectValidBlockFile: expected an array of blocks for "${expectedSource}", got ${typeof blocksArray}`);
  }
  const allErrors = [];
  blocksArray.forEach((block, i) => {
    const { errors } = validateBlock(block, expectedSource);
    errors.forEach(e => allErrors.push(`[${i}] ${e}`));
  });
  if (allErrors.length) {
    throw new Error(`expectValidBlockFile("${expectedSource}"): ${allErrors.length} invalid block(s):\n${allErrors.join('\n')}`);
  }
}

// ── Why this isn't wired into characterBlocks/index.js's load path yet ──
// §8 item 1 specifies this running "at characterBlocks/index.js load time" in CI-blocking mode for
// schemaVersion:2 blocks. This Phase 0 pass builds the validator and makes it available/importable/
// tested (see engine/__tests__ or a validateBlock-focused test file), but does NOT import it from
// characterBlocks/index.js itself: index.js is imported transitively by nearly every test in this
// suite (any test touching calcTeamStats.js, resolveHitComposedDps.js, etc.), so wiring a
// validate-on-import call there — even a warn-only one — changes what every one of those ~120 test
// files does on import (console output at minimum, a thrown error if any hidden bug exists in
// today's blocks that this validator's warn-only v1 path would surface as a warning but a
// differently-configured wiring might not). That's a real behavior change to the loader touching
// all 57 characterBlocks files' effective runtime path, which this pass's explicit scope (structural
// cleanup of engine/ and calcEngine.js/calcTeamStats.js, "not a rewrite, not new character logic")
// does not clearly license without a design decision about exactly how loud v1 warnings should be
// in production/test — flagged here rather than guessed at.
