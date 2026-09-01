// engine/characterBlocks/index.js — PHASE3_PLAN.md Stage 4 step 1's production name -> blocks
// registry. Verifies it stays in sync with CHARACTER_DATA (every key is a real character, every
// value is a non-empty real block array) so calcTeamStats.js can trust BLOCKS_BY_CHARACTER[name]
// without a separate validity check at every call site.
import { describe, it, expect } from 'vitest';
import { BLOCKS_BY_CHARACTER } from '../engine/characterBlocks/index.js';
import { CHARACTER_DATA } from '../data/characters.js';

describe('BLOCKS_BY_CHARACTER', () => {
  it('has exactly 57 converted characters (one entry per .blocks.js file)', () => {
    expect(Object.keys(BLOCKS_BY_CHARACTER)).toHaveLength(57);
  });

  it('every key is a real CHARACTER_DATA name', () => {
    for (const name of Object.keys(BLOCKS_BY_CHARACTER)) {
      expect(CHARACTER_DATA[name], `${name} is not a real CHARACTER_DATA key`).toBeTruthy();
    }
  });

  it('every value is a non-empty array of blocks with a real id', () => {
    for (const [name, blocks] of Object.entries(BLOCKS_BY_CHARACTER)) {
      expect(Array.isArray(blocks), `${name}'s blocks isn't an array`).toBe(true);
      expect(blocks.length, `${name} has zero blocks`).toBeGreaterThan(0);
      for (const b of blocks) expect(typeof b.id, `${name} has a block with no id`).toBe('string');
    }
  });

  it('Yinlin resolves to her real blocks (spot check against the known export)', async () => {
    const { YINLIN_BLOCKS } = await import('../engine/characterBlocks/yinlin.blocks.js');
    expect(BLOCKS_BY_CHARACTER['Yinlin']).toBe(YINLIN_BLOCKS);
  });
});
