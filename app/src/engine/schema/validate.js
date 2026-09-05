// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — engine/schema/validate.js
// The single validator for block.schema.js's shape. One version, enforced always —
// no warn-only legacy path. A block that doesn't match is a hard error.
//
// NOT YET wired into characterBlocks/index.js's load path: none of the 57 character
// block files have been migrated onto this shape yet (Layer 4 of the engine
// rewrite). Wiring happens as part of that migration, once every file passes.
// ═══════════════════════════════════════════════════════════════════════════════

import { checkCategory } from './categories.js';
import { checkBuffSource } from './buffSource.js';
import { SECTIONS } from './block.schema.js';

const ID_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.[a-zA-Z]+\.[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * @param {object} block  A single TriggerBlock.
 * @param {string} [expectedSource]  The file's own SOURCE const, to cross-check block.source.
 * @returns {{ errors: string[] }}
 */
export function validateBlock(block, expectedSource) {
  const errors = [];

  if (!block || typeof block !== 'object') {
    return { errors: ['block is not an object'] };
  }
  const id = block.id || '?';

  if (!block.id || typeof block.id !== 'string') {
    errors.push(`missing required field: id (block id: ${id})`);
  } else if (!ID_PATTERN.test(block.id)) {
    errors.push(`id "${block.id}" does not match the required <name-slug>.<section>.<kebab-move-name> pattern`);
  }
  if (!block.kind) errors.push(`missing required field: kind (block id: ${id})`);
  if (!block.trigger || typeof block.trigger !== 'object') {
    errors.push(`missing required field: trigger (block id: ${id})`);
  }
  if (expectedSource != null && block.source !== expectedSource) {
    errors.push(`source "${block.source}" does not match this file's declared SOURCE "${expectedSource}" (block id: ${id})`);
  }

  if (!block.section) {
    errors.push(`missing required field: section (block id: ${id})`);
  } else if (!SECTIONS.includes(block.section)) {
    errors.push(`section "${block.section}" is not one of ${SECTIONS.join('/')} (block id: ${id})`);
  }

  if (block.kind === 'damage') {
    if (!block.damage || typeof block.damage !== 'object') {
      errors.push(`damage block missing damage payload (block id: ${id})`);
    } else {
      // category is OPTIONAL — omission is a real, deliberate "no category-specific bonus" statement
      // (Intro/Outro casts, or a hit no audit has yet confirmed a category for), not a gap to force a
      // guess into. Only validate it when the block's own author chose to state one.
      if (block.damage.category != null) {
        const catCheck = checkCategory(block.damage.category);
        if (!catCheck.valid) errors.push(`damage.category invalid: ${catCheck.reason} (block id: ${id})`);
      }
      if (!block.damage.basis) errors.push(`damage block missing damage.basis (block id: ${id})`);
    }
  }

  if (block.kind === 'heal') {
    if (!block.heal || typeof block.heal !== 'object') {
      errors.push(`heal block missing heal payload (block id: ${id})`);
    } else {
      if (!block.heal.basis) errors.push(`heal block missing heal.basis (block id: ${id})`);
      if (!Array.isArray(block.heal.hits) || !block.heal.hits.length) {
        errors.push(`heal block missing heal.hits (block id: ${id})`);
      }
    }
  }

  if (block.concertoEnergyGain != null && typeof block.concertoEnergyGain !== 'number') {
    errors.push(`concertoEnergyGain must be a number when present (block id: ${id})`);
  }

  if (block.resourceGain != null) {
    if (!Array.isArray(block.resourceGain)) {
      errors.push(`resourceGain must be an array when present (block id: ${id})`);
    } else {
      block.resourceGain.forEach((rg, i) => {
        if (!rg || typeof rg.resource !== 'string' || typeof rg.value !== 'number') {
          errors.push(`resourceGain[${i}] must be { resource: string, value: number } (block id: ${id})`);
        }
      });
    }
  }

  if (block.kind === 'buff' && Array.isArray(block.effects)) {
    block.effects.forEach((effect, i) => {
      const srcCheck = checkBuffSource(effect?.source);
      if (!srcCheck.valid) errors.push(`effects[${i}].source invalid: ${srcCheck.reason} (block id: ${id})`);
    });
  }

  return { errors };
}

/**
 * Test-utility entry point: validates a whole character's block array and throws on any error,
 * so a character test file's first assertion catches a malformed block immediately.
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
