import { describe, it, expect } from 'vitest';
import { parseSkillMultiplierHits, sumHitsAtkPct } from '../engine/math/hitParser.js';

describe('parseSkillMultiplierHits — real SKILL_MULTIPLIERS strings', () => {
  it("parses Yinlin's 4-stage Basic ATK combo (SKILL_MULTIPLIERS['Yinlin'][0])", () => {
    const hits = parseSkillMultiplierHits('28.81% → 33.82%×2 → 13.99%×7 → 75.16%');
    expect(hits).toHaveLength(1 + 2 + 7 + 1);
    expect(hits[0]).toEqual({ atkPct: 28.81 });
    expect(hits[1]).toEqual({ atkPct: 33.82 });
    expect(hits[2]).toEqual({ atkPct: 33.82 });
    expect(hits[3]).toEqual({ atkPct: 13.99 });
    expect(hits.at(-1)).toEqual({ atkPct: 75.16 });
    expect(sumHitsAtkPct(hits)).toBeCloseTo(28.81 + 33.82 * 2 + 13.99 * 7 + 75.16, 5);
  });

  it("parses a single-value string with no ×N (Yinlin's Judgement Strike: '78.64%')", () => {
    const hits = parseSkillMultiplierHits('78.64%');
    expect(hits).toEqual([{ atkPct: 78.64 }]);
  });

  it("parses a simple ×N string (Yinlin's Thundering Wrath: '116.56%×7')", () => {
    const hits = parseSkillMultiplierHits('116.56%×7');
    expect(hits).toHaveLength(7);
    expect(hits.every(h => h.atkPct === 116.56)).toBe(true);
  });

  it("parses a two-stage string (Yinlin's Chameleon Cipher: '178.93%×2')", () => {
    const hits = parseSkillMultiplierHits('178.93%×2');
    expect(hits).toEqual([{ atkPct: 178.93 }, { atkPct: 178.93 }]);
  });

  it('an empty/non-matching string parses to zero hits, not a crash', () => {
    expect(parseSkillMultiplierHits('TODO: verify — not yet sourced')).toEqual([]);
  });
});
