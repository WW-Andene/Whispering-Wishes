import { describe, it, expect } from 'vitest';
import { CHAR_BUFF_TABLE, CHARACTER_DATA, CHARACTER_ROTATIONS, RESONANCE_CHAIN_DATA, getSkillIcon } from '../data/characters.js';
import { resolveHitComposedDps } from '../engine/resolveHitComposedDps.js';
import { deriveStepsFromRotation } from '../engine/rotationSimulator.js';
import { QINGXIAO_BLOCKS } from '../engine/characterBlocks/qingxiao.blocks.js';

describe('triggerEngine parity — Qingxiao', () => {
  // Fixed 2026-09-02: category was previously unset. WuWa's own general mechanic (Mid-air/Plunging
  // Attacks inherit Basic ATK or Heavy ATK DMG, never their own type) plus the dump's own kit structure
  // (listed under "Basic Attack — Strings to Steel") confirms basicDmg.
  it('Mid-air Attack - Stringblade is basicDmg-categorized', () => {
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.midair.stringblade-stage1-3').damage.category).toBe('basicDmg');
  });

  it('S1-S6 match RESONANCE_CHAIN_DATA exactly', () => {
    const rc = RESONANCE_CHAIN_DATA['Qingxiao'];
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s1').effects[0].value).toBe(rc.s1.critRate);
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s2').effects[0].value).toBe(rc.s2.heavyDmg);
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s3').effects[0].value).toBe(rc.s3.critDmg);
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s4').effects[0].value).toBe(rc.s4.atkPct);
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s5').effects[0].value).toBe(rc.s5.skillDmg);
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s6').effects[0].value).toBe(rc.s6.deepen);
  });

  it('S6 is correctly a debuff on enemies, matching the narrow-scope note', () => {
    const s6 = QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s6');
    expect(s6.kind).toBe('debuff');
    expect(s6.target.scope).toBe('all-enemies');
  });

  it('Mindlock debuff matches CHAR_BUFF_TABLE at the flat ceiling value (corrected 2026-09-02: the duplicate selfbuff.mindlock TriggerBlock was removed — see qingxiao.blocks.js\'s own removal note; the legacy selfBuffs[1] totalMult entry is kept only because it\'s pinned by a separate test, but was never applied to any real computed DPS number either)', () => {
    const legacy = CHAR_BUFF_TABLE['Qingxiao'];
    const deb = QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.debuff.mindlock');
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.selfbuff.mindlock')).toBeUndefined();
    expect(deb.effects[0].value).toBe(legacy.debuffs[0].value);
    expect(deb.effects[0].value).toBe(65);
    expect(deb.kind).toBe('debuff');
  });

  // Added 2026-09-04 (full 9-dimension re-audit, fresh dump): Intro and Outro were both entirely
  // uncategorized — a recurring bug class (Lynae/Mornye/Phoebe) that silently rejects category DMG
  // Bonus buffs (skillDmg/outroDmg) on real, non-trivial damage shares (Intro 1.3%, Outro 10.8%).
  it('Intro and Outro are correctly categorized', () => {
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.intro.tonality-shift').damage.category).toBe('skillDmg');
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.outro.lingering-song').damage.category).toBe('outroDmg');
  });

  // Added 2026-09-04: qingxiao.debuff.mindlock and qingxiao.chain.s6 were both unscoped deepen effects
  // on target:'all-enemies', which resolveHitComposedDps.js applies to EVERY damage block a character
  // has — but the dump's own exact text names a narrow move list for both (5 moves for Mindlock, 3 for
  // S6), explicitly excluding Basic Attack - Stringblade (ground), Mid-air Attack, Severing Note, Intro,
  // and Outro. Unscoped, both were silently over-crediting those excluded blocks too.
  it('Mindlock and S6 deepen effects are scoped to only their real named moves, not the whole kit', () => {
    const mindlock = QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.debuff.mindlock');
    const mindlockScopes = mindlock.effects.map(e => e.scopedToBlockId);
    expect(mindlockScopes).toEqual(expect.arrayContaining([
      'qingxiao.heavy.stringblade',
      'qingxiao.forte.ephemeral-transcendence-stage1-4',
      'qingxiao.forte.dodge-counter-transcendence',
      'qingxiao.forte.heavens-reckoning',
      'qingxiao.liberation.billows-beneath-heaven',
    ]));
    expect(mindlock.effects.every(e => e.value === 65)).toBe(true);
    // Blocks explicitly NOT in the real Mindlock scope must never appear.
    expect(mindlockScopes).not.toContain('qingxiao.basic.stringblade-stage1-4');
    expect(mindlockScopes).not.toContain('qingxiao.midair.stringblade-stage1-3');
    expect(mindlockScopes).not.toContain('qingxiao.skill.severing-note-judgement');
    expect(mindlockScopes).not.toContain('qingxiao.intro.tonality-shift');
    expect(mindlockScopes).not.toContain('qingxiao.outro.lingering-song');

    const s6 = QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.chain.s6');
    const s6Scopes = s6.effects.map(e => e.scopedToBlockId);
    expect(s6Scopes).toEqual(expect.arrayContaining([
      'qingxiao.heavy.stringblade',
      'qingxiao.forte.heavens-reckoning',
      'qingxiao.liberation.billows-beneath-heaven',
    ]));
    expect(s6.effects.every(e => e.value === 40)).toBe(true);
    expect(s6Scopes).not.toContain('qingxiao.basic.stringblade-stage1-4');
    expect(s6Scopes).not.toContain('qingxiao.outro.lingering-song');
  });

  // Added 2026-09-04: 4 real moves (own SKILL_MULTIPLIERS rows) had no engine block at all until this
  // pass — Plunging Attack, Dodge Counter - Stringblade, Severing Note: Ascendant, and Dodge Counter -
  // Ephemeral Transcendence (the last also a real Mindlock scopedToBlockId target). None belong in the
  // modeled rotation (all situational/conditional branches absent from the dump's own Standard Rotation
  // text), but they must exist and be correctly categorized for scoping/future use.
  it('previously-missing real moves now have engine blocks with correct categories', () => {
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.midair.plunging-attack').damage.category).toBe('basicDmg');
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.dodge-counter.stringblade').damage.category).toBe('basicDmg');
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.skill.severing-note-ascendant').damage.category).toBe('skillDmg');
    expect(QINGXIAO_BLOCKS.find(b => b.id === 'qingxiao.forte.dodge-counter-transcendence').damage.category).toBe('basicDmg');
    // None of these are force-fit into the modeled rotation.
    const rotationSkills = CHARACTER_ROTATIONS['Qingxiao'].map(s => s.skill);
    expect(rotationSkills.some(s => s.includes('Plunging Attack'))).toBe(false);
    expect(rotationSkills.some(s => s.includes('Dodge Counter'))).toBe(false);
    expect(rotationSkills.some(s => s.includes('Ascendant'))).toBe(false);
  });

  // Added 2026-09-04: her Forte finisher's full name contains both "Ephemeral Transcendence" and
  // "Heaven's Reckoning" as substrings; getSkillIcon's first-match-wins lookup previously resolved it to
  // the wrong (base Forte Circuit) icon since 'Ephemeral Transcendence' was inserted first.
  it("getSkillIcon resolves Heaven's Reckoning to its own dedicated icon, not the base Forte icon", () => {
    const icon = getSkillIcon('Qingxiao', "Heavy Attack - Heaven's Reckoning: Ephemeral Transcendence");
    expect(icon).toContain('Forte-Circuit-Alt');
  });

  it('real CHARACTER_ROTATIONS data produces a real, non-zero hit-composed total', () => {
    const steps = deriveStepsFromRotation(CHARACTER_ROTATIONS['Qingxiao'], QINGXIAO_BLOCKS);
    const { totalDamage, hitLog } = resolveHitComposedDps(QINGXIAO_BLOCKS, steps, { enemyDef: 792 + 8 * 90, enemyRes: 10 }, 3500, 'aero', 'Main DPS');
    expect(totalDamage).toBeGreaterThan(0);
    const fired = new Set(hitLog.map(h => h.blockId));
    expect(fired.has('qingxiao.intro.tonality-shift')).toBe(true);
    expect(fired.has('qingxiao.liberation.billows-beneath-heaven')).toBe(true);
    expect(fired.has('qingxiao.forte.heavens-reckoning')).toBe(true);
    expect(fired.has('qingxiao.outro.lingering-song')).toBe(true);
  });
});
