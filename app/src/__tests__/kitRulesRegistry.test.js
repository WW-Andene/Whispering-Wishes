import { describe, it, expect } from 'vitest';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { deriveRotationFromKitRules } from '../engine/resolver/decision/kitRulesRegistry.js';

describe('kitRulesRegistry — deriveRotationFromKitRules', () => {
  it('returns null for a character with no registered kit rules (everyone except the pilot) — the calculator falls back to the curated rotation untouched', () => {
    expect(deriveRotationFromKitRules('Aalto', CHARACTER_ROTATIONS['Aalto'])).toBeNull();
    expect(deriveRotationFromKitRules('Calcharo', CHARACTER_ROTATIONS['Calcharo'])).toBeNull();
  });

  it('derives Hiyuki\'s real rotation from her decision layer, plus the curated Echo/Outro tail her state machine does not model', () => {
    const derived = deriveRotationFromKitRules('Hiyuki', CHARACTER_ROTATIONS['Hiyuki']);
    expect(derived).not.toBeNull();
    // Same {type, skill} sequence as the curated rotation for the proven solo case — this is the
    // "adaptability without discarding proven-good data" guarantee: the SOURCE changed (live
    // resource state instead of hand-transcribed prose), the step SEQUENCE for this scenario did
    // not. The blade-liberation step also carries a real `snowforgedBladeConsumed` extra field
    // (self-kit cross-interaction pass) curated steps don't have, checked separately below.
    const curated = CHARACTER_ROTATIONS['Hiyuki'];
    expect(derived.slice(0, 11).map(s => ({ type: s.type, skill: s.skill }))).toEqual(curated.slice(0, 11).map(s => ({ type: s.type, skill: s.skill })));
    expect(derived.slice(11)).toEqual(curated.slice(11)); // Echo/Outro tail, passed through with its real note/duration fields intact
    expect(derived.find(s => s.skill === 'Foreclaiming: Blade Liberation').snowforgedBladeConsumed).toBe(1);
  });

  it('derives Lucilla\'s real rotation from her decision layer, plus the curated Echo/Outro tail her state machine does not model', () => {
    const derived = deriveRotationFromKitRules('Lucilla', CHARACTER_ROTATIONS['Lucilla']);
    expect(derived).not.toBeNull();
    const curated = CHARACTER_ROTATIONS['Lucilla'];
    const expected = [
      ...curated.slice(0, 5).map(s => ({ type: s.type, skill: s.skill })),
      ...curated.slice(5), // Echo/Outro tail, passed through with its real note/duration fields intact
    ];
    expect(derived).toEqual(expected);
  });
});
