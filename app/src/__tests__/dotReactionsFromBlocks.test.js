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
