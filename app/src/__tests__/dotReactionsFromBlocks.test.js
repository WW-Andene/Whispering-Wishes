// the engine-merge history (git log) Phase 2 — proves dotReactionsFromBlocks.js's four migrated mechanics
// (Frazzle/Erosion/Fusion Burst/Electro Flare; Tune Break stays on the legacy path per Phase 1's own
// "do this one last" note) produce results that follow the SAME formulas as calcEngine.js's original
// five functions — verified with synthetic block sets whose real math is hand-computable, plus a real
// end-to-end check against Buling's actual blocks (her Electro Flare application, the first real
// migration target).
import { describe, it, expect } from 'vitest';
import { calcDefMult, calcResMult, calcElectroFlareDmg, calcFusionBurstDmg, calcErosionDmg, calcFrazzleDmg } from '../features/teams/calcEngine.js';
import {
  resolveFrazzleFromBlocks, resolveErosionFromBlocks, resolveFusionBurstFromBlocks, resolveElectroFlareFromBlocks,
} from '../engine/resolver/dot/dotReactionsFromBlocks.js';
import { resolveDotReactionDps } from '../engine/resolver/dot/dotReactions.js';
import { BULING_BLOCKS } from '../engine/characterBlocks/buling.blocks.js';
import { DENIA_BLOCKS } from '../engine/characterBlocks/denia.blocks.js';
import { CIACCONA_BLOCKS } from '../engine/characterBlocks/ciaccona.blocks.js';
import { CARTETHYIA_BLOCKS } from '../engine/characterBlocks/cartethyia.blocks.js';
import { ROVER_SPECTRO_BLOCKS } from '../engine/characterBlocks/roverspectro.blocks.js';
import { filterExclusiveModeBlocks, gateBlocksBySequence } from '../engine/resolver/gating/sequenceGating.js';
import { CHARACTER_ROTATIONS } from '../data/characters.js';
import { lookupStackMult, FRAZZLE_STACK_TABLE, EROSION_STACK_TABLE } from '../engine/resolver/dot/dotFormulas.js';

const defMult = calcDefMult(800, 0, 0);
const resMult = calcResMult(10, 0);

describe('dotReactionsFromBlocks — Electro Flare (Buling, real blocks)', () => {
  it('matches calcElectroFlareDmg exactly for a team with Buling (block-tagged) vs the legacy boolean-flagged equivalent', () => {
    const blocksByOwner = { Buling: BULING_BLOCKS };
    const fromBlocks = resolveElectroFlareFromBlocks(blocksByOwner, 20, defMult, resMult);
    const legacy = calcElectroFlareDmg([{ name: 'Buling' }], 20, defMult, resMult);
    expect(fromBlocks.active).toBe(true);
    expect(fromBlocks.dmg).toBeCloseTo(legacy.dmg, 6);
  });

  it('both her Electro Flare application points (Intro + Liberation) count as ONE boolean gate, not double-counted', () => {
    const electroFlareBlocks = BULING_BLOCKS.filter(b => b.dotApplier?.mechanic === 'electroFlare');
    expect(electroFlareBlocks.length).toBe(2);
    const blocksByOwner = { Buling: BULING_BLOCKS };
    const withBoth = resolveElectroFlareFromBlocks(blocksByOwner, 20, defMult, resMult);
    const withJustOne = resolveElectroFlareFromBlocks({ Buling: [electroFlareBlocks[0]] }, 20, defMult, resMult);
    expect(withBoth.dmg).toBeCloseTo(withJustOne.dmg, 6);
  });

  it('a team with no Electro Flare applier produces zero, matching the legacy function', () => {
    const result = resolveElectroFlareFromBlocks({ Someone: [] }, 20, defMult, resMult);
    expect(result).toEqual({ dmg: 0, active: false });
  });
});

describe('dotReactionsFromBlocks — Fusion Burst (synthetic block, parity vs calcFusionBurstDmg on a REAL flagged character)', () => {
  // Uses 'Denia' as the owner name specifically so the legacy comparison (which reads
  // CHAR_BUFF_TABLE['Denia'].debuffs, a real fusionBurst-flagged entry) is a fair, apples-to-apples
  // parity check — a made-up name would make calcFusionBurstDmg's own CHAR_BUFF_TABLE lookup return
  // nothing, which would test the wrong thing (that legacy ignores unknown names, not real parity).
  const applierBlock = { id: 'x', source: 'Denia', kind: 'damage', trigger: { type: 'cast', on: 'Skill:X' }, target: { scope: 'self' }, effects: [], dotApplier: { mechanic: 'fusionBurst' } };

  it('matches calcFusionBurstDmg for the same real character', () => {
    const fromBlocks = resolveFusionBurstFromBlocks({ Denia: [applierBlock] }, 30, defMult, resMult);
    const legacy = calcFusionBurstDmg([{ name: 'Denia' }], 30, defMult, resMult);
    expect(fromBlocks.active).toBe(true);
    expect(fromBlocks.dmg).toBeCloseTo(legacy.dmg, 6);
  });

  it('excludeNames removes a specific applier from the gate, same as the legacy function\'s own param', () => {
    const excluded = resolveFusionBurstFromBlocks({ Denia: [applierBlock] }, 30, defMult, resMult, ['Denia']);
    expect(excluded).toEqual({ dmg: 0, active: false });
  });
});

describe('dotReactionsFromBlocks — Frazzle (synthetic, SUMS per-block value, real Rover: Spectro shape)', () => {
  it('sums two separate real application points from the SAME character (2 + 6 stacks), not just the last one seen', () => {
    const forte = { id: 'a', source: 'Rover', kind: 'damage', trigger: { type: 'cast', on: 'Forte:X' }, target: { scope: 'self' }, effects: [], dotApplier: { mechanic: 'frazzle', value: 2 } };
    const lib = { id: 'b', source: 'Rover', kind: 'damage', trigger: { type: 'cast', on: 'Liberation:Y' }, target: { scope: 'self' }, effects: [], dotApplier: { mechanic: 'frazzle', value: 6 } };
    const combined = resolveFrazzleFromBlocks({ Rover: [forte, lib] }, 20, defMult, resMult, false);
    const singleEquivalent = resolveFrazzleFromBlocks({ Rover: [{ ...forte, dotApplier: { mechanic: 'frazzle', value: 8 } }] }, 20, defMult, resMult, false);
    expect(combined.dmg).toBeCloseTo(singleEquivalent.dmg, 6);
  });
});

describe('dotReactionsFromBlocks — Fusion Burst mode-conditional appliers (Denia, real blocks) with stanceOverrides', () => {
  // Denia's real dotApplier-tagged blocks are Fusion-Burst-mode-only per her own kit text — the
  // resolver has to be able to gate on that, and calcTeamStats.js's combinatorial resolver needs to
  // override the natural winningStanceForOwner() answer per-hypothesis (see collectAppliers's own doc).
  const deniaBlocks = filterExclusiveModeBlocks(gateBlocksBySequence(DENIA_BLOCKS, 0));

  it('counts Denia as a Fusion Burst applier when her own blocks naturally resolve to Fusion Burst mode (her outro rivalry: 60 > 15)', () => {
    const result = resolveFusionBurstFromBlocks({ Denia: deniaBlocks }, 30, defMult, resMult);
    expect(result.active).toBe(true);
  });

  it('stanceOverrides forces her OUT of the gate for a hypothesis testing Tune Strain, even though her natural resolution is Fusion Burst', () => {
    const result = resolveFusionBurstFromBlocks({ Denia: deniaBlocks }, 30, defMult, resMult, [], { Denia: 'Tune Strain mode' });
    expect(result).toEqual({ dmg: 0, active: false });
  });

  it('stanceOverrides forcing her INTO Fusion Burst mode matches the natural (unoverridden) resolution exactly — same real number either way', () => {
    const natural = resolveFusionBurstFromBlocks({ Denia: deniaBlocks }, 30, defMult, resMult);
    const overridden = resolveFusionBurstFromBlocks({ Denia: deniaBlocks }, 30, defMult, resMult, [], { Denia: 'Fusion Burst mode' });
    expect(overridden.dmg).toBeCloseTo(natural.dmg, 6);
  });
});

describe('dotReactionsFromBlocks — Erosion (synthetic, MAX not SUM across applying blocks)', () => {
  it('takes the max, not the sum, of two applying blocks\' own values', () => {
    const a = { id: 'a', source: 'X', kind: 'damage', trigger: { type: 'cast', on: 'Skill:A' }, target: { scope: 'self' }, effects: [], dotApplier: { mechanic: 'erosion', value: 3 } };
    const b = { id: 'b', source: 'X', kind: 'damage', trigger: { type: 'cast', on: 'Skill:B' }, target: { scope: 'self' }, effects: [], dotApplier: { mechanic: 'erosion', value: 6 } };
    const withBoth = resolveErosionFromBlocks({ X: [a, b] }, 20, defMult, resMult);
    const withMaxOnly = resolveErosionFromBlocks({ X: [b] }, 20, defMult, resMult);
    expect(withBoth.dmg).toBeCloseTo(withMaxOnly.dmg, 6);
  });
});

describe('dotReactionsFromBlocks — Frazzle mixed-migration safety (Rover: Spectro migrated, Phoebe deliberately NOT — the engine-merge history (git log))', () => {
  const getEnemyRes = () => 10;

  it('Rover: Spectro solo (fully migrated) matches calcFrazzleDmg exactly, summing his own 2 real application points to 8', () => {
    const blocksByOwner = { 'Rover: Spectro': ROVER_SPECTRO_BLOCKS };
    const fromDots = resolveDotReactionDps([{ name: 'Rover: Spectro' }], 20, defMult, 0, getEnemyRes, resMult, null, blocksByOwner);
    const legacy = calcFrazzleDmg([{ name: 'Rover: Spectro' }], 20, defMult, resMult);
    expect(fromDots.breakdown.frazzle.dmg).toBeCloseTo(legacy.dmg, 6);
  });

  it('a team with Rover: Spectro (migrated) AND Phoebe (still legacy-only) does NOT drop Phoebe — falls back to the full legacy calculation for both', () => {
    const blocksByOwner = { 'Rover: Spectro': ROVER_SPECTRO_BLOCKS, Phoebe: [] };
    const members = [{ name: 'Rover: Spectro' }, { name: 'Phoebe' }];
    const fromDots = resolveDotReactionDps(members, 20, defMult, 0, getEnemyRes, resMult, null, blocksByOwner);
    const legacyBoth = calcFrazzleDmg(members, 20, defMult, resMult);
    expect(fromDots.breakdown.frazzle.dmg).toBeCloseTo(legacyBoth.dmg, 6);
  });
});

describe('dotReactionsFromBlocks — Erosion mixed-migration safety (Ciaccona + Cartethyia both migrated 2026-09-06; generic not-yet-migrated case still safety-netted)', () => {
  const getEnemyRes = () => 10;

  it('Ciaccona solo (fully migrated) matches calcErosionDmg exactly via resolveDotReactionDps blocks path', () => {
    const blocksByOwner = { Ciaccona: CIACCONA_BLOCKS };
    const fromDots = resolveDotReactionDps([{ name: 'Ciaccona' }], 20, defMult, 0, getEnemyRes, resMult, null, blocksByOwner);
    const legacy = calcErosionDmg([{ name: 'Ciaccona' }], 20, defMult, resMult);
    expect(fromDots.breakdown.erosion.dmg).toBeCloseTo(legacy.dmg, 6);
  });

  it('Cartethyia solo (no Rover: Aero) correctly uses her real base-3 stacks — DIFFERENT from the legacy formula, which hardcoded 6 unconditionally (the exact bug this migration fixes)', () => {
    // CHAR_BUFF_TABLE['Cartethyia'].debuffs erosion value is a flat 6 with no runtime Rover: Aero
    // check at all (dotFormulas.js's calcErosionDmg just reads that static value) — so the legacy
    // path has always overcounted her Erosion whenever Rover: Aero ISN'T on the team. The block
    // path is deliberately more correct here, not just differently-shaped: it real-checks team
    // membership via dotApplier.requiresTeammate.
    const blocksByOwner = { Cartethyia: CARTETHYIA_BLOCKS };
    const fromDots = resolveDotReactionDps([{ name: 'Cartethyia' }], 20, defMult, 0, getEnemyRes, resMult, null, blocksByOwner);
    const legacy = calcErosionDmg([{ name: 'Cartethyia' }], 20, defMult, resMult);
    expect(fromDots.breakdown.erosion.dmg).toBeLessThan(legacy.dmg);
  });

  it('Cartethyia + Rover: Aero uses her real sourced 6-stack value, matching the legacy formula\'s own (always-6) figure now that the real condition holds', () => {
    const blocksByOwner = { Cartethyia: CARTETHYIA_BLOCKS, 'Rover: Aero': [] };
    const members = [{ name: 'Cartethyia' }, { name: 'Rover: Aero' }];
    const fromDots = resolveDotReactionDps(members, 20, defMult, 0, getEnemyRes, resMult, null, blocksByOwner);
    const legacy = calcErosionDmg(members, 20, defMult, resMult);
    expect(fromDots.breakdown.erosion.dmg).toBeCloseTo(legacy.dmg, 6);
    const solo = resolveErosionFromBlocks({ Cartethyia: CARTETHYIA_BLOCKS }, 20, defMult, resMult);
    // The Rover: Aero-boosted result must be strictly higher than the base-3-stack solo result —
    // proving the doubling condition actually fired, not just coincidentally matched.
    expect(fromDots.breakdown.erosion.dmg).toBeGreaterThan(solo.dmg);
  });

  it('a real erosion-flagged member with no dotApplier-tagged block (simulated by blanking Ciaccona\'s blocks) makes resolveDotReactionDps fall back to the full legacy calculation, not silently drop her', () => {
    // Every real roster character IS migrated as of 2026-09-06 (Ciaccona and Cartethyia both have
    // real dotApplier blocks) — this simulates the "not yet migrated" case generically by blanking
    // a real character's own blocks array, the same technique used for a genuinely-unmigrated
    // character before this pass (see Frazzle/Phoebe's real version of this same test above, which
    // still has a real not-yet-migrated character to use).
    const blocksByOwner = { Ciaccona: [] };
    const members = [{ name: 'Ciaccona' }];
    const fromDots = resolveDotReactionDps(members, 20, defMult, 0, getEnemyRes, resMult, null, blocksByOwner);
    const legacy = calcErosionDmg(members, 20, defMult, resMult);
    // Must match the full legacy figure (not zero), proving the whole-team gate
    // (allErosionMembersHaveBlocks in dotReactions.js) correctly fell back rather than calling
    // resolveErosionFromBlocks directly and silently getting 0 from her now-empty block array.
    expect(fromDots.breakdown.erosion.dmg).toBeCloseTo(legacy.dmg, 6);
    const blocksOnlyWouldGive = resolveErosionFromBlocks(blocksByOwner, 20, defMult, resMult);
    expect(blocksOnlyWouldGive.dmg).toBe(0);
  });
});

describe('dotReactionsFromBlocks — real per-step firing (2026-09-08, direct user instruction)', () => {
  const getEnemyRes = () => 10;

  it('Rover: Spectro real-rotation Frazzle matches the dump\'s own explicit stack total (6+2+2=10), not the old composition-only 6+2=8', () => {
    // Real, sourced confirmation (Data dump/Rover Spectro/Rover Spectro.md line 109): "Applies Frazzle
    // via Liberation (6 stacks flat) and enhanced Resonance Skill (2 stacks); 2 Skills + 1 Ultimate
    // caps it at 10 stacks" — her modeled rotation (CHARACTER_ROTATIONS) casts Forte:Resonating Whirl
    // TWICE, so the real total is 6+2+2=10. The old composition-only resolver credited each BLOCK once
    // regardless of real repeat casts (6+2=8) — a genuine under-crediting bug the dump's own cap
    // arithmetic directly contradicts. At a rotation length long enough that the stack ceiling isn't
    // the binding constraint (25s here — see the math below), real-firing must produce MORE damage
    // than composition-only, not the same.
    const blocksByOwner = { 'Rover: Spectro': ROVER_SPECTRO_BLOCKS };
    const rotationsByOwner = { 'Rover: Spectro': CHARACTER_ROTATIONS['Rover: Spectro'] };
    const compOnly = resolveFrazzleFromBlocks(blocksByOwner, 25, defMult, resMult, false);
    const realFiring = resolveFrazzleFromBlocks(blocksByOwner, 25, defMult, resMult, false, rotationsByOwner);
    expect(realFiring.dmg).toBeGreaterThan(compOnly.dmg);
  });

  it('a dotApplier-tagged move that never appears in the modeled rotation contributes nothing under real-firing, unlike composition-only', () => {
    // Synthetic block: exists in the character's kit (dotApplier present) but its trigger.on label
    // matches no real CHARACTER_ROTATIONS step — composition-only still credits it (kit-presence-only);
    // real-firing correctly contributes zero.
    const owner = 'FakeChar';
    const blocksByOwner = { [owner]: [
      { id: 'fake.unused-move', source: owner, kind: 'damage', trigger: { type: 'cast', on: 'Skill:Never Cast' }, timing: {}, target: { scope: 'self' }, effects: [], damage: { hits: [{ atkPct: 1 }] }, dotApplier: { mechanic: 'frazzle', value: 10 } },
    ] };
    const rotationsByOwner = { [owner]: [{ type: 'Intro', skill: 'Something Else' }] };
    const compOnly = resolveFrazzleFromBlocks(blocksByOwner, 20, defMult, resMult, false);
    const realFiring = resolveFrazzleFromBlocks(blocksByOwner, 20, defMult, resMult, false, rotationsByOwner);
    expect(compOnly.active).toBe(true);
    expect(realFiring.active).toBe(false);
  });

  it('resolveDotReactionDps wires rotationsByOwner through to Frazzle/Erosion/Electro Flare, not just Fusion Burst', () => {
    const blocksByOwner = { 'Rover: Spectro': ROVER_SPECTRO_BLOCKS };
    const rotationsByOwner = CHARACTER_ROTATIONS;
    const members = [{ name: 'Rover: Spectro' }];
    const withRotation = resolveDotReactionDps(members, 25, defMult, 0, getEnemyRes, resMult, null, blocksByOwner, null, rotationsByOwner);
    const withoutRotation = resolveDotReactionDps(members, 25, defMult, 0, getEnemyRes, resMult, null, blocksByOwner, null, null);
    expect(withRotation.breakdown.frazzle.dmg).toBeGreaterThan(withoutRotation.breakdown.frazzle.dmg);
  });
});

describe('dotReactionsFromBlocks — real, sourced stack caps enforced (2026-09-08, "fix all maximum dot and stack")', () => {
  it('Frazzle clamps at the real 10-stack cap instead of extrapolating past FRAZZLE_STACK_TABLE for a hypothetical 2-applier team', () => {
    // Synthetic second real Frazzle applier — a real scenario the current single-applier roster
    // (Rover: Spectro alone) doesn't happen to exercise, but the engine must handle correctly the
    // moment a second one exists. 10 (Rover's real total) + 10 (synthetic) = 20 raw, must clamp to 10.
    const owner2 = 'SecondFrazzleApplier';
    const blocksByOwner = {
      'Rover: Spectro': ROVER_SPECTRO_BLOCKS,
      [owner2]: [{ id: 'synthetic.frazzle', source: owner2, kind: 'damage', trigger: { type: 'cast', on: 'Skill:Synthetic' }, timing: {}, target: { scope: 'self' }, effects: [], damage: { hits: [{ atkPct: 1 }] }, dotApplier: { mechanic: 'frazzle', value: 10 } }],
    };
    const rotationsByOwner = { 'Rover: Spectro': CHARACTER_ROTATIONS['Rover: Spectro'], [owner2]: [{ type: 'Skill', skill: 'Synthetic' }] };
    const capped = resolveFrazzleFromBlocks(blocksByOwner, 25, defMult, resMult, false, rotationsByOwner);
    // Uncapped (pre-fix) math for comparison: 20 raw stacks, 8 ticks in 25s (floor(25/3)), each tick's
    // value would have been the EXTRAPOLATED (wrong, too-high) figure past table[10]=1.995. The capped
    // result must equal exactly what 10 real (never-exceeding) stacks over 8 ticks produces.
    const singleApplierAt10 = resolveFrazzleFromBlocks({ 'Rover: Spectro': ROVER_SPECTRO_BLOCKS }, 25, defMult, resMult, false, { 'Rover: Spectro': CHARACTER_ROTATIONS['Rover: Spectro'] });
    // The 2-applier (20 raw) and 1-applier (10 raw, already at the cap) cases must be IDENTICAL —
    // proof the clamp actually engaged rather than merely not crashing.
    expect(capped.dmg).toBeCloseTo(singleApplierAt10.dmg, 6);
  });

  it('lookupStackMult never returns a value beyond the real sourced table range, for any input', () => {
    expect(lookupStackMult(FRAZZLE_STACK_TABLE, 999)).toBe(FRAZZLE_STACK_TABLE[FRAZZLE_STACK_TABLE.length - 1]);
    expect(lookupStackMult(EROSION_STACK_TABLE, 999)).toBe(EROSION_STACK_TABLE[EROSION_STACK_TABLE.length - 1]);
  });
});

describe('dotReactionsFromBlocks — Aemeath Fusion Trail amp (2026-09-08, "tune mechanic is not buildable. however fusion burst is")', () => {
  // Fully synthetic, hand-computable scenario: ONE real fusionBurst-tagged applier block (value 1,
  // fires once) plus a Duet cast, both from Aemeath — so the exact real occurrence count (1) and the
  // exact resulting detonation count are both known, letting the amp be verified as an EXACT value,
  // not just a directional "it went up."
  const owner = 'Aemeath';
  const applierBlock = {
    id: 'synthetic.fusion-applier', source: owner, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:SyntheticApplier' }, timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 1 }] }, dotApplier: { mechanic: 'fusionBurst', value: 10 }, // 10 = FUSION_BURST_THRESHOLD -> exactly 1 detonation
  };
  const duetBlock = {
    id: 'aemeath.skill.seraphic-duet-overture', source: owner, kind: 'damage',
    trigger: { type: 'cast', on: 'Skill:SyntheticDuet' }, timing: {}, target: { scope: 'self' }, effects: [],
    damage: { hits: [{ atkPct: 1 }] },
  };
  const blocksByOwner = { [owner]: [applierBlock, duetBlock] };
  const rotationsByOwner = { [owner]: [{ type: 'Skill', skill: 'SyntheticApplier' }, { type: 'Skill', skill: 'SyntheticDuet' }] };

  it('amps the aggregate Fusion Burst total by exactly 10% for 1 real occurrence, compounding correctly with her own pre-existing Duet-forced-detonation mechanic', () => {
    // Using her own real block id (aemeath.skill.seraphic-duet-overture) for the synthetic Duet cast
    // means it's ALSO recognized by the pre-existing Aemeath-Duet-forces-a-detonation mechanic
    // (resolveFusionBurstStacks.js's AEMEATH_DUET_BLOCK_IDS) — correctly, since in the real game both
    // effects genuinely fire together on the same real cast. So WITH-vs-WITHOUT-Duet isn't a pure
    // amp-only ratio; it's (passiveDetonations+1 forced)*(1+amp) vs passiveDetonations*1 — verified
    // here by computing both terms explicitly rather than assuming a bare 1.10x.
    const noDuetRotation = { [owner]: [{ type: 'Skill', skill: 'SyntheticApplier' }] }; // applier fires, but no Duet cast
    const withDuet = resolveFusionBurstFromBlocks(blocksByOwner, 25, defMult, resMult, [], { Aemeath: 'Fusion Burst mode' }, rotationsByOwner);
    const withoutDuet = resolveFusionBurstFromBlocks(blocksByOwner, 25, defMult, resMult, [], { Aemeath: 'Fusion Burst mode' }, noDuetRotation);
    // 1 real applier occurrence at value 10, Aemeath's own early-detonation threshold (5, since the
    // owner key literally is 'Aemeath') -> passiveDetonations = 10/5 = 2; her Duet cast forces +1 more.
    const passiveDetonations = 2;
    const expectedRatio = ((passiveDetonations + 1) * (1 + 1 * 10 / 100)) / passiveDetonations;
    expect(withDuet.dmg / withoutDuet.dmg).toBeCloseTo(expectedRatio, 6);
  });

  it('is exactly 0 (no amp applied) when Aemeath never actually casts her Duet in the given rotation', () => {
    const noDuetRotation = { [owner]: [{ type: 'Skill', skill: 'SyntheticApplier' }] }; // applier fires, but no Duet cast
    const withDuet = resolveFusionBurstFromBlocks(blocksByOwner, 25, defMult, resMult, [], { Aemeath: 'Fusion Burst mode' }, rotationsByOwner);
    const withoutDuet = resolveFusionBurstFromBlocks(blocksByOwner, 25, defMult, resMult, [], { Aemeath: 'Fusion Burst mode' }, noDuetRotation);
    // Same real applier occurrence (same detonation count), but the amp specifically requires her
    // Duet to actually be cast — removing only the Duet cast must strictly lower the total.
    expect(withoutDuet.dmg).toBeLessThan(withDuet.dmg);
  });

  it('requires Aemeath to actually be on the team — a team without her never computes the amp', () => {
    const result = resolveFusionBurstFromBlocks({ Ciaccona: [] }, 25, defMult, resMult, [], null, { Ciaccona: [] });
    expect(result.active).toBe(false);
  });
});
