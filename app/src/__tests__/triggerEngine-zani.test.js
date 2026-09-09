import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolver/dps/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/resolver/dps/rotationSimulator.js';
import { ZANI_BLOCKS } from '../engine/characterBlocks/zani.blocks.js';
import { expectValidBlockFile } from '../engine/schema/validate.js';

describe('triggerEngine parity — Zani', () => {
  it('every block matches the canonical schema (Layer 4 migration)', () => {
    expectValidBlockFile(ZANI_BLOCKS, 'Zani');
  });

  it('S1/S3/S4/S5/S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Zani'];
    expect(ZANI_BLOCKS.find(b => b.id === 'zani.chain.s1').effects[0].value).toBe(rc.s1.elemDmg);
    expect(ZANI_BLOCKS.find(b => b.id === 'zani.chain.s3').effects[0].value).toBe(rc.s3.libDmg);
    expect(ZANI_BLOCKS.find(b => b.id === 'zani.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(ZANI_BLOCKS.find(b => b.id === 'zani.chain.s5').effects[0].value).toBe(rc.s5.libDmg);
    expect(ZANI_BLOCKS.find(b => b.id === 'zani.chain.s6').effects[0].value).toBe(rc.s6.heavyDmg);
  });

  // Added 2026-09-09 (full-kit audit): S4 was trigger:{type:'passive'} despite RESONANCE_CHAIN_DATA's
  // own audit comment and the Zani.md dump both being explicit about a real trigger anchor and
  // duration ("Intro cast → whole team ATK +20% for 30s") — the block's own note claiming "no specific
  // cast anchor sourced" was simply false.
  it('S4 is a real cast-triggered, 30s-duration team buff (fixed 2026-09-09) — not an unconditional passive', () => {
    const s4 = ZANI_BLOCKS.find(b => b.id === 'zani.chain.s4');
    expect(s4.trigger).toEqual({ type: 'cast', on: 'Intro:Immediate Execution' });
    expect(s4.timing.duration).toBe(30);
    expect(s4.target.scope).toBe('whole-team');
  });

  it('S2 has both real effects, matching RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Zani'];
    const s2 = ZANI_BLOCKS.find(b => b.id === 'zani.chain.s2');
    expect(s2.effects.find(e => e.stat === 'critRate').value).toBe(rc.s2.critRate);
    expect(s2.effects.find(e => e.stat === 'skillDmg').value).toBe(rc.s2.skillDmg);
  });

  it('outro and selfBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Zani'];
    const outro = ZANI_BLOCKS.find(b => b.id === 'zani.outro.beacon-buff');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const self = ZANI_BLOCKS.find(b => b.id === 'zani.selfbuff.quick-response');
    expect(self.effects[0].value).toBe(legacy.selfBuffs[0].value);
  });

  // Fixed 2026-09-03: had no damage.category — a real Resonance Skill cast with no override text,
  // resolves to skillDmg.
  it('Targeted Action / Forcible Riposte is skillDmg-categorized', () => {
    const block = ZANI_BLOCKS.find(b => b.id === 'zani.skill.targeted-action');
    expect(block.damage.category).toBe('skillDmg');
  });

  // Fixed 2026-09-03: S2/S3/S5 were all kind:'buff' with trigger:{type:'cast',...} and no
  // timing.duration — the item-12 dead-buff architecture bug — silent no-ops.
  // Fixed AGAIN 2026-09-09 (full-kit audit): S3/S5's scopedToBlockId targets were swapped backwards
  // ever since the 2026-09-03 fix — S3 (the-last-stand's approximated scaling multiplier per
  // RESONANCE_CHAIN_DATA's own audit comment) was boosting Rekindle instead, and S5 (Rekindle's
  // confirmed-exact +120%) was boosting The Last Stand instead. This test's own assertions were
  // written to match that swapped (wrong) behavior — corrected below to match the real kit text
  // (Zani.md: "S3: ...The Last Stand's DMG Multiplier +8%, capped +1200%"; "S5: Rekindle's DMG
  // Multiplier +120%.") and RESONANCE_CHAIN_DATA['Zani']'s own comment, which named this exact pairing.
  it('S2/S3/S5 actually apply and stay correctly scoped (were dead no-ops, then had S3/S5 swapped)', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Zani'], ZANI_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };

    const withS2 = resolveHitComposedDps(ZANI_BLOCKS, steps, ctx, 3000, 'spectro', 'Main DPS', null, 2);
    const withoutS2 = resolveHitComposedDps(ZANI_BLOCKS.filter(b => b.id !== 'zani.chain.s2'), steps, ctx, 3000, 'spectro', 'Main DPS', null, 2);
    const taHit = withS2.hitLog.find(h => h.blockId === 'zani.skill.targeted-action');
    const taHitNoS2 = withoutS2.hitLog.find(h => h.blockId === 'zani.skill.targeted-action');
    expect(taHit.damage).toBeGreaterThan(taHitNoS2.damage);

    // S3 boosts The Last Stand (its approximated scaling multiplier), NOT Rekindle.
    const withS3 = resolveHitComposedDps(ZANI_BLOCKS, steps, ctx, 3000, 'spectro', 'Main DPS', null, 3);
    const withoutS3 = resolveHitComposedDps(ZANI_BLOCKS.filter(b => b.id !== 'zani.chain.s3'), steps, ctx, 3000, 'spectro', 'Main DPS', null, 3);
    const lastStandHit = withS3.hitLog.find(h => h.blockId === 'zani.liberation.the-last-stand');
    const lastStandHitNoS3 = withoutS3.hitLog.find(h => h.blockId === 'zani.liberation.the-last-stand');
    expect(lastStandHit.damage).toBeGreaterThan(lastStandHitNoS3.damage);
    // S3 must NOT bleed onto Rekindle (also libDmg-categorized).
    const rekindleHit = withS3.hitLog.find(h => h.blockId === 'zani.liberation.rekindle');
    const rekindleHitNoS3 = withoutS3.hitLog.find(h => h.blockId === 'zani.liberation.rekindle');
    expect(rekindleHit.damage).toBeCloseTo(rekindleHitNoS3.damage, 5);

    // S5 boosts Rekindle (its confirmed-exact +120%), NOT The Last Stand.
    const withS5 = resolveHitComposedDps(ZANI_BLOCKS, steps, ctx, 3000, 'spectro', 'Main DPS', null, 5);
    const withoutS5 = resolveHitComposedDps(ZANI_BLOCKS.filter(b => b.id !== 'zani.chain.s5'), steps, ctx, 3000, 'spectro', 'Main DPS', null, 5);
    const rekindleHitS5 = withS5.hitLog.find(h => h.blockId === 'zani.liberation.rekindle');
    const rekindleHitNoS5 = withoutS5.hitLog.find(h => h.blockId === 'zani.liberation.rekindle');
    expect(rekindleHitS5.damage).toBeGreaterThan(rekindleHitNoS5.damage);
    // S5 must NOT bleed onto The Last Stand.
    const lastStandHitS5 = withS5.hitLog.find(h => h.blockId === 'zani.liberation.the-last-stand');
    const lastStandHitNoS5 = withoutS5.hitLog.find(h => h.blockId === 'zani.liberation.the-last-stand');
    expect(lastStandHitS5.damage).toBeCloseTo(lastStandHitNoS5.damage, 5);
  });

  it('the 2nd Heavy Slash pass combines all three real hits', () => {
    const b = ZANI_BLOCKS.find(bl => bl.id === 'zani.forte.heavy-slash-string-2nd-pass');
    expect(b.damage.hits.length).toBe(4); // Daybreak(1) + Dawning(1) + Nightfall(2)
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Zani'], ZANI_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(ZANI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'spectro', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('zani.intro.immediate-execution')).toBe(true);
    expect(fired.has('zani.liberation.rekindle')).toBe(true);
    expect(fired.has('zani.forte.heavy-slash-nightfall')).toBe(true);
    expect(fired.has('zani.liberation.the-last-stand')).toBe(true);
  });

  // Found 2026-09-03 via a systematic block-coverage audit: the note on zani.basic.stage3 claimed
  // Skill:Standard Defense Protocol had "no matching SKILL_MULTIPLIERS row at all" — stale, a real row
  // (63.94%) exists and it's a real CHARACTER_ROTATIONS step ('Press Skill').
  it('Skill:Standard Defense Protocol is a real damage block and fires in her rotation', () => {
    const block = ZANI_BLOCKS.find(b => b.id === 'zani.skill.standard-defense-protocol');
    expect(block.damage.hits.length).toBeGreaterThan(0);
    expect(block.damage.category).toBe('skillDmg');

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Zani'], ZANI_BLOCKS);
    const { hitLog } = resolveHitComposedDps(ZANI_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'spectro', 'Main DPS');
    expect(hitLog.some(h => h.blockId === 'zani.skill.standard-defense-protocol')).toBe(true);
  });

  // Added (documented-gaps sweep): Sunburst ("Targeted Action/Forcible Riposte cast → +20% Spectro
  // Frazzle DMG for 14s") was previously left unmodeled — this schema had no frazzleDmg stat key at
  // all until this pass added one. Her Heavy Slash combo (Daybreak/Dawning/Nightfall/2nd-pass) is
  // genuinely dual-categorized ("counted as BOTH Heavy Attack AND Spectro Frazzle DMG" per her kit
  // text) via the new damage.secondaryCategory mechanism; her Outro is now directly category:
  // 'frazzleDmg' (a single category there, not dual).
  it('Sunburst is a real frazzleDmg self-buff that boosts her Heavy Slash combo (dual-categorized) and Outro (frazzleDmg-categorized), but not her non-Frazzle hits', () => {
    const sunburst = ZANI_BLOCKS.find(b => b.id === 'zani.selfbuff.sunburst');
    expect(sunburst.trigger).toEqual({ type: 'cast', on: 'Skill:Targeted Action / Forcible Riposte' });
    expect(sunburst.timing.duration).toBe(14);
    expect(sunburst.effects[0]).toEqual({ stat: 'frazzleDmg', value: 20, stacking: 'refresh', source: 'self-kit' });

    const daybreak = ZANI_BLOCKS.find(b => b.id === 'zani.forte.heavy-slash-daybreak');
    expect(daybreak.damage.secondaryCategory).toBe('frazzleDmg');
    const outro = ZANI_BLOCKS.find(b => b.id === 'zani.outro.beacon-for-the-future');
    expect(outro.damage.category).toBe('frazzleDmg');

    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Zani'], ZANI_BLOCKS);
    const ctx = { enemyDef: 792 + 8 * 90, enemyRes: 10 };
    const withSunburst = resolveHitComposedDps(ZANI_BLOCKS, steps, ctx, 3000, 'spectro', 'Main DPS');
    const withoutSunburst = resolveHitComposedDps(ZANI_BLOCKS.filter(b => b.id !== 'zani.selfbuff.sunburst'), steps, ctx, 3000, 'spectro', 'Main DPS');
    const sumAt = (res, id) => res.hitLog.filter(h => h.blockId === id).reduce((s, h) => s + h.damage, 0);

    for (const id of ['zani.forte.heavy-slash-daybreak', 'zani.forte.heavy-slash-dawning', 'zani.forte.heavy-slash-nightfall', 'zani.forte.heavy-slash-string-2nd-pass', 'zani.outro.beacon-for-the-future']) {
      expect(sumAt(withSunburst, id)).toBeGreaterThan(sumAt(withoutSunburst, id));
    }
    // Must NOT bleed onto her non-Frazzle-flagged hits (Rekindle/The Last Stand/Intro/Basic/Skill).
    for (const id of ['zani.liberation.rekindle', 'zani.liberation.the-last-stand', 'zani.intro.immediate-execution', 'zani.skill.targeted-action']) {
      expect(sumAt(withSunburst, id)).toBeCloseTo(sumAt(withoutSunburst, id), 5);
    }
  });
});
