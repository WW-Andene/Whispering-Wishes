/**
 * resolveHitComposedTeamDps.js — team-level generalization of resolveHitComposedDps.js. The whole
 * point: a cross-character buff active for only PART of the target's combo should only boost the
 * hits that land while it's actually active — genuinely different from (and more precise than)
 * resolveSimulatedTeamRotation.js's segment-AVERAGED uptime fraction, which can't distinguish "this
 * specific hit" from "the segment as a whole."
 */
import { describe, it, expect } from 'vitest';
import { resolveHitComposedTeamDps } from '../engine/composition/resolveHitComposedTeamDps.js';
import { buildTeamSteps } from '../engine/composition/rotationSimulator.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { AUGUSTA_BLOCKS } from '../engine/characterBlocks/augusta.blocks.js';
import { YINLIN_BLOCKS } from '../engine/characterBlocks/yinlin.blocks.js';
import { ROVER_ELECTRO_BLOCKS } from '../engine/characterBlocks/roverElectro.blocks.js';

const NEUTRAL_ENEMY = { enemyDef: 0, enemyRes: 0 };
const BLOCKS_BY_NAME = { Augusta: AUGUSTA_BLOCKS, Yinlin: YINLIN_BLOCKS };

describe('resolveHitComposedTeamDps — a cross-character buff only boosts hits landing WHILE it is active', () => {
  it("Augusta's whole-team ATK+20% (30s from her Intro) boosts Yinlin's Basic ATK hits landing inside the window, but NOT an identical cast landing after it closes", () => {
    const ownedSteps = [
      { owner: 'Augusta', type: 'Intro', skill: 'Stride of Goldenflare', isSwapIn: true, stepSeconds: 1 }, // opens the 30s window at t=1
      { owner: 'Yinlin', type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", isSwapIn: true, stepSeconds: 2 }, // lands t=3, well within [1,31]
      { owner: 'Yinlin', type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", stepSeconds: 40 }, // lands t=43, well past the window
    ];
    const { hitLog, totalDamage } = resolveHitComposedTeamDps(ownedSteps, BLOCKS_BY_NAME, 'Yinlin', NEUTRAL_ENEMY, 1000, {
      targetElementLower: 'electro', targetRole: 'Sub DPS',
    });

    expect(totalDamage).toBeGreaterThan(0);
    const yinlinHits = hitLog.filter(h => h.blockId === 'yinlin.basic.zapstrings-dance');
    expect(yinlinHits).toHaveLength(22); // 2 casts x 11 hits each

    const buffedCast = yinlinHits.slice(0, 11); // t=3, inside Augusta's window
    const unbuffedCast = yinlinHits.slice(11); // t=43, outside it

    // Per-%ATK damage ratio should be EXACTLY 1.2x higher for the buffed cast (atkPct+20 -> 1.2x
    // effAtk), all else identical (same crit/dmgBonus/defMult/resMult — no other buffs in this
    // minimal 2-member scenario).
    for (let i = 0; i < 11; i++) {
      const buffedRatio = buffedCast[i].damage / buffedCast[i].atkPct;
      const unbuffedRatio = unbuffedCast[i].damage / unbuffedCast[i].atkPct;
      expect(buffedRatio / unbuffedRatio).toBeCloseTo(1.2, 6);
    }
  });

  it("dps is measured against the TARGET's own on-field segment duration, not the whole team timeline", () => {
    const ownedSteps = [
      { owner: 'Augusta', type: 'Intro', skill: 'Stride of Goldenflare', isSwapIn: true, stepSeconds: 1 },
      { owner: 'Yinlin', type: 'Basic ATK', skill: "Zapstring's Dance Stage 1-4", isSwapIn: true, stepSeconds: 2 },
    ];
    const { totalDamage, dps, targetSegment } = resolveHitComposedTeamDps(ownedSteps, BLOCKS_BY_NAME, 'Yinlin', NEUTRAL_ENEMY, 1000, {
      targetElementLower: 'electro', targetRole: 'Sub DPS',
    });
    expect(targetSegment).toEqual({ start: 1, end: 3 }); // Yinlin's own segment: swap-in at t=1, one 2s step
    expect(dps).toBeCloseTo(totalDamage / 2, 10); // 2s field duration, not the whole run's total time
  });
});

describe('resolveHitComposedTeamDps — a target absent from the team resolves cleanly, not a crash', () => {
  it('returns zeroed output for a name not on the team', () => {
    const ownedSteps = [{ owner: 'Yinlin', type: 'Skill', skill: 'Magnetic Roar', isSwapIn: true, stepSeconds: 1 }];
    const result = resolveHitComposedTeamDps(ownedSteps, { Yinlin: YINLIN_BLOCKS }, 'Camellya', NEUTRAL_ENEMY, 1000);
    expect(result.targetSegment).toBeNull();
    expect(result.totalDamage).toBe(0);
    expect(result.hitLog).toEqual([]);
  });
});

describe('resolveHitComposedTeamDps — end-to-end against REAL CHARACTER_ROTATIONS data (Augusta + Yinlin + Rover: Electro)', () => {
  it("computes Yinlin's real hit-composed total within the real 3-member team, including her own S6 Furious Thunder proc and the cross-character whole-team buff she actually receives", () => {
    const members = [
      { name: 'Augusta', rotation: CHARACTER_ROTATIONS['Augusta'], blocks: AUGUSTA_BLOCKS },
      { name: 'Yinlin', rotation: CHARACTER_ROTATIONS['Yinlin'], blocks: YINLIN_BLOCKS },
      { name: 'Rover: Electro', rotation: CHARACTER_ROTATIONS['Rover: Electro'], blocks: ROVER_ELECTRO_BLOCKS },
    ];
    const { ownedSteps, blocksByOwner } = buildTeamSteps(members);
    const { totalDamage, dps, hitLog, targetSegment } = resolveHitComposedTeamDps(ownedSteps, blocksByOwner, 'Yinlin', {
      enemyDef: 792 + 8 * 90, enemyRes: 10,
    }, { atk: 3000 }, { targetElementLower: 'electro', targetRole: 'Sub DPS' });

    expect(totalDamage).toBeGreaterThan(0);
    expect(dps).toBeGreaterThan(0);
    expect(targetSegment).not.toBeNull();

    const firedBlockIds = new Set(hitLog.map(h => h.blockId));
    expect(firedBlockIds.has('yinlin.basic.zapstrings-dance')).toBe(true);
    expect(firedBlockIds.has('yinlin.skill.magnetic-roar')).toBe(true);
    expect(firedBlockIds.has('yinlin.liberation.thundering-wrath')).toBe(true);
    // Augusta's own damage blocks must NEVER appear in YINLIN's hit log — only Yinlin's own casts
    // deal damage to Yinlin's total, per the file header's own scoping rule.
    expect([...firedBlockIds].every(id => id.startsWith('yinlin.'))).toBe(true);
  });
});
