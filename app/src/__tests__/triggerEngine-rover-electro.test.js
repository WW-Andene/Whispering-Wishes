/**
 * Phase 2 trigger-engine parity test — Rover: Electro proof-of-concept.
 *
 * Verifies that resolving ROVER_ELECTRO_BLOCKS (engine/characterBlocks/roverElectro.blocks.js)
 * through triggerEngine.js's resolveTriggerBlocks() produces the SAME stat contributions as
 * reading the legacy flat tables (RESONANCE_CHAIN_DATA / CHAR_BUFF_TABLE) directly, for the
 * specific values the block set claims to carry (S3-S6 Resonance Chain buffs and the tap-
 * Overshock team ATK self-buff). This is the gate for trusting a converted character's blocks
 * before rolling the trigger engine out further — see triggerBlocks.schema.js's rollout note.
 */
import { describe, it, expect } from 'vitest';
import { createStats, applyResonanceChain } from '../features/teams/calcEngine.js';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { ROVER_ELECTRO_BLOCKS } from '../engine/characterBlocks/roverElectro.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Rover: Electro', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(ROVER_ELECTRO_BLOCKS, 'Rover: Electro');
  });

  // Fixed 2026-09-09 (full-kit audit): S3/S6 no longer parity-match RESONANCE_CHAIN_DATA's raw
  // skillDmg:20+skillDmg:20=40 sum — this is now a DOCUMENTED, DELIBERATE divergence, not a
  // regression. The raw flat table can only express a blunt whole-kit skillDmg bonus (its own
  // applyResonanceChain has no per-move scoping mechanism, same limitation already documented for
  // several other characters' RESONANCE_CHAIN_DATA rows this session), but S3's real kit text names
  // ONLY Overshock and S6 names ONLY Thrum of All Sounds/Thunder Bane (neither of which has a block —
  // that branch requires HOLDing Overshock into Apex Resonance, which the modeled Standard Rotation
  // never does). Confirmed via direct measurement that the pre-fix unscoped skillDmg:20+20 was
  // silently over-crediting rover-electro.skill.thunderclap (a skillDmg block neither S3 nor S6 names)
  // — S3 is now scopedToBlockId'd to Overshock only (contributes skillDmg:20 in this aggregate-routing
  // test, since scopedToBlockId is ignored by resolveTriggerBlocks/applyBuff's flat stat accumulator
  // and only enforced by the real hit-composed engine, resolveHitComposedDps), and S6 is now a real
  // no-op (kind:'utility', empty effects) since its named targets don't exist as blocks.
  it('Resonance Chain S3 (scoped)/S4/S5 route correctly; S6 is now a documented no-op (was over-crediting unrelated moves)', () => {
    const legacyStats = createStats();
    applyResonanceChain(legacyStats, 'Rover: Electro', 6, true);
    // legacyStats.skillDmg is 40 (S3+S6 summed, per the flat table's own coarse model) — the block
    // engine intentionally no longer matches this raw sum, see comment above.
    expect(legacyStats.skillDmg).toBe(40);

    const blockStats = createStats();
    const firedTriggers = new Set(['passive']);
    resolveTriggerBlocks(ROVER_ELECTRO_BLOCKS, {
      firedTriggers, targetElementLower: 'electro', targetRole: 'Sub DPS',
    }, blockStats);

    // Only S3's scoped skillDmg:20 contributes now (S6 is an empty-effects no-op).
    expect(blockStats.skillDmg).toBe(20);
    expect(blockStats.libDmg).toBe(legacyStats.libDmg);
    expect(blockStats.cd - 150).toBe(legacyStats.cd - 150); // both start from BASE_CRIT_DMG

    const s3 = ROVER_ELECTRO_BLOCKS.find(b => b.id === 'rover-electro.chain.s3-alchemy-of-wonders');
    expect(s3.effects[0].scopedToBlockId).toBe('rover-electro.forte.overshock');
    const s6 = ROVER_ELECTRO_BLOCKS.find(b => b.id === 'rover-electro.chain.s6-minds-depths');
    expect(s6.effects).toHaveLength(0);
  });

  it('tap-Overshock team ATK buff matches CHAR_BUFF_TABLE.selfBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Rover: Electro'].selfBuffs.find(b => b.stat === 'atkPct');
    const block = ROVER_ELECTRO_BLOCKS.find(b => b.id === 'rover-electro.selfbuff.overshock-atk');
    expect(block.effects[0].value).toBe(legacy.value);
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it('Rumbling Thunders outro buff matches CHAR_BUFF_TABLE.outroBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Rover: Electro'].outroBuffs[0];
    const block = ROVER_ELECTRO_BLOCKS.find(b => b.id === 'rover-electro.outro.rumbling-thunders');
    expect(block.effects[0].value).toBe(legacy.value);
    expect(block.timing.duration).toBe(legacy.duration);
  });

  it('S1/S2 stay zeroed (no fabricated DPS component) in both the block set and the flat table', () => {
    const legacyStats = createStats();
    applyResonanceChain(legacyStats, 'Rover: Electro', 2, true);
    expect(legacyStats.skillDmg).toBe(0);
    expect(legacyStats.libDmg).toBe(0);

    const s1 = ROVER_ELECTRO_BLOCKS.find(b => b.id === 'rover-electro.chain.s1-celestial-ingenuity');
    const s2 = ROVER_ELECTRO_BLOCKS.find(b => b.id === 'rover-electro.chain.s2-thousandfold-artifice');
    expect(s1.effects).toHaveLength(0);
    expect(s2.effects).toHaveLength(0);
  });

  // Fixed 2026-09-09 (full-kit audit), verified via the real hit-composed engine: S3's scoped +20%
  // must land ONLY on Overshock, never on Thunderclap (a separate skillDmg-categorized block S3's own
  // kit text does not name).
  it("S3's Overshock DMG Multiplier +20% does not leak onto Thunderclap", () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rover: Electro'], ROVER_ELECTRO_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const s0 = resolveHitComposedDps(ROVER_ELECTRO_BLOCKS, steps, ctx, 3000, 'electro', 'Sub DPS', null, 0);
    const s3 = resolveHitComposedDps(ROVER_ELECTRO_BLOCKS, steps, ctx, 3000, 'electro', 'Sub DPS', null, 3);
    const thunderclapAt = (res) => res.hitLog.filter(h => h.blockId === 'rover-electro.skill.thunderclap').reduce((sum, h) => sum + h.damage, 0);
    const overshockAt = (res) => res.hitLog.filter(h => h.blockId === 'rover-electro.forte.overshock').reduce((sum, h) => sum + h.damage, 0);
    expect(thunderclapAt(s3)).toBeCloseTo(thunderclapAt(s0), 5);
    expect(overshockAt(s3)).toBeGreaterThan(overshockAt(s0));
  });

  // Fixed 2026-09-09: S6 must no longer inflate Overshock/Thunderclap now that it's a documented no-op
  // (its real named targets, Thrum of All Sounds/Thunder Bane, have no blocks in the modeled rotation).
  it('S6 no longer inflates Overshock/Thunderclap (real named targets are unmodeled, out-of-rotation moves)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Rover: Electro'], ROVER_ELECTRO_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const s3 = resolveHitComposedDps(ROVER_ELECTRO_BLOCKS, steps, ctx, 3000, 'electro', 'Sub DPS', null, 3);
    const s6 = resolveHitComposedDps(ROVER_ELECTRO_BLOCKS, steps, ctx, 3000, 'electro', 'Sub DPS', null, 6);
    const overshockAt = (res) => res.hitLog.filter(h => h.blockId === 'rover-electro.forte.overshock').reduce((sum, h) => sum + h.damage, 0);
    // Between S3 and S6, only S4 (Liberation-scoped) and S5 (unconditional critDmg, flagged separately)
    // newly activate — neither touches Overshock's own multiplier, so Overshock's damage should not
    // jump from S6 the way it did before this fix (was inflated by a second, erroneous +20%).
    expect(overshockAt(s6) / overshockAt(s3)).toBeLessThan(1.05);
  });

  // Fixed 2026-09-09: dmgFocus was missing 'Basic ATK' despite a genuine 10.6% (23,286) real damage
  // share via rover-electro.basic.deterrence + rover-electro.basic.repel (both already basicDmg).
  it("dmgFocus includes 'Basic ATK' (10.6% of her real damage profile)", () => {
    expect(CHARACTER_DATA['Rover: Electro'].dmgFocus).toEqual(expect.arrayContaining(['Skill', 'Liberation', 'Basic ATK']));
  });
});
