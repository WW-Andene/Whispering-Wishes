import { describe, it, expect } from 'vitest';
import { validateBlock, expectValidBlockFile } from '../engine/schema/validate.js';
import { checkCategory, KNOWN_CATEGORIES } from '../engine/schema/categories.js';
import { checkBuffSource, BUFF_SOURCES } from '../engine/schema/buffSource.js';

describe('buffSource.checkBuffSource', () => {
  it('accepts every declared source', () => {
    Object.keys(BUFF_SOURCES).forEach(src => {
      expect(checkBuffSource(src).valid).toBe(true);
    });
  });
  it('rejects an unrecognized source', () => {
    const result = checkBuffSource('made-up-source');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/not a recognized buff source/);
  });
});

describe('categories.checkCategory', () => {
  it('accepts every category already in real use across characterBlocks/', () => {
    Object.keys(KNOWN_CATEGORIES).forEach(cat => {
      expect(checkCategory(cat).valid).toBe(true);
    });
  });
  it("rejects a typo'd category (wrong casing/suffix)", () => {
    expect(checkCategory('skilDmg').valid).toBe(false);
    expect(checkCategory('Skilldmg').valid).toBe(false);
  });
  it('rejects a pattern-valid but unregistered category', () => {
    const result = checkCategory('bandDmg');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/not registered/);
  });
});

describe('validateBlock — the one schema shape', () => {
  it('requires section on every block', () => {
    const block = { id: 'aalto.intro.feint-shot', source: 'Aalto', kind: 'buff', trigger: { type: 'cast' } };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors.some(e => e.includes('section'))).toBe(true);
  });
  it('requires damage.category (registered) and damage.basis on a damage block', () => {
    const block = {
      id: 'aalto.intro.feint-shot', source: 'Aalto', kind: 'damage', section: 'Intro',
      trigger: { type: 'cast' }, damage: { hits: [], category: 'skilDmg' },
    };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors.some(e => e.includes('category'))).toBe(true);
    expect(errors.some(e => e.includes('basis'))).toBe(true);
  });
  it('accepts a fully-compliant damage block', () => {
    const block = {
      id: 'aalto.intro.feint-shot', source: 'Aalto', kind: 'damage', section: 'Intro',
      trigger: { type: 'cast' }, damage: { hits: [], category: 'skillDmg', basis: 'ATK' },
    };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors).toEqual([]);
  });
  it('requires a valid source on every effect of a buff block', () => {
    const block = {
      id: 'aalto.chain.s1', source: 'Aalto', kind: 'buff', section: 'Chain',
      trigger: { type: 'passive' }, effects: [{ stat: 'elemDmg', value: 30 }],
    };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors.some(e => e.includes('effects[0].source invalid'))).toBe(true);
  });
  it('accepts a fully-compliant buff block with a valid source', () => {
    const block = {
      id: 'aalto.chain.s1', source: 'Aalto', kind: 'buff', section: 'Chain',
      trigger: { type: 'passive' }, effects: [{ stat: 'elemDmg', value: 30, source: 'echo' }],
    };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors).toEqual([]);
  });
  it('errors on a missing id/kind/trigger', () => {
    const { errors } = validateBlock({ source: 'Aalto' }, 'Aalto');
    expect(errors.length).toBeGreaterThan(0);
  });
  it("errors when source does not match the file's declared SOURCE", () => {
    const block = { id: 'aalto.intro.feint-shot', source: 'Wrong Name', kind: 'damage', section: 'Intro', trigger: { type: 'cast' }, damage: { hits: [], category: 'skillDmg', basis: 'ATK' } };
    const { errors } = validateBlock(block, 'Aalto');
    expect(errors.some(e => e.includes('does not match'))).toBe(true);
  });
});

describe('expectValidBlockFile — the shared test-utility helper', () => {
  it('throws for an invalid block array', () => {
    expect(() => expectValidBlockFile([{ source: 'X' }], 'X')).toThrow();
  });
  it('does not throw for a fully-compliant block array', () => {
    const blocks = [{
      id: 'aalto.intro.feint-shot', source: 'Aalto', kind: 'damage', section: 'Intro',
      trigger: { type: 'cast' }, damage: { hits: [], category: 'skillDmg', basis: 'ATK' },
    }];
    expect(() => expectValidBlockFile(blocks, 'Aalto')).not.toThrow();
  });
  // NOTE: no smoke test against the real characterBlocks/*.blocks.js files here — none of the 57
  // character files are migrated onto this schema yet (that migration is Layer 4 of the engine
  // rewrite; see CLAUDE.md / task tracker). Once a character file is migrated it should get its
  // own expectValidBlockFile() assertion in that character's own test, not a blanket loop here.
});
