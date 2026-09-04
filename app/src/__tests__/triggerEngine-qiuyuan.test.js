import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { QIUYUAN_BLOCKS } from '../engine/characterBlocks/qiuyuan.blocks.js';

describe('triggerEngine parity — Qiuyuan', () => {
  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Qiuyuan'];
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s2').effects[0].value).toBe(rc.s2.echoDmg);
    const s3 = QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s3');
    expect(s3.effects.find(e => e.scopedToBlockId === 'qiuyuan.liberation.sundering-strike').value).toBe(rc.s3.libDmg);
    expect(s3.effects.find(e => e.scopedToBlockId === 'qiuyuan.forte.to-teach').value).toBe(rc.s3.heavyDmg);
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s5').effects[0].value).toBe(rc.s5.defIgnore);
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s6').effects[0].value).toBe(rc.s6.critDmg);
  });

  it('outro and libBuff match CHAR_BUFF_TABLE', () => {
    const legacy = CHAR_BUFF_TABLE['Qiuyuan'];
    const outro = QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.outro.strike-before-ready-buff');
    expect(outro.effects[0].value).toBe(legacy.outroBuffs[0].value);
    expect(outro.timing.duration).toBe(legacy.outroBuffs[0].duration);
    const lib = QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.libbuff.crit-dmg');
    expect(lib.effects[0].value).toBe(legacy.libBuffs[0].value);
    // Fixed 2026-09-04: the dump's own Review text says the Liberation Crit DMG buff applies only to
    // the active on-field Resonator, not team-wide — CHAR_BUFF_TABLE.libBuffs was corrected to
    // target:'self' to match, and the engine block must agree.
    expect(legacy.libBuffs[0].target).toBe('self');
    expect(lib.target.scope).toBe('self');
  });

  it("Bamboo's Shade base-kit buff (400 Forte, +30% Echo Skill DMG, active resonator only) is modeled", () => {
    const legacy = CHAR_BUFF_TABLE['Qiuyuan'];
    expect(legacy.selfBuffs.length).toBeGreaterThan(0);
    expect(legacy.selfBuffs[0].stat).toBe('echoDmg');
    expect(legacy.selfBuffs[0].value).toBe(30);
    expect(legacy.selfBuffs[0].target).toBe('self');
    const block = QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.buff.bamboos-shade');
    expect(block).toBeDefined();
    expect(block.effects[0].value).toBe(30);
    expect(block.target.scope).toBe('self');
  });

  it('the weapon-signature Echo DMG buff is NOT modeled (avoids double-counting the weapon\'s own pv)', () => {
    expect(QIUYUAN_BLOCKS.find(b => b.id.includes('weaponbuff'))).toBeUndefined();
  });

  it('every damage block carries a real damage.category', () => {
    const damageBlocks = QIUYUAN_BLOCKS.filter(b => b.kind === 'damage');
    expect(damageBlocks.length).toBeGreaterThan(0);
    for (const b of damageBlocks) {
      expect(b.damage.category, `${b.id} is missing damage.category`).toBeTruthy();
    }
  });

  it('Inkwash/Forte-Heavy moves are categorized as Heavy ATK DMG, not Basic ATK', () => {
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.basic.inkwash-stage3-4').damage.category).toBe('heavyDmg');
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.forte.to-teach').damage.category).toBe('heavyDmg');
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.intro.attack-the-must-defend').damage.category).toBe('heavyDmg');
  });

  it('Skill/Liberation/Outro/Straw Cape/S6-exit moves are categorized as Echo Skill DMG per kit text', () => {
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.skill.through-the-groves').damage.category).toBe('echoDmg');
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.liberation.sundering-strike').damage.category).toBe('echoDmg');
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.outro.strike-before-ready').damage.category).toBe('echoDmg');
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s3-straw-cape').damage.category).toBe('echoDmg');
    expect(QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s6-exit-inksplash').damage.category).toBe('echoDmg');
  });

  it('S3 node scopes both its Liberation and Forte-Heavy DMG Multiplier bonuses via scopedToBlockId', () => {
    const s3 = QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s3');
    expect(s3.effects.every(e => e.stat === 'totalMult' && e.scopedToBlockId)).toBe(true);
  });

  it('S3 Straw Cape and S6 exit-Inksplash damage blocks exist and are sequence-gated (id convention)', () => {
    const strawCape = QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s3-straw-cape');
    expect(strawCape).toBeDefined();
    expect(strawCape.kind).toBe('damage');
    const s6exit = QIUYUAN_BLOCKS.find(b => b.id === 'qiuyuan.chain.s6-exit-inksplash');
    expect(s6exit).toBeDefined();
    expect(s6exit.kind).toBe('damage');
    expect(s6exit.damage.hits[0].atkPct).toBe(600);
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Qiuyuan'], QIUYUAN_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(QIUYUAN_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3000, 'aero', 'Sub DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('qiuyuan.intro.attack-the-must-defend')).toBe(true);
    expect(fired.has('qiuyuan.liberation.sundering-strike')).toBe(true);
    expect(fired.has('qiuyuan.forte.to-teach')).toBe(true);
  });
});
