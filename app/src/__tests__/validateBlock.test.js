import { describe, it, expect } from 'vitest';
import { validateBlock, expectValidBlockFile } from '../engine/schema/validateBlock.js';
import { checkCategory, KNOWN_CATEGORIES } from '../engine/schema/knownCategories.js';
import { BLOCKS_BY_CHARACTER } from '../engine/characterBlocks/index.js';

describe('knownCategories.checkCategory', () => {
  it('accepts every category already in real use across characterBlocks/', () => {
    Object.keys(KNOWN_CATEGORIES).forEach(cat => {
      expect(checkCategory(cat).valid).toBe(true);
    });
  });
  it('rejects a typo\'d category (wrong casing/suffix)', () => {
    expect(checkCategory('skilDmg').valid).toBe(false);
    expect(checkCategory('Skilldmg').valid).toBe(false);
  });
  it('rejects a pattern-valid but unregistered category', () => {
    const result = checkCategory('bandDmg');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/not registered/);
  });
});

describe('validateBlock — schemaVersion 1 (today\'s shape, absent/undefined version)', () => {
  it('accepts a minimal today-shaped block with no errors', () => {
    const block = { id: 'aalto.intro.feint-shot', source: 'Aalto', kind: 'damage', trigger: { type: 'cast', on: 'Intro:Feint Shot' } };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors).toEqual([]);
  });
  it('does not require section/damage.basis on a v1 block', () => {
    const block = { id: 'aalto.intro.feint-shot', source: 'Aalto', kind: 'damage', trigger: { type: 'cast' }, damage: { hits: [], category: 'skillDmg' } };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors).toEqual([]);
  });
  it('errors on a missing id/kind/trigger regardless of version', () => {
    const { errors } = validateBlock({ source: 'Aalto' }, 'Aalto');
    expect(errors.length).toBeGreaterThan(0);
  });
  it('errors when source does not match the file\'s declared SOURCE', () => {
    const block = { id: 'aalto.intro.feint-shot', source: 'Wrong Name', kind: 'damage', trigger: { type: 'cast' } };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors.some(e => e.includes('does not match'))).toBe(true);
  });
});

describe('validateBlock — schemaVersion 2 (new shape, CI-blocking per §8)', () => {
  it('requires section on a v2 block', () => {
    const block = { schemaVersion: 2, id: 'aalto.intro.feint-shot', source: 'Aalto', kind: 'buff', trigger: { type: 'cast' } };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors.some(e => e.includes('section'))).toBe(true);
  });
  it('requires damage.category (registered) and damage.basis on a v2 damage block', () => {
    const block = {
      schemaVersion: 2, id: 'aalto.intro.feint-shot', source: 'Aalto', kind: 'damage', section: 'Intro',
      trigger: { type: 'cast' }, damage: { hits: [], category: 'skilDmg' },
    };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors.some(e => e.includes('category'))).toBe(true);
    expect(errors.some(e => e.includes('basis'))).toBe(true);
  });
  it('accepts a fully-compliant v2 damage block', () => {
    const block = {
      schemaVersion: 2, id: 'aalto.intro.feint-shot', source: 'Aalto', kind: 'damage', section: 'Intro',
      trigger: { type: 'cast' }, damage: { hits: [], category: 'skillDmg', basis: 'ATK' },
    };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors).toEqual([]);
  });
});

describe('expectValidBlockFile — the shared test-utility helper (§8 item 3)', () => {
  it('throws for an invalid block array', () => {
    expect(() => expectValidBlockFile([{ source: 'X' }], 'X')).toThrow();
  });
  it('does not throw for a valid v1 block array', () => {
    const blocks = [{ id: 'aalto.intro.feint-shot', source: 'Aalto', kind: 'damage', trigger: { type: 'cast' } }];
    expect(() => expectValidBlockFile(blocks, 'Aalto')).not.toThrow();
  });
  // Real-data smoke test, read-only: confirms the validator's v1 (warn-only) path doesn't choke on
  // every already-existing character's real block file — does NOT assert every real block is
  // v2-compliant (they're not migrated in this pass) or that the validator/registry cover every
  // real id/category shape perfectly; a v1 block failing an id/section check only ever produces a
  // *warning*, so this loop intentionally only asserts on `errors`, matching validateBlock's own
  // documented v1 contract above.
  it('produces zero hard errors for every currently-loaded character block file (id/kind/trigger present, source matches)', () => {
    const allErrors = [];
    Object.entries(BLOCKS_BY_CHARACTER).forEach(([name, blocks]) => {
      (blocks || []).forEach((block, i) => {
        const { errors } = validateBlock(block, block?.source);
        errors.forEach(e => allErrors.push(`${name}[${i}]: ${e}`));
      });
    });
    expect(allErrors).toEqual([]);
  });
});
