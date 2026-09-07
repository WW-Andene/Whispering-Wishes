import { describe, it, expect } from 'vitest';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { buildTeamSteps } from '../engine/resolver/dps/rotationSimulator.js';
import { resolveHitComposedTeamDps } from '../engine/resolver/dps/resolveHitComposedTeamDps.js';
import { HIYUKI_BLOCKS } from '../engine/characterBlocks/hiyuki.blocks.js';
import { LUCILLA_BLOCKS } from '../engine/characterBlocks/lucilla.blocks.js';
import { SUISUI_BLOCKS } from '../engine/characterBlocks/suisui.blocks.js';
import { deriveRotationFromKitRules } from '../engine/resolver/decision/kitRulesRegistry.js';

// Proves the general cross-character mechanism (resolveHitComposedDps.js/resolveHitComposedTeamDps.js's
// new ally-action damage-block support + the shared 'glacio-chafe' appliesTags convention) actually
// makes Hiyuki's real Glacio Bite proc react to a REAL TEAMMATE's REAL casts — not just her own — and
// that this isn't hardcoded to one curated pairing: it fires the same way for two different partners
// (Lucilla, Suisui), because nothing in the mechanism names either of them specifically.
function hiyukiRotation() { return deriveRotationFromKitRules('Hiyuki', CHARACTER_ROTATIONS['Hiyuki']) || CHARACTER_ROTATIONS['Hiyuki']; }
function countGlacioBiteProcs(hitLog) { return hitLog.filter(h => h.blockId === 'hiyuki.procdmg.glacio-bite').length; }

describe('cross-character reactivity — Hiyuki\'s Glacio Bite proc reacts to real teammates', () => {
  it('solo Hiyuki only procs off her own 7 real Chafe applications', () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps([
      { name: 'Hiyuki', blocks: HIYUKI_BLOCKS, rotation: hiyukiRotation() },
    ]);
    const { hitLog } = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Hiyuki', { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 4000, { targetElementLower: 'glacio', targetRole: 'Main DPS' });
    // 7 distinct Chafe-applying blocks, but hiyuki.liberation.foreclaimed-self-stage1-3 casts twice
    // in her own real modeled rotation (its own note: "Fires twice in the real rotation") — 8 real
    // Chafe-application events total.
    expect(countGlacioBiteProcs(hitLog)).toBe(8);
  });

  it('Hiyuki + Lucilla: Lucilla\'s own real Chafe applications (Clip It/Spotlight/Oblivion) ALSO trigger Hiyuki\'s proc — more instances than solo', () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps([
      { name: 'Lucilla', blocks: LUCILLA_BLOCKS, rotation: CHARACTER_ROTATIONS['Lucilla'] },
      { name: 'Hiyuki', blocks: HIYUKI_BLOCKS, rotation: hiyukiRotation() },
    ]);
    const { hitLog, totalDamage } = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Hiyuki', { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 4000, { targetElementLower: 'glacio', targetRole: 'Main DPS' });
    // Lucilla applies Chafe 3 times in her own modeled rotation (Clip It, Spotlight, Oblivion).
    expect(countGlacioBiteProcs(hitLog)).toBe(8 + 3);
    expect(totalDamage).toBeGreaterThan(0);
  });

  it('Hiyuki + Suisui (a DIFFERENT Chafe-applying partner, not the curated Lucilla pairing): the same mechanism fires identically — proving this is real cross-character reactivity, not a hardcoded synergy between two specific characters', () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps([
      { name: 'Suisui', blocks: SUISUI_BLOCKS, rotation: CHARACTER_ROTATIONS['Suisui'] },
      { name: 'Hiyuki', blocks: HIYUKI_BLOCKS, rotation: hiyukiRotation() },
    ]);
    const { hitLog } = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Hiyuki', { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 4000, { targetElementLower: 'glacio', targetRole: 'Main DPS' });
    // Suisui applies Chafe twice in her own modeled rotation (Tinkling Jade, Drizzle Stance Stage 4).
    expect(countGlacioBiteProcs(hitLog)).toBe(8 + 2);
  });
});
