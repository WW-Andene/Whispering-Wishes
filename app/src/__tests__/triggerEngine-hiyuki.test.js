import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, CHARACTER_DATA, SKILL_MULTIPLIERS } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { HIYUKI_BLOCKS } from '../engine/characterBlocks/hiyuki.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Hiyuki', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(HIYUKI_BLOCKS, 'Hiyuki');
  });

  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Hiyuki'];
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s1').effects[0].value).toBe(rc.s1.libDmg);
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s2').effects[0].value).toBe(rc.s2.libDmg);
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s4').effects[0].value).toBe(rc.s4.allDmg);
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s5').effects[0].value).toBe(rc.s5.skillDmg);
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s6').effects[0].value).toBe(rc.s6.critDmg);
  });

  it('S3 is correctly libDmg, not the old wrong heavyDmg category', () => {
    const s3 = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s3');
    expect(s3.effects[0].stat).toBe('libDmg');
  });

  it('S4 is correctly allDmg (team-wide), not the old wrong atkPct category', () => {
    const s4 = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s4');
    expect(s4.effects[0].stat).toBe('allDmg');
    expect(s4.target.scope).toBe('whole-team');
  });

  it('outro and the Crit DMG selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Hiyuki'];
    const outro = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.outro.snowlight-blessing');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const critdmg = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.selfbuff.fine-snow-critdmg');
    expect(critdmg.effects[0].value).toBe(legacy.selfBuffs[0].value);
  });

  // 2026-09-07 (Glacio Bite completeness pass): the old hiyuki.selfbuff.fine-snow-glacio-bite
  // (elemDmg:60, matching legacy.selfBuffs[1]) was a real correctness bug — elemDmg is Glacio DMG
  // Bonus, which the dump's own text says does NOT apply to Glacio Bite ("a distinct multiplier from
  // base Glacio DMG Bonus"), so it was broadly over-buffing Hiyuki's entire kit instead of the
  // (previously nonexistent) Glacio Bite instances. Replaced by a real hiyuki.procdmg.glacio-bite
  // damage block with the Amp/Multiplier folded directly into its own %ATK value — see
  // hiyuki.blocks.js's own header comment for the full derivation.
  //
  // 2026-09-07 (cross-character reactivity pass): this used to be 7 separate self-only
  // 'cast'-triggered proc blocks (one per Chafe-applying move); now a single 'ally-action'-
  // triggered block firing off the shared 'glacio-chafe' tag any team member's own Chafe-applying
  // block can carry — see kitRulesRegistry/decisionEngine-hiyuki.test.js and
  // resolveHitComposedDps.js's own ally-action handling for the cross-character mechanism itself.
  it('Glacio Bite is now modeled as a real ally-action proc damage block, not the old broad elemDmg buff', () => {
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.selfbuff.fine-snow-glacio-bite')).toBeUndefined();
    const proc = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.procdmg.glacio-bite');
    expect(proc).toBeDefined();
    expect(proc.kind).toBe('damage');
    expect(proc.trigger).toEqual({ type: 'ally-action', action: 'glacio-chafe' });
    expect(proc.damage.category).toBeUndefined();
    expect(proc.damage.hits[0].atkPct).toBeCloseTo(660.96, 2);
  });

  it('every real Glacio-Chafe-applying block carries the shared glacio-chafe appliesTags marker', () => {
    const chafeBlockIds = [
      'hiyuki.liberation.frostedge', 'hiyuki.basic.present-self-stage3',
      'hiyuki.liberation.frost-splinter-present-self', 'hiyuki.liberation.foreclaiming-inward-vision',
      'hiyuki.liberation.foreclaimed-self-stage1-3', 'hiyuki.liberation.iai',
      'hiyuki.liberation.bitterfrost-foreclaimed-self',
    ];
    for (const id of chafeBlockIds) {
      const b = HIYUKI_BLOCKS.find(x => x.id === id);
      expect(b.appliesTags, `${id} should carry the glacio-chafe tag`).toEqual([{ tag: 'glacio-chafe' }]);
    }
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Hiyuki'], HIYUKI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(HIYUKI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 4000, 'glacio', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('hiyuki.liberation.frostedge')).toBe(true);
    expect(fired.has('hiyuki.liberation.foreclaiming-inward-vision')).toBe(true);
    expect(fired.has('hiyuki.liberation.iai')).toBe(true);
    expect(fired.has('hiyuki.liberation.foreclaiming-blade-liberation')).toBe(true);
  });

  // 2026-09-07 full-kit audit: with a Resonance Chain actually built (sequence >= 6, so chain.s1/
  // s3/s6 are all active — the phase3-parityGolden.test.js S0-baseline comparison never exercises
  // this at all, sequence: 0 there means NO chain.sN block ever fires, by design), chain.s6's own
  // +500% Crit DMG must land ONLY on Inward Vision/Blade Liberation, not on every other hit in her
  // kit — this is the real regression coverage for the over-crediting bug found and fixed this pass
  // (confirmed separately via a real before/after comparison: removing the scoping fix roughly
  // DOUBLED her total computed damage in this exact scenario).
  it('S6\'s +500% Crit DMG lands only on the 2 named moves, not her whole kit (2026-09-07 fix)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Hiyuki'], HIYUKI_BLOCKS);
    const { hitLog } = resolveHitComposedDps(HIYUKI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 1000, 'glacio', 'Main DPS', null, 6);
    const frostedge = hitLog.find(h => h.blockId === 'hiyuki.liberation.frostedge');
    const bladeLibBase = hitLog.find(h => h.blockId === 'hiyuki.liberation.foreclaiming-blade-liberation' && h.atkPct > 0 && h.atkPct < 200);
    // Both scale the same %ATK-per-damage-unit EXCEPT for crit dmg — Blade Liberation (scoped +500%)
    // must show a meaningfully higher damage-per-%ATK ratio than Frostedge (unscoped, gets only the
    // broad +40%).
    const frostedgeRatio = frostedge.damage / frostedge.atkPct;
    const bladeLibRatio = bladeLibBase.damage / bladeLibBase.atkPct;
    expect(bladeLibRatio).toBeGreaterThan(frostedgeRatio * 1.5);
  });

  it('S6 carries the base +500% Crit DMG (scoped to Inward Vision and Blade Liberation only — a 2026-09-07 fix, was a real over-crediting bug affecting her whole kit) AND the further, genuinely broad +40% at 2 Snow Rust stacks', () => {
    const s6 = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s6');
    expect(s6.effects).toEqual([
      { stat: 'critDmg', value: 500, scopedToBlockId: 'hiyuki.liberation.foreclaiming-inward-vision', source: 'self-kit' },
      { stat: 'critDmg', value: 500, scopedToBlockId: 'hiyuki.liberation.foreclaiming-blade-liberation', source: 'self-kit' },
      { stat: 'critDmg', value: 40, source: 'self-kit' },
    ]);
  });

  it('S1 is scoped to exactly the 8 Foreclaimed-Self Basic/Heavy/Mid-air/Plunge/Dodge-Counter blocks (2026-09-07 fix, was a real over-crediting bug reaching Frostedge, Frost Splinter, and both Foreclaiming: Ultimates)', () => {
    const s1 = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s1');
    expect(s1.effects[0].scopedToBlockId).toEqual([
      'hiyuki.liberation.foreclaimed-self-stage1-3',
      'hiyuki.liberation.foreclaimed-self-stage4-5',
      'hiyuki.liberation.heavy-foreclaimed-self',
      'hiyuki.liberation.midair-foreclaimed-self-stage1-2',
      'hiyuki.liberation.midair-plunging-foreclaimed-self',
      'hiyuki.liberation.dodge-counter-foreclaimed-self',
      'hiyuki.liberation.bitterfrost-foreclaimed-self',
      'hiyuki.liberation.iai',
    ]);
    expect(s1.effects[0].scopedToBlockId).not.toContain('hiyuki.liberation.frostedge');
    expect(s1.effects[0].scopedToBlockId).not.toContain('hiyuki.liberation.frost-splinter-present-self');
    expect(s1.effects[0].scopedToBlockId).not.toContain('hiyuki.liberation.foreclaiming-inward-vision');
    expect(s1.effects[0].scopedToBlockId).not.toContain('hiyuki.liberation.foreclaiming-blade-liberation');
  });

  it('S3 is scoped to exactly Frost Splinter and Bitterfrost (2026-09-07 fix, was a real over-crediting bug reaching her whole libDmg kit)', () => {
    const s3 = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s3');
    expect(s3.effects).toEqual([
      { stat: 'libDmg', value: 160, scopedToBlockId: 'hiyuki.liberation.frost-splinter-present-self', source: 'self-kit' },
      { stat: 'libDmg', value: 160, scopedToBlockId: 'hiyuki.liberation.bitterfrost-foreclaimed-self', source: 'self-kit' },
    ]);
  });

  it('Minor Fortes (Crit Rate+8%/ATK%+12%) and Ephemeral Realm are both present', () => {
    const mf = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.buff.minor-fortes');
    expect(mf.effects).toEqual([
      { stat: 'critRate', value: 8, source: 'self-kit' },
      { stat: 'atkPct', value: 12, source: 'self-kit' },
    ]);
    expect(HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.inherent.ephemeral-realm')).toBeDefined();
  });

  it('dmgFocus matches the dump Damage-Type Breakdown: Liberation (60.8%) and Skill (6.1%) are the ' +
     'real non-trivial buckets — Basic ATK is a genuine 0% (all reclassified to Liberation)', () => {
    const focus = CHARACTER_DATA['Hiyuki'].dmgFocus;
    expect(focus).toContain('Liberation');
    expect(focus).toContain('Skill');
    expect(focus).not.toContain('Basic ATK');
  });

  // Found 2026-09-08 (full re-audit): SKILL_MULTIPLIERS['Hiyuki']'s own descriptive note for Blade
  // Liberation said "+795.24% additional per Snowforged Blade stack consumed (up to 3 stacks,
  // +2385.72% max)" — directly contradicting this dump's own Multipliers table (line 74: "+795.24%
  // (total, across all 3 stacks)") AND hiyuki.blocks.js's own (already correct) 265.08%/stack
  // modeling. The note text is purely descriptive (never consumed as calc data — only the numeric
  // multiplier string is parsed), but a wrong note is still a real internal-consistency bug per this
  // project's due-diligence standard. Fixed the note text to match the dump and the engine; this test
  // guards against reintroducing the 3x-inflated per-stack claim.
  it("SKILL_MULTIPLIERS' Blade Liberation note states the real per-stack math (265.08%/stack, not a 3x-inflated 795.24%/stack), matching the engine's own perStepUnit value", () => {
    const row = SKILL_MULTIPLIERS['Hiyuki'].find(r => r[1] === 'Foreclaiming: Blade Liberation');
    expect(row[3]).toContain('265.08%/stack');
    expect(row[3]).not.toContain('2385.72%');
    const block = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.liberation.foreclaiming-blade-liberation');
    const perUnitHit = block.damage.hits.find(h => h.perStepUnit === 'snowforgedBladeConsumed');
    expect(perUnitHit.atkPctPerUnit).toBeCloseTo(265.08, 2);
  });

  // Added (Hiyuki S6 DMG-taken sweep): S6's "+25% Glacio Bite DMG taken at 3 Snow Rust stacks" was
  // previously left unmodeled under a claim of "no matching stat key anywhere in this engine's
  // vocabulary" — wrong, per the exact same shape already proven working for Qingxiao's Mindlock
  // (kind:'debuff', target:'all-enemies', amplify scoped via scopedToBlockId onto one specific block).
  it('S6 also grants a real +25% Glacio Bite DMG-taken debuff, scoped to only the Glacio Bite proc', () => {
    const debuff = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s6-glacio-bite-dmg-taken');
    expect(debuff.kind).toBe('debuff');
    expect(debuff.target.scope).toBe('all-enemies');
    expect(debuff.effects[0]).toEqual({ stat: 'amplify', value: 25, scopedToBlockId: 'hiyuki.procdmg.glacio-bite', source: 'self-kit' });

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Hiyuki'], HIYUKI_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const with6 = resolveHitComposedDps(HIYUKI_BLOCKS, steps, ctx, 3000, 'glacio', 'Main DPS', null, 6);
    const without6 = resolveHitComposedDps(HIYUKI_BLOCKS.filter(b => b.id !== 'hiyuki.chain.s6-glacio-bite-dmg-taken'), steps, ctx, 3000, 'glacio', 'Main DPS', null, 6);
    const sumAt = (res, id) => res.hitLog.filter(h => h.blockId === id).reduce((s, h) => s + h.damage, 0);
    expect(sumAt(with6, 'hiyuki.procdmg.glacio-bite') / sumAt(without6, 'hiyuki.procdmg.glacio-bite')).toBeCloseTo(1.25, 5);
    // Must NOT bleed onto her other damage (e.g. Foreclaiming: Inward Vision, libDmg-categorized).
    expect(sumAt(with6, 'hiyuki.liberation.foreclaiming-inward-vision')).toBeCloseTo(sumAt(without6, 'hiyuki.liberation.foreclaiming-inward-vision'), 5);
  });
});
