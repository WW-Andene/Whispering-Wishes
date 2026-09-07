import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, CHARACTER_DATA } from '../data/characters.js';
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

  it('S6 carries both the base +500% Crit DMG AND the further +40% at 2 Snow Rust stacks', () => {
    const s6 = HIYUKI_BLOCKS.find(b => b.id === 'hiyuki.chain.s6');
    expect(s6.effects).toEqual([
      { stat: 'critDmg', value: 500, source: 'self-kit' },
      { stat: 'critDmg', value: 40, source: 'self-kit' },
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
});
