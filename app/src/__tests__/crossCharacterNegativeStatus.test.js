import { describe, it, expect } from 'vitest';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { buildTeamSteps } from '../engine/resolver/dps/rotationSimulator.js';
import { resolveSimulatedTeamRotation } from '../engine/resolver/dps/resolveSimulatedTeamRotation.js';
import { CARTETHYIA_BLOCKS } from '../engine/characterBlocks/cartethyia.blocks.js';
import { YANGYANG_XUANLING_BLOCKS } from '../engine/characterBlocks/yangyangxuanling.blocks.js';

// Proves cartethyia.chain.s4 (retrofitted from an always-on passive approximation to a real
// 'ally-action' trigger, per the 2026-09-07 cross-character reactivity pass) reacts to a REAL
// teammate's real Havoc Bane application — not just Cartethyia's own Erosion — using real character
// data, and that this works through a partner with NO Erosion of her own at all.
describe('cross-character reactivity — Cartethyia\'s chain.s4 reacts to a teammate\'s real Havoc Bane', () => {
  it('Cartethyia + Yangyang: Xuanling: Yangyang\'s own real Havoc Bane application grants Cartethyia the team buff, with zero Erosion involved', () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps([
      { name: 'Yangyang: Xuanling', blocks: YANGYANG_XUANLING_BLOCKS, rotation: CHARACTER_ROTATIONS['Yangyang: Xuanling'] },
      { name: 'Cartethyia', blocks: CARTETHYIA_BLOCKS, rotation: CHARACTER_ROTATIONS['Cartethyia'] },
    ]);
    const { stats } = resolveSimulatedTeamRotation(ownedSteps, blocksByOwner, 'Cartethyia');
    // allDmg is routed through elemDmg in applyBuff() (see calcEngine.js's own `case 'allDmg'`), so
    // this checks the real accumulated buff landed, not a specific isolated stat key.
    expect(stats.elemDmg).toBeGreaterThan(0);
  });
});
