// PHASE3_PLAN.md Stage 3, item 5/5 (final Stage 3 item): the rotation on-field order-search.
// engine/orchestration/rotationOrderSearch.js's chooseOnFieldOrder() is the engine-native equivalent of
// calcTeamStats.js's own rotationTimeline IIFE — brute-force every permutation of supports (Main DPS
// always last), score each by how much cross-character buff value survives to the instant the Main
// DPS's own on-field window opens, keep the highest (ties keep the input order).
import { describe, it, expect } from 'vitest';
import { chooseOnFieldOrder } from '../engine/orchestration/rotationOrderSearch.js';
import { buildTeamSteps } from '../engine/composition/rotationSimulator.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';
import { ROVER_ELECTRO_BLOCKS } from '../engine/characterBlocks/roverElectro.blocks.js';

const MEMBERS = [
  { name: 'Augusta', rotation: CHARACTER_ROTATIONS['Augusta'], blocks: AUGUSTA_BLOCKS },
  { name: 'Yinlin', rotation: CHARACTER_ROTATIONS['Yinlin'], blocks: YINLIN_BLOCKS },
  { name: 'Rover: Electro', rotation: CHARACTER_ROTATIONS['Rover: Electro'], blocks: ROVER_ELECTRO_BLOCKS },
];

describe('chooseOnFieldOrder', () => {
  it('places Main DPS last in every candidate — the search never considers otherwise', () => {
    const best = chooseOnFieldOrder(MEMBERS, 'Yinlin');
    expect(best.order[best.order.length - 1]).toBe('Yinlin');
    expect(best.order).toHaveLength(3);
    expect(new Set(best.order)).toEqual(new Set(['Augusta', 'Yinlin', 'Rover: Electro']));
  });

  it("prefers the order that lets Rover: Electro's next-on-field outro reach Yinlin (Rover: Electro immediately before her), since the default input order (Augusta, Yinlin, Rover: Electro) doesn't", () => {
    // rover-electro.outro.rumbling-thunders is 'next-on-field' — per
    // resolveSimulatedTeamRotation.test.js, it only reaches whoever is the IMMEDIATE next member.
    // Reordering so Rover: Electro sits right before Yinlin (instead of after her, where it reaches
    // nobody) hands Yinlin real buff value she wouldn't otherwise get — the search should find this.
    const best = chooseOnFieldOrder(MEMBERS, 'Yinlin');
    const roverIdx = best.order.indexOf('Rover: Electro');
    const yinlinIdx = best.order.indexOf('Yinlin');
    expect(roverIdx).toBe(yinlinIdx - 1);
    expect(best.score).toBeGreaterThan(0);
  });

  it('the chosen ownedSteps/blocksByOwner actually reflect the chosen order (matches buildTeamSteps on that same order)', () => {
    const best = chooseOnFieldOrder(MEMBERS, 'Yinlin');
    const orderedMembers = best.order.map(name => MEMBERS.find(m => m.name === name));
    const expected = buildTeamSteps(orderedMembers);
    expect(best.ownedSteps.map(s => s.owner)).toEqual(expected.ownedSteps.map(s => s.owner));
    expect(best.blocksByOwner).toEqual(expected.blocksByOwner);
  });

  it('a solo team (no supports) returns the single member as both first and last', () => {
    const solo = [MEMBERS[1]];
    const best = chooseOnFieldOrder(solo, 'Yinlin');
    expect(best.order).toEqual(['Yinlin']);
  });

  it('returns null when mainDpsName is not present in members', () => {
    expect(chooseOnFieldOrder(MEMBERS, 'Camellya')).toBeNull();
  });
});
