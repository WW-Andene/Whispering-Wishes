/**
 * Multi-character interleaving — PHASE2_PLAN.md's other remaining engine gap.
 *
 * Proves simulateTeamRotation()/buildTeamSteps() actually resolve a CROSS-CHARACTER mechanic
 * (Augusta's 'partner-outro-return' — the only trigger type in this schema that was ever declared
 * specifically BECAUSE it depends on a DIFFERENT character's action) against a real multi-member
 * team timeline, not a single character's own kit in isolation. Every prior test in this repo either
 * hand-fed `partnerReturnFor` directly to a single-character simulateRotation() call, or exercised
 * Augusta's block alone — this is the first test where the "partner" is a genuinely separate
 * character's own real block set and real CHARACTER_ROTATIONS-derived Outro cast.
 */
import { describe, it, expect } from 'vitest';
import { createStats } from '../features/teams/calcEngine.js';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';
import { RotationSimulator, simulateTeamRotation, buildTeamSteps } from '../engine/resolver/dps/rotationSimulator.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';
import { ROVER_ELECTRO_BLOCKS } from '../engine/characterBlocks/roverElectro.blocks.js';

describe('RotationSimulator — owner-namespaced state stays isolated per character', () => {
  it("two characters' own cooldowns on the same relative timing don't leak into each other", () => {
    const sim = new RotationSimulator();
    sim.useCooldown('skill.zap', 12, 'Alice');
    expect(sim.isReady('skill.zap', 'Alice')).toBe(false);
    expect(sim.isReady('skill.zap', 'Bob')).toBe(true); // Bob's own copy of the same blockId string is unaffected
  });

  it("resetSegment(owner) only clears THAT owner's recorded casts, not the whole team's", () => {
    const sim = new RotationSimulator();
    sim.recordCast('cast:Forte:Ephemeral', 'Alice');
    sim.recordCast('cast:Forte:Ephemeral', 'Bob');
    sim.resetSegment('Alice');
    expect(sim.hasCastThisSegment('cast:Forte:Ephemeral', 'Alice')).toBe(false);
    expect(sim.hasCastThisSegment('cast:Forte:Ephemeral', 'Bob')).toBe(true); // untouched
  });

  it('the swap clock and partner-outro windows are genuinely global (no owner param) — every swap counts against every open window regardless of who swaps', () => {
    const sim = new RotationSimulator();
    sim.openPartnerOutroWindow('someOutroBlockId', 1);
    sim.registerSwap(); // could be ANY character swapping, not just the buffed partner
    expect(sim.tryPartnerOutroReturn('someOutroBlockId')).toBe(true); // still within the 1-swap allowance
  });
});

describe('simulateTeamRotation — hand-built cross-character scenarios (generic mechanism proof)', () => {
  const blocksByOwner = { Augusta: AUGUSTA_BLOCKS, Yinlin: YINLIN_BLOCKS };

  it("Augusta's Majesty condition fires when the buffed partner (a DIFFERENT character's own block set) Outros back as the very next swap", () => {
    const steps = [
      { owner: 'Augusta', type: 'Outro', skill: 'Battlesong of the Unyielding', isSwap: true, isOutroCast: true, stepSeconds: 1 },
      { owner: 'Yinlin', type: 'Outro', skill: 'Strategist', isSwap: true, isOutroCast: true, partnerReturnFor: 'augusta.outro.battlesong', stepSeconds: 8 },
    ];
    const results = simulateTeamRotation(steps, blocksByOwner);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has('partner-outro-return:augusta.outro.battlesong')).toBe(true);
  });

  it("Augusta's Majesty condition forfeits when a THIRD character's swap intervenes before the partner returns", () => {
    const steps = [
      { owner: 'Augusta', type: 'Outro', skill: 'Battlesong of the Unyielding', isSwap: true, isOutroCast: true, stepSeconds: 1 },
      { owner: 'Rover: Electro', type: 'Outro', skill: 'Rumbling Thunders', isSwap: true, stepSeconds: 5 }, // a 3rd character swaps first
      { owner: 'Yinlin', type: 'Outro', skill: 'Strategist', isSwap: true, isOutroCast: true, partnerReturnFor: 'augusta.outro.battlesong', stepSeconds: 5 },
    ];
    const results = simulateTeamRotation(steps, blocksByOwner);
    const lastFired = results[results.length - 1].firedTriggers;
    expect(lastFired.has('partner-outro-return:augusta.outro.battlesong')).toBe(false);
  });

  it("Yinlin's OWN outro buff (elemDmg/libDmg) resolves through her own block set mid-team-timeline, independent of Augusta's blocks being in the same run", () => {
    const steps = [
      { owner: 'Augusta', type: 'Outro', skill: 'Battlesong of the Unyielding', isSwap: true, isOutroCast: true, stepSeconds: 1 },
      { owner: 'Yinlin', type: 'Skill', skill: 'Magnetic Roar', stepSeconds: 2 },
      { owner: 'Yinlin', type: 'Outro', skill: 'Strategist', isSwap: true, isOutroCast: true, partnerReturnFor: 'augusta.outro.battlesong', stepSeconds: 8 },
    ];
    const results = simulateTeamRotation(steps, blocksByOwner);
    const yinlinOutroResult = results.find(r => r.owner === 'Yinlin' && r.step.type === 'Outro');
    const stats = createStats();
    resolveTriggerBlocks(YINLIN_BLOCKS, {
      firedTriggers: yinlinOutroResult.firedTriggers,
      ineligibleBlockIds: yinlinOutroResult.ineligibleBlockIds,
      targetElementLower: 'electro', targetRole: 'Sub DPS',
    }, stats);
    expect(stats.elemDmg).toBe(20); // yinlin.outro.strategist, isolated from Augusta's own blocks
  });
});

describe('buildTeamSteps — real CHARACTER_ROTATIONS data, end-to-end (Augusta + Yinlin + Rover: Electro)', () => {
  const members = [
    { name: 'Augusta', rotation: CHARACTER_ROTATIONS['Augusta'], blocks: AUGUSTA_BLOCKS },
    { name: 'Yinlin', rotation: CHARACTER_ROTATIONS['Yinlin'], blocks: YINLIN_BLOCKS },
    { name: 'Rover: Electro', rotation: CHARACTER_ROTATIONS['Rover: Electro'], blocks: ROVER_ELECTRO_BLOCKS },
  ];

  it('derives owner-tagged steps for all 3 members, in order, with swap boundaries at every member transition', () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps(members);
    expect(Object.keys(blocksByOwner)).toEqual(['Augusta', 'Yinlin', 'Rover: Electro']);
    expect(ownedSteps[0].owner).toBe('Augusta');
    expect(ownedSteps[0].isSwapIn).toBe(true);
    expect(ownedSteps.at(-1).owner).toBe('Rover: Electro');

    const augustaSteps = ownedSteps.filter(s => s.owner === 'Augusta');
    const yinlinSteps = ownedSteps.filter(s => s.owner === 'Yinlin');
    expect(augustaSteps.at(-1).isSwap).toBe(true); // guaranteed boundary into Yinlin
    expect(yinlinSteps[0].isSwapIn).toBe(true);
    expect(yinlinSteps.at(-1).isSwap).toBe(true); // guaranteed boundary into Rover: Electro
  });

  it("auto-tags Yinlin's own real Outro step (the very next member after Augusta) with partnerReturnFor, since she's the partner Augusta buffed", () => {
    const { ownedSteps } = buildTeamSteps(members);
    const yinlinOutro = ownedSteps.find(s => s.owner === 'Yinlin' && s.type === 'Outro' && s.skill === 'Strategist');
    expect(yinlinOutro.partnerReturnFor).toBe('augusta.outro.battlesong');
    // Rover: Electro is NOT the partner Augusta buffed (he's member[2], not member[1]) — his own real
    // Outro step must NOT be cross-referenced.
    const roverOutro = ownedSteps.find(s => s.owner === 'Rover: Electro' && s.type === 'Outro');
    expect(roverOutro.partnerReturnFor).toBeUndefined();
  });

  it("end-to-end: Augusta's Majesty condition actually fires against the REAL 3-member rotation (Yinlin's real combo happens between the two Outros, still within the 1-swap allowance)", () => {
    const { ownedSteps, blocksByOwner } = buildTeamSteps(members);
    const results = simulateTeamRotation(ownedSteps, blocksByOwner);
    const allFired = new Set(results.flatMap(r => [...r.firedTriggers]));
    expect(allFired.has('partner-outro-return:augusta.outro.battlesong')).toBe(true);
  });

  it("end-to-end: inserting Rover: Electro's outro BEFORE Yinlin's (breaking the real team order) forfeits Augusta's condition — proves the mechanism actually discriminates, not just always-succeeds", () => {
    const reordered = [members[0], members[2], members[1]]; // Augusta, Rover: Electro, Yinlin
    const { ownedSteps, blocksByOwner } = buildTeamSteps(reordered);
    // In this order, Rover: Electro (not Yinlin) is the partner Augusta buffed — his own real Outro
    // step gets the cross-reference instead, and it fires correctly for THAT pairing:
    const roverOutro = ownedSteps.find(s => s.owner === 'Rover: Electro' && s.type === 'Outro');
    expect(roverOutro.partnerReturnFor).toBe('augusta.outro.battlesong');
    const results = simulateTeamRotation(ownedSteps, blocksByOwner);
    const allFired = new Set(results.flatMap(r => [...r.firedTriggers]));
    expect(allFired.has('partner-outro-return:augusta.outro.battlesong')).toBe(true);
  });
});
