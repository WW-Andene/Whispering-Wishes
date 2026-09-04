import { describe, it, expect } from 'vitest';
import { requiredSequenceOf, sequenceAllows, gateBlocksBySequence } from '../engine/resolver/gating/sequenceGating.js';
import { LUCILLA_BLOCKS } from '../engine/characterBlocks/lucilla.blocks.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';

describe('sequenceGating — derives requiredSequenceOf from the chain.sN id convention', () => {
  it('a non-chain block requires sequence 0 (always available)', () => {
    const intro = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.intro.clip-it');
    expect(requiredSequenceOf(intro)).toBe(0);
  });

  it('chain.s1..s6 blocks require their own numbered sequence', () => {
    for (let n = 1; n <= 6; n++) {
      const block = LUCILLA_BLOCKS.find(b => b.id === `lucilla.chain.s${n}`);
      expect(block, `lucilla.chain.s${n} should exist`).toBeTruthy();
      expect(requiredSequenceOf(block)).toBe(n);
    }
  });

  it('a chain block id with a dash suffix (e.g. s6-thunder-rage) still resolves the right number', () => {
    const s6proc = AUGUSTA_BLOCKS.find(b => b.id === 'augusta.chain.s6-thunder-rage');
    expect(s6proc).toBeTruthy();
    expect(requiredSequenceOf(s6proc)).toBe(6);
  });

  it('an explicit trigger.requiresSequence overrides the id-derived value', () => {
    const fakeBlock = { id: 'test.chain.s3', trigger: { type: 'passive', requiresSequence: 1 } };
    expect(requiredSequenceOf(fakeBlock)).toBe(1);
  });

  it('sequenceAllows: null/undefined sequence never gates (backward-compatible default)', () => {
    const s6 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s6');
    expect(sequenceAllows(s6, null)).toBe(true);
    expect(sequenceAllows(s6, undefined)).toBe(true);
  });

  it('sequenceAllows: an explicit sequence number actually gates', () => {
    const s6 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s6');
    const s1 = LUCILLA_BLOCKS.find(b => b.id === 'lucilla.chain.s1');
    expect(sequenceAllows(s6, 0)).toBe(false);
    expect(sequenceAllows(s6, 5)).toBe(false);
    expect(sequenceAllows(s6, 6)).toBe(true);
    expect(sequenceAllows(s1, 1)).toBe(true);
    expect(sequenceAllows(s1, 0)).toBe(false);
  });

  it('gateBlocksBySequence at sequence 0 removes every chain block but keeps everything else', () => {
    const gated = gateBlocksBySequence(LUCILLA_BLOCKS, 0);
    expect(gated.some(b => b.id.includes('.chain.'))).toBe(false);
    expect(gated.length).toBe(LUCILLA_BLOCKS.filter(b => !b.id.includes('.chain.')).length);
  });

  it('gateBlocksBySequence at sequence 3 keeps s1-s3 and excludes s4-s6', () => {
    const gated = gateBlocksBySequence(LUCILLA_BLOCKS, 3);
    expect(gated.some(b => b.id === 'lucilla.chain.s1')).toBe(true);
    expect(gated.some(b => b.id === 'lucilla.chain.s3')).toBe(true);
    expect(gated.some(b => b.id === 'lucilla.chain.s4')).toBe(false);
    expect(gated.some(b => b.id === 'lucilla.chain.s6')).toBe(false);
  });

  it('gateBlocksBySequence with sequence omitted returns the SAME array reference (no-gating fast path)', () => {
    expect(gateBlocksBySequence(LUCILLA_BLOCKS, null)).toBe(LUCILLA_BLOCKS);
    expect(gateBlocksBySequence(LUCILLA_BLOCKS, undefined)).toBe(LUCILLA_BLOCKS);
  });
});

describe('sequenceGating — id convention holds with zero exceptions across every converted character', () => {
  it('every chain.* block id across the whole engine/characterBlocks directory matches the sN convention', async () => {
    // Statically enumerate every *.blocks.js file's chain block ids the same way this codebase's own
    // Stage 1 harness does (dynamic import by filename), rather than hardcoding a character list here
    // that could drift from the real roster.
    const modules = import.meta.glob('../engine/characterBlocks/*.blocks.js', { eager: true });
    const offenders = [];
    for (const [path, mod] of Object.entries(modules)) {
      const blocksExport = Object.values(mod).find(v => Array.isArray(v));
      if (!blocksExport) continue;
      blocksExport.forEach(b => {
        if (b.id.includes('.chain.') && !/\.chain\.s[1-6](?:[-.]|$)/.test(b.id)) {
          offenders.push(`${path}: ${b.id}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
