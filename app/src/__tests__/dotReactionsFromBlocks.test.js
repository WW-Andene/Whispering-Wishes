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
} from '../engine/dotReactionsFromBlocks.js';
import { resolveDotReactionDps } from '../engine/dotReactions.js';
import { BULING_BLOCKS } from '../engine/characterBlocks/buling.blocks.js';
import { DENIA_BLOCKS } from '../engine/characterBlocks/denia.blocks.js';
import { CIACCONA_BLOCKS } from '../engine/characterBlocks/ciaccona.blocks.js';
import { ROVER_SPECTRO_BLOCKS } from '../engine/characterBlocks/roverspectro.blocks.js';
import { filterExclusiveModeBlocks, gateBlocksBySequence } from '../engine/sequenceGating.js';

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

describe('dotReactionsFromBlocks — Erosion mixed-migration safety (Ciaccona migrated, Cartethyia deliberately NOT — the engine-merge history (git log))', () => {
  const getEnemyRes = () => 10;

  it('Ciaccona solo (fully migrated) matches calcErosionDmg exactly via resolveDotReactionDps blocks path', () => {
    const blocksByOwner = { Ciaccona: CIACCONA_BLOCKS };
    const fromDots = resolveDotReactionDps([{ name: 'Ciaccona' }], 20, defMult, 0, getEnemyRes, resMult, null, blocksByOwner);
    const legacy = calcErosionDmg([{ name: 'Ciaccona' }], 20, defMult, resMult);
    expect(fromDots.breakdown.erosion.dmg).toBeCloseTo(legacy.dmg, 6);
  });

  it('a team with Ciaccona (migrated) AND Cartethyia (still legacy-only) does NOT silently drop Cartethyia — falls back to the full legacy calculation for both rather than only counting Ciaccona\'s blocks', () => {
    const blocksByOwner = { Ciaccona: CIACCONA_BLOCKS, Cartethyia: [] }; // Cartethyia has no dotApplier-tagged blocks yet
    const members = [{ name: 'Ciaccona' }, { name: 'Cartethyia' }];
    const fromDots = resolveDotReactionDps(members, 20, defMult, 0, getEnemyRes, resMult, null, blocksByOwner);
    const legacyBoth = calcErosionDmg(members, 20, defMult, resMult);
    // Must match the full legacy (both-considered) result, NOT the blocks-only (Ciaccona-only) result,
    // proving Cartethyia's real contribution wasn't silently dropped by the migration.
    expect(fromDots.breakdown.erosion.dmg).toBeCloseTo(legacyBoth.dmg, 6);
    const blocksOnlyWouldGive = resolveErosionFromBlocks(blocksByOwner, 20, defMult, resMult);
    // Cartethyia's real legacy value (6) is higher than Ciaccona's (3) -- if she'd been dropped, the
    // blocks-only number would differ from the correct legacy-both number.
    expect(blocksOnlyWouldGive.dmg).not.toBeCloseTo(legacyBoth.dmg, 6);
  });
});
