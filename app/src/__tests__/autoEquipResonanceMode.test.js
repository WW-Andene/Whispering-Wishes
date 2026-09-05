/**
 * Auto-build/auto-team Resonance Mode search (2026-09-05, item 2 of the user's own plan): "if the
 * user did use the auto build and/or auto team, the app choose by itself depending which do the
 * most damage." Mirrors the exact search-not-guess pattern computeAutoEquipEntryOptimized already
 * used for CANDIDATE_PRESETS (build every real option, run it through the real engine, keep the
 * winner) — never a heuristic guess.
 */
import { describe, it, expect } from 'vitest';
import { computeAutoEquipEntryOptimized, computeAutoEquipEntry } from '../features/teams/autoEquip.js';
import { calcTeamStats } from '../features/teams/calcTeamStats.js';
import { RESONANCE_MODE_OPTIONS } from '../data/resonanceModes.js';

describe('computeAutoEquipEntryOptimized — real Resonance Mode search', () => {
  it('picks whichever real mode yields the higher real teamDps for Aemeath (Main DPS path, slots present)', () => {
    const slots = ['Aemeath', null, null];
    const result = computeAutoEquipEntryOptimized('Aemeath', {}, 0, ['Aemeath'], 'Aemeath', slots, '', 90);
    expect(result).toBeTruthy();
    expect(RESONANCE_MODE_OPTIONS['Aemeath']).toContain(result.entry.resonanceMode);

    // Verify it's genuinely the WINNING mode, not just A valid one — build both real candidates and
    // compare their own real teamDps directly.
    const dpsFor = (mode) => {
      const entry = { ...result.entry, resonanceMode: mode };
      const teamEquipment = { [result.aeqKey]: entry };
      return calcTeamStats(slots, 0, 'Aemeath', teamEquipment, '', 90)?.teamDps || 0;
    };
    const dpsByMode = Object.fromEntries(RESONANCE_MODE_OPTIONS['Aemeath'].map(m => [m, dpsFor(m)]));
    const bestMode = Object.entries(dpsByMode).sort((a, b) => b[1] - a[1])[0][0];
    expect(result.entry.resonanceMode).toBe(bestMode);
  });

  it('the plain (non-Optimized) computeAutoEquipEntry never sets a resonanceMode of its own — the manual toggle keeps owning that field for a normal single-character Auto Equip', () => {
    const result = computeAutoEquipEntry('Aemeath', {}, 0, ['Aemeath'], 'Aemeath');
    expect(result.entry.resonanceMode).toBeUndefined();
  });

  it('leaves a non-dual-mode character (e.g. a Main DPS with no real second mode) completely unaffected — no resonanceMode field appears at all', () => {
    const slots = ['Jinhsi', null, null];
    const result = computeAutoEquipEntryOptimized('Jinhsi', {}, 0, ['Jinhsi'], 'Jinhsi', slots, '', 90);
    expect(result).toBeTruthy();
    expect(result.entry.resonanceMode).toBeUndefined();
  });
});
