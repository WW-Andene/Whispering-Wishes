/**
 * Phase 2 trigger-engine parity test — Jinhsi (second schema-extension case: same-
 * character cast-order forfeit windows, the actual case design question 2 in
 * PHASE2_PLAN.md is about).
 *
 * Verifies JINHSI_BLOCKS matches the legacy flat tables (CHAR_BUFF_TABLE/
 * RESONANCE_CHAIN_DATA) and exercises the new 'windowed-cast' trigger type added for
 * her two 5-second cast-order windows (Overflowing Radiance and Illuminous Epiphany).
 */
import { describe, it, expect } from 'vitest';
import { createStats } from '../features/teams/calcEngine.js';
import { CHAR_BUFF_TABLE, RESONANCE_CHAIN_DATA, CHARACTER_ROTATIONS } from '../data/characters.js';
import { resolveTriggerBlocks } from '../engine/resolver/gating/triggerEngine.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { JINHSI_BLOCKS } from '../engine/characterBlocks/jinhsi.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Jinhsi', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(JINHSI_BLOCKS, 'Jinhsi');
  });

  it('Radiant Surge self-buff matches CHAR_BUFF_TABLE.selfBuffs', () => {
    const legacy = CHAR_BUFF_TABLE['Jinhsi'].selfBuffs[0];
    const block = JINHSI_BLOCKS.find(b => b.id === 'jinhsi.selfbuff.radiant-surge');
    expect(block.effects[0].value).toBe(legacy.value);
  });

  it('Resonance Chain S1/S3/S4/S5/S6 values match RESONANCE_CHAIN_DATA', () => {
    const rc = RESONANCE_CHAIN_DATA['Jinhsi'];
    const byId = id => JINHSI_BLOCKS.find(b => b.id === id);
    expect(byId('jinhsi.chain.s1-abyssal-ascension').effects[0].value).toBe(rc.s1.skillDmg);
    expect(byId('jinhsi.chain.s3-celestial-incarnate').effects[0].value).toBe(rc.s3.atkPct);
    expect(byId('jinhsi.chain.s4-benevolent-grace').effects[0].value).toBe(rc.s4.allDmg);
    expect(byId('jinhsi.chain.s5-frostfire-illumination').effects[0].value).toBe(rc.s5.libDmg);
    expect(byId('jinhsi.chain.s6-thawing-triumph').effects[0].value).toBe(rc.s6.skillDmg);
  });

  // Found 2026-09-08 (full-kit audit): S2's real effect ("staying out of combat 4s+ restores 50
  // Incandescence") is pure out-of-combat resource utility with ZERO in-combat DPS component — was
  // `totalMult: 5`, an unexplained fabricated placeholder (in BOTH RESONANCE_CHAIN_DATA and this
  // block's own effects), same "zero, don't guess" class already fixed for Iuno's S4/Jianxin's
  // S1-S3/S5. Also: this block's own `kind:'utility'` already excluded it from every
  // effect-processing list in resolveHitComposedDps.js, so the old totalMult:5 was silently dead
  // regardless of its value — zeroing it removes a confusing fabricated number, not a functional change.
  it('S2 is correctly zeroed (pure resource utility, no fabricated placeholder value)', () => {
    const rc = RESONANCE_CHAIN_DATA['Jinhsi'];
    expect(rc.s2).toEqual({});
    const s2 = JINHSI_BLOCKS.find(b => b.id === 'jinhsi.chain.s2-chronofrost-repose');
    expect(s2.effects).toEqual([]);
    expect(s2.kind).toBe('utility');
  });

  // Found 2026-09-08 (full-kit audit): verified directly, not assumed, that the two `windowed-cast`
  // utility blocks (jinhsi.window.*) are currently non-gating — the real damage blocks fire off their
  // own independent 'cast' triggers regardless of these blocks' pass/fail state, and both utility
  // blocks carry `effects:[]` so even a successful window-check contributes nothing. See this file's
  // own header comment (in jinhsi.blocks.js) for the full reasoning — kept as real, sourced kit
  // documentation, not deleted, but no longer described as functional gating.
  it('the two windowed-cast utility blocks are confirmed non-gating (documentation only) — removing them produces a byte-identical DPS total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Jinhsi'], JINHSI_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withWindows = resolveHitComposedDps(JINHSI_BLOCKS, steps, ctx, 3000, 'spectro', 'Main DPS');
    const windowIds = new Set(['jinhsi.window.overflowing-radiance', 'jinhsi.window.illuminous-epiphany']);
    const withoutWindows = resolveHitComposedDps(JINHSI_BLOCKS.filter(b => !windowIds.has(b.id)), steps, ctx, 3000, 'spectro', 'Main DPS');
    expect(withWindows.totalDamage).toBe(withoutWindows.totalDamage);
  });

  // Found 2026-09-08 (full-kit audit): CHARACTER_ROTATIONS['Jinhsi'] (the "Standard Rotation
  // (Opener)") never casts Intro — confirmed directly — so S3's real +50% ATK chain bonus (a real,
  // sequence-6-gated node) contributes ZERO to this calculator's output even at full Sequence 6. Her
  // real "Loop Rotation" does cast Intro every cycle; this simplified single-opener model just
  // doesn't represent that. Documented on the block itself rather than left silent.
  it("S3's real +50% ATK bonus contributes zero at Sequence 6, since CHARACTER_ROTATIONS['Jinhsi'] never casts Intro (disclosed limitation, not a data bug)", () => {
    const rotation = CHARACTER_ROTATIONS['Jinhsi'];
    expect(rotation.some(s => s.type === 'Intro')).toBe(false);
    const steps = deriveStepsFromRotation(rotation, JINHSI_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withS3 = resolveHitComposedDps(JINHSI_BLOCKS, steps, ctx, 3000, 'spectro', 'Main DPS', null, 6);
    const withoutS3 = resolveHitComposedDps(JINHSI_BLOCKS.filter(b => b.id !== 'jinhsi.chain.s3-celestial-incarnate'), steps, ctx, 3000, 'spectro', 'Main DPS', null, 6);
    expect(withS3.totalDamage).toBe(withoutS3.totalDamage);
  });

  // Found 2026-09-08 (full-kit audit): CHARACTER_ROTATIONS['Jinhsi'] includes a real 'Outro:Temporal
  // Bender' step, but this file previously had no block for it at all.
  it('Outro Temporal Bender has a documentation-only utility block (real step, zero DPS component — pure resource-generation-rate utility)', () => {
    const outro = JINHSI_BLOCKS.find(b => b.id === 'jinhsi.outro.temporal-bender');
    expect(outro).toBeDefined();
    expect(outro.kind).toBe('utility');
    expect(outro.effects).toEqual([]);
    expect(CHAR_BUFF_TABLE['Jinhsi'].outroBuffs).toEqual([]);
  });

  it('windowed-cast trigger is keyed by its opensOn triggers, and both windows are distinct', () => {
    const w1 = JINHSI_BLOCKS.find(b => b.id === 'jinhsi.window.overflowing-radiance');
    const w2 = JINHSI_BLOCKS.find(b => b.id === 'jinhsi.window.illuminous-epiphany');
    expect(w1.trigger.type).toBe('windowed-cast');
    expect(w1.trigger.opensOn).toEqual(['cast:Basic ATK:Slash of Breaking Dawn Stage 1-4', "cast:Intro:Loong's Halo"]);
    expect(w1.trigger.windowSeconds).toBe(5);
    expect(w2.trigger.opensOn).toEqual(['cast:Forte:Incarnation - Basic Attack Stage 1-4']);
    expect(w2.trigger.windowSeconds).toBe(5);

    // Not fired unless the caller (a future rotation simulator) explicitly asserts each windowed
    // cast landed within its window — proves the two windows resolve independently and don't throw.
    const statsNeither = createStats();
    expect(() => resolveTriggerBlocks(JINHSI_BLOCKS, {
      firedTriggers: new Set(['passive']), targetElementLower: 'spectro', targetRole: 'Main DPS',
    }, statsNeither)).not.toThrow();

    const statsBoth = createStats();
    expect(() => resolveTriggerBlocks(JINHSI_BLOCKS, {
      firedTriggers: new Set([
        'passive',
        "windowed-cast:cast:Basic ATK:Slash of Breaking Dawn Stage 1-4|cast:Intro:Loong's Halo",
        'windowed-cast:cast:Forte:Incarnation - Basic Attack Stage 1-4',
      ]),
      targetElementLower: 'spectro', targetRole: 'Main DPS',
    }, statsBoth)).not.toThrow();
  });

  it('S4 team allDmg buff is cast-scoped-but-persistent (20s), applies regardless of target element (not Spectro-restricted)', () => {
    // statsNoCast still picks up the always-on Radiant Surge passive (elemDmg 20) — only S4's
    // OWN contribution is gated on the Liberation cast having fired.
    // Note: allDmg is a universal (non-element-gated) bonus, and calcEngine folds it straight into
    // stats.elemDmg on resolution (see calcEngine.js's `case 'allDmg': ... stats.elemDmg += value`) —
    // there's no separate stats.allDmg bucket, so the 20 vs 40 delta below IS the S4 contribution.
    const statsNoCast = createStats();
    resolveTriggerBlocks(JINHSI_BLOCKS, {
      firedTriggers: new Set(['passive']), targetElementLower: 'spectro', targetRole: 'Main DPS',
    }, statsNoCast);
    expect(statsNoCast.elemDmg).toBe(20);

    const statsWithCast = createStats();
    resolveTriggerBlocks(JINHSI_BLOCKS, {
      firedTriggers: new Set(['passive', 'cast:Liberation:Purge of Light']),
      targetElementLower: 'spectro', targetRole: 'Main DPS',
    }, statsWithCast);
    // elemDmg accumulates both the always-on Radiant Surge (20) and S4's team allDmg buff (20).
    expect(statsWithCast.elemDmg).toBe(40);

    // Real regression check for the fix (2026-09-04): S4 is a generic "Attribute DMG Bonus" — it must
    // NOT be gated to Spectro-element targets, since it buffs each teammate on their own element. Before
    // the fix this was `stat: 'elemDmg'` + `condition: { element: 'spectro' }`, which would have
    // resolved to 20 (Radiant Surge only) for a non-Spectro target — the S4 contribution silently lost.
    const statsNonSpectroTarget = createStats();
    resolveTriggerBlocks(JINHSI_BLOCKS, {
      firedTriggers: new Set(['passive', 'cast:Liberation:Purge of Light']),
      targetElementLower: 'fusion', targetRole: 'Main DPS',
    }, statsNonSpectroTarget);
    expect(statsNonSpectroTarget.elemDmg).toBe(40);

    const s4 = JINHSI_BLOCKS.find(b => b.id === 'jinhsi.chain.s4-benevolent-grace');
    expect(s4.timing.duration).toBe(20);
    expect(s4.condition).toBeUndefined();
  });

  it('S6 carries both the unscoped +45% skillDmg AND a 2nd +45% scoped to Illuminous Epiphany only (the real compounding conversion-rate bonus)', () => {
    const s6 = JINHSI_BLOCKS.find(b => b.id === 'jinhsi.chain.s6-thawing-triumph');
    expect(s6.effects).toHaveLength(2);
    const unscoped = s6.effects.find(e => !e.scopedToBlockId);
    const scoped = s6.effects.find(e => e.scopedToBlockId);
    expect(unscoped.stat).toBe('skillDmg');
    expect(unscoped.value).toBe(45);
    expect(scoped.stat).toBe('skillDmg');
    expect(scoped.value).toBe(45);
    expect(scoped.scopedToBlockId).toBe('jinhsi.skill.illuminous-epiphany');
  });
});
